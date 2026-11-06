// TURRET MERGE — ĐO "NÓNG MÁY" (CPU mỗi khung) trong trận nặng chuẩn: wave 13, bàn ~12 ụ (đa số Mana Core/ngoisao có tấm 'n/50'),
// hàng dài quái nhện + tinh anh bọ lớn, đạn sao. iPhone 13 (390×844, DPR 3). Chromium + CDP (WebKit: không có trong máy kiểm).
// Chạy (gốc repo):  python3 -m http.server 8765 &   rồi   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nong.js
//   CHE=solo|coop|pvp|tatca (mặc định solo,coop) · GIAY=180 (thời lượng trận mỗi chế độ) · OUT=thư mục ảnh/JSON
//   NGUONG_MS=… : TRƯỢT (thoát mã 1) nếu CPU trung bình mỗi khung (TaskDuration/khung, đo bằng CDP) vượt ngưỡng
//   MOC=1 : ghi mốc vào tools/thap-kt-nong-moc.json ; mặc định so với mốc: trượt nếu > mốc × 1.35 (máy kiểm dao động)
//   DPR_THUC=1 : ép canvas 3× như bản cũ (để đo "trước")
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/nong/';
const GIAY = +(process.env.GIAY || 180);
const CHE = (process.env.CHE || 'solo,coop').replace('tatca', 'solo,coop,pvp').split(',');
const TEN = process.env.TEN || 'sau';
const MOC_F = path.join(__dirname, 'thap-kt-nong-moc.json');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

// bàn chuẩn giống ảnh người dùng: 9 Mana Core (ngoisao) sao 1–3 + 3 ụ khác, 3 ô trống
const BAN = [['ngoisao', 3], null, ['ngoisao', 3], null, ['ngoisao', 1], ['ngoisao', 2], ['ngoisao', 2], null, ['ngoisao', 2], ['ngoisao', 2],
  ['ngoisao', 1], ['lien', 2], ['canon', 3], ['ngoisao', 3], ['bang', 1]];
function datBan(BAN) {
  for (const B of G.ban) {
    B.tim = 1e9; B.timMax = 1e9;
    for (let o = 0; o < 15; o++) { const v = BAN[o]; if (!v) { B.t[o] = null; continue; } const T = sinhU(taoU(B, v[0], v[1], o)); B.t[o] = T; }
    B.ai = false;
  }
}
// đếm lệnh vẽ canvas / RAF / hẹn giờ / DOM trong 1 cửa sổ ngắn (chạy RIÊNG với lúc đo thời gian: bọc hàm làm chậm)
function DEM(ms) {
  return new Promise(ok => {
    const P = CanvasRenderingContext2D.prototype, dem = {}, goc = {};
    const ds = ['drawImage', 'fillText', 'strokeText', 'measureText', 'fillRect', 'save', 'restore', 'beginPath', 'arc', 'fill', 'stroke', 'createRadialGradient', 'createLinearGradient', 'getImageData', 'putImageData'];
    for (const k of ds) { goc[k] = P[k]; dem[k] = 0; P[k] = function () { dem[k]++; return goc[k].apply(this, arguments); }; }
    const dGco = Object.getOwnPropertyDescriptor(P, 'globalCompositeOperation'), dSb = Object.getOwnPropertyDescriptor(P, 'shadowBlur'), dFi = Object.getOwnPropertyDescriptor(P, 'filter');
    let lighter = 0, shadow = 0, filt = 0;
    Object.defineProperty(P, 'globalCompositeOperation', { configurable: true, get() { return dGco.get.call(this); }, set(v) { if (v === 'lighter') lighter++; dGco.set.call(this, v); } });
    Object.defineProperty(P, 'shadowBlur', { configurable: true, get() { return dSb.get.call(this); }, set(v) { if (v > 0) shadow++; dSb.set.call(this, v); } });
    if (dFi) Object.defineProperty(P, 'filter', { configurable: true, get() { return dFi.get.call(this); }, set(v) { if (v && v !== 'none') filt++; dFi.set.call(this, v); } });
    const raf0 = window.requestAnimationFrame; let rafCb = 0;
    window.requestAnimationFrame = function (f) { rafCb++; return raf0.call(window, f); };
    const si0 = window.setInterval, st0 = window.setTimeout; let siN = 0, stN = 0;
    window.setTimeout = function () { stN++; return st0.apply(window, arguments); };
    window.setInterval = function () { siN++; return si0.apply(window, arguments); };
    const ce = document.createElement; let cv = 0;
    let mut = 0; const mo = new MutationObserver(ms => { mut += ms.length; }); mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    let khung = 0; const dem1 = () => { khung++; if (performance.now() - t0 < ms) raf0.call(window, dem1); }; const t0 = performance.now(); raf0.call(window, dem1);
    const vx = (typeof VX !== 'undefined' && VX.ds) ? VX.ds.length : -1;
    // đếm canvas tạo mới (qua bộ đếm WeakRef của render.js)
    const cv0 = typeof _DS_CV !== 'undefined' ? _DS_CV.length : 0;
    st0.call(window, () => {
      for (const k of ds) P[k] = goc[k];
      Object.defineProperty(P, 'globalCompositeOperation', dGco); Object.defineProperty(P, 'shadowBlur', dSb); if (dFi) Object.defineProperty(P, 'filter', dFi);
      window.requestAnimationFrame = raf0; window.setInterval = si0; window.setTimeout = st0; mo.disconnect();
      const n = Math.max(1, khung), r = {};
      for (const k of ds) r[k] = +(dem[k] / n).toFixed(1);
      Object.assign(r, { khung, lighter: +(lighter / n).toFixed(1), shadowBlur: +(shadow / n).toFixed(1), filter: +(filt / n).toFixed(1), rafCallbackMoiKhung: +(rafCb / n).toFixed(2),
        setTimeoutMoiGiay: +(stN * 1000 / ms).toFixed(1), domDoiMoiKhung: +(mut / n).toFixed(1), canvasMoiTao: (typeof _DS_CV !== 'undefined' ? _DS_CV.length : 0) - cv0,
        quai: G.quai.length, dan: G.dan.length, hu: G.hu.length, fx: (FX.hat || []).length + (FX.anim || []).length + (FX.chu || []).length, wave: G.wave,
        hoatAnhCSS: document.getAnimations().filter(a => a.playState === 'running').map(a => { const e = a.effect && a.effect.target; return (e ? (e.id || (typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName)) : '?') + ':' + (a.animationName || a.constructor.name); }).slice(0, 20),
        canvas: REN.cv.width + 'x' + REN.cv.height, dpr: REN.dpr });
      ok(r);
    }, ms);
  });
}
async function doMot(b, che) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const loi = []; p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Firebase|firebase|WebSocket|net::/.test(m.text())) loi.push('console: ' + m.text()); });
  let mang = 0, mangTran = 0, trongTran = false; const dsMang = []; p.on('request', (r) => { mang++; if (trongTran) { mangTran++; if (dsMang.length < 12) dsMang.push(r.url().replace(BASE, '')); } });
  const dprQ = (process.env.DPR_THUC ? '&dpr=3' : '') + (process.env.QX || '');
  await p.goto(BASE + `?mode=${che}&deck=ngoisao,lien,canon,bang,tia&deck2=ngoisao,lien,canon,bang,tia&wave=13&mana=900&seed=777${dprQ}`, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 90000 });
  await p.evaluate(datBan, BAN);
  if (process.env.EVAL) await p.evaluate(process.env.EVAL);
  await sleep(4000); trongTran = true;
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Performance.enable');
  const met = async () => { const r = await cdp.send('Performance.getMetrics'); const o = {}; for (const m of r.metrics) o[m.name] = m.value; return o; };
  const khung = () => p.evaluate(() => (window.__k = window.__k || { n: 0 }, window.__k.n));
  await p.evaluate(() => { const k = window.__k = { n: 0, mx: 0, dai: 0, last: 0 }; const f = (t) => { if (k.last) { const d = t - k.last; if (d > k.mx) k.mx = d; if (d > 25) k.dai++; } k.last = t; k.n++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const m0 = await met(), k0 = await khung(), t0 = Date.now();
  // giữa trận: chụp vết (trace) 6 s để tách JS / vẽ / GC / giải mã ảnh
  await sleep(Math.min(20000, GIAY * 400));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' });
  await sleep(6000);
  const ev = await new Promise(async (ok) => {
    cdp.once('Tracing.tracingComplete', async ({ stream }) => {
      let s = ''; for (;;) { const r = await cdp.send('IO.read', { handle: stream }); s += r.data; if (r.eof) break; } await cdp.send('IO.close', { handle: stream });
      try { ok(JSON.parse(s).traceEvents || JSON.parse(s)); } catch (e) { ok([]); }
    });
    await cdp.send('Tracing.end');
  });
  const tg = {}; let nKhungTr = 0;
  const main = ev.find(e => e.name === 'thread_name' && e.args && e.args.name === 'CrRendererMain');
  for (const e of ev) {
    if (e.ph !== 'X' || !e.dur) continue; if (main && (e.pid !== main.pid || e.tid !== main.tid)) continue;
    const k = /GC|GCEvent|V8.GC/.test(e.name) ? 'GC' : e.name; tg[k] = (tg[k] || 0) + e.dur / 1000;
  }
  for (const e of ev) if (e.name === 'FireAnimationFrame' && (!main || e.pid === main.pid)) nKhungTr++;
  // phần còn lại của trận
  const conLai = GIAY * 1000 - (Date.now() - t0) - 6000;
  if (conLai > 0) await sleep(conLai);
  const m1 = await met(), kk = await p.evaluate(() => window.__k);
  const n = Math.max(1, kk.n - k0), giay = (Date.now() - t0) / 1000;
  const dem = await p.evaluate(DEM, 4000);
  await p.screenshot({ path: OUT + `tran_${che}_${TEN}.png` });
  // tạm dừng 8 s: CPU mỗi GIÂY (màn đứng yên — trước đây vẫn vẽ lại 60 lần/giây)
  await p.evaluate(() => { G.dung = true; }); await sleep(1000);
  const d0 = await met(); await sleep(8000); const d1 = await met();
  const dungMsGiay = +(((d1.TaskDuration - d0.TaskDuration) * 1000) / 8).toFixed(1);
  await p.evaluate(() => { G.dung = false; });
  const ms = (k) => +(((m1[k] || 0) - (m0[k] || 0)) * 1000 / n).toFixed(2);
  const kq = {
    che, giay: +giay.toFixed(0), fps: +(n / giay).toFixed(1), khungDai25ms: kk.dai, khungMax: +kk.mx.toFixed(0),
    cpuMoiKhungMs: ms('TaskDuration'), jsMoiKhungMs: ms('ScriptDuration'), layoutMoiKhungMs: ms('LayoutDuration'), styleMoiKhungMs: ms('RecalcStyleDuration'),
    heapMB: +((m1.JSHeapUsedSize || 0) / 1048576).toFixed(1),
    vet6s: Object.fromEntries(Object.entries(tg).filter(([k, v]) => v > 20 && /FunctionCall|FireAnimationFrame|Paint|GC|Decode|UpdateLayoutTree|Layout|TimerFire|EventDispatch|Composite|Commit|PrePaint|RunTask|HitTest|EvaluateScript|ParseHTML/.test(k)).map(([k, v]) => [k, +(v / Math.max(1, nKhungTr)).toFixed(2)])),
    tamDungCpuMsMoiGiay: dungMsGiay, dem, mangTrongTran: mangTran, dsMang, loi: loi.slice(0, 5),
  };
  await ctx.close();
  return kq;
}
async function doHome(b) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof TAI !== 'undefined' && TAI.daBoot && !TAI.cho, null, { timeout: 90000 }).catch(() => { });
  await p.evaluate(() => { try { localStorage.setItem('tm_hd_xong', '1'); } catch (e) { } });
  await sleep(15000); // để việc tải nền xong
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  const met = async () => { const r = await cdp.send('Performance.getMetrics'); const o = {}; for (const m of r.metrics) o[m.name] = m.value; return o; };
  const a = await met(); await sleep(10000); const z = await met();
  await ctx.close();
  return { homeCpuMsMoiGiay: +(((z.TaskDuration - a.TaskDuration) * 1000) / 10).toFixed(1) };
}
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization=false'] });
  const kq = {};
  if (!process.env.BO_HOME) { kq.home = await doHome(b); console.log(JSON.stringify(kq.home)); }
  for (const che of CHE) { kq[che] = await doMot(b, che); console.log(JSON.stringify(kq[che])); }
  await b.close();
  fs.writeFileSync(OUT + `do_${TEN}.json`, JSON.stringify(kq, null, 1));
  let truot = false;
  const moc = (() => { try { return JSON.parse(fs.readFileSync(MOC_F, 'utf8')); } catch (e) { return {}; } })();
  for (const che of CHE) {
    const v = kq[che]; if (v.loi.length) { console.log('✗', che, 'lỗi trang:', v.loi); truot = true; }
    const ng = process.env.NGUONG_MS ? +process.env.NGUONG_MS : (moc[che] ? moc[che] * 1.35 : null);
    if (ng && v.cpuMoiKhungMs > ng) { console.log('✗', che, 'CPU/khung', v.cpuMoiKhungMs, 'ms > ngưỡng', ng.toFixed(2)); truot = true; }
    else console.log('✓', che, 'CPU/khung', v.cpuMoiKhungMs, 'ms', ng ? '(ngưỡng ' + ng.toFixed(2) + ')' : '', 'fps', v.fps);
  }
  if (process.env.MOC) { const m = {}; for (const che of CHE) m[che] = kq[che].cpuMoiKhungMs; fs.writeFileSync(MOC_F, JSON.stringify(Object.assign(moc, m), null, 1)); console.log('ghi mốc', m); }
  process.exit(truot ? 1 : 0);
})();
