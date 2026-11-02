// Kiểm tra Vùng 1 bằng Playwright: không lỗi JS, đi qua cửa P01→P12, chụp ảnh từng phòng vào tools/vung-1/xem/.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/vung-1/kiem-tra-vung1.js
const {chromium} = require('playwright');
const path = require('path');
const XEM = path.join(__dirname, 'xem');
const URL = 'http://localhost:8765/game/vung-1/index.html?tu=1&moi=1';
(async () => {
  const b = await chromium.launch();
  const loi = [];
  const pg = await b.newPage({viewport:{width:960, height:540}});
  pg.on('pageerror', e => loi.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') loi.push('console: ' + m.text()); });
  await pg.goto(URL);
  await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  await pg.evaluate(() => TV.choi(true));
  await pg.waitForTimeout(300);
  const thieu = await pg.evaluate(() => TV.V1.LOI.slice());
  // đường đi chính qua cửa
  const DUONG = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P09', 'P11', 'P12'];
  const ketQua = [];
  for (let i = 0; i < DUONG.length; i++){
    const id = DUONG[i];
    // chờ phòng hiện tại = id, chụp ảnh sau vài bước (camera ổn định)
    await pg.evaluate(() => TV.buoc(40, ''));
    const tt = await pg.evaluate(() => ({id:TV.G.id, x:TV.E.pl.x, y:TV.E.pl.y}));
    await pg.screenshot({path:path.join(XEM, 'choi-' + tt.id + '.png')});
    ketQua.push(tt.id);
    if (i === DUONG.length - 1) break;
    const toi = DUONG[i + 1];
    // đặt nhân vật ngay trước cửa sang phòng kế, giữ phím hướng ra cửa
    const ok = await pg.evaluate(async (toi) => {
      const {G, E, V1} = TV, T = 48, p = G.phong, c = p.cua.find(c => c.toi === toi);
      if (!c) return 'không có cửa tới ' + toi;
      G.luu.kho.chuong_vo = 3; G.luu.kho.loi_vong_tan = 1; G.luu.congMo = ['P11-dong']; G.luu.nvA = true;     // mở cửa trùm (cổng rễ đã mở)
      if (G.cuaKhoa.length){ G.cuaKhoa.length = 0; V1.vaoPhong(p, null, {x:E.pl.x, y:E.pl.y + E.pl.h}); }
      G.khoaCuaT = 0;
      const o = V1.odCua(c), n = o.length, pl = E.pl;
      let phim = '';
      if (c.huong === 'phai'){ pl.x = (c.cot) * T - pl.w - 2; pl.y = (c.hang + n) * T - pl.h - 1; phim = 'r'; }
      else if (c.huong === 'trai'){ pl.x = 6; pl.y = (c.hang + n) * T - pl.h - 1; phim = 'l'; }
      else if (c.huong === 'duoi'){ pl.x = (c.cot + n / 2) * T - pl.w / 2; pl.y = E.BD.HANG * T - pl.h - 1; pl.vy = 4; phim = 'd'; }
      else { pl.x = (c.cot + n / 2) * T - pl.w / 2; pl.y = 1; pl.vy = -12; phim = 'u'; }
      pl.vx = 0; pl.leo = false; pl.dash = 0; pl.hp = E.P.maxHp;
      for (let k = 0; k < 240 && G.id === p.id; k++){ TV.buoc(1, phim); if (c.huong === 'tren'){ pl.y = Math.min(pl.y, 0); pl.vy = -8; } await null; }
      for (let k = 0; k < 60 && G.chuyen; k++){ TV.buoc(1, ''); await new Promise(r => setTimeout(r, 5)); }
      return G.id === toi ? 'ok' : 'kẹt ở ' + G.id;
    }, toi);
    console.log(id, '→', toi, ok);
  }
  // màn dọc (điện thoại) + cảm ứng
  const dt = await b.newPage({viewport:{width:390, height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2});
  dt.on('pageerror', e => loi.push('dọc pageerror: ' + e.message));
  await dt.goto(URL.replace('moi=1', 'phong=P03'));
  await dt.waitForFunction(() => window.TV && TV.xong, null, {timeout:30000});
  await dt.evaluate(() => TV.choi(false)); await dt.evaluate(() => TV.buoc(30, ''));
  await dt.touchscreen.tap(100, 700);
  await dt.screenshot({path:path.join(XEM, 'choi-doc.png')});
  const ngang = await b.newPage({viewport:{width:844, height:390}, hasTouch:true, isMobile:true, deviceScaleFactor:2});
  await ngang.goto(URL.replace('moi=1', 'phong=P06'));
  await ngang.waitForFunction(() => window.TV && TV.xong, null, {timeout:30000});
  await ngang.evaluate(() => TV.choi(false)); await ngang.evaluate(() => TV.buoc(30, ''));
  await ngang.screenshot({path:path.join(XEM, 'choi-ngang-dt.png')});
  console.log('Phòng đã qua:', ketQua.join(' → '));
  console.log('Thiếu hình:', thieu.length ? thieu.join(', ') : 'không');
  console.log('Lỗi JS:', loi.length ? loi.join('\n') : 'không');
  await b.close();
  process.exit(loi.length ? 1 : 0);
})();
