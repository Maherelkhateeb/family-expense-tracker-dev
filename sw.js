// Service Worker for Family Expense Tracker (Offline First & PWA)
const CACHE_NAME = "family-finance-v5.3.4-202611091255";
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/favicon.png',
  './assets/apple-touch-icon.png',
  './assets/family_option1_gold_crest.jpg',
  './assets/family_option2_mosaic.jpg',
  './assets/family_option3_rosette.jpg',
  './assets/family_option4_emerald.jpg',
  './avatar_mohamed.jpg',
  './baby.jpg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Network first for index.html, version.json, market_rates.json to ensure instant updates
  if (url.pathname.endsWith('index.html') || url.pathname.endsWith('version.json') || url.pathname.endsWith('market_rates.json') || url.pathname === '/' || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first with network fallback for other static assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      });
    })
  );
});
