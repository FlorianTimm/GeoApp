import { defineStore, StateTree } from 'pinia';
import { Point, PointJSON } from '@/types/Point';
import { Measurement } from '@/types/Measurement';
import { MeasurementHelper } from '@/types/MeasurementHelper';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { Projection } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';


const serializeToJson = (data: StateTree): string => {
    return JSON.stringify(data)
}

const deserializeFromJson = (data: string): StateTree => {
    let n = {
        points: {} as { [nr: string]: Point; },
        measurements: [] as Measurement[],
    };
    let json: {
        points: {
            [nr: string]: PointJSON;
        };
        measurements: {
            type: string;
            pointNumber?: string;
            instrumentHeight?: number;
            description?: string;
            second?: boolean;
            measures: {
                nr?: string;
                v?: number;
                hz?: number;
                targetHeight?: number;
            }[];
        }[];
    } = JSON.parse(data);
    for (let nr in json.points) {
        let p = json.points[nr];
        let point = new Point(p.nr, p.description);
        for (let coord of p.coordinates) {
            point.addCoordinate(coord);
        }
        n.points[p.nr] = point;
    }
    for (let m of json.measurements) {
        let measure: Measurement | null = MeasurementHelper.fromJson(m);
        if (measure) {
            n.measurements.push(measure);
        }
    }
    console.log('deserialized', n);
    return n;
};

export const useMeasureStore = defineStore('measure', {
    state: () => ({
        points: {} as { [nr: string]: Point },
        measurements: [] as Measurement[],
    }),
    getters: {
        getPoint: (state) => (nr: string) => state.points[nr],
        isTheoSetup: (state) => () => state.measurements.length > 0,
        getPoints: (state) => () => state.points,
        getMeasurements: (state) => () => state.measurements,
        export: (state) => () => serializeToJson(state),
    },
    actions: {
        truncate() {
            this.points = {} as { [nr: string]: Point };
            this.measurements = [];
            useStore().setActiveMeasurement()
            useStore().setMeasureMethod('')
        },
        addPoint(point: Point) {
            this.points[point.nr] = point;
        },
        addMeasurement(measurement: Measurement) {
            this.measurements.push(measurement);
        },
        removePoint(nr: string): boolean {
            console.log('remove point', nr);
            const isReferenced = this.measurements.some(measurement => {
                if (measurement instanceof TheodoliteMeasure) {
                    return measurement.pointNumber === nr || measurement.measures.some(measure => measure.nr === nr);
                }
                return false;
            });

            if (isReferenced) {
                return false;
            }
            delete this.points[nr];
            return true;
        },

        import(value: string) {
            this.truncate();
            const v = deserializeFromJson(value);
            this.measurements = v.measurements;
            this.points = v.points;
        },
        removeMeasurement(measurement: Measurement) {
            this.measurements = this.measurements.filter(m => m !== measurement);
        },
    },

    persist: {
        serializer: {
            deserialize: deserializeFromJson,
            serialize: serializeToJson,
        }
    },
});


export const useSettingStore = defineStore('settings', {
    state: () => ({
        'epsg': 'EPSG:25832',
        'geolocation': true,
        'showMeasurements': true
    }),
    getters: {
        getEpsg: (state) => () => state.epsg,
        getProjection: (state) => () => new Projection({ code: state.epsg }),
        getGeolocation: (state) => () => state.geolocation,
        getShowMeasurements: (state) => () => state.showMeasurements,
    },
    actions: {
        setEpsg(epsg: string) {
            this.epsg = epsg;
        },
        setGeolocation(geolocation: boolean) {
            this.geolocation = geolocation;
        },
        setShowMeasurements(show: boolean) {
            this.showMeasurements = show;
        },
    },
    persist: true
});

export type MeasureMethodType = '' | 'theo_measure' | 'theo_setup' | 'theo_stakeout' | 'prism' | 'level';

export const useStore = defineStore('store', {
    state: () => ({
        activeMeasurement: null as Measurement | null,
        measureMethod: '' as MeasureMethodType,
        position: null as Coordinate | null,
        accuracy: null as number | null
    }),
    getters: {
        getActiveMeasurement: (state) => () => state.activeMeasurement,
        getMeasureMethod: (state) => () => state.measureMethod,
        getPosition: (state) => () => state.position,
        getAccuracy: (state) => () => state.accuracy
    },
    actions: {
        setActiveMeasurement(measurement: Measurement | null = null) {
            this.activeMeasurement = measurement;
        },
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


