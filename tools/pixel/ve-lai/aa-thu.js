// Xem thử LÀM MƯỢT sprite có sẵn — KHÔNG sửa nguồn, chỉ xuất ảnh so sánh 4 cột cùng cỡ hiển thị (trên nền cỏ):
//   gốc | mức 1 Ve.aa() (sel-out chỗ gấp + hạ tông góc bậc thang) | mức 2 selOut() toàn viền + aa() | mức 3 scale2x() (×2) + selOut() + aa()
//   | mức 4 scale2x ×2 lần (×4) + selOut + aa | mức 5 như mức 4 + aa 3 lượt
// node tools/pixel/ve-lai/aa-thu.js <nhóm> <mã> [động tác]  → tools/pixel/mau/ve-lai/aa-thu-<mã>-x8.png, -x3.png
const path = require('path');
const { sprite, png, ROOT, Ve, phong } = require('./ve');
const [nhom, ma, dt = nhom === 'tuong' ? 'idle' : 'walk'] = process.argv.slice(2);
const goc = sprite(nhom, ma, dt, 0);
const m1 = goc.clone(); m1.aa();
const m2 = goc.clone(); m2.selOut(); m2.aa();
const m3 = goc.scale2x(); m3.selOut(); m3.aa();
const m4 = goc.scale2x().scale2x(); m4.selOut(); m4.aa();                       // ×4: bậc chéo thành cung tròn
const m5 = goc.scale2x().scale2x(); m5.aa(); m5.selOut(); m5.aa(); m5.aa();      // ×4 + làm mượt 3 lượt, viền tan hẳn vào hình
const cot = [phong(goc, 4), phong(m1, 4), phong(m2, 4), phong(m3, 2), m4, m5];   // cùng lưới ×4 để ghép chung một ảnh
const g = 8, W = cot.reduce((s, c) => s + c.w, 0) + g * (cot.length + 1), H = cot[0].h + g * 2;
const tam = new Ve(W, H, 'la'); let x = g;
for (const c of cot) { tam.put(c, x, g); x += c.w + g; }
const ra = path.join(ROOT, `tools/pixel/mau/ve-lai/aa-thu-${ma}`);
png(tam, ra + '-x8.png', 2); png(tam, ra + '-x3.png', 1);   // lưới ×4 → hiển thị ×8 / ×4
console.log(`${nhom}/${ma}: gốc | mức 1 | mức 2 | mức 3 | mức 4 | mức 5 → ${ra}-x8.png, -x3.png`);
