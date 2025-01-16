import { Adjustment } from "@/services/Adjustment";
import { useMeasureStore } from "@/store";
import { v4 as uuid } from "uuid";
import { TheodoliteMeasure, TheoJSON } from "./TheodoliteMeasure";

export abstract class Measurement {
    readonly type: MeasurementType;
    readonly id: string;
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
        adj.writeResults();
    }

    abstract getShortInfo(): string;
    abstract getLongInfo(): string;
    abstract getName(): string;
    abstract toJsonObject(): { type: string, id: string };
}

export type MeasurementType = "theodolite" | "prism" | "level" | "tape";
