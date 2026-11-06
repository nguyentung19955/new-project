// TURRET MERGE — BÁO CHIÊU TRÙM + KHOẢNH KHẮC CHỈ HUY (review VFX-93 mục IV, V, II.C, X "Boss 6 cũ + 6 mới")
//  CHỈ HIỂN THỊ: không đổi luật, thời gian (1,4 s), sát thương, cách chọn mục tiêu của trùm/chỉ huy. Online tất định: không
//  Math.random, không ghi vào trạng thái luật (chỉ T.st.ngamK = tên dấu để render.js biết ô này do TVF vẽ).
//  · Mỗi loại chiêu 1 DẤU riêng trên ô bị nhắm (không dùng tâm ngắm đỏ phu_ngam của Sniper/Focus Lens):
//      đổi loại (Mad Crown) · băng (Freezer) · đá (Janus) · mimic (Joker) · bắn tỉa 4 góc (Nightmare) · mắt lửa (Octopus)
//      · xích nhiễu (Jammer) · hút sao (Leech). Trùm tự niệm (Hive / Patch Titan / Prism) → vòng dưới chân trùm.
//  · Nhịp 1,4 s: 0–0,4 dấu rơi vào (to → vừa) · 0,4–1,0 giữ, thở chậm · 1,0–1,4 nén lại (nhỏ dần, sáng dần) · 0 = chiêu nổ.
//    Tiến độ đọc từ E.bao.t/E.bao.song (đúng nhịp của trùm kể cả khi bị chậm) — không nhấp nháy nhanh (≤ 3 Hz, không chớp màn).
//  · Ô có khiên (Máy Khiên / khiên bàn) → thêm viền lục giác lam nhạt = "sẽ được chặn". Lúc nổ: trúng → dấu đập mạnh rồi tan;
//    bị chặn → dấu tô lam, co lại vỡ (cùng lục giác chặn sẵn có VX.chanKhien).
//  · Máu/pha trùm: Prism = các mảnh khiên quanh trùm (vỡ theo số loại ụ đã bắn) · Leech = số sao đang giữ · Twin Core = nứt khi
//    < 30% máu (sắp tách) · gần lối ra = số tim sẽ mất (ảnh tim × E.tim).
//  · Chỉ huy: REINFORCE = khoang thả rơi xuống ô / tia nâng sao khi bàn đầy · RAGE = viền cam quanh ô ụ có sát thương (quét
//    lan từ giữa bàn lúc bật, thở chậm, 2 s cuối nhịp báo hết) · HOLY SHIELD = lưới khiên trên từng ô (lan từ giữa ra).
//    Không chớp toàn màn (bỏ FX.sang ở dungMV).
//  · Ảnh: CHỈ ảnh ChatGPT. Ảnh riêng (tb_*, cmd_*) chưa về → mượn ảnh có sẵn (TVF.TAM). Có ảnh → thêm tên vào TVF.CO.
//  Nạp sau nongskill.js. Không cấp phát mỗi khung (bể đối tượng, ảnh tô màu dựng 1 lần).
'use strict';
const TVF = {
  // ảnh riêng đã về (thap/assets/<ten>.png) — tools cắt ảnh thêm tên vào đây
  CO: new Set([]),
  // tên ảnh riêng → ảnh mượn trong lúc chờ (ảnh có sẵn, cùng ý nghĩa nhất)
  TAM: {
    tb_doiloai: 'fx_st_cauvong', tb_bang: 'hu_vongbang', tb_da: 'cf_vong_ren', tb_mimic: 'tier_ring_vang', tb_snipe: 'fx_st_dau',
    tb_lua: 'fx_st_chay', tb_xich: 'sup_ring', tb_sao: 'fx_st_choang', tb_khien: 'fx_vong_mong', tb_trum: 'fx_vong_mong',
    tb_suachua: 'h2_vong_xanh', tb_to: 'fx_vong_mong', prism_seg: 'seg_sang',
    cmd_capsule: 'fx_vong_trieu', cmd_rage: 'h2_vong_do', cmd_khien: 'o_vien_xanh',
  },
  // ảnh mượn cần tô màu (vòng trắng fx_vong_mong)
  TO: { tb_khien: '#9fd8ff', tb_trum: '#ff7a3a', tb_to: '#ffb648', cmd_rage: '#ff9a3a' },
  DAU: { mad_crown: 'tb_doiloai', freezer: 'tb_bang', janus: 'tb_da', joker_king: 'tb_mimic', nightmare: 'tb_snipe', octopus: 'tb_lua', jammer: 'tb_xich', leech: 'tb_sao' },
  VONG: { hive: 'tb_to', patcher: 'tb_suachua', prism: 'tb_trum' }, // trùm tự niệm: vòng dưới chân
  XOAY: { tb_snipe: 0, tb_sao: 0, tb_mimic: 0.35 },                  // tốc xoay dấu (rad/s); mặc định 0.6
  CHAN_MAU: '#9fd4ff',
  ds: [], _bo: [],     // dấu đang báo: { E, bao, B, o, T, ten }
  pop: [], _boP: [],   // dấu đang nổ/vỡ + hiệu ứng chỉ huy: { k, B, o, x, y, t0, song, ten, mau }
  mv: [],              // bật RAGE / HOLY SHIELD: { B, k, t0 }
  _chan: null,         // ô bị chặn trong lúc trùm tung chiêu (thu từ VX.chanKhien)
  _tm: {},
  t() { return typeof REN !== 'undefined' ? REN.t : 0; },
  tg() { return typeof G !== 'undefined' && G.t || 0; }, // đồng hồ trận (theo tốc độ 1×/2×/3×, dừng khi tạm dừng) — nhịp nổ/chỉ huy
  ten(n) { return this.CO.has(n) ? n : this.TAM[n] || n; },
  anh(n) { // ảnh dấu (đã tô màu nếu là ảnh mượn trắng) — dựng 1 lần
    const c = this._tm[n]; if (c) return c;
    const t = this.ten(n), m = !this.CO.has(n) && this.TO[n];
    const a = m ? (typeof FXU !== 'undefined' && REN.img(t) ? FXU.mau(t, m) : null) : REN.img(t);
    if (a && (m || t === n)) this._tm[n] = a;
    return a;
  },
  anhChan(n) { // bản tô lam của dấu (bị chặn)
    const k = 'chan|' + n, c = this._tm[k]; if (c) return c;
    const t = this.ten(n); if (!REN.img(t) || typeof FXU === 'undefined') return null;
    return (this._tm[k] = FXU.mau(t, this.CHAN_MAU));
  },
  napTruoc(id) {
    if (typeof REN === 'undefined') return;
    const L = [this.DAU[id], this.VONG[id], 'tb_khien', 'tb_trum', id === 'prism' ? 'prism_seg' : null, 'seg_tat', 'ui_tim'];
    for (const n of L) if (n) REN.img(this.ten(n));
  },
  // ---------- luồng luật → hiển thị ----------
  batDau(E) { // trùm vừa báo chiêu
    const ten = this.DAU[E.trum]; if (!ten || !E.bao) return;
    const them = (B, uids) => { if (!B || !uids) return; for (const T of B.t) if (T && uids.includes(T.uid)) {
      const d = this._bo.pop() || {}; d.E = E; d.bao = E.bao; d.B = B; d.o = T.o; d.T = T; d.ten = ten; T.st.ngamK = ten; this.ds.push(d); } };
    them(G.ban[E.ban], E.bao.muc);
    if (E.bao.ban2 != null) them(G.ban[E.bao.ban2], E.bao.muc2);
  },
  no(E, bao) { // chiêu nổ (bao = báo chiêu vừa xong)
    for (let i = this.ds.length - 1; i >= 0; i--) {
      const d = this.ds[i]; if (d.bao !== bao) continue;
      const chan = this._chan && this._chan.has(d.B.i * 100 + d.o);
      this.themPop(chan ? 'chan' : 'trung', d.B, d.o, d.B.o[d.o].x, d.B.o[d.o].y, chan ? 0.34 : 0.28, d.ten, TRUM[E.trum] ? TRUM[E.trum].mau : '#fff');
      if (d.T.st.ngamK === d.ten) d.T.st.ngamK = null;
      this.boDs(i);
    }
    const v = this.VONG[E.trum]; if (v) this.themPop('vong', null, -1, E.x, E.y, 0.3, v, '', E);
  },
  boDs(i) { const d = this.ds[i]; d.E = d.bao = d.B = d.T = null; this._bo.push(d); this.ds[i] = this.ds[this.ds.length - 1]; this.ds.pop(); },
  themPop(k, B, o, x, y, song, ten, mau, E) {
    if (this.pop.length > 40) return;
    const p = this._boP.pop() || {}; p.k = k; p.B = B; p.o = o; p.x = x; p.y = y; p.t0 = this.tg(); p.song = song; p.ten = ten; p.mau = mau; p.E = E || null;
    this.pop.push(p);
  },
  // chỉ huy vừa dùng (CH.dung → r.ok)
  chiHuy(B, r) {
    const d = MAVUONG[r.id]; if (!d) return;
    if (r.id === 'hero') {
      for (const T of r.sinh) this.themPop('cap', B, T.o, B.o[T.o].x, B.o[T.o].y, 0.42, 'cmd_capsule', d.mau);
      for (const T of r.nang) this.themPop('tiaSao', B, T.o, B.o[T.o].x, B.o[T.o].y, 0.5, '', '#ffe27a');
    } else if (d.khoa === 'cuong' || d.khoa === 'khien') {
      for (let i = this.mv.length - 1; i >= 0; i--) if (this.mv[i].B === B && this.mv[i].k === d.khoa) this.mv.splice(i, 1);
      this.mv.push({ B, k: d.khoa, t0: this.tg() });
    }
  },
  // ---------- vẽ ----------
  // nhịp báo chiêu: u = 0..1 trên 1,4 s → [cỡ, độ đậm]
  nhip(u, out) {
    const s = u * 1.4;
    if (s < 0.4) { const e = s / 0.4, k = 1 - (1 - e) * (1 - e); out[0] = 1.45 - 0.45 * k; out[1] = 0.95 * k; }
    else if (s < 1.0) { out[0] = 1; out[1] = 0.8 + 0.12 * Math.sin((s - 0.4) * Math.PI * 2 * 2.5); }
    else { const e = Math.min(1, (s - 1.0) / 0.4); out[0] = 1 - 0.18 * e; out[1] = 0.9 + 0.1 * e; }
    return out;
  },
  _n: [0, 0],
  veDau(ctx) { // dấu trên ô bị nhắm (trên ụ, dưới huy hiệu sao)
    if (!this.ds.length) return;
    const t = this.t();
    for (let i = this.ds.length - 1; i >= 0; i--) {
      const d = this.ds[i], E = d.E, T = d.T;
      if (E.chet || E.bao !== d.bao || d.B.t[d.o] !== T || !(T.st.ngam > 0)) { if (T.st.ngamK === d.ten) T.st.ngamK = null; this.boDs(i); continue; }
      const c = d.B.o[d.o], C = Math.min(d.B.cw, d.B.ch), u = clamp(d.bao.t / (d.bao.song || 1.4), 0, 1);
      const n = this.nhip(u, this._n), xo = this.XOAY[d.ten] != null ? this.XOAY[d.ten] : 0.6, goc = t * xo * (u > 0.71 ? 2 : 1);
      // sẽ được chặn: viền lục giác lam nhạt (không hứa 100% với Halo — chỉ báo có khiên)
      if (T.khien > 0 || d.B.khien > 0) PX.ve(ctx, this.anh('tb_khien'), c.x, c.y, C * 1.08, C * 1.08, 0, 0.75);
      PX.ve(ctx, this.anh(d.ten), c.x, c.y, C * 0.98 * n[0], C * 0.98 * n[0], goc, n[1]);
    }
    ctx.globalAlpha = 1;
  },
  veVongTrum(ctx) { // vòng dưới chân trùm: báo chiêu tự niệm / mọi trùm đang báo (vòng tô màu trùm) / Leech lao
    const t = this.t();
    for (const E of G.quai) {
      if (!E.trum || E.chet) continue;
      const co = E.d.co;
      if (E.bao) {
        const u = clamp(E.bao.t / (E.bao.song || 1.4), 0, 1), n = this.nhip(u, this._n), v = this.VONG[E.trum] || 'tb_trum';
        PX.ve(ctx, this.anh(v), E.x, E.y + co * 0.12, co * 1.35 * n[0], co * 1.35 * n[0] * 0.62, 0, n[1] * 0.9);
      } else if (E.dashT > 0) PX.ve(ctx, this.anh('tb_sao'), E.x, E.y + co * 0.12, co * 1.2, co * 0.74, t * 6, 0.7);
    }
    ctx.globalAlpha = 1;
  },
  veTrenTrum(ctx) { // pha / máu trùm: khiên Prism, sao Leech giữ, nứt Twin Core, tim sẽ mất gần lối ra
    const t = this.t();
    for (const E of G.quai) {
      if (!E.trum || E.chet) continue;
      const co = E.d.co, x = E.x, y = E.y, yb = y - co * 0.55;
      const K = E.khien;
      if (K && K.can) { // mảnh khiên: còn = sáng, đã vỡ (đủ loại ụ khác nhau) = tối; khiên tắt → mờ cả vòng chờ dựng lại
        const r = co * 0.56, seg = this.CO.has('prism_seg');
        for (let i = 0; i < K.can; i++) {
          const a = -Math.PI / 2 + i * Math.PI * 2 / K.can, con = K.on && i >= K.ds.size;
          const im = con ? this.anh('prism_seg') : (seg ? this.anhChan('prism_seg') : REN.img('seg_tat'));
          const w = seg ? co * 0.62 : 9;
          PX.ve(ctx, im, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, w, w, seg ? a + Math.PI / 2 : 0, K.on ? (con ? 0.95 : 0.45) : 0.3);
        }
      }
      if (E.kho > 0) { const s = REN.img('h2_sao'); for (let i = 0; i < Math.min(5, E.kho); i++) PX.ve(ctx, s, x - (Math.min(5, E.kho) - 1) * 5 + i * 10, yb - 9, 9, 9, 0, 0.95); }
      if (E.trum === 'twin_core' && !E.con && E.hp < E.max * 0.3) PX.ve(ctx, REN.img('fx_st_giapvo'), x, y, co * 0.8, co * 0.8, 0, 0.55 + 0.2 * Math.sin(t * 4));
      const p = G.duong[E.p];
      if (p && E.s > p.len * 0.7) { // gần lối ra: E.tim trái tim sẽ mất
        const im = REN.img('ui_tim'), a = 0.75 + 0.25 * Math.sin(t * 4);
        for (let i = 0; i < E.tim; i++) PX.ve(ctx, im, x - 35 - 6 - i * 9, yb + 2, 9, 9, 0, a);
      }
    }
    ctx.globalAlpha = 1;
  },
  // RAGE / HOLY SHIELD trên từng ô (dưới ụ)
  veO(ctx) {
    const t = this.t(), tg = this.tg();
    for (const B of G.ban) {
      const cu = B.cuong > 0, kh = B.khien > 0 && !(B.halo > 0 && B.khien <= B.halo + 0.05);
      if (!cu && !kh) continue;
      const C = Math.min(B.cw, B.ch), cx = B.x + B.w / 2, cy = B.y + B.h / 2, dg = Math.hypot(B.w, B.h) / 2;
      for (let j = 0; j < 2; j++) {
        const k = j ? 'khien' : 'cuong'; if (j ? !kh : !cu) continue;
        const con = j ? B.khien : B.cuong, m = this.timMv(B, k), t0 = m ? m.t0 : -9;
        const tho = con < 2 ? 0.55 + 0.35 * Math.abs(Math.sin(t * Math.PI * 2)) : 0.78 + 0.12 * Math.sin(t * 3);
        const im = this.anh(j ? 'cmd_khien' : 'cmd_rage');
        for (let i = 0; i < 15; i++) {
          const T = B.t[i]; if (!T) continue;
          if (!j && !(SKILLS[T.id] && SKILLS[T.id].dmg)) continue; // RAGE ×2 sát thương: chỉ ụ có sát thương
          const c = B.o[i], e = (tg - t0 - Math.hypot(c.x - cx, c.y - cy) / dg * 0.3) / 0.2; // lan từ giữa bàn ra
          if (e < 0) continue;
          const f = e < 1 ? 1.18 - 0.18 * e : 1;
          PX.ve(ctx, im, c.x, c.y, C * 0.98 * f, C * 0.98 * f, 0, (e < 1 ? e : 1) * tho * (j ? 0.7 : 0.85));
        }
      }
    }
    ctx.globalAlpha = 1;
  },
  timMv(B, k) { for (const m of this.mv) if (m.B === B && m.k === k) return m; return null; },
  vePop(ctx) {
    if (!this.pop.length) return;
    const t = this.tg();
    for (let i = this.pop.length - 1; i >= 0; i--) {
      const p = this.pop[i], e = (t - p.t0) / p.song;
      if (e >= 1 || e < 0) { p.B = p.E = null; this._boP.push(p); this.pop[i] = this.pop[this.pop.length - 1]; this.pop.pop(); continue; }
      const C = p.B ? Math.min(p.B.cw, p.B.ch) : 40;
      if (p.k === 'trung') { // chiêu trúng: dấu đập từ 0,82 → 1,3, tan
        ctx.globalCompositeOperation = 'lighter';
        PX.ve(ctx, this.anh(p.ten), p.x, p.y, C * (0.8 + 0.5 * e), C * (0.8 + 0.5 * e), 0, 1 - e);
        ctx.globalCompositeOperation = 'source-over';
      } else if (p.k === 'chan') { // bị chặn: dấu tô lam co lại, lắc nhẹ, tan
        PX.ve(ctx, this.anhChan(p.ten), p.x + Math.sin(e * 30) * 2 * (1 - e), p.y, C * (0.8 - 0.25 * e), C * (0.8 - 0.25 * e), 0, 1 - e * e);
      } else if (p.k === 'vong') { // trùm tự niệm: vòng chân bung ra
        const E = p.E, co = E ? E.d.co : 80, x = E && !E.chet ? E.x : p.x, y = E && !E.chet ? E.y : p.y;
        ctx.globalCompositeOperation = 'lighter';
        PX.ve(ctx, this.anh(p.ten), x, y + co * 0.12, co * (1.1 + 0.7 * e), co * (1.1 + 0.7 * e) * 0.62, 0, 1 - e);
        ctx.globalCompositeOperation = 'source-over';
      } else if (p.k === 'cap') { // REINFORCE: khoang rơi từ trên xuống ô (0–60%), chạm đất mở ra (vòng bung)
        if (e < 0.6) { const f = e / 0.6, yy = p.y - (1 - f * f) * C * 2.4; PX.ve(ctx, this.anh(p.ten), p.x, yy, C * 0.7, C * 0.7, 0, 0.95); }
        else { const f = (e - 0.6) / 0.4; ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, this.anh(p.ten), p.x, p.y, C * (0.7 + 0.5 * f), C * (0.7 + 0.5 * f), 0, 1 - f); ctx.globalCompositeOperation = 'source-over'; }
      } else if (p.k === 'tiaSao') { // REINFORCE bàn đầy: tia sáng rọi xuống ụ nhận +1★
        ctx.globalCompositeOperation = 'lighter';
        PX.tia(ctx, p.x, p.y - C * 2.2 * (1 - e * 0.3), p.x, p.y, 3 + 3 * (1 - e), p.mau, 0.9 * (1 - e));
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.globalAlpha = 1;
  },
};

(() => {
  if (typeof capNhatTrum !== 'function' || typeof REN === 'undefined') return;
  // luật → hiển thị: bắt lúc trùm bắt đầu / kết thúc báo chiêu (không đổi gì của luật)
  const _cnt = capNhatTrum;
  capNhatTrum = function (E, dt) {
    const truoc = E.bao;
    if (truoc) TVF._chan = TVF._chanSet || (TVF._chanSet = new Set());
    if (TVF._chan) TVF._chan.clear();
    let r;
    try { r = _cnt.apply(this, arguments); } finally {
      try {
        if (!truoc && E.bao) TVF.batDau(E);
        else if (truoc && E.bao !== truoc) TVF.no(E, truoc);
      } catch (e) { console.error('TVF', e); }
      TVF._chan = null;
    }
    return r;
  };
  if (typeof VX !== 'undefined' && VX.chanKhien) {
    const _ck = VX.chanKhien;
    VX.chanKhien = function (B, T) { if (TVF._chan && B && T) TVF._chan.add(B.i * 100 + T.o); return _ck.apply(this, arguments); };
  }
  if (typeof CH !== 'undefined') {
    const _d = CH.dung;
    CH.dung = function (B) { const r = _d.apply(this, arguments); if (r && r.ok && typeof G !== 'undefined' && G.ban && G.ban.includes(B)) { try { TVF.chiHuy(B, r); } catch (e) { console.error('TVF', e); } } return r; };
  }
  if (typeof UI !== 'undefined' && UI.canhBaoTrum) {
    const _cb = UI.canhBaoTrum;
    UI.canhBaoTrum = function (id) { try { TVF.napTruoc(id); } catch (e) { } return _cb.apply(this, arguments); };
  }
  if (typeof batDau === 'function') { const _bd = batDau; batDau = function () { TVF.ds.length = 0; TVF.pop.length = 0; TVF.mv.length = 0; return _bd.apply(this, arguments); }; }
  // vẽ: vòng chân trùm (dưới) + pha trùm (trên) quanh veQuai; RAGE/khiên ô (dưới ụ) + dấu báo chiêu (trên ụ) quanh veO; nổ/vỡ sau hiệu ứng
  const _vq = REN.veQuai;
  REN.veQuai = function (ctx) { try { TVF.veVongTrum(ctx); } catch (e) { } const r = _vq.apply(this, arguments); try { TVF.veTrenTrum(ctx); } catch (e) { } return r; };
  const _vo = REN.veO;
  REN.veO = function (ctx) { try { TVF.veO(ctx); } catch (e) { } const r = _vo.apply(this, arguments); try { TVF.veDau(ctx); } catch (e) { } return r; };
  if (typeof VX !== 'undefined' && VX.veDs) { const _vd = VX.veDs; VX.veDs = function (ctx, R) { const r = _vd.apply(this, arguments); try { TVF.vePop(ctx); } catch (e) { } return r; }; }
})();
