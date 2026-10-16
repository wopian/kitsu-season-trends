import { test, expect } from 'bun:test'
import { mergeAnimeHistory, archiveUpdates } from '../../cron/archives'
import {
  chartRows,
  type Anime,
  type AnimeArchive,
  type SeasonData,
} from '../../shared/trends'

const archive: AnimeArchive = {
  meta: { i: 12, t: 'One Piece' },
  data: [{ d: 24, w: 80, p: 1.25 }],
}
const anime: Anime = {
  i: 12,
  t: 'One Piece',
  u: 0,
  n: 0,
  d: [
    { d: 24, w: 70, p: 2 },
    { d: 72, w: 83, l: 85, f: 9 },
  ],
}

test('ID history merges seasons without changing existing observations', () => {
  const merged = mergeAnimeHistory(archive, anime)
  expect(merged.data).toEqual([archive.data[0]!, anime.d[1]!])
  expect(mergeAnimeHistory(merged, anime)).toEqual(merged)
  expect(archive.data).toHaveLength(1)
  expect(mergeAnimeHistory(undefined, anime).data).toEqual(anime.d)
})

test('daily archives combine shared season IDs once and replace only current day', async () => {
  let reads = 0
  const old = { ...archive, data: [...archive.data, { d: 73, l: 82, f: 8 }] }
  const current = { ...anime, d: [anime.d[0]!, { d: 74, l: 85, f: 10 }] }
  const document: SeasonData = { data: [current], meta: {}, updated: '' }
  const updates = await archiveUpdates(
    [document, document],
    async () => {
      reads++
      return old
    },
    new Date(74 * 36e5),
  )
  expect(reads).toBe(1)
  expect(updates).toHaveLength(1)
  expect(updates[0]!.path).toBe('data/id/12.json5')
  expect(updates[0]!.data.data).toEqual([archive.data[0]!, current.d[1]!])
  expect(old.data[1]!.d).toBe(73)
})

test('full ID chart handles historical Wilson and later Laplace in one timeline', () => {
  const merged = mergeAnimeHistory(archive, anime)
  expect(
    chartRows({ ...anime, d: merged.data }, 'auto').map((row) => row.rating),
  ).toEqual([80, null, 85])
  expect(
    chartRows({ ...anime, d: merged.data }, 'auto', 2).map((row) => row.rating),
  ).toEqual([null, 85])
})
