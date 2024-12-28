import { Measurement } from "./Measurement";

export class LevelMeasure extends Measurement {
    constructor() {
        super('level');
    }

    static fromJson(json: any): LevelMeasure {
        const measure = new LevelMeasure();
        return measure;
    }

}