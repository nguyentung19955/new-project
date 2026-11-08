// TURRET MERGE — Ụ VÀNG MỚI ĐỢT 2 (docs/demo-hop-tuong/tuvan/tuong_vang/CHATGPT-PLAN.txt §3 P3/P6 + DE-XUAT-NHAP.md hàng 3/4):
//   Blood Circuit (mauhut · Strigoi) · Hex Saboteur (nguyenrua · Guiltyne) · Sanctum (thanhdia · Bari) · Prism Thief (bienmau · Lupin)
// Luật chung: bậc vàng, cấp thẻ đầu 9 (THE.lvDau), % kỹ năng theo CẤP THẺ — mục KY_NANG_CAP (data.js; trang ụ 'now → next level'), sao 1–7★, tất định online (RNG gieo hạt theo bàn + ô, cờ trạng thái gửi qua dongbo.js oTT/datO),
// KHÔNG chữ nổi trên bàn (chỉ ảnh PNG). Ngoài bộ RANDOM cho tới khi có hình (SK7.CHUA_ANH). Nạp SAU skills5.js (+ skills6.js nếu có).
'use strict';

const SK7 = {
  IDS: ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau'],
  CHUA_ANH: new Set([]), // id còn dùng ảnh tạm → không vào RANDOM / bộ máy (bỏ id khi hình ChatGPT đã lắp)
  // cấp thẻ tuyệt đối của ụ trên bàn B (9..15 với ụ vàng)
  lv(B, id) { const r = G.rosterMap && G.rosterMap[id]; return ((r && typeof THE !== 'undefined' && THE.lvDau[r.bac]) || 9) + ((B && B.capThe && B.capThe[id]) || 0); },
  // RNG tất định: cùng (bàn chủ hành động, ô, số lần) → cùng kết quả trên cả 2 máy online
  rng(B, o, n, k) { const s = ((typeof ONS !== 'undefined' && ONS.on ? ONS.seed : 7) | 0) * 1009 + (n | 0) * 7919 + (o | 0) * 131 + (k | 0) * 17; return rngHat(s); },
  FX: new Set(['mauhut', 'nguyenrua', 'thanhdia', 'bienmau']), // id đã có dải hiệu ứng ChatGPT assets/fx_<id>_sk.png (16 khung)
  anh(id, cot, du) { const t = 'fx_' + id + '_' + cot; return (typeof FXU !== 'undefined' && FXU.co && FXU.co(t)) ? t : du; },
};
// % kỹ năng theo cấp thẻ — bảng chung KY_NANG_CAP (data.js; trang ụ tự hiện 'Vamp +6% → +6.5%', online theo cấp trong chuỗi bộ bài)
Object.assign(KY_NANG_CAP, {
  mauhut: { ten: 'Blood Rite', base: 30, buoc: 0.9, max: 37.2, dv: '%', tien: '+', dmg: true }, // 08/11: Rite +30% ST × (1 + 3%/cấp)     // +% sát thương mỗi VAMP
  nguyenrua: { ten: 'Hex', base: 35, buoc: 2, max: 47, dv: '%', dmg: true },              // xác suất nguyền ở 1★ (+5%/sao, trần 80%)
  thanhdia: { ten: 'Dmg buff', base: 23, buoc: 0.92, max: 30.36, /* ×HOTRO.BAC.vang 2.3 (đo bậc 06/11) */ dv: '%', tien: '+', ht: 1 }, // buff sát thương 1★ (×HOTRO.K theo sao)
   // +% sát thương mỗi COMBO
});
const kn7 = (T) => (knThe(G.ban[T.ban], T.id) || KY_NANG_CAP[T.id].base) / 100;


// hiệu ứng kỹ năng: dải 16 khung ChatGPT assets/fx_<id>_sk.png (lưới 4×4 CAN-VE-2 → 1 hàng 320 px/khung; code chỉ chọn khung/phóng/xoay/mờ)
//  khung: mauhut 0–15 xung máu · nguyenrua 0–5 âm thoa bay, 6–15 sao vỡ · thanhdia 0–15 lửa thánh + vòm · bienmau 0–3/4–7/8–11 đạn đỏ/vàng/xanh, 12–15 nổ lăng kính
const FX7_KHUNG = { mauhut: [0, 15], nguyenrua: [6, 15], thanhdia: [0, 15], bienmau: [12, 15] };
function fx7Ve(ctx, R, id, f, x, y, w, al, goc) {
  if (!SK7.FX.has(id)) return false;
  const im = R.img('fx_' + id + '_sk'); if (!im) return false;
  const fw = im.height, i = clamp(Math.floor(f), 0, 15);
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); if (goc) ctx.rotate(goc);
  ctx.drawImage(im, i * fw, 0, fw, fw, -w / 2, -w / 2, w, w); ctx.restore(); ctx.globalAlpha = 1;
  return true;
}
HU.fx7 = { // 1 lần phát dải khung (f0 → f1) tại (x, y)
  ve(ctx, o, R) { const u = o.t / o.song, [f0, f1] = o.k; ctx.globalCompositeOperation = 'lighter'; fx7Ve(ctx, R, o.id, f0 + u * (f1 - f0 + 1), o.x, o.y, o.w, 1 - Math.max(0, u - 0.85) / 0.15); ctx.globalCompositeOperation = 'source-over'; },
};
function fx7(id, x, y, w, song) {
  if (SK7.FX.has(id)) { G.hu.push({ k: 'fx7', t: 0, song: Math.max(0.55, song * 1.6), id, x, y, w: w * 1.3, k: FX7_KHUNG[id] }); return; }
  FX.no('laser_trung', x, y, w, song);
}

// =====================================================================================================
// P6 · BLOOD CIRCUIT (mauhut) — Vàng ĐB. LÀM LẠI 08/11 (người dùng duyệt TOM-TAT mục 8, CHATGPT-SPEC A1 §7):
//      KÉO lên 1 ụ của mình → ĐÁNH DẤU (không di chuyển; cả 2 vẫn chạy bình thường). Sau 5 + 3 × sao (giây) mục tiêu bị NUỐT (ô trống) và Mạch Máu
//      nhận 5 × sao MÁU (riêng ụ, không trần). Mục tiêu +1★ → +3 s, −1★ → −3 s (còn ≥ 1 s). Mục tiêu hoá đá: dừng; mục tiêu bị ghép / đổi loại / mất:
//      huỷ (không thưởng). Mạch Máu bị băng/đá: dừng. Mỗi Mạch Máu đánh dấu 1 ụ (kéo lần nữa = đổi dấu).
//      KHÔNG nuốt: ụ 7★, Trứng (Evolver), Twin Anvil, Lõi Khởi Sinh, ụ Hỗ trợ, Mạch Máu khác. Đánh dấu / nuốt KHÔNG phải ghép (Archive không tính).
//      CHẠM Mạch Máu khi có ≥ 10 Máu → BLOOD RITE: tiêu 10 Máu, ụ Tấn công KỀ mạnh nhất +30% ST +15% tốc 20 s (× 1 + 3%/cấp thẻ; 1 buff/lúc, làm mới không cộng).
//      Online: dấu / máu / Rite theo cờ ô ('M…' 'C…' 'B…' 'R…' dongbo.js) · chạm = gói 'cd' (chuDong) · bàn con rối không tự nuốt (chờ ảnh chụp bàn).
// =====================================================================================================
SKILLS.mauhut = {
  vai: 'db', dmg: 17, toc: 0.9, nham: 'dau', napMau: '#d0103a', chuDongMoiSao: true,
  GIA: 10, SONG: 20, DMG: 0.30, TOC: 0.15,
  CAM: ['tienhoa', 'loren', 'khoisinh', 'mauhut'],
  camAn: (b) => !b || b.sao >= 7 || SKILLS.mauhut.CAM.includes(b.id) || !!(SKILLS[b.id] && SKILLS[b.id].vai === 'ht'),
  tg: (sao) => 5 + 3 * sao,
  he: (T) => heDB(G.ban[T.ban], 'mauhut'),
  mo(T) {
    const B = G.ban[T.ban], m = T.mh, X = m && B && B.t[m.o], h = this.he(T);
    return 'Blood ' + (T.mau || 0) + (m && X ? ' · eating ' + (TEXT.turret[X.id] ? TEXT.turret[X.id].name : X.id) + ' ' + X.sao + '★ in ' + Math.ceil(m.con) + 's' : '') +
      ' · drag onto one of your turrets to MARK it: both keep working, after 5s + 3s per ★ it is eaten and gives 5 Blood per ★ · target gains a ★: +3s, loses a ★: −3s · cannot eat 7★, eggs, Twin Anvil, Genesis Core or Support turrets · tap with 10+ Blood: BLOOD RITE — the best touching Attack turret gets +' + Math.round(this.DMG * h * 100) + '% damage and +' + Math.round(this.TOC * h * 100) + '% fire rate for 20s';
  },
  // Rite: ụ Tấn công kề mạnh nhất (sao cao nhất, hoà: ô nhỏ hơn), không đá/băng
  dichRite(B, T) { let m = null; for (const X of keCan(B, T.o)) if (X && SKILLS[X.id] && SKILLS[X.id].vai === 'tc' && !biKhoa(X) && (!m || X.sao > m.sao || (X.sao === m.sao && X.o < m.o))) m = X; return m; },
  aiNen(G, B, T) { return (T.mau || 0) >= this.GIA && !!this.dichRite(B, T); },
  chuDong(G, B, T) {
    if ((T.mau || 0) < this.GIA) return false;
    const X = this.dichRite(B, T), c = B.o[T.o];
    if (!X) { if (c) FX.chu1(c.x, c.y - 24, 'NO ATTACK NEIGHBOUR', '#ff9a9a', 11); return false; }
    const h = heDB(B, 'mauhut');
    T.mau -= this.GIA; T.nap = Math.min(1, T.mau / this.GIA);
    T.rite = { o: X.o, uid: X.uid, het: G.t + this.SONG, dmg: this.DMG * h, toc: this.TOC * h };
    const q = B.o[X.o]; tiaPhep(c.x, c.y, q.x, q.y, '#ff3a5a'); X.sang = 1; fx7('mauhut', q.x, q.y, 90, 0.4);
    FX.chu1(q.x, q.y - 28, 'BLOOD RITE', '#ff5a7a', 13, 'to'); SND.nang(2);
    return true;
  },
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, (T.mau || 0) / this.GIA);
    const m = T.mh; if (!m) return false;
    const X = B.t[m.o];
    if (!X || X.uid !== m.uid || X.id !== m.id || X === T) { T.mh = null; return false; } // mục tiêu bị ghép / đổi loại / mất: huỷ
    if (X.sao !== m.sao) { m.con = X.sao > m.sao ? m.con + 3 * (X.sao - m.sao) : Math.max(Math.min(1, m.con), m.con - 3 * (m.sao - X.sao)); m.sao = X.sao; }
    if (X.st.da) return false; // mục tiêu hoá đá: dừng
    m.con -= dt;
    if (m.con > 0) return false;
    if (B.net && typeof ONS !== 'undefined' && ONS.on) { m.con = 0; return false; } // bàn con rối: chờ ảnh chụp bàn của bạn
    const c = B.o[X.o], ct = B.o[T.o];
    B.t[X.o] = null; T.mh = null;
    T.mau = (T.mau || 0) + 5 * X.sao; T.sang = 1;
    G.bay.push({ id: X.id, sao: X.sao, x0: c.x, y0: c.y, x1: ct.x, y1: ct.y, t: 0, bac: X.bac });
    fx7('mauhut', c.x, c.y, 100, 0.45); FX.chu1(ct.x, ct.y - 30, '+' + 5 * X.sao + ' BLOOD', '#ff5a7a', 14, 'to'); SND.no(0.3);
    return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.7); const [x, y] = dauNong(T); SND.tia();
    const dmg = dmgU(T);
    const dm = danThang(B, T, E, SK7.anh('mauhut', 'dan', 'dan_tia'), 600, 16, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ff4a6a' }); }); if (dm.img === 'dan_tia') dm.mau = '#ff3a5a';
    FX.no('chop_nong', x, y, 18, 0.08, T.goc);
  },
  ghepDB: {
    hopLe: (a, b) => b.ban === a.ban && a !== b && !b.st.da && !SKILLS.mauhut.camAn(b),
    laGhep: () => false, // đánh dấu không phải ghép
    lam(G, B, a, b) { // a = Mạch Máu (kéo), b = mục tiêu: chỉ ĐÁNH DẤU (không ai bị đổi chỗ)
      a.mh = { o: b.o, uid: b.uid, id: b.id, sao: b.sao, con: SKILLS.mauhut.tg(b.sao), tong: SKILLS.mauhut.tg(b.sao) };
      const ca = B.o[a.o], cb = B.o[b.o]; tiaPhep(ca.x, ca.y, cb.x, cb.y, '#d0103a');
      FX.chu1(cb.x, cb.y - 26, 'MARKED ' + Math.round(a.mh.con) + 's', '#ff7a8a', 12, 'to'); a.sang = 1;
      SND.dat();
      return a;
    },
  },
  ghep() { },
  sangDau: (T) => Math.min(0.3, (T.mau || 0) / 60),
};
// Blood Rite: áp lên ụ được chọn mỗi khung (buff có thời hạn → hình giữ tới hết)
{
  const _mocBufMH = mocBuf;
  mocBuf = function (B) {
    const r = _mocBufMH.apply(this, arguments);
    if (B && B.t) for (const T of B.t) {
      if (!T || T.id !== 'mauhut' || !T.rite) continue;
      if (T.rite.het <= G.t) { T.rite = null; continue; }
      const X = B.t[T.rite.o]; if (!X || X.uid !== T.rite.uid || biKhoa(X)) continue;
      X.buf.dmg += T.rite.dmg; X.buf.toc += T.rite.toc;
    }
    return r;
  };
}
// hình: dấu máu nhỏ nhấp nháy trên mục tiêu đang bị đánh dấu + giọt máu nhỏ trên ụ đang có Blood Rite (PNG mauhut_phu, không vòng)
HU.mhVe = {
  cap(G, o) { return G.ban.indexOf(o.B) < 0; },
  ve(ctx, o) {
    const B = o.B, im = REN.img('mauhut_phu'); if (!B || !im) return;
    const t = typeof REN.t === 'number' ? REN.t : G.t, C = Math.min(B.cw, B.ch);
    for (const T of B.t) {
      if (!T || T.id !== 'mauhut') continue;
      if (T.mh) { const X = B.t[T.mh.o]; if (X && X.uid === T.mh.uid) { const c = B.o[X.o], k = 1 - Math.max(0, T.mh.con) / (T.mh.tong || 1); PX.ve(ctx, im, c.x, c.y - C * 0.32 + Math.sin(t * 5) * 2, C * (0.22 + 0.12 * k), C * (0.22 + 0.12 * k), 0, 0.7 + 0.3 * Math.sin(t * 8)); } }
      if (T.rite && T.rite.het > G.t) { const X = B.t[T.rite.o]; if (X && X.uid === T.rite.uid) { const c = B.o[X.o]; PX.ve(ctx, im, c.x - C * 0.3, c.y + C * 0.18 + Math.sin(t * 3) * 2, C * 0.2, C * 0.2, 0, 0.95); } }
    }
  },
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
  mo(T) { const B = G.ban[T.ban], cd = B && B.hexCd > G.t ? Math.ceil(B.hexCd - G.t) : 0; return 'Merge two: hex a random turret after 1.5s — ' + Math.round(this.p(T) * 100) + '% · PVP: rival −1★ (1★: disabled 2.5s) · CO-OP: ally +1★ · SOLO (always): lead enemy slowed 30% + takes +15% for 4s · team cooldown ' + this.CD + 's' + (cd ? ' (' + cd + 's)' : ''); },
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
    if (o.kieu === 'solo') { const E = o.E; if (E && !E.chet) { E.cham = Math.max(E.cham, 0.3); E.chamT = Math.max(E.chamT, 4); E.ywT = Math.max(E.ywT || 0, 4); E.ywK = Math.max(E.ywK || 0, 0.15); fx7('nguyenrua', E.x, E.y, 60, 0.4); } return true; }
    const D = o.D, X = D.t[o.o]; if (!X || X.uid !== o.uid) return true; // ụ đã đổi/ghép mất trong lúc chờ → trượt
    const c = D.o[X.o];
    if (o.kieu === 'pvp') {
      if (chanKhien(D, X)) return true; // khiên / Mirror Gate (phản) chặn lúc trúng
      if (!o.cuoc) { FX.vong1(c.x, c.y, 6, 30, '#ff8080', 0.3, 2); return true; }
      fx7('nguyenrua', c.x, c.y, 64, 0.45);
      if (X.sao > 1) { X.sao--; X.sang = 1; FX.tiaLua(c.x, c.y, 12, '#ff3a3a', 150); }
      else if (!biKhoa(X)) X.hexT = 2.5; // ụ khoá không nhận tê liệt — rà cộng hưởng 07/11, người dùng chốt
    } else if (o.cuoc && X.sao < LUAT.saoMax) {
      const s0 = X.sao; X.sao++; X.sang = 1; X.anim = { k: 'no', t: 0.25 }; mocMoi(X, s0, 0.1);
      fx7('nguyenrua', c.x, c.y, 64, 0.45); FX.vong1(c.x, c.y, 6, 40, '#ffe46b', 0.4, 3);
    }
    return true;
  },
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / o.song), dich = o.kieu === 'solo' ? o.E : o.D && o.D.o[o.o];
    if (!dich) return;
    const x = o.x0 + (dich.x - o.x0) * u, y = o.y0 + (dich.y - o.y0) * u - Math.sin(u * Math.PI) * 40;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9;
    const g = Math.atan2(dich.y - o.y0, dich.x - o.x0);
    if (!fx7Ve(ctx, R, 'nguyenrua', Math.min(5, u * 8), x, y, 46, 0.95, g)) { const a = R.img(SK7.anh('nguyenrua', 'dan', 'dan_tia')); if (a) { ctx.save(); ctx.translate(x, y); ctx.rotate(R.t * 8); ctx.drawImage(a, -11, -11, 22, 22); ctx.restore(); } R.anhGiua(ctx, R.cham1('#ff3a3a'), x, y, 30); }
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
  mo: (T) => 'On arrival: cleanses ' + (ms(T, 5) ? 'the 8 cells around' : 'neighbours') + ' + 1-hit shield · Attack neighbours +' + Math.round(HOTRO.hd(T, 'dmg', SKILLS.thanhdia.k(T)) * 100) + '% damage · shields recharge every ' + SKILLS.thanhdia.ky(T) + 's',
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
      fx7('thanhdia', c0.x, c0.y, 90, 0.5);
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
// LUPIN · PRISM THIEF (bienmau) — Vàng TC. LÀM LẠI 08/11 (người dùng duyệt TOM-TAT mục 7, CHATGPT-SPEC A1 §6):
//      Mỗi Prism sinh ra 1 MÀU (hạt giống) giữ suốt đời — đầu = mặt nạ màu (bienmau_m_*):
//        ĐỎ  4% giết ngay quái thường (không tinh anh/trùm) → +1 đầu lâu: +2% ST vào quái thường mỗi cộng dồn
//        VÀNG 6% +2 mana (cả bàn tối đa 6 mana/giây) → +1 cộng dồn: +1% ST
//        LAM 8% đóng băng quái thường 1.0 s (+0.06 s / cộng dồn; tinh anh/trùm miễn) → +1 cộng dồn
//        LỤC 10% đòn đó +40% ST chí mạng → +1 cộng dồn: +5% ST chí mạng vĩnh viễn
//      Mỗi Prism hồi 1 s / quái cho lần kích hoạt. Trần cộng dồn 10 / 12 / 14 / 16 / 18 (LV9 / 11 / 13 / 15 / 17). Ngẫu nhiên: rngHat(hạt trận + bàn + ô + số đòn).
//      CHROMATIC CIRCUIT: 4 Prism 4 MÀU KHÁC NHAU ở 4 ô nối liền (trên/dưới/trái/phải) — VUỐT 1 đường qua đủ 4 ô (không chéo, không lặp, không ô thứ 5).
//        Hồi 25 s / bàn. Mỗi Prism tiêu ≤ 3 cộng dồn của mình (+5% độ mạnh mỗi cộng dồn, tối đa ×1.6). MÀU CUỐI vuốt = đòn kết:
//        ĐỎ 4 Prism +70% ST vào quái thường / +25% tinh anh & trùm 6 s · VÀNG +8 + 2 × cộng dồn vàng đã tiêu mana (≤ 18) · LAM đóng băng 6 quái thường 1.5 s,
//        choáng 2 tinh anh 0.3 s · LỤC 4 Prism +70% ST chí mạng +10% chí mạng 6 s. Không phải ghép. Online: gói 'pm' (dongbo.js), màu/cộng dồn theo cờ ô.
// =====================================================================================================
const PRISM_MAU = ['#ff4a2a', '#ffd23f', '#4fb8ff', '#5cff7a'];
SKILLS.bienmau = {
  vai: 'tc', dmg: 15, toc: 1, nham: 'dau',
  TEN: ['RED', 'GOLD', 'BLUE', 'GREEN'], ANH: ['bienmau_m_do', 'bienmau_m_vang', 'bienmau_m_lam', 'bienmau_m_luc'],
  TI: [0.04, 0.06, 0.08, 0.10], HOI: 25, MANA_S: 6,
  mau: (T) => (T.pm | 0) & 3,
  tran(T) { const k = (G.ban[T.ban] && G.ban[T.ban].capThe && G.ban[T.ban].capThe.bienmau) | 0; return 10 + 2 * Math.min(4, k >> 1); },
  thuong: (q) => (q === 0 ? 'kill a normal enemy at once' : q === 1 ? '+2 mana' : q === 2 ? 'freeze a normal enemy' : '+40% crit damage on that hit'),
  mo(T) {
    const q = this.mau(T), st = Math.min(this.tran(T), T.pms || 0), B = G.ban[T.ban], hoi = B ? Math.max(0, Math.ceil((B.pmCd || 0) - G.t)) : 0;
    const so = q === 0 ? '+' + st * 2 + '% damage vs normal enemies' : q === 1 ? '+' + st + '% damage' : q === 2 ? 'freeze ' + (1 + 0.06 * st).toFixed(2) + 's' : '+' + st * 5 + '% crit damage';
    return this.TEN[q] + ' PRISM: ' + Math.round(this.TI[q] * 100) + '% per hit to ' + this.thuong(q) + ' · stacks ' + st + '/' + this.tran(T) + ' → ' + so +
      ' · CHROMATIC CIRCUIT' + (hoi ? ' (ready in ' + hoi + 's)' : '') + ': 4 Prisms of 4 different colours side by side — swipe one line through all 4 · the LAST colour you swipe decides the finish: red +70% damage, gold +mana, blue freeze, green +70% crit damage · 25s cooldown';
  },
  sinh(G, T) {
    if (T.pm == null) { const B = G.ban[T.ban]; const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1; if (B) B._pmN = (B._pmN | 0) + 1; T.pm = Math.floor(rngHat((hat * 5303 + ((B && B.i) | 0) * 389 + (T.o | 0) * 157 + ((B && B._pmN) | 0) * 7919) | 0)() * 4); }
    if (T.pms == null) T.pms = 0;
  },
  dauAnh(T) { return this.ANH[this.mau(T)]; },
  dauAnhK: () => 0.86,
  // mặt nạ LUÔN nằm ngang/thẳng đứng đúng chiều (08/11 người dùng: cầm kéo thấy mặt nạ dựng dọc) — không xoay theo mục tiêu, cả lúc cầm kéo:
  //   mặt nạ màu (bienmau_m_*) vẽ thẳng ở góc 0; đầu dự phòng bienmau_nong (vẽ theo chiều nòng → phải) xoay −90° cho thẳng
  gocDau() { return REN._dauEp && REN._dauEp[0] === 'bienmau' ? 0 : -Math.PI / 2; },
  dauGhost: (T) => T && T.pm != null, // bản đang cầm (ghost) cũng vẽ đúng mặt nạ màu của ụ
  capNhat(G, B, T) {
    const q = this.mau(T), st = Math.min(this.tran(T), T.pms || 0);
    if (q === 1) T.buf.dmg += 0.01 * st;
    if (q === 3) T.buf.cdmg = (T.buf.cdmg || 0) + 0.05 * st;
    const k = T.pmB; if (k && k.het > G.t && k.q === 3) { T.buf.cdmg = (T.buf.cdmg || 0) + k.cdmg; T.buf.crit += k.crit; }
    return false;
  },
  rng(B, T) { T.pmN = (T.pmN | 0) + 1; const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1; return rngHat((hat * 2833 + B.i * 401 + T.o * 1009 + T.pmN * 7919) | 0)(); },
  laThuong: (M) => !M.trum && !(M.d && M.d.to),
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = dauNong(T); SND.tia();
    const q = this.mau(T), S = this;
    danThang(B, T, E, SK7.anh('bienmau', 'dan', 'dan_tia'), 640, 16, (G, d, M) => {
      if (!M || M.chet) return;
      const st = Math.min(S.tran(T), T.pms || 0), thuong = S.laThuong(M), k = T.pmB && T.pmB.het > G.t ? T.pmB : null;
      let them = (q === 0 && thuong ? 0.02 * st : 0) + (k && k.q === 0 ? (thuong ? k.n : k.e) : 0);
      // kích hoạt: 1 lần quay / đòn, hồi 1 s mỗi quái cho Prism này
      const cd = M.pmCd || (M.pmCd = {}), kh = !(cd[T.uid] > G.t) && S.rng(B, T) < S.TI[q] && (q === 1 || q === 3 || thuong);
      if (kh) cd[T.uid] = G.t + 1;
      const cong = () => { T.pms = Math.min(S.tran(T), (T.pms || 0) + 1); T.sang = 1; };
      if (kh && q === 3) { T.buf.cdmg = (T.buf.cdmg || 0) + 0.4; trung(M, dmgU(T, them), { B, mau: PRISM_MAU[3] }); T.buf.cdmg -= 0.4; cong(); return; }
      trung(M, dmgU(T, them), { B, mau: PRISM_MAU[q] });
      if (!kh) return;
      if (q === 0 && !M.chet) { trung(M, M.hp + 1, { B, T, phu: true, crit: false, mau: '#ff4a2a' }); FX.chu1(M.x, M.y - 20, 'STOLEN', '#ff7a5a', 11); cong(); }
      else if (q === 1) {
        if (B.pmMt == null || G.t - B.pmMt >= 1) { B.pmMt = G.t; B.pmMv = 0; }
        if ((B.pmMv || 0) + 2 <= S.MANA_S) { B.pmMv = (B.pmMv || 0) + 2; B.mana += 2; FX.chu1(M.x, M.y - 20, '+2', '#ffd23f', 11); }
        cong();
      } else if (q === 2 && !M.chet) { const t = 1 + 0.06 * Math.min(S.tran(T), T.pms || 0); M.chan = Math.max(M.chan || 0, t); FX.no('bang_vo', M.x, M.y, 50, 0.35); cong(); }
    });
    FX.no('chop_nong', x, y, 18, 0.08, T.goc);
  },
  // kiểm 1 đường vuốt (4 ô) — trả { ds, loi } (thuần, không đổi gì)
  kiemMach(B, oS) {
    if (!B || !Array.isArray(oS) || oS.length !== 4) return { loi: 'path' };
    if (new Set(oS).size !== 4) return { loi: 'path' };
    for (let i = 1; i < 4; i++) { const a = oS[i - 1], b = oS[i]; if (!(Math.abs(a - b) === 5 || (Math.abs(a - b) === 1 && ((a / 5) | 0) === ((b / 5) | 0)))) return { loi: 'path' }; }
    const ds = oS.map(o => B.t[o]);
    if (ds.some(X => !X || X.id !== 'bienmau' || biKhoa(X))) return { loi: 'prism' };
    if (new Set(ds.map(X => this.mau(X))).size !== 4) return { loi: 'colour' };
    if ((B.pmCd || 0) > G.t) return { loi: 'cd' };
    return { ds };
  },
  mach(B, oS, ep) {
    const v = this.kiemMach(B, oS); if (!v.ds) return false;
    const ds = v.ds, cuoi = this.mau(ds[3]);
    let tong = 0, vang = 0;
    for (const X of ds) { const c = Math.min(3, X.pms || 0); X.pms = (X.pms || 0) - c; tong += c; if (this.mau(X) === 1) vang += c; }
    const k = 1 + 0.05 * Math.min(12, tong);
    B.pmCd = G.t + this.HOI;
    if (cuoi === 0) for (const X of ds) X.pmB = { q: 0, het: G.t + 6, n: 0.7 * k, e: 0.25 * k };
    else if (cuoi === 3) for (const X of ds) X.pmB = { q: 3, het: G.t + 6, cdmg: 0.7 * k, crit: 0.10 * k };
    else if (cuoi === 1) B.mana += Math.min(18, 8 + 2 * vang);
    else {
      const qs = dsMucTieu(B).filter(E => !E.chet).sort((p, q) => (G.duong[p.p].len - p.s) - (G.duong[q.p].len - q.s));
      for (const E of qs.filter(E => this.laThuong(E)).slice(0, 6)) { E.chan = Math.max(E.chan || 0, 1.5 * k); FX.no('bang_vo', E.x, E.y, 60, 0.4); }
      for (const E of qs.filter(E => E.d && E.d.to && !E.trum).slice(0, 2)) E.chan = Math.max(E.chan || 0, 0.3);
    }
    for (let i = 0; i < 4; i++) { const X = ds[i], c = B.o[X.o]; X.sang = 1; if (i) { const p = B.o[ds[i - 1].o]; tiaPhep(p.x, p.y, c.x, c.y, PRISM_MAU[this.mau(X)]); } }
    const c = B.o[ds[3].o]; fx7('bienmau', c.x, c.y, 110, 0.45);
    FX.chu1(c.x, c.y - 30, 'CHROMATIC ' + this.TEN[cuoi], PRISM_MAU[cuoi], 14, 'to');
    if (!B.ai || G.che === 'pvp') SND.combo(12);
    if (!ep && typeof ONS !== 'undefined' && ONS.on && B === G.ban[0] && ONS.gui) ONS.gui('pm', { o: oS });
    return true;
  },
  // AI: có đường 4 màu hợp lệ thì vuốt (thử mọi đường 4 ô liền)
  timMach(B) {
    const ke = (o) => { const r = []; const c = o % 5; if (c > 0) r.push(o - 1); if (c < 4) r.push(o + 1); if (o >= 5) r.push(o - 5); if (o < 10) r.push(o + 5); return r; };
    for (let a = 0; a < 15; a++) for (const b of ke(a)) for (const c of ke(b)) for (const d of ke(c)) { const p = [a, b, c, d]; if (this.kiemMach(B, p).ds) return p; }
    return null;
  },
  ghep() { },
};

// =====================================================================================================
// móc chung: tê liệt Hex (1★ bị nguyền) · AI dùng Blood Circuit khi kẹt bàn · ngoài bộ RANDOM khi chưa có hình · trang ụ: % theo cấp thẻ
// =====================================================================================================
const _capNhatU7 = capNhatU;
capNhatU = function (B, T, dt) { if (T.hexT > 0) { T.hexT -= dt; T.st.ngam = Math.max(T.st.ngam || 0, 0.05); return; } return _capNhatU7(B, T, dt); };
const _aiBan7 = aiBan;
aiBan = function (B, dt) {
  // Prism Thief: có đường 4 màu → vuốt CHROMATIC CIRCUIT
  if (B.aiT - dt <= 0 && B.t.some(X => X && X.id === 'bienmau') && !((B.pmCd || 0) > G.t)) { const p = SKILLS.bienmau.timMach(B); if (p) { B.aiT = 0.6; SKILLS.bienmau.mach(B, p); return; } }
  // bàn đầy, không còn cặp ghép thường → Mạch Máu (chưa đánh dấu) đánh dấu ụ sao thấp nhất được phép (nuốt dọn chỗ)
  if (B.aiT - dt <= 0 && oTrong(B).length === 0) {
    const ts = B.t.filter(Boolean), M = ts.filter(X => X.id === 'mauhut' && !biKhoa(X) && !X.mh);
    const coCap = ts.some(a => ts.some(b => a !== b && a.id !== 'mauhut' && b.id !== 'mauhut' && hopLeGhep(a, b)));
    if (M.length && !coCap) {
      const a = M[0], dau = new Set(ts.filter(X => X.id === 'mauhut' && X.mh).map(X => X.mh.o)), ds = ts.filter(b => b !== a && !dau.has(b.o) && hopLeGhep(a, b)).sort((x, y) => x.sao - y.sao || x.o - y.o);
      if (ds[0]) { B.aiT = 0.6; ghep(B, a, ds[0]); return; }
    }
  }
  return _aiBan7(B, dt);
};
const _batDau7 = batDau; // nạp sẵn dải hiệu ứng của ụ có trong các bộ bài trận này
batDau = function () {
  const r = _batDau7.apply(this, arguments);
  try {
    for (const B of G.ban) for (const id of B.deck) if (SK7.FX.has(id)) REN.img('fx_' + id + '_sk');
    for (const B of G.ban) { if (B.deck.includes('mauhut')) { G.hu.push({ k: 'mhVe', t: 0, B }); REN.img('mauhut_phu'); } if (B.deck.includes('bienmau')) for (const a of SKILLS.bienmau.ANH) REN.img(a); }
  } catch (e) { }
  return r;
};
const _deckNN7 = deckNgauNhien;
deckNgauNhien = function (tru) { return _deckNN7([...(tru || []), ...SK7.CHUA_ANH]); };
if (typeof DC !== 'undefined' && DC.ngauNhien) { /* dkcham.js nạp sau — xem cuối file */ }

themHo('star', 3, 'mauhut', 'marks a turret, eats it for Blood, Blood Rite buffs a neighbour');
themHo('guard', 3, 'nguyenrua', 'merge hexes a rival turret −1★ (co-op: ally +1★)');
themHo('guard', 3, 'thanhdia', 'cleanses + shields neighbours on arrival, damage aura');
themHo('crit', 3, 'bienmau', '4 colours; swipe 4 different colours for CHROMATIC CIRCUIT');

Object.assign(MOC_RIENG, {
  nguyenrua: { 5: ['SHARP HEX', 'Hex chance +20% (vs 1★)'], 7: ['DOOM HEX', 'Hex chance +30% (cap 80%)'] },
  thanhdia: { 5: ['WIDE SANCTUM', 'Cleanse, shield and aura reach all 8 cells around'], 7: ['HOLY GROUND', 'Shields recharge every 4s'] },
});
Object.assign(SUP, { thanhdia: { icon: 'sup_khien', mau: '#fff2b0', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(HOTRO.hd(T, 'dmg', SKILLS.thanhdia.k(T))) + '% DAMAGE · SHIELD' } });
SUP_LOAI.thanhdia = 'khien';
SUP_GIA.thanhdia = (T) => SKILLS.thanhdia.k(T);

window.addEventListener('DOMContentLoaded', () => {
  if (typeof DC !== 'undefined' && DC.ngauNhien && !DC._sk7) { // RANDOM lấp ổ trống (dkcham.js) dùng G.roster thẳng → lọc ụ chưa có hình
    const g = DC.ngauNhien; DC._sk7 = 1;
    DC.ngauNhien = function () { const r0 = G.roster; G.roster = r0.filter(r => !SK7.CHUA_ANH.has(r.id)); try { return g.apply(this, arguments); } finally { G.roster = r0; } };
  }
});
