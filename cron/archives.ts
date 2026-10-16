import type { Anime, AnimeArchive, SeasonData } from '../shared/trends'

/** Existing observations win historical conflicts. Only today's sample is replaceable. */
export function mergeAnimeHistory(
  existing: AnimeArchive | undefined,
  incoming: Anime,
  replaceDay?: number,
): AnimeArchive {
  const points = new Map(
    (existing?.data ?? [])
      .filter((point) => Math.floor(point.d / 24) !== replaceDay)
      .map((point) => [point.d, point]),
  )
  for (const point of incoming.d)
    if (!points.has(point.d)) points.set(point.d, structuredClone(point))
  return {
    ...existing,
    meta: {
      ...existing?.meta,
      i: incoming.i,
      t: incoming.t,
      ...(incoming.u !== undefined ? { u: incoming.u } : {}),
      ...(incoming.poster ? { poster: incoming.poster } : {}),
    },
    data: [...points.values()].sort((a, b) => a.d - b.d),
  }
}

export async function archiveUpdates(
  documents: SeasonData[],
  readArchive: (id: number) => Promise<AnimeArchive | undefined>,
  now: Date,
) {
  const archives = new Map<number, AnimeArchive>()
  const day = Math.floor(now.getTime() / 864e5)
  for (const document of documents)
    for (const anime of document.data) {
      const existing = archives.get(anime.i) ?? (await readArchive(anime.i))
      archives.set(anime.i, mergeAnimeHistory(existing, anime, day))
    }
  return [...archives]
    .sort(([a], [b]) => a - b)
    .map(([id, data]) => ({ path: `data/id/${id}.json5`, data }))
}
