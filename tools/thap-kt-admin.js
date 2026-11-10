// ASTRAL ARSENAL — KIỂM QUYỀN ADMIN (thap/js/admin.js + các chỗ kiểm khoá `|| ADMIN.la()`) — docs/demo-hop-tuong/tuvan/admin/ADMIN.md
//  ✓ giả lập (stub) tài khoản Google đúng email (đã xác minh) → mọi khoá mở: tính năng (TTC.tn), Leo Tháp 100 tầng, Thử thách, Săn Trùm mọi trùm/bậc,
//    Vô tận, thử thách tuần, online, chỉ huy; sở hữu ảo đủ 96 ụ (cả Đỏ), lưới bộ bài không thẻ khoá, chọn được Đỏ; nhãn ADMIN ở HOME + hồ sơ
//  ✓ KHÔNG ghi đè dữ liệu thật: vàng / ngọc / bản sao / sh.co giữ nguyên; tải lại (ngoại tuyến) vẫn admin nhờ cache turret_admin
//  ✓ đăng xuất (về khách) → như cũ + xoá cache · email khác / email chưa xác minh / khách → không admin
//  Ảnh (SHOTS, mặc định /tmp/thap-admin): 393×852 — HOME + bộ bài admin (EN + VI).
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-admin.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-admin';
const EMAIL = 'ly230595@gmail.com';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const cho = async () => {
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof SH !== 'undefined' && typeof ADMIN !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(800);
  };
  const vao = async (ls, q) => {
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((ls) => { localStorage.clear(); for (const k in ls) localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])); }, ls || {});
    await p.goto(BASE + '?notut=1' + (q || ''), { waitUntil: 'load' });
    await cho();
  };
  const chup = async (ten) => { await sleep(500); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  // tài khoản giả: phát qua NET._baoTK như onAuthStateChanged thật (đường nghe NET.khiDoiTK của admin.js)
  const dn = (u) => p.evaluate((u) => { NET._baoTK(u); return ADMIN.la(); }, u);
  // ảnh chụp dữ liệu THẬT (để so: admin không ghi đè)
  const that = () => p.evaluate(() => JSON.stringify({ vang: THEBAI.doc().vang, ngoc: THEBAI.doc().ngoc | 0, c: THEBAI.doc().c, co: SH.st().co, xp: TT.st().xp, mv: KT.doc().mvMo || {} }));
  // trạng thái khoá
  const khoa = () => p.evaluate(() => {
    const o = {}, d = SH.dem(); o.dem = d.co + '/' + d.mo + '/' + d.tong;
    o.uKhoa = SH.dsCo().filter(id => TT.khoa(id)).length;
    o.tnKhoa = Object.keys(TTC.tn).filter(k => !TT.tnMo(k));
    o.bac = TIER_LIST.filter(bb => !TT.bacMo(bb));
    o.nvt = TT.nvtMo();
    o.thap = CD.thapMo(CDC.thap.so); o.thu = CD.thuMo(CDC.thu.length);
    o.trum = CD.trumHa().length + '/' + CD.dsTrum().length; o.sanBac = CD.dsTrum().every(id => CD.bacMo(id) === CDC.san.bac);
    o.mv = Object.keys(MAVUONG).filter(id => !mvCo(id));
    o.doPool = SH.pool('do').length;
    return o;
  });
  const LS0 = { turret_hd: { xong: true }, turret_bo: { chon: ['tia', 'lien', 'bang', 'set', 'laser'], mv: 'hero', che: 'solo' } };

  // ---- 1. khách (mặc định): như cũ ----
  await vao(LS0);
  let k0 = await khoa();
  ok(k0.dem.startsWith('1') && k0.uKhoa > 70 && k0.tnKhoa.length > 5 && !k0.thap && k0.trum.startsWith('0/') && k0.mv.length > 0 && !(await p.evaluate(() => ADMIN.la())),
    'khách: ụ / tính năng / chế độ / chỉ huy vẫn khoá như cũ', JSON.stringify(k0));
  const truoc = await that();

  // ---- 2. email khác / chưa xác minh / khách → không admin ----
  r = [];
  r.push(await dn({ uid: 'g1', anon: false, email: 'nguoi.khac@gmail.com', ev: true }));
  r.push(await dn({ uid: 'g2', anon: false, email: EMAIL, ev: false }));
  r.push(await dn({ uid: 'g3', anon: true, email: EMAIL, ev: true }));
  r.push(await dn({ uid: 'g4', anon: false, email: 'x' + EMAIL, ev: true }));
  ok(r.every(x => x === false) && (await p.evaluate(() => localStorage.getItem('turret_admin'))) === null, 'email khác / chưa xác minh / khách ẩn danh → KHÔNG admin, không cache', JSON.stringify(r));

  // ---- 3. admin: mọi khoá mở, sở hữu ảo 96 ụ ----
  var r = await dn({ uid: 'adm1', anon: false, email: 'Ly230595@Gmail.com', ev: true });
  await sleep(500);
  let k1 = await khoa();
  ok(r && k1.dem === '96/96/96' && k1.uKhoa === 0 && k1.doPool > 0, 'admin: sở hữu ảo đủ 96 ụ (cả Đỏ), không ụ nào khoá', JSON.stringify(k1));
  ok(!k1.tnKhoa.length && !k1.bac.length && k1.nvt && k1.thap && k1.thu && k1.trum.split('/')[0] === k1.trum.split('/')[1] && k1.sanBac && !k1.mv.length,
    'admin: mọi tính năng (shop, vòng quay, rương, lò rèn, Ấn, online, Săn Trùm, Vô tận, thử thách tuần…) + Leo Tháp 100 + Thử thách + mọi trùm/bậc + chỉ huy mở', JSON.stringify(k1));
  r = await p.evaluate(() => {
    const o = {}; HM.di('dk'); UI.veChon(); TTUI.capLuoi();
    o.theKhoa = document.querySelectorAll('#chon-luoi .c.khoa, #chon-luoi .c.sh-khoa, #chon-luoi .c.sh-chua').length;
    o.the = document.querySelectorAll('#chon-luoi .c[data-id]').length;
    UI.chon = ['tia', 'lien', 'bang', 'set']; UI.veBoChon(); UI.chonU('lophanung'); o.do = UI.chon.includes('lophanung');
    o.loi = DK.loi(['tia'], 'blackhole');
    UI.chon = ['tia', 'lien', 'bang', 'set', 'laser']; UI.veBoChon(); HM.luuBo(); HM.di('hm');
    o.nhan = !!document.querySelector('#tk-chip .adm-nhan');
    o.cheKhoa = Object.keys(HM.CHE).filter(k => TTC.tn[k] && !TT.tnMo(k));
    return o;
  });
  ok(r.theKhoa === 0 && r.the >= 96 && r.do && r.loi === '' && !r.cheKhoa.length && r.nhan, 'admin: lưới bộ bài không thẻ khoá/chưa có, chọn được Đỏ, mọi chế độ HOME mở, nhãn ADMIN trên chip phi công', JSON.stringify(r));
  await chup('393-en-admin-home');
  await p.evaluate(() => { HM.di('dk'); const c = document.querySelector('#chon-luoi .c[data-id="lophanung"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-en-admin-bobai');
  await p.evaluate(() => { HM.di('hm'); TK.moBang(); }); await sleep(400);
  r = await p.evaluate(() => !!document.querySelector('#tk-bang .adm-nhan'));
  ok(r, 'admin: nhãn ADMIN trong hồ sơ phi công');
  await chup('393-en-admin-hoso');
  await p.evaluate(() => TK.dongBang());
  ok((await that()) === truoc, 'admin: KHÔNG ghi đè dữ liệu thật (vàng, ngọc, bản sao, sh.co, XP, chỉ huy)');

  // ---- 4. tải lại (Firebase không báo tài khoản: như ngoại tuyến) → cache vẫn admin ----
  await p.reload({ waitUntil: 'load' }); await cho();
  r = await p.evaluate(() => ({ la: ADMIN.la(), dem: SH.dem().co, nhan: !!document.querySelector('#tk-chip .adm-nhan'), c: localStorage.getItem('turret_admin') }));
  ok(r.la && r.dem === 96 && r.nhan && /adm1/.test(r.c) && !r.c.includes('@'), 'tải lại / ngoại tuyến: vẫn admin nhờ cache turret_admin (không lưu email)', JSON.stringify(r));

  // ---- 5. đăng xuất → về khách: như cũ ----
  r = await dn({ uid: 'khach2', anon: true, email: '' });
  await sleep(400);
  const k2 = await khoa();
  r = { la: r, c: await p.evaluate(() => localStorage.getItem('turret_admin')), nhan: await p.evaluate(() => !!document.querySelector('.adm-nhan')) };
  ok(!r.la && r.c === null && !r.nhan && k2.dem === k0.dem && k2.uKhoa === k0.uKhoa && JSON.stringify(k2.tnKhoa) === JSON.stringify(k0.tnKhoa) && k2.thap === k0.thap && k2.trum === k0.trum,
    'đăng xuất: hết admin, xoá cache, khoá/sở hữu về đúng như cũ', JSON.stringify([r, k2]));
  ok((await that()) === truoc, 'đăng xuất: dữ liệu thật y nguyên');
  // đổi sang tài khoản Google khác → cũng xoá
  await dn({ uid: 'adm1', anon: false, email: EMAIL, ev: true }); r = await dn({ uid: 'g9', anon: false, email: 'khac@gmail.com', ev: true });
  ok(!r && (await p.evaluate(() => localStorage.getItem('turret_admin'))) === null, 'đổi sang tài khoản Google khác → hết admin, xoá cache');

  // ---- 6. ảnh tiếng Việt ----
  await vao(LS0, '&lang=vi');
  await dn({ uid: 'adm1', anon: false, email: EMAIL, ev: true }); await sleep(500);
  await p.evaluate(() => HM.ve()); await chup('393-vi-admin-home');
  await p.evaluate(() => { HM.di('dk'); const c = document.querySelector('#chon-luoi .c[data-id="lophanung"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-vi-admin-bobai');

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(loi ? '✗ admin: ' + loi + ' lỗi' : '✓ quyền ADMIN XANH');
  process.exit(loi ? 1 : 0);
})();
