import { azimuth, cot, tan, round, gonBetween0And400 } from "@/utils";
import { TheodoliteMeasure } from "../TheodoliteMeasure";
import { useMeasureStore } from "@/store";


export function resection(tm: TheodoliteMeasure) {
    const measures = tm.getMeasuresForSetup()
        .filter(m => m.coordinate !== undefined && m.measure !== undefined && m.measure.hz !== undefined);
    if (measures.length < 3) {
        console.log('not enough measures');
        return;
    }
    console.log('resection');

    const filtered = measures.sort((a, b) => (a.measure.hz ?? 0) - (b.measure.hz ?? 0));

    let x = 0
    let y = 0
    let n = 0
    let accuracy = 0

    let sourcesId = new Set<string>([tm.id])


    for (let i = 0; i < filtered.length - 2; i++) {
        const pa = filtered[i];
        const ya = pa.coordinate.y;
        const xa = pa.coordinate.x;
        pa.coordinate.sourceId?.forEach(e => sourcesId.add(e));

        for (let j = i + 1; j < filtered.length - 1; j++) {
            const pm = filtered[j];
            const xm = pm.coordinate.x;
            const ym = pm.coordinate.y;
            pm.coordinate.sourceId?.forEach(e => sourcesId.add(e));

            const alpha = gonBetween0And400((pm.measure.hz ?? 0) - (pa.measure.hz ?? 0));

            for (let k = j + 1; k < filtered.length; k++) {
                const pb = filtered[k];
                const xb = pb.coordinate.x;
                const yb = pb.coordinate.y;
                pb.coordinate.sourceId?.forEach(e => sourcesId.add(e));

                if (pb.measure.hz === undefined) {
                    continue;
                }

                const beta = gonBetween0And400((pb.measure.hz ?? 0) - (pm.measure.hz ?? 0));

                const xc = xa + (ym - ya) * cot(alpha)
                const yc = ya - (xm - xa) * cot(alpha)

                const xd = xb + (yb - ym) * cot(beta)
                const yd = yb - (xb - xm) * cot(beta)

                const tcd = azimuth({ x: xc, y: yc }, { x: xd, y: yd });

                if (tcd === undefined) {
                    return;
                }

                let yn = yc + ((xm - xc + (ym - yc) * cot(tcd)) / (tan(tcd) + cot(tcd)));
                let xn;
                /*
                console.log('tcd', tcd);
                console.log('tan', tan(tcd), 'cot', cot(tcd));
                console.log('1. soluteion', xc + (yn - yc) * tan(tcd));
                console.log('2. soluteion', xm + (yn - ym) * cot(tcd));
                if (tan(tcd) < cot(tcd)) {*/
                xn = xc + (yn - yc) * tan(tcd);
                /*} else {
                    xn = xm + (yn - ym) * cot(tcd);
                }*/
                console.log('solution', { x: xn, y: yn });
                x += xn
                y += yn
                accuracy += pa.coordinate.accuracy + pb.coordinate.accuracy + pm.coordinate.accuracy;
                n++
            }
        }
    }
    if (n > 0) {
        x /= n
        y /= n
        accuracy /= n / 3

        x = round(x, 4);
        y = round(y, 4);

        tm.getPoint().addCoordinate({ x: x, y: y, accuracy: accuracy, source: 'resection', sourceId: [...sourcesId], epsg: filtered[0].coordinate.epsg });
        console.log('location', { x: x, y: y });
        return { x: x, y: y };
    }
    console.log('no solution');
    return;

}