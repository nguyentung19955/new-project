// Kiểm logic Hệ thống tiến triển / Charm / cây kỹ năng – phiên bản 2 theo tư vấn ChatGPT. Chạy: node tools/he-thong/kiem-thu-logic.js
const HT = require('../../game/he-thong/he-thong.js'), D = require('../../game/he-thong/du-lieu.json');
let hong = 0; const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };

// --- cấp / XP (đúng bảng ChatGPT) ---
let h = HT.tao(D, null, {ngauNhien:HT.mulberry32(7)});
ok('Bắt đầu cấp 1, 0 Echo Note', h.cap() === 1 && h.notCon() === 0);
ok('Mốc cấp 2..12 đúng bảng ChatGPT (60…2310)', [2, 3, 4, 5, 6, 12].map(h.nguongCap).join() === '60,150,270,420,600,2310');
ok('Từ cấp 12: XP(L+1)−XP(L) = 360 + 45(L−12)', h.nguongCap(13) - h.nguongCap(12) === 360 && h.nguongCap(14) - h.nguongCap(13) === 405);
h.S.diem = 1e9; ok('Cấp tối đa bản đầu = 30', h.cap() === 30); h.S.diem = 0;
let r = h.congDiem('tinh_anh', {khoa:'P11:0'});
ok('Tinh anh lần đầu 45 XP → chưa lên cấp (cần 60); mở lựa chọn Charm (moChon)', r.them === 45 && r.laDau && r.moChon && h.cap() === 1, r);
ok('Hạ tinh anh đầu → mở lựa chọn Charm đầu (Bell\'s Return / Ashen Mercy)', JSON.stringify(h.S.choChon) === '["bells_return","ashen_mercy"]');
r = h.congDiem('tinh_anh', {khoa:'P11:0'});
ok('Tái đấu cùng tinh anh chỉ 15 XP', r.them === 15 && !r.laDau && h.cap() === 2 && h.notCon() === 1, r);
ok('Quái thường 3–5 XP', Array.from({length:50}, () => h.congDiem('quai_thuong').them).every(x => x >= 3 && x <= 5));
ok('Trùm lần đầu 160, bí mật 30', HT.tao(D).congDiem('trum').them === 160 && HT.tao(D).congDiem('bi_mat').them === 30);

// --- mốc mở khoá theo cấp ---
const k = HT.tao(D, null, {ngauNhien:HT.mulberry32(3)});
k.S.diem = k.nguongCap(2);
ok('Cấp 2: Keen Edge mở được (1 Note)', k.trangThaiNut('keen_edge') === 'mo_duoc');
ok('Cấp 2: Lingering Echo khoá theo cấp (cần cấp 3)', k.trangThaiNut('lingering_echo') === 'thieu_cap');
ok('Mở Keen Edge → +10% sát thương, có Frostline Slash', k.moNut('keen_edge').ok && k.chiSo().sat_thuong === 10 && k.chiSo().vfx_chem === 'frostline');
k.S.diem = k.nguongCap(5);
ok('Cấp 5 nhưng chưa hạ trùm Vùng 1 → Resonant Cut "thieu_dieu_kien"', k.trangThaiNut('resonant_cut') === 'thieu_dieu_kien');
const k2 = HT.tao(D, k.luu(), {coCo:c => c === 'ha_trum:vung-1'});
ok('Hạ trùm + cấp 5 → Resonant Cut mở được (2 Note)', k2.trangThaiNut('resonant_cut') === 'mo_duoc' && k2.moNut('resonant_cut').ok && k2.notCon() === 1, k2.notCon());
ok('Kỹ năng Echo (Phantom Pursuit) chờ cơ chế Echo', k2.trangThaiNut('phantom_pursuit') === 'chua_co_che');
k2.S.diem = k2.nguongCap(10);
ok('Fifth Toll: chưa có ảnh don5 → "cho_anh"', k2.trangThaiNut('fifth_toll') === 'cho_anh');
const k3 = HT.tao(D, k2.luu(), {coAnh:() => true, coCo:() => true});
ok('Fifth Toll có ảnh nhưng chưa qua thử thách → khoá', k3.trangThaiNut('fifth_toll') === 'thieu_thu_thach');
k3.xongThuThach('fifth_toll');
ok('Qua thử thách + cấp 10 + đủ 3 Note → mở được, thêm nhát don5', k3.moNut('fifth_toll').ok && k3.chiSo().them_nhat.includes('don5'));

// --- Charm đầu, rơi đồ, độ hiếm ---
ok('Chọn Ashen Mercy làm Charm đầu (Faded)', h.chonCharmDau('ashen_mercy').ok && h.S.tui[0].mau === 'ashen_mercy' && h.S.tui[0].hiem === 'faded' && !h.S.choChon);
ok('Không chọn lại được lần 2', !h.chonCharmDau('bells_return').ok);
ok('Quái thường không rơi Charm', Array.from({length:300}, () => h.roiDo('quai_thuong')).every(x => x === null));
const g = HT.tao(D, null, {ngauNhien:HT.mulberry32(11)}), dem = {faded:0, whispered:0, haunted:0, eternal:0};
let phan = 0;
for (let i = 0; i < 5000; i++){ const x = g.roiDo('trum'); dem[x.mon.hiem]++; if (x.phanRa) phan++; }
ok('Vùng 1: tỉ lệ ~75/23/2/0 (không Eternal)', dem.eternal === 0 && Math.abs(dem.faded / 5000 - 0.75) < 0.03 && Math.abs(dem.whispered / 5000 - 0.23) < 0.03 && dem.haunted > 40, dem);
ok('Charm Faded trùng mẫu → tự phân rã thành Echo Dust (không đồ rác)', phan > 3000 && g.S.dust > 0 && g.S.tui.filter(m => m.hiem === 'faded').length <= 3, {phan, dust:g.S.dust});
const ge = HT.tao(D, null, {ngauNhien:HT.mulberry32(5), vung:'vung-9'}), de = {faded:0, whispered:0, haunted:0, eternal:0};
for (let i = 0; i < 6000; i++) de[ge.roiDo('trum').mon.hiem]++;
ok('Endgame: ~65/27/7/1, có Eternal', de.eternal > 20 && de.eternal < 120 && Math.abs(de.faded / 6000 - 0.65) < 0.03, de);
const hau = g.S.tui.find(m => m.hiem === 'haunted');
ok('Haunted có 2 dòng phụ khác nhau', hau && hau.dong.length === 2 && hau.dong[0].id !== hau.dong[1].id, hau && hau.dong.map(g.moTaDong));
ok('Vùng 1 không lăn dòng phụ cần cơ chế chưa có (Swift Echo, Bellward)', g.S.tui.every(m => m.dong.every(d => d.id !== 'hoi_echo' && d.id !== 'khang_bay')));

// --- ô Charm + trần ---
const L = HT.tao(D, null, {ngauNhien:HT.mulberry32(2), soKyUc:() => 0});
ok('3 ô đầu', L.oToiDa() === 3);
ok('Thêm ô theo Memory Shard 6/12/…/42 → tối đa 10', HT.tao(D, null, {soKyUc:() => 6}).oToiDa() === 4 && HT.tao(D, null, {soKyUc:() => 48}).oToiDa() === 10);
L.S.choChon = ['bells_return', 'ashen_mercy']; L.chonCharmDau('bells_return');
const br = L.S.tui[0];
ok('Cắm Bell\'s Return (2 ô)', L.lap(br.uid).ok && L.oDaDung() === 2 && L.chiSo().hoan_hoi.so_don === 10);
L.S.tui.push({uid:'x1', mau:'ashen_mercy', hiem:'faded', dong:[], lanRen:0});
ok('Thêm Ashen Mercy (2 ô) → hết ô', L.lap('x1').ly === 'het_o');
L.S.tui.push({uid:'x2', mau:'bells_return', hiem:'haunted', dong:[], lanRen:0});
ok('Không cắm 2 Charm cùng mẫu', L.lap('x2').ly === 'trung_mau');
L.go(br.uid);
L.S.tui.push({uid:'x3', mau:'rootbound_oath', hiem:'eternal', dong:[{id:'sat_thuong', v:5}, {id:'khang', v:2}, {id:'manh_am', v:10}], lanRen:0});
L.S.tui.push({uid:'x4', mau:'ashen_mercy', hiem:'eternal', dong:[{id:'sat_thuong', v:5}, {id:'khang', v:2}, {id:'am_diem', v:8}], lanRen:0});
L.lap('x3'); L.lap('x4');
const c = L.chiSo();
ok('Trần: khung bất tử từ trang bị tối đa +3', c.khang === 3, c.khang);
ok('Chỉ số cộng dòng phụ + hiệu ứng Charm', c.sat_thuong === 10 && c.manh_am === 10 && c.tren_khong_khang === 12 && c.ket_lieu_hoi, c);
const tranTest = HT.tao(D, null, {soKyUc:() => 48});
for (let i = 0; i < 3; i++) tranTest.S.tui.push({uid:'t' + i, mau:D.charm[i].id, hiem:'eternal', dong:[{id:'sat_thuong', v:5}, {id:'sat_thuong', v:5}, {id:'sat_thuong', v:5}], lanRen:0});
for (let i = 0; i < 3; i++) tranTest.lap('t' + i);
ok('Trần: sát thương từ Charm tối đa +20%', tranTest.chiSo().sat_thuong === 20, tranTest.chiSo().sat_thuong);
ok('trangBiDangDung trả Charm đang cắm (cho phiên sucmanh)', L.trangBiDangDung().length === 2 && L.trangBiDangDung()[0].mau === 'rootbound_oath');
const dTruoc = L.S.dust; ok('Phân rã thủ công → Echo Dust, tự gỡ khỏi ô', L.phanRa('x4').ok && L.S.dust === dTruoc + 150 && L.trangBiDangDung().length === 1);

// --- tái rèn ---
ok('Tái rèn tắt khi chưa có Morrow', L.taiRen('x3', 0, () => true).ly === 'chua_mo');
const R = HT.tao(D, L.luu(), {choTaiRen:true, ngauNhien:HT.mulberry32(4)});
R.S.dust = 1000; let shard = 1000; const tra = n => shard >= n && ((shard -= n), true);
const cu = JSON.stringify(R.tim('x3').dong);
let t1 = R.taiRen('x3', 0, tra);
ok('Tái rèn lần 1: 40 Dust + 100 Shard, dòng khác giữ nguyên', t1.ok && R.S.dust === 960 && shard === 900 && JSON.stringify(R.tim('x3').dong.slice(1)) === JSON.stringify(JSON.parse(cu).slice(1)));
ok('Được giữ kết quả cũ nếu mới kém', R.giuKetQua('x3', false).ok && JSON.stringify(R.tim('x3').dong) === cu);
R.taiRen('x3', 0, tra); R.giuKetQua('x3', true); R.taiRen('x3', 1, tra);
ok('Giá tăng: lần 2 = 80+200, lần 3 = 160+400', R.S.dust === 1000 - 40 - 80 - 160 && shard === 1000 - 100 - 200 - 400, {dust:R.S.dust, shard});
ok('Dòng mới không trùng các dòng còn lại của món', R.tim('x3').dong.filter((_, i) => i !== 1).every(d => d.id !== R.tim('x3').choGiu.moi.id));

// --- mô phỏng Vùng 1 (ChatGPT: mô phỏng loot/XP nhiều lượt trước khi chốt số) ---
// 1 lượt Vùng 1: 11 quái thường + tinh anh 1 lần + trùm + 0..5 bí mật (phiên "an"); cày thêm = mỗi vòng 11 quái (hồi sinh khi nghỉ chuông)
const capCuoi = [], capBiMat = [];
for (let s = 0; s < 400; s++){
  const v = HT.tao(D, null, {ngauNhien:HT.mulberry32(100 + s)});
  for (let i = 0; i < 11; i++) v.congDiem('quai_thuong');
  v.congDiem('tinh_anh', {khoa:'P11:0'}); capCuoi.push(v.cap());
  v.congDiem('trum'); for (let i = 0; i < 5; i++) v.congDiem('bi_mat'); capBiMat.push(v.cap());
}
ok('Mô phỏng: trước trùm, không bí mật → cấp 2 (đủ mở Keen Edge)', capCuoi.every(x => x === 2), [...new Set(capCuoi)]);
ok('Mô phỏng: xong Vùng 1 + 5 bí mật → cấp 4–5 (ChatGPT nhắm 3–5)', capBiMat.every(x => x >= 4 && x <= 5), [...new Set(capBiMat)]);
const cay = HT.tao(D, null, {ngauNhien:HT.mulberry32(9)});
const vongLen = muc => { let n = 0; while (cay.cap() < muc && n++ < 500) for (let i = 0; i < 11; i++) cay.congDiem('quai_thuong'); return n; };
cay.S.diem = cay.nguongCap(5); const v6 = vongLen(6), v7 = vongLen(7);
ok('Giảm dần khi vượt cấp mục tiêu Vùng 1 (5): lên 6 cần ≥4 vòng quái, lên 7 cần ≥6 vòng (không đáng cày)', v6 >= 4 && v7 >= 6, {v6, v7});

ok('Bản lưu phiên bản cũ (1) → bắt đầu mới', HT.tao(D, {phien:1, diem:999}).S.diem === 0);
console.log('Hỏng', hong); process.exit(hong ? 1 : 0);
