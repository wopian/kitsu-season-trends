import { readdir } from 'node:fs/promises'
import { buildSeasonStats, type SeasonSource } from '../shared/season-stats'
import type { Season, SeasonData } from '../shared/trends'
import { readDocument } from './data-files'

export async function statsFromArchives(overrides: { path: string; data: SeasonData }[] = []) {
  const documents = new Map(overrides.map((item) => [item.path.replaceAll('\\', '/'), item.data]))
  const paths = new Set((await readdir('data')).filter((name) => /^\d{4}-(winter|spring|summer|autumn)\.json5$/.test(name)).map((name) => `data/${name}`))
  for (const path of documents.keys()) paths.add(path)
  const sources: SeasonSource[] = []
  for (const path of [...paths].sort()) {
    const match = /^(?:data\/)(\d{4})-(winter|spring|summer|autumn)\.json5$/.exec(path)
    if (!match) throw new Error(`Invalid seasonal stats source: ${path}`)
    sources.push({ year: Number(match[1]), season: match[2] as Season, data: documents.get(path) ?? await readDocument<SeasonData>(path) })
  }
  return buildSeasonStats(sources)
}
