// Service Worker for June 2026 · Luke & Judy
// Strategy: network-first for our origin, cache as fallback (offline support).
// Bypass Firebase / Google APIs so realtime data is never cached.

const CACHE = "luke-judy-v5";
const STATIC = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./avatar-judy.png",
  "./avatar-luke.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never intercept Firebase / Google APIs / Fonts CDN
  const bypassHosts = [
    "googleapis.com",
    "firebaseio.com",
    "firebase.com",
    "gstatic.com",
    "googleusercontent.com",
    "google.com",
    "fonts.googleapis.com",
    "cloudflare.com"
  ];
  if (bypassHosts.some(h => url.hostname.includes(h))) return;

  // Same-origin: try network, fall back to cache (offline)
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
  }
});
