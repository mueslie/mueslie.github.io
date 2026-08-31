/* Dapp Builder service worker — lean app-shell caching.
 *
 * Strategy:
 *  - Navigations: network-first so deploys land on the next load, cached
 *    index.html as offline fallback (the app itself is local-first).
 *  - /assets/* build files: cache-first — hashed filenames are immutable.
 *  - /starters/* content: network-first — a starter is copied into a dapp at
 *    install time, so it must be the deployed version, never a stale cache
 *    (offline fallback to the cached copy).
 *  - Everything else same-origin (icons, legal pages): stale-while-revalidate.
 *  - Cross-origin requests are never touched; WebSockets/WebRTC bypass the SW.
 *
 * Bump CACHE_VERSION when deploy semantics change; stale caches are purged on activate.
 */
const CACHE_VERSION = 'dapp-builder-v3';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon-196.png',
  '/apple-icon-180.png',
  '/manifest-icon-192.maskable.png',
  '/manifest-icon-512.maskable.png',
  '/manifest-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (!key.startsWith(CACHE_VERSION)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

function offlineResponse() {
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations — network first, offline fallback to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put('/', response.clone());
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true }))
          ?? (await caches.match('/'))
          ?? offlineResponse();
      }
    })());
    return;
  }

  // Hashed Vite build output — immutable, cache forever (per version).
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(ASSETS_CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return offlineResponse();
      }
    })());
    return;
  }

  // Starter content — network-first so installs copy the deployed files.
  if (url.pathname.startsWith('/starters/')) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) ?? offlineResponse();
      }
    })());
    return;
  }

  // Remaining same-origin statics — stale-while-revalidate.
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);
    const refresh = fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => undefined);
    return cached ?? (await refresh) ?? offlineResponse();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
