// TURRET MERGE — chụp trước/sau khi thay "hình vẽ bằng code" bằng ảnh ChatGPT (HINH-VE-CODE-AUDIT.md).
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-hinh-ui.js 390 844
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const URL = 'http://localhost:8765/thap/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = [];
  const mo = async (q, cho = 1500) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ' :: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(q + ' :: console ' + m.text()); });
    p.on('requestfailed', r => errs.push(q + ' :: 404/fail ' + r.url()));
    p.on('response', r => { if (r.status() >= 400) errs.push(q + ' :: HTTP ' + r.status() + ' ' + r.url()); });
    await p.goto(URL + q, { waitUntil: 'load' }); await p.waitForTimeout(cho); return p;
  };
  const chup = (p, ten) => p.screenshot({ path: OUT + W + '_' + ten + '.png' });
  // menu
  let p = await mo('');
  await chup(p, '01-menu');
  await p.evaluate(() => { document.querySelector('#chon-luoi .the, #chon-luoi .c')?.click(); });
  await p.evaluate(() => { const l = document.querySelector('#chon-luoi'); l.scrollTop = l.scrollHeight; });
  await p.waitForTimeout(300); await chup(p, '02-menu-cuoi');
  await p.close();
  // hồ sơ ụ
  p = await mo('?preview=canon&star=3', 2000); await chup(p, '03-unitpage'); await p.close();
  // trận SOLO
  p = await mo('?mode=solo&deck=canon,bang,tia,set,lien&wave=3&fill=3&mana=999', 2500);
  await chup(p, '04-solo');
  const fps = await p.evaluate(() => new Promise(ok => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else ok(n / ((performance.now() - t0) / 1000)); }; requestAnimationFrame(f); }));
  // lõi mất tim
  await p.evaluate(() => { G.ban[0].tim = 2; }); await p.waitForTimeout(900); await chup(p, '05-loi-2tim');
  await p.evaluate(() => { G.ban[0].tim = 1; }); await p.waitForTimeout(900); await chup(p, '06-loi-1tim');
  await p.evaluate(() => { G.ban[0].tim = 3; UI.bangWave && UI.bangWave(4, false); }); await p.waitForTimeout(450); await chup(p, '07-bang-wave');
  await p.evaluate(() => document.querySelector('[data-act="dung"]').click()); await p.waitForTimeout(300); await chup(p, '08-tamdung');
  await p.evaluate(() => { document.querySelector('[data-act="tiep"]').click(); ketThuc(true); }); await p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500); await chup(p, '09-ketqua');
  await p.close();
  // trùm
  p = await mo('?mode=solo&deck=canon,bang,tia,set,lien&wave=10&fill=4&mana=999', 300);
  await p.waitForSelector('#canh-bao:not([hidden])', { timeout: 9000 }).catch(() => {}); await p.waitForTimeout(500); await chup(p, '10-canh-bao-trum');
  await p.waitForTimeout(3000); await chup(p, '11-tran-trum');
  await p.close();
  // CO-OP / PVP
  p = await mo('?mode=coop&deck=canon,bang,tia,set,lien&wave=3&fill=3&mana=999', 2500); await chup(p, '12-coop'); await p.close();
  p = await mo('?mode=pvp&deck=canon,bang,tia,set,lien&wave=3&fill=3&mana=999', 2500); await chup(p, '13-pvp'); await p.close();
  // kỹ năng/hiệu ứng: hố đen, khoá thời gian, pandora, lưỡi cưa, mìn, buff
  p = await mo('?mode=solo&deck=blackhole,khoathoigian,pandora,nayda,min&wave=6&fill=5&mana=99999', 2500);
  await p.evaluate(() => {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9;
    for (let i = 0; i < 10; i++) { const E = sinhQuai(i % 3 ? 'bo' : 'khong_lo', 0, p0.len * (0.1 + i * 0.06), 400); E.vao = 1; }
    for (const T of B.t) if (T) { T.nap = 1; T.cd = 0; }
    // ép hiệu ứng nếu kỹ năng chưa tự nổ
    const E = G.quai.find(e => !e.chet);
    if (E && HU.hoden && !G.hu.some(o => o.k === 'hoden')) { const T = B.t.find(t => t && t.id === 'blackhole'); if (T) G.hu.push({ k: 'hoden', t: 0, song: 3, p: E.p, s: E.s + 10, x: E.x, y: E.y, r: 70, T, B, dps: 1, dmg: 1, acc: 0 }); }
    const T2 = B.t.find(t => t && t.id === 'pandora'); if (T2 && !G.hu.some(o => o.k === 'pandora')) G.hu.push({ k: 'pandora', t: 0, song: 1.5, B, o: T2.o, T: T2, chon: [3, 1], sao: 5, da: false });
  });
  await p.waitForTimeout(350); await chup(p, '14-fx-a');
  await p.waitForTimeout(900); await chup(p, '15-fx-b');
  await p.close();
  console.log(JSON.stringify({ W, fps: Math.round(fps), errs: errs.slice(0, 12) }));
  await b.close();
})();
