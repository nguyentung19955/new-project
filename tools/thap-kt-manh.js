// TURRET MERGE — KIỂM NGUỒN MẢNH Vàng/Đỏ (js/manh.js)
//  ✓ bản cũ: kỷ lục Solo (turret_best) → mốc nhận được ngay, không mất vàng/thẻ · ✓ hết trận: tự nhận mốc + trùm lần đầu đúng số bản
//  ✓ tải lại: không nhận lại, không đổi kết quả · ✓ lò rèn: trừ bản/vàng, giới hạn tuần, kết quả tất định theo bản lưu
//  ✓ gộp hồ sơ Firebase: cờ OR + kỷ lục lớn nhất · ✓ Đỏ hiếm hơn Vàng ở mọi nguồn mới · không lỗi trang
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-manh.js
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const vao = async () => { await p.goto(BASE + '?notut=1', { waitUntil: 'load' }); await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof MH !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 }); await sleep(400); };
  const tong = () => p.evaluate(() => { const o = { vang: 0, do: 0 }; for (const b of ['vang', 'do']) for (const id of KT.dsBac(b)) o[b] += THEBAI.the(id).n; o.gold = THEBAI.doc().vang; return o; });

  await p.goto(BASE + '?notut=1', { waitUntil: 'commit' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('turret_the', JSON.stringify({ v: 1, vang: 50000, c: {} })); localStorage.setItem('turret_best', JSON.stringify({ solo: { wave: 52 }, coop: { wave: 70 } })); });
  await vao();
  let r = await p.evaluate(() => ({ sw: MH.st().sw, xong: MH.mocDs().filter(o => o.xong && !o.da).map(o => o.w), dot: KT.coNhan().nv, gold: THEBAI.doc().vang, nv: KTC.nv.some(q => q.id === 'wave30') }));
  ok(r.sw === 52 && r.xong.join() === '20,30,40,50' && r.dot && r.gold === 50000 && r.nv, 'bản cũ: kỷ lục Solo 52 (không lấy co-op 70) → mốc 20–50 mở, chấm đỏ, vàng giữ nguyên, nhiệm vụ wave 30 vào bể', JSON.stringify(r));

  const t0 = await tong();
  r = await p.evaluate(() => { KT.batTran('solo'); MH.tran = { hive: 1, freezer: 1, khong_co: 1 }; const x = KT.ketTran({ wave: 61, thang: false }, { che: 'solo', trum: 2 }); return { mh: (x.mh || []).map(g => g.nhan), sw: MH.st().sw, tr: Object.keys(MH.st().tr).sort().join() }; });
  let t1 = await tong();
  ok(r.mh.join('|') === 'SOLO WAVE 20|SOLO WAVE 30|SOLO WAVE 40|SOLO WAVE 50|SOLO WAVE 60|FIRST KILL' && r.sw === 61 && r.tr === 'freezer,hive', 'hết trận Solo wave 61 + 2 trùm: tự nhận 5 mốc + trùm lần đầu (bỏ id lạ)', JSON.stringify(r));
  ok(t1.vang - t0.vang === 1 + 2 + 3 + 3 + 4 + 2 && t1.do - t0.do === 2, 'số bản: Vàng +15, Đỏ +2', JSON.stringify([t0, t1]));
  r = await p.evaluate(() => { KT.batTran('coop'); MH.tran = {}; const x = KT.ketTran({ wave: 75 }, { che: 'coop' }); return { n: (x.mh || []).length, sw: MH.st().sw }; });
  ok(r.n === 0 && r.sw === 61, 'co-op wave 75 không tính mốc Solo', JSON.stringify(r));

  const luu = await p.evaluate(() => localStorage.getItem('turret_kt'));
  await vao();
  r = await p.evaluate(() => ({ lai: MH.tuDong().length, dot: MH.coNhan(), da: MH.mocDs().filter(o => o.da).length }));
  let t2 = await tong();
  ok(r.lai === 0 && !r.dot && r.da === 5 && t2.vang === t1.vang && t2.do === t1.do, 'tải lại: giữ cờ đã nhận, không nhận lại', JSON.stringify([r, t1, t2]));

  // lò rèn
  r = await p.evaluate(() => {
    const id = KT.dsBac('vang')[0], d = THEBAI.doc(); d.c[id] = { lv: 9, n: 25 }; d.vang = 25000; THEBAI.luu(); KT.luu();
    return { id, snap: localStorage.getItem('turret_kt'), snapT: localStorage.getItem('turret_the') };
  });
  const rr = await p.evaluate((id) => { const a = MH.ren('vd', id), b = MH.ren('vd', id); return { a: a && a.the.map(x => x.id + 'x' + x.n).join(), b, n: THEBAI.the(id).n, gold: THEBAI.doc().vang, bac: a && THEBAI.bac(a.the[0].id), con: MH.renDs().find(c => c.k === 'vd').con }; }, r.id);
  ok(rr.a && rr.bac === 'do' && rr.b === null && rr.n === 15 && rr.gold === 15000 && rr.con === 0, 'lò rèn 10 Vàng + 10 000 vàng → 1 Đỏ; lần 2 cùng tuần bị chặn', JSON.stringify(rr));
  await p.evaluate((s) => { localStorage.setItem('turret_kt', s.snap); localStorage.setItem('turret_the', s.snapT); }, r);
  await vao();
  const rr2 = await p.evaluate((id) => { const a = MH.ren('vd', id); return a && a.the.map(x => x.id + 'x' + x.n).join(); }, r.id);
  ok(rr2 === rr.a, 'lò rèn tất định theo bản lưu (cùng bản lưu → cùng thẻ)', rr.a + ' / ' + rr2);
  r = await p.evaluate(() => { const ds = MH.renDs().find(c => c.k === 'tv'); return { duoc: ds.duoc, n: ds.the.length }; });
  ok(!r.duoc && r.n === 0, 'không đủ 30 bản Sử thi → nút rèn Vàng tắt', JSON.stringify(r));

  // gộp hồ sơ
  r = await p.evaluate(() => {
    const kt = JSON.parse(JSON.stringify(KT.doc())); kt.n = (kt.n | 0) + 50; kt.mh = { sw: 72, moc: { 70: 1 }, tr: { leech: 1 }, trn: { leech: 1 }, bo: 0, ren: { tuan: 0, n: {} }, renN: 0 };
    KT.gop({ kt, the: JSON.parse(JSON.stringify(THEBAI.doc())) });
    const m = MH.st(); return { sw: m.sw, moc: Object.keys(m.moc).sort((a, b) => a - b).join(), tr: Object.keys(m.tr).sort().join(), renN: m.renN };
  });
  ok(r.sw === 72 && r.moc === '20,30,40,50,60,70' && r.tr === 'freezer,hive,leech' && r.renN >= 1, 'gộp hồ sơ: OR cờ + kỷ lục lớn nhất', JSON.stringify(r));

  // Đỏ hiếm hơn
  r = await p.evaluate(() => { let v = 0, d = 0; for (const o of MHC.moc) for (const x of o.r) { if (x.the.bac === 'vang') v += x.the.n; else d += x.the.n; } return { v, d, ren: MHC.ren.find(c => c.ra === 'do').tuan < MHC.ren.find(c => c.ra === 'vang').tuan, bo: MHC.trumDu.the.n }; });
  ok(r.d * 4 <= r.v && r.ren && r.bo === 1, 'Đỏ hiếm hơn: mốc Vàng ' + r.v + ' / Đỏ ' + r.d + ', lò rèn Đỏ 1/tuần', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ ĐẠT'); process.exit(loi ? 1 : 0);
})();
