import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';
import { defineStore } from 'pinia';

export interface Point {
    nr: number;
    description?: string;
    coordinates: {
        epsg: string;
        x?: number;
        y?: number;
        z?: number;
        accuracy: number;
    }[]
}

export class PointHelper {

    static addCoordinate(point: Point, epsg: Projection | string, x?: number, y?: number, z?: number, accuracy: number = 5) {
        if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }
        point.coordinates.push({ epsg, x, y, z, accuracy });
    }

    static get2DCoordinate(point: Point, epsg: Projection | string): Coordinate | null {
        if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }

        const coord = point.coordinates.find(c => c.epsg === epsg);
        if (!coord || !coord.x || !coord.y) {
            console.error(`Coordinate system ${epsg} not found`);
            return null;
        }
        return [coord.x, coord.y];

    }

    static getLatLon(point: Point): Coordinate | null {
        return PointHelper.get2DCoordinate(point, 'EPSG:4326');
    }

    static getLat(point: Point): number | null {
        const coord = PointHelper.getLatLon(point);
        return coord ? coord[1] : null;
    }

    static getLon(point: Point): number | null {
        const coord = PointHelper.getLatLon(point);
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


export const useMeasureStore = defineStore('measure', {
    state() {
        return {
            points: [] as Point[],
            measurements: [] as Measurement[],
        };
    },
    actions: {
        truncate() {
            this.points = [];
            this.measurements = [];
        },
        addPoint(point: Point) {
            this.points.push(point);
        },
    },
    persist: {
        enabled: true,
        onRestored: (store) => {
            console.log('store restored', store);
        }
    },
});