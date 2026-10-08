// Hướng 3: Linh khí làm chủ. Hero là đứa trẻ tinh linh nhỏ xíu đeo mặt nạ, còn vũ khí sống, to quá khổ, mới là ngôi sao.
'use strict';
(function () {
  const MASK = ['#c9c0ae', '#f6f0e2', '#ffffff'];
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const GRN = ['#255a2c', '#479544', '#8fd070'];
  const BLU = ['#27407f', '#4468c0', '#86a8f0'];
  const ORG = ['#9a4a16', '#dd7c2a', '#f8b25c'];
  const GOLD = ['#9c7426', '#e2b64e', '#ffe9a0'];
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const STEEL = ['#5f6b84', '#b4c0d4', '#f4f8ff'];
  const GOURD = ['#a8642a', '#e09c4a', '#f9d08c'];
  const BRZ = ['#754418', '#c4853a', '#f6d07c'];   // đồng chiêng
  const DARK = '#2a2230';
  const SH = '#ffffff';

  // ---------- đứa trẻ tinh linh ----------
  // x: tâm, gy: mặt đất (thường là 0), C: màu áo choàng, o.kieu: kiểu mũ, o.dau: dấu trên mặt nạ
  function be(S, x, gy, C, o) {
    o = o || {};
    const y = gy;
    if (!o.ngoi) S.part((s) => { s.r(x - 3, y - 1, 2, 1, DARK); s.r(x + 1, y - 1, 2, 1, DARK); });
    // áo choàng
    S.part((s) => {
      s.g([[x - 3, y - 9], [x + 3, y - 9], [x + 4, y - 2], [x - 4, y - 2]], C);
      s.in(() => { s.r(x - 4, y - 3, 9, 1, Lt(C)); s.p(x + 1, y - 8, Md(GOLD)); s.r(x - 4, y - 7, 2, 5, Dk(C)); });
    });
    if (o.kieu === 'sung') S.part((s) => { s.r(x - 4, y - 21, 2, 3, MASK); s.r(x + 3, y - 21, 2, 3, MASK); s.p(x - 4, y - 22, Md(MASK)); s.p(x + 4, y - 22, Md(MASK)); });
    if (o.kieu === 'bui') { S.part((s) => { s.e(x + 0.5, y - 20.5, 1.5, 1.5, DARK); }); S.part((s) => { s.r(x - 1, y - 19, 3, 1, RED); }); }
    if (o.kieu === 'la') S.part({ ol: GRN[0] }, (s) => { s.l(x, y - 19, x + 1, y - 22, 1, Md(GRN)); s.r(x + 1, y - 23, 3, 2, Md(GRN)); s.p(x + 3, y - 24, Lt(GRN)); });
    // mũ trùm
    S.part((s) => {
      if (o.kieu === 'non') s.g([[x - 6, y - 12], [x - 1, y - 23], [x + 6, y - 12], [x + 4, y - 9], [x - 4, y - 9]], C);
      else s.e(x, y - 14, 5.5, 5, C);
      s.in(() => { s.e(x - 3, y - 11, 3, 2, Dk(C)); if (o.kieu === 'non') { s.l(x - 1, y - 22, x + 3, y - 16, 1, Lt(C)); } });
    });
    // mặt nạ
    S.part({ ol: C[0] }, (s) => {
      s.e(x + 1.5, y - 13.5, 3.5, 3.5, Md(MASK));
      s.r(x - 1, y - 11, 3, 1, Dk(MASK));
      s.r(x, y - 14, 1, 2, INK); s.r(x + 3, y - 14, 1, 2, INK);
      const d = o.dau;
      if (d === 'lua') { s.r(x + 1, y - 17, 2, 1, Md(RED)); s.p(x + 1, y - 16, Md(RED)); }
      if (d === 'la') { s.r(x - 1, y - 11, 2, 1, Md(GRN)); s.r(x + 4, y - 11, 1, 1, Md(GRN)); }
      if (d === 'xoay') { s.p(x + 1, y - 17, Md(BLU)); s.p(x + 2, y - 16, Md(BLU)); s.p(x + 1, y - 11, Md(BLU)); s.p(x + 2, y - 11, Md(BLU)); }
      if (d === 'du') { s.p(x - 1, y - 16, Md(RED)); s.p(x, y - 15, Md(RED)); s.p(x + 4, y - 16, Md(RED)); s.p(x + 3, y - 15, Md(RED)); s.r(x + 1, y - 11, 2, 1, Md(RED)); }
    });
    if (o.kieu === 'khan') S.part((s) => { s.r(x - 5, y - 18, 11, 2, RED); s.g([[x - 5, y - 18], [x - 9, y - 20], [x - 9, y - 16], [x - 5, y - 16]], RED); });
  }

  // ---------- thanh kiếm sống ----------
  // (hx,hy): đốc kiếm, (ux,uy): hướng mũi kiếm, kind: thuong | lua | doc | bang, o.mat: [dx,dy] hướng nhìn, o.tron: mắt mở to
  function kiemSong(S, hx, hy, ux, uy, kind, o) {
    o = o || {};
    const n = Math.hypot(ux, uy); ux /= n; uy /= n; const vx = -uy, vy = ux;
    const T = (t, q) => [hx + ux * t + vx * q, hy + uy * t + vy * q];
    const L = (s, a, b, w, c) => s.l(a[0], a[1], b[0], b[1], w, c);
    const B = kind === 'lua' ? ['#8a1c12', '#e8492a', '#ffb347'] : kind === 'doc' ? ['#1d5a2a', '#49a83c', '#b5ea6a'] : kind === 'bang' ? ['#2f62ad', '#7fc4f2', '#eafcff'] : STEEL;
    const olc = kind === 'lua' ? '#4a1010' : kind === 'doc' ? '#12331a' : kind === 'bang' ? '#1c3a70' : INK;
    const Gd = kind === 'doc' ? ['#3d1d55', '#6b3a8f', '#a56fd0'] : kind === 'bang' ? ['#3b5fa8', '#9fd0f5', '#ffffff'] : GOLD;
    // bờm lửa, răng cưa, gai băng mọc dọc sống kiếm
    if (kind === 'lua') S.part({ ol: '#7a1810' }, (s) => {
      for (const t of [13, 19, 25, 31]) s.g([T(t, -4), T(t + 5, -9), T(t + 6, -4)], Md(['#a32418', '#f2622a', '#ffc64c']));
      s.in(() => { for (const t of [13, 19, 25, 31]) { const p = T(t + 4, -6); s.p(p[0], p[1], '#ffc64c'); } });
    });
    if (kind === 'doc') S.part({ ol: olc }, (s) => { for (const t of [14, 20, 26, 32]) s.g([T(t, 4), T(t + 2, 7), T(t + 4, 4)], Lt(B)); });
    if (kind === 'bang') S.part({ ol: olc }, (s) => { s.g([T(14, -4), T(20, -9), T(19, -4)], B); s.g([T(24, 4), T(30, 9), T(29, 4)], B); s.g([T(28, -4), T(33, -8), T(32, -4)], Lt(B)); });
    // lưỡi
    S.part({ ol: olc }, (s) => {
      s.g([T(11, -4), T(30, -5), T(38, -3.5), T(45, 0), T(38, 3.5), T(30, 5), T(11, 4)], B);
      s.in(() => {
        L(s, T(12, -4), T(31, -5), 1, Dk(B)); L(s, T(31, -5), T(44, 0), 1, Dk(B));
        L(s, T(12, 3), T(31, 4), 1, Lt(B)); L(s, T(31, 4), T(42, 0), 1, Lt(B));
        L(s, T(23, 0), T(39, 0), 1, Dk(B));
        L(s, T(26, 2), T(33, 2), 1, SH);
        if (kind === 'lua') { L(s, T(22, 1), T(40, 0), 1, '#fff0b0'); L(s, T(12, 0), T(22, 0), 1, Md(['#a32418', '#f2622a', '#ffc64c'])); }
        if (kind === 'doc') { for (const t of [24, 29, 34]) { const p = T(t, -2); s.p(p[0], p[1], Dk(B)); } }
        if (kind === 'bang') { L(s, T(22, -2), T(27, 2), 1, SH); L(s, T(32, -2), T(36, 1), 1, SH); }
      });
    });
    // con mắt
    S.part({ ol: false, bevel: false }, (s) => {
      const c = T(17, 0), cx = Math.round(c[0]), cy = Math.round(c[1]), m = o.mat || [1, 0];
      const W = kind === 'lua' ? '#ffe36a' : kind === 'doc' ? '#e6f58a' : '#ffffff';
      s.r(cx - 2, cy - 1, 5, 3, W); s.r(cx - 1, cy - 2, 3, 1, W); s.r(cx - 1, cy + 2, 3, 1, W);
      const pc = kind === 'bang' ? '#1c3a70' : INK;
      if (kind === 'doc' || kind === 'lua') s.r(cx + m[0], cy - 1 + m[1], 1, 3, pc); else s.r(cx + m[0], cy - 1 + m[1], 2, 2, pc);
      if (!o.tron) { s.r(cx - 2, cy - 2, 5, 1, Dk(B)); s.p(cx - 2, cy - 1, Dk(B)); s.p(cx - 3, cy - 3, Dk(B)); } // mí sụp cho vẻ ngạo
      else { s.p(cx + m[0] + 1, cy - 1 + m[1], SH); }
    });
    // miệng cười khẩy
    S.part({ ol: false, bevel: false }, (s) => {
      const a = T(13.5, -1), b = T(13.5, 2), c = T(14.5, 3);
      s.l(a[0], a[1], b[0], b[1], 1, INK); s.p(c[0], c[1], INK);
      const fg = T(12.5, 1); s.p(fg[0], fg[1], SH);
    });
    // chắn tay hình sừng, chuôi, đốc
    S.part((s) => {
      s.g([T(8, -6), T(8, 6), T(13, 7.5), T(10.5, 4), T(10.5, -4), T(13, -7.5)], Gd);
      s.in(() => { const p = T(9, 0); s.r(p[0] - 1, p[1] - 1, 2, 2, kind === 'bang' ? Md(BLU) : Md(RED)); });
    });
    S.part((s) => { L(s, T(2, 0), T(7, 0), 2, kind === 'doc' ? WD : RED); const p = T(4, 0); s.p(p[0], p[1], Md(GOLD)); });
    S.part((s) => { const p = T(0, 0); s.e(p[0], p[1], 1.5, 1.5, Gd); });
    // hiệu ứng theo hệ
    if (kind === 'lua') S.part({ fx: true }, (s) => { for (const q of [[20, -12, '#ffb347'], [30, -11, '#ffd27a'], [40, -6, '#ff8a3a'], [47, 3, '#ffd27a'], [34, 8, '#ffb347']]) { const p = T(q[0], q[1]); s.p(p[0], p[1], q[2]); } });
    if (kind === 'doc') { S.part({ ol: olc }, (s) => { const p = T(45, 1); s.r(p[0], p[1] + 2, 1, 2, Lt(B)); }); S.part({ fx: true }, (s) => { for (const q of [[38, 9, '#b5ea6a'], [22, 10, 'rgba(181,234,106,0.7)'], [46, -6, '#a56fd0']]) { const p = T(q[0], q[1]); s.p(p[0], p[1], q[2]); } const p = T(30, -9); s.r(p[0], p[1], 2, 2, 'rgba(181,234,106,0.7)'); }); }
    if (kind === 'bang') S.part({ fx: true }, (s) => { const sp = (a) => { const x = Math.round(a[0]), y = Math.round(a[1]); s.p(x, y, SH); s.p(x - 1, y, '#bfe9ff'); s.p(x + 1, y, '#bfe9ff'); s.p(x, y - 1, '#bfe9ff'); s.p(x, y + 1, '#bfe9ff'); }; sp(T(38, -9)); sp(T(22, 10)); sp(T(47, 5)); });
  }

  // ================= THỢ RÈN: bé đỏ và thanh kiếm sống =================
  function ren(S) {
    // tua đỏ ở đốc kiếm
    S.part({ ol: RED[0] }, (s) => { s.pl([[9, -4], [11, -2], [13, -3]], 1, Md(RED)); s.p(14, -2, Md(RED)); });
    kiemSong(S, 8, -5, 0, -1, 'thuong');
    be(S, -8, 0, RED, { kieu: 'sung', dau: 'lua' });
    // tay bé giơ cây búa rèn tí hon
    S.part((s) => { s.r(-3, -15, 1, 6, WD); });
    S.part((s) => { s.r(-5, -18, 5, 3, STEEL); s.in(() => { s.r(-5, -18, 1, 3, Dk(STEEL)); s.r(-1, -18, 1, 3, Dk(STEEL)); }); });
    S.part((s) => { s.r(-4, -10, 2, 2, Md(MASK)); });
  }
  function renDanh(S) {
    // vệt chém
    S.part({ fx: true }, (s) => {
      const cols = ['#5a6a8a', '#8fa3c4', '#c8d8ee', '#ffffff'];
      for (let y = -60; y <= 4; y++) for (let x = -20; x <= 50; x++) {
        const dx = x + 2, dy = y + 22, d = Math.sqrt(dx * dx + dy * dy); const a = Math.atan2(dy, dx) * 180 / Math.PI;
        const t = (a + 100) / 118; if (t < 0 || t > 1) continue;
        if (Math.abs(d - 36) > 0.4 + 4.5 * t) continue;
        s.p(x, y, cols[Math.min(3, Math.floor(t * 4))]);
      }
    });
    // bé bị kiếm kéo bay khỏi mặt đất, hai tay bám chuôi
    S.part({ ol: RED[0] }, (s) => { s.pl([[-16, -26], [-21, -28], [-24, -25]], 1, Md(RED)); });
    S.part((s) => { s.r(-23, -9, 2, 1, DARK); s.r(-20, -7, 2, 1, DARK); });
    S.part((s) => {
      s.g([[-16, -19], [-10, -17], [-17, -7], [-24, -11]], RED);
      s.in(() => { s.l(-23, -10, -18, -8, 1, Lt(RED)); s.l(-19, -17, -23, -12, 2, Dk(RED)); });
    });
    S.part((s) => { s.r(-16, -31, 2, 3, MASK); s.r(-9, -32, 2, 3, MASK); });
    S.part((s) => { s.e(-12, -24, 5.5, 5, RED); s.in(() => { s.e(-15, -21, 3, 2, Dk(RED)); }); });
    S.part({ ol: RED[0] }, (s) => {
      s.e(-10.5, -23.5, 3.5, 3.5, Md(MASK));
      s.r(-12, -25, 2, 2, INK); s.r(-9, -25, 2, 2, INK); s.p(-12, -25, SH); s.p(-9, -25, SH); // mắt tròn hốt hoảng
      s.r(-11, -27, 2, 1, Md(RED)); s.r(-11, -22, 2, 2, INK);
    });
    S.part({ ol: RED[0] }, (s) => { s.l(-7, -20, -3, -22, 2, RED); });
    kiemSong(S, -1, -22, 2, 1, 'thuong', { mat: [1, 1], tron: true });
    S.part((s) => { s.r(-3, -23, 2, 2, Md(MASK)); s.r(0, -21, 2, 2, Md(MASK)); });
  }

  // ================= THỢ SĂN: bé xanh và cây cung rồng =================
  function san(S) {
    // dây cung
    S.part({ ol: false }, (s) => { s.l(7, -36, 7, -4, 1, '#e8e2d0'); });
    // thân rồng uốn thành cánh cung
    S.part((s) => {
      s.pl([[8, -37], [12, -33], [15, -27], [16, -20], [15, -13], [12, -7], [8, -3]], 3, GRN);
      s.in(() => {
        s.pl([[9, -36], [13, -32], [16, -26], [17, -20], [16, -14], [13, -8], [9, -4]], 1, Md(GOLD)); // bụng vàng
        for (const q of [[11, -34], [14, -28], [15, -23], [15, -17], [13, -11], [10, -6]]) s.p(q[0], q[1], Dk(GRN));
      });
      s.r(14, -22, 4, 5, RED); s.in(() => { s.r(14, -22, 4, 1, Md(GOLD)); s.r(14, -18, 4, 1, Md(GOLD)); }); // chỗ nắm
    });
    // vây lưng
    S.part({ ol: GRN[0] }, (s) => { s.p(14, -32, Md(RED)); s.p(15, -31, Md(RED)); s.p(17, -27, Md(RED)); s.p(18, -26, Md(RED)); s.p(17, -11, Md(RED)); s.p(18, -12, Md(RED)); s.p(14, -5, Md(RED)); });
    // đuôi cuộn
    S.part((s) => { s.pl([[8, -3], [5, -2], [4, -4]], 2, GRN); s.r(3, -6, 2, 2, Md(RED)); });
    // đầu rồng ngậm dây
    S.part((s) => {
      s.g([[4, -42], [10, -43], [13, -40], [13, -37], [8, -35], [4, -37]], GRN);
      s.in(() => { s.r(10, -39, 4, 1, Lt(GRN)); s.r(5, -37, 6, 1, Md(GOLD)); });
      s.r(13, -39, 2, 2, GRN);
      s.p(14, -39, INK);
      s.p(5, -44, Md(GOLD)); s.p(4, -45, Md(GOLD)); s.p(8, -44, Md(GOLD)); s.p(8, -45, Lt(GOLD)); // sừng
    });
    S.part({ ol: false, bevel: false }, (s) => { s.r(8, -41, 3, 2, SH); s.r(10, -41, 1, 2, INK); s.r(7, -42, 3, 1, INK); s.p(10, -41, INK); });
    S.part({ ol: false }, (s) => { s.l(15, -38, 18, -36, 1, Md(RED)); s.p(19, -37, Md(RED)); }); // râu rồng
    // bé xanh cầm mũi tên to như cây gậy
    S.part((s) => { s.r(1, -27, 1, 27, WD); });
    S.part((s) => { s.g([[1, -33], [3, -28], [-1, -28]], STEEL); });
    S.part({ ol: RED[0] }, (s) => { s.r(0, -6, 1, 4, Md(RED)); s.r(2, -6, 1, 4, Md(RED)); });
    be(S, -6, 0, GRN, { kieu: 'non', dau: 'la' });
    S.part((s) => { s.r(0, -9, 2, 2, Md(MASK)); });
  }

  // ================= THẦY LANG: bé lam cưỡi bầu thuốc =================
  function lang(S) {
    // chân bầu
    S.part((s) => { s.r(-5, -1, 3, 1, Dk(GOURD)); s.r(4, -1, 3, 1, Dk(GOURD)); });
    // vòi bầu chếch lên, nút gỗ, lá
    S.part((s) => { s.g([[5, -29], [9, -34], [12, -32], [8, -26]], GOURD); });
    S.part((s) => { s.g([[9, -35], [12, -37], [14, -34], [12, -32]], WD); });
    S.part({ ol: GRN[0] }, (s) => { s.r(14, -38, 3, 2, Md(GRN)); s.p(16, -39, Lt(GRN)); s.p(13, -37, Md(GRN)); });
    // thân bầu hai khoang
    S.part((s) => {
      s.e(0, -24, 6.5, 5.5, GOURD); s.e(1, -10, 10, 9.5, GOURD);
      s.in(() => {
        s.e(-5, -5, 6, 5, Dk(GOURD)); s.e(-4, -22, 3, 3, Dk(GOURD));
        s.r(7, -16, 2, 5, Lt(GOURD)); s.p(8, -15, SH); s.p(8, -14, SH); s.r(3, -27, 2, 2, Lt(GOURD));
        // mặt ngủ gật hiền lành
        s.p(0, -11, INK); s.p(1, -10, INK); s.p(2, -11, INK);
        s.p(6, -11, INK); s.p(7, -10, INK); s.p(8, -11, INK);
        s.r(-2, -8, 2, 1, '#ef7f78'); s.r(9, -8, 2, 1, '#ef7f78');
        s.p(3, -7, INK); s.r(4, -6, 2, 1, INK); s.p(6, -7, INK);
        s.r(1, -13, 2, 1, SH); s.r(6, -13, 3, 1, SH); // mày bạc
      });
    });
    // dây đỏ thắt eo bầu
    S.part((s) => { s.r(-5, -19, 11, 2, RED); s.r(5, -18, 2, 4, RED); s.r(7, -17, 1, 4, RED); s.in(() => { s.r(-5, -19, 11, 1, Lt(RED)); }); });
    // hơi thuốc
    S.part({ fx: true }, (s) => { s.p(15, -42, '#b9f0d2'); s.p(16, -44, '#8fe0b8'); s.p(15, -46, '#b9f0d2'); s.r(17, -47, 2, 1, 'rgba(185,240,210,0.7)'); s.p(13, -44, 'rgba(185,240,210,0.6)'); });
    // bé lam ngồi trên đỉnh bầu
    S.part((s) => { s.r(-5, -29, 2, 2, DARK); s.r(0, -28, 2, 2, DARK); });
    be(S, -2, -28, BLU, { kieu: 'la', dau: 'xoay', ngoi: true });
    // cành thuốc trong tay
    S.part({ ol: GRN[0] }, (s) => { s.l(3, -35, 6, -40, 1, Md(WD)); s.r(6, -42, 2, 2, Md(GRN)); s.r(4, -40, 2, 1, Lt(GRN)); s.p(7, -39, Md(GRN)); });
    S.part((s) => { s.r(2, -36, 2, 2, Md(MASK)); });
  }

  // ================= ĐÔ VẬT: bé cam và đôi nắm đấm chiêng =================
  // nắm đấm đồng: (x,y) tâm, núm chiêng trên mu bàn tay là con mắt
  function dam(S, x, y, o) {
    o = o || {};
    S.part((s) => {
      s.r(x - 6, y - 5, 13, 11, BRZ); s.r(x - 7, y - 3, 1, 7, BRZ); s.r(x + 7, y - 3, 1, 7, BRZ);
      s.in(() => {
        s.r(x - 6, y - 5, 1, 1, 0);
        s.r(x - 6, y + 3, 13, 3, Dk(BRZ)); s.r(x - 4, y - 5, 9, 1, Lt(BRZ));
        // khe ngón tay phía trước
        s.r(x + 4, y - 2, 4, 1, Dk(BRZ)); s.r(x + 4, y + 1, 4, 1, Dk(BRZ)); s.r(x + 3, y - 5, 1, 9, Dk(BRZ));
        s.p(x + 6, y - 4, SH); s.p(x + 6, y - 1, Lt(BRZ)); s.p(x + 6, y + 2, Lt(BRZ));
        // núm chiêng làm mắt
        s.e(x - 2, y - 0.5, 3, 3, Md(BRZ)); s.e(x - 2, y - 0.5, 2, 2, Lt(BRZ));
        s.r(x - 2, y - 1, 2, 2, INK); s.p(x - 1, y - 1, SH);
        // mày dữ
        s.l(x - 5, y - 5, x, y - 3, 1, INK);
      });
      // ngón cái
      s.r(x - 1, y + 5, 6, 2, BRZ); s.in(() => { s.r(x - 1, y + 6, 6, 1, Dk(BRZ)); });
    });
    // vòng cổ tay đỏ
    S.part((s) => { s.r(x - 9, y - 3, 2, 7, RED); s.in(() => { s.r(x - 9, y - 3, 2, 1, Lt(RED)); }); });
    if (o.tua) S.part({ ol: RED[0] }, (s) => { s.pl([[x - 10, y + 1], [x - 13, y + 3], [x - 15, y + 1]], 1, Md(RED)); });
  }
  function vat(S) {
    dam(S, -17, -10, { tua: true });
    be(S, 0, 0, ORG, { kieu: 'bui', dau: 'du' });
    S.part((s) => { s.r(-5, -18, 11, 1, RED); });
    // tay bé giơ lên điều khiển
    S.part((s) => { s.r(4, -10, 2, 2, Md(MASK)); s.r(-6, -9, 2, 2, Md(MASK)); });
    dam(S, 20, -21, { tua: true });
    S.part({ fx: true }, (s) => { s.p(30, -26, '#ffe9a0'); s.p(31, -19, '#ffd27a'); s.r(29, -23, 2, 1, '#fff6c8'); });
  }

  HUONGS.push({
    id: 3, weaponScale: 4, scale: 7, cmpScale: 4,
    title: 'Hướng 3: Linh khí làm chủ',
    intro: 'Nhân vật chỉ là đứa trẻ tinh linh bé xíu đeo mặt nạ. Vũ khí sống, to quá khổ, có mắt có tính nết, mới là ngôi sao.',
    heroes: [
      { name: 'Thợ Rèn', desc: 'Bé áo đỏ cầm búa rèn tí hon, đi cùng thanh kiếm sống một mắt.', draw: ren, bw: 13, dx: 1, bx: 1, col: '#ffb070' },
      { name: 'Thợ Săn', desc: 'Bé áo xanh vác mũi tên, đi cùng cây cung rồng tự bắn.', draw: san, bw: 12, dx: 4, bx: 4, col: '#a8e08a' },
      { name: 'Thầy Lang', desc: 'Bé áo lam cưỡi bầu thuốc khổng lồ đang ngủ gật.', draw: lang, bw: 12, dx: 2, bx: 1, col: '#9db8ff' },
      { name: 'Đô Vật', desc: 'Bé áo cam điều khiển đôi nắm đấm chiêng đồng bay lơ lửng.', draw: vat, bw: 9, dx: 2, col: '#ff8f7a' },
    ],
    attack: { draw: renDanh, desc: 'Kiếm tự chém, kéo cả bé bay theo', bw: 12, dx: 12, bx: 2, scale: 6 },
    weapons: [
      { label: 'Thường', col: '#e6dfd0', draw: (S) => kiemSong(S, 0, -2, 0, -1, 'thuong') },
      { label: 'Lửa', col: '#ff9a4a', draw: (S) => kiemSong(S, 0, -2, 0, -1, 'lua') },
      { label: 'Độc', col: '#a6e05a', draw: (S) => kiemSong(S, 0, -2, 0, -1, 'doc') },
      { label: 'Băng', col: '#9fdcff', draw: (S) => kiemSong(S, 0, -2, 0, -1, 'bang') },
    ],
  });
})();
