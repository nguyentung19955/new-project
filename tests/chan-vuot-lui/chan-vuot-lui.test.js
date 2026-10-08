// claude/chan-vuot-lui: chơi trên web điện thoại, vuốt mép / cử chỉ Back hay lỡ về trang trước.
// Kiểm: vuốt ngang từ mép bị chặn (vuốt dọc thì không); Back trong trận → tạm dừng + hỏi "Rời trận?", không rời trang;
// Back khi đang mở bảng → đóng bảng; Back ở menu → hỏi, bấm lần 2 trong 2 giây mới rời trang.
// Chạy: node tests/chan-vuot-lui/chan-vuot-lui.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { enter, ok, ROOT } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const URL = 'file://' + path.join(ROOT, 'index.html');

async function open(w, h) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript(() => { if (!location.href.startsWith('file:')) return; if (!sessionStorage.getItem('seeded')) { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })); sessionStorage.setItem('seeded', '1'); } });
  await page.goto(URL);
  await page.waitForTimeout(900);
  // ghi lại touchmove có bị chặn không (nghe ở window, sau bộ chặn của game)
  await page.evaluate(() => { window.__mv = []; window.addEventListener('touchmove', (e) => window.__mv.push(e.defaultPrevented), { passive: true }); });
  return { browser, page, errors, cdp: await ctx.newCDPSession(page) };
}
// vuốt một ngón bằng CDP từ (x0,y0) tới (x1,y1)
async function swipe(cdp, x0, y0, x1, y1) {
  const pt = (x, y) => [{ x, y, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x0, y0) });
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
const back = async (page) => { await page.evaluate(() => history.back()); await page.waitForTimeout(300); };
const onGame = (page) => page.url().startsWith('file:') && page.url().endsWith('index.html');
const askOn = (page) => page.evaluate(() => { const e = document.getElementById('leave-ask'); return !!e && !e.hidden; });

(async () => {
  for (const [w, h, name] of [[844, 390, '844x390'], [390, 844, 'doc-390x844']]) {
    console.log(name);
    const { browser, page, errors, cdp } = await open(w, h);
    await page.touchscreen.tap(w / 2, h - 30); await page.waitForTimeout(200);   // chạm đầu (Chrome cần để giữ mục lịch sử)
    ok(await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorX === 'none' && getComputedStyle(document.body).overscrollBehaviorX === 'none'), `${name}: html/body overscroll-behavior: none`);

    // vuốt mép
    await page.evaluate(() => { window.__mv = []; });
    await swipe(cdp, 4, h / 2, 260, h / 2);
    ok(await page.evaluate(() => window.__mv.length > 0 && window.__mv.every(Boolean)), `${name}: vuốt ngang từ mép trái bị chặn`);
    await page.evaluate(() => { window.__mv = []; });
    await swipe(cdp, w - 4, h / 2, w - 260, h / 2);
    ok(await page.evaluate(() => window.__mv.length > 0 && window.__mv.every(Boolean)), `${name}: vuốt ngang từ mép phải bị chặn`);
    await page.evaluate(() => { window.__mv = []; });
    await swipe(cdp, 10, h * 0.7, 12, h * 0.3);
    ok(await page.evaluate(() => window.__mv.length > 0 && !window.__mv.some(Boolean)), `${name}: vuốt dọc sát mép không bị chặn (cuộn bảng)`);
    await page.evaluate(() => { window.__mv = []; });
    await swipe(cdp, w / 2, h / 2, w / 2 + 200, h / 2);
    ok(await page.evaluate(() => !window.__mv.some(Boolean)), `${name}: vuốt giữa màn không bị bộ chặn mép đụng tới`);
    ok(onGame(page), `${name}: vẫn ở trang game sau khi vuốt`);

    // trong trận
    await enter(page, 0, true);
    await page.evaluate(() => { game.running = true; });
    await back(page);
    ok(onGame(page) && await askOn(page), `${name} trận: Back → hiện "Rời trận?", không rời trang`);
    ok(await page.evaluate(() => !game.running && game.started), `${name} trận: trận tạm dừng`);
    await page.screenshot({ path: path.join(SHOT, `roi-tran-${name}.png`) });
    await page.click('#leave-ask [data-la=stay]'); await page.waitForTimeout(150);
    ok(!(await askOn(page)) && await page.evaluate(() => game.running), `${name} trận: Ở lại → đóng hộp, trận chạy tiếp`);
    await back(page); ok(await askOn(page), `${name} trận: Back lần nữa → lại hỏi`);
    await back(page); ok(onGame(page) && !(await askOn(page)) && await page.evaluate(() => game.running), `${name} trận: Back khi đang hỏi = Ở lại`);
    // bảng trong trận
    await page.evaluate(() => ui.openScreen('bag')); await page.waitForTimeout(200);
    ok(await page.evaluate(() => !document.querySelector('#screen').hidden), `${name} trận: mở Túi đồ`);
    await back(page);
    ok(onGame(page) && await page.evaluate(() => document.querySelector('#screen').hidden) && !(await askOn(page)), `${name} trận: Back → đóng Túi đồ, không hỏi rời trận`);
    // Rời trận
    await back(page); await page.click('#leave-ask [data-la=leave]'); await page.waitForTimeout(300);
    ok(onGame(page) && await page.evaluate(() => !document.querySelector('#menu').hidden && !game.running && !!ui.save.run && /Tiếp tục/.test($('#continue-label').textContent)), `${name} trận: Rời trận → về menu, giữ trận để Tiếp tục (giu-tran-dang-choi)`);

    // menu: Back 1 lần hỏi, 2 lần (trong 2 giây) mới rời trang
    await page.waitForTimeout(2100);
    await back(page);
    ok(onGame(page) && await page.evaluate(() => !document.querySelector('#menu').hidden), `${name} menu: Back lần 1 → vẫn ở game`);
    ok(await page.evaluate(() => /Thoát game/.test(document.querySelector('#toasts').textContent)), `${name} menu: hiện nhắc "Thoát game?"`);
    await page.evaluate(() => history.back()); await page.waitForTimeout(800);
    ok(!onGame(page), `${name} menu: Back lần 2 trong 2 giây → rời trang (${page.url()})`);
    ok(errors.length === 0, `${name}: không lỗi JS ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('chan-vuot-lui: OK');
})().catch((e) => { console.error(e); process.exit(1); });
