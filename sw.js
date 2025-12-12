
const CACHE_NAME = 'realog-v4.5.6-offline';
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
  'https://unpkg.com/lucide@latest',
  
  // Font Assets (Cached for Local-like execution)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&family=Lobster&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Noto+Emoji:wght@300..700&display=swap',
  'https://cdn.jsdelivr.net/npm/@openmoji/openmoji-font@latest/fonts/OpenMoji-Color.woff2',
  'https://cdn.jsdelivr.net/gh/emojidex/emojidex-web@latest/src/fonts/emojidex-monospaced.woff2'
];

// Install Event - Cache Files with CORS handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Map all requests to promises
      const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
        try {
          // First try standard fetch (works for same-origin and proper CORS)
          const response = await fetch(url);
          if (!response.ok && response.type !== 'opaque') {
             throw new Error(`Status ${response.status}`);
          }
          return cache.put(url, response);
        } catch (e) {
          // If failed (likely CORS on CDN), try no-cors (opaque response)
          // This allows caching scripts/styles/fonts from CDNs even without wildcard CORS headers
          if (url.startsWith('http')) {
              try {
                  const noCorsResponse = await fetch(url, { mode: 'no-cors' });
                  return cache.put(url, noCorsResponse);
              } catch (e2) {
                  console.warn(`Failed to cache external asset: ${url}`, e2);
              }
          } else {
              console.warn(`Failed to cache local asset: ${url}`, e);
          }
        }
      });
      
      return Promise.all(cachePromises);
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

// Fetch Event - Serve from Cache, then Network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore unsupported schemes (e.g. chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 1. API Calls: Network Only
  if (url.pathname.includes('/api/')) {
    return;
  }

  // 2. Source Files: Cache First, fallback to network
  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx') || (url.pathname.includes('/src/') && url.pathname.endsWith('.json'))) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Background update for stale-while-revalidate
                fetch(event.request).then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
                }).catch(() => {}); 
                return cachedResponse;
            }
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
        if (!response || (response.status !== 200 && response.type !== 'opaque') || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
          return response;
        }
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
