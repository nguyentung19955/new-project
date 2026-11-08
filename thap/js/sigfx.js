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
  LEV: { rong: 'lev_rong', bang: 'fx_lev_bang' },
  ROI: ['fx_marionette_tay', 'fx_marionette_thanh', 'fx_marionette_day'], // Rối Máy bản mới (thiếu ảnh → vẽ bản cũ sig_l22_*)
  // tải lười: chỉ dải của ụ có trong bộ bài trên bàn (kiểm 1 lần/giây)
  nap() {
    if (this.t - this._tNap < 1) return; this._tNap = this.t;
    for (const B of G.ban) for (const id of (B.deck || []).concat(B.t.filter(Boolean).map(T => T.id))) {
      const ma = this.MA[id]; if (!ma || this.daNap.has(id)) continue;
      this.daNap.add(id);
      for (const k in SIG_META) if (k.startsWith('sig_' + ma + '_')) REN.img(k);
      if (id === 'leviathan') for (const k of ['fx_leviathan_dan', 'fx_leviathan_trung']) REN.img(k); // TIDAL BREATH: cầu nước bay lên + mưa nước (bỏ đầu rồng lev_rong, bỏ cột tia)
      if (id === 'marionette') for (const k of this.ROI) REN.img(k);
      if (id === 'ronglua') for (const k of ['wyrm_rong', 'fx_wyrm_lua2', 'fx_wyrm_lua2_2', 'fx_wyrm_lua2_3', 'fx_wyrm_lua', 'fx_ronglua_trung', 'lua_t1', 'lua_t3', 'fx_cuuvi_dan']) REN.img(k);
      if (id === 'ronglua') for (let f = 1; f <= 4; f++) for (const p of ['_nong', '_canh', '_de', '_vien']) REN.img('ronglua_f' + f + p); // 4 dạng Rồng Máy (skills5.js veDau)
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
if (typeof SIG_META !== 'undefined') SIG_META.fx_lev_bang = [16, 230, 77]; // dải 16 khung luồng băng (raw_fx_lev_bang.png, 4×4 → 1 hàng)
// Rối Máy (07/11): găng vàng 8 khung (mở → nắm), thanh rối gỗ 6 khung (lắc), dây vàng 4 khung (lấp lánh) — tools/thap-cat-marionette.py
if (typeof SIG_META !== 'undefined') Object.assign(SIG_META, { fx_marionette_tay: [8, 219, 240], fx_marionette_thanh: [6, 180, 162], fx_marionette_day: [4, 32, 180] });
// Leviathan TIDAL BREATH mưa nước: 3 ảnh đơn ChatGPT sẵn có, khai báo 1 khung để vẽ qua SIG.k (bộ đệm thu nhỏ)
if (typeof SIG_META !== 'undefined') Object.assign(SIG_META, { fx_leviathan_tia: [1, 1099, 114], fx_leviathan_dan: [1, 259, 139], fx_leviathan_trung: [1, 280, 236] });
if (typeof SIG_META !== 'undefined') SIG_META.fx_wyrm_lua = [16, 300, 150];
// luồng lửa Wyrm MỚI (07/11 19:05): 8 khung ChatGPT, nòng ở mép trái giữa khung (tools/thap-cat-wyrm2.py in số đo dưới)
if (typeof SIG_META !== 'undefined') Object.assign(SIG_META, { fx_wyrm_lua2: [8, 271, 170], fx_wyrm_lua2_2: [8, 271, 170], fx_wyrm_lua2_3: [8, 271, 170] });
if (typeof VUNG_ANH !== 'undefined') Object.assign(VUNG_ANH, { wyrm2X: 0.801, wyrm2Y: 0.645 }); // dải 16 khung luồng lửa Wyrm (raw_fx_wyrm_lua.png, 4×4 → 1 hàng; tools/thap-cat-wyrm.py)
SIG.PHAT = {
  roi(o) { // Marionette gắn dây rối
    const phu = this.ds.some(m => m.k === 'roi' && m.o.T === o.T && m.t < 1); // 7★ con rối thứ 2: tay nhỏ hơn
    this.them('roi', 1e9, { o, E: o.E, ngan: this.ngan(o.T) && !phu, phu });
  },
  rewind(o) { this.them('rewind', 1.25, { o, T: o.T, ngan: this.ngan(o.T), keo: o.keo.slice(0, 6).map(q => ({ E: q.E, s0: q.s0, s1: q.s1, p: q.E.p })) }); },
  hoden(o) { if (this.ds.some(m => m.k === 'hoden' && !m.tNo && m.t < 0.3 && Math.abs(m.x - o.x) < o.r * 0.3 && Math.abs(m.y - o.y) < o.r * 0.3)) return; this.them('hoden', 1e9, { o, x: o.x, y: o.y, r: o.r, ngan: this.ngan(o.T) }); }, // chống rối: nhiều hố trùng tâm cùng lúc chỉ 1 bộ hình mở màn
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
    moi(ctx, m) {
      const E = m.E, t = m.t, s = m.ngan ? 0.55 : 1, kt = m.phu ? 0.85 : 1, tay = (m.o.T && m.o.T.sao || 1) >= 4, lat = !!m.phu;
      const co = E.d.co || 40, tD = 0.24 * s; // tD: thời gian hạ xuống
      if (!m.no) {
        const x = E.x, y = E.y, vao = this.eo(t / tD), al = Math.min(1, t / 0.08) * (t > 1.3 ? 0.88 : 1);
        if (tay) {
          // găng: tâm lòng bàn tay (≈ 58% chiều cao khung) đè lên nửa trên con quái; ngón chĩa xuống ôm lấy nó
          // găng nhỏ hơn quái, đầu ngón (≈ 90% chiều cao khung) bấu vào đỉnh quái → thân quái vẫn thấy rõ bên dưới
          const w = Math.max(34, Math.min(56, co * 0.9)) * kt, sc = 1.15 - 0.15 * vao;
          const tg = t - tD, fr = tg < 0 ? 0 : Math.min(5, tg / (0.2 * s) * 5) + (tg > 0.2 * s + 0.5 && Math.floor(this.t * 2.2) % 3 === 0 ? 0.6 : 0);
          this.k(ctx, 'fx_marionette_tay', fr, x, y - co * 0.1 - 30 * (1 - vao), w * sc, { ay: 0.9, a: al, lat });
        } else {
          // thanh rối lơ lửng trên đầu quái + 3 dây (vẽ dây trước để đầu dây khuất dưới thanh)
          const w = 50 * kt, cy = y - co * 0.5 - 30 * kt - 26 * (1 - vao) + Math.sin(this.t * 2.4) * 1.2;
          const SEQ = [0, 1, 2, 1, 0, 4, 5, 4], fr = SEQ[Math.floor(this.t * 6) % 8], g = (fr === 2 ? -1 : fr === 1 ? -0.5 : fr === 5 ? 1 : fr === 4 ? 0.5 : 0);
          const dai = Math.max(0, Math.min(1, (t - tD * 0.7) / (0.16 * s))), h = w * 162 / 180, ty = y - co * 0.32;
          if (dai > 0) {
            this.K.roiDay.call(this, ctx, x - w * 0.32, cy - h * 0.05 + g * 2, x - co * 0.16, ty, al, dai);
            this.K.roiDay.call(this, ctx, x + w * 0.33, cy - h * 0.05 - g * 2, x + co * 0.16, ty, al, dai);
            this.K.roiDay.call(this, ctx, x, cy - h * 0.22, x, ty - 3, al * 0.9, dai);
          }
          this.k(ctx, 'fx_marionette_thanh', fr, x, cy, w, { a: al, lat });
        }
      } else {
        const u = m.t - m.tNo, x = m.nx, y = m.ny;
        if (u < 0.32) {
          const ra = Math.max(0, 1 - Math.max(0, u - 0.14) / 0.18), len = 14 * this.eo(u / 0.3);
          if (tay) { const w = Math.max(34, Math.min(56, co * 0.9)) * kt; this.k(ctx, 'fx_marionette_tay', 5 * (1 - Math.min(1, u / 0.16)), x, y - co * 0.1 - len, w, { ay: 0.9, a: ra, lat }); }
          else this.k(ctx, 'fx_marionette_thanh', 0, x, y - co * 0.5 - 30 * kt - len * 1.5, 50 * kt, { a: ra, lat });
        }
        const fe = this.f(u, 0.06, 0.62, this.n('marionette', 'toy'));
        if (fe >= 0) this.k(ctx, 'sig_l22_toy', fe, x, y - 6, 104 * kt);
      }
    },
    duoi(ctx, m) { // bóng/neo trên đường dưới con rối đang treo
      if (m.no || !(m.nhac > 1)) return; const E = m.E;
      this.k(ctx, 'sig_l22_shadow', (this.t * 6) % 3, E.x, E.y + m.nhac + 4, 30, { a: 0.75 * Math.min(1, m.nhac / 8) });
    },
    ve(ctx, m) {
      if (this.ROI.every(k => REN.img(k))) return this.K.roi.moi.call(this, ctx, m);
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

  // Rối Máy bản mới (07/11) — 1–3★ STRINGS: thanh rối gỗ hạ xuống trên đầu quái, 3 dây vàng búng xuống móc vào quái, thanh lắc khi kéo lùi;
  // 4–6★ GOLDEN HAND: găng vàng (nhìn từ trên) hạ xuống, khép ngón nắm lấy quái (khung 0 → 6), giữ chặt khi kéo lùi; 7★: 2 con rối (con thứ 2 lật gương).
  // Hết giờ / quái chết: găng mở ngón buông ra (thanh rối bay lên, dây đứt) rồi nổ rối đồ chơi. Chỉ đặt vị trí/xoay/phóng/mờ/chọn khung ảnh.
  roiDay(ctx, x0, y0, x1, y1, a, dai) { // 1 sợi dây từ (x0,y0) xuống (x1,y1); giữ tỉ lệ ảnh (móc không méo); dai 0..1 = đang búng xuống
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) * dai; if (L < 3) return;
    this.k(ctx, 'fx_marionette_day', Math.floor(this.t * 8) % 4, x0, y0, L * 32 / 180, { h: L, ay: 0, a, g: -Math.atan2(dx, dy) });
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
        // chống rối (claude/chong-roi): mảnh/mống mắt/xoáy mở màn ≤ 50% đục → không che đường và quái (nén nổ/nhả giữ nguyên)
        if (!m.ngan) { const fs = this.f(t, 0, 0.32, 5); if (fs >= 0) this.k(ctx, 'sig_m01_shards', fs, m.x, m.y, r * 2.5 * (1.15 - 0.15 * t / 0.32), { a: 0.5 }); }
        const fl = this.f(t, 0.26 - s0, 0.66 - s0, 9); if (fl >= 0 || (t >= 0.66 - s0 && t < 0.82 - s0)) this.k(ctx, 'sig_m01_lens', fl < 0 ? 8 : fl, m.x, m.y, r * 2.1, { a: this.mo(t, Math.max(0, 0.26 - s0), 0.82 - s0, 0.05, 0.16) * 0.5 });
        // xoáy chồng nhẹ lên đĩa gốc trong 0.6–1.05 s (quái bị hút)
        const fw = this.f(t, 0.62 - s0, 1.08 - s0, 8); if (fw >= 0) this.k(ctx, 'sig_m01_swirl', fw, m.x, m.y, r * 2.3, { g: -t * 2, a: this.mo(t, 0.62 - s0, 1.08 - s0, 0.08, 0.2) * 0.5 });
      }
      if (m.tNo) {
        const u = m.t - m.tNo;
        const fc = this.f(u, 0, 0.46, 7); if (fc >= 0) this.k(ctx, 'sig_m01_crush', fc, m.x, m.y, r * 2.4 * (1 - 0.25 * u));
        const fr = this.f(u, 0.42, 0.8, 4); if (fr >= 0) this.k(ctx, 'sig_m01_release', fr, m.x, m.y, r * 2.7);
      }
    },
  },

  // ---------- ĐẦU RỒNG TỪ Ụ — M07 LEVIATHAN "TIDAL BREATH" (băng) + M09 WYRM ENGINE "DRAGON DIVE" (lửa) ----------
  //   (user 06/11 16:36: "đầu rồng băng nhả từ chỗ ụ nhả ra, rồng lửa cũng thế"; 17:37: "như 1 cái ảnh rung, không phải animation khạc lửa")
  //   đầu rồng PNG ChatGPT TRỒI LÊN từ chính ô ụ đang dùng chiêu (~1.7 ô, hơi trong suốt đè ô kề) → gầm (loé họng) →
  //   luồng thở = dải 16 khung ChatGPT chạy ĐÚNG THỨ TỰ (1–4 hình thành → 5–12 chảy lặp → 13–16 tan) từ MIỆNG rồng tới đầu sóng trên đường
  //   (= đúng điểm trúng của HU.thoThuy / HU.rongBo: cùng vùng trúng / sát thương / thời gian / đẩy lùi / cháy) rồi quét DỌC đường →
  //   vệt (sương băng / than lửa cam-đỏ) → đầu rồng CHÌM lại vào ụ. Bản sao Copycat = cùng id → cùng hình. REDUCE FLASH giảm loé họng;
  //   EFFECTS gọn bỏ vệt tan, cân bằng thưa nửa. Chưa tải xong ảnh → HU gốc tự vẽ (không bao giờ trống).
  rongCap(m) {
    const o = m.o; if (!m.p) m.p = o.p;
    if (o.x != null) { m.x = o.x; m.y = o.y; }
    if (m.tHet == null && !this.conHu(o)) m.tHet = m.t;
    if (m.cx == null) { const c = this.o(m.T); if (c) { m.cx = c.x; m.cy = c.y; } }
    if (m.pit == null) { const B = m.T && G.ban[m.T.ban]; m.pit = (B && B.o[1] && Math.abs(B.o[1].x - B.o[0].x)) || 60; }
    return m.tHet != null && m.t - m.tHet > 0.95;
  },
  // tư thế đầu rồng: u 0 = nằm trong ụ, 1 = đã trồi hẳn; gam = nhịp gầm
  rongTuThe(m, dau) {
    const TR = m.ngan ? 0.08 : 0.15, het = m.tHet != null ? m.t - m.tHet : -1, P = m.pit;
    const u = het >= 0 ? 1 - this.eo(het / 0.34) : this.eo(m.t / TR);
    const gam = het < 0 && m.t > TR && m.t < TR + 0.26 ? Math.sin((m.t - TR) / 0.26 * Math.PI) : 0;
    const w = P * 1.7 * (0.3 + 0.7 * u) * (1 + 0.08 * gam), h = w * dau.height / dau.width;
    const x = m.cx, y = m.cy - P * 0.6 * u + Math.sin(this.t * 5) * 1.2 * u;
    const ng = m.x != null ? Math.max(-0.3, Math.min(0.3, (m.x - x) / 260)) * u : 0; // nghiêng nhẹ về phía luồng
    const d = h * 0.16; // tâm miệng ≈ 66% chiều cao ảnh
    return { x, y, w, h, ng, u, gam, het, TR, a: Math.min(1, u * 1.8) * 0.88, mx: x - d * Math.sin(ng), my: y + d * Math.cos(ng) };
  },
  // khung luồng cho đoạn i: hình thành (0–3) theo tiến độ / chảy lặp (4–11) / tan (12–15)
  rongKhung(i, e, het) {
    if (het >= 0) return 12 + Math.min(3, Math.floor(het / 0.28 * 4));
    if (e < 0.16) return Math.min(3, Math.floor(e / 0.16 * 4));
    return 4 + (Math.floor(this.t * 14) + i * 3) % 8;
  },
  rongVe(ctx, m, cf) {
    const dau = REN.img(cf.dau), meta = SIG_META[cf.luong]; if (!dau || !meta || !REN.img(cf.luong) || m.cx == null) return;
    const P = m.p, t = m.t, kF = typeof CG !== 'undefined' ? CG.kFlash() : 1, gon = typeof CG !== 'undefined' && CG.gon(), can = typeof CG !== 'undefined' && CG.doc().fx === 'can';
    const D = this.rongTuThe(m, dau), het = D.het, eL = t - D.TR * 0.7; // luồng bật ra khi đầu rồng gần trồi hẳn
    // 1) luồng quét DỌC đường: từ lõi (nơi sóng bắt đầu) tới đầu sóng hiện tại
    if (P && m.tHet == null) {
      const o = m.o, uu = Math.min(1, o.t / o.song), a = Math.min(1, (1 - uu) / 0.12), s1 = P.len * (1 - uu), buoc = cf.buoc, gocs = cf.cua ? this.gocRe(P) : [], XA = 22;
      for (let s = P.len - 4, i = 0; s > s1 && i < 44; s -= buoc, i++) {
        const sc = s - buoc / 2, dau1 = s - buoc <= s1;
        if (!dau1 && gocs.some(q => Math.abs(sc - q.sJ) < XA)) continue;
        const [x, y, g] = viTri(P, sc);
        this.k(ctx, cf.luong, dau1 ? Math.min(3, Math.floor(this.t * 16) % 4) : 4 + (Math.floor(this.t * 12) + i) % 8, x, y, buoc * 1.9, { g: g + Math.PI, a, h: cf.h });
      }
      for (const q of gocs) { if (q.sJ > P.len - 8 || s1 > q.sJ + 16) continue; this.cua(ctx, q, Math.min(3, Math.floor((q.sJ + 16 - s1) / 14)), a); }
      m.s1 = s1;
    }
    // 2) vệt tan dọc làn sau khi luồng hết (khung 13–16: băng đọng / than tàn) — EFFECTS gọn: bỏ; cân bằng: thưa nửa
    if (P && !gon && het >= 0 && m.s1 != null) {
      const aV = Math.max(0, 1 - het / 0.95), f = 12 + Math.min(3, Math.floor(het / 0.95 * 4)), st = can ? cf.buoc * 2 : cf.buoc;
      if (aV > 0.01) for (let s = P.len - 4, i = 0; s > Math.max(10, m.s1) && i < 44; s -= st, i++) { const [x, y, g] = viTri(P, s - cf.buoc / 2); this.k(ctx, cf.luong, f, x, y, cf.buoc * 1.9, { g: g + Math.PI, a: 0.85 * Math.min(1, aV * 1.4), h: cf.h }); }
      const im = cf.vet && REN.img(cf.vet);
      if (im && aV > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let s = P.len - 30, i = 0; s > m.s1 + 20 && i < 24; s -= (can ? 92 : 46), i++) { const [x, y] = viTri(P, s), w = 22 + (i % 3) * 4; PX.ve(ctx, im, x + ((i * 7) % 9) - 4, y + ((i * 5) % 7) - 3, w, w * im.height / im.width, i * 1.7, 0.42 * aV); }
        ctx.restore(); ctx.globalAlpha = 1;
      }
    }
    // 3) luồng từ MIỆNG rồng tới đầu sóng trên đường: chuỗi đoạn, mỗi đoạn 1 khung của dải (không phóng/rung 1 ảnh tĩnh)
    if (m.x != null && eL > 0 && (het < 0 || het < 0.3)) {
      const dx = m.x - D.mx, dy = m.y - D.my, L = Math.hypot(dx, dy);
      if (L > 4) {
        const g = Math.atan2(dy, dx), n = Math.max(1, Math.round(L / cf.doan)), sl = L / n;
        const toi = het >= 0 ? n : eL < 0.16 ? Math.min(n, 1 + Math.floor(eL / 0.16 * n)) : n; // hình thành: luồng vươn dần từ miệng
        const a = het >= 0 ? Math.max(0, 1 - het / 0.3) : 1;
        for (let i = 0; i < toi; i++) {
          const f = het >= 0 ? this.rongKhung(i, eL, het) : (i === toi - 1 && eL < 0.16 ? Math.min(3, Math.floor((eL / 0.16 * n - i) * 4)) : this.rongKhung(i, eL + 1, -1));
          this.k(ctx, cf.luong, Math.max(0, f), D.mx + Math.cos(g) * i * sl, D.my + Math.sin(g) * i * sl, sl * 1.3, { g, ax: 0.06, a, h: cf.h * (0.75 + 0.25 * Math.min(1, (i + 1) / n)) });
        }
      }
    }
    // 4) đầu rồng trên ô ụ (vẽ sau luồng → gốc luồng nằm trong miệng)
    if (D.a > 0.01) { PX.ve(ctx, dau, D.x, D.y, D.w, D.h, D.ng, D.a); ctx.globalAlpha = 1; }
    // 5) loé họng khi gầm / bắt đầu phun (REDUCE FLASH ×0.4)
    const loe = cf.loe && REN.img(cf.loe), al = (D.gam > 0 ? D.gam : het < 0 && t < D.TR + 0.6 ? 0.35 : 0) * 0.8 * kF * D.u;
    if (loe && al > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; PX.ve(ctx, loe, D.mx, D.my, D.w * 0.5, D.w * 0.5 * loe.height / loe.width, t * 3, al); ctx.restore(); ctx.globalAlpha = 1; }
  },
  // M09 WYRM ENGINE — DRAGON DIVE: ụ thức dậy → đầu rồng lửa trồi lên → khạc lửa (cam/đỏ) tới đường rồi dọc đường → huy hiệu rồng cháy ở cuối
  rong: {
    cap(m) { return this.rongCap(m); },
    ve(ctx, m) {
      if (!m.ngan) { const fw = this.f(m.t, 0, 0.26, 6); if (fw >= 0) this.k(ctx, 'sig_m09_wake', fw, m.cx, m.cy - 8, 64); }
      this.rongVe(ctx, m, SIG.RONG.rong);
      if (m.tHet != null && m.x != null) { const fc = this.f(m.t - m.tHet, 0, 0.5, 5); if (fc >= 0) this.k(ctx, 'sig_m09_crest', fc, m.x, m.y, 80, { a: this.mo(m.t - m.tHet, 0, 0.5, 0.04, 0.15) }); }
    },
  },
  // M07 LEVIATHAN — TIDAL BREATH (user 07/11 20:11: "trông như tia bắn TỪ TRÊN XUỐNG"; muốn: từ ụ bắn giọt/cầu nước LÊN trời — thấy bay vọt
  //   lên khỏi ụ — rồi rơi xuống khắp đường). KHÔNG còn cột tia dọc.
  //   pha 1 (0 → ~0.6 s): 5 cầu nước (fx_leviathan_dan, đầu cầu hướng theo đà bay) lần lượt bắn từ ngọc ụ, bay vòng nhẹ ra 2 bên, lên
  //     thẳng khỏi mép trên; càng cao càng nhỏ + mờ; loé toé nhỏ ở ngọc lúc bắn.
  //   pha 2: mưa giáo nước rơi từ trên xuống các điểm ĐỀU dọc CẢ đường (~24 px/giọt, nằm đúng trên đường); thời gian rơi + độ cao + cỡ
  //     lệch nhau cố định theo giọt (đọc thành mưa), mỗi giọt chạm đất ĐÚNG nhịp HU.thoThuy trừ máu chỗ đó → vương miện toé (fx_leviathan_trung).
  //     Nhịp 0.1 s, quái cách đầu sóng ≤ 70 px (+0.3×cỡ) bị trúng → giọt ở s chạm đất ở nhịp đầu tiên có đầu sóng ≤ s + 85.
  //     Đầu sóng xuất phát từ LÕI ngay o.t ≈ 0 → các giọt sát lõi buộc phải chạm sớm (cùng lúc cầu đang bay lên); phần còn lại của đường
  //     rơi sau nhịp nghỉ. Code chỉ đặt vị trí / xoay / phóng / mờ. Không đổi luật: thời điểm + vùng trúng vẫn do HU.thoThuy (skills5.js).
  tho: {
    cap(m) {
      const o = m.o; if (!m.p) m.p = o.p;
      if (m.tHet == null) { if (this.conHu(o)) m.ot = o.t; else m.tHet = m.t; }
      return m.tHet != null && m.t - m.tHet > 0.6;
    },
    ve(ctx, m) {
      const o = m.o, P = m.p, c = this.o(m.T); if (!P || m.ot == null) return;
      if (m.gx == null && c) { m.gx = c.x; m.gy = c.y - 6; }
      if (m.gx == null) return;
      const song = o.song, tg = m.tHet == null ? m.ot : m.ot + (m.t - m.tHet), gon = typeof CG !== 'undefined' && CG.gon();
      if (!m.giot) { // giọt đều dọc đường, toạ độ = điểm trên đường; tl = lúc chạm đất = nhịp trừ máu của quái đứng ở đó
        const N = Math.max(8, Math.round(P.len / 24)), st = P.len / N; m.giot = [];
        for (let k = 0; k < N; k++) {
          const s = Math.max(20, Math.min(P.len - 20, P.len - (k + 0.5) * st)), [x, y, g] = viTri(P, s), l = 0; // giọt chạm đúng TIM đường; vương miện toé (~40 px) không lố qua 2 đầu đường (user 07/11 23:09)
          // nhịp k ở o.t ≈ 1/60 + 0.1k; quái trúng khi đầu sóng ≤ s + 70 + 0.3×cỡ quái (≈ 85 px với quái thường)
          const tl = 1 / 60 + 0.1 * Math.max(0, Math.ceil((song * (1 - (s + 85) / P.len) - 1 / 60) / 0.1 - 1e-6));
          const r = (k * 37 % 11) / 10; // 0..1 cố định theo giọt: thời gian rơi / độ cao / cỡ khác nhau → đọc thành mưa
          m.giot.push({ x: x - Math.sin(g) * l, y: y + Math.cos(g) * l, tl, fall: 0.2 + 0.1 * r, cao: 170 + 70 * r, w: 30 + 8 * ((k * 5) % 3) / 2, nghieng: ((k * 3) % 5 - 2) * 0.05 });
        }
      }
      // 1) cầu nước bắn LÊN trời từ ngọc ụ: 5 quả lệch nhịp 0.05 s, mỗi quả bay 0.42 s từ ngọc tới quá mép trên (y = −40)
      const NQ = gon ? 3 : 5, BAY = 0.42, D = m.gy + 40;
      for (let i = 0; i < NQ; i++) {
        const t0 = i * 0.05, u = (tg - t0) / BAY; if (u < 0 || u >= 1) continue;
        const ben = (i % 2 ? 1 : -1) * (0.6 + 0.4 * ((i * 3) % 4) / 3) * (i === 0 ? 0 : 1); // quả đầu thẳng lên, các quả sau toả 2 bên
        const v = u * (0.55 + 0.45 * u); // bật ra nhanh rồi vẫn vọt tiếp lên (không dừng giữa trời)
        const x = m.gx + ben * (26 * u + 34 * u * u), y = m.gy - D * v;
        const vx = ben * (26 + 68 * u), vy = -D * (0.55 + 0.9 * u), g = Math.atan2(vy, vx);
        const w = 46 * (1 - 0.5 * u), a = Math.min(1, u * 8) * (1 - 0.55 * u);
        this.k(ctx, 'fx_leviathan_dan', 0, x, y, w, { g, ax: 0.72, a });
      }
      if (tg < 0.3) { const v = tg / 0.3; this.k(ctx, 'fx_leviathan_trung', 0, m.gx, m.gy + 4, 40 * (0.7 + 0.5 * v), { ay: 0.78, a: 0.8 * (1 - v * v), add: true }); } // toé nhỏ ở ngọc lúc bắn
      // 2) mưa giáo nước: rơi nhanh dần từ trên cao → chạm đường đúng tl → vương miện toé 0.32 s
      m.giot.forEach((d, i) => {
        if (gon && i % 2) return;
        if (m.tHet != null && d.tl > m.ot + 0.001) return; // ụ mất giữa chừng → không còn giọt mới
        const t0 = Math.max(d.tl - d.fall, Math.min(0.12, d.tl - 0.05)); // giọt sát lõi (tl sớm): rơi ngắn nhưng vẫn chạm đúng nhịp
        if (tg >= t0 && tg < d.tl) {
          const u = (tg - t0) / (d.tl - t0), e = u * u, h = d.cao * (d.tl - t0) / d.fall * (1 - e);
          this.k(ctx, 'fx_leviathan_dan', 0, d.x + Math.sin(d.nghieng) * h, d.y - h, d.w, { g: Math.PI / 2 - d.nghieng, ax: 0.8, a: Math.min(1, u * 5) });
        } else if (tg >= d.tl && tg < d.tl + 0.32) {
          const v = (tg - d.tl) / 0.32;
          this.k(ctx, 'fx_leviathan_trung', 0, d.x, d.y, 34 * (0.7 + 0.5 * v), { ay: 0.78, a: 1 - v * v });
        }
      });
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
      const rung = 0; // VFX P3: hộp không lắc (khung 0–3 tự rung trong tờ)
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

// hàm dùng chung của 2 đầu rồng gọi bằng this = SIG
for (const k of ['rongCap', 'rongTuThe', 'rongKhung', 'rongVe']) { SIG[k] = SIG.K[k]; delete SIG.K[k]; }
// cấu hình 2 rồng: đầu (PNG), dải 16 khung luồng, loé họng, hạt vệt; buoc = bước đoạn dọc đường, doan = độ dài đoạn luồng từ miệng, h = bề dày luồng
SIG.RONG = {
  tho: { dau: 'lev_rong', luong: 'fx_lev_bang', loe: 'fx_leviathan_trung', vet: 'fx_bang_trung', buoc: 34, doan: 62, h: 30, cua: true },
  rong: { dau: 'wyrm_rong', luong: 'fx_wyrm_lua', loe: 'fx_ronglua_trung', vet: null, buoc: 38, doan: 70, h: 34, cua: false },
};
SIG.sanRong = (k) => {
  if (k === 'tho') return ['fx_leviathan_dan', 'fx_leviathan_trung'].every(n => !!REN.img(n)); // cầu nước lên trời + mưa nước (thiếu ảnh → HU.thoThuy gốc tự vẽ)
  const c = SIG.RONG[k]; return !!(REN.img(c.dau) && REN.img(c.luong));
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
  // 2 đầu rồng: hình gốc chỉ tắt khi ảnh đầu rồng + dải luồng mới đã tải (SIG.rongVe vẽ thay)
  const thayR = (k, r) => { const H = HU[k]; if (!H || !H.ve) return; const v = H.ve; H.ve = function (ctx, o, R) { if (SIG.sanRong(r)) return; return v.call(this, ctx, o, R); }; };
  thayR('rongBo', 'rong'); thayR('thoThuy', 'tho'); thay('pandora', 'pandora', 'vault'); thay('ongLao', 'chuato', 'drone');
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
