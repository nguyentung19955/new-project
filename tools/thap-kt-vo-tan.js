// ASTRAL ARSENAL — KIỂM VÔ TẬN (ENDLESS) nối tiếp tầng 100 Leo Tháp (thap/js/chedo-d.js, tuvan/che-do-d/THIET-KE.md §1)
//  ✓ người mới: ENDLESS khoá ("clear Tower Climb floor 100"); qua tầng 100 → mở
//  ✓ thắng tầng 100 → bảng hỏi (trận dừng, chưa kết thúc) · FINISH = qua tầng như cũ (thưởng lần đầu tầng 100, không khối Vô tận)
//  ✓ ENDLESS: đánh tiếp trên bàn cũ từ wave 71 (giữ máu ×3 của tầng 100); trùm wave 75/80 (mỗi 5), 92/94 (mỗi 2), mọi wave từ 101; đột biến từ 101; HUD "ENDLESS · BOSS IN n"
//  ✓ tất định: cùng hạt trận → cùng thành phần wave (không Math.random trong chedo-d.js)
//  ✓ hết tim → màn kết quả THẮNG + khối ENDLESS (wave, kỷ lục tuần/mọi thời đại) + mốc tuần wave 80 = 2 000 vàng (1 lần/tuần)
//  ✓ GAME MODE → ENDLESS: bảng luật + mốc + bảng xếp hạng ngoại tuyến (NOT CONNECTED + kỷ lục cá nhân); START = tầng 100, qua tầng tự vào Vô tận
//  ✓ bỏ cuộc trong menu tạm dừng khi đang Vô tận → vẫn có màn kết quả
//  Ảnh (SHOTS, mặc định /tmp/thap-vo-tan): 390×844 + 844×390, EN + VI.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-vo-tan.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-vo-tan';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const src = fs.readFileSync(path.join(__dirname, '../thap/js/chedo-d.js'), 'utf8').replace(/\/\/[^\n]*/g, '');
  ok(!/Math\.random/.test(src), 'chedo-d.js không gọi Math.random');
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const CHI = process.env.CHI; // CHI=390 → chỉ chạy 390 EN (máy quá tải)
  const mo = async (vp, lang, kyLuc) => {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.setDefaultTimeout(120000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); localStorage.setItem('tm_lang', lang); }, lang);
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof CDD !== 'undefined' && G.roster && G.roster.length, null, { timeout: 90000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 120000 }).catch(() => { });
    await sleep(800);
    await p.evaluate((kl) => { if (kl) { CD.st().thap.max = kl; KT.luu(true); } UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } HM.ve(); }, kyLuc);
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  // chạy mô phỏng tới wave `den` (quái chết ngay, tim giữ), dừng khi có bảng hỏi / kết thúc
  const toi = (p, den) => p.evaluate((den) => {
    const trum = []; let n = 0;
    while (!G.ketThuc && !G.dung && G.wave < den && n < 30 * 60 * 40) {
      const w0 = G.wave; capNhat(1 / 30); if (G.wave !== w0 && G.laTrum) trum.push(G.wave);
      G.ban[0].tim = 3; for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; }
      if (n % 60 === 0) try { FX.reset(); } catch (e) { } n++;
    }
    return { w: G.wave, trum, dung: G.dung, kt: !!G.ketThuc };
  }, den);
  const quaW70 = (p) => p.evaluate(() => { // nhảy nhanh tới cuối tầng 100 (wave 66–70)
    G.wave = 69; G.cho = 0.1; G.hang.length = 0; let n = 0;
    while (!G.ketThuc && !G.dung && !VOTAN.on() && n < 30 * 400) { capNhat(1 / 30); G.ban[0].tim = 3; for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } n++; }
    return { w: G.wave, on: VOTAN.on(), dung: G.dung, kt: !!G.ketThuc, hoi: !!document.querySelector('#cdd-hoi:not([hidden]) [data-act="cdd-hoi-vt"]') };
  });
  const vaoTang = async (p) => { await p.evaluate(() => { CD.vao('thap', 100); }); await p.waitForFunction(() => G.ban.length && G.che === "solo", null, { timeout: 120000 }).catch(async (e) => { console.log(await p.evaluate(() => JSON.stringify({ ban: G.ban.length, che: G.che, ui: UI.che, chon: UI.chon, ver: typeof TAI !== "undefined" && TAI.verMoi, cho: TAI.cho, doi: TAI.doi }))); throw e; }); await sleep(500); await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; for (let i = 0; i < 6; i++) trieu(G.ban[0]); }); };
  const ketqua = async (p) => { await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 60000 }); await sleep(700); return p.evaluate(() => ({ ten: document.getElementById('kq-ten').textContent, phu: document.getElementById('kq-phu').textContent, chi: document.getElementById('kq-chi').textContent, thang: document.getElementById('ketqua').classList.contains('thang') })); };

  // ---------- 390 EN: luồng chính ----------
  let { p, errs } = await mo({ width: 390, height: 844 }, 'en', 0);
  let r = await p.evaluate(() => ({ mo: TT.tnMo('vt'), chu: TT.tnChu('vt') }));
  ok(!r.mo && /floor 100/.test(r.chu), 'người mới: ENDLESS khoá — ' + r.chu, JSON.stringify(r));
  await p.evaluate(() => { CD.st().thap.max = 99; KT.luu(true); });
  ok(!(await p.evaluate(() => TT.tnMo('vt'))), 'tầng cao nhất 99 → ENDLESS còn khoá');
  await p.evaluate(() => HM.moChe()); await chup(p, '390-en-game-mode'); await p.evaluate(() => HM.dong(true));
  // FINISH
  await vaoTang(p); r = await quaW70(p);
  ok(r.w === 70 && r.dung && !r.kt && r.hoi, 'thắng tầng 100 → bảng hỏi FINISH/ENDLESS, trận dừng, chưa kết thúc', JSON.stringify(r));
  await chup(p, '390-en-hoi-70');
  const tt0 = await p.evaluate(() => CD.tt());
  await p.click('#cdd-hoi [data-act="cdd-hoi-xong"]'); let k = await ketqua(p);
  r = await p.evaluate((tt0) => ({ tt: CD.tt() - tt0, max: CD.st().thap.max, mo: TT.tnMo('vt') }), tt0);
  ok(k.thang && /FLOOR 100/.test(k.phu) && /5\/5/.test(k.chi) && !/ENDLESS/.test(k.chi) && r.tt === 5 && r.max === 100 && r.mo, 'FINISH → qua tầng 100 như cũ (+5 Tinh thể Đỏ lần đầu), không khối Vô tận; ENDLESS mở', JSON.stringify([k, r]));
  // ENDLESS
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await p.waitForFunction(() => G.ban.length && !G.ketThuc, null, { timeout: 120000 }); await sleep(400);
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; for (let i = 0; i < 6; i++) trieu(G.ban[0]); });
  r = await quaW70(p); ok(r.hoi, 'chơi lại tầng 100: lại hỏi');
  const v0 = await p.evaluate(() => KT.vang);
  await p.click('#cdd-hoi [data-act="cdd-hoi-vt"]');
  r = await p.evaluate(() => ({ on: VOTAN.on(), dung: G.dung, hoi: !!document.querySelector('#cdd-hoi:not([hidden])') }));
  ok(r.on && !r.dung && !r.hoi, 'ENDLESS → đánh tiếp (trận chạy, bảng hỏi đóng)', JSON.stringify(r));
  r = await p.evaluate(() => ({ hsQ: G.cd.hsQ, loai: G.cd.loai })); ok(r.hsQ === 3 && r.loai === 'thap', 'Vô tận giữ cấu hình tầng 100 (máu quái ×3)', JSON.stringify(r));
  r = await toi(p, 73); await sleep(300);
  const hud = await p.evaluate(() => document.getElementById('tb-trum-chu').textContent);
  ok(r.w === 73 && /ENDLESS · BOSS IN 2/.test(hud), 'wave 71+ chạy, HUD: ' + hud, JSON.stringify(r));
  await chup(p, '390-en-tran-vo-tan');
  r = await toi(p, 81);
  ok(!r.kt && r.trum.join() === '75,80', 'trùm ở wave 75, 80 (mỗi 5 wave sau 70)', JSON.stringify(r));
  r = await p.evaluate(() => ({ s: [91, 92, 93, 94, 100, 101, 102].map(w => VOTAN.coTrum(w) ? 1 : 0).join(''), d100: VOTAN.dot(100).length, d101: VOTAN.dot(101).length, d111: VOTAN.dot(111).length, d150: VOTAN.dot(150).length, hp: Math.round(mauWave(81) / mauWave(80) * 100) }));
  ok(r.s === '0101111' && r.d100 === 0 && r.d101 === 1 && r.d111 === 2 && r.d150 === 5 && r.hp === 108, 'lịch: 91–100 mỗi 2 wave, từ 101 mọi wave · đột biến 0/1/2/…/5 ở 100/101/111/150 · máu ×1,08/wave', JSON.stringify(r));
  // tất định: cùng hạt → cùng wave
  r = await p.evaluate(() => { const giu = { w: G.wave, h: G.hang.slice(), t: G.t }; const lay = () => { G.wave = 86; G.hang.length = 0; VOTAN.wave(); return G.hang.map(h => (h.trum || h.id) + '@' + (h.t - G.t).toFixed(2)).join(','); }; const a = lay(), b2 = lay(); G.wave = giu.w; G.hang = giu.h; return { a: a.slice(0, 80), same: a === b2, n: a.split(',').length }; });
  ok(r.same && r.n > 10, 'tất định: cùng hạt trận → wave 87 giống hệt (' + r.n + ' quái)', JSON.stringify(r));
  // hết tim → kết quả
  await p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, 'The core fell'); }); k = await ketqua(p);
  const s1 = await p.evaluate((v0) => ({ vt: CDD.st().vt, dv: KT.vang - v0 }), v0);
  ok(k.thang && /ENDLESS/.test(k.chi) && /81/.test(k.chi) && s1.vt.best === 81 && s1.vt.tBest === 81 && s1.vt.nhan[80] && s1.dv >= 2000, 'hết tim ở wave 81 → THẮNG tầng 100 + khối ENDLESS, kỷ lục 81, mốc tuần wave 80 = +2 000 vàng', JSON.stringify([k, s1]));
  await chup(p, '390-en-kq-vo-tan');
  // GAME MODE → ENDLESS: bảng + START → tự vào Vô tận; mốc tuần không lặp; bỏ cuộc
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(400);
  await p.evaluate(() => { HM.chonChe('vt'); HM.choi(); }); await sleep(900);
  r = await p.evaluate(() => { const q = document.querySelector('#tt-phu.cdd-vt'); return { hien: !!q && !q.hidden, txt: q ? q.textContent : '' }; });
  ok(r.hien && /FLOOR 100/.test(r.txt) && /NOT CONNECTED/.test(r.txt) && /WAVE 81/.test(r.txt) && /WAVE 80/.test(r.txt) && /WAVE 120/.test(r.txt), 'bảng ENDLESS: mốc 80–120 + bảng xếp hạng ngoại tuyến (NOT CONNECTED, WAVE 81 của mình)', r.txt.slice(0, 300));
  await chup(p, '390-en-bang-vo-tan');
  const v1 = await p.evaluate(() => KT.vang);
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-vt-vao"]').click()); await p.waitForFunction(() => G.ban.length && !G.ketThuc, null, { timeout: 120000 }); await sleep(400);
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; for (let i = 0; i < 6; i++) trieu(G.ban[0]); });
  r = await quaW70(p); const r2 = await toi(p, 82);
  ok(!r.hoi && r.on && r.w === 70 && r2.w === 82, 'START từ ENDLESS: tầng 100 → qua tầng tự vào Vô tận (không hỏi)', JSON.stringify([r, r2]));
  await p.evaluate(() => { document.querySelector('[data-act="dung"]').click(); }); await sleep(300);
  await p.evaluate(() => document.querySelector('#dung [data-act="bo"]').click()); k = await ketqua(p);
  const s2 = await p.evaluate((v1) => ({ best: CDD.st().vt.best, dv: KT.vang - v1 }), v1);
  ok(/ENDLESS/.test(k.chi) && s2.best === 82, 'bỏ cuộc khi đang Vô tận → màn kết quả có khối ENDLESS, kỷ lục 82', JSON.stringify([k, s2]));
  ok(!/WEEKLY MILESTONE/.test(k.chi), 'mốc wave 80 không phát lần 2 trong tuần', k.chi);
  ok(!errs.length, 'không lỗi trang (390 EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();

  // ---------- ảnh 844 EN, 390 VI, 844 VI ----------
  for (const [vp, lang, tag] of CHI ? [] : [[{ width: 844, height: 390 }, 'en', '844-en'], [{ width: 390, height: 844 }, 'vi', '390-vi'], [{ width: 844, height: 390 }, 'vi', '844-vi']]) {
    const o = await mo(vp, lang, 100);
    await o.p.evaluate(() => { HM.chonChe('vt'); HM.choi(); }); await sleep(900); await chup(o.p, tag + '-bang-vo-tan');
    await o.p.evaluate(() => TTUI.dong());
    await vaoTang(o.p); await quaW70(o.p); await chup(o.p, tag + '-hoi-70');
    await o.p.click('#cdd-hoi [data-act="cdd-hoi-vt"]'); await toi(o.p, 79); await sleep(500); await chup(o.p, tag + '-tran-vo-tan');
    await toi(o.p, 81); await o.p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, 'The core fell'); }); await ketqua(o.p); await chup(o.p, tag + '-kq-vo-tan');
    ok(!o.errs.length, 'không lỗi trang (' + tag + ')', o.errs.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Vô tận đạt'); process.exit(loi ? 1 : 0);
})();
