// Service worker tối giản để máy coi Linh Khí là ứng dụng: luôn lấy bản mới từ mạng, mất mạng thì dùng bản đã lưu.
const CACHE = 'linhkhi-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Phiên hiệu năng (V10): tệp ảnh tải sau có mã nội dung trong tên (linh-khi-anh.<mã>.json) không bao giờ đổi: có sẵn trong bộ nhớ thì dùng
  // luôn, không tải lại, không ghi lại 20 MB mỗi lần mở game. Chưa có thì tải rồi lưu một lần. (game tự xoá tệp của bản cũ: sprite_custom.js donBanCu)
  if (/\/linh-khi-anh\.[0-9a-f]+\.json$/.test(new URL(req.url).pathname)) {
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((co) => co || fetch(req).then((res) => {
      if (res && res.ok) c.put(req, res.clone()).catch(() => {});
      return res;
    }))).catch(() => fetch(req)));
    return;
  }
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./')))
  );
});
