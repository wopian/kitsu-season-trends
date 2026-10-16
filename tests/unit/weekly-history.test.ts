import { test, expect } from 'bun:test'
import { weeklyChartRows, type Anime, type Snapshot } from '../../shared/trends'

const hour = (date: string) => Date.parse(date) / 36e5
const anime = (d: Snapshot[]): Anime => ({ i: 12, t: 'One Piece', d })

test('ISO week maxima cross year boundaries and retain independent metric peaks', () => {
  const source = anime([
    { d: hour('2021-01-04T00:00:00Z'), l: 70, r: 30, p: 2, o: 1, f: 2 },
    { d: hour('2021-01-01T01:00:00Z'), w: 90, r: 12, p: 8.25, o: 1, f: 9 },
    { d: hour('2021-01-01T22:00:00Z'), l: 80, r: 25, p: 5, o: 3.5, f: 4 },
    { d: hour('2021-01-03T23:00:00Z'), l: 85, r: 20, p: 7, o: 4.75, f: 6 },
  ])
  const original = structuredClone(source)
  expect(weeklyChartRows(source, 'auto')).toEqual([
    { date: Date.parse('2020-12-28Z'), rating: 90, r: 25, p: 8.25, o: 4.75, f: 9 },
    { date: Date.parse('2021-01-04Z'), rating: 70, r: 30, p: 2, o: 1, f: 2 },
  ])
  expect(source).toEqual(original)
})

test('empty weeks remain gaps, compressed zeroes stay zero, empty archives stay empty', () => {
  const rows = weeklyChartRows(anime([
    { d: hour('2021-01-03T23:00:00Z'), l: 80 },
    { d: hour('2021-01-18T00:00:00Z'), l: 85 },
  ]), 'auto')
  expect(rows.map((row) => new Date(row.date).toISOString().slice(0, 10)))
    .toEqual(['2020-12-28', '2021-01-04', '2021-01-11', '2021-01-18'])
  expect(rows.map((row) => row.rating)).toEqual([80, null, null, 85])
  expect(rows.map((row) => row.f)).toEqual([0, null, null, 0])
  expect(weeklyChartRows(anime([]), 'auto')).toEqual([])
})

test('ISO week boundaries also work before Unix epoch', () => {
  expect(weeklyChartRows(anime([
    { d: hour('1969-12-28T23:00:00Z'), w: 80 },
    { d: hour('1970-01-01T00:00:00Z'), w: 85 },
  ]), false).map((row) => row.date)).toEqual([
    Date.parse('1969-12-22Z'), Date.parse('1969-12-29Z'),
  ])
})
