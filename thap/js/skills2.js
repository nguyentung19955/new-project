// TURRET MERGE — 48 Ụ CÒN LẠI (theo thẻ DCDW trong docs/demo-hop-tuong/DCDW-WIKI-TOM-TAT.md)
// Mỗi ụ đăng ký SKILLS['<id>'] như skills.js. Trường mới dùng ở đây:
//   chonMuc(G,B,T) chọn mục tiêu riêng · crit (+tỉ lệ chí mạng) · luonCrit(T) · khiTrung/khiCrit/khiGiet(G,T,E…) móc khi trúng
//   ghepDB {hopLe(a,b), lam(G,B,a,b,dao), haiChieu} ghép đặc biệt (kéo ụ này thả lên ụ khác)
//   sinh(G,T) khi ụ xuất hiện · chuDong(G,B,T) kỹ năng chủ động (chạm ụ khi nạp đầy) + aiNen(G,B,T)
//   napMau (vòng nạp quanh bệ) · gocDau(T,t) góc đầu cố định · sangDau(T,t) độ sáng đầu · veThem(ctx,T,S,al,R,B) vẽ thêm quanh ụ
'use strict';

// ---------- tiện ích ----------
const lvU = (T) => G.ban[T.ban].lv[T.id] || 1;
const conTren = (T) => { const B = G.ban[T.ban]; return !!B && B.t[T.o] === T; };
// hệ số sức mạnh không kèm buff (dùng cho hiệu ứng khi ghép, drone…)
const hsU = (id, sao, B) => (SKILLS[id].dmg || 10) * TIERS[G.rosterMap[id].bac].hs * (1 + 0.85 * (sao - 1)) * (1 + 0.18 * ((B.lv[id] || 1) - 1));
// nhãn kỹ năng ngắn hiện trên ụ khi kỹ năng kích hoạt
function nhanU(T, s, mau, ep) {
  if (!T || (!ep && G.t - (T.nhanT || -9) < 0.9)) return;
  T.nhanT = G.t;
  const B = G.ban[T.ban]; if (!B) return;
  const c = B.o[T.o];
  let y = c.y - 30; // xếp chồng nếu gần đó đang có nhãn khác
  for (let k = 0; k < 4; k++) { if (FX.chu.some(q => q.kieu === 'nhan' && q.t < 0.9 && Math.abs(q.x - c.x) < 70 && Math.abs(q.y - y) < 15)) y -= 17; else break; }
  const n = FX.chu1(c.x, y, s, mau || TIERS[T.bac].mau, 11, 'nhan');
  if (n) n.vien = TIERS[T.bac].mau;
}
function quaiTrongTam(B, T, r) { const c = tamU(T), ds = []; for (const E of dsMucTieu(B)) if (Math.hypot(E.x - c.x, E.y - c.y) <= r + E.d.co * 0.3) ds.push(E); return ds; }
function quaiDauTam(B, T, r) { let m = null, best = 1e9; for (const E of quaiTrongTam(B, T, r)) { const d = G.duong[E.p].len - E.s; if (d < best) { best = d; m = E; } } return m; }
// đạn thường gọn cho các ụ phụ
function banNhe(B, T, E, o) {
  giat(T, o.giat || 0.5);
  const [x, y] = dauNong(T);
  FX.no('chop_nong', x, y, o.chop || 20, 0.08, T.goc);
  if (o.snd) SND[o.snd]();
  const dmg = o.dmg != null ? o.dmg : dmgU(T);
  return danThang(B, T, E, o.img || 'dan_lien', o.sp || 560, o.co || 16, (G, d, M) => {
    if (M) { trung(M, dmg * (o.nhan ? o.nhan(M) : 1), { B, mau: o.mau }); if (o.trung) o.trung(G, d, M); }
    if (o.no) FX.no(o.no, d.x, d.y, o.noCo || 30, 0.25);
  }, o.duoi);
}
// tia phép nối 2 điểm (hiệu ứng ghép tác động lên ụ khác / bàn khác)
function tiaPhep(x0, y0, x1, y1, mau) { G.hu.push({ k: 'tiaPhep', t: 0, song: 0.55, x0, y0, x1, y1, mau }); }
// biến ụ tại chỗ thành loại khác (hộp bí ẩn, tiến hoá, xáo trộn…)
function chuyenU(B, T, id, sao) {
  const N = sinhU(taoU(B, id, clamp(sao, 1, LUAT.saoMax), T.o));
  N.goc = T.goc; N.anim = { k: 'no', t: 0 }; N.khien = T.khien;
  B.t[T.o] = N;
  const c = B.o[T.o];
  FX.vong1(c.x, c.y, 8, 52, TIERS[N.bac].mau, 0.45, 4); FX.tiaLua(c.x, c.y, 18, TIERS[N.bac].mau, 210, 12); FX.no('laser_trung', c.x, c.y, 70, 0.35);
  return N;
}
function deckTru(B, tru) { let ds = B.deck.filter(id => SKILLS[id] && !tru.includes(id)); if (!ds.length) ds = Object.keys(SKILLS).filter(id => G.rosterMap[id] && !tru.includes(id)); return ds; }
function nangSao(B, T, n, chu) {
  if (!T || T.sao >= LUAT.saoMax) return false;
  T.sao = Math.min(LUAT.saoMax, T.sao + (n || 1)); T.sang = 1; T.anim = { k: 'no', t: 0.25 };
  const c = B.o[T.o];
  FX.chu1(c.x, c.y - 20, '+' + (n || 1) + '★', '#ffe46b', 18, 'to'); FX.tiaLua(c.x, c.y, 14, '#ffe46b', 180, 11); FX.vong1(c.x, c.y, 6, 40, '#ffe46b', 0.4, 3);
  if (chu) nhanU(T, chu, '#ffe46b', true);
  return true;
}
// ụ hỗ trợ: quét chậm + vòng ping tới ô kề theo chu kỳ
function hoTroNhip(G, B, T, dt, rgb, chuKy, quay) {
  if (quay) T.goc += dt * quay; else xoayDau(T, null, dt);
  T.nhip = (T.nhip || 0) + dt / chuKy;
  if (T.nhip >= 1) { T.nhip = 0; const ke = keCan(B, T.o).filter(Boolean); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.7, T, ke, rgb }); }
}
function veQuaCau(ctx, R, n, r, t, mau, co) { // n quả cầu quay quanh tâm
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const a = t * 1.6 + i * Math.PI * 2 / n; R.anhGiua(ctx, R.cham1(mau), Math.cos(a) * r, Math.sin(a) * r * 0.8, co); }
}
function boMuc(G, B, T, dt, E) { xoayDau(T, E, dt); } // chỉ xoay theo mục tiêu

// ===================================================== TRẮNG =====================================================
SKILLS.xucxac = { // Pháo May Rủi (Fenrir): sát thương ngẫu nhiên 3–300%; chí mạng = luôn tối đa
  vai: 'tc', dmg: 19, toc: 0.9, nham: 'dau',
  mo: () => 'Mỗi phát 3–300% sát thương · chí mạng = 300%',
  ban(G, B, T, E) {
    giat(T, 0.9); const [x, y] = chopNong(T, 26); phutKhoi(x, y, 1); SND.phao();
    const crit = Math.random() < critU(T), roll = crit ? 300 : 3 + rint(298), dmg = dmgU(T) * roll / 100;
    danThang(B, T, E, 'dan_phao', 520, 15, (G, d, M) => {
      if (M) trung(M, dmg, { B, crit: false, mau: roll >= 240 ? '#ffd23f' : roll < 40 ? '#9aa6b4' : '#ffffff' });
      FX.tiaLua(d.x, d.y, roll >= 240 ? 12 : 3, '#ffd080', 170, 8);
      if (roll >= 240) { nhanU(T, roll === 300 ? 'TỐI ĐA 300%!' : 'XÚC XẮC ' + roll + '%', '#ffd23f'); FX.no('no_phao', d.x, d.y, 50, 0.3); }
    });
  },
};
SKILLS.phun = { // Súng Phun Loạn (Hairball): bắn cực nhanh vào quái ngẫu nhiên
  vai: 'tc', dmg: 3.9, toc: 4.4, tocSao: 0.08, nham: 'ngau',
  mo: (T) => 'Tốc bắn ' + tocU(T).toFixed(1) + '/s · mục tiêu ngẫu nhiên',
  ban(G, B, T, E) {
    giat(T, 0.22); const [x, y] = dauNong(T);
    FX.no('chop_nong', x, y, 16 + Math.random() * 6, 0.06, T.goc + rnd(-0.2, 0.2)); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_lien', 640, 12, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, 1, '#ffd080', 100, 6); });
  },
};
SKILLS.sungluc = { // Súng Lục (Girl detective): một phát lớn trúng tức thì vào quái đầu
  vai: 'tc', dmg: 46, toc: 0.45, nham: 'dau', crit: 0.1,
  mo: () => 'Phát lớn trúng tức thì · chí mạng 20%',
  ban(G, B, T, E) {
    giat(T, 1.6); const [x, y] = chopNong(T, 32); phutKhoi(x, y, 1); SND.tia();
    trung(E, dmgU(T), { B });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.2, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#ffd080' });
    FX.tiaLua(E.x, E.y, 6, '#ffd080', 170, 9);
    FX.hat1('bui', x - Math.cos(T.goc) * 16, y - Math.sin(T.goc) * 16, rnd(-40, 40), -50, 0.45, 3.5); // vỏ đạn văng
  },
};
SKILLS.maychem = { // Máy Chém (Scaffold): xác suất giết ngay quái nhỏ
  vai: 'tc', dmg: 13, toc: 1.0, nham: 'dau',
  tile: (T) => 0.03 + 0.006 * (T.sao - 1) + 0.004 * (lvU(T) - 1),
  mo: (T) => 'Giết ngay quái nhỏ ' + (SKILLS.maychem.tile(T) * 100).toFixed(1) + '% mỗi phát',
  ban(G, B, T, E) {
    giat(T, 0.8); chopNong(T, 22); SND.lien();
    const dmg = dmgU(T), tl = this.tile(T);
    danThang(B, T, E, 'dan_tia', 600, 18, (G, d, M) => {
      if (!M) return;
      if (!M.trum && !M.d.to && Math.random() < tl) {
        G.hu.push({ k: 'chem', t: 0, song: 0.4, x: M.x, y: M.y });
        trung(M, M.hp + 1, { B, crit: false, mau: '#ff4b3e' }); nhanU(T, 'CHÉM!', '#ff4b3e'); SND.no(0.3);
      } else trung(M, dmg, { B });
    });
  },
};
SKILLS.phagiap = { // Phá Giáp (Freya): gắn suy yếu, quái nhận thêm sát thương
  vai: 'tc', dmg: 9, toc: 1.0, nham: 'dau',
  k: (T) => 0.2 + 0.04 * (T.sao - 1) + 0.03 * (lvU(T) - 1),
  mo: (T) => 'Quái trúng nhận thêm ' + Math.round(SKILLS.phagiap.k(T) * 100) + '% sát thương · 5 s',
  chonMuc(G, B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s + (E.yeu > 1.5 ? 300 : 0); if (r < best) { best = r; m = E; } } return m; },
  ban(G, B, T, E) {
    giat(T, 0.6); chopNong(T, 22); SND.set();
    const dmg = dmgU(T), k = this.k(T);
    danThang(B, T, E, 'dan_tia', 520, 20, (G, d, M) => {
      if (!M) return;
      trung(M, dmg, { B, mau: '#d9a8ff' });
      if (!(M.yeu > 0)) FX.chu1(M.x, M.y - 24, 'SUY YẾU', '#d9a8ff', 10);
      M.yeu = 5; M.yeuK = Math.max(M.yeu > 0 && M.yeuK || 0, k);
      FX.no('dien', M.x, M.y, 34, 0.25);
    });
  },
};
SKILLS.bua = { // Búa Đẩy (Atalante): chí mạng đẩy lùi quái
  vai: 'tc', dmg: 17, toc: 0.8, nham: 'dau', crit: 0.08,
  day: (T) => 16 + 4 * T.sao,
  mo: (T) => 'Chí mạng 18% → đẩy lùi ' + SKILLS.bua.day(T) + ' px',
  ban(G, B, T, E) {
    giat(T, 1.3); chopNong(T, 26); SND.phao();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_phao', 480, 18, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.bui(d.x, d.y, 4, 6); });
  },
  khiCrit(G, T, E) {
    if (E.trum || E.chet) return;
    E.s = Math.max(0, E.s - this.day(T) * (E.d.to ? 0.5 : 1));
    FX.vong1(E.x, E.y, 6, 30, '#ffd080', 0.3, 3); FX.no('no_phao', E.x, E.y, 42, 0.3); FX.lac(1.5);
    nhanU(T, 'ĐẨY LÙI', '#ffd080');
  },
};
SKILLS.nam = { // Nắm Đấm Sắt (Vesta): cận chiến, đấm nổ tỏa tròn, rất nhanh — phải đứng sát đường
  vai: 'tc', dmg: 9, toc: 2.0, tocSao: 0.06, tam: 105,
  mo: (T) => 'Cận chiến tầm 105 px · nổ vòng 36 px · ' + tocU(T).toFixed(1) + ' cú/s',
  chonMuc(G, B, T) { return quaiDauTam(B, T, this.tam); },
  ban(G, B, T, E) {
    T.rv += 420; T.chop = 0.08; // đấm thụt tới trước rồi lò xo kéo về
    const dmg = dmgU(T);
    noLan(E.x, E.y, 36, dmg, B);
    FX.no('no_phao', E.x, E.y, 62, 0.25); FX.vong1(E.x, E.y, 6, 36, '#ffb35a', 0.25, 3); FX.bui(E.x, E.y, 4, 8); FX.lac(0.8); SND.dat();
    const [x, y] = dauNong(T); G.hu.push({ k: 'tiaTia', t: 0, song: 0.12, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#ffb35a' });
  },
};
SKILLS.bomhen = { // Bom Hẹn Giờ (Hecate): gắn bom vào quái ngẫu nhiên, 5 s nổ
  vai: 'tc', dmg: 12, toc: 0.55, nham: 'ngau',
  r: (T) => 34 + 3 * T.sao,
  mo: (T) => 'Gắn bom 5 s · nổ ×5 vùng ' + SKILLS.bomhen.r(T) + ' px',
  chonMuc(G, B, T) {
    if (T.muc && !T.muc.chet && !T.muc.bom && banDuocQuai(B, T.muc) && T.cd > 0.05) return T.muc;
    const ds = dsMucTieu(B).filter(E => !E.bom); return ds.length ? pick(ds) : null;
  },
  ban(G, B, T, E) {
    giat(T, 0.7); chopNong(T, 20); SND.nap();
    const dmg = dmgU(T) * 5, r = this.r(T);
    E.bom = true;
    danThang(B, T, E, 'dan_phao', 380, 13, (G, d, M) => { const Q = M || E; G.hu.push({ k: 'bom', t: 0, song: 5, E: Q, x: d.x, y: d.y, T, B, dmg, r }); });
  },
};

// ===================================================== XANH =====================================================
SKILLS.nhanmana = { // Máy Nhân Mana (Thisbe): khi GHÉP nhận nhiều mana
  vai: 'db', dmg: 9, toc: 0.9, nham: 'dau',
  luong: (sao, B) => Math.round(32 * sao * (1 + 0.25 * ((B.lv.nhanmana || 1) - 1))),
  mo: (T) => 'Khi ghép: +' + SKILLS.nhanmana.luong(T.sao, G.ban[T.ban]) + ' mana',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#d9a8ff', sp: 420 }); },
  ghep(G, B, a, b, ra) {
    const n = this.luong(a.sao, B); B.mana += n; B.manaNay += n;
    const c = B.o[b.o];
    FX.chu1(c.x, c.y - 46, '+' + n, '#d9a8ff', 18, 'mana');
    for (let i = 0; i < 16; i++) FX.hat1('lua', c.x + rnd(-20, 20), c.y + rnd(-10, 10), rnd(-30, 30), rnd(-110, -50), 0.7, 8, '#c77dff');
    nhanU(ra, 'NHÂN MANA', '#d9a8ff', true); if (!B.ai) SND.mana();
  },
};
SKILLS.kiembang = { // Kiếm Băng (Ymir): +400% sát thương vào quái đang bị chậm
  vai: 'tc', dmg: 14, toc: 1.0, nham: 'dau',
  mo: () => '+400% sát thương vào quái đang bị chậm',
  chonMuc(G, B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s - (E.chamT > 0 ? 400 : 0); if (r < best) { best = r; m = E; } } return m; },
  ban(G, B, T, E) {
    giat(T, 0.7); chopNong(T, 22); SND.bang();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_bang', 560, 22, (G, d, M) => {
      if (!M) return;
      const cham = M.chamT > 0;
      trung(M, dmg * (cham ? 5 : 1), { B, mau: cham ? '#7fdcff' : '#ffffff' });
      FX.no('bang_vo', d.x, d.y, cham ? 64 : 36, 0.3);
      if (cham) nhanU(T, 'BĂNG VỠ ×5', '#7fdcff');
    }, 'bang');
  },
};
SKILLS.chimang = { // Ăng-ten Chí Mạng (Siren): hỗ trợ +tỉ lệ chí mạng 4 ô kề
  vai: 'ht', dmg: 0, toc: 0,
  them: (T) => 0.08 + 0.03 * (T.sao - 1) + 0.02 * (lvU(T) - 1),
  mo: (T) => '+' + Math.round(SKILLS.chimang.them(T) * 100) + '% chí mạng cho 4 ô kề',
  hoTro(G, T, N) { N.buf.crit += this.them(T); },
  capNhat(G, B, T, dt) { hoTroNhip(G, B, T, dt, '255,210,63', 2.4, 0.9); return true; },
};
SKILLS.dichchuyen = { // Bệ Dịch Chuyển (Merlin): kéo thả lên ụ khác CÙNG SAO → đổi chỗ
  vai: 'db', dmg: 10, toc: 1.0, nham: 'dau',
  mo: () => 'Kéo lên ụ cùng sao: ĐỔI CHỖ (đưa ụ cận chiến ra mép)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#9fe6ff', sp: 480 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.ban === a.ban,
    lam(G, B, a, b) {
      const oa = a.o, ob = b.o, ca = B.o[oa], cb = B.o[ob];
      B.t[oa] = b; B.t[ob] = a; a.o = ob; b.o = oa;
      a.anim = { k: 'no', t: 0.2 }; b.anim = { k: 'no', t: 0.2 };
      for (const c of [ca, cb]) { FX.vong1(c.x, c.y, 30, 4, '#9fe6ff', 0.35, 4); FX.tiaLua(c.x, c.y, 12, '#9fe6ff', 160, 10); }
      tiaPhep(ca.x, ca.y, cb.x, cb.y, '#9fe6ff');
      nhanU(a, 'DỊCH CHUYỂN', '#9fe6ff', true);
      return a;
    },
  },
};
SKILLS.drone = { // Bệ Phóng Drone (Hermes): khi GHÉP phóng drone bom chạy ngược đường đâm quái
  vai: 'tc', dmg: 13, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: ' + (1 + Math.floor(T.sao / 3)) + ' drone bom ×24',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_lien', co: 14, snd: 'lien' }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 3), dmg = hsU('drone', a.sao + 1, B) * 24;
    const ds = G.duong.map((p, i) => i).filter(i => G.duong[i].ban === B.i);
    for (let i = 0; i < n; i++) {
      const pi = ds[i % ds.length], p = G.duong[pi];
      G.hu.push({ k: 'drone', t: -i * 0.4, song: 12, p: pi, s: p.len, x: 0, y: 0, goc: 0, B, T: ra, dmg, r: 46 });
    }
    nhanU(ra, 'PHÓNG DRONE ×' + n, '#4fb8ff', true); SND.nap();
  },
};
SKILLS.tron = { // Bộ Trộn (Zarramim): ghép với BẤT KỲ ụ nào (khác sao cũng được); sao = trung bình
  vai: 'db', dmg: 10, toc: 1.0, nham: 'dau',
  mo: () => 'Ghép với mọi ụ · sao = trung bình (cùng sao thì +1)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ffe46b', sp: 460 }); },
  ghepDB: {
    haiChieu: true,
    hopLe: (a, b) => b.id !== 'tron' && b.ban === a.ban && !(a.sao >= LUAT.saoMax && b.sao >= LUAT.saoMax),
    lam(G, B, a, b, dao) {
      const keo = dao ? b : a, dich = dao ? a : b; // ụ bị kéo biến mất, ô đích ra ụ mới
      const sao = Math.min(LUAT.saoMax, Math.ceil((a.sao + b.sao) / 2) + (a.sao === b.sao ? 1 : 0));
      B.t[keo.o] = null;
      G.bay.push({ id: keo.id, sao: keo.sao, x0: B.o[keo.o].x, y0: B.o[keo.o].y, x1: B.o[dich.o].x, y1: B.o[dich.o].y, t: 0, bac: keo.bac });
      const N = chuyenU(B, dich, pick(B.deck), sao);
      nhanU(N, 'TRỘN → ' + sao + '★', '#ffe46b', true);
      return N;
    },
  },
};
SKILLS.nangluong = { // Pháo Năng Lượng (Jupiter): sát thương tăng theo mana đang có
  vai: 'tc', dmg: 12, toc: 0.9, nham: 'dau',
  k: (B) => Math.min(5, B.mana / 120),
  mo: (T) => 'Mana hiện có → +' + Math.round(SKILLS.nangluong.k(G.ban[T.ban]) * 100) + '% (mỗi 120 mana +100%, tối đa +500%)',
  sangDau: (T) => SKILLS.nangluong.k(G.ban[T.ban]) * 0.12,
  ban(G, B, T, E) {
    const k = this.k(B);
    giat(T, 0.6 + k * 0.2); chopNong(T, 22 + k * 4); SND.set();
    const dmg = dmgU(T) * (1 + k);
    danThang(B, T, E, 'tia_lua', 420, 14 + k * 5, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#d9a8ff' }); FX.no('dien', d.x, d.y, 26 + k * 8, 0.25); });
    if (k >= 3) nhanU(T, 'QUÁ TẢI +' + Math.round(k * 100) + '%', '#d9a8ff');
  },
};
SKILLS.lanhgia = { // Máy Phát Lạnh (Neptune): hỗ trợ — ụ kề bắn kèm làm chậm
  vai: 'ht', dmg: 0, toc: 0,
  cham: (T) => 0.12 + 0.025 * (T.sao - 1) + 0.02 * (lvU(T) - 1),
  mo: (T) => 'Ụ kề bắn kèm chậm ' + Math.round(SKILLS.lanhgia.cham(T) * 100) + '% · 2 s',
  hoTro(G, T, N) { N.buf.cham = Math.max(N.buf.cham, this.cham(T)); },
  capNhat(G, B, T, dt) {
    hoTroNhip(G, B, T, dt, '127,220,255', 2.4, 0.6);
    if (Math.random() < dt * 4) { const c = tamU(T); FX.hat1('lua', c.x + rnd(-14, 14), c.y + rnd(-10, 10), rnd(-8, 8), rnd(-30, -10), 0.6, 5, '#bff4ff'); }
    return true;
  },
};
SKILLS.khuech = { // Bộ Khuếch Đại (Mars): hỗ trợ +sát thương cộng dồn cho 4 ô kề
  vai: 'ht', dmg: 0, toc: 0,
  them: (T) => 0.14 + 0.05 * (T.sao - 1) + 0.03 * (lvU(T) - 1),
  mo: (T) => '+' + Math.round(SKILLS.khuech.them(T) * 100) + '% sát thương 4 ô kề (cộng dồn)',
  hoTro(G, T, N) { N.buf.dmg += this.them(T); },
  capNhat(G, B, T, dt) { hoTroNhip(G, B, T, dt, '255,120,60', 2.0); return true; },
};
SKILLS.vungdoc = { // Bom Vũng Độc (Flora): ném vũng độc lên đường
  vai: 'tc', dmg: 7, toc: 1, napMau: '#9dff5a',
  ky: (T) => Math.max(2.6, 4.6 - 0.2 * T.sao),
  mo: (T) => 'Vũng độc ' + (28 + 2 * T.sao) + ' px · 5 s · mỗi ' + SKILLS.vungdoc.ky(T).toFixed(1) + ' s',
  capNhat(G, B, T, dt) {
    const E = quaiDau(B);
    xoayDau(T, E, dt);
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    if (T.nap >= 1 && E) {
      T.nap = 0; giat(T, 1.2); const [x, y] = chopNong(T, 24); SND.doc();
      const p = G.duong[E.p], [px, py] = viTri(p, Math.min(p.len - 8, E.s + 26)), dps = dmgU(T) * 3.5, r = 30 + 2 * T.sao;
      banDan({ img: 'dan_doc', x, y, px, py, sp: 220, co: 22, cong: 60, B, T, duoi: true,
        trung(G, d) { G.hu.push({ k: 'may', t: 0, song: 5, x: d.x, y: d.y, r, dps, B, tick: 0 }); FX.no('khoi_doc', d.x, d.y, r * 2.4, 0.5); FX.bui(d.x, d.y, 5, 6); } });
      nhanU(T, 'VŨNG ĐỘC', '#9dff5a');
    }
    return true;
  },
};
SKILLS.loa = { // Loa Hồi Chiêu (Melpomene): khi GHÉP giảm hồi chiêu kỹ năng Ma vương
  vai: 'db', dmg: 10, toc: 1.0, nham: 'dau',
  giam: (sao) => 3 + 1.5 * sao,
  mo: (T) => 'Khi ghép: hồi chiêu Ma vương −' + SKILLS.loa.giam(T.sao) + ' s (đã sẵn thì giá −15%)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 14, mau: '#ffe46b', sp: 440 }); const c = tamU(T); FX.vong1(c.x, c.y, 8, 22, '#ffe46b', 0.3, 2); },
  ghep(G, B, a, b, ra) {
    const mv = B.mv, g = this.giam(a.sao), c = B.o[b.o];
    if (mv.cd > 0) { mv.cd = Math.max(0, mv.cd - g); nhanU(ra, 'HỒI CHIÊU −' + g + 's', '#ffe46b', true); }
    else { mv.gia = Math.max(MAVUONG[mv.id].gia, Math.round(mv.gia * 0.85)); nhanU(ra, 'MA VƯƠNG −15% GIÁ', '#ffe46b', true); }
    for (let i = 0; i < 3; i++) FX.vong1(c.x, c.y, 10 + i * 6, 70 + i * 20, '#ffe46b', 0.5 + i * 0.12, 3);
  },
};
SKILLS.hutmana = { // Máy Hút Mana (Elizabeth): mỗi phát trúng nhận mana
  vai: 'db', dmg: 11, toc: 1.2, nham: 'dau',
  luong: (T) => (0.5 + 0.3 * (T.sao - 1)) * (1 + 0.2 * (lvU(T) - 1)),
  mo: (T) => '+' + SKILLS.hutmana.luong(T).toFixed(1) + ' mana mỗi phát trúng',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 16, mau: '#d9a8ff', sp: 560 }); },
  khiTrung(G, T, E) {
    const B = G.ban[T.ban]; if (!B) return;
    T.hut = (T.hut || 0) + this.luong(T);
    if (T.hut >= 3) {
      const n = Math.floor(T.hut); T.hut -= n; B.mana += n; B.manaNay += n;
      FX.hat1('lua', E.x, E.y, 0, -40, 0.4, 7, '#c77dff');
      if (conTren(T)) { const c = tamU(T); FX.chu1(c.x + 12, c.y - 18, '+' + n, '#d9a8ff', 11, 'mana'); }
    }
  },
};
SKILLS.min = { // Bệ Rải Mìn (Ptah): rải mìn trên đường; đôi khi mìn sao (×3)
  vai: 'tc', dmg: 9, toc: 1, napMau: '#ffb35a',
  ky: (T) => Math.max(2, 4 - 0.2 * T.sao),
  mo: (T) => 'Mìn ×7 mỗi ' + SKILLS.min.ky(T).toFixed(1) + ' s · ' + (3 + 0.5 * (T.sao - 1)).toFixed(1) + '% mìn sao ×3',
  capNhat(G, B, T, dt) {
    const ds = dsMucTieu(B);
    const E = ds.length ? ds[0] : null;
    if (T.minDichT > 0) T.minDichT -= dt; else T.minDich = null;
    xoayDau(T, T.minDich ? null : E, dt, T.minDich && T.minDich[0], T.minDich && T.minDich[1]);
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    const soMin = G.hu.filter(o => o.k === 'min' && o.T === T).length;
    if (T.nap >= 1 && E && soMin < 6) {
      const Q = pick(ds), p = G.duong[Q.p], [px, py] = viTri(p, Math.min(p.len - 16, Q.s + rnd(30, 110)));
      T.nap = 0; T.minDich = [px, py]; giat(T, 0.9); const [x, y] = chopNong(T, 20); SND.nap();
      const sao3 = Math.random() < 0.03 + 0.005 * (T.sao - 1), dmg = dmgU(T) * 7 * (sao3 ? 3 : 1);
      banDan({ img: 'dan_phao', x, y, px, py, sp: 240, co: 15, cong: 50, B, T,
        trung(G, d) { G.hu.push({ k: 'min', t: 0, song: 30, x: d.x, y: d.y, r: 36, dmg, B, T, sao3 }); FX.bui(d.x, d.y, 4, 5); } });
      if (sao3) nhanU(T, 'MÌN SAO ×3!', '#ffd23f', true);
      T.minDichT = 0.4;
    }
    return true;
  },
};

// ===================================================== TÍM =====================================================
SKILLS.cuongno = { // Súng Cuồng Nộ (Danu): chí mạng → chế độ bùng nổ tốc bắn 5 s
  vai: 'tc', dmg: 11, toc: 1.1, nham: 'dau', crit: 0.05,
  them: (T) => 1.5 + 0.15 * T.sao,
  mo: (T) => 'Chí mạng 15% → CUỒNG NỘ 5 s: +' + Math.round(SKILLS.cuongno.them(T) * 100) + '% tốc bắn',
  capNhat(G, B, T, dt) { if (T.cuongT > 0) { T.cuongT -= dt; T.buf.toc += this.them(T); } return false; },
  ban(G, B, T, E) {
    const r = T.cuongT > 0; giat(T, r ? 0.35 : 0.6);
    const [x, y] = dauNong(T); FX.no('chop_nong', x, y, r ? 26 : 22, 0.07, T.goc + rnd(-0.1, 0.1)); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_lien', 680, r ? 18 : 15, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, r ? 3 : 1, '#ff7a3a', 120, 7); });
  },
  khiCrit(G, T) { if (!(T.cuongT > 0)) { nhanU(T, 'CUỒNG NỘ!', '#ff5040', true); if (conTren(T)) { const c = tamU(T); FX.vong1(c.x, c.y, 10, 46, '#ff5040', 0.4, 4); } } T.cuongT = 5; },
  sangDau: (T) => T.cuongT > 0 ? 0.35 + 0.2 * Math.sin(G.t * 20) : 0,
  veThem(ctx, T, S, al, R) { if (T.cuongT > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.4 + 0.2 * Math.sin(R.t * 18)); R.anhGiua(ctx, R.cham1('#ff3b1a'), 0, 0, S * 1.5); } },
};
SKILLS.baotuyet = { // Bão Tuyết (Mayauel): định kỳ làm chậm TOÀN BỘ quái
  vai: 'tc', dmg: 9, toc: 1, napMau: '#bff4ff',
  ky: (T) => Math.max(5, 11 - 0.6 * T.sao),
  cham: (T) => Math.min(0.6, 0.3 + 0.03 * T.sao),
  mo: (T) => 'Mỗi ' + SKILLS.baotuyet.ky(T).toFixed(1) + ' s: chậm ' + Math.round(SKILLS.baotuyet.cham(T) * 100) + '% TOÀN BỘ quái 3 s',
  capNhat(G, B, T, dt) {
    T.goc += dt * 0.8; // quạt tuyết quay đều
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    const ds = dsMucTieu(B);
    if (T.nap >= 1 && ds.length) {
      T.nap = 0; T.sang = 1; giat(T, 0.8); SND.bang();
      const c = this.cham(T), dmg = dmgU(T) * 1.5;
      for (const E of ds) { E.chamT = Math.max(E.chamT, 3); if (!E.d.khangCham) E.cham = Math.max(E.cham, c); trung(E, dmg, { B, mau: '#bff4ff', im: true }); FX.no('bang_vo', E.x, E.y, 44, 0.4); }
      G.hu.push({ k: 'tuyet', t: 0, song: 1.4, B });
      FX.sang(0.22, '#bff4ff');
      nhanU(T, 'BÃO TUYẾT', '#bff4ff', true);
    }
    return true;
  },
};
SKILLS.nhanban = { // Máy Nhân Bản (Ivory): khi GHÉP gọi thêm 1 ụ 1 sao
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: () => 'Khi ghép: gọi thêm 1 ụ 1★ miễn phí',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghep(G, B, a, b, ra) {
    const N = trieu(B, true);
    if (N) { const c0 = B.o[b.o], c1 = B.o[N.o]; tiaPhep(c0.x, c0.y, c1.x, c1.y, '#c77dff'); nhanU(ra, 'NHÂN BẢN +1', '#c77dff', true); }
  },
};
SKILLS.lienket = { // Chuỗi Liên Kết (Won): mạnh hơn theo số ụ cùng loại nối liền kề
  vai: 'tc', dmg: 12, toc: 1.0, nham: 'dau',
  nhom(B, T) { // loang theo ô kề (trên-dưới-trái-phải)
    const da = new Set([T.o]), hang = [T.o];
    while (hang.length) { const o = hang.pop(); for (const N of keCan(B, o)) if (N && N.id === T.id && !da.has(N.o)) { da.add(N.o); hang.push(N.o); } }
    return da.size;
  },
  mo(T) { const n = this.nhom(G.ban[T.ban], T); return 'Chuỗi ' + n + ' ụ nối liền → +' + Math.round(0.4 * (n - 1) * 100) + '% sát thương'; },
  capNhat(G, B, T) { T.chuoi = this.nhom(B, T); T.buf.dmg += 0.4 * (T.chuoi - 1); return false; },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 22, 0.08, T.goc); SND.set();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 600, 16 + 2 * (T.chuoi || 1), (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#d9a8ff' }); FX.no('dien', d.x, d.y, 24 + 4 * (T.chuoi || 1), 0.2); });
  },
  veThem(ctx, T, S, al, R, B) { // dây năng lượng tới ụ cùng loại kề bên
    const c = B.o[T.o]; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.6;
    for (const N of keCan(B, T.o)) if (N && N.id === T.id) { const n = B.o[N.o]; R.tia(ctx, 'tia_set', 0, 0, (n.x - c.x) / 2, (n.y - c.y) / 2, 10, R.t * 120); }
  },
};
SKILLS.kepha = { // Kẹp Phá (Myrina): khi GHÉP — PVP làm chậm ụ đối thủ; CO-OP tăng tốc ụ đồng đội (SOLO: ụ mình)
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: PVP kẹp ' + (1 + Math.floor(T.sao / 2)) + ' ụ đối thủ −40% tốc · CO-OP/SOLO +' + Math.round((0.4 + 0.05 * T.sao) * 100) + '% tốc',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 2), c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const ds = D.t.filter(X => X && SKILLS[X.id].dmg).sort((x, y) => y.sao - x.sao).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#c77dff'); if (!chanKhien(D, X)) { X.st.kep = 5 + a.sao; FX.chu1(c.x, c.y - 20, 'BỊ KẸP', '#c77dff', 12, 'to'); } }
      nhanU(ra, 'KẸP PHÁ ×' + ds.length, '#c77dff', true);
    } else {
      const D = banKhac(B) || B;
      const ds = D.t.filter(X => X && X !== ra && SKILLS[X.id].dmg).sort((x, y) => y.sao - x.sao).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#4bff9a'); X.tocT = 6 + a.sao; X.tocV = 0.4 + 0.05 * a.sao; }
      nhanU(ra, D === B ? 'TĂNG TỐC ×' + ds.length : 'TIẾP SỨC ĐỒNG ĐỘI', '#4bff9a', true);
    }
  },
};
SKILLS.taylo = { // Máy Tẩy Lỗi (Gemina): khi GHÉP xoá hiệu ứng xấu cho N ụ
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: giải đóng băng/hoá đá/cháy/kẹp cho ' + (1 + T.sao) + ' ụ',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ffffff', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + a.sao, c0 = B.o[b.o];
    const xau = (X) => X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0;
    const ds = B.t.filter(X => X && xau(X)).slice(0, n);
    for (const X of ds) { X.st.bang = 0; X.st.da = false; X.st.lua = 0; X.st.kep = 0; const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ffffff'); FX.tiaLua(c.x, c.y, 12, '#ffffff', 160, 10); }
    nhanU(ra, ds.length ? 'TẨY LỖI ×' + ds.length : 'SẠCH LỖI', '#ffffff', true);
  },
};
SKILLS.khien = { // Máy Khiên (Mona): khi GHÉP khiên chặn 1 lần cho N ụ
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: khiên chặn 1 chiêu trùm/đối thủ cho ' + (1 + T.sao) + ' ụ',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_bang', co: 16, mau: '#9fe6ff', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + a.sao, c0 = B.o[b.o];
    const ds = B.t.filter(X => X && !(X.khien > 0)).sort((x, y) => y.sao - x.sao).slice(0, n);
    for (const X of ds) { X.khien = 1; const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#9fe6ff'); FX.vong1(c.x, c.y, 30, 10, '#9fe6ff', 0.4, 3); }
    nhanU(ra, 'KHIÊN ×' + ds.length, '#9fe6ff', true);
  },
};
SKILLS.hopbi = { // Hộp Bí Ẩn (Daron): sau 47 s biến thành ụ ngẫu nhiên 1–7 sao
  vai: 'db', dmg: 0, toc: 0, napMau: '#c77dff',
  mo: (T) => 'Mở sau ' + Math.max(0, 47 - T.tuoi).toFixed(0) + ' s → ụ ngẫu nhiên 1–7★',
  gocDau: (T, t) => -Math.PI / 2 + Math.sin(t * (6 + T.nap * 30)) * (0.05 + T.nap * T.nap * 0.35),
  capNhat(G, B, T) {
    T.nap = Math.min(1, T.tuoi / 47);
    if (T.nap >= 1) {
      const sao = 1 + rint(7), N = chuyenU(B, T, pick(deckTru(B, ['hopbi'])), sao);
      nhanU(N, 'HỘP MỞ: ' + sao + '★!', '#c77dff', true); FX.lac(3); SND.ghep();
    } else if (Math.random() < 0.02 + T.nap * 0.1) { const c = tamU(T); FX.hat1('lua', c.x + rnd(-12, 12), c.y + rnd(-12, 6), 0, -30, 0.5, 6, '#c77dff'); }
    return true;
  },
};
SKILLS.nangsao = { // Bệ Nâng Sao (Brownie): khi GHÉP không tự lên sao mà +1 sao cho 1 ụ khác
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: () => 'Khi ghép: ụ mới giữ sao cũ, +1★ cho 1 ụ khác',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ffe46b', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    ra.sao = a.sao;
    const ds = B.t.filter(X => X && X !== ra && X.sao < LUAT.saoMax && !X.st.da && X.id !== 'nangsao');
    if (!ds.length) { ra.sao = Math.min(LUAT.saoMax, a.sao + 1); return; }
    const X = pick(ds), c0 = B.o[b.o], c = B.o[X.o];
    tiaPhep(c0.x, c0.y, c.x, c.y, '#ffe46b'); nangSao(B, X, 1, 'NÂNG SAO');
  },
};
SKILLS.tuthan = { // Cột Tử Thần (Thanatos): hỗ trợ — ụ kề có xác suất giết ngay quái nhỏ
  vai: 'ht', dmg: 0, toc: 0,
  tile: (T) => 0.015 + 0.006 * (T.sao - 1) + 0.003 * (lvU(T) - 1),
  mo: (T) => 'Ụ kề: ' + (SKILLS.tuthan.tile(T) * 100).toFixed(1) + '% giết ngay quái nhỏ mỗi đòn',
  hoTro(G, T, N) { N.buf.chet += this.tile(T); },
  capNhat(G, B, T, dt) { hoTroNhip(G, B, T, dt, '199,125,255', 2.8, 0.5); return true; },
};
SKILLS.xaotron = { // Máy Xáo Trộn (Neban): khi GHÉP — PVP đổi ngẫu nhiên ụ đối thủ; CO-OP/SOLO tạo cặp ghép cho bàn đồng đội/mình
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: PVP xáo ' + (1 + Math.floor(T.sao / 2)) + ' ụ đối thủ · CO-OP/SOLO biến ụ lẻ thành ụ ghép được',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ff6ad5', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 2), c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const ds = D.t.filter(X => X && !X.st.da).sort(() => Math.random() - 0.5).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ff6ad5'); if (!chanKhien(D, X)) { const ds2 = D.deck.filter(id => id !== X.id && SKILLS[id]); chuyenU(D, X, ds2.length ? pick(ds2) : X.id, X.sao); } }
      nhanU(ra, 'XÁO TRỘN ĐỐI THỦ', '#ff6ad5', true);
    } else {
      const D = banKhac(B) || B; let k = 0;
      for (let i = 0; i < n; i++) {
        const ts = D.t.filter(X => X && X !== ra && !X.st.da && X.sao < LUAT.saoMax);
        const le = ts.filter(X => !ts.some(Y => Y !== X && Y.sao === X.sao && Y.id === X.id) && ts.some(Y => Y !== X && Y.sao === X.sao));
        if (!le.length) break;
        const X = le.sort((x, y) => x.sao - y.sao)[0], Y = ts.find(Y => Y !== X && Y.sao === X.sao);
        const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ff6ad5'); chuyenU(D, X, Y.id, X.sao); k++;
      }
      nhanU(ra, k ? 'TẠO CẶP ×' + k : 'XÁO TRỘN', '#ff6ad5', true);
    }
  },
};
SKILLS.epxung = { // Bộ Ép Xung (Pararamim): kéo lên ụ khác CÙNG SAO → ụ đó +65% tốc bắn vĩnh viễn
  vai: 'db', dmg: 9, toc: 1.0, nham: 'dau',
  mo: () => 'Kéo lên ụ cùng sao: ụ đó +65% tốc bắn (cộng dồn)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.id !== 'epxung' && b.ban === a.ban && !!SKILLS[b.id].dmg,
    lam(G, B, a, b) {
      B.t[a.o] = null;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
      b.epxung += 0.65; b.anim = { k: 'no', t: 0.25 }; b.sang = 1;
      const c = B.o[b.o]; FX.no('dien', c.x, c.y, 80, 0.4); FX.tiaLua(c.x, c.y, 16, '#ff9a3a', 200, 10);
      nhanU(b, 'ÉP XUNG +65%', '#ff9a3a', true);
      return b;
    },
  },
};
SKILLS.no5 = { // Nỏ Năm Nhịp (Amor): phát thứ 5 bắn 3 mũi tên nổ
  vai: 'tc', dmg: 12, toc: 1.0, nham: 'dau',
  mo: (T) => 'Phát thứ 5: 3 mũi nổ ×2 vùng 34 px · còn ' + (5 - (T.banLan % 5)) + ' phát',
  ban(G, B, T, E) {
    const dmg = dmgU(T);
    if (T.banLan % 5 === 0) {
      giat(T, 1.4); const [x, y] = chopNong(T, 32); SND.tia();
      const ds = dsMucTieu(B).filter(Q => Q !== E).sort((p, q) => Math.hypot(p.x - E.x, p.y - E.y) - Math.hypot(q.x - E.x, q.y - E.y));
      [E, ds[0] || E, ds[1] || E].forEach((Q, i) => {
        banDan({ img: 'dan_tia', x, y, muc: Q, px: Q.x, py: Q.y, sp: 520, co: 26, B, T,
          trung(G, d) { noLan(d.x, d.y, 34, dmg * 2, B, { mau: '#ff8af0' }); FX.no('no_phao', d.x, d.y, 70, 0.4); FX.vong1(d.x, d.y, 4, 34, '#ff8af0', 0.3, 3); SND.no(0.3); } });
      });
      nhanU(T, 'MŨI THỨ 5!', '#ff8af0', true);
    } else {
      giat(T, 0.7); chopNong(T, 22); SND.lien();
      danThang(B, T, E, 'dan_tia', 600, 18, (G, d, M) => { if (M) trung(M, dmg, { B }); });
    }
  },
  veThem(ctx, T, S, al) { // 5 chấm nhịp dưới bệ
    const k = T.banLan % 5;
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = al * (i < k ? 1 : 0.3); ctx.fillStyle = i < k ? '#ff8af0' : '#555'; ctx.beginPath(); ctx.arc((i - 2) * 6, S * 0.47, 2.2, 0, 7); ctx.fill(); }
  },
};
SKILLS.bao = { // Súng Bão (Pantheon): trúng tức thì, cực nhanh; chậm lại khi đứng cạnh ụ cùng loại
  vai: 'tc', dmg: 6.5, toc: 3.6, tocSao: 0.05, nham: 'dau',
  mo(T) { const n = keCan(G.ban[T.ban], T.o).filter(N => N && N.id === 'bao').length; return 'Trúng tức thì ' + tocU(T).toFixed(1) + '/s' + (n ? ' · cạnh ' + n + ' Súng Bão: −' + n * 30 + '% tốc' : ''); },
  capNhat(G, B, T) { const n = keCan(B, T.o).filter(N => N && N.id === 'bao').length; T.buf.toc -= 0.3 * n; return false; },
  ban(G, B, T, E) {
    giat(T, 0.3); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 20, 0.05, T.goc); SND.set();
    trung(E, dmgU(T), { B, mau: '#9ffcff' });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.09, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#9ffcff' });
    if (Math.random() < 0.4) FX.no('dien', E.x, E.y, 26, 0.15);
  },
};
SKILLS.anhsang = { // Tháp Ánh Sáng (Venus): quả cầu sáng = số sao; định kỳ gọi ụ 1 sao
  vai: 'tc', dmg: 8, toc: 0.9, nham: 'dau', napMau: '#fff6c0',
  ky: (T) => Math.max(9, 21 - 1.6 * T.sao),
  mo: (T) => T.sao + ' quả cầu · gọi 1 ụ 1★ mỗi ' + SKILLS.anhsang.ky(T).toFixed(0) + ' s',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap >= 1 && oTrong(B).length) {
      T.nap = 0; const N = trieu(B, true);
      if (N) { const c0 = tamU(T), c = B.o[N.o]; G.hu.push({ k: 'cauSang', t: 0, song: 0.45, x0: c0.x, y0: c0.y, x1: c.x, y1: c.y }); nhanU(T, 'GỌI Ụ ÁNH SÁNG', '#fff6c0', true); }
    }
    return false;
  },
  ban(G, B, T, E) {
    giat(T, 0.4); const [x, y] = dauNong(T); SND.mana();
    const dmg = dmgU(T) * (1 + 0.15 * T.sao);
    danThang(B, T, E, 'tia_lua', 420, 16, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#fff6c0' }); FX.tiaLua(d.x, d.y, 3, '#fff6c0', 120, 8); });
  },
  veThem(ctx, T, S, al, R) { ctx.globalAlpha = al * 0.9; veQuaCau(ctx, R, T.sao, S * 0.42, R.t + T.pha, '#fff6c0', S * 0.22); },
};

// ===================================================== VÀNG =====================================================
SKILLS.aten = { // Pháo Thanh Tẩy (Aten): +300% vào quái trúng độc; giết thì nổ lan
  vai: 'tc', dmg: 16, toc: 0.9, nham: 'dau',
  mo: () => '+300% vào quái trúng độc · giết → nổ lan ×2 vùng 50 px',
  chonMuc(G, B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s - (E.docT > 0 ? 400 : 0); if (r < best) { best = r; m = E; } } return m; },
  ban(G, B, T, E) {
    giat(T, 0.9); chopNong(T, 28); SND.tia();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 620, 24, (G, d, M) => {
      if (!M) return;
      const doc = M.docT > 0;
      trung(M, dmg * (doc ? 4 : 1), { B, mau: doc ? '#9dff5a' : '#ffe46b' });
      FX.no(doc ? 'laser_trung' : 'dien', d.x, d.y, doc ? 50 : 30, 0.25);
    });
  },
  khiGiet(G, T, E) {
    const B = G.ban[T.ban] || G.ban[0];
    noLan(E.x, E.y, 50, dmgU(T) * 2, B, { phu: true, mau: '#ffe46b' });
    FX.no('no_phao', E.x, E.y, 110, 0.45); FX.vong1(E.x, E.y, 6, 50, '#ffe46b', 0.35, 4); FX.lac(2);
    nhanU(T, 'THANH TẨY', '#ffe46b');
  },
};
SKILLS.dongbo = { // Pháo Đồng Bộ (Cosmem): mạnh hơn theo số ụ cùng sao trên bàn
  vai: 'tc', dmg: 13, toc: 1.0, nham: 'dau',
  dem: (B, T) => B.t.filter(X => X && X !== T && X.sao === T.sao).length,
  mo(T) { const n = this.dem(G.ban[T.ban], T); return n + ' ụ cùng ' + T.sao + '★ → +' + n * 30 + '% sát thương'; },
  capNhat(G, B, T) { T.dong = this.dem(B, T); T.buf.dmg += 0.3 * T.dong; return false; },
  sangDau: (T) => (T.dong || 0) * 0.04,
  ban(G, B, T, E) {
    giat(T, 0.8); chopNong(T, 26); SND.tia();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 640, 20 + (T.dong || 0) * 1.5, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffe46b' }); FX.no('dien', d.x, d.y, 30, 0.2); });
    if ((T.dong || 0) >= 5) nhanU(T, 'ĐỒNG BỘ ×' + T.dong, '#ffe46b');
  },
};
SKILLS.vughep = { // Vua Ghép (Aurora King): kéo lên ụ CÙNG SAO → ụ đó +1 sao (bản vàng 10% → +2)
  vai: 'db', dmg: 15, toc: 1.0, nham: 'dau',
  sinh(G, T) { T.vang = Math.random() < 0.1; },
  mo: (T) => 'Kéo lên ụ cùng sao: ụ đó +' + (T.vang ? 2 : 1) + '★ giữ nguyên loại' + (T.vang ? ' (BẢN VÀNG)' : ''),
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#ffe46b', sp: 480 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.sao < LUAT.saoMax && b.id !== 'vughep' && b.ban === a.ban,
    lam(G, B, a, b) {
      B.t[a.o] = null;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
      nangSao(B, b, a.vang ? 2 : 1, a.vang ? 'VUA VÀNG +2★' : 'VUA GHÉP +1★');
      return b;
    },
  },
  veThem(ctx, T, S, al, R) { if (T.vang) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.35 + 0.15 * Math.sin(R.t * 5)); R.anhGiua(ctx, R.cham1('#ffd23f'), 0, 0, S * 1.4); } },
};
SKILLS.sinhdoi = { // Máy Sinh Đôi (Berit): khi GHÉP gọi thêm 1 ụ cùng sao
  vai: 'db', dmg: 11, toc: 1.0, nham: 'dau',
  mo: (T) => 'Khi ghép: gọi thêm 1 ụ ' + T.sao + '★',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 17, sp: 580 }); },
  ghep(G, B, a, b, ra) {
    const N = trieu(B, true);
    if (N) { N.sao = a.sao; const c0 = B.o[b.o], c = B.o[N.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ffe46b'); nhanU(ra, 'SINH ĐÔI ' + a.sao + '★', '#ffe46b', true); }
  },
};
SKILLS.hasao = { // Súng Hạ Sao (Giltine): khi GHÉP — PVP −1 sao ụ đối thủ; CO-OP +1 sao ụ đồng đội (SOLO: ụ mình)
  vai: 'tc', dmg: 13, toc: 1.0, nham: 'dau',
  mo: () => 'Khi ghép: PVP −1★ ụ mạnh nhất đối thủ · CO-OP/SOLO +1★ cho 1 ụ',
  ban(G, B, T, E) { giat(T, 0.9); chopNong(T, 26); SND.tia(); const dmg = dmgU(T); danThang(B, T, E, 'dan_tia', 640, 20, (G, d, M) => { if (M) trung(M, dmg, { B }); }); },
  ghep(G, B, a, b, ra) {
    const c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const X = D.t.filter(X => X && X.sao >= 2).sort((x, y) => y.sao - x.sao)[0];
      if (X) { const c = D.o[X.o]; G.hu.push({ k: 'tiaTia', t: 0, song: 0.3, x0: c0.x, y0: c0.y, x1: c.x, y1: c.y, mau: '#ff3b3b' }); if (!chanKhien(D, X)) haSao(D, X); }
      nhanU(ra, 'HẠ SAO ĐỐI THỦ', '#ff4b3e', true); SND.tia();
    } else {
      const D = banKhac(B) || B;
      const ds = D.t.filter(X => X && X !== ra && X.sao <= a.sao && X.sao < LUAT.saoMax && !X.st.da);
      if (!ds.length) return;
      const X = pick(ds), c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ffe46b');
      nangSao(D, X, 1, D === B ? 'TĂNG SAO' : 'TẶNG SAO');
      nhanU(ra, D === B ? 'TĂNG SAO' : 'TĂNG SAO ĐỒNG ĐỘI', '#ffe46b', true);
    }
  },
};
SKILLS.saochep = { // Máy Sao Chép (Shamash): kéo lên ụ CÙNG SAO → thành bản sao của ụ đó (−50% sát thương)
  vai: 'db', dmg: 16, toc: 1.0, nham: 'dau',
  mo: () => 'Kéo lên ụ cùng sao: hoá thành bản sao (−50% sát thương)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#ffe46b', sp: 480 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.id !== 'saochep' && b.ban === a.ban,
    lam(G, B, a, b) {
      const N = chuyenU(B, a, b.id, a.sao); N.banSao = true;
      const c0 = B.o[b.o], c = B.o[N.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ffd23f');
      nhanU(N, 'SAO CHÉP', '#ffd23f', true);
      return N;
    },
  },
};
SKILLS.ngoisao = { // Pháo Ngôi Sao (Darby): tổng sao trên bàn là bội 10 → tăng tốc; ≥50 sao → +350% sát thương
  vai: 'tc', dmg: 14, toc: 1.0, nham: 'dau',
  tong: (B) => B.t.reduce((s, X) => s + (X ? X.sao : 0), 0),
  mo(T) { const n = this.tong(G.ban[T.ban]); return 'Tổng sao ' + n + (n % 10 === 0 ? ' (BỘI 10: +100% tốc)' : '') + (n >= 50 ? ' · ≥50: +350% sát thương' : ''); },
  capNhat(G, B, T) {
    const n = this.tong(B), boi = n % 10 === 0 && n > 0, thuc = n >= 50;
    if (boi) T.buf.toc += 1; if (thuc) T.buf.dmg += 3.5;
    if (boi && !T.boi) nhanU(T, 'BỘI 10 SAO!', '#ffe46b', true);
    if (thuc && !T.thucTinh) nhanU(T, 'THỨC TỈNH 50★', '#ffe46b', true);
    T.boi = boi; T.thucTinh = thuc;
    return false;
  },
  sangDau: (T) => (T.boi ? 0.25 : 0) + (T.thucTinh ? 0.3 : 0),
  ban(G, B, T, E) {
    giat(T, 0.7); chopNong(T, 24); SND.set();
    const dmg = dmgU(T);
    danThang(B, T, E, 'tia_lua', 560, T.thucTinh ? 26 : 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffe46b' }); FX.tiaLua(d.x, d.y, 4, '#ffe46b', 150, 8); });
  },
  veThem(ctx, T, S, al, R) { if (T.boi || T.thucTinh) { ctx.globalAlpha = al * 0.8; veQuaCau(ctx, R, T.thucTinh ? 5 : 3, S * 0.5, R.t * 1.5, '#ffe46b', S * 0.18); } },
};
SKILLS.soi = { // Sói Máy (Werewolf): cận chiến nhanh; 30% ra bản THỨC TỈNH: tốc ×2, luôn chí mạng
  vai: 'tc', dmg: 20, toc: 1.3, nham: 'dau', tam: 108,
  sinh(G, T) { T.thuc = Math.random() < 0.3; if (T.thuc) setTimeout(() => nhanU(T, 'SÓI THỨC TỈNH!', '#ff4b3e', true), 250); },
  mo: (T) => 'Cận chiến tầm 108 px (đặt sát đường)' + (T.thuc ? ' · THỨC TỈNH: tốc ×2, luôn chí mạng' : ' · 30% ra bản thức tỉnh'),
  luonCrit: (T) => !!T.thuc,
  chonMuc(G, B, T) { return quaiDauTam(B, T, this.tam); },
  capNhat(G, B, T) { if (T.thuc) T.buf.toc += 1; return false; },
  ban(G, B, T, E) {
    T.rv += 360; T.chop = 0.08; SND.dat();
    trung(E, dmgU(T), { B });
    noLan(E.x, E.y, 22, dmgU(T) * 0.4, B, { phu: true });
    G.hu.push({ k: 'vuot', t: 0, song: 0.22, x: E.x, y: E.y, goc: T.goc, mau: T.thuc ? '#ff4b3e' : '#ffe46b' });
  },
  sangDau: (T) => T.thuc ? 0.2 + 0.1 * Math.sin(G.t * 8) : 0,
  veThem(ctx, T, S, al, R) { if (T.thuc) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.35 + 0.15 * Math.sin(R.t * 9)); R.anhGiua(ctx, R.cham1('#ff2a1a'), 0, 0, S * 1.45); if (Math.random() < 0.15) { const c = tamU(T); FX.hat1('than', c.x + rnd(-14, 14), c.y + rnd(-6, 12), 0, -30, 0.6, 5, '#ff4b3e'); } } },
};
SKILLS.tienhoa = { // Hộp Tiến Hoá (Moa): sau một lúc biến thành ụ ngẫu nhiên +1 sao (sao càng cao càng lâu)
  vai: 'db', dmg: 0, toc: 0, napMau: '#ffd23f',
  can: (T) => 20 + 6 * T.sao,
  mo: (T) => 'Tiến hoá sau ' + Math.max(0, SKILLS.tienhoa.can(T) - T.tuoi).toFixed(0) + ' s → ụ ngẫu nhiên ' + Math.min(7, T.sao + 1) + '★',
  gocDau: (T, t) => -Math.PI / 2 + t * (0.4 + T.nap * 3),
  sangDau: (T) => T.nap * T.nap * 0.5,
  capNhat(G, B, T) {
    T.nap = Math.min(1, T.tuoi / this.can(T));
    if (T.nap >= 1) {
      const N = chuyenU(B, T, pick(deckTru(B, ['tienhoa'])), T.sao + 1);
      nhanU(N, 'TIẾN HOÁ +1★', '#ffd23f', true); FX.sang(0.15, '#ffd23f'); SND.ghep();
    }
    return true;
  },
};
SKILLS.cauvong = { // Máy Cầu Vồng (Yuna): vẽ cầu vồng lên đường — SOLO/CO-OP quái yếu đi; PVP vẽ lên đường đối thủ: quái trâu hơn
  vai: 'tc', dmg: 11, toc: 0.9, nham: 'dau', napMau: '#ff6ad5',
  k: (T) => 0.3 + 0.06 * (T.sao - 1),
  mo: (T) => 'Mỗi 7 s vẽ cầu vồng: quái trên đó nhận +' + Math.round(SKILLS.cauvong.k(T) * 100) + '% sát thương (PVP: quái đối thủ −25% sát thương nhận)',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / 7);
    if (T.nap < 1) return false;
    let pi = -1, s0 = 0;
    const L = 90 + 10 * T.sao;
    if (G.che === 'pvp') { const D = banKhac(B); pi = G.duong.findIndex(p => D && p.ban === D.i); if (pi >= 0) s0 = G.duong[pi].len * rnd(0.3, 0.6); }
    else { const E = quaiDau(B); if (E) { pi = E.p; s0 = clamp(E.s + 10, 0, G.duong[pi].len - L); } }
    if (pi < 0) return false;
    T.nap = 0; giat(T, 0.8); chopNong(T, 24); SND.mana();
    const p = G.duong[pi], pts = [];
    for (let s = s0; s <= s0 + L; s += 8) pts.push(viTri(p, s));
    G.hu.push({ k: 'cauvong', t: 0, song: 6 + 0.5 * T.sao, pts, k2: this.k(T), pvp: G.che === 'pvp', T, B });
    nhanU(T, G.che === 'pvp' ? 'CẦU VỒNG ĐỐI THỦ' : 'CẦU VỒNG', '#ff6ad5', true);
    return false;
  },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#ff6ad5', sp: 500, snd: 'mana' }); },
};

// ===================================================== ĐỎ (Cổ đại, có kỹ năng chủ động: CHẠM Ụ khi nạp đầy) =====================================================
SKILLS.lophanung = { // Lò Phản Ứng Băng (Devil Cider Liza): hào quang làm chậm quanh; càng chậm càng đau; chủ động: BÃO BĂNG
  vai: 'tc', dmg: 14, toc: 1, napMau: '#9fe6ff',
  r: (T) => 110 + 5 * T.sao,
  mo: (T) => 'Hào quang ' + SKILLS.lophanung.r(T) + ' px: chậm ' + Math.round((0.35 + 0.03 * T.sao) * 100) + '%, càng chậm càng đau · CHẠM khi đầy: ĐÓNG BĂNG mọi quái quanh 2,5 s',
  capNhat(G, B, T, dt) {
    const r = this.r(T), ds = quaiTrongTam(B, T, r);
    xoayDau(T, ds.length ? quaiDauTam(B, T, r) : null, dt);
    T.nap = Math.min(1, T.nap + dt / 24);
    T.tick = (T.tick || 0) - dt * (1 + T.buf.toc);
    if (T.tick <= 0) {
      T.tick = 0.4;
      const c = 0.35 + 0.03 * T.sao, d0 = dmgU(T) * 0.4;
      for (const E of ds) { E.chamT = Math.max(E.chamT, 1); if (!E.d.khangCham) E.cham = Math.max(E.cham, c); trung(E, d0 * (1 + 4 * (E.d.khangCham ? c : E.cham)), { B, mau: '#bff4ff', crit: false }); if (Math.random() < 0.3) FX.hat1('lua', E.x, E.y, rnd(-10, 10), -20, 0.4, 6, '#bff4ff'); }
      if (ds.length && !B.ai) SND.bang();
    }
    if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && T.napDay > 6 && this.aiNen(G, B, T)) this.chuDong(G, B, T); } else T.napDay = 0;
    return true;
  },
  aiNen: (G, B, T) => quaiTrongTam(B, T, SKILLS.lophanung.r(T) * 1.6).length >= 5 || G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E)),
  chuDong(G, B, T) {
    if (T.nap < 1) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2);
    const c = tamU(T), r = this.r(T) * 1.6;
    for (const E of quaiTrongTam(B, T, r)) { E.chan = 2.5; E.chamT = Math.max(E.chamT, 3); trung(E, dmgU(T) * 8, { B, mau: '#bff4ff' }); FX.no('bang_vo', E.x, E.y, 70, 0.5); }
    FX.vong1(c.x, c.y, 20, r, '#bff4ff', 0.6, 6); FX.sang(0.4, '#bff4ff'); FX.lac(6); SND.mv(); SND.bang();
    nhanU(T, 'BÃO BĂNG!', '#bff4ff', true);
    return true;
  },
  veThem(ctx, T, S, al, R) { // vùng lạnh quanh lò: vòng gạch quay + quầng
    const r = this.r(T);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = al * 0.18; R.anhGiua(ctx, R.cham1('#7fdcff'), 0, 0, r * 1.2);
    ctx.globalAlpha = al * 0.4; ctx.strokeStyle = '#bff4ff'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -R.t * 20;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    if (T.nap >= 1) { ctx.globalAlpha = al * (0.5 + 0.4 * Math.sin(R.t * 8)); R.anhGiua(ctx, R.cham1('#ffffff'), 0, -S * 0.62, 18); }
  },
};
SKILLS.haoquang = { // Hào Quang Thánh (Halo Mona): tia thánh quang; chủ động: khiên bất tử toàn bàn + giải hiệu ứng xấu + tăng tốc
  vai: 'tc', dmg: 22, toc: 1.1, nham: 'dau', napMau: '#fff6c0',
  ky: (T) => Math.max(18, 32 - 2 * T.sao),
  mo: (T) => 'Tia thánh quang lan 26 px · CHẠM khi đầy: khiên bất tử toàn bàn ' + (3 + 0.5 * T.sao).toFixed(1) + ' s + giải hiệu ứng xấu + 30% tốc',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && this.aiNen(G, B, T) && (T.napDay > 0.3)) this.chuDong(G, B, T); } else T.napDay = 0;
    return false;
  },
  // tự bật khi trùm đang ngắm bàn mình / ụ đang dính hiệu ứng xấu (người chơi vẫn có thể chạm để bật sớm)
  aiNen: (G, B) => G.quai.some(E => E.trum && E.bao && E.ban === B.i) || B.t.some(X => X && (X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0)),
  chuDong(G, B, T) {
    if (T.nap < 1) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1;
    const tg = 3 + 0.5 * T.sao;
    B.khien = Math.max(B.khien, tg);
    for (const X of B.t) if (X) { X.st.bang = 0; X.st.da = false; X.st.lua = 0; X.st.kep = 0; X.st.ngam = 0; X.tocT = Math.max(X.tocT, tg); X.tocV = Math.max(X.tocV, 0.3); }
    const c = tamU(T);
    FX.vong1(c.x, c.y, 20, 260, '#fff6c0', 0.7, 6); FX.sang(0.45, '#fff6c0'); SND.mv();
    for (const X of B.t) if (X && X !== T) { const n = B.o[X.o]; tiaPhep(c.x, c.y, n.x, n.y, '#fff6c0'); }
    nhanU(T, 'HÀO QUANG BẤT TỬ!', '#fff6c0', true);
    return true;
  },
  ban(G, B, T, E) {
    giat(T, 0.9); const [x, y] = chopNong(T, 26); SND.tia();
    const dmg = dmgU(T);
    trung(E, dmg, { B, mau: '#fff6c0' }); noLan(E.x, E.y, 26, dmg * 0.4, B, { phu: true, mau: '#fff6c0' });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.25, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#fff6c0' });
    FX.no('laser_trung', E.x, E.y, 40, 0.25);
  },
  veThem(ctx, T, S, al, R) { if (T.nap >= 1) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.35 + 0.25 * Math.sin(R.t * 6)); R.anhGiua(ctx, R.cham1('#fff6c0'), 0, 0, S * 1.6); } },
};

// ===================================================== HIỆU ỨNG TRÊN SÂN (mới) =====================================================
HU.tiaPhep = { // tia nối khi kỹ năng ghép tác động lên ụ khác
  ve(ctx, o, R) {
    const u = o.t / o.song, e = Math.min(1, u * 3);
    const x = o.x0 + (o.x1 - o.x0) * e, y = o.y0 + (o.y1 - o.y0) * e;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u;
    R.tia(ctx, 'tia_laser', o.x0, o.y0, x, y, 8, o.t * 300);
    R.anhGiua(ctx, R.cham1(o.mau), x, y, 34 * (1 - u * 0.5));
    if (u > 0.3) R.anhGiua(ctx, R.cham1(o.mau), o.x1, o.y1, 60 * (1 - u));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.chem = { // máy chém: lưỡi sáng rơi từ trên xuống
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / 0.12), y0 = o.y - 70, y1 = y0 + 70 * u;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = o.t < 0.12 ? 1 : Math.max(0, 1 - (o.t - 0.12) / 0.28);
    R.tia(ctx, 'dan_tia', o.x, y0, o.x, y1, 26, 0, true);
    if (o.t >= 0.12) { R.anhGiua(ctx, R.cham1('#ff4b3e'), o.x, o.y, 60); if (!o.no) { o.no = true; FX.no('no_phao', o.x, o.y, 50, 0.3); FX.tiaLua(o.x, o.y, 10, '#ff4b3e', 180); } }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.bom = { // bom hẹn giờ dính trên quái, đếm ngược rồi nổ
  cap(G, o) {
    if (o.E && !o.E.chet) { o.x = o.E.x; o.y = o.E.y; }
    if (o.t >= o.song - 0.02) this.no(o);
  },
  het(G, o) { this.no(o); },
  no(o) {
    if (o.daNo) return; o.daNo = true; if (o.E) o.E.bom = false;
    G.dangBan = o.T;
    noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#ffb35a' });
    FX.no('no_phao', o.x, o.y, o.r * 2.6, 0.5); FX.vong1(o.x, o.y, 4, o.r, '#ffb35a', 0.35, 4); FX.tiaLua(o.x, o.y, 14, '#ffb060', 220); FX.lac(3); SND.no(0.6);
  },
  ve(ctx, o, R) {
    const con = Math.max(0, o.song - o.t), nhay = con < 1.5 ? Math.sin(o.t * 40) > 0 : Math.sin(o.t * 10) > 0;
    R.anhGiua(ctx, 'dan_phao', o.x + 8, o.y - 10, 15, -0.6);
    if (nhay) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1('#ff3b3b'), o.x + 8, o.y - 14, 16); ctx.globalCompositeOperation = 'source-over'; }
    ctx.font = '900 11px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
    ctx.strokeText(Math.ceil(con) + '', o.x + 8, o.y - 20); ctx.fillStyle = con < 1.5 ? '#ff4b3e' : '#ffe46b'; ctx.fillText(Math.ceil(con) + '', o.x + 8, o.y - 20);
  },
};
HU.drone = { // drone bom bay ngược đường từ lõi về cổng, đâm quái đầu tiên gặp
  cap(G, o, dt) {
    if (o.t < 0) return false;
    const p = G.duong[o.p];
    o.s -= 170 * dt;
    [o.x, o.y, o.goc] = viTri(p, o.s); o.goc += Math.PI;
    if (Math.random() < dt * 30) FX.hat1('lua', o.x - Math.cos(o.goc) * 10, o.y - Math.sin(o.goc) * 10, rnd(-10, 10), rnd(-10, 10), 0.25, 6, '#7fdcff');
    for (const E of dsMucTieu(o.B)) if (Math.hypot(E.x - o.x, E.y - o.y) < 16 + E.d.co * 0.3) {
      noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#9fe6ff' });
      FX.no('no_phao', o.x, o.y, o.r * 2.6, 0.5); FX.no('dien', o.x, o.y, o.r * 2, 0.4); FX.lac(4); SND.no(0.7);
      return true;
    }
    return o.s <= 0;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(o.x + 3, o.y + 10, 10, 4, 0, 0, 7); ctx.fill();
    const bob = Math.sin(o.t * 14) * 1.5;
    ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1('#7fdcff'), o.x - Math.cos(o.goc) * 12, o.y - Math.sin(o.goc) * 12 + bob, 20); ctx.globalCompositeOperation = 'source-over';
    R.anhGiua(ctx, 'drone_nong', o.x, o.y - 4 + bob, 34, o.goc);
  },
};
HU.min = { // mìn trên đường
  duoi: true,
  cap(G, o) {
    if (o.t < 0.3) return false;
    for (const E of dsMucTieu(o.B)) if (Math.hypot(E.x - o.x, E.y - o.y) < 12 + E.d.co * 0.3) {
      noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: o.sao3 ? '#ffd23f' : '#ffb35a' });
      FX.no('no_phao', o.x, o.y, o.r * (o.sao3 ? 3.6 : 2.6), 0.5); FX.bui(o.x, o.y, 6, 8); FX.lac(o.sao3 ? 5 : 2.5); SND.no(o.sao3 ? 0.9 : 0.45);
      if (o.sao3) FX.tiaLua(o.x, o.y, 20, '#ffd23f', 240, 12);
      return true;
    }
    return false;
  },
  ve(ctx, o, R) {
    R.anhGiua(ctx, 'dan_phao', o.x, o.y, o.sao3 ? 18 : 14, 0);
    if (Math.sin(o.t * 6 + o.x) > 0.3) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1(o.sao3 ? '#ffd23f' : '#ff3b3b'), o.x, o.y - 3, o.sao3 ? 22 : 12); ctx.globalCompositeOperation = 'source-over'; }
  },
};
HU.cauvong = { // cầu vồng trên đường
  duoi: true,
  cap(G, o) {
    for (const E of G.quai) {
      if (E.chet) continue;
      let gan = false; for (const q of o.pts) if (Math.abs(q[0] - E.x) < 20 && Math.abs(q[1] - E.y) < 20) { gan = true; break; }
      if (!gan) continue;
      if (o.pvp) { if (G.duong[E.p].ban !== o.B.i) E.giapT = 0.6; }
      else { E.cvT = 0.6; E.cvK = Math.max(E.cvT > 0 && E.cvK || 0, o.k2); }
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = Math.min(1, o.t / 0.3) * (u > 0.85 ? (1 - u) / 0.15 : 1);
    const mau = ['#ff4b6b', '#ff9a3a', '#ffe46b', '#4bff9a', '#4fb8ff', '#c77dff'];
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const n = Math.max(2, Math.floor(o.pts.length * Math.min(1, o.t / 0.5)));
    for (let k = 0; k < mau.length; k++) {
      const lech = (k - 2.5) * 3.2;
      ctx.strokeStyle = mau[k]; ctx.globalAlpha = a * 0.55; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < n; i++) { const [x, y, g] = o.pts[i]; const px = x - Math.sin(g) * lech, py = y + Math.cos(g) * lech; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    if (Math.random() < 0.3) { const q = pick(o.pts); FX.hat1('lua', q[0] + rnd(-10, 10), q[1] + rnd(-10, 10), 0, -20, 0.5, 5, pick(mau)); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
  },
};
HU.tuyet = { // bão tuyết: tuyết rơi khắp sân
  cap(G, o, dt) { if (o.t < 0.8) for (let i = 0; i < 4; i++) FX.hat1('lua', rnd(0, W), rnd(-20, H * 0.9), rnd(-40, -10), rnd(120, 220), 0.9, rnd(3, 6), '#e8fbff'); return false; },
};
HU.cauSang = { // quả cầu ánh sáng bay tới ô được gọi ụ
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / o.song), e = u * u * (3 - 2 * u);
    const x = o.x0 + (o.x1 - o.x0) * e, y = o.y0 + (o.y1 - o.y0) * e - Math.sin(u * Math.PI) * 40;
    ctx.globalCompositeOperation = 'lighter';
    R.anhGiua(ctx, R.cham1('#fff6c0'), x, y, 30); R.anhGiua(ctx, 'tia_lua', x, y, 22, o.t * 8, 1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.vuot = { // vết cào của Sói Máy
  ve(ctx, o, R) {
    const u = o.t / o.song;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u;
    for (let k = -1; k <= 1; k++) {
      const g = o.goc + Math.PI / 2 + 0.5, nx = Math.cos(o.goc) * k * 7, ny = Math.sin(o.goc) * k * 7;
      const L = 18 * Math.min(1, u * 4);
      R.tia(ctx, 'dan_tia', o.x + nx - Math.cos(g) * L, o.y + ny - Math.sin(g) * L, o.x + nx + Math.cos(g) * L, o.y + ny + Math.sin(g) * L, 9, 0, true);
    }
    R.anhGiua(ctx, R.cham1(o.mau), o.x, o.y, 40 * (1 - u));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
