import type { AnimeArchive, SeasonData } from '../shared/trends'
import type { SeasonStatsDocument } from '../shared/season-stats'
import { archiveUpdates } from './archives'

type SeasonUpdate = { path: string; data: SeasonData }
export async function updateArchives(options: {
  collect: () => Promise<SeasonUpdate[]>
  readArchive: (id: number) => Promise<AnimeArchive | undefined>
  buildStats: (updates: SeasonUpdate[]) => Promise<SeasonStatsDocument>
  write: (updates: { path: string; data: unknown }[]) => Promise<void>
  now: Date
}) {
  const updates = await options.collect()
  const archives = await archiveUpdates(updates.map((update) => update.data), options.readArchive, options.now)
  const stats = await options.buildStats(updates)
  await options.write([...updates, ...archives, { path: 'data/stats.json5', data: stats }])
  return archives.length
}
