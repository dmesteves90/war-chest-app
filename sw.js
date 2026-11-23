// Network first, falling back to the cached copy, so updates arrive when online and the app still opens offline.
const CACHE = "war-chest-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    // no-cache: always revalidate, otherwise GitHub Pages' 10-minute browser cache hides a new version
    fetch(new Request(r.url, { cache: "no-cache" })).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(r, copy));
      return res;
    }).catch(() => caches.match(r).then((m) => m || caches.match("index.html")))
  );
});
