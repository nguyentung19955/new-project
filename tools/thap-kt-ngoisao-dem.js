// Star Cannon (ngoisao): chụp tấm đếm trên bàn ở tổng ★ 19/20/47/50/60 (SOLO + CO-OP + PVP) → docs/demo-hop-tuong/tuvan/ngoisao/
//   python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-ngoisao-dem.js
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/', OUT = 'docs/demo-hop-tuong/tuvan/ngoisao/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(), loi = [];
  for (const m of ['solo', 'coop', 'pvp']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
    const p = await ctx.newPage();
    p.on('pageerror', e => loi.push(m + ': ' + e.message)); p.on('console', c => { if (c.type() === 'error') loi.push(m + ' console: ' + c.text()); });
    await p.goto(`${BASE}?mode=${m}&deck=ngoisao,mana,canon,bang,lien&mana=0&notut=1`, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho && !document.getElementById('cv').hidden, null, { timeout: 45000 });
    await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }).catch(() => { });
    await sleep(800);
    for (const n of (m === 'solo' ? [19, 20, 47, 50, 60] : [47, 50])) {
      const r = await p.evaluate((n) => {
        for (const B of G.ban) {
          for (let i = 0; i < 15; i++) B.t[i] = null;
          B.t[7] = sinhU(taoU(B, 'ngoisao', 3, 7)); let k = n - 3, o = 0;
          while (k > 0) { if (o === 7) o++; const q = Math.min(7, k); B.t[o] = sinhU(taoU(B, 'mana', q, o)); o++; k -= q; }
        }
        const B = G.ban[0], c = B.o[7], r = document.getElementById('cv').getBoundingClientRect();
        const d = DEMKN.DS.ngoisao(B.t[7], B);
        return { x: r.left + c.x / W * r.width, y: r.top + c.y / H * r.height, w: Math.min(B.cw, B.ch) / H * r.height, n: SKILLS.ngoisao.tong(B), d };
      }, n);
      await sleep(600);
      const s = r.w * 1.6;
      await p.screenshot({ path: OUT + m + '_dem_' + n + '.png', clip: { x: Math.max(0, r.x - s), y: Math.max(0, r.y - s), width: s * 2, height: s * 2 } });
      if (m === 'solo' && n === 47) await p.screenshot({ path: OUT + 'solo_ban_47.png' });
      if (m !== 'solo') await p.screenshot({ path: OUT + m + '_ban_' + n + '.png' });
      console.log(m, n, r.n, r.d.m[0].ic, r.d.m[0].s, r.d.sang ? 'sang' : '');
    }
    await ctx.close();
  }
  await b.close();
  console.log(loi.length ? 'LỖI TRANG:\n' + loi.join('\n') : 'không lỗi trang');
  process.exit(loi.length ? 1 : 0);
})();
