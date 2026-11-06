// TURRET MERGE — ảnh trận sau đợt CÂN BẰNG THEO BẬC → docs/demo-hop-tuong/tuvan/tier/ (390×844 DPR 3)
//  tran_solo.png (bàn có ụ đỏ + vàng, wave 14) · tran_coop.png · tran_pvp.png — kiểm không lỗi trang
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-chup-tier.js
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tier/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const BAN = [[2, 'overlord', 4], [6, 'hopca', 4], [7, 'radar', 4], [8, 'railgun', 4], [12, 'blackhole', 3], [1, 'laser', 3], [3, 'no5', 3], [11, 'canon', 2], [13, 'lophanung', 4], [5, 'ronglua', 3]];
let loi = 0;
(async () => {
  const b = await chromium.launch();
  for (const mode of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(m.text())) errs.push('console ' + m.text().slice(0, 200)); });
    await p.goto(BASE + '?mode=' + mode + '&deck=overlord,hopca,radar,railgun,blackhole&deck2=canon,lien,set,bang,tia&wave=14&mana=0&notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho, null, { timeout: 45000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await sleep(900);
    await p.evaluate((ban) => { const B = G.ban[0]; for (const [o, id, s] of ban) { const T = sinhU(taoU(B, id, s, o)); T.goc = -Math.PI / 2; B.t[o] = T; } if (G.ban[1]) for (let i = 0; i < 8; i++) trieu(G.ban[1], true); G.cho = 0; }, BAN);
    await sleep(9000);
    await p.screenshot({ path: OUT + 'tran_' + mode + '.png' });
    console.log((errs.length ? '✗ ' : '✓ ') + mode + ' wave ' + await p.evaluate(() => G.wave) + (errs.length ? ' ' + errs.join(' | ') : ''));
    loi += errs.length; await ctx.close();
  }
  await b.close(); process.exitCode = loi ? 1 : 0;
})();
