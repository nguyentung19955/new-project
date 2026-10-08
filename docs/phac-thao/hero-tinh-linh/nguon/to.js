// Xếp các tờ phác thảo "em bé tinh linh". Hình lấy từ G.tinhLinh (game/js/hero_tinhlinh.js).
'use strict';
const TL = G.tinhLinh, TO = {};
const FONT = '"Inter","DejaVu Sans",sans-serif';
const PAGE = '#1c1921', PANEL = '#2b2632', PANEL2 = '#332d3b', CREAM = '#f1ead9', SOFT = '#cfc5b4', GOLDT = '#ffd27a';
const HK = ['smith', 'hunter', 'healer', 'wrestler'];
const HCOL = { smith: '#ffb070', hunter: '#a8e08a', healer: '#9db8ff', wrestler: '#ff8f7a' };
const HW = { smith: 'sword', hunter: 'bow', healer: 'spear', wrestler: 'hammer' };

function mk(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
function rr(c, x, y, w, h, r, fill) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); }
function text(c, s, x, y, px, col, bold, align) { c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT; c.fillStyle = col; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }
function wrap(c, s, maxW, px, bold) {
  c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONT;
  const out = []; let cur = '';
  for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function para(c, s, x, y, maxW, px, col, lh, align) { const ls = wrap(c, s, maxW, px, false); ls.forEach((l, i) => text(c, l, x, y + i * lh, px, col, false, align)); return ls.length; }
// Vẽ một bé (kèm vũ khí, bóng) phóng s lần, chân đặt tại (x,y). o: như tham số của G.art.hero, thêm anim, f, v để chọn khung.
function put(c, o, x, y, s) {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s);
  TL.hero(c, Object.assign({ x: 0, y: 0, face: 1, atk: -1, dodge: -1, t: 0, anim: 'idle', f: 0, v: 0 }, o));
  c.restore();
}
const W = (type, el) => (type ? { type, coat: el || null, tier: 0 } : null);
// Chỉ một lớp của bé (để tách lớp).
function putLayer(c, key, outfit, only, x, y, s) {
  const of = TL.outfitOf(key, { outfit }), ps = TL.pose(key, 'none', 'idle', 0, 0);
  const sp = TL.kidSprite(key, of, ps, '', only);
  c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(x - sp.ox * s), Math.round(y - sp.oy * s), sp.cv.width * s, sp.cv.height * s);
}
function cut(cv, h) { const [o, oc] = mk(cv.width, h); oc.drawImage(cv, 0, 0); return o; }

// ---------- ảnh xem thử lúc làm ----------
TO.xem = function (list, s, cols, cwU, chU, oxU, oyU) {
  s = s || 8; cols = cols || 4;
  const cw = (cwU || 60) * s, ch = (chU || 64) * s, rows = Math.ceil(list.length / cols);
  const [cv, c] = mk(cw * cols, ch * rows);
  c.fillStyle = PANEL; c.fillRect(0, 0, cv.width, cv.height);
  list.forEach((o, i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * ch; c.strokeStyle = '#444'; c.strokeRect(x, y, cw, ch); c.fillStyle = '#3a3444'; c.fillRect(x, y + (oyU || 56) * s, cw, s); put(c, o, x + (oxU || 24) * s, y + (oyU || 56) * s, s); if (o.note) text(c, o.note, x + 6, y + 18, 14, CREAM); });
  return cv;
};
const seq = (key, wt, anim, n, v, extra) => Array.from({ length: n }, (_, f) => Object.assign({ key, weapon: W(wt), anim, f, v: v || 0, note: anim + ' ' + f }, extra || {}));

// ---------- đồ dùng chung cho các tờ ----------
const NAME = { smith: 'Thợ Rèn', hunter: 'Thợ Săn', healer: 'Thầy Lang', wrestler: 'Đô Vật' };
const WNAME = { sword: 'Kiếm', bow: 'Cung', spear: 'Giáo', hammer: 'Búa' };
function page(w, h, title, intro) {
  const [cv, c] = mk(w, h);
  c.fillStyle = PAGE; c.fillRect(0, 0, w, h);
  text(c, title, 26, 80, 56, GOLDT, true);
  const n = intro ? para(c, intro, 26, 130, w - 52, 31, CREAM, 43) : 0;
  return [cv, c, 130 + Math.max(0, n - 1) * 43 + (intro ? 36 : -20)];
}
function panel(c, x, y, w, h, title) { rr(c, x, y, w, h, 18, PANEL); if (title) text(c, title, x + 22, y + 50, 36, GOLDT, true); }
function floor(c, x, y, w) { rr(c, x, y, w, 6, 3, PANEL2); }
// vệt chém hình cung, vẽ theo ô điểm ảnh
function arcFx(c, x, y, s, cx, cy, r, a0, a1, cols) {
  cols = cols || ['#5a6a8a', '#8fa3c4', '#c8d8ee', '#ffffff'];
  for (let py = cy - r - 6; py <= cy + r + 6; py++) for (let px = cx - r - 6; px <= cx + r + 6; px++) {
    const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy); let a = Math.atan2(dy, dx) * 180 / Math.PI;
    while (a < a0) a += 360; const t = (a - a0) / (a1 - a0); if (t < 0 || t > 1) continue;
    if (Math.abs(d - r) > 0.4 + 4.5 * t) continue;
    c.fillStyle = cols[Math.min(3, Math.floor(t * 4))]; c.fillRect(x + px * s, y + py * s, s, s);
  }
}
function arrow(c, x0, y0, x1, y1, col, wd) {
  const a = Math.atan2(y1 - y0, x1 - x0), w = wd || 6;
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * w * 2, y1 - Math.sin(a) * w * 2); c.stroke();
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * w * 3.6, y1 - Math.sin(a - 0.45) * w * 3.6); c.lineTo(x1 - Math.cos(a + 0.45) * w * 3.6, y1 - Math.sin(a + 0.45) * w * 3.6); c.closePath(); c.fill();
}
function badge(c, n, x, y) { c.beginPath(); c.arc(x, y, 22, 0, 7); c.fillStyle = GOLDT; c.fill(); text(c, String(n), x, y + 12, 32, '#2b2632', true, 'center'); }
// dải "cỡ thật trong game": nền phòng của game phóng 3 lần, items: [{o, gx}] với gx tính theo điểm ảnh game
function strip(c, x, y, items, wpx) {
  const sw = Math.floor(wpx / 3), sh = 132, sx = Math.floor((480 - sw) / 2), sy = 100, bg = document.getElementById('bg');
  c.save(); c.beginPath(); c.roundRect(x, y, sw * 3, sh * 3, 14); c.clip();
  c.imageSmoothingEnabled = false; c.drawImage(bg, sx, sy, sw, sh, x, y, sw * 3, sh * 3);
  for (const it of items) put(c, it.o, x + it.gx * 3, y + ((it.gy || 200) - sy) * 3, 3);
  c.restore();
  return sh * 3;
}
const DESC = {
  smith: 'Bé áo đỏ cầm búa rèn tí hon, đi cùng thanh kiếm sống một mắt.',
  hunter: 'Bé áo xanh đeo ống tên, đi cùng cây cung rồng cao hơn cả người.',
  healer: 'Bé áo lam đeo bầu hồ lô sủi bọt thuốc, cầm cây giáo sống.',
  wrestler: 'Bé áo cam quấn khăn đỏ, đeo găng đồng, cầm cây búa chiêng.',
};

// ================= TỜ 1: bốn bé tinh linh =================
TO['bon-be-tinh-linh'] = function () {
  const Wd = 1080, M = 20, CW = (Wd - M * 3) / 2;
  let [cv, c, y] = page(Wd, 2700, 'Bốn em bé tinh linh', 'Bản chibi hơn: đầu to bằng nửa người, thân tròn, mắt to. Vũ khí sống vẫn là ngôi sao. Mũ, áo, cánh của bé tháo ra thay được.');
  const S = 7, CH = 580;
  HK.forEach((k, i) => {
    const cx = M + (i % 2) * (CW + M), cy = y + Math.floor(i / 2) * (CH + M);
    panel(c, cx, cy, CW, CH); floor(c, cx + 14, cy + 410, CW - 28);
    put(c, { key: k, weapon: W(HW[k]) }, cx + CW / 2 - 8 * S, cy + 404, S);
    text(c, NAME[k], cx + CW / 2, cy + 470, 46, HCOL[k], true, 'center');
    para(c, DESC[k], cx + CW / 2, cy + 514, CW - 36, 30, CREAM, 38, 'center');
  });
  y += 2 * (CH + M);
  const AH = 570;
  panel(c, M, y, CW, AH, 'Lúc đang đánh'); floor(c, M + 14, y + 496, CW - 28);
  const ax = M + CW / 2 - 60, ay = y + 490, as = 6;
  arcFx(c, ax, ay, as, 8, -22, 36, -100, 18);
  put(c, { key: 'smith', weapon: W('sword'), anim: 'atk', f: 4, v: 0 }, ax, ay, as);
  text(c, 'Kiếm tự chém, kéo cả bé bay theo', M + CW / 2, y + 544, 28, SOFT, false, 'center');
  const wx = M * 2 + CW;
  panel(c, wx, y, CW, AH, 'Thay mũ, áo, mọc cánh'); floor(c, wx + 14, y + 496, CW - 28);
  put(c, { key: 'smith', outfit: { hat: 'non_la', robe: 'ao_toi', hand: null } }, wx + CW * 0.15, y + 490, 5);
  put(c, { key: 'smith', outfit: { hat: 'mu_sung', robe: 'ao_da', hand: null, wing: { kind: 'lua', level: 1 } } }, wx + CW * 0.45, y + 490, 5);
  put(c, { key: 'smith', outfit: { hat: 'khan_xep', robe: 'ao_the', hand: null, wing: { kind: 'lua', level: 3 } } }, wx + CW * 0.86, y + 490, 5);
  para(c, 'Cùng một bé áo đỏ, ba bộ đồ khác nhau. Xem thêm ở tờ "mac-do".', wx + CW / 2, y + 100, CW - 60, 26, SOFT, 34, 'center');
  text(c, 'Đổi món nào, thấy ngay trên người', wx + CW / 2, y + 544, 28, SOFT, false, 'center');
  y += AH + M;
  text(c, 'Cỡ thật trong game', M + 6, y + 44, 36, GOLDT, true); y += 62;
  const sw = Math.floor((Wd - 2 * M) / 3);
  y += strip(c, M, y, HK.map((k, i) => ({ o: { key: k, weapon: W(HW[k]) }, gx: Math.round(sw * (0.12 + i * 0.25)) })), Wd - 2 * M) + M;
  return cut(cv, y);
};

// ================= TỜ 2: mặc đồ =================
TO['mac-do'] = function () {
  const Wd = 1080, M = 20;
  let [cv, c, y] = page(Wd, 3600, 'Em bé mặc đồ được', 'Mỗi bé là một thân trần cộng các món đồ vẽ chồng lên. Đổi mũ, đổi áo, gắn cánh thì hình trên người đổi theo ngay.');
  // --- tách lớp ---
  const H1 = 800; panel(c, M, y, Wd - 2 * M, H1, 'Các lớp chồng từ sau ra trước');
  const key = 'healer', of = { wing: { kind: 'chuon', level: 2 } }, mx = Wd / 2 + 30, my = y + 600;
  floor(c, mx - 190, my + 6, 380);
  put(c, { key, outfit: of, weapon: W('spear') }, mx - 10, my, 10);
  text(c, 'Bé hoàn chỉnh', mx, my + 60, 30, CREAM, true, 'center');
  const tiles = [
    ['lung', '1', 'Lưng', 'cánh, bầu hồ lô', 70, y + 90, 1],
    ['than', '2', 'Thân trần', 'đầu to, mặt nạ trắng', 70, y + 320, 1],
    ['ao', '3', 'Áo', 'phủ thân và tay', 70, y + 550, 1],
    ['mu', '4', 'Mũ', 'đội trên đầu', Wd - 290, y + 90, -1],
    ['mat', '5', 'Dấu mặt, găng tay', 'tùy chọn', Wd - 290, y + 320, -1],
    ['vk', '6', 'Vũ khí sống', 'trước hoặc sau bé', Wd - 290, y + 550, -1],
  ];
  for (const t of tiles) {
    const tx = t[4], ty = t[5];
    rr(c, tx, ty, 220, 210, 14, PANEL2);
    if (t[0] === 'vk') { const sp = TL.weaponSprite('spear', 'thuong', 'idle', -28, 0); c.drawImage(sp.cv, Math.round(tx + 76 - sp.ox * 3), Math.round(ty + 116 - sp.oy * 3), sp.cv.width * 3, sp.cv.height * 3); }
    else if (t[0] === 'mat') { putLayer(c, 'wrestler', {}, 'mat', tx + 60, ty + 232, 8); putLayer(c, 'wrestler', {}, 'tay', tx + 150, ty + 190, 8); }
    else putLayer(c, key, of, t[0], tx + (t[0] === 'lung' ? 150 : 110), ty + 142, 6);
    badge(c, t[1], tx + 28, ty + 28);
    text(c, t[2], tx + 110, ty + 172, 26, CREAM, true, 'center');
    text(c, t[3], tx + 110, ty + 198, 20, SOFT, false, 'center');
    const fromX = t[6] > 0 ? tx + 228 : tx - 8, toX = t[6] > 0 ? mx - 150 : mx + 150;
    arrow(c, fromX, ty + 105, toX, my - 130 + (ty - y - 320) * 0.25, GOLDT, 5);
  }
  y += H1 + M;
  // --- sáu bộ đồ ---
  const H2 = 420; panel(c, M, y, Wd - 2 * M, H2, 'Cùng một bé, sáu bộ đồ');
  const sets = [
    [{}, 'Áo trùm', '(bộ khởi đầu)'], [{ hat: 'non_la', robe: 'ao_toi' }, 'Nón lá', 'áo tơi lá'], [{ hat: 'khan_xep', robe: 'ao_the' }, 'Khăn xếp', 'áo the'],
    [{ hat: 'mu_rom', robe: 'giap_tre' }, 'Mũ rơm', 'giáp tre'], [{ hat: 'mu_sung', robe: 'ao_da' }, 'Mũ sừng', 'áo da'], [{ hat: 'vong_la', robe: 'ao_la' }, 'Vòng lá', 'áo lá'],
  ];
  const cw = (Wd - 2 * M) / 6;
  floor(c, M + 14, y + 306, Wd - 2 * M - 28);
  sets.forEach((s, i) => {
    const x = M + cw * i + cw / 2;
    put(c, { key, outfit: Object.assign({ back: null }, s[0]) }, x, y + 300, 6);
    text(c, s[1], x, y + 350, 25, CREAM, true, 'center'); text(c, s[2], x, y + 382, 23, SOFT, false, 'center');
  });
  y += H2 + M;
  // --- cánh lớn dần ---
  const H3 = 400; panel(c, M, y, Wd - 2 * M, H3, 'Cánh lớn dần');
  floor(c, M + 14, y + 306, Wd - 2 * M - 28);
  const cw4 = (Wd - 2 * M) / 4;
  [[0, 'Chưa có cánh'], [1, 'Mầm cánh'], [2, 'Cánh vừa'], [3, 'Cánh lớn']].forEach((q, i) => {
    const x = M + cw4 * i + cw4 / 2 + 30;
    put(c, { key, outfit: { back: null, wing: { kind: 'chuon', level: q[0] } } }, x, y + 300, 6);
    text(c, q[1], x - 20, y + 356, 27, CREAM, true, 'center');
    if (i < 3) arrow(c, x + 80, y + 346, x + 130, y + 346, '#6a6078', 5);
  });
  y += H3 + M;
  const H4 = 400; panel(c, M, y, Wd - 2 * M, H4, 'Ba kiểu cánh theo hệ');
  floor(c, M + 14, y + 306, Wd - 2 * M - 28);
  const cw3 = (Wd - 2 * M) / 3;
  [['lua', 'Hệ Lửa: cánh lửa', '#ff9a4a'], ['la', 'Hệ Độc: cánh lá', '#a6e05a'], ['bang', 'Hệ Băng: cánh băng', '#9fdcff']].forEach((q, i) => {
    const x = M + cw3 * i + cw3 / 2 + 50;
    put(c, { key, outfit: { back: null, wing: { kind: q[0], level: 3 } } }, x, y + 300, 6);
    text(c, q[1], x - 40, y + 356, 27, q[2], true, 'center');
  });
  y += H4 + M;
  text(c, 'Cỡ thật trong game: vẫn nhận ra mũ, áo, cánh', M + 6, y + 44, 36, GOLDT, true); y += 62;
  const sw = Math.floor((Wd - 2 * M) / 3);
  const real = [
    { key: 'healer', outfit: { wing: { kind: 'chuon', level: 1 } }, weapon: W('spear') }, { key: 'smith', outfit: { hat: 'non_la', robe: 'ao_toi', wing: { kind: 'lua', level: 2 } } },
    { key: 'hunter', outfit: { hat: 'khan_xep', robe: 'ao_the', back: null, wing: { kind: 'la', level: 3 } } }, { key: 'wrestler', outfit: { hat: 'mu_rom', robe: 'giap_tre' } },
    { key: 'healer', outfit: { hat: 'mu_sung', robe: 'ao_da', back: null, wing: { kind: 'bang', level: 3 } } }, { key: 'hunter', outfit: { hat: 'vong_la', robe: 'ao_la', wing: { kind: 'chuon', level: 3 } } },
  ];
  y += strip(c, M, y, real.map((o, i) => ({ o, gx: Math.round(sw * (0.1 + i * 0.16)) })), Wd - 2 * M) + M;
  return cut(cv, y);
};

// ================= TỜ 3: trước và sau =================
TO['truoc-va-sau'] = function () {
  const Wd = 1080, M = 20, RH = 400;
  let [cv, c, y] = page(Wd, 2400, 'Trước và sau', 'Bên trái là bản bạn đã ưng. Bên phải là bản mới, sửa theo lời bạn dặn.');
  const notes = {
    smith: ['Đầu to hơn, thân ngắn lại, mắt to.', 'Vẫn búa rèn tí hon và thanh kiếm sống một mắt.', 'Mũ và áo giờ tháo ra thay được.'],
    hunter: ['Cung rồng to hơn hẳn người: cao gấp 1,4 lần bé.', 'Mũi tên cất vào ống tên đeo lưng.'],
    healer: ['Không cưỡi bầu nữa: bầu hồ lô đeo sau lưng, dây đỏ, miệng có lá, sủi bọt thuốc.', 'Cầm cây giáo sống.'],
    wrestler: ['Bỏ đôi nắm đấm bay.', 'Cầm cây búa sống, đầu to như chiêng đồng.', 'Bé đeo găng đồng, quấn khăn đỏ.'],
  };
  HK.forEach((k, i) => {
    panel(c, M, y, Wd - 2 * M, RH);
    text(c, NAME[k], M + 22, y + 48, 38, HCOL[k], true);
    floor(c, M + 14, y + RH - 50, 610);
    const he = CU.h.heroes[i], sp = CU.sprite(he.draw), s = 5, ox = M + 150 - (he.dx || 0) * s, fy = y + RH - 56;
    c.fillStyle = 'rgba(0,0,0,0.32)'; c.fillRect(ox + ((he.bx || 0) - (he.bw || 9)) * s, fy, (he.bw || 9) * 2 * s, s);
    c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(ox - sp.ox * s), Math.round(fy - sp.oy * s), sp.cv.width * s, sp.cv.height * s);
    text(c, 'Bản cũ', M + 150, y + RH - 14, 24, SOFT, false, 'center');
    arrow(c, M + 290, y + RH - 150, M + 350, y + RH - 150, GOLDT, 6);
    put(c, { key: k, weapon: W(HW[k]) }, M + 450, fy, s);
    text(c, 'Bản mới', M + 480, y + RH - 14, 24, CREAM, true, 'center');
    let ty = y + 110;
    for (const n of notes[k]) { c.fillStyle = GOLDT; c.fillRect(M + 650, ty - 14, 10, 10); ty += para(c, n, M + 672, ty, 350, 25, CREAM, 33) * 33 + 12; }
    y += RH + M;
  });
  return cut(cv, y);
};

// ================= TỜ 4: mỗi bé bốn vũ khí =================
TO['moi-be-bon-vu-khi'] = function () {
  const Wd = 1080, M = 20, L0 = 176, cw = (Wd - M - L0) / 4, ch = 270, s = 4;
  let [cv, c, y] = page(Wd, 1600, 'Mỗi bé, bốn loại vũ khí', 'Game có bốn loại vũ khí dùng chung. Bé nào cũng đi cùng được cả bốn. Ô viền vàng là vũ khí quen tay của bé.');
  const WK = ['sword', 'bow', 'spear', 'hammer'];
  WK.forEach((w, j) => text(c, WNAME[w], L0 + cw * j + cw / 2, y + 30, 34, GOLDT, true, 'center'));
  y += 50;
  HK.forEach((k, i) => {
    text(c, NAME[k], M + 4, y + ch / 2 + 10, 27, HCOL[k], true);
    WK.forEach((w, j) => {
      const x = L0 + cw * j;
      rr(c, x + 5, y + 5, cw - 10, ch - 10, 14, PANEL);
      if (G.HEROES[k].fav.indexOf(w) >= 0) { c.strokeStyle = '#a8843a'; c.lineWidth = 3; c.beginPath(); c.roundRect(x + 5, y + 5, cw - 10, ch - 10, 14); c.stroke(); }
      floor(c, x + 20, y + ch - 28, cw - 40);
      put(c, { key: k, weapon: W(w) }, x + cw / 2 - 26, y + ch - 32, s);
    });
    y += ch;
  });
  return cut(cv, y + M);
};

// ================= TỜ 5: động tác =================
TO['dong-tac'] = function () {
  const Wd = 1080, M = 20, s = 4;
  let [cv, c, y] = page(Wd, 3400, 'Động tác', 'Một bé mặc đủ nón lá, áo tơi, cánh. Bé làm gì thì mũ vẫn bám đầu, áo bám thân, cánh bám lưng.');
  const X = { key: 'hunter', outfit: { hat: 'non_la', robe: 'ao_toi', back: null, wing: { kind: 'chuon', level: 2 } } };
  const row = (title, items, h, base, note) => {
    panel(c, M, y, Wd - 2 * M, h, title);
    if (note) text(c, note, Wd - M - 22, y + 48, 25, SOFT, false, 'right');
    floor(c, M + 14, y + base + 6, Wd - 2 * M - 28);
    const cw = (Wd - 2 * M) / items.length;
    items.forEach((it, i) => {
      const x = M + cw * i + cw / 2 + (it.dx || 0);
      if (it.arc) arcFx(c, x, y + base, s, it.arc[0], it.arc[1], it.arc[2], it.arc[3], it.arc[4]);
      put(c, Object.assign({}, X, it.o), x, y + base, s);
      if (it.t) text(c, it.t, M + cw * i + cw / 2, y + h - 18, 24, CREAM, false, 'center');
    });
    y += h + M;
  };
  const A = (w, f, v) => ({ weapon: W(w), anim: 'atk', f, v: v || 0 });
  row('Đi lại', [
    { o: { weapon: W('sword'), anim: 'idle', f: 0 }, t: 'Đứng', dx: -30 }, { o: { weapon: W('sword'), anim: 'run', f: 1 }, t: 'Chạy', dx: -50 }, { o: { weapon: W('sword'), anim: 'run', f: 5 }, t: 'Chạy', dx: -50 },
    { o: { weapon: W('sword'), anim: 'dodge', f: 2 }, t: 'Né: lộn một vòng', dx: -50 },
  ], 330, 262);
  row('Dính đòn và ra chiêu', [
    { o: { weapon: W('sword'), anim: 'hurt', f: 0, flash: false }, t: 'Trúng đòn', dx: -30 }, { o: { weapon: W('sword'), anim: 'die', f: 2 }, t: 'Ngã', dx: -30 },
    { o: { weapon: W('sword'), anim: 'die', f: 7 }, t: 'Gục, vũ khí rơi theo', dx: -30 }, { o: { weapon: W('bow'), anim: 'cast', f: 3 }, t: 'Ra chiêu', dx: -20 },
  ], 330, 262);
  row('Kiếm', [{ o: A('sword', 1), t: 'Kiếm tự vung lên', dx: 10 }, { o: A('sword', 4), t: 'Chém xuống', arc: [8, -20, 38, -110, 20], dx: -40 }, { o: A('sword', 6), t: 'Kéo bé bay theo', dx: -50 }, { o: A('sword', 9), t: 'Thả bé xuống', dx: -20 }], 400, 320, 'Kiếm tự chém, kéo bé bay theo');
  row('Cung', [{ o: A('bow', 0), t: 'Bé nắm dây', dx: -30 }, { o: A('bow', 3), t: 'Cung chồm tới, căng dây', dx: -40 }, { o: A('bow', 6), t: 'Buông tên', dx: -40 }, { o: A('bow', 9), t: 'Cung rung rung', dx: -30 }], 330, 262, 'Cung rồng ngậm dây tự căng, bé bám vào dây');
  row('Giáo', [{ o: A('spear', 2), t: 'Giáo lùi lấy đà', dx: -60 }, { o: A('spear', 5), t: 'Lao tới, bé đu theo', dx: -90 }, { o: A('spear', 8), t: 'Hạ bé xuống', dx: -70 }], 300, 232, 'Giáo lao đi, bé đu theo');
  row('Búa', [{ o: A('hammer', 1), t: 'Búa tự nhấc lên', dx: -10 }, { o: A('hammer', 3), t: 'Ngả ra sau', dx: 10 }, { o: A('hammer', 6), t: 'Nện xuống', dx: -50 }, { o: A('hammer', 8), t: 'Hất bé lên trời', dx: -50 }], 450, 380, 'Búa nện xuống, hất bé lên');
  return cut(cv, y);
};
