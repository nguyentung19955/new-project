#!/usr/bin/env node
'use strict';
// Sinh tools/pixel/thu-vien.js — THƯ VIỆN MẪU VẼ TAY cho tool vẽ pixel (tools/ve-pixel.html, tools/ve-pixel.js):
// gom nguồn tools/pixel/src/<nhóm>/<mã>.txt (bộ phận "part" + công thức khung "frame") từ thư mục làm việc và các nhánh pixel
// CHƯA GỘP (đọc bằng git show, không merge). Mã có ở nhiều nơi: thư mục làm việc trước, rồi nhánh theo thứ tự NHANH.
//   node tools/build-thu-vien.js              (--out <file> để ghi chỗ khác — dùng trong test; --khong-nhanh: chỉ thư mục làm việc)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const NHANH = ['pixel-tuong-thuong', 'pixel-nen-tang', 'pixel-tuong-tim', 'pixel-tuong-vang', 'pixel-quai-boss', 'vfx-pixel-2', 'pixel-ky-nang-2', 'pixel-anphu-thankhi'];
const OK_FILE = /^tools\/pixel\/src\/([a-z-]+)\/([a-z0-9]+(?:[-_][a-z0-9]+)*)\.txt$/;
// bỏ dòng chú thích dài giữa bài (giữ 4 dòng đầu: đặc trưng + nguồn) cho gọn
const gon = (t) => { let n = 0; return t.split(/\r?\n/).filter((l) => (/^\s*#/.test(l) ? n++ < 4 && !/^\s+#/.test(l) : true)).map((l) => l.replace(/\s+#.*$/, '').trimEnd()).join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'; };

function run(out, opt = {}) {
  const tv = {};
  const add = (rel, text, nguon) => {
    const m = rel.match(OK_FILE); if (!m || tv[m[1] + '/' + m[2]]) return;
    if (!/^size:/m.test(text) || !/^frame /m.test(text)) return;
    tv[m[1] + '/' + m[2]] = { nguon, src: gon(text) };
  };
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else add(path.relative(ROOT, p).split(path.sep).join('/'), fs.readFileSync(p, 'utf8'), 'nhánh chính'); } };
  walk(path.join(ROOT, 'tools/pixel/src'));
  const thieu = [];
  if (!opt.khongNhanh) for (const b of NHANH) {
    const ref = `origin/claude/${b}`;
    let files;
    try { files = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', 'tools/pixel/src'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean); }
    catch (e) { thieu.push(b); continue; }
    for (const f of files) if (OK_FILE.test(f) && !tv[f.replace(OK_FILE, '$1/$2')]) add(f, execFileSync('git', ['show', `${ref}:${f}`], { cwd: ROOT, encoding: 'utf8' }), 'claude/' + b);
  }
  const keys = Object.keys(tv).sort();
  const js = '// SINH TỰ ĐỘNG bởi tools/build-thu-vien.js — đừng sửa tay. Thư viện mẫu vẽ tay cho tools/ve-pixel.html / tools/ve-pixel.js.\n'
    + '(function (g) { g.VE_PIXEL_TV = {\n' + keys.map((k) => `${JSON.stringify(k)}: ${JSON.stringify(tv[k])},`).join('\n') + '\n}; })(typeof window !== \'undefined\' ? window : globalThis);\n';
  fs.writeFileSync(out, js);
  return { n: keys.length, thieu, bytes: js.length, nhom: keys.reduce((o, k) => { const g = k.split('/')[0]; o[g] = (o[g] || 0) + 1; return o; }, {}) };
}
if (require.main === module) {
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'tools/pixel/thu-vien.js');
  const r = run(out, { khongNhanh: process.argv.includes('--khong-nhanh') });
  console.log(`build-thu-vien: ${r.n} mẫu (${Object.entries(r.nhom).map(([g, n]) => g + ' ' + n).join(', ')}) · ${(r.bytes / 1024).toFixed(0)} KB → ${path.relative(process.cwd(), out)}`);
  if (r.thieu.length) console.log(`  ! không đọc được nhánh: ${r.thieu.join(', ')} (chưa git fetch?)`);
}
module.exports = { run, NHANH };
