// Ba trùm nhỏ: Cua Đá (Hang biển), Nấm Chúa (Rừng già), Hổ Lửa (Lâu đài cổ). Mỗi con 7 cử động chuẩn + 2 chiêu riêng.
const rung = (u, a) => (u > a ? ((u * 24 | 0) % 2 ? .7 : -.7) : 0);
const DA = ['#4a5468', '#9db0cc', '#e8f0ff'], NGOC = ['#1a7a78', '#5ae8d8', '#e0fff8'], DOC = [DOCX[0], DOCX[1], DOCX[3]], LUA = [LUAV[0], LUAV[2], LUAV[3]];
// Mượn hiệu ứng đòn chuẩn với thông số khác (vd phun lửa hình quạt).
function muonDon(P, don, u, bao) { const g = P.d.don; P.d.don = don; if (bao) DON.bao(P, u); else DON.don(P, u); P.d.don = g; }
// Đập xuống đất: báo trước vòng tròn, đập, sóng chấn động lan + vết nứt toả ra + đá văng.
function dapSan(P, tam, cols, u0) { const u = P.u, a = u0 || .45;
  if (u < a) P.under(c => F.baoTron(c, 0, 0, tam, u / a));
  else { const e = seg(u, a, 1); P.under(c => { for (let i = 0; i < 9; i++) { const g = i / 9 * TAU + .3, r = tam * Math.min(1, e * 2.2); F.a(c, 1 - seg(e, .6, 1)); F.set(c, Math.cos(g) * 6, Math.sin(g) * 6 * MA.det, Math.cos(g) * r, Math.sin(g) * r * MA.det, i + 2, cols[0], 1, 5); F.a(c, 1); } F.song(c, 0, 0, tam, seg(e, 0, .7), [cols[2], cols[1]], 3); F.song(c, 0, 0, tam * .75, seg(e, .15, .9), [cols[1], cols[0]], 2); });
    P.over(c => { for (let i = 0; i < 10; i++) { const g = i / 10 * TAU; F.hat(c, Math.cos(g) * tam * .35, Math.sin(g) * tam * .35 * MA.det, 3, i + 9, e, { v: 10, goc: -PI / 2, xoe: 1.4, g: 18, cols: [cols[2], cols[1], cols[0]], to: 2 }); } }); } }
// Một hàng nổ nối nhau theo hướng dir: n vùng tròn, mỗi vùng báo trước rồi bùng lên lần lượt. ve(c, x, y, e) vẽ cú bùng.
function hangNo(P, n, buoc, rong, ve) { const u = P.u, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det;
  P.under(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, x = ex * buoc * (i + 1), y = ey * buoc * (i + 1); if (u < t0) F.baoTron(c, x, y, rong, clamp(u / t0, 0, 1)); } });
  P.over(c => { for (let i = 0; i < n; i++) { const t0 = .25 + i * .09, e = seg(u, t0, t0 + .35); if (e > 0 && e < 1) ve(c, ex * buoc * (i + 1), ey * buoc * (i + 1), e, i); } }); }

// ---- CUA ĐÁ: hai càng đá, lưng tinh thể ----
const tinhThe = (c, x, y, q) => { F.duong(c, x, y - 5, x, y + 3, NGOC[1], 3); F.duong(c, x, y - 4, x, y, NGOC[2], 1); F.px(c, x - 1, y + 3, NGOC[0], 3, 1); };
def('cuaDa', { ten: 'Cua Đá', vung: 'bien', loai: 'trumnho', tt: 1, luoi: () => Q2.cuaDa(), don: { kieu: 'chem', tam: 44, xoe: 2, mau: [DA[0], NGOC[1], NGOC[2]] }, chet: { k: 'vo', mau: DA }, hien: { k: 'cat', mau: ['#d8c08a', '#a88a58', '#f0e0b0'] },
  parts: [{ n: 'cangT', m: [[0, 21, 31, 57]], pv: [29, 48] }, { n: 'cangP', m: [[82, 39, 116, 75]], pv: [85, 57] }, { n: 'chanT', m: [[22, 67, 52, 84]], pv: [38, 67], z: -1 }, { n: 'chanP', m: [[64, 67, 98, 84]], pv: [80, 67], z: -1 }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.02); P.r('cangT', 4 * sn(u)).r('cangP', -4 * sn(u + .15)); P.r('chanT', 2 * sn(u)).r('chanP', -2 * sn(u)); }),
    move: A(.7, P => { const u = P.u; P.h += Math.abs(sn(u * 2)) * 1.2; P.rot += 2 * sn(u); P.x += sn(u * 2) * .8; P.r('chanT', 16 * sn(u * 2)).r('chanP', 16 * sn(u * 2 + .5)); P.r('cangT', 5 * sn(u * 2)).r('cangP', 5 * sn(u * 2 + .3)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('cangT', 30 * k + rung(u, .4) * 6).m('cangT', 3 * k, -6 * k).r('cangP', -20 * k); }),
    atk: A(.6, P => { const u = P.u, a = kf(u, [[0, 30], [.18, -40, 'in'], [.45, -30], [1, 0, 'back']]); CH.atk(P); P.r('cangT', a).m('cangT', 3 * (1 - seg(u, 0, .2)), -6 * (1 - seg(u, 0, .2))); P.r('cangP', -20 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('cangT', -15 * k).r('cangP', 15 * k); P.over(c => F.hat(c, 0, -40, 8, 4, P.u, { v: 14, cols: DA })); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('cangT', -40 * k).m('cangT', 0, 8 * k).r('cangP', 40 * k).m('cangP', 0, 8 * k); P.sy *= 1 - .15 * k; }),
    spawn: A(1.3, P => { const u = P.u; CH.spawn(P); P.r('cangT', 30 * sn(u * 3) * (u > .6 ? 1 : 0)).r('cangP', -30 * sn(u * 3) * (u > .6 ? 1 : 0)); }),
    // Chiêu 1: giơ hai càng lên cao rồi đập xuống, sàn nứt và sóng chấn động lan ra (phải chạy ra ngoài vòng đỏ).
    chieu1: A(1.6, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [.47, -.4, 'in'], [.7, -.3], [1, 0]]); P.r('cangT', 45 * k).m('cangT', 0, -8 * Math.max(0, k)).r('cangP', -45 * k).m('cangP', 0, -8 * Math.max(0, k)); P.sy *= 1 + .08 * k; P.x += rung(u, .3) * (u < .45 ? 1 : 0);
      if (u > .45 && u < .6) P.y += ((u * 40) | 0) % 2 ? 1 : -1; dapSan(P, 64, [DA[0], NGOC[1], '#ffffff']); }, { nhan: 'Chiêu 1: đập càng rung sàn' }),
    // Chiêu 2: tinh thể trên lưng bắn vọt lên rồi rơi xuống năm chỗ, cắm thành cột băng.
    chieu2: A(1.8, P => { const u = P.u; P.flash = u > .15 && u < .3 && ((u * 30) | 0) % 2 ? .4 : 0; P.tint = ['#5ae8d8', u < .3 ? u / .3 * .22 : .22 * (1 - seg(u, .3, .6))]; CHIEU.muaNem(P, 5, 70, 9, NGOC, tinhThe, (c, x, y, e) => { if (e < .9) { F.duong(c, x, y - 8 * (1 - e * .5), x, y, NGOC[1], 3); F.px(c, x, y - 8 * (1 - e * .5), NGOC[2]); } }); P.r('cangT', 10 * sn(u * 4)).r('cangP', -10 * sn(u * 4)); }, { nhan: 'Chiêu 2: mưa tinh thể' }),
  } });
// ---- NẤM CHÚA: mũ tím đội vương miện, tay rễ có vuốt ----
const khiDoc = (c, x, y, r, e, s) => { F.a(c, (1 - e) * .5); F.khoi(c, x, y, r, e * .7, [DOCX[2], DOCX[1], TIMD[3]], s, 7); F.a(c, 1); };
const namNho = (c, x, y, e) => { const h = Math.min(1, e * 4) * (1 - seg(e, .75, 1)); if (h <= 0) return; F.px(c, x - 1, y - 4 * h, '#d4c8a8', 2, 4 * h + 1); F.elip(c, x, y - 4 * h - 1, 4 * h + 1, 2 * h + 1, TIMD[2]); F.px(c, x - 2, y - 4 * h - 2, TIMD[3], 2, 1); };
def('namChua', { ten: 'Nấm Chúa', vung: 'rung', loai: 'trumnho', tt: 1, luoi: () => QT.namChua(), don: { kieu: 'phun', tam: 52, xoe: 1.2, mau: [DOCX[1], DOCX[2], DOCX[3], TIMD[3]], mom: [40, 52] }, chet: { k: 'heo', mau: [NAUG[0], NAUG[1], '#5a4a6a', '#8a7a9a'] }, hien: { k: 'moc', mau: TIMD },
  parts: [{ n: 'mu', m: [[8, 4, 93, 38]], pv: [50, 38] }, { n: 'tayT', m: [[0, 30, 30, 64]], pv: [29, 48] }, { n: 'tayP', m: [[71, 30, 100, 64]], pv: [72, 48] }],
  anims: {
    idle: A(1.6, P => { const u = P.u; P.tho(.03); P.s('mu', 1 + .03 * sn(u + .25), 1 - .03 * sn(u + .25)); P.r('tayT', 5 * sn(u)).r('tayP', -5 * sn(u)); P.under(c => khiDoc(c, 0, -2, 30, (u + .5) % 1, 2)); }),
    move: A(.7, P => { const u = P.u, s = Math.abs(sn(u)); P.h += s * 2.5; P.sy *= 1 + s * .06 - .03; P.r('mu', 3 * sn(u)).r('tayT', 12 * sn(u)).r('tayP', 12 * sn(u)); }),
    tele: A(.8, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'back'], [1, 1]]); CH.tele(P); P.r('tayT', 30 * k).r('tayP', -30 * k).s('mu', 1 + .08 * k, 1 - .06 * k); }),
    atk: A(.8, P => { const u = P.u; P.sy *= kf(u, [[0, .9], [.12, 1.08], [.4, 1]]); P.r('tayT', 30 * (1 - seg(u, 0, .2))).r('tayP', -30 * (1 - seg(u, 0, .2))); P.s('mu', 1, kf(u, [[0, .94], [.12, 1.06], [.5, 1]])); P.fxDon(); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.s('mu', 1 + .1 * k, 1 - .12 * k); P.r('tayT', -20 * k).r('tayP', 20 * k); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.3, 1, 'out']]); CH.die(P); P.r('mu', -15 * k).m('mu', 0, 6 * k).r('tayT', -40 * k).r('tayP', 40 * k); if (P.u > .2) P.under(c => khiDoc(c, 0, 0, 40, seg(P.u, .2, 1), 5)); }),
    // Chiêu 1: cắm tay rễ xuống đất, một hàng nấm độc mọc vọt lên nối nhau theo hướng bé đứng, mỗi cây phụt khí độc.
    chieu1: A(1.7, P => { const u = P.u, k = kf(u, [[0, 0], [.2, 1, 'back'], [.85, 1], [1, 0]]); P.r('tayT', -35 * k).m('tayT', 0, 6 * k).r('tayP', 35 * k).m('tayP', 0, 6 * k); P.sy *= 1 - .06 * k; P.x += rung(u, .2) * (u < .8 ? 1 : 0);
      hangNo(P, 5, 16, 9, (c, x, y, e, i) => { namNho(c, x, y, e); khiDoc(c, x, y - 2, 14, e, i); F.hat(c, x, y - 4, 8, i, e, { v: 9, goc: -PI / 2, xoe: 1.8, cols: [DOCX[3], DOCX[2], TIMD[3]] }); }); }, { nhan: 'Chiêu 1: hàng nấm độc' }),
    // Chiêu 2: xoay mũ, bào tử bắn toả tròn hai đợt và một vòng khí độc lan rộng.
    chieu2: A(1.8, P => { const u = P.u; CHIEU.vongDan(P, 10, 60, [TIMD[1], DOCX[2], DOCX[3]], 2); P.r('mu', u > .35 ? 8 * sn(u * 3) : 0).r('tayT', 30 * Math.min(1, u * 3)).r('tayP', -30 * Math.min(1, u * 3)); if (u > .4) P.under(c => khiDoc(c, 0, 0, 50, seg(u, .4, 1), 8)); }, { nhan: 'Chiêu 2: bão bào tử' }),
  } });
// ---- HỔ LỬA: vằn than hồng, bờm gáy và chóp đuôi cháy ----
// Lửa phun hình quạt: các cụm lửa bay dọc các tia, nở to dần và đổi màu trắng -> vàng -> cam -> đỏ, cuối có khói.
const phunLua = (c, x, y, dir, tam, span, u, gy) => { const C = ['#fff6b0', '#ffd23c', '#ff8a1e', '#c43c10'], n = 46; for (let i = 0; i < n; i++) { const a = dir + (hh(i, 1, 5) - .5) * span * (.6 + .4 * hh(i, 4, 2)), ph = (u * 2.4 + hh(i, 2, 5)) % 1; if (u < .15 && ph > u / .15) continue; if (u > .8 && ph < seg(u, .8, 1)) continue;
  const r = 5 + (tam - 5) * ph, rad = 1 + ph * 4.5, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * MA.det + ph * ((gy == null ? y : gy) - y) * .8 - ph * 3; if (ph > .85) { F.a(c, .5); F.dia(c, px, py - 2, rad, '#48424e'); F.a(c, 1); } else { F.dia(c, px, py, rad, C[Math.min(3, (ph * 4.4) | 0)]); if (ph < .5) F.px(c, px, py, '#fff6b0'); } } };
const vetLua = (c, x0, y0, x1, y1, e, t) => { const n = 9; F.a(c, 1 - seg(e, .75, 1)); for (let i = 0; i < n; i++) { const f = i / (n - 1); F.lua(c, lerp(x0, x1, f), lerp(y0, y1, f), 11, 15 * (1 - e * .4) * (.7 + .3 * hh(i, 1, 4)), t + i * .3, null, i); } F.a(c, 1); };
def('hoLua', { ten: 'Hổ Lửa', vung: 'laudai', loai: 'trumnho', tt: 1, luoi: () => QT.hoLua(), don: { kieu: 'chem', tam: 46, xoe: 1.9, mau: [LUAV[0], LUAV[2], '#fff6b0'] }, chet: { k: 'chay', mau: ['#ffd23c', '#ff8a1e', '#48424e'] }, hien: { k: 'bay', xa: 64, cao: 44 },
  parts: [{ n: 'dau', m: [[2, 23, 38, 67]], pv: [37, 50] }, { n: 'chanT', m: [[10, 63, 46, 82]], pv: [32, 63], z: -1 }, { n: 'chanS', m: [[78, 58, 106, 82]], pv: [89, 58], z: -1 }, { n: 'duoi', m: [[92, 12, 122, 52]], pv: [95, 48], keep: 0 }, { n: 'bom', m: [[34, 12, 78, 33]], pv: [56, 33], keep: 0 }],
  anims: {
    idle: A(1.4, P => { const u = P.u; P.tho(.025); P.r('dau', 3 * sn(u)).w('duoi', 7, -u, .2).w('bom', 5, -u * 2, .5); }),
    move: A(.6, P => { const u = P.u; CH.move(P); P.r('chanT', 22 * sn(u)).r('chanS', -22 * sn(u)).r('dau', 3 * sn(u * 2)).w('duoi', 10, -u * 2, .2).w('bom', 6, -u * 3, .5); }),
    tele: A(.75, P => { const u = P.u, k = kf(u, [[0, 0], [.4, 1, 'out'], [1, 1]]); CH.tele(P); P.r('dau', -10 * k).r('chanT', -25 * k).b('duoi', 20 * k).w('bom', 8, -u * 4, .5); }),
    atk: A(.55, P => { const u = P.u; CH.atk(P); P.r('chanT', kf(u, [[0, -40], [.2, 35, 'in'], [1, 0]])).r('dau', kf(u, [[0, -10], [.2, 10], [1, 0]])).b('duoi', -15 * (1 - u)); }),
    hit: A(.35, P => { const k = kf(P.u, [[0, 0], [.2, 1, 'out'], [1, 0]]); CH.hit(P); P.r('dau', 14 * k).b('duoi', 25 * k); }),
    die: A(1.6, P => { const k = kf(P.u, [[0, 0], [.25, 1, 'nay']]); CH.die(P); P.r('dau', 25 * k).r('chanT', -35 * k).r('chanS', 35 * k).b('duoi', 40 * k); }),
    // Chiêu 1: chồm tới vồ thẳng một đường dài, để lại vệt lửa cháy trên sàn.
    chieu1: A(1.5, P => { const u = P.u, tam = 74, ex = Math.cos(P.dir), ey = Math.sin(P.dir) * MA.det; CHIEU.laoNhieu(P, 1, tam, 18, LUA, 0); P.r('chanT', u > .45 ? -35 : -20 * u / .45).r('chanS', u > .45 ? 30 : 0).r('dau', u > .45 ? -12 : 0);
      if (u > .5) P.under(c => vetLua(c, ex * 30, ey * 30, ex * (tam + 30), ey * (tam + 30), seg(u, .5, 1.05), P.t)); }, { nhan: 'Chiêu 1: vồ lửa' }),
    // Chiêu 2: ngẩng đầu gầm rồi phun lửa hình quạt rộng.
    chieu2: A(1.7, P => { const u = P.u, k = kf(u, [[0, 0], [.35, 1, 'back'], [.45, -.5, 'in'], [.9, -.5], [1, 0]]); P.r('dau', 18 * k).sy *= 1 + .05 * Math.max(0, k);       if (u < .45) { const v = u / .45; P.x += rung(u, .2); const m = P.pt(10, 57), gy = P.y; P.under(c => F.baoQuat(c, m[0], gy, 76, P.dir, 1.2, v)); P.over(c => { F.dia(c, m[0], m[1], 1 + v * 3, '#ff8a1e'); F.hat(c, m[0], m[1], 6, 11, 1 - (v * 3 % 1), { v: -7, cols: ['#ffd23c', '#fff6b0'] }); }); } else { const m = P.pt(10, 57), e = seg(u, .45, 1), gy0 = P.y; P.under(c => F.baoQuat(c, m[0], gy0, 76, P.dir, 1.2, .7)); const gy = P.y; P.over(c => phunLua(c, m[0], m[1], P.dir, 76, 1.2, e, gy)); P.x += ((u * 40) | 0) % 2 ? .5 : -.5; } P.w('bom', 8, -u * 5, .5); }, { nhan: 'Chiêu 2: gầm phun lửa' }),
  } });
