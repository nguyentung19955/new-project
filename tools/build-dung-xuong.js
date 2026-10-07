// Nhúng phần lõi CHUNG của tools/cat-anh.html (tách nền hồng tím, nhận mã theo tên file, thu nhỏ LANCZOS,
// ghi PNG bảng màu, đóng zip) + loại vũ khí từng tướng (tools/hero-id.js) vào tools/dung-xuong.html,
// giữa dòng "// CHUNG-CAT-ANH" … "// HET-CHUNG-CAT-ANH". Chạy lại khi sửa cat-anh.html / hero-id.js:
//   node tools/build-dung-xuong.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'tools', 'cat-anh.html'), 'utf8');
const a = src.indexOf('// DANH-SACH'), b = src.indexOf('// ═════════════ giao diện');
if (a < 0 || b < 0) throw new Error('không tìm thấy đoạn lõi trong cat-anh.html');
const { HERO_ID } = require('./hero-id.js');

// kiểu đánh theo vũ khí: vung (kiếm/rìu/giáo/búa…) · cung (cung/ná) · no (nỏ/ống thổi) · phep (gậy/quạt/ngọc…) · tay (tay không / ném)
function kieu(w) {
  w = (w || '').toLowerCase();
  if (/crossbow|blowgun/.test(w)) return 'no';
  if (/bow|slingshot/.test(w)) return 'cung';
  if (/^none|claw|paw|fang|horn|hoove|throw|coconut|melon|boulder|body slam/.test(w)) return 'tay';
  if (/sword|axe|spear|glaive|knife|knives|machete|hammer|mallet|oar|hoe|shovel|pole|fish spear|tongs|bamboo(?! flute| staff)|club/.test(w)) return 'vung';
  return 'phep';
}
const VU_KHI = {};
for (const [k, v] of Object.entries(HERO_ID)) VU_KHI[k] = kieu(v.weapon);

const dst = path.join(ROOT, 'tools', 'dung-xuong.html');
let html = fs.readFileSync(dst, 'utf8');
const re = /(\/\/ CHUNG-CAT-ANH[^\n]*\n)[\s\S]*?(\/\/ HET-CHUNG-CAT-ANH)/;
if (!re.test(html)) throw new Error('thiếu dòng CHUNG-CAT-ANH trong dung-xuong.html');
const body = src.slice(a, b).trimEnd() + '\nconst VU_KHI = ' + JSON.stringify(VU_KHI) + ';';
html = html.replace(re, (_, x, y) => x + body + '\n' + y);
fs.writeFileSync(dst, html);
console.log('đã nhúng lõi cat-anh.html (' + body.split('\n').length + ' dòng) + ' + Object.keys(VU_KHI).length + ' loại vũ khí vào tools/dung-xuong.html');
