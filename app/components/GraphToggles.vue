<script setup lang="ts">
import { metrics, type Metric } from '../../shared/trends'
const enabled = defineModel<Metric[]>({ required: true })
withDefaults(defineProps<{ label?: string }>(), { label: 'Graph metrics' })
function toggle(metric: Metric) {
  enabled.value = enabled.value.includes(metric)
    ? enabled.value.filter((item) => item !== metric)
    : [...enabled.value, metric]
}
</script>
<template>
  <div class="segmented graph-toggles" role="group" :aria-label="label">
    <button
      v-for="metric in metrics"
      :key="metric.key"
      :aria-pressed="enabled.includes(metric.key)"
      @click="toggle(metric.key)"
    >
      <span
        class="metric-swatch"
        :style="{ backgroundColor: metric.color }"
        aria-hidden="true"
      />
      {{ metric.label }}
    </button>
  </div>
</template>
