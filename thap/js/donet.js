// TURRET MERGE — độ nét: chạy TRƯỚC mọi script khác (xem tools/thap-kt-net.js, docs/demo-hop-tuong/tuvan/net/BAO-CAO.md)
'use strict';
// lọc ảnh 'high' cho MỌI ngữ cảnh 2D: canvas đệm tạo bằng c.getContext('2d') trực tiếp (không qua REN.c2d) mặc định 'low', và mỗi lần
// đặt lại width/height thì trạng thái ngữ cảnh về mặc định 'low' → ảnh thu nhỏ vào bộ đệm bị lấm tấm/mềm (đo: tools/thap-kt-net.js smq).
(() => {
  const CP = HTMLCanvasElement.prototype, gc = CP.getContext;
  const dat = (x) => { try { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; } catch (e) { } return x; };
  CP.getContext = function (k, o) { const x = gc.call(this, k, o); if (x && (k === '2d') && !this.__min) { this.__min = 1; dat(x); } return x; };
  for (const p of ['width', 'height']) {
    const d = Object.getOwnPropertyDescriptor(CP, p); if (!d || !d.set) continue;
    Object.defineProperty(CP, p, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, v); if (this.__min) dat(gc.call(this, '2d')); } });
  }
  if (typeof OffscreenCanvas !== 'undefined') { const OP = OffscreenCanvas.prototype, og = OP.getContext; OP.getContext = function (k, o) { const x = og.call(this, k, o); if (x && k === '2d') dat(x); return x; }; }
})();
// ảnh DOM (<img>, innerHTML) tải kèm ?v=băm (ANH_V do tools/thap-ver.py sinh lúc xuất bản) → điện thoại không giữ bản PNG cũ cỡ nhỏ
// trong bộ đệm sau khi ảnh được cắt lại nét hơn. Nhánh làm việc không có ANH_V → không đổi gì.
(() => {
  if (typeof ANH_V === 'undefined') return;
  const RE = /(assets\/([\w\/-]+)\.(png|jpg))(?![?\w])/g;
  const V = (s) => typeof s === 'string' && s.indexOf('assets/') >= 0 ? s.replace(RE, (m, u, n, e) => ANH_V[n] ? u + '?v=' + ANH_V[n] : m) : s;
  window.anhV = V;
  const EP = Element.prototype, d = Object.getOwnPropertyDescriptor(EP, 'innerHTML');
  if (d && d.set) Object.defineProperty(EP, 'innerHTML', { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, V(v)); } });
  const ia = EP.insertAdjacentHTML; EP.insertAdjacentHTML = function (p, h) { return ia.call(this, p, V(h)); };
  const sa = EP.setAttribute; EP.setAttribute = function (k, v) { return sa.call(this, k, (k === 'src' || k === 'style') ? V(v) : v); };
  const IP = HTMLImageElement.prototype, ds = Object.getOwnPropertyDescriptor(IP, 'src');
  if (ds && ds.set) Object.defineProperty(IP, 'src', { configurable: true, enumerable: ds.enumerable, get: ds.get, set(v) { ds.set.call(this, V(v)); } });
})();
