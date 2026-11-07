// TURRET MERGE — GẮN 5 DẢI HIỆU ỨNG MỚI (rà soát VFX 07/11, docs/demo-hop-tuong/tuvan/vfx-ra-soat/BANG.md) + RỒNG BỔ NHÀO
//  Ảnh ChatGPT (docs/demo-hop-tuong/thap-art/raw_fx_*.png) cắt bởi tools/thap-cat-vfx5.py → assets/fx_<ten>.png (1 hàng n khung).
//  · Nine-Tail: lửa cáo (fx_cuuvi_hoho) thay cầu sáng tròn — mũi lửa kéo về phía sau hướng bay
//  · Orbital: nổ quỹ đạo (fx_orbital_bomno) đúng lúc bom trừ máu (HU.vetinh, t = 0.16 s)
//  · Mine Layer: mìn chờ đèn nháy (fx_min_mo) thay hình "nổ đứng yên"
//  · Mortar CLUSTER: nổ chùm 5 cánh (fx_mortar_chum) ở điểm rơi đạn chùm
//  · Drone Bay: drone bom rõ hơn (fx_drone_bom), quay theo hướng bay
//  · Wyrm Engine DRAGON DIVE: rồng nhìn từ trên (fx_ronglua_dive) lao dọc đường — đúng điểm trúng của HU.rongBo (bỏ đầu rồng to trên ụ)
//  CHỈ TRÌNH BÀY (QUY-TAC-HINH mục 3): đặt vị trí / xoay / phóng / mờ / chọn khung. Không đổi luật, không Math.random.
//  Ảnh chưa tải xong → vẽ hình cũ (đường vẽ dự phòng giữ nguyên). Nạp SAU vfxp3.js + sigfx.js.
'use strict';

const VXM = {
  META: { fx_cuuvi_hoho: [6, 87, 90], fx_orbital_bomno: [6, 288, 228], fx_min_mo: [6, 102, 89], fx_mortar_chum: [6, 328, 323], fx_drone_bom: [6, 95, 114], fx_ronglua_dive: [8, 217, 252] },
  // ụ → dải cần nạp sớm (khi ụ có trong bộ bài trên bàn)
  U: { cuuvi: ['fx_cuuvi_hoho'], orbital: ['fx_orbital_bomno'], min: ['fx_min_mo'], mortar: ['fx_mortar_chum'], drone: ['fx_drone_bom'], ronglua: ['fx_ronglua_dive'] },
  daNap: new Set(), _tNap: -9, _id: new WeakMap(), _n: 0,
  co(ten) { return !!(typeof SIG_META !== 'undefined' && SIG_META[ten] && typeof REN !== 'undefined' && REN.img(ten)); },
  k(ctx, ten, f, x, y, w, o) { return typeof SIG !== 'undefined' && SIG.k(ctx, ten, f, x, y, w, o); },
  nap(ep) {
    const t = typeof G !== 'undefined' ? G.t || 0 : 0;
    if (!ep && t - this._tNap < 1 && t >= this._tNap) return; this._tNap = t;
    try { for (const B of G.ban) for (const id of (B.deck || []).concat(B.t.filter(Boolean).map(T => T.id))) { const ds = this.U[id]; if (!ds || this.daNap.has(id)) continue; this.daNap.add(id); for (const k of ds) REN.img(k); } } catch (e) { }
  },
  // nổ to sát mép canvas (quái ở khúc đường sát mép bàn): không vẽ được ra ngoài canvas → dời tâm vào trong vừa đủ để phần ảnh có hình
  //   (≈ 84% khung, rìa ảnh trong suốt) nằm trong màn; dời tối đa 40% bề rộng để nổ vẫn bám điểm trúng. Chỉ trình bày (rà VFX 07/11).
  vao(x, y, w, h) {
    if (typeof REN === 'undefined' || !REN.cv) return [x, y];
    const k = (REN.s || 1) * (REN.dpr || 1), W = REN.cv.width / k, H = REN.cv.height / k, hx = w * 0.42, hy = (h == null ? w : h) * 0.42, m = w * 0.4;
    const kep = (v, a, b) => (a > b ? (a + b) / 2 : Math.max(a, Math.min(b, v)));
    const nx = kep(x, hx, W - hx), ny = kep(y, hy, H - hy);
    return [x + Math.max(-m, Math.min(m, nx - x)), y + Math.max(-m, Math.min(m, ny - y))];
  },
  // lệch pha khung theo đối tượng (đánh số lần đầu gặp — không ngẫu nhiên)
  pha(o) { let v = this._id.get(o); if (v == null) { v = (this._n++ * 7) % 13; this._id.set(o, v); } return v; },
};
if (typeof SIG_META !== 'undefined') Object.assign(SIG_META, VXM.META);

// hiệu ứng 1 lần: chạy n khung trong song giây tại (x, y)
HU.vxmPhat = {
  ve(ctx, o) {
    const m = SIG_META[o.ten]; if (!m) return; const u = o.t / o.song, [x, y] = VXM.vao(o.x, o.y, o.w, o.w * m[2] / m[1]);
    VXM.k(ctx, o.ten, Math.min(m[0] - 1, u * m[0]), x, y, o.w, { a: u > 0.85 ? (1 - u) / 0.15 : 1, g: o.g || 0 });
  },
};

(function () {
  if (typeof HU === 'undefined') return;
  // nạp sớm theo bộ bài (cùng nhịp với SIG.nap)
  if (typeof SIG !== 'undefined' && SIG.nap) { const n0 = SIG.nap; SIG.nap = function () { const r = n0.apply(this, arguments); VXM.nap(); return r; }; }

  // ---------- Nine-Tail: lửa cáo ----------
  if (HU.hoHoa) {
    const ve0 = HU.hoHoa.ve;
    HU.hoHoa.ve = function (ctx, o, R) {
      if (o.t < 0 || !VXM.co('fx_cuuvi_hoho')) return ve0.call(this, ctx, o, R);
      const mau = o.thuc ? '#9fe8ff' : '#ffa020';
      ctx.globalCompositeOperation = 'lighter'; // vệt đuôi mờ (đốm PNG như cũ, nhỏ hơn)
      for (let i = 0; i + 1 < o.vet.length; i += 2) { const a = (i + 2) / o.vet.length; ctx.globalAlpha = a * 0.45; R.anhGiua(ctx, R.cham1(mau), o.vet[i], o.vet[i + 1], 11 * a); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      const L = Math.hypot(o.vx, o.vy), g = L > 1 ? Math.atan2(-o.vx, o.vy) : 0; // mũi lửa (đỉnh ảnh) chĩa ngược hướng bay
      VXM.k(ctx, 'fx_cuuvi_hoho', (o.t * 12 + VXM.pha(o)) % 6, o.x, o.y, 26, { g, a: Math.min(1, o.t / 0.06) });
    };
  }

  // ---------- Orbital: nổ đúng lúc bom trừ máu ----------
  if (HU.vetinh) {
    const ve0 = HU.vetinh.ve;
    HU.vetinh.ve = function (ctx, o, R) {
      if (!VXM.co('fx_orbital_bomno')) return ve0.call(this, ctx, o, R);
      if (o.t < 0) return;
      if (!o.da) return ve0.call(this, ctx, o, R); // vạch báo rơi từ trời (giữ hình cũ) — trước khi trừ máu
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - (o.t - 0.16) / 0.12) * 0.7; // vạch tắt nhanh sau va chạm
      const y0 = -20; R.tia(ctx, 'dan_tia', o.x, y0, o.x, o.y, 22, 0, true);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      const u = Math.min(1, (o.t - 0.16) / 0.34); // 6 khung trong phần đời còn lại (0.16 → 0.5 s)
      const w = (o.r || 30) * 2.7, [x, y] = VXM.vao(o.x, o.y - 4, w, w * 228 / 288);
      VXM.k(ctx, 'fx_orbital_bomno', Math.min(5, 0.6 + u * 5.4), x, y, w, { a: u > 0.8 ? (1 - u) / 0.2 : 1 });
    };
  }

  // ---------- Mine Layer: mìn chờ, đèn nháy ----------
  if (HU.min) {
    const ve0 = HU.min.ve;
    HU.min.ve = function (ctx, o, R) {
      if (!VXM.co('fx_min_mo')) return ve0.call(this, ctx, o, R);
      const chu = 0.75, p = ((o.t + VXM.pha(o) * 0.05) % chu) / chu; // 0–2 tắt dần → 3–5 đèn đỏ sáng
      VXM.k(ctx, 'fx_min_mo', p * 6, o.x, o.y - 1, o.sao3 ? 32 : 25, { a: Math.min(1, o.t / 0.12) });
      if (o.sao3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55; R.anhGiua(ctx, R.cham1('#ffd23f'), o.x, o.y - 1, 30); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } // mìn sao ×3: quầng vàng
    };
  }

  // ---------- Drone Bay: drone bom ----------
  if (HU.drone) {
    const ve0 = HU.drone.ve;
    HU.drone.ve = function (ctx, o, R) {
      if (o.t < 0 || !VXM.co('fx_drone_bom')) return ve0.call(this, ctx, o, R);
      PX.bong(ctx, o.x + 3, o.y + 9, 22, 22, 0.35);
      VXM.k(ctx, 'fx_drone_bom', (R.t * 24 + VXM.pha(o)) % 6, o.x, o.y - 4, 34, { g: o.goc + Math.PI / 2 }); // ảnh: mũi lên trên → xoay theo hướng bay
      if (typeof P3 !== 'undefined' && typeof CG !== 'undefined') P3.nhip(o, o.t, 0.05, (k) => CG.K3.tung(o.x - Math.cos(o.goc) * 16, o.y - Math.sin(o.goc) * 16, '#7fdcff', 1, 40, 5, 0.22, k * 13 + 7, o.goc + Math.PI - 0.4, o.goc + Math.PI + 0.4));
    };
  }

  // ---------- Wyrm Engine DRAGON DIVE: rồng lao dọc đường (vị trí = điểm trúng thật của HU.rongBo) ----------
  if (HU.rongBo) {
    const ve0 = HU.rongBo.ve;
    HU.rongBo.ve = function (ctx, o, R) {
      if (!VXM.co('fx_ronglua_dive')) return ve0.call(this, ctx, o, R);
      if (typeof SIG !== 'undefined' && SIG.K && SIG.K.rong) return; // sigfx vẽ ở LỚP TRÊN (trên ảnh nổ trúng) — xem SIG.K.rong.ve dưới
      VXM.rong(ctx, o);
    };
  }
  VXM.rong = function (ctx, o) {
    if (o.x == null) return;
    const u = o.t / o.song, a = u < 0.06 ? u / 0.06 : u > 0.92 ? (1 - u) / 0.08 : 1;
    const [x, y] = VXM.vao(o.x, o.y, 68 * 0.8, 68 * 0.8); // xoay theo hướng bay → lấy hộp gần vuông; sải cánh có rìa trong suốt
    PX.bong(ctx, x + 6, y + 12, 56, 42, 0.3 * a);
    VXM.k(ctx, 'fx_ronglua_dive', (o.t * 14) % 8, x, y, 68, { g: o.g, a }); // ảnh: đầu rồng hướng phải → xoay theo hướng bay
  };
  // khoảnh khắc đặc biệt (sigfx M09): có rồng bổ nhào → bỏ đầu rồng to trên ụ + luồng lửa kẻ từ ụ (chỉ giữ dấu khởi động + huy hiệu kết)
  if (typeof SIG !== 'undefined' && SIG.K && SIG.K.rong) {
    const ve0 = SIG.K.rong.ve;
    SIG.K.rong.ve = function (ctx, m) {
      if (!VXM.co('fx_ronglua_dive')) return ve0.call(this, ctx, m);
      if (!m.ngan) { const fw = this.f(m.t, 0, 0.26, 6); if (fw >= 0) this.k(ctx, 'sig_m09_wake', fw, m.cx, m.cy - 8, 52); }
      if (m.tHet == null && m.o && HU.rongBo) VXM.rong(ctx, m.o); // rồng đang lao (đúng toạ độ trúng của HU.rongBo)
      if (m.tHet != null && m.x != null) { const fc = this.f(m.t - m.tHet, 0, 0.5, 5); if (fc >= 0) this.k(ctx, 'sig_m09_crest', fc, m.x, m.y, 64, { a: this.mo(m.t - m.tHet, 0, 0.5, 0.04, 0.15) }); }
    };
  }
})();

// =====================================================================================================
// HIỆU ỨNG TRÊN SÂN ĐẶT TRÊN ĐƯỜNG (user 07/11 23:09 — thay bản CẮT ảnh theo dải đường 19:05):
//   KHÔNG cắt/che ảnh nữa. Mỗi hiệu ứng ĐÁP XUỐNG SÂN (nổ, bổ nhào, vũng, mìn, tường, hố đen, sét, tuyết…) được
//   (a) dời TÂM / CHÂN (điểm chạm đất) lên TIM đường (điểm gần nhất trên polyline G.duong),
//   (b) thu nhỏ quanh tâm để khung ảnh ≤ VXD.DMAX (thân sáng ≈ 1,5 bề rộng đường) — mép ảnh được tràn ra ngoài đường (TRỪ Hố Đen: giữ cỡ thật = bán kính hút, user 07/11 23:26),
//   (c) không lố qua 2 ĐẦU đường: dời tâm vào trong dọc đường (không cắt ảnh).
//   Chỉ TRÌNH BÀY: vùng trúng / sát thương / thời điểm (cap() gốc) giữ nguyên.
// =====================================================================================================
const VXD = {
  HW: DUONG_RONG * 0.62, // nửa bề rộng dải đường (làn 46 px + chút viền ray)
  DMAX: DUONG_RONG * 2.2, // cỡ khung tối đa của ảnh nổ / vùng trên đường (~101 px; rìa ảnh trong suốt → thân ≈ 1,5 bề rộng đường)
  dang: 0, anim: [], vong: [],
  // ụ có đạn đáp xuống sân: nổ trúng của đạn này (FX.no / vòng) được đặt lại lên tim đường
  ID: new Set(['mortar', 'vungdoc', 'min', 'orbital']),
  // điểm trên tim đường gần (x, y) nhất; s kẹp trong [pad, len − pad] → ảnh rộng 2·pad không lố qua đầu đường
  ghim(x, y, pad) {
    if (typeof G === 'undefined' || !G.duong || !G.duong.length) return [x, y];
    let best = null, bd = 1e18;
    for (const P of G.duong) for (const g of P.segs) {
      const u = Math.max(0, Math.min(g.len, (x - g.x0) * g.dx + (y - g.y0) * g.dy)), px = g.x0 + g.dx * u, py = g.y0 + g.dy * u, d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < bd) { bd = d; best = [P, g.s0 + u]; }
    }
    if (!best) return [x, y];
    const P = best[0], p = Math.min(pad || 0, P.len / 2), [qx, qy] = viTri(P, Math.max(p, Math.min(P.len - p, best[1])));
    return [qx, qy];
  },
  he(D, M) { return D > 0 ? Math.min(1, (M || this.DMAX) / D) : 1; }, // hệ số thu nhỏ để cỡ D ≤ M
  // vẽ f() sau khi dời tâm (x, y) lên tim đường + thu nhỏ quanh tâm (cỡ vẽ gốc D → ≤ DMAX). Không clip.
  dat(ctx, x, y, D, f, M) {
    const k = this.he(D, M), [qx, qy] = this.ghim(x, y, D * k * 0.42);
    if (k === 1 && qx === x && qy === y) return f();
    ctx.save();
    try { ctx.translate(qx, qy); if (k < 1) ctx.scale(k, k); ctx.translate(-x, -y); return f(); } finally { ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  },
  // chỉ dời tâm (không thu nhỏ): tạm đặt o.x / o.y lên tim đường trong lúc vẽ
  doi(o, pad, f) {
    if (o.x == null) return f();
    const x = o.x, y = o.y, [qx, qy] = this.ghim(x, y, pad); o.x = qx; o.y = qy;
    try { return f(); } finally { o.x = x; o.y = y; }
  },
};

(function () {
  if (typeof HU === 'undefined' || typeof FX === 'undefined') return;
  // 1) lớp HU: dời tâm lên tim đường + thu nhỏ (D = cỡ vẽ gốc của từng hiệu ứng)
  const boc = (k, D, M) => { const H = HU[k]; if (!H || !H.ve || H._vxd) return; const v = H.ve; H._vxd = 1; H.ve = function (ctx, o, R) { if (o.x == null) return v.call(this, ctx, o, R); return VXD.dat(ctx, o.x, o.y, D(o), () => v.call(this, ctx, o, R), M); }; };
  boc('may', (o) => (o.r || 40) * 2.4); // Toxic Pool / mây độc: vũng ~2.4r
  boc('min', (o) => (o.sao3 ? 32 : 25)); // mìn chờ: chỉ dời tâm
  boc('hoden', (o) => (o.r || 64) * 2, 1e9); // Hố Đen: đĩa xoáy đường kính 2r — MIỄN giới hạn DMAX (user 07/11 23:26): mép xoáy = đúng bán kính hút o.r, chỉ dời tâm lên tim đường
  boc('vetChay', () => 40); // vệt cháy Dragon Dive
  boc('vxmPhat', (o) => o.w || 0); // nổ chùm Mortar (132 px → DMAX)
  // rồng bổ nhào (bản cũ + VXM.rong): tâm rồng trên tim đường, không lố qua đầu đường (VXM.rong ghim lại với pad nhỏ hơn → không dời 2 lần)
  if (HU.rongBo && HU.rongBo.ve) { const v = HU.rongBo.ve; HU.rongBo.ve = function (ctx, o, R) { return VXD.doi(o, 34, () => v.call(this, ctx, o, R)); }; }
  // tường: tâm tường lên tim đường (tia chiếu từ ụ tới đúng tâm mới) — tấm tường nằm ngang đường, rộng ≈ bề rộng đường, không cắt
  if (HU.tuong && HU.tuong.ve) { const v = HU.tuong.ve; HU.tuong.ve = function (ctx, o, R) { return VXD.doi(o, 10, () => v.call(this, ctx, o, R)); }; }
  // Overlord: đầu tia sét chạm đúng tim đường (tâm nổ cùng chỗ, xem lớp FX / p2fx dưới)
  if (HU.sam && HU.sam.ve) { const v = HU.sam.ve; HU.sam.ve = function (ctx, o, R) { return VXD.doi(o, VXD.DMAX * 0.42, () => v.call(this, ctx, o, R)); }; }
  // 2) lớp FX: nổ / vòng sinh ra trong cap() của hiệu ứng sân hoặc lúc đạn của ụ sân trúng → danh sách riêng, vẽ lại trên tim đường
  const gan = (k) => { const H = HU[k]; if (!H || !H.cap || H._vxdC) return; const c = H.cap; H._vxdC = 1; H.cap = function () { VXD.dang++; try { return c.apply(this, arguments); } finally { VXD.dang--; } }; };
  ['may', 'min', 'hoden', 'vetChay', 'rongBo', 'thoThuy', 'tuong', 'vetinh', 'sam'].forEach(gan);
  if (typeof capNhatDan === 'function') {
    const cd = capNhatDan;
    window.capNhatDan = function (d) { const on = d && d.T && VXD.ID.has(d.T.id); if (on) VXD.dang++; try { return cd.apply(this, arguments); } finally { if (on) VXD.dang--; } };
  }
  const tach = (ten, ds) => { const f = FX[ten]; FX[ten] = function () { const L = this[ds].length, r = f.apply(this, arguments); if (VXD.dang > 0 && this[ds].length > L) { const moi = this[ds].splice(L); for (const a of moi) if (a.ten !== 'chop_nong') VXD[ds].push(a); else this[ds].push(a); } return r; }; };
  tach('no', 'anim'); tach('vong1', 'vong');
  const cn = FX.capNhat; FX.capNhat = function (dt) {
    const r = cn.apply(this, arguments);
    for (const ds of [VXD.anim, VXD.vong]) for (let i = ds.length - 1; i >= 0; i--) { ds[i].t += dt; if (ds[i].t >= ds[i].song) ds.splice(i, 1); }
    return r;
  };
  const rs = FX.reset; FX.reset = function () { VXD.anim.length = 0; VXD.vong.length = 0; return rs.apply(this, arguments); };
  // vẽ: cùng cách REN.veFx vẽ dải nổ / vòng mảnh, nhưng tâm trên tim đường + cỡ ≤ DMAX (không clip)
  if (typeof REN !== 'undefined' && REN.veFx) {
    const vf = REN.veFx;
    REN.veFx = function (ctx) {
      const r = vf.apply(this, arguments);
      if (!VXD.anim.length && !VXD.vong.length) return r;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const a of VXD.anim) {
        const u = Math.min(1, a.t / a.song);
        let x = a.x, y = a.y; if (a.bam && !a.bam.chet) { x = a.bam.x; y = a.bam.y; }
        if (a.mot) { VXD.dang++; try { VXD.dat(ctx, x, y, (a.co || 0) * 1.06, () => this.veMot(ctx, a, u)); } finally { VXD.dang--; } ctx.globalCompositeOperation = 'lighter'; continue; } // vòng dư âm veMot sinh lúc VẼ (vd vòng hồng quanh sét Overlord) → vào VXD.vong: thu nhỏ ≤ DMAX + tâm trên tim đường (user 07/11 23:26)
        const sc = 0.9 + 0.16 * (1 - (1 - u) * (1 - u)); let al = Math.min(1, u / 0.06);
        if (u > 0.65) { const v = (u - 0.65) / 0.35; al *= 1 - v * v * (3 - 2 * v); }
        const co = Math.min(a.co * sc, VXD.DMAX), [qx, qy] = VXD.ghim(x, y, co * 0.42);
        ctx.globalAlpha = 1;
        const aI = this.img('fx_' + a.ten), nK = aI ? Math.round(aI.width / aI.height) : 6;
        this.khungMuot(ctx, 'fx_' + a.ten, u * (nK - 0.001), qx, qy, co, a.goc, Math.min(0.82, al) * (window.CG && CG.kA ? CG.kA(a) : 1));
      }
      const vm = typeof FXU !== 'undefined' && FXU.co('fx_vong_mong') && this.img('fx_vong_mong');
      if (vm) for (const v of VXD.vong) {
        const k = VXD.he(Math.max(v.r0, v.r1) * 2.3, VXD.DMAX * 1.1), u = v.t / v.song, e = 1 - (1 - u) * (1 - u), rr = Math.max(1, (v.r0 + (v.r1 - v.r0) * e) * k), im = FXU.mau('fx_vong_mong', v.mau);
        const [qx, qy] = VXD.ghim(v.x, v.y, Math.max(v.r0, v.r1) * k);
        if (im) { ctx.globalAlpha = (1 - u) * 0.85; ctx.drawImage(this.mip(im, rr * 2.3 * this.s * this.dpr), qx - rr * 1.15, qy - rr * 1.15, rr * 2.3, rr * 2.3); }
      }
      ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      return r;
    };
  }
  // tờ P2/P3 (nổ mìn p3_min, sét Overlord p2_overlord, tường vàng…) sinh ra trong cap() của hiệu ứng sân → đánh dấu, vẽ trên tim đường, cỡ ≤ DMAX
  const ph = G.hu.push; G.hu.push = function (...a) { if (VXD.dang > 0) for (const o of a) if (o && o.k === 'p2fx') o._vxd = 1; return ph.apply(this, a); };
  if (HU.p2fx && HU.p2fx.ve) {
    const v = HU.p2fx.ve;
    HU.p2fx.ve = function (ctx, o, R) {
      if (!o._vxd) return v.call(this, ctx, o, R);
      let x = o.x, y = o.y; if (o.E && !o.E.chet) { x = o.E.x; y = o.E.y; }
      return VXD.dat(ctx, x, y, o.w || 0, () => v.call(this, ctx, o, R));
    };
  }
  // Hố Đen khoảnh khắc đặc biệt (sigfx M01: mảnh đường / thấu kính / xoáy / nghiền): cùng tâm với đĩa xoáy HU.hoden, KHÔNG thu nhỏ (= bán kính hút thật)
  if (typeof SIG !== 'undefined' && SIG.K && SIG.K.hoden && SIG.K.hoden.ve) { const v = SIG.K.hoden.ve; SIG.K.hoden.ve = function (ctx, m, R) { if (m.x == null) return v.call(this, ctx, m, R); return VXD.dat(ctx, m.x, m.y, (m.r || 64) * 2, () => v.call(this, ctx, m, R), 1e9); }; } // cùng miễn DMAX với đĩa xoáy
  // 3) Bão Tuyết: bông tuyết rơi xuống TIM ĐƯỜNG (lệch ngang nhỏ) — hạt trình bày, không đổi luật
  if (HU.tuyet) HU.tuyet.cap = function (G, o) {
    if (o.t < 0.8 && G.duong && G.duong.length) for (let i = 0; i < 4; i++) {
      const P = G.duong[Math.floor(Math.random() * G.duong.length)], [x, y] = viTri(P, 6 + Math.random() * Math.max(0, P.len - 12)), l = (Math.random() - 0.5) * VXD.HW * 0.6;
      FX.hat1('lua', x + l, y - 48, 0, 60, 0.8, 3 + Math.random() * 3, '#e8fbff'); // rơi 48 px trong 0.8 s → chạm đúng mặt đường
    }
    return false;
  };
  // 4) nổ Orbital / nổ chùm Mortar: VXD.dat / doi đã dời tâm lên tim đường → VXM.vao không dời thêm (tránh dời 2 lần trong hệ đã biến đổi)
  VXM.vao = function (x, y) { return [x, y]; };
  if (HU.vetinh && HU.vetinh.ve) {
    const v = HU.vetinh.ve;
    HU.vetinh.ve = function (ctx, o, R) {
      const w = Math.min((o.r || 30) * 2.7, VXD.DMAX);
      return VXD.doi(o, w * 0.42, () => { // vạch rơi từ trời + nổ cùng chạm 1 điểm trên tim đường
        if (!o.da || o.t < 0 || !VXM.co('fx_orbital_bomno')) return v.call(this, ctx, o, R);
        const y0 = -20; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - (o.t - 0.16) / 0.12) * 0.7; R.tia(ctx, 'dan_tia', o.x, y0, o.x, o.y, 22, 0, true); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        const u = Math.min(1, (o.t - 0.16) / 0.34); // chân nổ (đáy ảnh ~ tâm) trên tim đường
        VXM.k(ctx, 'fx_orbital_bomno', Math.min(5, 0.6 + u * 5.4), o.x, o.y - 4, w, { a: u > 0.8 ? (1 - u) / 0.2 : 1 });
      });
    };
  }
  // 5) Rồng bổ nhào: rồng (68 px) + huy hiệu kết (64 px) trên tim đường, không lố qua đầu đường (không cắt)
  if (VXM.rong) {
    const r0 = VXM.rong;
    VXM.rong = function (ctx, o) { if (o.x == null) return; return VXD.doi(o, 30, () => r0.call(this, ctx, o)); };
  }
  if (typeof SIG !== 'undefined' && SIG.K && SIG.K.rong && SIG.K.rong.ve) {
    const v = SIG.K.rong.ve;
    SIG.K.rong.ve = function (ctx, m) {
      if (!VXM.co('fx_ronglua_dive')) return v.call(this, ctx, m); // bản cũ (đầu rồng trên ụ + luồng)
      if (!m.ngan) { const fw = this.f(m.t, 0, 0.26, 6); if (fw >= 0) this.k(ctx, 'sig_m09_wake', fw, m.cx, m.cy - 8, 52); } // dấu khởi động trên ô ụ
      if (m.tHet == null && m.o && HU.rongBo) VXM.rong(ctx, m.o);
      if (m.tHet != null && m.x != null) {
        const fc = this.f(m.t - m.tHet, 0, 0.5, 5), [qx, qy] = VXD.ghim(m.x, m.y, 27);
        if (fc >= 0) this.k(ctx, 'sig_m09_crest', fc, qx, qy, 64, { a: this.mo(m.t - m.tHet, 0, 0.5, 0.04, 0.15) });
      }
    };
  }
})();
