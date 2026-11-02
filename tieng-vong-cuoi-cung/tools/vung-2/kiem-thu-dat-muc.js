// kiem-thu-dat-muc.js – phép thử logic Gỗ Mục + Neo Rễ (game/vung-2/dat-muc.js) đúng số khung kế hoạch ChatGPT
// (docs/vung-2/ke-hoach-chatgpt.txt mục 3, 6). Chạy: node tools/vung-2/kiem-thu-dat-muc.js
'use strict';
const path = require('path');
const fs = require('fs');
const DatMuc = require(path.join(__dirname, '../../game/vung-2/dat-muc.js'));
let loi = 0, dat = 0;
function ok(dk, ten) { if (dk) { dat++; console.log('  ✓ ' + ten); } else { loi++; console.log('  ✗ ' + ten); } }
const T = 48;
const xa = {x: -9999, y: -9999, w: 28, h: 96};

function phong(luoi, them) { return Object.assign({luoi}, them || {}); }

// 1) Gỗ mục thường: 120 cảnh báo → 12 rơi (va chạm 4 khung đầu) → 180 mất → 18 mọc → chắc
{
  const dm = DatMuc.tao(phong(['.....', '.RR..', '#####']));
  ok(dm.dac(1, 1) === true && dm.dac(2, 1) === true, 'thường: ban đầu chắc');
  dm.buoc({chan: [[1, 1]], hop: xa});
  ok(dm.trangThai(2, 1).tt === 'CANH_BAO', 'thường: chạm 1 ô → cả cụm 2 ô cùng cảnh báo');
  for (let i = 1; i < 120; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'CANH_BAO', 'thường: còn cảnh báo ở khung 119 (rời chân không đặt lại)');
  dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'ROI' && dm.dac(1, 1) === true, 'thường: khung 120 bắt đầu rơi, còn va chạm');
  for (let i = 0; i < 4; i++) dm.buoc({hop: xa});
  ok(dm.dac(1, 1) === false, 'thường: tắt va chạm từ khung rơi thứ 5');
  for (let i = 0; i < 8; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'MAT', 'thường: sau 12 khung rơi → mất');
  for (let i = 0; i < 180; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'MOC' && dm.dac(1, 1) === false, 'thường: mất 180 khung → mọc lại (chưa va chạm)');
  for (let i = 0; i < 16; i++) dm.buoc({hop: xa});
  ok(dm.dac(1, 1) === false, 'thường: mọc khung 16 vẫn chưa va chạm');
  dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'CHAC' && dm.dac(1, 1) === true, 'thường: va chạm trở lại đúng khung mọc cuối');
}
// 2) Gỗ mục nhanh: 72 khung
{
  const dm = DatMuc.tao(phong(['...', 'QQQ', '###']));
  dm.buoc({chan: [[0, 1]], hop: xa});
  for (let i = 1; i < 72; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(0, 1).tt === 'CANH_BAO', 'nhanh: còn cảnh báo khung 71');
  dm.buoc({hop: xa});
  ok(dm.trangThai(2, 1).tt === 'ROI', 'nhanh: rơi ở khung 72');
  for (let i = 0; i < 12 + 210; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(2, 1).tt === 'MOC', 'nhanh: mất 210 khung');
}
// 3) Hoãn mọc khi người đứng trong chỗ mọc
{
  const dm = DatMuc.tao(phong(['...', '.R.', '###']));
  dm.buoc({chan: [[1, 1]], hop: xa});
  for (let i = 0; i < 119 + 12 + 180; i++) dm.buoc({hop: xa});
  const trong = {x: 1 * T + 10, y: 0, w: 28, h: 96};
  for (let i = 0; i < 300; i++) dm.buoc({hop: trong});
  ok(dm.dac(1, 1) === false, 'mọc: người đứng trong → không mọc chắn người (kể cả quá 180 khung)');
  for (let i = 0; i < 18; i++) dm.buoc({hop: xa});
  ok(dm.dac(1, 1) === true, 'mọc: người ra khỏi → chắc lại');
}
// 4) Xung bào tử: tăng tốc 30 khung, 1 lần / chu kỳ
{
  const dm = DatMuc.tao(phong(['....', 'PPP.', '####']));
  while (dm.khung < 99) dm.buoc({hop: xa});
  dm.buoc({chan: [[0, 1]], hop: xa});           // chạm ở khung 100; xung bào tử ở khung 150
  let roiO = null;
  for (let f = 2; f < 400 && roiO === null; f++) { dm.buoc({hop: xa}); if (dm.trangThai(0, 1).tt === 'ROI') roiO = dm.khung; }
  ok(roiO === 220 - 30, 'xung: cụm P đã kích hoạt rơi sớm đúng 30 khung (khung ' + roiO + ', không xung là 220)');
}
// 5) Neo Rễ: đóng băng đếm ngược, hết neo chạy tiếp đúng phần còn lại; hồi chiêu 360; không có nút thì không tốn hồi chiêu
{
  const p = phong(['.........', '.........', '.RRRR....', '#########'], {neo: [{id: 'n', cot: 0, hang: 1, cum: [[1, 2], [2, 2], [3, 2], [4, 2]]}]});
  const dm = DatMuc.tao(p);
  const kq0 = dm.datNeo({x: 8 * T, y: 1 * T, huong: 1});
  ok(!kq0.ok && kq0.ly_do === 'khong_co_nut' && dm.hoiChieu === 0, 'neo: xa/ngược hướng → không đặt, không tốn hồi chiêu');
  dm.buoc({chan: [[1, 2]], hop: xa});
  for (let i = 1; i < 50; i++) dm.buoc({hop: xa});
  const kq = dm.datNeo({x: 2 * T, y: 1.5 * T, huong: -1});
  ok(kq.ok && dm.hoiChieu === 360, 'neo: đặt được, hồi chiêu 360 khung');
  const t0 = dm.cum[0].t;
  for (let i = 0; i < 179; i++) dm.buoc({hop: xa});
  ok(dm.cum[0].t === t0 && dm.trangThai(1, 2).dongBang, 'neo: 180 khung đếm ngược đứng yên');
  ok(!dm.datNeo({x: 2 * T, y: 1.5 * T, huong: -1}).ok, 'neo: chỉ 1 neo cùng lúc');
  dm.buoc({hop: xa});
  ok(dm.neo === null && !dm.cum[0].dongBang, 'neo: hết 180 khung thì tự nhả');
  ok(dm.cum[0].t === t0 + 1, 'neo: khung nhả neo chạy tiếp ngay (t = ' + dm.cum[0].t + ')');
  for (let i = 0; i < 120 - t0 - 2; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(1, 2).tt === 'CANH_BAO', 'neo: chạy tiếp đúng phần còn lại (chưa rơi sớm)');
  dm.buoc({hop: xa});
  ok(dm.trangThai(1, 2).tt === 'ROI', 'neo: rơi đúng lúc hết phần còn lại');
  ok(dm.hoiChieu === 360 - (180 + 120 - t0 - 1), 'neo: hồi chiêu tính từ lúc đặt (' + dm.hoiChieu + ')');
}
// 6) Chốt rễ L giữ mở 180 khung; đường ngắm bị đá chặn
{
  const p = phong(['......', '..L...', '..L...', '######'], {neo: [{id: 'c', cot: 1, hang: 1, cum: [[2, 1], [2, 2]]}]});
  const dm = DatMuc.tao(p);
  ok(dm.dac(2, 1) === true, 'chốt: ban đầu đóng');
  dm.datNeo({x: 0.5 * T, y: 1.5 * T, huong: 1});
  dm.buoc({hop: xa});
  ok(dm.dac(2, 1) === false, 'chốt: Neo Rễ giữ mở');
  for (let i = 0; i < 180; i++) dm.buoc({hop: xa});
  ok(dm.dac(2, 2) === true, 'chốt: hết neo đóng lại');
  const p2 = phong(['....#....', '....#....', '#########'], {neo: [{id: 'x', cot: 6, hang: 1, cum: []}]});
  ok(!DatMuc.tao(p2).coNutGan({x: 2.5 * T, y: 1.5 * T, huong: 1}), 'neo: cần đường ngắm (đá chặn → không có nút)');
}
// 7) Cổng rễ đan + đặt lại khi hồi sinh
{
  const p = phong(['...', '.C.', '###'], {cong: [{id: 'g', o: [[1, 1]], mo_tu: 'phai'}]});
  const dm = DatMuc.tao(p);
  ok(dm.dac(1, 1) === true && !dm.moCong('g', 'trai') && dm.moCong('g', 'phai') && dm.dac(1, 1) === false, 'cổng: chỉ mở từ đúng phía');
  dm.datLai(['g']);
  ok(dm.dac(1, 1) === false, 'cổng: lối tắt đã mở giữ mở sau hồi sinh');
}
// 8) Trợ giúp cảnh báo dài (180/108)
{
  const dm = DatMuc.tao(phong(['..', 'RQ', '##']), {troGiup: true});
  dm.buoc({chan: [[0, 1], [1, 1]], hop: xa});
  for (let i = 1; i < 108; i++) dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'CANH_BAO', 'trợ giúp: nhanh còn cảnh báo ở 107');
  dm.buoc({hop: xa});
  ok(dm.trangThai(1, 1).tt === 'ROI' && dm.trangThai(0, 1).tt === 'CANH_BAO', 'trợ giúp: nhanh rơi ở 108, thường vẫn cảnh báo');
}
// 9) Mọi phòng Vùng 2 nạp được, nút neo đúng ô
{
  const dir = path.join(__dirname, '../../game/vung-2/phong');
  let n = 0, xau = 0;
  for (const f of fs.readdirSync(dir)) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const dm = DatMuc.tao(d); n++;
    for (const nn of d.neo || []) for (const [c, r] of nn.cum) if (dm.dac(c, r) === null) { xau++; console.log('    ô sai', d.id, nn.id, c, r); }
  }
  ok(n === 16 && xau === 0, `16 phòng nạp được, mọi ô trong cụm neo là gỗ mục/chốt (${n} phòng, ${xau} ô sai)`);
}
console.log(`\n${dat} đạt, ${loi} lỗi`);
process.exit(loi ? 1 : 0);
