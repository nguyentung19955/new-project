// Kiểm móc Hệ thống đồ vào Vùng 1 (Playwright).
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) ; node tools/he-thong/kiem-thu-vung1.js
const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch(); let hong = 0;
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };
  const mo = async q => { const pg = await b.newPage({viewport:{width:844, height:390}}); pg.loi = []; pg.on('pageerror', e => pg.loi.push(e.message));
    await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1' + q); await pg.waitForFunction(() => window.TV && TV.xong); return pg; };
  // 1) mặc định TẮT – Vùng 1 y hệt cũ
  let pg = await mo('');
  await pg.waitForTimeout(800);
  let r = await pg.evaluate(async () => { await TV.choi(true); TV.buoc(30, ''); return {bat:!!(window.MocHeThong && MocHeThong.bat), nut:!!document.getElementById('b-hethong'), st:TV.E.NV.cap.sat_thuong, ten:TV.E.NV.cap.ten}; });
  ok('Mặc định tắt: không có nút Dây Ngân, kiếm vẫn Sơ Âm 10', !r.bat && !r.nut && r.st === 10, r);
  ok('Mặc định tắt: không lỗi JS', !pg.loi.length, pg.loi); await pg.close();
  // 2) bật thử ?hethong=1
  pg = await mo('&hethong=1&hethong_moi=1');
  await pg.waitForFunction(() => window.MocHeThong && MocHeThong.bat);
  r = await pg.evaluate(async () => {
    const {E, V1} = TV; await TV.choi(true); TV.buoc(10, '');
    const q = E.QUAI.find(q => !q.dead) || {def:{mau:30}, x:300, y:300, w:30, h:50};
    const tinh = Object.assign({}, q, {laTinhAnh:true});
    E.SUKIEN.length = 0; E.SUKIEN.push({k:'quai-chet', q:tinh}); V1.suKienTheGioi(); E.SUKIEN.length = 0;
    const ht = MocHeThong.ht, sau = {cap:ht.cap(), not:ht.notCon(), diem:ht.S.diem};
    V1.G.trang = 'chuong'; V1.moChuong(0, true); const nut = document.getElementById('b-hethong');
    const coNut = !!nut && nut.offsetParent !== null, chu = nut && nut.textContent;
    nut.click(); const bang = document.getElementById('l-hethong').classList.contains('mo');
    const bt = [...document.querySelectorAll('#ht-cay button')], vang = bt.find(x => x.textContent.startsWith('Forge Ringing Tone'));
    const cao = Math.min(...bt.map(x => x.getBoundingClientRect().height));
    vang.click(); await new Promise(ok => setTimeout(ok, 100));
    const choAnh = bt.filter(x => x.textContent.includes('Art pending')).length;
    return {sau, coNut, chu, bang, cao, st:E.NV.cap.sat_thuong, choAnh, luu:localStorage.getItem('tvcc-he-thong') !== null, coDo:MocHeThong.coDo};
  });
  ok('Hạ tinh anh → +40 Âm Điểm, lên cấp 1, 1 Nốt', r.sau.cap === 1 && r.sau.not === 1, r.sau);
  ok('Bảng Chuông Lưu có nút "Dây Ngân · 1 Nốt"', r.coNut && /1 Nốt/.test(r.chu), r.chu);
  ok('Mở được bảng cây kỹ năng, nút cao ≥ 44px (dễ bấm iPhone)', r.bang && r.cao >= 44, r.cao);
  ok('Mở Rèn Vang Âm → sát thương kiếm 13', r.st === 13, r.st);
  ok('Nút cần hình mới hiện "Chờ hình" (chưa có ảnh)', r.choAnh >= 2, r.choAnh);
  ok('Chưa có biểu tượng Âm Phù → chưa rơi đồ', r.coDo === false);
  ok('Lưu riêng khoá tvcc-he-thong', r.luu);
  await pg.screenshot({path:process.env.ANH || '/tmp/he-thong-bang.png'});
  ok('Bật thử: không lỗi JS', !pg.loi.length, pg.loi);
  // 3) tải lại trang: vẫn giữ cấp + kiếm Vang Âm
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&hethong=1'); await pg.waitForFunction(() => window.MocHeThong && MocHeThong.bat && window.TV && TV.xong);
  r = await pg.evaluate(async () => { await new Promise(ok => setTimeout(ok, 300)); return {st:TV.E.NV.cap.sat_thuong, cap:MocHeThong.ht.cap()}; });
  ok('Tải lại trang giữ cấp và kiếm Vang Âm', r.st === 13 && r.cap === 1, r);
  console.log('Hỏng', hong); await b.close(); process.exit(hong ? 1 : 0);
})();
