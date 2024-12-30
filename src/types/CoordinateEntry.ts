export interface CoordinateEntry {
    source: CoordinateSource;
    sourceId?: string;
    epsg: string;
    x?: number;
    y?: number;
    z?: number;
    accuracy: number;
};

export interface CoordinateEntry2D extends CoordinateEntry {
    x: number;
    y: number;
}

export interface CoordinateEntry3D extends CoordinateEntry2D {
    z: number;
}

export type CoordinateSource = 'manual' | 'gps' | 'map' | 'import' | 'transform' | 'resection' | 'free_station' | 'intersection' | 'theodolite' | 'adjustment' | 'unknown';