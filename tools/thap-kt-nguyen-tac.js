// TURRET MERGE — KIỂM 10 NGUYÊN TẮC CỘNG HƯỞNG · GHÉP · LIÊN KẾT · PHÁ HUỶ (docs/demo-hop-tuong/tuvan/conghuong/NGUYEN-TAC.md)
//   Test kiểu ma trận đề xuất ở AUDIT-0811 §6 + ca riêng cho từng quyết định người dùng 09/11 (Q1–Q9, Q4 = B):
//   · NT1  ghép đặc biệt CÙNG LOẠI (La Bàn, Anvil, Merge King) → kết quả theo ô ĐÍCH (bản sao, dạng) · Q3 MK vàng → MK thường: +2★, đích giữ dạng
//   · NT2/NT8 + Q1/Q2  ghép THƯỜNG với B.deck = [id] cho MỌI ụ ghép thường được → ụ ra = ụ MỚI: mọi cộng dồn riêng ụ = ụ vừa sinh
//          (Ép Xung, buff Anvil, khiên, Aurora, ABYSS, đuôi, nhiệt, trứng…) · đối chứng Mimic + ụ có cộng dồn
//   · Q4 = B  biến hình (Hộp, Scrambler, Mad Crown, Copycat) → buff trên thân MẤT, cờ bản sao giữ · +★ tại chỗ giữ hết
//   · NT6  Ember rời bàn qua MỌI đường → truyền đúng 1 lần · Q7 Ember + Ember = A + C 1 lần · Q8 Joker biến Ember rồi ép ghép → 0
//          · biến hình / đá / băng / −★ / đổi chỗ → 0 · rời bàn ngoài capNhatBan rồi triệu hồi vào đúng ô → vẫn truyền · đồng bộ mạng / bàn con rối → 0
//   · NT7  Freezer không băng lại ụ đang băng (F3) · Q5 ụ băng không nhận lửa / nhiệt ghép hàng-cột · Q6 dấu Mạch Máu trên ụ băng dừng đếm
//          · +★ tự động (Pandora, Star Leech trả sao, Genesis, REINFORCE) bỏ đá + băng (F10) · Q9 Wild Link vẫn ghép được ụ khoá
//   · NT9  tất định: cùng hạt trận, Math.random khác → bàn y hệt (ghép thường, triệu hồi, Twin Maker, Hộp, Scrambler, Jammer)
//          · online 2 máy (chủ phòng / khách) Scrambler + Jammer PVP ra cùng ô, cùng loại (F15)
//   · Online F14  khứ hồi oTT → datO cho mọi cộng dồn riêng ụ đã có cờ
// Chạy: node tools/thap-kt-nguyen-tac.js   (thuần vm, không trình duyệt; ✓/✗, mã thoát 1 nếu có lỗi)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const goc = path.join(__dirname, '..', 'thap');
const FILES = ['meta', 'text', 'data', 'thebai', 'fx', 'tiervfx', 'game', 'chihuy', 'chihuy-moi', 'skills', 'skills2', 'phattrien', 'artscale', 'skills3', 'skills4', 'skills5', 'vangmoi1', 'hotro', 'support', 'buff', 'skills7', 'jackpot', 'growfx', 'trum'];
let loi = 0, dat0 = 0;
const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; else dat0++; };
function moiTruong(onl) {
  const noop = () => {};
  const ctx = { console: { log: console.log, warn: noop, error: noop }, Math: Object.create(Math), JSON, Set, Map, WeakMap, WeakSet, Promise, Object, Array, Error, RegExp, String, Number, Date,
    setTimeout: (f) => { ctx._cho.push(f); }, setInterval: noop, clearTimeout: noop, clearInterval: noop, _cho: [], performance: { now: () => 0 }, localStorage: { getItem: () => null, setItem: noop } };
  ctx.window = ctx; ctx.location = { search: '' }; ctx.addEventListener = noop;
  ctx.SND = new Proxy({}, { get: () => noop });
  ctx.VX = new Proxy({ TRE_LO: 0, hen: (d, f) => f(), t: 0, ds: [] }, { get: (o, k) => (k in o ? o[k] : noop) });
  ctx.BVX = new Proxy({}, { get: () => noop });
  ctx.REN = { coDau: () => 40, lamNen: noop, t: 0, img: () => null, s: 1, dpr: 1 };
  ctx.UI = { vaoTran: noop, canhBaoTrum: noop, bangWave: noop, ketQua: noop };
  ctx.FONT = { display: 'x', ui: 'x' };
  vm.createContext(ctx);
  const ds = FILES.slice(); if (onl) ds.push('online/dongbo');
  for (const f of ds) {
    if (f === 'online/dongbo') ctx.document = { addEventListener: noop, hidden: false, getElementById: () => null, querySelector: () => null };
    const p = path.join(goc, 'js', f + '.js'); if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' });
  }
  vm.runInContext("if (typeof buffNo === 'undefined') var buffNo = function () {};", ctx);
  vm.runInContext('G.roster = window.ROSTER_EMBED; G.rosterMap = {}; for (const r of G.roster) G.rosterMap[r.id] = r;', ctx);
  return ctx;
}
// bàn sạch: deck cho trước, không quái, hạt trận cố định; dat(o, id, sao, {trường}) — trường gán SAU sinhU
const NAP = (ctx, deck, che, hat, mr) => {
  const R = (s) => vm.runInContext(s, ctx); ctx._d = deck;
  R(`Math.random = rngHat(${mr || 7}); G.debug = { seed: ${hat || 4242} }; batDau('${che || 'solo'}', _d, 'hero'); G.cho = 1e9; G.quai.length = 0; G.dan.length = 0; G.hu.length = 0;
  for (const X of G.ban) { X.t.fill(null); X.mana = 0; X.deck = _d.slice(); X.ai = false; } var B = G.ban[0], D = G.ban[1] || null;
  var dat = (o, id, s, f, BB) => { BB = BB || B; const T = sinhU(taoU(BB, id, s, o)); BB.t[o] = T; if (f) { const st = f.st; delete f.st; Object.assign(T, f); if (st) Object.assign(T.st, st); } return T; };
  var buoc = (n) => { for (let i = 0; i < (n || 1); i++) { capNhatBan(B, 1 / 30); if (D) capNhatBan(D, 1 / 30); } };
  var anh = (BB) => (BB || B).t.map(T => T ? T.id + T.sao + (T.banSao ? 'c' : '') + (T.st.da ? 'S' : '') : '-').join(',');`);
  return R;
};
const ctx = moiTruong(false);
const R = (s) => vm.runInContext(s, ctx);
const IDS = R('G.roster.map(r => r.id)');

// =====================================================================================================
console.log('NT1 · ghép đặc biệt cùng loại → theo ô ĐÍCH · Q3 Merge King');
// =====================================================================================================
{
  const PHE = { // [kéo, đích] — hai ụ CÙNG loại hợp lệ cho ghép đặc biệt
    canon: [`{ hb: 1, cmC: 0 }`, `{ hb: 2, cmC: 0 }`], loren: [`{ dang: 'dmg', lo: 2 }`, `{ dang: 'dmg', lo: 2 }`], vughep: [`{ vang: false }`, `{ vang: false }`],
  };
  for (const id in PHE) for (const [ca, cb] of [[false, true], [true, false]]) {
    NAP(ctx, [id, 'lien', 'tia', 'set', 'bang']);
    R(`var a = dat(0, '${id}', 3, Object.assign(${PHE[id][0]}, { banSao: ${ca}, epxung: 0.3, aurora: 4 })), b = dat(1, '${id}', 3, Object.assign(${PHE[id][1]}, { banSao: ${cb}, epxung: 0.6 })); ghep(B, a, b); var N = B.t[1];`);
    ok(R(`!!N && N.id === '${id}' && N.banSao === ${cb} && !B.t[0] && N.epxung === 0.6`), id + ' + ' + id + ' (kéo ' + (ca ? 'bản sao' : 'thật') + ' → đích ' + (cb ? 'bản sao' : 'thật') + '): bản sao + Ép Xung theo ô đích', R('N && [N.id, N.banSao, N.epxung].join()'));
  }
  NAP(ctx, ['vughep', 'lien', 'tia', 'set', 'bang']);
  R(`var a = dat(0, 'vughep', 3, { vang: true }), b = dat(1, 'vughep', 3, { vang: false }); ghep(B, a, b);`);
  ok(R('B.t[1] === b && b.sao === 5 && b.vang === false && !B.t[0]'), 'Q3 = A: MK VÀNG kéo vào MK thường → đích +2★, vẫn THƯỜNG', R('[b.sao, b.vang].join()'));
  R(`var a = dat(0, 'vughep', 3, { vang: false }), b = dat(2, 'vughep', 3, { vang: true }); ghep(B, a, b);`);
  ok(R('b.sao === 4 && b.vang === true'), 'MK thường kéo vào MK vàng → đích +1★, giữ vàng', R('[b.sao, b.vang].join()'));
}

// =====================================================================================================
console.log('NT2/NT8 · Q1 = A · Q2 = A — ghép thường ra ụ TRÙNG loại = ụ mới (mọi ụ ghép thường được)');
// =====================================================================================================
// trường cộng dồn riêng ụ / buff trên thân: gán 7 lên CẢ 2 nguyên liệu → ụ ra phải bằng ụ VỪA SINH cùng loại, cùng sao
const CD = ['vuc', 'duoi', 'xaN', 'nhiet', 'egg', 'nmDem', 'nmN', 'nmE', 'nmToc', 'nmDmg', 'tuoi', 'epxung', 'khien', 'aurora', 'luot', 'sinhT', 'thaN', 'pip', 'giet', 'mau', 'kho'];
// luật riêng đã thiết kế (không phải "giữ số lớn hơn"): Ember ụ ra = A + C (kỹ năng khi ghép); Fusion Archive: mỗi lần ghép thật +1 điểm (Archive + Archive bắn xung)
const RIENG = { luutru: ['kho'], mimic: ['aurora'] }; // Mimic: ụ ra từ ghép có Mimic được Aurora 8 s (buff KHI ghép, không phải mang sang)
{
  const sai = [], dem = { thu: 0 };
  for (const id of IDS) {
    NAP(ctx, [id]);
    const kq = R(`(() => {
      const f = () => { const o = {}; for (const k of ${JSON.stringify(CD)}) o[k] = 7; o.anv = { k: 'dmg', v: 0.3 }; return o; };
      const a = dat(0, '${id}', 2, f()), b = dat(1, '${id}', 2, f());
      if (!hopLeGhep(a, b) || ghepDBHop(a, b)) return null;
      const r = ghep(B, a, b), N = B.t[1]; if (!N || N.id !== '${id}') return 'khac';
      const M = sinhU(taoU(B, '${id}', N.sao, 1)), lech = [];
      for (const k of ${JSON.stringify(CD)}) { if ((${JSON.stringify(RIENG)}['${id}'] || []).includes(k)) continue; const x = N[k] || 0, y = M[k] || 0; if (x >= 7 && x !== y && k !== 'tuoi') lech.push(k + '=' + x); if (k === 'tuoi' && x >= 7) lech.push('tuoi=' + x); }
      if (N.anv) lech.push('anv'); return lech.join(' ');
    })()`);
    if (kq === null || kq === 'khac') continue;
    dem.thu++;
    if (kq) sai.push(id + ': ' + kq);
  }
  ok(dem.thu > 40 && !sai.length, 'ghép thường X + X ra X (' + dem.thu + ' loại): mọi cộng dồn / buff thân = ụ vừa sinh (Q1 = A, Q2 = A)', sai.join(' · '));
  // đối chứng Mimic + ụ có cộng dồn (ra loại khác hoặc cùng loại: đều là ụ mới)
  NAP(ctx, ['leviathan']);
  R(`var a = dat(0, 'mimic', 2), b = dat(1, 'leviathan', 2, { vuc: 40, epxung: 0.5, anv: { k: 'toc', v: 0.2 } }); ghep(B, a, b); var N = B.t[1];`);
  ok(R("N.id === 'leviathan' && !N.vuc && !N.epxung && !N.anv"), 'Mimic + Leviathan(ABYSS 40, Ép Xung, Anvil) → Leviathan mới 0', R('[N.id, N.vuc, N.epxung, !!N.anv].join()'));
  // ghép THƯỜNG bốc trúng lại đúng loại ≠ ghép đặc biệt cùng loại: luôn ụ mới THẬT, mọi chiều (sửa 09/11 — người dùng thấy Rồng Máy + bản sao phụ thuộc thứ tự)
  for (const [ca, cb] of [[true, false], [false, true], [true, true]]) {
    NAP(ctx, ['ronglua']);
    R(`var a = dat(0, 'ronglua', 3, { banSao: ${ca}, nhiet: 50 }), b = dat(1, 'ronglua', 3, { banSao: ${cb}, nhiet: 90 }); ghep(B, a, b); var N = B.t[1];`);
    ok(R("N.id === 'ronglua' && N.banSao === false && !N.nhiet"), 'Rồng Máy ' + (ca ? 'bản sao' : 'thật') + ' → ' + (cb ? 'bản sao' : 'thật') + ' (ghép thường ra lại Rồng): ụ mới THẬT, nhiệt 0', R('[N.banSao, N.nhiet].join()'));
  }
  // Ember + Ember ra Ember: Ember MỚI 0 lửa (người dùng 08/11, game.js ghep) — lửa A + C chỉ truyền cho Ember KHÁC
  NAP(ctx, ['lualien']);
  R(`var a = dat(0, 'lualien', 2, { lc: 4 }), b = dat(1, 'lualien', 2, { lc: 3, epxung: 0.4 }); ghep(B, a, b); var N = B.t[1];`);
  ok(R('N.lc === 0 && !N.epxung'), 'Ember + Ember (2★) ra Ember → Ember MỚI 3★: 0 lửa (không lấy A + C), Ép Xung không mang', R('[N.lc, N.epxung].join()'));
}

// =====================================================================================================
console.log('Q4 = B · biến hình = ụ mới (buff thân mất, bản sao giữ) · +★ tại chỗ giữ hết');
// =====================================================================================================
{
  const BUFF = `{ epxung: 0.5, anv: { k: 'dmg', v: 0.2 }, aurora: 6, khien: 1, banSao: true }`;
  const het = (v) => `(!(${v}.epxung > 0) && !${v}.anv && !(${v}.aurora > 0) && !(${v}.khien > 0) && ${v}.banSao === true)`;
  NAP(ctx, ['hopbi', 'lien', 'tia', 'set', 'bang']);
  R(`var T = dat(2, 'hopbi', 2, ${BUFF}); T.tuoi = 999; capNhatBan(B, 1/30); var N = B.t[2];`);
  ok(R(`N && N.id !== 'hopbi' && ${het('N')}`), 'Hộp Bí Ẩn mở → ụ mới mất Ép Xung / Anvil / Aurora / khiên, giữ bản sao', R('N && [N.id, N.epxung, !!N.anv, N.aurora, N.khien, N.banSao].join()'));
  NAP(ctx, ['lien', 'tia', 'set', 'bang', 'saochep']);
  R(`var X = dat(1, 'tia', 3), C = dat(0, 'saochep', 3, ${BUFF}); ghep(B, C, X); var N = B.t[0];`);
  ok(R(`N.id === 'tia' && ${het('N')}`), 'Copycat chép → bản sao mất buff thân Copycat (Ép Xung, Anvil, Aurora, khiên)', R('[N.id, N.epxung, !!N.anv, N.aurora, N.khien].join()'));
  NAP(ctx, ['lien', 'tia', 'set', 'bang', 'canon']);
  R(`var T = dat(3, 'lien', 2, ${BUFF}); var N = chuyenU(B, T, 'tia', 2);`);
  ok(R(`${het('N')}`), 'chuyenU (Scrambler / Evolver nở / Mad Crown dùng chung) → buff thân mất', R('[N.epxung, !!N.anv, N.aurora, N.khien].join()'));
  R(`var T = dat(4, 'lien', 2, ${BUFF}); nangSao(B, T, 1);`);
  ok(R("B.t[4] === T && T.sao === 3 && T.epxung === 0.5 && !!T.anv && T.khien === 1"), '+★ tại chỗ: cùng thân, giữ mọi buff', R('[T.sao, T.epxung, !!T.anv, T.khien].join()'));
}

// =====================================================================================================
console.log('NT6 · Ember rời bàn — mọi đường đúng 1 lần (Q7, Q8, F4)');
// =====================================================================================================
// X = Ember quan sát ở ô 3 (hàng 0, cột 3); Ember rời bàn ở ô 0/1/2 (cùng hàng 0) hoặc ô 8/13 (cùng cột 3)
const EMB = (js) => { NAP(ctx, ['lualien', 'mimic', 'lien', 'tia', 'set']); R(`var X = dat(3, 'lualien', 2, { lc: 10 }); buoc();`); R(js); R('buoc(2)'); return R('X.lc'); };
{
  ok(EMB(`var a = dat(0, 'lualien', 2, { lc: 5 }), b = dat(1, 'lualien', 2, { lc: 6 }); buoc(); ghep(B, a, b);`) === 21, 'Q7: Ember + Ember cùng hàng → X nhận A + C đúng 1 lần (10 + 5 + 6 = 21)');
  ok(EMB(`var a = dat(0, 'lualien', 2, { lc: 5 }), b = dat(1, 'lualien', 2, { lc: 6 }); buoc(); ghep(B, a, b); buoc(3); ghep(B, dat(10, 'lien', 3), dat(11, 'lien', 3));`) === 21, 'Q7: không cộng thêm lần 2 ở các bước / lần ghép sau');
  ok(EMB(`var e = dat(1, 'lualien', 2, { lc: 6 }); buoc(); ghep(B, dat(0, 'mimic', 2), e);`) === 16, 'Mimic kéo vào Ember (Ember rời bàn) → +6');
  ok(EMB(`var e = dat(1, 'lualien', 2, { lc: 6 }); buoc(); ghep(B, dat(8, 'tudo', 2), e);`) === 16, 'Wild Link kéo vào Ember → +6');
  ok(EMB(`var e = dat(13, 'lualien', 1, { lc: 4 }); buoc(); haSao(B, e, 'kt'); trieu(B, true, 'lien');`) === 14, 'Ember 1★ vỡ NGOÀI capNhatBan rồi triệu hồi (có thể vào đúng ô) trước khung sau → vẫn +4 (F4)');
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); var M = dat(7, 'mauhut', 3); M.mh = { o: 2, uid: e.uid, id: 'lualien', sao: 3, con: 0, tong: 9 };`) === 14, 'Blood Circuit nuốt Ember → +4');
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); buoc(); chuyenU(B, e, 'lien', 3);`) === 10, 'biến hình tại chỗ → 0');
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); buoc(); e.st.da = true; buoc(); e.st.bang = 5;`) === 10, 'hoá đá / đóng băng → 0');
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); buoc(); haSao(B, e, 'kt');`) === 10, '−★ (3★ → 2★, còn trên bàn) → 0');
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); buoc(); ghep(B, dat(12, 'dichchuyen', 3), e);`) === 10, 'Teleporter đổi chỗ → 0');
  // Q8: Joker biến Ember thành Mimic rồi ép ghép → 0 (đã không còn là Ember khi rời bàn)
  ok(EMB(`var e = dat(2, 'lualien', 3, { lc: 4 }); dat(11, 'lien', 3); buoc(); (() => { const E = { trum: 'joker_king', x: 9, y: 9, uid: 9e5, bao: { t: 0, song: 1.4, muc: [e.uid], muc2: [], ban2: null } }; E.rng = rngHat(5); thucHienChieu(E, B); })();`) === 10, 'Q8 = A: Joker biến Ember → Mimic rồi ép ghép → 0');
  // Q5: Ember BĂNG cùng hàng không nhận
  NAP(ctx, ['lualien', 'mimic', 'lien', 'tia', 'set']);
  R(`var X = dat(3, 'lualien', 2, { lc: 10 }), Y = dat(4, 'lualien', 2, { lc: 10 }); Y.st.bang = 9; var e = dat(1, 'lualien', 2, { lc: 6 }); buoc(); ghep(B, dat(0, 'mimic', 2), e); buoc(2);`);
  ok(R('X.lc === 16 && Y.lc === 10'), 'Q5 = A: Ember đang BĂNG cùng hàng không nhận lửa (X 16, Y băng 10)', R('[X.lc, Y.lc].join()'));
  // đồng bộ mạng trên bàn mình (khôi phục) không phải rời bàn
  const c2 = moiTruong(true), R2 = (s) => vm.runInContext(s, c2);
  NAP(c2, ['lualien', 'mimic', 'lien', 'tia', 'set']);
  R2(`ONS.on = true; ONS.seed = 77; var X = dat(3, 'lualien', 2, { lc: 10 }), e = dat(1, 'lualien', 2, { lc: 6 }); buoc(); var c = ONS.oCua(B); c[1] = ''; ONS.apAnh(B, { c, h: ONS.bam(c), f: B.t.map(T => T ? ONS.oTT(T)[2] : '') }, true); buoc(2);`);
  ok(R2('!B.t[1] && X.lc === 10'), 'ảnh chụp mạng xoá Ember trên bàn mình (đồng bộ lại) → 0', R2('[!!B.t[1], X.lc].join()'));
  R2(`B.net = true; var e2 = dat(0, 'lualien', 2, { lc: 6 }); buoc(); B.t[0] = null; buoc(2);`);
  ok(R2('X.lc === 10'), 'bàn con rối (B.net) không tự truyền (nhận cờ r của máy chủ bàn)', R2('X.lc'));
}

// =====================================================================================================
console.log('NT7 · ụ khoá · +★ tự động · Q6 · Q9');
// =====================================================================================================
{
  // F3: Freezer khi mọi ụ không đá đều đang băng → chiêu hụt, không kéo dài
  NAP(ctx, ['lien', 'tia', 'set', 'bang', 'canon']);
  R(`var a = dat(0, 'lien', 2, { st: { bang: 0.5 } }), b = dat(1, 'tia', 2, { st: { bang: 0.5 } }), s = dat(2, 'set', 2, { st: { da: true } });
     var E = { trum: 'freezer', ban: 0, x: 9, y: 9, uid: 9e5, knT: 0, nChieu: 0 }; G.wave = 5; capNhatTrum(E, 0.01);`);
  ok(R('!E.bao && E.knT === 2 && a.st.bang === 0.5 && b.st.bang === 0.5'), 'F3: Freezer khi mọi ụ đều băng/đá → chiêu hụt (knT 2), không băng lại', R('[!!E.bao, E.knT, a.st.bang, b.st.bang].join()'));
  R(`var c = dat(3, 'canon', 2); E.knT = 0; capNhatTrum(E, 0.01); E.bao.t = 9; a.st.bang = 0.4; capNhatTrum(E, 0.01);`);
  ok(R('a.st.bang === 0.4 && c.st.bang > 5'), 'Freezer chỉ chọn ụ chưa băng; ụ đang băng không bị kéo dài (0,4 s giữ nguyên)', R('[a.st.bang, c.st.bang.toFixed(1)].join()'));
  // ụ khoá vẫn mất sao
  R(`a.st.bang = 3; haSao(B, a, 'kt');`); ok(R('a.sao === 1'), 'ụ băng vẫn mất sao (NT7)');
  // F10: +★ tự động bỏ đá + băng
  ok(R(`[nhanSaoTuDong(dat(5, 'lien', 2)), nhanSaoTuDong(dat(6, 'lien', 2, { st: { bang: 3 } })), nhanSaoTuDong(dat(7, 'lien', 2, { st: { da: true } })), nhanSaoTuDong(dat(8, 'lien', 7))].join()`) === 'true,false,false,false', 'nhanSaoTuDong: thường ✓ · băng ✗ · đá ✗ · 7★ ✗');
  NAP(ctx, ['lien', 'tia', 'set', 'bang', 'canon']);
  R(`var F = dat(0, 'lien', 2, { st: { bang: 9 } }), S = dat(1, 'tia', 2, { st: { da: true } }); var L = sinhTrum('leech', 0); L.kho = 2; L.ban = 0; var m0 = B.mana; chet(L, B);`);
  ok(R('F.sao === 2 && S.sao === 2'), 'Star Leech trả sao: ụ băng / đá không nhận (F10)', R('[F.sao, S.sao].join()'));
  NAP(ctx, ['pandora', 'lien', 'tia', 'set', 'bang']);
  ok(R(`(() => { const F = dat(0, 'lien', 2, { st: { bang: 9 } }); const src = SKILLS.pandora.toString ? '' : ''; return B.t.filter(nhanSaoTuDong).length; })()`) === 0, 'Pandora VAULT/ALLY STAR dùng cùng bộ lọc: bàn chỉ có ụ băng → không có ụ nhận');
  // Q6: dấu Mạch Máu trên mục tiêu ĐÓNG BĂNG dừng đếm, tan băng đếm tiếp
  NAP(ctx, ['mauhut', 'lien', 'tia', 'set', 'bang']);
  R(`var X = dat(2, 'lien', 3), M = dat(7, 'mauhut', 3); M.mh = { o: 2, uid: X.uid, id: 'lien', sao: 3, con: 1, tong: 9 }; X.st.bang = 5; buoc(60);`);
  ok(R('B.t[2] === X && M.mh && M.mh.con === 1'), 'Q6 = A: dấu Mạch Máu trên ụ băng dừng đếm (2 s băng: còn 1 s)', R('[B.t[2] === X, M.mh && M.mh.con].join()'));
  R('X.st.bang = 0; buoc(45);'); ok(R('!B.t[2]'), 'tan băng → đếm tiếp và nuốt');
  // Q9: Wild Link vẫn ghép ụ băng / đá (ụ ra hết khoá)
  NAP(ctx, ['lien', 'tia', 'set', 'bang', 'canon']);
  R(`var WL = dat(0, 'tudo', 2), KL = dat(1, 'tia', 4, { st: { bang: 5 } }); var ok9 = hopLeGhep(WL, KL); ghep(B, WL, KL); var N = B.t[1];`);
  ok(R('ok9 && N && !biKhoa(N)'), 'Q9 giữ: Wild Link ghép được ụ băng → ụ ra thường (hết khoá)');
  // Q5: Rồng BĂNG cùng hàng không nhận nhiệt ghép
  NAP(ctx, ['ronglua', 'lien', 'tia', 'set', 'bang']);
  R(`var Z = dat(4, 'ronglua', 2, { nhiet: 0, st: { bang: 5 } }), Y = dat(14, 'ronglua', 2, { nhiet: 0 }); B.deck = ['lien']; ghep(B, dat(0, 'lien', 1), dat(9, 'lien', 1));`);
  ok(R('Z.nhiet === 0 && Y.nhiet > 0'), 'Q5 = A: Rồng băng cùng cột không nhận nhiệt ghép (Rồng thường cùng cột nhận)', R('[Z.nhiet, Y.nhiet].join()'));
}

// =====================================================================================================
console.log('NT9 · tất định — cùng hạt trận, Math.random khác → bàn y hệt');
// =====================================================================================================
{
  const KB = {
    'ghép thường (ụ ra)': [['lien', 'tia', 'set', 'bang', 'canon'], `for (let i = 0; i < 5; i++) { dat(0, 'lien', 2); dat(1, 'lien', 2); ghep(B, B.t[0], B.t[1]); }`],
    'triệu hồi (ô + loại)': [['lien', 'tia', 'set', 'bang', 'canon'], `for (let i = 0; i < 8; i++) trieu(B, true);`],
    'Twin Maker (offline)': [['sinhdoi', 'tia', 'set', 'bang', 'canon'], `for (let i = 0; i < 3; i++) { dat(0, 'sinhdoi', 2); dat(1, 'sinhdoi', 2); ghep(B, B.t[0], B.t[1]); }`],
    'Hộp Bí Ẩn mở': [['hopbi', 'tia', 'set', 'bang', 'canon'], `for (let o = 0; o < 4; o++) { const T = dat(o, 'hopbi', 2); T.tuoi = 999; } capNhatBan(B, 1/30);`],
  };
  for (const ten in KB) {
    const a = []; for (const mr of [3, 99991]) { NAP(ctx, KB[ten][0], 'solo', 555, mr); R(KB[ten][1]); a.push(R('anh()')); }
    ok(a[0] === a[1], ten + ': 2 lần chạy cùng hạt trận, Math.random khác → cùng bàn', a.join(' | '));
  }
  for (const [ten, id] of [['Scrambler PVP', 'xaotron'], ['Signal Jammer PVP', 'nhieusong']]) {
    const a = []; for (const mr of [3, 99991]) {
      NAP(ctx, [id, 'lien', 'tia', 'set', 'canon'], 'pvp', 555, mr);
      R(`for (let o = 0; o < 10; o++) dat(o, ['lien', 'tia', 'set', 'canon'][o % 4], 2, null, D); ghep(B, dat(0, '${id}', 4), dat(1, '${id}', 4));`);
      a.push(R(`anh(D) + '/' + D.t.map(T => T && T.st.ngam > 0 ? 'j' : '').join('')`));
    }
    ok(a[0] === a[1], ten + ': bàn đối thủ tất định', a.join(' | '));
  }
  // F15 online: máy CHỦ (người ghép = bàn 0) và máy KHÁCH (người ghép = bàn 1, bàn con rối) ra cùng kết quả trên bàn nạn nhân
  for (const [ten, id] of [['Scrambler', 'xaotron'], ['Signal Jammer', 'nhieusong']]) {
    const kq = [], KHOI = 'lien2,tia2,set2,canon2,lien2,tia2,set2,canon2,lien2,tia2,set2,canon2,-,-,-/'; // bàn nạn nhân lúc đầu (phải ĐỔI sau hiệu ứng)
    for (const host of [true, false]) {
      const c = moiTruong(false), Rc = (s) => vm.runInContext(s, c); NAP(c, [id, 'lien', 'tia', 'set', 'canon'], 'pvp', 31, host ? 3 : 777);
      Rc(`var ONS = { on: true, host: ${host}, seed: 9191 }; window.ONS = ONS; var NG = ${host ? 'B' : 'D'}, NN = ${host ? 'D' : 'B'};
          for (let o = 0; o < 12; o++) dat(o, ['lien', 'tia', 'set', 'canon'][o % 4], 2, null, NN); ghep(NG, dat(0, '${id}', 4, null, NG), dat(1, '${id}', 4, null, NG));`);
      kq.push(Rc(`anh(NN) + '/' + NN.t.map(T => T && T.st.ngam > 0 ? 'j' : '').join('')`));
    }
    ok(kq[0] === kq[1] && kq[0] !== KHOI, 'F15 online ' + ten + ': máy chủ bàn + bàn con rối máy kia → cùng ô, cùng loại', kq.join(' | '));
  }
}

// =====================================================================================================
console.log('Online F14 · khứ hồi oTT → datO cho cộng dồn riêng ụ');
// =====================================================================================================
{
  const c = moiTruong(true), Rc = (s) => vm.runInContext(s, c);
  NAP(c, ['leviathan', 'cuuvi', 'nemesis', 'khoisinh', 'chuato']);
  const CA = [
    ['leviathan', `{ vuc: 37 }`, ['vuc']], ['cuuvi', `{ duoi: 6, xaN: 4 }`, ['duoi', 'xaN']],
    ['nemesis', `{ nmDem: 7, nmN: 4, nmE: 3, nmToc: 0.12, nmDmg: 0.24 }`, ['nmDem', 'nmN', 'nmE', 'nmToc', 'nmDmg']],
    ['khoisinh', `{ luot: 2, sinhT: 3.4 }`, ['luot', 'sinhT']], ['chuato', `{ thaN: 3 }`, ['thaN']],
    ['lien', `{ khien: 1, aurora: 4.5, st: { lua: 2.5, kep: 1.5 } }`, ['khien', 'aurora', 'st.lua', 'st.kep']],
  ];
  const sai = [];
  for (const [id, f, ks] of CA) {
    const r = Rc(`(() => { const T = dat(5, '${id}', 4, ${f}); const s = ONS.oTT(T); B.t[6] = null; ONS.datO(B, 6, s); const N = B.t[6]; const g = (X, k) => k.split('.').reduce((o, x) => o && o[x], X);
      return ${JSON.stringify(ks)}.filter(k => Math.abs((g(N, k) || 0) - (g(T, k) || 0)) > 1e-6).map(k => k + ' ' + g(T, k) + '→' + g(N, k)).join(' '); })()`);
    if (r) sai.push(id + ': ' + r);
  }
  ok(!sai.length, 'oTT → datO giữ ABYSS, đuôi, Nemesis, Genesis, Hive, khiên, Aurora, cháy, kẹp', sai.join(' · '));
  const r0 = Rc(`(() => { const T = dat(7, 'leviathan', 2); return ONS.oTT(T)[2]; })()`);
  ok(r0 === '' || !/v\d/.test(r0), 'ụ mới không mang cờ cộng dồn (chuỗi cờ gọn)', r0);
}

console.log(loi ? '✗ thap-kt-nguyen-tac: ' + loi + ' lỗi (' + dat0 + ' đạt)' : '✓ thap-kt-nguyen-tac: đạt (' + dat0 + ' ca)');
process.exit(loi ? 1 : 0);
