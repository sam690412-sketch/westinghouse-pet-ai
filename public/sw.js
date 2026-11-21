const CACHE_PREFIX = "westinghouse-pet-offline-";
const CACHE_NAME = CACHE_PREFIX + "v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(OFFLINE_URL, { cache: "reload", credentials: "omit" }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate" || event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin ||
      /^\/(?:api|admin|checkout|order-success)(?:\/|$)/.test(url.pathname)) return;

  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }));
});
