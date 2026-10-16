import { mkdir, writeFile } from 'node:fs/promises'
import { createApi, batches, apiPoster } from '../cron/api'
import { animeSourceFiles, readDocument, writeDocuments } from './data-files'
import type { AnimeArchive, SeasonData } from '../shared/trends'
import { applyPosters } from './poster-metadata'

const files = await animeSourceFiles()
const documents = await Promise.all(
  files.map(async (path) => ({
    path,
    data: await readDocument<SeasonData | AnimeArchive>(path),
  })),
)
const ids = new Set<number>()
for (const { data } of documents) {
  if ('i' in data.meta) ids.add(data.meta.i)
  else for (const anime of (data as SeasonData).data) ids.add(anime.i)
}
await mkdir('.cache', { recursive: true })
const posters: Record<number, string> = {}
const sortedIds = [...ids].sort((a, b) => a - b)
const api = createApi()
for (let offset = 0; offset < sortedIds.length; offset += 20) {
  for (const anime of await batches(
    api,
    sortedIds.slice(offset, offset + 20),
    'posterImage',
  )) {
    const poster = apiPoster(anime)
    if (poster) posters[Number(anime.id)] = poster
  }
  if (offset % 200 === 0)
    console.log(
      `Resolved posters: ${Math.min(offset + 20, ids.size)}/${ids.size}`,
    )
}
const changed: typeof documents = []
for (const document of documents) {
  const before = JSON.stringify(document.data)
  document.data = applyPosters(document.data, posters)
  if (JSON.stringify(document.data) !== before) changed.push(document)
}
const missing = sortedIds.filter((id) => !posters[id])
await writeFile(
  '.cache/poster-backfill-report.json',
  JSON.stringify(
    {
      ids: ids.size,
      resolved: Object.keys(posters).length,
      missing,
      changedFiles: changed.length,
    },
    null,
    2,
  ),
)
if (!process.argv.includes('--dry-run')) await writeDocuments(changed)
console.log(
  `${process.argv.includes('--dry-run') ? 'Dry run: ' : ''}${changed.length} metadata updates; ${missing.length} IDs retain stored poster or CDN fallback. See .cache/poster-backfill-report.json`,
)
