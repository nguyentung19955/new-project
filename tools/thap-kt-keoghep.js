// TURRET MERGE — kiểm thử kéo ghép P0-02/P0-03 (390x844, chạm CDP): hợp lệ / sai loại / sai sao / ô trống / thả ngoài / touchcancel / tạm dừng / chạm–chạm / Mimic + dải khung lộ kết quả.
// Chạy: python3 -m http.server 8765 (gốc repo) rồi NODE_PATH=$(npm root -g) node tools/thap-kt-keoghep.js
const { chromium } = require('playwright');
const OUT = '/tmp/claude-0/s/kt/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const errs = [];
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await p.goto('http://localhost:8765/thap/?mode=solo&deck=canon,bang,tia,set,lien&wave=1&mana=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && !TAI.cho, null, { timeout: 30000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }); await p.waitForTimeout(800);
  // set up board: 0,1 canon 1★ ; 2 canon 2★ ; 3 bang 1★ ; rest empty
  const setup = () => p.evaluate(() => {
    try { localStorage.removeItem('thap_kg_meo'); } catch (e) {}
    G.quai = []; const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null;
    const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); B.t[o].vxA = null; };
    put(0, 'canon', 1); put(1, 'canon', 1); put(2, 'canon', 2); put(3, 'bang', 1); put(6, 'canon', 1);
    UI.keo = null; UI.chonGhep = null; G.dung = false;
  });
  const pos = (o) => p.evaluate((o) => { const B = G.ban[0], c = B.o[o], r = document.querySelector('#cv').getBoundingClientRect(); return [r.left + c.x / W * r.width, r.top + c.y / H * r.height, Math.min(B.cw, B.ch) * 0.6 / H * r.height]; }, o);
  const st = () => p.evaluate(() => G.ban[0].t.map(T => T ? T.id + T.sao : '-').join(' '));
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }] });
  // drag by touch from cell a to target point (finger placed so HEAD lands on target)
  const drag = async (a, tx, ty, end = 'touchEnd', shot) => {
    const [x0, y0] = await pos(a);
    await touch('touchStart', x0, y0);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', x0 + (tx - x0) * i / 8, y0 + (ty - y0) * i / 8); await p.waitForTimeout(20); }
    await p.waitForTimeout(150);
    if (shot) await p.screenshot({ path: OUT + shot + '.png' });
    await touch(end, tx, ty); await p.waitForTimeout(80);
  };
  const R = {};
  // 1 valid: canon1(0) -> canon1(1)
  await setup(); let [x, y, lech] = await pos(1);
  let before = await st();
  await drag(0, x, y + lech, 'touchEnd', '01-drag-valid');
  R.valid = { before, after: await st() };
  await p.waitForTimeout(400); await p.screenshot({ path: OUT + '02-reveal.png' });
  // 2 invalid: canon1(0) -> bang1(3)
  await setup(); [x, y, lech] = await pos(3); before = await st();
  await drag(0, x, y + lech, 'touchEnd', '03-drag-invalid');
  R.invalidType = { same: before === await st() };
  // invalid star: canon1(0)->canon2(2)
  await setup(); [x, y, lech] = await pos(2); before = await st();
  await drag(0, x, y + lech); R.invalidStar = { same: before === await st() };
  // occupied-by-self / empty cell: drop on empty cell 10
  await setup(); [x, y, lech] = await pos(10); before = await st();
  await drag(0, x, y + lech); R.emptyCell = { same: before === await st() };
  // release outside board (top of screen)
  await setup(); before = await st();
  await drag(0, 195, 30); R.outside = { same: before === await st() };
  // touchcancel over valid target
  await setup(); [x, y, lech] = await pos(1); before = await st();
  await drag(0, x, y + lech, 'touchCancel'); R.touchcancel = { same: before === await st(), keo: await p.evaluate(() => UI.keo) };
  // pause mid-drag
  await setup(); [x, y, lech] = await pos(1); before = await st();
  { const [x0, y0] = await pos(0); await touch('touchStart', x0, y0); for (let i = 1; i <= 6; i++) { await touch('touchMove', x0 + (x - x0) * i / 6, y0 + (y + lech - y0) * i / 6); await p.waitForTimeout(20); }
    await p.evaluate(() => UI.lenh ? UI.lenh('dung') : null).catch(() => {});
    await p.evaluate(() => { if (G.dung !== true) { G.dung = true; UI.huyKeo(); } });
    await touch('touchEnd', x, y + lech); await p.waitForTimeout(80);
    R.pause = { same: before === await st(), keo: await p.evaluate(() => UI.keo) };
    await p.evaluate(() => { G.dung = false; const d = document.querySelector('#dung'); if (d) d.hidden = true; }); }
  // tap-tap mode: tap 0 then tap 6 (same canon 1)
  await setup(); before = await st();
  { const [x0, y0] = await pos(0); await touch('touchStart', x0, y0); await touch('touchEnd', x0, y0); await p.waitForTimeout(200);
    await p.screenshot({ path: OUT + '04-tap-selected.png' });
    const [x1, y1] = await pos(6); await touch('touchStart', x1, y1); await touch('touchEnd', x1, y1); await p.waitForTimeout(100);
    R.tapTap = { before, after: await st() }; }
  // tap-tap illegal target -> no merge
  await setup(); before = await st();
  { const [x0, y0] = await pos(0); await touch('touchStart', x0, y0); await touch('touchEnd', x0, y0); await p.waitForTimeout(100);
    const [x1, y1] = await pos(3); await touch('touchStart', x1, y1); await touch('touchEnd', x1, y1); await p.waitForTimeout(100);
    R.tapIllegal = { same: before === await st() }; }
  // mimic special: mimic1 -> bang1
  await setup(); await p.evaluate(() => { const B = G.ban[0]; B.t[5] = sinhU(taoU(B, 'mimic', 1, 5)); B.t[5].vxA = null; });
  R.mimicLegal = await p.evaluate(() => { const B = G.ban[0]; return [hopLeGhep(B.t[5], B.t[3]), hopLeGhep(B.t[5], B.t[2])]; });
  // reveal frame strip
  await setup(); [x, y, lech] = await pos(1);
  { const [x0, y0] = await pos(0); await touch('touchStart', x0, y0); for (let i = 1; i <= 8; i++) { await touch('touchMove', x0 + (x - x0) * i / 8, y0 + (y + lech - y0) * i / 8); await p.waitForTimeout(16); }
    await touch('touchEnd', x, y + lech);
    const clip = await p.evaluate(() => { const B = G.ban[0], c = B.o[1], r = document.querySelector('#cv').getBoundingClientRect(), k = r.width / W; return { x: Math.max(0, r.left + (c.x - 90) * k), y: r.top + (c.y - 80) * k, width: 180 * k, height: 150 * k }; });
    for (let i = 0; i < 8; i++) { await p.screenshot({ path: OUT + 'f' + i + '.png', clip }); await p.waitForTimeout(140); } }
  console.log(JSON.stringify(R, null, 1));
  console.log('ERRS', errs.slice(0, 10));
  await b.close();
})();
