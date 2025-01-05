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
        console.log("Adjusting measurement " + this.id);
        let adj = new Adjustment([this], useMeasureStore().points)
        adj.adjust();
    }

    abstract getShortInfo(): string;
    abstract getLongInfo(): string;
    abstract getName(): string;
}

export type MeasurementType = "theodolite" | "prism" | "level" | "tape";
