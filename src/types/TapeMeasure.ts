import { Measurement } from "./Measurement";

export class TapeMeasure extends Measurement {
    constructor() {
        super('tape');
    }

    static fromJson(json: any): TapeMeasure {
        const measure = new TapeMeasure();
        return measure;
    }

}