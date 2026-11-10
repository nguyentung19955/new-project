// ASTRAL ARSENAL — KIỂM NHÃN NEW THẺ MỚI (thap/js/sohuu.js: SH.moi / SH.xemMoi / SHUI.cham + kinhte.js themBan)
//  Người dùng 10/11: "Sau khi nhận được tướng nào mới thì lần đầu vào deck hiện new ở thẻ đó".
//  ✓ nhận ụ mới (rương / quà / chọn 1 trong 3 / túi trận) → sh.moi + thẻ có NEW ở Xếp bộ bài VÀ Bộ sưu tập + chấm đỏ DECK/COLLECTION ở HOME
//  ✓ ụ đã có nhận thêm bản sao → không NEW · chạm (trang ụ) / xem nhanh → mất · đưa vào bộ bài → mất · hết NEW → hết chấm
//  ✓ tải lại trang vẫn đúng (lưu turret_kt.sh.moi) · người chơi cũ chuyển đổi lần đầu: KHÔNG NEW hàng loạt · không lỗi trang
//  Ảnh (SHOTS, mặc định /tmp/thap-the-moi): 393×852 EN + VI — HOME (chấm đỏ), bộ bài (NEW), bộ sưu tập (NEW).
// Chạy: python3 -m http.server 8765 (gốc repo) · NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-the-moi.js [BASE]
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || '/tmp/thap-the-moi';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch(); let loi = 0;
  const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (chi && !dk ? ' — ' + chi : '')); if (!dk) loi++; };
  let ctx = await b.newContext({ viewport: { width: 393, height: 852 } });
  let p = await ctx.newPage(); const errs = [];
  const nghe = (pg) => pg.on('pageerror', e => errs.push(e.message));
  nghe(p);
  const cho = async () => {
    await p.waitForFunction(() => typeof TAI !== 'undefined' && !TAI.cho && typeof SH !== 'undefined' && G.roster && G.roster.length, null, { timeout: 60000 });
    await p.waitForFunction(() => { const t = document.getElementById('tai'); return !t || t.hidden || getComputedStyle(t).display === 'none' || getComputedStyle(t).opacity === '0'; }, null, { timeout: 30000 }).catch(() => { });
    await sleep(600);
  };
  const vao = async (ls, q) => {
    await p.goto(new URL('/', BASE).href, { waitUntil: 'load' });
    await p.evaluate((ls) => { localStorage.clear(); for (const k in ls) localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])); }, ls || {});
    await p.goto(BASE + '?notut=1' + (q || ''), { waitUntil: 'load' });
    await cho();
  };
  const chup = async (ten) => { await sleep(450); await p.screenshot({ path: SHOTS + '/' + ten + '.png' }); };
  // trạng thái NEW của 1 ụ trên lưới (bộ bài / bộ sưu tập) + chấm đỏ HOME
  const xem = (ids) => p.evaluate((ids) => {
    const o = { moi: SH.dsMoi().sort().join() }, c = (id) => document.querySelector('#chon-luoi .c[data-id="' + id + '"]');
    const nhan = (id) => { const e = c(id); return !!e && e.classList.contains('sh-moi-c') && /NEW/.test(getComputedStyle(e, '::after').content || ''); };
    HM.di('dk'); TTUI.capLuoi(); o.dk = ids.map(nhan).join();
    HM.di('dk', true); TTUI.capLuoi(); o.bst = ids.map(nhan).join();
    HM.di('hm');
    const ch = [...document.querySelectorAll('#hm .hm-tab .sh-cham')]; o.cham = ch.length === 2 && ch.every(i => !i.hidden && i.getBoundingClientRect().width > 0) ? 2 : ch.filter(i => !i.hidden).length;
    return o;
  }, ids);
  const LS0 = { turret_hd: { xong: true }, turret_bo: { chon: ['tia', 'lien', 'bang', 'set', 'laser'], mv: 'hero', che: 'solo' } };

  // ---- 1. người mới: không NEW, không chấm ----
  await vao(LS0);
  await sleep(1100); await p.evaluate(() => SH.xemMoi('kiembang')); // quà hướng dẫn (Ice Blade) tặng sau khi xong HD — là ụ mới thật; bỏ để kiểm sạch
  let r = await xem(['tia', 'mana']);
  ok(r.moi === '' && r.dk === 'false,false' && r.bst === 'false,false' && r.cham === 0, 'người mới: không thẻ NEW, không chấm đỏ', JSON.stringify(r));

  // ---- 2. nhận ụ mới qua nhiều nguồn ----
  r = await p.evaluate(() => {
    const o = {};
    KT.themBan('phun', 3);                                      // rương / cửa hàng / vòng quay / quà (mọi nguồn đi qua KT.themBan)
    KT.cho({ the: { id: 'bomhen', n: 1 } }, 'kt-moi', 'event'); // thưởng sự kiện / chế độ
    KT.themBan('tia', 2);                                       // ụ đã có: không NEW
    KT.luu(true); o.moi = SH.dsMoi().sort().join(); o.tia = !!SH.st().moi.tia;
    return o;
  });
  { const t = await p.evaluate(() => { const truoc = new Set(SH.dsMoi()), m = { deck: ['tia', 'lien', 'bang', 'set', 'sungluc'], che: 'solo' }; const k = THEBAI.thuong({ wave: 5 }, m); const moi = (k.the || []).filter(x => x.moi).map(x => x.id); const ok = moi.every(id => SH.st().moi[id]) && (k.the || []).filter(x => !x.moi).every(x => truoc.has(x.id) || !SH.st().moi[x.id]); for (const id of moi) SH.xemMoi(id); return { moi, ok }; });
    ok(t.ok, 'túi trận (Rương Trận): thẻ "NEW!" = đúng thẻ được đánh dấu NEW', JSON.stringify(t)); }
  ok(r.moi === 'bomhen,phun' && !r.tia, 'nhận ụ mới (KT.themBan / KT.cho) → đánh dấu NEW; ụ đã có thêm bản sao → không', JSON.stringify(r));
  r = await xem(['phun', 'bomhen', 'tia']);
  ok(r.dk === 'true,true,false' && r.bst === 'true,true,false' && r.cham === 2, 'NEW hiện ở Xếp bộ bài + Bộ sưu tập; chấm đỏ ở DECK + COLLECTION (HOME)', JSON.stringify(r));
  await chup('393-en-home-cham');
  await p.evaluate(() => { HM.di('dk'); TTUI.capLuoi(); const c = document.querySelector('#chon-luoi .c[data-id="phun"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-en-bobai-new');
  await p.evaluate(() => { HM.di('hm'); HM.di('dk', true); TTUI.capLuoi(); const c = document.querySelector('#chon-luoi .c[data-id="bomhen"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-en-bst-new');
  await p.evaluate(() => HM.di('hm'));

  // ---- 3. tải lại trang: vẫn NEW ----
  await p.reload({ waitUntil: 'load' }); await cho();
  r = await xem(['phun', 'bomhen']);
  ok(r.moi === 'bomhen,phun' && r.dk === 'true,true' && r.bst === 'true,true' && r.cham === 2, 'tải lại trang: NEW + chấm đỏ vẫn còn', JSON.stringify(r));

  // ---- 4. chạm thẻ (trang ụ) → mất; đưa vào bộ bài → mất ----
  await p.evaluate(() => { HM.di('dk'); const c = document.querySelector('#chon-luoi .c[data-id="phun"]'); c.scrollIntoView({ block: 'center' }); }); await sleep(400);
  { const bb = await p.locator('#chon-luoi .c[data-id="phun"]').boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height * 0.6); } // chạm thật như người chơi
  await sleep(800);
  r = await p.evaluate(() => { const c = document.querySelector('#chon-luoi .c[data-id="phun"]'); const o = { chon: UI.chon.includes('phun'), moi: SH.dsMoi().sort().join(), lop: c.classList.contains('sh-moi-c') }; try { UP.dong(); } catch (e) { } try { DC.huyDoi(); } catch (e) { } return o; });
  ok(r.moi === 'bomhen' && !r.lop, 'chạm thẻ NEW ở màn bộ bài → mất NEW ngay trên lưới', JSON.stringify(r));
  r = await p.evaluate(() => { UI.chon = ['tia', 'lien', 'bang', 'set']; UI.veBoChon(); UI.chonU('bomhen'); HM.luuBo(); return { chon: UI.chon.includes('bomhen'), moi: SH.dsMoi().join() }; });
  ok(r.chon && r.moi === '', 'đưa ụ NEW vào bộ bài → mất NEW', JSON.stringify(r));
  r = await xem(['phun', 'bomhen']);
  ok(r.dk === 'false,false' && r.bst === 'false,false' && r.cham === 0, 'hết thẻ mới → không NEW, hết chấm đỏ', JSON.stringify(r));
  // xem nhanh (HM.moXem) cũng bỏ NEW
  r = await p.evaluate(() => { const id = SH.dsCo().find(x => !SH.co(x) && THEBAI.bac(x) !== 'do'); KT.themBan(id, 1); const a = SH.dsMoi().join() === id; HM.di('dk'); HM.moXem(id); const o = { id, a, b: SH.dsMoi().join() }; HM.dong(true); HM.di('hm'); return o; });
  ok(r.a && r.b === '', 'xem nhanh thẻ NEW → mất NEW', JSON.stringify(r));
  await p.reload({ waitUntil: 'load' }); await cho();
  r = await xem(['phun', 'bomhen']);
  ok(r.moi === '' && r.dk === 'false,false' && r.cham === 0, 'tải lại sau khi xem: vẫn không NEW', JSON.stringify(r));

  // ---- 5. người chơi cũ (chưa có turret_kt.sh): chuyển đổi không NEW hàng loạt ----
  await vao({
    turret_best: { solo: { wave: 24 } }, turret_the: { v: 1, vang: 5000, c: { overlord: { lv: 12, n: 3 }, hydra: { lv: 9, n: 0 }, mimic: { lv: 3, n: 5 }, railgun: { lv: 2, n: 1 } } },
    turret_bo: { chon: ['blackhole', 'cauvong', 'tia', 'lien', 'bang'], mv: 'hero', che: 'solo' }, turret_hd: { xong: true },
  });
  await sleep(1300);
  r = await p.evaluate(() => ({ co: ['overlord', 'hydra', 'mimic', 'railgun', 'blackhole'].every(id => SH.co(id)), moi: SH.dsMoi().filter(id => id !== 'kiembang').join() }));
  const r2 = await xem(['overlord', 'hydra', 'railgun']);
  ok(r.co && r.moi === '' && r2.dk === 'false,false,false' && r2.cham <= 2, 'người chơi cũ: ụ cũ vẫn sở hữu, KHÔNG NEW hàng loạt', JSON.stringify([r, r2]));

  // ---- 6. ảnh tiếng Việt ----
  await vao(LS0, '&lang=vi');
  await sleep(1100); await p.evaluate(() => SH.xemMoi('kiembang'));
  await p.evaluate(() => { KT.themBan('phun', 2); KT.themBan('bomhen', 1); KT.luu(true); HM.di('hm'); HM.ve(); });
  r = await xem(['phun']);
  ok(r.dk === 'true' && r.cham === 2, 'tiếng Việt: NEW + chấm đỏ', JSON.stringify(r));
  await chup('393-vi-home-cham');
  await p.evaluate(() => { HM.di('dk'); TTUI.capLuoi(); const c = document.querySelector('#chon-luoi .c[data-id="phun"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-vi-bobai-new');
  await p.evaluate(() => { HM.di('hm'); HM.di('dk', true); TTUI.capLuoi(); const c = document.querySelector('#chon-luoi .c[data-id="phun"]'); c && c.scrollIntoView({ block: 'center' }); }); await chup('393-vi-bst-new');

  ok(!errs.length, 'không lỗi trang', errs.slice(0, 3).join(' | '));
  await b.close();
  console.log(loi ? '✗ thẻ mới: ' + loi + ' lỗi' : '✓ nhãn NEW thẻ mới XANH');
  process.exit(loi ? 1 : 0);
})();
