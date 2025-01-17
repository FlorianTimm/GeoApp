import { useSettingStore } from '@/store';
import { Coordinate } from 'ol/coordinate';
import { Projection } from 'ol/proj';
import { transform } from 'ol/proj';
import { CoordinateEntry } from './CoordinateEntry';


export class Point {

    readonly nr: string;
    private _description?: string;
    get description() {
        return this._description;
    }
    set description(value: string | undefined) {
        this._description = value;
    }
    readonly coordinates: CoordinateEntry[];

    constructor(nr: string, description?: string) {
        this.nr = nr;
        this.description = description;
        this.coordinates = [];
    }

    addCoordinate(e: CoordinateEntry) {
        // this.coordinates = this.coordinates.filter(c => !(c.sourceId === e.sourceId && c.source === e.source));
        if (e.sourceId !== undefined) {
            const existing = this.coordinates.findIndex(c => c.sourceId === e.sourceId && c.source === e.source);
            if (existing != -1) {
                this.coordinates[existing] = e;
                return;
            }
        }
        // sourceId == undefined oder existing == -1
        this.coordinates.push(e);

    }

    removeCoordinatesByFilter(filterFunction: (ce: CoordinateEntry) => boolean) {
        for (let i = this.coordinates.length - 1; i >= 0; i--) {
            if (filterFunction(this.coordinates[i])) {
                this.coordinates.splice(i, 1);
            }
        }
    }

    getCoordinate(epsg?: Projection | string, filterFunction?: (ce: CoordinateEntry) => boolean): CoordinateEntry | undefined {
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
        return;
    }

    get2DCoordinate(epsg?: Projection | string): Coordinate | undefined {
        const coord = this.getCoordinate(epsg, c => c.x !== undefined && c.y !== undefined);
        if (!coord || !coord.x || !coord.y) {
            return;
        }
        return [coord.x, coord.y];
    }

    get1DCoordinate(epsg?: Projection | string): Coordinate | undefined {
        const coord = this.getCoordinate(epsg, c => c.z !== undefined);
        if (!coord || !coord.z) {
            return;
        }
        return [coord.z];
    }

    get3DCoordinate(epsg?: Projection | string): Coordinate | undefined {
        const coord = this.getCoordinate(epsg, c => c.x !== undefined && c.y !== undefined && c.z !== undefined);
        if (!coord || !coord.x || !coord.y || !coord.z) {
            return;
        }
        return [coord.x, coord.y, coord.z];
    }

    getCoordinateComponents(c: 'x' | 'y' | 'z', epsg?: Projection | string): number | undefined {
        let coord: Coordinate | undefined;
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
            return;
        }
        return coord[n];
    }


    getLatLon(): Coordinate | undefined {
        return this.get2DCoordinate('EPSG:3857');
    }

    getHeight(): number | undefined {
        return this.getCoordinateComponents('z');
    }

    getLat(): number | undefined {
        const coord = this.getLatLon();
        return coord ? coord[1] : undefined;
    }

    getLon(): number | undefined {
        const coord = this.getLatLon();
        return coord ? coord[0] : undefined;
    }
}

export type PointJSON = {
    nr: string,
    description?: string,
    coordinates: CoordinateEntry[],
}