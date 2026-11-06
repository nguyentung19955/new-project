// TURRET MERGE — ẢNH CHỤP TIẾNG VIỆT (390×844, DPR 3) → docs/demo-hop-tuong/tuvan/ngonngu/
// HOME · cài đặt (LANGUAGE) · chế độ · bộ bài · bộ sưu tập · 5 trang ụ (+ chi tiết) · chỉ huy · trận SOLO/CO-OP/PVP · bảng ụ · cảnh báo trùm ·
// tạm dừng · kết quả · hướng dẫn · sảnh ONLINE (máy chủ giả 8787) · chat nhanh. In lỗi trang.
// Chạy: python3 -m http.server 8765 & · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 & · node tools/thap-vi-chup.js
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/ngonngu/';
const DPR = +(process.env.DPR || 3);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const LOI = [];
fs.mkdirSync(OUT, { recursive: true });
async function mo(b, url, hd) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DPR, hasTouch: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('tm_lang', 'vi'); } catch (e) { } });
  const p = await ctx.newPage();
  p.on('pageerror', e => LOI.push(url + ' · ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_|404/.test(m.text())) LOI.push(url + ' · console ' + m.text().slice(0, 160)); });
  await p.goto(url.startsWith('http') ? url : BASE + url, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0 && !document.querySelector('#tai:not([hidden])'), null, { timeout: 60000 }).catch(() => { });
  await sleep(1800);
  return p;
}
const chup = (p, ten) => p.screenshot({ path: OUT + 'vi_' + ten + '.png' });
const ev = (p, f, a) => p.evaluate(f, a).catch(e => LOI.push('eval ' + e.message.split('\n')[0]));
(async () => {
  const b = await chromium.launch();
  let p = await mo(b, 'index.html?notut=1');
  await chup(p, '01_home');
  await ev(p, () => HM.moCai()); await sleep(700); await chup(p, '02_caidat');
  await ev(p, () => HM.moChe()); await sleep(700); await chup(p, '03_chedo');
  await ev(p, () => { HM.dong(true); UI.chon = ['canon', 'bang', 'vughep', 'soi', 'mauhut']; UI.veBoChon(); HM.di('dk'); }); await sleep(1200); await chup(p, '04_bobai');
  await ev(p, () => HM.di('dk', true)); await sleep(1200); await chup(p, '05_bosuutap');
  let i = 6;
  for (const id of ['canon', 'vughep', 'soi', 'orbital', 'mauhut']) {
    await ev(p, (id) => UP.mo(id), id); await sleep(1200); await chup(p, String(i++).padStart(2, '0') + '_trang_' + id);
  }
  await ev(p, () => { const b = document.querySelector('#up [data-up="ct"], #up .up-kn, #up [data-up="chitiet"]'); if (b) b.click(); }); await sleep(900); await chup(p, '11_chitiet_mauhut');
  await ev(p, () => { UP.dong(true); UP.moMV('dahlia'); }); await sleep(1000); await chup(p, '12_chihuy');
  await p.context().close();
  // trận
  p = await mo(b, 'index.html?notut=1&mode=solo&mana=500&fill=3&wave=9&speed=2&deck=canon,bang,vughep,soi,mauhut');
  await sleep(3000); await chup(p, '13_tran_solo');
  await ev(p, () => { const B = G.ban[0]; const T = B.t.find(Boolean); if (T) UI.moTT(T.id, T); }); await sleep(500); await chup(p, '14_bang_u');
  await ev(p, () => { document.querySelector('#tt').hidden = true; UI.canhBaoTrum('nightmare'); }); await sleep(350); await chup(p, '15_canhbao_trum');
  await ev(p, () => { UI.bangWave(10, true); }); await sleep(300); await chup(p, '16_bang_wave');
  await ev(p, () => { const n = document.querySelector('[data-act="dung"]'); if (n) n.click(); }); await sleep(600); await chup(p, '17_tamdung');
  await ev(p, () => { document.querySelector('#dung').hidden = true; UI.ketQua({ thang: false, wave: 9, ly: TEXT.end.coreDown }); }); await sleep(700); await chup(p, '18_ketqua');
  await p.context().close();
  for (const m of ['coop', 'pvp']) {
    p = await mo(b, 'index.html?notut=1&mode=' + m + '&mana=500&fill=3&wave=5&auto=1&deck=canon,bang,vughep,soi,mauhut');
    await sleep(4000); await chup(p, '19_tran_' + m);
    await ev(p, (m) => UI.ketQua({ thang: m === 'pvp', wave: 14, ly: m === 'pvp' ? TEXT.end.rivalOut : TEXT.end.coopOut }), m); await sleep(700); await chup(p, '20_ketqua_' + m);
    await p.context().close();
  }
  // hướng dẫn lần đầu
  p = await mo(b, 'index.html?tut=1'); await sleep(2500); await chup(p, '21_huongdan');
  await p.context().close();
  // online (máy chủ giả)
  try {
    p = await mo(b, 'http://localhost:8787/thap/?net=mock&mockws=ws://localhost:8787&nointro=1&notut=1');
    await ev(p, () => { UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.ve(); ONL.moBang(); }); await sleep(1500); await chup(p, '22_online');
    await ev(p, () => { const n = document.querySelector('[data-act="onl-tao"]'); if (n) n.click(); }); await sleep(2500); await chup(p, '23_online_sanh');
    await ev(p, () => { if (typeof CHAT !== 'undefined') CHAT.moBang(); }); await sleep(800); await chup(p, '24_chat');
    await p.context().close();
  } catch (e) { LOI.push('online ' + e.message.split('\n')[0]); }
  await b.close();
  console.log(LOI.length ? 'LỖI:\n' + LOI.join('\n') : 'không lỗi trang');
})();
