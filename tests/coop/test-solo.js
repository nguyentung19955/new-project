'use strict';
// Chơi đơn phải giữ nguyên hành vi: không lỗi, Math.random vẫn dùng (không seed), vàng một ví, chạy nhiều đợt.
const { launch, openGame, check } = require('./harness');

async function run(browser) {
  console.log('• Chơi đơn (không co-op)');
  const errors = [];
  const page = await openGame(browser, { errors });
  const r = await page.evaluate(async () => {
    const g = game;
    ui.startLevel(0);
    document.querySelector('#prep').hidden = true;
    const out = { coop: SIM.coop, co: g.co === undefined || g.co === null, goldDesc: !!Object.getOwnPropertyDescriptor(g, 'gold').get };
    // Math.random chưa bị thay: srand() ngoài co-op gọi Math.random
    const orig = Math.random; let called = 0; Math.random = () => { called++; return orig(); };
    srand(); Math.random = orig; out.mathRandom = called === 1;
    // bấm ▶ như người chơi, tự triệu hồi / lên cấp, chạy nhanh nhiều đợt
    document.querySelector('#btn-run').click();
    out.running = g.running;
    for (let i = 0; i < 9000 && !g.over && g.wave < 6; i++) {
      if (i % 30 === 0) {
        if (g.offer) ui.pickOffer(0); else if (g.canSummon() === true) ui.summonRand();
        const h = g.heroes.find((x) => x && g.gold > g.levelCost(x) + 40);
        if (h) ui.doLevelUp(h);
        if (i % 300 === 0) ui.action({ act: 'auto-merge' });
      }
      g.update(1 / 30);
      ui.tick(1 / 30);
    }
    out.wave = g.wave; out.heroes = g.heroes.filter(Boolean).length; out.over = g.over; out.gold = g.gold;
    // lưu / tiếp tục trận vẫn chạy
    ui.saveRun(); out.saved = !!ui.save.run;
    return out;
  });
  check(r.coop === false && r.co, 'chế độ đơn không bật SIM.coop / game.co');
  check(r.goldDesc === false, 'vàng là thuộc tính thường (một ví)');
  check(r.mathRandom, 'srand() ngoài co-op dùng Math.random như cũ');
  check(r.running, 'nút ▶ bắt đầu trận');
  check(r.wave >= 3, `chạy được nhiều đợt (đợt ${r.wave}, ${r.heroes} tướng, vàng ${Math.round(r.gold)})`);
  check(r.saved || r.over, 'lưu trận để tiếp tục vẫn hoạt động');
  // vòng lặp thật (requestAnimationFrame) vẫn chạy game.update
  const t0 = await page.evaluate(() => game.time);
  await page.waitForTimeout(800);
  const t1 = await page.evaluate(() => game.time);
  check(t1 > t0 || (await page.evaluate(() => game.over)), 'vòng lặp khung hình vẫn chạy mô phỏng chơi đơn');
  check(errors.length === 0, 'không có lỗi JS' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await page.context().close();
}

module.exports = run;
if (require.main === module) launch().then(async (b) => { try { await run(b); } finally { await b.close(); } }).catch((e) => { console.error(e.message || e); process.exit(1); });
