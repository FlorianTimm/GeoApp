import { TheodoliteMeasure } from './TheodoliteMeasure';
import { PrismMeasure } from './PrismMeasure';
import { LevelMeasure } from './LevelMeasure';
import { TapeMeasure } from './TapeMeasure';
import { Measurement } from './Measurement';

export class MeasurementHelper {
    static fromJson(json: any): Measurement {
        switch (json.type) {
            case 'theodolite': return TheodoliteMeasure.fromJson(json);
            case 'prism': return PrismMeasure.fromJson(json);
            case 'level': return LevelMeasure.fromJson(json);
            case 'tape': return TapeMeasure.fromJson(json);
            default: throw new Error(`Unknown measurement type: ${json.type}`);
        }
    }
}