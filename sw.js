// Service Worker for Family Expense Tracker (Offline First & PWA)
const CACHE_NAME = 'family-expense-v6.8.8-202611191635';
const STATIC_ASSETS = [
  './',
  './index.html',
  './indexeddb-engine.js?v=202611191620',
  './drive-sync-engine.js?v=202611191620',
  './app-main.css?v=202611191620',
  './app-early.js?v=202611191620',
  './app-core.js?v=202611191620',
  './app-features.js?v=202611191620',
  './budget-audit-oversight.js?v=202611191620',
  './home-layouts.css?v=202611191620',
  './home-layouts.js?v=202611191620',
  './operations-return-hub.js?v=202611191620',
  './comparison-deeplink.js?v=202611191620',
  './manifest.json',
  './version.json',
  './family-alerts.js?v=202611191620',
  './budget-audit-engine.js?v=202611191620',
  './family-budget-comparison.js?v=202611191620',
  './comparison-unified.css?v=202611191620',
  './family-alerts.css?v=202611191620',
  './ledger-task-layout.css?v=202611191620',
  './operation-filters.js?v=202611191620',
  './market-data.js?v=202611191620',
  './gold-market.css?v=202611191620',
  './appearance-compact.css?v=202611191620',
  './appearance-compact.js?v=202611191620',
  './voice-assistant-engine.js?v=202611191620',
  './voice-assistant-engine.css?v=202611191620',
  './assets/home-reference-one.webp',
  './assets/home-reference-one-controls.webp',
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
    }).catch(err => console.warn('SW cache.addAll warning:', err))
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

  // 1. NEVER intercept external origins - let the external browser handle them directly
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Network-first with no-cache for all document navigations, HTML and JSON
  const isNav = e.request.mode === 'navigate' || e.request.destination === 'document';
  const isDoc = url.pathname.endsWith('index.html') || url.pathname.endsWith('/') || !url.pathname.includes('.');
  const isDynamic = url.pathname.endsWith('version.json') || url.pathname.endsWith('market_rates.json') || url.search.includes('nocache') || url.search.includes('update');

  if (isNav || isDoc || isDynamic) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Always revalidate app JS/CSS to avoid silently retaining old appearance
  // and voice logic under an unchanged URL. Cached assets remain available offline.
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Cache-first with network fallback for local static assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      });
    })
  );
});

