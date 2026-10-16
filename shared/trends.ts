export const seasons = ['winter', 'spring', 'summer', 'autumn'] as const
export type Season = (typeof seasons)[number]
export type Metric = 'rating' | 'r' | 'p' | 'o' | 'f'
export type ChartRow = { date: number } & Record<Metric, number | null>
export const metrics: { key: Metric; label: string; color: string }[] = [
  { key: 'rating', label: 'Rating', color: '#d65e43' },
  { key: 'r', label: 'Users Rated', color: '#8262ae' },
  { key: 'p', label: 'Upvotes', color: '#b87945' },
  { key: 'o', label: 'Downvotes', color: '#a15175' },
  { key: 'f', label: 'Favourites', color: '#a66b9f' },
]
export interface Snapshot {
  i?: number
  d: number
  w?: number
  l?: number
  p?: number
  o?: number
  r?: number
  f?: number
  u?: number
  [key: string]: number | undefined
}
export interface Anime {
  i: number
  t: string
  u?: number
  n?: number
  poster?: string
  d: Snapshot[]
}
export interface SeasonData {
  data: Anime[]
  meta: { current?: number; total?: number }
  updated: string
  useLaplace?: boolean
}
export interface AnimeArchive {
  meta: { i: number; t: string; u?: number; poster?: string }
  data: Snapshot[]
}
export interface SeasonInfo {
  year: number
  season: Season
  key: string
  label: string
}
export interface Summary {
  entries: Anime[]
  meta: SeasonData['meta']
  updated: string
  useLaplace: boolean
}
export function seasonAt(date = new Date()): { year: number; season: Season } {
  return {
    year: date.getUTCFullYear(),
    season: seasons[Math.floor(date.getUTCMonth() / 3)]!,
  }
}
export function previousSeason(date = new Date()) {
  return seasonAt(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 3, 1)),
  )
}
export function isDailySeason(target: { year: number; season: Season }, date = new Date()) {
  return [seasonAt(date), previousSeason(date)].some(
    (item) => item.year === target.year && item.season === target.season,
  )
}
export function bounds(year: number, season: Season): [number, number] {
  const month = seasons.indexOf(season) * 3
  return [Date.UTC(year, month, 1), Date.UTC(year, month + 3, 1)]
}
export function score(point: Snapshot, useLaplace: boolean | 'auto' = false): number {
  if (useLaplace === 'auto') return point.l ?? point.w ?? 0
  return (useLaplace ? point.l : point.w) ?? 0
}
export function value(
  point: Snapshot | undefined,
  metric: Metric,
  useLaplace: boolean | 'auto' = false,
): number {
  return point
    ? metric === 'rating'
      ? score(point, useLaplace)
      : (point[metric] ?? 0)
    : 0
}
export function formatValue(number: number, metric: Metric, compact = false) {
  return (
    new Intl.NumberFormat('en-GB', {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits:
        metric === 'rating' || metric === 'p' || metric === 'o' ? 2 : 0,
    }).format(number) + (metric === 'rating' ? '%' : '')
  )
}
export function posterFor(anime: { i: number; poster?: string }) {
  return (
    anime.poster ||
    `https://media.kitsu.app/anime/poster_images/${anime.i}/small.jpg`
  )
}
export function parseUpdated(raw: string) {
  const normalized = raw
    .replace(/\s+\([^)]*\)$/, '')
    .replace(/^(\d{4}-\d\d-\d\d) /, '$1T')
  const date = new Date(normalized)
  return Number.isFinite(date.getTime()) ? date : null
}
export function selectAnime(
  entries: Anime[],
  metric: Metric,
  useLaplace: boolean,
  filters: { tv: boolean; ona: boolean; new: boolean; old: boolean },
  search = '',
) {
  return entries
    .filter(
      (anime) =>
        (anime.u === 1 ? filters.ona : filters.tv) &&
        ((anime.n ?? 1) === 1 ? filters.new : filters.old) &&
        anime.t.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
    )
    .sort(
      (a, b) =>
        value(b.d.at(-1), metric, useLaplace) -
          value(a.d.at(-1), metric, useLaplace) || a.i - b.i,
    )
}
export function chartPoints(
  anime: Anime,
  metric: Metric,
  useLaplace: boolean | 'auto',
  days = 0,
  end?: number,
  start?: number,
) {
  const last = end ?? Math.max(...anime.d.map((point) => point.d * 36e5))
  const first = days
    ? last - (days - 1) * 864e5
    : (start ?? Math.min(...anime.d.map((point) => point.d * 36e5)))
  const byDay = new Map(
    anime.d.map((point) => [Math.floor(point.d / 24), point]),
  )
  const points: { date: number; value: number | null }[] = []
  for (
    let day = Math.floor(first / 864e5);
    day <= Math.floor(last / 864e5);
    day++
  ) {
    const point = byDay.get(day)
    points.push({
      date: day * 864e5,
      value: point ? value(point, metric, useLaplace) : null,
    })
  }
  return points
}

export function chartRows(
  anime: Anime,
  useLaplace: boolean | 'auto',
  days = 0,
  end?: number,
  start?: number,
): ChartRow[] {
  const byDay = new Map(
    anime.d.map((point) => [Math.floor(point.d / 24), point]),
  )
  return chartPoints(anime, 'rating', useLaplace, days, end, start).map(
    ({ date }) => {
      const point = byDay.get(Math.floor(date / 864e5))
      return {
        date,
        rating: point ? value(point, 'rating', useLaplace) : null,
        r: point ? value(point, 'r') : null,
        p: point ? value(point, 'p') : null,
        o: point ? value(point, 'o') : null,
        f: point ? value(point, 'f') : null,
      }
    },
  )
}

export function weeklyChartRows(
  anime: Anime,
  useLaplace: boolean | 'auto',
): ChartRow[] {
  const byWeek = new Map<number, ChartRow>()
  let first = Infinity
  let last = -Infinity
  for (const point of anime.d) {
    const day = Math.floor(point.d / 24)
    // ISO weeks start Monday. Epoch day zero is Thursday.
    const date = (day - (((day + 3) % 7 + 7) % 7)) * 864e5
    first = Math.min(first, date)
    last = Math.max(last, date)
    const row = byWeek.get(date) ?? {
      date,
      rating: null,
      r: null,
      p: null,
      o: null,
      f: null,
    }
    for (const { key } of metrics) {
      const highest = value(point, key, useLaplace)
      row[key] = row[key] === null ? highest : Math.max(row[key], highest)
    }
    byWeek.set(date, row)
  }
  const rows: ChartRow[] = []
  for (let date = first; date <= last; date += 7 * 864e5) {
    rows.push(
      byWeek.get(date) ?? {
        date,
        rating: null,
        r: null,
        p: null,
        o: null,
        f: null,
      },
    )
  }
  return rows
}
