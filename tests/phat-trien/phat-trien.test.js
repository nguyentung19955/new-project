// Test Cây phát triển tướng (v147). Chạy: node tests/phat-trien/phat-trien.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

// đọc cây trong DOM: mỗi dòng = [a, b, to] theo data-type, kèm cờ 'sub'
const readTree = (page) => page.evaluate(() => [...document.querySelectorAll('#roster .ev-tree .ev-row')].map((r) => ({
  sub: r.classList.contains('sub'), t: [...r.querySelectorAll('.ev-p')].map((p) => p.dataset.type), lock: [...r.querySelectorAll('.ev-p.lock')].map((p) => p.dataset.type) })));
// công thức kỳ vọng tính thẳng từ FUSION
const expect = (page, t) => page.evaluate((t) => {
  const into = (x) => FUSION.filter((f) => f.a === x || f.b === x).map((f) => [x, f.a === x ? f.b : f.a, f.to].join());
  const from = (x) => { const f = FUSION.find((f) => f.to === x); return f ? [f.a, f.b, f.to].join() : null; };
  const d = HEROES[t];
  // tầng 2 của tướng Thường bỏ chân dung tướng Tím (đã có ở dòng trên)
  if (!d.legend) return FUSION.filter((f) => f.a === t || f.b === t).flatMap((f) => [into(t).find((s) => s.endsWith(',' + f.to)), ...into(f.to).map((s) => s.split(',').slice(1).join())]);
  if (d.legend === 'epic') return [from(t), ...into(t)];
  const f = FUSION.find((f) => f.to === t);
  return [from(t), from(f.a), from(f.b)].filter(Boolean);
}, t);
// không chữ nào tràn khung
const overflow = (page) => page.evaluate(() => {
  const bad = [];
  const tree = document.querySelector('#roster .ev-tree');
  if (tree && tree.scrollWidth > tree.clientWidth + 1) bad.push('tree ' + tree.scrollWidth + '>' + tree.clientWidth);
  for (const r of document.querySelectorAll('#roster .ev-row')) if (r.scrollWidth > r.clientWidth + 1) bad.push('row ' + r.textContent.trim().slice(0, 30));
  const det = document.querySelector('#roster .ro-det'); if (det && det.scrollWidth > det.clientWidth + 1) bad.push('det');
  return bad;
});

async function rosterCase(w, h, tag) {
  const { browser, page, errors } = await open(w, h, { owned: ['lyngu'] });
  for (const [t, kind] of [['thosan', 'thuong'], ['lyngu', 'tim'], ['llq', 'vang']]) {
    await page.evaluate((t) => ui.showRoster(t), t);
    await page.waitForTimeout(250);
    const got = (await readTree(page)).map((r) => r.t.join());
    const exp = await expect(page, t);
    ok(JSON.stringify(got) === JSON.stringify(exp), `[${tag}] ${t} (${kind}): cây khớp FUSION (${got.length} dòng)`);
    const bad = await overflow(page);
    ok(!bad.length, `[${tag}] ${t}: không tràn chữ ${bad.join(' | ')}`);
    if (kind === 'vang') ok(await page.locator('#roster .ev-top').count() === 1, `[${tag}] tướng Vàng ghi "Bậc cao nhất"`);
    if (kind === 'tim') {
      const lock = (await readTree(page)).flatMap((r) => r.lock);
      ok(!lock.includes('lyngu') && lock.includes('llq'), `[${tag}] tướng chưa sở hữu hiện "Chưa có" (đã có Lý Ngư, chưa có Lạc Long Quân)`);
    }
    await page.locator('#roster .ev-tree').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SHOT, `${tag}-${kind}.png`) });
  }
  // chạm chân dung chuyển tướng
  await page.evaluate(() => ui.showRoster('thosan')); await page.waitForTimeout(150);
  const target = await page.evaluate(() => document.querySelector('#roster .ev-row .ev-p:last-of-type').dataset.type);
  await page.locator('#roster .ev-row .ev-p').nth(2).click(); await page.waitForTimeout(200);
  ok(await page.evaluate(() => ui.rosterSel) === target, `[${tag}] chạm chân dung → chuyển sang ${target}`);
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

// v154: trong trận KHÔNG còn gợi ý phát triển; bảng chỉ số chỉ hiện khi GIỮ chân dung ở thanh đáy
async function battleCase(w, h, tag, touch = false) {
  const { browser, page, errors } = await open(w, h, { owned: ['lachau'] });
  await enter(page, 0);
  await page.evaluate(() => {
    game.running = false; game.gold = 999;
    const s = game.freeSlots()[0]; const h = game.spawnHero(s, 'lucsi'); h.tier = 2; ui.sel = s; ui.sig.deck = null;
  });
  await page.waitForTimeout(250);
  const vis = () => page.evaluate(() => { const e = document.querySelector('#hero-stats'); return !e.hidden && e.offsetHeight > 0 ? e.textContent : null; });
  ok(await page.locator('#deck .dk-pt').count() === 1, `[${tag}] chọn tướng → thanh đáy hiện chân dung`);
  ok(!(await vis()), `[${tag}] chọn tướng: chưa có bảng chỉ số`);
  ok(!/Phát triển/.test(await page.evaluate(() => document.querySelector('#game').innerText)) && await page.locator('.dk-evo, .hs-evo').count() === 0, `[${tag}] không còn dòng "Phát triển" trong trận`);
  await page.click('#deck .dk-info'); await page.waitForTimeout(250);
  ok(!(await vis()), `[${tag}] chạm ô tên tướng không mở bảng`);
  const box = await page.locator('#dk-portrait').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const down = () => (cdp ? cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] }) : page.mouse.move(cx, cy).then(() => page.mouse.down()));
  const up = () => (cdp ? cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) : page.mouse.up());
  // chạm nhanh chân dung: không mở
  await down(); await page.waitForTimeout(80); await up(); await page.waitForTimeout(250);
  ok(!(await vis()), `[${tag}] chạm nhanh chân dung → không hiện bảng`);
  // giữ 500ms: hiện
  await down(); await page.waitForTimeout(500);
  const txt = await vis();
  ok(txt && /lực chiến/.test(txt) && /Sát thương/.test(txt) && !/Phát triển/.test(txt), `[${tag}] giữ chân dung 0,5s → bảng chỉ số có "lực chiến", không có "Phát triển"`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-giu-chiso${touch ? '-cham' : ''}.png`) });
  const geo = await page.evaluate(() => {
    // xoay dọc (#wrap.rot quay 90°): đổi về toạ độ trong màn chơi
    const rot = document.querySelector('#wrap').classList.contains('rot');
    const R = (q) => { const r = document.querySelector(q).getBoundingClientRect();
      return rot ? { left: r.top, right: r.bottom, top: -r.right, bottom: -r.left, height: r.width } : r; };
    const s = R('#hero-stats'), d = R('#deck'), p = R('#dk-portrait'), g = R('#game');
    return { rot, above: s.bottom <= d.top + 1, inside: s.left >= g.left - 1 && s.right <= g.right + 1 && s.top >= g.top - 1, nearPt: Math.abs(s.left - p.left) < 40 || s.right >= g.right - 8, h: Math.round(s.height), gh: Math.round(g.height) };
  });
  ok(geo.above && geo.inside && geo.nearPt && geo.h < geo.gh * 0.5, `[${tag}] bảng nằm trên thanh đáy, căn theo chân dung, gọn ${JSON.stringify(geo)}`);
  ok(await page.evaluate(() => !document.querySelector('#more') || document.querySelector('#more').hidden), `[${tag}] khi giữ: thanh thao tác nổi tạm ẩn`);
  await up(); await page.waitForTimeout(200);
  ok(!(await vis()), `[${tag}] thả tay → bảng ẩn`);
  ok(await page.evaluate(() => !String(getSelection())), `[${tag}] giữ không bôi đen chữ`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-tran.png`) });
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await rosterCase(844, 390, '844x390');
  await rosterCase(667, 375, '667x375');
  await rosterCase(800, 360, 'ngang-800x360');
  await battleCase(844, 390, '844x390');
  await battleCase(667, 375, '667x375');
  await battleCase(844, 390, '844x390', true);
  await battleCase(800, 360, 'ngang-800x360');
  console.log('\nTẤT CẢ ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
