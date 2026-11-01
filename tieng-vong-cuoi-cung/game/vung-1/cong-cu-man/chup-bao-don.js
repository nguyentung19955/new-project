// chup-bao-don.js – LUỒNG D: chụp ảnh báo đòn (Vọng Tàn dấu đỏ gạch, Màn Tang rung dây + bụi, quái bắn tụ năng lượng) → xem/bao-don-*.png
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node game/vung-1/cong-cu-man/chup-bao-don.js
const {chromium} = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:960, height:540}});
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1');
  await pg.waitForFunction(() => window.TV && TV.xong);
  await pg.evaluate(() => TV.choi(true)); await pg.waitForTimeout(300);
  const CANH = [['tan', 'P11', 25, 18, 25], ['tang', 'P04', 42, 8, 12], ['ken', 'P03', 43, 24, 20], ['cau', 'P01', 29, 14, 20], ['vai', 'P02', 20, 14, 20]];
  for (const [ten, id, c, h, tre] of CANH){
    const ok = await pg.evaluate(async ([ten, id, c, h, tre]) => {
      const {E, G, V1} = TV, T = 48, pl = E.pl;
      const p = await V1.layPhong(id); V1.vaoPhong(p, null, {x:c * T + T / 2, y:(h + 1) * T}); G.chuyen = null; pl.iframes = 99999; G.bannerT = 0;
      for (let f = 0; f < 600; f++){
        TV.buoc(1, '');
        const q = E.QUAI.find(q => q.def.id === ten && q.st === 'danh' && q.baoTruoc);
        if (q && q.t >= tre) return true;
      }
      return false;
    }, [ten, id, c, h, tre]);
    await pg.screenshot({path:path.join(__dirname, 'xem', 'bao-don-' + ten + '.png')});
    console.log(ten, ok ? 'đã chụp lúc báo đòn' : 'KHÔNG bắt được lúc báo đòn');
  }
  await b.close();
})();
