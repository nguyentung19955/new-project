// TURRET MERGE — Ụ CỜ BẠC "LUCKY SLOT" (cobac, ĐỎ, Tấn công) + JACKPOT (08/11 người dùng: jackpot CHỈ là cơ chế của 1 ụ cờ bạc này;
//   mọi jackpot cũ — Orbital Cascade, Chain Reactor, Six Seals/Royal Vault, Loaded Dice, Perfect Frequency, True North… — đã BỎ, bù bằng chỉ số, xem GAMEPLAY.md).
//  · Ụ chỉ QUAY ĐÚNG 1 LẦN khi XUẤT HIỆN (triệu hồi / ghép / bản sao / trùm biến); tăng sao TẠI CHỖ (Merge King, Genesis Core…) KHÔNG quay lại.
//  · MÁY XÈNG 3 Ô (08/11 người dùng, làm lại): cả 3 cuộn quay 1,2 s rồi DỪNG LẦN LƯỢT TRÁI → PHẢI (cách 0,35 s), mỗi ô ra cam / dưa hấu / nho:
//      3 ô GIỐNG NHAU = JACKPOT → MỖI ngăn +2 · đúng 2 ô giống = +1 điểm cho quả đó · 3 ô KHÁC NHAU = tự QUAY LẠI (0,7 s) tới khi có cặp/jackpot.
//    Điểm KHÔNG còn nhân theo sao (súng có tăng sao thường như mọi ụ: dmgU × (1 + 0,85·(sao−1))). Đang quay (mọi lượt) ụ không bắn.
//    Cuộn đều (mỗi ô 1/3): 3 giống 1/9 · cặp 2/3 · khác hết 2/9 → mỗi lượt xong: JACKPOT 1/7 ≈ 14,3 %, cặp 6/7 ≈ 85,7 %; trung bình 1,29 lượt quay.
//  · Ngăn quả là CỦA BÀN (B.cb = [cam, dưa, nho]) — dùng chung cho MỌI Lucky Slot đã quay xong, không mất khi ụ bị ghép đi.
//    Mỗi điểm (cấp thẻ đầu, × "Fruit power" KY_NANG_CAP.cobac 100% → 130% LV17): cam +4,5% ST · dưa +3% tốc (giảm dần, trần +150%) · nho +15% ST chí mạng.
//  · TẤT ĐỊNH: ô j của lượt k trong lần quay n = rngHat(hạt trận·7331 + bàn·977 + n·104729 + k·7919 + j·131 + 17) — không Math.random.
//    Online: máy chủ bàn gửi gói 'cb' { o, q: [[a,b,c]…] (MỌI ô của MỌI lượt), s, st, n }; bàn con rối phát lại đúng chuỗi + nhận ngăn quả.
//  · Hình (CHỈ trình bày, không đổi luật): khung 3 ô trên ô ụ, cuộn mờ chuyển động → dừng "cạch" từng ô → cặp: 2 ô sáng xanh;
//    khác hết: ô tối đỏ + biểu tượng quay lại; jackpot: 3 ô sáng + bùng nổ + 3 quả toé + dải fx_cb_no. Khay trận: 3 icon quả + số ngăn.
// Nạp SAU skills7.js (index.html).
'use strict';

const CB = {
  QUA: ['cam', 'dua', 'nho'], TEN: ['ORANGE', 'WATERMELON', 'GRAPE'], MAU: ['#ffa21a', '#ff4a6a', '#b45cff'],
  IC: ['cb_cam', 'cb_dua', 'cb_nho'],
  JP_K: 2,           // JACKPOT (3 ô giống): MỖI ngăn +JP_K
  CAP: 1,            // cặp (2 ô giống): +CAP cho quả đó
  QUAY: 1.2, QUAY_LAI: 0.7, CACH: 0.35, NGHI: 0.45, // cuộn đầu 1,2 s · quay lại 0,7 s · các ô dừng cách 0,35 s · khác hết: dừng 0,45 s rồi quay lại
  SAU: [0.4, 0.9],   // sau ô cuối: cặp 0,4 s · jackpot 0,9 s (ăn mừng) rồi mới thành súng
  MAX_LUOT: 12,      // chặn vô hạn (xác suất 12 lượt khác hết liền ≈ (2/9)^12 ≈ 1e-8): lượt 12 ép ô 3 = ô 1
  DMG: 0.045, TOC: 0.03, TOC_TRAN: 1.5, CDMG: 0.15, // mỗi điểm ngăn (cấp thẻ đầu) — 08/11: điểm kiểu cũ / điểm 3 ô ≈ 1,2–1,6 (tools/thap-sim-co-bac.js diem) → mỗi điểm ×1,5 cũ (3% / 2% / 10%)
  MOC: [10, 25, 50, 100], // mốc màu số ngăn trên khay (DOTPHA.MAU: vàng / lam / tím / trắng)
  he(B) { const v = typeof knThe === 'function' ? knThe(B, 'cobac') : null; return (v || 100) / 100; },
  st(B) { if (!B.cb) B.cb = [0, 0, 0]; return B.cb; },
  // +% theo ngăn của bàn B: k = 'dmg' | 'toc' | 'cdmg'
  gt(B, k) {
    if (!B || !B.cb) return 0; const h = this.he(B), a = B.cb;
    if (k === 'dmg') return a[0] * this.DMG * h;
    if (k === 'cdmg') return a[2] * this.CDMG * h;
    return this.TOC_TRAN * (1 - Math.exp(-a[1] * this.TOC * h / this.TOC_TRAN)); // tốc: giảm dần, tiến tới +150%
  },
  laSung: (T) => !!(T && T.id === 'cobac' && T.cbS > 0 && !(T.cbQuay > 0)),
  hat() { return ((typeof ONS !== 'undefined' && ONS.on ? ONS.seed : G.hat) || 1) | 0; },
  // ô j (0..2) của lượt k trong lần quay thứ n của bàn B: 0 cam · 1 dưa · 2 nho
  o(B, n, k, j) { return Math.min(2, Math.floor(rngHat(this.hat() * 7331 + (B.i | 0) * 977 + n * 104729 + k * 7919 + j * 131 + 17)() * 3)); },
  // kết quả 1 lượt [a,b,c]: { jp, f } — f = quả trúng (cặp / jackpot), -1 = khác hết (quay lại)
  kq(l) { const [a, b, c] = l; if (a === b && b === c) return { jp: true, f: a }; if (a === b || a === c) return { jp: false, f: a }; if (b === c) return { jp: false, f: b }; return { jp: false, f: -1 }; },
  // ép kết quả (clip hướng dẫn / test): số 0..2 = cặp quả đó, 3 = JACKPOT cam, mảng = chuỗi lượt [[a,b,c]…]
  epChuoi(e) { if (Array.isArray(e)) return e.map(l => l.slice()); if (e === 3) return [[0, 0, 0]]; const f = e | 0; return [[f, (f + 1) % 3, f]]; },
  // CHUỖI lần quay thứ n của bàn B: mọi lượt tới khi có cặp/jackpot
  rut(B, n) {
    if (G._cbEp && G._cbEp.length) return this.epChuoi(G._cbEp.shift()); // clip hướng dẫn (skilldemo) / test ép kết quả
    const q = [];
    for (let k = 0; k < this.MAX_LUOT; k++) {
      const l = [this.o(B, n, k, 0), this.o(B, n, k, 1), this.o(B, n, k, 2)];
      if (k === this.MAX_LUOT - 1 && this.kq(l).f < 0) l[2] = l[0];
      q.push(l); if (this.kq(l).f >= 0) break;
    }
    return q;
  },
  // lịch thời gian 1 chuỗi (luật + hình dùng chung): mỗi lượt { t0, dung: [t ô 0, 1, 2] }; het = lúc thành súng
  lich(q) {
    const L = []; let t = 0;
    for (let k = 0; k < q.length; k++) {
      const d0 = t + (k ? this.QUAY_LAI : this.QUAY); L.push({ t0: t, dung: [d0, d0 + this.CACH, d0 + 2 * this.CACH] });
      t = d0 + 2 * this.CACH + (k < q.length - 1 ? this.NGHI : 0);
    }
    const r = this.kq(q[q.length - 1]); return { L, cuoi: t, het: t + this.SAU[r.jp ? 1 : 0] };
  },
  // QUAY (luật). ep = { q, s, n } khi phát lại gói mạng (bàn con rối)
  quay(B, T, ep) {
    const n = ep && ep.n ? ep.n : (B.cbN | 0) + 1; B.cbN = Math.max(B.cbN | 0, n);
    let q = ep && Array.isArray(ep.q) && ep.q.length ? ep.q.map(l => [0, 1, 2].map(j => Math.max(0, Math.min(2, l[j] | 0)))) : null;
    if (!q && ep && ep.f != null) q = this.epChuoi(ep.f); // gói cũ (chỉ f)
    if (!q) q = this.rut(B, n);
    const s = ep ? ep.s | 0 : T.sao, a = this.st(B), r = this.kq(q[q.length - 1]);
    T.cbS = Math.max(T.cbS | 0, s || 1); T.cbQ = q; T.cbKq = r.jp ? 3 : r.f; T.cbQuay = this.lich(q).het;
    if (r.jp) for (let i = 0; i < 3; i++) a[i] += this.JP_K; else a[r.f] += this.CAP;
    (G.cbLog || (G.cbLog = [])).push({ t: Math.round(G.t * 100) / 100, ban: B.i, o: T.o, s, f: T.cbKq, q: q.map(l => l.join('')).join('|') });
    if (!ep && typeof ONS !== 'undefined' && ONS.on && B === G.ban[0]) ONS.gui('cb', { o: T.o, q, f: T.cbKq, s, st: a.slice(), n });
    try { this.hien(B, T, q); } catch (e) { }
    return T.cbKq;
  },
  // ---- trình bày ----
  hien(B, T, q) {
    if (typeof G === 'undefined' || !G.hu) return;
    const lc = this.lich(q), r = this.kq(q[q.length - 1]);
    G.hu.push({ k: 'cbQuay', t: 0, song: lc.het + (r.jp ? 0.5 : 0.3), B, T, o: T.o, q, lc, r, f: r.jp ? 3 : r.f, da: false, am: {}, v: (B.cb || [0, 0, 0]).slice() });
  },
  coTieng(B) { return (!B.ai || G.che === 'pvp') && typeof SND !== 'undefined'; },
  // số ngăn đang HIỆN (chờ cuộn dừng mới nhảy số) — chỉ hình
  hienSo(B) { if (!B) return [0, 0, 0]; if (!B.cbV || !(G.hu && G.hu.some(o => o.k === 'cbQuay' && o.B === B && !o.da))) B.cbV = (B.cb || [0, 0, 0]).slice(); return B.cbV; },
  mauSo(n) { let b = 0; for (const x of this.MOC) if (n >= x) b++; return b ? (typeof DOTPHA !== 'undefined' ? DOTPHA.MAU[b] : ['', '#ffd84a', '#7fc8ff', '#d9a0ff', '#ffffff'][b]) : '#ffffff'; },
};

// =====================================================================================================
// SKILLS.cobac — Lucky Slot (Đỏ TC): bắn xu vàng 1 phát/s vào quái đầu · không kỹ năng chủ động (kỹ năng = máy xèng 3 ô + ngăn quả)
// =====================================================================================================
SKILLS.cobac = {
  vai: 'tc', dmg: 50, toc: 1.0, crit: 0.15, nham: 'dau', khongNang: true, // 08/11 người dùng: KHÔNG nâng cấp bằng mana trong trận (ngăn quả đã mạnh vô hạn theo thời gian) — ẩn giá, AI bỏ qua, nangCap từ chối // 50 × Đỏ 2.7 — cân bằng 08/11 (3 ô): xem GAMEPLAY.md + tools/thap-sim-co-bac.js
  mo: (T) => {
    const B = T && G.ban && G.ban[T.ban], a = (B && B.cb) || [0, 0, 0], p = (k) => Math.round(CB.gt(B || { cb: a }, k) * 100), h = CB.he(B);
    return 'Spins 3 fruit reels when it appears (summon or merge). A pair = +1 point to that fruit; 3 of a kind = JACKPOT: +2 to all fruits. No match = spin again. Points are shared by all Lucky Slots. Orange = damage, Watermelon = speed, Grape = crit damage. Raising its star in place (like Merge King) doesn\'t spin again.'
      + ' · no mana power-up · Per point: +' + +(CB.DMG * h * 100).toFixed(1) + '% damage, +' + +(CB.TOC * h * 100).toFixed(1) + '% speed (less as it grows, max +150%), +' + +(CB.CDMG * h * 100).toFixed(1) + '% crit damage'
      + ' · Now: Orange ' + a[0] + ' (+' + p('dmg') + '%), Watermelon ' + a[1] + ' (+' + p('toc') + '%), Grape ' + a[2] + ' (+' + p('cdmg') + '%)';
  },
  sinh(G, T) { T.cbS = 0; T.cbQuay = 0; T.cbQ = null; },
  capNhat(G, B, T, dt) {
    const conRoi = B.net && typeof ONS !== 'undefined' && ONS.on; // bàn con rối: chờ gói 'cb' của máy bạn
    if (B.lv && B.lv.cobac > 1) B.lv.cobac = 1; // không nâng cấp trong trận: lỡ có cấp (trận lưu cũ / gói cũ) → về hệ số gốc
    if (!conRoi && !(T.cbS > 0)) CB.quay(B, T); // chỉ quay 1 lần khi xuất hiện — lên sao tại chỗ không quay lại
    if (T.cbQuay > 0) { T.cbQuay = Math.max(0, T.cbQuay - dt); xoayDau(T, quaiDau(B), dt); return true; } // đang quay: không bắn
    return false;
  },
  ban(G, B, T, E) {
    const anh = typeof REN !== 'undefined' && REN.img && REN.img('cb_xu') ? 'cb_xu' : 'tia_lua';
    banNhe(B, T, E, { img: anh, co: 17, mau: '#ffd23f', sp: 520 });
  },
};

// đăng ký: họ JOKER (Đỏ), 3 giai đoạn lớn lên (vòng sáng quanh đầu, không ảnh riêng), nhịp hiển thị
if (typeof themHo === 'function') themHo('joker', 4, 'cobac', '3-reel fruit slot: pair = +1 shared fruit point, 3 of a kind = JACKPOT');
if (typeof GROW !== 'undefined') GROW.cobac = { mau: '#ffb43a', khongAnh: true, ten: ['SLOT', 'HIGH ROLLER', 'GRAND CASINO'], dk: '1–3★ / 4–6★ / 7★ · spins 3 reels once when it appears',
  gd: (T) => ({ s: T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1, p: (T.sao - 1) / 6, v: [0.5] }) };
if (typeof NHIP !== 'undefined') NHIP.cobac = () => '1 coin/s · reels ~2s';

// buff ngăn quả → CHUNG nhóm cộng (đặt sau khi buff được đặt lại mỗi khung, như mốc sao / jackpot cũ)
{
  const _mocBufCB = mocBuf;
  mocBuf = function (B) {
    const r = _mocBufCB.apply(this, arguments);
    if (B && B.t && B.cb) {
      const d = CB.gt(B, 'dmg'), t = CB.gt(B, 'toc'), c = CB.gt(B, 'cdmg');
      for (const T of B.t) if (CB.laSung(T)) { T.buf.dmg += d; T.buf.toc += t; T.buf.cdmg = (T.buf.cdmg || 0) + c; }
    }
    return r;
  };
  const _batDauCB = batDau;
  batDau = function () { G.cbLog = []; return _batDauCB.apply(this, arguments); };
}

// =====================================================================================================
// HÌNH (chỉ trình bày — không đổi luật): khung 3 ô (cb_khung3) trên ô ụ · cuộn mờ (cb_*_m) → dừng "cạch" trái → phải (cb_dung) ·
//   cặp: 2 ô sáng (cb_cap) + "+1" · khác hết: ô tối đỏ + biểu tượng quay lại (cb_lai) · JACKPOT: 3 ô sáng + bùng nổ cb_jp + dải fx_cb_no + 3 quả toé.
//   Âm: tiếng cuộn mỗi lượt, "cạch" mỗi ô, chuông cặp, "hụt" khi khác hết, jackpot. Thiếu PNG → vẽ dự phòng.
// =====================================================================================================
CB.K3 = { w: 320, h: 203, o: [[14.7, 43.3, 20.6, 33.0], [39.7, 43.3, 20.9, 33.0], [65.0, 43.3, 20.6, 33.0]] }; // ô kính trong cb_khung3 (% — tools/thap-cat-xeng3.py in ra)
CB.am = function (o, k, f) { if (o.am[k]) return; o.am[k] = 1; if (!CB.coTieng(o.B)) return; try { f(); } catch (e) { } };
HU.cbQuay = {
  cap(G, o) {
    const B = o.B; if (!B) return true;
    const t = o.t, L = o.lc.L, cuoi = L[L.length - 1];
    // âm theo dòng thời gian (mỗi mốc 1 lần)
    for (let k = 0; k < L.length; k++) {
      if (t >= L[k].t0) CB.am(o, 'q' + k, () => SND.cbCuon ? SND.cbCuon(k ? CB.QUAY_LAI : CB.QUAY) : SND.quay());
      for (let j = 0; j < 3; j++) if (t >= L[k].dung[j]) CB.am(o, 'd' + k + j, () => SND.cbDung && SND.cbDung(j));
      if (k < L.length - 1 && t >= L[k].dung[2] + 0.05) CB.am(o, 'h' + k, () => SND.cbHut && SND.cbHut());
    }
    if (!o.da && t >= cuoi.dung[2]) {
      o.da = true; if (B) B.cbV = (B.cb || o.v).slice(); // số trên khay nhảy lúc ô cuối dừng
      const c = B.o[o.o];
      if (o.r.jp) { CB.am(o, 'jp', () => { if (SND.jackpot) SND.jackpot(); else if (SND.thucTinh) SND.thucTinh(); }); if (c && typeof FX !== 'undefined') FX.vong1(c.x, c.y, 10, 70, '#ffd23f', 0.4, 5); }
      else { CB.am(o, 'cap', () => SND.cbCap ? SND.cbCap(o.r.f) : SND.ghep && SND.ghep(3, B.ai)); if (c && typeof FX !== 'undefined') FX.vong1(c.x, c.y, 8, 40, CB.MAU[o.r.f], 0.3, 3); }
    }
    return t >= o.song;
  },
  ve(ctx, o, R) {
    const B = o.B, c = B && B.o[o.o]; if (!c || !R) return;
    const t = o.t, L = o.lc.L, C = Math.min(B.cw, B.ch);
    let k = 0; while (k < L.length - 1 && t >= L[k + 1].t0) k++;
    const lu = L[k], l = o.q[k], r = CB.kq(l), xong = t >= lu.dung[2], sau = t - lu.dung[2], cuoi = k === L.length - 1;
    const tat = o.lc.het + (o.r.jp ? 0.15 : 0); // khung mờ đi sau khi thành súng
    const hien = t < 0.1 ? t / 0.1 : t > tat ? Math.max(0, 1 - (t - tat) / 0.25) : 1;
    if (hien <= 0) return;
    // khung (rộng 1,5 ô, đặt trên đầu ụ)
    const F = C * 1.5, Fh = F * CB.K3.h / CB.K3.w, x = c.x, y = c.y - C * 0.12, fx0 = x - F / 2, fy0 = y - Fh / 2;
    const nay = xong && cuoi && o.r.jp ? 1 + 0.08 * Math.sin(Math.min(1, sau / 0.5) * Math.PI) : 1; // jackpot: khung nảy
    ctx.save(); ctx.globalAlpha = hien;
    if (nay !== 1) { ctx.translate(x, y); ctx.scale(nay, nay); ctx.translate(-x, -y); }
    const kh = R.img && R.img('cb_khung3');
    const W = CB.K3.o.map(q => [fx0 + F * q[0] / 100, fy0 + Fh * q[1] / 100, F * q[2] / 100, Fh * q[3] / 100]);
    if (kh) ctx.drawImage(kh, fx0, fy0, F, Fh);
    else { ctx.fillStyle = 'rgba(120,8,20,0.95)'; ctx.fillRect(fx0 + F * 0.08, fy0 + Fh * 0.3, F * 0.84, Fh * 0.58); for (const w of W) { ctx.fillStyle = '#101a33'; ctx.fillRect(w[0], w[1], w[2], w[3]); } } // vetay-ok: png (dự phòng khi chưa tải cb_khung3)
    // 3 cuộn
    for (let j = 0; j < 3; j++) {
      const [ix, iy, iw, ih] = W[j], cx = ix + iw / 2, cy = iy + ih / 2, d = t - lu.dung[j], co = Math.min(iw, ih) * 0.92;
      ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip(); // vetay-ok: mask (cắt trong ô kính)
      if (d < 0) { // đang quay: dải quả mờ trượt xuống, nhanh
        const v = (t - lu.t0) * 11 + j * 1.3, f0 = Math.floor(v), du = v - f0;
        for (let i = -1; i <= 1; i++) { const qi = (((f0 - i + j) % 3) + 3) % 3, yy = cy + (du + i) * ih; if (!R.anhGiua(ctx, CB.IC[qi] + '_m', cx, yy, co) && !R.anhGiua(ctx, CB.IC[qi], cx, yy, co)) { ctx.fillStyle = CB.MAU[qi]; ctx.fillRect(cx - co * 0.3, yy - co * 0.4, co * 0.6, co * 0.8); } } // vetay-ok: png (dự phòng)
      } else { // dừng: quả nảy "cạch" (quá đà xuống rồi về)
        const dy = d < 0.28 ? ih * 0.2 * Math.exp(-d * 14) * Math.cos(d * 26) : 0, qi = l[j];
        if (!R.anhGiua(ctx, CB.IC[qi], cx, cy + dy, co)) { ctx.fillStyle = CB.MAU[qi]; ctx.beginPath(); ctx.arc(cx, cy + dy, co * 0.36, 0, 6.283); ctx.fill(); } // vetay-ok: png (dự phòng)
        if (xong && r.f < 0) { ctx.fillStyle = 'rgba(120,0,0,' + Math.min(0.55, sau * 2) + ')'; ctx.fillRect(ix, iy, iw, ih); } // vetay-ok: mask (ô tối đỏ: khác hết)
      }
      ctx.restore(); ctx.globalAlpha = hien;
      // "cạch": khung vàng chớp 0,22 s
      if (d >= 0 && d < 0.22) { const p = d / 0.22; ctx.save(); ctx.globalAlpha = hien * (1 - p); if (!R.anhGiua(ctx, 'cb_dung', cx, cy, iw * (1.45 - 0.25 * p))) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = Math.max(1, C * 0.04); ctx.strokeRect(ix, iy, iw, ih); } ctx.restore(); } // vetay-ok: png (dự phòng)
      // cặp / jackpot: ô trúng sáng
      if (xong && r.f >= 0 && (r.jp || l[j] === r.f)) {
        const p = 0.75 + 0.25 * Math.sin(sau * 12); ctx.save(); ctx.globalAlpha = hien * Math.min(1, sau * 6) * p;
        if (!R.anhGiua(ctx, 'cb_cap', cx, cy, iw * 1.55)) { ctx.strokeStyle = '#9dff4a'; ctx.lineWidth = Math.max(1.5, C * 0.05); ctx.strokeRect(ix - 1, iy - 1, iw + 2, ih + 2); } ctx.restore(); // vetay-ok: png (dự phòng)
      }
    }
    // khác hết → biểu tượng quay lại xoay giữa khung
    if (xong && r.f < 0 && !cuoi) {
      const p = Math.min(1, sau / CB.NGHI); ctx.save(); ctx.globalAlpha = hien * (p < 0.8 ? Math.min(1, p * 5) : (1 - p) / 0.2);
      if (!R.anhGiua(ctx, 'cb_lai', x, y + Fh * 0.12, Fh * 0.75, -p * 6.283)) { ctx.strokeStyle = '#ff6a3a'; ctx.lineWidth = Math.max(2, C * 0.06); ctx.beginPath(); ctx.arc(x, y + Fh * 0.12, Fh * 0.28, p * 6.283, p * 6.283 + 4.7); ctx.stroke(); } // vetay-ok: png (dự phòng)
      ctx.restore();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    if (!(xong && cuoi)) return;
    // cặp: icon quả + "+1" bay lên
    if (!o.r.jp) {
      const p = Math.min(1, sau / 0.7), a = p < 0.7 ? 1 : (1 - p) / 0.3; if (a <= 0) return;
      const yy = fy0 - C * 0.05 - p * C * 0.35, s = C * 0.34;
      ctx.save(); ctx.globalAlpha = a * hien; R.anhGiua(ctx, CB.IC[o.r.f], x - s * 0.45, yy, s);
      ctx.font = '900 ' + Math.round(C * 0.3) + 'px ' + (typeof FONT !== 'undefined' ? FONT.display : 'sans-serif'); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(2, C * 0.06); ctx.strokeStyle = '#2a0008'; ctx.strokeText('+1', x - s * 0.05, yy); ctx.fillStyle = '#fff'; ctx.fillText('+1', x - s * 0.05, yy); // vetay-ok: text
      ctx.restore(); return;
    }
    // JACKPOT: bùng nổ cb_jp + dải fx_cb_no + huy hiệu + 3 quả toé + chữ
    const p = Math.min(1, sau / 1.1);
    const no = R.img && R.img('fx_cb_no');
    if (no && no.width) { const n = 8, fw = no.width / n, f = Math.min(n - 1, Math.floor(p * n)), s2 = C * (1.6 + 0.9 * p); ctx.save(); ctx.globalAlpha = p < 0.75 ? 1 : (1 - p) / 0.25; ctx.drawImage(no, f * fw, 0, fw, no.height, x - s2 / 2, y - s2 / 2, s2, s2); ctx.restore(); }
    { const k2 = p < 0.12 ? p / 0.12 : 1, sz = C * (0.8 + 1.0 * k2) * (p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1); if (sz > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, k2); if (!R.anhGiua(ctx, 'cb_jp', x, y, sz, p * 0.8)) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1('#ffd23f'), x, y, sz); } ctx.restore(); } }
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 1.1, rr = C * (0.2 + 0.85 * Math.sqrt(p)), qx = x + Math.cos(a) * rr, qy = y + Math.sin(a) * rr - C * 0.25 * Math.sin(p * Math.PI);
      ctx.save(); ctx.globalAlpha = p < 0.7 ? 1 : (1 - p) / 0.3;
      if (!R.anhGiua(ctx, CB.IC[i], qx, qy, C * 0.5 * (1 + 0.3 * Math.sin(p * Math.PI)))) { ctx.fillStyle = CB.MAU[i]; ctx.beginPath(); ctx.arc(qx, qy, C * 0.16, 0, 6.283); ctx.fill(); } // vetay-ok: png (dự phòng)
      ctx.restore();
    }
    { const a = p < 0.08 ? p / 0.08 : p > 0.8 ? (1 - p) / 0.2 : 1, sc = 1 + 0.25 * Math.max(0, 1 - p * 5), yy = fy0 - C * 0.15;
      ctx.save(); ctx.globalAlpha = a; ctx.font = '900 ' + Math.round(C * 0.36 * sc) + 'px ' + (typeof FONT !== 'undefined' ? FONT.display : 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(2, C * 0.08); ctx.strokeStyle = '#4a0008'; ctx.strokeText('JACKPOT!', x, yy); ctx.fillStyle = '#ffd23f'; ctx.fillText('JACKPOT!', x, yy); ctx.restore(); } // vetay-ok: text
  },
};

// số trên khay: ≤ 999 hiện đủ; ≥ 1000 (chỉ ở trận vô tận rất dài) rút gọn 1.2k / 12k — số đúng vẫn ở bảng chỉ số + chữ kỹ năng
CB.soNgan = (n) => n < 1000 ? String(n) : n < 10000 ? (Math.floor(n / 100) / 10) + 'k' : Math.floor(n / 1000) + 'k';
// co chữ số cho vừa ô (đo bề rộng thật, không phụ thuộc phông/cỡ màn): bóp ngang trước, dọc tối đa xuống 80%
CB.vuaO = function (b, o) {
  b.style.transform = 'none'; const w = b.scrollWidth, cw = o.clientWidth * 0.88; if (!w || !cw) { b.style.transform = ''; return; }
  const sx = Math.min(1, cw / w), sy = Math.min(1, Math.max(0.8, sx * 1.25));
  b.style.transform = sx < 1 ? 'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')' : 'none';
};
// ---------- khay trận: 3 icon quả + số ngăn dưới chân dung thẻ Lucky Slot (#bo-the .the[data-id=cobac]) + dải thẻ bàn kia ----------
CB.khay = function () {
  if (typeof document === 'undefined' || !G.ban || !G.ban.length) return;
  const gan = (d, B) => {
    let s = d._cb; if (!s || !s.isConnected) {
      s = d.querySelector(':scope > .cb-qua');
      if (!s) { s = document.createElement('span'); s.className = 'cb-qua'; s.innerHTML = CB.IC.map((ic, i) => '<i class="cb-q cb-q' + i + '"><img src="' + (typeof anhUrl === 'function' ? anhUrl(ic) : 'assets/' + ic + '.png') + '" alt="" draggable="false"><b>0</b></i>').join(''); d.appendChild(s); }
      d._cb = s; s._v = [-1, -1, -1];
    }
    const v = CB.hienSo(B), q = s.children, rong = s.clientWidth;
    for (let i = 0; i < 3; i++) if (s._v[i] !== v[i] || s._r !== rong) {
      const b = q[i].lastChild, tang = s._v[i] >= 0 && v[i] > s._v[i];
      b.textContent = CB.soNgan(v[i]); b.style.color = CB.mauSo(v[i]); q[i].classList.toggle('so3', v[i] >= 100); // 3 chữ số: chữ nhỏ hơn
      CB.vuaO(b, q[i]);
      if (tang && s._v[i] !== v[i]) { q[i].classList.remove('cb-nhay'); void q[i].offsetWidth; q[i].classList.add('cb-nhay'); }
      s._v[i] = v[i];
    }
    s._r = rong;
  };
  document.querySelectorAll('#bo-the .the[data-id="cobac"]').forEach(d => gan(d, G.ban[0]));
  const D = G.ban[1], dp = document.getElementById('dp-dai');
  if (D && dp && !dp.hidden) dp.querySelectorAll('.dp-the[data-id="cobac"]').forEach(d => gan(d, D));
};
if (typeof addEventListener === 'function') addEventListener('DOMContentLoaded', () => {
  if (typeof UI !== 'undefined' && UI.capNhat) { const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { CB.khay(); } catch (e) { console.error('CB.khay', e); } return r; }; }
  if (typeof REN !== 'undefined' && REN.img) for (const t of CB.IC.concat(CB.IC.map(x => x + '_m'), ['cb_khung3', 'cb_dung', 'cb_cap', 'cb_lai', 'cb_jp', 'fx_cb_no', 'cb_xu'])) { if (REN.CO_DINH) REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
});
window.CB = CB;
