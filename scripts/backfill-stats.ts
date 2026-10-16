import { mkdir, open, unlink } from 'node:fs/promises'
import { readDocument, writeDocuments } from './data-files'
import { statsFromArchives } from './season-stats'

await mkdir('.cache', { recursive: true })
const lock = await open('.cache/collector.lock', 'wx')
try {
  const stats = await statsFromArchives()
  const previous = await readDocument('data/stats.json5').catch((error) => {
    if (error.code !== 'ENOENT') throw error
    return null
  })
  const changed = JSON.stringify(previous) !== JSON.stringify(stats)
  const dryRun = process.argv.includes('--dry-run')
  if (changed && !dryRun) await writeDocuments([{ path: 'data/stats.json5', data: stats }])
  console.log(`${dryRun ? 'Dry run: ' : ''}${changed ? 1 : 0} stats file updated; ${stats.seasons.length} seasons, ${stats.uniqueAnime} unique anime. Archives unchanged.`)
} finally {
  await lock.close()
  await unlink('.cache/collector.lock')
}
