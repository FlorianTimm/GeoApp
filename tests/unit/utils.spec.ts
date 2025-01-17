import { describe, expect, test } from 'vitest'
import { azimuth, radToGon, gonBetween0And400, round, zenithDistance, cot, vertical2height } from "../../src/utils";


describe('utils.ts', () => {
  test('azimuth', () => {
    const a = { x: 1, y: 2 }
    const b = { x: 3, y: 4 }
    expect(azimuth(a, b)).toBe(50)
    expect(azimuth(b, a)).toBe(250)
    const c = { x: 0, y: 1 }
    const d = { x: 0, y: -1 }
    expect(azimuth(c, d)).toBe(200)
    expect(azimuth(d, c)).toBe(0)
  }),
    test('radToGon', () => {
      expect(radToGon(Math.PI)).toBe(200)
      expect(radToGon(0)).toBe(0)
    }),
    test('gonBetween0And400', () => {
      expect(gonBetween0And400(400)).toBe(0)
      expect(gonBetween0And400(401)).toBe(1)
      expect(gonBetween0And400(-1)).toBe(399)
      expect(gonBetween0And400(-1500)).toBe(100)
      expect(gonBetween0And400(1500)).toBe(300)
    }),
    test('round', () => {
      expect(round(0)).toBe(0)
      expect(round(0.123456789)).toBe(0.123)
      expect(round(0.123456789, 4)).toBe(0.1235)
      expect(round(0.123456789, 5)).toBe(0.12346)
    }),
    test('zenithDistance', () => {
      expect(zenithDistance(10, 10)).toBe(50)
      expect(zenithDistance(10, 0)).toBe(100)
      expect(zenithDistance(10, -10)).toBe(150)
      expect(zenithDistance(30, -40)).toBeCloseTo(159, 0)
    }),
    test('vertical2height', () => {
      expect(vertical2height(50, 10)).toBeCloseTo(10, 5)
      expect(vertical2height(50, 0)).toBeCloseTo(0, 5)
      expect(vertical2height(350, 10)).toBeCloseTo(10, 5)
      expect(vertical2height(150, 10)).toBeCloseTo(-10, 5)
    }),
    test('cot', () => {
      expect(cot(100)).toBeCloseTo(0, 5)
      expect(cot(0)).toBeGreaterThan(1E9)
      expect(cot(120)).toBeCloseTo(-0.3, 1)
      expect(cot(80)).toBeCloseTo(0.3, 1)
    })
})