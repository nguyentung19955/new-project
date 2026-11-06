// TURRET MERGE — ảnh trận sau đợt cân bằng bậc (docs/demo-hop-tuong/tuvan/tier/) — SOLO / CO-OP / PVP + bảng ụ (số mới)
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  node tools/thap-chup-tier.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tier/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const MAN = [
  { ten: 'tran_solo_vang_do', url: `${BASE}?mode=solo&deck=railgun,hydra,dongbo,vughep,overlord&wave=14&fill=4&mana=400&auto=1&notut=1&nointro=1`, cho: 9000 },
  { ten: 'tran_coop_tim', url: `${BASE}?mode=coop&deck=no5,cuongno,taylo,nhanban,khoathoigian&wave=12&fill=3&mana=300&auto=1&notut=1&nointro=1`, cho: 9000 },
  { ten: 'tran_pvp_xanh_vang', url: `${BASE}?mode=pvp&deck=laser,radar,mortar,chimang,mimic&deck2=wallgen,cauvong,nhatthuc,tienhoa,pandora&wave=12&fill=3&mana=300&auto=1&notut=1&nointro=1`, cho: 9000 },
  { ten: 'bang_u_radar', url: `${BASE}?mode=solo&deck=radar,lien,canon,set,sungluc&wave=6&fill=4&mana=200&notut=1&nointro=1`, cho: 3000,
    f: () => { const T = G.ban[0].t.find(X => X && X.id === 'radar') || G.ban[0].t.find(Boolean); UI.moTT(T.id, T); } },
];
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
  for (const m of MAN) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(m.ten + ' :: ' + e.message));
    await p.goto(m.url, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && G.ban && G.ban.length, null, { timeout: 30000 }).catch(() => errs.push(m.ten + ' :: no battle'));
    await sleep(m.cho);
    if (m.f) { try { await p.evaluate(m.f); } catch (e) { errs.push(m.ten + ' :: ' + e.message); } await sleep(800); }
    await p.screenshot({ path: OUT + m.ten + '.png' });
    await p.close();
  }
  await b.close();
  console.log(errs.length ? 'PAGE ERRORS:\n' + errs.join('\n') : 'no page errors');
  process.exitCode = errs.length ? 1 : 0;
})();
