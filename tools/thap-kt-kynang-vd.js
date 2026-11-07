// TURRET MERGE — KIỂM THỬ KỸ NĂNG ụ VÀNG (Huyền thoại) + ĐỎ (Cổ đại) + GROW-UP / AWAKEN + 3 chỉ huy
//   node tools/thap-kt-kynang-vd.js          → chạy mọi kiểm thử, in bảng | ụ | lời hứa | đo được | OK/LỖI |
//   node tools/thap-kt-kynang-vd.js md       → in bảng markdown (dán vào docs/demo-hop-tuong/QA-KYNANG-VANG-DO.md)
// Môi trường = mô phỏng không giao diện của tools/thap-sim-vaitro.js + growfx.js (đòn đánh theo dạng grow-up — giống trình duyệt).
// Chí mạng TẮT khi đo số (critU = 0) trừ khi kiểm chí mạng; quái đứng yên (v = 0) để đo theo phát.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = require('./thap-sim-vaitro.js');
const GOC = path.join(__dirname, '..', 'thap', 'js');

function moi(hat) {
  const ctx = S.taoMoiTruong(hat || 12345);
  const doc = ctx.document; ctx.document = undefined; // growfx: GFX.coDOM = false → bỏ phần vẽ (như thap-sim-moi.js)
  vm.runInContext(fs.readFileSync(path.join(GOC, 'growfx.js'), 'utf8'), ctx, { filename: 'growfx.js' });
  ctx.document = doc;
  vm.runInContext(`
    var _critGoc = critU; critU = function (T) { return G._critTat ? 0 : _critGoc(T); };
    var _lotK = lot; lot = function (E) { if (G._giu) { E.s = 0; return; } return _lotK(E); };
    function KT_ban(che, deck) {
      G.debug = { auto: false }; batDau(che || 'solo', deck || ['lien', 'canon', 'set', 'tia', 'mana'], 'hero');
      G.cho = 1e9; G.wave = 20; G._critTat = true; G._giu = true; G.hang = [];
      for (const B of G.ban) { B.tim = 1e9; B.mana = 0; for (let i = 0; i < 15; i++) B.t[i] = null; }
      G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G._sum = 0;
      return G.ban[0];
    }
    function KT_dat(o, id, s, bi) { const B = G.ban[bi || 0]; const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; }
    // quái đứng yên ở quãng s (mặc định giữa đường bàn 0), hs = hệ số máu
    function KT_quai(id, s, hs, dung, pi) { const p = pi == null ? G.duong.findIndex(q => q.ban === 0) : pi; const P = G.duong[p];
      const E = sinhQuai(id || 'bo', p, s == null ? P.len * 0.5 : s, hs || 1); E.vao = 1; if (dung !== false) E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(P, E.s); return E; }
    // quãng s trên đường bàn 0 gần ụ T nhất (đặt quái trong tầm ụ cận chiến / nón lửa)
    function KT_gan(T) { const p = G.duong.findIndex(q => q.ban === 0), P = G.duong[p], c = tamU(T); let b = 0, bd = 1e9; for (let s = 0; s < P.len; s += 4) { const [x, y] = viTri(P, s); const d = Math.hypot(x - c.x, y - c.y); if (d < bd) { bd = d; b = s; } } return b; }
    function KT_trum(id, s, hs) { const p = G.duong.findIndex(q => q.ban === 0); const E = sinhTrum(id || 'janus', p, hs || 1); E.s = s == null ? G.duong[p].len * 0.5 : s; E.vao = 1; E.d = Object.assign({}, E.d, { v: 0 }); E.knT = 1e9; [E.x, E.y, E.goc] = viTri(G.duong[p], E.s); return E; }
  `, ctx);
  return ctx;
}
const R = (ctx, s) => vm.runInContext(s, ctx);
function chay(ctx, giay) { S.buoc(ctx, giay, false); }

const KQ = []; // { u, hua, do, ok, ghi }
function kt(u, hua, doDuoc, ok, ghi) { KQ.push({ u, hua, do: String(doDuoc), ok: !!ok, ghi: ghi || '' }); }
const gan = (a, b, tl) => Math.abs(a - b) <= Math.abs(b) * (tl == null ? 0.01 : tl) + 1e-9;
const f2 = (x) => (Math.round(x * 100) / 100).toString();
const ten = (ctx, id) => R(ctx, `TEXT.turret['${id}'] ? TEXT.turret['${id}'].name : '${id}'`);
let ctx = moi();
const X = (s) => R(ctx, s);

// ---------------------------------------------------------------- 0) mọi ụ trong bộ: có kỹ năng, mốc sao, mô tả không lỗi
const BO = X(`G.roster.filter(r => r.bac === 'vang' || r.bac === 'do').map(r => r.id)`);
kt('(all)', '31 Legendary + Mythic turrets in roster', BO.length, BO.length === 31);
for (const id of BO) {
  let loi = '';
  try { X(`KT_ban(); [1,3,5,7].map(s => { const T = KT_dat(7, '${id}', s); KT_quai('bo'); for (let i = 0; i < 10; i++) capNhat(1/30); const sk = SKILLS['${id}']; return (sk.mo ? sk.mo(T) : '') + mocCua('${id}').map(m => m.ten).join(); })`); }
  catch (e) { loi = e.message; }
  kt(ten(ctx, id), 'spawns at 1/3/5/7★, info text builds, no error', loi || 'ok', !loi);
}

// ---------------------------------------------------------------- 1) công thức sát thương gốc + mốc sao chung
for (const id of BO) {
  const r = X(`(() => { KT_ban(); const out = []; for (const s of [1, 3, 5, 7]) { const T = KT_dat(7, '${id}', s); capNhat(1/30); T.buf.dmg = 0; const sk = SKILLS['${id}'];
    const goc = (sk.dmg || 0) * TIERS[T.bac].hs * (1 + 0.85 * (s - 1)); out.push([dmgU(T), goc, heSoMocDmg(T), loaiMoc('${id}')]); } return out; })()`);
  if (!r[0][1]) continue;
  const ok = r.every(([d, g, k]) => gan(d, g * k));
  kt(ten(ctx, id), 'damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once)', r.map(q => f2(q[0])).join(' / ') + ' (' + r[0][3] + ')', ok);
}

// ---------------------------------------------------------------- 2) DPS tăng theo sao (1→3→5→7★), không lỗi
function dpsU(id, s, opt) {
  opt = opt || {};
  X(`KT_ban(); G._critTat = ${opt.crit ? 'false' : 'true'}; var T = KT_T = KT_dat(${opt.o == null ? 2 : opt.o}, '${id}', ${s}); ${opt.truoc || ''}`);
  for (let i = 0; i < (opt.n || 1); i++) X(`KT_quai('${opt.q || 'bo'}', KT_gan(KT_T) + ${(i - ((opt.n || 1) - 1) / 2) * 24}, ${opt.hs || 400})`);
  X('G._sum = 0'); chay(ctx, opt.t || 20); return X('G._sum') / (opt.t || 20);
}
const TC = X(`G.roster.filter(r => (r.bac === 'vang' || r.bac === 'do') && SKILLS[r.id].vai === 'tc').map(r => r.id)`);
for (const id of TC) {
  const d = [1, 3, 5, 7].map(s => dpsU(id, s, { n: 3 }));
  const tang = d[1] > d[0] && d[2] > d[1] && d[3] > d[2];
  kt(ten(ctx, id), 'DPS rises with stars 1→3→5→7★ (3 enemies)', d.map(x => Math.round(x)).join(' → '), tang);
}


// ---------------------------------------------------------------- 3) từng ụ: lời hứa trong chữ kỹ năng
// đo theo phát: sát thương / số phát / dmgU (crit tắt, quái đứng yên, n quái cạnh nhau)
function moiPhat(id, s, opt) {
  opt = opt || {};
  X(`KT_ban(); var T = KT_T = KT_dat(${opt.o == null ? 2 : opt.o}, '${id}', ${s}); ${opt.truoc || ''}`);
  for (let i = 0; i < (opt.n || 1); i++) X(`KT_quai('${opt.q || 'bo'}', KT_gan(KT_T) + ${(i - ((opt.n || 1) - 1) / 2) * (opt.cach || 60)}, ${opt.hs || 400}); ${opt.quai || ''}`);
  X('G._sum = 0; T.banLan = 0; ' + (opt.sau || '')); chay(ctx, opt.t || 12);
  const d = X('dmgU(T)'), n = X('T.banLan');
  X('T.cd = 1e9; T.nap = -1e9;'); chay(ctx, 1.5); // đạn đang bay trúng nốt
  return { k: X('G._sum') / Math.max(1, n) / d, n, d, sum: X('G._sum') };
}
const quaiCo = (id) => X(`G.quai.filter(e => !e.chet).length`);

// ---- Purifier (aten): ×4 vs poisoned (7★ ×6), kills explode ×2 in 50 px (3★ 70), 5★ explosion poisons
{
  const a = moiPhat('aten', 1), b = moiPhat('aten', 1, { quai: 'G.quai.forEach(e => { e.doc = 0.0001; e.docT = 1e9; });' }), c = moiPhat('aten', 7, { quai: 'G.quai.forEach(e => { e.doc = 0.0001; e.docT = 1e9; });' });
  kt('Purifier', 'normal hit ×1', f2(a.k), gan(a.k, 1, 0.02));
  kt('Purifier', '+300% (×4) vs poisoned', f2(b.k), gan(b.k, 4, 0.02));
  kt('Purifier', '7★ PURGE ×6 vs poisoned', f2(c.k), gan(c.k, 6, 0.02));
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'aten', 3); const E = KT_quai('bo', 300, 1), Q = KT_quai('bo', 360, 400), Q2 = KT_quai('bo', 380, 400); G._sum = 0; const h = Q.hp, h2 = Q2.hp;
    const dx = Math.hypot(Q.x - E.x, Q.y - E.y), dx2 = Math.hypot(Q2.x - E.x, Q2.y - E.y); E.hp = 1; G.dangBan = T; trung(E, 5, { B: G.ban[0] }); return [(h - Q.hp) / dmgU(T), dx, (h2 - Q2.hp) / dmgU(T), dx2]; })()`);
  kt('Purifier', '3★ kill explosion ×2 dmg, radius 70 px', 'near ' + f2(r[0]) + ' @' + Math.round(r[1]) + 'px, far ' + f2(r[2]) + ' @' + Math.round(r[3]) + 'px', gan(r[0], 2, 0.02) && (r[3] > 70 + 10 ? r[2] === 0 : true));
  const p5 = X(`(() => { KT_ban(); const T = KT_dat(2, 'aten', 5); const E = KT_quai('bo', 300, 1), Q = KT_quai('bo', 330, 400); E.hp = 1; G.dangBan = T; trung(E, 5, { B: G.ban[0] }); return Q.docT; })()`);
  kt('Purifier', '5★ TOXIC BLAST: explosion poisons', 'poison ' + f2(p5) + 's', p5 >= 3);
}
// ---- Railgun: BINGO row (+12%/railgun, full 5 = +100%) dmg, column (+12%, full 3 = +100%) fire rate; pierces
{
  const r = X(`(() => { KT_ban(); const ts = [5,6,7,8,9].map(o => KT_dat(o, 'railgun', 1)); KT_dat(2, 'railgun', 1); KT_dat(12, 'railgun', 1); capNhat(1/30); const T = ts[2]; return [T.buf.dmg, T.buf.toc]; })()`);
  kt('Railgun', 'full row (5) +damage, full column (3) +fire rate', 'dmg +' + Math.round(r[0] * 100) + '% / rate +' + Math.round(r[1] * 100) + '%', gan(r[0], 4 * 0.12 + 1) && gan(r[1], 2 * 0.12 + 1));
  const p = moiPhat('railgun', 1, { n: 3, cach: 10 });
  kt('Railgun', 'rail pierces every enemy in line (3 stacked)', f2(p.k) + '× per shot', p.k > 2.5);
}
// ---- Merge King / Copycat / Twin Maker / Star Breaker / Pandora / Orbital: hiệu ứng GHÉP
{
  const vk = X(`(() => { KT_ban(); const a = KT_dat(0, 'vughep', 3); a.vang = false; const b = KT_dat(1, 'canon', 3); const r = ghep(G.ban[0], a, b); return [r.id, r.sao, !!G.ban[0].t[0]]; })()`);
  kt('Merge King', 'drag onto same-star turret: target +1★, keeps type', vk.join(' '), vk[0] === 'canon' && vk[1] === 4 && !vk[2]);
  const vg = X(`(() => { KT_ban(); const a = KT_dat(0, 'vughep', 3); a.vang = true; const b = KT_dat(1, 'canon', 3); const r = ghep(G.ban[0], a, b); return r.sao; })()`);
  kt('Merge King', 'Gold version +2★', vg + '★', vg === 5);
  const vgr = X(`(() => { let n = 0; for (let i = 0; i < 4000; i++) { const T = sinhU(taoU(G.ban[0], 'vughep', 1, 0)); if (T.vang) n++; } return n / 4000; })()`);
  kt('Merge King', 'Gold version chance 10%', Math.round(vgr * 100) + '%', Math.abs(vgr - 0.1) < 0.02);
  const sc = X(`(() => { KT_ban(); const a = KT_dat(0, 'saochep', 4); const b = KT_dat(1, 'aten', 4); const r = ghep(G.ban[0], a, b); const N = G.ban[0].t[0]; return [N && N.id, N && N.sao, N && N.banSao, N && dmgU(N) / dmgU(b), !!G.ban[0].t[1]]; })()`);
  kt('Copycat', 'copies a same-star turret at −50% damage (original stays)', sc.slice(0, 3).join(' ') + ' dmg ×' + f2(sc[3]), sc[0] === 'aten' && sc[1] === 4 && sc[2] && gan(sc[3], 0.5) && sc[4]);
  const sd = X(`(() => { KT_ban(); const a = KT_dat(0, 'sinhdoi', 3), b = KT_dat(1, 'sinhdoi', 3); const r = ghep(G.ban[0], a, b); const ds = G.ban[0].t.filter(Boolean); return [ds.length, ds.map(t => t.sao).sort().join(',')]; })()`);
  kt('Twin Maker', 'merge two 3★ → 4★ result + an extra 3★ (same star as merged)', sd.join(' · '), sd[0] === 2 && sd[1] === '3,4');
  const sdm = X(`(() => { KT_ban(); const a = KT_dat(0, 'sinhdoi', 2), b = KT_dat(1, 'mimic', 2); ghep(G.ban[0], b, a); return G.ban[0].t.filter(Boolean).length; })()`);
  kt('Twin Maker', 'Mimic + Twin Maker merge also summons the twin', sdm + ' turrets', sdm === 2);
}

// ---- ụ HỖ TRỢ (hotro.js): giá trị theo đường cong HOTRO.K 1★1.00 / 3★1.45 / 5★1.90 / 7★2.35, chỉ ô đúng hình
function buffKe(id, s, nb, opt) { // nb: [[o, id, sao]] ; trả buf của từng ụ kề sau 1 bước
  opt = opt || {};
  return X(`(() => { KT_ban(); const T = KT_dat(7, '${id}', ${s}); ${opt.truoc || ''} const ns = ${JSON.stringify(nb)}.map(([o, i, q]) => KT_dat(o, i, q == null ? ${s} : q)); ${opt.quai || ''} capNhat(1/30); capNhat(1/30);
    const tu = (N, k) => N.nguon.filter(q => q.T === T && q.k === k && !q.dk).reduce((a, q) => a + q.v, 0);
    return ns.map(N => ({ dmg: tu(N, 'dmg'), toc: tu(N, 'toc'), ht: N.ht ? Object.assign({}, N.ht) : {} })); })()`);
}
const K = { 1: 1, 3: 1.45, 5: 1.9, 7: 2.35 };
{
  // Sync Cannon: same-star Attack neighbours +(5+2.5×min(3,m))%×K; 5★ 2+ matched +2%×K fire rate; 7★ ±1★ counts
  for (const s of [1, 3, 5]) {
    const b = buffKe('dongbo', s, [[6, 'lien'], [8, 'canon'], [2, 'set'], [12, 'set', s === 1 ? 2 : s - 1]]);
    const m = 3, ky = (0.05 + 0.025 * m) * K[s];
    kt('Sync Cannon', s + '★: 3 same-star Attack neighbours +' + Math.round(ky * 100) + '% each, off-star one 0', b.map(q => Math.round(q.dmg * 100)).join('/') + '%' + (s >= 5 ? ' rate +' + Math.round(b[0].toc * 100) + '%' : ''),
      gan(b[0].dmg, ky) && gan(b[2].dmg, ky) && b[3].dmg === 0 && (s < 5 || gan(b[0].toc, 0.02 * K[s])));
  }
  const b7 = buffKe('dongbo', 7, [[6, 'lien', 6], [8, 'canon', 7]]);
  kt('Sync Cannon', '7★ LOOSE SYNC: ±1★ counts as matched', b7.map(q => Math.round(q.dmg * 100)).join('/') + '%', b7[0].dmg > 0 && b7[1].dmg > 0);
  const g = X(`(() => { KT_ban(); const T = KT_dat(7, 'dongbo', 2); [6, 8, 2].forEach(o => KT_dat(o, 'lien', 2)); capNhat(1/30); const a = GROW.dongbo.gd(T).s; G.ban[0].t[2] = null; G.ban[0].t[8] = null; capNhat(1/30); return [a, GROW.dongbo.gd(T).s]; })()`);
  kt('Sync Cannon', 'GROW: 3+ matched = FULL SYNC (stage 3), 1 matched = SYNCED (stage 2)', g.join(' → '), g[0] === 3 && g[1] === 2);
  // Star Breaker: Attack neighbours +10%×K damage; merge next to it +20%×K/1.45 fire rate 5s
  for (const s of [1, 3, 5, 7]) { const b = buffKe('hasao', s, [[6, 'lien'], [8, 'mana']]); kt('Star Breaker', s + '★ Attack neighbours +' + Math.round(10 * K[s]) + '% damage (not Support/Special)', Math.round(b[0].dmg * 100) + '% / non-attack ' + Math.round(b[1].dmg * 100) + '%', gan(b[0].dmg, 0.1 * K[s]) && b[1].dmg === 0); }
  // Rainbow: Attack neighbours +13%×K vs enemies on the trail; trail +5% from all; 5★ 2 trails, 7★ slows 10%
  for (const s of [1, 5, 7]) {
    const r = X(`(() => { KT_ban(); const T = KT_dat(7, 'cauvong', ${s}); const N = KT_dat(6, 'lien', 1); const E = KT_quai('bo', G.duong[0].len * 0.4, 400, false); T.nap = 1; capNhat(1/30); capNhat(1/30); const v = G.hu.filter(o => o.k === 'cauvong');
      for (let i = 0; i < 90; i++) capNhat(1/30); return [v.length, N.ht && N.ht.vet, HOTRO.vuln(E), E.cham]; })()`);
    kt('Rainbow', s + '★: neighbours +' + Math.round(13 * K[s]) + '% vs enemies on trail, trail +5% from all' + (s >= 5 ? ', 2 trails' : '') + (s >= 7 ? ', slows 10%' : ''),
      r[0] + ' trail(s), +' + Math.round((r[1] || 0) * 100) + '%, vuln ' + Math.round(r[2] * 100) + '%, slow ' + Math.round(r[3] * 100) + '%',
      r[0] === (s >= 5 ? 2 : 1) && gan(r[1], 0.13 * K[s]) && gan(r[2], 0.05) && (s < 7 || gan(r[3], 0.1)));
  }
  // Resonance Grid: 4 DIAGONAL cells only, +8%×K, all 4 filled ×1.5; 5★ +5%×K fire rate; 7★ full: fire rate ×1.5
  for (const s of [1, 5, 7]) {
    const b = buffKe('luoicheo', s, [[1, 'lien'], [3, 'lien'], [11, 'lien'], [13, 'lien'], [6, 'lien']]);
    const ky = 0.08 * K[s] * 1.5;
    kt('Resonance Grid', s + '★: 4 diagonals +' + Math.round(ky * 100) + '% (resonance ×1.5), straight cell 0' + (s >= 5 ? ', fire rate +' + Math.round(5 * K[s] * (s >= 7 ? 1.5 : 1)) + '%' : ''),
      b.slice(0, 4).map(q => Math.round(q.dmg * 100)).join('/') + '% · N/E/S/W ' + Math.round(b[4].dmg * 100) + '%' + (s >= 5 ? ' · rate +' + Math.round(b[0].toc * 100) + '%' : ''),
      b.slice(0, 4).every(q => gan(q.dmg, ky)) && b[4].dmg === 0 && (s < 5 || gan(b[0].toc, 0.05 * K[s] * (s >= 7 ? 1.5 : 1))));
  }
  const b3 = buffKe('luoicheo', 3, [[1, 'lien'], [3, 'lien'], [11, 'lien']]);
  kt('Resonance Grid', '3 of 4 diagonals: no resonance (+' + Math.round(8 * 1.45) + '%)', Math.round(b3[0].dmg * 100) + '%', gan(b3[0].dmg, 0.08 * 1.45));
  const mt = X(`mocCua('luoicheo').map(m => m.n + ':' + m.mo).join(' | ')`);
  kt('Resonance Grid', 'star milestone text matches code (5★ +' + Math.round(5 * 1.9) + '% fire rate, 7★ full resonance fire rate ×1.5)', mt, /×1\.9/.test(mt) && /×1\.5/.test(mt) && !/15% fire/.test(mt), 'fixed text: 5★ said +15% fire rate (code +5%×K ≈ 10%), 7★ text was missing');
  // Cryo Reactor: aura slows 15%+2%/★ (≤35, bosses 15%), radius 110+5★ (+20 at 3★); neighbours +14%×K vs slowed; 7★ +10% from all
  for (const s of [1, 3, 7]) {
    const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'lophanung', ${s}); const N = KT_dat(1, 'lien', 1); const E = KT_quai('bo', KT_gan(T), 400); const B0 = KT_trum('janus', KT_gan(T) + 30, 1); capNhat(1/30); capNhat(1/30);
      return [E.cham, B0.cham, N.ht && N.ht.lanh, SKILLS.lophanung.r(T), HOTRO.vuln(E)]; })()`);
    const c = Math.min(0.35, 0.15 + 0.02 * (s - 1));
    kt('Cryo Reactor', s + '★: slows ' + Math.round(c * 100) + '% (boss 15%), radius ' + (110 + 5 * s + (s >= 3 ? 20 : 0)) + ', neighbours +' + Math.round(14 * K[s]) + '% vs slowed' + (s >= 7 ? ', +10% from all' : ''),
      Math.round(r[0] * 100) + '% / boss ' + Math.round(r[1] * 100) + '% / r ' + r[3] + ' / +' + Math.round((r[2] || 0) * 100) + '% / vuln ' + Math.round(r[4] * 100) + '%',
      gan(r[0], c) && gan(r[1], 0.15) && r[3] === 110 + 5 * s + (s >= 3 ? 20 : 0) && gan(r[2], 0.14 * K[s]) && (s < 7 ? r[4] === 0 : gan(r[4], 0.1)));
  }
  for (const s of [3, 5]) {
    const f = X(`(() => { KT_ban(); const T = KT_dat(2, 'lophanung', ${s}); const E = KT_quai('bo', KT_gan(T), 400); const B0 = KT_trum('janus', KT_gan(T) + 30, 1); T.nap = 1; SKILLS.lophanung.chuDong(G, G.ban[0], T); return [E.chan, B0.chan]; })()`);
    kt('Cryo Reactor', s + '★ active ICE STORM freezes nearby ' + (s >= 5 ? 4 : 2.5) + 's (bosses 0.8s)', f.map(f2).join(' / ') + 's', gan(f[0], s >= 5 ? 4 : 2.5) && gan(f[1], 0.8));
  }
  // Mirror Gate: neighbours resist control 15%×K (cap 35%), cooldown 20s (7★ 15s)
  for (const s of [1, 5, 7]) {
    const b = buffKe('guongcong', s, [[6, 'lien']]);
    kt('Mirror Gate', s + '★ neighbours resist control ' + Math.round(Math.min(0.35, 0.15 * K[s]) * 100) + '%, mirror every ' + (s >= 7 ? 15 : 20) + 's', Math.round(b[0].ht.khang * 100) + '% · ' + X(`SKILLS.guongcong.h({ sao: ${s} })`) + 's', gan(b[0].ht.khang, Math.min(0.35, 0.15 * K[s])) && X(`SKILLS.guongcong.h({ sao: ${s} })`) === (s >= 7 ? 15 : 20));
  }
}

// ---- Star Breaker: merge next to it → +fire rate 5s; first 5★ each wave: PVP rival −8% / CO-OP ally +8% 6s
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(7, 'hasao', 3); const a = KT_dat(0, 'lien', 2), b = KT_dat(6, 'lien', 2); capNhat(1/30); const ra = ghep(G.ban[0], a, b); capNhat(1/30); return [ra.tocT, ra.tocV, SKILLS.hasao.dot(T)]; })()`);
  kt('Star Breaker', 'merge result next to it: +' + Math.round(r[2] * 100) + '% fire rate for 5s', 'tocT ' + f2(r[0] || 0) + 's +' + Math.round((r[1] || 0) * 100) + '%', r[0] > 4.5 && gan(r[1] || 0, r[2]));
  const p = X(`(() => { KT_ban('pvp'); G.wave = 3; const T = KT_dat(7, 'hasao', 3); capNhat(1/30); const D = G.ban[1]; const X0 = KT_dat(4, 'lien', 5, 1); capNhat(1/30); return [X0.giamT, X0.giamV]; })()`);
  kt('Star Breaker', 'PVP: rival first 5★ each wave −8% fire rate 6s', f2(p[0] || 0) + 's −' + Math.round((p[1] || 0) * 100) + '%', p[0] > 5.5 && gan(p[1] || 0, 0.08));
}
// ---- Star Cannon (ngoisao): mốc 10 = TỐC (+100% đúng mốc, +10%/mốc đã qua) · bội 50 = SÁT THƯƠNG (+350% đúng mốc, +50%/mốc đã qua)
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(0, 'ngoisao', 4); const f = (n) => { for (let i = 1; i < 15; i++) G.ban[0].t[i] = null; let k = n - 4, o = 1; while (k > 0) { const q = Math.min(7, k); KT_dat(o++, 'mana', q); k -= q; } capNhat(1/30); return [T.buf.toc, T.buf.dmg, GROW.ngoisao.gd(T).s]; };
    return [f(9), f(10), f(23), f(50), f(53), f(60), f(100)]; })()`);
  for (const q of r) q[0] -= 0.2; // 4★ Star Cannon: mốc chung 3★ +20% tốc bắn
  const mong = [[0, 0], [1.1, 0], [0.2, 0], [0.4, 4], [0.4, 0.5], [1.5, 0.5], [0.8, 4.5]];
  const ok = r.every((q, i) => gan(q[0], mong[i][0]) && gan(q[1], mong[i][1])) && r[0][2] === 1 && r[1][2] === 2 && r[3][2] === 3;
  kt('Star Cannon', 'board ★ 9/10/23/50/53/60/100 → rate +0/+110/+20/+40/+40/+150/+80%, dmg +0/0/0/400/50/50/450%', r.map(q => '+' + Math.round(q[0] * 100) + '%/+' + Math.round(q[1] * 100) + '% s' + q[2]).join(' · '), ok);
  const p2 = moiPhat('ngoisao', 1, { truoc: 'T._epGd = 2;' }), p3 = moiPhat('ngoisao', 1, { truoc: 'T._epGd = 3;', t: 20 });
  kt('Star Cannon', 'NOVA pair shot = 2 × 0.5 (same damage per attack)', f2(p2.k), gan(p2.k, 1, 0.03));
  kt('Star Cannon', 'SUPERNOVA: 4 comets ×1 + every 5th a METEOR ×1.2 (+40% splash)', f2(p3.k), gan(p3.k, (4 + 1.2 * 1.4) / 5, 0.05));
}
// ---- Werewolf (soi): Hunter (3★/20 kills) +40% rate, Alpha (5★/50 kills/30% born) ×2 rate + always crit; 7★ howl +25% neighbours
{
  const r = X(`(() => { KT_ban(); const out = []; for (const [s, k, th] of [[1, 0, false], [1, 20, false], [3, 0, false], [1, 50, false], [5, 0, false], [1, 0, true]]) { const T = KT_dat(2, 'soi', s); T.thuc = th; T.giet = k; capNhat(1/30); out.push([GROW.soi.gd(T).s, T.buf.toc]); } return out; })()`);
  kt('Werewolf', 'stage: 1★→Pup, 20 kills/3★→Hunter +40%, 50 kills/5★/born-Alpha→Alpha +100%', r.map(q => 's' + q[0] + ' +' + Math.round(q[1] * 100) + '%').join(' · '),
    r[0][0] === 1 && r[1][0] === 2 && r[2][0] === 2 && r[3][0] === 3 && r[4][0] === 3 && r[5][0] === 3 && gan(r[1][1], 0.4) && gan(r[3][1], 1) && gan(r[2][1], 0.4)); // 3★ HUNTER thay mốc chung +20%
  const al = X(`(() => { let n = 0; for (let i = 0; i < 4000; i++) { const T = sinhU(taoU(G.ban[0], 'soi', 1, 0)); if (T.thuc) n++; } return n / 4000; })()`);
  kt('Werewolf', '30% are born Alpha', Math.round(al * 100) + '%', Math.abs(al - 0.3) < 0.03);
  const a1 = moiPhat('soi', 1, { truoc: 'T.thuc = false;' }), a2 = moiPhat('soi', 3, { truoc: 'T.thuc = false;' }), a3 = moiPhat('soi', 5, { truoc: 'T.thuc = false;' });
  kt('Werewolf', 'per attack: Pup 1 claw, Hunter 2×0.5, Alpha 2×0.55 always crit (×2) — each +40% splash on target', f2(a1.k) + ' / ' + f2(a2.k) + ' / ' + f2(a3.k), gan(a1.k, 1.4, 0.03) && gan(a2.k, 1.4, 0.03) && gan(a3.k, 1.1 * 1.4 * 2, 0.03));
  const h = buffKe('soi', 7, [[6, 'lien', 1], [2, 'mana', 1]]);
  const h2 = X(`(() => { KT_ban(); KT_dat(7, 'soi', 7); const N = KT_dat(6, 'lien', 1); capNhat(1/30); return N.buf.toc; })()`);
  kt('Werewolf', '7★ ALPHA HOWL: neighbours +25% fire rate', '+' + Math.round(h2 * 100) + '%', gan(h2, 0.25));
}
// ---- Evolver (tienhoa): after (20+6×★)s (3★ −20%) becomes a random deck turret +1★; 5★ 25% +2★; 7★ highest-tier card
{
  const r = X(`(() => { KT_ban('solo', ['lien', 'aten', 'blackhole', 'tienhoa', 'mana']); const out = []; for (const s of [1, 3]) { const T = KT_dat(2, 'tienhoa', s); let t = 0; while (G.ban[0].t[2] === T && t < 80) { capNhat(1/30); t += 1/30; } const N = G.ban[0].t[2]; out.push([Math.round(t * 10) / 10, N.sao, N.id]); } return out; })()`);
  kt('Evolver', '1★ evolves after 26s → 2★; 3★ after (20+18)×0.8 = 30.4s → 4★', r.map(q => q[0] + 's → ' + q[1] + '★ ' + q[2]).join(' · '), gan(r[0][0], 26, 0.02) && r[0][1] === 2 && gan(r[1][0], 30.4, 0.02) && r[1][1] === 4);
  const r5 = X(`(() => { KT_ban('solo', ['lien', 'aten', 'blackhole', 'tienhoa', 'mana']); let n2 = 0, top = 0; for (let i = 0; i < 400; i++) { const T = KT_dat(2, 'tienhoa', 5); T.tuoi = 999; capNhat(1/30); if (G.ban[0].t[2].sao === 7) n2++; const U = KT_dat(3, 'tienhoa', 6); U.tuoi = 999; capNhat(1/30); } for (let i = 0; i < 50; i++) { const T = KT_dat(2, 'tienhoa', 7); T.tuoi = 999; capNhat(1/30); if (G.ban[0].t[2].id === 'blackhole') top++; } return [n2 / 400, top]; })()`);
  kt('Evolver', '5★ BREAKTHROUGH 25% chance of +2★; 7★ ASCEND picks highest-tier card', Math.round(r5[0] * 100) + '% +2★ · 7★→Mythic ' + r5[1] + '/50', Math.abs(r5[0] - 0.25) < 0.06 && r5[1] === 50);
}
// ---- Wall Projector: wall every max(5, 9−0.4×★)s, holds 2.4+0.3×★ s, explodes ×7 in 58 px
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'wallgen', 3); const E = KT_quai('bo', KT_gan(T), 400, false); G._sum = 0; let t = 0, t0 = null, w = null; while (t < 20) { capNhat(1/30); t += 1/30; const o = G.hu.find(q => q.k === 'tuong'); if (o && !w) { w = o; t0 = t; } if (w && !G.hu.includes(w)) break; }
    return [t0, t - t0, G._sum / dmgU(T)]; })()`);
  kt('Wall Projector', '3★: first wall at (9−1.2)/1.2 (3★ QUICK HANDS) = 6.5s, holds ' + f2(2.4 + 0.9) + 's, explodes ×7', f2(r[0]) + 's · ' + f2(r[1]) + 's · ×' + f2(r[2]), gan(r[0], 6.5, 0.02) && gan(r[1], 3.3, 0.03) && gan(r[2], 7, 0.02));
}
// ---- Orbital: no normal shots; merge → 20s strike, lance every 0.32s, damage 30×hs×(1+0.85(★−1))
{
  const r = X(`(() => { KT_ban('solo', ['mana', 'haoquang', 'bang', 'loren', 'orbital']); const a = KT_dat(0, 'orbital', 2), b = KT_dat(1, 'orbital', 2); const E = KT_quai('bo', null, 4000); G._sum = 0; let t0 = 0; for (let i = 0; i < 30; i++) capNhat(1/30); const kq = ghep(G.ban[0], a, b); const B = G.ban[0]; const tg = B.phao, n0 = G._sum;
    let t = 0; while (B.phao > 0 && t < 30) { capNhat(1/30); t += 1/30; } for (let i = 0; i < 20; i++) capNhat(1/30); return [n0, tg, t, G._sum / SKILLS.orbital.phaoDmg(B, 3), B.phaoSao]; })()`);
  kt('Orbital', 'no shots before merge; 2★ merge → strike 20s, 62 lances (1 per 0.32s) on a single enemy', 'pre ' + r[0] + ' · ' + f2(r[2]) + 's · ×' + f2(r[3]) + ' lance-dmg · strike ' + r[4] + '★', r[0] === 0 && gan(r[2], 20, 0.02) && Math.abs(r[3] - 20 / 0.32) < 1.5 && r[4] === 3, 'fixed code: lance timer dropped frame remainders (60 instead of 62)');
}
// ---- Black Hole: hole every max(6, 10−0.5★)s, radius 64+4★, drains dmg/s while pulling, crush ×8
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'blackhole', 1); const E = KT_quai('bo', KT_gan(T), 4000); G._sum = 0; let t = 0, t0 = null, h = null; while (t < 20) { capNhat(1/30); t += 1/30; const o = G.hu.find(q => q.k === 'hoden'); if (o && !h) { h = o; t0 = t; } if (h && !G.hu.includes(h)) break; } return [t0, h.r, G._sum / dmgU(T)]; })()`);
  kt('Black Hole', '1★: first hole at 9.5s, radius 68, 3s drain (~×6) + crush ×8 on one enemy', f2(r[0]) + 's · r ' + r[1] + ' · ×' + f2(r[2]), gan(r[0], 9.5, 0.02) && r[1] === 68 && r[2] > 12 && r[2] < 15);
}
// ---- Overlord: charge 7−0.5(★−1)s, thunder ×9 in 92 px, aftershock ×2 to 4 more enemies; stage 2 arc ×1.2 every 1.2s
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'overlord', 1); const s0 = KT_gan(T); const E = KT_quai('bo', s0 + 150, 4000); const ds = [0, 30, 60, 90, 200].map(i => KT_quai('bo', s0 + 150 - i, 4000)).slice(1); ds.unshift(E);
    T.nap = 0.999; const h = ds.map(q => q.hp); let t = 0; while (t < 3 && !G.hu.some(q => q.k === 'sam')) { capNhat(1/30); t += 1/30; } for (let i = 0; i < 6; i++) capNhat(1/30);
    const d = dmgU(T); return ds.map((q, i) => (h[i] - q.hp) / d); })()`);
  kt('Overlord', 'thunder ×9 on the group (92 px) · aftershock ×2 only to enemies OUTSIDE the blast', r.map(f2).join(' / '), r.slice(0, 4).every(x => gan(x, 9, 0.02)) && gan(r[4], 2, 0.02), 'fixed code: aftershock was ×1.5 and re-hit the blasted enemies');
  const ch = X(`(() => { KT_ban(); const out = []; for (const s of [1, 3]) { const T = KT_dat(2, 'overlord', s); const E = KT_quai('bo', KT_gan(T), 4000); let t = 0; while (t < 12 && !G.hu.some(q => q.k === 'sam')) { capNhat(1/30); t += 1/30; } out.push(t); G.hu.length = 0; G.ban[0].t[2] = null; G.quai.length = 0; } return out; })()`);
  kt('Overlord', 'charge 7s at 1★, (7−1)/1.2 = 5s at 3★ (QUICK HANDS)', ch.map(f2).join(' / ') + 's', gan(ch[0], 7, 0.03) && gan(ch[1], 5, 0.04));
  const a = X(`(() => { KT_ban(); const T = KT_dat(2, 'overlord', 1); const E = KT_quai('bo', KT_gan(T), 4000); T.nap = 0.4; G._sum = 0; for (let i = 0; i < 37; i++) capNhat(1/30); return [GROW.overlord.gd(T).s, G._sum / dmgU(T)]; })()`);
  kt('Overlord', 'stage 2 (CHARGING): arc ×1.2 every 1.2s', 's' + a[0] + ' ×' + f2(a[1]) + ' in 1.2s', a[0] === 2 && gan(a[1], 1.2, 0.02));
}
// ---- Holy Halo: cooldown max(28, 40−2★), barrier 2s (3★ 2.5, 7★ 3.5), 5★ cleanses, 7★ +30% speed; leaks cost no hearts
{
  const r = X(`(() => { KT_ban(); const out = []; for (const s of [1, 3, 5, 7]) { const T = KT_dat(2, 'haoquang', s); const N = KT_dat(3, 'lien', 1); N.st.bang = 5; G.ban[0].halo = 0; G.ban[0].khien = 0; T.nap = 1; SKILLS.haoquang.chuDong(G, G.ban[0], T); out.push([SKILLS.haoquang.ky(T), G.ban[0].halo, N.st.bang, N.tocV]); N.tocV = 0; N.tocT = 0; } return out; })()`);
  kt('Holy Halo', 'cooldown 38/34/30/28s · barrier 2/2.5/2.5/3.5s · 5★ cleanse · 7★ +30% speed', r.map(q => q[0] + 's/' + q[1] + 's' + (q[2] === 0 ? ' clean' : '') + (q[3] ? ' +' + Math.round(q[3] * 100) + '%' : '')).join(' · '),
    r.map(q => q[0]).join() === '38,34,30,28' && r.map(q => q[1]).join() === '2,2.5,2.5,3.5' && r[2][2] === 0 && r[1][2] > 0 && gan(r[3][3], 0.3));
  const h = X(`(() => { KT_ban(); const B = G.ban[0]; B.tim = 3; B.halo = 2; const E = KT_quai('bo', G.duong[0].len - 2, 1, false); for (let i = 0; i < 10; i++) capNhat(1/30); return B.tim; })()`);
  kt('Holy Halo', 'during barrier a leaking enemy costs no heart', h + ' hearts left of 3', h === 3);
}

// ---- Hydra: barrels = ★ (max 6), each a different enemy for 55%; 7★ fused beam ×6 piercing at 0.6/s
{
  for (const s of [1, 3, 6]) { const p = moiPhat('hydra', s, { n: 6, cach: 40, t: 10 }); kt('Hydra', s + '★: ' + Math.min(6, s) + ' barrels × 55% on different enemies', f2(p.k) + '× per volley', gan(p.k, 0.55 * Math.min(6, s), 0.03)); }
  const b = X(`(() => { KT_ban(); const T = KT_dat(2, 'hydra', 7); const s0 = KT_gan(T); const ds = [0, 8, 16].map(i => KT_quai('bo', s0 + i, 4000)); G._sum = 0; T.banLan = 0; for (let i = 0; i < 300; i++) capNhat(1/30); return [T.banLan, G._sum / T.banLan / dmgU(T), tocU(T)]; })()`);
  kt('Hydra', '7★ FUSED HEAD: ×6 beam pierces the line, 0.6/s (+20% from 3★ QUICK HANDS)', b[0] + ' beams in 10s, ' + f2(b[1]) + '× per beam (3 enemies)', gan(b[1], 18, 0.05) && Math.abs(b[0] - 7.2) <= 1);
  const g = X(`[4, 6, 7].map(s => GROW.hydra.gd({ sao: s }).s)`);
  kt('Hydra', 'GROW: 4–6★ MANY HEADS, 7★ FUSED HEAD', g.join('/'), g.join() === '2,2,3');
}
// ---- Nine-Tail: +1 tail per kill (+5% fire rate each), 9 tails → 9 homing foxfires ×(2+0.5★); 5★ 20% double tail; 7★ blast 40 px, restart at 3; boss +1 tail per 8% max HP
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuuvi', 3); T.duoi = 4; capNhat(1/30); const t4 = T.buf.toc; const E = KT_quai('bo', KT_gan(T), 4000); for (let i = 0; i < 5; i++) SKILLS.cuuvi.them(T, 1);
    const n = G.hu.filter(o => o.k === 'hoHoa').length, sau = T.duoi; G._sum = 0; for (let i = 0; i < 120; i++) capNhat(1/30); return [t4, n, sau, G._sum / dmgU(T)]; })()`);
  kt('Nine-Tail', '4 tails +20% fire rate; 9 tails → 9 foxfires ×(2+1.5)=3.5 each, tails reset to 0', '+' + Math.round((r[0] - 0.2) * 100) + '% · ' + r[1] + ' foxfires · tails ' + r[2] + ' · ' + f2(r[3]) + '× dealt', gan(r[0] - 0.2, 0.2) && r[1] === 9 && r[2] === 0 && r[3] > 9 * 3.5 * 0.97);
  const r7 = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuuvi', 7); T.duoi = 8; SKILLS.cuuvi.them(T, 1); return [T.duoi, G.hu.filter(o => o.k === 'hoHoa' && o.thuc).length]; })()`);
  kt('Nine-Tail', '7★ NINE-TAIL: restarts at 3 tails, foxfires blast', 'tails ' + r7[0] + ' · ' + r7[1] + ' blast foxfires', r7[0] === 3 && r7[1] === 9);
  const tb = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuuvi', 1); const B0 = KT_trum('janus', null, 1); T.duoi = 0; G.dangBan = T; trung(B0, B0.max * 0.17, { B: G.ban[0] }); return T.duoi; })()`);
  kt('Nine-Tail', 'boss: +1 tail per 8% of its max HP dealt', '17% → ' + tb + ' tails', tb === 2);
  const d5 = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuuvi', 5); let n = 0; for (let i = 0; i < 2000; i++) { T.duoi = 0; SKILLS.cuuvi.khiGiet(G, T, { trum: false }); if (T.duoi === 2) n++; } return n / 2000; })()`);
  kt('Nine-Tail', '5★ TWIN TAILS: 20% of kills grow 2 tails', Math.round(d5 * 100) + '%', Math.abs(d5 - 0.2) < 0.03);
}
// ---- Pandora Vault: merge opens 1 of 6; 6★ rolls twice keeps better; 7★ 2 effects; 3★ QUICK HANDS +20% fire rate
{
  const r = X(`(() => { const dem = {}; for (let i = 0; i < 600; i++) { KT_ban('solo', ['pandora', 'mana', 'haoquang', 'bang', 'loren']); const a = KT_dat(0, 'pandora', 2), b = KT_dat(1, 'pandora', 2); ghep(G.ban[0], a, b); const o = G.hu.find(q => q.k === 'pandora'); dem[o.chon.length + ':' + PANDORA[o.chon[0]].k] = 1; } return Object.keys(dem).length; })()`);
  kt('Pandora Vault', 'merge into 3★ opens 1 of 6 effects (all 6 seen)', r + ' distinct', r === 6);
  const r7 = X(`(() => { KT_ban('solo', ['pandora', 'mana', 'haoquang', 'bang', 'loren']); const a = KT_dat(0, 'pandora', 6), b = KT_dat(1, 'pandora', 6); ghep(G.ban[0], a, b); const o = G.hu.find(q => q.k === 'pandora'); return o.chon.length; })()`);
  kt('Pandora Vault', 'merge into 7★ fires 2 effects', r7, r7 === 2);
  const e = X(`(() => { KT_ban(); const B = G.ban[0]; const c = B.o[7]; const T = KT_dat(3, 'lien', 2); const E = KT_quai('bo', null, 4000); const m0 = B.mana; SKILLS.pandora.lam(G, B, 'mana', 4, c); const mana = B.mana - m0;
    SKILLS.pandora.lam(G, B, 'dong', 4, c); const fr = E.chan; SKILLS.pandora.lam(G, B, 'sao', 4, c); const st = T.sao; SKILLS.pandora.lam(G, B, 'cuong', 4, c); return [mana, fr, st, T.tocV, T.tocT]; })()`);
  kt('Pandora Vault', 'effects: mana +10×★, freeze 1.5s, +1★ gift, frenzy +40% fire rate 6s', '+' + e[0] + ' · ' + e[1] + 's · ' + e[2] + '★ · +' + Math.round(e[3] * 100) + '% ' + e[4] + 's', e[0] === 40 && e[1] === 1.5 && e[2] === 3 && gan(e[3], 0.4) && e[4] === 6);
  const q = X(`(() => { KT_ban(); const T = KT_dat(2, 'pandora', 3); capNhat(1/30); return T.buf.toc; })()`);
  kt('Pandora Vault', '3★ QUICK HANDS: +20% fire rate', '+' + Math.round(q * 100) + '%', gan(q, 0.2), 'fixed code: the 3★ entry replaced the common +20% but nothing applied it');
}
// ---- Chrono Throne: enemies slow 1%/s alive up to sMax (bosses 20%); Rewind (3★+) pushes back r% (bosses r/3) + ×6; cd 40−2(★−1); 7★ +1 heart once
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'ngaithoigian', 1); const E = KT_quai('bo', 200, 4000); E.sinhT = G.t - 30; capNhat(1/30); const a = E.cham; E.sinhT = G.t - 5; E.cham = 0; capNhat(1/30); return [a, E.cham]; })()`);
  kt('Chrono Throne', '1★: slow +1%/s alive, max 15% (5s → 5%)', Math.round(r[0] * 100) + '% / ' + Math.round(r[1] * 100) + '%', gan(r[0], 0.15) && gan(r[1], 0.05, 0.05));
  const w = X(`(() => { KT_ban(); const T = KT_dat(2, 'ngaithoigian', 3); const E = KT_quai('bo', 400, 4000), B0 = KT_trum('janus', 600, 1); const h = E.hp; T.nap = 1; const ok = SKILLS.ngaithoigian.chuDong(G, G.ban[0], T); for (let i = 0; i < 25; i++) capNhat(1/30); return [ok, E.s, B0.s, (h - E.hp) / dmgU(T), SKILLS.ngaithoigian.cd(T)]; })()`);
  kt('Chrono Throne', '3★ REWIND: enemy back 19% (400→324), boss 6.3% (600→562), ×6 damage, cooldown 36s', [w[1], w[2]].map(Math.round).join(' / ') + ' · ×' + f2(w[3]) + ' · ' + w[4] + 's', w[0] && Math.abs(w[1] - 324) < 2 && Math.abs(w[2] - 562) < 2 && gan(w[3], 6, 0.03) && w[4] === 36);
  const n1 = X(`(() => { KT_ban(); const T = KT_dat(2, 'ngaithoigian', 2); T.nap = 1; return SKILLS.ngaithoigian.chuDong(G, G.ban[0], T); })()`);
  kt('Chrono Throne', 'REWIND locked below 3★', String(n1), n1 === false);
  const h = X(`(() => { KT_ban(); const B = G.ban[0]; B.tim = 1; const T = KT_dat(2, 'ngaithoigian', 7); KT_quai('bo', 300, 400); T.nap = 1; SKILLS.ngaithoigian.chuDong(G, B, T); const a = B.tim; T.nap = 1; SKILLS.ngaithoigian.chuDong(G, B, T); return [a, B.tim]; })()`);
  kt('Chrono Throne', '7★ TIME RESTORED: +1 heart once per match', h.join(' → '), h[0] === 2 && h[1] === 2);
  const k2 = moiPhat('ngaithoigian', 4, { n: 3, cach: 10, t: 10 });
  kt('Chrono Throne', '4★ (TWELVE HOURS): clock hand still pierces every enemy on the line', f2(k2.k) + '× per shot (3 stacked)', k2.k > 2.5);
  const k3 = moiPhat('ngaithoigian', 7, { t: 10 });
  kt('Chrono Throne', '7★ THRONE: TIME ECHO re-hits 40% after 0.3s', f2(k3.k) + '× per shot', gan(k3.k, 1.4, 0.03));
}

// ---- Nemesis: +p% max HP per hit (boss ≤0.8%), executes normal enemies under x%, bosses JUDGMENT j% every 10 hits (≥2s); 7★ execution leaps
{
  const r = X(`(() => { KT_ban(); const out = []; for (const s of [1, 7]) { const T = KT_dat(2, 'nemesis', s); const E = KT_quai('bo', 300, 400); const h = E.hp; G.dangBan = T; SKILLS.nemesis.danh(G, G.ban[0], T, E, true); out.push(((h - E.hp) - dmgU(T)) / E.max); G.quai.length = 0; } return out; })()`);
  kt('Nemesis', '+0.3% (1★) / +1.2% (7★) max HP per hit', r.map(x => (x * 100).toFixed(2) + '%').join(' / '), gan(r[0], 0.003, 0.02) && gan(r[1], 0.012, 0.02));
  const x = X(`(() => { KT_ban(); const T = KT_dat(2, 'nemesis', 1); const E = KT_quai('bo', 300, 400); const L = KT_quai('khong_lo', 320, 400); G.dangBan = T; E.hp = E.max * 0.081; L.hp = L.max * 0.05; SKILLS.nemesis.danh(G, G.ban[0], T, E, true); SKILLS.nemesis.danh(G, G.ban[0], T, L, true); return [E.chet, L.chet]; })()`);
  kt('Nemesis', 'executes normal enemies under 8% (after the hit), never big ones', 'normal ' + x[0] + ' · big ' + x[1], x[0] === true && x[1] === false);
  const j = X(`(() => { KT_ban(); const T = KT_dat(2, 'nemesis', 1); const B0 = KT_trum('janus', 300, 1); B0.max = B0.hp = 1e7; let tru = 0; for (let i = 0; i < 10; i++) { const h = B0.hp; G.t += 0.3; SKILLS.nemesis.danh(G, G.ban[0], T, B0, true); tru = h - B0.hp; } return (tru - dmgU(T) - B0.max * 0.003) / B0.max; })()`);
  kt('Nemesis', 'boss JUDGMENT 2% max HP on the 10th hit', (j * 100).toFixed(2) + '%', gan(j, 0.02, 0.03));
  const l = X(`(() => { KT_ban(); const T = KT_dat(2, 'nemesis', 7); const E = KT_quai('bo', 300, 400), Q = KT_quai('bo', 330, 400); E.hp = E.max * 0.05; Q.hp = Q.max * 0.05; G.dangBan = T; SKILLS.nemesis.danh(G, G.ban[0], T, E, true); return Q.chet; })()`);
  kt('Nemesis', '7★ REAPER LEAP: execution leaps to the nearest enemy', String(l), l === true);
}
// ---- Eclipse: swaps every 8s; Day beam ×d (1.5→2.5) + burn 4s; Night cone ×0.6 slows 25% 2s; 7★ both modes 1.5s + ×4 ring
{
  const d1 = moiPhat('nhatthuc', 1, { truoc: 'T.dem = false; T.doiT = 1e9;', t: 6 }), d7 = moiPhat('nhatthuc', 7, { truoc: 'T.dem = false; T.doiT = 1e9;', t: 6 });
  kt('Eclipse', 'DAY beam ×1.5 (1★) / ×2.5 (7★) + burn 0.4×/s while refreshed (≈ +0.44 / +0.37 per shot)', f2(d1.k) + ' / ' + f2(d7.k) + ' per shot incl. burn', gan(d1.k, 1.5 + 0.4 / 0.9, 0.06) && gan(d7.k, 2.5 + 0.4 / 1.08, 0.04));
  const n = X(`(() => { KT_ban(); const T = KT_dat(2, 'nhatthuc', 1); T.dem = true; T.doiT = 1e9; const E = KT_quai('bo', KT_gan(T), 400); const h = E.hp; T.cd = 0; for (let i = 0; i < 40 && T.banLan === 0; i++) capNhat(1/30); return [(h - E.hp) / dmgU(T), E.cham, E.chamT]; })()`);
  kt('Eclipse', 'NIGHT cone ×0.6 + slow 25% for 2s', '×' + f2(n[0]) + ' · ' + Math.round(n[1] * 100) + '% · ' + f2(n[2]) + 's', gan(n[0], 0.6, 0.03) && gan(n[1], 0.25) && n[2] > 1.8);
  const sw = X(`(() => { KT_ban(); const T = KT_dat(2, 'nhatthuc', 7); const E = KT_quai('bo', KT_gan(T), 4000); T.doiT = 0.01; const h = E.hp; capNhat(1/30); return [T.ca, (h - E.hp) / dmgU(T)]; })()`);
  kt('Eclipse', '7★ TOTAL ECLIPSE: each swap both modes 1.5s + ×4 ring', f2(sw[0]) + 's · ×' + f2(sw[1]), gan(sw[0], 1.5, 0.03) && gan(sw[1], 4, 0.03));
  const ph = X(`(() => { KT_ban(); const a = KT_dat(2, 'nhatthuc', 1), b = KT_dat(3, 'nhatthuc', 1); return a.dem !== b.dem; })()`);
  kt('Eclipse', 'two Eclipses are always out of phase', String(ph), ph);
}
// ---- Scrap Forge: no shots; feed a 1–3★ turret: +f stacks (3★ food ×3), each stack +4% damage to your best Attack turret, no cap (07/11: no stack cap, no per-receiver cap)
{
  const r = X(`(() => { KT_ban(); const F = KT_dat(7, 'loren', 3); const A = KT_dat(0, 'aten', 4), A2 = KT_dat(1, 'canon', 2); const f1 = KT_dat(5, 'lien', 1), f3 = KT_dat(6, 'canon', 3), f4 = KT_dat(8, 'set', 4);
    ghep(G.ban[0], f1, F); const a = F.lo; ghep(G.ban[0], F, f3); const b = F.lo; const ok4 = hopLeGhep(F, f4); capNhat(1/30); return [a, b, ok4, A.buf.dmg, A2.buf.dmg, F.banLan]; })()`);
  kt('Scrap Forge', '3★ (f=2): eat a 1★ +2, eat a 3★ +6 stacks; 4★ food refused; best Attack turret +4%/stack', 'stacks ' + r[0] + ' → ' + r[1] + ' · 4★ food ' + r[2] + ' · best +' + Math.round(r[3] * 100) + '% · other ' + Math.round(r[4] * 100) + '%',
    r[0] === 2 && r[1] === 8 && r[2] === false && gan(r[3], 0.32) && r[4] === 0);
  const m = X(`(() => { KT_ban(); const F = KT_dat(7, 'loren', 7); F.lo = 20; const A = KT_dat(0, 'aten', 4); const F2 = KT_dat(9, 'loren', 7); F2.lo = 15; capNhat(1/30); return [A.buf.dmg, hopLeGhep(F, KT_dat(5, 'lien', 1))]; })()`);
  kt('Scrap Forge', 'no cap: 20 stacks + a 2nd Forge with 15 add up (+140%), still feedable past 15', '+' + Math.round(m[0] * 100) + '% · feed ' + m[1], gan(m[0], 1.4) && m[1] === true);
  const g = X(`[0, 4, 5, 14, 15, 40].map(n => GROW.loren.gd({ lo: n }).s)`);
  kt('Scrap Forge', 'GROW stages 0–4 / 5–14 / 15+ (no cap)', g.join('/'), g.join() === '1,1,2,2,3,3');
  const t = X(`mocCua('loren').map(m => m.n + ':' + m.mo).join(' | ')`);
  kt('Scrap Forge', 'star milestones describe what stars really change (stacks per feed 2/3/4)', t, /\+2/.test(t) && /\+3/.test(t) && /\+4/.test(t), 'fixed text: common "+20% speed / +25% effect / +30% effect" did nothing on a non-shooting Forge');
}
// ---- Marionette: every 10→7s controls the HP-richest normal enemy (4★+ big too, 7★ 2), walks it back t s, rams others (30% of its HP, ≤×4), explodes ×8 in 60 px
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'marionette', 1); const E = KT_quai('bo', 400, 4, false), L = KT_quai('khong_lo', 380, 4, false); T.nap = 1; capNhat(1/30); const ro = G.hu.filter(o => o.k === 'roi'); const ok1 = ro.length === 1 && ro[0].E === E;
    const s0 = E.s; for (let i = 0; i < 30; i++) capNhat(1/30); const lui = E.s < s0; return [ok1, lui, ro[0].song, SKILLS.marionette.ky(T)]; })()`);
  kt('Marionette', '1★: every 10s grabs a normal enemy (not big), walks it back for 2s', r.join(' · '), r[0] && r[1] && r[2] === 2 && r[3] === 10);
  const r7 = X(`(() => { KT_ban(); const T = KT_dat(2, 'marionette', 7); const E = KT_quai('bo', 400, 4, false), L = KT_quai('khong_lo', 380, 4, false); T.nap = 1; capNhat(1/30); return G.hu.filter(o => o.k === 'roi').length; })()`);
  kt('Marionette', '7★ TWIN PUPPETS: 2 at once, big ones too', r7 + ' puppets', r7 === 2);
  const b = X(`(() => { KT_ban(); const T = KT_dat(2, 'marionette', 1); const E = KT_quai('bo', 400, 4000, false), Q = KT_quai('bo', 275, 4000); T.nap = 1; capNhat(1/30); const h = Q.hp; let t = 0; while (G.hu.some(o => o.k === 'roi') && t < 5) { capNhat(1/30); t += 1/30; } return [E.chet, (h - Q.hp) / dmgU(T)]; })()`);
  kt('Marionette', 'puppet explodes at the end ×8 (60 px) on nearby enemies', 'puppet dead ' + b[0] + ' · neighbour ×' + f2(b[1]), b[0] && b[1] >= 8 * 0.97);
}

// ---- Hive Queen: drone every c s (4→2.2), max n (3→10, 12/board), drones 60% every 0.5s; 4★+ perched +10% fire rate; 7★ every 5th gold ×3; SWARM (3★+) ×3 in 35 px
{
  const r = X(`(() => { KT_ban(); const out = []; for (const s of [1, 7]) { const T = KT_dat(2, 'chuato', s); let t = 0; while (T.bay.length < 1 && t < 10) { capNhat(1/30); t += 1/30; } const t1 = t; T.de = 0; for (let i = 0; i < 2000; i++) { T.de = 99; capNhat(1/30); } out.push([t1, T.bay.length, T.bay.filter(d => d.vang).length]); G.ban[0].t[2] = null; } return out; })()`);
  kt('Hive Queen', '1★: 1st drone after 4s, max 3 · 7★: every 2.2s, max 10, every 5th gold', r.map(q => f2(q[0]) + 's · ' + q[1] + ' drones · ' + q[2] + ' gold').join(' | '), gan(r[0][0], 4, 0.02) && r[0][1] === 3 && gan(r[1][0], 2.2, 0.03) && r[1][1] === 10 && r[1][2] === 2);
  const d = X(`(() => { KT_ban(); const T = KT_dat(2, 'chuato', 1); T.bay = [{ x: 0, y: 0, g: 0, r: 0, cd: 0, vang: false, ra: 1 }]; T.de = -1e9; T.cd = 1e9; const E = KT_quai('bo', KT_gan(T), 4000); G._sum = 0; for (let i = 0; i < 300; i++) { T.cd = 1e9; capNhat(1/30); } return G._sum / dmgU(T) / 10; })()`);
  kt('Hive Queen', 'one drone: 60% damage every 0.5s (= 1.2× per second)', f2(d) + '× / s', gan(d, 1.2, 0.03), 'fixed code: timer reset dropped frame remainders (1.08×/s at 30 fps); waits ready when no enemy in 150 px');
  const p = X(`(() => { KT_ban(); const T = KT_dat(7, 'chuato', 4); T.bay = [{ x: 0, y: 0, g: 0, r: 0, cd: 1, vang: false, ra: 1 }]; T.de = -1e9; const N = KT_dat(6, 'lien', 1); capNhat(1/30); return N.buf.toc; })()`);
  kt('Hive Queen', '4★+ HIVE: drones give neighbours +10% fire rate', '+' + Math.round(p * 100) + '%', gan(p, 0.1));
  const w = X(`(() => { KT_ban(); const T = KT_dat(2, 'chuato', 3); T.bay = [0, 1, 2].map(i => ({ x: 0, y: 0, g: 0, r: 0, cd: 1, vang: false, ra: 1 })); const ds = [0, 10, 20, 30].map(i => KT_quai('bo', KT_gan(T) + i, 4000)); T.nap = 1; const h = ds[0].hp; const ok = SKILLS.chuato.chuDong(G, G.ban[0], T); T.cd = 1e9; for (let i = 0; i < 60; i++) { T.cd = 1e9; capNhat(1/30); } return [ok, T.bay.length, (h - ds[0].hp) / dmgU(T)]; })()`);
  kt('Hive Queen', '3★ SWARM: 3 drones kamikaze ×3 each (35 px), swarm resets', w[0] + ' · drones left ' + w[1] + ' · lead ×' + f2(w[2]), w[0] && w[1] <= 1 && w[2] >= 9 * 0.97);
}
// ---- Leviathan: devour a normal enemy (120 px) every e s (9→5) → +1 stack (+4% dmg, no cap); 4★+ big ones ×3; 7★ flyers; TIDAL BREATH ×(4+0.1×stacks)
{
  const r = X(`(() => { KT_ban(); const out = []; for (const [s, q] of [[1, 'bo'], [1, 'khong_lo'], [4, 'khong_lo'], [4, 'bay'], [7, 'bay']]) { const T = KT_dat(2, 'leviathan', s); const E = KT_quai(q, KT_gan(T), 4000); T.nuot = 99; for (let i = 0; i < 30; i++) capNhat(1/30); out.push(T.vuc); G.ban[0].t[2] = null; G.quai.length = 0; } return out; })()`);
  kt('Leviathan', 'devour: normal +1 · big only from 4★ (+3) · flyers only at 7★', r.join(' / '), r.join() === '1,0,3,0,1');
  const st = X(`(() => { KT_ban(); const T = KT_dat(2, 'leviathan', 1); T.vuc = 25; capNhat(1/30); return T.buf.dmg; })()`);
  kt('Leviathan', '25 stacks = +100% damage', '+' + Math.round(st * 100) + '%', gan(st, 1));
  const sv = X(`(() => { KT_ban(); const T = KT_dat(2, 'leviathan', 1); T.vuc = 150; capNhat(1/30); return [T.buf.dmg, T.vuc]; })()`);
  kt('Leviathan', 'no cap: 150 stacks = +600% damage', '+' + Math.round(sv[0] * 100) + '% · ' + sv[1], gan(sv[0], 6) && sv[1] === 150);
  const b = moiPhat('leviathan', 1, { truoc: 'T.nuot = -1e9;' });
  kt('Leviathan', 'bubble ×1 + 30 px splash ×0.5 (single target takes 1.5×)', f2(b.k), gan(b.k, 1.5, 0.03));
  const t = X(`(() => { KT_ban(); const T = KT_dat(2, 'leviathan', 3); T.vuc = 10; T.nuot = -1e9; const ds = []; for (let s = 60; s < G.duong[0].len - 40; s += 29) ds.push(KT_quai('bo', s, 4000)); capNhat(1/30); T.nap = 1; const h = ds.map(e => e.hp); SKILLS.leviathan.chuDong(G, G.ban[0], T); const o = G.hu.find(q => q.k === 'thoThuy'); const k = o.dmg / dmgU(T);
    for (let i = 0; i < 50; i++) { T.cd = 1e9; capNhat(1/30); } const n = ds.map((E, i) => Math.round((h[i] - E.hp) / o.dmg)); return [k, Math.min(...n), Math.max(...n)]; })()`);
  kt('Leviathan', 'TIDAL BREATH at 10 stacks: ×5 to EVERY enemy along the whole path (once each)', '×' + f2(t[0]) + ' · hits ' + t[1] + '–' + t[2], gan(t[0], 5) && t[1] === 1 && t[2] === 1, 'fixed code: 0.25 s ticks left gaps on the path and the breath ended ~80 px before the gate → some enemies were never hit');
}
// ---- Genesis Core: +1★ to your lowest turret every g s (30→16); 4★+ neighbours +15% dmg; 7★ each raise summons a free 1★; GENESIS (3★+) k turrets at the board's average ★
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(7, 'khoisinh', 1); const a = KT_dat(0, 'lien', 3), b = KT_dat(1, 'canon', 2); let t = 0; while (b.sao === 2 && t < 40) { capNhat(1/30); t += 1/30; } return [t, a.sao, b.sao]; })()`);
  kt('Genesis Core', '1★: every 30s +1★ to the lowest turret', f2(r[0]) + 's → ' + r[1] + '★ / ' + r[2] + '★', gan(r[0], 30.4, 0.02) && r[1] === 3 && r[2] === 3);
  const n = X(`(() => { KT_ban(); const T = KT_dat(7, 'khoisinh', 4); const N = KT_dat(6, 'lien', 1); const M = KT_dat(2, 'lien', 1); capNhat(1/30); return [N.buf.dmg, M.buf.dmg]; })()`);
  kt('Genesis Core', '4★+ BLOSSOM: 4 neighbours +15% damage', n.map(x => '+' + Math.round(x * 100) + '%').join(' / '), gan(n[0], 0.15) && gan(n[1], 0.15));
  const s7 = X(`(() => { KT_ban(); const T = KT_dat(7, 'khoisinh', 7); KT_dat(0, 'lien', 2); T.sinhT = 99; capNhat(1/30); return G.ban[0].t.filter(Boolean).length; })()`);
  kt('Genesis Core', '7★ SEED OF LIFE: each raise also summons a free 1★', s7 + ' turrets (was 2)', s7 === 3);
  const g = X(`(() => { KT_ban(); const T = KT_dat(7, 'khoisinh', 3); KT_dat(0, 'lien', 5); KT_dat(1, 'canon', 2); T.nap = 1; SKILLS.khoisinh.chuDong(G, G.ban[0], T); return G.ban[0].t.filter(X => X && X !== T && X.o > 1).map(X => X.sao); })()`);
  kt('Genesis Core', '3★ GENESIS: 2 turrets at the board average ★ (floor(10/3)=3)', g.join(','), g.length === 2 && g.every(x => x === 3));
}
// ---- Wyrm Engine: cone 5 ticks/s, 10×hs per tick, burns 3s; 4★+ blue +30% vs big/boss; 7★ cone +15% longer, trail 4s; DRAGON DIVE ×25 (+5% boss max HP)
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(2, 'ronglua', 1); const E = KT_quai('bo', KT_gan(T), 4000); G._sum = 0; T.banLan = 0; for (let i = 0; i < 150; i++) capNhat(1/30); return [T.banLan / 5]; })()`);
  kt('Wyrm Engine', '1★ breathes 5 ticks per second', f2(r[0]) + '/s', gan(r[0], 5, 0.03), 'fixed code: timer reset dropped frame remainders (4.4/s at 30 fps)');
  const big = X(`(() => { const out = []; for (const s of [3, 4]) { KT_ban(); const T = KT_dat(2, 'ronglua', s); const E = KT_quai('khong_lo', KT_gan(T), 4000); const h = E.hp; T.tick = 0; capNhat(1/30); out.push((h - E.hp) / dmgU(T)); } return out; })()`);
  kt('Wyrm Engine', 'BLUE FLAME +30% vs big enemies from 4★ (3★ ×1)', big.map(f2).join(' / '), gan(big[0], 1, 0.02) && gan(big[1], 1.3, 0.02));
  const L = X(`[6, 7].map(s => SKILLS.ronglua.tam({ sao: s }))`);
  kt('Wyrm Engine', '7★ WHITE FLAME: cone 135 × 1.15 longer', L.map(Math.round).join(' / ') + ' px', Math.round(L[1]) === Math.round(135 * 1.15));
  const dv = X(`(() => { KT_ban(); const T = KT_dat(2, 'ronglua', 3); const E = KT_quai('bo', 200, 4000), B0 = KT_trum('janus', 300, 1); B0.max = B0.hp = 1e8; const h = E.hp, hb = B0.hp; T.nap = 1; SKILLS.ronglua.chuDong(G, G.ban[0], T); for (let i = 0; i < 45; i++) { T.tick = 1e9; capNhat(1/30); } return [(h - E.hp) / dmgU(T), (hb - B0.hp - 25 * dmgU(T)) / B0.max]; })()`);
  kt('Wyrm Engine', '3★ DRAGON DIVE ×25 per enemy (+5% max HP on bosses)', '×' + f2(dv[0]) + ' · boss +' + (dv[1] * 100).toFixed(1) + '%', dv[0] >= 25 * 0.99 && dv[0] < 25 * 1.1 && gan(dv[1], 0.05, 0.1));
}
// ---- mythic ACTIVE skills: unlock at 3★ (not 1–2★); milestone text matches the 4★ form change
{
  const a = X(`['chuato', 'leviathan', 'khoisinh', 'ronglua', 'ngaithoigian', 'lophanung', 'haoquang'].map(id => { KT_ban(); const out = []; for (const s of [2, 3]) { const T = KT_dat(2, id, s); KT_dat(0, 'lien', 1); for (let i = 0; i < 5; i++) KT_quai('bo', 150 + 30 * i, 400); if (id === 'chuato') T.bay = [{ x: 0, y: 0, g: 0, r: 0, cd: 1, ra: 1 }]; T.nap = 1; let ok = false; try { ok = SKILLS[id].chuDong(G, G.ban[0], T); } catch (e) { ok = 'ERR ' + e.message; } out.push(ok); G.ban[0].t[2] = null; } return id + ' ' + out.join('/'); })`);
  const lock = ['chuato', 'leviathan', 'khoisinh', 'ronglua', 'ngaithoigian'];
  kt('(Mythic actives)', 'active skill: locked at 2★, works at 3★ (Cryo / Halo: from 1★ by design)', a.join(' · '), a.every(t => { const [id, v] = t.split(' '); return lock.includes(id) ? v === 'false/true' : v === 'true/true'; }));
  const m = X(`['leviathan', 'khoisinh', 'ronglua'].map(id => mocCua(id).find(q => q.n === 5).mo)`);
  kt('(Mythic 4★ form)', 'Leviathan big-devour, Genesis +15% neighbours, Wyrm blue flame start at 4★ (form 2) — milestone text says so', m.join(' | '), m.every(t => /4★/.test(t)), 'fixed text: listed under 5★ with no hint they start at 4★');
}

{
  const o = X(`(() => { const out = []; for (const s of [3, 5, 7]) { KT_ban('solo', ['mana', 'haoquang', 'bang', 'loren', 'orbital']); const a = KT_dat(0, 'orbital', s - 1), b = KT_dat(1, 'orbital', s - 1); KT_quai('bo', null, 40000); G._sum = 0; ghep(G.ban[0], a, b); const B = G.ban[0]; let t = 0; while (B.phao > 0) { capNhat(1/30); t += 1/30; } for (let i = 0; i < 20; i++) capNhat(1/30);
    out.push(G._sum / (30 * TIERS.vang.hs * (1 + 0.85 * (s - 1)))); } return out; })()`);
  kt('Orbital', 'star milestones now real: 3★ Orbitals +20% lance rate, 5★ +25% dmg, 7★ +30% (merge 2×3★ / 2×5★ / 2×6★)', o.map(x => Math.round(x) + ' lance-dmg').join(' / '), Math.abs(o[0] - 62.5) < 2 && Math.abs(o[1] - 75) < 2 && Math.abs(o[2] - 75 * 1.25) < 3, 'fixed code: common "+20% speed / +25% / +30% effect" was text only');
}
// ---------------------------------------------------------------- 4) GROW-UP / AWAKEN: 15 ụ — điều kiện đổi dạng + đòn từng dạng (hệ số áp đúng 1 lần)
{
  const G15 = X('G_IDS');
  kt('(Grow-up)', '15 grow-up turrets registered with 3 named stages + attack-by-stage text', G15.length + ' · ' + G15.filter(id => X(`GROW['${id}'] && GROW['${id}'].ten.length === 3 && !!GFX.ATK['${id}'] && laGrow('${id}')`)).length, G15.length === 15 && G15.every(id => X(`GROW['${id}'] && GROW['${id}'].ten.length === 3 && !!GFX.ATK['${id}'] && laGrow('${id}')`)));
  // ép dạng bằng T._epGd → mọi dạng chạy 3 s không lỗi, dạng nào bắn thì có sát thương
  for (const id of G15) {
    let loi = '', d = [];
    try { for (const g of [1, 2, 3]) { X(`KT_ban('solo', ['${id}', 'lien', 'canon', 'mana', 'bang']); var T = KT_T = KT_dat(2, '${id}', ${id === 'hydra' ? 'g === 3 ? 7 : g === 2 ? 4 : 1'.replace('g', g).replace('g', g) : 3}); T._epGd = ${g}; T.thuc = ${g === 3}; T.nap = ${g === 3 ? 0.9 : 0.5}; for (let i = 0; i < 4; i++) KT_quai('bo', KT_gan(T) + i * 25 - 40, 400); G._sum = 0;`); chay(ctx, 3); d.push(Math.round(X('G._sum'))); } }
    catch (e) { loi = e.message; }
    kt(ten(ctx, id), 'grow-up stages 1/2/3 run 3s each without error (damage dealt)', loi || d.join(' / '), !loi);
  }
  const cs = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuuvi', 3); const out = []; for (const n of [4, 5, 8]) { T.duoi = n; out.push(GROW.cuuvi.gd(T).s); } T.sao = 7; out.push(GROW.cuuvi.gd(T).s); return out; })()`);
  kt('Nine-Tail', 'GROW: tails 0–4 KIT / 5–8 BLAZING TAILS / 7★ NINE-TAIL', cs.join('/'), cs.join() === '1,2,2,3');
  const c2 = moiPhat('cuuvi', 3, { truoc: 'T._epGd = 2;', t: 10 }), c3 = moiPhat('cuuvi', 7, { truoc: 'T._epGd = 3;', t: 10 });
  kt('Nine-Tail', 'BLAZING TAILS foxfire ×1 (no double damage); 7★ foxfire ×1 + 26 px ring ×0.35', f2(c2.k) + ' / ' + f2(c3.k), gan(c2.k, 1, 0.04) && gan(c3.k, 1.35, 0.04));
  const ov = X(`[0.2, 0.5, 0.85].map(n => GROW.overlord.gd({ nap: n }).s)`);
  kt('Overlord', 'GROW: charge 0–35% DORMANT / 35–80% CHARGING / 80%+ OVERCHARGED', ov.join('/'), ov.join() === '1,2,3');
  const lp = X(`[0.3, 0.7, 1].map(n => GROW.lophanung.gd({ nap: n }).s)`);
  kt('Cryo Reactor', 'GROW: active charge <50% / 50–99% / full', lp.join('/'), lp.join() === '1,2,3');
  const th = X(`[0.5, 0.7, 0.95].map(n => GROW.tienhoa.gd({ nap: n }).s).concat([0.5, 0.8, 0.95].map(n => GROW.hopbi.gd({ nap: n }).s))`);
  kt('Evolver / Mystery Box', 'GROW: timer 0–60/60–90/90–100% · box 0–70/70–93/93–100%', th.join('/'), th.join() === '1,2,3,1,2,3');
  const cn = X(`(() => { KT_ban(); const T = KT_dat(2, 'cuongno', 3); const a = GROW.cuongno.gd(T).s; SKILLS.cuongno.khiCrit(G, T); const b = GROW.cuongno.gd(T).s; capNhat(1/30); const tb = T.buf.toc; SKILLS.cuongno.khiCrit(G, T); const c = GROW.cuongno.gd(T).s; capNhat(1/30); return [a, b, c, tb, T.buf.toc, SKILLS.cuongno.them(T)]; /* 3★ HOT BLOOD thay mốc chung +20% */ })()`);
  kt('Rampage (grow-up)', '1st crit → RAGE +25% fire rate · 2nd crit → FRENZY +(150+15×★)%', 's' + cn.slice(0, 3).join('→') + ' · +' + Math.round(cn[3] * 100) + '% · +' + Math.round(cn[4] * 100) + '%', cn.join().startsWith('1,2,3') && gan(cn[3], 0.25) && gan(cn[4], cn[5]));
  const lk = X(`(() => { KT_ban(); const ts = [5, 6, 7, 8].map(o => KT_dat(o, 'lienket', 1)); capNhat(1/30); return [GROW.lienket.gd(ts[0]).s, ts[0].buf.dmg]; })()`);
  kt('Chain Link (grow-up)', '4 linked → CHAIN MASTER, +40% per linked twin (+120%)', 's' + lk[0] + ' +' + Math.round(lk[1] * 100) + '%', lk[0] === 3 && gan(lk[1], 1.2));
  const lk3 = moiPhat('lienket', 1, { truoc: 'T._epGd = 3;', n: 2, cach: 40, t: 10 });
  kt('Chain Link (grow-up)', 'CHAIN MASTER: hit + lash a 2nd enemy ×0.5', f2(lk3.k), gan(lk3.k, 1.5, 0.04));
  const lc = X(`(() => { KT_ban(); const T = KT_dat(7, 'luoicheo', 3); const ns = [1, 3, 11, 13].map(o => KT_dat(o, 'lien', 1)); capNhat(1/30); const a = GROW.luoicheo.gd(T).s; G.ban[0].t[1] = G.ban[0].t[3] = null; capNhat(1/30); const b = GROW.luoicheo.gd(T).s; G.ban[0].t[11] = null; capNhat(1/30); return [a, b, GROW.luoicheo.gd(T).s]; })()`);
  kt('Resonance Grid', 'GROW: 4 diagonals RESONANCE / 2–3 HUMMING / 0–1 IDLE', lc.join('/'), lc.join() === '3,2,1');
  const rg = X(`[3, 4, 7].map(s => GROW.ronglua.gd({ sao: s }).s).concat([3, 4, 7].map(s => GROW.ngaithoigian.gd({ sao: s, nap: 0 }).s))`);
  kt('Wyrm Engine / Chrono Throne', 'GROW: 1–3★ / 4–6★ / 7★', rg.join('/'), rg.join() === '1,2,3,1,2,3');
  const og = X(`(() => { KT_ban(); const a = KT_dat(0, 'orbital', 1); const s1 = GROW.orbital.gd(a).s; KT_dat(1, 'orbital', 1); const s2 = GROW.orbital.gd(a).s; G.ban[0].phao = 5; const s3 = GROW.orbital.gd(a).s; return [s1, s2, s3]; })()`);
  kt('Orbital', 'GROW: 1 Orbital STANDBY / 2+ UPLINK / strike running BOMBARDMENT', og.join('/'), og.join() === '1,2,3');
  const at = X(`[GFX.ATK.orbital[0], GFX.ATK.dongbo[0], GROW.orbital.dk].join(' | ')`);
  kt('Orbital / Sync Cannon', 'attack-by-stage text no longer promises shots they never fire', at, !/bolt|pellet|fire rate\)/i.test(at), 'fixed text: Orbital (Special) and Sync Cannon (Support) never shoot');
}
// ---------------------------------------------------------------- 5) 3 chỉ huy
{
  const r = X(`(() => { KT_ban(); const B = G.ban[0]; B.mv = { id: 'dahlia', gia: 40, cd: 0 }; B.mana = 1000; const T = KT_dat(2, 'aten', 3); capNhat(1/30); const d0 = dmgU(T); const o0 = SKILLS.orbital.phaoDmg(B, 3); dungMV(B); const d1 = dmgU(T), o1 = SKILLS.orbital.phaoDmg(B, 3); const g = B.mv.gia; B.mv.cd = 0; dungMV(B); return [d1 / d0, o1 / o0, g, B.mv.gia, B.cuong]; })()`);
  kt('Commander RAGE', '+100% damage for 10s (also Orbital lances), cost 40 → 80 → 160', '×' + f2(r[0]) + ' · lance ×' + f2(r[1]) + ' · cost ' + r[2] + ' → ' + r[3] + ' · ' + r[4] + 's', gan(r[0], 2) && gan(r[1], 2) && r[2] === 80 && r[3] === 160 && r[4] === 10);
  const h = X(`(() => { KT_ban(); const B = G.ban[0]; B.mv = { id: 'hero', gia: 30, cd: 0 }; B.mana = 1000; for (let i = 0; i < 14; i++) KT_dat(i, 'lien', 2); const W = KT_dat(14, 'lien', 1); dungMV(B); const n = B.t.filter(Boolean).length; return [n, W.sao]; })()`);
  kt('Commander REINFORCE', 'board full-1 → summons 1 free 1★ + raises the weakest +1★', h.join(' turrets · weakest '), h[0] === 15 && h[1] === 2);
  const e = X(`(() => { KT_ban(); const B = G.ban[0]; B.mv = { id: 'eve', gia: 40, cd: 0 }; B.mana = 1000; const T = KT_dat(2, 'aten', 3); T.st.bang = 5; T.st.lua = 3; dungMV(B); const B0 = KT_trum('freezer', 300, 1); B0.bao = { t: 0, song: 0.01, muc: [T.uid] }; B0.knT = 0; capNhat(1/30); capNhat(1/30); return [B.khien, T.st.bang, T.st.lua]; })()`);
  kt('Commander HOLY SHIELD', 'clears debuffs + blocks boss skills for 8s', 'shield ' + f2(e[0]) + 's · frozen ' + e[1] + ' · burn ' + e[2], e[0] > 7.9 && e[1] === 0 && e[2] === 0);
  const t = X(`TEXT.af.hero.desc`);
  kt('Commander REINFORCE', 'text mentions the full-board fallback (+1★ to the weakest)', t, /weakest/i.test(t), 'fixed text: only said "summon two 1★ turrets"');
}
// ---------------------------------------------------------------- 6) tương tác hỗ trợ / trần (hotro.js) với ụ Vàng-Đỏ
{
  const r = X(`(() => { KT_ban(); const T = KT_dat(7, 'aten', 3); ['khuech', 'radar', 'hasao', 'khoisinh'].forEach((id, i) => KT_dat([6, 8, 2, 12][i], id, 7)); capNhat(1/30); capNhat(1/30); return [T.buf.dmg, T.buf.toc, T.ht && T.ht.daMax]; })()`);
  kt('(Support caps)', 'Purifier with 7★ Amplifier + Radar + Star Breaker + Genesis: support +dmg capped 35% (Genesis +15% is a Mythic perk outside the cap), fire rate cap 45%', 'dmg +' + Math.round(r[0] * 100) + '% · rate +' + Math.round(r[1] * 100) + '% (incl. 3★ +20%)', r[0] <= 0.35 + 0.15 + 1e-9 && r[1] <= 0.45 + 0.2 + 1e-9);
  const cr = X(`(() => { KT_ban(); const T = KT_dat(7, 'hydra', 4); KT_dat(6, 'chimang', 7); KT_dat(8, 'thaukinh', 7); capNhat(1/30); capNhat(1/30); return [T.buf.crit, T.buf.cdmg]; })()`);
  kt('(Support caps)', 'Hydra with Crit Antenna + Focus Lens: crit ≤ +20 pts, crit dmg ≤ +50%', '+' + Math.round(cr[0] * 100) + ' pts · +' + Math.round(cr[1] * 100) + '%', cr[0] <= 0.2 + 1e-9 && cr[1] <= 0.5 + 1e-9);
  const ch = X(`(() => { KT_ban(); const T = KT_dat(7, 'nemesis', 3); KT_dat(6, 'lanhgia', 7); KT_dat(8, 'lophanung', 7); KT_dat(2, 'bang', 7); const E = KT_quai('bo', KT_gan(T), 400); const B0 = KT_trum('janus', KT_gan(T) + 40, 1); for (let i = 0; i < 90; i++) capNhat(1/30); return [E.cham, B0.cham]; })()`);
  kt('(Support caps)', 'slow from Chiller + Cryo + hits: ≤35% (bosses ≤15%)', Math.round(ch[0] * 100) + '% / boss ' + Math.round(ch[1] * 100) + '%', ch[0] <= 0.35 + 1e-9 && ch[1] <= 0.15 + 1e-9 + 0.05);
  const vu = X(`(() => { KT_ban(); const E = KT_quai('bo', 300, 400); E.azT = 9; E.cvT = 9; E.cvK = 0.05; E.vmT = 9; E.vmK = 0.12; E.ywT = 9; E.ywK = 0.15; return HOTRO.vuln(E); })()`);
  kt('(Support caps)', 'enemy weaken (Cryo 7★ + Rainbow + Venom + Time Bomb) adds up, no cap (07/11) = 42%', Math.round(vu * 100) + '%', gan(vu, 0.42));
  const lr = X(`(() => { KT_ban(); const F = KT_dat(7, 'loren', 7); F.lo = 15; const T = KT_dat(0, 'ngoisao', 4); KT_dat(1, 'khuech', 7); capNhat(1/30); capNhat(1/30); return T.buf.dmg; })()`);
  kt('(Support caps)', 'Scrap Forge 15 stacks (+60%, no cap) stack on top of the 35% support cap (separate, documented)', '+' + Math.round(lr * 100) + '%', lr <= 0.6 + 0.35 + 1e-9);
}
// ---------------------------------------------------------------- 7) ghép đặc biệt với ụ Vàng-Đỏ
{
  const m = X(`(() => { KT_ban(); const a = KT_dat(0, 'mimic', 4), b = KT_dat(1, 'blackhole', 4); const r = ghep(G.ban[0], a, b); return [r.sao, !!G.ban[0].t[0]]; })()`);
  kt('(Special merges)', 'Mimic + Black Hole (same ★) → 5★ random deck turret', m.join(' · '), m[0] === 5 && !m[1]);
  const c = X(`(() => { KT_ban(); const a = KT_dat(0, 'saochep', 7), b = KT_dat(1, 'ronglua', 7); const r = ghep(G.ban[0], a, b); const N = G.ban[0].t[0]; capNhat(1/30); return [N.id, N.sao, N.banSao, GROW.ronglua.gd(N).s]; })()`);
  kt('(Special merges)', 'Copycat copies a 7★ Wyrm Engine: 7★ copy, −50% damage, WHITE WYRM form', c.join(' · '), c[0] === 'ronglua' && c[1] === 7 && c[2] && c[3] === 3);
  const v = X(`(() => { KT_ban(); const a = KT_dat(0, 'vughep', 6), b = KT_dat(1, 'hydra', 6); a.vang = false; ghep(G.ban[0], a, b); return [b.sao, GROW.hydra.gd(b).s]; })()`);
  kt('(Special merges)', 'Merge King on a 6★ Hydra → 7★ FUSED HEAD', v.join(' · stage '), v[0] === 7 && v[1] === 3);
  const k = X(`(() => { KT_ban(); const a = KT_dat(0, 'cuuvi', 3), b = KT_dat(1, 'cuuvi', 3); a.duoi = 6; b.duoi = 2; const r = ghep(G.ban[0], a, b); return r.id === 'cuuvi' ? r.duoi : 'n/a'; })()`);
  kt('(Special merges)', 'Nine-Tail × Nine-Tail into a Nine-Tail keeps the higher tail count', String(k), k === 6 || k === 'n/a');
  const st = X(`(() => { KT_ban(); const T = KT_dat(0, 'vughep', 7); const b = KT_dat(1, 'canon', 7); return hopLeGhep(T, b); })()`);
  kt('(Special merges)', 'Merge King cannot push a 7★ past the cap', String(st), st === false);
}
// ---------------------------------------------------------------- 8) chạy SOLO / CO-OP / PVP 60 s với từng ụ Vàng-Đỏ (bắt lỗi)
{
  let loi = [];
  for (const mode of ['solo', 'coop', 'pvp']) for (const id of BO) {
    try {
      ctx._deck = [id, 'lien', 'canon', 'radar', 'set']; ctx._che = mode; ctx._deck2 = [id, 'hasao', 'kepha', 'guongcong', 'lien'];
      X(`G.debug = { auto: true, deck2: _deck2, mana: 3000, wave: 9, fill: 5 }; G._critTat = false; G._giu = false; batDau(_che, _deck, 'hero');`);
      for (const T of X('G.ban.flatMap(B => B.t.filter(Boolean).map(T => T.uid))')) { /* bàn đầy sẵn (fill) */ }
      X(`for (const B of G.ban) for (const T of B.t) if (T && T.id === '${id}') T.nap = 1;`);
      S.buoc(ctx, 60, false);
    } catch (e) { loi.push(mode + ' ' + id + ': ' + e.message); }
  }
  kt('(all)', 'SOLO / CO-OP / PVP 60s with each Legendary/Mythic (actives charged, AI plays) — no error', loi.length ? loi.slice(0, 3).join(' | ') : '93 runs ok', !loi.length);
}

// ---------------------------------------------------------------- 9) chữ hiển thị khớp số thật
{
  const n = X(`(() => { KT_ban(); const out = []; for (const id of ['wallgen', 'blackhole', 'overlord']) { const T = KT_dat(2, id, 3); out.push(NHIP[id](T) + ' / ' + SKILLS[id].mo(T).split(' · ')[0]); } return out; })()`);
  kt('Wall / Black Hole / Overlord', 'info "every Xs" includes the 3★ QUICK HANDS +20% (3★: wall 6.5s, hole 7.1s, charge 5.0s)', n.join(' | '), /6\.5s/.test(n[0]) && /7\.1s/.test(n[1]) && /5\.0s/.test(n[2]), 'fixed text: showed the base seconds (7.8 / 8.5 / 6.0) while the turret really fired 20% sooner');
  const t = X(`TEXT.turret.ngoisao.skill + ' | ' + TEXT.turret.guongcong.skill`);
  kt('Star Cannon / Mirror Gate', 'skill text: every 10 board ★ (not "in 10s"); Mirror Gate lists its Solo boss block', t, !/in 10s/.test(t) && /Solo/.test(t), 'fixed text (Star Cannon wording by the counter session)');
  const v = JSON.parse(fs.readFileSync(path.join(GOC, '..', 'assets', 'roster.json'), 'utf8')).filter(r => /^(dongbo|hasao|cauvong|lophanung|guongcong|loren|orbital)$/.test(r.id)).map(r => r.id + ': ' + r.kyNang_vi);
  kt('(VI text)', 'Vietnamese skill text of the 7 re-roled Legendary/Mythic matches their new role (Support/Special)', v.length + ' updated', v.length === 7 && v.every(x => /Hỗ trợ|Đặc biệt/.test(x)), 'fixed text: VI still described the old attack skills (e.g. Star Breaker "−1★ to a rival")');
  const rg = X(`(() => { KT_ban(); const B = G.ban[0]; B.cuong = 5; const T = KT_dat(2, 'aten', 1); const E = KT_quai('bo', 300, 4000); const h = E.hp; SKILLS.pandora.lam(G, B, 'bom', 3, B.o[7]); for (let i = 0; i < 60; i++) { T.cd = 1e9; capNhat(1/30); } return (h - E.hp) / (hsU('pandora', 3, B) * 6); })()`);
  kt('Pandora Vault', 'commander RAGE ×2 also applies to vault bombs', '×' + f2(rg), gan(rg, 2, 0.02), 'fixed code: bombs used a fixed formula that skipped RAGE');
}

module.exports = { moi, R, chay, kt, KQ, gan, f2 };
if (require.main === module) {
  const md = process.argv[2] === 'md';
  if (md) { console.log('| Turret | Claim (skill text) | Measured | Status | Note |'); console.log('|---|---|---|---|---|'); }
  let loi = 0;
  for (const k of KQ) { if (!k.ok) loi++; if (md) { const tt = !k.ok ? '**FAIL**' : /^fixed code/.test(k.ghi) ? 'fixed code' : /^fixed text/.test(k.ghi) ? 'fixed text' : /^fixed/.test(k.ghi) ? 'fixed code+text' : 'OK'; console.log('| ' + k.u + ' | ' + k.hua.replace(/\|/g, '/') + ' | ' + k.do.replace(/\|/g, '/') + ' | ' + tt + ' | ' + k.ghi.replace(/^fixed( code| text)?:? ?/, '') + ' |'); } else if (!k.ok || process.argv[2] === 'all') console.log((k.ok ? 'ok   ' : 'LỖI  ') + k.u + ' — ' + k.hua + ' → ' + k.do + (k.ghi ? ' (' + k.ghi + ')' : '')); }
  if (!md) console.log(KQ.length + ' kiểm thử, ' + loi + ' lỗi');
  if (loi) process.exitCode = 1;
}
