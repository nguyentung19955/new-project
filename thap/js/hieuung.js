// TURRET MERGE — HIỆU ỨNG TRIỆU HỒI / GHÉP / BIẾN HÌNH / LIÊN KẾT (theo tư vấn TU-VAN-THIET-KE-64-U mục 3.5)
// • Chạy theo THỜI GIAN THỰC (VX.t), không theo tốc độ game → ở 2×/3× vẫn đọc rõ; luật chơi KHÔNG chờ hoạt ảnh, không chặn thao tác.
// • Mọi vòng là HÌNH TRÒN vẽ bằng code (arc) — không dùng phần vòng elip phối cảnh trong fx_summon / fx_starup (đã che mặt nạ).
// • Ảnh ụ chỉ phóng ĐỀU; ngoại lệ duy nhất: nhún bẹp ≤150 ms lúc ụ triệu hồi chạm đất.
// • Chớp sáng nằm trong ô; nhiều sự kiện cùng lúc → chế độ nhẹ (bớt hạt, bỏ quay số thẻ, không rung).
'use strict';

const VX = {
  t: 0, ds: [], hens: [], moc: [], TRE_LO: 0.34,
  // ---------- tiện ích ----------
  eo: (u) => { u = clamp(u, 0, 1); return 1 - (1 - u) * (1 - u) * (1 - u); },
  ei: (u) => { u = clamp(u, 0, 1); return u * u; },
  bo(u, s) { u = clamp(u, 0, 1); s = s || 1.9; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); },
  hen(d, fn) { this.hens.push({ t: this.t + (d || 0), fn }); },
  // nhiều sự kiện bắt đầu trong 0,5 s gần nhất → chế độ nhẹ
  nhe() { const n = this.moc.filter(t => this.t - t < 0.5).length; return n >= 4; },
  dem() { this.moc.push(this.t); if (this.moc.length > 24) this.moc.shift(); },
  cap(dt) {
    const k = G.tocDo || 1;
    this.t += dt * (k > 1 ? 1 + 0.12 * (k - 1) : 1); // 2×/3×: nhanh hơn chút xíu nhưng vẫn đủ dài để đọc
    for (let i = this.hens.length - 1; i >= 0; i--) { const h = this.hens[i]; if (this.t >= h.t) { this.hens.splice(i, 1); try { h.fn(); } catch (e) { console.error(e); } } }
    for (let i = this.ds.length - 1; i >= 0; i--) if (this.t - this.ds[i].t0 > this.ds[i].dai) this.ds.splice(i, 1);
    if (G.ban.length) this.theoDoi();
  },
  reset() { this.ds.length = 0; this.hens.length = 0; this.moc.length = 0; },
  // dải khung đã che mặt nạ: giữ phần trên (cột sáng / ngôi sao), xoá phần dưới có vòng elip phối cảnh
  _mn: {},
  matNa(ten, y0, y1) {
    const key = ten + y0 + '|' + y1; if (this._mn[key]) return this._mn[key];
    const a = REN.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    const g = x.createLinearGradient(0, a.height * y0, 0, a.height * y1); // vetay-ok: mask — mặt nạ cắt/mờ dần ảnh PNG
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalCompositeOperation = 'destination-in'; x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); // vetay-ok: mask — mặt nạ cắt/mờ dần ảnh PNG
    return (this._mn[key] = c);
  },
  // tô màu 1 canvas (giữ độ sáng + alpha) — cột sáng theo màu bậc ụ
  toMau(c, mau) {
    if (!c) return null; const key = '_tm' + mau; if (c[key]) return c[key];
    const t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
    const x = t.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'color'; x.fillStyle = mau; x.fillRect(0, 0, t.width, t.height); // vetay-ok: png — tô màu trong alpha của ảnh PNG
    x.globalCompositeOperation = 'destination-in'; x.drawImage(c, 0, 0);
    return (c[key] = t);
  },
  // khung f (thực, hoà 2 khung) của dải → vẽ vuông cỡ co ở (x,y)
  khung(ctx, anh, f, x, y, co, goc, al) { if (!anh) return; REN.khungMuot(ctx, null, f, x, y, co, goc || 0, al == null ? 1 : al, REN.mip(anh, co * REN.s * REN.dpr)); },
  // vòng TRÒN (arc) — r bán kính, w nét
  vong(ctx, x, y, r, w, mau, al) { if (al <= 0.01 || r <= 0.5) return; PX.vong(ctx, x, y, r, w, mau, al); }, // ảnh fx_vong_mong tô màu
  // vòng phù văn: vòng tròn + 8 vạch ngắn + 3 cung quay (đóng dấu triệu hồi)
  vongPhu(ctx, x, y, r, mau, al, quay, code) { // code = true: cần đúng màu họ → ảnh vòng phù văn tô màu họ
    if (al <= 0.01) return;
    const vp = code ? PX.mau('fx_vong_trieu', mau) : REN.co('fx_vong_trieu', r * 2.3); // vòng phù văn ChatGPT (S4): code xoay + phóng
    if (vp) { ctx.save(); ctx.translate(x, y); ctx.rotate(quay || 0); ctx.globalAlpha = al; ctx.drawImage(REN.mip(vp, r * 2.3 * REN.s * REN.dpr), -r * 1.15, -r * 1.15, r * 2.3, r * 2.3); ctx.restore(); }
  },
  mauBac: (T) => TIERS[T.bac] ? TIERS[T.bac].mau : '#ffffff',

  // =================== API gọi từ luật chơi ===================
  trieu(T) { T.vxA = { k: 'trieu', t0: this.t, nhe: this.nhe() }; this.dem(); },
  ghep(B, a, b, ra) {
    const nhe = this.nhe();
    ra.vxA = { k: 'ghep', t0: this.t, nhe, bId: b.id, bSao: b.sao, bBac: b.bac, bGd: b.gd, goc: b.goc, deck: B.deck.slice(), lo: nhe ? 0.2 : this.TRE_LO };
    G.bay.push({ id: a.id, sao: a.sao, bac: a.bac, gd: a.gd, goc: a.goc, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, t0: this.t, dai: 0.12 });
    this.dem();
    this.hen(ra.vxA.lo, () => SND.lo(TIERS[ra.bac] ? TIERS[ra.bac].thuTu : 0));
  },
  doi(N, T) { N.vxA = { k: 'doi', t0: this.t, tuId: T.id, tuGd: T.gd || 3, goc: T.goc, nhe: this.nhe() }; this.dem(); SND.bien(); this.hen(0.46, () => SND.lo(TIERS[N.bac].thuTu)); },
  bien(T, tu, den) {
    const len = den > tu;
    T.vxB = { t0: this.t, tu, den, len, dai: len ? 0.56 : 0.26 };
    if (!len) return;
    SND.bien();
    const g = GROW[T.id];
    const cB = () => { const B = G.ban[T.ban]; return B && B.t[T.o] === T ? B.o[T.o] : null; };
    if (den === 3 && (!g.lap || !T._daAwk)) { // ụ chu kỳ (nạp/xả): chữ to chỉ lần đầu, sau đó chỉ nhãn nhỏ
      T._daAwk = true;
      // (không hiện chữ)
    }
  },
  saoLen(T, n, ten, tre) {
    this.hen(tre || 0, () => {
      const B = G.ban[T.ban]; if (!B || B.t[T.o] !== T) return;
      this.ds.push({ k: 'sao', T, B, o: T.o, t0: this.t, dai: 0.75, n });
      const c = B.o[T.o];
      // (bỏ chữ nổi 'SKILL UP' + nhãn sao trên ô — tấm kết quả ghép đã đủ)
      SND.sao();
    });
  },
  // TWIN MAKER: ụ sinh đôi lộ ra CÙNG LÚC kết quả ghép — tia vàng (fx_bingo) từ ô ghép → ô mới, ụ mới triệu hồi bình thường khi tia tới,
  // vòng vàng (fx_vong_trieu tô vàng) quanh ụ mới, biểu tượng 2 vòng nối (fx_sinhdoi_hieu) loé ~0,6 s trên CẢ 2 ô. Không chữ.
  sinhDoi(B, oNguon, T) {
    const ra = B.t[oNguon], r = ra && ra._gf, M = typeof GF !== 'undefined' ? GF.M : null;
    const lo = r && M ? (M.lo * r.k + (r.k === 1 ? M.dung : 0)) / 1000 : (ra && ra.vxA && ra.vxA.k === 'ghep' ? ra.vxA.lo : 0);
    const bay = 0.16; // tia chạy tới ô mới
    this.trieu(T);
    if (T._gs) T._gs.t0 += (lo + bay) * 1000 - 120 * (typeof GF !== 'undefined' && GF.K_TRIEU ? GF.K_TRIEU : 1); // cổng hầm mở trước 120 ms → ụ bắt đầu hiện đúng lúc tia tới
    else if (T.vxA) T.vxA.t0 += lo + bay;
    this.ds.push({ k: 'td', B, o: oNguon, o2: T.o, T, t0: this.t + lo, dai: 1.0, bay });
    const c = B.o[T.o]; if (typeof HUD2 !== 'undefined' && HUD2.vfx && c) HUD2.vfx('cong', c.x, c.y, 66, 64, 360, Math.round((lo + bay) * 1000)); // nhịp triệu hồi bình thường (lớp DOM)
  },
  kichHoat(B, o, ids) { this.ds.push({ k: 'kh', B, o, ids, t0: this.t + this.TRE_LO, dai: 0.8 + this.TRE_LO }); },
  hu(T) { const B = G.ban[T.ban]; if (!B) return; this.ds.push({ k: 'hu', B, o: T.o, t0: this.t, dai: 0.7 }); if (!B.ai) SND.hu(); },

  // =================== VẼ TRƯỚC / SAU MỖI Ụ ===================
  // trả về { sx, sy (≠1 chỉ khi nhún ≤150 ms), oy, al, an (ẩn ụ), huy (cỡ huy hiệu sao), dong (đang có hoạt ảnh) }
  truoc(ctx, T, x, y, S, o) {
    const R = { sx: 1, sy: 1, oy: 0, al: 1, an: false, huy: 1, dong: false };
    const A = T.vxA;
    // hoạt ảnh bật nảy cũ (nâng sao, ép xung, đổi chỗ…) → thời gian thực
    if (T.anim && T.anim.k === 'no') {
      if (T.anim.t0 == null) T.anim.t0 = this.t - Math.min(0.2, T.anim.t || 0) * 0.6;
      const u = (this.t - T.anim.t0) / 0.32;
      if (u >= 1) T.anim = null;
      else { const s = this.bo(u, 2.2); R.sx = R.sy = Math.max(0.05, 0.6 + 0.4 * s); R.dong = true; }
    } else if (T.anim) T.anim = null;
    if (!A) return R;
    const tt = this.t - A.t0;
    if (A.k === 'trieu') {
      if (tt < 0) { R.an = true; R.dong = true; R.huy = 0; return R; } // chờ lộ (ụ sinh đôi chờ kết quả ghép)
      if (tt > 0.6) { T.vxA = null; return R; }
      R.dong = true;
      const m = this.mauBac(T), lon = T.bac === 'vang' || T.bac === 'do';
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // 1) cột sáng rơi xuống ô (phần cột của fx_summon khung 0–1, đã xoá vòng elip)
      const aCot = tt < 0.05 ? tt / 0.05 : 1 - this.eo((tt - 0.16) / 0.2);
      if (aCot > 0.01 && !(A.nhe && !lon)) {
        const cot = this.toMau(this.matNa('fx_summon', 0.52, 0.66), T.bac === 'trang' ? '#cfe8ff' : m), h = S * (lon ? 2.6 : 2.0);
        if (cot) {
          const w = S * (lon ? 1.15 : 0.9), src = REN.mip(cot, w * REN.s * REN.dpr), fw = src.width / 6, f = tt < 0.07 ? 0 : 1;
          ctx.globalAlpha = aCot;
          ctx.drawImage(src, f * fw, 0, fw, src.height, x - w / 2, y - h * 0.6, w, h);
          ctx.drawImage(src, f * fw, 0, fw, src.height, x - w / 2, y - h * 0.6, w, h); // cột sáng (chỉ kéo dài theo trục dọc) — đáy chạm tâm ô
        }
        ctx.globalAlpha = aCot * 0.55; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 0.9);
      }
      // 2) vòng phù văn tròn đóng dấu (to → đúng cỡ bệ)
      const uR = (tt - 0.04) / 0.34;
      if (uR > 0 && uR < 1) {
        const r = S * (0.62 - 0.17 * this.eo(uR / 0.45)), a = uR < 0.2 ? uR / 0.2 : 1 - this.ei((uR - 0.45) / 0.55);
        this.vongPhu(ctx, x, y, r, m, a * 0.95, tt * 3);
      }
      // 4) sóng tròn lúc chạm đất
      const uS = (tt - 0.16) / 0.26;
      if (uS > 0 && uS < 1) this.vong(ctx, x, y, S * (0.36 + 0.5 * this.eo(uS)), 3 * (1 - uS) + 0.6, '#ffffff', (1 - uS) * 0.65);
      ctx.restore(); ctx.globalAlpha = 1;
      // 3) ụ thật rơi xuống → nhún ≤150 ms → phóng ĐỀU đúng 1
      if (tt < 0.16) { const u = tt / 0.16; R.oy = -S * 0.85 * (1 - this.ei(u)); R.al = 0.25 + 0.75 * u; R.sx = R.sy = 0.86 + 0.14 * u; R.huy = 0; }
      else if (tt < 0.29) { const u = (tt - 0.16) / 0.13, k = Math.sin(u * Math.PI) * (1 - u * 0.3); R.sx = 1 + 0.13 * k; R.sy = 1 - 0.13 * k; R.huy = this.bo(u); }
      if (tt >= 0.16 && !A.dat) {
        A.dat = true;
        FX.bui(x, y + S * 0.12, A.nhe ? 4 : 8, S * 0.32);
        FX.tiaLua(x, y, A.nhe ? 4 : (lon ? 16 : 9), m, lon ? 210 : 160, lon ? 11 : 8);
        if (lon && !A.nhe) FX.lac(2.5);
        SND.dat();
      }
      return R;
    }
    if (A.k === 'ghep') {
      const lo = A.lo, het = lo + 0.3;
      if (tt > het) { T.vxA = null; return R; }
      R.dong = true;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // ụ đích cũ NÉN vào trong (0–0.12 s) rồi biến vào chớp
      if (tt < 0.14) {
        ctx.restore(); ctx.save();
        const u = tt / 0.14;
        REN.veU(ctx, { id: A.bId, sao: A.bSao, bac: A.bBac, gd: A.bGd, goc: A.goc, rx: 0, st: {}, ban: T.ban, o: T.o, aurora: 0, buf: {} }, x, y, { scale: 1 - 0.22 * this.ei(u), ghost: true, alpha: 1 - 0.5 * u, noBadge: true });
        ctx.globalCompositeOperation = 'lighter';
      }
      // chớp nhập: fx_merge khung 0→2 (2 luồng xoáy hút vào → bùng sáng), gọn trong ô
      const uF = (tt - 0.04) / 0.2;
      if (uF > 0 && uF < 1) {
        const a = uF < 0.7 ? 1 : 1 - (uF - 0.7) / 0.3;
        this.khung(ctx, REN.img('fx_merge'), uF * 2.2, x, y, S * 1.05, 0, a * (A.nhe ? 0.6 : 0.9));
        if (uF > 0.4) { ctx.globalAlpha = (1 - uF) * 0.8; REN.ve1(ctx, 'de_chung', S * 0.714, 'trang', x, y); }
      }
      // quay số thẻ trong bộ bài (kiểu DCDW): ~0,18 s nháy các ô súng rồi dừng ở kết quả
      if (!A.nhe && tt > 0.15 && tt < lo) {
        const u = (tt - 0.15) / (lo - 0.15), buoc = Math.floor(Math.pow(u, 0.8) * 7);
        const id = buoc >= 6 ? T.id : A.deck[(buoc + A.deck.indexOf(T.id) + 1) % A.deck.length];
        const ic = REN.img('nho/' + id), tm = TIERS[G.rosterMap[id] ? G.rosterMap[id].bac : 'trang'].mau;
        ctx.globalAlpha = 0.5; REN.anhGiua(ctx, REN.cham1(tm), x, y, S * 1.0);
        ctx.globalCompositeOperation = 'source-over';
        if (ic) { const p = 0.92 + 0.08 * Math.sin(u * 40); ctx.globalAlpha = 0.95; REN.anhGiua(ctx, ic, x, y, S * 1.02 * p); }
        ctx.globalCompositeOperation = 'lighter';
        this.vong(ctx, x, y, S * 0.5, 1.5, tm, 0.7);
      }
      // lộ kết quả: sóng tròn nhỏ + ánh màu bậc
      const uL = (tt - lo) / 0.26;
      if (uL > 0 && uL < 1) {
        const m = this.mauBac(T);
        this.vong(ctx, x, y, S * (0.55 + 0.55 * this.eo(uL)), 3.2 * (1 - uL) + 0.5, m, (1 - uL) * 0.85);
        this.vong(ctx, x, y, S * (0.45 + 0.3 * this.eo(uL)), 1.5, '#ffffff', (1 - uL) * 0.6);
        ctx.globalAlpha = (1 - uL) * 0.45; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 1.0);
        if (!A.no) { A.no = true; FX.tiaLua(x, y, A.nhe ? 4 : 12, m, 190, 10); }
      }
      ctx.restore(); ctx.globalAlpha = 1;
      if (tt < lo) { R.an = true; return R; }
      const u = (tt - lo) / 0.16;
      const s = u < 1 ? 0.55 + 0.45 * this.bo(u, 2.4) : 1;
      R.sx = R.sy = s; // phóng ĐỀU (bật nảy quá đà rồi về đúng 1)
      R.huy = this.bo((tt - lo - 0.04) / 0.18, 2.6);
      return R;
    }
    if (A.k === 'doi') { // HỘP biến thành ụ khác: ~750 ms ăn mừng
      const het = 0.78;
      if (tt > het) { T.vxA = null; return R; }
      R.dong = true;
      const m = this.mauBac(T), S0 = S;
      // hộp cũ rung + tối dần → mở ra
      if (tt < 0.3) {
        const u = tt / 0.3, rung = tt < 0.12 ? Math.sin(tt * 90) * 0.09 : 0;
        ctx.save(); ctx.translate(x, y); ctx.rotate(A.goc + rung);
        const sc = tt < 0.12 ? 1 : 1 + 0.14 * this.eo((tt - 0.12) / 0.18);
        REN.veDauLop(ctx, A.tuId, A.tuGd, S0 / 0.98, 1 - this.ei((tt - 0.12) / 0.18), sc, false);
        if (tt < 0.12) REN.veDauLop(ctx, A.tuId, A.tuGd, S0 / 0.98, 0.45 * u * 2.5, sc, false, 'den');
        ctx.restore();
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (tt < 0.12) { ctx.globalAlpha = tt / 0.12 * 0.6; REN.anhGiua(ctx, REN.cham1('#ffffff'), x, y, S * 0.45); }
      // mảnh máy mở/lắp (fx_evolve 0→4) — vòng tròn, trong ô
      const uE = (tt - 0.1) / 0.42;
      if (uE > 0 && uE < 1) this.khung(ctx, this.toMau(REN.img('fx_evolve'), m), uE * 4.4, x, y, S * 1.12, 0, uE < 0.85 ? 0.95 : (1 - uE) / 0.15 * 0.95);
      // bóng trắng của ụ mới lớn dần (lộ mục tiêu)
      if (tt > 0.3 && tt < 0.5) {
        const u = (tt - 0.3) / 0.16;
        ctx.save(); ctx.translate(x, y); ctx.rotate(T.goc);
        REN.veDauLop(ctx, T.id, T.gd && laGrow(T.id) ? T.gd : 0, S0 / 0.98, 0.85 * Math.min(1, u * 1.5) * (tt > 0.46 ? (0.5 - tt) / 0.04 : 1), 0.6 + 0.4 * this.eo(u), false, 'trang');
        ctx.restore();
      }
      // khoá vào: sóng tròn + tia lửa + ánh màu bậc
      const uL = (tt - 0.46) / 0.3;
      if (uL > 0 && uL < 1) {
        this.vong(ctx, x, y, S * (0.6 + 0.5 * this.eo(uL)), 3.5 * (1 - uL) + 0.5, m, (1 - uL) * 0.9);
        ctx.globalAlpha = (1 - uL) * 0.5; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 1.05);
        if (!A.no) { A.no = true; FX.tiaLua(x, y, A.nhe ? 5 : 16, m, 220, 11); if (!A.nhe) FX.lac(2); }
      }
      ctx.restore(); ctx.globalAlpha = 1;
      if (tt < 0.46) { R.an = true; return R; }
      const u = (tt - 0.46) / 0.18;
      R.sx = R.sy = u < 1 ? 0.7 + 0.3 * this.bo(u, 2.4) : 1;
      R.huy = this.bo((tt - 0.5) / 0.18, 2.6);
      return R;
    }
    return R;
  },
  sau(ctx, T, x, y, S, A) { /* chỗ móc thêm lớp trên ụ (để trống: hiệu ứng trên đã vẽ trong truoc / veDs) */ },

  // ---------- dưới đầu súng: hào quang dạng thức tỉnh + vòng tiến độ grow-up ----------
  duoiDau(ctx, T, S, al, R) {
    if (!laGrow(T.id) || T.st.da) return;
    const g = GROW[T.id], st = g.gd(T), m = g.mau;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // hào quang lặp (fx_awaken: vòng lửa nhìn thẳng từ trên, tròn) — tô theo màu ụ
    if (T.gd === 3 && g.khongAnh) { ctx.globalAlpha = al * (0.28 + 0.1 * Math.sin(this.t * 6)); REN.anhGiua(ctx, REN.cham1(m), 0, 0, S * 1.2); } // không có ảnh dạng 3: quầng sáng thay thế
    if (T.gd === 3) {
      const B = T.vxB, vao = B && B.len ? clamp((this.t - B.t0 - 0.3) / 0.25, 0, 1) : 1;
      const aw = m === '#ff4b3e' || m === '#ff5040' || m === '#ffd23f' || m === '#ffe46b' ? REN.img('fx_awaken') : REN.toMau('fx_awaken', m);
      if (aw) this.khung(ctx, aw, (this.t * 7 + (T.pha || 0)) % 6, 0, 0, S * 1.08, this.t * 0.6, al * 0.32 * vao);
    }
    // (bỏ vòng tiến độ thứ 2 quanh bệ — vòng đo grow-up đã có ở growfx.js veGauge, bằng ảnh PNG)
    ctx.restore(); ctx.globalAlpha = al;
  },
  // ---------- biến hình tại chỗ (~560 ms): tối → mở → lắp (fx_evolve) → khoá + sóng tròn → lắng ----------
  // vẽ trong hệ toạ độ đã xoay theo đầu súng; trả true nếu đã tự vẽ đầu súng
  veBien(ctx, T, C, al, da, R) {
    const B = T.vxB; if (!B) return false;
    const tt = this.t - B.t0;
    if (tt > B.dai) { T.vxB = null; return false; }
    if (!B.len) { // về dạng thấp hơn (ụ chu kỳ vừa xả): hoà nhanh, không pháo hoa
      const u = tt / B.dai;
      R.veDauLop(ctx, T.id, B.tu, C, al * (1 - u), 1, da);
      R.veDauLop(ctx, T.id, B.den, C, al * u, 1, da);
      return true;
    }
    const S = C * 0.98;
    // 0–80 ms: tối + đứng lại
    if (tt < 0.19) {
      const u = tt / 0.08, mo = (tt - 0.08) / 0.11;
      const sc = tt < 0.08 ? 1 : 1 + 0.06 * this.eo(mo);
      R.veDauLop(ctx, T.id, B.tu, C, al * (tt < 0.08 ? 1 : 1 - 0.65 * this.eo(mo)), sc, da);
      R.veDauLop(ctx, T.id, B.tu, C, al * 0.5 * Math.min(1, u), sc, da, 'den');
    }
    // 190–310 ms: dạng mới hiện dần, phóng đều 0.92 → 1
    if (tt >= 0.17) {
      const u = (tt - 0.17) / 0.14;
      R.veDauLop(ctx, T.id, B.den, C, al * this.eo(u), 0.92 + 0.08 * this.eo(u), da);
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // chớp bóng trắng 1–2 khung lúc khoá
    if (tt > 0.28 && tt < 0.33) R.veDauLop(ctx, T.id, B.den, C, al * 0.75 * (1 - (tt - 0.28) / 0.05), 1, false, 'trang');
    ctx.restore();
    return true;
  },
  // lớp hiệu ứng biến hình KHÔNG xoay (mảnh máy, sóng tròn) — vẽ ở veDs theo từng ụ
  veBienNgoai(ctx, T, x, y, S) {
    const B = T.vxB; if (!B || !B.len) return;
    const tt = this.t - B.t0, m = GROW[T.id].mau;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (tt < 0.08) { ctx.globalAlpha = tt / 0.08 * 0.5; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 0.4); }
    const uE = (tt - 0.08) / 0.34;
    if (uE > 0 && uE < 1) this.khung(ctx, this.toMau(REN.img('fx_evolve'), m), uE * 4.2, x, y, S * 1.08, 0, (uE < 0.8 ? 0.9 : (1 - uE) / 0.2 * 0.9));
    const uS = (tt - 0.31) / 0.25;
    if (uS > 0 && uS < 1) {
      this.vong(ctx, x, y, S * (0.6 + 0.5 * this.eo(uS)), 3 * (1 - uS) + 0.5, m, (1 - uS) * 0.8); // sóng tròn 0.6 → 1.1 ô
      if (!B.no) { B.no = true; FX.tiaLua(x, y, 3, '#ffffff', 170, 8); FX.tiaLua(x, y, 6, m, 150, 9); }
    }
    const uG = (tt - 0.39) / 0.17;
    if (uG > 0 && uG < 1) { ctx.globalAlpha = (1 - uG) * 0.35; REN.anhGiua(ctx, REN.cham1(m), x, y, S * 0.9); }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // ụ kéo bay vòng cung ngắn vào ụ đích (thời gian thực)
  veBay(ctx, b, R) {
    const u = (this.t - b.t0) / b.dai;
    if (u >= 1) { b.xong = true; return; }
    const e = this.ei(u);
    const x = b.x0 + (b.x1 - b.x0) * e, y = b.y0 + (b.y1 - b.y0) * e - Math.sin(u * Math.PI) * 16;
    R.veU(ctx, { id: b.id, sao: b.sao, bac: b.bac, gd: b.gd, goc: b.goc, rx: 0, st: {}, ban: 0, o: 0, aurora: 0, buf: {} }, x, y, { scale: 1 - 0.3 * e, ghost: true, noBadge: true, alpha: 1 - 0.3 * e });
  },

  // =================== SỰ KIỆN TRÊN BÀN ===================
  veDs(ctx, R) {
    // lớp ngoài của biến hình (không xoay)
    for (const B of G.ban) for (const T of B.t) if (T && T.vxB) { const c = B.o[T.o]; this.veBienNgoai(ctx, T, c.x, c.y, Math.min(B.cw, B.ch) * 0.98); }
    for (const e of this.ds) {
      const tt = this.t - e.t0; if (tt < 0 || !e.B || !'sao kh hu lk bg td'.includes(e.k)) continue;
      const B = e.B, c = B.o[e.o], S = Math.min(B.cw, B.ch) * 0.98;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (e.k === 'sao') { // đạt mốc sao: bùng sao vàng (phần sao của fx_starup, đã xoá vòng elip) + vòng tròn vàng
        const u = tt / e.dai, anh = this.matNa('fx_starup', 0.6, 0.76);
        this.khung(ctx, anh, Math.min(5.99, u * 6.5), c.x, c.y - S * 0.12, S * 1.3, 0, u < 0.8 ? 1 : (1 - u) / 0.2);
        this.vong(ctx, c.x, c.y, S * (0.4 + 0.6 * this.eo(u / 0.6)), 2.5 * (1 - u) + 0.5, '#ffd23f', (1 - u) * 0.9);
        if (e.n >= 7) this.vong(ctx, c.x, c.y, S * (0.3 + 0.9 * this.eo(u / 0.7)), 1.5, '#ff4b3e', (1 - u) * 0.8);
      } else if (e.k === 'kh') { // kỹ năng KHI GHÉP kích hoạt: vòng phù văn màu ụ + biểu tượng ụ bật lên
        const u = tt / (e.dai - this.TRE_LO);
        e.ids.forEach((id, i) => {
          const m = TIERS[G.rosterMap[id].bac].mau, ho = HO_CUA[id] ? HO[HO_CUA[id].ho].mau : m;
          this.vongPhu(ctx, c.x, c.y, S * (0.5 + 0.7 * this.eo(u / 0.5)) * (1 + i * 0.12), ho, (1 - u) * 0.9, tt * 2 * (i ? -1 : 1), true);
          const v = (tt - 0.05 - i * 0.08) / 0.22; if (v <= 0) return;
          ctx.globalCompositeOperation = 'source-over';
          const ic = REN.img('nho/' + id), s = this.bo(v, 2.2), ox = (i - (e.ids.length - 1) / 2) * S * 0.62;
          ctx.globalAlpha = (u > 0.75 ? (1 - u) / 0.25 : 1);
          REN.anhGiua(ctx, 'h2_vong_xam', c.x + ox, c.y - S * 0.92, S * 0.8 * s); // khung tròn kim loại PNG (thay đĩa + viền code)
          if (ic) REN.anhGiua(ctx, ic, c.x + ox, c.y - S * 0.92, S * 0.56 * s);
          ctx.globalCompositeOperation = 'lighter';
        });
      } else if (e.k === 'hu') { // tiếng hú Sói thức tỉnh: 3 sóng âm tròn
        for (let i = 0; i < 3; i++) { const u = (tt - i * 0.12) / 0.45; if (u > 0 && u < 1) this.vong(ctx, c.x, c.y, S * (0.45 + 0.9 * this.eo(u)), 2.2 * (1 - u) + 0.4, '#ff4b3e', (1 - u) * 0.7); }
      } else if (e.k === 'lk') { // dây liên kết (fx_link): tạo xích → giữ, nhịp sáng → tắt
        if (!B.t[e.o] || !B.t[e.o2]) { ctx.restore(); continue; } // ụ đã rời ô: bỏ dây
        const c2 = B.o[e.o2], u = tt / e.dai;
        const a = u < 0.8 ? 1 : (1 - u) / 0.2;
        this.veXich(ctx, c, c2, S, Math.min(5.99, tt / 0.25 * 5), a * (0.75 + 0.25 * Math.sin(tt * 14)), e.mau);
      } else if (e.k === 'td') { // TWIN MAKER: tia vàng ô ghép → ô mới + vòng vàng + biểu tượng sinh đôi trên 2 ô
        const c2 = B.o[e.o2], u = tt / e.dai, uB = clamp(tt / e.bay, 0, 1), e1 = this.eo(uB);
        const xh = c.x + (c2.x - c.x) * e1, yh = c.y + (c2.y - c.y) * e1;
        const aB = tt < 0.5 ? 1 : Math.max(0, 1 - (tt - 0.5) / 0.25);
        if (aB > 0.01 && Math.hypot(xh - c.x, yh - c.y) > 2) this.veVet(ctx, 'fx_bingo', c.x, c.y, xh, yh, Math.min(5.99, 1 + tt * 9), aB, S * 0.62);
        if (aB > 0.01) { ctx.globalAlpha = aB * 0.85; REN.anhGiua(ctx, REN.cham1('#ffe46b'), xh, yh, S * 0.55); }
        // vòng vàng quanh ụ mới (sau khi tia tới)
        const uR = (tt - e.bay) / 0.6;
        if (uR > 0 && uR < 1) {
          this.vongPhu(ctx, c2.x, c2.y, S * (0.42 + 0.3 * this.eo(uR)), '#ffd23f', (uR < 0.15 ? uR / 0.15 : 1 - this.ei((uR - 0.15) / 0.85)) * 0.95, tt * 4, true);
          this.vong(ctx, c2.x, c2.y, S * (0.36 + 0.5 * this.eo(uR)), 2.6 * (1 - uR) + 0.6, '#ffe46b', (1 - uR) * 0.8);
        }
        // biểu tượng sinh đôi (ảnh ChatGPT fx_sinhdoi_hieu) loé ~0,6 s trên ô ghép và ô mới
        const gl = REN.img('fx_sinhdoi_hieu');
        if (gl) for (const [q, t1] of [[c, tt], [c2, tt - e.bay]]) {
          const v = t1 / 0.6; if (v <= 0 || v >= 1) continue;
          const sc = this.bo(Math.min(1, v / 0.3), 2), w = S * 0.5 * sc, h = w * gl.height / gl.width;
          ctx.globalAlpha = v > 0.7 ? (1 - v) / 0.3 : 1;
          ctx.drawImage(REN.mip(gl, w * REN.s * REN.dpr), q.x - w / 2, q.y - S * 0.5 - h / 2, w, h);
        }
      } else if (e.k === 'bg') { // BINGO: vệt vàng quét qua hàng/cột (fx_bingo) + ô loé lần lượt
        const u = tt / e.dai, p0 = B.o[e.ds[0]], p1 = B.o[e.ds[e.ds.length - 1]];
        const ngang = p0.y === p1.y, ext = ngang ? B.cw * 0.5 : B.ch * 0.5;
        const dx = ngang ? ext : 0, dy = ngang ? 0 : ext;
        this.veVet(ctx, 'fx_bingo', p0.x - dx, p0.y - dy, p1.x + dx, p1.y + dy, Math.min(5.99, u * 7), u < 0.75 ? 1 : (1 - u) / 0.25, S * 0.7);
        e.ds.forEach((o, i) => { const v = (tt - i * 0.06) / 0.3; if (v > 0 && v < 1) { const q = B.o[o]; ctx.globalAlpha = (1 - v) * 0.6; REN.anhGiua(ctx, REN.cham1('#ffd23f'), q.x, q.y, S * 1.0); } });
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    this.veChon(ctx);
  },
  // xích năng lượng giữa 2 ô: xoay theo hướng nối, CHỈ kéo dài theo chiều dài (không méo chiều ngang)
  veXich(ctx, c1, c2, S, f, al, mau) {
    const dx = c2.x - c1.x, dy = c2.y - c1.y, L0 = Math.hypot(dx, dy); if (L0 < 1) return;
    const r0 = S * 0.3, x0 = c1.x + dx / L0 * r0, y0 = c1.y + dy / L0 * r0, L = L0 - 2 * r0; if (L < 4) return;
    const anh = mau ? REN.toMau('fx_link', mau) : REN.img('fx_link'); if (!anh) return;
    const fw = anh.width / 6, fh = anh.height, f0 = Math.floor(f), f1 = Math.min(5, f0 + 1), fr = f - f0;
    const sx0 = 8, sw = fw - 16, h = fh * 0.42; // chiều ngang (dày) cố định
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(Math.atan2(dy, dx));
    const src = REN.mip(anh, Math.max(L, h) * REN.s * REN.dpr), k = src.width / anh.width;
    ctx.globalAlpha = al * (1 - fr); ctx.drawImage(src, (f0 * fw + sx0) * k, 0, sw * k, fh * k, 0, -h / 2, L, h);
    if (fr > 0.02) { ctx.globalAlpha = al * fr; ctx.drawImage(src, (f1 * fw + sx0) * k, 0, sw * k, fh * k, 0, -h / 2, L, h); }
    ctx.restore();
  },
  veVet(ctx, ten, x0, y0, x1, y1, f, al, h) {
    const anh = REN.img(ten); if (!anh) return;
    const L = Math.hypot(x1 - x0, y1 - y0), fw = anh.width / 6, fh = anh.height, f0 = Math.floor(f), f1 = Math.min(5, f0 + 1), fr = f - f0;
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
    const src = REN.mip(anh, Math.max(L, h) * REN.s * REN.dpr), k = src.width / anh.width;
    ctx.globalAlpha = al * (1 - fr); ctx.drawImage(src, f0 * fw * k, 0, fw * k, fh * k, 0, -h / 2, L, h);
    if (fr > 0.02) { ctx.globalAlpha = al * fr; ctx.drawImage(src, f1 * fw * k, 0, fw * k, fh * k, 0, -h / 2, L, h); }
    ctx.restore();
  },
  // ụ đang được chọn (bảng thông tin mở): hiện liên kết của nó lâu dài (Chain Link, Sync Cannon, Railgun)
  veChon(ctx) {
    const X = UI.xemU; if (!X || performance.now() > UI.ttHet || $('#tt').hidden) return;
    const T = X.T, B = G.ban[T.ban]; if (!B || B.t[T.o] !== T) return;
    const S = Math.min(B.cw, B.ch) * 0.98, nh = 0.75 + 0.25 * Math.sin(this.t * 6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (T.id === 'lienket') for (const [p, q] of this.capLienKet(B, T)) this.veXich(ctx, B.o[p], B.o[q], S, 5, 0.9 * nh);
    if (T.id === 'dongbo') for (const N of B.t) if (N && N !== T && N.sao === T.sao) this.veXich(ctx, B.o[T.o], B.o[N.o], S, 5, 0.6 * nh, '#ffd23f');
    if (T.id === 'railgun') {
      const c = T.o % 5, h = (T.o / 5) | 0, hang = [0, 1, 2, 3, 4].map(i => h * 5 + i), cot = [0, 1, 2].map(i => i * 5 + c);
      for (const ds of [hang, cot]) { const n = ds.filter(o => B.t[o] && B.t[o].id === 'railgun').length; const p0 = B.o[ds[0]], p1 = B.o[ds[ds.length - 1]]; this.veVet(ctx, 'fx_bingo', p0.x, p0.y, p1.x, p1.y, 5, (0.2 + 0.6 * n / ds.length) * nh, S * 0.5); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // các cặp ô kề cùng loại trong nhóm liên kết của T
  capLienKet(B, T) {
    const da = new Set([T.o]), hang = [T.o], cap = [];
    while (hang.length) { const o = hang.pop(); for (const N of keCan(B, o)) if (N && N.id === T.id) { const k = Math.min(o, N.o) + '-' + Math.max(o, N.o); if (!cap.some(c => c.k === k)) cap.push({ k, p: o, q: N.o }); if (!da.has(N.o)) { da.add(N.o); hang.push(N.o); } } }
    return cap.map(c => [c.p, c.q]);
  },
  // theo dõi thay đổi để bật hiệu ứng liên kết đúng lúc (không vẽ thường trực)
  theoDoi() {
    for (const B of G.ban) for (const T of B.t) {
      if (!T) continue;
      if (T.id === 'lienket') {
        const n = T.chuoi || 1;
        if (T._lkN != null && n > T._lkN && n >= 2) { for (const [p, q] of this.capLienKet(B, T)) if (!this.ds.some(e => e.k === 'lk' && e.B === B && ((e.o === p && e.o2 === q) || (e.o === q && e.o2 === p)) && this.t - e.t0 < 0.5)) this.ds.push({ k: 'lk', B, o: p, o2: q, t0: this.t, dai: 1.1 }); if (!B.ai) SND.xich(); }
        T._lkN = n;
      } else if (T.id === 'dongbo') {
        const n = T.dong || 0;
        if (T._dbN != null && n !== T._dbN && n > 0 && this.t - (T._dbT || -9) > 0.6) {
          T._dbT = this.t;
          for (const N of B.t) if (N && N !== T && N.sao === T.sao) this.ds.push({ k: 'lk', B, o: T.o, o2: N.o, t0: this.t, dai: 0.8, mau: '#ffd23f' });
        }
        T._dbN = n;
      } else if (T.id === 'railgun') {
        const b = SKILLS.railgun.bingo(B, T), key = (b.ngang >= 5 ? 'h' : '') + (b.doc >= 3 ? 'c' : '');
        if (T._bg != null && key !== T._bg && key) {
          const c = T.o % 5, h = (T.o / 5) | 0;
          if (b.ngang >= 5 && !T._bg.includes('h') && !this.ds.some(e => e.k === 'bg' && e.B === B && e.hang === h)) { this.ds.push({ k: 'bg', B, o: h * 5, hang: h, ds: [0, 1, 2, 3, 4].map(i => h * 5 + i), t0: this.t, dai: 0.7 }); nhanU(T, 'BINGO ROW! +DAMAGE', '#ffd23f', true); if (!B.ai) SND.sao(); }
          if (b.doc >= 3 && !T._bg.includes('c') && !this.ds.some(e => e.k === 'bg' && e.B === B && e.cot === c)) { this.ds.push({ k: 'bg', B, o: c, cot: c, ds: [0, 1, 2].map(i => i * 5 + c), t0: this.t, dai: 0.7 }); nhanU(T, 'BINGO COLUMN! +SPEED', '#ffd23f', true); if (!B.ai) SND.sao(); }
        }
        T._bg = key;
      }
    }
  },
};
