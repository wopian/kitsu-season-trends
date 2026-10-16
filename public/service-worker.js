// Retire legacy Workbox worker without registering a replacement in the new app.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.includes('kitsu-season-trends')) await caches.delete(key)
    }
    await self.registration.unregister()
    await self.clients.claim()
  })())
})
