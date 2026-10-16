<script setup lang="ts">
import { IconMoon, IconSun, IconDeviceDesktop, IconBrandGithub } from '@tabler/icons-vue'

const colorMode = useColorMode()
</script>
<template>
  <header class="site-header">
    <NuxtLink to="/" class="wordmark">Kitsu Season Trends</NuxtLink>
    <div class="header-actions">
      <nav class="header-navigation" aria-label="Main navigation">
        <NuxtLink to="/stats/">Stats</NuxtLink>
        <NuxtLink to="/ratings/">How ratings work</NuxtLink>
        <a
          class="source-link"
          href="https://github.com/wopian/kitsu-season-trends"
          target="_blank"
          rel="noopener noreferrer"
        ><IconBrandGithub :size="16" aria-hidden="true" />Source</a>
      </nav>
      <div class="theme-control" role="group" aria-label="Colour theme">
        <button
          v-for="mode in ['system', 'light', 'dark']"
          :key="mode"
          :title="`${mode} theme`"
          :aria-label="`${mode} theme`"
          :aria-pressed="colorMode.preference === mode"
          @click="colorMode.preference = mode"
        >
          <IconDeviceDesktop v-if="mode === 'system'" :size="17" />
          <IconSun v-else-if="mode === 'light'" :size="17" />
          <IconMoon v-else :size="17" />
        </button>
      </div>
    </div>
  </header>
</template>
