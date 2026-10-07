// Sinh danh sách ảnh (tên file → cách cắt) cho tool cắt ảnh trên máy người dùng và nhúng vào
// tools/cat-anh.html + tools/cat_anh.py (giữa dòng DANH-SACH … HET-DANH-SACH).
// Chạy lại sau khi thêm tướng / quái / hiệu ứng mới: node tools/build-cat-anh.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..');
const ctx = { console, window: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, Image: function () {}, localStorage: { getItem() {}, setItem() {} }, navigator: {} };
vm.createContext(ctx);
for (const f of ['art', 'data', 'enemies2']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8').replace(/^(const|let) /gm, 'var '), ctx);
const { HEROES, ENEMIES } = ctx;

// mục: tên file (không đuôi, chữ thường) → [kiểu, mã hoặc danh sách tên ra, tên hiển thị]
const D = {};
for (const [k, h] of Object.entries(HEROES)) {
  D[k] = ['hero12', k, h.name];
  D['icon-' + k] = ['icon4', k, 'Icon kỹ năng · ' + h.name];
  D['than-khi-' + k] = ['tk3', k, 'Thần Khí · ' + h.name];
}
for (const [k, e] of Object.entries(ENEMIES)) D[k] = [e.boss ? 'boss9' : 'enemy6', k, (e.boss ? 'Boss · ' : 'Quái · ') + e.name];

// hiệu ứng: đọc lệnh "cat-fx.py hat|dai|don <ảnh> <tên>…" trong các file prompt
const label = {};
for (const f of ['PROMPT-CAN-GEN.txt', 'PROMPT-HIEU-UNG.txt']) {
  const p = path.join(ROOT, 'docs', f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/^#\d+ · ([^\n]*?) · ảnh [^\n]*lưu tên: ([\w.-]+)\.png/gm)) label[m[2]] = m[1];
  for (const m of src.matchAll(/cat-fx\.py (hat|dai|don) ([\w.-]+)\.png ([^\n`|]+)/g)) {
    const mau = /--mau/.test(m[3]);
    const names = m[3].replace('--mau', '').trim().split(/\s+/);
    const stem = m[2].toLowerCase();
    if (m[1] === 'hat') D[stem] = [mau ? 'hatmau' : 'hat', names, label[m[2]] || 'Hạt hiệu ứng · ' + names.join(', ')];
    else D[stem] = [m[1], names[0], label[m[2]] || 'Hiệu ứng · ' + names[0]];
  }
}
// ảnh đã xem tay (tên mã băm, tên tự đặt): tools/cat-anh-them.json
for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, 'cat-anh-them.json'), 'utf8')))) if (!k.startsWith('_')) D[k] = v;
const json = JSON.stringify(Object.fromEntries(Object.entries(D).sort()));
const put = (file, a, b) => {
  const p = path.join(ROOT, 'tools', file);
  const src = fs.readFileSync(p, 'utf8');
  const re = new RegExp(`(${a}[^\\n]*\\n)[\\s\\S]*?(\\n[^\\n]*HET-DANH-SACH)`);
  if (!re.test(src)) throw new Error('thiếu dòng DANH-SACH trong ' + file);
  fs.writeFileSync(p, src.replace(re, (_, x, y) => x + b + y));
};
put('cat-anh.html', '// DANH-SACH', 'const DANH_SACH = ' + json + ';');
put('cat_anh.py', '# DANH-SACH', 'DANH_SACH = json.loads(r"""' + json + '""")');
console.log('Danh sách:', Object.keys(D).length, 'mục');
