// TURRET MERGE — KIỂM NÚT SUMMON + ẢNH NỀN HUD TRẬN (lỗi 06/11: bàn đầy → nút thành hốc tròn trống, tuvan/freezer_1o.png).
// SOLO / CO-OP / PVP × (wave 1, bàn đầy, wave 10 trùm FREEZER): TRƯỢT nếu
//   · phần tử HUD trận (#top, #duoi và con) có ảnh nền chưa tải / tải hỏng / 0×0,
//   · #nut-trieu không hiện rõ: ẩn, độ mờ < 0,9, không ảnh nền, ra ngoài màn, hoặc không thấy chữ SUMMON.
// Chạy (gốc repo): python3 -m http.server 8765 &   NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-nut-trieu.js [BASE]
// BR=webkit để chạy WebKit (nếu máy có). Ảnh: docs/demo-hop-tuong/tuvan/freezer/nut_trieu_<chế độ>_<bước>.png
'use strict';
const pw = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT_NT || 'docs/demo-hop-tuong/tuvan/freezer/';
const CHUP = !process.env.KHONG_CHUP;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function KIEM() {
  const out = [], vw = innerWidth, vh = innerHeight;
  const hien = (e) => { for (let x = e; x && x !== document.documentElement; x = x.parentElement) { if (x.hidden) return false; const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } const r = e.getBoundingClientRect(); return r.width >= 2 && r.height >= 2; };
  const urls = new Set();
  for (const root of ['#top', '#duoi']) {
    const R = document.querySelector(root); if (!R) continue;
    for (const e of [R, ...R.querySelectorAll('*')]) {
      if (!hien(e)) continue;
      const bg = getComputedStyle(e).backgroundImage; if (!bg || bg === 'none') continue;
      for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) urls.add(m[1]);
    }
  }
  const nt = document.getElementById('nut-trieu');
  if (!nt) out.push('không có #nut-trieu');
  else {
    const s = getComputedStyle(nt), r = nt.getBoundingClientRect();
    let op = 1; for (let x = nt; x && x !== document.documentElement; x = x.parentElement) op *= +getComputedStyle(x).opacity;
    if (!hien(nt)) out.push('#nut-trieu bị ẩn');
    if (op < 0.9) out.push('#nut-trieu mờ ' + op.toFixed(2) + ' (' + nt.className + ')');
    if (!s.backgroundImage || s.backgroundImage === 'none') { const cap = nt.querySelector('.tr-cap'); const b2 = cap && getComputedStyle(cap, '::before').borderImageSource; if (!b2 || b2 === 'none') out.push('#nut-trieu không có ảnh nền'); }
    if (r.left < 0 || r.top < 0 || r.right > vw || r.bottom > vh) out.push('#nut-trieu ra ngoài màn');
    const t = nt.querySelector('.tr-ten'); if (!t || !hien(t) || !/SUMMON/i.test(t.textContent)) out.push('#nut-trieu không thấy chữ SUMMON (' + nt.className + ')');
    const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (h && !nt.contains(h) && !h.contains(nt) && h.closest('#duoi, #top') && !h.closest('#tt')) out.push('#nut-trieu bị ' + h.tagName + '#' + h.id + '.' + h.className + ' che');
  }
  return { loi: out, urls: [...urls], cls: nt && nt.className };
}
async function kiemAnh(p, urls) {
  return p.evaluate((us) => Promise.all(us.map(u => new Promise(ok => { const i = new Image(); let xong = false; const t = setTimeout(() => { if (!xong) ok(u + ' chưa tải sau 4 s'); }, 4000); i.onload = () => { xong = true; clearTimeout(t); ok(i.naturalWidth ? '' : u + ' 0×0'); }; i.onerror = () => { xong = true; clearTimeout(t); ok(u + ' tải hỏng'); }; i.src = u; }))).then(a => a.filter(Boolean)), urls);
}

(async () => {
  const L = pw[process.env.BR || 'chromium'];
  const br = await L.launch();
  const LOI = [];
  for (const m of ['solo', 'coop', 'pvp']) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: process.env.BR !== 'firefox', hasTouch: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => LOI.push(m + ': lỗi trang ' + e.message));
    p.on('response', r => { if (r.status() >= 400 && /\/assets\//.test(r.url())) LOI.push(m + ': ' + r.status() + ' ' + r.url()); });
    await p.goto(BASE + '?mode=' + m + '&deck=canon,bang,tia,set,lien&deck2=drone,bao,kiembang,hydra,anhsang&mana=0&notut=1', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && document.getElementById('nut-trieu'), null, { timeout: 60000 });
    await sleep(5000);
    const buoc = async (ten) => {
      const k = await p.evaluate(KIEM);
      for (const x of k.loi) LOI.push(m + ' ' + ten + ': ' + x);
      for (const x of await kiemAnh(p, k.urls)) LOI.push(m + ' ' + ten + ': ảnh nền HUD ' + x);
      if (CHUP) await p.screenshot({ path: OUT + 'nut_trieu_' + m + '_' + ten + '.png' });
      console.log((k.loi.length ? '  ✗ ' : '  ✓ ') + m + ' ' + ten + ' [' + k.cls + '] ' + k.urls.length + ' ảnh nền');
    };
    await buoc('w1');
    // bàn đầy 15 ụ (tình huống ảnh người dùng)
    await p.evaluate(() => { for (const B of G.ban) for (let i = 0; i < 15; i++) if (!B.t[i]) { B.t[i] = sinhU(taoU(B, B.deck[i % B.deck.length], 1 + (i % 3), i)); } G.ban[0].mana = 50; });
    await sleep(700); await buoc('day');
    // wave 10 (trùm) — bàn vẫn đầy
    await p.evaluate(() => { G.wave = 9; G.cho = 0.05; G.ban[0].mana = 900; });
    await p.waitForFunction(() => G.wave >= 10, null, { timeout: 20000 }).catch(() => { });
    await sleep(2500); await buoc('w10');
    await ctx.close();
  }
  await br.close();
  if (LOI.length) { console.log(LOI.map(x => '  ✗ ' + x).join('\n')); console.log('TRƯỢT nút SUMMON / ảnh HUD: ' + LOI.length); process.exit(1); }
  console.log('  ✓ nút SUMMON + ảnh nền HUD trận: SOLO/CO-OP/PVP × wave 1 / bàn đầy / wave 10');
})();
