// TURRET MERGE — NẠP TRƯỚC texture của bản WebGL: (1) GHI "ảnh thực dùng" của 1 trận bot (MODE=gt) · (2) ĐO số lần tải texture giữa trận (MODE=do). KE-HOACH.md mục 15.
// Lái tất định như thap-kt-tai-gl.js (đồng hồ ảo + rAF do công cụ bơm; Chromium + GPU phần mềm → chỉ SỐ ĐẾM có nghĩa).
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nap-truoc.js <nhãn> "<query thêm, vd gl=1>"
//   BASE=http://localhost:8765/thap/ · MODE=do|gt · GIAY=180 (giây trận ở 60 khung / giây, tốc 3×) · WAVE=20 · D1 / D2 = 2 bộ bài · DPR=3 (ios=1 tự kẹp 2×) · TRUM=<id> (ép trùm: ?trum=) · AF=<chỉ huy>
//   SHOT=thư-mục: chụp khung trùm ra (+12 khung) và khung chiêu đầu (+6 khung) · KQ=1: cuối trận gọi ketThuc thật + bơm 240 khung (màn kết quả) · BO=1: chạm bỏ qua màn mở đầu ở khung 20
//   MODE=gt: DAT=1 → sau màn mở đầu đặt thẳng bàn: hàng 1 = 5 ụ của bộ bài 7★ (SAO1), hàng 2 = 5★ (SAO2), hàng 3 trống cho bot triệu hồi / ghép; chỉ huy được dùng mỗi ~12 s; giữa trận đổi 6★ / 3★.
// MODE=gt in JSON: { d1, d2, anh: { tên: tầng nét nhất đã VẼ (GLR _lvThay) }, yeuCau: [mọi tên REN.anh đã xin], taiGiua: [tên ảnh gốc tải Image → texture SAU màn mở đầu], trum: [id trùm đã ra], kq }
// MODE=do in JSON: moDau (màn mở đầu: khung, giây, tải canvas / Image, MB) · moc mỗi 10 s · tong: tải canvas / Image mỗi giây (cả trận, sau 10 s đầu, 60 s cuối), tải lúc VẼ (không qua hàng nạp),
//   2 s sau mỗi trùm, 1 s sau mỗi "chiêu lần đầu" (= loại hiệu ứng G.hu[k] / khoảnh khắc SIG / chỉ huy xuất hiện lần đầu), nhiều nhất 1 khung, mạng (số yêu cầu + KB ảnh: trước trận / màn mở đầu / giữa trận).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [nhan = 'thu', them = 'gl=1'] = process.argv.slice(2);
const E = process.env, BASE = E.BASE || 'http://localhost:' + (E.PORT || 8765) + '/thap/', GIAY = +(E.GIAY || 180), VTMAX = +(E.VTMAX || 900), MODE = E.MODE || 'do';
const WAVE = +(E.WAVE || 20), D1 = E.D1 || 'cobac,vughep,sinhdoi,saochep,tudo', D2 = E.D2 || 'bocap,leviathan,ronglua,nemesis,khoisinh';
const T0 = Date.now(), tg = () => ' [' + Math.round((Date.now() - T0) / 1000) + 's]';
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(E.DPR || 3), isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345);
    window.__now = performance.now.bind(performance); window.__vt = 1000;
    performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__f = 0; window.__da = new Set(); window.__up = []; window.__trum = []; window.__thay = new Set(); window.__chieu = []; window.__loaiHu = new Set(); window.__yc = [];
    window.__buoc = (n) => { for (let i = 0; i < n; i++) {
      window.__vt += 1000 / 60; window.__f++;
      if (!window.__fVT && typeof VT !== 'undefined' && VT.mo && !(typeof TAI !== 'undefined' && TAI.cho)) window.__fVT = window.__f;
      const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } }
      if (window.__moiKhung) window.__moiKhung();
    } };
    let so = 0; const tenGoc = new Map();
    const ten = (im) => {
      if (im.__k) return im.__k; let k;
      if (im._nhap) k = 'nhap';
      else if (im === (typeof GLR !== 'undefined' && GLR._vB)) k = 'vec';
      else if (im._goc || im.tagName === 'IMG') {
        if (!tenGoc.has(im)) for (const t in REN.anh) { const a = REN.anh[t]; if (a) { tenGoc.set(a, t); if (a._cv) { tenGoc.set(a._cv, t); if (a._cv._goc) tenGoc.set(a._cv._goc, t); } } }
        k = tenGoc.get(im) || 'goc?' + (++so);
      } else if (im._kho === 'cache') k = 'c:' + im._khoa;
      else if (Array.isArray(im._kho)) k = ten(im._kho[0]) + '#m' + im._kho.indexOf(im);
      else if (im._kho && im._khoa != null) k = 'mau:' + im._khoa;
      else if (im.__chu) k = 'chu:' + im.__chu;
      else k = '?' + (++so) + (im._glD ? 'D' : '') + (im.__tao ? '[' + im.__tao + ']' : '');
      if (k !== 'nhap' && k !== 'vec' && !/^goc\?/.test(k)) im.__k = k;
      return k;
    };
    window.__moc = () => {
      if (typeof REN !== 'undefined' && !REN.__boc) { REN.__boc = 1; const t = REN.taiAnh; REN.taiAnh = function (n) { window.__yc.push([window.__f, n]); return t.apply(this, arguments); }; }
      if (typeof CHU !== 'undefined' && !CHU.__boc) { CHU.__boc = 1; window.__chu = []; const kt = CHU.kyTu; const BO = [CHU.SO, 'ACDEFGHIJLNOPQRSTUVWXYZ?\'()', 'abcdefghijklmnopqrstuvwxyz']; // tờ ký tự mới dựng: [khung, phông đầu, phông đuôi, P, bộ, nét, nối, k]
        CHU.kyTu = function (M, ch, net, noi) { const n = M.to.length, r = kt.apply(this, arguments); if (M.to.length > n) { const q = M.key.split('|'); window.__chu.push([window.__f, q[0], q[1], M.P, BO.findIndex(b => b.indexOf(ch) >= 0), net || 0, noi || '', +(REN.s * REN.dpr).toFixed(5)]); } return r; }; }
      const gl = typeof GLR !== 'undefined' && GLR.gl; if (!gl || gl.__boc) return !!gl; gl.__boc = 1;
      for (const f of ['texImage2D', 'texSubImage2D']) { const g = gl[f].bind(gl); gl[f] = function () {
        const im = arguments[arguments.length - 1];
        if (im && typeof im === 'object' && (im.tagName === 'CANVAS' || im.tagName === 'IMG')) {
          const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
          const loai = im._glD || im._nhap ? 'd' : (im._glV | 0) ? 'b' : 't';
          const k = ten(im), kk = k + ' ' + w + 'x' + h, lap = loai === 't' && window.__da.has(kk) ? 1 : 0; if (loai === 't') window.__da.add(kk);
          window.__up.push([window.__f, k, w, h, loai, GLR._dangNap ? 1 : 0, GLR._taiTha ? 1 : 0, im.__tao || '', lap, GLR._napTruoc ? 1 : 0, im.tagName === 'IMG' ? 1 : 0]);
        }
        return g.apply(null, arguments);
      }; }
      return true;
    };
    window.__bn = () => { const r = REN.boNho(), g = GLR.bat && GLR.boNho ? GLR.boNho() : null, m = (v) => Math.round(v / 1048576); return { cv: Math.round(r.canvasMB), cvN: r.soCanvas, gpu: g ? m(g.tong) : 0, at: g ? g.atlasTrang + 'x' + g.atlasDay : '', rieng: g ? m(g.rieng) + '/' + g.riengN : '', tong: Math.round(r.canvasMB + (g ? g.tong / 1048576 : 0)) }; };
    // tóm tắt tải ảnh TĨNH trong (f0, f1]: cv = canvas → texture · anh = Image → texture · ve = tải ngay lúc vẽ (không qua hàng nạp nền) · max1 = nhiều nhất 1 khung
    window.__tk = (f0, f1) => { const t = window.__up.filter(u => u[0] > f0 && u[0] <= f1 && u[4] === 't'); const pt = {}; for (const u of t) pt[u[0]] = (pt[u[0]] || 0) + 1;
      return { cv: t.filter(u => !u[10]).length, anh: t.filter(u => u[10]).length, ve: t.filter(u => !u[5]).length, truoc: t.filter(u => u[9]).length, max1: Math.max(0, ...Object.values(pt)), khungCo: Object.keys(pt).length }; };
  });
  if (E.TAO) await ctx.addInitScript(() => { const goc = document.createElement.bind(document);
    document.createElement = function (ten, o) { const e = goc(ten, o); if (typeof ten === 'string' && ten.toLowerCase() === 'canvas') e.__tao = String(new Error().stack).split('\n').slice(2, 5).map(s => s.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\/js\//, '').replace(/\?[^:]*/, '').replace(/:\d+\)?$/, '')).join('<'); return e; }; });
  if (E.NONG) await ctx.addInitScript('window.NONG_META = ' + fs.readFileSync(E.NONG, 'utf8') + ';');
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  // mạng: mọi yêu cầu ảnh assets/ theo pha (0 = trước trận: khởi động + màn tải trận · 1 = màn mở đầu · 2 = giữa trận)
  let pha = 0; const mang = [{ n: 0, kb: 0 }, { n: 0, kb: 0 }, { n: 0, kb: 0 }], mangTen = [[], [], []];
  p.on('requestfinished', async (rq) => { try { const u = rq.url(); if (!/\/assets\//.test(u)) return; const s = await rq.sizes(); mang[pha].n++; mang[pha].kb += (s.responseBodySize || 0) / 1024; mangTen[pha].push(u.replace(/^.*\/assets\//, '').replace(/\?.*$/, '')); } catch (e) { } });
  await p.goto(`${BASE}index.html?notut=1&mode=coop&deck=${D1}&deck2=${D2}&wave=${WAVE}&speed=3&fill=1&auto=1&net=0&ios=1&seed=777&mana=99999${E.TRUM ? '&trum=' + E.TRUM : ''}${E.AF ? '&af=' + E.AF : ''}&${them}`, { waitUntil: 'load' });
  for (let i = 0; i < 600; i++) { const ok = await p.evaluate(() => { window.__buoc(2); window.__moc(); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  const chay = async (n) => { for (let f = 0; f < n;) { const k = Math.min(30, n - f); await p.evaluate((k) => window.__buoc(k), k); f += k; await p.waitForTimeout(10); } };
  const kq = { nhan, them, d1: D1, d2: D2 }; console.error('vao tran' + tg());
  pha = 1;
  // MÀN MỞ ĐẦU TRẬN: trận đứng; bơm khung tới khi hết việc làm nóng (ít nhất VT.TONG giây, nhiều nhất TONG + THEM như vaotran.js)
  kq.moDau = await p.evaluate(async ([VTMAX, BO]) => {
    window.__moc(); if (typeof GLR !== 'undefined') GLR.now = window.__now; try { clearTimeout(VT._h); } catch (e) { }
    const f0 = (window.__fVT || window.__f) - 1, toiThieu = Math.round((VT.TONG || 4) * 60), mo = !!VT.mo; let n = window.__f - f0, het = NS.conNong() ? -1 : n;
    VTMAX = Math.min(VTMAX, Math.round(((VT.TONG || 4) + (VT.THEM || 0)) * 60));
    while (mo && n < VTMAX) { window.__buoc(1); n++; const con = NS.conNong(); if (!con && het < 0) het = n; if (con) het = -1; if (BO && n >= 20) break; if (n >= toiThieu && !con) break; if (n % 30 === 0) await new Promise(r => setTimeout(r, 25)); }
    const r = Object.assign({ mo, khung: n, hetViecO: het, giay: +(n / 60).toFixed(2) }, window.__tk(f0, window.__f), window.__bn());
    try { r.con = { nong: REN._nong.length, am: NS.am.ds.length, amVd: NS.am.ds.slice(0, 4).map(x => x.t + '/' + x.b), glr: GLR._napDs.length, np: NS.np ? NS.np.hang.length : -1, npVd: NS.np ? NS.np.hang.slice(0, 6) : [] }; } catch (e) { }
    try { VT.dong(); } catch (e) { } G.dung = false; Math.random = window.__mb(555);
    window.__f0 = window.__f; return r;
  }, [VTMAX, !!E.BO]);
  pha = 2;
  console.error('moDau ' + JSON.stringify(kq.moDau).replace(/"/g, '') + tg());
  await p.evaluate(([MODE, DAT]) => {
    window.__kt = ketThuc; ketThuc = () => { };
    const dat = (s1, s2) => { for (const B of G.ban) { const d = B.deck || []; for (let o = 0; o < 10; o++) { const id = d[o % 5]; if (!id || !SKILLS[id]) continue; B.lv[id] = Math.max(B.lv[id] || 1, 3); try { B.t[o] = sinhU(taoU(B, id, o < 5 ? s1 : s2, o)); } catch (e) { window.__loi = 'dat ' + id + ' ' + e; } } } };
    if (DAT) dat(7, 5);
    window.__moiKhung = () => {
      const f = window.__f - window.__f0;
      for (const B of G.ban) { B.tim = 1e9; if (B.mana < 5000) B.mana = 99999; }
      for (const q of G.quai) if (q.trum && !window.__thay.has(q)) { window.__thay.add(q); window.__trum.push([window.__f, q.trum, G.wave]); }
      for (const o of G.hu || []) if (o && o.k && !window.__loaiHu.has('hu:' + o.k)) { window.__loaiHu.add('hu:' + o.k); window.__chieu.push([window.__f, 'hu:' + o.k]); }
      if (typeof SIG !== 'undefined' && SIG.ds) for (const o of SIG.ds) if (o && o.k && !window.__loaiHu.has('sig:' + o.k)) { window.__loaiHu.add('sig:' + o.k); window.__chieu.push([window.__f, 'sig:' + o.k]); }
      for (const B of G.ban) if (B.mv && B.mv.cd > 0 && !window.__loaiHu.has('mv:' + B.mv.id)) { window.__loaiHu.add('mv:' + B.mv.id); window.__chieu.push([window.__f, 'mv:' + B.mv.id]); }
      if (MODE === 'gt') {
        if (f % 720 === 360) for (const B of G.ban) { try { B.mv.cd = 0; dungMV(B); } catch (e) { } }
        if (DAT && f % 1800 === 900) dat(...[[6, 3], [7, 4], [5, 2], [7, 6]][(f / 1800 | 0) % 4]);
      }
    };
  }, [MODE, !!E.DAT]);
  if (E.JS) await p.evaluate(E.JS);
  kq.moc = []; let daTrum = 0, daChieu = 0;
  for (let s = 10; s <= GIAY; s += 10) {
    for (let i = 0; i < 20; i++) { // 30 khung một lượt: kịp chụp khung trùm ra / chiêu đầu
      await chay(30);
      if (E.SHOT) {
        const tt = await p.evaluate(() => ({ trum: window.__trum.length, f: window.__f, ft: window.__trum.length ? window.__trum[window.__trum.length - 1][0] : 0, sig: window.__chieu.filter(c => /^sig:/.test(c[1])).length, fs: (window.__chieu.filter(c => /^sig:/.test(c[1])).pop() || [0])[0] }));
        if (tt.trum > daTrum && tt.f - tt.ft <= 40) { daTrum = tt.trum; await p.screenshot({ path: path.join(E.SHOT, nhan + '_trum' + daTrum + '.png') }); }
        if (tt.sig > daChieu && tt.f - tt.fs <= 40 && daChieu < 4 && s > 10) { daChieu = tt.sig; await p.screenshot({ path: path.join(E.SHOT, nhan + '_chieu' + daChieu + '.png') }); }
      }
    }
    const r = await p.evaluate((s) => JSON.stringify(Object.assign({ s, w: G.wave, q: G.quai.length }, window.__tk(window.__f - 600, window.__f), window.__bn())).replace(/"/g, ''), s);
    kq.moc.push(r); console.error(r + tg());
  }
  if (E.KQ) { // màn kết quả thật: gọi ketThuc gốc rồi bơm 240 khung
    kq.ketQua = await p.evaluate(async () => { const f0 = window.__f; try { ketThuc = window.__kt; ketThuc(false, 'het_tim'); } catch (e) { return 'loi ' + e; } for (let i = 0; i < 8; i++) { window.__buoc(30); await new Promise(r => setTimeout(r, 30)); } window.__fKQ = f0; return Object.assign({ kt: !!G.ketThuc }, window.__tk(f0, window.__f), { yc: window.__yc.filter(e => e[0] > f0).map(e => e[1]), khoa: window.__up.filter(u => u[0] > f0 && u[4] === 't').slice(0, 20).map(u => u[1] + ' ' + u[2] + 'x' + u[3]) }); });
    if (E.SHOT) await p.screenshot({ path: path.join(E.SHOT, nhan + '_ketqua.png') });
  }
  kq.tong = await p.evaluate((GIAY) => {
    const f0 = window.__f0, f1 = f0 + GIAY * 60, t = window.__up.filter(u => u[0] > f0 && u[0] <= f1 && u[4] === 't');
    const ps = (a, s) => +(a.length / s).toFixed(2), cv = t.filter(u => !u[10]), an = t.filter(u => u[10]);
    const sau = (a, g) => a.filter(u => u[0] > f0 + g * 60);
    const cua = (ds, n) => ds.map(([f, id, w]) => { const x = t.filter(u => u[0] >= f && u[0] < f + n); return { id, wave: w, giay: +((f - f0) / 60).toFixed(1), cv: x.filter(u => !u[10]).length, anh: x.filter(u => u[10]).length, ve: x.filter(u => !u[5]).length, khoa: x.slice(0, 8).map(u => (u[5] ? '' : '!') + u[1] + ' ' + u[2] + 'x' + u[3]) }; });
    const trum = cua(window.__trum.filter(e => e[0] > f0 && e[0] <= f1), 120), chieu = cua(window.__chieu.filter(e => e[0] > f0 + 600 && e[0] <= f1), 60);
    const pt = {}; for (const u of t) pt[u[0]] = (pt[u[0]] || 0) + 1; const pt10 = {}; for (const u of sau(t, 10)) pt10[u[0]] = (pt10[u[0]] || 0) + 1;
    const nhom = {}; for (const u of sau(t, 10)) { const k = (u[10] ? 'I ' : 'C ') + u[1].replace(/^c:(dai\|)?/, 'c:').replace(/[|#].*$/, '').replace(/^(c:)?(chu|mau|\?).*/, '$2').slice(0, 34); nhom[k] = (nhom[k] || 0) + 1; }
    return { giay: GIAY, wave: G.wave,
      cvGiay: ps(cv, GIAY), anhGiay: ps(an, GIAY), cv: cv.length, anh: an.length,
      cvGiay10: ps(sau(cv, 10), GIAY - 10), anhGiay10: ps(sau(an, 10), GIAY - 10), cv10: sau(cv, 10).length, anh10: sau(an, 10).length,
      cvGiayCuoi60: ps(sau(cv, GIAY - 60), 60), anhGiayCuoi60: ps(sau(an, GIAY - 60), 60),
      luc_ve: t.filter(u => !u[5]).length, luc_ve10: sau(t, 10).filter(u => !u[5]).length, luc_ve10_anh: sau(t, 10).filter(u => !u[5] && u[10]).length,
      max1Khung: Math.max(0, ...Object.values(pt)), max1Khung10: Math.max(0, ...Object.values(pt10)), khungCoTai10: Object.keys(pt10).length,
      trum, trumTB: trum.length ? { cv: +(trum.reduce((n, e) => n + e.cv, 0) / trum.length).toFixed(1), anh: +(trum.reduce((n, e) => n + e.anh, 0) / trum.length).toFixed(1), ve: +(trum.reduce((n, e) => n + e.ve, 0) / trum.length).toFixed(1) } : null,
      chieuN: chieu.length, chieuCoTai: chieu.filter(e => e.cv + e.anh > 0).length, chieuTB: chieu.length ? { cv: +(chieu.reduce((n, e) => n + e.cv, 0) / chieu.length).toFixed(2), anh: +(chieu.reduce((n, e) => n + e.anh, 0) / chieu.length).toFixed(2), ve: +(chieu.reduce((n, e) => n + e.ve, 0) / chieu.length).toFixed(2) } : null,
      chieu: chieu.filter(e => e.cv + e.anh > 0).slice(0, 30),
      nhom10: Object.entries(nhom).sort((x, y) => y[1] - x[1]).slice(0, 80).map(e => e[1] + ' ' + e[0]).join(' · '), bn: GLR.bn };
  }, GIAY);
  kq.mang = { truocTran: mang[0], moDau: mang[1], giuaTran: mang[2], tenMoDau: mangTen[1].slice(0, 400), tenGiua: mangTen[2].slice(0, 400) };
  for (const m of mang) m.kb = Math.round(m.kb);
  if (MODE === 'gt') {
    Object.assign(kq, await p.evaluate(() => {
      const anh = {}, f0 = window.__f0; for (const t in REN.anh) { const c = REN.anh[t] && REN.anh[t]._cv; if (c && c._lvThay != null) anh[t] = c._lvThay; }
      const co = {}; for (const t in REN.anh) { const a = REN.anh[t]; co[t] = [a.naturalWidth | 0, a.naturalHeight | 0]; }
      return { mv: G.ban.map(B => B.mv && B.mv.id), chuGhi: typeof NS !== 'undefined' && NS.np ? NS.np.chuGhi : null, np: typeof NS !== 'undefined' && NS.np ? NS.np.dem : null, k: +(REN.s * REN.dpr).toFixed(5), chu: (window.__chu || []).map(e => [e[0] - f0].concat(e.slice(1))), anh, co, yeuCau: Object.keys(REN.anh), ycGiua: window.__yc.filter(e => e[0] > f0).map(e => e[1]), taiGiua: [...new Set(window.__up.filter(u => u[0] > f0 && u[10] && u[4] === 't').map(u => u[1]))], trumRa: [...new Set(window.__trum.map(e => e[1]))], chieuLoai: [...window.__loaiHu] };
    }));
    delete kq.mang.tenMoDau; delete kq.tong.nhom10; delete kq.tong.chieu;
  }
  if (MODE !== 'gt') Object.assign(kq, await p.evaluate(() => ({ k: +(REN.s * REN.dpr).toFixed(5), np: typeof NS !== 'undefined' && NS.np ? NS.np.dem : null, chuGhi: typeof NS !== 'undefined' && NS.np ? NS.np.chuGhi : null, chuTo: (window.__chu || []).length })));
  if (E.SAUJS) kq.sau = await p.evaluate(E.SAUJS);
  kq.loi = await p.evaluate(() => window.__loi || ''); kq.errs = errs.slice(0, 5);
  console.log(JSON.stringify(kq, null, MODE === 'gt' ? 0 : 1));
  await b.close();
})();
