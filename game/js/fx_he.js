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
  const NUM = [0, 5, 7, 9]; // số chi tiết trang trí theo mốc Mầm, Thành hình, Thức tỉnh

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

  // ---------- LỬA: lưỡi lửa bám dọc vệt đòn, tàn lửa bay ----------
  function drawFlames(c, o, k) {
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
  const VENOM = ['#e6ffc0', '#c2f58a', '#6fcf3a', '#9a5fd6', '#6a3fa0', '#3f2a66'];
  const PURPLE = ['#e2c8ff', '#b98af0', '#9a5fd6', '#6a3fa0'];
  function drawDrips(c, o, k) {
    const sh = o.sh, n = o.n;
    const grow = Math.min(1, k * 2.4);
    // viền tím chạy dọc vệt đòn
    if (k < 0.7) for (let i = 0; i < n * 2; i++) {
      const u = (i + 0.5) / (n * 2);
      if (u > k * 4 + 0.15 || (k > 0.4 && (i & 1))) continue;
      const q = pt(sh, u);
      p(c, Math.round(q.x + q.nx * 3), Math.round(q.y + q.ny * 2), 4, 2, i % 3 ? '#9a5fd6' : '#b98af0');
    }
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      if (u > k * 4 + 0.15) continue;
      if (k > 0.75 && (i & 1)) continue;
      const q = pt(sh, u);
      const L = Math.round((3 + hash(o.sd + i) * o.h0) * grow), x = Math.round(q.x), y = Math.round(q.y) + Math.round(k * 4);
      p(c, x, y, i % 2 ? 1 : 2, L, i % 3 === 1 ? '#9a5fd6' : '#6fcf3a');
      p(c, x - (L > 4 ? 1 : 0), y + L, L > 4 ? 3 : 2, 2, i % 3 === 1 ? '#b98af0' : '#c2f58a'); // giọt nặng ở đầu
    }
  }
  function poisonSwing(sh, lv, big) {
    const n = (sh.kind === 'round' ? NUM[lv] + 5 : NUM[lv]) + (big ? 2 : 0);
    add({ ty: 'he', x: sh.x, y: sh.y, t: big ? 0.42 : 0.34, ly: 1, draw: drawDrips, sh, n, h0: 3 + lv * 2 + (big ? 2 : 0), sd: R() * 100 });
    const m = 1 + lv + (big ? 2 : 0), gy = sh.y + (sh.kind === 'round' ? 9 : 14);
    for (let i = 0; i < m; i++) {
      const q = pt(sh, R());
      emit(5, q.x, q.y, sh.f * rr(0, 30), rr(-20, 30), rr(0.4, 0.7), i % 3 === 1 ? PURPLE : RAMP.poison, 2, 300, 0, gy + rr(-3, 4), 1); // giọt rơi xuống đất
      if (i % 2 === 0) emit(11, q.x + rr(-3, 3), q.y + rr(-3, 3), rr(-4, 4), rr(-20, -8), rr(0.4, 0.7), RAMP.poison, 2, 0, 0, null, 1);
    }
  }
  // ---------- BĂNG: vệt trắng xanh gãy góc, sắc cạnh, mảnh băng văng ----------
  function drawIce(c, o, k) {
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
    for (let i = 0; i < o.n; i++) {
      const born = i * 0.028, a = age - born;
      if (a <= 0) continue;
      const g = a < 0.09 ? a / 0.09 : o.t < 0.2 ? o.t / 0.2 : 1;
      let x, y;
      if (o.round) { const an = (i / o.n) * TAU + o.sd; const d = 0.45 + hash(o.sd + i * 3) * 0.55; x = o.x + Math.cos(an) * o.L * 0.75 * d; y = o.y + Math.sin(an) * o.L * 0.45 * d; }
      else { x = o.x + o.dir * (4 + (i / o.n) * o.L); y = o.y + (hash(o.sd + i * 5) - 0.5) * o.depth; }
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
  api('mvSwing', (P, o) => { swing(P, o); decorate(P, o); });
  function swing(P, o) {
    const f = P.face, PL = pal(o.el);
    if (o.move === 'luot') {
      // nhát lướt sau khi né: lưỡi liềm rộng quét ngang và vệt gió
      add({ ty: 'cres', x: P.x + f * 6, y: P.y - 12, f, ra: o.reach * 0.9, rb: 11, off: 9, oy: 0, vert: false, rev: false, pl: PL, t: 0.2, big: true, st: o.stage, ly: 1, back: o.reach * 0.5 });
      for (let i = 0; i < 6; i++) streak(P.x - f * rr(0, 10), P.y - rr(4, 22), -f * rr(60, 140), 0, rr(0.12, 0.2), PL.ramp, 1, rr(8, 14), 0, 2);
      kick(f * 1.5, 0);
      return;
    }
    if (o.move === 'banManh') {
      // buông dây cung đã căng: chớp sáng ở cung, vòng gió, giật lùi
      // Sửa góp ý 1: chớp sáng, vòng gió và vệt gió đi theo hướng ngắm thật (P.aimUx, P.aimUy), không chỉ nằm ngang.
      const h = hand(P), c = o.charge || 0, ux = P.aimUx != null ? P.aimUx : f, uy = P.aimUy || 0;
      add({ ty: 'flash', x: h.x + ux * 6, y: h.y + uy * 6, r: 6 + 4 * c, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
      addRing(h.x + ux * 4, h.y + uy * 4, 2, 10 + 8 * c, 0.18, PL.c2, 2, 1);
      for (let i = 0; i < 4 + 4 * c; i++) { const v = rr(120, 240), q = rr(-20, 20), j = rr(-5, 5); streak(h.x - uy * j, h.y + ux * j, ux * v - uy * q, uy * v + ux * q, rr(0.1, 0.2), PL.ramp, 1, rr(6, 12), 0, 3); }
      kick(-ux * (1 + 1.5 * c), -uy * (1 + 1.5 * c));
      if (c >= 1) trauma(0.15);
      return;
    }
    if (o.move === 'quet') {
      // giáo quét một vòng: lưỡi liềm lớn phía trước, một vệt phía sau, vòng bụi dưới chân
      const R0 = o.reach;
      add({ ty: 'cres', x: P.x + f * 2, y: P.y - 11, f, ra: R0 * 1.05, rb: 13, off: 12, oy: 0, vert: false, rev: false, pl: PL, t: 0.26, big: true, st: o.stage, ly: 1, back: R0 * 0.3 });
      add({ ty: 'cres', x: P.x - f * 2, y: P.y - 9, f: -f, ra: R0 * 0.95, rb: 10, off: 11, oy: 0, vert: false, rev: true, pl: PL, t: 0.22, big: false, st: o.stage, ly: 1, back: R0 * 0.3, d: 0.05 });
      addRing(P.x, P.y, 6, R0, 0.26, PL.c2, 2, 0);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 + rr(-0.2, 0.2); emit(2, P.x + Math.cos(a) * R0 * 0.6, P.y + Math.sin(a) * R0 * 0.36, Math.cos(a) * 40, Math.sin(a) * 20 - 6, rr(0.25, 0.45), RAMP.dust, 3, 0, 3, null, 0); }
      kick(f * 1.5, 0); trauma(0.14);
      return;
    }
    if (o.move === 'xoc') { fx.dash(P, 'spear', o.el); return; }
    if (o.move === 'nenDat') {
      // búa nện sau khi lấy đà: vệt bổ xuống, đất nứt, vòng sóng; nấc 2 to và rung mạnh hơn
      const big = o.level >= 2;
      add({ ty: 'cres', x: P.x + f * 4, y: P.y - 17, f, ra: 30, rb: 28, off: 10, oy: -5, vert: true, rev: false, pl: PL, t: 0.2, big: true, st: o.stage, ly: 1 });
      K.slam(o.x, o.y, o.r * 0.8, o.el, big ? 1.5 : 1);
      addRing(o.x, o.y, 6, o.r, 0.28, PL.c, big ? 4 : 3, 0);
      if (big) {
        addRing(o.x, o.y, 3, o.r * 1.15, 0.36, '#ffffff', 2, 0, 0.05);
        for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + rr(-0.3, 0.3); add({ ty: 'crack', x: o.x + Math.cos(a) * o.r * 0.6, y: o.y + Math.sin(a) * o.r * 0.36, r: 8, t: 1.3, c: o.el ? PL.d : '#3a2e26', ly: 0, sd: R() * 100 }); }
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
        // vệt lửa chạy dọc đường lao: các cột lửa nối nhau phụt lên
        o.pts.forEach((x, i) => {
          add({ ty: 'pillar', x, y: o.y, w: 4 + lv, h: 16 + lv * 5, t: 0.3, ly: 1, d: i * 0.035 });
          for (let j = 0; j < 2; j++) emit(0, x, o.y - 4, rr(-50, 50), rr(-150, -70), rr(0.4, 0.7), RAMP.ember, 1, 260, 0, o.y + rr(-3, 5), 1);
        });
        add({ ty: 'scorch', x: o.x + (o.dir * o.line) / 2, y: o.y, r: Math.min(30, o.line * 0.4), t: 1.6, ly: 0 });
        trauma(0.2);
        return;
      }
      K.blastFire(o.x, o.y, o.r, Math.min(1.2, (0.4 + 0.13 * lv) * Math.sqrt(o.power)));
      trauma(0.16 + 0.07 * lv); kick(o.dir, 1);
    },
    poison(lv, o) {
      // nước độc toé ra rồi khói bốc lên (màn khói lơ lửng do vũng tự nhả ở heStep)
      const xs = o.pts.length ? o.pts : [o.x];
      for (const x of xs) {
        addRing(x, o.y, 4, o.r, 0.34, '#c2f58a', 2, 0);
        addRing(x, o.y, 2, o.r * 0.7, 0.3, '#9a5fd6', 2, 0, 0.06);
        const n = 4 + lv * 2;
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + rr(-1.3, 1.3), v = rr(50, 130); emit(5, x, o.y - 4, Math.cos(a) * v, Math.sin(a) * v, rr(0.4, 0.75), i % 3 ? RAMP.poison : PURPLE, 2, 380, 0, o.y + rr(-6, 8), 1); }
        for (let i = 0; i < 3 + lv; i++) { const a = R() * TAU, v = rr(10, o.r * 1.2); emit(2, x, o.y - 8, Math.cos(a) * v, Math.sin(a) * v * 0.4 - 8, rr(0.6, 1.1), RAMP.vapor, R() < 0.5 ? 6 : 4, -6, 2.2, null, 1); }
      }
    },
    ice(lv, o) {
      const L = o.r, n = Math.max(4, Math.round(L / 6)) + (o.round ? 3 : 0);
      add({ ty: 'he', x: o.x, y: o.y, t: 0.75 + lv * 0.1, ly: 1, draw: drawSpikes, n, L, dir: o.dir, round: o.round, depth: 16, h0: 6 + lv * 2.5, sd: R() * 50 });
      const mx = o.round ? o.x : o.x + (o.dir * L) / 2;
      addRing(mx, o.y, 4, o.round ? L * 0.75 : L * 0.55, 0.26, '#e9f9ff', 2, 0);
      for (let i = 0; i < 4 + lv * 2; i++) { const u = R(), x = o.round ? o.x + rr(-L, L) * 0.6 : o.x + o.dir * L * u; emit(4, x, o.y - rr(4, 14), o.dir * rr(-20, 70), rr(-110, -40), rr(0.35, 0.65), RAMP.ice, R() < 0.4 ? 2 : 1, 300, 0, o.y + rr(-4, 6), 1); }
      for (let i = 0; i < 3 + lv; i++) { const x = o.round ? o.x + rr(-L, L) * 0.6 : o.x + o.dir * L * R(); emit(2, x, o.y - 1, rr(-14, 14), rr(-8, 0), rr(0.5, 0.9), RAMP.mist, 4, 0, 1.5, null, 0); }
      trauma(0.12 + 0.05 * lv);
    },
  };
  // Lớp băng trên một con quái đang đóng băng vỡ tung: mảnh sắc văng ra bốn phía tới bán kính r
  api('heShatter', (e, r) => {
    const B = K.bodyOf(e), y = e.y - B.h * 0.5;
    add({ ty: 'flash', x: e.x, y, r: 11, t: 0.12, c: '#ffffff', c2: '#bfeaff', ly: 1, sq: true });
    addRing(e.x, e.y, 5, r, 0.28, '#e9f9ff', 3, 0);
    addRing(e.x, y, 3, B.w + 14, 0.2, '#ffffff', 2, 1);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + rr(-0.2, 0.2), v = rr(110, 200); streak(e.x + Math.cos(a) * 4, y + Math.sin(a) * 4, Math.cos(a) * v, Math.sin(a) * v * 0.6, rr(0.16, 0.26), RAMP.ice, i % 3 === 0 ? 2 : 1, rr(6, 11), 0, 3); }
    for (let i = 0; i < 10; i++) { const a = R() * TAU, v = rr(50, 150); emit(i % 3 ? 4 : 8, e.x + rr(-B.w, B.w), e.y - rr(2, B.h), Math.cos(a) * v, Math.sin(a) * v * 0.6 - 50, rr(0.4, 0.75), RAMP.ice, i % 3 ? 2 : 3, 320, 0, e.y + rr(-3, 5), 1); }
    for (let i = 0; i < 4; i++) emit(2, e.x + rr(-6, 6), y + rr(-6, 6), rr(-24, 24), rr(-20, -4), rr(0.4, 0.7), RAMP.mist, 4, 0, 2, null, 1);
    trauma(0.35); K.stop(70);
  });
  // Nổ lan (đặc trưng 2 của Lửa): quái đang cháy chết thì nổ tung, lưỡi lửa liếm sang quái đứng gần trong bán kính r
  api('heBoom', (e, r, n) => {
    const y = e.y - Math.min(14, (e.h || 24) * 0.5);
    K.blastFire(e.x, e.y, r, n > 0 ? 0.95 : 0.7);
    addRing(e.x, e.y, 5, r, 0.26, '#ffd23f', 3, 0);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + rr(-0.2, 0.2), v = rr(90, 160); streak(e.x + Math.cos(a) * 4, y + Math.sin(a) * 3, Math.cos(a) * v, Math.sin(a) * v * 0.6, rr(0.14, 0.22), RAMP.fire, i % 3 === 0 ? 2 : 1, rr(6, 10), 0, 3); }
    add({ ty: 'scorch', x: e.x, y: e.y, r: Math.min(22, r * 0.6), t: 1.4, ly: 0 });
    trauma(0.22);
  });
  // Độc lây từ quái vừa chết sang quái gần: các giọt độc bắn sang từng con
  api('heSpread', (e, list) => {
    const y0 = e.y - Math.min(16, (e.h || 24) * 0.5);
    addRing(e.x, e.y, 4, 30, 0.32, '#9a5fd6', 2, 0);
    for (let i = 0; i < Math.min(5, list.length); i++) {
      const t = list[i], ty = t.y - Math.min(16, (t.h || 24) * 0.5), T0 = 0.22;
      for (let j = 0; j < 3; j++) { const o = emit(1, e.x, y0, (t.x - e.x) / T0 + rr(-12, 12), (ty - y0) / T0 + rr(-12, 12), T0 + j * 0.03, j === 1 ? PURPLE : RAMP.poison, 3, 0, 0, null, 1); o.t0 = o.t * 1.6; }
      addRing(t.x, ty, 2, 9, 0.2, '#c2f58a', 2, 1, T0);
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
      addRing(o.x, y, 2, o.big ? 15 : 10, 0.2, '#9a5fd6', 2, 1);
      const n = (o.big ? 7 : 4) + lv;
      for (let i = 0; i < n; i++) emit(5, o.x, y, o.dir * rr(-20, 80), rr(-90, -10), rr(0.4, 0.7), i % 3 ? RAMP.poison : PURPLE, 2, 320, 0, o.y + rr(-3, 5), 1);
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
  function drawHeZone(c, z) {
    const S = K.S(), t = S.t, id = z.fxId || 1;
    const k = Math.min(1, (z.fxA || 0) / 0.18);
    if (k <= 0) return;
    const sp = zoneSprite(z.el, z.r), x = Math.round(z.x), y = Math.round(z.y);
    const w = Math.round(sp.w * (0.4 + 0.6 * k)), h = Math.round(sp.h * (0.4 + 0.6 * k));
    const fade = z.life < 0.4;
    if (fade && ((t * 20) | 0) % 2) return; // sắp tắt thì nhấp nháy
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
  api('mvCharge', (P, level) => {
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
  function drawCloud(c, o) {
    const z = o.z;
    if (z.dead || z.life <= 0) return;
    const t = K.S().t, id = z.fxId || 1;
    if (z.life < 0.4 && ((t * 20) | 0) % 2) return;
    const sp = hazeSprite(z.r), x = Math.round(z.x), y = Math.round(z.y) - 12;
    c.drawImage(sp.cv, x - (sp.w >> 1) + Math.round(Math.sin(t * 1.6 + id) * 3), y - (sp.h >> 1));
    c.drawImage(sp.cv, x - (sp.w >> 1) - Math.round(Math.sin(t * 1.1 + id * 2) * 4), y - (sp.h >> 1) - 5);
    c.fillStyle = 'rgba(154,95,214,0.3)';
    for (let i = 0; i < 2; i++) { const px = x + Math.round(Math.sin(t * 0.9 + i * 2.1 + id) * z.r * 0.5), py = y + Math.round(Math.cos(t * 1.3 + i * 1.7 + id) * 4); c.fillRect(px - 4, py - 1, 8, 3); c.fillRect(px - 2, py - 2, 4, 5); }
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
  function drawWave(c, z) {
    const x = Math.round(z.x), y = Math.round(z.y), h = Math.round(z.depth / 2) + 2, f = z.dir;
    const PL = pal(z.he ? z.he.el : null), k = Math.min(1, z.left / 24);
    const top = z.level >= 2 ? 11 : 7;
    // vết nứt kéo dài phía sau gờ sóng
    const back = Math.min(40, Math.abs(z.x - z.x0));
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
  fx.heStep = function (W, dt, tick) {
    const P = W.P, mv = P.mv;
    if (tick) for (const o of W.projs) {
      // vệt hạt sau mũi tên mang hệ
      if (!o.he || o.team !== 'player') continue;
      const y = o.y - (o.z || 10), b = o.x - Math.sign(o.vx) * 6;
      if (o.he.el === 'poison') { emit(5, b, y + 1, -o.vx * 0.03, rr(0, 20), rr(0.35, 0.55), R() < 0.3 ? PURPLE : RAMP.poison, o.big ? 2 : 1, 260, 0, o.y + rr(-1, 3), 1); if (o.big) emit(2, b, y, 0, -8, 0.45, RAMP.vapor, 3, 0, 0, null, 1); }
      else if (o.he.el === 'ice') { emit(R() < 0.5 ? 6 : 4, b + rr(-2, 2), y + rr(-3, 3), -o.vx * 0.02, rr(-6, 14), rr(0.25, 0.45), RAMP.ice, o.big ? 2 : 1, 0, 0, null, 1); if (o.big) emit(2, b, y, 0, -3, 0.4, RAMP.mist, 3, 0, 0, null, 1); }
      else if (o.he.el === 'fire') { emit(9, b, y + rr(-1, 2), -o.vx * 0.06, rr(-30, -10), rr(0.2, 0.35), RAMP.fire, o.big ? 4 : 3, -20, 0, null, 1); if (o.big || o.he.lv >= 3) emit(0, b, y, -o.vx * 0.1 + rr(-20, 20), rr(-60, -20), rr(0.3, 0.5), RAMP.ember, 1, 200, 0, o.y + 2, 1); }
    }
    for (const z of W.zones) {
      if (!z.he || !z.cloud || z.dead) continue;
      // màn khói độc lơ lửng phía trên vũng: một lớp sương mỏng và các cụm khói trôi chậm
      if (!z.fxOn) { z.fxOn = 1; add({ ty: 'he', x: z.x, y: z.y, t: z.life + 0.1, ly: 1, draw: drawCloud, z }); }
      if (tick && R() < 0.4) { const a = R() * TAU, d = Math.sqrt(R()) * z.r * 0.8; emit(2, z.x + Math.cos(a) * d, z.y - rr(6, 20) + Math.sin(a) * d * 0.3, rr(-8, 8), rr(-9, -2), rr(0.7, 1.3), R() < 0.25 ? HAZE_P : RAMP.vapor, R() < 0.5 ? 6 : 4, 0, 0.6, null, 1); }
    }
    if (W.mvShards) for (const q of W.mvShards) {
      // mảnh tên độc: một giọt nhớt bay, kéo theo vệt
      if (!q.fxOn) { q.fxOn = 1; add({ ty: 'he', x: q.x, y: q.y, t: 0.4, ly: 1, draw: drawShard, q }); }
      if (tick) emit(1, q.x, q.y - 10, -q.vx * 0.05, -q.vy * 0.05, 0.22, R() < 0.3 ? PURPLE : RAMP.poison, 2, 0, 0, null, 1);
    }
    if (W.mvWaves) for (const z of W.mvWaves) {
      if (!z.fxOn) { z.fxOn = 1; z.x0 = z.x; add({ ty: 'he', x: z.x, y: z.y, t: z.left / z.v + 0.05, ly: 0, draw: (c, o) => { if (o.z.left > 0) drawWave(c, o.z); }, z }); }
      if (tick) {
        const PL = pal(z.he ? z.he.el : null);
        emit(2, z.x + rr(-3, 3), z.y + rr(-z.depth, z.depth) * 0.5, -z.dir * rr(10, 40), rr(-26, -8), rr(0.25, 0.45), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
        emit(8, z.x, z.y + rr(-z.depth, z.depth) * 0.5, z.dir * rr(-20, 50), rr(-140, -70), rr(0.4, 0.7), z.he && R() < 0.5 ? PL.ramp : RAMP.rock, 2, 420, 0, z.y + rr(-2, 5), 1);
      }
    }
    if (mv && mv.holding && tick && !P.dead) {
      // hạt sáng bị hút về tay, càng đầy càng dày
      const h = hand(P), w = G.curW(P), PL = pal(G.activeEl(P, w));
      if (R() < 0.35 + 0.6 * mv.charge) {
        const a = R() * 6.283, d = rr(12, 20);
        emit(1, h.x + Math.cos(a) * d, h.y - 4 + Math.sin(a) * d * 0.7, -Math.cos(a) * d * 4, -Math.sin(a) * d * 2.8, 0.22, mv.charge >= 1 ? RAMP.gold : PL.ramp, 2, 0, 0, null, 1);
      }
    }
  };

  // ---------- vạch lấy đà trên đầu hero ----------
  function drawCharge(c) {
    const W = G.getWorld(), P = W && W.P, mv = P && P.mv;
    if (!mv || !mv.holding || P.dead) return;
    const w = G.curW(P), cfg = G.MOVES[w.type], ch = cfg && cfg.charge;
    if (!ch) return;
    const S = K.S(), x = Math.round(P.x) - 13, y = Math.round(P.y) - 42, BW = 26;
    const full = mv.charge >= 1, blink = full && ((S.t * 12) | 0) % 2;
    p(c, x - 1, y - 1, BW + 2, 6, '#140d0e');
    p(c, x, y, BW, 4, '#3a2e30');
    const n = Math.round(BW * mv.charge);
    const col = full ? (blink ? '#ffffff' : '#ffd23f') : mv.level >= 1 ? '#ffb347' : '#e8e2d0';
    if (n > 0) { p(c, x, y, n, 4, col); p(c, x, y, n, 1, '#ffffff'); }
    if (ch.lv1 != null) { const m = x + Math.round((BW * ch.lv1) / ch.time); p(c, m, y - 1, 1, 6, '#140d0e'); } // vạch nấc 1 của búa
    if (full) { star(c, x + BW + 3, y + 2, 2, '#ffd23f', '#ffffff'); }
  }
  const over0 = fx.drawOver;
  fx.drawOver = function (c) {
    over0(c);
    if (G.noRender) return;
    try { drawCharge(c); } catch (e) { fail(e); }
  };
})();
