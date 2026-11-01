// Luồng G – chụp từng phòng ở các điểm đáng xem (phân vai, biến thể địa hình, địa danh, dấu dẫn hướng, bia P05).
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) ; node tools/vung-1/chup-g.js
const {chromium} = require('playwright'); const path = require('path'), fs = require('fs');
const XEM = path.join(__dirname, 'xem', 'g'); fs.mkdirSync(XEM, {recursive:true});
// [tên ảnh, phòng, cột, hàng đứng (ô trống), số Chuông Vỡ đang có]
const DS = [
  ['P01-gia-chuong-do', 'P01', 33, 14], ['P01-cua-dong', 'P01', 42, 14], ['P01-dau', 'P01', 5, 15],
  ['P02-nga-ba', 'P02', 30, 24], ['P02-hoc-treo', 'P02', 40, 10], ['P02-chan-day', 'P02', 47, 23], ['P02-tuong-nut', 'P02', 10, 29],
  ['P03-ho-duc', 'P03', 32, 26], ['P03-xuong', 'P03', 40, 24], ['P03-gieng', 'P03', 53, 24],
  ['P04-hom-tro', 'P04', 14, 14], ['P04-dinh-doc', 'P04', 33, 6], ['P04-cua-tay', 'P04', 6, 11],
  ['P05-bia-0', 'P05', 12, 12, 0], ['P05-bia-2', 'P05', 12, 12, 2], ['P05-bia-3', 'P05', 12, 12, 3],
  ['P06-day', 'P06', 40, 32], ['P06-tuong-gia', 'P06', 7, 32],
  ['P09-bia-chan', 'P09', 16, 16], ['P09-tuyen-cao', 'P09', 12, 10], ['P09-gieng', 'P09', 25, 40], ['P09-cua-dong', 'P09', 36, 4],
  ['P11-hoc-dong', 'P11', 44, 18, 3], ['P12', 'P12', 20, 16, 3],
];
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  for (const [ten, id, cot, hang, cv] of DS){
    await pg.evaluate(async ([id, cot, hang, cv]) => { const {V1, G} = TV; G.luu.kho.chuong_vo = cv ?? 1;
      V1.vaoPhong(await V1.layPhong(id), null, {x:cot * 48 + 24, y:(hang + 1) * 48}); V1.camDat(); TV.buoc(40, ''); }, [id, cot, hang, cv]);
    await pg.screenshot({path:path.join(XEM, ten + '.png')});
  }
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không'); await b.close();
})();
