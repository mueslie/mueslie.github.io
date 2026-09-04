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
 *  - POST /share-target (Web Share Target with files): the shared files are
 *    staged in SHARE_STAGING_CACHE and the request is redirected to the GET
 *    picker page, which reads them back (src/services/webShare.ts).
 *
 * Bump CACHE_VERSION when deploy semantics change; stale caches are purged on activate.
 */
const CACHE_VERSION = 'dapp-builder-v6';
// Keep in sync with SHARE_STAGING_CACHE / SHARE_STAGING_PREFIX in src/services/webShare.ts.
const SHARE_STAGING_CACHE = 'dapp-builder-share-staging';
const SHARE_STAGING_PREFIX = '/share-target/staged/';
const MAX_SHARED_FILES = 20;
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
      if (!key.startsWith(CACHE_VERSION) && key !== SHARE_STAGING_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

function offlineResponse() {
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

/**
 * Web Share Target POST: stage the files (one cache entry each, the original
 * name in a header) and bounce to the picker page. Only one share is staged
 * at a time — an abandoned one is dropped by the next.
 */
async function stageSharedFiles(request) {
  const params = new URLSearchParams();
  let staged = 0;
  try {
    const form = await request.formData();
    for (const field of ['title', 'text', 'url']) {
      const value = form.get(field);
      if (typeof value === 'string' && value.trim()) params.set(field, value);
    }
    const files = form.getAll('files').filter((entry) => entry instanceof File && entry.size > 0).slice(0, MAX_SHARED_FILES);
    if (files.length > 0) {
      const id = crypto.randomUUID();
      await caches.delete(SHARE_STAGING_CACHE);
      const cache = await caches.open(SHARE_STAGING_CACHE);
      for (const file of files) {
        await cache.put(`${SHARE_STAGING_PREFIX}${id}/${staged}`, new Response(file, {
          headers: {
            'content-type': file.type || 'application/octet-stream',
            'x-share-name': encodeURIComponent(file.name || ''),
          },
        }));
        staged += 1;
      }
      params.set('share', id);
      params.set('files', String(staged));
    }
  } catch {
    // Malformed form data — land on the picker with whatever parsed.
  }
  const query = params.toString();
  return Response.redirect(`/share-target${query ? `?${query}` : ''}`, 303);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(stageSharedFiles(request));
    return;
  }
  if (request.method !== 'GET') return;

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

/* ── Web Push (docs/plans/2026-08-31-push-notifications.md) ──
 * Tickles are content-free by design; the payload is never trusted or
 * rendered. The notification text is a client-side constant, and tapping it
 * just opens the app, which pulls whatever is waiting over the normal
 * verified P2P path. */
self.addEventListener('push', (event) => {
  event.waitUntil(self.registration.showNotification('Dapp Builder', {
    body: 'Something is waiting for you in Dapp Builder.',
    icon: '/manifest-icon-192.maskable.png',
    badge: '/favicon-196.png',
    tag: 'dapp-builder-tickle',
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = clientList.find((client) => 'focus' in client);
    if (existing) await existing.focus();
    else await self.clients.openWindow('/');
  })());
});

/* Only a window client holds the relay ownership secret, so re-registration
 * after a browser-initiated subscription rotation happens in the app. */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientList.forEach((client) => client.postMessage('push-subscription-changed'));
  })());
});
