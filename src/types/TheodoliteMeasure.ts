import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "./Measurement";
import { Point } from "./Point";
import { CoordinateEntry, CoordinateEntry2D } from "./CoordinateEntry";
import { azimuth, cot, tan, round, gonBetween0And400, distance, zenithDistance, azimuth2xy, vertical2height } from "@/utils";
import { Adjustment } from "@/services/Adjustment";


export class TheodoliteMeasure extends Measurement {
    type: MeasurementType = 'theodolite';
    pointNumber: string = '';
    description?: string;
    accuracy: number = 3;
    instrumentHeight?: number;
    orientation?: number;
    orientationAccuracy?: number;
    second = false;
    measures: TheodoliteMeasureEntry[] = [];

    constructor(pointNumber: string, description: string = '', second: boolean = false, accuracy: number = 3, ih?: number, id?: string) {
        super('theodolite', id);
        this.pointNumber = pointNumber;
        this.description = description;
        this.second = second;
        this.accuracy = accuracy;
        this.instrumentHeight = ih;
    }

    addMeasure(entry: TheodoliteMeasureEntry) {
        this.measures.push(entry);
        this.calculate();
    }

    calculate() {
        const measureStore = useMeasureStore();
        const location = measureStore.getPoint(this.pointNumber);
        let locationCoordinate = location.getCoordinate(undefined, c => c.sourceId !== this.id);
        let measuresUsable = this.measures.map(measure => {
            const target = measureStore.getPoint(measure.nr);
            if (!target) {
                return null;
            }
            return {
                target: target,
                coordinate: target.getCoordinate(undefined, c => c.sourceId !== this.id),
                measure: measure
            };
        }).filter(m => m !== null && m.measure.active) as { target: Point, coordinate?: CoordinateEntry, measure: TheodoliteMeasureEntry }[];

        // filter out measures without a coordinate or without a horizontal direction
        const measures = measuresUsable.filter(m => m.coordinate !== undefined && m.coordinate !== null && m.coordinate.x !== undefined && m.coordinate.y !== undefined && m.measure.hz !== undefined) as { target: Point, coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[];

        if (locationCoordinate) {
            this.setupOnPoint(location, measures);
        } else if (measures.filter(m => m.measure.distance !== undefined).length >= 2) {
            this.free_station(location, measures);
            this.setupOnPoint(location, measures);
        } else if (measures.length >= 3) {
            this.resection(location, measures);
            this.setupOnPoint(location, measures);
        } else {
            this.orientation = undefined;
        }

        this.transferHeight(measuresUsable, location);

        this.calcNewPoints(measuresUsable);

        this.adjust();
    }

    public free_station(location: Point, measures: { target?: Point, coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]) {
        console.log('free station');
        const localCoordinates = measures.map(m => {
            if (m.measure.distance === undefined || m.measure.hz === undefined) {
                return null;
            }

            return {
                local: azimuth2xy({ x: 0, y: 0 }, m.measure.distance, m.measure.hz),
                world: m.coordinate
            }
        }).filter(m => m !== null)

        if (localCoordinates.length < 2) {
            return;
        }

        const epsg = localCoordinates[0].world.epsg;

        const sum_local = { x: 0, y: 0 };
        const sum_world = { x: 0, y: 0 };
        for (let i = 0; i < localCoordinates.length; i++) {
            sum_local.x += localCoordinates[i].local.x;
            sum_local.y += localCoordinates[i].local.y;
            sum_world.x += localCoordinates[i].world.x;
            sum_world.y += localCoordinates[i].world.y;
        }

        const avg_local = { x: sum_local.x / localCoordinates.length, y: sum_local.y / localCoordinates.length };
        const avg_world = { x: sum_world.x / localCoordinates.length, y: sum_world.y / localCoordinates.length };

        let a_top = 0;
        let ao_bottom = 0;
        let o_top = 0;
        for (let i = 0; i < localCoordinates.length; i++) {
            const lx = localCoordinates[i].local.x - avg_local.x;
            const ly = localCoordinates[i].local.y - avg_local.y;
            const wx = localCoordinates[i].world.x - avg_world.x;
            const wy = localCoordinates[i].world.y - avg_world.y;

            o_top += ly * wx - lx * wy;
            a_top += ly * wy + lx * wx;
            ao_bottom += lx * lx + ly * ly;
        } 

        const a = a_top / ao_bottom;
        const o = o_top / ao_bottom;

        const m = Math.sqrt(a * a + o * o);
        console.log('m', m);

        let xn = avg_world.x - a * avg_local.x - o * avg_local.y;
        let yn = avg_world.y - a * avg_local.y + o * avg_local.x;

        let s
        if (localCoordinates.length > 2) {
            let wsum = 0
            for (let i = 0; i < localCoordinates.length; i++) {
                let wx = - xn - a * localCoordinates[i].local.x - o * localCoordinates[i].local.y + localCoordinates[i].world.x;
                let wy = - yn - a * localCoordinates[i].local.y + o * localCoordinates[i].local.x + localCoordinates[i].world.y;
                wsum += wx * wx + wy * wy;
            }
            console.log('wsum', wsum);
            s = Math.sqrt(wsum / (2 * localCoordinates.length - 4));
        } else {
            s = Math.max(...measures.map((m) => m.coordinate.accuracy));
        }

        location.addCoordinate({ x: xn, y: yn, accuracy: s, source: 'free_station', sourceId: this.id, epsg: epsg });
        return { x: xn, y: yn, accuracy: s };
    }


    private transferHeight(measuresUsable: { target: Point; measure: TheodoliteMeasureEntry; }[], location: Point) {
        let epsg = location.getCoordinate()?.epsg;
        console.log('transfer height');
        let heights = measuresUsable.map(m => {
            const z = m.target.getCoordinateComponents('z');
            let dist = m.measure.distance ?? this.stakeOut(m.target).distance;
            if (z === null || m.measure.v === undefined || dist === undefined) {
                return null;
            }
            if (epsg === undefined) {
                epsg = m.target.getCoordinate()?.epsg;
            }
            console.log('v', m.measure.v);
            console.log('dist', dist);
            console.log('cot(v)', cot(m.measure.v));

            let h_diff = vertical2height(m.measure.v, dist);
            return z + (m.measure.targetHeight ?? 0) - h_diff - (this.instrumentHeight ?? 0);
            /*
            Ziel    = 10 m
            th      =  1 m
            P+th    = 11 m
            diff    = -0.5 m
            Theo    = 11.5 m
            Punkt   = 10 m
    
            ziel + th - diff - ih = theo
            */
        }).filter(m => m !== null);

        if (epsg === undefined) {
            return;
        }

        if (heights.length > 0) {
            const avgHeight = heights.reduce((sum, height) => sum + (height ?? 0), 0) / heights.length;

            let locationCoordinate = location.getCoordinate(undefined, c => c.sourceId == this.id);
            if (locationCoordinate) {
                locationCoordinate.z = avgHeight;
            } else {
                location.addCoordinate({ epsg: epsg, z: round(avgHeight, 4), accuracy: this.accuracy, source: 'theodolite', sourceId: this.id });
            }
        }
    }

    resection(location: Point, measures: { coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]) {
        if (measures.length < 3) {
            return null;
        }  
        console.log('resection');

        const filtered = measures.
            sort((a, b) => a.coordinate.accuracy - b.coordinate.accuracy).
            slice(0, 3).
            sort((a, b) => (a.measure.hz ?? 0) - (b.measure.hz ?? 0));
        console.log('filtered', filtered);
        const pa = filtered[0];
        const pm = filtered[1];
        const pb = filtered[2];

        const ya = pa.coordinate.x;
        const xa = pa.coordinate.y;
        const yb = pb.coordinate.x;
        const xb = pb.coordinate.y;
        const ym = pm.coordinate.x;
        const xm = pm.coordinate.y;

        if (pm.measure.hz === undefined || pa.measure.hz === undefined || pb.measure.hz === undefined) {
            return null;
        }
        const alpha = pm.measure.hz - pa.measure.hz;
        const beta = pb.measure.hz - pm.measure.hz;

        const yc = ya + (xm - xa) * cot(alpha)
        const xc = xa - (ym - ya) * cot(alpha)

        const yd = yb + (xb - xm) * cot(beta)
        const xd = xb - (yb - ym) * cot(beta)

        const tcd = azimuth({ x: yc, y: xc }, { x: yd, y: xd });

        if (tcd === null) {
            return null;
        }

        let xn = xc + ((ym - yc + (xm - xc) * cot(tcd)) / (tan(tcd) + cot(tcd)));
        let yn;
        if (tan(tcd) < cot(tcd)) {
            yn = yc + (xn - xc) * tan(tcd);
        } else {
            yn = ym + (xn - xm) * cot(tcd);
        }

        yn = round(yn, 4);
        xn = round(xn, 4);

        let accuracy = (pa.coordinate.accuracy + pb.coordinate.accuracy + pm.coordinate.accuracy) / 3;
        location.addCoordinate({ x: yn, y: xn, accuracy: accuracy, source: 'resection', sourceId: this.id, epsg: pa.coordinate.epsg });
        return { x: yn, y: xn };
    }

    calcNewPoints(measures: { target: Point, coordinate?: CoordinateEntry, measure: TheodoliteMeasureEntry }[]) {
        //setup?
        if (this.orientation === undefined || this.pointNumber === '' || this.pointNumber === undefined) {
            return;
        }
        let c = useMeasureStore().getPoint(this.pointNumber).getCoordinate()
        if (c === undefined || c === null || c.x === undefined || c.y === undefined) {
            return;
        }

        // TODO: calculate new points

        // polares Anhängen
        measures.filter(m => m.measure.distance !== undefined && m.measure.hz !== undefined && (m.coordinate === undefined || m.coordinate === null)).forEach(m => {
            if (this.orientation === undefined || m.measure.distance === undefined || m.measure.hz === undefined || c === null || c.x === undefined || c.y === undefined) {
                return;
            }
            console.log('polares Anhängen');
            let cn = c as CoordinateEntry2D;
            console.log('cn', cn);
            console.log('ori', gonBetween0And400(m.measure.hz + this.orientation))
            let coord = azimuth2xy(cn, m.measure.distance, m.measure.hz + this.orientation);
            // TODO: calculate height

            console.log('coord', coord);
            m.target.addCoordinate({ x: coord.x, y: coord.y, accuracy: c.accuracy, source: 'theodolite', sourceId: this.id, epsg: cn.epsg });
        });
        // Vorwärtsschnitt
    }

    setupOnPoint(location: Point, measures: { coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]) {
        const locationCoordinate = location.getCoordinate();
        if (locationCoordinate === undefined || locationCoordinate === null || locationCoordinate.x === undefined || locationCoordinate.y === undefined) {
            return null;
        } 
        console.log('setup on point');
        const locationCoordinateXY = locationCoordinate as CoordinateEntry2D;
        const angles = measures.map(m => {
            let angle = azimuth(locationCoordinateXY, m.coordinate);
            if (angle === null || m.measure.hz === undefined) {
                return null;
            }
            console.log('angle_v', angle);
            angle -= m.measure.hz;
            return gonBetween0And400(angle);
        }).filter(a => a !== null) as number[];

        console.log('angles', angles);

        let sum = 0
        for (let i = 0; i < angles.length; i++) {
            if (i == 0) {
                sum = angles[i];
                continue;
            }
            let tmpAvg = sum / i;
            if (tmpAvg - angles[i] > 200) {
                angles[i] -= 400;
            } else if (tmpAvg - angles[i] < -200) {
                angles[i] += 400;
            }
            sum += angles[i];
        }
        let avg = gonBetween0And400(sum / angles.length);
        this.orientation = avg;
        return avg;
    }

    removeMeasure(i: number) {
        this.measures.splice(i, 1);
        this.calculate();
    }

    static fromJson(json: any): TheodoliteMeasure {
        const measure = new TheodoliteMeasure(json.pointNumber, json.description, json.second, json.accuracy, json.instrumentHeight, json.id);
        if (json.orientation) {
            measure.orientation = json.orientation;
        }
        if (json.orientationAccuracy) {
            measure.orientationAccuracy = json.orientationAccuracy;
        }
        measure.measures = json.measures;
        return measure;
    }

    stakeOut(point: Point, target_height: number = 0): { distance?: number, hz?: number, v?: number } {
        const coord = point.getCoordinate() as CoordinateEntry2D;
        if (!coord || coord.x === undefined || coord.y === undefined) {
            return { distance: undefined, hz: undefined, v: undefined };
        }
        const orientation = this.orientation;
        if (orientation === undefined) {
            return { distance: undefined, hz: undefined, v: undefined };
        }
        const measureStore = useMeasureStore();
        const location = measureStore.getPoint(this.pointNumber);
        if (!location) {
            return { distance: undefined, hz: undefined, v: undefined };
        }
        const locationCoord = location.getCoordinate() as CoordinateEntry2D;
        if (!locationCoord || locationCoord.x === undefined || locationCoord.y === undefined) {
            return { distance: undefined, hz: undefined, v: undefined };
        }

        const dist = distance(locationCoord, coord);
        const angle = azimuth(locationCoord, coord);

        let v: number | undefined;
        if (locationCoord.z !== undefined && coord.z !== undefined) {

            let hdiff = coord.z - locationCoord.z + target_height - (this.instrumentHeight ?? 0);

            v = zenithDistance(dist, hdiff);

        }

        return {
            distance: round(dist),
            hz: round(gonBetween0And400(angle - orientation), 4),
            v: v !== undefined ? round(v, 4) : undefined
        }
    }

    getShortInfo(): string {
        return 'on Point ' + this.pointNumber
    }

    getLongInfo(): string {
        return this.getShortInfo() + ' with ' + this.measures.length + ' measures';
    }

    getName(): string {
        return 'Theodolite';
    }
}


export type TheodoliteMeasureEntry = {
    nr: string,
    active: boolean,
    lage: 1 | 2,
    v?: number,
    hz?: number,
    distance?: number,
    v_v?: number,
    hz_v?: number,
    distance_v?: number,
    targetHeight?: number
}