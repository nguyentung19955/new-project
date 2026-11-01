// Luồng E: thử cửa khoá P11 (chặn ở cột 54 + nhắc; đủ 3 Chuông Vỡ thì qua P12) và đánh trùm tới chết (không lỗi JS).
const {chromium} = require('playwright'); const OUT = process.argv[2] || require('path').join(__dirname, 'xem', 'e');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  const r = await pg.evaluate(async () => {
    const {V1, E, G} = TV, o = {};
    G.luu.kho.chuong_vo = 0; G.luu.tinhAnhHa = ['P11'];
    V1.vaoPhong(await V1.layPhong('P11'), null, {x:48*48, y:19*48}); V1.camDat();
    TV.buoc(200, 'r'); await new Promise(r=>setTimeout(r,10)); o.dungTai = Math.round(E.pl.x + E.pl.w) + ' (cột ' + ((E.pl.x + E.pl.w)/48).toFixed(2) + ')'; o.phong1 = G.id; o.tb = JSON.stringify(G.tb||'') ;
    G.luu.kho.chuong_vo = 3; V1.vaoPhong(await V1.layPhong('P11'), null, {x:52*48, y:19*48}); TV.buoc(2, ''); 
    for (let i = 0; i < 150 && G.id === 'P11'; i++){ TV.buoc(1, 'r'); await new Promise(r => setTimeout(r, 0)); }
    await new Promise(r => setTimeout(r, 300)); TV.buoc(40, '');
    o.phong2 = G.id;
    return o;
  });
  console.log(JSON.stringify(r));
  await pg.screenshot({path:OUT + '/sau-cua.png'});
  // đánh trùm tới chết
  const k = await pg.evaluate(async () => {
    const {V1, E, G} = TV; V1.vaoPhong(await V1.layPhong('P12'), null, {x:30*48, y:17*48}); V1.camDat(); TV.buoc(30, '');
    const q = G.trum, log = [];
    for (let i = 0; i < 6000 && !q.dead; i++){
      E.pl.hp = 99; if (i % 20 === 0 && q.st !== 'chet' && !q.batTu){ q.hp -= 15; q.flash = 6; q.def.trung(q, 15, 1); }
      if (!log.includes(q.st)) log.push(q.st);
      TV.buoc(1, '');
    }
    return {dead:q.dead, trangThai:log, trumHa:G.luu.trumHa};
  });
  console.log(JSON.stringify(k), 'Lỗi JS:', loi.join('|') || 'không'); await b.close();
})();
