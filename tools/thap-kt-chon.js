// Đo + chụp hiệu ứng ĐANG CHỌN (thẻ lưới, ô bộ bài chờ đổi, ô thả khi kéo, thẻ chỉ huy chọn, thẻ thanh bài, chỉ huy trong trận).
// TAG=truoc|sau BASE=http://localhost:8765 node tools/thap-kt-chon.js → docs/demo-hop-tuong/tuvan/chon/
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765', TAG = process.env.TAG || 'sau';
const OUT = 'docs/demo-hop-tuong/tuvan/chon/';
const sleep = (t) => new Promise(r => setTimeout(r, t));
// liệt kê hoạt ảnh đang chạy + thuộc tính bị đổi (box-shadow/filter/width/top… = giật)
const HOAT = () => document.getAnimations().map(a => {
  const e = a.effect, t = e && e.target, kf = e && e.getKeyframes ? e.getKeyframes() : [];
  const props = [...new Set(kf.flatMap(k => Object.keys(k).filter(x => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))];
  const tim = e && e.getTiming ? e.getTiming() : {};
  return { el: t ? (t.id ? '#' + t.id : '') + '.' + String(t.className || '').split(' ').filter(Boolean).slice(0, 3).join('.') + (e.pseudoElement || '') : '?', ten: a.animationName || a.transitionProperty || a.constructor.name, props, ms: tim.duration, lap: tim.iterations, easing: tim.easing };
}).filter(x => x.lap === Infinity || x.ms > 0);
(async () => {
  const b = await chromium.launch(); const kq = { tag: TAG, errs: [], vung: {} };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage(); p.on('pageerror', e => kq.errs.push(e.message));
  await p.goto(BASE + '/thap/?notut=1&nointro=1', { waitUntil: 'load' });
  await p.evaluate(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } });
  await p.goto(BASE + '/thap/?notut=1&nointro=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof HM !== 'undefined' && typeof UI !== 'undefined' && G.roster && G.roster.length, null, { timeout: 30000 });
  await sleep(1500);
  await p.evaluate(() => { UI.chon = ['canon', 'bang', 'tia']; UI.veBoChon(); HM.di('dk'); HM.ve && HM.ve(); });
  await sleep(1200);
  const cdp = await ctx.newCDPSession(p);
  // dải khung: 12 ảnh × 1/30 s quanh 1 thẻ đã chọn + độ khác giữa các khung
  const strip = async (ten, sel, pad = 14) => {
    const r = await p.evaluate(([s, pd]) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const q = e.getBoundingClientRect(); return { x: Math.max(0, q.left - pd), y: Math.max(0, q.top - pd), width: q.width + pd * 2, height: q.height + pd * 2 }; }, [sel, pad]);
    if (!r) { kq.vung[ten] = 'không thấy ' + sel; return; }
    await sleep(300);
    const anims = await p.evaluate(HOAT);
    // vết hiệu năng 1.5 s: đếm Layout / Paint / khung
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.frame', transferMode: 'ReturnAsStream' });
    const bufs = [];
    for (let i = 0; i < 12; i++) { bufs.push(await p.screenshot({ clip: r })); await sleep(33); }
    await sleep(600);
    const done = new Promise(res => cdp.once('Tracing.tracingComplete', res));
    await cdp.send('Tracing.end'); const { stream } = await done;
    let s = '', c; do { c = await cdp.send('IO.read', { handle: stream }); s += c.data; } while (!c.eof);
    await cdp.send('IO.close', { handle: stream });
    const ev = JSON.parse(s).traceEvents || JSON.parse(s);
    const dem = (n) => ev.filter(e => e.name === n && e.ph !== 'E').length;
    fs.writeFileSync(`/tmp/${TAG}_${ten}.json`, JSON.stringify(bufs.map(x => x.toString('base64'))));
    kq.vung[ten] = { anims, layout: dem('Layout'), paint: dem('Paint'), styleRecalc: dem('UpdateLayoutTree'), khung: dem('DrawFrame') };
    await p.screenshot({ path: `${OUT}${TAG}_${ten}.png`, clip: r });
  };
  await strip('the_luoi', '#chon-luoi .c.chon:not([hidden])');
  await strip('o_bo', '#chon-bo .o-bo[data-id]');
  // ô chờ đổi (armed)
  await p.evaluate(() => { HM.armed = 1; HM.veDeck(); });
  await sleep(500); await strip('o_cho_doi', '#chon-bo .o-bo.hm-armed');
  await p.evaluate(() => { HM.armed = -1; HM.veDeck(); });
  // ô thả khi kéo (giả lập lớp kéo)
  await p.evaluate(() => {
    const bo = document.querySelector('#chon-bo'); bo.classList.add('dk-keo');
    const o = bo.querySelectorAll('.o-bo')[1]; o.classList.add('dk-hop', 'dk-tren');
    if (!o.querySelector('img.dk-vien')) { const im = document.createElement('img'); im.className = 'dk-vien'; im.src = 'assets/khung_chon.png'; o.prepend(im); }
  });
  await sleep(500); await strip('o_tha', '#chon-bo .o-bo.dk-tren');
  await p.evaluate(() => { const bo = document.querySelector('#chon-bo'); bo.classList.remove('dk-keo'); bo.querySelectorAll('.dk-hop,.dk-tren').forEach(o => o.classList.remove('dk-hop', 'dk-tren')); });
  await p.screenshot({ path: `${OUT}${TAG}_man_deck.png` });
  // màn chọn chỉ huy (.mv.chon)
  await p.evaluate(() => { HM.moMVs && HM.moMVs(); });
  await sleep(500);
  if (await p.$('.mv.chon')) { await strip('chi_huy_chon', '.mv.chon'); await p.screenshot({ path: `${OUT}${TAG}_man_chihuy.png` }); }
  await p.close();
  // trong trận: thanh bài + chỉ huy (SOLO / CO-OP / PVP)
  for (const che of ['solo', 'coop', 'pvp']) {
    const q = await ctx.newPage(); q.on('pageerror', e => kq.errs.push(che + ' :: ' + e.message));
    await q.goto(`${BASE}/thap/?mode=${che}&deck=lophanung,radar,lien,bang,canon&mana=3000&notut=1&nointro=1`, { waitUntil: 'load' });
    await sleep(3500);
    for (let i = 0; i < 2; i++) { await q.mouse.click(195, 844 * 0.56); await sleep(600); }
    await q.evaluate(() => { try { G.ban[0].mana = 3000; } catch (e) { } }); await sleep(1500);
    const pp = p; // eslint
    const r = await q.evaluate(() => { const e = document.querySelector('#duoi'); if (!e) return null; const z = e.getBoundingClientRect(); return { x: 0, y: z.top - 14, width: 390, height: z.height + 14 }; });
    if (r) await q.screenshot({ path: `${OUT}${TAG}_thanhbai_${che}.png`, clip: r });
    kq.vung['tran_' + che] = await q.evaluate(HOAT).then(a => a.filter(x => /the|mv|cht|bo-the/.test(x.el)));
    await q.close();
  }
  fs.writeFileSync(`${OUT}${TAG}_do.json`, JSON.stringify(kq, null, 1));
  console.log(JSON.stringify({ errs: kq.errs, vung: Object.fromEntries(Object.entries(kq.vung).map(([k, v]) => [k, v.anims ? { n: v.anims.length, props: [...new Set(v.anims.flatMap(a => a.props))], layout: v.layout, paint: v.paint } : v])) }, null, 0));
  await b.close();
})();
