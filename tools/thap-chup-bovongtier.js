// TURRET MERGE — ảnh trước/sau "bỏ vòng bậc tier_ring quanh ụ" (390×844 DPR 3): SOLO + PVP (2 bàn), ụ đủ 5 bậc.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  TEN=sau node tools/thap-chup-bovongtier.js
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/bo_vong_tier/', TEN = process.env.TEN || 'sau';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  for (const mode of ['solo', 'pvp']) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(mode + ' :: ' + e.message));
    await p.goto(`${BASE}?mode=${mode}&deck=canon,bang,tia,set,blackhole&wave=7&fill=15&mana=260&notut=1&nointro=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && G.ban && G.ban.length && G.ban[0].t.some(Boolean) && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 40000 }).catch(() => { });
    await sleep(1500);
    await p.evaluate(() => { const L = ['trang', 'xanh', 'tim', 'vang', 'do']; for (const B of G.ban) B.t.forEach((T, i) => { if (T) T.bac = L[i % 5]; }); const w = document.querySelector('#bang-wave'); if (w) w.hidden = true; });
    await sleep(2500);
    await p.evaluate(() => { G.dung = true; });
    await sleep(400);
    await p.screenshot({ path: `${OUT}${TEN}_${mode}.jpg`, type: 'jpeg', quality: 85 });
    const r = await p.evaluate(() => { const B = G.ban[0], R = REN; const c = document.querySelector('canvas').getBoundingClientRect(); const xs = B.o.map(o => o.x), ys = B.o.map(o => o.y); return { x: c.left + (Math.min(...xs) - B.cw) * R.s, y: c.top + (Math.min(...ys) - B.ch) * R.s, w: (Math.max(...xs) - Math.min(...xs) + 2 * B.cw) * R.s, h: (Math.max(...ys) - Math.min(...ys) + 2 * B.ch) * R.s }; }).catch(() => null);
    if (r && r.w > 10) await p.screenshot({ path: `${OUT}${TEN}_${mode}_ban.png`, clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(390, r.w), height: Math.min(844, r.h) } });
    await p.close();
  }
  await b.close();
  console.log('LỖI TRANG:', errs.length); errs.forEach(e => console.log(' ', e));
})();
