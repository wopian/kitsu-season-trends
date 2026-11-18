<script setup lang="ts">
const colorMode = useColorMode()
const route = useRoute()
const router = useRouter()
const { destination } = usePageMotion()

if (import.meta.client) {
  let headingAnimation: Animation | undefined
  const removeAfterEach = router.afterEach((to, _from, failure) => {
    if (failure && destination.value === to.path) destination.value = null
  })

  watch(() => route.path, (path) => {
    headingAnimation?.cancel()
    if (destination.value !== path) return
    destination.value = null

    const heading = document.querySelector('.site-shell main h1')
    if (!heading) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const easing = getComputedStyle(heading).getPropertyValue('--ease-out').trim()
    headingAnimation = heading.animate(
      reduced
        ? [{ opacity: 0.85 }, { opacity: 1 }]
        : [{ opacity: 0.78, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }],
      { duration: reduced ? 80 : 150, easing: easing || 'ease-out' },
    )
  }, { flush: 'post' })

  onBeforeUnmount(() => {
    headingAnimation?.cancel()
    removeAfterEach()
  })
}

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
