/* service-worker.js
 * Offline-first PWA for GitHub Pages (/quran-mobile-miki/)
 * Strategy:
 * - Precache core static assets (app shell)
 * - Runtime cache for API (stale-while-revalidate)
 */

const CACHE_VERSION = 'v7';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// IMPORTANT: your GH Pages base path
const BASE_PATH = '/quran-mobile-miki';

const APP_SHELL_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/service-worker.js`,
  `${BASE_PATH}/icons/icon-192.png`,
  `${BASE_PATH}/icons/icon-512.png`,
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_SHELL_CACHE);
    // "reload" ensures fresh fetch when updating
    await cache.addAll(APP_SHELL_ASSETS.map(u => new Request(u, { cache: 'reload' })));
    self.skipWaiting();
  })());
});

// Activate: clean old caches
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

// Fetch handlers
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // 1) App shell: cache-first (fast startup)
  if (url.origin === location.origin && url.pathname.startsWith(BASE_PATH)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 2) Quran API: stale-while-revalidate
  if (url.origin === 'https://api.alquran.cloud') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Default: network
});

// Cache-first
async function cacheFirst(request) {
  const cache = await caches.open(APP_SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    // only cache same-origin
    if (fresh && fresh.ok && new URL(request.url).origin === location.origin) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    // If offline and request is navigation, try fallback to cached root
    if (request.mode === 'navigate') {
      const fallback = await cache.match(`${BASE_PATH}/`);
      if (fallback) return fallback;
    }
    throw e;
  }
}

// Stale-while-revalidate for APIs
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = (async () => {
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) {
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return null;
    }
  })();

  // Return cached immediately if present, else await network
  return cached || (await fetchPromise) || new Response(
    JSON.stringify({ error: 'offline', message: 'No cached API response available.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}
