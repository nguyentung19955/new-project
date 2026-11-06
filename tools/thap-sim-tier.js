// TURRET MERGE — ĐO SỨC MẠNH THEO BẬC (trắng < xanh < tím < vàng < đỏ) cho MỌI ụ (93), ở 1★ / 4★ / 7★, cấp thẻ đầu (LV start), không power-up
//   node tools/thap-sim-tier.js            → bảng đầy đủ → docs/demo-hop-tuong/tuvan/tier/BANG.md (+ bang.json)
//   node tools/thap-sim-tier.js json out.json  → chỉ ghi số liệu (dùng cho thap-kt-tier.js)
//   NHANH=1 → bỏ phép thử bộ bài (song), ít hạt giống hơn
// Giá trị V (đơn vị = "bằng bao nhiêu ụ Tấn công TRẮNG trung vị ở cùng số sao"); chỉ số SỨC MẠNH P = V / trung vị V của ụ TRẮNG CÙNG VAI TRÒ:
//   · Tấn công (tc): DPS một mình — trung bình nhân của (1 quái KHỔNG LỒ máu ×4.5 → ~20× quái thường) và (đám đông ≤10 quái wave 20, máu ×2),
//     máu quái ×(1+0.85·(★−1)), quái đi vòng (không lọt). Ụ giết-ngay / %máu (Guillotine, Nemesis) nhạy kịch bản → xem cột ghi chú.
//   · Tấn công: P = một mình (cột 'bàn chuẩn' + 'bộ bài' chỉ để tham khảo — ụ cộng hưởng theo bàn như Quantum Choir / Star Cannon).
//   · Hỗ trợ (ht) / Đặc biệt (db): BÀN CHUẨN — 4 ụ Tấn công trắng (lien/canon/set/sungluc, cùng ★) quanh ô 7, ụ thử ở ô 7; quái vào 2/s, CÓ LỌT
//     (khống chế = quái ở lâu trong tầm = thêm sát thương). P = sát thương THÊM so với bàn không có ụ thử / sát thương thêm của ụ trắng trung vị.
//   · Đặc biệt còn đo BỘ BÀI: bot tự chơi SOLO với [lien, canon, set, sungluc, X] → wave đạt được; quy ra sức mạnh của X:
//     sức bộ ≈ 1.15^(wave − wave chuẩn) (máu quái ×1.15/wave) → P_bo = 5·1.15^(Δwave) − 4. Ụ Đặc biệt: P = max(bàn chuẩn, bộ bài) (ụ kinh tế / ghép sao chỉ hiện ở bộ bài).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7'];
function taoMoiTruong(hat) {
  const noop = () => {};
  let s = hat || 12345;
  const M = Object.create(Math); M.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const hat0 = s;
  const ctx = { console: { log: noop, warn: noop, error: console.error }, Math: M, JSON, Set, Map, WeakMap, Promise, Object, Array, Number, String, Infinity, NaN, isFinite, parseInt, parseFloat, Symbol, Proxy, Reflect, Error, Date,
    setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, setInterval: noop, requestAnimationFrame: noop, _cho: [], performance: { now: () => 0 }, location: { search: '', hash: '' }, localStorage: { getItem: () => null, setItem: noop }, navigator: { userAgent: '' } };
  ctx.window = ctx; ctx.document = { createElement: () => ({ getContext: () => ({}), style: {} }), querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener: noop, body: { appendChild: noop } };
  ctx.addEventListener = noop; ctx.Image = function () {};
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null };
  ctx.UI = new Proxy({ xemHT: null }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.FONT = { display: 'x', ui: 'x' };
  ctx.buffNo = noop; ctx.BVX = new Proxy({}, { get: () => noop });
  ctx._gieo = (k) => { s = (hat0 + k * 2654435761) >>> 0; };
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  if (process.env.CB) { const o = JSON.parse(fs.readFileSync(process.env.CB, 'utf8')); ctx._cb = o; vm.runInContext('Object.assign(CB_BAC.dmg, _cb.dmg || {}); Object.assign(CB_BAC.ht, _cb.ht || {}); Object.assign(CB_BAC.sao, _cb.sao || {});', ctx); } // thử hệ số cân bằng không sửa data.js
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  vm.runInContext('const _tr = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _tr(E, d, o); if (!c) G._sum = (G._sum || 0) + Math.min(h, Math.max(0, h - Math.max(0, E.hp))); return r; };', ctx);
  vm.runInContext('const _lotT = lot; lot = function (E) { if (G._vong) { E.s = 0; return; } return _lotT(E); };', ctx);
  return ctx;
}
const R = (ctx, s) => vm.runInContext(s, ctx);
// đặt ụ, quái wave 20 vào liên tục 2/s (tối đa max quái trên đường) — trả sát thương có ích / giây
function chay(ctx, dat, T0, opt) {
  ctx._dat = dat; ctx._gieo(7); // cùng hạt giống mọi lần đo → so sánh có/không ụ thử công bằng (số ngẫu nhiên chung)
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ['lien', 'canon', 'set', 'sungluc', 'mana'], 'hero'); G.cho = 1e9; G.wave = 20;
    const B = G.ban[0]; B.tim = 1e9; B.mana = 0;
    for (const [o, id, s] of _dat) { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; }
    G._sum = 0; G._q = 0; G._rq = rngHat(911); G._vong = ${opt.vong ? 'true' : 'false'}; }`);
  const dt = 1 / 30;
  for (let t = 0; t < T0; t += dt) {
    if (t >= R(ctx, 'G._q') * 0.5) R(ctx, `{ G._q++; if (G.quai.filter(e => !e.chet).length < ${opt.max || 10}) { const d = taoWave(G.wave, G._rq).ds; const Q = sinhQuai(${opt.loai ? "'" + opt.loai + "'" : 'd[(G._rq() * d.length) | 0]'}, 0, 0, ${opt.hs}); Q.vao = 1; } }`);
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, '!!G.ketThuc')) R(ctx, 'G.ketThuc = false;');
  }
  R(ctx, 'G._vong = false;');
  return R(ctx, 'G._sum') / T0;
}
const BOT_FILE = path.join(__dirname, 'thap-sim-vaitro.js');
function song(ctx, deck, maxT, k) {
  if (!ctx._coBot) { ctx._coBot = 1; const src = fs.readFileSync(BOT_FILE, 'utf8'); const m = src.match(/const BOT = `([\s\S]*?)`;/); R(ctx, m[1]); }
  ctx._deck = deck; ctx._gieo(1000 + (k | 0)); // lần thử thứ k dùng cùng hạt giống cho mọi ụ
  R(ctx, `G.debug = { auto: true }; G._bot = true; batDau('solo', _deck, 'hero');`);
  const dt = 1 / 30;
  for (let t = 0; t < maxT; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if (R(ctx, '!!G.ketThuc')) break;
  }
  return R(ctx, 'G.wave + Math.min(0.99, (G.tWave || 0) / LUAT.thoiGianWave)');
}
const med = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : 0; };
const TIER = ['trang', 'xanh', 'tim', 'vang', 'do'], TEN = { trang: 'White', xanh: 'Blue', tim: 'Purple', vang: 'Gold', do: 'Red' };
const SAO = [1, 4, 7], NHOM = ['lien', 'canon', 'set', 'sungluc'];
// ụ Tấn công mà giá trị nằm ở NGỮ CẢNH BÀN (cộng hưởng theo bàn / khống chế toàn đường) → V = max(một mình, bàn chuẩn)
const HOP_BAN = new Set(['hopca', 'ngoisao', 'baotuyet']);

function doHet(opt) {
  opt = opt || {};
  const nhanh = opt.nhanh || process.env.NHANH;
  const T1 = nhanh ? 16 : 30, HAT = nhanh ? [1, 777] : [1, 777, 4242];
  const CTX = HAT.map(taoMoiTruong), ctx = CTX[0];
  const ds = R(ctx, `G.roster.filter(r => SKILLS[r.id]).map(r => [r.id, r.bac, SKILLS[r.id].vai, TEXT.turret[r.id] ? TEXT.turret[r.id].name : (r.ten || r.id), !!SKILLS[r.id].chuDong])`);
  const kq = {};
  for (const [id, bac, vai, ten, act] of ds) kq[id] = { id, bac, vai, ten, act, solo: {}, ban: {}, V: {}, P: {} };
  const kS = (s) => 1 + 0.85 * (s - 1);
  // (1) Tấn công: DPS một mình
  for (const s of SAO) for (const id in kq) if (kq[id].vai === 'tc') {
    const a = chay(ctx, [[2, id, s]], T1 + 8, { max: 1, hs: 4.5 * kS(s), loai: 'khong_lo', vong: true });
    const b = chay(ctx, [[2, id, s]], T1 + 8, { max: 10, hs: 2 * kS(s), vong: true });
    kq[id].solo[s] = [a, b];
  }
  // (2) bàn chuẩn (mọi ụ không phải Tấn công + ụ Tấn công trắng làm mốc)
  for (const s of SAO) {
    const nhom = (id) => { const cot = R(ctx, `(() => { const o = SKILLS['${id}'].vai === 'ht' ? HOTRO.oDich({ id: '${id}', o: 7, sao: ${s}, ban: 0, lv: 1 }) : []; return o.length === 4 ? o : [2, 6, 8, 12]; })()`); return cot.map((o, i) => [o, NHOM[i], s]); }; // ô ụ hỗ trợ thật sự buff (Resonance Grid = chéo)
    const d0 = chay(ctx, nhom('lien'), 12, { hs: 50 * kS(s), vong: true });
    const hs = d0 / (0.9 * R(ctx, 'mauWave(20)'));
    const goc = {};
    const base = (id) => { const k = JSON.stringify(nhom(id)); if (goc[k] == null) goc[k] = CTX.reduce((a, c) => a + chay(c, nhom(id), T1, { hs }), 0) / CTX.length; return goc[k]; };
    for (const id in kq) {
      const r = kq[id];
      const co = CTX.reduce((a, c) => a + chay(c, nhom(id).concat([[7, id, s]]), T1, { hs }), 0) / CTX.length;
      r.ban[s] = co - base(id);
    }
  }
  // (3) bộ bài (ụ Đặc biệt + ụ Tấn công trắng làm mốc)
  if (!nhanh) {
    const N = opt.n || 10;
    for (const id in kq) { const r = kq[id]; if (!(r.vai === 'db' || (r.vai === 'tc' && r.bac === 'trang'))) continue;
      let w = 0; for (let i = 0; i < N; i++) w += song(CTX[i % CTX.length], NHOM.concat([id]), 2400, i); r.wave = w / N; }
  }
  // chuẩn hoá
  for (const s of SAO) {
    const W = Object.values(kq).filter(r => r.bac === 'trang' && r.vai === 'tc');
    const m1 = med(W.map(r => r.solo[s][0])), m2 = med(W.map(r => r.solo[s][1])), mb = med(W.map(r => r.ban[s]));
    for (const r of Object.values(kq)) {
      r.Pban = r.Pban || {}; r.Pban[s] = Math.max(0, r.ban[s] / mb);
      if (r.vai === 'tc') { r.Psolo = r.Psolo || {}; r.Psolo[s] = Math.sqrt(Math.max(1e-3, r.solo[s][0] / m1) * Math.max(1e-3, r.solo[s][1] / m2)); r.V[s] = HOP_BAN.has(r.id) ? Math.max(r.Psolo[s], r.Pban[s]) : r.Psolo[s]; }
      else r.V[s] = r.Pban[s];
    }
  }
  if (!nhanh) {
    const w0 = med(Object.values(kq).filter(r => r.bac === 'trang' && r.vai === 'tc').map(r => r.wave));
    for (const r of Object.values(kq)) if (r.wave != null) { r.Pbo = Math.max(0, 5 * Math.pow(1.15, r.wave - w0) - 4); if (r.vai === 'db') for (const s of SAO) r.V[s] = Math.max(r.V[s], r.Pbo); }
    kq._w0 = w0;
  }
  // P = V / trung vị V của ụ TRẮNG cùng vai trò, cùng số sao → so bậc trong từng vai (Hỗ trợ bị trần buff, Đặc biệt là tiện ích — không so thẳng với DPS)
  for (const s of SAO) for (const v of ['tc', 'ht', 'db']) {
    const m0 = Math.max(0.05, med(Object.values(kq).filter(r => r.bac === 'trang' && r.vai === v).map(r => r.V[s])));
    for (const r of Object.values(kq)) if (r.vai === v) r.P[s] = r.V[s] / m0;
  }
  return kq;
}
function trungVi(kq, bo) {
  const m = {};
  for (const b of TIER) { m[b] = {}; for (const s of SAO) m[b][s] = med(Object.values(kq).filter(r => r && r.id && r.bac === b && !(bo && bo.has(r.id))).map(r => r.P[s])); }
  return m;
}
module.exports = { taoMoiTruong, R, chay, song, doHet, trungVi, med, TIER, TEN, SAO };

// nhận xét tay (đọc mã kỹ năng 06/11): ụ vàng/đỏ chỉ là "số to hơn" / trùng mẹo của ụ bậc thấp / thiếu chiêu chủ động
const NHAN = {
  aten: 'numbers: +300% vs poisoned = same trick as Ice Blade (Blue, +400% vs slowed)',
  hasao: 'numbers: plain +damage support (same as Cleanser/Sanctum) + small merge surge',
  luoicheo: 'numbers: +damage support, only the shape differs (diagonal)',
  nemesis: 'overlap: execute = Guillotine (White) / Reaper Pillar (Purple)',
  thanhdia: 'overlap: cleanse = Cleanser (Purple) + shield = Shield Gen (Purple) + damage buff',
  luutru: 'overlap: merge → permanent damage = Combo Core (Purple)',
  hopca: 'overlap: same-star count = Sync Cannon (Gold)',
  xuonganh: 'weak payoff: one cell +fire rate 12 s',
  guongcong: 'weak payoff in PVE (control resist); not measurable here',
  loren: 'weak payoff: manual feed only, +60% cap; bot never feeds',
  nguyenrua: 'solo: nothing visible (PVP/co-op only)',
  overlord: 'Red without an ACTIVE skill (only a bigger charged blast)',
  blackhole: 'Red without an ACTIVE skill',
  lophanung: 'Red support capped like any support (slow aura = Chiller, Blue)',
  haoquang: 'weak: short barrier, no damage, no board change',
};
const KHONG_DO = new Set(['khien', 'guongcong', 'loren', 'epxung']); // phòng thủ / thao tác tay — không vào trung vị
function vietBang(kq, truoc, file) {
  const m = trungVi(kq, KHONG_DO), m0 = truoc ? trungVi(truoc, KHONG_DO) : null;
  const L = [];
  L.push('# Tier power table — every turret (auto: `node tools/thap-sim-tier.js`)', '');
  L.push('Power **P** = value ÷ median of the WHITE units of the same role, same ★ (LV start, no power-up). Attack = solo DPS (geo-mean of 1 giant + a wave-20 crowd); Support = extra damage it gives a standard board (4 white attackers around it, enemies leak); Special = max(standard board, deck test: bot plays SOLO with [Gatling, Cannon, Tesla, Revolver, X], waves → power). Excluded from medians (defensive / manual, not measurable): ' + [...KHONG_DO].join(', ') + '.', '');
  L.push('## Median P per tier' + (m0 ? ' — before → after' : ''), '', '| Tier | 1★ | 4★ | 7★ | 4★ vs lower tier |', '|---|---|---|---|---|');
  TIER.forEach((b, i) => L.push('| ' + TEN[b] + ' | ' + SAO.map(s => (m0 ? m0[b][s].toFixed(2) + ' → ' : '') + '**' + m[b][s].toFixed(2) + '**').join(' | ') + ' | ' + (i ? (m0 ? Math.round((m0[b][4] / m0[TIER[i - 1]][4] - 1) * 100) + '% → ' : '') + Math.round((m[b][4] / m[TIER[i - 1]][4] - 1) * 100) + '%' : '—') + ' |'));
  L.push('');
  for (const v of [['tc', 'Attack'], ['ht', 'Support'], ['db', 'Special']]) {
    L.push('### ' + v[1] + ' median 4★', '', '| | ' + TIER.map(b => TEN[b]).join(' | ') + ' |', '|---|' + TIER.map(() => '---|').join(''));
    const f = (q) => TIER.map(b => med(Object.values(q).filter(r => r && r.id && r.bac === b && r.vai === v[0] && !KHONG_DO.has(r.id)).map(r => r.P[4])).toFixed(2));
    if (truoc) L.push('| before | ' + f(truoc).join(' | ') + ' |');
    L.push('| after | ' + f(kq).join(' | ') + ' |', '');
  }
  const ds = Object.values(kq).filter(r => r && r.id);
  L.push('## Every turret, ranked inside its tier (4★)', '', 'Flags: ⬆ = beats the 4★ median of a HIGHER tier · ★ = active skill · note = "only bigger numbers" / overlap / weak payoff (redesign proposals: DE-XUAT.md).', '');
  for (const b of TIER) {
    L.push('### ' + TEN[b], '', '| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |', '|---|---|---|---|---|---|---|---|');
    ds.filter(r => r.bac === b).sort((x, y) => y.P[4] - x.P[4]).forEach((r, i) => {
      const len = TIER.slice(TIER.indexOf(b) + 1).filter(c => r.P[4] > m[c][4]).map(c => '⬆' + TEN[c]);
      const t0 = truoc && truoc[r.id] ? truoc[r.id].P[4].toFixed(2) : '';
      L.push('| ' + (i + 1) + ' | ' + r.ten + ' `' + r.id + '` | ' + ({ tc: 'Attack', ht: 'Support', db: 'Special' })[r.vai] + (r.act ? ' ★' : '') + ' | ' + SAO.map(s => r.P[s].toFixed(2)).join(' | ') + ' | ' + t0 + ' | ' + [len.join(' '), KHONG_DO.has(r.id) ? 'not measured' : '', NHAN[r.id] || ''].filter(Boolean).join(' · ') + ' |');
    });
    L.push('');
  }
  fs.writeFileSync(file, L.join('\n'));
}
module.exports.vietBang = vietBang; module.exports.KHONG_DO = KHONG_DO;

if (require.main === module) {
  const kq = doHet();
  const m = trungVi(kq, KHONG_DO);
  const thu = path.join(__dirname, '..', 'docs', 'demo-hop-tuong', 'tuvan', 'tier');
  const out = process.argv[2] === 'json' ? process.argv[3] : path.join(thu, 'bang.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ kq, m }, null, 1));
  if (process.argv[2] !== 'json') { const tp = path.join(thu, 'bang-truoc.json'); vietBang(kq, fs.existsSync(tp) ? JSON.parse(fs.readFileSync(tp, 'utf8')).kq : null, path.join(thu, 'BANG.md')); console.log('→ BANG.md'); }
  console.log('| Tier | 1★ | 4★ | 7★ |'); console.log('|---|---|---|---|');
  for (const b of TIER) console.log('| ' + TEN[b] + ' | ' + SAO.map(s => m[b][s].toFixed(2)).join(' | ') + ' |');
  console.log('→ ' + out);
}
