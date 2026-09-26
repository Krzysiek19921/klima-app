const CACHE_NAME = 'klima-app-v2';

// Zasoby niezbędne do działania offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/db.js',
  './js/signature.js',
  './js/ha-connect.js',
  './js/app.js',
  'https://unpkg.com/lucide@latest'
];

// Instalacja Service Workera (Równoległe i bezpieczne cache'owanie)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Cache’owanie zasobów aplikacji...');
      
      // Pobieranie zasobów równolegle (Promise.allSettled zapobiega wyłożeniu się przy błędzie 1 pliku)
      const cachePromises = ASSETS_TO_CACHE.map(async (asset) => {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Nie udało się pobrać: ${asset}`, err);
        }
      });

      await Promise.allSettled(cachePromises);
    })
  );
  self.skipWaiting();
});

// Aktywacja i czyszczenie starych wersji Cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Usuwanie starego cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Obsługa zapytań sieciowych (Cache First z elastycznym zapisem CDN)
self.addEventListener('fetch', (e) => {
  // Ignorujemy metody inne niż GET (np. POST do Home Assistant)
  if (e.request.method !== 'GET') return;

  // Ignorujemy protokoły inne niż http/https (np. chrome-extension://)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request)
        .then((response) => {
          // Walidacja odpowiedzi - dopuszczamy 'basic' (własne pliki) oraz 'cors'/'opaque' (CDN np. unpkg/lucide)
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback dla nawigacji - jeśli brak sieci i strony w cache, zwróć index.html
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
          console.warn('[SW] Offline - brak zasobu:', e.request.url);
        });
    })
  );
});