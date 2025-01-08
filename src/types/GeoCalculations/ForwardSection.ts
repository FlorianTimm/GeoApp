import { TheodoliteMeasure, TheoMeasureEntryWithPoint } from "../TheodoliteMeasure";

export function forwardSection(tms: TheodoliteMeasure[]) {
    const measures = tms
        .filter((tm) => tm.orientation !== undefined)
        .map((tm) => ({ tm: tm, measures: tm.getMeasures() }))
        .filter((m) => m.measures !== null && m.measures !== undefined && m.measures.length > 0);

    let points: {
        [nr: string]: {

        }
    } = {};
}
