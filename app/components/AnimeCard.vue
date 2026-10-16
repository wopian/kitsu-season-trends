<script setup lang="ts">
import { IconWorld } from '@tabler/icons-vue'
import {
  posterFor,
  metrics as metricOptions,
  value,
  formatValue,
  type Anime,
  type Metric,
} from '../../shared/trends'
const props = defineProps<{
  anime: Anime
  rank: number
  metrics: Metric[]
  useLaplace: boolean
  start?: number
  end?: number
  historyReady: boolean
}>()
defineEmits<{ expand: [event: MouseEvent] }>()
const root = ref<HTMLElement>()
const visible = ref(false)
const failedPoster = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        visible.value = true
        observer?.disconnect()
      }
    },
    { rootMargin: '250px' },
  )
  if (root.value) observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())
const statistics = computed(() =>
  metricOptions
    .filter((metric) => props.metrics.includes(metric.key))
    .map((metric) => {
      const current = value(props.anime.d.at(-1), metric.key, props.useLaplace)
      const delta =
        props.anime.d.length > 1
          ? current - value(props.anime.d.at(-2), metric.key, props.useLaplace)
          : null
      return { ...metric, current, delta }
    }),
)
</script>
<template>
  <article ref="root" class="anime-card" @click="$emit('expand', $event)">
    <div class="card-top">
      <div class="poster">
        <img
          v-if="!failedPoster"
          :src="posterFor(anime)"
          :alt="`${anime.t} poster`"
          loading="lazy"
          width="88"
          height="124"
          @error="failedPoster = true"
        /><span v-else aria-hidden="true">{{ anime.t.slice(0, 1) }}</span>
      </div>
      <div class="anime-info">
        <div class="card-label">
          <span class="rank">#{{ rank.toString().padStart(2, '0') }}</span
          ><span>{{ anime.u === 1 ? 'ONA' : 'TV' }}</span
          ><span class="status">{{
            (anime.n ?? 1) === 1 ? 'New' : 'Leftover'
          }}</span>
        </div>
        <h2>
          <button
            class="title-button"
            :aria-label="`Expand chart for ${anime.t}`"
            aria-haspopup="dialog"
          >
            {{ anime.t }}
          </button>
        </h2>
        <a
          :href="`https://kitsu.app/anime/${anime.i}`"
          target="_blank"
          rel="noopener noreferrer"
          class="external kitsu-link"
          @click.stop
          ><IconWorld :size="14" aria-hidden="true" />Kitsu.app</a
        >
      </div>
    </div>
    <div class="card-metrics">
      <div
        v-for="metric in statistics"
        :key="metric.key"
        class="card-statistic"
        :data-metric="metric.key"
      >
        <span class="statistic-label"
          ><span
            class="metric-swatch"
            :style="{ backgroundColor: metric.color }"
            aria-hidden="true"
          />{{ metric.label }}</span
        >
        <strong>{{ formatValue(metric.current, metric.key, true) }}</strong>
        <span
          v-if="metric.delta !== null"
          class="delta"
          :class="{ negative: metric.delta < 0 }"
          title="Change since previous sample"
          >{{ metric.delta > 0 ? '+' : ''
          }}{{
            metric.key === 'rating'
              ? `${metric.delta.toFixed(2)} pp`
              : formatValue(metric.delta, metric.key, true)
          }}</span
        >
        <span v-else class="muted">First sample</span>
      </div>
    </div>
    <TrendChart
      v-if="visible && historyReady && metrics.length"
      :anime="anime"
      :metrics="metrics"
      :use-laplace="useLaplace"
      :start="start"
      :end="end"
    />
    <p v-else-if="!metrics.length" class="no-graphs">
      Select graph metrics above.
    </p>
    <div
      v-else
      class="chart-placeholder"
      aria-label="Chart loads when visible"
    />
    <button class="expand-button" aria-haspopup="dialog">
      Explore history <span aria-hidden="true">↗</span>
    </button>
  </article>
</template>
