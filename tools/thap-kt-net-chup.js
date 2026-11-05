// TURRET MERGE — ảnh cắt 1:1 điểm ảnh màn (iPhone 390×844 DPR 3) TRƯỚC | SAU cho 12+ chỗ (docs/demo-hop-tuong/tuvan/net/).
// Trận: mô phỏng iPhone khoá 30 Hz (Nguồn điện thấp) như máy thật → bản cũ tự lùi vẽ 2×, bản mới giữ 3×.
// Chạy: 2 máy chủ — bản cũ ở 8766 (git archive HEAD thap), bản mới ở 8765 — rồi  node tools/thap-kt-net-chup.js <thư mục ra>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || 'docs/demo-hop-tuong/tuvan/net';
const BAN = { truoc: 'http://localhost:8766/thap/', sau: 'http://localhost:8765/thap/' };
const DECK = ['canon', 'bang', 'tia', 'set', 'lien'];
const LS = `try{localStorage.setItem('turret_hd',JSON.stringify({xong:true,boQua:true,buoc:{}}));localStorage.setItem('turret_bo',JSON.stringify({chon:${JSON.stringify(DECK)},mv:'hero',che:'solo'}));}catch(e){}`;
const HZ30 = () => { const raf = window.requestAnimationFrame.bind(window); let q = [], last = 0, on = false; const tick = (t) => { if (t - last >= 32) { last = t; const c = q; q = []; on = false; c.forEach(f => f(t)); } else raf(tick); }; window.requestAnimationFrame = (cb) => { q.push(cb); if (!on) { on = true; raf(tick); } return 1; }; };
const W8 = (p, ms) => p.waitForTimeout(ms);
// mỗi chỗ: [tên, url, chuẩn bị(p), lấy khung CSS (p) → {x,y,w,h}]
const box = (sel, pad = 0) => async (p) => p.evaluate(([s, pad]) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left - pad, y: r.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad }; }, [sel, pad]);
const CHO = [
  ['01-home-hero', '?notut=1', async p => { await W8(p, 3500); }, box('#hm-anh')],
  ['02-home-che-icon', '?notut=1', async p => { await W8(p, 3500); }, box('#hm-che', 0)],
  ['03-deck-slot', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => document.querySelector('[data-act="hm-deck"]').click()); await W8(p, 1200); }, box('#chon-bo .o-bo')],
  ['04-roster-card', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => document.querySelector('[data-act="hm-bst"]').click()); await W8(p, 1500); }, box('#chon-luoi .c[data-id]')],
  ['05-che-sheet-icon', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => document.querySelector('[data-act="hm-che"]').click()); await W8(p, 900); }, box('.hm-hang.hm-chec')],
  ['06-detail-hero', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => UP.mo('canon', document.querySelector('#chon-luoi .c[data-id="canon"]'))); await W8(p, 3000); }, async p => p.evaluate(() => { const e = [...document.querySelectorAll('#up img')].find(i => /pilot_/.test(i.src) && i.getBoundingClientRect().width > 200); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, 300) }; })],
  ['07-detail-turret', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => UP.mo('canon', document.querySelector('#chon-luoi .c[data-id="canon"]'))); await W8(p, 3000); }, box('.up-mam')],
  ['08-commander-medal', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => UP.moMV(Object.keys(MAVUONG)[0])); await W8(p, 2500); }, box('.up-vong.cmd', 4)],
  ['09-commander-nut', '?notut=1', async p => { await W8(p, 3000); await p.evaluate(() => UP.moMV(Object.keys(MAVUONG)[0])); await W8(p, 2500); }, box('.up-nut.bo', 4)],
  ['10-battle-tray-card', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { await W8(p, 12000); }, box('#bo-the .the')],
  ['11-board-turret', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { await W8(p, 12000); }, async p => p.evaluate(() => { const B = G.ban[0]; let i = B.t.findIndex(t => t && t.id === 'canon'); if (i < 0) i = B.t.findIndex(Boolean); const c = B.o[i], w = document.getElementById('wrap').getBoundingClientRect(), s = REN.s; return { x: w.left + (c.x - 34) * s, y: w.top + (c.y - 34) * s, w: 68 * s, h: 68 * s }; })],
  ['12-enemy', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { for (let i = 0; i < 30 && !(await p.evaluate(() => G.quai.some(e => !e.chet && e.x > 0))); i++) await W8(p, 500); await W8(p, 1500); await p.evaluate(() => { G.dung = true; }); }, async p => p.evaluate(() => { const E = G.quai.filter(e => !e.chet && e.x > 0)[0]; if (!E) return null; const w = document.getElementById('wrap').getBoundingClientRect(), s = REN.s; return { x: w.left + (E.x - 30) * s, y: w.top + (E.y - 30) * s, w: 60 * s, h: 60 * s }; })],
  ['13-battle-mana-lcd', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { await W8(p, 12000); }, box('#mana-hop', 2)],
  ['14-coop-board', '?notut=1&mode=coop&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { await W8(p, 12000); await p.evaluate(() => { G.dung = true; }); }, async p => p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.42, w: r.width * 0.4, h: r.height * 0.12 }; })],
  ['15-pvp-board', '?notut=1&mode=pvp&deck=canon,bang,tia,set,lien&wave=6&fill=6&mana=999&auto=1&seed=7', async p => { await W8(p, 12000); await p.evaluate(() => { G.dung = true; }); }, async p => p.evaluate(() => { const r = document.getElementById('cv').getBoundingClientRect(); return { x: r.left + r.width * 0.3, y: r.top + r.height * 0.42, w: r.width * 0.4, h: r.height * 0.12 }; })],
  ['16-results-button', '?notut=1&mode=solo&deck=canon,bang,tia,set,lien&wave=3&fill=3&mana=999&auto=1', async p => { await W8(p, 7000); await p.evaluate(() => ketThuc(true)); await W8(p, 3000); }, box('#ketqua .nut.chinh', 2)],
];
(async () => {
  const b = await chromium.launch();
  fs.mkdirSync(OUT, { recursive: true });
  const info = [];
  for (const [ten, url, prep, getBox] of CHO.filter(c => !process.env.ONLY || c[0].includes(process.env.ONLY))) {
    const anh = {};
    for (const k of ['truoc', 'sau']) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
      await p.addInitScript(LS); await p.addInitScript(HZ30);
      await p.goto(BAN[k] + url); await prep(p);
      const bx = await getBox(p);
      const dpr = await p.evaluate(() => typeof REN !== 'undefined' && G.ban.length ? REN.dpr : null);
      if (bx) { const f = path.join(OUT, '_' + ten + '-' + k + '.png'); await p.screenshot({ path: f, clip: { x: Math.max(0, bx.x), y: Math.max(0, bx.y), width: Math.min(bx.w, 390), height: Math.min(bx.h, 844) } }); anh[k] = f; }
      info.push([ten, k, dpr, errs.length]);
      await ctx.close();
    }
    process.stderr.write(ten + ' ');
  }
  fs.writeFileSync(path.join(OUT, '_chup.json'), JSON.stringify(info));
  await b.close();
})();
