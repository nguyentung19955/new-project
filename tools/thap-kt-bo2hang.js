// Màn XÂY BỘ BÀI: 0/3/5 ụ đã chọn, bảng chọn chỉ huy (ô thứ 6), kéo thẻ → ô, COLLECTION — 360/390/430, DPR3.
// BASE=http://localhost:8765 OUT=docs/demo-hop-tuong/tuvan/bo2hang/sau_ node tools/thap-kt-bo2hang.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765', OUT = process.env.OUT || 'shots/bo2hang_';
const SIZES = [[360, 780], [390, 844], [430, 932]];
(async () => {
  const b = await chromium.launch(); const kq = {};
  for (const [w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: false });
    await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    await p.goto(`${BASE}/thap/?notut=1`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const dat = async (ds) => { await p.evaluate((ds) => { UI.chon = ds.slice(); UI.veBoChon(); HM.di('dk'); }, ds); await p.waitForTimeout(700); };
    for (const [ten, ds] of [['0', []], ['3', ['canon', 'lien', 'bang']], ['5', ['canon', 'lien', 'bang', 'radar', 'lophanung']]]) {
      await dat(ds); await p.screenshot({ path: OUT + w + '_chon' + ten + '.png' });
    }
    // đếm hàng lưới nhìn thấy
    kq[w] = await p.evaluate(() => {
      const l = document.getElementById('chon-luoi').getBoundingClientRect();
      const cs = [...document.querySelectorAll('#chon-luoi .c[data-id]')].filter(c => { const r = c.getBoundingClientRect(); return r.height && r.top >= l.top - 1 && r.bottom <= l.bottom + 1; });
      const tops = new Set(cs.map(c => Math.round(c.getBoundingClientRect().top)));
      const o = [...document.querySelectorAll('#chon-bo > *')].map(e => { const r = e.getBoundingClientRect(); return [e.className.split(' ')[0], Math.round(r.width), Math.round(r.height)]; });
      return { luoiCao: Math.round(l.height), hangDu: tops.size, o, ngang: document.documentElement.scrollWidth > innerWidth };
    });
    // bảng chỉ huy
    const mv = await p.$('#chon-bo .o-mv');
    if (mv) {
      await mv.click(); await p.waitForTimeout(600);
      await p.screenshot({ path: OUT + w + '_chihuy.png' });
      kq[w].bang = await p.evaluate(() => HM.sheet);
      await p.evaluate(() => HM.dong(true)); await p.waitForTimeout(300);
    }
    // kéo thẻ → ô 3 (deck 3 ụ)
    await dat(['canon', 'lien', 'bang']);
    const keo = async (tuSel, denSel, chup) => {
      const a = await p.$eval(tuSel, e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      const z = await p.$eval(denSel, e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.mouse.move(a[0], a[1]); await p.mouse.down(); await p.waitForTimeout(260);
      for (let i = 1; i <= 12; i++) { await p.mouse.move(a[0] + (z[0] - a[0]) * i / 12, a[1] + (z[1] - a[1]) * i / 12); await p.waitForTimeout(16); }
      await p.waitForTimeout(150); if (chup) await p.screenshot({ path: OUT + w + '_' + chup + '.png' });
      await p.mouse.up(); await p.waitForTimeout(500);
    };
    const the = '#chon-luoi .c[data-id="radar"]';
    await p.$eval(the, e => e.scrollIntoView({ block: 'center' }));
    await keo(the, '#chon-bo .o-bo:nth-child(4)', 'keo');
    kq[w].sauKeo = await p.evaluate(() => UI.chon.join(','));
    await p.screenshot({ path: OUT + w + '_keo_xong.png' });
    // thả thẻ lên ô chỉ huy → lắc, bộ bài không đổi
    if (mv) {
      const the2 = '#chon-luoi .c[data-id="lophanung"]';
      await p.$eval(the2, e => e.scrollIntoView({ block: 'center' }));
      await keo(the2, '#chon-bo .o-mv', null);
      await p.waitForTimeout(80);
      kq[w].thaMV = await p.evaluate(() => UI.chon.join(',') + ' lac=' + !!document.querySelector('#chon-bo .o-mv.dk-lac, #chon-bo .o-mv[data-lac]'));
      await p.screenshot({ path: OUT + w + '_tha_chihuy.png' });
    }
    // COLLECTION
    await p.evaluate(() => HM.di('dk', true)); await p.waitForTimeout(600);
    await p.screenshot({ path: OUT + w + '_collection.png' });
    // presets
    await p.evaluate(() => { HM.di('dk'); HM.moPre(); }); await p.waitForTimeout(600);
    await p.screenshot({ path: OUT + w + '_presets.png' });
    kq[w].loi = errs.slice(0, 5);
    await ctx.close();
  }
  console.log(JSON.stringify(kq, null, 1)); await b.close();
})();
