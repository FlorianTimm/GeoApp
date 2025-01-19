import { Point } from "@/types/Point";
import { Measurement, MeasurementType } from "@/types/Measurement";
import { distance } from "@/utils";
import { useMeasureStore } from "@/store";

export class PrismMeasure extends Measurement {
    private _start?: string
    get start() {
        return this._start;
    }
    set start(value: string | undefined) {
        this._start = value;
        this.calculate();
    }
    private _end?: string
    get end() {
        return this._end;
    }
    set end(value: string | undefined) {
        this._end = value;
        this.calculate();
    }
    private _distance?: number
    get distance() {
        return this._distance;
    }
    set distance(value: number | undefined) {
        this._distance = value;
        this.calculate();
    }

    private _points: PrismPoint[] = [];
    get points() {
        return this._points;
    }

    private _xa?: number;
    private _ya?: number;
    private _o?: number;
    private _a?: number;

    constructor(start?: string, end?: string, distance?: number, id?: string) {
        super('prism', id);
        this._start = start;
        this._end = end;
        this.distance = distance;
    }

    addPoint(point: string, ordinate: number, abscissa: number) {
        this.points.push(new PrismPoint(this, point, ordinate, abscissa));
        this.calculate()
    }

    calculate() {
        console.log('calculate prism');
        if (this._start === undefined || this._end === undefined || this.points.length == 0) {
            return;
        }

        const pa = useMeasureStore().getPoint(this._start);
        const pe = useMeasureStore().getPoint(this._end);

        if (pa === undefined || pe === undefined || pa.getCoordinate()?.epsg === undefined) {
            return;
        }

        this._xa = pa.getCoordinateComponents('x')
        this._ya = pa.getCoordinateComponents('y')

        const xe = pe.getCoordinateComponents('x')
        const ye = pe.getCoordinateComponents('y')

        if (xe === undefined || ye === undefined || this._ya === undefined || this._xa === undefined) {
            return;
        }

        let s = this._distance;

        if (s === undefined) {
            s = distance({ x: this._xa, y: this._ya }, { x: xe, y: ye });
        }
        console.log('distance', s);
        this._o = (xe - this._xa) / s;
        this._a = (ye - this._ya) / s;

        for (const point of this.points) {
            let c = this.coordinates4point(point.ordinate, point.abscissa);
            if (c === undefined) {
                continue;
            }
            let p = useMeasureStore().getPoint(point.point);
            p.addCoordinate({ x: c.x, y: c.y, accuracy: 0, source: 'prism', sourceId: [this.id], epsg: pa.getCoordinate()?.epsg ?? '' });
        }
    }

    coordinates4point(ordinate: number, abscissa: number): { x: number, y: number } | undefined {
        if (this._o === undefined || this._a === undefined) {
            this.calculate();
        }

        if (this._o === undefined || this._a === undefined || this._xa === undefined || this._ya === undefined) {
            return;
        }

        let xn = this._xa + this._o * ordinate + this._a * abscissa;
        let yn = this._ya + this._a * ordinate - this._o * abscissa;
        return { x: xn, y: yn };
    }

    stakeOut(point: string) {
        let p = useMeasureStore().getPoint(point).get2DCoordinate();
        if (p === undefined || this._xa === undefined || this._ya === undefined || this._o === undefined || this._a === undefined) {
            return;
        }

        let xn = p[0];
        let yn = p[1];

        let v = (xn - this._xa) * this._a - (yn - this._ya) * this._o;
        let s = (yn - this._ya) * this._a + (xn - this._xa) * this._o;

        return { abscissa: v, ordinate: s };
    }

    static fromJsonObject(json: any): PrismMeasure {
        const measure = new PrismMeasure(json.start, json.end, json.distance, json.id);
        measure._points = json.points.map((p: any) => new PrismPoint(measure, p.point, p.ordinate, p.abscissa));
        return measure;
    }

    toJsonObject() {
        return {
            type: this.type,
            id: this.id,
            start: this.start,
            end: this.end,
            distance: this.distance,
            points: this.points.map(e => e.toJsonObject()),
        }
    }

    getShortInfo(): string {
        return 'Prism';
    }

    getLongInfo(): string {
        return 'Prism';
    }

    getName(): string {
        return 'Prism';
    }
};

class PrismPoint {
    private _line: PrismMeasure;
    get line() {
        return this._line;
    }

    private _ordinate: number;
    get ordinate() {
        return this._ordinate;
    }
    set ordinate(value: number) {
        this._ordinate = value;
        this._line.calculate();
    }

    private _abscissa: number;
    get abscissa() {
        return this._abscissa;
    }
    set abscissa(value: number) {
        this._abscissa = value;
        this._line.calculate();
    }

    private _point: string;
    get point() {
        return this._point;
    }
    set point(value: string) {
        this._point = value;
        this._line.calculate();
    }

    constructor(line: PrismMeasure, point: string, ordinate: number, abscissa: number) {
        this._line = line;
        this._point = point;
        this._ordinate = ordinate;
        this._abscissa = abscissa;
    }

    toJsonObject() {
        return {
            point: this.point,
            ordinate: this.ordinate,
            abscissa: this.abscissa,
        }
    }
}