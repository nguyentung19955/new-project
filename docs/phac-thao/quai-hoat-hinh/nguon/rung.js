// Vùng Rừng già (hệ Độc): 8 quái thường + 2 tinh anh. Bảng màu dùng chung của bản chốt: LUCR, NAUG, TIMD, DOCX.
const DAT = [NAUG[2], NAUG[1], NAUG[3]], LA = [LUCR[2], LUCR[1], LUCR[3]], DOC = [DOCX[0], DOCX[1], DOCX[3]], TIM = [TIMD[1], TIMD[2], TIMD[3]], ONG = ['#c4801a', '#ffc83c', '#fff6b0'];
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .6 : -.6) : 0);
// ---- Heo Rừng Con: đầu chúi, chân đạp, bờm dựng; lao húc ----
def('heoCon', { ten: 'Heo Rừng Con', vung: 'rung', loai: 'thuong', tt: 1, luoi: () => QR.heo(), don: { kieu: 'lao', tam: 46, rong: 14, mau: DAT }, chet: { k: 'ra', mau: DAT }, hien: { k: 'bui', mau: DAT },
  parts: [{ n: 'dau', m: [[2, 16, 22, 39]], pv: [21, 27] }, { n: 'chanT', m: [[8, 33, 21, 41]], pv: [15, 33], z: -1 }, { n: 'chanS', m: [[37, 32, 52, 41]], pv: [44, 32], z: -1 },
    { n: 'bom', m: [[12, 6, 47, 17]], pv: [30, 17], keep: 0 }, { n: 'bui', m: [[50, 20, 60, 36]], pv: [50, 28] }],
  anims: {
    idle: A(1.2, P => { const u = P.u; P.tho(.03); P.r('dau', 3 * sn(u)).r('chanT', 4 * sn(u * 2) * (u > .5 ? 1 : 0)); P.s('bom', 1, 1 + .1 * sn(u)); P.s('bui', 0); }),
    move: A(.45, P => { const u = P.u; CH.move(P); P.r('chanT', 26 * sn(u)).r('chanS', -26 * sn(u)).r('dau', 4 * sn(u * 2)); P.s('bom', 1, 1 + .12 * sn(u * 2)); P.m('bui', 2 * sn(u * 2), 0); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -12 * k).m('dau', -1 * k, 2 * k); P.r('chanS', 20 * sn(u * 4) * k); P.s('bom', 1, 1 + .3 * k); P.s('bui', 0);
      P.under(c => F.khoi(c, P.x + 14 * P.face * -1, P.y, 6, (u * 3) % 1, DAT, (u * 3) | 0)); }),
    atk: A(.6, P => { const u = P.u, k = kf(u, [[0, -1], [.15, 1, 'out'], [.5, 1], [1, 0]]); CH.atk(P); P.theo(10 * k); P.r('dau', -16 * k).r('chanT', 30 * sn(u * 3)).r('chanS', -30 * sn(u * 3)); P.s('bom', 1, 1 + .3 * k); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 18 * k).r('chanT', -15 * k); P.s('bom', 1, 1 - .3 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -40 * k).r('chanS', 40 * k); P.s('bom', 1, 1 - .5 * k); P.s('bui', 0); }),
    spawn: A(1.1, P => { CH.spawn(P); P.r('chanT', 25 * sn(P.u * 4) * (P.u > .7 ? 1 : 0)); }),
  } });
// ---- Bầy Ong Vò Vẽ: ba con ong, cánh vẫy rất nhanh ----
function ongNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3; P.m('ong' + i, sn(ph) * 1.2, sn(ph * 2 + .25) * (amp || 1.5)); P.r('ong' + i, 6 * sn(ph)); P.s('canh' + i, 1, ((P.t * 24 + i) | 0) % 2 ? .35 : 1); }); }
def('ongVo', { ten: 'Bầy Ong Vò Vẽ', vung: 'rung', loai: 'thuong', tt: 2, luoi: () => QR.ong(), bay: true, cao: 8, don: { kieu: 'lao', tam: 36, rong: 18, mau: ONG }, chet: { k: 'bui', mau: ONG }, hien: { k: 'bay', xa: 40, cao: 30 },
  parts: [{ n: 'ong1', m: [[5, 3, 26, 22]], pv: [16, 14] }, { n: 'ong2', m: [[26, 5, 49, 31]], pv: [36, 19] }, { n: 'ong3', m: [[3, 16, 26, 40]], pv: [15, 29] },
    { n: 'canh1', m: [[12, 2, 25, 11]], pv: [17, 11], cha: 'ong1' }, { n: 'canh2', m: [[30, 6, 41, 17]], pv: [34, 17], cha: 'ong2' }, { n: 'canh3', m: [[12, 16, 25, 25]], pv: [16, 25], cha: 'ong3' }],
  anims: {
    idle: A(1.2, P => { ongNhip(P, 3, 1.5); P.h += sn(P.u) * 1.5; }),
    move: A(.6, P => { ongNhip(P, 4, 1); P.rot += -4; [1, 2, 3].forEach(i => P.m('ong' + i, -2 * sn(P.u + i / 3), 0)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); ongNhip(P, 8, .5); P.theo(-3 * k); P.r('ong1', -20 * k).r('ong2', -20 * k).r('ong3', -20 * k); P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; ongNhip(P, 8, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.1 + i * .08, -14, 'in'], [.5 + i * .05, -10], [1, 0]]); P.m('ong' + i, q, 0); P.r('ong' + i, -25 * (1 - u)); }); P.theo(kf(u, [[0, -3], [.25, 6, 'out'], [1, 0]])); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('ong1', -3 * k, -4 * k).m('ong2', 5 * k, 0).m('ong3', -3 * k, 4 * k); ongNhip(P, 6, .3); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('ong1', -4 * k, -5 * k).m('ong2', 6 * k, 2 * k).m('ong3', -4 * k, 5 * k); P.r('ong1', 120 * k).r('ong2', -150 * k).r('ong3', 180 * k); }),
  } });
// ---- Bọ Hung Mai Cứng: giơ mai sừng chắn trước, sáu chân bò ----
def('boHung', { ten: 'Bọ Hung Mai Cứng', vung: 'rung', loai: 'thuong', tt: 3, luoi: () => QR.boHung(), don: { kieu: 'dap', tam: 26, mau: LA }, chet: { k: 'vo', mau: ['#1a5a40', '#3a9a5c', '#b4f0b0'] }, hien: { k: 'cat', mau: DAT },
  parts: [{ n: 'mai', m: [[1, 5, 22, 37]], pv: [21, 26] }, { n: 'c1', m: [[20, 32, 30, 41]], pv: [26, 32], z: -1 }, { n: 'c2', m: [[30, 32, 40, 41]], pv: [35, 32], z: -1 }, { n: 'c3', m: [[40, 32, 52, 41]], pv: [45, 32], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.025); P.r('mai', 3 * sn(u)); }),
    move: A(.6, P => { const u = P.u; P.h += Math.abs(sn(u * 2)) * .8; P.rot += 2 * sn(u); P.r('c1', 22 * sn(u * 2)).r('c2', 22 * sn(u * 2 + .33)).r('c3', 22 * sn(u * 2 + .66)); P.r('mai', 4 * sn(u * 2)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('mai', 28 * k).m('mai', 2 * k, -3 * k); P.rot += 8 * k; }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 28], [.2, -14, 'in'], [.45, -8], [1, 0, 'back']]); CH.atk(P); P.r('mai', a); P.rot += kf(u, [[0, 8], [.2, -6, 'in'], [1, 0]]); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('mai', -12 * k); P.r('c1', 20 * k).r('c3', -20 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('mai', -30 * k).m('mai', -3 * k, 2 * k); P.r('c1', 40 * k).r('c2', 20 * k).r('c3', -30 * k); }),
  } });
// ---- Hoa Phun Bào Tử: đầu hoa lắc, há miệng phun viên bào tử ----
def('hoaBaoTu', { ten: 'Hoa Phun Bào Tử', vung: 'rung', loai: 'thuong', tt: 4, luoi: () => QR.hoa(), don: { kieu: 'ban', tam: 70, rong: 7, co: 3, mau: DOC, mom: [8, 16] }, chet: { k: 'heo', mau: [NAUG[0], NAUG[1], NAUG[2], '#7a6a3a'] }, hien: { k: 'moc', mau: LA },
  parts: [{ n: 'dau', m: [[2, 3, 36, 28]], pv: [33, 26] }, { n: 'la', m: [[35, 3, 48, 29]], pv: [36, 25] }, { n: 'bao', m: [[3, 8, 12, 23]], pv: [8, 16], cha: 'dau' }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.r('dau', 6 * sn(u)).s('dau', 1 + .03 * sn(u * 2)); P.r('la', -8 * sn(u + .2)); P.m('bao', 0, 1.5 * sn(u * 2)); }),
    move: A(.9, P => { const u = P.u; P.sh += 3 * sn(u); P.sy *= 1 + .05 * sn(u * 2); P.r('dau', 10 * sn(u)).r('la', -12 * sn(u)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'out'], [1, 1]]); P.r('dau', 22 * k).r('la', -16 * k); P.s('bao', 1 + .6 * k); P.x += rung(u, .45); P.flash = u > .75 ? ((u * 24 | 0) % 2 ? .3 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 22], [.15, -18, 'in'], [.45, -10], [1, 0, 'back']]); P.r('dau', a).r('la', -a * .6); P.s('bao', u < .12 ? 1.6 : 0); P.sy *= kf(u, [[0, .92], [.15, 1.08], [.5, 1]]); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', -24 * k).r('la', 18 * k); }),
    die: A(1.4, P => { const k = kf(P.u, [[0, 0], [.3, 1, 'out']]); CH.die(P); P.r('dau', -50 * k).m('dau', 0, 6 * k).r('la', 40 * k); P.s('bao', 1 - k); }),
    spawn: A(1.2, P => { const u = P.u, k = 1 - seg(u, .4, .9); CH.spawn(P); P.r('dau', 40 * k).r('la', -30 * k); }),
  } });
// ---- Chồn Bóng: thân dài, đuôi lượn, lao vụt để lại vệt bóng tím ----
def('chonBong', { ten: 'Chồn Bóng', vung: 'rung', loai: 'thuong', tt: 5, luoi: () => QR.chon(), don: { kieu: 'lao', tam: 62, rong: 10, mau: TIM }, chet: { k: 'hon', mau: TIM }, hien: { k: 'bong', mau: ['#221836', '#40305e'] },
  parts: [{ n: 'dau', m: [[2, 10, 19, 31]], pv: [18, 20] }, { n: 'duoi', m: [[42, 2, 64, 24]], pv: [42, 19], keep: 0 }, { n: 'chanT', m: [[3, 22, 15, 32]], pv: [11, 22], z: -1 }, { n: 'chanS', m: [[45, 23, 58, 32]], pv: [50, 23], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.w('duoi', 8, -u, .25).r('dau', 3 * sn(u)); }),
    move: A(.4, P => { const u = P.u; CH.move(P); P.r('chanT', 30 * sn(u)).r('chanS', -30 * sn(u)); P.w('duoi', 10, -u * 2, .25); P.bongMa = [{ x: 6 * -P.face, a: .25, mau: TIMD[2] }]; }),
    tele: A(.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -8 * k).b('duoi', -25 * k); P.r('chanS', -15 * k); }),
    atk: A(.55, P => { const u = P.u, k = kf(u, [[0, 0], [.2, 1, 'out'], [.55, 1], [1, 0]]); P.theo(18 * k - 2); P.sx *= 1 + .15 * k; P.sy *= 1 - .1 * k; P.r('chanT', -30 * k).r('chanS', 30 * k).b('duoi', -20 * k);
      if (u < .6) P.bongMa = [1, 2, 3].map(i => ({ x: -P.fx * i * 7, y: -P.fy * i * 7, a: .35 - i * .09, mau: TIMD[2] })); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 30 * k).b('duoi', 40 * k).r('chanT', -40 * k).r('chanS', 40 * k); }),
  } });
// ---- Nấm Phồng: mũ nhún; lại gần thì phồng to (đổi sang hình phồng) rồi nổ khí độc ----
const khiDoc = (c, x, y, r, e, s) => { F.a(c, (1 - e) * .5); F.khoi(c, x, y, r, e * .7, [DOCX[2], DOCX[1], TIMD[3]], s, 7); F.a(c, 1); };
def('namPhong', { ten: 'Nấm Phồng', vung: 'rung', loai: 'thuong', tt: 6, luoi: (p, hv) => QR.nam(hv === 'phong'), don: { kieu: 'no', tam: 34, mau: DOC }, chet: { k: 'no', mau: DOC }, hien: { k: 'tu', mau: [TIMD[2], DOCX[2], DOCX[3]] },
  parts: hv => hv === 'phong' ? [] : [{ n: 'mu', m: [[18, 23, 46, 38]], pv: [32, 38] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.05); P.s('mu', 1 + .05 * sn(u + .25), 1 - .05 * sn(u + .25)); }),
    move: A(.5, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .1 - .05; P.sx *= 1 - s * .08 + .04; P.r('mu', 5 * sn(u)); }),
    tele: A(.8, P => { const u = P.u; P.sx *= 1 + .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.flash = u > .6 ? ((u * 24 | 0) % 2 ? .4 : 0) : 0; P.fxBao(); }, { hinh: u => u > .45 ? 'phong' : 0 }),
    atk: A(.9, P => { const u = P.u, cy = -P.B.bh * .4; P.sx *= 1 + seg(u, 0, .15) * .2; P.sy *= 1 + seg(u, 0, .15) * .2; P.flash = u < .18 ? (((u * 30) | 0) % 2 ? .8 : .2) : 0; P.a = u < .2 ? 1 : seg(u, .88, 1); P.bong = P.a; if (u >= .88) { const s = seg(u, .88, 1); P.sx *= s; P.sy *= s; }
      if (u > .18) { P.under(c => khiDoc(c, 0, 0, 30, seg(u, .2, 1), 4)); P.fxDon(seg(u, .18, .8)); } }, { hinh: u => u < .2 ? 'phong' : 0 }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .15 * k, 1 - .2 * k); }),
    die: A(1.1, P => { CH.die(P); if (P.u > .25) P.under(c => khiDoc(c, 0, 0, 22, seg(P.u, .25, 1), 2)); }),
  } });
// ---- Sóc Ném Quả Nổ: ôm quả nổ, đuôi xù; ném quả nổ vòng cung ----
let BOM_R = null; const quaNo = (c, x, y, q) => { F.luoi(c, BOM_R || (BOM_R = QR.bom()), x, y, { rot: q * 9 }); };
def('socNo', { ten: 'Sóc Ném Quả Nổ', vung: 'rung', loai: 'thuong', tt: 7, luoi: () => QR.soc(), don: { kieu: 'nem', tam: 56, rong: 14, vong: 26, mau: [TIMD[1], '#ff8a1e', '#fff6b0'], mom: [10, 24], dan: (c, x, y, q) => quaNo(c, x, y, q) }, chet: { k: 'chay', mau: ['#ff8a1e', '#c43c10', '#48424e'] }, hien: { k: 'roi', cao: 80, mau: LA },
  parts: [{ n: 'qua', m: [[3, 19, 17, 36]], pv: [16, 28] }, { n: 'duoi', m: [[28, 3, 52, 36]], pv: [31, 30], keep: 0 }, { n: 'dau', m: [[9, 4, 28, 22]], pv: [22, 22] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.w('duoi', 6, -u, .2).r('dau', 3 * sn(u)).m('qua', 0, .8 * sn(u * 2)); }),
    move: A(.45, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 4; P.sy *= 1 + s * .08 - .04; P.rot += 4 * sn(u); P.b('duoi', 14 * sn(u)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('qua', 70 * k).m('qua', 6 * k, -10 * k).r('dau', 8 * k).b('duoi', 15 * k); }),
    atk: A(.75, P => { const u = P.u, a = kf(u, [[0, 70], [.1, -50, 'in'], [.3, -30], [1, 0, 'back']]); CH.atk(P); P.r('qua', a).m('qua', 6 * (1 - seg(u, 0, .15)), -10 * (1 - seg(u, 0, .15))); P.s('qua', u > .08 && u < .9 ? 0 : 1); P.b('duoi', -10 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 25 * k).m('qua', 2 * k, -2 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).b('duoi', 35 * k).r('qua', -40 * k); if (P.u < .3) P.over(c => { const m = P.pt(10, 28); F.dia(c, m[0], m[1], 2 + P.u * 30, P.u < .15 ? '#fff6b0' : '#ff8a1e'); }); }),
  } });
// ---- Nhím Gai Độc: lúc báo trước và ra đòn thì xù gai (đổi sang hình xù), bắn gai độc ----
def('nhimDoc', { ten: 'Nhím Gai Độc', vung: 'rung', loai: 'thuong', tt: 8, luoi: (p, hv) => QR.nhim(hv === 'xu'), don: { kieu: 'gai', tam: 36, so: 10, mau: [TIMD[1], DOCX[2], '#ffffff'] }, chet: { k: 'tan', mau: [TIMD[2], NAUG[2], DOCX[2]] }, hien: { k: 'ghep', mau: [NAUG[1], TIMD[2]] },
  parts: hv => hv === 'xu' ? [] : [{ n: 'dau', m: [[18, 42, 34, 56]], pv: [33, 50] }],
  anims: {
    idle: A(1.5, P => { const u = P.u; P.tho(.035); P.r('dau', 4 * sn(u)); }),
    move: A(.55, P => { const u = P.u; CH.move(P); P.r('dau', 5 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u; CH.tele(P); P.sy *= 1 + .06 * seg(u, .3, .4); }, { hinh: u => u > .3 ? 'xu' : 0 }),
    atk: A(.6, P => { const u = P.u; P.sx *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.sy *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.fxDon(); }, { hinh: u => u < .7 ? 'xu' : 0 }),
    hit: A(.35, P => { CH.hit(P); }, { hinh: u => u < .5 ? 'xu' : 0 }),
  } });
// ---- TINH ANH: Heo Rừng Nanh Dài. Chiêu riêng: húc ba lần liền (zíc zắc) ----
def('heoNanh', { ten: 'Heo Rừng Nanh Dài', vung: 'rung', loai: 'tinhanh', tt: 1, luoi: () => QR.heoNanh(), don: { kieu: 'lao', tam: 64, rong: 22, mau: DAT }, chet: { k: 'chim', mau: DAT }, hien: { k: 'khoi', mau: ['#5a6a50', '#8a9a80', '#c0d0b0'] },
  parts: [{ n: 'dau', m: [[0, 18, 33, 57]], pv: [32, 40] }, { n: 'chanT', m: [[13, 47, 31, 57]], pv: [22, 47], z: -1 }, { n: 'chanS', m: [[58, 46, 77, 58]], pv: [67, 46], z: -1 }, { n: 'bui', m: [[77, 30, 96, 50]], pv: [78, 40] }, { n: 'bom', m: [[24, 12, 82, 27]], pv: [52, 27], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.r('dau', 3 * sn(u)); P.s('bom', 1, 1 + .12 * sn(u)); P.s('bui', 0); }),
    move: A(.55, P => { const u = P.u; CH.move(P); P.r('chanT', 24 * sn(u)).r('chanS', -24 * sn(u)).r('dau', 4 * sn(u * 2)); P.m('bui', 3 * sn(u * 2), 0); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -12 * k).r('chanS', 25 * sn(u * 4) * k); P.s('bom', 1, 1 + .35 * k); P.s('bui', 0); P.under(c => F.khoi(c, P.x - 26 * P.face, P.y, 9, (u * 3) % 1, DAT, (u * 3) | 0)); }),
    atk: A(.65, P => { const u = P.u, k = kf(u, [[0, -1], [.15, 1, 'out'], [.5, 1], [1, 0]]); CH.atk(P); P.theo(12 * k); P.r('dau', -18 * k).r('chanT', 30 * sn(u * 3)).r('chanS', -30 * sn(u * 3)); P.s('bom', 1, 1 + .35 * k); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k); P.s('bom', 1, 1 - .3 * k); }),
    die: A(1.4, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -40 * k).r('chanS', 40 * k); P.s('bom', 1, 1 - .5 * k); P.s('bui', 0); }),
    chieu1: A(2.1, P => { const u = P.u, q = (u * 3) % 1; CHIEU.laoNhieu(P, 3, 60, 22, DAT, .6); P.r('dau', q > .45 ? -18 : -8 * q / .45).r('chanT', 30 * sn(u * 9)).r('chanS', -30 * sn(u * 9)); P.s('bom', 1, 1.35); P.s('bui', 0); }, { nhan: 'Chiêu: húc ba lần' }),
  } });
// ---- TINH ANH: Nấm Phồng Chúa. Chiêu riêng: mưa bào tử (phun 5 quả rơi quanh, để lại khí độc) ----
def('namPhongChua', { ten: 'Nấm Phồng Chúa', vung: 'rung', loai: 'tinhanh', tt: 2, luoi: () => QR.namPhongChua(), don: { kieu: 'no', tam: 44, mau: [TIMD[2], DOCX[2], '#f4ffb0'] }, chet: { k: 'no', mau: [TIMD[2], DOCX[1], DOCX[3]] }, hien: { k: 'moc', mau: TIM },
  parts: [{ n: 'mu', m: [[18, 18, 70, 52]], pv: [44, 52] }],
  anims: {
    idle: A(1.5, P => { const u = P.u; P.tho(.04); P.s('mu', 1 + .04 * sn(u + .25), 1 - .04 * sn(u + .25)); P.under(c => khiDoc(c, 0, -4, 26, (u + .3) % 1, 1)); }),
    move: A(.6, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .08 - .04; P.r('mu', 4 * sn(u)); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); P.s('mu', 1 + .15 * k, 1 - .1 * k); P.sy *= 1 - .08 * k; P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.7, P => { const u = P.u; P.s('mu', kf(u, [[0, 1.15], [.15, .9], [.4, 1.05], [1, 1]]), kf(u, [[0, .9], [.15, 1.15], [1, 1]])); P.under(c => khiDoc(c, 0, 0, 40, u, 6)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .12 * k, 1 - .15 * k); }),
    die: A(1.4, P => { CH.die(P); if (P.u > .25) P.under(c => khiDoc(c, 0, 0, 40, seg(P.u, .25, 1), 3)); }),
    chieu1: A(1.9, P => { const u = P.u; CHIEU.muaNem(P, 5, 60, 10, DOC, null, (c, x, y, e, i) => khiDoc(c, x, y, 12, e, i)); P.s('mu', 1 + .12 * Math.abs(sn(u * 5)) * (u > .3 && u < .8 ? 1 : 0), 1); }, { nhan: 'Chiêu: mưa bào tử' }),
  } });
