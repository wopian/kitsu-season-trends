<script setup lang="ts">
import { AreaChart, LineChart } from '#components'
import { metrics } from '../../shared/trends'
import type { StatsChartRow } from '../../shared/season-stats'

const props = defineProps<{
  kind: 'counts' | 'mix' | 'rating' | 'audience'
  title: string
  rows: StatsChartRow[]
  ready: boolean
  loading: boolean
}>()
const options = {
  counts: {
    new: { name: 'New', color: metrics[0]!.color },
    leftovers: { name: 'Leftovers', color: metrics[1]!.color },
  },
  mix: {
    tv: { name: 'TV', color: metrics[1]!.color },
    ona: { name: 'ONA', color: metrics[0]!.color },
  },
  rating: { averageRating: { name: 'Average rating', color: metrics[0]!.color } },
  audience: {
    ratingSubmissions: { name: 'Rating submissions', color: metrics[1]!.color },
    favourites: { name: 'Favourites', color: metrics[4]!.color },
  },
} as const
type SeriesKey = 'new' | 'leftovers' | 'tv' | 'ona' | 'averageRating' | 'ratingSubmissions' | 'favourites'
interface SeriesOption { key: SeriesKey; name: string; color: string }
const allSeries = computed<SeriesOption[]>(() => Object.entries(options[props.kind]).map(([key, item]) => ({ key: key as SeriesKey, name: item.name, color: item.color })))
const enabled = ref<SeriesKey[]>(allSeries.value.map((item) => item.key))
const selected = computed(() => allSeries.value.filter((item) => enabled.value.includes(item.key)))
const mode = ref('percent')
function toggle(key: SeriesKey) {
  enabled.value = enabled.value.includes(key) ? enabled.value.filter((item) => item !== key) : [...enabled.value, key]
}
const chartProps = computed(() => ({
  data: props.rows,
  categories: Object.fromEntries(selected.value.map((item) => [item.key, { name: item.name, color: item.color }])),
  height: 280,
  xAxis: 'date' as const,
  xFormatter: (tick: number | Date) => props.rows[Number(tick)]?.label ?? '',
  yFormatter: props.kind === 'rating'
    ? (tick: number | Date) => `${Number(tick).toFixed(0)}%`
    : props.kind === 'mix' && mode.value === 'percent'
      ? (tick: number | Date) => `${(Number(tick) * 100).toFixed(0)}%`
      : (tick: number | Date) => new Intl.NumberFormat('en-GB', { notation: 'compact' }).format(Number(tick)),
  yDomain: (props.kind === 'rating' ? [0, 100] : props.kind === 'mix' && mode.value === 'percent' ? [0, 1] : [0, undefined]) as [number, number | undefined],
  hideLegend: true,
  xNumTicks: 3,
  yNumTicks: 4,
  maxDataPoints: Math.max(props.rows.length, 1),
  lineWidth: 2.5,
  curveType: CurveType.Linear,
  ariaLabel: props.title,
  ...(props.kind === 'mix' ? { stacked: true, percent: mode.value === 'percent', gradient: false } : {}),
}))
const number = (value: number | null) => value === null ? 'Unavailable' : value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
function tooltipLines(row: StatsChartRow) {
  return selected.value.map((item) => ({
    ...item,
    value: props.kind === 'mix'
      ? `${number(row[item.key])} · ${row.record?.total ? ((row[item.key] ?? 0) / row.record.total * 100).toFixed(1) + '%' : 'Unavailable'}`
      : `${number(row[item.key])}${props.kind === 'rating' && row[item.key] !== null ? '%' : ''}`,
  }))
}
</script>
<template>
  <section class="stats-chart-card" :aria-label="title">
    <div class="stats-chart-heading">
      <h2>{{ title }}</h2>
      <div v-if="kind === 'mix'" class="segmented stats-mix-modes" role="group" aria-label="TV and ONA display">
        <button :aria-pressed="mode === 'percent'" @click="mode = 'percent'">Percentage</button>
        <button :aria-pressed="mode === 'counts'" @click="mode = 'counts'">Counts</button>
      </div>
    </div>
    <div class="stats-series" :role="kind === 'counts' || kind === 'audience' ? 'group' : undefined" :aria-label="`${title} series`">
      <template v-for="item in allSeries" :key="item.key">
        <button v-if="kind === 'counts' || kind === 'audience'" :aria-pressed="enabled.includes(item.key)" @click="toggle(item.key)">
          <span class="metric-swatch" :style="{ backgroundColor: item.color }" aria-hidden="true" />{{ item.name }}
        </button>
        <span v-else><span class="metric-swatch" :style="{ backgroundColor: item.color }" aria-hidden="true" />{{ item.name }}</span>
      </template>
    </div>
    <div class="stats-plot" :aria-busy="loading">
      <p v-if="!selected.length" class="stats-chart-placeholder">Select a series above.</p>
      <p v-else-if="!rows.some((row) => row.record)" class="stats-chart-placeholder">No seasons in this range.</p>
      <ClientOnly v-else-if="ready">
        <component :is="kind === 'mix' ? AreaChart : LineChart" v-bind="chartProps">
          <template #tooltip="{ values }">
            <div v-if="values?.record" class="stats-tooltip">
              <strong>{{ values.label }}</strong>
              <p v-for="item in tooltipLines(values)" :key="item.key"><span class="metric-swatch" :style="{ backgroundColor: item.color }" />{{ item.name }} <b>{{ item.value }}</b></p>
              <p v-if="kind === 'rating'">{{ values.record.scoringMethod }} · {{ values.record.ratedAnime }} contributing anime</p>
              <small v-if="values.record.updated">Updated {{ new Date(values.record.updated).toLocaleDateString('en-GB', { timeZone: 'UTC' }) }}</small>
            </div>
          </template>
        </component>
        <template #fallback><div class="stats-chart-placeholder">Loading chart…</div></template>
      </ClientOnly>
      <p v-else class="stats-chart-placeholder">{{ loading ? 'Loading chart…' : 'Chart data unavailable.' }}</p>
    </div>
  </section>
</template>
