// Service worker: lưu sẵn game để mở lại không cần mạng (trừ lưu đám mây).
// Đổi VERSION mỗi khi phát hành để máy người chơi tải bản mới.
const VERSION = 'v262';
const CORE = ['./', './index.html', './manifest.webmanifest', './css/style.css', './icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // Firebase, phông chữ: đi mạng
  // trang + mã: ưu tiên mạng (luôn bản mới), mất mạng thì dùng bản lưu; ảnh: ưu tiên bản lưu
  const netFirst = /\.(html|js|css|webmanifest)$|\/$/.test(u.pathname);
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    if (hit && !netFirst) return hit;
    try { const r = await fetch(e.request); if (r.ok) c.put(e.request, r.clone()); return r; }
    catch (err) { return hit || Response.error(); }
  }));
});
