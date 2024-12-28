export abstract class Measurement {
    type: MeasurementType;

    constructor(type: MeasurementType) {
        this.type = type;
    }
}

export type MeasurementType = "theodolite" | "prism" | "level" | "tape";
