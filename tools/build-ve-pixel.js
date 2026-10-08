#!/usr/bin/env node
'use strict';
// Sinh tools/ve-pixel-ds.js cho tool vẽ pixel (tools/ve-pixel.html): danh sách mã cần vẽ (docs/pixel/DANH-SACH.md),
// mã đã có pixel (js/pixel/<nhóm>.js) và bảng màu chung (tools/pixel/palette.txt). Chạy lại khi DANH-SACH / palette đổi:
//   node tools/build-ve-pixel.js            (--out <file> để ghi chỗ khác — dùng trong test)
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const bp = require('./build-pixel.js');

function parseDanhSach(md) {
  const out = new Map();
  let head = null;
  for (const line of md.split('\n')) {
    if (!line.startsWith('|')) { head = null; continue; }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (/^-+$/.test(cells[0].replace(/[:\s]/g, ''))) continue;
    const codes = [...cells[0].matchAll(/`([a-z-]+)\/([a-z0-9_-]+)`/g)];
    if (!codes.length) { head = cells.map((c) => c.toLowerCase()); continue; }
    if (!head) continue;
    const col = (re) => { const i = head.findIndex((h) => re.test(h)); return i >= 0 ? cells[i] || '' : ''; };
    const size = (cells.find((c) => /^\d+×\d+/.test(c)) || '').match(/^(\d+)×(\d+)/);
    let mo = col(/dấu hiệu 32/) || col(/vật vẽ/) || col(/^mô tả/) || col(/đặc trưng/) || col(/^dấu hiệu/) || col(/ghi chú/);
    const all = cells.join(' ');
    const hanh = (all.match(/hành (Kim|Mộc|Thủy|Hỏa|Thổ)/) || all.match(/\b(Kim|Mộc|Thủy|Hỏa|Thổ) #[0-9A-F]{6}/i) || [])[1] || '';
    mo = mo.replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ');
    if (mo.length > 220) mo = mo.slice(0, 217) + '…';
    const ten = cells[1].replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').slice(0, 80);
    for (const m of codes) {
      const k = m[1] + '/' + m[2];
      if (m[1] === 'vfx' || !(m[1] in bp.GROUP_SIZES) || out.has(k)) continue;
      out.set(k, { k, ten, co: size ? `${size[1]}x${size[2]}` : '', mo, hanh });
    }
  }
  return out;
}

function run(outFile) {
  const ds = parseDanhSach(fs.readFileSync(path.join(ROOT, 'docs/pixel/DANH-SACH.md'), 'utf8'));
  // mã đã có pixel trong game
  const co = new Set();
  for (const g of Object.keys(bp.GROUP_SIZES)) {
    const f = path.join(ROOT, 'js/pixel', g + '.js');
    if (!fs.existsSync(f)) continue;
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/^"([a-z-]+\/[a-z0-9_-]+)": \{"name":"([^"]*)"/gm)) {
      co.add(m[1]);
      if (!ds.has(m[1]) && !m[1].startsWith('vfx/')) ds.set(m[1], { k: m[1], ten: m[2], co: '', mo: '', hanh: '' });
    }
  }
  const list = [...ds.values()].map((d) => (co.has(d.k) ? { ...d, daCo: 1 } : d)).sort((a, b) => a.k.localeCompare(b.k));
  const pal = bp.loadPalette(path.join(ROOT, 'tools/pixel/palette.txt'));
  const palette = Object.entries(pal).map(([name, p]) => [name, p.hex || ('#' + p.rgb.map((v) => v.toString(16).padStart(2, '0')).join('')).toUpperCase(), p.edge ? 1 : 0]);
  const sizes = {}, req = {};
  for (const [g, s] of Object.entries(bp.GROUP_SIZES)) if (g !== 'vfx') sizes[g] = s;
  for (const [g, r] of Object.entries(bp.REQUIRED)) req[g] = r;
  const js = '// SINH TỰ ĐỘNG bởi tools/build-ve-pixel.js — đừng sửa tay. Dữ liệu cho tools/ve-pixel.html.\n'
    + `window.VE_PIXEL_DS = ${JSON.stringify({ palette, sizes, req, ma: list })};\n`;
  fs.writeFileSync(outFile, js.replace(/\},\{"k"/g, '},\n{"k"'));
  return list.length;
}

if (require.main === module) {
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(__dirname, 've-pixel-ds.js');
  const n = run(out);
  console.log(`build-ve-pixel: ${n} mã → ${path.relative(process.cwd(), out)}`);
}
module.exports = { run, parseDanhSach };
