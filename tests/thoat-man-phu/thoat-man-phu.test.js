// claude/sua-thoat-than-khi: vào màn Thần Khí xong không thoát ra được (nút Quay lại gắn nhầm 'hx-close' từ v170).
// Mở / đóng từng màn phụ bằng nút quay lại / ✕, phím Esc và nút Back của trình duyệt ở 4 cỡ màn;
// sau khi đóng: không còn lớp phủ chặn chạm, game chạy tiếp.
// Chạy: node tests/thoat-man-phu/thoat-man-phu.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

const OVERLAYS = ['#screen', '#legends', '#more', '#drawer', '#roster', '#runes', '#settings', '#ranks', '#treasury', '#modes', '#campaign', '#feedback'];
const SAVE = { owned: ['giong', 'lacLong', 'kimquy'], kho: 99999 };

// các lớp phủ đang hiện (bỏ qua lớp được phép)
const shown = (page, allow = []) => page.evaluate(([ids, allow]) => ids.filter((id) => !allow.includes(id) && !document.querySelector(id).hidden), [OVERLAYS, allow]);
const legacyOn = (page) => page.evaluate(() => !!document.querySelector('#roster .lg-body') && !document.querySelector('#roster').hidden);
const back = async (page) => { await page.evaluate(() => history.back()); await page.waitForTimeout(250); };
const esc = async (page) => { await page.keyboard.press('Escape'); await page.waitForTimeout(200); };
// 3 cách đóng: nút trên màn, Esc, Back của trình duyệt
const WAYS = ['nút', 'Esc', 'Back'];

(async () => {
  for (const [w, h, name] of [[1920, 934, '1920x934'], [844, 390, '844x390'], [667, 375, '667x375'], [800, 360, 'ngang-800x360']]) {
    console.log(name);
    const { browser, page, errors } = await open(w, h, SAVE);

    // ---------- ngoài trận: Menu → Anh Hùng → Thần Khí
    for (const way of WAYS) {
      await page.click('#btn-heroes'); await page.waitForTimeout(250);
      await page.evaluate(() => ui.action({ act: 'ro-sel', type: 'giong' })); await page.waitForTimeout(150);
      await page.click('#roster [data-act=lg-open]'); await page.waitForTimeout(250);
      ok(await legacyOn(page), `${name} menu: mở Thần Khí`);
      if (way === 'nút') {
        await page.screenshot({ path: path.join(SHOT, `than-khi-menu-${name}.png`) });
        // nâng cấp trong màn rồi mới thoát
        await page.click('#roster [data-act=lg-buy]'); await page.waitForTimeout(200);
        ok(await legacyOn(page), `${name} menu: nâng cấp xong vẫn ở Thần Khí`);
        const b = await page.evaluate(() => { const b = document.querySelector('#roster .scr-head .xbtn'), r = b.getBoundingClientRect();
          const e = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
          return { act: b.dataset.act, vis: r.width > 20 && r.height > 20, top: !!e && b.contains(e) }; });
        ok(b.act === 'lg-close' && b.vis && b.top, `${name} menu: nút Quay lại của Thần Khí hiện rõ, không bị che (${b.act})`);
        await page.click('#roster .scr-head .xbtn');
      } else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(200);
      ok(!(await legacyOn(page)) && await page.evaluate(() => !document.querySelector('#roster').hidden && !!document.querySelector('#roster [data-act=lg-open]')),
        `${name} menu: ${way} → thoát Thần Khí về Anh Hùng`);
      if (way === 'nút') await page.click('#roster .scr-head [data-act=ro-back]'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(250);
      ok(await page.evaluate(() => !document.querySelector('#menu').hidden) && (await shown(page)).length === 0, `${name} menu: ${way} → Anh Hùng về menu chính, không còn lớp phủ`);
    }
    // ngoài trận: Ấn Phù
    for (const way of WAYS) {
      await page.evaluate(() => ui.showRunes(false)); await page.waitForTimeout(200);
      ok(await page.evaluate(() => !document.querySelector('#runes').hidden), `${name} menu: mở Ấn Phù`);
      if (way === 'nút') await page.click('#runes [data-act=rn-back]'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(200);
      ok(await page.evaluate(() => !document.querySelector('#menu').hidden) && (await shown(page)).length === 0, `${name} menu: ${way} → đóng Ấn Phù về menu`);
    }

    // ---------- trong trận
    await enter(page, 0);
    await page.evaluate(() => { game.gold = 99999; game.summonRandom(); game.summonRandom(); game.running = true; });
    await page.waitForTimeout(300);
    const running = () => page.evaluate(() => game.running);
    ok(await running(), `${name} trận: game đang chạy`);

    // Thần Khí trong trận: ≡ → Anh Hùng → Thần Khí
    for (const way of WAYS) {
      await page.click('#btn-menu'); await page.waitForTimeout(150);
      await page.click('#drawer [data-act=dw][data-k=heroes]'); await page.waitForTimeout(250);
      ok(!(await running()), `${name} trận: mở Anh Hùng → tạm dừng`);
      await page.evaluate(() => ui.action({ act: 'ro-sel', type: 'giong' })); await page.waitForTimeout(150);
      await page.click('#roster [data-act=lg-open]'); await page.waitForTimeout(250);
      ok(await legacyOn(page), `${name} trận: mở Thần Khí`);
      if (way === 'nút') {
        await page.click('#roster [data-act=lg-buy]'); await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(SHOT, `than-khi-tran-${name}.png`) });
        await page.click('#roster .scr-head .xbtn');
      } else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(200);
      ok(!(await legacyOn(page)) && await page.evaluate(() => !document.querySelector('#roster').hidden), `${name} trận: ${way} → Thần Khí về Anh Hùng`);
      if (way === 'nút') await page.click('#roster .scr-head [data-act=ro-back]'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(250);
      ok((await shown(page)).length === 0 && await running(), `${name} trận: ${way} → về trận, không còn lớp phủ, game chạy tiếp`);
    }
    await page.screenshot({ path: path.join(SHOT, `sau-dong-tran-${name}.png`) });

    // Ấn Phù trong trận
    for (const way of WAYS) {
      await page.click('#btn-menu'); await page.waitForTimeout(150);
      await page.click('#drawer [data-act=dw][data-k=runes]'); await page.waitForTimeout(250);
      ok(await page.evaluate(() => !document.querySelector('#runes').hidden) && !(await running()), `${name} trận: mở Ấn Phù (tạm dừng)`);
      if (way === 'nút') await page.click('#runes [data-act=rn-back]'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(250);
      ok((await shown(page)).length === 0 && await running(), `${name} trận: ${way} → đóng Ấn Phù, game chạy tiếp`);
    }

    // các bảng #screen: Cây kỹ năng, Tiến hoá, Bách khoa, Túi đồ
    for (const kind of ['skills', 'evo', 'codex', 'bag']) {
      for (const way of WAYS) {
        await page.evaluate((k) => ui.openScreen(k), kind); await page.waitForTimeout(250);
        ok(await page.evaluate((k) => !document.querySelector('#screen').hidden && ui.screen && ui.screen.kind === k, kind), `${name} trận: mở ${kind}`);
        if (way === 'nút') {
          if (kind === 'evo' && name === '844x390') await page.screenshot({ path: path.join(SHOT, `tien-hoa-${name}.png`) });
          await page.click('#screen .scr-head [data-act=close]');
        } else if (way === 'Esc') await esc(page); else await back(page);
        await page.waitForTimeout(200);
        ok((await shown(page)).length === 0 && await page.evaluate(() => !ui.screen) && await running(), `${name} trận: ${way} → đóng ${kind}, game chạy tiếp`);
      }
    }

    // Cây kỹ năng / Tiến hoá của tướng KHÔNG có bí ẩn riêng (trước đây lỗi JS → #screen trống không có nút ✕)
    for (const type of ['dotnuong', 'lactuong']) {
      const slot = await page.evaluate((t) => { const s = game.heroes.findIndex((x) => !x); game.placeHero(s, t); ui.sel = s; return s; }, type);
      for (const kind of ['skills', 'evo']) {
        await page.evaluate((k) => ui.openScreen(k), kind); await page.waitForTimeout(200);
        ok(await page.evaluate(() => !!document.querySelector('#screen .scr-head [data-act=close]')), `${name} trận: ${kind} của ${type} dựng được, có nút ✕`);
        if (type === 'dotnuong' && kind === 'skills') await page.screenshot({ path: path.join(SHOT, `cay-ky-nang-${name}.png`) });
        await page.click('#screen .scr-head [data-act=close]'); await page.waitForTimeout(150);
        ok((await shown(page)).length === 0 && await running(), `${name} trận: đóng ${kind} của ${type}`);
      }
      await page.evaluate((s) => { ui.clearSel(); }, slot);
      await page.waitForTimeout(150);
    }

    // bảng Hợp thể (#legends) và menu ≡ (#drawer)
    for (const way of ['nút', 'Esc', 'Back']) {
      await page.evaluate(() => ui.openLegends(true)); await page.waitForTimeout(200);
      ok(await page.evaluate(() => !document.querySelector('#legends').hidden), `${name} trận: mở Hợp thể`);
      if (way === 'nút') await page.click('#legends [data-act=hx-close]'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(200);
      ok((await shown(page)).length === 0 && await running(), `${name} trận: ${way} → đóng Hợp thể`);
      await page.click('#btn-menu'); await page.waitForTimeout(150);
      ok(await page.evaluate(() => !document.querySelector('#drawer').hidden), `${name} trận: mở menu ≡`);
      if (way === 'nút') await page.click('#btn-menu'); else if (way === 'Esc') await esc(page); else await back(page);
      await page.waitForTimeout(200);
      ok((await shown(page)).length === 0 && await running(), `${name} trận: ${way} → đóng menu ≡`);
    }

    // không còn gì để đóng: Esc không làm hỏng trận, chạm vào sân vẫn tới canvas
    await esc(page);
    const hit = await page.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect();
      const e = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
      return e && (e.tagName === 'CANVAS' || !e.closest('.overlay, .screen, #legends, #more, #drawer')); });
    ok(hit && await running(), `${name} trận: giữa sân không bị lớp phủ chặn, game chạy`);
    ok(errors.length === 0, `${name}: không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  console.log('OK');
})().catch((e) => { console.error(e.message); process.exit(1); });
