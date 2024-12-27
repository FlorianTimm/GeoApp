import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';

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

export type PointJSON = {
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