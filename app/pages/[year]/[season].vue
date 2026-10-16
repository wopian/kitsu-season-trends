<script setup lang="ts">
const route = useRoute()
if (route.params.season === 'fall')
  await navigateTo(`/${route.params.year}/autumn`, {
    redirectCode: 301,
    replace: true,
  })
</script>
<template><SeasonDashboard /></template>
