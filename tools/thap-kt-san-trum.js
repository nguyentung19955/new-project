// ASTRAL ARSENAL — KIỂM SĂN TRÙM (thap/js/chedo-c.js, tuvan/che-do-c/THIET-KE.md §3)
//  ✓ khoá tới khi hạ 3 trùm khác nhau · chỉ chọn trùm đã hạ · bậc b mở khi thắng bậc b−1 của cùng trùm
//  ✓ bậc b: wave 10b−4…10b, trùm ở wave cuối (bậc 8–10: wave 70, máu ×2/×4/×8) · vé 3/ngày, trừ khi vào trận, mua thêm 2 vé × 3 000 vàng
//  ✓ thắng = hạ trùm; hết 90 giây hoặc trùm lọt = thua (vẫn mất vé) · hết vé = LUYỆN TẬP (không thưởng, không mở bậc)
//  ✓ thưởng lần đầu (300 vàng bậc 1…) + XP · đủ 12 trùm cùng bậc = rương · Trùm tuần bậc 3 = 2 000 vàng (1 lần/tuần)
//  Ảnh (SHOTS, mặc định /tmp/thap-san-trum): 390×844 + 844×390, EN + VI — bảng săn trùm, trong trận (đồng hồ trùm), kết quả.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-san-trum.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-san-trum';
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
    await p.evaluate(() => { UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } const t = TT.st(); t.xp = TT.xpTong(8); TT.xetCap(); t.bao = []; KT.luu(true); HM.ve(); });
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const vao = async (p, id, bac) => { await p.evaluate(([id, bac]) => CD.vao('san', id, bac), [id, bac]); await p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(800); await p.evaluate(() => { try { VT.dong(); } catch (e) { } }); };
  // chạy tới khi trùm vào sân (quái thường bị bỏ im lặng), trả trạng thái
  const toiTrum = (p) => p.evaluate(() => { G.ban[0].tim = 99; let n = 0; while (!G.ketThuc && !G.quai.some(e => e.trum && !e.chet) && n < 30 * 400) { capNhat(1 / 30); for (const E of G.quai) if (!E.chet && !E.trum) { E.chet = true; E.tChet = 1; } if (n % 60 === 0) try { FX.reset(); } catch (e) { } n++; } return { wave: G.wave, trum: (G.quai.find(e => e.trum) || {}).trum, tTrum: G.cd.tTrum != null }; });
  const hetTran = (p) => p.evaluate(() => { let n = 0; while (!G.ketThuc && n < 30 * 400) { capNhat(1 / 30); for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } if (n % 60 === 0) try { FX.reset(); } catch (e) { } n++; } return { thang: G.ketThuc && G.ketThuc.thang, ly: G.ketThuc && G.ketThuc.ly }; });
  const ketqua = async (p) => { await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 8000 }); await sleep(700); return p.evaluate(() => ({ kq: (document.querySelector('#ketqua .cd-kq') || {}).textContent || '', nut: document.querySelector('#ketqua [data-act="choilai"]').textContent, phu: document.getElementById('kq-phu').textContent })); };
  const ve = async (p) => { await p.evaluate(() => { document.querySelector('#ketqua [data-act="doibo"]').click(); }); await sleep(300); };

  const { p, errs } = await mo({ width: 390, height: 844 }, 'en');
  // ---- 1. khoá ----
  let r = await p.evaluate(() => ({ mo: TT.tnMo('san'), chu: TT.tnChu('san'), ha: CD.trumHa().length }));
  ok(!r.mo && r.ha === 0 && /3 different bosses/.test(r.chu), 'chưa hạ trùm nào: Săn Trùm khoá ("defeating 3 different bosses")', JSON.stringify(r));
  const ds = await p.evaluate(() => CD.dsTrum());
  await p.evaluate((ds) => { const m = MH.st(); m.tr[ds[0]] = 1; m.tr[ds[1]] = 1; KT.luu(true); }, ds);
  r = await p.evaluate(() => TT.tnMo('san')); ok(!r, 'hạ 2 trùm: vẫn khoá', r);
  await p.evaluate((ds) => { MH.st().tr[ds[2]] = 1; KT.luu(true); HM.chonChe('san'); HM.choi(); }, ds); await sleep(600);
  r = await p.evaluate(() => { const q = document.querySelector('#tt-phu.cd-p'); return { mo: TT.tnMo('san'), che: HM.che, hien: !!q && !q.hidden, tr: q ? [...q.querySelectorAll('.cd-tr')].map(b => b.disabled ? 0 : 1).join('') : '', bac: q ? [...q.querySelectorAll('.cd-bac .cd-bp')].filter(b => !b.disabled).length : 0, ve: CD.ve() }; });
  ok(r.mo && r.che === 'san' && r.hien && r.tr === '111000000000' && r.bac === 1 && r.ve === 3, 'hạ 3 trùm: mở; bảng: 3 trùm chọn được, 9 khoá, chỉ bậc 1, vé 3/3', JSON.stringify(r));
  await chup(p, '390-en-bang-san');
  // ---- 2. tham số ----
  r = await p.evaluate((id) => { const a = CD.cauHinh('san', id, 1), c = CD.cauHinh('san', id, 7), d = CD.cauHinh('san', id, 9); return [a.w0, a.w1, a.trum === id, c.w1, d.w0, d.w1, d.hsT].join(); }, ds[0]);
  ok(r === '6,10,true,70,66,70,4', 'bậc 1: wave 6–10 trùm cuối · bậc 7: trùm wave 70 · bậc 9: wave 66–70, máu trùm ×4', r);
  // ---- 3. thắng bậc 1 ----
  const v0 = await p.evaluate(() => KT.vang);
  await vao(p, ds[0], 1);
  r = await p.evaluate(() => ({ ve: CD.ve(), w: G.wave, luyen: !!G.cd.luyen }));
  ok(r.ve === 2 && r.w === 5 && !r.luyen, 'vào bậc 1: trừ 1 vé (còn 2), wave đầu 6', JSON.stringify(r));
  r = await toiTrum(p);
  ok(r.wave === 10 && r.trum === ds[0] && r.tTrum, 'trùm đã chọn ra ở wave 10, bắt đầu đồng hồ 90 giây', JSON.stringify(r));
  await p.evaluate(() => { for (let i = 0; i < 6; i++) trieu(G.ban[0]); }); await sleep(900);
  r = await p.evaluate(() => { const e = document.getElementById('cd-chip'); return e && !e.hidden ? e.textContent : ''; });
  ok(/BOSS TIME \d+s/.test(r), 'trong trận: đồng hồ trùm "BOSS TIME Ns"', r);
  await chup(p, '390-en-tran-san');
  r = await hetTran(p);
  const kq1 = await ketqua(p);
  r = await p.evaluate((v0) => ({ d: KT.vang - v0, da: CD.st().san.da, bm: CD.bacMo(CD.cuoi.id) }), v0);
  ok(r.d === 300 && r.bm === 2 && /FIRST CLEAR/.test(kq1.kq) && /HUNT AGAIN/.test(kq1.nut) && /BOSS HUNT · TIER 1/.test(kq1.phu), 'thắng bậc 1: +300 vàng, mở bậc 2, nút HUNT AGAIN', JSON.stringify([r, kq1]));
  await chup(p, '390-en-kq-san');
  // ---- 4. hết giờ ----
  await ve(p); await vao(p, ds[0], 2); await toiTrum(p);
  r = await p.evaluate(() => { G.t = G.cd.tTrum + 91; for (const E of G.quai) if (E.trum) E.hp = E.max; capNhat(1 / 30); return { ket: G.ketThuc && G.ketThuc.thang, ly: G.ketThuc && G.ketThuc.ly, ve: CD.ve() }; });
  ok(r.ket === false && /Time up/.test(r.ly) && r.ve === 1, 'hết 90 giây mà trùm còn sống: thua, vé vẫn mất (còn 1)', JSON.stringify(r));
  await ketqua(p); await chup(p, '390-en-kq-san-thua');
  // ---- 5. trùm lọt ----
  await ve(p); await vao(p, ds[0], 2); await toiTrum(p);
  r = await p.evaluate(() => { const E = G.quai.find(e => e.trum && !e.chet); lot(E); return { ket: G.ketThuc && G.ketThuc.thang, ly: G.ketThuc && G.ketThuc.ly, ve: CD.ve() }; });
  ok(r.ket === false && /escaped/.test(r.ly) && r.ve === 0, 'trùm lọt: thua ngay (còn 0 vé)', JSON.stringify(r));
  await ketqua(p);
  // ---- 6. hết vé → luyện tập; mua vé ----
  await ve(p); const v1 = await p.evaluate(() => KT.vang);
  await vao(p, ds[0], 2); await toiTrum(p); await hetTran(p); const kq2 = await ketqua(p);
  r = await p.evaluate((v1) => ({ d: KT.vang - v1, bm: CD.bacMo(CD.cuoi.id) }), v1);
  ok(r.d === 0 && r.bm === 2 && /PRACTICE/.test(kq2.kq) && /PRACTICE AGAIN/.test(kq2.nut), 'hết vé: LUYỆN TẬP — thắng không thưởng, không mở bậc', JSON.stringify([r, kq2]));
  await ve(p);
  r = await p.evaluate(() => { KT.cong('vang', 10000, 'other'); const v = KT.vang; const a = CD.veMua(), b2 = CD.veMua(), c = CD.veMua(); return { a, b2, c, ve: CD.ve(), tra: v - KT.vang }; });
  ok(r.a && r.b2 && !r.c && r.ve === 2 && r.tra === 6000, 'mua vé: 2 vé × 3 000 vàng, lần 3 bị từ chối', JSON.stringify(r));
  // ---- 7. đủ 12 trùm bậc 1 + Trùm tuần ----
  r = await p.evaluate(() => { const s = CD.st(), ds = CD.dsTrum(), tuan = CD.trumTuan(); for (const id of ds) { MH.st().tr[id] = 1; if (id !== tuan) s.san.da[id + ':1'] = 1; s.san.da[id + ':2'] = 1; } KT.luu(true); return tuan; });
  const tuan = r;
  await vao(p, tuan, 1); await toiTrum(p); await hetTran(p); const kq3 = await ketqua(p);
  r = await p.evaluate(() => ({ du: CD.st().san.du[1], nRu: (CDUI._ru || []).length }));
  ok(r.du && r.nRu >= 1 && /OPEN/.test(kq3.kq), 'đủ 12 trùm bậc 1: Rương Thường (nút OPEN)', JSON.stringify([r, kq3]));
  await ve(p); const v2 = await p.evaluate(() => KT.vang);
  await vao(p, tuan, 3); await toiTrum(p); await hetTran(p); await ketqua(p);
  r = await p.evaluate((v2) => ({ d: KT.vang - v2, tuan: CD.sanSt().tuanNhan }), v2);
  ok(r.d === 2300 && r.tuan[3], 'Trùm tuần bậc 3: +2 000 vàng (1 lần/tuần) + 300 vàng lần đầu', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (390 EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();

  // ---- 8. ảnh 844×390 + VI ----
  for (const [vp, lang, tag] of [[{ width: 844, height: 390 }, 'en', '844-en'], [{ width: 390, height: 844 }, 'vi', '390-vi'], [{ width: 844, height: 390 }, 'vi', '844-vi']]) {
    const o = await mo(vp, lang);
    await o.p.evaluate(() => { const ds = CD.dsTrum(); for (let i = 0; i < 7; i++) MH.st().tr[ds[i]] = 1; for (let b = 1; b <= 4; b++) CD.st().san.da[ds[1] + ':' + b] = 1; KT.luu(true); HM.chonChe('san'); CDUI.chon.san = ds[1]; HM.choi(); });
    await sleep(700); await chup(o.p, tag + '-bang-san');
    const id = await o.p.evaluate(() => CD.dsTrum()[1]);
    await vao(o.p, id, 5); await toiTrum(o.p); await o.p.evaluate(() => { for (let i = 0; i < 8; i++) trieu(G.ban[0]); }); await sleep(900); await chup(o.p, tag + '-tran-san');
    await hetTran(o.p); await ketqua(o.p); await chup(o.p, tag + '-kq-san');
    ok(!o.errs.length, 'không lỗi trang (' + tag + ')', o.errs.slice(0, 3).join(' | '));
    await o.ctx.close();
  }
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Săn Trùm đạt'); process.exit(loi ? 1 : 0);
})();
