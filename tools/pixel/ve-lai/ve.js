// Thư viện vẽ pixel có kiểm soát (claude/ve-lai-pixel) — dùng cho các hình VẼ LẠI thay bản "chuyển ảnh → pixel".
// Mỗi điểm là tên màu trong tools/pixel/palette.txt; vẽ bằng khối hình (chữ nhật, đa giác, elip, đường), mảng lưới vẽ tay
// (stamp) và đổ bóng 3 tông theo nguồn sáng trên-trái. Không nhiễu ngẫu nhiên, không dithering.
// Xuất ra file nguồn build-pixel (tools/pixel/src/<nhóm>/<mã>.txt) — bản thiết kế: docs/pixel/THIET-KE-LAI.md.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const PAL = {};
for (const l of fs.readFileSync(path.join(ROOT, 'tools/pixel/palette.txt'), 'utf8').split('\n')) {
  const m = l.match(/^([a-z-]+)\s+(#[0-9A-Fa-f]{6})/);
  if (m) PAL[m[1]] = m[2];
}
// dải 3–4 tông (tối → sáng) để đổ bóng
const DAI = {
  dong: ['dong-toi', 'dong', 'dong-sang', 'vang-nghe'], vang: ['dong', 'vang-nghe', 'vang-sang', 'sang'],
  son: ['son-toi', 'son', 'son-sang', 'lua'], dat: ['dat-toi', 'dat', 'dat-sang', 'cat'], sat: ['sat-toi', 'sat', 'sat-sang', 'bac'],
  la: ['la-toi', 'la', 'la-ma', 'la-sang'], reu: ['reu-toi', 'reu', 'reu-sang', 'la-sang'], cham: ['cham-toi', 'cham', 'cham-sang', 'nuoc'],
  nuoc: ['cham', 'nuoc', 'nuoc-sang', 'troi'], trang: ['trang-xam', 'trang', 'sang', 'sang'], da: ['da-toi', 'da', 'da-sang', 'da-sang'],
  tim: ['tim-toi', 'tim', 'tim-sang', 'tim-sang'], ngoc: ['cham-toi', 'ngoc', 'ngoc-sang', 'troi'], toi: ['vien', 'toi', 'khoi', 'dat-toi'],
};

class Ve {
  constructor(w, h, nen = null) { this.w = w; this.h = h; this.g = Array.from({ length: h }, () => new Array(w).fill(nen)); }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.g[y][x] : null; }
  p(x, y, c) { x = Math.round(x); y = Math.round(y); if (this.in(x, y)) this.g[y][x] = c === '_' ? null : c; return this; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.p(i, j, c); return this; }
  hl(x1, x2, y, c) { for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) this.p(i, y, c); return this; }
  vl(x, y1, y2, c) { for (let j = Math.min(y1, y2); j <= Math.max(y1, y2); j++) this.p(x, j, c); return this; }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) { this.p(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    return this;
  }
  // đa giác đặc (tâm điểm ảnh nằm trong)
  poly(pts, c) {
    const ys = pts.map((q) => q[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.p(x, y, c);
    }
    return this;
  }
  // elip đặc tâm (cx, cy) bán trục rx, ry (toạ độ tâm ô: cx = 10 nghĩa là giữa điểm 10)
  ell(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / (rx + 0.01), dy = (y - cy) / (ry + 0.01);
      if (dx * dx + dy * dy <= 1.0) this.p(x, y, c);
    }
    return this;
  }
  // vòng elip 1px
  ring(cx, cy, rx, ry, c) {
    const m = new Ve(this.w, this.h); m.ell(cx, cy, rx, ry, 1);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (m.g[y][x] && (!m.get(x - 1, y) || !m.get(x + 1, y) || !m.get(x, y - 1) || !m.get(x, y + 1))) this.p(x, y, c);
    return this;
  }
  // lưới vẽ tay: rows = mảng chuỗi, map = { ký tự: màu }, '.' giữ nguyên, '_' xoá
  stamp(rows, map, x0 = 0, y0 = 0, flip = false) {
    if (typeof rows === 'string') rows = rows.replace(/^\n|\n\s*$/g, '').split('\n').map((r) => r.trim());
    const W = Math.max(...rows.map((r) => r.length));
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.' || ch === ' ') continue; const c = ch === '_' ? '_' : map[ch]; if (!c) throw new Error('stamp: ký tự lạ ' + ch); this.p(x0 + (flip ? W - 1 - i : i), y0 + j, c); } });
    return this;
  }
  // vẽ hình con (Ve khác) đè lên, bỏ điểm trống
  put(v, x0 = 0, y0 = 0, flip = false) { for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) { const c = v.g[y][flip ? v.w - 1 - x : x]; if (c) this.p(x0 + x, y0 + y, c); } return this; }
  // tô lại các điểm đang có màu a (trong vùng tuỳ chọn) bằng màu b
  swap(a, b, f = null) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.g[y][x] === a && (!f || f(x, y))) this.g[y][x] = b; return this; }
  // đổ bóng 3 tông cho mọi điểm màu `goc` (vùng liền): mép trên/trái giáp ngoài → sáng, mép dưới/phải → tối (dày d)
  shade(goc, sang, toi, d = 1, ds = 1) {
    const m = this.g.map((r) => r.map((c) => c === goc));
    const at = (x, y) => this.in(x, y) && m[y][x];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (!m[y][x]) continue;
      let dk = false, lt = false;
      for (let k = 1; k <= d; k++) if (!at(x + k, y) || !at(x, y + k)) dk = true;
      for (let k = 1; k <= ds; k++) if (!at(x - k, y) || !at(x, y - k)) lt = true;
      if (dk && toi) this.g[y][x] = toi; else if (lt && sang) this.g[y][x] = sang;
    }
    return this;
  }
  // viền ngoài 1px quanh mọi điểm có màu (4 hướng) — chỉ ghi vào chỗ trống
  outline(c = 'vien', diag = false) {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.g[y][x]) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].concat(diag ? [[1, 1], [-1, 1], [1, -1], [-1, -1]] : []);
      if (n.some(([a, b]) => this.get(x + a, y + b) && this.get(x + a, y + b) !== c)) add.push([x, y]);
    }
    for (const [x, y] of add) this.g[y][x] = c;
    return this;
  }
  // bóng đổ cứng: điểm trống ngay dưới-phải một điểm có màu → màu bóng (trên nền đã có)
  dropShadow(mask, dx, dy, c) {
    for (let y = this.h - 1; y >= 0; y--) for (let x = this.w - 1; x >= 0; x--) if (mask.get(x - dx, y - dy) && !mask.get(x, y)) this.p(x, y, c);
    return this;
  }
  clone() { const v = new Ve(this.w, this.h); v.g = this.g.map((r) => r.slice()); return v; }
  colors() { const s = new Set(); for (const r of this.g) for (const c of r) if (c) s.add(c); return [...s]; }
  check() { for (const c of this.colors()) if (!PAL[c]) throw new Error('màu ngoài bảng màu: ' + c); return this; }
}

const CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
// ghi file nguồn build-pixel; frames: Ve hoặc mảng Ve (nhiều khung `main`)
function ghi(nhom, ma, ten, moTa, frames, opt = {}) {
  frames = [].concat(frames);
  frames.forEach((f) => f.check());
  const used = [...new Set(frames.flatMap((f) => f.colors()))];
  if (used.length > CH.length) throw new Error('quá nhiều màu');
  const ch = {}; used.forEach((c, i) => (ch[c] = CH[i]));
  const { w, h } = frames[0];
  let s = `# ${ten} — VẼ LẠI tay (claude/ve-lai-pixel), thiết kế: docs/pixel/THIET-KE-LAI.md\n`;
  for (const l of [].concat(moTa)) s += `# ${l}\n`;
  s += `# Nguồn vẽ: tools/pixel/ve-lai/${opt.script || nhom}.js — sửa ở đó rồi chạy lại, đừng sửa tay file này.\n`;
  s += `name: ${ten}\nsize: ${w}x${h}\n`;
  if (opt.anchor) s += `anchor: ${opt.anchor[0]},${opt.anchor[1]}\n`;
  s += 'colors:\n' + used.map((c) => `  ${ch[c]} = ${c}`).join('\n') + '\n\n';
  frames.forEach((f, i) => { s += `part k${i}\n` + f.g.map((r) => r.map((c) => (c ? ch[c] : '.')).join('')).join('\n') + '\nend\n\n'; });
  s += `anim main fps=${opt.fps || 1} ${frames.length > 1 ? 'loop' : 'once'}\n`;
  frames.forEach((f, i) => { s += `frame main\n  use k${i}\nend\n`; });
  const f = path.join(opt.src || path.join(ROOT, 'tools/pixel/src'), nhom, ma + '.txt');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
  return { f, mau: used.length };
}

// xuất PNG xem nhanh (phóng to) — dùng PNG của build-pixel
function png(ve, file, sc = 1, nen = null) {
  const { encodePNG } = require(path.join(ROOT, 'tools/build-pixel.js'));
  const W = ve.w * sc, H = ve.h * sc, buf = Buffer.alloc(W * H * 4);
  const hex = (c) => [1, 3, 5].map((i) => parseInt(PAL[c].slice(i, i + 2), 16));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = ve.g[Math.floor(y / sc)][Math.floor(x / sc)] || nen, o = (y * W + x) * 4;
    if (c) { const [r, g, b] = hex(c); buf[o] = r; buf[o + 1] = g; buf[o + 2] = b; buf[o + 3] = 255; }
  }
  fs.writeFileSync(file, encodePNG(W, H, buf));
}

module.exports = { Ve, ghi, png, PAL, DAI, ROOT };
