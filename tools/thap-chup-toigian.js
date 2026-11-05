// TURRET MERGE — ảnh trước/sau cho Ô TƯỚNG TỐI GIẢN (kiểu DCDW) ở 320/360/390/430, DPR 3:
//  kho cuộn, bộ bài 0/3/5, bộ sưu tập, bộ mẫu, chi tiết, khay trận SOLO/CO-OP/PVP, xem ụ, kết quả.
// Chạy (gốc repo): python3 -m http.server 8765 &  ;  OUT=docs/demo-hop-tuong/tuvan/toigian/sau/ node tools/thap-chup-toigian.js
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/toigian/sau/';
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SIZES = (process.env.SIZES || '320x700,360x780,390x844,430x932').split(',').map(s => s.split('x').map(Number));
const DPR = +(process.env.DPR || 3);
const CHUP = process.env.CHUP ? new RegExp(process.env.CHUP) : /./;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const DECK = 'canon,bang,tia,set,blackhole';
const TRAN = (m) => `${BASE}?mode=${m}&deck=${DECK}&deck2=drone,bao,kiembang,hydra,anhsang&wave=7&fill=15&mana=260&notut=1&nointro=1`;
const MAN = [
  { url: BASE + '?notut=1', buoc: [
    ['deck0', () => { HM.di('dk'); UI.chon = []; UI.veBoChon(); HM.ve(); }],
    ['deck3', () => { UI.chon = ['canon', 'bang', 'overlord']; UI.veBoChon(); HM.ve(); }],
    ['deck5', () => { UI.chon = ['canon', 'bang', 'tia', 'set', 'blackhole']; UI.veBoChon(); HM.ve(); }],
    ['kho_cuon', () => { const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.4; }],
    ['kho_cuoi', () => { const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight; }],
    ['collection', () => { HM.di('dk', true); const l = document.getElementById('chon-luoi'); l.scrollTop = l.scrollHeight * 0.3; }],
    ['presets', () => { HM.di('dk'); HM.moPre(); }],
    ['detail', () => { HM.dong(true); UP.mo('overlord'); }],
    ['detail_ve', () => { UP.dong(); }],
    ['commander', () => { UP.moMV('hero'); }],
  ] },
  ...['solo', 'coop', 'pvp'].map(m => ({ url: TRAN(m), buoc: [
    ['tray_' + m, () => { G.dung = true; const b = document.querySelector('#bang-wave'); if (b) b.hidden = true; }],
    ['inspect_' + m, () => { const T = G.ban[0].t.find(Boolean); UI.moTT(T.id, T); }],
    ['ketqua_' + m, () => { HB.dongHet && HB.dongHet(); G.dung = false; ketThuc(true); }],
  ] })),
];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [W, H] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
    for (const m of MAN) {
      const p = await ctx.newPage();
      p.on('pageerror', e => errs.push(W + ' :: ' + e.message));
      p.on('console', x => { if (x.type() === 'error' && !/WebSocket|ERR_CONNECTION_REFUSED|favicon/.test(x.text())) errs.push(W + ' console :: ' + x.text()); });
      await p.goto(m.url, { waitUntil: 'load' });
      await p.waitForFunction(() => typeof UI !== 'undefined' && G.roster && G.roster.length && !(typeof TAI !== 'undefined' && TAI.cho), null, { timeout: 30000 }).catch(() => { });
      await sleep(1800);
      for (const [ten, f] of m.buoc) {
        try { await p.evaluate(f); } catch (e) { errs.push(W + ' ' + ten + ' :: ' + e.message); }
        await sleep(/ketqua/.test(ten) ? 1600 : 700);
        if (CHUP.test(ten)) await p.screenshot({ path: `${OUT}${W}_${ten}.jpg`, type: 'jpeg', quality: 80 });
        if (ten === 'detail_ve') { const st = await p.evaluate(() => document.getElementById('chon-luoi').scrollTop); console.log(W, 'cuộn sau khi về:', st); }
      }
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
  console.log('LỖI TRANG:', errs.length); errs.forEach(e => console.log(' ', e));
})();
