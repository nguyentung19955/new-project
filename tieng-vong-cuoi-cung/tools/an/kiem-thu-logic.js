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
ok('Mục thiếu ảnh / chờ tính năng bị tắt (Ashen Lullaby, Unanswered Bell, Three Notes, Iria)', !A.BM.find(b => b.id === 'v1-ru-tro') && !A.BM.find(b => b.id === 'v1-chuong-chua-dap') && !A.NV.find(n => n.id === 'nv-v1-ba-tieng-ngan') && !A.NV.find(n => n.id === 'nv-v1-iria'));
ok('Vùng 1 đang bật 4 bí mật tính "Secret Found" + 1 lối tắt (đếm riêng)', A.dem(V).tong === 4 && A.demLoiTat(V).tong === 2, [A.dem(V), A.demLoiTat(V)]);
ok('ChatGPT: đủ 6 bí mật + 2 lối tắt trong dữ liệu Vùng 1', D.bi_mat.filter(b => b.vung === V && b.loai !== 'loi_tat').length === 6 && D.bi_mat.filter(b => b.loai === 'loi_tat').length === 2);
ok('Nhật ký trống lúc đầu (chưa lộ gì)', A.nhatKy(V).length === 0);

// 2) từng bí mật lấy được
let r = A.suKien(ev('vo-tuong', 'P02', {cot:13, hang:28}), the());
ok('Vỡ tường nứt P02 → "Passage Opened" (lối tắt), KHÔNG tăng Secret Found', r.some(x => x.k === 'loi-tat' && x.muc.id === 'v1-tuong-nut-p02') && A.dem(V).timThay === 0 && A.demLoiTat(V).mo === 1, r.map(x => x.k));
r = A.suKien(ev('vo-tuong', 'P02', {cot:13, hang:29}), the());
ok('Vỡ thêm ô cùng tường không đếm lại', !r.length);
r = A.suKien(ev('vo-tuong', 'P03', {cot:14, hang:23}), the());
ok('Vỡ tường nứt P03 → hốc H1', r.some(x => x.muc.id === 'v1-hoc-h1-p03'));
r = A.suKien(ev('vo-tuong', 'P03', {cot:30, hang:23}), the());
ok('Vỡ chỗ khác không phải bí mật', !r.length, r);
r = A.suKien(ev('cham-o', 'P06', {o:'G', cot:3, hang:31}), the());
ok('Đi vào tường giả P06 → bí mật', r.some(x => x.muc.id === 'v1-tuong-gia-p06'));
r = A.suKien(ev('cham-o', 'P02', {o:'G'}), the());
ok('Ô G phòng khác không tính', !r.length);
r = A.suKien(ev('vao-phong', 'P05', {tu:'P04'}), the());
ok('Vào P05 từ P04 (đường chính) không phải lối tắt', !r.length);
r = A.suKien(ev('vao-phong', 'P05', {tu:'P09'}), the());
ok('Leo dây từ P09 lên P05 → "Passage Opened" (lối tắt P05↔P09), không tăng Secret Found', r.some(x => x.k === 'loi-tat' && x.muc.id === 'v1-loi-tat-p05-p09') && A.demLoiTat(V).mo === 2);
r = A.suKien(ev('nhat', 'P04', {id:'P04-tang-mau'}), the({daNhat:['P04-tang-mau']}));
ok('Nhặt Mặt Nạ Sinh Lực ở giếng P04 → bí mật', r.some(x => x.muc.id === 'v1-gieng-p04'));
ok('Có thưởng Âm Điểm (bi_mat)', r.find(x => x.k === 'bi-mat').thuong.some(t => t.loai === 'am_diem'));
ok('Thưởng Mảnh Âm bù đúng mức ChatGPT (Hollow 40 bù, Husk 85 bù)', D.bi_mat.find(b => b.id === 'v1-hoc-h1-p03').thuong[0].so === 40 && D.bi_mat.find(b => b.id === 'v1-tuong-gia-p06').thuong[0].so === 85);

// 3) Thẻ Tên: lộ khi nhặt thẻ đầu, tiến độ, xong ở 4
const nhat = ['P04-tang-mau', 'P02-the-ten'];
r = A.suKien(ev('nhat', 'P02', {id:'P02-the-ten'}), the({kho:{the_ten:1}, daNhat:nhat}));
ok('Nhặt Thẻ Tên đầu → lộ "Names Beneath the Bark"', r.some(x => x.k === 'nv-lo' && x.muc.id === 'nv-v1-nhung-cai-ten'));
ok('…và bí mật hốc treo P02 (4/4) → thành tựu "Root Listener"', r.some(x => x.k === 'thanh-tuu' && x.muc.id === 'tt-tho-san-v1') && A.dem(V).timThay === 4, A.dem(V));
ok('Thẻ Tên có chữ khắc ChatGPT (ELDEN)', A.theTen({daNhat:nhat}).length === 1 && /ELDEN/.test(A.theTen({daNhat:nhat})[0].chu));
r = A.suKien(ev('nhat', 'P03', {id:'P03-the-ten-H1'}), the({kho:{the_ten:2}, daNhat:nhat.concat('P03-the-ten-H1')}));
ok('Thẻ Tên thứ 2 → báo tiến độ 2/4', r.some(x => x.k === 'tien-do' && x.td.da === 2 && x.td.tong === 4), r);
r = A.suKien(ev('nhat', 'P09', {id:'P09-the-ten'}), the({kho:{the_ten:4}}));
const x = r.find(x => x.k === 'nv-xong');
ok('Đủ 4 → xong, thưởng 1 Mảnh Ký Ức + đoạn truyện', x && x.thuong.some(t => t.loai === 'ky_uc') && x.thuong.some(t => t.loai === 'truyen' && t.id === 'truyen-v1-the-ten'), x);
ok('Mở truyện "Names Beneath the Bark" (đã có chữ ChatGPT)', A.moTruyen('truyen-v1-the-ten') && A.truyenDaMo().length === 1);
ok('Truyện còn chờ ChatGPT không mở được (giữ chờ)', !A.moTruyen('truyen-v1-ru-tro'));
ok('Nhật ký: 1 dòng Remembered', A.nhatKy(V).filter(n => n.xong && n.trang_thai === 'Remembered').length === 1, A.nhatKy(V));

// 4) trùm không trúng đòn
let B = BiMat.tao(D, null, {});
B.suKien(ev('vao-phong', 'P12'), the()); B.suKien(ev('bi-danh', 'P12'), the());
r = B.suKien(ev('ha-trum', 'P12'), the());
ok('Trúng đòn rồi hạ trùm → không có "A Blade Without Blood"', !r.some(x => x.muc && x.muc.id === 'nv-v1-lang-nhu-tro'));
B.suKien(ev('bi-danh', 'P11'), the());
B = BiMat.tao(D, null, {});
B.suKien(ev('bi-danh', 'P11'), the());           // trúng đòn ở phòng khác không tính
B.suKien(ev('vao-phong', 'P12'), the());
r = B.suKien(ev('ha-trum', 'P12'), the());
ok('Vào P12, không trúng đòn, hạ trùm → "A Blade Without Blood" + thành tựu "Untouched by Silence", KHÔNG có Mảnh Ký Ức', r.some(x => x.k === 'nv-xong' && x.muc.id === 'nv-v1-lang-nhu-tro' && !x.thuong.some(t => t.loai === 'ky_uc')) && B.thanhTuu().includes('tt-khong-trung'));
// chết rồi vào lại phòng trùm: bộ đếm đặt lại (làm lại được, không lỡ vĩnh viễn)
let C = BiMat.tao(D, null, {});
C.suKien(ev('vao-phong', 'P12'), the()); C.suKien(ev('bi-danh', 'P12'), the()); C.suKien(ev('vao-phong', 'P11'), the()); C.suKien(ev('vao-phong', 'P12'), the());
r = C.suKien(ev('ha-trum', 'P12'), the());
ok('Thua rồi vào lại phòng trùm đánh sạch vẫn được', r.some(x => x.muc && x.muc.id === 'nv-v1-lang-nhu-tro'));

// 5) Về Cửa Rễ: chỉ sau khi hạ trùm
r = C.suKien(ev('vao-phong', 'P01'), the());
ok('Vào P01 trước khi hạ trùm (chưa có cờ) → không có gì', !r.some(x => x.muc && x.muc.id === 'nv-v1-ve-cua-re'));
r = C.suKien(ev('vao-phong', 'P01'), the({co:{'ha_trum:vung-1':true}}));
ok('Sau khi hạ trùm vào P01 → "The Mother\'s Last Echo" xong', r.some(x => x.k === 'nv-xong' && x.muc.id === 'nv-v1-ve-cua-re'));

// 6) lưu / tải lại + phần thưởng giữ chờ
A.giuCho({loai:'am_diem', nguon:'bi_mat'});
const L = JSON.parse(JSON.stringify(A.luu()));
const A2 = BiMat.tao(D, L, {});
ok('Tải lại giữ bí mật + nhiệm vụ + thành tựu + truyện + thưởng chờ', A2.dem(V).timThay === 4 && A2.demLoiTat(V).mo === 2 && A2.truyenDaMo().length === 1 && A2.daXong('nv-v1-nhung-cai-ten') && A2.thanhTuu().length === A.thanhTuu().length && A2.thuongCho().length === 1);
A2.daTraThuong(0); ok('Trao xong thưởng chờ thì xoá', A2.thuongCho().length === 0);
ok('Bản lưu hỏng/khác phiên bản → bắt đầu sạch', BiMat.tao(D, {phien_ban:99, bm:['x']}, {}).dem(V).timThay === 0);

// 7) can_anh: đủ ảnh thì mục tự bật (thử với bản sao bỏ cho_chatgpt)
const D2 = D;
ok('Thiếu ảnh → vẫn tắt', !BiMat.tao(D2, null, {coAnh:() => false}).BM.find(b => b.id === 'v1-ru-tro'));
const E2 = BiMat.tao(D2, null, {coAnh:() => true});
ok('Đủ ảnh → bật Ashen Lullaby (Unanswered Bell vẫn chờ tính năng Echo replay)', !!E2.BM.find(b => b.id === 'v1-ru-tro') && !E2.BM.find(b => b.id === 'v1-chuong-chua-dap'));
r = E2.suKien(ev('dung-im', 'P04', {cot:34, hang:6, giay:2}), the());
ok('Đứng im 2 giây chưa đủ', !r.length);
r = E2.suKien(ev('dung-im', 'P04', {cot:34, hang:6, giay:3}), the());
ok('Đứng im 3 giây cạnh chuông vùi → lộ bí mật', r.some(x => x.muc.id === 'v1-ru-tro'));
// bản lưu cũ (phiên trước đếm tường nứt P02 là bí mật) → chuyển sang lối tắt
const cu = BiMat.moi(); cu.bm = ['v1-tuong-nut-p02', 'v1-hoc-h1-p03']; delete cu.lt;
const A3 = BiMat.tao(D, cu, {});
ok('Bản lưu cũ: tường nứt P02 chuyển thành lối tắt, bí mật còn 1/4', A3.dem(V).timThay === 1 && A3.demLoiTat(V).mo === 1, [A3.dem(V), A3.demLoiTat(V)]);

// 8) dữ liệu hợp lệ: id không trùng, mọi bí mật bật có dấu hiệu + phòng có thật
const ids = [].concat(D.bi_mat, D.nhiem_vu).map(m => m.id);
ok('id không trùng', new Set(ids).size === ids.length);
const fs = require('fs');
ok('Phòng của mọi bí mật Vùng 1 có thật', D.bi_mat.filter(b => b.vung === V).every(b => fs.existsSync(path.join(__dirname, '../../game/vung-1/phong/' + b.phong + '.json'))));
ok('Mọi truyện được thưởng có trong danh sách truyện', [].concat(D.bi_mat, D.nhiem_vu).every(m => (m.thuong || []).filter(t => t.loai === 'truyen').every(t => D.truyen[t.id])));
ok('4 Thẻ Tên trong dữ liệu đều có thật trong phòng', Object.keys(D.the_ten).length === 4 && Object.keys(D.the_ten).every(id => coVP(id)));
ok('Mọi thành tựu được thưởng đều có trong danh sách thành tựu', D.nhiem_vu.every(n => (n.thuong || []).filter(t => t.loai === 'thanh_tuu').every(t => D.thanh_tuu.find(x => x.id === t.id))));
// vật phẩm được dùng làm điều kiện phải có trong phòng
function coVP(id){ return D.bi_mat.length && fs.readdirSync(path.join(__dirname, '../../game/vung-1/phong')).some(f => (require(path.join(__dirname, '../../game/vung-1/phong', f)).vat_pham || []).some(v => v.id === id)); }
ok('Vật phẩm điều kiện (P04-tang-mau, P02-the-ten) có thật trong phòng', coVP('P04-tang-mau') && coVP('P02-the-ten'));
const tong = fs.readdirSync(path.join(__dirname, '../../game/vung-1/phong')).reduce((s, f) => s + (require(path.join(__dirname, '../../game/vung-1/phong', f)).vat_pham || []).filter(v => v.loai === 'the_ten').length, 0);
ok('Vùng 1 có đúng 4 Thẻ Tên (nhiệm vụ làm xong được)', tong === 4, tong);
console.log('Hỏng', hong); process.exit(hong ? 1 : 0);
