// TURRET MERGE — KHOẢNH KHẮC ĐẶC BIỆT (signature moment) của 10 ụ Huyền thoại (vàng) / Cổ đại (đỏ)
// Theo docs/demo-hop-tuong/thap-art/TU-VAN-CHIEU-DAC-BIET.txt (top 10). MỌI HÌNH là dải khung PNG ChatGPT (assets/sig_<tờ>_<nhóm>.png,
// cắt bởi tools/thap-cat-sig.py, cỡ khung ở js/sig-meta.js). Code CHỈ đặt vị trí / xoay / phóng / mờ / lật ảnh (QUY-TAC-HINH.md mục 3):
// không path, không gradient, không arc, không stroke.
// Không đổi luật chơi: chỉ QUAN SÁT hiệu ứng trên sân (G.hu) và bọc vài hàm kỹ năng để biết đúng lúc + đúng kết quả.
// Mỗi khoảnh khắc ≤ ~1.2 s phủ lớn; lặp lại trên cùng ụ trong 15 s → bản NGẮN. Ảnh tải lười theo bộ bài đang có trên bàn.
'use strict';

const SIG = {
  ds: [], t: 0, daThay: new WeakSet(), lanCuoi: new WeakMap(), daNap: new Set(), _tNap: -9,
  MA: { marionette: 'l22', ngaithoigian: 'm05', blackhole: 'm01', ronglua: 'm09', leviathan: 'm07', hydra: 'l14', pandora: 'l16', hasao: 'l06', vughep: 'l04', chuato: 'm06' },
  // Pandora: phép → hàng hiệu ứng / ô biểu tượng trên tờ L16 (kiếm đỏ · khiên · thập xanh · sét · xoáy tím · pha lê vàng)
  PDR: { bom: ['o_atk', 0], khien: ['o_def', 1], mana: ['o_heal', 2], cuong: ['o_zap', 3], dong: ['o_void', 4], sao: ['o_gold', 5] },

  ten(id, g) { return 'sig_' + this.MA[id] + '_' + g; },
  // Leviathan TIDAL BREATH — ảnh ChatGPT mới (null = chưa có → dùng ảnh tạm có sẵn; không gọi tải ảnh chưa tồn tại)
  LEV: { rong: null, bang: null },
  // tải lười: chỉ dải của ụ có trong bộ bài trên bàn (kiểm 1 lần/giây)
  nap() {
    if (this.t - this._tNap < 1) return; this._tNap = this.t;
    for (const B of G.ban) for (const id of (B.deck || []).concat(B.t.filter(Boolean).map(T => T.id))) {
      const ma = this.MA[id]; if (!ma || this.daNap.has(id)) continue;
      this.daNap.add(id);
      for (const k in SIG_META) if (k.startsWith('sig_' + ma + '_')) REN.img(k);
    }
  },
  san(id, g) { const a = REN.anh[this.ten(id, g)]; return !!(a && (a._cv || (a.complete && a.naturalWidth))); },
  // vẽ khung f của dải `ten`: tâm neo (x,y), bề rộng w (px logic); o: g xoay, a mờ, add cộng sáng, lat lật ngang, ax/ay neo, h cao riêng
  k(ctx, ten, f, x, y, w, o) {
    const m = SIG_META[ten], a = m && REN.img(ten); if (!a || !(w > 0.5)) return false;
    o = o || {};
    const n = m[0], i = Math.max(0, Math.min(n - 1, Math.floor(f))), h = o.h || w * m[2] / m[1];
    const al = o.a == null ? 1 : o.a; if (al <= 0.01) return true;
    ctx.save(); ctx.translate(x, y); if (o.g) ctx.rotate(o.g); if (o.lat) ctx.scale(-1, 1);
    ctx.globalAlpha = Math.min(1, al); if (o.add) ctx.globalCompositeOperation = 'lighter';
    const c = this.khung(ten, a, m, i, ctx, w, h);
    if (c) ctx.drawImage(c, -w * (o.ax == null ? 0.5 : o.ax), -h * (o.ay == null ? 0.5 : o.ay), w, h);
    else ctx.drawImage(a, i * m[1], 0, m[1], m[2], -w * (o.ax == null ? 0.5 : o.ax), -h * (o.ay == null ? 0.5 : o.ay), w, h);
    ctx.restore(); return true;
  },
  // khung đã thu nhỏ sẵn đúng cỡ điểm ảnh thiết bị (bậc 1/8 quãng tám, bộ đệm chung REN) → mỗi khung vẽ ~1:1, rẻ trên điện thoại
  khung(ten, a, m, i, ctx, w, h) {
    const tf = ctx.getTransform(), k = Math.hypot(tf.a, tf.b), dw = w * k, dh = h * k;
    if (dw >= m[1] * 0.92 && dh >= m[2] * 0.92) return null; // gần cỡ gốc: vẽ thẳng từ dải
    const q = Math.min(m[1], Math.max(4, Math.round(Math.pow(2, Math.ceil(Math.log2(dw) * 8) / 8))));
    const key = 'sig|' + ten + '|' + i + '|' + q;
    let c = REN.cGet(key); if (c) return c;
    const qh = Math.max(2, Math.round(q * m[2] / m[1]));
    c = document.createElement('canvas'); c.width = q; c.height = qh;
    REN.veNho(REN.c2d(c), a, i * m[1], 0, m[1], m[2], 0, 0, q, qh);
    return REN.cSet(key, c);
  },
  // khung theo thời gian: chạy n khung trong [t0, t1); ngoài khoảng → -1
  f(t, t0, t1, n) { return t < t0 || t >= t1 ? -1 : Math.min(n - 1, Math.floor((t - t0) / (t1 - t0) * n)); },
  n(id, g) { const m = SIG_META[this.ten(id, g)]; return m ? m[0] : 1; },
  mo(t, t0, t1, vao, ra) { return t < t0 || t > t1 ? 0 : Math.min(1, (t - t0) / (vao || 0.06), (t1 - t) / (ra || 0.12)); },
  eo: (u) => { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u) * (1 - u); },
  // lặp lại trên cùng ụ trong 15 s → bản ngắn
  ngan(T) { if (!T) return false; const l = this.lanCuoi.get(T); this.lanCuoi.set(T, this.t); return l != null && this.t - l < 15; },
  them(k, song, d) { if (this.ds.length > 24) this.ds.shift(); const m = Object.assign({ k, t: 0, song }, d); this.ds.push(m); return m; },
  o(T) { const B = T && G.ban[T.ban]; return B && B.o[T.o]; },

  // ---------------- mỗi khung ----------------
  cap(dt) {
    const k = G.tocDo || 1; dt = (dt || 0) * (k > 1 ? 1 + 0.12 * (k - 1) : 1);
    this.t += dt;
    if (!G.ban.length) { this.ds.length = 0; return; }
    this.nap();
    if (!G.hu.some(o => o.k === 'sigDuoi')) G.hu.push({ k: 'sigDuoi', t: 0, song: 1e12 });
    // phát hiện hiệu ứng kỹ năng vừa sinh
    for (const o of G.hu) {
      if (this.daThay.has(o)) continue;
      const P = this.PHAT[o.k]; if (!P) continue;
      this.daThay.add(o); try { P.call(this, o); } catch (e) { console.error(e); }
    }
    for (let i = this.ds.length - 1; i >= 0; i--) {
      const m = this.ds[i]; m.t += dt;
      const K = this.K[m.k]; if (K.cap && K.cap.call(this, m, dt) === true) { this.ds.splice(i, 1); continue; }
      if (m.t >= m.song) this.ds.splice(i, 1);
    }
  },
  veTren(ctx, R) { for (const m of this.ds) { const K = this.K[m.k]; if (K.ve) try { K.ve.call(this, ctx, m, R); } catch (e) { console.error(e); } } },
  veDuoi(ctx, R) { for (const m of this.ds) { const K = this.K[m.k]; if (K.duoi) try { K.duoi.call(this, ctx, m, R); } catch (e) { console.error(e); } } },
  conHu(o) { return G.hu.includes(o); },
  // các góc rẽ của 1 làn: đỉnh, hướng vào gA, góc quay d (+ rẽ phải / − rẽ trái trên màn y-xuống), s tại đỉnh
  gocRe(P) {
    if (P._gocRe) return P._gocRe;
    const ra = [];
    for (let i = 1; i < P.segs.length; i++) {
      const q = P.segs[i - 1], g = P.segs[i], gA = Math.atan2(q.dy, q.dx);
      let d = Math.atan2(g.dy, g.dx) - gA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      if (Math.abs(d) > 0.01) ra.push({ x: g.x0, y: g.y0, gA, d, sJ: g.s0 });
    }
    return (P._gocRe = ra);
  },
  // ảnh khúc cua sig_m07_corner: trong ảnh dòng nước đi từ trái sang (hướng 0) rồi rẽ xuống (+90°); đỉnh tâm dòng ≈ (180, 46)/240×187
  cua(ctx, q, f, a) { // rẽ trái = lật dọc = lật ngang + xoay thêm 180°
    return this.k(ctx, 'sig_m07_corner', f, q.x, q.y, 240 * 0.29, { g: q.gA + (q.d < 0 ? Math.PI : 0), lat: q.d < 0, ax: 180 / 240, ay: 46 / 187, a });
  },
};

// ===================================================== PHÁT HIỆN (đúng lúc kỹ năng nổ ra) =====================================================
SIG.PHAT = {
  roi(o) { // Marionette gắn dây rối
    const phu = this.ds.some(m => m.k === 'roi' && m.o.T === o.T && m.t < 1); // 7★ con rối thứ 2: tay nhỏ hơn
    this.them('roi', 1e9, { o, E: o.E, ngan: this.ngan(o.T) && !phu, phu });
  },
  rewind(o) { this.them('rewind', 1.25, { o, T: o.T, ngan: this.ngan(o.T), keo: o.keo.slice(0, 6).map(q => ({ E: q.E, s0: q.s0, s1: q.s1, p: q.E.p })) }); },
  hoden(o) { this.them('hoden', 1e9, { o, x: o.x, y: o.y, r: o.r, ngan: this.ngan(o.T) }); },
  rongBo(o) { const c = this.o(o.T); this.them('rong', 1e9, { o, T: o.T, cx: c.x, cy: c.y, ngan: this.ngan(o.T) }); },
  thoThuy(o) { this.them('tho', 1e9, { o, T: o.T, p: o.p, ngan: this.ngan(o.T) }); },
  hydraTia(o) {
    const T = G.dangBan && G.dangBan.id === 'hydra' ? G.dangBan : null;
    // quái đầu tiên trên đường tia (chỉ để đặt ảnh trúng)
    const dx = o.x1 - o.x0, dy = o.y1 - o.y0, L2 = dx * dx + dy * dy || 1; let E = null, best = 9;
    for (const Q of G.quai) { if (Q.chet) continue; const u = ((Q.x - o.x0) * dx + (Q.y - o.y0) * dy) / L2; if (u < 0 || u > best) continue; const d = Math.hypot(o.x0 + dx * u - Q.x, o.y0 + dy * u - Q.y); if (d < 24) { best = u; E = Q; } }
    const c = T ? this.o(T) : { x: o.x0, y: o.y0 };
    this.them('hydra7', 0.95, { cx: c.x, cy: c.y, x0: o.x0, y0: o.y0, g: Math.atan2(dy, dx), hx: E ? E.x : o.x0 + dx * 0.3, hy: E ? E.y : o.y0 + dy * 0.3, ngan: this.ngan(T) });
  },
  pandora(o) { this.them('pandora', 1.55, { o, c: o.B.o[o.o], chon: o.chon.slice(), ngan: this.ngan(o.T) }); },
  ongLao(o) {
    const T = o.T;
    let m = this.ds.find(q => q.k === 'ong' && q.T === T && q.t < 0.3);
    if (!m) { const c = this.o(T); m = this.them('ong', 1e9, { T, cx: c.x, cy: c.y, ds: [], no: [], E: o.E, ngan: this.ngan(T), xong: 0 }); }
    m.ds.push({ o, x: o.x, y: o.y, g: 0, het: false });
  },
};

// ===================================================== VẼ TỪNG KHOẢNH KHẮC =====================================================
SIG.K = {
  // ---------- L22 MARIONETTE: sân khấu rối → bàn tay khổng lồ → 4 dây móc → nhấc bổng & kéo lùi → nắm tay → nổ đồ chơi ----------
  roi: {
    cap(m, dt) {
      const o = m.o, E = m.E;
      if (!m.no && (!this.conHu(o) || E.chet)) { m.no = true; m.tNo = m.t; m.nx = E.x; m.ny = E.y - (m.nhac || 0); FX.lac(2); }
      // nhấc bổng: 0.6 → 0.9 s lên 13 px (chỉ hình — vị trí thật không đổi)
      m.nhac = m.no ? 0 : 13 * this.eo((m.t - (m.ngan ? 0.3 : 0.6)) / 0.3);
      return m.no && m.t - m.tNo > 0.62;
    },
    duoi(ctx, m) { // bóng/neo trên đường dưới con rối đang treo
      if (m.no || !(m.nhac > 1)) return; const E = m.E;
      this.k(ctx, 'sig_l22_shadow', (this.t * 6) % 3, E.x, E.y + m.nhac + 4, 30, { a: 0.75 * Math.min(1, m.nhac / 8) });
    },
    ve(ctx, m) {
      const E = m.E, t = m.t, s = m.ngan ? 0.5 : 1, kt = m.phu ? 0.72 : 1;
      if (!m.no) {
        const x = E.x, y = E.y, hy = y - ((E.d.co || 40) * 0.5 + 40) * kt, hx = Math.max(48, Math.min(W - 48, x)); // tay luôn nằm trong màn
        // sân khấu rối nhỏ (bản đầy đủ): 0–0.45 s
        if (!m.ngan && !m.phu && t < 0.45) this.k(ctx, 'sig_l22_stage', this.f(t, 0, 0.3, 5) < 0 ? 4 : this.f(t, 0, 0.3, 5), x, y - 34, 50 * (0.6 + 0.4 * this.eo(t / 0.15)), { a: this.mo(t, 0, 0.45, 0.06, 0.15) });
        // bàn tay: hiện 0.2 s (ngắn: 0), mở ngón 0.2–0.43, giữ hơi khum khi kéo; sau 1.15 s mờ bớt cho thoáng bàn
        const t0 = 0.2 * s, tv = t - t0;
        if (tv > 0) {
          const nH = this.n('marionette', 'hand');
          const fr = tv < 0.23 * s ? tv / (0.23 * s) * (nH - 1) : nH - 1 - Math.min(2, (tv - 0.23 * s) * 10) + Math.sin(this.t * 7) * 0.4;
          const sc = 0.4 + 0.7 * this.eo(tv / (0.25 * s)), al = Math.min(1, tv / 0.08) * (t > 1.15 ? Math.max(0.4, 1 - (t - 1.15) * 1.5) : 1);
          // dây móc: búng xuống 0.43–0.61 s, rung nhẹ khi kéo (khung 4↔5); dài theo khoảng tay→đầu quái (kẹp để móc không bị giãn)
          const td = t - 0.43 * s;
          if (td > 0) {
            const dai = Math.min(1, td / (0.18 * s)), dx = x - hx, dy = (y - 8) - (hy + 14), L = Math.max(14, Math.min(60, Math.hypot(dx, dy))) * dai;
            const fs = td < 0.18 * s ? Math.floor(dai * 3.99) : 4 + (Math.floor(this.t * 10) % 2);
            this.k(ctx, 'sig_l22_string', fs, hx + Math.sin(this.t * 9) * 0.8, hy + 14, 40 * kt, { h: L / 0.8, ay: 0.12, a: al, g: -Math.atan2(dx, dy) });
          }
          this.k(ctx, 'sig_l22_hand', fr, hx + Math.sin(this.t * 3) * 1.5, hy, 100 * kt * sc, { g: -0.18 + Math.sin(this.t * 2.6) * 0.06, a: al });
        }
      } else { // nắm tay lại (0.22 s) + nổ rối đồ chơi (0.55 s)
        const u = m.t - m.tNo, nH = this.n('marionette', 'hand');
        if (u < 0.3) this.k(ctx, 'sig_l22_hand', (nH - 1) * (1 - Math.min(1, u / 0.22)), Math.max(48, Math.min(W - 48, m.nx)), m.ny - 52 * kt, 96 * kt, { g: -0.18, a: 1 - Math.max(0, (u - 0.22) / 0.08) });
        const fe = this.f(u, 0.06, 0.62, this.n('marionette', 'toy'));
        if (fe >= 0) this.k(ctx, 'sig_l22_toy', fe, m.nx, m.ny - 6, 112 * kt);
      }
    },
  },

  // ---------- M05 CHRONO THRONE: ngai đồng hồ trồi lên → kim quay ngược → bóng ma quái tua lùi → đồng hồ cát vỡ ----------
  rewind: {
    ve(ctx, m) {
      const c = this.o(m.T); if (!c) return;
      const t = m.t, x = c.x, y = c.y - 54, ng = m.ngan;
      const a1 = ng ? -1 : 0.42, a2 = ng ? 0.4 : 0.85;
      if (!ng && t < 0.46) { const u = this.eo(t / 0.28); this.k(ctx, 'sig_m05_throne', this.f(t, 0, 0.42, 8) < 0 ? 7 : this.f(t, 0, 0.42, 8), x, y + 14 * (1 - u), 124 * (0.65 + 0.35 * u), { a: this.mo(t, 0, 0.46, 0.06, 0.06) }); }
      if (t >= Math.max(0, a1) && t < a2 + 0.04) { const n = this.n('ngaithoigian', 'hands'), fi = this.f(t, Math.max(0, a1), a2, n); this.k(ctx, 'sig_m05_hands', n - 1 - Math.max(0, fi), x, y, 108, { a: this.mo(t, Math.max(0, a1), a2 + 0.04, 0.04, 0.05) }); } // phát NGƯỢC: kim quay lùi
      const fh = this.f(t, a2, a2 + 0.38, 6); if (fh >= 0) this.k(ctx, 'sig_m05_hourglass', fh, x, y, 108);
      // bóng ma từng quái: 2 ảnh dọc quãng tua lùi (từ chỗ cũ → chỗ mới), chạy theo khung "echo"
      const ne = this.n('ngaithoigian', 'echo');
      for (const q of m.keo) {
        const P = G.duong[q.p]; if (!P || q.E.chet) continue;
        for (let j = 0; j < 2; j++) {
          const tj = t - 0.06 - j * 0.12, u = tj / 0.6; if (u < 0 || u > 1) continue;
          const [ex, ey] = viTri(P, q.s0 + (q.s1 - q.s0) * (j ? 0.45 : 0.12));
          this.k(ctx, 'sig_m05_echo', u * ne, ex, ey - 4, (q.E.d.co || 40) * 1.25, { a: (1 - u) * 0.8 });
        }
      }
    },
  },

  // ---------- M01 BLACK HOLE: mảnh đường bay lên → mống mắt hấp dẫn mở → (xoáy gốc 3 s) → nén nổ → nhả quái sống ----------
  hoden: {
    cap(m) {
      const o = m.o;
      if (!m.tNo && (!this.conHu(o) || o.t >= o.song - 0.06)) { m.tNo = m.t; FX.lac(3); }
      return m.tNo && m.t - m.tNo > 0.8;
    },
    ve(ctx, m) {
      const t = m.t, r = m.r, s0 = m.ngan ? 0.3 : 0;
      if (!m.tNo || t - m.tNo < 0) {
        if (!m.ngan) { const fs = this.f(t, 0, 0.32, 5); if (fs >= 0) this.k(ctx, 'sig_m01_shards', fs, m.x, m.y, r * 2.5 * (1.15 - 0.15 * t / 0.32)); }
        const fl = this.f(t, 0.26 - s0, 0.66 - s0, 9); if (fl >= 0 || (t >= 0.66 - s0 && t < 0.82 - s0)) this.k(ctx, 'sig_m01_lens', fl < 0 ? 8 : fl, m.x, m.y, r * 2.1, { a: this.mo(t, Math.max(0, 0.26 - s0), 0.82 - s0, 0.05, 0.16) * 0.88 });
        // xoáy chồng nhẹ lên đĩa gốc trong 0.6–1.05 s (quái bị hút)
        const fw = this.f(t, 0.62 - s0, 1.08 - s0, 8); if (fw >= 0) this.k(ctx, 'sig_m01_swirl', fw, m.x, m.y, r * 2.3, { g: -t * 2, a: this.mo(t, 0.62 - s0, 1.08 - s0, 0.08, 0.2) * 0.9 });
      }
      if (m.tNo) {
        const u = m.t - m.tNo;
        const fc = this.f(u, 0, 0.46, 7); if (fc >= 0) this.k(ctx, 'sig_m01_crush', fc, m.x, m.y, r * 2.4 * (1 - 0.25 * u));
        const fr = this.f(u, 0.42, 0.8, 4); if (fr >= 0) this.k(ctx, 'sig_m01_release', fr, m.x, m.y, r * 2.7);
      }
    },
  },

  // ---------- M09 WYRM ENGINE: rồng thức giấc → dang cánh → bổ nhào dọc đường phun nón lửa → huy hiệu rồng cháy ----------
  rong: {
    cap(m) {
      const o = m.o;
      if (o.x != null) { m.x = o.x; m.y = o.y; m.g = o.g; }
      if (!m.tHet && !this.conHu(o)) m.tHet = m.t;
      return m.tHet != null && m.t - m.tHet > 0.5;
    },
    ve(ctx, m) {
      const t = m.t;
      if (!m.ngan) { // thức dậy + cánh thép trên chính ụ (0–0.55 s)
        const fw = this.f(t, 0, 0.26, 6); if (fw >= 0) this.k(ctx, 'sig_m09_wake', fw, m.cx, m.cy - 8, 64);
        const fg = this.f(t, 0.22, 0.56, 6); if (fg >= 0) this.k(ctx, 'sig_m09_wings', fg, m.cx, m.cy - 8, 112, { a: this.mo(t, 0.22, 0.56, 0.04, 0.1) });
      }
      if (m.tHet == null && m.x != null) { // rồng bay theo đúng vị trí bổ nhào (đầu hướng theo đường), lửa phun phía trước mõm
        const g = m.g - Math.PI / 2, nc = this.n('ronglua', 'cone');
        const u = m.o.t / m.o.song, a = Math.min(1, m.o.t / 0.1, (1 - u) / 0.1);
        if (m.o.t < 0.16) this.k(ctx, 'sig_m09_wyrm', (m.o.t / 0.16) * 7.99, m.x, m.y, 92, { g: g - Math.PI / 4, a });
        else this.k(ctx, 'sig_m09_cone', Math.min(nc - 1, 2 + (m.o.t - 0.16) * 14 % 4), m.x, m.y, 118, { g, ay: 0.22, a });
      }
      if (m.tHet != null) { const fc = this.f(m.t - m.tHet, 0, 0.5, 5); if (fc >= 0) this.k(ctx, 'sig_m09_crest', fc, m.x, m.y, 96, { a: this.mo(m.t - m.tHet, 0, 0.5, 0.04, 0.15) }); }
    },
  },

  // ---------- M07 LEVIATHAN — TIDAL BREATH (yêu cầu user 06/11: "triệu hồi đầu rồng khạc băng từ trên trời rơi xuống"):
  //   tia nối xanh từ ụ tới điểm triệu hồi → ĐẦU RỒNG BĂNG cơ khí rơi từ trời xuống trên đường (cạnh lõi, nơi luồng bắt đầu) → gầm →
  //   luồng băng-nước quét DỌC đường (đúng đầu sóng HU.thoThuy: cùng vùng trúng / sát thương / đẩy lùi / thời gian) → vệt sương băng → đầu rồng bay lên.
  //   Ảnh ChatGPT: lev_rong (đầu rồng), fx_lev_bang (dải 16 khung luồng băng) — docs/demo-hop-tuong/tuvan/leviathan/CAN-VE.json;
  //   chưa có → tạm sig_m07_neck (khung há miệng) + sig_m07_breath/corner. REDUCE FLASH / EFFECTS (camgiac.js) giảm loé + vệt sương.
  tho: {
    cap(m) {
      const o = m.o;
      if (o.x != null) { m.x = o.x; m.y = o.y; }
      if (!m.tHet && !this.conHu(o)) m.tHet = m.t;
      if (m.cx == null) { const c = this.o(m.T); if (c) { m.cx = c.x; m.cy = c.y; } }
      return m.tHet != null && m.t - m.tHet > 0.95;
    },
    ve(ctx, m) {
      const P = m.p, t = m.t; if (!P) return;
      const LA = SIG.LEV, kF = typeof CG !== 'undefined' ? CG.kFlash() : 1, gon = typeof CG !== 'undefined' && CG.gon(), can = typeof CG !== 'undefined' && CG.doc().fx === 'can';
      const S0 = Math.max(0, P.len - 36), [hx, hy] = viTri(P, S0); // miệng rồng = đầu luồng (cạnh lõi, lùi vào trong đường để đầu rồng nằm trọn trên làn)
      const TD = m.ngan ? 0.1 : 0.24; // rơi xuống
      const het = m.tHet != null ? m.t - m.tHet : -1;
      const dy = het >= 0 ? -250 * this.eo(het / 0.55) : -250 * (1 - this.eo(t / TD));
      const aD = het >= 0 ? Math.max(0, 1 - Math.max(0, het - 0.25) / 0.3) : Math.min(1, t / 0.06);
      // 1) tia nối ngắn từ ụ đang dùng chiêu → điểm triệu hồi (lúc tung chiêu)
      if (m.cx != null && t < 0.4) {
        const al = Math.min(1, t / 0.04, (0.4 - t) / 0.18);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        PX.tia(ctx, m.cx, m.cy, hx, hy - 40, 3.2, '#5fe3ff', al * 0.9);
        const tr = REN.img('fx_leviathan_trung'); if (tr) { PX.ve(ctx, tr, m.cx, m.cy, 34, 34 * tr.height / tr.width, t * 4, al * 0.8 * kF); PX.ve(ctx, tr, hx, hy - 40, 26, 26 * tr.height / tr.width, -t * 4, al * 0.7 * kF); }
        ctx.restore(); ctx.globalAlpha = 1;
      }
      // 2) bóng mềm trên đường dưới đầu rồng (to dần khi rơi xuống)
      { const k = 1 - Math.min(1, -dy / 250); PX.bong(ctx, hx, hy + 6, 70 * (0.5 + 0.5 * k), 22 * (0.5 + 0.5 * k), 0.35 * k * aD); ctx.globalAlpha = 1; }
      // 3) luồng băng quét dọc đường (vẽ dưới đầu rồng)
      if (m.tHet == null) {
        const o = m.o, u = Math.min(1, o.t / o.song), a = Math.min(1, o.t / 0.08, (1 - u) / 0.12);
        const s1 = P.len * (1 - u), buoc = 34, gocs = this.gocRe(P), XA = 22, bang = LA.bang && REN.img(LA.bang);
        for (let s = S0 + 6, i = 0; s > s1 && i < 40; s -= buoc, i++) {
          const sc = s - buoc / 2, dau = s - buoc <= s1;
          if (!dau && gocs.some(q => Math.abs(sc - q.sJ) < XA)) continue;
          const [x, y, g] = viTri(P, sc);
          if (bang) this.k(ctx, LA.bang, dau ? Math.min(3, (this.t * 16) % 4) : 4 + (Math.floor(this.t * 12) + i) % 8, x, y, buoc * 1.5, { g: g + Math.PI, a: a * (dau ? 0.9 : 1) });
          else this.k(ctx, 'sig_m07_breath', dau ? 1 + Math.floor(this.t * 12) % 2 : 3 + (Math.floor(this.t * 10) + i) % 3, x, y, buoc * 1.45, { g, a: a * (dau ? 0.9 : 1) });
        }
        for (const q of gocs) {
          if (q.sJ > P.len - 8 || s1 > q.sJ + 16) continue;
          this.cua(ctx, q, Math.min(3, Math.floor((q.sJ + 16 - s1) / 14)), a);
        }
        m.s1 = s1;
      }
      // 4) vệt sương băng đọng lại sau luồng (EFFECTS gọn: bỏ; cân bằng: thưa nửa) — mờ dần sau khi đầu rồng bay đi
      if (!gon && m.s1 != null) {
        const im = REN.img('fx_bang_trung'), aV = het >= 0 ? Math.max(0, 1 - het / 0.95) : Math.min(1, t / 0.3);
        if (im && aV > 0.01) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const st = can ? 92 : 46;
          for (let s = P.len - 30, i = 0; s > m.s1 + 20 && i < 24; s -= st, i++) {
            const [x, y] = viTri(P, s), w = 22 + (i % 3) * 4;
            PX.ve(ctx, im, x + ((i * 7) % 9) - 4, y + ((i * 5) % 7) - 3, w, w * im.height / im.width, i * 1.7, 0.42 * aV);
          }
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
      // 5) đầu rồng băng: rơi từ trời → gầm (phồng nhẹ + loé xanh ở họng) → giữ phun → bay lên
      if (aD > 0.01) {
        const gam = het < 0 && t > TD && t < TD + 0.3 ? Math.sin((t - TD) / 0.3 * Math.PI) : 0, sc = 1 + 0.07 * gam;
        const rong = LA.rong && REN.img(LA.rong);
        if (rong) { const w = 116 * sc, h = w * rong.height / rong.width; PX.ve(ctx, rong, hx, hy + dy - h * 0.34, w, h, 0, aD); ctx.globalAlpha = 1; }
        else this.k(ctx, 'sig_m07_neck', 7, hx, hy + dy - 34, 84 * sc, { a: aD });
        if (gam > 0 || (het < 0 && t < TD + 0.6)) { // loé họng khi gầm / bắt đầu phun
          const tr = REN.img('fx_leviathan_trung'), al = (gam > 0 ? gam : 0.35) * 0.8 * kF;
          if (tr && al > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, tr, hx, hy + dy - 4, 46, 46 * tr.height / tr.width, t * 3, al); ctx.restore(); ctx.globalAlpha = 1; }
        }
      }
    },
  },

  // ---------- L14 HYDRA 7★: các đầu rắn quấn thành đầu vương miện → tia rắn ngọc lục bảo → nổ trúng ----------
  hydra7: {
    ve(ctx, m) {
      const t = m.t, s = m.ngan ? 0.3 : 0;
      if (!m.ngan) { const ff = this.f(t, 0, 0.32, 8); if (ff >= 0) this.k(ctx, 'sig_l14_fusion', ff, m.cx, m.cy - 6, 70); }
      const fb = this.f(t, 0.26 - s, 0.62 - s, 4); if (fb >= 0) this.k(ctx, 'sig_l14_beam', fb, m.cx, m.cy, 78, { g: m.g - Math.PI / 2, ay: 0.34 });
      const fh = this.f(t, 0.32 - s, 0.8 - s, 6); if (fh >= 0) this.k(ctx, 'sig_l14_hit', fh, m.hx, m.hy, 70);
    },
  },
  hydraCan: { // 1–6★: các đầu rắn há miệng trên ụ, mỗi đầu cắn 1 quái riêng (lệch nhịp)
    ve(ctx, m) {
      const fh = this.f(m.t, 0, 0.36, 8); if (fh >= 0) this.k(ctx, 'sig_l14_heads', fh, m.cx, m.cy - 6, 62);
      m.ds.forEach((q, i) => { const f = this.f(m.t, 0.08 + i * 0.06, 0.44 + i * 0.06, 6); if (f >= 0) this.k(ctx, 'sig_l14_bite', f, q.x, q.y - 4, 42); });
    },
  },

  // ---------- L16 PANDORA: hộp rung → vòng số mệnh quay 6 biểu tượng → khoá mở → biểu tượng trúng bật ra → nổ đúng phép ----------
  pandora: {
    ve(ctx, m) {
      const c = m.c; if (!c) return;
      const t = m.t + (m.ngan ? 0.27 : 0), x = c.x, y = c.y - 42, dich = m.chon.map(i => this.PDR[PANDORA[i].k]);
      const rung = t < 0.27 ? Math.sin(t * 80) * 1.6 : 0;
      // hộp: rung (khung 0–3) → đứng yên trong lúc quay → mở (4–7)
      const fv = t < 0.27 ? (t / 0.27) * 3.99 : t < 0.8 ? 3 : 4 + Math.min(3.99, (t - 0.8) / 0.25 * 4);
      if (t < 1.22) this.k(ctx, 'sig_l16_vault', fv, x + rung, y + 2, 58, { a: this.mo(t, 0, 1.22, 0.05, 0.14) });
      // vòng số mệnh + biểu tượng quay chậm dần, dừng ĐÚNG phép đã chọn sẵn
      if (t >= 0.27 && t < 0.92) {
        const u = (t - 0.27) / 0.53, al = this.mo(t, 0.27, 0.92, 0.05, 0.1);
        this.k(ctx, 'sig_l16_wheel', (t * 20) % 6, x, y - 34, 56, { a: al });
        const quay = 12 * this.eo(Math.min(1, u)), ic = ((dich[0][1] - 12 + Math.floor(quay)) % 6 + 6) % 6;
        this.k(ctx, 'sig_l16_icons', u >= 1 ? dich[0][1] : ic, x, y - 34, 26, { a: al });
      }
      // phép trúng bật lên từ hộp + vòng nổ đúng phép trên ô
      dich.forEach((d, j) => {
        const tj = t - j * 0.12, bx = x + (dich.length > 1 ? (j ? 22 : -22) : 0);
        if (tj >= 0.86 && tj < 1.4) { const u = this.eo((tj - 0.86) / 0.2); this.k(ctx, 'sig_l16_icons', d[1], bx, y - 8 - 34 * u, 30 * (0.5 + 0.6 * u), { a: this.mo(tj, 0.86, 1.4, 0.04, 0.14) }); }
        const fo = this.f(tj, 1.0, 1.5, 4); if (fo >= 0) this.k(ctx, 'sig_l16_' + d[0], fo, c.x + (j ? 10 : 0), c.y + 6, 92);
      });
    },
  },

  // ---------- L06 STAR BREAKER: kẻ trộm sao (PVP) / sứ giả sao (CO-OP/SOLO) bay sang ụ đích → sao vỡ / sao được tặng ----------
  sao: {
    ve(ctx, m) {
      const t = m.t + (m.ngan ? 0.3 : 0), g = m.pvp ? 'thief' : 'courier', n = 8;
      const p = this.eo((t - 0.3) / 0.32), x = m.x0 + (m.x1 - m.x0) * p, y = m.y0 + (m.y1 - m.y0) * p - Math.sin(p * Math.PI) * 26;
      if (t < 1.05) this.k(ctx, 'sig_l06_' + g, t < 0.3 ? t / 0.3 * 4 : t < 0.62 ? 4 + (t * 16) % 3 : Math.min(7, 5 + (t - 0.62) * 6), x, y - 14, 50, { a: this.mo(t, 0, 1.05, 0.06, 0.2), lat: m.x1 < m.x0 });
      if (m.chan) { const fs = this.f(t, 0.58, 0.95, 3); if (fs >= 0) this.k(ctx, 'sig_l06_seal', fs, m.x1, m.y1 - 6, 50); return; }
      const fe = this.f(t, 0.6, 1.0, 6); if (fe >= 0) this.k(ctx, 'sig_l06_' + (m.pvp ? 'shatter' : 'gift'), fe, m.x1, m.y1 - 4, 54);
    },
  },

  // ---------- L04 MERGE KING: 2 huy hiệu xoay → vương miện nổi trên ô → búa hoàng gia gõ → đóng dấu sao vàng ----------
  vua: {
    ve(ctx, m) {
      const t = m.t + (m.ngan ? 0.24 : 0), x = m.x, y = m.y;
      if (!m.ngan) { const fc = this.f(t, 0, 0.26, 5); if (fc >= 0) this.k(ctx, 'sig_l04_crest', fc, x, y - 6, 66); }
      if (t >= 0.22 && t < 0.86) this.k(ctx, 'sig_l04_crown', Math.min(6, (t - 0.22) / 0.4 * 7), x, y - 38 - 6 * this.eo((t - 0.22) / 0.2), 66, { a: this.mo(t, 0.22, 0.86, 0.05, 0.12) });
      const fh = this.f(t, 0.48, 0.8, 6); if (fh >= 0) this.k(ctx, 'sig_l04_hammer', fh, x + 20, y - 54, 52);
      const fs = this.f(t, 0.76, 1.2, 6); if (fs >= 0) this.k(ctx, 'sig_l04_star', fs, x, y - 16, 58 * (fs === 0 ? 1.25 : 1));
    },
  },

  // ---------- M06 HIVE QUEEN: nữ hoàng xoè thân + sóng lệnh → drone (PNG) lao vào quái → nổ tổ ong dọc đường → vương huy ngòi chích ----------
  ong: {
    cap(m) {
      for (const q of m.ds) {
        if (q.het) continue;
        if (this.conHu(q.o)) { if (q.o.t >= 0) { q.g = Math.atan2(q.o.y - q.y, q.o.x - q.x) || q.g; q.x = q.o.x; q.y = q.o.y; } continue; }
        q.het = true; const E = q.o.E; if (m.no.length < 10) m.no.push({ x: E ? E.x : q.x, y: E ? E.y : q.y, t0: m.t });
        if (m.ds.every(z => z.het)) { m.xong = m.t; m.ex = E ? E.x : q.x; m.ey = E ? E.y : q.y; }
      }
      return m.xong && m.t - m.xong > 0.55;
    },
    ve(ctx, m) {
      const t = m.t;
      if (!m.ngan || t < 0.3) { const fq = this.f(t, 0, 0.34, 7); if (fq >= 0 || t < 0.5) this.k(ctx, 'sig_m06_queen', fq < 0 ? 6 : fq, m.cx, m.cy - 10, 64, { a: this.mo(t, 0, 0.5, 0.04, 0.14) }); }
      if (!m.ngan) { const fp = this.f(t, 0.14, 0.5, 6); if (fp >= 0) this.k(ctx, 'sig_m06_pulse', fp, m.cx, m.cy, 110, { a: 0.85 }); }
      for (const q of m.ds) if (!q.het && q.o.t >= 0) this.k(ctx, 'sig_m06_drone', Math.floor(this.t * 16) % 2, q.x, q.y, 24, { g: q.g - Math.PI / 2 });
      for (const b of m.no) { const f = this.f(t - b.t0, 0, 0.4, 6); if (f >= 0) this.k(ctx, 'sig_m06_comb', f, b.x, b.y, 52); }
      if (m.xong) { const fs = this.f(t - m.xong, 0, 0.5, 5); if (fs >= 0) this.k(ctx, 'sig_m06_crest', fs, m.ex, m.ey - 6, 72); }
    },
  },
};

// ===================================================== MÓC NỐI (không đổi luật chơi) =====================================================
(() => {
  // lớp trên: sau hiệu ứng sự kiện của bàn
  const _veDs = VX.veDs;
  VX.veDs = function (ctx, R) { _veDs.call(this, ctx, R); SIG.cap(R.dt); SIG.veTren(ctx, R); };
  // lớp dưới quái (bóng con rối trên đường): 1 "hiệu ứng" giữ chỗ trong G.hu, vẽ ở lượt `duoi`
  HU.sigDuoi = { duoi: true, cap: () => false, ve(ctx, o, R) { SIG.veDuoi(ctx, R); } };
  // nhấc bổng con rối: chỉ dời toạ độ VẼ (noiSuy đặt tạm, traLai trả lại số thật)
  const _ns = REN.noiSuy;
  REN.noiSuy = function (a) { _ns.call(this, a); for (const m of SIG.ds) if (m.k === 'roi' && m.nhac > 0 && !m.E.chet) m.E.y -= m.nhac; };
  // hình gốc của các chiêu đã có bản PNG đặc biệt: tắt khi ảnh đã tải (thiếu ảnh → giữ hình cũ, không bao giờ trống)
  const thay = (k, id, g) => { const H = HU[k]; if (!H || !H.ve) return; const v = H.ve; H.ve = function (ctx, o, R) { if (SIG.san(id, g)) return; return v.call(this, ctx, o, R); }; };
  thay('rongBo', 'ronglua', 'cone'); thay('thoThuy', 'leviathan', 'breath'); thay('pandora', 'pandora', 'vault'); thay('ongLao', 'chuato', 'drone');
  // L04 Merge King: biết đúng ô đích + đúng kết quả (+1/+2★) ngay khi ghép thành công
  const V = SKILLS.vughep && SKILLS.vughep.ghepDB;
  if (V) { const lam = V.lam; V.lam = function (G, B, a, b) { const r = lam.apply(this, arguments); try { const c = B.o[b.o]; SIG.them('vua', 1.25, { x: c.x, y: c.y, ngan: SIG.ngan(b) }); } catch (e) { } return r; }; }
  // L06 Star Breaker (hỗ trợ): lần đầu mỗi wave 1 ụ lên 5★ → PVP: ụ đối thủ −tốc (kẻ trộm sao + sao vỡ; khiên chặn → ấn khoá)
  //      CO-OP/SOLO: ụ tấn công sao thấp nhất +tốc (sứ giả sao + sao được tặng). Chỉ phát khi kỹ năng THẬT SỰ nổ (T.w5 đổi), đúng ụ bị/được tác động.
  const S = SKILLS.hasao;
  if (S && S.capNhat) {
    const cn = S.capNhat;
    S.capNhat = function (G, B, T, dt) {
      const w0 = T.w5, n0 = G.hu.length, r = cn.apply(this, arguments);
      if (T.w5 !== w0) try {
        const c0 = B.o[T.o], pvp = G.che === 'pvp'; let dich = null, chan = false;
        if (pvp) { const o = G.hu.slice(n0).find(q => q.k === 'tiaTia'); if (o) { dich = { x: o.x1, y: o.y1 }; chan = !G.ban.some(X => X !== B && X.t.some(Z => Z && Z.giamT === 6 && Math.hypot(X.o[Z.o].x - o.x1, X.o[Z.o].y - o.y1) < 2)); } }
        else for (const X of G.ban) X.t.forEach(Z => { if (Z && Z.tocT === 6 && !dich) dich = X.o[Z.o]; });
        if (dich) SIG.them('sao', 1.25, { x0: c0.x, y0: c0.y, x1: dich.x, y1: dich.y, pvp, chan, ngan: SIG.ngan(T) });
      } catch (e) { }
      return r;
    };
  }
  // L14 Hydra 1–6★: mỗi ≥ 5 s, phát bắn có các đầu rắn há miệng + vết cắn trên từng mục tiêu riêng
  const Y = SKILLS.hydra;
  if (Y) {
    const ban = Y.ban;
    Y.ban = function (G, B, T, E) {
      const n0 = G.hu.length, r = ban.apply(this, arguments);
      try {
        const l = SIG.lanCuoi.get(T);
        if (l == null || SIG.t - l > 5) { SIG.lanCuoi.set(T, SIG.t); const c = tamU(T); SIG.them('hydraCan', 0.85, { cx: c.x, cy: c.y, ds: G.hu.slice(n0).filter(o => o.k === 'tiaTia').slice(0, 6).map(o => ({ x: o.x1, y: o.y1 })) }); }
      } catch (e) { }
      return r;
    };
  }
})();
