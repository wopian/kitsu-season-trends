import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    VitePWA({
      base: '/',
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.png'
      ],
      manifest: {
        name: 'Kitsu Season Trends',
        short_name: 'Season Trends',
        theme_color: 'red',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ]
})
