// TURRET MERGE — Ụ ĐỎ "ARCANE CASCADE" / Thác Mana (thacmana, ĐỎ, Tấn công, họ MANA bậc 5) — 09/11 người dùng:
//   "tướng đỏ bắn lan, mạnh theo LƯỢNG MANA ĐANG CÓ: mana càng nhiều sát thương càng cao; qua các NGƯỠNG mana thì lan được nhiều quái hơn"
//   (giữ mana dư late game chính là để ụ này có ý nghĩa). KHÁC Pháo Năng Lượng (nangluong, Xanh, đơn mục tiêu, trần +500%) — giữ nguyên ụ đó.
//   · BẮN: quả cầu mana vào quái ĐẦU rồi NẢY sang quái gần nhất (≤ NAY px từ quái trước, thứ tự tất định theo khoảng cách rồi uid).
//       Số quái trúng theo NGƯỠNG mana đang có (bảng LAN): <100: 1 · 100: 2 · 300: 3 · 600: 4 · 1000: 5 · 2000: 6 · 4000: 8 · rồi +1 mỗi lần gấp đôi (8000: 9, 16000: 10…) — không trần.
//       Mỗi lần nảy −10% (×0.9^i, sàn 50%).
//   · SÁT THƯƠNG × k(M) = 1 + 0.5 × √(M / 100) (M = mana đang có): 100 → ×1.5 · 400 → ×2 · 1000 → ×2.58 · 2500 → ×3.5 · 4000 → ×4.16 · 10000 → ×6.
//       Căn bậc 2: không bùng vô hạn nhưng KHÔNG trần cứng. Nhân riêng ngoài dmgU (dmgU đã gồm hệ số bậc Đỏ, sao, power-up, heHauKy, Rage…).
//       Không có sát thương tràn (overflow): mỗi đòn chỉ trúng quái của nó.
//   · CHỦ ĐỘNG "MANA FLOOD" (3★+, hồi 30 s, CHẠM): XẢ 20% mana đang có (tối thiểu 50 — thiếu thì không dùng). 4 s: mỗi 0.5 s một làn thác
//       đánh MỌI quái trên đường của bàn × 0.8 × k(mana còn lại + mana đã xả) (xả không làm yếu cú thác) + tốc bắn thường +50%.
//       Chỉ xả 20% → sau chiêu k giảm ~10% (√0.8 ≈ 0.89), số lan tụt tối đa 1 ngưỡng: không phá cơ chế bị động.
//       Để đầy: chỉ tự xả khi có TRÙM (tiêu mana là quyết định của người chơi); AI xả khi có trùm hoặc ≥ 6 quái và ≥ 300 mana.
//   Tất định: không RNG trong luật (Math.random chỉ ở trung() chí mạng chung của game). Hình (HU.thacLan) không đổi luật.
//   Online: thời gian thác còn + mana đã xả đi theo cờ ô 'U'/'V' (dongbo.js); chiêu = gói 'cd' (traMana bỏ qua trừ mana ở bàn con rối).
//   Nạp SAU skills5.js (napChuDong), skills3.js (traMana, themHo), phattrien.js (MOC_RIENG, GROW, NHIP).
'use strict';

SKILLS.thacmana = {
  vai: 'tc', dmg: 20, toc: 1.0, nham: 'dau', napMau: '#9a7bff', // 09/11 đo bot: 15 → 13 sau đợt tăng trưởng sao mới · 09/11 lần 2 (Đỏ hơn Vàng rõ rệt): 13 → 20 — ụ Đỏ yếu nhất (≈0.6× Vàng tốt nhất ở 3–5★, docs/demo-hop-tuong/tocban/DO-VANG-DO.md)
  cd: 30, NAY: 125, GIAM: 0.9, SAN: 0.5, K: 0.5,
  XA: 0.2, XA_MIN: 50, THAC_T: 4, THAC_NHIP: 0.5, THAC_K: 0.8, THAC_TOC: 0.5,
  LAN: [[0, 1], [100, 2], [300, 3], [600, 4], [1000, 5], [2000, 6], [4000, 8]], // [ngưỡng mana, số quái trúng]
  // ---- thuần (test) ----
  k(M) { return 1 + this.K * Math.sqrt(Math.max(0, M || 0) / 100); },
  lan(M) {
    M = Math.max(0, M || 0); let n = 1;
    for (const [m, s] of this.LAN) if (M >= m) n = s;
    if (M >= 8000) n = 8 + Math.floor(Math.log2(M / 4000)); // 8000: 9 · 16000: 10 · … không trần
    return n;
  },
  nguongKe(M) { M = Math.max(0, M || 0); for (const [m] of this.LAN) if (M < m) return m; let m = 8000; while (M >= m) m *= 2; return m; },
  giaXa(M) { return Math.max(this.XA_MIN, Math.round(this.XA * Math.max(0, M || 0))); },
  mana: (B) => Math.max(0, (B && B.mana) || 0),
  mo(T) {
    const B = G.ban[T.ban], M = this.mana(B), n = this.lan(M);
    return 'Mana ' + Math.floor(M) + ' → ×' + this.k(M).toFixed(2) + ' damage, hits ' + n + (n > 1 ? ' enemies' : ' enemy') + ' (next at ' + this.nguongKe(M) + ' mana)' +
      ' · mana orb bounces to the nearest enemy (' + this.NAY + ' px, −10% per bounce) · damage × (1 + 0.5 × √(mana/100)), no cap · bounces at 100/300/600/1000/2000/4000 mana: 2/3/4/5/6/8, +1 per doubling after' +
      (T.thacT > 0 ? ' · MANA FLOOD ' + Math.ceil(T.thacT) + 's' : '') +
      (T.sao >= 3 ? ' · TAP when full (cooldown 30s): MANA FLOOD — spends 20% of your mana (min 50): 4s of cascades hitting EVERY enemy on the path every 0.5s (80% × the multiplier, counting the spent mana) + 50% fire rate' : ' · MANA FLOOD unlocks at 3★');
  },
  sinh(G, T) { T.thacT = 0; T.thacS = 0; T.thacP = 0; },
  capNhat(G, B, T, dt) {
    napChuDong(G, B, T, dt, this.cd, this);
    if (T.thacT > 0) {
      T.buf.toc += this.THAC_TOC;
      T.thacT = Math.max(0, T.thacT - dt); T.thacP = (T.thacP || 0) - dt;
      if (T.thacP <= 0) { T.thacP += this.THAC_NHIP; this.thac(G, B, T); }
      if (T.thacT <= 0) { T.thacS = 0; T.thacP = 0; }
    }
    return false; // bắn thường do game.js capNhatU (nham 'dau' → ban)
  },
  // chuỗi nảy tất định: quái gần quái trước nhất (≤ NAY px), hoà → uid nhỏ
  chuoi(B, E, n) {
    const ds = dsMucTieu(B), c = [E], da = new Set(c);
    while (c.length < n) {
      const cu = c[c.length - 1]; let m = null, best = this.NAY;
      for (const Q of ds) {
        if (Q.chet || da.has(Q)) continue;
        const d = Math.hypot(Q.x - cu.x, Q.y - cu.y);
        if (d < best - 1e-6 || (m && Math.abs(d - best) <= 1e-6 && (Q.uid || 0) < (m.uid || 0))) { best = d; m = Q; }
      }
      if (!m) break; c.push(m); da.add(m);
    }
    return c;
  },
  ban(G, B, T, E) {
    const M = this.mana(B), n = this.lan(M), D = dmgU(T) * this.k(M);
    giat(T, 0.5 + Math.min(0.6, n * 0.06)); const [x, y] = dauNong(T); if (!B.ai || G.che === 'pvp') SND.set();
    const c = this.chuoi(B, E, n);
    c.forEach((Q, i) => trung(Q, D * Math.max(this.SAN, Math.pow(this.GIAM, i)), { B, mau: '#cdb4ff', im: i > 2 }));
    FX.no('dien', E.x, E.y, 34 + Math.min(30, n * 3), 0.25);
    G.hu.push({ k: 'thacLan', t: 0, song: 0.3, x, y, T, seed: (T.banLan || 0) * 13, ds: c.map(Q => ({ Q, x: Q.x, y: Q.y })) });
  },
  // một làn thác MANA FLOOD: mọi quái trên đường của bàn, nối theo thứ tự đường đi (đầu → cuối)
  thac(G, B, T) {
    const ds = dsMucTieu(B).filter(Q => !Q.chet).sort((p, q) => (G.duong[p.p].len - p.s) - (G.duong[q.p].len - q.s) || (p.uid || 0) - (q.uid || 0));
    if (!ds.length) return;
    const D = dmgU(T) * this.k(this.mana(B) + (T.thacS || 0)) * this.THAC_K;
    ds.forEach((Q, i) => trung(Q, D, { B, mau: '#b48cff', im: i > 3 }));
    const [x, y] = dauNong(T); giat(T, 0.8); T.sang = 1;
    G.hu.push({ k: 'thacLan', t: 0, song: 0.42, x, y, T, seed: Math.round(T.thacT * 100), lon: 1, ds: ds.slice(0, 24).map(Q => ({ Q, x: Q.x, y: Q.y })) });
  },
  aiNen(G, B, T) {
    if (G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E))) return true;
    if (!B.ai) return false; // người chơi để đầy: chỉ tự xả khi có TRÙM
    return this.mana(B) >= 300 && dsMucTieu(B).filter(E => !E.chet).length >= 6;
  },
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3 || T.thacT > 0) return false;
    const S = this.giaXa(this.mana(B));
    if (!(typeof ONS !== 'undefined' && ONS._cd) && this.mana(B) < this.XA_MIN) { if (!B.ai) nhanU(T, 'Need ' + this.XA_MIN + ' mana', '#7fd8ff'); return false; }
    if (!traMana(B, T, S)) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2.2);
    T.thacT = this.THAC_T; T.thacS = S; T.thacP = 0; // làn đầu ngay khung sau
    nhanU(T, 'MANA FLOOD −' + S, '#b48cff', true); FX.lac(2);
    return true;
  },
  sangDau(T) { const B = G.ban[T.ban]; return Math.min(0.18, Math.sqrt(this.mana(B) / 100) * 0.03) + (T.thacT > 0 ? 0.15 : 0); },
};

// hình chuỗi nảy: dải sét PNG (tia_set) tô tím mana, gấp khúc theo hạt giống của phát (chỉ hình), nút sáng ở mỗi quái
HU.thacLan = {
  cap(G, o) { for (const d of o.ds) if (!d.Q.chet) { d.x = d.Q.x; d.y = d.Q.y; } },
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / o.song), nhip = Math.floor(R.t / 0.05);
    const im = typeof PX !== 'undefined' && PX.mau('tia_set', o.lon ? '#9f7bff' : '#b48cff');
    ctx.globalCompositeOperation = 'lighter'; const al = Math.min(1, u / 0.08 + 0.35) * (1 - u * u); ctx.globalAlpha = al;
    let x0 = o.x, y0 = o.y;
    if (o.T && G.ban[o.T.ban] && G.ban[o.T.ban].t[o.T.o] === o.T) [x0, y0] = typeof AN !== 'undefined' ? AN.muzzle(o.T) : dauNong(o.T);
    const n = o.ds.length, buoc = Math.min(0.045, (o.lon ? 0.3 : 0.16) / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const d = o.ds[i], v = (o.t - i * buoc) / buoc; if (v <= 0.02) break;
      const k = v >= 1 ? 1 : 1 - (1 - v) * (1 - v), x1 = x0 + (d.x - x0) * k, y1 = y0 + (d.y - y0) * k;
      const L = Math.hypot(x1 - x0, y1 - y0);
      if (im && L > 1) {
        const m = Math.max(2, Math.round(L / 22)), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
        let r = (o.seed + nhip * 7 + i) * 9301 + 49297; const rn = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 - 0.5; };
        let px = x0, py = y0;
        for (let j = 1; j <= m; j++) {
          const t = j / m, jj = j < m ? rn() * Math.min(20, L * 0.16) : 0, qx = x0 + (x1 - x0) * t + nx * jj, qy = y0 + (y1 - y0) * t + ny * jj;
          R.tia(ctx, im, px, py, qx, qy, (o.lon ? 22 : 24) - Math.min(10, i * 1.5), 0, true); px = qx; py = qy;
        }
      }
      if (k >= 1) { ctx.globalAlpha = al * 0.9; R.anhGiua(ctx, R.cham1('#a27bff'), d.x, d.y, o.lon ? 30 : 26); R.anhGiua(ctx, R.cham1('#e6dcff'), d.x, d.y, 10); ctx.globalAlpha = al; }
      x0 = d.x; y0 = d.y;
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
};

if (typeof themHo === 'function') themHo('mana', 4, 'thacmana', 'banked mana → bouncing orbs: more mana = more damage and more bounces + MANA FLOOD (active)');
if (typeof MOC_RIENG !== 'undefined') MOC_RIENG.thacmana = { 3: ['MANA FLOOD', 'Unlocks the active skill (tap when full, spends 20% mana): 4s of cascades over the whole path'] };
if (typeof NHIP !== 'undefined') NHIP.thacmana = (T) => '1 orb/s · ' + SKILLS.thacmana.lan(SKILLS.thacmana.mana(G.ban && G.ban[(T && T.ban) | 0])) + ' bounce targets';
