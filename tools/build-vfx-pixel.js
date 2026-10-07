#!/usr/bin/env node
'use strict';
// Dựng sprite HIỆU ỨNG PIXEL (nhóm vfx, nhánh claude/vfx-kenney) từ lưới ký tự tools/pixel/src/vfx/*.txt
// → js/vfx-pixel-data.js (game dựng canvas lúc chạy, không cần file PNG, không phải tải ảnh).
// Định dạng file nguồn giống docs/pixel/QUY-CHUAN.md mục 9 (name / size / anchor / colors / part … end /
// anim <tên> fps=N loop|once / frame <tên> … end với lệnh use, shift, set, swap, flipx, flipy, outline).
// Màu: CHỈ tên trong bảng màu chung tools/pixel/palette.txt (chưa có file thì dùng bản sao PALETTE bên dưới, cùng tên + mã)
// + màu riêng của nhóm tools/pixel/src/vfx/palette.txt (nếu có). Thư mục có file KHONG-BUILD để tools/build-pixel.js bỏ qua.
//
//   node tools/build-vfx-pixel.js             dựng → js/vfx-pixel-data.js
//   node tools/build-vfx-pixel.js --check     chỉ kiểm tra (mã thoát 1 nếu lỗi)
//   node tools/build-vfx-pixel.js --xem DIR   thêm ảnh xem trước phóng ×8 (nền ô cờ) vào DIR (cần python3 + Pillow)
//   --src DIR / --out FILE                    thư mục nguồn / file ra khác (test)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

// bản sao bảng màu chung (claude/pixel-nen-tang, tools/pixel/palette.txt) — dùng khi file đó chưa có trên nhánh
const PALETTE = `vien #1A1008 *|toi #3A2A1E *|sat-toi #3C3F48 *|sat #5E6470|sat-sang #9AA1AC|bac #D4D8DE|trang-xam #CFC6B2|trang #F4EFE2|sang #FFFBE8|
da-toi #B9714A|da #E0A273|da-sang #F6CFA0|dat-toi #4A2E1A *|dat #7A4E2C|dat-sang #A8743E|cat #D9B97A|dong-toi #6A4318 *|dong #A86A26|dong-sang #D99A3E|
vang-nghe #F2C230|vang-sang #FFE7A0|son-toi #6E1A14 *|son #B23A1E|son-sang #E0583A|hong #F29A8A|lua #F07A1E|lua-sang #FFB347|la-toi #1F4A22 *|la #3E7A2E|
la-ma #7FBF3F|la-sang #C2E27A|reu #6F8A3C|reu-sang #9DB45A|cham-toi #1A2448 *|cham #2B4C7E|cham-sang #4F7DB8|nuoc #3E8FC4|nuoc-sang #8FD3EE|troi #CDEFF8|
tim-toi #3E2058 *|tim #7A4AA8|tim-sang #B58AE0|ngoc #2FA59A|ngoc-sang #7FE0D0`;

function readPalette(srcDir) {
  const pal = new Map();
  const add = (name, hex) => { if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`màu sai: ${name} ${hex}`); pal.set(name, hex.toUpperCase()); };
  const common = path.join(ROOT, 'tools/pixel/palette.txt');
  if (fs.existsSync(common)) {
    for (const l of fs.readFileSync(common, 'utf8').split('\n')) { const m = /^\s*([a-z0-9-]+)\s+(#[0-9a-fA-F]{6})/.exec(l); if (m) add(m[1], m[2]); }
  } else PALETTE.split(/[|\n]/).map((s) => s.trim()).filter(Boolean).forEach((s) => { const [n, h] = s.split(/\s+/); add(n, h); });
  const own = path.join(srcDir, 'palette.txt');
  if (fs.existsSync(own)) for (const l of fs.readFileSync(own, 'utf8').split('\n')) {
    const m = /^\s*([a-z0-9-]+)\s+(#[0-9a-fA-F]{6})/.exec(l);
    if (m) { if (pal.has(m[1]) && pal.get(m[1]) !== m[2].toUpperCase()) throw new Error(`palette.txt nhóm vfx: "${m[1]}" trùng tên bảng chung nhưng khác mã`); add(m[1], m[2]); }
  }
  return pal;
}

// ---- đọc một file nguồn
function parse(file, pal) {
  const name = path.basename(file, '.txt');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new Error(`${name}: tên file phải viết thường không dấu, nối bằng "-"`);
  const lines = fs.readFileSync(file, 'utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  const S = { name, title: name, w: 0, h: 0, ax: null, ay: null, colors: new Map(), parts: new Map(), anims: [], frames: new Map() };
  const strip = (l) => l.replace(/(^|\s)#.*$/, '').replace(/\s+$/, '');
  let i = 0;
  const err = (msg) => { throw new Error(`${name}.txt dòng ${i + 1}: ${msg}`); };
  while (i < lines.length) {
    const raw = lines[i], l = strip(raw);
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^name:\s*(.+)$/.exec(l))) S.title = m[1].trim();
    else if ((m = /^size:\s*(\d+)x(\d+)$/.exec(l))) { S.w = +m[1]; S.h = +m[2]; }
    else if ((m = /^anchor:\s*(\d+),\s*(\d+)$/.exec(l))) { S.ax = +m[1]; S.ay = +m[2]; }
    else if (/^colors:$/.test(l)) {
      i++;
      while (i < lines.length && (m = /^\s+(\S)\s*=\s*([a-z0-9-]+)\s*$/.exec(strip(lines[i])))) {
        if ('._'.includes(m[1])) err(`ký tự "${m[1]}" dành riêng`);
        if (!pal.has(m[2])) err(`màu "${m[2]}" không có trong bảng màu`);
        S.colors.set(m[1], m[2]); i++;
      }
      continue;
    } else if ((m = /^part\s+([\w-]+)$/.exec(l))) {
      const rows = []; i++;
      while (i < lines.length && strip(lines[i]).trim() !== 'end') { const r = strip(lines[i]).trim(); if (r) rows.push(r); i++; }
      if (i >= lines.length) err('part thiếu end');
      if (!rows.length || rows.some((r) => r.length !== rows[0].length)) err(`part ${m[1]}: các dòng lưới phải dài bằng nhau`);
      for (const r of rows) for (const c of r) if (!'._'.includes(c) && !S.colors.has(c)) err(`part ${m[1]}: ký tự "${c}" chưa khai báo màu`);
      S.parts.set(m[1], rows);
    } else if ((m = /^anim\s+([\w-]+)((?:\s+\S+)*)$/.exec(l))) {
      const fps = +((/fps=(\d+(?:\.\d+)?)/.exec(m[2]) || [])[1] || 8);
      S.anims.push({ name: m[1], fps, loop: !/\bonce\b/.test(m[2]) });
    } else if ((m = /^frame\s+([\w-]+)$/.exec(l))) {
      const cmds = []; i++;
      while (i < lines.length && strip(lines[i]).trim() !== 'end') { const c = strip(lines[i]).trim(); if (c) cmds.push([c, i]); i++; }
      if (i >= lines.length) err('frame thiếu end');
      if (!S.frames.has(m[1])) S.frames.set(m[1], []);
      S.frames.get(m[1]).push(cmds);
    } else err(`không hiểu: ${raw.trim()}`);
    i++;
  }
  if (!(S.w >= 4 && S.h >= 2 && S.w <= 32 && S.h <= 32)) throw new Error(`${name}.txt: size phải trong 4..32 (đang ${S.w}x${S.h})`);
  if (!S.anims.length) throw new Error(`${name}.txt: thiếu anim`);
  // ---- dựng khung
  const built = new Map();
  const blank = () => Array.from({ length: S.h }, () => Array(S.w).fill('.'));
  for (const a of S.anims) {
    const list = S.frames.get(a.name) || [];
    if (list.length < 1 || list.length > 8) throw new Error(`${name}.txt: anim ${a.name} cần 1..8 frame (đang ${list.length})`);
    built.set(a.name, []);
    for (const cmds of list) {
      let g = blank();
      for (const [c, li] of cmds) {
        i = li;
        const p = c.split(/\s+/);
        if (p[0] === 'use') {
          let src;
          if (p[1].startsWith('@')) {
            const [an, k] = p[1].slice(1).split('.');
            const f = built.get(an) && built.get(an)[+k];
            if (!f) err(`chưa có khung ${p[1]}`);
            src = f.map((r) => r.join(''));
          } else { src = S.parts.get(p[1]); if (!src) err(`không có part ${p[1]}`); }
          const x0 = +(p[2] || 0), y0 = +(p[3] || 0);
          // chỉ điểm ảnh có màu mới không được tràn khung (lề trong suốt của part tràn ra thì bỏ qua)
          src.forEach((r, y) => [...r].forEach((ch, x) => {
            if (ch === '.') return;
            const X = x0 + x, Y = y0 + y;
            if (X < 0 || Y < 0 || X >= S.w || Y >= S.h) { if (ch !== '_') err(`use ${p[1]} tràn khung`); return; }
            g[Y][X] = ch === '_' ? '.' : ch;
          }));
        } else if (p[0] === 'shift') {
          const dx = +p[1], dy = +p[2], n = blank();
          g.forEach((r, y) => r.forEach((ch, x) => {
            if (ch === '.') return;
            const X = x + dx, Y = y + dy;
            if (X < 0 || Y < 0 || X >= S.w || Y >= S.h) err('shift làm điểm ảnh rơi ra ngoài khung');
            n[Y][X] = ch;
          }));
          g = n;
        } else if (p[0] === 'set') {
          const x = +p[1], y = +p[2];
          if (!(x >= 0 && y >= 0 && x < S.w && y < S.h)) err('set ngoài khung');
          if (!'._'.includes(p[3]) && !S.colors.has(p[3])) err(`ký tự "${p[3]}" chưa khai báo màu`);
          g[y][x] = p[3] === '_' ? '.' : p[3];
        } else if (p[0] === 'swap') {
          if (!S.colors.has(p[2])) err(`ký tự "${p[2]}" chưa khai báo màu`);
          g = g.map((r) => r.map((ch) => (ch === p[1] ? p[2] : ch)));
        } else if (p[0] === 'flipx') g = g.map((r) => r.slice().reverse());
        else if (p[0] === 'flipy') g = g.slice().reverse();
        else if (p[0] === 'outline') {
          const oc = p[1] || [...S.colors].find(([, v]) => v === 'vien')?.[0];
          if (!oc || !S.colors.has(oc)) err('outline: cần ký tự màu viền (khai báo k = vien hoặc outline <ký tự>)');
          const n = g.map((r) => r.slice());
          g.forEach((r, y) => r.forEach((ch, x) => {
            if (ch !== '.') return;
            if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b] && g[y + b][x + a] && g[y + b][x + a] !== '.')) n[y][x] = oc;
          }));
          g = n;
        } else err(`lệnh lạ: ${p[0]}`);
      }
      if (g.every((r) => r.every((ch) => ch === '.'))) throw new Error(`${name}.txt: anim ${a.name} có khung trống`);
      built.get(a.name).push(g);
    }
  }
  return { S, built };
}

// mã hoá: mỗi khung = chuỗi w*h ký tự, '.' trong suốt, còn lại là chỉ số bảng màu (A..Z a..z 0..9 …)
const CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function build(srcDir, pal) {
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.txt') && f !== 'palette.txt').sort();
  const used = [], idx = new Map();
  const out = {};
  for (const f of files) {
    const { S, built } = parse(path.join(srcDir, f), pal);
    const anims = {}, frames = [];
    for (const a of S.anims) {
      anims[a.name] = { start: frames.length, n: built.get(a.name).length, fps: a.fps, loop: a.loop };
      for (const g of built.get(a.name)) frames.push(g.map((r) => r.map((ch) => {
        if (ch === '.') return '.';
        const cname = S.colors.get(ch);
        if (!idx.has(cname)) { idx.set(cname, used.length); used.push(cname); }
        return CODE[idx.get(cname)];
      }).join('')).join(''));
    }
    out[S.name] = { w: S.w, h: S.h, ax: S.ax ?? Math.floor(S.w / 2), ay: S.ay ?? Math.floor(S.h / 2), anims, f: frames, title: S.title };
  }
  if (used.length > CODE.length) throw new Error('quá nhiều màu');
  return { pal: used.map((n) => pal.get(n)), names: used, all: Object.fromEntries(pal), spr: out };
}

function render(data) {
  const lines = Object.entries(data.spr).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  return '// SINH TỰ ĐỘNG bởi tools/build-vfx-pixel.js từ tools/pixel/src/vfx/*.txt — đừng sửa tay (xung đột khi gộp: chạy lại tool).\n'
    + '// Sprite hiệu ứng pixel: f = khung (chuỗi w*h, "." trong suốt, ký tự = chỉ số trong pal), anims = động tác.\n'
    + `window.VFX_PX = {\n  names: ${JSON.stringify(data.names)},\n  pal: ${JSON.stringify(data.pal)},\n  all: ${JSON.stringify(data.all)},\n  spr: {\n${lines.map((l) => '  ' + l).join('\n')}\n  },\n};\n`;
}

function preview(data, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, '.vfx-px.json');
  fs.writeFileSync(tmp, JSON.stringify(data));
  execFileSync('python3', ['-I', '-c', `
import json, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1])); out = sys.argv[2]; Z = 8
CODE = ${JSON.stringify(CODE)}
pal = [tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) for h in d['pal']]
for name, s in d['spr'].items():
    n = len(s['f']); W, H = s['w'], s['h']
    im = Image.new('RGB', (n * (W * Z + Z), H * Z), (40, 40, 48)); g = ImageDraw.Draw(im)
    for k, fr in enumerate(s['f']):
        ox = k * (W * Z + Z)
        for y in range(H):
            for x in range(W):
                c = fr[y * W + x]
                col = ((90, 90, 100) if (x + y) % 2 else (70, 70, 80)) if c == '.' else pal[CODE.index(c)]
                g.rectangle((ox + x * Z, y * Z, ox + x * Z + Z - 1, y * Z + Z - 1), fill=col)
    im.save(out + '/' + name + '.png')
`, tmp, dir]);
  fs.unlinkSync(tmp);
}

function main(argv) {
  const opt = { check: argv.includes('--check'), xem: null, src: path.join(ROOT, 'tools/pixel/src/vfx'), out: path.join(ROOT, 'js/vfx-pixel-data.js') };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--xem') opt.xem = argv[++i];
    else if (argv[i] === '--src') opt.src = argv[++i];
    else if (argv[i] === '--out') opt.out = argv[++i];
  }
  const pal = readPalette(opt.src);
  const data = build(opt.src, pal);
  console.log(`vfx pixel: ${Object.keys(data.spr).length} sprite, ${data.pal.length} màu`);
  if (opt.check) return;
  fs.mkdirSync(path.dirname(opt.out), { recursive: true });
  fs.writeFileSync(opt.out, render(data));
  console.log('→ ' + path.relative(ROOT, opt.out));
  if (opt.xem) { preview(data, opt.xem); console.log('xem trước → ' + opt.xem); }
}
module.exports = { parse, build, render, readPalette };
if (require.main === module) {
  try { main(process.argv.slice(2)); } catch (e) { console.error('LỖI: ' + e.message); process.exit(1); }
}
