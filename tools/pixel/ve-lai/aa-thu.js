// Xem thử KHỬ RĂNG CƯA CÓ CHỌN LỌC (Ve.aa: sel-out chỗ gấp khúc viền ngoài + hạ tông góc lồi bậc thang) trên sprite có sẵn —
// KHÔNG sửa nguồn: chỉ xuất ảnh so sánh trước | sau (phóng ×8 và ×3 cỡ trong trận, trên nền cỏ) để duyệt.
// node tools/pixel/ve-lai/aa-thu.js <nhóm> <mã> [ra.png] [động tác]
const path = require('path');
const { sprite, png, ROOT, Ve } = require('./ve');
const [nhom, ma, ra = path.join(ROOT, `tools/pixel/mau/ve-lai/aa-thu-${process.argv[3]}.png`), dt = nhom === 'tuong' ? 'idle' : 'walk'] = process.argv.slice(2);
const a = sprite(nhom, ma, dt, 0), b = a.clone(), n = b.aa();
// ghép: [trước ×8][sau ×8] / [trước ×3][sau ×3] trên nền cỏ (màu la), cách 2 điểm
const g = 2, W = a.w * 2 + g * 3, H = a.h + g * 2;
const tam = new Ve(W, H, 'la');
tam.put(a, g, g); tam.put(b, a.w + g * 2, g);
png(tam, ra.replace(/\.png$/, '-x8.png'), 8);
png(tam, ra.replace(/\.png$/, '-x3.png'), 3);
console.log(`${nhom}/${ma}: đổi ${n} điểm → ${ra.replace(/\.png$/, '-x8.png')}, -x3.png`);
