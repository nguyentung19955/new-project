#!/usr/bin/env node
'use strict';
// Kiểm icon kỹ năng (claude/icon-ky-nang-rieng): mỗi chiêu một hình riêng.
//   node tools/kiem-ky-nang.js [--spec tools/pixel/spec/ky-nang.json] [--anh tong-quan.png] [--nguong 0.5]
// - Cùng tướng: không hai chiêu trùng hình chính (bo_phan.vat) → lỗi.
// - Mọi cặp (240×239/2): so điểm ảnh phần hình (bỏ khung + nền): giống ≥ ngưỡng → lỗi.
//   giống = số điểm cùng màu / số điểm hình của cả hai; dáng = IoU vùng hình (bỏ màu) — cùng tướng dáng ≥ 85% cũng lỗi.
//   Hai bản vẽ tay với nhau chỉ ghi chú (giữ nguyên hình chuẩn).
// - --anh: ảnh tổng theo tướng (mỗi hàng một tướng: Q W E R) để xem bằng Read.
// Mã thoát 0 = đạt, 1 = còn cặp trùng.
const fs = require('fs');
const path = require('path');
const { loadCore, Anh, chu, veKhung } = require('./ve-pixel.js');
const ROOT = path.resolve(__dirname, '..');

// vùng hình của icon: điểm trong 3..20 khác màu nền (tông tô + vòng trong)
function hinhIcon(f) {
  const nen = new Set([f.get(4, 4), f.get(3, 3), f.get(19, 19)]);
  const m = new Map();
  for (let y = 3; y <= 20; y++) for (let x = 3; x <= 20; x++) { const v = f.get(x, y); if (!nen.has(v)) m.set(y * 24 + x, v); }
  return m;
}
function soCap(a, b) {
  let cung = 0, giao = 0;
  for (const [p, v] of a) { const w = b.get(p); if (w !== undefined) { giao++; if (w === v) cung++; } }
  const hop = a.size + b.size - giao || 1;
  return { giong: cung / hop, dang: giao / hop };
}
function kiem(items, spec, nguong) {
  const loi = [], canh = [];
  const tuong = (it) => it.code.replace(/_[qwer]$/, '');
  // 1) cùng tướng không trùng hình chính
  const theoTuong = new Map();
  for (const sp of spec) { const h = sp.ma.split('/')[1].replace(/_[qwer]$/, ''); if (!theoTuong.has(h)) theoTuong.set(h, []); theoTuong.get(h).push(sp); }
  for (const [h, l] of theoTuong) {
    const dem = new Map();
    for (const sp of l) { const v = sp.bo_phan && sp.bo_phan.vat; if (v && v !== 'khong') { if (dem.has(v)) loi.push(`${h}: ${dem.get(v)} và ${sp.ma.split('/')[1]} cùng hình chính "${v}"`); else dem.set(v, sp.ma.split('/')[1]); } }
  }
  // 2) so ảnh mọi cặp
  const H = items.map((it) => hinhIcon(it.anims[0].frames[0]));
  const veTay = new Set(spec.filter((sp) => sp.mau).map((sp) => sp.ma.split('/')[1]));
  const cap = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const r = soCap(H[i], H[j]); const cungT = tuong(items[i]) === tuong(items[j]);
    cap.push({ a: items[i].code, b: items[j].code, ...r, cungT });
    // hai bản vẽ tay (claude/pixel-ky-nang-2) — chuẩn chất lượng, không sửa hình: chỉ ghi chú
    if (veTay.has(items[i].code) && veTay.has(items[j].code)) { if (r.giong >= nguong) canh.push(`${items[i].code} ~ ${items[j].code}: hai bản vẽ tay giống ${(r.giong * 100).toFixed(0)}% (giữ nguyên)`); continue; }
    if (r.giong >= nguong) loi.push(`${items[i].code} ~ ${items[j].code}: giống ${(r.giong * 100).toFixed(0)}% điểm ảnh (ngưỡng ${(nguong * 100).toFixed(0)}%)`);
    else if (cungT && r.dang >= 0.85) loi.push(`${items[i].code} ~ ${items[j].code}: cùng tướng, dáng trùng ${(r.dang * 100).toFixed(0)}%`);
    else if (r.giong >= nguong * 0.8) canh.push(`${items[i].code} ~ ${items[j].code}: giống ${(r.giong * 100).toFixed(0)}%`);
  }
  cap.sort((x, y) => y.giong - x.giong);
  return { loi, canh, cap };
}
function anhTong(K, items, file) {
  const k = 3, o = 24 * k, cot = 3, nhan = 92, cw = nhan + 4 * (o + 4) + 16, rh = o + 6;
  const tuong = [...new Set(items.map((it) => it.code.replace(/_[qwer]$/, '')))];
  const hang = Math.ceil(tuong.length / cot);
  const img = new Anh(cot * cw + 8, hang * rh + 24, [23, 17, 12, 255]);
  chu(img, 6, 6, `ky-nang: ${items.length} icon / ${tuong.length} tuong (q w e r)`, 2, [214, 165, 50, 255]);
  tuong.forEach((t, n) => {
    const x0 = 6 + Math.floor(n / hang) * cw, y0 = 22 + (n % hang) * rh;
    chu(img, x0, y0 + o / 2 - 5, t, 2, [237, 226, 200, 255]);
    'qwer'.split('').forEach((p, i) => { const it = items.find((x) => x.code === `${t}_${p}`); if (it) veKhung(img, K, it.anims[0].frames[0], x0 + nhan + i * (o + 4), y0, k); });
  });
  fs.writeFileSync(file, img.png());
}
function main(argv) {
  const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
  const specF = val('--spec', path.join(ROOT, 'tools/pixel/spec/ky-nang.json')), nguong = +val('--nguong', 0.5);
  const K = loadCore();
  const spec = JSON.parse(fs.readFileSync(specF, 'utf8')).ma;
  const r = K.docSpec(spec);
  if (r.loi.length) { r.loi.forEach((l) => console.error(`${l.ma}: ${l.msg}`)); return 2; }
  const kq = kiem(r.items, spec, nguong);
  const anh = val('--anh');
  if (anh) { anhTong(K, r.items, anh); console.log(`  → ${anh}`); }
  console.log(`kiem-ky-nang: ${r.items.length} icon · cặp giống nhất:`);
  kq.cap.slice(0, +val('--top', 8)).forEach((c) => console.log(`  ${(c.giong * 100).toFixed(0).padStart(3)}% màu · ${(c.dang * 100).toFixed(0).padStart(3)}% dáng  ${c.a} ~ ${c.b}${c.cungT ? ' (cùng tướng)' : ''}`));
  kq.canh.forEach((c) => console.log('  ! gần ngưỡng: ' + c));
  kq.loi.forEach((l) => console.error('  ✗ ' + l));
  console.log(kq.loi.length ? `✗ ${kq.loi.length} lỗi trùng` : '✓ không còn icon trùng');
  return kq.loi.length ? 1 : 0;
}
if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { hinhIcon, soCap, kiem };
