const { chromium } = require('playwright');
const [W, H] = (process.argv[2] || '390x844').split('x').map(Number);
const FR = process.argv[3] === 'frames';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: FR ? 2 : 1 });
  const p = await ctx.newPage(); const er = [];
  p.on('pageerror', e => er.push(e.message)); p.on('console', m => { if (m.type() === 'error') er.push('c:' + m.text()); });
  await p.goto('http://localhost:8765/thap/', { waitUntil: 'load' });
  await p.waitForTimeout(2000);
  await p.locator('.hd-bo').tap(); await p.waitForTimeout(3500);
  const cdp = await ctx.newCDPSession(p);
  const sleep = (ms) => p.waitForTimeout(ms);
  let fi = 0; const shot = async (n) => { if (FR) await p.screenshot({ path: 'f_' + String(fi++).padStart(2, '0') + '_' + n + '.png' }); };
  const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  async function keo(a, z, { giu = 0, buoc = 12, ms = 16, ngang = 0, chup = '' } = {}) {
    await T('touchStart', a.x, a.y); if (giu) await sleep(giu);
    let x = a.x, y = a.y;
    if (ngang) { for (let i = 1; i <= 3; i++) { x = a.x + ngang * i / 3; await T('touchMove', x, y); await sleep(ms); } }
    for (let i = 1; i <= buoc; i++) { const xx = x + (z.x - x) * i / buoc, yy = y + (z.y - y) * i / buoc; await T('touchMove', xx, yy); await sleep(ms); if (chup && (i === Math.round(buoc / 2) || i === buoc)) await shot(chup + i); }
    await T('touchEnd'); await sleep(320);
  }
  const ctr = (sel, i = 0) => p.evaluate(([s, i]) => { const e = document.querySelectorAll(s)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .4 }; }, [sel, i]);
  const the = (id) => p.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); c.scrollIntoView({ block: 'center' }); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .4 }; }, id);
  const deck = () => p.evaluate(() => UI.chon.slice());
  const ok = (n, v) => { console.log((v ? 'OK  ' : 'FAIL') + ' ' + n); if (!v) process.exitCode = 1; };
  // chuẩn bị: bộ 3 ụ, không Đỏ
  const ids = await p.evaluate(() => {
    const co = G.roster.filter(r => SKILLS[r.id] && !THAO_TUNG_SAO.has(r.id) && document.querySelector('#chon-luoi .c[data-id="' + r.id + '"]'));
    const thuong = co.filter(r => r.bac !== 'do').map(r => r.id), do_ = co.filter(r => r.bac === 'do').map(r => r.id);
    UI.chon = thuong.slice(0, 3); UI.veBoChon(); HM.di('dk');
    return { thuong, do_ };
  });
  await sleep(500); await shot('dau');
  // 1) thẻ → ô trống (giữ 220 ms rồi kéo lên)
  let a = ids.thuong[5];
  await keo(await the(a), await ctr('#chon-bo .o-bo', 3), { giu: 230, chup: 'them' });
  let d = await deck(); ok('the→o trong (giu)', d[3] === a && d.length === 4); await shot('sau-them');
  // 1b) thẻ → ô trống bằng đi ngang trước
  let a2 = ids.thuong[6];
  await keo(await the(a2), await ctr('#chon-bo .o-bo', 4), { ngang: 24 });
  d = await deck(); ok('the→o trong (ngang)', d[4] === a2 && d.length === 5);
  // 2) thẻ → ô có ụ = đổi
  const cu = d[0], b2 = ids.thuong[7];
  await keo(await the(b2), await ctr('#chon-bo .o-bo', 0), { giu: 220, chup: 'doi' });
  d = await deck(); ok('the→o day (swap)', d[0] === b2 && !d.includes(cu) && d.length === 5); await shot('sau-doi');
  // 3) ô → ô
  const x0 = d[0], x2 = d[2];
  await keo(await ctr('#chon-bo .o-bo', 0), await ctr('#chon-bo .o-bo', 2), { chup: 'oo' });
  d = await deck(); ok('o→o (doi cho)', d[0] === x2 && d[2] === x0);
  // 4) ô → lưới = bỏ
  const bo = d[1];
  const gl = await p.evaluate(() => { const r = document.getElementById('chon-luoi').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .45 }; });
  await keo(await ctr('#chon-bo .o-bo', 1), gl, { chup: 'bo' });
  d = await deck(); ok('o→luoi (bo)', !d.includes(bo) && d.length === 4); await shot('sau-bo');
  // 4b) vuốt nhanh xuống từ ô = bỏ
  const bo2 = d[3], o3 = await ctr('#chon-bo .o-bo', 3);
  await p.evaluate(() => { const g = DK.tha.bind(DK); DK.tha = function () { const k = this.keo; console.log('THA ' + JSON.stringify(k.mau.map(m=>[Math.round(m[0]),Math.round(m[1])])) + ' now=' + Math.round(performance.now()) + ' y0=' + k.y0 + ' luoi=' + this.trenLuoi()); return g(); }; }); p.on('console', m => /THA/.test(m.text()) && console.log(m.text()));
  await T('touchStart', o3.x, o3.y); await Promise.all([1, 2, 3, 4, 5, 6].map(i => T('touchMove', o3.x, o3.y + i * 18))); await T('touchEnd'); await sleep(400);
  d = await deck(); ok('o vuot xuong (bo)', !d.includes(bo2) && d.length === 3);
  // 5) Đỏ thứ 2 = sai
  if (ids.do_.length >= 2) {
    await p.evaluate((m) => { UI.chon = UI.chon.slice(0, 3).concat([m]); UI.veBoChon(); }, ids.do_[0]);
    const truoc = await deck();
    await keo(await the(ids.do_[1]), await ctr('#chon-bo .o-bo', 4), { giu: 220, chup: 'sai' });
    await sleep(30); await shot('sai-toast');
    const toast = await p.evaluate(() => { const t = document.getElementById('chon-goi-nhac'); return t ? t.textContent + '|' + t.style.opacity : ''; });
    d = await deck(); ok('Mythic thu 2 bi chan + toast (' + toast + ')', JSON.stringify(d) === JSON.stringify(truoc) && /Mythic/.test(toast));
    await sleep(1500);
  } else console.log('SKIP mythic');
  // 6) vuốt dọc nhanh = cuộn
  const st0 = await p.evaluate(() => { const l = document.getElementById('chon-luoi'); l.scrollTop = 0; return l.scrollTop; });
  const d6 = await deck(); const c6 = await ctr('#chon-luoi .c', 4);
  const n6 = await p.evaluate(() => DK.soLan || 0);
  await Promise.all([T('touchStart', c6.x, c6.y), ...[1, 2, 3, 4, 5, 6, 7, 8].map(i => T('touchMove', c6.x + 1, c6.y - i * 25))]); await sleep(30); await T('touchEnd'); await sleep(500);
  const n6b = await p.evaluate(() => DK.soLan || 0); console.log('  keo bat dau trong luc cuon: ' + (n6b - n6));
  const st1 = await p.evaluate(() => document.getElementById('chon-luoi').scrollTop);
  ok('vuot doc nhanh = cuon (' + st0 + '→' + st1 + ')', st1 > st0 + 40 && JSON.stringify(await deck()) === JSON.stringify(d6) && !(await p.evaluate(() => !!DK.keo)) && n6b === n6);
  // 7) chạm thẻ → chi tiết → ADD → REMOVE → back
  await sleep(1500);
  await p.evaluate(() => { UI.chon = UI.chon.slice(0, 3); UI.veBoChon(); });
  const t7 = ids.thuong[9]; const c7 = await the(t7); await sleep(400);
  await p.touchscreen.tap(c7.x, c7.y); await sleep(500);
  ok('cham the → trang chi tiet', await p.evaluate((id) => UP.el && !UP.el.hidden && UP.id === id, t7)); await shot('chitiet');
  await p.locator('#up .up-nut').tap(); await sleep(300);
  ok('ADD trong chi tiet', (await deck()).includes(t7)); await shot('chitiet-add');
  await p.locator('#up .up-nut').tap(); await sleep(300);
  ok('REMOVE trong chi tiet', !(await deck()).includes(t7));
  await p.locator('#up .up-lui').tap(); await sleep(450);
  ok('BACK ve man bo bai', await p.evaluate(() => UP.el.hidden && document.getElementById('chon').classList.contains('xem-dk')));
  // 8) chạm ô có ụ → chi tiết; chạm hàng chỉ huy → chi tiết chỉ huy
  const o8 = await ctr('#chon-bo .o-bo', 1); const id8 = (await deck())[1];
  await p.touchscreen.tap(o8.x, o8.y); await sleep(500);
  ok('cham o → chi tiet', await p.evaluate((id) => !UP.el.hidden && UP.id === id, id8));
  await p.locator('#up .up-lui').tap(); await sleep(450);
  const mv = await ctr('#dk-mv'); await p.touchscreen.tap(mv.x, mv.y); await sleep(500);
  ok('cham chi huy → chi tiet', await p.evaluate(() => !UP.el.hidden && UP.mv === UI.mv)); await shot('chihuy');
  await p.locator('#up .up-lui').tap(); await sleep(450);
  // 8b) bộ đủ 5 → trang chi tiết ụ ngoài bộ: nút khoá "Deck full"
  await p.evaluate((x) => { UI.chon = x.slice(0, 5); UI.veBoChon(); }, ids.thuong);
  const c9 = await the(ids.thuong[10]); await sleep(300); await p.touchscreen.tap(c9.x, c9.y); await sleep(500);
  ok('bo du → nut khoa', await p.evaluate(() => UP.el.querySelector('.up-nut').disabled && /full/i.test(UP.el.querySelector('.up-nut-so').textContent)));
  await p.locator('#up .up-lui').tap(); await sleep(450);
  // 9) chuột (máy tính): kéo thẻ vào ô có ụ
  const ctx2 = await b.newContext({ viewport: { width: W, height: H } }); const q = await ctx2.newPage();
  q.on('pageerror', e => er.push('m:' + e.message));
  await q.goto('http://localhost:8765/thap/'); await q.waitForTimeout(1800); await q.locator('.hd-bo').click(); await q.waitForTimeout(3500);
  await q.evaluate((x) => { UI.chon = x.slice(0, 2); UI.veBoChon(); HM.di('dk'); }, ids.thuong); await q.waitForTimeout(400);
  const m1 = await q.evaluate((id) => { const c = document.querySelector('#chon-luoi .c[data-id="' + id + '"]'); c.scrollIntoView({ block: 'center' }); const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * .4 }; }, ids.thuong[4]);
  const m2 = await q.evaluate(() => { const r = document.querySelectorAll('#chon-bo .o-bo')[2].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await q.mouse.move(m1.x, m1.y); await q.mouse.down(); await q.mouse.move(m1.x + 12, m1.y, { steps: 3 }); await q.mouse.move(m2.x, m2.y, { steps: 10 }); await q.mouse.up(); await q.waitForTimeout(400);
  ok('chuot: the→o', await q.evaluate((id) => UI.chon[2] === id && UP.el == null || (UI.chon[2] === id && UP.el.hidden), ids.thuong[4]));
  // giảm chuyển động
  ok('khong loi trang (' + er.length + ')', er.length === 0); if (er.length) console.log(er.slice(0, 8));
  await b.close();
})();
