import { isDailySeason, parseUpdated, posterFor, score, type SeasonData, type SeasonInfo } from './trends'
import { seasonCounts } from './season-stats'

export interface SocialPreviewAsset {
  png: string
  svg: string
  checksum: string
  alt: string
}
export type SocialPreviewCatalog = Record<string, SocialPreviewAsset>
export const socialImageUrl = (asset: SocialPreviewAsset) => `https://kitsu.wopian.me${asset.png}?v=${asset.checksum.slice(0, 16)}`
export const escapeXml = (text: string) => text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

// Static fall aliases are redirect documents, so Vue head metadata never renders there.
export function aliasSocialHead(info: SeasonInfo, asset: SocialPreviewAsset) {
  const title = `${info.label} — Kitsu Season Trends`
  const canonical = `https://kitsu.wopian.me/${info.year}/${info.season}/`
  const image = socialImageUrl(asset)
  const openGraph = {
    'og:title': title, 'og:type': 'website', 'og:site_name': 'Kitsu Season Trends', 'og:url': canonical,
    'og:image': image, 'og:image:width': '1200', 'og:image:height': '630', 'og:image:type': 'image/png', 'og:image:alt': asset.alt,
  }
  const twitter = { 'twitter:card': 'summary_large_image', 'twitter:image': image, 'twitter:image:alt': asset.alt }
  return `<title>${escapeXml(title)}</title><link rel="canonical" href="${canonical}">`
    + Object.entries(openGraph).map(([property, content]) => `<meta property="${property}" content="${escapeXml(content)}">`).join('')
    + Object.entries(twitter).map(([name, content]) => `<meta name="${name}" content="${escapeXml(content)}">`).join('')
}

export function seasonPreview(info: SeasonInfo, document: SeasonData, now = new Date()) {
  const anime = document.data
    .filter((entry) => (entry.n ?? 1) === 1)
    .map((entry) => {
      const latest = entry.d.reduce<(typeof entry.d)[number] | undefined>(
        (last, point) => !last || point.d > last.d ? point : last, undefined,
      )
      return {
        id: entry.i, title: entry.t, rating: latest ? score(latest, !!document.useLaplace) : 0,
        poster: posterFor(entry),
      }
    })
    .filter((entry) => Number.isFinite(entry.rating) && entry.rating > 0)
    .sort((a, b) => b.rating - a.rating || a.id - b.id)
    .slice(0, 3)
  const counts = seasonCounts(document.data)
  const updated = parseUpdated(document.updated)?.toISOString().slice(0, 10) ?? null
  const scoringMethod = document.useLaplace ? 'Laplace' : 'Wilson'
  const status = isDailySeason(info, now) ? 'Updated daily' : 'Archived'
  const alt = Array.from([
    `Kitsu Season Trends: ${info.label}.`,
    `${counts.total} anime: ${counts.tv} TV, ${counts.ona} ONA, ${counts.new} New, ${counts.leftovers} Leftovers.`,
    `${status}. Snapshot ${updated ?? 'date unavailable'}. ${scoringMethod} rating.`,
    anime.length ? `Highest-rated new anime: ${anime.map((entry) => `${entry.title} (${entry.rating.toFixed(2)}%)`).join('; ')}.` : 'No rated new anime.',
  ].join(' ')).slice(0, 420).join('')
  return { key: info.key, title: info.label, counts, anime, updated, scoringMethod, status, alt }
}
export type SeasonPreview = ReturnType<typeof seasonPreview>
