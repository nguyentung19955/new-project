// Xem thử LÀM MƯỢT sprite có sẵn — KHÔNG sửa nguồn, chỉ xuất ảnh so sánh 4 cột cùng cỡ hiển thị (trên nền cỏ):
//   gốc | mức 1 Ve.aa() (sel-out chỗ gấp + hạ tông góc bậc thang) | mức 2 selOut() toàn viền + aa() | mức 3 scale2x() (×2) + selOut() + aa()
//   | mức 4 scale2x ×2 lần (×4) + selOut + aa | mức 5 như mức 4 + aa 3 lượt | mức 6 scale2x ×3 lần (×8)
//   | mức 7 mức 6 thu nhỏ có trung bình rồi phóng mịn — khử răng cưa thật, NGOÀI bảng màu (hết là pixel art)
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
const m6 = goc.scale2x().scale2x().scale2x(); m6.selOut(); m6.aa(); m6.aa();   // ×8, vẫn đúng bảng màu
// ghép ở lưới ×8: mỗi cột cùng cỡ hiển thị
const cot = [phong(goc, 8), phong(m1, 8), phong(m2, 8), phong(m3, 4), phong(m4, 2), phong(m5, 2), m6];
const g = 16, W = cot.reduce((s, c) => s + c.w, 0) + g * (cot.length + 1), H = cot[0].h + g * 2;
const tam = new Ve(W, H, 'la'); let x = g;
for (const c of cot) { tam.put(c, x, g); x += c.w + g; }
const ra = path.join(ROOT, `tools/pixel/mau/ve-lai/aa-thu-${ma}`);
png(tam, ra + '-luoi8.png', 1);
// mức 7 (ngoài bảng màu): mức 6 ×8 thu nhỏ có trung bình (BOX) → mép pha màu thật, rồi ghép thêm cột cuối; xuất ảnh ×1 lưới 8 và bản nhỏ ≈ cỡ trận
const py = `
import sys
from PIL import Image
src = Image.open(sys.argv[1]).convert('RGB'); W, H = src.size; g = 16; cw = ${goc.w * 8}; ch = ${goc.h * 8}
x6 = g + 6 * (cw + g)
m6 = src.crop((x6, g, x6 + cw, g + ch))
m7 = m6.resize((cw // 4, ch // 4), Image.BOX).resize((cw, ch), Image.BICUBIC)
out = Image.new('RGB', (W + cw + g, H), src.getpixel((1, 1))); out.paste(src, (0, 0)); out.paste(m7, (W, g))
out.save(sys.argv[2]); out.resize((out.width * 3 // 8, out.height * 3 // 8), Image.BOX).save(sys.argv[3])
`;
require('child_process').execFileSync('python3', ['-c', py, ra + '-luoi8.png', ra + '-x8.png', ra + '-x3.png']);
require('fs').unlinkSync(ra + '-luoi8.png');
console.log(`${nhom}/${ma}: gốc | mức 1 … mức 7 → ${ra}-x8.png, -x3.png`);
