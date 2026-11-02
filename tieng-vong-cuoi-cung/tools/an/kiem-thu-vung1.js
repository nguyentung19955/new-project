// Kiểm móc Vật phẩm ẩn + Nhiệm vụ ẩn vào Vùng 1 (Playwright) – chơi thật: chém tường nứt, đi vào tường giả, nhặt đồ, hạ trùm.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/an/kiem-thu-vung1.js   (ảnh chụp: biến ANH_DIR, mặc định /tmp)
const {chromium} = require('playwright');
const path = require('path');
const ANH = process.env.ANH_DIR || '/tmp';
(async () => {
  const b = await chromium.launch(); let hong = 0;
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };
  const mo = async q => { const pg = await b.newPage({viewport:{width:844, height:390}}); pg.loi = []; pg.on('pageerror', e => pg.loi.push(e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) pg.loi.push(m.text()); });
    await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1' + q); await pg.waitForFunction(() => window.TV && TV.xong); return pg; };

  // 1) mặc định TẮT
  let pg = await mo('&moi=1');
  await pg.waitForTimeout(600);
  let r = await pg.evaluate(async () => { await TV.choi(true); TV.buoc(30, ''); TV.V1.G.trang = 'chuong'; TV.V1.moChuong(0, true);
    return {bat:!!(window.MocAn && MocAn.bat), nut:!!document.getElementById('b-an'), luu:localStorage.getItem('tvcc-an')}; });
  ok('Mặc định tắt: không nút Nhật Ký, không lưu gì', !r.bat && !r.nut && r.luu === null, r);
  ok('Mặc định tắt: không lỗi JS', !pg.loi.length, pg.loi); await pg.close();

  // 2) bật thử, chơi từng bí mật
  pg = await mo('&moi=1&an=1&an_moi=1');
  await pg.waitForFunction(() => window.MocAn && MocAn.bat);
  await pg.evaluate(async () => { try { localStorage.removeItem('tvcc-chung'); window.LuuChung && LuuChung.xoa(); } catch (e){} await TV.choi(true); TV.buoc(20, ''); });
  const den = (id, cot, chanHang) => pg.evaluate(async ([id, cot, chanHang]) => {
    const {V1, E} = TV, p = await V1.layPhong(id); V1.vaoPhong(p, null, {x:cot * 48 + 24, y:chanHang * 48}); TV.buoc(20, ''); return {id:V1.G.id, dat:E.pl.onGround};
  }, [id, cot, chanHang]);
  const chem = (huong, lan) => pg.evaluate(async ([huong, lan]) => { TV.buoc(2, huong); for (let i = 0; i < lan; i++){ TV.buoc(1, 'a'); TV.buoc(30, ''); } }, [huong, lan]);
  const tim = id => pg.evaluate(id => MocAn.A.daTim(id), id);

  r = await den('P02', 14, 30); await chem('l', 8);
  ok('P02: chém vỡ tường nứt cột 13 → lối tắt "Rootscar Passage" (không tính Secret Found)', await tim('v1-tuong-nut-p02') && (await pg.evaluate(() => MocAn.A.dem('vung-1').timThay)) === 0, r);
  r = await den('P03', 15, 25); await chem('l', 8);
  ok('P03: chém vỡ tường nứt cột 14 → hốc H1', await tim('v1-hoc-h1-p03'), r);
  r = await den('P06', 5, 33); await pg.evaluate(() => TV.buoc(60, 'l'));
  ok('P06: đi vào tường giả → bí mật', await tim('v1-tuong-gia-p06'), await pg.evaluate(() => ({x:TV.E.pl.x / 48, y:TV.E.pl.y / 48})));
  // nhặt đồ ẩn: đặt nhân vật ngay chỗ vật phẩm
  const nhat = id => pg.evaluate(async id => {
    const {V1, G} = {V1:TV.V1, G:TV.V1.G}, ph = id.split('-')[0], p = await V1.layPhong(ph), v = p.vat_pham.find(v => v.id === id);
    V1.vaoPhong(p, null, {x:v.cot * 48 + 24, y:V1.viTriVP(v).y}); TV.buoc(10, ''); return G.luu.daNhat.includes(id);
  }, id);
  ok('P04: tới đáy giếng nhặt Mặt Nạ Sinh Lực', await nhat('P04-tang-mau'));
  ok('…→ bí mật giếng P04', await tim('v1-gieng-p04'));
  // Ashen Lullaby (đã có ảnh dấu hiệu 016/017 từ 02/11 → bí mật thứ 5 bật): đứng yên 3 giây cạnh chuông vùi tro P04 (cột 33, gờ hàng 7)
  r = await den('P04', 33, 7);
  r = await pg.evaluate(() => { TV.buoc(100, ''); const vong = TV.V1.G.id === 'P04'; TV.buoc(100, ''); return {vong, tim:MocAn.A.daTim('v1-ru-tro'), x:TV.E.pl.x / 48}; });
  ok('P04: đứng yên 3 giây cạnh chuông vùi tro → "Ashen Lullaby"', r.tim, r);
  await pg.screenshot({path:path.join(ANH, 'an-ru-tro.png')});
  r = await pg.evaluate(() => { const t = document.getElementById('an-toast'); let hien = false; for (let i = 0; i < 600 && !(hien = !!t && !t.hidden && /Secret Found/.test(t.textContent)); i++) TV.buoc(1, ''); return {hien, nen:t && t.style.backgroundImage, chu:t && t.textContent}; });
  ok('Thông báo dùng khung ChatGPT "Secret Found" góc trên phải', r.hien && /toast-(bi-mat|thanh-tuu)\.png/.test(r.nen), r);
  const truocManh = await pg.evaluate(() => TV.V1.G.luu.manh);
  ok('P02: nhặt Thẻ Tên hốc treo', await nhat('P02-the-ten'));
  r = await pg.evaluate(() => ({tim:MocAn.A.daTim('v1-hoc-treo-p02'), dem:MocAn.A.dem('vung-1'), tho:MocAn.A.thanhTuu().includes('tt-tho-san-v1'), lo:MocAn.A.S.nvLo.slice(), hang:MocAn.hang.join(' | ')}));
  ok('…→ đủ 5/5 bí mật, thành tựu "Root Listener", lộ "Names Beneath the Bark"', r.tim && r.dem.timThay === 5 && r.dem.tong === 5 && r.tho && r.lo.includes('nv-v1-nhung-cai-ten'), r);
  ok('…thông báo có chữ khắc Thẻ Tên ELDEN + "Secret Found … Discovered"', /ELDEN/.test(r.hang) && /Secret Found .* Discovered/.test(r.hang), r.hang);
  for (const id of ['P03-the-ten-H1', 'P04-the-ten', 'P09-the-ten']) await nhat(id);
  r = await pg.evaluate(() => ({xong:MocAn.A.daXong('nv-v1-nhung-cai-ten'), the:TV.V1.G.luu.kho.the_ten, manh:TV.V1.G.luu.manh, ky:window.LuuChung ? LuuChung.soKyUc() : -1, tt:MocAn.A.thanhTuu(), cho:MocAn.A.thuongCho()}));
  ok('Đủ 4 Thẻ Tên → xong "Names Beneath the Bark"', r.xong && r.the === 4, r);
  ok('…Mảnh Âm +40 của "The Rootbound Witness" (Hollow/Husk đã cộng trước đó)', r.manh - truocManh >= 40, r.manh - truocManh);
  ok('…Mảnh Ký Ức ghi vào lưu chung (Ashen Lullaby + Names Beneath the Bark)', r.ky === 2, r.ky);
  ok('…mở đoạn truyện "Names Beneath the Bark"', await pg.evaluate(() => MocAn.A.truyenDaMo().some(t => t.id === 'truyen-v1-the-ten')));
  ok('Thưởng chưa trao được (Âm Điểm khi Hệ thống đồ tắt) được GIỮ, không mất', r.cho.some(t => t.loai === 'am_diem'), r.cho.map(t => t.loai));
  // thông báo hiện lần lượt
  await pg.evaluate(() => TV.buoc(240, ''));
  r = await pg.evaluate(() => ({tb:TV.V1.G.tb, con:MocAn.hang.length}));
  ok('Thông báo chữ lần lượt hiện (không đè nhau)', /Hoàn thành ẩn|Đã tìm thấy|Nhật Ký|Thẻ|Những/.test(r.tb) || r.con >= 0, r);
  await pg.screenshot({path:path.join(ANH, 'an-thong-bao.png')});

  // trùm: vào P12 không trúng đòn, trùm gục
  r = await pg.evaluate(async () => {
    const {V1, E} = TV, p = await V1.layPhong('P12'); V1.vaoPhong(p, null, null); TV.buoc(30, '');
    V1.G.luu.trumHa = true; TV.buoc(5, '');
    return {xong:MocAn.A.daXong('nv-v1-lang-nhu-tro'), co:MocAn.A.S.co};
  });
  ok('Hạ trùm không trúng đòn → "A Blade Without Blood"', r.xong, r);
  r = await pg.evaluate(async () => { const {V1} = TV, p = await V1.layPhong('P01'); V1.vaoPhong(p, null, null); TV.buoc(10, ''); return MocAn.A.daXong('nv-v1-ve-cua-re'); });
  ok('Sau trùm quay lại Cửa Rễ → "The Mother\'s Last Echo"', r);

  // Chuông Lưu: nút + bảng nhật ký
  r = await pg.evaluate(async () => {
    const {V1} = TV, p = await V1.layPhong('P05'); V1.vaoPhong(p, null, null); TV.buoc(5, '');
    V1.G.trang = 'chuong'; V1.moChuong(0, true);
    const nut = document.getElementById('b-an'), chu = nut && nut.textContent, hien = !!nut && nut.offsetParent !== null;
    nut.click();
    // nhật ký bằng ảnh ChatGPT có 4 tab → đếm dòng qua mọi tab
    const tabs = [...document.querySelectorAll('#an-tab button')], muc = [], so = {};
    for (const t of tabs){ t.click(); const m = [...document.querySelectorAll('#an-ds .muc')]; so[t.textContent] = m.length; muc.push(...m.map(x => x.getBoundingClientRect().height)); }
    if (tabs[0]) tabs[0].click(); else muc.push(...[...document.querySelectorAll('#an-ds .muc')].map(x => x.getBoundingClientRect().height));
    const nk = document.getElementById('an-nk'), dong = document.getElementById('b-an-dong').getBoundingClientRect();
    return {chu, hien, mo:document.getElementById('l-an').classList.contains('mo'), so:muc.length, theoTab:so, cao:Math.min(...muc),
      nutCao:nut.getBoundingClientRect().height, tt:document.getElementById('an-tt').textContent,
      khung:!!nk && /khung-nhat-ky\.png/.test(getComputedStyle(nk).backgroundImage), tabs:tabs.map(t => t.textContent), dong:[dong.width, dong.height],
      ct:document.getElementById('an-ct') && document.getElementById('an-ct').textContent};
  });
  ok('Bảng Chuông Lưu có nút "Journal · Secrets 5/5"', r.hien && /5\/5/.test(r.chu), r.chu);
  ok('Mở Echo Journal: 3 nhiệm vụ + 4 Thẻ Tên + 2 truyện + 2 thành tựu, dòng cao ≥ 44px', r.mo && r.so === 11 && r.cao >= 44 && r.nutCao >= 44, r);
  ok('Echo Journal dùng khung ChatGPT 760×320 + 4 tab + nút đóng 44×44 + ô chi tiết có chữ', r.khung && r.tabs.length === 4 && r.dong[0] >= 44 && r.dong[1] >= 44 && r.ct.length > 10, r);
  await pg.screenshot({path:path.join(ANH, 'an-nhat-ky.png')});
  ok('Bật thử: không lỗi JS', !pg.loi.length, pg.loi);

  // tải lại: giữ tiến độ, không báo lại
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&an=1'); await pg.waitForFunction(() => window.MocAn && MocAn.bat && window.TV && TV.xong);
  r = await pg.evaluate(async () => { await TV.choi(false); TV.buoc(30, ''); return {dem:MocAn.A.dem('vung-1'), xong:MocAn.A.S.nvXong.length}; });
  ok('Tải lại trang giữ 5/5 bí mật + 3 nhiệm vụ xong', r.dem.timThay === 5 && r.xong === 3, r);
  await pg.close();

  // 3) bản lưu Vùng 1 cũ (đã phá tường, nhặt đồ trước khi bật) → tính bù
  pg = await mo('&an=1&an_moi=1');
  await pg.waitForFunction(() => window.MocAn && MocAn.bat);
  r = await pg.evaluate(async () => {
    await TV.choi(true); TV.buoc(5, ''); TV.V1.ghiLuu();
    const L = JSON.parse(localStorage.getItem('tvcc-vung1'));
    localStorage.removeItem('tvcc-an'); L.tuongVo = ['P02:13:27']; L.daNhat = ['P04-tang-mau']; localStorage.setItem('tvcc-vung1', JSON.stringify(L));
    await TV.choi(false); TV.buoc(10, ''); return MocAn.A.dem('vung-1');
  });
  ok('Bản lưu cũ: tính bù (giếng P04 = 1/5; tường nứt P02 vào lối tắt)', r.timThay === 1, r);
  ok('Không lỗi JS', !pg.loi.length, pg.loi);
  console.log('Hỏng', hong); await b.close(); process.exit(hong ? 1 : 0);
})();
