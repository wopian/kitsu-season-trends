<script setup lang="ts">
import { metrics, score, type SeasonData } from '../../shared/trends'
import { seasonCounts } from '../../shared/season-stats'
const props = defineProps<{ document: SeasonData; historyReady: boolean }>()
const counts = computed(() => seasonCounts(props.document.data))
const averages = computed(() => {
  const days = new Map<number, { new: number[]; old: number[] }>()
  for (const anime of props.document.data)
    for (const point of anime.d) {
      const day = Math.floor(point.d / 24) * 864e5
      const group = days.get(day) ?? { new: [], old: [] }
      const rating = score(point, props.document.useLaplace)
      if (rating > 0) group[(anime.n ?? 1) === 1 ? 'new' : 'old'].push(rating)
      days.set(day, group)
    }
  return [...days]
    .sort(([a], [b]) => a - b)
    .map(([date, groups]) => ({
      date,
      new: groups.new.length
        ? groups.new.reduce((a, b) => a + b, 0) / groups.new.length
        : null,
      old: groups.old.length
        ? groups.old.reduce((a, b) => a + b, 0) / groups.old.length
        : null,
    }))
})
const categories = {
  new: { name: 'New anime', color: metrics[0]!.color },
  old: { name: 'Leftovers', color: metrics[1]!.color },
}
</script>
<template>
  <section class="overview" aria-labelledby="overview-heading">
    <h2 id="overview-heading">Season overview</h2>
    <div class="overview-body">
      <div class="overview-counts">
        <p>
          <strong>{{ counts.tv }}</strong>
          TV
        </p>
        <p>
          <strong>{{ counts.ona }}</strong>
          ONA
        </p>
        <p>
          <strong>{{ counts.new }}</strong> New
        </p>
        <p>
          <strong>{{ counts.leftovers }}</strong>
          Leftovers
        </p>
      </div>
      <div class="overview-chart">
        <h3>Average rating</h3>
        <ClientOnly
          ><LineChart
            v-if="historyReady"
            :data="averages"
            :categories="categories"
            x-axis="date"
            :height="190"
            :y-domain="[0, 100]"
            :x-formatter="
              (tick: number | Date) =>
                new Date(
                  averages[Number(tick)]?.date ?? Number(tick),
                ).toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })
            "
            :y-formatter="
              (tick: number | Date) => `${Number(tick).toFixed(1)}%`
            " />
          <div
            v-else
            class="chart-placeholder"
            aria-label="Season history loading"
        /></ClientOnly>
      </div>
    </div>
  </section>
</template>
