// Kiểm trình duyệt: Vùng 1 ghi lưu chung khi vào; trang Làng Chuông tắt khi thiếu ảnh, đọc được trạm teleport.
// Chạy: (python3 -m http.server 8765 &) ; node tools/cot-truyen/kiem-tra-trinh-duyet.js [thư-mục-ảnh-ngoài-repo]
const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch(), loi = []; let hong = 0;
  const ok = (dk, t, x) => { console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined ? ' – ' + JSON.stringify(x) : '')); if (!dk) hong++; };
  const pg = await b.newPage({viewport:{width:960, height:540}});
  pg.on('pageerror', e => loi.push(e.message));
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1');
  await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  await pg.evaluate(() => { localStorage.removeItem('tvcc-chung'); LuuChung.napLai(); });
  await pg.evaluate(() => TV.choi(true)); await pg.waitForTimeout(300);
  const lc = await pg.evaluate(() => JSON.parse(localStorage.getItem('tvcc-chung')));
  ok(lc && lc.vungVao.includes('vung-1') && lc.vungCuoi === 'vung-1', 'Vùng 1 ghi lưu chung khi bắt đầu', lc && lc.vungVao);
  const p2 = await b.newPage({viewport:{width:960, height:540}});
  p2.on('pageerror', e => loi.push(e.message));
  await p2.goto('http://localhost:8765/game/lang-chuong/index.html');
  await p2.waitForFunction(() => window.LANG, null, {timeout:15000});
  const L = await p2.evaluate(() => ({s:LANG.sanSang, t:LANG.thieu, di:LANG.tram.filter(v => v.di_duoc).map(v => v.id), n:LANG.tram.length}));
  ok(!L.s && L.t.length > 0, 'Làng Chuông tắt khi thiếu ảnh', L.t);
  ok(L.di.length === 1 && L.di[0] === 'vung-1' && L.n >= 8, 'trạm teleport: chỉ Vùng 1 đi được', L);
  if (process.argv[2]) await p2.screenshot({path:process.argv[2] + '/lang-chuong.png'});
  ok(loi.length === 0, 'không lỗi JS', loi);
  await b.close(); process.exit(hong ? 1 : 0);
})();
