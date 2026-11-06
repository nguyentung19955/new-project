// TURRET MERGE — Ụ VÀNG MỚI ĐỢT 2 (docs/demo-hop-tuong/tuvan/tuong_vang/CHATGPT-PLAN.txt §3 P3/P6 + DE-XUAT-NHAP.md hàng 3/4):
//   Blood Circuit (mauhut · Strigoi) · Hex Saboteur (nguyenrua · Guiltyne) · Sanctum (thanhdia · Bari) · Prism Thief (bienmau · Lupin)
// Luật chung: bậc vàng, cấp thẻ đầu 9 (THE.lvDau), % kỹ năng theo CẤP THẺ — mục KY_NANG_CAP (data.js; trang ụ 'now → next level'), sao 1–7★, tất định online (RNG gieo hạt theo bàn + ô, cờ trạng thái gửi qua dongbo.js oTT/datO),
// KHÔNG chữ nổi trên bàn (chỉ ảnh PNG). Ngoài bộ RANDOM cho tới khi có hình (SK7.CHUA_ANH). Nạp SAU skills5.js (+ skills6.js nếu có).
'use strict';

const SK7 = {
  IDS: ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau'],
  CHUA_ANH: new Set(['mauhut', 'nguyenrua', 'thanhdia', 'bienmau']), // id còn dùng ảnh tạm → không vào RANDOM / bộ máy (bỏ id khi hình ChatGPT đã lắp)
  // cấp thẻ tuyệt đối của ụ trên bàn B (9..15 với ụ vàng)
  lv(B, id) { const r = G.rosterMap && G.rosterMap[id]; return ((r && typeof THE !== 'undefined' && THE.lvDau[r.bac]) || 9) + ((B && B.capThe && B.capThe[id]) || 0); },
  // RNG tất định: cùng (bàn chủ hành động, ô, số lần) → cùng kết quả trên cả 2 máy online
  rng(B, o, n, k) { const s = ((typeof ONS !== 'undefined' && ONS.on ? ONS.seed : 7) | 0) * 1009 + (n | 0) * 7919 + (o | 0) * 131 + (k | 0) * 17; return rngHat(s); },
  anh(id, cot, du) { const t = 'fx_' + id + '_' + cot; return (typeof FXU !== 'undefined' && FXU.co && FXU.co(t)) ? t : du; },
};
// % kỹ năng theo cấp thẻ — bảng chung KY_NANG_CAP (data.js; trang ụ tự hiện 'Vamp +6% → +6.5%', online theo cấp trong chuỗi bộ bài)
Object.assign(KY_NANG_CAP, {
  mauhut: { ten: 'Vamp', base: 6, buoc: 0.5, max: 9, dv: '%', tien: '+', dmg: true },     // +% sát thương mỗi VAMP
  nguyenrua: { ten: 'Hex', base: 35, buoc: 2, max: 47, dv: '%', dmg: true },              // xác suất nguyền ở 1★ (+5%/sao, trần 80%)
  thanhdia: { ten: 'Dmg buff', base: 10, buoc: 0.7, max: 14.2, dv: '%', tien: '+', ht: 1 }, // buff sát thương 1★ (×HOTRO.K theo sao)
  bienmau: { ten: 'Combo', base: 6, buoc: 0.5, max: 9, dv: '%', tien: '+', dmg: true },   // +% sát thương mỗi COMBO
});
const kn7 = (T) => (knThe(G.ban[T.ban], T.id) || KY_NANG_CAP[T.id].base) / 100;


// =====================================================================================================
// P6 · BLOOD CIRCUIT (mauhut) — Vàng ĐB: KÉO lên BẤT KỲ ụ của mình (mọi sao / loại) → cả 2 thành 1 ụ ngẫu nhiên trong bộ bài
//      ở sao = max(2 sao) (KHÔNG bao giờ tự lên sao). Cùng sao → +1 VAMP (tối đa 10, chung cả bàn): mỗi VAMP +6% sát thương mọi Blood Circuit.
//      Khác sao → tốn 2 VAMP: xung máu 220% sát thương quanh ô (thiếu VAMP → chỉ đổi, không xung). Bắn thường: tia máu.
//      Mirror Gate không chặn (ghép tự nguyện). PVP/CO-OP: chỉ bàn mình.
// =====================================================================================================
SKILLS.mauhut = {
  vai: 'db', dmg: 17, toc: 0.9, nham: 'dau', napMau: '#d0103a',
  MAX: 10,
  pv: (T) => kn7(T),
  mo(T) { const B = G.ban[T.ban], v = (B && B.vamp) || 0; return 'Drag onto ANY of your turrets: both become 1 random deck turret at the higher star · same star: +1 VAMP (' + v + '/' + this.MAX + ', +' + (this.pv(T) * 100).toFixed(1) + '% damage each to every Blood Circuit) · different star: spends 2 VAMP for a ' + (T.sao >= 5 ? 300 : 220) + '% blood pulse' + (T.sao >= 7 ? ' · 7★: +2 VAMP per same-star feed' : ''); },
  capNhat(G, B, T) { const v = Math.min(this.MAX, B.vamp || 0); if (v) { T.buf.dmg += v * this.pv(T); T.nguon.push({ k: 'dmg', v: v * this.pv(T), T }); } return false; },
  ban(G, B, T, E) {
    giat(T, 0.7); const [x, y] = dauNong(T); SND.tia();
    const dmg = dmgU(T);
    danThang(B, T, E, SK7.anh('mauhut', 'dan', 'dan_tia'), 600, 16, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ff4a6a' }); });
    FX.no('chop_nong', x, y, 18, 0.08, T.goc);
  },
  ghepDB: {
    hopLe: (a, b) => b.id !== 'mauhut' && b.ban === a.ban && a !== b,
    xemSao: (a, b) => Math.min(LUAT.saoMax, Math.max(a.sao, b.sao)),
    lam(G, B, a, b) { // a = Blood Circuit (kéo), b = ụ bị hiến
      const sao = Math.min(LUAT.saoMax, Math.max(a.sao, b.sao)), cung = a.sao === b.sao, c = B.o[b.o];
      B.mhN = (B.mhN || 0) + 1;
      const r = SK7.rng(B, b.o, B.mhN, 1), id = B.deck.length ? B.deck[Math.floor(r() * B.deck.length)] : b.id;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: c.x, y1: c.y, t: 0, bac: a.bac });
      B.t[a.o] = null;
      const N = sinhR(taoU(B, id, sao, b.o), r); N.goc = b.goc; B.t[b.o] = N; N.anim = { k: 'no', t: 0 };
      if (cung) B.vamp = Math.min(SKILLS.mauhut.MAX, (B.vamp || 0) + (a.sao >= 7 ? 2 : 1));
      else if ((B.vamp || 0) >= 2) {
        B.vamp -= 2;
        const dmg = hsU('mauhut', a.sao, B) * (a.sao >= 5 ? 3 : 2.2) * (1 + (B.vamp || 0) * SKILLS.mauhut.pv(a));
        for (const E of dsMucTieu(B)) if (!E.chet && Math.hypot(E.x - c.x, E.y - c.y) < 120) trung(E, dmg, { B, T: a, phu: true, crit: false, mau: '#ff4a6a' });
        FX.no(SK7.anh('mauhut', 'hieu', 'laser_trung'), c.x, c.y, 120, 0.45); FX.lac(3);
      }
      FX.vong1(c.x, c.y, 8, 56, '#d0103a', 0.4, 4); FX.tiaLua(c.x, c.y, 14, '#ff4a6a', 180, 10);
      SND.no(0.3);
      return N;
    },
  },
  ghep(G, B, a, b, ra) { /* ghép thường 2 Blood Circuit cùng sao: không hiệu ứng riêng */ },
  sangDau: (T) => { const B = G.ban[T.ban]; return Math.min(0.3, ((B && B.vamp) || 0) / 30); },
  veThem(ctx, T, S, al, R) { const B = G.ban[T.ban], v = (B && B.vamp) || 0; if (v < 3) return; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.12 + v * 0.025 + 0.06 * Math.sin(R.t * 4)); R.anhGiua(ctx, R.cham1('#d0103a'), 0, 0, S * 0.95); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; },
};

// =====================================================================================================
// P3 · HEX SABOTEUR (nguyenrua) — Vàng ĐB: GHÉP 2 Hex Saboteur → nguyền 1 ụ ngẫu nhiên (RNG gieo hạt) sau 1.5 s:
//      PVP: thử −1★ ụ đối thủ (1★: tê liệt 2.5 s, không xoá); khiên / Mirror Gate kiểm tra LÚC TRÚNG (Mirror Gate phản lại).
//      CO-OP: ụ ngẫu nhiên của đồng đội (<7★) +1★ cùng xác suất (không bao giờ phá đồng đội). SOLO: nguyền quái đầu (chậm 30% + nhận +15% 4 s).
//      Xác suất: 35% (LV9, 1★) +2%/cấp thẻ +5%/sao người ghép, trần 80%. Hồi 8 s CHUNG cả bàn — ghép trong lúc hồi = bỏ (tất định).
// =====================================================================================================
SKILLS.nguyenrua = {
  vai: 'db', dmg: 13, toc: 1, nham: 'dau', napMau: '#ff3a3a',
  CD: 8, TRE: 1.5,
  p: (T) => Math.min(0.8, kn7(T) + 0.05 * (clamp(T.sao, 1, 7) - 1)),
  mo(T) { const B = G.ban[T.ban], cd = B && B.hexCd > G.t ? Math.ceil(B.hexCd - G.t) : 0; return 'Merge two: hex a random turret after 1.5s — ' + Math.round(this.p(T) * 100) + '% · PVP: rival −1★ (1★: disabled 2.5s) · CO-OP: ally +1★ · SOLO: lead enemy slowed + weakened · team cooldown ' + this.CD + 's' + (cd ? ' (' + cd + 's)' : ''); },
  ban(G, B, T, E) { banNhe(B, T, E, { img: SK7.anh('nguyenrua', 'dan', 'dan_tia'), co: 15, mau: '#ff3a3a', sp: 560 }); },
  ghep(G, B, a, b, ra) {
    if (B.hexCd > G.t) return; // hồi chung: bỏ, không xếp hàng
    const n = (B.hexN || 0) + 1, r = SK7.rng(B, b.o, n, 2), p = this.p(a), c0 = B.o[b.o], D = banKhac(B);
    let o = null;
    if (G.che === 'pvp' && D) {
      const ds = D.t.filter(X => X && !X.st.da), X = ds.length ? ds[Math.floor(r() * ds.length)] : null;
      if (X) o = { D, uid: X.uid, o: X.o, cuoc: r() < p, kieu: 'pvp' };
    } else if (G.che === 'coop' && D) {
      const ds = D.t.filter(X => X && !X.st.da && X.sao < LUAT.saoMax), X = ds.length ? ds[Math.floor(r() * ds.length)] : null;
      if (X) o = { D, uid: X.uid, o: X.o, cuoc: r() < p, kieu: 'coop' };
    } else {
      B._dsT = -1; const E = quaiDau(B); // danh sách mục tiêu có thể đang nhớ từ trước bước này
      if (E) o = { E, cuoc: true, kieu: 'solo' };
    }
    if (!o) return; // không có đích: không tốn hồi chiêu
    B.hexCd = G.t + this.CD; B.hexN = n;
    G.hu.push(Object.assign({ k: 'hexBay', t: 0, song: this.TRE, B, x0: c0.x, y0: c0.y }, o));
    SND.set();
  },
};
HU.hexBay = { // âm thoa đỏ bay tới đích 1.5 s rồi phán (kiểm khiên / phản ở lúc trúng)
  cap(G, o) {
    if (o.t < o.song - 0.02 || o.xong) return false;
    o.xong = true;
    if (o.kieu === 'solo') { const E = o.E; if (E && !E.chet) { E.cham = Math.max(E.cham, 0.3); E.chamT = Math.max(E.chamT, 4); E.ywT = Math.max(E.ywT || 0, 4); E.ywK = Math.max(E.ywK || 0, 0.15); FX.no(SK7.anh('nguyenrua', 'hieu', 'laser_trung'), E.x, E.y, 60, 0.4); } return true; }
    const D = o.D, X = D.t[o.o]; if (!X || X.uid !== o.uid) return true; // ụ đã đổi/ghép mất trong lúc chờ → trượt
    const c = D.o[X.o];
    if (o.kieu === 'pvp') {
      if (chanKhien(D, X)) return true; // khiên / Mirror Gate (phản) chặn lúc trúng
      if (!o.cuoc) { FX.vong1(c.x, c.y, 6, 30, '#ff8080', 0.3, 2); return true; }
      FX.no(SK7.anh('nguyenrua', 'hieu', 'laser_trung'), c.x, c.y, 64, 0.45);
      if (X.sao > 1) { X.sao--; X.sang = 1; FX.tiaLua(c.x, c.y, 12, '#ff3a3a', 150); }
      else X.hexT = 2.5;
    } else if (o.cuoc && X.sao < LUAT.saoMax) {
      const s0 = X.sao; X.sao++; X.sang = 1; X.anim = { k: 'no', t: 0.25 }; mocMoi(X, s0, 0.1);
      FX.no(SK7.anh('nguyenrua', 'hieu', 'laser_trung'), c.x, c.y, 64, 0.45); FX.vong1(c.x, c.y, 6, 40, '#ffe46b', 0.4, 3);
    }
    return true;
  },
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / o.song), dich = o.kieu === 'solo' ? o.E : o.D && o.D.o[o.o];
    if (!dich) return;
    const x = o.x0 + (dich.x - o.x0) * u, y = o.y0 + (dich.y - o.y0) * u - Math.sin(u * Math.PI) * 40;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9;
    const a = R.img(SK7.anh('nguyenrua', 'dan', 'dan_tia')); if (a) { ctx.save(); ctx.translate(x, y); ctx.rotate(R.t * 8); ctx.drawImage(a, -11, -11, 22, 22); ctx.restore(); }
    R.anhGiua(ctx, R.cham1('#ff3a3a'), x, y, 30);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
};

// =====================================================================================================
// BARI · SANCTUM (thanhdia) — Vàng HỖ TRỢ: khi XUẤT HIỆN (triệu hồi / ghép ra): tẩy băng/đá/cháy/kẹp/tê liệt cho ô kề + khiên 1 lần.
//      Thường trực: ụ Tấn công kề +sát thương (đường cong hỗ trợ chung); khiên nạp lại mỗi 14 s. 5★: 8 ô xung quanh.
//      7★: khiên nạp lại mỗi 4 s (ô kề gần như miễn khống chế khi Sanctum còn đứng).
// =====================================================================================================
SKILLS.thanhdia = {
  vai: 'ht', dmg: 0, toc: 0, napMau: '#fff2b0', chiTC: true,
  k: (T) => 0.10 * HOTRO.k(T), // HOTRO.k đã nhân hệ số cấp thẻ (KY_NANG_CAP.thanhdia)
  ky: (T) => (ms(T, 7) ? 4 : 14),
  huong: (T) => (ms(T, 5) ? [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]] : [[-1, 0], [1, 0], [0, -1], [0, 1]]),
  xau: (X) => X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0 || X.giamT > 0 || X.hexT > 0,
  mo: (T) => 'On arrival: cleanses ' + (ms(T, 5) ? 'the 8 cells around' : 'neighbours') + ' + 1-hit shield · Attack neighbours +' + Math.round(Math.min(0.35, SKILLS.thanhdia.k(T)) * 100) + '% damage · shields recharge every ' + SKILLS.thanhdia.ky(T) + 's',
  sinh(G, T) { T.moiDen = 1; },
  hoTro(G, T, N, ra) { ra.dmg = this.k(T); },
  ke(B, T) { return HOTRO.oDich(T).map(o => B.t[o]).filter(X => X && X !== T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '255,242,176', 2.6, 0.4);
    const c0 = B.o[T.o];
    if (T.moiDen) { // tẩy + khiên khi xuất hiện
      T.moiDen = 0; T.sang = 1;
      for (const X of this.ke(B, T)) {
        if (this.xau(X)) { X.st.bang = 0; X.st.da = false; X.st.lua = 0; X.st.kep = 0; X.giamT = 0; X.hexT = 0; VX.donSach(B, X); }
        if (!(X.khien > 0)) X.khien = 1;
        const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#fff2b0');
      }
      FX.no(SK7.anh('thanhdia', 'hieu', 'laser_trung'), c0.x, c0.y, 90, 0.5);
      T.nap = 0; return true;
    }
    const ke = this.ke(B, T).filter(X => !X.st.da);
    if (!ke.some(X => !(X.khien > 0))) { T.nap = Math.max(T.nap, 0.999); return true; }
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap < 1) return true;
    T.nap = 0; T.sang = 1;
    for (const X of ke) if (!(X.khien > 0)) { X.khien = 1; const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#fff2b0'); FX.vong1(c.x, c.y, 30, 10, '#fff2b0', 0.4, 3); }
    return true;
  },
};

// =====================================================================================================
// LUPIN · PRISM THIEF (bienmau) — Vàng TC: đổi màu ĐỎ (đốt 3 s) → VÀNG (+40% chí mạng) → XANH (chậm 25% 1.5 s) mỗi 3 s theo nhịp riêng.
//      Ghép 2 Prism Thief ĐANG CÙNG MÀU → COMBO +1 (chung cả bàn, tối đa 10; có Prism Thief 5★ → 15): mọi Prism Thief +6% sát thương
//      +4% tốc bắn mỗi combo. Khác màu = ghép thường. 7★: mỗi phát mang cả 3 màu.
// =====================================================================================================
const PRISM_MAU = ['#ff4a2a', '#ffd23f', '#4fb8ff'];
SKILLS.bienmau = {
  vai: 'tc', dmg: 15, toc: 1, nham: 'dau', napMau: '#ffd23f',
  pc: (T) => kn7(T),
  mau: (T) => Math.floor(((T.tuoi || 0) + (T.uid % 3) * 1.0) / 3) % 3,
  tran: (B) => (B.t.some(X => X && X.id === 'bienmau' && X.sao >= 5) ? 15 : 10),
  mo(T) { const B = G.ban[T.ban], n = (B && B.prism) || 0; return ['RED: burns 3s', 'GOLD: +40% crit', 'BLUE: slows 25%'][this.mau(T)] + ' (colour changes every 3s)' + (T.sao >= 7 ? ' · 7★: every shot carries all 3' : '') + ' · merge two of the SAME colour: COMBO ' + n + '/' + (B ? this.tran(B) : 10) + ' (+' + (this.pc(T) * 100).toFixed(1) + '% damage, +4% fire rate each)'; },
  capNhat(G, B, T) {
    const n = Math.min(this.tran(B), B.prism || 0);
    if (n) { T.buf.dmg += n * this.pc(T); T.buf.toc += n * 0.04; T.nguon.push({ k: 'dmg', v: n * this.pc(T), T }); }
    if (this.mau(T) === 1 || T.sao >= 7) T.buf.crit += 0.4;
    return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = dauNong(T); SND.tia();
    const m = this.mau(T), ca = T.sao >= 7, dmg = dmgU(T);
    danThang(B, T, E, SK7.anh('bienmau', 'dan', 'dan_tia'), 640, 16, (G, d, M) => {
      if (!M) return;
      trung(M, dmg, { B, mau: PRISM_MAU[m] });
      if (M.chet) return;
      if (m === 0 || ca) { M.chayT = Math.max(M.chayT || 0, 3); M.chayD = Math.max(M.chayD || 0, dmg * 0.35); M.chayB = B; if (HU.chay && !G.hu.some(o => o.k === 'chay' && o.E === M)) G.hu.push({ k: 'chay', t: 0, song: 30, E: M, T }); }
      if ((m === 2 || ca) && !M.d.khangCham) { M.cham = Math.max(M.cham, 0.25); M.chamT = Math.max(M.chamT, 1.5); }
    });
    FX.no('chop_nong', x, y, 18, 0.08, T.goc);
  },
  ghep(G, B, a, b, ra) {
    if (a.id !== 'bienmau' || b.id !== 'bienmau' || this.mau(a) !== this.mau(b)) return;
    B.prism = Math.min(this.tran(B), (B.prism || 0) + 1);
    const c = B.o[b.o]; FX.vong1(c.x, c.y, 8, 50, PRISM_MAU[this.mau(a)], 0.4, 4); FX.no(SK7.anh('bienmau', 'hieu', 'laser_trung'), c.x, c.y, 70, 0.4);
  },
  sangDau: () => 0.08,
  veThem(ctx, T, S, al, R) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.32 + 0.08 * Math.sin(R.t * 5)); R.anhGiua(ctx, R.cham1(PRISM_MAU[SKILLS.bienmau.mau(T)]), 0, 0, S * 0.9); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; },
};

// =====================================================================================================
// móc chung: tê liệt Hex (1★ bị nguyền) · AI dùng Blood Circuit khi kẹt bàn · ngoài bộ RANDOM khi chưa có hình · trang ụ: % theo cấp thẻ
// =====================================================================================================
const _capNhatU7 = capNhatU;
capNhatU = function (B, T, dt) { if (T.hexT > 0) { T.hexT -= dt; T.st.ngam = Math.max(T.st.ngam || 0, 0.05); return; } return _capNhatU7(B, T, dt); };
const _aiBan7 = aiBan;
aiBan = function (B, dt) {
  // bàn đầy, không còn cặp ghép thường → Blood Circuit hiến ụ sao thấp nhất (ưu tiên cùng sao = +VAMP)
  if (B.aiT - dt <= 0 && oTrong(B).length === 0) {
    const ts = B.t.filter(Boolean), M = ts.filter(X => X.id === 'mauhut' && !biKhoa(X));
    const coCap = ts.some(a => ts.some(b => a !== b && a.id !== 'mauhut' && b.id !== 'mauhut' && hopLeGhep(a, b)));
    if (M.length && !coCap) {
      const a = M[0], ds = ts.filter(b => b !== a && b.id !== 'mauhut' && hopLeGhep(a, b)).sort((x, y) => (x.sao === a.sao ? -1 : 0) - (y.sao === a.sao ? -1 : 0) || x.sao - y.sao);
      if (ds[0]) { B.aiT = 0.6; ghep(B, a, ds[0]); return; }
    }
  }
  return _aiBan7(B, dt);
};
const _deckNN7 = deckNgauNhien;
deckNgauNhien = function (tru) { return _deckNN7([...(tru || []), ...SK7.CHUA_ANH]); };
if (typeof DC !== 'undefined' && DC.ngauNhien) { /* dkcham.js nạp sau — xem cuối file */ }

themHo('star', 3, 'mauhut', 'recycles ANY turret into a random one (no free stars) for VAMP charges');
themHo('guard', 3, 'nguyenrua', 'merge hexes a rival turret −1★ (co-op: ally +1★)');
themHo('guard', 3, 'thanhdia', 'cleanses + shields neighbours on arrival, damage aura');
themHo('crit', 3, 'bienmau', 'red/gold/blue cycling shots; same-colour merges build COMBO');

Object.assign(MOC_RIENG, {
  mauhut: { 5: ['DEEP DRAIN', 'Blood pulse 300% (not 220%)'], 7: ['BLOOD STAR', 'Same-star feed gives +2 VAMP'] },
  nguyenrua: { 5: ['SHARP HEX', 'Hex chance +20% (vs 1★)'], 7: ['DOOM HEX', 'Hex chance +30% (cap 80%)'] },
  thanhdia: { 5: ['WIDE SANCTUM', 'Cleanse, shield and aura reach all 8 cells around'], 7: ['HOLY GROUND', 'Shields recharge every 4s'] },
  bienmau: { 5: ['MASTER THIEF', 'COMBO cap 15'], 7: ['FULL SPECTRUM', 'Every shot burns, crits and slows'] },
});
Object.assign(SUP, { thanhdia: { icon: 'sup_khien', mau: '#fff2b0', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(Math.min(0.35, SKILLS.thanhdia.k(T))) + '% DAMAGE · SHIELD' } });
SUP_LOAI.thanhdia = 'khien';
SUP_GIA.thanhdia = (T) => SKILLS.thanhdia.k(T);

window.addEventListener('DOMContentLoaded', () => {
  // ảnh tạm: neo chân dung / khung mặt theo ụ nguồn của ảnh tạm (bỏ khi có hình riêng)
  const NG = { mauhut: 'loren', nguyenrua: 'nhieusong', thanhdia: 'taylo', bienmau: 'cauvong' };
  for (const id in NG) { try { if (typeof PO_NEO !== 'undefined' && !PO_NEO[id] && PO_NEO[NG[id]]) PO_NEO[id] = PO_NEO[NG[id]]; if (typeof HERO_NEO !== 'undefined' && !HERO_NEO[id] && HERO_NEO[NG[id]]) HERO_NEO[id] = HERO_NEO[NG[id]]; if (typeof FACE_BOX !== 'undefined' && !FACE_BOX[id] && FACE_BOX[NG[id]]) FACE_BOX[id] = FACE_BOX[NG[id]]; } catch (e) { } }
  if (typeof DC !== 'undefined' && DC.ngauNhien && !DC._sk7) { // RANDOM lấp ổ trống (dkcham.js) dùng G.roster thẳng → lọc ụ chưa có hình
    const g = DC.ngauNhien; DC._sk7 = 1;
    DC.ngauNhien = function () { const r0 = G.roster; G.roster = r0.filter(r => !SK7.CHUA_ANH.has(r.id)); try { return g.apply(this, arguments); } finally { G.roster = r0; } };
  }
});
