// chụp ảnh kiểm VFX P0 (docs/demo-hop-tuong/tuvan/vfx/p0/): CARD LV Time Bomb / Scrap Forge, trang Sanctum (8 ô), Armor Breaker 7★ (số sau trần),
//  bàn trận: Sanctum 5★ chạm (8 ô), Cryo tự phát (huy hiệu), quái nhiều trạng thái (≤ 2 dấu). Chạy: NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-vfx-p0.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/', OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/vfx/p0';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.rosterMap && typeof TAI !== 'undefined' && !TAI.cho && typeof UP !== 'undefined', null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  for (const [id, ct] of [['bomhen', 0], ['loren', 0], ['thanhdia', 1], ['phagiap', 1], ['kepha', 1]]) {
    await p.evaluate(([id, ct]) => { UP.mo(id); if (ct) UP.moTam('ct'); }, [id, ct]); await p.waitForTimeout(900);
    if (ct) await p.evaluate(() => { const t = document.querySelector('.up-ct .up-tam-than'); const x = t && [...t.querySelectorAll('*')].find(e => /Star levels|Buff footprint/.test(e.textContent) && e.children.length < 3); if (x) x.scrollIntoView(); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + '/trang-' + id + '.png' });
    await p.evaluate(() => UP.dong()); await p.waitForTimeout(400);
  }
  await p.goto(BASE + '?mode=solo&deck=canon,lien,thanhdia,lophanung,phagiap&wave=3&mana=0&notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !TAI.cho, null, { timeout: 60000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => {
    const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
    const S = dat(7, 'thanhdia', 5); [1, 2, 3, 6, 8, 11, 12, 13].forEach((o, i) => dat(o, i % 2 ? 'canon' : 'lien', 3));
    const C = dat(4, 'lophanung', 5); const k = () => { C.tuPhatG = G.t - 0.25; requestAnimationFrame(k); }; k();
    UI.xemHT = { T: S, t0: performance.now() - 600, giu: true };
    const E = G.quai.find(q => !q.chet); if (E) { E.chan = 3; E.docT = 5; E.chayT = 5; E.yeu = 5; E.chamT = 5; E.cham = 0.3; }
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/tran-sanctum5-cryo-tuphat.png' });
  console.log(errs.length ? 'LỖI ' + errs.join(' ; ') : 'xong');
  await b.close();
})();
