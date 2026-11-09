// TURRET MERGE — Service Worker (phạm vi thap/): lần mở thứ 2 trở đi lấy mọi tệp từ máy, gần như tức thì.
//  · tệp có ?v=<băm nội dung> (js, css, ảnh — tools/thap-ver.py dán lúc xuất bản) là BẤT BIẾN → lấy từ bộ đệm 'tm-bam',
//    không hỏi mạng. Bản mới đổi băm → URL mới → chỉ tệp đổi mới tải; bản cũ cùng đường dẫn bị xoá (trang gửi tmGiu).
//  · index.html (điều hướng) + *.json: mạng trước (bản mới tới ngay), quá 3,5 s / mất mạng → bản trong máy.
//  · tệp không băm khác (phông, ảnh chỉ huy HOME…): bộ đệm trước trong 1 bản ('tm-tho-<V>'; bản mới đổi V → bỏ, tải lại).
//  · KHÔNG đụng: tệp ngoài nguồn (Firebase, CDN), ver.json?t=, tải lại ?r=, ping, yêu cầu Range (âm thanh), POST.
// V do tools/thap-ver.py dán lúc xuất bản (đổi V → trình duyệt cài SW mới, xoá bộ đệm cũ không băm).
'use strict';
const V = 'eaf7695b6e';
const BAM = 'tm-bam', THO = 'tm-tho-' + V;
const GOC = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (/^tm-/.test(k) && k !== BAM && k !== THO) await caches.delete(k);
  await self.clients.claim();
})()));

const coBam = (u) => /^[0-9a-f]{8}$/.test(u.searchParams.get('v') || '');
async function luu(ten, req, res) { try { if (res && res.ok && res.status === 200 && res.type !== 'opaque') await (await caches.open(ten)).put(req, res); } catch (e) { } }

async function bamTruoc(e, req) {
  const c = await caches.open(BAM);
  const co = await c.match(req, { ignoreVary: true });
  if (co) return co;
  const res = await fetch(req);
  e.waitUntil(luu(BAM, req.url, res.clone()));
  return res;
}
async function mangTruoc(e, req, khoa) {
  const c = await caches.open(THO);
  // lưu bản mạng vào máy kể cả khi đã trả bản cũ (quá 3,5 s): waitUntil gọi NGAY trong sự kiện (gọi muộn sau khi đã trả lời → lỗi,
  // index mới có thể không được lưu → lần mở sau lại ra bản cũ, ụ mới thiếu ảnh tới khi thoát hẳn app)
  const mang = fetch(req).then(async (res) => { if (res.ok) await luu(THO, khoa, res.clone()); return res; });
  e.waitUntil(mang.catch(() => { }));
  const hen = new Promise((ok) => setTimeout(ok, 3500));
  try {
    const r = await Promise.race([mang, hen.then(() => null)]);
    if (r) return r;
    const co = await c.match(khoa, { ignoreVary: true }); if (co) return co;
    return await mang;
  } catch (err) {
    const co = await c.match(khoa, { ignoreVary: true }); if (co) return co;
    throw err;
  }
}
async function domTruoc(e, req) { // trong 1 bản (V): lấy từ máy, không hỏi lại mạng — bản mới đổi V → bộ đệm này bị bỏ
  const c = await caches.open(THO);
  const co = await c.match(req, { ignoreVary: true });
  if (co) return co;
  const res = await fetch(req);
  if (res.ok) e.waitUntil(luu(THO, req.url, res.clone()));
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  let u; try { u = new URL(req.url); } catch (err) { return; }
  if (u.origin !== location.origin || u.pathname.indexOf(GOC) !== 0 || /sw\.js$/.test(u.pathname)) return;
  if (u.searchParams.has('r') || u.searchParams.has('t') || u.searchParams.has('ping') || req.cache === 'no-store') return;
  if (coBam(u)) return e.respondWith(bamTruoc(e, req));
  if (req.mode === 'navigate') return e.respondWith(mangTruoc(e, req, u.origin + u.pathname)); // ?preview= / ?room= … dùng chung 1 bản index
  if (/\.json$/.test(u.pathname)) return e.respondWith(mangTruoc(e, req, req.url));
  e.respondWith(domTruoc(e, req));
});

// trang gửi sau khi khởi động: tmThem = tệp đã tải TRƯỚC khi SW nhận trang (lần mở đầu) → chép vào bộ đệm (lấy từ bộ đệm HTTP);
// tmGiu = { đường dẫn: băm hiện hành } → xoá bản cũ (băm khác) và ảnh không còn trong bản.
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (!d.tmGiu && !d.tmThem) return;
  e.waitUntil((async () => {
    const c = await caches.open(BAM);
    if (d.tmGiu) {
      const m = d.tmGiu;
      for (const k of await c.keys()) {
        const u = new URL(k.url), v = u.searchParams.get('v');
        if (m[u.pathname] ? m[u.pathname] !== v : /\/assets\/.+\.(png|jpe?g|webp)$/.test(u.pathname)) await c.delete(k);
      }
    }
    if (d.tmThem) {
      const ds = d.tmThem.slice(); let i = 0;
      const luong = async () => { while (i < ds.length) { const u = ds[i++]; try { if (!(await c.match(u))) { const r = await fetch(u); await luu(BAM, u, r); } } catch (err) { } } };
      await Promise.all([luong(), luong(), luong(), luong()]);
    }
  })());
});
