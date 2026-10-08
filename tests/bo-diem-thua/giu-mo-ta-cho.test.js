// Test claude/bo-diem-thua (2 lỗi nhỏ thanh tướng / chợ):
// 1) rê chuột / giữ tay lên ô kỹ năng mà thanh tướng dựng lại trong lúc chờ (0,15 / 0,35 giây) → mô tả vẫn hiện (tìm ô mới cùng chỗ)
// 2) chợ ra cả 6 thẻ cùng loại → mọi ảnh thẻ đã tải sẵn (ui.preImg giữ MARKET_SIZE bản), không thẻ nào nháy trắng
// Chạy: node tests/bo-diem-thua/giu-mo-ta-cho.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SK = (i) => `#deck [data-act=cmd-skill][data-i="${i}"]`;
const center = (page, sel) => page.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
const shown = (page) => page.evaluate(() => { const t = document.querySelector('#sk-tip'); return !!(t && !t.hidden && ui.tip); });
// dựng lại cả thanh tướng liên tục (như khi ô khác đổi hồi chiêu / mana giữa trận) trong ms mili giây
const rebuild = (page, ms) => page.evaluate((ms) => new Promise((res) => { const end = performance.now() + ms;
  const f = () => { ui.sig.deck = null; ui.updateDeck(); if (performance.now() < end) setTimeout(f, 40); else res(); }; f(); }), ms);

async function run(w, h) {
  const tag = `${w}x${h}`;
  const { browser, page, errors } = await open(w, h, {});
  await enter(page, 0, true);
  await page.evaluate(() => {
    game.gold = 5000; const [a] = game.freeSlots(); const hh = game.spawnHero(a, 'lucsi'); hh.summonT = 0; hh.level = 5; hh.skillPts = 3;
    ui.sel = a; ui.spot = -1; ui.armed = null; ui.sig.deck = null; ui.updateDeck(); game.running = false;
  });
  await page.waitForTimeout(800);
  // 1a) chuột: rê vào ô Q, thanh tướng dựng lại suốt 0,4 giây chờ, chuột đứng yên
  const c0 = await center(page, SK(0));
  await page.mouse.move(2, 2); await page.mouse.move(c0[0], c0[1], { steps: 2 });
  await rebuild(page, 400);
  let s = false; for (let k = 0; k < 10 && !s; k++) { await page.waitForTimeout(100); s = await shown(page); }
  ok(s, `[${tag}] rê chuột + thanh tướng dựng lại trong lúc chờ → mô tả vẫn hiện`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-hover-dung-lai.png`) });
  await page.mouse.move(2, h / 2); await page.waitForTimeout(300);
  ok(!(await shown(page)), `[${tag}] rời chuột → ẩn`);
  // 1b) cảm ứng: giữ tay ô E, dựng lại trong 0,35 giây chờ
  const cdp = await page.context().newCDPSession(page);
  const lv0 = await page.evaluate(() => JSON.stringify(game.heroes[ui.sel].skillLv));
  const c2 = await center(page, SK(2));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c2[0], y: c2[1] }] });
  await rebuild(page, 450);
  s = false; for (let k = 0; k < 10 && !s; k++) { await page.waitForTimeout(100); s = await shown(page); }
  ok(s, `[${tag}] giữ tay + thanh tướng dựng lại trong lúc chờ → mô tả vẫn hiện`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-giu-tay-dung-lai.png`) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(300);
  ok(!(await shown(page)), `[${tag}] thả tay → ẩn`);
  ok(lv0 === await page.evaluate(() => JSON.stringify(game.heroes[ui.sel].skillLv)), `[${tag}] giữ tay không nâng / mở kỹ năng`);
  // 2) chợ 6 thẻ cùng loại
  const mk = await page.evaluate(async () => {
    ui.sel = -1; game.gold = 1e5; ui.sig.deck = null; ui.updateDeck();
    const m = game.ensureMarket(), t = m.types[0];
    ui.preloadMarket([t]);
    const L = () => ui.mkPre.get(new URL(marketPortrait(t), document.baseURI).href) || [];
    const end = performance.now() + 10000;
    while (performance.now() < end && !(L().length >= MARKET_SIZE && L().every((im) => im.complete && im.naturalWidth))) await new Promise((r) => setTimeout(r, 50));
    const pre = L().length;
    m.types = m.types.map(() => t); ui.sig.deck = null; ui.updateDeck();
    const ims = [...document.querySelectorAll('#deck .mk-card > img')];
    return { pre, n: ims.length, blank: ims.filter((im) => !(im.complete && im.naturalWidth > 0)).length };
  });
  ok(mk.pre >= 6, `[${tag}] nạp sẵn ≥ 6 bản ảnh mỗi tướng chợ (${mk.pre})`);
  ok(mk.n === 6 && mk.blank === 0, `[${tag}] chợ 6 thẻ cùng loại: không thẻ nào nháy trắng (${JSON.stringify(mk)})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-cho-6-trung.png`) });
  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h] of [[844, 390], [1920, 934]]) await run(w, h);
  console.log('OK giu-mo-ta-cho');
})().catch((e) => { console.error(e); process.exit(1); });
