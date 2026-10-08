// Hiệu ứng ra chiêu theo lối đánh của từng vũ khí và theo hệ (Lửa, Độc, Băng).
// Chỉ là hình ảnh: đọc trạng thái game, không ghi trường nào của luật chơi. Dùng chung kho hạt của fx.js.
(function () {
  const G = window.G, fx = G.fx;
  if (!fx || !fx.kit) return;
  const K = fx.kit;
  const { api, fail, emit, streak, add, addRing, trauma, kick, pal, RAMP, R, rr, p, star, crescent, hand } = K;

  // ---------- vệt đòn theo lối đánh ----------
  const baseSwing = fx.swing;
  // o: { type, move, step, combo, reach, depth, el, lv, stage, charge, level }
  api('mvSwing', (P, o) => {
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
      const h = hand(P), c = o.charge || 0;
      add({ ty: 'flash', x: h.x + f * 6, y: h.y, r: 6 + 4 * c, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
      addRing(h.x + f * 4, h.y, 2, 10 + 8 * c, 0.18, PL.c2, 2, 1);
      for (let i = 0; i < 4 + 4 * c; i++) streak(h.x, h.y + rr(-5, 5), f * rr(120, 240), rr(-20, 20), rr(0.1, 0.2), PL.ramp, 1, rr(6, 12), 0, 3);
      kick(-f * (1 + 1.5 * c), 0);
      if (c >= 1) trauma(0.15);
      return;
    }
    baseSwing(P, o);
  });
  // Vừa lên một nấc lấy đà: vòng sáng và lấp lánh ở tay
  api('mvCharge', (P, level) => {
    const h = hand(P), w = G.curW(P), PL = pal(G.activeEl(P, w));
    addRing(h.x, h.y - 4, 3, 13 + level * 3, 0.2, level >= 2 ? '#ffd23f' : PL.c2, 2, 1);
    add({ ty: 'flash', x: h.x, y: h.y - 4, r: 5 + level * 2, t: 0.1, c: '#ffffff', c2: level >= 2 ? '#ffd23f' : PL.c2, ly: 1 });
    for (let i = 0; i < 5; i++) emit(6, h.x + rr(-8, 8), h.y + rr(-12, 4), 0, -8, rr(0.2, 0.4), level >= 2 ? RAMP.gold : PL.ramp, 3, 0, 0, null, 1);
  });

  // ---------- mỗi khung: hạt lúc lấy đà ----------
  fx.heStep = function (W, dt, tick) {
    const P = W.P, mv = P.mv;
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
