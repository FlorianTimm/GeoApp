import { beforeEach, describe, expect, test } from 'vitest'
import { TheodoliteMeasure, TheodoliteMeasureEntry } from "../../src/types/TheodoliteMeasure";
import { Point } from '../../src/types/Point';
import { useMeasureStore } from '../../src/store';
import { setActivePinia, createPinia } from 'pinia'
import { CoordinateEntry2D, CoordinateSource } from '../../src/types/CoordinateEntry';

describe('TheodoliteMeasure.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  }),
    test('resection_fake', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      let measures = [
        { coordinate: { epsg: 'EPSG:25832', x: 2, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '2', lage: 1, hz: 100 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: 2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '1', lage: 1, hz: 0 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: -2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '3', lage: 1, hz: 200 } as TheodoliteMeasureEntry },
      ]
      const r = tm.resection(location, measures)
      expect(r).not.toBeNull()
      expect(r.x).toBe(0)
      expect(r.y).toBe(0)
    }),
    test('resection_real', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      let measures = [
        {
          coordinate: {
            "source": "manual",
            "epsg": "EPSG:25832",
            "x": 527647.181,
            "y": 6005521.703,
            "accuracy": 0
          },
          measure: {
            "nr": "101",
            "lage": 1,
            "hz": 38.204
          }
        },
        {
          coordinate: {
            "source": "manual",
            "epsg": "EPSG:25832",
            "x": 527649.929,
            "y": 6005530.878,
            "accuracy": 0
          },
          measure: {
            "nr": "102",
            "lage": 1,
            "hz": 16.5968
          },

        },
        {
          coordinate: {
            "source": "manual",
            "epsg": "EPSG:25832",
            "x": 527662.014,
            "y": 6005527.26,
            "accuracy": 0
          },
          measure: {
            "nr": "103",
            "lage": 1,
            "hz": 8.142
          }
        }
      ] as { coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]
      const r = tm.resection(location, measures)
      expect(r).not.toBeNull()
      expect(r.x).toBeCloseTo(527632.555, 2)
      expect(r.y).toBeCloseTo(6005544.248, 2)
    }),
    test('setupOnPoint_fake', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      location.addCoordinate({ epsg: 'EPSG:25832', x: 0, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource })
      let measures = [
        { coordinate: { epsg: 'EPSG:25832', x: 2, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '2', lage: 1, hz: 100 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: 2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '1', lage: 1, hz: 0 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: -2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '3', lage: 1, hz: 200 } as TheodoliteMeasureEntry },
      ]
      const r = tm.setupOnPoint(location, measures)
      expect(r).not.toBeNull()
      expect(r).toBe(0)
    })
  test('setupOnPoint_real', () => {
    let tm = new TheodoliteMeasure('test');
    let location = new Point('test');
    location.addCoordinate({ epsg: 'EPSG:25832', x: 527632.555, y: 6005544.248, accuracy: 0.1, source: 'manual' as CoordinateSource })
    let measures = [
      {
        coordinate: {
          "source": "manual",
          "epsg": "EPSG:25832",
          "x": 527647.181,
          "y": 6005521.703,
          "accuracy": 0
        },
        measure: {
          "nr": "101",
          "lage": 1,
          "hz": 38.204
        }
      },
      {
        coordinate: {
          "source": "manual",
          "epsg": "EPSG:25832",
          "x": 527649.929,
          "y": 6005530.878,
          "accuracy": 0
        },
        measure: {
          "nr": "102",
          "lage": 1,
          "hz": 16.5968
        },

      },
      {
        coordinate: {
          "source": "manual",
          "epsg": "EPSG:25832",
          "x": 527662.014,
          "y": 6005527.26,
          "accuracy": 0
        },
        measure: {
          "nr": "103",
          "lage": 1,
          "hz": 8.142
        }
      }
    ] as { coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]
    const r = tm.setupOnPoint(location, measures)
    expect(r).not.toBeNull()
    expect(r).toBeCloseTo(125.1587, 3)
  })
})
