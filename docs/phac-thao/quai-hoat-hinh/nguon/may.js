// Máy hoạt hình: cắt hình gốc thành từng bộ phận (càng, chân, đuôi...), xoay / uốn / co giãn từng bộ phận
// theo thời gian, rồi tô lại viền tối cho từng khung. Hình đứng yên giống hệt bản chốt.
const MA = G.monsterArt = { list: [], loi: [], fps: 12, det: 1 };
const DEFS = {}; MA._defs = DEFS;
const PI = Math.PI, TAU = PI * 2;
const sn = u => Math.sin(u * TAU), cs = u => Math.cos(u * TAU);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const EASE = { lin: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t), io: t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t),
  back: t => { const x = t - 1; return 1 + 2.70158 * x * x * x + 1.70158 * x * x; },
  nay: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; } };
// Mốc chuyển động: kf(u, [[0, 0], [.3, -20, 'out'], [1, 0, 'back']]) -> giá trị tại u. Kiểu chuyển: lin, in, out, io (mặc định), back (vọt quá rồi về), nay (nảy).
function kf(u, K) { if (u <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * EASE[b[2] || 'io']((u - a[0]) / ((b[0] - a[0]) || 1)); } return K[K.length - 1][1]; }
// Tiến độ 0..1 của đoạn [a, b] bên trong u.
function seg(u, a, b) { return clamp((u - a) / (b - a), 0, 1); }
// Số ngẫu nhiên cố định 0..1 theo (x, y, s).
function hh(x, y, s) { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 7, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
// Bọc hàm viền của bản chốt để giữ lại lớp "thân chưa viền" (pre) và lớp hiệu ứng vẽ sau viền.
function vien(g) { if (g.pre) g.nhieu = true; else g.pre = g.d.slice(); vien0(g); g.sauVien = g.d.slice(); return g; }
const XOA = '';

// ---------- chuẩn bị hình gốc và mặt nạ bộ phận ----------
const GOC_CACHE = {};
function trongHinh(s, x, y) {
  if (Array.isArray(s)) return x >= s[0] && x < s[2] + 1 && y >= s[1] && y < s[3] + 1;
  if (s.e) { const dx = (x - s.e[0]) / s.e[2], dy = (y - s.e[1]) / s.e[3]; return dx * dx + dy * dy <= 1; }
  if (s.p) { let ins = false; const p = s.p; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) ins = !ins; } return ins; }
  return false;
}
// hv: biến thể hình (vd 'xu' lúc xù gai, 'phong' lúc phồng), do cử động chọn qua an.hinh(u)
function goc(d, ph, hv) {
  const key = d.id + '|' + ph + '|' + (hv || ''); if (GOC_CACHE[key]) return GOC_CACHE[key];
  const g = d.luoi(ph, hv), w = g.w, h = g.h, n = w * h, b = bbox(g);
  const B = { w, h, cx: g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, foot: g.foot != null ? g.foot : b.y1 + 1, bw: b.w, bh: b.h, bb: b, g };
  if (d.chan != null) B.foot = typeof d.chan === 'function' ? d.chan(ph) : d.chan;
  if (d.tam != null) B.cx = typeof d.tam === 'function' ? d.tam(ph) : d.tam;
  B.foot = Math.round(B.foot); B.bh = B.foot - b.y0;
  if (g.pre && !g.nhieu && !d.giuVien) { B.pre = g.pre; B.fxl = new Array(n).fill(null); let co = false; for (let i = 0; i < n; i++) if (g.d[i] !== g.sauVien[i]) { B.fxl[i] = g.d[i] || XOA; co = true; } if (!co) B.fxl = null; B.A = true; }
  else { B.pre = g.d.slice(); B.fxl = null; B.A = false; }
  const occ = i => B.pre[i] || (B.fxl && B.fxl[i]);
  const pd = (typeof d.parts === 'function' ? d.parts(ph, hv) : d.parts) || [];
  B.owner = new Int16Array(n); B.keep = new Uint8Array(n); B.parts = []; B.pi = {};
  pd.forEach((p, k) => { const idx = k + 1, P = { n: p.n, pv: p.pv, z: p.z == null ? 1 : p.z, idx, keep: p.keep == null ? 1.5 : p.keep, cha: p.cha, L: p.L || 0 }; B.parts.push(P); B.pi[p.n] = P;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!occ(i)) continue; let ins = false; for (const s of p.m) { if (s.tru) { if (trongHinh(s.tru, x + .5, y + .5)) ins = false; } else if (trongHinh(s, x + .5, y + .5)) ins = true; }
      if (ins && p.mau && p.mau.indexOf(B.pre[i]) < 0) ins = false; if (ins && p.kmau && p.kmau.indexOf(B.pre[i]) >= 0) ins = false; if (ins) B.owner[i] = idx; } });
  for (const P of B.parts) { let L = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (B.owner[i] !== P.idx) continue; const dd = Math.hypot(x + .5 - P.pv[0], y + .5 - P.pv[1]); if (dd > L) L = dd; if (dd <= P.keep) B.keep[i] = 1; } if (!P.L) P.L = Math.max(1, L);
    P.chain = []; let q = P, guard = 0; while (q && guard++ < 8) { P.chain.unshift(q.idx); q = q.cha ? B.pi[q.cha] : null; } }
  B.M = Math.ceil(Math.max(b.w, B.bh) * (d.le || .3)) + 10;
  return GOC_CACHE[key] = B;
}
MA._goc = (id, ph, hv) => goc(DEFS[id], ph || 1, hv);

// ---------- tư thế ----------
function Pose(d, B, anim, u, t, o, dir, face, ph) {
  this.d = d; this.B = B; this.anim = anim; this.u = u; this.t = t; this.o = o; this.dir = dir; this.face = face; this.phase = ph;
  this.fx = Math.cos(dir); this.fy = Math.sin(dir); this.aim = this.fy < -.5 ? -1 : this.fy > .5 ? 1 : 0;
  this.x = 0; this.y = 0; this.h = d.bay ? (d.cao || 8) : 0; this.sx = 1; this.sy = 1; this.rot = 0; this.sh = 0; this.a = 1; this.flash = 0; this.tint = null; this.tan = null; this.bong = 1;
  this.p = {}; this._u = []; this._o = []; this.bongMa = null;
}
Pose.prototype = {
  P(n) { return this.p[n] || (this.p[n] = { r: 0, dx: 0, dy: 0, sx: 1, sy: 1, b: 0, w: 0, wp: 0, wk: .3 }); },
  // xoay bộ phận n thêm deg độ (dương = theo chiều kim đồng hồ trên hình gốc mặt quay trái)
  r(n, deg) { this.P(n).r += deg; return this; },
  // dời bộ phận (theo hệ hình gốc: x âm = về phía trước mặt)
  m(n, dx, dy) { const q = this.P(n); q.dx += dx || 0; q.dy += dy || 0; return this; },
  // uốn cong dần về phía ngọn (đuôi, râu, tua): ngọn lệch deg độ
  b(n, deg) { this.P(n).b += deg; return this; },
  // lượn sóng dọc bộ phận: biên độ deg, pha (vòng 0..1), độ dày sóng
  w(n, deg, pha, k) { const q = this.P(n); q.w = deg; q.wp = (pha || 0) * TAU; if (k) q.wk = k; return this; },
  // co giãn bộ phận quanh khớp
  s(n, sx, sy) { const q = this.P(n); q.sx *= sx; q.sy *= (sy == null ? sx : sy); return this; },
  // nhún thở: thân phình / xẹp quanh chân
  tho(amp, u) { const v = sn(u == null ? this.u : u) * (amp || .03); this.sy *= 1 + v; this.sx *= 1 - v * .7; return this; },
  // tiến n điểm ảnh về phía mặt đang quay; theo(n): tiến theo hướng đòn (dir)
  tien(n) { this.x += n * this.face; return this; },
  theo(n) { this.x += n * this.fx; this.y += n * this.fy * MA.det; return this; },
  // đổi điểm trên hình gốc (sx, sy) thành toạ độ quanh chân quái (đã tính lật mặt, độ cao)
  pt(sx, sy) { const B = this.B; return [this.x + (B.cx - sx) * this.face, this.y - this.h + (sy - B.foot)]; },
  under(f) { this._u.push(f); return this; }, over(f) { this._o.push(f); return this; },
  // hiệu ứng mặc định của đòn thường (vùng báo trước, vệt chém, đạn...) theo d.don
  fxBao(u) { DON.bao(this, u == null ? this.u : u); return this; }, fxDon(u) { DON.don(this, u == null ? this.u : u); return this; },
};

// ---------- dựng một khung hình từ tư thế ----------
function ghepHinh(B, P) {
  const M = B.M, w = B.w, h = B.h, W = w + 2 * M, H = h + 2 * M, o1 = new Array(W * H).fill(null), o2 = B.fxl ? new Array(W * H).fill(null) : null;
  const rot = -(P.rot || 0) * PI / 180, cr = Math.cos(rot), sr = Math.sin(rot), sx = P.sx || .001, sy = P.sy || .001, sh = P.sh || 0, Hh = B.bh || 1;
  const T = [], moved = new Uint8Array(B.parts.length + 1);
  for (const p of B.parts) { const q = P.p[p.n]; if (q && (q.r || q.dx || q.dy || q.b || q.w || q.sx !== 1 || q.sy !== 1)) T[p.idx] = { px: p.pv[0], py: p.pv[1], r: q.r * PI / 180, dx: q.dx, dy: q.dy, sx: q.sx || .001, sy: q.sy || .001, b: q.b * PI / 180, w: q.w * PI / 180, wp: q.wp, wk: q.wk, L: p.L }; }
  const up = [], dn = [];
  for (const p of B.parts) { let mv = false; for (const k of p.chain) if (T[k]) mv = true; if (mv) { moved[p.idx] = 1; (p.z >= 0 ? up : dn).push(p); } }
  up.sort((a, b) => b.z - a.z); dn.sort((a, b) => b.z - a.z);
  const owner = B.owner, keep = B.keep, pre = B.pre, fxl = B.fxl; let qx = 0, qy = 0;
  const inv = (p, x, y) => { for (const k of p.chain) { const t = T[k]; if (!t) continue; let vx = x - t.dx - t.px, vy = y - t.dy - t.py; const dd = Math.hypot(vx, vy), f = dd / t.L, a = t.r + t.b * Math.min(1.6, f) + (t.w ? t.w * Math.sin(t.wp + dd * t.wk) * Math.min(1, f) : 0), c = Math.cos(a), s = Math.sin(a); const rx = vx * c + vy * s, ry = -vx * s + vy * c; x = t.px + rx / t.sx; y = t.py + ry / t.sy; } qx = x; qy = y; };
  const plain = !rot && sx === 1 && sy === 1 && !sh;
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    let px, py; if (plain) { px = X + .5 - M; py = Y + .5 - M; } else { const ax = X + .5 - M - B.cx, ay = Y + .5 - M - B.foot; let bx = ax * cr - ay * sr, by = ax * sr + ay * cr; by /= sy; bx /= sx; bx += sh * by / Hh; px = B.cx + bx; py = B.foot + by; }
    let hit = -1;
    for (let k = 0; k < up.length; k++) { const p = up[k]; inv(p, px, py); const cx = Math.floor(qx), cy = Math.floor(qy); if (cx >= 0 && cy >= 0 && cx < w && cy < h && owner[cy * w + cx] === p.idx) { hit = cy * w + cx; break; } }
    if (hit < 0) { const cx = Math.floor(px), cy = Math.floor(py); if (cx >= 0 && cy >= 0 && cx < w && cy < h) { const i = cy * w + cx, ow = owner[i]; if ((pre[i] || (fxl && fxl[i])) && (!ow || keep[i] || !moved[ow])) hit = i; } }
    if (hit < 0) for (let k = 0; k < dn.length; k++) { const p = dn[k]; inv(p, px, py); const cx = Math.floor(qx), cy = Math.floor(qy); if (cx >= 0 && cy >= 0 && cx < w && cy < h && owner[cy * w + cx] === p.idx) { hit = cy * w + cx; break; } }
    if (hit >= 0) { o1[Y * W + X] = pre[hit]; if (o2) o2[Y * W + X] = fxl[hit]; }
  }
  const F = { w: W, h: H, d: o1 };
  if (B.A) { vien0(F); if (o2) for (let i = 0; i < o2.length; i++) if (o2[i] != null) F.d[i] = o2[i] === XOA ? null : o2[i]; }
  F.ox = M + B.cx; F.oy = M + B.foot; return F;
}
MA._ghep = ghepHinh;
function taoCanvas(w, h) { let cv; if (typeof document !== 'undefined') { cv = document.createElement('canvas'); cv.width = w; cv.height = h; } else cv = new OffscreenCanvas(w, h); return cv; }
// Các kiểu tan rã / hiện hình ở mức điểm ảnh. T = {k: kiểu, u: 0..1, mau: [màu hạt]}
function tanRa(put, F, T, B, E) {
  const W = F.w, H = F.h, u = clamp(T.u, 0, 1), k = T.k, mau = T.mau || ['#ffffff'], ox = F.ox, oy = F.oy, bh = B.bh, bw = B.bw, top = oy - bh, size = Math.max(bw, bh), mcx = ox, mcy = oy - bh / 2, sd = T.hat || 0;
  const cs2 = Math.max(2, Math.round(size / 9));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let c = F.d[y * W + x]; if (!c) continue; const r = hh(x, y, sd); let nx = x, ny = y;
    if (k === 'vo' || k === 'no') { const q = k === 'vo' ? cs2 : (T.co || 1), gx = Math.floor(x / q), gy = Math.floor(y / q), r1 = hh(gx, gy, 1), r2 = hh(gx, gy, 2), r3 = hh(gx, gy, 3); if (u > .45 + .55 * r3) continue;
      let dx = (gx + .5) * q - mcx, dy = (gy + .5) * q - mcy; const dl = Math.hypot(dx, dy) || 1; dx = dx / dl + (r1 - .5) * .9; dy = dy / dl + (r2 - .5) * .9 - (k === 'vo' ? .5 : 0); const e = 1 - (1 - u) * (1 - u), sp = size * (k === 'vo' ? .55 : .95) * (.35 + .65 * r1);
      nx = x + dx * sp * e; ny = y + dy * sp * e + (k === 'vo' ? size * .9 * u * u : 0); if (k === 'vo' && ny > oy - 1) ny = oy - 1 - (r2 * 2 | 0); if (u < .1 && !T.hien) c = '#ffffff'; else if (r > 1.25 - u) c = mau[(r1 * mau.length) | 0]; }
    else if (k === 'tan') { if (r < u * 1.25 - .3) continue; const e = Math.pow(1 - u, 1.6); ny = oy - (oy - y) * (e * .95 + .05) ; nx = mcx + (x - mcx) * (1 + u * .9) + Math.sin(y * .7 + u * 9) * u * 1.5; if (r > 1.3 - u * 1.2) c = mau[(r * 7 % 1 * mau.length) | 0]; }
    else if (k === 'chay') { const yb = top - 4 + u * (bh + 12), dd = yb - y; if (dd > 0) { const life = dd / (8 + r * 14); if (life > 1 || r < .45) continue; ny = y - dd * (.5 + r) * .8; nx = x + Math.sin(dd * .4 + r * 6) * 2 * life; c = mau[Math.min(mau.length - 1, (life * mau.length) | 0)]; } else if (dd > -2) c = '#fff6b0'; else if (dd > -5 && r < .6) c = '#ff8a1e'; }
    else if (k === 'ra') { const del = r * .45 + (y - top) / bh * .15, tt = u - del; if (tt > 0) { ny = Math.min(oy - 1 - ((r * 3) | 0), y + size * 2.4 * tt * tt); nx = x + (hh(x, y, 5) - .5) * tt * size * .5; if (ny >= oy - 3) { if (u > .7 + r * .3) continue; c = mau[(r * mau.length) | 0]; } } }
    else if (k === 'hon') { if (r < u * 1.2 - .12) continue; const a = u * (.4 + r) * size * .9; ny = y - a; nx = x + Math.sin(u * 7 + r * 6 + y * .2) * 4 * u; if (r * .8 + .1 < u) c = mau[(hh(x, y, 4) * mau.length) | 0]; }
    else if (k === 'chim') { ny = y + Math.round(u * (bh + 2)); if (ny >= oy) continue; }
    else if (k === 'bui') { const del = (T.trai ? (x - (ox - bw / 2)) : ((ox + bw / 2) - x)) / bw * .45 + r * .2, tt = u - del; if (tt > 0) { if (tt > .25 + r * .3) continue; nx = x + (T.trai ? -1 : 1) * tt * size * 1.6 * (.5 + r); ny = y + Math.sin(tt * 14 + r * 6) * 3 - tt * size * (T.len == null ? .4 : T.len); c = mau[(r * mau.length) | 0]; } }
    else if (k === 'tu') { const a = r * TAU, e = 1 - u, dist = size * 1.1 * e * e * (.3 + hh(x, y, 2)); if (u < r * .5) continue; nx = x + Math.cos(a + e * 3) * dist; ny = y + Math.sin(a + e * 3) * dist; if (e > .25) c = mau[(r * mau.length) | 0]; }
    else if (k === 'heo') { const del = r * .5; if (u > del + .15) { const lum = (parseInt(c.slice(1, 3), 16) * .3 + parseInt(c.slice(3, 5), 16) * .5 + parseInt(c.slice(5, 7), 16) * .2) || 0; c = mau[clamp((lum / 256 * mau.length) | 0, 0, mau.length - 1)]; } const tt = u - .5 - r * .3; if (tt > 0) { ny = Math.min(oy - 1, y + size * 2.2 * tt * tt); nx = x + Math.sin(tt * 12 + r * 6) * 3; if (ny >= oy - 1 && u > .85) continue; } }
    else if (k === 'quet') { const yb = top + (T.len ? (1 - u) : u) * (bh + 2); if (T.len ? y < yb : y > yb) continue; if (Math.abs(y - yb) < 2) c = mau[0]; }
    put(nx, ny, c); }
}
const KHUNG = new Map();
function veKhung(B, P, key) {
  let fr = key && KHUNG.get(key); if (fr) return fr;
  const F = ghepHinh(B, P), E = P.tan ? Math.ceil(Math.max(B.bw, B.bh) * .7) + 16 : 0, cv = taoCanvas(F.w + 2 * E, F.h + 2 * E), c = cv.getContext('2d'); let last = null;
  const put = (x, y, col) => { if (col !== last) { c.fillStyle = col; last = col; } c.fillRect(Math.round(x) + E, Math.round(y) + E, 1, 1); };
  if (P.tan) tanRa(put, F, P.tan, B, E);
  else for (let y = 0; y < F.h; y++) { let x = 0; while (x < F.w) { const col = F.d[y * F.w + x]; if (!col) { x++; continue; } let x1 = x + 1; while (x1 < F.w && F.d[y * F.w + x1] === col) x1++; if (col !== last) { c.fillStyle = col; last = col; } c.fillRect(x + E, y + E, x1 - x, 1); x = x1; } }
  fr = { cv, ox: Math.round(F.ox) + E, oy: Math.round(F.oy) + E, sil: {} };
  if (key) { if (KHUNG.size > 2500) KHUNG.clear(); KHUNG.set(key, fr); } return fr;
}
function bongHinh(fr, col) { let s = fr.sil[col]; if (s) return s; s = taoCanvas(fr.cv.width, fr.cv.height); const c = s.getContext('2d'); c.drawImage(fr.cv, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, s.width, s.height); return fr.sil[col] = s; }

// ---------- bộ vẽ hiệu ứng kiểu điểm ảnh (toạ độ quanh chân quái; mọi thứ xoay được theo góc bất kỳ) ----------
const F = MA.fx = {};
F.px = (c, x, y, col, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); };
F.a = (c, a) => { c.globalAlpha = clamp(a, 0, 1); };
F.duong = (c, x0, y0, x1, y1, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), o = Math.floor(th / 2); for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n) - o, Math.round(y0 + (y1 - y0) * i / n) - o, th, th); };
F.elip = (c, x, y, rx, ry, col) => { c.fillStyle = col; x = Math.round(x); y = Math.round(y); for (let j = -Math.ceil(ry); j <= ry; j++) { const t = 1 - (j * j) / (ry * ry || 1); if (t < 0) continue; const hw = Math.round(rx * Math.sqrt(t)); if (hw > 0) c.fillRect(x - hw, y + j, hw * 2, 1); else if (rx >= .5) c.fillRect(x, y + j, 1, 1); } };
F.dia = (c, x, y, r, col) => F.elip(c, x, y, r, r, col);
F.vong = (c, x, y, rx, ry, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.ceil(TAU * Math.max(rx, ry, 1) * 1.3); for (let i = 0; i < n; i++) { const a = i / n * TAU; c.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), th, th); } };
F.cung = (c, x, y, r, a0, a1, col, th) => { c.fillStyle = col; th = th || 1; const n = Math.ceil(Math.abs(a1 - a0) * Math.max(r, 1) * 1.4) + 1; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; c.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * MA.det), th, th); } };
F.cau = (c, x, y, r, cols) => { F.dia(c, x, y, r, cols[0]); if (r >= 2) F.dia(c, x - r * .15, y - r * .2, r * .7, cols[1] || cols[0]); if (cols[2]) F.px(c, x - r * .4, y - r * .5, cols[2], Math.max(1, Math.round(r * .35)), Math.max(1, Math.round(r * .3))); };
F.sao = (c, x, y, r, col) => { c.fillStyle = col; x = Math.round(x); y = Math.round(y); c.fillRect(x - r, y, r * 2 + 1, 1); c.fillRect(x, y - r, 1, r * 2 + 1); };
// Vệt chém hình lưỡi liềm: tâm (x, y), bán kính r, hướng dir, độ mở span (radian), u = tiến độ 0..1 (vệt quét rồi mờ), cols = [đậm, vừa, sáng]
F.liem = (c, x, y, r, dir, span, u, cols, day) => { cols = cols || ['#7cc4ee', '#dff4ff', '#ffffff']; day = day || Math.max(3, r * .28); const sw = clamp(u / .45, 0, 1), fade = clamp((u - .45) / .55, 0, 1), a0 = dir - span / 2, a1 = a0 + span * sw, n = Math.ceil(span * r * 1.5);
  for (let i = 0; i <= n; i++) { const a = a0 + span * i / n; if (a > a1) break; const f = i / n, tail = (a1 - a) / span; if (tail > 1 - fade * .95) continue; const wd = day * Math.sin(PI * f) * (1 - fade * .5); for (let k = 0; k < wd; k++) { const rr = r - k, col = k < 1 ? cols[2] : k < wd * .5 ? cols[1] : cols[0]; if (fade > .5 && ((i + k) & 1)) continue; c.fillStyle = col; c.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr * MA.det), 1, 1); } } };
// Tia sét / vết nứt gấp khúc
F.set = (c, x0, y0, x1, y1, seed, col, th, lech) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 6)); let px = x0, py = y0; const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1; for (let i = 1; i <= n; i++) { const f = i / n, o = i < n ? (hh(i, seed, 3) - .5) * (lech || 6) : 0, qx = x0 + (x1 - x0) * f + nx / nl * o, qy = y0 + (y1 - y0) * f + ny / nl * o; F.duong(c, px, py, qx, qy, col, th); px = qx; py = qy; } };
// Chùm hạt bắn ra: n hạt, seed, u 0..1; o = {v: quãng bay, g: rơi, goc: hướng giữa, xoe: độ xoè, cols, to: cỡ hạt}
F.hat = (c, x, y, n, seed, u, o) => { o = o || {}; const cols = o.cols || ['#ffffff'], v = o.v || 16, xoe = o.xoe == null ? TAU : o.xoe, g = o.g || 0; for (let i = 0; i < n; i++) { const r1 = hh(i, seed, 1), r2 = hh(i, seed, 2), r3 = hh(i, seed, 3); if (u > .45 + .55 * r3 || u <= 0) continue; const a = (o.goc || 0) + (r1 - .5) * xoe, e = 1 - (1 - u) * (1 - u), sp = v * (.35 + .65 * r2), s = (o.to || 1) > 1 && u < .5 ? o.to : 1; c.fillStyle = cols[Math.min(cols.length - 1, (u * cols.length) | 0)]; c.fillRect(Math.round(x + Math.cos(a) * sp * e), Math.round(y + Math.sin(a) * sp * e * (o.det || 1) + g * u * u), s, s); } };
// Ngọn lửa bập bùng: gốc (x, y), rộng w, cao h, t giây, cols từ ngoài vào trong
F.lua = (c, x, y, w, h, t, cols, seed) => { cols = cols || ['#c43c10', '#ff8a1e', '#ffd23c', '#fff6b0']; for (let L = 0; L < cols.length; L++) { const f = 1 - L / cols.length * .85, hh2 = h * f, ww = w * f; c.fillStyle = cols[L]; for (let j = 0; j < hh2; j++) { const q = j / hh2, wd = ww * (1 - q) * (.75 + .25 * Math.sin(t * 13 + j * .9 + (seed || 0))), off = Math.sin(t * 9 + j * .45 + (seed || 0) * 2) * q * w * .28; if (wd >= .6) c.fillRect(Math.round(x + off - wd / 2), Math.round(y - j - 1), Math.max(1, Math.round(wd)), 1); } } };
// Cụm khói / bụi nở ra rồi tan
F.khoi = (c, x, y, r, u, cols, seed, n) => { cols = cols || ['#8a8290', '#48424e']; n = n || 5; for (let i = 0; i < n; i++) { const a = hh(i, seed || 0, 1) * TAU, d = r * (.2 + .8 * u) * (.4 + hh(i, seed || 0, 2)), rr = r * .45 * (1 - u) * (.6 + hh(i, seed || 0, 3)); if (rr < .6) continue; F.dia(c, x + Math.cos(a) * d, y + Math.sin(a) * d * .6 - u * r * .5, rr, cols[i % cols.length]); } };
// Vòng sóng lan trên sàn
F.song = (c, x, y, r, u, cols, th) => { cols = cols || ['#ffffff', '#9fd8f5']; const a = 1 - u; if (a <= 0) return; c.save(); c.globalAlpha *= Math.min(1, a * 1.6); F.vong(c, x, y, r * u, r * u * MA.det, cols[0], th || 2); if (u > .15) F.vong(c, x, y, r * u * .8, r * u * .8 * MA.det, cols[1] || cols[0], 1); c.restore(); };
// Vẽ một lưới hình nhỏ (đạn, mảnh...) tâm tại (x, y), xoay rot radian, phóng s
F.luoi = (c, g, x, y, o) => { o = o || {}; const rot = o.rot || 0, s = o.s || 1, b = g.bb || (g.bb = bbox(g)), mx = (b.x0 + b.x1 + 1) / 2, my = (b.y0 + b.y1 + 1) / 2, R = Math.ceil(Math.hypot(b.w, b.h) / 2 * s) + 1, cr = Math.cos(-rot), sr = Math.sin(-rot); let last = null;
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { let ux = (i * cr - j * sr) / s, uy = (i * sr + j * cr) / s; if (o.lat) ux = -ux; const gx = Math.floor(mx + ux), gy = Math.floor(my + uy); if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) continue; const col = g.d[gy * g.w + gx]; if (!col) continue; if (col !== last) { c.fillStyle = o.mau || col; last = col; } c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); } };
// --- vùng báo trước trên sàn (đỏ, đầy dần theo u, chớp sáng khi sắp ra đòn) ---
MA.mauBao = ['rgba(255,60,40,.16)', 'rgba(255,70,45,.34)', '#ff5a46', '#ffe9c8'];
function baoTo(c, x0, y0, x1, y1, trong, u, r0) { const m = MA.mauBao, chop = u > .78 && ((u * 24) | 0) % 2 === 0;
  for (let y = Math.floor(y0); y <= y1; y++) { let run = -1, lv = 0; for (let x = Math.floor(x0); x <= x1 + 1; x++) { const v = x <= x1 ? trong(x + .5, y + .5) : 0; if (v !== lv) { if (lv) { c.fillStyle = lv === 3 ? (chop ? m[3] : m[2]) : m[lv - 1]; c.fillRect(run, y, x - run, 1); } run = x; lv = v; } } } }
// Quạt: tâm (x, y), bán kính r, hướng dir, độ mở span
F.baoQuat = (c, x, y, r, dir, span, u) => { if (MA._tatBao) return; const kd = MA.det, ru = r * clamp(u * 1.15, 0, 1); baoTo(c, x - r - 1, y - r * kd - 1, x + r + 1, y + r * kd + 1, (px, py) => { const dx = px - x, dy = (py - y) / kd, d = Math.hypot(dx, dy); if (d > r) return 0; let da = Math.atan2(dy, dx) - dir; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > span / 2) return 0; if (d > r - 1.2 || (Math.abs(da) > span / 2 - 1.3 / Math.max(d, 1) && span < TAU - .01)) return 3; return d <= ru ? 2 : 1; }, u); };
// Đường thẳng: từ (x, y) theo hướng dir, dài len, rộng rong
F.baoDuong = (c, x, y, len, rong, dir, u) => { if (MA._tatBao) return; const kd = MA.det, cxx = Math.cos(dir), sy = Math.sin(dir), lu = len * clamp(u * 1.15, 0, 1), R = len + rong; baoTo(c, x - R, y - R, x + R, y + R, (px, py) => { const dx = px - x, dy = (py - y) / kd, al = dx * cxx + dy * sy, ac = -dx * sy + dy * cxx; if (al < 0 || al > len || Math.abs(ac) > rong / 2) return 0; if (al < 1.2 || al > len - 1.2 || Math.abs(ac) > rong / 2 - 1.2) return 3; return al <= lu ? 2 : 1; }, u); };
// Vòng tròn: tâm (x, y), bán kính r
F.baoTron = (c, x, y, r, u) => F.baoQuat(c, x, y, r, 0, TAU, u);

// ---------- hiệu ứng đòn thường mặc định, theo d.don = {kieu, tam, mau, rong, xoe, mom: [x, y] trên hình gốc} ----------
const DON = {
  mom(P) { const d = P.d.don || {}, B = P.B; return d.mom ? P.pt(d.mom[0], d.mom[1]) : [P.x, P.y - P.h - B.bh * .45]; },
  bao(P, u) { const d = P.d.don || {}, k = d.kieu || 'chem', tam = d.tam || 24, dir = P.dir;
    P.under(c => { if (k === 'chem') F.baoQuat(c, 0, 0, tam, dir, d.xoe || 1.9, u); else if (k === 'lao') F.baoDuong(c, 0, 0, tam, d.rong || Math.max(10, P.B.bw * .6), dir, u); else if (k === 'ban') F.baoDuong(c, 0, 0, tam, d.rong || 5, dir, u);
      else if (k === 'no' || k === 'gai' || k === 'dap') F.baoTron(c, 0, 0, tam, u); else if (k === 'phun') F.baoQuat(c, 0, 0, tam, dir, d.xoe || 1.1, u); else if (k === 'nem') F.baoTron(c, Math.cos(dir) * tam, Math.sin(dir) * tam * MA.det, d.rong || 12, u); });
    if (k === 'ban' || k === 'phun' || k === 'nem') P.over(c => { const m = DON.mom(P), cols = d.mau || ['#7cc4ee', '#dff4ff', '#ffffff']; F.hat(c, m[0], m[1], 6, 11, 1 - (u * 3 % 1), { v: -7, cols: [cols[1], cols[2] || cols[1]] }); F.dia(c, m[0], m[1], 1 + u * 2, cols[1]); F.px(c, m[0], m[1], '#ffffff'); }); },
  don(P, u) { const d = P.d.don || {}, k = d.kieu || 'chem', tam = d.tam || 24, dir = P.dir, cols = d.mau || ['#7cc4ee', '#dff4ff', '#ffffff'], dx = Math.cos(dir), dy = Math.sin(dir) * MA.det, B = P.B;
    if (k === 'chem') P.over(c => { F.liem(c, dx * 4, dy * 4 - B.bh * .3, tam - 3, dir, d.xoe || 1.9, u, cols); });
    else if (k === 'lao') P.under(c => { for (let i = 0; i < 5; i++) { const f = (i + 1) / 6, a = (1 - u) * (1 - f); if (a <= .05) continue; c.globalAlpha = a; F.duong(c, P.x - dx * (6 + f * tam * .7) - dy * (i - 2) * 3, P.y - dy * (6 + f * tam * .7) + dx * (i - 2) * 3 - B.bh * .3, P.x - dx * (10 + f * tam * .9) - dy * (i - 2) * 3, P.y - dy * (10 + f * tam * .9) + dx * (i - 2) * 3 - B.bh * .3, cols[1], 1); } c.globalAlpha = 1; F.khoi(c, P.x - dx * 8, P.y - dy * 8, 7, u, ['#8a8290', '#5a5460'], 3); });
    else if (k === 'ban') P.over(c => { const m = DON.mom(P), q = seg(u, .1, .85), x = m[0] + dx * tam * q, y = m[1] + dy * tam * q; if (u < .25) F.hat(c, m[0], m[1], 8, 5, u * 4, { v: 9, goc: dir, xoe: 1.4, cols: [cols[2] || cols[1], cols[1]] }); if (q < 1) { for (let i = 1; i < 5; i++) { c.globalAlpha = .7 - i * .15; F.dia(c, x - dx * i * 3, y - dy * i * 3, (d.co || 2.5) * (1 - i * .18), cols[0]); } c.globalAlpha = 1; F.cau(c, x, y, d.co || 2.5, cols); } else F.hat(c, m[0] + dx * tam, m[1] + dy * tam, 10, 7, seg(u, .85, 1), { v: 10, cols: [cols[2] || '#fff', cols[1], cols[0]] }); });
    else if (k === 'no') P.over(c => { const cy = -P.h - B.bh * .4; if (u < .22) { F.dia(c, 0, cy, tam * (.25 + u * 2.4), cols[1]); F.dia(c, 0, cy, tam * (.15 + u * 2), cols[2] || '#fff'); } else if (u < .55) { const e = seg(u, .22, .55); F.vong(c, 0, cy, tam * (.8 + e * .3), tam * (.8 + e * .3), cols[1], Math.max(1, Math.round(4 * (1 - e)))); F.a(c, 1 - e); F.dia(c, 0, cy, tam * .45 * (1 - e), cols[2] || '#fff'); F.a(c, 1); } F.song(c, 0, 0, tam, seg(u, .05, .8), [cols[2] || '#fff', cols[1]], 2); F.hat(c, 0, cy, 26, 9, u, { v: tam * 1.1, cols: [cols[2] || '#fff', cols[1], cols[0]], to: 2 }); F.khoi(c, 0, cy, tam * .7, seg(u, .2, 1), [cols[0], '#48424e'], 4, 7); });
    else if (k === 'gai') P.over(c => { const cy = -P.h - B.bh * .4, q = seg(u, 0, .6), n = d.so || 8; for (let i = 0; i < n; i++) { const a = dir + i / n * TAU, r0 = B.bw * .35 + (tam - B.bw * .35) * q, x = Math.cos(a) * r0, y = cy + Math.sin(a) * r0 * MA.det; if (q < 1) { F.duong(c, x - Math.cos(a) * 5, y - Math.sin(a) * 5, x, y, cols[1], 1); F.px(c, x, y, cols[2] || '#fff'); F.px(c, x - Math.cos(a) * 6, y - Math.sin(a) * 6, cols[0]); } else F.hat(c, x, y, 3, i, seg(u, .6, 1), { v: 5, cols: [cols[1]] }); } });
    else if (k === 'dap') { P.under(c => { F.song(c, 0, 0, tam, seg(u, .1, .9), [cols[2] || '#fff', cols[1]], 2); F.song(c, 0, 0, tam * .7, seg(u, .25, 1), [cols[1], cols[0]], 1); }); P.over(c => { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .3; F.hat(c, Math.cos(a) * tam * .5 * u, Math.sin(a) * tam * .5 * u * MA.det, 3, i, u, { v: 8, goc: -PI / 2, xoe: 1.2, g: 14, cols: [cols[1], cols[0]] }); } }); }
    else if (k === 'phun') P.over(c => { const m = DON.mom(P), xo = d.xoe || 1.1, n = d.so || 34; for (let i = 0; i < n; i++) { const r1 = hh(i, 3, 1), r2 = hh(i, 3, 2), ph = (u * 1.6 + r2) % 1, a = dir + (r1 - .5) * xo, rr = (tam - 6) * ph * (u < .8 ? 1 : 1); if (u > .75 && ph < seg(u, .75, 1)) continue; if (u < .2 && ph > u * 5) continue; c.fillStyle = cols[(i + ((ph * 3) | 0)) % cols.length]; const s = ph < .6 ? 2 : 1; c.fillRect(Math.round(m[0] + Math.cos(a) * (6 + rr)), Math.round(m[1] + Math.sin(a) * (6 + rr) * MA.det + ph * ph * (d.roi == null ? 6 : d.roi)), s, s); } });
    else if (k === 'nem') { const tx = dx * tam, ty = dy * tam; P.over(c => { const m = DON.mom(P), q = seg(u, .08, .62); if (q < 1) { const x = lerp(m[0], tx, q), y = lerp(m[1], ty, q) - Math.sin(q * PI) * (d.vong || 22); c.globalAlpha = .3; F.elip(c, lerp(m[0], tx, q), lerp(P.y, ty, q), 3, 1.5, '#000000'); c.globalAlpha = 1; if (d.dan) d.dan(c, x, y, q, P); else { F.cau(c, x, y, d.co || 3, cols); F.px(c, x - dx * 3, y - 3, cols[2] || '#fff'); } } else { const e = seg(u, .62, 1); if (e < .35) F.dia(c, tx, ty - 3, (d.rong || 12) * (.4 + e * 1.6), cols[2] || '#fff'); F.song(c, tx, ty, (d.rong || 12) * 1.1, e, [cols[2] || '#fff', cols[1]], 2); F.hat(c, tx, ty - 3, 18, 6, e, { v: (d.rong || 12) * 1.3, cols: [cols[2] || '#fff', cols[1], cols[0]], to: 2 }); } }); }
  },
};
MA._don = DON;

// ---------- chiêu dùng chung (tinh anh, trùm). Mọi chiêu đều xoay theo P.dir bất kỳ ----------
const CHIEU = MA.chieu = {
  // Lao n lần liên tiếp, mỗi lần lệch hướng một chút (zíc zắc). Mỗi lần: 45% báo trước (vệt đỏ), rồi lao tới và lùi về.
  laoNhieu(P, n, tam, rong, cols, lech) { const u = P.u, k = Math.min(n - 1, Math.floor(u * n)), q = u * n - k, dir = P.dir + (k - (n - 1) / 2) * (lech == null ? .55 : lech), ex = Math.cos(dir), ey = Math.sin(dir) * MA.det, bh = P.B.bh;
    cols = cols || ['#8a8290', '#cbc3c0', '#ffffff'];
    if (q < .45) { const v = q / .45; P.under(c => F.baoDuong(c, 0, 0, tam, rong, dir, v)); P.x -= ex * 3 * v; P.y -= ey * 3 * v; P.sy *= 1 - .08 * v; P.sx *= 1 + .06 * v; if (v > .5) P.x += ((u * 48 | 0) % 2 ? .6 : -.6); }
    else { const v = (q - .45) / .55, f = kf(v, [[0, 0], [.35, 1, 'out'], [.7, 1], [1, 0, 'io']]); P.x += ex * (tam - 6) * f; P.y += ey * (tam - 6) * f; P.sx *= v < .35 ? 1.12 : 1; P.sy *= v < .35 ? .9 : 1;
      if (v < .5) { P.bongMa = [1, 2, 3].map(i => ({ x: -ex * i * 6, y: -ey * i * 6, a: .32 - i * .08, mau: cols[1] })); const ox = P.x, oy = P.y; P.under(c => { for (let i = 0; i < 4; i++) { const o = (i - 1.5) * 3; F.a(c, .6 - v); F.duong(c, ox - ex * 6 - ey * o, oy - ey * 6 + ex * o - bh * .35, ox - ex * (16 + i * 4) - ey * o, oy - ey * (16 + i * 4) + ex * o - bh * .35, cols[1], 1); } F.a(c, 1); F.khoi(c, ox - ex * 10, oy - ey * 10, 7, v * 2, [cols[0], '#48424e'], k + 3); }); }
      if (v > .3 && v < .6) { const tx = ex * tam, ty = ey * tam; P.over(c => F.hat(c, tx, ty - bh * .4, 10, k * 7 + 1, (v - .3) / .3, { v: 12, cols: [cols[2], cols[1], cols[0]] })); } } },
  // Xoay tròn chém quanh mình: hình lật qua lại như đang quay, vệt chém tròn.
  xoay(P, tam, cols, vong) { const u = P.u, bh = P.B.bh; vong = vong || 2; cols = cols || ['#c43c10', '#ffd23c', '#fff6b0'];
    if (u < .35) { const v = u / .35; P.under(c => F.baoTron(c, 0, 0, tam, v)); P.sy *= 1 - .1 * v; P.sx *= 1 + .08 * v; P.rot += -12 * v; }
    else { const v = (u - .35) / .65, a = EASE.out(Math.min(1, v * 1.25)) * vong; const cc = Math.cos(a * TAU); P.sx *= Math.sign(cc || 1) * Math.max(.2, Math.abs(cc)); P.rot += 8 * (1 - v);
      P.over(c => { for (let i = 0; i < vong; i++) { const w = clamp(v * 1.25 * vong - i, 0, 1); if (w > 0 && w < 1) F.liem(c, 0, -bh * .3, tam - 3, P.dir + i * PI + w * TAU, TAU * .85, w, cols, 5); } if (v > .2) F.song(c, 0, 0, tam, seg(v, .2, 1), [cols[2], cols[1]], 2); }); } },
  // Mưa đạn: bắn n quả bay vòng cung, rơi vào n vùng tròn quanh hướng dir; dan(c, x, y, q) vẽ quả đạn (bỏ trống: quả cầu màu cols).
  muaNem(P, n, tam, rong, cols, dan, sauNo) { const u = P.u, m = DON.mom(P); cols = cols || ['#3c5a0c', '#78b818', '#f4ffb0'];
    const T = []; for (let i = 0; i < n; i++) { const a = P.dir + (i - (n - 1) / 2) * (TAU * .7 / n), r = tam * (.55 + .45 * hh(i, 3, 9)); T.push([Math.cos(a) * r, Math.sin(a) * r * MA.det, .3 + i * .07]); }
    P.under(c => { for (const [x, y, t0] of T) if (u < t0 + .25) F.baoTron(c, x, y, rong, clamp(u / (t0 + .25), 0, 1)); });
    P.over(c => { for (let i = 0; i < n; i++) { const [x, y, t0] = T[i], q = seg(u, t0 - .2, t0 + .25), e = seg(u, t0 + .25, t0 + .6); if (q > 0 && q < 1) { const px = lerp(m[0], x, q), py = lerp(m[1], y, q) - Math.sin(q * PI) * 26; if (dan) dan(c, px, py, q); else F.cau(c, px, py, 2.5, cols); }
      if (e > 0 && e < 1) { if (e < .3) F.dia(c, x, y - 2, rong * (.5 + e * 1.5), cols[2]); F.song(c, x, y, rong * 1.1, e, [cols[2], cols[1]], 1); F.hat(c, x, y - 2, 12, i + 5, e, { v: rong * 1.2, cols: [cols[2], cols[1], cols[0]] }); if (sauNo) sauNo(c, x, y, e, i); } } });
    if (u < .3) { const v = u / .3; P.sy *= 1 + .1 * v; P.sx *= 1 - .07 * v; } else { const v = seg(u, .3, .8); P.sy *= 1 + .08 * Math.sin(v * PI * 5) * (1 - v); } },
  // Vòng đạn: bắn n viên toả tròn quanh mình (bắt đầu từ hướng dir), có thể 2 đợt lệch nhau.
  vongDan(P, n, tam, cols, dot) { const u = P.u, bh = P.B.bh, cy = -P.h - bh * .45; cols = cols || ['#c43c10', '#ff8a1e', '#fff6b0']; dot = dot || 1;
    if (u < .35) { const v = u / .35; P.sx *= 1 + .12 * v; P.sy *= 1 + .12 * v; P.flash = v > .6 && ((u * 30) | 0) % 2 ? .4 : 0; P.under(c => { for (let i = 0; i < n * dot; i++) { const a = P.dir + i / (n * dot) * TAU + (i % dot) * PI / n; F.baoDuong(c, Math.cos(a) * 6, Math.sin(a) * 6 * MA.det, tam - 6, 4, a, v); } }); P.over(c => { F.dia(c, 0, cy, 2 + v * 4, cols[1]); F.dia(c, 0, cy, 1 + v * 2, cols[2]); }); }
    else { const k = kf(u, [[.35, 1.15], [.45, .95], [.6, 1]]); P.sx *= k; P.sy *= k;
      P.over(c => { for (let j = 0; j < dot; j++) { const q = seg(u, .35 + j * .15, .85 + j * .15); if (q <= 0 || q >= 1) continue; for (let i = 0; i < n; i++) { const a = P.dir + (i + j * .5) / n * TAU, r = 6 + (tam - 6) * q, x = Math.cos(a) * r, y = cy + Math.sin(a) * r * MA.det + q * bh * .4; for (let t = 1; t < 4; t++) { F.a(c, .6 - t * .15); F.dia(c, x - Math.cos(a) * t * 3, y - Math.sin(a) * t * 3 * MA.det, 2 - t * .4, cols[0]); } F.a(c, 1); F.cau(c, x, y, 2.5, [cols[0], cols[1], cols[2]]); } } if (u < .5) F.song(c, 0, 0, tam * .5, seg(u, .35, .5), [cols[2], cols[1]], 1); }); } },
};

// ---------- bộ cử động chuẩn (dùng khi con quái không tự viết) ----------
const NHAN = { idle: 'Đứng thở', move: 'Di chuyển', tele: 'Báo trước đòn', atk: 'Ra đòn', hit: 'Trúng đòn', die: 'Chết', spawn: 'Xuất hiện', intro: 'Ra mắt', stun: 'Choáng', phase2: 'Chuyển sang pha 2', phase3: 'Chuyển sang pha 3' };
const BUI = ['#8a8290', '#5a5460', '#cbc3c0'];
const CH = MA.chuan = {
  idle(P) { P.tho(.035); if (P.d.bay) P.h += sn(P.u) * 1.5; },
  move(P) { if (P.d.bay) { P.h += sn(P.u * 2) * 1.5; P.rot += -4 + sn(P.u) * 2; P.tho(.03, P.u * 2); } else { const s = Math.abs(sn(P.u)); P.h += s * 2; P.sy *= 1 + s * .06 - .03; P.sx *= 1 - s * .04 + .02; P.rot += sn(P.u) * 3 - 2; } },
  tele(P) { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); P.theo(-3 * k); P.sy *= 1 - .1 * k; P.sx *= 1 + .07 * k; P.rot += -P.aim * 10 * k; if (u > .35) P.x += (((u * 24) | 0) % 2 ? .6 : -.6); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(u); },
  atk(P) { const u = P.u, k = kf(u, [[0, -3], [.18, 8, 'out'], [.45, 6], [1, 0, 'io']]); P.theo(k); const st = kf(u, [[0, .9], [.18, 1.14, 'out'], [.4, .94], [.6, 1.03], [1, 1]]); P.sx *= st; P.sy *= 2 - st; P.rot += -P.aim * 12 * (1 - u) + kf(u, [[0, 0], [.18, -8, 'out'], [1, 0]]); P.fxDon(u); },
  hit(P) { const u = P.u, k = kf(u, [[0, 0], [.15, 1, 'out'], [1, 0, 'io']]); P.tien(-4 * k); P.rot += 9 * k; P.sy *= 1 - .12 * k; P.sx *= 1 + .1 * k; P.flash = u < .3 ? 1 - u * 2.5 : 0; if (u < .5) P.x += ((u * 24 | 0) % 2 ? 1 : -1); },
  // ngã ra (25% đầu) rồi tan theo kiểu của d.chet = {k, mau} hoặc tên kiểu
  die(P) { const u = P.u, d = P.d, ct = typeof d.chet === 'string' ? { k: d.chet } : (d.chet || { k: 'no' }), k = kf(u, [[0, 0], [.12, 1, 'out'], [.3, .6]]); P.tien(-3 * k); P.rot += 10 * k; P.flash = u < .14 ? 1 - u * 5 : 0; if (d.bay) P.h *= 1 - seg(u, .1, .5) * (ct.k === 'hon' || ct.k === 'bui' ? 0 : 1);
    if (ct.k === 'no') { const q = seg(u, .1, .3); P.sx *= 1 + q * .3; P.sy *= 1 + q * .3; }
    if (u > .25) P.tan = { k: ct.k, u: seg(u, .25, 1), mau: ct.mau || BUI, trai: P.face > 0, len: ct.len }; P.bong = 1 - seg(u, .3, .8); },
  // xuất hiện theo d.hien = tên kiểu hoặc {k, mau}
  spawn(P) { const u = P.u, d = P.d, hv = typeof d.hien === 'string' ? { k: d.hien } : (d.hien || { k: 'moc' }), k = hv.k, mau = hv.mau || BUI, bw = P.B.bw, bh = P.B.bh;
    if (k === 'cat' || k === 'nuoc' || k === 'bong') { const q = seg(u, .25, .75), e = EASE.back(q); P.tan = { k: 'chim', u: clamp(1 - e, 0, 1) }; if (e > 1) P.h += (e - 1) * bh * .8; if (u < .6) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.bong = seg(u, .2, .6); const st = kf(u, [[.7, 1], [.8, 1.08], [.9, .96], [1, 1]]); P.sy *= st; P.sx *= 2 - st;
      P.under(c => { if (k === 'cat') { const m = Math.sin(seg(u, 0, .8) * PI); F.elip(c, 0, 1, bw * .5 * m + 2, 2 + m * 2, mau[1] || mau[0]); F.elip(c, 0, 0, bw * .4 * m + 1, 1 + m * 1.5, mau[0]); } else if (k === 'nuoc') { for (let i = 0; i < 3; i++) { const q2 = (u * 1.6 + i / 3) % 1; c.globalAlpha = (1 - q2) * (1 - seg(u, .8, 1)); F.vong(c, 0, 0, bw * (.3 + q2 * .6), bw * (.12 + q2 * .2), mau[i % mau.length], 1); } c.globalAlpha = 1; } else { const m = Math.sin(seg(u, 0, .9) * PI); F.elip(c, 0, 0, bw * .6 * m + 1, (bw * .22 * m + 1), mau[0]); } });
      P.over(c => { if (k === 'bong') return; F.hat(c, 0, -2, 14, 3, seg(u, .2, .8), { v: bw * .7, goc: -PI / 2, xoe: 2.2, g: bh * .9, cols: mau, to: k === 'nuoc' ? 2 : 1 }); F.hat(c, 0, -2, 8, 8, seg(u, .0, .4), { v: bw * .4, goc: -PI / 2, xoe: 2.6, g: 10, cols: mau }); }); }
    else if (k === 'roi') { const q = seg(u, 0, .5); P.h += (1 - q * q) * (hv.cao || 90) * (q < 1 ? 1 : 0); const st = u < .5 ? 1 + .2 * q : kf(u, [[.5, .62], [.68, 1.12, 'out'], [.84, .95], [1, 1]]); P.sy *= st; P.sx *= u < .5 ? 1 - .12 * q : 1 + (1 - st) * .8; P.bong = .3 + .7 * q; if (u >= .5) P.over(c => { const e = seg(u, .5, 1); F.khoi(c, -bw * .45, 0, 7, e, mau, 1); F.khoi(c, bw * .45, 0, 7, e, mau, 2); F.hat(c, 0, 0, 10, 4, e, { v: bw * .7, goc: -PI / 2, xoe: 2.8, g: 12, cols: mau }); }); if (u >= .5 && u < .6) P.y += 1; }
    else if (k === 'moc') { const q = kf(u, [[0, .04], [.15, .1], [.6, 1.14, 'out'], [.78, .94], [.9, 1.03], [1, 1]]); P.sy *= q; P.sx *= kf(u, [[0, .5], [.5, .85], [.6, .9], [.78, 1.06], [1, 1]]); if (u < .5) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.bong = seg(u, 0, .5); P.over(c => { F.hat(c, 0, -1, 14, 2, seg(u, .05, .7), { v: bw * .6, goc: -PI / 2, xoe: 2.4, g: 16, cols: mau }); }); P.under(c => { const m = 1 - seg(u, .6, 1); if (m > 0) F.elip(c, 0, 1, bw * .4 * m + 1, 2 * m + 1, mau[1] || mau[0]); }); }
    else if (k === 'den') { const q = seg(u, .3, .8), s = kf(q, [[0, .08], [.7, 1.1, 'out'], [1, 1]]); P.sx *= s; P.sy *= s; P.h += (1 - q) * 10 + Math.sin(q * PI) * 6; P.rot += (1 - q) * (1 - q) * 140; P.flash = (1 - q) * .8; P.tint = ['#ffb040', (1 - q) * .7]; P.bong = q;
      P.under(c => { const m = 1 - seg(u, .75, 1); if (m > 0) { F.px(c, -3, -9, '#2e1a10', 6, 1); F.px(c, -2, -8, '#b0261a', 4, 6); F.px(c, -1, -7, u < .5 && ((u * 16) | 0) % 2 ? '#fff6b0' : '#ffd23c', 2, 4); F.px(c, -3, -2, '#2e1a10', 6, 1); F.px(c, 0, -12, '#5c3a1e', 1, 3); } }); P.over(c => { const m = Math.sin(seg(u, 0, .8) * PI); if (m > 0) F.lua(c, 0, -4, 6 + m * 8, 6 + m * 14, P.t, null, 1); F.hat(c, 0, -8, 12, 5, seg(u, .25, .9), { v: 18, goc: -PI / 2, xoe: 2.6, cols: ['#fff6b0', '#ffd23c', '#ff8a1e'] }); }); }
    else if (k === 'bay') { const q = EASE.out(seg(u, 0, .8)); P.tien(-(1 - q) * (hv.xa || 46)); P.h += (1 - q) * (hv.cao || 34); P.rot += (1 - q) * -18; P.a = seg(u, 0, .25); P.bong = q; const st = kf(u, [[.8, 1], [.88, .92], [1, 1]]); P.sy *= st; }
    else if (k === 'no') { const q = seg(u, .45, .75), s = kf(q, [[0, .1], [.6, 1.2, 'out'], [1, 1, 'io']]); P.sx *= u < .45 ? .12 + u * .5 : s; P.sy *= u < .45 ? .12 + u * .5 : s; if (u < .45) { P.x += ((u * 24 | 0) % 2 ? .7 : -.7); P.flash = .5; } P.bong = seg(u, .3, .7); P.over(c => { F.hat(c, 0, -bh * .4, 18, 4, seg(u, .45, 1), { v: bw * .9, cols: mau, to: 2 }); F.song(c, 0, 0, bw * .8, seg(u, .45, .9), [mau[0], mau[1] || mau[0]], 1); }); }
    else { const m = { khoi: 'hon', ghep: 'vo', tu: 'tu', bui: 'bui', quet: 'quet' }[k] || 'tu'; if (m === 'tu') P.tan = { k: 'tu', u, mau }; else if (m === 'quet') P.tan = { k: 'quet', u: seg(u, .1, .9), mau, len: 1 }; else P.tan = { k: m, u: 1 - EASE.io(seg(u, 0, .85)), mau, trai: P.face < 0, hien: true }; if (u > .85) { const st = kf(u, [[.85, 1.06], [.93, .96], [1, 1]]); P.sy *= st; } P.bong = seg(u, .3, .9); }
  },
};
const DMAC = { idle: [1.2, true], move: [.6, true], tele: [.7, false], atk: [.55, false], hit: [.35, false], die: [1.1, false], spawn: [1.1, false] };

// ---------- khai báo quái ----------
// def(id, {ten, vung, loai, luoi: pha => lưới, parts: [...], anims: {ten: {d, lap, f, nhan}}, don, chet, hien, bay, cao, pha})
function def(id, d) { d.id = id; d.anims = d.anims || {}; DEFS[id] = d; return d; }
MA._def = def;
// Viết gọn một cử động: A(thời lượng giây, hàm tư thế, {lap: lặp, nhan: tên tiếng Việt, moc: [hết báo trước, hết ra đòn] tính theo 0..1})
function A(dd, f, o) { return Object.assign({ d: dd, f }, o || {}); }
MA._xong = function () { MA.list.length = 0; const TT = ['bien', 'rung', 'laudai'], LL = ['thuong', 'tinhanh', 'trumnho', 'trum'];
  for (const id of Object.keys(DEFS)) { const d = DEFS[id];
    for (const k of Object.keys(DMAC)) if (!d.anims[k]) d.anims[k] = { d: DMAC[k][0], lap: DMAC[k][1], f: CH[k] };
    for (const k of Object.keys(d.anims)) { const a = d.anims[k]; if (typeof a === 'function') d.anims[k] = { d: DMAC[k] ? DMAC[k][0] : 1, f: a }; const b = d.anims[k]; if (b.lap == null) b.lap = !!(DMAC[k] && DMAC[k][1]); if (!b.nhan) b.nhan = NHAN[k] || k; }
    let w = 0, h = 0; try { const B = goc(d, 1); w = B.bw; h = B.bh; } catch (e) { MA.loi.push(id + ': ' + (e && e.stack || e)); }
    MA.list.push({ id, ten: d.ten, vung: d.vung, loai: d.loai, w, h, pha: d.pha || 1, bay: !!d.bay, anims: Object.keys(d.anims).map(k => ({ id: k, ten: d.anims[k].nhan, d: d.anims[k].d, lap: !!d.anims[k].lap, moc: d.anims[k].moc || null })) }); }
  MA.list.sort((a, b) => (TT.indexOf(a.vung) - TT.indexOf(b.vung)) || (LL.indexOf(a.loai) - LL.indexOf(b.loai)) || (DEFS[a.id].tt || 0) - (DEFS[b.id].tt || 0)); };

// ---------- VẼ ----------
// c: bút canvas 2D (đơn vị = điểm ảnh của game). (x, y): điểm chân quái. o: {anim, t (giây từ lúc bắt đầu cử động), face (-1 trái, 1 phải),
// dir (góc radian của đòn: 0 = phải, PI/2 = xuống), phase (1..3, chỉ trùm vùng), hit (0..1 chớp trắng), bao: false để tắt vùng báo trước, fx: false để tắt hết hiệu ứng rời}
MA.draw = function (c, id, x, y, o) {
  const d = DEFS[id]; if (!d) return; o = o || {};
  const ph = d.pha ? clamp(o.phase || 1, 1, d.pha) : 1, nm = d.anims[o.anim] ? o.anim : 'idle', an = d.anims[nm];
  const t = Math.max(0, o.t || 0), nf = Math.max(1, Math.round(an.d * MA.fps)); let fi = Math.floor(t * MA.fps + 1e-6); fi = an.lap ? fi % nf : Math.min(fi, nf - 1);
  const u = an.lap ? fi / nf : (nf > 1 ? fi / (nf - 1) : 0);
  let face = o.face || 0, dir = o.dir; if (dir == null) dir = (face || -1) < 0 ? PI : 0; if (!face) { const cx = Math.cos(dir); face = cx > .01 ? 1 : -1; }
  const hv = an.hinh ? an.hinh(u, ph) : 0, B = goc(d, ph, hv), P = new Pose(d, B, nm, u, fi / MA.fps, o, dir, face, ph);
  MA._tatBao = o.bao === false; an.f(P);
  const key = P.khongNho ? null : id + '|' + ph + '|' + (hv || '') + '|' + nm + '|' + fi + '|' + P.aim + (P.khoa || ''), fr = veKhung(B, P, key);
  c.save(); c.translate(Math.round(x), Math.round(y)); c.imageSmoothingEnabled = false; const ga = c.globalAlpha;
  if (P.bong > 0 && d.bong !== 0) { const bw = (d.bong || B.bw * .62) * (1 - Math.min(.5, P.h / 80)) * Math.min(1, P.bong + .3); c.globalAlpha = ga * .28 * Math.min(1, P.bong); F.elip(c, P.x, P.y, bw / 2, Math.max(1.5, bw * .14), '#000000'); c.globalAlpha = ga; }
  if (o.fx !== false) for (const f of P._u) { c.save(); f(c, P); c.restore(); }
  const sx = Math.round(P.x), sy = Math.round(P.y - P.h);
  const ve = (img, dx, dy, a) => { c.save(); c.globalAlpha = ga * a; c.translate(sx + dx, sy + dy); if (face > 0) c.scale(-1, 1); c.drawImage(img, -fr.ox, -fr.oy); c.restore(); };
  if (P.bongMa) for (const m of P.bongMa) { ve(fr.cv, m.x || 0, m.y || 0, (m.a == null ? .3 : m.a) * P.a); if (m.mau) ve(bongHinh(fr, m.mau), m.x || 0, m.y || 0, (m.a == null ? .3 : m.a) * .7 * P.a); }
  if (P.a > 0) { ve(fr.cv, 0, 0, P.a); if (P.tint && P.tint[1] > 0) ve(bongHinh(fr, P.tint[0]), 0, 0, P.a * clamp(P.tint[1], 0, 1)); const fl = Math.max(P.flash || 0, o.hit || 0); if (fl > 0) ve(bongHinh(fr, '#ffffff'), 0, 0, P.a * clamp(fl, 0, 1)); }
  if (o.fx !== false) for (const f of P._o) { c.save(); f(c, P); c.restore(); }
  c.restore();
};
// Tiện cho game: thời lượng một cử động (giây), và xoá bộ nhớ khung hình.
MA.dur = (id, anim) => { const d = DEFS[id]; return d && d.anims[anim] ? d.anims[anim].d : 0; };
MA.xoaNho = () => KHUNG.clear();
