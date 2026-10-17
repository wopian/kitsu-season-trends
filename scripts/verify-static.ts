import { strict as assert } from 'node:assert'
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { decode } from 'msgpack-lite'
import { sourceFiles, readDocument } from './data-files'
import { seasonAt, type SeasonInfo, type SeasonData } from '../shared/trends'
import { seasonPreview, socialImageUrl, type SocialPreviewCatalog } from '../shared/social-preview'
import { checksum, xml } from './social-preview'
import { Resvg } from '@resvg/resvg-js'

const root = resolve('.output/public')
const catalog = JSON.parse(
  await readFile('.generated/catalog.json', 'utf8'),
) as SeasonInfo[]
const previews: SocialPreviewCatalog = JSON.parse(await readFile('.generated/social-previews.json', 'utf8'))
assert.deepEqual(Object.keys(previews).sort(), catalog.map((item) => item.key).sort(), 'Missing season previews')
function verifySocialHead(html: string, info: SeasonInfo) {
  const asset = previews[info.key]!
  const image = socialImageUrl(asset)
  for (const [key, expected] of Object.entries({
    'og:image': image, 'twitter:image': image, 'og:image:width': '1200', 'og:image:height': '630',
    'og:image:type': 'image/png', 'twitter:card': 'summary_large_image',
    'og:image:alt': asset.alt, 'twitter:image:alt': asset.alt,
  })) {
    const tag = [...html.matchAll(/<meta\b[^>]*>/g)].find(([tag]) => tag.includes(`="${key}"`))?.[0]
    const encoded = tag?.match(/content="([^"]*)"/)?.[1]
    const entities: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>', '&apos;': "'", '&#39;': "'", '&#x27;': "'" }
    const content = encoded?.replace(/&(?:amp|quot|lt|gt|apos|#39|#x27);/g, (entity) => entities[entity]!)
    assert.equal(content, expected, `Wrong social metadata for ${info.key}: ${key}`)
  }
}
for (const info of catalog) {
  const asset = previews[info.key]!
  const model = seasonPreview(info, await readDocument<SeasonData>(`data/${info.key}.json5`))
  assert.equal(asset.alt, model.alt, `Social preview stale: ${info.key}`)
  const svg = await readFile(join(root, asset.svg), 'utf8')
  const png = await readFile(join(root, asset.png))
  assert(svg.includes(`<title>${xml(model.alt)}</title>`), `Wrong SVG content: ${info.key}`)
  assert.match(svg, /width="1200" height="630"/)
  const parsed = new Resvg(svg, { font: { loadSystemFonts: false } })
  assert.equal(parsed.width, 1200)
  assert.equal(parsed.height, 630)
  assert(!/<text\b|<script\b|<foreignObject\b/.test(svg), `SVG not self-contained: ${info.key}`)
  for (const match of svg.matchAll(/(?:xlink:)?href="([^"]+)"/g))
    assert(/^(?:#|data:image\/)/.test(match[1]!), `External SVG resource: ${info.key}`)
  assert(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `Invalid PNG: ${info.key}`)
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
  assert.equal(asset.checksum, checksum(png))
  verifySocialHead(await readFile(join(root, `${info.year}/${info.season}/index.html`), 'utf8'), info)
  if (info.season === 'autumn') verifySocialHead(await readFile(join(root, `${info.year}/fall/index.html`), 'utf8'), info)
}
const current = seasonAt()
const home = catalog.find((info) => info.year === current.year && info.season === current.season) ?? catalog[0]!
verifySocialHead(await readFile(join(root, 'index.html'), 'utf8'), home)
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
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8')
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!)
assert(
  sitemapLocs.some((loc) => {
    try {
      const url = new URL(loc)
      return url.hostname === 'kitsu.wopian.me' && url.pathname === '/stats/'
    } catch {
      return false
    }
  }),
  'Missing https://kitsu.wopian.me/stats/ in sitemap loc entries',
)
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
