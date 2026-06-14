const CACHE_NAME = 'sudoku-v2';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './custom-puzzle.js',
  './styles.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppAsset = isSameOrigin && (
    request.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/app.js') ||
    url.pathname.endsWith('/custom-puzzle.js') ||
    url.pathname.endsWith('/styles.css') ||
    url.pathname.endsWith('/manifest.json')
  );

  // Always try network first for core app assets so deployments show up quickly.
  if (isAppAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Network-first for external dynamic libraries, cache fallback for offline.
  if (request.url.includes('tesseract') || request.url.includes('cdn.jsdelivr')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static resources not covered above.
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
