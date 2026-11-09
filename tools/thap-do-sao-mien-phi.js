// TURRET MERGE — ĐO ★ "MIỄN PHÍ" (không qua ghép thường tốn mana) trong trận SOLO — yêu cầu 09/11 "hạn chế cơ chế tăng sao miễn phí"
//   node tools/thap-do-sao-mien-phi.js [số hạt=4] [wave tối đa=30] [ra.json]
// Cách đo (mô phỏng không giao diện như tools/thap-sim-vaitro.js, AI gốc của game tự chơi bàn người chơi, RNG có hạt):
//   · Mỗi bộ bài chơi SOLO tới wave tối đa (hoặc thua). Bọc các hàm luật để đếm ★ được cộng KHÔNG qua ghép thường:
//     nangSao (Star Lift / Merge King phần vàng / Genesis / Pandora / REINFORCE…), chuyenU lên sao (Hộp Bí Ẩn, Trứng Tiến Hoá),
//     sinhDoi (★ của ụ Twin Maker gọi thêm), Wild Link +1★ cấp thẻ.
//   · Ghi tổng ★ trên bàn + số ụ ≥6★ ở wave 10 / 20 / 30, wave đạt, tổng mana đã tiêu (triệu hồi + power-up + chỉ huy).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc } = require('./thap-sim-vaitro.js');
const R = (ctx, s) => vm.runInContext(s, ctx);
function taoMoiTruong(hat) {
  const ctx = taoGoc(hat);
  R(ctx, "if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }");
  for (const f of ['chihuy-moi', 'vangmoi1', 'skills7', 'jackpot', 'trum']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); try { if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); } catch (e) { if (process.env.DEBUG) console.error('bỏ ' + f + ': ' + e.message); } }
  R(ctx, `var DO = null;
  { const g = nangSao; nangSao = function (B, T, n, chu, tran) { const s0 = T ? T.sao : 0; const r = g.apply(this, arguments); if (DO && B === G.ban[0] && T) { const k = String(chu || 'khac').replace(/ \\+\\d★$/, ''); DO.nguon[k] = (DO.nguon[k] || 0) + (T.sao - s0); if (T.sao >= 6 && s0 < 6) DO.len6++; } return r; }; }
  { const g = chuyenU; chuyenU = function (B, T, id, sao, doi) { const s0 = T.sao, k = T.id; const N = g.apply(this, arguments); if (DO && B === G.ban[0] && N && N.sao > s0) { DO.nguon[k] = (DO.nguon[k] || 0) + (N.sao - s0); if (N.sao >= 6) DO.len6++; } return N; }; }
  { const g = sinhDoi; sinhDoi = function (B) { const N = g.apply(this, arguments); if (DO && B === G.ban[0] && N) { DO.nguon.twin = (DO.nguon.twin || 0) + N.sao; if (N.sao >= 6) DO.len6++; } return N; }; }
  { const g = ghep; ghep = function (B, a, b, ep) { const r = g.apply(this, arguments); if (DO && B === G.ban[0] && B._td && B._td !== DO._td) { DO._td = B._td; const d = B._td.ra - B._td.s; if (d > 0) DO.nguon.wildlink = (DO.nguon.wildlink || 0) + d; } return r; }; }
  { const g = trieu; trieu = function (B) { const m = B.mana; const r = g.apply(this, arguments); if (DO && B === G.ban[0]) DO.mana += Math.max(0, m - B.mana); return r; }; }
  { const g = nangCap; nangCap = function (B) { const m = B.mana; const r = g.apply(this, arguments); if (DO && B === G.ban[0]) DO.mana += Math.max(0, m - B.mana); return r; }; }`);
  // ĐO CHI TIẾT (chế độ "chitiet"): bọc mọi phương thức kỹ năng ghep / ghepDB.lam / capNhat / chuDong / ban + chỉ huy + chiêu trùm + quái chết:
  //   ghi theo nhãn (id.phương thức) chênh lệch tổng ★ bàn 0, số ụ, mana (đã trừ mana giết quái phát sinh trong lúc gọi) → "cho không" ra sao
  R(ctx, `var CT = null;
  function _chup() { const B = G.ban[0]; let s = 0, n = 0; for (const T of B.t) if (T) { s += T.sao; n++; } return { s, n, m: B.mana, g: CT ? CT.giet : 0 }; }
  function _ghi(lab, a, sauGhepDB) { const b = _chup(), r = CT.lab[lab] || (CT.lab[lab] = { lan: 0, sao: 0, u: 0, mana: 0, tieu: 0, them: 0 });
    const ds = b.s - a.s, du = b.n - a.n, dm = (b.m - a.m) - (b.g - a.g);
    if (ds || du || dm > 0 || dm < 0) r.lan++;
    r.sao += ds; r.u += du; if (dm > 0) r.mana += dm; else r.tieu -= dm;
    if (sauGhepDB != null) r.them += ds - sauGhepDB; }
  function _boc(o, k, lab, ghepDB) { const g = o[k]; if (typeof g !== 'function') return; o[k] = function () { if (!CT || (arguments[1] && arguments[1] !== G.ban[0])) return g.apply(this, arguments); const a = _chup(), sa = ghepDB ? arguments[2] && arguments[2].sao : 0; const r = g.apply(this, arguments); _ghi(lab, a, ghepDB ? 1 - sa : null); return r; }; }
  for (const id in SKILLS) { const S = SKILLS[id]; for (const k of ['ghep', 'capNhat', 'chuDong', 'ban']) _boc(S, k, id + '.' + k); if (S.ghepDB) _boc(S.ghepDB, 'lam', id + '.keo', true); }
  { const g = dungMV; dungMV = function (B) { if (!CT || B !== G.ban[0]) return g.apply(this, arguments); const a = _chup(); const r = g.apply(this, arguments); _ghi('chihuy.' + B.mv.id, a); return r; }; }
  { const g = thucHienChieu; thucHienChieu = function (E, B) { if (!CT) return g.apply(this, arguments); const a = _chup(); const r = g.apply(this, arguments); _ghi('trum.' + E.trum, a); return r; }; }
  { const g = chet; chet = function (E, B) { if (!CT || E.chet) return g.apply(this, arguments); const m0 = G.ban[0].mana, s0 = _chup(); const r = g.apply(this, arguments); const dm = G.ban[0].mana - m0; if (E.trum) { CT.trum += dm; const b = _chup(); if (b.s !== s0.s) { CT.trumSao += b.s - s0.s; } } else CT.quai += dm; CT.giet += dm; return r; }; }
  { const g = trieu; trieu = function (B, mp) { const r = g.apply(this, arguments); if (CT && B === G.ban[0] && r) { if (mp) CT.trieuFree++; else CT.trieu++; } return r; }; }`);
  return ctx;
}
function chiTiet(ctx, deck, waveMax, mv) {
  ctx._deck = deck; ctx._mv = mv || 'hero';
  R(ctx, `G.debug = { auto: true }; batDau('solo', _deck, _mv); CT = { lab: {}, giet: 0, quai: 0, trum: 0, trumSao: 0, trieu: 0, trieuFree: 0 }; DO = { nguon: {}, len6: 0, mana: 0, w: {} };`);
  const dt = 1 / 30;
  for (let t = 0; t < 3600; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, `!!G.ketThuc || G.wave > ${waveMax}`)) break;
  }
  return JSON.parse(R(ctx, `JSON.stringify(Object.assign({ wave: Math.min(G.wave, ${waveMax}), nguon: DO.nguon }, CT))`));
}
function tran(ctx, deck, waveMax) {
  ctx._deck = deck;
  R(ctx, `G.debug = { auto: true }; batDau('solo', _deck, 'hero'); DO = { nguon: {}, len6: 0, mana: 0, w: {} };`);
  const dt = 1 / 30;
  for (let t = 0; t < 3600; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    R(ctx, `{ const B = G.ban[0]; if (G.wave % 10 === 0 && !DO.w[G.wave]) { const ts = B.t.filter(Boolean); DO.w[G.wave] = { tong: ts.reduce((s, T) => s + T.sao, 0), u6: ts.filter(T => T.sao >= 6).length }; } }`);
    if (R(ctx, `!!G.ketThuc || G.wave > ${waveMax}`)) break;
  }
  return JSON.parse(R(ctx, `JSON.stringify(Object.assign({ wave: Math.min(G.wave, ${waveMax}) }, DO))`));
}
const BO = {
  'nen (khong nguon)': ['lien', 'canon', 'set', 'tia', 'mana'],
  'StarLift+MergeKing': ['lien', 'canon', 'set', 'nangsao', 'vughep'],
  'Genesis+Pandora': ['lien', 'canon', 'set', 'khoisinh', 'pandora'],
  'Box+Evolver': ['lien', 'canon', 'set', 'hopbi', 'tienhoa'],
  'Twin+WildLink': ['lien', 'canon', 'set', 'sinhdoi', 'tudo'],
};
const NEN3 = ['lien', 'canon', 'set'];
const BO_CT = { nen: NEN3.concat(['tia', 'sungluc']) };
for (const c of [['pandora', 'vughep'], ['sinhdoi', 'tudo'], ['nhanban', 'mimic'], ['vughep', 'nangsao'], ['saochep', 'xaotron'], ['pandora', 'hopbi'], ['tienhoa', 'congap'], ['khoisinh', 'anhsang'], ['nhanmana', 'mana'], ['hutmana', 'santhuong'], ['bienmau', 'nguyenrua'], ['cobac', 'thacmana']]) BO_CT[c.join('+')] = NEN3.concat(c);
if (require.main === module && process.argv[2] === 'chitiet') {
  const nHat = +(process.argv[3] || 3), waveMax = +(process.argv[4] || 30), ra = process.argv[5];
  const HAT = [4242, 777, 31337, 9001, 1234].slice(0, nHat), kq = {};
  const MV = (process.env.MV || 'hero').split(',');
  for (const ten in BO_CT) for (const mv of (ten === 'nen' ? ['hero', 'dahlia', 'eve', 'tech', 'tide', 'twin', 'hawk', 'weaver'] : MV)) {
    const ds = HAT.map(h => chiTiet(taoMoiTruong(h), BO_CT[ten], waveMax, mv)), n = ds.length, lab = {}, nguon = {};
    for (const x of ds) for (const k in x.nguon) nguon[k] = (nguon[k] || 0) + x.nguon[k] / n;
    for (const x of ds) for (const k in x.lab) { const L = lab[k] || (lab[k] = { lan: 0, sao: 0, u: 0, mana: 0, tieu: 0, them: 0 }); for (const q in L) L[q] += x.lab[k][q] / n; }
    const tb = (f) => ds.reduce((s, x) => s + f(x), 0) / n;
    const r = kq[ten + '/' + mv] = { deck: BO_CT[ten], wave: tb(x => x.wave), quai: tb(x => x.quai), trum: tb(x => x.trum), trumSao: tb(x => x.trumSao), trieu: tb(x => x.trieu), trieuFree: tb(x => x.trieuFree), lab, nguon };
    console.log('## ' + ten + '/' + mv + ' [' + BO_CT[ten].join(',') + '] wave ' + r.wave.toFixed(1) + ' · mana giết quái ' + Math.round(r.quai) + ' · mana trùm ' + Math.round(r.trum) + ' · ★ trả trùm ' + r.trumSao.toFixed(1) + ' · triệu hồi ' + r.trieu.toFixed(1) + ' (free ' + r.trieuFree.toFixed(1) + ') · ★ miễn phí theo nguồn: ' + (Object.entries(nguon).map(([k, v]) => k + ' ' + v.toFixed(1)).join(', ') || '—'));
    for (const k of Object.keys(lab).sort()) { const L = lab[k]; if (L.lan < 0.01) continue; console.log('   ' + k.padEnd(22) + ' lần ' + L.lan.toFixed(1) + ' · Δ★ ' + L.sao.toFixed(1) + ' · Δụ ' + L.u.toFixed(1) + ' · +mana ' + Math.round(L.mana) + ' · tốn ' + Math.round(L.tieu) + (k.endsWith('.keo') ? ' · ★ hơn ghép thường ' + L.them.toFixed(1) : '')); }
  }
  if (ra) fs.writeFileSync(ra, JSON.stringify(kq, null, 1));
} else if (require.main === module) {
  const nHat = +(process.argv[2] || 4), waveMax = +(process.argv[3] || 30), ra = process.argv[4];
  const HAT = [4242, 777, 31337, 9001, 1234, 5555, 8080, 2468].slice(0, nHat);
  const kq = {};
  for (const ten in BO) {
    const ds = HAT.map(h => tran(taoMoiTruong(h), BO[ten], waveMax));
    const tb = (f) => ds.reduce((s, x) => s + (f(x) || 0), 0) / ds.length;
    const nguon = {}; for (const x of ds) for (const k in x.nguon) nguon[k] = (nguon[k] || 0) + x.nguon[k] / ds.length;
    const mien = Object.values(nguon).reduce((a, b) => a + b, 0);
    kq[ten] = { wave: tb(x => x.wave), mien, nguon, len6: tb(x => x.len6), mana: tb(x => x.mana), w10: tb(x => x.w[10] && x.w[10].tong), w20: tb(x => x.w[20] && x.w[20].tong), w30: tb(x => x.w[30] && x.w[30].tong), u6w30: tb(x => x.w[30] && x.w[30].u6) };
    const r = kq[ten];
    console.log(ten.padEnd(20) + ' wave ' + r.wave.toFixed(1) + ' | ★ miễn phí/trận ' + mien.toFixed(1) + ' (' + Object.entries(nguon).map(([k, v]) => k + ' ' + v.toFixed(1)).join(', ') + ') | lên ≥6★ nhờ miễn phí ' + r.len6.toFixed(1)
      + ' | ★ bàn w10/20/30 ' + r.w10.toFixed(1) + '/' + r.w20.toFixed(1) + '/' + r.w30.toFixed(1) + ' | ụ ≥6★ w30 ' + r.u6w30.toFixed(1) + ' | mana tiêu ' + Math.round(r.mana));
  }
  if (ra) fs.writeFileSync(ra, JSON.stringify(kq, null, 1));
}
module.exports = { taoMoiTruong, tran, chiTiet, BO, BO_CT };
