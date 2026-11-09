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
  mauhut: { ten: 'Devour time', base: 0, buoc: -4, max: -32, dv: '%', dmg: true }, // 09/11: thời gian nuốt −4% mỗi cấp thẻ (LV9 0% → LV17 −32%)
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
// P6 · BLOOD CIRCUIT (mauhut) — Vàng TẤN CÔNG. LÀM LẠI 09/11 (người dùng: "đổi thành ụ attack, càng nhiều máu thì blood càng mạnh, các mốc máu hiện
//      ngay ở góc bên phải của ụ, đổi trạng thái ụ khi đạt số máu quy định … càng tăng cao level gacha thì càng ít thời gian khi muốn nuốt"):
//      BẮN đạn máu vào quái đầu. MÁU (riêng từng ụ, KHÔNG trần) tăng sát thương, tốc bắn, tỉ lệ / ST chí mạng của CHÍNH nó (chí mạng ≤ 100%, critU).
//      Ụ mới (gọi ra / ghép thường / Copycat) = 0 Máu. Nâng sao tại chỗ giữ Máu.
//      KÉO lên 1 ụ của mình → ĐÁNH DẤU (không di chuyển). Sau (5 + 3 × sao) × (1 − 4% × cấp thẻ trên LV9) giây mục tiêu bị NUỐT → +5 × sao Máu.
//      Mục tiêu +1★ → +3 s, −1★ → −3 s · mục tiêu đá / băng: dừng đếm · mục tiêu bị ghép / đổi loại / mất: huỷ. Mỗi Mạch Máu đánh dấu 1 ụ.
//      KHÔNG nuốt: ụ 7★, Trứng, Twin Anvil, Lõi Khởi Sinh, ụ Hỗ trợ, Mạch Máu khác. Đánh dấu / nuốt KHÔNG phải ghép. BỎ Blood Rite + vòng nạp xanh.
//      DẠNG theo mốc Máu 20 / 50 / 100 (4 hình: assets/mauhut_f<2..4>_*.png, chưa có ảnh → hình cũ) + mốc 200 BLOOD MOON (nova dày hơn):
//        dạng càng cao đạn càng to / đỏ; từ 100 Máu mỗi phát thứ 6 (200 Máu: thứ 4) nổ NOVA máu quanh điểm trúng.
//      Số Máu: góc TRÊN-PHẢI ô, màu theo mốc. Online: 'B' Máu · 'P' dạng · 'Q' đếm phát · 'M'/'C' dấu (dongbo.js); bàn con rối không tự nuốt.
// =====================================================================================================
SKILLS.mauhut = { // 09/11 gánh hậu kỳ: ST 17 → 22, tốc 0.9 → 1.3
  vai: 'tc', dmg: 22, toc: 1.3, nham: 'dau', napMau: null,
  MOC: [20, 50, 100, 200],
  TEN: ['BLOOD CIRCUIT', 'BLOOD HUNTER', 'CRIMSON ENGINE', 'SANGUINE SOVEREIGN', 'BLOOD MOON'],
  MAU: ['#f6e3e6', '#ff7080', '#ff2a4a', '#ffd23f', '#ff8af0'], // màu số Máu theo mốc
  DMG: 0.05, TOC: 0.006, CRIT: 0.002, CDMG: 0.03,               // mỗi 1 Máu
  DANG_DMG: [0, 0.15, 0.4, 0.6, 0.9],                            // thưởng thêm khi đạt mốc (không cộng dồn, lấy bậc hiện tại)
  NOVA: [0, 10, 6, 5, 4], NOVA_K: 1.2, NOVA_R: 55,               // nova máu: mỗi phát thứ N, ×1.2 ST quanh điểm trúng (09/11 hậu kỳ: từ 20 Máu — trước [0,0,0,6,4] chỉ từ 100 Máu)
  CAM: ['tienhoa', 'loren', 'khoisinh', 'mauhut'],
  camAn: (b) => !b || b.sao >= 7 || SKILLS.mauhut.CAM.includes(b.id) || !!(SKILLS[b.id] && SKILLS[b.id].vai === 'ht'),
  // thời gian nuốt: cấp thẻ −4% / cấp (KY_NANG_CAP.mauhut: 0 → −32% ở LV17)
  kTg: (B) => 1 + (knThe(B, 'mauhut') || 0) / 100,
  tg(sao, B) { return Math.round((5 + 3 * sao) * this.kTg(B || (typeof G !== 'undefined' && G.ban && G.ban[0])) * 100) / 100; },
  dang(T) { const n = (T && T.mau) || 0, M = this.MOC; return n >= M[3] ? 4 : n >= M[2] ? 3 : n >= M[1] ? 2 : n >= M[0] ? 1 : 0; },
  hinh(T) { return Math.min(3, this.dang(T)); }, // 0..3 = dạng 1..4 (Blood Moon dùng hình dạng 4)
  mo(T) {
    const B = G.ban[T.ban], m = T.mh, X = m && B && B.t[m.o], n = T.mau || 0, d = this.dang(T), nx = this.MOC.find(v => v > n);
    return 'Blood ' + n + ' (' + this.TEN[d] + ') → +' + Math.round(n * this.DMG * 100 + this.DANG_DMG[d] * 100) + '% damage, +' + +(n * this.TOC * 100).toFixed(1) + '% fire rate, +' +
      +(n * this.CRIT * 100).toFixed(1) + '% crit chance, +' + Math.round(n * this.CDMG * 100) + '% crit damage' + (nx ? ' · next form at ' + nx + ' Blood' : '') +
      (m && X ? ' · eating ' + (TEXT.turret[X.id] ? TEXT.turret[X.id].name : X.id) + ' ' + X.sao + '★ in ' + Math.ceil(m.con) + 's' : '') +
      ' · drag onto one of your turrets to MARK it: after ' + this.tg(1, B) + 's + ' + Math.round(3 * this.kTg(B) * 10) / 10 + 's per ★ it is eaten and gives 5 Blood per ★' +
      ' · each Blood: +5% damage, +0.6% fire rate, +0.2% crit (max 100%), +3% crit damage, no limit · new forms at 20 / 50 / 100 Blood: bigger bolts, more damage · 20 Blood: every 10th shot is a blood nova (50 / 100 / 200 Blood: every 6th / 5th / 4th)' +
      ' · cannot eat 7★, eggs, Twin Anvil, Genesis Core or Support turrets · a frozen or stone target pauses the timer · new Blood Circuits start with 0 Blood';
  },
  capNhat(G, B, T, dt) {
    const n = T.mau || 0, d = this.dang(T);
    if (n) { T.buf.dmg += n * this.DMG + this.DANG_DMG[d]; T.buf.toc += n * this.TOC; T.buf.crit += n * this.CRIT; T.buf.cdmg = (T.buf.cdmg || 0) + n * this.CDMG; }
    const m = T.mh; if (!m) return false;
    const X = B.t[m.o];
    if (!X || X.uid !== m.uid || X.id !== m.id || X === T) { T.mh = null; return false; } // mục tiêu bị ghép / đổi loại / mất: huỷ
    if (X.sao !== m.sao) { m.con = X.sao > m.sao ? m.con + 3 * (X.sao - m.sao) : Math.max(Math.min(1, m.con), m.con - 3 * (m.sao - X.sao)); m.sao = X.sao; m.tong = Math.max(m.tong, m.con); }
    if (biKhoa(X)) return false; // mục tiêu hoá đá / ĐÓNG BĂNG: dừng đếm
    m.con -= dt;
    if (m.con > 0) return false;
    if (B.net && typeof ONS !== 'undefined' && ONS.on) { m.con = 0; return false; } // bàn con rối: chờ ảnh chụp bàn của bạn
    const c = B.o[X.o], ct = B.o[T.o];
    B.t[X.o] = null; T.mh = null;
    T.mau = (T.mau || 0) + 5 * X.sao; T.sang = 1;
    G.bay.push({ id: X.id, sao: X.sao, x0: c.x, y0: c.y, x1: ct.x, y1: ct.y, t: 0, bac: X.bac });
    fx7('mauhut', c.x, c.y, 100, 0.45); SND.no(0.3);
    if (G.hu) G.hu.push({ k: 'mhPop', t: 0, song: 1.1, B, T, so: '+' + 5 * X.sao });
    return false;
  },
  // đạn máu theo dạng (ảnh ChatGPT fx_mauhut_b1–b3, chưa có → đạn tia cũ tô đỏ) · nova: mỗi phát thứ N (đếm T.mhN — tất định, gửi online)
  DAN: ['fx_mauhut_b1', 'fx_mauhut_b1', 'fx_mauhut_b2', 'fx_mauhut_b3', 'fx_mauhut_b3'],
  CO: [16, 19, 23, 28, 32],
  ban(G, B, T, E) {
    const d = this.dang(T); giat(T, 0.6 + 0.1 * d); const [x, y] = dauNong(T); SND.tia();
    const dmg = dmgU(T), N = this.NOVA[d]; T.mhN = ((T.mhN | 0) + 1) % 1000000;
    const nova = N > 0 && T.mhN % N === 0, S = this;
    const anh = REN.img && REN.img(this.DAN[d]) ? this.DAN[d] : SK7.anh('mauhut', 'dan', 'dan_tia');
    const dm = danThang(B, T, E, anh, 600 + 40 * d, anh === this.DAN[d] ? this.CO[d] * 1.7 : this.CO[d], (G, q, M) => {
      if (M) trung(M, dmg, { B, mau: '#ff4a6a' });
      if (nova) { noLan(q.x, q.y, S.NOVA_R, dmg * S.NOVA_K, B, { B, T, phu: true, mau: '#ff3a5a' }); G.hu.push({ k: 'mhNova', t: 0, song: 0.5, x: q.x, y: q.y, r: S.NOVA_R * (d >= 4 ? 1.25 : 1) }); }
    });
    if (anh === 'dan_tia') dm.mau = '#ff3a5a';
    FX.no('chop_nong', x, y, 18 + 3 * d, 0.08, T.goc);
  },
  // HÌNH 4 DẠNG: đầu + bệ riêng theo mốc Máu (render.js dauAnh / deAnh) — ảnh chưa tải → hình dạng 1 (dự phòng)
  dauAnh(T) { const f = this.hinh(T); return f && window.MAUHUT_DANG && MAUHUT_DANG['f' + (f + 1)] ? 'mauhut_f' + (f + 1) + '_nong' : null; },
  dauAnhK(T) { const M = window.MAUHUT_DANG && MAUHUT_DANG['f' + (this.hinh(T) + 1)]; return M ? M.K : 0.8; },
  deAnh(T) { const f = this.hinh(T), M = f && window.MAUHUT_DANG && MAUHUT_DANG['f' + (f + 1)]; return M ? ['mauhut_f' + (f + 1) + '_de', M.DE] : null; },
  ghepDB: {
    hopLe: (a, b) => b.ban === a.ban && a !== b && !b.st.da && !SKILLS.mauhut.camAn(b),
    laGhep: () => false, // đánh dấu không phải ghép
    lam(G, B, a, b) { // a = Mạch Máu (kéo), b = mục tiêu: chỉ ĐÁNH DẤU (không ai bị đổi chỗ)
      const t = SKILLS.mauhut.tg(b.sao, B);
      a.mh = { o: b.o, uid: b.uid, id: b.id, sao: b.sao, con: t, tong: t };
      const ca = B.o[a.o], cb = B.o[b.o]; tiaPhep(ca.x, ca.y, cb.x, cb.y, '#d0103a'); a.sang = 1;
      SND.dat();
      return a;
    },
  },
  ghep() { },
  sangDau: (T) => Math.min(0.3, (T.mau || 0) / 400),
};
// hình: dấu máu nhỏ trên mục tiêu đang bị đánh dấu (PNG mauhut_phu, không vòng) · loé biến hình khi lên dạng · "+N" Máu nổi nhẹ ở góc số
HU.mhVe = {
  cap(G, o) { return G.ban.indexOf(o.B) < 0; },
  ve(ctx, o) {
    const B = o.B; if (!B) return;
    const im = REN.img('mauhut_phu'), t = typeof REN.t === 'number' ? REN.t : G.t, C = Math.min(B.cw, B.ch), S = SKILLS.mauhut;
    for (const T of B.t) {
      if (!T || T.id !== 'mauhut') continue;
      const d = T.mhD != null && B.net ? T.mhD : S.dang(T);
      if (T._dVe != null && d > T._dVe) { const c = B.o[T.o]; if (c) G.hu.push({ k: 'mhBien', t: 0, song: 0.9, x: c.x, y: c.y, w: C * 1.6, d }); if (typeof FX !== 'undefined' && FX.lac && !B.net) FX.lac(3); SND.nang && SND.nang(2); }
      T._dVe = d;
      if (im && T.mh) { const X = B.t[T.mh.o]; if (X && X.uid === T.mh.uid) { const c = B.o[X.o], k = 1 - Math.max(0, T.mh.con) / (T.mh.tong || 1); PX.ve(ctx, im, c.x + C * 0.3, c.y + C * 0.28 + Math.sin(t * 5) * 1.5, C * (0.18 + 0.1 * k), C * (0.18 + 0.1 * k), 0, 0.75 + 0.25 * Math.sin(t * 8)); } }
    }
  },
};
HU.mhBien = { // biến hình: dải xung máu ChatGPT (fx_mauhut_sk) to + nova máu (fx_mauhut_nova) — chỉ hình
  ve(ctx, o, R) {
    const u = o.t / o.song; ctx.globalCompositeOperation = 'lighter';
    fx7Ve(ctx, R, 'mauhut', u * 15, o.x, o.y, o.w * (0.8 + 0.5 * u), 1 - u * u);
    const nv = R.img('fx_mauhut_nova'); if (nv) PX.ve(ctx, nv, o.x, o.y, o.w * (0.4 + 0.9 * u), o.w * (0.4 + 0.9 * u), 0, (1 - u) * 0.9);
    ctx.globalCompositeOperation = 'source-over';
  },
};
HU.mhNova = { // nova máu tại điểm trúng (bán kính = vùng sát thương thật)
  ve(ctx, o, R) {
    const u = o.t / o.song, nv = R.img('fx_mauhut_nova'), w = o.r * 2 * (0.55 + 0.5 * u);
    ctx.globalCompositeOperation = 'lighter';
    if (nv) PX.ve(ctx, nv, o.x, o.y, w, w, 0, 1 - u * u); else fx7Ve(ctx, R, 'mauhut', u * 15, o.x, o.y, w, 1 - u);
    ctx.globalCompositeOperation = 'source-over';
  },
};
HU.mhPop = { // "+N" Máu nổi lên từ góc số rồi tan (chữ số — QUY-TAC-HINH 3)
  cap(G, o) { return !o.T || o.B.t[o.T.o] !== o.T; },
  ve(ctx, o) {
    const c = o.B.o[o.T.o]; if (!c) return; const C = Math.min(o.B.cw, o.B.ch), u = o.t / o.song;
    ctx.save(); ctx.globalAlpha = 1 - u * u; ctx.font = '900 ' + Math.round(C * 0.2) + 'px ' + FONT.display; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round';
    const x = c.x + C * 0.48, y = c.y - C * 0.5 - u * C * 0.25;
    ctx.strokeText(o.so, x, y); ctx.fillStyle = '#ff6a7a'; ctx.fillText(o.so, x, y); ctx.restore();
  },
};
// SỐ MÁU ở góc TRÊN-PHẢI ô (màu theo mốc) — lớp huy hiệu (vẽ sau đạn/hiệu ứng) → mọi bàn / mọi chế độ / Test range
const MH_SO = {
  ve(ctx, h) {
    const T = h.T, B = h.B; if (!T || T.id !== 'mauhut' || !B || !(h.hs > 0.5) || T.st.da) return;
    const S = SKILLS.mauhut, n = T.mau || 0, d = T.mhD != null && B.net ? T.mhD : S.dang(T), sz = h.C * 0.24;
    const xr = h.sx + h.d / 2 + 0.5, y = h.sy - h.d * 0.05, s = String(n);
    ctx.save(); ctx.globalAlpha = h.al; ctx.font = '900 ' + sz.toFixed(1) + 'px ' + FONT.display; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(s).width, ic = REN.img(window.MAUHUT_DANG && MAUHUT_DANG['f' + (S.hinh(T) + 1)] && S.hinh(T) ? 'mauhut_f' + (S.hinh(T) + 1) + '_phu' : 'mauhut_phu') || REN.img('mauhut_phu');
    if (ic) PX.ve(ctx, ic, xr - w - sz * 0.42, y, sz * 0.8, sz * 0.8, 0, h.al);
    ctx.lineWidth = Math.max(2, sz * 0.22); ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.strokeText(s, xr, y);
    ctx.fillStyle = S.MAU[d]; ctx.fillText(s, xr, y);
    ctx.restore();
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
// LUPIN · PRISM THIEF (bienmau) — Vàng TC. LÀM LẠI 08/11 lần 2: TƯỚNG HỢP THỂ (người dùng 08/11: "nó đang là tướng có thể tăng sức mạnh sau khi
//   hợp thể, càng hợp thể nhiều càng mạnh"; "vuốt nó không biến thành mặt nạ 4 màu à?") — thiết kế: docs/demo-hop-tuong/tuvan/prism/THIET-KE.md
//   · Mỗi Prism ĐƠN xuất hiện với 1 MÀU ngẫu nhiên (RNG tất định) giữ suốt đời — đầu = mặt nạ màu (bienmau_m_*):
//        ĐỎ  4% giết ngay quái thường (không tinh anh/trùm) → +1 cộng dồn: +2% ST vào quái thường
//        VÀNG 6% +2 mana (cả bàn ≤ 6 mana/giây) → +1 cộng dồn: +1% ST
//        LAM 8% đóng băng quái thường 1.0 s (+0.06 s / cộng dồn; tinh anh/trùm miễn) → +1 cộng dồn
//        LỤC 10% đòn đó +40% ST chí mạng → +1 cộng dồn: +5% ST chí mạng
//      Trần cộng dồn Prism đơn 10 / 12 / 14 / 16 / 18 (LV9 / 11 / 13 / 15 / 17). Mỗi Prism hồi 1 s / quái / màu cho lần kích hoạt.
//   · HỢP THỂ (SPECTRUM PRISM): VUỐT 1 đường qua 4 ô liền (trên/dưới/trái/phải, không chéo, không lặp) toàn Prism, các Prism ĐƠN trên đường phải
//      khác màu nhau; MẶT NẠ HỢP THỂ trên đường là ô ĐẠI DIỆN (thay màu nào cũng được). → 4 ụ thành 1 MẶT NẠ 4 MÀU ở ô CUỐI, 3 ô kia trống.
//      Là GHÉP THẬT (Archive, MERGE SURGE, nhiệm vụ… đếm 1 lần — đi qua ghep() bằng ghepDB laGhep). Không hồi chiêu (đã tiêu 3 ụ).
//      Số HỢP THỂ n = tổng n của nguyên liệu + 1 (không trần). Cộng dồn từng màu CỘNG HẾT vào mặt nạ. Sao = sao CAO NHẤT của 4 ụ.
//      Mặt nạ n: đủ 4 hiệu ứng mỗi phát; tỉ lệ mỗi màu × (1 + 0.25n); trần cộng dồn mỗi màu = trần đơn × (1 + n);
//      +300% ST và +10% tốc mỗi n (= 3 ụ đã tiêu) (cùng nhóm cộng gộp); vàng +2 + ⌊n/2⌋ mana, trần mana/giây cả bàn 6 + 2 × n lớn nhất.
//   · Kéo MẶT NẠ lên MẶT NẠ = hợp thể 2 mặt nạ (n = a + b + 1, cộng dồn cộng hết, sao cao nhất) — ghép thật.
//      Mặt nạ KHÔNG ghép thường (với Prism đơn, Mimic…: không mất n vì lỡ tay). Merge King +★ tại chỗ: giữ n + cộng dồn (không phải ghép).
//      Copycat chép mặt nạ: bản sao là lần XUẤT HIỆN mới → 1 Prism ĐƠN màu ngẫu nhiên mới, 0 cộng dồn (luật "chép / sinh → quay lại").
//   · Online: gói 'pm' { o: đường vuốt, r: cờ ô kết quả } — bàn con rối chạy đúng hợp thể rồi chốt ô cuối theo máy bạn. Cờ ô: q màu · u cộng dồn đơn ·
//      F n · K cộng dồn 4 màu (dongbo.js oTT). Mặt nạ luôn nằm NGANG, không xoay theo mục tiêu (kể cả bản cầm kéo).
// =====================================================================================================
const PRISM_MAU = ['#ff4a2a', '#ffd23f', '#4fb8ff', '#5cff7a'];
SKILLS.bienmau = { // 09/11 gánh hậu kỳ: ST 15 → 24, tốc 1 → 2, tỉ lệ màu đơn 4/6/8/10% → 8/10/12/15%
  vai: 'tc', dmg: 24, toc: 2, nham: 'dau',
  TEN: ['RED', 'GOLD', 'BLUE', 'GREEN'], ANH: ['bienmau_m_do', 'bienmau_m_vang', 'bienmau_m_lam', 'bienmau_m_luc'],
  HOP: ['bienmau_hop_1', 'bienmau_hop_2', 'bienmau_hop_3', 'bienmau_hop_4'], // mặt nạ 4 màu: bậc sáng theo n (1–2 · 3–4 · 5–9 · 10+)
  TI: [0.08, 0.10, 0.12, 0.15], MANA_S: 6,
  HOP_DMG: 3, HOP_TOC: 0.10, HOP_TI: 0.25,
  mau: (T) => (T.pm | 0) & 3,
  n: (T) => (T && T.id === 'bienmau' ? T.pf | 0 : 0),
  bac: (n) => (n >= 10 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0),
  tranDon(T) { const k = (G.ban[T.ban] && G.ban[T.ban].capThe && G.ban[T.ban].capThe.bienmau) | 0; return 10 + 2 * Math.min(4, k >> 1); },
  tran(T) { return this.tranDon(T) * (1 + this.n(T)); },
  // cộng dồn màu q (đã kẹp trần) · màu đang có
  st(T, q) { const n = this.n(T), t = this.tran(T); if (n) return Math.min(t, (T.pmk && T.pmk[q]) | 0); return q === this.mau(T) ? Math.min(t, T.pms || 0) : 0; },
  ds: (T) => ((T.pf | 0) > 0 ? [0, 1, 2, 3] : [(T.pm | 0) & 3]),
  ti(T, q) { return Math.min(1, this.TI[q] * (1 + this.HOP_TI * this.n(T))); },
  thuong: (q) => (q === 0 ? 'kill a normal enemy at once' : q === 1 ? '+2 mana' : q === 2 ? 'freeze a normal enemy' : '+40% crit damage on that hit'),
  so(T, q) { const st = this.st(T, q); return q === 0 ? '+' + st * 2 + '% damage vs normal enemies' : q === 1 ? '+' + st + '% damage' : q === 2 ? 'freeze ' + (1 + 0.06 * st).toFixed(2) + 's' : '+' + st * 5 + '% crit damage'; },
  mo(T) {
    const n = this.n(T);
    if (n) {
      return 'SPECTRUM PRISM · fusion ' + n + ': all 4 colours on every hit · +' + Math.round(this.HOP_DMG * 100 * n) + '% damage, +' + Math.round(this.HOP_TOC * 100 * n) + '% fire rate · chances ' +
        [0, 1, 2, 3].map(q => Math.round(this.ti(T, q) * 100) + '%').join(' / ') + ' (red / gold / blue / green) · stacks max ' + this.tran(T) + ' each: ' +
        [0, 1, 2, 3].map(q => this.TEN[q].toLowerCase() + ' ' + this.st(T, q)).join(', ') +
        ' · FUSE AGAIN: swipe it with 3 Prisms of different colours, or drag it onto another Spectrum Prism · every fusion makes it stronger, no limit';
    }
    const q = this.mau(T), st = this.st(T, q);
    return this.TEN[q] + ' PRISM: ' + Math.round(this.TI[q] * 100) + '% per hit to ' + this.thuong(q) + ' · stacks ' + st + '/' + this.tran(T) + ' → ' + this.so(T, q) +
      ' · FUSION: put 4 Prisms of 4 different colours side by side and swipe one line through all 4 — they fuse into ONE 4-colour SPECTRUM PRISM on the last tile (all 4 effects, stacks add up). Fuse it again to make it stronger';
  },
  sinh(G, T) {
    if (T.pm == null) { const B = G.ban[T.ban]; const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1; if (B) B._pmN = (B._pmN | 0) + 1; T.pm = Math.floor(rngHat((hat * 5303 + ((B && B.i) | 0) * 389 + (T.o | 0) * 157 + ((B && B._pmN) | 0) * 7919) | 0)() * 4); }
    if (T.pms == null) T.pms = 0;
  },
  dauAnh(T) {
    if (this.n(T)) { const h = this.HOP[this.bac(this.n(T))]; if (typeof REN !== 'undefined' && REN.img && REN.img(h)) return h; }
    return this.ANH[this.mau(T)];
  },
  dauAnhK: (T) => (SKILLS.bienmau.n(T) ? 0.92 : 0.86),
  // mặt nạ LUÔN nằm ngang, đúng chiều (08/11 người dùng: cầm kéo thấy mặt nạ dựng dọc) — không xoay theo mục tiêu, cả lúc cầm kéo:
  //   mặt nạ (bienmau_m_* / bienmau_hop_*) vẽ thẳng ở góc 0; đầu dự phòng bienmau_nong (vẽ theo chiều nòng → phải) xoay −90° cho thẳng
  gocDau() { return REN._dauEp && REN._dauEp[0] === 'bienmau' ? 0 : -Math.PI / 2; },
  dauGhost: (T) => T && T.pm != null, // bản đang cầm (ghost) cũng vẽ đúng mặt nạ của ụ
  // mặt nạ hợp thể: 4 đốm màu quay quanh (dưới đầu) — bậc sáng theo n; hình ảnh, không đổi luật
  veThem(ctx, T, S, al, R) {
    const n = this.n(T); if (!n || !R.cham1) return;
    const b = this.bac(n), t = (R.t || 0) * (0.8 + 0.25 * b);
    ctx.globalCompositeOperation = 'lighter';
    for (let q = 0; q < 4; q++) { const a = t + q * Math.PI / 2; ctx.globalAlpha = al * (0.16 + 0.06 * b); R.anhGiua(ctx, R.cham1(PRISM_MAU[q]), Math.cos(a) * S * 0.3, Math.sin(a) * S * 0.3, S * (0.42 + 0.06 * b)); }
  },
  capNhat(G, B, T) {
    const n = this.n(T);
    for (const q of this.ds(T)) { const st = this.st(T, q); if (q === 1) T.buf.dmg += 0.01 * st; if (q === 3) T.buf.cdmg = (T.buf.cdmg || 0) + 0.05 * st; }
    if (n) { T.buf.dmg += this.HOP_DMG * n; T.buf.toc += this.HOP_TOC * n; }
    return false;
  },
  rng(B, T) { T.pmN = (T.pmN | 0) + 1; const hat = (typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1; return rngHat((hat * 2833 + B.i * 401 + T.o * 1009 + T.pmN * 7919) | 0)(); },
  laThuong: (M) => !M.trum && !(M.d && M.d.to),
  cong(T, q) { const t = this.tran(T); if (this.n(T)) { const k = T.pmk || (T.pmk = [0, 0, 0, 0]); k[q] = Math.min(t, (k[q] | 0) + 1); } else T.pms = Math.min(t, (T.pms || 0) + 1); T.sang = 1; },
  manaTran(B) { let m = 0; for (const X of B.t) if (X && X.id === 'bienmau') m = Math.max(m, X.pf | 0); return this.MANA_S + 2 * m; },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = dauNong(T); SND.tia();
    const S = this, ds = this.ds(T), n = this.n(T);
    danThang(B, T, E, SK7.anh('bienmau', 'dan', 'dan_tia'), 640, 16, (G, d, M) => {
      if (!M || M.chet) return;
      const thuong = S.laThuong(M), them = ds.includes(0) && thuong ? 0.02 * S.st(T, 0) : 0;
      // mỗi màu 1 lần quay / đòn (thứ tự cố định đỏ → vàng → lam → lục), hồi 1 s mỗi quái mỗi màu cho Prism này
      const cd = M.pmCd || (M.pmCd = {}), kh = [false, false, false, false];
      for (const q of ds) { const k = T.uid * 4 + q; if (!(cd[k] > G.t) && S.rng(B, T) < S.ti(T, q) && (q === 1 || q === 3 || thuong)) { kh[q] = true; cd[k] = G.t + 1; } }
      const crit = kh[3] ? 0.4 : 0;
      T.buf.cdmg = (T.buf.cdmg || 0) + crit; trung(M, dmgU(T, them), { B, mau: PRISM_MAU[kh[3] ? 3 : ds[ds.length - 1]] }); T.buf.cdmg -= crit;
      if (kh[3]) S.cong(T, 3);
      if (kh[0] && !M.chet) { trung(M, M.hp + 1, { B, T, phu: true, crit: false, mau: '#ff4a2a' }); FX.chu1(M.x, M.y - 20, 'STOLEN', '#ff7a5a', 11); S.cong(T, 0); }
      else if (kh[0]) S.cong(T, 0);
      if (kh[1]) {
        const v = 2 + (n >> 1), tr = S.manaTran(B);
        if (B.pmMt == null || G.t - B.pmMt >= 1) { B.pmMt = G.t; B.pmMv = 0; }
        if ((B.pmMv || 0) + v <= tr) { B.pmMv = (B.pmMv || 0) + v; B.mana += v; FX.chu1(M.x, M.y - 20, '+' + v, '#ffd23f', 11); }
        S.cong(T, 1);
      }
      if (kh[2]) { if (!M.chet) { const t = 1 + 0.06 * S.st(T, 2); M.chan = Math.max(M.chan || 0, t); FX.no('bang_vo', M.x, M.y, 50, 0.35); } S.cong(T, 2); }
    });
    FX.no('chop_nong', x, y, 18, 0.08, -Math.PI / 2);
  },
  // kiểm 1 đường vuốt (4 ô) — trả { ds } hoặc { loi } (thuần, không đổi gì)
  kiemMach(B, oS) {
    if (!B || !Array.isArray(oS) || oS.length !== 4) return { loi: 'path' };
    if (new Set(oS).size !== 4 || oS.some(o => !(o >= 0 && o < 15 && (o | 0) === o))) return { loi: 'path' };
    for (let i = 1; i < 4; i++) { const a = oS[i - 1], b = oS[i]; if (!(Math.abs(a - b) === 5 || (Math.abs(a - b) === 1 && ((a / 5) | 0) === ((b / 5) | 0)))) return { loi: 'path' }; }
    const ds = oS.map(o => B.t[o]);
    if (ds.some(X => !X || X.id !== 'bienmau' || biKhoa(X))) return { loi: 'prism' };
    const don = ds.filter(X => !this.n(X)).map(X => this.mau(X));
    if (new Set(don).size !== don.length) return { loi: 'colour' }; // Prism đơn trùng màu (mặt nạ hợp thể = ô đại diện)
    return { ds };
  },
  // gộp danh sách ụ thành 1 mặt nạ ở ô của ụ cuối (luật thuần; gọi trong ghepDB.lam)
  gop(B, ds) {
    const L = ds[ds.length - 1], k = [0, 0, 0, 0];
    let n = 1, sao = 1;
    for (const X of ds) {
      n += X.pf | 0; sao = Math.max(sao, X.sao);
      if (this.n(X)) for (let q = 0; q < 4; q++) k[q] += (X.pmk && X.pmk[q]) | 0; else k[this.mau(X)] += X.pms || 0;
    }
    const N = taoU(B, 'bienmau', sao, L.o);
    N.pm = this.mau(L); N.pms = 0; N.pf = n; N.pmk = k; N.goc = -Math.PI / 2;
    giuBanSao(N, L); // bản sao theo ô ĐÍCH = ô cuối đường vuốt / mặt nạ được thả vào (game.js) N.epxung = Math.max(...ds.map(X => X.epxung || 0)); N.aurora = Math.max(...ds.map(X => X.aurora || 0));
    const t = this.tran(N); for (let q = 0; q < 4; q++) k[q] = Math.min(t, k[q]);
    for (const X of ds) if (B.t[X.o] === X) B.t[X.o] = null;
    B.t[L.o] = N; N.sang = 1;
    return N;
  },
  // VUỐT hợp thể (ui.js / AI / gói 'pm'). ep = áp từ mạng (không gửi lại); r = cờ ô kết quả của máy bạn (chốt cho khớp)
  mach(B, oS, ep, r) {
    const v = this.kiemMach(B, oS);
    if (!v.ds) {
      if (ep && r && typeof ONS !== 'undefined' && Array.isArray(oS) && oS.length === 4) { for (const o of oS.slice(0, 3)) if (B.t[o] && B.t[o].id === 'bienmau') B.t[o] = null; ONS.datO(B, oS[3], r); return true; } // lệch: chốt theo máy bạn
      return false;
    }
    const ds = v.ds, gui = !ep && typeof ONS !== 'undefined' && ONS.on && B === G.ban[0];
    const nguon = ds.map(X => ({ o: X.o, ten: this.dauAnh(X), q: this.mau(X), n: this.n(X) }));
    G._pmHop = { a: ds[2], b: ds[3], ds };
    if (gui) ONS._apDung = (ONS._apDung | 0) + 1; // ghép này đi bằng gói 'pm' (đủ đường vuốt), không gửi thêm 'gh'
    let N = null;
    try { N = ghep(B, ds[2], ds[3]); } finally { G._pmHop = null; if (gui) ONS._apDung--; }
    if (!N) return false;
    if (ep && r && typeof ONS !== 'undefined') ONS.datO(B, oS[3], r);
    this.vfx(B, nguon, B.t[oS[3]] || N);
    if (gui && ONS.gui) ONS.gui('pm', { o: oS.slice(), r: ONS.oTT(B.t[oS[3]]) });
    return true;
  },
  // hiệu ứng hợp thể: 3 mặt nạ bay về ô cuối + dải nổ lăng kính (thời gian thực, không đổi luật)
  vfx(B, nguon, N) {
    if (!N || !B.o) return;
    const c = B.o[N.o], C = Math.min(B.cw || 60, B.ch || 60);
    G.hu.push({ k: 'pmHop', t: 0, song: 1.1, ban: B.i, x: c.x, y: c.y, C, ds: nguon.map(s => ({ ...s, x: B.o[s.o].x, y: B.o[s.o].y })), n: N.pf | 0 });
    if (!B.ai || G.che === 'pvp') SND.combo(12);
  },
  // AI: có đường hợp thể hợp lệ thì vuốt (thử mọi đường 4 ô liền; ưu tiên đường kết thúc ở mặt nạ có sẵn / sao cao)
  timMach(B) {
    const ke = (o) => { const r = []; const c = o % 5; if (c > 0) r.push(o - 1); if (c < 4) r.push(o + 1); if (o >= 5) r.push(o - 5); if (o < 10) r.push(o + 5); return r; };
    let tot = null, diem = -1;
    for (let a = 0; a < 15; a++) { const A = B.t[a]; if (!A || A.id !== 'bienmau') continue;
      for (const b of ke(a)) for (const c of ke(b)) for (const d of ke(c)) {
        const p = [a, b, c, d]; if (!this.kiemMach(B, p).ds) continue;
        const D = B.t[d], s = (this.n(D) ? 100 : 0) + D.sao * 10 + p.reduce((x, o) => x + this.n(B.t[o]), 0);
        if (s > diem) { diem = s; tot = p; }
      } }
    return tot;
  },
  // ghép đặc biệt CÙNG LOẠI: (1) đang hợp thể bằng vuốt (G._pmHop) · (2) kéo mặt nạ lên mặt nạ. Cả hai là GHÉP THẬT.
  ghepDB: {
    cungLoai: true,
    hopLe(a, b) { const H = G._pmHop; if (H) return H.a === a && H.b === b; return SKILLS.bienmau.n(a) > 0 && b.id === 'bienmau' && SKILLS.bienmau.n(b) > 0 && !biKhoa(b); },
    laGhep: () => true,
    lam(G, B, a, b) {
      const S = SKILLS.bienmau, H = G._pmHop;
      if (H) return S.gop(B, H.ds);
      const nguon = [a, b].map(X => ({ o: X.o, ten: S.dauAnh(X), q: S.mau(X), n: S.n(X) })), N = S.gop(B, [a, b]);
      S.vfx(B, nguon, N);
      return N;
    },
  },
  ghep() { },
};
// hiệu ứng hợp thể: mặt nạ nguồn bay vòng về ô cuối (0–0.45 s) → nổ lăng kính (dải fx_bienmau_hop nếu có, không thì fx_bienmau_sk khung 12–15) + chữ FUSION n
HU.pmHop = {
  ve(ctx, o, R) {
    const u = o.t / o.song, C = o.C, bay = Math.min(1, u / 0.5), e = bay * bay * (3 - 2 * bay);
    if (u < 0.5) for (const s of o.ds) {
      if (s.x === o.x && s.y === o.y) continue;
      const x = s.x + (o.x - s.x) * e, y = s.y + (o.y - s.y) * e - Math.sin(e * Math.PI) * C * 0.35, im = R.img(s.ten);
      ctx.globalAlpha = 1 - Math.max(0, (u - 0.4) / 0.1);
      if (R.cham1) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1(PRISM_MAU[s.n ? (Math.floor(u * 12) & 3) : s.q]), x, y, C * 0.8); ctx.globalCompositeOperation = 'source-over'; }
      if (im) { const w = C * 0.72 * (1 - 0.35 * e), h = w * im.height / im.width; ctx.drawImage(im, x - w / 2, y - h / 2, w, h); } // mặt nạ bay giữ NGANG (không xoay)
    }
    ctx.globalAlpha = 1;
    if (u >= 0.4) {
      const v = (u - 0.4) / 0.6, hop = R.img('fx_bienmau_hop');
      ctx.globalCompositeOperation = 'lighter';
      if (hop) { const fw = hop.height, nf = Math.max(1, Math.round(hop.width / fw)), i = Math.min(nf - 1, Math.floor(v * nf)), w = C * 2; ctx.globalAlpha = 1 - Math.max(0, v - 0.8) / 0.2; ctx.drawImage(hop, i * fw, 0, fw, fw, o.x - w / 2, o.y - w / 2, w, w); }
      else fx7Ve(ctx, R, 'bienmau', 12 + v * 4, o.x, o.y, C * 1.9, 1 - Math.max(0, v - 0.8) / 0.2);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    if (u >= 0.45 && o.n && typeof FX !== 'undefined' && !o._chu) { o._chu = 1; FX.chu1(o.x, o.y - C * 0.5, 'FUSION ' + o.n, '#ffffff', 14, 'to'); }
  },
};

// =====================================================================================================
// móc chung: tê liệt Hex (1★ bị nguyền) · AI dùng Blood Circuit khi kẹt bàn · ngoài bộ RANDOM khi chưa có hình · trang ụ: % theo cấp thẻ
// =====================================================================================================
const _capNhatU7 = capNhatU;
capNhatU = function (B, T, dt) { if (T.hexT > 0) { T.hexT -= dt; T.st.ngam = Math.max(T.st.ngam || 0, 0.05); return; } return _capNhatU7(B, T, dt); };
const _aiBan7 = aiBan;
aiBan = function (B, dt) {
  // Prism Thief: có đường hợp thể → vuốt (SPECTRUM PRISM) · có 2 mặt nạ hợp thể → kéo mặt nạ lên mặt nạ
  if (B.aiT - dt <= 0 && B.t.some(X => X && X.id === 'bienmau')) {
    const p = SKILLS.bienmau.timMach(B); if (p) { B.aiT = 0.6; SKILLS.bienmau.mach(B, p); return; }
    const M = B.t.filter(X => X && SKILLS.bienmau.n(X) > 0 && !biKhoa(X)); if (M.length >= 2) { B.aiT = 0.6; ghep(B, M[0], M[1]); return; }
  }
  // Mạch Máu (chưa đánh dấu): bàn còn ≤ 2 ô trống → đánh dấu ụ "lẻ" sao thấp (không có cặp ghép thường), bàn đầy không còn cặp → ụ sao thấp nhất
  if (B.aiT - dt <= 0 && oTrong(B).length <= 2) {
    const ts = B.t.filter(Boolean), M = ts.filter(X => X.id === 'mauhut' && !biKhoa(X) && !X.mh).sort((x, y) => (y.mau || 0) - (x.mau || 0) || x.o - y.o);
    if (M.length) {
      const a = M[0], dau = new Set(ts.filter(X => X.id === 'mauhut' && X.mh).map(X => X.mh.o));
      const le = (b) => !ts.some(c => c !== b && c.id !== 'mauhut' && hopLeGhep(b, c));
      const ds = ts.filter(b => b !== a && !dau.has(b.o) && hopLeGhep(a, b)).sort((x, y) => (le(y) - le(x)) || x.sao - y.sao || x.o - y.o);
      const coCap = ts.some(p => ts.some(q => p !== q && p.id !== 'mauhut' && q.id !== 'mauhut' && hopLeGhep(p, q)));
      const b = ds[0]; if (b && ((le(b) && b.sao <= 4) || (!oTrong(B).length && !coCap))) { B.aiT = 0.6; ghep(B, a, b); return; }
    }
  }
  return _aiBan7(B, dt);
};
const _batDau7 = batDau; // nạp sẵn dải hiệu ứng của ụ có trong các bộ bài trận này
batDau = function () {
  const r = _batDau7.apply(this, arguments);
  try {
    for (const B of G.ban) for (const id of B.deck) if (SK7.FX.has(id)) REN.img('fx_' + id + '_sk');
    for (const B of G.ban) { if (B.deck.includes('mauhut')) { G.hu.push({ k: 'mhVe', t: 0, B }); for (const a of ['mauhut_phu', 'fx_mauhut_nova', ...SKILLS.mauhut.DAN, ...[2, 3, 4].flatMap(f => ['mauhut_f' + f + '_nong', 'mauhut_f' + f + '_de', 'mauhut_f' + f + '_vien', 'mauhut_f' + f + '_phu'])]) REN.img(a); } if (B.deck.includes('bienmau')) for (const a of [...SKILLS.bienmau.ANH, ...SKILLS.bienmau.HOP, 'fx_bienmau_hop']) REN.img(a); }
  } catch (e) { }
  return r;
};
const _deckNN7 = deckNgauNhien;
deckNgauNhien = function (tru) { return _deckNN7([...(tru || []), ...SK7.CHUA_ANH]); };
if (typeof DC !== 'undefined' && DC.ngauNhien) { /* dkcham.js nạp sau — xem cuối file */ }

themHo('star', 3, 'mauhut', 'eats your turrets for Blood: more Blood = more damage, new forms at 20/50/100');
themHo('guard', 3, 'nguyenrua', 'merge hexes a rival turret −1★ (co-op: ally +1★)');
themHo('guard', 3, 'thanhdia', 'cleanses + shields neighbours on arrival, damage aura');
themHo('crit', 3, 'bienmau', '4 colours; swipe 4 different colours to FUSE a Spectrum Prism');

Object.assign(MOC_RIENG, {
  nguyenrua: { 5: ['SHARP HEX', 'Hex chance +20% (vs 1★)'], 7: ['DOOM HEX', 'Hex chance +30% (cap 80%)'] },
  thanhdia: { 5: ['WIDE SANCTUM', 'Cleanse, shield and aura reach all 8 cells around'], 7: ['HOLY GROUND', 'Shields recharge every 4s'] },
});
Object.assign(SUP, { thanhdia: { icon: 'sup_khien', mau: '#fff2b0', link: 'sup_link_vang', ke: true, chu: (T) => '+' + pct(HOTRO.hd(T, 'dmg', SKILLS.thanhdia.k(T))) + '% DAMAGE · SHIELD' } });
SUP_LOAI.thanhdia = 'khien';
SUP_GIA.thanhdia = (T) => SKILLS.thanhdia.k(T);

// Prism Thief: vệt vuốt hợp thể — các ô ngón tay đã đi qua (UI.keo.duong) nối bằng tia màu + đốm sáng; đủ 4 ô hợp lệ = sáng trắng (chỉ hình ảnh)
function pmVeVet(ctx) {
  const k = typeof UI !== 'undefined' && UI.keo; if (!k || !k.dang || !k.duong || k.duong.length < 2 || typeof REN === 'undefined') return;
  const B = G.ban[0]; if (!B || !B.o) return;
  const p = k.duong.slice(0, 6), S = SKILLS.bienmau, du = p.length === 4 && !!S.kiemMach(B, p).ds, C = Math.min(B.cw, B.ch), t = REN.t || 0;
  const mau = (o) => { const X = B.t[o]; return !X || X.id !== 'bienmau' ? '#ff6a6a' : S.n(X) ? PRISM_MAU[Math.floor(t * 6) & 3] : PRISM_MAU[S.mau(X)]; };
  ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
  for (let i = 1; i < p.length; i++) {
    const a = B.o[p[i - 1]], b = B.o[p[i]], g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, mau(p[i - 1])); g.addColorStop(1, mau(p[i]));
    ctx.strokeStyle = g; ctx.globalAlpha = du ? 0.95 : 0.7; ctx.lineWidth = C * (du ? 0.16 : 0.11); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = du ? 0.9 : 0.45; ctx.lineWidth = C * 0.04; ctx.stroke();
  }
  for (const o of p) { const c = B.o[o]; ctx.globalAlpha = du ? 0.8 : 0.5; REN.anhGiua(ctx, REN.cham1(mau(o)), c.x, c.y, C * (du ? 1.05 : 0.85)); }
  ctx.restore(); ctx.globalAlpha = 1;
}
window.addEventListener('DOMContentLoaded', () => {
  if (typeof ND !== 'undefined' && ND.veHuyHieu && !ND._mh) { const v0 = ND.veHuyHieu; ND._mh = 1; ND.veHuyHieu = function (ctx, h) { const r = v0.apply(this, arguments); try { MH_SO.ve(ctx, h); } catch (e) { } return r; }; }
  if (typeof MV !== 'undefined' && MV.TAG) MV.TAG.mauhut = ['Blood (top-right; colour = form: 20 / 50 / 100 / 200)', 'Máu (góc trên-phải; màu = dạng: 20 / 50 / 100 / 200)'];
  if (typeof MV !== 'undefined' && MV.TAG) MV.TAG.bienmau = ['stacks · ×fusions on a Spectrum Prism', 'cộng dồn · ×số hợp thể của mặt nạ 4 màu'];
  if (typeof GF !== 'undefined' && GF.veCam && !GF._pmVet) { const g0 = GF.veCam; GF._pmVet = 1; GF.veCam = function (ctx) { try { pmVeVet(ctx); } catch (e) { } return g0.apply(this, arguments); }; }
  if (typeof DC !== 'undefined' && DC.ngauNhien && !DC._sk7) { // RANDOM lấp ổ trống (dkcham.js) dùng G.roster thẳng → lọc ụ chưa có hình
    const g = DC.ngauNhien; DC._sk7 = 1;
    DC.ngauNhien = function () { const r0 = G.roster; G.roster = r0.filter(r => !SK7.CHUA_ANH.has(r.id)); try { return g.apply(this, arguments); } finally { G.roster = r0; } };
  }
});

// =====================================================================================================
// CỔNG ẤP NỞ / HATCHERY GATE (congap) — VÀNG, Đặc biệt, KHÔNG bắn (người dùng thiết kế 09/11):
//   · LƯỢT GỌI = số sao lúc ụ XUẤT HIỆN (1★ = 1 lượt, 2★ = 2…).
//   · Mỗi 11 s CỐ ĐỊNH (không theo tốc bắn / cấp thẻ / power-up) dùng 1 lượt: gọi 1 ụ NGẪU NHIÊN trong BỘ BÀI (trừ chính Cổng Ấp Nở), 1★, vào 1 Ô TRỐNG.
//     Loại: rngLuat(B, 83, ô của cổng); ô: trieu() (rngLuat 13) — tất định (NT9). Triệu hồi MIỄN PHÍ như Tháp Ánh Sáng: trieu(B, true, id) —
//     không tốn mana, không tăng giá triệu hồi, không chạy móc "khi người chơi triệu hồi" khác (Tháp Ánh Sáng cũng vậy).
//   · Bàn ĐẦY: đồng hồ giữ đầy, KHÔNG mất lượt; có ô trống là gọi ngay. Hết lượt: Ở LẠI, không làm gì (chiếm ô tới khi người chơi ghép/xử lý).
//   · +★ TẠI CHỖ bởi BẤT KỲ đường nào (Merge King +1 / bản vàng +2, Bệ Nâng Sao, Lõi Khởi Sinh, Pandora, mọi +★ tự động…) → +lượt ĐÚNG bằng số sao tăng:
//     so T.sao với sao đã thấy T.cgS mỗi khung (bắt được cả đường sửa T.sao trực tiếp).
//     −★ (người dùng chốt 09/11): TRỪ lượt đúng bằng số sao bị trừ, không âm.
//   · Ghép thường ra ụ này / Copycat chép / Twin Maker / Hộp… = ụ MỚI (sinh): lượt = sao của nó, không kế thừa (NT2, NT5).
//   · Đá / băng: capNhatU không chạy kỹ năng → đồng hồ DỪNG; ±★ nhận lúc bị khoá được cộng khi tan (luot() đã tính sẵn để hiển thị).
//   · Online: bàn con rối không tự gọi — lượt / đồng hồ / sao đã thấy đi theo cờ ô (dongbo.js: A lượt+1 · W đồng hồ ×10 · Y sao đã thấy).
// =====================================================================================================
SKILLS.congap = {
  vai: 'db', dmg: 0, toc: 0, napMau: '#ffd23f', khongNang: true, // chu kỳ cố định → không có POWER-UP mana trong trận
  KY: 11,
  luot(T) { const l = T.cgL == null ? T.sao : T.cgL, s = T.cgS == null ? T.sao : T.cgS; return Math.max(0, l + T.sao - s); },
  con(T) { return Math.max(0, this.KY - (T.cgT || 0)); },
  mo: (T) => { const S = SKILLS.congap, n = S.luot(T); return 'Calls a random 1★ turret from your deck into an empty cell every ' + S.KY + 's (free) · calls left ' + n + (n > 0 ? ' (next in ' + Math.ceil(S.con(T)) + 's)' : ' — it stays, doing nothing') + ' · calls = its stars when it appeared; +★ in place adds the same number of calls, −★ removes them · full board: waits, keeps the call'; },
  sinh(G, T) { T.cgL = T.sao; T.cgS = T.sao; T.cgT = 0; },
  gocDau: (T, t) => t * 0.3,
  capNhat(G, B, T, dt) {
    T.cgL = this.luot(T); T.cgS = T.sao; // ±★ tại chỗ → ±lượt (không âm)
    if (B.net && typeof ONS !== 'undefined' && ONS.on) return true; // bàn con rối: chờ ảnh chụp bàn
    if (T.cgL <= 0) { T.cgT = 0; return true; }
    T.cgT = Math.min(this.KY, (T.cgT || 0) + dt);
    if (T.cgT >= this.KY && oTrong(B).length) {
      const ds = deckTru(B, ['congap']), id = ds[Math.floor(rngLuat(B, 83, T.o)() * ds.length)];
      const N = trieu(B, true, id);
      if (N) {
        T.cgT = 0; T.cgL--; T.sang = 1;
        const c = tamU(T), q = B.o[N.o];
        G.hu.push({ k: 'cungSang', t: 0, song: 0.5, x0: c.x, y0: c.y, x1: q.x, y1: q.y });
        if (!B.ai || G.che === 'pvp') SND.gHop(0);
      }
    }
    return true;
  },
  veThem(ctx, T, S, al, R) { // sắp gọi: quầng vàng nhấp nháy ở lõi (ảnh chấm PNG); số lượt + giây ở tấm đếm đáy ô (DEMKN)
    const n = this.luot(T); if (n <= 0) return;
    const p = (T.cgT || 0) / this.KY;
    if (p > 0.85) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (p - 0.85) * 4 * (0.6 + 0.4 * Math.sin(R.t * 18)); R.anhGiua(ctx, R.cham1('#ffd23f'), 0, 0, S * 0.8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; }
  },
};
themHo('summon', 3, 'congap', 'calls a free 1★ from your deck every 11s; calls = its stars, +★ adds / −★ removes calls');
window.addEventListener('DOMContentLoaded', () => {
  // tấm đếm đáy ô: icon chồng ụ + lượt còn · trứng + giây tới lần gọi (bàn đầy: đứng ở 0s) — hết lượt: không hiện
  if (typeof DEMKN !== 'undefined') DEMKN.DS.congap = (T) => { const S = SKILLS.congap, n = S.luot(T); return n > 0 ? { m: [{ ic: 'h2_ic_chong', s: '' + n }, { ic: 'trung_1', s: Math.ceil(S.con(T)) + 's' }] } : null; };
  if (typeof MV !== 'undefined' && MV.TAG) MV.TAG.congap = ['calls left · seconds to the next call', 'lượt gọi còn · giây tới lần gọi kế'];
});
