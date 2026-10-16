<script setup lang="ts">
import { decode } from 'msgpack-lite'
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconDownload,
  IconWorld,
} from '@tabler/icons-vue'
import {
  metrics,
  seasons,
  seasonAt,
  selectAnime,
  parseUpdated,
  type Metric,
  type SeasonData,
  type Anime,
} from '../../shared/trends'
import { seasonCatalog, loadSummary } from '../composables/useSeasonData'

const route = useRoute()
const graphs = ref<Metric[]>(metrics.map((metric) => metric.key))
const sort = ref<Metric>('rating')
const search = ref('')
const filters = reactive({ tv: true, ona: true, new: true, old: false })
const filterGroups = [
  { label: 'Format', options: { tv: 'TV', ona: 'ONA' } },
  { label: 'Season status', options: { new: 'New', old: 'Leftovers' } },
] as const
const current = seasonAt()
const home =
  seasonCatalog.find(
    (item) => item.year === current.year && item.season === current.season,
  ) ?? seasonCatalog[0]!
const selected = computed(() =>
  route.params.year
    ? seasonCatalog.find(
        (item) =>
          item.year === Number(route.params.year) &&
          item.season ===
            (route.params.season === 'fall' ? 'autumn' : route.params.season),
      )
    : home,
)
if (!selected.value)
  throw createError({ statusCode: 404, statusMessage: 'Season not found' })
const key = computed(() => selected.value!.key)
const { data: summary } = await useAsyncData(
  () => `summary-${key.value}`,
  () => loadSummary(key.value),
)
const history = shallowRef<SeasonData | null>(null)
const error = ref('')
const loading = ref(true)
const cache = new Map<string, SeasonData>()
let controller: AbortController | undefined
let active = true
async function load() {
  controller?.abort()
  const request = new AbortController()
  controller = request
  const requestedKey = key.value
  history.value = cache.get(requestedKey) ?? null
  error.value = ''
  loading.value = !history.value
  if (history.value) return
  try {
    const response = await fetch(`/msgpack/${requestedKey}.msgpack`, {
      signal: request.signal,
      cache: 'no-cache',
    })
    if (!response.ok)
      throw new Error(`Data request failed (HTTP ${response.status})`)
    const document = decode(
      new Uint8Array(await response.arrayBuffer()),
    ) as SeasonData
    if (!Array.isArray(document.data) || !document.meta)
      throw new Error('Invalid season data')
    if (!request.signal.aborted && active && requestedKey === key.value) {
      cache.set(requestedKey, document)
      history.value = document
    }
  } catch (caught) {
    if (!request.signal.aborted && active)
      error.value =
        caught instanceof Error ? caught.message : 'Could not load season data'
  } finally {
    if (!request.signal.aborted && active) loading.value = false
  }
}
onMounted(load)
watch(key, () => {
  if (import.meta.client) {
    expanded.value = null
    load()
  }
})
onBeforeUnmount(() => {
  active = false
  controller?.abort()
})
const document = computed<SeasonData>(
  () =>
    history.value ?? {
      data: summary.value?.entries ?? [],
      meta: summary.value?.meta ?? {},
      updated: summary.value?.updated ?? '',
      useLaplace: summary.value?.useLaplace,
    },
)
const entries = computed(() =>
  selectAnime(
    document.value.data,
    sort.value,
    !!document.value.useLaplace,
    filters,
    search.value,
  ),
)
const timeBounds = computed(() => {
  let first = Infinity
  let last = -Infinity
  for (const anime of document.value.data)
    for (const point of anime.d) {
      first = Math.min(first, point.d * 36e5)
      last = Math.max(last, point.d * 36e5)
    }
  return {
    start: Number.isFinite(first)
      ? Math.floor(first / 864e5) * 864e5
      : undefined,
    end: Number.isFinite(last) ? Math.floor(last / 864e5) * 864e5 : undefined,
  }
})
const seasonIndex = computed(() =>
  seasonCatalog.findIndex((item) => item.key === key.value),
)
const yearOptions = [...new Set(seasonCatalog.map((item) => item.year))]
function navigate(year: number, season: string) {
  const target = seasonCatalog.find(
    (item) => item.year === year && item.season === season,
  )
  if (target) navigateTo(`/${target.year}/${target.season}`)
}
function changeYear(year: number) {
  navigate(
    year,
    seasonCatalog.find(
      (item) => item.year === year && item.season === selected.value!.season,
    )?.season ?? seasonCatalog.find((item) => item.year === year)!.season,
  )
}
const updated = computed(() => {
  const date = parseUpdated(document.value.updated)
  return date
    ? date.toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }) + ' UTC'
    : 'Update time unavailable'
})
const expanded = ref<number | null>(null)
const expandedAnime = computed<Anime | undefined>(() =>
  document.value.data.find((item) => item.i === expanded.value),
)
const {
  archive: animeArchive,
  loading: animeHistoryLoading,
  error: animeHistoryError,
  retry: retryAnimeHistory,
} = useAnimeHistory(expanded)
const fullHistoryAnime = computed<Anime | undefined>(() =>
  expandedAnime.value && animeArchive.value
    ? {
        ...expandedAnime.value,
        ...animeArchive.value.meta,
        d: animeArchive.value.data,
      }
    : undefined,
)
const recordedRange = computed(() => {
  const points = fullHistoryAnime.value?.d
  if (!points?.length) return ''
  const format = (hours: number) =>
    new Date(hours * 36e5).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  return `${format(points[0]!.d)} – ${format(points.at(-1)!.d)} · ${points.length.toLocaleString('en-GB')} observations`
})
const dialogOpen = computed({
  get: () => expanded.value !== null,
  set: (value) => {
    if (!value) expanded.value = null
  },
})
const days = ref('0')
const weeklyHistory = computed(() => days.value === '0' && (fullHistoryAnime.value?.d.length ?? 0) > 90)
let historyReturnFocus: HTMLElement | null = null
function expandAnime(id: number, event: MouseEvent) {
  const card = event.currentTarget as HTMLElement
  historyReturnFocus = (event.target as Element).closest<HTMLElement>('button')
    ?? card.querySelector<HTMLElement>('.title-button')
  expanded.value = id
  days.value = '0'
}
function restoreHistoryFocus(event: Event) {
  event.preventDefault()
  if (historyReturnFocus?.isConnected)
    historyReturnFocus.focus({ preventScroll: true })
  historyReturnFocus = null
}
const canonical = computed(
  () =>
    `https://kitsu.wopian.me/${selected.value!.year}/${selected.value!.season}/`,
)
useHead(() => ({
  title: `${selected.value!.label} — Kitsu Season Trends`,
  link: [{ rel: 'canonical', href: canonical.value }],
}))
useSeoMeta({
  ogTitle: () => `${selected.value!.label} — Kitsu Season Trends`,
  ogUrl: () => canonical.value,
  ogType: 'website',
  description: () =>
    `Explore ${selected.value!.label} anime ratings, votes and favourites. Updated daily from Kitsu.app.`,
})
</script>
<template>
  <div class="site-shell">
    <SiteHeader />
    <main>
      <section class="season-hero" aria-labelledby="season-heading">
        <div class="hero-copy">
          <h1 id="season-heading">
            {{ selected!.label }}
          </h1>
        </div>
        <div class="season-console">
          <div class="console-header">
            <span>Season</span
            ><select
              aria-label="Year"
              :value="selected!.year"
              @change="
                changeYear(Number(($event.target as HTMLSelectElement).value))
              "
            >
              <option v-for="year in yearOptions" :key="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="season-buttons" role="group" aria-label="Season">
            <button
              v-for="season in seasons"
              :key="season"
              :aria-pressed="selected!.season === season"
              :disabled="
                !seasonCatalog.some(
                  (item) =>
                    item.year === selected!.year && item.season === season,
                )
              "
              @click="navigate(selected!.year, season)"
            >
              {{ season }}
            </button>
          </div>
          <div class="season-step">
            <button
              aria-label="Previous available season"
              :disabled="seasonIndex >= seasonCatalog.length - 1"
              @click="
                navigate(
                  seasonCatalog[seasonIndex + 1]!.year,
                  seasonCatalog[seasonIndex + 1]!.season,
                )
              "
            >
              <IconChevronLeft :size="18" /> Previous</button
            ><span>{{ document.meta.total ?? 0 }} anime tracked</span
            ><button
              aria-label="Next available season"
              :disabled="seasonIndex <= 0"
              @click="
                navigate(
                  seasonCatalog[seasonIndex - 1]!.year,
                  seasonCatalog[seasonIndex - 1]!.season,
                )
              "
            >
              Next <IconChevronRight :size="18" />
            </button>
          </div>
        </div>
      </section>
      <SeasonOverview :document="document" :history-ready="!!history" />
      <section class="control-panel" aria-label="Chart and ranking controls">
        <div class="metric-row">
          <span class="control-label">Graphs</span>
          <GraphToggles v-model="graphs" />
        </div>
        <div class="metric-row">
          <span class="control-label">Sort by</span>
          <div class="sort-buttons" role="group" aria-label="Sort metric">
            <button
              v-for="metric in metrics"
              :key="metric.key"
              :aria-pressed="sort === metric.key"
              @click="sort = metric.key"
            >
              <span
                class="metric-swatch"
                :style="{ backgroundColor: metric.color }"
                aria-hidden="true"
              />
              {{ metric.label }}
            </button>
          </div>
        </div>
        <div class="filter-row">
          <div class="metric-row filter-controls">
            <span class="control-label">Filter by</span>
            <div class="filter-groups">
              <template v-for="(group, index) in filterGroups" :key="group.label">
                <span v-if="index" class="filter-divider" aria-hidden="true">/</span>
                <div class="filter-buttons" role="group" :aria-label="group.label">
                  <button
                    v-for="(label, filter) in group.options"
                    :key="filter"
                    :aria-pressed="filters[filter]"
                    @click="filters[filter] = !filters[filter]"
                  >
                    {{ label }}
                  </button>
                </div>
              </template>
            </div>
          </div>
          <label class="search"
            ><IconSearch :size="18" /><input
              v-model="search"
              type="search"
              placeholder="Find an anime…"
              aria-label="Find an anime"
          /></label>
        </div>
      </section>
      <div class="grid-heading">
        <div>
          <h2>
            Anime
            <span class="muted">/ {{ entries.length }} anime</span>
          </h2>
        </div>
        <div class="update-status">
          <span :class="{ 'live-dot': !error }" />{{
            loading ? 'Loading season history…' : 'Updated daily'
          }}<small>{{ updated }}</small>
        </div>
      </div>
      <div v-if="error" class="error-banner" role="alert">
        {{ error }}. Showing last available summaries.
        <button @click="load">Retry</button>
      </div>
      <div v-if="!entries.length" class="empty-state">
        <h2>No anime match these filters.</h2>
        <p>Change filters or try another title.</p>
      </div>
      <div v-else class="anime-grid" :aria-busy="loading">
        <AnimeCard
          v-for="(anime, index) in entries"
          :key="`${key}-${anime.i}`"
          :anime="anime"
          :rank="index + 1"
          :metrics="graphs"
          :use-laplace="!!document.useLaplace"
          :start="timeBounds.start"
          :end="timeBounds.end"
          :history-ready="!!history"
          @expand="expandAnime(anime.i, $event)"
        />
      </div>
    </main>
    <footer>
      <div>
        <p>
          Data from <a href="https://kitsu.app" class="kitsu-link"><IconWorld :size="14" aria-hidden="true" />Kitsu.app</a>. Collected daily
          at 22:00 UTC.
        </p>
      </div>
      <div class="downloads">
        <a :href="`/data/${key}.json`" class="download-link"><IconDownload :size="16" aria-hidden="true" />Download JSON</a
        ><a :href="`/msgpack/${key}.msgpack`" class="download-link"><IconDownload :size="16" aria-hidden="true" />Download MessagePack</a
        ><span
          >{{ document.useLaplace ? 'Laplace' : 'Wilson' }} rating ·
          <NuxtLink to="/ratings/">How ratings work</NuxtLink></span
        >
      </div>
    </footer>
    <UModal
      v-model:open="dialogOpen"
      :title="expandedAnime?.t ?? 'Anime history'"
      description="Rating, favourites and vote history across all seasons"
      :ui="{ content: 'max-w-5xl', body: 'min-h-0', footer: 'shrink-0' }"
      :content="{ onCloseAutoFocus: restoreHistoryFocus }"
      ><template #body
        ><div v-if="expandedAnime" class="detail-body">
          <div class="detail-controls">
            <GraphToggles v-model="graphs" label="Expanded graph metrics" />
            <label
              >Range
              <select v-model="days" aria-label="History range">
                <option value="0">Full history</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select></label
            ><a
              :href="`https://kitsu.app/anime/${expandedAnime.i}`"
              target="_blank"
              rel="noopener noreferrer"
              class="kitsu-link"
              ><IconWorld :size="16" aria-hidden="true" />Kitsu.app</a
            >
          </div>
          <p
            v-if="recordedRange"
            class="muted"
            aria-label="Recorded history range"
          >
            {{ recordedRange }}
          </p>
          <div v-if="animeHistoryError" class="error-banner" role="alert">
            {{ animeHistoryError }}.
            <button @click="retryAnimeHistory">Retry anime history</button>
          </div>
          <p v-else-if="animeHistoryLoading" role="status">
            Loading anime history…
          </p>
          <TrendChart
            v-else-if="fullHistoryAnime && graphs.length"
            :anime="fullHistoryAnime"
            :metrics="graphs"
            use-laplace="auto"
            :days="Number(days)"
            :weekly="weeklyHistory"
            :height="360"
          />
          <p v-else-if="!graphs.length">Select graph metrics above.</p>
        </div></template
      >
      <template #footer>
        <div v-if="expandedAnime" class="history-footer">
          <div class="history-notes">
            <p class="history-sampling">
              <strong>{{ weeklyHistory ? 'Weekly maxima' : 'Daily samples' }}</strong>
              <span>{{ weeklyHistory ? 'ISO weeks: Monday–Sunday (UTC)' : 'Dates use UTC' }}</span>
            </p>
            <p>
              Gaps mark missing {{ weeklyHistory ? 'weeks' : 'days' }}.
              Changes compare recorded samples.
            </p>
          </div>
          <div class="history-downloads" role="group" aria-labelledby="history-downloads-title">
            <p id="history-downloads-title">Download full history</p>
            <div class="history-download-links">
              <a :href="`/data/id/${expandedAnime.i}.json`" class="download-link" aria-label="Download anime JSON"><IconDownload :size="16" aria-hidden="true" />JSON</a>
              <a :href="`/msgpack/id/${expandedAnime.i}.msgpack`" class="download-link" aria-label="Download anime MessagePack"><IconDownload :size="16" aria-hidden="true" />MessagePack</a>
            </div>
            <p class="history-download-hint">All recorded samples</p>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
