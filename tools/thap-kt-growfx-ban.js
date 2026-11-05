// TURRET MERGE kiểm thử Playwright — chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-growfx-ban.js 390 844
// debug board: mỗi ụ grow-up ở 3 ô hàng giữa, ép dạng 1/2/3, quái máu cao chạy quanh → chụp đang bắn
const { chromium } = require('playwright');
const OUT = '' + (process.env.OUT || 'shots/') + '';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const IDS = (process.argv[4] || 'overlord,hopbi,tienhoa,lophanung,soi,orbital,cuongno,ngoisao,lienket,dongbo,hydra,cuuvi,ngaithoigian,ronglua,luoicheo').split(',');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=lien,canon,bang,tia,set&wave=12&mana=99999', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  for (const id of IDS) {
    await p.evaluate((id) => {
      G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.ketThuc = null;
      const B = G.ban[0]; B.tim = 1e9; B.t.fill(null); B.phao = 0;
      if (!B.deck.includes(id)) B.deck[0] = id; B.lv[id] = B.lv[id] || 1;
      const dat = (o, uid, sao, gd) => { const T = sinhU(taoU(B, uid, sao, o)); T._epGd = gd; T.gd = gd; T.cd = 0; B.t[o] = T; return T; };
      if (id === 'luoicheo') { dat(6, id, 5, 2); dat(8, id, 5, 3); for (const o of [0, 2, 4, 10, 12, 14]) dat(o, 'lien', 4, 0)._epGd = 0; }
      else { const s = { hydra: [3, 5, 7], cuuvi: [4, 5, 7], ngaithoigian: [3, 5, 7] }[id] || [4, 4, 7]; dat(0, id, s[0], 1); dat(2, id, s[1], 2); dat(4, id, s[2], 3); }
      for (const T of B.t) if (T) { T.nap = T.id === 'overlord' ? 0.3 * T.gd : T.nap; if (T.id === 'cuuvi') T.duoi = 6; if (T.id === 'soi') T.giet = 60; }
      const p0 = G.duong[0];
      for (let i = 0; i < 11; i++) { const E = sinhQuai(i % 4 === 0 ? 'khong_lo' : 'bo', 0, p0.len * (0.03 + i * 0.026), 400); E.vao = 1; E.chan = 1e9; }
      G.hu.forEach(o => { if (o.k === 'gTre') o.t = 9; });
    }, id);
    await p.waitForTimeout(900);
    const ban = (ms) => p.evaluate(async (ms) => { for (const T of G.ban[0].t) if (T) { T.cd = 0; if (T.id === 'overlord' && T.gd === 3) T.nap = 0.999; } await new Promise(r => setTimeout(r, ms)); G.dung = true; await new Promise(r => setTimeout(r, 60)); }, ms);
    await ban(id === 'overlord' ? 130 : 70);
    await p.screenshot({ path: OUT + `${W}_${id}_a.png`, clip: { x: 0, y: 200, width: W, height: 330 } });
    await p.evaluate(() => { G.dung = false; }); await p.waitForTimeout(500);
    await ban(id === 'overlord' ? 60 : 150);
    await p.screenshot({ path: OUT + `${W}_${id}_b.png`, clip: { x: 0, y: 200, width: W, height: 330 } });
    await p.evaluate(() => { G.dung = false; });
  }
  console.log(W, 'ERR', JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
