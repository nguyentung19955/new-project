// ASTRAL ARSENAL — KIỂM TINH THỂ ĐỎ + ẤN ĐỎ (thap/js/chedo-c.js, tuvan/che-do-c/THIET-KE.md §4)
//  ✓ hàng ẤN ĐỎ trong SHOP → LÒ RÈN: khoá tới điều kiện Đỏ (cấp 12 + kỷ lục wave 30), hiện số tinh thể x/15
//  ✓ thiếu tinh thể / thiếu vàng / chưa có Đỏ nào trong bể → không ấn được · đủ → bảng chọn CHỈ các Đỏ đã mở/đã có → +1 bản, −15 tinh thể, −50 000 vàng
//  ✓ gộp hồ sơ Firebase: tinh thể lấy lớn nhất · nguồn tinh thể: Tháp 50/100, Săn Trùm (đủ 12 trùm bậc 10, Trùm tuần bậc 9)
//  Ảnh (SHOTS, mặc định /tmp/thap-an-do): 390×844 + 844×390, EN + VI — lò rèn + bảng chọn Ấn Đỏ.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-an-do.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-an-do';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const mo = async (vp, lang) => {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.setDefaultTimeout(120000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); localStorage.setItem('tm_lang', lang); }, lang);
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof CD !== 'undefined' && G.roster && G.roster.length, null, { timeout: 90000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(800);
    await p.evaluate(() => { try { TTUI.dong(); } catch (e) { } });
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const loRen = (p) => p.evaluate(async () => { KTUI.moTab('shop'); await new Promise(r => setTimeout(r, 300)); const e = document.querySelector('#kt .cd-ad'); if (e) e.scrollIntoView({ block: 'center' }); });
  const hang = (p) => p.evaluate(() => { const e = document.querySelector('#kt .cd-ad'); if (!e) return null; const nut = e.querySelector('[data-act="cd-ad"]'); return { khoa: e.classList.contains('tt-khoa-h'), nut: !!nut, bat: !!nut && !nut.disabled, chu: e.textContent }; });

  const { p, errs } = await mo({ width: 390, height: 844 }, 'en');
  // ---- 1. khoá theo điều kiện Đỏ ----
  await p.evaluate(() => { const t = TT.st(); t.xp = TT.xpTong(10); TT.xetCap(); t.bao = []; KT.luu(true); });
  await loRen(p); let r = await hang(p);
  ok(r && r.khoa && !r.nut, 'cấp 10: hàng RED SEAL có trong LÒ RÈN nhưng khoá (điều kiện Đỏ)', JSON.stringify(r));
  await p.evaluate(() => { KTUI.dong(); const t = TT.st(); t.xp = TT.xpTong(12); KT.doc().tk.wave = 30; TT.xetCap(); t.bao = []; KT.luu(true); });
  await loRen(p); r = await hang(p);
  ok(r && !r.khoa && r.nut && !r.bat && /0\/15/.test(r.chu), 'cấp 12 + wave 30: mở, 0/15 tinh thể → nút tắt', JSON.stringify(r));
  // ---- 2. đủ tinh thể, thiếu vàng / đủ ----
  r = await p.evaluate(() => { CD.mh().tt = 15; const v = KT.vang; KT.cong('vang', -v, 'other'); KT.cong('vang', 40000, 'other'); KT.luu(true); KTUI.ve(); const e = document.querySelector('#kt .cd-ad [data-act="cd-ad"]'); return { bat: !!e && !e.disabled, tt: CD.anDoTt() }; });
  ok(!r.bat && r.tt.duTt && !r.tt.duVang, '15 tinh thể nhưng 40 000 vàng: chưa ấn được', JSON.stringify(r));
  await p.evaluate(() => { KT.cong('vang', 20000, 'other'); KT.luu(true); KTUI.ve(); const e = document.querySelector('#kt .cd-ad'); if (e) e.scrollIntoView({ block: 'center' }); });
  r = await hang(p); ok(r && r.bat && /15\/15/.test(r.chu), 'đủ 15 tinh thể + 60 000 vàng: nút SEAL sáng', JSON.stringify(r));
  await chup(p, '390-en-lo-ren');
  await p.evaluate(() => document.querySelector('#kt .cd-ad [data-act="cd-ad"]').click()); await sleep(500);
  r = await p.evaluate(() => { const ds = [...document.querySelectorAll('#kt-phu [data-act="cd-adc"]')].map(b => b.dataset.id); return { ds, pool: KT.dsPool('do'), dung: ds.every(id => THEBAI.bac(id) === 'do' && (SH.trongPool(id) || SH.co(id))) }; });
  ok(r.ds.length >= 1 && r.dung && r.ds.length === r.pool.length, 'bảng chọn: chỉ các Đỏ đã mở/đã có (' + r.ds.join(',') + ')', JSON.stringify(r));
  await chup(p, '390-en-chon-an-do');
  const id = r.ds[0];
  r = await p.evaluate((id) => { const n0 = THEBAI.the(id).n, v0 = KT.vang; document.querySelector('#kt-phu [data-act="cd-adc"][data-id="' + id + '"]').click(); return { n: THEBAI.the(id).n - n0, v: v0 - KT.vang, tt: CD.tt(), co: SH.co(id), lai: CD.anDo(id) }; }, id);
  ok(r.n === 1 && r.v === 50000 && r.tt === 0 && r.co && r.lai === null, 'ấn: +1 bản Đỏ đã chọn, −50 000 vàng, −15 tinh thể; hết tinh thể thì không ấn lại được', JSON.stringify(r));
  await sleep(600); await chup(p, '390-en-an-do-nhan');
  // ---- 3. chưa có Đỏ trong bể ----
  r = await p.evaluate(() => { const g = KT.dsPool; KT.dsPool = (b) => (b === 'do' ? [] : g.call(KT, b)); CD.mh().tt = 20; KT.cong('vang', 60000, 'other'); const t = CD.anDoTt(); const x = CD.anDo('lophanung'); KT.dsPool = g; return { duoc: t.duoc, x }; });
  ok(!r.duoc && r.x === null, 'bể chưa có Đỏ: không ấn được', JSON.stringify(r));
  // ---- 4. gộp hồ sơ ----
  r = await p.evaluate(() => { CD.mh().tt = 4; KT.luu(true); const o = JSON.parse(KT.goi()); o.kt.mh = Object.assign({}, o.kt.mh, { tt: 9 }); o.kt.cd = { thap: { max: 7, nhan: { 7: 1 } }, san: { da: { 'janus:1': 1 } }, thu: { da: { 1: 1 } } }; KT.gop(o); return { tt: CD.tt(), max: CD.st().thap.max, san: !!CD.st().san.da['janus:1'], thu: !!CD.st().thu.da[1] }; });
  ok(r.tt === 9 && r.max === 7 && r.san && r.thu, 'gộp hồ sơ Firebase: tinh thể lấy lớn nhất, cờ Tháp / Săn Trùm / Thử thách OR', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (390 EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();
  // ---- 5. ảnh 844 + VI ----
  for (const [vp, lang, tag] of [[{ width: 844, height: 390 }, 'en', '844-en'], [{ width: 390, height: 844 }, 'vi', '390-vi'], [{ width: 844, height: 390 }, 'vi', '844-vi']]) {
    const o = await mo(vp, lang);
    await o.p.evaluate(() => { const t = TT.st(); t.xp = TT.xpTong(16); KT.doc().tk.wave = 30; TT.xetCap(); t.bao = []; CD.mh().tt = 16; KT.cong('vang', 80000, 'other'); KT.luu(true); });
    await loRen(o.p); await chup(o.p, tag + '-lo-ren');
    await o.p.evaluate(() => document.querySelector('#kt .cd-ad [data-act="cd-ad"]').click()); await sleep(500); await chup(o.p, tag + '-chon-an-do');
    ok(!o.errs.length, 'không lỗi trang (' + tag + ')', o.errs.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Ấn Đỏ đạt'); process.exit(loi ? 1 : 0);
})();
