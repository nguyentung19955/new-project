// Dựng các tờ ảnh xem trước cho vũ khí sống. Chạy trong trình duyệt sau khi nạp game/js/weapon_art.js.
'use strict';
const WA = G.weaponArt;
const FONT = '"Inter","DejaVu Sans",sans-serif';
const PAGE = '#1c1921', PANEL = '#2b2632', PANEL2 = '#332d3b', CREAM = '#f1ead9', SOFT = '#cfc5b4', GOLDT = '#ffd27a';
const ELCOL = { fire: '#ff9a4a', poison: '#a6e05a', ice: '#9fdcff' };
const ELNAME = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
const TYPEVN = { sword: 'kiếm', bow: 'cung', spear: 'giáo', hammer: 'búa' };

function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
function rr(c, x, y, w, h, r, fill) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); }
function text(c, s, x, y, px, col, bold, align) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT; c.fillStyle = col; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y);
}
function wrap(c, s, maxW, px, bold) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT;
  const ws = s.split(' '), out = []; let cur = '';
  for (const w of ws) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}

// ---------- em bé tinh linh chibi, cao khoảng 25 điểm ảnh, đầu to ----------
const PAL = WA._pal, TN = WA._tone, INK = PAL.INK;
const MASK = ['#c9c0ae', '#f6f0e2', '#ffffff'], DARK = '#2a2230';
// kieu: 'sung' (tai nhọn), 'non' (mũ chóp), 'la' (mầm lá), 'bui' (búi tóc khăn đỏ)
function beSpr(C, kieu) {
  const P0 = { k: 1 }, S = new WA._Spr(40, new WA._Frame(0, P0));
  const Md = TN.Md, Lt = TN.Lt, Dk = TN.Dk;
  S.part((s) => { s.rr(-3, -1, 2, 1, DARK); s.rr(2, -1, 2, 1, DARK); });
  S.part((s) => { // áo choàng bé tí
    s.rg([[-3, -9], [3, -9], [4, -2], [-4, -2]], C);
    s.in(() => { s.rr(-4, -3, 9, 1, Lt(C)); s.rr(-4, -7, 2, 5, Dk(C)); s.px(1, -6, Md(PAL.GOLD)); });
  });
  if (kieu === 'sung') S.part((s) => { s.rg([[-6, -20], [-5, -25], [-3, -21]], MASK); s.rg([[3, -21], [5, -25], [6, -20]], MASK); });
  if (kieu === 'la') S.part({ ol: PAL.GRN[0] }, (s) => { s.rl(0, -22, 1, -24, 1, Md(PAL.GRN)); s.rr(1, -26, 3, 2, Md(PAL.GRN)); s.px(3, -27, Lt(PAL.GRN)); });
  if (kieu === 'bui') S.part((s) => { s.re(0.5, -23.5, 1.8, 1.8, DARK); });
  S.part((s) => { // mũ trùm đầu to
    if (kieu === 'non') s.rg([[-8, -13], [-1, -26], [0, -26], [8, -13], [5, -9], [-5, -9]], C);
    else s.re(0, -15.5, 7, 6.5, C);
    s.in(() => { s.re(-4, -11, 4, 2.5, Dk(C)); if (kieu === 'non') s.rl(0, -24, 4, -17, 1, Lt(C)); });
  });
  S.part({ ol: C[0] }, (s) => { // mặt nạ
    s.re(1.5, -14.5, 4.6, 4.3, Md(MASK));
    s.rr(-1, -11, 4, 1, Dk(MASK));
    s.rr(-1, -16, 2, 3, INK); s.rr(3, -16, 2, 3, INK); s.px(-1, -16, '#ffffff'); s.px(3, -16, '#ffffff');
    s.rr(-2, -12, 2, 1, '#ef7f78'); s.rr(5, -12, 1, 1, '#ef7f78');
    s.px(1, -12, INK); s.px(2, -12, INK);
  });
  if (kieu === 'bui') S.part((s) => { s.rr(-6, -21, 13, 2, PAL.RED); s.rg([[-6, -21], [-10, -23], [-10, -19], [-6, -19]], PAL.RED); });
  S.part((s) => { s.rr(4, -8, 2, 2, Md(MASK)); });
  S.finish();
  return S.toCanvas();
}
const BE = {};
function be(kind) {
  if (!BE[kind]) BE[kind] = kind === 'do' ? beSpr(PAL.RED, 'sung') : kind === 'xanh' ? beSpr(PAL.GRN, 'non') : kind === 'lam' ? beSpr(PAL.BLU, 'la') : beSpr(PAL.ORG, 'bui');
  return BE[kind];
}
const BE_OF = { sword: 'do', bow: 'xanh', spear: 'lam', hammer: 'cam' };
// vẽ em bé, chân đặt tại (x, y), phóng s lần
function putBe(c, kind, x, y, s) {
  const b = be(kind); c.imageSmoothingEnabled = false;
  c.drawImage(b.cv, Math.round(x + b.dx * s), Math.round(y + b.dy * s), b.w * s, b.h * s);
}
function shadow(c, x, y, hw, s) {
  c.fillStyle = 'rgba(0,0,0,0.32)';
  c.fillRect(Math.round(x - (hw - 2) * s), y - s, (2 * hw - 4) * s, s); c.fillRect(Math.round(x - hw * s), y, 2 * hw * s, s); c.fillRect(Math.round(x - (hw - 2) * s), y + s, (2 * hw - 4) * s, s);
}

// ---------- vẽ một vũ khí phóng to ----------
// Vẽ ở cỡ thật vào canvas nhỏ rồi phóng kiểu điểm ảnh. Trả về canvas và vị trí điểm cầm.
function wSpr(opts, ang, pull) {
  const R = 84, [cv, c] = mk(R * 2, R * 2);
  WA.draw(c, opts, R, R, ang, pull || 0);
  return { cv: cv, R: R };
}
// Đặt vũ khí đứng nghỉ: tâm ngang tại cx, đáy tại by.
function putW(c, opts, cx, by, s, o) {
  o = o || {};
  const ang = o.ang == null ? WA.REST[opts.type] : o.ang;
  const sp = wSpr(opts, ang, o.pull), sz = WA.size(opts).box;
  let gx, gy;
  if (o.grip) { gx = cx; gy = by; } // đặt theo điểm cầm
  else { gx = cx - ((sz.x0 + sz.x1 + 1) / 2) * s; gy = by - (sz.y1 + 1) * s; }
  c.imageSmoothingEnabled = false;
  c.drawImage(sp.cv, Math.round(gx - sp.R * s), Math.round(gy - sp.R * s), sp.cv.width * s, sp.cv.height * s);
  return { gx: gx, gy: gy };
}
const COLS = [{ b: null, st: 0 }];
for (const b of WA.BRANCHES) for (let st = 1; st <= 3; st++) COLS.push({ b: b, st: st });
const colOpts = (type, fam, ci, extra) => Object.assign({ type: type, family: fam, branch: COLS[ci].b, stage: COLS[ci].st, rarity: 0, mood: 'calm', t: 1 }, extra || {});

// ---------- bảng nhiều dòng, mỗi dòng 10 hình ----------
// rows: [{ type, family }], o: { title, sub, scale, cellH, be }
function bang(rows, o) {
  const W = 1600, s = o.scale || 2, left = 150, cw = (W - left - 16) / 10, top = o.sub ? 150 : 118, ch = o.cellH || 190;
  const [cv, c] = mk(W, top + rows.length * (ch + 8) + 20);
  c.fillStyle = PAGE; c.fillRect(0, 0, cv.width, cv.height);
  text(c, o.title, 24, 50, 36, GOLDT, true);
  if (o.sub) wrap(c, o.sub, W - 48, 19, false).forEach((l, i) => text(c, l, 24, 82 + i * 26, 19, SOFT));
  // tiêu đề cột
  const hy = top - 34;
  for (let i = 0; i < 10; i++) {
    const x = left + i * cw, col = COLS[i].b ? ELCOL[COLS[i].b] : CREAM;
    rr(c, x + 3, hy, cw - 6, 28, 6, COLS[i].b ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)');
    text(c, COLS[i].b ? ELNAME[COLS[i].b] + ' · ' + WA.STAGES[COLS[i].st] : 'Gốc (Trắng)', x + cw / 2, hy + 20, 15, col, true, 'center');
  }
  rows.forEach((r, ri) => {
    const y = top + ri * (ch + 8), F = WA.FAMILIES[r.type][r.family];
    rr(c, 8, y, W - 16, ch, 10, ri % 2 ? PANEL : PANEL2);
    const nm = wrap(c, F.name, left - 22, 19, true);
    nm.forEach((l, i) => text(c, l, 20, y + 30 + i * 23, 19, CREAM, true));
    text(c, 'Dòng ' + (r.family + 1), 20, y + 34 + nm.length * 23, 13, SOFT);
    wrap(c, 'Tính ' + F.nature, left - 22, 14, false).forEach((l, i) => text(c, l, 20, y + 54 + nm.length * 23 + i * 17, 14, GOLDT));
    const by = y + ch - 30;
    for (let i = 0; i < 10; i++) {
      const cx = left + i * cw + cw / 2, op = colOpts(r.type, r.family, i);
      if (i > 0 && COLS[i].st === 1) { c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(left + i * cw, y + 8, 2, ch - 16); }
      if (o.be && i === 0) {
        const bx = WA.size(op).box, ww = bx.x1 - bx.x0 + 1, wx = cx + 9 * s, bex = Math.min(cx - 14 * s, wx - (ww / 2 + 8) * s);
        shadow(c, bex, by, 7, s); putBe(c, BE_OF[r.type], bex, by, s);
        putW(c, op, wx, by, s);
      } else putW(c, op, cx, by, s);
      const nmw = wrap(c, WA.name(op), cw - 4, 12, false);
      nmw.forEach((l, k) => text(c, l, cx, y + ch - 14 + k * 12 - (nmw.length - 1) * 6, 12, i ? ELCOL[COLS[i].b] : CREAM, false, 'center'));
    }
  });
  return cv;
}
function xemSom() {
  return bang([{ type: 'sword', family: 0 }, { type: 'sword', family: 1 }, { type: 'bow', family: 0 }], {
    title: 'Vũ khí sống: xem sớm nét vẽ', scale: 3, cellH: 262, be: true,
    sub: 'Hai dòng kiếm và một dòng cung, mỗi dòng 10 hình: 1 hình gốc và 3 nhánh Lửa, Độc, Băng, mỗi nhánh 3 giai đoạn. Em bé cao 25 điểm ảnh đứng cạnh hình gốc để so cỡ.',
  });
}
function bang100(type) {
  const rows = []; for (let f = 0; f < WA.FAMILIES[type].length; f++) rows.push({ type: type, family: f });
  const tall = type === 'spear';
  return bang(rows, { title: '100 hình ' + TYPEVN[type] + ' sống', scale: 3, cellH: tall ? 290 : type === 'bow' ? 200 : 236, be: true,
    sub: 'Mỗi hàng là một dòng. Cột đầu là hình gốc, kế đó là ba nhánh tiến hóa Lửa, Độc, Băng, mỗi nhánh ba giai đoạn. Em bé cao 25 điểm ảnh đứng cạnh hình gốc để so cỡ.' });
}

// ---------- tiến hóa một dòng: từ hình gốc tỏa ra ba nhánh ----------
function arrow(c, x0, y0, x1, y1, col, w) {
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w || 5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0), h = 16;
  c.beginPath(); c.moveTo(x1 + Math.cos(a) * 8, y1 + Math.sin(a) * 8); c.lineTo(x1 - Math.cos(a - 0.5) * h, y1 - Math.sin(a - 0.5) * h); c.lineTo(x1 - Math.cos(a + 0.5) * h, y1 - Math.sin(a + 0.5) * h); c.closePath(); c.fill();
}
function tienHoaPanel(c, type, fam, y, s, rowH) {
  const W = 1600, F = WA.FAMILIES[type][fam], H = rowH * 3 + 70;
  rr(c, 12, y, W - 24, H, 14, PANEL);
  text(c, 'Dòng ' + F.name, 32, y + 42, 28, CREAM, true);
  text(c, 'Tính ' + F.nature + '. Hình dạng đổi thật ở mỗi giai đoạn, không chỉ đổi màu.', 32, y + 68, 17, SOFT);
  const bx = 220, byMid = y + 70 + rowH * 1.5, colX = [560, 900, 1250];
  // hình gốc
  const base = colOpts(type, fam, 0), by0 = byMid + rowH * 0.42;
  shadow(c, bx - 16 * s, by0, 7, s); putBe(c, BE_OF[type], bx - 16 * s, by0, s);
  putW(c, base, bx + 12 * s, by0, s);
  text(c, WA.name(base), bx, by0 + 34, 20, CREAM, true, 'center');
  text(c, 'Gốc (' + WA.STAGES[0] + ')', bx, by0 + 58, 15, SOFT, false, 'center');
  WA.BRANCHES.forEach((b, bi) => {
    const ry = y + 70 + bi * rowH, by = ry + rowH - 56, col = ELCOL[b];
    rr(c, 400, ry + 6, W - 424, rowH - 12, 10, 'rgba(255,255,255,0.04)');
    text(c, 'Nhánh ' + ELNAME[b], 414, ry + 32, 19, col, true);
    arrow(c, bx + 100, byMid + (bi - 1) * 40, 470, ry + rowH / 2, col, 6);
    for (let st = 1; st <= 3; st++) {
      const op = { type: type, family: fam, branch: b, stage: st, rarity: 0, mood: 'calm', t: 1 }, cx = colX[st - 1];
      putW(c, op, cx, by, s);
      text(c, WA.name(op), cx, by + 30, 19, col, true, 'center');
      text(c, 'Giai đoạn ' + st + ': ' + WA.STAGES[st], cx, by + 50, 14, SOFT, false, 'center');
      if (st < 3) arrow(c, cx + 120, ry + rowH / 2, cx + 205, ry + rowH / 2, col, 5);
    }
  });
  return H;
}
function tienHoa() {
  const s = 4, [cv, c] = mk(1600, 100 + (3 * 320 + 70) + 24 + (3 * 270 + 70) + 24);
  c.fillStyle = PAGE; c.fillRect(0, 0, cv.width, cv.height);
  text(c, 'Vũ khí tiến hóa: một dòng, mười hình', 24, 50, 36, GOLDT, true);
  text(c, 'Từ hình gốc, vũ khí rẽ sang một trong ba nhánh Lửa, Độc, Băng rồi lớn dần qua ba giai đoạn Mầm, Thành hình, Thức tỉnh.', 24, 82, 19, SOFT);
  let y = 100;
  y += tienHoaPanel(c, 'sword', 0, y, s, 320) + 24;
  tienHoaPanel(c, 'bow', 0, y, s, 270);
  return cv;
}

// ---------- bốn bậc đặt cạnh nhau ----------
const BAC_PICK = {
  sword: [[0, null, 0], [3, 'fire', 2], [8, 'ice', 3]],
  bow: [[0, null, 0], [5, 'poison', 2], [9, 'fire', 3]],
  spear: [[1, null, 0], [3, 'ice', 2], [5, 'poison', 3]],
  hammer: [[0, null, 0], [5, 'fire', 2], [9, 'ice', 3]],
};
function slot(c, op, x, y, sz) {
  const R = WA.RARITY[op.rarity];
  c.fillStyle = '#0e0c12'; c.fillRect(x - 2, y - 2, sz + 4, sz + 4);
  c.fillStyle = R.frame; c.fillRect(x, y, sz, sz);
  c.fillStyle = R.bg; c.fillRect(x + 4, y + 4, sz - 8, sz - 8);
  c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(x + 4, y + 4, sz - 8, 4);
  // biểu tượng vẽ ở cỡ thật (ô 26 điểm ảnh) rồi phóng to
  const [iv, ic] = mk(26, 26); WA.icon(ic, op, 13, 13, 24);
  c.imageSmoothingEnabled = false; c.drawImage(iv, x + 4, y + 4, sz - 8, sz - 8);
}
function bonBac() {
  const W = 1600, s = 3, rowH = { sword: 330, bow: 290, spear: 380, hammer: 320 };
  let H = 124; for (const t of WA.TYPES) H += rowH[t] + 12;
  const [cv, c] = mk(W, H + 12);
  c.fillStyle = PAGE; c.fillRect(0, 0, W, cv.height);
  text(c, 'Bốn bậc: Thường, Lam, Tím, Vàng', 24, 50, 36, GOLDT, true);
  wrap(c, 'Bậc là lớp trang trí phủ lên bất kỳ hình nào, không đổi hình bóng. Lam: đai màu, một viên đá nhỏ, họa tiết chấm thưa. Tím: đá to hơn, viền mạ tím, họa tiết chấm dày, tua tím. Vàng: mạ vàng cả hai mép, họa tiết liền, tua dài có hạt, ánh lấp lánh. Ô vuông bên dưới là ô đồ với màu khung của bậc.', W - 48, 18, false).forEach((l, i) => text(c, l, 24, 80 + i * 24, 18, SOFT));
  let y = 124;
  for (const type of WA.TYPES) {
    const h = rowH[type], gw = (W - 24) / 3;
    BAC_PICK[type].forEach((pk, gi) => {
      const gx = 12 + gi * gw;
      rr(c, gx + 4, y, gw - 8, h, 12, gi % 2 ? PANEL : PANEL2);
      const b0 = { type: type, family: pk[0], branch: pk[1], stage: pk[2], rarity: 0, mood: 'calm', t: 1 };
      text(c, WA.name(b0), gx + gw / 2, y + 28, 19, pk[1] ? ELCOL[pk[1]] : CREAM, true, 'center');
      for (let r = 0; r < 4; r++) {
        const op = Object.assign({}, b0, { rarity: r, t: 1.0 + r * 0.0 }), cx = gx + 20 + (gw - 40) * (r + 0.5) / 4, R = WA.RARITY[r];
        putW(c, op, cx, y + h - 92, s);
        slot(c, op, cx - 30, y + h - 82, 60);
        text(c, R.name, cx, y + h - 6, 15, R.col, true, 'center');
      }
    });
    y += h + 12;
  }
  return cv;
}

// ---------- bốn trạng thái mặt ----------
const MOODS = [['calm', 'Bình thường'], ['attack', 'Lúc đánh'], ['hurt', 'Bị đau'], ['sleep', 'Ngủ']];
const BC_PICK = [
  { type: 'sword', family: 0, branch: null, stage: 0 }, { type: 'sword', family: 3, branch: 'fire', stage: 3 },
  { type: 'sword', family: 2, branch: 'ice', stage: 2 }, { type: 'bow', family: 3, branch: null, stage: 0 },
  { type: 'bow', family: 4, branch: 'poison', stage: 2 }, { type: 'spear', family: 1, branch: null, stage: 0 },
  { type: 'hammer', family: 0, branch: 'fire', stage: 2 }, { type: 'hammer', family: 9, branch: null, stage: 0 },
];
function bieuCam() {
  const W = 1600, s = 4, rowH = 330, gw = (W - 24) / 2;
  const [cv, c] = mk(W, 110 + Math.ceil(BC_PICK.length / 2) * (rowH + 12) + 12);
  c.fillStyle = PAGE; c.fillRect(0, 0, W, cv.height);
  text(c, 'Biểu cảm: mặt vũ khí đổi theo tình huống', 24, 50, 36, GOLDT, true);
  text(c, 'Bình thường thì chớp mắt, lúc đánh thì trợn mắt há miệng, bị đau thì nhắm tịt, ngủ thì bay chữ z. Cung ở cột "Lúc đánh" đang giương dây.', 24, 82, 18, SOFT);
  BC_PICK.forEach((pk, i) => {
    const gx = 12 + (i % 2) * gw, y = 110 + Math.floor(i / 2) * (rowH + 12);
    rr(c, gx + 4, y, gw - 8, rowH, 12, (i + Math.floor(i / 2)) % 2 ? PANEL : PANEL2);
    const b0 = Object.assign({ rarity: 0 }, pk), F = WA.FAMILIES[pk.type][pk.family];
    text(c, WA.name(b0) + '  ·  tính ' + F.nature, gx + 22, y + 30, 18, pk.branch ? ELCOL[pk.branch] : CREAM, true);
    MOODS.forEach((m, k) => {
      const cx = gx + 16 + (gw - 32) * (k + 0.5) / 4, op = Object.assign({}, b0, { mood: m[0], t: 0.45 });
      putW(c, op, cx, y + rowH - 40, s, { pull: m[0] === 'attack' ? 0.9 : 0 });
      text(c, m[1], cx, y + rowH - 12, 15, SOFT, true, 'center');
    });
  });
  return cv;
}

// ---------- cỡ thật trên nền phòng game ----------
// Mỗi mục: em bé đứng tại (x, y) trong khung 480x270, vũ khí lơ lửng cạnh bên.
const SCENE = [
  { be: 'do', x: 60, y: 200, w: { type: 'sword', family: 0, branch: null, stage: 0, rarity: 0 }, dx: 14, dy: -8, ang: -90 },
  { be: 'do', x: 118, y: 168, w: { type: 'sword', family: 3, branch: 'fire', stage: 3, rarity: 3 }, dx: 15, dy: -8, ang: -90 },
  { be: 'do', x: 150, y: 222, w: { type: 'sword', family: 8, branch: 'ice', stage: 2, rarity: 2, mood: 'attack' }, dx: 12, dy: -14, ang: 15 },
  { be: 'xanh', x: 205, y: 190, w: { type: 'bow', family: 0, branch: null, stage: 0, rarity: 0 }, dx: 16, dy: -17, ang: 0 },
  { be: 'xanh', x: 252, y: 225, w: { type: 'bow', family: 9, branch: 'fire', stage: 2, rarity: 1, mood: 'attack' }, dx: 17, dy: -18, ang: 0, pull: 1 },
  { be: 'xanh', x: 262, y: 166, w: { type: 'bow', family: 2, branch: 'poison', stage: 3, rarity: 2 }, dx: 18, dy: -18, ang: 0 },
  { be: 'lam', x: 318, y: 200, w: { type: 'spear', family: 1, branch: null, stage: 0, rarity: 0 }, dx: 12, dy: -16, ang: -90 },
  { be: 'lam', x: 352, y: 228, w: { type: 'spear', family: 3, branch: 'ice', stage: 3, rarity: 3, mood: 'attack' }, dx: 10, dy: -12, ang: -20 },
  { be: 'cam', x: 408, y: 196, w: { type: 'hammer', family: 0, branch: null, stage: 0, rarity: 0 }, dx: 15, dy: -6, ang: -90 },
  { be: 'cam', x: 446, y: 228, w: { type: 'hammer', family: 5, branch: 'fire', stage: 3, rarity: 3 }, dx: 16, dy: -6, ang: -90 },
  { be: 'cam', x: 386, y: 160, w: { type: 'hammer', family: 9, branch: 'poison', stage: 1, rarity: 1, mood: 'sleep' }, dx: 15, dy: -6, ang: -90 },
];
function coThat(bg) {
  const s = 3, W = 1600, [room, rc] = mk(480, 270);
  if (bg) rc.drawImage(bg, 0, 0); else { rc.fillStyle = '#3d5a2a'; rc.fillRect(0, 0, 480, 270); }
  SCENE.slice().sort((a, b) => a.y - b.y).forEach((e) => {
    rc.fillStyle = 'rgba(0,0,0,0.3)'; rc.fillRect(e.x - 5, e.y - 1, 10, 1); rc.fillRect(e.x - 7, e.y, 14, 1); rc.fillRect(e.x - 5, e.y + 1, 10, 1);
    const upright = e.ang === -90, sz = WA.size(e.w).box;
    // vũ khí đứng thì đáy chạm gần mặt đất, có bóng riêng
    let gx = e.x + e.dx, gy = e.y + e.dy;
    if (upright) { gy = e.y - 2 - sz.y1; rc.fillStyle = 'rgba(0,0,0,0.26)'; rc.fillRect(gx - 4, e.y, 8, 1); rc.fillRect(gx - 3, e.y + 1, 6, 1); }
    if (e.w.type === 'bow') { rc.fillStyle = 'rgba(0,0,0,0.26)'; rc.fillRect(gx - 5, e.y, 9, 1); }
    const b = be(e.be);
    rc.drawImage(b.cv, e.x + b.dx, e.y + b.dy);
    WA.draw(rc, Object.assign({ mood: 'calm', t: 0.4 }, e.w), gx, gy, e.ang, e.pull || 0);
  });
  const [cv, c] = mk(W, 110 + 270 * s + 60 + 270 + 60);
  c.fillStyle = PAGE; c.fillRect(0, 0, W, cv.height);
  text(c, 'Cỡ thật trong phòng game', 24, 50, 36, GOLDT, true);
  text(c, 'Khung game 480 x 270 điểm ảnh, phóng 3 lần. Em bé cao 25 điểm ảnh; kiếm gần gấp đôi em bé, cung nhỉnh hơn người, giáo dài nhất, búa đầu to.', 24, 82, 18, SOFT);
  c.imageSmoothingEnabled = false;
  c.drawImage(room, 80, 110, 480 * s, 270 * s);
  const y2 = 110 + 270 * s + 44;
  text(c, 'Đúng từng điểm ảnh (không phóng), như trên màn hình khi game chạy ở tỉ lệ 1:', 80, y2 - 12, 17, SOFT);
  c.drawImage(room, 80, y2);
  text(c, 'Từ trái sang: bé áo đỏ với ba thanh kiếm, bé áo xanh với ba cây cung,', 590, y2 + 40, 17, CREAM);
  text(c, 'bé áo lam với hai cây giáo, bé áo cam với ba cây búa.', 590, y2 + 64, 17, CREAM);
  text(c, 'Có đủ hình gốc, hình đã tiến hóa, các bậc khác nhau, và vài món đang đánh hoặc ngủ.', 590, y2 + 96, 17, SOFT);
  return cv;
}
