// ASTRAL ARSENAL — KIỂM THỬ THÁCH TUẦN (WEEKLY CHALLENGE) — thap/js/chedo-d.js (TTUAN, CDDUI.tuan), tuvan/che-do-d/THIET-KE.md §2
//  ✓ chedo-d.js không gọi Math.random · CDDC.tw.bat = true (hiện trong GAME MODE + HOME → EVENT)
//  ✓ khoá Cấp phi công 8 (người mới: khoá, chữ "Pilot Level 8"; cấp 8: mở) · ADMIN (stub tài khoản Google đúng email) thấy + mở được
//  ✓ cấu hình TẤT ĐỊNH theo tuần (cùng hạt cho mọi người): 5 ụ = 1 Vàng + 2 Tím + 1 Xanh + 1 Trắng, không Đỏ, ≥ 3 ụ gây sát thương;
//    chỉ huy cố định; 2 đột biến khác nhau trong {Swift, Thick Hide, Horde, Giants, Sky Raid}; tuần khác → hạt khác
//  ✓ bảng tuần: bộ 5 ụ + chỉ huy, mốc 15/25/35/45, 3 tab bảng xếp hạng (ngoại tuyến: NOT CONNECTED + kỷ lục cá nhân)
//  ✓ trận: bộ cho mượn (không cần sở hữu), cấp thẻ chuẩn hoá +5, mana 100, 3 tim, hạt = hạt tuần; trùm wave 10/20; wave tất định
//  ✓ hết tim ở wave 16 → mốc 15 = +1 000 vàng (1 lần), kỷ lục tuần 16, điểm chờ gửi bảng 'tw'; không ghi kỷ lục Solo (turret_best)
//  ✓ qua wave 50 → CLEAR (51): mốc 25 (+30 ngọc), 35 (thẻ Vàng tuần nếu trong bể / Rương HT), 45 (+1 Tinh thể Đỏ); không phát lại
//  ✓ RETRY · WEEKLY vào lại thử thách tuần · HOME → EVENT: thẻ WEEKLY CHALLENGE (PLAY / RANKS)
//  Ảnh (SHOTS, mặc định /tmp/thap-thu-thach-tuan): 393×852 EN + VI — GAME MODE, EVENT, màn tuần, trận, kết quả.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-thu-thach-tuan.js [BASE]
'use strict';
console.log('SKIP — chế độ này đã BỎ khỏi game (người dùng chốt 11/11, nhánh claude/che-do-dcdw) — code còn nhưng không còn lối vào'); process.exit(0); // 11/11
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-thu-thach-tuan';
const EMAIL = 'ly230595@gmail.com';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const src = fs.readFileSync(path.join(__dirname, '../thap/js/chedo-d.js'), 'utf8').replace(/\/\/[^\n]*/g, '');
  ok(!/Math\.random/.test(src), 'chedo-d.js không gọi Math.random');
  ok(/tw:\s*\{[^}]*bat:\s*true/.test(src), 'CDDC.tw.bat = true');
  const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
  const mo = async (vp, lang, cap) => {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.setDefaultTimeout(120000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); localStorage.setItem('tm_lang', lang); }, lang);
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof CDD !== 'undefined' && G.roster && G.roster.length, null, { timeout: 90000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 120000 }).catch(() => { });
    await sleep(800);
    await p.evaluate((cap) => { if (cap) { TT.st().xp = TT.xpTong(cap); KT.luu(true); } UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } HM.ve(); }, cap);
    return { ctx, p, errs };
  };
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  // mô phỏng tới wave `den` (quái chết ngay, tim giữ), dừng khi kết thúc
  const toi = (p, den) => p.evaluate((den) => {
    const trum = []; let n = 0;
    while (!G.ketThuc && G.wave < den && n < 30 * 60 * 40) {
      const w0 = G.wave; capNhat(1 / 30); if (G.wave !== w0 && G.laTrum) trum.push(G.wave);
      G.ban[0].tim = 3; for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; }
      if (n % 60 === 0) try { FX.reset(); } catch (e) { } n++;
    }
    return { w: G.wave, trum, kt: !!G.ketThuc };
  }, den);
  const ketqua = async (p) => { await p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 60000 }); await sleep(700); return p.evaluate(() => ({ phu: document.getElementById('kq-phu').textContent, chi: document.getElementById('kq-chi').textContent, thang: document.getElementById('ketqua').classList.contains('thang'), lai: (document.querySelector('#ketqua [data-act="choilai"]') || {}).textContent })); };
  const vaoTran = async (p) => { await p.waitForFunction(() => G.ban.length && G.tw && !G.ketThuc, null, { timeout: 120000 }); await sleep(500); await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.dung = false; }); };

  // ---------- 393 EN: luồng chính ----------
  let { ctx, p, errs } = await mo({ width: 393, height: 852 }, 'en', 0);
  let r = await p.evaluate(() => ({ mo: TT.tnMo('tw'), chu: TT.tnChu('tw'), co: !!HM.CHE.tw, cap: TT.cap() }));
  ok(!r.mo && /Pilot Level 8/.test(r.chu) && r.co, 'người mới (cấp ' + r.cap + '): WEEKLY CHALLENGE có trong GAME MODE nhưng khoá — ' + r.chu, JSON.stringify(r));
  // ADMIN: stub tài khoản Google đúng email → mở; đăng xuất → khoá lại
  r = await p.evaluate((em) => { NET._baoTK({ uid: 'adm1', anon: false, email: em, ev: true }); const a = { la: ADMIN.la(), mo: TT.tnMo('tw') }; HM.moChe(); a.ds = document.querySelector('#hm-tam').textContent; HM.dong(true); return a; }, EMAIL);
  ok(r.la && r.mo && /WEEKLY CHALLENGE/.test(r.ds), 'ADMIN: thử thách tuần mở + hiện trong GAME MODE', JSON.stringify(r).slice(0, 200));
  r = await p.evaluate(() => { HM.chonChe('tw'); HM.choi(); const q = document.querySelector('#tt-phu.cdd-tw'); const x = { hien: !!q && !q.hidden }; TTUI.dong(); NET._baoTK({ uid: 'g1', anon: true }); x.la = ADMIN.la(); x.mo = TT.tnMo('tw'); return x; });
  ok(r.hien && !r.la && !r.mo, 'ADMIN mở được màn tuần; về khách → khoá lại', JSON.stringify(r));
  await p.evaluate(() => { TT.st().xp = TT.xpTong(8); KT.luu(true); HM.ve(); });
  ok(await p.evaluate(() => TT.cap() >= 8 && TT.tnMo('tw')), 'cấp phi công 8 → mở');
  // cấu hình tất định
  r = await p.evaluate(() => {
    const tu = KT.tuan(), a = TTUAN.cauHinh(tu), a2 = TTUAN.cauHinh(tu), c = TTUAN.cauHinh(tu + 1);
    const bac = a.deck.map(id => THEBAI.bac(id)).sort().join(','), dmg = a.deck.filter(id => SKILLS[id].dmg && SKILLS[id].vai !== 'ht').length;
    return { deck: a.deck, mv: a.mv, dot: a.dot, same: JSON.stringify(a) === JSON.stringify(a2), khac: a.hat !== c.hat, bac, dmg, w1: a.w1, tim: a.tim, M: a.M, hat: a.hat, beDot: CDDC.beDot };
  });
  ok(r.same && r.khac, 'cấu hình tuần tất định (2 lần như nhau) · tuần sau hạt khác', JSON.stringify(r));
  ok(r.deck.length === 5 && new Set(r.deck).size === 5 && r.bac === ['tim', 'tim', 'trang', 'vang', 'xanh'].join(',') && r.dmg >= 3, 'bộ tuần ' + r.deck.join('/') + ': 1 Vàng + 2 Tím + 1 Xanh + 1 Trắng, không Đỏ, ' + r.dmg + ' ụ gây sát thương', JSON.stringify(r));
  ok(r.mv && r.dot.length === 2 && r.dot[0] !== r.dot[1] && r.dot.every(d => r.beDot.includes(d)) && r.w1 === 50 && r.tim === 3 && r.M === 100, 'chỉ huy ' + r.mv + ' · đột biến ' + r.dot.join('+') + ' · wave 1–50, 3 tim, mana 100', JSON.stringify(r));
  const CFG = r;
  // GAME MODE → WEEKLY → màn tuần
  await p.evaluate(() => HM.moChe()); await chup(p, '393-en-game-mode');
  r = await p.evaluate(() => document.querySelector('#hm-tam').textContent); ok(/WEEKLY CHALLENGE/.test(r) && /ENDLESS/.test(r), 'GAME MODE có WEEKLY CHALLENGE + ENDLESS');
  await p.evaluate(() => { const x = document.querySelector('#hm-tam [data-che="tw"]'); x.click(); }); await sleep(300);
  await p.evaluate(() => HM.choi()); await sleep(900);
  r = await p.evaluate(() => { const q = document.querySelector('#tt-phu.cdd-tw'); return { hien: !!q && !q.hidden, txt: q ? q.textContent : '', u: q ? q.querySelectorAll('.cdd-u').length : 0, tab: q ? [...q.querySelectorAll('.cdd-tb')].map(x => x.dataset.id).join() : '' }; });
  ok(r.hien && r.u === 5 && /WAVE 15/.test(r.txt) && /WAVE 45/.test(r.txt) && /\+5/.test(r.txt) && r.tab === 'tw,vt,vtAll' && /NOT CONNECTED/.test(r.txt), 'màn tuần: 5 ụ + chỉ huy, mốc 15–45, CARD LEVEL +5, 3 tab bảng xếp hạng, ngoại tuyến', JSON.stringify(r).slice(0, 400));
  await chup(p, '393-en-man-tuan');
  // START → trận
  const best0 = await p.evaluate(() => localStorage.getItem('turret_best'));
  const v0 = await p.evaluate(() => KT.vang);
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tw-vao"]').click()); await vaoTran(p);
  r = await p.evaluate(() => { const B = G.ban[0]; return { deck: B.deck, cap: B.deck.map(id => B.capThe[id]), mana: B.mana, tim: B.tim, hat: G.hat, tw: !!G.tw, cd: !!G.cd, mv: G.tw.mv, coSoHuu: B.deck.map(id => SH.co(id) ? 1 : 0).join('') }; });
  ok(r.tw && !r.cd && r.deck.join() === CFG.deck.join() && r.cap.every(x => x === 5) && r.mana === 100 && r.tim === 3 && r.hat === CFG.hat && r.mv === CFG.mv, 'trận: bộ cho mượn (sở hữu ' + r.coSoHuu + '), cấp thẻ +5, mana 100, 3 tim, hạt tuần', JSON.stringify(r));
  await p.evaluate(() => { for (let i = 0; i < 8; i++) trieu(G.ban[0]); });
  r = await toi(p, 11);
  ok(r.trum.includes(10) && !r.kt, 'trùm ở wave 10', JSON.stringify(r));
  await sleep(300); await chup(p, '393-en-tran');
  // tất định wave
  r = await p.evaluate(() => { const giu = { w: G.wave, h: G.hang.slice() }; const lay = () => { G.wave = 13; G.hang.length = 0; TTUAN.wave(); return G.hang.map(h => (h.trum || h.id) + '@' + (h.t - G.t).toFixed(2)).join(','); }; const a = lay(), b2 = lay(); G.wave = giu.w; G.hang = giu.h; return { same: a === b2, n: a.split(',').length }; });
  ok(r.same && r.n > 5, 'tất định: cùng hạt tuần → wave 14 giống hệt (' + r.n + ' quái)', JSON.stringify(r));
  r = await toi(p, 16);
  await p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, 'The core fell'); }); let k = await ketqua(p);
  let s = await p.evaluate((v0) => ({ tw: CDD.st().tw, dv: KT.vang - v0, lb: CDD.st().lb.tw, best: localStorage.getItem('turret_best') }), v0);
  ok(!k.thang && /WEEKLY CHALLENGE/.test(k.phu) && /WAVE 15/.test(k.chi) && s.tw.best === 16 && s.tw.nhan[15] && !s.tw.nhan[25] && s.dv >= 1000, 'hết tim wave 16 → mốc 15 = +1 000 vàng, kỷ lục tuần 16', JSON.stringify([k, s]));
  ok(!!(s.lb && s.lb.w === 16 && s.lb.t > 0), 'điểm chờ gửi bảng tuần (ngoại tuyến) w=16', JSON.stringify(s.lb));
  ok(s.best === best0, 'không ghi kỷ lục Solo (turret_best)', s.best + ' vs ' + best0);
  ok(/RETRY · WEEKLY/.test(k.lai), 'nút RETRY · WEEKLY', k.lai);
  await chup(p, '393-en-kq-thua');
  // RETRY → trận tuần mới; nhảy tới wave 49 rồi qua 50
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await vaoTran(p);
  const g0 = await p.evaluate(() => ({ ngoc: KT.ngoc, tt: CD.tt(), vang: KT.vang, ru: JSON.stringify(KT.doc().ru || {}) }));
  r = await p.evaluate(() => { G.wave = 49; G.cho = 0.1; G.hang.length = 0; let n = 0; while (!G.ketThuc && n < 30 * 400) { capNhat(1 / 30); G.ban[0].tim = 3; for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } n++; } return { w: G.wave, kt: !!G.ketThuc }; });
  k = await ketqua(p);
  s = await p.evaluate((g0) => ({ tw: CDD.st().tw, dn: KT.ngoc - g0.ngoc, dtt: CD.tt() - g0.tt }), g0);
  ok(r.kt && r.w === 50 && k.thang && /CLEAR/.test(k.chi) && s.tw.best === 51, 'qua wave 50 → hoàn thành (CLEAR = 51)', JSON.stringify([r, k, s.tw]));
  ok(s.tw.nhan[25] && s.tw.nhan[35] && s.tw.nhan[45] && s.dn >= 30 && s.dtt === 1, 'mốc 25 (+30 ngọc) · 35 (thẻ Vàng tuần / Rương HT) · 45 (+1 Tinh thể Đỏ)', JSON.stringify(s));
  await chup(p, '393-en-kq-clear');
  // lần nữa: không phát lại mốc
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await vaoTran(p);
  const g1 = await p.evaluate(() => ({ ngoc: KT.ngoc, tt: CD.tt(), vang: KT.vang }));
  await toi(p, 16); await p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, 'The core fell'); }); k = await ketqua(p);
  s = await p.evaluate((g1) => ({ dn: KT.ngoc - g1.ngoc, dtt: CD.tt() - g1.tt, best: CDD.st().tw.best }), g1);
  ok(s.dtt === 0 && s.best === 51 && /NO NEW MILESTONE/.test(k.chi), 'chơi lại trong tuần: không phát lại mốc, kỷ lục giữ CLEAR', JSON.stringify([k.chi, s]));
  // HOME → EVENT: thẻ thử thách tuần
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(600);
  await p.evaluate(() => KTUI.moTab('sk')); await sleep(600);
  r = await p.evaluate(() => { const c = document.querySelector('#kt-than .cdd-sk'); return { co: !!c, txt: c ? c.textContent : '' }; });
  ok(r.co && /WEEKLY CHALLENGE/.test(r.txt) && /CLEAR/.test(r.txt) && /PLAY/.test(r.txt) && /RANKS/.test(r.txt), 'HOME → EVENT: thẻ WEEKLY CHALLENGE (best CLEAR, PLAY, RANKS)', JSON.stringify(r));
  await chup(p, '393-en-event');
  await p.evaluate(() => document.querySelector('#kt-than [data-act="cdd-sk-tw"]').click()); await sleep(800);
  r = await p.evaluate(() => ({ kt: KTUI.mo, tw: !!document.querySelector('#tt-phu.cdd-tw:not([hidden])') }));
  ok(!r.kt && r.tw, 'EVENT → PLAY mở màn tuần', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (393 EN)', errs.slice(0, 3).join(' | '));
  await ctx.close();

  // ---------- 393 VI: ảnh ----------
  ({ ctx, p, errs } = await mo({ width: 393, height: 852 }, 'vi', 8));
  await p.evaluate(() => HM.moChe()); await chup(p, '393-vi-game-mode'); await p.evaluate(() => HM.dong(true));
  await p.evaluate(() => KTUI.moTab('sk')); await sleep(600); await chup(p, '393-vi-event'); await p.evaluate(() => KTUI.dong());
  await p.evaluate(() => { HM.chonChe('tw'); HM.choi(); }); await sleep(900); await chup(p, '393-vi-man-tuan');
  r = await p.evaluate(() => document.querySelector('#tt-phu').textContent); ok(/THỬ THÁCH TUẦN/.test(r) && /CHƯA KẾT NỐI/.test(r), 'tiếng Việt: màn tuần dịch', r.slice(0, 200));
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="cdd-tw-vao"]').click()); await vaoTran(p);
  await p.evaluate(() => { for (let i = 0; i < 8; i++) trieu(G.ban[0]); }); await toi(p, 16); await sleep(300); await chup(p, '393-vi-tran');
  await p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, 'The core fell'); }); k = await ketqua(p); await chup(p, '393-vi-kq');
  ok(/THỬ THÁCH TUẦN/.test(k.phu) && /MỐC TUẦN/.test(k.chi), 'tiếng Việt: màn kết quả dịch', JSON.stringify(k));
  ok(!errs.length, 'không lỗi trang (393 VI)', errs.slice(0, 3).join(' | '));
  await ctx.close();
  await b.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ Thử thách tuần đạt'); process.exit(loi ? 1 : 0);
})();
