import { strict as assert } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const [previousDirectory, currentDirectory] = process.argv.slice(2)
assert(
  previousDirectory && currentDirectory,
  'Usage: bun scripts/check-immutable-assets.ts <previous-release> <current-release>',
)
type ReleaseManifest = { formatVersion: number; files: Record<string, string> }
const previous: ReleaseManifest = JSON.parse(
  await readFile(join(previousDirectory, 'release-manifest.json'), 'utf8'),
)
const current: ReleaseManifest = JSON.parse(
  await readFile(join(currentDirectory, 'release-manifest.json'), 'utf8'),
)
assert.equal(previous.formatVersion, 1)
assert.equal(current.formatVersion, 1)
let shared = 0
for (const [path, checksum] of Object.entries(current.files)) {
  if (
    !path.startsWith('_nuxt/') ||
    path === '_nuxt/builds/latest.json' ||
    previous.files[path] === undefined
  )
    continue
  assert.equal(
    checksum,
    previous.files[path],
    `Immutable asset collision: ${path}`,
  )
  shared++
}
console.log(
  `Verified immutable assets across builds: ${shared} shared paths retain identical bytes.`,
)
