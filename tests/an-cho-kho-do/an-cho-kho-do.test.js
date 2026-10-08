// an-cho-kho-do: mở bảng toàn màn (Túi đồ, Cây kỹ năng, Tiến hoá, Lò đúc, Bách khoa, Anh Hùng, Ấn phù, Cài đặt) thì
// thanh chợ + nút Hợp thể/Khoá + cột nút phải ẩn hẳn; đóng bảng thì hiện lại, vẫn mua được; không hỏng sửa lỗi dragging-hero (v213).
// Chạy: node tests/an-cho-kho-do/an-cho-kho-do.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok, noPixel } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

// phần tử nào của chợ còn nhìn thấy / chạm được (visibility + phần tử trên cùng tại tâm)
const shown = (page) => page.evaluate(() => {
  const out = [];
  for (const q of ['#deck', '#deck .mk-card', '#deck [data-act=legend-open]', '#deck [data-act=mk-lock]', '#fuse-strip', '#auto-btns']) {
    const e = document.querySelector(q);
    if (!e || e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (getComputedStyle(e).visibility === 'hidden') continue;
    const t = document.elementFromPoint((r.left + r.right) / 2, Math.min(innerHeight - 1, (r.top + r.bottom) / 2));
    if (t && e.contains(t)) out.push(q);
  }
  return out;
});
const closeAll = (page) => page.evaluate(() => { ui.closeScreen(); ui.clearSel(); for (const id of ['#roster', '#runes', '#settings']) document.querySelector(id).hidden = true; });

(async () => {
  for (const [w, h, px] of [[844, 390, 1], [844, 390, 0], [1920, 934, 1], [667, 375, 0]]) {
    const name = `${w}x${h}-px${px}`;
    console.log(name);
    const { browser, page, errors } = await open(w, h, {}, px ? null : noPixel());
    await enter(page, 0);
    await page.evaluate(() => { game.gold = 5000; game.summonRandom(); });
    await page.waitForTimeout(300);
    const base = await shown(page);
    ok(base.includes('#deck .mk-card') && base.includes('#auto-btns'), `${name}: trong trận chợ + cột nút hiện (${base.join(' ')})`);
    // bảng #screen
    for (const k of ['bag', 'skills', 'evo', 'forge', 'codex']) {
      await page.evaluate((k) => ui.openScreen(k), k);
      await page.waitForTimeout(250);
      const s = await shown(page);
      ok(s.length === 0 && await page.evaluate(() => document.querySelector('#wrap').classList.contains('panel-open')), `${name}: mở ${k} → chợ/Hợp thể/Khoá/cột nút ẩn (${s.join(' ') || 'không còn gì'})`);
      if (k === 'bag') await page.screenshot({ path: path.join(SHOT, `tui-${name}.png`) });
      await page.click('#screen [data-act=close]');
      await page.evaluate(() => ui.clearSel());   // mở túi/kỹ năng chọn sẵn 1 tướng → thanh đáy là thanh tướng; bỏ chọn để thấy chợ
      await page.waitForTimeout(250);
      const s2 = await shown(page);
      ok(s2.includes('#deck .mk-card') && s2.includes('#auto-btns'), `${name}: đóng ${k} → chợ hiện lại (${s2.join(' ')})`);
    }
    // bảng lớp phủ mở từ menu ≡
    for (const k of ['heroes', 'runes', 'pause']) {
      await page.click('#btn-menu'); await page.waitForTimeout(200);
      await page.click(`#drawer [data-k=${k}]`); await page.waitForTimeout(350);
      ok((await shown(page)).length === 0, `${name}: menu ≡ → ${k}: chợ ẩn`);
      await closeAll(page); await page.waitForTimeout(250);
      ok((await shown(page)).includes('#deck .mk-card'), `${name}: đóng ${k} → chợ hiện lại`);
    }
    // đang kéo tướng (dragging-hero) mà mở bảng: đóng bảng + thả → chợ hiện lại (không kẹt như v213)
    const slot = await page.evaluate(() => game.heroes.findIndex(Boolean));
    await page.evaluate((s) => ui.showTrash(s), slot);
    await page.evaluate(() => ui.openScreen('bag'));
    await page.waitForTimeout(200);
    ok((await shown(page)).length === 0, `${name}: kéo tướng + mở túi → chợ ẩn`);
    await page.evaluate(() => { ui.closeScreen(); ui.hideTrash(); ui.clearSel(); });
    await page.waitForTimeout(250);
    ok((await shown(page)).includes('#deck .mk-card'), `${name}: đóng túi + thả tướng → chợ hiện`);
    // vẫn mua được bằng chạm thẻ
    await page.evaluate(() => { const on = new Set(game.heroes.filter(Boolean).map((h) => h.type)); game.market.types = game.market.types.map((t) => (on.has(t) ? BASIC_HEROES.find((x) => !on.has(x)) : t)); ui.sig.deck = null; });
    await page.waitForTimeout(150);
    const n0 = await page.evaluate(() => game.heroes.filter(Boolean).length);
    await page.click('#deck .mk-card[data-mk="0"]');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => game.heroes.filter(Boolean).length) === n0 + 1, `${name}: sau khi đóng bảng chạm thẻ chợ vẫn mua được`);
    await page.screenshot({ path: path.join(SHOT, `tran-${name}.png`) });
    ok(errors.length === 0, `${name}: không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('OK');
})().catch((e) => { console.error(e.message); process.exit(1); });
