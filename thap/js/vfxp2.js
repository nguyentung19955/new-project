// TURRET MERGE — VFX P2: CHIÊU LỚN CÓ HOẠT ẢNH THẬT (docs/demo-hop-tuong/tuvan/vfx-p2/AUDIT.md, tuvan/vfx/YEU-CAU-ANIM.md)
//  User: "Hình ảnh như 1 cái ảnh rung vậy, không phải là animation" → KHÔNG còn 1 ảnh tĩnh bị lắc / phập phồng / xoay để giả chuyển động.
//  Mỗi chiêu lớn = tờ ChatGPT 4×4 (16 khung, cắt bởi tools/thap-cat-p2.py → assets/p2_<ten>.png, cỡ ở js/p2-meta.js) chạy ĐÚNG THỨ TỰ:
//  báo trước (anticipation) → trúng (impact) → dư âm (aftermath). Tờ chưa về: dùng dải khung có sẵn (fx_dien, fx_bang_vo, sig_m01_swirl…)
//  hoặc ảnh đứng yên chỉ mờ dần — không lắc/phập phồng.
//  CHỈ TRÌNH BÀY: không đổi vùng trúng / sát thương / thời điểm / mục tiêu; không Math.random (online lockstep); bản sao Copycat = cùng id
//  → cùng hình; mọi chế độ dùng chung HU/SKILLS nên SOLO / CO-OP / PVP / ONLINE / Turret File demo / hướng dẫn đều giống nhau.
//  EFFECTS: Minimal → bỏ phần dư âm dài; REDUCE FLASH → khung loé trúng mờ ×0,45.
'use strict';

const P2 = {
  M: typeof P2_META !== 'undefined' ? P2_META : {},
  // tên tờ theo ụ (id game → tờ)
  TO: { overlord: 'p2_overlord', lophanung: 'p2_cryo', khoathoigian: 'p2_chronolock', blackhole: 'p2_blackhole', tienhoa: 'p2_evolver',
    ngaithoigian: 'p2_rewind', orbital: 'p2_orbital', haoquang: 'p2_halo', xuonganh: 'p2_herotile', khoisinh: 'p2_genesis', lualien: 'p2_ember', saochep: 'p2_copycat' },
  co(ten) { if (!this.M[ten]) return null; const a = REN.img(ten); return a || null; },
  // vẽ khung f (thực, hoà 2 khung liền) của tờ `ten` tại (x,y), đường kính w (px logic); add = cộng sáng
  k(ctx, ten, f, x, y, w, al, goc, add) {
    if (!(al > 0.01) || f < 0) return !!this.co(ten);
    if (!this.co(ten)) return false;
    const g0 = ctx.globalAlpha, c0 = ctx.globalCompositeOperation;
    ctx.globalAlpha = 1; if (add) ctx.globalCompositeOperation = 'lighter';
    REN.khungMuot(ctx, ten, Math.min(15.999, f), x, y, w, goc || 0, Math.min(1, al));
    ctx.globalAlpha = g0; ctx.globalCompositeOperation = c0; return true;
  },
  // bảng pha: [[t0, t1, f0, f1, lặp_fps?], …] → khung (thực) tại t; ngoài mọi pha → -1
  f(t, P) {
    for (const p of P) if (t >= p[0] && t < p[1]) {
      if (p[4]) { const n = p[3] - p[2] + 1; return p[2] + ((t - p[0]) * p[4]) % n; }
      return p[2] + (t - p[0]) / (p[1] - p[0]) * (p[3] - p[2] + 0.999);
    }
    return -1;
  },
  gon() { return typeof CG !== 'undefined' && CG.gon(); },
  flash() { return typeof CG !== 'undefined' ? CG.kFlash() : 1; },
  // hiệu ứng 1 lần chạy theo bảng pha (t < 0 = chờ)
  phat(ten, x, y, w, P, song, o) { if (!this.M[ten]) return null; const h = Object.assign({ k: 'p2fx', t: 0, song, ten, x, y, w, P }, o); G.hu.push(h); return h; },
  // tải sẵn tờ của các ụ trong bộ bài lúc vào trận (ảnh tình huống: không chặn màn tải)
  napBo() {
    try { for (const B of G.ban) for (const id of (B.deck || []).concat(B.t.filter(Boolean).map(T => T.id))) { const t = this.TO[id]; if (t && this.M[t]) REN.img(t); } } catch (e) { }
  },
};

HU.p2fx = {
  ve(ctx, o) {
    if (o.t < 0) return;
    const f = P2.f(o.t, o.P); if (f < 0) return;
    const ra = o.ra || 0.15, a = Math.min(1, (o.song - o.t) / ra) * (o.a == null ? 1 : o.a);
    let x = o.x, y = o.y; if (o.E && !o.E.chet) { x = o.E.x; y = o.E.y; }
    P2.k(ctx, o.ten, f, x, y, o.w, a, o.goc || 0, o.add);
  },
};

// ===================================================== OVERLORD — sấm sét khổng lồ =====================================================
//  vùng trúng: HU.sam o.x,o.y bán kính o.r (92), sát thương lúc o.t > 0.08 — giữ nguyên.
//  có tờ: báo trước (khung 0–3) trên quái đầu khi thanh nạp ≥ 85% → trúng (4–10) → vết cháy + tia dư (11–15).
//  chưa có tờ: bỏ chớp nhấp nháy alpha; cột sét = dải fx_dien chạy khung (thay ảnh cột tĩnh co lại + 4 ảnh tĩnh trượt); vết cháy không phóng.
(function () {
  if (typeof HU === 'undefined' || !HU.sam) return;
  const T0 = 'p2_overlord';
  HU.sam.ve = function (ctx, o, R) { // tia từ nòng tới quái: hình sét đổi theo nhịp (hoạt ảnh thủ tục), mờ dần — không nhấp nháy alpha
    const u = o.t / o.song; if (P2.co(T0) && u > 0.45) return;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - u);
    const nhip = Math.floor(o.t / 0.06);
    R.set(ctx, o.x0, o.y0, o.x, o.y, 40, o.seed + nhip);
    if (!P2.co(T0)) { R.set(ctx, o.x + 14, -30, o.x, o.y, 60, o.seed + nhip * 3 + 1); R.set(ctx, o.x - 18, -30, o.x, o.y, 34, o.seed + nhip * 5 + 2); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
  const cap0 = HU.sam.cap;
  HU.sam.cap = function (G, o, dt) {
    const da = o.da, r = cap0.call(this, G, o, dt);
    if (!da && o.da && P2.M[T0]) { // trúng: khung 4 → 15 (dư âm ngắn hơn ở Minimal)
      const d = P2.gon() ? 0.75 : 1.25;
      P2.phat(T0, o.x, o.y, o.r * 2.7, [[0, 0.06, 3, 4], [0.06, 0.42, 5, 10], [0.42, d, 11, 15]], d, { add: true, ra: 0.3 });
    }
    return r;
  };
  const coc = HU.gCot && HU.gCot.ve;
  if (coc) HU.gCot.ve = function (ctx, o, R) {
    if (P2.co(T0)) return; // tờ mới đã có cột sét + sóng
    const im = PX.mau('fx_dien', '#ff3a6a'); if (!im) return coc.call(this, ctx, o, R); // điện tô ĐỎ-HỒNG = màu nguyên tố Overlord (thap-kt-mau: laser)
    const u = o.t / o.song, f = Math.min(5.99, u * 6), a = 1 - Math.max(0, u - 0.6) / 0.4;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) REN.khungMuot(ctx, 'fx_dien', (f + i * 2) % 6, o.x, o.y - 30 - i * 44, 62, Math.PI / 2, a, im); // cột sét = 3 khung điện chồng dọc, mỗi khung chạy riêng
    for (let i = 0; i < 4; i++) { const g = i * Math.PI / 2 + o.seed, L = o.r * 0.55; REN.khungMuot(ctx, 'fx_dien', Math.min(5.99, Math.max(0, u * 7 - i * 0.4)), o.x + Math.cos(g) * L, o.y + Math.sin(g) * L, 34, g, a * 0.9, im); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
  const xem = HU.gXem && HU.gXem.ve;
  if (xem) HU.gXem.ve = function (ctx, o, R) {
    if (P2.co(T0)) return;
    const u = o.t / o.song, a = u < 0.1 ? u / 0.1 : 1 - u;
    if (gV(ctx, 'fx_overlord_trung3', o.x, o.y, o.r * 2.1, 0, a * 0.85)) { ctx.globalAlpha = 1; return; } // vết cháy đứng yên, chỉ mờ dần
    xem.call(this, ctx, o, R);
  };
  // báo trước: thanh nạp ≥ 85% → khung 0–3 lặp trên quái đầu (đúng hàm chọn mục tiêu quaiDau của Overlord)
  P2.baoTruoc = function (ctx) {
    if (!P2.co(T0)) return;
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.id !== 'overlord' || !(T.nap > 0.85) || T.st.da || T.st.bang > 0) continue;
      const E = quaiDau(B); if (!E) continue;
      const k = (T.nap - 0.85) / 0.15;
      P2.k(ctx, T0, (G.t * 10) % 4, E.x, E.y, 92 * 2.7 * (0.55 + 0.25 * k), 0.35 + 0.45 * k, 0, true);
    }
  };
})();

// ===================================================== BLACK HOLE — xoáy giữa 1.1–3.0 s =====================================================
//  vùng: o.x,o.y bán kính o.r (hút + nghiền ở o.t ≥ 2.98) — giữ nguyên. Có tờ: xoáy 16 khung lặp (khung tự quay, mép = o.r).
//  Chưa có tờ: đĩa hu_hoden quay đều (không phập phồng bán kính) + dải sig_m01_swirl lặp khung đè lên (thay lõi tĩnh phập phồng).
(function () {
  if (typeof HU === 'undefined' || !HU.hoden) return;
  const T0 = 'p2_blackhole', ve0 = HU.hoden.ve;
  HU.hoden.ve = function (ctx, o, R) {
    const u = o.t / o.song, mo = Math.min(1, o.t / 0.3) * (u > 0.9 ? (1 - u) * 10 : 1);
    if (P2.co(T0)) { P2.k(ctx, T0, (o.t * 14) % 16, o.x, o.y, o.r * 2 / VUNG_ANH.p2_blackhole, mo); return; } // mép xoáy THẤY ĐƯỢC = bán kính hút/nghiền o.r
    const hd = R.co('hu_hoden', o.r * 2); if (!hd) return ve0.call(this, ctx, o, R);
    ctx.save(); ctx.translate(o.x, o.y); ctx.globalAlpha = mo; ctx.rotate(-o.t * 1.6); const rr = o.r * 1.03; ctx.drawImage(hd, -rr, -rr, rr * 2, rr * 2); ctx.restore();
    if (typeof SIG !== 'undefined' && SIG_META.sig_m01_swirl && REN.img('sig_m01_swirl')) SIG.k(ctx, 'sig_m01_swirl', Math.floor(o.t * 11) % 8, o.x, o.y, o.r * 2.1, { a: 0.55 * mo, add: true });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
})();

// ===================================================== CRYO REACTOR — FREEZE / ICE STORM =====================================================
//  vùng đóng băng: quaiTrongTam(B, T, r(T)×1.6), áp ngay lúc chạm — giữ nguyên. HU.gBaoLuoi chỉ là hình (o.r = vùng).
//  Có tờ: sương cuộn vào (0–3) → loé + vòng gai băng (4–7) → băng lan sàn (8–12) → tan (13–15), 1.1 s. Chưa có: dải fx_bang_vo chạy khung + sàn băng đứng yên mờ dần.
(function () {
  if (typeof HU === 'undefined' || !HU.gBaoLuoi) return;
  const T0 = 'p2_cryo', ve0 = HU.gBaoLuoi.ve, P = [[0, 0.12, 0, 3], [0.12, 0.36, 4, 7], [0.36, 0.8, 8, 12], [0.8, 1.1, 13, 15]];
  HU.gBaoLuoi.ve = function (ctx, o, R) {
    if (!GFX.coDOM) return;
    if (P2.co(T0)) { if (o.song < 1.1) o.song = P2.gon() ? 0.8 : 1.1; P2.k(ctx, T0, P2.f(o.t, P), o.x, o.y, o.r * 2 / VUNG_ANH.p2_cryo, Math.min(1, (o.song - o.t) / 0.2), 0, true); return; } // băng lan sàn (khung 8–11) chạm đúng mép vùng đóng băng o.r
    const u = o.t / o.song; if (!REN.img('fx_bang_vo')) return ve0.call(this, ctx, o, R);
    ctx.globalCompositeOperation = 'lighter';
    veSanBang(ctx, o.x, o.y, o.r, (1 - u) * 0.85, 0);
    REN.khungMuot(ctx, 'fx_bang_vo', Math.min(5.99, u * 6), o.x, o.y, o.r * 1.5, 0, (1 - u * u) * 0.9);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
})();

// ===================================================== CHRONO LOCK — ấn khoá thời gian =====================================================
//  vùng/khoảng: theo quái o.E trong o.song; nổ dồn noLan(o.x,o.y,40) lúc hết giờ — giữ nguyên. Có tờ: vẽ vòng (0–3) → giữ lặp (4–11) → vỡ (12–15).
(function () {
  if (typeof HU === 'undefined' || !HU.khoa) return;
  const T0 = 'p2_chronolock', no0 = HU.khoa.no;
  HU.khoa.no = function (G, o) {
    const da = o.daNo; no0.call(this, G, o);
    if (!da && o.daNo && P2.M[T0]) { const r = ((o.E.d && o.E.d.co) || 40) * 0.58 + 4; P2.phat(T0, o.x, o.y, r * 2.6, [[0, 0.4, 12, 15]], 0.4, { add: true }); }
  };
  HU.khoa.p2 = function (ctx, o, x, y, r) { // gọi từ HU.khoa.ve (skills3.js): true = đã vẽ ấn bằng tờ khung
    if (!P2.co(T0)) return false;
    P2.k(ctx, T0, P2.f(o.t, [[0, 0.25, 0, 3], [0.25, 1e9, 4, 11, 8]]), x, y, r * 2.6, 0.9, 0, true);
    return true;
  };
})();

// ===================================================== CHRONO THRONE — REWIND =====================================================
//  đẩy lùi + sát thương tức thì (skills3) — giữ nguyên. Mặt đồng hồ quay ngược: có tờ → 16 khung theo thứ tự; chưa có → đứng yên mờ dần (không xoay ảnh).
HU.rewind && (HU.rewind.p2 = function (ctx, o, c, r, a) {
  if (!P2.co('p2_rewind')) return false;
  P2.k(ctx, 'p2_rewind', Math.min(15.99, o.t / o.song * 16), c.x, c.y, r * 2.2, a, 0, true); return true;
});

// ===================================================== EVOLVER — bom tiến hoá đếm ngược (growfx.js veEvoBom) =====================================================
//  thời gian đếm: SKILLS.tienhoa.con(T) — giữ nguyên. Có tờ: khung 0–7 lặp (tích), 3 s cuối khung 8–15 lặp nhanh (nứt sáng). Không lắc/phập phồng.
P2.evoBom = function (ctx, T, d, cuoi, al) {
  if (!P2.co('p2_evolver')) return false;
  const t = G.t + (T.o || 0) * 0.37;
  P2.k(ctx, 'p2_evolver', cuoi ? 8 + (t * 16) % 8 : (t * 8) % 8, 0, 0, d * 1.15, al);
  return true;
};

// ===================================================== ORBITAL — thức tỉnh 23 s+ =====================================================
//  bom/salvo không đổi. Vòng thức tỉnh: có tờ → 16 khung lặp (vệ tinh bay theo khung); chưa có → ảnh đứng yên, chỉ mờ dần 2 s cuối (bỏ xoay + nhấp nháy).
(function () {
  const sk = typeof SKILLS !== 'undefined' && SKILLS.orbital; if (!sk) return;
  sk.veThem = function (ctx, T, S, al, R) {
    if (!(T.thucT > 0)) return;
    const a = al * Math.min(1, T.thucT / 2, ((T.thucMax || 23) - T.thucT) / 0.3 + 0.001);
    if (P2.k(ctx, 'p2_orbital', (G.t * 12 + (T.o || 0) * 3) % 16, 0, 0, S * 1.35, a, 0, true)) return;
    if (typeof FXU === 'undefined' || !FXU.co('fx_orbital_thuc')) return;
    ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, 'fx_orbital_thuc', 0, 0, S * 1.3, 0, a * 0.85);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
})();

// ===================================================== HERO FOUNDRY — ô anh hùng 12 s / EMBER RELAY — lửa chuyền =====================================================
(function () {
  if (typeof HU === 'undefined') return;
  if (HU.vm1Hero) HU.vm1Hero.ve = function (ctx, o) {
    const B = o.B; if (!B || !B.hero) return;
    const im = REN.img('tier_ring_vang');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const h of B.hero) {
      const c = B.o[h.o], con = h.het - G.t, a = Math.min(1, con / 1.5, Math.max(0, G.t - h.t0 - 0.5) / 0.25), w = Math.min(B.cw, B.ch) * 1.05;
      if (a <= 0) continue;
      if (P2.k(ctx, 'p2_herotile', (G.t * 12 + h.o * 5) % 16, c.x, c.y, w * 1.1, a, 0, true)) continue;
      if (im) PX.ve(ctx, im, c.x, c.y, w, w, 0, a * 0.8); // chưa có tờ: vòng vàng đứng yên (bỏ xoay + nhấp nháy)
    }
    ctx.restore(); ctx.globalAlpha = 1;
  };
  if (HU.vm1Tia) HU.vm1Tia.ve = function (ctx, o) { // ngọn lửa bay sang ô kề: có tờ → lửa 16 khung cháy thật trên đường bay
    const p = Math.min(1, o.t / o.song), x = o.x0 + (o.x1 - o.x0) * p, y = o.y0 + (o.y1 - o.y0) * p, g = Math.atan2(o.y1 - o.y0, o.x1 - o.x0);
    if (P2.k(ctx, 'p2_ember', (o.t * 24) % 16, x, y, 26, 1 - p * 0.3, g, true)) return;
    const im = REN.img('fx_cuuvi_dan'); if (!im) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, im, x, y, 22, 22, g, 1 - p * 0.3); ctx.restore(); ctx.globalAlpha = 1;
  };
  const sk = typeof SKILLS !== 'undefined' && SKILLS.lualien;
  if (sk && sk.veThem) sk.veThem = function (ctx, T, S, al) { // lửa đang mang: có tờ → lửa sống 16 khung; chưa có → cỡ cố định (bỏ phập phồng)
    const n = Math.min(8, T.lc || 0); if (!n) return; // Lửa Thập Tự: hình bão hoà ở 8 (số lửa không trần) — 4 nhánh + lõi lớn dần từ 5 lửa
    const pos = [[1, 0], [0, 1], [-1, 0], [0, -1]], r = S * 0.36, co = !!P2.co('p2_ember'), im = co ? null : REN.img('fx_cuuvi_dan');
    if (!co && !im) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < Math.min(4, n); i++) { if (co) P2.k(ctx, 'p2_ember', (G.t * 20 + i * 4) % 16, pos[i][0] * r, pos[i][1] * r, S * 0.26, al * 0.9, -Math.PI / 2, true); else PX.ve(ctx, im, pos[i][0] * r, pos[i][1] * r, S * 0.21, S * 0.21, -Math.PI / 2, al * 0.85); }
    if (n >= 5) { const k = 1 + 0.08 * (n - 5); if (co) P2.k(ctx, 'p2_ember', (G.t * 20 + 9) % 16, 0, 0, S * 0.36 * k, al * 0.7, -Math.PI / 2, true); else PX.ve(ctx, im, 0, 0, S * 0.29 * k, S * 0.29 * k, -Math.PI / 2, al * 0.6); }
    ctx.globalCompositeOperation = 'source-over';
  };
})();

// ===================================================== HOLY HALO / GENESIS / COPYCAT — chiêu chưa có hình riêng: thêm tờ khi về =====================================================
(function () {
  if (typeof SKILLS === 'undefined') return;
  const H = SKILLS.haoquang;
  if (H && H.chuDong) { const cd = H.chuDong; H.chuDong = function (G, B, T) {
    const ok = cd.apply(this, arguments);
    if (ok && P2.M.p2_halo) { // vòm thánh trên ụ: dựng (0–3) → vòm (4–7) → giữ lặp (8–11) suốt thời gian khiên → vỡ thành lông vũ sáng (12–15)
      const c = tamU(T), d = this.tg(T), w = Math.min(B.cw, B.ch) * 2.6;
      P2.phat('p2_halo', c.x, c.y, w, [[0, 0.22, 0, 3], [0.22, 0.5, 4, 7], [0.5, d - 0.4, 8, 11, 10], [d - 0.4, d, 12, 15]], d, { add: true, ra: 0.1, a: 0.62 }); // mờ: không che ụ đang bắn
    }
    return ok;
  }; }
  const K = SKILLS.khoisinh;
  if (K && K.chuDong) { const cd = K.chuDong; K.chuDong = function (G) {
    const n0 = G.hu.length, ok = cd.apply(this, arguments);
    if (ok && P2.M.p2_genesis) for (let i = n0; i < G.hu.length; i++) { const h = G.hu[i]; if (h.k !== 'cungSang') continue; // ụ mới mọc: hạt → nở hoa → cột sáng → tan
      const B = arguments[1], w = Math.min(B.cw, B.ch) * 1.7;
      P2.phat('p2_genesis', h.x1, h.y1, w, [[0, 0.1, 0, 3], [0.1, 0.35, 4, 8], [0.35, 0.85, 9, 15]], 0.85, { t: h.t - h.song * 0.8, add: true });
    }
    return ok;
  }; }
  const S = SKILLS.saochep;
  if (S && S.ghepDB && S.ghepDB.lam) { const lam = S.ghepDB.lam; S.ghepDB.lam = function (G, B, a) {
    const r = lam.apply(this, arguments);
    if (P2.M.p2_copycat) { const c = B.o[a.o]; if (c) P2.phat('p2_copycat', c.x, c.y, Math.min(B.cw, B.ch) * 1.5, [[0, 0.75, 0, 15]], 0.75, { add: true }); }
    return r;
  }; }
})();

// lớp vẽ chung (báo trước Overlord) — vẽ sau VX.veDs (không thêm mục vào G.hu), + tải sẵn tờ lúc vào trận
if (typeof VX !== 'undefined' && VX.veDs) { const vd = VX.veDs; VX.veDs = function (ctx, R) { const r = vd.apply(this, arguments); try { P2.baoTruoc && P2.baoTruoc(ctx); } catch (e) { } return r; }; }
if (typeof batDau === 'function') { const bd = batDau; batDau = function () { const r = bd.apply(this, arguments); P2.napBo(); return r; }; }
