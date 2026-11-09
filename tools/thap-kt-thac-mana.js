// TURRET MERGE — KIỂM Ụ ĐỎ "ARCANE CASCADE" / Thác Mana (thacmana — thap/js/thacmana.js)
//   node tools/thap-kt-thac-mana.js → bảng hệ số mana / ngưỡng nảy, chuỗi nảy tất định, ST tăng theo mana, MANA FLOOD (xả 20%, mọi quái), cờ online, bể Đỏ
'use strict';
const path = require('path'), fs = require('fs'), vm = require('vm');
const { taoMoiTruong, R } = require('./thap-sim-vaitro.js');
let ok = 0, loi = 0;
const kt = (dk, ten) => { if (dk) ok++; else { loi++; console.log('✗', ten); } };
const ctx = taoMoiTruong(7);
const S = 'SKILLS.thacmana';

// 1) hàm thuần
const K = (M) => R(ctx, `${S}.k(${M})`), L = (M) => R(ctx, `${S}.lan(${M})`);
kt(Math.abs(K(0) - 1) < 1e-9 && Math.abs(K(100) - 1.5) < 1e-9 && Math.abs(K(400) - 2) < 1e-9 && Math.abs(K(10000) - 6) < 1e-9, 'k(M) = 1 + 0.5√(M/100)');
kt(K(1e6) > K(1e5) && K(1e5) > K(1e4), 'k không trần');
const bang = [[0, 1], [99, 1], [100, 2], [299, 2], [300, 3], [600, 4], [1000, 5], [1999, 5], [2000, 6], [4000, 8], [7999, 8], [8000, 9], [16000, 10], [32000, 11]];
for (const [m, n] of bang) kt(L(m) === n, `lan(${m}) = ${n} (được ${L(m)})`);
kt(R(ctx, `${S}.giaXa(30)`) === 50 && R(ctx, `${S}.giaXa(1000)`) === 200, 'giá xả = max(50, 20%)');
kt(R(ctx, `G.rosterMap.thacmana && G.rosterMap.thacmana.bac`) === 'do' && R(ctx, `G.rosterMap.thacmana.vai`) === 'tc', 'roster: Đỏ, Tấn công');
kt(R(ctx, `HO.mana.bac[4].includes('thacmana')`), 'họ MANA bậc 5');

// 2) trận: chuỗi nảy theo ngưỡng mana + ST tăng theo mana
function dung(mana, sao) {
  R(ctx, `{ G.debug = { auto: false }; batDau('solo', ['thacmana', 'lien', 'canon', 'set', 'mana'], 'hero'); G.cho = 1e9; G.wave = 10;
    const B = G.ban[0]; B.tim = 1e9; B.mana = ${mana}; B.t.fill(null);
    const T = sinhU(taoU(B, 'thacmana', ${sao}, 7)); B.t[7] = T; G._T = T;
    for (let i = 0; i < 10; i++) { const Q = sinhQuai('khong_lo', 0, 300 - i * 18, 50); Q.vao = 1; } }`);
}
const banMot = () => R(ctx, `{ const B = G.ban[0], T = G._T, ds = dsMucTieu(B), E = quaiDau(B); const h0 = ds.map(Q => Q.hp);
  const _r = Math.random; Math.random = () => 0.99; SKILLS.thacmana.ban(G, B, T, E); Math.random = _r;
  const trung = ds.filter((Q, i) => Q.hp < h0[i]); ({ n: trung.length, tong: ds.reduce((s, Q, i) => s + (h0[i] - Q.hp), 0), dau: h0[ds.indexOf(E)] - E.hp }) }`);
dung(50, 1); const a = banMot();
dung(1200, 1); const b = banMot();
dung(5000, 1); const c = banMot();
kt(a.n === 1, 'mana 50: trúng 1 (được ' + a.n + ')');
kt(b.n === 5, 'mana 1200: trúng 5 (được ' + b.n + ')');
kt(c.n === 8, 'mana 5000: trúng 8 (được ' + c.n + ')');
kt(Math.abs(b.dau / a.dau - K(1200) / K(50)) < 0.01, 'ST quái đầu tỉ lệ k(M): ' + (b.dau / a.dau).toFixed(3) + ' ≈ ' + (K(1200) / K(50)).toFixed(3));
// tất định: chạy lại cùng điều kiện ra cùng chuỗi
dung(1200, 1); const b2 = banMot(); kt(Math.abs(b2.tong - b.tong) < 1e-6, 'chuỗi nảy tất định');

// 3) MANA FLOOD: 3★+, xả 20%, đánh mọi quái, mana không âm, giữ 80% mana
dung(1000, 3);
kt(R(ctx, `(G._T.nap = 0.5, ${S}.chuDong(G, G.ban[0], G._T))`) === false, 'chưa nạp đầy: không dùng');
R(ctx, `G._T.nap = 1`);
kt(R(ctx, `${S}.chuDong(G, G.ban[0], G._T)`) === true, '3★ nạp đầy: dùng được');
kt(R(ctx, 'G.ban[0].mana') === 800 && R(ctx, 'G._T.thacS') === 200, 'xả đúng 20% (1000 → 800)');
const hp0 = R(ctx, 'dsMucTieu(G.ban[0]).map(Q => Q.hp)');
R(ctx, `{ const B = G.ban[0], T = G._T; for (let i = 0; i < 3; i++) SKILLS.thacmana.capNhat(G, B, T, 1 / 30); }`);
const hp1 = R(ctx, 'dsMucTieu(G.ban[0]).map(Q => Q.hp)');
kt(hp1.length === hp0.length && hp1.every((h, i) => h < hp0[i]), 'làn thác đánh MỌI quái trên đường');
dung(1000, 2); R(ctx, 'G._T.nap = 1');
kt(R(ctx, `${S}.chuDong(G, G.ban[0], G._T)`) === false, '2★: chưa mở chiêu');
dung(30, 5); R(ctx, 'G._T.nap = 1');
kt(R(ctx, `${S}.chuDong(G, G.ban[0], G._T)`) === false && R(ctx, 'G.ban[0].mana') === 30, 'thiếu 50 mana: không dùng, không trừ');

// 4) cờ online (dongbo.js): thời gian thác + mana đã xả đi khứ hồi
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'online', 'dongbo.js'), 'utf8');
  kt(/T\.id === 'thacmana' && T\.thacT > 0\) f \+= 'U'/.test(src) && /T\.thacT = so\('U'\) \/ 100; T\.thacS = so\('V'\)/.test(src), 'dongbo: cờ U/V ghi + đọc');
}
// 5) không Math.random trong luật của ụ
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'thap', 'js', 'thacmana.js'), 'utf8').replace(/\/\/.*$/gm, '');
  kt(!/Math\.random/.test(src), 'thacmana.js không dùng Math.random');
}
console.log((loi ? '✗ ' : '✓ ') + ok + '/' + (ok + loi));
process.exit(loi ? 1 : 0);
