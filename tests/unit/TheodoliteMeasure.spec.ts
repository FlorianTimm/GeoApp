import { beforeEach, describe, expect, test } from 'vitest'
import { TheodoliteMeasure, TheodoliteMeasureEntry } from "../../src/types/TheodoliteMeasure";
import { Point } from '../../src/types/Point';
import { setActivePinia, createPinia } from 'pinia'
import { CoordinateEntry2D, CoordinateSource } from '../../src/types/CoordinateEntry';
import { resection } from '../../src/types/GeoCalculations/Resection';
import { setupOnPoint } from '../../src/types/GeoCalculations/SetupOnPoint';
import { free_station } from '../../src/types/GeoCalculations/FreeStation';
import { useMeasureStore } from '../../src/store';

describe('TheodoliteMeasure.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  }),
    test('resection_fake', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      useMeasureStore().addPoint(location);
      [
        { coordinate: { epsg: 'EPSG:25832', x: 2, y: 0, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '2', lage: 1, hz: 100 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: 2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '1', lage: 1, hz: 0 } as TheodoliteMeasureEntry },
        { coordinate: { epsg: 'EPSG:25832', x: 0, y: -2, accuracy: 0.1, source: 'manual' as CoordinateSource }, measure: { nr: '3', lage: 1, hz: 200 } as TheodoliteMeasureEntry },
      ].forEach(m => {
        let p = new Point(m.measure.nr)
        p.addCoordinate(m.coordinate)
        useMeasureStore().addPoint(p)
        tm.addMeasure(m.measure)
      });
      const r = resection(tm)
      expect(r).not.toBeUndefined()
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
      const r = resection(tm)
      expect(r).not.toBeUndefined()
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
      const r = setupOnPoint(tm)
      expect(r).not.toBeUndefined()
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
    const r = setupOnPoint(tm)
    expect(r).not.toBeUndefined()
    expect(r).toBeCloseTo(125.1587, 3)
  }),
    test('free_station_niemeier', () => {
      let tm = new TheodoliteMeasure('test');
      let location = new Point('test');
      let measures = [
        {
          coordinate: {
            "source": "manual",
            "epsg": "EPSG:25832",
            "x": 40686.792,
            "y": 26816.143,
            "accuracy": 0.05
          },
          measure: {
            "nr": "104",
            "lage": 1,
            "hz": 199.5131,
            "distance": 1002.598
          }
        },
        {
          coordinate: {
            "x": 40350.846,
            "y": 28835.979,
            "accuracy": 0.05,
            "source": "free_station",
            "sourceId": "83982efb-7daf-45f8-982c-c8d407f57d21",
            "epsg": "EPSG:25832"
          },
          measure: {
            "nr": "280",
            "lage": 1,
            "hz": 370.6444,
            "distance": 1098.643
          }
        }

      ] as { coordinate: CoordinateEntry2D, measure: TheodoliteMeasureEntry }[]
      const r = free_station(tm)
      console.log(r)
      expect(r).not.toBeUndefined()
      expect(r.x).toBeCloseTo(40759.4, 1)
      expect(r.y).toBeCloseTo(27816.1, 1)
      expect(r.accuracy).toBeCloseTo(0.05, 1)
    })
})
