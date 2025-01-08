import { CoordinateEntry2D } from "../CoordinateEntry";
import { azimuth, round, gonBetween0And400, gonBetweenMinus200And200 } from "@/utils";
import { TheodoliteMeasure } from "../TheodoliteMeasure";



export function setupOnPoint(tm: TheodoliteMeasure) {
    const measures = tm.getMeasuresForSetup();
    const locationCoordinate = tm.getPoint().getCoordinate();
    if (locationCoordinate === undefined || locationCoordinate === null || locationCoordinate.x === undefined || locationCoordinate.y === undefined) {
        return null;
    }

    console.log('setup on point');
    const locationCoordinateXY = locationCoordinate as CoordinateEntry2D;
    const angles_org = measures.map(m => {
        let angle = azimuth(locationCoordinateXY, m.coordinate);
        if (angle === null || m.measure.hz === undefined) {
            return null;
        }
        angle -= m.measure.hz;
        return gonBetween0And400(angle);
    })
    let angles = angles_org.filter(a => a !== null) as number[];

    console.log('angles', angles);

    let sum = 0
    for (let i = 0; i < angles.length; i++) {
        if (i == 0) {
            sum = angles[i];
        } else {
            let tmpAvg = sum / i;
            if (tmpAvg - angles[i] > 200) {
                angles[i] += 400;
            } else if (tmpAvg - angles[i] < -200) {
                angles[i] -= 400;
            }
            sum += angles[i];
        }
    }
    let avg = gonBetween0And400(sum / angles.length);
    console.log('avg', avg);

    measures.forEach((m, i) => {
        if (angles_org[i] === null) {
            return;
        }
        m.measure.hz_v = round(gonBetweenMinus200And200(angles_org[i] - avg), 4);
        console.log('hz_v', m.measure.hz_v);
    })
    return avg;
}