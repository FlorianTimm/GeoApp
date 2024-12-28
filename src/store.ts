import { defineStore } from 'pinia';
import { Point, PointJSON } from '@/types/Point';
import { Measurement } from '@/types/Measurement';
import { TheoResectionMeasure } from '@/types/TheoResectionMeasure';
import { Projection } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';

export interface StateTree {
    points: { [nr: string]: Point }
    measurements: Measurement[];
}

export const useMeasureStore = defineStore('measure', {
    state: () => ({
        points: {} as { [nr: string]: Point },
        measurements: [] as Measurement[],
    }),
    getters: {
        getPoint: (state) => (nr: string) => state.points[nr],
        isTheoSetup: (state) => () => state.measurements.length > 0,
    },
    actions: {
        truncate() {
            this.points = {} as { [nr: string]: Point };
            this.measurements = [];
        },
        addPoint(point: Point) {
            this.points[point.nr] = point;
        },
        addMeasurement(measurement: Measurement) {
            this.measurements.push(measurement);
        },
        getMeasurements() {
            return this.measurements;
        },
        removePoint(nr: string): boolean {
            console.log('remove point', nr);
            const isReferenced = this.measurements.some(measurement => {
                if (measurement instanceof TheoResectionMeasure) {
                    return measurement.pointNumber === nr || measurement.measures.some(measure => measure.nr === nr);
                }
                return false;
            });

            if (isReferenced) {
                return false;
            }
            delete this.points[nr];
            return true;
        }
    },

    persist: {
        serializer: {
            deserialize: (value: string) => {
                let n = {
                    points: {} as { [nr: string]: Point },
                    measurements: [] as Measurement[],
                };
                let json: {
                    points: {
                        [nr: string]: PointJSON
                    },
                    measurements: {
                        type: string,
                        pointNumber?: string,
                        description?: string,
                        second?: boolean,
                        measures: {
                            nr?: string,
                            v?: number
                        }[]
                    }[],
                } = JSON.parse(value);
                for (let nr in json.points) {
                    let p = json.points[nr];
                    let point = new Point(p.nr, p.description);
                    for (let coord of p.coordinates) {
                        point.addCoordinate(coord.epsg, coord.x, coord.y, coord.z, coord.accuracy);
                    }
                    n.points[p.nr] = point;
                }
                for (let m of json.measurements) {
                    switch (m.type) {
                        case 'theo-resection':
                            if (!m.pointNumber) {
                                console.error('missing point number');
                                break;
                            }
                            let theoResection = new TheoResectionMeasure(m.pointNumber, m.description, m.second);
                            for (let measure of m.measures) {
                                if (!measure.nr || !measure.v) {
                                    console.error('missing measure nr or value');
                                    continue;
                                }
                                theoResection.addMeasure(measure.nr, measure.v);
                            }
                            n.measurements.push(theoResection);
                            break;
                        default:
                            console.error('unknown measurement type', m.type);
                    }
                }
                console.log('deserialized', n);
                return n;
            },
            serialize: JSON.stringify,
        }
    },
});


export const useSettingStore = defineStore('settings', {
    state: () => ({
        'epsg': 'EPSG:25832',
        'geolocation': true
    }),
    getters: {
        getEpsg: (state) => () => state.epsg,
        getProjection: (state) => () => new Projection({ code: state.epsg }),
        getGeolocation: (state) => () => state.geolocation,
    },
    persist: true
});

export type MeasureMethodType = '' | 'theo_measure' | 'theo_onpoint' | 'theo_freestation' | 'theo_resection' | 'theo_stakeout' | 'prism' | 'level';

export const useStore = defineStore('store', {
    state: () => ({
        measureMethod: '' as MeasureMethodType,
        position: null as Coordinate | null,
        accuracy: null as number | null
    }),
    getters: {
        getMeasureMethod: (state) => () => state.measureMethod,
        getPosition: (state) => () => state.position
    },
    actions: {
        setMeasureMethod(method: MeasureMethodType) {
            this.measureMethod = method;
        },
        setPosition(position: Coordinate | null) {
            this.position = position;
        },
        setAccuracy(accuracy: number | null) {
            this.accuracy = accuracy;
        }
    },
});