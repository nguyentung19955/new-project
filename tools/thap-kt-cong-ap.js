// TURRET MERGE — KIỂM Ụ VÀNG "HATCHERY GATE" / Cổng Ấp Nở (congap — thap/js/skills7.js)
//   node tools/thap-kt-cong-ap.js → lượt = sao lúc xuất hiện, gọi 1★ trong bộ mỗi 11 s vào ô trống (miễn phí), bàn đầy giữ lượt,
//   Merge King +1 / bản vàng +2 → +lượt, −★ trừ lượt (không âm), ghép / Copycat ra ụ MỚI, đá / băng dừng đồng hồ, hết lượt ở lại, tất định, cờ online
'use strict';
const path = require('path'), fs = require('fs'), vm = require('vm');
const { taoMoiTruong: taoGoc, R } = require('./thap-sim-vaitro.js');
let ok = 0, loi = 0;
const kt = (dk, ten) => { if (dk) ok++; else { loi++; console.log('✗', ten); } };
function moiTruong(hat) { // + vangmoi1 / skills7 (như thap-sim-tier.js)
  const ctx = taoGoc(hat);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  return ctx;
}
const DECK = ['congap', 'lien', 'canon', 'set', 'vughep'];
let ctx;
const chay = (giay) => { for (let t = 0; t < giay; t += 1 / 30) R(ctx, 'capNhat(1/30)'); };
function tran(hat) {
  ctx = moiTruong(hat || 7);
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ${JSON.stringify(DECK)}, 'hero'); G.cho = 1e9; G.wave = 5;
    var B = G.ban[0]; B.tim = 1e9; B.mana = 500; B.t.fill(null);
    var dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; };
    var dem = () => B.t.filter(Boolean).length, L = (T) => SKILLS.congap.luot(T); }`);
}
// 0) khai báo
tran();
kt(R(ctx, `G.rosterMap.congap && G.rosterMap.congap.bac === 'vang' && SKILLS.congap.vai === 'db' && !SKILLS.congap.dmg`), 'roster Vàng · Đặc biệt · không bắn');
kt(R(ctx, `HO.summon.bac[3].includes('congap') && HO_CUA.congap.i === 3`), 'họ SUMMON bậc Vàng');
kt(R(ctx, `TEXT.turret.congap && TEXT.turret.congap.name === 'Hatchery Gate'`), 'TEXT.turret');
// 1) lượt = sao lúc xuất hiện
kt(R(ctx, `L(dat(0, 'congap', 1)) === 1 && L(dat(1, 'congap', 3)) === 3 && L(dat(2, 'congap', 7)) === 7`), 'lượt = sao (1/3/7)');
// 2) gọi mỗi 11 s, 1★ trong bộ (không phải chính nó), miễn phí, ô trống
tran(); R(ctx, `var C = dat(7, 'congap', 2), m0 = B.mana, g0 = B.gia;`);
chay(10.8); kt(R(ctx, 'dem()') === 1 && R(ctx, 'L(C)') === 2, 'chưa đủ 11 s: chưa gọi');
chay(0.4); kt(R(ctx, 'dem()') === 2 && R(ctx, 'L(C)') === 1, '11 s: gọi 1 ụ, lượt 2 → 1');
kt(R(ctx, `B.t.filter(Boolean).every(T => T === C || (T.sao === 1 && T.id !== 'congap' && B.deck.includes(T.id)))`), 'ụ gọi ra: 1★, trong bộ, không phải Cổng');
kt(R(ctx, 'B.mana === m0 && B.gia === g0'), 'miễn phí: không trừ mana, không tăng giá');
chay(11.1); kt(R(ctx, 'dem()') === 3 && R(ctx, 'L(C)') === 0, 'lượt 2: gọi lần 2 → 0');
chay(30); kt(R(ctx, 'dem()') === 3 && R(ctx, 'B.t[7] === C'), 'hết lượt: ở lại, không gọi nữa');
// 3) bàn đầy: giữ lượt, có ô trống là gọi
tran(); R(ctx, `var C = dat(7, 'congap', 2); for (let o = 0; o < 15; o++) if (!B.t[o]) dat(o, 'lien', 1);`);
chay(25); kt(R(ctx, 'dem()') === 15 && R(ctx, 'L(C)') === 2, 'bàn đầy 25 s: không gọi, giữ 2 lượt');
R(ctx, 'B.t[3] = null;'); chay(0.1);
kt(R(ctx, 'dem()') === 15 && R(ctx, 'L(C)') === 1 && !!R(ctx, 'B.t[3]'), 'có ô trống: gọi ngay vào ô đó, lượt −1');
// 4) Merge King +1 / bản vàng +2 → +lượt đúng bằng số sao tăng (cả khi lượt đã hết)
tran(); R(ctx, `var C = dat(7, 'congap', 2), K = dat(0, 'vughep', 2); K.vang = false; ghep(B, K, C);`);
kt(R(ctx, 'B.t[7] === C && C.sao === 3 && L(C) === 3'), 'Merge King +1★ tại chỗ → lượt 2 → 3');
R(ctx, `var K2 = dat(1, 'vughep', 3); K2.vang = true; ghep(B, K2, C);`);
kt(R(ctx, 'C.sao === 5 && L(C) === 5'), 'Merge King VÀNG +2★ → lượt +2 (5)');
chay(0.1); kt(R(ctx, 'L(C) === 5 && C.cgS === 5'), 'đồng bộ lượt sau 1 khung');
R(ctx, 'C.cgL = 0; nangSao(B, C, 1);'); chay(0.1); kt(R(ctx, 'C.sao === 6 && L(C) === 1'), 'hết lượt rồi +★ (Bệ Nâng Sao / Genesis…) → có lại 1 lượt');
// 5) −★ TRỪ lượt đúng bằng số sao bị trừ, không âm (người dùng chốt 09/11)
tran(); R(ctx, `var C = dat(7, 'congap', 3); haSao(B, C);`); chay(0.1);
kt(R(ctx, 'C.sao === 2 && L(C) === 2'), '−1★: lượt 3 → 2');
R(ctx, 'nangSao(B, C, 1);'); chay(0.1); kt(R(ctx, 'C.sao === 3 && L(C) === 3'), 'lên lại +1★: lượt 2 → 3');
R(ctx, 'C.cgL = 0; C.cgS = 3; haSao(B, C);'); chay(0.1); kt(R(ctx, 'C.sao === 2 && L(C) === 0 && C.cgL === 0'), 'hết lượt rồi −★: lượt 0, không âm');
R(ctx, 'var D = dat(8, "congap", 4); D.st.da = true; D.sao = 2;'); kt(R(ctx, 'L(D)') === 2, 'đá bị −2★: hiển thị lượt −2 ngay');
// 6) ghép thường / Copycat chép = ụ MỚI, lượt = sao của nó
tran(); R(ctx, `var A = dat(6, 'congap', 2), C = dat(7, 'congap', 2); A.cgL = 0; C.cgL = 9; B.deck = ['congap']; var N = ghep(B, A, C);`);
kt(R(ctx, `N && N !== C && N.id === 'congap' && N.sao === 3 && L(N) === 3`), 'ghép thường ra Cổng: ụ MỚI, lượt = 3 (không kế thừa 9)');
R(ctx, `var X = dat(0, 'lien', 4); X.cgL = 9; var Y = chuyenU(B, X, 'congap', 4);`);
kt(R(ctx, `Y.id === 'congap' && L(Y) === 4`), 'biến / Copycat chép thành Cổng: lượt = sao (4)');
R(ctx, `var Tw = sinhDoi(B, 2, 0);`); kt(R(ctx, `!Tw || Tw.id !== 'congap' || L(Tw) === Tw.sao`), 'Twin Maker gọi ra: lượt = sao');
// 7) đá / băng: đồng hồ dừng; +★ lúc khoá được cộng khi tan
tran(); R(ctx, `var C = dat(7, 'congap', 2); C.st.da = true;`);
chay(25); kt(R(ctx, 'dem()') === 1 && R(ctx, 'L(C)') === 2 && !R(ctx, 'C.cgT'), 'hoá đá 25 s: không gọi, đồng hồ đứng');
R(ctx, 'C.sao = 3;'); kt(R(ctx, 'L(C)') === 3, 'đá được +★: hiển thị lượt +1 ngay');
R(ctx, 'C.st.da = false;'); chay(11.1); kt(R(ctx, 'dem()') === 2 && R(ctx, 'L(C)') === 2, 'tan đá: đếm lại từ đầu → gọi sau 11 s, lượt 3 → 2');
tran(); R(ctx, `var C = dat(7, 'congap', 1); C.cgT = 5; C.st.bang = 8;`);
chay(7.5); kt(R(ctx, 'dem()') === 1 && Math.abs(R(ctx, 'C.cgT') - 5) < 1e-9, 'đóng băng: đồng hồ dừng ở 5 s');
chay(0.6 + 6.05); kt(R(ctx, 'dem()') === 2, 'tan băng: chạy tiếp 6 s còn lại rồi gọi');
// 8) tất định: cùng hạt → cùng ô + cùng loại
const ve = (hat) => { tran(hat); R(ctx, `var C = dat(7, 'congap', 4);`); chay(45); return R(ctx, `B.t.map(T => T ? T.id + T.sao : '-').join(',')`); };
const v1 = ve(11), v2 = ve(11);
kt(v1 === v2 && (v1.match(/1/g) || []).length >= 4, 'tất định: cùng hạt ra cùng bàn (' + v1 + ')');
// 9) cờ online + không Math.random
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'online', 'dongbo.js'), 'utf8');
  kt(/T\.id === 'congap'\) \{ const S = SKILLS\.congap; f \+= 'A'/.test(src) && /T\.id === 'congap'\) \{ const l = so\('A'\)/.test(src), 'dongbo: cờ A/Y/W ghi + đọc');
  const s7 = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'skills7.js'), 'utf8'), i = s7.indexOf('SKILLS.congap = {');
  kt(i > 0 && !/Math\.random/.test(s7.slice(i, s7.indexOf("themHo('summon', 3, 'congap'")).replace(/\/\/.*$/gm, '')), 'congap không dùng Math.random');
}
console.log((loi ? '✗ ' : '✓ ') + ok + '/' + (ok + loi));
process.exit(loi ? 1 : 0);
