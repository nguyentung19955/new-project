// ASTRAL ARSENAL — KIỂM THỬ THÁCH NGẮN (thap/js/chedo-c.js, tuvan/che-do-c/THIET-KE.md §5)
//  ✓ người mới vừa xong hướng dẫn (cấp < 5, 10 ụ khởi đầu + quà): QUICK TRIALS mở; 6 thử thách, chỉ #1 chơi được, mở lần lượt
//  ✓ thử thách 1: wave 1–8, mana 100, thắng khi qua wave 8 + sạch sân → Rương Thường + 20 XP, mở #2, nút NEXT TRIAL
//  ✓ thử thách 2 có trùm ở wave 10 · #3 Horde (đông hơn) · #5 chỉ 1 tim · thắng lại: không thưởng · không ghi kỷ lục Solo
//  ✓ thời lượng thật ước tính 3–5 phút (số wave × ≤ 20 s + trùm)
//  Ảnh (SHOTS, mặc định /tmp/thap-thu-thach): 390×844 + 844×390, EN + VI — bảng thử thách, trong trận, kết quả.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-thu-thach.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-thu-thach';
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
    await p.evaluate(() => { UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } HM.ve(); });
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const hetTran = (p) => p.evaluate(() => { G.ban[0].tim = Math.max(G.ban[0].tim, 1); let n = 0, maxQ = 0; while (!G.ketThuc && n < 30 * 600) { capNhat(1 / 30); maxQ = Math.max(maxQ, G.quai.filter(e => !e.chet).length + G.hang.length); for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } if (n % 60 === 0) try { FX.reset(); } catch (e) { } n++; } return { thang: G.ketThuc && G.ketThuc.thang, wave: G.wave, t: Math.round(G.t) }; });
  const ketqua = async (p) => { await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 8000 }); await sleep(700); return p.evaluate(() => ({ kq: (document.querySelector('#ketqua .cd-kq') || {}).textContent || '', nut: document.querySelector('#ketqua [data-act="choilai"]').textContent, chi: document.getElementById('kq-chi').textContent })); };

  const { p, errs } = await mo({ width: 390, height: 844 }, 'en');
  let r = await p.evaluate(() => ({ cap: TT.cap(), mo: TT.tnMo('thu'), co: SH.dem().co }));
  ok(r.cap < 5 && r.mo && r.co <= 11, 'người mới vừa xong hướng dẫn (cấp < 5, ~10 ụ khởi đầu): QUICK TRIALS mở, Leo Tháp còn khoá', JSON.stringify(r));
  await p.evaluate(() => { HM.chonChe('thu'); HM.choi(); }); await sleep(600);
  r = await p.evaluate(() => { const q = document.querySelector('#tt-phu.cd-p'); return { hien: !!q && !q.hidden, mo: q ? [...q.querySelectorAll('.cd-th')].map(b => b.disabled ? 0 : 1).join('') : '', nut: q && q.querySelector('[data-act="cd-vao"]').textContent }; });
  ok(r.hien && r.mo === '100000' && /TRIAL 1/.test(r.nut), 'bảng: 6 thử thách, chỉ #1 mở, nút START · TRIAL 1', JSON.stringify(r));
  await chup(p, '390-en-bang-thu');
  r = await p.evaluate(() => CDC.thu.map((d, i) => { const c = CD.cauHinh('thu', i + 1); return (c.w1 - c.w0 + 1) * 20 + (c.trum ? 60 : 0); }));
  ok(r.every(s => s + 5 >= 100 && s <= 300), 'thời lượng tối đa mỗi thử thách (wave × 20 s + trùm ≤ 60 s) trong 1,7–5 phút: ' + r.join('/') + ' s', JSON.stringify(r));
  // ---- thử thách 1 ----
  const t0 = await p.evaluate(() => ({ vang: KT.vang, xp: TT.st().xp, best: localStorage.getItem('turret_best'), mo: KT.doc().ru.mo }));
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cd-vao"]').click());
  await p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(1200);
  r = await p.evaluate(() => ({ w: G.wave, mana: G.ban[0].mana, id: G.cd.loai + G.cd.id }));
  ok(r.w === 0 && r.mana === 100 && r.id === 'thu1', 'thử thách 1: bắt đầu wave 1, mana 100', JSON.stringify(r));
  await chup(p, '390-en-mo-dau-thu'); await p.evaluate(() => { try { VT.dong(); } catch (e) { } });
  await p.evaluate(() => { for (let i = 0; i < 4; i++) trieu(G.ban[0]); let n = 0; while (G.wave < 3 && n < 3000) { capNhat(1 / 30); n++; } }); await sleep(800);
  r = await p.evaluate(() => document.getElementById('tb-trum-chu').textContent);
  ok(/TRIAL 1 · 3\/8/.test(r), 'thanh trên: TRIAL 1 · 3/8', r);
  await chup(p, '390-en-tran-thu');
  r = await hetTran(p); const k1 = await ketqua(p);
  const r2 = await p.evaluate((t0) => ({ xp: TT.st().xp - t0.xp, ru: KT.doc().ru.mo - t0.mo, da: CD.st().thu.da[1], best: localStorage.getItem('turret_best') === t0.best, mo2: CD.thuMo(2) }), t0);
  ok(r.thang && r.wave === 8 && r2.xp === 20 && r2.ru === 1 && r2.da && r2.best && r2.mo2 && /OPEN/.test(k1.kq) && /NEXT TRIAL/.test(k1.nut) && /8\/8/.test(k1.chi), 'thắng #1 (wave 1–8): Rương Thường (OPEN) + 20 XP, mở #2, không ghi kỷ lục Solo, nút NEXT TRIAL', JSON.stringify([r, r2, k1]));
  await chup(p, '390-en-kq-thu');
  // ---- NEXT → #2 (trùm wave 10) ----
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await sleep(1200);
  r = await p.evaluate(() => ({ id: G.cd.id, w0: G.cd.w0, w1: G.cd.w1, trum: !!G.cd.trum }));
  ok(r.id === 2 && r.w0 === 6 && r.w1 === 10 && r.trum, 'NEXT TRIAL → #2: wave 6–10, trùm ở wave 10', JSON.stringify(r));
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } }); await hetTran(p); await ketqua(p);
  // ---- #3 Horde, #5 1 tim ----
  r = await p.evaluate(() => { const c3 = CD.cauHinh('thu', 3), base = Object.assign({}, c3, { n: 1 }); const r3 = rngHat(5), r3b = rngHat(5); return { horde: CD.dsQuai(10, r3, c3).length > CD.dsQuai(10, r3b, base).length, tim5: CD.cauHinh('thu', 5).tim, mo3: CD.thuMo(3), mo4: CD.thuMo(4) }; });
  ok(r.horde && r.tim5 === 1 && r.mo3 && !r.mo4, '#3 Horde đông hơn · #5 chỉ 1 tim · #3 mở, #4 còn khoá', JSON.stringify(r));
  // thắng lại #1: không thưởng
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(300);
  const v = await p.evaluate(() => KT.doc().ru.mo);
  await p.evaluate(() => CD.vao('thu', 1)); await p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(600); await p.evaluate(() => { try { VT.dong(); } catch (e) { } });
  await hetTran(p); const k2 = await ketqua(p);
  r = await p.evaluate((v) => KT.doc().ru.mo - v, v);
  ok(r === 0 && /ALREADY CLEARED/.test(k2.kq), 'thắng lại #1: không thưởng', JSON.stringify([r, k2]));
  ok(!errs.length, 'không lỗi trang (390 EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();
  for (const [vp, lang, tag] of [[{ width: 844, height: 390 }, 'en', '844-en'], [{ width: 390, height: 844 }, 'vi', '390-vi'], [{ width: 844, height: 390 }, 'vi', '844-vi']]) {
    const o = await mo(vp, lang);
    await o.p.evaluate(() => { CD.st().thu.da = { 1: 1, 2: 1, 3: 1 }; KT.luu(true); HM.chonChe('thu'); HM.choi(); }); await sleep(600); await chup(o.p, tag + '-bang-thu');
    await o.p.evaluate(() => CD.vao('thu', 4)); await o.p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(600);
    await o.p.evaluate(() => { try { VT.dong(); } catch (e) { } G.ban[0].tim = 99; for (let i = 0; i < 8; i++) trieu(G.ban[0]); let n = 0; while (G.wave < 12 && n < 3000) { capNhat(1 / 30); n++; } }); await sleep(800); await chup(o.p, tag + '-tran-thu');
    await hetTran(o.p); await ketqua(o.p); await chup(o.p, tag + '-kq-thu');
    ok(!o.errs.length, 'không lỗi trang (' + tag + ')', o.errs.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Thử thách ngắn đạt'); process.exit(loi ? 1 : 0);
})();
