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
    if (o.move === 'quet') {
      // giáo quét một vòng: lưỡi liềm lớn phía trước, một vệt phía sau, vòng bụi dưới chân
      const R0 = o.reach;
      add({ ty: 'cres', x: P.x + f * 2, y: P.y - 11, f, ra: R0 * 1.05, rb: 13, off: 12, oy: 0, vert: false, rev: false, pl: PL, t: 0.26, big: true, st: o.stage, ly: 1, back: R0 * 0.3 });
      add({ ty: 'cres', x: P.x - f * 2, y: P.y - 9, f: -f, ra: R0 * 0.95, rb: 10, off: 11, oy: 0, vert: false, rev: true, pl: PL, t: 0.22, big: false, st: o.stage, ly: 1, back: R0 * 0.3, d: 0.05 });
      addRing(P.x, P.y, 6, R0, 0.26, PL.c2, 2, 0);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + rr(-0.2, 0.2); emit(2, P.x + Math.cos(a) * R0 * 0.6, P.y + Math.sin(a) * R0 * 0.36, Math.cos(a) * 40, Math.sin(a) * 20 - 6, rr(0.25, 0.45), RAMP.dust, 3, 0, 3, null, 0); }
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
  });
  // Vừa lên một nấc lấy đà: vòng sáng và lấp lánh ở tay
  api('mvCharge', (P, level) => {
    const h = hand(P), w = G.curW(P), PL = pal(G.activeEl(P, w));
    addRing(h.x, h.y - 4, 3, 13 + level * 3, 0.2, level >= 2 ? '#ffd23f' : PL.c2, 2, 1);
    add({ ty: 'flash', x: h.x, y: h.y - 4, r: 5 + level * 2, t: 0.1, c: '#ffffff', c2: level >= 2 ? '#ffd23f' : PL.c2, ly: 1 });
    for (let i = 0; i < 5; i++) emit(6, h.x + rr(-8, 8), h.y + rr(-12, 4), 0, -8, rr(0.2, 0.4), level >= 2 ? RAMP.gold : PL.ramp, 3, 0, 0, null, 1);
  });

  // Sóng chấn động của búa: một gờ đất chạy đi, bụi và đá văng hai bên
  function drawWave(c, z) {
    const x = Math.round(z.x), y = Math.round(z.y), h = Math.round(z.depth / 2) + 2, f = z.dir;
    const PL = pal(z.he ? z.he.el : null), k = Math.min(1, z.left / 24);
    const top = z.level >= 2 ? 7 : 5;
    for (let dy = -h; dy <= h; dy += 2) {
      const q = Math.sqrt(Math.max(0, 1 - (dy * dy) / (h * h + 1))), bx = x - Math.round(f * (1 - q) * 9);
      const up = Math.round(top * q * k);
      p(c, bx - f * 4 - (f < 0 ? 0 : 3), y + dy, 7, 2, 'rgba(20,14,12,0.45)');
      if (up > 0) { p(c, bx - 1, y + dy - up, 3, up + 1, z.he ? PL.d : '#6a5a4a'); p(c, bx + (f > 0 ? 1 : -1), y + dy - up, 1, up, z.he ? PL.c : '#b8a890'); if (q > 0.8) p(c, bx, y + dy - up - 1, 1, 1, z.he ? PL.c2 : '#ffffff'); }
    }
  }
  // ---------- mỗi khung: sóng chấn động, hạt lúc lấy đà ----------
  fx.heStep = function (W, dt, tick) {
    const P = W.P, mv = P.mv;
    if (W.mvWaves) for (const z of W.mvWaves) {
      if (!z.fxOn) { z.fxOn = 1; add({ ty: 'he', x: z.x, y: z.y, t: z.left / z.v + 0.05, ly: 0, draw: (c, o) => { if (o.z.left > 0) drawWave(c, o.z); }, z }); }
      if (tick) {
        const PL = pal(z.he ? z.he.el : null);
        for (let i = 0; i < 2; i++) emit(2, z.x + rr(-3, 3), z.y + rr(-z.depth, z.depth) * 0.5, -z.dir * rr(10, 40), rr(-26, -8), rr(0.25, 0.45), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
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
