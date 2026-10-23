// Stock Calculator v1.4 — offline app shell
const CACHE_NAME = 'stock-calculator-v1.4';
const APP_FILES = [
  './', './index.html', './manifest.webmanifest',
  './icon.png', './apple-touch-icon.png',
  './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('stock-calculator-') && k !== CACHE_NAME).map(k => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, {ignoreSearch:true});
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (err) {
      if (event.request.mode === 'navigate') {
        return await cache.match('./index.html') || Response.error();
      }
      return Response.error();
    }
  })());
});
