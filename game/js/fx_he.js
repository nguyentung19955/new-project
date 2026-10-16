// Hiệu ứng ra chiêu theo lối đánh của từng vũ khí và theo hệ (Lửa, Độc, Băng).
// Chia theo cấp: Mầm chỉ có vệt chém nhuốm màu hệ; Thành hình thêm hình của đặc trưng 1 (vệt cháy, vũng độc, gai băng);
// Thức tỉnh thêm hình của đặc trưng 2 (nổ lan, lây độc, băng vỡ). Luật nằm trong js/moves.js, ở đây chỉ vẽ khi luật gọi.
// Chỉ là hình ảnh: đọc trạng thái game, không ghi trường nào của luật chơi. Dùng chung kho hạt của fx.js.
(function () {
  const G = window.G, fx = G.fx;
  if (!fx || !fx.kit) return;
  const K = fx.kit;
  const { api, fail, emit, streak, add, addRing, trauma, kick, pal, RAMP, R, rr, hash, p, star, line, crescent, hand, tongue } = K;
  const TAU = Math.PI * 2;
  const NUM = [0, 5, 7, 9];
  // Đợt 3 (docs/review/ke-hoach-cai-thien/hieu-ung-dot-3, cờ tắt ?hudot3=0): ảnh thay sóng chấn búa, nứt đất, gai băng, độc toé, va chạm.
  const d3 = (ma) => !!(K.d3 && K.d3(ma));
  const mauHe = (el) => (K.mauHe ? K.mauHe(el) : null); // số chi tiết trang trí theo mốc Mầm, Thành hình, Thức tỉnh

  // ---------- GỌN NHẸ HIỆU ỨNG HỆ (13/10, docs/review/ke-hoach-cai-thien/hieu-ung-thuc-tinh) ----------
  // Bật mặc định. Cờ tắt: ?gonhu=0 ở cuối địa chỉ (hoặc G.GO_NHU = false) thì mọi hình về đúng như cũ.
  // Khi bật (CHỈ đổi hình, không đổi luật: sát thương, thời gian, bán kính vùng gây hại giữ nguyên):
  //  - đã có ảnh AI cho một hiệu ứng thì không vẽ thêm lớp code cùng loại đè lên (đốm, bong bóng, vệt tím, sương, vết cháy trùng);
  //  - vũng/mây hệ của em bé chồng lên nhau quá nửa thì chỉ vẽ cái mới nhất (cái cũ ẩn hình, vẫn gây sát thương như luật);
  //  - mỗi loại vũng của em bé chỉ vẽ tối đa GN_MAX cái cùng lúc (cái mới nhất), mây độc mờ hơn, nhất là khi em bé đứng trong mây.
  let gnTat = false;
  try { gnTat = /[?&]gonhu=0\b/i.test(String(window.location && window.location.search)); } catch (e) { gnTat = false; }
  if (G.GO_NHU == null) G.GO_NHU = !gnTat;
  G.goNhu = () => G.GO_NHU !== false;
  // ---------- TỤ LỰC BẰNG ẢNH (13/10, docs/review/ke-hoach-cai-thien/hu-tu-luc) ----------
  // Bật mặc định khi có ảnh hu-tu-luc. Cờ tắt: ?tuluc=0 (hoặc G.TU_LUC = false) thì vòng sáng, gạch và hạt lấy đà vẽ bằng code như cũ.
  // Chỉ đổi hình lúc giữ nút Đánh lấy đà; luật lấy đà (thời gian, nấc, sát thương) trong js/moves.js không đổi.
  let tlTat = false;
  try { tlTat = /[?&]tuluc=0\b/i.test(String(window.location && window.location.search)); } catch (e) { tlTat = false; }
  if (G.TU_LUC == null) G.TU_LUC = !tlTat;
  G.tuLuc = () => G.TU_LUC !== false && !!(G.fxAnh && G.fxAnh.co('hu-tu-luc'));
  const GN_MAX = 3;      // số vũng (mỗi hệ) và số mây độc của em bé được vẽ cùng lúc
  const GN_TRUNG = 0.5;  // phần diện tích chồng lên (so với vũng nhỏ hơn) từ mức này trở lên thì gộp hình
  const GN_MAY = 0.42, GN_MAY_TRONG = 0.26; // độ đậm ảnh mây độc (cũ 0,6); em bé đứng trong mây thì mờ hơn nữa
  const coAnhGN = (ma) => G.goNhu() && !!(G.fxAnh && G.fxAnh.co(ma));
  // Diện tích chung của hai hình tròn bán kính a, b cách nhau d, chia cho diện tích hình nhỏ hơn (0..1)
  function phanTrung(a, b, d) {
    if (d >= a + b) return 0;
    const m = Math.min(a, b);
    if (d <= Math.abs(a - b)) return 1;
    const a2 = a * a, b2 = b * b;
    const x = a2 * Math.acos((d * d + a2 - b2) / (2 * d * a)) + b2 * Math.acos((d * d + b2 - a2) / (2 * d * b)) - 0.5 * Math.sqrt(Math.max(0, (-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b)));
    return x / (Math.PI * m * m);
  }
  // Bỏ vết cháy (scorch) vừa đặt tại đúng (x, y) – dùng khi ảnh vũng lửa đã nằm đúng chỗ đó
  function boVetChay(x, y) {
    const S = K.S(), E = S && S.E;
    if (!E) return;
    for (let i = E.length - 1; i >= Math.max(0, E.length - 40); i--) if (E[i].ty === 'scorch' && E[i].x === x && E[i].y === y) { E.splice(i, 1); return; }
  }
  const GN_DS = [];
  // Mỗi khung: đánh dấu z.fxAn (ẩn hình) cho vũng/mây hệ của em bé bị vũng mới hơn che quá nửa, hoặc vượt số GN_MAX.
  // Chỉ là cờ của lớp vẽ (tên bắt đầu bằng fx như z.fxA, z.fxId), luật trong js/moves.js, js/combat.js không đọc.
  // Vũng mới thay chỗ một vũng cũ đang hiện thì hiện đủ cỡ ngay (không nở lại từ nhỏ) để nhìn như vũng cũ được làm mới.
  function gopVung(W) {
    const zs = W.zones;
    for (const z of zs) if (z.he) z.fxAn = false;
    if (!G.goNhu()) return;
    const ZK = G.ZK || 0.85;
    for (const loai of ['fire', 'poison']) { // vũng độc của vũ khí luôn kèm mây (z.cloud): ẩn vũng là ẩn cả mây phía trên
      GN_DS.length = 0;
      for (let i = zs.length - 1; i >= 0; i--) { // mới nhất trước (vũng mới được đẩy vào cuối mảng)
        const z = zs[i];
        if (!z.he || z.dead || z.team !== 'player' || !(z.life > 0) || z.el !== loai) continue;
        let an = GN_DS.length >= GN_MAX;
        if (!an) for (const q of GN_DS) {
          if (phanTrung(z.r, q.r, Math.hypot(z.x - q.x, (z.y - q.y) / ZK)) >= GN_TRUNG) { an = true; if (!q.fxGop && !z.fxAn0) { q.fxGop = 1; q.fxA = Math.max(q.fxA || 0, 0.18); } break; }
        }
        z.fxAn = an; z.fxAn0 = an;
        if (!an) GN_DS.push(z);
      }
    }
  }

  // ---------- hình dạng của một đòn: cung tròn trước mặt, đường thẳng, hoặc một vòng quanh người ----------
  // Trả về null nếu đòn không có vệt (ví dụ buông tên: mũi tên tự mang hiệu ứng).
  function shapeOf(P, o) {
    const f = P.face, R0 = o.reach || 32;
    if (o.type === 'sword') {
      if (o.move === 'luot') return { kind: 'arc', x: P.x + f * 6, y: P.y - 12, f, ra: R0 * 0.9, rb: 11 };
      if (o.step === 2) return { kind: 'arc', x: P.x + f * 2, y: P.y - 12, f, ra: R0 * 1.1, rb: 13 };
      return { kind: 'arc', x: P.x + f * 3, y: P.y - 15, f, ra: R0 * 0.88, rb: 20 };
    }
    if (o.type === 'spear') {
      if (o.move === 'quet') return { kind: 'round', x: P.x, y: P.y - 9, f, ra: R0, rb: R0 * 0.34 };
      return { kind: 'line', x: P.x + f * 10, y: P.y - 13, f, len: R0 - 6 };
    }
    if (o.type === 'hammer') return { kind: 'arc', x: P.x + f * 4, y: P.y - 17, f, ra: (o.move === 'nenDat' ? 30 : R0 * 0.9), rb: 27 };
    return null;
  }
  const PTO = { x: 0, y: 0, nx: 0, ny: 0 };
  // Điểm thứ u (0..1) trên hình, kèm hướng chĩa ra ngoài (nx, ny)
  function pt(sh, u) {
    if (sh.kind === 'line') { PTO.x = sh.x + sh.f * sh.len * u; PTO.y = sh.y; PTO.nx = 0; PTO.ny = -1; return PTO; }
    const a = sh.kind === 'round' ? u * TAU : -1.35 + 2.7 * u;
    PTO.nx = Math.cos(a) * sh.f; PTO.ny = Math.sin(a);
    PTO.x = sh.x + PTO.nx * sh.ra; PTO.y = sh.y + PTO.ny * sh.rb;
    return PTO;
  }

  // 16/10 vẽ tay 6: vệt tay vũ khí hệ vẽ code (lưỡi lửa, giọt độc, răng cưa băng) bị chặn → ảnh hu-giot-he-<hệ> (5 khung, ảnh quay phải,
  // hộp 40×24 khi co 1) đặt giữa hình đòn: cung trước mặt (giữa cung, cỡ theo bán kính cung), đường đâm (giữa đường, cỡ theo độ dài),
  // vòng quét (hai bên, bên trái lật). Khung theo tiến độ hình đòn; hình đòn đã xoay theo hướng nhắm (drawFx o.rot).
  function giotAnh(c, o, k, el) {
    if (!(G.chanVe > 0)) return false;
    const FA = G.fxAnh, ma = 'hu-giot-he-' + el, a = FA && FA.get(ma);
    if (!a) return false;
    const sh = o.sh, f = Math.min(a.so - 1, Math.floor(k * a.so)), kp = (v) => Math.max(0.5, Math.min(2, v));
    if (sh.kind === 'line') FA.veK(c, ma, sh.x + sh.f * sh.len / 2, sh.y, f, 0, kp(sh.len / 40), sh.f < 0, 1);
    else if (sh.kind === 'round') { const s = kp(sh.ra / 28); FA.veK(c, ma, sh.x + sh.ra * 0.6, sh.y, f, 0, s, false, 1); FA.veK(c, ma, sh.x - sh.ra * 0.6, sh.y, f, 0, s, true, 1); }
    else FA.veK(c, ma, sh.x + sh.f * sh.ra * 0.61, sh.y, f, 0, kp((0.78 * sh.ra + 2 * sh.rb) / 64), sh.f < 0, 1);
    return true;
  }
  // ---------- LỬA: lưỡi lửa bám dọc vệt đòn, tàn lửa bay ----------
  function drawFlames(c, o, k) {
    if (giotAnh(c, o, k, 'fire')) return;
    const sh = o.sh, n = o.n, t = K.S().t;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      if (u > k * 4 + 0.15) continue; // lửa bén dần theo đường vung
      const q = pt(sh, u);
      const h = Math.round((o.h0 + hash(o.sd + i) * o.h0) * (1 - k * 0.9) * (0.75 + 0.25 * Math.sin(t * 38 + i * 2.1)));
      tongue(c, Math.round(q.x + q.nx * 2) + ((i + ((t * 20) | 0)) % 2), Math.round(q.y - k * 6) + 2, h, i % 2 ? 1 : 2);
    }
  }
  function fireSwing(sh, lv, big) {
    const n = (sh.kind === 'round' ? NUM[lv] + 5 : NUM[lv]) + (big ? 2 : 0);
    add({ ty: 'he', x: sh.x, y: sh.y, t: big ? 0.34 : 0.26, ly: 1, draw: drawFlames, sh, n, h0: 3 + lv * 1.5 + (big ? 2 : 0), sd: R() * 100 });
    const m = 1 + lv + (big ? 2 : 0);
    for (let i = 0; i < m; i++) {
      const q = pt(sh, R());
      emit(0, q.x, q.y, sh.f * rr(20, 90), rr(-110, -40), rr(0.35, 0.7), RAMP.ember, 1, 240, 0, sh.y + 16 + rr(-3, 5), 1); // tàn lửa
      if (i % 2 === 0) emit(9, q.x, q.y, sh.f * rr(5, 40), rr(-50, -20), rr(0.25, 0.45), RAMP.fire, 3, -30, 2, null, 1);
    }
  }
  // ---------- ĐỘC: vệt xanh lục pha tím, nhỏ giọt ----------
  const PURPLE = ['#e2c8ff', '#b98af0', '#9a5fd6', '#6a3fa0'];
  // Gọn nhẹ: hạt và vệt của đòn độc chỉ xanh lục (không đốm tím lẫn vào vũng/mây độc); tắt cờ thì pha tím như cũ
  const TIM = () => (G.goNhu() ? RAMP.poison : PURPLE);
  const TIM1 = () => (G.goNhu() ? '#3f8f22' : '#9a5fd6'), TIM2 = () => (G.goNhu() ? '#8fe04a' : '#b98af0');
  function drawDrips(c, o, k) {
    if (giotAnh(c, o, k, 'poison')) return;
    const sh = o.sh, n = o.n, t1 = TIM1(), t2 = TIM2();
    const grow = Math.min(1, k * 2.4);
    // viền tím chạy dọc vệt đòn
    if (k < 0.7) for (let i = 0; i < n * 2; i++) {
      const u = (i + 0.5) / (n * 2);
      if (u > k * 4 + 0.15 || (k > 0.4 && (i & 1))) continue;
      const q = pt(sh, u);
      p(c, Math.round(q.x + q.nx * 3), Math.round(q.y + q.ny * 2), 4, 2, i % 3 ? t1 : t2);
    }
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      if (u > k * 4 + 0.15) continue;
      if (k > 0.75 && (i & 1)) continue;
      const q = pt(sh, u);
      const L = Math.round((3 + hash(o.sd + i) * o.h0) * grow), x = Math.round(q.x), y = Math.round(q.y) + Math.round(k * 4);
      p(c, x, y, i % 2 ? 1 : 2, L, i % 3 === 1 ? t1 : '#6fcf3a');
      p(c, x - (L > 4 ? 1 : 0), y + L, L > 4 ? 3 : 2, 2, i % 3 === 1 ? t2 : '#c2f58a'); // giọt nặng ở đầu
    }
  }
  function poisonSwing(sh, lv, big) {
    const n = (sh.kind === 'round' ? NUM[lv] + 5 : NUM[lv]) + (big ? 2 : 0);
    add({ ty: 'he', x: sh.x, y: sh.y, t: big ? 0.42 : 0.34, ly: 1, draw: drawDrips, sh, n, h0: 3 + lv * 2 + (big ? 2 : 0), sd: R() * 100 });
    const m = 1 + lv + (big ? 2 : 0), gy = sh.y + (sh.kind === 'round' ? 9 : 14);
    for (let i = 0; i < m; i++) {
      const q = pt(sh, R());
      emit(5, q.x, q.y, sh.f * rr(0, 30), rr(-20, 30), rr(0.4, 0.7), i % 3 === 1 ? TIM() : RAMP.poison, 2, 300, 0, gy + rr(-3, 4), 1); // giọt rơi xuống đất
      if (i % 2 === 0) emit(11, q.x + rr(-3, 3), q.y + rr(-3, 3), rr(-4, 4), rr(-20, -8), rr(0.4, 0.7), RAMP.poison, 2, 0, 0, null, 1);
    }
  }
  // ---------- BĂNG: vệt trắng xanh gãy góc, sắc cạnh, mảnh băng văng ----------
  function drawIce(c, o, k) {
    if (giotAnh(c, o, k, 'ice')) return;
    const sh = o.sh, n = o.n;
    let px = 0, py = 0, has = false;
    const grow = Math.min(1, k * 5), thin = k > 0.7;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      if (u > k * 4 + 0.2) break;
      const q = pt(sh, u), x = Math.round(q.x + q.nx * 2), y = Math.round(q.y + q.ny * 2);
      // cạnh thẳng nối các đỉnh: vệt chém thành đường gãy khúc
      if (has && !(thin && (i & 1))) { line(c, px, py, x, y, k < 0.3 ? '#e9f9ff' : '#7fd4ff', 2); }
      // gai nhọn chĩa ra ngoài ở mỗi đỉnh
      if (!(thin && (i & 1))) {
        const L = (3 + hash(o.sd + i) * o.h0) * grow * (1 - k * 0.5);
        const ex = Math.round(x + q.nx * L), ey = Math.round(y + q.ny * L * 0.8 - (sh.kind === 'line' ? 0 : 1));
        line(c, x, y, ex, ey, '#bfeaff', 2); p(c, ex, ey, 1, 1, '#ffffff'); p(c, x, y, 2, 2, '#ffffff');
        if (sh.kind === 'line') { const ey2 = Math.round(y + L * 0.8); line(c, x, y, Math.round(x - sh.f * L * 0.6), ey2, '#bfeaff', 2); } // ngạnh chĩa xuống của đường đâm
      }
      px = x; py = y; has = true;
    }
  }
  function iceSwing(sh, lv, big) {
    const n = (sh.kind === 'round' ? NUM[lv] + 3 : NUM[lv] - 1) + (big ? 1 : 0);
    add({ ty: 'he', x: sh.x, y: sh.y, t: big ? 0.3 : 0.24, ly: 1, draw: drawIce, sh, n, h0: 3 + lv * 1.5 + (big ? 2 : 0), sd: R() * 100 });
    const m = 1 + lv + (big ? 2 : 0);
    for (let i = 0; i < m; i++) {
      const q = pt(sh, R());
      emit(4, q.x, q.y, q.nx * rr(30, 110), q.ny * rr(20, 80) - 20, rr(0.3, 0.55), RAMP.ice, R() < 0.4 ? 2 : 1, 160, 1.5, null, 1); // mảnh băng văng theo hướng vung
      if (i % 2 === 0) emit(6, q.x + rr(-4, 4), q.y + rr(-4, 4), 0, 0, rr(0.2, 0.4), RAMP.ice, 3, 0, 0, null, 1);
    }
  }
  const SWING = { fire: fireSwing, poison: poisonSwing, ice: iceSwing };
  // Một cọc gai băng mọc từ đất: thân xanh đậm, lõi xanh nhạt, sống trắng
  function spike(c, x, y, h) {
    if (h < 2) return;
    const a = (h * 0.4) | 0, b = (h * 0.75) | 0;
    p(c, x - 2, y - a, 5, a + 1, '#2b6ea3'); p(c, x - 2, y - a, 4, a + 1, '#4a9ad0');
    p(c, x - 1, y - b, 3, b, '#7fd4ff'); p(c, x, y - h, 1, h, '#e9f9ff');
    p(c, x - 1, y - ((h * 0.55) | 0), 1, ((h * 0.3) | 0) + 1, '#ffffff');
    p(c, x - 3, y, 7, 1, 'rgba(233,249,255,0.5)');
  }
  // Hàng gai băng mọc lần lượt theo hướng đánh (hoặc toả vòng), đứng một lúc rồi rút xuống
  function drawSpikes(c, o, k) {
    const age = o.t0 - o.t;
    // Đợt 3: ảnh hu-gai-bang (một cụm gai mọc rồi vỡ): vài cụm dọc hướng đòn (hoặc toả vòng), mọc lần lượt, phát hết khung trong đúng đời hình.
    if (d3('hu-gai-bang')) {
      const A = G.fxAnh, a = A.get('hu-gai-bang'), m = o.round ? 5 : Math.max(2, Math.round(o.L / 14)), ZK = G.ZK || 0.85;
      const sc = Math.max(0.7, Math.min(1.4, 0.75 + (o.h0 - 6) / 16));
      const ux = o.ux != null ? o.ux : o.dir, uy = o.uy || 0;
      for (let i = 0; i < m; i++) {
        const born = i * 0.05, a0 = age - born, song = o.t0 - born;
        if (a0 <= 0 || song <= 0) continue;
        let x, y;
        if (o.round) { const an = (i / m) * TAU + o.sd; x = o.x + Math.cos(an) * o.L * 0.6; y = o.y + Math.sin(an) * o.L * 0.36; }
        else { const s0 = 6 + ((i + 0.5) / m) * o.L, j = (hash(o.sd + i * 5) - 0.5) * o.depth * 0.6; x = o.x + ux * s0 - uy * j; y = o.y + (uy * s0 + ux * j) * ZK; }
        A.ve(c, 'hu-gai-bang', x, y, Math.min(1, a0 / song) * a.giay * 0.999, 0, sc * (0.85 + 0.3 * hash(o.sd + i)), hash(o.sd + i * 2) < 0.5);
      }
      return;
    }
    for (let i = 0; i < o.n; i++) {
      const born = i * 0.028, a = age - born;
      if (a <= 0) continue;
      const g = a < 0.09 ? a / 0.09 : o.t < 0.2 ? o.t / 0.2 : 1;
      let x, y;
      if (o.round) { const an = (i / o.n) * TAU + o.sd; const d = 0.45 + hash(o.sd + i * 3) * 0.55; x = o.x + Math.cos(an) * o.L * 0.75 * d; y = o.y + Math.sin(an) * o.L * 0.45 * d; }
      else {
        // dọc hướng đòn, lệch ngang (vuông góc) một chút cho tự nhiên
        const ux = o.ux != null ? o.ux : o.dir, uy = o.uy || 0, s0 = 4 + (i / o.n) * o.L, j = (hash(o.sd + i * 5) - 0.5) * o.depth, ZK = G.ZK || 0.85;
        x = o.x + ux * s0 - uy * j; y = o.y + (uy * s0 + ux * j) * ZK;
      }
      spike(c, Math.round(x), Math.round(y), Math.round((o.h0 + hash(o.sd + i) * o.h0 * 0.9) * g * (1 + (i / o.n) * 0.4)));
    }
  }
  function decorate(P, o) {
    if (!o.el || !o.lv || !SWING[o.el]) return;
    const sh = shapeOf(P, o);
    if (sh) SWING[o.el](sh, o.lv, o.move === 'quet' || o.move === 'nenDat' || (o.type === 'sword' && o.step === 2));
  }

  // ---------- vệt đòn theo lối đánh ----------
  const baseSwing = fx.swing;
  // o: { type, move, step, combo, reach, depth, el, lv, stage, charge, level }
  // Tám hướng: vẽ đòn nằm ngang như cũ rồi xoay theo góc nhắm (K.aimed). Nện đất đã đặt vết nứt đúng chỗ thật nên không dời hình sát đất.
  api('mvSwing', (P, o) => { K.aimed(P, () => { swing(P, o); decorate(P, o); }, { ground: o.move !== 'nenDat', don: o }); }); // don: Zed mới xoay hình trên không theo góc vũ khí (zed-8-huong)
  function swing(P, o) {
    const f = P.face, PL = pal(o.el);
    if (o.move === 'luot') {
      // nhát lướt sau khi né: lưỡi liềm rộng quét ngang và vệt gió
      // Ảnh AI hu-chem-luot (mép trái của hình là tay em bé; K.aimed xoay theo 8 hướng như vệt code): thay lưỡi liềm, vệt gió giữ nguyên
      const maL = K.anhHe('hu-chem-luot', o.el);
      // G.CO_VK bật: mép trước của ảnh đặt đúng ở mũi kiếm đang vẽ và bám theo em bé suốt cú lướt (K.anhLuot, js/fx.js)
      const scL = Math.max(0.5, Math.min(2, (o.reach * 0.9 + 11) / 56));
      if (!maL || !(K.anhLuot(maL, P, scL) || K.anh(maL, P.x - f, P.y - 12, { f, sc: scL })))
        add({ ty: 'cres', x: P.x + f * 6, y: P.y - 12, f, ra: o.reach * 0.9, rb: 11, off: 9, oy: 0, vert: false, rev: false, pl: PL, t: 0.2, big: true, st: o.stage, ly: 1, back: o.reach * 0.5 });
      for (let i = 0; i < 6; i++) streak(P.x - f * rr(0, 10), P.y - rr(4, 22), -f * rr(60, 140), 0, rr(0.12, 0.2), PL.ramp, 1, rr(8, 14), 0, 2);
      kick(f * 1.5, 0);
      return;
    }
    if (o.move === 'banManh') {
      // buông dây cung đã căng: chớp sáng ở cung, vòng gió, giật lùi
      // Sửa góp ý 1: chớp sáng, vòng gió và vệt gió đi theo hướng ngắm thật (P.aimUx, P.aimUy), không chỉ nằm ngang.
      const h = hand(P), c = o.charge || 0, ux = P.aimUx != null ? P.aimUx : f, uy = P.aimUy || 0;
      // Zed mới (zed-8-huong): ảnh ở tay xoay đúng góc tay ném đang vẽ (kẹp ±75° + nghiêng thân); vệt gió, giật lùi vẫn theo góc thật
      let ax = ux, ay = uy;
      try { const ZM = G.zedMoi, gH = ZM && ZM.lechHinh ? ZM.lechHinh(P, o) : null; if (gH != null && isFinite(gH)) { const b = (gH * Math.PI) / 180; ax = f * Math.cos(b); ay = Math.sin(b); } } catch (e) { ax = ux; ay = uy; }
      // Ảnh AI hu-ban-cung (mép trái của hình là tay cầm cung, luồng gió chĩa theo hướng ngắm thật): thay chớp sáng và vòng gió, vệt gió giữ nguyên
      // Bộ Zed mới (phi tiêu): đòn ném mạnh / ném chùm dùng ảnh hu-phi-tieu-chum (tích lực rồi bung rẻ quạt, mép trái ở tay); chưa có thì hu-ban-cung
      const chum = K.anhHe('hu-phi-tieu-chum', o.el);
      const maB = chum || K.anhHe('hu-ban-cung', o.el);
      if (!maB || !K.anhHuong(maB, h.x, h.y, ax, ay, { sc: chum ? (14 + 8 * c) / 22 : (12 + 8 * c) / 20 })) {
        add({ ty: 'flash', x: h.x + ux * 6, y: h.y + uy * 6, r: 6 + 4 * c, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
        addRing(h.x + ux * 4, h.y + uy * 4, 2, 10 + 8 * c, 0.18, PL.c2, 2, 1);
      }
      for (let i = 0; i < 4 + 4 * c; i++) { const v = rr(120, 240), q = rr(-20, 20), j = rr(-5, 5); streak(h.x - uy * j, h.y + ux * j, ux * v - uy * q, uy * v + ux * q, rr(0.1, 0.2), PL.ramp, 1, rr(6, 12), 0, 3); }
      kick(-ux * (1 + 1.5 * c), -uy * (1 + 1.5 * c));
      if (c >= 1) trauma(0.15);
      return;
    }
    if (o.move === 'quet') {
      // giáo quét một vòng: lưỡi liềm lớn phía trước, một vệt phía sau, vòng bụi dưới chân
      const R0 = o.reach;
      // Ảnh AI hu-quet-giao (cả vòng quét quanh người, tâm ảnh là thân em bé): thay hai lưỡi liềm trước và sau; vòng bụi dưới chân giữ nguyên
      const maQ = K.anhHe('hu-quet-giao', o.el);
      if (!maQ || !K.anh(maQ, P.x, P.y - 10, { f, sc: Math.max(0.5, Math.min(2, (R0 * 2.05 + 4) / 100)) })) {
        add({ ty: 'cres', x: P.x + f * 2, y: P.y - 11, f, ra: R0 * 1.05, rb: 13, off: 12, oy: 0, vert: false, rev: false, pl: PL, t: 0.26, big: true, st: o.stage, ly: 1, back: R0 * 0.3 });
        add({ ty: 'cres', x: P.x - f * 2, y: P.y - 9, f: -f, ra: R0 * 0.95, rb: 10, off: 11, oy: 0, vert: false, rev: true, pl: PL, t: 0.22, big: false, st: o.stage, ly: 1, back: R0 * 0.3, d: 0.05 });
      }
      addRing(P.x, P.y, 6, R0, 0.26, PL.c2, 2, 0);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 + rr(-0.2, 0.2); emit(2, P.x + Math.cos(a) * R0 * 0.6, P.y + Math.sin(a) * R0 * 0.36, Math.cos(a) * 40, Math.sin(a) * 20 - 6, rr(0.25, 0.45), RAMP.dust, 3, 0, 3, null, 0); }
      kick(f * 1.5, 0); trauma(0.14);
      return;
    }
    if (o.move === 'xoc') { fx.dash(P, 'spear', o.el); return; }
    if (o.move === 'nenDat') {
      // búa nện sau khi lấy đà: vệt bổ xuống, đất nứt, vòng sóng; nấc 2 to và rung mạnh hơn
      const big = o.level >= 2;
      // Vệt bổ xuống: đã có ảnh AI vệt nện búa (hu-chem-bua, dùng chung với đòn thường) thì vẽ ảnh, nấc 2 to hơn
      // 13/10: vệt bám búa thật (anhVk) và vết nứt/bụi đặt đúng dưới đầu búa (K.dauBua) cho khớp nhau; vòng tầm đánh vẫn ở tâm vùng gây hại.
      const db = K.dauBua ? K.dauBua(P) : null, nx = db ? db.x : o.x, ny = db ? db.y : o.y;
      if (!(db && K.anhVk && K.anhVk('hu-chem-bua', P, 'hammer', big ? 1.2 : 1.04)) && !K.anh('hu-chem-bua', P.x + f * 4, P.y - 17, { f, sc: big ? 1.2 : 1.04 }))
        add({ ty: 'cres', x: P.x + f * 4, y: P.y - 17, f, ra: 30, rb: 28, off: 10, oy: -5, vert: true, rev: false, pl: PL, t: 0.2, big: true, st: o.stage, ly: 1 });
      K.slam(nx, ny, o.r * 0.8, o.el, big ? 1.5 : 1);
      addRing(o.x, o.y, 6, o.r, 0.28, PL.c, big ? 4 : 3, 0);
      if (big) {
        addRing(o.x, o.y, 3, o.r * 1.15, 0.36, '#ffffff', 2, 0, 0.05);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + rr(-0.3, 0.3); add({ ty: 'crack', x: nx + Math.cos(a) * o.r * 0.6, y: ny + Math.sin(a) * o.r * 0.36, r: 8, t: 1.3, c: o.el ? PL.d : '#3a2e26', ly: 0, sd: R() * 100 }); }
      }
      trauma(big ? 0.6 : 0.35); kick(0, big ? 3 : 2); if (big) K.stop(60);
      return;
    }
    baseSwing(P, o);
  }

  // ---------- điểm nhấn của hệ ở nhát kết, đòn thả, đòn đặc biệt (luật nằm trong js/moves.js) ----------
  // o: { x, y, dir, power, line, round, r, pts }
  const FINISH = {
    fire(lv, o) {
      if (o.pts.length) {
        // vệt lửa chạy dọc đường lao (tám hướng): các cột lửa nối nhau phụt lên
        o.pts.forEach((q, i) => {
          add({ ty: 'pillar', x: q[0], y: q[1], w: 4 + lv, h: 16 + lv * 5, t: 0.3, ly: 1, d: i * 0.035 });
          for (let j = 0; j < 2; j++) emit(0, q[0], q[1] - 4, rr(-50, 50), rr(-150, -70), rr(0.4, 0.7), RAMP.ember, 1, 260, 0, q[1] + rr(-3, 5), 1);
        });
        const m = o.pts[(o.pts.length - 1) >> 1];
        // gọn nhẹ: có ảnh hu-vung-lua thì các vệt cháy dọc đường đã là ảnh, không đặt thêm vết cháy code đè lên
        if (!coAnhGN('hu-vung-lua')) add({ ty: 'scorch', x: m[0], y: m[1], r: Math.min(30, o.line * 0.4), t: 1.6, ly: 0 });
        trauma(0.2);
        return;
      }
      K.blastFire(o.x, o.y, o.r, Math.min(1.2, (0.4 + 0.13 * lv) * Math.sqrt(o.power)));
      if (coAnhGN('hu-vung-lua')) boVetChay(o.x, o.y); // vết cháy của vụ nổ nằm đúng chỗ ảnh vệt cháy (vũng lửa) của luật: bỏ lớp trùng
      trauma(0.16 + 0.07 * lv); kick(o.sx != null ? o.sx : o.dir, o.sy != null ? o.sy : 1);
    },
    poison(lv, o) {
      // nước độc toé ra rồi khói bốc lên (màn khói lơ lửng do vũng tự nhả ở heStep)
      const xs = o.pts.length ? o.pts : [[o.x, o.y]];
      for (const [x, y] of xs) {
        // Đợt 3: ảnh hu-doc-toe (bãi nhớt toé lên rồi sủi bọt, tan thành hơi) thay giọt bắn và vòng tím; vòng tầm toé giữ (mảnh)
        if (d3('hu-doc-toe') && K.anh('hu-doc-toe', x, y + 1, { sc: Math.max(0.7, Math.min(1.6, o.r / 18)) })) {
          addRing(x, y, 4, o.r, 0.34, '#c2f58a', 1, 0);
          continue;
        }
        addRing(x, y, 4, o.r, 0.34, '#c2f58a', 2, 0);
        if (!G.goNhu()) addRing(x, y, 2, o.r * 0.7, 0.3, '#9a5fd6', 2, 0, 0.06); // gọn nhẹ: bỏ vòng tím trong (ảnh vũng đã có viền)
        const n = 4 + lv * 2;
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + rr(-1.3, 1.3), v = rr(50, 130); emit(5, x, y - 4, Math.cos(a) * v, Math.sin(a) * v, rr(0.4, 0.75), i % 3 ? RAMP.poison : TIM(), 2, 380, 0, y + rr(-6, 8), 1); }
        // gọn nhẹ: có ảnh hu-may-doc thì mây ảnh đã là khói bốc lên, không thả thêm cụm hơi code đè lên
        if (!coAnhGN('hu-may-doc')) for (let i = 0; i < 3 + lv; i++) { const a = R() * TAU, v = rr(10, o.r * 1.2); emit(2, x, y - 8, Math.cos(a) * v, Math.sin(a) * v * 0.4 - 8, rr(0.6, 1.1), RAMP.vapor, R() < 0.5 ? 6 : 4, -6, 2.2, null, 1); }
      }
    },
    ice(lv, o) {
      // hàng gai mọc theo hướng đòn thật (tám hướng): (ux, uy) trên sàn, đổi ra màn hình bằng G.ZK
      const L = o.r, n = Math.max(4, Math.round(L / 6)) + (o.round ? 3 : 0), ZK = G.ZK || 0.85;
      const ux = o.ux != null ? o.ux : o.dir, uy = o.uy || 0;
      const at = (u) => [o.x + ux * L * u, o.y + uy * L * u * ZK];
      add({ ty: 'he', x: o.x, y: o.y, t: 0.75 + lv * 0.1, ly: 1, draw: drawSpikes, n, L, dir: o.dir, ux, uy, round: o.round, depth: 16, h0: 6 + lv * 2.5, sd: R() * 50 });
      const mq = o.round ? [o.x, o.y] : at(0.5);
      addRing(mq[0], mq[1], 4, o.round ? L * 0.75 : L * 0.55, 0.26, '#e9f9ff', 2, 0);
      for (let i = 0; i < 4 + lv * 2; i++) { const q = o.round ? [o.x + rr(-L, L) * 0.6, o.y] : at(R()); emit(4, q[0], q[1] - rr(4, 14), ux * rr(-20, 70), rr(-110, -40), rr(0.35, 0.65), RAMP.ice, R() < 0.4 ? 2 : 1, 300, 0, q[1] + rr(-4, 6), 1); }
      for (let i = 0; i < 3 + lv; i++) { const q = o.round ? [o.x + rr(-L, L) * 0.6, o.y] : at(R()); emit(2, q[0], q[1] - 1, rr(-14, 14), rr(-8, 0), rr(0.5, 0.9), RAMP.mist, 4, 0, 1.5, null, 0); }
      trauma(0.12 + 0.05 * lv);
    },
  };
  // Lớp băng trên một con quái đang đóng băng vỡ tung: mảnh sắc văng ra bốn phía tới bán kính r
  api('heShatter', (e, r) => {
    const B = K.bodyOf(e), y = e.y - B.h * 0.5;
    // Gọn nhẹ: có ảnh AI băng vỡ (hu-bang-vo) thì dán ảnh thay chớp sáng và vòng nhỏ quanh thân, mảnh/tia bớt một nửa; vòng lớn (bán kính văng thật) giữ
    const ai = coAnhGN('hu-bang-vo') && K.anh('hu-bang-vo', e.x, y, { sc: Math.max(0.6, Math.min(2.2, (B.w + 14) / 24)) });
    if (!ai) add({ ty: 'flash', x: e.x, y, r: 11, t: 0.12, c: '#ffffff', c2: '#bfeaff', ly: 1, sq: true });
    addRing(e.x, e.y, 5, r, 0.28, '#e9f9ff', 3, 0);
    if (!ai) addRing(e.x, y, 3, B.w + 14, 0.2, '#ffffff', 2, 1);
    for (let i = 0, nt = ai ? 6 : 12; i < nt; i++) { const a = (i / nt) * TAU + rr(-0.2, 0.2), v = rr(110, 200); streak(e.x + Math.cos(a) * 4, y + Math.sin(a) * 4, Math.cos(a) * v, Math.sin(a) * v * 0.6, rr(0.16, 0.26), RAMP.ice, i % 3 === 0 ? 2 : 1, rr(6, 11), 0, 3); }
    for (let i = 0; i < (ai ? 5 : 10); i++) { const a = R() * TAU, v = rr(50, 150); emit(i % 3 ? 4 : 8, e.x + rr(-B.w, B.w), e.y - rr(2, B.h), Math.cos(a) * v, Math.sin(a) * v * 0.6 - 50, rr(0.4, 0.75), RAMP.ice, i % 3 ? 2 : 3, 320, 0, e.y + rr(-3, 5), 1); }
    for (let i = 0; i < 4; i++) emit(2, e.x + rr(-6, 6), y + rr(-6, 6), rr(-24, 24), rr(-20, -4), rr(0.4, 0.7), RAMP.mist, 4, 0, 2, null, 1);
    trauma(0.35); K.stop(70);
  });
  // Nổ lan (đặc trưng 2 của Lửa): quái đang cháy chết thì nổ tung, lưỡi lửa liếm sang quái đứng gần trong bán kính r
  api('heBoom', (e, r, n) => {
    const y = e.y - Math.min(14, (e.h || 24) * 0.5);
    K.blastFire(e.x, e.y, r, n > 0 ? 0.95 : 0.7);
    // Gọn nhẹ: có ảnh AI vụ nổ (hu-no-lua, blastFire đã dán) thì không thêm vòng vàng và vết cháy thứ hai trùng chỗ, tia lửa bớt một nửa
    const ai = coAnhGN('hu-no-lua');
    if (!ai) addRing(e.x, e.y, 5, r, 0.26, '#ffd23f', 3, 0);
    for (let i = 0, nt = ai ? 4 : 8; i < nt; i++) { const a = (i / nt) * TAU + rr(-0.2, 0.2), v = rr(90, 160); streak(e.x + Math.cos(a) * 4, y + Math.sin(a) * 3, Math.cos(a) * v, Math.sin(a) * v * 0.6, rr(0.14, 0.22), RAMP.fire, i % 3 === 0 ? 2 : 1, rr(6, 10), 0, 3); }
    if (!ai) add({ ty: 'scorch', x: e.x, y: e.y, r: Math.min(22, r * 0.6), t: 1.4, ly: 0 });
    trauma(0.22);
  });
  // Độc lây từ quái vừa chết sang quái gần: các giọt độc bắn sang từng con
  api('heSpread', (e, list) => {
    const y0 = e.y - Math.min(16, (e.h || 24) * 0.5);
    addRing(e.x, e.y, 4, 30, 0.32, G.goNhu() ? '#8fe04a' : '#9a5fd6', 2, 0);
    for (let i = 0; i < Math.min(5, list.length); i++) {
      const t = list[i], ty = t.y - Math.min(16, (t.h || 24) * 0.5), T0 = 0.22;
      for (let j = 0; j < 3; j++) { const o = emit(1, e.x, y0, (t.x - e.x) / T0 + rr(-12, 12), (ty - y0) / T0 + rr(-12, 12), T0 + j * 0.03, j === 1 ? TIM() : RAMP.poison, 3, 0, 0, null, 1); o.t0 = o.t * 1.6; }
      if (!(d3('hu-doc-toe') && K.anh('hu-doc-toe', t.x, t.y + 1, { d: T0, sc: 0.7 }))) addRing(t.x, ty, 2, 9, 0.2, '#c2f58a', 2, 1, T0); // đợt 3: giọt độc toé ở đích
    }
    for (let i = 0; i < 5; i++) emit(11, e.x + rr(-8, 8), e.y - rr(2, 20), rr(-6, 6), rr(-26, -10), rr(0.4, 0.8), RAMP.poison, 2, 0, 0, null, 1);
  });
  api('heFinish', (el, lv, o) => { if (FINISH[el]) FINISH[el](lv, o); });
  // Tên mang hệ trúng quái. o: { x, y, r, big, dir }
  const ARROW = {
    fire(lv, o) {
      const y = o.y - 10;
      add({ ty: 'flash', x: o.x, y, r: o.big ? 11 : 7, t: 0.11, c: '#fff3b0', c2: '#ffa53a', ly: 1, sq: true });
      addRing(o.x, o.y, 3, o.r, 0.22, '#ffd23f', o.big ? 3 : 2, 0);
      const n = (o.big ? 8 : 4) + lv;
      for (let i = 0; i < n; i++) { const a = R() * TAU, v = rr(20, 70); emit(9, o.x + Math.cos(a) * 3, y + Math.sin(a) * 3, Math.cos(a) * v, Math.sin(a) * v * 0.5 - rr(20, 60), rr(0.25, 0.5), RAMP.fire, R() < 0.5 ? 5 : 3, -30, 1.5, null, 1); }
      for (let i = 0; i < 3 + lv; i++) emit(0, o.x, y, rr(-90, 90), rr(-140, -50), rr(0.35, 0.7), RAMP.ember, 1, 240, 0, o.y + rr(-3, 5), 1);
      if (o.big) { add({ ty: 'scorch', x: o.x, y: o.y, r: o.r * 0.5, t: 1.6, ly: 0 }); trauma(0.22); }
    },
    poison(lv, o) {
      const y = o.y - 10;
      add({ ty: 'flash', x: o.x, y, r: o.big ? 9 : 6, t: 0.1, c: '#e6ffc0', c2: '#8fe04a', ly: 1, sq: true });
      addRing(o.x, y, 2, o.big ? 15 : 10, 0.2, G.goNhu() ? '#8fe04a' : '#9a5fd6', 2, 1);
      const n = (o.big ? 7 : 4) + lv;
      for (let i = 0; i < n; i++) emit(5, o.x, y, o.dir * rr(-20, 80), rr(-90, -10), rr(0.4, 0.7), i % 3 ? RAMP.poison : TIM(), 2, 320, 0, o.y + rr(-3, 5), 1);
      for (let i = 0; i < 2 + lv; i++) emit(2, o.x + rr(-4, 4), y + rr(-4, 4), rr(-14, 14), rr(-20, -6), rr(0.5, 0.9), RAMP.vapor, 4, 0, 1.5, null, 1);
    },
    ice(lv, o) {
      const y = o.y - 10;
      add({ ty: 'flash', x: o.x, y, r: o.big ? 8 : 5, t: 0.09, c: '#ffffff', c2: '#bfeaff', ly: 1 });
      const n = (o.big ? 6 : 3) + lv;
      for (let i = 0; i < n; i++) emit(4, o.x, y, o.dir * rr(20, 120), rr(-70, 40), rr(0.3, 0.5), RAMP.ice, R() < 0.4 ? 2 : 1, 140, 1.5, null, 1);
      emit(6, o.x + rr(-4, 4), y + rr(-5, 5), 0, 0, 0.25, RAMP.ice, 3, 0, 0, null, 1);
      if (o.big) addRing(o.x, y, 2, 13, 0.18, '#e9f9ff', 2, 1);
    },
  };
  api('heArrow', (el, lv, o) => { if (ARROW[el]) ARROW[el](lv, o); });

  // ---------- một đòn trúng cả đám: chỉ vài con đầu có đủ tia lửa, các con sau chỉ giật lùi ----------
  // Các lối đánh mới (quét vòng, nện đất, nổ lan) hay trúng nhiều quái cùng lúc; giới hạn này giữ số hạt và tốc độ khung.
  const hit0 = fx.hit;
  let hitT = -1, hitN = 0;
  fx.hit = function (e, o) {
    if (!G.noRender && e && o && !o.rain && !o.crit && !e.isBoss) {
      if (G.time !== hitT) { hitT = G.time; hitN = 0; }
      if (++hitN > 5) { e.fxK = 0.13; e.fxD = (o.dir || 1) * (o.heavy ? 4 : 2); return undefined; }
    }
    return hit0(e, o);
  };

  // ---------- vệt cháy và vũng khói độc trên đất ----------
  // Hình nền của vũng được vẽ sẵn một lần cho mỗi cỡ rồi dán lại mỗi khung (nhẹ hơn vẽ từng hàng điểm ảnh).
  const ZSPR = new Map();
  const ZCOL = {
    fire: { base: 'rgba(110,34,10,0.62)', mid: 'rgba(255,122,42,0.4)', rim: 'rgba(255,196,63,0.75)' },
    poison: { base: 'rgba(40,110,26,0.5)', mid: 'rgba(111,207,58,0.38)', rim: 'rgba(154,95,214,0.8)' },
  };
  function zoneSprite(el, r) {
    const rx = Math.max(6, Math.round(r / 2) * 2), key = el + rx;
    let sp = ZSPR.get(key);
    if (sp) return sp;
    const ry = Math.round(rx * (G.ZK || 0.6)), w = rx * 2 + 8, h = ry * 2 + 4, cx = w >> 1, cy = h >> 1;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c = cv.getContext('2d'), C = ZCOL[el] || ZCOL.fire;
    for (let dy = -ry; dy <= ry; dy++) {
      const q = 1 - (dy * dy) / (ry * ry + 0.01);
      if (q <= 0) continue;
      const hw = Math.max(1, Math.round(rx * Math.sqrt(q) + Math.sin(dy * 0.9 + rx) * 1.5)), sh = Math.round(Math.sin(dy * 0.5 + rx * 2) * 1.2);
      c.fillStyle = C.base; c.fillRect(cx - hw + sh, cy + dy, hw * 2, 1);
      if (hw > 6 && Math.abs(dy) < ry - 2) { c.fillStyle = C.mid; c.fillRect(cx - hw + 4 + sh, cy + dy, hw * 2 - 8, 1); }
      c.fillStyle = C.rim;
      if (Math.abs(dy) >= ry - 1) c.fillRect(cx - hw + sh, cy + dy, hw * 2, 1);
      else { c.fillRect(cx - hw + sh - 1, cy + dy, 2, 1); c.fillRect(cx + hw + sh - 1, cy + dy, 2, 1); }
    }
    sp = { cv, w, h, rx, ry };
    ZSPR.set(key, sp);
    return sp;
  }
  const VUNG_ANH = { fire: 'hu-vung-lua', poison: 'hu-vung-doc' };
  function drawHeZone(c, z) {
    const S = K.S(), t = S.t, id = z.fxId || 1;
    if (z.fxAn) return; // gọn nhẹ: bị vũng mới hơn che quá nửa hoặc vượt số vũng được vẽ (vẫn gây sát thương như luật)
    const k = Math.min(1, (z.fxA || 0) / 0.18);
    if (k <= 0) return;
    const sp = zoneSprite(z.el, z.r), x = Math.round(z.x), y = Math.round(z.y);
    const w = Math.round(sp.w * (0.4 + 0.6 * k)), h = Math.round(sp.h * (0.4 + 0.6 * k));
    const fade = z.life < 0.4;
    if (fade && ((t * 20) | 0) % 2) return; // sắp tắt thì nhấp nháy
    // Làn B4: có ảnh hu-vung-lua / hu-vung-doc thì dán ảnh thay nền vũng và lưỡi lửa, bong bóng. Ảnh co theo bán kính luật z.r
    // (bề ngang vũng trong ảnh = khung − 4 điểm lề của trang tách); lớn dần lúc mới hiện và nhấp nháy lúc sắp tắt y như hình code.
    const ma = VUNG_ANH[z.el], FA = G.fxAnh, an = ma && FA && FA.get(ma);
    if (an) { FA.ve(c, ma, x, y, t + id * 0.37, 0, (2 * z.r * (0.4 + 0.6 * k)) / Math.max(4, an.fw - 4)); return; }
    c.drawImage(sp.cv, x - (w >> 1), y - (h >> 1), w, h);
    if (k < 1) return;
    for (let i = 0; i < 3; i++) {
      const a = hash(id + i * 3.7) * TAU, d = 0.25 + hash(id * 2 + i) * 0.5;
      const bx = x + Math.round(Math.cos(a) * sp.rx * d), by = y + Math.round(Math.sin(a) * sp.ry * d);
      if (z.el === 'fire') tongue(c, bx, by, 4 + Math.round((Math.sin(t * 11 + i * 2.3 + id) * 0.5 + 0.5) * 6), i % 2 ? 1 : 2);
      else {
        const u = (t * (0.7 + hash(i + id) * 0.6) + hash(id + i * 9.1)) % 1;
        if (u < 0.5) p(c, bx, by, 1, 1, '#c2f58a');
        else if (u < 0.85) { p(c, bx - 1, by - 1, 3, 3, i % 2 ? '#b98af0' : '#8fe04a'); p(c, bx - 1, by - 1, 1, 1, '#ffffff'); }
        else { p(c, bx - 2, by - 1, 1, 1, '#c2f58a'); p(c, bx + 2, by - 1, 1, 1, '#c2f58a'); p(c, bx, by - 3, 1, 1, '#c2f58a'); }
      }
    }
  }
  const zone0 = fx.zone;
  fx.zone = function (c, z, W) {
    if (!G.noRender && z.he && z.pool && !(z.t > 0) && K.S()) {
      try { drawHeZone(c, z); return true; } catch (e) { fail(e); }
    }
    return zone0(c, z, W);
  };

  // ---------- mũi tên mang hệ: hình vẽ thêm quanh mũi tên ----------
  const proj0 = fx.proj;
  fx.proj = function (c, o) {
    proj0(c, o);
    if (G.noRender || !o.he || o.kind !== 'arrow') return;
    // Đã có ảnh AI mũi tên mang hệ (hu-dan-ten-<hệ>, vẽ ở js/fx_dan.js) thì thôi vẽ lửa/nhớt/băng bằng code quanh tên. Không có tệp: y như cũ.
    if (G.fxAnh && G.fxAnh.co('hu-dan-ten-' + o.he.el)) return;
    try {
      const S = K.S();
      if (!S) return;
      // Sửa góp ý 1: hình hệ bọc quanh tên xoay theo hướng bay: vẽ trong hệ trục của mũi tên (x tới trước, y lệch ngang).
      const X = Math.round(o.x), Y = Math.round(o.y - (o.z || 10)), t = S.t, lv = o.he.lv, ang = Math.atan2(o.vy || 0, o.vx || 1);
      const k = 1, x = 0, y = 0;
      c.save(); c.translate(X, Y); c.rotate(ang);
      try {
      if (o.he.el === 'fire') {
        // lửa bọc đầu tên, kéo dài ra sau
        const n = (o.big ? 3 : 1) + (lv >= 2 ? 1 : 0);
        for (let j = 0; j < n; j++) tongue(c, x - k * (1 + j * 5), y + 2, (o.big ? 9 : 6) - j * 2 + (((t * 24 + j * 3) | 0) % 3), j % 2 ? 1 : 2);
        p(c, x + k * 3, y - 1, 2, 3, '#fff3b0');
      } else if (o.he.el === 'poison') {
        // đầu tên bọc nhớt độc, giọt nhỏ xuống dọc thân tên
        p(c, x + k * 2 - 1, y - 2, 4, 5, '#6a3fa0'); p(c, x + k * 2, y - 1, 3, 3, '#6fcf3a'); p(c, x + k * 2, y - 1, 1, 1, '#e6ffc0');
        const n = (o.big ? 4 : 2) + (lv >= 3 ? 1 : 0);
        for (let j = 0; j < n; j++) { const d = ((t * 22 + j * 2.3) | 0) % 5; p(c, x - k * (3 + j * 5), y + 2 + d, 1, 2, j % 2 ? '#9a5fd6' : '#8fe04a'); }
      } else {
        // đầu tên là một tinh thể nhọn, hai ngạnh băng xuôi về sau
        const L = o.big ? 7 : 5, hx = x + k * 4;
        line(c, hx - k * L, y - 3, hx + k * 2, y, '#7fd4ff', 2); line(c, hx - k * L, y + 3, hx + k * 2, y, '#7fd4ff', 2);
        line(c, hx - k * L, y, hx + k * 3, y, '#ffffff', 1);
        p(c, hx - k * L - (k > 0 ? 1 : 0), y - 1, 2, 3, '#e9f9ff');
        if (o.big || lv >= 3) { line(c, x - k * 8, y - 4, x - k * 3, y - 1, '#bfeaff', 1); line(c, x - k * 8, y + 4, x - k * 3, y + 1, '#bfeaff', 1); }
        if (((t * 18) | 0) % 3 === 0) star(c, hx + k * 2, y, 2, '#ffffff');
      }
      } finally { c.restore(); }
    } catch (e) { fail(e); }
  };
  // Vừa lên một nấc lấy đà: vòng sáng và lấp lánh ở tay
  // Tụ lực bằng ảnh (G.tuLuc(), docs/review/ke-hoach-cai-thien/hu-tu-luc): có ảnh hu-tu-luc thì không vẽ lớp code này nữa
  // (vòng ảnh dưới chân tự to lên theo nấc, xem drawTuLuc). Tiếng "pick" lên nấc vẫn do js/moves.js phát như cũ.
  api('mvCharge', (P, level) => {
    if (G.tuLuc()) return;
    const h = hand(P), w = G.curW(P), PL = pal(G.activeEl(P, w));
    addRing(h.x, h.y - 4, 3, 13 + level * 3, 0.2, level >= 2 ? '#ffd23f' : PL.c2, 2, 1);
    add({ ty: 'flash', x: h.x, y: h.y - 4, r: 5 + level * 2, t: 0.1, c: '#ffffff', c2: level >= 2 ? '#ffd23f' : PL.c2, ly: 1 });
    for (let i = 0; i < 5; i++) emit(6, h.x + rr(-8, 8), h.y + rr(-12, 4), 0, -8, rr(0.2, 0.4), level >= 2 ? RAMP.gold : PL.ramp, 3, 0, 0, null, 1);
  });

  const HAZE_P = ['rgba(154,95,214,0.5)', 'rgba(154,95,214,0.38)', 'rgba(120,70,180,0.26)', 'rgba(106,63,160,0.14)'];
  // Lớp sương của màn khói: vẽ sẵn một lần cho mỗi cỡ (các vạch ngang so le), mỗi khung dán lại và cho trôi qua lại.
  const HSPR = new Map();
  function hazeSprite(r) {
    const rx = Math.max(6, Math.round(r / 2) * 2);
    let sp = HSPR.get(rx);
    if (sp) return sp;
    const ry = Math.round(rx * 0.42), cv = document.createElement('canvas');
    cv.width = rx * 2 + 8; cv.height = ry * 2 + 2;
    const c = cv.getContext('2d');
    for (let dy = -ry; dy <= ry; dy += 2) {
      const hw = Math.round(rx * 0.95 * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01)))), sh = Math.round(Math.sin(dy * 0.7 + rx) * 3);
      if (hw < 2) continue;
      c.fillStyle = 'rgba(143,224,74,0.22)'; c.fillRect(rx + 4 - hw + sh, ry + 1 + dy, hw * 2, 1);
      if ((dy & 3) === 0) { c.fillStyle = 'rgba(154,95,214,0.2)'; c.fillRect(rx + 4 - (hw >> 1) - sh, ry + 1 + dy, hw, 1); }
    }
    sp = { cv, w: cv.width, h: cv.height };
    HSPR.set(rx, sp);
    return sp;
  }
  // Độ đọc trận 12/10: mây độc của bé chỉ thu HÌNH lại (bán kính G.theme.DOC.mayDocR ≈ cao một con quái thường); vũng độc
  // trên sàn và vùng gây sát thương (z.r) giữ nguyên. Cờ tắt G.DOC_TRAN2 = false: hình to như cũ.
  function mayR(z) { return G.docTran2 && G.docTran2() ? Math.min(z.r, G.theme.DOC.mayDocR) : z.r; }
  // Độ đậm ảnh mây độc: cũ 0,6; gọn nhẹ 0,42, em bé đứng trong vùng mây thì 0,26 để thấy rõ em bé
  function mayMo(z) {
    if (!G.goNhu()) return 0.6;
    const W = G.getWorld && G.getWorld(), P = W && W.P;
    if (P && !P.dead && Math.hypot(P.x - z.x, (P.y - z.y) / (G.ZK || 0.85)) < z.r + 6) return GN_MAY_TRONG;
    return GN_MAY;
  }
  function drawCloud(c, o) {
    const z = o.z;
    if (z.dead || z.life <= 0 || z.fxAn) return; // z.fxAn: gọn nhẹ, mây của vũng đang ẩn hình
    const t = K.S().t, id = z.fxId || 1;
    if (z.life < 0.4 && ((t * 20) | 0) % 2) return;
    const zr = mayR(z), sp = hazeSprite(zr), x = Math.round(z.x), y = Math.round(z.y) - 12;
    // Làn B4: có ảnh hu-may-doc thì dán ảnh thay hai lớp sương và cụm khói; bề ngang = đường kính luật của vũng bên dưới, đậm 60% để còn thấy nhân vật.
    const FA = G.fxAnh, an = FA && FA.get('hu-may-doc');
    if (an) { FA.ve(c, 'hu-may-doc', x, y - 2, t + id * 0.37, 0, (2 * zr) / Math.max(4, an.fw - 4, G.docTran2 && G.docTran2() ? an.fh - 4 : 0), false, mayMo(z)); return; } // 12/10: cả bề cao cũng không quá 2 x bán kính hình
    c.drawImage(sp.cv, x - (sp.w >> 1) + Math.round(Math.sin(t * 1.6 + id) * 3), y - (sp.h >> 1));
    c.drawImage(sp.cv, x - (sp.w >> 1) - Math.round(Math.sin(t * 1.1 + id * 2) * 4), y - (sp.h >> 1) - 5);
    c.fillStyle = 'rgba(154,95,214,0.3)';
    for (let i = 0; i < 2; i++) { const px = x + Math.round(Math.sin(t * 0.9 + i * 2.1 + id) * zr * 0.5), py = y + Math.round(Math.cos(t * 1.3 + i * 1.7 + id) * 4); c.fillRect(px - 4, py - 1, 8, 3); c.fillRect(px - 2, py - 2, 4, 5); }
  }
  function drawShard(c, o) {
    const q = o.q;
    if (q.left <= 0) return;
    const x = Math.round(q.x), y = Math.round(q.y) - 10, k = q.vx < 0 ? -1 : 1;
    p(c, x - 2, y - 2, 5, 5, '#3f2a66'); p(c, x - 1, y - 1, 3, 3, '#6fcf3a'); p(c, x - 1, y - 1, 1, 1, '#e6ffc0');
    p(c, x - k * 4, y, 2, 1, '#9a5fd6'); p(c, x - k * 6, y - Math.sign(q.vy), 1, 1, '#6fcf3a');
    p(c, x - 2, Math.round(q.y), 4, 1, 'rgba(0,0,0,0.3)');
  }
  // Sóng chấn động của búa: một gờ đất chạy đi, bụi và đá văng hai bên
  // Tám hướng: vẽ gờ sóng như khi chạy ngang rồi xoay quanh chỗ gờ theo hướng chạy thật (z.ux, z.uy)
  function drawWave(c, z) {
    const ZK = G.ZK || 0.85, ux = z.ux != null ? z.ux : z.dir, uy = z.uy || 0, f = z.dir;
    // Đợt 3: ảnh hu-song-dat (gờ đất lăn, lặp) xoay theo hướng chạy thật; sang trái thì lật chứ không lộn ngược. Nấc 2 to hơn.
    if (d3('hu-song-dat')) {
      const t = K.S().t, hg = K.huongAnh(Math.abs(ux) < 1e-3 && Math.abs(uy) < 1e-3 ? f : ux, uy * ZK);
      if (z.fxAt == null) z.fxAt = t;
      const mo = Math.min(1, z.left / 12);
      if (G.fxAnh.ve(c, 'hu-song-dat', z.x, z.y, t - z.fxAt, hg.goc, z.level >= 2 ? 1.25 : 1, hg.f < 0, mo, z.he ? mauHe(z.he.el) : null, 'sang')) return;
    }
    const th = Math.atan2(uy * ZK, Math.abs(ux) < 1e-3 ? 1e-3 * f : ux * f) * f;
    if (Math.abs(th) > 0.01) { c.save(); c.translate(z.x, z.y); c.rotate(th); c.translate(-z.x, -z.y); try { drawWave0(c, z); } finally { c.restore(); } }
    else drawWave0(c, z);
  }
  function drawWave0(c, z) {
    const x = Math.round(z.x), y = Math.round(z.y), h = Math.round(z.depth / 2) + 2, f = z.dir;
    const PL = pal(z.he ? z.he.el : null), k = Math.min(1, z.left / 24);
    const top = z.level >= 2 ? 11 : 7;
    // vết nứt kéo dài phía sau gờ sóng
    const back = Math.min(40, Math.hypot(z.x - z.x0, z.y - (z.y0 != null ? z.y0 : z.y)));
    for (let i = 4; i < back; i += 3) p(c, x - f * i, y + (((i * 7) % 5) - 2), 2, 1, i % 2 ? 'rgba(20,14,12,0.6)' : (z.he ? PL.d : 'rgba(60,48,40,0.7)'));
    for (let dy = -h; dy <= h; dy += 2) {
      const q = Math.sqrt(Math.max(0, 1 - (dy * dy) / (h * h + 1))), bx = x - Math.round(f * (1 - q) * 9);
      const up = Math.round(top * q * k);
      p(c, bx - (f > 0 ? 6 : 0), y + dy, 7, 2, 'rgba(20,14,12,0.5)');
      if (up > 0) {
        p(c, bx - 1, y + dy - up, 4, up + 1, z.he ? PL.d : '#6a5a4a');
        p(c, bx + (f > 0 ? 1 : -1), y + dy - up, 2, up, z.he ? PL.c : '#b8a890');
        p(c, bx + (f > 0 ? 2 : -1), y + dy - up - 1, 1, 2, z.he ? PL.c2 : '#ffffff');
      }
    }
  }
  // ---------- mỗi khung: sóng chấn động, hạt lúc lấy đà ----------
  let choDC = null; // Địa Chấn đang chờ búa chạm đất (bua-khop-2)
  function buocDC(dt) {
    const c = choDC, P = c.P;
    c.t += dt;
    const d = P.specT > 0 ? K.dauBuaDb(P) : null, u = 1 - (P.specT || 0) / 0.35;
    if (d && u < d.cham && c.t < 0.3) return; // búa chưa xuống
    choDC = null;
    K.slam(d ? d.x : P.x, d ? d.y : P.y, 26, c.el, 1.4);
  }
  fx.heStep = function (W, dt, tick) {
    const P = W.P, mv = P.mv;
    if (choDC) { if (choDC.P !== P) choDC = null; else try { buocDC(dt); } catch (e) { choDC = null; fail(e); } }
    try { gopVung(W); } catch (e) { fail(e); }
    if (tick) for (const o of W.projs) {
      // vệt hạt sau mũi tên mang hệ
      if (!o.he || o.team !== 'player') continue;
      const y = o.y - (o.z || 10), b = o.x - Math.sign(o.vx) * 6;
      if (o.he.el === 'poison') { emit(5, b, y + 1, -o.vx * 0.03, rr(0, 20), rr(0.35, 0.55), R() < 0.3 ? TIM() : RAMP.poison, o.big ? 2 : 1, 260, 0, o.y + rr(-1, 3), 1); if (o.big) emit(2, b, y, 0, -8, 0.45, RAMP.vapor, 3, 0, 0, null, 1); }
      else if (o.he.el === 'ice') { emit(R() < 0.5 ? 6 : 4, b + rr(-2, 2), y + rr(-3, 3), -o.vx * 0.02, rr(-6, 14), rr(0.25, 0.45), RAMP.ice, o.big ? 2 : 1, 0, 0, null, 1); if (o.big) emit(2, b, y, 0, -3, 0.4, RAMP.mist, 3, 0, 0, null, 1); }
      else if (o.he.el === 'fire') { emit(9, b, y + rr(-1, 2), -o.vx * 0.06, rr(-30, -10), rr(0.2, 0.35), RAMP.fire, o.big ? 4 : 3, -20, 0, null, 1); if (o.big || o.he.lv >= 3) emit(0, b, y, -o.vx * 0.1 + rr(-20, 20), rr(-60, -20), rr(0.3, 0.5), RAMP.ember, 1, 200, 0, o.y + 2, 1); }
    }
    for (const z of W.zones) {
      if (!z.he || !z.cloud || z.dead) continue;
      // màn khói độc lơ lửng phía trên vũng: một lớp sương mỏng và các cụm khói trôi chậm
      if (!z.fxOn) { z.fxOn = 1; add({ ty: 'he', x: z.x, y: z.y, t: z.life + 0.1, ly: 1, draw: drawCloud, z }); }
      // gọn nhẹ: vũng ẩn hình thì không nhả sương; có ảnh hu-may-doc thì sương code thưa hẳn (ảnh đã là mây) và không có hạt tím
      const gn = G.goNhu(), anhMay = gn && G.fxAnh && G.fxAnh.co('hu-may-doc');
      if (gn && z.fxAn) continue;
      if (tick && R() < (anhMay ? 0.12 : 0.4)) { const a = R() * TAU, d = Math.sqrt(R()) * mayR(z) * 0.8; emit(2, z.x + Math.cos(a) * d, z.y - rr(6, 20) + Math.sin(a) * d * 0.3, rr(-8, 8), rr(-9, -2), rr(0.7, 1.3), !gn && R() < 0.25 ? HAZE_P : RAMP.vapor, R() < 0.5 ? 6 : 4, 0, 0.6, null, 1); }
    }
    if (W.mvShards) for (const q of W.mvShards) {
      // mảnh tên độc: một giọt nhớt bay, kéo theo vệt
      if (!q.fxOn) { q.fxOn = 1; add({ ty: 'he', x: q.x, y: q.y, t: 0.4, ly: 1, draw: drawShard, q }); }
      if (tick) emit(1, q.x, q.y - 10, -q.vx * 0.05, -q.vy * 0.05, 0.22, R() < 0.3 ? TIM() : RAMP.poison, 2, 0, 0, null, 1);
    }
    if (W.mvWaves) for (const z of W.mvWaves) {
      if (!z.fxOn) { z.fxOn = 1; z.x0 = z.x; z.y0 = z.y; add({ ty: 'he', x: z.x, y: z.y, t: z.left / z.v + 0.05, ly: 0, draw: (c, o) => { if (o.z.left > 0) drawWave(c, o.z); }, z }); }
      if (tick) {
        const PL = pal(z.he ? z.he.el : null);
        emit(2, z.x + rr(-3, 3), z.y + rr(-z.depth, z.depth) * 0.5, -z.dir * rr(10, 40), rr(-26, -8), rr(0.25, 0.45), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
        emit(8, z.x, z.y + rr(-z.depth, z.depth) * 0.5, z.dir * rr(-20, 50), rr(-140, -70), rr(0.4, 0.7), z.he && R() < 0.5 ? PL.ramp : RAMP.rock, 2, 420, 0, z.y + rr(-2, 5), 1);
      }
    }
    stepSp(W, tick);
    if (mv && mv.holding && tick && !P.dead && !G.tuLuc()) { // có ảnh tụ lực: không còn hạt màu hệ bay vòng quanh hút về tay
      // hạt sáng bị hút về tay, càng đầy càng dày
      const h = hand(P), w = G.curW(P), PL = pal(G.activeEl(P, w));
      if (R() < 0.35 + 0.6 * mv.charge) {
        const a = R() * 6.283, d = rr(12, 20);
        emit(1, h.x + Math.cos(a) * d, h.y - 4 + Math.sin(a) * d * 0.7, -Math.cos(a) * d * 4, -Math.sin(a) * d * 2.8, 0.22, mv.charge >= 1 ? RAMP.gold : PL.ramp, 2, 0, 0, null, 1);
      }
    }
  };


  // ====================================================================
  // CHIÊU ĐẶC BIỆT RIÊNG (luật trong js/moves.js, W.mvSp): Trảm Nguyệt, Phi Thương, Địa Chấn. Mưa Tên giữ hình cũ.
  // Mọi hình xoay theo hướng chiêu bay thật (q.ux, q.uy trên sàn; trên màn hình chiều dọc nhân G.ZK).
  // ====================================================================
  const zk = () => G.ZK || 0.85;
  const scr = (q) => { const sy = q.uy * zk(), l = Math.hypot(q.ux, sy) || 1; return [q.ux / l, sy / l]; };
  const angOf = (q) => { const v = scr(q); return Math.atan2(v[1], v[0]); };
  // Trảm Nguyệt: vệt trăng lưỡi liềm sáng, hai bóng mờ đuổi sau, lớn dần khi bay
  function drawCres(c, o) {
    const q = o.q;
    if (q.done) { q.gone = true; return; }
    const PL = pal(q.he ? q.he.el : null), th = angOf(q), g = Math.min(0.85, 0.62 + q.walked / 220); // nhỏ hơn trước (0,75 → 1) để vệt không che quái và em bé
    const X = Math.round(q.x), Y = Math.round(q.y - 12);
    // Ảnh AI hu-tram-nguyet (vầng trăng lưỡi liềm đang bay, chạy lặp): xoay theo hướng bay thật, bay sang trái thì lật chứ không lộn ngược; lớn dần như hình code
    const maT = K.anhHe('hu-tram-nguyet', q.he ? q.he.el : null);
    if (maT) {
      const v = scr(q), hg = K.huongAnh(v[0], v[1]), t = K.S().t;
      if (q.fxAt == null) q.fxAt = t;
      if (G.fxAnh.ve(c, maT, X, Y, t - q.fxAt, hg.goc, (g * 42) / 44, hg.f < 0)) return;
    }
    c.save(); c.translate(X, Y); c.rotate(th);
    try {
      for (let i = 2; i >= 1; i--) { c.globalAlpha = 0.15 * (3 - i); crescent(c, -i * 9, 0, 17 * g, 19 * g, -8, 0, 1, PL.c, 0, 1, true, true, 1, 0); }
      c.globalAlpha = 1;
      crescent(c, 1, 0, 19 * g, 21 * g, -8, 0, 1, PL.d, 0, 1, true, false, 1, 0);
      crescent(c, 0, 0, 17 * g, 19 * g, -7, 0, 1, PL.c, 0, 1, true, false, 1, 0);
      crescent(c, 1, 0, 16 * g, 17 * g, -4, 0, 1, PL.c2, 0.08, 0.92, true, false, 1, 0);
      crescent(c, 1, 0, 15 * g, 14 * g, -2, 0, 1, '#ffffff', 0.18, 0.82, true, false, 1, 0);
    } finally { c.restore(); c.globalAlpha = 1; }
  }
  // Phi Thương: cây thương bay theo hướng ném; cắm thì rung, bay về thì xoay vòng.
  // 14/10 (vũ khí cũ còn sót, mục 2): vẽ bằng ô zed-vk 'thuong' đúng cấp (và màu hệ) của cây thương đã ném, xoay theo hướng bay (như phi tiêu
  // ở js/fx_dan.js), cỡ như trên tay Zed (hệ số vk_tl của bộ zed-moi). Ảnh chưa tải xong: không vẽ gì. (15/10 don-tep B: bỏ giáo tre cũ của ?vkcu=1.)
  const TL_THUONG = 0.35249; // zed-moi.sprite.json dong_tac.*_thuong.vk_tl: cấp Trắng dài ≈ 40 điểm ảnh game
  function drawSpear(c, o) {
    const q = o.q;
    if (q.done) { q.gone = true; return; }
    const t = K.S().t, v = scr(q);
    let ang = Math.atan2(v[1], v[0]), x = q.x, y = q.y - 12;
    if (q.phase === 'stick') { ang += ((18 * Math.sign(v[0] || 1) + Math.sin(t * 60) * 4 * Math.max(0, q.stick - 0.3)) * Math.PI) / 180; y += 4; }
    else if (q.phase === 'back') ang += (((t * 1100) % 360) * Math.PI) / 180;
    let a = null;
    try { a = G.vkMoi && G.vkMoi.anhO ? G.vkMoi.anhO(q.w, 'spear') : null; } catch (e) { a = null; }
    if (!a) return;
    if (q.phase !== 'back') p(c, Math.round(x - v[0] * 20) - 8, Math.round(q.y) - 1, 16, 2, 'rgba(0,0,0,0.25)'); // bóng
    const w = a.w * TL_THUONG, h = a.h * TL_THUONG;
    c.save();
    try {
      c.imageSmoothingEnabled = false;
      // bay / cắm: mũi (mép phải ô) nằm ở chỗ đang bay; bay về: xoay quanh giữa thân
      c.translate(Math.round(x), Math.round(y)); c.rotate(ang);
      c.drawImage(a.img, a.x, a.y, a.w, a.h, q.phase === 'back' ? -w / 2 : -w + 2, -h / 2, w, h);
    } finally { c.restore(); }
  }
  // Địa Chấn: vết nứt mảnh chạy trước (báo trước), rồi đất trồi lên đuổi theo, để lại rãnh nứt
  function drawCrack(c, o) {
    const q = o.q, t = q.t || 0, PL = pal(q.he ? q.he.el : null), v = scr(q), nx = -v[1], ny = v[0];
    const L = q.len, warn = Math.min(1, t / Math.max(0.01, q.warn)), runL = L * warn, at = q.at || 0;
    const fade = q.done ? Math.max(0, 1 - (K.S().t - q.endAt) / 0.6) : 1;
    if (fade <= 0) { q.gone = true; return; }
    // điểm cách gốc s (trên sàn) dọc vệt, lệch ngang w cho vết nứt gãy khúc
    const pt = (s, j) => { const w = (hash(q.sd + Math.floor(s / 5)) - 0.5) * 4 * (j || 1); return [q.x0 + q.ux * s + nx * w, q.y0 + q.uy * s * zk() + ny * w]; };
    // vệt nứt mảnh (báo trước): nét đứt tối chạy rất nhanh tới cuối vệt
    for (let s = 0; s < runL; s += 3) { const a = pt(s); p(c, Math.round(a[0]), Math.round(a[1]), 2, 1, s > at ? 'rgba(30,18,12,0.85)' : 'rgba(20,12,8,0.9)'); }
    // Đợt 3: ảnh hu-nut-dat (một đoạn đất nứt, đá bắn lên rồi bụi tan) lặp từng đoạn dọc rãnh, mỗi đoạn bắt đầu khi đầu sóng đất đi qua;
    // phát xong giữ khung cuối (vết nứt mờ) tới khi rãnh tan. Ánh trắng trong khe nhuộm màu hệ. Thay rãnh và đá trồi vẽ code.
    if (d3('hu-nut-dat')) {
      const A = G.fxAnh, a = A.get('hu-nut-dat'), now = K.S().t, SEG = 18, hg = K.huongAnh(v[0], v[1]);
      const seg = q.fxSeg || (q.fxSeg = []);
      for (let i = 0; i * SEG < L; i++) {
        if (seg[i] == null) { if (t >= q.warn && at >= i * SEG) seg[i] = now; else break; }
        const s = Math.min(L, i * SEG + SEG / 2), w = (hash(q.sd + i * 3) - 0.5) * 3;
        A.ve(c, 'hu-nut-dat', q.x0 + q.ux * s + nx * w, q.y0 + q.uy * s * zk() + ny * w, Math.min(now - seg[i], a.giay * 0.999), hg.goc, 0.8 + 0.25 * hash(q.sd + i), hg.f < 0 ? !(i & 1) : !!(i & 1), fade, q.he ? PL.c : null, 'sang');
      }
      return;
    }
    // rãnh đã trồi: rộng, viền màu hệ
    c.globalAlpha = fade;
    for (let s = 0; s < at; s += 2) {
      const a = pt(s, 1.6), wd = 2 + Math.round(hash(q.sd + s) * 2);
      p(c, Math.round(a[0] - nx * wd), Math.round(a[1] - ny * wd), 2, 2, '#1a120c');
      p(c, Math.round(a[0] + nx * wd), Math.round(a[1] + ny * wd), 2, 2, '#1a120c');
      if ((s & 7) === 0) p(c, Math.round(a[0]), Math.round(a[1]) - 1, 2, 1, q.he ? PL.c : '#b8a890');
    }
    // đá trồi ở đầu sóng đất
    if (!q.done && t >= q.warn) {
      for (let i = 0; i < 4; i++) {
        const s = at - i * 7;
        if (s < 0) break;
        const a = pt(s), h = Math.round((10 - i * 2.2) * (0.8 + 0.4 * hash(q.sd + i + Math.floor(at))));
        for (const sd of [-1, 1]) {
          const bx = Math.round(a[0] + nx * sd * (5 + i)), by = Math.round(a[1] + ny * sd * (5 + i));
          p(c, bx - 2, by - h, 4, h, q.he ? PL.d : '#6a5a4a'); p(c, bx - 1, by - h, 2, h - 1, q.he ? PL.c : '#b8a890'); p(c, bx - 1, by - h - 1, 1, 2, '#ffffff');
        }
      }
    }
    c.globalAlpha = 1;
  }
  const SPDRAW = { cres: [drawCres, 1], spear: [drawSpear, 1], crack: [drawCrack, 0] };
  function stepSp(W, tick) {
    const list = W.mvSp;
    if (!list) return;
    for (const q of list) {
      if (!q.fxOn) { q.fxOn = 1; q.sd = R() * 100; const d = SPDRAW[q.kind]; if (d) add({ ty: 'he', x: q.x, y: q.y, t: 30, ly: d[1], draw: (c, o) => { if (o.q.gone) { o.t = 0; return; } d[0](c, o); }, q }); }
      if (!tick) continue;
      const PL = pal(q.he ? q.he.el : null), v = scr(q);
      if (q.kind === 'cres') {
        for (let i = 0; i < 2; i++) streak(q.x - v[0] * rr(4, 12) + v[1] * rr(-12, 12), q.y - 12 - v[1] * rr(4, 12) - v[0] * rr(-12, 12), -v[0] * rr(40, 90), -v[1] * rr(40, 90), rr(0.12, 0.2), PL.ramp, 1, rr(6, 12), 0, 2);
        if (q.he) emit(q.he.el === 'fire' ? 9 : q.he.el === 'ice' ? 4 : 5, q.x + rr(-6, 6), q.y - 12 + rr(-8, 8), rr(-20, 20), rr(-40, -10), rr(0.25, 0.45), PL.ramp, 2, q.he.el === 'fire' ? -20 : 120, 0, q.y + 2, 1);
      } else if (q.kind === 'spear' && q.phase !== 'stick') {
        streak(q.x - v[0] * 10, q.y - 12 - v[1] * 10, -v[0] * 60, -v[1] * 60, 0.14, PL.ramp, 1, 10, 0, 2);
      } else if (q.kind === 'crack' && (q.t || 0) >= q.warn && !q.done) {
        const a = [q.x0 + q.ux * q.at, q.y0 + q.uy * q.at * zk()];
        emit(2, a[0] + rr(-4, 4), a[1] + rr(-3, 3), rr(-30, 30), rr(-30, -10), rr(0.3, 0.5), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
        emit(8, a[0], a[1], rr(-50, 50), rr(-160, -80), rr(0.4, 0.7), q.he && R() < 0.5 ? PL.ramp : RAMP.rock, 2, 420, 0, a[1] + rr(-2, 4), 1);
      }
    }
  }
  api('spCast', (P, type, q, el) => {
    const PL = pal(el), h = hand(P), v = q ? scr(q) : [P.face, 0];
    if (type === 'sword') {
      // Ảnh AI hu-ra-chieu (chớp linh khí lúc tung chiêu; mép trái của hình là tay, chĩa theo hướng chiêu): thay chớp sáng và vòng sóng ở tay; vệt gió, bụi giữ nguyên
      const maC = K.anhHe('hu-ra-chieu', el);
      if (!maC || !K.anhHuong(maC, h.x - v[0] * 4, h.y - v[1] * 4, v[0], v[1], { sc: 0.85 })) {
        add({ ty: 'flash', x: h.x + v[0] * 10, y: h.y + v[1] * 10, r: 10, t: 0.12, c: '#ffffff', c2: PL.c2, ly: 1 });
        addRing(h.x + v[0] * 6, h.y + v[1] * 6, 3, 20, 0.2, PL.c2, 2, 1);
      }
      for (let i = 0; i < 6; i++) streak(h.x, h.y, v[0] * rr(140, 240) + v[1] * rr(-30, 30), v[1] * rr(140, 240) - v[0] * rr(-30, 30), rr(0.12, 0.2), PL.ramp, 1, rr(8, 14), 0, 3);
      for (let i = 0; i < 4; i++) emit(2, P.x - v[0] * rr(2, 8), P.y + rr(-2, 2), -v[0] * rr(30, 70), rr(-14, -4), rr(0.3, 0.5), RAMP.dust, 3, 0, 3, null, 1);
      kick(-v[0] * 2, -v[1] * 2); trauma(0.2); K.stop(40);
    } else if (type === 'spear') {
      const maC = K.anhHe('hu-ra-chieu', el); // giáo: cùng ảnh ra chiêu, nhỏ hơn kiếm một chút như hình code
      if (!maC || !K.anhHuong(maC, h.x - v[0] * 4, h.y - v[1] * 4, v[0], v[1], { sc: 0.7 })) {
        add({ ty: 'flash', x: h.x + v[0] * 8, y: h.y + v[1] * 8, r: 8, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
        addRing(h.x, h.y, 2, 16, 0.18, PL.c2, 2, 1);
      }
      for (let i = 0; i < 5; i++) streak(h.x, h.y, v[0] * rr(160, 260), v[1] * rr(160, 260), rr(0.1, 0.18), PL.ramp, 1, rr(8, 12), 0, 3);
      kick(v[0] * 1.5, v[1] * 1.5); trauma(0.14);
    } else if (type === 'hammer') {
      // bua-khop-2: Zed còn đang giơ búa lúc bấm → bụi + vết nứt chờ tới khung búa chạm đất, đặt dưới đầu búa (heStep). Cờ ?buakhop=0: như cũ.
      if (K.buaKhop && K.buaKhop() && K.dauBuaDb && K.dauBuaDb(P)) choDC = { P, el, t: 0 };
      else K.slam(P.x, P.y, 26, el, 1.4);
      addRing(P.x, P.y, 6, 30, 0.26, PL.c, 3, 0);
      addRing(P.x + v[0] * 12, P.y + v[1] * 10, 3, 16, 0.2, '#ffffff', 2, 0, 0.04);
      trauma(0.5); kick(0, 3); K.stop(60);
    }
  });
  api('spPin', (q) => {
    const PL = pal(q.he ? q.he.el : null), y = q.y - 12;
    // Đợt 3: ảnh hu-va-cham (sao va chạm, mảnh văng theo hướng giáo bay) thay chớp sáng; nhuộm hệ của giáo
    const vq = scr(q);
    if (!(d3('hu-va-cham') && K.anhHuong('hu-va-cham', q.x, y, vq[0], vq[1], { sc: q.pin ? 1.3 : 1, mau: mauHe(q.he && q.he.el) })))
      add({ ty: 'flash', x: q.x, y, r: 10, t: 0.12, c: '#ffffff', c2: PL.c2, ly: 1, sq: true });
    addRing(q.x, q.y, 3, 18, 0.24, PL.c2, 2, 0);
    for (let i = 0; i < 8; i++) { const a = R() * TAU, vv = rr(50, 120); emit(8, q.x, y, Math.cos(a) * vv, Math.sin(a) * vv * 0.6 - 40, rr(0.3, 0.55), q.pin ? RAMP.white : RAMP.rock, 2, 320, 0, q.y + rr(-2, 4), 1); }
    trauma(q.pin ? 0.3 : 0.15); if (q.pin) K.stop(70);
  });
  api('spBack', (q) => { addRing(q.x, q.y - 12, 2, 12, 0.18, '#ffffff', 2, 1); });
  api('spCatch', (P, q) => {
    const h = hand(P), PL = pal(q.he ? q.he.el : null);
    add({ ty: 'flash', x: h.x, y: h.y, r: 7, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
    for (let i = 0; i < 5; i++) emit(6, h.x + rr(-6, 6), h.y + rr(-8, 4), 0, -10, rr(0.2, 0.35), PL.ramp, 3, 0, 0, null, 1);
  });
  api('spEnd', (q) => {
    const PL = pal(q.he ? q.he.el : null);
    q.endT = q.t || 0;
    if (q.kind === 'cres') {
      q.gone = true;
      add({ ty: 'flash', x: q.x, y: q.y - 12, r: 9, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
      for (let i = 0; i < 8; i++) { const a = R() * TAU, vv = rr(40, 110); streak(q.x, q.y - 12, Math.cos(a) * vv, Math.sin(a) * vv * 0.7, rr(0.12, 0.22), PL.ramp, 1, rr(4, 8), 0, 3); }
    } else if (q.kind === 'crack') {
      // rãnh nứt còn mờ dần thêm một lúc (vẽ theo q.done), rồi bỏ
      q.endAt = K.S().t;
      puffBits(q);
    }
  });
  function puffBits(q) { for (let i = 0; i < 6; i++) emit(2, q.x0 + q.ux * q.len + rr(-6, 6), q.y0 + q.uy * q.len * zk() + rr(-4, 4), rr(-30, 30), rr(-20, -6), rr(0.4, 0.7), RAMP.dust, 4, 0, 2.5, null, 1); }
  // Cú đấm tay (giáo đang bay): chớp nhỏ trước nắm tay theo hướng nhắm
  api('punch', (P) => {
    const v = P.aimUx != null ? [P.aimUx, P.aimUy] : [P.face, 0], x = P.x + v[0] * 12, y = P.y - 12 + v[1] * 12;
    // Đợt 3: ảnh hu-va-cham (trắng) chĩa theo hướng đấm thay chớp và tia vẽ code
    if (d3('hu-va-cham') && K.anhHuong('hu-va-cham', x, y, v[0], v[1], { sc: 0.8 })) { kick(v[0], v[1]); return; }
    add({ ty: 'flash', x, y, r: 5, t: 0.08, c: '#ffffff', c2: '#ffe9a3', ly: 1 });
    for (let i = 0; i < 3; i++) streak(x, y, v[0] * rr(60, 120), v[1] * rr(60, 120), 0.1, RAMP.white, 1, 5, 0, 3);
    kick(v[0], v[1]);
  });

  // ---------- vạch lấy đà trên đầu hero ----------
  function drawCharge(c) {
    const W = G.getWorld(), P = W && W.P, mv = P && P.mv;
    if (!mv || !mv.holding || P.dead) return;
    const w = G.curW(P), cfg = G.MOVES[w.type], ch = cfg && cfg.charge;
    if (!ch) return;
    const S = K.S(), x = Math.round(P.x) - 13, y = Math.round(P.y) - 42 - Math.round(31 * ((G.cotiTo ? G.cotiTo() : 1) - 1)), BW = 26; // cu-ti-to-muot: Tí cao ~31 điểm ảnh, to ×K thì vạch nhích lên
    const full = mv.charge >= 1, blink = full && ((S.t * 12) | 0) % 2;
    // 16/10 vẽ tay 6: vạch lấy đà vẽ code bị chặn → vòng tụ lực hu-tu-luc-vong ở đúng chỗ vạch (trên đầu, rộng ~26 như vạch): đang lấy đà
    // thì vòng co dần theo mức đà (khung 1–4), đầy thì nảy sáng (khung 4–6 lặp) nhấp nháy vàng; màu như vạch cũ.
    if (G.chanVe > 0 && G.fxAnh && G.fxAnh.co('hu-tu-luc-vong')) {
      const f = full ? 3 + (((S.t * 12) | 0) % 3) : Math.min(3, Math.floor(mv.charge * 4));
      G.fxAnh.veK(c, 'hu-tu-luc-vong', P.x, y + 2, f, 0, 26 / 36, false, 1, full ? (blink ? '#ffffff' : '#ffd23f') : mv.level >= 1 ? '#ffb347' : '#e8e2d0');
      return;
    }
    p(c, x - 1, y - 1, BW + 2, 6, '#140d0e');
    p(c, x, y, BW, 4, '#3a2e30');
    const n = Math.round(BW * mv.charge);
    const col = full ? (blink ? '#ffffff' : '#ffd23f') : mv.level >= 1 ? '#ffb347' : '#e8e2d0';
    if (n > 0) { p(c, x, y, n, 4, col); p(c, x, y, n, 1, '#ffffff'); }
    if (ch.lv1 != null) { const m = x + Math.round((BW * ch.lv1) / ch.time); p(c, m, y - 1, 1, 6, '#140d0e'); } // vạch nấc 1 của búa
    if (full) { star(c, x + BW + 3, y + 2, 2, '#ffd23f', '#ffffff'); }
  }
  // ---------- vòng TỤ LỰC dưới chân Zed (ảnh hu-tu-luc, lớp mặt đất: vẽ trước người) ----------
  // Ảnh trắng-xám, nhuộm theo hệ vũ khí đang cầm (bảng PAL của js/fx.js: không hệ giữ trắng, Lửa cam, Độc xanh chanh, Băng xanh nhạt):
  // nhân màu hệ rồi cộng lại một phần ảnh gốc để lõi còn sáng. Tấm nhuộm làm MỘT lần cho mỗi màu rồi dùng lại (không tạo canvas mỗi khung).
  // Cỡ theo nấc lấy đà: chưa tới nấc 1 → 0,8; nấc 1 → 1; đầy → 1,2 (to dần êm). Đầy nấc thêm một lớp ánh vàng nhấp nháy như code cũ.
  // Vũ khí chỉ có một nấc (giáo, phi tiêu): nửa đà coi như nấc 1. Hiện từ lúc đà bắt đầu tính (chargeT ≥ 0), không hiện lúc bấm nhanh.
  const TL_MAU = { fire: PAL_C('fire'), poison: PAL_C('poison'), ice: PAL_C('ice'), gold: '#ffd23f' };
  function PAL_C(el) { return pal(el).c; }
  const TL_GIU = 0.25, TL_CO = [0.8, 1, 1.2];
  const TL_NHUOM = new Map();
  const TL = { t0: -1, co: 0.8, tPrev: 0 };
  function tamNhuom(a, key) {
    if (key === 'none') return a.img;
    let o = TL_NHUOM.get(key);
    if (o && o.img === a.img) return o.cv;
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = a.img.width; cv.height = a.img.height;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(a.img, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = TL_MAU[key]; g.fillRect(0, 0, cv.width, cv.height);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(a.img, 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = TL_GIU;
    g.drawImage(a.img, 0, 0);
    o = { img: a.img, cv };
    TL_NHUOM.set(key, o);
    return cv;
  }
  function veTuLuc(c, a, key, x, y, t, co, mo) {
    const src = tamNhuom(a, key);
    if (!src) return;
    const f = G.fxAnh.khung(a, t);
    if (f < 0) return;
    const n = a.net, sw = a.fw * n, sh = a.fh * n, s = a.co * co;
    c.save();
    try {
      c.translate(Math.round(x), Math.round(y));
      c.scale(s, s);
      c.imageSmoothingEnabled = false;
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha *= mo;
      c.drawImage(src, (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, -a.ax, -a.ay, a.fw, a.fh);
    } finally { c.restore(); }
  }
  function drawTuLuc(c) {
    const W = G.getWorld(), P = W && W.P, mv = P && P.mv, S = K.S();
    if (!S || !mv || !mv.holding || P.dead || !(mv.chargeT >= 0) || !G.tuLuc()) { TL.t0 = -1; return; }
    const w = G.curW(P), cfg = G.MOVES && G.MOVES[w.type], ch = cfg && cfg.charge;
    if (!ch) { TL.t0 = -1; return; }
    const a = G.fxAnh.get('hu-tu-luc');
    if (!a) return;
    const full = mv.charge >= 1, nac = full ? 2 : (ch.lv1 != null ? mv.level >= 1 : mv.charge >= 0.5) ? 1 : 0;
    if (TL.t0 < 0) { TL.t0 = S.t; TL.co = TL_CO[nac]; TL.tPrev = S.t; }
    const dt = Math.max(0, Math.min(0.1, S.t - TL.tPrev)); TL.tPrev = S.t;
    TL.co += (TL_CO[nac] - TL.co) * Math.min(1, dt * 12);
    const t = S.t - TL.t0, el = G.activeEl ? G.activeEl(P, w) : null, key = TL_MAU[el] ? el : 'none';
    const mo = Math.min(1, 0.35 + t * 5) * 0.9;
    veTuLuc(c, a, key, P.x, P.y, t, TL.co, mo);
    if (full) veTuLuc(c, a, 'gold', P.x, P.y, t, TL.co, 0.45 + 0.3 * (((S.t * 12) | 0) % 2));
  }
  const ground0 = fx.drawGround;
  fx.drawGround = function (c) {
    if (ground0) ground0(c);
    if (G.noRender) return;
    try { drawTuLuc(c); } catch (e) { fail(e); }
  };
  const over0 = fx.drawOver;
  fx.drawOver = function (c) {
    over0(c);
    if (G.noRender) return;
    try { drawCharge(c); } catch (e) { fail(e); }
  };
})();
