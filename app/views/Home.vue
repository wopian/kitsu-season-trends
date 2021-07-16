<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'

const router = useRouter()
const name = ref('')
const go = () => {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}
</script>

<template>
  <div>Home route</div>
  <br>
  <form @submit.prevent="go">
    <input v-model="name" type="text" aria-label="What's your name?" placeholder="What's your name?">
    <br>
    <br>
    <button type="submit">
      GO
    </button>
  </form>
  <br>
  <button type="button" @click="router.push('/about')">
    About
  </button>
  <HelloWorld msg="hello"/>
</template>