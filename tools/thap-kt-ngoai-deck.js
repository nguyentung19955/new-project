// TURRET MERGE — KIỂM BẤT BIẾN BỘ BÀI (DCDW): mọi ụ trên bàn của người chơi phải thuộc 5 thẻ trong bộ bài của người đó.
//   node tools/thap-kt-ngoai-deck.js            (mặc định ≈ 3000 trận ngắn + 6 trận dài bộ của người chơi; LAN=n đổi số trận, DAI=0 bỏ trận dài)
// Lỗi gốc 06/11 (iPhone, SOLO wave 33, bộ Thánh Địa / Hộp Bí Ẩn / Thuỷ Quái / Hộp Tiến Hoá / Máy Sao Chép): trùm JOKER KING ném Mimic lên
// ụ 6★ duy nhất → không có bạn cùng sao để ép ghép → MIMIC 6★ (ụ ngoài bộ) nằm lại vĩnh viễn.
// Cách kiểm: mô phỏng không giao diện (cùng môi trường tools/thap-sim-vaitro.js), G.ktDeck = 'nem' → game.js ktDeck() NÉM LỖI ngay khi có ụ
// ngoài bộ (kèm đường tạo ụ). Mỗi trận: bộ bài ngẫu nhiên thiên về ụ biến hình / sinh ụ, chế độ SOLO / CO-OP / PVP, bắt đầu wave ngẫu nhiên,
// mana dư, bàn đầy sẵn sao cao; "người chơi hỗn loạn" ghép ngẫu nhiên mọi cặp hợp lệ (cả ghép đặc biệt: Sao Chép, Mạch Máu, Vua Ghép…),
// trùm ép Joker King / Mad Crown thường xuyên. Thêm kịch bản trực tiếp: Joker King lên ụ 6★/7★ không có bạn cùng sao.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
const THEM = ['vangmoi1', 'skills7', 'trum'];
function moiTruong(hat) {
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of THEM) { const p = path.join(__dirname, '..', 'thap', 'js', f + '.js'); if (fs.existsSync(p)) { try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f + '.js' }); } catch (e) { if (f !== 'trum') throw e; } } }
  return ctx;
}
const LAN = +(process.env.LAN || 3000), DAI = process.env.DAI === '0' ? 0 : +(process.env.DAI || 6);
const BO_NGUOI_CHOI = ['thanhdia', 'hopbi', 'leviathan', 'tienhoa', 'saochep']; // bộ của người báo lỗi (ảnh thẻ vàng tóc trắng = Thánh Địa)
// ụ biến hình / sinh ụ / đổi loại — luôn có mặt nhiều trong bộ thử
const BIEN = ['hopbi', 'tienhoa', 'saochep', 'pandora', 'mauhut', 'sinhdoi', 'vughep', 'xuonganh', 'luutru', 'bienmau', 'lualien', 'hopca', 'khoisinh',
  'anhsang', 'nhanban', 'mimic', 'xaotron', 'nhieusong', 'chuato', 'nangsao', 'dichchuyen', 'epxung', 'nguyenrua', 'guongcong', 'loren', 'leviathan', 'thanhdia', 'combo', 'orbital'];

function rngSo(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// người chơi hỗn loạn (bàn 0, và bàn 1 khi CO-OP/PVP đều chạy AI gốc + hỗn loạn): ghép ngẫu nhiên 1 cặp hợp lệ, dùng chủ động, gọi ụ
// kiểm độc lập với game.js (bắt cả khi ktDeck chưa có / bị tắt)
const KT = `function _kt(luc) { for (const B of G.ban) for (const T of B.t) if (T && !B.deck.includes(T.id)) throw new Error('[BẤT BIẾN BỘ BÀI] (kiểm độc lập) ' + T.id + ' ' + T.sao + '★ ô ' + T.o + ' bàn ' + B.i + ' ' + G.che + ' wave ' + G.wave + ' ' + luc + ' · bộ ' + B.deck.join(',')); }`;
const HON_LOAN = `function _honLoan(B, r) {
  if (B.mana >= B.gia && oTrong(B).length && r() < 0.6) { trieu(B); return; }
  const ts = B.t.filter(Boolean); if (ts.length < 2) return;
  const cap = []; for (const a of ts) for (const b of ts) if (a !== b && hopLeGhep(a, b)) cap.push([a, b]);
  if (cap.length && r() < 0.85) { const [a, b] = cap[Math.floor(r() * cap.length)]; ghep(G.ban[a.ban], a, b); return; }
  for (const T of ts) { const sk = SKILLS[T.id]; if (sk.chuDong && T.nap >= 1 && !biKhoa(T)) { try { sk.chuDong(G, B, T); } catch (e) { if (/BẤT BIẾN/.test(e.message)) throw e; } return; } }
}`;

function tran(ctx, o) {
  ctx._o = o;
  R(ctx, `{ G.debug = { auto: true, wave: _o.wave, mana: 4000, seed: _o.hat }; if (_o.deck2) G.debug.deck2 = _o.deck2; G._bot = false;
    batDau(_o.che, _o.deck, _o.mv); G.ktDeck = 'nem';
    _r = rngHatKt(_o.hat * 31 + 7);
    for (const B of G.ban) { B.tim = 1e9; for (let i = 0; i < 15; i++) if (_r() < _o.day) { const T = trieu(B, true); if (T) { const s = 1 + Math.floor(_r() * 7); B.t[T.o] = sinhU(taoU(B, T.id, s, T.o)); } } }
    G.ktDeck = 'nem'; }`);
  const dt = 1 / 30; let hl = 0;
  for (let t = 0; t < o.giay; t += dt) {
    R(ctx, 'capNhat(' + dt + ')');
    if (ctx._cho.length) { const c = ctx._cho.splice(0); c.forEach(f => f()); }
    if ((hl -= dt) <= 0) {
      hl = 0.35;
      R(ctx, `{ _kt('nhịp'); for (const B of G.ban) { _honLoan(B, _r); if (B.mana < 400) B.mana += 400; }
        if (_r() < 0.08) { const E = G.quai.find(e => e.trum && !e.chet && !e.bao); if (E) { E.trum = _r() < 0.6 ? 'joker_king' : 'mad_crown'; E.knT = 0; } } }`);
    }
    if (R(ctx, '!!G.ketThuc')) break;
  }
  R(ctx, 'if (typeof ktDeck === "function") ktDeck("cuối trận"); _kt("cuối trận")');
  return R(ctx, '({ wave: G.wave, sao: G.ban.map(B => B.t.filter(Boolean).map(T => T.sao).reduce((a, b) => Math.max(a, b), 0)) })');
}

// kịch bản trực tiếp: Joker King lên ụ không có bạn cùng sao (6★ duy nhất / 7★) và ụ có bạn → không Mimic nào nằm lại
function kichBanJoker(ctx) {
  const ra = R(ctx, `(function () {
    const kq = [];
    for (const [sao, coBan] of [[6, false], [7, false], [7, true], [4, true], [6, true], [1, false]]) {
      G.debug = { auto: false }; batDau('solo', ${JSON.stringify(BO_NGUOI_CHOI)}, 'hero'); G.ktDeck = 'nem';
      const B = G.ban[0]; B.t.fill(null);
      const dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
      dat(0, 'thanhdia', 1); dat(1, 'hopbi', 3); dat(2, 'leviathan', 4); const T = dat(5, 'saochep', sao); if (coBan) dat(6, 'tienhoa', sao);
      const E = { trum: 'joker_king', x: 100, y: 100, bao: { muc: [T.uid], muc2: [] }, rng: rngHatKt(sao * 97 + (coBan ? 1 : 0)) };
      thucHienChieu(E, B);
      _kt('Joker ' + sao); if (typeof ktDeck === 'function') ktDeck('Joker ' + sao + '★ ' + (coBan ? 'có bạn' : 'không bạn'));
      kq.push({ sao, coBan, mimic: B.t.filter(X => X && X.id === 'mimic').length, ids: B.t.filter(Boolean).map(X => X.id + X.sao).join(' ') });
    }
    return kq;
  })()`);
  return ra;
}

function main() {
  const t0 = Date.now();
  const ctx = moiTruong(20261106);
  R(ctx, 'var rngHatKt = rngHat, _r = null;');
  R(ctx, HON_LOAN); R(ctx, KT);
  const DS = R(ctx, 'G.roster.filter(r => SKILLS[r.id]).map(r => r.id)');
  const MV = R(ctx, 'Object.keys(MAVUONG)');
  const coDeckTru = R(ctx, "typeof deckTru === 'function' ? deckTru({ deck: ['hopbi'] }, ['hopbi']).join(',') : ''");
  let loi = 0;
  const bao = (ten, e) => { loi++; console.log('  ✗ ' + ten + '\n    ' + String(e && (/BẤT BIẾN/.test(e.message) ? e.message : e.stack) || e).split('\n').slice(0, 10).join('\n    ')); };
  // 0) deckTru không bao giờ lấy toàn bộ danh sách ụ
  if (coDeckTru !== 'hopbi') bao('deckTru lọc hết → phải trả lại bộ bài, không lấy toàn bộ ụ', 'deckTru({deck:[hopbi]},[hopbi]) = ' + coDeckTru);
  // 1) kịch bản Joker King
  try {
    for (const k of kichBanJoker(ctx)) if (k.mimic) bao('Joker King ' + k.sao + '★ ' + (k.coBan ? 'có bạn' : 'không bạn') + ' để lại Mimic', k.ids);
    console.log('  ✓ kịch bản Joker King 6★/7★ không bạn ghép: không Mimic nằm lại');
  } catch (e) { bao('kịch bản Joker King', e); }
  // 1b) bản chơi thật (G.ktDeck = true): ụ ngoài bộ → ghi log + đổi thành ụ trong bộ cùng sao, không vỡ trận; bàn con rối online chỉ ghi log
  try {
    const k = R(ctx, `(function () { G.debug = { auto: false }; batDau('solo', ${JSON.stringify(BO_NGUOI_CHOI)}, 'hero'); G.ktDeck = true;
      const B = G.ban[0]; B.t.fill(null); B.t[4] = sinhU(taoU(B, 'cauvong', 6, 4)); B.t[5] = sinhU(taoU(B, 'mimic', 6, 5)); B.t[5].st.da = true;
      const ce = console.error; let log = 0; console.error = () => { log++; }; try { capNhat(1 / 30); } finally { console.error = ce; }
      return { log, a: B.t[4] && B.t[4].id + B.t[4].sao, b: B.t[5] && B.t[5].id + B.t[5].sao + (B.t[5].st.da ? 'da' : ''), ok: B.t.every(T => !T || B.deck.includes(T.id)) }; })()`);
    if (!k.ok || k.log !== 2 || !/6$/.test(k.a) || !/6da$/.test(k.b)) bao('bản thật: sửa ụ ngoài bộ', JSON.stringify(k));
    else console.log('  ✓ bản thật: ụ ngoài bộ được ghi log + đổi thành ụ trong bộ cùng sao (' + k.a + ', ' + k.b + '), trận không vỡ');
  } catch (e) { bao('bản thật: sửa ụ ngoài bộ', e); }
  // 2) trận dài bộ của người chơi (SOLO, như lỗi gốc: tới wave 33+)
  let nDai = 0;
  for (let i = 0; i < DAI; i++) {
    const o = { che: 'solo', deck: BO_NGUOI_CHOI, mv: MV[i % MV.length], wave: 20 + i * 4, hat: 9001 + i, day: 0.9, giay: 220 };
    try { const k = tran(ctx, o); nDai++; process.stdout.write('    dài ' + (i + 1) + '/' + DAI + ' tới wave ' + k.wave + '\r'); } catch (e) { bao('trận dài bộ người chơi #' + i + ' (wave ' + o.wave + ')', e); }
  }
  if (DAI) console.log('  ✓ ' + nDai + '/' + DAI + ' trận dài bộ người chơi (Thánh Địa · Hộp Bí Ẩn · Thuỷ Quái · Hộp Tiến Hoá · Máy Sao Chép), wave 20–' + (20 + DAI * 4) + ' +~10 wave');
  // 3) fuzz
  const r = rngSo(777), pk = (L) => L[Math.floor(r() * L.length)];
  const boNgauNhien = () => { const d = new Set(); const nb = 2 + Math.floor(r() * 4); while (d.size < nb) d.add(pk(BIEN)); while (d.size < 5) d.add(pk(DS)); return [...d].filter(id => DS.includes(id)).concat(DS).filter((x, i, a) => a.indexOf(x) === i).slice(0, 5); };
  const dem = { solo: 0, coop: 0, pvp: 0 }; let nOk = 0;
  for (let i = 0; i < LAN; i++) {
    const che = i % 10 < 5 ? 'solo' : i % 10 < 8 ? 'coop' : 'pvp';
    const deck = i % 25 === 0 ? BO_NGUOI_CHOI : boNgauNhien();
    const o = { che, deck, deck2: boNgauNhien(), mv: pk(MV), wave: 1 + Math.floor(r() * 55), hat: 1 + i * 7919, day: 0.3 + r() * 0.7, giay: 14 + r() * 26 };
    try { tran(ctx, o); nOk++; dem[che]++; } catch (e) { bao('trận #' + i + ' ' + che + ' wave ' + o.wave + ' bộ ' + deck.join(',') + ' / ' + o.deck2.join(','), e); if (loi > 12) break; }
    if (i % 50 === 0) process.stdout.write('    fuzz ' + i + '/' + LAN + '\r');
  }
  console.log('  ' + (nOk === LAN ? '✓' : '✗') + ' fuzz ' + nOk + '/' + LAN + ' trận (SOLO ' + dem.solo + ' · CO-OP ' + dem.coop + ' · PVP ' + dem.pvp + ') không có ụ ngoài bộ bài — ' + Math.round((Date.now() - t0) / 1000) + ' s');
  if (loi) { console.log('  ✗ bất biến bộ bài: ' + loi + ' lỗi'); process.exitCode = 1; }
  else console.log('  ✓ bất biến bộ bài XANH (' + (nOk + nDai) + ' trận)');
}
main();
