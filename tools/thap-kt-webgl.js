// TURRET MERGE — kiểm lớp vẽ WebGL (js/gl/glr.js): chụp 1 cảnh bất kỳ ở ĐÚNG cùng trạng thái mô phỏng (đồng hồ ảo + rAF bơm tay + Math.random gieo cố định)
// để so hình 2 bản / 2 chế độ vẽ, và thử các đường dự phòng. Cảnh co-op nặng A–D + băm trạng thái luật: tools/thap-kt-hieunang-coop.js.
// Chạy (gốc repo): python3 -m http.server 8788 &
//   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-webgl.js <nhãn> "<query>"      vd: trum_gl1 "mode=solo&trum=hive&wave=10&gl=1"
//   BASE=http://localhost:8788/thap/ · OUT=thư-mục · KHUNG=600 (số khung 1/60 s) · DPR=2 · CHUP=300,600 (chụp ở các khung này)
//   GIU=1      : giữ máu trùm ≥ 60% (trùm sống tới lúc chụp) · CHICANVAS=1: ẩn HUD DOM lúc chụp (HUD chạy theo giờ thật, không tất định) → chỉ so các lớp canvas
//   KHONGGL=1  : getContext('webgl…') trả null → phải tự rơi về 2D, không lỗi trang
//   KHONGGPU=1 : Chromium --disable-gpu --disable-software-rasterizer
//   SOAT=1     : rà canvas đệm bị vẽ lại sau khi đã tải lên GPU mà không báo (GLR.ban / _glD) → in ở kq.cu (rỗng = không sót)
//   JS="…"    : chạy đoạn JS trong trang ở mốc 0 (thử nghiệm / gỡ lỗi) · SAUJS="…": chạy sau khung cuối, kết quả in ở kq.sau
//   CHUPJS="…" : chạy ở mỗi khung chụp, ngay trước khi chụp (rồi vẽ lại dt = 0) — vd dựng trạng thái đang kéo ghép (UI.keo)
//   SOSANH=1   : (với gl=1) ở mỗi khung chụp, chụp thêm CÙNG trạng thái vẽ bằng 2D (tắt GLR tạm, vẽ lại dt = 0) → <nhãn>_<khung>_2d.png, rồi vẽ lại GL → _gl2.png (nền nhiễu)
//                — so đúng từng điểm ảnh 2 đường vẽ (2 lần tải trang không cùng trạng thái hình: ảnh trùm về lúc nào tuỳ mạng)
//   MAT=200,320: khung 200 làm MẤT ngữ cảnh WebGL (WEBGL_lose_context), khung 320 trả lại → không trắng màn, không lỗi trang
// In JSON: lỗi trang, GLR.thongTin(), băm trạng thái gọn (thời gian trận, quái, đạn) để chắc 2 lần chạy cùng trạng thái.
const { chromium } = require('playwright');
const [nhan = 'thu', query = 'mode=solo'] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://localhost:8788/thap/', OUT = process.env.OUT || '.', KHUNG = +(process.env.KHUNG || 600);
const CHUP = (process.env.CHUP || String(KHUNG)).split(',').map(Number), MAT = (process.env.MAT || '').split(',').filter(Boolean).map(Number);
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'].concat(process.env.KHONGGPU ? ['--disable-gpu', '--disable-software-rasterizer'] : []) });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: +(process.env.DPR || 2), isMobile: true, hasTouch: true });
  if (process.env.KHONGGL) await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k) { return /webgl/.test(k) ? null : g.apply(this, arguments); }; });
  await ctx.addInitScript(() => {
    const mb = (a) => function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__mb = mb; Math.random = mb(12345); window.__vt = 1000;
    performance.now = () => window.__vt; Date.now = () => 1.7e12 + window.__vt;
    window.__raf = []; window.requestAnimationFrame = (f) => { window.__raf.push(f); return window.__raf.length; }; window.cancelAnimationFrame = () => { };
    window.__buoc = (n) => { for (let i = 0; i < n; i++) { window.__vt += 1000 / 60; const cb = window.__raf; window.__raf = []; for (const f of cb) { try { f(window.__vt); } catch (e) { window.__loi = String(e && e.stack || e); } } } };
  });
  // SOAT=1: rà CANVAS ĐỆM HÌNH CŨ — đóng dấu mọi lần canvas 2D bị vẽ/đổi cỡ; lớp GL (GLR.soat) báo canvas đã tải texture rồi bị vẽ lại mà không GLR.ban / _glD
  if (process.env.SOAT) await ctx.addInitScript(() => {
    const P = CanvasRenderingContext2D.prototype, dau = (c) => { if (!c) return; c.__sua = (c.__sua | 0) + 1; if (c.__gl) c.__ai = String(new Error().stack).split('\n').slice(3, 7).map(s => s.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/thap\//, '')).join(' < '); };
    for (const f of ['drawImage', 'fillRect', 'clearRect', 'strokeRect', 'fill', 'stroke', 'fillText', 'strokeText', 'putImageData']) { const g = P[f]; P[f] = function () { dau(this.canvas); return g.apply(this, arguments); }; }
    for (const k of ['width', 'height']) { const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, k); Object.defineProperty(HTMLCanvasElement.prototype, k, { get: d.get, set(v) { dau(this); return d.set.call(this, v); }, configurable: true }); }
    window.__cu = {};
    const gan = () => { if (typeof GLR === 'undefined') return setTimeout(gan, 50); GLR.soat = (im, E, tai) => { if (!(im instanceof HTMLCanvasElement) || im.id === 'cv') return; if (tai) { E.__sua = im.__sua | 0; im.__gl = 1; } else if ((im.__sua | 0) !== E.__sua) { const k = im.width + 'x' + im.height + ' ' + (im.__ai || '?'); window.__cu[k] = (window.__cu[k] || 0) + 1; } }; };
    gan();
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(`${BASE}index.html?notut=1&fill=1&auto=1&net=0&ios=1&seed=777&mana=99999&${query}`, { waitUntil: 'load' });
  for (let i = 0; i < 400; i++) { const ok = await p.evaluate(() => { window.__buoc(2); return typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !(typeof TAI !== 'undefined' && (TAI.cho || TAI.doi)); }); if (ok && i > 20) break; await p.waitForTimeout(40); }
  await p.evaluate(() => { // mốc 0 chung: gieo lại ngẫu nhiên, đồng hồ ảo về mốc, trận không kết thúc
    try { ketThuc = () => { }; } catch (e) { } try { VT.dong(); } catch (e) { } G.dung = false; for (const B of G.ban) B.tim = 1e9;
    try { Object.defineProperty(TAI, 'doi', { get: () => false, set() { }, configurable: true }); } catch (e) { }
    Math.random = window.__mb(555); window.__vt = 500000; REN.t = 100; if (typeof VX !== 'undefined') VX.t = 100;
  });
  if (process.env.JS) await p.evaluate(process.env.JS);
  const kq = { nhan, query, anh: [] };
  for (let f = 0; f < KHUNG;) {
    const tiep = Math.min(KHUNG, f + 30, ...CHUP.filter(m => m > f), ...MAT.filter(m => m > f));
    await p.evaluate(([n, giu]) => { for (const B of G.ban) B.tim = 1e9; if (giu) for (const E of G.quai) if (E.trum && !E.chet) E.hp = Math.max(E.hp, E.max * 0.6); window.__buoc(n); }, [tiep - f, !!process.env.GIU]); f = tiep;
    await p.waitForTimeout(15);
    if (MAT[0] === f) kq.mat = await p.evaluate(() => { const e = GLR.gl && GLR.gl.getExtension('WEBGL_lose_context'); if (!e) return 'không có WEBGL_lose_context'; window.__ext = e; e.loseContext(); return 'đã làm mất'; });
    if (MAT[1] === f) kq.lai = await p.evaluate(() => { if (!window.__ext) return 'bỏ'; window.__ext.restoreContext(); return 'đã trả lại'; });
    if (MAT.includes(f)) { await p.waitForTimeout(120); kq['gl@' + f] = await p.evaluate(() => { window.__buoc(2); return { mat: GLR.mat, hien: GLR.hien, bat: GLR.bat }; }); }
    if (CHUP.includes(f) && process.env.CHICANVAS) await p.evaluate(() => document.querySelectorAll('#wrap > :not(canvas), body > :not(#wrap)').forEach(e => { if (e.style) e.style.visibility = 'hidden'; }));
    if (CHUP.includes(f) && process.env.CHUPJS) kq.chupjs = await p.evaluate((js) => { const r = (0, eval)(js); REN.ve(0, REN.a); return r; }, process.env.CHUPJS);
    if (CHUP.includes(f)) { const fn = `${OUT}/${nhan}_${f}.png`; await p.screenshot({ path: fn }); kq.anh.push(fn); }
    if (CHUP.includes(f) && process.env.SOSANH === 'lap') { for (const i of [1, 2]) { await p.evaluate(() => REN.ve(0, REN.a)); await p.screenshot({ path: `${OUT}/${nhan}_${f}_l${i}.png` }); } } // vẽ lại 2 lần CÙNG chế độ: đo nền nhiễu của chính việc vẽ lại
    else if (CHUP.includes(f) && process.env.SOSANH && await p.evaluate(() => typeof GLR !== 'undefined' && GLR.bat)) {
      await p.evaluate(() => { GLR.bat = false; GLR.an(); REN.ve(0, REN.a); }); await p.screenshot({ path: `${OUT}/${nhan}_${f}_2d.png` });
      await p.evaluate(() => { GLR.bat = true; REN.ve(0, REN.a); }); await p.screenshot({ path: `${OUT}/${nhan}_${f}_gl2.png` });
    }
  }
  kq.trang = await p.evaluate(() => ({ t: +G.t.toFixed(3), wave: G.wave, quai: G.quai.length, dan: G.dan.length, hu: G.hu.length, trum: G.quai.filter(E => E.trum).map(E => E.trum + ':' + Math.round(E.hp) + '@' + E.s.toFixed(1)), bam: (() => { let h = 2166136261 >>> 0; const s = JSON.stringify([G.t, G.uid, G.quai.map(E => [E.uid, E.hp, E.s]), G.dan.map(d => [d.x, d.y]), G.ban.map(B => [B.mana, B.t.map(T => T && [T.id, T.sao, T.cd])])]); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); })() }));
  kq.gl = await p.evaluate(() => typeof GLR === 'undefined' ? null : GLR.thongTin());
  if (process.env.SAUJS) kq.sau = await p.evaluate(process.env.SAUJS);
  if (process.env.SOAT) kq.cu = await p.evaluate(() => window.__cu);
  kq.canvas = await p.evaluate(() => Array.from(document.querySelectorAll('canvas')).map(c => c.id || c.className || '?').join(','));
  kq.loi = await p.evaluate(() => window.__loi || ''); kq.errs = errs.slice(0, 5);
  console.log(JSON.stringify(kq));
  await b.close();
})();
