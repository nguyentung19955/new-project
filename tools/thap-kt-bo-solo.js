// ASTRAL ARSENAL — KIỂM "BỎ SOLO" (10/11, người dùng chốt: LEO THÁP là chế độ một mình chính) — thap/js/chedo-c.js, home.js, tientrinh.js, kinhte.js, manh.js, thebai.js
//  ✓ HOME: PLAY vào thẳng tầng chưa qua thấp nhất của Leo Tháp (không qua bảng) · GAME MODE không còn SOLO, TOWER CLIMB đứng đầu, giữ PVP/CO-OP/ONLINE/Săn Trùm/Thử thách/Vô tận
//  ✓ bản lưu cũ chọn SOLO (turret_hm / turret_bo che 'solo') → HOME hiện TOWER CLIMB · ?mode=solo (kiểm thử) vẫn vào trận Solo
//  ✓ xong hướng dẫn: nút CLIMB · FLOOR 1 vào thẳng tầng 1
//  ✓ điều kiện Đỏ: cấp 12 + qua tầng 40 (chữ EN/VI "Tower floor 40" / "FLOOR 40") · người cũ kỷ lục Solo wave 30 giữ quyền
//  ✓ trận tầng đếm: nhiệm vụ ngày (Clear floor 15 or higher), Hành trình (tầng), nhiệm vụ tuần (trận), XP trận, điểm sự kiện, Rương Trận nhỏ khi thắng · thua: không rương
//  Ảnh 393×852 EN + VI: HOME, GAME MODE, nhiệm vụ, kết quả tầng → SHOTS (mặc định /tmp/thap-bo-solo) + ảnh ghép GHEP (mặc định /home/claude/xem/bo-solo.jpg, cần python3 PIL)
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-bo-solo.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const { execFileSync } = require('child_process');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-bo-solo';
const GHEP = process.env.GHEP || '/home/claude/xem/bo-solo.jpg';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  const mo = async (lang, ls, q) => {
    const ctx = await b.newContext({ viewport: { width: 393, height: 852 } }); const p = await ctx.newPage(); p.setDefaultTimeout(120000); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate(([lang, ls]) => { localStorage.clear(); localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); localStorage.setItem('tm_lang', lang); for (const k in ls || {}) localStorage.setItem(k, JSON.stringify(ls[k])); }, [lang, ls]);
    await p.goto(BASE + (q || '?notut=1'), { waitUntil: 'load' });
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof CD !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(800);
    return { ctx, p, errs };
  };
  const boBai = (p) => p.evaluate(() => { UI.chon = ['tia', 'lien', 'bang', 'set', 'sungluc']; HM.luuBo(); try { TTUI.dong(); } catch (e) { } HM.ve(); });
  const chup = async (p, ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  const chayHet = (p) => p.evaluate(() => {
    G.ban[0].tim = 99; let n = 0;
    while (!G.ketThuc && n < 60 * 400) { capNhat(1 / 30); for (const E of G.quai) if (!E.chet) { E.hp = 0; E.chet = true; E.tChet = 1; } if (n % 60 === 0) { try { FX.reset(); } catch (e) { } } n++; }
    return { ket: G.ketThuc && G.ketThuc.thang, wave: G.wave };
  });
  const choKq = (p) => p.waitForFunction(() => !document.getElementById('ketqua').hidden, null, { timeout: 8000 }).then(() => sleep(900));

  // ---- 1. HOME + GAME MODE (người mới, bản lưu cũ chọn SOLO) ----
  let { p, errs } = await mo('en', { turret_hm: { che: 'solo', bac: 'all' }, turret_bo: { chon: ['tia', 'lien', 'bang', 'set', 'sungluc'], mv: 'hero', che: 'solo' } });
  await boBai(p);
  let r = await p.evaluate(() => ({ che: HM.che, ten: document.getElementById('hm-che-ten').textContent, phu: document.getElementById('hm-choi-phu').textContent, mo: TT.tnMo('thap'), cap: TT.cap() }));
  ok(r.che === 'thap' && r.ten === 'TOWER CLIMB' && /Floor 1 \/ 100/.test(r.phu) && r.mo && r.cap < 5, 'bản lưu cũ chọn SOLO → HOME hiện TOWER CLIMB · Floor 1 / 100; Leo Tháp mở dưới cấp 5 (sau hướng dẫn)', JSON.stringify(r));
  await chup(p, 'en-home');
  await p.evaluate(() => document.querySelector('[data-act="hm-che"]').click()); await sleep(600);
  r = await p.evaluate(() => [...document.querySelectorAll('#hm-tam .hm-chec')].map(x => x.dataset.che));
  ok(r[0] === 'thap' && !r.includes('solo') && ['pvp', 'coop', 'online', 'thu', 'san', 'vt'].every(k => r.includes(k)), 'GAME MODE: TOWER CLIMB đầu, không SOLO, còn PVP/CO-OP/ONLINE/Thử thách/Săn Trùm/Vô tận', r.join());
  r = await p.evaluate(() => document.getElementById('hm-tam').textContent);
  ok(!/\bSOLO\b/.test(r), 'GAME MODE không còn chữ SOLO', r.slice(0, 200));
  await chup(p, 'en-che');
  await p.evaluate(() => HM.dong(true));
  // PLAY → thẳng vào tầng 1
  await p.evaluate(() => document.getElementById('hm-choi').click());
  await p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(1200);
  r = await p.evaluate(() => ({ cd: G.cd.loai + G.cd.id, che: G.che, bang: !!document.querySelector('#tt-phu.cd-p:not([hidden])') }));
  ok(r.cd === 'thap1' && r.che === 'solo' && !r.bang, 'HOME PLAY → vào thẳng Leo Tháp tầng 1 (không qua bảng tầng)', JSON.stringify(r));
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } });

  // ---- 2. trận tầng đếm nhiệm vụ / hành trình / XP / sự kiện / Rương Trận ----
  const truoc = await p.evaluate(() => ({ tran: TT.st().dem.tran | 0, sk: KT.sk().diem, xp: TT.st().xp, vang: KT.vang, best: localStorage.getItem('turret_best'), nvt: TT.nvtSt().tien.tran | 0, nvd: (KT.s.nv.tien.tran3 | 0) }));
  r = await chayHet(p); await choKq(p);
  r = await p.evaluate((t) => ({ tran: (TT.st().dem.tran | 0) - t.tran, sk: KT.sk().diem - t.sk, xp: TT.st().xp - t.xp, vang: KT.vang - t.vang, best: localStorage.getItem('turret_best') === t.best,
    ruong: !!document.querySelector('#ketqua [data-act="cd-kq-mo"]'), hj: TT.giaTri('tang'), kq: document.querySelector('#ketqua .cd-kq').textContent }), truoc);
  ok(r.tran === 1 && r.sk === 15 && r.xp === 15 && r.vang === 121 && r.best && r.ruong && r.hj === 1, 'thắng tầng 1: +1 trận (Hành trình), +15 điểm sự kiện, +15 XP, 60 + 61 vàng (lần đầu + Rương Trận nhỏ), không ghi kỷ lục Solo', JSON.stringify(r));
  await chup(p, 'en-kq-tang1');
  // nhiệm vụ ngày "Clear floor 15 or higher" + Hành trình tầng: chơi tầng 15
  await p.evaluate(() => { const s = KT.doc(); s.nv = { ngay: KT.ngay(), ds: ['wave15', 'tran3', 'thang1'], tien: {}, nhan: {}, bonus: 0, doi: 0 }; CD.st().thap.max = 14; KT.luu(true); document.querySelector('#ketqua [data-act="doibo"]').click(); });
  await sleep(400); await p.evaluate(() => CD.vao('thap', 15)); await sleep(1300); await p.evaluate(() => { try { VT.dong(); } catch (e) { } });
  r = await chayHet(p); await choKq(p);
  r = await p.evaluate(() => { const nv = KT.nv(); return { nv: nv.map(q => q.id + ':' + q.t + '/' + q.can).join(), ten: nv[0].ten, hj: TT.giaTri('tang'), tk: KT.doc().tk.tang, hjd: TT.hjDs()[2].v[2].t }; });
  ok(/wave15:15\/15/.test(r.nv) && /tran3:1\/3/.test(r.nv) && /thang1:1\/1/.test(r.nv) && r.ten === 'Clear floor 15 or higher' && r.hj === 15 && r.tk === 15 && r.hjd === 15, 'thắng tầng 15: nhiệm vụ ngày "Clear floor 15 or higher" xong, trận/thắng đếm, Hành trình ngày 3 "Clear floor 15" 15/15', JSON.stringify(r));
  // thua tầng 16: đếm trận, không rương
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await sleep(1300);
  const t2 = await p.evaluate(() => ({ tran: TT.st().dem.tran | 0, vang: KT.vang, id: G.cd && G.cd.id }));
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } G.ban[0].tim = 1; capNhat(1 / 30); G.ketThuc = null; ketThuc(false, TEXT.end.coreDown); }); await choKq(p);
  r = await p.evaluate((t) => ({ id: t.id, tran: (TT.st().dem.tran | 0) - t.tran, vang: KT.vang - t.vang, ruong: !!document.querySelector('#ketqua [data-act="cd-kq-mo"]'), kq: document.querySelector('#ketqua .cd-kq').textContent }), t2);
  ok(r.id === 16 && r.tran === 1 && r.vang === 0 && !r.ruong && /NO REWARD/.test(r.kq), 'thua tầng 16: vẫn đếm trận, không Rương Trận / vàng', JSON.stringify(r));
  await p.evaluate(() => document.querySelector('#ketqua [data-act="doibo"]').click()); await sleep(400);
  // nhiệm vụ (tab NHIỆM VỤ: Hành trình theo tầng)
  await p.evaluate(() => { TTUI.hjChon = 3; KTUI.moTab('nv'); }); await sleep(700);
  r = await p.evaluate(() => document.getElementById('kt').textContent);
  ok(/Clear floor 15/.test(r) && !/Reach wave/.test(r) && !/SOLO/.test(r), 'tab NHIỆM VỤ: mục tiêu theo tầng, không còn "Reach wave" / SOLO', '');
  await chup(p, 'en-nv');
  await p.evaluate(() => KTUI.dong());

  // ---- 3. điều kiện Đỏ theo tầng ----
  r = await p.evaluate(() => {
    const o = {}, t = TT.st(), id = KT.dsBac('do')[0];
    t.xp = TT.xpTong(12); KT.doc().tk.wave = 0; MH.st().sw = 0; CD.st().thap.max = 39; TT.xetCap(); t.bao = [];
    o.k39 = TT.bacMo('do'); o.dk = TT.dk('do'); o.sh = SH.dk('lophanung'); o.an = TT.tnMo('renDo'); o.nhan = TTUI.tnNhan('renDo');
    CD.st().thap.max = 40; o.k40 = TT.bacMo('do') && TT.tnMo('renDo') && SH.mo('lophanung');
    CD.st().thap.max = 15; KT.luu(true);
    return o;
  });
  ok(!r.k39 && !r.an && r.k40 && r.dk === 'Pilot Level 12 and Tower floor 40' && /Tower floor 40/.test(r.sh) && /FLOOR 40/.test(r.nhan), 'Đỏ: cấp 12 + tầng 39 còn khoá, tầng 40 mở (thẻ Đỏ, Lò rèn Đỏ); chữ "Tower floor 40" / nhãn FLOOR 40', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (EN)', errs.slice(0, 3).join(' | '));
  await p.context().close();

  // người cũ: kỷ lục Solo wave 30 → giữ quyền Đỏ dù chưa leo tháp
  ({ p, errs } = await mo('en', { turret_best: { solo: { wave: 31 } } }));
  r = await p.evaluate(() => ({ cap: TT.cap(), do: TT.bacMo('do'), tang: CD.st().thap.max, moc: MH.mocDs().filter(o => o.xong).map(o => o.f).join() }));
  ok(r.cap === 12 && r.do && r.tang === 0 && r.moc === '20,40', 'người cũ kỷ lục Solo wave 31: cấp 12, Đỏ vẫn mở (tầng 0), mốc Huyền thoại cũ (tầng 20/40 ≙ wave 20/30) vẫn đạt', JSON.stringify(r));
  await p.context().close();

  // ---- 4. xong hướng dẫn → CLIMB · FLOOR 1 ----
  ({ p, errs } = await mo('en', {}, '?notut=1'));
  await p.evaluate(() => { localStorage.removeItem('turret_hd'); HD.st = { xong: false, boQua: false, buoc: {} }; HD.batDau(); }); await sleep(1200);
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } HD.st.xong = true; HD.luu(); HD.dang = false; G.ketThuc = null; ketThuc(true, 'Tutorial cleared'); }); await choKq(p);
  r = await p.evaluate(() => ({ tut: KQ.m.tut, nut: document.querySelector('#ketqua [data-act="choilai"]').textContent }));
  ok(r.tut && r.nut === 'CLIMB · FLOOR 1', 'thắng hướng dẫn: nút CLIMB · FLOOR 1', JSON.stringify(r));
  await p.evaluate(() => document.querySelector('#ketqua [data-act="choilai"]').click()); await sleep(1300);
  r = await p.evaluate(() => ({ cd: G.cd && G.cd.loai + G.cd.id, tut: KQ.m.tut }));
  ok(r.cd === 'thap1' && !r.tut, '→ vào Leo Tháp tầng 1 (trận thường, không phải hướng dẫn)', JSON.stringify(r));
  ok(!errs.length, 'không lỗi trang (hướng dẫn)', errs.slice(0, 3).join(' | '));
  await p.context().close();

  // ---- 5. ?mode=solo (kiểm thử) vẫn chạy ----
  ({ p, errs } = await mo('en', {}, '?notut=1&mode=solo'));
  await sleep(1500);
  r = await p.evaluate(() => ({ ban: G.ban.length, che: G.che, cd: !!G.cd }));
  ok(r.ban > 0 && r.che === 'solo' && !r.cd, '?mode=solo: vào trận Solo kiểm thử (không lộ ra giao diện)', JSON.stringify(r));
  await p.context().close();

  // ---- 6. ảnh VI ----
  ({ p, errs } = await mo('vi'));
  await boBai(p);
  await p.evaluate(() => { CD.st().thap.max = 9; KT.luu(true); HM.ve(); }); await chup(p, 'vi-home');
  await p.evaluate(() => document.querySelector('[data-act="hm-che"]').click()); await sleep(600); await chup(p, 'vi-che');
  r = await p.evaluate(() => document.getElementById('hm-tam').textContent);
  ok(!/\bSOLO\b/.test(r) && /LEO THÁP/.test(r), 'VI: GAME MODE có LEO THÁP, không SOLO', r.slice(0, 120));
  await p.evaluate(() => { HM.dong(true); document.getElementById('hm-choi').click(); });
  await p.waitForFunction(() => G.ban.length && G.cd, null, { timeout: 30000 }); await sleep(1200);
  await p.evaluate(() => { try { VT.dong(); } catch (e) { } }); await chayHet(p); await choKq(p);
  r = await p.evaluate(() => ({ id: G.cd.id, kq: document.querySelector('#ketqua .cd-kq').textContent }));
  ok(r.id === 10 && /XP PHI CÔNG/.test(r.kq) && /SỰ KIỆN/.test(r.kq), 'VI: PLAY → tầng 10 (tầng kế), kết quả có XP phi công + điểm sự kiện tiếng Việt', JSON.stringify(r));
  await chup(p, 'vi-kq-tang10');
  await p.evaluate(() => { document.querySelector('#ketqua [data-act="doibo"]').click(); }); await sleep(400);
  await p.evaluate(() => { TTUI.hjChon = 2; KTUI.moTab('nv'); }); await sleep(700);
  r = await p.evaluate(() => document.getElementById('kt').textContent);
  ok(/Hạ trùm tầng 10/.test(r) && !/SOLO/.test(r), 'VI: tab NHIỆM VỤ — "Hạ trùm tầng 10", không SOLO', r.slice(0, 160));
  await chup(p, 'vi-nv');
  ok(!errs.length, 'không lỗi trang (VI)', errs.slice(0, 3).join(' | '));
  const thieu = await p.evaluate(() => (typeof NN !== 'undefined' && NN.thieu ? [...NN.thieu] : []).filter(s => /floor|Floor|FLOOR|Tower|TOWER/.test(s)));
  ok(!thieu.length, 'VI: không thiếu bản dịch chữ tầng / tháp', thieu.slice(0, 6).join(' | '));
  await p.context().close();
  await b.close();

  // ảnh ghép (HOME · GAME MODE · nhiệm vụ · kết quả — EN trên, VI dưới)
  try {
    const ds = ['en-home', 'en-che', 'en-nv', 'en-kq-tang1', 'vi-home', 'vi-che', 'vi-nv', 'vi-kq-tang10'].map(n => SHOTS + '/' + n + '.png');
    fs.mkdirSync(require('path').dirname(GHEP), { recursive: true });
    execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nds=[Image.open(f).convert("RGB") for f in sys.argv[2:]]\nw,h=ds[0].size\nk=0.5\ntw,th=int(w*k),int(h*k)\nim=Image.new("RGB",(tw*4,th*2),(0,0,0))\nfor i,x in enumerate(ds): im.paste(x.resize((tw,th)),((i%4)*tw,(i//4)*th))\nim.save(sys.argv[1],quality=82)', GHEP, ...ds]);
    console.log('  ảnh ghép: ' + GHEP);
  } catch (e) { console.log('  (bỏ qua ảnh ghép: ' + e.message.split('\n')[0] + ')'); }
  console.log(loi ? '✗ bỏ Solo: ' + loi + ' lỗi' : '✓ bỏ Solo đạt'); process.exit(loi ? 1 : 0);
})();
