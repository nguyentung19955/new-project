// Luồng G – chụp chiêu "Rễ Móc Mộ" (pha 2): lúc báo nứt, lúc rễ 1 trồi, lúc cả 3 rễ.
const {chromium} = require('playwright'); const path = require('path'); const XEM = path.join(__dirname, 'xem', 'g');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(async () => { const {V1, G, E} = TV; TV.choi(true); G.luu.kho.chuong_vo = 3;
    V1.vaoPhong(await V1.layPhong('P12'), null, {x:30 * 48, y:17 * 48}); V1.camDat(); TV.buoc(80, '');
    const q = G.trum; q.hp = 200; q.pha = 2; q.st = 're'; q.t = 0; q.cd = 999; E.pl.hp = 6; });
  for (const [n, ten] of [[22, 're-1-bao-nut'], [22, 're-2-troi-1'], [16, 're-3-ca-ba'], [14, 're-4-rut']]){
    await pg.evaluate(n => { const {E} = TV; for (let i = 0; i < n; i++){ E.pl.hp = 6; E.pl.iframes = 99; TV.mot(); } TV.V1.ve(0); }, n);
    await pg.screenshot({path:path.join(XEM, ten + '.png')});
  }
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không'); await b.close();
})();
