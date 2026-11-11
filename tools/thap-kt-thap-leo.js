// ASTRAL ARSENAL — KIỂM LEO THÁP (thap/js/chedo-c.js, tuvan/che-do-c/THIET-KE.md §1–§2)
//  ✓ 10/11 bỏ Solo: Leo Tháp mở ngay sau hướng dẫn (cấp 1), đứng đầu GAME MODE, không còn SOLO · chọn TOWER CLIMB = mở bảng tầng: tầng 2 khoá tới khi thắng tầng 1
//  ✓ trận tầng t: bắt đầu wave W_t = 5 + ⌊0,62(t−1)⌋, mana = CDC.mana(W_t), 5 wave, thắng khi qua wave cuối + sạch sân (chạy mô phỏng thật)
//  ✓ tất định: cùng tầng → cùng danh sách quái mỗi wave (không Math.random)
//  ✓ thắng lần đầu: vàng 50+10t, XP 5+⌊t/5⌋, mở tầng kế + Rương Trận nhỏ (60+t vàng) + XP trận + điểm sự kiện · thắng lại: chỉ Rương Trận nhỏ · không ghi kỷ lục Solo / wave
//  ✓ tầng 10: Rương Vàng (nút OPEN lật thẻ, thẻ trong bể rơi) · tầng 50: +3 Tinh thể Đỏ · tầng trùm có trùm ở wave cuối · NEXT FLOOR vào đúng tầng kế
//  Ảnh (SHOTS, mặc định /tmp/thap-thap-leo): 390×844 + 844×390, EN + VI — bảng GAME MODE, bảng tầng, trong trận, kết quả, mở rương.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-thap-leo.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-thap-leo';
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
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof CD !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(800);
    await p.evaluate(() => { UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } HM.ve(); });
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  // đi hết trận: mô phỏng nhanh, quái chết ngay khi vào sân (kiểm luật thắng/đếm wave, không kiểm độ khó)
  const chayHet = (p) => p.evaluate(() => {
    G.ban[0].tim = 99; let n = 0;
    while (!G.ketThuc && n < 60 * 400) { capNhat(1 / 30); for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } if (n % 60 === 0) { try { FX.reset(); } catch (e) { } } n++; } // bỏ quái im lặng (không VFX dồn ứ khi chạy nhanh)
    return { ket: G.ketThuc && G.ketThuc.thang, wave: G.wave, n };
  });

  const { p, errs } = await mo({ width: 390, height: 844 }, 'en');
  // ---- 1. khoá ----
  let r = await p.evaluate(() => ({ cap: TT.cap(), mo: TT.tnMo('thap'), thu: TT.tnMo('thu'), che: HM.che }));
  ok(r.cap < 5 && r.mo && r.thu && r.che === 'thap', '10/11 bỏ Solo: người mới (cấp 1, xong hướng dẫn) — Leo Tháp + Thử thách ngắn mở, HOME mặc định TOWER CLIMB', JSON.stringify(r));
  await p.evaluate(() => HM.moChe()); await sleep(500);
  r = await p.evaluate(() => { const ds = [...document.querySelectorAll('#hm-tam .hm-chec')], e = document.querySelector('#hm-tam .hm-chec[data-che="thap"]'); return { dau: ds[0] && ds[0].dataset.che, solo: ds.some(x => x.dataset.che === 'solo'), khoa: e && e.classList.contains('tt-khoa-tn') }; });
  ok(r.dau === 'thap' && !r.solo && !r.khoa, 'GAME MODE: TOWER CLIMB đứng đầu, mở, không còn SOLO', JSON.stringify(r));
  // ---- 2. chọn TOWER CLIMB = mở bảng tầng ----
  await sleep(100); await chup(p, '390-en-che');
  await p.evaluate(() => { HM.chonChe('thap'); }); await sleep(400);
  r = await p.evaluate(() => ({ che: HM.che, ten: document.getElementById('hm-che-ten').textContent, phu: document.getElementById('hm-choi-phu').textContent, uiche: UI.che }));
  ok(r.che === 'thap' && r.ten === 'TOWER CLIMB' && /Floor 1/.test(r.phu) && r.uiche !== 'thap', 'chọn TOWER CLIMB, HOME hiện "Floor 1 / 100", UI.che vẫn chế độ bàn thường', JSON.stringify(r));
  r = await p.evaluate(() => { const q = document.querySelector('#tt-phu.cd-p'); return { hien: !!q && !q.hidden, o: q ? q.querySelectorAll('.cd-o').length : 0, khoa2: q && q.querySelector('.cd-o[data-id="2"]').disabled, nut: q && q.querySelector('[data-act="cd-vao"]').textContent }; });
  ok(r.hien && r.o === 10 && r.khoa2 && /FLOOR 1/.test(r.nut), 'GAME MODE → TOWER CLIMB → bảng tầng: 10 ô chương 1, tầng 2 khoá, nút CLIMB · FLOOR 1', JSON.stringify(r));
  await chup(p, '390-en-bang-thap');
  // ---- 3. tất định + tham số ----
  r = await p.evaluate(() => {
    const c = CD.cauHinh('thap', 37), a = [], bb = [];
    for (let w = c.w0; w < c.w1; w++) { a.push(CD.dsQuai(w, rngHat((c.hat * 2654435761 + w * 40503) | 0), c).join()); bb.push(CD.dsQuai(w, rngHat((c.hat * 2654435761 + w * 40503) | 0), CD.cauHinh('thap', 37)).join()); }
    const src = String(CD.wave) + String(CD.dsQuai) + String(CD.kiem);
    return { w: [1, 50, 100].map(t => CDC.thap.w(t)).join(), m: CDC.mana(5), giong: a.join('|') === bb.join('|'), rand: /Math\.random/.test(src), tr10: CD.cauHinh('thap', 10).trum, tr9: CD.cauHinh('thap', 9).trum, dot: CD.cauHinh('thap', 15).dot.join() };
  });
  ok(r.w === '1,35,66' && r.m === 400 && r.giong && !r.rand && r.tr10 && !r.tr9 && r.dot === 'DONG', 'tầng: wave đầu 1/35/66 (11/11: tầng 1–11 từ wave 1–11), mana tầng 1 = 400, cùng tầng → cùng quái, không Math.random, tầng 10 có trùm, chương 2 = Horde', JSON.stringify(r));
  // ---- 4. vào tầng 1 + chơi hết ----
  const truoc = await p.evaluate(() => ({ vang: KT.vang, xp: TT.st().xp, best: localStorage.getItem('turret_best'), sw: MH.st().sw, tk: KT.doc().tk.wave, sk: KT.sk().diem }));
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cd-vao"]').click());
  await p.waitForFunction(() => G.ban.length && G.cd && !document.getElementById('top').hidden, null, { timeout: 30000 });
  await sleep(1500);
  r = await p.evaluate(() => ({ cd: G.cd && G.cd.loai + G.cd.id, wave: G.wave, mana: G.ban[0].mana, cho: G.cho, che: G.che }));
  ok(r.cd === 'thap1' && r.wave === 0 && r.mana === 100 && r.che === 'solo', 'vào tầng 1: trận SOLO, wave 0 → wave đầu 1, mana 100', JSON.stringify(r));
  await chup(p, '390-en-mo-dau'); await p.evaluate(() => { try { VT.dong(); } catch (e) { } });
  await p.evaluate(() => { for (let i = 0; i < 5; i++) trieu(G.ban[0]); });
  await p.evaluate(() => { let n = 0; while (G.wave < 2 && n < 3000) { capNhat(1 / 30); n++; } }); await sleep(700);
  r = await p.evaluate(() => { const e = document.getElementById('tb-trum-chu'); return (e ? e.textContent : '') + '|' + document.getElementById('top').classList.contains('cd-ko-trum'); });
  ok(/FLOOR 1 · 2\/5\|true/.test(r), 'thanh trên trong trận: FLOOR 1 · 2/5 (thay BOSS IN N), không chân dung trùm (tầng thường)', r);
  await chup(p, '390-en-tran');
  r = await chayHet(p);
  ok(r.ket === true && r.wave === 5, 'thắng sau đúng 5 wave (1–5) khi dọn sạch sân', JSON.stringify(r));
  await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 5000 }); await sleep(900);
  r = await p.evaluate((truoc) => ({ vang: KT.vang - truoc.vang, xp: TT.st().xp - truoc.xp, max: CD.st().thap.max, best: localStorage.getItem('turret_best') === truoc.best, sw: MH.st().sw === truoc.sw, tk: KT.doc().tk.wave === truoc.tk, sk: KT.sk().diem === truoc.sk,
    tran: !!document.querySelector('#ketqua .sh-kq-ru[data-act="cd-kq-mo"]'), nut: document.querySelector('#ketqua [data-act="choilai"]').textContent, phu: document.getElementById('kq-phu').textContent, kq: document.querySelector('#ketqua .cd-kq').textContent }), truoc);
  ok(r.vang === 60 + 61 && r.xp === 5 + 10 && r.max === 1 && /FIRST CLEAR/.test(r.kq) && /PILOT XP \+15/.test(r.kq) && /EVENT \+15 PTS/.test(r.kq), 'thắng tầng 1 lần đầu: +60 vàng + Rương Trận nhỏ 61 vàng, XP 5 (lần đầu) + 10 (trận), mở tầng 2, ô FIRST CLEAR + XP + EVENT', JSON.stringify(r));
  ok(r.best && r.sw && r.tk && !r.sk && r.tran, 'không ghi kỷ lục Solo / mốc wave Solo / thống kê wave; có điểm sự kiện + nút OPEN (Rương Trận)', JSON.stringify(r));
  ok(/NEXT · FLOOR 2/.test(r.nut) && /TOWER CLIMB · FLOOR 1/.test(r.phu), 'màn kết quả: TOWER CLIMB · FLOOR 1, nút NEXT · FLOOR 2', JSON.stringify(r));
  await chup(p, '390-en-kq-thang');
  // ---- 5. NEXT → tầng 2, thua → RETRY ----
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await sleep(1500);
  r = await p.evaluate(() => ({ cd: G.cd && G.cd.id, wave: G.wave }));
  ok(r.cd === 2 && r.wave === 1, 'NEXT FLOOR vào tầng 2 (wave đầu 2)', JSON.stringify(r));
  await p.evaluate(() => { G.ban[0].tim = 1; capNhat(1 / 30); G.ketThuc = null; ketThuc(false, TEXT.end.coreDown); }); await sleep(1300);
  r = await p.evaluate(() => ({ nut: document.querySelector('#ketqua [data-act="choilai"]').textContent, max: CD.st().thap.max, kq: document.querySelector('#ketqua .cd-kq').textContent }));
  ok(/RETRY · FLOOR 2/.test(r.nut) && /TOWER CLIMB · FLOOR 2 · /.test(r.phu || 'TOWER CLIMB · FLOOR 2 · ') && r.max === 1 && /NO REWARD/.test(r.kq), 'thua tầng 2: không thưởng, nút RETRY · FLOOR 2', JSON.stringify(r));
  await chup(p, '390-en-kq-thua');
  // ---- 6. tầng 10 (Rương Vàng) + thắng lại không thưởng + tầng 50 tinh thể ----
  await p.evaluate(() => { CD.st().thap.max = 9; const t = TT.st(); t.xp = TT.xpTong(30); TT.xetCap(); t.bao = []; KT.luu(true); document.querySelector('#ketqua [data-act="doibo"]').click(); }); // cấp 30: XP trận không làm lên cấp (thưởng cấp lẫn vào số vàng)
  await sleep(500);
  const v0 = await p.evaluate(() => KT.vang);
  await p.evaluate(() => CD.vao('thap', 10)); await sleep(1500);
  r = await chayHet(p); await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 5000 }); await sleep(900);
  const tr = await p.evaluate(() => ({ cuoi: G.cd.w1, trum: G.cd.trum, mo: !!document.querySelector('#ketqua [data-act="cd-kq-mo"]'), nhan: CD.st().thap.nhan[10] }));
  ok(r.ket && tr.trum && tr.mo && tr.nhan, 'tầng 10 (tầng trùm): có trùm wave cuối, thắng → nút OPEN Rương Vàng', JSON.stringify([r, tr]));
  await chup(p, '390-en-kq-ruong');
  await p.evaluate(() => document.querySelector('#ketqua [data-act="cd-kq-mo"]').click()); await sleep(400);
  await p.evaluate(() => { try { KTUI.boQua(); } catch (e) { } }); await sleep(500);
  r = await p.evaluate(() => { const q = document.getElementById('sh-phu'); return { lat: q ? q.querySelectorAll('.kt-lat').length : 0, pool: [...(q ? q.querySelectorAll('.kt-lat [data-id], .kt-lat .ot-mini') : [])].length }; });
  ok(r.lat >= 5, 'mở Rương Vàng: lật thẻ (8 thẻ, gộp trùng)', JSON.stringify(r));
  await chup(p, '390-en-mo-ruong');
  await p.evaluate(() => { try { SHUI.dongKq(); } catch (e) { } });
  r = await p.evaluate(() => { const s = KT.doc(); const ngoai = Object.keys(THEBAI.doc().c).filter(id => !SH.trongPool(id) && !SH.co(id)); return { ngoai, gem: KT.ngoc }; });
  ok(!r.ngoai.length, 'thẻ trong rương chỉ là ụ trong bể rơi', JSON.stringify(r));
  const v1 = await p.evaluate(() => KT.vang);
  ok(v1 - v0 === 150 + 70, 'tầng 10: +150 vàng (+20 ngọc, Rương Vàng) + Rương Trận nhỏ 70 vàng', v1 - v0);
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(300);
  await p.evaluate(() => CD.vao('thap', 10)); await sleep(1200); await chayHet(p); await sleep(1300);
  r = await p.evaluate((v1) => ({ d: KT.vang - v1, kq: document.querySelector('#ketqua .cd-kq').textContent }), v1);
  ok(r.d === 70 && !/FIRST CLEAR/.test(r.kq) && /REWARDS/.test(r.kq), 'thắng lại tầng 10: chỉ Rương Trận nhỏ (70 vàng), không thưởng lần đầu', JSON.stringify(r));
  await p.evaluate(() => { CD.st().thap.max = 49; document.querySelector('#ketqua [data-act="doibo"]').click(); });
  await sleep(300); const t0 = await p.evaluate(() => CD.tt());
  await p.evaluate(() => CD.vao('thap', 50)); await sleep(1200); await chayHet(p); await sleep(1300);
  r = await p.evaluate((t0) => ({ tt: CD.tt() - t0, ic: !!document.querySelector('#ketqua .cd-kq .cd-tt') }), t0);
  ok(r.tt === 3 && r.ic, 'tầng 50: +3 Tinh thể Đỏ (biểu tượng ở ô thưởng)', JSON.stringify(r));
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(400);
  // bảng chương 6 + ảnh
  await p.evaluate(() => { HM.di('hm'); HM.che = 'thap'; CDUI.chon.thap = 0; CDUI.mo('thap'); }); await sleep(500);
  await chup(p, '390-en-bang-thap-c6');
  ok(!errs.length, 'không lỗi trang (390 EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();

  // ---- 7. ảnh 844×390 + VI ----
  for (const [vp, lang, tag] of [[{ width: 844, height: 390 }, 'en', '844-en'], [{ width: 390, height: 844 }, 'vi', '390-vi'], [{ width: 844, height: 390 }, 'vi', '844-vi']]) {
    const o = await mo(vp, lang);
    await o.p.evaluate(() => { const t = TT.st(); t.xp = TT.xpTong(9); TT.xetCap(); t.bao = []; CD.st().thap.max = 13; KT.luu(true); HM.che = 'thap'; HM.ve(); HM.moChe(); });
    await sleep(600); await chup(o.p, tag + '-che');
    await o.p.evaluate(() => { HM.dong(true); CDUI.mo('thap'); }); await sleep(600); await chup(o.p, tag + '-bang-thap');
    await o.p.evaluate(() => { CD.st().thap.max = 19; CD.vao('thap', 20); }); await sleep(1800); await chup(o.p, tag + '-mo-dau'); await o.p.evaluate(() => { try { VT.dong(); } catch (e) { } });
    await o.p.evaluate(() => { G.ban[0].tim = 99; for (let i = 0; i < 8; i++) trieu(G.ban[0]); let n = 0; while (G.wave < 18 && n < 3000) { capNhat(1 / 30); n++; } }); await sleep(800);
    await chup(o.p, tag + '-tran');
    await chayHet(o.p); await sleep(1500); await chup(o.p, tag + '-kq');
    ok(!o.errs.length, 'không lỗi trang (' + tag + ')', o.errs.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Leo Tháp đạt'); process.exit(loi ? 1 : 0);
})();
