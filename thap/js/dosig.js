// TURRET MERGE — CHỮ KÝ HIỆU ỨNG BẬC ĐỎ (docs/demo-hop-tuong/tuvan/anim-bac/RA-SOAT.md, yêu cầu 09/11:
//   "hiệu ứng skill, special của đỏ phải thật sự đẹp, khác biệt").
// Mỗi ụ Đỏ một "chữ ký" riêng (màu + hình khối + nhịp), xếp lớp TRÊN hiệu ứng sẵn có (tờ P2/P3, HU.*):
//   BÁO TRƯỚC (anticipation: thanh nạp gần đầy / chiêu sẵn sàng) → BÙNG NỔ nhiều lớp (vòng xung, tia, mảnh, quầng)
//   → ÁNH SÁNG / RUNG MÀN NHẸ (qua FX.sang / FX.lac, có chặn chung TVX) → DƯ ÂM (hạt, vết nứt, gợn, cánh hoa…).
//   Hố Đen: chân trời sự kiện tím-đen, xoáy bồi tụ hút vào, nghiền = vỡ tung mảnh · Overlord: thiên lôi đỏ thẫm từ trời + vết nứt đất
//   có điện bò · Lò Băng: bông tuyết 6 cánh mọc nhánh + mảnh băng + tuyết rơi · Ngai Thời Gian: mặt đồng hồ kim quay NGƯỢC, gợn co VÀO,
//   bóng quái ở chỗ cũ + cát vàng chảy về · Chúa Tổ: tổ ong lục giác hổ phách, nổ lục giác chỗ drone lao · Leviathan: đầu sóng
//   bọt trắng, giọt nước văng, gợn đọng lại dọc đường; xoáy nuốt · Khởi Sinh: hoa sen 8 cánh nở + cột sáng, cánh hoa rơi chỗ ụ nhận
//   · Rồng Máy: dải cánh lửa theo cú bổ nhào, than bay, gầm = vòng xung lửa · Lucky Slot: mưa xu + giấy màu + chùm tia vàng (jackpot)
//   · Thác Mana: trận đồ phù văn (vòng + lục mang tinh) quanh ụ suốt lũ mana, mỗi nhịp thác = dòng mana đổ từ trên xuống từng quái.
// QUY-TAC-HINH: chỉ đặt vị trí / xoay / phóng / mờ / tô màu ẢNH PNG có sẵn (PX.vong/tia/cham/sao, fx_song_xung, fx_vet_trang, fx_la,
//   fx_giot_nuoc, fx_than, fx_hoa_giay, cb_xu, hat_tuyet) — không path/arc/gradient. Ảnh chưa tải → PX tự bỏ qua (hình cũ vẫn vẽ).
// CHỈ TRÌNH BÀY: đọc trạng thái (G.hu, T.nap…) để biết lúc nào vẽ; KHÔNG ghi vào G / T / quái, không Math.random (nhiễu băm theo sự kiện),
//   thời gian theo G.t (đứng khi tạm dừng, đúng tốc độ trận). Chống rối (dịu VFX): vẽ vào lớp TRÊN của REN.veFx → được khoét mềm quanh
//   quái + đổ alpha DIU.tren; vùng phủ rộng giữ alpha thấp. EFFECTS Minimal: ít hạt, bỏ dư âm dài · REDUCE FLASH: loé ×0,4.
// ?dosig=0 tắt hẳn để so trước/sau.
'use strict';

const DSG = {
  bat: !(typeof location !== 'undefined' && /[?&]dosig=0\b/.test(location.search)),
  MAX_HAT: 160,
  ds: [], hat: [], gT: -1, dt: 0, dem: 0,
  _hu: new WeakSet(), _theo: [], _st: new WeakMap(),
  // ---- tiện ích ----
  ngau(seed) { let s = (seed * 2654435761) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
  gon() { return typeof CG !== 'undefined' && CG.gon(); },
  kFlash() { return typeof CG !== 'undefined' ? CG.kFlash() : 1; },
  kBan(B) { const B0 = G.ban && G.ban[0]; return B && B0 && B.cw && B0.cw ? B.cw / B0.cw : 1; },
  e3(u) { u = Math.max(0, Math.min(1, u)); return 1 - Math.pow(1 - u, 3); },
  // vòng loé: hiện nhanh, tắt mềm
  loe(u, vao, ra) { return u < 0 ? 0 : u < vao ? u / vao : u > 1 ? 0 : 1 - Math.max(0, (u - (1 - ra)) / ra); },
  anh(ten, mau) { return typeof PX !== 'undefined' ? PX.mau(ten, mau) : null; },
  // đường gấp khúc (sét / vết nứt) — điểm tất định theo seed
  khuc(x0, y0, x1, y1, n, bien, seed) {
    const r = this.ngau(seed), L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L, pts = [[x0, y0]];
    for (let i = 1; i < n; i++) { const u = i / n, j = (r() - 0.5) * 2 * bien; pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]); }
    pts.push([x1, y1]); return pts;
  },
  // đa giác đều n cạnh bằng các đoạn tia PNG (lục giác tổ ong / tam giác trận đồ)
  dagiac(ctx, x, y, r, n, goc, w, mau, al) {
    if (!(al > 0.01) || !(r > 0.5)) return;
    for (let i = 0; i < n; i++) { const a0 = goc + i * 2 * Math.PI / n, a1 = goc + (i + 1) * 2 * Math.PI / n; PX.tia(ctx, x + Math.cos(a0) * r, y + Math.sin(a0) * r, x + Math.cos(a1) * r, y + Math.sin(a1) * r, w, mau, al); }
  },
  // ---- hạt ----
  // k: cham | sao | vet | than | la | giot | xu | giay | tuyet · g = trọng lực · keo = hút về (tx,ty) · xoay = vận tốc góc quanh (cx,cy)
  hat1(o) {
    if (this.hat.length >= this.MAX_HAT) return;
    o.t = 0; o.goc = o.goc || 0; o.vg = o.vg || 0; o.g = o.g || 0; o.add = o.add !== false; this.hat.push(o);
  },
  bung(n, f) { const k = this.gon() ? 0.4 : 1; n = Math.max(1, Math.round(n * k)); for (let i = 0; i < n; i++) f(i, n); },
  capHat(dt) {
    const a = this.hat; let j = 0;
    for (let i = 0; i < a.length; i++) {
      const p = a[i]; p.t += dt; if (p.t >= p.song) continue;
      if (p.keo) { const k = Math.min(1, dt * p.keo); p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; }
      if (p.xoay) { const dx = p.x - p.cx, dy = p.y - p.cy, c = Math.cos(p.xoay * dt), s = Math.sin(p.xoay * dt), co = 1 - dt * (p.thu || 0); p.x = p.cx + (dx * c - dy * s) * co; p.y = p.cy + (dx * s + dy * c) * co; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.can) { p.vx *= 1 - Math.min(1, p.can * dt); p.vy *= 1 - Math.min(1, p.can * dt); }
      p.goc += p.vg * dt; a[j++] = p;
    }
    a.length = j;
  },
  veHat(ctx) {
    for (const p of this.hat) {
      const u = p.t / p.song, al = (p.al == null ? 1 : p.al) * (u < 0.12 ? u / 0.12 : 1 - Math.max(0, (u - 0.55) / 0.45));
      if (al <= 0.01) continue;
      const co = p.co * (p.lon ? 1 + p.lon * u : 1) * (p.nho ? 1 - p.nho * u : 1);
      ctx.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      switch (p.k) {
        case 'cham': PX.cham(ctx, p.x, p.y, co, p.mau, al); break;
        case 'sao': PX.sao(ctx, p.x, p.y, co, p.mau, al, p.goc); break;
        case 'vet': { const g = Math.atan2(p.vy, p.vx); PX.ve(ctx, this.anh('fx_vet_trang', p.mau), p.x, p.y, co, co * 0.45, g + Math.PI, al); break; } // vệt hướng theo vận tốc (đầu sáng phía trước)
        case 'than': PX.ve(ctx, this.anh('fx_than', p.mau), p.x, p.y, co, co * 0.88, p.goc, al); break;
        case 'la': PX.ve(ctx, this.anh('fx_la', p.mau), p.x, p.y, co, co, p.goc, al); break;
        case 'giot': PX.ve(ctx, this.anh('fx_giot_nuoc', p.mau), p.x, p.y, co * 0.95, co, Math.atan2(p.vy, p.vx) - Math.PI / 2, al); break;
        case 'xu': { const im = REN.img('cb_xu'); if (im) PX.ve(ctx, im, p.x, p.y, co * Math.max(0.15, Math.abs(Math.cos(p.goc))), co, 0, al); break; } // xu lật = co bề ngang theo cos
        case 'giay': PX.ve(ctx, this.anh('fx_hoa_giay', p.mau), p.x, p.y, co, co * 0.9, p.goc, al); break;
        case 'tuyet': PX.ve(ctx, this.anh('hat_tuyet', p.mau), p.x, p.y, co, co, p.goc, al); break;
      }
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
  // ---- sự kiện ----
  them(k, o) { if (this.ds.length > 40) this.ds.shift(); o.k = k; o.t = 0; o.seed = ++this.dem; o.r = this.ngau(o.seed * 7 + 3); this.ds.push(o); if (this.SIG[k].bat) this.SIG[k].bat.call(this, o); return o; },
  sang(m, mau) { if (typeof TVX !== 'undefined' && !TVX.duocSang(1.2)) return; FX.sang(m * this.kFlash(), mau); },
  lac(m) { if (typeof TVX !== 'undefined' && !TVX.duocLac(0.6)) return; FX.lac(m); },
  // vẽ có NGÂN SÁCH: nhiều chiêu Đỏ cùng lúc (> NANG chiêu) → chiêu đến sau vẽ bản nhẹ: bỏ vòng / quầng / vòng xung cỡ lớn (> LON px),
  // giữ hình lõi + hạt — phần tốn là điểm ảnh cộng sáng của ảnh lớn (đo tools/thap-kt-dosig-perf.js)
  NANG: 2, LON: 120, _nhe: false,
  vg(ctx, x, y, r, w, mau, al) { if (this._nhe && r * PX.K_VONG > this.LON) return; PX.vong(ctx, x, y, r, w, mau, al); },
  ch(ctx, x, y, co, mau, al) { if (this._nhe && co > this.LON) return; PX.cham(ctx, x, y, co, mau, al); },
  im(ctx, im, x, y, w, h, goc, al) { if (this._nhe && w > this.LON) return; PX.ve(ctx, im, x, y, w, h, goc, al); },
  conTren(T) { return T && G.ban[T.ban] && G.ban[T.ban].t[T.o] === T; },

  // quét G.hu + trạng thái ụ Đỏ mỗi khung vẽ (chỉ đọc)
  quet() {
    const dang = new Set(G.hu);
    for (const o of G.hu) {
      if (this._hu.has(o)) continue; this._hu.add(o);
      if (o.k === 'cungSang' && !o.T) { const T = this.timKhoiSinh(o.x0, o.y0); if (T) this.them('sen', { T, B: G.ban[T.ban], x0: o.x0, y0: o.y0, x1: o.x1, y1: o.y1 }); continue; }
      if (o.k === 'cbQuay' && o.B) { this._theo.push(o); continue; }
      const T = o.T; if (!T) continue;
      switch (o.k) {
        case 'hoden': if (T.id === 'blackhole') { this.them('hoden', { o, T, B: o.B, x: o.x, y: o.y, R: o.r, A: !!o.A }); this._theo.push(o); } break;
        case 'sam': if (T.id === 'overlord') this.them('sam', { T, B: o.B, x: o.x, y: o.y, R: o.r }); break;
        case 'rewind': if (T.id === 'ngaithoigian') this.them('rewind', { o, T, B: o.B }); break;
        case 'ongLao': case 'hiveLao': if (T.id === 'chuato') { this._theo.push(o); if (o.k === 'ongLao' && !this.ds.some(e => e.k === 'swarm' && e.T === T && e.t < 0.05)) this.them('swarm', { T, B: o.B }); } break;
        case 'thoThuy': if (T.id === 'leviathan') this.them('tide', { o, T, B: o.B }); break;
        case 'xoay': if (T.id === 'leviathan') this.them('nuot', { o, T, B: o.B }); break;
        case 'rongBo': if (T.id === 'ronglua') this.them('dive', { o, T, B: o.B }); break;
        case 'thacLan': if (T.id === 'thacmana' && o.lon) this.them('thac', { o, T, B: G.ban[T.ban] }); break;
      }
    }
    // vật đang theo dõi: biến mất / đổi trạng thái
    for (let i = this._theo.length - 1; i >= 0; i--) {
      const o = this._theo[i];
      if (o.k === 'cbQuay') { if (o.da && !o._dsg) { o._dsg = 1; const c = o.B.o[o.o]; if (c) this.them('jackpot', { B: o.B, x: c.x, y: c.y, jp: !!(o.r && o.r.jp), mau: (typeof CB !== 'undefined' && o.r && CB.MAU && CB.MAU[o.r.f]) || '#ffd23f' }); } if (!dang.has(o)) this._theo.splice(i, 1); continue; }
      if (dang.has(o)) continue;
      this._theo.splice(i, 1);
      if (o.k === 'hoden') this.them('nghien', { T: o.T, B: o.B, x: o.x, y: o.y, R: o.r, A: !!o.A });
      else if ((o.k === 'ongLao' || o.k === 'hiveLao') && o.E) this.them('ongNo', { B: o.B, x: o.E.x, y: o.E.y, lon: o.k === 'ongLao' });
    }
    // trạng thái ụ (Lò Băng bùng / Thác Mana bật lũ)
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.bac !== 'do') continue;
      let s = this._st.get(T); if (!s) { s = { bung: T.bungT || 0, thac: T.thacT || 0 }; this._st.set(T, s); }
      if (T.id === 'lophanung' && (T.bungT || 0) > s.bung + 0.5) this.them('bang', { T, B, R: SKILLS.lophanung.r(T) * 1.6 });
      if (T.id === 'thacmana' && (T.thacT || 0) > s.thac + 1) this.them('tran', { T, B });
      s.bung = T.bungT || 0; s.thac = T.thacT || 0;
    }
  },
  // cung sáng (HU.cungSang) không mang ụ → ụ Khởi Sinh có tâm trùng điểm đầu cung
  timKhoiSinh(x, y) { for (const B of G.ban) for (const T of B.t) if (T && T.id === 'khoisinh') { const c = tamU(T); if (Math.abs(c.x - x) < 3 && Math.abs(c.y - y) < 3) return T; } return null; },
  // BÁO TRƯỚC theo trạng thái (vẽ mỗi khung, không lưu)
  veBao(ctx) {
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.bac !== 'do' || (T.st && (T.st.da || T.st.bang > 0))) continue;
      const f = this.BAO[T.id]; if (f) f.call(this, ctx, T, B, tamU(T), this.kBan(B));
    }
  },
  ve(ctx) {
    if (!this.bat || !G.ban || !G.ban.length || typeof PX === 'undefined') return;
    const gt = G.t || 0;
    if (gt < this.gT - 0.5) { this.ds.length = 0; this.hat.length = 0; this._theo.length = 0; } // trận mới / tua lại
    const dt = this.gT < 0 ? 0 : Math.max(0, Math.min(0.25, gt - this.gT)); this.gT = gt; this.dt = dt;
    this.quet();
    const g0 = ctx.globalAlpha, c0 = ctx.globalCompositeOperation;
    try {
      this.veBao(ctx);
      let j = 0, nang = 0;
      for (let i = 0; i < this.ds.length; i++) {
        const e = this.ds[i]; e.t += dt; const S = this.SIG[e.k];
        if (e.t > S.dai(e)) continue;
        if (e.t < 1.2 && !S.nho) nang++; this._nhe = nang > this.NANG || this.gon(); // chiêu thứ 3 trở đi đang bùng cùng lúc → bản nhẹ
        S.ve.call(this, ctx, e, this.kBan(e.B)); this.ds[j++] = e;
      }
      this._nhe = false; this.ds.length = j;
      this.capHat(dt); this.veHat(ctx);
    } finally { ctx.globalAlpha = g0; ctx.globalCompositeOperation = c0; }
  },
};

// =============================================== BÁO TRƯỚC (chiêu sắp / đã sẵn sàng) ===============================================
DSG.BAO = {
  // Hố Đen: hạt tối xoắn vào nòng khi hố kế gần tới (bhT ≥ 0.75)
  blackhole(ctx, T, B, c, k) {
    const p = (T.bhT || 0); if (p < 0.75 || G.hu.some(o => o.k === 'hoden' && o.T === T)) return;
    const q = (p - 0.75) / 0.25; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const ph = (G.t * 1.6 + i / 5) % 1, a = G.t * 5 + i * 1.257 + ph * 3, r = (30 - 24 * ph) * k; this.ch(ctx, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 9 * k, '#b04bff', q * (0.3 + 0.7 * ph)); }
    this.ch(ctx, c.x, c.y, 34 * k * (0.6 + 0.4 * q), '#7a2cff', 0.35 * q);
  },
  // Overlord: điện đỏ bò quanh đầu khi nạp ≥ 70%, dày dần
  overlord(ctx, T, B, c, k) {
    const p = T.nap || 0; if (p < 0.7) return;
    const q = (p - 0.7) / 0.3, nhip = Math.floor(G.t / 0.07), n = 1 + Math.floor(q * 3);
    ctx.globalCompositeOperation = 'lighter';
    this.ch(ctx, c.x, c.y, 46 * k * (0.5 + 0.5 * q), '#ff2a4a', 0.25 + 0.35 * q);
    for (let i = 0; i < n; i++) {
      const r = this.ngau(nhip * 13 + i * 7 + T.o), a0 = r() * 6.283, a1 = a0 + 0.8 + r() * 1.4, R = 22 * k;
      PX.duong(ctx, this.khuc(c.x + Math.cos(a0) * R, c.y + Math.sin(a0) * R, c.x + Math.cos(a1) * R, c.y + Math.sin(a1) * R, 3, 5 * k, nhip + i), 1.6, '#ff6a7a', 0.5 + 0.5 * q);
    }
  },
  // Lò Băng: 6 tinh thể sương quay chậm quanh lò khi ICE STORM sẵn sàng
  lophanung(ctx, T, B, c, k) {
    if (!(T.nap >= 1)) return; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const a = G.t * 0.9 + i * Math.PI / 3; PX.sao(ctx, c.x + Math.cos(a) * 30 * k, c.y + Math.sin(a) * 30 * k, 11 * k, '#bff4ff', 0.6, a); }
  },
  // Ngai: 12 vạch giờ quanh ngai, 1 vạch sáng chạy NGƯỢC chiều kim (tích tắc) khi REWIND sẵn sàng
  ngaithoigian(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3)) return; ctx.globalCompositeOperation = 'lighter';
    const cur = 11 - (Math.floor(G.t * 4) % 12);
    for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6, r = 31 * k; this.ch(ctx, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, (i === cur ? 13 : 5) * k, i === cur ? '#ffd27a' : '#ff2a3a', i === cur ? 0.95 : 0.45); }
  },
  // Chúa Tổ: lục giác hổ phách xoay chậm quanh tổ khi SWARM sẵn sàng
  chuato(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3)) return; ctx.globalCompositeOperation = 'lighter';
    this.dagiac(ctx, c.x, c.y, 32 * k, 6, G.t * 0.6, 1.4, '#ffb43a', 0.55);
  },
  // Leviathan: bong bóng nổi lên từ thân khi TIDAL BREATH sẵn sàng
  leviathan(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3)) return; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const ph = (G.t * 0.7 + i / 4) % 1, x = c.x + Math.sin(i * 2.1 + G.t * 2) * 14 * k; this.vg(ctx, x, c.y + 10 * k - ph * 40 * k, (3 + 2 * ph) * k, 2, '#bff4ff', 0.7 * (1 - ph)); }
  },
  // Khởi Sinh: 3 cánh sen bay vòng khi GENESIS sẵn sàng
  khoisinh(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3)) return; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const a = G.t * 1.2 + i * 2.094; PX.ve(ctx, this.anh('fx_la', '#ff8ab0'), c.x + Math.cos(a) * 28 * k, c.y + Math.sin(a) * 28 * k, 12 * k, 12 * k, a + Math.PI / 2, 0.7); }
  },
  // Rồng Máy: than lửa bốc lên + hơi nóng khi DRAGON DIVE sẵn sàng
  ronglua(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3)) return; ctx.globalCompositeOperation = 'lighter';
    this.ch(ctx, c.x, c.y, 50 * k, '#ff5a1a', 0.28);
    for (let i = 0; i < 4; i++) { const ph = (G.t * 0.9 + i / 4) % 1; PX.ve(ctx, this.anh('fx_than', '#ff8a2a'), c.x + Math.sin(i * 1.7 + G.t * 3) * 16 * k, c.y - ph * 44 * k, 10 * k * (1 - ph * 0.5), 9 * k, -Math.PI / 2, 0.8 * (1 - ph)); }
  },
  // Thác Mana: 3 giọt mana bay vòng khi MANA FLOOD sẵn sàng
  thacmana(ctx, T, B, c, k) {
    if (!(T.nap >= 1 && T.sao >= 3) || T.thacT > 0) return; ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const a = -G.t * 1.5 + i * 2.094; PX.ve(ctx, this.anh('fx_giot_nuoc', '#b48cff'), c.x + Math.cos(a) * 27 * k, c.y + Math.sin(a) * 27 * k, 9 * k, 10 * k, a, 0.75); }
  },
};

// =============================================== CHỮ KÝ TỪNG Ụ ===============================================
DSG.SIG = {
  // ---------------- HỐ ĐEN: hút vào → chân trời sự kiện → nghiền vỡ tung ----------------
  hoden: {
    dai: (e) => (e.o && e.o.song ? e.o.song + 0.05 : 3),
    bat(e) {
      const k = this.kBan(e.B), R = e.R;
      this.bung(10, (i, n) => { const a = i / n * 6.283 + e.r(), d = R * (1.25 + 0.3 * e.r()); this.hat1({ k: 'vet', x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, vx: -Math.cos(a) * d * 3.2, vy: -Math.sin(a) * d * 3.2, song: 0.3, co: 30 * k, mau: '#d9b0ff' }); });
      this.lac(e.A ? 3 : 2);
    },
    ve(ctx, e, k) {
      const o = e.o, t = e.t, R = e.R, x = o.x, y = o.y; ctx.globalCompositeOperation = 'lighter';
      // co sập: 3 vòng co từ ngoài vào (0–0.35 s)
      for (let i = 0; i < 3; i++) { const u = (t - i * 0.07) / 0.3; if (u > 0 && u < 1) this.vg(ctx, x, y, R * (1.3 - 1.05 * this.e3(u)), 3, i ? '#b04bff' : '#ffffff', 0.7 * (1 - u)); }
      const vao = Math.min(1, t / 0.35), ra = o.song ? Math.min(1, (o.song - o.t) / 0.25) : 1, al = vao * ra;
      // đĩa bồi tụ: 2 cánh tay xoắn (điểm sáng nhỏ chạy dọc xoắn ốc, quay)
      for (let arm = 0; arm < 2; arm++) for (let j = 0; j < 7; j++) {
        const s = ((j / 7) + t * 0.6) % 1, rr = R * (0.95 - 0.7 * s), a = arm * Math.PI + s * 4.2 + t * 2.4;
        this.ch(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, (8 + 10 * s) * k, s > 0.7 ? '#f0d8ff' : '#b04bff', al * 0.9 * (0.35 + 0.65 * s));
      }
      // mép vùng hút: 3 cung sáng quay (đọc được bán kính hố)
      for (let i = 0; i < 12; i++) { const a = t * 1.8 + i * 0.5236; this.ch(ctx, x + Math.cos(a) * R * 0.98, y + Math.sin(a) * R * 0.98, (i % 4 ? 7 : 12) * k, i % 4 ? '#b04bff' : '#f0d8ff', 0.7 * al); } // (không PX.cung xoay: mỗi góc mới dựng 1 canvas → tốn)
      // chân trời sự kiện: lõi tối (đè thường, không cộng sáng) + vành sáng + 3 tia sao bay quỹ đạo
      ctx.globalCompositeOperation = 'source-over'; this.ch(ctx, x, y, R * 0.62, '#000000', 0.5 * al);
      ctx.globalCompositeOperation = 'lighter'; this.vg(ctx, x, y, R * 0.24, 3, '#e0b8ff', 0.85 * al);
      for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.094; PX.sao(ctx, x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3, 12 * k, '#ffffff', 0.8 * al, a); }
      // hạt bị hút vào liên tục (xoắn + thu)
      if (this.dt > 0 && (e._h = (e._h || 0) + this.dt * (this.gon() ? 8 : 22)) >= 1) for (; e._h >= 1; e._h--) { const a = e.r() * 6.283; this.hat1({ k: 'cham', x: x + Math.cos(a) * R, y: y + Math.sin(a) * R, vx: 0, vy: 0, cx: x, cy: y, xoay: 3.2, thu: 1.6, song: 0.6, co: 7 * k, mau: '#c890ff', nho: 0.6 }); }
    },
  },
  nghien: {
    dai: () => 1.0,
    bat(e) {
      const k = this.kBan(e.B), R = e.R;
      this.bung(14, (i, n) => { const a = i / n * 6.283 + e.r() * 0.4, v = (240 + 160 * e.r()) * k; this.hat1({ k: 'vet', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, can: 3, song: 0.45, co: 26 * k, mau: i % 3 ? '#b04bff' : '#ffffff' }); });
      this.bung(10, (i) => { const a = e.r() * 6.283, d = R * e.r() * 0.6; this.hat1({ k: 'cham', x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, vx: Math.cos(a) * 14, vy: -18 - 10 * e.r(), song: 0.9, co: 8 * k, mau: '#a050ff' }); });
      this.lac(e.A ? 4 : 3); this.sang(0.12, '#b04bff');
    },
    ve(ctx, e, k) {
      const t = e.t, R = e.R; ctx.globalCompositeOperation = 'lighter';
      this.ch(ctx, e.x, e.y, R * 1.5, '#f0d8ff', 0.75 * this.loe(t / 0.3, 0.15, 0.85));
      for (let i = 0; i < 2; i++) { const u = (t - i * 0.08) / 0.45; if (u > 0 && u < 1) this.vg(ctx, e.x, e.y, R * (0.3 + 1.0 * this.e3(u)), 3, i ? '#b04bff' : '#ffffff', 0.85 * (1 - u)); }
      const u = t / 0.5; if (u < 1) { const s = R * (0.6 + 1.6 * this.e3(u)); this.im(ctx, this.anh('fx_song_xung', '#c070ff'), e.x, e.y, s, s, t * 2, 0.75 * (1 - u)); }
      if (!this.gon()) this.vg(ctx, e.x, e.y, R * 1.05, 2, '#7a2cff', 0.3 * (1 - t)); // dư âm: vết vành mờ
    },
  },
  // ---------------- OVERLORD: thiên lôi đỏ thẫm từ trời + vết nứt đất có điện bò ----------------
  sam: {
    dai: (e) => (DSG.gon() ? 0.7 : 1.5),
    bat(e) {
      const k = this.kBan(e.B), R = e.R;
      e.nut = []; const n = this.gon() ? 4 : 7;
      for (let i = 0; i < n; i++) { const a = i / n * 6.283 + e.r() * 0.6, L = R * (0.45 + 0.45 * e.r()); e.nut.push(this.khuc(e.x, e.y, e.x + Math.cos(a) * L, e.y + Math.sin(a) * L, 4, 7 * k, e.seed * 31 + i)); }
      this.bung(16, (i) => { const a = e.r() * 6.283, v = (160 + 200 * e.r()) * k; this.hat1({ k: i % 2 ? 'sao' : 'cham', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 420, can: 1.5, song: 0.55, co: (i % 2 ? 12 : 7) * k, mau: i % 3 ? '#ff4a5a' : '#ffffff', vg: 6 }); });
      this.bung(5, () => { const a = e.r() * 6.283; this.hat1({ k: 'cham', x: e.x + Math.cos(a) * R * 0.3, y: e.y + Math.sin(a) * R * 0.3, vx: 0, vy: -16, song: 1.2, co: 34 * k, lon: 0.8, mau: '#2a0008', add: false, al: 0.35 }); }); // khói tối
      this.lac(4); this.sang(0.16, '#ff2a4a');
    },
    ve(ctx, e, k) {
      const t = e.t, R = e.R; ctx.globalCompositeOperation = 'lighter';
      // cột sét từ trời (0–0.25 s): 3 nhánh gấp khúc + lõi trắng
      if (t < 0.28) {
        const a = 1 - t / 0.28, nhip = Math.floor(t / 0.05);
        for (let i = 0; i < 3; i++) PX.duong(ctx, this.khuc(e.x + (i - 1) * 26 * k, e.y - 300, e.x, e.y, 9, 16 * k, e.seed * 5 + i * 11 + nhip), i === 1 ? 4.5 : 2.6, i === 1 ? '#ffd0d6' : '#ff2a4a', a);
        PX.tia(ctx, e.x, e.y - 300, e.x, e.y, 7, '#ffffff', a * 0.55);
      }
      // loé trúng + vòng xung gai + 2 vòng
      this.ch(ctx, e.x, e.y, R * 1.7, '#ffe0e4', 0.8 * this.loe(t / 0.32, 0.12, 0.88));
      const u = t / 0.45; if (u < 1) { const s = R * (0.5 + 1.5 * this.e3(u)); this.im(ctx, this.anh('fx_song_xung', '#ff3a5a'), e.x, e.y, s, s, 0.3, 0.85 * (1 - u)); }
      for (let i = 0; i < 2; i++) { const v = (t - 0.04 - i * 0.1) / 0.5; if (v > 0 && v < 1) this.vg(ctx, e.x, e.y, R * (0.2 + 0.95 * this.e3(v)), 3, i ? '#ff2a4a' : '#ffffff', 0.8 * (1 - v)); }
      // vết nứt đất: sáng đỏ rồi nguội; điện bò dọc vết nứt
      const an = Math.max(0, 1 - Math.max(0, t - 0.3) / 1.1), mo = Math.min(1, t / 0.08) * an;
      for (const p of e.nut) {
        PX.duong(ctx, p, 2.4, '#ff5a6a', 0.85 * mo);
        const dau = p[p.length - 1]; this.ch(ctx, dau[0], dau[1], 10 * k, '#ff8a9a', 0.6 * mo);
      }
      if (!this.gon() && t > 0.3 && e.nut.length) {
        const nhip = Math.floor(t / 0.09), p = e.nut[nhip % e.nut.length], i = nhip % (p.length - 1);
        PX.duong(ctx, this.khuc(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], 3, 5 * k, e.seed + nhip), 1.6, '#ffc0c8', 0.9 * an);
      }
    },
  },
  // ---------------- LÒ BĂNG: hút sương → bông tuyết 6 cánh mọc nhánh + mảnh băng → tuyết rơi ----------------
  bang: {
    dai: (e) => (DSG.gon() ? 0.9 : 2.0),
    bat(e) {
      const k = this.kBan(e.B), c = tamU(e.T), R = e.R; e.x = c.x; e.y = c.y;
      this.bung(8, (i, n) => { const a = i / n * 6.283, d = 70 * k; this.hat1({ k: 'vet', x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d, vx: -Math.cos(a) * d * 7, vy: -Math.sin(a) * d * 7, song: 0.14, co: 28 * k, mau: '#dffaff' }); });
      this.bung(18, (i, n) => { const a = i / n * 6.283 + e.r() * 0.3, v = (200 + 140 * e.r()) * k; this.hat1({ k: 'vet', x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, can: 2.6, song: 0.5, co: 22 * k, mau: '#9fe8ff' }); });
      if (!this.gon()) for (let i = 0; i < 16; i++) { const a = e.r() * 6.283, d = R * Math.sqrt(e.r()) * 0.85; this.hat1({ k: 'tuyet', x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d - 30 * k, vx: (e.r() - 0.5) * 12, vy: 14 + 10 * e.r(), song: 1.4 + 0.5 * e.r(), co: (9 + 5 * e.r()) * k, mau: '#ffffff', vg: 1.5 }); }
    },
    ve(ctx, e, k) {
      const t = e.t, R = e.R, x = e.x, y = e.y; ctx.globalCompositeOperation = 'lighter';
      const u = this.e3((t - 0.08) / 0.4), al = Math.min(1, t / 0.1) * (1 - Math.max(0, (t - 0.9) / 0.5));
      if (al > 0.01 && t > 0.08) {
        const L = R * 0.5 * u, g0 = t * 0.25;
        for (let i = 0; i < 6; i++) {
          const a = g0 + i * Math.PI / 3, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
          PX.tia(ctx, x, y, ex, ey, 2.6, '#dffaff', 0.8 * al);
          for (const f of [0.5, 0.78]) { const bx = x + Math.cos(a) * L * f, by = y + Math.sin(a) * L * f, l = L * 0.24 * (1.2 - f); for (const s of [-1, 1]) PX.tia(ctx, bx, by, bx + Math.cos(a + s * 1.05) * l, by + Math.sin(a + s * 1.05) * l, 1.8, '#9fe8ff', 0.75 * al); }
          PX.sao(ctx, ex, ey, 14 * k, '#ffffff', 0.9 * al, a);
        }
        this.ch(ctx, x, y, 40 * k, '#bff4ff', 0.5 * al);
      }
      const v = t / 0.55; if (v < 1) { const s = R * (0.4 + 1.5 * this.e3(v)); this.im(ctx, this.anh('fx_song_xung', '#9fe8ff'), x, y, s, s, 0, 0.7 * (1 - v)); }
    },
  },
  // ---------------- NGAI THỜI GIAN: đồng hồ kim quay ngược, gợn co vào, bóng quái chỗ cũ, cát vàng chảy về ----------------
  rewind: {
    dai: () => (DSG.gon() ? 0.8 : 1.3),
    bat(e) {
      const k = this.kBan(e.B), c = tamU(e.T); e.x = c.x; e.y = c.y;
      e.bong = [];
      for (const q of (e.o.keo || []).slice(0, 12)) { const p = G.duong[q.E.p]; if (!p) continue; const [x0, y0] = viTri(p, q.s0); e.bong.push([x0, y0]); }
      if (!this.gon()) for (const [bx, by] of e.bong) this.hat1({ k: 'cham', x: bx, y: by, vx: 0, vy: 0, keo: 2.6, tx: c.x, ty: c.y, song: 0.9, co: 9 * k, mau: '#ffd27a' });
      this.bung(12, (i, n) => { const a = i / n * 6.283; this.hat1({ k: 'sao', x: c.x + Math.cos(a) * 60 * k, y: c.y + Math.sin(a) * 60 * k, vx: 0, vy: 0, cx: c.x, cy: c.y, xoay: -4, thu: 1.8, song: 0.6, co: 10 * k, mau: '#ffd27a' }); });
    },
    ve(ctx, e, k) {
      const t = e.t, x = e.x, y = e.y; ctx.globalCompositeOperation = 'lighter';
      const sc = this.e3(t / 0.16), al = 1 - Math.max(0, (t - 0.6) / 0.5), R = 48 * k * sc;
      if (al > 0.01) {
        this.vg(ctx, x, y, R, 3, '#ffd27a', 0.85 * al); this.vg(ctx, x, y, R * 0.84, 2, '#ff2a3a', 0.7 * al);
        for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i * Math.PI / 6, l = i % 3 ? 5 : 9; PX.tia(ctx, x + Math.cos(a) * (R * 0.9 - l * k), y + Math.sin(a) * (R * 0.9 - l * k), x + Math.cos(a) * R * 0.9, y + Math.sin(a) * R * 0.9, i % 3 ? 1.4 : 2.2, '#ffd27a', 0.9 * al); }
        const aD = -Math.PI / 2 - t * 16, aN = -Math.PI / 2 - t * 3.2; // kim quay NGƯỢC
        PX.tia(ctx, x, y, x + Math.cos(aD) * R * 0.78, y + Math.sin(aD) * R * 0.78, 2.4, '#fff0d0', al);
        PX.tia(ctx, x, y, x + Math.cos(aN) * R * 0.5, y + Math.sin(aN) * R * 0.5, 3.2, '#ff4b5a', al);
        this.ch(ctx, x, y, 16 * k, '#ffd27a', 0.9 * al);
      }
      // gợn CO VÀO (tua ngược)
      for (let i = 0; i < 3; i++) { const u = (t - i * 0.12) / 0.5; if (u > 0 && u < 1) this.vg(ctx, x, y, (110 - 96 * this.e3(u)) * k, 2, '#ff6a7a', 0.6 * Math.sin(u * Math.PI)); }
      // bóng quái ở chỗ cũ (tàn ảnh) mờ dần
      const ab = 0.7 * (1 - Math.min(1, t / 0.8));
      if (ab > 0.01) for (const [bx, by] of e.bong) { this.vg(ctx, bx, by, 13 * k, 2, '#ff4b5a', ab); this.ch(ctx, bx, by, 22 * k, '#ff2a3a', ab * 0.5); }
    },
  },
  // ---------------- CHÚA TỔ: tổ ong lục giác hổ phách lúc SWARM, nổ lục giác chỗ drone lao ----------------
  swarm: {
    dai: () => 0.8,
    bat(e) { this.lac(2); },
    ve(ctx, e, k) {
      if (!this.conTren(e.T)) return; const c = tamU(e.T), t = e.t, r = 14 * k; ctx.globalCompositeOperation = 'lighter';
      const o = [[0, 0]]; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; o.push([Math.cos(a) * r * 1.74, Math.sin(a) * r * 1.74]); }
      o.forEach((p, i) => { const u = (t - (i ? 0.06 + i * 0.02 : 0)) / 0.6; if (u > 0 && u < 1) this.dagiac(ctx, c.x + p[0] * (0.6 + 0.4 * this.e3(u)), c.y + p[1] * (0.6 + 0.4 * this.e3(u)), r * (0.9 + 0.2 * u), 6, 0, 2, i ? '#ffb43a' : '#fff0b0', 0.9 * (1 - u)); });
      this.ch(ctx, c.x, c.y, 96 * k, '#ff8a2a', 0.55 * this.loe(t / 0.6, 0.1, 0.9));
    },
  },
  ongNo: {
    nho: 1,
    dai: (e) => (e.lon ? 0.5 : 0.32),
    bat(e) { if (e.lon) this.bung(5, () => { const a = e.r() * 6.283, v = 120 * this.kBan(e.B); this.hat1({ k: 'sao', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, can: 3, song: 0.35, co: 10, mau: '#ffd23f' }); }); },
    ve(ctx, e, k) {
      const u = e.t / this.SIG.ongNo.dai(e), r = (e.lon ? 10 + 14 * this.e3(u) : 7 + 8 * this.e3(u)) * k; ctx.globalCompositeOperation = 'lighter';
      this.dagiac(ctx, e.x, e.y, r, 6, 0, e.lon ? 2.2 : 1.5, '#ffb43a', (e.lon ? 0.9 : 0.6) * (1 - u));
      if (e.lon) this.dagiac(ctx, e.x, e.y, r * 0.55, 6, Math.PI / 6, 1.6, '#fff0b0', 0.8 * (1 - u));
    },
  },
  // ---------------- LEVIATHAN: đầu sóng bọt trắng, giọt nước văng, gợn đọng dọc đường ----------------
  tide: {
    dai: (e) => (e.o.song || 1.4) + (DSG.gon() ? 0.3 : 0.9),
    bat(e) {
      const k = this.kBan(e.B), c = tamU(e.T); e.gon = [];
      this.bung(10, () => { const a = -Math.PI / 2 + (e.r() - 0.5) * 1.6, v = (140 + 90 * e.r()) * k; this.hat1({ k: 'giot', x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 520, song: 0.7, co: 12 * k, mau: '#7fdcff' }); });
      this.sang(0.1, '#1fb6d9');
    },
    ve(ctx, e, k) {
      const o = e.o, t = e.t; ctx.globalCompositeOperation = 'lighter';
      if (t < 0.5 && this.conTren(e.T)) { const c = tamU(e.T), u = t / 0.5; this.im(ctx, this.anh('fx_song_xung', '#7fdcff'), c.x, c.y, (40 + 90 * this.e3(u)) * k, (40 + 90 * this.e3(u)) * k, 0, 0.7 * (1 - u)); }
      const song = t < (o.song || 1.4) && o.x != null;
      if (song) {
        const x = o.x, y = o.y, lx = e.lx == null ? x : e.lx, ly = e.ly == null ? y : e.ly, g = Math.atan2(y - ly, x - lx);
        if (Math.hypot(x - lx, y - ly) > 0.5) e.g = g;
        const gg = e.g || 0;
        // đầu sóng: 3 vệt bọt hướng theo chiều sóng + quầng nước
        this.ch(ctx, x, y, 80 * k, '#1fb6d9', 0.45);
        for (let i = -1; i <= 1; i++) { const nx = -Math.sin(gg) * i * 16 * k, ny = Math.cos(gg) * i * 16 * k; PX.ve(ctx, this.anh('fx_vet_trang', '#e8fbff'), x + nx - Math.cos(gg) * Math.abs(i) * 8 * k, y + ny - Math.sin(gg) * Math.abs(i) * 8 * k, 46 * k, 20 * k, gg + Math.PI, 0.8); }
        if (this.dt > 0) {
          if ((e._g = (e._g || 0) + this.dt * (this.gon() ? 10 : 26)) >= 1) for (; e._g >= 1; e._g--) { const a = gg + Math.PI + (e.r() - 0.5) * 2.4, v = (60 + 90 * e.r()) * k; this.hat1({ k: 'giot', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, g: 420, song: 0.55, co: (8 + 5 * e.r()) * k, mau: '#9fe8ff' }); }
          if (!e.gx || Math.hypot(x - e.gx, y - e.gy) > 34 * k) { e.gx = x; e.gy = y; if (!this.gon()) e.gon.push({ x, y, t0: t }); }
        }
        e.lx = x; e.ly = y;
      }
      // gợn đọng lại dọc đường (dư âm)
      for (const p of e.gon) { const u = (t - p.t0) / 0.9; if (u > 0 && u < 1) { this.vg(ctx, p.x, p.y, (6 + 22 * this.e3(u)) * k, 2, '#bff4ff', 0.55 * (1 - u)); this.vg(ctx, p.x, p.y, (3 + 12 * this.e3(u)) * k, 2, '#1fb6d9', 0.45 * (1 - u)); } }
    },
  },
  nuot: {
    nho: 1,
    dai: (e) => e.o.song || 0.6,
    ve(ctx, e, k) {
      const o = e.o, u = e.t / (o.song || 0.6), x = o.x, y = o.y; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) for (let j = 0; j < 5; j++) { const a = -e.t * (9 + i * 4) + i + j * 0.45, r = (24 - i * 8) * k * (1 - u * 0.5); this.ch(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, (8 - j) * k, i ? '#e8fbff' : '#1fb6d9', 0.8 * (1 - u * u)); }
      if (this.dt > 0 && e.r() < this.dt * 20) { const a = e.r() * 6.283; this.hat1({ k: 'giot', x: x + Math.cos(a) * 30 * k, y: y + Math.sin(a) * 30 * k, vx: 0, vy: 0, cx: x, cy: y, xoay: -6, thu: 2.4, song: 0.4, co: 8 * k, mau: '#7fdcff' }); }
    },
  },
  // ---------------- KHỞI SINH: hoa sen 8 cánh nở + cột sáng; cánh hoa rơi ở ụ nhận ----------------
  sen: {
    dai: () => (DSG.gon() ? 0.9 : 1.4),
    bat(e) { const k = this.kBan(e.B); this.bung(6, (i) => this.hat1({ k: 'sao', x: e.x0 + (e.r() - 0.5) * 16 * k, y: e.y0, vx: 0, vy: -(50 + 40 * e.r()) * k, song: 0.8, co: 10 * k, mau: i % 2 ? '#ffd27a' : '#ffc0d8' })); },
    ve(ctx, e, k) {
      const t = e.t; ctx.globalCompositeOperation = 'lighter';
      // sen nở tại lõi (8 cánh)
      const mo = this.e3(t / 0.35), al = 1 - Math.max(0, (t - 0.6) / 0.4);
      if (al > 0.01) {
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t * 0.4, d = (8 + 18 * mo) * k, s = (10 + 16 * mo) * k; PX.ve(ctx, this.anh('fx_la', i % 2 ? '#ff8ab0' : '#ffc0d8'), e.x0 + Math.cos(a) * d, e.y0 + Math.sin(a) * d, s, s, a + Math.PI * 0.75, 0.85 * al); }
        this.ch(ctx, e.x0, e.y0, 30 * k, '#fff0f6', 0.7 * al);
        PX.tia(ctx, e.x0, e.y0, e.x0, e.y0 - 90 * k * mo, 12, '#ffc0d8', 0.55 * al); // cột sáng
      }
      // tới ụ nhận (~0.55 s): vòng vàng + cánh hoa toả rồi rơi chậm
      if (t >= 0.5 && !e.toi) {
        e.toi = 1; this.bung(7, (i, n) => { const a = i / n * 6.283, v = 70 * k; this.hat1({ k: 'la', x: e.x1, y: e.y1, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 60, can: 2.5, song: 0.9, co: 11 * k, mau: i % 2 ? '#ff8ab0' : '#ffc0d8', goc: a, vg: 3 }); });
      }
      if (t >= 0.5) { const u = (t - 0.5) / 0.45; if (u < 1) { this.vg(ctx, e.x1, e.y1, (8 + 26 * this.e3(u)) * k, 3, '#ffd27a', 0.85 * (1 - u)); this.ch(ctx, e.x1, e.y1, 40 * k, '#ff8ab0', 0.5 * (1 - u)); } }
    },
  },
  // ---------------- RỒNG MÁY: gầm (vòng xung lửa) → dải cánh lửa theo cú bổ nhào, than bay ----------------
  dive: {
    dai: (e) => (e.o.song || 1.3) + 0.6,
    bat(e) {
      const k = this.kBan(e.B), c = tamU(e.T); e.vet = [];
      this.bung(16, () => { const a = e.r() * 6.283, v = (120 + 140 * e.r()) * k; this.hat1({ k: 'than', x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, can: 2, g: -60, song: 0.7, co: 13 * k, mau: '#ff8a2a', goc: a }); });
      this.sang(0.14, '#ff5a1a');
    },
    ve(ctx, e, k) {
      const o = e.o, t = e.t; ctx.globalCompositeOperation = 'lighter';
      if (this.conTren(e.T) && t < 0.6) { const c = tamU(e.T); for (let i = 0; i < 2; i++) { const u = (t - i * 0.12) / 0.45; if (u > 0 && u < 1) { const s = (50 + 120 * this.e3(u)) * k; this.im(ctx, this.anh('fx_song_xung', i ? '#ffd27a' : '#ff5a1a'), c.x, c.y, s, s, i, 0.8 * (1 - u)); } } }
      const bay = t < (o.song || 1.3) && o.x != null;
      if (bay) {
        const g = (o.g || 0) - Math.PI, nx = -Math.sin(g), ny = Math.cos(g); // o.g: hướng mặt rồng
        e.vet.push({ l: [o.x + nx * 26 * k, o.y + ny * 26 * k], r: [o.x - nx * 26 * k, o.y - ny * 26 * k], t });
        if (e.vet.length > 14) e.vet.shift();
        if (this.dt > 0 && (e._h = (e._h || 0) + this.dt * (this.gon() ? 12 : 34)) >= 1) for (; e._h >= 1; e._h--) { const s = e.r() < 0.5 ? 1 : -1, d = (10 + 18 * e.r()) * k; this.hat1({ k: 'than', x: o.x + nx * s * d, y: o.y + ny * s * d, vx: (e.r() - 0.5) * 30, vy: -40 - 30 * e.r(), song: 0.55 + 0.3 * e.r(), co: (9 + 6 * e.r()) * k, mau: e.r() < 0.3 ? '#ffd27a' : '#ff6a2a', goc: -Math.PI / 2 }); }
      } else if (e.vet.length) e.vet.shift();
      // 2 dải cánh lửa (đầu cánh trái/phải) + lõi
      const n = e.vet.length;
      for (const s of ['l', 'r']) for (let i = 1; i < n; i++) { const a = i / n; PX.tia(ctx, e.vet[i - 1][s][0], e.vet[i - 1][s][1], e.vet[i][s][0], e.vet[i][s][1], 1.5 + 4 * a, a > 0.6 ? '#ffd27a' : '#ff5a1a', 0.85 * a); }
    },
  },
  // ---------------- LUCKY SLOT: mưa xu + giấy màu + chùm tia vàng (jackpot) ----------------
  jackpot: {
    dai: (e) => (e.jp ? 1.6 : 0.9),
    bat(e) {
      const k = this.kBan(e.B), n = e.jp ? 18 : 9;
      this.bung(n, () => { const a = -Math.PI / 2 + (e.r() - 0.5) * 2.2, v = (150 + 150 * e.r()) * k; this.hat1({ k: 'xu', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 520, song: 0.9 + 0.4 * e.r(), co: (15 + 4 * e.r()) * k, add: false, goc: e.r() * 6, vg: 9 + 6 * e.r() }); });
      if (e.jp) { const M = ['#ff5a7a', '#5ad1ff', '#ffd23f', '#7dff8a', '#c77dff']; this.bung(12, (i) => { const a = e.r() * 6.283, v = (90 + 130 * e.r()) * k; this.hat1({ k: 'giay', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 90, can: 1.4, song: 1.3, co: 12 * k, mau: M[i % 5], add: false, goc: a, vg: 5 }); }); this.lac(2); this.sang(0.12, '#ffd23f'); }
    },
    ve(ctx, e, k) {
      const t = e.t; ctx.globalCompositeOperation = 'lighter';
      if (e.jp) { const al = this.loe(t / 1.2, 0.1, 0.6); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + t * 0.8, L = (40 + 30 * this.e3(t / 0.3)) * k; PX.tia(ctx, e.x + Math.cos(a) * 14 * k, e.y + Math.sin(a) * 14 * k, e.x + Math.cos(a) * L, e.y + Math.sin(a) * L, i % 2 ? 2 : 3.4, '#ffd23f', 0.6 * al); } this.ch(ctx, e.x, e.y, 80 * k, '#ffe680', 0.5 * al); }
      const u = t / 0.5; if (u < 1) this.vg(ctx, e.x, e.y, (12 + (e.jp ? 50 : 30) * this.e3(u)) * k, 3, e.jp ? '#fff0b0' : e.mau, 0.85 * (1 - u));
    },
  },
  // ---------------- THÁC MANA: trận đồ phù văn suốt lũ mana; mỗi nhịp thác = dòng mana đổ từ trên xuống ----------------
  tran: {
    dai: (e) => (e.T && e.T.thacT > 0 ? 99 : 0) , // sống tới khi lũ mana hết (đọc T.thacT)
    bat(e) { const k = this.kBan(e.B), c = tamU(e.T); this.bung(10, (i, n) => { const a = i / n * 6.283; this.hat1({ k: 'sao', x: c.x + Math.cos(a) * 56 * k, y: c.y + Math.sin(a) * 56 * k, vx: 0, vy: 0, keo: 7, tx: c.x, ty: c.y, song: 0.3, co: 11 * k, mau: '#b48cff' }); }); this.sang(0.1, '#9a7bff'); },
    ve(ctx, e, k) {
      if (!this.conTren(e.T)) { e.t = 1e9; return; }
      const c = tamU(e.T), t = e.t, sc = this.e3((t - 0.2) / 0.3), al = Math.min(1, e.T.thacT / 0.4) * sc; if (al <= 0.01) return;
      ctx.globalCompositeOperation = 'lighter';
      const R = 38 * k;
      this.vg(ctx, c.x, c.y, R, 2, '#9a7bff', 0.6 * al); this.vg(ctx, c.x, c.y, R * 0.78, 2, '#7fd8ff', 0.45 * al);
      this.dagiac(ctx, c.x, c.y, R * 0.74, 3, t * 0.7, 1.4, '#b48cff', 0.55 * al); this.dagiac(ctx, c.x, c.y, R * 0.74, 3, -t * 0.7 + Math.PI, 1.4, '#7fd8ff', 0.55 * al);
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 - t * 0.5; PX.sao(ctx, c.x + Math.cos(a) * R * 0.9, c.y + Math.sin(a) * R * 0.9, 7 * k, '#e0d4ff', 0.6 * al, a); }
    },
  },
  thac: {
    nho: 1,
    dai: () => 0.5,
    bat(e) {
      e.ds = (e.o.ds || []).slice(0, this.gon() ? 5 : 10).map(d => ({ Q: d.Q, x: d.x, y: d.y }));
    },
    ve(ctx, e, k) {
      const t = e.t; ctx.globalCompositeOperation = 'lighter';
      e.ds.forEach((d, i) => {
        const x = d.Q && !d.Q.chet ? d.Q.x : d.x, y = d.Q && !d.Q.chet ? d.Q.y : d.y, tt = t - i * 0.02, u = tt / 0.14;
        if (tt < 0) return;
        if (u < 1) { const yt = y - 110 * k * (1 - this.e3(u)); PX.tia(ctx, x, yt - 60 * k, x, yt, 6, '#9a7bff', 0.8); PX.tia(ctx, x, yt - 36 * k, x, yt, 2.4, '#e8f6ff', 0.95); this.ch(ctx, x, yt, 16 * k, '#b48cff', 0.8); }
        else { const v = (tt - 0.14) / 0.3; if (v < 1) { this.vg(ctx, x, y, (5 + 16 * this.e3(v)) * k, 2, '#7fd8ff', 0.8 * (1 - v)); if (!d.b) { d.b = 1; this.hat1({ k: 'sao', x, y, vx: 0, vy: -40, song: 0.35, co: 9 * k, mau: '#e0d4ff' }); } } }
      });
    },
  },
};

// gắn vào lớp TRÊN (sau FX thường) — chịu khoét mềm quanh quái + alpha DIU.tren như mọi hiệu ứng trên
if (typeof REN !== 'undefined' && REN.veFx) {
  const veFx0 = REN.veFx;
  REN.veFx = function (ctx) { const r = veFx0.apply(this, arguments); try { DSG.ve(ctx); } catch (e) { DSG.loi = String(e && e.stack || e).slice(0, 300); if (G && G.debug) console.warn('[dosig]', e); } return r; };
}
