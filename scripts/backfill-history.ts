import { mkdir, open, unlink } from 'node:fs/promises'
import { sourceFiles, readDocument, writeDocuments } from './data-files'
import { mergeAnimeHistory } from '../cron/archives'
import { seasons, type AnimeArchive, type SeasonData } from '../shared/trends'

await mkdir('.cache', { recursive: true })
const lock = await open('.cache/collector.lock', 'wx')
try {
  const originals = new Map<number, string>()
  const archives = new Map<number, AnimeArchive>()
  for (const path of await sourceFiles('data/id')) {
    const archive = await readDocument<AnimeArchive>(path)
    originals.set(archive.meta.i, JSON.stringify(archive))
    archives.set(archive.meta.i, archive)
  }
  const seasonalFiles = (await sourceFiles()).filter((path) =>
    /[\\/]\d{4}-(winter|spring|summer|autumn)\.json5$/.test(path),
  )
  const order = (path: string) => {
    const match = /(\d{4})-(winter|spring|summer|autumn)\.json5$/.exec(path)!
    return (
      Number(match[1]) * 4 +
      seasons.indexOf(match[2] as (typeof seasons)[number])
    )
  }
  seasonalFiles.sort((a, b) => order(a) - order(b))
  for (const path of seasonalFiles) {
    const season = await readDocument<SeasonData>(path)
    for (const anime of season.data)
      archives.set(anime.i, mergeAnimeHistory(archives.get(anime.i), anime))
  }
  const changed = [...archives]
    .filter(([id, archive]) => originals.get(id) !== JSON.stringify(archive))
    .map(([id, data]) => ({ path: `data/id/${id}.json5`, data }))
  // Every existing observation must remain byte-for-byte equal as an object.
  for (const [id, json] of originals) {
    const old = JSON.parse(json) as AnimeArchive
    const merged = new Map(
      archives.get(id)!.data.map((point) => [point.d, point]),
    )
    for (const point of old.data)
      if (JSON.stringify(merged.get(point.d)) !== JSON.stringify(point))
        throw new Error(
          `Historical observation changed for anime ${id} at ${point.d}`,
        )
  }
  if (!process.argv.includes('--dry-run')) await writeDocuments(changed)
  console.log(
    `${process.argv.includes('--dry-run') ? 'Dry run: ' : ''}${changed.length} ID archives updated from ${seasonalFiles.length} seasons; ${archives.size} total. Existing observations preserved.`,
  )
} finally {
  await lock.close()
  await unlink('.cache/collector.lock')
}
