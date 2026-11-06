// TURRET MERGE — chụp dải khung nhấn nút Triệu hồi (đủ mana / thiếu mana / bàn đầy) ở 390×844 DPR3 cảm ứng.
// Kiểm: không có animation lắc trên nút, nút chỉ dí xuống. Ra: docs/demo-hop-tuong/tuvan/nut_lun/
'use strict';
const { chromium } = require('playwright');
const sharp = require('sharp');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = 'docs/demo-hop-tuong/tuvan/nut_lun/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  let ok = true;
  for (const mode of ['solo', 'coop', 'pvp']) {
    await p.goto(`${BASE}?mode=${mode}&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&mana=0&notut=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho && !document.getElementById('cv').hidden, null, { timeout: 45000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 });
    await sleep(800);
    const ca = { du: () => { G.ban[0].mana = 500; }, thieu: () => { G.ban[0].mana = 0; }, day: () => { const B = G.ban[0]; B.mana = 9999; } };
    for (const k of (mode === 'solo' ? ['du', 'thieu', 'day'] : ['thieu'])) {
      if (k === 'day') { for (let i = 0; i < 40; i++) { const n = await p.evaluate(() => { const B = G.ban[0]; B.mana = 9999; return typeof oTrong === 'function' ? oTrong(B).length : 0; }); if (!n) break; await p.tap('#nut-trieu'); await sleep(60); } }
      await p.evaluate((k) => { if (k === 'du') G.ban[0].mana = 500; if (k === 'thieu') G.ban[0].mana = 0; if (k === 'day') G.ban[0].mana = 0; }, k);
      if (k === 'day') await p.evaluate(() => { G.ban[0].mana = 9999; });
      await sleep(300);
      const r = await p.locator('#nut-trieu').boundingBox();
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const clip = { x: Math.max(0, r.x - 24), y: Math.max(0, r.y - 16), width: r.width + 48, height: r.height + 32 };
      const frames = [];
      const ghi = async () => { frames.push(await p.screenshot({ clip })); const a = await p.evaluate(() => { const n = document.getElementById('nut-trieu'); return { an: getComputedStyle(n).animationName, cls: n.className, tf: getComputedStyle(n).translate + '|' + getComputedStyle(n).scale }; }); return a; };
      const log = [];
      log.push(await ghi());
      const cdp = await ctx.newCDPSession(p);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
      await sleep(30); log.push(await ghi());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      for (let i = 0; i < 4; i++) { await sleep(35); log.push(await ghi()); }
      await sleep(200); log.push(await ghi());
      for (const a of log) if (a.an && a.an !== 'none' && /lac/.test(a.an)) { ok = false; console.log('  LẮC!', mode, k, a.an); }
      console.log(mode, k, log.map(a => a.tf + (/\ban\b/.test(a.cls) ? '+an' : '') + (/thieu/.test(a.cls) ? ' thieu' : '') + (/tn-day/.test(a.cls) ? ' day' : '')).join('  '));
      const m = await sharp(frames[0]).metadata(); const W = m.width, H = m.height;
      await sharp({ create: { width: W * frames.length + 6 * (frames.length - 1), height: H, channels: 3, background: '#111' } })
        .composite(frames.map((f, i) => ({ input: f, left: i * (W + 6), top: 0 }))).png().toFile(OUT + `trieu_${mode}_${k}.png`);
    }
  }
  console.log('lỗi trang:', errs.length ? errs : 'không');
  await b.close(); process.exit(ok && !errs.length ? 0 : 1);
})();
