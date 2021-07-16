import { createApp, defineAsyncComponent } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: defineAsyncComponent(() => import('./views/Home.vue')) },
    // { path: '/about', component: defineAsyncComponent(() => import('./views/about.vue')) },
    { path: '/hi/:name', component: defineAsyncComponent(() => import('./views/hi/[name].vue')), props: true },
  ],
})

createApp(App).use(router).mount('#app')
