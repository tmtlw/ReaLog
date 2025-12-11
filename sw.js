
const CACHE_NAME = 'realog-v4-offline';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/lucide@latest'
];

// Install Event - Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from Cache, then Network (Stale-While-Revalidate logic for static, Network First for API)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls: Network Only (or handle offline in App Logic)
  // We do not cache API calls in SW because the App Logic handles offline queuing.
  if (url.pathname.includes('/api/')) {
    return; // Browser default behavior
  }

  // 2. Source Files (.ts, .tsx, .json inside src): Cache First, fallback to network
  // Since we compile on the fly, these are static assets.
  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx') || (url.pathname.includes('/src/') && url.pathname.endsWith('.json'))) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response immediately if found
            if (cachedResponse) {
                // Optional: Update cache in background for next time
                fetch(event.request).then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
                }).catch(() => {}); 
                return cachedResponse;
            }
            // Fallback to network
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
      );
      return;
  }

  // 3. General Assets: Network First, fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic' && !response.url.startsWith('http')) {
          return response;
        }
        // Clone and Cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
