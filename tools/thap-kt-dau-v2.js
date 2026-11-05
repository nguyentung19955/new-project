// TURRET MERGE — kiểm tra bộ đầu + phi công v2 (tools/thap-dau-v2.py).
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-dau-v2.js 390 844
// Chụp: 85 đầu trên bệ ở cỡ ô thật (6 bàn × 15 ụ, góc 0° và 45°) · màn chọn bộ bài (phi công) · 1 trận · trang hồ sơ ụ · ụ đổi dạng 1/2/3.
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const URL = 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = [];
  const mo = async (q, cho = 1800) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(q + ' :: console ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) errs.push(q + ' :: HTTP ' + r.status() + ' ' + r.url()); });
    await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(cho); return p;
  };
  const chup = (p, ten, clip) => p.screenshot({ path: OUT + W + '_' + ten + '.png', clip });
  // 1) màn chọn bộ bài (phi công mới)
  let p = await mo('');
  await chup(p, '01-menu');
  await p.evaluate(() => { const l = document.querySelector('#chon-luoi'); if (l) l.scrollTop = l.scrollHeight / 2; });
  await p.waitForTimeout(400); await chup(p, '02-menu-giua');
  await p.close();
  // 2) trang hồ sơ ụ (hero) — mở từ menu
  p = await mo('');
  for (const id of ['tia', 'vughep']) {
    await p.evaluate((id) => UP.mo(id), id); await p.waitForTimeout(1300); await chup(p, '03-unit-' + id);
    await p.evaluate(() => UP.dong()); await p.waitForTimeout(300);
  }
  await p.close();
  // 3) 85 đầu trên bệ, cỡ ô thật
  p = await mo('?mode=solo&deck=lien,canon,bang,tia,set&wave=3&mana=99999', 2200);
  const ids = await p.evaluate(() => Object.keys(HEAD_K));
  for (let k = 0; k * 15 < ids.length; k++) {
    for (const goc of [0, Math.PI / 4]) {
      await p.evaluate(([ds, goc]) => {
        G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.ketThuc = null;
        const B = G.ban[0]; B.tim = 1e9; B.t.fill(null);
        ds.forEach((id, o) => { if (!B.deck.includes(id)) B.lv[id] = B.lv[id] || 1; const T = sinhU(taoU(B, id, 1, o)); T.goc = goc; T.cd = 99; B.t[o] = T; });
      }, [ids.slice(k * 15, k * 15 + 15), goc]);
      await p.waitForTimeout(500);
      await p.evaluate(() => { for (const T of G.ban[0].t) if (T) T.cd = 99; G.dung = true; }); await p.waitForTimeout(80);
      await chup(p, `10-dau-${k}-${goc ? 45 : 0}`, { x: 0, y: 160, width: W, height: 380 });
      await p.evaluate(() => { G.dung = false; });
    }
  }
  // 4) trận thật
  await p.close();
  p = await mo('?mode=solo&deck=tia,bua,phagiap,kiembang,vughep&wave=4&fill=4&mana=999', 3500);
  await chup(p, '20-tran');
  const mem = await p.evaluate(() => REN.boNho ? REN.boNho() : null).catch(() => null);
  console.log('bo nho', JSON.stringify(mem));
  await p.close();
  console.log(W, 'ERR', JSON.stringify(errs.slice(0, 12)), errs.length);
  await b.close();
})();
