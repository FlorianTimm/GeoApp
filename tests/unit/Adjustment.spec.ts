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
            expect(a.adjust()).toBeCloseTo(0, 5);

        }),
        test('adjust', () => {
            const measureStore = useMeasureStore();
            // @ts-ignore
            measureStore.import('{"points":{"1":{"nr":"1","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564686.1950000003,"y":5923039.198999999,"accuracy":0.02004360700170596}]},"2":{"nr":"2","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564674.5669999998,"y":5923047.99,"accuracy":0.09708565196235244}]},"3":{"nr":"3","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564657.9110000003,"y":5923046.601,"accuracy":0.3708883547429691}]},"4":{"nr":"4","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564648.9220000003,"y":5923034.802999999,"accuracy":0.3760115901304012}]},"5":{"nr":"5","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564627.8150000004,"y":5923006.7809999995,"accuracy":0.42824608183437407}]},"6":{"nr":"6","description":"","coordinates":[{"source":"map","epsg":"EPSG:25832","x":564642.8870000001,"y":5923026.790999999,"accuracy":0.2459627848685354}]},"100":{"nr":"100","description":"","coordinates":[{"x":564687.8201320742,"y":5923064.226792378,"accuracy":0.05912935830756537,"source":"free_station","sourceId":"a1ade66f-8ef2-4e63-8f14-87b766470935","epsg":"EPSG:25832"}]},"201":{"nr":"201","description":"Wandecke zum Fernseher","coordinates":[{"x":564689.4728565211,"y":5923062.474142128,"accuracy":0.05912935830756537,"source":"theodolite","sourceId":"a1ade66f-8ef2-4e63-8f14-87b766470935","epsg":"EPSG:25832"}]},"202":{"nr":"202","description":"Wandecke zum Sofa","coordinates":[{"x":564690.664538756,"y":5923064.048324934,"accuracy":0.05912935830756537,"source":"theodolite","sourceId":"a1ade66f-8ef2-4e63-8f14-87b766470935","epsg":"EPSG:25832"}]}},"measurements":[{"type":"theodolite","id":"a1ade66f-8ef2-4e63-8f14-87b766470935","pointNumber":"100","description":"","accuracy":3,"instrumentHeight":0,"orientation":337.5644329249296,"second":false,"measures":[{"nr":"1","lage":1,"hz":266.5574,"distance":25.15,"active":true},{"nr":"2","lage":1,"hz":305.8935,"distance":21,"active":true},{"nr":"3","lage":1,"hz":328.7052,"distance":34.7,"active":true},{"nr":"4","lage":1,"hz":321.188,"distance":48.8,"active":true},{"nr":"5","lage":1,"hz":313.7451,"distance":83.1,"active":true},{"nr":"6","lage":1,"hz":318.2694,"distance":58.5,"active":true},{"nr":"201","lage":1,"hz":214.3031,"distance":2.409,"active":false},{"nr":"202","lage":1,"hz":166.4247,"v":null,"distance":2.85,"active":false}]}]}');
            let a = new Adjustment(measureStore.measurements, measureStore.points,);
            expect(a.adjust()).toBeCloseTo(0, 5);

        }),
        test('adjust_Niemeier', () => {
            const measureStore = useMeasureStore();
            // @ts-ignore
            measureStore.import('{"points":{"104":{"nr":"104","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":40686.792,"y":26816.143,"accuracy":0.05}]},"106":{"nr":"106","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":41932.838,"y":28872.552,"accuracy":0.05}]},"108":{"nr":"108","coordinates":[{"x":40759.378884543745,"y":27816.116145523407,"accuracy":0.005766965329656264,"source":"free_station","sourceId":"83982efb-7daf-45f8-982c-c8d407f57d21","epsg":"EPSG:25832"}]},"110":{"nr":"110","coordinates":[{"x":41373.01766313166,"y":27904.004458070456,"accuracy":0.0070538292255885844,"source":"free_station","sourceId":"eaa9c51b-4efc-41f6-93cd-d6f1d26acf7a","epsg":"EPSG:25832"}]},"113":{"nr":"113","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":42242.231,"y":27492.007,"accuracy":0.05}]},"280":{"nr":"280","coordinates":[{"source":"manual","epsg":"EPSG:25832","x":40350.846,"y":28835.979,"accuracy":0.05}]}},"measurements":[{"type":"theodolite","id":"83982efb-7daf-45f8-982c-c8d407f57d21","pointNumber":"108","description":"","accuracy":3,"instrumentHeight":0,"orientation":5.099999061863684,"second":false,"measures":[{"nr":"280","lage":1,"hz":370.6444,"distance":1098.643,"active":true},{"nr":"104","lage":1,"hz":199.5131,"distance":1002.598,"active":true},{"nr":"113","lage":1,"hz":108.5994,"distance":1517.862,"active":true}]},{"type":"theodolite","id":"eaa9c51b-4efc-41f6-93cd-d6f1d26acf7a","pointNumber":"110","description":"","accuracy":3,"instrumentHeight":0,"orientation":397.9499220851651,"second":false,"measures":[{"nr":"106","lage":1,"hz":35.4146,"distance":1118.689,"active":true},{"nr":"104","lage":1,"hz":237.8763,"distance":1286.215,"active":true},{"nr":"113","lage":1,"hz":130.2278,"distance":961.911,"active":true},{"nr":"108","active":true,"lage":1,"hz":292.9943,"distance":619.905}]}]}');
            let a = new Adjustment(measureStore.measurements, measureStore.points,);
            expect(a.adjust()).toBeCloseTo(0, 5);
        })
})