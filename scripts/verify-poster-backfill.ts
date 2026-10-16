import { strict as assert } from 'node:assert'
import JSON5 from 'json5'
import { animeSourceFiles, readDocument } from './data-files'
import type { SeasonData, AnimeArchive } from '../shared/trends'

function withoutPosters(document: SeasonData | AnimeArchive) {
  const copy = structuredClone(document)
  if ('i' in copy.meta) delete copy.meta.poster
  else for (const anime of (copy as SeasonData).data) delete anime.poster
  return copy
}
let verified = 0
for (const path of await animeSourceFiles()) {
  const name = path.replaceAll('\\', '/')
  const process = Bun.spawn(['git', 'show', `HEAD:${name}`], {
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const original = await new Response(process.stdout).text()
  assert.equal(await process.exited, 0, `Cannot read original archive ${name}`)
  const before = JSON5.parse(original) as SeasonData | AnimeArchive
  const after = await readDocument<SeasonData | AnimeArchive>(path)
  assert.deepEqual(
    withoutPosters(after),
    withoutPosters(before),
    `Historical data changed: ${name}`,
  )
  verified++
}
console.log(
  `Verified ${verified} archives against HEAD: only poster metadata differs.`,
)
