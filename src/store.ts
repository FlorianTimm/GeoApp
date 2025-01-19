import { defineStore, StateTree } from 'pinia';
import { Point, PointJSON } from '@/types/Point';
import { Measurement } from '@/types/Measurement';
import { MeasurementHelper } from '@/types/MeasurementHelper';
import { TheodoliteMeasure } from '@/types/TheodoliteMeasure';
import { Projection } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import View from 'ol/View';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';


const serializeToJson = (data: StateTree): string => {
    return JSON.stringify({
        points: data.points,
        measurements: (data.measurements as Measurement[]).map(measurement => measurement.toJsonObject())
    });
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
            orientation?: number;
            orientationAccuracy?: number;
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
        let measure: Measurement | undefined = MeasurementHelper.fromJson(m);
        if (measure) {
            n.measurements.push(measure);
        }
    }
    //console.log('deserialized', n);
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
        'showMeasurements': true,
        'orderPointsBy': 'nr' as OrderByPointType,
        'errorInCm': true
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

export type OrderByPointType = 'no_order' | 'nr' | 'distance' | 'direction' | 'accuracy';

export const useStore = defineStore('store', {
    state: () => ({
        activeMeasurement: undefined as Measurement | undefined,
        measureMethod: '' as MeasureMethodType,
        position: undefined as Coordinate | undefined,
        accuracy: undefined as number | undefined,
        sideMap: false as boolean,
        alkis: undefined as { source: VectorSource[], layer: VectorLayer[] } | undefined,
        view: undefined as View | undefined,

    }),
    getters: {
        getActiveMeasurement: (state) => () => state.activeMeasurement,
        getMeasureMethod: (state) => () => state.measureMethod,
        getPosition: (state) => () => state.position,
        getAccuracy: (state) => () => state.accuracy
    },
    actions: {
        setActiveMeasurement(measurement: Measurement | undefined = undefined) {
            this.activeMeasurement = measurement;
        },
        setMeasureMethod(method: MeasureMethodType) {
            this.measureMethod = method;
        },
        setPosition(position: Coordinate | undefined) {
            this.position = position;
        },
        setAccuracy(accuracy: number | undefined) {
            this.accuracy = accuracy;
        }
    },
});


