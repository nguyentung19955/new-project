// Luồng E: chụp Chuông Lưu P05 (tắt/sáng), cửa khoá P11 (đóng/mở), trùm P12 (nghỉ, báo đòn, pha 2, quay phải, trúng đòn, quét chuông, chết).
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/vung-1/chup-e.js   → ảnh ở tools/vung-1/xem/e/
const {chromium} = require('playwright'); const OUT = process.argv[2] || require('path').join(__dirname, 'xem', 'e');
(async () => {
  const b = await chromium.launch(), pg = await b.newPage({viewport:{width:960, height:540}}); const loi = [];
  pg.on('pageerror', e => loi.push(e.message)); pg.on('console', m => { if (m.type()==='error') loi.push(m.text()); });
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true));
  const den = (id, cot, hang) => pg.evaluate(async ([id, cot, hang]) => { const {V1} = TV; V1.vaoPhong(await V1.layPhong(id), null, {x:cot * 48, y:(hang + 1) * 48}); V1.camDat(); TV.buoc(20, ''); }, [id, cot, hang]);
  const sh = n => pg.screenshot({path:OUT + '/' + n + '.png'});
  // P05 chuông tắt / sáng
  await pg.evaluate(() => { TV.G.luu.chuong = null; }); await den('P05', 11, 12); await sh('p05-tat');
  await pg.evaluate(() => { TV.G.luu.chuong = {phong:'P05', cot:15, hang:12}; TV.buoc(5, ''); }); await sh('p05-sang');
  // P11 cửa khoá
  await pg.evaluate(() => { TV.G.luu.kho.chuong_vo = 0; TV.G.luu.chuong = null; TV.G.luu.tinhAnhHa = ['P11']; }); await den('P11', 50, 18); await sh('p11-khoa');
  await pg.evaluate(() => { TV.G.luu.kho.chuong_vo = 3; }); await den('P11', 50, 18); await sh('p11-mo');
  // P12 trùm
  await den('P12', 20, 16); await pg.evaluate(()=>{TV.E.pl.x=TV.G.trum.x-250; TV.buoc(2,'');});
  const tr = async (n, f) => { await pg.evaluate(f); await pg.evaluate(()=>{ const q=TV.G.trum; if (TV.E.pl.x < q.x + 40) TV.E.pl.x = q.x - 230; TV.E.pl.hurtT=0; TV.V1.camDat(); TV.buoc(1,''); }); await sh(n); };
  await tr('trum-nghi', () => { const q = TV.G.trum; q.st = 'dung'; q.t = 0; q.cd = 999; q.face = -1; TV.buoc(3, ''); });
  await tr('trum-bao', () => { const q = TV.G.trum; q.st = 'go'; q.t = 0; TV.buoc(10, ''); });
  await tr('trum-pha2', () => { const q = TV.G.trum; TV.buoc(60,''); q.pha = 2; q.st = 'dung'; q.t = 0; q.cd = 999; TV.buoc(3, ''); });
  await tr('trum-phai', () => { const q = TV.G.trum; q.face = 1; q.st='dung'; q.cd=999; TV.E.pl.x = q.x + 400; TV.buoc(3, ''); });
  await tr('trum-trung', () => { const q = TV.G.trum; q.flash = 6; TV.buoc(1, ''); });
  await tr('trum-quet', () => { const q = TV.G.trum; q.flash=0; q.face=-1; TV.E.pl.x = q.x - 150; q.st = 'quet'; q.t = 0; TV.buoc(40, ''); });
  await tr('trum-chet', () => { const q = TV.G.trum; q.st = 'chet'; q.t = 0; TV.buoc(115, ''); });
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không'); await b.close();
})();
