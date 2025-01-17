import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "./Measurement";
import { Point } from "./Point";
import { CoordinateEntry, CoordinateEntry2D } from "./CoordinateEntry";
import { cot, round, gonBetween0And400, azimuth2xy, vertical2height, sin, distance } from "@/utils";
import { free_station } from "./GeoCalculations/FreeStation";
import { resection } from "./GeoCalculations/Resection";
import { setupOnPoint } from "./GeoCalculations/SetupOnPoint";
import { stakeOut } from "./GeoCalculations/StakeOut";
import { forwardSection } from "./GeoCalculations/ForwardSection";


export class TheodoliteMeasure extends Measurement {
    readonly pointNumber: string = '';
    readonly description?: string;
    readonly accuracy: number = 3;
    private _instrumentHeight?: number;
    get instrumentHeight(): number | undefined {
        return this._instrumentHeight;
    }
    set instrumentHeight(value: number | undefined) {
        this._instrumentHeight = value;
    }

    private _orientation?: number;
    get orientation(): number | undefined {
        return this._orientation;
    }
    set orientation(value: number | undefined) {
        this._orientation = value;
    }
    private _orientationAccuracy?: number;
    get orientationAccuracy(): number | undefined {
        return this._orientationAccuracy;
    }
    set orientationAccuracy(value: number | undefined) {
        this._orientationAccuracy = value;
    }

    readonly second: boolean = false;
    private _measures: TheodoliteMeasureEntry[] = [];
    get measures(): TheodoliteMeasureEntry[] {
        return this._measures;
    }

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
    }

    getPoint(): Point {
        return useMeasureStore().getPoint(this.pointNumber);
    }

    calculateSetup() {
        const location = useMeasureStore().getPoint(this.pointNumber);
        let locationCoordinate = location.getCoordinate(undefined, c => !(c.sourceId?.includes(this.id) ?? false));

        location.removeCoordinatesByFilter(c => c.sourceId?.includes(this.id) ?? false);

        // filter out measures without a coordinate or without a horizontal direction

        const measures = this.getMeasuresForSetup();
        if (locationCoordinate) {
            setupOnPoint(this);
        } else if (measures.filter(m => m.measure.distance !== undefined).length >= 2) {
            free_station(this);
            setupOnPoint(this);
        } else if (measures.length >= 3) {
            resection(this);
            setupOnPoint(this);
        } else {
            this.orientation = undefined;
        }

        const measuresUsable = this.getMeasures();
        this.transferHeight(measuresUsable, location);

        if (location.getCoordinate(undefined, (e) => e.sourceId?.includes(this.id) ?? false) !== undefined) {
            this.adjust();
        }

        this.calculate();
    }

    getMeasures(): TheoMeasureEntryWithPoint[] {
        return this.measures.map(measure => {
            const target = useMeasureStore().getPoint(measure.nr);
            if (!target) {
                return;
            }
            return {
                target: target,
                coordinate: target.getCoordinate(undefined, c => !(c.sourceId?.includes(this.id) ?? false)),
                measure: measure
            };
        }).filter(m => m !== undefined && m.measure.active) as { target: Point, coordinate?: CoordinateEntry, measure: TheodoliteMeasureEntry }[];

    }

    getMeasuresForSetup(): TheoMeasureForSetup[] {
        return this.getMeasures().filter(m => m.coordinate !== undefined && m.coordinate.x !== undefined && m.coordinate.y !== undefined && m.measure.hz !== undefined) as { target: Point, coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[];

    }

    getErrorInCm(id: number): { hz?: number, v?: number } {
        let measure = this.measures[id];

        let distance = measure.distance
        if (distance === undefined) {
            let point = useMeasureStore().getPoint(measure.nr)
            distance = stakeOut(this, point).distance;
        }
        if (distance === undefined) {
            return { hz: undefined, v: undefined };
        }
        return {
            hz: measure.hz_v != undefined ? sin(measure.hz_v) * distance * 100 : undefined,
            v: measure.v_v != undefined ? sin(measure.v_v) * distance * 100 : undefined
        }
    }

    getHzErrorInCm(id: number): number | undefined {
        return this.getErrorInCm(id).hz;
    }

    getVErrorInCm(id: number): number | undefined {
        return this.getErrorInCm(id).v;
    }

    private transferHeight(measuresUsable: { target: Point; measure: TheodoliteMeasureEntry; }[], location: Point) {
        let epsg = location.getCoordinate()?.epsg;
        console.log('transfer height');
        let heights = measuresUsable.map(m => {
            const z = m.target.getCoordinateComponents('z');
            let dist = m.measure.distance ?? stakeOut(this, m.target).distance;
            if (z === undefined || m.measure.v === undefined || dist === undefined) {
                return;
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
        }).filter(m => m !== undefined);

        if (epsg === undefined) {
            return;
        }

        if (heights.length > 0) {
            const avgHeight = heights.reduce((sum, height) => sum + (height ?? 0), 0) / heights.length;

            let locationCoordinate = location.getCoordinate(undefined, c => c.sourceId?.includes(this.id) ?? false);
            if (locationCoordinate) {
                locationCoordinate.z = avgHeight;
            } else {
                location.addCoordinate({ epsg: epsg, z: round(avgHeight, 4), accuracy: this.accuracy, source: 'theodolite', sourceId: [this.id] });
            }
        }
    }


    calculate() {
        //setup?
        if (this.orientation === undefined || this.pointNumber === '' || this.pointNumber === undefined) {
            return;
        }
        let c = useMeasureStore().getPoint(this.pointNumber).getCoordinate()
        if (c === undefined || c.x === undefined || c.y === undefined) {
            return;
        }

        // TODO: calculate new points

        // polares Anhängen
        const measures = this.getMeasures();
        measures.filter(m => m.measure.distance !== undefined && m.measure.hz !== undefined && (m.coordinate === undefined || m.coordinate === undefined)).forEach(m => {
            if (this.orientation === undefined || m.measure.distance === undefined || m.measure.hz === undefined || c === undefined || c.x === undefined || c.y === undefined) {
                return;
            }
            console.log('polares Anhängen');
            let cn = c as CoordinateEntry2D;
            console.log('cn', cn);
            console.log('ori', gonBetween0And400(m.measure.hz + this.orientation))
            let coord = azimuth2xy(cn, m.measure.distance, m.measure.hz + this.orientation);
            // TODO: calculate height

            console.log('coord', coord);
            m.target.addCoordinate({ x: coord.x, y: coord.y, accuracy: c.accuracy, source: 'theodolite', sourceId: [this.id], epsg: cn.epsg });
        });
        // Vorwärtsschnitt
        forwardSection()
        // Heights for new points
        this.heightsForNewPoints();
    }

    heightsForNewPoints() {
        // calculate heights for new points

        let measures = useMeasureStore().getMeasurements().filter(m => m instanceof TheodoliteMeasure && m.instrumentHeight !== undefined && m.getPoint().getHeight() !== undefined)
            .map(m => m as TheodoliteMeasure)

        measures.forEach(m => {
            let p1 = m.getPoint()
            let c1 = p1.get2DCoordinate()

            m.getMeasures().filter(me => me.measure.v !== undefined).forEach(me => {
                me.target.removeCoordinatesByFilter(c => (c.sourceId?.includes(m.id) ?? false) && c.x === undefined && c.y === undefined);

                let hdiff = 0

                if (me.target.getHeight() !== undefined || me.measure.v === undefined) {
                    return;
                }
                let dist = me.measure.distance

                if (dist === undefined) {
                    let c2 = me.target.get2DCoordinate()
                    if (c1 === undefined || c1 === undefined || c2 === undefined || c2 === undefined) {
                        return;
                    }
                    dist = distance({ x: c1[0], y: c1[1] }, { x: c2[0], y: c2[1] })
                }
                if (dist !== undefined) {
                    hdiff = vertical2height(me.measure.v, dist, m.getPoint().getHeight() ?? 0)
                } else if (me.measure.v != 100 && me.measure.v != 300) {
                    hdiff = 0
                } else {
                    return
                }

                me.target.addCoordinate({ z: (m.getPoint().getHeight() ?? 0) + (m.instrumentHeight ?? 0) + hdiff - (me.measure.targetHeight ?? 0), accuracy: m.accuracy, source: 'theodolite', sourceId: [m.id], epsg: m.getPoint().getCoordinate()?.epsg ?? '' });
            })
        })


    }


    removeMeasure(i: number) {
        this.measures.splice(i, 1);
        this.calculateSetup();
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

    toJsonObject(): TheoJSON {
        return {
            type: this.type,
            id: this.id,
            pointNumber: this.pointNumber,
            description: this.description,
            second: this.second,
            accuracy: this.accuracy,
            instrumentHeight: this.instrumentHeight,
            orientation: this.orientation,
            orientationAccuracy: this.orientationAccuracy,
            measures: this.measures
        };
    }

    static fromJsonObject(json: TheoJSON): TheodoliteMeasure {
        const measure = new TheodoliteMeasure(json.pointNumber, json.description, json.second, json.accuracy, json.instrumentHeight, json.id);
        if (json.orientation) {
            measure.orientation = json.orientation;
        }
        if (json.orientationAccuracy) {
            measure.orientationAccuracy = json.orientationAccuracy;
        }
        measure._measures = json.measures;
        return measure;
    }
}

export type TheoJSON = {
    type: MeasurementType,
    id: string,
    pointNumber: string,
    description?: string,
    second: boolean,
    accuracy: number,
    instrumentHeight?: number,
    orientation?: number,
    orientationAccuracy?: number,
    measures: TheodoliteMeasureEntry[]
}

export type TheodoliteMeasureEntry = {
    nr: string,
    active: boolean,
    usedForSetup: boolean,
    lage: 1 | 2,
    v?: number,
    hz?: number,
    distance?: number,
    v_v?: number,
    hz_v?: number,
    distance_v?: number,
    targetHeight?: number
}

export type TheoMeasureEntryWithPoint = {
    target: Point,
    measure: TheodoliteMeasureEntry,
    coordinate?: CoordinateEntry
}
export type TheoMeasureForSetup = {
    target: Point,
    measure: TheodoliteMeasureEntry,
    coordinate: CoordinateEntry2D
}