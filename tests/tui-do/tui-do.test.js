// v157: bỏ ô gợi ý đeo đồ nổi (#quick-eq); thêm nút Túi đồ ở cột nút góc phải dưới.
// Chạy: node tests/tui-do/tui-do.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

(async () => {
  for (const [w, h, name] of [[844, 390, '844x390'], [667, 375, '667x375'], [390, 844, 'xoay-doc-390x844']]) {
    console.log(name);
    const { browser, page, errors } = await open(w, h);
    await enter(page, 0);
    ok(await page.$('#quick-eq') === null, `${name}: không còn ô gợi ý đồ #quick-eq`);
    // triệu hồi 1 tướng + rơi đồ tốt hơn (trước đây sẽ bật ô gợi ý)
    await page.evaluate(() => { game.gold = 5000; game.summonRandom(); });
    await page.waitForTimeout(200);
    const hasHero = await page.evaluate(() => game.heroes.some(Boolean));
    ok(hasHero, `${name}: có tướng trên sân`);
    await page.evaluate(() => { for (const id of ['riu_dong', 'ao_vai', 'mu_long_chim']) game.addItem(id); });
    await page.waitForTimeout(700);
    // giao diện cập nhật theo khung hình: máy bận / chạy song song thì 700 ms chưa chắc đủ → chờ chấm báo hiện (tối đa 5 giây)
    await page.waitForFunction(() => { const d = document.querySelector('#auto-btns [data-act=open-bag] .dot'); return d && !d.hidden; }, null, { timeout: 5000 }).catch(() => {});
    // nút Túi đồ: hiện, nằm trong màn hình, không đè 2 nút kia, có chấm báo đồ mới
    const m = await page.evaluate(() => {
      const bs = [...document.querySelectorAll('#auto-btns .ab')].map((b) => b.getBoundingClientRect());
      const bag = document.querySelector('#auto-btns [data-act=open-bag]');
      const r = bag.getBoundingClientRect();
      const inside = (x) => x.left >= -1 && x.top >= -1 && x.right <= innerWidth + 1 && x.bottom <= innerHeight + 1;
      let over = false;
      for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i], b = bs[j];
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) over = true;
      }
      const vis = getComputedStyle(bag).visibility !== 'hidden' && r.width > 20 && r.height > 20;
      // phần tử trên cùng tại tâm nút phải là chính nút (không bị che)
      const top = (() => { const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2; const e = document.elementFromPoint(cx, cy); return !!e && bag.contains(e); })();
      return { n: bs.length, vis, top, all: bs.every(inside), over, dot: !bag.querySelector('.dot').hidden };
    });
    const rot = await page.evaluate(() => document.querySelector('#wrap').classList.contains('rot'));
    ok(m.n === 3 && m.vis && m.all && !m.over, `${name}: 3 nút (Túi đồ, Nâng đồ, Mặc đồ) hiện, trong màn hình, không đè nhau (rot=${rot})`);
    if (!rot) ok(m.top, `${name}: nút Túi đồ không bị phần tử khác che`);
    ok(m.dot, `${name}: chấm báo đồ mới trên nút Túi đồ`);
    await page.screenshot({ path: path.join(SHOT, `nut-${name}.png`) });
    // bấm Túi đồ → mở bảng túi đồ có sẵn, chấm tắt
    await page.click('#auto-btns [data-act=open-bag]');
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ open: !document.querySelector('#screen').hidden, kind: ui.screen && ui.screen.kind }));
    ok(st.open && st.kind === 'bag', `${name}: bấm nút mở Túi đồ`);
    await page.screenshot({ path: path.join(SHOT, `tui-${name}.png`) });
    await page.evaluate(() => ui.closeScreen ? ui.closeScreen() : (document.querySelector('#screen').hidden = true));
    await page.waitForTimeout(700);
    ok(await page.evaluate(() => document.querySelector('#auto-btns [data-act=open-bag] .dot').hidden), `${name}: xem túi rồi thì tắt chấm`);
    // nút Mặc đồ vẫn mặc được
    const before = await page.evaluate(() => game.inventory.length);
    await page.click('#auto-btns [data-act=auto-eq-all]');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => game.inventory.length);
    ok(after < before, `${name}: nút Mặc đồ vẫn mặc (${before} → ${after} món trong túi)`);
    // kéo tướng: thùng Hủy hiện đúng chỗ
    const slot = await page.evaluate(() => game.heroes.findIndex(Boolean));
    await page.evaluate((s) => ui.showTrash(s), slot);
    await page.waitForTimeout(200);
    const t = await page.evaluate(() => { const r = document.querySelector('#trash').getBoundingClientRect(); return { vis: !document.querySelector("#trash").hidden, cls: document.querySelector("#wrap").classList.contains("dragging-hero"), w: Math.max(r.width, r.height) }; });
    ok(t.vis && t.cls && t.w > 100, `${name}: kéo tướng → thùng Hủy hiện`);
    await page.evaluate(() => ui.hideTrash && ui.hideTrash());
    ok(errors.length === 0, `${name}: không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('OK');
})().catch((e) => { console.error(e.message); process.exit(1); });
