// Xem thử LÀM MƯỢT sprite có sẵn — KHÔNG sửa nguồn, chỉ xuất ảnh so sánh 4 cột cùng cỡ hiển thị (trên nền cỏ):
//   gốc | mức 1 Ve.aa() (sel-out chỗ gấp + hạ tông góc bậc thang) | mức 2 selOut() toàn viền + aa() | mức 3 scale2x() (×2 độ phân giải) + selOut() + aa()
// node tools/pixel/ve-lai/aa-thu.js <nhóm> <mã> [động tác]  → tools/pixel/mau/ve-lai/aa-thu-<mã>-x8.png, -x3.png
const path = require('path');
const { sprite, png, ROOT, Ve, phong } = require('./ve');
const [nhom, ma, dt = nhom === 'tuong' ? 'idle' : 'walk'] = process.argv.slice(2);
const goc = sprite(nhom, ma, dt, 0);
const m1 = goc.clone(); m1.aa();
const m2 = goc.clone(); m2.selOut(); m2.aa();
const m3 = goc.scale2x(); m3.selOut(); m3.aa();
const cot = [phong(goc, 2), phong(m1, 2), phong(m2, 2), m3];   // cùng ở lưới ×2 để ghép chung một ảnh
const g = 4, W = cot.reduce((s, c) => s + c.w, 0) + g * (cot.length + 1), H = cot[0].h + g * 2;
const tam = new Ve(W, H, 'la'); let x = g;
for (const c of cot) { tam.put(c, x, g); x += c.w + g; }
const ra = path.join(ROOT, `tools/pixel/mau/ve-lai/aa-thu-${ma}`);
png(tam, ra + '-x8.png', 4); png(tam, ra + '-x3.png', 1);   // lưới ×2 → hiển thị ×8 / ×2 (≈ cỡ trong trận)
console.log(`${nhom}/${ma}: gốc | mức 1 | mức 2 | mức 3 → ${ra}-x8.png, -x3.png`);
