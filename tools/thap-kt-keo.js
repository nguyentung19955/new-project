const { chromium, devices } = require('playwright');
// KIỂM KÉO-THẢ màn XÂY BỘ BÀI (js/dkkeo.js) bằng CẢM ỨNG THẬT (CDP Input.dispatchTouchEvent, iPhone 13) + chuột.
//  Thêm vào ô trống / đổi ô có ụ / ô→ô / kéo ô ra lưới = bỏ / thả lên ô chỉ huy = từ chối / thả ngoài = huỷ;
//  kéo nhanh không giữ (vuốt thẳng lên bộ bài), vuốt dọc lưới = cuộn, chạm = trang chi tiết. 3 cỡ 360/390/430.
//  Chạy: python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-keo.js [url] [rộng]
//  Hợp đồng DOM: QUY-TAC-HINH.md quy tắc 10. Ra mã 1 nếu trượt (thap-kt-hoiquy.js gọi file này).
const URL = process.argv[2] || 'http://localhost:8765/thap/';
const CO = process.argv[3] ? [+process.argv[3]] : [360, 390, 430];
let TRUOT = 0;
const chay = async (W) => {
  const b = await chromium.launch(URL.startsWith('https') ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  const dev = { ...devices['iPhone 13'], viewport: { width: W, height: Math.round(W * 2.16) } };
  const ctx = await b.newContext({ ...dev, ignoreHTTPSErrors: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL + '?notut=1', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  await p.tap('[data-act="hm-deck"]'); await p.waitForTimeout(800);
  const sk = await p.$('[data-act="hd-boqua"]'); if (sk) { await sk.tap(); await p.waitForTimeout(800); }
  const cdp = await ctx.newCDPSession(p);
  const st = () => p.evaluate(() => {
    const r = el => { const b = el.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2, b.width]; };
    return { deck: UI.chon.slice(), o: [...document.querySelectorAll('#chon-bo .o-bo')].map(r), mv: (q => q && r(q))(document.querySelector('#chon-bo .o-mv')),
      cards: [...document.querySelectorAll('#chon-luoi .c[data-id]')].filter(c => c.getBoundingClientRect().width > 0 && !c.classList.contains('khoa') && SKILLS[c.dataset.id]).map(c => [c.dataset.id, ...r(c)]) };
  });
  const keo = async (a, z, kieu) => {
    if (kieu === 'chuot') { await p.mouse.move(a[0], a[1]); await p.mouse.down(); await p.waitForTimeout(60);
      for (let i = 1; i <= 14; i++) { await p.mouse.move(a[0] + (z[0] - a[0]) * i / 14, a[1] + (z[1] - a[1]) * i / 14); await p.waitForTimeout(16); }
      await p.waitForTimeout(40); await p.mouse.up(); await p.waitForTimeout(450); return; }
    const t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 })) });
    await t('touchStart', [a]); await p.waitForTimeout(kieu === 'nhanh' ? 10 : 240);
    let mid = null;
    for (let i = 1; i <= 14; i++) { await t('touchMove', [[a[0] + (z[0] - a[0]) * i / 14, a[1] + (z[1] - a[1]) * i / 14]]); await p.waitForTimeout(16); if (i === 10) mid = await p.evaluate(() => !!DK.keo); }
    await p.waitForTimeout(40); await t('touchEnd', []); await p.waitForTimeout(450); return mid;
  };
  const kq = []; const ok = (ten, d) => { kq.push([ten, !!d]); };
  for (const kieu of ['cham', 'nhanh', 'chuot']) {
    await p.evaluate(() => { UI.chon = []; UI.veBoChon(); document.getElementById('chon-luoi').scrollTop = 0; }); await p.waitForTimeout(200);
    let s = await st();
    const ids = s.cards.filter(c => !s.deck.includes(c[0])).map(c => c[0]);
    const free = new Proxy([], { get: (_, i) => (typeof i === 'string' && /^\d+$/.test(i)) ? s.cards.find(c => c[0] === ids[+i]) : undefined });
    // 1 thêm vào ô trống
    const m = await keo([free[0][1], free[0][2]], [s.o[0][0], s.o[0][1]], kieu); s = await st();
    ok(kieu + ' them', s.deck[0] === free[0][0]);
    await keo([free[1][1], free[1][2]], [s.o[1][0], s.o[1][1]], kieu); s = await st();
    ok(kieu + ' them2', s.deck.length === 2 && s.deck[1] === free[1][0]);
    // 2 đổi ô có ụ
    await keo([free[2][1], free[2][2]], [s.o[0][0], s.o[0][1]], kieu); s = await st();
    ok(kieu + ' doi', s.deck[0] === free[2][0] && !s.deck.includes(free[0][0]));
    // 3 ô → ô
    const d0 = s.deck.slice(); await keo([s.o[0][0], s.o[0][1]], [s.o[1][0], s.o[1][1]], kieu); s = await st();
    ok(kieu + ' doicho', s.deck[0] === d0[1] && s.deck[1] === d0[0]);
    // 4 ô chỉ huy từ chối
    const d1 = s.deck.slice(); if (s.mv) { await keo([free[3][1], free[3][2]], [s.mv[0], s.mv[1]], kieu); s = await st(); ok(kieu + ' chihuy-tuchoi', JSON.stringify(s.deck) === JSON.stringify(d1)); }
    // 5 kéo ô ra lưới = bỏ
    const c = s.cards.filter(c => c[2] > s.o[0][1] + 60)[3] || s.cards[s.cards.length - 1];
    await keo([s.o[0][0], s.o[0][1]], [c[1], c[2] + 40], kieu); s = await st();
    ok(kieu + ' bo', s.deck.length === d1.length - 1);
    // 6 thả ngoài = huỷ (kéo ngang ra mép trên)
    const d2 = s.deck.slice(); await keo([free[4][1], free[4][2]], [5, 30], kieu); s = await st(); ok(kieu + ' huy', JSON.stringify(s.deck) === JSON.stringify(d2));
  }
  // vuốt dọc trong lưới = cuộn
  { const s0 = await st(); const vh = await p.evaluate(() => innerHeight); const c = s0.cards.filter(c => c[2] < vh * 0.68).slice(-1)[0];
    const t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1 })) });
    const top0 = await p.evaluate(() => document.getElementById('chon-luoi').scrollTop);
    await t('touchStart', [[c[1], c[2]]]); for (let i = 1; i <= 10; i++) { await t('touchMove', [[c[1], c[2] - i * 15]]); await p.waitForTimeout(16); } await t('touchEnd', []); await p.waitForTimeout(700);
    const top1 = await p.evaluate(() => document.getElementById('chon-luoi').scrollTop);
    ok('cuon-doc', top1 > top0 + 60);  ok('cuon-khong-doi-bo', JSON.stringify((await st()).deck) === JSON.stringify(s0.deck));
    await p.evaluate(() => { document.getElementById('chon-luoi').scrollTop = 0; }); await p.waitForTimeout(200); }
  // chạm thẻ (js/dkcham.js): chưa trong bộ + còn ô = thêm; chạm ô bộ bài = bỏ; GIỮ ~400 ms = mở chi tiết
  let s = await st();
  { const t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1 })) });
    await p.evaluate(() => { UI.chon = UI.chon.slice(0, 3); UI.veBoChon(); }); await p.waitForTimeout(200); s = await st();
    const f = s.cards.find(c => !s.deck.includes(c[0]) && true); const n0 = s.deck.length;
    await t('touchStart', [[f[1], f[2]]]); await p.waitForTimeout(60); await t('touchEnd', []); await p.waitForTimeout(450);
    s = await st(); ok('cham-them', s.deck.length === n0 + 1 && s.deck.includes(f[0]));
    await t('touchStart', [[s.o[0][0], s.o[0][1]]]); await p.waitForTimeout(60); await t('touchEnd', []); await p.waitForTimeout(450);
    s = await st(); ok('cham-o-bo', s.deck.length === n0);
    await t('touchStart', [[s.cards[0][1], s.cards[0][2]]]); await p.waitForTimeout(600); await t('touchEnd', []); await p.waitForTimeout(500); }
  ok('giu-mo-chitiet', await p.evaluate(() => typeof UP !== 'undefined' && UP.el && !UP.el.hidden));
  const hong = kq.filter(x => !x[1]).map(x => x[0]); if (errs.length) hong.push('loi-trang: ' + errs[0]);
  console.log((hong.length ? '✗ ' : '✓ ') + W + 'px kéo-thả ' + kq.filter(x => x[1]).length + '/' + kq.length + (hong.length ? '  TRƯỢT: ' + hong.join(', ') : ''));
  TRUOT += hong.length;
  await b.close();
};
(async () => { for (const w of CO) await chay(w).catch(e => { TRUOT++; console.log('✗ ' + w + 'px kẹt: ' + e.message); }); process.exit(TRUOT ? 1 : 0); })();
