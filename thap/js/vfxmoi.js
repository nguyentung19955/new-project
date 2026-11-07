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
  // lệch pha khung theo đối tượng (đánh số lần đầu gặp — không ngẫu nhiên)
  pha(o) { let v = this._id.get(o); if (v == null) { v = (this._n++ * 7) % 13; this._id.set(o, v); } return v; },
};
if (typeof SIG_META !== 'undefined') Object.assign(SIG_META, VXM.META);

// hiệu ứng 1 lần: chạy n khung trong song giây tại (x, y)
HU.vxmPhat = {
  ve(ctx, o) {
    const m = SIG_META[o.ten]; if (!m) return; const u = o.t / o.song;
    VXM.k(ctx, o.ten, Math.min(m[0] - 1, u * m[0]), o.x, o.y, o.w, { a: u > 0.85 ? (1 - u) / 0.15 : 1, g: o.g || 0 });
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
      VXM.k(ctx, 'fx_orbital_bomno', Math.min(5, 0.6 + u * 5.4), o.x, o.y - 4, (o.r || 30) * 2.7, { a: u > 0.8 ? (1 - u) / 0.2 : 1 });
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
    PX.bong(ctx, o.x + 6, o.y + 12, 56, 42, 0.3 * a);
    VXM.k(ctx, 'fx_ronglua_dive', (o.t * 14) % 8, o.x, o.y, 68, { g: o.g, a }); // ảnh: đầu rồng hướng phải → xoay theo hướng bay
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
