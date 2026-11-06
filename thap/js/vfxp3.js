// TURRET MERGE — VFX P3: HIỆU ỨNG RIÊNG CHO CÁC Ụ CÒN LẠI (ngoài P2 + rồng) — docs/demo-hop-tuong/tuvan/vfx-p3/AUDIT.md
//  Luật user (tuvan/vfx/YEU-CAU-ANIM.md): KHÔNG lắc / phập phồng / nhấp nháy 1 ảnh tĩnh để giả chuyển động.
//  1) Mọi nổ trúng / chớp nòng (trước: ảnh tĩnh phóng 0,6→1,1) → dải dựng sẵn + tia lửa đúng màu (CG.K3, camgiac.js).
//  2) Tờ ChatGPT 4×4 (assets/p3_<ụ>.png, cắt bởi tools/thap-cat-p3.py → js/p3-meta.js) — có tờ thì tự dùng, chưa có thì giữ (1):
//     · nổ trúng của ụ (canon, mortar, set, railgun, hydra, aten, soi, tuthan, nemesis, ngoisao, bang, maychem) chạy khung báo → nổ → tan;
//     · Time Bomb ngòi cháy theo đếm ngược → nổ · Mine Layer đèn mìn → bật → nổ · Wall Projector tường vàng dựng → rung năng lượng → vỡ;
//     · Mystery Box sắp mở rung (khung trong tờ) → bật nắp · Toxic Pool vũng sủi bọt lặp · Eclipse / Blizzard / Nine-Tail lúc ra chiêu.
//  CHỈ TRÌNH BÀY: không đổi vùng trúng / sát thương / thời điểm / mục tiêu; không Math.random (online); bản sao Copycat = cùng id → cùng hình;
//  mọi chế độ dùng chung HU/SKILLS/FX → SOLO / CO-OP / PVP / ONLINE / Turret File demo / hướng dẫn giống nhau. EFFECTS Minimal rút dư âm.
'use strict';

const P3 = {
  M: typeof P3_META !== 'undefined' ? P3_META : {},
  // nổ trúng của ụ → [tờ, khung đầu, khung cuối, hệ số cỡ]
  TRUNG: { canon: [0, 15, 1.7], mortar: [0, 15, 1.7], set: [3, 15, 1.6], railgun: [3, 15, 1.7], hydra: [0, 15, 1.6], aten: [0, 15, 1.7],
    soi: [0, 15, 1.6], tuthan: [0, 15, 1.8], nemesis: [4, 15, 1.8], ngoisao: [4, 15, 1.7], bang: [4, 15, 1.6], maychem: [4, 15, 1.7] },
  // màu tia lửa theo NGUYÊN TỐ khai báo (tools/thap-kt-mau.js) — ảnh nổ của vài ụ lệch sắc (Tesla: lõi cam) → tia lửa vẫn đúng nguyên tố
  NT: { fire: '#ff8a2a', ice: '#a8ecff', poison: '#86ff4a', energy: '#6fc8ff', laser: '#ff3a6a', eclipse: '#ff6a2a', blood: '#ff2a3a', arcane: '#c77dff', gold: '#ffd23f', void: '#a35cff', water: '#4fb8ff' },
  U_NT: { canon: 'fire', mortar: 'fire', no5: 'fire', cuuvi: 'fire', bomhen: 'fire', min: 'fire', loren: 'fire', bang: 'ice', kiembang: 'ice', lanhgia: 'ice', baotuyet: 'ice',
    nhatthuc: 'eclipse', doc: 'poison', vungdoc: 'poison', aten: 'poison', set: 'energy', bao: 'energy', railgun: 'energy', nayda: 'energy', nangluong: 'energy', laser: 'laser',
    cuongno: 'blood', mauhut: 'blood', mana: 'arcane', nhanmana: 'arcane', hutmana: 'arcane', santhuong: 'gold', nangsao: 'gold', vughep: 'gold', hasao: 'gold', ngoisao: 'gold',
    overlord: 'laser', orbital: 'fire', lualien: 'fire', ronglua: 'fire', lophanung: 'ice', blackhole: 'void', leviathan: 'water' },
  mauTen(ten) { if (!ten || !ten.startsWith('fx_')) return null; const nt = this.U_NT[ten.slice(3, ten.indexOf('_', 3))]; return nt ? this.NT[nt] : null; },
  ten(id) { return 'p3_' + id; },
  co(id) { const t = this.ten(id); return this.M[t] && REN.img(t) ? t : null; },
  gon() { return typeof CG !== 'undefined' && CG.gon(); },
  phat(id, x, y, w, P, song, o) {
    const t = this.co(id); if (!t || typeof P2 === 'undefined') return null;
    // EFFECTS Minimal rút song → co bảng pha theo song (trước: pha cuối bị cắt → Blizzard / bom / mìn mất khung tan)
    const T1 = Math.max(...P.map(p => p[1])); if (song < T1 - 1e-6) { const k = song / T1; P = P.map(p => [p[0] * k, p[1] * k, p[2], p[3]].concat(p[4] ? [p[4] / k] : [])); }
    return P2.phat(t, x, y, w, P, song, o);
  },
  // tia lửa ngòi bom / rỉ sáng: 1 chùm mỗi nhịp 0,12 s (băm theo đối tượng) — không Math.random
  _nhip: new WeakMap(),
  nhip(o, t, dt, fn) { const k = Math.floor(t / dt); if (this._nhip.get(o) === k) return; this._nhip.set(o, k); fn(k); },
  napBo() {
    const ds = [];
    try { for (const B of G.ban) for (const id of (B.deck || []).concat(B.t.filter(Boolean).map(T => T.id))) { const t = this.ten(id); if (this.M[t]) REN.img(t); for (const c of ['trung', 'no']) if (typeof FXU !== 'undefined' && FXU.co('fx_' + id + '_' + c) && !(c === 'trung' && this.TRUNG[id] && this.M[t])) ds.push(['fx_' + id + '_' + c, c]); } } catch (e) { }
    // dựng sẵn dải nổ trúng / chớp nòng của bộ bài lúc rảnh (1 dải / 60 ms) → lần bắn đầu tiên không phải dựng giữa trận (chống giật)
    // (ụ có tờ P3 nổ trúng: bỏ dải 'trung' — tờ p3_<ụ> đã nạp + giải mã ở màn tải trận (UI.dsTran) và làm nóng mip ở nongskill.js)
    let i = 0; const buoc = () => { if (i >= ds.length || typeof CG === 'undefined') return; const [t, c] = ds[i]; if (!REN.img(t) || !REN.img('fx_cham_trang')) { setTimeout(buoc, 200); return; } CG.K3._khung = -1; CG.K3.dai(t, c); i++; setTimeout(buoc, 60); };
    setTimeout(buoc, 400);
  },
};
if (typeof P2 !== 'undefined') Object.assign(P2.M, P3.M); // HU.p2fx vẽ được cả tờ P3

// ---------- 1) nổ trúng: tờ P3 của ụ (nếu có) thay dải dựng sẵn ----------
(function () {
  if (typeof CG === 'undefined' || !CG.K3) return;
  const ve0 = CG.K3.veMot;
  CG.K3.veMot = function (ctx, R, a, u) {
    if (a.mot === 'trung' && a.ten.startsWith('fx_')) {
      const id = a.ten.slice(3, a.ten.indexOf('_', 3)), c = P3.TRUNG[id], t = c && P3.co(id);
      if (t) {
        if (!a._p3) { a._p3 = 1; a.song = Math.max(a.song, P3.gon() ? 0.34 : 0.46); u = Math.min(1, a.t / a.song); } // 16 khung cần ≥ 0,45 s để đọc được
        let x = a.x, y = a.y; if (a.bam && !a.bam.chet) { x = a.bam.x; y = a.bam.y; }
        const f = c[0] + u * (c[1] - c[0] + 0.999), al = (u > 0.8 ? (1 - u) / 0.2 : 1) * (typeof CG !== 'undefined' ? CG.kA(a) : 1) * (u < 0.3 ? 1 : CG.kFlash() > 0.9 ? 1 : 0.85);
        ctx.globalCompositeOperation = 'lighter';
        REN.khungMuot(ctx, t, Math.min(15.999, f), x, y, a.co * c[2], 0, al);
        return true;
      }
    }
    return ve0.call(this, ctx, R, a, u);
  };
})();

// ---------- 2) TIME BOMB: ngòi cháy theo đếm ngược → nổ ----------
P3.bom = function (ctx, o, R, con) {
  const t = this.co('bomhen'), p = 1 - con / Math.max(0.01, o.song);
  if (t) { ctx.globalCompositeOperation = 'source-over'; REN.khungMuot(ctx, t, Math.min(5.999, p * 6), o.x + 8, o.y - 12, 34, 0, 1); return true; }
  // chưa có tờ: tia lửa ngòi bắn lên mỗi 0,12 s (nhanh dần khi sắp nổ) + đèn đỏ sáng đều
  this.nhip(o, o.t, con < 1.5 ? 0.07 : 0.14, (k) => CG.K3.tung(o.x + 12, o.y - 19, '#ffb34a', 2, 70, 5, 0.25, k * 31 + (o.x | 0), -2.6, -0.6));
  return false;
};
(function () {
  if (typeof HU === 'undefined' || !HU.bom) return;
  const ve0 = HU.bom.ve, no0 = HU.bom.no;
  HU.bom.ve = function (ctx, o, R) {
    if (!P3.co('bomhen')) return ve0.call(this, ctx, o, R);
    const con = Math.max(0, o.song - o.t); P3.bom(ctx, o, R, con);
    ctx.font = '900 11px ' + FONT.display; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
    ctx.strokeText(Math.ceil(con) + '', o.x + 8, o.y - 26); ctx.fillStyle = con < 1.5 ? '#ff4b3e' : '#ffe46b'; ctx.fillText(Math.ceil(con) + '', o.x + 8, o.y - 26);
  };
  HU.bom.no = function (o) { const da = o.daNo; no0.call(this, o); if (!da && o.daNo) P3.phat('bomhen', o.x, o.y, o.r * 2.8, [[0, 0.5, 6, 15]], P3.gon() ? 0.4 : 0.5, { add: true }); };
})();

// ---------- 3) MINE LAYER: đèn mìn (khung 0–3 lặp) → bật lên + nổ (4–15) ----------
P3.min = function (ctx, o, R) {
  const t = this.co('min'); if (!t) return false;
  REN.khungMuot(ctx, t, (o.t * 5) % 3.999, o.x, o.y - 2, o.sao3 ? 34 : 28, 0, 0.9); return true;
};
(function () {
  if (typeof HU === 'undefined' || !HU.min) return;
  const cap0 = HU.min.cap;
  HU.min.cap = function (G, o, dt) { const r = cap0.call(this, G, o, dt); if (r) P3.phat('min', o.x, o.y, o.r * (o.sao3 ? 3.4 : 2.6), [[0, 0.5, 4, 15]], P3.gon() ? 0.4 : 0.5, { add: true }); return r; };
})();

// ---------- 4) WALL PROJECTOR — tường vàng: dựng (0–7) → rung năng lượng lặp (8–11) → vỡ (12–15) ----------
(function () {
  if (typeof HU === 'undefined' || !HU.tuong) return;
  const ve0 = HU.tuong.ve;
  HU.tuong.ve = function (ctx, o, R) {
    const t = o.vang && P3.co('wallgen');
    if (!t) return ve0.call(this, ctx, o, R);
    const con = o.song - o.t, f = o.t < 0.35 ? o.t / 0.35 * 7.99 : con < 0.35 ? 12 + (1 - con / 0.35) * 3.99 : 8 + (o.t * 8) % 3.999;
    const L = DUONG_RONG * 0.72;
    ctx.globalCompositeOperation = 'lighter';
    REN.khungMuot(ctx, t, f, o.x, o.y, L * 2.5, o.goc + Math.PI / 2, 1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
})();

// ---------- 5) MYSTERY BOX: sắp mở (nạp ≥ 85%) = khung 0–3 lặp trên ụ · mở = 4–15 ----------
(function () {
  const S0 = typeof SKILLS !== 'undefined' && SKILLS.hopbi; if (!S0) return;
  const vt = S0.veThem, cn = S0.capNhat;
  S0.veThem = function (ctx, T, S, al, R) {
    if (vt) vt.call(this, ctx, T, S, al, R);
    const t = P3.co('hopbi'); if (!t || !(T.nap > 0.85)) return;
    ctx.globalCompositeOperation = 'lighter'; REN.khungMuot(ctx, t, (G.t * 9) % 3.999, 0, -S * 0.05, S * 1.25, 0, al * Math.min(1, (T.nap - 0.85) / 0.06)); ctx.globalCompositeOperation = 'source-over';
  };
  S0.capNhat = function (G, B, T) {
    const day = T.nap < 1, c = B && B.o && B.o[T.o], r = cn.call(this, G, B, T);
    if (day && T.nap >= 1 && c && !(B.net && typeof ONS !== 'undefined' && ONS.on)) P3.phat('hopbi', c.x, c.y, Math.min(B.cw, B.ch) * 1.6, [[0, 0.55, 4, 15]], 0.55, { add: true });
    return r;
  };
})();

// ---------- 6) TOXIC POOL: vũng sủi bọt 16 khung lặp (mép = vùng trúng r + 8) ----------
(function () {
  if (typeof HU === 'undefined' || !HU.may) return;
  const ve0 = HU.may.ve;
  HU.may.ve = function (ctx, o, R) {
    const T = o.T || o._T, t = T && T.id === 'vungdoc' && P3.co('vungdoc');
    if (!t) return ve0.call(this, ctx, o, R);
    const u = o.t / o.song, a = u < 0.15 ? u / 0.15 : 1 - Math.max(0, (u - 0.7) / 0.3);
    ctx.globalCompositeOperation = 'source-over';
    REN.khungMuot(ctx, t, (o.t * 12) % 15.999, o.x, o.y, (o.r + 8) * 2.15, 0, a * 0.92);
    ctx.globalAlpha = 1;
  };
})();

// ---------- 7) lúc ra chiêu: Eclipse (sóng trăng), Blizzard (bão), Nine-Tail (đốm lửa hồ ly lặp khung) ----------
(function () {
  if (typeof HU === 'undefined' || typeof G === 'undefined') return;
  const lan = new WeakMap(); // 1 lần mỗi ụ mỗi 0,4 s (chiêu đẩy nhiều đối tượng cùng lúc)
  const mot = (T, k) => { if (!T) return true; const t = lan.get(T); if (t != null && G.t - t < 0.4) return false; lan.set(T, G.t); return true; };
  const push0 = G.hu.push;
  G.hu.push = function (...a) {
    const r = push0.apply(this, a);
    try {
      for (const o of a) {
        if (!o || !o.k) continue;
        const T = o.T || o._T || (o.k === 'tuyet' && o.B && o.B.t.find(x => x && x.id === 'baotuyet'));
        if (o.k === 'non' && P3.co('nhatthuc') && mot(T)) P3.phat('nhatthuc', o.x, o.y, (o.L || 120) * 0.9, [[0, 0.6, 0, 15]], 0.6, { add: true, goc: o.g || 0 });
        else if (o.k === 'tuyet' && P3.co('baotuyet') && mot(T)) { const B = T && G.ban[T.ban], c = B && B.o[T.o]; if (c) P3.phat('baotuyet', c.x, c.y, Math.min(B.cw, B.ch) * 2.6, [[0, 0.3, 0, 4], [0.3, 0.9, 5, 10, 14], [0.9, 1.2, 11, 15]], P3.gon() ? 0.9 : 1.2, { add: true, ra: 0.3 }); }
      }
    } catch (e) { }
    return r;
  };
  if (HU.hoHoa) {
    const ve0 = HU.hoHoa.ve;
    HU.hoHoa.ve = function (ctx, o, R) {
      const t = !o.thuc && P3.co('cuuvi');
      if (!t || o.t < 0) return ve0.call(this, ctx, o, R);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i + 1 < o.vet.length; i += 2) { const a = (i + 2) / o.vet.length; ctx.globalAlpha = a * 0.5; R.anhGiua(ctx, R.cham1('#ffa020'), o.vet[i], o.vet[i + 1], 12 * a); }
      REN.khungMuot(ctx, t, 4 + (o.t * 14 + (o.x0 || 0)) % 7.999, o.x, o.y, 40, 0, 1);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
  }
})();

// ---------- 8) BERSERKER bùng nổ / DRONE: thay đầu nhấp nháy, ảnh nhún bằng hạt thật ----------
(function () {
  if (typeof HU === 'undefined' || !HU.drone) return;
  const ve0 = HU.drone.ve;
  HU.drone.ve = function (ctx, o, R) { ve0.call(this, ctx, o, R); if (o.t >= 0) P3.nhip(o, o.t, 0.05, (k) => CG.K3.tung(o.x - Math.cos(o.goc) * 14, o.y - Math.sin(o.goc) * 14, '#7fdcff', 1, 40, 5, 0.22, k * 13 + 7, o.goc + Math.PI - 0.4, o.goc + Math.PI + 0.4)); };
})();
(function () {
  const S0 = typeof SKILLS !== 'undefined' && SKILLS.cuongno; if (!S0) return;
  const vt = S0.veThem;
  S0.veThem = function (ctx, T, S, al, R) { // đang bùng nổ: than đỏ bay lên từ ụ (thay đầu nhấp nháy 20 rad/s)
    if (vt) vt.call(this, ctx, T, S, al, R);
    if (T.cuongT > 0 && al > 0.5) { const B = G.ban[T.ban], c = B && B.o[T.o]; if (c) P3.nhip(T, G.t, 0.1, (k) => CG.K3.tung(c.x, c.y - S * 0.1, '#ff4a2a', 2, 60, 6, 0.4, k * 17 + T.o, -2.4, -0.7)); }
  };
})();

if (typeof batDau === 'function') { const bd = batDau; batDau = function () { const r = bd.apply(this, arguments); P3.napBo(); return r; }; }
