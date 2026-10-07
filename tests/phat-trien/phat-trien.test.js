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

async function battleCase(w, h, tag) {
  const { browser, page, errors } = await open(w, h, { owned: ['lachau'] });
  await enter(page, 0);
  // đặt Lực Sĩ ★★ (Lạc Hầu = Lực Sĩ + Người Đắp Đê) lên sân, chưa có Người Đắp Đê
  await page.evaluate(() => {
    game.running = false; game.gold = 5000;
    const s = game.freeSlots()[0]; const h = game.spawnHero(s, 'lucsi'); h.tier = 2; ui.sel = s; ui.sig.deck = null;
  });
  await page.waitForTimeout(200);
  const txt = await page.evaluate(() => { const e = document.querySelector('#deck .dk-evo'); return e && e.textContent.replace(/\s+/g, ' ').trim(); });
  ok(txt && /Phát triển/.test(txt) && /Lạc Hầu|cần/.test(txt), `[${tag}] trong trận thấy dòng gợi ý: "${txt}"`);
  ok(/cần Người Đắp Đê/.test(txt), `[${tag}] nói rõ còn thiếu Người Đắp Đê`);
  const geo = await page.evaluate(() => {
    const e = document.querySelector('#deck .dk-evo').getBoundingClientRect(), d = document.querySelector('#deck').getBoundingClientRect();
    const g = document.querySelector('#game').getBoundingClientRect();
    const el = document.querySelector('#deck .dk-evo');
    return { inside: e.left >= g.left - 1 && e.right <= g.right + 1 && e.top >= g.top, above: e.bottom <= d.top + 1, deckFits: d.left >= g.left - 1 && d.right <= g.right + 1, clip: el.scrollWidth - el.clientWidth };
  });
  ok(geo.inside && geo.above && geo.deckFits, `[${tag}] gợi ý nằm trên thanh đáy, không lệch khỏi màn ${JSON.stringify(geo)}`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-tran.png`) });
  await page.click('#deck .dk-evo'); await page.waitForTimeout(200);
  const st = await page.evaluate(() => ({ leg: !document.querySelector('#legends').hidden, hl: (document.querySelector('#lg-grid .asc-row.hl') || {}).dataset, ff: ui.fuseFocus && FUSION[ui.fuseFocus.i].to }));
  ok(st.leg && st.hl && st.ff === 'lachau', `[${tag}] chạm gợi ý → mở Cây hợp thể, sáng công thức ${st.ff}`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-cay.png`) });
  // bảng chỉ số
  await page.evaluate(() => { document.querySelector('#legends').hidden = true; });
  await page.click('#deck .dk-info'); await page.waitForTimeout(250);
  ok(await page.locator('#hero-stats .hs-evo').count() >= 1 && await page.locator('#deck .dk-evo').count() === 0, `[${tag}] bảng chỉ số có dòng Phát triển (pill ẩn để khỏi đè)`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-chiso.png`) });
  ok(!errors.length, `[${tag}] không lỗi trang ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  await rosterCase(844, 390, '844x390');
  await rosterCase(667, 375, '667x375');
  await rosterCase(390, 844, 'doc-390x844');
  await battleCase(844, 390, '844x390');
  await battleCase(667, 375, '667x375');
  console.log('\nTẤT CẢ ĐẠT');
})().catch((e) => { console.error(e); process.exit(1); });
