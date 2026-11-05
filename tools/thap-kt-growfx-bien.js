// TURRET MERGE kiểm thử Playwright — chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-growfx-bien.js 390 844
// khung giữa lúc biến hình (0–650 ms) + chữ Awakened!
const { chromium } = require('playwright');
const OUT = '' + (process.env.OUT || 'shots/') + '';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const IDS = (process.argv[4] || 'soi,orbital,ngoisao,hydra,ronglua,overlord').split(',');
const TT = [0.05, 0.16, 0.26, 0.36, 0.48, 0.6];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=lien,canon,bang,tia,set&wave=12&mana=99999', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  for (const id of IDS) {
    const c = await p.evaluate((id) => {
      G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.dung = false;
      const B = G.ban[0]; B.tim = 1e9; B.t.fill(null); if (!B.deck.includes(id)) B.deck[0] = id; B.lv[id] = B.lv[id] || 1;
      const T = sinhU(taoU(B, id, id === 'hydra' || id === 'ronglua' ? 6 : 4, 2)); T._epGd = 2; T.gd = 2; B.t[2] = T; window._T = T;
      const p0 = G.duong[0]; for (let i = 0; i < 6; i++) { const E = sinhQuai('bo', 0, p0.len * (0.08 + i * 0.03), 400); E.vao = 1; E.chan = 1e9; }
      return B.o[2];
    }, id);
    await p.waitForTimeout(700);
    await p.evaluate(() => { window._T._epGd = 3; });
    await p.waitForTimeout(40);
    await p.evaluate(() => { G.dung = true; });
    for (const tt of TT) {
      await p.evaluate((tt) => { const T = window._T; if (T.vxB) T.vxB.t0 = VX.t - tt; else T.vxB = { t0: VX.t - tt, tu: 2, den: 3, len: true, ngan: false, dai: 0.65 }; T.vxB.no = tt > 0.3; }, tt);
      await p.waitForTimeout(70);
      await p.screenshot({ path: OUT + `bien_${W}_${id}_${Math.round(tt * 1000)}.png`, clip: { x: c.x - 75, y: c.y - 85, width: 150, height: 150 } });
    }
    await p.evaluate(() => { G.dung = false; const T = window._T; T.vxB = null; T._gfx3 = false; T._epGd = 2; });
    await p.waitForTimeout(400);
    await p.evaluate(() => { window._T._epGd = 3; });
    await p.waitForTimeout(520);
    await p.screenshot({ path: OUT + `bien_${W}_${id}_callout.png`, clip: { x: c.x - 75, y: c.y - 85, width: 150, height: 150 } });
  }
  console.log('ERR', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();
