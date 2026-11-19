import { mkdir, writeFile, rm } from 'node:fs/promises'
import { dirname, relative, join } from 'node:path'
import { encode } from 'msgpack-lite'
import { strict as assert } from 'node:assert'
import { sourceFiles, readDocument } from './data-files'
import { statsFromArchives } from './season-stats'
import type { SeasonStatsDocument } from '../shared/season-stats'
import { seasons, type SeasonData, type SeasonInfo } from '../shared/trends'
import { generateSocialPreviews } from './social-preview'

const stats = await readDocument<SeasonStatsDocument>('data/stats.json5').catch((error) => {
  if (error.code !== 'ENOENT') throw error
  throw new Error('Season stats missing. Run bun run backfill:stats')
})
assert.deepEqual(stats, await statsFromArchives(), 'Season stats stale. Run bun run backfill:stats')

// Clear exports left by older builds before Nuxt copies the public directory.
await rm('public/data', { recursive: true, force: true })
await rm('public/stats.json', { force: true })
for (const path of ['public/msgpack', 'public/social', '.generated']) {
  await rm(path, { recursive: true, force: true })
}
await mkdir('.generated/summaries', { recursive: true })
const catalog: SeasonInfo[] = []
const previewSources: { info: SeasonInfo; document: SeasonData }[] = []
for (const path of await sourceFiles()) {
  const document = await readDocument<unknown>(path)
  const name = relative('data', path)
    .replaceAll('\\', '/')
    .replace(/\.json5$/, '')
  const output = join('public/msgpack', `${name}.msgpack`)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, encode(document))
  const match = /^(\d{4})-(winter|spring|summer|autumn)$/.exec(name)
  if (match) {
    const seasonDocument = document as SeasonData
    const year = Number(match[1])
    const season = match[2] as SeasonInfo['season']
    const info: SeasonInfo = {
      year,
      season,
      key: name,
      label: `${season[0]!.toUpperCase()}${season.slice(1)} ${year}`,
    }
    catalog.push(info)
    previewSources.push({ info, document: seasonDocument })
    await writeFile(
      `.generated/summaries/${name}.msgpack`,
      encode({
        entries: seasonDocument.data.map((anime) => ({
          ...anime,
          d: anime.d.slice(-2),
        })),
        meta: seasonDocument.meta,
        updated: seasonDocument.updated,
        useLaplace: !!seasonDocument.useLaplace,
      }),
    )
  }
}
catalog.sort(
  (a, b) =>
    b.year - a.year || seasons.indexOf(b.season) - seasons.indexOf(a.season),
)
await writeFile('.generated/catalog.msgpack', encode(catalog))
await writeFile('.generated/social-previews.msgpack', encode(await generateSocialPreviews(previewSources)))
await writeFile('.generated/stats.msgpack', encode(stats))
await writeFile('public/stats.msgpack', encode(stats))
await writeFile(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/ratings/', '/stats/', ...catalog.map((item) => `/${item.year}/${item.season}/`)].map((path) => `<url><loc>https://kitsu.wopian.me${path}</loc></url>`).join('')}</urlset>`,
)
console.log(
  `Prepared ${catalog.length} seasons and public MessagePack archives.`,
)
