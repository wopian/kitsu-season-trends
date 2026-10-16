import { strict as assert } from 'node:assert'
import { decode } from 'msgpack-lite'
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
  (path) => path.startsWith('_nuxt/') || path.startsWith('msgpack/'),
)) {
  const response = await fetch(`${base}/${path}`)
  assert.equal(response.status, 200, path)
  await response.arrayBuffer()
}
const notFound = await fetch(`${base}/2099/not-a-season/`)
const statsResponses = await Promise.all(['/stats.json', '/data/stats.json', '/stats.msgpack', '/msgpack/stats.msgpack'].map((path) => fetch(`${base}${path}`)))
for (const response of statsResponses) assert.equal(response.status, 200, response.url)
const [stats, statsAlias] = await Promise.all(statsResponses.slice(0, 2).map((response) => response.json()))
assert.deepEqual(stats, statsAlias)
for (const response of statsResponses.slice(2)) assert.deepEqual(decode(new Uint8Array(await response.arrayBuffer())), stats)
assert.equal(notFound.status, 404)
assert((await notFound.text()).includes('Season not found'))
for (const route of manifest.routes.filter((route) => route.endsWith('/autumn'))) {
  const alias = await fetch(`${base}${route.replace('/autumn', '/fall')}/`)
  assert.equal(alias.status, 200)
  assert((await alias.text()).includes(`url=${route}`), `Wrong autumn alias: ${route}`)
}
console.log(
  `HTTP checks passed: ${manifest.routes.length} routes, client assets, MessagePack downloads, and real 404.`,
)
