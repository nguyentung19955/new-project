// TURRET MERGE — HIỆU ỨNG LEO THANG THEO BẬC (không cần ảnh mới)
// Cùng 1 họ kỹ năng, bậc càng cao thì đòn đánh càng "giàu" hiệu ứng — nhưng vẫn giữ trần dễ nhìn (hạt ngắn, vòng tròn tròn tuyệt đối, không oval):
//   TRẮNG = 1 hiệu ứng sạch (của chính kỹ năng, không thêm gì)
//   XANH  = + vài hạt phụ nhỏ màu họ
//   TÍM   = + hình phụ: vòng tròn mảnh tại điểm trúng
//   VÀNG  = + vệt sáng theo đạn, tia lửa tung khi trúng, quầng nhỏ
//   ĐỎ    = WOW: nổ nhiều lớp + 2 vòng + than hồng đọng lại + chớp màn (giới hạn) + rung ngắn
// Gọi từ game.js: TVX.trung (mỗi đòn trúng do ụ gây), TVX.ban (mỗi phát bắn), TVX.dan (mỗi bước của đạn bay).
'use strict';

const TVX = {
  lacT: -9, sangT: -9,
  bac: (T) => (T && TIERS[T.bac] ? TIERS[T.bac].thuTu : 0),
  // màu NGUYÊN TỐ của ụ cho hạt/vòng/than phụ (06/11 kiểm màu tools/thap-kt-mau.js): mặc định = màu họ kỹ năng; ụ có nguyên tố khác màu họ → ghi đè
  //   (trước: Blood Circuit họ STAR rải hạt VÀNG, Black Hole họ TRAP rải hạt CAM lên đĩa xoáy tím, Laser/Overlord tia đỏ mà hạt lam, Eclipse quầng cam mà hạt lam, Scrap Forge lò lửa mà hạt vàng)
  MAU_NT: { mauhut: '#ff3a5a', blackhole: '#b04bff', laser: '#ff4a8a', overlord: '#ff5a3a', nhatthuc: '#ff8a3a', loren: '#ff8a3a' },
  mau(T) { if (this.MAU_NT[T.id]) return this.MAU_NT[T.id]; const h = typeof HO_CUA !== 'undefined' && HO_CUA[T.id]; return h ? HO[h.ho].mau : TIERS[T.bac].mau; },
  // quầng trúng: ảnh trúng RIÊNG của ụ (FX.no + G.dangBan → fx_<id>_trung); ụ chưa có ảnh riêng → vòng màu nguyên tố (không dùng quầng laser_trung chung vàng chanh)
  quang(T, x, y, co, song, m) { if (typeof FXU !== 'undefined' && FXU.ten(T, 'trung')) { const g = G.dangBan; G.dangBan = T; FX.no('laser_trung', x, y, co, song); G.dangBan = g; } else FX.vong1(x, y, 4, co * 0.5, m, song, 3); },
  // giới hạn chung toàn màn: rung / chớp không chồng liên tục dù nhiều ụ đỏ
  duocLac(cd) { if (G.t - this.lacT < cd) return false; this.lacT = G.t; return true; },
  duocSang(cd) { if (G.t - this.sangT < cd) return false; this.sangT = G.t; return true; },
  _cho(T, k, cd) { const t = T['_tv' + k] || -9; if (G.t - t < cd) return false; T['_tv' + k] = G.t; return true; },

  trung(T, E, crit) {
    const b = this.bac(T); if (b < 1 || !E) return;
    const x = E.x, y = E.y, m = this.mau(T);
    if (!this._cho(T, 'h', b >= 3 ? 0.18 : 0.12)) return;
    // XANH+: hạt phụ nhỏ
    const n = b === 1 ? 4 : b === 2 ? 5 : 6;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = rnd(60, 120); FX.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v, 0.26, 7, m); }
    if (b < 2) return;
    // TÍM+: vòng tròn mảnh (hình phụ)
    FX.vong1(x, y, 4, b >= 3 ? 26 : 20, m, 0.22, 2);
    if (b < 3) return;
    // VÀNG+: tia lửa tung + quầng nhỏ
    FX.tiaLua(x, y, crit ? 8 : 5, m, 220, 9); // tia lửa = màu nguyên tố (trước: vàng nhạt cố định cho mọi ụ — băng/nước/độc cũng tung tia vàng)
    this.quang(T, x, y, 44, 0.22, m);
    if (b < 4) return;
    // ĐỎ: WOW (mỗi ụ tối đa ~1 lần / 0.9 s, chí mạng được ưu tiên)
    if (!this._cho(T, 'w', crit ? 0.6 : 0.9)) return;
    this.wow(x, y, m, T);
  },
  // 09/11 (tuvan/anim-bac — dịu trận đông): nhiều ụ Đỏ cùng nổ WOW trong 0,6 s → nổ sau nhỏ/ngắn dần (n = số nổ WOW gần đây):
  //   n ≤ 1: đủ bộ (khoảnh khắc "đã") · n 2–3: nổ 70%, ngắn 0,3 s, bỏ vòng màu 54 px, 2 than · n ≥ 4: chỉ quầng + vòng trắng nhỏ.
  //   Than đọng 6 → 4 (đọng trên đường lâu nhất). ?dodiu=0 = bản cũ để so.
  DIU_WOW: !(typeof location !== 'undefined' && /[?&]dodiu=0\b/.test(location.search)), _wow: [],
  wow(x, y, m, T) {
    let n = 0;
    if (this.DIU_WOW) { const a = this._wow; if (a.length && G.t < a[a.length - 1]) a.length = 0; while (a.length && G.t - a[0] > 0.6) a.shift(); n = a.length; a.push(G.t); }
    const nhe = n >= 2, rat = n >= 4, kc = nhe ? 0.7 : 1;
    if (!rat) {
      if (T) { const g = G.dangBan; G.dangBan = T; FX.no('no_phao', x, y, 88 * kc, nhe ? 0.3 : 0.4); G.dangBan = g; } // nổ = ảnh trúng riêng của ụ (nổ pháo cam chung chỉ khi ụ chưa có ảnh)
      else FX.no('no_phao', x, y, 88 * kc, nhe ? 0.3 : 0.4);
    }
    if (T) this.quang(T, x, y, 66 * kc, nhe ? 0.24 : 0.3, m); else FX.no('laser_trung', x, y, 66 * kc, 0.3);
    FX.vong1(x, y, 6, 30, '#ffffff', 0.25, 3);
    if (!nhe) FX.vong1(x, y, 10, 54, m, 0.38, 3);
    const nThan = !this.DIU_WOW ? 6 : rat ? 0 : nhe ? 2 : 4;
    for (let i = 0; i < nThan; i++) FX.hat1('than', x + rnd(-16, 16), y + rnd(-10, 10), rnd(-14, 14), rnd(-34, -14), 0.6, 5, m); // than đọng = màu nguyên tố (trước: than CAM cho mọi ụ đỏ — Cryo Reactor/Leviathan cũng rơi than lửa)
    if (this.duocSang(1.6)) FX.sang(0.08, m);
    if (this.duocLac(0.8)) FX.lac(2);
  },
  ban(T) {
    const b = this.bac(T); if (b < 3 || !this._cho(T, 'b', 0.15)) return;
    const [x, y] = dauNong(T), m = this.mau(T);
    for (let i = 0; i < 3; i++) { const a = T.goc + rnd(-0.5, 0.5), v = rnd(60, 130); FX.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v, 0.2, 5, i ? m : '#fff3c0'); }
    if (b >= 4) FX.vong1(x, y, 3, 16, m, 0.2, 2);
  },
  dan(d, dt) {
    const T = d.T; if (!T || !T.bac) return;
    const b = this.bac(T); if (b < 3) return;
    const yy = d.y - (d.z || 0);
    if (Math.random() < dt * (b >= 4 ? 34 : 24)) FX.hat1('lua', d.x + rnd(-2, 2), yy + rnd(-2, 2), rnd(-12, 12), rnd(-12, 12), 0.22, b >= 4 ? 7 : 6, this.mau(T));
    if (b >= 4 && Math.random() < dt * 6) FX.hat1('than', d.x, yy, rnd(-8, 8), -16, 0.45, 4, this.mau(T)); // vệt than sau đạn ụ đỏ = màu nguyên tố (trước: cam cho mọi ụ)
  },
};
