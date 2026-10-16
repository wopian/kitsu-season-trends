import { test, expect } from 'bun:test'
import { normalizeNumericRows } from '../../node_modules/nuxt-charts/dist/runtime/utils/data.js'

test('chart normalization preserves null date gaps without accepting invalid numbers', () => {
  const data = [
    { date: 1, rating: 80, r: 10 },
    { date: 2, rating: null, r: null },
    { date: 3, rating: 82, r: 20 },
    { date: 4, rating: NaN, r: 21 },
  ]
  expect(normalizeNumericRows(data, ['rating', 'r'])).toEqual(data.slice(0, 3))
})
