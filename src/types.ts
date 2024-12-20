import { Feature } from "ol";
import Point from "ol/geom/Point";

export class WinkelprismaMeasure {
    start: Feature<Point> | null = null;
    end: Feature<Point> | null = null;
    distance: number | null = null;
    points: {
        point: Feature<Point>
        ordinate: number;
        abscissa: number;
    }[] = [];
};