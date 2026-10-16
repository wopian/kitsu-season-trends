import type { AnimeArchive, SeasonData } from '../shared/trends'
export function applyPosters(
  document: SeasonData | AnimeArchive,
  posters: Record<number, string>,
) {
  const next = structuredClone(document)
  if ('i' in next.meta) {
    const poster = posters[next.meta.i]
    if (poster) next.meta.poster = poster
  } else
    for (const anime of (next as SeasonData).data)
      if (posters[anime.i]) anime.poster = posters[anime.i]
  return next
}
