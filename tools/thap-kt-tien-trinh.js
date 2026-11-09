// TURRET MERGE — KIỂM TIẾN TRÌNH ĐỢT 1 (js/tientrinh.js + chỉnh kinhte.js / thebai.js / manh.js) — tuvan/tien-trinh/THIET-KE.md
//  ✓ người mới: cấp 1, Trắng/Xanh mở, Tím/Vàng/Đỏ khoá; XP = wave + 3×trùm + 10 thắng; lên cấp phát thưởng 1 lần; cấp 3/6/12 mở Tím/Vàng/Đỏ (Đỏ cần kỷ lục 30)
//  ✓ bộ bài không nhận ụ khoá (UI.chonU, DK.loi, chạm thẻ lưới), thẻ khoá có nhãn điều kiện, bộ ngẫu nhiên chỉ ra ụ đã mở
//  ✓ người chơi cũ: kỷ lục 35 → cấp 12 (mở hết) · kỷ lục 22 → cấp 8, Đỏ trong bộ vẫn dùng được, Đỏ khác khoá · thành tựu (s.tt) không bị đè
//  ✓ hành trình 7 ngày: mở theo ngày, nhận 1 lần, chọn 1 trong 3 chỉ nhận thẻ hợp lệ, không có Đỏ
//  ✓ nhiệm vụ ngày lọc theo kỷ lục (thay "Reach wave 30" của người chưa đạt) + đổi 1 lần/ngày · nhiệm vụ tuần (cấp 8, 140 ngọc/tuần)
//  ✓ túi thưởng trần 14 (wave 68) · Đỏ vào thẻ trong bộ ~37% · mốc Đỏ sự kiện 3 600 · Ấn Vàng 6:1 + 20 000 vàng, 1/tuần · bộ đếm bảo hiểm
//  ✓ gộp hồ sơ Firebase (XP lớn nhất, cờ OR, bản mạng cũ chưa có cấp → quy đổi) · không lỗi trang · ảnh 390×844
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-tien-trinh.js [BASE]  (ảnh: SHOTS=… mặc định /tmp/thap-tien-trinh)
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-tien-trinh';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const vao = async (ls) => {
    await p.goto(BASE + '?notut=1', { waitUntil: 'commit' });
    await p.evaluate((ls) => { localStorage.clear(); for (const k in ls) localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])); }, ls || {});
    await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof TT !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { }); // màn tải đã tắt (ảnh chụp không dính màn tải)
    await sleep(400);
  };
  const chup = async (ten) => { await sleep(500); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const HD = { turret_hd: { xong: true } };

  // ---- 1. người mới ----
  await vao({});
  let r = await p.evaluate(() => {
    const t = TT.st(), id = (b) => KT.dsBac(b)[0];
    const o = { cu: t.cu, cap: TT.cap(), mo: ['trang', 'xanh', 'tim', 'vang', 'do'].map(b => TT.bacMo(b)), khoaVang: TT.khoa(id('vang')), khoaTrang: TT.khoa(id('trang')) };
    // XP: wave + 3×trùm + 10 thắng
    const v0 = KT.vang, n0 = KT.ngoc;
    KT.batTran('solo'); const a = KT.ketTran({ wave: 20, thang: false }, { trum: 2, che: 'solo' });
    o.xp1 = a.tt.xp; o.cap1 = TT.cap();
    KT.batTran('solo'); const c = KT.ketTran({ wave: 40, thang: true }, { trum: 4, che: 'solo' });
    o.xp2 = c.tt.xp; o.cap2 = TT.cap(); o.xpTong = t.xp;
    o.dv = KT.vang - v0 - (10 * 20 + 40 * 2) - (10 * 40 + 40 * 4 + 150); o.dn = KT.ngoc - n0;
    o.bao = t.bao.length; o.moTim = TT.bacMo('tim'); o.lenTim = (t.bao[t.bao.length - 1] || {}).mo;
    return o;
  });
  ok(r.cu === 0 && r.cap === 1 && r.mo.join() === 'true,true,false,false,false' && r.khoaVang && !r.khoaTrang, 'người mới: cấp 1, Trắng/Xanh mở, Tím/Vàng/Đỏ khoá', JSON.stringify(r));
  ok(r.xp1 === 26 && r.xp2 === 62 && r.xpTong === 88 && r.cap1 === 1 && r.cap2 === 3, 'XP = wave + 3×trùm + 10 thắng (26, 62) → cấp 3 ở 85 XP', JSON.stringify(r));
  // KT.ketTran không cộng túi thưởng (thebai.js làm) → chỉ còn thưởng cấp 2 + 3 = 150·2 + 150·3 vàng, 40 ngọc
  r.dv2 = r.dv + (10 * 20 + 40 * 2) + (10 * 40 + 40 * 4 + 150);
  ok(r.dv2 === 750 && r.dn === 40 && r.moTim && r.lenTim && r.lenTim.includes('tim'), 'thưởng cấp 2–3 (750 vàng, 40 ngọc) + thông báo mở Tím', JSON.stringify(r));
  await chup('home-cap');
  // thông báo lên cấp hiện ở HOME
  r = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 1200)); const pp = document.getElementById('tt-phu'); return { hien: !!pp && !pp.hidden, chu: pp && pp.textContent.slice(0, 80), con: TT.st().bao.length }; });
  ok(r.hien && /PILOT LEVEL 3/.test(r.chu) && r.con === 0, 'HOME hiện thông báo lên cấp + mở khoá rồi xoá hàng chờ', JSON.stringify(r));
  await chup('home-bao');
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="tt-dong"].kt-ok').click());

  // ---- 2. cấp 6 / 12 / Đỏ cần kỷ lục ----
  r = await p.evaluate(() => {
    const t = TT.st(), o = {};
    t.xp = TT.xpTong(6); TT.xetCap(); o.vang = TT.bacMo('vang'); o.qvCho = !t.qv && TT.cap() === 6;
    const ba = TT.ba('vang', 'qv'); o.ba = ba.length === 3 && ba.every(id => THEBAI.bac(id) === 'vang');
    o.sai = TT.qvNhan(KT.dsBac('do')[0]) === null; const n0 = THEBAI.the(ba[1]).n; o.dung = !!TT.qvNhan(ba[1]) && THEBAI.the(ba[1]).n === n0 + 1; o.lan2 = TT.qvNhan(ba[0]) === null;
    KT.doc().tk.wave = 20; MH.st().sw = 20; t.xp = TT.xpTong(12); TT.xetCap(); o.do12 = TT.bacMo('do'); // kỷ lục < 30 → Đỏ còn khoá
    KT.doc().tk.wave = 30; o.do30 = TT.bacMo('do'); const bb = TT.xetCap(); o.baoDo = bb.mo.includes('do');
    o.cap5Ruong = TTC.thuongCap(5).some(x => x.ruong === 'vang') && TTC.thuongCap(4).length === 1;
    return o;
  });
  ok(r.vang && r.qvCho && r.ba && r.sai && r.dung && r.lan2, 'cấp 6: mở Vàng + quà chọn 1 trong 3 thẻ Vàng (chỉ thẻ trong 3, 1 lần)', JSON.stringify(r));
  ok(!r.do12 && r.do30 && r.baoDo && r.cap5Ruong, 'Đỏ cần cấp 12 VÀ kỷ lục ≥ 30 (thông báo khi đủ) · cấp 5/10… có Rương Vàng', JSON.stringify(r));

  // ---- 3. bộ bài không nhận ụ khoá ----
  await vao(HD); // có turret_hd → người chơi cũ cấp 3 (Vàng/Đỏ khoá)
  r = await p.evaluate(async () => {
    const o = {}, v = KT.dsBac('vang')[0], tr = KT.dsBac('trang')[0];
    o.cap = TT.cap(); o.khoa = TT.khoa(v);
    UI.chon = []; UI.chonU(v); o.chonU = UI.chon.includes(v);
    o.loi = DK.loi([], v); o.loiTrang = DK.loi([], tr);
    document.querySelector('[data-act=hm-deck]').click(); await new Promise(r => setTimeout(r, 400));
    const c = document.querySelector('#chon-luoi .c[data-id="' + v + '"]'); o.the = !!c && c.classList.contains('tt-khoa') && /PILOT/.test(c.textContent) && /LV 6/.test(c.textContent);
    DC.chamThe(c); o.cham = UI.chon.includes(v);
    await new Promise(r => setTimeout(r, 500)); // chạm ụ khoá → trang chi tiết mở (xem được), nút "Locked" + điều kiện, bấm không được
    const nut = UP.el && UP.el.querySelector('.up-nut'); o.xem = UP.id === v && !!nut && nut.disabled && /Pilot Level 6/.test(nut.textContent);
    try { UP.dong(); } catch (e) { } await new Promise(r => setTimeout(r, 300));
    for (let i = 0; i < 20; i++) { UI.chon = []; DC.o = [null, null, null, null, null]; DC.ngauNhien(); if (UI.chon.some(id => TT.khoa(id))) o.nn = 1; }
    return o;
  });
  ok(r.cap === 3 && r.khoa && !r.chonU && /Pilot Level 6/.test(r.loi) && r.loiTrang === '' && r.the && !r.cham && r.xem && !r.nn, 'bộ bài: ụ khoá không vào được (chọn/kéo/chạm), chạm → trang chi tiết xem được (nút Locked), thẻ khoá ghi "PILOT LV 6", RANDOM chỉ ra ụ đã mở', JSON.stringify(r));
  await p.evaluate(() => { const v = KT.dsBac('vang')[0]; DC.chamThe(document.querySelector('#chon-luoi .c[data-id="' + v + '"]')); });
  await chup('up-khoa'); await p.evaluate(() => { try { UP.dong(); } catch (e) { } });
  await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c.tt-khoa'); c && c.scrollIntoView({ block: 'center' }); });
  await chup('bobai-khoa');

  // ---- 4. người chơi cũ ----
  const doDs = await p.evaluate(() => KT.dsBac('do'));
  const vangDs = await p.evaluate(() => KT.dsBac('vang'));
  await vao({ turret_best: { solo: { wave: 35 } }, turret_the: { v: 1, vang: 999, c: {} } });
  r = await p.evaluate(() => ({ cap: TT.cap(), cu: TT.st().cu, mo: ['tim', 'vang', 'do'].map(b => TT.bacMo(b)).join(), tt: typeof KT.doc().tt, ttOk: KT.tt().length > 0, qv: TT.st().qv, nhan: TT.st().nhanCap }));
  ok(r.cap === 12 && r.cu === 12 && r.mo === 'true,true,true' && r.tt === 'object' && r.ttOk && r.qv === 1 && r.nhan === 12, 'người cũ kỷ lục 35 → cấp 12, mở hết, không phát lại thưởng cấp cũ, thành tựu còn nguyên', JSON.stringify(r));
  await vao({ turret_best: { solo: { wave: 22 } }, turret_bo: { chon: [doDs[0], vangDs[0], 'tia', 'lien', 'bang'], mv: 'hero', che: 'solo' }, turret_pre: { cur: 0, ds: [{ o: [doDs[1], null, null, null, null], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }, { o: [], mv: 'hero' }] } });
  r = await p.evaluate((dd) => ({ cap: TT.cap(), deckDo: TT.khoa(dd[0]), preDo: TT.khoa(dd[1]), khacDo: TT.khoa(dd[2]), vang: TT.bacMo('vang'), chon: UI.chon.slice(), ok: DK.loi([], dd[2]) !== '' }), doDs);
  ok(r.cap === 8 && !r.deckDo && !r.preDo && r.khacDo && r.vang && r.chon.includes(doDs[0]) && r.ok, 'người cũ kỷ lục 22 → cấp 8: Đỏ trong bộ + bộ mẫu vẫn dùng được, Đỏ khác khoá', JSON.stringify(r));
  await vao({ tm_hoso: { bestWave: 12, wins: 1 } });
  r = await p.evaluate(() => TT.cap());
  ok(r === 5, 'người cũ kỷ lục 12 → cấp 5', r);

  // ---- 5. hành trình 7 ngày ----
  await vao({});
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(), g0 = KT.soNgay(KT.ngay());
    o.ngay1 = TT.hjNgay(); o.d2khoa = !TT.hjDs()[1].mo;
    o.chuaXong = TT.hjNhan(1) === null;
    for (let i = 0; i < 3; i++) { KT.batTran('solo'); KT.ketTran({ wave: 16, thang: false }, { trum: 1, che: 'solo' }); }
    o.xong1 = TT.hjDs()[0].xong; const v0 = KT.vang, n0 = KT.ngoc; const ra = TT.hjNhan(1); o.ra = !!ra && KT.vang - v0 === 500 && KT.ngoc - n0 === 30 && ra.the.length === 1 && THEBAI.bac(ra.the[0].id) === 'xanh';
    o.lan2 = TT.hjNhan(1) === null;
    // ngày 3: chọn 1 trong 3 Sử thi
    t.dem.coop = 1; t.trk = { a: 1, b: 1 }; t.dem.wave = 20; o.d3khoa = TT.hjNhan(3, TT.ba('tim', 'hj3')[0]) === null; // ngày 3 chưa mở
    const bay = KT._bay; KT._bay = () => new Date(Date.now() + 2 * 864e5 + 3600e3); o.ngay3 = TT.hjNgay();
    const ba = TT.ba('tim', 'hj3'); o.ba = ba.length === 3 && ba.every(id => THEBAI.bac(id) === 'tim');
    o.sai = TT.hjNhan(3, KT.dsBac('tim').find(id => !ba.includes(id))) === null;
    const n1 = THEBAI.the(ba[2]).n; o.dung = !!TT.hjNhan(3, ba[2]) && THEBAI.the(ba[2]).n === n1 + 4;
    KT._bay = bay;
    o.khongDo = JSON.stringify(TTC.hj).indexOf("'do'") < 0 && !TTC.hj.some(d => (d.r.the && d.r.the.bac === 'do') || (d.r.chon && d.r.chon.bac === 'do'));
    o.koCach = TTC.hj.every(d => d.v.every(v => !/jackpot|resonan|link|mana|cộng hưởng/i.test(v[2])));
    return o;
  });
  ok(r.ngay1 === 1 && r.d2khoa && r.chuaXong && r.xong1 && r.ra && r.lan2, 'hành trình ngày 1: 3 việc → 500 vàng + 30 ngọc + 10 bản Xanh, nhận 1 lần; ngày 2 khoá', JSON.stringify(r));
  ok(r.d3khoa && r.ngay3 === 3 && r.ba && r.sai && r.dung && r.khongDo && r.koCach, 'ngày 3 mở theo lịch, chọn 1 trong 3 Sử thi (chỉ thẻ hợp lệ, +4 bản), không có Đỏ, việc chỉ nêu kết quả', JSON.stringify(r));
  await p.evaluate(() => { KTUI.moTab('nv'); });
  await chup('nhiemvu-hanhtrinh');

  // ---- 5b. ngày 5/6: mục tiêu thay thế cùng độ khó + làm bù ngày đã qua (tư vấn CHATGPT-THU-PHI.md) ----
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(), bay = KT._bay;
    KT._bay = () => new Date(Date.now() + 7 * 864e5 + 3600e3); // đã sang ngày 8: ngày 5/6 vẫn làm bù được
    t.dem.wave = 25; t.dem.trumMax = 2; t.dem.sao5x = 1; t.dem.sao5t = 0;
    o.d5chua = !TT.hjDs()[4].xong;
    for (let i = 0; i < 3; i++) { KT.batTran('solo'); KT.tran.sao5 = 2; KT.ketTran({ wave: 12, thang: false }, { trum: 0, che: 'solo' }); } // 6 ụ 5★ cộng dồn, chưa từng có 2 ụ 5★ cùng lúc
    const d5 = TT.hjDs()[4]; o.sao5t = t.dem.sao5t; o.d5 = d5.mo && d5.xong && d5.v[2].alt && d5.v[2].alt.xong && !(d5.v[2].t >= d5.v[2].can);
    o.d5nhan = !!TT.hjNhan(5);
    t.dem.pvp = 1; t.dem.nvd = 3; t.dem.tran = 24; o.d6chua = !TT.hjDs()[5].xong && TT.cap() < 9;
    t.dem.tran = 25; o.d6 = TT.hjDs()[5].xong && TT.cap() < 9; o.d6nhan = !!TT.hjNhan(6);
    o.chiNgay56 = TTC.hj.filter(d => d.v.some(v => v[3])).length === 2 && !!TTC.hj[4].v[2][3] && !!TTC.hj[5].v[2][3];
    o.altKoCach = TTC.hj.every(d => d.v.every(v => !v[3] || !/jackpot|resonan|link|mana/i.test(v[3][2])));
    KT._bay = bay; TTUI.hjChon = 5; KTUI.moTab('nv');
    o.hoac = !!document.querySelector('#kt .tt-hoac');
    return o;
  });
  ok(r.d5chua && r.sao5t === 6 && r.d5 && r.d5nhan && r.d6chua && r.d6 && r.d6nhan && r.chiNgay56 && r.altKoCach && r.hoac, 'ngày 5/6 có mục tiêu thay thế (6 ụ 5★ cộng dồn / 25 trận), làm bù sau ngày 7 được, hiện dòng "or …"', JSON.stringify(r));
  await p.evaluate(() => { TT.st().hj.nhan[5] = 0; delete TT.st().hj.nhan[5]; TTUI.hjChon = 5; KTUI.ve(); const e = document.querySelector('#kt .tt-hoac'); if (e) e.scrollIntoView({ block: 'center' }); });
  await chup('nhiemvu-ngay5');

  // ---- 6. nhiệm vụ ngày lọc + đổi ----
  r = await p.evaluate(() => {
    const s = KT.doc(), o = {};
    s.tk.wave = 5; o.be5 = KT.nvBe().map(q => q.id);
    s.tk.wave = 29; o.be29 = KT.nvBe().map(q => q.id);
    s.tk.wave = 5; s.nv = { ngay: KT.ngay(), ds: ['wave30', 'tran3', 'ghep30'], tien: {}, nhan: {}, bonus: 0 };
    o.thay = KT.nv().map(q => q.id);
    const id = o.thay[1]; o.doi = KT.nvDoi(id); o.sau = KT.nv().map(q => q.id); o.lan2 = KT.nvDoi(o.sau[2]) === null;
    return o;
  });
  ok(!r.be5.includes('wave30') && !r.be5.includes('wave15') && !r.be5.includes('trum2') && r.be29.includes('wave30') && r.be29.includes('trum2'), 'bể nhiệm vụ ngày lọc theo kỷ lục (wave15 ≥12, trum2 ≥20, wave30 ≥28)', JSON.stringify(r));
  ok(!r.thay.includes('wave30') && r.thay.includes('tran3') && r.doi && !r.sau.includes('tran3') && r.sau.includes(r.doi) && r.lan2, 'danh sách cũ có "Reach wave 30" → thay ngay; đổi 1 nhiệm vụ/ngày (lần 2 bị chặn)', JSON.stringify(r));

  // ---- 7. nhiệm vụ tuần ----
  r = await p.evaluate(() => {
    const t = TT.st(), o = {};
    o.khoa = !TT.nvtMo(); KT.batTran('solo'); KT.ketTran({ wave: 10 }, { trum: 1, che: 'solo' }); o.khongDem = !(TT.nvtSt().tien.tran > 0);
    t.xp = TT.xpTong(8); TT.xetCap(); o.mo = TT.nvtMo();
    KT.doc().tk.wave = 30; KT.batTran('solo'); KT.ketTran({ wave: 26 }, { trum: 2, che: 'solo' }); const e = TT.nvtSt(); o.dem = [e.tien.tran, e.tien.trum, e.tien.gan | 0].join();
    KT.batTran('solo'); KT.ketTran({ wave: 20 }, { trum: 0, che: 'solo' }); o.gan2 = TT.nvtSt().tien.gan;
    for (const q of TTC.nvt) e.tien[q.id] = q.can;
    const n0 = KT.ngoc; for (const q of TTC.nvt) TT.nvtNhan(q.id); o.lan2 = TT.nvtNhan('tran') === null;
    const vb = KT.dsBac('vang').reduce((a, id) => a + THEBAI.the(id).n, 0); TT.nvtBonus(); o.ngoc = KT.ngoc - n0; o.vang1 = KT.dsBac('vang').reduce((a, id) => a + THEBAI.the(id).n, 0) - vb; o.b2 = TT.nvtBonus() === null;
    return o;
  });
  ok(r.khoa && r.khongDem && r.mo && r.dem === '1,2,1' && r.gan2 === 1 && r.lan2 && r.ngoc === 140 && r.vang1 === 1 && r.b2, 'nhiệm vụ tuần: mở cấp 8, đếm trận/trùm/gần kỷ lục, 5×20 + 40 = 140 ngọc + 1 bản Vàng, nhận 1 lần', JSON.stringify(r));
  await p.evaluate(() => { KTUI.moTab('nv'); const e = [...document.querySelectorAll('#kt .kt-muc')].find(x => /WEEKLY/.test(x.textContent)); e && e.scrollIntoView(); });
  await chup('nhiemvu-tuan');

  // ---- 8. kinh tế ----
  r = await p.evaluate(() => {
    const o = {};
    o.luot = [1, 10, 20, 30, 36, 44, 52, 60, 68, 90].map(w => THEBAI.soLuot(w)).join();
    // Đỏ trong bộ: ép mọi lượt ra Đỏ, đếm phần rơi vào thẻ Đỏ trong bộ
    const goc = THE.tiLe, dd = KT.dsBac('do'), d0 = dd[0]; THE.tiLe = [['do', 100]]; let trong = 0, tong = 0;
    const mr = Math.random; let sd = 7; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 300; i++) { const m = { deck: [d0, 'tia', 'lien', 'bang', 'set'], che: 'solo' }; const before = THEBAI.the(d0).n; const x = THEBAI.thuong({ wave: 40 }, m); for (const t of x.the) tong += t.n; trong += THEBAI.the(d0).n - before; }
    Math.random = mr; THE.tiLe = goc; o.tiDo = trong / tong; o.lyThuyet = 0.3 + 0.7 / dd.length;
    o.sk = KTC.sk.map(([d, r]) => d + ':' + (r.the && r.the.bac === 'do' ? 'DO' : '')).join(' ');
    o.skDo = KTC.sk.filter(([d, r]) => r.the && r.the.bac === 'do').map(x => x[0]).join();
    return o;
  });
  ok(r.luot === '1,3,6,8,10,11,12,13,14,14', 'túi thưởng: 3/6/8/10 ở wave 10/20/30/36, 11/12/13 ở 44/52/60, trần 14 ở 68+', r.luot);
  ok(Math.abs(r.tiDo - r.lyThuyet) < 0.08, 'bản Đỏ vào thẻ trong bộ ≈ ' + (r.tiDo * 100).toFixed(0) + '% (lý thuyết ' + (r.lyThuyet * 100).toFixed(0) + '%, cũ 55%)', JSON.stringify(r));
  ok(r.skDo === '3600' && /1700:(?!DO)/.test(r.sk) && /2300:/.test(r.sk), 'sự kiện tuần: mốc Đỏ 1 700 → 3 600, thêm mốc 2 300', r.sk);
  r = await p.evaluate(() => {
    const o = {}, vd = KT.dsBac('vang'), d = THEBAI.doc();
    for (const id of vd) d.c[id] = { lv: THE.lvDau.vang, n: 0 };
    d.c[vd[0]] = { lv: 17, n: 2 }; // thẻ MAX: lấy trước
    d.c[vd[1]] = { lv: 9, n: 3 }; d.c[vd[2]] = { lv: 9, n: 3 };
    UI.chon = [vd[2], 'tia', 'lien', 'bang', 'set'];
    d.vang = 19999; o.thieuVang = !MH.anTt().duoc;
    d.vang = 50000; o.duoc = MH.anTt().duoc;
    o.lay = JSON.stringify(MH.anNguon(vd[5]));
    const n5 = THEBAI.the(vd[5]).n, ra = MH.an(vd[5]);
    o.ra = !!ra && THEBAI.the(vd[5]).n === n5 + 1 && THEBAI.the(vd[0]).n === 0 && THEBAI.the(vd[1]).n === 0 && THEBAI.the(vd[2]).n === 2 && d.vang === 30000;
    d.c[vd[3]] = { lv: 9, n: 10 }; o.tuan2 = MH.an(vd[6]) === null && !MH.anTt().duoc;
    d.c[vd[3]] = { lv: 9, n: 0 }; d.c[vd[4]] = { lv: 9, n: 5 };
    return o;
  });
  ok(r.thieuVang && r.duoc && r.ra && r.tuan2, 'Ấn Vàng: 6 bản Vàng thừa (thẻ MAX → ngoài bộ → trong bộ) + 20 000 vàng → 1 bản tự chọn, 1 lần/tuần', JSON.stringify(r));
  r = await p.evaluate(async () => { const s = KT.doc(); s.ru.pv = 3; s.ru.pd = 17; KTUI.moTab('shop'); await new Promise(r => setTimeout(r, 200)); const c = document.querySelector('#kt .kt-rc-vang small'); const e = [...document.querySelectorAll('#kt .kt-muc')].find(x => /CHESTS/.test(x.textContent)); e && e.scrollIntoView(); return c && c.textContent; });
  ok(/Legendary in ≤ 7/.test(r) && /Mythic in ≤ 103/.test(r), 'Rương Vàng hiện bộ đếm bảo hiểm Vàng + Đỏ', r);
  await chup('shop-baohiem-an');
  await p.evaluate(() => { document.querySelector('[data-act=kt-mha]') && document.querySelector('[data-act=kt-mha]').click(); });
  await chup('shop-an-chon');

  // ---- 9. gộp hồ sơ Firebase ----
  await vao({});
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(); t.xp = 100; t.hj.nhan = { 1: 1 }; t.dem.tran = 5;
    const may = JSON.parse(JSON.stringify(KT.doc()));
    const mang = JSON.parse(JSON.stringify(may)); mang.n = 999; mang.cp = Object.assign({}, mang.cp, { xp: 600, hj: { ngay0: t.hj.ngay0 - 3, nhan: { 2: 1 } }, dem: { tran: 2, wave: 30 }, giu: { abc: 1 } });
    KT.gop({ kt: mang, the: THEBAI.doc() });
    const u = TT.st(); o.xp = u.xp; o.nhan = Object.keys(u.hj.nhan).join(); o.ngay0 = u.hj.ngay0 === t.hj.ngay0 - 3 || u.hj.ngay0 < t.hj.ngay0; o.tran = u.dem.tran; o.wave = u.dem.wave; o.giu = !!u.giu.abc;
    // bản mạng của bản game cũ (chưa có cp), kỷ lục 40 → quy đổi cấp 12
    const cu = JSON.parse(JSON.stringify(KT.doc())); delete cu.cp; cu.n = 5000; cu.tk.wave = 40;
    KT.gop({ kt: cu, the: THEBAI.doc() }); o.capCu = TT.cap(); o.coCp = !!KT.doc().cp;
    return o;
  });
  ok(r.xp === 600 && r.nhan === '1,2' && r.ngay0 && r.tran === 5 && r.wave === 30 && r.giu && r.capCu === 12 && r.coCp, 'gộp hồ sơ Firebase: XP/đếm lớn nhất, cờ hành trình OR, bản mạng cũ kỷ lục 40 → cấp 12', JSON.stringify(r));

  // ---- 10. thông báo lên cấp + chọn quà ở HOME ----
  await vao(HD);
  await p.evaluate(() => { const t = TT.st(); t.xp = TT.xpTong(6) + 5; TT.xetCap(); KT.luu(true); });
  await sleep(1500);
  r = await p.evaluate(() => { const pp = document.getElementById('tt-phu'); return pp && !pp.hidden && /PILOT LEVEL 6/.test(pp.textContent) && !!pp.querySelector('[data-act="tt-qvmo"]'); });
  ok(r, 'lên cấp 6 ở HOME: thông báo + nút chọn quà Vàng');
  await chup('home-cap6');
  await p.evaluate(() => document.querySelector('#tt-phu [data-act="tt-qvmo"]').click());
  await chup('home-cap6-chon');
  r = await p.evaluate(() => { const b = document.querySelector('#tt-phu [data-act="tt-qvc"]'); const id = b && b.dataset.id, n0 = id && THEBAI.the(id).n; b && b.click(); return { id, ok: !!id && THEBAI.the(id).n === n0 + 1 && TT.st().qv === 1 }; });
  ok(r.ok, 'chọn quà cấp 6 → +1 bản thẻ Vàng đã chọn', JSON.stringify(r));

  ok(errs.length === 0, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(loi ? '✗ tiến trình: ' + loi + ' lỗi' : '✓ tiến trình đợt 1 XANH');
  process.exit(loi ? 1 : 0);
})();
