// TURRET MERGE — đo hiệu năng tình huống "PVP đợt 15, bàn đầy Ember" (báo lỗi nóng máy iPhone 09/11).
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi node tools/thap-kt-hieunang.js [tên=truy-vấn-thêm ...]
//   vd: node tools/thap-kt-hieunang.js goc= ha0=ha=0
// Biến môi trường: PORT (8765), THR (giảm tốc CPU, 4), MS (thời gian đo, 5000), MODE (pvp), SHOT=thư-mục (chụp ảnh), TRACE=1 (đo paint/raster)
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8765, THR = +(process.env.THR || 4), MS = +(process.env.MS || 5000), MODE = process.env.MODE || 'pvp';
const DECK = 'lualien,chuato,leviathan,khoisinh,hopca', DECK2 = 'cobac,bienmau,nhieusong,lien,canon';
const bien = process.argv.slice(2).map(s => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; });
if (!bien.length) bien.push(['goc', '']);
(async () => {
  const b = await chromium.launch({ args: ['--enable-gpu-rasterization'] });
  const kq = {};
  for (const [ten, them] of bien) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    const dsThem = them.split('&').filter(Boolean);
    const js = dsThem.filter(x => x.startsWith('js:')).map(x => decodeURIComponent(x.slice(3)));
    const q = dsThem.filter(x => !x.startsWith('js:')).join('&');
    await p.goto(`http://localhost:${PORT}/thap/?notut=1&mode=${MODE}&deck=${DECK}&deck2=${DECK2}&wave=15&mana=2500&auto=1${q ? '&' + q : ''}`, { waitUntil: 'load' });
    await p.waitForFunction(() => window.G && G.ban && G.ban.length && !(window.TAI && TAI.cho), null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(1500);
    // bàn mình: 11 Ember (lửa 30–90) + 3 Đỏ + 1 vàng; bàn đối thủ đầy 13 ụ
    await p.evaluate(() => {
      const B = G.ban[0]; const ids = ['lualien', 'lualien', 'lualien', 'chuato', 'lualien', 'lualien', 'lualien', 'leviathan', 'lualien', 'lualien', 'khoisinh', 'lualien', 'lualien', 'hopca', 'lualien'];
      ids.forEach((id, o) => { B.lv[id] = Math.max(B.lv[id] || 1, 9); const T = sinhU(taoU(B, id, 4, o)); if (id === 'lualien') T.lc = 30 + (o * 7) % 61; B.t[o] = T; });
      const B2 = G.ban[1]; if (B2) { const i2 = ['cobac', 'bienmau', 'nhieusong', 'lien', 'canon']; for (let o = 0; o < 13; o++) { const id = i2[o % 5]; if (!SKILLS[id]) continue; B2.lv[id] = B2.lv[id] || 1; B2.t[o] = sinhU(taoU(B2, id, 3, o)); } }
      B.mana = 2524; B.tim = 1e9; if (B2) B2.tim = 1e9;
    });
    for (const s of js) await p.evaluate(s);
    await p.waitForTimeout(2500);
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THR });
    await cdp.send('Performance.enable');
    // đếm lớp (compositing layers)
    await cdp.send('LayerTree.enable'); let lop = 0;
    cdp.on('LayerTree.layerTreeDidChange', e => { if (e.layers) lop = e.layers.filter(l => l.drawsContent).length; });
    const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    if (process.env.TRACE) await b.startTracing(p, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
    const r = await p.evaluate((ms) => new Promise(ok => {
      let dom = 0; const mo = new MutationObserver(l => { dom += l.length; }); mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      const ds = []; let last = performance.now(); const t0 = last;
      const f = (t) => { ds.push(t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else { mo.disconnect(); ds.sort((a, b) => a - b); ok({ n: ds.length, tb: +(ds.reduce((a, b) => a + b, 0) / ds.length).toFixed(1), p95: +ds[Math.floor(ds.length * 0.95)].toFixed(1), domKhung: +(dom / ds.length).toFixed(1), hat: window.FX && FX.hat ? FX.hat.length : -1, ember: G.ban[0].t.filter(T => T && T.id === 'lualien').length, dpr: window.REN && REN.dpr }); } };
      requestAnimationFrame(f);
    }), MS);
    let tr = null;
    if (process.env.TRACE) {
      const buf = await b.stopTracing(); const ev = JSON.parse(buf.toString()).traceEvents || JSON.parse(buf.toString());
      const tong = {}; for (const e of ev) if (e.ph === 'X' && e.dur) { const k = e.name; if (/^(Paint|RasterTask|CompositeLayers|UpdateLayerTree|Layout|UpdateLayoutTree|FunctionCall|FireAnimationFrame|PrePaint|Layerize|Commit|GPUTask|ImageDecodeTask|DecodeImage)$/.test(k)) tong[k] = (tong[k] || 0) + e.dur / 1000; }
      tr = Object.fromEntries(Object.entries(tong).map(([k, v]) => [k, Math.round(v)]));
    }
    const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const d = k => +((m1[k] - m0[k]) * 1000 / (MS / 1000)).toFixed(0); // ms trên mỗi giây
    kq[ten] = { ...r, script: d('ScriptDuration'), style: d('RecalcStyleDuration'), layout: d('LayoutDuration'), task: d('TaskDuration'), styleN: +((m1.RecalcStyleCount - m0.RecalcStyleCount) / r.n).toFixed(1), layoutN: +((m1.LayoutCount - m0.LayoutCount) / r.n).toFixed(1), lop, tr, errs: errs.slice(0, 3) };
    if (process.env.SHOT) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); await p.screenshot({ path: process.env.SHOT + '/' + MODE + '_' + ten + '.png' }); }
    console.log(ten, JSON.stringify(kq[ten]));
    await ctx.close();
  }
  await b.close();
})();
