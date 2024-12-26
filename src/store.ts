import { defineStore } from 'pinia';
import { Point } from '@/types/Point';

export interface Measurement {
    theo: []
    prism: {
        start: number;
        end: number;
        distance?: number;
        points: {
            nr: number;
            y: number;
            x: number;
        }[]
    }[]
}

export interface StateTree {
    points: { [nr: string]: Point }
    measurements: Measurement[];
}

//@ts-ignore
export const useMeasureStore = defineStore('measure', {
    state: () => ({
        points: {} as { [nr: string]: Point },
        measurements: [] as Measurement[],
    }),
    getters: {
        getPoint: (state) => (nr: string) => state.points[nr],
    },
    actions: {
        truncate() {
            this.points = {} as { [nr: string]: Point };
            this.measurements = [];
        },
        addPoint(point: Point) {
            this.points[point.nr] = point;
        },
    },

    persist: {
        enabled: true,
        serializer: {
            deserialize: (value: string) => {
                let n = {
                    points: {} as { [nr: string]: Point },
                    measurements: [] as Measurement[],
                };
                let json: {
                    points: {
                        [nr: string]: {
                            nr: string,
                            description?: string,
                            coordinates: {
                                epsg: string,
                                x?: number,
                                y?: number,
                                z?: number,
                                accuracy: number,
                            }[],
                        }
                    },
                    measurements: Measurement[],
                } = JSON.parse(value);
                for (let nr in json.points) {
                    let p = json.points[nr];
                    let point = new Point(p.nr, p.description);
                    for (let coord of p.coordinates) {
                        point.addCoordinate(coord.epsg, coord.x, coord.y, coord.z, coord.accuracy);
                    }
                    n.points[p.nr] = point;
                }
                console.log('deserialized', n);
                return n;
            },
            serialize: JSON.stringify,
        }
    },
});