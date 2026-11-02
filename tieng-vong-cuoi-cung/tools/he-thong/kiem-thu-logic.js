// Kiểm logic Hệ thống đồ/điểm/mở khoá (không cần trình duyệt). Chạy: node tools/he-thong/kiem-thu-logic.js
const HT = require('../../game/he-thong/he-thong.js'), D = require('../../game/he-thong/du-lieu.json');
let hong = 0; const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };
let h = HT.tao(D, null, {ngauNhien:HT.mulberry32(7)});
ok('Bắt đầu cấp 0, 0 Nốt', h.cap() === 0 && h.notCon() === 0);
ok('Chưa có Nốt thì không mở được nút', !h.moNut('luoi_1').ok && h.trangThaiNut('luoi_1') === 'thieu_not');
h.congDiem('tinh_anh');                                        // 40 điểm → cấp 1
ok('Hạ tinh anh (40) → cấp 1, 1 Nốt', h.cap() === 1 && h.notCon() === 1, h.S.diem);
ok('Nút cần nút trước bị chặn', h.trangThaiNut('luoi_2') === 'thieu_nut_truoc');
ok('Mở Rèn Vang Âm', h.moNut('luoi_1').ok && h.chiSo().cap_kiem === 1);
ok('Không mở lại nút đã mở', !h.moNut('luoi_1').ok);
ok('Nút cần hình (Nhát Thứ Năm) khi chưa có ảnh → "cho_anh"', h.trangThaiNut('luoi_3') === 'cho_anh');
let n = 0; while (h.cap() < 3 && n++ < 200) h.congDiem('quai_thuong');
ok('Quái thường cho điểm, ~' + n + ' con lên cấp 3 (nhịp chậm vừa)', h.cap() === 3 && n > 20 && n < 80, n);
h.moNut('vong_1'); ok('Tai Nghe Chuông +15% Mảnh Âm', h.chiSo().manh_am === 15);
// có ảnh → nút hình mở được
const h2 = HT.tao(D, h.luu(), {coAnh:() => true, ngauNhien:HT.mulberry32(9)});
ok('Tải lại từ bản lưu giữ nguyên cấp + nút', h2.cap() === 3 && h2.S.nut.includes('luoi_1') && h2.S.nut.includes('vong_1'));
ok('Có ảnh thì Nhát Thứ Năm hết "chờ hình"', h2.trangThaiNut('luoi_3') !== 'cho_anh', h2.trangThaiNut('luoi_3'));
// rơi đồ
ok('Quái thường không rơi Âm Phù', Array.from({length:200}, () => h2.roiDo('quai_thuong')).every(x => x === null));
const dem = {}; for (let i = 0; i < 4000; i++){ const m = h2.roiDo('tinh_anh'); dem[m.hiem] = (dem[m.hiem] || 0) + 1; }
ok('Tinh anh luôn rơi; độ hiếm theo tỉ lệ (không có Vọng Cổ trước khi hạ trùm)', !dem.vong_co && dem.thuong > dem.hiem && dem.hiem > dem.huyen_thoai, dem);
const m = h2.S.tui.find(x => x.hiem === 'huyen_thoai');
ok('Huyền Thoại có 3 dòng phụ khác nhau', m.dong.length === 3 && new Set(m.dong.map(d => d.id)).size === 3, m.dong.map(h2.moTaDong));
let vc = 0; for (let i = 0; i < 3000; i++){ const x = h2.roiDo('trum', {sauTrum:true}); if (x.hiem === 'vong_co') vc++; }
ok('Sau trùm mới có Vọng Cổ (hiếm ~1%)', vc > 5 && vc < 80, vc);
// Dây Ngân
const tui = h2.S.tui, a = tui.find(x => x.mau === 'luoi_ngan'), b = tui.find(x => x.mau === 'mat_na_nut');
ok('Cắm Lưỡi Ngân (2 ô)', h2.lap(a.uid).ok && h2.oDaDung() === 2);
ok('Cắm thêm Mặt Nạ Nứt (3 ô) → hết ô (tối đa 3)', h2.lap(b.uid).ly === 'het_o');
ok('Chỉ số cộng dòng chính + phụ', h2.chiSo().sat_thuong >= 10, h2.chiSo());
ok('trangBiDangDung trả món đang cắm (cho phiên sucmanh)', h2.trangBiDangDung().length === 1 && h2.trangBiDangDung()[0].mau === 'luoi_ngan');
ok('Gỡ ra thì hết chỉ số', h2.go(a.uid).ok && h2.trangBiDangDung().length === 0);
ok('capSucManh theo số nút đã mở', h2.capSucManh() === 1, h2.capSucManh());
ok('Bản lưu sai phiên bản → bắt đầu mới', HT.tao(D, {phien:99, diem:999}).S.diem === 0);
console.log('Hỏng', hong); process.exit(hong ? 1 : 0);
