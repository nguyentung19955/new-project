#!/usr/bin/env node
// CHẠY BOT CÂN BẰNG KHÔNG CẦN TRÌNH DUYỆT (14/10, bước 1 làm chắc, mục 5).
// Nạp mã game (đúng thứ tự thẻ <script> trong game/index.html) vào một vm của Node với DOM / canvas GIẢ (vẽ gì cũng bỏ qua), rồi nạp
// tests/bot.js, tests/setup.js, tests/bot_nang.js. Không mở trang, không Playwright, không vẽ, không âm thanh, không mạng (?cloud=0):
// chỉ chạy phần LUẬT của game (G.sim với G.noRender) như một mô hình tính số cho bot cân bằng.
//
// Giao tiếp (dùng bởi tests/cd_lib.py NodePage, thay cho trang Playwright): mỗi dòng stdin là JSON { code, arg }:
//   code là biểu thức JS; nếu ra hàm thì gọi hàm(arg). Trả về một dòng JSON { ok, v } hoặc { ok: false, loi }.
// Chạy tay:  echo '{"code":"G.power()"}' | node game/tests/node_trang.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), readline = require('readline');
const GAME = path.join(__dirname, '..');
// 15/10 noi-gian-manh: biến môi trường LK_Q thêm cờ vào địa chỉ trang giả (vd LK_Q=giancu=1 → ?cloud=0&giancu=1) để bot đo bản cũ / mới.
const Q = process.env.LK_Q ? '&' + String(process.env.LK_Q).replace(/^[?&]+/, '') : '';

function vatGia(ten) { // đối tượng "gì cũng được": mọi thuộc tính là hàm rỗng trả lại chính nó
  const f = function () { return p; };
  const p = new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'then') return undefined;
      if (k in t) return t[k];
      return p;
    },
    set(t, k, v) { t[k] = v; return true; },
    apply() { return p; },
  });
  void ten;
  return p;
}
class Ctx2D { // phương thức nằm trên prototype: js/ngon_ngu.js gắn / xoá measureText riêng trên đối tượng thì bản gốc vẫn còn
  measureText(s) { return { width: String(s || '').length * 4, actualBoundingBoxAscent: 7, actualBoundingBoxDescent: 2 }; }
  fillText() {} strokeText() {}
  getImageData(x, y, w, h) { // một điểm ảnh đục ở góc: mã dựng hình (village_scene.js sprite) thấy hình không rỗng như khi vẽ thật
    const d = new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)); d[3] = 255;
    return { width: w | 0, height: h | 0, data: d };
  }
  createImageData(w, h) { return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(Math.max(0, (w | 0) * (h | 0) * 4)) }; }
  createLinearGradient() { return { addColorStop() {} }; } createRadialGradient() { return { addColorStop() {} }; } createPattern() { return {}; }
  getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; } isPointInPath() { return false; } getLineDash() { return []; }
}
function ctx2d(cv) {
  const o = Object.assign(new Ctx2D(), {
    canvas: cv, globalAlpha: 1, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '10px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    globalCompositeOperation: 'source-over', imageSmoothingEnabled: false, filter: 'none', lineJoin: 'miter', lineCap: 'butt', shadowBlur: 0, shadowColor: '', shadowOffsetX: 0, shadowOffsetY: 0,
  });
  const rong = () => {};
  return new Proxy(o, { get(t, k) { if (k in t) return t[k]; return rong; }, set(t, k, v) { t[k] = v; return true; } });
}
function phanTu(tag) {
  const el = {
    tagName: String(tag || 'div').toUpperCase(), style: {}, dataset: {}, children: [], width: 300, height: 150, className: '',
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild(c) { this.children.push(c); return c; }, removeChild() {}, remove() {}, insertBefore(c) { return c; }, append() {}, prepend() {},
    setAttribute() {}, getAttribute: () => null, removeAttribute() {}, addEventListener() {}, removeEventListener() {}, focus() {}, blur() {}, click() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 844, bottom: 390, width: 844, height: 390, x: 0, y: 0 }),
    querySelector: () => null, querySelectorAll: () => [], contains: () => false, setPointerCapture() {}, releasePointerCapture() {},
    get clientWidth() { return 844; }, get clientHeight() { return 390; }, get offsetWidth() { return 844; }, get offsetHeight() { return 390; },
  };
  if (el.tagName === 'CANVAS') { let c2 = null; el.getContext = () => c2 || (c2 = ctx2d(el)); el.toDataURL = () => 'data:image/png;base64,'; el.toBlob = (f) => f && f(null); }
  return el;
}

// Lỗi phần vẽ / màn chào chạy ngầm (main.js dựng làng khi chưa có ảnh): bỏ qua như trình duyệt in ra bảng điều khiển, không dừng bot.
const loiNgam = [];
process.on('unhandledRejection', (e) => { loiNgam.push(String((e && e.message) || e)); });
process.on('uncaughtException', (e) => { loiNgam.push(String((e && e.message) || e)); });
const bo = new Map();
const kho = { getItem: (k) => (bo.has(k) ? bo.get(k) : null), setItem: (k, v) => { bo.set(k, String(v)); }, removeItem: (k) => { bo.delete(k); }, clear: () => bo.clear(), key: (i) => [...bo.keys()][i] || null, get length() { return bo.size; } };
const daCo = {};
const document = {
  hidden: false, visibilityState: 'visible', readyState: 'complete', title: '', cookie: '',
  documentElement: phanTu('html'), body: phanTu('body'), head: phanTu('head'),
  getElementById: (id) => daCo[id] || (daCo[id] = phanTu(id === 'world' || id === 'ui' ? 'canvas' : 'div')),
  createElement: (t) => phanTu(t), createElementNS: (n, t) => phanTu(t), createTextNode: () => ({}),
  querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
  fonts: { load: () => Promise.resolve([]), ready: Promise.resolve(), check: () => true, add() {} },
};
class Anh { constructor() { this.width = 0; this.height = 0; this.naturalWidth = 0; this.complete = false; this.onload = null; this.onerror = null; this._src = ''; }
  set src(v) { this._src = v; } get src() { return this._src; } decode() { return new Promise(() => {}); } addEventListener() {} }
const sb = {
  console: new console.Console(process.stderr, process.stderr), Math, JSON, Date, Promise, Map, Set, WeakMap, WeakSet, Symbol, Proxy, Reflect, Array, Object, String, Number, Boolean, RegExp, Error, TypeError,
  Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, ArrayBuffer, DataView, Intl, isFinite, isNaN, parseFloat, parseInt,
  encodeURIComponent, decodeURIComponent, escape, unescape, btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'), atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, queueMicrotask: (f) => Promise.resolve().then(f),
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  performance: { now: () => Number(process.hrtime.bigint() / 1000n) / 1000 },
  document, localStorage: kho, sessionStorage: kho, Image: Anh, ImageData: function (d, w, h) { this.data = d; this.width = w; this.height = h; },
  navigator: { language: 'vi', languages: ['vi'], userAgent: 'node-bot', maxTouchPoints: 0, onLine: false, serviceWorker: undefined, vibrate: () => false },
  location: { search: '?cloud=0' + Q, href: 'file://' + GAME + '/index.html?cloud=0' + Q, protocol: 'file:', hostname: '', host: '', pathname: GAME + '/index.html', origin: 'null', reload() {} },
  innerWidth: 844, innerHeight: 390, devicePixelRatio: 1, screen: { width: 844, height: 390, orientation: { type: 'landscape-primary', addEventListener() {} } },
  addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  getComputedStyle: () => ({ getPropertyValue: () => '0px' }), ResizeObserver: class { observe() {} disconnect() {} }, history: { replaceState() {}, pushState() {} },
  AudioContext: undefined, webkitAudioContext: undefined, fetch: undefined, Worker: undefined, OffscreenCanvas: undefined, caches: undefined, indexedDB: undefined,
  alert() {}, confirm: () => false, prompt: () => null, open: () => null, vatGia,
};
sb.window = sb; sb.self = sb; sb.globalThis = sb; sb.top = sb; sb.parent = sb;
vm.createContext(sb);
const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script\s+src="([^"]+)"\s*>\s*<\/script>/g)].map((m) => m[1]);
const loiNap = [];
for (const s of srcs.concat(['tests/bot.js', 'tests/setup.js', 'tests/bot_nang.js'])) {
  try { vm.runInContext(fs.readFileSync(path.join(GAME, s), 'utf8'), sb, { filename: s }); } catch (e) { loiNap.push(s + ': ' + ((e && e.message) || e)); }
}
const G = sb.G;
if (!G || !G.startStage || !G.probeRun) { console.error('Không nạp được game: ' + loiNap.join(' | ')); process.exit(2); }
G.noRender = true;
if (G.save) G.save.sound = false;
if (process.env.LK_NODE_IN_LOI && loiNap.length) console.error('Lỗi lúc nạp (bỏ qua): ' + loiNap.join(' | '));
sb.__loiNgam = loiNgam;

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (dong) => {
  if (!dong.trim()) return;
  let out;
  try {
    const q = JSON.parse(dong);
    let v = vm.runInContext('(' + q.code + ')', sb);
    if (typeof v === 'function') v = v(q.arg);
    out = { ok: true, v: v === undefined ? null : v };
  } catch (e) { out = { ok: false, loi: String((e && e.stack) || e) }; }
  let s;
  try { s = JSON.stringify(out); } catch (e) { s = JSON.stringify({ ok: false, loi: 'kết quả không chuyển JSON được: ' + e.message }); }
  process.stdout.write(s + '\n');
});
