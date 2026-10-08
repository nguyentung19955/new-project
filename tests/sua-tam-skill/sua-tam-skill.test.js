// claude/sua-tam-skill: kỹ năng tự dùng chỉ khi có quái TRONG TẦM (tầm đánh × hệ số tầm ghi trong mô tả);
// kỹ năng "toàn bản đồ" dùng khi quái ở bất kỳ đâu; hỗ trợ dùng khi đồng đội cần. Chạy: node tests/sua-tam-skill/sua-tam-skill.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

(async () => {
  const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
  await enter(page, 0);
  const r = await page.evaluate(() => {
    const g = game; g.running = false;
    const slot = g.freeSlots()[Math.floor(g.freeSlots().length / 2)];
    // đặt 1 tướng, chỉ mở kỹ năng i, đủ năng lượng; n quái đứng yên cách tướng d (không cập nhật quái)
    const trial = (type, i, d, n = 4) => {
      g.heroes = g.heroes.map(() => null); g.enemies.length = 0; g.effects.length = 0; g.zones && (g.zones.length = 0);
      g.spawnHero(slot, type); const h = g.heroes.find(Boolean);
      h.level = 10; h.skillLv = { [HEROES[type].skills[i].id]: 3 }; h.skillCd = {};
      const st = heroStats(h); h.mana = st.maxMana; h.hp = st.hpMax; h.cd = 99;
      for (let k = 0; k < n; k++) {
        const e = g.spawn(k === 0 ? 'tom' : 'casau', 50) || g.enemies[g.enemies.length - 1];
        e.hp = e.maxHp = 1e9; e.x = h.x + d * st.range + k * 6; e.y = h.y + (k % 2) * 6;
      }
      const sk = HEROES[type].skills[i], m0 = h.mana;
      for (let f = 0; f < 3; f++) g.updateHero(h, 1 / 60);
      return { cast: h.mana < m0 - 1 || (h.skillCd[sk.id] || 0) > 1, cdRun: (h.skillCd[sk.id] || 0) > 0.05 };
    };
    const out = { early: [], inMiss: [], globalMiss: [], globalOk: [], support: [], buffMiss: [], n: 0 };
    for (const type of Object.keys(HEROES)) HEROES[type].skills.forEach((sk, i) => {
      if (!sk.active) return;
      const c = sk.active.cast, tag = `${type}.${'QWER'[i]}(${c})`;
      out.n++;
      if (SKILL_SUPPORT.has(c)) {
        const t = trial(type, i, 1.3 * skillReach(type, sk) + 2); if (t.cast) out.support.push(tag);
        // khiên / chia bánh / trống trận / cây đa: đồng đội đang có quái trong tầm → dùng
        if (['goldshell', 'feast', 'rally', 'sacredtree'].includes(c) && !trial(type, i, 0.6).cast) out.buffMiss.push(tag);
        return;
      }
      if (SKILL_GLOBAL.has(c)) {
        if (c === 'guardcity') return;   // theo quái sắp lọt thành (xét riêng ở dưới)
        const t = trial(type, i, 8); (t.cast ? out.globalOk : out.globalMiss).push(tag); return;
      }
      const far = trial(type, i, 1.12 * skillReach(type, sk));          // vừa ngoài tầm
      if (far.cast || far.cdRun) out.early.push(tag);
      const near = trial(type, i, 0.6 * skillReach(type, sk));          // trong tầm
      if (!near.cast) out.inMiss.push(tag);
    });
    // không quái nào trên sân: không kỹ năng nào tung / chạy hồi chiêu (kể cả hỗ trợ khi đồng đội đầy máu)
    const idle = [];
    for (const type of Object.keys(HEROES)) HEROES[type].skills.forEach((sk, i) => { if (sk.active && trial(type, i, 0, 0).cast) idle.push(type + '.' + 'QWER'[i]); });
    out.idle = idle;
    // giữa hai đợt (sân hết quái), đồng đội bị thương: khiên / buff / hồi máu không dùng
    const gap = [];
    for (const type of Object.keys(HEROES)) HEROES[type].skills.forEach((sk, i) => {
      if (!sk.active || !SKILL_SUPPORT.has(sk.active.cast)) return;
      g.heroes = g.heroes.map(() => null); g.enemies.length = 0;
      g.spawnHero(slot, type); const h = g.heroes.find(Boolean);
      h.level = 10; h.skillLv = { [sk.id]: 3 }; h.skillCd = {}; const st = heroStats(h); h.mana = st.maxMana; h.hp = st.hpMax * 0.3; h.cd = 99;
      const m0 = h.mana; for (let f = 0; f < 3; f++) g.updateHero(h, 1 / 60);
      if (h.mana < m0 - 1 || (h.skillCd[sk.id] || 0) > 1) gap.push(type + '.' + 'QWER'[i] + '(' + sk.active.cast + ')');
    });
    out.gap = gap;
    return out;
  });
  console.log(`  ${r.n} kỹ năng chủ động · trong tầm chưa tung (cần điều kiện riêng: ≥2 quái, boss, giáp…): ${r.inMiss.join(', ') || 'không'}`);
  ok(r.early.length === 0, 'quái vừa ngoài tầm: không kỹ năng tấn công nào tung, hồi chiêu không chạy' + (r.early.length ? ' — ' + r.early.join(', ') : ''));
  ok(r.inMiss.length <= Math.ceil(r.n * 0.15), `quái vào tầm: kỹ năng tấn công tung (${r.inMiss.length} kỹ năng có điều kiện riêng)`);
  ok(r.globalMiss.length === 0 && r.globalOk.length >= 4, `kỹ năng toàn bản đồ dùng khi quái ở xa: ${r.globalOk.join(', ')}` + (r.globalMiss.length ? ' — HỎNG ' + r.globalMiss.join(', ') : ''));
  ok(r.support.length === 0, 'hỗ trợ (khiên / buff / hồi): đồng đội đầy máu, quái ngoài tầm → không dùng' + (r.support.length ? ' — ' + r.support.join(', ') : ''));
  ok(r.buffMiss.length === 0, 'khiên / buff: quái vào tầm → dùng' + (r.buffMiss.length ? ' — ' + r.buffMiss.join(', ') : ''));
  ok(r.gap.length === 0, 'giữa hai đợt (sân hết quái, tướng bị thương): khiên / buff / hồi máu không dùng' + (r.gap.length ? ' — ' + r.gap.join(', ') : ''));
  ok(r.idle.length === 0, 'không có quái: không kỹ năng nào tung' + (r.idle.length ? ' — ' + r.idle.join(', ') : ''));

  // trận thật: quái đi tới, kỹ năng chỉ tung lúc có quái trong tầm của tướng tung
  const live = await page.evaluate(async () => {
    const g = game; g.heroes = g.heroes.map(() => null); g.enemies.length = 0;
    const slot = g.freeSlots()[2]; g.spawnHero(slot, 'lactuong'); const h = g.heroes.find(Boolean);
    h.level = 10; h.skillLv = { bash: 3 }; h.skillCd = {}; h.mana = heroStats(h).maxMana;
    const st = heroStats(h), casts = [];
    const sp0 = SKILL_CASTS.bash;
    SKILL_CASTS.bash = function (game, hh, s, n) { if (hh === h) casts.push(Math.min(...game.enemies.filter((e) => !e.dead).map((e) => Math.hypot(e.x - h.x, e.y - h.y)))); return sp0.apply(this, arguments); };
    g.spawn('tom', 0); g.running = true; g.speed = 1; g.paused = false;
    let shot = null;
    for (let i = 0; i < 400 && !shot; i++) { await new Promise((r) => setTimeout(r, 16)); if (casts.length) shot = true; }
    g.paused = true; SKILL_CASTS.bash = sp0;
    return { casts, range: st.range };
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOT, 'quai-vua-vao-tam-844x390.png') });
  ok(live.casts.length > 0 && live.casts.every((d) => d <= live.range + 1), `trận thật: Bổ Rìu tung khi quái cách ${live.casts.map(Math.round).join(', ')} ≤ tầm ${Math.round(live.range)}`);
  ok(errors.length === 0, 'không lỗi JS ' + errors.join(' | '));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
