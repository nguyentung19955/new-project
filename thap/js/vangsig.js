// TURRET MERGE — CHỮ KÝ HIỆU ỨNG BẬC VÀNG + TÍM (docs/demo-hop-tuong/tuvan/anim-bac/RA-SOAT.md, yêu cầu 09/11:
//   "animation phải xứng bậc; Đỏ đẹp, khác biệt" — rà soát: 14 ụ Vàng + 6 ụ Tím dùng chung khuôn "chấm trúng nhạt").
// Quy chuẩn bậc: VÀNG = lớp phát sáng (quầng màu riêng) + 1 HÌNH ĐẶC TRƯNG mỗi ụ lúc trúng + khoảnh khắc đặc biệt khi kỹ năng nổ;
//   TÍM = hạt / ánh riêng nhỏ. KHÔNG lấn Đỏ: không chớp màn, không rung, vòng ≤ ~90 px (Đỏ 120–300 px), alpha quầng 25–40 %,
//   nổ loé ngắn (≤ 0,5 s) rồi tắt; đang có chiêu Đỏ bùng (DSG) → Vàng/Tím vẽ mờ ×0,55 để nhường sân khấu.
// Nguồn sự kiện (CHỈ ĐỌC, không đổi luật): TVX.trung (đòn trúng của ụ) · nhanU (nhãn kỹ năng — đã tắt chữ, vẫn được gọi đúng lúc
//   kỹ năng nổ: VERDICT, CLONE, CLAMP, SCRAMBLE, COPY, PURIFY, STAR BREAK, ARCHIVE, JAM…) · VX.ghep (ghép thật: ụ Vàng chỉ chạy khi ghép)
//   · trạng thái ụ (T.nhip xung hỗ trợ, T.mau Máu, T.hop Hoà âm, T.chuoi, T.epxung, B.hero). Thời gian theo G.t, nhiễu băm theo sự kiện
//   (không Math.random) → tất định, không ảnh hưởng đồng bộ online.
// Dùng lại khung của dosig.js (VSG kế thừa DSG: hạt, băm, đa giác, vẽ ảnh PNG có sẵn) — QUY-TAC-HINH: chỉ đặt/xoay/phóng/mờ/tô màu PNG
//   (fx_cham_trang, fx_vong_mong, fx_laser_tia, fx_tia_sao, fx_giot_nuoc, fx_la, fx_than); ảnh chưa tải → PX tự bỏ qua, hình cũ vẫn vẽ.
// Màu theo hệ ngữ nghĩa tuvan/huong-anime/BANG-MAU.md (buff #46DFA6, debuff #759AEF, độc #A6DF52, cháy #FF8748, băng #8BE7F7…),
//   tránh đỏ báo chiêu trùm #FF4C55 và đỏ bậc #FF4C48 cho vùng lớn.
// Vẽ ở lớp TRÊN của REN.veFx (ngay TRƯỚC chữ ký Đỏ) → được khoét mềm quanh quái + alpha DIU.tren. ?vsig=0 tắt hẳn để so trước/sau.
'use strict';

const VSG = Object.assign(Object.create(DSG), {
  bat: !(typeof location !== 'undefined' && /[?&]vsig=0\b/.test(location.search)),
  MAX_HAT: 90, MAX_SK: 26,
  ds: [], hat: [], gT: -1, dt: 0, dem: 0,
  _st: new WeakMap(), _cho: new WeakMap(),
  kNhuong: 1, // < 1 khi chiêu Đỏ đang bùng
  // Tím ít hơn Vàng: giãn cách giữa 2 hình trúng của cùng 1 ụ
  CACH: { vang: 0.36, tim: 0.6 }, MAX_H: 10, // trần hình trúng đồng thời (đo tools/thap-kt-dosig-perf.js IDS=…: điểm ảnh cộng sáng là phần tốn)
  them(k, o) { if (this.ds.length >= this.MAX_SK) { const i = this.ds.findIndex(e => e.k === 'h'); this.ds.splice(i < 0 ? 0 : i, 1); } o.k = k; o.t = -(o.tre || 0); o.seed = ++this.dem; o.r = this.ngau(o.seed * 11 + 5); this.ds.push(o); return o; },
  c(T) { return typeof tamU === 'function' ? tamU(T) : null; },
  // vị trí theo quái còn sống (đòn trúng bám theo quái đang đi)
  xy(e) { const E = e.E; if (E && !E.chet && E.x != null) { e.x = E.x; e.y = E.y; } return e; },
  // quầng phát sáng Vàng (aura 25–40 %): quầng màu + lõi trắng loé 0,1 s
  quang(ctx, x, y, r, m, u, al) {
    al = (al == null ? 1 : al) * this.kNhuong;
    this.ch(ctx, x, y, r * 2 * (0.8 + 0.3 * u), m, 0.36 * al * (1 - u));
    if (u < 0.3) this.ch(ctx, x, y, r * 0.9, '#ffffff', 0.5 * al * (1 - u / 0.3));
  },
  a(v) { return v * this.kNhuong; },

  // ---------- móc sự kiện ----------
  trung(T, E, crit) {
    if (!this.bat || !E || !T || !this.H[T.id] || !G.ban) return;
    const cd = this.CACH[T.bac] || 0.3, t0 = this._cho.get(T);
    if (t0 != null && G.t - t0 < cd && G.t >= t0) return; this._cho.set(T, G.t);
    let nh = 0; for (const e of this.ds) if (e.k === 'h') nh++;
    if (nh >= (this.gon() ? 4 : this.MAX_H) && !crit) return; // trận đông: bỏ bớt hình trúng thường (giữ chí mạng + kỹ năng)
    const c = this.c(T);
    this.them('h', { id: T.id, T, E, x: E.x, y: E.y, cx: c ? c.x : E.x, cy: c ? c.y : E.y, crit: !!crit, B: G.ban[T.ban] });
  },
  // nhãn kỹ năng (nhanU): chữ đã tắt, nhưng gọi đúng khoảnh khắc kỹ năng nổ → hình đặc biệt
  nhan(T, s) {
    if (!this.bat || !T || typeof s !== 'string' || !G.ban) return;
    const f = this.NHAN.find(q => q[0].test(s)); if (!f) return;
    const B = G.ban[T.ban], c = B && B.o[T.o]; if (!c) return;
    this.them('db', { id: f[1], s, T, B, x: c.x, y: c.y, tre: G._treNhan || 0 });
  },
  // ghép thật có ụ Vàng "chỉ chạy khi ghép" (Evolver, Orbital, Twin Anvil… — RA-SOAT mục 2)
  ghep(B, a, b, ra) {
    if (!this.bat || !B || !a || !b) return;
    const id = this.GHEP[a.id] ? a.id : this.GHEP[b.id] ? b.id : null; if (!id) return;
    const c = B.o[b.o], c0 = B.o[a.o]; if (!c) return;
    this.them('gh', { id, B, x: c.x, y: c.y, x0: c0 ? c0.x : c.x, y0: c0 ? c0.y : c.y, o: b.o, ra, tre: (ra && ra.vxA && ra.vxA.lo) || (typeof VX !== 'undefined' ? VX.TRE_LO : 0.4) });
  },
  // trạng thái ụ mỗi khung (xung hỗ trợ, Máu, Hoà âm…) → sự kiện + hào quang thường trực mờ
  quet(ctx) {
    for (const B of G.ban) {
      const k = this.kBan(B);
      if (B.hero && B.hero.length) for (const h of B.hero) if (h.het > G.t) this.AURA.hero.call(this, ctx, B, h, k);
      for (const T of B.t) {
        if (!T || (T.bac !== 'vang' && T.bac !== 'tim')) continue;
        let s = this._st.get(T); if (!s) { s = { nhip: T.nhip || 0, mau: T.mau || 0, hop: T.hop || 0, nm: T.nmPhaT || 0 }; this._st.set(T, s); }
        const id = T.id, c = this.c(T);
        if ((id === 'dongbo' || id === 'hasao') && (T.nhip || 0) + 0.5 < s.nhip) this.them('xung', { id, T, B, x: c.x, y: c.y });
        if (id === 'mauhut' && (T.mau || 0) > s.mau + 0.5) this.them('nuot', { id, T, B, x: c.x, y: c.y, n: (T.mau || 0) - s.mau });
        if (id === 'hopca' && (T.hop || 0) > s.hop) this.them('hoa', { id, T, B, x: c.x, y: c.y, n: T.hop });
        s.nhip = T.nhip || 0; s.mau = T.mau || 0; s.hop = T.hop || 0;
        if (T.st && (T.st.da || T.st.bang > 0)) continue;
        const f = this.AURA[id]; if (f) f.call(this, ctx, T, B, c, k);
        if (T.epxung > 0 && !this.gon()) this.AURA.epxungBuff.call(this, ctx, T, B, c, k);
      }
      // ụ đã ép xung (mọi bậc) — tia điện nhỏ lúc lắc
      if (!this.gon()) for (const T of B.t) if (T && T.epxung > 0 && T.bac !== 'vang' && T.bac !== 'tim' && !(T.st && T.st.da)) this.AURA.epxungBuff.call(this, ctx, T, B, this.c(T), k);
    }
  },
  ve(ctx) {
    if (!this.bat || !G.ban || !G.ban.length || typeof PX === 'undefined') return;
    const gt = G.t || 0;
    if (gt < this.gT - 0.5) { this.ds.length = 0; this.hat.length = 0; }
    const dt = this.gT < 0 ? 0 : Math.max(0, Math.min(0.25, gt - this.gT)); this.gT = gt; this.dt = dt;
    // chiêu Đỏ đang bùng → nhường (Đỏ luôn hoành tráng nhất)
    this.kNhuong = typeof DSG !== 'undefined' && DSG.bat && DSG.ds.some(e => e.t < 1.2 && !DSG.SIG[e.k].nho) ? 0.55 : 1;
    const g0 = ctx.globalAlpha, c0 = ctx.globalCompositeOperation;
    try {
      ctx.globalCompositeOperation = 'lighter';
      this.quet(ctx);
      let j = 0;
      for (let i = 0; i < this.ds.length; i++) {
        const e = this.ds[i]; e.t += dt; const S = this.SIG[e.k];
        if (e.t > S.dai(e)) continue;
        this.ds[j++] = e;
        if (e.t < 0) continue; // chờ lộ kết quả ghép
        if (S.bat && !e._b) { e._b = 1; S.bat.call(this, e, this.kBan(e.B)); }
        ctx.globalCompositeOperation = 'lighter';
        S.ve.call(this, ctx, e, this.kBan(e.B));
      }
      this.ds.length = j;
      this.capHat(dt); this.veHat(ctx);
    } finally { ctx.globalAlpha = g0; ctx.globalCompositeOperation = c0; }
  },
});

// nhãn kỹ năng → ụ (nhanU gọi với ụ KẾT QUẢ khi là kỹ năng khi ghép)
VSG.NHAN = [
  [/^VERDICT: SPEED/, 'nemesisToc'], [/^VERDICT/, 'nemesis'],
  [/^CLONE/, 'nhanban'], [/^CLAMP|^SPEED UP|^ALLY BOOST/, 'kepha'], [/SCRAMBLE|^PAIRED/, 'xaotron'],
  [/^COPY$/, 'saochep'], [/^PURIFY$/, 'aten'], [/^STAR BREAK$|^MERGE SURGE$/, 'hasao'], [/^ARCHIVE \d/, 'luutru'],
  [/^JAM|^ALLY: FREE SUMMON|^STATIC FIELD/, 'nhieusong'], [/^HATCH /, 'tienhoa'],
];
// ụ Vàng chỉ chạy khi ghép → hình riêng lúc ghép thật (kèm ụ Vàng ghép-kỹ-năng: Merge King, Twin Maker, Wild Link, Hero Foundry, Hex Saboteur)
VSG.GHEP = { tienhoa: 1, orbital: 1, loren: 1, luoicheo: 1, guongcong: 1, thanhdia: 1, congap: 1, vughep: 1, sinhdoi: 1, tudo: 1, xuonganh: 1, nguyenrua: 1 };

// =============================================== HÌNH TRÚNG (mỗi ụ 1 hình đặc trưng) ===============================================
// ctx đã 'lighter'. u = 0..1 trong đời hình. k = cỡ bàn.
VSG.H = {
  // NEMESIS — khoá mục tiêu: 4 góc ngắm khép vào quái + hình thoi đỏ thẫm, quầng đỏ-hồng
  nemesis: { dai: 0.4, ve(ctx, e, k, u) {
    const x = e.x, y = e.y, m = '#ff3a5a', d = (26 - 14 * this.e3(u / 0.5)) * k, al = this.a(u < 0.7 ? 1 : (1 - u) / 0.3);
    this.quang(ctx, x, y, 22 * k, m, u);
    for (let i = 0; i < 4; i++) { // góc ngắm hình chữ L, mở ra ngoài
      const sx = i % 2 ? 1 : -1, sy = i < 2 ? -1 : 1, cx = x + sx * d, cy = y + sy * d, l = 7 * k;
      PX.tia(ctx, cx, cy, cx - sx * l, cy, 2, m, al); PX.tia(ctx, cx, cy, cx, cy - sy * l, 2, m, al);
    }
    if (u > 0.35) this.dagiac(ctx, x, y, 7 * k, 4, 0, 1.6, '#ffd0d8', al);
  } },
  // BLOOD CIRCUIT — giọt máu bắn ra rồi bị hút NGƯỢC về ụ + vòng máu
  mauhut: { dai: 0.55, bat(e, k) {
    this.bung(4, (i, n) => { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.7; this.hat1({ k: 'giot', x: e.x, y: e.y, vx: Math.cos(a) * 120 * k, vy: Math.sin(a) * 120 * k, can: 6, keo: 5, tx: e.cx, ty: e.cy, song: 0.55, co: 9 * k, mau: '#e02050' }); });
  }, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 20 * k, '#d0204a', u);
    this.vg(ctx, e.x, e.y, (6 + 16 * this.e3(u)) * k, 3, '#ff5a7a', this.a(0.8 * (1 - u)));
  } },
  // PRISM THIEF — tia khúc xạ 4 màu toả quạt + kim cương trắng
  bienmau: { dai: 0.38, ve(ctx, e, k, u) {
    const x = e.x, y = e.y, M = ['#ff5a6a', '#ffd65b', '#6ab8ff', '#5be08a'], g0 = Math.atan2(y - e.cy, x - e.cx), al = this.a(1 - u);
    this.quang(ctx, x, y, 18 * k, '#ffffff', u, 0.8);
    for (let i = 0; i < 4; i++) { const a = g0 + (i - 1.5) * 0.42, L = (10 + 26 * this.e3(u / 0.6)) * k; PX.tia(ctx, x + Math.cos(a) * 5 * k, y + Math.sin(a) * 5 * k, x + Math.cos(a) * L, y + Math.sin(a) * L, 2.4, M[i], al * 0.95); }
    this.dagiac(ctx, x, y, (5 + 3 * u) * k, 4, u * 2, 1.4, '#ffffff', al);
  } },
  // QUANTUM CHOIR — 2 vòng sóng âm lệch nhịp + nốt sao bay lên (số nốt = Hoà âm)
  hopca: { dai: 0.5, bat(e, k) {
    const n = 1 + Math.min(3, (e.T.hop || 0)); this.bung(n, (i) => this.hat1({ k: 'sao', x: e.x + (i - (n - 1) / 2) * 8 * k, y: e.y, vx: (i - (n - 1) / 2) * 10, vy: -70 * k, can: 2, song: 0.5, co: 9 * k, mau: i % 2 ? '#ffd0ff' : '#e6a8ff', vg: 3 }));
  }, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 18 * k, '#d98cff', u);
    for (let i = 0; i < 2; i++) { const v = (u - i * 0.18) / 0.7; if (v > 0 && v < 1) this.vg(ctx, e.x, e.y, (6 + 22 * this.e3(v)) * k, 2, i ? '#ffd0ff' : '#e6a8ff', this.a(0.8 * (1 - v))); }
  } },
  // MERGE KING — vương miện vàng loé trên điểm trúng
  vughep: { dai: 0.42, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 20 * k, '#ffd65b', u);
    VSG.vuongMien(ctx, e.x, e.y - (10 + 8 * this.e3(u)) * k, 9 * k, '#ffd65b', this.a(u < 0.6 ? 1 : (1 - u) / 0.4));
  } },
  // PURIFIER — vòng thánh trắng-vàng + chữ thập sáng; quái trúng độc: tàn lục chuyển trắng
  aten: { dai: 0.42, bat(e, k) {
    const doc = e.E && (e.E.doc > 0 || e.E.docT > 0); if (!doc) return;
    this.bung(5, (i, n) => { const a = i / n * 6.283 + e.r(); this.hat1({ k: 'cham', x: e.x, y: e.y, vx: Math.cos(a) * 70 * k, vy: Math.sin(a) * 70 * k - 20, can: 3, song: 0.4, co: 8 * k, mau: i % 2 ? '#a6df52' : '#f6ffd8' }); });
  }, ve(ctx, e, k, u) {
    const al = this.a(1 - u);
    this.quang(ctx, e.x, e.y, 20 * k, '#fff0a0', u);
    this.vg(ctx, e.x, e.y, (8 + 12 * this.e3(u)) * k, 2, '#fff6c8', 0.85 * al);
    const L = (8 + 14 * this.e3(u / 0.5)) * k; PX.tia(ctx, e.x, e.y - L, e.x, e.y + L, 2, '#fff6c8', al); PX.tia(ctx, e.x - L * 0.7, e.y, e.x + L * 0.7, e.y, 2, '#fff6c8', al);
  } },
  // TWIN MAKER — 2 vòng song sinh lồng nhau (vàng + lam) xoay quanh nhau
  sinhdoi: { dai: 0.4, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 18 * k, '#ffe08a', u);
    const a = u * 3, d = 6 * k, al = this.a(0.85 * (1 - u)), r = (7 + 6 * this.e3(u)) * k;
    this.vg(ctx, e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, r, 2, '#ffd65b', al); this.vg(ctx, e.x - Math.cos(a) * d, e.y - Math.sin(a) * d, r, 2, '#8fd8ff', al);
  } },
  // COPYCAT — ảnh gương: 2 hình thoi đối xứng trượt ra + vòng tím nhạt
  saochep: { dai: 0.4, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 18 * k, '#c9a2ff', u);
    const d = (4 + 14 * this.e3(u)) * k, al = this.a(1 - u);
    this.dagiac(ctx, e.x - d, e.y, 5 * k, 4, 0, 1.4, '#e8d8ff', al); this.dagiac(ctx, e.x + d, e.y, 5 * k, 4, 0, 1.4, '#e8d8ff', al);
    this.vg(ctx, e.x, e.y, (6 + 8 * u) * k, 2, '#c9a2ff', 0.7 * al);
  } },
  // FUSION ARCHIVE — ấn vuông dữ liệu xoay + trang giấy bay
  luutru: { dai: 0.45, bat(e, k) { this.hat1({ k: 'la', x: e.x, y: e.y, vx: 18, vy: -50 * k, can: 2, song: 0.45, co: 9 * k, mau: '#e8f6ff', vg: 5 }); },
    ve(ctx, e, k, u) {
      this.quang(ctx, e.x, e.y, 18 * k, '#bfe4ff', u);
      const al = this.a(1 - u); this.dagiac(ctx, e.x, e.y, (7 + 7 * this.e3(u)) * k, 4, Math.PI / 4 + u * 1.6, 1.6, '#bfe4ff', al); this.dagiac(ctx, e.x, e.y, (4 + 3 * u) * k, 4, -u * 2, 1.2, '#ffffff', al);
    } },
  // HERO FOUNDRY — tia lửa rèn (than cam) bắn toả + vòng búa
  xuonganh: { dai: 0.4, bat(e, k) {
    this.bung(5, (i, n) => { const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.4; this.hat1({ k: 'than', x: e.x, y: e.y, vx: Math.cos(a) * 130 * k, vy: Math.sin(a) * 130 * k, g: 260 * k, song: 0.4, co: 7 * k, mau: i % 2 ? '#ffb070' : '#ff8748', vg: 6 }); });
  }, ve(ctx, e, k, u) { this.quang(ctx, e.x, e.y, 18 * k, '#ff8748', u); this.vg(ctx, e.x, e.y, (6 + 12 * this.e3(u)) * k, 3, '#ffc080', this.a(0.8 * (1 - u))); } },
  // HEX SABOTEUR — ấn ngũ giác nguyền (lam-tím debuff) xoay + hạt tối rơi
  nguyenrua: { dai: 0.45, bat(e, k) { this.bung(3, (i) => this.hat1({ k: 'cham', x: e.x + (i - 1) * 7 * k, y: e.y, vx: 0, vy: 26 * k, song: 0.45, co: 7 * k, mau: '#5a6ad0' })); },
    ve(ctx, e, k, u) {
      this.quang(ctx, e.x, e.y, 18 * k, '#759aef', u);
      const al = this.a(1 - u); this.dagiac(ctx, e.x, e.y, (11 - 3 * this.e3(u)) * k, 5, -Math.PI / 2 + u * 2.2, 1.5, '#9ab4ff', al);
    } },
  // WILD LINK — 4 chấm cầu vồng quay quanh điểm trúng (khớp nối mọi loại)
  tudo: { dai: 0.42, ve(ctx, e, k, u) {
    this.quang(ctx, e.x, e.y, 18 * k, '#ffffff', u, 0.7);
    const M = ['#ff6a8a', '#ffd65b', '#5be08a', '#6ab8ff'], al = this.a(1 - u), r = (6 + 10 * this.e3(u)) * k;
    for (let i = 0; i < 4; i++) { const a = u * 5 + i * Math.PI / 2; this.ch(ctx, e.x + Math.cos(a) * r, e.y + Math.sin(a) * r, 10 * k, M[i], al); }
  } },
  // ---------------- TÍM: hạt / ánh nhỏ ----------------
  nhanban: { dai: 0.3, ve(ctx, e, k, u) { const al = this.a(0.8 * (1 - u)), d = (3 + 9 * u) * k; PX.sao(ctx, e.x - d, e.y, 9 * k, '#d9a8ff', al, u * 3); PX.sao(ctx, e.x + d, e.y, 9 * k, '#d9a8ff', al, -u * 3); } },
  lienket: { dai: 0.3, ve(ctx, e, k, u) { const al = this.a(0.8 * (1 - u)), r = (5 + 3 * u) * k; this.vg(ctx, e.x - 4 * k, e.y, r, 2, '#c8a8ff', al); this.vg(ctx, e.x + 4 * k, e.y, r, 2, '#c8a8ff', al); } },
  kepha: { dai: 0.28, ve(ctx, e, k, u) { const al = this.a(0.85 * (1 - u)), L = (12 - 5 * this.e3(u)) * k; PX.tia(ctx, e.x - L, e.y - L, e.x - 3 * k, e.y - 3 * k, 2, '#c77dff', al); PX.tia(ctx, e.x + L, e.y + L, e.x + 3 * k, e.y + 3 * k, 2, '#c77dff', al); } },
  xaotron: { dai: 0.32, ve(ctx, e, k, u) { const al = this.a(0.8 * (1 - u)), r = (10 - 4 * u) * k; for (let i = 0; i < 3; i++) { const a = u * 7 + i * 2.094; this.ch(ctx, e.x + Math.cos(a) * r, e.y + Math.sin(a) * r, 8 * k, '#ff8ae0', al); } } },
  epxung: { dai: 0.26, ve(ctx, e, k, u) { const al = this.a(0.85 * (1 - u)); PX.duong(ctx, this.khuc(e.x - 9 * k, e.y - 6 * k, e.x + 9 * k, e.y + 6 * k, 3, 4 * k, e.seed), 1.4, '#ffb070', al); this.ch(ctx, e.x, e.y, 12 * k, '#ff9a3a', 0.5 * al); } },
  nhieusong: { dai: 0.3, ve(ctx, e, k, u) { const al = this.a(0.75 * (1 - u)), nh = Math.floor(e.t / 0.05); for (let i = 0; i < 3; i++) { const r = this.ngau(e.seed * 5 + nh * 3 + i), yy = e.y + (i - 1) * 6 * k, dx = (r() - 0.5) * 6 * k, L = (6 + 6 * r()) * k; PX.tia(ctx, e.x + dx - L, yy, e.x + dx + L, yy, 1.4, '#a89aff', al); } } },
};

// vương miện = đường gấp khúc 5 đỉnh (đoạn tia PNG) + 3 chấm ngọc
VSG.vuongMien = function (ctx, x, y, w, m, al) {
  if (!(al > 0.01)) return;
  const h = w * 0.9, P = [[x - w, y + h * 0.5], [x - w, y - h * 0.35], [x - w * 0.5, y + h * 0.05], [x, y - h * 0.6], [x + w * 0.5, y + h * 0.05], [x + w, y - h * 0.35], [x + w, y + h * 0.5], [x - w, y + h * 0.5]];
  PX.duong(ctx, P, 1.8, m, al);
  PX.cham(ctx, x, y - h * 0.6, w * 0.7, '#ffffff', al); PX.cham(ctx, x - w, y - h * 0.35, w * 0.5, m, al); PX.cham(ctx, x + w, y - h * 0.35, w * 0.5, m, al);
};

// =============================================== KHOẢNH KHẮC ĐẶC BIỆT (kỹ năng nổ / ghép) ===============================================
// Vàng: vòng ≤ 90 px + hình riêng + hạt; Tím: vòng nhỏ + hạt. Không chớp màn, không rung.
VSG.DB = {
  // VERDICT (mỗi 10 đòn): thanh kiếm sáng giáng xuống ụ + cán cân 2 đĩa — đỏ thẫm (ST) / bạc-lục (tốc, buff)
  nemesis: { dai: 0.75, mau: '#ff3a5a' }, nemesisToc: { dai: 0.75, mau: '#46dfa6' },
  nhanban: { dai: 0.55, mau: '#d9a8ff' }, kepha: { dai: 0.55, mau: '#c77dff' }, xaotron: { dai: 0.55, mau: '#ff8ae0' },
  saochep: { dai: 0.6, mau: '#c9a2ff' }, aten: { dai: 0.6, mau: '#fff0a0' }, hasao: { dai: 0.55, mau: '#ff7a4a' },
  luutru: { dai: 0.8, mau: '#bfe4ff' }, nhieusong: { dai: 0.6, mau: '#a89aff' }, tienhoa: { dai: 0.7, mau: '#a6df52' },
};

VSG.SIG = {
  h: { dai: (e) => VSG.H[e.id].dai, bat(e, k) { const H = this.H[e.id]; if (H.bat) H.bat.call(this, e, k * (e.T && e.T.bac === 'vang' ? 1.3 : 1.12)); }, ve(ctx, e, k) {
    this.xy(e); const u = Math.min(1, e.t / this.H[e.id].dai), vang = e.T && e.T.bac === 'vang';
    if (!vang) { if (!e.m) e.m = typeof TVX !== 'undefined' ? TVX.mau(e.T) : '#c77dff'; this.ch(ctx, e.x, e.y, 30 * k, e.m, this.a(0.3 * (1 - u))); } // Tím: ánh nhỏ màu nguyên tố
    this.H[e.id].ve.call(this, ctx, e, k * (vang ? 1.3 : 1.12), u);
  } }, // cỡ: Vàng ×1,3 (đọc được trên điện thoại, vẫn < Đỏ)
  // ---- kỹ năng nổ (nhãn) ----
  db: {
    dai: (e) => VSG.DB[e.id].dai,
    bat(e, k) {
      const m = this.DB[e.id].mau, vang = !/^(nhanban|kepha|xaotron|nhieusong)$/.test(e.id);
      this.bung(vang ? 10 : 6, (i, n) => { const a = i / n * 6.283 + e.r() * 0.5, v = (vang ? 120 : 80) * k * (0.7 + 0.5 * e.r()); this.hat1({ k: vang ? 'sao' : 'cham', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, can: 4, song: vang ? 0.6 : 0.45, co: (vang ? 10 : 8) * k, mau: i % 3 ? m : '#ffffff', vg: 4 }); });
      if (e.id === 'nhieusong' && /STATIC/.test(e.s)) e.Q = (G.quai || []).filter(Q => !Q.chet && Q.vao && G.ban[e.T.ban] && (Q.ban == null || Q.ban === e.T.ban)).slice(0, this.gon() ? 5 : 12);
      if (e.id === 'luutru') this.bung(8, (i, n) => { const a = i / n * 6.283; this.hat1({ k: 'la', x: e.x, y: e.y, vx: Math.cos(a) * 60 * k, vy: Math.sin(a) * 60 * k - 30, g: 40, song: 0.8, co: 10 * k, mau: '#e8f6ff', vg: 4 }); });
    },
    ve(ctx, e, k) {
      const D = this.DB[e.id], u = Math.min(1, e.t / D.dai), m = D.mau, x = e.x, y = e.y, al = this.a(1);
      const vang = !/^(nhanban|kepha|xaotron|nhieusong)$/.test(e.id), R = (vang ? 46 : 30) * k;
      // lớp chung: quầng + vòng xung
      this.ch(ctx, x, y, R * 1.6 * (0.7 + 0.4 * u), m, 0.34 * al * (1 - u));
      this.vg(ctx, x, y, R * (0.3 + 0.8 * this.e3(u)), 3, m, 0.85 * al * (1 - u));
      if (u < 0.25) this.ch(ctx, x, y, R * 0.8, '#ffffff', 0.5 * al * (1 - u / 0.25));
      switch (e.id) {
        case 'nemesis': case 'nemesisToc': { // kiếm sáng giáng + cán cân
          const v = this.e3(u / 0.25), yt = y - 90 * k * (1 - v), a2 = al * (u < 0.7 ? 1 : (1 - u) / 0.3);
          PX.tia(ctx, x, yt - 46 * k, x, yt, 5, m, a2); PX.tia(ctx, x, yt - 40 * k, x, yt - 2 * k, 1.8, '#ffffff', a2); PX.tia(ctx, x - 9 * k, yt - 34 * k, x + 9 * k, yt - 34 * k, 2.4, '#ffd65b', a2);
          if (u > 0.22) { const b = 22 * k, s = Math.sin((u - 0.22) * 12) * 3 * k * (1 - u); PX.tia(ctx, x - b, y - 30 * k + s, x + b, y - 30 * k - s, 1.6, '#ffd65b', a2 * 0.9); this.vg(ctx, x - b, y - 24 * k + s, 5 * k, 2, '#ffd65b', a2 * 0.8); this.vg(ctx, x + b, y - 24 * k - s, 5 * k, 2, '#ffd65b', a2 * 0.8); }
          break;
        }
        case 'aten': for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, r0 = R * 0.35, r1 = R * (0.5 + 0.7 * this.e3(u)); PX.tia(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, 2.2, '#fff6c8', al * (1 - u)); } break;
        case 'saochep': this.dagiac(ctx, x, y, R * (0.55 + 0.1 * u), 4, Math.PI / 4, 1.6, '#e8d8ff', al * (1 - u)); { const yy = y - R * 0.5 + R * u; PX.tia(ctx, x - R * 0.55, yy, x + R * 0.55, yy, 2, '#ffffff', al * (1 - u)); } break;
        case 'hasao': for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566, r = R * (0.3 + 0.6 * this.e3(u)); PX.sao(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 13 * k, '#ffb08a', al * (1 - u), a); } break;
        case 'luutru': for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + u * 1.5, r = R * 0.7; this.dagiac(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 5 * k, 4, a, 1.2, '#bfe4ff', al * (1 - u)); } break;
        case 'tienhoa': for (let i = 0; i < 6; i++) { const a = i * 1.047 + 0.3, r = R * (0.2 + 0.7 * this.e3(u)); PX.ve(ctx, this.anh('fx_la', '#c8f0a0'), x + Math.cos(a) * r, y + Math.sin(a) * r, 10 * k, 10 * k, a, al * (1 - u)); } break;
        case 'nhieusong': if (e.Q) { const nh = Math.floor(e.t / 0.06); for (const Q of e.Q) { if (Q.chet) continue; for (let i = 0; i < 2; i++) { const r = this.ngau(e.seed + nh * 7 + i + (Q.id || 0)), yy = Q.y + (i - 0.5) * 8 * k, L = (6 + 5 * r()) * k; PX.tia(ctx, Q.x - L, yy, Q.x + L, yy, 1.4, '#a89aff', 0.7 * al * (1 - u)); } } } break;
        case 'xaotron': for (let i = 0; i < 4; i++) { const a = u * 8 + i * Math.PI / 2, r = R * (0.7 - 0.4 * u); this.ch(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 10 * k, '#ff8ae0', al * (1 - u)); } break;
        case 'nhanban': this.vg(ctx, x + 8 * k * (1 - u), y, R * 0.45, 2, '#ffffff', al * 0.6 * (1 - u)); break;
        case 'kepha': for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2, r0 = R * (0.9 - 0.4 * this.e3(u)); PX.tia(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r0 * 0.6, y + Math.sin(a) * r0 * 0.6, 2, '#e0b0ff', al * (1 - u)); } break;
      }
    },
  },
  // ---- xung hỗ trợ: Pháo Đồng Bộ (tia đồng bộ tới mọi ụ cùng sao) / Súng Hạ Sao (sao vỡ bắn tới ụ kề) ----
  xung: {
    dai: () => 0.5,
    bat(e) {
      const B = e.B, T = e.T, sk = SKILLS[T.id];
      e.N = (typeof HOTRO !== 'undefined' ? HOTRO.oDich(T) : []).map(o => B.t[o]).filter(N => N && HOTRO.nhan(T, N) && (!sk.khop || sk.khop(T, N))).map(N => this.c(N)).filter(Boolean).slice(0, 8);
    },
    ve(ctx, e, k) {
      const u = Math.min(1, e.t / 0.5), dong = e.id === 'dongbo', m = dong ? '#ffe46b' : '#ff7a4a', al = this.a(1 - u);
      this.ch(ctx, e.x, e.y, 60 * k, m, 0.3 * al); this.vg(ctx, e.x, e.y, (12 + 22 * this.e3(u)) * k, 3, m, 0.85 * al);
      for (const n of e.N || []) {
        const v = Math.min(1, u / 0.45), px = e.x + (n.x - e.x) * this.e3(v), py = e.y + (n.y - e.y) * this.e3(v);
        if (dong) { PX.tia(ctx, e.x, e.y, px, py, 2.4, m, 0.7 * al); this.ch(ctx, px, py, 16 * k, '#ffffff', 0.8 * al); if (v >= 1) { this.vg(ctx, n.x, n.y, (10 + 14 * (u - 0.45) / 0.55) * k, 3, m, 0.9 * al); this.ch(ctx, n.x, n.y, 40 * k, m, 0.35 * al); } }
        else if (v < 1) { PX.sao(ctx, px, py, 16 * k, '#ffb08a', al, u * 6); this.ch(ctx, px, py, 18 * k, m, 0.6 * al); } else { this.ch(ctx, n.x, n.y, 40 * k, m, 0.35 * al); this.vg(ctx, n.x, n.y, (10 + 12 * (u - 0.45) / 0.55) * k, 2, m, 0.8 * al); }
      }
    },
  },
  // Blood Circuit nuốt ụ: xoáy máu hút vào ụ
  nuot: {
    dai: () => 0.7,
    bat(e, k) { this.bung(12, (i, n) => { const a = i / n * 6.283, d = 40 * k; this.hat1({ k: 'giot', x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, vx: 0, vy: 0, cx: e.x, cy: e.y, xoay: 5, thu: 2.2, song: 0.6, co: 9 * k, mau: i % 3 ? '#e02050' : '#ff8aa0' }); }); },
    ve(ctx, e, k) { const u = Math.min(1, e.t / 0.7), al = this.a(1 - u); this.ch(ctx, e.x, e.y, 70 * k * (1 - 0.4 * u), '#c01840', 0.35 * al); this.vg(ctx, e.x, e.y, 34 * k * (1 - 0.6 * this.e3(u)), 3, '#ff5a7a', 0.8 * al); },
  },
  // Quantum Choir thêm Hoà âm: 3 vòng sóng âm + nốt bay
  hoa: {
    dai: () => 0.7,
    bat(e, k) { this.bung(4 + e.n, (i) => this.hat1({ k: 'sao', x: e.x + (e.r() - 0.5) * 30 * k, y: e.y, vx: 0, vy: -60 * k, song: 0.7, co: 10 * k, mau: i % 2 ? '#ffd0ff' : '#e6a8ff', vg: 3 })); },
    ve(ctx, e, k) { for (let i = 0; i < 3; i++) { const v = (e.t - i * 0.12) / 0.5; if (v > 0 && v < 1) this.vg(ctx, e.x, e.y, (14 + 36 * this.e3(v)) * k, 2, i % 2 ? '#ffd0ff' : '#d98cff', this.a(0.8 * (1 - v))); } },
  },
  // ---- GHÉP thật có ụ Vàng chỉ-chạy-khi-ghép: vòng phù văn vàng + hình riêng ----
  gh: {
    dai: () => 0.9,
    bat(e, k) {
      const G2 = this.GH[e.id]; if (G2 && G2.bat) G2.bat.call(this, e, k);
    },
    ve(ctx, e, k) {
      const u = Math.min(1, e.t / 0.9), x = e.x, y = e.y, G2 = this.GH[e.id], m = G2 ? G2.mau : '#ffd65b', al = this.a(u < 0.75 ? 1 : (1 - u) / 0.25);
      this.ch(ctx, x, y, 84 * k * (0.7 + 0.3 * u), m, 0.3 * al);
      this.vg(ctx, x, y, (20 + 34 * this.e3(u / 0.6)) * k, 3, m, 0.8 * al * (1 - u));
      if (G2 && G2.ve) G2.ve.call(this, ctx, e, k, u, al, m);
    },
  },
};

// hình riêng lúc ghép (ụ Vàng chỉ chạy khi ghép + ụ Vàng có kỹ năng khi ghép)
VSG.GH = {
  // Evolver: vỏ trứng vỡ — 6 mảnh lá xanh lục toả + vòng
  tienhoa: { mau: '#a6df52', bat(e, k) { this.bung(8, (i, n) => { const a = i / n * 6.283 + 0.2; this.hat1({ k: 'la', x: e.x, y: e.y, vx: Math.cos(a) * 110 * k, vy: Math.sin(a) * 110 * k - 30, g: 200 * k, song: 0.7, co: 11 * k, mau: i % 2 ? '#d8f8b0' : '#a6df52', vg: 6 }); }); } },
  // Orbital: 3 vệ tinh bay quỹ đạo elip quanh ô + vòng quỹ đạo
  orbital: { mau: '#8fd8ff', ve(ctx, e, k, u, al) { const R = 30 * k; for (let i = 0; i < 3; i++) { const a = u * 7 + i * 2.094; PX.sao(ctx, e.x + Math.cos(a) * R, e.y + Math.sin(a) * R * 0.55, 12 * k, '#ffffff', al, a); } } },
  // Twin Anvil: tia lửa rèn bắn lên + 2 vòng búa
  loren: { mau: '#ff8748', bat(e, k) { this.bung(12, (i, n) => { const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.6; this.hat1({ k: 'than', x: e.x, y: e.y, vx: Math.cos(a) * 170 * k, vy: Math.sin(a) * 170 * k, g: 320 * k, song: 0.7, co: 8 * k, mau: i % 2 ? '#ffd0a0' : '#ff8748', vg: 6 }); }); } },
  // Resonance Grid: tia chéo tới 4 ô chéo + vòng ở mỗi ô
  luoicheo: { mau: '#ffd65b', ve(ctx, e, k, u, al, m) { const B = e.B, c = e.o % 5, h = (e.o / 5) | 0; for (const [dc, dh] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cc = c + dc, hh = h + dh; if (cc < 0 || cc > 4 || hh < 0 || hh > 2) continue; const n = B.o[hh * 5 + cc]; if (!n) continue; const v = this.e3(u / 0.4); PX.tia(ctx, e.x, e.y, e.x + (n.x - e.x) * v, e.y + (n.y - e.y) * v, 1.8, m, 0.6 * al); if (u > 0.35) this.vg(ctx, n.x, n.y, 14 * k, 2, m, 0.7 * al * (1 - u)); } } },
  // Mirror Gate: 2 tấm gương (hình thoi) mở ra 2 bên + vệt quét
  guongcong: { mau: '#a8e8ff', ve(ctx, e, k, u, al) { const d = 26 * k * this.e3(u / 0.5); this.dagiac(ctx, e.x - d, e.y, 14 * k, 4, 0, 1.8, '#e0f8ff', al); this.dagiac(ctx, e.x + d, e.y, 14 * k, 4, 0, 1.8, '#e0f8ff', al); const yy = e.y - 22 * k + 44 * k * u; PX.tia(ctx, e.x - 18 * k, yy, e.x + 18 * k, yy, 2, '#ffffff', 0.6 * al); } },
  // Sanctum: cột sáng thánh dựng lên + chữ thập
  thanhdia: { mau: '#fff0a0', ve(ctx, e, k, u, al) { const h = 70 * k * this.e3(u / 0.4); PX.tia(ctx, e.x, e.y, e.x, e.y - h, 9, '#fff0a0', 0.5 * al); PX.tia(ctx, e.x, e.y, e.x, e.y - h, 2.4, '#ffffff', 0.8 * al); PX.tia(ctx, e.x - 12 * k, e.y - h * 0.7, e.x + 12 * k, e.y - h * 0.7, 2, '#ffffff', 0.7 * al); } },
  // Hatchery Gate: cổng xoáy (2 vòng ngược chiều co lại) + hạt hút vào
  congap: { mau: '#ffb43a', bat(e, k) { this.bung(10, (i, n) => { const a = i / n * 6.283, d = 44 * k; this.hat1({ k: 'cham', x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, vx: 0, vy: 0, cx: e.x, cy: e.y, xoay: 4, thu: 1.8, song: 0.7, co: 8 * k, mau: '#ffd08a' }); }); },
    ve(ctx, e, k, u, al) { for (let i = 0; i < 2; i++) { const a = (i ? -1 : 1) * u * 5; for (let j = 0; j < 6; j++) { const g = a + j * 1.047, r = (i ? 18 : 26) * k * (1 - 0.3 * u); this.ch(ctx, e.x + Math.cos(g) * r, e.y + Math.sin(g) * r, 8 * k, i ? '#fff0c0' : '#ffb43a', 0.8 * al); } } } },
  // Merge King: vương miện to bật lên trên ô + tia vàng
  vughep: { mau: '#ffd65b', ve(ctx, e, k, u, al) { const v = this.e3(u / 0.35); VSG.vuongMien(ctx, e.x, e.y - 30 * k * v, 16 * k * (0.6 + 0.4 * v), '#ffd65b', al); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35, r0 = 18 * k, r1 = (26 + 26 * v) * k; PX.tia(ctx, e.x + Math.cos(a) * r0, e.y - 30 * k * v + Math.sin(a) * r0, e.x + Math.cos(a) * r1, e.y - 30 * k * v + Math.sin(a) * r1, 1.6, '#fff0a0', 0.6 * al * (1 - u)); } } },
  // Twin Maker: 2 vòng song sinh tách đôi
  sinhdoi: { mau: '#ffe08a', ve(ctx, e, k, u, al) { const d = 20 * k * this.e3(u / 0.5); this.vg(ctx, e.x - d, e.y, 16 * k, 3, '#ffd65b', al * (1 - u)); this.vg(ctx, e.x + d, e.y, 16 * k, 3, '#8fd8ff', al * (1 - u)); } },
  // Wild Link: cung cầu vồng nối 2 ô nguyên liệu
  tudo: { mau: '#ffffff', ve(ctx, e, k, u, al) { const M = ['#ff6a8a', '#ffd65b', '#5be08a', '#6ab8ff'], n = 10; for (let i = 0; i <= n; i++) { const v = i / n, x = e.x0 + (e.x - e.x0) * v, y = e.y0 + (e.y - e.y0) * v - Math.sin(v * Math.PI) * 30 * k; if (v <= this.e3(u / 0.4) + 0.01) this.ch(ctx, x, y, 12 * k, M[i % 4], 0.85 * al * (1 - u)); } } },
  // Hero Foundry: tia lửa rèn + cột vàng
  xuonganh: { mau: '#ff8748', bat(e, k) { VSG.GH.loren.bat.call(this, e, k); }, ve(ctx, e, k, u, al) { const h = 54 * k * this.e3(u / 0.4); PX.tia(ctx, e.x, e.y, e.x, e.y - h, 7, '#ffd65b', 0.5 * al); } },
  // Hex Saboteur: ngũ giác nguyền to xoay
  nguyenrua: { mau: '#759aef', ve(ctx, e, k, u, al) { this.dagiac(ctx, e.x, e.y, 28 * k * (1 - 0.3 * u), 5, -Math.PI / 2 + u * 3, 2, '#9ab4ff', al * (1 - u)); } },
};

// =============================================== HÀO QUANG THƯỜNG TRỰC (mờ 25–40 %) ===============================================
VSG.AURA = {
  // Pháo Đồng Bộ: 2 chấm vàng quay quanh ụ (nhịp đồng bộ)
  dongbo(ctx, T, B, c, k) { const n = Math.min(4, T.dong || 0); for (let i = 0; i < n; i++) { const a = G.t * 2.2 + i * 6.283 / n; this.ch(ctx, c.x + Math.cos(a) * 20 * k, c.y + Math.sin(a) * 20 * k, 9 * k, '#ffe46b', this.a(0.35)); } },
  // Chuỗi Liên Kết: mắt xích sáng chạy dọc nối các ụ cùng loại kề nhau (chỉ vẽ 1 lần mỗi cặp: ô nhỏ → ô lớn)
  lienket(ctx, T, B, c, k) {
    if (!((T.chuoi || 1) > 1) || typeof keCan !== 'function') return;
    for (const N of keCan(B, T.o)) {
      if (!N || N.id !== T.id || N.o < T.o || (N.st && N.st.da)) continue;
      const n = this.c(N); for (let i = 0; i < 3; i++) { const v = (G.t * 0.8 + i / 3) % 1; this.vg(ctx, c.x + (n.x - c.x) * v, c.y + (n.y - c.y) * v, 4 * k, 2, '#c8a8ff', this.a(0.4 * Math.sin(v * Math.PI))); }
    }
  },
  // Hợp Xướng: số nốt bay vòng = số Hoà âm
  hopca(ctx, T, B, c, k) { const n = Math.min(4, T.hop || 0); for (let i = 0; i < n; i++) { const a = -G.t * 1.6 + i * 6.283 / n; PX.sao(ctx, c.x + Math.cos(a) * 22 * k, c.y + Math.sin(a) * 18 * k, 8 * k, '#e6a8ff', this.a(0.4), a); } },
  // ụ được Ép Xung: tia điện cam nhỏ chớp ngắn quanh ụ (mỗi ~1,1 s, lệch pha theo ô)
  epxungBuff(ctx, T, B, c, k) {
    const ph = (G.t / 1.1 + T.o * 0.37) % 1; if (ph > 0.14 || !c) return;
    const nh = Math.floor(G.t / 1.1 + T.o * 0.37), r = this.ngau(nh * 31 + T.o), a = r() * 6.283, R = 18 * k;
    PX.duong(ctx, this.khuc(c.x + Math.cos(a) * R, c.y + Math.sin(a) * R, c.x + Math.cos(a + 1.2) * R, c.y + Math.sin(a + 1.2) * R, 3, 4 * k, nh), 1.3, '#ffb070', this.a(0.7 * (1 - ph / 0.14)));
  },
  // ô ANH HÙNG (Hero Foundry): khung sáng vàng-cam mờ + tia lửa nhỏ bốc lên
  hero(ctx, B, h, k) {
    const c = B.o[h.o]; if (!c) return; const S = Math.min(B.cw, B.ch) * 0.5;
    this.ch(ctx, c.x, c.y, S * 2.4, '#ff8748', this.a(0.22 + 0.06 * Math.sin(G.t * 4)));
    for (let i = 0; i < 3; i++) { const ph = (G.t * 0.8 + i / 3) % 1; PX.ve(ctx, this.anh('fx_than', '#ffb070'), c.x + (i - 1) * S * 0.6, c.y + S * 0.6 - ph * S * 1.6, 7 * k, 6 * k, -Math.PI / 2, this.a(0.5 * (1 - ph))); }
  },
};

// ---------- gắn móc ----------
if (typeof TVX !== 'undefined') { const tr = TVX.trung; TVX.trung = function (T, E, crit) { try { VSG.trung(T, E, crit); } catch (e) { VSG.loi = String(e && e.stack || e).slice(0, 300); } return tr.apply(this, arguments); }; }
if (typeof nhanU === 'function') { const n0 = nhanU; nhanU = function (T, s) { try { VSG.nhan(T, s); } catch (e) { VSG.loi = String(e && e.stack || e).slice(0, 300); } return n0.apply(this, arguments); }; } // eslint-disable-line no-global-assign
if (typeof VX !== 'undefined' && VX.ghep) { const g0 = VX.ghep; VX.ghep = function (B, a, b, ra) { const r = g0.apply(this, arguments); VSG._nGhep = (VSG._nGhep || 0) + 1; try { VSG.ghep(B, a, b, ra); } catch (e) { VSG.loi = String(e && e.stack || e).slice(0, 300); } return r; }; }
// GHÉP ĐẶC BIỆT (ghepDB: Twin Anvil + Anvil, Merge King…) không qua VX.ghep → bọc ghep() CHỈ ĐỂ NHÌN kết quả (gọi y nguyên, trả y nguyên)
if (typeof ghep === 'function') {
  const gh0 = ghep;
  ghep = function (B, a, b) { // eslint-disable-line no-global-assign
    const n0 = VSG._nGhep, ia = a && { id: a.id, o: a.o }, ib = b && { id: b.id, o: b.o }, r = gh0.apply(this, arguments);
    try { if (r && VSG._nGhep === n0 && ia && ib && (VSG.GHEP[ia.id] || VSG.GHEP[ib.id])) { const B2 = G.ban[r.ban] || B; VSG.ghep(B2, ia, ib, null); } } catch (e) { VSG.loi = String(e && e.stack || e).slice(0, 300); }
    return r;
  };
}
// vẽ NGAY TRƯỚC chữ ký Đỏ (cùng lớp TRÊN của REN.veFx) → Đỏ luôn nằm trên
if (typeof DSG !== 'undefined') { const dv = DSG.ve; DSG.ve = function (ctx) { try { VSG.ve(ctx); } catch (e) { VSG.loi = String(e && e.stack || e).slice(0, 300); if (G && G.debug) console.warn('[vangsig]', e); } return dv.apply(this, arguments); }; }
