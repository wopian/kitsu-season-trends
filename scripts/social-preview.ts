import { Resvg } from '@resvg/resvg-js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { escapeXml, seasonPreview, type SeasonPreview, type SocialPreviewCatalog } from '../shared/social-preview'
import type { SeasonData, SeasonInfo } from '../shared/trends'

const fonts = ['Inter-Regular.ttf', 'Inter-Bold.ttf', 'NotoSansJP-Regular.otf', 'NotoSansJP-Bold.otf'].map(
  (name) => fileURLToPath(new URL(`./assets/fonts/${name}`, import.meta.url)),
)
const options = { font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Inter' } }
export const checksum = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
export const xml = escapeXml

// Conservative Inter advances keep titles inside cards without system font metrics.
function textWidth(text: string) {
  return Array.from(text).reduce((width, char) => width + (
    /[\s.,:;'!|il]/.test(char) ? 5 : /[MW@%]/.test(char) || char.codePointAt(0)! > 0x2fff ? 18 : /[A-Z]/.test(char) ? 13 : 10
  ), 0)
}
export function wrapTitle(title: string, width = 204, limit = 3): string[] {
  let rest = title.replace(/\s+/g, ' ').trim()
  const lines: string[] = []
  while (rest && lines.length < limit) {
    const chars = Array.from(rest)
    let end = 0
    while (end < chars.length && textWidth(chars.slice(0, end + 1).join('')) <= width) end++
    if (end === chars.length) { lines.push(rest); break }
    if (lines.length === limit - 1) {
      while (end && textWidth(chars.slice(0, end).join('') + '…') > width) end--
      lines.push(chars.slice(0, end).join('').trimEnd() + '…')
      break
    }
    const space = chars.slice(0, end).lastIndexOf(' ')
    if (space > 0) end = space
    lines.push(chars.slice(0, end).join(''))
    rest = chars.slice(end).join('').trimStart()
  }
  return lines
}

export function previewSvg(model: SeasonPreview, posters: Map<number, string> = new Map()) {
  const counts = [
    ['Total', model.counts.total], ['TV', model.counts.tv], ['ONA', model.counts.ona],
    ['New', model.counts.new], ['Leftovers', model.counts.leftovers],
  ] as const
  const cards = model.anime.map((anime, index) => {
    const x = 56 + index * 368
    const poster = posters.get(anime.id)
    return `<g><rect x="${x}" y="376" width="352" height="188" rx="14" fill="#302630" stroke="#5a4659"/>
      <defs><clipPath id="poster-${index}"><rect x="${x + 12}" y="388" width="100" height="164" rx="8"/></clipPath></defs>
      ${poster ? `<image x="${x + 12}" y="388" width="100" height="164" preserveAspectRatio="xMidYMid slice" clip-path="url(#poster-${index})" href="${xml(poster)}"/>`
        : `<rect x="${x + 12}" y="388" width="100" height="164" rx="8" fill="#433443"/><text x="${x + 62}" y="482" text-anchor="middle" fill="#d65e43" font-size="42" font-weight="700">${index + 1}</text>`}
      <text x="${x + 128}" y="405" font-size="13" fill="#f58e72" font-weight="700">#${index + 1}</text>
      ${wrapTitle(anime.title).map((line, row) => `<text x="${x + 128}" y="${434 + row * 24}" fill="#f9eff5" font-size="18" font-weight="700">${xml(line)}</text>`).join('')}
      <text x="${x + 128}" y="542" fill="#f58e72" font-size="30" font-weight="700">${anime.rating.toFixed(2)}%</text></g>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img">
    <title>${xml(model.alt)}</title><desc>Season counts and highest-rated new anime from Kitsu.app.</desc>
    <rect width="1200" height="630" fill="#221b22"/><rect width="1200" height="7" fill="#d65e43"/>
    <g font-family="Inter, Noto Sans JP" letter-spacing="0">
    <text x="56" y="68" fill="#f9eff5" font-size="28" font-weight="700">Kitsu Season Trends</text>
    <text x="56" y="164" fill="#f9eff5" font-size="68" font-weight="700">${xml(model.title)}</text>
    <text x="1144" y="160" text-anchor="end" fill="${model.status === 'Archived' ? '#c7b2c3' : '#f58e72'}" font-size="22">${model.status}</text>
    <rect x="56" y="206" width="1088" height="104" rx="14" fill="#433443"/>
    ${counts.map(([label, count], index) => `<text x="${80 + index * 217}" y="251" fill="#f9eff5" font-size="32" font-weight="700">${count}</text><text x="${80 + index * 217}" y="284" fill="#c7b2c3" font-size="17">${label}</text>`).join('')}
    <text x="56" y="351" fill="#f9eff5" font-size="22" font-weight="700">Highest-rated new anime</text>
    ${cards || '<text x="56" y="460" fill="#c7b2c3" font-size="28">No rated new anime</text>'}
    <text x="56" y="605" fill="#c7b2c3" font-size="16">${model.updated ? `Snapshot ${model.updated} UTC` : 'Snapshot date unavailable'} · ${model.scoringMethod} rating</text>
    <text x="1144" y="605" text-anchor="end" fill="#c7b2c3" font-size="16">kitsu.wopian.me</text></g></svg>`
}

export function renderPreview(model: SeasonPreview, posters: Map<number, string> = new Map()) {
  const renderer = new Resvg(previewSvg(model, posters), options)
  // Resolve fonts to paths so SVG readers need no external fonts or network.
  const svg = renderer.toString().replace('<svg ', `<svg role="img" `)
    .replace(/(<svg[^>]*>)/, (tag) => `${tag}<title>${xml(model.alt)}</title>`)
  return { svg, png: renderer.render().asPng() }
}

function imageData(bytes: Uint8Array): string | null {
  const buffer = Buffer.from(bytes)
  const mime = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png'
    : buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image/jpeg'
    : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null
  if (!mime) return null
  const data = `data:${mime};base64,${buffer.toString('base64')}`
  try {
    const probe = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><image href="${data}" width="1" height="1"/></svg>`, { font: { loadSystemFonts: false } })
    if (!probe.innerBBox()) return null
    probe.render()
    return data
  } catch { return null }
}

export async function loadPoster(url: string, cacheDirectory = '.cache/social-posters', fetcher: typeof fetch = fetch) {
  await mkdir(cacheDirectory, { recursive: true })
  const path = join(cacheDirectory, checksum(url))
  const cached = await readFile(path).catch(() => null)
  if (cached) {
    const data = imageData(cached)
    if (data) return data
  }
  try {
    const response = await fetcher(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null
    if (Number(response.headers.get('content-length')) > 5 * 1024 * 1024) return null
    const reader = response.body?.getReader()
    if (!reader) return null
    const parts: Uint8Array[] = []
    let length = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        length += value.length
        if (length > 5 * 1024 * 1024) return null
        parts.push(value)
      }
    } finally { await reader.cancel().catch(() => {}) }
    const bytes = Buffer.concat(parts)
    const data = imageData(bytes)
    if (!data) return null
    await writeFile(path, bytes)
    return data
  } catch { return null }
}

export async function generateSocialPreviews(sources: { info: SeasonInfo; document: SeasonData }[], now = new Date()) {
  await mkdir('public/social', { recursive: true })
  const models = sources.map(({ info, document }) => seasonPreview(info, document, now))
  const urls = [...new Set(models.flatMap((model) => model.anime.map((anime) => anime.poster)))]
  const posters = new Map<string, string | null>()
  let cursor = 0
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++]!
      posters.set(url, await loadPoster(url))
    }
  }))
  const missing = [...posters.values()].filter((poster) => !poster).length
  if (missing) console.warn(`Social previews: ${missing} posters unavailable; using branded placeholders.`)
  const catalog: SocialPreviewCatalog = {}
  for (const model of models) {
    const images = new Map(model.anime.flatMap((anime) => {
      const poster = posters.get(anime.poster)
      return poster ? [[anime.id, poster] as const] : []
    }))
    const { svg, png } = renderPreview(model, images)
    const base = `/social/${model.key}`
    await writeFile(`public${base}.svg`, svg)
    await writeFile(`public${base}.png`, png)
    catalog[model.key] = { png: `${base}.png`, svg: `${base}.svg`, checksum: checksum(png), alt: model.alt }
  }
  await writeFile('.generated/social-previews.json', JSON.stringify(catalog))
  return catalog
}
