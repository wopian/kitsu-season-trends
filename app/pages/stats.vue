<script setup lang="ts">
import { IconDownload } from '@tabler/icons-vue'
import initialStats from '../../.generated/stats.json'
import { onaShare, seasonGrowth, seasonLabel, seasonOrder, statsTimeline, type SeasonStatsDocument, type SeasonStats } from '../../shared/season-stats'
import { seasonAt } from '../../shared/trends'

useHead({ title: 'Stats — Kitsu Season Trends', link: [{ rel: 'canonical', href: 'https://kitsu.wopian.me/stats/' }] })
useSeoMeta({ description: 'Seasonal anime counts, TV and ONA mix, ratings, and favourites across the Kitsu Season Trends archive.' })
const { data, loading, error, retry } = useStatsData()
const document = computed(() => data.value ?? initialStats as SeasonStatsDocument)
const years = computed(() => [...new Set(document.value.seasons.map((row) => row.year))])
const fromYear = ref(years.value[0] ?? 0)
const toYear = ref(years.value.at(-1) ?? 0)
const filtered = computed(() => document.value.seasons.filter((row) => row.year >= fromYear.value && row.year <= toYear.value))
const rows = computed(() => statsTimeline(filtered.value))
// Charts use decoded MessagePack; summaries and table remain available without it.
const chartRows = computed(() => statsTimeline((data.value?.seasons ?? []).filter((row) => row.year >= fromYear.value && row.year <= toYear.value)))
const latest = computed(() => document.value.seasons.at(-1))
const peak = computed(() => document.value.seasons.reduce<SeasonStats | undefined>((peak, row) => !peak || row.total > peak.total ? row : peak, undefined))
const latestGrowth = computed(() => latest.value ? seasonGrowth(latest.value, document.value.seasons) : { change: null, percent: null })
const current = seasonAt()
const inProgress = (row: SeasonStats) => row.year === current.year && row.season === current.season
const number = (value: number | null | undefined) => value == null ? '—' : value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
const percent = (value: number | null) => value === null ? '—' : `${value.toFixed(1)}%`
const change = (value: number | null) => value === null ? '—' : `${value > 0 ? '+' : ''}${number(value)}`
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Unavailable'
const charts = [
  { kind: 'counts', title: 'New and Leftovers' },
  { kind: 'mix', title: 'TV and ONA' },
  { kind: 'rating', title: 'Average rating' },
  { kind: 'audience', title: 'Ratings and favourites' },
] as const
</script>
<template>
  <div class="site-shell">
    <SiteHeader />
    <main class="stats-page">
      <div class="stats-page-heading">
        <div><h1>Season stats</h1><p class="stats-description">Counts, ratings, and audience across archived seasons.</p></div>
        <div class="stats-downloads">
          <a href="/stats.json" class="download-link"><IconDownload :size="16" aria-hidden="true" />JSON</a>
          <a href="/stats.msgpack" class="download-link"><IconDownload :size="16" aria-hidden="true" />MessagePack</a>
          <small>Updated {{ date(document.updated) }} · UTC</small>
        </div>
      </div>
      <section class="stats-summary" aria-label="Archive summary">
        <div><span>Archived seasons</span><strong>{{ number(document.seasons.length) }}</strong></div>
        <div><span>Unique anime</span><strong>{{ number(document.uniqueAnime) }}</strong></div>
        <div><span>Latest season total</span><strong>{{ number(latest?.total) }}</strong><p v-if="latest">{{ seasonLabel(latest.year, latest.season) }} <span v-if="inProgress(latest)" class="stats-progress">In progress</span></p><small>{{ change(latestGrowth.change) }} / {{ latestGrowth.percent === null ? '—' : `${latestGrowth.percent > 0 ? '+' : ''}${percent(latestGrowth.percent)}` }} vs previous quarter</small></div>
        <div><span>Peak season</span><strong>{{ number(peak?.total) }}</strong><NuxtLink v-if="peak" :to="`/${peak.year}/${peak.season}/`">{{ seasonLabel(peak.year, peak.season) }}</NuxtLink></div>
      </section>
      <div class="stats-notes">
        <p>Counts reflect archived entries and their New/Leftover flags. Some early seasons have incomplete coverage.</p>
        <p>Ratings and audience use each anime’s latest sample in its season archive. Snapshot dates and Wilson/Laplace methods differ between seasons. Audience totals count rating submissions and favourites, not distinct people.</p>
        <NuxtLink to="/ratings/">How ratings work</NuxtLink>
      </div>
      <section class="stats-filters" aria-label="Stats year range">
        <label>From year<select v-model.number="fromYear" aria-label="From year"><option v-for="year in years" :key="year" :value="year" :disabled="year > toYear">{{ year }}</option></select></label>
        <label>To year<select v-model.number="toYear" aria-label="To year"><option v-for="year in years" :key="year" :value="year" :disabled="year < fromYear">{{ year }}</option></select></label>
        <span>{{ filtered.length }} seasons</span>
        <button @click="fromYear = years[0] ?? 0; toYear = years.at(-1) ?? 0">All years</button>
      </section>
      <div v-if="error" class="error-banner" role="alert">{{ error }}. <button @click="retry">Retry stats</button></div>
      <p v-if="!document.seasons.length" class="empty-state">No archived seasons available.</p>
      <div v-else class="stats-chart-grid">
        <StatsChart v-for="chart in charts" :key="chart.kind" :kind="chart.kind" :title="chart.title" :rows="data ? chartRows : rows" :ready="!!data" :loading="loading" />
      </div>
      <section class="stats-season-table" aria-labelledby="stats-seasons-heading">
        <h2 id="stats-seasons-heading">Seasons</h2>
        <p>Changes compare the previous calendar quarter. Ratings exclude zero scores. All dates use UTC.</p>
        <div class="stats-table-scroll" tabindex="0" role="region" aria-label="Season statistics table">
          <table>
            <caption class="sr-only">Statistics per archived season, newest first</caption>
            <thead><tr><th scope="col">Season</th><th scope="col">TV</th><th scope="col">ONA</th><th scope="col">New</th><th scope="col">Leftovers</th><th scope="col">Total</th><th scope="col">ONA share</th><th scope="col">Change</th><th scope="col">Average rating</th><th scope="col">Scoring</th><th scope="col">Rating submissions</th><th scope="col">Favourites</th><th scope="col">Updated</th></tr></thead>
            <tbody>
              <tr v-for="row in [...filtered].reverse()" :key="seasonOrder(row.year, row.season)">
                <th scope="row"><NuxtLink :to="`/${row.year}/${row.season}/`">{{ seasonLabel(row.year, row.season) }}</NuxtLink><span v-if="inProgress(row)" class="stats-progress">In progress</span></th>
                <td>{{ number(row.tv) }}</td><td>{{ number(row.ona) }}</td><td>{{ number(row.new) }}</td><td>{{ number(row.leftovers) }}</td><td>{{ number(row.total) }}</td><td>{{ percent(onaShare(row)) }}</td>
                <td>{{ change(seasonGrowth(row, document.seasons).change) }}<small>{{ percent(seasonGrowth(row, document.seasons).percent) }}</small></td>
                <td>{{ row.averageRating === null ? '—' : `${row.averageRating.toFixed(2)}%` }}<small>{{ row.ratedAnime }} anime</small></td>
                <td>{{ row.scoringMethod }}</td><td>{{ number(row.ratingSubmissions) }}</td><td>{{ number(row.favourites) }}</td><td>{{ date(row.updated) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
