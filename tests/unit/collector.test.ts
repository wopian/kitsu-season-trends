import { test, expect } from 'bun:test'
import Kitsu from 'kitsu-native'
import { createTransport, type ApiAnime } from '../../cron/api'
import { overlaps, updateSeason, collect } from '../../cron/collect'
import { ratingStats } from '../../cron/utils/stats.mjs'
import { applyPosters } from '../../scripts/poster-metadata'
import type { SeasonData, AnimeArchive } from '../../shared/trends'

const anime: ApiAnime = {
  id: '12',
  canonicalTitle: 'One Piece',
  subtype: 'TV',
  status: 'current',
  startDate: '1999-10-20',
  endDate: null,
  ratingFrequencies: { '20': '20', '10': '10' },
  favoritesCount: 9,
  posterImage: { small: 'https://media.kitsu.app/poster.jpg' },
}
const empty = (): SeasonData => ({
  data: [],
  meta: { current: 0, total: 0 },
  updated: '',
  useLaplace: true,
})
test('quarter overlap excludes future and finished seasons', () => {
  expect(overlaps(anime, 2026, 'autumn')).toBe(true)
  expect(
    overlaps({ startDate: '2027-01-01', endDate: null }, 2026, 'autumn'),
  ).toBe(false)
  expect(overlaps({ startDate: null, endDate: null }, 2026, 'autumn')).toBe(
    false,
  )
})
test('daily rerun replaces sample; earlier observations remain exact', () => {
  const first = updateSeason(
    empty(),
    [anime, anime],
    2026,
    'autumn',
    new Date('2026-10-14T22:00Z'),
  )
  const earlier = structuredClone(first.data[0]!.d)
  const second = updateSeason(
    first,
    [anime],
    2026,
    'autumn',
    new Date('2026-10-15T22:00Z'),
  )
  const rerun = updateSeason(
    second,
    [{ ...anime, favoritesCount: 10 }],
    2026,
    'autumn',
    new Date('2026-10-15T23:00Z'),
  )
  expect(rerun.data).toHaveLength(1)
  expect(rerun.data[0]!.d).toHaveLength(2)
  expect(rerun.data[0]!.d.slice(0, 1)).toEqual(earlier)
  expect(rerun.data[0]!.d[1]!.f).toBe(10)
  expect(first.data[0]!.d).toHaveLength(1)
})
test('rating formula preserves weighted votes and zero-vote omission', () => {
  expect(ratingStats({ '20': '20', '10': '10' }).usersRated).toBe(30)
  expect(ratingStats({ '20': '20', '10': '10' }).laplace).toBe(71.43)
  expect(
    updateSeason(
      empty(),
      [{ ...anime, ratingFrequencies: {} }],
      2026,
      'autumn',
      new Date(),
    ).data,
  ).toEqual([])
})
test('transient requests retry and respect Retry-After', async () => {
  let calls = 0
  const delays: number[] = []
  const transport = createTransport(
    (async () =>
      ++calls === 1
        ? new Response('', { status: 429, headers: { 'Retry-After': '2' } })
        : new Response('{}')) as typeof fetch,
    async (ms) => {
      delays.push(ms)
    },
    0,
  )
  expect((await transport('https://example.test')).status).toBe(200)
  expect(calls).toBe(2)
  expect(delays).toContain(2000)
})
test('permanent failures are not retried; network errors stop after three attempts', async () => {
  let calls = 0
  const transport = createTransport(
    (async () => {
      calls++
      return new Response('', { status: 401 })
    }) as typeof fetch,
    async () => {},
    0,
  )
  expect((await transport('https://example.test')).status).toBe(401)
  expect(calls).toBe(1)
  const failing = createTransport(
    (async () => {
      throw new Error('network')
    }) as unknown as typeof fetch,
    async () => {},
    0,
  )
  await expect(failing('https://example.test')).rejects.toThrow('network')
})
test('discovery failure rejects collection and leaves inputs unchanged', async () => {
  const document = empty()
  const api = {
    get: async () => {
      throw new Error('API unavailable')
    },
  }
  await expect(
    collect(api as never, [document, empty()], new Date('2026-10-16')),
  ).rejects.toThrow('API unavailable')
  expect(document).toEqual(empty())
})

test('native client paginates discovery and fetches shared known IDs once', async () => {
  const calls: URL[] = []
  const api = new Kitsu({
    fetch: (async (input: string | URL | Request) => {
      const url = new URL(String(input))
      calls.push(url)
      const status = url.searchParams.get('filter[status]')
      const offset = Number(url.searchParams.get('page[offset]') ?? 0)
      const resource = (entry: ApiAnime) => {
        const { id, ...attributes } = entry
        return { id, type: 'anime', attributes }
      }
      const data = !status
        ? [resource(anime)]
        : status === 'current' && offset === 0
          ? [resource(anime)]
          : status === 'current'
            ? [resource({ ...anime, id: '210', startDate: '2026-10-10' })]
            : []
      return Response.json({
        data,
        links:
          status === 'current' && offset === 0
            ? { next: 'https://kitsu.app/api/edge/anime?page[offset]=20' }
            : {},
      })
    }) as typeof fetch,
  })
  const document = empty()
  document.data.push({ i: 12, t: 'One Piece', u: 0, n: 0, d: [] })
  const result = await collect(
    api,
    [document, structuredClone(document)],
    new Date('2026-10-16T22:00Z'),
  )
  expect(
    calls
      .filter((url) => url.searchParams.has('filter[id]'))
      .map((url) => url.searchParams.get('filter[id]')),
  ).toEqual(['12'])
  expect(
    calls.filter((url) => url.searchParams.get('filter[status]') === 'current'),
  ).toHaveLength(2)
  expect(result[0]!.data.data.map((entry) => entry.i)).toEqual([12, 210])
  expect(result[1]!.data.data.map((entry) => entry.i)).toEqual([12])
})
test('poster backfill changes metadata only, preserves missing entries and is idempotent', () => {
  const season = updateSeason(
    empty(),
    [anime],
    2026,
    'autumn',
    new Date('2026-10-15T22:00Z'),
  )
  const after = applyPosters(season, {
    12: 'https://new.test/poster.jpg',
  }) as SeasonData
  expect(after.data[0]!.d).toEqual(season.data[0]!.d)
  expect(after.updated).toBe(season.updated)
  expect(after.meta).toEqual(season.meta)
  expect(applyPosters(after, { 12: 'https://new.test/poster.jpg' })).toEqual(
    after,
  )
  expect(applyPosters(after, {})).toEqual(after)
  const archive: AnimeArchive = {
    meta: { i: 12, t: 'One Piece' },
    data: [{ d: 12, w: 90 }],
  }
  const next = applyPosters(archive, {
    12: 'https://new.test/poster.jpg',
  }) as AnimeArchive
  expect(next.meta.poster).toBe('https://new.test/poster.jpg')
  expect(next.data).toEqual(archive.data)
})
