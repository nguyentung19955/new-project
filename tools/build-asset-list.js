// v189: sinh js/asset-list.js — danh sách ảnh CÓ THẬT trong assets/ (trừ assets/chua-dung/).
// Game chỉ tải ảnh có trong danh sách: ảnh tuỳ chọn chưa vẽ (ui/khung-bang.png, ic-*.png…) không còn gửi request rồi chờ 404
// (trước đây ~40 request 404 mỗi lần mở game). Thêm / xoá / đổi tên ảnh trong assets/ thì chạy lại:
//   node tools/build-asset-list.js
// (build-web.js tự chạy; test tests/sua-loi-tester kiểm tra danh sách khớp thư mục.)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), dir = path.join(root, 'assets');
const IMG = /\.(png|jpe?g|webp|gif|svg)$/i;
function walk(d, pre, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const rel = pre + e.name;
    if (e.isDirectory()) { if (rel !== 'chua-dung') walk(path.join(d, e.name), rel + '/', out); } else if (IMG.test(e.name)) out.push(rel);
  }
  return out;
}
function list() { return walk(dir, '', []); }
function render(files) {
  return '// SINH TỰ ĐỘNG bởi tools/build-asset-list.js — đừng sửa tay. Thêm / xoá ảnh trong assets/ thì chạy: node tools/build-asset-list.js\n'
    + '// Danh sách ảnh có thật trong assets/: game chỉ tải ảnh có tên ở đây (không gửi request mò rồi chờ 404).\n'
    + 'window.ASSET_LIST = [\n' + files.map((f) => JSON.stringify(f) + ',').join('\n') + '\n];\n';
}
module.exports = { list, render, out: path.join(root, 'js', 'asset-list.js') };
if (require.main === module) {
  const files = list();
  fs.writeFileSync(module.exports.out, render(files));
  console.log(`js/asset-list.js: ${files.length} ảnh`);
}
