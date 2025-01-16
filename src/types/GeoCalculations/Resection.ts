import { azimuth, cot, tan, round, gonBetween0And400 } from "@/utils";
import { TheodoliteMeasure } from "../TheodoliteMeasure";


export function resection(tm: TheodoliteMeasure) {
    const measures = tm.getMeasuresForSetup();
    if (measures.length < 3) {
        return null;
    }
    console.log('resection');

    const filtered = measures.
        sort((a, b) => (a.coordinate.accuracy) - (b.coordinate.accuracy)).
        slice(0, 3).
        sort((a, b) => (a.measure.hz ?? 0) - (b.measure.hz ?? 0));
    console.log('filtered', filtered);
    const pa = filtered[0];
    const pm = filtered[1];
    const pb = filtered[2];

    const ya = pa.coordinate.y;
    const xb = pb.coordinate.x;
    const yb = pb.coordinate.y;
    const xm = pm.coordinate.x;
    const xa = pa.coordinate.x;
    const ym = pm.coordinate.y;

    if (pm.measure.hz === undefined || pa.measure.hz === undefined || pb.measure.hz === undefined) {
        return null;
    }
    const alpha = gonBetween0And400(pm.measure.hz - pa.measure.hz);
    const beta = gonBetween0And400(pb.measure.hz - pm.measure.hz);

    const xc = xa + (ym - ya) * cot(alpha)
    const yc = ya - (xm - xa) * cot(alpha)

    const xd = xb + (yb - ym) * cot(beta)
    const yd = yb - (xb - xm) * cot(beta)

    const tcd = azimuth({ x: xc, y: yc }, { x: xd, y: yd });

    if (tcd === null) {
        return null;
    }

    let yn = yc + ((xm - xc + (ym - yc) * cot(tcd)) / (tan(tcd) + cot(tcd)));
    let xn;
    if (tan(tcd) < cot(tcd)) {
        xn = xc + (yn - yc) * tan(tcd);
    } else {
        xn = xm + (yn - ym) * cot(tcd);
    }

    xn = round(xn, 4);
    yn = round(yn, 4);

    let accuracy = (pa.coordinate.accuracy + pb.coordinate.accuracy + pm.coordinate.accuracy) / 3;
    tm.getPoint().addCoordinate({ x: xn, y: yn, accuracy: accuracy, source: 'resection', sourceId: [tm.id], epsg: pa.coordinate.epsg });
    console.log('location', { x: xn, y: yn });
    return { x: xn, y: yn };
}