const CACHE_NAME = "shayan-shop-v2"; // با هر آپدیت مهم، این عدد رو بالا ببرید (v3, v4, ...)
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استراتژی جدید: همیشه اول از اینترنت تلاش کن (نسخه‌ی تازه)،
// فقط اگر آفلاین بود از حافظه‌ی ذخیره‌شده استفاده کن
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match("./index.html")))
  );
});
