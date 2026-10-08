#!/usr/bin/env node
// Bộ SINH file nguồn pixel cho tướng Thường (DANH-SACH lô 1–2) — nhánh claude/pixel-tuong-thuong.
// Mỗi tướng là một hàm vẽ theo "dáng" (pose) → sinh ra tools/pixel/src/tuong/<mã>.txt (mỗi khung một part 32×32 + outline).
// File .txt sinh ra là NGUỒN chính thức (build-pixel đọc .txt); muốn chỉnh: sửa hàm vẽ ở đây rồi chạy lại
//   node tools/pixel/src/tuong/_gen-thuong.js [mã…]      (không mã = sinh cả 20)
// rồi node tools/build-pixel.js --strict. Có thể sửa tay .txt, nhưng chạy lại file này sẽ ghi đè.
// Phong cách: docs/pixel/QUY-CHUAN.md mục 0 (đầu:thân ≈ 1:1,6, mắt nhỏ có lông mày, không má hồng, bóng 3 tông, màu trầm).
'use strict';
const fs = require('fs');
const path = require('path');

const W = 32, H = 32;
// ký tự chung cho mọi file (tên màu trong tools/pixel/palette.txt)
const CH = {
  vien: 'k', toi: 'K', khoi: 'q', 'sat-toi': 'i', sat: 's', 'sat-sang': 'S', bac: 'b',
  'trang-xam': 'x', trang: 'w', sang: 'W', 'da-toi': 'f', da: 'F', 'da-sang': 'h',
  'dat-toi': 't', dat: 'g', 'dat-sang': 'G', cat: 'c', 'dong-toi': 'o', dong: 'd', 'dong-sang': 'D',
  'vang-nghe': 'y', 'vang-sang': 'Y', 'son-toi': 'r', son: 'R', 'son-sang': '1', hong: 'p', lua: 'l', 'lua-sang': 'L',
  'la-toi': '2', la: '3', 'la-ma': 'm', 'la-sang': 'M', 'reu-toi': 'e', reu: 'u', 'reu-sang': 'U',
  'cham-toi': 'v', cham: 'n', 'cham-sang': 'N', nuoc: 'a', 'nuoc-sang': 'A', troi: 'z',
  'tim-toi': 'j', tim: 'P', 'tim-sang': 'J', ngoc: '4', 'ngoc-sang': '5',
};
const NAME = Object.fromEntries(Object.entries(CH).map(([n, c]) => [c, n]));

// bộ 3 tông [tối, gốc, sáng]
const M = {
  da: ['da-toi', 'da', 'da-sang'], daTram: ['dat', 'da-toi', 'da'],
  sat: ['sat-toi', 'sat', 'sat-sang'], bac: ['sat', 'sat-sang', 'bac'],
  trang: ['trang-xam', 'trang', 'sang'], ngà: ['dat-sang', 'trang-xam', 'trang'],
  dat: ['dat-toi', 'dat', 'dat-sang'], go: ['dat', 'dat-sang', 'cat'], rom: ['dat-sang', 'cat', 'vang-sang'],
  dong: ['dong-toi', 'dong', 'dong-sang'], vang: ['dong', 'vang-nghe', 'vang-sang'], dongSang: ['dong', 'dong-sang', 'vang-sang'],
  son: ['son-toi', 'son', 'son-sang'], lua: ['son', 'lua', 'lua-sang'],
  la: ['la-toi', 'la', 'la-ma'], laMa: ['la', 'la-ma', 'la-sang'], reu: ['reu-toi', 'reu', 'reu-sang'],
  cham: ['cham-toi', 'cham', 'cham-sang'], nuoc: ['cham', 'nuoc', 'nuoc-sang'], troi: ['nuoc-sang', 'troi', 'sang'],
  tim: ['tim-toi', 'tim', 'tim-sang'], ngoc: ['cham-toi', 'ngoc', 'ngoc-sang'], den: ['vien', 'khoi', 'toi'],
  tro: ['sat-toi', 'sat', 'sat-sang'], toc: ['vien', 'khoi', 'toi'],
};

// ------------------------------------------------------------------ lưới vẽ
class G {
  constructor() { this.a = Array.from({ length: H }, () => Array(W).fill(null)); }
  set(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < W && y < H) this.a[y][x] = c; }
  get(x, y) { return x >= 0 && y >= 0 && x < W && y < H ? this.a[y][x] : null; }
  clr(x, y) { if (x >= 0 && y >= 0 && x < W && y < H) this.a[y][x] = null; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  line(x0, y0, x1, y1, c) {
    const pts = linePts(x0, y0, x1, y1);
    for (const [x, y] of pts) this.set(x, y, typeof c === 'function' ? c(x, y) : c);
    return pts;
  }
  // tô vùng (danh sách điểm) bóng 3 tông: mép trên/trái sáng, mép phải/dưới tối
  shade(pts, m, o = {}) {
    const S = new Set(pts.map(([x, y]) => x + ',' + y));
    const has = (x, y) => S.has(x + ',' + y);
    for (const [x, y] of pts) {
      let c = m[1];
      if (!has(x, y - 1) && !o.noTop) c = m[2];
      else if (!has(x + 1, y) || (!has(x, y + 1) && !o.noBot)) c = m[0];
      else if (!has(x - 1, y)) c = m[2];
      this.set(x, y, c);
    }
  }
  // ascii: mỗi dòng một chuỗi ký tự chung; '.' bỏ qua, '_' xoá
  ascii(x, y, rows, flip) {
    rows.forEach((r, j) => { const s = flip ? [...r].reverse().join('') : r; [...s].forEach((ch, i) => { if (ch === '_') this.clr(x + i, y + j); else if (ch !== '.') this.set(x + i, y + j, NAME[ch] || bad(ch)); }); });
  }
  swap(a, b) { for (const r of this.a) for (let i = 0; i < W; i++) if (r[i] === a) r[i] = b; }
  shift(dx, dy) { const n = new G(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (this.a[y][x]) n.set(x + dx, y + dy, this.a[y][x]); this.a = n.a; return this; }
  clone() { const n = new G(); n.a = this.a.map((r) => r.slice()); return n; }
  bbox() { let x0 = W, y0 = H, x1 = -1, y1 = -1; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (this.a[y][x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
}
function bad(ch) { throw new Error('ký tự lạ ' + ch); }
function linePts(x0, y0, x1, y1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const pts = []; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  return pts;
}
const spans = (y0, list) => { const p = []; list.forEach((s, j) => { if (s) for (let x = s[0]; x <= s[1]; x++) p.push([x, y0 + j]); }); return p; };

// ------------------------------------------------------------------ hướng vũ khí (bội số 45°)
const DIR = { up: [0, -1], ul: [-1, -1], ur: [1, -1], r: [1, 0], dr: [1, 1], d: [0, 1], l: [-1, 0], dl: [-1, 1] };
const perp = ([x, y]) => [-y, x];   // quay 90° theo chiều kim đồng hồ: lưỡi rìu/đao quay về phía "trước"

// cán dài: từ tay lùi `back` điểm, tới trước `len` điểm. Trả về điểm mút (đầu vũ khí).
function shaft(g, hand, dir, len, back, m, thick, reserve = 5) {
  const [dx, dy] = DIR[dir] || dir;
  // rút ngắn để đầu vũ khí (reserve điểm) không tràn khung
  while (len > 2) {
    const tx = hand[0] + dx * (len + reserve), ty = hand[1] + dy * (len + reserve);
    if (tx <= 30 && tx >= 1 && ty >= 1 && ty <= 30) break;
    len--;
  }
  const a = [hand[0] - dx * back, hand[1] - dy * back], b = [hand[0] + dx * len, hand[1] + dy * len];
  if (thick) {
    const diag = dx && dy;
    g.line(a[0], a[1], b[0], b[1], m[1]);
    const o = diag ? [dx > 0 === dy > 0 ? 1 : 1, 0] : (dx ? [0, 1] : [1, 0]);
    g.line(a[0] + o[0], a[1] + o[1], b[0] + o[0], b[1] + o[1], m[0]);
  } else g.line(a[0], a[1], b[0], b[1], (x, y) => ((x + y) % 5 === 0 ? m[0] : m[1]));
  return b;
}

// đóng dấu hình vẽ sẵn theo hướng: art = { up: {rows, at:[x,y]}, ur: {rows, at} } (at = điểm nối với cán);
// hướng khác suy ra bằng quay 90°: up→r→d→l, ur→dr→dl→ul
const ROT_OF = { up: ['up', 0], r: ['up', 1], d: ['up', 2], l: ['up', 3], ur: ['ur', 0], dr: ['ur', 1], dl: ['ur', 2], ul: ['ur', 3] };
function rotRows(rows, at) {   // quay 90° theo chiều kim đồng hồ
  const h = rows.length, w = rows[0].length;
  const out = Array.from({ length: w }, (_, y) => Array.from({ length: h }, (_, x) => rows[h - 1 - x][y]).join(''));
  return { rows: out, at: [h - 1 - at[1], at[0]] };
}
function stamp(g, tip, dir, art) {
  const [base, n] = ROT_OF[dir];
  let a = art[base];
  if (!a) { a = art.up; }   // không có hình chéo: dùng hình thẳng gần nhất
  if (!a) return;
  a = { rows: a.rows, at: a.at };
  for (let i = 0; i < n; i++) a = rotRows(a.rows, a.at);
  g.ascii(tip[0] - a.at[0], tip[1] - a.at[1], a.rows);
}

// ------------------------------------------------------------------ dáng chuẩn
// điểm vai trước + vị trí bàn tay theo dáng tay
function handPos(S, arm) {
  const [sx, sy] = S;
  return {
    idle: [sx + 2, sy + 5], windup: [sx + 1, sy - 4], raise: [sx + 2, sy - 5], strike: [sx + 5, sy + 1],
    follow: [sx + 4, sy + 4], hold: [sx + 3, sy + 2], high: [sx + 1, sy - 7], front: [sx + 4, sy - 1], down: [sx + 2, sy + 5],
  }[arm] || arm;
}
const WDIR = { idle: 'up', windup: 'ul', raise: 'up', strike: 'r', follow: 'dr', hold: 'ur', high: 'up', front: 'ur', down: 'd' };

// cánh tay 2 điểm: vai → bàn tay; tay áo (sleeve: [m, số điểm]) phủ đoạn đầu
function arm(g, S, Hd, skin, sleeve) {
  const pts = linePts(S[0], S[1], Hd[0], Hd[1]);
  const horiz = Math.abs(Hd[0] - S[0]) > Math.abs(Hd[1] - S[1]);
  pts.forEach(([x, y], i) => {
    const sl = sleeve && i < sleeve[1];
    const m = sl ? sleeve[0] : skin;
    if (horiz) { g.set(x, y, m[1]); g.set(x, y + 1, m[0]); } else { g.set(x, y, m[1]); g.set(x + 1, y, m[0]); }
    if (i === 0) g.set(x, y, m[2]);
  });
  // bàn tay 2×2
  g.set(Hd[0], Hd[1], skin[2]); g.set(Hd[0] + 1, Hd[1], skin[1]); g.set(Hd[0], Hd[1] + 1, skin[1]); g.set(Hd[0] + 1, Hd[1] + 1, skin[0]);
}

// ------------------------------------------------------------------ đầu người (9×9, mặt quay phải)
// mặt trống; tóc / mũ vẽ đè sau. o: {hx, hy, skin, eyes:'open'|'closed'|'glow', old, child, brow, beard, mouth}
function head(g, o) {
  const { hx, hy } = o; const s = o.skin || M.da;
  const rows = o.child
    ? [[2, 6], [1, 7], [0, 8], [0, 8], [0, 8], [0, 8], [1, 8], [2, 7]]
    : [[2, 6], [1, 7], [0, 8], [0, 8], [0, 8], [0, 8], [0, 8], [1, 8], [2, 7]];
  const pts = []; rows.forEach(([a, b], j) => { for (let x = a; x <= b; x++) pts.push([hx + x, hy + j]); });
  g.shade(pts, s);
  // tai (sau mặt), bóng dưới cằm
  g.set(hx + 2, hy + 4, s[0]); g.set(hx + 2, hy + 5, s[0]); g.set(hx + 1, hy + 4, s[1]); g.set(hx + 1, hy + 5, s[2]);
  const ey = hy + (o.child ? 4 : 4);
  const brow = o.brow || 'toi';
  if (o.eyes === 'closed') {
    g.set(hx + 4, ey, 'toi'); g.set(hx + 5, ey, 'toi'); g.set(hx + 7, ey, 'toi'); g.set(hx + 8, ey, 'toi');
  } else {
    const ew = o.eyeW || 'trang', ek = o.eyeK || 'vien';
    g.set(hx + 4, ey, ew); g.set(hx + 5, ey, ek); g.set(hx + 7, ey, ew); g.set(hx + 8, ey, ek);
    if (!o.noBrow) { g.set(hx + 4, ey - 1, brow); g.set(hx + 5, ey - 1, brow); g.set(hx + 7, ey - 1, brow); g.set(hx + 8, ey - 1, brow); if (o.fierce) { g.set(hx + 6, ey - 1, s[0]); g.set(hx + 3, ey - 2, brow); } }
  }
  // mũi nhô + miệng
  g.set(hx + 9, ey + 1, s[1]); g.set(hx + 8, ey + 1, s[0]);
  if (o.mouth !== false) { g.set(hx + 6, ey + 3, s[0]); g.set(hx + 7, ey + 3, s[0]); }
  if (o.old) { g.set(hx + 3, ey + 2, s[0]); g.set(hx + 6, ey - 2, s[0]); g.set(hx + 7, ey - 2, s[0]); }
}

// ------------------------------------------------------------------ thân chuẩn
// B (build): vai / eo / chân. Trả về toạ độ để phụ kiện bám vào.
function build(kind, dy = 0) {
  const b = {
    normal: { hx: 11, hy: 6, t0: 15, t1: 22, sh: [11, 20], wa: [12, 19], legs: [[12, 14], [16, 18]], foot: 29, S: [19, 16], B: [11, 16] },
    stocky: { hx: 11, hy: 7, t0: 16, t1: 23, sh: [10, 21], wa: [11, 20], legs: [[11, 14], [16, 19]], foot: 29, S: [20, 17], B: [10, 17] },
    thin: { hx: 11, hy: 5, t0: 14, t1: 22, sh: [12, 19], wa: [12, 18], legs: [[12, 13], [16, 17]], foot: 29, S: [19, 15], B: [11, 15] },
    huge: { hx: 12, hy: 4, t0: 13, t1: 22, sh: [8, 23], wa: [11, 20], legs: [[10, 14], [17, 21]], foot: 29, S: [22, 14], B: [7, 14], huge: true },
    child: { hx: 11, hy: 11, t0: 19, t1: 24, sh: [12, 19], wa: [12, 19], legs: [[12, 14], [16, 18]], foot: 29, S: [19, 20], B: [11, 20], child: true },
    teen: { hx: 11, hy: 8, t0: 17, t1: 23, sh: [12, 19], wa: [12, 19], legs: [[12, 14], [16, 18]], foot: 29, S: [19, 18], B: [11, 18] },
    old: { hx: 12, hy: 8, t0: 17, t1: 23, sh: [11, 19], wa: [12, 19], legs: [[12, 14], [16, 18]], foot: 29, S: [19, 18], B: [11, 18], old: true },
  }[kind];
  const o = JSON.parse(JSON.stringify(b));
  o.hy += dy; o.t0 += dy; o.t1 += dy; o.S[1] += dy; o.B[1] += dy;
  return o;
}
// điểm thân (vai rộng → eo)
function torsoPts(b, o = {}) {
  const p = [];
  for (let y = b.t0; y <= b.t1; y++) {
    const k = y - b.t0;
    let [a, c] = k < 3 ? b.sh : b.wa;
    if (b.huge) { if (k === 0) { a += 2; c -= 2; } else if (k === 1) { a += 1; c -= 1; } else if (k >= 3 && k < 5) { a -= 1; c += 1; } }
    for (let x = a; x <= c; x++) p.push([x, y]);
  }
  return p;
}
// chân: m = màu quần (null = chân trần), len = số dòng quần từ trên xuống
function legs(g, b, o) {
  const top = b.t1 + 1, foot = b.foot;
  const kneel = o.kneel;
  b.legs.forEach(([a, c], i) => {
    const pts = [];
    const y0 = kneel ? Math.max(top, foot - 2) : top;
    for (let y = y0; y < foot; y++) for (let x = a; x <= c; x++) pts.push([x, y]);
    // quần phần trên, da phần dưới
    const pantRows = o.pantRows ?? 99;
    const P = pts.filter(([, y]) => y - top < pantRows), Sk = pts.filter(([, y]) => y - top >= pantRows);
    if (o.pant) g.shade(P, o.pant); else g.shade(P, o.skin);
    if (Sk.length) g.shade(Sk, o.skin, { noTop: true });
    // bàn chân nhô về trước
    const fm = o.feet || o.skin;
    for (let x = a; x <= c + 1; x++) g.set(x, foot, x === c + 1 ? fm[0] : fm[1]);
    g.set(a, foot, fm[2]);
    if (o.cuff && pantRows < 99) for (let x = a; x <= c; x++) g.set(x, top + pantRows - 1, o.cuff);
  });
}

// ------------------------------------------------------------------ hiệu ứng chiêu theo hành
function fx(g, el, i, cx, cy) {
  const pts = {
    0: [[-4, -1], [4, -2]], 1: [[-5, 1], [5, 0], [0, -5]], 2: [[-6, 2], [6, 2], [-4, -5], [4, -5], [0, -8]],
  }[i] || [];
  const GL = {
    kim: [[0, 0, 'sang'], [-1, 0, 'bac'], [1, 0, 'bac'], [0, -1, 'bac'], [0, 1, 'bac']],
    moc: [[0, 0, 'la-sang'], [1, -1, 'la-ma'], [-1, 1, 'la']],
    thuy: [[0, -1, 'troi'], [0, 0, 'nuoc-sang'], [-1, 1, 'nuoc'], [0, 1, 'nuoc'], [1, 1, 'cham']],
    hoa: [[0, -1, 'lua-sang'], [0, 0, 'lua-sang'], [-1, 1, 'lua'], [0, 1, 'lua'], [1, 1, 'son']],
    tho: [[0, 0, 'cat'], [1, 0, 'dat-sang'], [0, 1, 'dat-sang'], [1, 1, 'dat']],
  }[el];
  pts.forEach(([dx, dy]) => GL.forEach(([a, b, c]) => g.set(cx + dx + a, cy + dy + b, c)));
}

// tông sáng kế tiếp trong từng dải màu (nháy trúng đòn)
const LIGHT = {};
[['toi', 'khoi'], ['sat-toi', 'sat', 'sat-sang', 'bac', 'sang'], ['trang-xam', 'trang', 'sang'], ['da-toi', 'da', 'da-sang', 'sang'],
  ['dat-toi', 'dat', 'dat-sang', 'cat', 'vang-sang'], ['dong-toi', 'dong', 'dong-sang', 'vang-nghe', 'vang-sang', 'sang'],
  ['son-toi', 'son', 'son-sang', 'hong'], ['lua', 'lua-sang', 'vang-sang'], ['la-toi', 'la', 'la-ma', 'la-sang'],
  ['reu-toi', 'reu', 'reu-sang', 'la-sang'], ['cham-toi', 'cham', 'cham-sang', 'nuoc-sang'], ['nuoc', 'nuoc-sang', 'troi', 'sang'],
  ['tim-toi', 'tim', 'tim-sang'], ['ngoc', 'ngoc-sang', 'troi']].forEach((r) => r.forEach((c, i) => { if (i < r.length - 1 && !LIGHT[c]) LIGHT[c] = r[i + 1]; }));

// ------------------------------------------------------------------ xoay để vẽ khung chết
function lieDown(src) {
  const [x0, y0, x1, y1] = src.bbox();
  const n = new G();
  // quay ngược kim đồng hồ: đầu sang trái, mặt ngửa lên
  const tmp = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = src.a[y][x]; if (c) tmp.push([y - y0, x1 - x, c]); }
  const w = y1 - y0 + 1, h = x1 - x0 + 1;
  const ox = Math.max(1, Math.min(W - 1 - w, 15 - Math.floor(w / 2))), oy = 29 - (h - 1);
  for (const [x, y, c] of tmp) n.set(ox + x, Math.max(1, oy) + y, c);
  return n;
}

function outlined(src) {
  const n = src.clone();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (src.a[y][x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => src.get(x + dx, y + dy))) n.a[y][x] = 'vien';
  }
  return n;
}

// ------------------------------------------------------------------ sinh file .txt
function frames(def) {
  const out = [];
  const add = (anim, g) => out.push({ anim, g });
  const P = def.poses || {};
  const idle = P.idle || [{ arm: 'idle' }, { arm: 'idle', dy: 1 }, { arm: 'idle', alt: 1 }];
  const atk = P.attack || [{ arm: 'windup' }, { arm: 'raise' }, { arm: 'strike' }, { arm: 'follow' }];
  const cast = P.cast || [{ arm: 'raise', fx: 0 }, { arm: 'high', fx: 1 }, { arm: 'strike', fx: 2 }];
  const run = (p) => { const g = new G(); def.draw(g, { dy: 0, eyes: 'open', ...p }); return g; };
  idle.forEach((p) => add('idle', run({ k: 'idle', ...p })));
  atk.forEach((p, i) => add('attack', run({ k: 'attack', i, ...p })));
  cast.forEach((p, i) => add('cast', run({ k: 'cast', i, ...p })));
  const hurt = run({ k: 'hurt', ...idle[0], eyes: 'closed', hurt: 1 }); hurt.shift(-1, 0);
  // nháy sáng: mọi màu lên một tông (trừ viền) — trúng đòn khác hẳn idle (lùi 1 điểm + nhắm mắt + sáng)
  if (def.hurtSwap) def.hurtSwap.forEach(([a, b]) => hurt.swap(a, b));
  for (const r of hurt.a) for (let i = 0; i < W; i++) if (r[i] && LIGHT[r[i]]) r[i] = LIGHT[r[i]];
  add('hurt', hurt);
  const kneel = run({ k: 'die', arm: 'down', eyes: 'closed', kneel: 1, dy: 3, ...(P.kneel || {}) });
  add('die', kneel);
  const lie = lieDown(run({ k: 'die', arm: 'down', eyes: 'closed', lying: 1, ...(P.lie || {}) }));
  add('die', lie);
  // chân dung: khung đứng có viền, cắt vuông 16×16 quanh đầu rồi phóng ×2 (nearest) cho đủ khung 32×32
  {
    const g0 = run({ k: 'idle', ...idle[0] });
    const o = outlined(g0);
    const hb = def.head || { x: 0, y: 0 };
    const b0 = def.portrait || {};
    const px = b0.x ?? 0, py = b0.y ?? 0;
    const pg = new G();
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const c = o.get(px + x, py + y);
      if (c) for (let k = 0; k < 4; k++) pg.set(x * 2 + (k & 1), y * 2 + (k >> 1), c);
    }
    // mép cắt chạm khung → tô viền (build --strict đòi pixel chạm mép là màu viền)
    for (let i = 0; i < 32; i++) for (const [x, y] of [[i, 0], [i, 31], [0, i], [31, i]]) if (pg.get(x, y)) pg.set(x, y, 'vien');
    pg.noOutline = true;
    out.portrait = pg;
  }
  const lie2 = lie.clone(); (def.fade || [['da', 'da-toi'], ['da-sang', 'da']]).forEach(([a, b]) => lie2.swap(a, b));
  add('die', lie2);
  if (out.portrait) { out.push({ anim: 'portrait', g: out.portrait }); }
  return out;
}

function emit(code, def) {
  const fr = frames(def);
  // chừa mép 1 điểm cho viền ngoài (outline)
  fr.forEach(({ g }) => { if (g.noOutline) return; for (let i = 0; i < W; i++) { g.clr(i, 0); g.clr(i, H - 1); g.clr(0, i); g.clr(W - 1, i); } });
  const used = new Set();
  fr.forEach(({ g }) => g.a.forEach((r) => r.forEach((c) => c && used.add(c))));
  used.add('vien');
  const L = [];
  def.notes.forEach((n) => L.push('# ' + n));
  L.push('# FILE SINH TỰ ĐỘNG từ tools/pixel/src/tuong/_gen-thuong.js — sửa ở đó rồi chạy lại (node tools/pixel/src/tuong/_gen-thuong.js ' + code + ').');
  L.push('name: ' + def.name, 'size: 32x32', 'anchor: 15,30', 'colors:');
  [...used].sort((a, b) => CH[a].localeCompare(CH[b])).forEach((n) => L.push(`  ${CH[n]} = ${n}`));
  L.push('');
  const fps = { idle: 3, attack: 10, cast: 8, hurt: 8, die: 5, portrait: 1 };
  const loop = { idle: 'loop', attack: 'once', cast: 'loop', hurt: 'once', die: 'once', portrait: 'once' };
  const noOut = new Set(fr.filter((f) => f.g.noOutline).map((f) => f.anim));
  const count = {};
  let cur = null;
  fr.forEach(({ anim, g }) => {
    const i = count[anim] = (count[anim] ?? -1) + 1;
    const pn = `${anim}${i}`;
    L.push(`part ${pn}`);
    g.a.forEach((r) => L.push(r.map((c) => (c ? CH[c] : '.')).join('')));
    L.push('end');
  });
  L.push('');
  Object.keys(count).forEach((anim) => {
    L.push(`anim ${anim} fps=${(def.fps && def.fps[anim]) || fps[anim]} ${loop[anim]}`);
    if (anim === 'portrait') L.push('# chân dung: đầu + vai cắt 16×16 từ khung đứng (đã có viền) phóng ×2');
    for (let i = 0; i <= count[anim]; i++) L.push(`frame ${anim}`, `  use ${anim}${i}`, ...(noOut.has(anim) ? [] : ['  outline k']), 'end');
    L.push('');
  });
  fs.writeFileSync(path.join(__dirname, code + '.txt'), L.join('\n'));
}

// ================================================================== CÁC TƯỚNG
const T = require('./_tuong-thuong.js')({ G, M, stamp, DIR, perp, shaft, handPos, WDIR, arm, head, build, torsoPts, legs, fx, spans, linePts });

if (require.main === module) {
  const only = process.argv.slice(2);
  for (const [code, def] of Object.entries(T)) {
    if (only.length && !only.includes(code)) continue;
    emit(code, def);
    console.log('  ✓ ' + code);
  }
}
