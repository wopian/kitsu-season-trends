import { parseUpdated, score, seasons, type Anime, type Season, type SeasonData } from './trends'

export interface SeasonCounts {
  total: number
  tv: number
  ona: number
  new: number
  leftovers: number
}
export interface SeasonStats extends SeasonCounts {
  year: number
  season: Season
  updated: string | null
  averageRating: number | null
  ratedAnime: number
  ratingSubmissions: number
  favourites: number
  scoringMethod: 'Laplace' | 'Wilson'
}
export interface SeasonStatsDocument {
  version: 1
  updated: string | null
  uniqueAnime: number
  seasons: SeasonStats[]
}
export interface SeasonSource { year: number; season: Season; data: SeasonData }
export const seasonOrder = (year: number, season: Season) => year * 4 + seasons.indexOf(season)
export const seasonLabel = (year: number, season: Season) => `${season[0]!.toUpperCase()}${season.slice(1)} ${year}`

export function seasonCounts(anime: Anime[]): SeasonCounts {
  const ona = anime.filter((item) => item.u === 1).length
  const fresh = anime.filter((item) => (item.n ?? 1) === 1).length
  return { total: anime.length, tv: anime.length - ona, ona, new: fresh, leftovers: anime.length - fresh }
}

export function buildSeasonStats(sources: SeasonSource[]): SeasonStatsDocument {
  const ids = new Set<number>()
  const records = sources.map(({ year, season, data }) => {
    let ratingSum = 0, ratedAnime = 0, ratingSubmissions = 0, favourites = 0
    for (const anime of data.data) {
      ids.add(anime.i)
      const latest = anime.d.reduce<(typeof anime.d)[number] | undefined>(
        (last, point) => !last || point.d > last.d ? point : last, undefined,
      )
      if (!latest) continue
      const rating = score(latest, !!data.useLaplace)
      if (rating > 0) { ratingSum += rating; ratedAnime++ }
      ratingSubmissions += latest.r ?? 0
      favourites += latest.f ?? 0
    }
    return {
      year, season, ...seasonCounts(data.data),
      updated: parseUpdated(data.updated)?.toISOString() ?? null,
      averageRating: ratedAnime ? ratingSum / ratedAnime : null,
      ratedAnime, ratingSubmissions, favourites,
      scoringMethod: data.useLaplace ? 'Laplace' as const : 'Wilson' as const,
    }
  }).sort((a, b) => seasonOrder(a.year, a.season) - seasonOrder(b.year, b.season))
  return {
    version: 1,
    updated: records.map((row) => row.updated).filter((value): value is string => value !== null).sort().at(-1) ?? null,
    uniqueAnime: ids.size,
    seasons: records,
  }
}

export function seasonGrowth(current: SeasonStats, records: SeasonStats[]) {
  const previous = records.find((row) => seasonOrder(row.year, row.season) === seasonOrder(current.year, current.season) - 1)
  return {
    change: previous ? current.total - previous.total : null,
    percent: previous?.total ? (current.total - previous.total) / previous.total * 100 : null,
  }
}
export const onaShare = (row: SeasonCounts) => row.total ? row.ona / row.total * 100 : null

export interface StatsChartRow {
  date: number
  label: string
  record: SeasonStats | null
  new: number | null
  leftovers: number | null
  tv: number | null
  ona: number | null
  averageRating: number | null
  ratingSubmissions: number | null
  favourites: number | null
}
export function statsTimeline(records: SeasonStats[]): StatsChartRow[] {
  if (!records.length) return []
  const byQuarter = new Map(records.map((row) => [seasonOrder(row.year, row.season), row]))
  const quarters = [...byQuarter.keys()]
  const rows: StatsChartRow[] = []
  for (let quarter = Math.min(...quarters); quarter <= Math.max(...quarters); quarter++) {
    const year = Math.floor(quarter / 4), season = seasons[quarter % 4]!
    const record = byQuarter.get(quarter) ?? null
    rows.push({
      date: Date.UTC(year, (quarter % 4) * 3, 1), label: seasonLabel(year, season), record,
      new: record?.new ?? null, leftovers: record?.leftovers ?? null,
      tv: record?.tv ?? null, ona: record?.ona ?? null,
      averageRating: record?.averageRating ?? null,
      ratingSubmissions: record?.ratingSubmissions ?? null, favourites: record?.favourites ?? null,
    })
  }
  return rows
}

export function isSeasonStatsDocument(value: unknown): value is SeasonStatsDocument {
  if (!value || typeof value !== 'object') return false
  const document = value as SeasonStatsDocument
  const count = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
  return document.version === 1 && count(document.uniqueAnime)
    && (document.updated === null || typeof document.updated === 'string')
    && Array.isArray(document.seasons) && document.seasons.every((row, index) =>
      row && Number.isInteger(row.year) && row.year >= 0 && seasons.includes(row.season)
      && ['total', 'tv', 'ona', 'new', 'leftovers', 'ratedAnime', 'ratingSubmissions', 'favourites'].every((key) => count(row[key as keyof SeasonStats]))
      && row.tv + row.ona === row.total && row.new + row.leftovers === row.total
      && row.ratedAnime <= row.total
      && (row.averageRating === null || (Number.isFinite(row.averageRating) && row.averageRating > 0 && row.averageRating <= 100))
      && ['Wilson', 'Laplace'].includes(row.scoringMethod)
      && (row.updated === null || typeof row.updated === 'string')
      && (!index || seasonOrder(row.year, row.season) > seasonOrder(document.seasons[index - 1]!.year, document.seasons[index - 1]!.season)),
    )
}
