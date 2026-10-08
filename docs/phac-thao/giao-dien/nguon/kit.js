// Bộ vẽ phác thảo ba chủ đề giao diện. Hình pixel vẽ ở cỡ thật 1x rồi phóng 3 lần, chữ vẽ nét ở cỡ lớn (giống game).
'use strict';
const SC = 3;
const FONT = '"Be Vietnam Pro", Inter, system-ui, sans-serif';
let g = null, T = [];
const mcv = document.createElement('canvas').getContext('2d');
function tw(str, size, bold) { mcv.font = (bold ? '700 ' : '500 ') + size + 'px ' + FONT; return mcv.measureText(str).width; }
function mk(w, h) {
  const low = document.createElement('canvas'); low.width = w; low.height = h;
  g = low.getContext('2d'); T = [];
  return low;
}
function tx(str, x, y, o) { T.push(Object.assign({ str, x, y }, o || {})); }
// ghép lớp pixel và chữ vào ảnh lớn rồi xoá lớp tạm
function flush(fc, ox, oy) {
  fc.imageSmoothingEnabled = false;
  fc.drawImage(g.canvas, ox || 0, oy || 0, g.canvas.width * SC, g.canvas.height * SC);
  fc.save(); fc.translate(ox || 0, oy || 0); fc.scale(SC, SC); fc.textBaseline = 'alphabetic';
  for (const t of T) {
    fc.font = (t.bold ? '700 ' : '500 ') + (t.size || 9) + 'px ' + FONT;
    fc.textAlign = t.align || 'left';
    if (t.shadow !== false) { fc.fillStyle = t.shadow || 'rgba(0,0,0,0.75)'; fc.fillText(t.str, t.x + 0.6, t.y + 0.6); }
    fc.fillStyle = t.color || '#f1ead9'; fc.fillText(t.str, t.x, t.y);
  }
  fc.restore();
  g.clearRect(0, 0, g.canvas.width, g.canvas.height); T = [];
}
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const P = (x, y, c) => R(x, y, 1, 1, c);
function hash(x, y) { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
function frame(x, y, w, h, c, t) { t = t || 1; R(x, y, w, t, c); R(x, y + h - t, w, t, c); R(x, y, t, h, c); R(x + w - t, y, t, h, c); }
function rr(x, y, w, h, c, cut) { // chữ nhật bo góc kiểu pixel
  cut = cut == null ? 1 : cut;
  for (let i = 0; i < h; i++) { const d = Math.max(0, cut - i, cut - (h - 1 - i)); R(x + d, y + i, w - 2 * d, 1, c); }
}
function ell(cx, cy, rx, ry, c) {
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    const k = 1 - (dy * dy) / (ry * ry + ry * 0.6); if (k < 0) continue;
    const hw = Math.round(rx * Math.sqrt(k)); R(cx - hw, cy + dy, hw * 2 + 1, 1, c);
  }
}
const disc = (cx, cy, r, c) => ell(cx, cy, r, r, c);
function ring(cx, cy, r, th, c) {
  for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
    const d = Math.sqrt(dx * dx + dy * dy); if (d <= r + 0.4 && d > r - th + 0.4) P(cx + dx, cy + dy, c);
  }
}
function bmp(x, y, rows, pal, flip, s) {
  s = s || 1;
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
    const ch = rows[j][i]; if (ch === '.' || !pal[ch]) continue;
    R(x + (flip ? rows[j].length - 1 - i : i) * s, y + j * s, s, s, pal[ch]);
  }
}
function glow(x, y, w, h, col, n) { // quầng sáng chấm so le quanh một ô
  for (let j = -n; j < h + n; j++) for (let i = -n; i < w + n; i++) {
    if (i >= 0 && i < w && j >= 0 && j < h) continue;
    const d = Math.max(-i, i - w + 1, 0) + Math.max(-j, j - h + 1, 0);
    if (d > n) continue;
    if (d === 1 || (i + j) % 2 === 0) P(x + i, y + j, col);
  }
}

// ---------- hình nhỏ dùng chung ----------
const B = {
  sword: ['.........ss.', '........sds.', '.......sds..', '......sds...', '.....swks...', '....sds.....', '.h.sds......', '.hhds.......', '..hhh.......', '.hh.hh......', 'hh..........'],
  lock: ['.aaa.', 'a...a', 'a...a', 'aaaaa', 'aa.aa', 'aa.aa', 'aaaaa'],
  ga: ['.....rr......', '....rrk......', '...kyyk...gb.', '..yykyk..gbg.', '...kyykkgbgb.', '...kyyyybgb..', '..kryyyrgb...', '..krryrrk....', '...krrrk.....', '....k.k......', '....k.k......', '...kk.kk.....'],
  lon: ['..kk....kk...', '.kppkkkkppk..', 'kppppppppppk.', 'kpkpppkkpppkk', 'kppppkpwkpppk', 'kppppkwkkppk.', '.kpppppppppk.', '..kpkkkkkpk..', '..kk.....kk..'],
  ca: ['....kkkk....k.', '..kkrrrrkk.kyk', '.kryrrryrrkyk.', 'krkrryrryrrk..', 'krrryrryrrkyk.', '.kkrrrrrkk.kyk', '...kyyk.....k.', '....kk........'],
  lac: ['.....aa........', '....aaa....a...', 'a..aaaa...aaa..', 'aaaaaaaaaaaaaaa', '.aaaaaaaa......', '...aa.aa.......', '...a...a.......'],
  coc: ['..aa.aa..', '.ahaaaha.', 'aaaaaaaaa', 'aadaaadaa', '.aa...aa.', 'aa.....aa'],
  thuyen: ['....a...a...a...a.....', '...aaa.aaa.aaa.aaa..aa', 'a...a...a...a...a..aa.', 'aa.aaa.aaa.aaa.aaa.aa.', '.aaaaaaaaaaaaaaaaaaa..', '..aaaaaaaaaaaaaaaaa...'],
  slash: ['......aaa.', '....aaaaaa', '..aaa...aa', '.aa......a', 'aa........', 'a.........', 'aa........', '.aaa......'],
  flame: ['....a....', '...aa....', '...aaa.a.', '.a.aaaaa.', '.aaabaaa.', 'aaabbbaaa', 'aabbbbbaa', 'aabbcbbaa', '.aabbbaa.', '..aaaaa..'],
  dash: ['...a.....', '....aa...', 'aaaaaaa..', 'aaaaaaaa.', 'aaaaaaa..', '....aa...', '...a.....'],
  binh: ['..kkk..', '..kwk..', '.kkkkk.', 'krrrrrk', 'krwrrrk', 'krrrrrk', 'krrrrrk', '.kkkkk.'],
};
function star(cx, cy, r, n, c, inner) { // ngôi sao nhiều cánh
  inner = inner || 0.45;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = Math.sqrt(dx * dx + dy * dy); if (d > r) continue;
    let a = (Math.atan2(dy, dx) + Math.PI / 2) / (2 * Math.PI) * n; a = Math.abs((a % 1 + 1) % 1 - 0.5) * 2; // 0 ở đỉnh cánh
    if (d <= r * (inner + (1 - inner) * (1 - a))) P(cx + dx, cy + dy, c);
  }
}
let ICS = 1;
function icon(name, cx, cy, pal) { const b = B[name]; bmp(Math.round(cx - b[0].length * ICS / 2), Math.round(cy - b.length * ICS / 2), b, pal, false, ICS); }
const RAR = ['#b9b1a2', '#4aa3ff', '#b36bff', '#ffc83d'];
const RARD = ['#6b655c', '#1f5fae', '#6a2fb0', '#a8741a'];
const swordPal = { s: '#f4f0e6', d: '#9fb0bd', h: '#e0a63a', w: '#ffffff', k: '#16131a' };

// =====================================================================
// CHỦ ĐỀ 1: TRANH ĐÔNG HỒ VÀ MỘC BẢN
// =====================================================================
const DH = { id: 'dh', name: 'Tranh Đông Hồ và mộc bản', ink: '#2a1a14', sub: '#6a4a36', accent: '#b23a22', good: '#3f7a2e', warn: '#b23a22', gold: '#a8741a', onDark: false };
(function () {
  const C = { paper: '#efe2c0', pap2: '#dccb9f', pap3: '#f8f0d8', ink: '#2a1a14', red: '#c8442b', redD: '#9a2f1c', yel: '#e8b62f', yelD: '#c2901c', ind: '#2f4a7a', grn: '#4f8a3c', pink: '#e58a7a', grey: '#cfc6b0' };
  DH.C = C;
  const pal = { k: C.ink, r: C.red, y: C.yel, g: C.grn, b: C.ind, p: C.pink, w: C.pap3 };
  function paper(x, y, w, h, o) { // giấy dó có sợi, có thể xé mép
    o = o || {};
    const base = o.base || C.paper;
    for (let j = 0; j < h; j++) {
      let l = 0, r = 0;
      if (o.tornX) { l = Math.floor(hash(x + 7, y + j) * 2.6); r = Math.floor(hash(x + w, y + j * 3) * 2.6); }
      R(x + l, y + j, w - l - r, 1, base);
    }
    if (o.tornB) for (let i = 0; i < w; i++) if (hash(x + i, y + h) < 0.45) P(x + i, y + h - 1, 'rgba(0,0,0,0)'), g.clearRect(x + i, y + h - 1, 1, 1);
    for (let j = 1; j < h - 1; j++) for (let i = 3; i < w - 3; i++) {
      const q = hash(x + i, y + j);
      if (q < 0.03) P(x + i, y + j, C.pap2); else if (q > 0.975) P(x + i, y + j, C.pap3);
      else if (q > 0.5 && q < 0.506 && i < w - 7) R(x + i, y + j, 3, 1, C.pap2);
    }
  }
  function inkFrame(x, y, w, h, c, t) { // nét khắc gỗ hơi lệch như in tay
    c = c || C.ink; t = t || 1;
    for (let i = 0; i < w; i += 9) {
      const a = hash(x + i, y) < 0.22 ? 1 : 0, b = hash(x + i, y + h) < 0.22 ? -1 : 0;
      R(x + i, y + a, Math.min(9, w - i), t, c); R(x + i, y + h - t + b, Math.min(9, w - i), t, c); if (t > 1) { R(x + i, y, Math.min(9, w - i), 1, c); R(x + i, y + h - 1, Math.min(9, w - i), 1, c); }
    }
    for (let j = 0; j < h; j += 9) {
      const a = hash(x, y + j) < 0.22 ? 1 : 0, b = hash(x + w, y + j) < 0.22 ? -1 : 0;
      R(x + a, y + j, t, Math.min(9, h - j), c); R(x + w - t + b, y + j, t, Math.min(9, h - j), c); if (t > 1) { R(x, y + j, 1, Math.min(9, h - j), c); R(x + w - 1, y + j, 1, Math.min(9, h - j), c); }
    }
  }
  DH.paper = paper; DH.inkFrame = inkFrame;
  DH.btn = function (x, y, w, h, label, st, o) {
    o = o || {}; const yo = st === 1 ? 1 : 0;
    if (st !== 1) R(x + 2, y + h, w - 2, 1, 'rgba(0,0,0,0.4)');
    paper(x, y + yo, w, h, { tornX: true, base: st === 2 ? C.grey : st === 1 ? C.pap2 : C.paper });
    const sm = h < 22 ? 1 : 0, fx = x + 3 - sm, fy = y + yo + 3 - sm, fw = w - 7 + sm * 2, fh = h - 7 + sm * 2;
    const col = o.primary ? (st === 1 ? C.redD : C.red) : (st === 1 ? C.yelD : C.yel);
    if (st !== 2) R(fx + (st === 1 ? 0 : 1), fy + (st === 1 ? 0 : 1), fw, fh, col); // mảng màu in lệch 1 chấm
    inkFrame(fx, fy, fw, fh, st === 2 ? '#8f8674' : C.ink);
    if (st !== 2) { P(fx + 2, fy + 2, C.ink); P(fx + fw - 3, fy + 2, C.ink); P(fx + 2, fy + fh - 3, C.ink); P(fx + fw - 3, fy + fh - 3, C.ink); }
    const size = o.size || 9;
    const light = o.primary && st !== 2;
    tx(label, x + w / 2, y + yo + h / 2 + size * 0.36 - (o.sub ? 4 : 0) - 0.5, { size, bold: true, align: 'center', color: st === 2 ? '#8f8674' : light ? '#fff3da' : C.ink, shadow: light ? 'rgba(60,10,0,0.7)' : false });
    if (o.sub) tx(o.sub, x + w / 2, y + yo + h / 2 + 7.5, { size: o.subSize || 7, align: 'center', color: st === 2 ? '#8f8674' : light ? '#ffe6c0' : '#5a3a26', shadow: false });
  };
  DH.sbtn = function (x, y, w, h, label, st, o) { // con dấu son
    o = o || {}; const yo = st === 1 ? 1 : 0;
    if (st !== 1) R(x + 1, y + h, w - 1, 1, 'rgba(0,0,0,0.4)');
    const c = st === 2 ? '#b3a892' : st === 1 ? C.redD : C.red;
    rr(x, y + yo, w, h, c, 1);
    frame(x + 2, y + yo + 2, w - 4, h - 4, st === 2 ? '#cfc6b0' : '#f3c9a8');
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (hash(x + i * 3, y + j * 5) < 0.014) P(x + i, y + yo + j, st === 2 ? C.grey : '#e9a48a'); // dấu mòn
    const size = o.size || 8;
    tx(label, x + w / 2, y + yo + h / 2 + size * 0.36 - 0.5, { size, bold: true, align: 'center', color: st === 2 ? '#e6dfcc' : '#fff3da', shadow: 'rgba(60,10,0,0.6)' });
  };
  DH.panel = function (x, y, w, h, title, o) {
    o = o || {};
    R(x + 2, y + 2, w, h, 'rgba(0,0,0,0.35)');
    paper(x, y, w, h);
    inkFrame(x, y, w, h, C.ink, 2);
    frame(x + 4, y + 4, w - 8, h - 8, C.red);
    P(x + 4, y + 4, C.paper); P(x + w - 5, y + 4, C.paper); P(x + 4, y + h - 5, C.paper); P(x + w - 5, y + h - 5, C.paper);
    if (title) {
      const t = Math.ceil(tw(title, 11, true)) + 12;
      R(x + 8, y + 8, t, 14, C.red); inkFrame(x + 7, y + 7, t, 14, C.ink); R(x + 7, y + 4, t + 2, 1, C.paper);
      tx(title, x + 13, y + 18, { size: 11, bold: true, color: '#fff3da', shadow: 'rgba(60,10,0,0.7)' });
    }
    if (o.motif !== false) {
      bmp(x + w - 20, y + h - 15, B.ca, pal);
      if (o.ga !== false && w > 150) { bmp(x + w - 21, y + 7, B.ga, pal); if (h > 90) bmp(x + w - 40, y + 9, B.lon, pal); }
    }
  };
  DH.inset = function (x, y, w, h, sel) { // ô con trong bảng
    R(x, y, w, h, sel ? '#f3d88a' : '#e6d6ad'); inkFrame(x, y, w, h, sel ? C.red : '#5a3a26', sel ? 2 : 1);
  };
  DH.bar = function (x, y, w, kind, frac, label) {
    const h = 10, col = kind === 'hp' ? C.red : C.ind, hi = kind === 'hp' ? '#e06a4c' : '#4f72ad';
    R(x + 1, y + h, w, 1, 'rgba(0,0,0,0.4)');
    paper(x, y, w, h, { tornX: true });
    const fw = Math.round((w - 8) * frac);
    R(x + 4, y + 2, w - 8, h - 4, C.pap3);
    for (let j = 0; j < h - 4; j++) { const e = Math.floor(hash(x + fw, y + j * 7) * 3); R(x + 5, y + 3 + j, Math.max(0, fw - e), 1, j === 0 ? hi : col); } // tô lệch 1 chấm, đầu nét cọ lem
    frame(x + 3, y + 1, w - 6, h - 2, C.ink); P(x + 3, y + 1, C.paper); P(x + w - 4, y + h - 2, C.paper);
    for (let k = 1; k < 4; k++) R(x + 4 + Math.round((w - 8) * k / 4), y + 2, 1, 2, C.ink);
    if (label) tx(label, x + w / 2, y + 8.3, { size: 6.5, bold: true, align: 'center', color: '#fff3da', shadow: 'rgba(30,10,0,0.95)' });
  };
  DH.slot = function (x, y, s, rar, o) {
    o = o || {};
    R(x + 1, y + s, s, 1, 'rgba(0,0,0,0.4)');
    paper(x, y, s, s);
    R(x + 3, y + 3, s - 4, s - 4, RAR[rar]); R(x + 4, y + 4, s - 7, s - 7, o.dark ? '#3a2a22' : '#f3e8c8');
    inkFrame(x + 1, y + 1, s - 3, s - 3, C.ink, 1); frame(x + 4, y + 4, s - 8, s - 8, C.ink);
    if (rar === 3) { R(x + 5, y + 5, 3, 1, C.red); R(x + 5, y + 5, 1, 3, C.red); R(x + s - 8, y + s - 6, 3, 1, C.red); R(x + s - 6, y + s - 8, 1, 3, C.red); }
    if (o.sel) frame(x - 1, y - 1, s + 2, s + 2, C.red);
    if (o.icon !== false) icon('sword', x + s / 2, y + s / 2, { s: C.ind, d: C.ink, h: C.red, w: '#fff', k: C.ink });
  };
  DH.card = function (x, y, w, h, label, st, stars) {
    const up = st === 'sel' ? -2 : 0;
    R(x + 2, y + h + up + (st === 'sel' ? 2 : 0), w - 2, 1, 'rgba(0,0,0,0.45)');
    paper(x, y + up, w, h, { base: st === 'lock' ? C.grey : C.paper });
    if (st === 'sel') { R(x + 4, y + up + 4, w - 7, h - 7, C.red); inkFrame(x + 3, y + up + 3, w - 7, h - 7, C.ink, 2); }
    else if (st === 'done') { R(x + 4, y + up + 4, w - 7, h - 7, C.yel); inkFrame(x + 3, y + up + 3, w - 7, h - 7, C.ink); }
    else { for (let i = 3; i < w - 4; i += 4) { R(x + i, y + 3, 2, 1, '#8f8674'); R(x + i, y + h - 4, 2, 1, '#8f8674'); } for (let j = 3; j < h - 4; j += 4) { R(x + 3, y + j, 1, 2, '#8f8674'); R(x + w - 4, y + j, 1, 2, '#8f8674'); } }
    const lc = st === 'sel' ? '#fff3da' : st === 'lock' ? '#8f8674' : C.ink;
    tx(label, x + w / 2, y + up + h / 2 + (st === 'lock' ? 0 : 0.5), { size: 12, bold: true, align: 'center', color: lc, shadow: st === 'sel' ? 'rgba(60,10,0,0.7)' : false });
    if (st === 'lock') { bmp(x + w / 2 - 3, y + h / 2 + 5, B.lock, { a: '#8f8674' }); }
    else tx('★'.repeat(stars) + '☆'.repeat(3 - stars), x + w / 2, y + up + h / 2 + 11.5, { size: 8, align: 'center', color: st === 'sel' ? '#ffe08a' : C.red, shadow: st === 'sel' ? 'rgba(60,10,0,0.7)' : false });
  };
  DH.toast = function (x, y, w, text) {
    R(x + 2, y + 18, w - 2, 1, 'rgba(0,0,0,0.4)');
    paper(x, y, w, 18, { tornX: true });
    R(x + 5, y + 3, 12, 12, C.red); frame(x + 7, y + 5, 8, 8, '#f3c9a8'); R(x + 10, y + 7, 2, 4, '#fff3da'); P(x + 5, y + 3, C.paper); P(x + 16, y + 14, C.paper);
    R(x + 21, y + 14, w - 28, 1, C.ink);
    tx(text, x + 22, y + 11.5, { size: 8.5, bold: true, color: C.ink, shadow: false });
  };
  DH.round = function (cx, cy, r, kind, st) {
    ICS = r >= 22 ? 2 : 1; // nút tròn: con dấu tròn in màu
    const yo = st === 1 ? 1 : 0; cy += yo;
    const col = kind === 'atk' ? C.red : kind === 'skill' ? C.yel : kind === 'sp' ? C.ind : C.grn;
    if (st !== 1) disc(cx + 1, cy + 2, r, 'rgba(0,0,0,0.4)');
    disc(cx, cy, r, C.paper); disc(cx + 1, cy + 1, r - 3, col); ring(cx, cy, r - 2, 1, C.ink); ring(cx, cy, r, 1, C.ink);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; P(cx + Math.round(Math.cos(a) * (r - 1)), cy + Math.round(Math.sin(a) * (r - 1)), C.ink); }
    const ip = kind === 'skill' ? { a: C.ink, b: C.red, c: C.pap3 } : { a: C.pap3, b: C.yel, c: C.red, s: C.pap3, d: '#e9c9a0', h: C.yel, w: '#fff', k: C.ink };
    icon(kind === 'atk' ? 'sword' : kind === 'skill' ? 'flame' : kind === 'sp' ? 'slash' : 'dash', cx + 1, cy + 1, ip);
  };
  DH.hudPlate = function (x, y, w, h) { paper(x, y, w, h, { tornX: true }); inkFrame(x + 2, y + 1, w - 4, h - 2, C.ink); };
  DH.stick = function (cx, cy) {
    disc(cx, cy, 22, 'rgba(239,226,192,0.55)'); ring(cx, cy, 22, 1, C.ink); ring(cx, cy, 19, 1, C.red);
    disc(cx + 7, cy - 4, 8, C.red); ring(cx + 7, cy - 4, 8, 1, C.ink); frame(cx + 4, cy - 7, 7, 7, '#f3c9a8');
  };
})();

// =====================================================================
// CHỦ ĐỀ 2: TRỐNG ĐỒNG ĐÔNG SƠN
// =====================================================================
const DS = { id: 'ds', name: 'Trống đồng Đông Sơn', ink: '#f1e6c6', sub: '#a9c2b4', accent: '#f0c860', good: '#9be07a', warn: '#ff9a5a', gold: '#f0c860', onDark: true };
(function () {
  const C = { dk: '#1a120a', brD: '#5a3d1a', br: '#a8752f', gold: '#d9a441', hi: '#f6dc92', pat: '#3f8f7f', patL: '#6fc1a8', patD: '#1f4f4a', bg: '#12292a', bg2: '#17363a', cop: '#8a2f22', copL: '#b8452f' };
  DS.C = C;
  function saw(x, y, w, col, up) { // băng răng cưa
    for (let i = 0; i + 4 <= w; i += 4) { if (up) { R(x + i, y + 2, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 1, y, col); } else { R(x + i, y, 4, 1, col); R(x + i + 1, y + 1, 2, 1, col); P(x + i + 2, y + 2, col); } }
  }
  function circles(x, y, w, col, dot) { // vòng tròn có chấm giữa nối tiếp tuyến
    for (let i = 0; i + 6 <= w; i += 6) { R(x + i + 1, y, 3, 1, col); R(x + i + 1, y + 4, 3, 1, col); R(x + i, y + 1, 1, 3, col); R(x + i + 4, y + 1, 1, 3, col); P(x + i + 2, y + 2, dot || col); P(x + i + 5, y + 4, col); P(x + i + 5, y, col); }
  }
  DS.saw = saw; DS.circles = circles;
  DS.btn = function (x, y, w, h, label, st, o) {
    o = o || {}; const yo = st === 1 ? 1 : 0, dis = st === 2;
    if (st !== 1) rr(x, y + 2, w, h, 'rgba(0,0,0,0.5)', 2);
    const y0 = y + yo;
    rr(x, y0, w, h, dis ? '#232c2a' : C.dk, 2);
    rr(x + 1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : C.br, 2);
    if (!dis && st !== 1) R(x + 3, y0 + 1, w - 6, 1, C.hi);
    R(x + 2, y0 + 2, w - 4, h - 4, dis ? '#2b3634' : C.dk);
    const cc = dis ? '#333f3c' : o.primary ? (st === 1 ? C.copL : C.cop) : (st === 1 ? C.pat : C.patD);
    if (h >= 22) { saw(x + 3, y0 + 2, w - 6, dis ? '#56706a' : C.gold, false); saw(x + 3, y0 + h - 5, w - 6, dis ? '#56706a' : C.gold, true); R(x + 2, y0 + 5, w - 4, h - 10, cc); }
    else { R(x + 2, y0 + 3, w - 4, h - 6, cc); for (let i = 3; i < w - 3; i += 2) { P(x + i, y0 + 2, dis ? '#56706a' : C.gold); P(x + i, y0 + h - 3, dis ? '#56706a' : C.gold); } }
    if (st === 1) R(x + 2, y0 + 5, w - 4, 1, 'rgba(0,0,0,0.45)');
    if (w >= 56) for (const ex of [x + 4, x + w - 9]) { ring(ex + 2, y0 + (h >> 1), 2, 1, dis ? '#56706a' : C.gold); }
    const size = o.size || 9;
    tx(label, x + w / 2, y0 + h / 2 + size * 0.36 - (o.sub ? 3.5 : 0) - 0.3, { size, bold: true, align: 'center', color: dis ? '#7f948e' : '#fff0c4' });
    if (o.sub) tx(o.sub, x + w / 2, y0 + h / 2 + 7.5, { size: o.subSize || 7, align: 'center', color: dis ? '#7f948e' : '#e8d9a8' });
  };
  DS.sbtn = function (x, y, w, h, label, st, o) {
    o = o || {}; const yo = st === 1 ? 1 : 0, dis = st === 2, y0 = y + yo;
    if (st !== 1) rr(x, y + 1, w, h, 'rgba(0,0,0,0.5)', 2);
    rr(x, y0, w, h, C.dk, 2); rr(x + 1, y0 + 1, w - 2, h - 2, dis ? '#4a5c57' : st === 1 ? C.gold : C.br, 2);
    if (!dis) R(x + 3, y0 + 1, w - 6, 1, C.hi);
    R(x + 2, y0 + 3, w - 4, h - 6, dis ? '#333f3c' : st === 1 ? C.pat : C.patD);
    R(x + 2, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold); R(x + w - 3, y0 + 3, 1, h - 6, dis ? '#56706a' : C.gold);
    const size = o.size || 8;
    tx(label, x + w / 2, y0 + h / 2 + size * 0.36 - 0.3, { size, bold: true, align: 'center', color: dis ? '#7f948e' : '#fff0c4' });
  };
  DS.panel = function (x, y, w, h, title, o) {
    o = o || {};
    R(x + 2, y + 3, w, h, 'rgba(0,0,0,0.45)');
    R(x, y, w, h, C.dk); R(x + 1, y + 1, w - 2, h - 2, C.br); R(x + 1, y + 1, w - 2, 1, C.hi); R(x + 1, y + 1, 1, h - 2, C.gold);
    R(x + 3, y + 3, w - 6, h - 6, C.dk); R(x + 4, y + 4, w - 8, h - 8, C.bg);
    for (let j = 4; j < h - 4; j += 2) for (let i = 4 + (j % 4); i < w - 4; i += 4) if (hash(x + i, y + j) < 0.18) P(x + i, y + j, C.bg2);
    // vành trống: băng trên có răng cưa, chim Lạc; băng dưới vòng tròn tiếp tuyến
    const th = title ? 19 : 9;
    R(x + 4, y + th, w - 8, 1, C.br); saw(x + 6, y + th + 1, w - 12, C.brD, false);
    circles(x + 7, y + h - 10, w - 14, C.br, C.gold);
    R(x + 4, y + h - 12, w - 8, 1, C.brD);
    if (title) {
      tx(title, x + 9, y + 15.5, { size: 11, bold: true, color: '#f6dc92' });
      let bx = x + 16 + Math.ceil(tw(title, 11, true));
      const end = x + w - (o.rightPad || 10);
      for (let n = 0; bx + 24 < end; n++) { if (n % 3 === 2) { bmp(bx, y + 9, B.thuyen, { a: C.br }); bx += 28; } else { bmp(bx, y + 8, B.lac, { a: C.br }); bx += 21; } } // chim Lạc và thuyền người chèo
    }
    // cóc ngồi bốn góc
    const cp = { a: C.gold, h: C.hi, d: C.brD };
    bmp(x - 2, y - 3, B.coc, cp); bmp(x + w - 7, y - 3, B.coc, cp, true); bmp(x - 2, y + h - 4, B.coc, cp); bmp(x + w - 7, y + h - 4, B.coc, cp, true);
  };
  DS.inset = function (x, y, w, h, sel) {
    R(x, y, w, h, sel ? '#2f6a60' : '#1b3a3b'); frame(x, y, w, h, sel ? C.hi : C.brD); if (sel) frame(x + 1, y + 1, w - 2, h - 2, C.gold);
  };
  DS.bar = function (x, y, w, kind, frac, label) {
    const h = 9, col = kind === 'hp' ? '#d0482f' : '#3f8fe0', hi = kind === 'hp' ? '#f08a5a' : '#8fc6ff';
    rr(x, y + 1, w, h, 'rgba(0,0,0,0.5)', 1);
    rr(x, y, w, h, C.dk, 1); rr(x + 1, y + 1, w - 2, h - 2, C.br, 1); R(x + 2, y + 1, w - 4, 1, C.hi);
    R(x + 7, y + 2, w - 14, h - 4, '#0d1716');
    const fw = Math.round((w - 14) * frac);
    R(x + 7, y + 2, fw, h - 4, col); R(x + 7, y + 2, fw, 1, hi);
    for (let k = 1; k < 10; k++) { const px = x + 7 + Math.round((w - 14) * k / 10); P(px, y + 2, C.dk); P(px, y + h - 3, C.dk); if (k === 5) R(px, y + 2, 1, h - 4, 'rgba(0,0,0,0.5)'); } // vạch khắc
    for (const ex of [x + 2, x + w - 6]) { R(ex, y + 3, 4, 3, C.dk); P(ex + 1, y + 4, C.gold); P(ex + 2, y + 4, C.gold); }
    if (label) tx(label, x + w / 2, y + 7.8, { size: 6.5, bold: true, align: 'center', color: '#fff' });
  };
  DS.slot = function (x, y, s, rar, o) {
    o = o || {};
    rr(x, y + 1, s, s, 'rgba(0,0,0,0.5)', 2);
    rr(x, y, s, s, C.dk, 2); rr(x + 1, y + 1, s - 2, s - 2, C.br, 2); R(x + 3, y + 1, s - 6, 1, C.hi);
    R(x + 3, y + 3, s - 6, s - 6, RARD[rar]); frame(x + 3, y + 3, s - 6, s - 6, RAR[rar]); R(x + 5, y + 5, s - 10, s - 10, '#12292a');
    for (const [ax, ay] of [[x + 2, y + 2], [x + s - 4, y + 2], [x + 2, y + s - 4], [x + s - 4, y + s - 4]]) { R(ax, ay, 2, 2, RAR[rar]); }
    if (rar === 3) { saw(x + 5, y + 5, s - 10, C.gold, false); }
    if (o.sel) { rr(x - 1, y - 1, s + 2, 1, C.hi, 0); frame(x - 1, y - 1, s + 2, s + 2, C.hi); }
    if (o.icon !== false) icon('sword', x + s / 2, y + s / 2 + (rar === 3 ? 1 : 0), swordPal);
  };
  function drum(cx, cy, r, o) { // mặt trống: sao nhiều cánh và các vành
    o = o || {};
    const a = o.dull ? '#35524c' : C.br, b = o.dull ? '#4c6e66' : C.gold, d = o.dull ? '#1c2c2a' : C.dk, m = o.dull ? '#26403c' : (o.mid || C.patD);
    disc(cx, cy, r, d); disc(cx, cy, r - 1, a); ring(cx, cy, r - 1, 1, o.lit ? C.hi : b);
    disc(cx, cy, r - 3, d); disc(cx, cy, r - 4, m);
    if (r >= 14) { for (let k = 0; k < 16; k++) { const an = k * Math.PI / 8; P(cx + Math.round(Math.cos(an) * (r - 5)), cy + Math.round(Math.sin(an) * (r - 5)), b); } ring(cx, cy, r - 7, 1, a); }
    star(cx, cy, Math.round(r * 0.62), o.n || 12, o.lit ? C.hi : b, 0.5);
    disc(cx, cy, Math.round(r * 0.3), o.core || d);
  }
  DS.drum = drum;
  DS.card = function (x, y, w, h, label, st, stars) {
    const cx = x + (w >> 1), r = 16, cy = y + r + 1;
    disc(cx + 1, cy + 2, r, 'rgba(0,0,0,0.5)');
    if (st === 'sel') { for (let k = 0; k < 24; k++) { const an = k * Math.PI / 12; P(cx + Math.round(Math.cos(an) * (r + 3)), cy + Math.round(Math.sin(an) * (r + 3)), C.hi); } ring(cx, cy, r + 1, 1, C.hi); }
    for (const sx of [cx - r - 5, cx + r]) { R(sx, cy - 4, 6, 9, st === 'lock' ? '#1c2c2a' : C.dk); R(sx + 1, cy - 3, 4, 7, st === 'lock' ? '#35524c' : C.br); R(sx + 2, cy - 2, 2, 5, st === 'lock' ? '#26403c' : C.patD); } // quai trống
    drum(cx, cy, r, { dull: st === 'lock', lit: st === 'sel', mid: st === 'sel' ? C.cop : C.patD, n: 12 });
    disc(cx, cy, 7, st === 'lock' ? '#1c2c2a' : C.dk);
    if (st === 'lock') bmp(cx - 2, cy - 3, B.lock, { a: '#7f948e' });
    else {
      tx(label, cx, cy + 3.8, { size: 11, bold: true, align: 'center', color: '#fff0c4' });
      tx('★'.repeat(stars) + '☆'.repeat(3 - stars), cx, y + h + 1, { size: 8, align: 'center', color: '#ffd23f' });
    }
  };
  DS.toast = function (x, y, w, text) {
    const h = 18;
    for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0; const ins = Math.max(0, d - 2); R(x + ins, y + j + 2, w - ins * 2, 1, 'rgba(0,0,0,0.4)'); }
    for (let j = 0; j < h; j++) { const d = Math.abs(j - (h - 1) / 2) | 0; const ins = Math.max(0, d - 2); R(x + ins, y + j, w - ins * 2, 1, C.dk); R(x + ins + 1, y + j, w - ins * 2 - 2, 1, j === 0 || j === h - 1 ? C.dk : C.br); }
    R(x + 8, y + 1, w - 16, 1, C.hi);
    R(x + 12, y + 3, w - 24, h - 6, C.patD); frame(x + 12, y + 3, w - 24, h - 6, C.dk);
    ring(x + 6, y + 9, 2, 1, C.hi); ring(x + w - 7, y + 9, 2, 1, C.hi);
    bmp(x + w - 32, y + 6, B.lac, { a: '#2f6a60' });
    tx(text, x + 18, y + 12, { size: 8.5, bold: true, color: '#fff0c4' });
  };
  DS.round = function (cx, cy, r, kind, st) {
    ICS = r >= 22 ? 2 : 1;
    const yo = st === 1 ? 1 : 0; cy += yo;
    if (st !== 1) disc(cx + 1, cy + 2, r, 'rgba(0,0,0,0.5)');
    const mid = kind === 'atk' ? C.cop : kind === 'skill' ? '#7a5a14' : kind === 'sp' ? '#1f4f7a' : C.patD;
    drum(cx, cy, r, { mid, lit: st === 1, n: kind === 'atk' ? 14 : 10, core: mid });
    disc(cx, cy, Math.round(r * 0.52), C.dk); disc(cx, cy, Math.round(r * 0.52) - 1, mid);
    icon(kind === 'atk' ? 'sword' : kind === 'skill' ? 'flame' : kind === 'sp' ? 'slash' : 'dash', cx, cy, { a: '#fff0c4', b: '#ffb347', c: '#fff', s: '#fff6dc', d: '#c9b383', h: C.gold, w: '#fff', k: '#16131a' });
  };
  DS.hudPlate = function (x, y, w, h) { rr(x, y, w, h, C.dk, 2); rr(x + 1, y + 1, w - 2, h - 2, C.br, 2); R(x + 3, y + 1, w - 6, 1, C.hi); R(x + 3, y + 3, w - 6, h - 6, C.bg); };
  DS.stick = function (cx, cy) {
    disc(cx, cy, 22, 'rgba(18,41,42,0.6)'); ring(cx, cy, 22, 2, C.br); ring(cx, cy, 22, 1, C.dk); for (let k = 0; k < 12; k++) { const an = k * Math.PI / 6; P(cx + Math.round(Math.cos(an) * 18), cy + Math.round(Math.sin(an) * 18), C.gold); }
    drum(cx + 7, cy - 4, 9, { n: 8 });
  };
})();

// =====================================================================
// CHỦ ĐỀ 3: ĐÈN LỒNG VÀ SƠN MÀI ĐÊM HỘI
// =====================================================================
const DL = { id: 'dl', name: 'Đèn lồng và sơn mài đêm hội', ink: '#f6ead0', sub: '#c9a98a', accent: '#ffcf6a', good: '#9be07a', warn: '#ff9a5a', gold: '#ffcf6a', onDark: true };
(function () {
  const C = { blk: '#140c0c', blk2: '#1f1110', cg: '#5a2412', cg2: '#7a3018', red: '#c8281e', redL: '#ec4a30', redD: '#8f1a16', gold: '#e8b84a', goldL: '#ffe08a', goldD: '#8a6420', egg: '#efe6d2', glow: 'rgba(255,190,90,0.38)', glow2: 'rgba(255,210,120,0.7)', wood: '#b8743a' };
  DL.C = C;
  function tassel(x, y, len, col) { R(x, y, 1, 2, C.gold); R(x - 1, y + 2, 3, 2, C.gold); R(x - 1, y + 4, 3, len, col || C.red); P(x, y + 4 + len, col || C.red); }
  DL.tassel = tassel;
  function lantern(x, y, w, h, st, o) { // thân đèn lồng bầu
    o = o || {}; const dis = st === 2, lit = st === 1;
    const body = dis ? '#4a1c18' : lit ? '#f0603a' : (o.body || C.red), hi = dis ? '#5a2620' : lit ? '#ff9a5a' : (o.hi || C.redL), sh = dis ? '#34120f' : (o.sh || C.redD), rib = dis ? '#3a1512' : lit ? '#d8482a' : (o.rib || '#a51f18');
    const prof = [4, 2, 1, 1];
    for (let j = 0; j < h; j++) {
      const d = Math.min(j, h - 1 - j); const ins = d < prof.length ? prof[d] : 0;
      R(x + ins, y + j, w - ins * 2, 1, j < 3 ? hi : j >= h - 3 ? sh : body);
    }
    for (let i = 8; i < w - 5; i += 8) R(x + i, y + 1, 1, h - 2, rib);
    if (lit) { R(x + 6, y + 5, w - 12, h - 10, '#ff8a3a'); R(x + 10, y + 6, w - 20, h - 12, '#ffb347'); }
    const cap = dis ? '#6a5a3a' : C.gold, capL = dis ? '#7a6a4a' : C.goldL;
    const cw = Math.min(22, w - 16) & ~1;
    R(x + (w - cw) / 2, y - 1, cw, 2, cap); R(x + (w - cw) / 2 + 1, y - 1, cw - 2, 1, capL); R(x + (w - cw) / 2, y + h - 1, cw, 2, cap);
  }
  DL.lantern = lantern;
  DL.btn = function (x, y, w, h, label, st, o) {
    o = o || {}; const yo = st === 1 ? 1 : 0, y0 = y + yo, dis = st === 2;
    const size = o.size || 9;
    if (o.primary) {
      if (!dis) glow(x + 2, y0 + 1, w - 4, h - 2, st === 1 ? C.glow2 : C.glow, st === 1 ? 4 : 3);
      lantern(x, y0, w, h, st);
      tassel(x + (w >> 1) + (o.sway || 0), y0 + h + 1, 2, dis ? '#4a1c18' : C.red);
      tx(label, x + w / 2, y0 + h / 2 + size * 0.36 - (o.sub ? 4 : 0) - 0.3, { size, bold: true, align: 'center', color: dis ? '#a08a7a' : '#fff6d8', shadow: 'rgba(70,10,0,0.85)' });
      if (o.sub) tx(o.sub, x + w / 2, y0 + h / 2 + 7.5, { size: o.subSize || 7, align: 'center', color: dis ? '#a08a7a' : '#ffe6b0' });
      return;
    }
    // nút thường: thẻ sơn mài cánh gián viền vàng lá
    if (st !== 1) rr(x, y + 2, w, h, 'rgba(0,0,0,0.5)', 2);
    rr(x, y0, w, h, dis ? '#4a4038' : st === 1 ? C.goldL : C.gold, 2); rr(x + 1, y0 + 1, w - 2, h - 2, dis ? '#2a1c18' : C.redD, 2);
    R(x + 2, y0 + 2, w - 4, h - 4, dis ? '#2a1c18' : st === 1 ? C.cg2 : C.cg);
    if (!dis) { for (let i = 3; i < w - 3; i++) if (hash(x + i, y) < 0.3) P(x + i, y0 + h - 3 - Math.floor(hash(x + i, y + 9) * 3), C.cg2); R(x + 3, y0 + 2, w - 6, 1, st === 1 ? '#a8502a' : '#8a3a1c'); }
    if (!dis) { P(x + 3, y0 + 3, C.goldL); P(x + w - 4, y0 + 3, C.goldL); P(x + 3, y0 + h - 4, C.gold); P(x + w - 4, y0 + h - 4, C.gold); }
    tx(label, x + w / 2, y0 + h / 2 + size * 0.36 - (o.sub ? 4 : 0) - 0.3, { size, bold: true, align: 'center', color: dis ? '#8a7a6a' : '#ffe9b8' });
    if (o.sub) tx(o.sub, x + w / 2, y0 + h / 2 + 7.5, { size: o.subSize || 7, align: 'center', color: dis ? '#8a7a6a' : '#e8c890' });
  };
  DL.sbtn = function (x, y, w, h, label, st, o) { // thẻ gỗ nhỏ treo dây
    o = o || {}; const yo = st === 1 ? 1 : 0, y0 = y + yo, dis = st === 2;
    R(x + (w >> 1), y - 3, 1, 3 + yo, C.goldD); R(x + (w >> 1) - 1, y - 4, 3, 2, C.wood);
    if (st !== 1) rr(x, y + 1, w, h, 'rgba(0,0,0,0.5)', 2);
    rr(x, y0, w, h, dis ? '#4a4038' : C.gold, 2); rr(x + 1, y0 + 1, w - 2, h - 2, dis ? '#2a1c18' : st === 1 ? C.redL : C.red, 2);
    if (!dis) R(x + 3, y0 + 1, w - 6, 1, st === 1 ? '#ff9a5a' : C.redL);
    const size = o.size || 8;
    tx(label, x + w / 2, y0 + h / 2 + size * 0.36 - 0.3, { size, bold: true, align: 'center', color: dis ? '#8a7a6a' : '#fff6d8', shadow: 'rgba(70,10,0,0.85)' });
  };
  DL.panel = function (x, y, w, h, title, o) {
    o = o || {};
    // dây treo có hạt gỗ
    if (o.hang !== false) for (const sx of [x + 18, x + w - 19]) { R(sx, y - 12, 1, 12, C.goldD); R(sx - 1, y - 8, 3, 3, C.wood); P(sx - 1, y - 8, '#d99a5a'); R(sx - 1, y - 3, 3, 2, C.red); }
    R(x + 2, y + 3, w, h, 'rgba(0,0,0,0.5)');
    R(x, y, w, h, C.gold); R(x + 1, y + 1, w - 2, h - 2, C.red); R(x + 1, y + 1, w - 2, 1, C.redL); R(x + 3, y + 3, w - 6, h - 6, C.blk);
    // lớp cánh gián loang ở nửa dưới
    for (let j = 4; j < h - 4; j++) for (let i = 4; i < w - 4; i++) { const k = j / h; if (hash((x + i) >> 1, (y + j) >> 1) < k * k * 0.5 && (i + j) % 2 === 0) P(x + i, y + j, '#34140c'); }
    frame(x + 5, y + 5, w - 10, h - 10, C.goldD);
    for (const [ax, ay] of [[x + 5, y + 5], [x + w - 8, y + 5], [x + 5, y + h - 8], [x + w - 8, y + h - 8]]) { R(ax, ay, 3, 3, C.blk); P(ax + 1, ay + 1, C.goldL); }
    // vàng lá dát ở hai góc
    for (let k = 0; k < 60; k++) { const a = hash(k, x + y) * 28, b = hash(k * 3, x + 5) * 12; if (a + b * 2 < 30) { P(x + w - 8 - a, y + 8 + b, k % 3 ? C.gold : C.goldL); if (h > 80) P(x + 8 + a, y + h - 9 - b, k % 3 ? C.goldD : C.gold); } }
    if (title) {
      tx(title, x + 11, y + 18, { size: 11, bold: true, color: C.goldL });
      // dải cẩn vỏ trứng dưới tiêu đề
      const ew = Math.ceil(tw(title, 11, true)) + 6;
      for (let i = 0; i < ew; i++) for (let j = 0; j < 2; j++) P(x + 10 + i, y + 21 + j, hash(x + i * 7, y + j * 3) < 0.28 ? '#6a5a48' : (hash(x + i, j) < 0.5 ? C.egg : '#d9cdb4'));
    }
    if (o.tassel !== false) { tassel(x + 6, y + h, 4); tassel(x + w - 7, y + h, 4); }
  };
  DL.inset = function (x, y, w, h, sel) {
    R(x, y, w, h, sel ? C.cg2 : '#2a1512'); frame(x, y, w, h, sel ? C.goldL : '#5a3a22'); if (sel) { frame(x + 1, y + 1, w - 2, h - 2, C.red); }
  };
  DL.bar = function (x, y, w, kind, frac, label) { // chuỗi đèn
    const n = 10, pitch = Math.floor(w / n), hp = kind === 'hp';
    const on = hp ? C.red : '#2f7fd8', onL = hp ? '#ff8a5a' : '#8fd0ff', off = hp ? '#3a1512' : '#14243a', gl = hp ? 'rgba(255,150,80,0.4)' : 'rgba(120,190,255,0.4)';
    R(x - 2, y, n * pitch + 3, 1, C.goldD);
    for (let i = 0; i < n; i++) {
      const lx = x + i * pitch, f = Math.max(0, Math.min(1, frac * n - i));
      const lit = f > 0.25;
      P(lx + 4, y + 1, C.goldD); R(lx + 3, y + 2, 3, 1, lit ? C.gold : '#5a4a2a');
      if (lit) glow(lx + 2, y + 4, 5, 4, gl, 2);
      rr(lx + 1, y + 3, 7, 6, lit ? on : off, 1);
      if (lit) { R(lx + 2, y + 4, 2, 2, onL); if (f < 0.75) R(lx + 5, y + 3, 3, 6, off); }
      R(lx + 3, y + 9, 3, 1, lit ? C.gold : '#5a4a2a');
    }
    if (label) tx(label, x + n * pitch + 4, y + 9, { size: 6.5, bold: true, color: hp ? '#ffd9c0' : '#bfe0ff' });
  };
  DL.slot = function (x, y, s, rar, o) {
    o = o || {};
    if (rar === 3) glow(x, y, s, s, C.glow, 2);
    rr(x, y + 1, s, s, 'rgba(0,0,0,0.5)', 1);
    rr(x, y, s, s, rar === 3 ? C.goldL : C.goldD, 1); R(x + 1, y + 1, s - 2, s - 2, C.blk); R(x + 2, y + 2, s - 4, s - 4, rar === 3 ? '#3a1a0c' : C.blk2);
    const c = rar === 0 ? C.egg : RAR[rar];
    for (let k = 0; k < 5; k++) { R(x + 2, y + 2 + k, 5 - k, 1, c); R(x + s - 7 + k, y + s - 3 - k, 5 - k, 1, c); }
    R(x + 2, y + s - 3, s - 4, 1, c); R(x + 2, y + 2, s - 4, 1, c);
    if (rar === 0) { P(x + 3, y + 4, '#6a5a48'); P(x + 5, y + 3, '#6a5a48'); P(x + s - 4, y + s - 5, '#6a5a48'); }
    if (o.sel) frame(x - 1, y - 1, s + 2, s + 2, C.goldL);
    if (o.icon !== false) icon('sword', x + s / 2 + 1, y + s / 2 + 1, swordPal);
  };
  DL.card = function (x, y, w, h, label, st, stars) { // đèn lồng treo
    const cx = x + (w >> 1), lw = 40, lh = h - 13, lx = cx - lw / 2, ly = y + 5 + (st === 'sel' ? 1 : 0);
    R(cx, y - 2, 1, 7, C.goldD);
    const s3 = st === 'lock' ? 2 : st === 'sel' ? 1 : 0;
    if (st !== 'lock') glow(lx + 2, ly + 1, lw - 4, lh - 2, st === 'sel' ? C.glow2 : C.glow, st === 'sel' ? 5 : 3);
    lantern(lx, ly, lw, lh, s3);
    tassel(cx, ly + lh + 1, 3, st === 'lock' ? '#4a1c18' : C.red);
    if (st === 'lock') bmp(cx - 2, ly + lh / 2 - 3, B.lock, { a: '#a08a7a' });
    else {
      tx(label, cx, ly + lh / 2 + 2, { size: 12, bold: true, align: 'center', color: '#fff6d8', shadow: 'rgba(70,10,0,0.85)' });
      tx('★'.repeat(stars) + '☆'.repeat(3 - stars), cx, ly + lh / 2 + 11, { size: 7.5, align: 'center', color: C.goldL, shadow: 'rgba(70,10,0,0.85)' });
    }
  };
  DL.toast = function (x, y, w, text) { // câu đối đỏ thả xuống
    for (const sx of [x + 10, x + w - 11]) R(sx, y - 8, 1, 8, C.goldD);
    R(x + 2, y + 3, w - 2, 18, 'rgba(0,0,0,0.45)');
    R(x, y, w, 18, C.red); R(x, y, w, 1, C.redL); R(x, y + 17, w, 1, C.redD);
    frame(x + 5, y + 2, w - 10, 14, C.gold);
    R(x - 1, y - 1, 4, 20, C.goldD); R(x + w - 3, y - 1, 4, 20, C.goldD); R(x, y - 1, 2, 20, C.gold); R(x + w - 2, y - 1, 2, 20, C.gold);
    for (let i = 9; i < w - 9; i += 5) if (hash(i, x) < 0.25) P(x + i, y + 4 + Math.floor(hash(i, y) * 10), C.gold);
    tx(text, x + w / 2, y + 12.3, { size: 8.5, bold: true, align: 'center', color: C.goldL, shadow: 'rgba(70,10,0,0.85)' });
  };
  DL.round = function (cx, cy, r, kind, st) {
    ICS = r >= 22 ? 2 : 1;
    const yo = st === 1 ? 1 : 0; cy += yo;
    const col = kind === 'atk' ? C.red : kind === 'skill' ? '#d98a1e' : kind === 'sp' ? '#2f6fd0' : '#3f8a5a';
    const hi = kind === 'atk' ? C.redL : kind === 'skill' ? '#ffc04a' : kind === 'sp' ? '#6fb0ff' : '#6fc18a';
    const gl = st === 1 ? C.glow2 : C.glow;
    for (let k = 0; k < 40; k++) { const an = k * Math.PI / 20, rr2 = r + 2 + (k % 2); P(cx + Math.round(Math.cos(an) * rr2), cy + Math.round(Math.sin(an) * rr2), gl); }
    R(cx, cy - r - 4, 1, 3, C.goldD);
    disc(cx, cy, r, C.blk); disc(cx, cy, r - 1, st === 1 ? hi : col); ell(cx, cy - 2, r - 3, r - 4, st === 1 ? '#ffd9a0' : hi); ell(cx, cy, r - 3, r - 3, st === 1 ? hi : col);
    if (kind === 'atk') { star(cx, cy, r - 2, 5, st === 1 ? '#ffe9b0' : C.gold, 0.42); disc(cx, cy, Math.round(r * 0.55), C.redD); } // đèn ông sao
    else for (let i = -r + 4; i < r - 2; i += 5) R(cx + i, cy - r + 3, 1, 2 * r - 6, 'rgba(0,0,0,0.18)');
    R(cx - 4, cy - r - 1, 9, 2, C.gold); R(cx - 4, cy + r - 1, 9, 2, C.gold);
    tassel(cx, cy + r + 1, 2);
    icon(kind === 'atk' ? 'sword' : kind === 'skill' ? 'flame' : kind === 'sp' ? 'slash' : 'dash', cx, cy, { a: '#fff6d8', b: '#ffe08a', c: '#fff', s: '#fff6dc', d: '#e8c890', h: C.goldL, w: '#fff', k: '#16131a' });
  };
  DL.hudPlate = function (x, y, w, h) { rr(x, y, w, h, C.gold, 1); R(x + 1, y + 1, w - 2, h - 2, C.red); R(x + 2, y + 2, w - 4, h - 4, C.blk); };
  DL.stick = function (cx, cy) {
    disc(cx, cy, 22, 'rgba(20,12,12,0.6)'); ring(cx, cy, 22, 1, C.gold); ring(cx, cy, 21, 1, C.red);
    for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2; P(cx + Math.round(Math.cos(an) * 17), cy + Math.round(Math.sin(an) * 17), C.goldL); }
    glow(cx + 2, cy - 9, 10, 10, C.glow, 3); disc(cx + 7, cy - 4, 8, C.blk); disc(cx + 7, cy - 4, 7, C.red); ell(cx + 6, cy - 6, 4, 3, C.redL); R(cx + 5, cy - 12, 5, 1, C.gold); R(cx + 5, cy + 4, 5, 1, C.gold);
  };
})();
DH.rar = ['#4a4038', '#1f5fae', '#6a2fb0', '#9a6a10']; DS.rar = DL.rar = ['#d6d2c8', '#6fb2ff', '#c88cff', '#ffd24a'];
DH.el = { fire: '#b2400e', ice: '#1f5f96', poison: '#2f6b1a' }; DS.el = DL.el = { fire: '#ff7a2a', ice: '#7fd4ff', poison: '#6fcf3a' };
const THEMES = [DH, DS, DL];
