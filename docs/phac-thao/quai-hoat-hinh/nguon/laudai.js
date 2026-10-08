// Vùng Lâu đài cổ (hệ Lửa): 8 quái thường + 2 tinh anh. Bảng màu dùng chung của bản chốt: DOCAM, LUAV, THANH, XUONGT.
const LUA = [LUAV[0], LUAV[2], LUAV[3]], TRO = [THANH[2], THANH[3], '#cbc3c0'], DA = ['#5a5460', '#8a8290', '#cbc3c0'], HON = ['#ff8a1e', '#ffd23c', '#fff6b0'];
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .6 : -.6) : 0);
const tiaLua = (c, x, y, n, s, u) => F.hat(c, x, y, n, s, u, { v: 10, goc: -PI / 2, xoe: 1.4, cols: ['#fff6b0', '#ffd23c', '#ff8a1e', '#c43c10'] });
// ---- Lính Ma Giáp Gỉ: giáo chĩa trước, nón, áo choàng bay; đâm giáo ----
def('linhMa', { ten: 'Lính Ma Giáp Gỉ', vung: 'laudai', loai: 'thuong', tt: 1, luoi: () => QL.linh(), don: { kieu: 'lao', tam: 44, rong: 10, mau: HON }, chet: { k: 'hon', mau: HON }, hien: { k: 'khoi', mau: TRO },
  parts: [{ n: 'giao', m: [[0, 19, 19, 29]], pv: [19, 24] }, { n: 'non', m: [[5, 3, 27, 15]], pv: [16, 15] }, { n: 'ao', m: [[25, 14, 52, 34]], pv: [26, 24], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.03); P.h += sn(u) * 1; P.w('ao', 8, -u, .3).r('giao', 3 * sn(u)).r('non', 2 * sn(u + .2)); }),
    move: A(.6, P => { const u = P.u; P.h += 1.5 + sn(u * 2) * 1.2; P.rot += -3; P.w('ao', 12, -u * 2, .3).r('giao', 4 * sn(u * 2)); }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.m('giao', 5 * k, 0).r('giao', -5 * k); P.w('ao', 10, -u * 3, .3); }),
    atk: A(.55, P => { const u = P.u, k = kf(u, [[0, 5], [.15, -10, 'in'], [.45, -8], [1, 0]]); CH.atk(P); P.m('giao', k, 0); P.b('ao', 20 * seg(u, 0, .3) * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('giao', 20 * k).r('non', -15 * k).b('ao', 25 * k); }),
    die: A(1.3, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('giao', 50 * k).m('non', -2 * k, -6 * k).r('non', -30 * k).b('ao', 30 * k); }),
  } });
// ---- Bầy Dơi Than: ba con dơi vỗ cánh lệch nhịp ----
function doiNhip(P, sp, amp) { const u = P.u; [1, 2, 3].forEach(i => { const ph = u + i / 3, v = sn(u * sp + i * .3); P.m('d' + i, sn(ph) * 1.2, sn(ph + .25) * (amp || 1.5) - v * .8); P.r('cT' + i, 35 * v).r('cP' + i, -35 * v); }); }
const DOI_P = []; [[1, [4, 3, 26, 22], [14, 12], [4, 4, 12, 17], [12, 11], [17, 4, 26, 17], [17, 11]], [2, [24, 10, 47, 28], [33, 18], [24, 11, 30, 25], [30, 18], [37, 11, 47, 25], [37, 18]], [3, [4, 18, 26, 37], [14, 26], [4, 19, 12, 31], [12, 25], [17, 19, 26, 31], [17, 25]]].forEach(q => {
  DOI_P.push({ n: 'd' + q[0], m: [q[1]], pv: q[2] }, { n: 'cT' + q[0], m: [q[3]], pv: q[4], cha: 'd' + q[0], keep: 1 }, { n: 'cP' + q[0], m: [q[5]], pv: q[6], cha: 'd' + q[0], keep: 1 }); });
def('doiThan', { ten: 'Bầy Dơi Than', vung: 'laudai', loai: 'thuong', tt: 2, luoi: () => QL.doi(), bay: true, cao: 10, don: { kieu: 'lao', tam: 40, rong: 18, mau: ['#5a0e0c', '#f0708a', '#ffd0d8'] }, chet: { k: 'bui', mau: TRO }, hien: { k: 'bay', xa: 50, cao: 40 }, parts: DOI_P,
  anims: {
    idle: A(1.2, P => { doiNhip(P, 3, 2); }),
    move: A(.5, P => { doiNhip(P, 4, 1.2); P.rot += -5; }),
    tele: A(.7, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); doiNhip(P, 6, 1); P.theo(-3 * k); P.h += 4 * k; P.x += rung(u, .4); P.flash = u > .7 ? ((u * 24 | 0) % 2 ? .35 : 0) : 0; P.fxBao(); }),
    atk: A(.6, P => { const u = P.u; doiNhip(P, 6, .4); [1, 2, 3].forEach(i => { const q = kf(u, [[0, 2], [.1 + i * .08, -14, 'in'], [.5 + i * .05, -10], [1, 0]]); P.m('d' + i, q, 3 * Math.sin(seg(u, 0, .5) * PI)); }); P.h -= 4 * Math.sin(seg(u, 0, .6) * PI); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('d1', -3 * k, -4 * k).m('d2', 5 * k, 0).m('d3', -3 * k, 4 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .3); CH.die(P); P.m('d1', -4 * k, -5 * k).m('d2', 6 * k, 2 * k).m('d3', -4 * k, 5 * k); P.r('d1', 90 * k).r('d2', -120 * k).r('d3', 150 * k); }),
  } });
// ---- Tượng Đá Cầm Khiên: khiên chắn trước, chùy giơ sau; đập khiên xuống đất ----
def('tuongDa', { ten: 'Tượng Đá Cầm Khiên', vung: 'laudai', loai: 'thuong', tt: 3, luoi: () => QL.tuong(), don: { kieu: 'dap', tam: 28, mau: ['#5a5460', '#ff8a1e', '#fff6b0'] }, chet: { k: 'vo', mau: DA }, hien: { k: 'ghep', mau: DA },
  parts: [{ n: 'khien', m: [[0, 8, 21, 35]], pv: [21, 22] }, { n: 'chuy', m: [[36, 5, 48, 32]], pv: [37, 21] }],
  anims: {
    idle: A(1.8, P => { const u = P.u; P.tho(.015); P.r('khien', 2 * sn(u)).r('chuy', -3 * sn(u + .3)); }),
    move: A(.8, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1; P.rot += 3 * sn(u); P.r('khien', 3 * sn(u)).r('chuy', 5 * sn(u)); if (Math.abs(sn(u)) < .1) P.y += .5; }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.45, 1, 'back'], [1, 1]]); CH.tele(P); P.m('khien', 2 * k, -6 * k).r('khien', 10 * k).r('chuy', -30 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, -6], [.18, 3, 'in'], [.5, 2], [1, 0]]); CH.atk(P); P.m('khien', 0, a).r('khien', kf(u, [[0, 10], [.18, -6, 'in'], [1, 0]])).r('chuy', kf(u, [[0, -30], [.2, 20, 'in'], [1, 0]])); if (u > .15 && u < .3) P.y += 1; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('khien', -8 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('khien', -25 * k).m('khien', -3 * k, 4 * k).r('chuy', 35 * k); }),
  } });
// ---- Đèn Lồng Ma: lơ lửng, tua lay; phun cầu lửa ----
def('denLong', { ten: 'Đèn Lồng Ma', vung: 'laudai', loai: 'thuong', tt: 4, luoi: () => QL.den(), bay: true, cao: 8, don: { kieu: 'ban', tam: 70, rong: 7, co: 3, mau: LUA, mom: [24, 26] }, chet: { k: 'chay', mau: ['#ffd23c', '#ff8a1e', '#48424e'] }, hien: { k: 'den' },
  parts: [{ n: 'tua', m: [[18, 30, 38, 40]], pv: [28, 30], keep: 0 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.h += sn(u) * 2; P.rot += 3 * sn(u + .25); P.w('tua', 10, -u, .4); P.over(c => tiaLua(c, P.x, P.y - P.h - 26, 3, (u * 4) | 0, (u * 4) % 1)); }),
    move: A(.8, P => { const u = P.u; P.h += sn(u * 2) * 1.5; P.rot += -6 + 2 * sn(u); P.b('tua', 25); P.w('tua', 8, -u * 2, .4); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); P.sx *= 1 + .1 * k; P.sy *= 1 + .1 * k; P.theo(-2 * k); P.w('tua', 14, -u * 3, .4); P.x += rung(u, .4); P.tint = ['#ffd23c', k * .3 * (1 + sn(u * 4)) / 2]; P.fxBao(); }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.b('tua', 30 * (1 - u)); P.tint = ['#fff6b0', (1 - seg(u, 0, .3)) * .5]; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.rot += 15 * k; P.b('tua', -30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'out']]); CH.die(P); P.rot += 30 * k; P.b('tua', 40 * k); }),
  } });
// ---- Mèo Đen Hai Đuôi: lưng cong, đuôi lửa vẫy; cào vụt ----
def('meoDen', { ten: 'Mèo Đen Hai Đuôi', vung: 'laudai', loai: 'thuong', tt: 5, luoi: () => QL.meo(), don: { kieu: 'chem', tam: 28, xoe: 1.6, mau: ['#5a0e0c', '#f0708a', '#ffffff'] }, chet: { k: 'tan', mau: [THANH[2], '#f0708a', '#ff8a1e'] }, hien: { k: 'bong', mau: [THANH[1], THANH[0]] },
  parts: [{ n: 'dau', m: [[2, 7, 20, 29]], pv: [19, 20] }, { n: 'duoi', m: [[38, 3, 62, 29]], pv: [40, 26], keep: 0 }, { n: 'chanT', m: [[4, 26, 19, 38]], pv: [12, 26], z: -1 }, { n: 'chanS', m: [[34, 26, 50, 38]], pv: [42, 26], z: -1 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.035); P.w('duoi', 9, -u, .25).r('dau', 3 * sn(u)); }),
    move: A(.4, P => { const u = P.u; CH.move(P); P.r('chanT', 30 * sn(u)).r('chanS', -30 * sn(u)).w('duoi', 12, -u * 2, .25); }),
    tele: A(.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.sh += -4 * k; P.r('dau', -6 * k).r('chanT', -25 * k).b('duoi', -20 * k); }),
    atk: A(.5, P => { const u = P.u; CH.atk(P); P.theo(kf(u, [[0, 0], [.2, 8, 'out'], [1, 0]])); P.r('chanT', kf(u, [[0, -40], [.2, 30, 'in'], [1, 0]])).r('dau', kf(u, [[0, -6], [.2, 8], [1, 0]])); if (u < .4) P.bongMa = [{ x: -P.fx * 7, y: -P.fy * 7, a: .3, mau: '#f0708a' }]; }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).b('duoi', 30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 30 * k).b('duoi', 40 * k).r('chanT', -35 * k).r('chanS', 35 * k); }),
  } });
// ---- Hũ Lửa Sống: nắp nảy, lửa phụt; lại gần thì phồng to (hình phồng) rồi nổ ra lửa ----
const luaSan = (c, x, y, r, e, t) => { if (e >= 1) return; F.a(c, 1 - seg(e, .6, 1)); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .4, d = r * (.3 + .5 * hh(i, 2, 7)); F.lua(c, x + Math.cos(a) * d, y + Math.sin(a) * d * MA.det, 6, 8 * (1 - e * .5), t + i, null, i); } F.a(c, 1); };
def('huLua', { ten: 'Hũ Lửa Sống', vung: 'laudai', loai: 'thuong', tt: 6, luoi: (p, hv) => QL.hu(hv === 'phong'), don: { kieu: 'no', tam: 34, mau: LUA }, chet: { k: 'no', mau: LUA }, hien: { k: 'roi', cao: 70, mau: TRO },
  parts: hv => hv === 'phong' ? [] : [{ n: 'nap', m: [[25, 18, 42, 31]], pv: [33, 31] }],
  anims: {
    idle: A(1.2, P => { const u = P.u; P.tho(.04); P.m('nap', 0, -Math.max(0, sn(u * 2)) * 1.5); P.r('nap', 4 * sn(u)); }),
    move: A(.5, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .1 - .05; P.rot += 5 * sn(u); P.m('nap', 0, -s * 2); }),
    tele: A(.8, P => { const u = P.u; P.sx *= 1 + .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .1 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.flash = u > .6 ? ((u * 24 | 0) % 2 ? .4 : 0) : 0; P.fxBao(); }, { hinh: u => u > .45 ? 'phong' : 0 }),
    atk: A(1, P => { const u = P.u; P.sx *= 1 + seg(u, 0, .15) * .2; P.sy *= 1 + seg(u, 0, .15) * .2; P.flash = u < .18 ? (((u * 30) | 0) % 2 ? .8 : .2) : 0; P.a = u < .2 ? 1 : seg(u, .9, 1); P.bong = P.a; if (u >= .9) { const s = seg(u, .9, 1); P.sx *= s; P.sy *= s; }
      if (u > .18) { P.under(c => luaSan(c, 0, 0, 22, seg(u, .25, 1), P.t)); P.fxDon(seg(u, .18, .75)); } }, { hinh: u => u < .2 ? 'phong' : 0 }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('nap', 0, -4 * k).r('nap', 20 * k); }),
    die: A(1.1, P => { const k = seg(P.u, 0, .2); CH.die(P); P.m('nap', -3 * k, -10 * k).r('nap', -60 * k); if (P.u > .25) P.under(c => luaSan(c, 0, 0, 16, seg(P.u, .25, 1), P.t)); }),
  } });
// ---- Tiểu Yêu Ném Pháo: ôm pháo, đuôi ngoe nguẩy; ném pháo vòng cung ----
let PHAO = null; const phao = (c, x, y, q) => { F.luoi(c, PHAO || (PHAO = QL.bom()), x, y, { rot: q * 8 }); };
def('tieuYeu', { ten: 'Tiểu Yêu Ném Pháo', vung: 'laudai', loai: 'thuong', tt: 7, luoi: () => QL.yeu(), don: { kieu: 'nem', tam: 56, rong: 14, vong: 26, mau: LUA, mom: [12, 26], dan: phao }, chet: { k: 'ra', mau: [THANH[2], DOCAM[1], LUAV[1]] }, hien: { k: 'no', mau: LUA },
  parts: [{ n: 'phao', m: [[6, 19, 19, 36]], pv: [18, 28] }, { n: 'dau', m: [[12, 4, 37, 25]], pv: [24, 24] }, { n: 'duoi', m: [[37, 18, 48, 35]], pv: [39, 32] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.r('dau', 4 * sn(u)).r('duoi', 15 * sn(u)).m('phao', 0, .8 * sn(u * 2)); }),
    move: A(.45, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.rot += 4 * sn(u); P.r('duoi', 20 * sn(u * 2)); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('phao', 60 * k).m('phao', 6 * k, -9 * k).r('dau', 8 * k).r('duoi', 25 * sn(u * 3)); }),
    atk: A(.75, P => { const u = P.u, a = kf(u, [[0, 60], [.1, -45, 'in'], [.3, -25], [1, 0, 'back']]); CH.atk(P); P.r('phao', a).s('phao', u > .08 && u < .9 ? 0 : 1); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 15 * k).r('duoi', -30 * k); }),
    die: A(1.2, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('duoi', 40 * k).r('phao', -50 * k); }),
  } });
// ---- Nhím Than Hồng: xù gai đỏ rực lúc báo trước và ra đòn, bắn gai lửa ----
def('nhimThan', { ten: 'Nhím Than Hồng', vung: 'laudai', loai: 'thuong', tt: 8, luoi: (p, hv) => QL.nhim(hv === 'xu'), don: { kieu: 'gai', tam: 34, so: 10, mau: [DOCAM[0], LUAV[1], '#fff6b0'] }, chet: { k: 'heo', mau: [THANH[0], THANH[1], THANH[2], THANH[3]] }, hien: { k: 'cat', mau: [THANH[2], DOCAM[1], LUAV[1]] },
  anims: {
    idle: A(1.5, P => { P.tho(.04); if (((P.u * 6) | 0) === 2) P.tint = ['#ff8a1e', .25]; }),
    tele: A(.75, P => { CH.tele(P); P.tint = ['#ff8a1e', seg(P.u, .3, 1) * .3]; }, { hinh: u => u > .3 ? 'xu' : 0 }),
    atk: A(.6, P => { const u = P.u; P.sx *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.sy *= kf(u, [[0, 1.12], [.15, .95], [.4, 1.03], [1, 1]]); P.fxDon(); }, { hinh: u => u < .7 ? 'xu' : 0 }),
    hit: A(.35, P => { CH.hit(P); }, { hinh: u => u < .5 ? 'xu' : 0 }),
  } });
// ---- TINH ANH: Tướng Ma. Đại đao chém, áo choàng bay. Chiêu riêng: đao xoáy (xoay hai vòng chém quanh mình) ----
def('tuongMa', { ten: 'Tướng Ma', vung: 'laudai', loai: 'tinhanh', tt: 1, luoi: () => QL.tuongMa(), don: { kieu: 'chem', tam: 44, xoe: 2.2, mau: LUA }, chet: { k: 'chim', mau: LUA }, hien: { k: 'quet', mau: ['#fff6b0', '#ffd23c'] },
  parts: [{ n: 'dao', m: [[5, 3, 24, 44]], pv: [18, 30] }, { n: 'ao', m: [[42, 21, 64, 45]], pv: [44, 27], keep: 0 }, { n: 'ngu', m: [[30, 2, 48, 12]], pv: [32, 11] }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.025); P.w('ao', 7, -u, .25).r('dao', 3 * sn(u)).b('ngu', 12 * sn(u)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u)) * 1.5; P.rot += 2 * sn(u); P.w('ao', 10, -u * 2, .25).r('dao', 5 * sn(u)).b('ngu', 15 * sn(u * 2)); }),
    tele: A(.85, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('dao', 45 * k).m('dao', 4 * k, -4 * k).b('ao', 15 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 45], [.18, -70, 'in'], [.45, -55], [1, 0, 'back']]); CH.atk(P); P.r('dao', a).b('ao', -20 * (1 - u)).b('ngu', -20 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dao', -15 * k).b('ao', 25 * k); }),
    die: A(1.5, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dao', 70 * k).m('dao', -4 * k, 6 * k).b('ao', 30 * k).b('ngu', 40 * k); if (P.u > .2) P.under(c => luaSan(c, 0, 0, 24, seg(P.u, .2, 1), P.t)); }),
    chieu1: A(1.6, P => { const u = P.u; CHIEU.xoay(P, 46, LUA, 2); P.r('dao', u < .35 ? 45 * seg(u, 0, .35) : -60).b('ao', u > .35 ? 30 : 0); }, { nhan: 'Chiêu: đao xoáy' }),
  } });
// ---- TINH ANH: Hũ Lửa Chúa. Vương miện lửa, hào quang nóng. Chiêu riêng: vòng cầu lửa (hai đợt toả tròn) ----
def('huChua', { ten: 'Hũ Lửa Chúa', vung: 'laudai', loai: 'tinhanh', tt: 2, luoi: () => QL.huChua(), don: { kieu: 'no', tam: 44, mau: LUA }, chet: { k: 'no', mau: LUA }, hien: { k: 'no', mau: LUA },
  parts: [{ n: 'mien', m: [[26, 20, 60, 34]], pv: [44, 34] }],
  anims: {
    idle: A(1.3, P => { const u = P.u; P.tho(.04); P.m('mien', 0, -Math.max(0, sn(u * 2)) * 1.2); P.over(c => tiaLua(c, P.x, P.y - 40, 4, (u * 3) | 0, (u * 3) % 1)); }),
    move: A(.55, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 3; P.sy *= 1 + s * .08 - .04; P.m('mien', 0, -s * 2); }),
    tele: A(.85, P => { const u = P.u; P.sx *= 1 + .08 * sn(u * 4) * (u > .4 ? 1 : .3); P.sy *= 1 - .08 * sn(u * 4) * (u > .4 ? 1 : .3); P.x += rung(u, .4); P.tint = ['#ffd23c', seg(u, .3, 1) * .35]; P.fxBao(); }),
    atk: A(.75, P => { const u = P.u; P.sx *= kf(u, [[0, 1.15], [.15, .92], [.4, 1.04], [1, 1]]); P.sy *= kf(u, [[0, 1.15], [.15, .92], [.4, 1.04], [1, 1]]); P.m('mien', 0, kf(u, [[0, -6], [.3, 0, 'nay']])); P.under(c => luaSan(c, 0, 0, 30, u, P.t)); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.m('mien', 0, -5 * k).r('mien', 15 * k); }),
    die: A(1.4, P => { const k = seg(P.u, 0, .2); CH.die(P); P.m('mien', -5 * k, -16 * k).r('mien', -70 * k); if (P.u > .25) P.under(c => luaSan(c, 0, 0, 30, seg(P.u, .25, 1), P.t)); }),
    chieu1: A(1.7, P => { const u = P.u; CHIEU.vongDan(P, 8, 60, LUA, 2); P.m('mien', 0, u > .35 && u < .5 ? -6 : 0); }, { nhan: 'Chiêu: vòng cầu lửa' }),
  } });
