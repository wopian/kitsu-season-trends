import { test, expect } from 'bun:test'
import { chartRows } from '../../shared/trends'
import {
  seasonAt,
  previousSeason,
  selectAnime,
  value,
  chartPoints,
  parseUpdated,
  type Anime,
} from '../../shared/trends'
const entries: Anime[] = [
  {
    i: 2,
    t: 'Two',
    u: 0,
    n: 1,
    d: [{ d: 24, r: 100, u: 1000, w: 40, l: 50, p: 75.25, o: 24.75, f: 4 }],
  },
  {
    i: 1,
    t: 'One',
    u: 1,
    n: 0,
    d: [{ d: 24, r: 20, u: 21, w: 70, l: 80, f: 9 }],
  },
]
const all = { tv: true, ona: true, new: true, old: true }
test('UTC quarters and previous year boundary', () => {
  expect(seasonAt(new Date('2026-04-01T00:00:00Z'))).toEqual({
    year: 2026,
    season: 'spring',
  })
  expect(previousSeason(new Date('2026-01-31T23:59:00Z'))).toEqual({
    year: 2025,
    season: 'autumn',
  })
})
test('Users Rated sorts raw counts, never rating participation', () =>
  expect(selectAnime(entries, 'r', false, all).map((item) => item.i)).toEqual([
    2, 1,
  ]))
test('metrics preserve historical rating choice, omitted zeroes, fractional votes', () => {
  expect(value(entries[0]!.d[0], 'rating', true)).toBe(50)
  expect(value(entries[0]!.d[0], 'rating', false)).toBe(40)
  expect(value(entries[0]!.d[0], 'p')).toBe(75.25)
  expect(value({ d: 0 }, 'f')).toBe(0)
})
test('filters, search, favourites sorting and ties', () => {
  expect(selectAnime(entries, 'f', true, all).map((item) => item.i)).toEqual([
    1, 2,
  ])
  expect(
    selectAnime(entries, 'rating', true, { ...all, old: false }).map(
      (item) => item.i,
    ),
  ).toEqual([2])
  expect(
    selectAnime(entries, 'r', false, all, 'one').map((item) => item.i),
  ).toEqual([1])
  expect(
    selectAnime(
      entries.map((anime) => ({ ...anime, d: [{ d: 0 }] })),
      'r',
      false,
      all,
    ).map((item) => item.i),
  ).toEqual([1, 2])
})
test('charts retain date gaps and anchor archive ranges to latest sample', () => {
  const anime = {
    ...entries[0]!,
    d: [
      { d: 24, f: 1 },
      { d: 72, f: 3 },
    ],
  }
  expect(chartPoints(anime, 'f', false).map((point) => point.value)).toEqual([
    1,
    null,
    3,
  ])
  expect(chartPoints(anime, 'f', false, 2).map((point) => point.value)).toEqual(
    [null, 3],
  )
})

test('overlaid series preserve raw counts, percentages, fractional votes and gaps', () => {
  const anime = {
    ...entries[0]!,
    d: [entries[0]!.d[0]!, { d: 72, r: 200, f: 8 }],
  }
  const rows = chartRows(anime, true)
  expect(rows[0]).toEqual({
    date: 864e5,
    rating: 50,
    r: 100,
    p: 75.25,
    o: 24.75,
    f: 4,
  })
  expect(rows[1]).toEqual({
    date: 2 * 864e5,
    rating: null,
    r: null,
    p: null,
    o: null,
    f: null,
  })
  expect(rows[2]).toEqual({
    date: 3 * 864e5,
    rating: 0,
    r: 200,
    p: 0,
    o: 0,
    f: 8,
  })
})
test('legacy and ISO timestamps parse consistently', () => {
  expect(parseUpdated('2026-10-15 22:07:21Z (GMT+0)')?.toISOString()).toBe(
    '2026-10-15T22:07:21.000Z',
  )
  expect(parseUpdated('2017-06-30T07:06:12.000Z')?.getUTCFullYear()).toBe(2017)
  expect(parseUpdated('broken')).toBeNull()
})
