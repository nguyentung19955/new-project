// TURRET MERGE — KHUNG JACKPOT + 10 CƠ CHẾ ĐẶC BIỆT (tư vấn ChatGPT 07/11, người dùng duyệt 18:44 — docs/demo-hop-tuong/tuvan/tu-van-game/TOM-TAT.md)
//  · Jackpot = cú bùng NGẮN (8–15 s) do làm được việc khó; thưởng chỉ cho ụ NHẬN (không cả bàn). Mỗi jackpot hồi chiêu riêng, phải kiếm lại điều kiện.
//  · CỘNG GỘP (người dùng duyệt): +% sát thương / +% tốc / +% ST chí mạng của jackpot vào CHUNG nhóm với hỗ trợ, cộng dồn, đột phá (T.buf.dmg / toc / cdmg),
//    rồi mới nhân nhóm với nhau (ST × tốc × chí mạng). Không trần (tỉ lệ chí mạng ≤ 100%). RAGE ×2 / suy yếu quái / bản sao −% vẫn là hệ số nhân riêng.
//  · TẤT ĐỊNH: điều kiện chỉ đọc trạng thái bàn + G.t (không Math.random); túi Pandora xáo bằng rngHat(hạt trận + bàn + chu kỳ).
//    Hiệu ứng hình (nổ ≤ 0,45 s, lấp lánh trạng thái) KHÔNG đổi luật. Online: bàn con rối tự suy ra từ các lần ghép phát lại (chỉ hình);
//    Pandora gửi kèm dấu ROYAL VAULT trong gói ghép (B._pd chứa 6).
//  · Ụ ĐÁ / BĂNG: không góp vào điều kiện, không nhận thưởng. Bản sao Copycat: là ụ mới — KHÔNG chép tiến độ / thưởng jackpot đang chạy.
//  · PVP / CO-OP: chỉ bàn của chính mình (không đụng bàn đối thủ / đồng đội).
//  · Nhật ký đo nhịp: G.jpLog [{ t, w, ban, id }] (tools/thap-sim-jackpot.js).
// Nạp SAU skills7.js (index.html). Ụ thiếu (công cụ không nạp skills7) → bỏ qua cơ chế đó.
'use strict';

const JP = {
  // id → ụ, độ khó, thưởng (+% ST, +% tốc, +ST chí mạng), giây, hồi chiêu (giây, tính từ lúc HẾT tác dụng trừ khi hoiTuLuc)
  DS: {
    masterwork: { u: 'loren', ten: 'MASTERWORK', kho: 5, dmg: 2.4, toc: 0.85, cdmg: 1.5, song: 15, hoi: 90, hoiTuLuc: true, mau: '#ffd23f' },
    cascade: { u: 'orbital', ten: 'ORBITAL CASCADE', kho: 3, dmg: 1.0, toc: 0.45, cdmg: 0.6, song: 10, hoi: 45, hoiTuLuc: true, mau: '#9fe6ff' },
    heist: { u: 'bienmau', ten: 'CHROMATIC HEIST', kho: 4, dmg: 1.6, toc: 0.65, cdmg: 1.2, song: 10, hoi: 30, mau: '#ffffff' },
    reactor: { u: 'lienket', ten: 'CHAIN REACTOR', kho: 4, dmg: 1.5, toc: 0.6, cdmg: 0.9, song: 12, hoi: 40, mau: '#d9a8ff' },
    eclipse: { u: 'mauhut', ten: 'BLOOD ECLIPSE', kho: 4, dmg: 1.8, toc: 0.7, cdmg: 1.1, song: 11, hoi: 30, mau: '#ff4a6a' },
    truenorth: { u: 'canon', ten: 'TRUE NORTH', kho: 3, dmg: 1.1, toc: 0.45, cdmg: 0.7, song: 12, hoi: 30, mau: '#ffb35a' },
    chorus: { u: 'hopca', ten: 'GRAND CHORUS', kho: 4, dmg: 1.6, toc: 0.6, cdmg: 1.1, song: 12, hoi: 50, mau: '#d9b8ff' },
    royal: { u: 'pandora', ten: 'ROYAL VAULT', kho: 5, dmg: 2.2, toc: 0.85, cdmg: 1.5, song: 15, hoi: 0, mau: '#ffe46b' },
    loaded: { u: 'xucxac', ten: 'LOADED DICE', kho: 3, dmg: 0, toc: 0.7, cdmg: 0.8, song: 8, hoi: 30, mau: '#ffd23f' },
    frequency: { u: 'radar', ten: 'PERFECT FREQUENCY', kho: 4, dmg: 0.85, toc: 0.5, cdmg: 0.9, song: 10, hoi: 50, mau: '#ffb43a' },
  },
  // số phụ (LV9)
  MW_CUA: 75, MW_TRUM: 8,                 // Masterwork: cửa sổ 75 s cho đủ 1★+2★+3★ · đòn đầu vào mỗi trùm +800% D9
  OC_BOM: 4, OC_K: 1.8, OC_SAO: 2,        // Orbital Cascade: 4 bom × 180% mỗi Vệ Tinh · chỉ ghép Vệ Tinh ≥ 2★ mới tính (mô phỏng: 1★ kích từ wave 6)
  HE_CUA: 60,                             // Chromatic Heist: ĐỎ → VÀNG → XANH trong 60 s
  CR_NHOM: 4, CR_CUA: 5, CR_DON: 3, CR_U: 3, CR_MOI: 6, CR_K: 2.5, // Chain Reactor
  BE_VAMP: 6, BE_CUA: 25, BE_XUNG: 3, BE_K: 3, // Blood Eclipse
  TN_CUA: 45, TN_LAN: 3, TN_SO: 6, TN_K: 6, // True North
  GC_U: 6, GC_TC: 3, GC_GIU: 10, GC_SAO: 3, // Grand Chorus (đội hình ≥ 3★ — mô phỏng: 1★ kích ngay wave 2)
  RV_MANA: 100,                           // Royal Vault
  LD_LAN: 12, LD_PHAT: 6, LD_SAO: 3,      // Loaded Dice (Pháo ≥ 3★ — mô phỏng: 1★ kích từ wave 1, 20 lần/trận)
  PF_GIU: 8, PF_LOAI: 3, PF_SAO: 3,       // Perfect Frequency (Radar ≥ 3★ — mô phỏng: kích từ wave 6)
  dang: (T, id) => !!(T && T.jp && T.jp[id] && T.jp[id].het > G.t),
  gt(T, k) { let v = 0; if (T && T.jp) for (const id in T.jp) { const e = T.jp[id]; if (e.het > G.t) v += e[k] || 0; } return v; }, // tổng +% của jackpot đang chạy trên ụ (nhóm k)
  khoa: (T) => !T || biKhoa(T),
  laTC: (T) => !!(T && SKILLS[T.id] && SKILLS[T.id].vai === 'tc'),
  // ụ Tấn công sao cao nhất (hoà: ô nhỏ nhất), không đá/băng
  tcCao(B) { let m = null; for (const X of B.t) if (X && this.laTC(X) && !this.khoa(X) && (!m || X.sao > m.sao)) m = X; return m; },
  goc(T) { const B = G.ban[T.ban]; return hsU(T.id, T.sao, B) * (B && B.cuong > 0 ? 2 : 1); }, // D9: sát thương 1 phát không buff (RAGE ×2 vẫn áp — luật "mọi nguồn")
  cd(B, k) { return ((B.jpCd || {})[k]) || 0; },
  // KÍCH HOẠT: ds = ụ nhận · nguon = ụ châm ngòi (chỗ hiện tên) · k = khoá hồi chiêu (mặc định id)
  kich(B, id, ds, nguon, k) {
    const d = this.DS[id]; k = k || id;
    if (G.t < this.cd(B, k)) return false;
    ds = (ds || []).filter(X => X && B.t[X.o] === X && !this.khoa(X));
    if (!ds.length) return false;
    for (const X of ds) { X.jp = X.jp || {}; X.jp[id] = { het: G.t + d.song, t0: G.t, dmg: d.dmg, toc: d.toc, cdmg: d.cdmg, k }; }
    (B.jpCd || (B.jpCd = {}))[k] = G.t + (d.hoiTuLuc ? d.hoi : d.song + d.hoi);
    (G.jpLog || (G.jpLog = [])).push({ t: Math.round(G.t * 10) / 10, w: G.wave, ban: B.i, id });
    this.hien(B, id, ds, nguon || ds[0]);
    return true;
  },
  // kết thúc sớm (Loaded Dice hết 6 phát, Radar bị khoá) — hồi chiêu tính từ lúc này
  tat(B, X, id) { const e = X && X.jp && X.jp[id]; if (!e || e.het <= G.t) return; const d = this.DS[id]; e.het = G.t; if (!d.hoiTuLuc) B.jpCd[e.k] = Math.min(B.jpCd[e.k] || 0, G.t + d.hoi); },
  // ---- trình bày (không đổi luật): nổ fx_awaken tô màu ≤ 0,42 s trên ụ nhận (tối đa 4) + tên 1 lần ở ụ châm ngòi ----
  hien(B, id, ds, nguon) {
    const d = this.DS[id];
    try {
      for (const X of ds.slice(0, 4)) { const c = B.o[X.o]; if (c) G.hu.push({ k: 'jpNo', t: 0, song: 0.42, x: c.x, y: c.y, w: Math.min(B.cw, B.ch) * 1.5, mau: d.mau }); }
      const c = nguon && B.o[nguon.o]; if (c && typeof FX !== 'undefined') FX.chu1(c.x, c.y - Math.min(B.cw, B.ch) * 0.55, d.ten, d.mau, 13, 'to');
      if (!G.hu.some(o => o.k === 'jpVe')) G.hu.push({ k: 'jpVe', t: 0, song: 1e12 });
      if ((!B.ai || G.che === 'pvp') && typeof SND !== 'undefined' && SND.thucTinh) { if (SND.jackpot) SND.jackpot(); else SND.thucTinh(); } // v4: âm jackpot riêng
    } catch (e) { }
  },
  // tiến độ cho tấm đếm (DEMKN): [n, N] hoặc null
  tienDo(T, B) {
    const P = (x, n, N) => (x ? [n, N] : null);
    switch (T.id) {
      case 'loren': { const g = T.mw || {}, n = [1, 2, 3].filter(s => g[s] != null && G.t - g[s] <= this.MW_CUA).length; return P(n > 0, n, 3); }
      case 'orbital': { const o = B.jpOrb; return P(o && o.n > 0 && G.t - o.t0 < SKILLS.orbital.dai(B), o && o.n, 2); }
      case 'bienmau': { const o = B.jpPr; return P(o && o.n > 0 && G.t - o.t0 <= this.HE_CUA, o && o.n, 3); }
      case 'mauhut': { const o = B.jpBE; return P(o && G.t - o.t <= this.BE_CUA, 1, 2); }
      case 'canon': { const o = B.jpTN; return P(o && o.n > 0 && G.t - o.t0 <= this.TN_CUA, o && o.n, 3); }
      case 'hopca': { const o = B.jpGC && B.jpGC[T.sao]; return P(o && !o.xong, o && Math.min(this.GC_GIU, Math.floor(G.t - o.t0)), this.GC_GIU); }
      case 'pandora': { const n = 6 - ((B.pdTui && B.pdTui.length) || 6); return P(B.pdTui && n > 0, n, 6); }
      case 'xucxac': { const s = new Set((T.ldH || []).filter(b => b >= 0)); return P(s.size > 0 && G.t >= this.cd(B, 'loaded' + T.uid), s.size, 3); }
      case 'radar': return P(T.pfT > 0, Math.floor(T.pfT || 0), this.PF_GIU);
    }
    return null;
  },
};

// ---------- 1) MASTERWORK (Scrap Forge) — BỎ 08/11: Lò Rèn làm lại thành Twin Anvil (skills4.js), không còn ăn 1–3★.

// ---------- 2) ORBITAL CASCADE — 2 lần ghép Vệ Tinh + Vệ Tinh trong CÙNG cửa sổ thức tỉnh 23 s (ghép thêm không kéo dài hạn) → mọi Vệ Tinh +100% / +45% / +60 10 s + 4 bom × 180%. 45 s.
if (SKILLS.orbital) {
  const S = SKILLS.orbital, gh = S.ghep, bom = S.bomDmg, nh = S.nhip;
  S.bomDmg = function (B, T) { return bom.apply(this, arguments) * (1 + JP.gt(T, 'dmg')); }; // Vệ Tinh không dùng T.buf: chỉ phần jackpot
  S.nhip = function (T) { return nh.apply(this, arguments) / (1 + JP.gt(T, 'toc')); };
  S.ghep = function (G, B, a, b, ra) {
    const cung = a && b && a.id === 'orbital' && b.id === 'orbital' && a.sao >= JP.OC_SAO, r = gh.apply(this, arguments), dai = S.dai(B);
    let o = B.jpOrb;
    if (!o || G.t - o.t0 >= dai) o = B.jpOrb = { t0: G.t, n: 0 };
    if (cung) o.n++;
    if (o.n >= 2) {
      const ds = B.t.filter(X => X && X.id === 'orbital' && !JP.khoa(X));
      if (JP.kich(B, 'cascade', ds, B.t[b.o] || ra)) {
        B.jpOrb = null;
        const qs = dsMucTieu(B).filter(E => !E.chet).sort((p, q) => q.hp - p.hp || p.uid - q.uid);
        if (qs.length) for (const X of ds) for (let i = 0; i < JP.OC_BOM; i++) { const E = qs[i % qs.length]; G.hu.push({ k: 'vetinh', t: -0.25 - i * 0.1, song: 0.6, E, x: E.x, y: E.y, dmg: bom.call(S, B, X) * JP.OC_K, r: 34, B, da: false, vang: 1 }); }
      }
    }
    return r;
  };
}

// ---------- 3) CHROMATIC HEIST — BỎ 08/11: Prism Thief làm lại, combo mới = CHROMATIC CIRCUIT (vuốt 4 màu, skills7.js).

// ---------- 5) BLOOD ECLIPSE — BỎ 08/11: Blood Circuit làm lại (đánh dấu → nuốt → Máu → Blood Rite, skills7.js). HU.jpXung giữ cho bản cũ đang chạy.
HU.jpXung = { // 3 xung máu xuyên cả làn của mình (0,5 / 1,5 / 2,5 s), mỗi quái trúng 1 lần mỗi xung — xét theo uid (tất định)
  cap(G, o) {
    while (o.n < JP.BE_XUNG && o.t >= 0.5 + o.n) {
      o.n++; const B = o.B, T = o.T; if (!B || !T) return true;
      const dmg = JP.goc(T) * JP.BE_K, ds = dsMucTieu(B).filter(E => !E.chet).sort((p, q) => p.uid - q.uid);
      for (const E of ds) trung(E, dmg, { B, T, phu: true, mau: '#ff4a6a' });
      for (const E of ds.slice(0, 6)) FX.no('no_phao', E.x, E.y, 40, 0.25);
    }
    return o.t >= o.song;
  },
  ve() { },
};

// ---------- 6) TRUE NORTH — Pháo La Bàn: 3 lần ghép CÙNG mũi tên trong 45 s, không ghép ngược xen giữa, số kết quả ≥ 6 → mọi Pháo La Bàn +110% / +45% / +70 12 s + 1 phát xuyên × 600%.
if (SKILLS.canon && SKILLS.canon.ghepDB) {
  const S = SKILLS.canon, lam = S.ghepDB.lam;
  S.ghepDB.lam = function (G, B, a, b) {
    const kq = a && b ? S.ketQua(a, b) : null;
    const r = lam.apply(this, arguments);
    if (kq && kq.kieu === 'tru') B.jpTN = null; // ghép ngược hướng xen giữa → mất chuỗi
    else if (kq && kq.kieu === 'cong') {
      let o = B.jpTN; if (!o || G.t - o.t0 > JP.TN_CUA) o = { t0: G.t, n: 0 };
      o.n++; B.jpTN = o;
      if (o.n >= JP.TN_LAN && S.so(b) >= JP.TN_SO && JP.kich(B, 'truenorth', B.t.filter(X => X && X.id === 'canon'), b)) {
        B.jpTN = null;
        const E = S.mucTieu(B, b, S.huong(b)) || quaiDau(B);
        if (E) { // phát xuyên vàng: mọi quái trên đường thẳng từ ụ qua mục tiêu (kéo dài tới 600 px)
          const c = B.o[b.o], vx = E.x - c.x, vy = E.y - c.y, L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, dmg = JP.goc(b) * JP.TN_K, ds = [];
          for (const M of dsMucTieu(B)) { if (M.chet) continue; const u = (M.x - c.x) * ux + (M.y - c.y) * uy; if (u < 0 || u > 600) continue; const px = c.x + ux * u - M.x, py = c.y + uy * u - M.y; if (px * px + py * py <= (18 + M.d.co * 0.25) ** 2) ds.push(M); }
          ds.sort((p, q) => p.uid - q.uid); for (const M of ds) trung(M, dmg, { B, T: b, phu: true, mau: '#ffb35a' });
          G.hu.push({ k: 'tiaTia', t: 0, song: 0.3, x0: c.x, y0: c.y, x1: c.x + ux * 600, y1: c.y + uy * 600, mau: '#ffd23f' });
        }
      }
    }
    return r;
  };
}

// ---------- 8) SIX SEALS — Pandora: túi xáo 6 phép (mỗi chu kỳ ra đủ 6, không lặp; thứ tự theo hạt giống) · lần mở thứ 6 thêm ROYAL VAULT:
//      ụ Tấn công sao cao nhất +220% / +85% / +150 15 s + 100 mana. 6★ / 7★ rút thêm từ cùng túi (mỗi lần rút mở 1 dấu ấn).
JP.layTui = function (B) {
  if (!B.pdTui || !B.pdTui.length) {
    B.pdChu = (B.pdChu || 0) + 1;
    const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1, r = rngHat(hat * 4219 + B.i * 131 + B.pdChu * 7919), a = [0, 1, 2, 3, 4, 5];
    for (let i = 5; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    B.pdTui = a;
  }
  const i = B.pdTui.shift();
  return { i, het: B.pdTui.length === 0 };
};
JP.royal = function (B, c) {
  const X = JP.tcCao(B);
  B.mana += JP.RV_MANA; B.manaNay = (B.manaNay || 0) + JP.RV_MANA;
  if (c && typeof FX !== 'undefined') FX.chu1(c.x, c.y - 30, '+' + JP.RV_MANA, '#58D9AD', 16, 'mana');
  if (X) JP.kich(B, 'royal', [X], X);
};

// ---------- 9) ĐỘT PHÁ theo độ khó: vangmoi1.js DOTPHA.KHO / BANG (bảng GPT: khó 3 = mốc cũ; khó 2 −20%; khó 4 / 5 cao hơn)

// ---------- 10a) LOADED DICE — Pháo May Rủi: 12 phát liên tiếp có đủ 3 dải (3–100 / 101–200 / 201–300%, phát chí mạng không tính) → 6 phát kế đúng 300%, +70% tốc, +80 STCM (≤ 8 s). Hồi 30 s.
JP.xucxac = function (B, T, roll, crit) { // gọi từ SKILLS.xucxac.ban SAU khi quay (skills2.js) — roll đã ép 300 khi đang LOADED
  if (JP.dang(T, 'loaded')) { T.ldN = (T.ldN || 0) - 1; if (T.ldN <= 0) JP.tat(B, T, 'loaded'); return; }
  if (G.t < JP.cd(B, 'loaded' + T.uid) || T.sao < JP.LD_SAO) { T.ldH = []; return; }
  const h = T.ldH || (T.ldH = []);
  h.push(crit ? -1 : roll <= 100 ? 0 : roll <= 200 ? 1 : 2); if (h.length > JP.LD_LAN) h.shift();
  if (h.includes(0) && h.includes(1) && h.includes(2) && JP.kich(B, 'loaded', [T], T, 'loaded' + T.uid)) { T.ldH = []; T.ldN = JP.LD_PHAT; }
};

// ---------- mỗi bước bàn: CHAIN REACTOR (4) · GRAND CHORUS (7) · PERFECT FREQUENCY (10b) · Radar bị khoá → tắt sớm
JP.tick = function (B, dt) {
  if (!B || !B.t) return;
  // 4) CHAIN REACTOR — nhóm ≥ 4 Chain Link nối thẳng; trong 5 s có ≥ 3 ụ khác nhau MỖI ụ trúng 3 đòn trực tiếp → cả nhóm +150% / +60% / +90 12 s; mỗi 6 đòn: tia sét × 250%. Hồi 40 s / nhóm.
  if (SKILLS.lienket) {
    const da = new Set();
    for (const T of B.t) {
      if (!T || T.id !== 'lienket' || JP.khoa(T) || da.has(T)) continue;
      const nh = [T], q = [T]; da.add(T);
      while (q.length) { const X = q.pop(); for (const N of keCan(B, X.o)) if (N && N.id === 'lienket' && !JP.khoa(N) && !da.has(N)) { da.add(N); nh.push(N); q.push(N); } }
      if (nh.length < JP.CR_NHOM) continue;
      const du = nh.filter(X => X.crH && X.crH.length >= JP.CR_DON && G.t - X.crH[X.crH.length - JP.CR_DON] <= JP.CR_CUA).length;
      if (du >= JP.CR_U && nh.every(X => !(X.crCd > G.t))) {
        nh.sort((p, q2) => p.o - q2.o);
        if (JP.kich(B, 'reactor', nh, nh[0], 'reactor' + nh[0].uid)) { const d = JP.DS.reactor; for (const X of nh) { X.crCd = G.t + d.song + d.hoi; X.crH = []; } }
      }
    }
  }
  // 7) GRAND CHORUS — BỎ 08/11: Quantum Choir làm lại thành HARMONY (ụ kề cùng sao, vangmoi1.js).
  // 10b) PERFECT FREQUENCY — Radar có đủ 4 ô thẳng là ụ Tấn công, ≥ 3 loại, giữ liên tục 8 s → 4 ụ đó +85% / +50% / +90 10 s. Radar bị khoá/câm → tắt sớm. Hồi 50 s / Radar.
  if (SKILLS.radar) for (const T of B.t) {
    if (!T || T.id !== 'radar') continue;
    const khoa = JP.khoa(T) || T.st.cam > 0;
    if (T.pfDs && khoa) { for (const X of T.pfDs) JP.tat(B, X, 'frequency'); T.pfDs = null; }
    const ke = keCan(B, T.o);
    const ok = !khoa && T.sao >= JP.PF_SAO && ke.length === 4 && ke.every(N => N && JP.laTC(N) && !JP.khoa(N)) && new Set(ke.map(N => N.id)).size >= JP.PF_LOAI;
    T.pfT = ok && G.t >= JP.cd(B, 'frequency' + T.uid) ? (T.pfT || 0) + dt : 0;
    if (T.pfT >= JP.PF_GIU && JP.kich(B, 'frequency', ke, T, 'frequency' + T.uid)) { T.pfT = 0; T.pfDs = ke; }
  }
};

// ---------- móc chung ----------
{
  // thưởng jackpot đang chạy → CHUNG nhóm cộng với mọi nguồn (đặt sau khi buff được đặt lại mỗi khung, cùng chỗ mốc sao chung / ô anh hùng)
  const _mocBufJP = mocBuf;
  mocBuf = function (B) {
    const r = _mocBufJP.apply(this, arguments);
    if (B && B.t) for (const T of B.t) if (T && T.jp) {
      for (const id in T.jp) {
        const e = T.jp[id]; if (e.het <= G.t) { delete T.jp[id]; continue; }
        if (CONG_GOP) { T.buf.dmg += e.dmg; T.buf.toc += e.toc; T.buf.cdmg = (T.buf.cdmg || 0) + e.cdmg; } // (CONG_GOP=false: chỉ để ĐO kiểu cũ — game.js nhân riêng)
      }
    }
    return r;
  };
  const _capNhatBanJP = capNhatBan;
  capNhatBan = function (B, dt) { const r = _capNhatBanJP.apply(this, arguments); try { JP.tick(B, dt); } catch (e) { if (G.debug && G.debug.nem) throw e; } return r; };
  // trúng đòn: Masterwork +800% D9 đòn đầu vào mỗi trùm · Chain Reactor ghi đòn trực tiếp + tia sét mỗi 6 đòn
  const _trungJP = trung;
  trung = function (E, dmg, o) {
    const T = o && o.T !== undefined ? o.T : G.dangBan, truc = !!(T && T.id === 'lienket');
    if (T && !(o && o.phu) && E && !E.chet && T.jp && JP.dang(T, 'masterwork') && E.trum) {
      const e = T.jp.masterwork, s = e.trum || (e.trum = []);
      if (!s.includes(E.uid)) { s.push(E.uid); dmg += JP.goc(T) * JP.MW_TRUM; }
    }
    const r = _trungJP.apply(this, [E, dmg, o]);
    if (truc && T.id === 'lienket' && !(o && o.phu)) {
      const h = T.crH || (T.crH = []); h.push(G.t); if (h.length > JP.CR_DON) h.shift();
      if (JP.dang(T, 'reactor')) {
        const B = G.ban[T.ban]; B.crN = (B.crN || 0) + 1;
        if (B.crN % JP.CR_MOI === 0) {
          let Q = null, best = 1e9; for (const X of dsMucTieu(B)) if (X !== E && !X.chet) { const d = Math.hypot(X.x - E.x, X.y - E.y) + X.uid * 1e-6; if (d < best) { best = d; Q = X; } }
          if (Q) { trung(Q, JP.goc(T) * JP.CR_K, { B, T, phu: true, mau: '#d9a8ff' }); G.hu.push({ k: 'set', t: 0, song: 0.22, x: E.x, y: E.y, ds: [{ Q, x: Q.x, y: Q.y }], seed: (E.uid * 97) % 999 }); }
        }
      }
    }
    return r;
  };
  const _batDauJP = batDau;
  batDau = function () { G.jpLog = []; return _batDauJP.apply(this, arguments); };
}

// ---------- hình (CHỈ trình bày): nổ kích hoạt + 1 lấp lánh trạng thái ở góc ô khi jackpot đang chạy ----------
HU.jpNo = { // fx_awaken (dải 6 khung) tô màu jackpot, phóng 0,8 → 1,25 ô trong 0,42 s rồi tắt
  cap(G, o, dt) { return o.t >= o.song; },
  ve(ctx, o) {
    const im = typeof REN !== 'undefined' && REN.toMau ? REN.toMau('fx_awaken', o.mau) : null; if (!im || !im.width) return;
    const p = Math.min(1, o.t / o.song), n = 6, fw = im.width / n, fh = im.height, f = Math.min(n - 1, Math.floor(p * n)), w = o.w * (0.8 + 0.45 * p);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = p < 0.7 ? 1 : (1 - p) / 0.3;
    ctx.drawImage(im, f * fw, 0, fw, fh, o.x - w / 2, o.y - w / 2, w, w); ctx.restore(); ctx.globalAlpha = 1;
  },
};
HU.jpVe = { // mọi bàn (solo / co-op / pvp / online): ụ đang có jackpot → 1 lấp lánh PNG (fx_tia_sao tô màu) ở góc trên-trái ô, mờ dần 2 s cuối
  cap(G, o) { return false; },
  ve(ctx, o) {
    if (typeof PX === 'undefined') return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const B of G.ban) if (B && B.t) for (const T of B.t) {
      if (!T || !T.jp) continue; let e = null, id0 = null;
      for (const id in T.jp) if (T.jp[id].het > G.t && (!e || T.jp[id].het > e.het)) { e = T.jp[id]; id0 = id; }
      if (!e) continue;
      const c = B.o[T.o]; if (!c) continue;
      const s = Math.min(B.cw, B.ch), con = e.het - G.t, a = Math.min(1, con / 2) * (0.75 + 0.25 * Math.sin(G.t * 5 + T.o));
      PX.sao(ctx, c.x - s * 0.33, c.y - s * 0.33, s * 0.4, JP.DS[id0].mau, a, G.t * 0.8); // góc TRÊN-TRÁI (trên-phải là huy hiệu sao)
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
};

// ---------- chữ thẻ (EN; bản Việt: docs/demo-hop-tuong/tuvan/ngonngu/vi.json) — số lấy từ JP.DS (khớp luật) ----------
JP.CHU = {
  orbital: (d) => 'ORBITAL CASCADE: 2 Orbital merges (2+ stars) inside one awakening → every Orbital +' + d.p + '% damage, +' + d.t + '% fire rate, +' + d.c + '% crit dmg ' + d.s + 's + 4 bombs ×180% each (45s cooldown)',
  lienket: (d) => 'CHAIN REACTOR: a chain of 4+ where 3 links each land 3 hits within 5s → the chain +' + d.p + '% damage, +' + d.t + '% fire rate, +' + d.c + '% crit dmg ' + d.s + 's, every 6th hit fires a bolt ×250% (40s cooldown)',
  canon: (d) => 'TRUE NORTH: 3 same-arrow merges within 45s (no opposite merge between), number 6+ → every Compass Cannon +' + d.p + '% damage, +' + d.t + '% fire rate, +' + d.c + '% crit dmg ' + d.s + 's + 1 piercing shot ×600%',
  radar: (d) => 'PERFECT FREQUENCY (3+ stars): 4 Attack neighbours of 3+ types held 8s → those 4 +' + d.p + '% damage, +' + d.t + '% fire rate, +' + d.c + '% crit dmg ' + d.s + 's (50s cooldown)',
};
{
  const ID = { loren: 'masterwork', orbital: 'cascade', bienmau: 'heist', lienket: 'reactor', mauhut: 'eclipse', canon: 'truenorth', hopca: 'chorus', radar: 'frequency' };
  for (const u in JP.CHU) {
    const sk = SKILLS[u]; if (!sk || !sk.mo) continue;
    const mo = sk.mo, d0 = JP.DS[ID[u]], d = { p: Math.round(d0.dmg * 100), t: Math.round(d0.toc * 100), c: Math.round(d0.cdmg * 100), s: d0.song };
    sk.mo = function (T) { const s = mo.apply(this, arguments); return s + ' · ' + JP.CHU[u](d); };
  }
}

// ---------- tấm đếm (DEMKN): thêm tiến độ jackpot (icon sao + n/N) ----------
if (typeof addEventListener === 'function') addEventListener('DOMContentLoaded', () => {
  if (typeof DEMKN === 'undefined') return;
  for (const id of ['orbital', 'canon', 'pandora', 'xucxac', 'radar']) {
    const f = DEMKN.DS[id];
    DEMKN.DS[id] = function (T, B) {
      const v = f ? f.apply(this, arguments) : null, p = JP.tienDo(T, B);
      if (!p) return v;
      const m = (v && v.m ? v.m.slice(0, 1) : []).concat([{ ic: 'ic_sao', s: p[0] + '/' + p[1] }]);
      return Object.assign({}, v || {}, { m });
    };
  }
});
