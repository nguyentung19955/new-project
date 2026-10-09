// Vùng Hang biển (hệ Băng): 8 quái thường + 2 tinh anh.
const BANG = ['#4f86b0', '#a9d8ee', '#ffffff'], CAT = ['#d8c08a', '#a88a58', '#f0e0b0'], NUOC = ['#9fd8f5', '#3f8fd0', '#ffffff'];
// Lật toạ độ x cho bộ phận bên phải của hình đối xứng rộng w.
const lat = (w, pts) => pts.map(q => [w - q[0], q[1]]);
// ---- Cua Lính: hai càng (tay + càng), sáu chân ----
const CUA_C = [[[13, 25], [8, 22.5], [2, 31], [5, 33], [9, 27.4], [13, 28.4]], [[13.5, 28.4], [9, 27.6], [6, 34], [9, 36], [11, 30.6], [14, 30.6]], [[13, 31], [17.5, 30.6], [16, 37], [11.5, 37]]];
def('cua', { ten: 'Cua Lính', vung: 'bien', loai: 'thuong', tt: 1, luoi: () => Q2.cua(), don: { kieu: 'chem', tam: 26 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT },
  parts: [
    { n: 'tayT', m: [{ p: [[6, 18], [13, 17.5], [16.5, 21.5], [15, 25.5], [11, 24.5], [6, 21]] }], pv: [14.5, 23] }, { n: 'cangT', m: [[0, 3, 13, 18]], pv: [8, 18], cha: 'tayT' },
    { n: 'tayP', m: [{ p: lat(50, [[6, 18], [13, 17.5], [16.5, 21.5], [15, 25.5], [11, 24.5], [6, 21]]) }], pv: [35.5, 23] }, { n: 'cangP', m: [[36, 3, 49, 18]], pv: [42, 18], cha: 'tayP' },
    { n: 'cT1', m: [{ p: CUA_C[0] }], pv: [13.5, 27], z: -1 }, { n: 'cT2', m: [{ p: CUA_C[1] }], pv: [14, 29.5], z: -1 }, { n: 'cT3', m: [{ p: CUA_C[2] }], pv: [16, 31], z: -1 },
    { n: 'cP1', m: [{ p: lat(50, CUA_C[0]) }], pv: [36.5, 27], z: -1 }, { n: 'cP2', m: [{ p: lat(50, CUA_C[1]) }], pv: [36, 29.5], z: -1 }, { n: 'cP3', m: [{ p: lat(50, CUA_C[2]) }], pv: [34, 31], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.035); P.r('tayT', 3 * sn(u + .2)).r('tayP', -3 * sn(u + .2)).r('cangT', 7 * sn(u)).r('cangP', -7 * sn(u + .1)); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 3 * sn(u + i * .2)); P.r('cP' + i, -3 * sn(u + i * .2)); } }),
    move: A(.5, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.2; P.rot += 3 * sn(u); P.x += sn(u * 2) * .6; for (let i = 1; i <= 3; i++) { P.r('cT' + i, 20 * sn(u * 2 + i / 3)); P.r('cP' + i, 20 * sn(u * 2 + i / 3 + .5)); } P.r('tayT', 6 * sn(u * 2)).r('tayP', 6 * sn(u * 2)).r('cangT', 5 * sn(u * 2 + .3)).r('cangP', 5 * sn(u * 2 + .3)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]), rung = u > .4 ? sn(u * 9) * 6 : 0; CH.tele(P); P.r('tayT', 30 * k).r('tayP', -30 * k).r('cangT', 18 * k + rung).r('cangP', -18 * k - rung); for (let i = 1; i <= 3; i++) { P.r('cT' + i, -8 * k); P.r('cP' + i, 8 * k); } }),
    atk: A(.55, P => { const u = P.u, a = kf(u, [[0, 30], [.2, -42, 'in'], [.45, -30], [1, 0, 'back']]); CH.atk(P); P.r('tayT', a).r('tayP', -a).r('cangT', a * .5).r('cangP', -a * .5); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 10 * sn(u * 2 + i / 3)); P.r('cP' + i, -10 * sn(u * 2 + i / 3)); } }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('tayT', -25 * k).r('tayP', 25 * k).r('cangT', -15 * k).r('cangP', 15 * k); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 14 * k); P.r('cP' + i, -14 * k); } }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.sy *= 1 - .25 * k; P.r('tayT', -45 * k).r('tayP', 45 * k).r('cangT', -20 * k).r('cangP', 20 * k); for (let i = 1; i <= 3; i++) { P.r('cT' + i, 22 * k); P.r('cP' + i, -22 * k); } }),
    spawn: A(1.2, P => { const u = P.u, k = kf(u, [[0, 1], [.7, 1], [.85, 0, 'out'], [.92, .5], [1, 0]]); CH.spawn(P); P.r('tayT', 30 * k).r('tayP', -30 * k).r('cangT', 12 * sn(u * 6) * (u > .6 ? 1 : 0)).r('cangP', -12 * sn(u * 6) * (u > .6 ? 1 : 0)); }),
  } });
// ---- Bầy Cá Con: ba con cá bơi lệch nhịp, đuôi quẫy ----
function caConNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3; P.m('ca' + i, sn(ph) * .8, sn(ph + .25) * (amp || 1.5)); P.r('ca' + i, 4 * sn(ph + .1)); const q = sn(u * sp + i * .37); P.r('duoi' + i, 22 * q).s('duoi' + i, 1 - .25 * Math.abs(q), 1); }); }
def('caCon', { ten: 'Bầy Cá Con', vung: 'bien', loai: 'thuong', tt: 2, luoi: () => Q2.caCon(), bay: true, cao: 4, don: { kieu: 'lao', tam: 40, rong: 16 }, chet: { k: 'bui', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC },
  parts: [{ n: 'ca1', m: [[6, 3, 24, 16]], pv: [14, 11] }, { n: 'ca2', m: [[23, 12, 40, 25]], pv: [30, 19] }, { n: 'ca3', m: [[7, 21, 25, 34]], pv: [15, 28] },
    { n: 'duoi1', m: [[18, 6, 24, 16]], pv: [17, 11], cha: 'ca1' }, { n: 'duoi2', m: [[34, 14, 40, 24]], pv: [33, 19], cha: 'ca2' }, { n: 'duoi3', m: [[19, 23, 25, 33]], pv: [18, 28], cha: 'ca3' }],
  anims: {
    idle: A(1.5, P => { caConNhip(P, 3, 1.5); }),
    move: A(.6, P => { caConNhip(P, 4, 1); P.rot += -3; [1, 2, 3].forEach(i => P.m('ca' + i, -1.5 * sn(P.u + i / 3), 0)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); caConNhip(P, 8, .5); P.theo(-4 * k); P.m('ca1', 3 * k, 3 * k).m('ca2', -3 * k, 0).m('ca3', 3 * k, -3 * k); if (u > .4) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; caConNhip(P, 8, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.12 + i * .08, -12, 'in'], [.5 + i * .05, -9], [1, 0, 'io']]); P.m('ca' + i, q, 0); P.s('ca' + i, 1 + .15 * seg(u, .05 + i * .08, .2 + i * .08) * (1 - seg(u, .3, .6)), 1); }); P.theo(kf(u, [[0, -4], [.25, 6, 'out'], [1, 0]])); P.rot += -P.aim * 12 * (1 - u); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('ca1', -3 * k, -4 * k).m('ca2', 5 * k, 0).m('ca3', -3 * k, 4 * k); P.r('ca1', 25 * k).r('ca2', -20 * k).r('ca3', -25 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('ca1', -4 * k, -5 * k).m('ca2', 6 * k, 0).m('ca3', -4 * k, 5 * k); P.r('ca1', 90 * k).r('ca2', -120 * k).r('ca3', 150 * k); }),
  } });
// ---- Ốc Mượn Hồn: càng to, ba chân, rụt vào vỏ khi trúng đòn ----
def('oc', { ten: 'Ốc Mượn Hồn', vung: 'bien', loai: 'thuong', tt: 3, luoi: () => Q2.oc(), don: { kieu: 'chem', tam: 26, xoe: 1.6 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT },
  parts: [{ n: 'cang', m: [[3, 16, 17, 36]], pv: [17, 28] }, { n: 'chan1', m: [[10, 33, 18, 40]], pv: [18, 33], z: -1 }, { n: 'chan2', m: [[18.5, 35, 23, 41]], pv: [23, 34.5], z: -1 }, { n: 'chan3', m: [[25, 36, 30, 41]], pv: [28, 35], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.03); P.r('cang', 5 * sn(u)).s('cang', 1 + .04 * sn(u + .2)); P.r('chan1', 3 * sn(u + .3)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1; P.rot += 4 * sn(u) - 2; P.r('chan1', 22 * sn(u)).r('chan2', 22 * sn(u + .33)).r('chan3', 22 * sn(u + .66)); P.r('cang', 6 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('cang', 38 * k + (u > .4 ? sn(u * 9) * 4 : 0)).s('cang', 1 + .12 * k); P.rot += 6 * k; }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.r('cang', kf(u, [[0, 38], [.2, -40, 'in'], [.45, -30], [1, 0, 'back']])).s('cang', kf(u, [[0, 1.12], [.2, 1.25], [1, 1]])); P.r('chan1', 12 * sn(u * 2)).r('chan2', -12 * sn(u * 2)); }),
    hit: A(.4, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [.6, 1], [1, 0]]); CH.hit(P); P.m('cang', 7 * k, 2 * k).s('cang', 1 - .3 * k); P.m('chan1', 5 * k, -3 * k).m('chan2', 2 * k, -4 * k).m('chan3', 0, -4 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('cang', -30 * k).r('chan1', 30 * k).r('chan2', 10 * k).r('chan3', -25 * k); P.rot += 8 * k; }),
  } });
// ---- Hải Quỳ: chùm tua lượn sóng, ném bong bóng nổ ----
def('haiQuy', { ten: 'Hải Quỳ', vung: 'bien', loai: 'thuong', tt: 4, luoi: () => Q2.haiQuy(), don: { kieu: 'nem', tam: 56, rong: 13, mau: ['#1b4c92', '#3883d4', '#a6deff'], mom: [44, 10] }, chet: { k: 'tan', mau: ['#ee5c3a', '#b32a2c', '#1fb49c'] }, hien: { k: 'moc', mau: CAT },
  parts: [{ n: 'tuaT', m: [{ p: [[2, 3], [20, 3], [24.5, 20], [15, 20], [2, 23]] }], pv: [24, 21], z: -1 }, { n: 'tuaG', m: [{ p: [[20, 0], [33, 0], [30, 20], [24.5, 20]] }], pv: [27, 21], z: -1 }, { n: 'tuaP', m: [{ p: [[50, 3], [33, 3], [30, 20], [38, 20], [50, 23]] }], pv: [30, 21], z: -1 },
    { n: 'rong', m: [[41, 28, 48, 41]], pv: [44, 42] }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.tho(.04); P.w('tuaT', 9, -u, .35).w('tuaG', 7, -u + .2, .35).w('tuaP', 9, -u + .4, .35); P.r('tuaT', 4 * sn(u)).r('tuaP', 4 * sn(u)); P.b('rong', 14 * sn(u)); }),
    move: A(.8, P => { const u = P.u, s = sn(u); P.sy *= 1 + .1 * s; P.sx *= 1 - .08 * s; P.sh += 3 * sn(u + .25); P.b('tuaT', -14 * s).b('tuaG', -14 * sn(u - .1)).b('tuaP', -14 * s); P.w('tuaT', 6, -u * 2).w('tuaP', 6, -u * 2); P.b('rong', 20 * sn(u - .2)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'out'], [1, 1]]); P.sy *= 1 + .12 * k; P.sx *= 1 - .08 * k; P.r('tuaT', 22 * k).r('tuaP', -22 * k).b('tuaT', 14 * k).b('tuaP', -14 * k); P.w('tuaG', 10 * k, -u * 4); if (u > .45) P.x += ((u * 24 | 0) % 2 ? .6 : -.6); P.flash = u > .75 ? ((u * 24 | 0) % 2 ? .3 : 0) : 0; P.fxBao(); }),
    atk: A(.9, P => { const u = P.u, k = kf(u, [[0, 1], [.12, -1.2, 'in'], [.4, -.6], [1, 0, 'back']]); P.sy *= 1 + .12 * k; P.sx *= 1 - .09 * k; P.r('tuaT', 22 * k).r('tuaP', -22 * k).b('tuaT', 16 * k).b('tuaP', -16 * k).b('tuaG', -10 * P.face * P.fx * (1 - u)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.b('tuaT', 30 * k).b('tuaG', 30 * k).b('tuaP', 30 * k); }),
    die: A(1.3, P => { const k = seg(P.u, 0, .3); CH.die(P); P.r('tuaT', -35 * k).r('tuaP', 35 * k).b('tuaT', -30 * k).b('tuaP', 30 * k).b('tuaG', 20 * k); P.sy *= 1 - .15 * k; }),
    spawn: A(1.2, P => { const u = P.u, k = 1 - seg(u, .5, .9); CH.spawn(P); P.r('tuaT', 30 * k).r('tuaP', -30 * k); P.w('tuaG', 8, -u * 3); }),
  } });
def('caChuon', { ten: 'Cá Chuồn', vung: 'bien', loai: 'thuong', tt: 5, luoi: () => Q2.caChuon(), bay: true, cao: 8, don: { kieu: 'lao', tam: 70, rong: 10 }, chet: { k: 'bui', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('caNoc', { ten: 'Cá Nóc', vung: 'bien', loai: 'thuong', tt: 6, luoi: () => Q2.caNoc(), bay: true, cao: 6, don: { kieu: 'gai', tam: 34, mau: ['#0e746e', '#fff8e0', '#ffffff'] }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('sua', { ten: 'Sứa Bom', vung: 'bien', loai: 'thuong', tt: 7, luoi: () => Q2.sua(), bay: true, cao: 6, don: { kieu: 'no', tam: 30, mau: ['#1b4c92', '#3883d4', '#a6deff'] }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
def('nhim', { ten: 'Nhím Biển', vung: 'bien', loai: 'thuong', tt: 8, luoi: () => Q2.nhim(), don: { kieu: 'gai', tam: 30, mau: ['#281d62', '#988aee', '#ffffff'] }, chet: { k: 'vo', mau: ['#4836a0', '#988aee'] }, hien: { k: 'cat', mau: CAT } });
def('cuaTuong', { ten: 'Cua Tướng', vung: 'bien', loai: 'tinhanh', tt: 1, luoi: () => Q2.cuaTuong(), don: { kieu: 'chem', tam: 40 }, chet: { k: 'vo', mau: BANG }, hien: { k: 'cat', mau: CAT } });
def('caNocChua', { ten: 'Cá Nóc Chúa', vung: 'bien', loai: 'tinhanh', tt: 2, luoi: () => Q2.caNocChua(), bay: true, cao: 6, don: { kieu: 'gai', tam: 46, mau: ['#0e746e', '#fff8e0', '#ffffff'], so: 12 }, chet: { k: 'no', mau: NUOC }, hien: { k: 'nuoc', mau: NUOC } });
// ---- Chiêu riêng của hai tinh anh ----
// Cua Tướng: kẹp chéo, hai càng chém chéo nhau thành hình chữ X trước mặt.
DEFS.cuaTuong.anims.chieu1 = A(1.4, P => { const u = P.u, bh = P.B.bh, tam = 44, cols = ['#b0261a', '#ff9a6a', '#ffffff'];
  if (u < .4) { const v = u / .4; P.theo(-3 * v); P.sy *= 1 - .1 * v; P.sx *= 1 + .07 * v; P.x += v > .5 ? ((u * 48 | 0) % 2 ? .6 : -.6) : 0; P.flash = v > .7 && ((u * 30) | 0) % 2 ? .35 : 0; P.under(c => F.baoQuat(c, 0, 0, tam, P.dir, 2.4, v)); }
  else { const v = (u - .4) / .6, ex = P.fx * 5, ey = P.fy * 5 * MA.det - bh * .35; P.theo(kf(v, [[0, 0], [.2, 9, 'out'], [.6, 7], [1, 0]])); P.sx *= kf(v, [[0, 1.12], [.2, .94], [.5, 1]]); P.sy *= kf(v, [[0, .9], [.2, 1.06], [.5, 1]]);
    P.over(c => { F.liem(c, ex, ey, tam - 4, P.dir - .45, 1.7, clamp(v * 1.7, 0, 1), cols, 6); F.liem(c, ex, ey, tam - 8, P.dir + .45, 1.7, clamp(v * 1.7 - .3, 0, 1), cols, 6); if (v > .15 && v < .6) F.hat(c, Math.cos(P.dir) * tam * .7, Math.sin(P.dir) * tam * .7 * MA.det - bh * .3, 14, 3, (v - .15) / .45, { v: 12, cols: ['#ffffff', '#ff9a6a', '#b0261a'] }); }); } }, { nhan: 'Chiêu: kẹp chéo' });
// Cá Nóc Chúa: gai xoáy, phồng lên rồi bắn hai đợt gai băng toả tròn.
DEFS.caNocChua.anims.chieu1 = A(1.6, P => { CHIEU.vongDan(P, 12, 58, ['#0e746e', '#8ff0d8', '#ffffff'], 2); }, { nhan: 'Chiêu: gai xoáy' });
