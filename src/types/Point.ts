import { useSettingStore } from '@/store';
import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';
import { transform } from 'ol/proj';
import { CoordinateEntry } from './CoordinateEntry';


export class Point {
    nr: string;
    description?: string;
    coordinates: CoordinateEntry[];

    constructor(nr: string, description?: string) {
        this.nr = nr;
        this.description = description;
        this.coordinates = [];
    }

    addCoordinate(e: CoordinateEntry) {
        if (e.sourceId !== undefined) {
            const existing = this.coordinates.find(c => c.sourceId === e.sourceId);
            if (existing) {
                this.coordinates.splice(this.coordinates.indexOf(existing), 1);
            }
        }
        this.coordinates.push(e);
    }

    getCoordinate(epsg?: Projection | string, filterFunction?: (ce: CoordinateEntry) => boolean): CoordinateEntry | null {
        if (!epsg) {
            epsg = useSettingStore().getEpsg();
        } else if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }

        const coordArray = this.coordinates.sort((a, b) => a.accuracy - b.accuracy).filter(c => (!filterFunction || filterFunction(c)))

        const coord = coordArray.find(c => c.epsg === epsg);
        if (coord) {
            return coord;
        }

        if (coordArray.length > 0) {
            const altCoord = coordArray[0];
            if (altCoord.x && altCoord.y) {
                let nCoord = transform([altCoord.x, altCoord.y], altCoord.epsg, epsg);
                return { source: 'transform', epsg: epsg, x: nCoord[0], y: nCoord[1], z: altCoord.z, accuracy: altCoord.accuracy + 2 };
            }
        }
        return null;
    }

    get2DCoordinate(epsg?: Projection | string): Coordinate | null {
        const coord = this.getCoordinate(epsg, c => c.x !== undefined && c.y !== undefined);
        if (!coord || !coord.x || !coord.y) {
            return null;
        }
        return [coord.x, coord.y];
    }

    get1DCoordinate(epsg?: Projection | string): Coordinate | null {
        const coord = this.getCoordinate(epsg, c => c.z !== undefined);
        if (!coord || !coord.z) {
            return null;
        }
        return [coord.z];
    }

    get3DCoordinate(epsg?: Projection | string): Coordinate | null {
        const coord = this.getCoordinate(epsg, c => c.x !== undefined && c.y !== undefined && c.z !== undefined);
        if (!coord || !coord.x || !coord.y || !coord.z) {
            return null;
        }
        return [coord.x, coord.y, coord.z];
    }

    getCoordinateComponents(c: 'x' | 'y' | 'z', epsg?: Projection | string): number | null {
        let coord: Coordinate | null;
        let n = 0;

        if (c === 'x') {
            coord = this.get2DCoordinate(epsg);
        } else if (c === 'y') {
            coord = this.get2DCoordinate(epsg);
            n = 1;
        } else {
            coord = this.get1DCoordinate(epsg);
        }

        if (!coord || !coord[n]) {
            return null;
        }
        return coord[n];
    }


    getLatLon(): Coordinate | null {
        return this.get2DCoordinate('EPSG:3857');
    }

    getHeight(): number | null {
        return this.getCoordinateComponents('z');
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
    coordinates: CoordinateEntry[],
}