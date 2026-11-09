// TURRET MERGE — ĐO "SỨC MẠNH THEO CÔNG ĐẦU TƯ" của ụ CỘNG DỒN (yêu cầu 09/11: "ember như này có mạnh quá không, la bàn, prism thief có mạnh được như này không")
//   Tài liệu: docs/demo-hop-tuong/tocban/CONG-DON-EMBER-LABAN-PRISM.md
//
//   node tools/thap-do-cong-don.js song [id,id…] [hat=1-8] [pa=goc|A|B|C] [chien=ky|ai] [ra=x.json]
//       bot SOLO tự chơi (cấp thẻ 0, tim thật), bộ = ụ X + soi, nhatthuc, hasao, cuongno (như DO-VANG-DO).
//       chien=ky (mặc định): bot "người chơi giỏi dồn ụ X": ưu tiên thao tác cộng dồn của X (Ember bơm lửa theo hàng/cột, La Bàn gộp hướng →
//         NSWE+NSWE, Prism hợp thể có sẵn trong AI game), KHÔNG lấy X làm nguyên liệu ghép thường, ghép ụ khác trước (kết quả ngẫu nhiên → dần ra thêm X).
//       EP=0.5 (biến môi trường): mỗi lần triệu hồi 50% chắc chắn ra X — mô phỏng người chơi dồn bàn đầy X (ảnh người dùng: ~11 Ember / 15 ô).
//       chien=ai: AI gốc của game (ghép sao thấp trước, không biết bơm lửa).
//       Ghi theo mốc wave 10/20/…/70: stack lớn nhất / tổng stack / số ụ X trên bàn, ST thô bàn mỗi giây (gồm phần thừa — "sức mạnh", không bị
//       giới hạn bởi máu quái), đòn lớn nhất, wave chết.
//   node tools/thap-do-cong-don.js ban [id] [pa=…]   → DPS 1 ụ (ô 2, 5★, cấp thẻ 0) theo số stack 0…800 ở wave 30 (bài đo như thap-do-vang-do.js)
//   node tools/thap-do-cong-don.js heso [pa=…]        → hệ số nhân sát thương lý thuyết theo số stack (không mô phỏng) — Ember / La Bàn / Prism
//
//   Phương án (pa) — CHỈ VÁ TRONG MÔ PHỎNG, không sửa code game:
//     goc : như bản hiện tại (Ember không trần, +8% ST, +0.4% CM, +4% STCM mỗi lửa, tốc +200%·n/(n+60))
//     A   : TRẦN CỨNG 120 lửa (truyền lửa chạm trần = mất phần thừa) + bù: ST 24 → 30 (+25%), tốc 1.5 → 1.8 (+20%)
//     B   : GIẢM DẦN: lửa hiệu dụng = n nếu n ≤ 60; trên 60: 60 + 30·ln(1 + (n−60)/30) (800 lửa ≈ 146 hiệu dụng)
//           STCM mỗi lửa 4% → 2.5% + bù: ST 24 → 30, tốc 1.5 → 1.8, mỗi lửa 1–20 thêm +4% ST (đầu trận mạnh hơn)
//     C   : giữ Ember, buff La Bàn (stack 50% → 120%, tên lửa ×1.3) + Prism (HOP_DMG 3 → 6, HOP_TOC 0.1 → 0.2)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
const PA = {
  goc: '',
  A: `{ const S = SKILLS.lualien; S.dmg = 30; S.toc = 1.8; S.tran = () => 120; }`,
  B: `{ const S = SKILLS.lualien; S.dmg = 30; S.toc = 1.8; S.CDMG = 0.025;
        S.hd = (n) => (n <= 60 ? n : 60 + 30 * Math.log(1 + (n - 60) / 30));
        S.capNhat = function (G, B, T) { const n0 = T.lc || 0, n = this.hd(n0); if (n) { const dau = Math.min(20, n0) * 0.04; T.buf.dmg += n * this.DMG + dau; T.buf.crit += n * this.CRIT; T.buf.cdmg = (T.buf.cdmg || 0) + n * this.CDMG; T.buf.toc += this.tocLua(n); } return false; }; }`,
  C: `{ SKILLS.canon.moiChong = (T) => ((knThe(T && G.ban[T.ban], 'canon') || 50) / 100) * 2.4; SKILLS.canon.MOI = SKILLS.canon.MOI.map(x => x * 1.3);
        SKILLS.bienmau.HOP_DMG = 6; SKILLS.bienmau.HOP_TOC = 0.2; }`,
};
function taoMoiTruong(hat, pa) {
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7']) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  // ST thô (gồm phần thừa) + đòn lớn nhất
  R(ctx, 'const _tr2 = trung; trung = function (E, d, o) { if (!E.chet && d > 0) { G._tho = (G._tho || 0) + d; if (d > (G._dmax || 0)) G._dmax = d; } return _tr2(E, d, o); };');
  if (pa && PA[pa]) R(ctx, PA[pa]);
  return ctx;
}
// số stack của ụ (đọc trạng thái)
const SO = `({ lualien: T => T.lc || 0, canon: T => T.cmC || 0, bienmau: T => T.pf | 0, luutru: T => T.kho || 0, mauhut: T => T.mh || 0,
  leviathan: T => T.vuc || 0, ronglua: T => Math.round(T.nhiet || 0), lienket: T => T.chuoi || 1, combo: T => (G.ban[T.ban].combo || 0),
  ngoisao: T => G.ban[T.ban].t.reduce((s, X) => s + (X ? X.sao : 0), 0), thacmana: T => Math.round(G.ban[T.ban].mana || 0) })`;
// bot "người chơi giỏi dồn ụ X" — bọc aiBan của game (giữ chỉ huy, kỹ năng Đỏ, Prism hợp thể…)
const BOT = `aiBan = (function (goc) { const SO_ = ${SO}; return function (B, dt) {
  if (!G._ky || B !== G.ban[0]) return goc(B, dt);
  B._kyT = (B._kyT || 0) - dt; if (B._kyT > 0) return; B._kyT = 0.6;
  const X = G._X, ts = B.t.filter(Boolean), xs = ts.filter(T => T.id === X && !biKhoa(T));
  // 1) thao tác cộng dồn riêng
  if (X === 'lualien') {
    let best = null, bs = 0;
    for (const a of xs) for (const b of xs) if (a !== b && a.sao === b.sao && a.sao < 7 && hopLeGhep(a, b)) {
      const nh = SKILLS.lualien.chuThap(b.o).map(i => B.t[i]).filter(Y => Y && Y !== a && Y !== b && Y.id === 'lualien' && !biKhoa(Y)).length;
      const g = ((a.lc || 0) + (b.lc || 0)) * (nh - 1); if (g > bs) { bs = g; best = [a, b]; }
    }
    if (best) { ghep(B, best[0], best[1]); return; }
  } else if (X === 'canon') {
    let best = null, bs = 0;
    for (const a of xs) for (const b of xs) if (a !== b) { const h = SKILLS.canon.hopNhat(a, b); if (!h || h.kieu === 'cung') continue; const g = h.kieu === 'chong' ? 10 + h.chong : SKILLS.canon.dem(h.hb); if (g > bs) { bs = g; best = [a, b]; } }
    if (best) { ghep(B, best[0], best[1]); return; }
  }
  // 2) triệu hồi
  if (B.mana >= B.gia && oTrong(B).length) { if (G._ep && Math.random() < G._ep) trieu(B, false, X); else trieu(B); return; }
  // 3) nâng cấp thẻ X trước
  const thu = B.deck.filter(id => B.lv[id] < 5).sort((p, q) => (p === X ? -1 : q === X ? 1 : B.lv[p] - B.lv[q]));
  if (thu.length && B.mana >= LUAT.giaNangCap[B.lv[thu[0]] - 1] + (oTrong(B).length ? B.gia : 0)) { nangCap(B, thu[0]); return; }
  // 4) bàn gần đầy: ghép ụ KHÁC X (sao thấp trước) — X không làm nguyên liệu ghép thường
  if (oTrong(B).length <= 2) {
    const ys = ts.filter(T => T.id !== X && !biKhoa(T)).sort((p, q) => p.sao - q.sao);
    for (const a of ys) for (const b of ys) if (a !== b && a.sao < 7 && hopLeGhep(a, b) && (a.id === b.id || a.sao === b.sao)) { ghep(B, a, b); return; }
    if (X === 'lualien' || X === 'canon') { // kẹt: cho phép ghép X với X (ra ụ mới) để không chết vì đầy bàn
      for (const a of xs) for (const b of xs) if (a !== b && a.sao < 7 && hopLeGhep(a, b)) { ghep(B, a, b); return; }
    }
  }
  // 5) phần còn lại (chỉ huy, kỹ năng Đỏ, Prism hợp thể…) — AI gốc, nhưng chặn ghép thường có X làm nguyên liệu
  const hl = hopLeGhep; hopLeGhep = function (a, b) { if (G._chan && (a.id === X || b.id === X) && !(X === 'bienmau')) return false; return hl(a, b); };
  G._chan = true; B.aiT = 0; try { goc(B, dt); } finally { G._chan = false; hopLeGhep = hl; }
}; })(aiBan);`;
const BO_PHU = ['soi', 'nhatthuc', 'hasao', 'cuongno', 'lien'];
const MOC = [10, 20, 30, 40, 50, 60, 70];
function song(hat, X, pa, chien, maxT) {
  const ctx = taoMoiTruong(hat, pa);
  R(ctx, BOT);
  ctx._deck = [X].concat(BO_PHU.filter(i => i !== X)).slice(0, 5); ctx._X = X;
  R(ctx, `G.debug = { auto: true }; batDau('solo', _deck, 'hero'); G._X = _X; G._ky = ${chien !== 'ai'}; G._ep = ${+(process.env.EP || 0)}; G._tho = 0; G._dmax = 0;`);
  const dt = 1 / 30, ghi = {}; let w0 = R(ctx, 'G.wave'), t0 = 0, tho0 = 0;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    const w = R(ctx, 'G.wave');
    if (w !== w0) {
      if (MOC.includes(w)) {
        const tho = R(ctx, 'G._tho');
        const s = R(ctx, `(() => { const SO_ = ${SO}; const xs = G.ban[0].t.filter(T => T && T.id === G._X); const v = xs.map(T => SO_[G._X] ? SO_[G._X](T) : 0);
          return { max: v.length ? Math.max(...v) : 0, tong: v.reduce((a, b) => a + b, 0), so: xs.length, saoMax: xs.reduce((m, T) => Math.max(m, T.sao), 0), dmax: Math.round(G._dmax), tim: G.ban[0].tim }; })()`);
        s.tho = Math.round((tho - tho0) / Math.max(1, t - t0)); ghi[w] = s; tho0 = tho; t0 = t; R(ctx, 'G._dmax = 0;');
      }
      w0 = w;
    }
    if (R(ctx, '!!G.ketThuc')) break;
  }
  return { wave: R(ctx, 'G.wave'), ghi };
}
// ---- DPS 1 ụ theo số stack (bài đo như thap-do-vang-do.js: 1 quái trâu + đám đông ≤10, trung bình nhân) ----
function dps1(ctx, id, sao, wave, T0, max, hs, stack) {
  ctx._a = [id, sao, wave, stack];
  R(ctx, `{ const [id, sao, wave, st] = _a; G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'tia', 'mana'], 'hero'); G.cho = 1e9; G.wave = wave;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 600; B.capThe = {}; B.lv = B.lv || {}; B.lv[id] = 4;
    const T = sinhU(taoU(B, id, sao, 2)); B.t[2] = T;
    if (id === 'lualien') T.lc = st; else if (id === 'canon') { T.hb = 15; T.cmC = st; } else if (id === 'bienmau') { T.pf = st; T.pmk = [999, 999, 999, 999]; }
    G._T = T; G._sum = 0; G._q = 0; }`);
  if (!ctx._lotVong) { ctx._lotVong = 1; R(ctx, 'const _lotSim = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotSim(E); };'); }
  R(ctx, 'G._vong = true;');
  const dt = 1 / 30;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; if (G.quai.filter(e => !e.chet).length < ${max}) { const d = taoWave(G.wave).ds; const Q = sinhQuai(pick(d), 0, 0, ${hs}); Q.vao = 1; } }`);
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
  }
  R(ctx, 'G._vong = false;');
  return R(ctx, 'G._tho') / T0; // ST thô (không giới hạn bởi máu quái) — so sức mạnh tuyệt đối
}
function ban(id, pa, ds) {
  const ctx = taoMoiTruong(4242, pa), out = {};
  for (const n of ds) { R(ctx, 'G._tho = 0;'); const a = dps1(ctx, id, 5, 30, 16, 1, 1e6, n); out[n] = Math.round(a); }
  return out;
}
// ---- hệ số lý thuyết (×ST trung bình mỗi giây so với 0 stack), 5★, chí mạng nền 5% / STCM nền 150% ----
function heSo(pa) {
  const ctx = taoMoiTruong(1, pa);
  return R(ctx, `(() => {
    const E = SKILLS.lualien, C = SKILLS.canon, P = SKILLS.bienmau, kq = { lualien: {}, canon: {}, bienmau: {} };
    const cm = (p, d) => 1 + Math.min(1, p) * (d - 1), goc = cm(0.05, 1.5);
    for (const n of [0, 10, 30, 60, 100, 150, 200, 300, 500, 800]) {
      const T = { lc: n, buf: { dmg: 0, crit: 0, toc: 0, cdmg: 0 }, sao: 5 }; E.capNhat(G, G.ban ? G.ban[0] : null, T);
      kq.lualien[n] = +((1 + T.buf.dmg) * cm(0.05 + T.buf.crit, 1.5 + T.buf.cdmg) / goc * (E.toc * (1 + T.buf.toc)) / 1.5 * E.dmg / 24).toFixed(1);
    }
    const mc = (C.moiChong({ ban: 0 }) || 0.5);
    for (const k of [0, 1, 3, 7, 15, 31]) kq.canon[k] = +((1 + mc * k) * 4 * C.MOI[4] / C.MOI[1]).toFixed(1); // NSWE = 4 tên lửa; so với 1 hướng 0 stack
    for (const n of [0, 1, 2, 3, 5, 10]) kq.bienmau[n] = +((1 + P.HOP_DMG * n) * (1 + P.HOP_TOC * n)).toFixed(1);
    return kq; })()`);
}
if (require.main === module) {
  const a = process.argv.slice(2), lay = (k, d) => { const x = a.find(s => s.startsWith(k + '=')); return x ? x.slice(k.length + 1) : d; };
  const che = a[0] || 'song', pa = lay('pa', 'goc');
  if (che === 'song') {
    const ids = (a[1] && !a[1].includes('=') ? a[1] : 'lualien,canon,bienmau').split(','), [h1, h2] = lay('hat', '1-8').split('-').map(Number), chien = lay('chien', 'ky');
    const kq = {};
    for (const id of ids) {
      kq[id] = [];
      for (let h = h1; h <= h2; h++) { const r = song(h, id, pa, chien, +lay('maxT', 3000)); kq[id].push(r); process.stderr.write(id + '#' + h + ':' + r.wave + ' '); }
      process.stderr.write('\n');
    }
    const ra = lay('ra', ''); if (ra) fs.writeFileSync(ra, JSON.stringify({ pa, chien, kq }));
    for (const id of ids) {
      const ws = kq[id].map(r => r.wave), med = (v) => { const b = v.slice().sort((x, y) => x - y); return b.length ? b[(b.length - 1) >> 1] : 0; };
      console.log(`${id} [${pa}/${chien}] wave TB ${(ws.reduce((x, y) => x + y, 0) / ws.length).toFixed(1)} · trung vị ${med(ws)} · chạm 70: ${ws.filter(w => w >= 70).length}/${ws.length} · [${ws.join(' ')}]`);
      for (const w of MOC) { const g = kq[id].map(r => r.ghi[w]).filter(Boolean); if (!g.length) continue;
        console.log(`  w${w} (${g.length} trận): stack max TV ${med(g.map(x => x.max))} (cao nhất ${Math.max(...g.map(x => x.max))}) · số ụ TV ${med(g.map(x => x.so))} · ST thô bàn/s TV ${med(g.map(x => x.tho))} · đòn lớn nhất TV ${med(g.map(x => x.dmax))}`); }
    }
  } else if (che === 'ban') {
    const id = a[1] || 'lualien', ds = id === 'lualien' ? [0, 10, 30, 60, 100, 150, 300, 500, 800] : id === 'canon' ? [0, 1, 3, 7, 15, 31] : [0, 1, 2, 3, 5, 10];
    console.log(id, pa, JSON.stringify(ban(id, pa, ds)));
  } else if (che === 'gop') { // gộp nhiều file ra=… : node tools/thap-do-cong-don.js gop nhan=a.json,b.json …
    const med = (v) => { const b = v.slice().sort((x, y) => x - y); return b.length ? b[(b.length - 1) >> 1] : 0; };
    for (const nhom of a.slice(1)) { const [nhan, ds] = nhom.split('='); const rs = []; for (const f of ds.split(',')) if (fs.existsSync(f)) { const d = JSON.parse(fs.readFileSync(f)); for (const k in d.kq) rs.push(...d.kq[k]); }
      if (!rs.length) continue; const ws = rs.map(r => r.wave);
      const cot = MOC.map(w => { const g = rs.map(r => r.ghi[w]).filter(Boolean); return g.length ? 'w' + w + ' ' + med(g.map(x => x.max)) + '/' + med(g.map(x => x.tho)) + '(' + g.length + ')' : ''; }).filter(Boolean).join(' · ');
      console.log('| ' + nhan + ' | ' + rs.length + ' | ' + (ws.reduce((x, y) => x + y, 0) / ws.length).toFixed(1) + ' | ' + med(ws) + ' | ' + ws.filter(w => w >= 70).length + '/' + ws.length + ' | ' + cot + ' |'); }
  } else if (che === 'heso') console.log(JSON.stringify(heSo(pa), null, 1));
}
module.exports = { song, ban, heSo, PA };
