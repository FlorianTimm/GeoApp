import { TheodoliteMeasure } from './TheodoliteMeasure';
import { PrismMeasure } from './PrismMeasure';
import { LevelMeasure } from './LevelMeasure';
import { TapeMeasure } from './TapeMeasure';
import { Measurement } from './Measurement';

export class MeasurementHelper {
    static fromJson(json: any): Measurement {
        switch (json.type) {
            case 'theodolite': return TheodoliteMeasure.fromJsonObject(json);
            case 'prism': return PrismMeasure.fromJsonObject(json);
            case 'level': return LevelMeasure.fromJsonObject(json);
            case 'tape': return TapeMeasure.fromJsonObject(json);
            default: throw new Error(`Unknown measurement type: ${json.type}`);
        }
    }
}