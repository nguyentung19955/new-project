// TURRET MERGE — KIỂM HỒI QUY "SỨC MẠNH THEO BẬC" (trong tools/thap-kt-hoiquy.js)
//   node tools/thap-kt-tier.js        → đo nhanh mọi ụ (tools/thap-sim-tier.js, NHANH: không bot bộ bài) ở 4★, cấp thẻ đầu
// TRƯỢT (thoát 1) nếu: trung vị bậc thấp > trung vị bậc cao ở 4★ — xét TỪNG VAI TRÒ (Tấn công / Hỗ trợ) và CẢ BẬC (mọi vai),
//   hoặc ụ Tấn công trắng/xanh/tím vượt trung vị Tấn công vàng, hoặc ụ Tấn công vàng vượt trung vị Tấn công đỏ.
// Ụ Đặc biệt chỉ đo đúng bằng bot bộ bài (chậm) → không vào phép kiểm nhanh; xem docs/demo-hop-tuong/tuvan/tier/BANG.md.
// Bỏ qua (phòng thủ / thao tác tay — sim không đo được): KHONG_DO.
'use strict';
const S = require('./thap-sim-tier.js');
const KHONG_DO = S.KHONG_DO;
const kq = S.doHet({ nhanh: true });
const ds = Object.values(kq).filter(r => r && r.id && !KHONG_DO.has(r.id));
const m = (f) => S.med(ds.filter(f).map(r => r.P[4]));
let loi = 0;
const dong = [];
for (const [ten, loc] of [['Attack', (r) => r.vai === 'tc'], ['Support', (r) => r.vai === 'ht'], ['All (no specials)', (r) => r.vai !== 'db']]) {
  const md = S.TIER.map(b => m(r => r.bac === b && loc(r)));
  dong.push(ten.padEnd(18) + S.TIER.map((b, i) => S.TEN[b] + ' ' + md[i].toFixed(2)).join(' · '));
  for (let i = 1; i < md.length; i++) if (md[i] < md[i - 1]) { loi++; dong.push('  ✗ ' + ten + ': ' + S.TEN[S.TIER[i - 1]] + ' median ' + md[i - 1].toFixed(2) + ' > ' + S.TEN[S.TIER[i]] + ' median ' + md[i].toFixed(2)); }
}
const tc = (b) => m(r => r.vai === 'tc' && r.bac === b);
const vang = tc('vang'), doo = tc('do');
for (const r of ds) if (r.vai === 'tc') {
  if (['trang', 'xanh', 'tim'].includes(r.bac) && r.P[4] > vang) { loi++; dong.push('  ✗ ' + r.ten + ' (' + S.TEN[r.bac] + ') 4★ ' + r.P[4].toFixed(2) + ' > Gold attack median ' + vang.toFixed(2)); }
  if (r.bac === 'vang' && r.P[4] > doo) { loi++; dong.push('  ✗ ' + r.ten + ' (Gold) 4★ ' + r.P[4].toFixed(2) + ' > Red attack median ' + doo.toFixed(2)); }
}
console.log(dong.join('\n'));
console.log(loi ? '✗ tier: ' + loi + ' lỗi' : '✓ tier: trung vị 4★ tăng dần trắng < xanh < tím < vàng < đỏ');
process.exitCode = loi ? 1 : 0;
