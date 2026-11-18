<script setup lang="ts">
import { IconArrowUpRight } from '@tabler/icons-vue'
import { formatValue, value, type Anime, type Metric } from '../../shared/trends'

const props = defineProps<{
  anime: Anime
  rank: number
  metric: { key: Metric; label: string }
  useLaplace: boolean
}>()
defineEmits<{ expand: [event: MouseEvent] }>()

const score = computed(() =>
  formatValue(value(props.anime.d.at(-1), props.metric.key, props.useLaplace), props.metric.key),
)
</script>

<template>
  <li class="ranking-entry">
    <button
      class="ranking-trigger"
      type="button"
      aria-haspopup="dialog"
      :aria-label="`Explore history for ${anime.t}`"
      :aria-describedby="`rank-${anime.i} meta-${anime.i} score-${anime.i}`"
      @click="$emit('expand', $event)"
    >
      <AnimePoster :anime="anime" decorative :priority="rank === 1" />
      <span :id="`rank-${anime.i}`" class="ranking-position">#{{ rank }}</span>
      <span class="ranking-copy">
        <span class="ranking-title">{{ anime.t }}</span>
        <span :id="`meta-${anime.i}`" class="ranking-meta">{{ anime.u === 1 ? 'ONA' : 'TV' }} · {{ (anime.n ?? 1) === 1 ? 'New' : 'Leftover' }}</span>
      </span>
      <span :id="`score-${anime.i}`" class="ranking-score">
        <strong>{{ score }}</strong>
        <span>{{ metric.label }}</span>
      </span>
      <IconArrowUpRight class="ranking-arrow" :size="18" aria-hidden="true" />
    </button>
  </li>
</template>
