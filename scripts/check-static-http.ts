import { strict as assert } from 'node:assert'
import { decode } from 'msgpack-lite'
import { createHash } from 'node:crypto'
const base = process.argv[2] ?? 'http://127.0.0.1:4173'
const manifest = (await (
  await fetch(`${base}/release-manifest.json`)
).json()) as { routes: string[]; files: Record<string, string> }
for (const route of manifest.routes) {
  const response = await fetch(`${base}${route === '/' ? '/' : `${route}/`}`)
  assert.equal(response.status, 200, route)
  assert((await response.text()).includes('<h1'), route)
}
for (const path of Object.keys(manifest.files).filter(
  (path) => path.startsWith('_nuxt/') || path.startsWith('msgpack/') || path.startsWith('social/'),
)) {
  const response = await fetch(`${base}/${path}`)
  assert.equal(response.status, 200, path)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (path.startsWith('social/')) {
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.files[path], path)
    assert(response.headers.get('content-type')?.includes(path.endsWith('.svg') ? 'image/svg+xml' : 'image/png'), path)
  }
}
const notFound = await fetch(`${base}/2099/not-a-season/`)
const [stats, statsAlias] = await Promise.all(['/stats.msgpack', '/msgpack/stats.msgpack'].map(async (path) => {
  const response = await fetch(`${base}${path}`)
  assert.equal(response.status, 200, path)
  return decode(new Uint8Array(await response.arrayBuffer()))
}))
assert.deepEqual(stats, statsAlias)
const season = manifest.routes.find((route) => /^\/\d{4}\//.test(route))
const anime = Object.keys(manifest.files).find((path) => /^msgpack\/id\/\d+\.msgpack$/.test(path))
assert(season && anime)
const removed = [
  '/stats.json',
  '/data/stats.json',
  `/data/${season.slice(1).replace('/', '-')}.json`,
  `/${anime.replace('msgpack/', 'data/').replace('.msgpack', '.json')}`,
  `${season}/_payload.json`,
]
for (const path of removed) {
  assert.equal((await fetch(`${base}${path}`)).status, 404, path)
}
assert.equal(notFound.status, 404)
assert((await notFound.text()).includes('Season not found'))
for (const route of manifest.routes.filter((route) => route.endsWith('/autumn'))) {
  const alias = await fetch(`${base}${route.replace('/autumn', '/fall')}/`)
  assert.equal(alias.status, 200)
  assert((await alias.text()).includes(`url=${route}`), `Wrong autumn alias: ${route}`)
}
console.log(
  `HTTP checks passed: ${manifest.routes.length} routes, client assets, social previews, MessagePack downloads, and real 404.`,
)
