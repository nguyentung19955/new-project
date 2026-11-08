// TURRET MERGE — Ụ CỜ BẠC "LUCKY SLOT" (cobac, ĐỎ, Tấn công) + JACKPOT (08/11 người dùng: jackpot CHỈ là cơ chế của 1 ụ cờ bạc này;
//   mọi jackpot cũ — Orbital Cascade, Chain Reactor, Six Seals/Royal Vault, Loaded Dice, Perfect Frequency, True North… — đã BỎ, bù bằng chỉ số, xem GAMEPLAY.md).
//  · Mỗi lần ụ XUẤT HIỆN (triệu hồi / ghép / bản sao / trùm biến) và mỗi lần SAO TĂNG (T.sao > sao đã quay) → QUAY máy xèng 1,0 s (trong lúc quay ụ không bắn),
//    ra 1 trong 3 quả: CAM (+sát thương) · DƯA HẤU (+tốc bắn) · NHO (+sát thương chí mạng) → cộng SỐ SAO hiện tại vào ngăn quả đó.
//    10% JACKPOT: cả 3 quả nổ tung → MỖI ngăn +2 × số sao.
//  · Ngăn quả là CỦA BÀN (B.cb = [cam, dưa, nho]) — dùng chung, áp cho MỌI Lucky Slot trên bàn đã quay xong (đã thành súng), không mất khi ụ bị ghép đi.
//    Mỗi điểm (cấp thẻ đầu, × "Fruit power" KY_NANG_CAP.cobac 100% → 130% LV17): cam +3% ST · dưa +2% tốc (giảm dần, trần +150%) · nho +10% ST chí mạng.
//    Không trần (trừ tốc). Tỉ lệ chí mạng KHÔNG đổi theo ngăn (ụ có sẵn +15% chí mạng gốc). Cộng vào CHUNG nhóm buff (T.buf) như mọi nguồn.
//  · TẤT ĐỊNH: kết quả quay = rngHat(hạt trận × … + bàn + lần quay thứ n) — không Math.random. Online: máy chủ bàn quay rồi gửi gói 'cb' { o, f, s, st, n };
//    bàn con rối (B.net) KHÔNG tự quay, chỉ phát lại hình + nhận ngăn quả; ảnh chụp bàn mang cb + cờ 'z<sao đã quay>' để sửa lệch.
//  · Hình (CHỈ trình bày, không đổi luật): khung cuộn máy xèng trên ô 1,0 s → dừng ở quả trúng; jackpot: 3 quả bay toé + dải nổ fx_cb_no.
//    Khay trận: dưới chân dung thẻ Lucky Slot hiện 3 icon quả + số ngăn (nháy khi tăng, màu theo mốc 10/25/50/100 như đột phá).
// Nạp SAU skills7.js (index.html).
'use strict';

const CB = {
  QUA: ['cam', 'dua', 'nho'], TEN: ['ORANGE', 'WATERMELON', 'GRAPE'], MAU: ['#ffa21a', '#ff4a6a', '#b45cff'],
  IC: ['cb_cam', 'cb_dua', 'cb_nho'],
  JP: 0.10,          // tỉ lệ JACKPOT mỗi lần quay
  JP_K: 2,           // jackpot: mỗi ngăn +JP_K × sao
  QUAY: 1.0,         // giây quay (ụ không bắn)
  DMG: 0.03, TOC: 0.02, TOC_TRAN: 1.5, CDMG: 0.10, // mỗi điểm ngăn (cấp thẻ đầu)
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
  // kết quả lần quay thứ n của bàn B: 0 cam · 1 dưa · 2 nho · 3 JACKPOT
  rut(B, n) { if (G._cbEp && G._cbEp.length) return G._cbEp.shift(); /* clip hướng dẫn (skilldemo) ép kết quả */ const r = rngHat(this.hat() * 7331 + (B.i | 0) * 977 + n * 104729); return r() < this.JP ? 3 : Math.min(2, Math.floor(r() * 3)); },
  // QUAY (luật). ep = { f, s } khi phát lại gói mạng (bàn con rối)
  quay(B, T, ep) {
    const n = ep && ep.n ? ep.n : (B.cbN | 0) + 1; B.cbN = n;
    const s = ep ? ep.s : T.sao, f = ep ? ep.f : this.rut(B, n), a = this.st(B);
    T.cbS = Math.max(T.cbS | 0, s); T.cbQuay = this.QUAY; T.cbKq = f;
    if (f === 3) for (let i = 0; i < 3; i++) a[i] += s * this.JP_K; else a[f] += s;
    (G.cbLog || (G.cbLog = [])).push({ t: Math.round(G.t * 100) / 100, ban: B.i, o: T.o, s, f });
    if (!ep && typeof ONS !== 'undefined' && ONS.on && B === G.ban[0]) ONS.gui('cb', { o: T.o, f, s, st: a.slice(), n });
    try { this.hien(B, T, f, s); } catch (e) { }
    return f;
  },
  // ---- trình bày ----
  hien(B, T, f, s) {
    if (typeof G === 'undefined' || !G.hu) return;
    G.hu.push({ k: 'cbQuay', t: 0, song: this.QUAY + (f === 3 ? 1.1 : 0.55), B, T, o: T.o, f, s, da: false, v: (B.cb || [0, 0, 0]).slice() });
    if ((!B.ai || G.che === 'pvp') && typeof SND !== 'undefined' && SND.quay) SND.quay();
  },
  // số ngăn đang HIỆN (chờ cuộn dừng mới nhảy số) — chỉ hình
  hienSo(B) { if (!B) return [0, 0, 0]; if (!B.cbV || !(G.hu && G.hu.some(o => o.k === 'cbQuay' && o.B === B && !o.da))) B.cbV = (B.cb || [0, 0, 0]).slice(); return B.cbV; },
  mauSo(n) { let b = 0; for (const x of this.MOC) if (n >= x) b++; return b ? (typeof DOTPHA !== 'undefined' ? DOTPHA.MAU[b] : ['', '#ffd84a', '#7fc8ff', '#d9a0ff', '#ffffff'][b]) : '#ffffff'; },
};

// =====================================================================================================
// SKILLS.cobac — Lucky Slot (Đỏ TC): bắn xu vàng 1 phát/s vào quái đầu · không kỹ năng chủ động (kỹ năng = máy xèng + ngăn quả)
// =====================================================================================================
SKILLS.cobac = {
  vai: 'tc', dmg: 50, toc: 1.0, crit: 0.15, nham: 'dau', // 50 × Đỏ 2.7: 4★ wave 12 (sim 60 s, cấp thẻ +3) ≈ 40k/phút không ngăn · ≈ 60k với 10/10/10 · ≈ 95k 20/20/20 (wave 12 ước 10–15/ngăn, thường có 2–3 Lucky Slot) — Hive Queen ≈ 88k, Leviathan ≈ 170k cùng kịch bản
  mo: (T) => {
    const B = T && G.ban && G.ban[T.ban], a = (B && B.cb) || [0, 0, 0], p = (k) => Math.round(CB.gt(B || { cb: a }, k) * 100), h = CB.he(B);
    return 'Spins a fruit slot when it appears or gains a star. Orange = damage, Watermelon = speed, Grape = crit damage. Adds its stars to that fruit\'s stack for ALL Lucky Slots. 10% JACKPOT: all three get 2× stars!'
      + ' · Per stack: +' + +(CB.DMG * h * 100).toFixed(1) + '% damage, +' + +(CB.TOC * h * 100).toFixed(1) + '% speed (less as it grows, max +150%), +' + +(CB.CDMG * h * 100).toFixed(1) + '% crit damage'
      + ' · Now: Orange ' + a[0] + ' (+' + p('dmg') + '%), Watermelon ' + a[1] + ' (+' + p('toc') + '%), Grape ' + a[2] + ' (+' + p('cdmg') + '%)';
  },
  sinh(G, T) { T.cbS = 0; T.cbQuay = 0; },
  capNhat(G, B, T, dt) {
    const conRoi = B.net && typeof ONS !== 'undefined' && ONS.on; // bàn con rối: chờ gói 'cb' của máy bạn
    if (!conRoi && T.sao > (T.cbS | 0)) CB.quay(B, T);
    if (T.cbQuay > 0) { T.cbQuay = Math.max(0, T.cbQuay - dt); xoayDau(T, quaiDau(B), dt); return true; } // đang quay: không bắn
    return false;
  },
  ban(G, B, T, E) {
    const anh = typeof REN !== 'undefined' && REN.img && REN.img('cb_xu') ? 'cb_xu' : 'tia_lua';
    banNhe(B, T, E, { img: anh, co: 17, mau: '#ffd23f', sp: 520 });
  },
};

// đăng ký: họ JOKER (Đỏ), 3 giai đoạn lớn lên (vòng sáng quanh đầu, không ảnh riêng), nhịp hiển thị
if (typeof themHo === 'function') themHo('joker', 4, 'cobac', 'fruit slot spins: shared Orange/Watermelon/Grape stacks + 10% JACKPOT');
if (typeof GROW !== 'undefined') GROW.cobac = { mau: '#ffb43a', khongAnh: true, ten: ['SLOT', 'HIGH ROLLER', 'GRAND CASINO'], dk: '1–3★ / 4–6★ / 7★ · every star gained = one more spin',
  gd: (T) => ({ s: T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1, p: (T.sao - 1) / 6, v: [0.5] }) };
if (typeof NHIP !== 'undefined') NHIP.cobac = () => '1 coin/s · spins 1s';

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
// HÌNH (chỉ trình bày): cuộn máy xèng trên ô → dừng ở quả trúng → nảy + chớp; JACKPOT: 3 quả bay toé + dải nổ fx_cb_no (8 khung)
// =====================================================================================================
HU.cbQuay = {
  cap(G, o) {
    if (!o.da && o.t >= CB.QUAY) {
      o.da = true; const B = o.B, c = B && B.o[o.o];
      if (B) B.cbV = (B.cb || o.v).slice(); // số trên khay nhảy lúc cuộn dừng
      if (c && typeof FX !== 'undefined') {
        if (o.f === 3) { FX.vong1(c.x, c.y, 10, 70, '#ffd23f', 0.4, 5); if ((!B.ai || G.che === 'pvp') && typeof SND !== 'undefined') { if (SND.jackpot) SND.jackpot(); else if (SND.thucTinh) SND.thucTinh(); } }
        else { FX.vong1(c.x, c.y, 8, 40, CB.MAU[o.f], 0.3, 3); if ((!B.ai || G.che === 'pvp') && typeof SND !== 'undefined' && SND.ghep) SND.ghep(Math.min(7, o.s + 1), B.ai); }
      }
    }
    return o.t >= o.song || !o.B;
  },
  ve(ctx, o, R) {
    const B = o.B, c = B && B.o[o.o]; if (!c || !R) return;
    const C = Math.min(B.cw, B.ch), x = c.x, y = c.y - C * 0.05;
    const tq = Math.min(1, o.t / CB.QUAY), sau = Math.max(0, o.t - CB.QUAY);
    const hien = o.t < 0.08 ? o.t / 0.08 : sau > 0 ? Math.max(0, 1 - Math.max(0, sau - (o.f === 3 ? 0.7 : 0.3)) / 0.25) : 1;
    if (hien <= 0) return;
    ctx.save(); ctx.globalAlpha = hien;
    // khung cửa sổ máy xèng (PNG cb_khung 256×181, ô kính tối x 19–80 %, y 31–79 %) — chưa tải → tấm tối viền vàng
    const kh = R.img && R.img('cb_khung'), F = C * 1.05, Fh = F * 181 / 256, fx0 = x - F / 2, fy0 = y - Fh / 2;
    const ix = fx0 + F * 0.19, iy = fy0 + Fh * 0.31, iw = F * 0.61, ih = Fh * 0.48;
    if (kh) ctx.drawImage(kh, fx0, fy0, F, Fh);
    else { ctx.fillStyle = 'rgba(60,4,12,0.92)'; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = Math.max(1, C * 0.04); ctx.beginPath(); ctx.rect(ix - 3, iy - 3, iw + 6, ih + 6); ctx.fill(); ctx.stroke(); } // vetay-ok: dự phòng khi chưa tải PNG
    // cuộn: quả trượt dọc trong ô kính, chậm dần (ease-out bậc 3), dừng đúng quả trúng (jackpot: dừng ở cam rồi bung cả 3)
    const kq = o.f === 3 ? 0 : o.f, e = 1 - Math.pow(1 - tq, 3), pos = (9 + kq) * e, qh = ih * 1.05, cy = iy + ih / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
    for (let k = -1; k <= 1; k++) {
      const i = Math.floor(pos) + k, d = (pos - Math.floor(pos)) - k, qi = ((i % 3) + 3) % 3, yy = cy + d * qh;
      ctx.globalAlpha = hien * (tq < 1 ? 1 : (k === 0 ? 1 : 0.3));
      if (R.img && R.img(CB.IC[qi])) R.anhGiua(ctx, CB.IC[qi], x, yy, ih * 0.95); else { ctx.fillStyle = CB.MAU[qi]; ctx.beginPath(); ctx.arc(x, yy, ih * 0.36, 0, 6.283); ctx.fill(); } // vetay-ok: dự phòng
    }
    ctx.restore(); ctx.globalAlpha = hien;
    // dừng: nảy + quầng màu quả
    if (sau > 0 && o.f !== 3) {
      const p = Math.min(1, sau / 0.3); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = hien * (1 - p) * 0.9;
      R.anhGiua(ctx, R.cham1(CB.MAU[o.f]), x, y, C * (0.9 + 0.6 * p)); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore(); ctx.globalAlpha = 1;
    // JACKPOT: dải nổ + 3 quả toé ra 3 hướng
    if (o.f === 3 && sau > 0) {
      const p = Math.min(1, sau / 0.9);
      const no = R.img && R.img('fx_cb_no');
      if (no && no.width) { const n = 8, fw = no.width / n, f = Math.min(n - 1, Math.floor(p * n)), s = C * (1.5 + 0.8 * p); ctx.save(); ctx.globalAlpha = p < 0.75 ? 1 : (1 - p) / 0.25; ctx.drawImage(no, f * fw, 0, fw, no.height, x - s / 2, y - s / 2, s, s); ctx.restore(); } // dải đã tách alpha theo độ sáng (thap-cat-co-bac.py)
      else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - p); R.anhGiua(ctx, R.cham1('#ffd23f'), x, y, C * (1 + 1.6 * p)); ctx.restore(); }
      if (R.img && R.img('cb_no_ic')) { const k = p < 0.15 ? p / 0.15 : 1, sz = C * (0.7 + 0.25 * k) * (p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1); if (sz > 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(p * 0.6); ctx.globalAlpha = Math.min(1, k); R.anhGiua(ctx, 'cb_no_ic', 0, 0, sz); ctx.restore(); } } // huy hiệu nổ JACKPOT
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i - 1) * 1.1, r = C * (0.15 + 0.75 * Math.sqrt(p)), qx = x + Math.cos(a) * r, qy = y + Math.sin(a) * r - C * 0.2 * Math.sin(p * Math.PI);
        ctx.save(); ctx.globalAlpha = p < 0.7 ? 1 : (1 - p) / 0.3;
        if (R.img && R.img(CB.IC[i])) R.anhGiua(ctx, CB.IC[i], qx, qy, C * 0.5 * (1 + 0.3 * Math.sin(p * Math.PI))); else { ctx.fillStyle = CB.MAU[i]; ctx.beginPath(); ctx.arc(qx, qy, C * 0.16, 0, 6.283); ctx.fill(); } // vetay-ok: dự phòng
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  },
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
    const v = CB.hienSo(B), q = s.children;
    for (let i = 0; i < 3; i++) if (s._v[i] !== v[i]) {
      const b = q[i].lastChild, tang = s._v[i] >= 0 && v[i] > s._v[i];
      b.textContent = v[i]; b.style.color = CB.mauSo(v[i]); s._v[i] = v[i];
      if (tang) { q[i].classList.remove('cb-nhay'); void q[i].offsetWidth; q[i].classList.add('cb-nhay'); }
    }
  };
  document.querySelectorAll('#bo-the .the[data-id="cobac"]').forEach(d => gan(d, G.ban[0]));
  const D = G.ban[1], dp = document.getElementById('dp-dai');
  if (D && dp && !dp.hidden) dp.querySelectorAll('.dp-the[data-id="cobac"]').forEach(d => gan(d, D));
};
if (typeof addEventListener === 'function') addEventListener('DOMContentLoaded', () => {
  if (typeof UI !== 'undefined' && UI.capNhat) { const g = UI.capNhat; UI.capNhat = function () { const r = g.apply(this, arguments); try { CB.khay(); } catch (e) { console.error('CB.khay', e); } return r; }; }
  if (typeof REN !== 'undefined' && REN.img) for (const t of CB.IC.concat(['cb_khung', 'fx_cb_no', 'cb_xu', 'cb_no_ic'])) { if (REN.CO_DINH) REN.CO_DINH.add(t); try { REN.img(t); } catch (e) { } }
});
window.CB = CB;
