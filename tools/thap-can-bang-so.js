// TURRET MERGE — CÂN BẰNG SỐ HOÁ ụ VÀNG (33) / ĐỎ (11 trong roster): mỗi ụ đặt trong BỘ PHÙ HỢP NHẤT, so trong CÙNG BẬC.
//   Tài liệu + bảng: docs/demo-hop-tuong/tocban/CAN-BANG-VANG-DO.md
//   node tools/thap-can-bang-so.js [ra=/thư/mục] [chi=id,id] [T0=40] [hat=4242,777]     → đo, ghi <ra>/can-bang.json
//   HS=1 node tools/thap-can-bang-so.js ra=… ten=can-bang-b                               → bài B: quái thường máu ×1 (mặc định bài A: ×4)
//   node tools/thap-can-bang-so.js kt                                                    → tự kiểm chéo công thức (dmgU × tocU × crit) với số đo
// CÁCH ĐO (tất định, không giao diện — nạp code game thật bằng vm như tools/thap-sim-vaitro.js, nhanh hơn Playwright ~50×):
//   · Gán thẳng trạng thái bàn 15 ô (không chơi từ wave 1). 3 kịch bản: w20 (mọi ô 3★, power-up +1) · w40 (5★, +3) · w60 (7★, MAX). Cấp thẻ = cấp đầu bậc.
//   · Dòng quái chuẩn (cùng hạt): 1 TRÙM thật của wave đó luôn có mặt (máu thật; chết → trùm mới, không tung chiêu) + quái thường của wave (2 con/giây, tối đa 10,
//     máu ×4 để bàn trung bình không dọn sạch tức thì — máu ×1 thì mọi bộ bão hoà theo nguồn quái); quái tới cuối đường quay lại đầu (đo sát thương thuần). Chạy 6 s làm nóng + T0 giây đo bằng capNhat(1/30) của game.
//   · Trạng thái tích luỹ (lửa, stack, Máu, VỰC SÂU, điểm quả, mana giữ…) đặt sẵn theo wave và GIỮ NGUYÊN trong lúc đo (ghi ở KIT.gd).
//   · V = sát thương thật/giây của cả bàn. v0 = V(bàn 15 ụ tham chiếu R, không hỗ trợ)/15. ĐIỂM E của bộ = (V(bộ) − số ô R × v0) / (số ô không phải R × v0)
//     = "mỗi ô của bộ (ụ chính + ụ đi kèm) đáng bao nhiêu ụ Vàng Tấn công tham chiếu". Ụ hỗ trợ/đặc biệt: đặt vào bàn R → E = giá trị cận biên của ô X /
//     giá trị cận biên của ụ R ở đúng ô đó (E = 1: đáng bằng 1 ụ R; E = 0: như ô trống).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
const REF = process.env.REF || 'nhatthuc'; // ụ Vàng Tấn công tham chiếu (bắn thẳng, không điều kiện, gần trung vị Vàng TC)
const KB = [{ ten: 'w20', w: 20, S: 3, lv: 2, mana: 200 }, { ten: 'w40', w: 40, S: 5, lv: 4, mana: 400 }, { ten: 'w60', w: 60, S: 7, lv: 5, mana: 600 }];

function taoMoiTruong(hat) {
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  R(ctx, `
  const _lotCB = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotCB(E); };
  const _trCB = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet, T = o && o.T !== undefined ? o.T : G.dangBan; const r = _trCB(E, d, o);
    if (!c && G._theo) { const x = Math.min(h, Math.max(0, h - Math.max(0, E.hp))), k = T && T.id ? T.id : '?'; G._theo[k] = (G._theo[k] || 0) + x; G._tong += x; } return r; };
  var CBS = {
    dung(c) {
      G.debug = { auto: false }; batDau('solo', c.deck, 'hero'); G.cho = 1e9; G.wave = c.w; G._vong = true; G._theo = null; G._tong = 0;
      const B = G.ban[0]; B.tim = 1e9; B.mana = c.mana; B.capThe = {}; B.lv = B.lv || {};
      for (const id of c.deck) B.lv[id] = SKILLS[id].khongNang ? 1 : c.lv;
      for (const x of c.o) { const T = taoU(B, x.id, x.s, x.o); if (x.truoc) Object.assign(T, x.truoc); sinhU(T); if (x.st) Object.assign(T, JSON.parse(JSON.stringify(x.st))); B.t[x.o] = T; }
      if (c.B) Object.assign(B, JSON.parse(JSON.stringify(c.B)));
      G._c = c; G._rq = rngHat(c.hat || 1); G._nq = 0;
    },
    giu() { // giữ trạng thái tích luỹ + mana như đặt sẵn, tự dùng chủ động
      const c = G._c, B = G.ban[0]; B.mana = c.mana; B.tim = 1e9;
      if (c.B) Object.assign(B, JSON.parse(JSON.stringify(c.B)));
      if (c.hero != null) B.hero = [{ o: c.hero, het: G.t + 99, toc: SKILLS.xuonganh.TOC, cdmg: SKILLS.xuonganh.CDMG, v: SKILLS.xuonganh.TOC, t0: G.t }];
      for (const x of c.o) { const T = B.t[x.o]; if (T && T.id === x.id && x.st) Object.assign(T, JSON.parse(JSON.stringify(x.st))); if (T && T.id === x.id) { T.st.da = false; T.st.bang = 0; T.st.lua = 0; T.st.kep = 0; } }
      for (const T of B.t) if (T) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && T.sao >= 3) { try { if (!sk.aiNen || sk.aiNen(G, B, T)) sk.chuDong(G, B, T); } catch (e) { G._loi = String(e); } } }
    },
    chay(T0, nong) {
      const dt = 1 / 30, c = G._c, ds = taoWave(c.w - 1, rngHat(7)).ds; let i = 0;
      for (let t = 0; t < nong + T0; t += dt, i++) {
        if (!G._theo && t >= nong) { G._theo = {}; G._tong = 0; G._giet = G.ban[0].dem.giet; }
        if (i % 15 === 0) {
          let n = 0, tr = false; for (const E of G.quai) if (!E.chet) { if (E.trum) tr = true; else n++; }
          if (!tr) { const E = sinhTrum(TRUM_THU_TU[0], 0, 1); E.vao = 1; E.knT = 1e9; }
          if (n < 10 && !c.chiTrum) { const Q = sinhQuai(ds[Math.floor(G._rq() * ds.length)], 0, 0, c.hsQuai || 4); Q.vao = 1; }
          CBS.giu();
        }
        for (const E of G.quai) if (E.trum) E.knT = 1e9;
        capNhat(dt);
        if (window._cho.length) { const q = window._cho.splice(0); for (const f of q) { try { f(); } catch (e) { } } }
      }
      const r = { V: G._tong / T0, theo: {}, giet: (G.ban[0].dem.giet - G._giet) / T0, loi: G._loi || null, con: G.ban[0].t.filter(Boolean).length };
      for (const k in G._theo) r.theo[k] = Math.round(G._theo[k] / T0);
      G._theo = null; G._loi = null; return r;
    },
  };`);
  if (process.env.SUA) R(ctx, process.env.SUA); // vá thử hằng số để đo ĐỀ XUẤT (không sửa code game): SUA='SKILLS.cobac.dmg = 46;'
  return ctx;
}

// ---------- BỘ TEST ----------
// ô: o = hàng × 5 + cột (hàng 0..2, cột 0..4). Ô 7 = giữa bàn. Mặc định bộ Tấn công: X × 12 + Sync Cannon (ô 2) + Star Breaker (ô 6) + Sanctum (ô 8).
const HT0 = [[2, 'dongbo'], [6, 'hasao'], [8, 'thanhdia']];
const tat = (n) => Array.from({ length: n }, (_, i) => i);
// bộ Tấn công chuẩn: st(i, k) → trạng thái đặt sẵn cho bản X thứ i (0..) ở kịch bản k
function boTC(id, st, o) {
  o = o || {};
  return (k, S) => {
    const ht = o.ht || HT0, oHT = new Set(ht.map(x => x[0])), cells = ht.map(([p, h]) => ({ o: p, id: h, s: S }));
    let i = 0; for (const p of tat(15)) if (!oHT.has(p)) { const dk = o.kem && o.kem[p]; cells.push(dk ? { o: p, id: dk, s: S } : { o: p, id, s: S, st: st ? st(i, k, p) : undefined, truoc: o.truoc ? o.truoc(i, k, p) : undefined }); if (!dk) i++; }
    return { cells };
  };
}
// bộ trên bàn R: đặt ụ X vào các ô `oX`, phần còn lại R
function boR(id, oX, st, them, saoO) {
  return (k, S) => {
    const s = new Set(oX), so = (p) => (saoO ? saoO(p, S) : S);
    const cells = tat(15).map(p => (s.has(p) ? { o: p, id, s: S, st: st ? st(oX.indexOf(p), k) : undefined } : { o: p, id: REF, s: so(p) }));
    const goc = tat(15).map(p => ({ o: p, id: REF, s: s.has(p) ? S : so(p) }));
    return Object.assign({ cells, goc, oX }, them ? them(k, S) : {});
  };
}
const gocR = (S) => tat(15).map(p => ({ o: p, id: REF, s: S }));
const KIT = {
  // ===== VÀNG — Tấn công =====
  nhatthuc: { kho: 1, lk: 'bắn thẳng, tự đổi Ngày/Đêm, không điều kiện', ly: 'chuẩn: 12 Eclipse + 3 hỗ trợ buff ST (Sync/Star Breaker/Sanctum)', pa: [boTC('nhatthuc')] },
  soi: { kho: 1, lk: 'bắn thẳng + lan; bản Thức tỉnh là may rủi lúc sinh (30%), người chơi chỉ lọc dần', ly: 'chuẩn + 4/6/6 trong 12 Sói là bản Thức tỉnh', gd: 'thức tỉnh 4/12 (w20, ≈30% tự nhiên) → 6/12 (lọc dần qua ghép)', pa: [boTC('soi', (i, k) => ({ thuc: i < (k ? 6 : 4) }))] },
  wallgen: { kho: 2, lk: 'tường tự dựng (dễ) nhưng Tường Vàng cần ghép 2 Máy Dựng Tường', ly: 'chuẩn; giá trị chặn quái không tính', gd: 'không tính Tường Vàng khi ghép', pa: [boTC('wallgen'), boR('wallgen', [6, 8])], hc: 'chặn quái (khống chế) không vào DPS' },
  hydra: { kho: 2, lk: 'không nâng mana; cuồng nộ tốn mana gấp đôi mỗi lần, phải để dành', ly: 'chuẩn; tự kích khi đủ mana (mana giữ 200/400/600)', pa: [boTC('hydra')] },
  cuuvi: { kho: 2, lk: 'phải GIẾT để mọc đuôi (9 đuôi mới xả)', ly: 'chuẩn; đuôi tích tự nhiên theo số quái bị giết trong bài đo', pa: [boTC('cuuvi')] },
  nemesis: { kho: 2, lk: 'tích PHÁN QUYẾT vĩnh viễn theo từng ụ, mất khi ghép', ly: 'chuẩn; đòn % máu tối đa hợp trùm', gd: 'phán quyết: tốc +20/40/60%, ST +12/40/100% (w20/40/60)', pa: [boTC('nemesis', (i, k) => ({ nmToc: [0.2, 0.4, 0.6][k], nmDmg: [0.12, 0.4, 1][k] }))], sua2: ['SKILLS.nemesis.TRAN_TRUM = 0', 'SKILLS.nemesis.TRAN_TRUM = 0.012'], hc: 'đòn % máu tối đa phồng khi Trùm luôn có mặt: điểm = trung bình nhân của (bài chuẩn) và (bài tắt % máu lên Trùm); cả 2 số ghi ở cột ghi chú' },
  aten: { kho: 2, lk: 'cần ụ gây độc đi kèm (×4 chỉ khi quái trúng độc)', ly: '9 Purifier + 3 Toxic Pool (độc) + 3 hỗ trợ', pa: [boTC('aten', null, { kem: { 0: 'vungdoc', 4: 'vungdoc', 12: 'vungdoc' } }), boTC('aten', null, { kem: { 0: 'vungdoc', 4: 'vungdoc', 10: 'vungdoc', 14: 'vungdoc', 12: 'vungdoc' } })] },
  railgun: { kho: 3, lk: 'BINGO: phải xếp đủ hàng 5 / cột 3 toàn Salvo', ly: 'kín 15 ô Salvo (3 hàng + 5 cột bingo) hoặc 2 hàng bingo + hàng giữa hỗ trợ', pa: [(k, S) => ({ cells: tat(15).map(p => ({ o: p, id: 'railgun', s: S })) }), boTC('railgun', null, { ht: [[6, 'dongbo'], [7, 'hasao'], [8, 'thanhdia']] })] },
  ngoisao: { kho: 3, lk: 'phải giữ TỔNG SAO bàn đúng mốc 10/50 (ghép là lệch mốc)', ly: 'chuẩn, chỉnh sao vài ô để tổng sao ĐÚNG mốc: 50★ (w20) · 80★ (w40) · 100★ (w60)', gd: 'tổng sao đúng mốc 50 / 80 / 100', pa: [(k, S) => { const c = boTC('ngoisao')(k, S).cells; const d = [5, 5, -5][k]; const ds = c.filter(x => x.id === 'ngoisao'); for (let i = 0; i < Math.abs(d); i++) ds[i].s += Math.sign(d); return { cells: c }; }, boTC('ngoisao')] },
  hopca: { kho: 3, lk: 'HOÀ ÂM: ụ kề 4 phía phải CÙNG SAO', ly: 'chuẩn, mọi ô cùng sao → ô trong 4 Hoà âm, ô biên 3, góc 2', pa: [boTC('hopca')] },
  luutru: { kho: 2, lk: 'điểm tích thụ động theo số lần ghép (lâu), dồn điểm khi ghép Archive', ly: 'chuẩn; điểm Archive theo số lần ghép', gd: 'điểm: 2 ụ 10 + còn lại 3 (w20) · 2 ụ 30 + 10 (w40) · 3 ụ 40 + 20 (w60); trần LV9 = 40', pa: [boTC('luutru', (i, k) => ({ kho: i < (k === 2 ? 3 : 2) ? [10, 30, 40][k] : [3, 10, 20][k] }))] },
  lualien: { kho: 3, lk: 'truyền lửa theo HÀNG/CỘT khi ghép/bán — phải xếp và ghép có chủ đích', ly: 'chuẩn; lửa dồn vào 2–4 ụ', gd: 'lửa: 2 ụ 45 + còn lại 10 (w20) · 2 ụ 90 + 25 (w40) · 3 ụ 90 + 40 (w60); trần LV9 = 90', pa: [boTC('lualien', (i, k) => ({ lc: i < (k === 2 ? 3 : 2) ? [45, 90, 90][k] : [10, 25, 40][k] }))] },
  canon: { kho: 3, lk: 'gộp đủ 4 hướng NSWE rồi NSWE + NSWE mới có stack', ly: 'chuẩn; 2 Pháo NSWE dồn stack, phần còn lại đang gộp hướng', gd: 'w20: 1 ụ NSWE stack 1 + 3 ụ NSWE stack 0 + 8 ụ 2 hướng · w40: 2 ụ NSWE stack 3 + 10 ụ NSWE stack 0 · w60: 2 ụ stack 6 + 10 ụ NSWE stack 1 (bot dồn đo được stack lớn nhất 1 ở w20, 3 ở w30)', pa: [boTC('canon', (i, k) => (k === 0 ? (i === 0 ? { hb: 15, cmC: 1 } : i < 4 ? { hb: 15, cmC: 0 } : { hb: 5, cmC: 0 }) : { hb: 15, cmC: i < 2 ? [0, 3, 6][k] : [0, 0, 1][k] }))] },
  mauhut: { kho: 3, lk: 'đánh dấu và HY SINH ụ của mình để lấy Máu', ly: 'chuẩn; 2 ụ nuôi Máu', gd: 'Máu: 2 ụ 20 + còn lại 0 (w20) · 2 ụ 80 + 5 (w40) · 2 ụ 200 + 15 (w60) — 200 Máu = đã nuốt 40★', pa: [boTC('mauhut', (i, k) => ({ mau: i < 2 ? [20, 80, 200][k] : [0, 5, 15][k] }))] },
  bienmau: { kho: 3, lk: 'xếp 4 màu khác nhau cạnh nhau rồi vuốt HỢP THỂ, hợp thể tiếp để mạnh', ly: 'chuẩn; 1–2 Lăng Kính Quang Phổ + Prism màu đơn', gd: 'hợp thể: 1 ụ n=1 (w20) · n=3 và n=1 (w40) · n=6 và n=3 (w60); stack màu ở trần', pa: [boTC('bienmau', (i, k) => { const n = i === 0 ? [1, 3, 6][k] : i === 1 ? [0, 1, 3][k] : 0; return n ? { pf: n, pmk: [999, 999, 999, 999] } : { pm: i % 4, pms: 999 }; })] },
  // ===== VÀNG — Hỗ trợ (đặt vào bàn R) =====
  dongbo: { kho: 2, lk: 'chỉ buff ụ CÙNG SAO với nó', ly: '14 R cùng sao + 1 Sync Cannon', gd: 'bàn lẫn sao: 7 ụ R cùng sao với Sync, 6 ụ R thấp hơn 1★ (bàn đồng sao tuyệt đối: xem ghi chú)', pa: [boR('dongbo', [2, 12], null, null, (p, S) => (p % 2 ? S - 1 : S)), boR('dongbo', [2, 12])], lay: 0 },
  hasao: { kho: 1, lk: 'buff 4 ô kề, đặt là xong', ly: 'bàn R + Star Breaker ở ô giữa hàng', pa: [boR('hasao', [6, 8])] },
  thanhdia: { kho: 1, lk: 'buff 4 ô kề + khiên, đặt là xong', ly: 'bàn R + Sanctum', pa: [boR('thanhdia', [6, 8])], hc: 'khiên/tẩy không vào DPS' },
  luoicheo: { kho: 2, lk: 'buff 4 ô CHÉO, đủ 4 ô chéo mới Cộng hưởng', ly: 'bàn R + Resonance Grid ở ô có đủ 4 ô chéo (hàng giữa)', pa: [boR('luoicheo', [6, 8])] },
  cauvong: { kho: 1, lk: 'tự vẽ vệt lên đường', ly: 'bàn R + Rainbow', pa: [boR('cauvong', [6, 8])] },
  guongcong: { kho: 2, lk: 'kháng khống chế + chặn chiêu Trùm theo hồi chiêu', ly: 'bàn R + Mirror Gate', pa: [boR('guongcong', [6, 8])], hc: 'KHÔNG ĐO ĐƯỢC: giá trị là chặn chiêu Trùm / kháng khống chế (bài đo tắt chiêu Trùm)' },
  // ===== VÀNG — Đặc biệt / Khống chế =====
  orbital: { kho: 3, lk: 'chỉ đánh khi GHÉP 2 Vệ Tinh (thức 23 s) — phải canh ghép', ly: 'bàn R + 4 Vệ Tinh; đo lúc THỨC × tỉ lệ thức giả định', gd: 'tỉ lệ thời gian thức 50% (w20, w40) · 25% (w60, 7★ không ghép được nữa)', pa: [boR('orbital', [1, 3, 11, 13], () => ({ thucT: 20 }))], nhan: [0.5, 0.5, 0.25] },
  marionette: { kho: 1, lk: 'tự bắt quái theo chu kỳ', ly: 'bàn R + 2 Rối Máy', pa: [boR('marionette', [6, 8])], hc: 'đi lùi (khống chế) không vào DPS' },
  xuonganh: { kho: 3, lk: 'ghép 2 Xưởng đúng Ô của ụ chủ lực, hiệu lực 25 s', ly: 'bàn R + 2 Xưởng chờ ghép; ô anh hùng trên 1 ụ R', gd: 'ô ANH HÙNG bật 50% thời gian (đo bật/tắt rồi trung bình)', pa: [boR('xuonganh', [6, 8], null, () => ({ hero: 7 })), boR('xuonganh', [6, 8])], tb: true },
  loren: { kho: 3, lk: 'cộng dồn Anvil có rủi ro hỏng, rồi kéo lên ụ chủ lực', ly: 'bàn R; 3 ụ R mang buff Anvil ST (Anvil đã dùng, không chiếm ô)', gd: 'mỗi Anvil cộng dồn = sao × 2 (đã rèn 1 lần): +18% / +30% / +42% ST cho 1 ụ', pa: [(k, S) => ({ cells: tat(15).map(p => ({ o: p, id: REF, s: S, st: [6, 7, 8].includes(p) ? { anv: { k: 'dmg', v: [0.18, 0.30, 0.42][k] } } : undefined })), goc: gocR(S), ao: 3 })], hc: 'quy đổi: mỗi Anvil đã dùng tính như 1 ô' },
  saochep: { kho: 2, lk: 'kéo lên ụ cùng sao để chép (70%)', ly: 'bàn R; 3 bản sao của R (70% ST)', pa: [(k, S) => ({ cells: tat(15).map(p => ({ o: p, id: REF, s: S, st: [6, 7, 8].includes(p) ? { banSao: true } : undefined })), goc: gocR(S), oX: [6, 7, 8], deck: [REF, 'saochep'] })], hc: 'chép ụ R; chép ụ chủ lực thật thì = 70% điểm ụ đó (đặc tính ngẫu nhiên quay lại, stack riêng mất)' },
  nguyenrua: { kho: 2, lk: 'ghép 2 Kẻ Nguyền mới ra lời nguyền', ly: 'bàn R + 2 Kẻ Nguyền (chỉ đo phần tự bắn)', pa: [boR('nguyenrua', [6, 8])], hc: 'KHÔNG ĐO HẾT: lời nguyền khi ghép (chậm + nhận thêm ST) và PVP −1★' },
  vughep: { kho: 2, lk: 'kéo lên ụ cùng sao (+1★ giữ loại)', ly: 'bàn R + 2 Vua Ghép (chỉ đo phần tự bắn)', pa: [boR('vughep', [6, 8])], hc: 'KHÔNG ĐO HẾT: giá trị là +1★ giữ loại (kinh tế ghép)' },
  sinhdoi: { kho: 2, lk: 'ghép 2 Máy Sinh Đôi để được thêm ụ', ly: 'bàn R + 2 Sinh Đôi (chỉ đo phần tự bắn)', pa: [boR('sinhdoi', [6, 8])], hc: 'KHÔNG ĐO HẾT: giá trị là ụ tặng thêm (kinh tế ghép)' },
  tudo: { kho: 1, lk: 'ghép với bất kỳ ụ nào', ly: 'bàn R + 2 Wild Link (chỉ đo phần tự bắn)', pa: [boR('tudo', [6, 8])], hc: 'KHÔNG ĐO HẾT: giá trị là ghép tự do (kinh tế ghép)' },
  pandora: { kho: 2, lk: 'ghép 2 Hộp mới mở, kết quả 1 trong 6', ly: 'bàn R + 2 Pandora (chỉ đo phần tự bắn)', pa: [boR('pandora', [6, 8])], hc: 'KHÔNG ĐO HẾT: 6 hiệu ứng khi ghép' },
  tienhoa: { kho: 1, lk: 'tự nở sau thời gian', ly: '—', pa: [], hc: 'KHÔNG ĐO: không bắn; giá trị là ụ +1★ sau 10 s + 2 s/★ (tạo ụ)' },
  congap: { kho: 1, lk: 'tự gọi ụ 1★ mỗi 11 s', ly: '—', pa: [], hc: 'KHÔNG ĐO: không bắn; giá trị là ụ 1★ miễn phí (tạo ụ)' },
  // ===== ĐỎ — Tấn công (bộ: 12 Đỏ + 3 hỗ trợ Vàng; tối đa 1 loại Đỏ) =====
  overlord: { kho: 1, lk: 'tự nạp rồi bắn sấm vùng, không điều kiện', ly: 'chuẩn', pa: [boTC('overlord')] },
  chuato: { kho: 1, lk: 'drone tự sinh, tự xả khi đầy', ly: 'chuẩn', pa: [boTC('chuato')] },
  cobac: { kho: 1, lk: 'quay may rủi tự động, không điều khiển được; không nâng mana', ly: 'chuẩn; điểm quả chung của bàn', gd: 'điểm quả mỗi ngăn 13 / 23 / 27 (kỳ vọng theo wave, DO-VANG-DO.md)', pa: [boTC('cobac', (i, k) => ({ cbS: [3, 5, 7][k], cbQuay: 0 }), { B: 1 })], Bk: (k) => ({ cb: [[13, 13, 13], [23, 23, 23], [27, 27, 27]][k] }) },
  blackhole: { kho: 2, lk: 'hố tự mở, nhưng SỤP ĐỔ KỲ DỊ phải bấm đúng lúc (30 mana)', ly: 'chuẩn; tự dùng chủ động khi nạp đầy', pa: [boTC('blackhole'), boR('blackhole', [6, 8])], hc: 'giữ chân quái không vào DPS' },
  ronglua: { kho: 2, lk: 'giữ Nhiệt (nguội 2%/s), ghép cùng hàng/cột để bơm nhiệt', ly: 'chuẩn; nhiệt tự tích trong bài đo', gd: 'nhiệt đặt sẵn 60 / 150 / 300 (sàn; tia trúng tự cộng thêm)', pa: [boTC('ronglua', null, { truoc: (i, k) => ({ nhiet: [60, 150, 300][k] }) })] },
  thacmana: { kho: 2, lk: 'phải GIỮ mana không tiêu (hy sinh triệu hồi/nâng cấp)', ly: 'chuẩn; giữ mana cao', gd: 'mana giữ 300 / 800 / 2000', pa: [boTC('thacmana')], mana: [300, 800, 2000] },
  leviathan: { kho: 3, lk: 'VỰC SÂU tích rất lâu theo từng ụ, ghép là về 0', ly: 'chuẩn; 3 Leviathan già giữ điểm', gd: 'VỰC SÂU: 3 ụ 8 / 80 / 250 điểm, còn lại ¼ (kỳ vọng trận bot, DO-VANG-DO.md)', pa: [boTC('leviathan', (i, k) => ({ vuc: i < 3 ? [8, 80, 250][k] : [2, 20, 60][k] }))] },
  // ===== ĐỎ — Hỗ trợ / Đặc biệt (đặt vào bàn R Vàng) =====
  lophanung: { kho: 2, lk: 'chỉ +ST lên quái đang CHẬM trong vùng khí lạnh; đóng băng tự kích', ly: 'bàn R + Cryo Reactor', pa: [boR('lophanung', [6, 8])], hc: 'làm chậm/đóng băng không vào DPS' },
  ngaithoigian: { kho: 2, lk: 'chậm dần toàn đường + TUA NGƯỢC tự kích', ly: 'bàn R + 2 Ngai', pa: [boR('ngaithoigian', [6, 8])], hc: 'KHÔNG ĐO HẾT: chậm toàn đường + tua ngược (khống chế)' },
  khoisinh: { kho: 2, lk: 'phải xếp ụ chủ lực KỀ 4 phía; hết lượt tự vỡ', ly: 'bàn R: sau khi Lõi dùng hết lượt, 4 ụ kề +1★ (w60: bàn 6★ → 7★), ô của Lõi trả lại cho R', gd: 'số ★ tặng = sao của Lõi: 3 / 5 / 7 → chia cho 4 ụ kề (kẹp 7★)', pa: [(k, S) => { const S0 = k === 2 ? 6 : S, c = tat(15).map(p => ({ o: p, id: REF, s: S0 })); const ke = [2, 6, 8, 12]; let n = [3, 5, 7][k], i = 0; while (n > 0 && i < 40) { const x = c[ke[i % 4]]; if (x.s < 7) { x.s++; n--; } i++; } return { cells: c, goc: gocR(S0), ao: 1 }; }], hc: 'quy đổi: 1 Lõi = 1 ô; so với bàn R cùng sao gốc' },
  haoquang: { kho: 2, lk: 'bấm đúng lúc để bất tử', ly: '—', pa: [], hc: 'KHÔNG ĐO: không bắn; giá trị là bất tử ngắn (phòng thủ)' },
};
const BAC = {}; // id → 'vang' | 'do' (điền khi chạy)

function deckCua(cells, them) { const deck = []; for (const c of cells) if (!deck.includes(c.id)) deck.push(c.id); for (const d of (them || [])) if (!deck.includes(d)) deck.push(d); for (const d of ['lien', 'set', 'tia', 'mana', 'sungluc']) if (deck.length < 5 && !deck.includes(d)) deck.push(d); return deck; }
function cauHinh(kit, x, k, cells) {
  const kb = KB[k];
  return { deck: deckCua(cells, x.deck), w: kb.w, lv: kb.lv, mana: kit.mana ? kit.mana[k] : kb.mana, o: cells, B: kit.Bk ? kit.Bk(k) : undefined, hero: cells === x.cells ? x.hero : undefined, hsQuai: +process.env.HS || 4 };
}
function do1(ctx, c, T0) { ctx._c = c; R(ctx, 'CBS.dung(_c)'); return R(ctx, `CBS.chay(${T0}, 6)`); }
const tb = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const gm = (a, b) => Math.sqrt(Math.max(1e-9, a) * Math.max(1e-9, b));
function doTat(opt) {
  const HAT = opt.hat, CTX = HAT.map(h => taoMoiTruong(h)), T0 = opt.T0, ra = { ngay: new Date().toISOString(), REF, T0, hat: HAT, kb: KB, v0: [], u: {} };
  const ro = R(CTX[0], `G.roster.filter(r => ['vang', 'do'].includes(r.bac)).map(r => ({ id: r.id, bac: r.bac, ten: TEXT.turret[r.id] ? TEXT.turret[r.id].name : r.id, vai: SKILLS[r.id].vai }))`);
  const V = (c, n) => { const rs = CTX.slice(0, n || CTX.length).map((x, i) => do1(x, Object.assign({}, c, { hat: HAT[i] }), T0)); return { V: tb(rs.map(r => r.V)), theo: rs[0].theo, giet: tb(rs.map(r => r.giet)), loi: rs.find(r => r.loi) ? rs.find(r => r.loi).loi : null }; };
  const nho = {}, VR = (k, cells) => { const key = k + ':' + cells.map(c => c.o + '.' + c.s).join(','); if (nho[key] == null) nho[key] = V(cauHinh({}, {}, k, cells)).V; return nho[key]; }; // bàn gốc R (nhớ lại theo bố cục sao)
  for (let k = 0; k < 3; k++) ra.v0.push(VR(k, gocR(KB[k].S)) / 15);
  for (const r of ro) {
    if (opt.chi && !opt.chi.includes(r.id)) continue;
    const kit = KIT[r.id]; if (!kit) { process.stderr.write('!thiếu bộ ' + r.id + '\n'); continue; }
    const u = ra.u[r.id] = { id: r.id, bac: r.bac, ten: r.ten, vai: r.vai, kho: kit.kho, lk: kit.lk, ly: kit.ly, gd: kit.gd || '', hc: kit.hc || '', kb: [] };
    for (let k = 0; k < 3 && kit.pa.length; k++) {
      const ds = [];
      for (let p = 0; p < kit.pa.length; p++) {
        try {
          const x = kit.pa[p](k, KB[k].S), c = cauHinh(kit, x, k, x.cells), m = V(c, x.goc ? undefined : Math.min(3, CTX.length));
          let E, vg = null;
          if (x.goc) { // bàn R: giá trị CẬN BIÊN của ô X so với giá trị cận biên của ụ R ở đúng các ô đó (bàn gốc − bàn bỏ trống các ô đó)
            const bo = x.oX || [6, 8], vt = VR(k, x.goc.filter(q => !bo.includes(q.o))); vg = VR(k, x.goc);
            E = x.ao ? (m.V - vg) / (x.ao * (vg - vt) / bo.length) : (m.V - vt) / (vg - vt); }
          else E = m.V / (15 * ra.v0[k]);
          const o = { pa: p, V: Math.round(m.V), Vg: vg && Math.round(vg), E, chinh: Math.round(m.theo[r.id] || 0), giet: +m.giet.toFixed(2), loi: m.loi, deck: c.deck };
          if (kit.sua2) { R(CTX[0], kit.sua2[0]); for (const cx of CTX) R(cx, kit.sua2[0]); const m2 = V(c, Math.min(3, CTX.length)); for (const cx of CTX) R(cx, kit.sua2[1]); o.E1 = E; o.E2 = m2.V / (15 * ra.v0[k]); o.E = gm(o.E1, o.E2); }
          ds.push(o);
        } catch (e) { process.stderr.write(r.id + ' k' + k + ' pa' + p + ' LỖI ' + String(e && e.stack || e).slice(0, 300) + '\n'); }
      }
      if (!ds.length) continue;
      let tot;
      if (kit.tb) tot = Object.assign({}, ds[0], { E: tb(ds.map(x => x.E)) }); // trung bình bật/tắt
      else if (kit.lay != null) tot = ds[kit.lay]; else tot = ds.slice().sort((a, b) => b.E - a.E)[0];
      tot = Object.assign({}, tot);
      if (kit.nhan) { tot.E0 = tot.E; tot.E = tot.E * kit.nhan[k]; }
      tot.cac = ds.map(x => +x.E.toFixed(3));
      u.kb.push(tot);
    }
    process.stderr.write(r.id + ' ' + u.kb.map(x => x.E.toFixed(2)).join('/') + '  ');
  }
  process.stderr.write('\n');
  return ra;
}
// ---------- tự kiểm chéo: ụ đơn giản, 1 ụ ở ô 2, không hỗ trợ — số đo so với dmgU × tocU × (1 + crit × (1 + cdmg)) ----------
function kiemCheo() {
  const ctx = taoMoiTruong(4242), L = [];
  for (const id of ['luutru', 'hopca', 'mauhut', 'lualien', 'cobac']) for (const k of [0, 1, 2]) {
    const kb = KB[k], c = { deck: deckCua([{ id }]), w: kb.w, lv: kb.lv, mana: kb.mana, o: [{ o: 2, id, s: kb.S, st: id === 'cobac' ? { cbS: kb.S, cbQuay: 0 } : undefined }], hat: 1, chiTrum: true };
    const m = do1(ctx, c, 90);
    const lt = R(ctx, `(() => { const T = G.ban[0].t[2]; return { d: dmgU(T), t: tocU(T), c: critU(T), cd: (T.buf.cdmg || 0), dt: loaiMoc(T.id) === 'ban' && mocChung(T, 5) }; })()`);
    const tay = lt.d * lt.t * (1 + lt.c * (1 + lt.cd)) * (lt.dt ? 4 / 3.12 : 1); // DOUBLE TAP 5★: sau phát thứ 4, 8… nạp lại còn 0.12 nhịp
    L.push({ id, kb: kb.ten, do: Math.round(m.V), tay: Math.round(tay), lech: +((m.V / tay - 1) * 100).toFixed(1), dmgU: +lt.d.toFixed(1), tocU: +lt.t.toFixed(3), crit: +lt.c.toFixed(3), cdmg: lt.cd, doubleTap: lt.dt });
  }
  return L;
}
if (require.main === module) {
  const a = process.argv.slice(2), lay = (k, d) => { const x = a.find(s => s.startsWith(k + '=')); return x ? x.slice(k.length + 1) : d; };
  if (a.includes('kt')) { const L = kiemCheo(); console.log(JSON.stringify(L, null, 1)); const dir = lay('ra', null); if (dir) fs.writeFileSync(path.join(dir, 'kiem-cheo.json'), JSON.stringify(L, null, 1)); }
  else {
    const dir = lay('ra', '/tmp'), chi = lay('chi', null);
    const d = doTat({ T0: +lay('T0', 60), hat: lay('hat', '4242,777,31337,99,2024,5150,8086,1311').split(',').map(Number), chi: chi && chi.split(',') });
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, lay('ten', 'can-bang') + '.json'), JSON.stringify(d));
    for (const u of Object.values(d.u)) console.log(u.bac, u.id.padEnd(13), u.vai, 'kho' + u.kho, u.kb.map(x => 'E=' + x.E.toFixed(2) + ' [' + x.cac.join(',') + '] V=' + x.V + ' chinh=' + x.chinh + ' giet=' + x.giet + (x.loi ? ' LOI ' + x.loi : '')).join(' | '));
    console.log('v0', d.v0.map(x => Math.round(x)).join(' / '));
  }
}
module.exports = { KIT, KB, doTat, kiemCheo, taoMoiTruong };
