// TURRET MERGE — BIẾN THỂ CÂN BẰNG WAVE để đo bằng tools/thap-bot-tran.js (--bt <tên>). CHỈ là đoạn JS bơm vào trang lúc đo — KHÔNG sửa thap/.
// Mỗi biến thể = 1 bộ tham số P → vá: số quái/wave + WAVE CÓ CHỦ ĐỀ (taoWave, CD.dsQuai) · số con tách của slime · đường máu (mauWave) · máu trùm ·
//   mana khi giết (manaGiet + hệ số mana từng loại quái) · wave đầu / mana đầu Leo Tháp (CDC.thap.w, CDC.mana) · hệ số sát thương ụ (TIERS.hs, HAU_KY, DO_NEN).
// Chủ đề theo w % 10 (người dùng duyệt 11/11): 1, 6 Hỗn hợp · 2 Bầy đàn · 3 Không kích · 4 Thiết giáp · 5 Tinh anh · 7 Tốc hành · 8 Phân bào · 9 Hỗn loạn · 0 Trùm.
//   4 quái mới (khiên / hồi máu / tự nổ / tàng hình) CHƯA có code → ở đây chủ đề chỉ dùng hành vi quái sẵn có (+ 3 loại "số liệu": bầy đàn, tốc hành, tinh anh).
'use strict';
function vaTrang(P) {
  // ---- quái ----
  QUAI.bay_dan = { ten: 'Swarmling', hp: P.hpBayDan, v: 44, co: 28, tim: 1, anh: 'tach', mana: P.hpBayDan };
  QUAI.toc_hanh = { ten: 'Runner', hp: P.hpTocHanh, v: 60, co: 38, tim: 1, khangCham: true, anh: 'bo', mana: 1 };
  QUAI.tinh_anh = { ten: 'Elite', hp: P.hpTinhAnh, v: 20, co: 66, tim: 2, to: true, anh: 'khong_lo', mana: Math.round(P.hpTinhAnh * 0.8) };
  QUAI.tach.tach.n = P.tach; QUAI.que_tach.tach.n = P.que;
  QUAI.khong_lo.mana = 4; QUAI.que_tach.mana = 3;
  // ---- số quái + chủ đề ----
  const soQuai = (w) => Math.min(P.nMax, P.n0 + Math.floor(w / P.nChia));
  const CD_TEN = ['trum', 'hon', 'baydan', 'khongkich', 'thietgiap', 'tinhanh', 'hon', 'tochanh', 'phanbao', 'honloan'];
  const lam = {
    hon(w, n, r) { const ds = []; for (let i = 0; i < n; i++) { const x = r(); let id = 'bo'; if (w >= 2 && x < 0.2) id = 'bay'; else if (w >= 8 && x < 0.3) id = 'bay_bang'; if (w >= 4 && i % 6 === 5) id = 'khong_lo'; ds.push(id); } return ds; },
    baydan(w, n) { return Array(Math.round(n * P.kBayDan)).fill('bay_dan'); },
    khongkich(w, n, r) { const ds = []; for (let i = 0; i < n; i++) ds.push(w >= 8 && r() < 0.4 ? 'bay_bang' : 'bay'); return ds; },
    thietgiap(w, n) { return Array(Math.max(2, Math.round(n / 3.2))).fill('khong_lo'); },
    tinhanh(w, n) { return ['tinh_anh'].concat(Array(Math.round(n * 0.5)).fill('bo')); },
    tochanh(w, n) { return Array(Math.round(n * 0.9)).fill('toc_hanh'); },
    phanbao(w, n) { const m = Math.max(3, Math.round(n * 0.45)), ds = []; for (let i = 0; i < m; i++) ds.push(w >= 30 && i % 4 === 3 ? 'que_tach' : 'tach'); return ds; },
  };
  const dsChuDe = (w, r, c) => {
    const n = Math.round(soQuai(w) * ((c && c.n) || 1)), k = CD_TEN[w % 10] === 'trum' ? 'hon' : CD_TEN[w % 10];
    let ds;
    if (k === 'honloan') { const bo = ['baydan', 'khongkich', 'thietgiap', 'tochanh'], a = bo.splice(Math.floor(r() * bo.length), 1)[0], b = bo[Math.floor(r() * bo.length)];
      const A = lam[a](w, Math.ceil(n / 2), r), B = lam[b](w, Math.floor(n / 2), r); ds = []; for (let i = 0; i < Math.max(A.length, B.length); i++) { if (A[i]) ds.push(A[i]); if (B[i]) ds.push(B[i]); } }
    else ds = lam[k](w, n, r);
    if (c && c.kl) ds = ds.map((id, i) => (i % c.kl === c.kl - 1 && id !== 'tinh_anh' ? 'khong_lo' : id));          // Leo Tháp: Giants
    if (c && c.bay) ds = ds.map((id) => (id === 'bo' && r() < c.bay ? (w >= 8 && r() < 0.4 ? 'bay_bang' : 'bay') : id)); // Leo Tháp: Sky Raid
    return ds;
  };
  window.__chuDe = (w) => CD_TEN[w % 10];
  taoWave = function (w, rng) {
    rng = rng || Math.random;
    if (w % LUAT.songTrum === 0) return { trum: typeof trumCuaWave === 'function' ? trumCuaWave(w, 0) : TRUM_THU_TU[(w / LUAT.songTrum - 1) % TRUM_THU_TU.length], ds: Array(4).fill('bo') };
    return { ds: dsChuDe(w, rng, null) };
  };
  CD.dsQuai = function (w, r, c) { return dsChuDe(w, r, c); };
  // ---- máu quái: mauWave cũ × hệ số (kE ở wave 1 → k0 ở wave 30, rồi nhân thêm g1 mỗi wave sau w1, g2 mỗi wave sau w2) ----
  const hsMau = (w) => (P.kE + (P.k0 - P.kE) * Math.min(1, (w - 1) / 29)) * Math.pow(P.g1, Math.max(0, Math.min(w, P.w2) - P.w1)) * Math.pow(P.g2, Math.max(0, w - P.w2));
  const mw0 = mauWave; mauWave = function (w) { return Math.round(mw0(w) * hsMau(w)); };
  const st0 = sinhTrum; sinhTrum = function (id, pi, hs) { return st0.call(this, id, pi, (hs || 1) * P.trumK); };
  // ---- mana khi giết: ít quái hơn → mỗi con cho nhiều hơn (giữ tổng mana/wave gần như cũ) ----
  //   trùm KHÔNG nhân (số trùm không đổi): lúc trùm chết manaGiet trả giá trị cũ
  let trumChet = 0; const ch0 = chet; chet = function (E, B) { const t0 = trumChet; trumChet = E && E.trum ? 1 : 0; try { return ch0.apply(this, arguments); } finally { trumChet = t0; } };
  const mg0 = manaGiet; manaGiet = function (w) { return trumChet ? mg0(w) : Math.round(mg0(w) * (1 + P.mK * Math.min(w, 30) / 30)); };
  // ---- Leo Tháp ----
  if (P.thapW) CDC.thap.w = (t) => Math.min(t, 5 + Math.floor(0.62 * (t - 1)));
  if (P.thapM != null) { const m0 = CDC.mana; CDC.mana = (W) => (W <= 5 && P.thapM ? P.thapM : m0(W)); }
  // ---- sát thương ụ ----
  if (P.st) for (const b in P.st) TIERS[b].hs *= P.st[b];
  if (P.hauKy) Object.assign(HAU_KY, P.hauKy);
  if (P.doNen) Object.assign(DO_NEN, P.doNen);
}
const GOC = { n0: 8, nChia: 4, nMax: 20, kBayDan: 1.8, hpBayDan: 0.5, hpTocHanh: 0.9, hpTinhAnh: 12, tach: 3, que: 2, kE: 1, k0: 1, w1: 40, g1: 1, w2: 60, g2: 1, trumK: 1, mK: 1.7, thapW: 1, thapM: null };
const bt = (P) => '(' + vaTrang.toString() + ')(' + JSON.stringify(Object.assign({}, GOC, P)) + ')';
module.exports = {
  // chỉ đổi wave đầu Leo Tháp (tầng t ≤ 11 bắt đầu ở wave t), giữ mọi thứ khác
  T: '(() => { CDC.thap.w = (t) => Math.min(t, 5 + Math.floor(0.62 * (t - 1))); })()',
  T100: '(() => { CDC.thap.w = (t) => Math.min(t, 5 + Math.floor(0.62 * (t - 1))); const m0 = CDC.mana; CDC.mana = (W) => (W <= 5 ? 100 : m0(W)); })()',
  A1: bt({}),                                                   // chỉ bớt quái + chủ đề + tách ít hơn, đường máu giữ nguyên
  // A — KHÔNG đổi ụ: bớt quái + chủ đề; máu wave 41–60 ×1,096/wave (cũ ×1,08), từ 61 ×1,112/wave
  A: bt({ g1: 1.015, g2: 1.03 }),
  // B — GIẢM ST ụ: gánh hậu kỳ Vàng/Đỏ còn +2%/wave (wave 20–40), sau 40 không tăng nữa; bù lại máu quái thấp hơn:
  //     ×0,95 từ wave 30 (giảm dần đều từ wave 1), wave 41–60 ×1,069/wave (cũ ×1,08), từ 61 ×1,091/wave
  B: bt({ k0: 0.95, g1: 0.99, g2: 1.01, hauKy: { vang: 0.02, do: 0.02, mu: { vang: 1, do: 1 } } }),
  _bt: bt, _GOC: GOC,
};
