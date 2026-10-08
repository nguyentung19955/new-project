// Test claude/an-cong-ky-nang + claude/bo-diem-thua: KHÔNG còn nút "+1đ / +2 SỨC" (thanh tướng) hay "Nâng chỉ số" (Cây kỹ năng).
// Điểm kỹ năng chỉ dùng nâng kỹ năng; cả 4 kỹ năng max (hoặc tướng thăng thần) → điểm tự đổi thành chỉ số, toast 1 lần.
// Ô kỹ năng chỉ sáng "canup" khi thật sự nâng được; chip "Còn N điểm" chỉ hiện khi còn kỹ năng nâng được.
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
    return { stat: !!document.querySelector('[data-act="sk-stat-deck"], [data-act="sk-stat"], .dk-sk.stat'), canup: document.querySelectorAll('#deck .dk-sk.canup').length,
      pts: h.skillPts, statPts: h.statPts || 0, max: game.skillsMaxed(h) };
  });
  await page.evaluate(() => {
    game.gold = 1e6; const [a] = game.freeSlots(); const hh = game.spawnHero(a, 'lucsi'); hh.summonT = 0;
    hh.level = 25; hh.skillPts = 3;
    HEROES[hh.type].skills.forEach((sk, i) => { hh.skillLv[sk.id] = 2; });
    ui.sel = a; ui.spot = -1; ui.armed = null;
  });
  let s = await st();
  ok(!s.stat && s.canup === 4 && !s.max, `[${tag}] chưa max + còn điểm → 4 ô sáng, không nút cộng chỉ số (${JSON.stringify(s)})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-chua-max.png`) });
  // còn điểm nhưng thiếu cấp tướng → không ô sáng, không nút; Cây kỹ năng không có "Nâng chỉ số" và không chip "Còn N điểm"
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.level = 4; hh.skillPts = 3; HEROES[hh.type].skills.forEach((sk, i) => { hh.skillLv[sk.id] = i < 2 ? 2 : 0; }); });
  s = await st();
  ok(!s.stat && s.canup === 0 && s.pts === 3, `[${tag}] thiếu cấp → không gợi ý gì (${JSON.stringify(s)})`);
  const tree = await page.evaluate(async () => { ui.openScreen('skills'); await new Promise((r) => setTimeout(r, 300));
    const t = document.body.innerText; const r = { nangCS: /Nâng chỉ số/.test(t), chip: /Còn \d+ điểm kỹ năng/.test(t), btn: !!document.querySelector('[data-act="sk-stat"]') }; return r; });
  ok(!tree.nangCS && !tree.chip && !tree.btn, `[${tag}] Cây kỹ năng: không nút Nâng chỉ số / chip điểm (${JSON.stringify(tree)})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-cay-thieu-cap.png`) });
  await page.evaluate(() => ui.closeScreen());
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.level = 25; HEROES[hh.type].skills.forEach((sk) => { hh.skillLv[sk.id] = 2; }); });
  // hết điểm → không ô nào sáng, không nút +1đ
  await page.evaluate(() => { game.heroes[ui.sel].skillPts = 0; });
  s = await st();
  ok(!s.stat && s.canup === 0, `[${tag}] hết điểm → không gợi ý cộng (${JSON.stringify(s)})`);
  // nâng full: Q W E 4, R 3 (còn dư điểm)
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.skillPts = 10; for (let k = 0; k < 6; k++) for (let i = 0; i < 4; i++) game.upgradeSkill(hh, i); });
  s = await st();
  ok(s.max && !s.stat && s.canup === 0, `[${tag}] max hết → ẩn nút +1đ, không ô sáng (${JSON.stringify(s)})`);
  ok(s.pts === 0 && s.statPts === 3, `[${tag}] điểm dư tự đổi thành chỉ số (${JSON.stringify(s)})`);
  await page.waitForTimeout(300);
  const toasts = await page.evaluate(() => document.body.innerText.split('Kỹ năng đã tối đa — điểm dư cộng vào chỉ số').length - 1);
  ok(toasts === 1, `[${tag}] toast "Kỹ năng đã tối đa" hiện 1 lần (${toasts})`);
  await page.screenshot({ path: path.join(SHOT, `${tag}-da-max.png`) });
  // lên cấp tiếp khi đã max: điểm mới cũng tự đổi, không hiện lại nút
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.level = 20; game.levelUp(hh); });
  s = await st();
  ok(!s.stat && s.pts === 0 && s.statPts === 4, `[${tag}] lên cấp khi đã max → không hiện lại, +1 chỉ số (${JSON.stringify(s)})`);
  await page.waitForTimeout(300);
  const toasts2 = await page.evaluate(() => game.events.filter((e) => e.type === 'autoStat').length + (game.autoStatTold ? 1 : 0));
  ok(toasts2 === 1, `[${tag}] không phát lại toast lần 2 (${toasts2})`);
  // còn kỹ năng có thể nâng (giảm R về 2) + có điểm → ô R sáng, vẫn không có nút cộng chỉ số
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.skillLv[HEROES[hh.type].skills[3].id] = 2; hh.skillPts = 1; });
  s = await st();
  ok(!s.stat && s.canup === 1 && !s.max, `[${tag}] còn kỹ năng nâng được → ô sáng (${JSON.stringify(s)})`);
  // tướng thăng thần (nâng kỹ năng bằng vàng): điểm kỹ năng tự đổi khi lên cấp
  await page.evaluate(() => { const hh = game.heroes[ui.sel]; hh.from = hh.type; hh.skillPts = 0; hh.level = 20; game.levelUp(hh); });
  s = await st();
  ok(!s.stat && s.pts === 0 && s.statPts === 5, `[${tag}] thăng thần → điểm tự đổi (${JSON.stringify(s)})`);
  ok(!errors.length, `[${tag}] không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h] of [[844, 390], [1920, 934]]) await run(w, h);
  console.log('OK an-cong-ky-nang');
})().catch((e) => { console.error(e); process.exit(1); });
