// Hướng 4: Mặt nạ hội làng. Thân người, đội đầu hoặc mặt nạ lễ hội quá khổ, lụa và vải bay phía sau.
'use strict';
(function () {
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const GOLD = ['#9c7426', '#e8b83e', '#fff0a8'];
  const GRN = ['#1f5a35', '#3a9a55', '#8ad98f'];
  const WHT = ['#b4bccb', '#f2f0e8', '#ffffff'];
  const SK = ['#a5633c', '#d99a6c', '#f6caa0'];      // da người
  const SKF = ['#84492b', '#b47a52', '#d99a6c'];     // da phía khuất
  const LEATH = ['#6e4220', '#a2672f', '#cf9150'];
  const BLK = ['#14111a', '#2e2836', '#5c5470'];
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const STEEL = ['#5f6b84', '#b4c0d4', '#f4f8ff'];
  const YEL = ['#b07a10', '#f4bf2c', '#ffe98c'];     // hổ giấy bồi
  const PINK = ['#cf7a6a', '#f6b4a0', '#ffe0d2'];    // mặt Ông Địa
  const TEAL = ['#1c4f7a', '#2f86c0', '#7fc8f0'];    // áo Ông Địa
  const IND = ['#1a2050', '#36439a', '#6f80d8'];     // mặt quỷ
  const TAN = ['#9a7a3c', '#d8b86c', '#f6e2a4'];
  const CREAM = ['#b8a888', '#ece0c4', '#fffaf0'];
  const SH = '#ffffff';

  // ---------- đao của Thợ Rèn ----------
  function dao(S, hx, hy, ux, uy, kind) {
    const n = Math.hypot(ux, uy); ux /= n; uy /= n; const vx = -uy, vy = ux;
    const T = (t, q) => [hx + ux * t + vx * q, hy + uy * t + vy * q];
    const L = (s, a, b, w, c) => s.l(a[0], a[1], b[0], b[1], w, c);
    const B = kind === 'lua' ? ['#8a1c12', '#e8492a', '#ffb347'] : kind === 'doc' ? ['#1d5a2a', '#49a83c', '#b5ea6a'] : kind === 'bang' ? ['#2f62ad', '#7fc4f2', '#eafcff'] : STEEL;
    const olc = kind === 'lua' ? '#4a1010' : kind === 'doc' ? '#12331a' : kind === 'bang' ? '#1c3a70' : INK;
    // tua lụa ở đốc
    S.part({ ol: RED[0] }, (s) => { const a = T(-2, 0), c = kind === 'doc' ? Md(GRN) : kind === 'bang' ? Md(TEAL) : Md(RED); s.pl([a, [a[0] - 3 * ux - 2, a[1] - 3 * uy + 2], [a[0] - 5 * ux - 1, a[1] - 5 * uy + 5], [a[0] - 8 * ux - 3, a[1] - 8 * uy + 6]], 1, c); });
    if (kind === 'lua') S.part({ ol: '#7a1810' }, (s) => { for (const t of [9, 14, 19]) s.g([T(t, -3), T(t + 4, -8), T(t + 5, -3)], Md(['#a32418', '#f2622a', '#ffc64c'])); s.in(() => { for (const t of [9, 14, 19]) { const p = T(t + 3, -5); s.p(p[0], p[1], '#ffc64c'); } }); });
    if (kind === 'bang') S.part({ ol: olc }, (s) => { s.g([T(10, -3), T(14, -7), T(15, -3)], B); s.g([T(17, -3), T(20, -8), T(21, -3)], Lt(B)); s.r(Math.round(T(12, 4)[0]), Math.round(T(12, 4)[1]), 1, 3, Md(B)); s.r(Math.round(T(18, 4)[0]), Math.round(T(18, 4)[1]), 1, 2, Lt(B)); });
    S.part({ ol: olc }, (s) => {
      s.g([T(6, -2), T(21, -3), T(27, -6), T(27, 1), T(23, 4), T(14, 4), T(6, 2)], B);
      s.in(() => {
        L(s, T(6, -2), T(21, -3), 1, Dk(B)); L(s, T(7, 2), T(14, 3), 1, Lt(B)); L(s, T(14, 3), T(23, 3), 1, Lt(B)); L(s, T(23, 3), T(26, 1), 1, Lt(B));
        L(s, T(9, 0), T(20, 0), 1, Dk(B)); L(s, T(11, 1), T(16, 1), 1, SH);
        if (kind === 'lua') { L(s, T(8, 1), T(22, 1), 1, '#fff0b0'); }
        if (kind === 'doc') { for (const t of [10, 14, 18, 22]) { const p = T(t, -1); s.p(p[0], p[1], Dk(B)); } }
        if (kind === 'bang') { L(s, T(13, -2), T(16, 2), 1, SH); L(s, T(20, -2), T(23, 2), 1, SH); }
        const h = T(24, -3); s.p(h[0], h[1], INK); // lỗ khuyên
      });
    });
    // chắn tay tròn, chuôi quấn đỏ, khuyên
    S.part((s) => { const G = kind === 'doc' ? ['#3d1d55', '#6b3a8f', '#a56fd0'] : kind === 'bang' ? ['#3b5fa8', '#9fd0f5', '#ffffff'] : GOLD; s.g([T(4, -4), T(6, -4), T(6, 4), T(4, 4)], G); });
    S.part((s) => { L(s, T(0, 0), T(3, 0), 2, RED); });
    S.part((s) => { const p = T(-2, 0); s.e(p[0], p[1], 1.5, 1.5, GOLD); });
    if (kind === 'lua') S.part({ fx: true }, (s) => { for (const q of [[14, -11, '#ffb347'], [22, -10, '#ffd27a'], [29, -4, '#ff8a3a'], [27, 6, '#ffd27a']]) { const p = T(q[0], q[1]); s.p(p[0], p[1], q[2]); } });
    if (kind === 'doc') { S.part({ ol: olc }, (s) => { const p = T(24, 3); s.r(Math.round(p[0]), Math.round(p[1]) + 1, 1, 3, Lt(B)); }); S.part({ fx: true }, (s) => { for (const q of [[15, 8, '#b5ea6a'], [28, -6, '#a56fd0']]) { const p = T(q[0], q[1]); s.p(p[0], p[1], q[2]); } const p = T(20, -8); s.r(p[0], p[1], 2, 2, 'rgba(181,234,106,0.7)'); }); }
    if (kind === 'bang') S.part({ fx: true }, (s) => { const sp = (a) => { const x = Math.round(a[0]), y = Math.round(a[1]); s.p(x, y, SH); s.p(x - 1, y, '#bfe9ff'); s.p(x + 1, y, '#bfe9ff'); s.p(x, y - 1, '#bfe9ff'); s.p(x, y + 1, '#bfe9ff'); }; sp(T(26, -8)); sp(T(12, 8)); });
  }

  // ================= THỢ RÈN: đầu lân =================
  // đầu lân, (x,y) là góc dưới gáy; mo: miệng há to
  function dauLan(S, x, y, mo) {
    const m = mo ? 2 : 0;
    // tai
    S.part((s) => { s.g([[x - 7, y - 13], [x - 13, y - 17], [x - 11, y - 9]], PINK); s.in(() => { s.l(x - 12, y - 16, x - 10, y - 11, 1, Md(WHT)); }); });
    // sừng
    S.part((s) => { s.g([[x, y - 16], [x + 2, y - 21], [x + 5, y - 16]], GOLD); });
    // hàm dưới và râu trắng
    S.part((s) => { s.g([[x - 1, y + 5 + m], [x + 11, y + 5 + m], [x + 10, y + 9 + m], [x + 8, y + 7 + m], [x + 6, y + 11 + m], [x + 4, y + 7 + m], [x + 2, y + 10 + m], [x, y + 7 + m]], WHT); });
    S.part((s) => { s.r(x - 1, y + 3 + m, 12, 2, RED); s.in(() => { s.r(x - 1, y + 4 + m, 12, 1, Dk(RED)); }); });
    S.part({ ol: false }, (s) => {
      s.r(x, y + 1, 11, 2 + m, '#4a0f14');
      for (let i = 1; i < 11; i += 2) s.p(x + i, y + 2 + m, SH);         // răng dưới
      if (mo) s.r(x + 3, y + 2, 5, 2, Md(PINK));                        // lưỡi
    });
    // khối đầu
    S.part((s) => {
      s.r(x - 6, y - 15, 15, 16, RED); s.r(x - 7, y - 14, 17, 15, RED); s.r(x - 8, y - 12, 19, 12, RED);
      s.in(() => {
        s.r(x - 8, y - 5, 6, 5, Dk(RED)); s.r(x - 5, y - 15, 13, 1, Lt(RED));
        s.r(x + 1, y - 14, 4, 2, Md(GOLD)); s.r(x + 2, y - 14, 2, 1, SH);                 // gương trán
        // mày lông trắng xù
        s.r(x - 3, y - 12, 8, 2, Md(WHT)); s.p(x - 4, y - 11, Md(WHT)); s.p(x - 2, y - 13, Md(WHT)); s.p(x + 1, y - 13, Md(WHT)); s.p(x + 4, y - 13, Md(WHT));
        s.r(x + 6, y - 12, 5, 2, Md(WHT)); s.p(x + 7, y - 13, Md(WHT)); s.p(x + 9, y - 13, Md(WHT));
        // mắt to viền đen
        s.r(x - 2, y - 10, 7, 6, INK); s.r(x - 1, y - 9, 5, 4, SH); s.r(x, y - 8, 3, 2, INK); s.p(x, y - 8, SH);
        s.r(x + 6, y - 10, 5, 6, INK); s.r(x + 7, y - 9, 3, 4, SH); s.r(x + 8, y - 8, 1, 2, INK);
        // xoáy vàng trên má, viền lông gáy
        s.r(x - 6, y - 9, 3, 1, Md(GOLD)); s.r(x - 6, y - 8, 1, 2, Md(GOLD)); s.r(x - 5, y - 6, 2, 1, Md(GOLD));
        s.r(x - 8, y - 1, 9, 1, Md(WHT)); s.r(x - 8, y - 11, 1, 10, Md(WHT));
      });
    });
    // mõm trên, mũi xanh, ria lông trắng
    S.part((s) => {
      s.r(x + 1, y - 3, 13, 3, RED); s.r(x + 1, y, 13, 1, WHT);
      s.in(() => { s.r(x + 2, y - 3, 11, 1, Lt(RED)); s.p(x + 4, y - 2, Md(GOLD)); s.p(x + 7, y - 2, Md(GOLD)); });
    });
    S.part((s) => { s.r(x + 12, y - 5, 3, 2, GRN); });
    // quả bông trên dây
    S.part({ ol: false }, (s) => { s.p(x + 7, y - 16, Md(GOLD)); s.p(x + 8, y - 17, Md(GOLD)); s.p(x - 3, y - 16, Md(GOLD)); s.p(x - 4, y - 17, Md(GOLD)); });
    S.part((s) => { s.r(x + 9, y - 19, 2, 2, GRN); });
    S.part((s) => { s.r(x - 6, y - 19, 2, 2, GOLD); });
  }
  // dải lụa bay: băng rộng 3 điểm, đuôi chẻ
  function lua(S, pts, C) {
    S.part((s) => {
      s.pl(pts.slice(0, -1), 3, C);
      const a = pts[pts.length - 2], e = pts[pts.length - 1];
      s.l(a[0], a[1], e[0], e[1], 2, C); s.p(e[0] - 2, e[1] - 1, C);
    });
  }
  function duoiLan(S, pts, fr) { // tấm vải đuôi lân bay phía sau
    S.part((s) => {
      s.g(pts, RED);
      s.in(() => { for (const q of fr.v) s.l(q[0], q[1], q[2], q[3], 1, Md(GOLD)); for (const q of fr.g) s.l(q[0], q[1], q[2], q[3], 1, Md(GRN)); });
    });
    S.part((s) => { s.pl(fr.w, 1, WHT); });
  }
  function lan(S) {
    duoiLan(S, [[-6, -41], [-13, -41], [-19, -36], [-25, -38], [-28, -32], [-21, -28], [-14, -31], [-8, -27], [-6, -28]],
      { v: [[-10, -41, -11, -30], [-15, -39, -17, -30], [-21, -36, -23, -30]], g: [[-12, -41, -13, -31], [-18, -37, -20, -30]], w: [[-7, -27], [-9, -26], [-14, -30], [-21, -27], [-28, -31]] });
    // chân khuất, chân gần: quần lân đỏ tua vàng
    S.part((s) => { s.r(2, -10, 3, 8, Dk(RED)); s.in(() => { s.r(2, -5, 3, 1, Md(GOLD)); }); });
    S.part((s) => { s.r(2, -2, 5, 2, BLK); });
    S.part((s) => { s.g([[-4, -11], [0, -11], [-1, -3], [-5, -3]], RED); s.in(() => { s.r(-5, -5, 5, 1, Md(GOLD)); s.r(-5, -8, 5, 1, Md(GOLD)); }); });
    S.part((s) => { s.r(-5, -2, 5, 2, BLK); });
    // tay khuất
    S.part((s) => { s.l(4, -19, 9, -16, 3, SKF); });
    // thân trần, tạp dề da
    S.part((s) => {
      s.r(-4, -21, 9, 11, SK);
      s.in(() => { s.g([[-1, -21], [5, -21], [5, -10], [-3, -10]], Md(LEATH)); s.r(-4, -13, 9, 1, Dk(LEATH)); s.l(-1, -21, -3, -11, 1, Dk(LEATH)); s.r(1, -17, 3, 1, Lt(LEATH)); });
    });
    S.part((s) => { s.r(-5, -11, 11, 2, GOLD); });
    dao(S, 12, -15, 2, -1, 'thuong');
    dauLan(S, 0, -28);
    // tay gần cầm đao
    S.part((s) => { s.e(-3, -20, 2, 2, SK); s.l(-3, -19, 2, -14, 3, SK); s.l(2, -14, 9, -14, 3, SK); s.in(() => { s.r(5, -15, 2, 3, Md(RED)); }); });
    S.part((s) => { s.r(10, -16, 3, 3, SK); });
  }
  function lanDanh(S) {
    // vệt đao
    S.part({ fx: true }, (s) => {
      const cols = ['#7a2f24', '#b9482a', '#ee7f34', '#ffc35a', '#fff0b8'];
      for (let y = -56; y <= 2; y++) for (let x = -20; x <= 44; x++) {
        const dx = x - 4, dy = y + 19, d = Math.sqrt(dx * dx + dy * dy); const a = Math.atan2(dy, dx) * 180 / Math.PI;
        const t = (a + 95) / 120; if (t < 0 || t > 1) continue;
        if (Math.abs(d - 27) > 0.4 + 4 * t) continue;
        s.p(x, y, cols[Math.min(4, Math.floor(t * 5))]);
      }
    });
    duoiLan(S, [[-3, -42], [-10, -44], [-17, -41], [-23, -45], [-27, -41], [-21, -36], [-14, -38], [-6, -33], [-3, -32]],
      { v: [[-7, -43, -8, -35], [-13, -42, -14, -38], [-19, -43, -21, -37]], g: [[-10, -44, -11, -37], [-16, -41, -17, -38]], w: [[-4, -32], [-7, -33], [-14, -37], [-21, -35], [-27, -40]] });
    // chân sau duỗi, chân trước khuỵu
    S.part((s) => { s.l(-3, -10, -9, -4, 4, RED); s.in(() => { s.l(-9, -7, -6, -4, 1, Md(GOLD)); }); });
    S.part((s) => { s.r(-13, -2, 5, 2, BLK); });
    S.part((s) => { s.l(4, -10, 8, -6, 4, Dk(RED)); s.r(7, -6, 3, 4, Dk(RED)); s.in(() => { s.r(7, -4, 3, 1, Md(GOLD)); }); });
    S.part((s) => { s.r(7, -2, 5, 2, BLK); });
    // thân chúi tới
    S.part((s) => {
      s.g([[-2, -22], [7, -21], [6, -10], [-4, -10]], SK);
      s.in(() => { s.g([[1, -22], [7, -21], [6, -10], [-1, -10]], Md(LEATH)); s.r(-4, -13, 11, 1, Dk(LEATH)); s.r(3, -17, 3, 1, Lt(LEATH)); });
    });
    S.part((s) => { s.r(-5, -11, 12, 2, GOLD); });
    // tay khuất vươn theo
    S.part((s) => { s.l(7, -19, 13, -15, 3, SKF); });
    dao(S, 17, -12, 2, 1, 'thuong');
    dauLan(S, 3, -29, true);
    // tay gần
    S.part((s) => { s.e(0, -20, 2, 2, SK); s.l(0, -19, 7, -15, 3, SK); s.l(7, -15, 14, -13, 3, SK); s.in(() => { s.r(9, -16, 2, 3, Md(RED)); }); });
    S.part((s) => { s.r(15, -14, 3, 3, SK); });
    S.part({ fx: true }, (s) => { s.p(42, -6, '#ffd27a'); s.p(44, -1, '#ffb347'); s.p(40, 2, '#fff3c4'); });
  }

  // ================= THỢ SĂN: mặt nạ hổ giấy bồi =================
  function hoGiay(S) {
    // hai dải lụa buộc mặt nạ bay ra sau
    lua(S, [[-6, -35], [-13, -38], [-20, -35], [-26, -37]], RED);
    lua(S, [[-6, -31], [-12, -29], [-18, -32], [-23, -30]], GRN);
    // ống tên
    S.part((s) => { s.g([[-8, -23], [-5, -24], [-2, -12], [-5, -11]], LEATH); s.r(-10, -27, 2, 3, Md(RED)); s.r(-7, -28, 2, 3, Md(RED)); });
    // dây cung
    S.part({ ol: false }, (s) => { s.l(12, -29, 12, -4, 1, '#e8e2d0'); });
    // chân: quần nâu, xà cạp
    S.part((s) => { s.r(2, -10, 3, 8, Dk(WD)); s.in(() => { s.r(2, -6, 3, 4, Dk(CREAM)); }); });
    S.part((s) => { s.r(2, -2, 5, 2, BLK); });
    S.part((s) => { s.g([[-3, -11], [0, -11], [-1, -3], [-4, -3]], WD); s.in(() => { s.r(-4, -6, 4, 4, Md(CREAM)); s.r(-4, -5, 4, 1, Dk(CREAM)); }); });
    S.part((s) => { s.r(-4, -2, 5, 2, BLK); });
    // tay khuất cầm cung
    S.part((s) => { s.l(4, -19, 12, -17, 2, SKF); });
    // thân áo xanh
    S.part((s) => {
      s.r(-3, -21, 7, 11, GRN);
      s.in(() => { s.l(-2, -21, 3, -12, 1, Md(LEATH)); s.r(-3, -13, 7, 1, Md(GOLD)); s.r(-3, -21, 1, 9, Dk(GRN)); });
    });
    S.part((s) => { s.g([[-4, -11], [4, -11], [5, -8], [-4, -8]], GRN); s.in(() => { s.r(-4, -9, 9, 1, Lt(GRN)); }); });
    // cánh cung
    S.part((s) => { s.pl([[12, -30], [15, -25], [16, -17], [15, -9], [12, -4]], 1, WD); s.p(12, -30, Md(GOLD)); s.p(12, -4, Md(GOLD)); s.r(15, -19, 2, 4, Md(RED)); });
    S.part((s) => { s.r(13, -19, 3, 3, SK); });
    // tai hổ
    S.part((s) => { s.e(-4, -40, 2.5, 2.5, YEL); s.in(() => { s.r(-5, -40, 2, 2, Md(PINK)); }); });
    S.part((s) => { s.e(7, -40, 2.5, 2.5, YEL); s.in(() => { s.r(6, -40, 2, 2, Md(PINK)); }); });
    // mặt nạ hổ tròn to
    S.part((s) => {
      s.e(1.5, -32, 8.5, 7.5, YEL);
      s.in(() => {
        s.e(-3, -27, 5, 3, Dk(YEL));
        s.r(3, -40, 1, 3, INK); s.r(1, -39, 1, 2, INK); s.r(5, -39, 1, 2, INK);        // vằn trán
        s.r(-7, -34, 3, 1, INK); s.r(-7, -32, 3, 1, INK); s.r(-6, -30, 2, 1, INK);      // vằn má
        s.r(-1, -36, 4, 4, SH); s.r(1, -35, 2, 2, INK);                                 // mắt gần
        s.r(6, -36, 3, 4, SH); s.r(7, -35, 2, 2, INK);                                  // mắt xa
        s.r(-2, -37, 5, 1, INK); s.r(6, -37, 4, 1, INK);                                // mày
        s.r(4, -32, 2, 1, Md(RED)); s.p(4, -31, Md(RED));                               // mũi
        s.r(0, -30, 9, 3, Md(RED)); s.r(0, -30, 9, 1, INK); s.r(1, -29, 1, 1, SH); s.r(3, -29, 1, 1, SH); s.r(5, -29, 1, 1, SH); s.r(7, -29, 1, 1, SH); // miệng đỏ, nanh
        s.p(-3, -29, Md(RED)); s.p(-2, -28, Md(RED)); s.p(-4, -28, Md(RED));            // xoáy má đỏ
      });
    });
    // tay gần cầm mũi tên
    S.part((s) => { s.l(-3, -19, -1, -14, 2, SK); s.l(-1, -14, 5, -13, 2, SK); });
    S.part((s) => { s.r(1, -13, 11, 1, WD); });
    S.part((s) => { s.g([[12, -15], [15, -13], [12, -11]], STEEL); });
    S.part((s) => { s.r(5, -14, 3, 3, SK); });
  }

  // ================= THẦY LANG: mặt nạ Ông Địa =================
  function ongDia(S) {
    // dải thắt lưng đỏ bay sau
    lua(S, [[-6, -13], [-13, -16], [-19, -13], [-24, -15]], RED);
    lua(S, [[-6, -10], [-12, -8], [-17, -10]], RED);
    // bầu thuốc đeo hông
    S.part((s) => { s.e(-7, -9, 1.5, 1.5, TAN); s.e(-7, -5, 2.5, 2.5, TAN); s.in(() => { s.p(-6, -6, SH); }); s.r(-8, -8, 3, 1, Md(RED)); });
    // chân ngắn, quần trắng
    S.part((s) => { s.r(2, -6, 3, 4, Dk(CREAM)); });
    S.part((s) => { s.r(2, -2, 5, 2, BLK); });
    S.part((s) => { s.r(-3, -6, 4, 4, CREAM); });
    S.part((s) => { s.r(-4, -2, 5, 2, BLK); });
    // tay khuất giơ quạt mo
    S.part((s) => { s.l(5, -18, 11, -20, 3, Dk(TEAL)); });
    S.part((s) => { s.r(13, -22, 1, 4, WD); });
    S.part((s) => { s.g([[10, -23], [12, -31], [16, -32], [18, -27], [16, -22]], TAN); s.in(() => { s.l(13, -23, 13, -30, 1, Dk(TAN)); s.l(15, -23, 16, -30, 1, Dk(TAN)); s.l(11, -24, 12, -30, 1, Lt(TAN)); }); });
    S.part((s) => { s.r(11, -21, 3, 3, PINK); });
    // áo xanh bụng phệ
    S.part((s) => {
      s.e(0, -14, 7, 7.5, TEAL);
      s.in(() => { s.e(-4, -10, 5, 4, Dk(TEAL)); s.r(4, -18, 1, 5, Lt(TEAL)); s.l(1, -21, 2, -8, 1, Dk(TEAL)); s.r(-7, -12, 15, 2, Md(RED)); s.r(-7, -12, 15, 1, Lt(RED)); s.r(0, -13, 3, 4, Md(GOLD)); });
    });
    // búi tóc hai bên
    S.part((s) => { s.e(-7, -39, 2, 2, BLK); });
    S.part((s) => { s.e(9, -39, 2, 2, BLK); });
    // mặt Ông Địa tròn, cười toe
    S.part((s) => {
      s.e(1, -31, 8.5, 8.5, PINK);
      s.in(() => {
        s.e(-3, -25, 6, 3, Dk(PINK));
        s.r(-7, -39, 16, 1, Md(BLK)); s.r(-8, -38, 3, 3, Md(BLK)); s.r(8, -38, 2, 2, Md(BLK)); s.r(-2, -40, 6, 1, Md(BLK)); // chân tóc
        s.p(-1, -34, INK); s.r(0, -35, 2, 1, INK); s.p(2, -34, INK);                      // mắt cười
        s.p(5, -34, INK); s.r(6, -35, 2, 1, INK); s.p(8, -34, INK);
        s.r(-1, -37, 3, 1, INK); s.r(5, -37, 3, 1, INK);                                  // mày
        s.r(-3, -32, 3, 2, '#ee6f6a'); s.r(7, -32, 3, 2, '#ee6f6a');                      // má hồng
        s.r(3, -33, 2, 2, Dk(PINK)); s.p(4, -33, Lt(PINK));                               // mũi
        s.r(-1, -29, 9, 3, '#b3201c'); s.r(0, -29, 7, 1, SH); s.p(-2, -30, '#b3201c'); s.p(8, -30, '#b3201c'); s.r(1, -26, 5, 1, '#b3201c'); // miệng cười
        s.p(5, -38, SH); s.p(6, -37, SH);
      });
    });
    // tay gần đặt lên bụng
    S.part({ ol: TEAL[0] }, (s) => { s.l(-5, -19, -4, -14, 3, TEAL); s.l(-4, -14, 2, -15, 3, TEAL); });
    S.part((s) => { s.r(3, -17, 3, 3, PINK); });
  }

  // ================= ĐÔ VẬT: mặt quỷ gỗ =================
  function quy(S) {
    // bờm tóc trắng bay sau
    S.part((s) => {
      s.g([[-7, -40], [-14, -42], [-20, -38], [-25, -40], [-27, -35], [-22, -32], [-25, -28], [-18, -27], [-13, -30], [-8, -27]], WHT);
      s.in(() => { s.l(-9, -38, -19, -36, 1, Dk(WHT)); s.l(-10, -33, -21, -30, 1, Dk(WHT)); s.l(-12, -41, -19, -39, 1, Lt(WHT)); });
    });
    // dải khố đỏ bay
    lua(S, [[-8, -11], [-15, -14], [-21, -11], [-26, -13]], RED);
    // tay khuất vươn trước
    S.part((s) => { s.l(8, -20, 15, -19, 5, SKF); });
    S.part((s) => { s.e(18, -19, 3, 3, SKF); s.in(() => { s.r(16, -21, 2, 5, Md(RED)); s.p(20, -20, Dk(SKF)); s.p(20, -18, Dk(SKF)); }); });
    // chân to
    S.part((s) => { s.r(3, -10, 5, 8, SKF); s.in(() => { s.r(3, -5, 5, 2, Dk(CREAM)); }); });
    S.part((s) => { s.r(3, -2, 7, 2, SKF); });
    S.part((s) => { s.r(-8, -10, 6, 8, SK); s.in(() => { s.r(-8, -5, 6, 2, Md(CREAM)); }); });
    S.part((s) => { s.r(-8, -2, 8, 2, SK); });
    // thân trần vạm vỡ
    S.part((s) => {
      s.g([[-10, -23], [9, -23], [7, -10], [-8, -10]], SK);
      s.in(() => { s.r(-10, -23, 3, 13, Dk(SK)); s.r(-3, -18, 10, 1, Dk(SK)); s.r(2, -18, 1, 7, Dk(SK)); s.r(-1, -15, 7, 1, Dk(SK)); s.r(4, -22, 4, 1, Lt(SK)); s.p(-1, -20, Dk(SK)); s.p(5, -20, Dk(SK)); });
    });
    // khố đỏ
    S.part((s) => { s.g([[-9, -12], [8, -12], [7, -8], [-8, -8]], RED); s.r(0, -8, 5, 5, RED); s.in(() => { s.r(-9, -12, 18, 1, Lt(RED)); s.r(0, -4, 5, 1, Md(GOLD)); }); });
    // sừng
    S.part((s) => { s.pl([[-5, -41], [-8, -44], [-7, -47]], 2, GOLD); });
    S.part((s) => { s.pl([[8, -41], [12, -44], [12, -47]], 2, GOLD); });
    // mặt quỷ góc cạnh
    S.part((s) => {
      s.g([[-8, -28], [-9, -35], [-5, -41], [8, -41], [11, -35], [10, -28], [5, -23], [-3, -23]], IND);
      s.in(() => {
        s.g([[-8, -28], [-9, -34], [-5, -32], [-4, -25]], Dk(IND));
        s.r(-5, -37, 16, 2, Md(GOLD)); s.r(-5, -37, 16, 1, Lt(GOLD)); s.r(2, -39, 3, 2, Md(RED));  // gờ mày vàng, ngọc trán
        s.r(-2, -35, 4, 4, '#ffe36a'); s.r(0, -34, 2, 2, INK); s.r(-3, -35, 6, 1, Md(RED));         // mắt gần
        s.r(6, -35, 4, 4, '#ffe36a'); s.r(8, -34, 2, 2, INK); s.r(5, -35, 6, 1, Md(RED));           // mắt xa
        s.r(3, -32, 2, 3, Lt(IND)); s.r(2, -30, 4, 1, Lt(IND));                                     // mũi
        s.r(-3, -28, 12, 3, '#7a1218'); s.r(-2, -28, 10, 1, SH);                                    // miệng, răng
        s.r(-3, -31, 2, 4, SH); s.p(-3, -32, SH); s.r(8, -31, 2, 4, SH); s.p(9, -32, SH);           // nanh ngược
        s.r(0, -24, 5, 1, Md(GOLD));
      });
    });
    // tay gần gồng bên hông, nắm đấm quấn vải
    S.part((s) => { s.e(-9, -21, 3.5, 3.5, SK); s.l(-10, -19, -12, -13, 5, SK); s.in(() => { s.r(-11, -23, 3, 1, Lt(SK)); s.r(-14, -17, 1, 5, Dk(SK)); }); });
    S.part((s) => { s.e(-12, -9, 3.5, 3.5, SK); s.in(() => { s.r(-15, -13, 7, 2, Md(RED)); s.p(-10, -9, Dk(SK)); s.p(-10, -7, Dk(SK)); s.p(-11, -11, SH); }); });
  }

  HUONGS.push({
    id: 4, weaponScale: 5, scale: 7,
    title: 'Hướng 4: Mặt nạ hội làng',
    intro: 'Thân người thật, nhưng ai cũng đội một chiếc đầu hoặc mặt nạ lễ hội to quá khổ, lụa và vải bay phía sau.',
    heroes: [
      { name: 'Thợ Rèn', desc: 'Đội đầu lân đỏ, đuôi lân bay sau lưng, tay cầm đao.', draw: lan, bw: 9, dx: 3, col: '#ffb070' },
      { name: 'Thợ Săn', desc: 'Mặt nạ hổ giấy bồi vàng, áo xanh, dải lụa bay, cầm cung.', draw: hoGiay, bw: 8, dx: -3, col: '#a8e08a' },
      { name: 'Thầy Lang', desc: 'Mặt Ông Địa tròn cười toe, bụng phệ, phe phẩy quạt mo.', draw: ongDia, bw: 9, dx: 0, col: '#9db8ff' },
      { name: 'Đô Vật', desc: 'Mặt quỷ gỗ sừng vàng, bờm trắng, thân trần, khố đỏ.', draw: quy, bw: 12, dx: -3, col: '#ff8f7a' },
    ],
    attack: { draw: lanDanh, desc: 'Đầu lân há miệng, đao chém xuống', bw: 12, dx: 8, scale: 6 },
    weapons: [
      { label: 'Thường', col: '#e6dfd0', draw: (S) => dao(S, 0, -3, 0, -1, 'thuong') },
      { label: 'Lửa', col: '#ff9a4a', draw: (S) => dao(S, 0, -3, 0, -1, 'lua') },
      { label: 'Độc', col: '#a6e05a', draw: (S) => dao(S, 0, -3, 0, -1, 'doc') },
      { label: 'Băng', col: '#9fdcff', draw: (S) => dao(S, 0, -3, 0, -1, 'bang') },
    ],
  });
})();
