const SHELL = 'afvalapp-shell-v1';
const ASSETS = 'afvalapp-assets-v1';

// On install: pre-cache the app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL).then((c) =>
      c.addAll(['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'])
    )
  );
});

// On activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Skip API calls — ShoppingList handles those via localStorage cache
  if (url.pathname.startsWith('/api/')) return;

  // Next.js static assets & icons: cache-first
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) => hit ?? fetch(event.request).then((res) => {
          caches.open(ASSETS).then((c) => c.put(event.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Navigation (page loads): network-first, fall back to cached page or root
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches.open(SHELL).then((c) => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((hit) => hit ?? caches.match('/'))
        )
    );
  }
});
