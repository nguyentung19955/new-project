// TURRET MERGE — đo BỘ NHỚ + TẢI TEXTURE của lớp vẽ WebGL (js/gl/glr.js) trong 1 trận chạy dài, lái tất định (đồng hồ ảo + rAF bơm tay như thap-kt-hieunang-coop.js).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-bonho-gl.js <nhãn> <dai|trieu> "<query thêm>"
//   dai   : co-op wave 35, tốc 3×, chế độ iOS (&ios=1), GIAY=90 giây ảo (tim vô hạn, mana dư) → mỗi 10 s in: MB canvas đệm còn sống (REN.boNho) + MB GPU (GLR.boNho),
//           số lần tải texture nhiều nhất / khung, ms JS của khung (trung vị / p95 / max, đồng hồ thật), bộ đếm thả / dựng lại (GLR.bn).
//   trieu : co-op wave 1 không lấp bàn; TRIEU=12 lần triệu hồi (cách 45 khung) → số texture tải nhiều nhất trong 1 khung ở 8 khung sau MỖI lần triệu hồi
//           (ve = tải ngay lúc vẽ → gây khựng; nap = hàng nạp nền của GLR, rải theo khung); rồi kết thúc trận → 60 khung sau đó.
//   Query thêm: "gl=1" (mặc định) · "gl=0" (bản 2D) · "gl=1&glm=0" (GL, tắt thả bản CPU + nạp nền = cách cũ). DPR=3 (mặc định; iOS tự kẹp 2×).
const { chromium } = require('playwright');
const [nhan = 'thu', kb = 'dai', them = 'gl=1'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/', GIAY = +(process.env.GIAY || 90), TRIEU = +(process.env.TRIEU || 12);
const WAVE = +(process.env.WAVE || 35), D1 = process.env.D1 || 'nguyenrua,sinhdoi,khoisinh,lualien,chuato', D2 = process.env.D2 || 'leviathan,cobac,ronglua,chuato,overlord';
(async () => {
  const b = await chromium.launch({ args: [...(process.env.GC ? ['--js-flags=--expose-gc'] : []), '--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345);
    window.__now = performance.now.bind(performance); window.__vt = 1000;
    performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__k = []; // mỗi khung: [ms JS, texture tải lúc vẽ, texture nạp nền]
    window.__buoc = (n) => { for (let i = 0; i < n; i++) {
      window.__vt += 1000 / 60; const t0 = window.__now();
      const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } }
      const gl = typeof GLR !== 'undefined' && GLR.hien, d = window.__dk || (window.__dk = { set: 0, xoay: 0 }); window.__k.push([window.__now() - t0, gl ? GLR.dem.tai : 0, gl ? GLR.dem.nap | 0 : 0, d.set, d.xoay]); d.set = 0; d.xoay = 0;
      if (window.__moiKhung) window.__moiKhung();
    } };
    window.__tk = (a) => { const s = a.map(q => q[0]).sort((x, y) => x - y), q = (u) => +s[Math.min(s.length - 1, Math.floor(s.length * u))].toFixed(1); return { khung: a.length, msTV: q(0.5), msP95: q(0.95), msP99: q(0.99), msMax: +s[s.length - 1].toFixed(1), taiMax: Math.max(...a.map(x => x[1])), taiTong: a.reduce((t, x) => t + x[1], 0), dung: a.reduce((t, x) => t + (x[3] | 0), 0), dungMax: Math.max(...a.map(x => x[3] | 0)), xoay: a.reduce((t, x) => t + (x[4] | 0), 0), k20: a.filter(x => x[0] > 20).length, k50: a.filter(x => x[0] > 50).length, top: a.map((x, i) => [i, Math.round(x[0]), x[1], x[3] | 0]).sort((p, q) => q[1] - p[1]).slice(0, 4).map(x => x.join('/')).join(' '), khungTai8: a.filter(x => x[1] >= 8).length, napTong: a.reduce((t, x) => t + x[2], 0) }; };
    window.__bn = () => { if (window.gc) { window.gc(); window.gc(); } const r = REN.boNho(), g = typeof GLR !== 'undefined' && GLR.bat && GLR.boNho ? GLR.boNho() : null, m = (v) => Math.round(v / 1048576); return { canvas: Math.round(r.canvasMB), soCanvas: r.soCanvas, gpu: g ? m(g.tong) : 0, atlas: g ? g.atlasTrang + '×' + g.atlasDay : '', rieng: g ? m(g.rieng) + '/' + g.riengN : '', tong: Math.round(r.canvasMB + (g ? g.tong / 1048576 : 0)) }; };
  });
  if (process.env.TAO) await ctx.addInitScript(() => { // TAO=1: ghi nơi tạo của mọi canvas → kq.noiTao = MB canvas còn sống cuối trận theo hàm tạo
    const goc = document.createElement.bind(document);
    document.createElement = function (ten, o) { const e = goc(ten, o); if (typeof ten === 'string' && ten.toLowerCase() === 'canvas') e.__tao = String(new Error().stack).split('\n').slice(2, 5).map(s => s.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\/js\//, '').replace(/\?[^:]*/, '')).join(' < '); return e; };
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const q = kb === 'trieu' ? `mode=coop&deck=${D1}&deck2=${D2}&wave=1&net=0&ios=1&seed=777&mana=99999` : `mode=coop&deck=${D1}&deck2=${D2}&wave=${WAVE}&speed=3&fill=1&auto=1&net=0&ios=1&seed=777&mana=99999`;
  await p.goto(`${BASE}index.html?notut=1&${q}&${them}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  const kq = { nhan, kb, them, tai: await p.evaluate(() => { const r = { khungTai: window.__k.length, bn: window.__bn() }; window.__k = []; return r; }) };
  await p.evaluate(() => { // đếm ảnh dựng vào kho đệm (REN.cSet = 1 lần dựng trên CPU) + số lần kho xoay thế hệ, theo khung
    const d = window.__dk = { set: 0, xoay: 0 }, g = REN.cSet; REN.cSet = function (k, c) { const cu = this._cacheCu; const r = g.call(this, k, c); if (c) d.set++; if (this._cacheCu !== cu) d.xoay++; return r; };
  });
  const chay = async (n) => { for (let f = 0; f < n;) { const k = Math.min(30, n - f); await p.evaluate((k) => window.__buoc(k), k); f += k; await p.waitForTimeout(15); } };
  if (process.env.VT) { // VT=240: để màn mở đầu trận (vaotran.js, trận đứng yên) chạy ngần ấy khung trước khi vào trận — lúc game làm nóng ảnh
    await p.evaluate(() => { if (typeof GLR !== 'undefined') GLR.now = window.__now; }); await chay(+process.env.VT);
    kq.vt = await p.evaluate(() => { const r = Object.assign(window.__bn(), window.__tk(window.__k)); window.__k = []; return JSON.stringify(r).replace(/"/g, ''); }); console.error('vt ' + kq.vt);
  }
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; if (typeof GLR !== 'undefined') GLR.now = window.__now; Math.random = window.__mb(555); });
  if (process.env.JS) await p.evaluate(process.env.JS); // JS="…": chạy trong trang ở mốc 0 (gỡ lỗi); SAUJS="…": chạy cuối, in ở kq.sau
  if (kb === 'trieu') {
    await p.evaluate(() => { window.__gKT = ketThuc; ketThuc = () => { }; window.__moiKhung = () => { for (const B of G.ban) { B.tim = 1e9; B.mana = 99999; } }; });
    await chay(240); // 4 s đầu trận (làm nóng nền chạy)
    kq.truocTrieu = await p.evaluate(() => { const r = window.__tk(window.__k); window.__k = []; return r; });
    kq.trieu = [];
    for (let i = 0; i < TRIEU; i++) {
      const id = await p.evaluate(() => { window.__k = []; const B = G.ban[0]; const T = trieu(B, true); return T ? T.id : null; });
      await chay(8);
      const r = await p.evaluate(() => { const a = window.__k; return { ve: Math.max(...a.map(x => x[1])), veTong: a.reduce((t, x) => t + x[1], 0), nap: a.reduce((t, x) => t + x[2], 0), ms: +Math.max(...a.map(x => x[0])).toFixed(1) }; });
      kq.trieu.push(id + ' ve ' + r.ve + ' (tổng ' + r.veTong + ') nap ' + r.nap + ' ms ' + r.ms);
      await chay(37);
    }
    kq.trieuVeMax = Math.max(...kq.trieu.map(s => +s.split(' ve ')[1].split(' ')[0]));
    await p.evaluate(() => { window.__k = []; window.__moiKhung = null; try { window.__gKT(false, 'kiểm thử'); } catch (e) { window.__loi = 'ketThuc: ' + e; } });
    await chay(60);
    kq.ketThuc = await p.evaluate(() => window.__tk(window.__k));
  } else {
    await p.evaluate(() => { ketThuc = () => { }; window.__moiKhung = () => { for (const B of G.ban) { B.tim = 1e9; if (B.mana < 5000) B.mana = 99999; } }; });
    kq.moc = [];
    for (let s = 10; s <= GIAY; s += 10) {
      await chay(600);
      kq.moc.push(await p.evaluate((s) => { const r = Object.assign({ s, wave: G.wave, quai: G.quai.length }, window.__bn(), window.__tk(window.__k)); window.__k = []; return JSON.stringify(r).replace(/"/g, ''); }, s)); console.error(kq.moc[kq.moc.length - 1]);
    }
  }
  kq.cuoi = await p.evaluate(() => ({ bn: window.__bn(), gl: typeof GLR !== 'undefined' && GLR.bat ? GLR.bn : null, wave: G.wave, t: +G.t.toFixed(1) }));
  if (process.env.TAO) kq.noiTao = await p.evaluate(() => { const noi = {}; for (const w of _DS_CV) { const c = w.deref(); if (c && c.width && !c._tha && c.__tao) { const k = c.__tao + (c._goc ? ' [gốc]' : c._doc2 ? ' [bị đọc 2D]' : c._tinh ? (GLR.map && GLR.map.get(c) ? ' [có GPU]' : ' [chưa lên GPU]') : ''); const q = noi[k] || (noi[k] = [0, 0]); q[0] += c.width * c.height * 4; q[1]++; } }
    return Object.entries(noi).sort((a, b) => b[1][0] - a[1][0]).slice(0, 30).map(([k, v]) => (v[0] / 1048576).toFixed(1) + ' MB ×' + v[1] + ' ' + k); });
  if (process.env.SAUJS) kq.sau = await p.evaluate(process.env.SAUJS);
  kq.loi = await p.evaluate(() => window.__loi || ''); kq.errs = errs.slice(0, 5);
  console.log(JSON.stringify(kq, null, 1));
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT });
  await b.close();
})();
