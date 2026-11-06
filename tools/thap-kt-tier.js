// TURRET MERGE — KIỂM HỒI QUY BẬC: trung vị sức mạnh 4★ (LV đầu) phải tăng Trắng < Xanh < Tím < Vàng < Đỏ
//   node tools/thap-kt-tier.js        (≈ 3–5 phút, tất định: cùng code → cùng số)
// Đo bằng tools/thap-sim-tier.js chế độ nhanh. Lỗi (exit 1) khi trung vị của bậc thấp VƯỢT trung vị bậc cao hơn.
// Cảnh báo (không lỗi): bước < +15% giữa 2 bậc liền nhau; Đỏ < Vàng ×1.2.
'use strict';
const { doTatCa, kiem, TIER, TEN } = require('./thap-sim-tier.js');
const d = doTatCa(true), k = kiem(d);
let s = '';
TIER.forEach((t, i) => { s += (i ? ' < ' : '') + TEN[t] + ' ' + k.t[t].p4.toFixed(2); });
const canh = [];
for (let i = 1; i < TIER.length; i++) { const a = k.t[TIER[i - 1]].p4, b = k.t[TIER[i]].p4; if (b < a * 1.15 && b >= a) canh.push(TEN[TIER[i]] + ' only +' + Math.round((b / a - 1) * 100) + '% over ' + TEN[TIER[i - 1]]); }
if (k.loi.length) { for (const l of k.loi) console.log('  ✗ tier order: ' + l); console.log('  medians 4★: ' + s); process.exitCode = 1; }
else console.log('  ✓ tier medians 4★: ' + s + (canh.length ? ' (warn: ' + canh.join('; ') + ')' : ''));
