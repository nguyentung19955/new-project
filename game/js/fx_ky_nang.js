// Hiệu ứng KỸ NĂNG (Phase 3 VFX): độc, vòng phép (AoE), tên bay, bậc cường độ đòn.
// Chỉ là hình ảnh: đọc trạng thái game, không ghi trường nào của luật chơi (vùng trúng, thời gian, sát thương giữ nguyên).
// Dùng chung kho hạt và kho hình của js/fx.js (emit/add), không tạo đối tượng hay dải màu mới cho từng hạt mỗi khung.
// Mọi số lượng hạt nhân G.VFX.hat, mọi độ rung nhân G.VFX.rung, mọi khựng hình nhân G.VFX.khung (js/vfx_cfg.js).
// Nạp sau js/fx_he.js, js/fx_dan.js, js/fx_chuong.js (bọc thêm lên các hàm của chúng).
(function () {
  const G = window.G, fx = G.fx;
  if (!fx || !fx.kit) return;
  const K = fx.kit;
  const { api, fail, emit, add, addRing, trauma, stop, RAMP, R, rr, hash, p, star, ring, bodyOf, A_ } = K;
  const TAU = Math.PI * 2;
  const zk = () => G.ZK || 0.6;

  // ---------- hệ số cường độ (G.VFX) ----------
  const cfg = (k) => { const v = G.VFX && G.VFX[k]; return v == null ? 1 : v; };
  // số hạt theo hệ số hat (làm tròn, có thể về 0 khi tắt)
  const nHat = (n) => Math.max(0, Math.round(n * cfg('hat')));
  // xác suất sinh hạt theo hệ số hat
  const pHat = (q) => R() < q * cfg('hat');
  const rung = (a) => { const k = cfg('rung'); if (k > 0) trauma(a * k); };
  const khung = (ms) => { const k = cfg('khung'); if (k > 0) stop(ms * k); };

  // ---------- BẬC CƯỜNG ĐỘ: đòn thường < chí mạng < kỹ năng < chưởng tối thượng ----------
  // Một chỗ để chỉnh. Đòn thường và chí mạng do js/fx.js (fx.hit) xử lý, ghi ở đây để so: rung 0,14 / 0,4; khựng 45 / 115 ms.
  // chop: chớp sáng cả màn hình (giây, tối đa 0,45 = mức tiến hoá vũ khí), mau: màu chớp. hat: nhân số hạt của vụ nổ.
  const CAP = (fx.capDo = {
    thuong: { rung: 0.14, khung: 45, hat: 1, chop: 0 },
    chiMang: { rung: 0.4, khung: 115, hat: 1.4, chop: 0 },
    kyNang: { rung: 0.28, khung: 0, hat: 1.15, chop: 0 },
    toiThuong: { rung: 0.62, khung: 85, hat: 1.7, chop: 0.2 },
  });
  // Áp một bậc: rung, khựng, chớp (màu theo hệ). Trả về hệ số nhân số hạt.
  function nhan(cap, el) {
    const c = CAP[cap] || CAP.kyNang, S = K.S();
    rung(c.rung);
    if (c.khung) khung(c.khung);
    if (c.chop && S && cfg('rung') > 0) {
      S.flash = Math.max(S.flash, c.chop);
      S.flashCol = el === 'fire' ? '255,190,110' : el === 'poison' ? '170,240,120' : el === 'ice' ? '190,230,255' : '255,255,255';
    }
    return c.hat;
  }
  fx.capNhan = nhan;

  // ---------- VÒNG PHÉP (AoE): xuất hiện -> đỉnh -> tan, vòng ngoài, vòng chấm xoay, ký tự xoay ----------
  // Chỉ là hình (nằm trên sàn, lớp 0). Bán kính hình có thể khác vùng trúng của luật: không đọc lại để tính trúng.
  // o: { r, c (màu chính), c2 (màu sáng), d (màu tối), n (số ký tự), sp (tốc độ xoay, rad/giây) }
  const ARC = new Float32Array(2);
  function drawRune(c, o, k, x, y) {
    // ba pha: nở nhanh 0..0,16 (lố một chút), đỉnh 0,16..0,4, tan 0,4..1 (nở thêm chút, thưa điểm ảnh, mảnh dần)
    const A = 0.16, B = 0.4;
    let s, th, dth = false, hot = 0;
    if (k < A) { const u = k / A; s = 0.55 + 0.53 * (1 - (1 - u) * (1 - u)); th = 2; hot = 1; }
    else if (k < B) { const u = (k - A) / (B - A); s = 1.08 - 0.08 * u; th = 2; hot = 1 - u; }
    else { const u = (k - B) / (1 - B); s = 1 + 0.12 * u; th = u < 0.5 ? 2 : 1; dth = u > 0.35; if (u > 0.8 && ((K.S().t * 30) | 0) % 2) return; }
    const r = o.r * s, ky = zk(), t = K.S().t, rot = o.a0 + t * o.sp;
    // vòng ngoài
    ring(c, x, y, r, r * ky, th, hot > 0.5 ? o.c2 : o.c, dth);
    // vòng trong: nét đứt xoay ngược chiều
    const ri = r * 0.68;
    c.fillStyle = o.dk;
    for (let i = 0; i < 16; i++) {
      if (i & 1 || (dth && i % 4 === 0)) continue;
      const a = (i / 16) * TAU - rot * 0.7;
      c.fillRect(Math.round(x + Math.cos(a) * ri) - 1, Math.round(y + Math.sin(a) * ri * ky), 2, 1);
    }
    // ký tự xoay giữa hai vòng: mỗi ký tự một vạch ngang + vạch dọc ngắn (kiểu chữ triện)
    const rm = r * 0.84;
    c.fillStyle = hot > 0.3 ? '#ffffff' : o.c2;
    for (let i = 0; i < o.n; i++) {
      if (dth && i % 2) continue;
      const a = (i / o.n) * TAU + rot;
      ARC[0] = Math.round(x + Math.cos(a) * rm); ARC[1] = Math.round(y + Math.sin(a) * rm * ky);
      c.fillRect(ARC[0] - 1, ARC[1], 3, 1);
      c.fillRect(ARC[0] + ((i & 1) ? -1 : 1), ARC[1] - 1, 1, 1);
    }
    // lúc đỉnh: chấm sáng ở tâm và bốn tia ngắn trên sàn
    if (hot > 0.2) {
      const h = Math.round(3 + 4 * hot);
      c.fillStyle = o.c2;
      c.fillRect(x - h, y, h * 2 + 1, 1); c.fillRect(x, y - Math.round(h * ky), 1, Math.round(h * ky) * 2 + 1);
    }
  }
  // Thêm một vòng phép. pl: bảng màu hệ (fx.pal). delay: chờ bao lâu mới hiện (giây). Trả về hình đã thêm.
  // (o.d của js/fx.js là thời gian chờ, nên màu tối để ở o.dk)
  function runeOf(x, y, r, pl, t, n, sp, delay) {
    return add({ ty: 'he', x, y, t: t || 0.5, ly: 0, d: delay || 0, draw: drawRune, r, c: pl.c, c2: pl.c2, dk: pl.d, n: n || 6, sp: sp == null ? 2.2 : sp, a0: R() * TAU });
  }
  fx.rune = (x, y, r, el, t, n, sp, delay) => { if (G.noRender || !K.S()) return; try { runeOf(x, y, r, K.pal(el), t, n, sp, delay); } catch (e) { fail(e); } };

  // ====================================================================
  // ĐỘC
  // ====================================================================
  // Bảng màu hạt độc: xanh lục ngả tím khi tan (hồi máu thì xanh lục sáng ngả trắng, có dấu cộng: không lẫn).
  const TOXIC = ['#e6ffc0', '#b6e85a', '#8fd03a', '#5f9a26', '#7a4fb0', '#4a2f78'];
  const TOX_A = ['rgba(143,224,74,0.55)', 'rgba(111,190,50,0.45)', 'rgba(154,95,214,0.4)', 'rgba(106,63,160,0.25)'];
  // Hào quang độc trên người: các dải sương mảnh bay vòng quanh thân, mỗi dải một tốc độ, một nhịp phồng xẹp riêng
  // (chậm và không đều). Chỉ vẽ phần ở trước thân; phần sau thân bị thân che nên bỏ.
  const WISP = ['#8fe04a', '#b98af0', '#6fcf3a', '#9a5fd6'];
  function aura(c, e, pn) {
    const B = bodyOf(e), t = K.S().t, id = e.fxId || 1;
    const x = e.x, y = e.y, n = pn >= 3 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const sp = (0.55 + hash(id + i * 2.7) * 0.6) * (i & 1 ? -1 : 1), sg = i & 1 ? -1 : 1;
      const a = hash(id * 1.3 + i) * TAU + t * sp + Math.sin(t * (0.7 + i * 0.23) + i) * 0.6;
      const rx = B.w + 3 + Math.sin(t * (0.9 + i * 0.31) + id) * 2, ry = 3 + i;
      const cy = y - B.h * (0.25 + 0.22 * i) + Math.sin(t * 0.8 + i * 1.7) * 2;
      // một dải 5 điểm nối nhau theo cung: hai điểm đầu đậm (một màu), ba điểm đuôi nhạt (một màu) -> chỉ đổi màu vẽ hai lần
      for (let h = 0; h < 2; h++) {
        c.fillStyle = h ? TOX_A[i & 3] : WISP[i];
        for (let j = h ? 2 : 0; j < (h ? 5 : 2); j++) {
          const aj = a - j * 0.21 * sg, sn = Math.sin(aj);
          if (sn < -0.25) continue; // sau thân
          c.fillRect(Math.round(x + Math.cos(aj) * rx), Math.round(cy + sn * ry), h ? 1 : 2, j === 0 ? 2 : 1);
        }
      }
    }
    // vết loang mờ dưới chân, phồng xẹp chậm
    const w = Math.round(B.w + 2 + Math.sin(t * 1.3 + id) * 1.5);
    c.fillStyle = 'rgba(80,150,40,0.32)';
    c.fillRect(Math.round(x) - w, Math.round(y), w * 2, 1);
    c.fillStyle = 'rgba(154,95,214,0.3)';
    c.fillRect(Math.round(x) - w + 2, Math.round(y) + 1, w * 2 - 4, 1);
  }
  const ent0 = fx.entity;
  fx.entity = function (c, e) {
    ent0(c, e);
    if (G.noRender || !K.S() || !e || e.dead || e.hidden) return;
    try {
      const pn = e.isPlayer ? (e.st.poison > 0 ? 1 : 0) : e.st.poisonN;
      if (pn > 0) aura(c, e, pn);
    } catch (err) { fail(err); }
  };
  // Hạt nhỏ nổi lên rồi tan (lơ lửng chậm, hơi trôi ngang), số theo tầng độc
  function motes(e, pn) {
    const B = bodyOf(e);
    if (!pHat(0.16 + 0.06 * pn)) return;
    emit(1, e.x + rr(-B.w, B.w), e.y - rr(2, B.h * 0.8), rr(-6, 6), rr(-16, -7), rr(0.7, 1.1), TOXIC, R() < 0.3 ? 3 : 2, -4, 0.8, null, 1);
  }
  // Vừa dính độc: vòng tím lục quanh thân, giọt bắn lên, một làn hơi
  const st0 = fx.status;
  fx.status = function (t, el) {
    st0(t, el);
    if (G.noRender || el !== 'poison' || !t || !K.S()) return;
    try {
      const B = bodyOf(t), y = t.y - B.h * 0.5;
      addRing(t.x, y, 3, B.w + 9, 0.22, '#b98af0', 1, 1);
      addRing(t.x, t.y, 2, B.w + 7, 0.26, '#8fe04a', 1, 0);
      add({ ty: 'flash', x: t.x, y, r: 5, t: 0.08, c: '#e6ffc0', c2: '#8fe04a', ly: 1 });
      for (let i = 0; i < nHat(3); i++) emit(1, t.x + rr(-B.w, B.w), y + rr(-4, 4), rr(-10, 10), rr(-30, -14), rr(0.5, 0.8), TOXIC, 2, -6, 0.8, null, 1);
    } catch (e) { fail(e); }
  };
  // Mỗi nhịp sát thương độc: thân "nhói" một nhịp: vòng lục co vào thân, vài bọt vỡ, hạt bay lên. Giới hạn số nhịp mỗi khung.
  let tickT = -1, tickN = 0;
  function pulse(e, big) {
    if (G.time !== tickT) { tickT = G.time; tickN = 0; }
    if (++tickN > 6) return;
    const B = bodyOf(e), y = e.y - B.h * 0.45;
    add({ ty: 'he', x: e.x, y, t: 0.22, ly: 1, draw: drawThrob, w: B.w + 7, h: B.h * 0.5 + 3 });
    for (let i = 0; i < nHat(big ? 3 : 2); i++) emit(11, e.x + rr(-B.w, B.w), y + rr(-B.h * 0.3, B.h * 0.3), rr(-4, 4), rr(-20, -10), rr(0.3, 0.5), RAMP.poison, 2, 0, 0, null, 1);
    for (let i = 0; i < nHat(2); i++) emit(1, e.x + rr(-B.w, B.w), y, rr(-8, 8), rr(-26, -12), rr(0.5, 0.8), TOXIC, 2, -4, 0.8, null, 1);
  }
  // vòng elip co dần về thân, hai màu xen nhau
  function drawThrob(c, o, k, x, y) {
    const s = 1 - 0.45 * k, rx = o.w * s, ry = o.h * s;
    ring(c, x, y, rx, ry, 1, k < 0.5 ? '#c2f58a' : '#9a5fd6', k > 0.6);
  }
  const dmg0 = fx.dmg;
  fx.dmg = function (t, d, o) {
    const r = dmg0(t, d, o);
    if (!G.noRender && o && o.dot && o.el === 'poison' && t && !t.dead && K.S()) { try { pulse(t, t.isBoss); } catch (e) { fail(e); } }
    return r;
  };

  // Vũng độc trên đất (vũng của quái và vũng độc theo hệ của mình): vẽ thêm lên hình vũng có sẵn những mảng tối trôi
  // chậm, mép bò ra bò vào, chấm tím lấm tấm. Vẫn là điểm ảnh, không mờ nhoè. Vũng hồi máu không đụng tới.
  const OB = new Int16Array(15); // chỗ và cỡ các mảng (dùng lại mỗi khung, không tạo mảng mới)
  function organic(c, x, y, rx, ry, id, fade) {
    if (rx < 6) return;
    const t = K.S().t, n = Math.max(2, Math.min(5, (rx / 7) | 0));
    for (let i = 0; i < n; i++) {
      const sp = (0.18 + hash(id + i * 1.9) * 0.22) * (i & 1 ? -1 : 1);
      const a = hash(id * 2.1 + i * 3.3) * TAU + t * sp;
      const d = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * (0.35 + i * 0.07) + i * 2 + id));
      OB[i * 3] = Math.round(x + Math.cos(a) * rx * d); OB[i * 3 + 1] = Math.round(y + Math.sin(a) * ry * d);
      OB[i * 3 + 2] = Math.round(2 + hash(id + i) * 3 + Math.sin(t * 0.9 + i) * 1);
    }
    // mảng tối hình bầu trôi chậm (mặt nhớt), rồi vạch sáng ở mép trên: tím và lục xen nhau
    c.fillStyle = 'rgba(24,60,16,0.45)';
    for (let i = 0; i < n; i++) { const bx = OB[i * 3], by = OB[i * 3 + 1], w = OB[i * 3 + 2]; c.fillRect(bx - w, by, w * 2, 2); c.fillRect(bx - w + 1, by - 1, w * 2 - 2, 1); c.fillRect(bx - w + 1, by + 2, w * 2 - 2, 1); }
    for (let h = 0; h < 2; h++) {
      c.fillStyle = h ? 'rgba(154,95,214,0.55)' : 'rgba(194,245,138,0.55)';
      for (let i = h; i < n; i += 2) { const w = OB[i * 3 + 2]; c.fillRect(OB[i * 3] - w + 2, OB[i * 3 + 1] - 1, Math.max(1, w - 2), 1); }
    }
    // mép bò: các điểm sáng trên viền nhích ra nhích vào chậm, mỗi điểm một nhịp
    if (fade || rx < 10) return;
    const m = Math.min(7, (rx / 4) | 0);
    for (let h = 0; h < 2; h++) {
      c.fillStyle = h ? '#9a5fd6' : '#8fe04a';
      for (let i = 0; i < m; i++) {
        if ((i % 3 === 0) !== (h === 1)) continue;
        const a = (i / m) * TAU + hash(id + i * 7) * 0.5 + t * 0.06;
        const q = 1.02 + 0.07 * Math.sin(t * (0.6 + hash(id + i) * 0.5) + i * 1.3);
        c.fillRect(Math.round(x + Math.cos(a) * rx * q), Math.round(y + Math.sin(a) * ry * q), 2, 1);
      }
    }
  }
  const zone0 = fx.zone;
  fx.zone = function (c, z, W) {
    const r = zone0(c, z, W);
    if (!r || G.noRender || !K.S()) return r;
    try {
      if (z.pool && z.el === 'poison' && !z.heal && !z.rain && z.shape === 'circle' && !(z.t > 0)) {
        if (z.he) {
          // vũng độc theo hệ (js/fx_he.js): hình vẽ sẵn, nở trong 0,18 giây
          const k = Math.min(1, (z.fxA || 0) / 0.18);
          if (k <= 0 || (z.life < 0.4 && ((K.S().t * 20) | 0) % 2)) return r;
          const rx = Math.max(6, Math.round(z.r / 2) * 2) * (0.4 + 0.6 * k);
          organic(c, Math.round(z.x), Math.round(z.y), rx * 0.9, rx * zk() * 0.9, z.fxId || 1, z.life < 0.4);
        } else {
          // vũng của quái (js/fx.js pool): cùng công thức nở và co lại như hình vũng
          const k = Math.max(0, Math.min(1, ((z.fxA || 0) - (z.fxD || 0)) / 0.22));
          if (k <= 0) return r;
          const fade = Math.min(1, z.life / 0.45), rx = z.r * (1 - (1 - k) * (1 - k)) * (0.75 + 0.25 * fade);
          organic(c, Math.round(z.x), Math.round(z.y), rx - 2, (rx - 2) * zk(), z.fxId || 1, fade < 0.5);
        }
      }
    } catch (e) { fail(e); }
    return r;
  };

  // ====================================================================
  // TÊN VÀ ĐẠN PHÉP CỦA MÌNH: lõi sáng ở mũi, vài hạt bám đường bay (có trần)
  // ====================================================================
  const proj0 = fx.proj;
  fx.proj = function (c, o) {
    proj0(c, o);
    if (G.noRender || o.team !== 'player' || o.kind !== 'arrow' || !K.S()) return;
    try {
      const sp = Math.hypot(o.vx, o.vy) || 1, ux = o.vx / sp, uy = o.vy / sp;
      const x = o.x + ux * 6, y = o.y - (o.z || 10) + uy * 6, t = K.S().t;
      // lõi sáng ở mũi tên: chấm trắng, chớp tia chữ thập theo nhịp (to hơn với tên lớn)
      const f = ((t * 20 + (o.x | 0) * 0.13) | 0) % 4;
      p(c, Math.round(x), Math.round(y), 1, 1, '#ffffff');
      if (o.big) star(c, x, y, f === 0 ? 3 : 2, 'rgba(255,255,255,0.85)', '#ffffff');
      else if (f === 0) star(c, x, y, 2, 'rgba(255,255,255,0.7)');
    } catch (e) { fail(e); }
  };

  // ====================================================================
  // VÒNG PHÉP CHO CÁC KỸ NĂNG VÙNG KHÁC (bọc thêm, không đổi hình cũ)
  // ====================================================================
  function wrap(name, f) {
    const f0 = fx[name];
    if (!f0) return;
    fx[name] = function (a, b, c, d, e) {
      const r = f0(a, b, c, d, e);
      if (!G.noRender && K.S()) { try { f(a, b, c, d, e); } catch (err) { fail(err); } }
      return r;
    };
  }
  // (Địa Chấn của búa đã có vòng sóng và vết nứt riêng: không thêm vòng phép để màn hình khỏi rối)
  // Nổ lan (quái đang cháy chết thì nổ): vòng phép lửa đúng bán kính hình nổ
  wrap('heBoom', (e, r) => runeOf(e.x, e.y, r * 0.9, K.pal('fire'), 0.45, 6, 2.6));
  // Kết hợp hệ: Nổ khói, Sốc nhiệt
  wrap('combo', (kind, t) => runeOf(t.x, t.y, 32, K.pal(kind === 'smoke' ? 'fire' : 'ice'), 0.5, 8, kind === 'smoke' ? 2.4 : -3));

  // ====================================================================
  // MỖI KHUNG
  // ====================================================================
  let seenW = null, pDot = 0;
  function step(W, tick) {
    if (seenW !== W) { seenW = W; pDot = 0; }
    const P = W.P;
    if (tick) {
      // hạt độc nổi lên trên quái, trùm và em bé đang trúng độc
      for (const e of W.ents) if (!e.dead && !e.hidden && e.st && e.st.poisonN > 0) motes(e, e.st.poisonN);
      if (W.boss && !W.boss.dead && W.boss.st && W.boss.st.poisonN > 0) motes(W.boss, W.boss.st.poisonN);
      if (P && !P.dead && P.st.poison > 0) motes(P, 1);
      // tên của mình: một hạt nhỏ bám đường bay mỗi nhịp, mỗi mũi tên tối đa 6 hạt
      for (const o of W.projs) {
        if (o.team !== 'player' || o.kind !== 'arrow' || (o.kyN | 0) >= 6) continue;
        o.kyN = (o.kyN | 0) + 1;
        const sp = Math.hypot(o.vx, o.vy) || 1;
        if (pHat(0.8)) emit(0, o.x - (o.vx / sp) * 8, o.y - (o.z || 10) + rr(-1, 1), -o.vx * 0.04, rr(-6, 6), rr(0.12, 0.2), o.he ? K.pal(o.he.el).ramp : RAMP.white, 1, 0, 0, null, 1);
      }
    }
    // em bé mất máu vì độc: đồng hồ nhịp (P.dotT) vừa quay lại đầu là một nhịp
    if (P && !P.dead) {
      if (P.st.poison > 0 && P.dotT > pDot + 0.2) pulse(P, false);
      pDot = P.dotT;
    }
  }
  const he0 = fx.heStep;
  fx.heStep = function (W, dt, tick) {
    if (he0) he0(W, dt, tick);
    if (G.noRender) return;
    try { step(W, tick); } catch (e) { fail(e); }
  };
  fx.kyNang = { TOXIC, nHat, pHat, rung, khung, nhan, rune: runeOf, organic }; // cho js/fx_chuong.js và bài kiểm tra
  void api;
})();
