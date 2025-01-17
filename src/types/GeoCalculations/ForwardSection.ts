import { azimuth, tan } from "@/utils";
import { TheodoliteMeasure, TheoMeasureEntryWithPoint } from "../TheodoliteMeasure";
import { stakeOut } from "./StakeOut";
import { useMeasureStore } from "@/store";
import { Measurement } from "../Measurement";

export function forwardSection() {
    console.log('forward section');
    let tms: Measurement[] = useMeasureStore().getMeasurements();

    const measures = tms.filter((tm) => tm instanceof TheodoliteMeasure && tm.orientation !== undefined)
        .map((tm) => tm as TheodoliteMeasure)
        .filter((tm) => tm.orientation !== undefined)
        .map((tm) => ({ tm: tm, measures: tm.getMeasures() }))
        .filter((m) => m.measures !== undefined && m.measures.length > 0);
    if (measures.length < 2) {
        return;
    }
    let points: {
        [nr: string]: {
            setup: TheodoliteMeasure,
            measure: TheoMeasureEntryWithPoint,
        }[]
    } = {};

    measures.forEach((m, i) => {
        m.measures.forEach((me, j) => {
            if (points[me.target.nr] === undefined) {
                points[me.target.nr] = [];
            }
            points[me.target.nr].push({
                setup: m.tm,
                measure: me,
            });
        });
    });

    for (const nr in points) {
        const p = points[nr]
        if (p.length < 2) {
            continue
        }

        let x: number = 0
        let y: number = 0
        let n: number = 0
        let sources = new Set<string>()

        for (let i = 0; i < p.length; i++) {
            const m1 = p[i]
            let a = m1.setup.getPoint().getCoordinate()
            if (a === undefined) {
                continue;
            }
            for (let j = i + 1; j < p.length; j++) {
                const m2 = p[j]
                let b = m2.setup.getPoint().getCoordinate()
                if (b === undefined || m1.setup.pointNumber == m2.setup.pointNumber) {
                    continue;
                }

                if (m1.measure.measure.hz === undefined || m2.measure.measure.hz === undefined || m1.setup.orientation === undefined || m2.setup.orientation === undefined) {
                    continue;
                }
                const hz1 = m1.measure.measure.hz + m1.setup.orientation
                const hz2 = m2.measure.measure.hz + m2.setup.orientation


                let x1 = a.x
                let y1 = a.y
                let x2 = b.x
                let y2 = b.y

                if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
                    continue;
                }

                let yn = y1 + ((x2 - x1) - (y2 - y1) * tan(hz2)) / (tan(hz1) - tan(hz2))
                let xn = x1 + (yn - y1) * tan
                    (hz1)

                x += xn
                y += yn
                n++
                sources.add(m1.setup.id)
                sources.add(m2.setup.id)
            }
        }

        if (n > 0) {
            x /= n
            y /= n

            let point = useMeasureStore().getPoint(nr);
            point.removeCoordinatesByFilter((c) => c.source === 'intersection');
            point.addCoordinate({ x: x, y: y, accuracy: 0, epsg: 'EPSG:25832', source: 'intersection', sourceId: Array.from(sources) });


        }

    }

}
