const CACHE = "vinylroll-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
  // ajoute "icon-192.png", "icon-512.png" si tu les as
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // Cache-first pour assets, network-first pour le reste
  if (ASSETS.some(a => req.url.endsWith(a.replace("./","")))) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  } else {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
  }
});
