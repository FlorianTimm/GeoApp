import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "./Measurement";
import { CoordinateEntry, Point } from "./Point";


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
            return this.resection(location, measures);
        } else if (locationCoordinate && measures.length > 0) {
            return this.setupOnPoint(location, measures);
        } else {
            return null;
        }
    }

    resection(location: Point, measures: { target: CoordinateEntry, measure: TheodoliteMeasureEntry }[]) {
        const filtered = measures.filter(m => m.target.x && m.target.y && m.measure.hz).sort((a, b) => (a.measure.hz ?? 0) - (b.measure.hz ?? 0));
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

        if (!pm.measure.hz || !pa.measure.hz || !pb.measure.hz || !ya || !xa || !yb || !xb || !ym || !xm) {
            return null;
        }
        const alpha = pm.measure.hz - pa.measure.hz;
        const beta = pb.measure.hz - pm.measure.hz;

        console.log('alpha', alpha);
        console.log('beta', beta);

        const tan = (x: number) => Math.tan(x / 200 * Math.PI);
        const cot = (x: number) => 1 / tan(x);
        const yc = ya + (xm - xa) * cot(alpha)
        const xc = xa - (ym - ya) * cot(alpha)

        const yd = yb + (xb - xm) * cot(beta)
        const xd = xb - (yb - ym) * cot(beta)

        const tcd = this.headingAngle({ x: yc, y: xc }, { x: yd, y: xd });

        if (tcd === null) {
            return null;
        }

        const xn = xc + ((ym - yc + (xm - xc) * cot(tcd)) / (tan(tcd) + cot(tcd)));
        let yn;
        if (tan(tcd) < cot(tcd)) {
            yn = yc + (xn - xc) * tan(tcd);
        } else {
            yn = ym + (xn - xm) * cot(tcd);
        }

        console.log('xn', xn);
        console.log('yn', yn);
        location.addCoordinate({ x: yn, y: xn, accuracy: 5, source: 'calculation', epsg: pa.target.epsg });
        this.setupOnPoint(location, measures);
    }

    setupOnPoint(location: Point, measures: { target: CoordinateEntry, measure: TheodoliteMeasureEntry }[]) {
        const locationCoordinate = location.getCoordinate();
        if (!locationCoordinate || !locationCoordinate.x || !locationCoordinate.y) {
            return null;
        }
        const angles = measures.map(m => {
            let angle = this.headingAngle(locationCoordinate, m.target);
            if (angle === null || !m.measure.hz) {
                return null;
            }
            console.log('angle_v', angle);
            angle -= m.measure.hz;
            if (angle < 0) {
                angle += 400;
            }
            console.log('angle_n', angle);
            return angle
        }).filter(a => a !== null) as number[];

        const cos = angles.reduce((a, b) => a + Math.cos(b / 200 * Math.PI), 0);
        const sin = angles.reduce((a, b) => a + Math.sin(b / 200 * Math.PI), 0);
        let avg = Math.atan2(sin, cos) / Math.PI * 200;
        if (avg < 0) {
            avg += 400;
        }
        this.orientation = avg;
        return true;
    }

    headingAngle(fromCoord: CoordinateEntry | { x: number, y: number }, toCoord: CoordinateEntry | { x: number, y: number }): number | null {
        if (!fromCoord || !toCoord || !fromCoord.x || !fromCoord.y || !toCoord.x || !toCoord.y) {
            return null;
        }
        const dx = toCoord.x - fromCoord.x;
        const dy = toCoord.y - fromCoord.y;
        let t = Math.atan2(dx, dy) / Math.PI * 200.;
        if (t < 0) {
            t += 400;
        }
        return t;
    }

    static fromJson(json: any): TheodoliteMeasure {
        const measure = new TheodoliteMeasure(json.pointNumber, json.description, json.second, json.accuracy, json.gps);
        measure.measures = json.measures;
        return measure;
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