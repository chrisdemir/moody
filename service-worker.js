const CACHE_NAME = "moody-v1";
const BASE_PATH = self.location.pathname.replace(/\/[^/]*$/, "/");

const urlsToCache = [
  "",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "img/icon-192.png",
  "img/icon-512.png"
].map((url) => BASE_PATH + url);

// Install: Cache alles & sofort aktivieren
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate: Kontrolle übernehmen
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Fetch: Aus Cache laden oder Netzwerk
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) =>
      response || fetch(event.request)
    )
  );
});
