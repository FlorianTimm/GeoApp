import { Adjustment } from "@/services/Adjustment";
import { useMeasureStore } from "@/store";
import { v4 as uuid } from "uuid";

export abstract class Measurement {
    type: MeasurementType;
    id: string;

    constructor(type: MeasurementType, id?: string) {
        if (id)
            this.id = id;
        else
            this.id = uuid();
        this.type = type;
    }

    adjust() {
        let adj = new Adjustment(useMeasureStore().measurements, useMeasureStore().points)
        return adj.adjust();
    }

    abstract getShortInfo(): string;
    abstract getLongInfo(): string;
    abstract getName(): string;
}

export type MeasurementType = "theodolite" | "prism" | "level" | "tape";
