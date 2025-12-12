// PWA Service Worker - Minimal, no fetch interception
// Only handles PWA features and install

self.addEventListener('install', function(event) {
  // Skip the waiting phase and activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  // Clean up any old caches from previous versions
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Delete all caches to ensure no interference
          return caches.delete(cacheName)
        })
      )
    }).then(function() {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})

// No fetch event listener - let all requests go through normally

