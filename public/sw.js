const STATIC_CACHE = "meetpoint-static-v2";
const RUNTIME_CACHE = "meetpoint-runtime-v2";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png"
];

const ACTIVE_CACHES = [STATIC_CACHE, RUNTIME_CACHE];

function isSuccessfulResponse(response) {
  return response && response.ok;
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (isSuccessfulResponse(response)) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  const networkResponsePromise = fetch(request)
    .then(async (response) => {
      if (isSuccessfulResponse(response)) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => null);

  if (cachedResponse) {
    return cachedResponse;
  }

  return networkResponsePromise;
}

async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request);

    if (isSuccessfulResponse(response)) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await caches.match(request)) || caches.match(fallbackUrl);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !ACTIVE_CACHES.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);
  const { pathname } = requestUrl;

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, RUNTIME_CACHE, "/offline.html"));
    return;
  }

  if (pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/imports/") ||
    /\.(?:png|svg|jpg|jpeg|webp|gif|ico)$/i.test(pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});
