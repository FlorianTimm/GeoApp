import { Measurement } from "./Measurement";

export class TapeMeasure extends Measurement {
    constructor(id?: string) {
        super('tape', id);
    }

    static fromJsonObject(json: any): TapeMeasure {
        const measure = new TapeMeasure(json.id);
        return measure;
    }

    getShortInfo(): string {
        return 'Tape';
    }

    getLongInfo(): string {
        return 'Tape';
    }

    getName(): string {
        return 'Tape';
    }

    toJsonObject(): any {
        return {
            type: this.type,
            id: this.id,
        }
    }

    fromJsonObject(obj: any): void {

    }

}