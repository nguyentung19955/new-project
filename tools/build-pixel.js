#!/usr/bin/env node
// Dựng sprite PIXEL ART từ file nguồn văn bản (lưới ký tự + bảng màu chung) — claude/pixel-nen-tang.
// Quy chuẩn: docs/pixel/QUY-CHUAN.md · danh sách hình cần vẽ: docs/pixel/DANH-SACH.md
//
//   node tools/build-pixel.js                 → dựng mọi file tools/pixel/src/<nhóm>/<mã>.txt
//        → assets/pixel/<nhóm>/<mã>.png (dải khung nằm ngang) + <mã>.json (manifest) [+ <mã>-chan-dung.png cho tướng]
//        → js/pixel/<nhóm>.js (manifest theo nhóm, game đọc) + chạy lại js/asset-list.js
//   node tools/build-pixel.js --check         → chỉ kiểm tra, không ghi gì (mã thoát 1 nếu có lỗi)
//   node tools/build-pixel.js tuong/giong     → chỉ dựng / kiểm tra file có đường dẫn chứa chuỗi này (manifest vẫn gom đủ)
//   --strict    cảnh báo (viền ngoài không phải màu viền…) cũng tính là lỗi
//   --src DIR   thư mục nguồn khác (test) · --out DIR  ghi ra DIR/assets/pixel… + DIR/js/pixel/ (test, không đụng repo)
//   --nhap      bản nháp: bỏ qua kiểm tra đủ động tác bắt buộc (đang vẽ dở; KHÔNG dùng khi commit)
//   --xem DIR   xuất thêm ảnh xem trước phóng ×8 (nền ô cờ, có lưới) vào DIR — để NHÌN hình khi vẽ
//
// Định dạng nguồn (chi tiết + ví dụ: docs/pixel/QUY-CHUAN.md mục "Định dạng file nguồn"):
//   name: Thánh Gióng          size: 32x32          anchor: 16,31   (điểm chân chạm đất)
//   colors:                    ← mỗi dòng "<ký tự> = <tên màu trong tools/pixel/palette.txt>"
//     k = vien
//   part <tên>                 ← lưới ký tự; '.' trong suốt (khi đóng dấu: giữ pixel dưới), '_' xoá pixel dưới
//   ...
//   end
//   anim <động tác> fps=<n> [loop|once]
//   frame <động tác>           ← các lệnh dựng một khung, chạy lần lượt:
//     use <part|@anim.i> [x y] · shift dx dy · wrap dx dy · swap a b · set x y c · flipx · rot 90|180|270 · outline [c]
//   end
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const PALETTE_FILE = path.join(__dirname, 'pixel', 'palette.txt');

// cỡ hợp lệ theo nhóm (docs/pixel/QUY-CHUAN.md); null = tuỳ (giới hạn 8..320)
const GROUP_SIZES = {
  tuong: ['32x32'], quai: ['32x32'], boss: ['48x48', '64x64'],
  nen: ['16x16', '32x32', '48x48', '64x64'], icon: ['16x16', '12x12'],
  do: ['24x24'], 'an-phu': ['24x24'], 'ky-nang': ['24x24'], 'than-khi': ['24x24'],
  vfx: null, 'giao-dien': null, canh: ['160x90', '320x180'], 'ban-do': ['320x148'],   // vfx: hiệu ứng — nhánh claude/vfx-kenney đảm nhận · ban-do: nền sân đấu 1280×590 ÷ 4
};
// động tác bắt buộc + số khung cho phép
const REQUIRED = {
  tuong: { idle: [2, 4], attack: [3, 4], cast: [2, 4], hurt: [1, 2], die: [2, 4] },
  quai: { walk: [2, 4], attack: [3, 4], hurt: [1, 2], die: [2, 4] },
  boss: { walk: [2, 4], attack: [3, 4], hurt: [1, 2], die: [2, 4] },
};
const ANIM_RANGE = { idle: [1, 6], walk: [1, 6], attack: [1, 6], cast: [1, 6], hurt: [1, 2], die: [1, 6], rage: [1, 4], portrait: [1, 1], main: [1, 8], win: [1, 4] };
const RESERVED = new Set(['.', '_']);
// làm mượt mức 7 (người dùng chọn 08/10): mỗi điểm gốc → 2×2 điểm đã làm mượt (tools/pixel/lam-muot.js) — ×4 không đẹp hơn ở cỡ trong trận mà nặng gấp đôi
const { lamMuot, lamMuotDai } = require('./pixel/lam-muot.js');
const MUOT_K = 2;
// cờ tắt làm mượt theo nhóm / mã (tools/pixel/muot.json → "tat": tiền tố "nhóm/mã") — chờ người dùng quyết nền / cổng / bệ
const MUOT_TAT = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'pixel', 'muot.json'), 'utf8')).tat || []; } catch (e) { return []; } })();

// ---------------------------------------------------------------- PNG (không cần thư viện)
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------- bảng màu
function loadPalette(file = PALETTE_FILE) {
  const pal = {};
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((ln, i) => {
    const s = ln.replace(/#(?![0-9A-Fa-f]{6}\b).*$/, '').trim();
    if (!s) return;
    const m = s.match(/^([a-z][a-z0-9-]*)\s+#([0-9A-Fa-f]{6})\s*(\*)?/);
    if (!m) throw new Error(`palette.txt:${i + 1}: dòng không hợp lệ: ${ln}`);
    if (pal[m[1]]) throw new Error(`palette.txt:${i + 1}: trùng tên màu ${m[1]}`);
    pal[m[1]] = { hex: '#' + m[2].toUpperCase(), rgb: [0, 2, 4].map((k) => parseInt(m[2].slice(k, k + 2), 16)), edge: !!m[3] };
  });
  return pal;
}

// ---------------------------------------------------------------- đọc file nguồn
function parseSource(text, file) {
  const src = { file, name: '', size: null, anchor: null, colors: {}, parts: {}, anims: {}, order: [], frames: [] };
  const lines = text.split(/\r?\n/);
  const err = (i, m) => { throw new Error(`${file}:${i + 1}: ${m}`); };
  let mode = null, cur = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const ln = raw.replace(/\s+#.*$/, '').replace(/^#.*$/, '').trimEnd();
    if (mode === 'part') {
      const t = ln.trim();
      if (t === 'end') { if (!cur.rows.length) err(i, `part ${cur.name} rỗng`); src.parts[cur.name] = cur; mode = null; continue; }
      if (!t) continue;
      if (/\s/.test(t)) err(i, `lưới part ${cur.name} có khoảng trắng giữa dòng (dùng '.' cho ô trong suốt)`);
      if (cur.rows.length && t.length !== cur.rows[0].s.length) err(i, `part ${cur.name}: dòng dài ${t.length}, khác dòng đầu ${cur.rows[0].s.length}`);
      cur.rows.push({ s: t, line: i + 1 });
      continue;
    }
    if (mode === 'frame') {
      const t = ln.trim();
      if (!t) continue;
      if (t === 'end') { src.frames.push(cur); mode = null; continue; }
      cur.cmds.push({ args: t.split(/\s+/), line: i + 1 });
      continue;
    }
    if (mode === 'colors') {
      const m = ln.match(/^\s+(\S)\s*=\s*([a-z][a-z0-9-]*)\s*$/);
      if (m) {
        if (RESERVED.has(m[1])) err(i, `ký tự '${m[1]}' dành riêng (. trong suốt, _ xoá) — chọn ký tự khác`);
        if (src.colors[m[1]]) err(i, `ký tự '${m[1]}' khai báo hai lần`);
        src.colors[m[1]] = { name: m[2], line: i + 1 };
        continue;
      }
      if (!ln.trim()) continue;
      mode = null;
    }
    const t = ln.trim();
    if (!t) continue;
    let m;
    if ((m = t.match(/^name:\s*(.+)$/))) src.name = m[1].trim();
    else if ((m = t.match(/^size:\s*(\d+)x(\d+)$/))) src.size = [+m[1], +m[2]];
    else if ((m = t.match(/^anchor:\s*(-?\d+)\s*,\s*(-?\d+)$/))) src.anchor = [+m[1], +m[2]];
    else if (t === 'colors:') mode = 'colors';
    else if ((m = t.match(/^part\s+([A-Za-z0-9_-]+)$/))) { if (src.parts[m[1]]) err(i, `part ${m[1]} trùng tên`); mode = 'part'; cur = { name: m[1], rows: [], line: i + 1 }; }
    else if ((m = t.match(/^anim\s+([a-z]+)((?:\s+\S+)*)$/))) {
      const a = { fps: 6, loop: true, line: i + 1 };
      for (const tok of m[2].trim().split(/\s+/).filter(Boolean)) {
        const f = tok.match(/^fps=(\d+(?:\.\d+)?)$/);
        if (f) a.fps = +f[1]; else if (tok === 'loop') a.loop = true; else if (tok === 'once') a.loop = false; else err(i, `anim: không hiểu "${tok}"`);
      }
      if (src.anims[m[1]]) err(i, `anim ${m[1]} khai báo hai lần`);
      src.anims[m[1]] = a; src.order.push(m[1]);
    }
    else if ((m = t.match(/^frame\s+([a-z]+)$/))) { mode = 'frame'; cur = { anim: m[1], cmds: [], line: i + 1 }; }
    else err(i, `không hiểu dòng: ${raw.trim()}`);
  }
  if (mode) err(lines.length - 1, `thiếu "end" cho ${mode} ${cur ? cur.name || cur.anim : ''}`);
  return src;
}

// ---------------------------------------------------------------- dựng khung (lưới ký tự W×H, null = trong suốt)
function buildSprite(src, pal, group, draft) {
  const errors = [], warns = [];
  const E = (line, m) => errors.push(`${src.file}${line ? ':' + line : ''}: ${m}`);
  const W = (line, m) => warns.push(`${src.file}${line ? ':' + line : ''}: ${m}`);
  if (!src.size) { E(0, 'thiếu "size: WxH"'); return { errors, warns }; }
  const [w, h] = src.size;
  const allowed = GROUP_SIZES[group];
  if (allowed === undefined) E(0, `nhóm "${group}" không có trong quy chuẩn (${Object.keys(GROUP_SIZES).join(', ')})`);
  else if (allowed ? !allowed.includes(`${w}x${h}`) : (w < 8 || h < 8 || w > 320 || h > 320)) E(0, `kích thước ${w}x${h} sai — nhóm ${group} chỉ cho phép ${allowed ? allowed.join(' / ') : '8..320'}`);
  if (!src.name) W(0, 'thiếu "name:"');
  const anchor = src.anchor || [w >> 1, h - 1];
  if (anchor[0] < 0 || anchor[0] >= w || anchor[1] < 0 || anchor[1] >= h) E(0, `anchor ${anchor} nằm ngoài khung ${w}x${h}`);
  // màu
  for (const [ch, c] of Object.entries(src.colors)) if (!pal[c.name]) E(c.line, `màu "${c.name}" (ký tự '${ch}') không có trong bảng màu tools/pixel/palette.txt`);
  for (const p of Object.values(src.parts)) for (const r of p.rows) for (const ch of r.s) {
    if (!RESERVED.has(ch) && !src.colors[ch]) { E(r.line, `ký tự '${ch}' trong part ${p.name} chưa khai báo ở colors: (màu ngoài bảng màu)`); break; }
  }
  if (errors.length) return { errors, warns };

  const blank = () => Array.from({ length: h }, () => new Array(w).fill(null));
  const built = {};   // anim -> [grid]
  const frames = [];  // { anim, grid }
  for (const fr of src.frames) {
    if (!src.anims[fr.anim]) { E(fr.line, `frame ${fr.anim}: chưa khai báo "anim ${fr.anim} fps=…"`); continue; }
    let g = blank();
    for (const { args, line } of fr.cmds) {
      const [op, ...a] = args;
      if (op === 'use') {
        let grid = null, gw = 0, gh = 0;
        const ref = a[0] || '';
        const rm = ref.match(/^@([a-z]+)\.(\d+)$/);
        if (rm) {
          const fg = built[rm[1]] && built[rm[1]][+rm[2]];
          if (!fg) { E(line, `use ${ref}: khung chưa có (chỉ dùng khung đã dựng phía trên, đếm từ 0)`); continue; }
          grid = fg; gw = w; gh = h;
        } else if (src.parts[ref]) {
          const p = src.parts[ref]; gh = p.rows.length; gw = p.rows[0].s.length;
          grid = p.rows.map((r) => [...r.s]);
        } else { E(line, `use: không có part "${ref}"`); continue; }
        const ox = +(a[1] || 0), oy = +(a[2] || 0);
        if (!Number.isInteger(ox) || !Number.isInteger(oy)) { E(line, `use ${ref}: toạ độ phải là số nguyên`); continue; }
        let out = 0;
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
          const v = grid[y][x];
          if (v === '.' || v === null) continue;
          const X = x + ox, Y = y + oy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) { if (v !== '_') out++; continue; }
          g[Y][X] = v === '_' ? null : v;
        }
        if (out) E(line, `use ${ref} tại ${ox},${oy}: ${out} pixel tràn ra ngoài khung ${w}x${h}`);
      } else if (op === 'shift') {
        const dx = +a[0] || 0, dy = +a[1] || 0, n = blank();
        let lost = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x] !== null) {
          const X = x + dx, Y = y + dy;
          if (X < 0 || Y < 0 || X >= w || Y >= h) lost++; else n[Y][X] = g[y][x];
        }
        if (lost) E(line, `shift ${dx} ${dy}: ${lost} pixel bị đẩy ra ngoài khung`);
        g = n;
      } else if (op === 'wrap') {
        // cuộn vòng (ô nền lát liền): pixel ra mép này vào lại mép kia
        const dx = +a[0] || 0, dy = +a[1] || 0, n = blank();
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) n[(((y + dy) % h) + h) % h][(((x + dx) % w) + w) % w] = g[y][x];
        g = n;
      } else if (op === 'swap') {
        const [from, to] = a;
        if (!from || !to || (!src.colors[from]) || (!src.colors[to] && to !== '.')) { E(line, `swap ${from} ${to}: ký tự chưa khai báo ở colors:`); continue; }
        g = g.map((row) => row.map((v) => (v === from ? (to === '.' ? null : to) : v)));
      } else if (op === 'set') {
        const x = +a[0], y = +a[1], c = a[2];
        if (!(x >= 0 && y >= 0 && x < w && y < h)) { E(line, `set ${x} ${y}: ngoài khung`); continue; }
        if (c !== '.' && c !== '_' && !src.colors[c]) { E(line, `set: ký tự '${c}' chưa khai báo`); continue; }
        g[y][x] = c === '.' || c === '_' ? null : c;
      } else if (op === 'flipx') {
        g = g.map((row) => row.slice().reverse());
      } else if (op === 'rot') {
        // xoay theo chiều kim đồng hồ: 90 / 180 / 270 (âm = ngược chiều); 90 / 270 chỉ cho khung vuông (đổi rộng ↔ cao)
        const deg = Number(a[0]);
        if (!Number.isInteger(deg) || deg % 90) { E(line, `rot ${a[0] ?? ''}: góc phải là bội của 90 (90 · 180 · 270)`); continue; }
        const k = ((deg / 90) % 4 + 4) % 4;
        if (k % 2 && w !== h) { E(line, `rot ${deg}: khung ${w}x${h} không vuông — chỉ xoay 180 được (90 / 270 đổi rộng ↔ cao)`); continue; }
        if (k === 2) g = g.slice().reverse().map((row) => row.slice().reverse());
        else for (let r = 0; r < k; r++) { const n = blank(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) n[x][w - 1 - y] = g[y][x]; g = n; }
      } else if (op === 'outline') {
        const c = a[0] || Object.keys(src.colors).find((k) => src.colors[k].name === 'vien');
        if (!c || !src.colors[c]) { E(line, 'outline: cần ký tự màu viền (khai báo "k = vien" ở colors:)'); continue; }
        const n = g.map((row) => row.slice());
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (g[y][x] !== null) continue;
          if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X >= 0 && Y >= 0 && X < w && Y < h && g[Y][X] !== null; })) n[y][x] = c;
        }
        g = n;
      } else E(line, `lệnh lạ "${op}" (use · shift · wrap · swap · set · flipx · rot · outline)`);
    }
    (built[fr.anim] || (built[fr.anim] = [])).push(g);
    frames.push({ anim: fr.anim, grid: g, line: fr.line });
  }
  // động tác bắt buộc + số khung
  const req = draft ? {} : REQUIRED[group] || {};
  for (const [an, [lo, hi]] of Object.entries(req)) {
    const n = (built[an] || []).length;
    if (n < lo || n > hi) E(0, `động tác "${an}" cần ${lo}–${hi} khung (đang có ${n})`);
  }
  for (const an of src.order) {
    const n = (built[an] || []).length;
    if (!n) E(src.anims[an].line, `anim ${an} không có khung nào`);
    const r = ANIM_RANGE[an];
    if (!r && !req[an]) W(src.anims[an].line, `động tác lạ "${an}" (chuẩn: ${Object.keys(ANIM_RANGE).join(', ')})`);
    else if (r && !req[an] && (n < r[0] || n > r[1])) E(src.anims[an].line, `động tác "${an}" cần ${r[0]}–${r[1]} khung (đang có ${n})`);
  }
  if (!frames.length) E(0, 'không có khung nào');
  // viền ngoài: pixel chạm nền trong suốt phải là màu viền (*) — với nhân vật / đồ
  if (['tuong', 'quai', 'boss', 'do', 'an-phu', 'than-khi'].includes(group)) {
    for (const f of frames) {
      if (f.anim === 'cast' || f.anim === 'die') continue;   // chiêu (lửa, sáng) / chết (mờ) được tự do
      let bad = 0, ex = null;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const v = f.grid[y][x];
        if (v === null || pal[src.colors[v].name].edge) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X < 0 || Y < 0 || X >= w || Y >= h || f.grid[Y][X] === null; })) { bad++; ex = ex || [x, y, src.colors[v].name]; }
      }
      if (bad) W(f.line, `khung ${f.anim}: ${bad} pixel ở mép hình không phải màu viền (vd ${ex[0]},${ex[1]} '${ex[2]}') — thêm "outline" hoặc tô viền`);
    }
  }
  // khung trống / chân không chạm điểm neo
  for (const f of frames) if (!f.grid.some((r) => r.some((v) => v !== null))) E(f.line, `khung ${f.anim} trống`);
  return { errors, warns, w, h, anchor, frames, built };
}

function bboxOf(grid) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  grid.forEach((row, y) => row.forEach((v, x) => { if (v !== null) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }));
  return x1 < 0 ? [0, 0, 0, 0] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}
function toRGBA(grids, w, h, src, pal) {
  const n = grids.length, buf = Buffer.alloc(w * n * h * 4);
  grids.forEach((g, i) => g.forEach((row, y) => row.forEach((v, x) => {
    if (v === null) return;
    const [r, gg, b] = pal[src.colors[v].name].rgb, o = (y * w * n + i * w + x) * 4;
    buf[o] = r; buf[o + 1] = gg; buf[o + 2] = b; buf[o + 3] = 255;
  })));
  return buf;
}
// chân dung: khung "portrait" nếu có; không thì cắt vuông phần trên (đầu + vai) của khung đứng đầu tiên
function portraitGrid(sp) {
  if (sp.built.portrait) return sp.built.portrait[0];
  const g = (sp.built.idle || sp.built.walk || [sp.frames[0].grid])[0];
  const [bx, by, bw] = bboxOf(g);
  const side = Math.max(8, Math.min(sp.w, sp.h, Math.round(Math.min(bw, sp.h * 0.72))));
  // tâm theo cột đầu (dòng trên cùng có pixel) để không lệch sang vũ khí
  const top = g.slice(by, by + Math.max(4, Math.round(side * 0.5)));
  let sx = 0, n = 0; top.forEach((row) => row.forEach((v, x) => { if (v !== null) { sx += x; n++; } }));
  const cx = n ? Math.round(sx / n) : bx + (bw >> 1);
  const x0 = Math.max(0, Math.min(sp.w - side, cx - (side >> 1))), y0 = Math.max(0, by - 1);
  return Array.from({ length: side }, (_, y) => Array.from({ length: side }, (_, x) => (g[y0 + y] ? g[y0 + y][x0 + x] ?? null : null)));
}
// ảnh xem trước ×8: nền ô cờ + lưới mảnh, các khung cách nhau 1 ô
function previewPNG(grids, w, h, src, pal, S = 8) {
  const n = grids.length, gap = 1, W = (w + gap) * n * S, H = h * S, buf = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fi = Math.floor(x / ((w + gap) * S)), lx = Math.floor((x % ((w + gap) * S)) / S), ly = Math.floor(y / S), o = (y * W + x) * 4;
    let c;
    if (lx >= w) c = [40, 40, 48];
    else {
      const v = grids[fi][ly][lx];
      c = v !== null ? pal[src.colors[v].name].rgb : ((lx + ly) % 2 ? [200, 200, 205] : [230, 230, 235]);
      if (x % S === 0 || y % S === 0) c = c.map((k) => Math.max(0, k - 18));
    }
    buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; buf[o + 3] = 255;
  }
  return encodePNG(W, H, buf);
}

// ---------------------------------------------------------------- chạy
function listSources(srcDir) {
  const out = [];
  if (!fs.existsSync(srcDir)) return out;
  for (const g of fs.readdirSync(srcDir).sort()) {
    const d = path.join(srcDir, g);
    if (!fs.statSync(d).isDirectory()) continue;
    if (fs.existsSync(path.join(d, 'KHONG-BUILD'))) continue;   // nhóm có tool dựng riêng (vd vfx của nhánh vfx-kenney)
    for (const f of fs.readdirSync(d).sort()) if (f.endsWith('.txt') && f !== 'palette.txt') out.push({ group: g, code: f.replace(/\.txt$/, ''), file: path.join(d, f) });
  }
  return out;
}
// manifest theo NHÓM: js/pixel/<nhóm>.js — mỗi session vẽ một nhóm chỉ đụng file nhóm mình (index.html nạp sẵn đủ 12 nhóm)
function manifestJs(group, entries) {
  const keys = Object.keys(entries).filter((k) => k.startsWith(group + '/')).sort();
  return '// SINH TỰ ĐỘNG bởi tools/build-pixel.js — đừng sửa tay (xung đột khi gộp nhánh: chạy lại node tools/build-pixel.js).\n'
    + `// Sprite pixel nhóm "${group}": "<nhóm>/<mã>" → dải khung assets/pixel/<nhóm>/<mã>.png. Game dùng khi bật pixel (js/pixel.js).\n`
    + 'window.PIXEL_MANIFEST = window.PIXEL_MANIFEST || {};\n'
    + 'Object.assign(window.PIXEL_MANIFEST, {\n' + keys.map((k) => `${JSON.stringify(k)}: ${JSON.stringify(entries[k])},`).join('\n') + (keys.length ? '\n' : '') + '});\n';
}

function run(argv) {
  const opt = { check: false, strict: false, src: path.join(__dirname, 'pixel', 'src'), out: ROOT, xem: null, filters: [], quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opt.check = true;
    else if (a === '--strict') opt.strict = true;
    else if (a === '--quiet') opt.quiet = true;
    else if (a === '--nhap') opt.nhap = true;
    else if (a === '--src') opt.src = path.resolve(argv[++i]);
    else if (a === '--out') opt.out = path.resolve(argv[++i]);
    else if (a === '--xem') opt.xem = path.resolve(argv[++i]);
    else if (a === '--khong-muot') opt.khongMuot = true;
    else opt.filters.push(a);
  }
  const log = (...m) => { if (!opt.quiet) console.log(...m); };
  const pal = loadPalette();
  const all = listSources(opt.src);
  const errors = [], warns = [], entries = {}, outputs = [], warnedPal = new Set();
  for (const s of all) {
    const rel = `${s.group}/${s.code}`;
    if (!/^[a-z0-9]+([-_][a-z0-9]+)*$/.test(s.code)) { errors.push(`${rel}.txt: tên file phải viết thường không dấu, nối bằng '-' hoặc '_' (vd hanh-kim.txt, lactuong_q.txt — mã trong DANH-SACH)`); continue; }
    const pick = !opt.filters.length || opt.filters.some((f) => rel.includes(f));
    let src, sp;
    try { src = parseSource(fs.readFileSync(s.file, 'utf8'), path.relative(ROOT, s.file)); }
    catch (e) { errors.push(e.message); continue; }
    // nhóm có bảng màu riêng tạm thời (tools/pixel/src/<nhóm>/palette.txt, vd vfx) → cộng thêm vào bảng chung, có cảnh báo
    const gp = path.join(opt.src, s.group, 'palette.txt');
    let palG = pal;
    if (fs.existsSync(gp)) { palG = { ...loadPalette(gp), ...pal }; if (!warnedPal.has(s.group)) { warnedPal.add(s.group); warns.push(`${s.group}/palette.txt: nhóm dùng bảng màu riêng tạm thời — nhớ gộp về tools/pixel/palette.txt`); } }
    sp = buildSprite(src, palG, s.group, opt.nhap);
    errors.push(...sp.errors); warns.push(...sp.warns);
    if (sp.errors.length) continue;
    // dải khung theo thứ tự anim khai báo
    const grids = [], anims = {};
    for (const an of src.order) { anims[an] = { start: grids.length, n: sp.built[an].length, fps: src.anims[an].fps, loop: src.anims[an].loop }; grids.push(...sp.built[an]); }
    const first = sp.built.idle || sp.built.walk || sp.built.main || [grids[0]];
    const entry = { name: src.name, w: sp.w, h: sp.h, ax: sp.anchor[0], ay: sp.anchor[1], bbox: bboxOf(first[0]), n: grids.length, anims };
    if (s.group === 'tuong' || s.group === 'quai' || s.group === 'boss') entry.cd = 1;
    // claude/ve-lai-pixel: bản LÀM MƯỢT mức 7 sinh sẵn (assets/pixel-muot/, ×2) — trừ ô nền 16×16 lát liền (làm mượt sẽ hở mép)
    if (!opt.khongMuot && !(s.group === 'nen' && sp.w === 16 && sp.h === 16) && !MUOT_TAT.some((t) => rel.startsWith(t))) entry.m = MUOT_K;
    entries[rel] = entry;
    if (!pick) continue;
    outputs.push({ rel, s, src, sp, grids, entry, pal: palG });
  }
  for (const w of warns) log('  ! ' + w);
  if (opt.strict && warns.length) errors.push(...warns.map((w) => '(strict) ' + w));
  if (errors.length) {
    for (const e of errors) console.error('  ✗ ' + e);
    console.error(`build-pixel: ${errors.length} lỗi — chưa ghi file nào.`);
    return { ok: false, errors, warns, entries };
  }
  if (opt.check) { log(`build-pixel --check: ${all.length} file nguồn hợp lệ.`); return { ok: true, errors, warns, entries }; }
  for (const o of outputs) {
    const dir = path.join(opt.out, 'assets', 'pixel', o.s.group);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, o.s.code + '.png'), encodePNG(o.sp.w * o.grids.length, o.sp.h, toRGBA(o.grids, o.sp.w, o.sp.h, o.src, o.pal)));
    fs.writeFileSync(path.join(dir, o.s.code + '.json'), JSON.stringify({ code: o.s.code, group: o.s.group, ...o.entry, sheet: `${o.s.code}.png` }, null, 1) + '\n');
    if (o.entry.cd) {
      const pg = portraitGrid(o.sp);
      fs.writeFileSync(path.join(dir, o.s.code + '-chan-dung.png'), encodePNG(pg[0].length, pg.length, toRGBA([pg], pg[0].length, pg.length, o.src, o.pal)));
    }
    if (o.entry.m) {   // làm mượt mức 7 sinh sẵn: game tải thẳng, không tính lúc chơi
      const md = path.join(opt.out, 'assets', 'pixel-muot', o.s.group);
      fs.mkdirSync(md, { recursive: true });
      const m = lamMuotDai(toRGBA(o.grids, o.sp.w, o.sp.h, o.src, o.pal), o.sp.w, o.sp.h, o.grids.length, { k: MUOT_K });
      fs.writeFileSync(path.join(md, o.s.code + '.png'), encodePNG(m.w, m.h, m.rgba));
      if (o.entry.cd) {
        const pg = portraitGrid(o.sp), pw = pg[0].length, ph = pg.length, mc = lamMuot(toRGBA([pg], pw, ph, o.src, o.pal), pw, ph, { k: MUOT_K });
        fs.writeFileSync(path.join(md, o.s.code + '-chan-dung.png'), encodePNG(mc.w, mc.h, mc.rgba));
      }
    }
    if (opt.xem) { fs.mkdirSync(opt.xem, { recursive: true }); fs.writeFileSync(path.join(opt.xem, `${o.s.group}-${o.s.code}.png`), previewPNG(o.grids, o.sp.w, o.sp.h, o.src, o.pal)); }
    log(`  ✓ ${o.rel}: ${o.sp.w}x${o.sp.h} × ${o.grids.length} khung (${Object.entries(o.entry.anims).map(([k, v]) => k + ' ' + v.n).join(', ')})`);
  }
  // xoá ảnh cũ của nguồn đã xoá (chỉ khi dựng đủ bộ); bản làm mượt: xoá cả khi mã không còn làm mượt
  if (!opt.filters.length) for (const [thu, giu] of [['pixel', (e) => e], ['pixel-muot', (e) => e && e.m]]) {
    const pdir = path.join(opt.out, 'assets', thu);
    if (fs.existsSync(pdir)) for (const g of fs.readdirSync(pdir)) {
      const d = path.join(pdir, g);
      if (!fs.statSync(d).isDirectory()) continue;
      for (const f of fs.readdirSync(d)) {
        const code = f.replace(/(-chan-dung)?\.(png|json)$/, '');
        if (!giu(entries[`${g}/${code}`])) { fs.unlinkSync(path.join(d, f)); log(`  − xoá ${thu}/${g}/${f} (không còn nguồn)`); }
      }
    }
  }
  fs.mkdirSync(path.join(opt.out, 'js', 'pixel'), { recursive: true });
  for (const g of Object.keys(GROUP_SIZES)) {
    const f = path.join(opt.out, 'js', 'pixel', g + '.js'), txt = manifestJs(g, entries);
    if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== txt) fs.writeFileSync(f, txt);
  }
  log(`js/pixel/<nhóm>.js: ${Object.keys(entries).length} sprite / ${Object.keys(GROUP_SIZES).length} nhóm`);
  if (opt.out === ROOT) {
    const al = require('./build-asset-list.js');
    const files = al.list();
    fs.writeFileSync(al.out, al.render(files));
    log(`js/asset-list.js: ${files.length} ảnh`);
  }
  return { ok: true, errors, warns, entries };
}

module.exports = { run, parseSource, buildSprite, loadPalette, encodePNG, GROUP_SIZES, REQUIRED };
if (require.main === module) process.exit(run(process.argv.slice(2)).ok ? 0 : 1);
