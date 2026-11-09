// TURRET MERGE — KIỂM "CHỈ 2 Ụ BẤM TAY" (claude/demo-hop-tuong, 09/11)
//   node tools/thap-kt-tu-kich.js
//   · 9 ụ có chiêu (Chrono Throne, Holy Halo, Hive Queen, Leviathan, Genesis Core, Wyrm Engine, Cryo Reactor, Hydra, Evolver) TỰ KÍCH khi nạp đầy
//   · Black Hole + Arcane Cascade KHÔNG tự nổ (chờ chạm), chạm được (chamSan); ụ tự kích chạm = xem như ụ thường
//   · tự kích không dùng Math.random / giờ thật: 2 mô phỏng cùng hạt → cùng kết quả; đổi hạt Math.random giữa chừng không đổi lúc kích
'use strict';
const { taoMoiTruong, R } = require('./thap-sim-vaitro.js');
let ok = 0, loi = 0;
const kt = (dk, ten, x) => { if (dk) ok++; else { loi++; console.log('✗', ten, x !== undefined ? JSON.stringify(x) : ''); } };

const TU = ['ngaithoigian', 'haoquang', 'chuato', 'leviathan', 'khoisinh', 'ronglua', 'lophanung', 'hydra', 'tienhoa'];
const BAM = ['blackhole', 'thacmana'];

// bàn: mỗi ụ một ô, 5★ (trứng 7★ = trứng cháy), Genesis ở ô 14 (kề ô 13 trống), 1 ụ bị băng (Holy Halo "gặp nguy")
const DUNG = `{
  G.debug = { auto: false }; batDau('solo', ['canon', 'lien', 'set', 'tia', 'bang'], 'hero'); G.cho = 1e9; G.wave = 10;
  const B = G.ban[0]; B.tim = 1e9; B.mana = 5000; B.t.fill(null);
  const ds = [[0,'ngaithoigian',5],[1,'haoquang',5],[2,'chuato',5],[3,'leviathan',5],[14,'khoisinh',5],[5,'ronglua',5],[6,'lophanung',5],[7,'hydra',5],[8,'tienhoa',7],[9,'blackhole',5],[10,'thacmana',5],[11,'canon',3]];
  for (const [o, id, s] of ds) { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; }
  B.deck = ['canon', 'hydra', 'chuato', 'blackhole', 'thacmana'];
  B.t[11].st.bang = 999; // 1 ụ bị băng → Holy Halo đáng dùng
  const p = G.duong[0];
  for (let i = 0; i < 14; i++) { const Q = sinhQuai('khong_lo', 0, p.len * (0.5 + i * 0.025), 400); Q.vao = 1; Q.chan = 1e9; }
  const Tr = sinhQuai('khong_lo', 0, p.len * 0.8, 400); Tr.trum = true; Tr.vao = 1; Tr.chan = 1e9;
}`;
const napDay = `{ const B = G.ban[0]; for (const T of B.t) if (T && T.id !== 'canon') { T.nap = 1; T.napDay = 0; if (T.id === 'chuato') { T.bay = Array.from({ length: T.sao - 1 }, (_, i) => ({ g: i })); } } }`; // chuato: chưa đủ bầy (đủ bầy thì tự thả)
const trangThai = `(() => { const B = G.ban[0], o = {}; for (const T of B.t) if (T) o[T.id + '@' + T.o] = { nap: +T.nap.toFixed(3), tu: T.tuPhatN || 0, hy: +(T.hyA || 0).toFixed(2) }; return { o, mana: Math.round(B.mana), hyLan: B.hyLan || 0, so: B.t.filter(Boolean).length, trung: B.t.some(T => T && T.id === 'tienhoa') }; })()`;

function chay(hat, doiRandom) {
  const ctx = taoMoiTruong(hat);
  R(ctx, DUNG); R(ctx, napDay);
  const truoc = R(ctx, trangThai);
  const cham = R(ctx, `({ ${[...TU, ...BAM].map(id => `${id}: (() => { const T = G.ban[0].t.find(X => X && X.id === '${id}'); return T ? chamSan(T) : null; })()`).join(', ')} })`);
  if (doiRandom) R(ctx, `Math.random = (() => { let s = 99; return () => { s = (s * 69069 + 1) >>> 0; return s / 4294967296; }; })()`);
  // 1 khung mô phỏng: tuKichBan chạy ngay sau capNhatU
  R(ctx, `capNhatBan(G.ban[0], 1 / 30)`);
  const sau = R(ctx, trangThai);
  return { ctx, truoc, sau, cham };
}

const a = chay(7, false);
const tim = (s, id) => Object.entries(s.o).find(([k]) => k === id + '@' + { blackhole: 9, thacmana: 10 }[id] || (!['blackhole', 'thacmana'].includes(id) && k.startsWith(id + '@')));
// tự kích: nạp tụt về 0 (hoặc kỹ năng bật) sau 1 khung
for (const id of TU) {
  if (id === 'tienhoa') { kt(!a.sau.trung, 'Evolver: trứng cháy TỰ tái chế (+20 mana, ô trống)', a.sau); continue; }
  if (id === 'hydra') { kt(a.sau.hyLan === 1 && tim(a.sau, 'hydra')[1].hy > 0, 'Hydra: tự kích hoạt chung (không chạm thẻ)', a.sau); continue; }
  const e = tim(a.sau, id); kt(e && e[1].nap < 0.2, id + ': tự kích khi nạp đầy', e);
}
for (const id of BAM) { const e = tim(a.sau, id); kt(e && e[1].nap >= 1, id + ': KHÔNG tự nổ (chờ chạm)', e); }
// chạm: chỉ 2 ụ bấm tay
for (const id of BAM) kt(a.cham[id] === true, id + ': chamSan = true (chạm dùng chiêu)', a.cham);
for (const id of TU) kt(a.cham[id] === false, id + ': chamSan = false (chạm = xem ụ)', a.cham);
kt(R(a.ctx, `laTuKich('blackhole') || laTuKich('thacmana')`) === false, 'laTuKich: Black Hole / Arcane Cascade không tự kích');
// để đầy thêm 10 s: 2 ụ bấm tay vẫn không tự dùng (luật cũ napChuDong 6 s đã tắt cho ụ bấm tay)
R(a.ctx, `{ const B = G.ban[0]; for (const T of [B.t[9], B.t[10]]) T.nap = 1; for (let i = 0; i < 300; i++) capNhatBan(B, 1 / 30); }`);
const bam10 = R(a.ctx, `[G.ban[0].t[9], G.ban[0].t[10]].map(T => [T.id, T.nap, !!T.bhA, T.thacT || 0])`);
kt(bam10.every(([, n, bh, th]) => n >= 1 && !bh && !(th > 0)), '2 ụ bấm tay để đầy 10 s vẫn chờ chạm', bam10);
// chạm thật Black Hole → dùng được
const bh = R(a.ctx, `(() => { const B = G.ban[0], T = B.t.find(X => X && X.id === 'blackhole'); return SKILLS.blackhole.chuDong(G, B, T) && T.nap === 0; })()`);
kt(bh === true, 'chạm Black Hole khi đầy: SINGULARITY bật');
// AI (bàn máy) vẫn dùng 2 ụ bấm tay
const ai = R(a.ctx, `(() => { const B = G.ban[0]; B.ai = true; B.aiT = 0; const T = B.t.find(X => X && X.id === 'thacmana'); T.nap = 1; T.thacCd = 0; B.mana = 5000; for (let i = 0; i < 40 && T.nap >= 1; i++) aiBan(B, 1); B.ai = false; return T.nap; })()`);
kt(ai < 1, 'AI vẫn tự dùng Arcane Cascade (ụ bấm tay)', ai);

// tất định: cùng hạt → cùng kết quả · đổi Math.random giữa chừng → lúc tự kích không đổi
const b = chay(7, false), c = chay(7, true);
kt(JSON.stringify(a.sau) === JSON.stringify(b.sau), 'tất định: 2 mô phỏng cùng hạt giống hệt', [a.sau, b.sau]);
const nap = (s) => Object.fromEntries(Object.entries(s.o).map(([k, v]) => [k, v.nap < 0.2 ? 'kich' : 'cho']));
kt(JSON.stringify(nap(a.sau)) === JSON.stringify(nap(c.sau)) && a.sau.hyLan === c.sau.hyLan, 'tự kích không phụ thuộc Math.random', [nap(a.sau), nap(c.sau)]);

// không kích khi bị băng / dưới 3★ / chưa đầy
const khoa = R(taoMoiTruong(3), `${DUNG}; ${napDay}; (() => { const B = G.ban[0]; const L = B.t.find(T => T && T.id === 'leviathan'), C = B.t.find(T => T && T.id === 'chuato'), N = B.t.find(T => T && T.id === 'ngaithoigian');
  B.t.find(T => T && T.id === 'haoquang').nap = 0; L.st.bang = 99; C.sao = 2; N.nap = 0.9; tuKichBan(B); /* Holy Halo thanh tẩy băng → tắt nó */ return [L.nap, C.nap, N.nap]; })()`);
kt(khoa[0] >= 1 && khoa[1] >= 1 && khoa[2] < 1 && khoa[2] > 0.5, 'không tự kích khi bị băng / dưới 3★ / chưa đầy', khoa);

console.log((loi ? '✗ ' : '✓ ') + 'thap-kt-tu-kich: ' + ok + ' đạt, ' + loi + ' lỗi');
process.exit(loi ? 1 : 0);
