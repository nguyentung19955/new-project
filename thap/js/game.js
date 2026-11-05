// TURRET MERGE — lõi luật chơi (DCDW): bàn 5×3, triệu hồi, ghép, nâng cấp, wave, trùm, 3 chế độ
'use strict';

const G = {
  che: 'solo', ban: [], duong: [], quai: [], dan: [], hu: [], bay: [],
  wave: 0, tWave: 0, hang: [], t: 0, tocDo: 1, dung: false, ketThuc: null, chung: false,
  uid: 1, chonBan: null, cho: 0, debug: {},
};
// bước mô phỏng CỐ ĐỊNH (giây). Tăng tốc 2×/3× = chạy NHIỀU bước hơn mỗi khung, không bao giờ dùng bước to hơn.
const BUOC = 1 / 60;
// chụp trạng thái TRƯỚC mỗi bước mô phỏng → lúc vẽ nội suy giữa trạng thái cũ và mới (chuyển động không bị giật)
function chupTruoc() {
  for (const E of G.quai) { E._x = E.x; E._y = E.y; E._g = E.gv; }
  for (const d of G.dan) { d._x = d.x; d._y = d.y; d._z = d.z || 0; }
  for (const B of G.ban) for (const T of B.t) if (T) { T._g = T.goc; T._rx = T.rx; }
  for (const o of G.hu) {
    if (o.x !== undefined) { o._x = o.x; o._y = o.y; }
    if (o.ds) for (const q of o.ds) { q._x = q.x; q._y = q.y; }
  }
}

// ---------- tiện ích ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rint(a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function gocLech(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
function rosterOf(id) { return G.rosterMap[id]; }
function tierOf(id) { const r = G.rosterMap[id]; return TIERS[r ? r.bac : 'trang']; }

// ---------- đường đi ----------
function taoDuong(d) {
  const segs = []; let s = 0;
  for (let i = 0; i < d.pts.length - 1; i++) {
    const [x0, y0] = d.pts[i], [x1, y1] = d.pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    segs.push({ x0, y0, x1, y1, len, dx: (x1 - x0) / len, dy: (y1 - y0) / len, s0: s });
    s += len;
  }
  const p = { pts: d.pts, segs, len: s, ban: d.ban, sNhap: Infinity };
  if (d.nhap != null) p.sNhap = segs[d.nhap].s0;
  return p;
}
function viTri(p, s) {
  s = clamp(s, 0, p.len);
  for (const g of p.segs) if (s <= g.s0 + g.len) { const u = s - g.s0; return [g.x0 + g.dx * u, g.y0 + g.dy * u, Math.atan2(g.dy, g.dx)]; }
  const g = p.segs[p.segs.length - 1]; return [g.x1, g.y1, Math.atan2(g.dy, g.dx)];
}

// ---------- tạo trận ----------
function taoBan(def, i, deck, mv) {
  const B = {
    i, x: def.x, y: def.y, w: def.w, h: def.h, ai: def.ai, ten: def.ten,
    o: [], t: Array(15).fill(null), mana: LUAT.manaDau, gia: LUAT.giaTrieu, deck: deck.slice(), lv: {},
    tim: G.che === 'pvp' ? LUAT.timPvp : LUAT.timSolo, aiT: 0.8,
    mv: { id: mv, gia: MAVUONG[mv].gia, cd: 0 }, cuong: 0, khien: 0, phao: 0, phaoSao: 1, phaoT: 0, dem: { giet: 0 },
    manaNay: 0,
  };
  for (const id of deck) B.lv[id] = 1;
  for (let h = 0; h < 3; h++) for (let c = 0; c < 5; c++) B.o.push({ x: def.x + KHAY_COT[c] * def.w, y: def.y + KHAY_HANG[h] * def.h, c, h });
  B.cw = def.w * (KHAY_COT[1] - KHAY_COT[0]); B.ch = def.h * (KHAY_HANG[1] - KHAY_HANG[0]);
  return B;
}

function deckNgauNhien(tru) {
  const co = G.roster.filter(r => SKILLS[r.id] && !(tru || []).includes(r.id));
  const ds = []; let coDo = false;
  while (ds.length < 5 && co.length) {
    const r = co.splice(rint(co.length), 1)[0];
    if (r.bac === 'do') { if (coDo) continue; coDo = true; }
    ds.push(r.id);
  }
  return ds;
}

function batDau(che, deck, mv) {
  G.che = che; G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.bay.length = 0; G.hang.length = 0;
  G.wave = 0; G.tWave = 0; G.t = 0; G.ketThuc = null; G.dung = false; G.cho = 1.2;
  FX.reset(); VX.reset();
  const bc = boCuc(che);
  G.chung = !!bc.chung;
  G.ban = bc.ban.map((d, i) => taoBan(d, i, i === 0 ? deck : (G.debug.deck2 || deckNgauNhien()), i === 0 ? mv : pick(Object.keys(MAVUONG))));
  G.duong = bc.duong.map(taoDuong);
  if (G.debug.mana) for (const B of G.ban) B.mana = G.debug.mana;
  if (G.debug.wave) G.wave = G.debug.wave - 1;
  if (G.debug.fill) for (const B of G.ban) for (let i = 0; i < 15; i++) { const T = trieu(B, true); if (T) T.sao = clamp(1 + rint(G.debug.fill), 1, 7); }
  REN.lamNen();
  UI.vaoTran();
}

// ---------- ụ súng ----------
function taoU(B, id, sao, o) {
  const r = rosterOf(id);
  return {
    uid: G.uid++, id, sao, bac: r.bac, ban: B.i, o, goc: -Math.PI / 2 + rnd(-0.4, 0.4), vgoc: 0, rx: 0, rv: 0,
    cd: rnd(0.1, 0.6), anim: null, st: { bang: 0, da: false, lua: 0, ngam: 0, kep: 0 }, buf: { toc: 0, dmg: 0, crit: 0, cham: 0, chet: 0 },
    nap: 0, muc: null, pha: Math.random() * 6.28, sang: 0, aurora: 0, chop: 0, lvSang: 0, banLan: 0,
    khien: 0, tocT: 0, tocV: 0, epxung: 0, banSao: false, nhanT: 0, tuoi: 0,
  };
}
// gọi hook 'sinh' của kỹ năng khi ụ xuất hiện (vd. Sói Máy 30% ra bản thức tỉnh)
function sinhU(T) { const sk = SKILLS[T.id]; if (sk && sk.sinh) sk.sinh(G, T); return T; }
// bàn còn lại (PVP = đối thủ, CO-OP = đồng đội), SOLO = null
function banKhac(B) { return G.ban.find(X => X !== B) || null; }
function oTrong(B) { const ds = []; for (let i = 0; i < 15; i++) if (!B.t[i]) ds.push(i); return ds; }
function trieu(B, mienPhi, idEp) {
  const tr = oTrong(B); if (!tr.length) return null;
  if (!mienPhi) { if (B.mana < B.gia) return null; B.mana -= B.gia; B.gia += LUAT.giaTrieuTang; }
  const o = pick(tr);
  const id = idEp || pick(B.deck);
  const T = sinhU(taoU(B, id, 1, o));
  B.t[o] = T;
  VX.trieu(T); // hiệu ứng triệu hồi theo thời gian thực (hieuung.js) — không chặn thao tác, luật chơi không chờ hoạt ảnh
  return T;
}
function hopLeGhep(a, b) {
  if (!a || !b || a === b) return false;
  if (a.st.bang > 0 || b.st.bang > 0) return false;
  if (!a.st.da && !b.st.da && ghepDacBiet(a, b)) return true; // ghép đặc biệt (có loại không cần cùng sao)
  if (a.sao !== b.sao || a.sao >= LUAT.saoMax) return false;
  if (a.st.da || b.st.da) return a.st.da && b.st.da; // đá chỉ ghép với đá cùng sao
  if (a.id === b.id) return true;
  return a.id === 'mimic' || b.id === 'mimic'; // MIMIC ghép với BẤT KỲ ụ cùng sao
}
// ghép ĐẶC BIỆT (Bộ Trộn, Dịch Chuyển, Ép Xung, Vua Ghép, Sao Chép…): kỹ năng của ụ KÉO quyết định
function ghepDacBiet(a, b) {
  if (a.id === b.id) return null;
  const sa = SKILLS[a.id];
  if (sa && sa.ghepDB && sa.ghepDB.hopLe(a, b)) return { sk: sa, a, b };
  const sb = SKILLS[b.id]; // Bộ Trộn ghép được cả 2 chiều
  if (sb && sb.ghepDB && sb.ghepDB.haiChieu && sb.ghepDB.hopLe(b, a)) return { sk: sb, a: b, b: a, dao: true };
  return null;
}
// ghép a (kéo) vào b → ở ô b ra ụ NGẪU NHIÊN trong bộ bài, +1 sao (luật DCDW / Random Dice)
function ghep(B, a, b, ep) {
  if (!ep && !hopLeGhep(a, b)) return null;
  const B2 = G.ban[b.ban];
  if (!ep && a.id !== b.id) {
    const db = ghepDacBiet(a, b);
    if (db) { const r = db.sk.ghepDB.lam(G, B2, db.a, db.b, db.dao); SND.ghep(); return r; }
  }
  const coMimic = a.id === 'mimic' || b.id === 'mimic';
  const ra = sinhU(taoU(B2, pick(B2.deck), Math.min(LUAT.saoMax, b.sao + 1), b.o));
  B2.t[a.o] = null; B2.t[b.o] = ra;
  ra.goc = b.goc;
  if (coMimic) ra.aurora = 8; // Aurora: ghép xong được buff tấn công
  // hiệu ứng ghép (thời gian thực): ụ kéo bay vòng cung → nén → chớp → quay số thẻ → lộ kết quả bật nảy + sóng tròn + huy hiệu sao
  VX.ghep(B2, a, b, ra);
  // kỹ năng KHI GHÉP của 2 ụ nguyên liệu (mana, gọi ụ, khiên, phá đối thủ…) — nhãn chữ hiện lúc kết quả lộ ra
  const kh = [];
  G._treNhan = VX.TRE_LO;
  for (const id of new Set([a.id, b.id])) { const sk = SKILLS[id]; if (sk && sk.ghep) { sk.ghep(G, B2, a, b, B2.t[b.o] || ra); kh.push(id); } }
  G._treNhan = 0;
  if (kh.length) VX.kichHoat(B2, b.o, kh);
  const kq = B2.t[b.o] || ra;
  if (kq.sao > b.sao) VX.hen(VX.TRE_LO, () => { const c = B2.o[b.o]; FX.chu1(c.x, c.y - 26, '+1★', '#ffe46b', 18, 'to'); });
  if (kq === ra) mocMoi(ra, b.sao, VX.TRE_LO + 0.12);
  SND.ghep(kq.sao, B2.ai);
  return ra;
}
function nangCap(B, id) {
  const lv = B.lv[id]; if (lv >= 5) return false;
  const gia = LUAT.giaNangCap[lv - 1];
  if (B.mana < gia) return false;
  B.mana -= gia; B.lv[id] = lv + 1;
  for (const T of B.t) if (T && T.id === id) { T.lvSang = 1; }
  if (!B.ai) SND.nang(B.lv[id]);
  return true;
}
function dungMV(B) {
  const mv = B.mv, d = MAVUONG[mv.id];
  if (mv.cd > 0 || B.mana < mv.gia) return false;
  B.mana -= mv.gia; mv.gia *= 2; mv.cd = d.cd; // mana NHÂN ĐÔI mỗi lần dùng
  const cx = B.x + B.w / 2, cy = B.y + B.h / 2, nguoi = !B.ai && B === G.ban[0];
  const lam = () => {
    if (!G.ban.includes(B) || G.ketThuc) return;
    if (mv.id === 'hero') { trieu(B, true); trieu(B, true); }
    if (mv.id === 'dahlia') { B.cuong = 10; FX.sang(0.5, '#ff7a3a'); }
    if (mv.id === 'eve') {
      B.khien = 8;
      for (const T of B.t) if (T) { if (T.st.bang > 0 || T.st.da || T.st.lua > 0) VX.donSach(B, T); T.st.bang = 0; T.st.da = false; T.st.lua = 0; T.st.ngam = 0; }
      FX.sang(0.4, '#9fe6ff');
    }
    FX.vong1(cx, cy, 20, 240, d.mau || '#ffffff', 0.6, 6);
    if (!nguoi) FX.chu1(cx, cy, d.ten, '#fff', 22, 'to'); // bàn máy/đồng đội: chữ nhỏ (đã kẹp trong màn); người chơi: cut-in
  };
  // người chơi: cut-in chân dung chỉ huy ~2,2 s (lớp phủ) — hiệu ứng kỹ năng nổ NGAY, không chờ dải cut-in
  if (nguoi && typeof UI !== 'undefined' && UI.cutIn) UI.cutIn(mv.id, B);
  lam();
  SND.mv();
  return true;
}

// ---------- chỉ số ----------
function dmgU(T) {
  const sk = SKILLS[T.id], B = G.ban[T.ban];
  let d = (sk.dmg || 0) * TIERS[T.bac].hs * (1 + 0.85 * (T.sao - 1)) * (1 + 0.18 * ((B.lv[T.id] || 1) - 1));
  d *= 1 + T.buf.dmg;
  if (T.aurora > 0) d *= 1.5;
  if (T.banSao) d *= 0.5; // bản sao của Máy Sao Chép: −50% sát thương
  if (B.cuong > 0) d *= 2;
  d *= heSoMocDmg(T); // mốc sao chung 5★/7★ (phattrien.js)
  return d;
}
function tocU(T) {
  const sk = SKILLS[T.id];
  let r = sk.toc || 1;
  if (sk.tocSao) r *= 1 + sk.tocSao * (T.sao - 1);
  r *= 1 + T.buf.toc + T.epxung;
  if (T.st.kep > 0) r *= 0.6; // bị Kẹp Phá của đối thủ
  return r;
}
// tỉ lệ chí mạng: 10% gốc + kỹ năng + Ăng-ten Chí Mạng kề bên
function critU(T) {
  if (!T || !T.buf) return 0.1;
  const sk = SKILLS[T.id] || {};
  return Math.min(1, 0.1 + (sk.crit || 0) + T.buf.crit + themMocCrit(T));
}
function banDuocQuai(B, E) {
  if (E.chet || E.vao < 1) return false;
  const p = G.duong[E.p];
  if (!G.chung) return p.ban === B.i;
  return p.ban === B.i || E.s >= p.sNhap; // co-op: nhánh của mình + vùng chung
}
function dsMucTieu(B) {
  if (B._ds && B._dsT === G.t) return B._ds;
  const ds = [];
  for (const E of G.quai) if (banDuocQuai(B, E)) ds.push(E);
  B._ds = ds; B._dsT = G.t; return ds;
}
// mục tiêu mặc định: quái ĐẦU (gần lối ra nhất)
function quaiDau(B) { let m = null, best = 1e9; for (const E of dsMucTieu(B)) { const r = G.duong[E.p].len - E.s; if (r < best) { best = r; m = E; } } return m; }
function quaiMauNhat(B) { let m = null, best = -1; for (const E of dsMucTieu(B)) if (E.hp > best) { best = E.hp; m = E; } return m; }
function quaiNgauNhien(B) { const ds = dsMucTieu(B); return ds.length ? pick(ds) : null; }

// ---------- quái ----------
function sinhQuai(id, pi, s, hs, gui) {
  const d = QUAI[id]; const p = G.duong[pi];
  const max = Math.round(mauWave(Math.max(1, G.wave)) * d.hp * (hs || 1));
  const E = { uid: G.uid++, id, d, hp: max, max, p: pi, s: s || 0, x: 0, y: 0, goc: 0, cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0,
    flash: 0, chet: false, khung: Math.random() * 4, tim: d.tim, gui: !!gui, vao: 0, bob: Math.random() * 6.28, keo: 0, yeu: 0 };
  [E.x, E.y, E.goc] = viTri(p, E.s);
  G.quai.push(E);
  return E;
}
function sinhTrum(id, pi) {
  const p = G.duong[pi];
  const max = Math.round(mauWave(G.wave) * 30 * (1 + G.wave / 35));
  const E = { uid: G.uid++, id, d: { co: 86, v: 15, tim: 2, to: true, trum: true }, trum: id, hp: max, max, p: pi, s: 0, x: 0, y: 0, goc: 0,
    cham: 0, chamT: 0, doc: 0, docT: 0, chan: 0, flash: 0, chet: false, khung: 0, tim: 2, vao: 0, bob: 0, keo: 0, yeu: 0,
    knT: 4.5, bao: null, ban: p.ban };
  [E.x, E.y, E.goc] = viTri(p, 0);
  G.quai.push(E);
  UI.canhBaoTrum(id);
  return E;
}
// gây sát thương
function trung(E, dmg, o) {
  if (E.chet) return 0;
  o = o || {};
  const T = o.T !== undefined ? o.T : G.dangBan; // ụ gây đòn (để tính chí mạng / hỗ trợ kề)
  const sk = T && SKILLS[T.id];
  let crit = o.crit != null ? o.crit : Math.random() < critU(T);
  if (sk && sk.luonCrit && sk.luonCrit(T)) crit = true;
  if (crit) { dmg *= 2 + ((T && T.buf && T.buf.cdmg) || 0); if (T && T.buf && T.buf.xuyen > 0 && !o.phu && typeof xuyenCrit === 'function') xuyenCrit(E, dmg, T, o); } // Focus Lens: +sát thương chí mạng, chí mạng xuyên
  if (!o.phu && !o.im) { if (crit) SND.crit(); else SND.trung(); }
  if (E.yeu > 0) dmg *= 1 + (E.yeuK || 0.25);      // Phá Giáp
  if (E.cvT > 0) dmg *= 1 + (E.cvK || 0.3);        // cầu vồng (solo / co-op): quái yếu đi
  if (E.giapT > 0) dmg *= 0.75;                    // cầu vồng đối thủ (PVP): quái trâu hơn
  if (E.fbT > 0) dmg *= 1.15;                      // Frost 5★ FROSTBITE
  if (E.azT > 0) dmg *= 1.25;                      // Cryo Reactor 7★ ABSOLUTE ZERO
  // hỗ trợ kề: Máy Phát Lạnh (chậm kèm), Cột Tử Thần (giết ngay quái nhỏ)
  if (T && T.buf && !o.phu) {
    if (T.buf.cham > 0) { E.chamT = Math.max(E.chamT, 2); if (!E.d.khangCham) E.cham = Math.max(E.cham, T.buf.cham); }
    if (T.buf.chet > 0 && !E.trum && !E.d.to && Math.random() < T.buf.chet) {
      dmg = Math.max(dmg, E.hp + 1); VX.chem(E); // giết ngay: đầu lâu tím + tro (buff.js)
      // Reaper Pillar (bậc TÍM họ Execute): linh hồn bị gặt NỔ → 12% máu tối đa của nó cho quái quanh 44 px
      noLan(E.x, E.y, 44, E.max * 0.12, o.B || G.ban[T.ban], { phu: true, mau: '#c77dff' }); FX.vong1(E.x, E.y, 6, 44, '#c77dff', 0.3, 3); FX.tiaLua(E.x, E.y, 8, '#d9a8ff', 150, 8);
    }
  }
  E.hp -= dmg; E.flash = 0.09;
  if (T && T.bac && !o.phu && !o.im) TVX.trung(T, E, crit); // hiệu ứng leo thang theo bậc (tiervfx.js)
  // số sát thương: gộp theo quái mỗi ~0,2 s cho đỡ rối; chí mạng hiện ngay, to hơn
  if (!o.im) {
    E.soAcc = (E.soAcc || 0) + dmg;
    if (crit || G.t - (E.soT || -9) > 0.2 || E.hp <= 0) {
      FX.chu1(E.x + rnd(-8, 8), E.y - 16, Math.round(E.soAcc) + '', crit ? '#F7D65B' : (o.mau || '#E9E8E2'), crit ? 15 : 12, crit ? 'crit' : ''); // thường: ngà 12 px · chí mạng: vàng 15 px nảy nhẹ
      E.soAcc = 0; E.soT = G.t;
    }
  }
  if (sk && !o.phu) { if (sk.khiTrung) sk.khiTrung(G, T, E, dmg, crit); if (crit && sk.khiCrit) sk.khiCrit(G, T, E); }
  if (E.hp <= 0) { chet(E, o.B); if (sk && !o.phu && sk.khiGiet) sk.khiGiet(G, T, E, dmg); }
  return dmg;
}
function noLan(x, y, r, dmg, B, o) {
  for (const E of dsMucTieu(B)) { const dd = Math.hypot(E.x - x, E.y - y); if (dd <= r + E.d.co * 0.25) trung(E, dmg, o); }
}
function chet(E, B) {
  if (E.chet) return;
  E.chet = true; E.tChet = 0;
  SND.chet(!!E.trum);
  const pB = B || G.ban[G.duong[E.p].ban] || G.ban[0];
  const m = Math.round(manaGiet(G.wave) * (E.trum ? 12 : E.d.mana));
  // ụ của bàn nào giết thì bàn đó nhận mana
  pB.mana += m; pB.manaNay += m; pB.dem.giet++;
  FX.tiaLua(E.x, E.y, E.trum ? 30 : 8, '#ffb060', 160, 10);
  FX.khoi(E.x, E.y, E.d.co * 0.5);
  FX.no('laser_trung', E.x, E.y, E.d.co * (E.trum ? 2.2 : 1.3), 0.35);
  if (E.trum) { FX.lac(12); FX.sang(0.5, '#ffffff'); FX.chu1(E.x, E.y - 30, TEXT.fx.bossDown, '#ffd23f', 24, 'to'); SND.no(1); }
  lanDoc(E, pB); // Venom 5★ CONTAGION
  if (E.d.tach) for (let i = 0; i < E.d.tach.n; i++) {
    const c = sinhQuai(E.d.tach.id, E.p, Math.max(0, E.s - i * 9), E.d.tach.hs || 1, E.gui); c.vao = 1;
  }
  // PVP: quái mình giết được GỬI sang đối thủ (quái đã gửi thì không gửi tiếp)
  if (G.che === 'pvp' && !E.gui && !E.trum && E.id !== 'nho') {
    const dich = G.duong.findIndex(p => p.ban !== G.duong[E.p].ban);
    if (dich >= 0) {
      G.hang.push({ t: G.t + 0.6, id: E.id, p: dich, gui: true });
      const [px, py] = G.duong[dich].pts[0];
      G.hu.push({ k: 'gui', t: 0, song: 0.6, x0: E.x, y0: E.y, x1: px, y1: py });
    }
  }
}

// ---------- wave ----------
function wavMoi() {
  G.wave++;
  const ws = [];
  const soDuong = G.duong.length;
  for (let pi = 0; pi < soDuong; pi++) {
    const w = taoWave(G.wave);
    if (w.trum) {
      // co-op: mỗi nhánh 1 trùm luân phiên loại; PVP: cả hai bên cùng loại
      const id = G.che === 'coop' && pi === 1 ? TRUM_THU_TU[(TRUM_THU_TU.indexOf(w.trum) + 3) % 6] : w.trum;
      G.hang.push({ t: G.t + 1.5, trum: id, p: pi });
      w.ds.forEach((q, i) => G.hang.push({ t: G.t + 3 + i * 1.2, id: q, p: pi }));
    } else {
      const dur = 13;
      w.ds.forEach((q, i) => G.hang.push({ t: G.t + 0.3 + (i / w.ds.length) * dur + rnd(0, 0.3), id: q, p: pi }));
    }
    ws.push(w);
  }
  G.tWave = 0;
  G.laTrum = !!ws[0].trum;
  UI.bangWave(G.wave, G.laTrum);
  SND.nhac(G.laTrum ? 2 : 1); SND.wave(G.wave, G.laTrum);
}

// ---------- vòng cập nhật ----------
function capNhat(dt) {
  if (G.ketThuc) return; // hiệu ứng (FX) chạy theo thời gian thực trong vòng lặp chính
  G.t += dt;
  if (G.cho > 0) { G.cho -= dt; if (G.cho <= 0) wavMoi(); }
  else {
    G.tWave += dt;
    const conTrum = G.quai.some(e => e.trum && !e.chet);
    if (G.laTrum) { if (!conTrum && !G.hang.length && G.tWave > 4) { G.cho = 2.5; G.laTrum = false; } }
    else if (G.tWave >= LUAT.thoiGianWave || (G.tWave > 6 && !G.hang.length && !G.quai.some(e => !e.chet))) G.cho = 1.2;
    if (G.cho > 0 && G.wave >= LUAT.waveMax && !G.quai.some(e => !e.chet)) ketThuc(true);
  }
  // hàng sinh quái
  for (let i = G.hang.length - 1; i >= 0; i--) {
    const h = G.hang[i];
    if (G.t >= h.t) {
      G.hang.splice(i, 1);
      if (h.trum) sinhTrum(h.trum, h.p); else sinhQuai(h.id, h.p, 0, 1, h.gui);
    }
  }
  for (const B of G.ban) capNhatBan(B, dt);
  G.dangBan = null;
  capNhatQuai(dt);
  // đạn
  for (let i = G.dan.length - 1; i >= 0; i--) { const d = G.dan[i]; G.dangBan = d.T || null; if (capNhatDan(d, dt)) G.dan.splice(i, 1); }
  // hiệu ứng kỹ năng đặc biệt (tường, hố đen, vệ tinh, tia…)
  for (let i = G.hu.length - 1; i >= 0; i--) { const o = G.hu[i]; o.t += dt; G.dangBan = o.T || null; const k = HU[o.k]; if ((k && k.cap && k.cap(G, o, dt)) || o.t >= o.song) { if (k && k.het) k.het(G, o); G.hu.splice(i, 1); } }
  G.dangBan = null;
  for (let i = G.bay.length - 1; i >= 0; i--) { G.bay[i].t += dt; if (G.bay[i].xong || G.bay[i].t > 3) G.bay.splice(i, 1); } // hết khi hoạt ảnh bay (thời gian thực) xong
  // dọn quái chết (sau hoạt ảnh vỡ)
  for (let i = G.quai.length - 1; i >= 0; i--) { const E = G.quai[i]; if (E.chet) { E.tChet += dt; if (E.tChet > 0.25) G.quai.splice(i, 1); } }
}

function capNhatBan(B, dt) {
  B.cuong = Math.max(0, B.cuong - dt); B.khien = Math.max(0, B.khien - dt);
  B.mv.cd = Math.max(0, B.mv.cd - dt);
  if (B.phao > 0) SKILLS.orbital.phaoBan(G, B, dt); // vệ tinh bắn phá sau khi ghép ụ Vệ Tinh
  // hỗ trợ: reset rồi các ụ hỗ trợ buff 4 ô kề (trên-dưới-trái-phải)
  for (const T of B.t) if (T) {
    T.buf.toc = 0; T.buf.dmg = 0; T.buf.crit = 0; T.buf.cham = 0; T.buf.chet = 0; T.buf.cdmg = 0; T.buf.xuyen = 0; T.nguon = []; // nguon: buff nhận từ ụ nào (hiển thị buff)
    if (T.tocT > 0) { T.tocT -= dt; T.buf.toc += T.tocV; } // tăng tốc tạm thời (Kẹp Phá co-op…)
    if (T.st.kep > 0) T.st.kep -= dt;
  }
  mocBuf(B); // mốc sao chung 3★ (+20% tốc)
  for (const T of B.t) if (T && !T.st.bang && !T.st.da) {
    const sk = SKILLS[T.id]; if (!sk.hoTro) continue;
    const k = sk.vai === 'ht' ? heSoHT(T) : 1; // mốc hào quang 3★/7★
    for (const N of oHoTro(B, T)) if (N && N !== T && !N.st.da) {
      const b = N.buf, c0 = b.toc, c1 = b.dmg, c2 = b.crit, c3 = b.cham, c4 = b.chet, c5 = b.cdmg || 0;
      sk.hoTro(G, T, N);
      if (k !== 1) { b.toc = c0 + (b.toc - c0) * k; b.dmg = c1 + (b.dmg - c1) * k; b.crit = c2 + (b.crit - c2) * k; b.cham = Math.min(0.8, c3 + (b.cham - c3) * k); b.chet = c4 + (b.chet - c4) * k; }
      // ghi nguồn buff (ụ nào cho bao nhiêu) — chậm: lấy mức CAO nhất, còn lại cộng dồn
      const ng = N.nguon;
      if (b.toc > c0) ng.push({ k: 'toc', v: b.toc - c0, T }); if (b.dmg > c1) ng.push({ k: 'dmg', v: b.dmg - c1, T });
      if (b.crit > c2) ng.push({ k: 'crit', v: b.crit - c2, T }); if (b.chet > c4) ng.push({ k: 'chet', v: b.chet - c4, T }); if (b.cdmg > c5) ng.push({ k: 'cdmg', v: b.cdmg - c5, T });
      if (SKILLS[T.id].vai === 'ht' && T.id === 'lanhgia') ng.push({ k: 'cham', v: SKILLS.lanhgia.cham(T) * k, T });
    }
  }
  for (const T of B.t) if (T) capNhatU(B, T, dt);
  if (B.ai || G.debug.auto) aiBan(B, dt);
}
function keCan(B, o) {
  const c = o % 5, h = (o / 5) | 0, ds = [];
  if (c > 0) ds.push(B.t[o - 1]); if (c < 4) ds.push(B.t[o + 1]);
  if (h > 0) ds.push(B.t[o - 5]); if (h < 2) ds.push(B.t[o + 5]);
  return ds;
}
function tamU(T) { const c = G.ban[T.ban].o[T.o]; return c; }
// đầu nòng: tính từ ảnh đầu súng + tỉ lệ
function dauNong(T) {
  const c = tamU(T), m = (window.ART_META || {})[T.id] || { s: 1, tip: 0.9 };
  if (SKILLS[T.id] && SKILLS[T.id].gocDau) return [c.x + Math.cos(T.goc) * 6, c.y + Math.sin(T.goc) * 6]; // ụ không nòng (hỗ trợ, Halo, Horn): phát từ lõi
  const tip = T.gd && window.STAGE_TIP && STAGE_TIP[T.id] ? STAGE_TIP[T.id][T.gd - 1] : m.tip; // đầu dạng grow-up: mũi nòng riêng
  const r = REN.coDau(T) * 0.5 * tip + T.rx;
  return [c.x + Math.cos(T.goc) * r, c.y + Math.sin(T.goc) * r];
}

function capNhatU(B, T, dt) {
  if (T.anim) T.anim.t += dt; // hoạt ảnh bật nảy cũ: hieuung.js tự xoá theo thời gian thực
  T.aurora = Math.max(0, T.aurora - dt); T.sang = Math.max(0, T.sang - dt * 3); T.chop = Math.max(0, T.chop - dt); T.lvSang = Math.max(0, T.lvSang - dt * 1.4);
  // lò xo giật lùi (có vượt quá nhẹ) — chạy theo "thời gian nhìn" (chậm hơn tốc độ game) để ở 2×/3× vẫn thấy giật rõ
  const dv = dt / Math.sqrt(G.tocDo || 1);
  T.rv += (-560 * T.rx - 30 * T.rv) * dv; T.rx += T.rv * dv;
  if (T.rx < -9) { T.rx = -9; if (T.rv < 0) T.rv = 0; }
  const st = T.st;
  if (st.bang > 0) { st.bang -= dt; return; }
  if (st.da) return;
  if (st.lua > 0) {
    st.lua -= dt;
    if (Math.random() < dt * 10) { const c = tamU(T); FX.hat1('than', c.x + rnd(-18, 18), c.y + rnd(-10, 14), rnd(-8, 8), -30, 0.6, 5, '#ff8a2a'); }
    if (st.lua <= 0) { st.lua = 0; haSao(B, T, 'burn'); if (!B.t[T.o]) return; }
  }
  const sk = SKILLS[T.id];
  T.tuoi += dt;
  G.dangBan = T;
  tienHoaCap(B, T); // ụ grow-up: đổi dạng khi đạt điều kiện → hoạt ảnh biến hình
  if (sk.capNhat && sk.capNhat(G, B, T, dt)) return; // kỹ năng tự quản lý (laser, overlord, mana…)
  if (!sk.dmg) return;
  const E = sk.chonMuc ? sk.chonMuc(G, B, T) : sk.nham === 'mau' ? quaiMauNhat(B) : sk.nham === 'ngau' ? (T.muc && !T.muc.chet && banDuocQuai(B, T.muc) && T.cd > 0.05 ? T.muc : quaiNgauNhien(B)) : quaiDau(B);
  T.muc = E;
  xoayDau(T, E, dt);
  T.cd -= dt * tocU(T);
  if (T.cd <= 0) {
    if (E && Math.abs(gocLech(T.goc, Math.atan2(E.y - tamU(T).y, E.x - tamU(T).x))) < 0.3) {
      T.cd += 1; if (T.cd < 0) T.cd = 0;
      T.banLan++;
      sk.ban(G, B, T, E);
      TVX.ban(T);
      mocBanXong(T); // mốc 5★ DOUBLE TAP
    } else T.cd = 0;
  }
}
// xoay đầu súng mượt (cung ngắn nhất); không có mục tiêu → quét chậm
function xoayDau(T, E, dt, x, y) {
  let dich;
  const c = tamU(T);
  if (E || x != null) dich = Math.atan2((E ? E.y : y) - c.y, (E ? E.x : x) - c.x);
  else dich = -Math.PI / 2 + Math.sin(G.t * 0.5 + T.pha) * 0.9;
  // lò xo giảm chấn tới hạn: tăng tốc rồi hãm êm vào đúng hướng, không giật/không lắc
  const d = gocLech(T.goc, dich);
  const w = E || x != null ? 24 : 3.2;
  T.vgoc = clamp((T.vgoc || 0) + (w * w * d - 2 * w * (T.vgoc || 0)) * dt, -30, 30);
  T.goc += T.vgoc * dt;
}
function giat(T, m) { T.rv -= (m || 1) * 230; T.chop = 0.1; }
function haSao(B, T, ly) {
  const c = B.o[T.o];
  if (T.sao <= 1) { B.t[T.o] = null; FX.no('no_phao', c.x, c.y, 70, 0.5); FX.chu1(c.x, c.y - 20, TEXT.fx.destroyed, '#ff4b3e', 16, 'to'); FX.lac(6); SND.no(0.6); return; }
  T.sao--; T.sang = 1; FX.chu1(c.x, c.y - 20, '−1★', '#ff4b3e', 18, 'to'); FX.tiaLua(c.x, c.y, 12, '#ff4b3e', 150);
}

// ---------- quái di chuyển, trùm phá bàn ----------
function capNhatQuai(dt) {
  for (const E of G.quai) {
    if (E.chet) continue;
    const p = G.duong[E.p];
    E.flash = Math.max(0, E.flash - dt); E.vao = Math.min(1, E.vao + dt * 3); E.yeu = Math.max(0, E.yeu - dt);
    if (E.fbT > 0) E.fbT -= dt; if (E.azT > 0) E.azT -= dt;
    if (E.chamT > 0) { E.chamT -= dt; if (E.chamT <= 0) E.cham = 0; }
    if (E.docT > 0) { E.docT -= dt; E.docAcc = (E.docAcc || 0) + E.doc * dt; if (E.docAcc >= 1 || E.docT <= 0) { trung(E, E.docAcc, { crit: false, mau: '#9dff5a', im: E.docAcc < 4, B: E.docB }); E.docAcc = 0; } if (E.chet) continue; }
    let v = E.d.v * (1 - (E.d.khangCham ? 0 : E.cham));
    if (E.chan > 0) { E.chan -= dt; v = E.trum ? v * 0.5 : 0; }
    if (E.keo) { E.s += E.keo * dt; E.keo = 0; }
    E.s += v * dt;
    E.khung += dt * (2 + v / 10);
    E.bob += dt * 6;
    if (E.s >= p.len) { lot(E); continue; }
    [E.x, E.y, E.goc] = viTri(p, E.s);
    // hướng nhìn mượt khi rẽ góc đường (không quay ngoắt 90°)
    E.gv = E.gv == null ? E.goc : E.gv + gocLech(E.gv, E.goc) * Math.min(1, dt * 11);
    if (E.trum) capNhatTrum(E, dt);
  }
}
function lot(E) {
  E.chet = true; E.tChet = 1;
  const p = G.duong[E.p], B = G.ban[p.ban];
  FX.sang(0.35, '#ff2030'); FX.lac(8);
  SND.lot();
  if (G.che === 'coop') { ketThuc(false, TEXT.end.leak); return; } // co-op: 1 quái lọt là THUA
  B.tim -= E.tim;
  const [x, y] = viTri(p, p.len);
  FX.chu1(x - 20, y - 26, '−' + E.tim + '♥', '#ff4b3e', 20, 'to');
  if (B.tim <= 0) { B.tim = 0; ketThuc(G.che === 'pvp' ? B.i !== 0 : false, G.che === 'pvp' ? (B.i === 0 ? TEXT.end.youOut : TEXT.end.rivalOut) : TEXT.end.coreDown); }
}
function capNhatTrum(E, dt) {
  const B = G.ban[E.ban];
  if (E.bao) {
    E.bao.t += dt;
    if (E.bao.t >= E.bao.song) { thucHienChieu(E, B); E.bao = null; E.knT = Math.max(6, 10 - G.wave / 15); }
    return;
  }
  E.knT -= dt;
  if (E.knT > 0) return;
  // chọn mục tiêu + BÁO TRƯỚC 1,4 s (khung 3 tung chiêu + tâm ngắm đỏ trên ụ)
  const ds = B.t.filter(T => T && !T.st.da);
  if (!ds.length) { E.knT = 2; return; }
  let muc = [];
  if (E.trum === 'mad_crown' || E.trum === 'octopus') muc = ds.sort(() => Math.random() - 0.5).slice(0, 3);
  else if (E.trum === 'freezer' || E.trum === 'nightmare') muc = [ds.sort((a, b) => b.sao - a.sao || Math.random() - 0.5)[0]];
  else if (E.trum === 'janus') muc = [pick(ds)];
  else if (E.trum === 'joker_king') muc = [pick(ds)];
  E.bao = { t: 0, song: 1.4, muc: muc.map(T => T.uid) };
  for (const T of muc) T.st.ngam = 1.4;
  FX.chu1(E.x, E.y - 52, TRUM[E.trum].kn + '!', TRUM[E.trum].mau, 18, 'to');
  SND.bao();
}
// khiên 1 lần trên ụ (Máy Khiên / Hào Quang): chặn chiêu trùm hoặc phá của đối thủ
function chanKhien(B, T) {
  if (B && B.khien > 0 && T) { const c = B.o[T.o]; VX.chanKhien(B, T); FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#73A9FF', 11); return true; } // khiên toàn bàn: lục giác chặn
  if (!T || !(T.khien > 0)) return false;
  T.khien--; const c = B.o[T.o];
  VX.chanKhien(B, T); FX.chu1(c.x, c.y - 20, TEXT.fx.blocked, '#73A9FF', 11); // khiên 1 lần: lục giác bung 280 ms + 'BLOCK' 11 px
  return true;
}
function thucHienChieu(E, B) {
  const muc = B.t.filter(T => T && E.bao.muc.includes(T.uid));
  SND.chieuTrum(E.trum);
  for (const T of muc) T.st.ngam = 0;
  if (B.khien > 0) { // khiên Ma vương chặn chiêu trùm
    for (const T of muc) { const c = B.o[T.o]; VX.chanKhien(B, T); FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#73A9FF', 11); }
    return;
  }
  // Máy Khiên: ụ có khiên chặn 1 lần chiêu trùm
  for (let i = muc.length - 1; i >= 0; i--) if (chanKhien(B, muc[i])) muc.splice(i, 1);
  const rong = (T) => B.o[T.o];
  const deBan = (T, ten, mau) => { const c = rong(T); G.hu.push({ k: 'chieuTrum', t: 0, song: 0.45, x0: E.x, y0: E.y, x1: c.x, y1: c.y, mau }); };
  switch (E.trum) {
    case 'mad_crown': // biến ụ thành loại ngẫu nhiên trong bộ
      for (const T of muc) { deBan(T, 0, '#ff6ad5'); const N = taoU(B, pick(B.deck), T.sao, T.o); N.anim = { k: 'no', t: 0 }; N.goc = T.goc; B.t[T.o] = N; FX.tiaLua(rong(T).x, rong(T).y, 14, '#ff6ad5'); }
      break;
    case 'freezer':
      for (const T of muc) { deBan(T, 0, '#7fdcff'); T.st.bang = 7; const c = rong(T); FX.no('bang_vo', c.x, c.y, 80, 0.45); }
      SND.bang();
      break;
    case 'janus':
      for (const T of muc) { deBan(T, 0, '#e0c070'); T.st.da = true; const c = rong(T); FX.bui(c.x, c.y, 10, 16); FX.lac(4); }
      break;
    case 'joker_king': // ném mimic → ụ bị biến thành mimic rồi ép ghép với ụ cùng sao
      for (const T of muc) {
        deBan(T, 0, '#ffd23f');
        const M = taoU(B, 'mimic', T.sao, T.o); M.goc = T.goc; B.t[T.o] = M;
        const ban = B.t.filter(X => X && X !== M && X.sao === M.sao && !X.st.da && !X.st.bang);
        if (ban.length && M.sao < 7) ghep(B, M, pick(ban), true);
        else { M.anim = { k: 'no', t: 0 }; }
      }
      break;
    case 'nightmare':
      for (const T of muc) { const c = rong(T); G.hu.push({ k: 'tiaTia', t: 0, song: 0.25, x0: E.x, y0: E.y, x1: c.x, y1: c.y, mau: '#ff3b3b' }); haSao(B, T, 'snipe'); }
      SND.tia();
      break;
    case 'octopus':
      for (const T of muc) { deBan(T, 0, '#ff8a2a'); T.st.lua = 6; }
      break;
  }
}

// ---------- đạn ----------
// d: {img, x,y, muc (quái), px,py, sp, cong (độ cao vòng cung), t, dai (tổng thời gian nếu cong), B, T, trung(G,d,E), duoi}
function banDan(o) {
  o.t = 0; o.sx = o.x; o.sy = o.y;
  if (o.cong) { const dx = o.px - o.x, dy = o.py - o.y; o.x0 = o.x; o.y0 = o.y; o.dai = Math.max(0.35, Math.hypot(dx, dy) / o.sp); }
  G.dan.push(o); return o;
}
function capNhatDan(d, dt) {
  d.t += dt;
  TVX.dan(d, dt);
  if (d.cong) {
    // đạn cầu vồng (pháo, cối): bay theo parabol tới điểm rơi (bám mục tiêu nếu còn sống)
    if (d.muc && !d.muc.chet) { d.px += (d.muc.x - d.px) * Math.min(1, dt * 6); d.py += (d.muc.y - d.py) * Math.min(1, dt * 6); }
    const u = Math.min(1, d.t / d.dai);
    d.x = d.x0 + (d.px - d.x0) * u; d.y = d.y0 + (d.py - d.y0) * u;
    d.z = Math.sin(u * Math.PI) * d.cong;
    d.goc = Math.atan2((d.py - d.y0) - d.cong * Math.PI * Math.cos(u * Math.PI) * 0.6, d.px - d.x0);
    if (d.duoi && Math.random() < dt * 30) FX.hat1('khoi', d.x, d.y - d.z, 0, -6, 0.35, 8);
    if (u >= 1) { d.trung(G, d, null); return true; }
    return false;
  }
  if (d.muc && !d.muc.chet) { d.px = d.muc.x; d.py = d.muc.y; }
  const dx = d.px - d.x, dy = d.py - d.y, l = Math.hypot(dx, dy);
  const b = d.sp * dt;
  d.goc = Math.atan2(dy, dx);
  if (d.duoi === 'bang' && Math.random() < dt * 40) FX.hat1('lua', d.x, d.y, rnd(-15, 15), rnd(-15, 15), 0.3, 6, '#bff4ff');
  if (d.duoi === 'doc' && Math.random() < dt * 30) FX.hat1('lua', d.x, d.y, rnd(-10, 10), rnd(-10, 10), 0.3, 5, '#9dff5a');
  if (l <= b + 4) { d.x = d.px; d.y = d.py; d.trung(G, d, d.muc && !d.muc.chet ? d.muc : null); return true; }
  d.x += dx / l * b; d.y += dy / l * b;
  return d.t > 3;
}

// ---------- AI (đồng đội / đối thủ; ?auto=1 cho bàn mình khi kiểm thử) ----------
function aiBan(B, dt) {
  B.aiT -= dt; if (B.aiT > 0) return;
  B.aiT = G.che === 'pvp' && B.ai ? 0.9 : 0.6;
  const ts = B.t.filter(Boolean);
  if (B.mv.cd <= 0 && B.mana >= B.mv.gia && B.mana > 200 && Math.random() < 0.3) { dungMV(B); return; }
  if (B.mana >= B.gia && oTrong(B).length) { trieu(B); return; }
  // ghép: ưu tiên sao thấp
  // kỹ năng chủ động của ụ ĐỎ: AI tự dùng khi nạp đầy
  for (const T of ts) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && sk.aiNen(G, B, T)) { sk.chuDong(G, B, T); return; } }
  ts.sort((a, b) => a.sao - b.sao);
  const hl = (a, b) => hopLeGhep(a, b) && (a.id === b.id || a.id === 'mimic' || b.id === 'mimic' || (a.sao === b.sao && a.id !== 'dichchuyen' && SKILLS[b.id].vai !== 'ht'));
  if (oTrong(B).length <= 3) for (const a of ts) for (const b of ts) if (a !== b && a.sao < 6 && hl(a, b) && (SKILLS[a.id].vai !== 'ht' || ts.filter(x => x.id === a.id).length > 2)) { ghep(B, a, b); return; }
  if (oTrong(B).length === 0) for (const a of ts) for (const b of ts) if (a !== b && hl(a, b)) { ghep(B, a, b); return; }
  const loai = B.deck.filter(id => B.lv[id] < 5).sort((a, b) => B.lv[a] - B.lv[b]);
  if (loai.length && B.mana >= LUAT.giaNangCap[B.lv[loai[0]] - 1] + (oTrong(B).length ? B.gia : 0)) nangCap(B, loai[0]);
}

function ketThuc(thang, ly) {
  if (G.ketThuc) return;
  G.ketThuc = { thang, ly, wave: G.wave };
  SND.ketThuc(thang); SND.nhac(0);
  setTimeout(() => UI.ketQua(G.ketThuc), 900);
}
