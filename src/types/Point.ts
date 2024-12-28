import { useSettingStore } from '@/store';
import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';
import { transform } from 'ol/proj';


export class Point {
    nr: string;
    description?: string;
    coordinates: CoordinateEntry[];
    settingStore: ReturnType<typeof useSettingStore>;


    constructor(nr: string, description?: string) {
        this.nr = nr;
        this.description = description;
        this.coordinates = [];


        this.settingStore = useSettingStore();
    }

    addCoordinate(epsg: Projection | string, x?: number, y?: number, z?: number, accuracy: number = 5) {
        if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }
        this.coordinates.push({ epsg, x, y, z, accuracy });
    }

    getCoordinate(epsg?: Projection | string): CoordinateEntry | null {
        if (!epsg) {
            epsg = this.settingStore.getEpsg();
        } else if (typeof epsg !== 'string') {
            epsg = epsg.getCode();
        }

        const coord = this.coordinates.sort((a, b) => a.accuracy - b.accuracy).find(c => c.epsg === epsg);
        if (coord) {
            return coord;
        }
        if (!coord && this.coordinates.length > 0) {
            const altCoord = this.coordinates[0];
            if (altCoord.x && altCoord.y) {
                let nCoord = transform([altCoord.x, altCoord.y], altCoord.epsg, epsg);
                return { epsg, x: nCoord[0], y: nCoord[1], z: altCoord.z, accuracy: altCoord.accuracy + 1 };
            }
        }
        return null;
    }

    get2DCoordinate(epsg?: Projection | string): Coordinate | null {
        const coord = this.getCoordinate(epsg);
        if (!coord || !coord.x || !coord.y) {
            return null;
        }
        return [coord.x, coord.y];
    }

    getCoordinateComponents(c: 'x' | 'y' | 'z', epsg?: Projection | string): number | null {
        const coord = this.getCoordinate(epsg);
        if (!coord || !coord[c]) {
            return null;
        }
        return coord[c];
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
    coordinates: CoordinateEntry[],
}

export type CoordinateEntry = {
    epsg: string;
    x?: number;
    y?: number;
    z?: number;
    accuracy: number;
};