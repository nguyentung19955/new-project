// TURRET MERGE — GOM CHỮ CHƯA DỊCH (Tiếng Việt). Mở game ?lang=vi, đi qua các màn + dựng trang ụ (93 ụ × 1–7★), bảng thông tin ụ trong trận,
// cảnh báo trùm, kết quả, trận SOLO/CO-OP/PVP vài wave, clip kỹ năng (preview) → in mọi chuỗi NN.thieu (chưa có trong từ điển).
// Dùng: python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-vi-thu.js [ra.json] [--demo]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'vi-thieu.json';
const DEMO = process.argv.includes('--demo');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const roster = JSON.parse(fs.readFileSync(__dirname + '/../thap/assets/roster.json', 'utf8'));
const ALL = new Set(), LOI = [];
async function lay(p) { const a = await p.evaluate(() => [...(window.NN ? NN.thieu : [])]); a.forEach(s => ALL.add(s)); }
async function mo(b, url) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('tm_lang', 'vi'); localStorage.setItem('turret_hd', JSON.stringify({ xong: 1, done: 1 })); } catch (e) { } });
  const p = await ctx.newPage();
  p.on('pageerror', e => LOI.push(url + ' PE ' + e.message));
  await p.goto(BASE + url, { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0, null, { timeout: 60000 });
  await sleep(1500);
  return p;
}
(async () => {
  const b = await chromium.launch();
  // 1) menu + trang ụ + chỉ huy
  let p = await mo(b, 'index.html?notut=1');
  await p.evaluate(async () => {
    const z = (ms) => new Promise(r => setTimeout(r, ms));
    const thu = (f) => { try { f(); } catch (e) { } };
    // chuỗi trong bảng dữ liệu (gọi NN.t để ghi chỗ thiếu)
    const di = (o, d) => { if (d > 6 || o == null) return; if (typeof o === 'string') NN.t(o); else if (Array.isArray(o)) o.forEach(x => di(x, d + 1)); else if (typeof o === 'object') for (const k in o) di(o[k], d + 1); };
    ['HO', 'HO_MOI', 'MOC_RIENG', 'MOC_CHUNG', 'ATK', 'BUFF', 'UP_TXT', 'KY_NANG_CAP', 'TRUM', 'MAVUONG', 'TIERS', 'GROW', 'QUAI'].forEach(k => thu(() => di(eval(k), 0)));
    thu(() => HM.moCai()); await z(200); thu(() => HM.moChe()); await z(200); thu(() => HM.moPre()); await z(200); thu(() => HM.moLoc()); await z(200); thu(() => HM.moMVs()); await z(200); thu(() => HM.dong(true));
    thu(() => HM.di('dk')); await z(300); thu(() => HM.di('dk', true)); await z(300);
    for (const r of G.roster) {
      thu(() => HM.moXem(r.id)); thu(() => UP.mo(r.id));
      for (let s = 1; s <= 7; s++) thu(() => UP.chonSao(s, true));
      thu(() => UI.moTT(r.id, null));
    }
    for (const k in MAVUONG) { thu(() => UP.moMV(k)); thu(() => UI.moTTMV(k)); }
    thu(() => UP.dong(true));
  });
  await lay(p); await p.context().close();
  // 2) trận: mỗi chế độ vài wave + bảng thông tin ụ 1–7★ + cảnh báo trùm + kết quả
  for (const m of ['solo', 'coop', 'pvp']) {
    p = await mo(b, 'index.html?notut=1&mode=' + m + '&auto=1&speed=4&mana=9999&fill=3&wave=8&deck=canon,bang,tia,set,lien');
    await sleep(9000);
    await p.evaluate(async () => {
      const z = (ms) => new Promise(r => setTimeout(r, ms));
      const thu = (f) => { try { f(); } catch (e) { } };
      const B = G.ban[0];
      for (const r of G.roster) for (let s = 1; s <= 7; s++) thu(() => { const T = taoU(B, r.id, s, 0); thu(() => sinhU(T)); UI.moTT(r.id, T); });
      for (const k in TRUM) thu(() => UI.canhBaoTrum(k));
      for (const k in MAVUONG) thu(() => UI.cutIn(k, B));
      thu(() => UI.bangWave(5, true)); thu(() => UI.bangWave(1, false));
      await z(500);
      thu(() => UI.ketQua({ thang: true, wave: 20, ly: TEXT.end.rivalOut })); thu(() => UI.ketQua({ thang: false, wave: 9, ly: TEXT.end.coopOut }));
      for (const k in TEXT.end) NN.t(TEXT.end[k]);
    });
    await sleep(4000);
    await lay(p); await p.context().close();
  }
  // 3) clip kỹ năng (preview iframe): mỗi ụ ở 1★/4★/7★ chạy hết 1 vòng
  if (DEMO) {
    const ids = roster.map(r => r.id).concat(['mv:hero', 'mv:dahlia', 'mv:eve']);
    const q = []; for (const id of ids) for (const s of [1, 4, 7]) q.push([id, s]);
    const w = async () => {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => { try { localStorage.setItem('tm_lang', 'vi'); } catch (e) { } });
      while (q.length) {
        const [id, s] = q.shift(); const pg = await ctx.newPage();
        pg.on('pageerror', e => LOI.push(id + ' PE ' + e.message));
        try {
          await pg.goto(BASE + 'index.html?preview=' + encodeURIComponent(id) + '&star=' + s + '&notut=1');
          await pg.waitForFunction(() => window.SD && SD.t > 0, null, { timeout: 30000 });
          await sleep(10500);
          const a = await pg.evaluate(() => [...NN.thieu]); a.forEach(x => ALL.add(x));
        } catch (e) { LOI.push(id + ' ' + e.message.split('\n')[0]); }
        await pg.close();
      }
      await ctx.close();
    };
    await Promise.all([w(), w(), w()]);
  }
  await b.close();
  const ds = [...ALL].sort();
  fs.writeFileSync(OUT, JSON.stringify(ds, null, 1));
  console.log('thiếu', ds.length, '→', OUT); if (LOI.length) console.log('LỖI\n' + LOI.slice(0, 30).join('\n'));
})();
