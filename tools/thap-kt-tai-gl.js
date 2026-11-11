// TURRET MERGE — đếm TẢI TEXTURE của lớp vẽ WebGL theo TỪNG ẢNH trong 1 trận co-op dài (ai tải, mấy lần, lúc nào) — lái tất định như thap-kt-bonho-gl.js.
// Mục đích (11/11 đêm, iPhone người dùng: khung chậm nào cũng có 2–6 lần tải texture): phân biệt (a) tải LẦN ĐẦU bị rải giữa trận với (b) tải LẠI cùng 1 ảnh
//   (texture bị dọn / bản CPU dựng lại / canvas đệm dựng lại theo khoá). Máy đo tải texture gần như miễn phí → chỉ SỐ ĐẾM mới có nghĩa.
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-tai-gl.js <nhãn> "<query thêm>"
//   BASE=http://localhost:8765/thap/ (hoặc PORT=8765) · GIAY=180 (giây trận, 60 khung / giây, tốc 3×) · WAVE=25 · D1 / D2 = 2 bộ bài · DPR=3 (ios=1 tự kẹp 2×)
//   VTMAX=900: số khung tối đa cho màn mở đầu trận (trận đứng; chạy tới khi NS.conNong() hết việc, ít nhất VT.TONG giây) · SHOT=thư-mục: chụp lúc có trùm + cuối trận
// Cách đếm: bọc gl.texImage2D / gl.texSubImage2D (nguồn là ảnh / canvas) → mỗi lần tải ghi [khung, khoá, rộng, cao, loại]:
//   (tk.anh = nguồn là Image — tải THẲNG ảnh gốc, 1 lần / ảnh; tk.cvT = nguồn là canvas dựng trên CPU; cvN = số canvas còn điểm ảnh; tex = số texture; lenhTB = lệnh vẽ GL / khung; ao = số canvas ảo đã tạo)
//   loại 'd' = canvas vẽ lại mỗi lần vẽ (_glD / canvas nháp: cụm vector, Hive lăn cầu) · 'b' = canvas vẽ lại tại chỗ (GLR.ban: tấm đếm…) · 't' = ảnh tĩnh (phải ~0 giữa trận).
//   Khoá ảnh tĩnh: tên ảnh gốc (REN.anh) · 'c:<khoá kho đệm>' · '<gốc>#m<tầng mip>' · 'mau:<khoá tô màu>' · 'chu:<chữ>' (kho chữ của GLR) · '?<số>' (canvas khác, theo đối tượng).
// In JSON: moDau (màn mở đầu: số khung, số lần tải) · mỗi 10 s: tải tĩnh / d / b, MB · tong: tải tĩnh / giây (mọi cỡ và nguồn ≥ 256 điểm), số khoá tải > 1 lần (+ danh sách),
//   tải nhiều nhất 1 khung, tải tĩnh trong 2 s sau mỗi lần trùm ra (+ khoá), danh sách ảnh tĩnh tải giữa trận theo nhóm tên.
const { chromium } = require('playwright');
const [nhan = 'thu', them = 'gl=1'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:' + (process.env.PORT || 8765) + '/thap/', GIAY = +(process.env.GIAY || 180), VTMAX = +(process.env.VTMAX || 900);
const fs = require('fs');
const WAVE = +(process.env.WAVE || 25), D1 = process.env.D1 || 'bocap,sinhdoi,tudo,cobac,saochep', D2 = process.env.D2 || 'leviathan,ronglua,nemesis,khoisinh,vughep';
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345);
    window.__now = performance.now.bind(performance); window.__vt = 1000;
    performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__f = 0; window.__da = new Set(); window.__up = []; window.__trum = []; window.__thay = new Set(); window.__ms = [];
    window.__buoc = (n) => { for (let i = 0; i < n; i++) {
      window.__vt += 1000 / 60; window.__f++; const t0 = window.__now();
      if (!window.__fVT && typeof VT !== 'undefined' && VT.mo && !(typeof TAI !== 'undefined' && TAI.cho)) window.__fVT = window.__f; // khung đầu của màn mở đầu trận
      const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } }
      window.__ms.push(window.__now() - t0);
      if (typeof GLR !== 'undefined' && GLR.dangVe === false && GLR.hien) { window.__lenh = (window.__lenh || 0) + GLR.dem.lenh; window.__lenhN = (window.__lenhN || 0) + 1; } // lệnh vẽ GL trung bình / khung (cộng dồn cả trận)
      if (window.__moiKhung) window.__moiKhung();
    } };
    // tên của 1 nguồn tải
    let so = 0; const tenGoc = new Map();
    const ten = (im) => {
      if (im.__k) return im.__k; let k;
      if (im._nhap) k = 'nhap';
      else if (im === (typeof GLR !== 'undefined' && GLR._vB)) k = 'vec';
      else if (im._goc || im.tagName === 'IMG') {
        if (!tenGoc.has(im)) for (const t in REN.anh) { const a = REN.anh[t]; if (a) { tenGoc.set(a, t); if (a._cv) tenGoc.set(a._cv, t); } }
        k = tenGoc.get(im) || 'goc?' + (++so);
      } else if (im._kho === 'cache') k = 'c:' + im._khoa;
      else if (Array.isArray(im._kho)) k = ten(im._kho[0]) + '#m' + im._kho.indexOf(im);
      else if (im._kho && im._khoa != null) k = 'mau:' + im._khoa;
      else if (im.__chu) k = 'chu:' + im.__chu;
      else k = '?' + (++so) + (im._glD ? 'D' : '') + (im.__tao ? '[' + im.__tao + ']' : '');
      if (k !== 'nhap' && k !== 'vec' && !/\?/.test(k)) im.__k = k; else if (/\?/.test(k)) im.__k = k;
      return k;
    };
    window.__moc = () => { // bọc 2 lệnh tải của ngữ cảnh GL hiện tại (gọi lại sau khi mất / có lại ngữ cảnh cũng không sao)
      const gl = GLR.gl; if (!gl || gl.__boc) return !!gl; gl.__boc = 1;
      for (const f of ['texImage2D', 'texSubImage2D']) { const g = gl[f].bind(gl); gl[f] = function () {
        const im = arguments[arguments.length - 1];
        if (im && typeof im === 'object' && (im.tagName === 'CANVAS' || im.tagName === 'IMG')) {
          const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
          if (!im.__chu && GLR.khoChu) { /* canvas chữ: gắn tên lười */ }
          const loai = im._glD || im._nhap ? 'd' : (im._glV | 0) ? 'b' : 't';
          const k = ten(im), kk = k + ' ' + w + 'x' + h, lap = loai === 't' && window.__da.has(kk) ? 1 : 0; if (loai === 't') window.__da.add(kk);
          window.__up.push([window.__f, k, w, h, loai, GLR._dangNap ? 1 : 0, GLR._taiTha ? 1 : 0, im.__tao || '', lap, GLR._napTruoc ? 1 : 0, im.tagName === 'IMG' ? 1 : 0]);
        }
        return g.apply(null, arguments);
      }; }
      const s = GLR.khoChu.set.bind(GLR.khoChu); GLR.khoChu.set = (k, E) => { if (E && E.c) E.c.__chu = k.split('\n').slice(0, 2).join(' ') + ' ' + E.c.width; return s(k, E); };
      return true;
    };
    window.__bn = () => { const r = REN.boNho(), g = GLR.bat && GLR.boNho ? GLR.boNho() : null, m = (v) => Math.round(v / 1048576); return { cv: Math.round(r.canvasMB), cvN: r.soCanvas, tex: g ? g.atlasTrang + g.riengN : 0, ao: g ? (g.bn.ao | 0) : 0, gpu: g ? m(g.tong) : 0, at: g ? g.atlasTrang + 'x' + g.atlasDay : '', rieng: g ? m(g.rieng) + '/' + g.riengN : '', tong: Math.round(r.canvasMB + (g ? g.tong / 1048576 : 0)) }; };
    // tóm tắt các lần tải từ khung f0 (không gồm) trở đi
    window.__tk = (f0, f1) => { const a = window.__up.filter(u => u[0] > f0 && u[0] <= f1), t = a.filter(u => u[4] === 't'); const pk = {}; for (const u of a) pk[u[0]] = (pk[u[0]] || 0) + 1; const pt = {}; for (const u of t) pt[u[0]] = (pt[u[0]] || 0) + 1;
      return { tinh: t.length, anh: t.filter(u => u[10]).length, cvT: t.filter(u => !u[10]).length, lenhTB: window.__lenhN ? +(window.__lenh / window.__lenhN).toFixed(1) : 0, lap: t.filter(u => u[8]).length, luc_ve: t.filter(u => !u[5]).length, nap_truoc: t.filter(u => u[9]).length, kb: Math.round(t.reduce((n, u) => n + u[2] * u[3] * 4, 0) / 1024), tinh256: t.filter(u => Math.max(u[2], u[3]) >= 256).length, d: a.filter(u => u[4] === 'd').length, b: a.filter(u => u[4] === 'b').length, max1: Math.max(0, ...Object.values(pk)), maxTinh1: Math.max(0, ...Object.values(pt)), khungCoTinh: Object.keys(pt).length }; };
  });
  if (process.env.TAO) await ctx.addInitScript(() => { // TAO=1: ghi nơi tạo của mọi canvas → khoá '?…[nơi tạo]' + bảng tải 'b' / 'd' theo nơi tạo (kq.tong.noiB / noiD)
    const goc = document.createElement.bind(document);
    document.createElement = function (ten, o) { const e = goc(ten, o); if (typeof ten === 'string' && ten.toLowerCase() === 'canvas') e.__tao = String(new Error().stack).split('\n').slice(2, 5).map(s => s.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\/js\//, '').replace(/\?[^:]*/, '').replace(/:\d+\)?$/, '')).join('<'); return e; };
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}index.html?notut=1&mode=coop&deck=${D1}&deck2=${D2}&wave=${WAVE}&speed=3&fill=1&auto=1&net=0&ios=1&seed=777&mana=99999&${them}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); if (typeof GLR !== 'undefined' && GLR.gl) window.__moc(); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  const chay = async (n) => { for (let f = 0; f < n;) { const k = Math.min(30, n - f); await p.evaluate((k) => window.__buoc(k), k); f += k; await p.waitForTimeout(10); } };
  const kq = { nhan, them };
  // MÀN MỞ ĐẦU TRẬN: trận đứng; bơm khung tới khi hết việc làm nóng (và ít nhất VT.TONG giây như thật), tối đa VTMAX khung
  kq.moDau = await p.evaluate(async (VTMAX) => {
    window.__moc(); GLR.now = window.__now; try { clearTimeout(VT._h); } catch (e) { }
    const f0 = (window.__fVT || window.__f) - 1, toiThieu = Math.round((VT.TONG || 4) * 60), mo = !!VT.mo; let n = window.__f - f0, het = NS.conNong() ? -1 : n;
    VTMAX = Math.min(VTMAX, Math.round(((VT.TONG || 4) + (VT.THEM || 0)) * 60)); // như vaotran.js: TONG giây, còn việc làm nóng thì nán thêm tối đa THEM giây
    while (mo && n < VTMAX) { window.__buoc(1); n++; const con = NS.conNong(); if (!con && het < 0) het = n; if (con) het = -1; if (n >= toiThieu && !con) break; if (n % 30 === 0) await new Promise(r => setTimeout(r, 5)); }
    const r = Object.assign({ mo, khung: n, hetViecO: het, giay: +(n / 60).toFixed(1) }, window.__tk(f0, window.__f), window.__bn());
    try { VT.dong(); } catch (e) { } G.dung = false; Math.random = window.__mb(555);
    window.__f0 = window.__f; return r;
  }, VTMAX);
  console.error('moDau ' + JSON.stringify(kq.moDau).replace(/"/g, ''));
  await p.evaluate(() => { ketThuc = () => { }; window.__moiKhung = () => { for (const B of G.ban) { B.tim = 1e9; if (B.mana < 5000) B.mana = 99999; }
    for (const q of G.quai) if (q.trum && !window.__thay.has(q)) { window.__thay.add(q); window.__trum.push([window.__f, q.trum, G.wave]); } }; });
  if (process.env.JS) await p.evaluate(process.env.JS); // JS="…": chạy trong trang ở mốc 0 (gỡ lỗi) · SAUJS="…": chạy cuối, in ở kq.sau
  kq.moc = []; let shotTrum = 0;
  for (let s = 10; s <= GIAY; s += 10) {
    await chay(600);
    const r = await p.evaluate((s) => JSON.stringify(Object.assign({ s, w: G.wave, q: G.quai.length }, window.__tk(window.__f - 600, window.__f), window.__bn())).replace(/"/g, ''), s);
    kq.moc.push(r); console.error(r);
    if (process.env.SHOT && !shotTrum && await p.evaluate(() => G.quai.some(q => q.trum))) { shotTrum = 1; await p.screenshot({ path: process.env.SHOT + '/' + nhan + '_trum.png' }); }
  }
  if (process.env.SHOT) await p.screenshot({ path: process.env.SHOT + '/' + nhan + '_cuoi.png' });
  kq.tong = await p.evaluate((GIAY) => {
    const f0 = window.__f0, a = window.__up.filter(u => u[0] > f0), t = a.filter(u => u[4] === 't'), tk = window.__tk(f0, window.__f);
    const lan = {}; for (const u of t) { const k = u[1] + ' ' + u[2] + 'x' + u[3]; (lan[k] || (lan[k] = [])).push(u[0] - f0); }
    const lap = Object.entries(lan).filter(e => e[1].length > 1);
    const nhom = {}; for (const u of t) { const k = u[1].replace(/^c:(dai\|)?/, 'c:').replace(/[|#].*$/, '').replace(/_?\d+$/, '').replace(/^(c:)?(chu|mau|\?).*/, '$2').slice(0, 26); nhom[k] = (nhom[k] || 0) + 1; }
    const sauTrum = window.__trum.map(([f, id, w]) => { const x = t.filter(u => u[0] >= f && u[0] < f + 120); return { id, wave: w, giay: +((f - f0) / 60).toFixed(1), tai: x.length, tai256: x.filter(u => Math.max(u[2], u[3]) >= 256).length, khoa: x.slice(0, 12).map(u => u[1] + ' ' + u[2] + 'x' + u[3]) }; });
    const noi = (L) => { const m = {}; for (const u of a) if (u[4] === L) { const k = (u[7] || u[1]).replace(/^\?\d+D?/, '?') + ' ~' + u[2] + 'x' + u[3]; m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 14).map(e => e[1] + ' ' + e[0]); };
    const s = window.__ms.slice(-(window.__f - f0)).sort((x, y) => x - y);
    return { giay: GIAY, taiTinh: tk.tinh, taiTinhGiay: +(tk.tinh / GIAY).toFixed(2), tai256: tk.tinh256, tai256Giay: +(tk.tinh256 / GIAY).toFixed(2), taiD: tk.d, taiB: tk.b, max1Khung: tk.max1, maxTinh1Khung: tk.maxTinh1, khungCoTaiTinh: tk.khungCoTinh,
      noiB: noi('b'), noiD: noi('d'), khoaTinh: Object.keys(lan).length, khoaLap: lap.length, taiLap: lap.reduce((n, e) => n + e[1].length - 1, 0), taiLap256: lap.filter(e => { const m = e[0].match(/ (\d+)x(\d+)$/); return Math.max(+m[1], +m[2]) >= 256; }).reduce((n, e) => n + e[1].length - 1, 0),
      lapTop: lap.sort((x, y) => y[1].length - x[1].length).slice(0, 40).map(e => e[1].length + '× ' + e[0] + ' @' + e[1].slice(0, 6).map(f => Math.round(f / 60)).join(',')),
      nhom: Object.entries(nhom).sort((x, y) => y[1] - x[1]).slice(0, 40).map(e => e[1] + ' ' + e[0]).join(' · '), sauTrum, msTV: +s[s.length >> 1].toFixed(1), msMax: +s[s.length - 1].toFixed(1), bn: GLR.bn, wave: G.wave };
  }, GIAY);
  if (process.env.SAUJS) kq.sau = await p.evaluate(process.env.SAUJS);
  kq.loi = await p.evaluate(() => window.__loi || ''); kq.errs = errs.slice(0, 5);
  console.log(JSON.stringify(kq, null, 1));
  await b.close();
})();
