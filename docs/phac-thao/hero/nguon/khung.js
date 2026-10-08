// Khung dựng tờ phác thảo hero. Hình là dữ liệu điểm ảnh viết tay: mỗi ký tự là một màu trong bảng màu.
// Dấu chấm là trong suốt. Chữ số và các dấu ~ = - là điểm "hiệu ứng" (quầng sáng, vệt vung, gợn nước): không viền.
// Viền tối quanh hình được thêm tự động (1 điểm ảnh).
'use strict';
const MUC = '#1b1118';
// Bảng màu chung: chữ thường là sắc giữa, chữ hoa là sắc sáng, kèm một chữ riêng cho sắc tối.
const BANG_MAU = {
  k: '#1b1118', K: '#3a2a36',
  w: '#d9d4c7', W: '#fffbea', v: '#a39c94',
  r: '#c63a2e', R: '#ee6a4a', m: '#7e1f24',
  o: '#e07a2a', O: '#f9a94a',
  y: '#e2b23c', Y: '#ffe489', n: '#a8771f',
  g: '#4f9a45', G: '#86cc5a', h: '#2c6238',
  b: '#3b6fc4', B: '#6fb1ee', d: '#253f84',
  c: '#6fd0e0', C: '#c8f6ff',
  p: '#7b4bb0', P: '#b584e0',
  t: '#8a5a34', T: '#b9864f', u: '#5a3822',
  s: '#dc9c68', S: '#f6c896', z: '#a8663e',
  e: '#8d93a3', E: '#cfd6e2', f: '#555a6b',
  l: '#d9b871', L: '#f3dfa0', j: '#a88446',
  x: '#2d2733', X: '#4a4356',
  a: '#2f8f86', A: '#5fc9b4',
  i: '#e88aa0', I: '#ffc0c8',
  // hiệu ứng (không viền)
  '1': 'rgba(255,251,234,0.95)', '2': 'rgba(255,228,137,0.95)', '3': 'rgba(249,150,50,0.95)', '4': 'rgba(214,60,40,0.9)',
  '5': 'rgba(170,236,90,0.95)', '6': 'rgba(84,160,60,0.9)', '7': 'rgba(214,248,255,0.95)', '8': 'rgba(120,200,235,0.9)',
  '9': 'rgba(255,251,234,0.42)', '0': 'rgba(255,251,234,0.2)',
  '~': 'rgba(190,232,245,0.9)', '=': 'rgba(96,160,200,0.85)', '-': 'rgba(52,96,150,0.8)',
};
const HIEU_UNG = new Set('0123456789~=-'.split(''));

// Dựng một hình thành canvas nhỏ (đã thêm viền). Trả về {cv, w, h}.
function dungHinh(hinh, bangRieng) {
  const rows = hinh.rows, h = rows.length;
  let w = 0; for (const r of rows) w = Math.max(w, r.length);
  const pal = Object.assign({}, BANG_MAU, bangRieng || {}, hinh.mau || {});
  const cv = document.createElement('canvas'); cv.width = w + 2; cv.height = h + 2;
  const c = cv.getContext('2d');
  const dac = (x, y) => { if (y < 0 || y >= h || x < 0) return false; const ch = rows[y][x]; return !!ch && ch !== '.' && ch !== ' ' && !HIEU_UNG.has(ch); };
  const trong = (x, y) => { if (y < 0 || y >= h || x < 0) return true; const ch = rows[y][x]; return !ch || ch === '.' || ch === ' '; };
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
    const ch = y >= 0 && y < h ? rows[y][x] : undefined;
    if (!trong(x, y)) {
      if (!pal[ch]) throw new Error('Thiếu màu cho ký tự "' + ch + '" ở hình ' + (hinh.ten || '?') + ' hàng ' + y);
      c.fillStyle = pal[ch]; c.fillRect(x + 1, y + 1, 1, 1);
    } else if (!hinh.khongVien && (dac(x - 1, y) || dac(x + 1, y) || dac(x, y - 1) || dac(x, y + 1))) {
      c.fillStyle = hinh.vien || MUC; c.fillRect(x + 1, y + 1, 1, 1);
    }
  }
  return { cv, w: w + 2, h: h + 2, ax: (hinh.ax != null ? hinh.ax : Math.round(w / 2)) + 1, chan: hinh.chan || 0 };
}
// Vẽ hình phóng to k lần, chân đặt tại (x, y). chan: số hàng dưới cùng nằm dưới mặt đất (gợn nước, bóng).
function datHinh(c, hinh, bang, x, y, k, bong) {
  const d = dungHinh(hinh, bang);
  c.imageSmoothingEnabled = false;
  if (bong !== false && !hinh.khongBong) {
    c.fillStyle = 'rgba(0,0,0,0.32)';
    const rx = (hinh.bong || 10) * k, ry = 2 * k;
    c.beginPath(); c.ellipse(x + (hinh.bongLech || 0) * k, y - k, rx, ry, 0, 0, Math.PI * 2); c.fill();
  }
  c.drawImage(d.cv, Math.round(x - d.ax * k), Math.round(y - (d.h - 1 - d.chan) * k), d.w * k, d.h * k);
  return d;
}
function chu(c, s, x, y, co, mau, dam, can) {
  c.font = (dam ? 'bold ' : '') + co + 'px "DejaVu Sans", sans-serif';
  c.fillStyle = mau; c.textAlign = can || 'left'; c.textBaseline = 'alphabetic';
  c.fillText(s, x, y);
}
// Chữ tự xuống dòng; trả về toạ độ y của dòng kế tiếp.
function chuNhieuDong(c, s, x, y, rong, co, mau, dam, can) {
  c.font = (dam ? 'bold ' : '') + co + 'px "DejaVu Sans", sans-serif';
  const tu = s.split(' '); let dong = '';
  const ra = [];
  for (const t of tu) { const thu = dong ? dong + ' ' + t : t; if (c.measureText(thu).width > rong && dong) { ra.push(dong); dong = t; } else dong = thu; }
  if (dong) ra.push(dong);
  for (const d of ra) { chu(c, d, x, y, co, mau, dam, can); y += Math.round(co * 1.32); }
  return y;
}
function caoHinh(h) { return h.rows.length + 2 - (h.chan || 0); }
function o(c, x, y, w, h, mau, vien) { c.fillStyle = mau; c.fillRect(x, y, w, h); if (vien) { c.strokeStyle = vien; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, h - 2); } }

const NEN = '#1f1a26', NEN_O = '#2a2433', VIEN_O = '#3a3246', CHU_SANG = '#f4ecdc', CHU_VANG = '#ffd98a', CHU_MO = '#c9bfd2';

// Tờ phác thảo của một hướng.
function toHuong(H, anhPhong) {
  const RONG = 1240, LE = 20, K = 8;
  const cv = document.createElement('canvas'); cv.width = RONG; cv.height = 4000;
  const c = cv.getContext('2d');
  o(c, 0, 0, RONG, 4000, NEN);
  let y = 78;
  chu(c, H.ten, LE + 6, y, 56, CHU_VANG, true);
  y = chuNhieuDong(c, H.gioiThieu, LE + 6, y + 50, RONG - 2 * LE - 12, 31, CHU_SANG) + 6;
  // bốn hero, lưới 2 x 2
  const cm = Math.max(...H.hero.map(h => h.chan || 0)) * K; // phần nằm dưới mặt đất (gợn nước)
  const cao = Math.max(...H.hero.map(caoHinh)) * K + 36 + cm;
  const rongO = (RONG - 2 * LE - 16) / 2, caoO = cao + 168;
  H.hero.forEach((h, i) => {
    const x0 = LE + (i % 2) * (rongO + 16), y0 = y + Math.floor(i / 2) * (caoO + 16);
    o(c, x0, y0, rongO, caoO, NEN_O, VIEN_O);
    datHinh(c, h, H.mau, x0 + rongO / 2 + (h.lech || 0) * K, y0 + cao - 6 - cm, K);
    chu(c, h.ten, x0 + rongO / 2, y0 + cao + 44, 40, CHU_VANG, true, 'center');
    chuNhieuDong(c, h.moTa, x0 + rongO / 2, y0 + cao + 84, rongO - 36, 27, CHU_SANG, false, 'center');
  });
  y += 2 * (caoO + 16) + 8;
  // đang đánh + vũ khí tiến hoá
  const caoD = Math.max((caoHinh(H.danh) + (H.danh.chan || 0)) * K + 40, 2 * (Math.max(...H.vuKhi.map(caoHinh)) * 7 + 78) + 10) + 70;
  o(c, LE, y, rongO, caoD, NEN_O, VIEN_O);
  chu(c, 'Khi đang đánh', LE + 18, y + 46, 34, CHU_VANG, true);
  { const rd = Math.max(...H.danh.rows.map(r => r.length)); // canh giữa theo bề ngang cả hình (kể cả vệt vung)
    datHinh(c, Object.assign({}, H.danh, { ax: Math.round(rd / 2), bongLech: (H.danh.ax != null ? H.danh.ax : rd / 2) - Math.round(rd / 2) }), H.mau, LE + rongO / 2, y + caoD - 24 - (H.danh.chan || 0) * K, K); }
  const x1 = LE + rongO + 16;
  o(c, x1, y, rongO, caoD, NEN_O, VIEN_O);
  chu(c, 'Vũ khí lớn lên theo cách đánh', x1 + 18, y + 46, 31, CHU_VANG, true);
  const KV = 7, caoV = (caoD - 70) / 2;
  H.vuKhi.forEach((v, i) => {
    const xx = x1 + rongO / 4 + (i % 2) * rongO / 2, yy = y + 64 + Math.floor(i / 2) * caoV;
    datHinh(c, v, H.mau, xx + (v.lech || 0) * KV, yy + caoV - 52, KV, false);
    chu(c, v.ten, xx, yy + caoV - 12, 30, ['#f4ecdc', '#ffae6a', '#b4ec7a', '#a8e6ff'][i], true, 'center');
  });
  y += caoD + 24;
  // cỡ thật trong game
  chu(c, 'Cỡ thật khi chơi trên điện thoại', LE + 6, y + 30, 34, CHU_VANG, true);
  y += 48;
  const K3 = 3, rp = Math.floor((RONG - 2 * LE) / K3), cp = 176, yp = 78;
  c.imageSmoothingEnabled = false;
  c.drawImage(anhPhong, 30, yp, rp, cp, LE, y, rp * K3, cp * K3);
  H.hero.forEach((h, i) => datHinh(c, h, H.mau, LE + Math.round(rp * (0.14 + i * 0.24)) * K3, y + (216 - yp) * K3, K3));
  c.strokeStyle = VIEN_O; c.lineWidth = 2; c.strokeRect(LE + 1, y + 1, rp * K3 - 2, cp * K3 - 2);
  y += cp * K3 + LE;
  const ra = document.createElement('canvas'); ra.width = RONG; ra.height = y;
  ra.getContext('2d').drawImage(cv, 0, 0);
  return ra;
}

// Tờ tổng quan: hàng đầu là hero hiện tại, rồi mỗi hướng một hàng.
function toSoSanh(DS, anhHienTai) {
  const RONG = 1240, LE = 20, K = 5;
  const cv = document.createElement('canvas'); cv.width = RONG; cv.height = 4000;
  const c = cv.getContext('2d');
  o(c, 0, 0, RONG, 4000, NEN);
  let y = 74;
  chu(c, 'So sánh bốn hướng tạo hình hero', LE + 6, y, 50, CHU_VANG, true);
  y = chuNhieuDong(c, 'Mỗi hàng là một hướng, từ trái sang: Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật. Hàng đầu là hình đang dùng trong game.', LE + 6, y + 46, RONG - 2 * LE - 12, 29, CHU_SANG) + 4;
  const rongO = (RONG - 2 * LE) / 4;
  const hang = (ten, phu, cao, ve) => {
    o(c, LE, y, RONG - 2 * LE, cao + 66, NEN_O, VIEN_O);
    chu(c, ten, LE + 18, y + 44, 36, CHU_VANG, true);
    if (phu) { const w = c.measureText(ten).width; chu(c, phu, LE + 18 + w + 18, y + 44, 26, CHU_MO); }
    for (let i = 0; i < 4; i++) ve(i, LE + rongO * (i + 0.5), y + 66 + cao - 14);
    y += cao + 66 + 14;
  };
  hang('Hiện tại', 'dân làng bình thường', 46 * K + 30, (i, x, yy) => {
    c.imageSmoothingEnabled = false;
    c.fillStyle = 'rgba(0,0,0,0.32)'; c.beginPath(); c.ellipse(x, yy - K, 10 * K, 2 * K, 0, 0, 7); c.fill();
    c.drawImage(anhHienTai[i], x - 40 * K, yy - 66 * K - K, 96 * K, 72 * K);
  });
  for (const H of DS) {
    const cao = Math.max(...H.hero.map(caoHinh)) * K + 30;
    hang(H.ten, H.ngan, cao, (i, x, yy) => datHinh(c, H.hero[i], H.mau, x + (H.hero[i].lech || 0) * K, yy, K));
  }
  y += LE - 14;
  const ra = document.createElement('canvas'); ra.width = RONG; ra.height = y;
  ra.getContext('2d').drawImage(cv, 0, 0);
  return ra;
}
// Bảng xem nhanh khi đang vẽ: mọi hình của một hướng, phóng k lần.
function toXemNhanh(H, k) {
  const ds = [...H.hero, H.danh, ...H.vuKhi].filter(Boolean);
  const cv = document.createElement('canvas');
  const rong = ds.reduce((s, h) => s + (Math.max(...h.rows.map(r => r.length)) + 6) * k, 20);
  const cao = Math.max(...ds.map(caoHinh)) * k + 40;
  cv.width = rong; cv.height = cao;
  const c = cv.getContext('2d'); o(c, 0, 0, rong, cao, NEN_O);
  let x = 10;
  for (const h of ds) { const w = Math.max(...h.rows.map(r => r.length)) + 2; const d = dungHinh(h, H.mau);
    c.imageSmoothingEnabled = false; c.drawImage(d.cv, x, cao - 20 - (d.h - d.chan) * k, d.w * k, d.h * k); x += (w + 4) * k; }
  return cv;
}
window.HUONG = [];

// ---------- ghép hình từ nhiều mảnh (đầu, thân, vũ khí) để vẽ tư thế đang đánh ----------
// manh: danh sách [rows, x, y]; mảnh sau đè lên mảnh trước.
function ghep(w, h, manh) {
  const g = []; for (let y = 0; y < h; y++) g.push(new Array(w).fill('.'));
  for (const [rows, x, y] of manh) for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
    const ch = rows[j][i]; if (ch === '.' || ch === ' ') continue;
    const xx = x + i, yy = y + j; if (xx >= 0 && xx < w && yy >= 0 && yy < h) g[yy][xx] = ch;
  }
  return g.map(r => r.join(''));
}
function cat(rows, x0, x1, y0, y1) { return rows.slice(y0, y1).map(r => r.padEnd(x1, '.').slice(x0, x1)); }
// Vệt vung (hiệu ứng): một dải cong quanh tâm (cx, cy), từ bán kính r0 tới r1, từ góc a0 tới a1 (độ, 0 là bên phải, âm là phía trên).
// Càng gần a1 (chỗ vũ khí đang tới) càng sáng. kyTu: ba ký tự hiệu ứng từ mờ tới sáng.
function vetVung(w, h, cx, cy, r0, r1, a0, a1, kyTu) {
  const k = kyTu || '091', rows = [];
  for (let y = 0; y < h; y++) { let s = '';
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy); let a = Math.atan2(dy, dx) * 180 / Math.PI;
      if (a0 > a1 ? (a < a1 || a > a0) : (a < a0 || a > a1)) { s += '.'; continue; }
      const q = (a - a0) / (a1 - a0); // 0 ở đuôi vệt, 1 ở sát vũ khí
      const mep = r1 - (r1 - r0) * q; // đuôi vệt mỏng dần
      if (r > r1 || r < mep) { s += '.'; continue; }
      s += r > r1 - 1.6 ? (q > 0.4 ? k[2] : k[1]) : q > 0.6 ? k[1] : k[0];
    }
    rows.push(s); }
  return rows;
}
// Nghiêng cả hình như một khối cứng (con rối đổ người tới): hàng trên cùng lệch sang phải nhiều nhất.
function nghieng(rows, k) {
  const h = rows.length, lech = (j) => Math.round((h - 1 - j) * k), max = lech(0);
  return rows.map((r, j) => '.'.repeat(lech(j)) + r + '.'.repeat(max - lech(j)));
}
// Xoá một vùng chữ nhật (để bỏ cánh tay cũ trước khi gắn cánh tay mới).
function xoa(rows, x0, x1, y0, y1) {
  return rows.map((r, j) => (j < y0 || j >= y1) ? r : r.padEnd(x1, '.').slice(0, x0) + '.'.repeat(x1 - x0) + r.slice(x1));
}
