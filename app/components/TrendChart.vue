<script setup lang="ts">
import {
  chartRows,
  weeklyChartRows,
  metrics as metricOptions,
  formatValue,
  type Anime,
  type Metric,
} from '../../shared/trends'
const props = defineProps<{
  anime: Anime
  metrics: Metric[]
  useLaplace: boolean | 'auto'
  height?: number
  days?: number
  weekly?: boolean
  start?: number
  end?: number
}>()
const points = computed(() =>
  props.weekly
    ? weeklyChartRows(props.anime, props.useLaplace)
    : chartRows(props.anime, props.useLaplace, props.days, props.end, props.start),
)
const spansYear = computed(() =>
  (points.value.at(-1)?.date ?? 0) - (points.value[0]?.date ?? 0) > 365 * 864e5,
)
const enabledMetrics = computed(() =>
  metricOptions.filter((metric) => props.metrics.includes(metric.key)),
)
const categories = computed(() =>
  Object.fromEntries(
    enabledMetrics.value.map((metric) => [
      metric.key,
      {
        name: metric.label,
        color: metric.color,
        yAxis: metric.key === 'rating' ? 'rating' : 'counts',
      },
    ]),
  ),
)
const axes = computed(() => {
  const hasRating = props.metrics.includes('rating')
  const hasCounts = props.metrics.some((metric) => metric !== 'rating')
  return {
    ...(hasRating
      ? {
          rating: {
            orientation: 'left' as const,
            domain: [0, 100] as [number, number],
            formatter: (tick: number | Date) => `${Number(tick)}%`,
            numTicks: 3,
          },
        }
      : {}),
    ...(hasCounts
      ? {
          counts: {
            orientation: hasRating ? ('right' as const) : ('left' as const),
            domain: [0, undefined] as [number, undefined],
            formatter: (tick: number | Date) =>
              formatValue(Number(tick), 'r', true),
            numTicks: 3,
          },
        }
      : {}),
  }
})
const xFormatter = (tick: number | Date) =>
  new Date(points.value[Number(tick)]?.date ?? Number(tick)).toLocaleDateString(
    'en-GB',
    spansYear.value
      ? { year: 'numeric', month: 'short', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', timeZone: 'UTC' },
  )
</script>
<template>
  <div
    class="chart-frame"
    :style="{ height: `${height ?? 150}px` }"
    :aria-label="`${enabledMetrics.map((metric) => metric.label).join(', ')} history for ${anime.t}`"
    role="img"
  >
    <ClientOnly>
      <LineChart
        :data="points"
        :height="height ?? 150"
        :categories="categories"
        :max-data-points="Math.max(points.length, 1)"
        x-axis="date"
        :y-axes="axes"
        :x-formatter="xFormatter"
        :tooltip-title-formatter="
          (row) =>
            `${weekly ? 'Week of ' : ''}${new Date(row.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}`
        "
        :hide-legend="true"
        :x-num-ticks="3"
        :y-num-ticks="3"
        :line-width="2.5"
        :y-grid-line="true"
        :curve-type="CurveType.Linear"
      />
      <template #fallback><div class="chart-placeholder" /></template>
    </ClientOnly>
  </div>
</template>
