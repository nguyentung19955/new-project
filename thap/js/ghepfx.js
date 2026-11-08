// TURRET MERGE — PHẢN HỒI CỐT LÕI "MAGNETIC FORGE" (docs/demo-hop-tuong/thap-art/TU-VAN-HIEU-UNG-CHUNG.txt mục 3–8, 14)
//  · Nhấc ụ: nén 0.95 → nhấc lên 1.14 (easeOutBack) → 1.10, nghiêng theo vận tốc ngang, bóng đổ là bản tối của ảnh bệ;
//    ô nguồn = hốc thép mở khoá (cf_o_nha) — KHÔNG còn khung xanh vuông / bản mờ / nét đứt.
//  · Đang kéo: mọi ô ghép được thở nhẹ bằng vòng nam châm (cf_vong_hop, 1 đồng hồ chung); rê lên ô hợp lệ → vòng sáng 1.12×,
//    ụ bị hút về tâm ≤0.12 ô, huy hiệu sao KẾ TIẾP bay lên; rê lên ô sai → vòng đỏ (h2_vong_do) 180 ms.
//  · Ghép (800 ms + 40 ms dừng hình cục bộ): hút nam châm → hút xoáy (cf_hut) → chớp va chạm + rung nhẹ → vòng rèn + 4 mảnh tia
//    → dấu sao to đập xuống góc phải trên (380 ms) → ụ mới bật ra (470 ms, 0.6→1.2→1.0) → huy hiệu thật hiện lại (tuvan/vfx/p1).
//  · Triệu hồi (~390 ms): chớp ở ô → cổng hầm (h2_vfx_cong) mở → ụ trồi lên từ hầm, bật nhẹ → viền màu bậc (chỉ XANH+) → cổng đóng.
//  · Thả sai / huỷ: ụ nghiêng, bật cong về ô cũ ~150 ms; thả lên ụ không ghép được: bệ chớp đỏ 1 lần + lắc cục bộ ngắn.
//  Chỉ TRÌNH BÀY: luật ghép/triệu hồi chạy ngay như cũ (ghep() đổi bàn ở t=0), không chặn thao tác, không dừng game.
//  Mọi hình là ảnh ChatGPT (QUY-TAC-HINH); code chỉ đặt vị trí / phóng / xoay / mờ / chọn khung + rung nhẹ.
//  Giảm chuyển động (prefers-reduced-motion): ghép ~410 ms, không rung, không mảnh tia.
'use strict';

const GF = {
  ANH: ['cf_vong_hop', 'cf_o_nha', 'cf_hut', 'cf_no', 'cf_vong_ren', 'cf_dau_sao', 'fx_merge', 'h2_vfx_cong', 'h2_vfx_ghep', 'h2_glint', 'h2_vong_do', 'sup_ring', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'de_chung'],
  // mốc thời gian (ms) theo spec mục 6 — KHÔNG rút ngắn (trừ giảm chuyển động)
  // REVIEW-VFX-93 §VI.B: SAO MỚI bật lên TRƯỚC (dấu sao 380 ms) rồi đầu súng ngẫu nhiên mới hiện (470 ms) — loại chưa lộ trước khi sao đập xuống
  M: { snap: 95, hut: 205, no: 255, dung0: 230, dung: 40, lo: 470, loXong: 585, dau: 380, dauXong: 540, het: 800 },
  cam: null,      // ụ đang cầm: { T, t0, x, y, sc, nghieng, vx }
  ve: [],         // ụ bật về ô cũ: { T, B, o, x, y, t0, sai }
  mg: [],         // phát lại ghép đang chạy
  sai: null,      // vòng đỏ ô sai: { B, o, t0 }
  hoverT: null, hoverT0: 0, hoverCu: null, hoverCuT0: 0,
  _tLast: 0,

  giam() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !!(G.debug && G.debug.giamVfx); },
  now: () => performance.now(),
  img(t) { return REN.img(t); },
  // easing
  eo: (u) => { u = clamp(u, 0, 1); return 1 - Math.pow(1 - u, 3); },
  ei: (u) => { u = clamp(u, 0, 1); return u * u * u; },
  eio: (u) => { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
  bo(u, s) { u = clamp(u, 0, 1); s = s == null ? 1.70158 : s; const c3 = s + 1; return 1 + c3 * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); },
  lerp: (a, b, u) => a + (b - a) * u,
  // khung f (thực) của dải ngang → vẽ vuông cỡ co, mờ al
  khung(ctx, ten, f, x, y, co, goc, al) {
    const a = this.img(ten); if (!a || al <= 0.01) return false;
    REN.khungMuot(ctx, null, f, x, y, co, goc || 0, al, REN.mip(a, co * REN.s * REN.dpr));
    return true;
  },
  // khung rời (không hoà) — dải có số khung n
  khungCung(ctx, ten, f, x, y, co, goc, al) {
    const a0 = this.img(ten); if (!a0 || al <= 0.01) return false;
    const g0 = ctx.globalAlpha; ctx.globalAlpha = g0 * al;
    REN.khung(ctx, null, Math.floor(f), x, y, co, goc || 0, REN.mip(a0, co * REN.s * REN.dpr));
    ctx.globalAlpha = g0; return true;
  },
  soKhung(ten) { const a = this.img(ten); return a ? Math.max(1, Math.round(a.width / a.height)) : 0; },
  tile(B) { return Math.min(B.cw, B.ch); },
  ban0() { return G.ban[0]; },

  // =================== TRẠNG THÁI CẦM / HOVER (mỗi khung) ===================
  capNhat() {
    // gọi từ veDuoi VÀ veCam (veDuoi không chạy khi đã thả & không còn nguồn → trước đây ụ treo giữa đường tới khi có nguồn mới); gọi 2 lần/khung vô hại
    const now = this.now(), dt = Math.min(0.05, Math.max(0, (now - (this._tLast || now)) / 1000)); this._tLast = now;
    const k = UI.keo, B = this.ban0();
    // vừa thả / huỷ: ụ đang cầm không còn được kéo → nếu không có lệnh ghép thì bật về ô cũ
    if (this.cam && !(k && k.dang && k.T === this.cam.T)) {
      const c = this.cam; this.cam = null;
      if (!c.daGhep && B && B.t[c.T.o] === c.T) {
        const tr = this.hoverT && this.hoverT !== c.T && !hopLeGhep(c.T, this.hoverT) ? this.hoverT : null;
        this.ve.push({ T: c.T, B, o: c.T.o, x: c.x, y: c.y, sc: c.sc, t0: now, sai: !!tr }); // sai: thả lên ụ không ghép được → lắc ngắn khi về ô (thay chữ TYPE/STARS DIFFER — js/bopopup.js)
        if (tr) this.sai = { B, o: tr.o, T: tr, t0: now };
        try { SND.nay(); } catch (e) { }
      }
      this.hoverT = null;
    }
    if (k && k.dang && B && B.t[k.T.o] === k.T) {
      if (!this.cam) { const o = B.o[k.T.o]; this.cam = { T: k.T, t0: now, x: o.x, y: o.y, sc: 1, nghieng: 0, vx: 0, px: k.x }; try { SND.nut(); } catch (e) { } }
      const c = this.cam, C = this.tile(B), o = B.o[c.T.o], u = (now - c.t0) / 1000;
      const [hx, hy] = UI.diemKeo(k);
      const D = UI.uTai(hx, hy), hv = D && D !== c.T ? D : null;
      if (hv !== this.hoverT) {
        this.hoverCu = this.hoverT; this.hoverCuT0 = now; this.hoverT = hv; this.hoverT0 = now;
        if (hv && hopLeGhep(c.T, hv)) { try { SND.tich(); } catch (e) { } }
        else if (hv) this.sai = { B, o: hv.o, T: hv, t0: now };
      }
      // điểm đến hình: theo ngón (đã lệch lên trên), bị nam châm hút về ô hợp lệ ≤0.12 ô
      let tx = hx, ty = hy;
      if (hv && hopLeGhep(c.T, hv)) {
        const d = B.o[hv.o], mu = this.eo((now - this.hoverT0) / 65), dx = d.x - hx, dy = d.y - hy, L = Math.hypot(dx, dy), m = Math.min(L, C * 0.12) * mu;
        if (L > 0.01) { tx += dx / L * m; ty += dy / L * m; }
      }
      // nhấc: 0–40 nén tại ô · 40–105 bay lên điểm ngón · lò xo tới hạn (~50 ms trễ, không trễ quá 0.25 ô)
      if (u < 0.04) { c.x = o.x; c.y = o.y; c.sc = 1 - 0.05 * this.eo(u / 0.04); }
      else if (u < 0.105) { const v = this.eo((u - 0.04) / 0.065); c.x = this.lerp(o.x, tx, v); c.y = this.lerp(o.y, ty, v); c.sc = 0.95 + (1.14 - 0.95) * this.bo((u - 0.04) / 0.065, 1.4); }
      else {
        const a = 1 - Math.exp(-dt / 0.05);
        c.x += (tx - c.x) * a; c.y += (ty - c.y) * a;
        const lx = c.x - tx, ly = c.y - ty, L = Math.hypot(lx, ly), mx = C * 0.25;
        if (L > mx) { c.x = tx + lx / L * mx; c.y = ty + ly / L * mx; }
        c.sc = u < 0.15 ? this.lerp(1.14, 1.10, this.eo((u - 0.105) / 0.045)) : 1.10;
      }
      // nghiêng theo vận tốc ngang (±3°); lúc nhấc nghiêng −4° rồi về 0
      const vx = dt > 0 ? (k.x - c.px) / dt : 0; c.px = k.x; c.vx += (vx - c.vx) * Math.min(1, dt * 12);
      const lean = clamp(c.vx / 900, -1, 1) * 3 * Math.PI / 180;
      c.nghieng = u < 0.105 ? -4 * Math.PI / 180 * Math.sin(clamp(u / 0.105, 0, 1) * Math.PI) : lean;
    } else if (!(k && k.dang)) { this.hoverT = null; }
  },

  // =================== LỚP DƯỚI: VÒNG NAM CHÂM Ở Ô HỢP LỆ (thay khung xanh vuông) ===================
  veDuoi(ctx) {
    this.capNhat();
    const src = KG.nguon(); if (!src) return;
    const B = G.ban[src.ban]; if (!B || B.t[src.o] !== src) return;
    const now = this.now(), C = this.tile(B), dang = UI.keo && UI.keo.dang;
    const nv = this.soKhung('cf_vong_hop');
    ctx.save();
    if (UI.chonGhep && !dang) { const vong = this.img('sup_ring'); if (vong) REN.anhGiua(ctx, vong, B.o[src.o].x, B.o[src.o].y, C * (0.98 + 0.04 * Math.sin(now / 140)), 0, 0.95); }
    const ph = (now % 800) / 800; // đồng hồ chung: 4 khung/800 ms, không nhấp nháy lệch nhau
    const tLo = dang && this.cam ? clamp((now - this.cam.t0) / 150, 0, 1) : 1; // vòng hiện dần trong 150 ms đầu khi nhấc
    for (let i = 0; i < 15; i++) {
      const N = B.t[i]; if (!N || N === src || !hopLeGhep(src, N)) continue;
      const c = B.o[i], on = dang && this.hoverT === N, cu = dang && this.hoverCu === N;
      if (nv) {
        if (on) {
          const u = (now - this.hoverT0) / 65, s = this.lerp(1.02, 1.12, this.eo(u));
          this.khung(ctx, 'cf_vong_hop', 2 + ((now / 110) % 2), c.x, c.y, C * 1.22 * s, 0, 1);
        } else {
          let al = (0.68 + 0.22 * Math.sin(ph * Math.PI * 2)) * tLo;
          if (cu) al = Math.max(al, 1 - (now - this.hoverCuT0) / 70);
          this.khung(ctx, 'cf_vong_hop', ph * 1.999, c.x, c.y, C * 1.22, 0, al);
        }
      } else { const v = this.img('sup_ring'); if (v) REN.anhGiua(ctx, v, c.x, c.y, C * (on ? 1.06 : 0.98), 0, on ? 1 : 0.6); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // =================== LỚP CẦM: ô nguồn (hốc mở), bóng, ụ đang cầm, ụ bật về, phát lại ghép ===================
  veCam(ctx) {
    this.capNhat();
    const now = this.now();
    // ô nguồn: hốc thép mở khoá (khung 0→5 trong 140 ms, rồi lắng về khung 3 = hốc trống tối)
    // vòng đỏ ô sai (180 ms) — dưới ụ đang cầm
    if (this.sai) {
      const s = this.sai, u = (now - s.t0) / 180;
      if (u >= 1 || s.B.t[s.o] !== s.T) this.sai = null;
      else { const o = s.B.o[s.o], C = this.tile(s.B), v = this.img('h2_vong_do'); if (v) REN.anhGiua(ctx, v, o.x, o.y, C * (0.84 + 0.1 * Math.sin(u * Math.PI)), 0, 0.95 * (1 - u * u)); }
    }
    const c = this.cam;
    if (c) {
      const B = this.ban0(), o = B.o[c.T.o], C = this.tile(B), u = (now - c.t0) / 1000;
      const f = u < 0.14 ? u / 0.14 * 5 : Math.max(3, 5 - (u - 0.14) / 0.1 * 2);
      this.khung(ctx, 'cf_o_nha', f, o.x, o.y, C * 0.9, 0, 0.95);
      this.veUCam(ctx, c.T, c.x, c.y, c.sc, c.nghieng, C, o, 1);
      this.veXemTruoc(ctx, B, now);
    }
    // ụ bật về ô cũ (thả sai / huỷ)
    for (let i = this.ve.length - 1; i >= 0; i--) {
      const r = this.ve[i], B = r.B, u0 = (now - r.t0) / 1000, dai = this.giam() ? 0.1 : 0.15, LAC = r.sai ? 0.18 : 0; // §VI.C: về ô 150 ms; thả sai: bệ chớp đỏ 1 lần (180 ms)
      if (u0 >= dai + LAC || B.t[r.o] !== r.T || !G.ban.includes(B)) { this.ve.splice(i, 1); continue; }
      const u = Math.min(u0, dai - 1e-4);
      const o = B.o[r.o], C = this.tile(B);
      const k = dai / 0.34;
      let x = r.x, y = r.y, sc, ng;
      if (u < 0.075 * k) { const v = u / (0.075 * k); sc = this.lerp(r.sc, 1.03, v); ng = -8 * Math.PI / 180 * this.eo(v); }
      else {
        const v = clamp((u - 0.075 * k) / (0.21 * k), 0, 1), e = this.bo(v, 1.3);
        x = this.lerp(r.x, o.x, e); y = this.lerp(r.y, o.y, e) - Math.sin(v * Math.PI) * C * 0.18; // đường cong chỉ bằng toạ độ
        sc = this.lerp(1.03, 1, this.eo(v)); ng = -8 * Math.PI / 180 * (1 - this.eo(v));
      }
      if (u0 >= dai && LAC) {
        const v = (u0 - dai) / LAC;
        if (!this.giam() && v < 0.55) { const w = v / 0.55; x += Math.sin(w * Math.PI * 4) * C * 0.045 * (1 - w); } // lắc cục bộ 2 nhịp ≈100 ms (không rung màn)
        const vd = this.img('h2_vong_do'); if (vd) REN.anhGiua(ctx, vd, o.x, o.y, C * (0.86 + 0.08 * Math.sin(v * Math.PI)), 0, 0.9 * (1 - v * v)); // bệ chớp đỏ 1 lần
      }
      const f = Math.max(0, 3 - u / dai * 4); // hốc đóng lại 3→0
      this.khung(ctx, 'cf_o_nha', f, o.x, o.y, C * 0.9, 0, 0.95 * (1 - clamp((u - 0.28 * k) / (0.06 * k), 0, 1)));
      this.veUCam(ctx, r.T, x, y, sc, ng, C, o, 0);
    }
    for (let i = this.mg.length - 1; i >= 0; i--) if (!this.veGhep(ctx, this.mg[i], now)) this.mg.splice(i, 1);
    ctx.globalAlpha = 1;
  },
  // ụ đang cầm: bóng tối của ảnh bệ dưới (ở "mặt đất" giữa ụ và ngón tay) + ụ phóng 1.10, nghiêng
  veUCam(ctx, T, x, y, sc, ng, C, o, nhac) {
    const bong = REN.co('de_chung', C * 0.74, 'den'); // 1 cỡ cố định (bóng mờ có lọc blur: dựng mỗi cỡ rất tốn) — phóng khi vẽ
    if (bong) {
      const lift = Math.hypot(x - o.x, y - o.y) > 2 ? 1 : 0;
      const bx = x + C * 0.05, by = y + C * (0.1 + 0.22 * lift), w = C * 0.74 * sc * (0.95 - 0.1 * lift), h = w * bong.height / bong.width;
      ctx.globalAlpha = 0.5 - 0.15 * lift; ctx.drawImage(bong, bx - w / 2, by - h / 2, w, h); ctx.globalAlpha = 1;
    }
    ctx.save();
    if (ng) { ctx.translate(x, y); ctx.rotate(ng); ctx.translate(-x, -y); }
    REN.veU(ctx, T, x, y, { scale: sc, ghost: true });
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // huy hiệu sao KẾ TIẾP bay lên trên ô hợp lệ đang rê (90–180 ms), mờ khi rời (80 ms)
  veXemTruoc(ctx, B, now) {
    const src = this.cam && this.cam.T, C = this.tile(B);
    const ve1 = (N, al, sc) => {
      if (!N || !hopLeGhep(src, N) || al <= 0.01) return;
      const dr = ghepDBHop(src, N), xs = dr && dr.sk.ghepDB.xemSao ? dr.sk.ghepDB.xemSao(dr.a, dr.b) : 0;
      const db = !!dr && !xs, n = xs || (db ? N.sao : Math.min(LUAT.saoMax, N.sao + 1)); // ghép đặc biệt: không hứa sao mới (trừ loại biết trước sao — Merge King)
      if (db) return;
      const d = C * 0.42 * sc, o = B.o[N.o], hb = REN.huyHieuDong(n, d); // cỡ đang nảy → bậc cỡ cố định (không dựng canvas mỗi khung)
      const x = clamp(o.x, B.x + d * 0.7, B.x + B.w - d * 0.7) /* 08/11: giữa ô như huy hiệu thật */, y = Math.max(B.y + d * 0.7, o.y - C * 0.5 - C * 0.22 * this.eo((now - this.hoverT0 - 90) / 90));
      if (hb) { const P = d * 1.5; ctx.globalAlpha = al; ctx.drawImage(hb, x - P / 2, y - P / 2, P, P); ctx.globalAlpha = 1; }
    };
    if (this.hoverT) { const u = (now - this.hoverT0 - 90) / 90; if (u > 0) ve1(this.hoverT, this.eo(u), this.lerp(0.7, 1, this.bo(u, 2))); }
    if (this.hoverCu && this.hoverCu !== this.hoverT) { const u = (now - this.hoverCuT0) / 80; if (u < 1) ve1(this.hoverCu, 1 - u, 1 - 0.15 * u); }
  },

  // mẹo 3 lần đầu ("Random type, +1★" / "Special merge" / chạm–chạm): đặt DƯỚI ô đích để không đè huy hiệu sao xem trước
  veMeo(ctx, src) {
    const B = G.ban[src.ban], dang = UI.keo && UI.keo.dang, hover = dang ? this.hoverT : null, C = this.tile(B);
    let s = null, c = null, y = 0;
    if (hover && hopLeGhep(src, hover)) { s = ghepDBHop(src, hover) ? KG.TXT.tipDB : KG.TXT.tip; c = B.o[hover.o]; y = c.y + C * 0.78; }
    else if (UI.chonGhep && !dang) { s = KG.TXT.tapTip; c = B.o[src.o]; y = c.y - C * 0.78; }
    if (!s) { KG._tip = null; return; }
    if (KG.soMeo() >= 3 && s !== KG.TXT.tipDB) return;
    if (!KG._tip || KG._tip.s !== s) KG._tip = { s, t0: performance.now() };
    const u = Math.min(1, (performance.now() - KG._tip.t0) / 140);
    KG.tam(ctx, s, c.x, Math.min(y, B.y + B.h - 10), 13, '#eaf6ff', u, 0.9 + 0.1 * u);
  },

  // =================== GHÉP: phát lại 780 ms (+40 ms dừng hình) ===================
  batDau(B, a, b, ra) {
    const now = this.now(), C = this.tile(B), o = B.o[b.o];
    let x0 = B.o[a.o].x, y0 = B.o[a.o].y, sc0 = 1;
    if (this.cam && this.cam.T === a) { x0 = this.cam.x; y0 = this.cam.y; sc0 = this.cam.sc; this.cam.daGhep = true; this.cam = null; }
    const sn = (T) => ({ id: T.id, sao: T.sao, bac: T.bac, gd: T.gd, goc: T.goc, rx: 0, st: {}, ban: T.ban, o: T.o, aurora: 0, buf: {}, lv: T.lv });
    // tối đa 1 phát lại lớn / ô; nhiều ghép dồn dập → bản rút gọn
    this.mg = this.mg.filter(m => !(m.B === B && m.o === b.o));
    const nhe = this.mg.length >= 3 || (typeof VX !== 'undefined' && VX.nhe());
    const r = { B, o: b.o, ao: a.o, a: sn(a), b: sn(b), ra, x0, y0, sc0, t0: now, k: this.giam() ? 0.5 : 1, nhe, nguoi: B === G.ban[0] && !B.ai, ph: {} };
    r.aSao = a.sao;
    ra._gf = r;
    this.mg.push(r);
    return r;
  },
  // thời gian cục bộ (ms) có dừng hình 40 ms ở t=230
  tau(r, now) {
    const t = (now - r.t0) / r.k, M = this.M;
    if (r.k !== 1) return t; // giảm chuyển động: không dừng hình
    return t < M.dung0 ? t : t < M.dung0 + M.dung ? M.dung0 : t - M.dung;
  },
  veGhep(ctx, r, now) {
    const B = r.B; if (!G.ban.includes(B)) return false;
    const M = this.M, t = this.tau(r, now), C = this.tile(B), S = C * 0.98, o = B.o[r.o];
    if (t > M.het) { if (r.ra._gf === r) r.ra._gf = null; return false; }
    const ph = r.ph, xA = o.x - C * 0.15;
    // âm thanh + rung đúng mốc
    if (t >= M.dung0 && !ph.no) {
      ph.no = 1;
      if (r.nguoi) { if (r.k === 1) FX.lac(3.2); try { navigator.vibrate && navigator.vibrate(18); } catch (e) { } }
      try { SND.dat(); } catch (e) { }
    }
    if (t >= M.lo && !ph.lo) { ph.lo = 1; try { SND.lo(TIERS[r.ra.bac] ? TIERS[r.ra.bac].thuTu : 0); } catch (e) { } }
    // 0–205: hai ụ (ảnh chụp) — hút nam châm rồi nén vào tâm
    if (t < M.hut) {
      let ax, ay, as, bs, ng;
      if (t < M.snap) {
        const u = this.eio(t / M.snap);
        ax = this.lerp(r.x0, xA, u); ay = this.lerp(r.y0, o.y, u); as = this.lerp(r.sc0, 1.06, u); bs = this.lerp(1, 1.06, u); ng = 7 * Math.PI / 180 * u;
      } else {
        const u = this.ei((t - M.snap) / (M.hut - M.snap));
        ax = this.lerp(xA, o.x, u); ay = o.y; as = bs = this.lerp(1.06, 0.32, u); ng = 7 * Math.PI / 180 * (1 - u);
      }
      const al = t < M.snap ? 1 : 1 - 0.4 * this.ei((t - M.snap) / (M.hut - M.snap));
      // vòng hút xoáy nằm DƯỚI hai ụ đang bị hút
      if (t > M.snap - 20) this.veHut(ctx, r, t, o, C);
      this.veAnh(ctx, r.b, o.x, o.y, bs, -ng, al);
      this.veAnh(ctx, r.a, ax, ay, as, ng, al);
    } else if (t < 290) this.veHut(ctx, r, t, o, C);
    // 205–290: chớp va chạm (giữ khung trong lúc dừng hình)
    if (t >= M.hut && t < 300) {
      const u = (t - M.hut) / 85, al = u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25 * 0.9;
      if (!this.khung(ctx, 'cf_no', Math.min(4, u * 5), o.x, o.y, S * 1.45, 0, al))
        this.khung(ctx, 'fx_merge', 1.6 + Math.min(1.3, u * 1.6), o.x, o.y, S * 1.5, 0, al);
    }
    // 255–470: vòng rèn co lại rồi bật ra + 4 mảnh tia
    if (t >= M.no && t < 480) {
      const u = (t - M.no) / 215, s = u < 0.45 ? this.lerp(1.2, 0.92, this.eo(u / 0.45)) : this.lerp(0.92, 1.12, this.bo((u - 0.45) / 0.55, 2));
      const al = u < 0.1 ? u / 0.1 : u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
      if (!this.khung(ctx, 'cf_vong_ren', Math.min(5, u * 6), o.x, o.y, S * 1.6 * s, 0, al)) {
        this.khung(ctx, 'fx_merge', 3 + Math.min(1.9, u * 2.2), o.x, o.y, S * 1.25 * s, 0, al); // vòng vàng (S? fx_merge khung 3–5)
        this.khung(ctx, 'cf_vong_hop', 3, o.x, o.y, S * 1.15 * s, u * 2.4, al * 0.85); // vòng thép xoay
      }
      if (!r.nhe && r.k === 1) {
        const g = this.img('h2_glint');
        if (g) for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 2 + Math.PI / 4 + r.o, d = C * (0.2 + 0.42 * this.eo(u)), w = C * 0.34 * (1 - 0.4 * u);
          REN.anhGiua(ctx, g, o.x + Math.cos(a) * d, o.y + Math.sin(a) * d, w, a + u * 3, (1 - u) * 0.95);
        }
      }
    }
    // 380–630: dấu sao to đập xuống góc phải trên + xung vòng (trước khi đầu súng mới lộ)
    if (t >= M.dau && t < M.dauXong + 90) this.veDau(ctx, r, t, o, C);
    ctx.globalAlpha = 1;
    return true;
  },
  veHut(ctx, r, t, o, C) {
    const M = this.M, u = (t - (M.snap - 20)) / (290 - M.snap + 20); if (u < 0 || u > 1) return;
    const al = u < 0.12 ? u / 0.12 : u > 0.82 ? 1 - (u - 0.82) / 0.18 : 1, s = 1.25 - 0.2 * this.ei(u);
    if (!this.khung(ctx, 'cf_hut', Math.min(7, u * 8.4), o.x, o.y, C * s, 0, al))
      this.khung(ctx, 'fx_merge', Math.min(1.9, u * 2), o.x, o.y, C * 1.2, 0, al);
  },
  veAnh(ctx, sn, x, y, sc, ng, al) {
    ctx.save(); ctx.globalAlpha = al;
    if (ng) { ctx.translate(x, y); ctx.rotate(ng); ctx.translate(-x, -y); }
    REN.veU(ctx, sn, x, y, { scale: sc, ghost: true, noBadge: true, alpha: al });
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // con dấu sao: huy hiệu sao CUỐI CÙNG (sao_hex) to 1.8× rơi 0.2 ô xuống chỗ huy hiệu thật, 1.35→0.9→1.0, xoay −8°→0
  veDau(ctx, r, t, o, C) {
    const M = this.M, B = r.B, n = r.ra.sao;
    const d = C * 0.34, dx = B.cw / 2 - d / 2 - 1.5, dy = B.ch / 2 - d / 2 - 1.5;
    let hx = o.x + dx, hy = o.y - dy;
    { const ty = REN.saoTamY && REN.img('hh_sao' + Math.max(1, Math.min(7, n | 0))) ? REN.saoTamY(n, d) : null; if (ty != null) { hx = o.x; hy = o.y - B.ch / 2 + ty; } } // 08/11: huy hiệu thật giờ ở GIỮA ô, ngay trên đầu ụ → con dấu rơi về đúng chỗ đó
    const u = (t - M.dau) / (M.dauXong - M.dau);
    // xung vòng phía sau (cf_dau_sao; dự phòng: chớp sao hud2_13)
    const up = (t - M.dau - 40) / 190;
    if (up > 0 && up < 1) {
      if (!this.khung(ctx, 'cf_dau_sao', Math.min(4, up * 5), hx, hy, d * 3.2, 0, up < 0.7 ? 1 : (1 - up) / 0.3))
        this.khungCung(ctx, 'h2_vfx_ghep', 0, hx, hy, d * 2.6 * (0.8 + 0.4 * this.eo(up)), 0, (1 - up) * 0.95);
    }
    const roi = this.eo(clamp(u / 0.25, 0, 1)), y = hy - C * 0.2 * (1 - roi);
    let s;
    if (u < 0.25) s = 1.35; else s = u < 0.55 ? this.lerp(1.35, 0.9, this.eo((u - 0.25) / 0.3)) : this.lerp(0.9, 1, this.bo((u - 0.55) / 0.45, 2));
    const ng = -8 * Math.PI / 180 * (1 - this.eo(clamp(u / 0.55, 0, 1)));
    const al = t < M.dau + 30 ? (t - M.dau) / 30 : t > M.dauXong ? 1 - (t - M.dauXong) / 85 : 1;
    const D = d * 1.8 * s, hb = REN.huyHieuDong(n, D); // con dấu phóng 1.35→0.9→1: bậc cỡ cố định
    if (hb && al > 0.01) { ctx.save(); ctx.globalAlpha = al; ctx.translate(hx, y); ctx.rotate(ng); ctx.drawImage(hb, -D * 0.75, -D * 0.75, D * 1.5, D * 1.5); ctx.restore(); }
  },

  // =================== VX.truoc: ẩn/hiện + phóng của ụ thật trong lúc phát lại ===================
  truoc(ctx, T, x, y, S) {
    const now = this.now();
    // đang cầm / đang bật về → ẩn ụ ở ô (hình nằm ở lớp cầm)
    if (this.cam && this.cam.T === T) return { sx: 1, sy: 1, oy: 0, al: 1, an: true, huy: 1, dong: true };
    for (const r of this.ve) if (r.T === T) return { sx: 1, sy: 1, oy: 0, al: 1, an: true, huy: 1, dong: true };
    // nhấn giữ (chưa kéo): nén nhẹ 0.95 phản hồi chạm
    const k = UI.keo;
    if (k && k.T === T && !k.dang) { if (!k._t0) k._t0 = now; const s = 1 - 0.05 * this.eo((now - k._t0) / 30); return { sx: s, sy: s, oy: 0, al: 1, an: false, huy: 1, dong: true }; }
    const r = T._gf;
    if (r) {
      const M = this.M, t = this.tau(r, now);
      if (t > M.het) { T._gf = null; return null; }
      if (t < M.lo) return { sx: 1, sy: 1, oy: 0, al: 1, an: true, huy: 0, dong: true };
      const u = (t - M.lo) / (M.loXong - M.lo);
      const s = u < 0.55 ? this.lerp(0.6, 1.2, this.eo(u / 0.55)) : u < 1 ? this.lerp(1.2, 1, this.eo((u - 0.55) / 0.45)) : 1;
      const huy = t < 640 ? 0 : clamp((t - 640) / 40, 0, 1);
      return { sx: s, sy: s, oy: 0, al: clamp((t - M.lo) / 40, 0, 1), an: false, huy, dong: true };
    }
    const g = T._gs;
    if (g) return this.truocTrieu(ctx, T, g, x, y, S, now);
    return null;
  },

  // =================== TRIỆU HỒI ~390 ms (REVIEW-VFX-93 §VI.A: chớp ở ô đích, ụ trồi lên từ hầm 250–400 ms, viền bậc chỉ từ XANH) ===================
  // mốc bên dưới theo thang gốc 0–630; chạy nhanh ×1/0.62 → 390 ms thật (giảm chuyển động: 285 ms)
  K_TRIEU: 0.62,
  truocTrieu(ctx, T, g, x, y, S, now) {
    const t = (now - g.t0) / (this.giam() ? 0.45 : this.K_TRIEU);
    if (t > 630) { T._gs = null; return null; }
    const B = G.ban[T.ban] || G.ban[0], C = this.tile(B), fl = typeof CG !== 'undefined' ? CG.kFlash() : 1;
    const hiem = T.bac && T.bac !== 'trang', mau = TIERS[T.bac] ? TIERS[T.bac].mau : '#ffffff';
    ctx.save();
    // 0–150: chớp ngắn ngay tại ô đích (ảnh chấm sáng fx_cham_trang)
    if (t < 150) { const u = t / 150; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55 * (1 - u) * (1 - u) * fl; REN.anhGiua(ctx, REN.cham1(hiem ? mau : '#dff2ff'), x, y, C * (0.8 + 0.4 * this.eo(u))); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    // cổng hầm: mở 0–120 (khung 0→2), giữ sáng (3), đóng 500–630 (4→5)
    const fc = t < 120 ? t / 120 * 2 : t < 500 ? 2 + Math.min(1, (t - 120) / 200) : 3 + (t - 500) / 130 * 2;
    const sc = t < 120 ? this.lerp(0.6, 1, this.eo(t / 120)) : 1, ac = t < 120 ? t / 120 : t > 560 ? 1 - (t - 560) / 70 : 1;
    this.khungCung(ctx, 'h2_vfx_cong', fc, x, y + C * 0.02, C * 1.38 * sc, 0, ac);
    // 300–630: viền theo bậc (vòng mảnh fx_vong_mong tô màu bậc) — chỉ XANH trở lên; TRẮNG không có viền
    if (hiem && t > 300) { const u = (t - 300) / 330; PX.vong(ctx, x, y, C * this.lerp(0.4, 0.56, this.eo(u)), 3, mau, (u < 0.2 ? u / 0.2 : 1 - this.ei((u - 0.2) / 0.8)) * 0.95); }
    // 260–460: bụi nhẹ khi ụ trồi lên (4 khung khoi_*) — bỏ khi nhiều sự kiện / tối giản
    if (!g.nhe && t > 260 && t < 460) {
      const u = (t - 260) / 200, f = Math.min(3, Math.floor(u * 4));
      ctx.globalAlpha = 0.4 * (1 - u); REN.anhGiua(ctx, 'khoi_' + f, x, y + C * 0.18, C * (0.6 + 0.4 * u));
      ctx.globalAlpha = 1;
    }
    ctx.restore(); ctx.globalAlpha = 1;
    if (t >= 260 && !g.dat) {
      g.dat = 1; try { SND.dat(); } catch (e) { }
      const lon = T.bac === 'vang' || T.bac === 'do';
      if (g.nguoi && lon) { if (!this.giam()) FX.lac(1.2); try { navigator.vibrate && navigator.vibrate(10); } catch (e) { } } // chỉ VÀNG/ĐỎ có rung — không "fanfare" mọi lần triệu hồi
    }
    // ụ: ẩn → 120–260 TRỒI lên từ hầm (0.45→0.85, từ dưới +0.1 ô) → 260–340 bật 0.85→1.12 → 340–500 về 1.00
    if (t < 120) return { sx: 1, sy: 1, oy: 0, al: 1, an: true, huy: 0, dong: true };
    let s, oy = 0, al = 1;
    if (t < 260) { const u = (t - 120) / 140; s = this.lerp(0.45, 0.85, this.eo(u)); oy = C * 0.1 * (1 - this.eo(u)); al = this.eo(u / 0.5); }
    else if (t < 340) s = this.lerp(0.85, 1.12, this.eo((t - 260) / 80));
    else if (t < 500) s = this.lerp(1.12, 1, this.bo((t - 340) / 160, 1.2));
    else s = 1;
    const huy = t < 500 ? 0 : clamp((t - 500) / 100, 0, 1);
    return { sx: s, sy: s, oy, al, an: false, huy, dong: true };
  },
};

// =================== MÓC VÀO CODE CÓ SẴN (chỉ trình bày) ===================
(() => {
  if (typeof VX === 'undefined' || typeof REN === 'undefined' || typeof KG === 'undefined') return;
  REN.napTruoc(GF.ANH);
  for (const t of GF.ANH) REN.CO_DINH.add(t);
  // nhãn kết quả / "+1★" / kỹ năng khi ghép: hiện lúc dấu sao đập xuống (t≈490 ms) thay vì 340 ms
  VX.TRE_LO = 0.49;
  // ghép: thay "ụ bay vòng cung + vòng tròn vẽ code" bằng phát lại MAGNETIC FORGE
  VX.ghep = function (B, a, b, ra) { this.dem(); ra.vxA = null; GF.batDau(B, a, b, ra); };
  // triệu hồi: thay cột sáng + vòng code bằng cổng hầm + rơi + chạm đất
  const trieuGoc = VX.trieu.bind(VX);
  VX.trieu = function (T) {
    if (!REN.img('h2_vfx_cong')) return trieuGoc(T);
    this.dem(); T.vxA = null;
    const B = G.ban[T.ban];
    T._gs = { t0: performance.now(), nhe: this.nhe(), nguoi: B === G.ban[0] && !(B && B.ai) };
  };
  // SKILL UP (mốc sao) của ụ vừa ghép: đợi con dấu sao xong (1 tiêu điểm mỗi lúc — spec mục 1, 8A)
  const saoLenGoc = VX.saoLen.bind(VX);
  VX.saoLen = function (T, n, ten, tre) { return saoLenGoc(T, n, ten, T && T._gf ? Math.max(tre || 0, 0.82) : tre); };
  const truocGoc = VX.truoc.bind(VX);
  VX.truoc = function (ctx, T, x, y, S, o) {
    const R = GF.truoc(ctx, T, x, y, S);
    if (R) return R;
    return truocGoc(ctx, T, x, y, S, o);
  };
  // khung xanh vuông + vòng chọn cũ → vòng nam châm tròn (ảnh) ; lớp trên giữ mẹo + tấm kết quả
  KG.veDuoi = function (ctx) { GF.veDuoi(ctx); };
  KG.veTren = function (ctx) {
    const src = this.nguon();
    if (src) GF.veMeo(ctx, src);
    this.veLo(ctx);
    ctx.globalAlpha = 1;
  };
  // ụ đang kéo: thay "bản sao phóng 1.12 + bóng mờ ở ô" bằng lớp cầm
  REN.veKeo = function (ctx) { GF.veCam(ctx); };
  // vào trận: giải mã + chép canvas + dựng chuỗi mip cho mọi tấm hiệu ứng kéo/ghép NGAY (rải 1 tấm / khung) — trước đây tấm
  // cf_no / cf_vong_ren / cf_dau_sao… chỉ được giải mã + thu nhỏ lần đầu ĐÚNG khung thả ghép → khựng lúc ghép (tuvan/muotghep)
  GF.nongTran = function () {
    const ds = [...new Set([...GF.ANH, ...KG.ANH])];
    const lam = (t, lan) => REN.nong(null, () => {
      const a = REN.img(t), B = G.ban[0];
      if (!a) { if (lan < 40) setTimeout(() => lam(t, lan + 1), 250); return; } // chưa tải xong: thử lại sau
      if (!B) return;
      const C = Math.min(B.cw, B.ch), k = REN.s * REN.dpr;
      const m = REN.mip(a, C * 0.5 * k); // tầng nhỏ nhất sẽ dùng (khung ~0.5 ô) → mọi tầng lớn hơn cũng có sẵn
      const x = REN.ctxNong(); for (const c of a._mip || [a]) x.drawImage(c, 0, 0, 1, 1); // ép tải lên bộ nhớ vẽ
      return m;
    });
    for (const t of ds) lam(t, 0);
    // mọi loại ụ trong bộ bài (kết quả ghép = loại NGẪU NHIÊN trong bộ; triệu hồi cũng vậy): giải mã + dựng sẵn thân/đầu cỡ ô
    for (const B of G.ban) for (const id of new Set(B.deck || [])) { try { GF.nongU(B, taoU(B, id, 1, 0)); } catch (e) { } }
  };
  // dựng sẵn 1 ụ theo từng bước nhỏ (1 bước / khung): ảnh gốc → bản đứng yên → bản đang nảy (không bóng nướng sẵn)
  GF.nongU = function (B, T) {
    REN.nong('nu|' + B.i + '|' + T.id + '|' + T.bac + '|' + (REN.s * REN.dpr), () => { REN.img(REN.dauTen(T.id, 0)); REN.img('de_chung'); });
    REN.nong('nu1|' + B.i + '|' + T.id + '|' + T.bac + '|' + (REN.s * REN.dpr), () => REN.veU(REN.ctxNong(), T, 0, 0, { ghost: true, noBadge: true }));
    REN.nong('nu2|' + B.i + '|' + T.id + '|' + T.bac + '|' + (REN.s * REN.dpr), () => REN.veU(REN.ctxNong(), T, 0, 0, { ghost: true, noBadge: true, scale: 0.99 }));
  };
  // thả ghép: kết quả lộ ra sau 405 ms → trong lúc đó dựng sẵn ụ mới + huy hiệu sao + chữ tấm kết quả (rải theo khung)
  const bdGoc = GF.batDau;
  GF.batDau = function (B, a, b, ra) {
    const r = bdGoc.apply(this, arguments);
    try {
      GF.nongU(B, ra);
      const C = this.tile(B), n = ra.sao;
      const ds = []; for (let k = 0.08; k <= 1.001; k *= 1.5) ds.push(C * 0.34 * k); // huy hiệu thật bật nảy lúc lộ (bậc 8 % gộp sẵn)
      if (r.nguoi) {
        const ro = G.rosterMap[ra.id];
        REN.nong(null, () => REN.chuAnh(ro ? ro.ten : ra.id, '#ffffff', 12));
        for (let s2 = 1; s2 <= 1.26; s2 *= 1.08) ds.push(12 * 2.1 * s2 * 0.9); // huy hiệu trên tấm kết quả (phóng 1.25→1)
      }
      REN.nongHuy(n, ds);
    } catch (e) { }
    return r;
  };
  const vaoGF = UI.vaoTran;
  UI.vaoTran = function () { const r = vaoGF.apply(this, arguments); try { GF.nongTran(); } catch (e) { } return r; };
  // DOM VFX cũ (cổng/chớp ghép hud2) trùng với lớp mới → tắt
  if (typeof HUD2 !== 'undefined') { HUD2.ghep = () => { }; HUD2.cong = () => { }; }
})();
