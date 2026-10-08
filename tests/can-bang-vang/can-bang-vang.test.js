// claude/can-bang-tuong-vang: test hồi quy cân bằng — máu Khó/Thường tăng dần theo đợt (Dễ giữ nguyên), Khó không giảm máu
// theo ải dễ, thưởng Thế trận + chip trên thanh trên, sàn hồi chiêu R, R toàn bản đồ đã hạ, và 2 trận bot ngắn:
// 1 tướng Vàng phép đơn độc ở ải 1 bật Khó phải mất mạng trước đợt 46 (trước đây ~đợt 56); đội 6 tướng Thường ở Dễ vẫn qua đợt 30.
const { open, enter, ok } = require('../cho-tuong/helpers');
const { run } = require('./mo-phong');

(async () => {
  const { browser, page, errors } = await open(844, 390, {});
  await enter(page, 0, false);
  const r = await page.evaluate(() => {
    const out = {};
    out.de = [1, 15, 30, 60].map((w) => waveRamp(w, 0, false));
    out.thuong = [15, 16, 25].map((w) => +waveRamp(w, 3, false).toFixed(4));
    out.kho = [15, 25, 100, 400].map((w) => +waveRamp(w, 0, true).toFixed(3));
    out.floor = { hp0: hardLvHp(0), ref: LEVELS[HARD_REF].hp, ew0: +hardEffWave(30, 0).toFixed(2), ewRef: +effWave(30, HARD_REF).toFixed(2), ew7: +hardEffWave(30, 12).toFixed(2), ew7n: +effWave(30, 12).toFixed(2) };
    out.tb = [[1, 1], [6, 5], [8, 5], [12, 5], [3, 3]].map(([n, e]) => teamBonus(n, e).all);
    // sàn hồi chiêu R + R toàn bản đồ
    const rs = Object.keys(HEROES).filter((k) => HEROES[k].skills && HEROES[k].skills[3] && HEROES[k].skills[3].active);
    out.rMin = Math.min(...rs.map((k) => skillCdOf(HEROES[k].skills[3], 3, 50)));
    out.qCd = skillCdOf(HEROES.xathu.skills[0].active ? HEROES.xathu.skills[0] : HEROES.thaymo.skills[1], 0, 50);
    out.global = rs.filter((k) => ['melonrain', 'forestwrath', 'skyride'].includes(HEROES[k].skills[3].active.cast)).map((k) => HEROES[k].skills[3].active.cooldown);
    // chip Thế trận
    const g = game; for (const t of ['lactuong', 'ongthoi', 'thogom', 'thoren', 'thansuong', 'xathu']) g.spawnHero(g.freeSlots()[0], t, { tier: 3 });
    g.updateAuras(); ui.updateHud ? ui.updateHud() : 0;
    out.teamB = g.teamB; out.bonus = heroStats(g.heroes.find(Boolean)).bonusDmgPct;
    return out;
  });
  await page.waitForTimeout(400);
  const chip = await page.evaluate(() => ({ txt: document.querySelector('#tb-team b').textContent, vis: !!document.querySelector('#tb-team').offsetWidth }));
  ok(r.de.every((x) => x === 1), `Dễ (ải 1–3, Thường): máu không tăng thêm theo đợt (${r.de})`);
  ok(r.thuong[0] === 1 && r.thuong[1] === 1.03 && r.thuong[2] > 1.3, `Thường ải 4+: ×1,03/đợt từ đợt 15 (${r.thuong})`);
  ok(r.kho[0] === 1 && r.kho[1] > 1.4 && r.kho[2] === r.kho[3], `Khó: ×1,04/đợt từ đợt 15, dừng tăng ở đợt 100 (${r.kho})`);
  ok(r.floor.hp0 === r.floor.ref && r.floor.ew0 === r.floor.ewRef && r.floor.ew7 === r.floor.ew7n, `Khó ải 1 dùng máu + tốc tăng của ải chuẩn (${JSON.stringify(r.floor)}); ải khó hơn giữ nguyên`);
  ok(r.tb.join() === '0,64,76,76,16', `Thế trận: 1 tướng 0% · 6 tướng 5 hành +64% · 8 tướng +76% (trần) · 3 tướng 3 hành +16% (${r.tb})`);
  ok(r.teamB.all === 64 && r.bonus >= 64 && chip.vis && chip.txt === '+64%', `đội 6 tướng đủ 5 hành: chip "${chip.txt}" hiện trên thanh trên, sát thương +${r.bonus}%`);
  ok(r.rMin >= 12, `hồi chiêu R thực tế không dưới 12 giây kể cả giảm hồi chiêu 50% (thấp nhất ${r.rMin})`);
  ok(r.qCd < 12, `sàn chỉ áp cho R, kỹ năng khác vẫn giảm hồi chiêu bình thường (${r.qCd.toFixed(1)} s)`);
  ok(r.global.length >= 5 && r.global.every((c) => c >= 26), `R toàn bản đồ (mưa dưa/dừa, rừng thiêng, ngựa sắt) hồi chiêu ≥ 26 giây (${r.global})`);
  ok(errors.length === 0, 'không lỗi trang ' + errors.join(' | '));
  await browser.close();
  // 2 trận bot ngắn (cố định hạt giống)
  const solo = await run({ kind: 'vang:matroi', hard: 1, level: 0, seed: 4321, gold: 0, maxW: 46 });
  ok(solo.firstLoss != null && solo.firstLoss <= 45, `ải 1 bật Khó, Mặt Trời đơn độc mất mạng ở đợt ${solo.firstLoss} (≤ 45; trước khi cân bằng ~56)`);
  const de = await run({ kind: 'thuong6', hard: 0, level: 0, seed: 4321, gold: 0, maxW: 31 });
  ok(de.w30 && !de.over, `Dễ (ải 1 Thường): đội 6 tướng Thường ★★★ qua đợt 30 (còn ${de.lives} mạng)`);
})().catch((e) => { console.error(e); process.exit(1); });
