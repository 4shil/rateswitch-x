// Service Worker - Offline-first caching strategy
const CACHE_NAME = 'rateswitch-x-v2';
const DYNAMIC_CACHE = 'rateswitch-x-dynamic';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/storage.js',
  '/cache.js',
  '/favorites.js',
  '/exchange.js',
  '/charts.js',
  '/ui.js',
  '/manifest.json'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API requests - network first, cache fallback
  if (url.hostname === 'api.frankfurter.app') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then(cached => {
            if (cached) {
              console.log('[SW] Serving cached API response');
              return cached;
            }
            // Return offline fallback
            return new Response(
              JSON.stringify({ error: 'Offline', rates: {} }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(response => {
        // Cache new assets
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync (if supported)
if (self.registration.sync) {
  self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered');
    if (event.tag === 'sync-rates') {
      event.waitUntil(
        fetch('https://api.frankfurter.app/latest')
          .then(response => response.json())
          .then(data => {
            console.log('[SW] Rates synced in background');
          })
          .catch(err => {
            console.log('[SW] Background sync failed');
          })
      );
    }
  });
}
