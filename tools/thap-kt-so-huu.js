// ASTRAL ARSENAL — KIỂM GACHA THU THẬP (thap/js/sohuu.js + rương kinhte.js + túi trận thebai.js + tientrinh.js) — tuvan/gacha-thu-thap/BANG-MO-NHOM.md
//  ✓ người mới chỉ có 10 ụ (8 Trắng + 2 Xanh); bộ bài / kéo / RANDOM / bộ mẫu chỉ nhận ụ đã có; trang ụ chưa có vẫn mở xem được
//  ✓ rương (Thường / Vàng / Thần thoại / Sự kiện / Huyền thoại / Cổ đại), túi trận, Daily Specials, vòng quay, chọn 1 trong 3, Ấn Vàng: chỉ ụ trong bể (đã mở theo cấp hoặc đã có)
//  ✓ bậc chưa mở → lùi bậc (không mất lượt); bảo hiểm Vàng 10 rương giữ nguyên khi đã có Vàng, không đếm khi chưa có; Thần thoại bảo đảm Đỏ khi đủ điều kiện
//  ✓ lên cấp mở đúng nhóm (bảng lên cấp có hình + tên); Đỏ cần cấp 12 VÀ kỷ lục ≥ wave 30
//  ✓ người cũ: ụ có bản sao / đang trong bộ bài / bộ mẫu → sở hữu, cấp quy đổi mở đúng nhóm, không báo lại · gộp hồ sơ Firebase OR
//  ✓ quà hướng dẫn (Ice Blade) + hành trình (Berserker / Storm Gun / Overclock) · NEW! ở rương · Rương Trận ở màn kết quả mở bằng lật thẻ
//  ✓ lưới: 3 trạng thái + đếm "OWNED x · UNLOCKED y · TOTAL n" + lọc OWNED/NOT OWNED/LOCKED + xếp PILOT LV · PVP/online bộ bài vẫn hợp lệ · không lỗi trang
//  Ảnh (SHOTS, mặc định /tmp/thap-so-huu): 390×844 + 360×780, EN + VI — HOME, bộ bài, bộ sưu tập, mở rương (có Đỏ), bảng lên cấp, Rương Trận.
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-so-huu.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-so-huu';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  let ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  let p = await ctx.newPage(); const errs = [];
  const nghe = (pg) => pg.on('pageerror', e => errs.push(e.message));
  nghe(p);
  const vao = async (ls, q) => {
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((ls) => { localStorage.clear(); for (const k in ls) localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])); }, ls || {});
    await p.goto(BASE + '?notut=1' + (q || ''), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof SH !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(500);
  };
  const chup = async (ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };

  // ---- 1. người mới ----
  await vao({});
  let r = await p.evaluate(() => {
    const o = {}, d = SH.dem(); o.dem = [d.co, d.mo, d.tong].join(); o.khoiDau = SHC.khoiDau.every(id => SH.co(id));
    o.bac = TIER_LIST.map(b => SH.dsCo().filter(id => THEBAI.bac(id) === b && SH.co(id)).length).join();
    o.bang = Object.values(SHC.nhom).reduce((a, g) => a + g.ds.length, 0); o.duNhom = SH.dsCo().every(id => SH.capMo(id) > 0);
    o.trung = new Set(Object.values(SHC.nhom).flatMap(g => g.ds)).size === o.bang;
    o.coDo12 = Object.entries(SHC.nhom).every(([L, g]) => +L >= 12 || g.ds.every(id => THEBAI.bac(id) !== 'do'));
    o.size = Object.values(SHC.nhom).slice(1).every(g => g.ds.length >= 3 && g.ds.length <= 6);
    o.hd = HD.DECK.every(id => SH.co(id));
    UI.chon = []; UI.chonU('railgun'); o.chonVang = UI.chon.includes('railgun'); UI.chonU('phun'); o.chonPhun = UI.chon.includes('phun'); UI.chonU('tia'); o.chonTia = UI.chon.includes('tia');
    o.loi = DK.loi([], 'phun'); o.loiOk = DK.loi([], 'lien');
    let ngoai = 0; for (let i = 0; i < 25; i++) { UI.chon = []; DC.o = [null, null, null, null, null]; DC.ngauNhien(); if (UI.chon.some(id => !SH.co(id))) ngoai++; if (UI.chon.length !== 5) ngoai++; } o.nn = ngoai;
    o.pre = BOBAI.DS.filter(a => BOBAI.hopLe(a)).every(a => a.deck.every(id => SH.co(id)));
    UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo();
    return o;
  });
  ok(r.dem === '10,10,96' && r.khoiDau && r.bac === '8,2,0,0,0' && r.hd, 'người mới: sở hữu 10 ụ (8 Trắng + 2 Xanh), gồm cả bộ hướng dẫn · đã mở 10 · tổng 96', JSON.stringify(r));
  ok(r.bang === 96 && r.duNhom && r.trung && r.coDo12 && r.size, 'bảng nhóm: đủ 96 ụ, mỗi ụ 1 lần, mỗi cấp 3–6 ụ, Đỏ từ cấp 12', JSON.stringify(r));
  ok(!r.chonVang && !r.chonPhun && r.chonTia && /Unlocks at Pilot Level 2/.test(r.loi) && r.loiOk === '' && r.nn === 0 && r.pre, 'bộ bài: ụ chưa có không vào (chọn / kéo), RANDOM chỉ ra 5 ụ đã có, bộ mẫu hiện chỉ gồm ụ đã có', JSON.stringify(r));

  // ---- 2. bể rơi + rương ----
  r = await p.evaluate(() => {
    const o = {}, s = KT.doc(), ngoai = [];
    const kt = (ra) => { for (const x of ra.the) if (!SH.trongPool(x.id)) ngoai.push(x.id); };
    // cấp 1: Rương Vàng (Vàng chưa mở) → lùi bậc; bảo hiểm Vàng/Đỏ không đếm
    const pv0 = s.ru.pv, pd0 = s.ru.pd; let vang = 0;
    for (let i = 0; i < 15; i++) { const ra = KT.moRuong('vang', true); kt(ra); vang += ra.the.filter(x => x.bac === 'vang' || x.bac === 'do').length; if (ra.the.reduce((a, x) => a + x.n, 0) < 8) o.thieu = 1; }
    o.cap1 = { vang, pv: s.ru.pv - pv0, pd: s.ru.pd - pd0 };
    o.mo1 = SH.dsCo().filter(id => SH.co(id)).every(id => SH.capMoBac(id) <= 1 || SHC.nhom[1].ds.includes(id) || SH.st().co[id]);
    // cấp 6 → mở nhóm 2–6
    const t = TT.st(); t.xp = TT.xpTong(6); const bao = TT.xetCap(); o.nhom = (bao.nhom || []).slice().sort().join();
    o.nhomDung = [2, 3, 4, 5, 6].flatMap(L => SHC.nhom[L].ds).sort().join();
    o.pool6 = TIER_LIST.map(bb => SH.pool(bb).length).join();
    // bảo hiểm Vàng: ép không ra Vàng → ≤ 10 rương có Vàng
    const goc = KTC.ruong.vang.tiLe; KTC.ruong.vang.tiLe = { trang: 50, xanh: 34, tim: 16, vang: 0, do: 0 }; s.ru.pv = 0; let n = 0, co = false;
    while (n < 12 && !co) { n++; const ra = KT.moRuong('vang', true); kt(ra); co = ra.the.some(x => x.bac === 'vang'); }
    KTC.ruong.vang.tiLe = goc; o.pity = n;
    for (const k of ['thuong', 'vang', 'su', 'hh']) for (let i = 0; i < 25; i++) kt(KT.moRuong(k, true, 2));
    // túi trận: phần "bất kỳ" chỉ trong bể
    for (let i = 0; i < 60; i++) { const m = { deck: ['tia', 'lien', 'bang', 'set', 'sungluc'], che: 'solo' }; kt(THEBAI.thuong({ wave: 40 }, m)); }
    o.sk = KT.suKien(); o.skPool = SH.pool('vang').includes(o.sk);
    o.sp = KT.sp().filter(x => !x.free).every(x => SH.trongPool(x.id));
    o.ba = ['tim', 'vang'].every(bb => TT.ba(bb, 'k' + bb).every(id => SH.trongPool(id))) && TT.ba('vang', 'qv').sort().join() === 'aten,railgun,soi';
    o.do = SH.pool('do').length; o.cd = KT.moRuong('cd', true, 1).the.map(x => x.bac).join();
    o.ngoai = ngoai.slice(0, 5);
    return o;
  });
  ok(r.cap1.vang === 0 && r.cap1.pv === 0 && r.cap1.pd === 0 && !r.thieu, 'cấp 1: Rương Vàng không ra Vàng/Đỏ (lùi bậc, đủ 8 thẻ), bảo hiểm không đếm', JSON.stringify(r.cap1));
  ok(r.nhom === r.nhomDung && r.pool6 === '14,11,7,3,0', 'lên cấp 1 → 6: báo đúng nhóm cấp 2–6, bể = 14 Trắng · 11 Xanh · 7 Tím · 3 Vàng · 0 Đỏ', JSON.stringify([r.nhom, r.pool6]));
  ok(r.pity <= 10, 'bảo hiểm Vàng giữ: Vàng chắc chắn trong ≤ 10 Rương Vàng (' + r.pity + ')', r.pity);
  ok(!r.ngoai.length && r.skPool && r.sp && r.ba, 'rương Thường/Vàng/Sự kiện/Huyền thoại, túi trận, ụ nổi bật, Daily Specials, chọn 1 trong 3 (cấp 6 = Salvo/Werewolf/Purifier): chỉ ụ trong bể', JSON.stringify(r));
  ok(r.do === 0 && !/do/.test(r.cd), 'chưa có Đỏ trong bể → Rương Cổ đại lùi về Vàng (không rơi Đỏ chưa mở)', r.cd);

  // ---- 3. Đỏ cần cấp 12 + wave 30 ----
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(); KT.doc().tk.wave = 22; try { MH.st().sw = 22; } catch (e) { }
    t.xp = TT.xpTong(12); let bao = TT.xetCap(); o.c12 = SH.mo('lophanung'); o.bao12 = (bao.nhom || []).includes('lophanung'); o.coKepha = (bao.nhom || []).includes('kepha');
    o.tt = SH.tt('lophanung'); o.ruThan = KT.moRuong('than', true).the.some(x => x.bac === 'do');
    KT.doc().tk.wave = 30; bao = TT.xetCap(); o.c30 = SH.mo('lophanung') && !SH.mo('overlord'); o.bao30 = (bao.nhom || []).join();
    o.poolDo = SH.pool('do').join(); const th = KT.moRuong('than', true); o.than = th.the.filter(x => x.bac === 'do').map(x => x.id).join();
    o.moi = th.the.some(x => x.id === 'lophanung' && x.moi);
    return o;
  });
  ok(!r.c12 && !r.bao12 && r.coKepha && r.tt === 'khoa' && !r.ruThan && r.c30 && r.bao30 === 'lophanung' && r.poolDo === 'lophanung' && r.than === 'lophanung' && r.moi,
    'Đỏ: cấp 12 + kỷ lục 22 → Cryo Reactor còn khoá; kỷ lục 30 → vào bể + báo; Thần thoại bảo đảm Đỏ đúng ụ đã mở, nhãn NEW', JSON.stringify(r));
  // bảng lên cấp: nhóm mới có hình + tên
  await p.evaluate(() => { TTUI.dong(); TT.st().bao = []; const t = TT.st(); t.xp = TT.xpTong(15); TT.xetCap(); KT.luu(true); HM.di('hm'); });
  await sleep(1600);
  r = await p.evaluate(() => { const pp = document.getElementById('tt-phu'); return { hien: !!pp && !pp.hidden, u: pp ? [...pp.querySelectorAll('.sh-nhom .sh-u')].map(e => e.textContent.trim()).join('|') : '', anh: pp ? pp.querySelectorAll('.sh-nhom .sh-u .ot-mini').length : 0, ru: !!(pp && pp.querySelector('[data-act="tt-ru"]')) }; });
  ok(r.hien && r.anh >= 10 && /Overlord/.test(r.u) && /Black Hole/.test(r.u) && r.ru, 'bảng lên cấp 15: hiện nhóm ụ cấp 13–15 (hình + tên) + nút OPEN CHEST (Rương Vàng cấp 15)', JSON.stringify(r));
  await chup('390-bang-len-cap');
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="tt-ru"]').click());
  await sleep(300); await p.evaluate(() => KTUI.boQua());
  r = await p.evaluate(() => { const pp = document.getElementById('tt-phu'); return { lat: pp.querySelectorAll('.kt-lat.mo').length, ok: !!pp.querySelector('.kt-mr-tong:not([hidden]) [data-act="tt-dong"], .kt-mr-tong:not([hidden]) [data-act="kt-ru-sau"]') }; });
  ok(r.lat >= 5 && r.ok, 'OPEN CHEST ở HOME: lật thẻ + tổng + OK đóng', JSON.stringify(r));
  await chup('390-mo-ruong-home');
  await p.evaluate(() => TTUI.dong());

  // ---- 4. người chơi cũ ----
  await vao({
    turret_best: { solo: { wave: 24 } }, turret_the: { v: 1, vang: 5000, c: { overlord: { lv: 12, n: 3 }, hydra: { lv: 9, n: 0 }, mimic: { lv: 3, n: 5 } } },
    turret_bo: { chon: ['blackhole', 'cauvong', 'tia', 'lien', 'bang'], mv: 'hero', che: 'solo' },
    turret_pre: { cur: 0, ds: [{ o: ['tudo', null, null, null, null], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }] },
    turret_hd: { xong: true },
  });
  await sleep(1200);
  r = await p.evaluate(() => {
    const o = {}; o.cap = TT.cap(); o.co = ['overlord', 'hydra', 'mimic', 'blackhole', 'cauvong', 'tudo', 'tia'].map(id => SH.co(id) ? 1 : 0).join('');
    o.chon = UI.chon.join(); o.boOk = UI.chon.every(id => !TT.khoa(id)); o.khoaKhac = TT.khoa('leviathan') && TT.khoa('railgun');
    o.mo8 = SH.mo('nemesis') && !SH.mo('khien'); o.bao = TT.st().bao.length; o.daBao = Object.keys(SH.st().bao).length;
    o.qua = SH.co('kiembang') && !!SH.st().qua.hd; o.tt = SH.tt('overlord') + ',' + SH.tt('railgun') + ',' + SH.tt('khien');
    // gộp hồ sơ Firebase: OR
    const mang = JSON.parse(JSON.stringify(KT.doc())); mang.n = 9999; mang.sh = { v: 1, co: { leviathan: 1 }, moi: {}, bao: {}, qua: { thu: 1 } };
    KT.gop({ kt: mang, the: JSON.parse(JSON.stringify(THEBAI.doc())) });
    o.gop = SH.co('leviathan') && SH.co('overlord') && SH.co('blackhole') && !!SH.st().qua.thu && !!SH.st().qua.hd; delete SH.st().qua.thu;
    return o;
  });
  ok(r.cap === 8 && r.co === '1111111' && r.chon === 'blackhole,cauvong,tia,lien,bang' && r.boOk && r.khoaKhac && r.mo8 && r.bao === 0 && r.daBao > 10 && r.qua && r.tt === 'co,chua,khoa',
    'người cũ (kỷ lục 24 → cấp 8): ụ có bản sao / trong bộ bài / bộ mẫu vẫn sở hữu, bộ bài giữ nguyên, nhóm ≤ 8 mở không báo lại, quà hướng dẫn', JSON.stringify(r));
  ok(r.gop, 'gộp hồ sơ Firebase: sở hữu / quà OR (không mất ụ khi đổi máy)', JSON.stringify(r));

  // ---- 5. hành trình: quà ụ cụ thể ----
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(), bay = KT._bay; KT._bay = () => new Date(Date.now() + 8 * 864e5);
    t.hj.ngay0 = KT.soNgay(KT.ngay()) - 7; for (const k of ['trum', 'tran', 'wave', 'sao', 'nang', 'coop', 'pvp', 'nvd', 'sp', 'sao5x', 'sao5t', 'nangV']) t.dem[k] = 99; t.dem.wave = 40; t.dem.trumMax = 9; t.trk = { a: 1, b: 1, c: 1, d: 1 }; t.xp = Math.max(t.xp, TT.xpTong(9));
    const a = TT.hjNhan(1), c = TT.hjNhan(4), d = TT.hjNhan(6);
    o.g = [a, c, d].map(x => x && x.ru && x.ru[0].k === 'qua' ? x.ru[0].the[0].id : '').join();
    o.co = ['cuongno', 'bao', 'epxung'].every(id => SH.co(id));
    KT._bay = bay; return o;
  });
  ok(r.g === 'cuongno,bao,epxung' && r.co, 'Hành trình ngày 1 / 4 / 6 tặng Berserker / Storm Gun / Overclock (lật như rương GIFT)', JSON.stringify(r));

  // ---- 6. lưới: 3 trạng thái, đếm, lọc, xếp theo cấp ----
  await p.evaluate(() => HM.di('dk')); await sleep(600);
  r = await p.evaluate(() => {
    const o = {}, c = (id) => document.querySelector('#chon-luoi .c[data-id="' + id + '"]');
    o.co = !c('tia').classList.contains('khoa'); o.chua = c('railgun').classList.contains('sh-chua') && /NOT OWNED/.test(c('railgun').textContent) && /Gold Chest/.test(c('railgun').textContent);
    o.khoa = c('khien').classList.contains('sh-khoa') && /LV 9/.test(c('khien').textContent); o.doKhoa = /WAVE 30/.test(c('lophanung').textContent);
    o.dem = (document.getElementById('dkd-nhan') || {}).textContent || '';
    return o;
  });
  const d1 = await p.evaluate(() => { const d = SH.dem(); return d; });
  ok(r.co && r.chua && r.khoa && r.doKhoa && r.dem.includes('OWNED') && r.dem.includes(String(d1.co)) && r.dem.includes(String(d1.mo)) && r.dem.includes('96'), 'lưới bộ bài: ĐÃ CÓ / CHƯA CÓ (nguồn) / CHƯA MỞ (PILOT LV 9, Đỏ + WAVE 30) + đếm OWNED · UNLOCKED · TOTAL', JSON.stringify(r));
  await chup('390-bobai');
  await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c.sh-chua'); c && c.scrollIntoView({ block: 'center' }); }); await chup('390-bobai-chua');
  // chạm ụ chưa có → trang ụ (xem được, nút Not owned)
  r = await p.evaluate(async () => { DC.chamThe(document.querySelector('#chon-luoi .c[data-id="railgun"]')); await new Promise(r => setTimeout(r, 600)); const nut = UP.el && UP.el.querySelector('.up-nut'); const o = { id: UP.id, nut: nut && nut.textContent, dis: nut && nut.disabled, chon: UI.chon.includes('railgun') }; return o; });
  ok(r.id === 'railgun' && r.dis && /Not owned/.test(r.nut) && !r.chon, 'chạm ụ chưa có → trang ụ mở xem được, nút "Not owned" + nguồn, không vào bộ', JSON.stringify(r));
  await chup('390-trang-u-chua-co'); await p.evaluate(() => { try { UP.dong(); } catch (e) { } });
  // lọc + xếp
  r = await p.evaluate(async () => {
    const o = {}, hien = () => [...document.querySelectorAll('#chon-luoi .c[data-id]')].filter(c => !c.hidden);
    HM.moLoc(); await new Promise(r => setTimeout(r, 300)); o.chips = document.querySelectorAll('#hm-tam [data-act="sh-loc"]').length; o.lv = !!document.querySelector('#hm-tam [data-act="hm-loc-xep"][data-k="cap"]');
    document.querySelector('#hm-tam [data-act="sh-loc"][data-k="co"]').click(); await new Promise(r => setTimeout(r, 200)); o.co = hien().every(c => SH.co(c.dataset.id)) && hien().length === SH.dem().co;
    document.querySelector('#hm-tam [data-act="sh-loc"][data-k="khoa"]').click(); await new Promise(r => setTimeout(r, 200)); o.khoa = hien().every(c => SH.tt(c.dataset.id) === 'khoa') && hien().length === SH.dem().tong - SH.dem().mo;
    document.querySelector('#hm-tam [data-act="sh-loc"][data-k="all"]').click();
    document.querySelector('#hm-tam [data-act="hm-loc-xep"][data-k="cap"]').click(); await new Promise(r => setTimeout(r, 300));
    const nh = [...document.querySelectorAll('#chon-luoi > .nhom')].map(e => e.textContent); o.nh = nh.length; o.dau = nh[0]; o.cuoi = nh[nh.length - 1]; o.tong = hien().length;
    return o;
  });
  ok(r.chips === 4 && r.lv && r.co && r.khoa && r.nh === 24 && /PILOT LV 1/.test(r.dau) && /PILOT LV 24/.test(r.cuoi) && r.tong === 96, 'lọc OWNED / LOCKED đúng, xếp PILOT LV: 24 nhóm có tiêu đề, đủ 96 thẻ', JSON.stringify(r));
  await p.evaluate(() => HM.dong(true)); await chup('390-bobai-xep-cap');
  await p.evaluate(() => { HM.di('hm'); HM.di('dk', true); }); await sleep(500); await chup('390-bosuutap');
  await p.evaluate(() => { UI.xep = 'bac'; UI.veChon(); HM.di('hm'); }); await sleep(400); await chup('390-home');

  // ---- 7. PVP: bộ bài người chơi hợp lệ, máy không đổi; Rương Trận ở màn kết quả ----
  r = await p.evaluate(async () => {
    const o = {}; UI.chon = ['blackhole', 'cauvong', 'tia', 'lien', 'bang']; UI.che = 'pvp';
    o.hopLe = UI.chon.every(id => !TT.khoa(id));
    batDau('pvp', UI.chon, 'hero'); await new Promise(r => setTimeout(r, 800));
    o.ban = G.ban.length; o.may = G.ban[1] && G.ban[1].deck.length; o.maHoa = THEBAI.maHoa(UI.chon).length === 6;
    return o;
  });
  ok(r.hopLe && r.ban === 2 && r.may === 5 && r.maHoa, 'PVP: bộ bài người chơi (ụ đã có) vào trận, bộ máy 5 ụ không đổi, mã cấp thẻ online như cũ', JSON.stringify(r));
  r = await p.evaluate(async () => {
    G.wave = 33; KQ.m = KQ.m || {}; ketThuc(false); await new Promise(r => setTimeout(r, 1500));
    const b = document.querySelector('#ketqua .sh-kq-ru'), o = { nut: !!b, the: document.querySelectorAll('#ketqua .tb-kq-t').length };
    if (b) { b.click(); await new Promise(r => setTimeout(r, 300)); KTUI.boQua(); await new Promise(r => setTimeout(r, 200)); }
    const pp = document.getElementById('sh-phu'); o.mo = !!pp && !pp.hidden && pp.querySelectorAll('.kt-lat.mo').length > 0; o.ten = pp && /BATTLE CHEST/.test(pp.textContent);
    return o;
  });
  ok(r.nut && r.mo && r.ten, 'màn kết quả: Rương Trận (OPEN) → lật thẻ BATTLE CHEST', JSON.stringify(r));
  await chup('390-ruong-tran');
  await p.evaluate(() => { const x = document.querySelector('#sh-phu [data-act="sh-dong"], #sh-phu [data-act="kt-ru-sau"]'); x && x.click(); SHUI.dongKq(); });

  // ---- 8. ảnh: mở rương có Đỏ + 360×780 + tiếng Việt ----
  const anh = async (w, h, lang) => {
    await ctx.close(); ctx = await b.newContext({ viewport: { width: w, height: h } }); p = await ctx.newPage(); nghe(p);
    await vao({ turret_best: { solo: { wave: 34 } }, turret_hd: { xong: true }, turret_bo: { chon: ['tia', 'lien', 'bang', 'set', 'laser'], mv: 'hero', che: 'solo' } }, lang === 'vi' ? '&lang=vi' : '');
    await sleep(1000);
    await p.evaluate(() => { TT.st().bao = []; KT.luu(true); });
    const tag = w + '-' + lang;
    await chup(tag + '-home');
    await p.evaluate(() => HM.di('dk')); await sleep(500); await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c.sh-chua'); c && c.scrollIntoView({ block: 'center' }); }); await chup(tag + '-bobai');
    await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c.sh-khoa'); c && c.scrollIntoView({ block: 'center' }); }); await chup(tag + '-bobai-khoa');
    await p.evaluate(() => { HM.di('hm'); HM.di('dk', true); }); await sleep(500); await chup(tag + '-bosuutap');
    // mở rương có Đỏ (ép 1 thẻ Đỏ + 1 thẻ mới) trong cửa hàng
    await p.evaluate(() => { HM.di('hm'); KTUI.moTab('shop'); const r = KT.moRuong('than', true); KTUI.moRuongAnim(r); });
    await sleep(3200 + 900); await chup(tag + '-mo-ruong-do');
    await p.evaluate(() => { KTUI.dongPhu(); KTUI.dong(); TT.st().bao = []; const t = TT.st(); t.xp = TT.xpTong(TT.cap() + 1) + 1; TT.xetCap(); KT.luu(true); HM.di('hm'); });
    await sleep(1600); await chup(tag + '-bang-len-cap');
    await p.evaluate(() => { const x = document.querySelector('#tt-phu [data-act="tt-dong"]'); x && x.click(); });
  };
  for (const [w, h] of [[390, 844], [360, 780]]) for (const lang of ['en', 'vi']) await anh(w, h, lang);

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(loi ? '✗ sở hữu: ' + loi + ' lỗi' : '✓ gacha thu thập (sở hữu) XANH');
  process.exit(loi ? 1 : 0);
})();
