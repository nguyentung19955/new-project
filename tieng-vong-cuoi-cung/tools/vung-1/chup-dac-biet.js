// Chụp các chỗ đặc biệt: tường nứt (trước/sau khi vỡ), tường giả, cửa khoá song rễ, đàn trùm.
const {chromium} = require('playwright'); const path = require('path'); const XEM = path.join(__dirname, 'xem');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  const den = (id, cot, hang) => pg.evaluate(async ([id, cot, hang]) => { const {V1, E} = TV; V1.vaoPhong(await V1.layPhong(id), null, {x:cot * 48, y:(hang + 1) * 48}); V1.camDat(); TV.buoc(20, ''); }, [id, cot, hang]);
  const tuong = async (id, loai) => pg.evaluate(id => { const p = TV.G.cache[id]; for (let r = 0; r < p.luoi.length; r++){ const c = p.luoi[r].indexOf('N') >= 0 ? p.luoi[r].indexOf('N') : p.luoi[r].indexOf('G'); if (c >= 0) return [c, r]; } }, id);
  for (const id of ['P02', 'P03']){
    const [c, r] = await tuong(id); await den(id, c + 2, r + 2);
    await pg.screenshot({path:path.join(XEM, 'nut-' + id + '-con.png')});
    await pg.evaluate(() => { const {E, V1} = TV; for (let y = 0; y < E.BD.HANG; y++) for (let x = 0; x < E.BD.COT; x++) if (E.BD.L[y][x] === 'N'){ E.BD.L[y][x] = '.'; E.SUKIEN.push({k:'vo-tuong', cot:x, hang:y}); } V1.suKienTheGioi(); V1.suKienVe(); E.SUKIEN.length = 0; TV.buoc(10, ''); });
    await pg.screenshot({path:path.join(XEM, 'nut-' + id + '-vo.png')});
  }
  { const [c, r] = await tuong('P06'); await den('P06', c + 3, r + 2); await pg.screenshot({path:path.join(XEM, 'gia-P06.png')}); }
  await pg.evaluate(() => { TV.G.luu.kho.chuong_vo = 0; }); await den('P11', 50, 18); await pg.screenshot({path:path.join(XEM, 'khoa-P11.png')});
  await den('P12', 20, 15); await pg.evaluate(() => TV.buoc(90, 'r')); await pg.screenshot({path:path.join(XEM, 'trum-P12.png')});
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không'); await b.close();
})();
