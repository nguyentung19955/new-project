// TURRET MERGE — ảnh trước/sau cho tư vấn tvA (bộ bài B2, kho B19, chân dung §D) ở 320/360/390/430, DPR 3.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  OUT=docs/demo-hop-tuong/tuvan/tvA/sau/ node tools/thap-chup-tvA.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/tvA/sau/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SIZES = (process.env.SIZES || '320x700,360x780,390x844,430x932').split(',').map(s => s.split('x').map(Number));
const DPR = +(process.env.DPR || 3);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const DECK = 'canon,bang,tia,set,blackhole';
const MAN = [
  { url: BASE + '?notut=1', buoc: [
    ['deck0', () => { HM.di('dk'); UI.chon = []; UI.veBoChon(); HM.ve(); }],
    ['deck3', () => { UI.chon = ['canon', 'bang', 'overlord']; UI.veBoChon(); HM.ve(); }],
    ['deck5', () => { UI.chon = ['canon', 'bang', 'tia', 'set', 'blackhole']; UI.veBoChon(); HM.ve(); }],
    ['deck5_cuon', () => { const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.4; }],
    ['collection', () => { HM.di('dk', true); const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.3; }],
    ['detail', () => { UP.mo('overlord'); }],
    ['detail_ve', () => { UP.dong(); }],
    ['commander', () => { UP.moMV('hero'); }],
  ] },
  { url: `${BASE}?mode=solo&deck=${DECK}&wave=7&fill=15&mana=260&notut=1&nointro=1`, buoc: [
    ['tray', () => { G.dung = true; const b = document.querySelector('#bang-wave'); if (b) b.hidden = true; }],
    ['inspect', () => { const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); }],
  ] },
];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [W, H] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
    for (const m of MAN) {
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(W + ' :: ' + e.message));
      await p.goto(m.url, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
      await sleep(1800);
      for (const [ten, f] of m.buoc) {
        try { await p.evaluate(f); } catch (e) { errs.push(W + ' ' + ten + ' :: ' + e.message); }
        await sleep(700);
        await p.screenshot({ path: `${OUT}${W}_${ten}.jpg`, type: 'jpeg', quality: 80 });
        if (ten === 'detail_ve') { const st = await p.evaluate(() => document.getElementById('chon-luoi').scrollTop); console.log(W, 'cuộn sau khi về:', st); }
      }
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
  console.log('LỖI TRANG:', errs.length); errs.forEach(e => console.log(' ', e));
})();
