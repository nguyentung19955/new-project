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
