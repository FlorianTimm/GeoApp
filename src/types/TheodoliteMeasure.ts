import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "./Measurement";
import { Point } from "./Point";
import { CoordinateEntry2D } from "./CoordinateEntry";
import { azimuth, cot, tan, round, gonBetween0And400 } from "@/utils";


export class TheodoliteMeasure extends Measurement {
    type: MeasurementType = 'theodolite';
    pointNumber: string = '';
    description?: string;
    accuracy: number = 3;
    instrumentHeight?: number;
    orientation?: number;
    second = false;
    measures: TheodoliteMeasureEntry[] = [];

    constructor(pointNumber: string, description: string = '', second: boolean = false, accuracy: number = 3, ih?: number) {
        super('theodolite');
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
        let locationCoordinate = location.getCoordinate();
        let measures = this.measures.map(measure => {
            const target = measureStore.getPoint(measure.nr);
            if (!target) {
                return null;
            }
            const targetCoordinate = target.getCoordinate();
            if (!targetCoordinate) {
                return null;
            }
            return {
                target: targetCoordinate,
                measure: measure
            };
        }).filter(m => m !== null) as { target: any, measure: TheodoliteMeasureEntry }[];
        if (!locationCoordinate || measures.filter(m => {
            if (!m) {
                return false;
            }
            return m.target.accuracy < locationCoordinate.accuracy
        }).length > 3) {
            this.resection(location, measures);
            this.setupOnPoint(location, measures);
        } else if (locationCoordinate && measures.length > 0) {
            return this.setupOnPoint(location, measures);
        } else {
            this.orientation = undefined;
            return null;
        }
    }

    resection(location: Point, measures: { target: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]) {
        const filtered = measures.filter(m =>
            m.target.x !== undefined && m.target.y !== undefined && m.measure.hz !== undefined).sort((a, b) => (a.measure.hz ?? 0) - (b.measure.hz ?? 0));
        if (filtered.length < 3) {
            return null;
        }

        const pa = filtered[0];
        const pm = filtered[1];
        const pb = filtered[2];

        const ya = pa.target.x;
        const xa = pa.target.y;
        const yb = pb.target.x;
        const xb = pb.target.y;
        const ym = pm.target.x;
        const xm = pm.target.y;

        console.log('a', ya, xa);
        console.log('m', ym, xm);
        console.log('b', yb, xb);

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
        console.log('tcd', tcd);

        if (tcd === null) {
            return null;
        }

        console.log('tan(tcd)', tan(tcd));
        console.log('cot(tcd)', cot(tcd));
        console.log((ym - yc + (xm - xc) * cot(tcd)))

        let xn = xc + ((ym - yc + (xm - xc) * cot(tcd)) / (tan(tcd) + cot(tcd)));
        let yn;
        if (tan(tcd) < cot(tcd)) {
            yn = yc + (xn - xc) * tan(tcd);
        } else {
            yn = ym + (xn - xm) * cot(tcd);
        }

        yn = round(yn, 4);
        xn = round(xn, 4);

        console.log('xn', xn);
        console.log('yn', yn);
        location.addCoordinate({ x: yn, y: xn, accuracy: 5, source: 'calculation', epsg: pa.target.epsg });
        return { x: yn, y: xn };
    }

    setupOnPoint(location: Point, measures: { target: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]) {
        const locationCoordinate = location.getCoordinate();
        if (locationCoordinate === undefined || locationCoordinate === null || locationCoordinate.x === undefined || locationCoordinate.y === undefined) {
            return null;
        } 
        const locationCoordinateXY = locationCoordinate as CoordinateEntry2D;
        const angles = measures.map(m => {
            let angle = azimuth(locationCoordinateXY, m.target);
            if (angle === null || !m.measure.hz) {
                return null;
            }
            console.log('angle_v', angle);
            angle -= m.measure.hz;
            return gonBetween0And400(angle);
        }).filter(a => a !== null) as number[];


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
        const measure = new TheodoliteMeasure(json.pointNumber, json.description, json.second, json.accuracy, json.gps);
        if (json.orientation) {
            measure.orientation = json.orientation;
        }
        measure.measures = json.measures;
        return measure;
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
    lage: 1 | 2,
    v?: number,
    hz?: number,
    distance?: number,
    targetHeight?: number
}