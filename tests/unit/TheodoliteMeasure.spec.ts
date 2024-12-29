import { beforeEach, describe, expect, test } from 'vitest'
import { TheodoliteMeasure, TheodoliteMeasureEntry } from "../../src/types/TheodoliteMeasure";
import { Point } from '../../src/types/Point';
import { useMeasureStore } from '../../src/store';
import { setActivePinia, createPinia } from 'pinia'
import { CoordinateSource } from '../../src/types/CoordinateEntry';

describe('TheodoliteMeasure.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  }),
    test('resection', () => {
      let tm = new TheodoliteMeasure('test');
      let mSS = useMeasureStore();
      let location = new Point('test');
      let measures = [
        { target: { epsg: 'EPSG:25832', x: 2, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '2', lage: 1, hz: 100 } as TheodoliteMeasureEntry },
        { target: { epsg: 'EPSG:25832', x: 0, y: 2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '1', lage: 1, hz: 0 } as TheodoliteMeasureEntry },
        { target: { epsg: 'EPSG:25832', x: 0, y: -2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '3', lage: 1, hz: 200 } as TheodoliteMeasureEntry },
      ]
      const r = tm.resection(location, measures)
      expect(r).not.toBeNull()
      expect(r.x).toBe(0)
      expect(r.y).toBe(0)
    }),
    test('setupOnPoint', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      location.addCoordinate({ epsg: 'EPSG:25832', x: 0, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource })
      let measures = [
        { target: { epsg: 'EPSG:25832', x: 2, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '2', lage: 1, hz: 100 } as TheodoliteMeasureEntry },
        { target: { epsg: 'EPSG:25832', x: 0, y: 2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '1', lage: 1, hz: 0 } as TheodoliteMeasureEntry },
        { target: { epsg: 'EPSG:25832', x: 0, y: -2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '3', lage: 1, hz: 200 } as TheodoliteMeasureEntry },
      ]
      const r = tm.setupOnPoint(location, measures)
      expect(r).not.toBeNull()
    })
})
