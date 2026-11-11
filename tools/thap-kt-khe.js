// ASTRAL ARSENAL — KIỂM KHE RƯƠNG kiểu DCDW (12/11, thap/js/khe.js + chedo-dd.js)
//  ✓ thắng PVP trúng túi thắng → Rương Trận vào khe (không phát thẻ ngay), vàng trận vẫn phát · thua / trượt: không vào khe · CO-OP: mở ngay như cũ
//  ✓ 4 khe; đầy → −1 ("CHEST SLOTS FULL") · mỗi lúc 1 rương đếm (15 phút, giờ máy) · mở xong: thẻ phát đúng 1 lần, vàng không đổi, rương sau tự đếm
//  ✓ mở ngay bằng ngọc: ⌈phút còn lại / 3⌉ (≥ 1); thiếu ngọc không mở · lưu turret_kt.khe · HOME hiện 4 ô
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-khe.js [BASE] [--anh thư-mục]
'use strict';
const { chromium } = require('playwright');
const BASE = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null) || process.env.BASE || 'http://localhost:8765/thap/';
const iA = process.argv.indexOf('--anh'), ANH = iA > 0 ? process.argv[iA + 1] : null;
let loi = 0; const ok = (c, t) => { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) loi++; };
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/\.(mp3|ogg|wav|m4a|mp4|webm)(\?.*)?$/i, r => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await p.goto(BASE + 'index.html?notut=1&net=0', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length && typeof KHE !== 'undefined' && typeof CUP !== 'undefined' && typeof HM !== 'undefined', null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const o = {}; HD.moKhoa = () => true; UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc'];
    const tong = () => Object.values(THEBAI.doc().c).reduce((a, x) => a + (x.n | 0), 0);
    let hT = 1, hK = 1; while (!CUP.roi(hT)) hT++; while (CUP.roi(hK)) hK++;
    const thu = (che, thang, hat) => { G.hat = hat; G.wave = 12; G.dd = null; const m = { che, deck: UI.chon.slice(), mv: 'hero', trum: 0 }; const t = THEBAI.thuong({ thang, wave: 12 }, m); return { the: t.the.length, vang: t.vang, khe: m._khe }; };
    const n0 = tong(); let x = thu('pvp', true, hT); o.thang = x; o.theNgay = tong() - n0; o.dem1 = KHE.dem();
    x = thu('pvp', true, hK); o.truot = x.khe === undefined && KHE.dem() === 1; x = thu('pvp', false, hT); o.thua = x.khe === undefined && KHE.dem() === 1;
    x = thu('coop', false, hK); o.coop = x.the > 0 && KHE.dem() === 1;
    for (let i = 0; i < 3; i++) thu('pvp', true, hT); o.dem4 = KHE.dem(); x = thu('pvp', true, hT); o.day = x.khe; o.dayVang = x.vang;
    const s = KHE.st().o; o.dangDem = s.filter(y => y.at > 0).length; o.luu = JSON.parse(localStorage.getItem('turret_kt')).khe.o.length;
    // chưa xong: không mở khi không trả ngọc; giá theo thời gian còn lại
    o.moSom = KHE.mo(0, false); o.gia0 = KHE.gia(s[0]); o.gia1 = KHE.gia(s[1]);
    THEBAI.doc().ngoc = 0; o.thieu = KHE.mo(0, true);
    // đồng hồ giờ máy: lùi mốc bắt đầu 14 phút → còn 1 phút → giá 1; lùi 15 phút → xong
    s[0].at = Date.now() - 14 * 60000; o.gia14 = KHE.gia(s[0]); o.san14 = KHE.san(s[0]);
    s[0].at = Date.now() - 15 * 60000 - 5; o.san = KHE.san(s[0]);
    const v0 = KT.vang, n1 = tong(); const the = KHE.mo(0, false); o.moThe = the && the.length; o.themThe = tong() - n1; o.vangMo = KT.vang - v0; o.dem3 = KHE.dem();
    o.lai = KHE.mo(0, false); o.keTiep = KHE.st().o.filter(y => y && y.at > 0).length;
    // mở ngay bằng ngọc
    THEBAI.doc().ngoc = 50; const i1 = KHE.st().o.findIndex(y => y && y.at > 0); const g = KHE.gia(KHE.st().o[i1]); const n2 = tong(); const t2 = KHE.mo(i1, true);
    o.ngoc = { g, con: KT.ngoc, the: t2 && t2.length, them: tong() - n2, dem: KHE.dem() };
    HM.veHome(); o.o = document.querySelectorAll('#khe .khe-o').length; o.trong = document.querySelectorAll('#khe .khe-o.trong').length;
    return o;
  });
  ok(r.thang.the === 0 && r.thang.vang > 0 && r.thang.khe === 0 && r.theNgay === 0 && r.dem1 === 1, 'thắng PVP trúng túi: vàng trận phát, rương vào khe 1, KHÔNG phát thẻ ngay ' + JSON.stringify(r.thang));
  ok(r.truot && r.thua, 'thắng trượt túi / thua: không vào khe');
  ok(r.coop, 'CO-OP: Rương Trận mở ngay như cũ, không vào khe');
  ok(r.dem4 === 4 && r.day === -1 && r.dayVang > 0, 'đủ 4 khe; rương thứ 5 không rơi (−1 → "CHEST SLOTS FULL"), vàng trận vẫn có');
  ok(r.dangDem === 1 && r.luu === 4, 'mỗi lúc chỉ 1 rương đếm; lưu turret_kt.khe.o (4 ô)');
  ok(r.moSom === null && r.gia0 === 5 && r.gia1 === 5 && r.thieu === null, 'chưa xong: không mở chùa; giá đủ 15 phút = 5 ngọc; thiếu ngọc không mở ' + JSON.stringify([r.gia0, r.gia1]));
  ok(r.gia14 === 1 && !r.san14 && r.san, 'giờ máy: còn 1 phút = 1 ngọc; đủ 15 phút = sẵn sàng');
  ok(r.moThe > 0 && r.themThe > 0 && r.vangMo === 0 && r.dem3 === 3 && r.lai === null && r.keTiep === 1, 'mở rương xong: có thẻ, vàng không đổi, khe trống lại, mở lại = không, rương sau tự đếm ' + JSON.stringify([r.moThe, r.themThe, r.vangMo]));
  ok(r.ngoc.g === 5 && r.ngoc.con === 45 && r.ngoc.the > 0 && r.ngoc.them > 0 && r.ngoc.dem === 2, 'mở ngay bằng ngọc: trừ đúng 5 ngọc, phát thẻ ' + JSON.stringify(r.ngoc));
  ok(r.o === 4 && r.trong === 2, 'HOME hiện 4 khe (2 trống) ' + JSON.stringify([r.o, r.trong]));
  if (ANH) {
    await p.evaluate(() => { const s = KHE.st().o; s.forEach(y => { if (y && y.at > 0) y.at = Date.now() - 15 * 60000 - 5; }); KT.luu(); const e = document.getElementById('khe'); if (e) e._k = ''; HM.veHome(); });
    await p.evaluate(() => { G.hat = 1; while (!CUP.roi(G.hat)) G.hat++; G.wave = 12; THEBAI.thuong({ thang: true, wave: 12 }, { che: 'pvp', deck: UI.chon.slice(), trum: 0 }); KHE.st().o.forEach((y, i) => { if (y && !(y.at > 0) ) { } }); const e = document.getElementById('khe'); e._k = ''; KHEUI.ve(); });
    await p.waitForTimeout(400); await p.screenshot({ path: ANH + '/khe-home.jpg', quality: 80, type: 'jpeg' });
    const cho = await p.$('#khe .khe-o:not(.san):not(.trong)'); if (cho) { await cho.click(); await p.waitForTimeout(500); await p.screenshot({ path: ANH + '/khe-ngoc.jpg', quality: 80, type: 'jpeg' }); await p.evaluate(() => TTUI.dong()); }
    const san = await p.$('#khe .khe-o.san'); if (san) { await san.click(); await p.waitForTimeout(2500); await p.screenshot({ path: ANH + '/khe-mo.jpg', quality: 80, type: 'jpeg' }); }
  }
  ok(!errs.length, 'không lỗi trang ' + errs.join(' | '));
  await b.close();
  console.log(loi ? '\nLỖI: ' + loi : '\nĐẠT');
  process.exit(loi ? 1 : 0);
})();
