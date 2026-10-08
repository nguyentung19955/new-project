// Hướng 2: Rối nước. Bốn hero là con rối gỗ sơn mài: màu bóng, khớp tròn lộ rõ, mặt khắc tươi cười, đứng trên gợn nước.
'use strict';
(function () {
  const RED = ['#7d1414', '#cf2a22', '#ff6f4f'];
  const GRN = ['#1c5733', '#2f9a55', '#86de8f'];
  const YEL = ['#a66c10', '#f0b429', '#ffe680'];
  const BLK = ['#0f0c14', '#2b2534', '#62587a'];
  const FL = ['#d58c72', '#f6c7a2', '#fff1de'];     // da sơn hồng phấn
  const JT = ['#8a6420', '#e2b64e', '#fff0b0'];     // khớp gỗ thếp vàng
  const WD = ['#5a3822', '#8a5a34', '#b78350'];
  const SIL = ['#7f8ca4', '#dbe3ee', '#ffffff'];    // gỗ sơn bạc
  const WHT = ['#b9c2d2', '#f2f4f8', '#ffffff'];
  const BLU = ['#1f3f86', '#3f6fd0', '#8fb4ff'];
  const JADE = ['#1f6a5a', '#3fb596', '#a6f0d2'];
  const SH = '#ffffff';
  const CHEEK = '#ef7f78', LIP = '#c4241f';

  // khớp tròn
  const khop = (s, x, y) => { s.r(x, y, 2, 2, Md(JT)); s.p(x + 1, y, Lt(JT)); s.p(x, y + 1, Dk(JT)); };
  // mặt khắc: (x,y) là tâm đầu, mặt hơi quay sang phải
  function mat(s, x, y, o) {
    o = o || {};
    if (o.cuoi) { // mắt cười nhắm
      s.p(x, y - 1, INK); s.p(x + 1, y - 2, INK); s.p(x + 2, y - 1, INK);
      s.p(x + 4, y - 1, INK); s.p(x + 5, y - 2, INK); s.p(x + 6, y - 1, INK);
    } else {
      s.r(x + 1, y - 2, 1, 2, INK); s.r(x + 4, y - 2, 1, 2, INK);
      if (!o.mayBac) { s.r(x, y - 4, 2, 1, INK); s.r(x + 4, y - 4, 2, 1, INK); }
    }
    s.r(x - 1, y + 1, 2, 1, CHEEK); s.r(x + 5, y + 1, 2, 1, CHEEK);
    s.p(x + 1, y + 2, LIP); s.r(x + 2, y + 3, 2, 1, LIP); s.p(x + 4, y + 2, LIP);
    if (o.rang) { s.r(x + 2, y + 2, 2, 1, SH); }
  }
  function dau(S, x, y, o) {
    o = o || {};
    S.part((s) => {
      s.e(x, y, 6.5, 6.5, FL);
      s.in(() => {
        s.e(x - 2, y + 5, 5, 2, Dk(FL));
        if (o.toc !== false) { s.r(x - 7, y - 7, 14, 3, Md(BLK)); s.r(x - 7, y - 4, 6, 1, Md(BLK)); s.r(x - 7, y - 3, 3, 6, Md(BLK)); s.r(x - 2, y - 6, 3, 1, Lt(BLK)); }
        mat(s, x, y, o);
        s.p(x + 5, y - 3, SH); // ánh bóng sơn
      });
    });
  }
  // thân trụ tròn sơn bóng
  function than(s, x, y, w, h, C) {
    s.r(x + 1, y, w - 2, h, C); s.r(x, y + 1, w, h - 2, C);
    s.in(() => { s.r(x + w - 3, y + 1, 1, h - 4, Lt(C)); s.p(x + w - 3, y + 2, SH); s.r(x, y + 1, 2, h - 2, Dk(C)); });
  }
  const chan = (S, x, C) => {
    S.part((s) => { s.r(x, -9, 3, 7, C); s.in(() => { s.p(x + 2, -8, Lt(C)); }); khop(s, x, -6); });
    S.part((s) => { s.r(x, -2, 5, 2, WD); });
  };

  // ============ kiếm gỗ đồ chơi của Thợ Rèn (dựng đứng, chuôi tại x,y) ============
  function kiem(S, x, y, kind) {
    const B = kind === 'lua' ? ['#8a1c12', '#e8492a', '#ffb347'] : kind === 'doc' ? ['#1d5a2a', '#49a83c', '#b5ea6a'] : kind === 'bang' ? ['#2f62ad', '#7fc4f2', '#eafcff'] : SIL;
    const olc = kind === 'lua' ? '#4a1010' : kind === 'doc' ? '#12331a' : kind === 'bang' ? '#1c3a70' : INK;
    // tua
    S.part({ ol: false }, (s) => { const c = kind === 'doc' ? Md(GRN) : kind === 'bang' ? Md(BLU) : Md(RED); s.p(x + 1, y + 1, c); s.p(x + 2, y + 2, c); s.p(x + 2, y + 3, c); s.p(x + 3, y + 4, c); s.p(x + 2, y + 4, c); });
    // lưỡi
    S.part({ ol: olc }, (s) => {
      if (kind === 'lua') {
        // lưỡi lượn sóng như ngọn lửa
        s.g([[x - 2, y - 9], [x - 3, y - 13], [x - 1, y - 16], [x - 3, y - 20], [x - 1, y - 24], [x - 2, y - 27], [x, y - 32], [x + 2, y - 27], [x + 1, y - 24], [x + 3, y - 20], [x + 1, y - 16], [x + 3, y - 13], [x + 2, y - 9]], B);
        s.in(() => { s.l(x, y - 10, x, y - 28, 1, Lt(B)); s.p(x, y - 12, '#fff3c0'); s.p(x, y - 13, '#fff3c0'); s.p(x - 1, y - 18, Md(YEL)); s.p(x + 1, y - 22, Md(YEL)); s.p(x, y - 26, '#fff3c0'); });
      } else if (kind === 'bang') {
        s.g([[x - 2, y - 9], [x - 2, y - 26], [x, y - 33], [x + 2, y - 26], [x + 2, y - 9]], B);
        s.g([[x - 2, y - 18], [x - 5, y - 21], [x - 2, y - 22]], B); s.g([[x + 2, y - 14], [x + 5, y - 17], [x + 2, y - 18]], B);
        s.in(() => { s.r(x - 2, y - 26, 1, 17, Dk(B)); s.l(x + 1, y - 10, x + 1, y - 27, 1, Lt(B)); s.l(x - 1, y - 12, x + 1, y - 15, 1, SH); s.l(x - 1, y - 20, x + 1, y - 23, 1, SH); s.p(x, y - 31, SH); s.p(x, y - 30, SH); });
      } else {
        s.r(x - 2, y - 28, 4, 19, B); s.r(x - 1, y - 30, 2, 2, B);
        s.in(() => {
          s.r(x - 2, y - 28, 1, 19, Dk(B)); s.r(x + 1, y - 27, 1, 16, Lt(B)); s.r(x + 1, y - 26, 1, 3, SH);
          if (kind === 'doc') { // rắn quấn quanh lưỡi
            for (let k = 0; k < 4; k++) { s.r(x - 2, y - 12 - k * 4, 2, 1, Md(YEL)); s.r(x, y - 14 - k * 4, 2, 1, Md(YEL)); }
          } else { s.r(x - 1, y - 24, 1, 12, Dk(B)); }
        });
        if (kind === 'doc') { s.r(x - 3, y - 31, 5, 3, B); s.p(x - 2, y - 30, '#ffe680'); s.p(x + 1, y - 30, '#ffe680'); s.p(x - 1, y - 32, Md(RED)); s.p(x, y - 33, Md(RED)); s.p(x - 2, y - 33, Md(RED)); }
      }
    });
    // chắn tay và chuôi
    S.part((s) => {
      const Gd = kind === 'bang' ? BLU : kind === 'doc' ? ['#3d1d55', '#6b3a8f', '#a56fd0'] : RED;
      s.r(x - 4, y - 9, 8, 2, Gd); s.p(x - 4, y - 9, Lt(Gd)); s.p(x + 3, y - 9, Lt(Gd)); s.r(x - 1, y - 9, 2, 1, Md(JT));
      s.r(x - 1, y - 7, 2, 5, kind === 'thuong' || !kind ? WD : BLK); s.r(x - 1, y - 5, 2, 1, Md(JT));
      s.r(x - 1, y - 2, 2, 2, JT);
    });
    if (kind === 'lua') S.part({ fx: true }, (s) => { s.p(x - 5, y - 26, '#ffb347'); s.p(x + 5, y - 30, '#ffd27a'); s.p(x + 4, y - 22, '#ff8a3a'); s.p(x - 4, y - 31, '#ffd27a'); s.p(x, y - 35, '#ffb347'); });
    if (kind === 'doc') { S.part({ ol: '#12331a' }, (s) => { s.r(x + 2, y - 20, 1, 2, Lt(B)); }); S.part({ fx: true }, (s) => { s.p(x + 2, y - 16, '#b5ea6a'); s.p(x - 5, y - 24, '#b5ea6a'); s.r(x + 5, y - 28, 2, 2, 'rgba(181,234,106,0.7)'); }); }
    if (kind === 'bang') S.part({ fx: true }, (s) => { const sp = (a, b) => { s.p(a, b, SH); s.p(a - 1, b, '#bfe9ff'); s.p(a + 1, b, '#bfe9ff'); s.p(a, b - 1, '#bfe9ff'); s.p(a, b + 1, '#bfe9ff'); }; sp(x - 6, y - 28); sp(x + 7, y - 23); s.p(x + 5, y - 32, '#eafcff'); });
  }

  // ================= THỢ RÈN =================
  function ren(S) {
    // tay khuất chìa búa gỗ ra sau
    S.part((s) => { s.r(-15, -16, 6, 2, WD); });
    S.part((s) => { s.r(-19, -20, 5, 9, BLK); s.in(() => { s.r(-19, -20, 5, 2, Md(JT)); s.r(-19, -13, 5, 2, Md(JT)); s.r(-16, -17, 1, 3, Lt(BLK)); }); });
    S.part((s) => { s.l(-5, -17, -8, -15, 2, Dk(RED)); });
    S.part((s) => { s.e(-9.5, -14.5, 1.5, 1.5, FL); });
    chan(S, 1, BLK); chan(S, -4, BLK);
    // thân đỏ
    S.part((s) => {
      than(s, -5, -20, 10, 12, RED);
      s.in(() => { s.r(-5, -12, 10, 2, Md(JT)); s.r(-5, -12, 10, 1, Lt(JT)); s.r(-1, -13, 3, 4, Md(BLK)); s.p(0, -12, Md(JT)); });
    });
    // kiếm
    kiem(S, 10, -13, 'thuong');
    // đầu, khăn đỏ
    dau(S, 0, -27);
    S.part((s) => { s.r(-7, -32, 14, 2, RED); s.g([[-7, -32], [-11, -34], [-12, -31], [-8, -30]], RED); s.in(() => { s.r(-3, -32, 5, 1, Lt(RED)); }); });
    // tay gần cầm kiếm
    S.part({ ol: RED[0] }, (s) => { s.l(-3, -17, 2, -14, 2, RED); s.l(3, -14, 8, -16, 2, RED); khop(s, -4, -19); khop(s, 2, -15); });
    S.part((s) => { s.e(9.5, -16.5, 1.5, 1.5, FL); });
  }
  function renDanh(S) {
    // vệt kiếm
    S.part({ fx: true }, (s) => {
      const cols = ['#5a6a8a', '#8fa3c4', '#c8d8ee', '#ffffff'];
      for (let y = -50; y <= 0; y++) for (let x = -10; x <= 40; x++) {
        const dx = x - 2, dy = y + 19, d = Math.sqrt(dx * dx + dy * dy); let a = Math.atan2(dy, dx) * 180 / Math.PI;
        const t = (a + 95) / 110; if (t < 0 || t > 1) continue;
        if (Math.abs(d - 24) > 0.4 + 3 * t) continue;
        s.p(x, y, cols[Math.min(3, Math.floor(t * 4))]);
      }
    });
    // tay khuất và búa gỗ vung ra sau
    S.part((s) => { s.l(-12, -22, -17, -27, 2, WD); });
    S.part((s) => { s.g([[-21, -27], [-17, -31], [-14, -28], [-18, -24]], BLK); s.in(() => { s.p(-20, -27, Md(JT)); s.p(-15, -28, Md(JT)); }); });
    S.part((s) => { s.l(-4, -19, -10, -21, 2, RED); });
    S.part((s) => { s.e(-11.5, -21.5, 1.5, 1.5, FL); });
    // chân: một trước một sau, cứng như rối
    S.part((s) => { s.l(-3, -9, -8, -3, 3, BLK); khop(s, -6, -7); });
    S.part((s) => { s.r(-11, -2, 5, 2, WD); });
    S.part((s) => { s.l(3, -9, 6, -3, 3, BLK); khop(s, 4, -7); });
    S.part((s) => { s.r(5, -2, 5, 2, WD); });
    // thân nghiêng tới
    S.part((s) => {
      s.g([[-4, -21], [5, -20], [5, -9], [-5, -9], [-6, -18]], RED);
      s.in(() => { s.r(-5, -12, 11, 2, Md(JT)); s.r(-5, -12, 11, 1, Lt(JT)); s.r(0, -13, 3, 4, Md(BLK)); s.p(1, -12, Md(JT)); s.r(3, -19, 1, 6, Lt(RED)); s.p(3, -18, SH); s.r(-6, -18, 2, 8, Dk(RED)); });
    });
    dau(S, 3, -28);
    S.part((s) => { s.r(-4, -33, 14, 2, RED); s.g([[-4, -33], [-9, -36], [-10, -33], [-5, -31]], RED); s.in(() => { s.r(0, -33, 5, 1, Lt(RED)); }); });
    // kiếm chém ngang tới
    S.part((s) => {
      s.g([[14, -19], [28, -14], [30, -11], [27, -10], [13, -15]], SIL);
      s.in(() => { s.l(14, -16, 27, -11, 1, Dk(SIL)); s.l(15, -19, 28, -14, 1, Lt(SIL)); s.r(18, -17, 3, 1, SH); });
    });
    S.part((s) => { s.l(13, -21, 12, -13, 2, RED); s.p(13, -17, Md(JT)); });
    // tay gần
    S.part((s) => { s.l(0, -18, 5, -17, 2, RED); s.l(5, -17, 9, -17, 2, RED); khop(s, -1, -20); khop(s, 4, -18); });
    S.part((s) => { s.e(10.5, -16.5, 1.5, 1.5, FL); });
    // nước bắn
    S.part({ fx: true }, (s) => { s.p(-13, -5, '#bfeaf0'); s.p(-15, -8, '#8fd0dc'); s.p(12, -5, '#bfeaf0'); s.p(14, -7, '#8fd0dc'); s.p(-10, -9, '#bfeaf0'); s.r(15, -3, 1, 2, '#bfeaf0'); });
  }

  // ================= THỢ SĂN =================
  function san(S) {
    // ống tên
    S.part((s) => { s.g([[-9, -22], [-6, -23], [-3, -12], [-6, -11]], WD); s.r(-11, -26, 2, 3, Md(RED)); s.r(-8, -27, 2, 3, Md(RED)); });
    // dây cung kéo căng và mũi tên
    S.part({ ol: false }, (s) => { s.l(11, -31, 3, -19, 1, '#e8e2d0'); s.l(3, -19, 11, -7, 1, '#e8e2d0'); });
    S.part((s) => { s.r(3, -19, 15, 1, WD); });
    S.part((s) => { s.e(19.5, -18.5, 1.5, 1.5, RED); });
    // tay khuất duỗi thẳng cầm cung
    S.part((s) => { s.l(3, -18, 12, -18, 2, Dk(GRN)); });
    // cánh cung to
    S.part((s) => { s.pl([[11, -32], [14, -27], [15, -19], [14, -11], [11, -6]], 2, YEL); s.in(() => { s.r(15, -21, 2, 5, Md(RED)); }); s.r(10, -33, 2, 2, Md(RED)); s.r(10, -6, 2, 2, Md(RED)); });
    S.part((s) => { s.e(13.5, -18.5, 1.5, 1.5, FL); });
    chan(S, 1, BLK); chan(S, -4, BLK);
    // thân xanh
    S.part((s) => {
      than(s, -5, -20, 10, 12, GRN);
      s.in(() => { s.r(-5, -12, 10, 2, Md(YEL)); s.r(-5, -12, 10, 1, Lt(YEL)); s.l(-4, -19, 2, -13, 1, Md(WD)); s.r(-5, -20, 10, 1, Md(YEL)); });
    });
    dau(S, 0, -27, { toc: false });
    // tóc đen lộ dưới nón
    S.part({ ol: false }, (s) => { s.r(-6, -30, 2, 5, Md(BLK)); s.p(-5, -25, Md(BLK)); });
    // nón lá sơn vàng
    S.part((s) => {
      s.g([[0, -40], [11, -31], [-11, -31]], YEL);
      s.in(() => { s.r(-11, -31, 23, 1, Md(RED)); s.l(2, -38, 7, -33, 1, SH); s.l(-1, -38, -6, -33, 1, Dk(YEL)); });
    });
    // tay gần kéo dây
    S.part({ ol: GRN[0] }, (s) => { s.l(-3, -17, -6, -14, 2, GRN); s.l(-6, -14, 1, -18, 2, GRN); khop(s, -4, -19); khop(s, -7, -15); });
    S.part((s) => { s.e(2.5, -18.5, 1.5, 1.5, FL); });
  }

  // ================= THẦY LANG =================
  function lang(S) {
    // bầu thuốc khổng lồ sơn xanh ngọc
    S.part((s) => { s.r(11, -31, 2, 2, WD); s.p(13, -32, Md(GRN)); s.p(14, -33, Lt(GRN)); });
    S.part((s) => {
      s.e(11.5, -25, 3, 3, JADE); s.e(11.5, -15, 5, 5.5, JADE);
      s.in(() => { s.r(8, -22, 8, 2, Md(RED)); s.r(13, -27, 1, 2, SH); s.r(14, -18, 1, 4, SH); s.p(13, -19, Lt(JADE)); s.e(9, -12, 2, 3, Dk(JADE)); s.r(10, -17, 3, 3, Md(YEL)); s.p(11, -16, Md(RED)); });
    });
    // tay khuất
    S.part((s) => { s.l(3, -17, 8, -19, 2, Dk(YEL)); });
    S.part((s) => { s.e(9.5, -19.5, 1.5, 1.5, FL); });
    // áo dài vàng chấm đất
    S.part((s) => { s.r(-4, -2, 4, 2, BLK); s.r(1, -2, 4, 2, BLK); });
    S.part((s) => {
      s.g([[-4, -20], [4, -20], [7, -3], [-7, -3]], YEL);
      s.in(() => {
        s.r(-7, -5, 15, 2, Md(BLU)); s.r(-7, -5, 15, 1, Lt(BLU));
        s.l(0, -20, 2, -6, 1, Dk(YEL)); s.r(-6, -13, 12, 2, Md(BLK)); s.r(-1, -13, 2, 5, Md(BLK));
        s.l(4, -18, 5, -8, 1, Lt(YEL)); s.p(4, -17, SH); s.l(-5, -18, -6, -6, 2, Dk(YEL));
      });
    });
    dau(S, 0, -27, { toc: false, mayBac: true });
    // khăn xếp đen
    S.part((s) => { s.g([[-7, -32], [-6, -36], [6, -36], [7, -32]], BLK); s.in(() => { s.r(-7, -33, 14, 1, Md(JT)); s.r(-2, -35, 5, 1, Lt(BLK)); }); });
    // mày bạc, râu bạc dài
    S.part({ ol: false }, (s) => { s.r(-1, -31, 3, 1, SH); s.r(4, -31, 3, 1, SH); });
    S.part({ ol: WHT[0] }, (s) => { s.g([[0, -23], [5, -23], [4, -15], [2, -12]], WHT); s.r(-1, -24, 2, 1, Md(WHT)); s.r(5, -24, 2, 1, Md(WHT)); });
    // tay gần đỡ bầu
    S.part({ ol: YEL[0] }, (s) => { s.l(-3, -17, 1, -13, 2, YEL); s.l(2, -13, 6, -12, 2, YEL); khop(s, -4, -19); khop(s, 1, -14); });
    S.part((s) => { s.e(7.5, -11.5, 1.5, 1.5, FL); });
  }

  // ================= ĐÔ VẬT: chú Tễu =================
  function teu(S) {
    // tay gần co lên khoe bắp (phía sau lưng)
    S.part((s) => { s.l(-9, -22, -13, -19, 3, FL); s.l(-13, -19, -13, -25, 3, FL); });
    S.part((s) => { s.e(-13, -29, 3, 3, FL); s.in(() => { s.p(-12, -31, SH); s.r(-15, -28, 2, 1, Dk(FL)); }); });
    S.part((s) => { khop(s, -14, -19); });
    // chân to ngắn
    S.part((s) => { s.r(2, -9, 5, 7, FL); s.in(() => { s.r(2, -9, 1, 7, Dk(FL)); }); khop(s, 3, -6); });
    S.part((s) => { s.r(2, -2, 7, 2, WD); });
    S.part((s) => { s.r(-7, -9, 5, 7, FL); s.in(() => { s.p(-4, -8, SH); }); khop(s, -6, -6); });
    S.part((s) => { s.r(-7, -2, 7, 2, WD); });
    // bụng phệ sơn bóng
    S.part((s) => {
      s.e(0, -17, 9, 8, FL);
      s.in(() => { s.e(-4, -13, 6, 4, Dk(FL)); s.r(4, -22, 2, 4, SH); s.p(5, -17, SH); s.p(3, -13, Dk(FL)); s.p(-1, -21, Dk(FL)); s.p(6, -21, Dk(FL)); });
    });
    // khố đỏ
    S.part((s) => { s.g([[-9, -12], [9, -12], [8, -8], [-8, -8]], RED); s.r(1, -8, 5, 5, RED); s.in(() => { s.r(-9, -12, 19, 1, Lt(RED)); s.r(1, -4, 5, 1, Md(JT)); s.p(3, -10, SH); }); });
    // tay khuất vươn nắm đấm gỗ tròn
    S.part((s) => { s.l(8, -22, 13, -19, 3, Dk(FL)); });
    S.part((s) => { s.e(16, -18, 3.5, 3.5, FL); s.in(() => { s.r(17, -20, 2, 1, SH); s.r(14, -16, 4, 1, Dk(FL)); s.p(18, -18, Dk(FL)); s.p(18, -16, Dk(FL)); }); });
    // búi tóc
    S.part((s) => { s.e(1, -42, 2.5, 2, BLK); s.p(2, -43, Lt(BLK)); });
    S.part((s) => { s.r(-1, -40, 4, 1, RED); });
    // đầu to
    S.part((s) => {
      s.e(1, -31, 7.5, 7.5, FL);
      s.in(() => {
        s.e(-1, -25, 6, 2, Dk(FL));
        s.r(-7, -39, 16, 2, Md(BLK)); s.r(-7, -37, 3, 5, Md(BLK)); s.r(0, -38, 3, 1, Lt(BLK));
        // mặt cười toe
        s.r(2, -34, 1, 2, INK); s.r(6, -34, 1, 2, INK);
        s.p(1, -36, INK); s.p(2, -37, INK); s.p(3, -36, INK); s.p(5, -36, INK); s.p(6, -37, INK); s.p(7, -36, INK);
        s.r(-1, -31, 2, 2, CHEEK); s.r(7, -31, 2, 2, CHEEK);
        s.r(2, -30, 5, 1, LIP); s.r(3, -29, 3, 1, SH); s.r(3, -28, 3, 1, LIP); s.p(1, -31, LIP); s.p(7, -31, LIP);
        s.p(7, -36, SH); s.p(8, -35, SH);
      });
    });
    S.part((s) => { khop(s, -10, -23); khop(s, 8, -23); });
  }

  HUONGS.push({
    id: 2, base: 'nuoc',
    title: 'Hướng 2: Rối nước',
    intro: 'Bốn nhân vật là bốn con rối nước bằng gỗ sơn bóng, khớp tròn, mặt cười, đứng trên gợn nước.',
    heroes: [
      { name: 'Thợ Rèn', desc: 'Rối áo đỏ, khăn đỏ, tay kiếm gỗ to, tay búa gỗ.', draw: ren, bw: 8, dx: 0, col: '#ffb070' },
      { name: 'Thợ Săn', desc: 'Rối áo xanh, nón lá sơn vàng, kéo cây cung đồ chơi.', draw: san, bw: 8, dx: 3, col: '#a8e08a' },
      { name: 'Thầy Lang', desc: 'Rối ông lang áo vàng, râu bạc, ôm bầu thuốc xanh ngọc.', draw: lang, bw: 9, dx: 4, col: '#9db8ff' },
      { name: 'Đô Vật', desc: 'Chú Tễu búi tóc, bụng phệ, khố đỏ, hai nắm đấm gỗ tròn.', draw: teu, bw: 10, dx: 1, col: '#ff8f7a' },
    ],
    attack: { draw: renDanh, desc: 'Chém kiếm tới, nước bắn tung', bw: 10, dx: 5 },
    weapons: [
      { label: 'Thường', col: '#e6dfd0', draw: (S) => kiem(S, 0, 0, 'thuong') },
      { label: 'Lửa', col: '#ff9a4a', draw: (S) => kiem(S, 0, 0, 'lua') },
      { label: 'Độc', col: '#a6e05a', draw: (S) => kiem(S, 0, 0, 'doc') },
      { label: 'Băng', col: '#9fdcff', draw: (S) => kiem(S, 0, 0, 'bang') },
    ],
  });
})();
