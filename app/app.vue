<script setup lang="ts">
const colorMode = useColorMode()

// Match browser chrome to the page, including manual theme changes.
useHead(() => ({
  meta: (['light', 'dark'] as const).map((scheme) => ({
    name: 'theme-color',
    media: `(prefers-color-scheme: ${scheme})`,
    content: (colorMode.unknown ? scheme : colorMode.value) === 'dark' ? '#221b22' : '#f7f1f6',
  })),
}))
</script>
<template>
  <UApp><NuxtPage /></UApp>
</template>
