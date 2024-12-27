import { Point } from "./Point";
import { Measurement } from "./Measurement";
import { useMeasureStore } from "../store";


export class TheoResectionMeasure implements Measurement {
    type: string = 'theo-resection';
    pointNumber: string = '';
    description: string = '';
    second = false;
    measures: {
        nr: string,
        v: number
    }[] = [];

    constructor(pointNumber: string, description: string = '', second: boolean = false) {
        this.pointNumber = pointNumber;
        this.description = description;
        this.second = second;

        useMeasureStore().addPoint(new Point(pointNumber, description));
    }

    addMeasure(nr: string | Point, v: number) {
        if (nr instanceof Point) {
            nr = nr.nr;
        }
        this.measures.push({ nr, v });
    }
}
