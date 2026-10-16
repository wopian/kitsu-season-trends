import { test, expect } from 'bun:test'
import { mkdtemp, rm, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { seasonPreview } from '../../shared/social-preview'
import { isDailySeason, type SeasonData, type SeasonInfo } from '../../shared/trends'
import { checksum, loadPoster, previewSvg, renderPreview, wrapTitle, xml } from '../../scripts/social-preview'

const info: SeasonInfo = { year: 2026, season: 'winter', key: '2026-winter', label: 'Winter 2026' }
const now = new Date('2026-10-16T00:00:00Z')
const document: SeasonData = {
  meta: { total: 999 }, updated: '2026-03-30 22:00:00Z (GMT+0)', useLaplace: true,
  data: [
    { i: 6, t: 'Older sample is not latest', d: [{ d: 2, l: 75, w: 40 }, { d: 1, l: 99, w: 98 }] },
    { i: 4, t: 'ONA', u: 1, n: 1, poster: 'https://example.com/poster.png', d: [{ d: 2, l: 85, w: 50 }] },
    { i: 2, t: 'Legacy flags', d: [{ d: 2, l: 85, w: 95 }] },
    { i: 1, t: 'Leftover', n: 0, d: [{ d: 2, l: 100, w: 100 }] },
    { i: 7, t: 'Zero', d: [{ d: 2, l: 0, w: 0 }] },
    { i: 8, t: 'No samples', d: [] },
  ],
}

test('preview recounts all entries and ranks only rated New anime by latest seasonal score', () => {
  const original = structuredClone(document)
  const model = seasonPreview(info, document, now)
  expect(model.counts).toEqual({ total: 6, tv: 5, ona: 1, new: 5, leftovers: 1 })
  expect(model.anime.map((entry) => entry.id)).toEqual([2, 4, 6])
  expect(model.anime[2]!.rating).toBe(75)
  expect(model.anime[0]!.poster).toBe('https://media.kitsu.app/anime/poster_images/2/small.jpg')
  expect(model.anime[1]!.poster).toBe('https://example.com/poster.png')
  expect(model.updated).toBe('2026-03-30')
  expect(model.status).toBe('Archived')
  expect(model.scoringMethod).toBe('Laplace')
  expect(model.alt.length).toBeLessThanOrEqual(420)
  expect(seasonPreview(info, { ...document, useLaplace: false }, now).anime.map((entry) => entry.id)).toEqual([2, 4, 6])
  expect(seasonPreview(info, { ...document, useLaplace: false }, now).anime[0]!.rating).toBe(95)
  expect(document).toEqual(original)
})

test('daily status includes exactly current and previous quarters across year boundaries', () => {
  const january = new Date('2027-01-01T00:00:00Z')
  expect(isDailySeason({ year: 2027, season: 'winter' }, january)).toBe(true)
  expect(isDailySeason({ year: 2026, season: 'autumn' }, january)).toBe(true)
  expect(isDailySeason({ year: 2026, season: 'summer' }, january)).toBe(false)
  expect(isDailySeason({ year: 2027, season: 'spring' }, january)).toBe(false)
})

test('empty and unrated seasons have no invented ranking or snapshot date', () => {
  const model = seasonPreview(info, { data: [], meta: {}, updated: '' }, now)
  expect(model.anime).toEqual([])
  expect(model.updated).toBeNull()
  expect(model.counts.total).toBe(0)
  expect(previewSvg(model)).toContain('No rated new anime')
  expect(previewSvg(model)).toContain('Snapshot date unavailable')
})

test('SVG escapes titles and wraps long Unicode titles within three lines', () => {
  expect(xml('<script>"A&B"\u0000</script>')).toBe('&lt;script&gt;&quot;A&amp;B&quot;&lt;/script&gt;')
  expect(wrapTitle('Short title')).toEqual(['Short title'])
  const title = '日本語と非常に長いタイトル Very long sequel title with more words '.repeat(8)
  const lines = wrapTitle(title)
  expect(lines).toHaveLength(3)
  expect(lines[2]).toEndWith('…')
  const model = seasonPreview(info, { ...document, data: [{ i: 1, t: '<script>A&B $1 日本語</script>', d: [{ d: 1, l: 50 }] }] }, now)
  const svg = previewSvg(model)
  expect(svg).not.toContain('<script>')
  expect(svg).toContain('&lt;script&gt;')
  expect(svg).toContain('A&amp;B')
})

test('rendered preview is deterministic, self-contained SVG and 1200 by 630 PNG', () => {
  const model = seasonPreview(info, document, now)
  const first = renderPreview(model)
  const second = renderPreview(model)
  expect(first.svg).toBe(second.svg)
  expect(first.png).toEqual(second.png)
  expect(first.png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  expect(first.png.readUInt32BE(16)).toBe(1200)
  expect(first.png.readUInt32BE(20)).toBe(630)
  expect(first.svg).not.toContain('<text')
  expect(first.svg).not.toContain('font-family=')
  expect(first.svg).toContain('<title>')
  expect(new Resvg(first.svg, { font: { loadSystemFonts: false } }).width).toBe(1200)
  expect(checksum(first.png)).toBe(checksum(second.png))
})

test('poster loading embeds cached bytes and handles HTTP, corrupt images and download failures', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'kitsu-social-'))
  const png = new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="red"/></svg>').render().asPng()
  let calls = 0
  const fetcher = (async (_url: unknown, options: RequestInit) => {
    expect(options.signal).toBeInstanceOf(AbortSignal)
    calls++
    return new Response(png)
  }) as typeof fetch
  try {
    const url = 'https://example.com/poster.png'
    expect(await loadPoster(url, directory, fetcher)).toStartWith('data:image/png;base64,')
    expect(await loadPoster(url, directory, fetcher)).toStartWith('data:image/png;base64,')
    expect(calls).toBe(1)
    await writeFile(join(directory, checksum(url)), 'corrupt cache')
    expect(await loadPoster(url, directory, fetcher)).not.toBeNull()
    expect(calls).toBe(2)
    for (const response of [new Response('missing', { status: 404 }), new Response('not an image'), new Response(png.subarray(0, 12)), new Response('', { headers: { 'Content-Length': '99999999' } })]) {
      expect(await loadPoster(`https://example.com/${calls++}`, directory, (async () => response) as typeof fetch)).toBeNull()
    }
    expect(await loadPoster('https://example.com/timeout', directory, (async () => { throw new DOMException('Timed out', 'TimeoutError') }) as typeof fetch)).toBeNull()
    expect(await readdir(directory)).toHaveLength(1)
  } finally { await rm(directory, { recursive: true, force: true }) }
})
