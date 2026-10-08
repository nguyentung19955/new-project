// Hướng 1: Linh thú. Bốn hero là bốn con vật đứng thẳng, màu bẹt và viền đậm theo tinh thần tranh Đông Hồ.
'use strict';
(function () {
  // ----- bảng màu (tối, vừa, sáng) -----
  const HIDE = ['#3a4056', '#5c6680', '#8893ad'];   // da trâu
  const HIDEF = ['#2c3144', '#434b62', '#5c6680'];  // da trâu phía khuất
  const MUZ = ['#a58a8c', '#cfb8b2', '#eadcd4'];    // mõm
  const HORN = ['#9a8560', '#dccba2', '#f6ecce'];
  const HOOF = ['#221d27', '#3b3442', '#5d5566'];
  const LEATH = ['#7a4a22', '#aa6c34', '#d39654'];
  const WOODR = ['#5a3822', '#8a5a34', '#b78350'];
  const IRON = ['#4f5567', '#8a92a6', '#cdd3de'];
  const GOLD = ['#9c7426', '#e2b64e', '#ffe9a0'];
  const FEA = ['#aebbd0', '#edf1f6', '#ffffff'];    // lông cò
  const WING = ['#7f8eab', '#b9c5d9', '#e2e8f1'];
  const LEG = ['#b3661a', '#e8992f', '#ffc968'];
  const BEAK = ['#c9861c', '#f2bd3a', '#ffe690'];
  const STRAW = ['#a5813a', '#dfc070', '#f8ebb2'];
  const GREEN = ['#2c5a2a', '#4d9140', '#8ccb68'];
  const RED = ['#8c1c1f', '#d2362e', '#f47a62'];
  const SHELL = ['#96621a', '#dba338', '#f8dc7c'];  // mai rùa vàng
  const SKIN = ['#547338', '#84a855', '#b6d285'];   // da rùa
  const PLAS = ['#bd9d58', '#ecd8a0', '#fcf2d2'];   // yếm rùa
  const BLUE = ['#25376f', '#3f5cb0', '#7494e0'];
  const GOURD = ['#9c5e28', '#d9984c', '#f5cc8e'];
  const BASK = ['#75552a', '#ae8848', '#d9ba7a'];
  const TIG = ['#b25318', '#ec8a2a', '#fdbb58'];    // lông hổ
  const TIGF = ['#8a3f12', '#bd681c', '#ec8a2a'];
  const WHT = ['#c9bca8', '#f6efe0', '#ffffff'];
  const STRIPE = '#2a1a1c';

  // ================= THỢ RÈN: chú trâu =================
  function trauDau(S, x, y) { // đầu trâu, (x,y) là tâm đầu
    // sừng và tai phía khuất
    S.part((s) => { s.pl([[x - 3, y - 6], [x - 8, y - 9], [x - 9, y - 13], [x - 7, y - 16]], 2, HORN); s.r(x - 5, y - 8, 3, 3, HORN); s.p(x - 6, y - 17, Lt(HORN)); s.r(x - 4, y - 7, 2, 2, Dk(HORN)); });
    // đầu
    S.part((s) => {
      s.e(x + 0.5, y, 7.5, 6.5, HIDE);
      s.in(() => { s.e(x - 3, y + 4, 5, 3, Dk(HIDE)); });
      // chỏm lông giữa hai sừng
      s.r(x - 2, y - 7, 5, 2, Md(HOOF)); s.p(x + 3, y - 6, Md(HOOF));
    });
    // tai phía gần
    S.part({ ol: HIDE[0] }, (s) => { s.g([[x - 2, y - 3], [x - 7, y - 4], [x - 9, y - 2], [x - 4, y]], HIDE); s.p(x - 6, y - 2, Md(MUZ)); s.p(x - 5, y - 2, Md(MUZ)); });
    // mõm
    S.part({ ol: HIDE[0] }, (s) => {
      s.e(x + 7, y + 3, 4, 3.5, MUZ);
      s.p(x + 9, y + 2, INK); s.p(x + 9, y + 3, INK); // lỗ mũi
      s.p(x + 6, y + 5, Dk(MUZ)); s.p(x + 7, y + 5, Dk(MUZ)); s.p(x + 8, y + 5, Dk(MUZ)); // miệng
    });
    // khuyên mũi vàng
    S.part({ ol: false }, (s) => { s.p(x + 10, y + 5, Md(GOLD)); s.p(x + 11, y + 6, Md(GOLD)); s.p(x + 10, y + 7, Lt(GOLD)); s.p(x + 9, y + 6, Dk(GOLD)); });
    // mắt và mày
    S.part({ ol: false, bevel: false }, (s) => {
      s.r(x + 1, y - 2, 3, 2, '#ffffff'); s.r(x + 3, y - 2, 1, 2, INK);
      s.r(x, y - 4, 2, 1, INK); s.r(x + 2, y - 3, 3, 1, INK); // mày cau
    });
    // sừng phía gần
    S.part((s) => { s.pl([[x + 4, y - 7], [x + 8, y - 10], [x + 10, y - 14], [x + 8, y - 17]], 2, HORN); s.r(x + 5, y - 9, 3, 3, HORN); s.p(x + 8, y - 18, Lt(HORN)); s.r(x + 3, y - 8, 2, 2, Dk(HORN)); s.p(x + 5, y - 9, Dk(HORN)); });
  }
  // búa rèn thường: đầu búa tâm (x,y), nằm ngang
  function buaDau(S, x, y, IR) {
    IR = IR || IRON;
    S.r(x - 5, y - 4, 11, 9, IR);
    S.r(x - 5, y - 4, 2, 9, Dk(IR)); S.r(x + 4, y - 4, 2, 9, Dk(IR));
    S.r(x - 3, y - 4, 7, 1, Lt(IR)); S.r(x - 3, y - 2, 7, 1, Lt(IR));
    S.r(x - 3, y + 3, 7, 2, Dk(IR));
    S.p(x - 5, y - 4, Md(IR)); S.p(x + 5, y - 4, Md(IR));
    S.p(x - 2, y + 1, Dk(IR)); S.p(x + 2, y + 1, Dk(IR)); // đinh tán
  }
  function trau(S) {
    // đuôi
    S.part((s) => { s.pl([[-9, -14], [-12, -12], [-13, -8]], 1, HIDE); s.r(-14, -7, 2, 3, Md(HOOF)); });
    // chân khuất
    S.part((s) => { s.r(2, -10, 5, 8, HIDEF); s.r(2, -3, 6, 3, Md(HOOF)); s.r(3, -3, 5, 1, Lt(HOOF)); });
    // thân
    S.part((s) => {
      s.e(-1, -18, 9, 8.5, HIDE);
      s.in(() => {
        s.e(-5, -13, 6, 4, Dk(HIDE));
        // xoáy lông kiểu tranh Đông Hồ
        s.b(['.lll.', 'l...l', 'l.l.l', 'l..ll', '.l...'], -10, -22, { l: Lt(HIDE) });
      });
    });
    // chân gần
    S.part((s) => { s.r(-6, -10, 5, 8, HIDE); s.r(-6, -3, 6, 3, Md(HOOF)); s.r(-5, -3, 5, 1, Lt(HOOF)); s.p(-3, -1, Dk(HOOF)); });
    // tạp dề da
    S.part((s) => {
      s.g([[-3, -25], [6, -25], [8, -9], [-4, -9]], LEATH);
      s.in(() => {
        s.r(-4, -17, 13, 1, Dk(LEATH));               // dây thắt
        s.r(1, -14, 4, 4, Dk(LEATH)); s.r(1, -14, 4, 1, Lt(LEATH)); // túi
        s.r(-4, -9, 13, 1, Lt(LEATH));
        s.p(6, -22, Lt(LEATH)); s.p(6, -20, Lt(LEATH));
      });
    });
    // búa tì dưới đất
    S.part((s) => { s.r(18, -25, 2, 16, WOODR); s.r(18, -25, 2, 1, Md(GOLD)); s.p(18, -13, Dk(WOODR)); s.p(19, -13, Dk(WOODR)); });
    S.part((s) => { buaDau(s, 19, -5); });
    trauDau(S, 4, -31);
    // tay gần đặt lên cán búa
    S.part((s) => {
      s.e(0, -23, 3, 3, HIDE);
      s.l(1, -21, 7, -16, 4, HIDE); s.l(8, -16, 16, -18, 3, HIDE);
      s.r(9, -18, 2, 4, Md(LEATH)); // vòng da cổ tay
    });
    S.part((s) => { s.r(16, -22, 5, 5, HIDE); s.r(18, -21, 3, 1, Md(HOOF)); s.r(18, -19, 3, 1, Md(HOOF)); });
  }

  // tư thế đánh: trâu vung búa bổ xuống
  function vet(S, cx, cy, r, w, a0, a1, cols) { // vệt vung hình lưỡi liềm, mảnh dần về đuôi
    S.part({ fx: true }, (s) => {
      for (let y = cy - r - w; y <= cy + r + w; y++) for (let x = cx - r - w; x <= cx + r + w; x++) {
        const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
        let a = Math.atan2(dy, dx) * 180 / Math.PI; if (a < a0 - 1) a += 360;
        const t = (a - a0) / (a1 - a0); if (t < 0 || t > 1) continue;
        const hw = w * t * 0.5 + 0.3;
        if (Math.abs(d - r) > hw) continue;
        s.p(x, y, cols[Math.min(cols.length - 1, Math.floor(t * cols.length))]);
      }
    });
  }
  function trauDanh(S) {
    vet(S, 4, -19, 25, 6, -80, 22, ['#7a2f24', '#b9482a', '#ee7f34', '#ffc35a', '#ffe9a8']);
    // đuôi vểnh
    S.part((s) => { s.pl([[-8, -14], [-13, -15], [-16, -19]], 1, HIDE); s.r(-17, -22, 2, 3, Md(HOOF)); });
    // chân sau duỗi
    S.part((s) => { s.l(-4, -10, -10, -4, 5, HIDE); s.r(-14, -3, 6, 3, Md(HOOF)); s.r(-14, -3, 5, 1, Lt(HOOF)); });
    // chân trước khuỵu (phía khuất)
    S.part((s) => { s.l(4, -10, 9, -7, 5, HIDEF); s.r(8, -7, 4, 5, HIDEF); s.r(8, -3, 6, 3, Md(HOOF)); s.r(9, -3, 5, 1, Lt(HOOF)); });
    // thân chúi tới
    S.part((s) => {
      s.e(1, -18, 9, 8, HIDE);
      s.in(() => { s.e(-4, -13, 6, 4, Dk(HIDE)); s.b(['.lll.', 'l...l', 'l.l.l', 'l..ll', '.l...'], -8, -22, { l: Lt(HIDE) }); });
    });
    // tạp dề bay
    S.part((s) => {
      s.g([[0, -25], [9, -24], [8, -11], [1, -8], [-3, -10]], LEATH);
      s.in(() => { s.l(-2, -17, 9, -16, 1, Dk(LEATH)); s.r(3, -14, 4, 3, Dk(LEATH)); s.r(3, -14, 4, 1, Lt(LEATH)); s.l(-3, -10, 1, -8, 1, Lt(LEATH)); });
    });
    // tay khuất
    S.part((s) => { s.l(7, -21, 16, -17, 3, HIDEF); });
    // cán búa và đầu búa đang bổ xuống
    S.part((s) => { s.l(13, -19, 25, -9, 2, WOODR); s.p(12, -20, Md(GOLD)); });
    S.part((s) => {
      s.g([[20, -6], [26, -15], [32, -10], [26, -1]], IRON);
      s.in(() => { s.l(20, -6, 26, -15, 2, Dk(IRON)); s.l(27, -2, 32, -10, 2, Dk(IRON)); s.l(23, -9, 28, -5, 1, Lt(IRON)); s.l(25, -12, 30, -8, 1, Lt(IRON)); });
    });
    S.part((s) => { s.r(18, -17, 4, 4, HIDEF); });
    trauDau(S, 8, -30);
    // tay gần
    S.part((s) => { s.e(2, -24, 3, 3, HIDE); s.l(3, -22, 8, -18, 4, HIDE); s.l(8, -18, 13, -17, 3, HIDE); s.r(9, -19, 2, 4, Md(LEATH)); });
    S.part((s) => { s.r(13, -20, 4, 5, HIDE); s.r(15, -19, 2, 1, Md(HOOF)); s.r(15, -17, 2, 1, Md(HOOF)); });
    // tia lửa
    S.part({ fx: true }, (s) => { s.p(35, -8, '#ffd27a'); s.p(37, -13, '#ffb347'); s.p(34, -2, '#fff3c4'); s.p(36, -19, '#ffb347'); s.p(33, -16, '#fff3c4'); });
  }

  // ================= THỢ SĂN: cò trắng =================
  function co(S) {
    // ống tên sau lưng
    S.part((s) => {
      s.g([[-10, -28], [-7, -29], [-3, -18], [-6, -17]], LEATH);
      s.r(-12, -32, 2, 3, Md(RED)); s.r(-9, -33, 2, 3, Md(RED)); s.p(-11, -29, Md(WOODR)); s.p(-8, -30, Md(WOODR));
    });
    // dây cung
    S.part({ ol: false }, (s) => { s.l(13, -27, 13, -8, 1, '#d8d2c2'); });
    // chân khuất
    S.part((s) => { s.pl([[2, -13], [3, -7], [2, -1]], 1, Dk(LEG)); s.r(2, -1, 4, 1, Dk(LEG)); });
    // đuôi
    S.part((s) => { s.g([[-5, -20], [-12, -14], [-10, -12], [-4, -15]], FEA); s.p(-12, -13, INK); s.p(-11, -12, INK); s.p(-10, -12, INK); });
    // thân
    S.part((s) => { s.e(-2, -18.5, 5.5, 4.5, FEA); s.e(1, -21, 3, 3, FEA); s.in(() => { s.e(-3, -15, 4, 2, Dk(FEA)); s.l(-6, -19, -2, -17, 1, Dk(FEA)); }); });
    // chân gần
    S.part((s) => { s.pl([[-2, -13], [-1, -7], [-2, -1]], 1, LEG); s.r(-2, -1, 5, 1, Md(LEG)); s.p(-3, -1, Dk(LEG)); s.p(-1, -7, Lt(LEG)); });
    // cổ và đầu
    S.part((s) => { s.pl([[3, -24], [3, -28], [4, -31]], 2, FEA); s.e(5, -33.5, 3, 2.5, FEA); s.in(() => { s.r(2, -29, 1, 5, Dk(FEA)); s.p(5, -34, INK); }); });
    // mỏ dài
    S.part((s) => { s.g([[8, -35], [18, -32], [8, -31]], BEAK); s.in(() => { s.l(8, -31, 14, -31, 1, Dk(BEAK)); }); });
    // khăn xanh quấn cổ, đuôi khăn bay ra sau
    S.part((s) => { s.r(0, -26, 5, 2, GREEN); s.g([[0, -26], [-6, -29], [-8, -26], [-1, -24]], GREEN); s.p(-7, -27, Dk(GREEN)); });
    // nón lá
    S.part((s) => {
      s.g([[5, -45], [16, -37], [-6, -37]], STRAW);
      s.in(() => { s.r(-6, -37, 23, 1, Dk(STRAW)); s.l(4, -43, 0, -38, 1, Dk(STRAW)); s.l(7, -42, 12, -38, 1, Lt(STRAW)); });
    });
    // cánh cung
    S.part((s) => { s.pl([[13, -28], [16, -24], [17, -18], [16, -12], [13, -7]], 1, WOODR); s.p(13, -28, Md(GOLD)); s.p(13, -7, Md(GOLD)); s.r(16, -19, 2, 3, Md(RED)); });
    // cánh gần như cánh tay: khuỷu gập, lông cánh rủ, đầu cánh nắm cung
    S.part((s) => {
      s.g([[4, -16], [11, -17], [9, -15], [6, -13], [4, -13]], WING);
      s.in(() => { s.p(9, -15, Dk(WING)); s.p(6, -13, Dk(WING)); s.p(4, -13, Dk(WING)); });
    });
    S.part((s) => { s.l(1, -21, 4, -17, 2, FEA); s.l(4, -17, 12, -19, 2, FEA); s.r(13, -20, 2, 3, Md(WING)); s.p(14, -20, INK); s.p(14, -18, INK); });
  }

  // ================= THẦY LANG: cụ rùa vàng =================
  function rua(S) {
    // gùi thuốc sau lưng
    S.part((s) => {
      s.r(-13, -30, 8, 9, BASK);
      s.in(() => { for (let j = 0; j < 9; j += 2) for (let i = (j / 2) % 2; i < 8; i += 2) s.p(-13 + i, -29 + j, Dk(BASK)); s.r(-13, -30, 8, 1, Lt(BASK)); });
    });
    S.part({ ol: GREEN[0] }, (s) => { s.e(-10, -33, 3, 2, GREEN); s.p(-7, -35, Md(GREEN)); s.p(-12, -36, Md(GREEN)); s.p(-9, -35, Lt(GREEN)); s.p(-11, -33, Md(RED)); });
    // chân khuất
    S.part((s) => { s.r(2, -6, 4, 5, Dk(SKIN)); s.r(2, -2, 6, 2, Dk(SKIN)); });
    // gậy
    S.part((s) => { s.r(16, -36, 2, 36, WOODR); s.pl([[16, -36], [17, -39], [20, -40], [22, -38]], 1, WOODR); s.p(16, -20, Dk(WOODR)); s.p(17, -9, Dk(WOODR)); });
    // bầu hồ lô treo đầu gậy
    S.part({ ol: false }, (s) => { s.p(22, -37, Md(RED)); });
    S.part((s) => { s.e(22, -34.5, 1.5, 1.5, GOURD); s.e(22, -30, 3, 3, GOURD); s.in(() => { s.p(23, -32, Lt(GOURD)); s.p(21, -28, Dk(GOURD)); }); s.r(21, -33, 3, 1, Md(RED)); });
    // mai
    S.part((s) => {
      s.e(-4, -15, 9, 10, SHELL);
      s.in(() => {
        const d = Dk(SHELL);
        s.pl([[-6, -20], [-2, -20], [1, -15], [-2, -10], [-6, -10], [-9, -15], [-6, -20]], 1, d);
        s.l(-9, -15, -13, -15, 1, d); s.l(1, -15, 5, -15, 1, d);
        s.l(-6, -20, -8, -24, 1, d); s.l(-2, -20, 0, -24, 1, d); s.l(-6, -10, -8, -6, 1, d); s.l(-2, -10, 0, -6, 1, d);
        s.r(-5, -18, 3, 1, Lt(SHELL)); s.p(-6, -17, Lt(SHELL));
      });
    });
    // yếm bụng
    S.part((s) => { s.g([[1, -24], [6, -22], [8, -13], [6, -6], [1, -5]], PLAS); s.in(() => { s.r(1, -18, 8, 1, Dk(PLAS)); s.r(1, -12, 8, 1, Dk(PLAS)); }); });
    // chân gần
    S.part((s) => { s.r(-5, -6, 5, 5, SKIN); s.r(-5, -2, 7, 2, SKIN); s.p(1, -1, Lt(PLAS)); s.p(-1, -1, Lt(PLAS)); s.p(-3, -1, Lt(PLAS)); });
    // cổ và đầu
    S.part((s) => { s.l(5, -23, 8, -26, 4, SKIN); s.e(9.5, -29.5, 4.5, 4.5, SKIN); s.in(() => { s.p(14, -28, Dk(SKIN)); s.p(13, -27, Dk(SKIN)); }); });
    // khăn xếp xanh
    S.part((s) => { s.g([[5, -33], [5, -36], [8, -38], [12, -38], [14, -36], [14, -33]], BLUE); s.in(() => { s.r(5, -34, 10, 1, Dk(BLUE)); s.r(8, -37, 4, 1, Lt(BLUE)); s.r(5, -33, 10, 1, Lt(BLUE)); }); });
    // mắt cười, mày bạc
    S.part({ ol: false, bevel: false }, (s) => { s.p(10, -29, INK); s.p(11, -30, INK); s.p(12, -29, INK); s.r(9, -32, 5, 1, '#ffffff'); s.p(9, -31, '#ffffff'); });
    // tay gần chống gậy
    S.part((s) => { s.l(3, -20, 9, -17, 3, SKIN); s.l(9, -17, 15, -19, 3, SKIN); s.r(15, -21, 4, 4, SKIN); s.r(17, -20, 2, 1, Dk(SKIN)); });
    // râu bạc dài
    S.part({ ol: FEA[0] }, (s) => { s.g([[9, -27], [14, -27], [13, -20], [11, -17]], FEA); s.p(14, -27, Lt(FEA)); s.p(15, -27, Lt(FEA)); });
  }

  // ================= ĐÔ VẬT: ông hổ =================
  function ho(S) {
    // đuôi vằn
    S.part((s) => {
      s.pl([[-11, -9], [-16, -8], [-19, -12], [-20, -18], [-18, -23]], 2, TIG);
      s.in(() => { s.r(-16, -9, 1, 2, STRIPE); s.r(-20, -14, 2, 1, STRIPE); s.r(-21, -19, 2, 1, STRIPE); s.r(-19, -24, 2, 2, STRIPE); });
    });
    // tay khuất vươn trước
    S.part((s) => { s.l(6, -25, 14, -25, 5, TIGF); s.in(() => { s.r(10, -27, 1, 3, STRIPE); }); });
    S.part((s) => { s.e(17, -26, 3, 3, TIGF); s.p(19, -28, Md(WHT)); s.p(20, -26, Md(WHT)); s.p(19, -24, Md(WHT)); });
    // chân khuất
    S.part((s) => { s.r(3, -10, 6, 8, TIGF); s.r(3, -3, 8, 3, TIGF); s.r(9, -2, 2, 2, Md(WHT)); });
    // thân
    S.part((s) => {
      s.e(-1, -21, 11, 10, TIG);
      s.in(() => {
        s.e(5, -19, 5, 8, Md(WHT)); s.e(4, -14, 5, 3, Dk(WHT));
        s.l(-12, -25, -8, -24, 1, STRIPE); s.l(-12, -21, -7, -20, 1, STRIPE); s.l(-12, -17, -8, -16, 1, STRIPE);
        s.l(-7, -29, -5, -26, 1, STRIPE);
      });
    });
    // chân gần
    S.part((s) => { s.r(-9, -10, 7, 8, TIG); s.r(-9, -3, 9, 3, TIG); s.in(() => { s.r(-9, -7, 3, 1, STRIPE); s.r(-9, -5, 2, 1, STRIPE); }); s.r(-2, -2, 2, 2, Md(WHT)); s.p(-4, -1, Dk(TIG)); });
    // khăn đỏ đô vật quấn hông, vạt thả trước
    S.part((s) => {
      s.g([[-12, -15], [10, -15], [9, -11], [-11, -11]], RED);
      s.r(2, -11, 6, 6, RED);
      s.in(() => { s.r(2, -6, 6, 1, Md(GOLD)); s.r(-12, -15, 23, 1, Lt(RED)); s.r(2, -11, 1, 5, Dk(RED)); });
    });
    S.part((s) => { s.r(-4, -16, 3, 3, RED); s.r(-6, -13, 2, 5, RED); s.r(-3, -13, 2, 4, RED); });
    // tai
    S.part((s) => { s.e(-1, -42, 2, 2, TIG); s.p(-1, -42, Md(MUZ)); s.p(-2, -43, STRIPE); });
    S.part((s) => { s.e(10, -43, 2, 2, TIG); s.p(10, -43, Md(MUZ)); });
    // đầu (đặt tay từng điểm)
    S.part({ bevel: false }, (s) => {
      s.b([
        '......LLLLL......',
        '....LOOOOOKKKL...',
        '...LOOOOOOOKOOL..',
        '.LOOOIOOOOKKKOOI.',
        'LOOOOOIIIOOOOIIOO',
        'KKKOOOOWWIOOOWIOO',
        'DOOOOOOWWIOOOWIOO',
        'KKKOOOOOOOOOOOOOO',
        'DOOOOOOOOWPPPWOOO',
        'KKOOOOOOWWWPWWWOO',
        '.DOWWOOWWWWIWWWWO',
        '.DWWWWOWIIIIIIIW.',
        '..DWWWWOWFRRRFWD.',
        '...DDwwOOwIIIwD..',
        '.....DDDDDDDD....',
      ], -4, -43, { O: TIG[1], D: TIG[0], L: TIG[2], K: STRIPE, W: WHT[1], w: WHT[0], Y: '#ffe36a', I: INK, P: '#d9706a', F: '#ffffff', R: '#8c1c1f' });
    });
    // tay gần co trước ngực
    S.part((s) => {
      s.e(-4, -27, 4, 4, TIG);
      s.l(-3, -25, 1, -19, 5, TIG); s.l(1, -19, 8, -19, 5, TIG);
      s.in(() => { s.r(-7, -26, 3, 1, STRIPE); s.r(-5, -23, 3, 1, STRIPE); s.r(3, -21, 1, 3, STRIPE); s.r(6, -21, 1, 3, STRIPE); });
    });
    S.part((s) => { s.e(11, -19, 3.5, 3.5, TIG); s.p(14, -21, Md(WHT)); s.p(15, -19, Md(WHT)); s.p(14, -17, Md(WHT)); s.p(12, -22, Md(WHT)); });
  }

  // ================= vũ khí Thợ Rèn tiến hoá: búa rèn =================
  function can(S, W) { S.part((s) => { s.r(-1, -20, 2, 20, W); s.r(-1, -12, 2, 1, Dk(W)); s.r(-1, -5, 2, 2, Md(LEATH)); s.r(-1, -1, 2, 1, Dk(W)); }); }
  function buaThuong(S) { can(S, WOODR); S.part((s) => { buaDau(s, 0, -24); }); }
  function buaLua(S) {
    const F = ['#a32418', '#f2622a', '#ffc64c'];
    can(S, ['#3a2320', '#5e3a2a', '#8a5a34']);
    S.part({ ol: false }, (s) => { s.p(-1, -15, '#ff8a3a'); s.p(0, -10, '#ff8a3a'); s.p(0, -16, '#ffd27a'); });
    // lửa bốc trên đầu búa
    S.part({ ol: '#7a1810' }, (s) => {
      s.g([[-5, -30], [-6, -35], [-3, -33], [-2, -39], [1, -34], [3, -37], [4, -33], [6, -35], [5, -30]], Md(F));
      s.in(() => { s.g([[-3, -30], [-2, -35], [0, -32], [2, -34], [3, -30]], Lt(F)); s.p(-1, -31, '#fff6c8'); s.p(0, -31, '#fff6c8'); });
    });
    S.part({ ol: '#4a1414' }, (s) => {
      s.r(-5, -29, 11, 10, F);
      s.r(-5, -29, 2, 10, Dk(F)); s.r(4, -29, 2, 10, Dk(F));
      s.r(-3, -27, 7, 5, Lt(F)); s.r(-2, -26, 5, 3, '#fff6c8');
      s.r(-3, -21, 7, 2, Md(F));
      // hai mấu sừng trâu bằng sắt
      s.p(-6, -30, Md(IRON)); s.p(-7, -31, Md(IRON)); s.p(6, -30, Md(IRON)); s.p(7, -31, Md(IRON));
    });
    S.part({ fx: true }, (s) => { s.p(-8, -37, '#ffb347'); s.p(8, -39, '#ffd27a'); s.p(9, -27, '#ff8a3a'); s.p(-9, -24, '#ffd27a'); s.p(1, -42, '#ffb347'); });
  }
  function buaDoc(S) {
    const P = ['#2a5526', '#5aa23a', '#b9e66c'], V = ['#3d1d55', '#6b3a8f', '#a56fd0'];
    can(S, ['#3c3a22', '#62603a', '#8f8c55']);
    // dây leo quấn cán
    S.part({ ol: false }, (s) => { s.p(-1, -17, Md(P)); s.p(0, -15, Md(P)); s.p(-1, -13, Md(P)); s.p(0, -9, Md(P)); s.p(-1, -7, Md(P)); s.p(1, -11, Lt(P)); s.p(2, -12, Md(P)); });
    S.part((s) => {
      s.r(-5, -29, 11, 10, P);
      s.r(-5, -29, 2, 10, Md(V)); s.r(4, -29, 2, 10, Md(V)); s.r(-5, -29, 2, 1, Lt(V)); s.r(4, -29, 2, 1, Lt(V));
      s.r(-3, -27, 7, 1, Lt(P)); s.r(-3, -22, 7, 3, Dk(P));
      s.p(-2, -25, Dk(P)); s.p(1, -24, Dk(P)); s.p(2, -26, Dk(P)); // rỗ
      // gai độc
      s.p(-6, -27, Lt(V)); s.p(-7, -27, Md(V)); s.p(-6, -23, Lt(V)); s.p(-7, -23, Md(V));
      s.p(6, -27, Lt(V)); s.p(7, -27, Md(V)); s.p(6, -23, Lt(V)); s.p(7, -23, Md(V));
      s.p(-2, -30, Md(V)); s.p(2, -30, Md(V));
    });
    // nước độc nhỏ giọt
    S.part({ ol: P[0] }, (s) => { s.r(3, -19, 2, 3, Lt(P)); s.p(3, -16, Lt(P)); });
    S.part({ ol: false }, (s) => { s.p(3, -12, Lt(P)); s.p(-4, -19, Lt(P)); s.p(-4, -18, Md(P)); });
    S.part({ fx: true }, (s) => { s.p(-8, -33, '#b9e66c'); s.r(6, -35, 2, 2, 'rgba(185,230,108,0.7)'); s.p(9, -31, '#a56fd0'); s.p(-3, -34, 'rgba(185,230,108,0.7)'); });
  }
  function buaBang(S) {
    const I = ['#3c6cb0', '#8fccf2', '#eafcff'];
    can(S, ['#51617f', '#8a9cbc', '#c6d6ec']);
    S.part({ ol: false }, (s) => { s.p(-1, -16, '#ffffff'); s.p(0, -9, '#ffffff'); s.p(0, -14, Lt(I)); });
    S.part({ ol: '#243f73' }, (s) => {
      s.r(-5, -29, 11, 10, I);
      // mũi băng nhọn mọc trên đầu búa
      s.g([[-5, -29], [-4, -34], [-2, -29]], I); s.g([[-1, -29], [1, -37], [3, -29]], I); s.g([[3, -29], [5, -33], [5, -29]], I);
      s.in(() => {
        s.r(-5, -29, 2, 10, Dk(I)); s.r(4, -29, 2, 10, Dk(I));
        s.l(-3, -21, 3, -27, 1, Lt(I)); s.l(-1, -21, 4, -26, 1, Lt(I)); s.r(-3, -28, 3, 1, '#ffffff');
        s.l(1, -36, 1, -31, 1, '#ffffff'); s.p(-4, -32, '#ffffff');
        s.r(-3, -21, 7, 1, Dk(I));
      });
      // nhũ băng rủ dưới
      s.r(-5, -19, 1, 3, Md(I)); s.r(-3, -19, 1, 2, Lt(I)); s.r(4, -19, 1, 4, Md(I)); s.r(2, -19, 1, 2, Lt(I));
    });
    S.part({ fx: true }, (s) => {
      const sp = (x, y) => { s.p(x, y, '#ffffff'); s.p(x - 1, y, '#bfe9ff'); s.p(x + 1, y, '#bfe9ff'); s.p(x, y - 1, '#bfe9ff'); s.p(x, y + 1, '#bfe9ff'); };
      sp(-9, -33); sp(9, -24); s.p(8, -36, '#eafcff'); s.p(-8, -22, '#eafcff');
    });
  }

  HUONGS.push({
    id: 1,
    title: 'Hướng 1: Linh thú',
    intro: 'Bốn nhân vật là bốn con vật bước ra từ tranh Đông Hồ, đứng thẳng như người.',
    heroes: [
      { name: 'Thợ Rèn', desc: 'Chú trâu chắc nịch, mặc tạp dề da, tay tì cây búa rèn.', draw: trau, bw: 11, dx: 4, bx: 2, col: '#ffb070' },
      { name: 'Thợ Săn', desc: 'Cò trắng chân dài, đội nón lá, cầm cung, nhanh mà mỏng.', draw: co, bw: 7, dx: 2, col: '#a8e08a' },
      { name: 'Thầy Lang', desc: 'Cụ rùa vàng râu bạc, lưng đeo gùi thuốc, gậy treo bầu hồ lô.', draw: rua, bw: 11, dx: 3, col: '#9db8ff' },
      { name: 'Đô Vật', desc: 'Ông hổ to bè, quấn khăn đỏ đô vật, đánh bằng tay không.', draw: ho, bw: 14, dx: -2, col: '#ff8f7a' },
    ],
    attack: { draw: trauDanh, desc: 'Chú trâu vung búa bổ xuống', bw: 13, dx: 8 },
    weapons: [
      { label: 'Thường', col: '#e6dfd0', draw: buaThuong },
      { label: 'Lửa', col: '#ff9a4a', draw: buaLua },
      { label: 'Độc', col: '#a6e05a', draw: buaDoc },
      { label: 'Băng', col: '#9fdcff', draw: buaBang },
    ],
  });
})();
