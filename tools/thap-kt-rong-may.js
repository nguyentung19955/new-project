// TURRET MERGE — KIỂM Rồng Máy (Wyrm Engine, ronglua) "LÒ PHẢN ỨNG" (08/11 — docs/demo-hop-tuong/tuvan/rong-may/THIET-KE.md)
//   Phần 1 (node, không trình duyệt — môi trường mô phỏng của tools/thap-sim-vaitro.js):
//     luật nhiệt (tích / nguội / mốc 100–250 / ghép cùng hàng-cột +5×★ / Rồng là nguyên liệu không tính / Rồng+Rồng giữ nhiệt),
//     tia tim lò theo dạng, Dive đốt hết nhiệt ×(1+nhiệt/100), 4 dạng theo sao, tất định (2 lần cùng hạt = cùng số),
//     số đo sát thương (cùng cách thap-sim-co-bac dps: wave 12, cấp thẻ +3) so Hive Queen.
//   Phần 2 (Playwright, BASE): gói online oTT → datO giữ nhiệt; ảnh/hình 4 dạng + bệ đã tải; chụp 844×390 + 390×844 (CHUP=0 bỏ).
// Chạy (gốc repo): python3 -m http.server 8765 &  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-rong-may.js
//   BASE=http://localhost:8765/thap/ · OUT=thư mục ảnh (mặc định tests/rong-may/shots/) · NHANH=1 đo sát thương ngắn (60 s)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { taoMoiTruong, R, dpsBan } = require('./thap-sim-vaitro.js');
const GOC = path.join(__dirname, '..', 'thap');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || path.join(__dirname, '..', 'tests', 'rong-may', 'shots');
const LOI = []; let dat = 0;
const kt = (ten, ok, chi) => { if (ok) { dat++; console.log('  ✓ ' + ten); } else { LOI.push(ten + ' — ' + chi); console.log('  ✗ ' + ten + ' — ' + (chi || '')); } };

function moi(hat) {
  const ctx = taoMoiTruong(hat || 777);
  vm.runInContext("if (typeof SUP === 'undefined') { var SUP = {}, SUP_LOAI = {}, SUP_GIA = {}; }", ctx);
  for (const f of ['vangmoi1', 'skills7', 'jackpot']) vm.runInContext(fs.readFileSync(path.join(GOC, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  R(ctx, `const _sRM = sinhU; sinhU = function (T) { const r = _sRM.apply(this, arguments); const B = G.ban[T.ban]; B.capThe = Object.assign(B.capThe || {}, { [T.id]: 3 }); return r; };
    var KB = {
      moi() { G.debug = { auto: false }; batDau('solo', ['ronglua', 'lien', 'canon', 'set', 'tia'], 'hero'); G.cho = 1e9; G.wave = 12; G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0;
        const B = G.ban[0]; B.t.fill(null); B.tim = 1e9; B.mana = 0; return B; },
      dat(o, id, sao) { const B = G.ban[0]; const T = sinhU(taoU(B, id, sao, o)); B.t[o] = T; return T; },
      gan(T, hs) { const p = G.duong.findIndex(q => q.ban === 0), P = G.duong[p], c = tamU(T); let bs = 0, bd = 1e9;
        for (let s = 0; s < P.len; s += 4) { const [x, y] = viTri(P, s), d = Math.hypot(x - c.x, y - c.y); if (d < bd) { bd = d; bs = s; } }
        const E = sinhQuai('bo', p, bs, hs || 1e6); E.vao = 1; E.d = Object.assign({}, E.d, { v: 0 }); return E; },
      buoc(s) { const n = Math.round(s / BUOC); for (let i = 0; i < n; i++) capNhat(BUOC); },
    };`);
  return ctx;
}

function luat() {
  console.log('— Luật (node)');
  const ctx = moi(777);
  let r = R(ctx, `(() => { KB.moi(); const S = SKILLS.ronglua, d = [1, 2, 3, 4, 5, 6, 7].map(s => S.dang({ sao: s }));
    const th0 = S.thuong(99), th1 = S.thuong(100), th2 = S.thuong(250);
    return { d, th0, th1, th2, J: S.J.slice(), dive: [S.heDive(0), S.heDive(150)] }; })()`);
  kt('4 dạng theo sao: 1–2★ / 3–4★ / 5–6★ / 7★', JSON.stringify(r.d) === '[1,1,2,2,3,3,4]', JSON.stringify(r.d));
  kt('thưởng nhiệt: +0.2% ST/nhiệt, ≥100 +25% tốc, ≥250 +100% ST chí mạng', Math.abs(r.th0.dmg - 0.198) < 1e-9 && !r.th0.toc && r.th1.toc === 0.25 && !r.th1.cdmg && r.th2.cdmg === 1, JSON.stringify([r.th0, r.th1, r.th2]));
  kt('tia tim lò: không ở dạng 1, 1.6 / 2.0 / 2.0 ở dạng 2/3/4', r.J[1] === 0 && r.J[2] === 1.6 && r.J[3] === 2 && r.J[4] === 2, JSON.stringify(r.J));
  kt('Dive ×(1 + nhiệt/100)', r.dive[0] === 1 && Math.abs(r.dive[1] - 2.5) < 1e-9, JSON.stringify(r.dive));

  // tích nhiệt + nguội
  r = R(ctx, `(() => { KB.moi(); const T = KB.dat(7, 'ronglua', 4); KB.gan(T); KB.buoc(10); const n10 = T.nhiet;
    G.quai.length = 0; KB.buoc(10); const nguoi = T.nhiet; return { n10, nguoi }; })()`);
  // 10 s × 5 nhịp/s, nguội 2%/s → cân bằng dần: 10 s ≈ 45 (không nguội: 50; ≥100 mới +25% tốc)
  kt('tích nhiệt +1/nhịp trúng (10 s ≈ 41–50), không quái thì nguội 2%/s (10 s còn ~82%)', r.n10 > 40 && r.n10 <= 50 && Math.abs(r.nguoi / r.n10 - Math.pow(0.98, 10)) < 0.02, JSON.stringify(r));
  r = R(ctx, `(() => { KB.moi(); const T = KB.dat(7, 'ronglua', 4); KB.gan(T); KB.buoc(120); return { n: T.nhiet }; })()`);
  kt('phun liên tục 120 s: lò cân bằng ~250–320 (không trần cứng)', r.n > 240 && r.n < 330, JSON.stringify(r));

  // ghép cùng hàng / cột
  r = R(ctx, `(() => { const B = KB.moi(); const T = KB.dat(7, 'ronglua', 3); T.nhiet = 0;
    const a = KB.dat(5, 'lien', 2), b = KB.dat(6, 'lien', 2); ghep(B, a, b); const hang = T.nhiet;            // ô 6 cùng hàng 1 với ô 7 → +5 × 3★
    const c = KB.dat(0, 'tia', 1), d = KB.dat(2, 'tia', 1); ghep(B, c, d); const cot = T.nhiet - hang;   // ô 2 cùng cột với ô 7 → +5 × 2★
    const e = KB.dat(10, 'set', 1), f = KB.dat(14, 'set', 1); ghep(B, e, f); const khac = T.nhiet - hang - cot; // ô 14: khác hàng, khác cột
    // Rồng là nguyên liệu: không tự nạp; Rồng + Rồng ra Rồng: giữ nhiệt lớn hơn (GIU_CONG_DON)
    return { hang, cot, khac, giu: GIU_CONG_DON.ronglua }; })()`);
  kt('ghép thật cùng HÀNG +5×★ ụ ra, cùng CỘT +5×★, chỗ khác 0', r.hang === 15 && r.cot === 10 && r.khac === 0, JSON.stringify(r));
  kt('Rồng + Rồng ra Rồng giữ nhiệt lớn hơn', JSON.stringify(r.giu) === '["nhiet"]', JSON.stringify(r.giu));

  // Dive đốt hết nhiệt
  r = R(ctx, `(() => { const B = KB.moi(); const T = KB.dat(7, 'ronglua', 4); T.nhiet = 150; T.nap = 1;
    const ok = SKILLS.ronglua.chuDong(G, B, T); const o = G.hu.find(h => h.k === 'rongBo'); return { ok, n: T.nhiet, he: o && o.dmg / (dmgU(T) * 25), hv: o && o.hv }; })()`);
  kt('DRAGON DIVE đốt hết nhiệt: ST ×(1+150/100)=2.5, vệt ×1.75, nhiệt về 0', r.ok && r.n === 0 && Math.abs(r.he - 2.5) < 0.01 && Math.abs(r.hv - 1.75) < 1e-9, JSON.stringify(r));
  r = R(ctx, `(() => { const B = KB.moi(); const T = KB.dat(7, 'ronglua', 4); T.nhiet = 300; T.nap = 1;
    const nguoi = SKILLS.ronglua.aiNen(G, B, T); B.ai = true; const ai = SKILLS.ronglua.aiNen(G, B, T); B.ai = false;
    const E = KB.gan(T); E.trum = true; const trum = SKILLS.ronglua.aiNen(G, B, T); return { nguoi, ai, trum }; })()`);
  kt('người chơi để đầy: không tự lao vì nhiệt (chỉ khi có trùm); AI lao khi nhiệt ≥ 200', !r.nguoi && r.ai && r.trum, JSON.stringify(r));

  // tia tim lò: với xa hơn nón, dạng 4 trúng 2 quái đầu; dạng 1 không có tia
  r = R(ctx, `(() => { const out = {}; for (const s of [1, 4, 7]) { KB.moi(); const T = KB.dat(7, 'ronglua', s); const E1 = KB.gan(T), E2 = KB.gan(T); E2.s -= 3;
    let n = 0; const t0 = trung; trung = function (E, d, o) { if (o && o.mau === '#fff2c0') n++; return t0.apply(this, arguments); };
    KB.buoc(1); trung = t0; out[s] = n; } return out; })()`);
  kt('tia tim lò: 1★ không có, 4★ 1 quái/nhịp, 7★ 2 quái/nhịp', r[1] === 0 && r[4] >= 4 && r[4] <= 6 && r[7] >= 8 && r[7] <= 12, JSON.stringify(r));

  // tất định: 2 môi trường cùng hạt → cùng tổng sát thương + cùng nhiệt
  const chay = () => { const c = moi(4242); return R(c, `(() => { KB.moi(); const T = KB.dat(7, 'ronglua', 5); KB.dat(6, 'ronglua', 3);
    const p = G.duong.findIndex(q => q.ban === 0), P = G.duong[p]; for (let k = 0; k < 12; k++) { const E = sinhQuai('bo', p, P.len * (0.1 + 0.06 * k), 20); E.vao = 1; }
    KB.buoc(30); return { n: +T.nhiet.toFixed(6), hp: G.quai.reduce((s, E) => s + Math.max(0, E.hp), 0).toFixed(3), sum: (G._sum || 0).toFixed(3) }; })()`); };
  const a = chay(), b = chay();
  kt('tất định: 2 lần cùng hạt = cùng nhiệt + cùng máu quái còn lại', JSON.stringify(a) === JSON.stringify(b), JSON.stringify([a, b]));
  const ma = fs.readFileSync(path.join(GOC, 'js', 'skills5.js'), 'utf8'), i0 = ma.indexOf('SKILLS.ronglua = {'), i1 = ma.indexOf('const RONG_VE');
  kt('luật Rồng không gọi Math.random / rnd()', i0 > 0 && i1 > i0 && !/Math\.random|\brnd\(/.test(ma.slice(i0, i1)), 'có Math.random/rnd trong SKILLS.ronglua');
}

function soDo() {
  console.log('— Số đo sát thương (4★ wave 12, cấp thẻ +3)');
  const T0 = process.env.NHANH ? 60 : 300, ctx = moi(777), kq = {};
  for (const id of ['chuato', 'ronglua']) kq[id] = [dpsBan(ctx, [[2, id, 4]], T0, { wave: 12, max: 1, hs: 400 }) * 60, dpsBan(ctx, [[2, id, 4]], T0, { wave: 12, max: 10, hs: 20 }) * 60];
  const k = (v) => (v / 1000).toFixed(0) + 'k';
  console.log('    Hive Queen đơn ' + k(kq.chuato[0]) + ' đông ' + k(kq.chuato[1]) + ' · Rồng Máy đơn ' + k(kq.ronglua[0]) + ' đông ' + k(kq.ronglua[1]));
  kt('Rồng Máy 4★ là ụ Đỏ mạnh: đơn ≥ 0.85 × Hive Queen, đông ≥ 1.5 × Hive Queen (trước: 9k / 101k)', kq.ronglua[0] >= 0.85 * kq.chuato[0] && kq.ronglua[1] >= 1.5 * kq.chuato[1], JSON.stringify(kq));
  kt('không vượt quá xa (đơn ≤ 1.6 × Hive Queen)', kq.ronglua[0] <= 1.6 * kq.chuato[0], JSON.stringify(kq));
}

async function trinhDuyet() {
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('  SKIP trình duyệt (không có playwright)'); return; }
  console.log('— Trình duyệt');
  const b = await chromium.launch();
  const chup = process.env.CHUP !== '0';
  for (const [W, H] of chup ? [[844, 390], [390, 844]] : [[844, 390]]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(BASE + '?mode=solo&deck=ronglua,lien,canon,set,tia&mana=0&notut=1&seed=777&nointro=1', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length, null, { timeout: 60000 });
    await p.waitForTimeout(1200);
    const r = await p.evaluate(async () => {
      G.cho = 1e9; G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.wave = 12;
      const B = G.ban[0]; B.t.fill(null); B.tim = 1e9; B.mana = 0;
      const ds = [[5, 1, 20], [6, 3, 120], [8, 5, 260], [9, 7, 400]].map(([o, s, n]) => { const T = sinhU(taoU(B, 'ronglua', s, o)); B.t[o] = T; T.nhiet = n; return T; });
      // online: gói ô giữ nhiệt
      const goi = ds.map(T => ONS.oTT(T)), X = { t: B.t.slice() };
      const B2 = { t: new Array(15).fill(null), o: B.o, i: 0, cw: B.cw, ch: B.ch, deck: B.deck, lv: B.lv };
      let rt = true; goi.forEach((g, i) => { const o = ds[i].o; G.ban.push(B2); B2.i = G.ban.length - 1; try { ONS.datO(B2, o, g); } catch (e) { rt = false; } G.ban.pop(); const Y = B2.t[o]; if (!Y || Math.abs(Y.nhiet - ds[i].nhiet) > 0.01 || Y.sao !== ds[i].sao) rt = false; });
      for (let i = 0; i < 60 && !(window.RONG_DANG && [1, 2, 3, 4].every(f => REN.img('ronglua_f' + f + '_nong') && REN.img('ronglua_f' + f + '_canh') && REN.img('ronglua_f' + f + '_de'))); i++) await new Promise(ok => setTimeout(ok, 100));
      const anh = [1, 2, 3, 4].every(f => REN.img('ronglua_f' + f + '_nong') && REN.img('ronglua_f' + f + '_canh') && REN.img('ronglua_f' + f + '_de'));
      const de = ds.map(T => (SKILLS.ronglua.deAnh(T) || [])[0]);
      const pi = G.duong.findIndex(q => q.ban === 0), P = G.duong[pi];
      for (let k = 0; k < 14; k++) { const E = sinhQuai('bo', pi, P.len * (0.15 + k * 0.05), 3); E.vao = 1; }
      return { goi, rt, anh, de };
    });
    kt(W + '×' + H + ' online: oTT → datO giữ nhiệt + sao (cờ H)', r.rt && r.goi.every(g => /H\d+;/.test(g[2])), JSON.stringify(r.goi));
    kt(W + '×' + H + ' 4 dạng: ảnh đầu/cánh/bệ đã tải, bệ theo dạng', r.anh && r.de.join() === 'ronglua_f1_de,ronglua_f2_de,ronglua_f3_de,ronglua_f4_de', JSON.stringify(r));
    if (chup) {
      fs.mkdirSync(OUT, { recursive: true });
      for (let i = 0; i < 4; i++) { await p.evaluate(() => { for (let k = 0; k < 6; k++) capNhat(BUOC); }); await p.waitForTimeout(140); }
      await p.screenshot({ path: path.join(OUT, 'tran-' + W + 'x' + H + '.png') });
      await p.evaluate(() => { const T = G.ban[0].t[9]; T.nap = 1; SKILLS.ronglua.chuDong(G, G.ban[0], T); });
      for (let i = 0; i < 5; i++) { await p.evaluate(() => { for (let k = 0; k < 4; k++) capNhat(BUOC); }); await p.waitForTimeout(100); }
      await p.screenshot({ path: path.join(OUT, 'dive-' + W + 'x' + H + '.png') });
    }
    kt(W + '×' + H + ' không lỗi trang', !errs.length, errs.slice(0, 3).join(' | '));
    await p.close();
  }
  await b.close();
}

(async () => {
  luat();
  soDo();
  await trinhDuyet();
  console.log((LOI.length ? '✗' : '✓') + ' thap-kt-rong-may: ' + dat + ' đạt, ' + LOI.length + ' lỗi');
  if (LOI.length) { for (const l of LOI) console.log('   - ' + l); process.exit(1); }
})();
