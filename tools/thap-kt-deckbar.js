// Chụp thanh bài trong trận (5 thẻ + chỉ huy + mana + SUMMON) ở 360/390/430 rộng, DPR3, 2 trạng thái mana.
// BASE=http://localhost:8765 OUT=docs/demo-hop-tuong/tuvan/vetay/board/deckbar_sau_ node tools/thap-kt-deckbar.js
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765', OUT = process.env.OUT || 'shots/deckbar_';
(async () => {
  const b = await chromium.launch(); const kq = {};
  for (const w of [360, 390, 430]) for (const [ten, mana] of [['du', 3000], ['thieu', 20]]) {
    const h = Math.round(w * 844 / 390);
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`${BASE}/thap/?mode=solo&deck=lophanung,radar,lien,bang,canon&mana=${mana}&notut=1`, { waitUntil: 'load' });
    await p.waitForTimeout(3500);
    for (let i = 0; i < 2; i++) { await p.mouse.click(w / 2, h * 0.56); await p.waitForTimeout(600); }
    await p.evaluate((m) => { G.ban[0].mana = m; }, mana);
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const e = $('#duoi').getBoundingClientRect(); return { x: e.left, y: e.top - 6, width: e.width, height: e.height + 6 }; });
    await p.screenshot({ path: OUT + w + '_' + ten + '.png', clip: r });
    kq[w + ten] = errs.slice(0, 3);
    await p.close();
  }
  console.log(JSON.stringify(kq)); await b.close();
})();
