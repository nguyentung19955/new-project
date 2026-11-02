// DEMO "Thủ thành ghép tướng" — dữ liệu tướng, quái, boss (game nguyên bản, thần thoại Việt)
'use strict';
const HANH = {
  Kim:  { mau: '#e9cf6a', toi: '#7a6420', ten: 'Kim' },
  'Mộc': { mau: '#6cc24a', toi: '#2f5e1f', ten: 'Mộc' },
  'Thủy': { mau: '#4fb0ea', toi: '#1d4f7a', ten: 'Thủy' },
  'Hỏa': { mau: '#f0653a', toi: '#7a2414', ten: 'Hỏa' },
  'Thổ': { mau: '#c99355', toi: '#5e3e1c', ten: 'Thổ' },
};
// anh: ảnh tạm trong repo (dải khung pixel, khung vuông, khung 0 = đứng); moi: ảnh người dùng gen thả vào demo/assets/ (ưu tiên nếu có)
const TUONG = {
  giong:     { ten: 'Thánh Gióng', hanh: 'Hỏa', kieu: 'Đốt', mo: 'Ngựa sắt phun lửa: trúng là cháy liên tục.', dmg: 9, cd: 0.9, anh: 'tuong/giong.png' },
  sontinh:   { ten: 'Sơn Tinh', hanh: 'Thổ', kieu: 'Choáng', mo: 'Nện đá núi: có tỉ lệ làm quái choáng đứng yên.', dmg: 13, cd: 1.2, anh: 'tuong/tanvien.png' },
  thuytinh:  { ten: 'Thủy Tinh', hanh: 'Thủy', kieu: 'Làm chậm', mo: 'Sóng dữ: đánh lan quanh mục tiêu, làm chậm quái.', dmg: 6, cd: 1.0, anh: 'boss/thuytinh.png' },
  llq:       { ten: 'Lạc Long Quân', hanh: 'Thủy', kieu: 'Lan', mo: 'Sấm rồng: đòn đánh nảy sang các quái gần nhau.', dmg: 8, cd: 1.1, anh: 'tuong/llq.png' },
  auco:      { ten: 'Âu Cơ', hanh: 'Mộc', kieu: 'Cổ vũ', mo: 'Tiên Âu Cơ: tướng đứng cạnh (trên, dưới, trái, phải) đánh nhanh hơn.', dmg: 4, cd: 1.0, anh: 'tuong/auco.png' },
  cdt:       { ten: 'Chử Đồng Tử', hanh: 'Kim', kieu: 'Tài lộc', mo: 'Gậy nón thần: sinh Linh khí theo thời gian, hạ quái được thêm.', dmg: 5, cd: 1.0, anh: 'tuong/cdt.png' },
  mychau:    { ten: 'Mỵ Châu', hanh: 'Kim', kieu: 'Nỏ thần', mo: 'Nỏ thần An Dương Vương: bắn cùng lúc nhiều quái (thêm tên theo sao).', dmg: 7, cd: 0.8, anh: 'tuong/mychau.png' },
  thachsanh: { ten: 'Thạch Sanh', hanh: 'Thổ', kieu: 'Diệt boss', mo: 'Rìu thần: nhắm quái nhiều máu nhất, gây gấp bội lên boss.', dmg: 20, cd: 1.6, anh: 'tuong/thachsanh.png' },
};
const TUONG_IDS = Object.keys(TUONG);
const BO_MAC_DINH = ['giong', 'sontinh', 'thuytinh', 'llq', 'mychau'];

const QUAI = {
  thuong: { ten: 'Lính Tôm', anh: 'quai/tom.png', hp: 1, spd: 52, thuong: 3, co: 34 },
  nhanh:  { ten: 'Cáo Lửa', anh: 'quai/cao.png', hp: 0.6, spd: 92, thuong: 3, co: 32 },
  trau:   { ten: 'Rùa Đá', anh: 'quai/rua.png', hp: 3.2, spd: 34, thuong: 7, co: 38 },
};
// mỗi 10 đợt một boss, xoay vòng; kỹ năng: hoada (hoá đá tướng), doicho (đổi chỗ tướng), hoimau (hồi máu)
const BOSS = [
  { id: 'chantinh', ten: 'Chằn Tinh', anh: 'boss/chantinh.png', kn: 'hoada', knTen: 'Hoá đá', mo: 'Biến tướng thành đá, không đánh được một lúc', cd: 6 },
  { id: 'haba', ten: 'Hà Bá', anh: 'boss/haba.png', kn: 'doicho', knTen: 'Nước cuốn', mo: 'Cuốn tướng đổi chỗ lung tung', cd: 5 },
  { id: 'hotinh', ten: 'Hồ Tinh', anh: 'boss/hotinh.png', kn: 'hoimau', knTen: 'Hồi máu', mo: 'Hồi máu cho mình và quái quanh', cd: 4 },
];
const CAU_HINH = {
  W: 844, H: 390, COT: 5, HANG: 3, O: 64, KHE: 6,
  SAO_MAX: 7, BAC_MAX: 5, MANG: 3, LK_DAU: 100,
  giaTrieu: (n) => 10 + 6 * n,                       // giá Triệu hồi lần thứ n (n = số lần đã triệu)
  giaBac: (b) => [80, 160, 300, 500, 800][b],          // giá lên bậc b → b+1
  heSoSao: (s) => Math.pow(2.2, s - 1),
  heSoBac: (b) => 1 + 0.4 * b,
  mauDot: (w) => 18 * Math.pow(1.21, w - 1) * (1 + 0.03 * w),
};
