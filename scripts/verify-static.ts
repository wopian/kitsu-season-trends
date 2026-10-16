import { strict as assert } from 'node:assert'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { decode } from 'msgpack-lite'
import { sourceFiles, readDocument } from './data-files'
import type { SeasonInfo } from '../shared/trends'

const root = resolve('.output/public')
const catalog = JSON.parse(
  await readFile('.generated/catalog.json', 'utf8'),
) as SeasonInfo[]
const routes = ['/', '/ratings', '/stats', ...catalog.map((item) => `/${item.year}/${item.season}`)]
for (const route of routes) {
  const html = await readFile(join(root, route, 'index.html'), 'utf8')
  assert.match(html, /<h1[\s>]/, `Missing rendered heading: ${route}`)
  assert(html.includes('kitsu.wopian.me'), `Missing canonical: ${route}`)
  assert(!html.includes('/_ipx/'), 'Runtime image processing is forbidden')
  assert(
    !html.includes('Internal Server Error'),
    `Error page exported: ${route}`,
  )
}
for (const path of await sourceFiles()) {
  const name = relative('data', path)
    .replaceAll('\\', '/')
    .replace(/\.json5$/, '')
  const source = await readDocument(path)
  assert.deepEqual(
    JSON.parse(await readFile(join(root, `data/${name}.json`), 'utf8')),
    source,
  )
  assert.deepEqual(
    decode(await readFile(join(root, `msgpack/${name}.msgpack`))),
    source,
  )
}
const stats = await readDocument('data/stats.json5')
assert.deepEqual(JSON.parse(await readFile(join(root, 'stats.json'), 'utf8')), stats)
assert.deepEqual(decode(await readFile(join(root, 'stats.msgpack'))), stats)
assert((await readFile(join(root, 'sitemap.xml'), 'utf8')).includes('https://kitsu.wopian.me/stats/'))
const styles =
  (await readFile(join(root, 'index.html'), 'utf8'))
    .match(/<link[^>]*rel="stylesheet"[^>]*>/g)
    ?.join('') ?? ''
await writeFile(
  join(root, '404.html'),
  `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Season not found — Kitsu Season Trends</title>${styles}</head><body><main style="padding:12vh 8vw"><h1>Season not found.</h1><p style="margin:3rem 0">This season has no archived data.</p><a href="/">Explore available seasons</a></main></body></html>`,
)
const files: Record<string, string> = {}
async function walk(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    assert(!entry.isSymbolicLink(), 'Unexpected output symlink')
    if (entry.isDirectory()) await walk(path)
    else if (entry.name !== 'release-manifest.json')
      files[relative(root, path).replaceAll('\\', '/')] = createHash('sha256')
        .update(await readFile(path))
        .digest('hex')
  }
}
await walk(root)
for (const name of [
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'favicon.png',
  'service-worker.js',
])
  assert(files[name], `Missing ${name}`)
await writeFile(
  join(root, 'release-manifest.json'),
  JSON.stringify(
    {
      formatVersion: 1,
      revision: process.env.RELEASE_REVISION ?? process.env.GITHUB_SHA ?? 'local',
      generatedAt: new Date().toISOString(),
      routes,
      files,
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `Verified ${routes.length} routes, every JSON/MessagePack archive, and ${Object.keys(files).length} release files.`,
)
