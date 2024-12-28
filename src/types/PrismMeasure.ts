import { Point } from "@/types/Point";
import { Measurement, MeasurementType } from "@/types/Measurement";

export class PrismMeasure implements Measurement {
    type: MeasurementType = 'prism';
    start?: string
    end?: string
    distance?: number
    points: {
        point: Point
        ordinate: number;
        abscissa: number;
    }[] = [];

    constructor(start?: string, end?: string, distance?: number) {
        this.start = start;
        this.end = end;
        this.distance = distance;
    }

    addPoint(point: Point, ordinate: number, abscissa: number) {
        this.points.push({ point, ordinate, abscissa });
    }

    static fromJson(json: any): PrismMeasure {
        const measure = new PrismMeasure(json.start, json.end, json.distance);
        measure.points = json.points;
        return measure;
    }
};