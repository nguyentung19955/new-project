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
    tim: G.che === 'pvp' ? LUAT.timPvp : G.che === 'coop' ? LUAT.timCoop : LUAT.timSolo, aiT: 0.8,
    mv: { id: mv, gia: MAVUONG[mv].gia, cd: 0 }, cuong: 0, khien: 0, phao: 0, phaoSao: 1, phaoT: 0, dem: { giet: 0 },
    manaNay: 0,
  };
  for (const id of deck) B.lv[id] = 1;
  // CẤP THẺ ngoài trận (thebai.js): số cấp đã lên trên cấp đầu của bậc — người chơi = bộ sưu tập; máy = mức trung bình của người chơi; online = gửi kèm
  B.capThe = typeof THEBAI !== 'undefined' ? THEBAI.capBan(i, B.deck, def) : {};
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

// PVP: bộ bài đối thủ "có lý" — ≥3 ụ gây sát thương, tối đa 1 ụ hỗ trợ, ưu tiên 1 ụ phá đối thủ (Control)
function deckDoiThu() {
  const dc = /PVP|rival/i;
  for (let lan = 0; lan < 40; lan++) {
    const d = deckNgauNhien();
    const danh = d.filter(id => SKILLS[id].dmg && SKILLS[id].vai !== 'ht').length, ht = d.filter(id => SKILLS[id].vai === 'ht').length;
    const ctl = d.some(id => dc.test(((TEXT.turret || {})[id] || {}).skill || ''));
    if (danh >= 3 && ht <= 1 && (ctl || lan > 25)) return d;
  }
  return deckNgauNhien();
}
function batDau(che, deck, mv) {
  if (typeof TVF !== 'undefined' && TVF.xoaHet) TVF.xoaHet();
  G.ktDeck = ktDeckBat(); G.ktDeckLoi = 0;
  G.che = che; G.quai.length = 0; G.dan.length = 0; G.hu.length = 0; G.bay.length = 0; G.hang.length = 0;
  G.wave = 0; G.tWave = 0; G.t = 0; G.ketThuc = null; G.dung = false; G.cho = 1.2;
  FX.reset(); VX.reset();
  const bc = boCuc(che);
  G.chung = !!bc.chung;
  // hạt giống trận: wave PVP + lịch trùm ngẫu nhiên (SOLO/PVP, CO-OP từ wave 60). CO-OP online: dùng seed phòng (ONS.seed) → 2 máy cùng trùm.
  // G.giuHat = true trước batDau → chơi lại đúng hạt giống cũ (Retry same seed); ?seed=N cũng ép hạt giống.
  const hatOn = che === 'coop' && typeof ONS !== 'undefined' && ONS.on && ONS.seed;
  G.hat = G.debug.seed || hatOn || (G.giuHat && G.hat) || (1 + rint(1e9)); G.giuHat = false; G.dotTu = 0; G._lt = null;
  G.ban = bc.ban.map((d, i) => taoBan(d, i, i === 0 ? deck : (G.debug.deck2 || (che === 'pvp' ? deckDoiThu() : deckNgauNhien())), i === 0 ? mv : pick(Object.keys(MAVUONG))));
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
  const tu = G.ktDeck === 'nem' && B && B.deck && !B.deck.includes(id) ? String(new Error().stack || '').split('\n').slice(2, 9).join('\n') : undefined; // dev: ghi đường tạo ụ ngoài bộ (báo lỗi bất biến)
  return { _tu: tu,
    uid: G.uid++, id, sao, bac: r.bac, ban: B.i, o, goc: -Math.PI / 2 + rnd(-0.4, 0.4), vgoc: 0, rx: 0, rv: 0,
    cd: rnd(0.1, 0.6), anim: null, st: { bang: 0, da: false, lua: 0, ngam: 0, kep: 0 }, buf: { toc: 0, dmg: 0, crit: 0, cham: 0, chet: 0 },
    nap: 0, muc: null, pha: Math.random() * 6.28, sang: 0, aurora: 0, chop: 0, lvSang: 0, banLan: 0,
    khien: 0, tocT: 0, tocV: 0, epxung: 0, banSao: false, nhanT: 0, tuoi: 0, nguon: [], // nguon sẵn: ụ sinh GIỮA vòng capNhatBan (Sinh Đôi, Mạch Máu…) không vỡ khi kỹ năng đẩy buff
  };
}
// gọi hook 'sinh' của kỹ năng khi ụ xuất hiện (vd. Sói Máy 30% ra bản thức tỉnh)
function sinhU(T) { const sk = SKILLS[T.id]; if (sk && sk.sinh) sk.sinh(G, T); return T; }
// sinhU bằng RNG cho trước (chiêu trùm tất định: Mad Crown biến ra Merge King / Sói vẫn quay vàng / thức tỉnh, 2 máy online ra như nhau)
function sinhR(T, r) { const r0 = Math.random; if (r) Math.random = r; try { return sinhU(T); } finally { Math.random = r0; } }
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
// TWIN MAKER (sinhdoi): gọi thêm 1 ụ NGẪU NHIÊN trong bộ bài, tạo THẲNG ở đúng sao (không đổi sao sau khi tạo → chỉ số, chip sao,
// dạng ảnh/grow, bộ đếm trên bàn đều khớp ngay). Ô ngẫu nhiên trong các ô trống (ghép thường luôn trả 1 ô → luôn có chỗ).
// Online: bàn con rối KHÔNG tự gọi — nhận đúng ụ/ô/sao qua gói 'gh' (d.tw) của máy chủ bàn; máy chủ bàn bốc bằng RNG hạt giống chung.
// ep = { o, id } (áp lại từ mạng). Hiệu ứng: VX.sinhDoi (tia vàng từ ô ghép → ô mới, lộ cùng lúc kết quả ghép).
function sinhDoi(B, sao, oNguon, ep) {
  if (!ep && B.net && typeof ONS !== 'undefined' && ONS.on) return null;
  const tr = oTrong(B); if (!tr.length) return null;
  let r = Math.random;
  if (!ep && typeof ONS !== 'undefined' && ONS.on) r = rngHat((ONS.seed || 1) * 7907 + Math.round(G.t * 60) * 31 + (oNguon | 0) * 977 + B.i * 13);
  const o = ep ? ep.o : tr[Math.floor(r() * tr.length)];
  const id = ep ? ep.id : B.deck[Math.floor(r() * B.deck.length)]; // DCDW: đều ngẫu nhiên trong bộ bài như triệu hồi thường
  if (B.t[o] || !G.rosterMap[id]) return null;
  // DCDW Berit: 10% (LV9, +1%/cấp thẻ Twin Maker) ụ sinh đôi CAO HƠN 1★ (không vượt 7★) — online: máy chủ bàn quay, gói 'gh' mang đúng sao (ep.s)
  if (ep && ep.s) sao = ep.s; else if (!ep && sao < LUAT.saoMax && r() < (knThe(B, 'sinhdoi') || 10) / 100) sao++;
  const T = sinhU(taoU(B, id, Math.max(1, Math.min(LUAT.saoMax, sao | 0)), o));
  B.t[o] = T;
  B._tw = { o, id, s: T.sao, f: (T.vang ? 'g' : '') + (T.thuc ? 'w' : '') };
  if (typeof VX !== 'undefined' && VX.sinhDoi) VX.sinhDoi(B, oNguon, T); else if (typeof VX !== 'undefined') VX.trieu(T);
  return T;
}
// ụ bị KHOÁ (hoá đá / đóng băng) không tự dùng kỹ năng; nhưng ụ KHOẺ kéo lên nó vẫn dùng được kỹ năng chỉ đổi SAO hoặc CHỖ
// (ghepDB.quaKhoa: Merge King +★, Teleporter đổi chỗ) — luật DCDW: Aurora King nâng sao ô đá → 2 ô đá cùng sao ghép với nhau.
function biKhoa(T) { return !!(T && (T.st.da || T.st.bang > 0)); }
function ghepDBHop(a, b) {
  if (!a || !b || a === b || biKhoa(a)) return null; // ụ kéo bị khoá: không dùng kỹ năng
  const db = ghepDacBiet(a, b);
  if (!db) return null;
  if (!biKhoa(b)) return db;
  return !db.dao && db.sk.ghepDB.quaKhoa ? db : null; // đích bị khoá: chỉ kỹ năng quaKhoa của ụ KÉO
}
function hopLeGhep(a, b) {
  if (!a || !b || a === b) return false;
  if (ghepDBHop(a, b)) return true; // ghép đặc biệt (có loại không cần cùng sao; Merge King / Teleporter được lên ô đá/băng)
  if (a.st.bang > 0 || b.st.bang > 0) return false;
  if (a.sao !== b.sao || a.sao >= LUAT.saoMax) return false;
  if (a.st.da || b.st.da) return a.st.da && b.st.da; // đá chỉ ghép với đá cùng sao
  if (a.id === b.id) return true;
  return a.id === 'mimic' || b.id === 'mimic'; // MIMIC ghép với BẤT KỲ ụ cùng sao
}
// ghép ĐẶC BIỆT (Bộ Trộn, Dịch Chuyển, Ép Xung, Vua Ghép, Sao Chép…): kỹ năng của ụ KÉO quyết định
function ghepDacBiet(a, b) {
  if (a.id === b.id && !(SKILLS[a.id] && SKILLS[a.id].ghepDB && SKILLS[a.id].ghepDB.cungLoai)) return null; // cùng loại: chỉ ụ khai báo cungLoai (Merge King) mới ghép đặc biệt
  const sa = SKILLS[a.id];
  if (sa && sa.ghepDB && sa.ghepDB.hopLe(a, b)) return { sk: sa, a, b };
  const sb = SKILLS[b.id]; // Bộ Trộn ghép được cả 2 chiều
  if (sb && sb.ghepDB && sb.ghepDB.haiChieu && sb.ghepDB.hopLe(b, a)) return { sk: sb, a: b, b: a, dao: true };
  return null;
}
const GIU_CONG_DON = { loren: ['lo'], hopbi: ['tuoi'], tienhoa: ['tuoi'], leviathan: ['vuc'] }; // cộng dồn giữ khi ghép cùng loại ra cùng loại
// ghép a (kéo) vào b → ở ô b ra ụ NGẪU NHIÊN trong bộ bài, +1 sao (luật DCDW / Random Dice)
function ghep(B, a, b, ep) {
  if (!ep && !hopLeGhep(a, b)) return null;
  const B2 = G.ban[b.ban];
  if (!ep) {
    const db = ghepDBHop(a, b);
    if (db) { const r = db.sk.ghepDB.lam(G, B2, db.a, db.b, db.dao); SND.ghep(); return r; }
  }
  // ĐÁ + ĐÁ (DCDW: "돌덩이끼리 합체 → 등급 높은 돌덩이"): ra khối ĐÁ +1★ (loại ngẫu nhiên nằm dưới lớp đá),
  // vẫn là đá cho tới khi được tẩy (Cleanser / Eve); 2 cục đá không có kỹ năng → không chạy kỹ năng KHI GHÉP, không buff Aurora
  const daDa = !!(a.st.da && b.st.da);
  const coMimic = !daDa && (a.id === 'mimic' || b.id === 'mimic');
  const ra = sinhU(taoU(B2, pick(B2.deck), Math.min(LUAT.saoMax, b.sao + 1), b.o));
  if (daDa) ra.st.da = true;
  B2.t[a.o] = null; B2.t[b.o] = ra;
  ra.goc = b.goc;
  if (coMimic) ra.aurora = 8; // Aurora: ghép xong được buff tấn công
  // hiệu ứng ghép (thời gian thực): ụ kéo bay vòng cung → nén → chớp → quay số thẻ → lộ kết quả bật nảy + sóng tròn + huy hiệu sao
  VX.ghep(B2, a, b, ra);
  // kỹ năng KHI GHÉP của 2 ụ nguyên liệu (mana, gọi ụ, khiên, phá đối thủ…) — nhãn chữ hiện lúc kết quả lộ ra
  const kh = [];
  G._treNhan = VX.TRE_LO;
  for (const id of (daDa ? [] : new Set([a.id, b.id]))) { const sk = SKILLS[id]; if (sk && sk.ghep) { sk.ghep(G, B2, a, b, B2.t[b.o] || ra); kh.push(id); } }
  G._treNhan = 0;
  if (kh.length) VX.kichHoat(B2, b.o, kh);
  // GHÉP 2 ụ CÙNG LOẠI ra ĐÚNG loại đó → giữ cộng dồn lớn nhất của 2 nguyên liệu (BAO-CAO gioi-han §4 mục 6): Scrap Forge (lò), Overclock (ép xung trên thân),
  //   Mystery Box / Evolver (bộ đếm). Leviathan: VỰC SÂU lưu theo bàn (skills5.js). Ember Relay: session khác (Lửa Thập Tự).
  if (!daDa && a.id === b.id && B2.t[b.o] === ra && ra.id === a.id) {
    for (const k of (GIU_CONG_DON[ra.id] || [])) ra[k] = Math.max(a[k] || 0, b[k] || 0, ra[k] || 0);
    if (a.epxung || b.epxung) ra.epxung = Math.max(a.epxung || 0, b.epxung || 0, ra.epxung || 0);
  }
  const kq = B2.t[b.o] || ra;
  // (+1★ hiện bằng con dấu sao ảnh trong phát lại ghép — ghepfx.js)
  if (kq === ra) mocMoi(ra, b.sao, VX.TRE_LO + 0.12);
  SND.ghep(kq.sao, B2.ai);
  return ra;
}
function nangCap(B, id) {
  const lv = B.lv[id]; if (lv >= 5) return false;
  if (SKILLS[id] && SKILLS[id].khongNang) return false; // Hydra: không có POWER-UP mana (mana dùng cho kỹ năng chạm)
  const gia = LUAT.giaNangCap[lv - 1];
  if (B.mana < gia) return false;
  B.mana -= gia; B.lv[id] = lv + 1;
  for (const T of B.t) if (T && T.id === id) { T.lvSang = 1; }
  if (!B.ai) SND.nang(B.lv[id]);
  return true;
}
function dungMV(B) {
  const mv = B.mv, d = MAVUONG[mv.id];
  const r = CH.dung(B); // luật (điều kiện, trừ mana, giá ×2, hồi chiêu, bàn đầy, đồng hồ tác dụng): chihuy.js
  if (!r.ok) return false;
  const cx = B.x + B.w / 2, cy = B.y + B.h / 2, nguoi = !B.ai && B === G.ban[0];
  // RAGE / HOLY SHIELD: không chớp toàn màn (reduce flash) — khoảnh khắc chỉ huy vẽ trên từng ô (trumvfx.js)
  FX.vong1(cx, cy, 20, 240, d.mau || '#ffffff', 0.6, 6);
  if (!nguoi) FX.chu1(cx, cy, d.ten, '#fff', 22, 'to'); // bàn máy/đồng đội: chữ nhỏ (đã kẹp trong màn); người chơi: cut-in
  // người chơi: cut-in chân dung chỉ huy ~2,2 s (lớp phủ) — hiệu ứng kỹ năng nổ NGAY, không chờ dải cut-in
  if (nguoi && typeof UI !== 'undefined' && UI.cutIn) UI.cutIn(mv.id, B);
  if (nguoi && typeof TIENUI !== 'undefined') TIENUI.daDung(B, r);
  SND.mv();
  return true;
}

// ---------- chỉ số ----------
// CỘNG GỘP (07/11, người dùng duyệt tư vấn ChatGPT): mọi +% CÙNG LOẠI (sát thương / tốc bắn / ST chí mạng) từ hỗ trợ, cộng dồn kỹ năng, đột phá, jackpot (jackpot.js),
//   Mimic, số Pháo La Bàn, sát thương có điều kiện của hỗ trợ → CỘNG trong nhóm trước, rồi các nhóm mới nhân nhau (ST × tốc × chí mạng). Không trần (tỉ lệ chí mạng ≤ 100%).
//   Hệ số nhân RIÊNG có chủ ý: RAGE ×2, suy yếu quái, bản sao Copycat −%, mốc sao 5★/7★, Pháo Đồng Bộ PVP. CONG_GOP = false chỉ để ĐO kiểu nhân cũ (tools/thap-sim-jackpot.js).
var CONG_GOP = true;
const heJP = (T, k) => (!CONG_GOP && typeof JP !== 'undefined' ? 1 + JP.gt(T, k) : 1); // kiểu cũ (đo): jackpot nhân riêng
function dmgU(T, them) {
  const sk = SKILLS[T.id], B = G.ban[T.ban];
  let d = (sk.dmg || 0) * TIERS[T.bac].hs * (1 + 0.85 * (T.sao - 1)) * hsLv(B, T.id);
  const mi = T.aurora > 0 ? knThe(B, 'mimic') / 100 : 0; // Mimic: +50% ở cấp đầu, tăng theo cấp thẻ Mimic
  d *= 1 + T.buf.dmg + (them || 0) + (CONG_GOP ? mi : 0); // them: +% riêng của đòn (số Pháo La Bàn) — cùng nhóm sát thương
  if (!CONG_GOP) d *= (1 + mi) * heJP(T, 'dmg');
  if (T.banSao) d *= heSaoChep(B); // bản sao Copycat: chỉ số ụ gốc × % sao chép (70% ở cấp đầu → 94% thẻ max, theo cấp thẻ Copycat)
  if (B.cuong > 0) d *= 2;
  if (G.che === 'pvp') d *= SKILLS.dongbo.heSoDoiThu(B); // Pháo Đồng Bộ (Dana) của đối thủ: −sát thương nhẹ
  d *= heSoMocDmg(T); // mốc sao chung 5★/7★ (phattrien.js)
  return d;
}
function tocU(T) {
  const sk = SKILLS[T.id];
  let r = sk.toc || 1;
  if (sk.tocSao) r *= 1 + sk.tocSao * (T.sao - 1);
  r *= Math.max(0.1, 1 + T.buf.toc + T.epxung); // QA Tím: nhiều Súng Bão kề nhau không làm tốc bắn âm
  r *= heJP(T, 'toc');
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
function sinhTrum(id, pi, hs) {
  const p = G.duong[pi];
  const max = Math.round(mauWave(G.wave) * 30 * (1 + G.wave / 35) * (hs || 1)); // hs: PVP đột tử — trùm trâu dần
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
  if (T && T._critChac && !o.phu && o.crit == null) { crit = true; T._critChac = false; } // Crit Antenna 7★: đòn chắc chắn chí mạng (đòn đã tự quyết chí mạng — Dice Gun / tia Laser / chém — không bị ép)
  if (crit) { dmg *= (2 + ((T && T.buf && T.buf.cdmg) || 0)) * (T && !CONG_GOP && typeof JP !== 'undefined' ? 1 + JP.gt(T, 'cdmg') / 2 : 1); if (T && T.buf && T.buf.xuyen > 0 && !o.phu && typeof xuyenCrit === 'function') xuyenCrit(E, dmg, T, o); } // Focus Lens: +sát thương chí mạng, chí mạng xuyên
  if (!o.phu && !o.im) { if (crit) SND.crit(); else SND.trung(); }
  const vu = HOTRO.vuln(E); if (vu) dmg *= 1 + vu;     // suy yếu quái: mọi nguồn cộng lại, trần 25% (hotro.js)
  if (E.giapT > 0) dmg *= 0.75;                    // giáp đối thủ (PVP)
  if (E.cvPT > 0) dmg *= 1 - (E.cvPK || 0);         // PVP: cầu vồng (Yuna) của đối thủ — quái trên vệt nhận ít sát thương hơn
  // hỗ trợ kề (hotro.js): sát thương có điều kiện (lộ / chậm / cầu vồng / đòn liên tiếp), chậm khi trúng, giết ngay, choáng khi chí mạng
  if (T && T.buf && !o.phu) { if (T.ht) { const m = HOTRO.dkHeSo(T, E), bd = Math.max(0, T.buf.dmg + (T.aurora > 0 ? knThe(G.ban[T.ban], 'mimic') / 100 : 0)); dmg *= CONG_GOP ? (1 + bd + m - 1) / (1 + bd) : m; } dmg = HOTRO.khiTrung(T, E, dmg, crit, o); } // có điều kiện (lộ/chậm/vệt/Amplifier): cùng nhóm sát thương (cộng gộp)
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
  if (E.trum) huyBaoTrum(E); // trùm chết giữa lúc báo chiêu: dấu báo đi theo trùm
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
  // PVP (kiểu DCDW): KHÔNG gửi quái — 2 bên nhận cùng wave, giết chỉ cho mana bàn mình
}

// ---------- wave ----------
// RNG có hạt giống (mulberry32) — PVP: wave sinh 1 lần rồi đổ GIỐNG HỆT vào cả 2 làn
function rngHat(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// RNG CHIÊU TRÙM (tất định): mỗi lần tung chiêu 1 hạt mới = hạt trận + wave + làn trùm (quy về làn chủ phòng khi online) + id trùm
// + số lần tung → 2 máy online (lockstep) chọn CÙNG ụ mục tiêu, không dùng Math.random.
function rngTrum(E) {
  const lan = (typeof ONS !== 'undefined' && ONS.on && !ONS.host && G.ban.length === 2) ? 1 - E.ban : E.ban;
  let h = 0; for (const ch of String(E.trum || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) | 0;
  E.nChieu = (E.nChieu || 0) + 1;
  return rngHat(((G.hat || 1) * 2246822519 + G.wave * 3266489917 + lan * 668265263 + E.nChieu * 374761393 + h) | 0);
}
// trộn tất định (Fisher–Yates) theo thứ tự ô — không phụ thuộc thứ tự mảng đầu vào
function tronTrum(ds, r) { const a = ds.slice().sort((x, y) => x.o - y.o); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// Joker King: ụ T có ít nhất 1 ụ khác cùng sao (không đá/băng, < 7★) để ép ghép
function coCapJoker(B, T) { return T.sao < LUAT.saoMax && B.t.some(X => X && X !== T && X.sao === T.sao && !X.st.da && !X.st.bang); }
function chonTrum(ds, r) { const a = tronTrum(ds, r); return a.length ? a[0] : null; }
// FREEZER: số ụ bị đóng băng — 3 lúc đầu, +1 mỗi 20 wave, tối đa 5 · 6 s
const LUAT_BANG = { giay: 6, so: (w) => Math.min(5, 3 + Math.floor(w / 20)) };
// PVP: số wave đột tử đã qua (0 = chưa đột tử)
function pvpDotTu(w) { return G.che === 'pvp' && w >= LUAT.pvpDotTu ? w - LUAT.pvpDotTu + 1 : 0; }
// ---------- LỊCH TRÙM ----------
//  · CO-OP: thứ tự cố định TRUM_THU_TU tới wave TRUM_COOP_CO_DINH, từ wave 60 trở đi ngẫu nhiên.
//  · SOLO / PVP: ngẫu nhiên mỗi wave trùm (không lặp liền), sinh từ hạt giống trận G.hat bằng RNG RIÊNG
//    (không đụng RNG sinh wave) → PVP 2 bên giống hệt, CO-OP online 2 máy giống hệt (G.hat = seed phòng).
//  · Máu / sức mạnh trùm vẫn theo wave (sinhTrum không đổi).
const TRUM_COOP_CO_DINH = 59;
function coTrum(w) { return w % LUAT.songTrum === 0 || pvpDotTu(w) > 0; }
function lichTrum(w) { // trùm (làn 0) của wave w trong lịch ngẫu nhiên — tính tuần tự, nhớ lại
  const k = G.hat + '|' + G.che;
  if (!G._lt || G._lt.k !== k) G._lt = { k, w: 0, cu: null, ds: {}, r: rngHat((G.hat || 1) * 2246822519 + 3266489917) };
  const L = G._lt;
  while (L.w < w) {
    L.w++;
    if (!coTrum(L.w)) continue;
    if (G.che === 'coop' && L.w <= TRUM_COOP_CO_DINH) { L.ds[L.w] = L.cu = trumCoDinh(L.w); continue; } // nối tiếp không lặp từ trùm cố định cuối (wave 50)
    const be = trumBe(L.w), n = be.length; // bể trùm (trum.js: 6 cũ + 6 mới, lọc theo wave xuất hiện)
    let id, lan = 0; do id = be[Math.floor(L.r() * n)]; while (id === L.cu && ++lan < 20);
    L.ds[L.w] = L.cu = id;
  }
  return L.ds[w] || TRUM_THU_TU[0];
}
function trumBe(w) { // bể trùm ngẫu nhiên của wave w (TRUM_POOL ở trum.js; thiếu file → 6 trùm cũ)
  if (typeof TRUM_POOL === 'undefined') return TRUM_THU_TU;
  const ds = TRUM_POOL.filter(id => trumTuWave(id) <= w); return ds.length ? ds : TRUM_THU_TU;
}
function trumCoDinh(w) { return TRUM_THU_TU[Math.max(0, Math.ceil(w / LUAT.songTrum) - 1) % TRUM_THU_TU.length]; }
function trumCuaWave(w, p) {
  const id = G.che === 'coop' && w <= TRUM_COOP_CO_DINH ? trumCoDinh(w) : lichTrum(w);
  if (G.che === 'coop' && p === 1) { const be = w <= TRUM_COOP_CO_DINH ? TRUM_THU_TU : trumBe(w), i = be.indexOf(id); return be[((i < 0 ? 0 : i) + 3) % be.length]; }
  return id;
}
function wavMoi() {
  G.wave++;
  const ws = [];
  const soDuong = G.duong.length;
  if (G.che === 'pvp') {
    const r = rngHat((G.hat || 1) * 1009 + G.wave * 7919), k = pvpDotTu(G.wave);
    let w = taoWave(G.wave, r);
    if (k && !w.trum) w = { trum: trumCuaWave(G.wave, 0), ds: Array(4 + Math.min(8, k)).fill('bo') };
    const hsT = k ? 1 + 0.5 * k : 1, soT = k ? 1 + Math.floor(k / 3) : 1;
    // lịch sinh: tính 1 lần (cùng RNG) rồi dùng cho mọi làn → cùng loại / máu / thời điểm
    const lich = [];
    if (w.trum) {
      for (let j = 0; j < soT; j++) lich.push({ dt: 1.5 + j * 2.2, trum: w.trum, hs: hsT });
      w.ds.forEach((q, i) => lich.push({ dt: 3 + i * 1.2, id: q }));
    } else w.ds.forEach((q, i) => lich.push({ dt: 0.3 + (i / w.ds.length) * 13 + r() * 0.3, id: q }));
    for (let pi = 0; pi < soDuong; pi++) for (const h of lich) G.hang.push(Object.assign({ t: G.t + h.dt, p: pi }, h));
    G.tWave = 0; G.laTrum = !!w.trum; G.dotTu = k;
    UI.bangWave(G.wave, G.laTrum);
    if (k === 1 && typeof FX !== 'undefined') FX.chu1(W / 2, H / 2 - 40, 'SUDDEN DEATH', '#ff4b3e', 28, 'to');
    SND.nhac(G.laTrum ? 2 : 1); SND.wave(G.wave, G.laTrum);
    return;
  }
  for (let pi = 0; pi < soDuong; pi++) {
    const w = taoWave(G.wave);
    if (w.trum) {
      // co-op: mỗi nhánh 1 trùm khác loại (trumCuaWave lo cả thứ tự cố định lẫn ngẫu nhiên)
      const id = trumCuaWave(G.wave, pi);
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
  ktDeck('trước bước (thao tác người chơi / gói mạng)');
  try { capNhatTran(dt); } finally { ktDeck('sau bước'); }
}
// ---------- BẤT BIẾN BỘ BÀI (DCDW): mọi ụ trên bàn của 1 người chơi phải thuộc 5 thẻ trong bộ bài của người đó ----------
// Ngoại lệ có tài liệu: KT_DECK_NGOAI (hiện trống — Mimic của Joker King chỉ tồn tại trong lúc ép ghép); ụ đá/băng vẫn là loại trong bộ.
// G.ktDeck: 'nem' = dev/test (localhost, mô phỏng) → ném lỗi kèm đường tạo ụ; true = bản chơi thật → ghi log + sửa an toàn (đổi thành ụ trong bộ, cùng sao, tất định);
// false = màn demo kỹ năng / trang ụ (bàn tạm đặt ụ tuỳ ý). Bàn con rối online (B.net): chỉ ghi log — máy bạn kia là chủ bàn đó.
const KT_DECK_NGOAI = new Set();
function ktDeckBat() { // bật khi vào trận thật (batDau); demo kỹ năng tự tắt sau batDau
  if (typeof location === 'undefined' || typeof document === 'undefined' || !document.body) return false; // mô phỏng node: công cụ tự bật
  const q = location.search || '';
  if (/[?&]ktdeck\b/.test(q)) return 'nem'; // ?ktdeck: ném lỗi (dev)
  // máy kiểm thử (localhost / URL debug) — công cụ tự đặt ụ tuỳ ý qua page.evaluate → tắt; bất biến được kiểm bằng tools/thap-kt-ngoai-deck.js
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname || '') || /[?&](mode|deck|deck2|wave|mana|fill|seed|net|mockws|auto|preview|notut|nointro)=?/.test(q)) return false;
  return true; // bản chơi thật: ghi log + sửa
}
function ktDeck(luc) {
  const che = G.ktDeck; if (!che || !G.ban) return 0;
  let n = 0;
  for (const B of G.ban) {
    if (!B || !B.deck || !B.deck.length) continue;
    for (let o = 0; o < B.t.length; o++) {
      const T = B.t[o]; if (!T || B.deck.includes(T.id) || KT_DECK_NGOAI.has(T.id) || T.ngoaiDeckOk) continue;
      n++;
      const chi = 'ụ ngoài bộ bài: ' + T.id + ' ' + T.sao + '★ ở ô ' + o + ' bàn ' + B.i + ' (' + G.che + ' wave ' + G.wave + ', ' + luc + ') · bộ = ' + B.deck.join(',') + (T._tu ? '\n  tạo tại:\n' + T._tu : '');
      G.ktDeckLoi = (G.ktDeckLoi || 0) + 1;
      if (che === 'nem') throw new Error('[BẤT BIẾN BỘ BÀI] ' + chi);
      try { console.error('[BẤT BIẾN BỘ BÀI] ' + chi); } catch (e) { }
      if (B.net) continue;
      const bo = B.deck.filter(id => SKILLS[id] && G.rosterMap[id]); if (!bo.length) continue;
      const id = bo[(o * 7 + T.sao * 3 + B.i) % bo.length], r0 = Math.random; // tất định, không tiêu RNG chung (online 2 máy như nhau)
      Math.random = rngHat(1000003 + o * 131 + T.sao * 17 + B.i);
      try { const N = sinhU(taoU(B, id, T.sao, o)); N.goc = T.goc; N.khien = T.khien; N.st.da = T.st.da; N.st.bang = T.st.bang; B.t[o] = N; } finally { Math.random = r0; }
    }
  }
  return n;
}
function capNhatTran(dt) {
  G.t += dt;
  if (G.cho > 0) { G.cho -= dt; if (G.cho <= 0) wavMoi(); }
  else {
    G.tWave += dt;
    const conTrum = G.quai.some(e => e.trum && !e.chet);
    if (G.laTrum) { if (!conTrum && !G.hang.length && G.tWave > 4) { G.cho = 2.5; G.laTrum = false; } }
    else if (G.tWave >= LUAT.thoiGianWave || (G.tWave > 6 && !G.hang.length && !G.quai.some(e => !e.chet))) {
      G.cho = 1.2;
      // âm HẾT WAVE (v4): chỉ khi dọn sạch sân (wave cuối → âm thắng lo)
      if (!G.hang.length && !G.quai.some(e => !e.chet) && (G.che === 'pvp' || G.wave < LUAT.waveMax) && SND.xongDot) try { SND.xongDot(); } catch (e) { }
    }
    if (G.cho > 0 && G.che !== 'pvp' && G.wave >= LUAT.waveMax && !G.quai.some(e => !e.chet)) ketThuc(true); // PVP: không giới hạn wave — đột tử tới khi 1 bên hết tim
  }
  // hàng sinh quái
  for (let i = G.hang.length - 1; i >= 0; i--) {
    const h = G.hang[i];
    if (G.t >= h.t) {
      G.hang.splice(i, 1);
      if (h.trum) sinhTrum(h.trum, h.p, h.hs); else sinhQuai(h.id, h.p, 0, 1, h.gui);
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
  donNgam();
}
// BÁO CHIÊU TRÙM thuộc về trùm/chiêu đã tạo ra nó: trùm chết / lọt / bị huỷ chiêu / hết trận → xoá ngay (tâm ngắm phu_ngam + dấu trumvfx).
// Trước đây T.st.ngam = 1,4 chỉ về 0 khi chiêu NỔ → trùm chết giữa lúc báo thì dấu đỏ nhấp nháy ở lại trên ụ mãi.
// Tất định (online): chỉ đọc/ghi trạng thái trận, không Math.random, không phụ thuộc khung hình.
function huyBaoTrum(E) {
  if (!E || !E.bao) return;
  const b = E.bao, B = G.ban[E.ban], B2 = b.ban2 != null ? G.ban[b.ban2] : null;
  if (B) for (const T of B.t) if (T && b.muc && b.muc.includes(T.uid)) T.st.ngam = 0;
  if (B2) for (const T of B2.t) if (T && b.muc2 && b.muc2.includes(T.uid)) T.st.ngam = 0;
  E.bao = null;
  if (typeof TVF !== 'undefined' && TVF.huy) try { TVF.huy(E, b); } catch (e) { }
}
function huyMoiBaoTrum() { // hết trận / về menu / dựng lại trận: không còn báo chiêu nào
  for (const E of G.quai) if (E && E.trum) huyBaoTrum(E);
  for (const B of G.ban || []) for (const T of B.t) if (T) T.st.ngam = 0;
  if (typeof TVF !== 'undefined' && TVF.xoaHet) try { TVF.xoaHet(); } catch (e) { }
}
// quét an toàn mỗi nhịp: tâm ngắm chỉ còn khi có chủ — trùm còn sống đang báo chiêu nhắm ụ đó, ụ đang bị Hex (skills7),
// hoặc Jam của Nhiễu Sóng còn hiệu lực (G.hu 'nhieu', 0,65 s). Mồ côi → về 0 ngay.
const _NGAM = new Set();
function donNgam() {
  _NGAM.clear();
  for (const E of G.quai) if (E.trum && E.bao) {
    if (E.chet) { huyBaoTrum(E); continue; }
    const b = E.bao, B = G.ban[E.ban], B2 = b.ban2 != null ? G.ban[b.ban2] : null;
    if (B) for (const T of B.t) if (T && b.muc && b.muc.includes(T.uid)) _NGAM.add(T);
    if (B2) for (const T of B2.t) if (T && b.muc2 && b.muc2.includes(T.uid)) _NGAM.add(T);
  }
  for (const o of G.hu) if (o.k === 'nhieu' && o.ds) for (const T of o.ds) _NGAM.add(T);
  for (const B of G.ban) for (const T of B.t) if (T && T.st.ngam > 0 && !_NGAM.has(T) && !(T.hexT > 0)) T.st.ngam = 0;
  if (typeof TVF !== 'undefined' && TVF.don) try { TVF.don(); } catch (e) { } // chỉ hiển thị
}

function capNhatBan(B, dt) {
  CH.tick(B, dt); // hồi chiêu + đồng hồ RAGE/khiên (dừng lúc nghỉ giữa wave khi bàn trống quái)
  if (B.phao > 0) SKILLS.orbital.phaoBan(G, B, dt); // vệ tinh bắn phá sau khi ghép ụ Vệ Tinh
  // hỗ trợ: reset rồi các ụ hỗ trợ buff 4 ô kề (trên-dưới-trái-phải)
  for (const T of B.t) if (T) {
    T.buf.toc = 0; T.buf.dmg = 0; T.buf.crit = 0; T.buf.cham = 0; T.buf.chet = 0; T.buf.cdmg = 0; T.buf.xuyen = 0; T.buf.dkHien = 0; T.nguon = []; // nguon: buff nhận từ ụ nào (hiển thị buff)
    if (T.tocT > 0) { T.tocT -= dt; T.buf.toc += T.tocV; } // tăng tốc tạm thời (Kẹp Phá co-op…)
    if (T.giamT > 0) { T.giamT -= dt; T.buf.toc -= T.giamV || 0; } // giảm tốc nhẹ tạm thời (Star Breaker PVP)
    if (T.st.kep > 0) T.st.kep -= dt;
  }
  mocBuf(B); // mốc sao chung 3★ (+20% tốc)
  HOTRO.apDung(B, dt); // hệ thống hỗ trợ chung (hotro.js): hình ô, đường cong sao 3/5/7★, bản mạnh nhất / loại, trần theo nhóm
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
    if (E.cvT > 0) E.cvT -= dt; if (E.cvPT > 0) E.cvPT -= dt; // vệt cầu vồng: hết khi rời vệt 0,6 s (trước đây không giảm → dính mãi)
    if (E.vmT > 0) E.vmT -= dt; if (E.ywT > 0) E.ywT -= dt; if (E.loT > 0) E.loT -= dt; if (E.tpT > 0) E.tpT -= dt; if (E.tempoT > 0) E.tempoT -= dt;
    if (E.chamT > 0) { E.chamT -= dt; if (E.chamT <= 0) E.cham = 0; }
    if (E.docT > 0) { E.docT -= dt; E.docAcc = (E.docAcc || 0) + E.doc * dt; if (E.docAcc >= 1 || E.docT <= 0) { trung(E, E.docAcc, { crit: false, mau: '#9dff5a', im: E.docAcc < 4, B: E.docB }); E.docAcc = 0; } if (E.docT <= 0) E.doc = 0; if (E.chet) continue; } // hết độc → xoá dps độc (không sống lại khi bị gắn cờ độc sau)
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
  if (E.trum) huyBaoTrum(E); // trùm lọt khỏi bàn: huỷ báo chiêu
  const p = G.duong[E.p], B = G.ban[p.ban];
  FX.sang(0.35, '#ff2030'); FX.lac(8);
  SND.lot();
  const BT = G.che === 'coop' ? G.ban[0] : B; // co-op: 3 tim CHUNG (ở bàn 0), quái to / trùm mất như SOLO
  BT.tim -= E.tim;
  const [x, y] = viTri(p, p.len);
  FX.chu1(x - 20, y - 26, '−' + E.tim + '♥', '#ff4b3e', 20, 'to');
  if (BT.tim <= 0) { BT.tim = 0; ketThuc(G.che === 'pvp' ? B.i !== 0 : false, G.che === 'pvp' ? (B.i === 0 ? TEXT.end.youOut : TEXT.end.rivalOut) : G.che === 'coop' ? TEXT.end.coopOut : TEXT.end.coreDown); }
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
  let muc = [], muc2 = [], ban2 = null;
  const r = rngTrum(E); E.rng = r; // dùng lại lúc tung chiêu (mad_crown đổi loại, joker ghép) — vẫn tất định
  if (E.trum === 'mad_crown' || E.trum === 'octopus') muc = tronTrum(ds, r).slice(0, 3);
  else if (E.trum === 'nightmare') muc = tronTrum(ds, r).sort((a, b) => b.sao - a.sao).slice(0, 1);
  else if (E.trum === 'freezer') {
    // nhiều ụ: chọn NGẪU NHIÊN mỗi lần (tất định theo rngTrum — online vẫn khớp; người dùng chốt 07/11, bỏ ưu tiên sao cao). CO-OP: chia đôi cho 2 bàn (bàn trùm lấy phần lẻ), bàn nào thiếu ụ thì bàn kia bù
    const n = LUAT_BANG.so(G.wave), xep = (L) => tronTrum(L, r);
    const B2 = G.che === 'coop' && G.ban.length === 2 ? G.ban[1 - B.i] : null;
    const ds2 = B2 ? B2.t.filter(T => T && !T.st.da && !(T.st.bang > 0)) : [];
    const ds1 = ds.filter(T => !(T.st.bang > 0)).length ? ds.filter(T => !(T.st.bang > 0)) : ds;
    let n1 = B2 ? Math.ceil(n / 2) : n, n2 = n - n1;
    if (!B2) n2 = 0;
    if (ds2.length < n2) { n1 += n2 - ds2.length; n2 = ds2.length; }
    if (ds1.length < n1 && B2) { n2 = Math.min(ds2.length, n2 + n1 - ds1.length); }
    muc = xep(ds1).slice(0, n1);
    if (B2 && n2 > 0) { muc2 = xep(ds2).slice(0, n2); ban2 = B2.i; }
  }
  else if (E.trum === 'janus') muc = [chonTrum(ds, r)];
  else if (E.trum === 'joker_king') { const co = ds.filter(T => coCapJoker(B, T)); muc = [chonTrum(co.length ? co : ds, r)]; } // ưu tiên ụ CÓ bạn ghép cùng sao (Mimic không bao giờ nằm lại trên bàn)
  E.bao = { t: 0, song: 1.4, muc: muc.map(T => T.uid), muc2: muc2.map(T => T.uid), ban2 };
  for (const T of muc) T.st.ngam = 1.4;
  for (const T of muc2) T.st.ngam = 1.4;
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
  const B2 = E.bao.ban2 != null ? G.ban[E.bao.ban2] : null, muc2 = B2 ? B2.t.filter(T => T && (E.bao.muc2 || []).includes(T.uid)) : [];
  for (const T of muc2) T.st.ngam = 0;
  const r = E.rng || rngTrum(E), pk = (L) => L[Math.floor(r() * L.length)];
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
      for (const T of muc) { if (biKhoa(T)) continue; deBan(T, 0, '#ff6ad5'); const N = giuKhiBien(sinhR(taoU(B, pk(B.deck), T.sao, T.o), r), T); N.anim = { k: 'no', t: 0 }; B.t[T.o] = N; // biến tại chỗ: giữ bản sao (MA-TRAN.md); đá/băng: không biến
        FX.tiaLua(rong(T).x, rong(T).y, 14, '#ff6ad5'); }
      break;
    case 'freezer': { // nhiều ụ, 6 s; Halo (khiên bàn từ Halo) → nửa thời gian, vẫn mọi ụ. Hình: BANGFX (js/bangfx.js) — mảnh băng bay → bọc băng → vỡ
      const dong = (BB, L, giay) => L.forEach((T, i) => { const tre = 0.32 + i * 0.09; T.st.bang = giay + tre; if (typeof BANGFX !== 'undefined') BANGFX.ban(E, BB, T, tre); else { const c = BB.o[T.o]; FX.no('bang_vo', c.x, c.y, 80, 0.45); } });
      dong(B, muc, E.bao.haloA ? LUAT_BANG.giay / 2 : LUAT_BANG.giay);
      if (B2 && B2 !== B && muc2.length) { // CO-OP: phần của bàn đồng đội — khiên/Halo của bàn đó
        const halo2 = B2.halo > 0 && B2.khien > 0 && B2.khien <= B2.halo + 0.05;
        let L = muc2.slice();
        if (B2.khien > 0 && !halo2) { for (const T of L) VX.chanKhien(B2, T); L = []; }
        else if (!halo2) for (let i = L.length - 1; i >= 0; i--) if (chanKhien(B2, L[i])) L.splice(i, 1);
        dong(B2, L, halo2 ? LUAT_BANG.giay / 2 : LUAT_BANG.giay);
      }
      if (typeof BANGFX !== 'undefined') BANGFX.tung(E);
      SND.bang();
      break;
    }
    case 'janus':
      for (const T of muc) { if (biKhoa(T)) continue; deBan(T, 0, '#e0c070'); T.st.da = true; const c = rong(T); FX.bui(c.x, c.y, 10, 16); FX.lac(4); }
      break;
    case 'joker_king': // ném mimic → ụ bị biến thành mimic rồi ép ghép với ụ cùng sao
      for (const T of muc) {
        if (biKhoa(T)) continue; // đá / băng: không bị ném Mimic (khoá chặn biến + ghép)
        deBan(T, 0, '#ffd23f');
        // DCDW: mọi ụ trên bàn chỉ từ bộ bài → Mimic chỉ tồn tại TRONG lúc ép ghép. Không còn bạn cùng sao (6★ duy nhất, 7★, bàn đổi trong 1,4 s báo trước)
        // → chiêu HỤT, ụ giữ nguyên (lỗi cũ 06/11: Mimic 6★ ngoài bộ bài nằm lại vĩnh viễn trên bàn SOLO wave 33)
        const ban = B.t.filter(X => X && X !== T && X.sao === T.sao && !X.st.da && !X.st.bang);
        if (!ban.length || T.sao >= LUAT.saoMax) { const c = rong(T); FX.chu1(c.x, c.y - 18, TEXT.fx.blocked, '#ffd23f', 11); continue; }
        const M = giuKhiBien(taoU(B, 'mimic', T.sao, T.o), T); B.t[T.o] = M; // biến tại chỗ giữ bản sao; ép ghép → ghép thường ra ụ mới trong bộ (hết bản sao)
        ghep(B, M, chonTrum(ban, r), true);
      }
      break;
    case 'nightmare':
      for (const T of muc) { const c = rong(T); G.hu.push({ k: 'tiaTia', t: 0, song: 0.25, x0: E.x, y0: E.y, x1: c.x, y1: c.y, mau: '#ff3b3b' }); haSao(B, T, 'snipe'); }
      SND.tia();
      break;
    case 'octopus':
      for (const T of muc) { if (biKhoa(T)) continue; deBan(T, 0, '#ff8a2a'); T.st.lua = 6; } // ụ khoá (đá/băng) không nhận trạng thái xấu mới — rà cộng hưởng 07/11, người dùng chốt
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
// AI chọn cặp ghép KHÔN hơn cho ụ có cơ chế vị trí (co-che-moi): Pháo La Bàn — ưu tiên CÙNG mũi tên (cộng số), rồi vuông góc kéo số nhỏ
// vào số lớn, ngược hướng sau cùng (vẫn có sóng nổ) · Drone Kéo Xa — cặp xa nhau nhất. Cặp khác: giữ nguyên lựa chọn cũ.
function aiCapTot(ts, a, b, hl) {
  if (a.id !== b.id || (a.id !== 'canon' && a.id !== 'drone')) return [a, b];
  let best = [a, b], bv = -1e9;
  for (const x of ts) for (const y of ts) {
    if (x === y || x.id !== a.id || y.id !== a.id || x.sao !== a.sao || !hl(x, y)) continue;
    let v;
    if (a.id === 'drone') v = SKILLS.drone.quang(x.o, y.o) * 10 - x.o * 0.01;
    else { const S = SKILLS.canon, k = S.ketQua(x, y); v = (k.kieu === 'cong' ? 1000 : k.kieu === 'giu' ? 500 : 0) + k.so * 10 + k.song * 3 - x.o * 0.01; }
    if (v > bv) { bv = v; best = [x, y]; }
  }
  return best;
}
function aiBan(B, dt) {
  B.aiT -= dt; if (B.aiT > 0) return;
  B.aiT = G.che === 'pvp' && B.ai ? 0.9 : 0.6;
  const ts = B.t.filter(Boolean);
  if (G.che === 'pvp' && B.ai && CH.trangThai(B) === 'san') { // PVP: chỉ huy khi trùm trên làn mình hoặc còn 1 tim
    const trumLan = G.quai.some(E => E.trum && !E.chet && G.duong[E.p].ban === B.i && E.vao >= 1);
    if ((trumLan || B.tim <= 1) && (B.mv.id !== 'hero' || oTrong(B).length >= 2)) { dungMV(B); return; }
  }
  if (CH.trangThai(B) === 'san' && B.mana > 200 && Math.random() < 0.3) { dungMV(B); return; }
  if (B.mana >= B.gia && oTrong(B).length) { trieu(B); return; }
  // ghép: ưu tiên sao thấp
  // kỹ năng chủ động của ụ ĐỎ: AI tự dùng khi nạp đầy
  for (const T of ts) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && !biKhoa(T) && sk.aiNen(G, B, T)) { sk.chuDong(G, B, T); return; } }
  ts.sort((a, b) => a.sao - b.sao);
  const hl = (a, b) => hopLeGhep(a, b) && !(biKhoa(b) && !biKhoa(a)) && (a.id === b.id || a.id === 'mimic' || b.id === 'mimic' || (a.sao === b.sao && a.id !== 'dichchuyen' && SKILLS[b.id].vai !== 'ht'));
  if (oTrong(B).length <= 3) for (const a of ts) for (const b of ts) if (a !== b && a.sao < 6 && hl(a, b) && (SKILLS[a.id].vai !== 'ht' || ts.filter(x => x.id === a.id).length > 2)) { const [x, y] = aiCapTot(ts, a, b, hl); ghep(B, x, y); return; }
  if (oTrong(B).length === 0) for (const a of ts) for (const b of ts) if (a !== b && hl(a, b)) { const [x, y] = aiCapTot(ts, a, b, hl); ghep(B, x, y); return; }
  // POWER-UP: mọi loại đều có ích (10 ụ không sát thương nâng chính số kỹ năng — KY_NANG_CAP.pu, KIEM.md mục IX 'Đã quyết' #1)
  //  ưu tiên cấp thấp nhất, rồi loại đang có NHIỀU ụ trên bàn (nâng thứ đang đứng trên bàn); loại không có ụ nào trên bàn để sau
  const dem = (id) => ts.reduce((n, T) => n + (T.id === id ? 1 : 0), 0);
  const loai = B.deck.filter(id => B.lv[id] < 5 && !(SKILLS[id] && SKILLS[id].khongNang)).sort((a, b) => (dem(a) ? 0 : 1) - (dem(b) ? 0 : 1) || B.lv[a] - B.lv[b] || dem(b) - dem(a));
  if (loai.length && B.mana >= LUAT.giaNangCap[B.lv[loai[0]] - 1] + (oTrong(B).length ? B.gia : 0)) nangCap(B, loai[0]);
}

// băng thông báo của trận (BOSS INCOMING, băng wave, cut-in) không được nằm đè lên màn kết quả: trận hết thì không còn ai
// (HUD ngừng cập nhật) đếm ngược / tự tắt chúng → dọn hết khi hiện kết quả
function anBangTran() {
  try { if (typeof HT !== 'undefined' && HT.cbAn) HT.cbAn(false); } catch (e) { }
  for (const s of ['#canh-bao', '#bang-wave', '#cutin']) { const e = document.querySelector(s); if (e) { e.hidden = true; e.classList.remove('chay', 'cb-bao', 'cb-den', 'cb-ra', 'ht-cb', 'ht-bw'); } }
}
function ketThuc(thang, ly) {
  if (G.ketThuc) return;
  G.ketThuc = { thang, ly, wave: G.wave };
  huyMoiBaoTrum(); // thắng / thua / bỏ cuộc: bàn còn hiện 0,9 s — không để dấu báo chiêu
  SND.ketThuc(thang); SND.nhac(0);
  setTimeout(() => { anBangTran(); UI.ketQua(G.ketThuc); }, 900);
}
