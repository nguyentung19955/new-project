// TURRET MERGE — KIỂM KỸ NĂNG BẬC THƯỜNG (trắng) + HIẾM (xanh) + HỆ THỐNG HỖ TRỢ CHUNG (hotro.js)
//   node tools/thap-kt-kynang-tx.js            → chạy hết, in bảng | ụ | lời hứa | đo được | OK/LỖI |
//   node tools/thap-kt-kynang-tx.js md         → in bảng markdown (cho docs/demo-hop-tuong/QA-KYNANG-TRANG-XANH.md)
//   node tools/thap-kt-kynang-tx.js <id>       → chỉ chạy 1 ụ (vd. laser) hoặc 'hotro'
// Không giao diện: nạp thap/js qua tools/thap-sim-vaitro.js (RNG có hạt giống → lặp lại được).
// Số khớp chữ: ±1% (giá trị tất định) · DPS đo trên quái trâu đi vòng: ±7% so với công thức (có ngẫu nhiên chí mạng / xoay nòng).
'use strict';
const { taoMoiTruong, R: R0 } = require('./thap-sim-vaitro.js');
const R = (ctx, s) => R0(ctx, '{\n' + s + '\n}'); // khối riêng: const/let mỗi lần gọi không đụng nhau

// ---------- thư viện chạy TRONG ngữ cảnh game ----------
const LIB = `
var KT = {
  pi() { return G.duong.findIndex(p => p.ban === 0); },
  moi(deck) {
    G.debug = { auto: false }; batDau('solo', deck || ['lien', 'canon', 'set', 'tia', 'mana'], 'hero');
    G.cho = 1e9; G.wave = 20; const B = G.ban[0]; B.tim = 1e9; B.mana = 0; B.t.fill(null); B.cuong = 0;
    G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G._sum = 0; G._log = null; G._vongKT = true; KT.crit = 0; KT.ban = 0;
    return B;
  },
  dat(o, id, sao, lv) { const B = G.ban[0]; B.lv[id] = lv || B.lv[id] || 1; const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; T.cd = 0; return T; },
  quai(id, s, hs) { const E = sinhQuai(id, KT.pi(), s || 0, hs || 1); E.vao = 1; [E.x, E.y, E.goc] = viTri(G.duong[E.p], E.s); return E; },
  trum(s, hs) { const E = sinhTrum('mad_crown', KT.pi(), hs || 1); E.vao = 1; E.s = s || 0; E.knT = 1e9; [E.x, E.y, E.goc] = viTri(G.duong[E.p], E.s); return E; },
  dung(E) { E.d = Object.assign({}, E.d, { v: 0 }); return E; }, // quái đứng yên (đo cơ chế không phụ thuộc đường đi)
  buoc(t) { const dt = 1 / 60; for (let x = 0; x < t - 1e-9; x += dt) { capNhat(dt); while (_cho.length) _cho.shift()(); } },
  log(on) { G._log = on ? [] : null; },
};
const _ktLot = lot; lot = function (E) { if (G._vongKT) { E.s = 0; return; } return _ktLot(E); };
const _ktTrung = trung; trung = function (E, d, o) { const h = E.hp, T = o && o.T !== undefined ? o.T : G.dangBan; const r = _ktTrung(E, d, o); if (G._log) G._log.push({ E: E.uid, r, vao: d, T: T ? T.id : null, phu: !!(o && o.phu), hp: h, t: G.t }); return r; };
`;
function moiCtx(hat) {
  const ctx = taoMoiTruong(hat || 2026);
  ctx._crit = 0;
  ctx.SND = new Proxy({}, { get: (o, k) => (k === 'crit' ? () => { ctx._crit++; } : () => {}) });
  R(ctx, LIB);
  return ctx;
}

// ---------- ghi kết quả ----------
const KQ = [];
let chiChay = process.argv[2] && process.argv[2] !== 'md' ? process.argv[2] : null;
function ghi(u, claim, measured, ok, note) { KQ.push({ u, claim, measured: String(measured), ok: !!ok, note: note || '' }); }
const gan = (a, b, tl) => Math.abs(a - b) <= Math.abs(b) * (tl == null ? 0.01 : tl) + 1e-9;
const p = (x) => (x * 100).toFixed(1) + '%';
const f = (x, n) => (+x).toFixed(n == null ? 2 : n);

// DPS đo: 1 quái trâu đi vòng (không chết, không lọt) — trả sát thương thật / giây
function doDPS(ctx, dat, opt) {
  opt = opt || {};
  R(ctx, `KT.moi(${JSON.stringify(opt.deck || null)});`);
  ctx._dat = dat;
  R(ctx, `for (const [o, id, s, lv] of _dat) KT.dat(o, id, s, lv);`);
  const n = opt.n || 1;
  for (let i = 0; i < n; i++) R(ctx, `{ const E = ${opt.trum ? `KT.trum(${30 + i * 40}, 400)` : `KT.quai('${opt.quai || 'bo'}', ${30 + i * 40}, ${opt.hs || 3000})`}; ${opt.dung ? 'KT.dung(E);' : ''} ${opt.mana != null ? 'G.ban[0].mana = ' + opt.mana + ';' : ''} }`);
  if (opt.truoc) R(ctx, opt.truoc);
  R(ctx, `KT.buoc(${opt.khoi || 2}); G._sum = 0; KT.log(1);`); // bỏ 2 s đầu (xoay nòng, đạn đang bay)
  const T0 = opt.T || 30;
  R(ctx, `KT.buoc(${T0});`);
  ctx._vao = R(ctx, 'G._log.reduce((a, x) => a + x.vao, 0)') / T0; // sát thương TRƯỚC chí mạng / suy yếu (bỏ nhiễu chí mạng)
  R(ctx, 'KT.log(0)');
  return R(ctx, 'G._sum') / T0;
}
// DPS lý thuyết của 1 ụ bắn thường vào 1 quái thường: dmgU × tốc × (1 + crit×(1+cdmg)) × DOUBLE TAP (5★, loại 'ban')
function dpsLT(ctx, uid) {
  return R(ctx, `(() => { const T = G.ban[0].t.find(X => X && X.uid === ${uid}); const c = critU(T), cd = T.buf.cdmg || 0;
    const dt = loaiMoc(T.id) === 'ban' && mocChung(T, 5) ? 4 / 3.12 : 1; return dmgU(T) * tocU(T) * (1 + c * (1 + cd)) * dt; })()`);
}
function uid(ctx, o) { return R(ctx, `G.ban[0].t[${o}].uid`); }
const chay = (id) => !chiChay || chiChay === id;

// ô: 0..14 (5 cột × 3 hàng), ô 7 = giữa; ô 2 sát đường trên (đo DPS)
const SAO = [1, 3, 5, 7];

// ===================================================== ỤN TẤN CÔNG BẮN THƯỜNG: DPS theo sao =====================================================
function kiemDPS(ctx, id, opt) {
  opt = opt || {};
  const ds = [];
  for (const s of SAO) {
    let d = doDPS(ctx, [[2, id, s]], opt);
    R(ctx, 'capNhatBan(G.ban[0], 0)'); // buff trạng thái hiện tại để tính lý thuyết
    if (!opt.thuc) d = ctx._vao * (opt.khongCrit ? 1 : R(ctx, `(() => { const T = G.ban[0].t[2]; return 1 + critU(T) * (1 + (T.buf.cdmg || 0)); })()`)); // sát thương trước chí mạng × kỳ vọng chí mạng
    const lt = opt.lt ? opt.lt(s) : dpsLT(ctx, uid(ctx, 2)) * (opt.heSo || 1);
    ds.push([s, d, lt]);
  }
  const lech = ds.map(([s, d, lt]) => d / lt - 1);
  const ok = lech.every(x => Math.abs(x) <= (opt.tl || 0.07));
  ghi(id, 'DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones' + (opt.ghiChu ? ' (' + opt.ghiChu + ')' : ''),
    ds.map(([s, d, lt]) => s + '★ ' + f(d, 1) + '/' + f(lt, 1)).join(' · '), ok, 'measured/formula, worst ' + p(Math.max(...lech.map(Math.abs))));
  const r7 = ds[3][1] / ds[0][1], r7lt = ds[3][2] / ds[0][2];
  ghi(id, 'star scaling 7★/1★ as designed', f(r7, 2) + '× (design ' + f(r7lt, 2) + '×)', gan(r7, r7lt, opt.tl || 0.07));
  return ds;
}

// =====================================================================================================================
function main() {
  const ctx = moiCtx(+process.env.KT_HAT || 2026); // KT_HAT=<số> để thử hạt giống khác
  const sk = (id, k) => R(ctx, `SKILLS['${id}'].${k}`);

  // ---------------------------------------------- công thức chung ----------------------------------------------
  if (chay('chung')) {
    R(ctx, `KT.moi(); KT.dat(2, 'lien', 1); KT.dat(3, 'lien', 3); KT.dat(4, 'lien', 5); KT.dat(5, 'lien', 7); capNhatBan(G.ban[0], 0);`);
    const d = [2, 3, 4, 5].map(o => R(ctx, `dmgU(G.ban[0].t[${o}])`)), b = 4.5;
    const kv = [b, b * 2.7, b * 4.4, b * 6.1 * 1.3];
    ghi('(all)', 'damage per star = base × (1 + 0.85×(★−1)); 7★ APEX +30%', d.map(f).join(' / '), d.every((x, i) => gan(x, kv[i])), 'Gatling 1/3/5/7★');
    const t = [2, 3, 4, 5].map(o => R(ctx, `tocU(G.ban[0].t[${o}])`)), tk = [4, 4 * 1.28 * 1.2, 4 * 1.56 * 1.2, 4 * 1.84 * 1.2];
    ghi('(all)', 'fire rate: base × (1 + tocSao×(★−1)); 3★ QUICK HANDS +20%', t.map(f).join(' / '), t.every((x, i) => gan(x, tk[i])), 'Gatling 1/3/5/7★');
    const c = R(ctx, `[critU(G.ban[0].t[2]), critU(G.ban[0].t[5])]`);
    ghi('(all)', 'crit 10% base; 7★ APEX +10%', c.map(p).join(' / '), gan(c[0], 0.1) && gan(c[1], 0.2));
    R(ctx, `G.ban[0].lv.lien = 3; capNhatBan(G.ban[0], 0);`);
    ghi('(all)', 'in-match upgrade +18% damage / LV', f(R(ctx, `dmgU(G.ban[0].t[2])`)), gan(R(ctx, `dmgU(G.ban[0].t[2])`), 4.5 * 1.36));
    R(ctx, `G.ban[0].lv.lien = 1; G.ban[0].cuong = 5; capNhatBan(G.ban[0], 0);`);
    ghi('(all)', 'commander RAGE: +100% damage', f(R(ctx, `dmgU(G.ban[0].t[2])`)), gan(R(ctx, `dmgU(G.ban[0].t[2])`), 9));
    const xanh = R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'laser', 1); return dmgU(T); })()`);
    ghi('(all)', 'Rare tier multiplier ×1.3', f(xanh), gan(xanh, 12 * 1.3), 'Laser 1★');
    // không ụ nào trong bộ có dạng grow-up / thức tỉnh
    const grow = R(ctx, `G.roster.filter(r => (r.bac === 'trang' || r.bac === 'xanh') && (laGrow(r.id) || (typeof GFX !== 'undefined' && GFX.ATK && GFX.ATK[r.id]) || !!GROW[r.id])).map(r => r.id)`);
    ghi('(all)', 'Common/Rare have NO grow-up / awaken forms (stage multipliers n/a)', grow.length ? grow.join(',') : 'none', grow.length === 0);
  }

  // ===================================================== TRẮNG =====================================================
  if (chay('canon')) {
    const r = SAO.map(s => R(ctx, `SKILLS.canon.banKinh({ sao: ${s} })`));
    ghi('canon', 'blast radius widens with stars (28 + 6/★ px)', r.join('/'), r.join() === '34,46,58,70');
    kiemDPS(ctx, 'canon');
    // nổ lan: quái thứ 2 trong bán kính bị trúng, quái xa không
    R(ctx, `KT.moi(); KT.dat(2, 'canon', 1); const A = KT.dung(KT.quai('bo', 320, 3000)); const B = KT.dung(KT.quai('bo', 300, 3000)); const C = KT.dung(KT.quai('bo', 200, 3000)); KT.log(1); KT.buoc(6); G._abc = [A.uid, B.uid, C.uid];`);
    const h = R(ctx, `G._abc.map(u => G._log.filter(x => x.E === u).length)`);
    ghi('canon', 'splash hits the group, not far enemies', 'hits lead/20px behind/120px behind = ' + h.join('/'), h[0] > 0 && h[1] > 0 && h[2] === 0);
  }
  if (chay('xucxac')) {
    R(ctx, `KT.moi(); KT.dat(2, 'xucxac', 1); const E = KT.quai('bo', 30, 9e4); KT.log(1); KT.buoc(200);`);
    const st = R(ctx, `(() => { const T = G.ban[0].t[2], d = dmgU(T), ds = G._log.map(x => x.r / d * 100); return [Math.min(...ds), Math.max(...ds), ds.filter(x => x > 299).length, ds.length, ds.filter(x => x > 300.5).length]; })()`);
    ghi('xucxac', 'each shot 3–300% damage', f(st[0], 0) + '–' + f(st[1], 0) + '% over ' + st[3] + ' shots', st[0] >= 3 && st[1] <= 300.5 && st[0] < 15 && st[1] > 295);
    ghi('xucxac', 'crits always roll max (300%, never doubled)', st[2] + ' max rolls, ' + st[4] + ' above 300%', st[4] === 0 && st[2] >= 0.06 * st[3]);
    kiemDPS(ctx, 'xucxac', { lt: (s) => R(ctx, `(() => { const T = G.ban[0].t[2], c = critU(T); return dmgU(T) * tocU(T) * (1.51 * (1 - c) + 3 * c) * (mocChung(T, 5) ? 4 / 3.12 : 1); })()`), tl: 0.08, thuc: true, T: 240, ghiChu: 'mean roll 151%, 240s' });
    // Crit Antenna 7★ "sure crit" → cú đó = 300%, không phải 600%
    R(ctx, `KT.moi(); KT.dat(7, 'xucxac', 1); KT.dat(8, 'chimang', 7); KT.quai('bo', 30, 9e4); KT.log(1); KT.buoc(40);`);
    const mx = R(ctx, `(() => { const T = G.ban[0].t[7], d = dmgU(T); return Math.max(...G._log.filter(x => x.T === 'xucxac').map(x => x.r / d * 100)); })()`);
    ghi('xucxac', 'with Crit Antenna 7★ sure crit: max roll 300% (× its +10% crit damage = 315%), never doubled to 600%', 'max hit ' + f(mx, 0) + '%', mx <= 316);
    R(ctx, `KT.moi(); KT.dat(7, 'xucxac', 1); KT.dat(8, 'bua', 5); KT.quai('bo', 30, 9e4); KT.log(1); KT.buoc(120);`);
    const mh = R(ctx, `(() => { const T = G.ban[0].t[7]; capNhatBan(G.ban[0], 0); const d = dmgU(T); return Math.max(...G._log.filter(x => x.T === 'xucxac').map(x => x.r / d * 100)); })()`);
    ghi('xucxac', 'Hammer 5★ (+50% crit damage) raises a max roll to 300×(2.5/2) = 375%', 'max hit ' + f(mh, 0) + '%', gan(mh, 375, 0.01));
  }
  if (chay('lien')) {
    ghi('lien', 'very fast: 4 shots/s, +14% fire rate per ★', SAO.map(s => f(R(ctx, `tocU(Object.assign(taoU(G.ban[0], 'lien', ${s}, 0), {}))`))).join('/') + ' (before 3★ +20%)', gan(R(ctx, `tocU(taoU(G.ban[0], 'lien', 7, 0))`), 4 * 1.84));
    kiemDPS(ctx, 'lien');
  }
  if (chay('phun')) {
    kiemDPS(ctx, 'phun');
    R(ctx, `KT.moi(); KT.dat(2, 'phun', 1); for (let i = 0; i < 4; i++) KT.quai('bo', 40 + i * 60, 3000); KT.log(1); KT.buoc(10);`);
    const n = R(ctx, `new Set(G._log.map(x => x.E)).size`);
    ghi('phun', 'fires at RANDOM enemies (not just the lead)', n + ' of 4 enemies hit', n >= 3);
    ghi('phun', '5 shots/s, +8%/★', f(R(ctx, `tocU(taoU(G.ban[0], 'phun', 1, 0))`)) + ' → ' + f(R(ctx, `tocU(taoU(G.ban[0], 'phun', 2, 0))`)), gan(R(ctx, `tocU(taoU(G.ban[0], 'phun', 2, 0))`), 5.4));
  }
  if (chay('sungluc')) {
    kiemDPS(ctx, 'sungluc');
    R(ctx, `KT.moi(); KT.dat(2, 'sungluc', 1); KT.quai('bo', 30, 9e4); KT.log(1); KT.buoc(300);`);
    const st = R(ctx, `(() => { const d = dmgU(G.ban[0].t[2]); const n = G._log.length, c = G._log.filter(x => x.r > d * 1.5).length; return [n, c]; })()`);
    ghi('sungluc', 'one heavy instant shot, 20% crit', p(st[1] / st[0]) + ' crits over ' + st[0] + ' shots', Math.abs(st[1] / st[0] - 0.2) < 0.05);
    R(ctx, `KT.moi(); KT.dat(2, 'sungluc', 1); const A = KT.quai('bo', 200, 3000); KT.quai('bo', 60, 3000); KT.log(1); KT.buoc(5); G._a = A.uid;`);
    ghi('sungluc', 'hits the lead enemy', R(ctx, `G._log.every(x => x.E === G._a)`) ? 'all shots on lead' : 'missed lead', R(ctx, `G._log.length > 0 && G._log.every(x => x.E === G._a)`));
  }
  if (chay('bang')) {
    // Frost: mỗi 6 s đóng băng quái đầu 2 s, trùm 0.6 s, quái to ×0.6, sau đó lạnh 30% 2 s, miễn 3 s, không sát thương
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bang', 1); T.nap = 0; const E = KT.quai('bo', 200, 3000); KT.log(1); G._e = E; G._ts = []; let cu = 0;
      for (let i = 0; i < 30 * 26; i++) { KT.buoc(1 / 30); if (E.chan > 0 && !cu) G._ts.push(+G.t.toFixed(2)); cu = E.chan > 0 ? 1 : 0; }`);
    const ts = R(ctx, 'G._ts'), gap = ts.slice(1).map((x, i) => x - ts[i]);
    ghi('bang', 'freezes the lead enemy every 6s', 'freeze starts ' + ts.map(x => f(x, 1)).join(', ') + 's', gap.length >= 2 && gap.every(g => g >= 5.8 && g <= 6.5), 'gap = 6s charge + bolt flight');
    ghi('bang', 'Frost deals no damage', 'damage ' + f(R(ctx, `G._log.reduce((a, x) => a + x.r, 0)`), 0), R(ctx, `G._log.length`) === 0);
    const fr = (loai, s) => R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'bang', ${s}); const E = ${loai === 'trum' ? 'KT.trum(200, 1)' : `KT.quai('${loai}', 200, 3000)`}; dongBang(E, SKILLS.bang.dai(T), T); return [E.chan, E.cham, E.chamT, E.bangMien - G.t]; })()`);
    const a = fr('bo', 1), a3 = fr('bo', 3), big = fr('khong_lo', 1), boss = fr('trum', 1);
    ghi('bang', 'freeze 2s (3★ LONG FREEZE 2.5s)', f(a[0]) + 's / ' + f(a3[0]) + 's', gan(a[0], 2) && gan(a3[0], 2.5));
    ghi('bang', 'big enemies ×0.6, bosses 0.6s', 'big ' + f(big[0]) + 's · boss ' + f(boss[0]) + 's', gan(big[0], 1.2) && gan(boss[0], 0.6));
    ghi('bang', 'after freeze: 30% chill 2s (bosses too — boss slow cap 50%)', 'normal ' + p(a[1]) + ' ' + f(a[2] - a[0]) + 's · boss ' + p(boss[1]), gan(a[1], 0.3) && gan(a[2] - a[0], 2) && gan(boss[1], 0.3));
    ghi('bang', 'no chain-freeze: 3s immunity after the freeze', f(a[3] - a[0], 2) + 's after thaw', gan(a[3] - a[0], 3));
    const k5 = R(ctx, `[SKILLS.bang.ky({ sao: 1 }), SKILLS.bang.ky({ sao: 5 }), SKILLS.bang.so({ sao: 7 })]`);
    ghi('bang', '5★ QUICK FROST every 4.5s · 7★ DOUBLE FREEZE 2 enemies', k5.join(' / '), k5.join() === '6,4.5,2');
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bang', 7); T.nap = 1; const A = KT.quai('bo', 200, 3000), B2 = KT.quai('bo', 150, 3000), C = KT.quai('bo', 100, 3000); KT.buoc(1.2); G._n = [A, B2, C].filter(E => E.chan > 0).length;`);
    ghi('bang', '7★ freezes 2 lead enemies at once', R(ctx, 'G._n') + ' frozen', R(ctx, 'G._n') === 2);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bang', 1); T.nap = 1; const E = KT.quai('bay_bang', 200, 3000); KT.buoc(1.2); G._n = E.chan;`);
    ghi('bang', 'slow-immune (ice flyer) is skipped', 'freeze ' + f(R(ctx, 'G._n')), R(ctx, 'G._n') === 0);
  }
  if (chay('doc')) {
    R(ctx, `KT.moi(); const T = KT.dat(2, 'doc', 1); T.nap = 1; const E = KT.quai('bo', 200, 3000); KT.log(1); KT.buoc(1.5); G._e = E;`);
    const m = R(ctx, `[G._e.vmT, G._e.vmK, HOTRO.vuln(G._e), G._log.length, G._e.doc]`);
    ghi('doc', 'marks the lead enemy 5s: +12% damage taken from all turrets', 'mark ' + f(m[0], 2) + 's left · vuln ' + p(m[2]), m[0] > 3.5 && m[0] <= 5 && gan(m[2], 0.12));
    ghi('doc', 'Venom itself deals no damage (mark only, no poison ticks)', m[3] + ' hits, poison dps ' + f(m[4]), m[3] === 0 && !(m[4] > 0));
    R(ctx, `KT.moi(); KT.dat(2, 'lien', 1); const V = KT.dat(3, 'doc', 1); V.nap = 1; const E = KT.quai('bo', 200, 3000); KT.buoc(1); KT.log(1); KT.buoc(6); G._k = G._log.filter(x => x.T === 'lien').map(x => x.r / x.vao); G._k = [Math.min(...G._k), Math.max(...G._k)];`);
    ghi('doc', 'Gatling on a marked enemy deals +12%', 'hit ×' + R(ctx, 'G._k').map(x => f(x, 3)).join(' / ×') + ' (normal / crit)', gan(R(ctx, 'G._k[0]'), 1.12) && gan(R(ctx, 'G._k[1]'), 2.24));
    const so = R(ctx, `[SKILLS.doc.so({ sao: 1 }), SKILLS.doc.so({ sao: 3 }), SKILLS.doc.ky]`);
    ghi('doc', 'every 2.5s; 3★ TWIN MARK 2 enemies', so.join(' / '), so.join() === '1,2,2.5');
    R(ctx, `KT.moi(); const T = KT.dat(2, 'doc', 7); T.nap = 1; const E = KT.quai('bo', 200, 3000); KT.buoc(1.5); G._c = E.cham;`);
    ghi('doc', '7★ NEUROTOXIN: marked slowed 15%', p(R(ctx, 'G._c')), gan(R(ctx, 'G._c'), 0.15));
    R(ctx, `KT.moi(); const T = KT.dat(2, 'doc', 5); T.nap = 1; const E = KT.dung(KT.quai('bo', 200, 30)); KT.buoc(1.5); T.nap = -99; const Q = KT.dung(KT.quai('bo', 170, 3000)); KT.buoc(1 / 60); trung(E, E.hp + 9, { B: G.ban[0], T: null }); G._q = Q.vmT;`);
    ghi('doc', '5★ CONTAGION: mark jumps to a nearby enemy on death', 'neighbour mark ' + f(R(ctx, 'G._q') || 0) + 's', R(ctx, 'G._q') > 4);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'doc', 1); T.nap = 1; KT.dat(3, 'aten', 1); const E = KT.quai('bo', 200, 3000); KT.buoc(1.2); G._p = [E.vmT > 0, typeof biDoc === 'function' ? biDoc(E) : E.docT > 0];`);
    ghi('doc', 'Purifier counts a Venom mark as "poisoned"', R(ctx, 'G._p').join('/'), R(ctx, 'G._p[1]') === true);
  }
  if (chay('mana')) {
    const v = SAO.map(s => R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'mana', ${s}); return [SKILLS.mana.luong(T), SKILLS.mana.ky(T)]; })()`));
    ghi('mana', 'does not shoot; +9×★ mana every 7s (3★ 6s, 5★ +25%, 7★ 5s)', v.map(([a, b], i) => SAO[i] + '★ +' + a + '/' + b + 's').join(' · '), v.map(x => x.join(':')).join() === '9:7,27:6,56:6,79:5');
    R(ctx, `KT.moi(); KT.dat(2, 'mana', 1); KT.quai('bo', 30, 3000); KT.log(1); G.ban[0].mana = 0; KT.buoc(21.2);`);
    ghi('mana', 'measured over 21s at 1★', '+' + R(ctx, 'G.ban[0].mana') + ' mana, ' + R(ctx, 'G._log.length') + ' hits', R(ctx, 'G.ban[0].mana') === 27 && R(ctx, 'G._log.length') === 0);
  }
  if (chay('tia')) {
    kiemDPS(ctx, 'tia', { ghiChu: 'normal enemy' });
    kiemDPS(ctx, 'tia', { quai: 'khong_lo', heSo: 2, ghiChu: 'big enemy ×2' });
    R(ctx, `KT.moi(); KT.dat(2, 'tia', 1); KT.quai('bo', 200, 3000); const A = KT.quai('bo', 60, 6000); KT.log(1); KT.buoc(6); G._a = A.uid;`);
    ghi('tia', 'targets the highest-HP enemy', R(ctx, `G._log.length && G._log.every(x => x.E === G._a)`) ? 'all on toughest' : 'no', R(ctx, `G._log.length > 0 && G._log.every(x => x.E === G._a)`));
    const b0 = (doDPS(ctx, [[2, 'tia', 1]], { trum: true, T: 60 }), ctx._vao) / (doDPS(ctx, [[2, 'tia', 1]], { T: 60 }), ctx._vao); const b = b0;
    ghi('tia', '+100% vs bosses', f(b, 2) + '×', Math.abs(b - 2) < 0.15);
  }
  if (chay('set')) {
    kiemDPS(ctx, 'set', { ghiChu: 'single target' });
    for (const s of [1, 3, 5]) {
      R(ctx, `KT.moi(); const T = KT.dat(2, 'set', ${s}); for (let i = 0; i < 7; i++) KT.dung(KT.quai('bo', 100 + i * 25, 3000)); KT.log(1); KT.buoc(1.6);`);
      const r = R(ctx, `(() => { const g = G._log.filter(x => x.T === 'set'); const lan = []; let cur = []; for (const x of g) { if (cur.length && Math.abs(x.t - cur[0].t) > 1e-6) { lan.push(cur); cur = []; } cur.push(x); } if (cur.length) lan.push(cur); const L = lan[0] || []; return [L.length, L.length > 1 ? L[1].vao / L[0].vao : 0]; })()`);
      ghi('set', 'chain lightning hits N = ★ enemies (×0.88 per jump)', s + '★: ' + r[0] + ' enemies' + (r[0] > 1 ? ', jump ×' + f(r[1], 3) : ''), r[0] === s && (s === 1 || gan(r[1], 0.88)));
    }
  }
  if (chay('maychem')) {
    const tl = SAO.map(s => R(ctx, `(() => { KT.moi(); return SKILLS.maychem.tile(KT.dat(2, 'maychem', ${s})); })()`));
    ghi('maychem', 'instant-kill chance 3.75% +0.75%/★ per shot', tl.map(p).join('/'), gan(tl[0], 0.0375) && gan(tl[3], 0.0825));
    R(ctx, `KT.moi(); KT.dat(2, 'maychem', 7); G._k = 0; G._n = 0; for (let i = 0; i < 400; i++) { const E = KT.quai('bo', 150, 200); KT.dung(E); E.hp = E.max = 1e9; KT.log(1); while (!G._log.length) KT.buoc(1 / 30); if (E.chet) G._k++; G._n++; E.chet = true; G.quai.length = 0; }`);
    ghi('maychem', 'measured kill rate on small enemies (7★)', p(R(ctx, 'G._k / G._n')) + ' of ' + R(ctx, 'G._n') + ' shots', Math.abs(R(ctx, 'G._k / G._n') - tl[3]) < 0.03);
    R(ctx, `KT.moi(); KT.dat(2, 'maychem', 7); G._k = 0; for (let i = 0; i < 150; i++) { const E = KT.quai('khong_lo', 150, 1); KT.dung(E); E.hp = E.max = 1e9; KT.log(1); while (!G._log.length) KT.buoc(1 / 30); if (E.chet) G._k++; E.chet = true; G.quai.length = 0; }`);
    ghi('maychem', 'never instant-kills big enemies', R(ctx, 'G._k') + ' kills / 150', R(ctx, 'G._k') === 0);
    kiemDPS(ctx, 'maychem', { quai: 'khong_lo', ghiChu: 'big enemy, no execute' });
  }
  if (chay('nam')) {
    const t = SAO.map(s => R(ctx, `tocU(taoU(G.ban[0], 'nam', ${s}, 0))`));
    ghi('nam', 'rapid punches 2.4/s +6%/★', t.map(x => f(x)).join('/') + ' (before 3★ +20%)', gan(t[0], 2.4) && gan(t[3], 2.4 * 1.36));
    // ô sát đường: tìm ô có quái trong 105 px
    R(ctx, `KT.moi(); const T = KT.dat(2, 'nam', 1); const c = tamU(T); const p = G.duong[KT.pi()]; let sBest = 0, dBest = 1e9; for (let s = 0; s < p.len; s += 4) { const [x, y] = viTri(p, s); const d = Math.hypot(x - c.x, y - c.y); if (d < dBest) { dBest = d; sBest = s; } } G._sb = sBest; G._db = dBest;`);
    ghi('nam', 'melee: only hits enemies within 105 px', 'nearest path point ' + f(R(ctx, 'G._db'), 0) + ' px from cell 2', true, 'info');
    R(ctx, `KT.moi(); const T = KT.dat(2, 'nam', 1); const A = KT.dung(KT.quai('bo', G._sb, 3000)); const C = KT.dung(KT.quai('bo', G._sb + 300, 3000)); KT.log(1); KT.buoc(5); G._h = [A.uid, C.uid].map(u => G._log.filter(x => x.E === u).length);`);
    const h = R(ctx, 'G._h');
    ghi('nam', 'ring blast hits enemy in reach, ignores far enemy', h.join('/'), h[0] > 0 && h[1] === 0);
    const d = SAO.map(s => { const ds = doDPS(ctx, [[2, 'nam', s]], { dung: true, truoc: `G.quai[0].s = G._sb; [G.quai[0].x, G.quai[0].y] = viTri(G.duong[G.quai[0].p], G._sb);` }); R(ctx, 'capNhatBan(G.ban[0], 0)'); return [ds, dpsLT(ctx, uid(ctx, 2))]; });
    ghi('nam', 'DPS 1/3/5/7★ in reach = formula', d.map(([a, b], i) => SAO[i] + '★ ' + f(a, 1) + '/' + f(b, 1)).join(' · '), d.every(([a, b]) => Math.abs(a / b - 1) < 0.07));
  }
  if (chay('bomhen')) {
    const v = R(ctx, `[SKILLS.bomhen.r({ sao: 1 }), SKILLS.bomhen.r({ sao: 7 }), SKILLS.bomhen.yeuDai({ sao: 1 }), SKILLS.bomhen.yeuDai({ sao: 3 })]`);
    ghi('bomhen', 'blast radius 34+3/★ px; weakness 4s (3★ LONG FUSE 6s)', v.join(' / '), v.join() === '37,55,4,6');
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bomhen', 1); T.nap = 1; const A = KT.dung(KT.quai('bo', 200, 3000)); const B2 = KT.dung(KT.quai('bo', 220, 3000)); const C = KT.dung(KT.quai('bo', 400, 3000)); T.muc = A; KT.log(1); KT.buoc(0.6); T.nap = -99; G._t0 = G.t; G._ab = [A, B2, C]; let t = 0; while (!G.hu.some(o => o.k === 'bom' && o.daNo) && t < 9) { KT.buoc(1 / 30); t += 1 / 30; } G._tno = t;`);
    const r = R(ctx, `[G._tno, G._ab.map(E => +HOTRO.vuln(E).toFixed(3)), G._ab.map(E => +(E.ywT || 0).toFixed(2)), G._log.length]`);
    ghi('bomhen', 'bomb goes off ~5s after it sticks', f(r[0] + 0.6 - 0.35, 1) + 's after throw (flight ~0.4s)', r[0] > 4.3 && r[0] < 5.3);
    ghi('bomhen', 'blast weakens nearby enemies +10% (far enemy not)', r[1].map(p).join(' / ') + ' · ' + r[2].join('/') + 's', gan(r[1][0], 0.1) && gan(r[1][1], 0.1) && r[1][2] === 0);
    ghi('bomhen', 'blast deals no damage', r[3] + ' hits', r[3] === 0);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bomhen', 7); T.nap = 1; for (let i = 0; i < 3; i++) KT.dung(KT.quai('bo', 150 + 100 * i, 3000)); KT.buoc(0.6); G._n = G.hu.filter(o => o.k === 'bom').length;`);
    ghi('bomhen', '7★ TWIN BOMBS', R(ctx, 'G._n') + ' bombs', R(ctx, 'G._n') === 2);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bomhen', 5); T.nap = 1; const A = KT.dung(KT.quai('bo', 200, 3000)); T.muc = A; KT.buoc(0.6); T.nap = -99; while (!G.hu.some(o => o.k === 'bom' && o.daNo)) KT.buoc(1 / 30); G._c = A.chan;`);
    ghi('bomhen', '5★ SHOCKWAVE staggers 0.5s', f(R(ctx, 'G._c')) + 's', gan(R(ctx, 'G._c'), 0.5, 0.08));
    R(ctx, `KT.moi(); const T = KT.dat(2, 'bomhen', 1); T.nap = 0; for (let i = 0; i < 12; i++) KT.dung(KT.quai('bo', 40 + 30 * i, 3000)); KT.buoc(10.05); G._n = G.hu.filter(o => o.k === 'bom').length;`);
    ghi('bomhen', 'sticks a new bomb every 2s', R(ctx, 'G._n') + ' bombs live after 10s', R(ctx, 'G._n') >= 2 && R(ctx, 'G._n') <= 3, '5s fuse → ≤3 alive at once');
  }

  // ===================================================== XANH =====================================================
  if (chay('nhanmana')) {
    for (const s of [1, 3, 6]) {
      R(ctx, `KT.moi(['nhanmana']); const a = KT.dat(2, 'nhanmana', ${s}), b = KT.dat(3, 'nhanmana', ${s}); G.ban[0].mana = 0; ghep(G.ban[0], a, b); KT.buoc(0.1); G._m = G.ban[0].mana; G._s = G.ban[0].t[3] && G.ban[0].t[3].sao;`);
      ghi('nhanmana', 'on merge: +32 × ★ mana', s + '★+' + s + '★ → +' + R(ctx, 'G._m') + ' mana, result ' + R(ctx, 'G._s') + '★', R(ctx, 'G._m') === 32 * s && R(ctx, 'G._s') === s + 1);
    }
    kiemDPS(ctx, 'nhanmana');
  }
  if (chay('kiembang')) {
    kiemDPS(ctx, 'kiembang', { ghiChu: 'not slowed' });
    for (const [s, k] of [[1, 5], [3, 6], [5, 6], [7, 8]]) {
      R(ctx, `KT.moi(); KT.dat(2, 'kiembang', ${s}); const E = KT.dung(KT.quai('bo', 200, 9e4)); E.cham = 0.2; E.chamT = 99; KT.log(1); KT.buoc(5); const d = dmgU(G.ban[0].t[2]); G._k = Math.min(...G._log.filter(x => !x.phu).map(x => x.vao / d)); G._sp = G._log.filter(x => x.phu && x.E === E.uid).length;`);
      ghi('kiembang', 'vs slowed enemies ×' + k + (s === 1 ? ' (+400%)' : s === 3 ? ' (3★ SHATTER ×6)' : s === 7 ? ' (7★ GLACIER ×8)' : ''), s + '★ hit ×' + f(R(ctx, 'G._k'), 2) + (s >= 5 ? ', splinters on the target itself: ' + R(ctx, 'G._sp') : ''), gan(R(ctx, 'G._k'), k) && R(ctx, 'G._sp') === 0);
    }
    R(ctx, `KT.moi(); KT.dat(2, 'kiembang', 1); const L = KT.dung(KT.quai('bo', 320, 3000)); const N = KT.dung(KT.quai('bo', 300, 3000)); const C = KT.dung(KT.quai('bo', 200, 3000)); KT.buoc(2.2); G._c = [N.cham, N.chamT > 0, C.cham];`);
    ghi('kiembang', 'each hit chills enemies within 44 px 20% · 2s', '20px: ' + R(ctx, 'G._c[0]') + ' · 120px: ' + R(ctx, 'G._c[2]'), R(ctx, 'G._c[0]') === 0.2 && R(ctx, 'G._c[2]') === 0);
    R(ctx, `KT.moi(); KT.dat(2, 'kiembang', 1); const E = KT.dung(KT.quai('bay_bang', 200, 3000)); E.chamT = 99; E.cham = 0; KT.log(1); KT.buoc(4); const d = dmgU(G.ban[0].t[2]); G._k = Math.max(...G._log.map(x => x.vao / d));`);
    ghi('kiembang', 'slow-immune enemy with a slow timer but 0% slow is NOT "slowed"', 'hit ×' + f(R(ctx, 'G._k'), 1), R(ctx, 'G._k') < 1.5);
    R(ctx, `KT.moi(); KT.dat(2, 'kiembang', 1); const E = KT.dung(KT.quai('bo', 200, 3000)); E.chan = 99; KT.log(1); KT.buoc(3); const d = dmgU(G.ban[0].t[2]); G._k = Math.min(...G._log.map(x => x.vao / d));`);
    ghi('kiembang', 'frozen (Frost) counts as slowed', 'hit ×' + f(R(ctx, 'G._k'), 1), gan(R(ctx, 'G._k'), 5));
    R(ctx, `KT.moi(); KT.dat(2, 'kiembang', 5); const A = KT.dung(KT.quai('bo', 230, 3000)); const B2 = KT.dung(KT.quai('bo', 200, 3000)); A.cham = 0.3; A.chamT = 99; KT.log(1); KT.buoc(2.5); const d = dmgU(G.ban[0].t[2]); G._sp = G._log.filter(x => x.E === B2.uid && x.phu).map(x => x.vao / d);`);
    ghi('kiembang', '5★ SPLINTERS: shatter splashes 40% (of ×6) on enemies within 40 px', 'splash ' + R(ctx, 'G._sp').map(x => '×' + f(x, 2)).join(','), R(ctx, 'G._sp.length') > 0 && gan(R(ctx, 'G._sp[0]'), 2.4));
  }
  if (chay('mimic')) {
    R(ctx, `KT.moi(['canon', 'lien', 'mimic']); const a = KT.dat(2, 'mimic', 3), b = KT.dat(3, 'canon', 3); const r = ghep(G.ban[0], a, b); KT.buoc(0.05); G._r = [r && r.sao, r && r.aurora > 7.9, !!G.ban[0].t[2], ['canon', 'lien', 'mimic'].includes(r.id)];`);
    const r = R(ctx, 'G._r');
    ghi('mimic', 'merges with ANY same-star turret → +1★ from deck', 'Mimic3★+Cannon3★ → ' + r[0] + '★, slot freed ' + !r[2], r[0] === 4 && !r[2] && r[3]);
    ghi('mimic', 'result +50% attack for 8s', 'aurora set ' + r[1], r[1]);
    const am = R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'lien', 2); capNhatBan(G.ban[0], 0); const a = dmgU(T); T.aurora = 8; const b = dmgU(T); KT.buoc(8.1); return [b / a, T.aurora]; })()`);
    ghi('mimic', 'aurora = ×1.5 damage, expires after 8s', '×' + f(am[0]) + ', left ' + f(am[1]) + 's', gan(am[0], 1.5) && am[1] === 0);
    const h = R(ctx, `(() => { KT.moi(['canon', 'mimic', 'radar']); return [hopLeGhep(KT.dat(2, 'mimic', 2), KT.dat(3, 'canon', 3)), hopLeGhep(KT.dat(4, 'mimic', 2), KT.dat(5, 'radar', 2)), hopLeGhep(KT.dat(6, 'mimic', 7), KT.dat(7, 'canon', 7))]; })()`);
    ghi('mimic', 'not with a different star; works with supports; not at 7★', h.join('/'), h.join() === 'false,true,false');
    kiemDPS(ctx, 'mimic');
  }
  if (chay('chimang')) {
    const v = [1, 2, 3, 4, 5, 6, 7].map(s => R(ctx, `(() => { KT.moi(); return SKILLS.chimang.them(KT.dat(2, 'chimang', ${s})); })()`));
    ghi('chimang', '+crit chance N/E/S/W: 6.75% at 1★ → 22.5% at 7★ (table ×0.75, 07/11)', v.map(x => Math.round(x * 100)).join('/'), gan(v[0], 0.0675) && gan(v[6], 0.225));
    const moc = R(ctx, `mocCua('chimang').map(m => m.mo)`);
    const kh = moc[0].includes(Math.round(v[2] * 100) + '%') && moc[1].includes(Math.round(v[4] * 100) + '%');
    ghi('chimang', 'milestone text 3★/5★ = real crit value', moc.join(' | '), kh, 'real 3★ ' + Math.round(v[2] * 100) + '%, 5★ ' + Math.round(v[4] * 100) + '%');
    R(ctx, `KT.moi(); KT.dat(7, 'chimang', 5); KT.dat(2, 'lien', 1); KT.dat(6, 'lien', 1); KT.dat(1, 'lien', 1); KT.dat(8, 'radar', 1); capNhatBan(G.ban[0], 0);`);
    const c = R(ctx, `[critU(G.ban[0].t[2]), critU(G.ban[0].t[6]), critU(G.ban[0].t[1]), G.ban[0].t[2].buf.cdmg, G.ban[0].t[8].buf.crit]`);
    ghi('chimang', 'buffs N/E/S/W only (not diagonal, not other supports); 5★ +10% crit damage', 'N ' + p(c[0]) + ' · W ' + p(c[1]) + ' · diag ' + p(c[2]) + ' · cdmg +' + p(c[3]) + ' · Radar ' + p(c[4]), gan(c[0], 0.25) && gan(c[1], 0.25) && gan(c[2], 0.1) && gan(c[3], 0.1) && c[4] === 0);
    R(ctx, `KT.moi(); KT.dat(7, 'chimang', 7); KT.dat(2, 'sungluc', 1); const E = KT.quai('bo', 30, 9e4); KT.buoc(1); _crit = 0; KT.log(1); KT.buoc(300);`);
    ghi('chimang', '7★ CERTAIN STRIKE: a sure crit every 6s', 'crit rate ' + p(ctx._crit / R(ctx, 'G._log.length')) + ' over ' + R(ctx, 'G._log.length') + ' shots (40% without it, ~57% expected)', ctx._crit / R(ctx, 'G._log.length') > 0.48, 'Revolver 20% + Antenna 20% + 1 sure crit / 6s');
  }
  if (chay('dichchuyen')) {
    const r = R(ctx, `(() => { KT.moi(['dichchuyen', 'nam']); const a = KT.dat(2, 'dichchuyen', 2), b = KT.dat(12, 'nam', 2); const ok = hopLeGhep(a, b); ghep(G.ban[0], a, b); const c = KT.dat(4, 'nam', 3); return [ok, G.ban[0].t[12] === a, G.ban[0].t[2] === b, b.sao, a.o, hopLeGhep(a, c)]; })()`);
    ghi('dichchuyen', 'drag onto a same-star turret: SWAP places (no merge, stars kept)', r.slice(0, 5).join('/'), r[0] && r[1] && r[2] && r[3] === 2 && r[4] === 12);
    ghi('dichchuyen', 'different star → cannot swap', String(r[5]), r[5] === false);
    kiemDPS(ctx, 'dichchuyen');
  }
  if (chay('radar')) {
    const v = SAO.map(s => R(ctx, `(() => { KT.moi(); return SKILLS.radar.them(KT.dat(2, 'radar', ${s})); })()`));
    ghi('radar', '+fire rate N/E/S/W: 12% at 1★ → 28% at 7★', v.map(p).join('/'), gan(v[0], 0.12) && gan(v[3], 0.282));
    R(ctx, `KT.moi(); KT.dat(7, 'radar', 5); KT.dat(2, 'lien', 1); KT.dat(1, 'lien', 1); KT.dat(8, 'bang', 1); capNhatBan(G.ban[0], 0);`);
    const c = R(ctx, `[G.ban[0].t[2].buf.toc, G.ban[0].t[1].buf.toc, G.ban[0].t[2].buf.crit, G.ban[0].t[8].buf.toc]`);
    ghi('radar', 'neighbours only; 5★ LOCK-ON +4% crit; also buffs Special turrets (Frost)', 'N ' + p(c[0]) + ' · diag ' + p(c[1]) + ' · crit ' + p(c[2]) + ' · Frost ' + p(c[3]), gan(c[0], 0.228) && c[1] === 0 && gan(c[2], 0.04) && gan(c[3], 0.228));
    R(ctx, `KT.moi(); KT.dat(7, 'radar', 7); KT.dat(2, 'lien', 1); G._mx = 0; G._n = 0; for (let i = 0; i < 60 * 17; i++) { KT.buoc(1 / 60); const v = G.ban[0].t[2].buf.toc; if (v > 0.3) G._n++; G._mx = Math.max(G._mx, v); }`);
    ghi('radar', '7★ OVERDRIVE: every 8s +25% fire rate for 2s — inside the 45% fire-rate cap', 'peak ' + p(R(ctx, 'G._mx')) + ', ' + f(R(ctx, 'G._n') / 60, 1) + 's boosted in 17s (bursts at 8s, 16s)', gan(R(ctx, 'G._mx'), 0.45) && Math.abs(R(ctx, 'G._n') / 60 - 3) < 0.15);
    doDPS(ctx, [[2, 'lien', 1], [7, 'radar', 3]]); const a = ctx._vao; doDPS(ctx, [[2, 'lien', 1]]); const d = a / ctx._vao;
    ghi('radar', 'measured: Gatling next to Radar 3★ fires +17.4% faster', '+' + p(d - 1), Math.abs(d - 1.174) < 0.03);
  }
  if (chay('drone')) {
    for (const s of [1, 3, 6]) {
      R(ctx, `KT.moi(['drone']); const a = KT.dat(2, 'drone', ${s}), b = KT.dat(3, 'drone', ${s}); for (let i = 0; i < 4; i++) KT.dung(KT.quai('bo', 300 + i * 10, 3000)); ghep(G.ban[0], a, b); G.ban[0].t[3] = null; KT.log(1); G._dr = G.hu.filter(o => o.k === 'drone').map(o => o.dmg); G._dk = hsU('drone', ${s + 1}, G.ban[0]) * 24; KT.buoc(12);`);
      const r = R(ctx, `[G._dr.length, G._dr[0], G._dk, G._log.length, G._log.length ? G._log[0].vao : 0]`);
      ghi('drone', 'on merge: 1 + ⌊★/3⌋ bomb drones × 24 (result-star power), 46 px blast', s + '★: ' + r[0] + ' drones × ' + f(r[1], 0) + ', ' + r[3] + ' blast hits', r[0] === 1 + Math.floor(s / 3) && gan(r[1], r[2]) && r[3] >= 3 && gan(r[4], r[2]));
    }
    kiemDPS(ctx, 'drone');
  }
  if (chay('tron')) {
    const t = (ke, s) => R(ctx, `(() => { KT.moi(); KT.dat(7, 'tron', ${s}); ${JSON.stringify(ke)}.forEach(([o, id]) => KT.dat(o, id, 1)); capNhatBan(G.ban[0], 0); return [G.ban[0].t[${ke[0][0]}].buf.toc, G.ban[0].t[${ke[0][0]}].buf.dmg, G.ban[0].t[${ke[0][0]}].buf.crit]; })()`);
    const a1 = t([[2, 'lien']], 1), a4 = t([[2, 'lien'], [6, 'canon'], [8, 'set'], [12, 'sungluc']], 1), a2same = t([[2, 'lien'], [6, 'lien']], 1);
    ghi('tron', '+6% fire rate, +2% per different Attack type (max 12% at 1★)', '1 type ' + p(a1[0]) + ' · 4 types ' + p(a4[0]) + ' · 2 same ' + p(a2same[0]), gan(a1[0], 0.06) && gan(a4[0], 0.12) && gan(a2same[0], 0.06));
    const sp = R(ctx, `(() => { KT.moi(); KT.dat(7, 'tron', 1); KT.dat(2, 'bang', 1); capNhatBan(G.ban[0], 0); return G.ban[0].t[2].buf.toc; })()`);
    ghi('tron', 'Attack neighbours only (Frost not buffed)', p(sp), sp === 0);
    const a5 = t([[2, 'lien'], [6, 'canon'], [8, 'set']], 5), a7 = t([[2, 'lien'], [6, 'canon'], [8, 'set'], [12, 'sungluc']], 7);
    ghi('tron', '5★ MIXED FIRE: 3+ types +3%×K damage · 7★ PERFECT BLEND 4 types +6% crit', '5★ dmg ' + p(a5[1]) + ' · 7★ crit ' + p(a7[2]) + ' · 7★ fire ' + p(a7[0]), gan(a5[1], 0.057) && gan(a7[2], 0.06) && gan(a7[0], 0.282));
    ghi('tron', 'old text "merges with any turret; stars = average" removed', R(ctx, `String(!!SKILLS.tron.ghepDB) + ' / ' + G.rosterMap.tron.kyNang`), !R(ctx, '!!SKILLS.tron.ghepDB') && !/average/i.test(R(ctx, 'G.rosterMap.tron.kyNang')));
  }
  if (chay('nangluong')) {
    for (const m of [0, 240, 600, 2000]) {
      R(ctx, `KT.moi(); const T = KT.dat(2, 'nangluong', 1); KT.quai('bo', 30, 9e4); G.ban[0].mana = ${m}; KT.log(1); KT.buoc(6); const d = dmgU(T); G._k = Math.min(...G._log.map(x => x.vao / d));`);
      const k = R(ctx, 'G._k'), kv = 1 + Math.min(5, m / 120);
      ghi('nangluong', 'damage +100% per 120 current mana (max +500%)', m + ' mana → ×' + f(k, 2), gan(k, kv));
    }
    kiemDPS(ctx, 'nangluong', { ghiChu: '0 mana' });
  }
  if (chay('laser')) {
    R(ctx, `KT.moi(); KT.dat(2, 'laser', 1); KT.dung(KT.quai('bo', 200, 9e4)); KT.buoc(0.5); G._sum = 0; KT.log(1);`);
    const b = []; for (let i = 0; i < 4; i++) { R(ctx, 'G._sum = 0; KT.buoc(1.6);'); b.push(R(ctx, 'G._sum') / 1.6); } // 1.6 s = đúng 6 nhịp gộp sát thương
    const d1 = R(ctx, 'dmgU(G.ban[0].t[2])');
    ghi('laser', 'beam ramps to ×4 over 3s', b.map(x => f(x / d1, 1)).join(' → ') + ' ×', Math.abs(b[3] / d1 - 4) < 0.1 && b[0] / d1 < 2.5 && b.every((x, i) => !i || x >= b[i - 1] - 1e-6));
    ghi('laser', 'beam never crits (crit supports do nothing on Laser)', R(ctx, `G._log.filter(x => x.T === 'laser' && x.r > x.vao * 1.5).length`) + ' crit ticks', R(ctx, `G._log.filter(x => x.T === 'laser' && x.r > x.vao * 1.5).length`) === 0, 'by design (crit:false)');
    R(ctx, `KT.moi(); KT.dat(2, 'laser', 1); const A = KT.dung(KT.quai('bo', 200, 9e4)); KT.buoc(4); G._r1 = G.ban[0].t[2].las.ramp; KT.dung(KT.quai('bo', 260, 9e4)); KT.buoc(0.2); G._r2 = G.ban[0].t[2].las.ramp;`);
    ghi('laser', 'switching target resets the ramp', f(R(ctx, 'G._r1')) + ' → ' + f(R(ctx, 'G._r2')), R(ctx, 'G._r1') === 1 && R(ctx, 'G._r2') < 0.1);
    kiemDPS(ctx, 'laser', { khongCrit: true, dung: true, lt: () => R(ctx, `(() => { const T = G.ban[0].t[2]; return dmgU(T) * 4 * (1 + T.buf.toc + (T.epxung || 0)); })()`), khoi: 4, ghiChu: 'ramped ×4, fire-rate buffs scale it' });
    const oc = R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'laser', 1); T.epxung = 0.65; KT.dung(KT.quai('bo', 200, 9e4)); KT.buoc(5); G._sum = 0; KT.buoc(10); return G._sum / 10 / (dmgU(T) * 4); })()`);
    ghi('laser', 'Overclock +65% fire rate also speeds the beam', '×' + f(oc, 2), Math.abs(oc - 1.65) < 0.03);
    const kp = R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'laser', 1); KT.dung(KT.quai('bo', 200, 9e4)); KT.buoc(5); G._sum = 0; for (let i = 0; i < 600; i++) { T.st.kep = 1; KT.buoc(1 / 60); } return G._sum / 10 / (dmgU(T) * 4); })()`);
    ghi('laser', 'rival Clamp (−40% fire rate, PVP) also slows the beam', '×' + f(kp, 2), Math.abs(kp - 0.6) < 0.03);
  }
  if (chay('lanhgia')) {
    const v = SAO.map(s => R(ctx, `(() => { KT.moi(); return SKILLS.lanhgia.cham(KT.dat(2, 'lanhgia', ${s})); })()`));
    ghi('lanhgia', 'neighbours’ hits slow 8% × star curve (1★ 8% → 7★ 18.8%), 2s', v.map(p).join('/'), gan(v[0], 0.08) && gan(v[3], 0.188));
    R(ctx, `KT.moi(); KT.dat(7, 'lanhgia', 7); KT.dat(2, 'lien', 1); const E = KT.quai('bo', 200, 3000); KT.buoc(2); G._c = [E.cham, E.chamT];`);
    ghi('lanhgia', 'slow applies on hit for 2s', p(R(ctx, 'G._c[0]')) + ', ' + f(R(ctx, 'G._c[1]'), 1) + 's', gan(R(ctx, 'G._c[0]'), 0.188) && R(ctx, 'G._c[1]') > 1.5);
    R(ctx, `KT.moi(); KT.dat(7, 'lanhgia', 7); G.ban[0].lv.lanhgia = 5; KT.dat(2, 'lien', 1); const Bs = KT.trum(250, 50); KT.buoc(3); G._c = Bs.cham;`);
    ghi('lanhgia', 'bosses: full Chiller slow, max 50% (07/11)', p(R(ctx, 'G._c')), R(ctx, 'G._c') > 0.15 && R(ctx, 'G._c') <= 0.5 + 1e-9);
    R(ctx, `KT.moi(); KT.dat(7, 'lanhgia', 1); KT.dat(2, 'lien', 1); const E = KT.dung(KT.quai('bay_bang', 200, 3000)); KT.buoc(2); G._c = [E.cham, E.chamT];`);
    ghi('lanhgia', 'slow-immune enemies get no slow (and no slow timer)', R(ctx, 'G._c').map(x => f(x)).join(' / '), R(ctx, 'G._c[0]') === 0 && !(R(ctx, 'G._c[1]') > 0));
    const l5 = R(ctx, `(() => { KT.moi(); KT.dat(7, 'lanhgia', 5); KT.dat(2, 'lien', 1); capNhatBan(G.ban[0], 0); return G.ban[0].t[2].ht.lanh; })()`);
    ghi('lanhgia', '5★ FROSTNIP: +5%×K damage vs slowed', p(l5), gan(l5, 0.095));
    R(ctx, `KT.moi(); KT.dat(7, 'lanhgia', 7); KT.dat(2, 'lien', 1); KT.quai('bo', 200, 3000); G._fz = []; let cu = 0; for (let i = 0; i < 60 * 25; i++) { KT.buoc(1 / 60); const E = G.quai[0]; if (E.chan > 0 && !cu) G._fz.push(+G.t.toFixed(1)); cu = E.chan > 0; }`);
    const fz = R(ctx, 'G._fz');
    ghi('lanhgia', '7★ FLASH FREEZE: every 8s a hit freezes 0.8s', fz.join(', ') + 's', fz.length >= 2 && Math.abs(fz[1] - fz[0] - 8) < 0.5);
    R(ctx, `KT.moi(); KT.dat(2, 'lien', 1); KT.dat(7, 'lanhgia', 5); KT.quai('bo', 200, 9e4); KT.buoc(1); KT.log(1); KT.buoc(5); G._k = Math.min(...G._log.slice(2).map(x => x.r / x.vao));`);
    ghi('lanhgia', 'measured: Gatling hit on a slowed enemy next to Chiller 5★ = +9.5%', 'hit ×' + f(R(ctx, 'G._k'), 3), gan(R(ctx, 'G._k'), 1.095));
  }
  if (chay('mortar')) {
    kiemDPS(ctx, 'mortar', { lt: () => R(ctx, `(() => { const T = G.ban[0].t[2], c = critU(T); return dmgU(T) * tocU(T) * ((1 + c) + 0.45) * (mocChung(T, 5) ? 4 / 3.12 : 1); })()`), T: 60, ghiChu: 'single target + every 3rd shell 3 bomblets ×45% land on it' });
    R(ctx, `KT.moi(); const T = KT.dat(2, 'mortar', 1); for (let i = 0; i < 8; i++) KT.dung(KT.quai('bo', 60 + i * 50, 3000)); KT.log(1); KT.buoc(12); G._sh = T.banLan; G._ph = G._log.filter(x => x.phu).length; G._mo = [0, 1, 2].map(b => SKILLS.mortar.mo({ banLan: b, sao: 1 }));`);
    ghi('mortar', 'every 3rd shell is a CLUSTER (3 bomblets ×45%)', R(ctx, 'G._sh') + ' shells → ' + R(ctx, 'G._ph') + ' bomblet hits', R(ctx, 'G._ph') > 0);
    const mo = R(ctx, 'G._mo');
    ghi('mortar', 'info line "cluster shell in N" counts down 3 → 2 → 1', mo.map(s => s.split('in ')[1]).join(' → '), mo.map(s => s.split('in ')[1]).join() === '3,2,1');
    const n = R(ctx, `new Set(G._log.filter(x => !x.phu).map(x => x.E)).size`);
    ghi('mortar', 'shells random enemies, 46 px splash', n + ' different enemies hit', n >= 4);
  }
  if (chay('khuech')) {
    const v = SAO.map(s => R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'khuech', ${s}); return [SKILLS.khuech.buoc(T), SKILLS.khuech.max(T)]; })()`));
    ghi('khuech', '+9%×K damage per consecutive hit on the same enemy, max 5 stacks (5★ 7)', v.map(([a, b]) => p(a) + '×' + b).join(' / '), gan(v[0][0], 0.09) && v[2][1] === 7);
    for (const id of ['lien', 'sungluc', 'tia']) {
      R(ctx, `KT.moi(); KT.dat(7, 'khuech', 1); KT.dat(2, '${id}', 1); const E = KT.quai('bo', 30, 9e4); KT.log(1); KT.buoc(${id === 'tia' ? 30 : 14});`);
      const h = R(ctx, `G._log.slice(0, 8).map(x => +(x.r / x.vao / (x.r > x.vao * 1.8 ? 2 : 1)).toFixed(3))`);
      ghi('khuech', 'stacks grow per hit then cap at 35% (shared damage cap) — ' + id + (id !== 'lien' ? ' (slow gun)' : ''), h.join(' → '), gan(h[0], 1) && gan(h[1], 1.09) && gan(h[3], 1.27) && h.slice(4).every(x => gan(x, 1.35)));
    }
    R(ctx, `KT.moi(); KT.dat(7, 'khuech', 1); KT.dat(2, 'lien', 1); const E = KT.quai('bo', 30, 9e4); KT.buoc(3); const T = G.ban[0].t[2]; const st = T._amp.get(E.uid).n; for (let i = 0; i < 120; i++) { T.cd = 1; KT.buoc(1 / 60); } KT.log(1); T.cd = 0; KT.buoc(0.6); G._a = [st, G._log[0].r / G._log[0].vao];`);
    ghi('khuech', 'stacks fade after a 1.5s+ pause', R(ctx, 'G._a[0]') + ' stacks → after 2s pause ×' + f(R(ctx, 'G._a[1]') > 1.8 ? R(ctx, 'G._a[1]') / 2 : R(ctx, 'G._a[1]'), 2), R(ctx, 'G._a[0]') === 5 && gan(R(ctx, 'G._a[1]') > 1.8 ? R(ctx, 'G._a[1]') / 2 : R(ctx, 'G._a[1]'), 1));
    R(ctx, `KT.moi(); KT.dat(7, 'khuech', 7); KT.dat(2, 'sungluc', 1); capNhatBan(G.ban[0], 0); G._a = G.ban[0].t[2].ht;`);
    ghi('khuech', '7★ LOCKED IN: stacks last 3s', 'ampGiu ' + R(ctx, 'G._a.ampGiu'), R(ctx, 'G._a.ampGiu') === 1);
    R(ctx, `KT.moi(); KT.dat(7, 'khuech', 1); KT.dat(2, 'bang', 1); KT.dat(6, 'mana', 1); capNhatBan(G.ban[0], 0); G._a = [!!G.ban[0].t[2].ht, !!G.ban[0].t[6].ht];`);
    ghi('khuech', 'Attack neighbours only', R(ctx, 'G._a').join('/'), R(ctx, 'G._a').join() === 'false,false');
  }
  if (chay('vungdoc')) {
    const k = SAO.map(s => R(ctx, `[SKILLS.vungdoc.ky({ sao: ${s} }), Math.round((30 + 2 * ${s}) * (${s} >= 7 ? 1.5 : 1))]`));
    ghi('vungdoc', 'a pool every 4.6−0.2×★ s (min 2.6), radius 30+2×★ px (7★ ×1.5)', k.map(([a, b], i) => SAO[i] + '★ ' + f(a, 1) + 's/' + b + 'px').join(' · '), gan(k[0][0], 4.4) && gan(k[3][0], 3.2) && k[3][1] === 66);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'vungdoc', 1); T.nap = 1; const E = KT.dung(KT.quai('bo', 200, 3000)); KT.buoc(2); T.nap = -99; G._sum = 0; KT.buoc(2); G._d = G._sum / 2; G._lt = dmgU(T) * 3.5; G._pool = G.hu.filter(o => o.k === 'may').length;`);
    ghi('vungdoc', 'pool poisons enemies on it: 3.5 × damage per second, 5s', f(R(ctx, 'G._d'), 1) + '/s (formula ' + f(R(ctx, 'G._lt'), 1) + ')', Math.abs(R(ctx, 'G._d') / R(ctx, 'G._lt') - 1) < 0.08);
    R(ctx, `KT.buoc(5); G._d2 = G.quai[0].doc;`);
    ghi('vungdoc', 'poison stops after the pool/linger ends (no stale poison)', 'poison dps left ' + f(R(ctx, 'G._d2')), !(R(ctx, 'G._d2') > 0));
    R(ctx, `KT.moi(); const T = KT.dat(2, 'vungdoc', 3); T.nap = 1; KT.dung(KT.quai('bo', 250, 3000)); KT.buoc(2); G._n = G.hu.filter(o => o.k === 'may').length;`);
    ghi('vungdoc', '3★ TWIN POOLS', R(ctx, 'G._n') + ' pools', R(ctx, 'G._n') === 2);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'vungdoc', 5); T.nap = 1; const E = KT.dung(KT.quai('bo', 250, 3000)); KT.buoc(2.2); G._v = HOTRO.vuln(E);`);
    ghi('vungdoc', '5★ CORROSION: +15% damage taken', p(R(ctx, 'G._v')), gan(R(ctx, 'G._v'), 0.15));
    R(ctx, `KT.moi(); KT.dat(2, 'doc', 1); G.ban[0].t[2].nap = 1; const E = KT.dung(KT.quai('bo', 250, 3000)); E.doc = 50; E.docT = 0.01; KT.buoc(3); G._v = [E.doc, G.hu.length];`);
    ghi('vungdoc', 'old pool poison does not come back when Venom marks the enemy', 'poison dps ' + R(ctx, 'G._v[0]'), !(R(ctx, 'G._v[0]') > 0));
  }
  if (chay('loa')) {
    const r = R(ctx, `(() => { KT.moi(['loa']); const B = G.ban[0]; B.mv.cd = 20; ghep(B, KT.dat(2, 'loa', 2), KT.dat(3, 'loa', 2)); const a = B.mv.cd; B.mv.cd = 0; B.mv.gia = 120; ghep(B, KT.dat(4, 'loa', 1), KT.dat(5, 'loa', 1)); const g = B.mv.gia; B.mv.gia = 30; ghep(B, KT.dat(6, 'loa', 1), KT.dat(7, 'loa', 1)); return [a, g, B.mv.gia]; })()`);
    ghi('loa', 'on merge: Archfiend cooldown −(3 + 1.5×★)s; if ready: cost −15% (not below base)', 'cd 20→' + r[0] + ' (2★) · cost 120→' + r[1] + ' · base 30→' + r[2], r[0] === 14 && r[1] === 102 && r[2] === 30);
    kiemDPS(ctx, 'loa');
  }
  if (chay('hutmana')) {
    kiemDPS(ctx, 'hutmana');
    for (const s of [1, 3, 7]) {
      R(ctx, `KT.moi(); const T = KT.dat(2, 'hutmana', ${s}); KT.quai('bo', 30, 9e4); G.ban[0].mana = 0; KT.log(1); KT.buoc(40);`);
      const r = R(ctx, `(() => { const T = G.ban[0].t[2], n = G._log.length; return [G.ban[0].mana / 40, SKILLS.hutmana.luong(T) * n / 40, SKILLS.hutmana.luong(T), SKILLS.hutmana.tran(T)]; })()`);
      const kv = Math.min(r[1], r[3]);
      ghi('hutmana', 'each hit +mana (0.35 +0.15/★), never above the per-second cap (1.2 +0.3/★)', s + '★: ' + f(r[0]) + '/s (hits give ' + f(r[1]) + '/s, cap ' + f(r[3], 1) + ')', r[0] <= r[3] + 1e-9 && r[0] >= kv * 0.72);
    }
  }
  if (chay('min')) {
    const k = SAO.map(s => R(ctx, `[SKILLS.min.ky({ sao: ${s} }), 0.03 + 0.005 * (${s} - 1)]`));
    ghi('min', 'a mine every 4−0.2×★ s (min 2s); star mine chance 3% +0.5%/★', k.map(([a, b], i) => SAO[i] + '★ ' + f(a, 1) + 's/' + p(b)).join(' · '), gan(k[0][0], 3.8) && gan(k[3][0], 2.6));
    R(ctx, `KT.moi(); const T = KT.dat(2, 'min', 1); T.nap = 1; KT.dung(KT.quai('bo', 30, 3000)); KT.buoc(1.5); T.nap = -99; G._m = G.hu.find(o => o.k === 'min'); G._r = G._m ? [G._m.dmg / dmgU(T), G._m.r] : [0, 0];`);
    const r = R(ctx, 'G._r');
    ghi('min', 'mine = 7 × damage, 36 px blast (star mine ×3)', '×' + f(r[0], 2) + ', ' + r[1] + ' px', (gan(r[0], 7) || gan(r[0], 21)) && r[1] === 36);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'min', 7); T.nap = 1; KT.dung(KT.quai('bo', 30, 3000)); KT.buoc(40); G._n = G.hu.filter(o => o.k === 'min' && o.T === T).length;`);
    ghi('min', 'at most 6 mines out at once', R(ctx, 'G._n') + ' mines after 40s', R(ctx, 'G._n') === 6);
    R(ctx, `KT.moi(); const T = KT.dat(2, 'min', 1); T.nap = 1; const E = KT.dung(KT.quai('bo', 30, 3000)); KT.buoc(1.5); T.nap = -99; const M = G.hu.find(o => o.k === 'min'); E.s = 0; E.d = Object.assign({}, E.d, { v: 60 }); KT.log(1); KT.buoc(8); G._h = [G._log.length, G._log.length ? G._log[0].vao / M.dmg : 0, G._log.length ? G._log[0].T : ''];`);
    ghi('min', 'walking onto a mine blows it up (Mine Layer gets the hit)', R(ctx, 'G._h').join(' / '), R(ctx, 'G._h[0]') >= 1 && gan(R(ctx, 'G._h[1]'), 1) && R(ctx, 'G._h[2]') === 'min');
  }
  // ===================================================== Ụ HỖ TRỢ THƯỜNG (Breaker / Hammer) =====================================================
  if (chay('phagiap')) {
    R(ctx, `KT.moi(); const T = KT.dat(7, 'phagiap', 1); T.nap = 1; KT.dat(2, 'lien', 1); KT.dat(6, 'bang', 1); const A = KT.dung(KT.quai('bo', 300, 3000)); const B2 = KT.dung(KT.quai('bo', 100, 6000)); const C = KT.dung(KT.quai('bo', 60, 3000)); KT.buoc(0.1); G._l = [A.loT, B2.loT, C.loT || 0];`);
    const l = R(ctx, 'G._l');
    ghi('phagiap', 'every 3s EXPOSES the lead + the toughest enemy for 6s', l.map(x => f(x, 1)).join(' / ') + ' s', l[0] > 5.8 && l[1] > 5.8 && l[2] === 0);
    R(ctx, `capNhatBan(G.ban[0], 0); G._h = [G.ban[0].t[2].ht && G.ban[0].t[2].ht.lo, G.ban[0].t[6].ht];`);
    ghi('phagiap', 'Attack neighbours +13% vs exposed (Frost neighbour gets nothing)', p(R(ctx, 'G._h[0]')) + ' / ' + R(ctx, 'G._h[1]'), gan(R(ctx, 'G._h[0]'), 0.13) && !R(ctx, 'G._h[1]'));
    const so = R(ctx, `[SKILLS.phagiap.so({ sao: 1 }), SKILLS.phagiap.so({ sao: 5 })]`);
    ghi('phagiap', '5★ DOUBLE EXPOSE: 3 enemies', so.join('/'), so.join() === '2,3');
    R(ctx, `KT.moi(); const T = KT.dat(7, 'phagiap', 7); T.nap = 1; const A = KT.dung(KT.quai('bo', 300, 3000)); KT.buoc(0.1); G._v = HOTRO.vuln(A);`);
    ghi('phagiap', '7★ SHATTERED GUARD: exposed take +8% from all', p(R(ctx, 'G._v')), gan(R(ctx, 'G._v'), 0.08));
    R(ctx, `KT.moi(); KT.dat(2, 'sungluc', 1); const T = KT.dat(7, 'phagiap', 3); T.nap = 1; KT.quai('bo', 30, 9e4); KT.buoc(1); KT.log(1); KT.buoc(10); G._k = G._log.map(x => x.r / x.vao); G._k = [Math.min(...G._k), Math.max(...G._k)];`);
    ghi('phagiap', 'measured: Revolver hit on the exposed lead next to Breaker 3★ = +18.9%', 'hit ×' + R(ctx, 'G._k').map(x => f(x, 3)).join(' / ×'), gan(R(ctx, 'G._k[0]'), 1.1885));
  }
  if (chay('bua')) {
    const v = SAO.map(s => R(ctx, `(() => { KT.moi(); const T = KT.dat(2, 'bua', ${s}); return [SKILLS.bua.crit(T), SKILLS.bua.cd(T), SKILLS.bua.soc(T)]; })()`));
    ghi('bua', 'Attack neighbours +5%×K crit, +30%×K crit damage (cap 50%), stagger 0.2s (7★ 0.35s)', v.map(([a, b, c], i) => SAO[i] + '★ ' + p(a) + '/' + p(Math.min(0.5, b)) + '/' + c + 's').join(' · '), gan(v[0][0], 0.05) && gan(v[0][1], 0.3) && v[2][1] >= 0.5 && v[3][2] === 0.35);
    R(ctx, `KT.moi(); KT.dat(7, 'bua', 1); KT.dat(2, 'sungluc', 1); const E = KT.dung(KT.quai('bo', 220, 9e4)); const Q = KT.dung(KT.quai('khong_lo', 200, 9e4)); G._st = 0; G._big = 0; for (let i = 0; i < 60 * 60; i++) { const c = E.chan; KT.buoc(1 / 60); if (E.chan > c + 0.1) G._st++; if (Q.chan > 0.05) G._big++; }`);
    ghi('bua', 'neighbours’ crits stagger normal enemies (3s immunity)', R(ctx, 'G._st') + ' staggers in 60s', R(ctx, 'G._st') > 2 && R(ctx, 'G._st') <= 20);
    R(ctx, `KT.moi(); KT.dat(7, 'bua', 1); KT.dat(2, 'sungluc', 1); const Q = KT.dung(KT.quai('khong_lo', 220, 9e4)); G._big = 0; for (let i = 0; i < 60 * 60; i++) { KT.buoc(1 / 60); if (Q.chan > 0.05) G._big++; } KT.moi(); KT.dat(7, 'bua', 7); KT.dat(2, 'sungluc', 1); const Q2 = KT.dung(KT.quai('khong_lo', 220, 9e4)); G._big7 = 0; for (let i = 0; i < 60 * 60; i++) { KT.buoc(1 / 60); if (Q2.chan > 0.05) G._big7++; }`);
    ghi('bua', 'big enemies: no stagger below 7★; 7★ QUAKE staggers them too', 'stunned frames 1★ ' + R(ctx, 'G._big') + ' · 7★ ' + R(ctx, 'G._big7'), R(ctx, 'G._big') === 0 && R(ctx, 'G._big7') > 0);
    R(ctx, `KT.moi(); KT.dat(2, 'sungluc', 1); KT.dat(7, 'bua', 5); KT.quai('bo', 30, 9e4); KT.buoc(1); KT.log(1); KT.buoc(600); const ds = G._log.map(x => x.r / x.vao); G._k = [Math.max(...ds), ds.filter(x => x > 1.5).length / ds.length];`);
    ghi('bua', 'measured: Revolver next to Hammer 5★: crit hit ×2.5 (cap), crit rate 29.5%', 'crit ×' + f(R(ctx, 'G._k[0]'), 2) + ', rate ' + p(R(ctx, 'G._k[1]')), gan(R(ctx, 'G._k[0]'), 2.5) && Math.abs(R(ctx, 'G._k[1]') - 0.295) < 0.05);
  }
  // ===================================================== HỆ THỐNG HỖ TRỢ CHUNG (hotro.js) =====================================================
  if (chay('hotro')) {
    const K = R(ctx, 'HOTRO.K.slice(1)');
    ghi('hotro', 'star curve 1.00/1.20/1.45/1.65/1.90/2.10/2.35', K.join('/'), K.join() === '1,1.2,1.45,1.65,1.9,2.1,2.35');
    const lv = R(ctx, `(() => { KT.moi(); G.ban[0].lv.radar = 5; return HOTRO.k(KT.dat(2, 'radar', 3)); })()`);
    ghi('hotro', 'in-match LV: +6% per level', f(lv, 3) + ' (3★ LV5)', gan(lv, 1.45 * 1.24));
    const o = R(ctx, `[HOTRO.oDich({ id: 'radar', o: 7 }), HOTRO.oDich({ id: 'radar', o: 0 }), HOTRO.oDich({ id: 'luoicheo', o: 7 }), HOTRO.oDich({ id: 'luoicheo', o: 5 })]`);
    ghi('hotro', 'shape: 4 straight cells; Resonance Grid: 4 diagonal cells; board edge clips', o.map(x => '[' + x.join(',') + ']').join(' '), o[0].join() === '6,8,2,12' && o[1].join() === '1,5' && o[2].join() === '1,3,11,13' && o[3].join() === '1,11');
    R(ctx, `KT.moi(); KT.dat(7, 'radar', 1); KT.dat(8, 'chimang', 1); KT.dat(6, 'radar', 7); capNhatBan(G.ban[0], 0); G._s = [G.ban[0].t[7].buf.toc, G.ban[0].t[8].buf.crit, G.ban[0].t[6].buf.toc];`);
    ghi('hotro', 'supports never buff themselves or other supports', R(ctx, 'G._s').join('/'), R(ctx, 'G._s').every(x => x === 0));
    R(ctx, `KT.moi(); KT.dat(2, 'lien', 1); KT.dat(7, 'radar', 1); KT.dat(1, 'radar', 7); KT.dat(3, 'radar', 3); capNhatBan(G.ban[0], 0); G._s = G.ban[0].t[2].buf.toc;`);
    ghi('hotro', 'several copies of one support type → only the strongest counts', p(R(ctx, 'G._s')) + ' (7★ alone 28.2%)', gan(R(ctx, 'G._s'), 0.282));
    R(ctx, `KT.moi(); KT.dat(7, 'lien', 1); KT.dat(2, 'radar', 7); KT.dat(6, 'tron', 7); KT.dat(8, 'luoicheo', 1); KT.dat(12, 'nangsao', 7); capNhatBan(G.ban[0], 0); G._s = [G.ban[0].t[7].buf.toc, G.ban[0].t[7].ht.daMax.toc];`);
    ghi('hotro', 'different types add up, fire-rate cap 45%', p(R(ctx, 'G._s[0]')) + ' (cap hit ' + R(ctx, 'G._s[1]') + ')', gan(R(ctx, 'G._s[0]'), 0.45) && R(ctx, 'G._s[1]') === 1);
    R(ctx, `KT.moi(); KT.dat(7, 'sungluc', 1); KT.dat(2, 'chimang', 7); KT.dat(6, 'bua', 7); KT.dat(8, 'radar', 5); KT.dat(12, 'thaukinh', 7); capNhatBan(G.ban[0], 0); const T = G.ban[0].t[7]; G._s = [T.buf.crit, T.buf.cdmg, critU(T)];`);
    ghi('hotro', 'crit +20 points cap, crit damage +50% cap', p(R(ctx, 'G._s[0]')) + ' / ' + p(R(ctx, 'G._s[1]')) + ' (total crit ' + p(R(ctx, 'G._s[2]')) + ')', gan(R(ctx, 'G._s[0]'), 0.2) && gan(R(ctx, 'G._s[1]'), 0.5));
    R(ctx, `KT.moi(); KT.dat(7, 'sungluc', 1); KT.dat(2, 'luoicheo', 1); KT.dat(8, 'phagiap', 7); KT.dat(6, 'khuech', 7); KT.dat(12, 'lanhgia', 7); capNhatBan(G.ban[0], 0); const T = G.ban[0].t[7]; const E = KT.dung(KT.quai('bo', 200, 3000)); E.loT = 5; E.cham = 0.2; E.chamT = 5; G._s = [T.buf.dmg, HOTRO.dkHeSo(T, E), HOTRO.dkHeSo(T, E), HOTRO.dkHeSo(T, E)];`);
    ghi('hotro', 'conditional damage (exposed/slowed/stacks) shares the 35% damage cap with plain +damage', 'plain ' + p(R(ctx, 'G._s[0]')) + ' → conditional ×' + R(ctx, 'G._s.slice(1)').map(x => f(x, 3)).join('/'), R(ctx, 'G._s.slice(1)').every(x => x <= 1.35 - R(ctx, 'G._s[0]') + 1e-9 + 1) && gan(R(ctx, 'G._s[3]') + R(ctx, 'G._s[0]'), 1.35));
    R(ctx, `KT.moi(); KT.dat(7, 'lien', 1); KT.dat(2, 'lanhgia', 7); G.ban[0].lv.lanhgia = 5; KT.dat(12, 'lophanung', 7); capNhatBan(G.ban[0], 0); G._s = G.ban[0].t[7].buf.cham;`);
    ghi('hotro', 'slow from supports: strongest only, cap 35%', p(R(ctx, 'G._s')), R(ctx, 'G._s') <= 0.35 + 1e-9);
    R(ctx, `KT.moi(); const E = KT.dung(KT.quai('bo', 200, 3000)); E.vmT = 5; E.vmK = 0.12; E.ywT = 5; E.ywK = 0.1; E.loT = 5; E.loV = 0.08; E.yeu = 5; E.tpT = 5; E.tpK = 0.15; G._v = HOTRO.vuln(E);`);
    ghi('hotro', 'enemy weakness (Venom 12 + Time Bomb 10 + Breaker 7★ 8 + Toxic 15) adds up with no cap (07/11) = 45%', p(R(ctx, 'G._v')), gan(R(ctx, 'G._v'), 0.45));
    R(ctx, `KT.moi(); const T = KT.dat(7, 'sungluc', 1); KT.dat(2, 'luoicheo', 7); KT.dat(8, 'khuech', 7); KT.dat(6, 'radar', 7); capNhatBan(G.ban[0], 0); const a = dmgU(T); G.ban[0].cuong = 5; capNhatBan(G.ban[0], 0); G._s = [dmgU(T) / a, T.buf.dmg];`);
    ghi('hotro', 'commander RAGE ×2 stacks on top of capped support buffs (not inside the cap)', '×' + f(R(ctx, 'G._s[0]'), 3) + ' with +' + p(R(ctx, 'G._s[1]')) + ' support damage', gan(R(ctx, 'G._s[0]'), 2));
    const vong = [[7, 'sungluc', 1], [2, 'khuech', 7], [6, 'radar', 7], [8, 'tron', 7], [12, 'phagiap', 7]];
    R(ctx, 'KT.moi()'); doDPS(ctx, vong, { truoc: 'G.ban[0].cuong = 1e9;' }); const v1 = ctx._vao;
    doDPS(ctx, vong); const v0 = ctx._vao;
    ghi('hotro', 'measured: full support ring + RAGE → pre-crit damage exactly ×2 (support multipliers unchanged)', '×' + f(v1 / v0, 3), gan(v1 / v0, 2, 0.02));
    // milestones
    const m = R(ctx, `(() => { KT.moi(); const a = KT.dat(0, 'lien', 3), b = KT.dat(4, 'radar', 3), c = KT.dat(10, 'bang', 3), d = KT.dat(14, 'mana', 3); capNhatBan(G.ban[0], 0); return [a.buf.toc, b.buf.toc, heSoMocDmg(KT.dat(2, 'lien', 7)), heSoMocDmg(KT.dat(12, 'radar', 7)), themMocCrit(KT.dat(12, 'radar', 7)), heSoMocDmg(KT.dat(7, 'laser', 5))]; })()`);
    ghi('hotro', 'milestones: 3★ +20% fire (not supports) · 7★ +30% dmg (not supports) · 5★ OVERCHARGE +25% (beam/pool types)', m.map(x => f(x, 2)).join('/'), gan(m[0], 0.2) && m[1] === 0 && gan(m[2], 1.3) && m[3] === 1 && m[4] === 0 && gan(m[5], 1.25));
    R(ctx, `KT.moi(); const T = KT.dat(2, 'sungluc', 5); KT.quai('bo', 30, 9e4); KT.buoc(1); T.banLan = 0; G._tt = []; KT.log(1); KT.buoc(20); G._tt = G._log.length;`);
    ghi('hotro', '5★ DOUBLE TAP: every 4th attack fires twice', R(ctx, 'G._tt') + ' shots in 20s (no DT ' + f(20 * R(ctx, 'tocU(G.ban[0].t[2])'), 0) + ')', Math.abs(R(ctx, 'G._tt') / (20 * R(ctx, 'tocU(G.ban[0].t[2])')) - 4 / 3.12) < 0.06);
    // Resonance Grid diagonal + resonance
    R(ctx, `KT.moi(); KT.dat(7, 'luoicheo', 1); KT.dat(1, 'lien', 1); KT.dat(3, 'lien', 1); KT.dat(11, 'lien', 1); KT.dat(2, 'lien', 1); capNhatBan(G.ban[0], 0); G._a = [G.ban[0].t[1].buf.dmg, G.ban[0].t[2].buf.dmg]; KT.dat(13, 'canon', 1); capNhatBan(G.ban[0], 0); G._b = G.ban[0].t[1].buf.dmg;`);
    ghi('hotro', 'Resonance Grid: +8% to diagonals only; all 4 diagonals filled → RESONANCE ×1.5', 'diag ' + p(R(ctx, 'G._a[0]')) + ' · straight ' + p(R(ctx, 'G._a[1]')) + ' · full ' + p(R(ctx, 'G._b')), gan(R(ctx, 'G._a[0]'), 0.08) && R(ctx, 'G._a[1]') === 0 && gan(R(ctx, 'G._b'), 0.12));
    const rm = R(ctx, `(() => { KT.moi(); const T = KT.dat(7, 'luoicheo', 7); return SKILLS.luoicheo.mo(T); })()`);
    ghi('hotro', 'Resonance Grid 7★ info: fire-rate ×1.5 shown only when resonance is full', rm, /\+12% fire rate/.test(rm));
    // DCDW: KHÔNG có sàn Tấn công — Triệu hồi chọn đều trong 5 thẻ (bộ 1 Tấn công + 4 Hỗ trợ, 10k lần → mỗi thẻ ≈ 20% ±2%)
    const deu = R(ctx, `(() => { const D = ['lien', 'radar', 'chimang', 'phagiap', 'bua']; const B = KT.moi(D); const dem = {}; D.forEach(id => dem[id] = 0); for (let i = 0; i < 10000; i++) { B.t.fill(null); const T = trieu(B, true); dem[T.id]++; G.hu.length = 0; } return D.map(id => [id, SKILLS[id].vai, dem[id] / 100]); })()`);
    ghi('hotro', 'Summon is uniform over the deck (no Attack floor): 1 Attack + 4 Support, 10k summons → each ≈ 20% ±2%', deu.map(x => x[0] + '(' + x[1] + ') ' + x[2].toFixed(1) + '%').join(' · '), deu.every(x => Math.abs(x[2] - 20) <= 2) && deu.filter(x => x[1] === 'tc').length === 1);
    const tw = R(ctx, `(() => { const D = ['lien', 'radar', 'chimang', 'phagiap', 'bua']; const B = KT.moi(D); let tc = 0, n = 0; for (let i = 0; i < 4000; i++) { B.t.fill(null); const T = sinhDoi(B, 1, 0); if (T) { n++; if (SKILLS[T.id].vai === 'tc') tc++; } G.hu.length = 0; } return [tc, n]; })()`);
    ghi('hotro', 'Twin Maker extra turret is uniform over the deck too (Attack ≈ 20%)', tw[0] + '/' + tw[1] + ' Attack', tw[1] > 3000 && Math.abs(tw[0] / tw[1] - 0.2) <= 0.025);
  }

  // ===================================================== mọi ụ trong bộ: 60 s SOLO/CO-OP/PVP không lỗi + dòng thông tin =====================================================
  if (chay('che')) {
    const BO = R(ctx, `G.roster.filter(r => r.bac === 'trang' || r.bac === 'xanh').map(r => r.id)`);
    let loi = [];
    for (const id of BO) for (const s of SAO) {
      const mo = R(ctx, `(() => { KT.moi(); const T = KT.dat(7, '${id}', ${s}); KT.dat(2, 'lien', ${s}); capNhatBan(G.ban[0], 0); const sk = SKILLS['${id}']; return (sk.mo ? sk.mo(T) : '') + ' | ' + tocTT('${id}', T) + ' | ' + mocCua('${id}').map(m => m.ten + ' ' + m.mo).join(' · '); })()`);
      if (/NaN|undefined|null/.test(mo)) loi.push(id + s + ': ' + mo);
    }
    ghi('(all)', 'info panel lines (skill / fire rate / milestones) at 1/3/5/7★ have no NaN/undefined', loi.length ? loi.slice(0, 3).join(' ; ') : BO.length + ' turrets × 4 stars clean', !loi.length);
    loi = [];
    for (const mode of ['solo', 'coop', 'pvp']) for (const id of BO) {
      try {
        ctx._deck = [id, 'lien', 'canon', 'radar', 'set']; ctx._che = mode;
        R(ctx, `G._vongKT = false; G.debug = { auto: true, mana: 3000, wave: 9, fill: 5 }; batDau(_che, _deck, 'hero');`);
        R(ctx, `KT.buoc(60)`);
      } catch (e) { loi.push(mode + ' ' + id + ': ' + String(e.stack).split('\n').slice(0, 2).join(' ')); }
    }
    ghi('(all)', 'SOLO / CO-OP / PVP 60s with each Common/Rare turret in deck: no errors', loi.length ? loi.slice(0, 2).join(' ; ') : BO.length * 3 + ' runs clean', !loi.length);
  }
}

main();
const sai = KQ.filter(x => !x.ok);
if (process.argv[2] === 'md') {
  console.log('| Turret | Claim | Measured | Status | Note |'); console.log('|---|---|---|---|---|');
  for (const x of KQ) console.log('| ' + x.u + ' | ' + x.claim.replace(/\|/g, '/') + ' | ' + x.measured.replace(/\|/g, '/') + ' | ' + (x.ok ? 'OK' : '**FAIL**') + ' | ' + x.note.replace(/\|/g, '/') + ' |');
} else {
  for (const x of KQ) console.log((x.ok ? '  OK  ' : ' FAIL ') + x.u.padEnd(11) + x.claim + '  →  ' + x.measured + (x.note ? '  [' + x.note + ']' : ''));
}
console.log('\n' + (KQ.length - sai.length) + '/' + KQ.length + ' checks passed' + (sai.length ? ' — ' + sai.length + ' FAIL' : ''));
if (sai.length) process.exitCode = 1;
