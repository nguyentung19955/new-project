// TURRET MERGE — 4 Ụ VÀNG MỚI ĐỢT 1 (docs/demo-hop-tuong/tuvan/tuong_vang/CHATGPT-PLAN.txt §3, người dùng duyệt 06/11):
//   P1 Ember Relay (lualien, Kalaratri) · P2 Quantum Choir (hopca, Cosmem) · P4 Fusion Archive (luutru, Aurora) · P5 Hero Foundry (xuonganh, Kintia)
// Cấp thẻ bắt đầu LV9 (bậc vàng). % kỹ năng theo cấp thẻ: VM1.lv(T) = 9 + số cấp đã lên (B.capThe). Nạp SAU skills5.js, TRƯỚC hotro.js.
// Online co-op: mọi ngẫu nhiên lấy từ rngHat (hạt giống phòng + ô + số lần); cờ cộng dồn gửi kèm ảnh chụp ô (dongbo.js oTT/datO).
// Ảnh: đầu/chân dung/hiệu ứng là ảnh ChatGPT (CAN-VE-1.json); chưa có ảnh → mượn ảnh ụ khác (VM1.TAM) và ụ không vào bộ bài NGẪU NHIÊN.
'use strict';

const VM1 = {
  IDS: ['lualien', 'hopca', 'luutru', 'xuonganh'],
  // ảnh tạm (chưa có ảnh ChatGPT riêng): id → ụ cho mượn đầu/chân dung. Lắp ảnh xong thì xoá dòng đó.
  TAM: {}, // (đã lắp đầu + chân dung ChatGPT riêng cho cả 4 — 06/11)
  // dải hiệu ứng 16 khung (assets/fx_<id>_sk.png, 1 hàng) — có ảnh thì chơi, chưa có thì dùng ảnh v2 sẵn có
  FXN: 16,
  FXCO: new Set(['lualien', 'hopca', 'luutru', 'xuonganh']), // id đã có dải assets/fx_<id>_sk.png (thêm khi lắp ảnh)
  lv(T) { const B = G.ban[T.ban]; return THE.lvDau.vang + ((B && B.capThe && B.capThe[T.id]) || 0); },
  k(T) { return this.lv(T) - THE.lvDau.vang; },
  coAnh(id) { return !this.TAM[id]; },
  rng(B, a, b) { // ngẫu nhiên tất định (2 máy online ra như nhau): hạt giống trận + ô + số lần kích hoạt trên bàn
    B._vmN = (B._vmN || 0) + 1;
    const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1;
    return rngHat(hat * 7841 + B.i * 131 + (a | 0) * 977 + (b | 0) * 61 + B._vmN * 7919);
  },
  // vẽ khung f của dải hiệu ứng ụ (nếu ảnh đã có); trả false nếu chưa có ảnh
  fx(ctx, id, f, x, y, w, al) {
    if (!this.FXCO.has(id)) return false;
    const im = REN.img('fx_' + id + '_sk'); if (!im || !(im.complete && im.naturalWidth) && !im._cv) return false;
    const n = this.FXN, i = Math.max(0, Math.min(n - 1, Math.floor(f))), fw = (im.naturalWidth || im.width) / n, fh = im.naturalHeight || im.height;
    ctx.globalAlpha = al == null ? 1 : al;
    ctx.drawImage(im, i * fw, 0, fw, fh, x - w / 2, y - w * fh / fw / 2, w, w * fh / fw);
    ctx.globalAlpha = 1; return true;
  },
  pct: (v) => Math.round(v * 1000) / 10,
  // % kỹ năng theo cấp thẻ: bảng chung KY_NANG_CAP (data.js) — giá trị /100 ở cấp hiện tại và cấp kế
  kn(T, id) { return knGt(KY_NANG_CAP[id], this.k(T)) / 100; },
  knSau(T, id) { return knGt(KY_NANG_CAP[id], this.k(T) + 1) / 100; },
  chuLv(T, id, f) { const lv = this.lv(T); return 'LV' + lv + (lv < THE.maxLv('vang') ? ' → LV' + (lv + 1) + ': ' + f(this.knSau(T, id)) : ''); },
};
// mục kỹ năng theo cấp cho bảng chung — 08/11: Ember / Choir / Archive dùng trần + mốc riêng (không còn % theo cấp); Foundry: +3%/cấp (Đặc biệt)
Object.assign(KY_NANG_CAP, {
  xuonganh: { ten: 'Hero rate', base: 80, buoc: 2.4, max: 99.2, dv: '%', tien: '+', dmg: true },
});
// hiệu ứng 1 lần (dải 16 khung) tại (x,y) — chưa có ảnh: vòng mảnh PNG màu ụ
HU.vm1Fx = {
  cap(G, o, dt) { o.t += dt; return o.t >= o.song; },
  ve(ctx, o, R) {
    const p = o.t / o.song;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (!VM1.fx(ctx, o.id, p * VM1.FXN, o.x, o.y, o.w, 1 - Math.max(0, p - 0.8) * 5)) PX.vong(ctx, o.x, o.y, o.w * (0.2 + 0.3 * p), 3, o.mau, 1 - p);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
function vm1Fx(id, x, y, w, song, mau) { G.hu.push({ k: 'vm1Fx', t: 0, song: song || 0.8, id, x, y, w, mau }); }

// =====================================================================================================
// P1 · LỬA THẬP TỰ / EMBER RELAY (lualien) — Vàng TC. SỬA LUẬT 08/11 theo người dùng:
//      "ember phải cùng sao mới merge được 2 ụ ember, lửa truyền cho các ember cùng hàng cột = lửa ember A + ember C + ember được truyền";
//      "ember vì 1 lý do nào mà biến mất thì sẽ truyền lửa, còn vẫn ở đó như hoá đá, biến đổi thành 1 tướng khác do skill của ụ hoặc boss,
//       hoặc đóng băng thì không truyền lửa".
//      → LUẬT CHUNG (LUA_ROI, móc ở mức bàn — không theo từng kỹ năng): Ember RỜI BÀN vì bất kỳ lý do gì (bị ghép mất: Ember+Ember, Mimic, ụ đa năng,
//        ghép đặc biệt; Blood Circuit nuốt; bán / xoá; trùm phá…) → lửa của nó CỘNG vào MỌI Ember khác còn trên bàn ở cùng HÀNG + cùng CỘT với ô
//        CỦA CHÍNH NÓ: lửa X = min(trần X, lửa X + Σ lửa các Ember rời bàn cùng lúc có chung hàng/cột với X). Ember chung đường với cả A và C nhận cả 2.
//        Ghép A vào C cùng hàng/cột → Ember thứ 3 trên đường đó nhận A + C (đúng công thức người dùng). Mỗi Ember rời bàn chỉ góp 1 lần.
//        Không nhận: Ember cũng rời bàn trong cùng lượt, ụ đang đứng ở ô của Ember vừa rời (ụ kết quả ghép / ụ biến hình), Ember mới xuất hiện
//        trong cùng lượt (chưa có trên bàn lúc Ember kia rời), ô đá, ô BĂNG (09/11 Q5 = A: ụ khoá không nhận cộng dồn hàng/cột, như buff hỗ trợ).
//      KHÔNG truyền khi Ember VẪN Ở ĐÓ: hoá đá, đóng băng, bị biến thành ụ khác tại chỗ (trùm / kỹ năng / Joker King…), Teleporter đổi chỗ,
//        bị bắn trừ sao (haSao: trùm / Star Breaker; người dùng: "Cả bị súng bắn trừ sao cũng vậy") — giữ lửa. Trừ sao ở 1★ làm ụ VỠ (rời bàn) → truyền.
//        Nhận biết: Ember biến mất mà ô cũ còn ụ khác (không phải do ghép) = biến hình → không truyền; ô cũ trống hoặc Ember là nguyên liệu ghép = rời bàn.
//      SỬA 08/11 (người dùng: "A đang có 5 lửa thì nếu B có 5 lửa và C có 5 lửa thì merge vào truyền cho A 15 lửa"): Ember bị GHÉP mất (Ember+Ember,
//        Mimic, Wild Link, ghép đặc biệt) → lửa của nó truyền theo hàng/cột của Ô GHÉP (ô đích, nơi ụ ra xuất hiện), không theo ô cũ của nó.
//        Ghép B vào C (đều Ember): mọi Ember khác cùng hàng/cột với ô C nhận lửa B + lửa C (A = 5 + 5 + 5 = 15); mỗi lần ghép chỉ tính 1 lần.
//        Rời bàn đơn lẻ khác (bán, Blood Circuit nuốt, trùm phá, vỡ do trừ sao…): vẫn theo hàng/cột ô của chính nó.
//      Ghép Ember chỉ khi CÙNG SAO (luật ghép thường). Ụ ra (nếu bốc trúng Ember) = Ember MỚI, 0 LỬA (người dùng 08/11, game.js ghep; điều phối chốt lại 09/11) — triệu hồi / ụ mới khác vẫn lửa = ★.
//      Ụ mới sinh: lửa = số sao. TĂNG 08/11 (người dùng: "hơi ít nhỉ, so với các tướng vàng có cộng dồn" — lửa chỉ đến khi Ember RỜI BÀN = tốn kém
//        → thưởng cao): mỗi lửa +8% sát thương, +0.4 điểm % chí mạng (tổng ≤ 100%, critU), +4% ST chí mạng (cũ +2% / +0.12 / 0).
//        BỎ TRẦN lửa (cũ LV9 70 → LV15 160; người dùng không thích trần ở kỹ năng cộng dồn đặc biệt) — giữ màu mốc 10/30/50/70.
//        Đột phá độ khó 5 (cũ 3): I +25% tốc · II +50% STCM · III +45% ST · IV +15% chí mạng & +85% STCM. Đột phá 10/30/50/70.
//      Icon lửa theo mốc: <10 cam · ≥10 trắng · ≥30 xanh · ≥50 vàng · ≥70 đỏ (lua_t1–4). Online: bàn con rối (B.net) không tự truyền —
//      lửa đi theo cờ ô 'r' (dongbo.js) từ máy chủ bàn → 2 máy cùng số.
// =====================================================================================================
SKILLS.lualien = {
  // 09/11 (người dùng: "Lửa Thập Tự 260 lửa, 18k dame mà bắn không nổi" — phát to nhưng chậm, đơn mục tiêu): ST 17 → 24, tốc 1.0 → 1.5,
  //   lửa còn cho TỐC BẮN trần mềm: +TOC_MAX × n / (n + TOC_K) (10/11 người dùng chốt "tích lửa thì tăng tốc đánh": trần 200% → 300%, K 60 → 40 — 10 lửa +60%, 40 lửa +150%, 100 lửa +214%, 230 lửa +256%, không vượt +300%)
  vai: 'tc', dmg: 24, toc: 1.5, nham: 'dau', napMau: null,
  DMG: 0.08, CRIT: 0.004, CDMG: 0.04, TOC_MAX: 3.0, TOC_K: 40,
  tocLua(n) { return n > 0 ? this.TOC_MAX * n / (n + this.TOC_K) : 0; },
  tran(T) { return Infinity; }, // KHÔNG TRẦN (08/11) — giữ hàm cho chỗ gọi cũ
  bac: (n) => (n >= 70 ? 4 : n >= 50 ? 3 : n >= 30 ? 2 : n >= 10 ? 1 : 0),
  ICON: ['fx_cuuvi_dan', 'lua_t1', 'lua_t2', 'lua_t3', 'lua_t4'],
  icon(n) { return this.ICON[this.bac(n)]; },
  mo(T) {
    const n = Math.min(this.tran(T), T.lc || 0);
    return 'Flames ' + n + ' → +' + Math.round(n * this.DMG * 100) + '% damage, +' + +(n * this.CRIT * 100).toFixed(1) + '% crit chance, +' + Math.round(n * this.CDMG * 100) + '% crit damage, +' + Math.round(this.tocLua(n) * 100) + '% fire rate · each flame: +8% damage, +0.4% crit (crit max 100%), +4% crit damage, and flames raise fire rate (soft cap, max +' + Math.round(this.TOC_MAX * 100) + '%) · new Relays start with flames = ★ · Ember + Ember merged into an Ember: a NEW Ember with 0 flames · when an Ember leaves the board for any reason, its flames pass to Embers in its row and column · merging two Embers: every other Ember in the merge tile\'s row and column gains both Embers\' flames · Embers that stay (stone, frozen, transformed, lost a star) keep their flames · no flame limit';
  },
  sinh(G, T) { if (T.lc == null) T.lc = Math.min(this.tran(T), Math.max(1, T.sao | 0)); },
  capNhat(G, B, T) { const n = Math.min(this.tran(T), T.lc || 0); if (n) { T.buf.dmg += n * this.DMG; T.buf.crit += n * this.CRIT; T.buf.cdmg = (T.buf.cdmg || 0) + n * this.CDMG; T.buf.toc += this.tocLua(n); } return false; },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = chopNong(T, 22); SND.lien();
    const dmg = dmgU(T), nv = Math.min(8, ((T.lc || 0) / 10) | 0); // nv: chỉ cỡ hình
    banDan({ img: 'tia_lua', x, y, muc: E, px: E.x, py: E.y, sp: 600, co: 13 + nv * 0.7, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ff9a3a' }); FX.tiaLua(d.x, d.y, 2 + (nv >> 1), '#ff8a2a', 110, 6); } });
  },
  // ô cùng hàng + cùng cột với ô o (không gồm o), o tăng dần
  chuThap(o) { const c = o % 5, h = (o / 5) | 0, ds = []; for (let i = 0; i < 15; i++) if (i !== o && (i % 5 === c || ((i / 5) | 0) === h)) ds.push(i); return ds; },
  // tổng lửa của 1 lần ghép 2 Relay = lửa A + lửa C (thuần — tools/thap-kt-vang-g2.js); ụ ra nhận min(trần, tổng)
  tong(a, b, cap) { return Math.min(cap, (a.lc || 0) + (b.lc || 0)); },
  // (09/11 người dùng — Q1 = A + "A + A ra ụ ngẫu nhiên, dù ra A cũng không phải cùng 1 ụ"): ghép 2 Ember là GHÉP THƯỜNG → ụ ra (nếu bốc trúng Ember)
  //   là Ember MỚI, lửa = lúc sinh (= ★), KHÔNG lấy A + C. Lửa A + C chỉ truyền cho Ember KHÁC cùng hàng/cột ô ghép (LUA_ROI, 330d812a).
  veThem(ctx, T, S, al) { // 1 ngọn lửa nhỏ (màu theo mốc) lượn quanh đầu ụ — không vòng
    const n = T.lc || 0; if (!n) return;
    const im = REN.img(this.icon(n)) || REN.img('fx_cuuvi_dan'); if (!im) return;
    const t = (typeof REN.t === 'number' ? REN.t : G.t) * 1.6 + (T.o || 0), r = S * 0.4, w = S * 0.2;
    PX.ve(ctx, im, Math.cos(t) * r, Math.sin(t) * r * 0.55 - S * 0.06, w * 0.75, w, 0, al * 0.95);
  },
};
// EMBER RỜI BÀN → TRUYỀN LỬA (luật chung, xem đầu mục P1). So ảnh chụp Ember trên bàn (B._lr) trước/sau mỗi bước bàn (capNhatBan) và mỗi lần ghép.
const LUA_ROI = {
  chup(B) { const ds = []; for (let i = 0; i < 15; i++) { const T = B.t[i]; if (T && T.id === 'lualien') ds.push([T, i]); } B._lr = ds; },
  quet(B) {
    if (!B || !B.t) return;
    if (B.net) { B._lr = null; return; } // bàn con rối online: số lửa đến từ máy chủ bàn (cờ 'r')
    const cu = B._lr; this.chup(B); if (!cu || !cu.length) return;
    const con = new Set(B.t), roi = [];
    for (const [T, o] of cu) if (!con.has(T) && (!B.t[o] || T._gop)) roi.push([T, o, T._gop ? T._gopO : o]); // ô cũ còn ụ khác (không phải ghép) = biến hình tại chỗ → không truyền
    if (roi.length) this.truyen(B, roi, new Set(cu.map(r => r[0])));
  },
  // roi: [[Ember, ô cũ, ô nguồn]] rời bàn cùng lúc → mỗi Ember góp lửa của nó 1 lần cho mọi Ember khác cùng hàng/cột với Ô NGUỒN
  //   (ô nguồn = ô GHÉP nếu Ember bị ghép mất, còn lại = ô cũ của nó)
  // co: Ember đã có trên bàn lúc chụp trước (ụ vừa sinh / ụ ra của ghép trong cùng lượt không nhận); bỏ trống = mọi Ember trên bàn
  truyen(B, roi, co) {
    const S = SKILLS.lualien, oRoi = new Set(roi.map(r => r[1])), cong = new Map();
    for (const [T, o0, o1] of roi) {
      const n = T.lc || 0, o = o1 == null ? o0 : o1; if (n <= 0) continue;
      for (const i of S.chuThap(o)) {
        const X = B.t[i]; if (!X || X.id !== 'lualien' || biKhoa(X) || oRoi.has(i) || (co && !co.has(X))) continue;
        const v = cong.get(X) || { n: 0, tu: [] }; v.n += n; if (!v.tu.includes(o)) v.tu.push(o); cong.set(X, v);
      }
    }
    const tang = [];
    for (const [X, v] of cong) {
      const cu = X.lc || 0, moi = Math.min(S.tran(X), cu + v.n); if (moi <= cu) continue; // đã chạm trần
      X.lc = moi; X.sang = 1; tang.push({ X, n: moi - cu, tu: v.tu });
    }
    if (tang.length) {
      LUA_VET.phat(B, tang);
      if (!B.ai || G.che === 'pvp') SND.combo(Math.min(20, tang.length * 3 + 2));
    }
    return tang;
  },
};
{ // móc: mỗi bước bàn (bắt bán / trùm phá / Blood Circuit nuốt… kể cả thao tác giữa 2 khung) + mỗi lần ghép (nguyên liệu Ember bị ghép mất = rời bàn)
  const _cnb = capNhatBan;
  capNhatBan = function (B) { LUA_ROI.quet(B); const r = _cnb.apply(this, arguments); LUA_ROI.quet(B); return r; };
  const _gh = ghep;
  ghep = function (B, a, b) {
    const B2 = (b && G.ban && G.ban[b.ban]) || B, em = [a, b].filter(X => X && X.id === 'lualien');
    LUA_ROI.quet(B2); for (const X of em) { X._gop = 1; X._gopO = b ? b.o : X.o; } // ô GHÉP = ô đích (ụ ra hiện ở đây)
    let r; try { r = _gh.apply(this, arguments); } finally { LUA_ROI.quet(B2); for (const X of em) if (B2 && B2.t.includes(X)) { delete X._gop; delete X._gopO; } }
    return r;
  };
  // AUDIT F4 (09/11): đường rời bàn NGOÀI capNhatBan (trùm phá / Nightmare 1★ trong capNhatQuai, đạn / hiệu ứng) để ô trống tới khung sau; nếu giữa 2 khung
  //   người chơi / chỉ huy / Twin Maker đặt ụ mới vào ĐÚNG ô đó thì lần quét sau tưởng là "biến hình tại chỗ" → mất truyền lửa. Quét TRƯỚC mọi lối đặt ụ vào ô trống.
  for (const ten of ['trieu', 'sinhDoi', 'dungMV']) {
    const goc = window[ten]; if (typeof goc !== 'function') continue;
    window[ten] = function (B) { if (B && B.t) LUA_ROI.quet(B); return goc.apply(this, arguments); };
  }
}
// HIỆU ỨNG NHẬN LỬA (người dùng 08/11: "không có hiệu ứng để biết là hàng cột của ụ ember được cộng lửa") — CHỈ HÌNH, không đổi luật:
//   · Vệt lửa (dải fx_ronglua_vet, nhịp 6 khung) chạy từ ô ghép dọc HÀNG/CỘT tới Relay nhận xa nhất mỗi hướng (~0,25–0,46 s), rồi tắt nhanh.
//     Nằm DƯỚI đầu súng: lớp `duoi` vẽ phần ngoài các ô có ụ; trong ô có ụ, phần vệt vẽ lại ở lớp dưới đầu súng của chính ụ đó (VX.duoiDau)
//     → bệ ụ không che vệt, đầu súng luôn nằm trên. Đầu vệt = icon lửa màu mốc (lua_t1–4).
//   · Vệt tới Relay nào: "+N" (màu mốc) nổi lên trên tấm đếm + icon lửa trên tấm đếm loé 1 nhịp. Ụ ra (Relay) hiện số lửa mới.
//   · Không vòng giữ lại. Bàn con rối online: datO thấy lửa tăng → chỉ "+N" + loé (không vệt).
const LUA_VET = {
  MAU: ['#ffb35a', '#f4f0ff', '#5ec4ff', '#ffd84a', '#ff5a3a'], // màu chữ / quầng theo mốc (cam · trắng · lam · vàng · đỏ)
  DI0: 0.16, DI1: 0.075, TAT: 0.18, POP: 0.85, // giây: vệt đi = DI0 + DI1 × số ô · tắt · "+N"
  _vet: [], _f: -1, _pop: new Map(), _moc: false,
  // tang: [{ X, n, tu: [ô nguồn] }] (ô nguồn = ô ghép / ô Ember rời bàn đơn lẻ) — vệt từ MỖI ô nguồn dọc hàng/cột tới Ember nhận xa nhất mỗi hướng; "+N" = lửa thật cộng thêm
  phat(B, tang) {
    if (!G.hu || !B || !B.o) return;
    const tre = (typeof VX !== 'undefined' && VX.TRE_LO) || 0, vet = {};
    for (const g of tang) {
      let diMax = 0;
      for (const o of g.tu) {
        if (!B.o[o]) continue;
        const c0 = o % 5, h0 = (o / 5) | 0, c = g.X.o % 5, h = (g.X.o / 5) | 0, di = this.DI0 + this.DI1 * (Math.abs(c - c0) + Math.abs(h - h0));
        const key = o + (c === c0 ? (h < h0 ? 'u' : 'd') : (c < c0 ? 'l' : 'r'));
        if (!vet[key] || vet[key].di < di) vet[key] = { o, di, q: B.o[g.X.o], bac: SKILLS.lualien.bac(g.X.lc || 0) };
        diMax = Math.max(diMax, di);
      }
      G.hu.push({ k: 'vm1Pop', t: -tre - diMax, song: this.POP, X: g.X, so: '+' + g.n, bac: SKILLS.lualien.bac(g.X.lc || 0) }); // màu mốc theo lửa MỚI
    }
    for (const k in vet) { const v = vet[k], a = B.o[v.o], o1 = { k: 'vm1Vet', t: -tre, song: v.di + this.TAT, di: v.di, x0: a.x, y0: a.y, x1: v.q.x, y1: v.q.y, b: B.i, bac: v.bac }; G.hu.push(o1, Object.assign({}, o1, { k: 'vm1VetDau', song: v.di + 0.08 })); }
  },
  // ụ ra của ghép 2 Ember: số lửa mới (nổi ở nửa trên ô — tấm tên ụ mới che đáy ô)
  popRa(B, ra) { if (G.hu && ra && (ra.lc || 0) > 0) G.hu.push({ k: 'vm1Pop', t: -((typeof VX !== 'undefined' && VX.TRE_LO) || 0) - 0.1, song: this.POP, X: ra, so: String(ra.lc), bac: SKILLS.lualien.bac(ra.lc), ra: 1 }); },
  // bàn con rối online (dongbo.js datO): lửa tăng → "+N" (không biết ô ghép → không vệt)
  conRoi(T, cu) { if (G.hu && T && (T.lc || 0) > cu && cu > 0) G.hu.push({ k: 'vm1Pop', t: 0, song: this.POP, X: T, so: '+' + ((T.lc || 0) - cu), bac: SKILLS.lualien.bac(T.lc || 0) }); },
  // móc lớp dưới đầu súng (1 lần, lúc vệt đầu tiên được vẽ — VX nạp sau file này)
  moc() {
    if (this._moc || typeof VX === 'undefined' || typeof VX.duoiDau !== 'function') return; this._moc = true;
    const d0 = VX.duoiDau, L = this;
    VX.duoiDau = function (ctx, T, S, al, R) { const r = d0.apply(this, arguments); if (L._f === R.t && L._vet.length) L.veO(ctx, T, R); return r; };
  },
  // trong ô của ụ T: vẽ lại phần vệt (toạ độ sân), cắt đúng ô
  veO(ctx, T, R) {
    const B = G.ban[T.ban]; if (!B || !B.o[T.o]) return;
    let mo = false;
    for (const o of this._vet) if (o.b === B.i) {
      if (!mo) { mo = true; const k = R.s * R.dpr, c = B.o[T.o]; ctx.save(); ctx.setTransform(k, 0, 0, k, FX.rungX * k, FX.rungY * k); ctx.beginPath(); ctx.rect(c.x - B.cw / 2, c.y - B.ch / 2, B.cw, B.ch); ctx.clip(); }
      this.ve(ctx, o, R);
    }
    if (mo) { ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  },
  ve(ctx, o, R) {
    const B = G.ban[o.b]; if (!B || o.t < 0 || o.__t < 0) return; // __t: giờ thật (lúc vẽ nội suy kẹp t âm về 0)
    const p = Math.min(1, o.t / o.di), e = 1 - (1 - p) * (1 - p), mo = o.t <= o.di ? 1 : Math.max(0, 1 - (o.t - o.di) / (o.song - o.di));
    if (mo <= 0.01) return;
    const dx = o.x1 - o.x0, dy = o.y1 - o.y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, cw = Math.min(B.cw, B.ch);
    const dau = L * e, s0 = cw * 0.18, day = cw * 0.46;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const im = REN.img('fx_ronglua_vet');
    if (im && dau > s0) { // dải lửa kéo từ mép ô ghép tới đầu vệt (khung lặp 0–5), tim dải ở 55,7% chiều cao khung
      const f = Math.floor((R.t || 0) * 14) % 6, a = REN.mip ? REN.mip(im, day * 8 * REN.s * REN.dpr) : im, kx = a.width / 1600;
      ctx.translate(o.x0, o.y0); ctx.rotate(Math.atan2(dy, dx)); ctx.globalAlpha = 0.95 * mo;
      ctx.drawImage(a, f * 200 * kx, 0, 200 * kx, a.height, s0 - day * 0.15, -day * 0.557, dau - s0 + day * 0.3, day);
      ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // đầu vệt (lớp trên — ụ Relay gần kín ô nên vệt dưới đầu súng bị che khi đi dọc cột): quầng nhỏ + ngọn lửa màu mốc, chỉ ~0,3 s
  veDau(ctx, o) {
    const B = G.ban[o.b]; if (!B || o.t < 0 || o.__t < 0) return;
    const p = Math.min(1, o.t / o.di), e = 1 - (1 - p) * (1 - p), cw = Math.min(B.cw, B.ch), dau = Math.hypot(o.x1 - o.x0, o.y1 - o.y0) * e;
    const L = Math.hypot(o.x1 - o.x0, o.y1 - o.y0) || 1, ux = (o.x1 - o.x0) / L, uy = (o.y1 - o.y0) / L;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    {
      const hx = o.x0 + ux * dau, hy = o.y0 + uy * dau, al = o.t <= o.di ? 1 : Math.max(0, 1 - (o.t - o.di) / 0.08);
      REN.anhGiua(ctx, REN.cham1(this.MAU[o.bac]), hx, hy, cw * 0.85, 0, al * 0.7);
      ctx.globalCompositeOperation = 'source-over';
      PX.ve(ctx, REN.img(SKILLS.lualien.ICON[o.bac]), hx, hy - cw * 0.02, cw * 0.26, cw * 0.36, 0, al);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // lớp huy hiệu (sau tấm đếm): icon lửa trên tấm loé + "+N" nổi lên — h = ND.xep (cx, yDay, C, B, T)
  veHH(ctx, h) {
    const T = h && h.T, p = T && this._pop.get(T); if (!p || p._f !== REN.t || p.t < 0 || !h.B) return;
    const u = Math.min(1, p.t / p.song), C = h.C || 40, hh = Math.max(9, C * 0.2), mau = this.MAU[p.bac] || this.MAU[0];
    let ix = h.cx; const iy = h.yDay - 1 - hh / 2;
    const v = typeof DEMKN !== 'undefined' && DEMKN.lay(T, h.B);
    if (v && v.m && v.m.length) ix = h.cx - DEMKN.rong(v, hh) / 2 + hh * 0.42 + hh * 0.46;
    ctx.save();
    if (u < 0.55) { // loé icon lửa trên tấm đếm (nảy 1 nhịp)
      const k = u / 0.55, sc = 1 + 0.7 * Math.sin(Math.PI * Math.min(1, k * 1.4)), al = (1 - k) * (h.al == null ? 1 : h.al);
      ctx.globalCompositeOperation = 'lighter';
      REN.anhGiua(ctx, REN.cham1(mau), ix, iy, hh * 3.2 * sc, 0, al * 0.75);
      PX.ve(ctx, REN.img(SKILLS.lualien.icon(T.lc || 0)), ix, iy, hh * 0.92 * sc, hh * 1.28 * sc, 0, al * 0.9);
    }
    // "+N" (ụ ra: số lửa mới) nổi từ trên tấm đếm, nở nhanh rồi mờ
    const fs = Math.max(11, Math.round(C * 0.22)), sc2 = u < 0.12 ? 0.6 + u / 0.12 * 0.5 : u < 0.22 ? 1.1 - (u - 0.12) : 1;
    const y = (p.ra ? h.yDay - C * 0.62 : h.yDay - hh - 2 - fs * 0.55) - C * 0.18 * (1 - (1 - u) * (1 - u)), al2 = (u > 0.65 ? (1 - u) / 0.35 : 1) * (h.al == null ? 1 : h.al);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al2;
    ctx.font = '900 ' + Math.round(fs * sc2) + 'px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const iw = fs * 0.62 * sc2, tw = ctx.measureText(p.so).width, x0 = h.cx - (tw + iw + 2) / 2;
    ctx.lineWidth = Math.max(2.5, fs * 0.22); ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(p.so, x0 + tw / 2, y);
    ctx.fillStyle = mau; ctx.fillText(p.so, x0 + tw / 2, y);
    PX.ve(ctx, REN.img(SKILLS.lualien.ICON[p.bac]), x0 + tw + 2 + iw / 2, y - 1, iw, iw * 1.39, 0, al2);
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
HU.vm1Vet = { duoi: true, // phần vệt NGOÀI các ô có ụ (trong ô: LUA_VET.veO ở lớp dưới đầu súng)
  ve(ctx, o, R) {
    if (o.t < 0 || o.__t < 0) return; LUA_VET.moc();
    if (LUA_VET._f !== R.t) { LUA_VET._f = R.t; LUA_VET._vet = []; }
    LUA_VET._vet.push(o);
    const B = G.ban[o.b]; if (!B) return;
    ctx.save(); ctx.beginPath(); ctx.rect(-4000, -4000, 8000, 8000);
    for (let i = 0; i < 15; i++) if (B.t[i] && B.o[i]) ctx.rect(B.o[i].x - B.cw / 2, B.o[i].y - B.ch / 2, B.cw, B.ch);
    ctx.clip('evenodd'); LUA_VET.ve(ctx, o, R); ctx.restore(); ctx.globalAlpha = 1;
  },
};
HU.vm1VetDau = { ve(ctx, o) { LUA_VET.veDau(ctx, o); } };
HU.vm1Pop = { ve(ctx, o, R) { if (o.t >= 0 && !(o.__t < 0)) { o._f = R.t; LUA_VET._pop.set(o.X, o); } }, het(G, o) { if (LUA_VET._pop.get(o.X) === o) LUA_VET._pop.delete(o.X); } };
HU.vm1Tia = { // (cũ — thay bằng HU.vm1Vet) giữ cho ảnh chụp / bản lưu cũ còn mục này // lửa bay từ ô ghép sang Relay nhận: ngọn lửa PNG (màu mốc) trượt theo đường thẳng
  cap(G, o, dt) { o.t += dt; return o.t >= o.song; },
  ve(ctx, o) { const p = Math.min(1, o.t / o.song), im = REN.img(o.im || 'fx_cuuvi_dan') || REN.img('fx_cuuvi_dan'); if (!im) return; ctx.save(); PX.ve(ctx, im, o.x0 + (o.x1 - o.x0) * p, o.y0 + (o.y1 - o.y0) * p, 16, 22, 0, 1 - p * 0.3); ctx.restore(); ctx.globalAlpha = 1; },
};

// =====================================================================================================
// P2 · QUANTUM CHOIR — HARMONY (hopca) — Vàng TC. LÀM LẠI 08/11 (người dùng giữ ụ, TOM-TAT mục 3, CHATGPT-SPEC A1 §3):
//      Mỗi ụ KỀ 4 hướng (trên/dưới/trái/phải) có CÙNG SỐ SAO = 1 HARMONY (tối đa 4; ụ băng vẫn tính, ô đá không tính).
//      Mỗi Harmony +25% sát thương +8% ST chí mạng · 2 = bắn thêm 1 mục tiêu (50%) · 3 = +30% tốc bắn · 4 = +50% ST chí mạng và đòn VANG 1.5× mỗi loạt thứ 3.
//      7★: +25% tốc bắn. Tính lại mỗi khung (chỉ đọc bàn) → tất định online.
// =====================================================================================================
SKILLS.hopca = { // 09/11 gánh hậu kỳ (đơn mục tiêu, Hoà âm khó đủ): ST 15 → 24, tốc 1.0 → 2.0, mỗi Hoà âm +25% → +35% ST, mục tiêu thứ 2 50% → 80%
  vai: 'tc', dmg: 24, toc: 2.0, nham: 'dau', HOA_DMG: 0.35, HAI_K: 0.8,
  hoa(B, T) { let n = 0; if (!B || !B.t) return 0; for (const X of keCan(B, T.o)) if (X && X.sao === T.sao && !X.st.da) n++; return Math.min(4, n); },
  // thưởng thuần theo số Harmony h (+ 7★)
  thuong(h, sao) { return { dmg: this.HOA_DMG * h, cdmg: 0.08 * h + (h >= 4 ? 0.5 : 0), toc: (h >= 3 ? 0.30 : 0) + (sao >= 7 ? 0.25 : 0), hai: h >= 2, vang: h >= 4 }; },
  mo(T) {
    const B = G.ban[T.ban], h = B ? this.hoa(B, T) : 0, t = this.thuong(h, T.sao);
    return 'Harmony ' + h + '/4 → +' + Math.round(t.dmg * 100) + '% damage, +' + Math.round(t.cdmg * 100) + '% crit damage' + (t.toc ? ', +' + Math.round(t.toc * 100) + '% fire rate' : '') +
      ' · each touching turret (up, down, left, right) with the SAME ★ = 1 Harmony: +' + Math.round(this.HOA_DMG * 100) + '% damage, +8% crit damage · 2: also shoots a 2nd enemy (' + Math.round(this.HAI_K * 100) + '%) · 3: +30% fire rate · 4: +50% crit damage and an echo hit (150%) every 3rd shot · 7★: +25% fire rate · stones do not count';
  },
  capNhat(G, B, T) {
    const h = this.hoa(B, T), t = this.thuong(h, T.sao);
    if (h > (T.hop || 0) && T.tuoi > 0.3) { T.sang = 1; const c = B.o[T.o]; vm1Fx('hopca', c.x, c.y, B.cw * 1.4, 0.6, '#d9b8ff'); } // tăng: chỉ chớp
    T.hop = h;
    T.buf.dmg += t.dmg; T.buf.cdmg = (T.buf.cdmg || 0) + t.cdmg; T.buf.toc += t.toc;
    return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.5); const [x, y] = chopNong(T, 20); SND.tia();
    const dmg = dmgU(T), h = T.hop || 0, t = this.thuong(h, T.sao);
    T.vol = ((T.vol || 0) + 1) % 3;
    const vang = t.vang && T.vol === 0;
    banDan({ img: 'dan_tia', x, y, muc: E, px: E.x, py: E.y, sp: 640, co: 14, B, T, trung: (G, d, M) => { if (M) { trung(M, dmg, { B, mau: '#e6c8ff' }); if (vang && !M.chet) trung(M, dmg * 1.5, { B, T, mau: '#ffffff' }); } FX.vong1(d.x, d.y, 3, 10 + h * 3, '#d9b8ff', 0.2, 2); } });
    if (t.hai) { // Harmony 2+: thêm 1 mục tiêu khác (quái kế quái đầu), 50%
      let E2 = null, best = 1e9; for (const Q of dsMucTieu(B)) { if (Q === E || Q.chet) continue; const r = G.duong[Q.p].len - Q.s; if (r < best) { best = r; E2 = Q; } }
      if (E2) banDan({ img: 'dan_tia', x, y, muc: E2, px: E2.x, py: E2.y, sp: 640, co: 11, B, T, trung: (G, d, M) => { if (M) trung(M, dmg * SKILLS.hopca.HAI_K, { B, mau: '#e6c8ff' }); } });
    }
  },
};

// =====================================================================================================
// P4 · FUSION ARCHIVE (luutru) — Vàng TC. LÀM LẠI 08/11 (người dùng duyệt TOM-TAT mục 4, CHATGPT-SPEC A1 §4; BỎ 3 xung Archive + Archive):
//      Mỗi lần GHÉP THẬT bất kỳ trên bàn mình (ghép thường, đá + đá, Twin Anvil + Twin Anvil thành công/thất bại) → +1 điểm cho ĐÚNG 1 Fusion Archive
//      ngẫu nhiên còn trên bàn (chọn SAU khi ghép xong; viên lưu bay vào). Không có Archive → mất. Vua Ghép tăng sao, Sao Chép, Dịch Chuyển, Ép Xung,
//      Mạch Máu đánh dấu, buff Anvil, trứng nở… KHÔNG phải ghép. Ụ mới 0 điểm. Mỗi điểm +1% ST. Mốc: 10 +15% tốc · 20 +8% chí mạng · 30 +25% ST ·
//      40 +40% ST chí mạng · 50/60/70 thêm +20/+30/+40% ST. Trần 40 (LV9) → 50 (LV11) → 60 (LV13) → 70 (LV15). Ngẫu nhiên: rngHat(hạt trận + bàn + số lần ghép).
// =====================================================================================================
SKILLS.luutru = { // 09/11 gánh hậu kỳ (đơn mục tiêu, điểm chia ngẫu nhiên cho 1 Archive): ST 15 → 24, tốc 1.0 → 2.0, mỗi điểm +1% → +2% ST
  vai: 'tc', dmg: 24, toc: 2.0, nham: 'dau', DIEM: 0.02,
  tran(T) { const k = VM1.k(T); return k >= 6 ? 70 : k >= 4 ? 60 : k >= 2 ? 50 : 40; },
  MOC: [[10, 'toc', 0.15], [20, 'crit', 0.08], [30, 'dmg', 0.25], [40, 'cdmg', 0.40], [50, 'dmg', 0.20], [60, 'dmg', 0.30], [70, 'dmg', 0.40]],
  thuong(n) { const r = { dmg: this.DIEM * n, toc: 0, crit: 0, cdmg: 0, moc: 0 }; for (const [m, k, v] of this.MOC) if (n >= m) { r[k] += v; r.moc = m; } return r; },
  mo(T) {
    const cap = this.tran(T), n = Math.min(cap, T.kho || 0), t = this.thuong(n);
    return 'Charges ' + n + '/' + cap + ' → +' + Math.round(t.dmg * 100) + '% damage' + (t.toc ? ', +' + Math.round(t.toc * 100) + '% fire rate' : '') + (t.crit ? ', +' + Math.round(t.crit * 100) + '% crit chance' : '') + (t.cdmg ? ', +' + Math.round(t.cdmg * 100) + '% crit damage' : '') +
      ' · every real merge on your board gives +1 charge to ONE random Fusion Archive (it flies in) · each charge +' + Math.round(this.DIEM * 100) + '% damage · 10: +15% fire rate · 20: +8% crit chance · 30: +25% damage · 40: +40% crit damage · 50/60/70: +20/30/40% damage · max 40 (LV11 50, LV13 60, LV15 70) · Merge King, Copycat and Teleporter are not merges';
  },
  sinh(G, T) { if (T.kho == null) T.kho = 0; },
  capNhat(G, B, T) {
    const n = Math.min(this.tran(T), T.kho || 0); if (!n) return false;
    const t = this.thuong(n);
    T.buf.dmg += t.dmg; T.buf.toc += t.toc; T.buf.crit += t.crit; T.buf.cdmg = (T.buf.cdmg || 0) + t.cdmg;
    if (t.moc > (T.khoMoc || 0) && T.tuoi > 0.3) { try { nhanU(T, 'ARCHIVE ' + t.moc, '#bfe4ff', t.moc >= 40); } catch (e) { } } // mốc mới: chữ 1 lần
    T.khoMoc = t.moc;
    return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.5); const [x, y] = chopNong(T, 20); SND.tia();
    const dmg = dmgU(T);
    banDan({ img: 'dan_tia', x, y, muc: E, px: E.x, py: E.y, sp: 620, co: 14, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#bfe4ff' }); FX.tiaLua(d.x, d.y, 3, '#bfe4ff', 100, 5); } });
  },
  // chọn 1 Archive nhận điểm (sau ghép): ô tăng dần, rngHat(hạt trận + bàn + số lần ghép) → 2 máy online chọn như nhau
  chon(B) {
    const ds = []; for (let i = 0; i < 15; i++) { const X = B.t[i]; if (X && X.id === 'luutru' && !X.st.da) ds.push(X); }
    if (!ds.length) return null;
    const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1;
    const r = rngHat((hat * 4099 + B.i * 7919 + (B.ghepN | 0) * 104729) | 0);
    return ds[Math.floor(r() * ds.length)];
  },
  nhan(B, oNguon) { // 1 lần ghép thật xong → +1 cho 1 Archive (trần theo cấp thẻ); viên lưu bay vào (chỉ hình)
    const X = this.chon(B); if (!X) return null;
    X.kho = Math.min(this.tran(X), (X.kho || 0) + 1);
    const a = B.o[oNguon], c = B.o[X.o];
    if (a && c && typeof G.hu !== 'undefined') G.hu.push({ k: 'khoBay', t: -(typeof VX !== 'undefined' && VX.TRE_LO || 0), song: 0.45, x0: a.x, y0: a.y, X, B, w: Math.min(B.cw, B.ch) * 0.42 });
    return X;
  },
};
HU.khoBay = { // viên lưu (kho_bay) bay từ ô ghép vào Archive nhận, chạm thì nổ nhỏ (kho_no) — chỉ hình
  cap(G, o, dt) { o.t += dt; if (o.t >= o.song && !o.no) { o.no = 1; const c = o.B.o[o.X.o]; if (c) G.hu.push({ k: 'khoNo', t: 0, song: 0.3, x: c.x, y: c.y, w: o.w * 1.6 }); o.X.sang = 1; } return o.t >= o.song; },
  ve(ctx, o) {
    if (o.t < 0) return; const c = o.B.o[o.X.o]; if (!c) return;
    const p = Math.min(1, o.t / o.song), e = 1 - (1 - p) * (1 - p), x = o.x0 + (c.x - o.x0) * e, y = o.y0 + (c.y - o.y0) * e - Math.sin(p * Math.PI) * o.w * 0.8;
    const im = REN.img('kho_bay') || REN.img('kho_icon'); if (!im) return;
    const g = Math.atan2(c.y - o.y0, c.x - o.x0);
    PX.ve(ctx, im, x, y, o.w * 1.5, o.w * 1.5 * (im.height / im.width), g, 1);
  },
};
HU.khoNo = { cap(G, o, dt) { o.t += dt; return o.t >= o.song; }, ve(ctx, o) { const im = REN.img('kho_no'); if (!im) return; const p = o.t / o.song; PX.ve(ctx, im, o.x, o.y, o.w * (0.7 + 0.4 * p), o.w * (0.7 + 0.4 * p) * im.height / im.width, 0, 1 - p); } };
// đếm GHÉP THẬT của từng bàn → 1 điểm cho 1 Archive (bàn con rối online chạy cùng ghep → cùng B.ghepN → cùng Archive; ảnh chụp bàn sửa lệch qua cờ 'k')
{
  const _ghepVM1 = ghep;
  ghep = function (B, a, b, ep) {
    const B2 = b && G.ban[b.ban], oN = b && b.o;
    // ghép ĐẶC BIỆT chỉ tính khi kỹ năng tự khai là ghép thật (Twin Anvil + Twin Anvil); Vua Ghép / Sao Chép / Dịch Chuyển / Ép Xung / Mạch Máu / buff Anvil: không
    const that = laGhepThat(a, b, ep); // game.js — cùng định nghĩa ghép thật cho mọi bộ đếm
    const r = _ghepVM1.apply(this, arguments);
    if (r && B2 && that) { B2.ghepN = (B2.ghepN || 0) + 1; SKILLS.luutru.nhan(B2, oN); }
    return r;
  };
}

// =====================================================================================================
// P5 · HERO FOUNDRY (xuonganh) — Vàng ĐB. 08/11 (người dùng giữ bản 25 s, CHATGPT-SPEC A2): ghép thật Foundry + Foundry → Ô GHÉP thành ô ANH HÙNG 25 s:
//      ụ đứng trên ô +80% tốc bắn +30% ST chí mạng (× 1 + 3%/cấp thẻ Đặc biệt). Chỉ 1 ô / bàn (ghép mới thay ô cũ). Ụ đá / trứng không nhận.
//      Ô vẫn còn khi ụ trên đó bị ghép đi (ụ mới đứng lên nhận ngay). PVP / CO-OP: chỉ bàn mình. Online: ô = ô ghép (tất định), gói ghép mang 'hf'.
// =====================================================================================================
SKILLS.xuonganh = {
  vai: 'db', dmg: 7.5, toc: 1.3, nham: 'dau',
  SONG: 25, TOC: 0.8, CDMG: 0.3,
  he: (T) => heDB(G.ban[T.ban], 'xuonganh'),
  mo(T) {
    const h = this.he(T);
    return 'Merge 2 Hero Foundries: that cell becomes a HERO tile for 25s → the turret on it gets +' + Math.round(this.TOC * h * 100) + '% fire rate and +' + Math.round(this.CDMG * h * 100) + '% crit damage · only 1 tile on your board (a new one replaces it) · stones and eggs get nothing';
  },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 600 }); },
  ghep(G, B, a, b, ra) {
    if (a.id !== 'xuonganh' || b.id !== 'xuonganh') return;
    const ep = G._hfEp, o = ep != null ? ep : b.o; // online: đúng ô máy bạn kia (cũng là ô ghép)
    B._hf = o;
    const h = heDB(B, 'xuonganh');
    B.hero = [{ o, het: G.t + this.SONG, toc: this.TOC * h, cdmg: this.CDMG * h, v: this.TOC * h, t0: G.t }];
    const c = B.o[o];
    vm1Fx('xuonganh', c.x, c.y, B.cw * 1.9, 0.7, '#ffd23f');
    if (!G.hu.some(q => q.k === 'vm1Hero' && q.B === B)) G.hu.push({ k: 'vm1Hero', t: 0, song: 1e12, B });
    if (!B.ai || G.che === 'pvp') SND.nang(3);
  },
};
HU.vm1Hero = { // ô anh hùng: vòng vàng PNG dưới ụ, hết hạn thì tắt (buff có thời hạn → giữ hình tới hết)
  duoi: true,
  cap(G, o, dt) { const B = o.B; if (!B || G.ban.indexOf(B) < 0) return true; if (B.hero) B.hero = B.hero.filter(h => h.het > G.t); return !(B.hero && B.hero.length) && (o.t += dt) > 0.5; },
  ve(ctx, o, R) {
    const B = o.B; if (!B || !B.hero) return;
    const im = REN.img('tier_ring_vang');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const h of B.hero) {
      const c = B.o[h.o], con = h.het - G.t, a = Math.min(1, con / 1.5) * (0.75 + 0.25 * Math.sin(G.t * 6 + h.o));
      const w = Math.min(B.cw, B.ch) * 1.05;
      if (im && G.t - h.t0 > 0.5) PX.ve(ctx, im, c.x, c.y, w, w, G.t * 0.6, a * 0.8);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// áp buff ô anh hùng sau khi buff được đặt lại mỗi khung (cùng chỗ mốc sao chung)
{
  const _mocBufVM1 = mocBuf;
  mocBuf = function (B) {
    const r = _mocBufVM1.apply(this, arguments);
    if (B && B.hero && B.hero.length) for (const h of B.hero) { if (h.het <= G.t) continue; const T = B.t[h.o]; if (T && !biKhoa(T) && T.id !== 'tienhoa') { T.buf.toc += h.toc != null ? h.toc : h.v; T.buf.cdmg = (T.buf.cdmg || 0) + (h.cdmg || 0); T.heroO = 1; } }
    return r;
  };
}

// =====================================================================================================
// đăng ký: họ kỹ năng, mốc, grow-up (không ảnh dạng: vòng tiến độ), nhịp, ảnh tạm, bộ bài ngẫu nhiên, bộ đếm đáy ô
// =====================================================================================================
themHo('blast', 3, 'lualien', 'an Ember leaving the board passes its flames along its row and column (merged: along the merge tile\'s): +damage & crit');
themHo('star', 3, 'hopca', 'HARMONY: stronger next to same-star turrets');
themHo('summon', 3, 'luutru', 'every real merge feeds one Archive: milestones 10–70');
themHo('amp', 3, 'xuonganh', 'merge stamps a 25s HERO tile: big fire-rate boost');
Object.assign(GROW, {
  lualien: { mau: '#ff8a2a', khongAnh: true, ten: ['EMBER', 'KINDLED', 'FULL BLAZE'], dk: 'Flames 1–9 / 10–49 / 50+ (no limit)',
    gd: (T) => { const n = T.lc || 0; return { s: n >= 50 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 70), v: [1 / 7, 5 / 7] }; } },
  luutru: { mau: '#bfe4ff', khongAnh: true, ten: ['EMPTY SHELVES', 'FILING', 'GRAND ARCHIVE'], dk: 'Charges 0–9 / 10–29 / 30+ (max 40, LV11 50, LV13 60, LV15 70)',
    gd: (T) => { const n = T.kho || 0; return { s: n >= 30 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 40), v: [0.25, 0.75] }; } },
});
for (const id in VM1.TAM) {
  const m = VM1.TAM[id];
  if (window.HEAD_K && HEAD_K[m] && !HEAD_K[id]) HEAD_K[id] = HEAD_K[m];
  if (window.ART_META && ART_META[m] && !ART_META[id]) ART_META[id] = ART_META[m];
}
for (const id of VM1.IDS) PILOTS.add(id);
// ụ chưa có ảnh riêng: KHÔNG vào bộ bài ngẫu nhiên (người chơi vẫn tự chọn được)
{
  const _dnnVM1 = deckNgauNhien;
  deckNgauNhien = function (tru) { return _dnnVM1.call(this, (tru || []).concat(Object.keys(VM1.TAM))); };
}
if (typeof addEventListener === 'function') addEventListener('DOMContentLoaded', () => {
  if (typeof DEMKN !== 'undefined') Object.assign(DEMKN.DS, {
    lualien(T) { const n = T.lc || 0; return n > 0 ? { m: [{ ic: SKILLS.lualien.icon(n), s: n + '' }] } : null; }, // icon lửa theo mốc (lua_t1–4)
    hopca(T, B) { const n = SKILLS.hopca.hoa(B, T); return n > 0 ? { m: [{ ic: 'ic_dmg', s: n + '/4' }], sang: n >= 4 } : null; },
    luutru(T) { const n = T.kho || 0; return n > 0 ? { m: [{ ic: 'kho_icon', s: n + '/' + SKILLS.luutru.tran(T) }], sang: n >= 40 } : null; },
    xuonganh(T, B) { const h = (B.hero || []).find(q => q.het > G.t); return h ? { m: [{ ic: 'ic_toc', s: Math.ceil(h.het - G.t) + 's' }], sang: true } : null; },
  });
});
// tải trước dải hiệu ứng + ảnh phụ của ụ có trong bộ bài trận (khỏi hụt khung đầu)
{
  const _batDauVM1 = batDau;
  batDau = function (che, deck, mv) {
    const r = _batDauVM1.apply(this, arguments);
    if (typeof REN !== 'undefined' && REN.img) for (const B of G.ban) for (const id of B.deck || []) if (VM1.FXCO.has(id)) {
      REN.img('fx_' + id + '_sk');
      if (id === 'lualien') for (const k of ['fx_cuuvi_dan', 'lua_t1', 'lua_t2', 'lua_t3', 'lua_t4', 'fx_ronglua_vet']) REN.img(k);
      if (id === 'luutru') for (const k of ['kho_bay', 'kho_no', 'kho_icon']) REN.img(k);
      if (id === 'xuonganh') REN.img('tier_ring_vang');
    }
    return r;
  };
}
// =====================================================================================================
// ĐỘT PHÁ (07/11, người dùng chốt): kỹ năng cộng dồn KHÔNG trần + khi số cộng dồn vượt ngưỡng → thêm thưởng bậc (cộng dồn theo bậc):
//   Bậc I +15% tốc bắn · II +30% ST chí mạng · III +25% sát thương · IV +10% tỉ lệ chí mạng & +50% ST chí mạng (tỉ lệ chí mạng vẫn ≤ 100%, critU).
//   Ngưỡng theo tốc độ cộng dồn của từng ụ (NGUONG). Scrap Forge: thưởng vào ụ NHẬN (ụ Tấn công mạnh nhất). Tất định (chỉ đọc trạng thái).
//   Hình: icon tấm đếm + lửa Ember đổi màu theo bậc = bản sao PNG lọc màu (ctx.filter) DỰNG 1 LẦN rồi giữ (DOTPHA.ten) · lên bậc: nổ PNG + chữ.
// =====================================================================================================
const DOTPHA = {
  NGUONG: { lualien: [10, 30, 50, 70], leviathan: [5, 10, 20, 40], canon: [1, 3, 7, 15],
    lienket: [3, 5, 8, 12], combo: [5, 10, 20, 40], cuuvi: [1, 3, 6, 10] },
  SO: { lualien: (T) => T.lc || 0, leviathan: (T) => T.vuc || 0, canon: (T) => T.cmC || 0,
    lienket: (T) => T.chuoi || 1, combo: (T) => { const B = G.ban && G.ban[T.ban]; return (B && B.combo) || 0; }, cuuvi: (T) => T.xaN || 0 },
  LA: ['', 'I', 'II', 'III', 'IV'],
  MAU: ['', '#ffd84a', '#7fc8ff', '#d9a0ff', '#ffffff'],
  // lọc màu PNG theo bậc: chuẩn hoá về cam (sepia) rồi xoay màu → vàng / xanh lam / tím / trắng sáng
  LOC: ['', 'sepia(1) saturate(4) hue-rotate(5deg) brightness(1.25)', 'sepia(1) saturate(4) hue-rotate(170deg) brightness(1.15)', 'sepia(1) saturate(4) hue-rotate(230deg) brightness(1.15)', 'sepia(1) saturate(0.3) brightness(1.9)'],
  bac(n, nguong) { let b = 0; if (nguong) for (const x of nguong) if (n >= x) b++; return b; },
  bacU(T) { const f = T && this.SO[T.id]; return f ? this.bac(f(T), this.NGUONG[T.id]) : 0; },
  // ĐỘT PHÁ THEO ĐỘ KHÓ (07/11, tư vấn ChatGPT duyệt): khó 3 = mốc cũ · khó 2 −20% · khó 4 / 5 cao hơn — độ khó theo công sức THẬT để tới bậc IV
  //   (Choir 12 ụ cùng sao dễ với 1★ → khó 2; Archive ghép tự nhiên → 2; Leviathan 3; Ember 5 (08/11: lửa chỉ đến khi Ember rời bàn); Forge / Chain Link / Combo / Nine-Tail 4)
  KHO: { canon: 3, lualien: 5, leviathan: 3, lienket: 4, combo: 4, cuuvi: 4 },
  // [I tốc, II STCM, III ST, IV tỉ lệ CM, IV STCM] theo độ khó
  BANG: { 2: [0.12, 0.25, 0.20, 0.08, 0.40], 3: [0.15, 0.30, 0.25, 0.10, 0.50], 4: [0.20, 0.40, 0.35, 0.12, 0.65], 5: [0.25, 0.50, 0.45, 0.15, 0.85] },
  thuong(b, id) { const v = this.BANG[this.KHO[id] || 3]; return { toc: b >= 1 ? v[0] : 0, cdmg: (b >= 2 ? v[1] : 0) + (b >= 4 ? v[4] : 0), dmg: b >= 3 ? v[2] : 0, crit: b >= 4 ? v[3] : 0 }; },
  chu(id, T) {
    const ng = this.NGUONG[id], n = this.SO[id](T), b = this.bac(n, ng), t = this.thuong(b, id), ds = [];
    if (t.toc) ds.push('+' + Math.round(t.toc * 100) + '% fire rate'); if (t.cdmg) ds.push('+' + Math.round(t.cdmg * 100) + '% crit dmg');
    if (t.dmg) ds.push('+' + Math.round(t.dmg * 100) + '% damage'); if (t.crit) ds.push('+' + Math.round(t.crit * 100) + '% crit');
    return (b ? 'BREAKTHROUGH ' + this.LA[b] + ': ' + ds.join(', ') : 'Breakthroughs at ' + ng.join('/')) + (b > 0 && b < 4 ? ' · next breakthrough at ' + ng[b] : '');
  },
  // bậc IV: cầu vồng chậm = chọn 1 trong 6 bản sao đã lọc sẵn theo thời gian (không lọc mỗi khung)
  LOC4: [0, 60, 120, 180, 240, 300].map(h => 'sepia(1) saturate(2.6) hue-rotate(' + h + 'deg) brightness(1.55)'),
  buoc4() { return ((typeof VX !== 'undefined' ? VX.t : 0) * 1.5 | 0) % 6; },
  // bậc để VẼ: chính ụ cộng dồn, hoặc ụ NHẬN của Scrap Forge (hào quang buff trên ụ nhận cũng đổi màu)
  bacVe(T) { if (!T) return 0; const b = this.bacU(T); return b || (T.dpNhanT != null && typeof G !== 'undefined' && G.t - T.dpNhanT < 0.3 ? T.dpNhan || 0 : 0); },
  // VÒNG BẬC dưới ụ (thay hào quang lửa to — người dùng 07/11 'ưu tiên đơn giản'): fx_vong_mong (vòng sáng mảnh PNG) lọc màu: cam (có cộng dồn, chưa đột phá) → vàng → lam → tím → cầu vồng
  coVong(T) { return !!T && (!!this.NGUONG[T.id] || this.bacVe(T) > 0); },
  // vòng PNG trắng → tô màu bậc 1 lần (source-atop, giữ lõi sáng) → giữ trong REN.anh
  MAU_VONG: ['#ff7a1a', '#ffd23f', '#3f9dff', '#b45cff'],
  MAU_VONG4: ['#ff5a5a', '#ffffff', '#5cff7a', '#3fe0ff', '#5c7aff', '#ff5ce0'],
  tenVong(T) {
    const b = this.bacVe(T), f = this.SO[T.id];
    if (!b && !(f && f(T) > 0)) return null;
    if (typeof document === 'undefined' || typeof REN === 'undefined' || !REN.anh) return null;
    const v = b === 4 ? this.buoc4() : -1, mau = b === 4 ? this.MAU_VONG4[v] : this.MAU_VONG[b], k = 'fx_vong_mong~v' + b + (v >= 0 ? 'h' + v : '');
    if (REN.anh[k]) return k;
    const a = REN.img('fx_vong_mong'); if (!a || !a.width) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const x = c.getContext('2d'); if (!x) return null;
    x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.82; x.fillStyle = mau; x.fillRect(0, 0, c.width, c.height); // vetay-ok: png (vòng mảnh lọc màu bậc)
    REN.anh[k] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height }; if (REN.CO_DINH) REN.CO_DINH.add(k); return k;
  },
  tenT(goc, T) { const b = this.bacVe(T); return this.ten(goc, b, b === 4 ? this.buoc4() : -1); },
  // tên ảnh đã lọc màu bậc b (dựng 1 lần, giữ trong REN.anh như ảnh thường; tờ P2 mượn cỡ khung) · v = bước cầu vồng bậc IV (−1: trắng)
  ten(goc, b, v) {
    if (!b || typeof document === 'undefined' || typeof REN === 'undefined' || !REN.anh) return goc;
    const cv = b === 4 && v >= 0, k = goc + '~dp' + b + (cv ? 'h' + v : ''); if (REN.anh[k]) return k;
    const a = REN.img(goc); if (!a || !a.width) return goc;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); if (!x || !('filter' in x)) return goc;
    x.filter = cv ? this.LOC4[v] : this.LOC[b]; x.drawImage(a, 0, 0); x.filter = 'none';
    REN.anh[k] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height };
    if (REN.CO_DINH) REN.CO_DINH.add(k);
    if (typeof P2 !== 'undefined' && P2.M && P2.M[goc]) P2.M[k] = P2.M[goc];
    return k;
  },
};
for (const id in DOTPHA.NGUONG) {
  const sk = SKILLS[id]; if (!sk) continue;
  if (sk.capNhat) { const cn = sk.capNhat; sk.capNhat = function (G, B, T) {
    const r = cn.apply(this, arguments);
    const b = DOTPHA.bacU(T), X = id === 'loren' ? T.forgeX : T;
    if (b && X && X !== T) { X.dpNhan = X.dpNhanT === G.t ? Math.max(X.dpNhan || 0, b) : b; X.dpNhanT = G.t; }
    if (b && X) { const t = DOTPHA.thuong(b, id); X.buf.toc += t.toc; X.buf.cdmg = (X.buf.cdmg || 0) + t.cdmg; X.buf.dmg += t.dmg; X.buf.crit += t.crit; }
    if (b > (T.dpB || 0) && T.tuoi > 0.3 && B && B.o && B.o[T.o]) { // lên bậc: nổ PNG + chữ (chỉ trình bày)
      const c = B.o[T.o]; try { FX.no('no_phao', c.x, c.y, 50 + 12 * b, 0.4); nhanU(T, 'BREAKTHROUGH ' + DOTPHA.LA[b], DOTPHA.MAU[b], b >= 3); } catch (e) { }
    }
    T.dpB = b;
    return r;
  }; }
  if (sk.mo) { const mo = sk.mo; sk.mo = function (T) { const s = mo.apply(this, arguments); try { return T ? s + ' · ' + DOTPHA.chu(id, T) : s; } catch (e) { return s; } }; }
}
if (SKILLS.cuuvi && SKILLS.cuuvi.xa) { const xa = SKILLS.cuuvi.xa; SKILLS.cuuvi.xa = function (T) { if (G.ban[T.ban] && conTren(T)) T.xaN = (T.xaN || 0) + 1; return xa.apply(this, arguments); };
} // Nine-tail: đếm số lần xả cầu lửa (đuôi về 0 mỗi vòng) — 09/11 Q1 = A: ghép thường ra Nine-Tail = ụ mới, xaN về 0 (bỏ giữ max)
