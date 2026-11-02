'use strict';
/* sw.js – cho game mở được khi KHÔNG có mạng (phiên firebase, theo tư vấn ChatGPT mục C/F).
   Không tải trước gì cả (tiết kiệm băng thông Hosting miễn phí): chỉ giữ lại những file bạn đã từng mở.
   - HTML/JS/JSON/CSS: lấy mạng trước (luôn bản mới), mất mạng thì dùng bản đã lưu.
   - Ảnh/âm thanh/phông + SDK Firebase: dùng bản đã lưu trước, chưa có thì tải và giữ lại.
   Chỉ được đăng ký trên Firebase Hosting (game/luu-may.js), không chạy ở localhost / Artifact. */
const BAN = 'tvcc-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== BAN) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const cungNha = u.origin === self.location.origin, sdk = u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');
  if (!cungNha && !sdk) return;                       // Firestore/Auth… đi thẳng mạng
  if (cungNha && u.pathname.startsWith('/__/')) return; // trang đăng nhập Google của Firebase
  const tinh = sdk || /\.(png|webp|jpg|jpeg|gif|ogg|mp3|wav|woff2?|ttf|otf)$/i.test(u.pathname);
  e.respondWith((async () => {
    const c = await caches.open(BAN);
    if (tinh){
      const co = await c.match(r); if (co) return co;
      const m = await fetch(r); if (m.ok) c.put(r, m.clone()).catch(() => {}); return m;
    }
    try { const m = await fetch(r); if (m.ok) c.put(r, m.clone()).catch(() => {}); return m; }
    catch (err){ const co = await c.match(r, {ignoreSearch:true}); if (co) return co; throw err; }
  })());
});
