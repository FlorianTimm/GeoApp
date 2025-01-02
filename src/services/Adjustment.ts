import { Measurement } from '@/types/Measurement';
import { Point } from '@/types/Point';

class Adjustment {
    private measurements: Measurement[];
    private points: { [nr: string]: Point }

    constructor(measurements: Measurement[], points: { [nr: string]: Point }) {
        this.measurements = measurements;
        this.points = points;
    }

    findParameters() {
        let usedPoints: {
            [nr: string]: { x?: boolean, y?: boolean, z?: boolean }
        } = {}
        for (let nr in this.points) {
            let c = this.points[nr].getCoordinate();
            usedPoints[nr] = {
                x: c?.x !== undefined ? false : undefined,
                y: c?.x !== undefined ? false : undefined,
                z: c?.x !== undefined ? false : undefined,
            }
        };
        this.measurements.forEach((measurement) => {

        });


    }
}