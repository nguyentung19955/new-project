// Phép thử logic: lưu chung (game/luu-chung.js), hộp thoại (game/cot-truyen/hop-thoai.js), trạm teleport (tram.js).
// Chạy: node tools/cot-truyen/kiem-thu-luu-chung.js
const path = require('path'), G = path.join(__dirname, '../../game');
const {tao, datDieuKien} = require(path.join(G, 'luu-chung.js'));
const HT = require(path.join(G, 'cot-truyen/hop-thoai.js'));
const Tram = require(path.join(G, 'cot-truyen/tram.js'));
let dat = 0, hong = 0;
const ok = (dk, ten, x) => { if (dk) dat++; else { hong++; console.log('HỎNG:', ten, x === undefined ? '' : JSON.stringify(x)); } };
function khoGia(){ const m = {}; return {getItem:k => k in m ? m[k] : null, setItem:(k, v) => { m[k] = String(v); }, removeItem:k => { delete m[k]; }, m}; }

// 1. lưu chung
const k = khoGia(); let L = tao(k);
ok(L.vungMo('vung-1') && !L.vungMo('ho-ngam'), 'vùng 1 mở sẵn, vùng khác khoá');
L.vaoVung('vung-1').datCo('da_xem_mo_dau').them('chuong_vo', 2).nhatKyUc('ky-uc-1').nhatKyUc('ky-uc-1');
L.datDiemVe({vung:'vung-1', phong:'P03', cot:4, hang:8});
L = tao(k);   // tải lại
ok(L.daVaoVung('vung-1') && L.vungCuoi() === 'vung-1', 'nhớ vùng đã vào');
ok(L.co('da_xem_mo_dau') === true, 'nhớ cờ cốt truyện');
ok(L.dem('chuong_vo') === 2 && L.dung('chuong_vo', 3) === false && L.dung('chuong_vo') === true && L.dem('chuong_vo') === 1, 'kho chung thêm/dùng');
ok(L.soKyUc() === 1, 'Mảnh Ký Ức không trùng');
ok(L.diemVe().phong === 'P03', 'điểm quay về');
L.datHoi(2).datHoi(1); ok(L.hoi() === 2, 'hồi chỉ tăng');
k.setItem('tvcc-chung', '{hỏng'); ok(tao(k).vungMo('vung-1') && !tao(k).co('da_xem_mo_dau'), 'bản lưu hỏng → bắt đầu mới, không lỗi');
k.setItem('tvcc-chung', JSON.stringify({phien_ban:1, vungMo:['ho-ngam']})); ok(tao(k).vungMo('vung-1') && tao(k).vungMo('ho-ngam'), 'luôn giữ vùng 1 mở');
const nem = {getItem(){ throw new Error('x'); }, setItem(){ throw new Error('x'); }, removeItem(){ throw new Error('x'); }};
const Ln = tao(nem); Ln.datCo('a'); ok(Ln.co('a') && Ln.ghi() === false, 'localStorage bị chặn vẫn chạy trong phiên');
ok(tao(null).vungMo('vung-1'), 'không có localStorage');

// 2. điều kiện mở
const L2 = tao(khoGia()); L2.datCo('ha_trum:vung-1');
ok(datDieuKien(L2, {vung_ha_trum:'vung-1'}) && !datDieuKien(L2, {vung_ha_trum:'ho-ngam'}), 'điều kiện hạ trùm');
ok(datDieuKien(L2, {tat_ca:[{vung_ha_trum:'vung-1'}, {hoi:1}]}) && !datDieuKien(L2, {tat_ca:[{co:'x'}, true]}) && datDieuKien(L2, {mot_trong:[{co:'x'}, true]}), 'điều kiện gộp');
ok(datDieuKien(L2, null) === false && datDieuKien(L2, true) === true, 'null = khoá');

// 3. trạm teleport
const tram = require(path.join(G, 'cot-truyen/tram-dich-chuyen.json'));
let ds = Tram.trangThai(Tram.gop(tram, null), tao(khoGia()), datDieuKien);
ok(ds.find(v => v.id === 'vung-1').di_duoc && ds.filter(v => v.di_duoc).length === 1, 'chỉ Vùng 1 đi được lúc đầu');
ds = Tram.gop(tram, {vung:[{id:'xuong-dong', duong_dan:'game/vung-2/index.html'}, {id:'vung-moi', ten:'Mới', duong_dan:'game/x/'}]});
const L3 = tao(khoGia()); L3.moVung('xuong-dong');
const st = Tram.trangThai(ds, L3, datDieuKien);
ok(st.find(v => v.id === 'xuong-dong').di_duoc && !st.find(v => v.id === 'vung-moi').di_duoc, 'gộp the-gioi.json + mở theo lưu chung');
const tg = require(path.join(G, 'the-gioi.json')), v1 = Tram.gop(tram, tg).find(v => v.id === 'vung-1');
ok(v1.duong_dan === 'game/vung-1/index.html' && v1.ten === 'Rễ Mục', 'đọc đúng game/the-gioi.json thật', v1);

// 4. hộp thoại: chưa có ảnh → tắt
(async () => {
  global.LuuChung = tao(khoGia());
  await HT.them({id:'thu', khung:'art/khong-co.png', nguoi:{a:{ten:'A'}}, dong:[{ai:'a', chu:'Xin chào'}]});
  ok(!HT.sanSang('thu') && HT.bat('thu') === false && !HT.dangMo(), 'thiếu ảnh khung → hộp thoại tắt');
  // giả lập đã có ảnh để thử luồng
  const d = {id:'thu2', _goc:'', khung:'K', nguoi:{a:{ten:'A', chan_dung:'C'}}, dong:[
    {ai:'a', chu:'Một'}, {ai:'a', chu:'Chọn', chon:[{chu:'x', toi:3}, {chu:'y', toi:2}]}, {ai:'a', chu:'Y', het:true}, {ai:'a', chu:'X', dat_co:'chon_x'}]};
  await HT.them(d);   // trong Node không có Image → ảnh null; vá sanSang tạm để thử luồng
  const goc = HT.sanSang; HT.sanSang = () => true;
  let xong = false; ok(HT.bat('thu2', () => { xong = true; }), 'mở được khi đủ ảnh');
  HT.capNhat(0.01, {xac_nhan:true}); ok(HT.dongHienTai().chu === 'Một', 'bấm lần đầu hiện hết chữ');
  HT.capNhat(0.01, {xac_nhan:true}); ok(HT.dongHienTai().chu === 'Chọn', 'sang dòng');
  HT.capNhat(5, {}); HT.capNhat(0, {xuong:true}); HT.capNhat(0, {len:true}); HT.capNhat(0, {xac_nhan:true});
  ok(HT.dongHienTai().chu === 'X', 'lựa chọn nhảy dòng');
  HT.capNhat(5, {}); HT.capNhat(0, {xac_nhan:true});
  ok(!HT.dangMo() && xong && LuuChung.co('chon_x') && LuuChung.daXem('thu2'), 'kết thúc: gọi xong, đặt cờ, đánh dấu đã xem');
  HT.sanSang = goc;
  console.log(`Đạt ${dat}/${dat + hong}`); process.exit(hong ? 1 : 0);
})();
