import { Measurement } from "./Measurement";

export class LevelMeasure extends Measurement {
    constructor() {
        super('level');
    }

    static fromJsonObject(json: any): LevelMeasure {
        const measure = new LevelMeasure();
        return measure;
    }

    getShortInfo(): string {
        return 'Level';
    }

    getLongInfo(): string {
        return 'Level';
    }

    getName(): string {
        return 'Level';
    }

    toJsonObject(): any {
        return {
            type: this.type,
            id: this.id,
        }
    }

}