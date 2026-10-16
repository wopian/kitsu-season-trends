import {
  seasonAt,
  previousSeason,
  bounds,
  type Season,
  type Anime,
  type SeasonData,
} from '../shared/trends'
import {
  apiPoster,
  batches,
  fields,
  type ApiAnime,
  type createApi,
} from './api'
import { ratingStats } from './utils/stats.mjs'

export function overlaps(
  entry: Pick<ApiAnime, 'startDate' | 'endDate'>,
  year: number,
  season: Season,
) {
  if (!entry.startDate) return false
  const [start, end] = bounds(year, season)
  const from = Date.parse(entry.startDate)
  const until = entry.endDate ? Date.parse(entry.endDate) : Infinity
  return Number.isFinite(from) && from < end && until >= start
}
export function updateSeason(
  document: SeasonData,
  entries: ApiAnime[],
  year: number,
  season: Season,
  now: Date,
): SeasonData {
  const result = structuredClone(document)
  const byId = new Map(result.data.map((anime) => [anime.i, anime]))
  const day = Math.floor(now.getTime() / 864e5)
  for (const entry of entries) {
    const id = Number(entry.id)
    const existing = byId.get(id)
    if (
      !existing &&
      (!['TV', 'ONA', 'tv', 'ona'].includes(entry.subtype) ||
        !overlaps(entry, year, season))
    )
      continue
    if (
      !entry.ratingFrequencies ||
      Object.values(entry.ratingFrequencies).some(
        (count) => !Number.isFinite(Number(count)) || Number(count) < 0,
      )
    )
      throw new Error(`Invalid rating frequencies for anime ${id}`)
    const ratings = ratingStats(entry.ratingFrequencies)
    if (!ratings.usersRated) continue
    const started = entry.startDate ? seasonAt(new Date(entry.startDate)) : null
    const anime: Anime = existing ?? {
      i: id,
      t: entry.canonicalTitle,
      u: entry.subtype.toLowerCase() === 'tv' ? 0 : 1,
      n: started?.year === year && started.season === season ? 1 : 0,
      d: [],
    }
    anime.t = entry.canonicalTitle
    const poster = apiPoster(entry)
    if (poster) anime.poster = poster
    const point = {
      i: 0,
      d: Math.floor(now.getTime() / 36e5),
      w: ratings.wilson,
      l: ratings.laplace,
      p: ratings.upvotes,
      o: ratings.downvotes,
      r: ratings.usersRated,
      ...(entry.favoritesCount ? { f: Math.trunc(entry.favoritesCount) } : {}),
    }
    const today = anime.d.findIndex((item) => Math.floor(item.d / 24) === day)
    if (today < 0) {
      point.i = (anime.d.at(-1)?.i ?? -1) + 1
      anime.d.push(point)
    } else {
      point.i = anime.d[today]!.i ?? today
      anime.d[today] = point
    }
    byId.set(id, anime)
  }
  result.data = [...byId.values()].sort((a, b) => a.i - b.i)
  result.meta = {
    ...result.meta,
    total: result.data.length,
    current: result.data.filter((item) => item.n === 1).length,
  }
  result.updated = now.toISOString()
  return result
}
export async function collect(
  api: ReturnType<typeof createApi>,
  documents: SeasonData[],
  now = new Date(),
) {
  const known = new Set(
    documents.flatMap((document) => document.data.map((anime) => anime.i)),
  )
  const entries = new Map(
    (await batches(api, [...known])).map((entry) => [Number(entry.id), entry]),
  )
  for (const status of ['current', 'upcoming']) {
    for (let offset = 0; ; offset += 20) {
      const response = await api.get<ApiAnime[]>('anime', {
        params: {
          fields: { anime: fields },
          filter: { subtype: 'tv,ona', status },
          sort: '-averageRating,-userCount',
          page: { offset, limit: 20 },
        },
      })
      if (!Array.isArray(response.data))
        throw new Error('Invalid Kitsu discovery response')
      for (const entry of response.data)
        if (entry.status === status) entries.set(Number(entry.id), entry)
      if (!response.links?.next) break
    }
  }
  return [seasonAt(now), previousSeason(now)].map((target, index) => ({
    path: `data/${target.year}-${target.season}.json5`,
    data: updateSeason(
      documents[index]!,
      [...entries.values()],
      target.year,
      target.season,
      now,
    ),
  }))
}
