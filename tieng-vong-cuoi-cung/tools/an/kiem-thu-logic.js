// Phép thử logic Vật phẩm ẩn + Nhiệm vụ ẩn (game/an/an.js) – chạy: node tools/an/kiem-thu-logic.js
const path = require('path');
const BiMat = require(path.join(__dirname, '../../game/an/an.js'));
const D = require(path.join(__dirname, '../../game/an/du-lieu.json'));
let hong = 0;
const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined && !d ? ' – ' + JSON.stringify(c) : '')); };
const V = 'vung-1';
const the = (o = {}) => ({kho:Object.assign({the_ten:0}, o.kho), daNhat:o.daNhat || [], co:t => !!(o.co || {})[t]});
const ev = (k, phong, x) => Object.assign({k, vung:V, phong}, x);

// 1) bật/tắt theo cho_chatgpt + can_anh
let A = BiMat.tao(D, null, {});
ok('Mục cho_chatgpt bị tắt (chuông dưới tro, Ba Tiếng Ngân)', !A.BM.find(b => b.id === 'v1-chuong-duoi-tro') && !A.NV.find(n => n.id === 'nv-v1-ba-tieng-ngan'));
ok('Vùng 1 đang bật 5 bí mật', A.dem(V).tong === 5, A.dem(V));
ok('Nhật ký trống lúc đầu (chưa lộ gì)', A.nhatKy(V).length === 0);

// 2) từng bí mật lấy được
let r = A.suKien(ev('vo-tuong', 'P02', {cot:13, hang:28}), the());
ok('Vỡ tường nứt P02 → bí mật', r.some(x => x.k === 'bi-mat' && x.muc.id === 'v1-tuong-nut-p02'), r.map(x => x.k));
ok('…và lộ nhiệm vụ "Kẻ Nghe Tiếng Rễ"', r.some(x => x.k === 'nv-lo' && x.muc.id === 'nv-v1-tho-san'));
r = A.suKien(ev('vo-tuong', 'P02', {cot:13, hang:29}), the());
ok('Vỡ thêm ô cùng tường không đếm lại', !r.some(x => x.k === 'bi-mat'));
r = A.suKien(ev('vo-tuong', 'P03', {cot:14, hang:23}), the());
ok('Vỡ tường nứt P03 → hốc H1', r.some(x => x.muc.id === 'v1-hoc-h1-p03'));
r = A.suKien(ev('vo-tuong', 'P03', {cot:30, hang:23}), the());
ok('Vỡ chỗ khác không phải bí mật', !r.length, r);
r = A.suKien(ev('cham-o', 'P06', {o:'G', cot:3, hang:31}), the());
ok('Đi vào tường giả P06 → bí mật', r.some(x => x.muc.id === 'v1-tuong-gia-p06'));
r = A.suKien(ev('cham-o', 'P02', {o:'G'}), the());
ok('Ô G phòng khác không tính', !r.length);
r = A.suKien(ev('nhat', 'P04', {id:'P04-tang-mau'}), the({daNhat:['P04-tang-mau']}));
ok('Nhặt Mặt Nạ Sinh Lực ở giếng P04 → bí mật', r.some(x => x.muc.id === 'v1-gieng-p04'));
ok('Có thưởng Âm Điểm (bi_mat)', r.find(x => x.k === 'bi-mat').thuong.some(t => t.loai === 'am_diem'));

// 3) Thẻ Tên: lộ khi nhặt thẻ đầu, tiến độ, xong ở 4
const nhat = ['P04-tang-mau', 'P02-the-ten'];
r = A.suKien(ev('nhat', 'P02', {id:'P02-the-ten'}), the({kho:{the_ten:1}, daNhat:nhat}));
ok('Nhặt Thẻ Tên đầu → lộ "Những Cái Tên Bị Quên"', r.some(x => x.k === 'nv-lo' && x.muc.id === 'nv-v1-nhung-cai-ten'));
ok('…và bí mật hốc treo P02 (5/5) → xong "Kẻ Nghe Tiếng Rễ"', r.some(x => x.k === 'nv-xong' && x.muc.id === 'nv-v1-tho-san') && A.dem(V).timThay === 5, A.dem(V));
r = A.suKien(ev('nhat', 'P03', {id:'P03-the-ten-H1'}), the({kho:{the_ten:2}, daNhat:nhat.concat('P03-the-ten-H1')}));
ok('Thẻ Tên thứ 2 → báo tiến độ 2/4', r.some(x => x.k === 'tien-do' && x.td.da === 2 && x.td.tong === 4), r);
r = A.suKien(ev('nhat', 'P09', {id:'P09-the-ten'}), the({kho:{the_ten:4}}));
const x = r.find(x => x.k === 'nv-xong');
ok('Đủ 4 → xong, thưởng 60 Mảnh Âm + Mảnh Ký Ức + thành tựu', x && x.thuong.some(t => t.loai === 'manh_am' && t.so === 60) && x.thuong.some(t => t.loai === 'ky_uc') && A.thanhTuu().includes('tt-nhung-cai-ten'), x);
ok('Phần truyện bí mật vẫn chờ ChatGPT (cho_chatgpt)', x.thuong.some(t => t.loai === 'truyen' && t.cho_chatgpt));
ok('Nhật ký hiện 2 dòng đã xong', A.nhatKy(V).filter(n => n.xong).length === 2, A.nhatKy(V));

// 4) trùm không trúng đòn
let B = BiMat.tao(D, null, {});
B.suKien(ev('vao-phong', 'P12'), the()); B.suKien(ev('bi-danh', 'P12'), the());
r = B.suKien(ev('ha-trum', 'P12'), the());
ok('Trúng đòn rồi hạ trùm → không có "Lặng Như Tro"', !r.some(x => x.muc && x.muc.id === 'nv-v1-lang-nhu-tro'));
B.suKien(ev('bi-danh', 'P11'), the());
B = BiMat.tao(D, null, {});
B.suKien(ev('bi-danh', 'P11'), the());           // trúng đòn ở phòng khác không tính
B.suKien(ev('vao-phong', 'P12'), the());
r = B.suKien(ev('ha-trum', 'P12'), the());
ok('Vào P12, không trúng đòn, hạ trùm → "Lặng Như Tro" xong + thành tựu', r.some(x => x.k === 'nv-xong' && x.muc.id === 'nv-v1-lang-nhu-tro') && B.thanhTuu().includes('tt-lang-nhu-tro'));
// chết rồi vào lại phòng trùm: bộ đếm đặt lại (làm lại được, không lỡ vĩnh viễn)
let C = BiMat.tao(D, null, {});
C.suKien(ev('vao-phong', 'P12'), the()); C.suKien(ev('bi-danh', 'P12'), the()); C.suKien(ev('vao-phong', 'P11'), the()); C.suKien(ev('vao-phong', 'P12'), the());
r = C.suKien(ev('ha-trum', 'P12'), the());
ok('Thua rồi vào lại phòng trùm đánh sạch vẫn được', r.some(x => x.muc && x.muc.id === 'nv-v1-lang-nhu-tro'));

// 5) Về Cửa Rễ: chỉ sau khi hạ trùm
r = C.suKien(ev('vao-phong', 'P01'), the());
ok('Vào P01 trước khi hạ trùm (chưa có cờ) → không có gì', !r.some(x => x.muc && x.muc.id === 'nv-v1-ve-cua-re'));
r = C.suKien(ev('vao-phong', 'P01'), the({co:{'ha_trum:vung-1':true}}));
ok('Sau khi hạ trùm vào P01 → "Về Cửa Rễ" xong', r.some(x => x.k === 'nv-xong' && x.muc.id === 'nv-v1-ve-cua-re'));

// 6) lưu / tải lại + phần thưởng giữ chờ
A.giuCho({loai:'am_diem', nguon:'bi_mat'});
const L = JSON.parse(JSON.stringify(A.luu()));
const A2 = BiMat.tao(D, L, {});
ok('Tải lại giữ bí mật + nhiệm vụ + thành tựu + thưởng chờ', A2.dem(V).timThay === 5 && A2.daXong('nv-v1-nhung-cai-ten') && A2.thanhTuu().length === A.thanhTuu().length && A2.thuongCho().length === 1);
A2.daTraThuong(0); ok('Trao xong thưởng chờ thì xoá', A2.thuongCho().length === 0);
ok('Bản lưu hỏng/khác phiên bản → bắt đầu sạch', BiMat.tao(D, {phien_ban:99, bm:['x']}, {}).dem(V).timThay === 0);

// 7) can_anh: đủ ảnh thì mục tự bật (thử với bản sao bỏ cho_chatgpt)
const D2 = JSON.parse(JSON.stringify(D)); D2.bi_mat.find(b => b.id === 'v1-chuong-duoi-tro').cho_chatgpt = false;
ok('Thiếu ảnh → vẫn tắt', !BiMat.tao(D2, null, {coAnh:() => false}).BM.find(b => b.id === 'v1-chuong-duoi-tro'));
const E2 = BiMat.tao(D2, null, {coAnh:() => true});
ok('Đủ ảnh → bật', !!E2.BM.find(b => b.id === 'v1-chuong-duoi-tro'));
r = E2.suKien(ev('dung-im', 'P04', {cot:34, hang:6, giay:2}), the());
ok('Đứng im 2 giây chưa đủ', !r.length);
r = E2.suKien(ev('dung-im', 'P04', {cot:34, hang:6, giay:3}), the());
ok('Đứng im 3 giây cạnh chuông vùi → lộ bí mật', r.some(x => x.muc.id === 'v1-chuong-duoi-tro'));

// 8) dữ liệu hợp lệ: id không trùng, mọi bí mật bật có dấu hiệu + phòng có thật
const ids = [].concat(D.bi_mat, D.nhiem_vu).map(m => m.id);
ok('id không trùng', new Set(ids).size === ids.length);
const fs = require('fs');
ok('Phòng của mọi bí mật Vùng 1 có thật', D.bi_mat.filter(b => b.vung === V).every(b => fs.existsSync(path.join(__dirname, '../../game/vung-1/phong/' + b.phong + '.json'))));
ok('Mọi thành tựu được thưởng đều có trong danh sách thành tựu', D.nhiem_vu.every(n => (n.thuong || []).filter(t => t.loai === 'thanh_tuu').every(t => D.thanh_tuu.find(x => x.id === t.id))));
// vật phẩm được dùng làm điều kiện phải có trong phòng
const coVP = id => D.bi_mat.length && fs.readdirSync(path.join(__dirname, '../../game/vung-1/phong')).some(f => (require(path.join(__dirname, '../../game/vung-1/phong', f)).vat_pham || []).some(v => v.id === id));
ok('Vật phẩm điều kiện (P04-tang-mau, P02-the-ten) có thật trong phòng', coVP('P04-tang-mau') && coVP('P02-the-ten'));
const tong = fs.readdirSync(path.join(__dirname, '../../game/vung-1/phong')).reduce((s, f) => s + (require(path.join(__dirname, '../../game/vung-1/phong', f)).vat_pham || []).filter(v => v.loai === 'the_ten').length, 0);
ok('Vùng 1 có đúng 4 Thẻ Tên (nhiệm vụ làm xong được)', tong === 4, tong);
console.log('Hỏng', hong); process.exit(hong ? 1 : 0);
