// TURRET MERGE — KIỂM KINH TẾ / CỬA HÀNG (js/kinhte.js) — có trong tools/thap-kt-hoiquy.js.
//  ✓ Daily Specials tất định (cùng ngày + mã người chơi = cùng 6 ô; ngày khác / người khác = khác; ô Cổ đại ≈ 1/7 ngày)
//  ✓ tỉ lệ rương / vòng quay cộng đủ 100 %, Cổ đại vòng quay ≤ 0,3 %, rương Thường không có Cổ đại
//  ✓ bảo hiểm: Huyền thoại ≤ 10 Rương Vàng, Cổ đại ≤ 120 Rương Vàng · Rương Thần thoại ≥ 1 Cổ đại + 2 Huyền thoại · Rương Vàng ≥ 1 Sử thi+
//  ✓ mở rương / quay tất định theo hạt giống · không nhận 2 lần (shop free, điểm danh, nhiệm vụ, thưởng đủ 3, thành tựu, mốc sự kiện,
//    vòng quay miễn phí; lùi đồng hồ không mở lại) · trận → nhiệm vụ + điểm sự kiện · di chuyển bản lưu cũ (không mất vàng/cấp thẻ/kỷ lục)
//  ✓ gộp hồ sơ Firebase (bản n lớn hơn, cờ OR, cấp thẻ lớn nhất) · không lỗi trang
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-shop.js
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const vao = async () => { await p.goto(BASE + '?notut=1', { waitUntil: 'load' }); await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof KT !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 }); await sleep(500); };

  // ---- 1. di chuyển bản lưu cũ ----
  await p.goto(BASE + '?notut=1', { waitUntil: 'commit' });
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('turret_the', JSON.stringify({ v: 1, vang: 4321, c: { canon: { lv: 4, n: 7 } } })); localStorage.setItem('turret_best', JSON.stringify({ solo: { wave: 41 } })); localStorage.setItem('turret_bo', JSON.stringify({ chon: ['canon', 'bang', 'tia', 'set', 'lien'], mv: 'hero', che: 'solo' })); });
  await vao();
  let r = await p.evaluate(() => ({ vang: THEBAI.doc().vang, ngoc: THEBAI.doc().ngoc, lv: THEBAI.the('canon').lv, n: THEBAI.the('canon').n, w: KT.doc().tk.wave, bo: localStorage.getItem('turret_bo'), w30: KT.tt().find(a => a.id === 'w30').xong }));
  ok(r.vang === 4321 && r.lv === 4 && r.n === 7 && r.ngoc === 0 && r.bo && r.w === 41 && r.w30, 'di chuyển bản cũ: giữ vàng/cấp thẻ/bộ bài, ngọc 0, kỷ lục wave → thành tựu mở', JSON.stringify(r));
  await p.evaluate(() => localStorage.setItem('turret_kt', '{hỏng'));
  await vao();
  r = await p.evaluate(() => ({ hong: !!localStorage.getItem('turret_kt_hong'), ok: !!KT.doc().pid, vang: THEBAI.doc().vang }));
  ok(r.hong && r.ok && r.vang === 4321, 'bản lưu kinh tế hỏng → giữ bản sao _hong, không mất vàng', JSON.stringify(r));

  r = await p.evaluate(() => {
    const o = {};
    // ---- 2. Daily Specials tất định ----
    const j = (x) => JSON.stringify(x);
    o.sp1 = j(KT.spTao(20261106)) === j(KT.spTao(20261106));
    o.sp2 = j(KT.spTao(20261106)) !== j(KT.spTao(20261107));
    const pid = KT.s.pid; KT.s.pid = 'khac'; o.sp3 = j(KT.spTao(20261106)) !== (KT.s.pid = pid, j(KT.spTao(20261106)));
    const a = KT.spTao(20261106); o.sp6 = a.length === 6 && a[0].free && a.slice(1).every(x => x.id && x.n > 0 && x.gia.vang > 0);
    let doN = 0, vangN = 0; for (let d = 0; d < 700; d++) { const s = KT.spTao(30000000 + d); if (s.some(x => x.bac === 'do')) doN++; if (s.some(x => x.bac === 'vang')) vangN++; }
    o.doNgay = doN / 700; o.vangNgay = vangN / 700;
    // ---- 3. tỉ lệ ----
    o.tong = Object.values(KTC.ruong).map(C => Math.round(Object.values(C.tiLe).reduce((s, v) => s + v, 0) * 1000) / 1000);
    o.vqF = Math.round(KT.vqTiLe(false).reduce((s, v) => s + v, 0) * 1000) / 1000; o.vqT = Math.round(KT.vqTiLe(true).reduce((s, v) => s + v, 0) * 1000) / 1000;
    o.vqDo = KT.vqTiLe(true)[7] * 0.3; o.thuongDo = KTC.ruong.thuong.tiLe.do;
    // ---- 4. bảo hiểm + bảo đảm + tất định ----
    const d = THEBAI.doc(); d.ngoc = 1e9; d.vang = 1e9;
    const sv = j(KT.s), sd = j(d);
    const r1 = KT.moRuong('vang'); KT.s = JSON.parse(sv); THEBAI.d = JSON.parse(sd); const r2 = KT.moRuong('vang');
    o.tatDinh = j(r1.the) === j(r2.the);
    let gapV = 0, maxV = 0, gapD = 0, maxD = 0, it = 1;
    for (let i = 0; i < 500; i++) {
      const x = KT.moRuong('vang'); const coV = x.the.some(c => c.bac === 'vang' || c.bac === 'do'), coD = x.the.some(c => c.bac === 'do');
      if (!x.the.some(c => TIERS[c.bac].thuTu >= 2)) it = 0;
      gapV = coV ? 0 : gapV + 1; maxV = Math.max(maxV, gapV); gapD = coD ? 0 : gapD + 1; maxD = Math.max(maxD, gapD);
    }
    o.maxV = maxV; o.maxD = maxD; o.itTim = it;
    let than = 1; for (let i = 0; i < 40; i++) { const x = KT.moRuong('than'); const so = (b) => x.the.filter(c => c.bac === b).reduce((t, c) => t + c.n, 0), nD = so('do'), nV = so('vang'); if (nD < 1 || nV + nD < 3) than = 0; }
    o.than = than;
    let thDo = 0; for (let i = 0; i < 300; i++) if (KT.moRuong('thuong').the.some(c => c.bac === 'do')) thDo++; o.thDo = thDo;
    o.khongDu = (() => { THEBAI.doc().ngoc = 10; return KT.moRuong('vang') === null && KT.vqQuay(true) === null; })();
    KT.s = JSON.parse(sv); THEBAI.d = JSON.parse(sd); KT.luu();
    // ---- 5. không nhận 2 lần ----
    const sp = KT.sp(); o.f1 = !!KT.spMua(0); o.f2 = KT.spMua(0) === null;
    THEBAI.doc().vang = 1e6; const i2 = sp.findIndex(x => !x.free); o.m1 = !!KT.spMua(i2); o.m2 = KT.spMua(i2) === null;
    o.d1 = !!KT.dnNhan(); o.d2 = KT.dnNhan() === null;
    o.v1 = !!KT.vqQuay(false); o.v2 = KT.vqQuay(false) === null;
    THEBAI.doc().ngoc = 1000; let n = 0; while (KT.vqQuay(true)) n++; o.vTra = n;
    KT.nv(); const q = KT.s.nv.ds[0]; KT.s.nv.tien[q] = 9999; o.q1 = !!KT.nvNhan(q); o.q2 = KT.nvNhan(q) === null;
    o.b0 = KT.nvBonus() === null; for (const id of KT.s.nv.ds) { KT.s.nv.tien[id] = 9999; KT.nvNhan(id); } o.b1 = !!KT.nvBonus(); o.b2 = KT.nvBonus() === null;
    KT.s.tk.trum = 1; o.t1 = !!KT.ttNhan('trum'); o.t2 = KT.ttNhan('trum') === null;
    KT.sk().diem = 50; o.e1 = !!KT.skNhan(0); o.e2 = KT.skNhan(0) === null; o.e3 = KT.skNhan(1) === null;
    // lùi đồng hồ 1 ngày → vẫn là ngày đã nhận
    const truoc = new Date(); truoc.setDate(truoc.getDate() - 1); KT._bay = () => truoc;
    o.lui = KT.dnNhan() === null && KT.vqQuay(false) === null && KT.spMua(0) === null;
    // sang ngày mới → nhận lại được
    const sau = new Date(); sau.setDate(sau.getDate() + 1); KT._bay = () => sau;
    o.moi = !!KT.dnNhan() && !!KT.vqQuay(false) && !!KT.spMua(0) && KT.nv().every(x => !x.da);
    KT._bay = null;
    o.nguon = !!(KT.s.nguon && KT.s.nguon['ngoc:quest'] > 0 && KT.s.nguon['vang:shop'] < 0 && KT.s.nguon['ngoc:login'] !== undefined || KT.s.nguon['vang:login']);
    // ---- 6. trận → nhiệm vụ / sự kiện / thành tựu ----
    const ngay = KT.ngay(); KT.s.nv = { ngay, ds: ['ghep30', 'coop1', 'wave15'], tien: {}, nhan: {}, bonus: 0 };
    const e0 = KT.sk().diem;
    KT.batTran('coop'); KT.tran.ghep = 31; KT.tran.sao7 = 1; KT.ketTran({ wave: 22, thang: true }, { trum: 2, che: 'coop' });
    const nv = KT.nv(); o.tran = nv.every(x => x.xong); o.diem = KT.sk().diem - e0; o.sao7 = KT.doc().tk.sao7 >= 1;
    o.tran2 = KT.ketTran({ wave: 22, thang: true }, { trum: 2 }) === null; // cùng trận không cộng 2 lần
    // ---- 7. gộp hồ sơ Firebase ----
    const may = JSON.parse(KT.goi());
    const mang = JSON.parse(KT.goi()); mang.kt.n = KT.s.n + 50; mang.the.vang = 777; mang.the.c.canon = { lv: 9, n: 0 }; mang.kt.tt = {}; mang.kt.ru.mo = 0;
    KT.gop(mang);
    o.gop = THEBAI.doc().vang === 777 && THEBAI.the('canon').lv === 9 && !!KT.s.tt.trum && KT.s.n > mang.kt.n && KT.dnNhan() === null;
    const mang2 = JSON.parse(KT.goi()); mang2.kt.n = 1; mang2.the.vang = 5; mang2.the.c.canon = { lv: 12, n: 1 };
    KT.gop(mang2); o.gop2 = THEBAI.doc().vang === 777 && THEBAI.the('canon').lv === 12;
    void may;
    return o;
  });
  ok(r.sp1 && r.sp2 && r.sp3 && r.sp6, 'Daily Specials tất định theo ngày + mã người chơi (6 ô, ô 1 miễn phí)', JSON.stringify(r));
  ok(r.doNgay > 0.09 && r.doNgay < 0.2 && r.vangNgay > 0.75, 'ô Cổ đại ~1 ngày/tuần (' + (r.doNgay * 100).toFixed(1) + '%), ngày còn lại Huyền thoại (' + (r.vangNgay * 100).toFixed(0) + '%)');
  ok(r.tong.every(t => t === 100) && r.vqF === 100 && r.vqT === 100, 'tỉ lệ rương / vòng quay cộng đủ 100%', JSON.stringify([r.tong, r.vqF, r.vqT]));
  ok(r.vqDo <= 0.3 && r.thuongDo === 0 && r.thDo === 0, 'Cổ đại: vòng quay ngọc ' + r.vqDo.toFixed(3) + '% (≤0,3), rương Thường 0');
  ok(r.maxV <= 9 && r.maxD <= 119, 'bảo hiểm: khoảng trống dài nhất ' + r.maxV + ' rương không Huyền thoại (≤9), ' + r.maxD + ' không Cổ đại (≤119)');
  ok(r.itTim && r.than && r.tatDinh && r.khongDu, 'bảo đảm Rương Vàng ≥1 Sử thi, Thần thoại ≥1 Cổ đại + 2 Huyền thoại; mở tất định; thiếu ngọc không mở', JSON.stringify([r.itTim, r.than, r.tatDinh, r.khongDu]));
  ok(r.f1 && r.f2 && r.m1 && r.m2 && r.d1 && r.d2 && r.v1 && r.v2 && r.vTra === 5 && r.q1 && r.q2 && r.b0 && r.b1 && r.b2 && r.t1 && r.t2 && r.e1 && r.e2 && r.e3, 'không nhận 2 lần (quà shop, mua, điểm danh, quay miễn phí, 5 lượt ngọc, nhiệm vụ, thưởng đủ 3, thành tựu, mốc sự kiện)', JSON.stringify(r));
  ok(r.nguon, 'mối nối tiền tệ KT.cong ghi nhãn nguồn (quest/login/shop…, để dành iap/ad/pass)', JSON.stringify(r.nguon));
  ok(r.lui && r.moi, 'lùi đồng hồ không mở lại; sang ngày mới thì mở lại', JSON.stringify([r.lui, r.moi]));
  ok(r.tran && r.diem === 42 && r.sao7 && r.tran2, 'trận co-op → nhiệm vụ ghép/co-op/wave xong, +42 điểm sự kiện, 7★, không cộng 2 lần', JSON.stringify([r.tran, r.diem, r.sao7, r.tran2]));
  ok(r.gop && r.gop2, 'gộp hồ sơ Firebase: bản mới hơn thắng, cờ đã nhận giữ, cấp thẻ lấy lớn nhất', JSON.stringify([r.gop, r.gop2]));

  // ---- 8. giao diện: mở mọi thẻ, mua, mở rương, quay — không lỗi ----
  r = await p.evaluate(async () => {
    THEBAI.doc().ngoc = 2000; THEBAI.doc().vang = 50000; KT.luu();
    const w = (ms) => new Promise(r => setTimeout(r, ms));
    for (const t of ['shop', 'vq', 'nv', 'sk']) { KTUI.moTab(t); await w(80); }
    KTUI.moTab('shop'); document.querySelector('[data-act="kt-ru"][data-k="thuong"]').click(); await w(200); document.querySelector('.kt-mr').click(); await w(100);
    const tong = !!document.querySelector('.kt-mr-tong:not([hidden])');
    KTUI.dongPhu(); KTUI.moTab('vq'); document.querySelector('[data-act="kt-quay"][data-tra="1"]').click(); await w(4200);
    const thang = !!document.querySelector('.kt-nhan'); KTUI.dong();
    const dots = document.querySelectorAll('.kt-ben .kt-cham').length;
    return { tong, thang, dots, hien: !document.getElementById('kt') .hidden };
  });
  ok(r.tong && r.thang && r.dots === 4 && !r.hien, 'giao diện: mở rương → bỏ qua → bảng tổng; quay ngọc → bảng thưởng; 4 nút HOME có chấm', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang', errs.join(' | '));
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ kinh tế / cửa hàng XANH');
  process.exit(loi ? 1 : 0);
})();
