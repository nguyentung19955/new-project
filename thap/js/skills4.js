// TURRET MERGE — ỤNG MỚI ĐỢT 2 (TUONG-MOI-20.md §5.3 "Đợt 2"): Nemesis · Lone Ace · Focus Lens · Signal Jammer · Bounty Beacon ·
// Eclipse · Scrap Forge · Mirror Gate · Marionette. Nạp sau skills3.js.
'use strict';

const giaiDoanSao = (T) => (T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1);
const ttSao = (mau, ten, dk) => ({ mau, khongAnh: true, ten, dk, gd: (T) => ({ s: giaiDoanSao(T), p: (T.sao - 1) / 6, v: [0.5] }) });

// =====================================================================================================
// G3 · NEMESIS — Vàng TC: bắn quái nhiều máu nhất, mỗi phát +p% máu tối đa (trùm: tối đa 0.8%); quái thường (không to/trùm)
//      còn dưới x% → XỬ TỬ. Trùm: mỗi 10 phát trúng → PHÁN QUYẾT j% máu tối đa (≥2 s/lần). 7★: xử tử → lưỡi hái nhảy sang quái gần nhất.
// =====================================================================================================
SKILLS.nemesis = {
  vai: 'tc', dmg: 26, toc: 0.8, nham: 'mau',
  p: (T) => sao7(T, [0.003, 0.004, 0.005, 0.006, 0.008, 0.01, 0.012]),
  x: (T) => sao7(T, [0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.15]),
  j: (T) => sao7(T, [0.02, 0.025, 0.03, 0.035, 0.04, 0.05, 0.06]),
  mo: (T) => '+' + (SKILLS.nemesis.p(T) * 100).toFixed(1) + '% max HP per hit · executes normal enemies under ' + Math.round(SKILLS.nemesis.x(T) * 100) + '% · bosses: JUDGMENT ' + (SKILLS.nemesis.j(T) * 100).toFixed(1) + '% max HP every 10 hits' + (T.sao >= 7 ? ' · executions leap once' : ''),
  ban(G, B, T, E) {
    giat(T, 1.1); const [x, y] = chopNong(T, 28); SND.tia();
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.22, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#d01e3a' });
    this.danh(G, B, T, E, true);
  },
  danh(G, B, T, E, nhay) {
    const phan = Math.min(E.trum ? 0.008 : 1, this.p(T)) * E.max;
    trung(E, dmgU(T) + phan, { B, mau: '#c8d4e6' });
    if (E.chet) return;
    if (E.trum) {
      T.demTrum = (T.demTrum || 0) + 1;
      if (T.demTrum >= 10 && G.t - (E.phanT || -9) >= 2) { T.demTrum = 0; E.phanT = G.t; trung(E, E.max * this.j(T), { B, mau: '#ff3a5a', crit: false, phu: true }); G.hu.push({ k: 'chem', t: 0, song: 0.4, x: E.x, y: E.y }); FX.lac(4); nhanU(T, 'JUDGMENT!', '#ff3a5a', true); SND.no(0.8); }
    } else if (!E.d.to && E.hp / E.max < this.x(T)) {
      G.hu.push({ k: 'chem', t: 0, song: 0.4, x: E.x, y: E.y }); trung(E, E.hp + 1, { B, crit: false, phu: true, mau: '#ff3a5a' });
      FX.chu1(E.x, E.y - 26, 'JUDGED', '#ff3a5a', 12, 'to'); VX.chem(E); SND.no(0.3);
      if (nhay && T.sao >= 7) { let Q = null, best = 110; for (const X of dsMucTieu(B)) if (!X.chet && X !== E) { const d = Math.hypot(X.x - E.x, X.y - E.y); if (d < best) { best = d; Q = X; } }
        if (Q) { G.hu.push({ k: 'tiaTia', t: 0, song: 0.25, x0: E.x, y0: E.y, x1: Q.x, y1: Q.y, mau: '#ff3a5a' }); this.danh(G, B, T, Q, false); } }
    }
  },
};

// =====================================================================================================
// P4 · LONE ACE (docton) — Tím TC: 4 ô kề TRỐNG → ACE: tốc ×2, +a% chí mạng (7★: đạn xuyên 1 quái); ≥3 ụ kề → −30% tốc
// =====================================================================================================
SKILLS.docton = {
  vai: 'tc', dmg: 14, toc: 1, nham: 'dau',
  a: (T) => sao7(T, [0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.25]),
  ke: (B, T) => keCan(B, T.o).filter(Boolean).length,
  mo(T) { const n = this.ke(G.ban[T.ban], T); return (n === 0 ? 'ACE: +100% fire rate, +' + Math.round(this.a(T) * 100) + '% crit' + (T.sao >= 7 ? ', pierces 1' : '') : n >= 3 ? 'CROWDED (' + n + ' neighbours): −30% fire rate' : n + ' neighbour(s): normal') + ' · keep its 4 N/E/S/W cells EMPTY'; },
  capNhat(G, B, T) {
    const n = this.ke(B, T), ace = n === 0;
    if (ace) { T.buf.toc += 1; T.buf.crit += this.a(T); } else if (n >= 3) T.buf.toc -= 0.3;
    if (ace && !T.ace) { buffNo(T, 'max', 0.6); if (!B.ai) SND.thucTinh(); }
    T.ace = ace; return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.8); const [x, y] = chopNong(T, 24); SND.tia();
    const dmg = dmgU(T);
    trung(E, dmg, { B, mau: '#ff9aa0' });
    let x1 = E.x, y1 = E.y;
    if (T.ace && T.sao >= 7) { const g = Math.atan2(E.y - y, E.x - x), ds = quaiTrenDoan(B, E.x, E.y, E.x + Math.cos(g) * 80, E.y + Math.sin(g) * 80, 10).filter(Q => Q !== E); if (ds[0]) { trung(ds[0], dmg, { B, mau: '#ff9aa0' }); x1 = ds[0].x; y1 = ds[0].y; } }
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.16, x0: x, y0: y, x1, y1, mau: '#ff3a4a' });
  },
  sangDau: (T) => (T.ace ? 0.12 : 0),
  veThem(ctx, T, S, al, R) { if (!T.ace || MOT_VONG) return; ctx.globalCompositeOperation = 'lighter'; PX.vong(ctx, 0, 0, S * 0.44, 1.4, '#ff3a4a', al * (0.55 + 0.2 * Math.sin(R.t * 5))); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; },
};

// =====================================================================================================
// P5 · FOCUS LENS (thaukinh) — Tím HT: 4 ô kề +k% sát thương chí mạng; chí mạng của ụ kề XUYÊN thêm 1 quái phía sau (60%); 5★+: 2 quái
// =====================================================================================================
SKILLS.thaukinh = { // Thấu Kính — HỖ TRỢ: 4 ô kề +sát thương chí mạng; chí mạng của ụ kề XUYÊN 1 quái phía sau (5★: 2; 7★: xuyên 100%)
  vai: 'ht', dmg: 0, toc: 0,
  k: (T) => 0.30 * HOTRO.k(T), // 0.14 → 0.30 (đo bậc 06/11)
  mo: (T) => 'Neighbours: +' + Math.round(HOTRO.hd(T, 'cdmg', SKILLS.thaukinh.k(T)) * 100) + '% crit damage · their crits pierce ' + (ms(T, 5) ? 2 : 1) + ' enemy behind (' + (ms(T, 7) ? 65 : 50) + '%)',
  hoTro(G, T, N, ra) { ra.cdmg = this.k(T); ra.xuyen = ms(T, 5) ? 2 : 1; if (ms(T, 7)) ra.xuyen100 = 1; },
  capNhat(G, B, T, dt) { HOTRO.nhip(G, B, T, dt, '111,208,255', 2.6, 0.4); return true; },
};
function xuyenCrit(E, dmg, T, o) { // chí mạng xuyên: quái phía sau gần nhất (đã đi ít hơn) trong 60 px
  const B = o.B || G.ban[T.ban]; if (!B) return;
  const ds = dsMucTieu(B).filter(Q => Q !== E && !Q.chet && Q.p === E.p && Q.s < E.s && Math.hypot(Q.x - E.x, Q.y - E.y) < 60).sort((a, b) => b.s - a.s).slice(0, T.buf.xuyen);
  let x0 = E.x, y0 = E.y;
  for (const Q of ds) { trung(Q, dmg * (T.ht && T.ht.xuyen100 ? 0.65 : 0.5), { B, T, phu: true, crit: false, mau: '#6fd0ff' }); G.hu.push({ k: 'tiaTia', t: 0, song: 0.18, x0, y0, x1: Q.x, y1: Q.y, mau: '#6fd0ff' }); x0 = Q.x; y0 = Q.y; }
}

// =====================================================================================================
// P6 · SIGNAL JAMMER (nhieusong) — Tím ĐB, khi GHÉP: PVP báo trước 0.65 s rồi NHIỄU n ụ đối thủ (−40% tốc t s) + lần triệu hồi kế của đối thủ +m mana
//      (miễn nhiễm 8 s; bỏ qua ụ đang dính hiệu ứng xấu) · Co-op: lần triệu hồi kế của đồng đội MIỄN PHÍ + đồng đội +10% tốc t s · Solo: quái chậm 20% t s
// =====================================================================================================
SKILLS.nhieusong = {
  vai: 'db', dmg: 18, toc: 1, nham: 'dau', // 11 → 18 (đo bậc 06/11)
  n: (T) => sao7(T, [1, 1, 2, 2, 3, 3, 4]), t: (T) => sao7(T, [3, 3.5, 4, 4.5, 5, 5.5, 6]), m: (T) => sao7(T, [5, 5, 10, 10, 15, 15, 20]),
  mo: (T) => { const s = SKILLS.nhieusong, S = { sao: Math.min(7, T.sao + 1) }; return 'On merge (as ' + S.sao + '★): PVP jams ' + s.n(S) + ' rival turrets −40% for ' + s.t(S) + 's + their next summon +' + s.m(S) + ' mana · CO-OP ally next summon FREE + 10% speed ' + s.t(S) + 's · SOLO slows all 20% for ' + s.t(S) + 's'; }, // QA Tím: số hiện = số thật khi ghép (sao kết quả)
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 14, mau: '#8a7bff', sp: 540 }); },
  ghep(G, B, a, b, ra) {
    const S = { sao: Math.min(7, a.sao + 1) }, n = this.n(S), t = this.t(S), m = this.m(S), c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const ds = D.t.filter(X => X && SKILLS[X.id].dmg && !(X.mienNhieu > G.t) && !(X.st.kep > 0) && !X.st.bang && !X.st.da && !(X.st.lua > 0)).sort(() => Math.random() - 0.5).slice(0, n);
      for (const X of ds) { X.st.ngam = Math.max(X.st.ngam, 0.65); const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#8a7bff'); }
      G.hu.push({ k: 'nhieu', t: 0, song: 0.65, D, ds, tg: t, B });
      D.gia += m; D.giaTru = (D.giaTru || 0) + m;
      nhanU(ra, 'JAM ×' + ds.length, '#8a7bff', true); SND.set();
    } else if (G.che === 'coop') {
      const D = banKhac(B); if (!D) return;
      D.mienPhi = (D.mienPhi || 0) + 1;
      for (const X of D.t) if (X && SKILLS[X.id].dmg) { X.tocT = Math.max(X.tocT, t); X.tocV = Math.max(X.tocV, 0.1); }
      const c = { x: D.x + D.w / 2, y: D.y + D.h / 2 }; tiaPhep(c0.x, c0.y, c.x, c.y, '#8a7bff');
      nhanU(ra, 'ALLY: FREE SUMMON', '#8a7bff', true);
    } else {
      for (const E of dsMucTieu(B)) if (!E.d.khangCham) { E.cham = Math.max(E.cham, 0.2); E.chamT = Math.max(E.chamT, t); }
      FX.sang(0.12, '#8a7bff'); nhanU(ra, 'STATIC FIELD', '#8a7bff', true);
    }
  },
};
HU.nhieu = { // báo trước 0.65 s (tâm ngắm) → nhiễu: dùng trạng thái kep (−40% tốc, vòng xích) + chữ JAMMED
  cap(G, o) {
    if (o.t < o.song - 0.02 || o.da) return false;
    o.da = true;
    for (const X of o.ds) {
      if (o.D.t[X.o] !== X) continue;
      if (chanKhien(o.D, X)) continue;
      X.st.kep = Math.max(X.st.kep, o.tg); X.mienNhieu = G.t + o.tg + 8;
      const c = o.D.o[X.o]; FX.chu1(c.x, c.y - 20, 'JAMMED', '#8a7bff', 12, 'to');
    }
    return true;
  },
};
// giá triệu hồi: +m của Signal Jammer chỉ áp cho 1 lần triệu hồi; Co-op: lần kế miễn phí
const _trieuGoc = trieu;
trieu = function (B, mienPhi, idEp) {
  if (!mienPhi && B.mienPhi > 0 && oTrong(B).length) { B.mienPhi--; const T = _trieuGoc(B, true, idEp); if (T) { const c = B.o[T.o]; FX.chu1(c.x, c.y - 22, 'FREE', '#8a7bff', 13, 'to'); } return T; }
  const T = _trieuGoc(B, mienPhi, idEp);
  if (T && !mienPhi && B.giaTru) { B.gia = Math.max(LUAT.giaTrieu, B.gia - B.giaTru); B.giaTru = 0; }
  return T;
};

// =====================================================================================================
// P7 · BOUNTY BEACON (santhuong) — Tím ĐB: mỗi 5 s gắn TRUY NÃ lên n quái (ưu tiên quái to/nhiều máu); quái truy nã nhận +10% sát thương,
//      chết (do bất kỳ ụ nào) → +g mana (trùm ×5). Co-op: mana thưởng chia đôi cho 2 bàn. PVP: chỉ làn mình.
// =====================================================================================================
SKILLS.santhuong = {
  vai: 'db', dmg: 10, toc: 1, nham: 'dau', napMau: '#f0b030',
  n: (T) => sao7(T, [1, 1, 2, 2, 2, 3, 3]), g: (T) => sao7(T, [4, 5, 5, 6, 7, 7, 8]), // +2 mana (đo bậc 06/11)
  mo: (T) => 'Every ' + (5 / (T.buf ? nhipU(T) : (T.sao >= 3 ? 1.2 : 1))).toFixed(1) + 's marks ' + SKILLS.santhuong.n(T) + ' enemies (big first): +15% damage taken, +' + SKILLS.santhuong.g(T) + ' mana when killed (boss ×5)',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / 5);
    if (T.nap >= 1) {
      const ds = dsMucTieu(B).filter(E => !E.chet && !E.truyNa).sort((a, b) => (b.d.to ? 1e9 : 0) + b.hp - (a.d.to ? 1e9 : 0) - a.hp).slice(0, this.n(T));
      if (ds.length) {
        T.nap = 0; const [x, y] = dauNong(T);
        for (const E of ds) { E.truyNa = { B, g: this.g(T) }; tiaPhep(x, y, E.x, E.y, '#f0b030'); }
        nhanU(T, 'WANTED ×' + ds.length, '#f0b030');
      }
    }
    return false;
  },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 13, mau: '#ffd27a', sp: 520 }); },
};
const _trungNa = trung;
trung = function (E, dmg, o) { return _trungNa(E, dmg, o); }; // +10% của truy nã: tính trong HOTRO.vuln (chung trần suy yếu 25%) — QA Tím
const _chetGoc = chet;
chet = function (E, B) {
  if (E.chet) return;
  const pB = B || G.ban[G.duong[E.p].ban] || G.ban[0];
  const mana0 = pB.mana, nay0 = pB.manaNay;
  _chetGoc(E, B);
  if (E.khongMana) { pB.mana = mana0; pB.manaNay = nay0; } // Marionette: rối chết không cho mana
  if (E.truyNa) {
    const g = E.truyNa.g * (E.trum ? 5 : 1), D = G.che === 'coop' ? banKhac(E.truyNa.B) : null;
    if (D) { const h = Math.ceil(g / 2); E.truyNa.B.mana += h; D.mana += h; } else { E.truyNa.B.mana += g; E.truyNa.B.manaNay += g; }
    FX.chu1(E.x, E.y - 30, '+' + g + ' BOUNTY', '#f0b030', 13, 'mana'); if (!E.truyNa.B.ai) SND.mana();
  }
};
HU.truyNaVe = { // ký hiệu "$" lục giác trên đầu mọi quái truy nã (1 lớp vẽ chung, tự tạo)
  cap: () => false,
  ve(ctx, o, R) {
    for (const E of G.quai) {
      if (E.chet || !E.truyNa) continue;
      const x = E.x, y = E.y - (E.d.co || 40) * 0.55 - 8, r = 7;
      R.ve1(ctx, 'ic_truyna', 17, '', x, y); // huy hiệu $ ChatGPT (S2); chưa nạp → không vẽ (bỏ lục giác + chữ $ vẽ code)
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  },
};

// =====================================================================================================
// G1 · ECLIPSE (nhatthuc) — Vàng TC: đổi chế độ mỗi 8 s. NGÀY: tia nóng vào quái đầu ×d + CHÁY 4 s. ĐÊM: sóng trăng hình nón 100 px ×0.6, chậm 25% 2 s.
//      7★ NHẬT THỰC: mỗi lần đổi, 1.5 s cả hai chế độ + nổ vòng ×4 quanh quái đầu. 2 Eclipse luôn lệch pha.
// =====================================================================================================
SKILLS.nhatthuc = {
  vai: 'tc', dmg: 15, toc: 0.9, nham: 'dau',
  d: (T) => sao7(T, [1.5, 1.6, 1.7, 1.8, 2, 2.2, 2.5]),
  sinh(G, T) { const B = G.ban[T.ban]; const khac = B && B.t.find(X => X && X.id === 'nhatthuc' && X !== T); T.dem = khac ? !khac.dem : false; T.doiT = 8; T.ca = 0; },
  mo: (T) => (T.dem ? 'NIGHT: 100 px moon cone ×0.6, slows 25%' : 'DAY: beam ×' + SKILLS.nhatthuc.d(T) + ' + burn 4s') + ' · swaps in ' + Math.ceil(T.doiT || 0) + 's' + (T.sao >= 7 ? ' · ECLIPSE: both modes 1.5s + ×4 ring on each swap' : ''),
  capNhat(G, B, T, dt) {
    T.doiT = (T.doiT == null ? 8 : T.doiT) - dt; T.ca = Math.max(0, (T.ca || 0) - dt);
    if (T.doiT <= 0) {
      T.doiT = 8; T.dem = !T.dem; T.sang = 1; const c = tamU(T);
      FX.vong1(c.x, c.y, 34, 6, T.dem ? '#3a5bd9' : '#ffcc33', 0.35, 4); nhanU(T, T.dem ? 'NIGHT' : 'DAY', T.dem ? '#8aa4ff' : '#ffcc33'); if (!B.ai) { if (T.dem) SND.bang(); else SND.mana(); }
      if (T.sao >= 7) { T.ca = 1.5; const E = quaiDau(B); if (E) { noLan(E.x, E.y, 50, dmgU(T) * 4, B, { mau: '#fff0a0' }); FX.vong1(E.x, E.y, 6, 50, '#fff0a0', 0.35, 4); FX.no('laser_trung', E.x, E.y, 90, 0.4); nhanU(T, 'ECLIPSE!', '#fff0a0', true); } }
    }
    return false;
  },
  ban(G, B, T, E) {
    const ngay = !T.dem || T.ca > 0, dem = T.dem || T.ca > 0, dmg = dmgU(T), [x, y] = dauNong(T);
    giat(T, 0.8);
    if (ngay) {
      trung(E, dmg * this.d(T), { B, mau: '#ffcc33' }); G.hu.push({ k: 'tiaTia', t: 0, song: 0.22, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#ffcc33' });
      if (!E.chet) { E.chayT = 4; E.chayD = dmg * 0.4; E.chayB = B; if (!G.hu.some(o => o.k === 'chay' && o.E === E)) G.hu.push({ k: 'chay', t: 0, song: 30, E, T }); }
      SND.tia();
    }
    if (dem) {
      const g = Math.atan2(E.y - y, E.x - x);
      for (const Q of dsMucTieu(B)) { const d = Math.hypot(Q.x - x, Q.y - y), lech = Math.abs(gocLech(g, Math.atan2(Q.y - y, Q.x - x))); if (Q === E || (lech < 0.45 && d < Math.hypot(E.x - x, E.y - y) + 100)) { trung(Q, dmg * 0.6, { B, mau: '#9fb4ff' }); if (!Q.d.khangCham) { Q.cham = Math.max(Q.cham, 0.25); Q.chamT = Math.max(Q.chamT, 2); } } }
      G.hu.push({ k: 'non', t: 0, song: 0.3, x, y, g, L: Math.hypot(E.x - x, E.y - y) + 100 });
      if (!ngay) SND.bang();
    }
  },
  sangDau: (T) => (T.ca > 0 ? 0.35 : T.gd === 3 ? 0.12 : 0),
  veThem(ctx, T, S, al, R) { // nửa vành ngày/đêm quanh bệ (tròn): sáng phía chế độ đang bật
    if (MOT_VONG) return; // MỘT VÒNG (06/11): chỉ còn vòng xanh nạp chiêu quanh ụ — chế độ ngày/đêm xem ở màu đòn bắn + bảng chạm
    ctx.globalCompositeOperation = 'lighter'; // 2 nửa vòng = ảnh vòng PNG tô màu, cắt nửa bằng mặt nạ
    PX.cung(ctx, 0, 0, S * 0.43, -Math.PI / 2, Math.PI / 2, false, 2.2, '#ffcc33', al * (!T.dem || T.ca > 0 ? 0.7 : 0.15));
    PX.cung(ctx, 0, 0, S * 0.43, Math.PI / 2, Math.PI * 1.5, false, 2.2, '#5a7bff', al * (T.dem || T.ca > 0 ? 0.7 : 0.15));
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
  },
};
HU.chay = { // CHÁY: 4 s, mỗi 0.5 s, than hồng bay lên trên quái
  cap(G, o, dt) {
    const E = o.E; if (E.chet || !(E.chayT > 0)) return true;
    E.chayT -= dt; o.tick = (o.tick || 0) + dt;
    if (o.tick >= 0.5) { o.tick = 0; G.dangBan = null; trung(E, E.chayD * 0.5, { B: E.chayB, crit: false, phu: true, im: true }); }
    if (Math.random() < dt * 8) FX.hat1('than', E.x + rnd(-8, 8), E.y + rnd(-6, 6), rnd(-6, 6), -30, 0.5, 5, '#ff8a2a');
    return false;
  },
};
HU.non = { // sóng trăng hình nón (cung tròn đồng tâm, không méo)
  ve(ctx, o, R) {
    const u = o.t / o.song, r = o.L * (0.3 + 0.7 * u);
    const tk = R.co('hu_trangkhuyet', Math.max(24, r * 1.1)); // sóng trăng ChatGPT (S4): lưỡi liềm hướng theo o.g, nở theo bán kính
    if (tk) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - u) * 0.9; ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.g); const w = r * 0.55; ctx.drawImage(tk, r - w * 0.75, -r * 0.5, w, r); ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return; }
    // ảnh sóng trăng chưa nạp: không vẽ (bỏ quạt + cung vẽ code)
  },
};

// =====================================================================================================
// G6 · SCRAP FORGE (loren) — Vàng TC: KÉO bất kỳ ụ 1–3★ khác loại thả lên Forge (hoặc kéo Forge lên nó) → ăn: +f cộng dồn LÒ (+4% sát thương/cộng dồn,
//      tối đa 60, giữ khi ghép lên sao); ăn ụ 3★ = ×3. Búa nóng nổ 30 px; ≥40 cộng dồn: mỗi phát văng 1 mảnh sắt nóng vào 2 quái.
// =====================================================================================================
SKILLS.loren = { // Lò Rèn Phế Liệu — ĐẶC BIỆT (ụ RIÊNG của mình, không phải Aurora/Jacheongbi DCDW; khác Fusion Archive = mạnh theo MỌI lần ghép): KHÔNG bắn; KÉO ụ 1–3★ khác loại thả lên (hoặc kéo Forge lên nó) → ăn: +f cộng dồn LÒ;
  // mỗi cộng dồn = +4% sát thương VĨNH VIỄN cho ụ Tấn công mạnh nhất trên bàn (sao cao nhất), tối đa 15 cộng dồn (+60%, trần mỗi ụ nhận)
  vai: 'db', dmg: 0, toc: 0,
  MAX: 15,
  f: (T) => sao7(T, [1, 1, 2, 2, 3, 3, 4]),
  moi: (T) => (knThe(G.ban[T.ban], 'loren') || 4) / 100, // +% sát thương mỗi cộng dồn theo cấp thẻ (KY_NANG_CAP.loren)
  // giá trị THẬT ụ nhận được (kẹp trần +60%) — chữ hiển thị dùng đúng số này
  tong: (T) => Math.min(0.6, SKILLS.loren.moi(T) * (T.lo || 0)),
  dich: (B) => B.t.filter(X => X && SKILLS[X.id] && SKILLS[X.id].vai === 'tc').sort((a, b) => b.sao - a.sao || (SKILLS[b.id].dmg * TIERS[b.bac].hs) - (SKILLS[a.id].dmg * TIERS[a.bac].hs) || a.o - b.o)[0] || null,
  mo(T) { const X = this.dich(G.ban[T.ban]); return 'Forge ' + (T.lo || 0) + '/' + this.MAX + ' (+' + +(this.moi(T) * 100).toFixed(2) + '% each, max +60%) → +' + Math.round(this.tong(T) * 100) + '% damage to your best Attack turret while this Forge stays on the board' + (X ? ' (' + (TEXT.turret[X.id] ? TEXT.turret[X.id].name : X.id) + ' ' + X.sao + '★)' : '') + ' · FEED it: drag a 1–3★ turret onto it: +' + this.f(T) + ' (3★ food ×3) · only feeding counts (other merges don\'t)'; },
  gocDau: (T, t) => -Math.PI / 2 + Math.sin(t * 0.8 + (T.pha || 0)) * 0.2,
  capNhat(G, B, T) {
    const X = this.dich(B); T.forgeX = X;
    if (X && T.lo) {
      if (X._forgeT !== G.t) { X._forgeT = G.t; X._forgeS = 0; }
      const v = Math.min(this.tong(T), 0.6 - X._forgeS); // trần +60% cho mỗi ụ nhận (nhiều Forge không cộng quá)
      if (v > 0) { X._forgeS += v; X.buf.dmg += v; X.nguon.push({ k: 'dmg', v, T }); }
    }
    return true;
  },
  ghepDB: {
    haiChieu: true,
    hopLe: (a, b) => b.id !== 'loren' && b.sao <= 3 && b.ban === a.ban && !b.st.da && (a.lo || 0) < SKILLS.loren.MAX,
    lam(G, B, a, b) { // a = Forge, b = ụ bị ăn
      const n = SKILLS.loren.f(a) * (b.sao >= 3 ? 3 : 1);
      B.t[b.o] = null;
      G.bay.push({ id: b.id, sao: b.sao, x0: B.o[b.o].x, y0: B.o[b.o].y, x1: B.o[a.o].x, y1: B.o[a.o].y, t: 0, bac: b.bac });
      a.lo = Math.min(SKILLS.loren.MAX, (a.lo || 0) + n); a.sang = 1; a.anim = { k: 'no', t: 0.25 };
      const c = B.o[a.o]; FX.chu1(c.x, c.y - 30, '+' + n + ' FORGE', '#ff6a1a', 15, 'to'); FX.tiaLua(c.x, c.y, 16, '#ff6a1a', 200, 10); FX.no('no_phao', c.x, c.y, 60, 0.35);
      const X = SKILLS.loren.dich(B); if (X) { const cx = B.o[X.o]; tiaPhep(c.x, c.y, cx.x, cx.y, '#ff6a1a'); }
      SND.dat(); SND.no(0.3);
      return a;
    },
  },
  ghep(G, B, a, b, ra) { if (ra.id === 'loren') ra.lo = Math.max(a.lo || 0, b.lo || 0); },
  sangDau: (T) => Math.min(0.35, (T.lo || 0) / 30),
  veThem(ctx, T, S, al, R) { const n = T.lo || 0; if (n >= 4) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (n >= 10 ? 0.35 + 0.1 * Math.sin(R.t * 7) : 0.18); R.anhGiua(ctx, R.cham1('#ff6a1a'), 0, 0, S * 0.9); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; } },
};

// =====================================================================================================
// G7 · MIRROR GATE (guongcong) — Vàng ĐB (hồi h s): PVP chặn + PHẢN hiệu ứng ghép của đối thủ lên bàn bạn (Clamp/Scramble/−1★/Jam → đối thủ bị Kẹp 4 s;
//      7★ ×2) · Trùm: chặn (không phản) · Co-op: khi đồng đội ghép ụ có hiệu ứng ghép → sao chép lên bàn bạn ở ½ sao · Solo: chặn 1 kỹ năng trùm / h s.
// =====================================================================================================
SKILLS.guongcong = { // Cổng Gương — HỖ TRỢ (ụ RIÊNG: cơ chế PHẢN khống chế của mình — không phải Bari DCDW): ụ kề kháng khống chế (xác suất, trần 35%); hồi 20 s (7★ 15 s): PVP chặn + PHẢN 1 hiệu ứng,
  // trùm: chặn 1 chiêu · CO-OP: sao chép 1 hiệu ứng ghép của đồng đội ở ½ sao. Không bắn.
  vai: 'ht', dmg: 0, toc: 0, napMau: '#bff6ff',
  khang: (T) => 0.15 * HOTRO.k(T),
  h: (T) => (ms(T, 7) ? 15 : 20),
  mo: (T) => 'Neighbours resist control ' + Math.round(HOTRO.hd(T, 'khang', SKILLS.guongcong.khang(T)) * 100) + '% · ' + (T.nap >= 1 ? 'MIRROR READY' : 'mirror ' + Math.round(T.nap * 100) + '%') + ' every ' + SKILLS.guongcong.h(T) + 's: PVP reflects 1 control · blocks a boss skill · CO-OP copies an ally merge at half stars',
  hoTro(G, T, N, ra) { ra.khang = this.khang(T); },
  capNhat(G, B, T, dt) { T.nap = Math.min(1, T.nap + dt / this.h(T)); HOTRO.nhip(G, B, T, dt, '191,246,255', 2.8, 0.3); return true; },
  san: (B) => B && B.t.find(X => X && X.id === 'guongcong' && X.nap >= 1 && !X.st.da && !(X.st.bang > 0)),
  veThem(ctx, T, S, al, R) { // mảnh gương bay vòng tròn quanh tâm (sáng khi sẵn sàng)
    const n = T.sao >= 7 ? 6 : T.sao >= 4 ? 4 : 2, san = T.nap >= 1;
    for (let i = 0; i < n; i++) { const a = R.t * 1.2 + i * Math.PI * 2 / n, x = Math.cos(a) * S * 0.45, y = Math.sin(a) * S * 0.45;
      const mg = R.co('hu_manhguong', 11); // mảnh gương ChatGPT (S4)
      if (mg) { ctx.globalAlpha = al * (san ? 1 : 0.45); ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2); ctx.drawImage(mg, -5.5, -5.5, 11, 11); ctx.restore(); continue; }
    }
    if (san) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.2 + 0.1 * Math.sin(R.t * 4)); R.anhGiua(ctx, R.cham1('#bff6ff'), 0, 0, S); ctx.globalCompositeOperation = 'source-over'; }
    ctx.globalAlpha = al;
  },
};
function guongLoe(B, T, chu) { const c = B.o[T.o]; T.nap = 0; T.sang = 1; FX.vong1(c.x, c.y, 8, 52, '#bff6ff', 0.4, 4); FX.chu1(c.x, c.y - 44, chu, '#bff6ff', 15, 'to'); SND.kinhVo(); }
const _chanKhienGoc = chanKhien;
chanKhien = function (B, T) {
  const M = SKILLS.guongcong.san(B);
  if (M && (G._trumDang || G.che === 'pvp')) {
    guongLoe(B, M, G._trumDang ? 'BLOCKED' : 'REFLECT!');
    if (!G._trumDang && T) { const c = B.o[T.o]; VX.chanKhien(B, T); FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#bff6ff', 11); }
    if (!G._trumDang) { // phản lại: kẹp ụ mạnh nhất của đối thủ 4 s (7★: 2 ụ)
      const D = banKhac(B);
      if (D) for (const X of D.t.filter(X => X && SKILLS[X.id].dmg && !(X.st.kep > 0)).sort((x, y) => y.sao - x.sao).slice(0, M.sao >= 7 ? 2 : 1)) {
        X.st.kep = 4; const c0 = B.o[M.o], c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#bff6ff'); FX.chu1(c.x, c.y - 20, 'REFLECTED', '#bff6ff', 12, 'to');
      }
    }
    return true;
  }
  return _chanKhienGoc(B, T);
};
const _thucHienChieuGoc = thucHienChieu;
thucHienChieu = function (E, B) { G._trumDang = true; try { return _thucHienChieuGoc(E, B); } finally { G._trumDang = false; } };
// Co-op: sao chép hiệu ứng ghép AN TOÀN của đồng đội (½ sao) lên bàn mình
const GUONG_CHEP = new Set(['nhanmana', 'drone', 'loa', 'nhanban', 'kepha', 'sinhdoi', 'orbital', 'khoathoigian', 'pandora', 'nhieusong']);
const _ghepGuong = ghep;
ghep = function (B, a, b, ep) {
  const ids = a && b ? [...new Set([a.id, b.id])].filter(id => GUONG_CHEP.has(id)) : [], saoA = a ? a.sao : 1;
  const r = _ghepGuong(B, a, b, ep);
  if (r && ids.length && G.che === 'coop') {
    const D = banKhac(G.ban[b.ban]), M = SKILLS.guongcong.san(D);
    const X = D && D.t.find(N => N && N !== M);
    if (M && X) {
      guongLoe(D, M, 'MIRROR COPY');
      const gia = { id: ids[0], sao: Math.max(1, Math.ceil(saoA / 2)), o: X.o, ban: D.i, st: {} };
      for (const id of ids.slice(0, 1)) { try { SKILLS[id].ghep(G, D, gia, X, X); } catch (e) { } }
    }
  }
  return r;
};

// =====================================================================================================
// G5 · MARIONETTE — Vàng ĐB: mỗi chu kỳ gắn dây rối lên quái thường nhiều máu nhất (1–3★ không lấy quái to; không trùm): quái QUAY ĐẦU đi ngược t s,
//      đâm quái khác gây 30% máu còn lại của nó, hết giờ TỰ NỔ dmg×8 trong 60 px. 7★: 2 con rối. Rối chết không gửi sang đối thủ, không cho mana.
// =====================================================================================================
SKILLS.marionette = {
  vai: 'db', dmg: 9, toc: 0.8, nham: 'dau', napMau: '#a01848',
  ky: (T) => sao7(T, [10, 9.5, 9, 8.5, 8, 7.5, 7]), t: (T) => sao7(T, [2, 2.5, 3, 3.5, 4, 4.5, 5]),
  mo: (T) => 'Every ' + SKILLS.marionette.ky(T) + 's controls ' + (T.sao >= 7 ? 2 : 1) + ' enemy (' + (T.sao >= 4 ? 'big ones too' : 'no big ones') + '): walks it back ' + SKILLS.marionette.t(T) + 's, rams up to 6 others for 30% of its HP (capped), then explodes ×8 (60 px)',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    if (T.nap >= 1 && !G.hu.some(o => o.k === 'roi' && o.T === T)) {
      const ds = dsMucTieu(B).filter(E => !E.chet && !E.trum && !E.roi && (T.sao >= 4 || !E.d.to)).sort((a, b) => b.hp - a.hp).slice(0, T.sao >= 7 ? 2 : 1);
      if (ds.length) {
        T.nap = 0;
        for (const E of ds) { E.roi = true; E.gui = true; E.khongMana = true; G.hu.push({ k: 'roi', t: 0, song: this.t(T), E, B, T, dmg: dmgU(T) * 8, dam: [] }); }
        buffNo(T, 'crit', 1); if (!B.ai) SND.mana();
      }
    }
    return false;
  },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 13, mau: '#ff9ac0', sp: 500 }); },
};
HU.roi = {
  cap(G, o, dt) {
    const E = o.E; if (E.chet) { this.no(G, o); return true; }
    E.s = Math.max(0, E.s - E.d.v * 2 * dt); E.chan = Math.max(E.chan || 0, 0.05);
    for (const Q of dsMucTieu(o.B)) if (Q !== E && !Q.chet && !o.dam.includes(Q) && Math.hypot(Q.x - E.x, Q.y - E.y) < 18 + Q.d.co * 0.2) {
      o.dam.push(Q); if (o.dam.length > 6) continue; G.dangBan = o.T; trung(Q, Math.min(Math.max(0, E.hp) * 0.3, o.dmg * 0.5), { B: o.B, phu: true, crit: false, mau: '#ff9ac0' }); FX.no('no_phao', Q.x, Q.y, 36, 0.25);
    }
    return false;
  },
  het(G, o) { this.no(G, o); },
  no(G, o) {
    if (o.daNo) return; o.daNo = true; const E = o.E, x = E.x, y = E.y;
    G.dangBan = o.T;
    if (!E.chet) trung(E, E.hp + 1, { B: o.B, phu: true, crit: false, im: true });
    noLan(x, y, 60, o.dmg, o.B, { phu: true, mau: '#ff9ac0' });
    FX.no('no_phao', x, y, 120, 0.45); FX.vong1(x, y, 6, 60, '#ff6aa0', 0.35, 4); FX.lac(3); SND.no(0.6);
  },
  // hình: tay rối khổng lồ + 4 dây móc + nhấc bổng + nổ rối đồ chơi = ảnh PNG ChatGPT (js/sigfx.js, sig_l22_*); không vẽ dây bằng code
  ve() { },
};

// =====================================================================================================
// đăng ký: lớp vẽ truy nã, họ kỹ năng, mốc sao, grow-up, buff mới (sát thương chí mạng)
// =====================================================================================================
const _batDau4 = batDau;
batDau = function (che, deck, mv) { const r = _batDau4(che, deck, mv); G.hu.push({ k: 'truyNaVe', t: 0, song: 1e12 }); return r; };

themHo('execute', 3, 'nemesis', '% max-HP hits, executes, boss JUDGMENT');
themHo('heavy', 2, 'docton', 'ALONE = ×2 fire rate + crit (position puzzle)');
themHo('crit', 2, 'thaukinh', 'lends crit DAMAGE; crits pierce');
themHo('guard', 2, 'nhieusong', 'merge jams rivals / frees an ally summon');
themHo('mana', 2, 'santhuong', 'WANTED marks pay bonus mana on kill');
themHo('frost', 3, 'nhatthuc', 'Day burn ⇄ Night slowing cone');
themHo('star', 3, 'loren', 'eats 1–3★ turrets for forge stacks (kept while the Forge stays)');
themHo('guard', 3, 'guongcong', 'blocks & REFLECTS rival control');
themHo('trap', 3, 'marionette', 'turns an enemy against its own wave');

Object.assign(MOC_RIENG, {
  docton: { 7: ['DUELIST', 'ACE shots pierce 1 enemy'] },
  thaukinh: { 5: ['DOUBLE PIERCE', 'Crits pierce 2 enemies'], 7: ['TRUE FOCUS', 'Pierce hits deal 65% (not 50%)'] },
  nemesis: { 7: ['REAPER LEAP', 'Executions leap to the nearest enemy'] },
  nhatthuc: { 7: ['TOTAL ECLIPSE', 'Each swap: both modes 1.5s + ×4 ring blast'] },
  marionette: { 7: ['TWIN PUPPETS', 'Controls 2 enemies at once (4★+: big enemies too)'] },
  // Forge không bắn → mốc chung '+20% speed / +25% effect / +30% effect' không làm gì; sao thật sự đổi số cộng dồn mỗi lần ăn (f)
  loren: { 3: ['HOT COALS', 'Each feed +2 stacks (3★ food ×3)'], 5: ['BELLOWS', 'Each feed +3 stacks'], 7: ['MOLTEN CORE', 'Each feed +4 stacks'] },
});
Object.assign(GROW, {
  nemesis: ttSao('#d01e3a', ['SCALES', 'SCYTHE', 'VERDICT'], '1–3★ / 4–6★ / 7★: executions leap to a 2nd enemy'),
  nhatthuc: ttSao('#ffcc33', ['DUSK', 'CORONA', 'TOTAL ECLIPSE'], '1–3★ / 4–6★ / 7★: both modes at once on every swap'),
  marionette: ttSao('#a01848', ['STRINGS', 'GOLDEN HAND', 'TWIN PUPPETS'], '1–3★ / 4–6★ (big enemies) / 7★ (2 puppets)'),
  guongcong: ttSao('#bff6ff', ['MIRROR', 'TWIN PANES', 'SHARD HALO'], '1–3★ / 4–6★ / 7★: reflects ×2'),
  // (QA vàng-đỏ: ngưỡng cũ 15/40 cộng dồn từ bản Forge bắn — trần nay 15 → dạng 3 không bao giờ tới; 'hot shards' không còn)
  loren: { mau: '#ff6a1a', khongAnh: true, ten: ['COLD FORGE', 'BELLOWS', 'MOLTEN CORE'], dk: 'Forge stacks 0–4 / 5–14 / 15 (full: +60% to your best Attack turret)',
    gd: (T) => { const n = T.lo || 0; return { s: n >= 15 ? 3 : n >= 5 ? 2 : 1, p: n / 15, v: [1 / 3, 1] }; } },
});
