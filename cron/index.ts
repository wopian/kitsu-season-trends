import { mkdir, open, unlink } from 'node:fs/promises'
import {
  seasonAt,
  previousSeason,
  type SeasonData,
  type AnimeArchive,
} from '../shared/trends'
import { readDocument, writeDocuments } from '../scripts/data-files'
import { collect } from './collect'
import { createApi } from './api'
import { updateArchives } from './update'
import { statsFromArchives } from '../scripts/season-stats'

await mkdir('.cache', { recursive: true })
const lock = await open('.cache/collector.lock', 'wx')
try {
  const now = new Date()
  const documents = await Promise.all(
    [seasonAt(now), previousSeason(now)].map(async ({ year, season }) => {
      try {
        return await readDocument<SeasonData>(`data/${year}-${season}.json5`)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        return {
          data: [],
          meta: { total: 0, current: 0 },
          updated: '',
          useLaplace: true,
        }
      }
    }),
  )
  const archiveCount = await updateArchives({
    collect: () => collect(createApi(), documents, now),
    readArchive: async (id) => {
      try {
        return await readDocument<AnimeArchive>(`data/id/${id}.json5`)
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        return undefined
      }
    },
    now,
    buildStats: statsFromArchives,
    write: writeDocuments,
  })
  console.log(
    `Updated current and previous seasons, ${archiveCount} ID archives, and season stats at ${now.toISOString()}`,
  )
} finally {
  await lock.close()
  await unlink('.cache/collector.lock')
}
