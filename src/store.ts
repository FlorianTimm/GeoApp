import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';
import { defineStore } from 'pinia';

export class Point {
    nr: string;
    description?: string;
    coordinates: {
        epsg: string;
        x?: number;
        y?: number;
        z?: number;
        accuracy: number;
    }[]

    constructor(nr: string, description?: string) {
        this.nr = nr;
        this.description = description;
        this.coordinates = [];
    }

    addCoordinate(epsg: Projection | string, x?: number, y?: number, z?: number, accuracy: number = 5) {
        if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }
        this.coordinates.push({ epsg, x, y, z, accuracy });
    }

    get2DCoordinate(epsg: Projection | string): Coordinate | null {
        if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }

        const coord = this.coordinates.find(c => c.epsg === epsg);
        if (!coord || !coord.x || !coord.y) {
            console.error(`Coordinate system ${epsg} not found`);
            return null;
        }
        return [coord.x, coord.y];

    }

    getLatLon(): Coordinate | null {
        return this.get2DCoordinate('EPSG:3857');
    }

    getLat(): number | null {
        const coord = this.getLatLon();
        return coord ? coord[1] : null;
    }

    getLon(): number | null {
        const coord = this.getLatLon();
        return coord ? coord[0] : null;
    }
}

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