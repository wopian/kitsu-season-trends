import { test, expect } from 'bun:test'
import { buildSeasonStats, isSeasonStatsDocument, onaShare, seasonCounts, seasonGrowth, statsTimeline, type SeasonSource } from '../../shared/season-stats'
import type { SeasonData } from '../../shared/trends'
import { updateArchives } from '../../cron/update'
import { animeSourceFiles, readDocument } from '../../scripts/data-files'
import { statsFromArchives } from '../../scripts/season-stats'

const document: SeasonData = {
  meta: { total: 200, current: 150 }, updated: '2026-10-15 22:07:21Z (GMT+0)', useLaplace: true,
  data: [
    { i: 1, t: 'One', d: [{ d: 24, l: 60, r: 40 }, { d: 72, l: 80, r: 100, f: 8 }, { d: 48, l: 95, r: 300, f: 20 }] },
    { i: 2, t: 'Two', u: 1, n: 0, d: [{ d: 72, w: 45, l: 50, r: 20 }] },
    { i: 3, t: 'Three', u: 0, n: 1, d: [{ d: 72, l: 0 }] },
    { i: 4, t: 'Four', u: 1, n: 0, d: [] },
  ],
}
const source = (year = 2026, season: SeasonSource['season'] = 'autumn', data = document): SeasonSource => ({ year, season, data })

test('stats recount entries, legacy flags, latest samples and positive unweighted means', () => {
  const original = structuredClone(document)
  const stats = buildSeasonStats([source()])
  expect(seasonCounts(document.data)).toEqual({ total: 4, tv: 2, ona: 2, new: 2, leftovers: 2 })
  expect(stats.seasons[0]).toEqual({
    year: 2026, season: 'autumn', total: 4, tv: 2, ona: 2, new: 2, leftovers: 2,
    updated: '2026-10-15T22:07:21.000Z', averageRating: 65, ratedAnime: 2,
    ratingSubmissions: 120, favourites: 8, scoringMethod: 'Laplace',
  })
  expect(isSeasonStatsDocument(stats)).toBe(true)
  expect(document).toEqual(original)
})

test('global IDs deduplicate across seasons; timestamps and order stay deterministic', () => {
  const older = { ...document, useLaplace: false, updated: '2025-12-31T00:00:00Z' }
  const stats = buildSeasonStats([source(), source(2025, 'autumn', older)])
  expect(stats.uniqueAnime).toBe(4)
  expect(stats.seasons.map((row) => row.year)).toEqual([2025, 2026])
  expect(stats.seasons[0]!.averageRating).toBe(45)
  expect(stats.seasons[0]!.scoringMethod).toBe('Wilson')
  expect(stats.updated).toBe('2026-10-15T22:07:21.000Z')
  expect(buildSeasonStats([source(2025, 'autumn', older), source()])).toEqual(stats)
})

test('empty stats and zero denominators stay unavailable; missing quarters remain gaps', () => {
  const empty: SeasonData = { data: [], meta: {}, updated: '' }
  const stats = buildSeasonStats([source(2025, 'autumn', empty), source(2026, 'winter'), source(2026, 'summer')])
  const [first, second, third] = stats.seasons
  expect(first!.averageRating).toBeNull()
  expect(first!.ratingSubmissions).toBe(0)
  expect(onaShare(first!)).toBeNull()
  expect(onaShare(second!)).toBe(50)
  expect(seasonGrowth(second!, stats.seasons)).toEqual({ change: 4, percent: null })
  expect(seasonGrowth(third!, stats.seasons)).toEqual({ change: null, percent: null })
  expect(statsTimeline(stats.seasons).map((row) => row.new)).toEqual([0, 2, null, 2])
  expect(statsTimeline([])).toEqual([])
  expect(buildSeasonStats([])).toEqual({ version: 1, updated: null, uniqueAnime: 0, seasons: [] })
  expect(isSeasonStatsDocument({ ...stats, seasons: [{ ...second, total: 99 }] })).toBe(false)
  expect(isSeasonStatsDocument(null)).toBe(false)
})

test('aggregate timestamp keeps newer archive when another season has an older override', () => {
  const override = { ...document, updated: '2026-10-16T22:00:00Z' }
  const newer = { ...document, updated: '2026-10-16T22:06:14.415Z' }
  const stats = buildSeasonStats([source(2026, 'autumn', override), source(2026, 'summer', newer)])
  expect(stats.seasons.find((row) => row.season === 'autumn')!.updated).toBe('2026-10-16T22:00:00.000Z')
  expect(stats.updated).toBe('2026-10-16T22:06:14.415Z')
})

test('growth compares exact quarter across year boundary', () => {
  const rows = buildSeasonStats([source(2025, 'autumn', { ...document, data: document.data.slice(0, 2) }), source(2026, 'winter')]).seasons
  expect(seasonGrowth(rows[1]!, rows)).toEqual({ change: 2, percent: 100 })
})

test('daily writes include fresh season, ID and aggregate stats only after collection succeeds', async () => {
  let saved: { path: string; data: unknown }[] = []
  const updates = [{ path: 'data/2026-autumn.json5', data: document }]
  const options = {
    collect: async () => updates,
    readArchive: async () => undefined,
    buildStats: async (fresh: typeof updates) => buildSeasonStats([source(2026, 'autumn', fresh[0]!.data)]),
    write: async (rows: typeof saved) => { saved = rows },
    now: new Date('2026-10-15T22:00Z'),
  }
  await updateArchives(options)
  expect(saved.map((row) => row.path)).toContain('data/stats.json5')
  expect(saved.map((row) => row.path)).toContain('data/id/1.json5')
  expect(saved.at(-1)!.data).toEqual(buildSeasonStats([source()]))
  saved = []
  await expect(updateArchives({ ...options, collect: async () => { throw new Error('API failed') } })).rejects.toThrow('API failed')
  expect(saved).toEqual([])
  await expect(updateArchives({ ...options, buildStats: async () => { throw new Error('Stats failed') } })).rejects.toThrow('Stats failed')
  expect(saved).toEqual([])
})

test('archive stats use fresh overrides and poster sources exclude aggregate document', async () => {
  const override = { ...document, updated: '2026-10-16T22:00:00Z' }
  const stats = await statsFromArchives([{ path: 'data/2026-autumn.json5', data: override }])
  expect(stats.seasons.find((row) => row.year === 2026 && row.season === 'autumn')!.total).toBe(4)
  expect(stats.seasons.find((row) => row.year === 2026 && row.season === 'autumn')!.updated).toBe('2026-10-16T22:00:00.000Z')
  const files = await animeSourceFiles()
  expect(files).not.toContain('data/stats.json5')
  expect(files.every((path) => !path.endsWith('stats.json5'))).toBe(true)
  const stored = await readDocument('data/stats.json5')
  expect(stored).toEqual(await statsFromArchives())
}, 60000)
