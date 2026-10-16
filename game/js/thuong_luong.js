// BƯỚC 3 — VÙNG 4 SÔNG SÂU, PHIÊN 3B: THUỒNG LUỒNG PHA 1 + SÂN BÃI ĐÁ GIỮA SÔNG + VỖ SÓNG BỜ + KHUNG ĐỔI HỆ THEO PHA
// (docs/ke-hoach/buoc-3/KE-HOACH.md mục 1.4, 2.4, mục 5 hàng "3B", mục 8.3; QUYET-DINH.md Q1 = A).
//
// 1. Sân bãi đá giữa sông: phòng trùm ải 4-5 chỉ còn bãi đá ~70% sàn (chỗ đứng thu hẹp), quanh là nước sâu (như tường, không lội được).
//    Thân Thuồng Luồng trồi khỏi nước ở mép trên và mép dưới (vẽ code), đầu ở mép phải (hình tạm: ảnh Ngư Tinh nhuộm màu theo hệ).
//    Hạ xong (W.safe): nước rút, trả lại sàn cũ để đi tới cửa / nhặt đồ.
// 2. Bộ chiêu riêng pha 1 (thay SK.thuong = SK.ngu của phiên 1), mọi đòn có vùng đỏ báo trước, né bằng chạy / lăn:
//    c1 Quật đuôi  — đuôi trồi ở mép trên hoặc dưới (mép phía em bé), quét dải sát mép đó (32% bề dọc). Né: vào giữa / sang nửa kia.
//    c2 Phun nước đen — tia nước thẳng từ đầu tới chỗ em bé, để lại vệt độc 3 giây. Né: bước ngang khỏi vạch.
//    c3 Vòng thân  — 3 khúc thân trồi thành 3 vòm trên sân (2 chân vòm chắn đường, thân vòm chắn đạn) 2 giây rồi siết; đứng TRONG vòm bị trúng.
//                    Lúc đó đầu trườn lên đá: LỘ ĐIỂM YẾU 2 giây (mảnh trống trên trán sáng). Chống áp sát: vảy dựng gai quanh đầu.
//    Vỗ sóng bờ (chống đứng sát mép, có từ pha 1): em bé đứng cách mép trên / dưới / trái < 40 điểm ảnh quá 1,5 giây → thân quẫy dưới nước
//                    mép đó, sóng tạt phủ dải sát mép (báo trước 1,1 giây). Né: bước vào giữa sân. (Mép phải là chỗ cái đầu — không tính.)
//    Đớp (em bé đứng sát đầu < 84 điểm ảnh): quạt trước mặt, báo trước 0,6 giây; còn đứng sát thì đớp lần hai (báo trước 0,5 giây).
//    Lặn đổi chỗ: mỗi 9–12 giây đầu lặn 1 giây (không đánh trúng được, gợn nước chạy dọc mép phải) rồi trồi chỗ khác.
//    Pha 2, 3: HÌNH TẠM — ba chiêu pha 1 + Đớp + chiêu Ngư Tinh như phiên 1 (Bổ rìu, Sóng thần, Cột nước đuổi; pha 3 thêm Xoáy hút),
//    phiên 3C thay (S.chon dưới đây).
// 3. Khung đổi hệ theo pha (mục 8.3): pha 1 Độc → pha 2 Băng → pha 3 Lửa. Mỗi pha: b.el = hệ của pha, một lớp "kháng" hệ đó (CFG.heKhang,
//    gộp với lớp thích nghi cũ nếu trùng hệ) → điểm yếu = hệ khắc (G.WEAK) như luật cũ (+50%), thẻ "Kháng … · Yếu …" dưới thanh máu tự đổi,
//    thân đổi màu, dòng gợi ý đổi vũ khí. Lớp thích nghi cũ vẫn chạy. Sao thứ ba (kết liễu bằng hệ yếu) theo b.weak lúc gục (pha 3: Băng).
// Cờ: ?tldoihe=0 (G.TL_DOI_HE = false) → một hệ Độc suốt trận. ?tlrieng=0 (G.TL_RIENG = false) → tắt cả phiên 3B (Thuồng Luồng như phiên 1:
// chiêu Ngư Tinh, sân thường). ?vung4=0 → không có vùng 4, tệp này không làm gì.
// Ảnh thật: khi có sprite 'thuongLuong' (C71–C85, js/sprite_custom.js / G.monsterArt) thì tự dùng, thôi nhuộm; thân trồi vẫn vẽ code tới khi có D2.
// Nạp sau js/chieu_trum.js, js/song_luat.js.
(function () {
  const G = window.G;
  if (!G) return;
  const coCo = (k) => { try { return typeof location !== 'undefined' && new RegExp('[?&]' + k + '=0(&|$)').test(location.search || ''); } catch (e) { return false; } };
  if (G.TL_RIENG === undefined) G.TL_RIENG = !coCo('tlrieng');
  if (G.TL_DOI_HE === undefined) G.TL_DOI_HE = !coCo('tldoihe');
  if (!G.VUNG4 || !G.TL_RIENG || !G.bossSK || !G.bossSK.ngu) { G.thuongLuong = null; return; }

  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ZK = () => G.ZK || 0.85;
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }

  // ---------- SỐ LIỆU (giây, điểm ảnh game, sat × b.dmg) ----------
  const CFG = {
    san: { trai: 16, phai: 24, tren: 18, duoi: 14 }, // bãi đá: thu chỗ đứng vào từ mỗi mép (sàn trùm 282 × 186 → 242 × 154 ≈ 71%)
    dau: { lui: 4, len: 52, tocDoc: 0.55 },           // đầu: cách mép phải; trườn lên đá bao xa (Vòng thân); tốc trườn dọc theo em bé × b.speed
    lan: { moi: [9, 12], giay: 1.0, cach: 46 },       // lặn đổi chỗ: mỗi 9–12 giây đầu lặn 1 giây (không đánh trúng được), trồi chỗ khác dọc mép phải
    dop: { gan: 84, r: 80, span: 1.5, bao: 0.6, sat: 1.5, lai: 0.55, bao2: 0.5 }, // Đớp: em bé đứng gần đầu (< gan) thì hay đớp (quạt trước mặt, báo trước bao giây);
                                                       // em bé còn đứng gần thì đớp lần hai (nhắm lại, báo trước bao2)
    duoi: { phan: 0.33, bao: 1.15, lai: 0.55, sat: 1.6, lo: 0.3 }, // Quật đuôi: dải sát mép dày 33% bề dọc sân, quét mép phía em bé (báo trước bao) rồi quất ngược
                                                       // sang mép kia sau lai giây (hai dải hiện cùng lúc từ đầu chiêu) — giữa sân (34%) luôn an toàn; mệt sau quét
    phun: { bao: 0.8, rong: 22, them: 30, sat: 1.3, so: 3, lan2: 0.5, bao2: 0.55, vet: { rong: 16, giay: 3, sat: 0.5 } }, // Phun nước đen (so lần: mỗi lần sau nhắm lại sau lan2 giây,
                                                       // báo trước bao2) + vệt độc (vũng: 0,3 × sat mỗi 0,5 giây)
    vom: { so: 3, rx: 30, giu: 2.0, sat: 1.5, chan: 7, cach: 64, gaiR: 44, gaiBao: 0.6, gaiSat: 1.0, phun: 1.1 }, // Vòng thân; gai: chống áp sát;
                                                       // phun: đầu nằm trên đá phun một tia (báo trước như Phun nước đen) sau phun giây
    mep: { gan: 40, giay: 1.5, sau: 44, bao: 1.1, sat: 1.2, nghi: 2.5 }, // Vỗ sóng bờ
    nghi: [0.9, 1.0, 0.8],                             // nghỉ sau chiêu theo pha (trùm khác 1,3 / 1,0 / 0,8; nổi giận bật thì pha 2, 3 = nghi[0] × G.NOI_GIAN)
    heKhang: 0.25,                                     // lớp kháng hệ của pha (× 0,75 sát thương hệ đó)
    HE: ['poison', 'ice', 'fire'],
    anh: 'thuongLuong',                                // mã sprite thật khi có ảnh
  };
  const TL = (G.thuongLuong = { CFG });
  const TEN = { duoi: 'Quật đuôi', phun: 'Phun nước đen', vom: 'Vòng thân', mep: 'Vỗ sóng bờ', gai: 'Vảy dựng gai', dop: 'Đớp' };
  TL.TEN = TEN;

  // ---------- tiện ích ----------
  const later = (b, t, f) => b.seq.push({ t: Math.max(0, t), f });
  function giuBan(b, X) { later(b, 0, () => { if (!b.dead) b.busy = Math.max(b.busy, X - 1 / 60); }); }
  function vung(b, shape, geo, t, dmg, el, ten, o) { return G.mobZone(shape, geo, t, dmg, el || null, Object.assign({ src: b, skill: ten || b.skillName || null }, o || {})); }
  function tron(b, x, y, r, t, dmg, el, ten, o) { return G.zoneCircle(x, y, r, t, dmg, el || null, Object.assign({ src: b, skill: ten || b.skillName || null }, o || {})); }
  const heCua = (ph) => (G.TL_DOI_HE === false ? 'poison' : CFG.HE[clamp(ph | 0, 0, 2)]);
  TL.heCua = heCua;
  const coAnhThat = () => !!(G.monsterArt && G.monsterArt.list && G.monsterArt.list.some((x) => x.id === CFG.anh));

  // ---------- HỆ THEO PHA ----------
  // Lớp kháng của pha (he: true) đứng đầu b.layers; trùng hệ với lớp thích nghi cũ thì gộp (1 − (1 − a)(1 − b)), thẻ chỉ hiện một lần.
  function datHe(b, ph) {
    const el = heCua(ph);
    b.el = el;
    const goc = b.tlGoc || (b.tlGoc = (b.layers || []).slice()); // lớp thích nghi cũ (không đổi suốt trận)
    const L = [], trung = goc.find((l) => l.type === 'resist' && l.el === el);
    L.push({ type: 'resist', el, pct: trung ? 1 - (1 - CFG.heKhang) * (1 - trung.pct) : CFG.heKhang, he: true, scar: trung ? trung.scar : undefined });
    for (const l of goc) if (l !== trung) L.push(l);
    b.layers = L;
    const res = L.filter((l) => l.type === 'resist').map((l) => l.el);
    b.weak = res.map((e) => G.WEAK[e]).filter((e, i, a) => !res.includes(e) && a.indexOf(e) === i);
    return el;
  }
  TL.datHe = datHe;

  // ---------- TẠO TRÙM + SÂN ----------
  TL.tao = function (b, w) {
    if (!w.tlSan) {
      w.tlSan = { x0: w.x0, x1: w.x1, y0: w.y0, y1: w.y1 };
      const C = CFG.san;
      w.x0 += C.trai; w.x1 -= C.phai; w.y0 += C.tren; w.y1 -= C.duoi;
      w.props.push({ type: 'tlThan', ben: 'tren', x: 0, y: w.y0 - 14 }, { type: 'tlThan', ben: 'duoi', x: 0, y: w.y1 + 12 });
    }
    if (coAnhThat()) b.art = CFG.anh; // chỗ dựng ảnh thật (C71–C85): cùng tên cử động như trùm cũ
    b.x = w.x1 - CFG.dau.lui; b.y = (w.y0 + w.y1) / 2; b.face = -1; b.dirA = PI;
    b.tl = { mepT: 0, mepCd: 0, duoi: null, song: [], vom: [], tia: [], goiY: false, nhuom: b.art !== CFG.anh, lan: null, lanCd: G.rr(CFG.lan.moi[0], CFG.lan.moi[1]) };
    datHe(b, 0);
    b.doiPha = doiPha;
  };
  function doiPha(b, ph) {
    const cu = b.el, el = datHe(b, ph);
    b.tl.vom.length = 0; b.tl.duoi = null; b.tl.song.length = 0; // thân đang trồi chìm xuống (vùng của chiêu dở đã bị xoá ở js/boss.js)
    if (b.tl.lan) { b.tl.lan = null; b.hidden = false; }
    b.lunge = null; b.x = W().x1 - CFG.dau.lui;
    const w = W();
    if (el !== cu && w.banner) { w.banner.s += ' — ' + goiY(el); w.banner.t = Math.max(w.banner.t || 0, 3); }
  }
  function goiY(el) { return G.t('Hệ {0}: đánh bằng {1}!', G.EL[el].name, G.EL[G.WEAK[el]].name); }

  // ---------- DI CHUYỂN: đầu ở mép phải, trườn dọc theo em bé ----------
  TL.di = function (b, dt) {
    const w = W(), P = w.P;
    b.moving = false;
    const sp = b.speed * Math.max(0.4, 1 - 0.15 * (b.st.iceN || 0)) * CFG.dau.tocDoc;
    const tx = w.x1 - CFG.dau.lui, ty = clamp(P.y, w.y0 + 12, w.y1 - 8);
    const dx = tx - b.x, dy = ty - b.y;
    if (Math.abs(dx) > 1) { b.x += clamp(dx, -sp * 1.5 * dt, sp * 1.5 * dt); b.moving = true; }
    if (Math.abs(dy) > 6) { b.y += Math.sign(dy) * Math.min(Math.abs(dy), sp * dt); b.moving = true; }
    b.face = -1; b.dirA = PI;
    return true;
  };

  // ---------- CHIÊU PHA 1 ----------
  // c1 · QUẬT ĐUÔI: quét dải mép phía em bé, rồi quất ngược sang dải mép kia (cả hai dải báo đỏ từ đầu chiêu, giữa sân an toàn)
  function quatDuoi(b, P, T, D) {
    const w = W(), C = CFG.duoi, H = w.y1 - w.y0, d = Math.round(H * C.phan);
    if (b.an) b.an.ct = true;
    const dau = P.y < (w.y0 + w.y1) / 2 ? 'tren' : 'duoi', sau = dau === 'tren' ? 'duoi' : 'tren';
    const dai = (ben, t) => vung(b, 'rect', { x: w.x0 - 10, y: ben === 'tren' ? w.y0 - 10 : w.y1 - d, w: w.x1 - w.x0 + 20, h: d + 10 }, t, b.dmg * C.sat, null, TEN.duoi,
      { onFire: () => { W().shake = Math.max(W().shake, 0.3); G.sfx('boom', 1.2); } });
    dai(dau, T); dai(sau, T + C.lai);
    b.tl.duoi = { ben: dau, t0: G.time || 0, T, quet: 0.35 };
    later(b, T + 0.4, () => { if (b.tl && !b.dead) b.tl.duoi = { ben: sau, t0: (G.time || 0) - T + C.lai - 0.4, T, quet: 0.35 }; });
    later(b, T + C.lai + 0.4, () => { if (b.tl) b.tl.duoi = null; });
    const X = T + C.lai + 0.4;
    if (X > D) giuBan(b, X);
    later(b, Math.max(D, X), () => tire(b, C.lo));
  }
  // ĐỚP (em bé đứng sát đầu): quạt trước mặt, đầu chồm tới một chút
  function dop(b, P, T, D, a) {
    const C = CFG.dop;
    if (b.an) b.an.ct = true;
    const can = (g, t) => {
      vung(b, 'cone', { x: b.x - 6, y: b.y, ang: g, r: C.r, span: C.span }, t, b.dmg * C.sat, null, TEN.dop, { melee: true });
      later(b, t, () => { if (!b.dead) b.lunge = { vx: Math.cos(g) * 24 / 0.15, vy: Math.sin(g) * 12 / 0.15, t: 0.15 }; });
    };
    can(a, T);
    // đớp lần hai nếu em bé vẫn đứng sát đầu (nhắm lại, báo trước bao2)
    later(b, T + C.lai - C.bao2, () => {
      const Q = W().P;
      if (b.dead || Math.hypot(Q.x - b.x, Q.y - b.y) > CFG.dop.gan) return;
      const g = Math.atan2(Q.y - b.y, Q.x - b.x); b.dirA = g; can(g, C.bao2); b.busy = Math.max(b.busy, C.bao2 + 0.3);
      if (b.an) { b.an.n = 'atk'; b.an.t = 0; }
    });
  }
  // c2 · PHUN NƯỚC ĐEN: tia thẳng từ đầu tới chỗ em bé, để lại vệt độc; phun lần hai nhắm lại chỗ em bé (báo trước riêng)
  function phunNuoc(b, P, T, D) {
    const C = CFG.phun;
    if (b.an) b.an.ct = true;
    const tia = (tx, ty, t) => tiaNuoc(b, tx, ty, t);
    tia(P.x, P.y, T);
    for (let k = 1; k < C.so; k++) { const tk = T + k * C.lan2; later(b, tk - C.bao2, () => { if (!b.dead) { const Q = W().P; tia(Q.x, Q.y, C.bao2); } }); }
    const X = T + (C.so - 1) * C.lan2 + 0.2;
    if (X > D) giuBan(b, X);
  }
  // Một tia nước từ miệng tới (tx, ty), nổ sau t giây, để lại vệt độc (hệ của pha).
  function tiaNuoc(b, tx, ty, t) {
    const w = W(), C = CFG.phun;
    const x0 = b.x - 14, y0 = b.y - 6, g = Math.atan2(ty - y0, tx - x0), el = b.el;
    const L = clamp(Math.hypot(tx - x0, ty - y0) + C.them, 60, w.x1 - w.x0 + 20);
    vung(b, 'line', { x: x0, y: y0, ang: g, len: L, w: C.rong }, t, b.dmg * C.sat, el, TEN.phun, {
      onFire: () => {
        if (b.dead) return;
        vung(b, 'line', { x: x0, y: y0, ang: g, len: L, w: C.vet.rong }, 0, b.dmg * C.vet.sat, el, TEN.phun, { pool: true, life: C.vet.giay, tick: 0.5, tlVet: el });
        b.tl.tia.push({ x0, y0, g, L, t0: G.time || 0, el });
      },
    });
  }
  // c3 · VÒNG THÂN
  function vongThan(b, P, T, D) {
    const w = W(), C = CFG.vom;
    if (b.an) b.an.ct = true;
    const ry = C.rx * ZK(), m = C.rx + 6;
    const tam = [[clamp(P.x, w.x0 + m, w.x1 - 70), clamp(P.y, w.y0 + ry, w.y1 - ry)]];
    for (let k = 0; k < 40 && tam.length < C.so; k++) {
      const q = [G.rr(w.x0 + m, w.x1 - 70), G.rr(w.y0 + ry, w.y1 - ry)];
      if (tam.every((t) => Math.hypot(t[0] - q[0], (t[1] - q[1]) / ZK()) >= C.cach)) tam.push(q);
    }
    later(b, T, () => {
      if (b.dead) return;
      const t0 = G.time || 0;
      for (const [x, y] of tam) {
        const v = { x, y, rx: C.rx, t0, het: t0 + C.giu + 0.35 };
        b.tl.vom.push(v);
        w.props.push((v.prop = { type: 'tlVom', v, b, x, y: y + 1 }));
        tron(b, x, y, C.rx, C.giu, b.dmg * C.sat, null, TEN.vom, { onFire: () => { v.siet = G.time || 0; G.sfx('boom', 0.9); } });
      }
      // đầu trườn lên đá, lộ điểm yếu
      b.lunge = { vx: -CFG.dau.len / 0.25, vy: 0, t: 0.25 };
      b.exposed = Math.max(b.exposed || 0, C.giu);
      FX('burst', b.x - 20, b.y, '#cfe8e4', 10, 60);
      if (b.layers.some((l) => l.type === 'antiMelee')) later(b, 0.3, () => { if (!b.dead) tron(b, b.x, b.y, C.gaiR, C.gaiBao, b.dmg * C.gaiSat, null, TEN.gai); });
      if (C.phun > 0) later(b, C.phun - CFG.phun.bao, () => { if (!b.dead) { const Q = W().P; tiaNuoc(b, Q.x, Q.y, CFG.phun.bao); } }); // đầu nằm trên đá vẫn phun một tia
    });
    const X = T + C.giu + 0.35;
    later(b, T + C.giu + 0.05, () => { if (!b.dead) b.lunge = { vx: CFG.dau.len / 0.3, vy: 0, t: 0.3 }; });
    if (X > D) giuBan(b, X);
  }
  function tire(b, t) {
    if (b.dead) return;
    if (G.noiGianMet) t = G.noiGianMet(b, t);
    b.tired = t; b.exposed = Math.max(b.exposed, t); b.busy = Math.max(b.busy, t);
  }

  // ---------- VỖ SÓNG BỜ (mỗi khung) ----------
  function sonBo(w, b, dt) {
    const T = b.tl, C = CFG.mep, P = w.P;
    if (T.mepCd > 0) T.mepCd -= dt;
    if (!P || P.dead || w.over || w.safe || b.dead || b.dying != null || b.invuln > 0) { T.mepT = 0; return; }
    const ben = [];
    if (P.y - w.y0 < C.gan) ben.push('tren');
    if (w.y1 - P.y < C.gan) ben.push('duoi');
    if (P.x - w.x0 < C.gan) ben.push('trai');
    if (!ben.length) { T.mepT = Math.max(0, T.mepT - dt * 2); return; }
    T.mepT += dt;
    if (T.mepT < C.giay || T.mepCd > 0) return;
    T.mepT = 0; T.mepCd = C.nghi + C.bao;
    const t0 = G.time || 0;
    for (const s of ben) {
      const g = s === 'tren' ? { x: w.x0 - 10, y: w.y0 - 10, w: w.x1 - w.x0 + 20, h: C.sau + 10 }
        : s === 'duoi' ? { x: w.x0 - 10, y: w.y1 - C.sau, w: w.x1 - w.x0 + 20, h: C.sau + 10 }
          : { x: w.x0 - 10, y: w.y0 - 10, w: C.sau + 10, h: w.y1 - w.y0 + 20 };
      vung(b, 'rect', g, C.bao, b.dmg * C.sat, b.el, TEN.mep, { onFire: () => { W().shake = Math.max(W().shake, 0.2); G.sfx('boom', 1.6); } });
      T.song.push({ ben: s, t0, T: C.bao });
    }
    G.sfx('warn', 0.9);
  }
  TL.sonBo = sonBo;

  // ---------- LẶN ĐỔI CHỖ (mỗi khung): đầu lặn xuống (không đánh trúng được), gợn nước chạy dọc mép phải, trồi lên chỗ khác ----------
  function lanDoi(w, b, dt) {
    const T = b.tl, C = CFG.lan;
    if (T.lan) {
      T.lan.t += dt;
      const u = clamp(T.lan.t / C.giay, 0, 1);
      b.y = T.lan.y0 + (T.lan.y1 - T.lan.y0) * u;
      if (u >= 1) { T.lan = null; b.hidden = false; FX('burst', b.x, b.y, '#cfe8e4', 10, 60); T.lanCd = G.rr(C.moi[0], C.moi[1]); }
      return;
    }
    if (T.lanCd > 0) { T.lanCd -= dt; return; }
    if (b.busy > 0 || b.invuln > 0 || b.lunge || b.tired > 0 || (b.st && b.st.stun > 0)) return;
    const P = w.P, lo = w.y0 + 12, hi = w.y1 - 8;
    let y1 = G.rr(lo, hi);
    for (let k = 0; k < 6 && (Math.abs(y1 - b.y) < C.cach || Math.abs(y1 - P.y) < 24); k++) y1 = G.rr(lo, hi);
    T.lan = { t: 0, y0: b.y, y1 };
    b.hidden = true; b.busy = Math.max(b.busy, C.giay); b.cd = Math.max(b.cd, 0.5);
    FX('burst', b.x, b.y, '#cfe8e4', 8, 50);
  }
  TL.lanDoi = lanDoi;

  // ---------- MỖI KHUNG: sóng bờ, chân vòm chắn, đạn chạm vòm, trả sân khi thắng ----------
  function tick(dt) {
    const w = W();
    if (!w || !w.tlSan) return;
    if (w.safe || w.over === 'win') {
      const S = w.tlSan;
      if (w.x0 !== S.x0 || w.x1 !== S.x1 || w.y0 !== S.y0 || w.y1 !== S.y1) { Object.assign(w, { x0: S.x0, x1: S.x1, y0: S.y0, y1: S.y1 }); w.tlRut = G.time || 0; }
      return;
    }
    const b = w.boss;
    if (!b || b.kind !== 'thuong' || !b.tl) return;
    const now = G.time || 0;
    if (!b.dead) sonBo(w, b, dt);
    const T = b.tl;
    if (!b.dead && b.dying == null) lanDoi(w, b, dt);
    if (T.song.length) T.song = T.song.filter((s) => now - s.t0 < s.T + 0.6);
    if (T.tia.length) T.tia = T.tia.filter((s) => now - s.t0 < 0.4);
    if (T.vom.length) T.vom = T.vom.filter((v) => now < v.het);
    if (b.dead || b.dying != null) { T.vom.length = 0; T.duoi = null; }
    // gợi ý hệ một lần sau màn ra mắt
    if (!T.goiY && !(b.invuln > 0) && b.t > 4.2 && !b.dead) { T.goiY = true; w.banner = { s: goiY(b.el), col: G.EL[b.el].col, t: 3.2 }; }
    // vòm: hai chân chắn em bé, thân vòm chắn đạn
    const P = w.P;
    for (const v of T.vom) {
      if (now >= v.het || v.siet) continue;
      const lift = clamp((now - v.t0) / 0.25, 0, 1);
      if (lift < 0.5) continue;
      if (P && !P.dead) for (const s of [-1, 1]) {
        const cx = v.x + s * v.rx, dx = P.x - cx, dy = (P.y - v.y) / ZK(), d = Math.hypot(dx, dy), R = CFG.vom.chan + 4;
        if (d < R) { const k = (R - d) / Math.max(0.01, d); if (d < 0.01) P.x = cx + s * R; else { P.x += dx * k; P.y += dy * k * ZK(); } }
      }
      for (const o of w.projs) {
        if (!(o.t > 0) || o.team !== 'player') continue;
        const ex = (o.x - v.x) / v.rx, ey = (o.y - v.y) / (v.rx * ZK());
        if (ex * ex + ey * ey <= 1) { o.t = 0; FX('burst', o.x, o.y - 6, '#cfe8e4', 4, 40); }
      }
    }
    if (P) { P.x = clamp(P.x, w.x0, w.x1); P.y = clamp(P.y, w.y0, w.y1); }
  }
  TL.tick = tick;
  if (G.mob && G.mob.tick) { const tick0 = G.mob.tick; G.mob.tick = function (dt) { tick0(dt); tick(dt); }; }

  // ---------- BỘ CHIÊU ----------
  const SK = G.bossSK, NGU = SK.ngu;
  SK.thuong = {
    // pha 1: c1-c3; pha 2: + c4 (HÌNH TẠM: chiêu Ngư Tinh); pha 3: + c5 (HÌNH TẠM) — phiên 3C thay hàm này + c4, c5 bằng chiêu riêng.
    chon: (b, ph) => {
      // HÌNH TẠM tới phiên 3C: pha 2 thêm Bổ rìu (n1), Sóng thần (n2), Cột nước đuổi (c4); pha 3 thêm Xoáy hút (c5) — chiêu Ngư Tinh như phiên 1,
      // để độ khó pha 2, 3 không tụt so với phiên 1 (đo bằng bot: do_trum.py).
      const o = ph >= 2 ? ['c1', 'c2', 'c3', 'n1', 'n2', 'c4', 'c5'] : ph >= 1 ? ['c1', 'c2', 'c3', 'n1', 'n2', 'c4'] : ['c1', 'c2', 'c3'];
      const P = W().P;
      if (P && Math.hypot(P.x - b.x, P.y - b.y) < CFG.dop.gan) o.push('dop', 'dop', 'dop'); // đứng sát đầu: hay bị đớp
      return o;
    },
    nghi: CFG.nghi, // nghỉ sau chiêu theo pha (js/boss.js thinkBig; trùm khác 1,3 / 1,0 / 0,8)
    dop: { name: TEN.dop, anim: 'atk', tele: CFG.dop.bao, near: true, f: dop },
    c1: { name: TEN.duoi, tele: CFG.duoi.bao, to: true, f: quatDuoi },
    c2: { name: TEN.phun, tele: CFG.phun.bao, f: phunNuoc },
    c3: { name: TEN.vom, near: true, to: true, f: vongThan },
    n1: { name: NGU.c1.name, anim: 'c1', near: NGU.c1.near, to: NGU.c1.to, tele: NGU.c1.tele, f(b, P, T, D, a, sp) { return NGU.c1.f(b, P, T, D, a, sp); } }, // HÌNH TẠM (3C)
    n2: { name: NGU.c2.name, anim: 'c2', to: true, f(b, P, T, D, a, sp) { return NGU.c2.f(b, P, T, D, a, sp); } }, // HÌNH TẠM (3C)
    c4: { name: NGU.c4.name, f(b, P, T, D, a, sp) { return NGU.c4.f(b, P, T, D, a, sp); } }, // HÌNH TẠM (3C)
    c5: { name: NGU.c5.name, near: true, f(b, P, T, D, a, sp) { return NGU.c5.f(b, P, T, D, a, sp); } }, // HÌNH TẠM (3C)
  };
  TL.SK = SK.thuong;

  // ---------- CHỮ TIẾNG ANH ----------
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Quật đuôi': 'Tail Lash', 'Đớp': 'Snap', 'Phun nước đen': 'Black Water Jet', 'Vòng thân': 'Coil Arches', 'Vỗ sóng bờ': 'Bank Splash', 'Vảy dựng gai': 'Bristling Scales',
    'Hệ {0}: đánh bằng {1}!': '{0} form: strike with {1}!',
  });

  // =====================================================================
  // VẼ (hình tạm, vẽ code). Bỏ qua khi G.noRender.
  // =====================================================================
  const A = G.art;
  if (!A) return;
  const MAU = {
    poison: { than: '#2c4a36', toi: '#1a2e22', bung: '#8aa070', vay: '#6a3a7a', sang: '#c08cff', mat: '#5ff0ff' },
    ice: { than: '#3a5a74', toi: '#22384a', bung: '#d6eef4', vay: '#9fd8ff', sang: '#e8fbff', mat: '#5ff0ff' },
    fire: { than: '#5a2a1e', toi: '#381610', bung: '#e8a868', vay: '#ff7a2a', sang: '#ffd23f', mat: '#ffe08a' },
  };
  TL.MAU = MAU;
  // Nhuộm ảnh mượn (Ngư Tinh: pha 1 xanh lam, pha 2 xanh thẫm, pha 3 trắng xương) theo hệ của pha (ctx.filter; trình duyệt không hỗ trợ
  // thì giữ màu gốc). Đã soát bằng ảnh tĩnh (docs/review/ke-hoach-cai-thien/vung-4-3b/cac-luc.png). ?tldoihe=0: pha nào cũng nhuộm Độc.
  const NHUOM = {
    poison: 'hue-rotate(-75deg) saturate(0.85) brightness(0.78)',
    ice: 'hue-rotate(-28deg) saturate(0.45) brightness(1.45)', // ảnh pha 2 Ngư Tinh xanh thẫm → xanh băng nhạt
    fire: 'sepia(1) saturate(3.4) hue-rotate(-28deg) brightness(0.92)', // ảnh pha 3 Ngư Tinh trắng xương → đỏ cam
  };
  TL.NHUOM = NHUOM;
  let c = null;
  const R = (x, y, w, h, col) => { if (w <= 0 || h <= 0) return; c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function E(x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU); c.fill(); }
  const hh = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const mauB = (b) => MAU[(b && b.el) || 'poison'] || MAU.poison;
  // Khung đá: chỗ đứng (bounds) nới ra cho mép đá trùm chân nhân vật.
  const da = (w) => ({ x0: w.x0 - 6, x1: w.x1 + 6, y0: w.y0 - 8, y1: w.y1 + 4 });

  // --- sân (vẽ một lần vào canvas ẩn): nước sâu quanh bãi đá, bãi đá, lối đá ở cửa ---
  function dungSan(w) {
    const g = w.geo, cv = document.createElement('canvas');
    cv.width = g.W || G.W; cv.height = g.H || G.H;
    const pv = c; c = cv.getContext('2d');
    try {
      const D = da(w), fx0 = g.fx0, fx1 = g.fx1, fy0 = g.fy0, fy1 = g.fy1;
      // nước sâu
      const nuoc = (x, y, ww, hh2) => { R(x, y, ww, hh2, 'rgba(10,30,34,0.93)'); };
      nuoc(fx0, fy0, fx1 - fx0, D.y0 - fy0); nuoc(fx0, D.y1, fx1 - fx0, fy1 - D.y1 + 2);
      nuoc(fx0, D.y0, D.x0 - fx0, D.y1 - D.y0); nuoc(D.x1, D.y0, fx1 - D.x1, D.y1 - D.y0);
      for (let i = 0; i < 70; i++) { // đốm sáng tối dưới nước
        const x = fx0 + hh(i, 1) * (fx1 - fx0), y = fy0 + hh(i, 2) * (fy1 - fy0);
        if (x > D.x0 - 2 && x < D.x1 + 2 && y > D.y0 - 2 && y < D.y1 + 2) continue;
        R(x, y, 3 + hh(i, 3) * 6, 1, hh(i, 4) < 0.5 ? 'rgba(40,90,92,0.55)' : 'rgba(4,14,16,0.6)');
      }
      // bãi đá
      E((D.x0 + D.x1) / 2, (D.y0 + D.y1) / 2 + 2, (D.x1 - D.x0) / 2 + 3, (D.y1 - D.y0) / 2 + 4, 'rgba(0,0,0,0)');
      R(D.x0, D.y0, D.x1 - D.x0, D.y1 - D.y0, '#4f564a');
      R(D.x0 + 2, D.y0 + 1, D.x1 - D.x0 - 4, 3, '#646c5c');
      R(D.x0, D.y1 - 3, D.x1 - D.x0, 3, '#33382f'); R(D.x0, D.y1, D.x1 - D.x0, 2, '#1c2420'); // cạnh đá dưới, bóng xuống nước
      R(D.x0 - 1, D.y0, 2, D.y1 - D.y0, '#3b4137'); R(D.x1 - 1, D.y0, 2, D.y1 - D.y0, '#3b4137');
      for (let i = 0; i < 46; i++) { // tảng đá phẳng, khe nứt
        const x = D.x0 + 8 + hh(i, 5) * (D.x1 - D.x0 - 30), y = D.y0 + 8 + hh(i, 6) * (D.y1 - D.y0 - 20), ww = 14 + hh(i, 7) * 22, h2 = 6 + hh(i, 8) * 8;
        E(x + ww / 2, y + h2 / 2, ww / 2, h2 / 2, hh(i, 9) < 0.5 ? '#575e50' : '#4a5045');
        R(x + 3, y + 1, ww * 0.5, 1, 'rgba(140,150,128,0.35)');
        if (hh(i, 10) < 0.35) R(x + ww * 0.3, y + h2 * 0.6, ww * 0.5, 1, '#2f342c');
      }
      for (let i = 0; i < 30; i++) { // rêu, sỏi
        const x = D.x0 + 4 + hh(i, 11) * (D.x1 - D.x0 - 8), y = D.y0 + 4 + hh(i, 12) * (D.y1 - D.y0 - 8);
        if (hh(i, 13) < 0.55) E(x, y, 3 + hh(i, 14) * 4, 1.5 + hh(i, 15) * 1.5, 'rgba(70,110,60,0.7)');
        else R(x, y, 2, 1, '#7c8270');
      }
      // rêu dọc mép nước
      for (let x = D.x0; x < D.x1; x += 5) { R(x, D.y0, 3 + ((x * 7) % 3), 1, 'rgba(90,130,70,0.8)'); R(x + 2, D.y1 - 4, 2, 1, 'rgba(90,130,70,0.6)'); }
      // lối đá ở cửa (từ cửa tới mép đá)
      for (const d of w.doors || []) {
        const q = G.roomArt && G.roomArt.doorPos ? G.roomArt.doorPos(g, d.dir) : null;
        if (!q) continue;
        const tx = clamp(q.x, D.x0 + 6, D.x1 - 6), ty = clamp(q.y, D.y0 + 6, D.y1 - 4);
        for (let k = 0; k <= 3; k++) {
          const x = q.x + (tx - q.x) * (k / 3), y = q.y + (ty - q.y) * (k / 3);
          E(x, y + 1, 7, 3.5, '#2a302a'); E(x, y, 6, 3, '#5d6556'); R(x - 3, y - 2, 4, 1, '#7c8472');
        }
      }
    } finally { c = pv; }
    return cv;
  }
  function veSan(cx, w, t) {
    if (!w.tlSan) return;
    if (!w.tlCv) { try { w.tlCv = dungSan(w); } catch (e) { w.tlCv = null; if (!TL.loiVe) { TL.loiVe = e; if (window.console) console.warn('thuong_luong san', e); } return; } }
    const rut = w.tlRut != null ? clamp(1 - (t - w.tlRut) / 2, 0.45, 1) : 1; // hạ xong: nước rút
    const pv = c; c = cx;
    try {
      c.save(); c.globalAlpha *= rut;
      c.drawImage(w.tlCv, 0, 0);
      c.restore();
      // gợn sóng chạy, bọt mép đá
      const S = w.tlSan, D = rut < 1 ? { x0: S.x0 + CFG.san.trai - 6, x1: S.x1 - CFG.san.phai + 6, y0: S.y0 + CFG.san.tren - 8, y1: S.y1 - CFG.san.duoi + 4 } : da(w), g = w.geo;
      const a = (0.5 * rut).toFixed(2);
      for (let i = 0; i < 12; i++) {
        const x = g.fx0 + ((hh(i, 21) * (g.fx1 - g.fx0) + t * (8 + i % 3 * 4)) % (g.fx1 - g.fx0));
        const top = i % 2 === 0, y = top ? g.fy0 + 3 + hh(i, 22) * Math.max(1, D.y0 - g.fy0 - 6) : D.y1 + 3 + hh(i, 23) * Math.max(1, g.fy1 - D.y1 - 5);
        R(x, y, 6, 1, 'rgba(150,200,196,' + a + ')');
      }
      for (let x = D.x0; x < D.x1; x += 9) {
        const f = Math.floor(t * 3 + x * 0.3) % 3;
        R(x + f, D.y0 - 1, 4, 1, 'rgba(220,240,232,' + (0.55 * rut).toFixed(2) + ')');
        R(x + 4 - f, D.y1 + 1, 4, 1, 'rgba(220,240,232,' + (0.45 * rut).toFixed(2) + ')');
      }
      for (let y = D.y0; y < D.y1; y += 9) { const f = Math.floor(t * 3 + y * 0.3) % 3; R(D.x0 - 2, y + f, 1, 4, 'rgba(220,240,232,' + (0.5 * rut).toFixed(2) + ')'); R(D.x1 + 1, y + 3 - f, 1, 4, 'rgba(220,240,232,' + (0.5 * rut).toFixed(2) + ')'); }
      // vệt độc / nước đen của Phun nước đen, tia nước vừa phun
      for (const z of w.zones) if (z.tlVet && !z.dead) veVet(z, t);
      const b = w.boss;
      if (b && b.tl) for (const s of b.tl.tia) veTia(s, t);
      // bóng vòm trên đá (thân vòm vẽ ở lớp đồ vật)
      if (b && b.tl) for (const v of b.tl.vom) { const u = clamp((t - v.t0) / 0.25, 0, 1); E(v.x, v.y + 1, v.rx * u, v.rx * ZK() * 0.5 * u, 'rgba(0,0,0,0.22)'); }
    } finally { c = pv; }
  }
  function veVet(z, t) {
    const M = MAU[z.tlVet] || MAU.poison, a = clamp(z.life / 0.6, 0, 1), n = Math.max(2, Math.floor(z.len / 10));
    for (let i = 0; i <= n; i++) {
      const k = i / n, x = z.x + Math.cos(z.ang) * z.len * k, y = z.y + Math.sin(z.ang) * z.len * k, r = z.w / 2 * (0.7 + 0.3 * Math.sin(i * 1.7 + t * 3));
      E(x, y, r, r * 0.45, 'rgba(14,20,18,' + (0.55 * a).toFixed(2) + ')');
      if (i % 2 === 0) { c.globalAlpha = 0.6 * a; R(x - 2, y - 1, 3, 1, M.sang); c.globalAlpha = 1; }
    }
  }
  function veTia(s, t) {
    const u = clamp((t - s.t0) / 0.4, 0, 1), M = MAU[s.el] || MAU.poison, n = Math.floor(s.L / 6);
    c.save(); c.globalAlpha = 1 - u;
    for (let i = 0; i <= n; i++) { const k = i / n, x = s.x0 + Math.cos(s.g) * s.L * k, y = s.y0 + Math.sin(s.g) * s.L * k - Math.sin(k * PI) * 6; E(x, y, 6, 3, '#0e1614'); E(x, y - 1, 3, 1.5, M.vay); }
    c.restore();
  }

  // --- thân trồi ở mép trên / dưới (lớp đồ vật, xếp theo chiều sâu) ---
  function buou(x, yn, rw, h, M, t, so) { // một khúc thân trồi: vòng cung từ mặt nước lên rồi xuống
    const n = 12;
    for (let i = 0; i <= n; i++) { const k = i / n, xx = x - rw + 2 * rw * k, yy = yn - Math.sin(k * PI) * h; E(xx, yy + 1, 4.5, 4, M.toi); }
    for (let i = 0; i <= n; i++) { const k = i / n, xx = x - rw + 2 * rw * k, yy = yn - Math.sin(k * PI) * h; E(xx, yy, 4, 3.5, M.than); R(xx - 1, yy + 1, 3, 1, M.bung); }
    for (let i = 2; i <= n - 2; i += 2) { const k = i / n, xx = x - rw + 2 * rw * k, yy = yn - Math.sin(k * PI) * h; R(xx - 1, yy - 6, 2, 3, M.vay); R(xx, yy - 7, 1, 1, M.sang); } // vây lưng răng cưa
    for (const s of [-1, 1]) { const f = Math.floor(t * 4 + x + so) % 2; E(x + s * rw, yn + 1, 6 + f, 2, 'rgba(220,240,232,0.75)'); }
  }
  function veThan(cx, o) {
    const w = W(), b = w && w.boss;
    if (!w || !w.tlSan || w.safe || !b || b.kind !== 'thuong' || b.dead) return;
    const pv = c; c = cx;
    try {
      const t = G.time || 0, g = w.geo, D = da(w), M = mauB(b), tren = o.ben === 'tren';
      const yn = tren ? Math.round((g.fy0 + D.y0) / 2) + 3 : Math.round((D.y1 + g.fy1) / 2) + 3;
      const sg = b.tl.song.find((s) => s.ben === o.ben), quay = sg ? 1 + 3 * clamp((t - sg.t0) / sg.T, 0, 1) : 1;
      const xs = tren ? [0.18, 0.5, 0.8] : [0.3, 0.62];
      xs.forEach((k, i) => { const x = D.x0 + (D.x1 - D.x0) * k + Math.sin(t * 0.5 * quay + i * 2) * 8; buou(x, yn, 16 + i % 2 * 3, 11 + Math.sin(t * 1.3 * quay + i) * 3 * quay, M, t, i); });
      // sóng bờ: thân quẫy, bọt tung (báo trước), rồi sóng tạt lên đá
      if (sg) {
        const u = (t - sg.t0) / sg.T;
        for (let i = 0; i < 10; i++) { const x = D.x0 + hh(i, 31) * (D.x1 - D.x0), h = (3 + hh(i, 32) * 7) * (0.5 + 0.5 * Math.sin(t * 14 + i)); R(x, yn - h, 2, h, 'rgba(220,240,232,0.8)'); }
        if (u >= 1 && u < 1 + 0.6 / sg.T) { const k = 1 - (u - 1) * sg.T / 0.6; c.save(); c.globalAlpha = 0.6 * k; R(D.x0, tren ? D.y0 : D.y1 - CFG.mep.sau, D.x1 - D.x0, CFG.mep.sau, '#cfe8f0'); c.restore(); }
      }
      // đuôi (Quật đuôi): trồi ở đầu trái mép, rồi quét ngang
      const qd = b.tl.duoi;
      if (qd && qd.ben === o.ben) {
        const u = (t - qd.t0) / qd.T, cao = clamp(u, 0, 1) * 26;
        const x = u < 1 ? D.x0 + 10 : D.x0 + 10 + (D.x1 - D.x0 - 20) * clamp((u - 1) * qd.T / qd.quet, 0, 1);
        const y0 = yn;
        for (let i = 0; i < 8; i++) { const k = i / 7, yy = y0 - cao * k; E(x + Math.sin(k * 2 + t * 6) * 2, yy, 4 - k * 1.5, 3.5, M.than); }
        E(x, y0 - cao - 4, 7, 5, M.vay); E(x, y0 - cao - 4, 4, 2.5, M.sang); // vây đuôi
        if (u >= 1) for (let i = 0; i < 6; i++) R(x - 10 + hh(i, 41) * 20, y0 - 4 - hh(i, 42) * 10, 2, 2, 'rgba(220,240,232,0.85)');
      }
    } finally { c = pv; }
  }
  // --- vòm thân (Vòng thân) ---
  function veVom(cx, o) {
    const v = o.v, b = o.b;
    if (!b || b.dead || !b.tl || !b.tl.vom.includes(v)) { o.dead = true; return; }
    const pv = c; c = cx;
    try {
      const t = G.time || 0, M = mauB(b), up = clamp((t - v.t0) / 0.25, 0, 1);
      const siet = v.siet ? clamp((t - v.siet) / 0.3, 0, 1) : 0, rw = v.rx * (1 - 0.6 * siet), h = 26 * up * (1 - 0.7 * siet);
      buou(v.x, v.y, rw, h, M, t, v.x);
      if (b.exposed > 0 && Math.floor(t * 6) % 2) for (const s of [-1, 1]) E(v.x + s * rw, v.y - 2, 2, 2, M.sang);
    } finally { c = pv; }
  }
  if (G.roomArt) { const ls0 = G.roomArt.lopSan; G.roomArt.lopSan = function (cx, w, room, t) { if (ls0) ls0.apply(this, arguments); try { veSan(cx, w, t); } catch (e) { if (!TL.loiVe) { TL.loiVe = e; if (window.console) console.warn('thuong_luong', e); } } }; }
  const prop0 = A.prop;
  A.prop = function (cx, o) {
    if (!o || (o.type !== 'tlThan' && o.type !== 'tlVom')) return prop0.apply(this, arguments);
    try { if (o.type === 'tlThan') veThan(cx, o); else veVom(cx, o); } catch (e) { if (!TL.loiVe) { TL.loiVe = e; if (window.console) console.warn('thuong_luong', e); } }
  };
  // --- đầu: ảnh mượn nhuộm theo hệ, bọt nước quanh chỗ trồi, mảnh trống trên trán sáng khi lộ điểm yếu ---
  const boss0 = A.boss;
  A.boss = function (cx, b) {
    if (!b || b.kind !== 'thuong' || b.illusion || !b.tl) return boss0.apply(this, arguments);
    const t = G.time || 0, M = mauB(b), pv = c;
    if (b.tl.lan && b.dying == null) { // đang lặn: chỉ thấy gợn nước + vây lưng rẽ nước chạy dọc mép phải
      c = cx;
      try {
        for (let i = 0; i < 3; i++) { const r = 8 + ((t * 30 + i * 9) % 26); E(b.x, b.y + 2, r, r * 0.3, 'rgba(220,240,232,' + (0.5 - r / 70).toFixed(2) + ')'); }
        for (let i = 0; i < 4; i++) R(b.x - 6 + i * 3, b.y - 4 - (i % 2) * 3, 2, 4 + (i % 2) * 3, M.vay);
      } finally { c = pv; }
      return;
    }
    c = cx;
    try {
      if (b.dying == null) { E(b.x, b.y + 2, 30, 8, 'rgba(8,20,22,0.55)'); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; E(b.x + Math.cos(a) * 28, b.y + 2 + Math.sin(a) * 7, 3, 1.2, 'rgba(220,240,232,0.6)'); } }
    } finally { c = pv; }
    const V4 = G.vung4, dv = V4 ? V4.dangVe : false, nh = b.tl.nhuom && 'filter' in cx;
    let f0 = null;
    if (nh) { f0 = cx.filter; cx.filter = NHUOM[b.el] || 'none'; if (V4) V4.dangVe = false; }
    try { boss0.apply(this, arguments); } finally { if (nh) { cx.filter = f0; if (V4) V4.dangVe = dv; } }
    if (b.dying == null && !b.hidden) {
      c = cx;
      try {
        const x = b.x - 8, y = b.y - (b.h || 100) * 0.62, lo = b.exposed > 0;
        if (lo) E(x, y, 9 + Math.sin(t * 10) * 1.5, 7, 'rgba(255,214,120,0.35)');
        E(x, y, 4.5, 3.5, lo ? '#ffd27a' : '#a8743a'); R(x - 1, y - 1, 2, 2, lo ? '#fff3b0' : '#d8a050');
      } finally { c = pv; }
    }
  };
})();
