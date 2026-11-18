<script setup lang="ts">
import { posterFor, type Anime } from '../../shared/trends'

const props = defineProps<{
  anime: Anime
  decorative?: boolean
  priority?: boolean
}>()
const source = computed(() => posterFor(props.anime))
const failed = ref(false)
watch(source, () => { failed.value = false })
</script>

<template>
  <span class="poster" :aria-hidden="decorative || undefined">
    <img
      v-if="!failed"
      :src="source"
      :alt="decorative ? '' : `${anime.t} poster`"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : undefined"
      width="88"
      height="124"
      @error="failed = true"
    />
    <span v-else class="poster-fallback" aria-hidden="true">{{ Array.from(anime.t)[0] }}</span>
  </span>
</template>
