// TURRET MERGE kiểm thử Playwright — chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-che-fps.js 390 844
const { chromium } = require('playwright');
const OUT = '' + (process.env.OUT || 'shots/') + '';
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
const fps = (p, ms) => p.evaluate((ms) => new Promise(ok => { let n = 0, t0 = performance.now(), mx = 0, last = t0; const f = (t) => { n++; mx = Math.max(mx, t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else ok({ fps: +(n * 1000 / (t - t0)).toFixed(1), maxFrame: +mx.toFixed(1) }); }; requestAnimationFrame(f); }), ms);
(async () => {
  const b = await chromium.launch(); const kq = {};
  const decks = { solo: 'ronglua,soi,ngoisao,cuongno,lien', coop: 'chuato,orbital,lienket,dongbo,hydra', pvp: 'leviathan,cuuvi,lophanung,hopbi,tienhoa' };
  for (const mode of ['solo', 'coop', 'pvp']) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await p.goto(`http://localhost:8765/thap/?mode=${mode}&deck=${decks[mode]}&auto=1&mana=3000&wave=8&deck2=khoisinh,ngaithoigian,luoicheo,lien,canon`, { waitUntil: 'load' });
    await p.waitForTimeout(14000);
    const st = await p.evaluate(() => ({ wave: G.wave, ban: G.ban.map(B => B.t.filter(Boolean).map(T => T.id + T.sao + (T.gd ? 'g' + T.gd : '')).join(' ')), ket: G.ketThuc }));
    const f = await fps(p, 3000);
    await p.screenshot({ path: OUT + `che_${W}_${mode}.png` });
    kq[mode] = { errs: errs.slice(0, 5), ...st, ...f };
    await p.close();
  }
  // bàn nặng nhất: 15 ụ grow-up ép dạng 3 + 20 quái
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=lien,canon,bang,tia,set&wave=14&mana=99999', { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  await p.evaluate(() => {
    const ids = ['overlord', 'hopbi', 'tienhoa', 'lophanung', 'soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'ngaithoigian', 'ronglua', 'luoicheo'];
    G.hang.length = 0; G.quai.length = 0; G.cho = 1e9; const B = G.ban[0]; B.tim = 1e9;
    ids.forEach((id, o) => { B.lv[id] = 1; const T = sinhU(taoU(B, id, 5, o)); T._epGd = 3; B.t[o] = T; });
    const p0 = G.duong[0]; for (let i = 0; i < 22; i++) { const E = sinhQuai(i % 4 ? 'bo' : 'khong_lo', 0, p0.len * (0.02 + i * 0.044), 300); E.vao = 1; E.chan = 1e9; }
  });
  await p.waitForTimeout(1500);
  kq.nang = { ...(await fps(p, 4000)), errs, hu: await p.evaluate(() => G.hu.length), hat: await p.evaluate(() => FX.hat.length) };
  await p.screenshot({ path: OUT + `nang_${W}.png` });
  console.log(JSON.stringify(kq, null, 1));
  await b.close();
})();
