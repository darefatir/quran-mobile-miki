/* service-worker.js
 * Offline-first PWA for GitHub Pages (/quran-mobile-miki/)
 * - Precache app shell
 * - Runtime cache for AlQuran Cloud API (stale-while-revalidate)
 */

const CACHE_VERSION = 'v10';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const BASE_PATH = '/quran-mobile-miki';

const APP_SHELL_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/service-worker.js`,
  `${BASE_PATH}/icons/icon-192.png`,
  `${BASE_PATH}/icons/icon-512.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_SHELL_CACHE);
    await cache.addAll(APP_SHELL_ASSETS.map(u => new Request(u, { cache: 'reload' })));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(k))
        .map(k => caches.delete(k))
    );
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // App shell: cache-first
  if (url.origin === location.origin && url.pathname.startsWith(BASE_PATH)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // AlQuran Cloud API: stale-while-revalidate
  if (url.origin === 'https://api.alquran.cloud') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && new URL(request.url).origin === location.origin) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    if (request.mode === 'navigate') {
      const fallback = await cache.match(`${BASE_PATH}/`);
      if (fallback) return fallback;
    }
    throw e;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = (async () => {
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    } catch (e) {
      return null;
    }
  })();

  return cached || (await fetchPromise) || new Response(
    JSON.stringify({ error: 'offline', message: 'No cached API response available.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}
