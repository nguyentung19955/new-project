// TURRET MERGE — BIỂU TƯỢNG NHẬN DIỆN (glyph) cho từng ụ (TU-VAN-NHAN-DIEN mục 4, 6).
// Mỗi ụ 1 hình đơn sắc riêng, vẽ bằng VECTOR trong hộp 24×24 (0..24), đọc được ở 16 px.
// Không dùng chữ / emoji. Lỗ trống (cut) vẽ bằng destination-out. Mọi hình tròn là tròn tuyệt đối.
'use strict';

const GLYPH = (() => {
  const D = Math.PI / 180;
  // g = bộ vẽ (đã đặt hệ toạ độ 0..24)
  const mk = (x) => ({
    x,
    c(cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); },
    o(cx, cy, r, w) { x.lineWidth = w; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); },
    a(cx, cy, r, a0, a1, w, cap) { x.lineWidth = w; x.lineCap = cap || 'round'; x.beginPath(); x.arc(cx, cy, r, a0 * D, a1 * D); x.stroke(); x.lineCap = 'round'; },
    p(pts) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); },
    l(pts, w, cap) { x.lineWidth = w; x.lineCap = cap || 'round'; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); x.lineCap = 'round'; },
    r(rx, ry, w, h, rad) { x.beginPath(); if (rad && x.roundRect) x.roundRect(rx, ry, w, h, rad); else x.rect(rx, ry, w, h); x.fill(); },
    rs(rx, ry, w, h, rad, lw) { x.lineWidth = lw; x.beginPath(); if (rad && x.roundRect) x.roundRect(rx, ry, w, h, rad); else x.rect(rx, ry, w, h); x.stroke(); },
    star(cx, cy, n, ro, ri, rot) { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = ((rot || -90) + i * 180 / n) * D, r = i % 2 ? ri : ro; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); },
    path(d) { x.fill(new Path2D(d)); },
    spath(d, w) { x.lineWidth = w; x.stroke(new Path2D(d)); },
    pie(cx, cy, r, a0, a1) { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, r, a0 * D, a1 * D); x.closePath(); x.fill(); },
    cut(fn) { x.save(); x.globalCompositeOperation = 'destination-out'; fn(); x.restore(); },
  });

  // ---- 81 hình (id ụ → hàm vẽ). Ghi chú = mô tả hình theo tư vấn mục 6 (đã sửa các cặp dễ trùng) ----
  const G = {
    // 01 Cannon: miệng nòng tròn dày + chấm tâm
    canon(g) { g.o(12, 12, 7.6, 5); g.c(12, 12, 2.6); },
    // 02 Dice Gun: mặt xúc xắc nghiêng, 4 chấm đậm
    xucxac(g) { g.x.save(); g.x.translate(12, 12); g.x.rotate(15 * D); g.r(-9.5, -9.5, 19, 19, 4); g.cut(() => { for (const [a, b] of [[-4.3, -4.3], [4.3, -4.3], [-4.3, 4.3], [4.3, 4.3]]) g.c(a, b, 2.4); }); g.x.restore(); },
    // 03 Gatling: 3 nòng tròn xếp tam giác trong vỏ tròn
    lien(g) { g.o(12, 12, 10.2, 2); for (let i = 0; i < 3; i++) { const a = (-90 + i * 120) * D; g.c(12 + Math.cos(a) * 4.4, 12 + Math.sin(a) * 4.4, 3.4); } },
    // 04 Scatter: 5 khe nòng ngắn xoè hình quạt
    phun(g) { for (let i = 0; i < 5; i++) { const a = (-90 + (i - 2) * 30) * D; g.l([[12 + Math.cos(a) * 4.5, 20 + Math.sin(a) * 4.5], [12 + Math.cos(a) * 15, 20 + Math.sin(a) * 15]], 3.2); } g.c(12, 20, 3.2); },
    // 05 Revolver: ổ đạn 6 lỗ, khuyết 1 múi
    sungluc(g) { g.c(12, 12, 10.5); g.cut(() => { g.pie(12, 12, 12, -75, -15); for (let i = 1; i < 6; i++) { const a = (-45 + i * 60) * D; g.c(12 + Math.cos(a) * 5.8, 12 + Math.sin(a) * 5.8, 2.3); } g.c(12, 12, 1.4); }); },
    // 06 Frost: bông tuyết 6 cánh to (có nhánh chữ V)
    bang(g) { for (let i = 0; i < 6; i++) { const a = (i * 60 - 90) * D, c = Math.cos(a), s = Math.sin(a); g.l([[12, 12], [12 + c * 10.5, 12 + s * 10.5]], 2.6); const bx = 12 + c * 6.5, by = 12 + s * 6.5; for (const k of [-1, 1]) { const b = a + k * 45 * D; g.l([[bx, by], [bx + Math.cos(b) * 3.6, by + Math.sin(b) * 3.6]], 2.2); } } },
    // 07 Venom: giọt độc 3 thuỳ toả ra (trefoil) + lỗ tâm
    doc(g) { for (let i = 0; i < 3; i++) { g.x.save(); g.x.translate(12, 12.5); g.x.rotate(i * 120 * D); g.path('M0 -1 C-4.5 -4 -4.5 -8.5 0 -11.5 C4.5 -8.5 4.5 -4 0 -1Z'); g.x.restore(); } g.c(12, 12.5, 3.2); g.cut(() => g.c(12, 12.5, 1.6)); },
    // 08 Mana Core: kim cương rỗng + tia sáng ở tâm
    mana(g) { g.x.lineJoin = 'round'; g.l([[12, 1.5], [21.5, 12], [12, 22.5], [2.5, 12], [12, 1.5]], 3); g.star(12, 12, 4, 5, 1.5, -90); },
    // 09 Sniper: vòng ngắm + vạch ngang dài xuyên khung + chấm tâm
    tia(g) { g.o(12, 12, 6.5, 2.4); g.l([[0.8, 12], [23.2, 12]], 2.4, 'butt'); g.l([[12, 3], [12, 6]], 2.2, 'butt'); g.l([[12, 18], [12, 21]], 2.2, 'butt'); g.c(12, 12, 1.8); },
    // 10 Tesla: tia sét gãy khúc dày
    set(g) { g.p([[14.5, 1], [4, 13.5], [11, 13.5], [8.5, 23], [20, 9.5], [13, 9.5], [16.5, 1]]); },
    // 11 Guillotine: 2 trụ + xà ngang + lưỡi chéo rơi giữa
    maychem(g) { g.r(3, 2, 3, 20, 1); g.r(18, 2, 3, 20, 1); g.r(3, 2, 18, 3, 1); g.p([[7, 9], [17, 6.5], [17, 12.5], [7, 14]]); g.r(6, 19, 12, 2.5, 1); },
    // 12 Breaker: khiên bị nứt (vết nứt khoét)
    phagiap(g) { g.path('M12 1.5 L21 5 V11.5 C21 17 16.5 21 12 22.8 C7.5 21 3 17 3 11.5 V5 Z'); g.cut(() => g.l([[12.5, 1], [10, 7.5], [14, 11], [10.5, 16], [12.5, 23.5]], 2.4, 'butt')); },
    // 13 Hammer: búa chữ T to
    bua(g) { g.r(2.5, 3, 19, 8, 2); g.r(10, 10, 4, 12.5, 1.5); },
    // 14 Iron Fist: nắm đấm (4 khớp + ngón cái)
    nam(g) { g.r(4, 8, 15, 13, 3.5); for (let i = 0; i < 4; i++) g.c(6.4 + i * 3.4, 7.5, 2.4); g.cut(() => { for (let i = 1; i < 4; i++) g.l([[4.7 + i * 3.4, 10.5], [4.7 + i * 3.4, 13]], 1.1); }); g.p([[2.5, 14], [9.5, 13.5], [9.5, 17], [3.5, 18]]); },
    // 15 Time Bomb: bom tròn + ngòi + kim đồng hồ khoét
    bomhen(g) { g.c(10.5, 14, 8.2); g.r(14, 4.5, 5, 4, 1); g.spath('M17 5 Q19 1.5 22 2.5', 2); g.cut(() => g.l([[10.5, 9], [10.5, 14], [14, 16.5]], 2.2)); },
    // 16 Mana Doubler: 2 giọt mana chồng nhau
    nhanmana(g) { const giot = (cx, cy, s) => { g.x.save(); g.x.translate(cx, cy); g.x.scale(s, s); g.path('M0 -9 C4 -3.5 6.5 0 6.5 3.5 A6.5 6.5 0 0 1 -6.5 3.5 C-6.5 0 -4 -3.5 0 -9Z'); g.x.restore(); }; giot(8, 11, 0.95); g.cut(() => giot(15.5, 13.5, 1.15)); giot(15.5, 13.5, 0.95); },
    // 17 Ice Blade: dao găm băng chéo
    kiembang(g) { g.x.save(); g.x.translate(12, 12); g.x.rotate(45 * D); g.p([[0, -12], [3.3, -6], [2.2, 4], [-2.2, 4], [-3.3, -6]]); g.r(-6, 4, 12, 2.6, 1.2); g.r(-1.6, 6.5, 3.2, 5, 1); g.x.restore(); },
    // 18 Mimic: mặt nạ (2 mắt tam giác + miệng răng cưa)
    mimic(g) { g.c(12, 12, 10.5); g.cut(() => { g.p([[5, 7.5], [10.5, 9], [6.5, 12]]); g.p([[19, 7.5], [13.5, 9], [17.5, 12]]); g.p([[5.5, 15], [8, 18.5], [10, 15.8], [12, 18.8], [14, 15.8], [16, 18.5], [18.5, 15], [12, 14.2]]); }); },
    // 19 Crit Antenna: 4 gai tam giác lớn + chấm tâm (không vòng)
    chimang(g) { for (let i = 0; i < 4; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate(i * 90 * D); g.p([[0, -11.5], [3.2, -4.5], [-3.2, -4.5]]); g.x.restore(); } g.c(12, 12, 3); },
    // 20 Teleporter: 2 cổng tròn lệch nhau + mũi tên nối
    dichchuyen(g) { g.o(7, 7.5, 4.8, 2.6); g.o(17, 16.5, 4.8, 2.6); g.l([[10.8, 11], [13.3, 13]], 2.2); g.p([[14.6, 9.8], [15.2, 14.6], [10.6, 14.2]]); },
    // 21 Radar: vòng + múi quét đặc + chấm tâm
    radar(g) { g.o(12, 12, 9.8, 2.2); g.pie(12, 12, 9.8, -90, -20); g.c(12, 12, 2.2); },
    // 22 Drone Bay: thân vuông + 4 cánh quạt tròn ở góc
    drone(g) { g.l([[5.5, 5.5], [18.5, 18.5]], 2.4); g.l([[18.5, 5.5], [5.5, 18.5]], 2.4); g.r(8.5, 8.5, 7, 7, 1.5); for (const [a, b] of [[5, 5], [19, 5], [5, 19], [19, 19]]) g.o(a, b, 3.2, 1.9); },
    // 23 Blender: cánh quạt 3 lưỡi cong + lỗ trục
    tron(g) { for (let i = 0; i < 3; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate(i * 120 * D); g.path('M0 0 C2 -5 7 -9 11 -8 C8 -6 5 -2 3.5 2 Z'); g.x.restore(); } g.c(12, 12, 3.6); g.cut(() => g.c(12, 12, 1.5)); },
    // 24 Energy Cannon: quả cầu năng lượng + 3 cung sóng ")))"
    nangluong(g) { g.c(6.5, 12, 4.6); for (let i = 0; i < 3; i++) g.a(6.5, 12, 8 + i * 3.6, -42, 42, 2.1, 'butt'); },
    // 25 Laser: khung khẩu vuông + tia mảnh xuyên qua
    laser(g) { g.rs(5, 5, 14, 14, 2.5, 2.8); g.l([[0.8, 12], [23.2, 12]], 3, 'butt'); },
    // 26 Chiller: quạt 4 cánh trong vòng
    lanhgia(g) { g.o(12, 12, 10.2, 2); for (let i = 0; i < 4; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate((i * 90 + 20) * D); g.path('M0 -1.5 C-3 -3 -3.5 -7 0 -8.5 C2.5 -7 2.5 -3.5 0 -1.5Z'); g.x.restore(); } g.c(12, 12, 2); },
    // 27 Mortar: ống cối ngắn + quỹ đạo cong + đạn tròn
    mortar(g) { g.x.save(); g.x.translate(6, 18); g.x.rotate(-50 * D); g.r(-2.8, -7, 5.6, 9, 1); g.x.restore(); g.r(1.5, 20, 10, 2.5, 1); g.x.setLineDash([2.2, 2]); g.spath('M8 11 Q13 1 19 9', 1.8); g.x.setLineDash([]); g.c(19, 15, 4.4); },
    // 28 Amplifier: loa (hộp + phễu) + 2 cung âm
    khuech(g) { g.r(2, 9, 4.5, 6, 1); g.p([[6, 9], [12, 4], [12, 20], [6, 15]]); g.a(12, 12, 5, -50, 50, 2.2); g.a(12, 12, 9.5, -50, 50, 2.2); },
    // 29 Toxic Pool: vũng loang dẹt + 3 bọt
    vungdoc(g) { g.path('M2 18 C2 14.5 6 14.5 8 15.3 C10 13.8 14.5 13.8 16.5 15.2 C19 14.2 22.5 15 22 18.5 C21.5 21.5 3 22 2 18Z'); g.c(8, 9.5, 2.8); g.c(15, 6, 2.2); g.c(17.5, 11.5, 1.8); },
    // 30 Cooldown Horn: đồng hồ cát (giảm hồi chiêu) — đối xứng, không nòng
    loa(g) { g.r(4, 1.5, 16, 2.8, 1); g.r(4, 19.7, 16, 2.8, 1); g.p([[6, 4.3], [18, 4.3], [13, 12], [18, 19.7], [6, 19.7], [11, 12]]); g.cut(() => g.p([[8.6, 6], [15.4, 6], [12, 10]])); },
    // 31 Mana Leech: móc câu (răng nanh) + giọt ở đầu
    hutmana(g) { g.spath('M15 2 V12 A5 5 0 0 1 5 12 V9', 3); g.p([[5, 4.5], [8, 9.5], [2, 9.5]]); g.path('M15 15 C17.5 18 18.8 19.5 18.8 21 A3.8 3.8 0 0 1 11.2 21 C11.2 19.5 12.5 18 15 15Z'); },
    // 32 Mine Layer: thuỷ lôi tròn + 8 gai
    min(g) { for (let i = 0; i < 8; i++) { const a = i * 45 * D; g.l([[12 + Math.cos(a) * 6, 12 + Math.sin(a) * 6], [12 + Math.cos(a) * 10.5, 12 + Math.sin(a) * 10.5]], 2.4); } g.c(12, 12, 6.8); g.cut(() => g.c(10, 10, 1.8)); },
    // 33 Berserker: 2 chữ V ngược (cấp hiệu) chồng nhau
    cuongno(g) { g.p([[12, 1.5], [22, 10], [22, 14], [12, 6], [2, 14], [2, 10]]); g.p([[12, 10], [22, 18.5], [22, 22.5], [12, 14.5], [2, 22.5], [2, 18.5]]); },
    // 34 Blizzard: xoáy 3 nhánh (triskelion) + hạt tuyết
    baotuyet(g) { for (let i = 0; i < 3; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate(i * 120 * D); g.spath('M0 -2 C4 -3 6 -7 3 -10.5', 2.8); g.x.restore(); } g.c(12, 12, 2.6); g.c(3, 20.5, 1.5); g.c(21, 21, 1.5); g.c(21.5, 3.5, 1.5); },
    // 35 Cloner: 2 khối vuông cạnh nhau nối tia
    nhanban(g) { g.r(1.5, 6.5, 8.5, 11, 1.8); g.r(14, 6.5, 8.5, 11, 1.8); g.star(12, 12, 4, 4.4, 1.2, -90); },
    // 36 Chain Link: 2 mắt xích tròn lồng nhau
    lienket(g) { g.o(8, 12, 5.8, 2.8); g.cut(() => g.a(16, 12, 5.8, 150, 210, 5.5, 'butt')); g.o(16, 12, 5.8, 2.8); g.cut(() => g.a(8, 12, 5.8, -30, 30, 5.5, 'butt')); g.a(8, 12, 5.8, -20, 20, 2.8, 'butt'); },
    // 37 Clamp: 2 càng kẹp đối nhau ⊂ ⊃
    kepha(g) { g.c(4.5, 12, 3.6); g.path('M3 10 C6 2 15 0.5 22 5.5 C17 5 12 6.5 8.5 11.5Z'); g.path('M3 14 C6 22 15 23.5 22 18.5 C17 19 12 17.5 8.5 12.5Z'); g.p([[14, 4.6], [16.5, 8.6], [12.5, 7.2]]); g.p([[14, 19.4], [16.5, 15.4], [12.5, 16.8]]); g.cut(() => g.c(4.5, 12, 1.4)); },
    // 38 Cleanser: chổi quét (cán chéo + đuôi chổi)
    taylo(g) { g.l([[21.5, 2.5], [12, 12]], 2.6); g.p([[12.8, 9], [15, 11.2], [9, 23], [1, 15]]); g.cut(() => { g.l([[7.8, 20], [11.5, 14.5]], 1); g.l([[4.5, 16.5], [10, 12.5]], 1); }); },
    // 39 Shield Gen: viền lục giác + lõi lục giác đặc
    khien(g) { const hx = (r) => { const p = []; for (let i = 0; i < 6; i++) { const a = (i * 60 - 90) * D; p.push([12 + Math.cos(a) * r, 12 + Math.sin(a) * r]); } return p; }; g.x.lineJoin = 'round'; const p = hx(10); p.push(p[0]); g.l(p, 2.6); g.p(hx(5)); },
    // 40 Mystery Box: hộp + dấu hỏi khoét
    hopbi(g) { g.r(2.5, 6.5, 19, 15.5, 2.5); g.r(1, 3, 22, 4.5, 1.5); g.cut(() => { g.spath('M9.2 12 A2.8 2.8 0 1 1 13.5 14.4 C12.4 15 12 15.6 12 16.8', 2.2); g.c(12, 19.6, 1.3); g.l([[1, 7.5], [23, 7.5]], 0.9); }); },
    // 41 Star Lift: sao 5 cánh + mũi tên đẩy lên
    nangsao(g) { g.star(12, 8, 5, 7.5, 3.2); g.p([[12, 13.5], [17, 18.5], [14, 18.5], [14, 23], [10, 23], [10, 18.5], [7, 18.5]]); },
    // 42 Reaper Pillar: lưỡi hái (cán chéo + lưỡi cong)
    tuthan(g) { g.l([[17.5, 23], [14, 2.5]], 2.6); g.path('M14.5 1.5 C7 1 1.5 6 1 14 C4 8.5 8.5 6.5 15 7Z'); g.c(14.2, 3, 1.9); },
    // 43 Scrambler: 3 mũi tên cong xoay vòng (gãy)
    xaotron(g) { for (let i = 0; i < 3; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate(i * 120 * D); g.a(0, 0, 8.3, -80, -10, 2.8, 'butt'); const a = -6 * D; g.x.rotate(a); g.p([[8.3, 0], [12.3, -4], [4.3, -4]].map(([x, y]) => [x, y + 2.5])); g.x.restore(); } g.c(12, 12, 2); },
    // 44 Overclock: bánh răng + tia sét khoét
    epxung(g) { for (let i = 0; i < 8; i++) { g.x.save(); g.x.translate(12, 12); g.x.rotate(i * 45 * D); g.r(-2.2, -11.5, 4.4, 5, 0.8); g.x.restore(); } g.c(12, 12, 8); g.cut(() => g.p([[13.2, 5], [8, 13], [11.5, 13], [10.5, 19], [16, 11], [12.6, 11], [14.2, 5]])); },
    // 45 Fifth Shot: đầu đạn lớn + 4 chấm nhỏ phía sau (phát thứ 5)
    no5(g) { g.x.save(); g.x.translate(15, 9); g.x.rotate(-45 * D); g.path('M0 -8.5 C3.8 -5 4 -1 4 3 H-4 C-4 -1 -3.8 -5 0 -8.5Z'); g.r(-4, 3.8, 8, 2.5, 0.6); g.x.restore(); for (let i = 0; i < 4; i++) g.c(9.8 - i * 2.6, 14.2 + i * 2.6, 1.3 - i * 0.05); },
    // 46 Storm Gun: phễu lốc xoáy (các vạch ngang thu nhỏ dần)
    bao(g) { const ds = [[1.5, 22.5, 3], [3.5, 19.5, 7], [6.5, 16.5, 11], [8.5, 13.5, 15], [10, 12, 19]]; ds.forEach(([a, b, y], i) => g.l([[a + i * 0.3, y], [b + i * 0.3, y]], 2.4)); g.l([[11, 21.5], [13, 21.5]], 2.2); },
    // 47 Lighthouse: tháp đèn (hình thang) + đèn + 2 tia
    anhsang(g) { g.p([[9, 9], [15, 9], [17, 22.5], [7, 22.5]]); g.r(9.5, 4.5, 5, 4, 1); g.p([[8.5, 4.8], [15.5, 4.8], [12, 1.5]]); g.cut(() => g.r(7, 14, 10, 2, 0)); g.p([[15, 5], [23, 2], [23, 9]]); g.p([[9, 5], [1, 2], [1, 9]]); },
    // 48 Purifier: mặt trời 8 tia nhọn
    aten(g) { g.star(12, 12, 8, 11.5, 6.5, -90); g.cut(() => g.c(12, 12, 4.4)); g.c(12, 12, 2.6); },
    // 49 Sync Cannon: vòng quỹ đạo + 2 vệ tinh đối xứng + sao 4 cánh nhỏ
    dongbo(g) { g.o(12, 12, 8.6, 2.2); g.c(12, 3.4, 2.6); g.c(12, 20.6, 2.6); g.star(12, 12, 4, 4.8, 1.4, 0); },
    // 50 Railgun: 2 ray song song + viên đạn hình thoi giữa
    railgun(g) { g.r(1, 5, 22, 3, 1); g.r(1, 16, 22, 3, 1); g.p([[8, 12], [14, 9.2], [21.5, 12], [14, 14.8]]); },
    // 51 Merge King: vương miện
    vughep(g) { g.p([[2, 7], [7.5, 12], [12, 3.5], [16.5, 12], [22, 7], [20, 19], [4, 19]]); g.r(4, 20, 16, 2.6, 1); g.cut(() => g.c(12, 14.5, 1.8)); },
    // 52 Twin Maker: 2 lõi tròn sinh đôi, khe tách ở giữa
    sinhdoi(g) { g.c(7.6, 12, 6.2); g.c(16.4, 12, 6.2); g.cut(() => g.l([[12, 2], [12, 22]], 1.8, 'butt')); g.cut(() => { g.c(7.6, 12, 2); g.c(16.4, 12, 2); }); },
    // 53 Star Breaker: sao 5 cánh bị nứt đôi
    hasao(g) { g.star(12, 13, 5, 11.5, 4.8); g.cut(() => g.l([[14.5, 0], [11, 8], [14, 13], [10, 24]], 2.2, 'butt')); },
    // 54 Copycat: khối gốc đặc + bản sao viền lệch (⧉)
    saochep(g) { g.rs(9, 2.5, 12.5, 12.5, 2, 2.4); g.r(2.5, 9, 12.5, 12.5, 2); },
    // 55 Star Cannon: sao 4 cánh lớn + lỗ tâm
    ngoisao(g) { g.star(12, 12, 4, 11.8, 3.6, -90); g.cut(() => g.c(12, 12, 1.8)); },
    // 56 Mech Wolf: đầu sói (2 tai nhọn, mắt khe)
    soi(g) { g.p([[3, 1.5], [9, 7], [15, 7], [21, 1.5], [21, 12], [16, 18.5], [12, 23], [8, 18.5], [3, 12]]); g.cut(() => { g.p([[6, 10.5], [10.5, 12.5], [6.8, 13.6]]); g.p([[18, 10.5], [13.5, 12.5], [17.2, 13.6]]); g.p([[10.2, 17.5], [13.8, 17.5], [12, 19.6]]); }); },
    // 57 Evolver: chuỗi xoắn ADN
    tienhoa(g) { g.spath('M7 1.5 C7 7 17 7 17 12 C17 17 7 17 7 22.5', 2.6); g.spath('M17 1.5 C17 7 7 7 7 12 C7 17 17 17 17 22.5', 2.6); for (const y of [4, 20]) g.l([[8.5, y], [15.5, y]], 1.8, 'butt'); },
    // 58 Rainbow: 3 cung cầu vồng lồng nhau
    cauvong(g) { for (let i = 0; i < 3; i++) g.a(12, 18, 10 - i * 3.3, 180, 360, 2.4, 'butt'); g.r(1, 18.5, 22, 2.4, 1); },
    // 59 Wall Projector: bức tường gạch
    wallgen(g) { g.r(1.5, 4, 21, 16, 1.5); g.cut(() => { g.l([[1, 9.3], [23, 9.3]], 1.4, 'butt'); g.l([[1, 14.7], [23, 14.7]], 1.4, 'butt'); for (const x of [8.5, 15.5]) g.l([[x, 4], [x, 9.3]], 1.4, 'butt'); for (const x of [5, 12, 19]) g.l([[x, 9.3], [x, 14.7]], 1.4, 'butt'); for (const x of [8.5, 15.5]) g.l([[x, 14.7], [x, 20]], 1.4, 'butt'); }); },
    // 60 Orbital: vệ tinh (thân + 2 cánh pin)
    orbital(g) { g.r(9, 8, 6, 8, 1.2); g.l([[6, 12], [9, 12]], 1.8); g.l([[15, 12], [18, 12]], 1.8); g.r(0.5, 7, 6, 10, 1); g.r(17.5, 7, 6, 10, 1); g.cut(() => { g.l([[3.5, 7], [3.5, 17]], 1, 'butt'); g.l([[20.5, 7], [20.5, 17]], 1, 'butt'); }); g.l([[12, 8], [12, 3]], 1.8); g.c(12, 2.6, 1.8); },
    // 61 Black Hole: lõi đen tròn đặc + vành bồi tụ
    blackhole(g) { g.c(12, 12, 6.2); g.o(12, 12, 10.2, 2.4); g.cut(() => { g.a(12, 12, 10.2, 200, 235, 3.5, 'butt'); g.a(12, 12, 10.2, 20, 55, 3.5, 'butt'); }); },
    // 62 Overlord: 2 sừng quỷ trên đầu tròn
    overlord(g) { g.c(12, 15, 7); g.path('M7 11 C3 9 1.5 5 2.5 1 C4 4.5 6.5 6 9.5 8Z'); g.path('M17 11 C21 9 22.5 5 21.5 1 C20 4.5 17.5 6 14.5 8Z'); g.cut(() => { g.p([[8, 13.5], [11, 15], [8.5, 16.5]]); g.p([[16, 13.5], [13, 15], [15.5, 16.5]]); }); },
    // 63 Cryo Reactor: tinh thể lục giác dài trong vòng nhiệt
    lophanung(g) { g.o(12, 12, 10.2, 2); g.p([[12, 3.5], [16, 7.5], [16, 16.5], [12, 20.5], [8, 16.5], [8, 7.5]]); g.cut(() => g.l([[12, 5.5], [12, 18.5]], 1.2, 'butt')); },
    // 64 Holy Halo: vòng hào quang + 2 cánh
    haoquang(g) { g.o(12, 5.5, 4.2, 2.4); g.path('M11 12 C7 10 2.5 10.5 1 13 C2 17 6 20 11 19.5Z'); g.path('M13 12 C17 10 21.5 10.5 23 13 C22 17 18 20 13 19.5Z'); },
    // 65 Ricochet: đường đạn nảy gãy khúc + mũi tên, vạch tường
    nayda(g) { g.r(1, 1.5, 22, 2.6, 1); g.l([[2.5, 21], [9, 5.5], [16, 17]], 2.6); g.p([[19.6, 22.2], [13.2, 18.8], [18.4, 14.8]]); },
    // 66 Combo Core: 3 cột tăng dần (thanh combo)
    combo(g) { g.r(2, 15, 5.5, 7.5, 1); g.r(9.25, 9.5, 5.5, 13, 1); g.r(16.5, 2.5, 5.5, 20, 1); },
    // 67 Chrono Lock: ổ khoá + kim đồng hồ khoét
    khoathoigian(g) { g.a(12, 9, 5.5, 180, 360, 2.6, 'butt'); g.l([[6.5, 9], [6.5, 11]], 2.6, 'butt'); g.l([[17.5, 9], [17.5, 11]], 2.6, 'butt'); g.r(3.5, 10.5, 17, 12.5, 2.5); g.cut(() => g.l([[12, 13], [12, 17], [15, 18.5]], 1.9)); },
    // 68 Hydra: 3 cổ rắn mọc từ 1 gốc
    hydra(g) { g.spath('M12 23 C12 16 12 10 12 5', 2.6); g.spath('M11 21 C7 18 3 14 4 8', 2.6); g.spath('M13 21 C17 18 21 14 20 8', 2.6); g.c(12, 4.2, 2.7); g.c(4, 7, 2.7); g.c(20, 7, 2.7); },
    // 69 Nine-Tail: 3 đuôi cáo lớn xoè lên
    cuuvi(g) { for (const k of [-1, 0, 1]) { g.x.save(); g.x.translate(12, 22); g.x.rotate(k * 40 * D); g.path('M-1.6 0 C-5 -6 -4.5 -13 0 -19.5 C1 -14 4 -10 2.4 0Z'); g.x.restore(); } },
    // 70 Pandora Vault: rương mở nắp + 3 tia bung ra
    pandora(g) { g.r(3, 13, 18, 10, 2); g.p([[2.5, 12], [21.5, 12], [19, 8.5], [5, 8.5]].map(([x, y]) => [x, y + 0.2])); g.cut(() => g.r(10.5, 15, 3, 4, 0.8)); g.l([[12, 6], [12, 1]], 2.2); g.l([[7, 6.5], [4, 2]], 2.2); g.l([[17, 6.5], [20, 2]], 2.2); },
    // 71 Resonance Grid: lưới 3×3 chấm + đường chéo X
    luoicheo(g) { g.l([[4, 4], [20, 20]], 1.8); g.l([[20, 4], [4, 20]], 1.8); for (const a of [4, 12, 20]) for (const b of [4, 12, 20]) g.c(a, b, (a + b) % 16 === 8 ? 1.9 : 3); },
    // 72 Chrono Throne: ngai vàng (lưng cao + ghế + chân) + mặt đồng hồ trên lưng
    ngaithoigian(g) { g.r(5, 1.5, 14, 13, 3); g.r(3, 13.5, 18, 4, 1.2); g.r(4, 17, 3, 6, 0.8); g.r(17, 17, 3, 6, 0.8); g.cut(() => { g.o(12, 7.8, 3.6, 1.4); g.l([[12, 5.8], [12, 7.8], [13.6, 8.8]], 1.2); }); },
    // 73 Nemesis: con mắt (hạnh nhân) + đồng tử khoét
    nemesis(g) { g.path('M1 12 C5 4.5 19 4.5 23 12 C19 19.5 5 19.5 1 12Z'); g.cut(() => g.c(12, 12, 4.4)); g.c(12, 12, 2.2); },
    // 74 Lone Ace: quân bích
    docton(g) { g.path('M12 1.5 C15 6 21 9 21 13.5 A4.5 4.5 0 0 1 13.3 16.6 L15.5 22.5 H8.5 L10.7 16.6 A4.5 4.5 0 0 1 3 13.5 C3 9 9 6 12 1.5Z'); },
    // 75 Focus Lens: kính lúp
    thaukinh(g) { g.o(9.5, 9.5, 6.6, 2.8); g.l([[14.5, 14.5], [21.5, 21.5]], 4); g.c(9.5, 9.5, 1.7); },
    // 76 Signal Jammer: cột ăng-ten + sóng + gạch chéo
    nhieusong(g) { g.p([[12, 9], [16, 23], [8, 23]]); g.c(12, 7.5, 2.4); g.a(12, 7.5, 5.5, 200, 250, 2, 'butt'); g.a(12, 7.5, 5.5, -70, -20, 2, 'butt'); g.l([[2, 2], [22, 16]], 2.4); },
    // 77 Bounty Beacon: túi tiền thắt dây
    santhuong(g) { g.path('M8.5 7.5 C3 10.5 2 15 2.5 18 C3 21.5 6 22.8 12 22.8 C18 22.8 21 21.5 21.5 18 C22 15 21 10.5 15.5 7.5Z'); g.p([[7.5, 1.5], [16.5, 1.5], [14.5, 6], [9.5, 6]]); g.r(8, 5.6, 8, 2.4, 1); g.cut(() => { g.l([[12, 10.5], [12, 20]], 1.6, 'butt'); g.spath('M14.4 12.6 C13.5 11.6 9.8 11.4 9.8 13.8 C9.8 16 14.4 15 14.4 17.4 C14.4 19.5 10.5 19.3 9.5 18', 1.6); }); },
    // 78 Eclipse: lưỡi liềm (nhật thực) + 3 chấm vành
    nhatthuc(g) { g.c(12, 12, 9.5); g.cut(() => g.c(15.5, 9.5, 8.2)); g.c(20.5, 17.5, 1.6); g.c(22, 12.5, 1.3); g.c(17, 21.5, 1.3); },
    // 79 Scrap Forge: cái đe
    loren(g) { g.path('M1.5 6 H18 C20 6 22.5 7.5 22.5 9.5 C20 9.5 18 10.5 17 12.5 L15 14.5 H9 L7 12.5 C6 10 3.5 9 1.5 9Z'); g.r(9, 14, 6, 4, 0.6); g.r(4.5, 18, 15, 4, 1.2); },
    // 80 Mirror Gate: cổng vòm + 2 vạch phản chiếu khoét
    guongcong(g) { g.path('M3 23 V11 A9 9 0 0 1 21 11 V23Z'); g.cut(() => { g.l([[7, 17], [13, 8]], 1.8, 'butt'); g.l([[10.5, 19.5], [16.5, 10.5]], 1.4, 'butt'); }); },
    // 81 Marionette: tay điều khiển chữ thập + 3 dây + đầu rối
    marionette(g) { g.r(2, 2, 20, 3, 1.2); g.r(10.5, 0, 3, 8.5, 1); g.l([[4, 5], [6, 16]], 1.4); g.l([[20, 5], [18, 16]], 1.4); g.l([[12, 8.5], [12, 13]], 1.4); g.c(12, 15.5, 3); g.p([[6, 17], [18, 17], [15, 23], [9, 23]]); },
    // 82 Hive Queen: tổ ong 3 ô lục giác đặc
    chuato(g) { const hx = (cx, cy, r) => { const p = []; for (let i = 0; i < 6; i++) { const a = (i * 60) * D; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } g.p(p); }; hx(7, 8, 5.6); hx(17, 8, 5.6); hx(12, 16.8, 5.6); g.cut(() => g.c(12, 16.8, 1.8)); },
    // 83 Leviathan: rắn biển 3 khúc nhô trên sóng + đầu
    leviathan(g) { g.a(5.5, 15, 3.6, 180, 360, 3, 'butt'); g.a(12.5, 15, 3.6, 180, 360, 3, 'butt'); g.p([[16.5, 15], [17, 7], [23, 10.5], [19.5, 11.5], [19.8, 15]]); g.spath('M1 20 Q4 17.5 7 20 T13 20 T19 20 T24 20', 2.2); },
    // 84 Genesis Core: hạt mầm tròn + 2 lá non
    khoisinh(g) { g.c(12, 17, 5.6); g.cut(() => g.c(12, 17, 2)); g.l([[12, 11.5], [12, 7]], 2.2); g.path('M12 8 C9 3 4 2.5 2 4 C3.5 8 8 9.5 12 8Z'); g.path('M12 8 C15 3 20 2.5 22 4 C20.5 8 16 9.5 12 8Z'); },
    // 85 Wyrm Engine: ngọn lửa rồng (khoét lõi)
    ronglua(g) { g.path('M12 1 C14 6 20 9 20 15.5 A8 8 0 0 1 4 15.5 C4 11.5 6.5 9 8 7 C8.5 10 9.5 11.5 11 12 C10 8 10.5 4.5 12 1Z'); g.cut(() => g.path('M12 12.5 C13.5 15 15.8 16 15.8 18.5 A3.8 3.8 0 0 1 8.2 18.5 C8.2 16.5 10.5 15 12 12.5Z')); },
  };
  // ụ chưa có hình riêng (dự phòng): chữ cái đầu không dùng → hình bát giác rỗng có chấm (khác mọi hình trên)
  const duPhong = (g) => { const p = []; for (let i = 0; i < 9; i++) { const a = (i * 45 + 22.5) * D; p.push([12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10]); } g.l(p, 2.4); g.c(12, 12, 3); };

  const cache = {};
  // Ảnh ChatGPT (bóng trắng 128×128, assets/glyph/<id>.png) thay hình vector khi đã tải xong và cỡ ≥ 14 px
  // (nhỏ hơn: vector sắc hơn ảnh thu nhỏ). Ảnh tải lười, chỉ khi cần; tải xong → báo các nơi đã dựng sẵn bằng vector dựng lại.
  const ANH_MIN = 14, cho = {}, nghe = [];
  function anh(id) {
    if (typeof REN === 'undefined' || !REN.img) return null;
    const ten = 'glyph/' + id, a = REN.img(ten);
    if (a) return a;
    const im = REN.anh[ten];
    if (im && !cho[id] && im.addEventListener) { // lần đầu: đợi tải xong rồi báo đổi
      cho[id] = true;
      im.addEventListener('load', () => { for (const k in cache) if (k.startsWith(id + '|')) delete cache[k]; for (const f of nghe) try { f(id); } catch (e) {} }, { once: true });
    }
    return null;
  }
  // 1 = đang dùng ảnh PNG cho cỡ N (để khoá bộ đệm bên ngoài đổi khi ảnh tải xong)
  const coAnh = (id, N) => (N >= ANH_MIN && anh(id) ? 1 : 0);
  // mặt nạ glyph trắng N×N px (đã gồm lề), dựng 1 lần
  function mask(id, N) {
    const a = N >= ANH_MIN ? anh(id) : null;
    const key = id + '|' + N + (a ? '|p' : ''); if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    if (a) { REN.veNho(x, a, 0, 0, a.width, a.height, 0, 0, N, N); return (cache[key] = c); }
    x.fillStyle = x.strokeStyle = '#fff'; x.lineJoin = 'round'; x.lineCap = 'round';
    x.scale(N / 24, N / 24);
    (G[id] || duPhong)(mk(x));
    return (cache[key] = c);
  }
  // nạp trước ảnh của 1 danh sách ụ (bộ bài) — không chặn
  const napTruoc = (ids) => { for (const id of ids || []) anh(id); };
  return { G, mask, co: (id) => !!G[id], coAnh, napTruoc, khiTai: (f) => nghe.push(f) };
})();
