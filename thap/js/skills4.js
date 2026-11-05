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
  mo(T) { const n = this.ke(G.ban[T.ban], T); return (n === 0 ? 'ACE: ×2 fire rate, +' + Math.round(this.a(T) * 100) + '% crit' + (T.sao >= 7 ? ', pierces 1' : '') : n >= 3 ? 'CROWDED (' + n + ' neighbours): −30% fire rate' : n + ' neighbour(s): normal') + ' · keep its 4 N/E/S/W cells EMPTY'; },
  capNhat(G, B, T) {
    const n = this.ke(B, T), ace = n === 0;
    if (ace) { T.buf.toc += 1; T.buf.crit += this.a(T); } else if (n >= 3) T.buf.toc -= 0.3;
    if (ace && !T.ace) { nhanU(T, 'ACE', '#ff3a4a', true); if (!B.ai) SND.thucTinh(); }
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
  veThem(ctx, T, S, al, R) { if (!T.ace) return; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.55 + 0.2 * Math.sin(R.t * 5)); ctx.strokeStyle = '#ff3a4a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, S * 0.44, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; },
};

// =====================================================================================================
// P5 · FOCUS LENS (thaukinh) — Tím HT: 4 ô kề +k% sát thương chí mạng; chí mạng của ụ kề XUYÊN thêm 1 quái phía sau (60%); 5★+: 2 quái
// =====================================================================================================
SKILLS.thaukinh = {
  vai: 'ht', dmg: 0, toc: 0,
  k: (T) => sao7(T, [0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 1]) + 0.05 * (lvU(T) - 1),
  mo: (T) => 'Neighbours: +' + Math.round(SKILLS.thaukinh.k(T) * heSoHT(T) * 100) + '% crit damage · their crits pierce ' + (T.sao >= 5 ? 2 : 1) + ' enemy behind (60%)',
  hoTro(G, T, N) { N.buf.cdmg = (N.buf.cdmg || 0) + this.k(T) * heSoHT(T); N.buf.xuyen = Math.max(N.buf.xuyen || 0, T.sao >= 5 ? 2 : 1); },
  capNhat(G, B, T, dt) { hoTroNhip(G, B, T, dt, '111,208,255', 2.6, 0.4); return true; },
};
function xuyenCrit(E, dmg, T, o) { // chí mạng xuyên: quái phía sau gần nhất (đã đi ít hơn) trong 60 px
  const B = o.B || G.ban[T.ban]; if (!B) return;
  const ds = dsMucTieu(B).filter(Q => Q !== E && !Q.chet && Q.p === E.p && Q.s < E.s && Math.hypot(Q.x - E.x, Q.y - E.y) < 60).sort((a, b) => b.s - a.s).slice(0, T.buf.xuyen);
  let x0 = E.x, y0 = E.y;
  for (const Q of ds) { trung(Q, dmg * 0.6, { B, T, phu: true, crit: false, mau: '#6fd0ff' }); G.hu.push({ k: 'tiaTia', t: 0, song: 0.18, x0, y0, x1: Q.x, y1: Q.y, mau: '#6fd0ff' }); x0 = Q.x; y0 = Q.y; }
}

// =====================================================================================================
// P6 · SIGNAL JAMMER (nhieusong) — Tím ĐB, khi GHÉP: PVP báo trước 0.65 s rồi NHIỄU n ụ đối thủ (−40% tốc t s) + lần triệu hồi kế của đối thủ +m mana
//      (miễn nhiễm 8 s; bỏ qua ụ đang dính hiệu ứng xấu) · Co-op: lần triệu hồi kế của đồng đội MIỄN PHÍ + đồng đội +10% tốc t s · Solo: quái chậm 20% t s
// =====================================================================================================
SKILLS.nhieusong = {
  vai: 'db', dmg: 11, toc: 1, nham: 'dau',
  n: (T) => sao7(T, [1, 1, 2, 2, 3, 3, 4]), t: (T) => sao7(T, [3, 3.5, 4, 4.5, 5, 5.5, 6]), m: (T) => sao7(T, [5, 5, 10, 10, 15, 15, 20]),
  mo: (T) => { const s = SKILLS.nhieusong; return 'On merge: PVP jams ' + s.n(T) + ' rival turrets −40% for ' + s.t(T) + 's + their next summon +' + s.m(T) + ' mana · CO-OP ally next summon FREE + 10% speed · SOLO slows all 20%'; },
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
//      chết (do bất kỳ ụ nào) → +g mana (trùm ×5). Co-op: mana thưởng chia đôi cho 2 bàn. PVP: quái truy nã bị gửi sang đối thủ mà lọt → bạn +5.
// =====================================================================================================
SKILLS.santhuong = {
  vai: 'db', dmg: 10, toc: 1, nham: 'dau', napMau: '#f0b030',
  n: (T) => sao7(T, [1, 1, 2, 2, 2, 3, 3]), g: (T) => sao7(T, [2, 3, 3, 4, 5, 5, 6]),
  mo: (T) => 'Every 5s marks ' + SKILLS.santhuong.n(T) + ' enemies (big first): +10% damage taken, +' + SKILLS.santhuong.g(T) + ' mana when killed (boss ×5)',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / 5);
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
trung = function (E, dmg, o) { if (E.truyNa && !E.chet) dmg *= 1.1; return _trungNa(E, dmg, o); };
const _chetGoc = chet;
chet = function (E, B) {
  if (E.chet) return;
  const pB = B || G.ban[G.duong[E.p].ban] || G.ban[0];
  const mana0 = pB.mana, nay0 = pB.manaNay;
  const dangGui = G.che === 'pvp' && !E.gui && !E.trum && E.id !== 'nho', n0 = G.hang.length;
  _chetGoc(E, B);
  if (E.khongMana) { pB.mana = mana0; pB.manaNay = nay0; } // Marionette: rối chết không cho mana
  if (dangGui && E.truyNa && G.hang.length > n0) G.hang[G.hang.length - 1].na = E.truyNa.B; // PVP: dấu truy nã đi theo quái gửi sang
  if (E.truyNa) {
    const g = E.truyNa.g * (E.trum ? 5 : 1), D = G.che === 'coop' ? banKhac(E.truyNa.B) : null;
    if (D) { const h = Math.ceil(g / 2); E.truyNa.B.mana += h; D.mana += h; } else { E.truyNa.B.mana += g; E.truyNa.B.manaNay += g; }
    FX.chu1(E.x, E.y - 30, '+' + g + ' BOUNTY', '#f0b030', 13, 'mana'); if (!E.truyNa.B.ai) SND.mana();
  }
};
const _capNhatGoc = capNhat;
capNhat = function (dt) { // gắn dấu PVP lên quái vừa gửi sang (hàng chờ có trường na)
  const cu = G.hang.filter(h => h.na && G.t + dt >= h.t);
  const n0 = G.quai.length;
  _capNhatGoc(dt);
  if (cu.length) for (const E of G.quai.slice(n0)) { const h = cu.find(h => h.p === E.p && h.id === E.id && !h._da); if (h) { h._da = true; E.naGui = h.na; } }
};
const _lotNa = lot;
lot = function (E) { if (E.naGui && G.che === 'pvp') { E.naGui.mana += 5; const c = E.naGui.o[7]; FX.chu1(c.x, c.y - 40, '+5 BOUNTY LEAK', '#f0b030', 13, 'mana'); } return _lotNa(E); };
HU.truyNaVe = { // ký hiệu "$" lục giác trên đầu mọi quái truy nã (1 lớp vẽ chung, tự tạo)
  cap: () => false,
  ve(ctx, o, R) {
    for (const E of G.quai) {
      if (E.chet || !E.truyNa) continue;
      const x = E.x, y = E.y - (E.d.co || 40) * 0.55 - 8, r = 7;
      ctx.globalAlpha = 0.95; ctx.fillStyle = '#2a1c05'; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; i ? ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#f0b030'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = '900 9px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffd27a'; ctx.fillText('$', x, y + 0.5);
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
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 2.2;
    ctx.globalAlpha = al * (!T.dem || T.ca > 0 ? 0.7 : 0.15); ctx.strokeStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(0, 0, S * 0.43, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.globalAlpha = al * (T.dem || T.ca > 0 ? 0.7 : 0.15); ctx.strokeStyle = '#5a7bff'; ctx.beginPath(); ctx.arc(0, 0, S * 0.43, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
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
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - u) * 0.75;
    ctx.fillStyle = 'rgba(90,123,255,.35)'; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.arc(o.x, o.y, r, o.g - 0.45, o.g + 0.45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c8d4ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, o.y, r, o.g - 0.45, o.g + 0.45); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// G6 · SCRAP FORGE (loren) — Vàng TC: KÉO bất kỳ ụ 1–3★ khác loại thả lên Forge (hoặc kéo Forge lên nó) → ăn: +f cộng dồn LÒ (+4% sát thương/cộng dồn,
//      tối đa 60, giữ khi ghép lên sao); ăn ụ 3★ = ×3. Búa nóng nổ 30 px; ≥40 cộng dồn: mỗi phát văng 1 mảnh sắt nóng vào 2 quái.
// =====================================================================================================
SKILLS.loren = {
  vai: 'tc', dmg: 13, toc: 1, nham: 'dau',
  f: (T) => sao7(T, [1, 1, 2, 2, 3, 3, 4]),
  mo: (T) => 'Forge stacks ' + (T.lo || 0) + '/60 → +' + 4 * (T.lo || 0) + '% damage · drag any 1–3★ turret onto it: +' + SKILLS.loren.f(T) + ' (3★ food ×3)',
  capNhat(G, B, T) { T.buf.dmg += 0.04 * (T.lo || 0); return false; },
  ghepDB: {
    haiChieu: true,
    hopLe: (a, b) => b.id !== 'loren' && b.sao <= 3 && b.ban === a.ban && !b.st.da && (a.lo || 0) < 60,
    lam(G, B, a, b) { // a = Forge, b = ụ bị ăn
      const n = SKILLS.loren.f(a) * (b.sao >= 3 ? 3 : 1);
      B.t[b.o] = null;
      G.bay.push({ id: b.id, sao: b.sao, x0: B.o[b.o].x, y0: B.o[b.o].y, x1: B.o[a.o].x, y1: B.o[a.o].y, t: 0, bac: b.bac });
      a.lo = Math.min(60, (a.lo || 0) + n); a.sang = 1; a.anim = { k: 'no', t: 0.25 };
      const c = B.o[a.o]; FX.chu1(c.x, c.y - 30, '+' + n + ' FORGE', '#ff6a1a', 15, 'to'); FX.tiaLua(c.x, c.y, 16, '#ff6a1a', 200, 10); FX.no('no_phao', c.x, c.y, 60, 0.35);
      SND.dat(); SND.no(0.3);
      return a;
    },
  },
  ghep(G, B, a, b, ra) { if (ra.id === 'loren') ra.lo = Math.max(a.lo || 0, b.lo || 0); },
  ban(G, B, T, E) {
    giat(T, 1); const [x, y] = chopNong(T, 26); SND.phao();
    const dmg = dmgU(T), gd3 = (T.lo || 0) >= 40;
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 420, co: 16, cong: 18, B, T, duoi: true,
      trung(G, d) {
        noLan(d.x, d.y, 30, dmg, B, { mau: '#ffb070' }); FX.no('no_phao', d.x, d.y, 60, 0.3); FX.tiaLua(d.x, d.y, 6, '#ff6a1a', 160, 8);
        if (gd3) for (const Q of dsMucTieu(B).filter(Q => !Q.chet && Math.hypot(Q.x - d.x, Q.y - d.y) < 110).slice(0, 2)) { trung(Q, dmg * 0.5, { B, phu: true, mau: '#ff6a1a' }); G.hu.push({ k: 'tiaTia', t: 0, song: 0.18, x0: d.x, y0: d.y, x1: Q.x, y1: Q.y, mau: '#ff6a1a' }); }
      } });
  },
  sangDau: (T) => Math.min(0.35, (T.lo || 0) / 120),
  veThem(ctx, T, S, al, R) { const n = T.lo || 0; if (n >= 15) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (n >= 40 ? 0.35 + 0.1 * Math.sin(R.t * 7) : 0.18); R.anhGiua(ctx, R.cham1('#ff6a1a'), 0, 0, S * 0.9); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; } },
};

// =====================================================================================================
// G7 · MIRROR GATE (guongcong) — Vàng ĐB (hồi h s): PVP chặn + PHẢN hiệu ứng ghép của đối thủ lên bàn bạn (Clamp/Scramble/−1★/Jam → đối thủ bị Kẹp 4 s;
//      7★ ×2) · Trùm: chặn (không phản) · Co-op: khi đồng đội ghép ụ có hiệu ứng ghép → sao chép lên bàn bạn ở ½ sao · Solo: chặn 1 kỹ năng trùm / h s.
// =====================================================================================================
SKILLS.guongcong = {
  vai: 'db', dmg: 10, toc: 1, nham: 'dau', napMau: '#bff6ff',
  h: (T) => sao7(T, [30, 27, 24, 21, 18, 15, 12]),
  mo: (T) => (T.nap >= 1 ? 'READY' : 'charging ' + Math.round(T.nap * 100) + '%') + ' · every ' + SKILLS.guongcong.h(T) + 's: PVP blocks & REFLECTS a rival merge effect · blocks a boss skill · CO-OP copies an ally merge effect at half stars',
  capNhat(G, B, T, dt) { T.nap = Math.min(1, T.nap + dt / this.h(T)); return false; },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_bang', co: 15, mau: '#bff6ff', sp: 560 }); },
  san: (B) => B && B.t.find(X => X && X.id === 'guongcong' && X.nap >= 1 && !X.st.da && !(X.st.bang > 0)),
  veThem(ctx, T, S, al, R) { // 6 mảnh gương bay vòng tròn quanh tâm (sáng khi sẵn sàng)
    const n = T.sao >= 7 ? 6 : T.sao >= 4 ? 4 : 2, san = T.nap >= 1;
    for (let i = 0; i < n; i++) { const a = R.t * 1.2 + i * Math.PI * 2 / n, x = Math.cos(a) * S * 0.45, y = Math.sin(a) * S * 0.45;
      ctx.globalAlpha = al * (san ? 0.95 : 0.4); ctx.fillStyle = san ? '#e8fdff' : '#7d93a0'; ctx.beginPath(); ctx.moveTo(x, y - 3.5); ctx.lineTo(x + 2.5, y); ctx.lineTo(x, y + 3.5); ctx.lineTo(x - 2.5, y); ctx.closePath(); ctx.fill(); }
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
const GUONG_CHEP = new Set(['nhanmana', 'drone', 'loa', 'nhanban', 'khien', 'taylo', 'kepha', 'sinhdoi', 'hasao', 'orbital', 'khoathoigian', 'pandora', 'nhieusong']);
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
  mo: (T) => 'Every ' + SKILLS.marionette.ky(T) + 's controls ' + (T.sao >= 7 ? 2 : 1) + ' enemy (' + (T.sao >= 4 ? 'big ones too' : 'no big ones') + '): walks it back ' + SKILLS.marionette.t(T) + 's, rams others for 30% of its HP, then explodes ×8 (60 px)',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    if (T.nap >= 1 && !G.hu.some(o => o.k === 'roi' && o.T === T)) {
      const ds = dsMucTieu(B).filter(E => !E.chet && !E.trum && !E.roi && (T.sao >= 4 || !E.d.to)).sort((a, b) => b.hp - a.hp).slice(0, T.sao >= 7 ? 2 : 1);
      if (ds.length) {
        T.nap = 0;
        for (const E of ds) { E.roi = true; E.gui = true; E.khongMana = true; G.hu.push({ k: 'roi', t: 0, song: this.t(T), E, B, T, dmg: dmgU(T) * 8, dam: [] }); }
        nhanU(T, 'PUPPET!', '#ff6aa0', true); if (!B.ai) SND.mana();
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
  ve(ctx, o, R) {
    const E = o.E; if (E.chet || !conTren(o.T)) return;
    const [x, y] = dauNong(o.T), r = (E.d.co || 40) * 0.45;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + E.x) / 2 + k * 10, Math.min(y, E.y) - 40, E.x + k * 5, E.y - r); ctx.stroke(); }
    ctx.globalAlpha = 0.85; ctx.strokeStyle = '#4bff9a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(E.x, E.y, r + 2, 0, 7); ctx.stroke();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
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
themHo('star', 3, 'loren', 'eats 1–3★ turrets for permanent stacks');
themHo('guard', 3, 'guongcong', 'blocks & REFLECTS rival control');
themHo('trap', 3, 'marionette', 'turns an enemy against its own wave');

Object.assign(MOC_RIENG, {
  docton: { 7: ['DUELIST', 'ACE shots pierce 1 enemy'] },
  thaukinh: { 5: ['DOUBLE PIERCE', 'Crits pierce 2 enemies'] },
  nemesis: { 7: ['REAPER LEAP', 'Executions leap to the nearest enemy'] },
  nhatthuc: { 7: ['TOTAL ECLIPSE', 'Each swap: both modes 1.5s + ×4 ring blast'] },
  marionette: { 7: ['TWIN PUPPETS', 'Controls 2 enemies at once (4★+: big enemies too)'] },
});
Object.assign(GROW, {
  nemesis: ttSao('#d01e3a', ['SCALES', 'SCYTHE', 'VERDICT'], '1–3★ / 4–6★ / 7★: executions leap to a 2nd enemy'),
  nhatthuc: ttSao('#ffcc33', ['DUSK', 'CORONA', 'TOTAL ECLIPSE'], '1–3★ / 4–6★ / 7★: both modes at once on every swap'),
  marionette: ttSao('#a01848', ['STRINGS', 'GOLDEN HAND', 'TWIN PUPPETS'], '1–3★ / 4–6★ (big enemies) / 7★ (2 puppets)'),
  guongcong: ttSao('#bff6ff', ['MIRROR', 'TWIN PANES', 'SHARD HALO'], '1–3★ / 4–6★ / 7★: reflects ×2'),
  loren: { mau: '#ff6a1a', khongAnh: true, ten: ['COLD FORGE', 'BELLOWS', 'MOLTEN CORE'], dk: 'Forge stacks 0–14 / 15–39 / 40+ (hot shards hit 2 more)',
    gd: (T) => { const n = T.lo || 0; return { s: n >= 40 ? 3 : n >= 15 ? 2 : 1, p: n / 60, v: [0.25, 2 / 3] }; } },
});
