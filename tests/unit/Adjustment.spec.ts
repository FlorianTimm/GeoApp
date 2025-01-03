import { beforeEach, describe, expect, test } from 'vitest'
import { Adjustment } from "../../src/services/Adjustment";
import { Point } from '../../src/types/Point';
import { setActivePinia, createPinia } from 'pinia'
import { useMeasureStore } from '../../src/store';
import { distance } from 'ol/coordinate';

describe('TheodoliteMeasure.ts', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    }),
        test('adjust_UnExample', () => {
            const measureStore = useMeasureStore();
            // @ts-ignore
            measureStore.import('{"points":{"1":{"nr":"1","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":560439.896,"y":5923381.398,"accuracy":0.05}]},"2":{"nr":"2","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":560400.462,"y":5923431.921,"accuracy":0.05}]},"3":{"nr":"3","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":560375.359,"y":5923403.504,"accuracy":0.05}]},"100":{"nr":"100","coordinates":[{"x":560383.656,"y":5923368.356,"accuracy":0.1,"source":"free_station","sourceId":"4d2a7bf0-32f1-4c82-a72b-c69db14532bf","epsg":"EPSG:25832"}]}},"measurements":[{"type":"theodolite","id":"4d2a7bf0-32f1-4c82-a72b-c69db14532bf","pointNumber":"100","description":"","accuracy":3,"instrumentHeight":0,"orientation":85.5,"second":false,"measures":[{"nr":"1","lage":1,"hz":0.0006,"distance":57.675},{"nr":"2","lage":1,"hz":330.9504,"distance":65.7015},{"nr":"3","lage":1,"hz":299.7605,"distance":36.071}]}]}')
            let a = new Adjustment(measureStore.measurements, measureStore.points,);
            expect(a.adjust()).toBe(0);

        }),
        test('adjust', () => {
            const measureStore = useMeasureStore();
            // @ts-ignore
            measureStore.import('{ "$id": "measure", "points": { "1": { "nr": "1", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564686.1950000003, "y": 5923039.198999999, "accuracy": 0.02004360700170596 }] }, "2": { "nr": "2", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564674.5669999998, "y": 5923047.99, "accuracy": 0.09708565196235244 }] }, "3": { "nr": "3", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564657.9110000003, "y": 5923046.601, "accuracy": 0.3708883547429691 }] }, "4": { "nr": "4", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564648.9220000003, "y": 5923034.802999999, "accuracy": 0.3760115901304012 }] }, "5": { "nr": "5", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564627.8150000004, "y": 5923006.7809999995, "accuracy": 0.42824608183437407 }] }, "6": { "nr": "6", "description": "", "coordinates": [{ "source": "map", "epsg": "EPSG:25832", "x": 564642.8870000001, "y": 5923026.790999999, "accuracy": 0.2459627848685354 }] }, "100": { "nr": "100", "description": "", "coordinates": [{ "x": 564687.76, "y": 5923064.2993, "accuracy": 0.12103068127753125, "source": "resection", "sourceId": "a1ade66f-8ef2-4e63-8f14-87b766470935", "epsg": "EPSG:25832" }] }, "201": { "nr": "201", "description": "Wandecke zum Fernseher", "coordinates": [{ "x": 564689.416905726, "y": 5923062.55060208, "accuracy": 0.12103068127753125, "source": "theodolite", "sourceId": "a1ade66f-8ef2-4e63-8f14-87b766470935", "epsg": "EPSG:25832" }] }, "202": { "nr": "202", "description": "Wandecke zum Sofa", "coordinates": [{ "x": 564690.6048248169, "y": 5923064.127626586, "accuracy": 0.12103068127753125, "source": "theodolite", "sourceId": "a1ade66f-8ef2-4e63-8f14-87b766470935", "epsg": "EPSG:25832" }] } }, "measurements": [{ "type": "theodolite", "id": "a1ade66f-8ef2-4e63-8f14-87b766470935", "pointNumber": "100", "description": "", "accuracy": 3, "instrumentHeight": 0, "orientation": 337.41238385752314, "second": false, "measures": [{ "nr": "1", "lage": 1, "hz": 266.5574, "distance":25.15 }, { "nr": "2", "lage": 1, "hz": 305.8935, "distance":21.0 }, { "nr": "3", "lage": 1, "hz": 328.7052, "distance":34.7 }, { "nr": "4", "lage": 1, "hz": 321.188, "distance":48.8 }, { "nr": "5", "lage": 1, "hz": 313.7451, "distance":83.1 }, { "nr": "6", "lage": 1, "hz": 318.2694, "distance":58.5 }, { "nr": "201", "lage": 1, "hz": 214.3031, "distance": 2.409 }, { "nr": "202", "lage": 1, "hz": 166.4247, "v": null, "distance": 2.85 }] }] }');
            let a = new Adjustment(measureStore.measurements, measureStore.points,);
            expect(a.adjust()).toBe(0);

        })
})