// TURRET MERGE — đo khung hình trận ở 3× (ép ?dpr=3): fps rAF + thời gian JS mỗi khung (REN._viec: ngưỡng lùi 2× là > 11 ms TB khi < 45 fps).
// Lưu ý: Chromium headless trong máy chủ KHÔNG có GPU (vẽ canvas bằng CPU) → fps ở đây là CẬN DƯỚI; thời gian JS mới so được với máy thật.
// Chạy: node tools/thap-kt-net-fps.js [base]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch();
  for (const mode of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(BASE + `?notut=1&dpr=3&mode=${mode}&deck=canon,bang,tia,set,lien&wave=12&fill=9&mana=2000&auto=1`);
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => new Promise(ok => { const v = []; let n = 0; const t0 = performance.now(); const g = () => { n++; v.push(REN._viec || 0); if (performance.now() - t0 < 5000) requestAnimationFrame(g); else { v.sort((a, b) => a - b); ok({ fps: +(n / ((performance.now() - t0) / 1000)).toFixed(1), jsTB: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2), jsP95: +v[Math.floor(v.length * 0.95)].toFixed(2), dpr: REN.dpr, cv: REN.cv.width + 'x' + REN.cv.height, quai: G.quai.length, mem: REN.boNho() }); } }; requestAnimationFrame(g); }));
    console.log(mode, JSON.stringify(r), 'lỗi', errs.length);
    await ctx.close();
  }
  await b.close();
})();
