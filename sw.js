// Service Worker for Family Expense Tracker (Offline First & PWA)
const CACHE_NAME = "family-finance-v5.3.31-202611141150";
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './family-alerts.js?v=20261114-events',
  './family-alerts.css?v=20261114',
  './ledger-task-layout.css?v=20261114-task-compact',
  './operation-filters.js?v=20261114',
  './market-data.js?v=20261114-gold1',
  './gold-market.css?v=20261114-gold1',
  './appearance-compact.css?v=20261114-settings-open',
  './appearance-compact.js?v=20261114-settings-open',
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
  if (url.pathname.endsWith('appearance-compact.css') || url.pathname.endsWith('appearance-compact.js') || url.pathname.endsWith('index.html') || url.pathname.endsWith('version.json') || url.pathname.endsWith('market_rates.json') || url.pathname === '/' || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then((res) => {
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

