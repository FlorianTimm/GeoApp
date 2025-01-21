import { azimuth2xy } from "@/utils";
import { TheodoliteMeasure } from "../TheodoliteMeasure";



export function free_station(tm: TheodoliteMeasure) {
    console.log('free station');
    const measures = tm.getMeasuresForSetup();
    let sourceId = new Set([tm.id])
    const localCoordinates = measures.map(m => {
        if (m.measure.distance === undefined || m.measure.hz === undefined) {
            return;
        }
        if (m.coordinate.sourceId !== undefined) m.coordinate.sourceId.forEach(e => sourceId.add(e));
        return {
            local: azimuth2xy({ x: 0, y: 0 }, m.measure.distance, m.measure.hz),
            world: m.coordinate
        }
    }).filter(m => m !== undefined)

    if (localCoordinates.length < 2) {
        return;
    }

    const epsg = localCoordinates[0].world.epsg;

    const sum_local = { x: 0, y: 0 };
    const sum_world = { x: 0, y: 0 };
    for (let i = 0; i < localCoordinates.length; i++) {
        sum_local.x += localCoordinates[i].local.x;
        sum_local.y += localCoordinates[i].local.y;
        sum_world.x += localCoordinates[i].world.x;
        sum_world.y += localCoordinates[i].world.y;
    }

    const avg_local = { x: sum_local.x / localCoordinates.length, y: sum_local.y / localCoordinates.length };
    const avg_world = { x: sum_world.x / localCoordinates.length, y: sum_world.y / localCoordinates.length };

    let a_top = 0;
    let ao_bottom = 0;
    let o_top = 0;
    for (let i = 0; i < localCoordinates.length; i++) {
        const lx = localCoordinates[i].local.x - avg_local.x;
        const ly = localCoordinates[i].local.y - avg_local.y;
        const wx = localCoordinates[i].world.x - avg_world.x;
        const wy = localCoordinates[i].world.y - avg_world.y;

        o_top += ly * wx - lx * wy;
        a_top += ly * wy + lx * wx;
        ao_bottom += lx * lx + ly * ly;
    }

    const a = a_top / ao_bottom;
    const o = o_top / ao_bottom;

    const m = Math.sqrt(a * a + o * o);
    console.log('m', m);

    let xn = avg_world.x - a * avg_local.x - o * avg_local.y;
    let yn = avg_world.y - a * avg_local.y + o * avg_local.x;

    let s
    if (localCoordinates.length > 2) {
        let wsum = 0
        for (let i = 0; i < localCoordinates.length; i++) {
            let wx = - xn - a * localCoordinates[i].local.x - o * localCoordinates[i].local.y + localCoordinates[i].world.x;
            let wy = - yn - a * localCoordinates[i].local.y + o * localCoordinates[i].local.x + localCoordinates[i].world.y;
            wsum += wx * wx + wy * wy;
        }
        console.log('wsum', wsum);
        s = Math.sqrt(wsum / (2 * localCoordinates.length - 4));
    } else {
        s = Math.max(...measures.map((m) => m.coordinate.accuracy));
    }

    tm.getPoint().addCoordinate({ x: xn, y: yn, accuracy: s, source: 'free_station', sourceId: [...sourceId], epsg: epsg });
    return { x: xn, y: yn, accuracy: s };
}