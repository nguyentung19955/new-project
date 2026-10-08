// Test v180: nút "Ẩn giao diện" trong trận — ẩn hết thanh/nút, chỉ còn bản đồ + tướng + quái và 1 nút nhỏ mờ ở góc
// để hiện lại (hoặc phím H). Kiểm tra 1920×1000, 844×390, 667×375: không chồng nút, không tràn chữ, game vẫn chạy.
// Chạy: node tests/an-giao-dien/an-giao-dien.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

const slotXY = (page, s) => page.evaluate((s) => {
  const [x, y] = CONFIG.slots[s]; const r = document.querySelector('#game').getBoundingClientRect();
  return logToClient(x, y);   // khung-co-dinh: toạ độ bản đồ → màn (thu phóng + xoay)
}, s);

// các phần tử trong #ui đang thấy được (trừ lớp phủ / màn hình / nút hiện lại)
const visibleUi = (page) => page.evaluate(() => [...document.querySelectorAll('#ui *')].filter((e) => {
  if (e.closest('.overlay, #screen, #btn-showui, #err, #loading')) return false;
  const cs = getComputedStyle(e), r = e.getBoundingClientRect();
  return cs.visibility === 'visible' && cs.display !== 'none' && r.width > 2 && r.height > 2 && +cs.opacity > 0.05 && !e.closest('[hidden]');
}).map((e) => e.id || e.className || e.tagName).slice(0, 12));

async function run(w, h) {
  const tag = `${w}x${h}`;
  const { browser, page, errors } = await open(w, h);
  await enter(page, 0, true);
  const slot = await page.evaluate(() => {
    game.gold = 999; const [a] = game.freeSlots(); game.spawnHero(a, 'lucsi'); ui.clearSel();
    return a;
  });
  await page.waitForTimeout(300);

  // 1) nút ẩn giao diện nằm trên thanh trên, không chồng nút khác, chữ không tràn
  const tb = await page.evaluate(() => {
    document.querySelector('#btn-chat').hidden = false;   // chật nhất: có cả nút trò chuyện (chơi nhóm)
    const b = document.querySelector('#btn-hideui'), R = (e) => e.getBoundingClientRect();
    const items = [...document.querySelectorAll('#topbar > *')].filter((e) => !e.hidden).map((e) => ({ id: e.id || e.className, r: R(e) }));
    const over = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i].r, c = items[j].r;
      if (a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5) over.push(items[i].id + '/' + items[j].id);
    }
    const wv = document.querySelector('#tb-wave'), tbr = R(document.querySelector('#topbar'));
    return { vis: !!b && !b.hidden && R(b).width > 10, label: b.getAttribute('aria-label'), title: b.title, over,
      inBar: R(b).top >= tbr.top - 1 && R(b).bottom <= tbr.bottom + 1 && R(b).right <= innerWidth,
      waveFit: wv.scrollWidth <= wv.clientWidth + 1, right: Math.max(...items.map((x) => x.r.right)), detail: document.querySelector('#btn-detail').getAttribute('aria-label') };
  });
  ok(tb.vis && tb.inBar, `[${tag}] có nút Ẩn giao diện trên thanh trên`);
  ok(/Ẩn giao diện/.test(tb.label) && /Ẩn giao diện/.test(tb.title), `[${tag}] nút có aria-label / title "${tb.title}"`);
  ok(tb.label !== tb.detail, `[${tag}] khác nút 👁 hiện/ẩn chỉ số (${tb.detail})`);
  ok(!tb.over.length, `[${tag}] các nút thanh trên không chồng nhau ${tb.over.join(', ')}`);
  ok(tb.waveFit && tb.right <= w, `[${tag}] chữ "Đợt" không tràn, thanh không tràn màn (${Math.round(tb.right)} ≤ ${w})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-truoc.png`) });

  // 2) bấm ẩn → chỉ còn bản đồ + 1 nút nhỏ mờ ở góc
  await page.evaluate(() => { game.running = true; if (!game.waveActive) game.startWave(); });
  await page.click('#btn-hideui'); await page.waitForTimeout(250);
  const vis = await visibleUi(page);
  ok(await page.evaluate(() => document.querySelector('#wrap').classList.contains('ui-off') && ui.uiHidden), `[${tag}] bấm → vào chế độ ẩn giao diện`);
  ok(!vis.length, `[${tag}] ẩn hết thanh trên, thẻ tướng, nút bên phải, toast… (còn: ${JSON.stringify(vis)})`);
  // khung-co-dinh: đo trong khung thiết kế (trừ hộp đen, chia hệ số thu phóng)
  const sb = await page.evaluate(() => { const b = document.querySelector('#btn-showui'), r = rectToFrame(b.getBoundingClientRect()), cs = getComputedStyle(b);
    return { vis: !b.hidden && cs.visibility === 'visible' && r.width > 10, l: r.left, t: r.top, w: r.width, h: r.height, op: +cs.opacity, label: b.getAttribute('aria-label') }; });
  ok(sb.vis && /Hiện giao diện/.test(sb.label), `[${tag}] còn đúng 1 nút "Hiện giao diện"`);
  ok(sb.l < 30 && sb.t < 30 && sb.w < Math.max(70, w * 0.05) && sb.h < Math.max(60, h * 0.08), `[${tag}] nút hiện lại nhỏ, ở góc (${Math.round(sb.l)},${Math.round(sb.t)} ${Math.round(sb.w)}×${Math.round(sb.h)})`);
  ok(sb.op < 0.8, `[${tag}] nút hiện lại mờ (opacity ${sb.op})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-an.png`) });

  // 3) game vẫn chạy khi ẩn; chạm bản đồ không chọn tướng
  const t0 = await page.evaluate(() => game.time);
  await page.waitForTimeout(600);
  ok(await page.evaluate((t0) => game.time > t0 && !game.over, t0), `[${tag}] game vẫn chạy khi ẩn giao diện`);
  const p = await slotXY(page, slot);
  await page.mouse.click(p[0], p[1]); await page.waitForTimeout(200);
  ok(await page.evaluate(() => ui.sel < 0 && document.querySelector('#more').hidden), `[${tag}] đang ẩn: chạm tướng không hiện gì`);

  // 4) chạm nút góc → hiện lại; phím H ẩn / hiện
  await page.click('#btn-showui'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => !ui.uiHidden && !document.querySelector('#wrap').classList.contains('ui-off') && document.querySelector('#btn-showui').hidden
    && getComputedStyle(document.querySelector('#topbar')).visibility === 'visible' && getComputedStyle(document.querySelector('#deck')).visibility === 'visible'), `[${tag}] chạm nút góc → hiện lại giao diện`);
  await page.keyboard.press('h'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => ui.uiHidden), `[${tag}] phím H → ẩn`);
  await page.keyboard.press('h'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => !ui.uiHidden && document.querySelector('#btn-showui').hidden), `[${tag}] phím H lần nữa → hiện`);

  // 5) đang ẩn mà rời trận → giao diện tự hiện lại
  await page.keyboard.press('h'); await page.waitForTimeout(100);
  await page.evaluate(() => ui.setInGame(false)); await page.waitForTimeout(100);
  ok(await page.evaluate(() => !ui.uiHidden && document.querySelector('#btn-showui').hidden), `[${tag}] rời trận → tự bỏ chế độ ẩn`);
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await run(1920, 1000);
  await run(844, 390);
  await run(667, 375);
  console.log('\nTất cả đều đạt');
})().catch((e) => { console.error(e.message); process.exit(1); });
