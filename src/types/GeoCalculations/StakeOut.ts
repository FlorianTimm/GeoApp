import { useMeasureStore } from "@/store";
import { Measurement, MeasurementType } from "../Measurement";
import { Point } from "../Point";
import { CoordinateEntry, CoordinateEntry2D } from "../CoordinateEntry";
import { azimuth, cot, tan, round, gonBetween0And400, distance, zenithDistance, azimuth2xy, vertical2height, gonBetweenMinus200And200, sin } from "@/utils";
import { TheodoliteMeasure } from "../TheodoliteMeasure";


export function stakeOut(tm: TheodoliteMeasure, point: Point, target_height: number = 0): { distance?: number, hz?: number, v?: number } {
    const coord = point.getCoordinate() as CoordinateEntry2D;
    if (!coord || coord.x === undefined || coord.y === undefined) {
        return { distance: undefined, hz: undefined, v: undefined };
    }
    const orientation = tm.orientation;
    if (orientation === undefined) {
        return { distance: undefined, hz: undefined, v: undefined };
    }
    const measureStore = useMeasureStore();
    const location = measureStore.getPoint(tm.pointNumber);
    if (!location) {
        return { distance: undefined, hz: undefined, v: undefined };
    }
    const locationCoord = location.getCoordinate() as CoordinateEntry2D;
    if (!locationCoord || locationCoord.x === undefined || locationCoord.y === undefined) {
        return { distance: undefined, hz: undefined, v: undefined };
    }

    const dist = distance(locationCoord, coord);
    const angle = azimuth(locationCoord, coord);

    let v: number | undefined;
    if (locationCoord.z !== undefined && coord.z !== undefined) {

        let hdiff = coord.z - locationCoord.z + target_height - (tm.instrumentHeight ?? 0);

        v = zenithDistance(dist, hdiff);

    }

    return {
        distance: round(dist),
        hz: round(gonBetween0And400(angle - orientation), 4),
        v: v !== undefined ? round(v, 4) : undefined
    }
}
