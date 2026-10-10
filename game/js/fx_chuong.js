// Hình của CHƯỞNG (luật ở js/chuong.js): cầu lửa, luồng độc, mũi băng bay theo hướng nhắm, vệt lửa và mây độc trên sàn,
// nổ, toé, vỡ băng. Phong cách điểm ảnh như js/fx_dan.js, js/fx_he.js; màu theo hệ (G.EL, bảng màu của js/fx.js).
// Chỉ đọc trạng thái game (W.chs, W.chZones), không đổi luật. Chạy không vẽ thì không làm gì.
(function () {
  const G = window.G, fx = G.fx;
  if (!fx || !fx.kit) return;
  const K = fx.kit;
  const { api, fail, emit, streak, add, addRing, trauma, kick, pal, RAMP, R, rr, hash, p, star, line, hand, tongue, ell, ring, blastFire, blastPoison, blastIce } = K;
  const TAU = Math.PI * 2;
  const zk = () => G.ZK || 0.85;
  const UP = 12; // chưởng bay cao ngang ngực em bé
  const scr = (q) => { const sy = q.uy * zk(), l = Math.hypot(q.ux, sy) || 1; return [q.ux / l, sy / l]; };
  const PURPLE = ['#e2c6ff', '#b98af0', '#9a5fd6', '#6a3fa0'];
  // Hệ số cường độ, bậc đòn và vòng phép dùng chung (js/fx_ky_nang.js, nạp sau tệp này nên lấy lúc gọi)
  const KN = () => fx.kyNang;
  const nHat = (n) => (KN() ? KN().nHat(n) : n);
  const rung = (a) => (KN() ? KN().rung(a) : trauma(a));
  // Nhịp sát thương của vệt lửa và mây độc (luật: z.tick đếm ngược, đặt lại bằng z.every): 0..1, 1 = vừa gây sát thương
  const beat = (z) => (z.every > 0 && z.tick > z.every - 0.16 ? (z.tick - (z.every - 0.16)) / 0.16 : 0);

  // ---------- chưởng đang bay ----------
  // Cầu lửa: lõi trắng vàng, vỏ cam, viền đỏ sẫm, lưỡi lửa kéo về sau theo hướng bay
  function drawHoa(c, q) {
    const t = K.S().t, v = scr(q), x = Math.round(q.x), y = Math.round(q.y - UP), big = q.big || 0;
    const r = 5 + 3 * big + (((t * 20) | 0) % 2);
    p(c, x - r, Math.round(q.y), r * 2, 1, 'rgba(0,0,0,0.28)'); // bóng trên sàn
    // đuôi lửa: các khối nhỏ dần về phía sau
    for (let i = 5; i >= 1; i--) {
      const d = i * (3 + big * 1.5), s = Math.max(1, Math.round(r * (1 - i / 6.5))), jx = ((i * 7 + ((t * 30) | 0)) % 3) - 1;
      const bx = Math.round(x - v[0] * d - v[1] * jx), by = Math.round(y - v[1] * d + v[0] * jx);
      p(c, bx - s, by - s, s * 2, s * 2, i > 3 ? '#a8320a' : i > 1 ? '#ff7a2a' : '#ffa53a');
    }
    ell(c, x, y, r + 1, r + 1, '#7a1e0a');
    ell(c, x, y, r, r, '#ff7a2a');
    ell(c, x + Math.round(v[0]), y + Math.round(v[1]) - 1, r * 0.66, r * 0.66, '#ffd23f');
    ell(c, x + Math.round(v[0] * 1.5), y + Math.round(v[1] * 1.5) - 1, r * 0.33, r * 0.33, '#fff3b0');
    p(c, x - 1, y - r + 1, 2, 1, '#ffffff');
    // lưỡi lửa nhảy trên đỉnh
    tongue(c, x - Math.round(v[0] * 2), y - r + 2, 4 + 2 * big + (((t * 26) | 0) % 3), 1);
  }
  // Luồng độc: cục nhớt xanh viền tím, phồng xẹp, bong bóng
  function drawDoc(c, q) {
    const t = K.S().t, v = scr(q), x = Math.round(q.x), y = Math.round(q.y - UP), main = q.main;
    const w = (main ? 5 : 4) + Math.round(Math.sin(t * 18 + q.x * 0.1)), h = (main ? 4 : 3) - Math.round(Math.sin(t * 18 + q.x * 0.1) * 0.6);
    p(c, x - w, Math.round(q.y), w * 2, 1, 'rgba(0,0,0,0.25)');
    for (let i = 4; i >= 1; i--) { const d = i * 3.2, s = Math.max(1, 3 - (i >> 1)); p(c, Math.round(x - v[0] * d) - 1, Math.round(y - v[1] * d) - 1 + ((i + ((t * 12) | 0)) % 2), s, s, i % 2 ? '#9a5fd6' : '#6fcf3a'); }
    ell(c, x, y, w + 1, h + 1, '#3f2a66');
    ell(c, x, y, w, h, '#2f6b1a');
    ell(c, x, y - 1, w - 1, h - 1, '#6fcf3a');
    ell(c, x - 1, y - 2, Math.max(1, w - 3), Math.max(1, h - 2), '#c2f58a');
    p(c, x - 2, y - 2, 1, 1, '#ffffff');
    if (((t * 8) | 0) % 2) p(c, x + w - 2, y - h, 2, 2, '#b98af0');
  }
  // Mũi băng: tinh thể nhọn dài, cạnh sáng, đuôi sương; vẽ trong hệ trục của mũi băng rồi xoay theo hướng bay
  function drawBang(c, q) {
    const t = K.S().t, v = scr(q), X = Math.round(q.x), Y = Math.round(q.y - UP), Lg = 9 + Math.round((q.half - 5) * 1.2), W2 = Math.max(2, Math.round(q.half * 0.5));
    p(c, X - 6, Math.round(q.y), 12, 1, 'rgba(0,0,0,0.25)');
    c.save(); c.translate(X, Y); c.rotate(Math.atan2(v[1], v[0]));
    try {
      for (let i = 1; i <= 3; i++) p(c, -Lg - i * 4, -1 + ((i + ((t * 14) | 0)) % 3) - 1, 3, 1, i === 1 ? '#bfeaff' : 'rgba(191,234,255,0.5)');
      for (let xx = -Lg; xx <= Lg; xx++) {
        const u = (xx + Lg) / (2 * Lg), hh = Math.max(0, Math.round(W2 * (u < 0.7 ? u / 0.7 : (1 - u) / 0.3)));
        p(c, xx, -hh - 1, 1, hh * 2 + 3, '#1d4a7a');
      }
      for (let xx = -Lg + 1; xx <= Lg - 1; xx++) {
        const u = (xx + Lg) / (2 * Lg), hh = Math.max(0, Math.round(W2 * (u < 0.7 ? u / 0.7 : (1 - u) / 0.3)) - 1);
        p(c, xx, -hh, 1, hh + 1, '#e9f9ff'); p(c, xx, 1, 1, hh, '#7fd4ff');
      }
      p(c, Lg - 2, 0, 3, 1, '#ffffff');
      if (((t * 16) | 0) % 3 === 0) star(c, Lg - 3, -1, 2, '#ffffff');
    } finally { c.restore(); }
  }
  function drawTan(c, q) { // tàn lửa nhỏ
    const x = Math.round(q.x), y = Math.round(q.y - UP), v = scr(q);
    p(c, Math.round(x - v[0] * 4) - 1, Math.round(y - v[1] * 4) - 1, 2, 2, '#a8320a');
    p(c, x - 2, y - 2, 4, 4, '#ff7a2a'); p(c, x - 1, y - 1, 2, 2, '#ffd23f'); p(c, x, y - 1, 1, 1, '#ffffff');
  }
  function drawManh(c, q) { // mảnh băng vỡ
    const x = Math.round(q.x), y = Math.round(q.y - UP), v = scr(q);
    line(c, Math.round(x - v[0] * 4), Math.round(y - v[1] * 4), x, y, '#7fd4ff', 1);
    p(c, x - 1, y - 1, 3, 3, '#e9f9ff'); p(c, x, y, 1, 1, '#ffffff');
  }
  const DRAW = { hoa: drawHoa, doc: drawDoc, bang: drawBang, tan: drawTan, manh: drawManh };
  // Ảnh AI cho chưởng đang bay (js/fx_anh.js): hu-chuong-lua, hu-chuong-doc, hu-chuong-bang. Không có tệp thì vẽ bằng code như trên.
  const CH_ANH = { hoa: 'hu-chuong-lua', doc: 'hu-chuong-doc', bang: 'hu-chuong-bang' };
  function veAnh(c, q, ma) {
    const A = G.fxAnh;
    if (!A || !A.co(ma)) return false;
    const v = scr(q), x = Math.round(q.x), big = q.big || 0;
    p(c, x - 5, Math.round(q.y), 10, 1, 'rgba(0,0,0,0.25)'); // bóng trên sàn
    q.fxAt = q.fxAt == null ? K.S().t : q.fxAt;
    return A.ve(c, ma, x, Math.round(q.y - UP), K.S().t - q.fxAt, Math.atan2(v[1], v[0]), (q.kind === 'doc' && !q.main ? 0.8 : 1) * (1 + 0.35 * big));
  }

  // ---------- vệt lửa và mây độc của chưởng trên sàn ----------
  function drawVet(c, z) {
    const t = K.S().t, x = Math.round(z.x), y = Math.round(z.y), k = Math.min(1, z.t / 0.15), id = z.id || 1;
    // tan: co lại và thưa dần thay vì tắt phụt; hai khung cuối nhấp nháy
    const end = z.life < 0.35 ? z.life / 0.35 : 1;
    if (end < 0.25 && ((t * 20) | 0) % 2) return;
    const rx = Math.max(3, Math.round(z.r * (0.5 + 0.5 * k) * (0.7 + 0.3 * end))), ry = Math.max(2, Math.round(rx * zk() * 0.7));
    ell(c, x, y, rx, ry, 'rgba(110,34,10,0.55)');
    ell(c, x, y, rx - 2, Math.max(1, ry - 1), 'rgba(255,122,42,0.35)');
    const b = beat(z);
    if (b > 0) ring(c, x, y, rx + 1 + Math.round(2 * (1 - b)), ry + 1, 1, b > 0.5 ? '#ffd23f' : '#ff7a2a', b < 0.4);
    for (let i = 0; i < 3; i++) {
      const a = hash(id + i * 3.1) * TAU, d = hash(id * 2 + i) * 0.6;
      tongue(c, Math.round(x + Math.cos(a) * rx * d), Math.round(y + Math.sin(a) * ry * d), Math.round((3 + (Math.sin(t * 13 + i * 2 + id) * 0.5 + 0.5) * 5) * Math.min(1, z.life / 0.6 + 0.3)), 1);
    }
  }
  function drawMay(c, z) {
    const t = K.S().t, x = Math.round(z.x), y = Math.round(z.y), k = Math.min(1, z.t / 0.2), id = z.id || 1;
    // tan: co lại và thưa dần; hai khung cuối nhấp nháy
    const end = z.life < 0.45 ? z.life / 0.45 : 1;
    if (end < 0.25 && ((t * 20) | 0) % 2) return;
    // mây "thở": bán kính phồng xẹp chậm, không đều
    const br = 1 + 0.04 * Math.sin(t * 1.7 + id) + 0.03 * Math.sin(t * 2.9 + id * 2);
    const rx = Math.max(4, Math.round(z.r * (0.4 + 0.6 * k) * (0.75 + 0.25 * end) * br)), ry = Math.max(3, Math.round(rx * zk()));
    // mặt sàn nhuộm độc, viền tím
    ell(c, x, y, rx, ry, 'rgba(40,110,26,0.42)');
    ring(c, x, y, rx, ry, 1, 'rgba(154,95,214,0.75)', true);
    if (KN()) KN().organic(c, x, y, rx - 1, ry - 1, id * 7.1, end < 1);
    // nhịp độc: vòng lục co về giữa đúng lúc mây gây sát thương
    const b = beat(z);
    if (b > 0) ring(c, x, y, Math.max(2, Math.round(rx * (0.55 + 0.45 * b))), Math.max(2, Math.round(ry * (0.55 + 0.45 * b))), 1, b > 0.5 ? '#c2f58a' : '#b98af0', b < 0.4);
    // màn khói lơ lửng trên mây: các vạch ngang so le trôi qua lại
    for (let j = 0; j < 4; j++) {
      const yy = y - 4 - j * 4, hw = Math.round(rx * (0.95 - j * 0.15)), sh = Math.round(Math.sin(t * (1.2 + j * 0.3) + id + j) * 3);
      if (hw < 2) continue;
      p(c, x - hw + sh, yy, hw * 2, 2, j % 2 ? 'rgba(154,95,214,0.22)' : 'rgba(143,224,74,0.24)');
    }
    // Vạn độc: hạt độc xoáy vào giữa
    if (z.pull) for (let i = 0; i < 6; i++) {
      const u = ((t * 0.9 + i / 6) % 1), a = i * 1.05 + t * 2.2, d = (1 - u) * rx;
      p(c, Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * zk()) - 2, 2, 2, i % 2 ? '#c2f58a' : '#b98af0');
    }
    // bong bóng sủi trên mặt mây
    for (let i = 0; i < 3; i++) {
      const u = (t * (0.7 + hash(i + id) * 0.6) + hash(id + i * 9.1)) % 1, a = hash(id + i * 4.3) * TAU, d = 0.2 + hash(id * 3 + i) * 0.6;
      const bx = Math.round(x + Math.cos(a) * rx * d), by = Math.round(y + Math.sin(a) * ry * d);
      if (u < 0.55) p(c, bx, by, 1, 1, '#c2f58a'); else if (u < 0.85) { p(c, bx - 1, by - 1, 3, 3, i % 2 ? '#b98af0' : '#8fe04a'); p(c, bx - 1, by - 1, 1, 1, '#ffffff'); }
    }
  }

  // ---------- mỗi khung: gắn hình cho chưởng mới, hạt theo đường bay ----------
  let ids = 1;
  function step(W, tick) {
    if (W.chs) for (const q of W.chs) {
      if (!q.fxOn) {
        q.fxOn = 1;
        const f = DRAW[q.kind], ma = CH_ANH[q.kind];
        if (f) add({ ty: 'he', x: q.x, y: q.y, t: 30, ly: 1, draw: (c, o) => { if (o.q.done) { o.t = 0; return; } if (!(ma && veAnh(c, o.q, ma))) f(c, o.q); }, q });
      }
      if (!tick) continue;
      const y = q.y - UP, v = scr(q);
      if (q.kind === 'hoa') {
        emit(9, q.x - v[0] * 6 + rr(-2, 2), y + rr(-2, 2), -v[0] * 30, rr(-40, -15), rr(0.2, 0.35), RAMP.fire, q.big ? 5 : 3, -30, 0, null, 1);
        if (R() < 0.5) emit(0, q.x, y, -v[0] * 40 + rr(-20, 20), rr(-50, -10), rr(0.3, 0.5), RAMP.ember, 1, 160, 0, q.y + 2, 1);
        if (q.big) emit(2, q.x - v[0] * 8, y, rr(-10, 10), rr(-20, -8), rr(0.4, 0.7), RAMP.smoke, 4, 0, 1, null, 1);
      } else if (q.kind === 'doc') {
        emit(5, q.x - v[0] * 4, y + 2, -v[0] * 10, rr(0, 20), rr(0.35, 0.55), R() < 0.35 ? PURPLE : RAMP.poison, 1, 280, 0, q.y + rr(-1, 3), 1);
        if (R() < 0.5) emit(2, q.x - v[0] * 6, y, rr(-8, 8), rr(-14, -4), rr(0.4, 0.7), RAMP.vapor, 3, 0, 1, null, 1);
      } else if (q.kind === 'bang') {
        emit(R() < 0.5 ? 6 : 4, q.x - v[0] * 8 + rr(-2, 2), y + rr(-3, 3), -v[0] * 20, rr(-6, 10), rr(0.25, 0.45), RAMP.ice, 2, 0, 0, null, 1);
        if (R() < 0.4) emit(2, q.x - v[0] * 10, y, 0, -3, 0.4, RAMP.mist, 3, 0, 0, null, 1);
      } else if (q.kind === 'tan') emit(9, q.x, y, 0, -20, 0.2, RAMP.fire, 2, -20, 0, null, 1);
      else if (q.kind === 'manh') emit(6, q.x, y, 0, 0, 0.2, RAMP.ice, 1, 0, 0, null, 1);
    }
    if (W.chZones) for (const z of W.chZones) {
      if (!z.fxOn) {
        z.fxOn = 1; z.id = ids++;
        const f = z.kind === 'may' ? drawMay : drawVet;
        add({ ty: 'he', x: z.x, y: z.y, t: z.life + 0.2, ly: 0, draw: (c, o) => { if (o.z.dead || o.z.life <= 0) { o.t = 0; return; } f(c, o.z); }, z });
      }
      if (z.fxTk != null && z.tick > z.fxTk + 0.05) {
        // vừa gây sát thương: vài hạt bật lên khắp vùng (giới hạn theo G.VFX.hat)
        for (let i = 0; i < nHat(3); i++) {
          const a = R() * TAU, d = Math.sqrt(R()) * z.r * 0.8, px = z.x + Math.cos(a) * d, py = z.y + Math.sin(a) * d * zk();
          if (z.kind === 'may') emit(1, px, py - 2, rr(-6, 6), rr(-28, -12), rr(0.45, 0.7), R() < 0.4 ? PURPLE : RAMP.poison, 2, -4, 0.8, null, 1);
          else emit(9, px, py, 0, rr(-50, -25), rr(0.25, 0.4), RAMP.fire, 4, -20, 0, null, 1);
        }
      }
      z.fxTk = z.tick;
      if (!tick) continue;
      if (z.kind === 'may' && R() < 0.5) { const a = R() * TAU, d = Math.sqrt(R()) * z.r * 0.8; emit(2, z.x + Math.cos(a) * d, z.y - rr(4, 16) + Math.sin(a) * d * 0.3, rr(-6, 6), rr(-10, -3), rr(0.6, 1.1), R() < 0.3 ? PURPLE : RAMP.vapor, R() < 0.5 ? 5 : 3, 0, 0.6, null, 1); }
      else if (z.kind === 'vet' && R() < 0.35) emit(9, z.x + rr(-z.r, z.r) * 0.6, z.y + rr(-2, 2), 0, rr(-30, -10), rr(0.2, 0.4), RAMP.fire, 3, -20, 0, null, 1);
    }
  }
  const he0 = fx.heStep;
  fx.heStep = function (W, dt, tick) {
    if (he0) he0(W, dt, tick);
    if (G.noRender) return;
    try { step(W, tick); } catch (e) { fail(e); }
  };

  // ---------- lúc bắn, lúc trúng ----------
  api('chCast', (P, cay, A, big) => {
    const h = hand(P), PL = pal(G.CHUONG.trees[cay].el), v = A ? scr(A) : [P.face, 0];
    const x = h.x + v[0] * 8, y = h.y + v[1] * 8;
    add({ ty: 'flash', x, y, r: 8 + 6 * (big || 0), t: 0.12, c: '#ffffff', c2: PL.c2, ly: 1 });
    addRing(x, y, 2, 14 + 8 * (big || 0), 0.2, PL.c, 2, 1);
    // bàn tay đẩy ra: một vòng sóng nhỏ trước tay và hạt bắn theo hướng chưởng
    for (let i = 0; i < nHat(6 + 6 * (big || 0)); i++) streak(x, y, v[0] * rr(90, 200) + v[1] * rr(-40, 40), v[1] * rr(90, 200) - v[0] * rr(-40, 40), rr(0.1, 0.2), PL.ramp, 1, rr(5, 10), 0, 3);
    kick(-v[0] * (1 + 2 * (big || 0)), -v[1]); rung(0.08 + 0.2 * (big || 0));
    // vòng phép nhỏ dưới chân lúc ra tay (to và lâu hơn khi tích lực)
    if (KN() && big > 0) KN().rune(P.x, P.y, 12 + 10 * big, PL, 0.3 + 0.15 * big, 4, 5);
  });
  // Nổ của chưởng. Bậc cường độ (js/fx_ky_nang.js fx.capDo): chưởng thường là "kỹ năng" (rung vừa, không khựng),
  // chưởng tích lực là "tối thượng" (rung mạnh, khựng ngắn, chớp màn hình nhẹ, nhiều hạt hơn), luồng phụ của Tam xà nhẹ hơn.
  // Thêm một vòng phép trên sàn: xuất hiện, đỉnh, tan (chỉ là hình, không phải vùng trúng).
  api('chBoom', (cay, x, y, r, q) => {
    const big = q && q.big > 0, side = cay === 'doc' && q && !q.main, el = G.CHUONG.trees[cay].el;
    const k = KN() ? KN().nhan(big ? 'toiThuong' : side ? 'thuong' : 'kyNang', el) : 1;
    const power = Math.min(1.8, (big ? 1.1 : 1) * k); // số hạt của vụ nổ; js/fx.js còn nhân thêm G.VFX.hat
    if (cay === 'hoa') blastFire(x, y, r, power);
    else if (cay === 'doc') blastPoison(x, y, Math.max(16, r * 0.8), side ? 0.6 : power);
    else blastIce(x, y, r, power);
    if (KN() && !side) {
      const PL = pal(el);
      KN().rune(x, y, r * (big ? 1.05 : 0.95), PL, big ? 0.7 : 0.5, big ? 8 : 6, big ? 3.2 : 2.2);
      if (big) KN().rune(x, y, r * 0.6, PL, 0.5, 4, -4, 0.06);
    }
  });
  api('chHit', (kind, e, q) => {
    const y = e.y - Math.min(16, (e.h || 20) * 0.5), v = scr(q);
    if (kind === 'bang') {
      add({ ty: 'flash', x: e.x, y, r: 6, t: 0.08, c: '#ffffff', c2: '#bfeaff', ly: 1 });
      for (let i = 0; i < 6; i++) emit(4, e.x, y, v[0] * rr(40, 120) + rr(-30, 30), v[1] * rr(40, 120) + rr(-50, 10), rr(0.25, 0.45), RAMP.ice, 1, 200, 1, e.y + rr(-2, 4), 1);
    } else if (kind === 'tan') {
      add({ ty: 'flash', x: e.x, y, r: 4, t: 0.08, c: '#fff3b0', c2: '#ff7a2a', ly: 1 });
      for (let i = 0; i < 4; i++) emit(9, e.x, y, rr(-20, 20), rr(-40, -10), rr(0.2, 0.35), RAMP.fire, 3, -20, 0, null, 1);
    } else {
      for (let i = 0; i < 4; i++) emit(4, e.x, y, rr(-50, 50), rr(-60, 0), rr(0.2, 0.35), RAMP.ice, 1, 200, 1, e.y + 2, 1);
    }
  });
  api('chEnd', (q, wall) => {
    if (!wall) return;
    const v = scr(q), x = q.x, y = q.y - UP;
    for (let i = 0; i < 6; i++) emit(4, x, y, -v[0] * rr(30, 90) + rr(-30, 30), rr(-60, 0), rr(0.3, 0.5), RAMP.ice, 1, 220, 1, q.y + rr(-1, 4), 1);
    addRing(x, q.y, 1, 8, 0.15, '#e9f9ff', 1, 1);
  });
  api('chShatter', (e) => { blastIce(e.x, e.y, 22, 0.8); trauma(0.12); });
  api('chSpread', (e, got) => {
    for (const t of got) {
      const n = 5;
      for (let i = 0; i < n; i++) { const u = i / n; emit(1, e.x + (t.x - e.x) * u, e.y - 10 + (t.y - e.y) * u - Math.sin(u * Math.PI) * 10, (t.x - e.x) * 0.6, (t.y - e.y) * 0.6, 0.3, R() < 0.4 ? PURPLE : RAMP.poison, 2, 0, 0, null, 1); }
    }
    addRing(e.x, e.y, 3, 24, 0.3, '#b98af0', 2, 0);
  });
  api('chHeal', (P) => {
    for (let i = 0; i < 3; i++) emit(10, P.x + rr(-6, 6), P.y - rr(10, 22), 0, -18, rr(0.4, 0.6), RAMP.heal, 1, 0, 0, null, 1);
  });

  // ---------- thanh tích lực trên đầu em bé (Hỏa chưởng: Tích lực) ----------
  function drawCharge(c) {
    const W = G.getWorld(), P = W && W.P;
    if (!P || !P.chHold || P.dead || !G.chuong) return;
    const k = G.chuong.chargeOf(P), S = K.S(), x = Math.round(P.x) - 13, y = Math.round(P.y) - 42, BW = 26;
    const full = k >= 1, blink = full && ((S.t * 12) | 0) % 2;
    p(c, x - 1, y - 1, BW + 2, 6, '#140d0e');
    p(c, x, y, BW, 4, '#3a1e14');
    const n = Math.round(BW * k);
    if (n > 0) { p(c, x, y, n, 4, full ? (blink ? '#ffffff' : '#ffd23f') : '#ff7a2a'); p(c, x, y, n, 1, '#fff3b0'); }
    // quả cầu lửa đang lớn dần trong tay
    const h = hand(P), r = 2 + Math.round(4 * k);
    ell(c, h.x + P.face * 4, h.y - 2, r + 1, r + 1, '#7a1e0a'); ell(c, h.x + P.face * 4, h.y - 2, r, r, '#ff7a2a'); ell(c, h.x + P.face * 4, h.y - 3, Math.max(1, r - 2), Math.max(1, r - 2), '#ffd23f');
    if (S && ((S.t * 30) | 0) % 2 && R() < 0.6) emit(1, h.x + P.face * 4 + rr(-12, 12), h.y - 2 + rr(-10, 10), 0, 0, 0.2, RAMP.fire, 2, 0, 0, null, 1);
  }
  // Vòng phép tích lực dưới chân (lớp sàn): nở dần theo độ tích, xoay nhanh dần, đầy thì sáng trắng nhấp nháy.
  // Đây là phần "báo trước" của chưởng tối thượng; màu vàng cam điểm ảnh, khác hẳn vùng báo đỏ mịn của quái.
  function drawChargeGround(c) {
    const W = G.getWorld(), P = W && W.P;
    if (!P || !P.chHold || P.dead || !G.chuong) return;
    const S = K.S();
    if (!S) return;
    const k = G.chuong.chargeOf(P), t = S.t, x = Math.round(P.x), y = Math.round(P.y);
    const r = 9 + 15 * k, ky = zk(), full = k >= 1, blink = full && ((t * 12) | 0) % 2;
    ring(c, x, y, r, r * ky, 1, full ? (blink ? '#ffffff' : '#ffd23f') : k > 0.5 ? '#ffa53a' : '#ff7a2a', k < 0.15);
    const n = 6, rot = t * (1.5 + 5 * k);
    c.fillStyle = full ? '#fff3b0' : '#ffd23f';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rot, px = Math.round(x + Math.cos(a) * r * 0.75), py = Math.round(y + Math.sin(a) * r * 0.75 * ky);
      c.fillRect(px - 1, py, 3, 1); c.fillRect(px, py - 1, 1, 1);
    }
    if (k > 0.3) ring(c, x, y, r * 0.45, r * 0.45 * ky, 1, 'rgba(255,210,63,0.6)', true);
  }
  const ground0 = fx.drawGround;
  fx.drawGround = function (c) {
    if (ground0) ground0(c);
    if (G.noRender) return;
    try { drawChargeGround(c); } catch (e) { fail(e); }
  };
  const over0 = fx.drawOver;
  fx.drawOver = function (c) {
    if (over0) over0(c);
    if (G.noRender) return;
    try { drawCharge(c); } catch (e) { fail(e); }
  };
})();
