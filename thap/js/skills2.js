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
const hsU = (id, sao, B) => (SKILLS[id].dmg || 10) * TIERS[G.rosterMap[id].bac].hs * (1 + 0.85 * (sao - 1)) * hsLv(B, id);
// nhãn kỹ năng ngắn hiện trên ụ khi kỹ năng kích hoạt
function nhanU(T, s, mau, ep) {
  return; // BỎ nhãn chữ nổi trên ô (SHATTER ×5, CLONE +1…) — người dùng: vô dụng, rối bàn; buff/kỹ năng đã có hiệu ứng ảnh ChatGPT. Chỉ giữ số sát thương + tấm kết quả ghép.
  if (G._treNhan && typeof VX !== 'undefined') { const d = G._treNhan; VX.hen(d, () => nhanU(T, s, mau, ep)); return; } // đang ghép: hiện lúc kết quả lộ ra
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
function chuyenU(B, T, id, sao, doi) {
  const N = sinhU(taoU(B, id, clamp(sao, 1, LUAT.saoMax), T.o));
  N.goc = T.goc; N.khien = T.khien;
  B.t[T.o] = N;
  if (doi) { VX.doi(N, T); mocMoi(N, T.sao, 0.62); return N; } // Hộp Bí Ẩn / Hộp Tiến Hoá: màn biến hình ăn mừng ~750 ms
  N.anim = { k: 'no', t: 0 };
  const c = B.o[T.o];
  FX.vong1(c.x, c.y, 8, 52, TIERS[N.bac].mau, 0.45, 4); FX.tiaLua(c.x, c.y, 18, TIERS[N.bac].mau, 210, 12); FX.no('laser_trung', c.x, c.y, 70, 0.35);
  return N;
}
// DẠNG cố định của 1 ụ (quay lúc sinh): Merge King vàng, Sói thức tỉnh — bản sao / con rối online giữ đúng dạng, không quay lại
const BIEN_THE = { vughep: 'vang', soi: 'thuc' };
function giuBienThe(N, X) { const k = N && X && N.id === X.id && BIEN_THE[N.id]; if (k) N[k] = !!X[k]; return N; }
function deckTru(B, tru) { let ds = B.deck.filter(id => SKILLS[id] && !tru.includes(id)); if (!ds.length) ds = Object.keys(SKILLS).filter(id => G.rosterMap[id] && !tru.includes(id)); return ds; }
function nangSao(B, T, n, chu) {
  if (!T || T.sao >= LUAT.saoMax) return false;
  const saoCu = T.sao;
  T.sao = Math.min(LUAT.saoMax, T.sao + (n || 1)); T.sang = 1; T.anim = { k: 'no', t: 0.25 };
  mocMoi(T, saoCu, 0.1);
  const c = B.o[T.o];
  FX.chu1(c.x, c.y - 20, '+' + (n || 1) + '★', '#ffe46b', 18, 'to'); FX.tiaLua(c.x, c.y, 14, '#ffe46b', 180, 11); FX.vong1(c.x, c.y, 6, 40, '#ffe46b', 0.4, 3);
  if (chu) nhanU(T, chu, '#ffe46b', true);
  return true;
}
// ụ hỗ trợ: quét chậm + vòng ping tới ô kề theo chu kỳ
function hoTroNhip(G, B, T, dt, rgb, chuKy, quay) {
  if (quay) T.goc += dt * quay; else xoayDau(T, null, dt);
  T.nhip = (T.nhip || 0) + dt / chuKy;
  if (T.nhip >= 1) { T.nhip = 0; const ke = keCan(B, T.o).filter(Boolean); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.18, T, ke, rgb }); }
}
function veQuaCau(ctx, R, n, r, t, mau, co) { // n quả cầu quay quanh tâm
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const a = t * 1.6 + i * Math.PI * 2 / n; R.anhGiua(ctx, R.cham1(mau), Math.cos(a) * r, Math.sin(a) * r, co); }
}
function boMuc(G, B, T, dt, E) { xoayDau(T, E, dt); } // chỉ xoay theo mục tiêu
// hệ số nhịp nạp của ụ tự quản lý nhịp (xung / khoá / truy nã): như tốc bắn — buff tốc, Ép Xung, bị Kẹp/Nhiễu −40% (QA Tím)
const nhipU = (T) => Math.max(0.1, 1 + T.buf.toc + (T.epxung || 0)) * (T.st && T.st.kep > 0 ? 0.6 : 1);

// ===================================================== TRẮNG =====================================================
SKILLS.xucxac = { // Pháo May Rủi (Fenrir): sát thương ngẫu nhiên 3–300%; chí mạng = luôn tối đa
  vai: 'tc', dmg: 16, toc: 0.8, nham: 'dau', // đợt vai trò: DPS trung bình về ngân sách Thường (mục 6A)
  mo: () => 'Each shot 3–300% damage · crit = 300%',
  ban(G, B, T, E) {
    giat(T, 0.9); const [x, y] = chopNong(T, 26); phutKhoi(x, y, 1); SND.phao();
    const chac = !!T._critChac; if (chac) T._critChac = false; // Crit Antenna 7★: cú chắc chắn chí mạng = cú tối đa (không nhân đôi thêm)
    const crit = chac || Math.random() < critU(T), roll = crit ? 300 : 3 + rint(298), dmg = dmgU(T) * (crit ? 1.5 : roll / 100); // chí mạng: 150% × (2 + sát thương chí mạng) = 300% (+ Hammer/Focus Lens)
    danThang(B, T, E, 'dan_phao', 520, 15, (G, d, M) => {
      if (M) trung(M, dmg, { B, crit, mau: roll >= 240 ? '#ffd23f' : roll < 40 ? '#9aa6b4' : '#ffffff' });
      FX.tiaLua(d.x, d.y, roll >= 240 ? 12 : 3, '#ffd080', 170, 8);
      if (roll >= 240) { buffNo(T, roll === 300 ? 'max' : 'dmg', (roll - 200) / 100); FX.no('no_phao', d.x, d.y, 50, 0.3); }
    });
  },
};
SKILLS.phun = { // Súng Phun Loạn (Hairball): bắn cực nhanh vào quái ngẫu nhiên
  vai: 'tc', dmg: 3.43, toc: 5, tocSao: 0.08, nham: 'ngau',
  mo: () => 'random targets · each ★ +8% fire rate',
  ban(G, B, T, E) {
    giat(T, 0.22); const [x, y] = dauNong(T);
    FX.no('chop_nong', x, y, 16 + Math.random() * 6, 0.06, T.goc + rnd(-0.2, 0.2)); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_lien', 640, 12, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, 1, '#ffd080', 100, 6); });
    T.muc = null; // phát sau chọn quái NGẪU NHIÊN mới (cũ: ở 60 khung/s cửa sổ đổi mục tiêu cd ≤ 0.05 bị nhảy qua → bám 1 con)
  },
};
SKILLS.sungluc = { // Súng Lục (Girl detective): một phát lớn trúng tức thì vào quái đầu
  vai: 'tc', dmg: 34.5, toc: 0.6, nham: 'dau', crit: 0.1,
  mo: () => 'Heavy instant shot · 20% crit',
  ban(G, B, T, E) {
    giat(T, 1.6); const [x, y] = chopNong(T, 32); phutKhoi(x, y, 1); SND.tia();
    trung(E, dmgU(T), { B });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.2, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#ffd080' });
    FX.tiaLua(E.x, E.y, 6, '#ffd080', 170, 9);
    FX.hat1('bui', x - Math.cos(T.goc) * 16, y - Math.sin(T.goc) * 16, rnd(-40, 40), -50, 0.45, 3.5); // vỏ đạn văng
  },
};
SKILLS.maychem = { // Máy Chém (Scaffold): xác suất giết ngay quái nhỏ
  vai: 'tc', dmg: 16.25, toc: 0.8, nham: 'dau',
  tile: (T) => 0.0375 + 0.0075 * (T.sao - 1) + 0.005 * (lvU(T) - 1), // ×1.25: bắn chậm hơn (0.8/s) nên mỗi phát chém dễ hơn
  mo: (T) => 'Instant-kill small enemies ' + (SKILLS.maychem.tile(T) * 100).toFixed(1) + '% per shot',
  ban(G, B, T, E) {
    giat(T, 0.8); chopNong(T, 22); SND.lien();
    const dmg = dmgU(T), tl = this.tile(T);
    danThang(B, T, E, 'dan_tia', 600, 18, (G, d, M) => {
      if (!M) return;
      if (!M.trum && !M.d.to && Math.random() < tl) {
        G.hu.push({ k: 'chem', t: 0, song: 0.4, x: M.x, y: M.y });
        trung(M, M.hp + 1, { B, crit: false, mau: '#ff4b3e' }); VX.chem(M); SND.no(0.3);
      } else trung(M, dmg, { B });
    });
  },
};
SKILLS.phagiap = { // Phá Giáp (Freya) — HỖ TRỢ (đợt vai trò): mỗi 6 s LỘ ĐIỂM YẾU quái nhiều máu nhất; ụ Tấn công kề gây thêm sát thương vào quái bị lộ
  vai: 'ht', dmg: 0, toc: 0, chiTC: true, napMau: '#d9a8ff',
  k: (T) => 0.22 * HOTRO.k(T),
  so: (T) => (ms(T, 5) ? 3 : 2),          // toughest + lead · 5★ DOUBLE EXPOSE: +1
  mo: (T) => 'Every 3s exposes the ' + (SKILLS.phagiap.so(T) > 2 ? 'lead + 2 toughest enemies' : 'lead + toughest enemy') + ' 6s · Attack neighbours +' + Math.round(SKILLS.phagiap.k(T) * 100) + '% damage to exposed' + (ms(T, 7) ? ' · exposed take +8% from all' : ''),
  hoTro(G, T, N, ra) { ra.lo = this.k(T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '217,168,255', 2.4);
    const lo = dsMucTieu(B).filter(E => !E.chet && E.loT > 0);
    xoayDau(T, lo[0] || null, dt);
    T.nap = Math.min(1, T.nap + dt / 3);
    if (T.nap < 1) return true;
    const song = dsMucTieu(B).filter(E => !E.chet), dau = quaiDau(B);
    const ds = (dau ? [dau] : []).concat(song.filter(E => E !== dau).sort((a, b) => b.hp - a.hp)).slice(0, this.so(T));
    if (!ds.length) return true;
    T.nap = 0; T.sang = 1; SND.set();
    const c = tamU(T);
    for (const E of ds) {
      E.loT = 6; E.loV = ms(T, 7) ? 0.08 : (E.loV || 0); E.yeu = Math.max(E.yeu, 6); // 7★ SHATTERED GUARD
      FX.chu1(E.x, E.y - 24, 'EXPOSED', '#d9a8ff', 10); FX.no('dien', E.x, E.y, 40, 0.3);
      G.hu.push({ k: 'tiaPhep', t: 0, song: 0.4, x0: c.x, y0: c.y, x1: E.x, y1: E.y, mau: '#d9a8ff' });
    }
    return true;
  },
};
SKILLS.bua = { // Búa Đẩy (Atalante) — HỖ TRỢ (đợt vai trò): ụ Tấn công kề +sát thương chí mạng; chí mạng của chúng làm quái thường CHOÁNG ngắn
  vai: 'ht', dmg: 0, toc: 0, chiTC: true,
  cd: (T) => 0.30 * HOTRO.k(T),
  crit: (T) => 0.05 * HOTRO.k(T),
  soc: (T) => (ms(T, 7) ? 0.35 : 0.2),
  mo: (T) => 'Attack neighbours: +' + Math.round(SKILLS.bua.crit(T) * 100) + '% crit chance, +' + Math.round(Math.min(0.5, SKILLS.bua.cd(T)) * 100) + '% crit damage · their crits stagger normal enemies ' + SKILLS.bua.soc(T) + 's' + (ms(T, 7) ? ' · also big enemies' : ''),
  hoTro(G, T, N, ra) { ra.cdmg = this.cd(T); ra.crit = this.crit(T); ra.soc = this.soc(T); if (ms(T, 7)) ra.socTo = 1; },
  capNhat(G, B, T, dt) { HOTRO.nhip(G, B, T, dt, '255,208,128', 2.4, 0.5); return true; },
};
SKILLS.nam = { // Nắm Đấm Sắt (Vesta): cận chiến, đấm nổ tỏa tròn, rất nhanh — phải đứng sát đường
  vai: 'tc', dmg: 7.5, toc: 2.4, tocSao: 0.06, tam: 105,
  mo: (T) => 'Melee range 105 px · 36 px ring blast · ' + tocU(T).toFixed(1) + ' hits/s',
  chonMuc(G, B, T) { return quaiDauTam(B, T, this.tam); },
  ban(G, B, T, E) {
    T.rv += 420; T.chop = 0.08; // đấm thụt tới trước rồi lò xo kéo về
    const dmg = dmgU(T);
    noLan(E.x, E.y, 36, dmg, B);
    FX.no('no_phao', E.x, E.y, 62, 0.25); FX.vong1(E.x, E.y, 6, 36, '#ffb35a', 0.25, 3); FX.bui(E.x, E.y, 4, 8); FX.lac(0.8); SND.dat();
    const [x, y] = dauNong(T); G.hu.push({ k: 'tiaTia', t: 0, song: 0.12, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#ffb35a' });
  },
};
SKILLS.bomhen = { // Bom Hẹn Giờ (Hecate) — ĐẶC BIỆT (đợt vai trò): gắn bom 5 s vào quái ngẫu nhiên; nổ KHÔNG gây sát thương mà làm quái quanh yếu đi 10%
  vai: 'db', dmg: 0, toc: 0, napMau: '#ffb35a',
  r: (T) => 34 + 3 * T.sao,
  yeuDai: (T) => (ms(T, 3) ? 6 : 4),   // 3★ LONG FUSE
  mo: (T) => 'Every 2s sticks a 5s bomb on a random enemy · blast (' + SKILLS.bomhen.r(T) + ' px) weakens: +10% damage taken ' + SKILLS.bomhen.yeuDai(T) + 's' + (ms(T, 5) ? ' · staggers 0.5s' : '') + (ms(T, 7) ? ' · 2 bombs' : ''),
  capNhat(G, B, T, dt) {
    const ds = dsMucTieu(B).filter(E => !E.chet && !E.bom);
    if (!T.muc || T.muc.chet || T.muc.bom || !banDuocQuai(B, T.muc)) T.muc = ds.length ? pick(ds) : null;
    xoayDau(T, T.muc || quaiDau(B), dt);
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / 2);
    if (T.nap < 1 || !T.muc) return true;
    T.nap = 0; giat(T, 0.7); chopNong(T, 20); SND.nap();
    const dsBom = [T.muc].concat(ms(T, 7) ? ds.filter(E => E !== T.muc).slice(0, 1) : []); // 7★ TWIN BOMBS
    const o = { r: this.r(T), yw: 0.10, ywDai: this.yeuDai(T), soc: ms(T, 5) ? 0.5 : 0 }; // 5★ SHOCKWAVE
    for (const E of dsBom) {
      E.bom = true;
      danThang(B, T, E, 'dan_phao', 380, 13, (G, d, M) => { const Q = M || E; G.hu.push(Object.assign({ k: 'bom', t: 0, song: 5, E: Q, x: d.x, y: d.y, T, B, dmg: 0 }, o)); });
    }
    T.muc = null;
    return true;
  },
};

// ===================================================== XANH =====================================================
SKILLS.nhanmana = { // Máy Nhân Mana (Thisbe): khi GHÉP nhận nhiều mana
  vai: 'db', dmg: 6.23, toc: 1.3, nham: 'dau',
  luong: (sao, B) => Math.round(32 * sao * (1 + 0.25 * ((B.lv.nhanmana || 1) - 1))),
  mo: (T) => 'On merge: +' + SKILLS.nhanmana.luong(T.sao, G.ban[T.ban]) + ' mana',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#d9a8ff', sp: 420 }); },
  ghep(G, B, a, b, ra) {
    const n = this.luong(a.sao, B); B.mana += n; B.manaNay += n;
    const c = B.o[b.o];
    FX.chu1(c.x, c.y - 46, '+' + n, '#d9a8ff', 18, 'mana');
    for (let i = 0; i < 16; i++) FX.hat1('lua', c.x + rnd(-20, 20), c.y + rnd(-10, 10), rnd(-30, 30), rnd(-110, -50), 0.7, 8, '#c77dff');
    buffNo(ra, 'mana', 1); if (!B.ai) SND.mana();
  },
};
// quái ĐANG CHẬM thật (có % chậm còn hạn, hoặc đang đóng băng) — quái kháng chậm có đồng hồ mà 0% chậm KHÔNG tính
function biCham(E) { return !!E && ((E.chamT > 0 && E.cham > 0) || E.chan > 0); }
SKILLS.kiembang = { // Kiếm Băng (Ymir): +400% sát thương vào quái đang bị chậm · bậc XANH họ Frost: hơi lạnh LAN sang quái quanh điểm chém
  vai: 'tc', dmg: 16.8, toc: 0.75, nham: 'dau',
  mo: (T) => '×' + (ms(T, 7) ? 8 : ms(T, 3) ? 6 : 5) + ' damage to slowed enemies · chills enemies within 44 px (20% · 2s)' + (ms(T, 5) ? ' · splinters' : ''),
  chonMuc(G, B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s - (biCham(E) ? 400 : 0); if (r < best) { best = r; m = E; } } return m; },
  ban(G, B, T, E) {
    giat(T, 0.7); chopNong(T, 22); SND.bang();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_bang', 560, 22, (G, d, M) => {
      if (!M) return;
      const cham = biCham(M), k = ms(T, 7) ? 8 : ms(T, 3) ? 6 : 5;
      trung(M, dmg * (cham ? k : 1), { B, mau: cham ? '#7fdcff' : '#ffffff' });
      FX.no('bang_vo', d.x, d.y, cham ? 64 : 36, 0.3);
      if (cham && ms(T, 5)) { for (const Q of dsMucTieu(B)) if (Q !== M && Math.hypot(Q.x - d.x, Q.y - d.y) <= 40 + Q.d.co * 0.25) trung(Q, dmg * k * 0.4, { B, phu: true, mau: '#bff4ff' }); FX.vong1(d.x, d.y, 6, 40, '#bff4ff', 0.3, 3); } // 5★ SPLINTERS: mảnh văng ra quái XUNG QUANH (không đánh lại mục tiêu chính)
      if (cham) nhanU(T, 'SHATTER ×' + k, '#7fdcff');
      // LAN CHẬM: quái quanh điểm trúng (trừ mục tiêu) bị lạnh 20% · 2 s → lượt chém sau nhắm chúng ×5
      let lan = 0;
      for (const Q of dsMucTieu(B)) if (Q !== M && !Q.chet && !Q.d.khangCham && Math.hypot(Q.x - d.x, Q.y - d.y) < 44) { Q.cham = Math.max(Q.cham, Q.trum ? 0.15 : 0.2); Q.chamT = Math.max(Q.chamT, 2); lan++; }
      if (lan) FX.vong1(d.x, d.y, 8, 44, '#bff4ff', 0.3, 2);
    }, 'bang');
  },
};
SKILLS.chimang = { // Ăng-ten Chí Mạng (Siren): HỖ TRỢ — +tỉ lệ chí mạng cho 4 ô thẳng (3 → 20 điểm %, trần 20)
  vai: 'ht', dmg: 0, toc: 0,
  them: (T) => [0.06, 0.08, 0.11, 0.13, 0.15, 0.18, 0.20][clamp(T.sao, 1, 7) - 1] * (1 + 0.06 * (lvU(T) - 1)),
  mo: (T) => '+' + Math.round(SKILLS.chimang.them(T) * 100) + '% crit chance to N/E/S/W neighbours' + (ms(T, 5) ? ' · +10% crit damage' : '') + (ms(T, 7) ? ' · every 6s a sure crit' : ''),
  hoTro(G, T, N, ra) { ra.crit = this.them(T); if (ms(T, 5)) ra.cdmg = 0.10; },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '255,80,90', 2.4, 0.9);
    if (ms(T, 7)) { T.ccT = (T.ccT || 0) + dt; if (T.ccT >= 6) { T.ccT = 0; for (const o of HOTRO.oDich(T)) { const N = B.t[o]; if (HOTRO.nhan(T, N)) N._critChac = true; } } } // 7★ CERTAIN STRIKE
    return true;
  },
};
SKILLS.dichchuyen = { // Bệ Dịch Chuyển (Merlin): kéo thả lên ụ khác CÙNG SAO → đổi chỗ
  vai: 'db', dmg: 11.76, toc: 0.85, nham: 'dau',
  mo: () => 'Drag onto same-star turret: SWAP (move melee to the edge) · works on stone/frozen turrets too',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#9fe6ff', sp: 480 }); },
  ghepDB: {
    quaKhoa: true, // đổi chỗ được với ô đá / ô băng cùng sao (ô đó giữ nguyên trạng thái, chỉ đổi chỗ)
    hopLe: (a, b) => a.sao === b.sao && b.ban === a.ban,
    lam(G, B, a, b) {
      const oa = a.o, ob = b.o, ca = B.o[oa], cb = B.o[ob];
      B.t[oa] = b; B.t[ob] = a; a.o = ob; b.o = oa;
      a.anim = { k: 'no', t: 0.2 }; b.anim = { k: 'no', t: 0.2 };
      for (const c of [ca, cb]) { FX.vong1(c.x, c.y, 30, 4, '#9fe6ff', 0.35, 4); FX.tiaLua(c.x, c.y, 12, '#9fe6ff', 160, 10); }
      tiaPhep(ca.x, ca.y, cb.x, cb.y, '#9fe6ff');
      nhanU(a, 'TELEPORT', '#9fe6ff', true);
      return a;
    },
  },
};
SKILLS.drone = { // Bệ Phóng Drone (Hermes): khi GHÉP phóng drone bom chạy ngược đường đâm quái
  vai: 'tc', dmg: 8.67, toc: 1.5, nham: 'dau',
  mo: (T) => 'On merge: ' + (1 + Math.floor(T.sao / 3)) + ' bomb drones ×24',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_lien', co: 14, snd: 'lien' }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 3), dmg = hsU('drone', a.sao + 1, B) * 24;
    const ds = G.duong.map((p, i) => i).filter(i => G.duong[i].ban === B.i);
    for (let i = 0; i < n; i++) {
      const pi = ds[i % ds.length], p = G.duong[pi];
      G.hu.push({ k: 'drone', t: -i * 0.4, song: 12, p: pi, s: p.len, x: 0, y: 0, goc: 0, B, T: ra, dmg, r: 46 });
    }
    nhanU(ra, 'DRONES ×' + n, '#4fb8ff', true); SND.nap();
  },
};
SKILLS.tron = { // Bộ Trộn (Zarramim) — HỖ TRỢ (đợt vai trò): ụ Tấn công kề +6% tốc bắn; mỗi LOẠI Tấn công khác nhau kề thêm +2% (tối đa 12% ở 1★)
  vai: 'ht', dmg: 0, toc: 0, chiTC: true,
  loai(B, T) { return new Set(HOTRO.oDich(T).map(o => B.t[o]).filter(N => HOTRO.nhan(T, N)).map(N => N.id)).size; },
  them(T) { const B = G.ban[T.ban], n = B ? this.loai(B, T) : 1; return Math.min(0.12, 0.06 + 0.02 * Math.max(0, n - 1)) * HOTRO.k(T); },
  mo(T) { const n = this.loai(G.ban[T.ban], T); return n + ' different Attack types next to it → +' + Math.round(this.them(T) * 100) + '% fire rate each' + (ms(T, 5) ? ' · 3+ types: +' + Math.round(0.03 * HOTRO.k(T) * 100) + '% damage' : '') + (ms(T, 7) ? ' · 4 types: +6% crit' : ''); },
  hoTro(G, T, N, ra) {
    const n = this.loai(G.ban[T.ban], T);
    ra.toc = this.them(T);
    if (ms(T, 5) && n >= 3) ra.dmg = 0.03 * HOTRO.k(T); // 5★ MIXED FIRE
    if (ms(T, 7) && n >= 4) ra.crit = 0.06;          // 7★ PERFECT BLEND
  },
  capNhat(G, B, T, dt) { HOTRO.nhip(G, B, T, dt, '255,228,107', 2.2, 0.8); return true; },
};
SKILLS.nangluong = { // Pháo Năng Lượng (Jupiter): sát thương tăng theo mana đang có
  vai: 'tc', dmg: 15.43, toc: 0.7, nham: 'dau',
  k: (B) => Math.min(5, B.mana / 120),
  mo: (T) => 'Current mana → +' + Math.round(SKILLS.nangluong.k(G.ban[T.ban]) * 100) + '% (each 120 mana +100%, max +500%)',
  sangDau: (T) => SKILLS.nangluong.k(G.ban[T.ban]) * 0.12,
  ban(G, B, T, E) {
    const k = this.k(B);
    giat(T, 0.6 + k * 0.2); chopNong(T, 22 + k * 4); SND.set();
    const dmg = dmgU(T) * (1 + k);
    danThang(B, T, E, 'tia_lua', 420, 14 + k * 5, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#d9a8ff' }); FX.no('dien', d.x, d.y, 26 + k * 8, 0.25); });
    if (k >= 3) nhanU(T, 'OVERLOAD +' + Math.round(k * 100) + '%', '#d9a8ff');
  },
};
SKILLS.lanhgia = { // Máy Phát Lạnh (Neptune): HỖ TRỢ — ụ kề bắn kèm làm chậm (không cộng dồn với nguồn chậm khác; trần 35% / trùm 15%)
  vai: 'ht', dmg: 0, toc: 0,
  cham: (T) => 0.08 * HOTRO.k(T),
  mo: (T) => 'Neighbours’ hits slow ' + Math.round(Math.min(0.35, SKILLS.lanhgia.cham(T)) * 100) + '% for 2s (bosses max 15%)' + (ms(T, 5) ? ' · +' + Math.round(0.05 * HOTRO.k(T) * 100) + '% damage vs slowed' : '') + (ms(T, 7) ? ' · every 8s a hit freezes 0.8s' : ''),
  hoTro(G, T, N, ra) { ra.cham = this.cham(T); if (ms(T, 5)) ra.lanh = 0.05 * HOTRO.k(T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '127,220,255', 2.4, 0.6);
    if (ms(T, 7)) { T.ccT = (T.ccT || 0) + dt; if (T.ccT >= 8) { T.ccT = 0; for (const o of HOTRO.oDich(T)) { const N = B.t[o]; if (HOTRO.nhan(T, N)) N._dongChac = true; } } } // 7★ FLASH FREEZE
    if (Math.random() < dt * 1.2) { const c = tamU(T); FX.hat1('lua', c.x + rnd(-14, 14), c.y + rnd(-10, 10), rnd(-8, 8), rnd(-30, -10), 0.6, 5, '#bff4ff'); }
    return true;
  },
};
SKILLS.khuech = { // Bộ Khuếch Đại (Mars): HỖ TRỢ — ụ Tấn công kề: mỗi đòn LIÊN TIẾP vào cùng 1 quái +sát thương (đổi mục tiêu / nghỉ 1.5 s → về 0)
  vai: 'ht', dmg: 0, toc: 0, chiTC: true,
  buoc: (T) => 0.09 * HOTRO.k(T),
  max: (T) => (ms(T, 5) ? 7 : 5),       // 5★ DEEP STACKS
  mo: (T) => 'Attack neighbours: +' + (SKILLS.khuech.buoc(T) * 100).toFixed(1) + '% damage per hit on the same target (max ' + SKILLS.khuech.max(T) + ' stacks, per enemy) · fades after ' + (ms(T, 7) ? 3 : 1.5) + 's without a hit (slow guns: one missed shot)',
  hoTro(G, T, N, ra) { ra.amp = this.buoc(T); ra.ampMax = this.max(T); if (ms(T, 7)) ra.ampGiu = 1; },
  capNhat(G, B, T, dt) { HOTRO.nhip(G, B, T, dt, '255,120,60', 2.0); return true; },
};
SKILLS.vungdoc = { // Bom Vũng Độc (Flora): ném vũng độc lên đường
  vai: 'tc', dmg: 7, toc: 1, napMau: '#9dff5a',
  ky: (T) => Math.max(2.6, 4.6 - 0.2 * T.sao),
  mo: (T) => (ms(T, 3) ? '2 pools ' : 'Poison pool ') + Math.round((30 + 2 * T.sao) * (ms(T, 7) ? 1.5 : 1)) + ' px · 5s' + (ms(T, 5) ? ' · weakens +15%' : ''),
  capNhat(G, B, T, dt) {
    const E = quaiDau(B);
    xoayDau(T, E, dt);
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / this.ky(T));
    if (T.nap >= 1 && E) {
      T.nap = 0; giat(T, 1.2); const [x, y] = chopNong(T, 24); SND.doc();
      const p = G.duong[E.p], dps = dmgU(T) * 3.5, r = (30 + 2 * T.sao) * (ms(T, 7) ? 1.5 : 1), yeu = ms(T, 5);
      const nem = (s) => { const [px, py] = viTri(p, Math.min(p.len - 8, s));
        banDan({ img: 'dan_doc', x, y, px, py, sp: 220, co: 22, cong: 60, B, T, duoi: true,
          trung(G, d) { G.hu.push({ k: 'may', t: 0, song: 5, x: d.x, y: d.y, r, dps, B, tick: 0, yeu }); FX.no('khoi_doc', d.x, d.y, r * 2.4, 0.5); FX.bui(d.x, d.y, 5, 6); } }); };
      nem(E.s + 26);
      if (ms(T, 3)) nem(Math.max(10, E.s - 70)); // 3★ TWIN POOLS
      nhanU(T, 'POISON POOL', '#9dff5a');
    }
    return true;
  },
};
SKILLS.loa = { // Loa Hồi Chiêu (Melpomene): khi GHÉP giảm hồi chiêu kỹ năng Ma vương
  vai: 'db', dmg: 12.5, toc: 0.8, nham: 'dau',
  giam: (sao) => 3 + 1.5 * sao,
  mo: (T) => 'On merge: Archfiend cooldown −' + SKILLS.loa.giam(T.sao) + 's (if ready: cost −15%)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 14, mau: '#ffe46b', sp: 440 }); const c = tamU(T); FX.vong1(c.x, c.y, 8, 22, '#ffe46b', 0.3, 2); },
  ghep(G, B, a, b, ra) {
    const mv = B.mv, g = this.giam(a.sao), c = B.o[b.o];
    if (mv.cd > 0) { mv.cd = Math.max(0, mv.cd - g); nhanU(ra, 'COOLDOWN −' + g + 's', '#ffe46b', true); }
    else { mv.gia = Math.max(MAVUONG[mv.id].gia, Math.round(mv.gia * 0.85)); nhanU(ra, 'ARCHFIEND −15% COST', '#ffe46b', true); }
    for (let i = 0; i < 3; i++) FX.vong1(c.x, c.y, 10 + i * 6, 70 + i * 20, '#ffe46b', 0.5 + i * 0.12, 3);
  },
};
SKILLS.hutmana = { // Máy Hút Mana (Elizabeth) — TẤN CÔNG (đợt vai trò): bắn tia hút quái đầu; mỗi phát trúng hồi chút mana (có trần mana/giây)
  vai: 'tc', dmg: 11, toc: 1.4, nham: 'dau',
  luong: (T) => (0.35 + 0.15 * (T.sao - 1)) * (1 + 0.2 * (lvU(T) - 1)),
  tran: (T) => 1.2 + 0.3 * (T.sao - 1),   // mana tối đa mỗi giây
  mo: (T) => '+' + SKILLS.hutmana.luong(T).toFixed(2) + ' mana per hit (max ' + SKILLS.hutmana.tran(T).toFixed(1) + '/s)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 16, mau: '#d9a8ff', sp: 560 }); },
  khiTrung(G, T, E) {
    const B = G.ban[T.ban]; if (!B) return;
    if (G.t - (T.hutGiay || -9) >= 1) { T.hutGiay = G.t; T.hutS = 0; }
    const n0 = Math.min(this.luong(T), Math.max(0, this.tran(T) - (T.hutS || 0))); if (!(n0 > 0)) return;
    T.hutS = (T.hutS || 0) + n0; T.hut = (T.hut || 0) + n0;
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
  mo: (T) => 'Mine ×7 every ' + SKILLS.min.ky(T).toFixed(1) + ' s · ' + (3 + 0.5 * (T.sao - 1)).toFixed(1) + '% star mine ×3',
  capNhat(G, B, T, dt) {
    const ds = dsMucTieu(B);
    const E = ds.length ? ds[0] : null;
    if (T.minDichT > 0) T.minDichT -= dt; else T.minDich = null;
    xoayDau(T, T.minDich ? null : E, dt, T.minDich && T.minDich[0], T.minDich && T.minDich[1]);
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / this.ky(T));
    const soMin = G.hu.filter(o => o.k === 'min' && o.T === T).length;
    if (T.nap >= 1 && E && soMin < 6) {
      const Q = pick(ds), p = G.duong[Q.p], [px, py] = viTri(p, Math.min(p.len - 16, Q.s + rnd(30, 110)));
      T.nap = 0; T.minDich = [px, py]; giat(T, 0.9); const [x, y] = chopNong(T, 20); SND.nap();
      const sao3 = Math.random() < 0.03 + 0.005 * (T.sao - 1), dmg = dmgU(T) * 7 * (sao3 ? 3 : 1);
      banDan({ img: 'dan_phao', x, y, px, py, sp: 240, co: 15, cong: 50, B, T,
        trung(G, d) { G.hu.push({ k: 'min', t: 0, song: 30, x: d.x, y: d.y, r: 36, dmg, B, T, sao3 }); FX.bui(d.x, d.y, 4, 5); } });
      if (sao3) nhanU(T, 'STAR MINE ×3!', '#ffd23f', true);
      T.minDichT = 0.4;
    }
    return true;
  },
};

// ===================================================== TÍM =====================================================
SKILLS.cuongno = { // Súng Cuồng Nộ (Danu): chí mạng → chế độ bùng nổ tốc bắn 5 s
  vai: 'tc', dmg: 8.07, toc: 1.5, nham: 'dau', crit: 0.05,
  them: (T) => 1.5 + 0.15 * T.sao,
  mo: (T) => (T.cuongT > 0 ? 'FRENZY ' + T.cuongT.toFixed(1) + 's' : 'Rage ' + (T.rage || 0) + '/2') + ' · frenzy +' + Math.round(SKILLS.cuongno.them(T) * 100) + '% fire rate',
  capNhat(G, B, T, dt) {
    if (T.cuongT > 0) { T.cuongT -= dt; T.buf.toc += this.them(T); if (ms(T, 7)) T.buf.crit += 0.25; } // 7★ RAMPAGE
    else if (T.rage > 0) { T.rageT -= dt; T.buf.toc += 0.25 * T.rage; if (T.rageT <= 0) T.rage = 0; }
    return false;
  },
  ban(G, B, T, E) {
    const r = T.cuongT > 0; giat(T, r ? 0.35 : 0.6);
    const [x, y] = dauNong(T); FX.no('chop_nong', x, y, r ? 26 : 22, 0.07, T.goc + rnd(-0.1, 0.1)); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_lien', 680, r ? 18 : 15, (G, d, M) => { if (M) trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, r ? 3 : 1, '#ff7a3a', 120, 7); });
  },
  // chí mạng 1 → RAGE (+25% tốc, dạng 2) · chí mạng 2 → FRENZY (dạng 3); đang Frenzy mà chí mạng → +1 s
  khiCrit(G, T) {
    const dai = ms(T, 5) ? 7 : 5;
    if (T.cuongT > 0) { T.cuongT = Math.min(dai, T.cuongT + 1); return; }
    T.rage = (T.rage || 0) + 1; T.rageT = ms(T, 3) ? 8 : 5;
    if (T.rage >= 2) { T.rage = 0; T.cuongT = dai; buffNo(T, 'max', 0.8); }
    else buffNo(T, 'dmg', 0.4);
  },
  sangDau: (T) => T.cuongT > 0 ? 0.3 + 0.15 * Math.sin(G.t * 20) : (T.rage > 0 ? 0.12 : 0),
};
SKILLS.baotuyet = { // Bão Tuyết (Mayauel): định kỳ làm chậm TOÀN BỘ quái
  vai: 'tc', dmg: 9, toc: 1, napMau: '#bff4ff',
  ky: (T) => Math.max(4, 11 - 0.6 * T.sao - (ms(T, 3) ? 1.5 : 0)), // 3★ SQUALL
  cham: (T) => Math.min(0.6, 0.3 + 0.03 * T.sao),
  mo: (T) => 'Every ' + SKILLS.baotuyet.ky(T).toFixed(1) + 's: slow ALL enemies ' + Math.round(SKILLS.baotuyet.cham(T) * 100) + '% for 3s + freeze small ones ' + (ms(T, 7) ? 1 : 0.35) + 's',
  capNhat(G, B, T, dt) {
    T.goc += dt * 0.8; // quạt tuyết quay đều
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / this.ky(T));
    const ds = dsMucTieu(B);
    if (T.nap >= 1 && ds.length) {
      T.nap = 0; T.sang = 1; giat(T, 0.8); SND.bang();
      const c = this.cham(T), dmg = dmgU(T) * 1.5 * (ms(T, 5) ? 3 : 1); // 5★ ICE SHARDS
      for (const E of ds) {
        E.chamT = Math.max(E.chamT, 3); if (!E.d.khangCham) E.cham = Math.max(E.cham, c); trung(E, dmg, { B, mau: '#bff4ff', im: true }); FX.no('bang_vo', E.x, E.y, 44, 0.4);
        if (!E.trum && !E.d.to && !E.d.khangCham) E.chan = Math.max(E.chan || 0, ms(T, 7) ? 1 : 0.35); // đóng băng ngắn (7★ WHITEOUT: 1 s)
      }
      G.hu.push({ k: 'tuyet', t: 0, song: 1.4, B });
      FX.sang(0.22, '#bff4ff');
      nhanU(T, 'BLIZZARD', '#bff4ff', true);
    }
    return true;
  },
};
SKILLS.nhanban = { // Máy Nhân Bản (Ivory): khi GHÉP gọi thêm 1 ụ 1 sao
  vai: 'db', dmg: 8.18, toc: 1.1, nham: 'dau',
  mo: () => 'On merge: free extra 1★ turret',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghep(G, B, a, b, ra) {
    const N = trieu(B, true);
    if (N) { const c0 = B.o[b.o], c1 = B.o[N.o]; tiaPhep(c0.x, c0.y, c1.x, c1.y, '#c77dff'); nhanU(ra, 'CLONE +1', '#c77dff', true); }
  },
};
SKILLS.lienket = { // Chuỗi Liên Kết (Won): mạnh hơn theo số ụ cùng loại nối liền kề
  vai: 'tc', dmg: 13.33, toc: 0.9, nham: 'dau',
  nhom(B, T) { // loang theo ô kề (trên-dưới-trái-phải)
    const da = new Set([T.o]), hang = [T.o];
    while (hang.length) { const o = hang.pop(); for (const N of keCan(B, o)) if (N && N.id === T.id && !N.st.da && !da.has(N.o)) { da.add(N.o); hang.push(N.o); } }
    return da.size;
  },
  mo(T) { const n = this.nhom(G.ban[T.ban], T); return 'Chain of ' + n + ' linked → +' + Math.round(0.4 * (n - 1) * 100) + '% damage'; },
  capNhat(G, B, T) { T.chuoi = this.nhom(B, T); T.buf.dmg += 0.4 * (T.chuoi - 1); return false; },
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 22, 0.08, T.goc); SND.set();
    const dmg = dmgU(T);
    const arc = giaiDoan(T) >= 3; // dạng 3 CHAIN MASTER: đạn nảy thêm 1 quái
    danThang(B, T, E, 'dan_tia', 600, 16 + 2 * (T.chuoi || 1), (G, d, M) => {
      if (M) trung(M, dmg, { B, mau: '#d9a8ff' }); FX.no('dien', d.x, d.y, 24 + 4 * (T.chuoi || 1), 0.2);
      if (arc && M) {
        let Q = null, best = 90; for (const X of dsMucTieu(B)) if (X !== M && !X.chet) { const dd = Math.hypot(X.x - M.x, X.y - M.y); if (dd < best) { best = dd; Q = X; } }
        if (Q) { trung(Q, dmg * 0.5, { B, mau: '#d9a8ff' }); G.hu.push({ k: 'set', t: 0, song: 0.2, x: M.x, y: M.y, ds: [{ Q, x: Q.x, y: Q.y }], seed: Math.random() * 999 }); }
      }
    });
  },
};
SKILLS.kepha = { // Kẹp Phá (Myrina): khi GHÉP — PVP làm chậm ụ đối thủ; CO-OP tăng tốc ụ đồng đội (SOLO: ụ mình)
  vai: 'db', dmg: 6.92, toc: 1.3, nham: 'dau',
  mo: (T) => 'On merge: PVP clamps ' + (1 + Math.floor(T.sao / 2)) + ' rival turrets −40% speed · CO-OP/SOLO +' + Math.round((0.4 + 0.05 * T.sao) * 100) + '% speed',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 2), c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const ds = D.t.filter(X => X && SKILLS[X.id].dmg).sort((x, y) => y.sao - x.sao).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#c77dff'); if (!chanKhien(D, X)) { X.st.kep = 5 + a.sao; FX.chu1(c.x, c.y - 20, 'CLAMPED', '#c77dff', 12, 'to'); } }
      nhanU(ra, 'CLAMP ×' + ds.length, '#c77dff', true);
    } else {
      const D = banKhac(B) || B;
      const ds = D.t.filter(X => X && X !== ra && SKILLS[X.id].dmg).sort((x, y) => y.sao - x.sao).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#4bff9a'); X.tocT = 6 + a.sao; X.tocV = 0.4 + 0.05 * a.sao; }
      nhanU(ra, D === B ? 'SPEED UP ×' + ds.length : 'ALLY BOOST', '#4bff9a', true);
    }
  },
};
SKILLS.taylo = { // Máy Tẩy Lỗi (Gemina) — HỖ TRỢ (đợt vai trò): mỗi 12 s xoá 1 hiệu ứng xấu cho tối đa 2 ụ kề; không có gì để tẩy → ụ kề +5% sát thương tới nhịp sau
  vai: 'ht', dmg: 0, toc: 0, napMau: '#E8E5C8',
  ky: (T) => (ms(T, 5) ? 9 : 12),
  so: (T) => (ms(T, 5) ? 3 : 2),
  xau: (X) => X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0 || X.giamT > 0,
  mo: (T) => 'Every ' + SKILLS.taylo.ky(T) + 's cleanses up to ' + SKILLS.taylo.so(T) + ' neighbours (freeze/stone/burn/clamp) · nothing to clean: neighbours +' + Math.round(0.08 * HOTRO.k(T) * 100) + '% damage' + (ms(T, 7) ? ' · cleansed: +20% fire rate 4s' : ''),
  hoTro(G, T, N, ra) { if (T.sach !== 0) ra.dmg = 0.08 * HOTRO.k(T); }, // chưa tới nhịp đầu = chưa có gì để tẩy → đã có +sát thương
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '232,229,200', 2.6, 0.4);
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap < 1) return true;
    T.nap = 0; T.sang = 1;
    const c0 = B.o[T.o], ds = HOTRO.oDich(T).map(o => B.t[o]).filter(X => X && X !== T && this.xau(X)).slice(0, this.so(T));
    for (const X of ds) {
      X.st.bang = 0; X.st.da = false; X.st.lua = 0; X.st.kep = 0; X.giamT = 0;
      const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#E8E5C8'); VX.donSach(B, X);
      if (ms(T, 7)) { X.tocT = Math.max(X.tocT, 4); X.tocV = Math.max(X.tocV || 0, 0.2); } // 7★ FRESH START
    }
    T.sach = ds.length ? 0 : 1;
    if (ds.length) nhanU(T, 'CLEANSE ×' + ds.length, '#ffffff', true);
    return true;
  },
};
SKILLS.khien = { // Máy Khiên (Mona) — HỖ TRỢ (đợt vai trò): ụ kề nhận khiên chặn 1 hiệu ứng khống chế; sạc lại 18 s; không cộng dồn
  vai: 'ht', dmg: 0, toc: 0, napMau: '#9fe6ff',
  ky: (T) => [18, 18, 16, 16, 14, 14, 10][clamp(T.sao, 1, 7) - 1],
  mo: (T) => 'Every ' + SKILLS.khien.ky(T) + 's neighbours get a 1-hit shield vs boss/rival control (no stacking)' + (ms(T, 7) ? ' · a block gives +20% fire rate 4s' : ''),
  hoTro() {}, // không cộng chỉ số — khiên nạp theo nhịp (capNhat)
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '159,230,255', 2.6, 0.4);
    const ke = HOTRO.oDich(T).map(o => B.t[o]).filter(X => X && X !== T && !X.st.da);
    if (!ke.some(X => !(X.khien > 0))) { T.nap = Math.max(T.nap, 0.999); return true; } // mọi ụ kề đã có khiên: giữ đầy
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap < 1) return true;
    T.nap = 0; T.sang = 1;
    const c0 = B.o[T.o]; let n = 0;
    for (const X of ke) if (!(X.khien > 0)) { X.khien = 1; n++; const c = B.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#9fe6ff'); FX.vong1(c.x, c.y, 30, 10, '#9fe6ff', 0.4, 3); }
    if (n) nhanU(T, 'SHIELD ×' + n, '#9fe6ff', true);
    return true;
  },
};
SKILLS.hopbi = { // Hộp Bí Ẩn (Daron): sau 47 s biến thành ụ ngẫu nhiên 1–7 sao
  vai: 'db', dmg: 0, toc: 0, napMau: '#c77dff',
  can: (T) => (ms(T, 3) ? 37 : 47), // 3★ QUICK OPEN
  mo: (T) => 'Opens in ' + Math.max(0, SKILLS.hopbi.can(T) - T.tuoi).toFixed(0) + 's → random ' + (ms(T, 7) ? 5 : ms(T, 5) ? 3 : 1) + '–7★ turret',
  gocDau: (T, t) => -Math.PI / 2 + Math.sin(t * (6 + T.nap * 30)) * (0.05 + T.nap * T.nap * 0.35),
  capNhat(G, B, T) {
    T.nap = Math.min(1, T.tuoi / this.can(T));
    if (T.nap >= 1) {
      if (B.net && typeof ONS !== 'undefined' && ONS.on) return true; // bàn con rối online: chờ ảnh chụp bàn của bạn (không tự quay ụ khác máy bạn)
      const toiThieu = ms(T, 7) ? 5 : ms(T, 5) ? 3 : 1; // 5★ LUCKY BOX · 7★ JACKPOT
      const sao = toiThieu + rint(8 - toiThieu), N = chuyenU(B, T, pick(deckTru(B, ['hopbi'])), sao, true);
      VX.hen(0.5, () => nhanU(N, 'BOX OPEN: ' + sao + '★ ' + (TEXT.turret[N.id] ? TEXT.turret[N.id].name.toUpperCase() : ''), '#c77dff', true)); SND.ghep();
    } else if (Math.random() < 0.02 + T.nap * 0.1) { const c = tamU(T); FX.hat1('lua', c.x + rnd(-12, 12), c.y + rnd(-12, 6), 0, -30, 0.5, 6, '#c77dff'); }
    return true;
  },
};
SKILLS.nangsao = { // Bệ Nâng Sao (Brownie) — HỖ TRỢ (đợt vai trò): 2 ụ kề SAO THẤP NHẤT +6% tốc bắn mỗi sao của Star Lift (tối đa 30%); 5★: mỗi wave +1 nấc sao cho ụ kề thấp nhất
  vai: 'ht', dmg: 0, toc: 0, napMau: '#ffe46b',
  them: (T) => Math.min(0.30, 0.06 * T.sao) * (1 + 0.06 * (lvU(T) - 1)),
  can: (T) => (ms(T, 7) ? 2 : 3),        // nấc cần cho +1★ (7★ STAR SURGE: 2)
  thap(B, T) { return HOTRO.oDich(T).map(o => B.t[o]).filter(N => HOTRO.nhan(T, N)).sort((a, b) => a.sao - b.sao || a.o - b.o).slice(0, 2); },
  mo: (T) => 'The 2 lowest-star neighbours: +' + Math.round(SKILLS.nangsao.them(T) * 100) + '% fire rate' + (ms(T, 5) ? ' · each wave the lowest gets a star pip (' + SKILLS.nangsao.can(T) + ' pips = +1★, max 2★ per match) · ' + (T.pipDa || 0) + '/2 used' : ''),
  hoTro(G, T, N, ra) { if (this.thap(G.ban[T.ban], T).includes(N)) ra.toc = this.them(T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '255,228,107', 2.4, 0.5);
    if (ms(T, 5) && G.wave !== T.pipW) { // 5★ STAR PIP: 1 nấc / wave, tối đa 2★ mỗi trận (không cho cả sao liên tục)
      const lan = T.pipW != null; T.pipW = G.wave;
      const N = this.thap(B, T).filter(X => X.sao < LUAT.saoMax)[0];
      if (lan && N && (T.pipDa || 0) < 2) {
        N.pip = (N.pip || 0) + 1; const c = B.o[N.o];
        if (N.pip >= this.can(T)) { N.pip = 0; T.pipDa = (T.pipDa || 0) + 1; nangSao(B, N, 1, 'STAR LIFT'); }
        else FX.chu1(c.x, c.y - 22, '★ PIP ' + N.pip + '/' + this.can(T), '#ffe46b', 11);
      }
    }
    return true;
  },
};
SKILLS.tuthan = { // Cột Tử Thần (Thanatos): HỖ TRỢ — ụ kề có xác suất GIẾT NGAY quái thường dưới ngưỡng máu; trùm: chỉ thêm đòn nhỏ (≤1% máu tối đa)
  vai: 'ht', dmg: 0, toc: 0,
  tile: (T) => 0.08 * HOTRO.k(T),
  nguong: (T) => (ms(T, 5) ? 0.40 : 0.30),   // 5★ DEEP REAP
  mo: (T) => 'Neighbours: ' + (Math.min(0.15, SKILLS.tuthan.tile(T)) * 100).toFixed(1) + '% per hit to execute normal enemies under ' + Math.round(SKILLS.tuthan.nguong(T) * 100) + '% HP' + (ms(T, 7) ? ' · big enemies under 15%' : '') + ' · bosses: small capped hit',
  hoTro(G, T, N, ra) { ra.chet = this.tile(T); ra.ngNguong = this.nguong(T); if (ms(T, 7)) ra.chetTo = 1; },
  capNhat(G, B, T, dt) { HOTRO.nhip(G, B, T, dt, '199,125,255', 2.8, 0.5); return true; },
};
SKILLS.xaotron = { // Máy Xáo Trộn (Neban): khi GHÉP — PVP đổi ngẫu nhiên ụ đối thủ; CO-OP/SOLO tạo cặp ghép cho bàn đồng đội/mình
  vai: 'db', dmg: 6.67, toc: 1.35, nham: 'dau',
  mo: (T) => 'On merge: PVP shuffles ' + (1 + Math.floor(T.sao / 2)) + ' rival turrets · CO-OP/SOLO makes loners mergeable',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ff6ad5', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    const n = 1 + Math.floor(a.sao / 2), c0 = B.o[b.o];
    if (G.che === 'pvp') {
      const D = banKhac(B); if (!D) return;
      const ds = D.t.filter(X => X && !X.st.da).sort(() => Math.random() - 0.5).slice(0, n);
      for (const X of ds) { const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ff6ad5'); if (!chanKhien(D, X)) { const ds2 = D.deck.filter(id => id !== X.id && SKILLS[id]); chuyenU(D, X, ds2.length ? pick(ds2) : X.id, X.sao); } }
      nhanU(ra, 'RIVAL SCRAMBLED', '#ff6ad5', true);
    } else {
      const D = banKhac(B) || B; let k = 0;
      for (let i = 0; i < n; i++) {
        const ts = D.t.filter(X => X && X !== ra && !X.st.da && X.sao < LUAT.saoMax);
        const le = ts.filter(X => !ts.some(Y => Y !== X && Y.sao === X.sao && Y.id === X.id) && ts.some(Y => Y !== X && Y.sao === X.sao));
        if (!le.length) break;
        const X = le.sort((x, y) => x.sao - y.sao)[0], Y = ts.find(Y => Y !== X && Y.sao === X.sao);
        const c = D.o[X.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#ff6ad5'); chuyenU(D, X, Y.id, X.sao); k++;
      }
      nhanU(ra, k ? 'PAIRED ×' + k : 'SCRAMBLE', '#ff6ad5', true);
    }
  },
};
SKILLS.epxung = { // Bộ Ép Xung (Pararamim): kéo lên ụ khác CÙNG SAO → ụ đó +65% tốc bắn vĩnh viễn
  vai: 'db', dmg: 5.62, toc: 1.6, nham: 'dau',
  mo: () => 'Drag onto same-star turret: +65% fire rate (stacks)',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 15, sp: 560 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.id !== 'epxung' && b.ban === a.ban && !!SKILLS[b.id].dmg,
    lam(G, B, a, b) {
      B.t[a.o] = null;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
      b.epxung += 0.65; b.anim = { k: 'no', t: 0.25 }; b.sang = 1;
      const c = B.o[b.o]; FX.no('dien', c.x, c.y, 80, 0.4); FX.tiaLua(c.x, c.y, 16, '#ff9a3a', 200, 10);
      buffNo(b, 'toc', 1); // OVERCLOCK: bùng hào quang tốc (không nhãn chữ)
      return b;
    },
  },
};
SKILLS.no5 = { // Nỏ Năm Nhịp (Amor): phát thứ 5 bắn 3 mũi tên nổ
  vai: 'tc', dmg: 9.6, toc: 1.25, nham: 'dau',
  mo: (T) => '5th shot: 3 bolts ×2 blast 34 px · ' + (5 - (T.banLan % 5)) + ' shots left',
  ban(G, B, T, E) {
    const dmg = dmgU(T);
    if (T.banLan % 5 === 0) {
      giat(T, 1.4); const [x, y] = chopNong(T, 32); SND.tia();
      const ds = dsMucTieu(B).filter(Q => Q !== E).sort((p, q) => Math.hypot(p.x - E.x, p.y - E.y) - Math.hypot(q.x - E.x, q.y - E.y));
      [E, ds[0] || E, ds[1] || E].forEach((Q, i) => {
        banDan({ img: 'dan_tia', x, y, muc: Q, px: Q.x, py: Q.y, sp: 520, co: 26, B, T,
          trung(G, d) { noLan(d.x, d.y, 34, dmg * 2, B, { mau: '#ff8af0' }); FX.no('no_phao', d.x, d.y, 70, 0.4); FX.vong1(d.x, d.y, 4, 34, '#ff8af0', 0.3, 3); SND.no(0.3); } });
      });
      buffNo(T, 'crit', 1); // phát thứ 5: bùng ngắn
    } else {
      giat(T, 0.7); chopNong(T, 22); SND.lien();
      danThang(B, T, E, 'dan_tia', 600, 18, (G, d, M) => { if (M) trung(M, dmg, { B }); });
    }
  },
  veThem(ctx, T, S, al) { // 5 chấm nhịp dưới bệ
    const k = T.banLan % 5;
    for (let i = 0; i < 5; i++) PX.cham(ctx, (i - 2) * 6, S * 0.47, 7, i < k ? '#ff8af0' : '#555555', al * (i < k ? 1 : 0.3)); // chấm nhịp = fx_cham_trang tô màu
  },
};
SKILLS.bao = { // Súng Bão (Pantheon): trúng tức thì, cực nhanh; chậm lại khi đứng cạnh ụ cùng loại
  vai: 'tc', dmg: 5.2, toc: 4.5, tocSao: 0.05, nham: 'dau',
  mo(T) { const n = keCan(G.ban[T.ban], T.o).filter(N => N && N.id === 'bao' && !N.st.da).length; return 'Instant hits ' + tocU(T).toFixed(1) + '/s · 20% arc to a 2nd enemy' + (n ? ' · next to ' + n + ' ' + TEXT.turret.bao.name + ': −' + n * 30 + '% speed' : ''); },
  capNhat(G, B, T) { const n = keCan(B, T.o).filter(N => N && N.id === 'bao' && !N.st.da).length; T.buf.toc -= 0.3 * n; return false; },
  ban(G, B, T, E) {
    giat(T, 0.3); const [x, y] = dauNong(T); FX.no('chop_nong', x, y, 20, 0.05, T.goc); SND.set();
    trung(E, dmgU(T), { B, mau: '#9ffcff' });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.09, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#9ffcff' });
    if (Math.random() < 0.4) FX.no('dien', E.x, E.y, 26, 0.15);
    if (Math.random() < 0.2) { // ARC: tia sét nảy sang quái gần nhất (cơ chế mới của bậc TÍM họ Energy)
      let Q = null, best = 96; for (const X of dsMucTieu(B)) if (X !== E && !X.chet) { const dd = Math.hypot(X.x - E.x, X.y - E.y); if (dd < best) { best = dd; Q = X; } }
      if (Q) { trung(Q, dmgU(T) * 0.7, { B, mau: '#9ffcff' }); G.hu.push({ k: 'set', t: 0, song: 0.16, x: E.x, y: E.y, ds: [{ Q, x: Q.x, y: Q.y }], seed: Math.random() * 999 }); }
    }
  },
};
SKILLS.anhsang = { // Tháp Ánh Sáng (Venus): quả cầu sáng = số sao; định kỳ gọi ụ 1 sao
  vai: 'tc', dmg: 9.6, toc: 0.75, nham: 'dau', napMau: '#fff6c0',
  ky: (T) => Math.max(9, 21 - 1.6 * T.sao),
  mo: (T) => T.sao + ' orbs · summon 1★ turret every ' + SKILLS.anhsang.ky(T).toFixed(0) + ' s',
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap >= 1 && oTrong(B).length) {
      T.nap = 0; const N = trieu(B, true);
      if (N) { const c0 = tamU(T), c = B.o[N.o]; G.hu.push({ k: 'cauSang', t: 0, song: 0.45, x0: c0.x, y0: c0.y, x1: c.x, y1: c.y }); nhanU(T, 'LIGHT SUMMON', '#fff6c0', true); }
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
  vai: 'tc', dmg: 22.15, toc: 0.65, nham: 'dau',
  mo: (T) => '×' + (ms(T, 7) ? 6 : 4) + ' vs poisoned · kills explode ×2 in ' + (ms(T, 3) ? 70 : 50) + ' px' + (ms(T, 5) ? ' (poisons)' : ''),
  chonMuc(G, B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s - (biDoc(E) ? 400 : 0); if (r < best) { best = r; m = E; } } return m; },
  ban(G, B, T, E) {
    giat(T, 0.9); chopNong(T, 28); SND.tia();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 620, 24, (G, d, M) => {
      if (!M) return;
      const doc = biDoc(M); // độc thật (vũng / lây) hoặc dấu Venom
      trung(M, dmg * (doc ? (ms(T, 7) ? 6 : 4) : 1), { B, mau: doc ? '#9dff5a' : '#ffe46b' }); // 7★ PURGE
      FX.no(doc ? 'laser_trung' : 'dien', d.x, d.y, doc ? 50 : 30, 0.25);
    });
  },
  khiGiet(G, T, E) {
    const B = G.ban[T.ban] || G.ban[0], r = ms(T, 3) ? 70 : 50; // 3★ BIG BANG
    noLan(E.x, E.y, r, dmgU(T) * 2, B, { phu: true, mau: '#ffe46b' });
    if (ms(T, 5)) for (const Q of dsMucTieu(B)) if (!Q.chet && Math.hypot(Q.x - E.x, Q.y - E.y) < r) { Q.doc = Math.max(Q.doc, dmgU(T) * 1.2); Q.docT = Math.max(Q.docT, 3); Q.docB = B; } // 5★ TOXIC BLAST
    FX.no('no_phao', E.x, E.y, r * 2.2, 0.45); FX.vong1(E.x, E.y, 6, r, '#ffe46b', 0.35, 4); FX.lac(2);
    nhanU(T, 'PURIFY', '#ffe46b');
  },
};
SKILLS.dongbo = { // Pháo Đồng Bộ (Cosmem) — HỖ TRỢ (đợt vai trò): ụ Tấn công kề CÙNG SAO với nó +sát thương theo số cặp khớp (trần)
  vai: 'ht', dmg: 0, toc: 0, chiTC: true,
  khop: (T, N) => (ms(T, 7) ? Math.abs(N.sao - T.sao) <= 1 : N.sao === T.sao), // 7★ LOOSE SYNC: lệch 1★ vẫn khớp
  dem(B, T) { return HOTRO.oDich(T).map(o => B.t[o]).filter(N => HOTRO.nhan(T, N) && this.khop(T, N)).length; },
  v(T, m) { return (0.05 + 0.025 * Math.min(3, m)) * HOTRO.k(T); },
  mo(T) { const m = this.dem(G.ban[T.ban], T); return m + ' same-star Attack neighbours → +' + Math.round(this.v(T, Math.max(1, m)) * 100) + '% damage each' + (ms(T, 5) ? ' · 2+ matched: +' + Math.round(0.02 * HOTRO.k(T) * 100) + '% fire rate' : ''); },
  hoTro(G, T, N, ra) {
    if (!this.khop(T, N)) return;
    const m = this.dem(G.ban[T.ban], T);
    ra.dmg = this.v(T, m);
    if (ms(T, 5) && m >= 2) ra.toc = 0.02 * HOTRO.k(T); // 5★ PAIRED FIRE
  },
  capNhat(G, B, T, dt) { T.dong = this.dem(B, T); HOTRO.nhip(G, B, T, dt, '255,228,107', 2.2, 0.4); return true; },
  sangDau: (T) => (T.dong || 0) * 0.05,
};
SKILLS.vughep = { // Vua Ghép (Aurora King): kéo lên ụ CÙNG SAO → ụ đó +1 sao (bản vàng 10% → +2)
  vai: 'db', dmg: 16.67, toc: 0.9, nham: 'dau',
  sinh(G, T) { T.vang = Math.random() < 0.1; },
  mo: (T) => 'Drag onto same-star turret: +' + (T.vang ? 2 : 1) + '★, keeps its type' + (T.vang ? ' (GOLD)' : '') + ' · also on stone (stays stone) · Merge King + Merge King: one Merge King +1★',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#ffe46b', sp: 480 }); },
  ghepDB: {
    cungLoai: true, // Merge King + Merge King (cùng sao) → 1 Merge King sao kế tiếp (không ra ụ ngẫu nhiên)
    quaKhoa: true, // DCDW: Aurora King vẫn nâng sao ô ĐÁ (đá giữ nguyên, +★) → 2 ô đá cùng sao ghép được với nhau; ô băng cũng nhận +★
    hopLe: (a, b) => a.sao === b.sao && b.sao < LUAT.saoMax && b.ban === a.ban,
    xemSao: (a, b) => Math.min(LUAT.saoMax, b.sao + (b.id === 'vughep' ? 1 : a.vang ? 2 : 1)), // huy hiệu sao xem trước khi rê
    lam(G, B, a, b) {
      if (b.id === 'vughep') { // MK + MK: giữ ụ đích (Merge King), +1★ đúng 1 lần (không cộng +1★/+2★ đặc biệt chồng lên);
        // bản vàng: giữ vàng nếu 1 trong 2 là vàng (không quay lại 10% → tất định, 2 máy online ra cùng kết quả)
        B.t[a.o] = null;
        G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
        b.vang = !!(a.vang || b.vang);
        nangSao(B, b, 1, b.vang ? 'GOLD KING +1★' : 'MERGE KING +1★');
        return b;
      }
      B.t[a.o] = null;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
      nangSao(B, b, a.vang ? 2 : 1, a.vang ? 'GOLD KING +2★' : 'MERGE KING +1★');
      return b;
    },
  },
  veThem(ctx, T, S, al, R) { if (T.vang) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.35 + 0.15 * Math.sin(R.t * 5)); R.anhGiua(ctx, R.cham1('#ffd23f'), 0, 0, S * 1.4); } },
};
SKILLS.sinhdoi = { // Máy Sinh Đôi (Berit): khi GHÉP THƯỜNG gọi thêm 1 ụ ngẫu nhiên CÙNG SAO nguyên liệu (luôn có ô: ghép trả 1 ô)
  // · 2 Twin Maker ghép nhau / Twin + Mimic → đúng 1 ụ thêm (kỹ năng chạy 1 lần mỗi lần ghép).
  // · Ghép ĐẶC BIỆT (Merge King/Bộ Trộn… kéo vào Twin) KHÔNG kích hoạt: đó là kỹ năng của ụ kéo, không phải ghép thường (giữ như cũ).
  // · Không chữ nổi; tín hiệu = tia vàng + vòng vàng + biểu tượng 2 vòng nối (fx_sinhdoi_hieu) trên 2 ô — VX.sinhDoi.
  vai: 'db', dmg: 7.86, toc: 1.4, nham: 'dau',
  mo: (T) => 'On merge: also summons a random ' + T.sao + '★ turret',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_tia', co: 17, sp: 580 }); },
  ghep(G, B, a, b, ra) { sinhDoi(B, a.sao, b.o); },
};
SKILLS.hasao = { // Súng Hạ Sao (Giltine) — HỖ TRỢ (đợt vai trò): ụ Tấn công kề +sát thương; ghép ra ụ cạnh nó → bùng tốc 5 s;
  // PVP: lần đầu mỗi wave 1 ụ đối thủ lên 5★ → ụ đó −8% tốc 6 s · CO-OP: ụ sao thấp nhất của đồng đội +8% tốc 6 s · SOLO: ụ thấp nhất của mình
  vai: 'ht', dmg: 0, toc: 0, chiTC: true, napMau: '#ff4b3e',
  k: (T) => 0.10 * HOTRO.k(T),
  dot: (T) => 0.20 * HOTRO.k(T) / 1.45, // bùng tốc khi ghép cạnh (≈ +14% 1★ → +32% 7★)
  mo: (T) => 'Attack neighbours +' + Math.round(SKILLS.hasao.k(T) * 100) + '% damage · a merge next to it: +' + Math.round(SKILLS.hasao.dot(T) * 100) + '% fire rate 5s · first 5★ each wave: PVP rival −8% fire rate 6s / CO-OP lowest ally +8% 6s',
  hoTro(G, T, N, ra) { ra.dmg = this.k(T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '255,90,70', 2.6, 0.4);
    // theo dõi ụ lên 5★ (1 lần / wave)
    const D = banKhac(B), xem = G.che === 'solo' || !D ? [B] : [B, D];
    const da = T.da5 || (T.da5 = new Set()), dau = !T.da5Dau; T.da5Dau = 1;
    for (const X0 of xem) for (const X of X0.t) if (X && X.sao >= 5 && !da.has(X.uid)) {
      da.add(X.uid);
      if (dau || T.w5 === G.wave) continue;
      if (G.che === 'pvp' && X0 !== B) {
        T.w5 = G.wave; const c0 = B.o[T.o], c = X0.o[X.o];
        G.hu.push({ k: 'tiaTia', t: 0, song: 0.3, x0: c0.x, y0: c0.y, x1: c.x, y1: c.y, mau: '#ff3b3b' });
        if (!chanKhien(X0, X)) { X.giamT = 6; X.giamV = 0.08; FX.chu1(c.x, c.y - 20, '−8% FIRE RATE', '#ff4b3e', 11); }
        nhanU(T, 'STAR BREAK', '#ff4b3e', true);
      } else if (G.che !== 'pvp') {
        T.w5 = G.wave; const A = G.che === 'coop' && D ? D : B;
        const Y = A.t.filter(Z => Z && SKILLS[Z.id].vai === 'tc').sort((a, b) => a.sao - b.sao)[0];
        if (Y) { Y.tocT = Math.max(Y.tocT, 6); Y.tocV = Math.max(Y.tocV || 0, 0.08); const c = A.o[Y.o]; FX.chu1(c.x, c.y - 20, A === B ? '+8% FIRE RATE' : 'ALLY +8%', '#ffe46b', 11); }
      }
    }
    return true;
  },
};
SKILLS.saochep = { // Máy Sao Chép (Shamash): kéo lên ụ CÙNG SAO → thành bản sao của ụ đó (−50% sát thương)
  vai: 'db', dmg: 13.33, toc: 1.2, nham: 'dau',
  mo: () => 'Drag onto same-star turret: becomes a copy (−50% damage) · keeps its form (Awakened, Gold) and the Copycat\'s own buffs',
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 16, mau: '#ffe46b', sp: 480 }); },
  ghepDB: {
    hopLe: (a, b) => a.sao === b.sao && b.id !== 'saochep' && b.ban === a.ban,
    lam(G, B, a, b) {
      // DCDW Shamash: bản sao giữ DẠNG của ụ gốc (Sói thức tỉnh, Merge King vàng) + buff trên thân Copycat (Aurora, Ép Xung) — không quay ngẫu nhiên lại
      const N = chuyenU(B, a, b.id, a.sao); N.banSao = true;
      giuBienThe(N, b); N.aurora = Math.max(N.aurora || 0, a.aurora || 0); N.epxung = (N.epxung || 0) + (a.epxung || 0);
      const c0 = B.o[b.o], c = B.o[N.o]; tiaPhep(c0.x, c0.y, c.x, c.y, '#b98cff');
      nhanU(N, 'COPY', '#c9a2ff', true);
      return N;
    },
  },
};
SKILLS.ngoisao = { // Pháo Ngôi Sao (Darby): tổng ★ trên bàn — mỗi mốc 10 = mốc TỐC (+100% tốc khi đúng mốc, +10%/mốc đã qua); bội 50 = mốc SÁT THƯƠNG (+350% khi đúng mốc, +50%/mốc đã qua)
  vai: 'tc', dmg: 12.73, toc: 1.1, nham: 'dau',
  tong: (B) => B.t.reduce((s, X) => s + (X ? X.sao : 0), 0),
  // LUẬT (thuần, tất định — online dùng chung): n = tổng ★ → { toc, dmg, moc: mốc kế tiếp (hoặc mốc đang đứng), loai: 'toc'|'dmg', dung: đúng mốc }
  //   mốc tốc = bội 10 không phải bội 50 · mốc sát thương = bội 50
  //   toc = 0.10 × (số mốc tốc ≤ n) + (đúng mốc tốc ? 1.00 : 0) · dmg = 0.50 × (số mốc sát thương ≤ n) + (đúng mốc sát thương ? 3.50 : 0)
  luat(n) {
    n = Math.max(0, n | 0);
    const m10 = Math.floor(n / 10), m50 = Math.floor(n / 50), dung = n > 0 && n % 10 === 0;
    const moc = dung ? n : (m10 + 1) * 10, loai = moc % 50 === 0 ? 'dmg' : 'toc';
    return { toc: 0.1 * (m10 - m50) + (dung && loai === 'toc' ? 1 : 0), dmg: 0.5 * m50 + (dung && loai === 'dmg' ? 3.5 : 0), moc, loai, dung };
  },
  // bộ đếm kỹ năng = tổng ★ của MỌI ụ trên bàn của mình (không phải số Star Cannon) — hiện ở bảng chạm + tấm đếm trên bàn (demkn)
  demTT(T) { const n = this.tong(G.ban[T.ban]), L = this.luat(n), pc = (x) => Math.round(x * 100);
    return 'Board ★ ' + n + '/' + L.moc + (L.loai === 'dmg' ? ' (damage)' : ' (speed)') + ' · now +' + pc(L.toc) + '% fire rate, +' + pc(L.dmg) + '% damage'; },
  mo(T) { return this.demTT(T); },
  capNhat(G, B, T) {
    const n = this.tong(B), L = this.luat(n);
    T.buf.toc += L.toc; T.buf.dmg += L.dmg;
    const boi = L.dung && L.loai === 'toc', thuc = L.dung && L.loai === 'dmg';
    if (thuc && !T.thucTinh) SND.thucTinh();
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
  vai: 'tc', dmg: 14.44, toc: 1.8, nham: 'dau', tam: 108,
  // DCDW Werewolf: 30% ra bản THỨC TỈNH ngay khi triệu hồi; còn lại LỚN DẦN: PUP → HUNTER (3★ / 20 mạng) → AWAKENED (5★ / 50 mạng)
  sinh(G, T) { T.thuc = Math.random() < 0.3; T.giet = 0; if (T.thuc) setTimeout(() => { SND.thucTinh(); }, 250); },
  mo: (T) => 'Melee 108 px · ' + ['PUP', 'HUNTER: +40% speed', 'ALPHA: ×2 speed, always crits'][giaiDoan(T) - 1] + ' · kills ' + (T.giet || 0) + (ms(T, 7) ? ' · howl +25% to neighbours' : ''),
  luonCrit: (T) => giaiDoan(T) >= 3,
  chonMuc(G, B, T) { return quaiDauTam(B, T, this.tam); },
  capNhat(G, B, T, dt) {
    const s = giaiDoan(T);
    if (s >= 3) { T.buf.toc += 1; T.huT = (T.huT || 0) - dt; if (T.huT <= 0) { T.huT = 7; if (typeof VX !== 'undefined') VX.hu(T); } } // tiếng hú định kỳ
    else if (s === 2) T.buf.toc += 0.4;
    return false;
  },
  hoTro(G, T, N) { if (ms(T, 7)) N.buf.toc += 0.25; }, // 7★ ALPHA HOWL
  khiGiet(G, T) { T.giet = (T.giet || 0) + 1; },
  ban(G, B, T, E) {
    T.rv += 360; T.chop = 0.08; SND.dat();
    trung(E, dmgU(T), { B });
    noLan(E.x, E.y, 22, dmgU(T) * 0.4, B, { phu: true });
    G.hu.push({ k: 'vuot', t: 0, song: 0.22, x: E.x, y: E.y, goc: T.goc, mau: T.thuc ? '#ff4b3e' : '#ffe46b' });
  },
  sangDau: (T) => (T.gd === 3 ? 0.12 + 0.08 * Math.sin(G.t * 8) : 0),
  veThem(ctx, T, S, al, R) { if (T.gd === 3 && Math.random() < 0.1) { const c = tamU(T); FX.hat1('than', c.x + rnd(-14, 14), c.y + rnd(-6, 12), 0, -30, 0.6, 5, '#ff4b3e'); } },
};
SKILLS.tienhoa = { // Hộp Tiến Hoá (Moa): sau một lúc biến thành ụ ngẫu nhiên +1 sao (sao càng cao càng lâu)
  vai: 'db', dmg: 0, toc: 0, napMau: '#ffd23f',
  can: (T) => (20 + 6 * T.sao) * (ms(T, 3) ? 0.8 : 1), // 3★ FAST GROWTH
  mo: (T) => 'Evolves in ' + Math.max(0, SKILLS.tienhoa.can(T) - T.tuoi).toFixed(0) + 's → random ' + Math.min(7, T.sao + 1) + '★',
  gocDau: (T, t) => -Math.PI / 2 + t * (0.4 + T.nap * 3),
  sangDau: (T) => T.nap * T.nap * 0.5,
  capNhat(G, B, T) {
    T.nap = Math.min(1, T.tuoi / this.can(T));
    if (T.nap >= 1) {
      if (B.net && typeof ONS !== 'undefined' && ONS.on) return true; // bàn con rối online: chờ ảnh chụp bàn của bạn (không tự quay ụ khác máy bạn)
      let ds = deckTru(B, ['tienhoa']);
      if (ms(T, 7)) { const top = Math.max(...ds.map(id => TIERS[G.rosterMap[id].bac].thuTu)); ds = ds.filter(id => TIERS[G.rosterMap[id].bac].thuTu === top); } // 7★ ASCEND
      const them = ms(T, 5) && Math.random() < 0.25 ? 2 : 1; // 5★ BREAKTHROUGH
      const N = chuyenU(B, T, pick(ds), T.sao + them, true);
      VX.hen(0.5, () => nhanU(N, 'EVOLVE +' + them + '★ ' + (TEXT.turret[N.id] ? TEXT.turret[N.id].name.toUpperCase() : ''), '#ffd23f', true)); SND.ghep();
    }
    return true;
  },
};
SKILLS.cauvong = { // Máy Cầu Vồng (Yuna) — HỖ TRỢ (đợt vai trò): mỗi 7 s vẽ vệt cầu vồng phía trước quái đầu (quái trên vệt nhận +5% từ mọi ụ);
  // ụ Tấn công kề +sát thương vào quái đang đứng trên vệt
  vai: 'ht', dmg: 0, toc: 0, chiTC: true, napMau: '#ff6ad5',
  k: (T) => 0.13 * HOTRO.k(T),
  mo: (T) => 'Every 7s paints a rainbow trail ' + (6 + 0.5 * T.sao).toFixed(1) + 's: enemies on it take +5% from all · Attack neighbours +' + Math.round(SKILLS.cauvong.k(T) * 100) + '% vs enemies on it' + (ms(T, 5) ? ' · 2 trails' : '') + (ms(T, 7) ? ' · trail slows 10%' : ''),
  hoTro(G, T, N, ra) { ra.vet = this.k(T); },
  capNhat(G, B, T, dt) {
    HOTRO.nhip(G, B, T, dt, '255,106,213', 2.4, 0.5);
    T.nap = Math.min(1, T.nap + dt / 7);
    if (T.nap < 1) return true;
    const E = quaiDau(B); if (!E) return true;
    T.nap = 0; T.sang = 1; SND.mana();
    const L = 90 + 10 * T.sao, p = G.duong[E.p], dau = [clamp(E.s + 10, 0, p.len - L)];
    if (ms(T, 5)) dau.push(clamp(E.s - L - 30, 0, p.len - L)); // 5★ DOUBLE ARC
    for (const s0 of dau) {
      const pts = []; for (let s = s0; s <= s0 + L; s += 8) pts.push(viTri(p, s));
      G.hu.push({ k: 'cauvong', t: 0, song: 6 + 0.5 * T.sao, pts, p, s0, L, k2: 0.05, cham: ms(T, 7) ? 0.10 : 0, pvp: false, T, B });
    }
    nhanU(T, 'RAINBOW', '#ff6ad5', true);
    return true;
  },
};

// ===================================================== ĐỎ (Cổ đại, có kỹ năng chủ động: CHẠM Ụ khi nạp đầy) =====================================================
SKILLS.lophanung = { // Lò Phản Ứng Băng (Devil Cider Liza) — HỖ TRỢ (đợt vai trò): hào quang làm chậm quái quanh; ụ Tấn công kề +sát thương vào quái đang chậm;
  // chủ động: BÃO BĂNG đóng băng quái gần (không gây sát thương). Không bắn.
  vai: 'ht', dmg: 0, toc: 0, chiTC: true, napMau: '#9fe6ff',
  r: (T) => 110 + 5 * T.sao + (ms(T, 3) ? 20 : 0), // 3★ COLD FRONT
  cham: (T) => Math.min(0.35, 0.15 + 0.02 * (T.sao - 1)),
  k: (T) => 0.14 * HOTRO.k(T),
  mo: (T) => 'Aura ' + SKILLS.lophanung.r(T) + ' px slows ' + Math.round(SKILLS.lophanung.cham(T) * 100) + '% (bosses 15%) · Attack neighbours +' + Math.round(SKILLS.lophanung.k(T) * 100) + '% vs slowed · TAP when full: FREEZE nearby ' + (ms(T, 5) ? 4 : 2.5) + 's',
  hoTro(G, T, N, ra) { ra.lanh = this.k(T); },
  capNhat(G, B, T, dt) {
    const r = this.r(T), ds = quaiTrongTam(B, T, r);
    xoayDau(T, ds.length ? quaiDauTam(B, T, r) : null, dt);
    T.nap = Math.min(1, T.nap + dt / 24);
    if (T.bungT > 0) T.bungT -= dt;
    T.tick = (T.tick || 0) - dt;
    if (T.tick <= 0) {
      T.tick = 0.4;
      const c = this.cham(T);
      for (const E of ds) {
        E.chamT = Math.max(E.chamT, 1); if (!E.d.khangCham) E.cham = Math.max(E.cham, Math.min(c, E.trum ? HOTRO.CHAM_TRUM : c));
        if (ms(T, 5) && E.trum) E.tempoT = 0.6; // 5★ DEEP COLD: trùm tung chiêu chậm 25%
        if (ms(T, 7)) E.azT = 0.6;               // 7★ ABSOLUTE ZERO: +10% sát thương từ mọi nguồn
        if (Math.random() < 0.3) FX.hat1('lua', E.x, E.y, rnd(-10, 10), -20, 0.4, 6, '#bff4ff');
      }
      if (ds.length && !B.ai && Math.random() < 0.3) SND.bang();
    }
    if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && T.napDay > 6 && this.aiNen(G, B, T)) this.chuDong(G, B, T); } else T.napDay = 0;
    return true;
  },
  aiNen: (G, B, T) => quaiTrongTam(B, T, SKILLS.lophanung.r(T) * 1.6).length >= 5 || G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E)),
  chuDong(G, B, T) {
    if (T.nap < 1) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2); T.bungT = 1.6;
    const c = tamU(T), r = this.r(T) * 1.6, dai = ms(T, 5) ? 4 : 2.5; // 5★ PERMAFROST
    for (const E of quaiTrongTam(B, T, r)) { E.chan = Math.max(E.chan, E.trum ? 0.8 : dai); E.chamT = Math.max(E.chamT, 3); FX.no('bang_vo', E.x, E.y, 70, 0.5); }
    FX.vong1(c.x, c.y, 20, r, '#bff4ff', 0.6, 6); FX.sang(0.4, '#bff4ff'); FX.lac(6); SND.mv(); SND.bang();
    nhanU(T, 'ICE STORM!', '#bff4ff', true);
    return true;
  },
  veThem(ctx, T, S, al, R) { // vùng lạnh quanh lò: vòng nét đứt mảnh + quầng
    const r = this.r(T);
    ctx.globalCompositeOperation = 'lighter';
    // (quầng tầm lạnh to bỏ: phóng ảnh chấm sáng lên cỡ cả bàn lộ mép tròn như vòng tầm — QUY-TAC-HINH 1)
    // (vòng tầm nét đứt vẽ code ĐÃ BỎ — QUY-TAC-HINH 1, ảnh người dùng vetay_board_rings.png; tầm lạnh = quầng PNG ở trên)

  },
};
SKILLS.haoquang = { // Hào Quang Thánh (Halo Mona) — ĐẶC BIỆT (đợt vai trò): KHÔNG bắn; chủ động: hàng rào BẤT TỬ ngắn cho cả đội (quái thường lọt không mất tim,
  // chặn chiêu đối thủ) — chiêu TRÙM chỉ bị giảm nhẹ (không huỷ hẳn); hồi chiêu dài, không duy trì liên tục
  vai: 'db', dmg: 0, toc: 0, napMau: '#fff6c0',
  ky: (T) => Math.max(28, 40 - 2 * T.sao),
  tg: (T) => 2 + (ms(T, 3) ? 0.5 : 0) + (ms(T, 7) ? 1 : 0),
  mo: (T) => (T.nap >= 1 ? 'READY' : 'charging ' + Math.round(T.nap * 100) + '%') + ' · TAP: team invulnerable ' + SKILLS.haoquang.tg(T) + 's (leaks cost no hearts; boss skills only weakened) · cooldown ' + SKILLS.haoquang.ky(T) + 's' + (ms(T, 5) ? ' · cleanses' : '') + (ms(T, 7) ? ' · +30% speed' : ''),
  gocDau: (T, t) => (T.pha || 0) + t * 0.3,
  capNhat(G, B, T, dt) {
    T.nap = Math.min(1, T.nap + dt / this.ky(T));
    if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && this.aiNen(G, B, T) && (T.napDay > 0.3)) this.chuDong(G, B, T); } else T.napDay = 0;
    return true;
  },
  aiNen: (G, B) => G.quai.some(E => E.trum && E.bao && E.ban === B.i) || B.t.some(X => X && (X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0)) || (B.tim <= 1 && G.quai.some(E => !E.chet && banDuocQuai(B, E) && G.duong[E.p].len - E.s < 80)),
  chuDong(G, B, T) {
    if (T.nap < 1) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1;
    const tg = this.tg(T), doi = G.che === 'coop' ? G.ban : [B];
    for (const X0 of doi) {
      X0.halo = Math.max(X0.halo || 0, tg); X0.khien = Math.max(X0.khien, tg);
      for (const X of X0.t) if (X) {
        if (ms(T, 5)) { if (X.st.bang > 0 || X.st.da || X.st.lua > 0 || X.st.kep > 0) VX.donSach(X0, X); X.st.bang = 0; X.st.da = false; X.st.lua = 0; X.st.kep = 0; X.st.ngam = 0; } // 5★ PURGE
        if (ms(T, 7)) { X.tocT = Math.max(X.tocT, tg + 2); X.tocV = Math.max(X.tocV, 0.3); } // 7★ BLESSING
      }
    }
    const c = tamU(T);
    FX.vong1(c.x, c.y, 20, 260, '#fff6c0', 0.7, 6); FX.sang(0.45, '#fff6c0'); SND.mv();
    for (const X of B.t) if (X && X !== T) { const n = B.o[X.o]; tiaPhep(c.x, c.y, n.x, n.y, '#fff6c0'); }
    nhanU(T, 'HOLY HALO!', '#fff6c0', true);
    return true;
  },
  veThem(ctx, T, S, al, R) { if (T.nap >= 1) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.35 + 0.25 * Math.sin(R.t * 6)); R.anhGiua(ctx, R.cham1('#fff6c0'), 0, 0, S * 1.6); } },
};

// Cryo Reactor: quái đóng băng VỠ VỤN → nổ băng (lớp nổ + mảnh băng + than lạnh đọng lại)
function voBang(T, B, x, y, dmg) {
  noLan(x, y, 50, dmg, B, { phu: true, mau: '#bff4ff' });
  FX.no('bang_vo', x, y, 96, 0.45); FX.no('laser_trung', x, y, 70, 0.3); FX.vong1(x, y, 6, 50, '#bff4ff', 0.32, 4);
  for (let i = 0; i < 10; i++) { const a = i * 0.628 + Math.random() * 0.3, v = rnd(120, 220); FX.hat1('lua', x, y, Math.cos(a) * v, Math.sin(a) * v, 0.35, 9, i % 2 ? '#ffffff' : '#9fe6ff'); }
  for (let i = 0; i < 4; i++) FX.hat1('than', x + rnd(-14, 14), y + rnd(-10, 10), rnd(-10, 10), rnd(-26, -12), 0.6, 5, '#bff4ff');
  if (TVX.duocLac(0.5)) FX.lac(3);
  SND.bang();
}
HU.voBang = { // Cryo Reactor: theo dõi quái bị BÃO BĂNG đóng băng; chết sớm hoặc tan băng → vỡ nổ
  cap(G, o) {
    for (const E of o.ds) if (!E._vo && E.chet) { E._vo = 1; voBang(o.T, o.B, E.x, E.y, o.dmg); }
    return false;
  },
  het(G, o) { let i = 0; for (const E of o.ds) if (!E._vo) { E._vo = 1; const x = E.x, y = E.y; VX.hen(0.06 * i++, () => voBang(o.T, o.B, x, y, o.dmg)); } },
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
    if (o.yw) { // Time Bomb (Đặc biệt): nổ KHÔNG sát thương — làm yếu quái quanh (+10% nhận vào, cộng trần chung 25%) · 5★ choáng
      for (const E of dsMucTieu(o.B)) if (!E.chet && Math.hypot(E.x - o.x, E.y - o.y) <= o.r + E.d.co * 0.25) {
        E.ywT = Math.max(E.ywT || 0, o.ywDai); E.ywK = o.yw; E.yeu = Math.max(E.yeu, o.ywDai);
        if (o.soc && !E.trum) E.chan = Math.max(E.chan, o.soc);
      }
      FX.chu1(o.x, o.y - 26, 'WEAKENED', '#ffb35a', 11);
    } else noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#ffb35a' });
    FX.no('no_phao', o.x, o.y, o.r * 2.6, 0.5); FX.vong1(o.x, o.y, 4, o.r, '#ffb35a', 0.35, 4); FX.tiaLua(o.x, o.y, 14, '#ffb060', 220); FX.lac(3); SND.no(0.6);
  },
  ve(ctx, o, R) {
    const con = Math.max(0, o.song - o.t), nhay = con < 1.5 ? Math.sin(o.t * 40) > 0 : Math.sin(o.t * 10) > 0;
    if (!R.ve1(ctx, 'ic_bom', 17, '', o.x + 8, o.y - 11)) R.anhGiua(ctx, 'dan_phao', o.x + 8, o.y - 10, 15, -0.6); // bom ChatGPT (S2)
    if (nhay) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1('#ff3b3b'), o.x + 8, o.y - 14, 16); ctx.globalCompositeOperation = 'source-over'; }
    ctx.font = '900 11px ' + FONT.display; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
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
    PX.bong(ctx, o.x + 3, o.y + 8, 18, 18, 0.35);
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
    if (!R.ve1(ctx, 'hu_min', o.sao3 ? 20 : 16, '', o.x, o.y)) R.anhGiua(ctx, 'dan_phao', o.x, o.y, o.sao3 ? 18 : 14, 0); // mìn ChatGPT (S4)
    if (Math.sin(o.t * 6 + o.x) > 0.3) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1(o.sao3 ? '#ffd23f' : '#ff3b3b'), o.x, o.y - 3, o.sao3 ? 22 : 12); ctx.globalCompositeOperation = 'source-over'; }
  },
};
// Dải ảnh PNG chạy LIỀN dọc làn (qua góc rẽ không tách đôi): đoạn thẳng = ảnh lặp theo chiều dài; góc rẽ = khúc cong
// (quạt các lát ảnh mỏng xoay quanh tâm bên trong góc, bán kính trong r0) → ray/dải màu uốn liền, không hở, không chồng sáng.
// Toạ độ ảnh = s (độ dài trên đường) × k + lệch → không bắt đầu lại từ mỗi đoạn, không lật ảnh ở góc.
// Vẽ đục vào canvas phụ (o._cv) rồi dán 1 lần với độ mờ → chỗ nối không sáng gấp đôi. Trả false nếu thiếu dữ liệu.
function veDaiDuong(ctx, o, img, P, sA, sB, h, lech, alpha, r0) {
  if (!(sB > sA)) return true;
  r0 = r0 == null ? 8 : r0;
  const m0 = ctx.getTransform(), sc = Math.max(1, Math.hypot(m0.a, m0.b)), k = img.height / h, IW = img.width;
  // khung bao (tính 1 lần cho mỗi vệt — vệt không đổi chỗ)
  if (!o._bb || o._sc !== sc) { o._khoa = null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const pad = h + r0 + 4;
    const them = (x, y) => { x0 = Math.min(x0, x - pad); y0 = Math.min(y0, y - pad); x1 = Math.max(x1, x + pad); y1 = Math.max(y1, y + pad); };
    const sMax = o.s0 != null && o.L != null ? o.s0 + o.L : sB;
    them(...viTri(P, o.s0 != null ? o.s0 : sA)); them(...viTri(P, sMax));
    for (const g of P.segs) if (g.s0 > (o.s0 != null ? o.s0 : sA) && g.s0 < sMax) them(g.x0, g.y0);
    o._bb = [x0, y0, x1 - x0, y1 - y0];
    const cv = o._cv || (o._cv = document.createElement('canvas'));
    cv.width = Math.ceil(o._bb[2] * sc); cv.height = Math.ceil(o._bb[3] * sc); o._sc = sc;
  }
  const [bx, by, bw, bh] = o._bb, cv = o._cv, S = o._sc;
  const khoa = Math.round(lech / 3) + '|' + Math.round(sB * 2); // ảnh trôi 60 px/s → vẽ lại canvas phụ khi lệch ≥ 3 px ảnh (≈1 px màn) hoặc vệt dài thêm
  if (o._khoa === khoa) return dan();
  o._khoa = khoa; lech = Math.round(lech / 3) * 3;
  const c = cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  const tx = (s) => (((s * k + lech) % IW) + IW) % IW;
  const khung = (x, y, g) => { const co = Math.cos(g), si = Math.sin(g); c.setTransform(S * co, S * si, -S * si, S * co, S * (x - bx), S * (y - by)); };
  const gocs = P.segs.map((g, i) => { // góc rẽ ở đầu đoạn i (i>0): góc quay, cắt bớt t mỗi bên
    if (i === 0) return null;
    const q = P.segs[i - 1], gA = Math.atan2(q.dy, q.dx), gB = Math.atan2(g.dy, g.dx);
    let d = gB - gA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    if (Math.abs(d) < 0.01) return null;
    const th = Math.abs(d), t = Math.min((r0 + h / 2) * Math.tan(th / 2), q.len / 2, g.len / 2);
    return { gA, d, th, t, sJ: g.s0, x: g.x0, y: g.y0, sg: Math.sign(d) };
  });
  // đoạn thẳng
  P.segs.forEach((g, i) => {
    const ta = gocs[i] ? gocs[i].t : 0, tb = gocs[i + 1] ? gocs[i + 1].t : 0;
    let a0 = Math.max(sA, g.s0 + ta), a1 = Math.min(sB, g.s0 + g.len - tb);
    if (a1 <= a0) return;
    const goc = Math.atan2(g.dy, g.dx);
    khung(g.x0, g.y0, goc);
    for (let s = a0; s < a1 - 1e-3;) {
      const x = tx(s), cw = Math.min(IW - x, (a1 - s) * k), w = cw / k, cuoi = s + w >= a1 - 1e-3;
      c.drawImage(img, x, 0, Math.max(0.5, cw), img.height, s - g.s0, -h / 2, w + (cuoi ? 0 : 0.6), h);
      s += w;
    }
  });
  // khúc cong ở góc rẽ: quạt lát ảnh quanh tâm C (bên trong góc), cùng hướng dải (không lật)
  for (const G2 of gocs) {
    if (!G2) continue;
    const f0 = Math.max(sA, G2.sJ - G2.t), f1 = Math.min(sB, G2.sJ + G2.t);
    if (f1 <= f0) continue;
    const ca = Math.cos(G2.gA), sa = Math.sin(G2.gA), nIx = -sa * G2.sg, nIy = ca * G2.sg, R0 = r0 + h / 2;
    const cx = G2.x + nIx * R0 - ca * G2.t, cy = G2.y + nIy * R0 - sa * G2.t;
    const n = Math.max(2, Math.ceil(G2.th * (f1 - f0) / (2 * G2.t) / 0.045)), ds = (f1 - f0) / n;
    for (let j = 0; j < n; j++) {
      const s = f0 + j * ds, psi = G2.gA + G2.d * (s - (G2.sJ - G2.t)) / (2 * G2.t);
      khung(cx, cy, psi);
      const x = tx(s + ds / 2), cw = Math.max(0.6, Math.min(IW - x, ds * k)), w = (r0 + h) * G2.th * ds / (2 * G2.t) + (j === n - 1 ? 0.2 : 0.8);
      c.drawImage(img, x, 0, cw, img.height, 0, -G2.sg * R0 - h / 2, w, h);
    }
  }
  return dan();
  function dan() {
    const ga = ctx.globalAlpha, co = ctx.globalCompositeOperation;
    ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(cv, bx, by, bw, bh);
    ctx.globalAlpha = ga; ctx.globalCompositeOperation = co;
    return true;
  }
}
HU.cauvong = { // cầu vồng trên đường
  veLien(ctx, o, R, dai, a) { // dài hiện tăng dần 0,5 s đầu (đầu vệt mọc, quẹo mượt qua góc)
    const h = 22, sE = o.s0 + o.L * Math.min(1, o.t / 0.5);
    veDaiDuong(ctx, o, dai, o.p, o.s0, Math.max(o.s0 + 8, sE), h, R.t * 60, a * 0.85);
  },
  duoi: true,
  cap(G, o) {
    for (const E of G.quai) {
      if (E.chet) continue;
      let gan = false; for (const q of o.pts) if (Math.abs(q[0] - E.x) < 20 && Math.abs(q[1] - E.y) < 20) { gan = true; break; }
      if (!gan) continue;
      if (o.pvp) { if (G.duong[E.p].ban !== o.B.i) E.giapT = 0.6; }
      else { E.cvT = 0.6; E.cvK = Math.max(E.cvT > 0 && E.cvK || 0, o.k2); }
      if (o.cham && !E.d.khangCham && !o.pvp) { E.cham = Math.max(E.cham, Math.min(o.cham, E.trum ? 0.15 : 0.35)); E.chamT = Math.max(E.chamT, 0.6); } // Rainbow 7★: vệt làm chậm
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = Math.min(1, o.t / 0.3) * (u > 0.85 ? (1 - u) / 0.15 : 1);
    const mau = ['#ff4b6b', '#ff9a3a', '#ffe46b', '#4bff9a', '#4fb8ff', '#c77dff'];
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const n = Math.max(2, Math.floor(o.pts.length * Math.min(1, o.t / 0.5)));
    const dai = R.img('hu_cauvong'); // dải cầu vồng ChatGPT (S5), lặp ngang dọc đường
    if (dai && o.p) { // vẽ LIỀN qua góc rẽ: từng đoạn thẳng + khúc cong (quạt ảnh) ở góc, toạ độ ảnh nối tiếp theo chiều dài đường
      this.veLien(ctx, o, R, dai, a);
      if (Math.random() < 0.3) { const q = pick(o.pts); FX.hat1('lua', q[0] + rnd(-10, 10), q[1] + rnd(-10, 10), 0, -20, 0.5, 5, pick(mau)); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt'; return;
    }
    if (dai) {
      const h = 22, sw = 8.6 * dai.height / h; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * 0.85;
      const m0 = ctx.getTransform();
      for (let i = 0; i < n; i++) {
        const [x, y, g] = o.pts[i], c = Math.cos(g), s = Math.sin(g), sx = Math.min(dai.width - sw, (i * 8 * dai.height / h + R.t * 60) % dai.width);
        ctx.setTransform(m0.a * c, m0.a * s, -m0.a * s, m0.a * c, m0.e + m0.a * x, m0.f + m0.a * y);
        ctx.drawImage(dai, sx, 0, sw, dai.height, -4.3, -h / 2, 8.6, h);
      }
      ctx.setTransform(m0);
      if (Math.random() < 0.3) { const q = pick(o.pts); FX.hat1('lua', q[0] + rnd(-10, 10), q[1] + rnd(-10, 10), 0, -20, 0.5, 5, pick(mau)); }
      ctx.globalAlpha = 1; ctx.lineCap = 'butt'; return;
    }
    // ảnh dải cầu vồng chưa nạp: không vẽ (bỏ 6 nét màu vẽ code)
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
