// TRÙM VÙNG Lâu đài cổ: HỒ TINH, dáng "RÌNH MỒI" (phương án 2 trong quai-ban-chot/ho-tinh-ve-lai.png): thân hạ thấp, đầu chúi, chín đuôi toả rộng, đầu đuôi có lửa ma xanh.
// Pha 1 kiêu kỳ; pha 2 phân thân (mắt tím, bóng cáo mờ lượn hai bên); pha 3 hoá cuồng (to gấp rưỡi, lửa trùm thân).
const MA_X = ['#1a3a9a', '#3a7aff', '#bfe8ff'], TIMX = ['#3a1060', '#9a48d4', '#e4a8ff'], LUA = [LUAV[0], LUAV[2], LUAV[3]];
const mauHT = P => P.phase === 2 ? TIMX : MA_X;
const TB = [124, 84], GOC = [-141, -123, -107, -88, -66, -46, -23, 4, 27], DAI = [70, 70, 72, 74, 76, 76, 70, 62, 58];
const kHT = ph => ph === 3 ? 1.5 : 1;
// đầu đuôi thứ i (toạ độ trên hình gốc, đã tính cỡ pha)
const dinhDuoi = (i, ph) => { const k = kHT(ph), a = GOC[i] * PI / 180; return [(TB[0] + Math.cos(a) * DAI[i]) * k, (TB[1] + Math.sin(a) * DAI[i]) * k]; };
const HT_PARTS = ph => { const k = kHT(ph), S = q => q.map(p => [p[0] * k, p[1] * k]), L = [
  { n: 'chanT', m: [{ p: S([[36, 102], [84, 100], [84, 120], [36, 120]]) }], pv: [76 * k, 101 * k], z: -1 }, { n: 'chanS', m: [{ p: S([[94, 98], [146, 98], [146, 120], [94, 120]]) }], pv: [108 * k, 98 * k], z: -1 },
  { n: 'dau', m: [{ p: S([[20, 66], [80, 70], [88, 96], [76, 106], [40, 106], [20, 104]]) }], pv: [82 * k, 92 * k] }];
  for (let i = 0; i < 9; i++) { const a0 = (i ? (GOC[i - 1] + GOC[i]) / 2 : GOC[0] - 16) * PI / 180, a1 = (i < 8 ? (GOC[i] + GOC[i + 1]) / 2 : 36) * PI / 180, pts = [];
    for (let j = 0; j <= 6; j++) { const a = a0 + (a1 - a0) * j / 6; pts.push([TB[0] + Math.cos(a) * 18, TB[1] + Math.sin(a) * 18]); }
    for (let j = 6; j >= 0; j--) { const a = a0 + (a1 - a0) * j / 6; pts.push([TB[0] + Math.cos(a) * 125, TB[1] + Math.sin(a) * 125]); }
    const g = GOC[i] * PI / 180; L.push({ n: 'd' + i, m: [{ p: S(pts) }], pv: [(TB[0] + Math.cos(g) * 16) * k, (TB[1] + Math.sin(g) * 16) * k], keep: 0, z: 1 + i * .01 }); }
  return L; };
// đuôi phe phẩy: biên độ a, nhịp sp
function vayDuoi(P, a, sp, b) { for (let i = 0; i < 9; i++) P.w('d' + i, a, -P.u * sp + i * .11, .06).r('d' + i, (b || 0) * sn(P.u * sp * .5 + i * .1)); }
// cầu lửa ma
const cauMa = (c, x, y, r, C) => { F.dia(c, x, y, r + 1, C[0]); F.dia(c, x, y - .5, r, C[1]); F.dia(c, x - r * .2, y - r * .3, r * .55, C[2]); F.px(c, x - r * .3, y - r * .5, '#ffffff'); };
const cotLuaMa = (c, x, y, e, C, t, s) => { const h = 34 * Math.sin(Math.min(1, e * 1.4) * PI * .5) * (1 - seg(e, .7, 1)); if (h < 1) return; F.lua(c, x, y, 9, h, t, [C[0], C[1], C[2], '#ffffff'], s); F.a(c, .5); F.elip(c, x, y, 9, 3, C[1]); F.a(c, 1); };
def('hoTinh', { ten: 'Hồ Tinh', vung: 'laudai', loai: 'trum', tt: 1, pha: 3, luoi: p => HT_than(2, p), parts: HT_PARTS,
  anims: {
    // Ra mắt: đốm lửa ma bay tụ lại thành hình cáo, chín đuôi xoè ra như quạt, ngóc đầu gào, lửa đầu đuôi bùng lên.
    intro: A(3, P => { const u = P.u, C = mauHT(P), q = seg(u, .1, .55), xoe = EASE.back(seg(u, .5, .75));
      if (q < 1) P.tan = { k: 'tu', u: q, mau: [C[0], C[1], C[2]] }; for (let i = 0; i < 9; i++) P.r('d' + i, (GOC[4] - GOC[i]) * (1 - xoe)).s('d' + i, .5 + .5 * Math.min(1, xoe));
      const g = kf(u, [[.72, 0], [.8, 1, 'out'], [.92, 1], [1, 0]]); P.r('dau', 14 * g); P.sy *= 1 + .04 * g; P.bong = q; if (u > .75 && u < .92) P.x += ((u * 40) | 0) % 2 ? .8 : -.8;
      P.under(c => { if (u > .72) { F.song(c, 0, 0, 120, seg(u, .74, 1), [C[2], C[1]], 3); F.song(c, 0, 0, 85, seg(u, .8, 1), [C[1], C[0]], 2); } });
      P.over(c => { if (u < .55) for (let i = 0; i < 16; i++) { const a = hh(i, 2, 1) * TAU, r = 140 * (1 - seg(u, hh(i, 3, 1) * .2, .55)), x = Math.cos(a + u * 3) * r, y = -50 + Math.sin(a + u * 3) * r * .6; if (r > 2) F.lua(c, x, y + 4, 4, 8, P.t + i, [C[0], C[1], C[2], '#ffffff'], i); }
        if (u > .74) for (let i = 0; i < 9; i++) { const d = dinhDuoi(i, P.phase), m = P.pt(d[0], d[1]), e = seg(u, .74, 1); F.hat(c, m[0], m[1], 6, i, e, { v: 14, goc: -PI / 2, xoe: 2, cols: [C[2], C[1]] }); } }); }, { nhan: 'Ra mắt' }),
    idle: A(2.4, P => { const u = P.u; P.tho(.02); vayDuoi(P, 7, 1, 4); P.r('dau', 2 * sn(u)).m('dau', -1 * sn(u * 2), 0); }),
    // Di chuyển: bước rón rén sát đất, đuôi lượn sóng.
    move: A(1.1, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.5; P.rot += 1.5 * sn(u); P.r('chanT', 22 * sn(u)).r('chanS', -22 * sn(u)); vayDuoi(P, 10, 2, 6); P.r('dau', 3 * sn(u * 2)); }),
    // Chiêu 1: HỒ HOẢ. Lửa đầu chín đuôi bùng to, bắn chín cầu lửa ma bay vòng cung xuống chín chỗ quanh bé.
    c1: A(2.4, P => { const u = P.u, C = mauHT(P), T = []; for (let i = 0; i < 9; i++) { const a = P.dir + (i - 4) * .22, r = 70 + 45 * hh(i, 4, 4); T.push([Math.cos(a) * r, Math.sin(a) * r * MA.det, .36 + i * .04]); }
      vayDuoi(P, u < .35 ? 4 : 10, u < .35 ? 4 : 2, 3); P.r('dau', u < .35 ? -6 * u / .35 : -6);
      P.under(c => { for (const [x, y, t0] of T) if (u < t0 + .18) F.baoTron(c, x, y, 10, clamp(u / (t0 + .18), 0, 1)); });
      P.over(c => { for (let i = 0; i < 9; i++) { const d = dinhDuoi(i, P.phase), m = P.pt(d[0], d[1]), [x, y, t0] = T[i], q = seg(u, t0 - .1, t0 + .18), e = seg(u, t0 + .18, t0 + .5);
        if (u < t0 - .1) F.lua(c, m[0], m[1] + 3, 4 + 4 * Math.min(1, u / .3), 9 + 10 * Math.min(1, u / .3), P.t + i, [C[0], C[1], C[2], '#ffffff'], i);
        else if (q < 1) { const px = lerp(m[0], x, q), py = lerp(m[1], y, q) - Math.sin(q * PI) * 30; for (let t = 1; t < 5; t++) { const qq = Math.max(0, q - t * .04); F.a(c, .5 - t * .1); F.dia(c, lerp(m[0], x, qq), lerp(m[1], y, qq) - Math.sin(qq * PI) * 30, 3 - t * .5, C[1]); } F.a(c, 1); cauMa(c, px, py, 3, C); }
        if (e > 0 && e < 1) { if (e < .3) F.dia(c, x, y - 3, 4 + e * 20, C[2]); F.lua(c, x, y, 7 * (1 - e), 16 * (1 - e), P.t + i, [C[0], C[1], C[2], '#ffffff'], i); F.hat(c, x, y - 3, 12, i, e, { v: 14, cols: ['#ffffff', C[2], C[1]], to: 2 }); } } }); }, { nhan: 'Chiêu 1: hồ hoả', moc: [.36, .8] }),
    // Chiêu 2: VỒ MỒI. Rạp mình rồi vồ hai lần liền (zíc zắc), để bóng mờ, cuối cú vồ có vết vuốt.
    c2: A(2, P => { const u = P.u, C = mauHT(P), q = (u * 2) % 1; CHIEU.laoNhieu(P, 2, 96, 26, [C[0], C[1], '#ffffff'], .5); vayDuoi(P, 8, 3, 0); P.r('chanT', q > .45 ? -30 : 10 * q / .45).r('chanS', q > .45 ? 25 : 0).r('dau', q > .45 ? -10 : 4);
      if (q > .55 && q < .85) { const k = Math.min(1, u * 2) | 0, dir = P.dir + (k - .5) * .5, x = Math.cos(dir) * 92, y = Math.sin(dir) * 92 * MA.det; P.over(c => { for (let j = 0; j < 3; j++) F.liem(c, x + j * 3 - 3, y - 14 + j * 3, 16, dir + PI / 2, 1.6, seg(q, .55, .85), [C[0], C[1], '#ffffff'], 2); }); } }, { nhan: 'Chiêu 2: vồ mồi', moc: [.22, .9] }),
    // Chiêu 3: QUẠT ĐUÔI. Chín đuôi kéo về một bên rồi quét mạnh, ba lớp vệt lửa ma hình trăng khuyết, sàn cháy lửa xanh.
    c3: A(2.2, P => { const u = P.u, C = mauHT(P), tam = 120, span = 2.6;
      if (u < .42) { const v = EASE.out(u / .42); for (let i = 0; i < 9; i++) P.r('d' + i, -25 * v).b('d' + i, -15 * v); P.rot += -4 * v; P.under(c => F.baoQuat(c, 0, 0, tam, P.dir, span, u / .42)); }
      else if (u < .68) { const v = seg(u, .42, .68), a = lerp(-25, 40, EASE.in(Math.min(1, v * 1.5))); for (let i = 0; i < 9; i++) P.r('d' + i, a).b('d' + i, 20 * (1 - v)); P.rot += lerp(-4, 4, v);
        P.over(c => { F.liem(c, 0, -30, tam - 4, P.dir, span, v, [C[0], C[1], '#ffffff'], 10); F.liem(c, 0, -30, tam - 22, P.dir, span * .9, Math.max(0, v - .08), [LUA[0], LUA[1], LUA[2]], 6); F.liem(c, 0, -30, tam - 40, P.dir, span * .8, Math.max(0, v - .16), [C[0], C[1], C[2]], 4); }); }
      else { const v = seg(u, .68, 1); for (let i = 0; i < 9; i++) P.r('d' + i, 40 * (1 - EASE.io(v))); P.under(c => { for (let i = 0; i < 7; i++) { const a = P.dir + (i - 3) / 3 * span * .42, r = tam * (.55 + .3 * hh(i, 1, 2)); F.a(c, 1 - seg(v, .5, 1)); F.lua(c, Math.cos(a) * r, Math.sin(a) * r * MA.det, 6, 12, P.t + i, [C[0], C[1], C[2], '#ffffff'], i); } F.a(c, 1); }); } }, { nhan: 'Chiêu 3: quạt đuôi', moc: [.42, .68] }),
    // Chiêu 4: VÒNG LỬA MA. Hai vòng cột lửa ma bùng lên lần lượt quanh mình (vòng trong rồi vòng ngoài, lệch chỗ nhau để có lối né).
    c4: A(2.5, P => { const u = P.u, C = mauHT(P), V = [[62, 8, 0, .3], [102, 12, PI / 12, .5]]; vayDuoi(P, 6, 3, 8); P.r('dau', 8 * Math.sin(seg(u, .2, .5) * PI)); P.sy *= 1 + .04 * Math.sin(seg(u, .2, .5) * PI);
      P.under(c => { for (const [R, n, lech, t0] of V) for (let i = 0; i < n; i++) { const a = P.dir + lech + i / n * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R * MA.det, ti = t0 + i * .015; if (u < ti) F.baoTron(c, x, y, 11, u / ti); } });
      P.over(c => { for (const [R, n, lech, t0] of V) for (let i = 0; i < n; i++) { const a = P.dir + lech + i / n * TAU, x = Math.cos(a) * R, y = Math.sin(a) * R * MA.det, ti = t0 + i * .015, e = seg(u, ti, ti + .42); if (e > 0 && e < 1) { cotLuaMa(c, x, y, e, C, P.t, i); if (e < .25) F.song(c, x, y, 14, e * 4, [C[2], C[1]], 1); } } }); }, { nhan: 'Chiêu 4: vòng lửa ma', moc: [.3, .92] }),
    // Chiêu 5: BÃO HỒ HOẢ. Xoay đuôi tụ lửa, bắn ba đợt cầu lửa toả tròn xoáy (mỗi đợt lệch nhau để luồn qua khe).
    c5: A(2.4, P => { const u = P.u, C = mauHT(P); CHIEU.vongDan(P, 10, 110, [C[0], C[1], C[2]], 3); for (let i = 0; i < 9; i++) P.r('d' + i, u > .35 ? 12 * sn(u * 4 + i * .1) : 0); vayDuoi(P, 8, 4, 0); }, { nhan: 'Chiêu 5: bão hồ hoả', moc: [.35, .95] }),
    phase2: A(2.4, P => { const u = P.u; TRUM.doiPha(P, TIMX); vayDuoi(P, 12 * seg(u, 0, .45), 4, 0); }, { nhan: 'Chuyển pha 2: phân thân', pha: u => u < .5 ? 1 : 2 }),
    phase3: A(2.6, P => { const u = P.u; TRUM.doiPha(P, LUA); vayDuoi(P, 12, 4, 0); if (u > .5) P.under(c => { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 60 + 50 * seg(u, .5, 1); F.a(c, 1 - seg(u, .8, 1)); F.lua(c, Math.cos(a) * r, Math.sin(a) * r * MA.det, 8, 18, P.t + i, null, i); } F.a(c, 1); }); }, { nhan: 'Chuyển pha 3: hoá cuồng', pha: u => u < .5 ? 2 : 3 }),
    stun: A(1.5, P => { const k = kHT(P.phase); TRUM.choang(P, 44 * k, 74 * k); P.r('dau', 10 + 4 * sn(P.u)); for (let i = 0; i < 9; i++) P.r('d' + i, 6 * sn(P.u + i * .05)).b('d' + i, 25); }, { lap: true }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 12 * k); for (let i = 0; i < 9; i++) P.b('d' + i, 25 * k); }),
    die: A(3.4, P => { const u = P.u, C = mauHT(P); TRUM.chetLon(P, 'hon', [C[0], C[1], C[2]], [C[1], C[2], '#ffffff']); for (let i = 0; i < 9; i++) P.r('d' + i, (GOC[4] - GOC[i]) * .5 * seg(u, 0, .5)).b('d' + i, 30 * seg(u, 0, .5)); P.r('dau', 20 * seg(u, 0, .4)); }, { nhan: 'Chết' }),
  } });
// Lớp phủ theo pha cho mọi cử động: pha 2 có hai bóng cáo mờ màu tím lượn hai bên; pha 3 có lửa liếm khắp thân.
(function () { const d = DEFS.hoTinh; for (const k of Object.keys(d.anims)) { const f = d.anims[k].f; d.anims[k].f = function (P) { f(P);
  if (P.phase === 2 && !P.bongMa && k !== 'die' && !P.tan) { const t = P.t; P.bongMa = [{ x: -46 + 6 * Math.sin(t * 2.2), y: -4 + 3 * Math.sin(t * 3), a: .26 + .08 * Math.sin(t * 4), mau: TIMX[1] }, { x: 46 + 6 * Math.sin(t * 2.6 + 1), y: 4 + 3 * Math.sin(t * 2.4), a: .26 + .08 * Math.sin(t * 4 + 2), mau: TIMX[1] }]; }
  if (P.phase === 3 && !P.tan) { const t = P.t, B = P.B; P.over(c => { for (let i = 0; i < 7; i++) { const sx = B.cx + (hh(i, 1, 7) - .3) * B.bw * .6, sy = B.foot - B.bh * (.25 + .3 * hh(i, 2, 7)), m = P.pt(sx, sy); F.a(c, .75); F.lua(c, m[0], m[1], 5, 10 + 5 * Math.sin(t * 7 + i), t + i, null, i); } F.a(c, 1); }); } }; } })();
