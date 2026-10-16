import { readFile } from 'node:fs/promises'
import { aliasSocialHead, type SocialPreviewCatalog } from './shared/social-preview'
import type { SeasonInfo } from './shared/trends'

const catalog = JSON.parse(
  await readFile(new URL('./.generated/catalog.json', import.meta.url), 'utf8'),
) as SeasonInfo[]
const socialPreviews: SocialPreviewCatalog = JSON.parse(
  await readFile(new URL('./.generated/social-previews.json', import.meta.url), 'utf8'),
)
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-10-16',
  modules: ['@nuxt/ui', 'nuxt-charts'],
  nuxtCharts: { include: ['LineChart', 'AreaChart'], global: false },
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  typescript: { strict: true },
  experimental: { entryImportMap: false },
  // Keep server externals absolute so Nitro resolves shared TypeScript on Windows.
  vite: {
    build: { rolldownOptions: { makeAbsoluteExternalsRelative: false } },
  },
  ui: { fonts: false },
  colorMode: { preference: 'system', fallback: 'light' },
  nitro: {
    hooks: {
      'prerender:generate'(route) {
        const alias = /^\/(\d{4})\/fall\/?$/.exec(route.route)
        if (!alias || !route.contents) return
        const info = catalog.find((item) => item.year === Number(alias[1]) && item.season === 'autumn')
        if (info) route.contents = route.contents.replace('</head>', `${aliasSocialHead(info, socialPreviews[info.key]!)}</head>`)
      },
    },
    prerender: {
      routes: [
        '/',
        '/ratings',
        '/stats',
        ...catalog.flatMap((item) => [
          `/${item.year}/${item.season}`,
          ...(item.season === 'autumn' ? [`/${item.year}/fall`] : []),
        ]),
      ],
      crawlLinks: false,
      autoSubfolderIndex: true,
      failOnError: true,
      concurrency: 2,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'Kitsu Season Trends',
      meta: [
        {
          name: 'description',
          content: 'Daily anime ratings, votes and favourites from Kitsu.app.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
  },
})
