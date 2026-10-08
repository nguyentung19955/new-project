// Test claude/an-cong-ky-nang: nút "+1đ" (cộng điểm dư vào chỉ số) cạnh 4 ô kỹ năng trên thanh tướng
// chỉ hiện khi còn điểm VÀ kỹ năng chưa max; cả 4 kỹ năng đã max → ẩn nút, điểm (có sẵn + nhận khi lên cấp) tự đổi thành chỉ số.
// Ô kỹ năng chỉ sáng "canup" khi thật sự nâng được (có điểm, chưa max, đủ cấp tướng).
// Chạy: node tests/an-cong-ky-nang/an-cong-ky-nang.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

async function run(w, h) {
  const tag = `${w}x${h}`;
  const { browser, page, errors } = await open(w, h, {});
  await enter(page, 0, true);
  const st = () => page.evaluate(() => {
    const h = game.heroes[ui.sel];
    ui.sig.deck = null; ui.updateDeck();
    return { stat: !!document.querySelector('#deck [data-act="sk-stat-deck"]'), canup: document.querySelectorAll('#deck .dk-sk.canup:not(.stat)').length,
      pts: h.skillPts, statPts: h.statPts || 0, max: game.skillsMaxed(h) };
  });
  await page.evaluate(() => {
    game.gold = 1e6; const [a] = game.freeSlots(); const hh = game.spawnHero(a, 'lucsi'); hh.summonT = 0;
    hh.level = 25; hh.skillPts = 3;
    HEROES[hh.type].skills.forEach((sk, i) => { hh.skillLv[sk.id] = 2; });
    ui.sel = a; ui.spot = -1; ui.armed = null;
  });
  let s = await st();
  ok(s.stat && s.canup === 4 && !s.max, `[${tag}] chưa max + còn điểm → hiện nút +1đ và 4 ô sáng (${JSON.stringify(s)})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-chua-max.png`) });
  // hết điểm → không ô nào sáng, không nút +1đ
  await page.evaluate(() => { game.heroes[ui.sel].skillPts = 0; });
  s = await st();
  ok(!s.stat && s.canup === 0, `[${tag}] hết điểm → không gợi ý cộng (${JSON.stringify(s)})`);
  // nâng full: Q W E 4, R 3 (còn dư điểm)
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.skillPts = 10; for (let k = 0; k < 6; k++) for (let i = 0; i < 4; i++) game.upgradeSkill(hh, i); });
  s = await st();
  ok(s.max && !s.stat && s.canup === 0, `[${tag}] max hết → ẩn nút +1đ, không ô sáng (${JSON.stringify(s)})`);
  ok(s.pts === 0 && s.statPts === 3, `[${tag}] điểm dư tự đổi thành chỉ số (${JSON.stringify(s)})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-da-max.png`) });
  // lên cấp tiếp khi đã max: điểm mới cũng tự đổi, không hiện lại nút
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.level = 20; game.levelUp(hh); });
  s = await st();
  ok(!s.stat && s.pts === 0 && s.statPts === 4, `[${tag}] lên cấp khi đã max → không hiện lại, +1 chỉ số (${JSON.stringify(s)})`);
  // còn kỹ năng có thể nâng (giảm R về 2) + có điểm → hiện lại
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.skillLv[HEROES[hh.type].skills[3].id] = 2; hh.skillPts = 1; });
  s = await st();
  ok(s.stat && s.canup === 1 && !s.max, `[${tag}] còn kỹ năng nâng được → hiện lại (${JSON.stringify(s)})`);
  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h] of [[844, 390], [1920, 934]]) await run(w, h);
  console.log('OK an-cong-ky-nang');
})().catch((e) => { console.error(e); process.exit(1); });
