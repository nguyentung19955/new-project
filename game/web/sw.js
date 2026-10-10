// Service worker tối giản để máy coi Linh Khí là ứng dụng: luôn lấy bản mới từ mạng, mất mạng thì dùng bản đã lưu.
const CACHE = 'linhkhi-v1';
// V74: phông Be Vietnam Pro (Google Fonts) và thư viện Firebase (gstatic) nằm ở máy chủ khác nên trước đây không được lưu:
// mở offline thì chữ dùng phông dự phòng. Nay lưu riêng vào kho này (lấy mạng trước, mất mạng thì dùng bản đã lưu).
const CACHE_NGOAI = 'linhkhi-ngoai-v1';
const NGOAI = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/|^https:\/\/www\.gstatic\.com\/firebasejs\//;
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) {
    if (!NGOAI.test(req.url)) return;
    e.respondWith(
      fetch(req).then((res) => {
        // phông tải kiểu "no-cors" trả về dạng opaque (status 0): vẫn lưu được và dùng lại được
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE_NGOAI).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => caches.match(req).then((r) => r || Promise.reject(new Error('offline'))))
    );
    return;
  }
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./')))
  );
});
