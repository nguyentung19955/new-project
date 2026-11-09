// TURRET MERGE — QA KỸ NĂNG 22 Ụ TÍM (Epic): kiểm số trong chữ kỹ năng ↔ code, sao 1/3/5/7, dạng grow-up, hỗ trợ / buff, ghép đặc biệt, PVP/CO-OP
//   node tools/thap-kt-kynang-tim.js        → chạy mọi kiểm tra, in bảng | ụ | claim | đo được | OK/FAIL |, mã thoát 1 nếu có FAIL
//   node tools/thap-kt-kynang-tim.js md     → in bảng markdown (dán vào docs/demo-hop-tuong/QA-KYNANG-TIM.md)
// Mô phỏng không giao diện (như tools/thap-sim-vaitro.js) + nạp growfx.js (đòn bắn theo dạng grow-up). RNG có hạt giống.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'fx', 'tiervfx', 'game', 'chihuy', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'hotro', 'growfx'];
function taoMoiTruong(hat) {
  const noop = () => {};
  let s = hat || 12345;
  const M = Object.create(Math); M.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const ctx = { console, Math: M, JSON, Set, Map, Promise, Object, Array, Number, String, Infinity, NaN, isFinite, parseInt, parseFloat, Symbol, Proxy, Reflect, Error,
    setTimeout: (f) => { ctx._cho.push(f); }, clearTimeout: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.document = undefined;
  ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [], eo: (u) => u }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null };
  ctx.UI = new Proxy({ xemHT: null }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.FONT = { display: 'x', ui: 'x' };
  ctx.buffNo = noop; ctx.BVX = new Proxy({}, { get: () => noop });
  vm.createContext(ctx);
  for (const f of FILES) { const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); }
  vm.runInContext('G.roster = JSON.parse(_rosterJson); G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r; applyText(G.roster);', Object.assign(ctx, { _rosterJson: fs.readFileSync(path.join(goc, 'assets', 'roster.json'), 'utf8') }));
  ctx.VX.bien = noop; // hoạt ảnh biến hình (thời gian thực, growfx.js) — bỏ phát bắn "chào dạng mới" để đo đúng từng phát
  vm.runInContext('const _trQA = trung; trung = function (E, d, o) { const h = Math.max(0, E.hp), c = E.chet; const r = _trQA(E, d, o); if (!c) { const m = Math.min(h, Math.max(0, h - Math.max(0, E.hp))); G._sum = (G._sum || 0) + m; G._per = G._per || new Map(); G._per.set(E, (G._per.get(E) || 0) + m); } return r; };', ctx);
  return ctx;
}
const ctx = taoMoiTruong();
const R = (s) => vm.runInContext(s, ctx);
const dt = 1 / 30;
function buoc(t, moiBuoc) { for (let x = 0; x < t - 1e-9; x += dt) { if (moiBuoc) moiBuoc(x); R('capNhat(' + dt + ')'); if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); } } }

// ---------- dựng trận ----------
// che: solo|coop|pvp · deck bàn mình · deck2 bàn kia. Không AI, không wave tự sinh, tim vô hạn, mana 0.
function moi(che, deck, deck2) {
  ctx._a = [che || 'solo', deck || ['lien', 'canon', 'set', 'sungluc', 'tia'], deck2 || ['lien', 'canon', 'set', 'sungluc', 'tia']];
  R(`{ G.debug = { auto: false, deck2: _a[2] }; batDau(_a[0], _a[1], 'hero'); G.cho = 1e9; G.wave = 20;
     for (const B of G.ban) { B.tim = 1e9; B.mana = 0; B.ai = false; B.t.fill(null); } G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G._sum = 0; G._per = new Map(); }`);
}
function dat(o, id, sao, ban) { ctx._d = [o, id, sao, ban || 0]; return R(`{ const B = G.ban[_d[3]]; const T = sinhU(taoU(B, _d[1], _d[2], _d[0])); B.t[_d[0]] = T; T.cd = 0; T; }`); }
// quái đứng yên trên đường của bàn (s = quãng đã đi), máu lớn; to: quái to; trum: trùm
function quai(s, opt) {
  opt = opt || {}; ctx._q = [s, opt];
  return R(`{ const [s, o] = _q; const pi = G.duong.findIndex(p => p.ban === (o.ban || 0));
    const E = o.trum ? sinhTrum('freezer', pi, 1) : sinhQuai(o.id || (o.to ? 'khong_lo' : 'bo'), pi, s, 1);
    E.s = s; [E.x, E.y, E.goc] = viTri(G.duong[pi], E.s); E.vao = 1; E.d = Object.assign({}, E.d, { v: o.v != null ? o.v : 0 });
    E.max = E.hp = o.hp || 1e9; if (o.trum) { E.knT = 1e9; } for (const B of G.ban) B._ds = null; E; }`);
}
const tat = [];
function khongCrit(on) { R(`G._ncrit = ${on ? 'true' : 'false'}`); }
R(`const _critQA = critU; critU = function (T) { return G._ncrit ? 0 : _critQA(T); };`);
const tong = () => R('G._sum');
const xoaSum = () => R('G._sum = 0; G._per = new Map();');

// ---------- ghi kết quả ----------
const KQ = [];
let loi = 0;
const TEN = (id) => R(`TEXT.turret['${id}'] ? TEXT.turret['${id}'].name : '${id}'`);
function ghi(id, claim, doDuoc, ok, note) { KQ.push({ id, claim, doDuoc, ok: !!ok, note: note || '' }); if (!ok) loi++; }
const gan = (a, b, tl) => Math.abs(a - b) <= Math.abs(b) * (tl == null ? 0.01 : tl) + 1e-9;
const f2 = (x) => (Math.round(x * 100) / 100).toString();
const pc = (x) => Math.round(x * 1000) / 10 + '%';
function chay(id, fn) { if (process.env.QA_ONLY && !process.env.QA_ONLY.split(',').includes(id)) return; try { fn(); } catch (e) { ghi(id, 'test chạy không lỗi', 'THROW ' + e.message.split('\n')[0], false); console.error(id, e.stack.split('\n').slice(0, 4).join(' | ')); } }

// sát thương 1 lần bắn sk.ban(...) lên 1 quái đứng yên (không chí mạng) — chờ đạn / HU bay xong
function motPhat(T, E, thoiGian) {
  xoaSum(); ctx._T = T; ctx._E = E;
  const khoa = 'for (const B of G.ban) for (const X of B.t) if (X) X.cd = 1e9;';
  R(`{ ${khoa} const B = G.ban[_T.ban]; G.dangBan = _T; SKILLS[_T.id].ban(G, B, _T, _E); G.dangBan = null; }`);
  buoc(thoiGian || 1.5, () => R(khoa));
  return tong();
}
// DPS bền vững 1 ụ vào 1 quái đứng yên (không chí mạng tuỳ chọn), T0 giây
function dps(T0) { xoaSum(); buoc(T0); return tong() / T0; }
const dmgU = (T) => { ctx._T = T; return R('dmgU(_T)'); };
const tocU = (T) => { ctx._T = T; return R('tocU(_T)'); };
const hs = (id, sao, extra) => R(`(SKILLS['${id}'].dmg) * TIERS.tim.hs * heSaoST('${id}', ${sao})`) * (extra || 1);
const mocDmg = (id, sao) => { ctx._x = [id, sao]; return R(`heSoMocDmg({ id: _x[0], sao: _x[1] })`); };

// =====================================================================================================
// 0) chung: 22 ụ đúng bậc tím, chữ EN + VI có, công thức sát thương gốc dmgU = dmg × 1.65 × (1+0.85(★−1)) × mốc
// =====================================================================================================
const TIM = ['cuongno', 'baotuyet', 'nhanban', 'lienket', 'kepha', 'taylo', 'khien', 'hopbi', 'nangsao', 'tuthan', 'xaotron', 'epxung', 'no5', 'bao', 'anhsang', 'nayda', 'combo', 'khoathoigian', 'docton', 'thaukinh', 'nhieusong', 'santhuong'];
chay('chung', () => {
  const ds = R(`G.roster.filter(r => r.bac === 'tim').map(r => r.id)`);
  ghi('chung', '22 Epic turrets in roster.json', ds.length + ' Epic: ' + (TIM.every(i => ds.includes(i)) ? 'all 22 present' : 'missing'), ds.length === 22 && TIM.every(i => ds.includes(i)));
  const thieu = TIM.filter(id => { const r = R(`JSON.stringify(G.rosterMap['${id}'])`); const o = JSON.parse(r); return !o.kyNang_vi || !o.kyNang || !o.ten_vi; });
  ghi('chung', 'every Epic has EN + VI skill text', thieu.length ? 'missing: ' + thieu.join(',') : 'EN + VI present', !thieu.length);
  moi('solo', ['cuongno', 'lien', 'canon', 'set', 'tia']);
  let sai = [];
  for (const id of TIM) for (const s of [1, 3, 5, 7]) {
    ctx._x = [id]; R(`G.ban[0].deck = [_x[0], 'lien', 'canon', 'set', 'tia']; G.ban[0].lv[_x[0]] = 1;`);
    const T = dat(2, id, s), d = dmgU(T), k = R(`SKILLS['${id}'].dmg`) * 1.65 * R(`heSaoST('${id}', ${s})`) * mocDmg(id, s);
    if (!gan(d, k)) sai.push(id + '@' + s + ' ' + f2(d) + '≠' + f2(k));
    R('G.ban[0].t[2] = null');
  }
  ghi('chung', 'dmgU = base × 1.65 (Epic) × (1+0.85·(★−1)) × star milestone, 1/3/5/7★', sai.length ? sai.join('; ') : '88/88 match', !sai.length);
});

// =====================================================================================================
// 1) BERSERKER — chí mạng 1 → RAGE (+25% tốc) · chí mạng 2 → FRENZY (+150%+15%/★ tốc) 5 s (5★ 7 s) · 3★ Rage 8 s · 7★ Frenzy +25% chí mạng
// =====================================================================================================
chay('cuongno', () => {
  moi('solo', ['cuongno', 'lien', 'canon', 'set', 'tia']);
  for (const s of [1, 3, 5, 7]) {
    const T = dat(2, 'cuongno', s); ctx._T = T; R('SKILLS.cuongno.capNhat(G, G.ban[0], _T, 0)');
    const crit0 = R('critU(_T)');
    R('SKILLS.cuongno.khiCrit(G, _T)'); const rage = R('[_T.rage, _T.rageT]');
    R('SKILLS.cuongno.khiCrit(G, _T)'); const fr = R('_T.cuongT');
    buoc(dt); const tF = tocU(T), crF = R('critU(_T)'), gd = R('GROW.cuongno.gd(_T).s');
    const kToc = 1.5 * (1 + 1.5 + 0.15 * s);
    ghi('cuongno', s + '★: base crit 15%, Rage after 1st crit lasts ' + (s >= 3 ? 8 : 5) + 's, Frenzy after 2nd ' + (s >= 5 ? 7 : 5) + 's',
      'crit ' + pc(crit0) + ' · rage ' + rage[0] + ' ' + rage[1] + 's · frenzy ' + f2(fr) + 's', gan(crit0, 0.15) && rage[0] === 1 && rage[1] === (s >= 3 ? 8 : 5) && gan(fr, s >= 5 ? 7 : 5));
    ghi('cuongno', s + '★ FRENZY: fire rate ×(1+' + pc(1.5 + 0.15 * s) + '), stage 3' + (s >= 7 ? ', crit +25% (RAMPAGE)' : ''),
      f2(tF) + '/s (expect ' + f2(kToc) + ') · stage ' + gd + ' · crit ' + pc(crF), gan(tF, kToc) && gd === 3 && gan(crF, 0.15 + (s >= 7 ? 0.25 : 0)));
    R('G.ban[0].t[2] = null');
  }
  // dạng 1/2/3: mỗi phát = đúng dmgU (bản dạng của growfx không nhân thêm)
  khongCrit(true);
  for (const gd of [1, 2, 3]) {
    moi('solo', ['cuongno', 'lien', 'canon', 'set', 'tia']);
    const T = dat(2, 'cuongno', 4); ctx._T = T; R('_T._epGd = ' + gd); const E = quai(300);
    const d = motPhat(T, E), k = dmgU(T);
    ghi('cuongno', 'stage ' + gd + ' (' + ['CALM', 'RAGE', 'FRENZY'][gd - 1] + ') shot = 1× damage', f2(d) + ' vs dmgU ' + f2(k), gan(d, k));
  }
  khongCrit(false);
});

// =====================================================================================================
// 2) BLIZZARD — mỗi max(4, 11−0.6★−[3★ 1.5]) s: MỌI quái chậm min(60%, 30%+3%/★) 3 s + 1.5× sát thương (5★ ×3) + quái nhỏ đóng băng 0.35 s (7★ 1 s)
// =====================================================================================================
chay('baotuyet', () => {
  khongCrit(true);
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['baotuyet', 'lien', 'canon', 'set', 'tia']);
    const T = dat(2, 'baotuyet', s); const E1 = quai(200), E2 = quai(500, { to: true }), E3 = quai(700, { trum: true }), E4 = quai(400, { id: 'bay_bang' });
    const ky = Math.max(4, 11 - 0.6 * s - (s >= 3 ? 1.5 : 0)), cham = Math.min(0.6, 0.3 + 0.03 * s);
    let t1 = null; xoaSum();
    buoc(ky + 0.2, (x) => { if (t1 == null && R('_T0 = G.quai[0].chamT > 0')) t1 = x; });
    ctx._E = [E1, E2, E3, E4];
    const st = R('_E.map(E => [E.cham, E.chan])'), d = R('_E.map(E => G._per.get(E) || 0)');
    const kd = dmgU(T) * 1.5 * (s >= 5 ? 3 : 1), fr = s >= 7 ? 1 : 0.35;
    ghi('baotuyet', s + '★: pulse every ' + f2(ky) + 's', 'first pulse at ' + (t1 == null ? 'never' : f2(t1 + dt) + 's'), t1 != null && Math.abs(t1 + dt - ky) < 0.07);
    ghi('baotuyet', s + '★: slows ALL ' + pc(cham) + ' (Frost Flyer immune), pulse ' + f2(kd) + ' dmg each', 'slow ' + st.map(q => pc(q[0])).join('/') + ' · dmg ' + d.map(f2).join('/'),
      gan(st[0][0], cham) && gan(st[1][0], cham) && gan(st[2][0], cham) && st[3][0] === 0 && d.every(x => gan(x, kd)));
    ghi('baotuyet', s + '★: freezes SMALL enemies ' + fr + 's (not big / boss / Frost Flyer)', 'freeze left ' + st.map(q => f2(q[1])).join('/'), st[0][1] > fr - 0.25 && st[1][1] === 0 && st[2][1] === 0 && st[3][1] === 0);
  }
  // Ép Xung trên Bão Tuyết: xung nhanh hơn 65% (trước đây: Ép Xung vô tác dụng vì Bão Tuyết không bắn)
  moi('solo', ['baotuyet', 'epxung', 'canon', 'set', 'tia']);
  const T = dat(2, 'baotuyet', 1); const X = dat(3, 'epxung', 1); quai(200);
  ctx._A = [X, T]; R('ghep(G.ban[0], _A[0], _A[1])');
  let t1 = null; buoc(8, (x) => { if (t1 == null && R('G.quai[0].chamT > 0')) t1 = x; });
  ghi('baotuyet', 'Overclock on Blizzard: pulses 65% faster (10.4s → 6.3s)', 'first pulse ' + (t1 == null ? 'never' : f2(t1 + dt) + 's'), t1 != null && Math.abs(t1 + dt - 10.4 / 1.65) < 0.1, 'fixed code: pulse charge now uses fire-rate multiplier');
  khongCrit(false);
});

// =====================================================================================================
// 3) CLONER — khi GHÉP: thêm 1 ụ 1★ miễn phí (không trừ mana, không tăng giá)
// =====================================================================================================
chay('nhanban', () => {
  for (const cap of [['nhanban', 'nhanban'], ['mimic', 'nhanban']]) {
    moi('solo', ['nhanban', 'lien', 'canon', 'mimic', 'tia']);
    const a = dat(0, cap[0], 2), b = dat(1, cap[1], 2); R('G.ban[0].mana = 50'); const gia0 = R('G.ban[0].gia');
    ctx._A = [a, b]; R('ghep(G.ban[0], _A[0], _A[1])');
    const r = R('{ const B = G.ban[0]; [B.t.filter(Boolean).length, B.t.filter(X => X && X.sao === 1).length, B.mana, B.gia, B.t[1].sao]; }');
    ghi('nhanban', cap.join('+') + ' 2★ merge → 3★ result + one free 1★ turret', 'turrets ' + r[0] + ' (1★: ' + r[1] + ') · result ' + r[4] + '★ · mana ' + r[2] + ' · price ' + r[3] + '→' + gia0, r[0] === 2 && r[1] === 1 && r[2] === 50 && r[3] === gia0 && r[4] === 3);
  }
});

// =====================================================================================================
// 4) CHAIN LINK — +40% sát thương mỗi ụ Chain Link nối liền (N/E/S/W); 2 nối = LINKED, 4+ = CHAIN MASTER (nảy thêm 1 quái ×0.5)
// =====================================================================================================
chay('lienket', () => {
  khongCrit(true);
  for (const n of [1, 2, 3, 4, 5]) {
    moi('solo', ['lienket', 'lien', 'canon', 'set', 'tia']);
    const o = [2, 3, 4, 9, 14].slice(0, n), ds = o.map(x => dat(x, 'lienket', 3)); dat(1, 'lien', 3); // Gatling chen giữa không tính
    buoc(3 * dt, () => R('for (const X of G.ban[0].t) if (X) X.cd = 1e9;')); const T = ds[0]; ctx._T = T; // dạng cập nhật sau 1 khung
    const b = R('_T.buf.dmg'), gd = R('GROW.lienket.gd(_T).s'), ch = R('_T.chuoi');
    ghi('lienket', n + ' linked: +' + (40 * (n - 1)) + '% damage, stage ' + (n >= 4 ? 3 : n >= 2 ? 2 : 1), 'chain ' + ch + ' · +' + pc(b) + ' · stage ' + gd, ch === n && gan(b, 0.4 * (n - 1)) && gd === (n >= 4 ? 3 : n >= 2 ? 2 : 1));
    const E = quai(300), E2 = quai(330);
    const d = motPhat(T, E), k = dmgU(T) * (n >= 4 ? 1.5 : 1);
    ghi('lienket', n + ' linked: one shot = ' + (n >= 4 ? '1× + arc 0.5× to a 2nd enemy' : '1×') + ' (buff applied once)', f2(d) + ' vs ' + f2(k), gan(d, k));
  }
  khongCrit(false);
});

// =====================================================================================================
// 5) CLAMP (kepha) — khi GHÉP (vật liệu ★s): PVP 1+⌊s/2⌋ ụ đối thủ sao cao nhất −40% tốc (5+s) s, khiên chặn · CO-OP/SOLO ụ đồng đội/mình +(40+5s)% tốc (6+s) s
// =====================================================================================================
chay('kepha', () => {
  for (const s of [1, 3, 5]) {
    moi('pvp', ['kepha', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
    const D = [0, 1, 2, 3, 4].map(o => dat(o, ['lien', 'canon', 'set', 'sungluc', 'tia'][o], o + 1, 1));
    ctx._D = D; R('_D[4].khien = 1');
    const a = dat(5, 'kepha', s), b = dat(6, 'kepha', s); ctx._A = [a, b]; R('ghep(G.ban[0], _A[0], _A[1])');
    const n = 1 + Math.floor(s / 2);
    const k = R('_D.map(X => X.st.kep)'), kh = R('_D[4].khien');
    buoc(dt); const t = D.map(tocU), t0 = R('_D.map(X => SKILLS[X.id].toc * (1 + (SKILLS[X.id].tocSao || 0) * (X.sao - 1)) * (1 + (X.sao >= 3 ? 0.2 : 0)))');
    const hit = k.filter(x => x > 0).length, dung = k.filter(x => x > 0).every(x => gan(x, 5 + s, 0.02));
    ghi('kepha', 'PVP ' + s + '★ merge: clamps ' + n + ' highest-star rival turrets −40% for ' + (5 + s) + 's, shield blocks 1', 'clamped ' + hit + ' (' + k.map(f2).join('/') + ') · shield ' + kh + ' · rate ' + t.map((x, i) => f2(x / t0[i])).join('/'),
      hit === n - 1 && kh === 0 && dung && t.every((x, i) => k[i] > 0 ? gan(x / t0[i], 0.6, 0.02) : true));
  }
  for (const che of ['coop', 'solo']) {
    moi(che, ['kepha', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
    const bi = che === 'coop' ? 1 : 0, D = [0, 1, 2].map(o => dat(o + (bi ? 0 : 10), 'lien', o + 1, bi));
    const s = 3, a = dat(5, 'kepha', s), b = dat(6, 'kepha', s); ctx._A = [a, b]; ctx._D = D; R('ghep(G.ban[0], _A[0], _A[1])');
    const r = R('_D.map(X => [X.tocT, X.tocV])'), n = 1 + Math.floor(s / 2);
    const ok = r.filter(q => q[0] > 0).length === n && r.filter(q => q[0] > 0).every(q => gan(q[0], 6 + s) && gan(q[1], 0.4 + 0.05 * s));
    ghi('kepha', che.toUpperCase() + ' 3★ merge: ' + n + ' ' + (bi ? 'ally' : 'own') + ' turrets +' + (40 + 5 * s) + '% fire rate ' + (6 + s) + 's', r.map(q => f2(q[0]) + 's/+' + pc(q[1])).join(' · '), ok);
  }
});

// =====================================================================================================
// 6) CLEANSER — HỖ TRỢ: mỗi 12 s (5★ 9 s) tẩy ≤2 (5★ ≤3) ụ kề (băng/đá/cháy/kẹp); không có gì để tẩy → ụ kề +8%×K sát thương · 7★: được tẩy +20% tốc 4 s
// =====================================================================================================
chay('taylo', () => {
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['taylo', 'lien', 'canon', 'set', 'tia']);
    const T = dat(7, 'taylo', s), ke = [2, 6, 8, 12].map(o => dat(o, 'lien', 1));
    buoc(dt); ctx._K = ke; ctx._T = T;
    const K = R('HOTRO.k(_T)'), b0 = R('_K[0].buf.dmg');
    ghi('taylo', s + '★: nothing to clean → neighbours +' + pc(0.08 * K) + ' damage (from the start)', '+' + pc(b0), gan(b0, 0.08 * K), s === 1 ? 'fixed code: before the first pulse the buff was missing' : '');
    R('_K[0].st.bang = 30; _K[1].st.lua = 30; _K[2].st.kep = 30; _K[3].st.da = true; _T.nap = 0;');
    const ky = s >= 5 ? 9 : 12, so = s >= 5 ? 3 : 2;
    buoc(ky - 0.2); const truoc = R('_K.filter(X => X.st.bang > 0 || X.st.lua > 0 || X.st.kep > 0 || X.st.da).length');
    buoc(0.4); const sau = R('_K.filter(X => X.st.bang > 0 || X.st.lua > 0 || X.st.kep > 0 || X.st.da).length');
    const tt = R('_K.filter(X => X.tocT > 0).map(X => [X.tocT, X.tocV])');
    ghi('taylo', s + '★: every ' + ky + 's cleanses up to ' + so + ' neighbours' + (s >= 7 ? ' + they get +20% fire rate 4s' : ''), 'debuffed ' + truoc + ' → ' + sau + (s >= 7 ? ' · boosted ' + tt.length + ' (' + tt.map(q => f2(q[0]) + 's+' + pc(q[1])).join(',') + ')' : ''),
      truoc === 4 && sau === 4 - so && (s < 7 || (tt.length === so && tt.every(q => q[0] > 3.5 && gan(q[1], 0.2)))));
  }
});

// =====================================================================================================
// 7) SHIELD GEN — HỖ TRỢ: ụ kề nhận khiên chặn 1 lần, sạc [18,18,16,16,14,14,10] s, không cộng dồn; 7★: chặn xong +20% tốc 4 s
// =====================================================================================================
chay('khien', () => {
  const KY = [18, 18, 16, 16, 14, 14, 10];
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['khien', 'lien', 'canon', 'set', 'tia']);
    const T = dat(7, 'khien', s), ke = [2, 6, 8, 12].map(o => dat(o, 'lien', 1)); ctx._K = ke; ctx._T = T;
    let t1 = null; buoc(KY[s - 1] + 0.3, (x) => { if (t1 == null && R('_K[0].khien > 0')) t1 = x; });
    const n = R('_K.filter(X => X.khien === 1).length');
    buoc(KY[s - 1] + 1); const n2 = R('Math.max(..._K.map(X => X.khien))');
    // trùm Freezer đóng băng ụ có khiên → bị chặn
    const E = quai(100, { trum: true }); ctx._E = E;
    R('_E.bao = { t: 0, song: 0.01, muc: [_K[0].uid] }; thucHienChieu(_E, G.ban[0]); _E.bao = null;');
    const r = R('[_K[0].khien, _K[0].st.bang, _K[0].tocT, _K[0].tocV]');
    ghi('khien', s + '★: neighbours shielded every ' + KY[s - 1] + 's, no stacking, blocks a boss freeze' + (s >= 7 ? ', block → +20% fire rate 4s' : ''),
      'first at ' + (t1 == null ? 'never' : f2(t1 + dt) + 's') + ' · ' + n + '/4 · max stack ' + n2 + ' · after boss: shield ' + r[0] + ', frozen ' + f2(r[1]) + (s >= 7 ? ', +' + pc(r[3]) + ' ' + f2(r[2]) + 's' : ''),
      t1 != null && Math.abs(t1 + dt - KY[s - 1]) < 0.1 && n === 4 && n2 === 1 && r[0] === 0 && r[1] === 0 && (s < 7 ? !(r[2] > 0) : gan(r[3], 0.2) && gan(r[2], 4)));
  }
});

// =====================================================================================================
// 8) MYSTERY BOX — sau 47 s (3★ 37 s) thành ụ ngẫu nhiên trong bộ (không phải Hộp) min–7★ (1 / 5★ 3 / 7★ 5); dạng 70% / 93%; đòn chọc ~0.3×
// =====================================================================================================
chay('hopbi', () => {
  for (const s of [1, 3, 5, 7]) {
    const can = s >= 3 ? 37 : 47, mn = s >= 7 ? 5 : s >= 5 ? 3 : 1;
    const thay = new Set(), sao = new Set(); let gio = [];
    for (let lan = 0; lan < 24; lan++) {
      moi('solo', ['hopbi', 'lien', 'canon', 'set', 'tia']);
      const T = dat(2, 'hopbi', s); ctx._T = T;
      let t1 = null; buoc(can + 0.3, (x) => { if (t1 == null && R('G.ban[0].t[2] !== _T')) t1 = x; });
      gio.push(t1); const N = R('G.ban[0].t[2]'); thay.add(N.id); sao.add(N.sao);
      if (lan === 0) { // dạng theo đồng hồ
        moi('solo', ['hopbi', 'lien', 'canon', 'set', 'tia']); const T2 = dat(2, 'hopbi', s); ctx._T = T2;
        const g = []; for (const p of [0.5, 0.8, 0.95]) { R('_T.tuoi = ' + (p * can) + '; SKILLS.hopbi.capNhat(G, G.ban[0], _T, 0)'); g.push(R('GROW.hopbi.gd(_T).s')); }
        ghi('hopbi', s + '★ stages: SEALED <70% · UNSEALING 70–93% · ABOUT TO OPEN >93%', 'at 50/80/95%: ' + g.join('/'), g.join() === '1,2,3');
      }
    }
    const okT = gio.every(t => t != null && Math.abs(t + dt - can) < 0.1), saoDs = [...sao].sort();
    ghi('hopbi', s + '★: opens after ' + can + 's into a random deck turret ' + mn + '–7★ (never a Box)', 'opened at ' + f2(gio[0] + dt) + 's · types ' + [...thay].join(',') + ' · stars ' + saoDs.join(','),
      okT && !thay.has('hopbi') && saoDs[0] >= mn && saoDs[saoDs.length - 1] <= 7 && saoDs.length >= Math.min(3, 8 - mn));
  }
  // đòn chọc dạng 1: 0.3 × (10 × 1.65 × sao) — và ăn RAGE ×2
  khongCrit(true);
  for (const rage of [0, 1]) {
    moi('solo', ['hopbi', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'hopbi', 3); const E = quai(300); if (rage) R('G.ban[0].cuong = 99');
    xoaSum(); buoc(4.3); const d = tong(), k = 10 * 1.65 * (1 + 0.85 * 2) * 0.3 * (rage ? 2 : 1) * 3; // 3 phát trong 4.3 s (0.6 rồi mỗi 1.4 s)
    ghi('hopbi', 'stage-1 poke 0.3× (×2 under Archfiend RAGE)' + (rage ? ' — RAGE' : ''), f2(d) + ' vs ' + f2(k), gan(d, k), rage ? 'fixed code: poke ignored RAGE / damage buffs' : '');
  }
  khongCrit(false);
});

// =====================================================================================================
// 9) STAR LIFT — HỖ TRỢ: 2 ụ kề SAO THẤP NHẤT +min(30%, 6%×★) tốc · 5★ mỗi wave 1 nấc cho ụ thấp nhất (3 nấc = +1★, 7★: 2), tối đa 2★/trận
// =====================================================================================================
chay('nangsao', () => {
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['nangsao', 'lien', 'canon', 'set', 'tia']);
    const T = dat(7, 'nangsao', s); const ke = [[2, 1], [6, 2], [8, 3], [12, 4]].map(([o, sa]) => dat(o, 'lien', sa)); ctx._K = ke;
    buoc(dt);
    const b = R('_K.map(X => X.buf.toc - (X.sao >= 3 ? 0.2 : 0))'), k = Math.min(0.3, 0.06 * s);
    ghi('nangsao', s + '★: only the 2 lowest-star neighbours +' + pc(k) + ' fire rate', b.map(pc).join(' / '), gan(b[0], k) && gan(b[1], k) && Math.abs(b[2]) < 1e-9 && Math.abs(b[3]) < 1e-9);
    if (s >= 5) {
      const can = s >= 7 ? 2 : 3; let w0 = 20;
      for (let w = 1; w <= 8; w++) { R('G.wave = ' + (w0 + w)); buoc(dt); }
      const r = R('[_K.map(X => X.sao), G.ban[7] ? 0 : 0]')[0], ct = R(`G.ban[0].t[7].pipDa`);
      const tang = r.reduce((a, x, i) => a + x - (i + 1), 0);
      ghi('nangsao', s + '★: a star pip each wave (' + can + ' pips = +1★), max 2★ per match', '8 waves → +' + tang + '★ (stars ' + r.join('/') + ', used ' + ct + ')', tang === 2 && ct === 2);
    }
  }
});

// =====================================================================================================
// 10) REAPER PILLAR — HỖ TRỢ: ụ kề min(15%, 8%×K) mỗi đòn giết ngay quái thường dưới 30% (5★ 40%); 7★ quái to dưới 15%; trùm: chỉ +≤1% máu tối đa
// =====================================================================================================
chay('tuthan', () => {
  khongCrit(true);
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['tuthan', 'lien', 'canon', 'set', 'tia']);
    const T = dat(7, 'tuthan', s), N = dat(2, 'lien', 1); ctx._T = T; ctx._N = N; buoc(dt);
    const K = R('HOTRO.k(_T)'), p = R('_N.buf.chet'), ng = s >= 5 ? 0.4 : 0.3, kp = Math.min(0.15, 0.08 * K);
    // xác suất đo: 400 đòn vào quái thường còn (ng−5%) máu
    let giet = 0, giet2 = 0, to = 0;
    for (let i = 0; i < 400; i++) {
      const E = quai(300, { hp: 1000 }); ctx._E = E; R('_E.hp = ' + (1000 * (ng - 0.05)) + '; G.dangBan = _N; trung(_E, 1, { B: G.ban[0] }); G.dangBan = null;'); if (R('_E.chet')) giet++;
      const E2 = quai(300, { hp: 1000 }); ctx._E = E2; R('_E.hp = ' + (1000 * (ng + 0.05)) + '; G.dangBan = _N; trung(_E, 1, { B: G.ban[0] }); G.dangBan = null;'); if (R('_E.chet')) giet2++;
      const E3 = quai(300, { hp: 1000, to: true }); ctx._E = E3; R('_E.hp = 100; G.dangBan = _N; trung(_E, 1, { B: G.ban[0] }); G.dangBan = null;'); if (R('_E.chet')) to++;
      R('G.quai.length = 0');
    }
    ghi('tuthan', s + '★: ' + pc(kp) + ' per hit to execute normal enemies under ' + pc(ng) + (s >= 7 ? ', big ones under 15%' : ', never big ones'),
      'chance ' + pc(p) + ' · kills under ' + pc(giet / 400) + ' · above ' + giet2 + ' · big ' + pc(to / 400), gan(p, kp) && Math.abs(giet / 400 - kp) < 0.045 && giet2 === 0 && (s >= 7 ? Math.abs(to / 400 - kp) < 0.045 : to === 0));
  }
  moi('solo', ['tuthan', 'lien', 'canon', 'set', 'tia']); dat(7, 'tuthan', 7); const N = dat(2, 'lien', 1); ctx._N = N; buoc(dt);
  let mx = 0; for (let i = 0; i < 300; i++) { const E = quai(300, { trum: true, hp: 1e6 }); ctx._E = E; R('_E.hp = 1000; G.dangBan = _N; trung(_E, 5, { B: G.ban[0] }); G.dangBan = null;'); mx = Math.max(mx, 1000 - R('_E.hp')); R('G.quai.length = 0'); }
  ghi('tuthan', 'bosses are never executed: proc adds at most 1% max HP', 'worst hit ' + f2(mx) + ' (cap ' + f2(5 + 5) + ', boss alive)', mx <= 10.01 && mx >= 5);
  khongCrit(false);
});

// =====================================================================================================
// 11) SCRAMBLER — khi GHÉP: PVP 1+⌊★/2⌋ ụ đối thủ đổi sang loại khác trong bộ của họ (giữ sao, khiên chặn) · CO-OP/SOLO: biến ụ lẻ thành cặp ghép được
// =====================================================================================================
chay('xaotron', () => {
  for (const s of [1, 3, 5]) {
    moi('pvp', ['xaotron', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
    const D = [0, 1, 2, 3, 4].map(o => dat(o, 'lien', 2, 1)); ctx._D = D;
    const a = dat(5, 'xaotron', s), b = dat(6, 'xaotron', s); ctx._A = [a, b]; R('ghep(G.ban[0], _A[0], _A[1])');
    const r = R('G.ban[1].t.slice(0, 5).map(X => [X.id, X.sao])'), doi = r.filter(q => q[0] !== 'lien').length, n = 1 + Math.floor(s / 2);
    ghi('xaotron', 'PVP ' + s + '★ merge: ' + n + ' rival turrets become another deck type, same ★', doi + ' changed (' + r.map(q => q[0] + q[1]).join(',') + ')', doi === n && r.every(q => q[1] === 2));
  }
  for (const che of ['coop', 'solo']) {
    moi(che, ['xaotron', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
    const bi = che === 'coop' ? 1 : 0;
    dat(10, 'lien', 2, bi); dat(11, 'canon', 2, bi); dat(12, 'set', 3, bi);
    const a = dat(5, 'xaotron', 2), b = dat(6, 'xaotron', 2); ctx._A = [a, b]; R('ghep(G.ban[0], _A[0], _A[1])');
    const r = R(`G.ban[${bi}].t.slice(10, 13).map(X => X.id + X.sao)`);
    ghi('xaotron', che.toUpperCase() + ' merge: a lone turret becomes a mergeable pair', r.join(','), r[0].slice(0, -1) === r[1].slice(0, -1) && r[2] === 'set3');
  }
});

// =====================================================================================================
// 12) OVERCLOCK — kéo lên ụ khác CÙNG SAO (có bắn, cùng bàn): ụ đó +65% tốc bắn vĩnh viễn, cộng dồn; Ép Xung mất
// =====================================================================================================
chay('epxung', () => {
  moi('solo', ['epxung', 'lien', 'canon', 'set', 'tia']);
  const L = dat(2, 'lien', 2), X1 = dat(3, 'epxung', 2), X2 = dat(4, 'epxung', 2), X3 = dat(5, 'epxung', 3), S = dat(6, 'radar', 2);
  const t0 = tocU(L); ctx._A = [X1, L, X2, X3, S];
  const ok1 = R('hopLeGhep(_A[0], _A[1])'), sai = R('hopLeGhep(_A[3], _A[1])'), ht = R('hopLeGhep(_A[2], _A[4])');
  R('ghep(G.ban[0], _A[0], _A[1])'); const t1 = tocU(L); R('ghep(G.ban[0], _A[2], _A[1])'); const t2 = tocU(L);
  const con = R('G.ban[0].t.filter(X => X && X.id === "epxung").length');
  ghi('epxung', 'same-star drag: +65% fire rate, stacks (+130%), Overclock consumed; not onto other star / Support', 'rate ×' + f2(t1 / t0) + ' → ×' + f2(t2 / t0) + ' · left ' + con + ' · diff-star ' + sai + ' · on Radar ' + ht,
    ok1 && !sai && !ht && gan(t1 / t0, 1.65) && gan(t2 / t0, 2.3) && con === 1);
});

// =====================================================================================================
// 13) FIFTH SHOT — phát 1–4 = 1×; phát thứ 5 = 3 mũi nổ, mỗi mũi 2× trong 34 px → 5 phát = 10× (1 quái)
// =====================================================================================================
chay('no5', () => {
  khongCrit(true);
  for (const s of [1, 4]) {
    moi('solo', ['no5', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'no5', s); const E = quai(300); ctx._T = T; ctx._E = E;
    let sum = 0; for (let i = 1; i <= 5; i++) { R('_T.banLan = ' + i); sum += motPhat(T, E, 1.2); }
    const k = dmgU(T) * 10;
    ghi('no5', s + '★: 5 shots on one enemy = 4×1 + 3 bolts × 2 = 10× damage', f2(sum) + ' vs ' + f2(k), gan(sum, k));
    const E2 = quai(330), E3 = quai(360); R('_T.banLan = 5'); xoaSum(); motPhat(T, E, 1.2); ctx._E = [E, E2, E3];
    const per = R('_E.map(E => G._per.get(E) || 0)');
    ghi('no5', s + '★: 5th shot spreads to the 2 nearest enemies (34 px blasts)', per.map(f2).join(' / '), per.every(x => x > 0));
  }
  khongCrit(false);
});

// =====================================================================================================
// 14) STORM GUN — trúng tức thì 4.5/s (+5%/★), 20% nảy sang quái thứ 2 ×0.7; mỗi Súng Bão kề −30% tốc (không âm)
// =====================================================================================================
chay('bao', () => {
  khongCrit(true);
  moi('solo', ['bao', 'lien', 'canon', 'set', 'tia']);
  const T = dat(7, 'bao', 1); const E = quai(300); ctx._T = T;
  const d = motPhat(T, E, 0.05); ghi('bao', 'instant hit = 1× damage (no projectile)', f2(d) + ' vs ' + f2(dmgU(T)) + ' in 0.05s', gan(d, dmgU(T)));
  for (const n of [0, 1, 2, 4]) {
    moi('solo', ['bao', 'lien', 'canon', 'set', 'tia']); const T2 = dat(7, 'bao', 2); [2, 6, 8, 12].slice(0, n).forEach(o => dat(o, 'bao', 1)); buoc(dt);
    const t = tocU(T2), k = 4.5 * 1.05 * Math.max(0.1, 1 - 0.3 * n);
    ghi('bao', '2★ next to ' + n + ' Storm Gun(s): ' + f2(k) + ' hits/s' + (n === 4 ? ' (floored, never negative)' : ''), f2(t) + '/s', gan(t, k), n === 4 ? 'fixed code: 4 neighbours gave −20% total → negative fire rate (never shot)' : '');
  }
  // nảy 20% ×0.7: 2 quái gần nhau, 600 phát
  moi('solo', ['bao', 'lien', 'canon', 'set', 'tia']); const T3 = dat(7, 'bao', 1); const A = quai(300), B2 = quai(320); ctx._T = T3; ctx._E = [A, B2];
  xoaSum(); R('for (let i = 0; i < 600; i++) { G.dangBan = _T; SKILLS.bao.ban(G, G.ban[0], _T, _E[0]); } G.dangBan = null;');
  const p = R('_E.map(E => G._per.get(E) || 0)'), arc = p[1] / p[0];
  ghi('bao', '20% of hits arc to a 2nd enemy at 0.7× (avg +14%)', 'arc share ' + pc(arc) + ' of main', Math.abs(arc - 0.14) < 0.03);
  khongCrit(false);
});

// =====================================================================================================
// 15) LIGHTHOUSE — đạn ×(1+15%×★); cứ max(9, 21−1.6★) s gọi 1 ụ 1★ miễn phí (khi còn ô trống)
// =====================================================================================================
chay('anhsang', () => {
  khongCrit(true);
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['anhsang', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'anhsang', s); const E = quai(300); ctx._T = T;
    const d = motPhat(T, E, 1.5), k = dmgU(T) * (1 + 0.15 * s);
    const ky = Math.max(9, 21 - 1.6 * s); R('_T.nap = 0; _T.cd = 1e9');
    let t1 = null; buoc(ky + 0.3, (x) => { R('_T.cd = 1e9'); if (t1 == null && R('G.ban[0].t.filter(Boolean).length') > 1) t1 = x; });
    const nt = R('G.ban[0].t.filter(X => X && X !== _T).map(X => X.sao)');
    ghi('anhsang', s + '★: shot ×' + f2(1 + 0.15 * s) + ', free 1★ summon every ' + f2(ky) + 's', f2(d) + ' vs ' + f2(k) + ' · summon at ' + (t1 == null ? 'never' : f2(t1 + dt) + 's') + ' ' + nt.join(',') + '★',
      gan(d, k) && t1 != null && Math.abs(t1 + dt - ky) < 0.1 && nt.length === 1 && nt[0] === 1 && R('G.ban[0].mana') === 0);
  }
  khongCrit(false);
});

// =====================================================================================================
// 16) RICOCHET — nảy ★ lần (≤90 px, không trúng lại), lần nảy thứ i ×(1 + b·i), b = 15/15/18/18/20/22/25%
// =====================================================================================================
chay('nayda', () => {
  khongCrit(true);
  const BB = [0.15, 0.15, 0.18, 0.18, 0.2, 0.22, 0.25];
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['nayda', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'nayda', s);
    const ds = []; for (let i = 0; i < 9; i++) ds.push(quai(200 + i * 40));
    const d = motPhat(T, ds[8], 3); let k = 0; for (let i = 0; i <= s; i++) k += 1 + BB[s - 1] * i; k *= dmgU(T);
    ctx._E = ds; const trungN = R('_E.filter(E => G._per.get(E) > 0).length');
    ghi('nayda', s + '★: ' + s + ' bounces (+' + pc(BB[s - 1]) + ' each) → ' + (s + 1) + ' enemies, total ×' + f2(k / dmgU(T)), f2(d / dmgU(T)) + '× on ' + trungN + ' enemies', gan(d, k) && trungN === s + 1);
  }
  moi('solo', ['nayda', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'nayda', 7); const a = quai(200), b = quai(600);
  const d = motPhat(T, a, 3); ghi('nayda', 'no enemy within 90 px → the disc stops (no re-hit)', f2(d / dmgU(T)) + '×', gan(d, dmgU(T)));
  khongCrit(false);
});

// =====================================================================================================
// 17) COMBO CORE — mỗi lần GHÉP Combo+Combo (hoặc Mimic+Combo): COMBO+1; mọi Combo Core +c×COMBO sát thương (c 6→12%), quá 20 chỉ tính ½; đạn đôi 2×0.5
// =====================================================================================================
chay('combo', () => {
  const C = [0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12];
  moi('solo', ['combo', 'mimic', 'canon', 'set', 'tia']);
  const giu = dat(14, 'combo', 5);
  for (const cap of [['combo', 'combo'], ['mimic', 'combo'], ['canon', 'canon']]) { const a = dat(0, cap[0], 1), b = dat(1, cap[1], 1); ctx._A = [a, b]; R('ghep(G.ban[0], _A[0], _A[1]); G.ban[0].t[1] = null;'); }
  ctx._T = giu; buoc(dt);
  const n = R('G.ban[0].combo'), b = R('_T.buf.dmg');
  ghi('combo', 'Combo+Combo and Mimic+Combo count, other merges do not; 5★ +10% per combo', 'COMBO ' + n + ' → +' + pc(b), n === 2 && gan(b, 0.2));
  R('G.ban[0].combo = 30'); buoc(dt); const b2 = R('_T.buf.dmg'), gd = R('GROW.combo.gd(_T).s');
  ghi('combo', 'COMBO 30 → 20 + 10×½ = 25 effective → +250% at 5★, stage 3 (OVERDRIVE)', '+' + pc(b2) + ' · stage ' + gd, gan(b2, 2.5) && gd === 3);
  for (const s of [1, 7]) { R('G.ban[0].combo = 4'); const T = dat(13, 'combo', s); ctx._T = T; buoc(dt); ghi('combo', s + '★: +' + pc(C[s - 1]) + ' per combo', '+' + pc(R('_T.buf.dmg') / 4), gan(R('_T.buf.dmg'), C[s - 1] * 4)); }
  moi('coop', ['combo', 'lien', 'canon', 'set', 'tia'], ['combo', 'lien', 'canon', 'set', 'tia']); R('G.ban[0].combo = 4; G.ban[1].combo = 6'); const T = dat(2, 'combo', 1); ctx._T = T; buoc(dt);
  ghi('combo', 'CO-OP: both decks have Combo Core → +½ of ally COMBO', '+' + pc(R('_T.buf.dmg')) + ' (expect ' + pc(0.06 * 7) + ')', gan(R('_T.buf.dmg'), 0.06 * 7));
  khongCrit(true); moi('solo', ['combo', 'lien', 'canon', 'set', 'tia']); const T2 = dat(2, 'combo', 3); const E = quai(300);
  const d = motPhat(T2, E, 1.5); ghi('combo', 'twin barrel: 2 rounds × 0.5 = 1× per shot', f2(d) + ' vs ' + f2(dmgU(T2)), gan(d, dmgU(T2))); khongCrit(false);
});

// =====================================================================================================
// 18) CHRONO LOCK — mỗi ky s khoá quái đầu (không trùm) dai s; mở khoá nổ no% sát thương đã dồn (40 px); trùm: ½ thời gian, chậm 50%, nổ ½
// =====================================================================================================
chay('khoathoigian', () => {
  khongCrit(true);
  const KY = [9, 8.5, 8, 7.5, 7, 6.5, 6], DAI = [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5], NO = [0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.75];
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['khoathoigian', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'khoathoigian', s); ctx._T = T;
    const E = quai(310), E2 = quai(300); ctx._E = [E, E2];
    let t1 = null, tHet = null;
    buoc(KY[s - 1] + DAI[s - 1] + 0.5, (x) => { R('_T.cd = 1e9'); const k = R('!!_E[0].khoaHu'); if (k && t1 == null) { t1 = x; xoaSum(); R('G.dangBan = null; trung(_E[0], 1000, { T: null, B: G.ban[0] })'); } if (!k && t1 != null && tHet == null) tHet = x; });
    const per = R('_E.map(E => G._per.get(E) || 0)'), burst = NO[s - 1] * 1000;
    const ky = KY[s - 1] / (s >= 3 ? 1.2 : 1), mo = R('SKILLS.khoathoigian.mo(_T)');
    ghi('khoathoigian', s + '★: locks the lead enemy every ' + f2(ky) + 's (' + KY[s - 1] + 's' + (s >= 3 ? ' ÷ QUICK HANDS 1.2' : '') + ') for ' + DAI[s - 1] + 's, release bursts ' + pc(NO[s - 1]) + ' of stored damage (40 px); tap text shows the real period',
      'lock at ' + (t1 == null ? 'never' : f2(t1 + dt)) + 's for ' + (tHet == null ? '?' : f2(tHet - t1)) + 's · burst ' + f2(per[0] - 1000) + ' / neighbour ' + f2(per[1]) + ' · text "' + mo.slice(0, 16) + '…"',
      mo.includes('Every ' + ky.toFixed(1) + 's') && t1 != null && Math.abs(t1 + dt - ky) < 0.1 && tHet != null && Math.abs(tHet - t1 - DAI[s - 1]) < 0.1 && gan(per[0] - 1000, burst) && gan(per[1], burst), s === 3 ? 'fixed text: 3★+ QUICK HANDS (+20% speed) also shortens the lock cycle; text showed the base period' : '');
  }
  moi('solo', ['khoathoigian', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'khoathoigian', 5); const E = quai(300, { trum: true }); ctx._T = T; ctx._E = E;
  R('SKILLS.khoathoigian.khoa(G, G.ban[0], _T, 5)'); const o = R('G.hu.find(h => h.k === "khoa")');
  ghi('khoathoigian', 'boss: half lock time, 50% slow, half burst', 'lock ' + f2(o.song) + 's · burst ' + pc(o.pct), gan(o.song, 1) && gan(o.pct, 0.25));
  khongCrit(false);
});

// =====================================================================================================
// 19) LONE ACE — 4 ô kề N/E/S/W TRỐNG → ACE +100% tốc, +a% chí mạng (10→25%), 7★ xuyên 1; ≥3 ụ kề → −30% tốc; ô CHÉO không tính
// =====================================================================================================
chay('docton', () => {
  const A = [0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.25];
  for (const s of [1, 3, 5, 7]) {
    for (const ke of [0, 2, 3]) {
      moi('solo', ['docton', 'lien', 'canon', 'set', 'tia', 'luoicheo']); const T = dat(7, 'docton', s); [2, 6, 8].slice(0, ke).forEach(o => dat(o, 'lien', 1)); dat(1, 'lien', 1); buoc(dt); ctx._T = T;
      const b = R('_T.buf.toc') - (s >= 3 ? 0.2 : 0), cr = R('_T.buf.crit'), kb = ke === 0 ? 1 : ke >= 3 ? -0.3 : 0;
      ghi('docton', s + '★ with ' + ke + ' N/E/S/W neighbours (+1 diagonal): ' + (ke === 0 ? 'ACE +100% fire rate, +' + pc(A[s - 1]) + ' crit' : ke >= 3 ? '−30% fire rate' : 'normal'), 'rate ' + pc(b) + ' · crit +' + pc(cr) + ' · ace ' + R('_T.ace'), gan(b, kb) && gan(cr, ke === 0 ? A[s - 1] : 0), s === 1 && ke === 0 ? 'fixed text: said "double fire rate"; it is +100% added to other fire-rate bonuses (EN text, tap text, roster VI)' : '');
    }
  }
  khongCrit(true);
  moi('solo', ['docton', 'lien', 'canon', 'set', 'tia']); const T = dat(7, 'docton', 7); buoc(dt); const E = quai(300), E2 = quai(330); ctx._T = T; ctx._E = [E, E2];
  R('{ const [x, y] = dauNong(_T), g = Math.atan2(_E[0].y - y, _E[0].x - x); _E[1].x = _E[0].x + Math.cos(g) * 40; _E[1].y = _E[0].y + Math.sin(g) * 40; }');
  xoaSum(); R('G.dangBan = _T; SKILLS.docton.ban(G, G.ban[0], _T, _E[0]); G.dangBan = null;'); const d = tong(); ghi('docton', '7★ ACE: shots pierce 1 enemy behind (2× total on 2 enemies)', f2(d / dmgU(T)) + '×', gan(d, 2 * dmgU(T)));
  khongCrit(false);
});

// =====================================================================================================
// 20) FOCUS LENS — HỖ TRỢ: ụ kề +min(50%, 14%×K) sát thương chí mạng; chí mạng xuyên 1 quái phía sau 50% (5★ 2 quái, 7★ 65%)
// =====================================================================================================
chay('thaukinh', () => {
  for (const s of [1, 3, 5, 7]) {
    moi('solo', ['thaukinh', 'cuongno', 'canon', 'set', 'tia']); const T = dat(7, 'thaukinh', s), N = dat(2, 'cuongno', 1); ctx._T = T; ctx._N = N; buoc(dt);
    const K = R('HOTRO.k(_T)'), cd = R('_N.buf.cdmg'), kc = Math.min(0.5, 0.14 * K), xu = s >= 5 ? 2 : 1, pp = s >= 7 ? 0.65 : 0.5;
    const E = quai(300), E2 = quai(280), E3 = quai(260), E4 = quai(200); ctx._E = [E, E2, E3, E4]; xoaSum();
    R('G.dangBan = _N; trung(_E[0], 100, { B: G.ban[0], crit: true }); G.dangBan = null;');
    const per = R('_E.map(E => G._per.get(E) || 0)'), main = 100 * (2 + kc);
    ghi('thaukinh', s + '★: neighbour crits ×' + f2(2 + kc) + ', pierce ' + xu + ' enemy behind at ' + pc(pp),
      'cdmg +' + pc(cd) + ' · hits ' + per.map(f2).join('/'), gan(cd, kc) && gan(per[0], main) && gan(per[1], main * pp) && (xu === 2 ? gan(per[2], main * pp) : per[2] === 0) && per[3] === 0, s === 7 ? 'fixed text: 7★ TRUE FOCUS milestone was missing from the star list' : '');
  }
});

// =====================================================================================================
// 21) SIGNAL JAMMER — khi GHÉP (sao kết quả S): PVP sau 0.65 s nhiễu n(S) ụ đối thủ −40% t(S) s + lần triệu hồi kế +m(S) mana · CO-OP đồng đội triệu hồi kế miễn phí + 10% tốc · SOLO quái chậm 20%
// =====================================================================================================
chay('nhieusong', () => {
  const N = [1, 1, 2, 2, 3, 3, 4], TT = [3, 3.5, 4, 4.5, 5, 5.5, 6], MM = [5, 5, 10, 10, 15, 15, 20];
  for (const s of [1, 2, 4, 6]) {
    const S = s + 1;
    moi('pvp', ['nhieusong', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
    const D = [0, 1, 2, 3, 4, 5].map(o => dat(o, 'lien', 1, 1)); ctx._D = D;
    const a = dat(5, 'nhieusong', s), b = dat(6, 'nhieusong', s); ctx._A = [a, b];
    const mo = R('SKILLS.nhieusong.mo(_A[0])');
    R('G.ban[1].gia = 10; G.ban[1].mana = 1000; ghep(G.ban[0], _A[0], _A[1])');
    const k0 = R('_D.filter(X => X.st.kep > 0).length'); buoc(0.7); const k = R('_D.filter(X => X.st.kep > 0).map(X => X.st.kep)');
    const gia = R('G.ban[1].gia'); R('trieu(G.ban[1])'); const gia2 = R('G.ban[1].gia'), mana = R('G.ban[1].mana');
    const okMo = mo.includes('jams ' + N[S - 1] + ' ') && mo.includes(TT[S - 1] + 's') && mo.includes('+' + MM[S - 1] + ' mana');
    ghi('nhieusong', 'PVP ' + s + '★ merge (→' + S + '★): after 0.65s jams ' + N[S - 1] + ' rival turrets −40% ' + TT[S - 1] + 's; their next summon +' + MM[S - 1] + ' mana; tap text shows the same',
      'before 0.65s ' + k0 + ' · jammed ' + k.length + ' (' + k.map(f2).join('/') + 's) · price 10→' + gia + ', paid ' + (1000 - mana) + ', next ' + gia2 + ' · text ' + (okMo ? 'matches' : 'MISMATCH'),
      k0 === 0 && k.length === N[S - 1] && k.every(x => Math.abs(x - (TT[S - 1] - 0.05)) < 0.1) && gia === 10 + MM[S - 1] && 1000 - mana === 10 + MM[S - 1] && gia2 === 20 && okMo, s === 1 ? 'fixed text: tap panel showed the numbers of the current star, the merge uses the result star' : '');
  }
  moi('coop', ['nhieusong', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']);
  const D = [0, 1].map(o => dat(o, 'lien', 1, 1)); ctx._D = D; const a = dat(5, 'nhieusong', 3), b = dat(6, 'nhieusong', 3); ctx._A = [a, b];
  R('G.ban[1].mana = 0; ghep(G.ban[0], _A[0], _A[1]); trieu(G.ban[1]);');
  const r = R('[G.ban[1].t.filter(Boolean).length, G.ban[1].mana, _D[0].tocT, _D[0].tocV]');
  ghi('nhieusong', 'CO-OP 3★ merge: ally next summon FREE + ally Attack turrets +10% fire rate 4.5s', 'ally turrets 2→' + r[0] + ' with 0 mana · +' + pc(r[3]) + ' ' + f2(r[2]) + 's', r[0] === 3 && r[1] === 0 && gan(r[3], 0.1) && gan(r[2], 4.5));
  moi('solo', ['nhieusong', 'lien', 'canon', 'set', 'tia']); const E = quai(300); const a2 = dat(5, 'nhieusong', 3), b2 = dat(6, 'nhieusong', 3); ctx._A = [a2, b2]; ctx._E = E;
  R('ghep(G.ban[0], _A[0], _A[1])');
  ghi('nhieusong', 'SOLO 3★ merge: all enemies slowed 20% for 4.5s', 'slow ' + pc(R('_E.cham')) + ' ' + f2(R('_E.chamT')) + 's', gan(R('_E.cham'), 0.2) && gan(R('_E.chamT'), 4.5));
});

// =====================================================================================================
// 22) BOUNTY BEACON — mỗi 5 s gắn TRUY NÃ n quái (to/nhiều máu trước): +10% sát thương nhận (chung trần suy yếu 25%), chết → +g mana (trùm ×5, co-op chia đôi)
// =====================================================================================================
chay('santhuong', () => {
  const NN = [1, 1, 2, 2, 2, 3, 3], GG = [2, 3, 3, 4, 5, 5, 6];
  for (const s of [1, 3, 6]) {
    moi('solo', ['santhuong', 'lien', 'canon', 'set', 'tia']); const T = dat(2, 'santhuong', s); ctx._T = T;
    const ds = [quai(100), quai(150, { to: true }), quai(200), quai(250, { to: true }), quai(300)]; ctx._E = ds;
    let t1 = null; buoc(5.2, (x) => { R('_T.cd = 1e9'); if (t1 == null && R('_E.some(E => E.truyNa)')) t1 = x; });
    const m = R('_E.map(E => !!E.truyNa)'), so = m.filter(Boolean).length, toTruoc = m[1] && (so < 2 || m[3]);
    const i = m.indexOf(true); ctx._i = i;
    R('G.ban[0].mana = 0; G.dangBan = null; trung(_E[_i], 2e9, { B: G.ban[0] })'); const m1 = R('G.ban[0].mana');
    const U = quai(400, { id: R('_E[_i].id'), to: R('!!_E[_i].d.to') }); ctx._U = U; R('_U.truyNa = null; G.ban[0].mana = 0; trung(_U, 2e9, { B: G.ban[0] })'); const m2 = R('G.ban[0].mana');
    const ky = 5 / (s >= 3 ? 1.2 : 1), mo = R('SKILLS.santhuong.mo(_T)');
    ghi('santhuong', s + '★: marks ' + NN[s - 1] + ' enemies every ' + f2(ky) + 's (5s; 3★ QUICK HANDS +20% speed), big first; a marked kill +' + GG[s - 1] + ' bonus mana; tap text shows the real period',
      'mark at ' + (t1 == null ? 'never' : f2(t1 + dt)) + 's · marked ' + so + ' (big first ' + toTruoc + ') · bonus +' + (m1 - m2) + ' · text "' + mo.slice(0, 16) + '…"',
      t1 != null && Math.abs(t1 + dt - ky) < 0.1 && so === NN[s - 1] && toTruoc && m1 - m2 === GG[s - 1] && mo.includes('Every ' + ky.toFixed(1) + 's'), s === 3 ? 'fixed text: at 3★+ the common QUICK HANDS (+20% speed) also speeds marking; text said 5s' : '');
  }
  khongCrit(true);
  moi('solo', ['santhuong', 'lien', 'canon', 'set', 'tia']); const L = dat(2, 'lien', 1); const E = quai(300); ctx._E = E; ctx._L = L;
  R('_E.truyNa = { B: G.ban[0], g: 3 }'); xoaSum(); R('G.dangBan = _L; trung(_E, 100, { B: G.ban[0] }); G.dangBan = null;'); const d1 = tong();
  R('_E.vmT = 9; _E.vmK = 0.12; _E.ywT = 9; _E.ywK = 0.10;'); xoaSum(); R('G.dangBan = _L; trung(_E, 100, { B: G.ban[0] }); G.dangBan = null;'); const d2 = tong();
  ghi('santhuong', 'marked: +10% damage taken; with Venom 12% + Time Bomb 10% the total stays at the 25% weakness cap', f2(d1) + ' · stacked ' + f2(d2), gan(d1, 110) && gan(d2, 125), 'fixed code: Bounty +10% used to multiply on top of the 25% cap (→ 137.5)');
  khongCrit(false);
  moi('coop', ['santhuong', 'lien', 'canon', 'set', 'tia'], ['lien', 'canon', 'set', 'sungluc', 'tia']); const E2 = quai(300, { trum: true }); ctx._E = E2;
  R('G.ban[0].mana = 0; G.ban[1].mana = 0; _E.truyNa = { B: G.ban[0], g: 4 }; G.dangBan = null; trung(_E, 2e9, { B: G.ban[0] })');
  const mm = R('[G.ban[0].mana, G.ban[1].mana]');
  ghi('santhuong', 'CO-OP: marked boss ×5 bounty split between both boards', mm.join(' + ') + ' (base 4×5 = 20)', mm[0] >= 10 && mm[1] >= 10 && mm[1] === 10);
});

// =====================================================================================================
// 23) TƯƠNG TÁC HỖ TRỢ / BUFF (trần HOTRO.CAP) + RAGE + chạy SOLO/CO-OP/PVP không lỗi
// =====================================================================================================
chay('tuongtac', () => {
  // tốc bắn: Radar 7★ + Star Lift 7★ + Fusion Mixer kề Berserker → buff hỗ trợ tốc ≤ 45%
  moi('solo', ['cuongno', 'radar', 'nangsao', 'tron', 'tia']); const T = dat(7, 'cuongno', 1); dat(2, 'radar', 7); dat(6, 'nangsao', 7); dat(8, 'tron', 7); buoc(dt); ctx._T = T;
  const toc = R('_T.nguon.filter(n => n.k === "toc").reduce((a, n) => a + n.v, 0)');
  ghi('tuongtac', 'Radar 7★ + Star Lift 7★ + Fusion Mixer 7★ on Berserker: support fire rate capped at +45%', '+' + pc(toc) + ' (buf ' + pc(R('_T.buf.toc')) + ')', gan(toc, 0.45));
  // sát thương: Amplifier + Resonance Grid (chéo) + Cleanser lên Chain Link → ≤ 35% từ hỗ trợ; Chain Link +40%/ụ là kỹ năng riêng, cộng ngoài trần
  moi('solo', ['lienket', 'khuech', 'luoicheo', 'taylo', 'tia']); const C = dat(7, 'lienket', 1); dat(8, 'lienket', 1); dat(1, 'luoicheo', 7); dat(2, 'taylo', 7); dat(12, 'khuech', 7); buoc(dt); ctx._T = C;
  const dmg = R('_T.nguon.filter(n => n.k === "dmg" && !n.dk).reduce((a, n) => a + n.v, 0)'), b = R('_T.buf.dmg');
  ghi('tuongtac', 'Chain Link (2 linked) + Grid diagonal + Cleanser: support damage ≤35%, chain +40% added on top', 'support +' + pc(dmg) + ' · total buf +' + pc(b), dmg <= 0.35 + 1e-9 && gan(b - dmg, 0.4));
  // chí mạng: Crit Antenna 7★ + Hammer 7★ kề Berserker → +20 điểm trần; Focus Lens + Hammer sát thương chí mạng ≤ 50%
  moi('solo', ['cuongno', 'chimang', 'bua', 'thaukinh', 'tia']); const B1 = dat(7, 'cuongno', 1); dat(2, 'chimang', 7); dat(6, 'bua', 7); dat(8, 'thaukinh', 7); buoc(dt); ctx._T = B1;
  ghi('tuongtac', 'Crit Antenna + Hammer on Berserker: crit ≤ +20 pts; Hammer + Focus Lens crit damage ≤ +50%', 'crit +' + pc(R('_T.buf.crit')) + ' · cdmg +' + pc(R('_T.buf.cdmg')), R('_T.buf.crit') <= 0.2 + 1e-9 && R('_T.buf.cdmg') <= 0.5 + 1e-9 && R('_T.buf.cdmg') > 0.3);
  // Chiller: Storm Gun hits slow ≤35%, boss ≤15%
  khongCrit(true);
  moi('solo', ['bao', 'lanhgia', 'canon', 'set', 'tia']); const S = dat(7, 'bao', 1); dat(2, 'lanhgia', 7); buoc(dt); const E = quai(300), Bo = quai(320, { trum: true }); ctx._T = S; ctx._E = [E, Bo];
  R('G.dangBan = _T; trung(_E[0], 1, { B: G.ban[0] }); trung(_E[1], 1, { B: G.ban[0] }); G.dangBan = null;');
  const ch = R('_E.map(E => E.cham)');
  ghi('tuongtac', 'Chiller 7★ next to Storm Gun: its hits slow ≤35% (boss ≤15%)', ch.map(pc).join(' / '), ch[0] > 0 && ch[0] <= 0.35 + 1e-9 && ch[1] > 0 && ch[1] <= 0.15 + 1e-9);
  // RAGE ×2 trên mọi ụ tím bắn
  let sai = [];
  for (const id of ['cuongno', 'lienket', 'no5', 'bao', 'anhsang', 'nayda', 'combo', 'docton', 'khoathoigian', 'santhuong', 'nhanban', 'kepha', 'xaotron', 'epxung', 'nhieusong']) {
    moi('solo', [id, 'lien', 'canon', 'set', 'tia']); const T2 = dat(2, id, 3); const E2 = quai(300); const d0 = motPhat(T2, E2, 1.5); R('G.ban[0].cuong = 99'); const d1 = motPhat(T2, E2, 1.5);
    if (!gan(d1, 2 * d0)) sai.push(id + ' ×' + f2(d1 / d0));
  }
  ghi('tuongtac', 'Archfiend RAGE: +100% damage on every Epic shot (15 shooters)', sai.length ? sai.join(', ') : 'all ×2.00', !sai.length);
  khongCrit(false);
  // DPS tăng theo sao (không buff): 1★ < 3★ < 5★ < 7★ và 7★ ≥ 4× 1★
  const bang = [];
  for (const id of ['cuongno', 'lienket', 'no5', 'bao', 'anhsang', 'nayda', 'combo', 'docton']) {
    const v = [1, 3, 5, 7].map(s => { moi('solo', [id, 'lien', 'canon', 'set', 'tia']); dat(2, id, s); quai(300); return dps(20); });
    bang.push(TEN(id) + ' ' + v.map(x => x.toFixed(0)).join('/'));
    ghi('tuongtac', TEN(id) + ': DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★', v.map(x => x.toFixed(0)).join(' / ') + ' (×' + f2(v[3] / v[0]) + ')', v[0] < v[1] && v[1] < v[2] && v[2] < v[3] && v[3] >= 4 * v[0]);
  }
  // không lỗi: SOLO / CO-OP / PVP 60 s, AI tự chơi, mỗi ụ tím + bộ đối thủ có Clamp / Scrambler / Signal Jammer
  let hong = [];
  for (const che of ['solo', 'coop', 'pvp']) for (const id of TIM) {
    try {
      ctx._a = [che, [id, 'lien', 'canon', 'radar', 'thaukinh'], [id === 'kepha' ? 'xaotron' : 'kepha', 'xaotron', 'nhieusong', 'lien', 'canon']];
      R(`G.debug = { auto: true, deck2: _a[2], mana: 3000, wave: 9, fill: 5 }; batDau(_a[0], _a[1], 'hero');`);
      buoc(60);
    } catch (e) { hong.push(che + ':' + id + ' ' + e.message.split('\n')[0]); }
  }
  ghi('tuongtac', 'SOLO / CO-OP / PVP 60s with each Epic + rival Clamp/Scrambler/Signal Jammer: no errors', hong.length ? hong.slice(0, 3).join(' | ') : '66 runs clean', !hong.length);
});

// ---------- in kết quả ----------
const md = process.argv[2] === 'md';
if (md) {
  console.log('| Turret | Claim (text / code) | Measured | Status | Note |'); console.log('|---|---|---|---|---|');
  for (const k of KQ) console.log('| ' + (k.id === 'chung' || k.id === 'tuongtac' ? (k.id === 'chung' ? 'All Epic' : 'Interactions') : TEN(k.id)) + ' | ' + k.claim.replace(/\|/g, '/') + ' | ' + k.doDuoc.replace(/\|/g, '/') + ' | ' + (k.ok ? (k.note.startsWith('fixed code') ? 'fixed code' : k.note.startsWith('fixed text') ? 'fixed text' : 'OK') : 'FAIL') + ' | ' + k.note.replace(/^fixed (code|text): ?/, '') + ' |');
} else {
  for (const k of KQ) console.log((k.ok ? 'OK  ' : 'FAIL') + ' ' + k.id.padEnd(12) + ' ' + k.claim + ' → ' + k.doDuoc);
  console.log('\n' + KQ.length + ' checks, ' + loi + ' failed');
}
if (loi) process.exitCode = 1;
if (process.env.QA_DBG) { module.exports = { R, ctx, moi, dat, quai, buoc, motPhat, khongCrit }; }
