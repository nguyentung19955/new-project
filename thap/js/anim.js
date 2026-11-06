// TURRET MERGE — HỆ THỐNG ANIMATION HYBRID (REVIEW-VFX-93-v2-ANIM, PHỤ LỤC P0 A–H) · báo cáo: docs/demo-hop-tuong/tuvan/anim/
//  Game không có tướng → chính ụ phải "sống": thở lõi, ngắm, tụ lực, bắn, giật, hồi lò xo; ụ hỗ trợ: nạp → xung → toả.
//  NGUYÊN TẮC
//   · Sự kiện gameplay là nguồn sự thật: bắn (giat / TVX.ban), nổ trúng (FX.no), chiêu (T.nap tụt / T.sang bật). Hoạt ảnh KHÔNG bao giờ
//     làm trễ phát bắn, không đổi sát thương / mục tiêu / vùng chạm / nhịp. Không ghi vào trạng thái luật, không gọi Math.random (online lockstep).
//   · Mọi đường cong là HÀM GIẢI TÍCH của thời gian (thời điểm sự kiện theo đồng hồ trận G.t, lấy mẫu ở thời điểm vẽ nội suy
//     G.t − (1−α)·BUOC) → 30 FPS và 60 FPS cho đúng cùng một giá trị, chỉ khác độ mịn. Thở/idle theo đồng hồ vẽ REN.t (thời gian thực).
//   · "Thời gian nhìn" = thời gian trận / √tốc độ (2×/3× vẫn thấy giật rõ, giống lò xo cũ).
//   · Nòng: MUZZLE SOCKET = tâm ô + hướng đầu súng × bán kính mũi nòng đo từ ảnh (ART_META.tip / STAGE_TIP) + thụt nòng hiện tại.
//     Chớp nòng / tia laser / sét / đạn mới bắn đều neo ở đây, không ở tâm ảnh. Neo ô / sao giữ nguyên qua mọi cấp sao.
//   · Không vẽ hình bằng code: chỉ xoay / dời / phóng / mờ ảnh PNG có sẵn (QUY-TAC-HINH 1, 3).
//  CÀI ĐẶT: EFFECTS Full / Balanced / Minimal + REDUCE FLASH + REDUCE MOTION (camgiac.js) — chuyển động lõi (ngắm, giật, xung) luôn giữ;
//   phần phụ (sáng thở, dư ảnh, vòng quay phụ, rung cục bộ) giảm/tắt. LOD: bàn đông (≥ 15 ụ + trùm, hoặc > 22 ụ) → bỏ phần phụ.
'use strict';

const AN = {
  // ---------- easing (ngữ nghĩa: linear cho đạn · easeOut cho giật · spring cho hồi · smoothstep cho thở / sáng) ----------
  E: {
    linear: (t) => t,
    easeOut: (t) => 1 - (1 - t) * (1 - t) * (1 - t),
    easeIn: (t) => t * t * t,
    easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    smoothstep: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t)),
  },
  // lò xo giảm chấn dưới tới hạn, bắt đầu ở 1 với vận tốc 0 → về 0 (vượt quá nhẹ khi z < 1); w = tần số riêng (rad/s)
  spring(tau, z, w) {
    if (tau <= 0) return 1;
    if (z >= 1) return (1 + w * tau) * Math.exp(-w * tau);
    const wd = w * Math.sqrt(1 - z * z), e = Math.exp(-z * w * tau);
    return e * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
  },
  // góc: đường ngắn nhất (xử lý ±180°) · nội suy góc · hệ số mũ theo thời gian (thay cho min(1, dt·k) phụ thuộc FPS)
  lech(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; },
  lerpGoc(a, b, u) { return a + this.lech(a, b) * u; },
  kMu(dt, rate) { return 1 - Math.exp(-rate * Math.max(0, dt)); },
  // tween / timeline nhỏ theo thời gian: AN.tl([{at, ms, from, to, ease}]).at(ms) — các đoạn nối tiếp, đoạn sau đè đoạn trước
  tween(from, to, ms, ease, at) { return { at: at || 0, ms: Math.max(1, ms), from, to, ease: ease || 'linear' }; },
  tl(steps) {
    return {
      steps,
      at(ms) {
        let v = steps.length ? steps[0].from : 0;
        for (const s of steps) { if (ms < s.at) break; const u = Math.min(1, (ms - s.at) / s.ms), f = AN.E[s.ease] || AN.E.linear; v = s.from + (s.to - s.from) * f(u); }
        return v;
      },
      ms() { let m = 0; for (const s of steps) m = Math.max(m, s.at + s.ms); return m; },
    };
  },

  // ---------- đồng hồ ----------
  tR() { return (typeof G !== 'undefined' ? G.t || 0 : 0) - (1 - (typeof REN !== 'undefined' && REN.a != null ? REN.a : 1)) * (typeof BUOC !== 'undefined' ? BUOC : 1 / 60); },
  vK() { return 1 / Math.sqrt((typeof G !== 'undefined' && G.tocDo) || 1); },
  tReal() { return typeof REN !== 'undefined' ? REN.t || 0 : 0; },

  // ---------- trạng thái hình mỗi ụ (WeakMap: không dính vào dữ liệu luật / gói đồng bộ online) ----------
  _s: new WeakMap(),
  st(T) {
    let s = this._s.get(T);
    if (!s) {
      const h = ((T.uid || 1) * 2654435761) >>> 0;
      s = { ph: (h % 1000) / 1000, pr: 0.85 + ((h >>> 10) % 300) / 1000, tf: -1e9, x0: 0, pk: 0, K: 0, n: 0, sg: 1,
        sv: 0, st0: -1e9, sph0: 0, tp: -1e9, sang0: 0, nap0: 0, gh: [], ghT: -1e9, la: 0 };
      this._s.set(T, s);
    }
    return s;
  },
  nhomId(T) { return (window.ANIM_U && ANIM_U[T.id]) || 'cannon'; },
  nhom(T) { return (window.ANIM_NHOM && ANIM_NHOM[this.nhomId(T)]) || { kick: 0.05, kMs: 55, rMs: 220, z: 0.6, ant: 100, per: 3.4, glow: 0.03, bob: 0.3 }; },
  bac(T) { return typeof TVX !== 'undefined' && TVX.bac ? TVX.bac(T) : 0; },

  // ---------- cài đặt + LOD (1 lần mỗi khung, REN.ve0) ----------
  cfg: { gon: false, can: false, flash: false, dong: false, lod: false, ghost: 3, phu: true },
  // sự kiện hỗ trợ / chiêu: T.sang bật lên, T.nap tụt mạnh (chiêu vừa ra) — dò ĐẦU MỖI BƯỚC LUẬT (chupTruoc) và đầu khung vẽ:
  // thay đổi luôn nằm ở bước vừa chạy → thời điểm = G.t chính xác, không lượng tử theo khung (30/60 FPS như nhau)
  quet() {
    if (typeof G === 'undefined') return;
    for (const B of G.ban) for (const T of B.t) if (T) {
      const s = this.st(T), sg = T.sang || 0, np = T.nap || 0;
      if (sg > s.sang0 + 0.3 || (s.nap0 > 0.85 && np < 0.3)) s.tp = G.t;
      s.sang0 = sg; s.nap0 = np;
    }
  },
  khung() {
    this.quet();
    const c = typeof CG !== 'undefined' && CG.doc ? CG.doc() : {}, k = this.cfg;
    k.gon = c.fx === 'gon'; k.can = c.fx === 'can'; k.flash = !!c.flash; k.dong = !!c.dong;
    let n = 0, trum = false;
    if (typeof G !== 'undefined') { for (const B of G.ban) for (const T of B.t) if (T) n++; for (const E of G.quai) if (E.trum && !E.chet) { trum = true; break; } }
    k.lod = n > 22 || (n >= 15 && trum) || (typeof TKP !== 'undefined' && TKP.on && TKP.on());
    k.phu = !k.gon && !k.lod;                      // phần phụ: sáng thở, vòng quay phụ
    k.ghost = k.gon || k.lod || k.dong ? 0 : k.can ? 2 : 3; // dư ảnh chrono
  },

  // ---------- SỰ KIỆN (gọi từ luật qua lớp bọc — chỉ ghi trạng thái hình) ----------
  // bắn: m = độ mạnh giat() của kỹ năng (pháo 1, súng máy 0.3…). Giật bắt đầu từ vị trí nòng HIỆN TẠI → bắn dồn = hoà trộn, không khoá.
  ban(T, m, phu) {
    if (!T || T.o == null) return;
    const s = this.st(T), N = this.nhom(T), t = typeof G !== 'undefined' ? G.t || 0 : 0;
    if (s.tf === t && s.n > 0) { if (!phu) s.K = Math.max(s.K, this.kickK(T, N, m)); return; } // cùng bước: gộp (TVX.ban sau giat: bỏ)
    const sk = SKILLS[T.id] || {}, kc = N.ant && sk.dmg && !sk.capNhat ? this.ANT_SAU * (s.K || this.kickK(T, N, 1)) : 0; // nòng đang tụ lực → giật nối tiếp, không nhảy
    const x = this.giatAt(s, N, t) - kc;
    s.x0 = Math.max(-0.12, Math.min(0.06, x));
    s.K = this.kickK(T, N, m); s.pk = Math.min(s.x0, -s.K); s.tf = t; s.n++; s.sg = -s.sg;
    if (N.spin) { const v = this.spinAt(s, t); s.sph0 = this.sphAt(s, t); s.sv = Math.min(1, v + 0.2); s.st0 = t; }
    if (N.bien || N.ho) s.tp = t; // ụ biến hình / hỗ trợ có đòn bắn: mở-khoá / xung nhẹ theo phát bắn
  },
  ANT_SAU: 0.3, // độ sâu tụ lực (phần của K)
  kickK(T, N, m) {
    if (!N.kick) return 0;
    const tier = 0.8 + 0.1 * this.bac(T), mm = Math.max(0.7, Math.min(1.3, 0.7 + 0.3 * (m == null ? 1 : m)));
    return Math.max(0.02, Math.min(0.08, N.kick * tier * mm));
  },
  // giật + hồi: phần của đường kính đầu súng (âm = lùi). Pha giật ease-out (kMs) rồi lò xo về 0 trong ~rMs (vượt quá nhẹ).
  giatAt(s, N, t) {
    if (s.tf < -1e8) return 0;
    const tau = (t - s.tf) * this.vK(), kS = (N.kMs || 50) / 1000;
    if (tau < 0) return s.x0;
    if (tau < kS) return s.x0 + (s.pk - s.x0) * this.E.easeOut(tau / kS);
    const z = N.z || 0.6, w = 4 / (z * (N.rMs || 220) / 1000);
    return s.pk * this.spring(tau - kS, z, w);
  },
  // tụ lực trước phát (chỉ hình): 0..1 trong cửa sổ ant ms trước lần bắn kế (đọc T.cd / tốc bắn thật, ≤ 40% chu kỳ bắn)
  antP(T, N, tR) {
    if (!N.ant) return 0;
    const sk = typeof SKILLS !== 'undefined' && SKILLS[T.id];
    if (!sk || !sk.dmg || sk.capNhat || !(T.cd > 0) || !T.muc || T.muc.chet || T.st.bang > 0 || T.st.da) return 0;
    const r = typeof tocU === 'function' ? tocU(T) : 1; if (!(r > 0)) return 0;
    const ttf = T.cd / r + ((typeof G !== 'undefined' ? G.t : 0) - tR), Aw = Math.min(N.ant / 1000 / this.vK(), 0.4 / r);
    if (ttf >= Aw || Aw <= 0) return 0;
    return this.E.smoothstep(1 - ttf / Aw);
  },
  // gatling: tốc quay nòng tăng theo phát bắn, giảm mũ (τ 0,7 s); pha quay = tích phân giải tích (không cộng dồn theo khung)
  spinAt(s, t) { if (s.st0 < -1e8) return 0; return s.sv * Math.exp(-Math.max(0, t - s.st0) * this.vK() / 0.7); },
  sphAt(s, t) { if (s.st0 < -1e8) return 0; const tau = Math.max(0, t - s.st0) * this.vK(); return s.sph0 + Math.PI * 2 * 14 * s.sv * 0.7 * (1 - Math.exp(-tau / 0.7)); },
  // xung (hỗ trợ / chiêu / biến hình): lên nhanh (ease-out) rồi lò xo về 0
  xungAt(s, N, t) {
    if (s.tp < -1e8) return 0;
    const tau = (t - s.tp) * this.vK(), up = N.bien ? 0.15 : 0.07;
    if (tau < 0) return 0;
    if (tau < up) return this.E.easeOut(tau / up);
    const z = N.z || 0.55, w = 4 / (z * (N.rMs || 260) / 1000);
    return this.spring(tau - up, z, w);
  },

  // ---------- trạng thái vẽ 1 ụ (dùng lại 1 đối tượng, không cấp phát mỗi khung) ----------
  _o: { rx: 0, tw: 0, by: 0, py: 0, sx: 1, sy: 1, glow: 0, ant: 0, spin: 0, nhom: null },
  tat: false, // công tắc đo hiệu năng (tools/thap-kt-anim-perf.js): true = vẽ như cũ
  u(T, D) {
    if (this.tat) return null;
    const o = this._o, s = this.st(T), N = this.nhom(T), tR = this.tR(), tr = this.tReal(), k = this.cfg;
    o.nhom = N;
    const ant = this.antP(T, N, tR), g = this.giatAt(s, N, tR), xu = this.xungAt(s, N, tR);
    const mot = k.dong ? 0.5 : 1;
    o.ant = ant;
    o.rx = (g - ant * this.ANT_SAU * (s.K || this.kickK(T, N, 1))) * D * mot;
    o.tw = N.tw && s.K ? N.tw * s.sg * Math.max(-0.3, Math.min(1, -g / s.K)) * (k.dong ? 0 : 1) : 0;
    // thở: sáng lõi 1–3% + nhún đầu rất nhỏ, chu kỳ khác nhau mỗi ụ (pha + hệ số từ uid)
    const per = (N.per || 3.4) * s.pr, b = 0.5 - 0.5 * Math.cos(Math.PI * 2 * (tr / per + s.ph));
    o.by = k.dong ? 0 : (N.bob || 0.3) * Math.sin(Math.PI * 2 * (tr / (per * (N.bay ? 0.55 : 0.5)) + s.ph * 1.7));
    o.glow = (k.phu ? (N.glow || 0.03) * b * (k.flash ? 0.5 : 1) : 0) + ant * 0.35 * (k.flash ? 0.5 : 1);
    // gatling: rung ngang theo pha quay nòng
    o.spin = 0; o.py = 0;
    if (N.spin) { const v = this.spinAt(s, tR); o.spin = v; o.py = k.dong ? 0 : 0.012 * D * v * Math.sin(this.sphAt(s, tR) * 3); }
    // hỗ trợ: nạp (phồng nhẹ theo T.nap) → xung (lò xo) → toả (sáng tắt dần)
    o.sx = 1; o.sy = 1;
    if (N.ho) {
      const nap = T.nap > 0 && T.nap < 1 ? this.E.smoothstep(T.nap) : 0, sc = 1 + 0.012 * nap + 0.06 * xu * mot;
      o.sx = o.sy = sc; o.glow += 0.12 * nap * nap + (xu > 0 ? 0.3 * Math.max(0, xu) : 0) * (k.flash ? 0.5 : 1);
    } else if (N.bien && xu) { const e = 0.045 * xu * mot; o.sx = 1 + e; o.sy = 1 - e * 0.6; }
    else if (xu > 0) { o.glow += 0.25 * xu * (k.flash ? 0.5 : 1); } // chiêu của ụ tấn công: lõi bừng sáng 1 nhịp
    if (N.bay) { const d = 0.012 * Math.sin(Math.PI * 2 * (tr / (per * 0.55) + s.ph * 1.7 + 0.25)) * (k.dong ? 0 : 1); o.sx *= 1 + d; o.sy *= 1 + d; }
    return o;
  },

  // ---------- MUZZLE SOCKET ----------
  // điểm đầu nòng lúc VẼ (đầu đang xoay / giật / nhún) — lat: dời ngang (nòng so le của gatling, phần của D)
  _m: [0, 0],
  muzzle(T, lat) {
    if (this.tat) return dauNong(T);
    const out = this._m, c = tamU(T), sk = SKILLS[T.id] || {};
    if (sk.gocDau) { out[0] = c.x + Math.cos(T.goc) * 6; out[1] = c.y + Math.sin(T.goc) * 6; return out; } // ụ không nòng: phát từ lõi (như luật)
    const D = REN.coDau(T), m = (window.ART_META || {})[T.id] || { tip: 0.9 };
    const tip = T.gd && window.STAGE_TIP && STAGE_TIP[T.id] ? STAGE_TIP[T.id][T.gd - 1] : (m.tip || 0.9);
    const o = this.u(T, D), g = T.goc + o.tw, r = D * 0.5 * tip * o.sx + o.rx, l = (lat || 0) * D + o.py;
    out[0] = c.x + Math.cos(g) * r - Math.sin(g) * l;
    out[1] = c.y + o.by + Math.sin(g) * r + Math.cos(g) * l;
    return out;
  },
  // chớp nòng so le (gatling: trái/phải luân phiên theo số phát)
  latBan(T) { const N = this.nhom(T); if (!N.spin) return 0; const s = this.st(T); return (s.n % 2 ? 0.09 : -0.09); },

  // ---------- lớp vẽ phụ quanh đầu súng (ctx đã ở tâm ụ, CHƯA xoay) ----------
  // dư ảnh chrono (dưới đầu) · 2 lớp quay ngược chiều portal (trên đầu)
  veDuoi(ctx, T, C0, al, gd, da, R, goc) {
    const N = this.nhom(T); if (!N.ghost || da) return;
    const s = this.st(T), tr = this.tReal();
    if (tr - s.ghT >= 0.045) { s.ghT = tr; s.gh.push(goc); if (s.gh.length > 7) s.gh.shift(); }
    const n = this.cfg.ghost; if (!n) return;
    const A = [0.16, 0.1, 0.06];
    for (let i = 0; i < n; i++) {
      const j = s.gh.length - 1 - (i + 1) * 2; if (j < 0) break;
      const g2 = s.gh[j]; if (Math.abs(this.lech(g2, goc)) < 0.035) continue; // đứng yên: không chồng dư ảnh
      ctx.save(); ctx.rotate(g2); R.veDauLop(ctx, T.id, gd, C0, al * A[i], 1, false); ctx.restore();
    }
  },
  veTren(ctx, T, C0, al, gd, da, R) {
    const N = this.nhom(T); if (!N.vong || da || !this.cfg.phu) return;
    const tr = this.tReal(), s = this.st(T), A = this.cfg.flash ? 0.6 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.save(); ctx.rotate(tr * 0.7 + s.ph * 6); R.veDauLop(ctx, T.id, gd, C0, al * 0.16 * A, 0.88, false); ctx.restore();
    ctx.save(); ctx.rotate(-tr * 1.25 - s.ph * 6); R.veDauLop(ctx, T.id, gd, C0, al * 0.12 * A, 0.6, false); ctx.restore();
    ctx.restore(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
  },

  // ---------- đạn: hiện ra ở cửa nòng (đạn sinh ở tâm ụ thì ẩn dưới đầu súng tới khi qua mũi nòng) ----------
  // trả về khoảng phải che (px tính từ điểm sinh) — 0 = vẽ bình thường
  danChe(d) {
    if (this.tat) return 0;
    if (d._mz !== undefined) return d._mz;
    d._mz = 0;
    const T = d.T;
    if (!T || T.o == null || !G.ban[T.ban] || G.ban[T.ban].t[T.o] !== T || d.cong) return 0;
    const sk = SKILLS[T.id] || {}; if (sk.gocDau) return 0;
    const c = tamU(T), D = REN.coDau(T), m = (window.ART_META || {})[T.id] || { tip: 0.9 }, r = D * 0.5 * (m.tip || 0.9);
    const r0 = Math.hypot(d.sx - c.x, d.sy - c.y);
    if (r0 > r * 0.55) return 0; // đã sinh ở mũi nòng (dauNong)
    const gd = Math.atan2((d.py != null ? d.py : d.y) - d.sy, (d.px != null ? d.px : d.x) - d.sx);
    if (Math.abs(this.lech(gd, T.goc)) > 0.6) return 0; // không bay theo hướng nòng (drone, mảnh văng…) → giữ nguyên
    d._mz = Math.max(0, r - r0);
    return d._mz;
  },

  // ---------- rung CỤC BỘ ở khung tác động (thay rung cả màn cho đòn thường) ----------
  _lac: [], _li: 0, _no: null,
  lacCucBo(m) {
    if (this.tat || typeof G === 'undefined' || !G.dangBan || !(m <= 3.5) || !this._no || this._no.t !== G.t) return false;
    const L = this._lac, e = L.length < 8 ? (L.push({}), L[L.length - 1]) : L[this._li++ % 8];
    e.x = this._no.x; e.y = this._no.y; e.t = G.t; e.a = Math.min(3, m * 0.9); e.k = (this._li + L.length) * 2.4;
    return true;
  },
  _q: [0, 0],
  lacQuai(E) {
    const q = this._q; q[0] = 0; q[1] = 0;
    const L = this._lac; if (!L.length || this.cfg.dong) return q;
    const tR = this.tR(), vk = this.vK();
    for (let i = 0; i < L.length; i++) {
      const e = L[i], tau = (tR - e.t) * vk; if (tau < 0 || tau > 0.14) continue;
      const R = 40 + (E.d ? E.d.co * 0.3 : 10), dd = Math.hypot(E.x - e.x, E.y - e.y); if (dd > R) continue;
      const a = e.a * (1 - dd / R) * Math.exp(-tau / 0.045) * Math.sin(tau * Math.PI * 2 * 28) * (this.cfg.flash ? 0.6 : 1);
      q[0] += Math.cos(e.k) * a; q[1] += Math.sin(e.k) * a;
    }
    return q;
  },

  // ---------- móc vào luật (chỉ bọc, không đổi kết quả) ----------
  moc() {
    if (this._moc) return; this._moc = true;
    if (typeof chupTruoc === 'function') { const c0 = chupTruoc; window.chupTruoc = function () { try { AN.quet(); } catch (e) { } return c0.apply(this, arguments); }; }
    if (typeof giat === 'function') { const g0 = giat; window.giat = function (T, m) { const r = g0(T, m); try { AN.ban(T, m); } catch (e) { } return r; }; }
    if (typeof TVX !== 'undefined' && TVX.ban) { const b0 = TVX.ban; TVX.ban = function (T) { try { AN.ban(T, 1, true); } catch (e) { } return b0.call(this, T); }; }
    if (typeof FX !== 'undefined') {
      const n0 = FX.no; FX.no = function (ten, x, y) {
        const r = n0.apply(this, arguments);
        try {
          if (ten !== 'chop_nong' && typeof G !== 'undefined') { AN._no = AN._no || {}; AN._no.x = x; AN._no.y = y; AN._no.t = G.t; }
          const A = this.anim[this.anim.length - 1]; if (A && A.T && (A.ten === 'chop_nong' || A.mot === 'no') && A.lat === undefined) A.lat = AN.latBan(A.T);
        } catch (e) { }
        return r;
      };
      const l0 = FX.lac; FX.lac = function (m) { if (AN.lacCucBo(m)) return; return l0.call(this, m); };
    }
  },
};
AN.moc();
