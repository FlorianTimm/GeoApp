import { Point } from "@/types/Point";

export class WinkelprismaMeasure {
    start: string | null = null;
    end: string | null = null;
    distance: number | null = null;
    points: {
        point: Point
        ordinate: number;
        abscissa: number;
    }[] = [];
};