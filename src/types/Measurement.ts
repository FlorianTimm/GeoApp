export abstract class Measurement {
    type: MeasurementType;

    constructor(type: MeasurementType) {
        this.type = type;
    }

    abstract getShortInfo(): string;
    abstract getLongInfo(): string;
    abstract getName(): string;
}

export type MeasurementType = "theodolite" | "prism" | "level" | "tape";
