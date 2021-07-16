<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})
const router = useRouter()
</script>

<template>
  <div>Demo of dynamic route</div>
  <p>
    {{ `Hi: ${props.name}` }}
  </p>
  <br>
  <div>
    <button @click="router.back()">
      BACK
    </button>
  </div>
</template>