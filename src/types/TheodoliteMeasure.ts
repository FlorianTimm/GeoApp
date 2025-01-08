import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "./Measurement";
import { Point } from "./Point";
import { CoordinateEntry, CoordinateEntry2D } from "./CoordinateEntry";
import { cot, round, gonBetween0And400, azimuth2xy, vertical2height, sin } from "@/utils";
import { free_station } from "./GeoCalculations/FreeStation";
import { resection } from "./GeoCalculations/Resection";
import { setupOnPoint } from "./GeoCalculations/SetupOnPoint";
import { stakeOut } from "./GeoCalculations/StakeOut";


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

    private measureStore: ReturnType<typeof useMeasureStore>;

    constructor(pointNumber: string, description: string = '', second: boolean = false, accuracy: number = 3, ih?: number, id?: string) {
        super('theodolite', id);
        this.pointNumber = pointNumber;
        this.description = description;
        this.second = second;
        this.accuracy = accuracy;
        this.instrumentHeight = ih;
        this.measureStore = useMeasureStore();
    }

    addMeasure(entry: TheodoliteMeasureEntry) {
        this.measures.push(entry);
        this.calculateSetup();
    }

    getPoint(): Point {
        return this.measureStore.getPoint(this.pointNumber);
    }

    calculateSetup() {

        const location = this.measureStore.getPoint(this.pointNumber);
        let locationCoordinate = location.getCoordinate(undefined, c => c.sourceId !== this.id);

        location.removeCoordinatesByFilter(c => c.sourceId == this.id);

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

        if (location.getCoordinate(undefined, (e) => e.sourceId == this.id) !== null) {
            this.adjust();
        }

        this.calcNewPoints(measuresUsable);
    }

    getMeasures(): TheoMeasureEntryWithPoint[] {
        return this.measures.map(measure => {
            const target = this.measureStore.getPoint(measure.nr);
            if (!target) {
                return null;
            }
            return {
                target: target,
                coordinate: target.getCoordinate(undefined, c => c.sourceId !== this.id),
                measure: measure
            };
        }).filter(m => m !== null && m.measure.active) as { target: Point, coordinate?: CoordinateEntry, measure: TheodoliteMeasureEntry }[];

    }

    getMeasuresForSetup(): TheoMeasureForSetup[] {
        return this.getMeasures().filter(m => m.coordinate !== undefined && m.coordinate !== null && m.coordinate.x !== undefined && m.coordinate.y !== undefined && m.measure.hz !== undefined) as { target: Point, coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[];

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


    removeMeasure(i: number) {
        this.measures.splice(i, 1);
        this.calculateSetup();
    }

    static fromJson(json: any): TheodoliteMeasure {
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