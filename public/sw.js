const CACHE_NAME = "espetro-pagefind-v1";

self.addEventListener('fetch', (event) => {
  // Cache-first for PageFind assets only
  if (event.request.url.includes('/pagefind/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, responseClone)
          );
          return networkResponse;
        });
      })
    );
  }

  // Network-first for everything else (GitHub Pages handles caching)
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', (event) => {
  // Clean up old cache versions
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
