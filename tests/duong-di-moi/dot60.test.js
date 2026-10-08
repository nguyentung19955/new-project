// Vô tận đợt 60: sự kiện thử thách + đổi màn (sau đợt boss) cùng lúc → banner sự kiện / boss / "Màn N" hiện lần lượt,
// không banner nào bị cái sau đè mất trước khi hết giờ. Chạy: node tests/duong-di-moi/dot60.test.js (thường + pixel)
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

(async () => {
  for (const pixel of [false, true]) {
    const tag = pixel ? 'pixel' : 'thuong';
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 }, pixel ? (p) => p.addInitScript(() => { window.PIXEL_BAT_EP = true; }) : null);
    await enter(page, 0, true);
    // tua tới hết đợt 58 (im lặng), ghi lại mọi lần banner đổi chữ
    await page.evaluate(() => {
      const h = ui.handleEvents.bind(ui);
      ui.handleEvents = () => { game.events = []; };
      for (let w = 1; w <= 58; w++) { game.wave = w; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.lives = 9999; game.waveComplete(); }
      ui.handleEvents = h; game.events = [];
      ui.rosterKey = rosterKeyOf(rosterFor(59, game.level, game.stLv())); ui.rosterLevel = game.level;   // như đã chơi thật tới đây
      window.BN = [];
      const rec = () => { const b = document.querySelector('#banner'); if (!b.hidden) { const t = b.textContent.trim(); const l = BN[BN.length - 1]; if (!l || l.t !== t || l.off) BN.push({ t, at: performance.now() }); } else if (BN.length && !BN[BN.length - 1].off) BN[BN.length - 1].off = performance.now(); };
      new MutationObserver(rec).observe(document.querySelector('#banner'), { attributes: true, childList: true, subtree: true, characterData: true });
    });
    const step = async (fn, ms, shot) => {
      await page.evaluate(fn);
      if (shot) { await page.waitForTimeout(400); await page.screenshot({ path: path.join(SHOT, `dot60-${shot}-${tag}.png`) }); ms -= 400; }
      await page.waitForTimeout(ms);
    };
    const end = () => { game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); };
    await step(() => { game.wave = 59; game.waveActive = true; game.spawnQueue = []; game.enemies = []; game.waveComplete(); }, 3000, 'bao-truoc');
    await step(() => { game.startWave(); }, 3400, 'mo-man');
    await page.screenshot({ path: path.join(SHOT, `dot60-mo-man-2-${tag}.png`) });
    await step(() => { game.wave = 60; game.spawnQueue = []; game.enemies = []; game.waveActive = true; game.waveComplete(); }, 6000, 'doi-man');
    await page.screenshot({ path: path.join(SHOT, `dot60-doi-man-2-${tag}.png`) });
    const bn = await page.evaluate(() => BN.map((b) => ({ t: b.t, dur: Math.round((b.off || performance.now()) - b.at) })));
    console.log(`  [${tag}] banner:`, bn.map((b) => `${b.t} (${b.dur}ms)`).join(' → '));
    const iMan = bn.findIndex((b) => /Màn \d+/.test(b.t));
    ok(iMan >= 0 && !bn.slice(iMan + 1).some((b) => /sự kiện/i.test(b.t)), `[${tag}] không còn banner sự kiện đợt 60 hiện muộn sau khi đã vượt đợt`);
    const ev = bn.filter((b) => /sự kiện/i.test(b.t)), man = bn.filter((b) => /Màn \d+/.test(b.t));
    ok(ev.length >= 1, `[${tag}] có banner sự kiện đợt 60`);
    ok(man.length === 1, `[${tag}] có đúng 1 banner "Màn N" sau đợt 60`);
    const cut = bn.filter((b) => b.dur < 2000);
    ok(cut.length === 0, `[${tag}] không banner nào bị đè mất trước khi hết giờ` + (cut.length ? ': ' + cut.map((b) => b.t).join(' | ') : ''));
    ok(errors.length === 0, `[${tag}] không lỗi JS` + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
