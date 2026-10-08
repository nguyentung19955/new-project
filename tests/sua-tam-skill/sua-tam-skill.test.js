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
    const out = { early: [], inMiss: [], support: [], buffMiss: [], leak: [], n: 0 };
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
      const far = trial(type, i, 1.12 * skillReach(type, sk));          // vừa ngoài tầm
      if (far.cast || far.cdRun) out.early.push(tag);
      const near = trial(type, i, 0.6 * skillReach(type, sk));          // trong tầm
      if (!near.cast) out.inMiss.push(tag);
    });
    // không quái nào trên sân: không kỹ năng nào tung / chạy hồi chiêu (kể cả hỗ trợ khi đồng đội đầy máu)
    const idle = [];
    for (const type of Object.keys(HEROES)) HEROES[type].skills.forEach((sk, i) => { if (sk.active && trial(type, i, 0, 0).cast) idle.push(type + '.' + 'QWER'[i]); });
    out.idle = idle;
    // không chiêu nào tác động quái NGOÀI tầm: 3 quái trong tầm (một phía) + 3 quái ngoài tầm (phía kia), chạy game 1,5 giây
    // (hiệu ứng trễ, vùng, mưa rơi…) — quái ngoài tầm không mất máu / không choáng / không chậm
    g.spawnQueue = []; g.running = true; g.paused = false; g.over = false; g.waveActive = true; g.nextWaveT = 1e9; g.lives = 1e6;
    const ue0 = g.updateEnemy;   // quái thử đứng yên tại chỗ đặt (không đi theo đường)
    g.updateEnemy = function (e, dt) { ue0.call(this, e, dt); if (e.fix) { e.x = e.fix[0]; e.y = e.fix[1]; e.dist = e.fix[2]; } };
    for (const type of Object.keys(HEROES)) HEROES[type].skills.forEach((sk, i) => {
      if (!sk.active || SKILL_SUPPORT.has(sk.active.cast)) return;
      g.heroes = g.heroes.map(() => null); g.enemies.length = 0; g.effects.length = 0; g.zones && (g.zones.length = 0); g.blocks && (g.blocks.length = 0);
      g.spawnHero(slot, type); const h = g.heroes.find(Boolean);
      h.level = 10; h.skillLv = { [sk.id]: 3 }; h.skillCd = {}; const st = heroStats(h); h.mana = st.maxMana; h.hp = st.hpMax;
      const R = st.range * skillReach(type, sk), mk = (dx, dy, boss) => { const e = g.spawn(boss ? 'casau' : 'tom', 50) || g.enemies[g.enemies.length - 1]; e.hp = e.maxHp = 1e9; e.x = h.x + dx; e.y = h.y + dy; e.dist = PATH.total * (dx < 0 ? 0.6 : 0.1); e.fix = [e.x, e.y, e.dist]; return e; };   // hai nhóm cách xa cả trên đường (vùng dọc đường)
      for (let k = 0; k < 3; k++) mk(-0.5 * R + k * 5, k * 4);
      const outs = [0, 1, 2].map((k) => mk(Math.max(1.15 * R, R + 160) + k * 8, k * 4));
      let cast = false;
      for (let f = 0; f < 90; f++) {
        h.cd = 99; if (f > 2) h.mana = 0;     // chỉ tung một lần, không đánh thường
        const m0 = h.mana; g.update(1 / 60);
        if (h.mana < m0 - 1 || (h.skillCd[sk.id] || 0) > 1) cast = true;
      }
      const hit = outs.filter((e) => e.dead || e.hp < e.maxHp || e.stunT > 0 || e.slowT > 0 || e.poisonT > 0);
      if (cast) out.castN = (out.castN || 0) + 1;
      if (hit.length) out.leak.push(`${type}.${'QWER'[i]}(${sk.active.cast})${cast ? '' : '[chưa tung]'}`);
    });
    g.updateEnemy = ue0; g.running = false;
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
  ok(r.castN >= 120, `phép thử tác động: ${r.castN} chiêu tấn công tung được`);
  ok(r.leak.length === 0, `không chiêu nào tác động quái ngoài tầm (${r.castN} chiêu tấn công đã tung, có cả hiệu ứng trễ 1,5 giây; không còn chiêu toàn bản đồ)` + (r.leak.length ? ' — ' + r.leak.join(', ') : ''));
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
  // Gióng R (Bay Về Trời — trước đánh cả bản đồ): giờ chỉ quái trong tầm x2 quanh Gióng
  const sky = await page.evaluate(async () => {
    const g = game; g.heroes = g.heroes.map(() => null); g.enemies.length = 0; g.effects.length = 0; g.spawnQueue = [];
    g.over = false; g.waveActive = true; g.nextWaveT = 1e9; g.lives = 1e6;
    const slots = g.freeSlots(), slot = slots[Math.floor(slots.length / 2)];
    g.spawnHero(slot, 'giong'); const h = g.heroes.find(Boolean);
    h.level = 10; const sk = HEROES.giong.skills[3]; h.skillLv = { [sk.id]: 3 }; h.skillCd = {};
    const st = heroStats(h); h.mana = st.maxMana; h.hp = st.hpMax;
    const R = st.range * skillReach('giong', sk);
    for (let k = 0; k < 14; k++) { const e = g.spawn(k % 3 ? 'tom' : 'casau', PATH.total * (0.05 + k * 0.065)) || g.enemies[g.enemies.length - 1]; e.hp = e.maxHp = 1e6; }
    g.running = true; g.paused = false; g.speed = 1;
    let cast = false;
    for (let i = 0; i < 120 && !cast; i++) { await new Promise((r) => setTimeout(r, 16)); cast = (h.skillCd[sk.id] || 0) > 1; }
    await new Promise((r) => setTimeout(r, 700));
    g.paused = true;
    const hit = g.enemies.filter((e) => e.hp < e.maxHp).map((e) => Math.hypot(e.x - h.x, e.y - h.y));
    const miss = g.enemies.filter((e) => e.hp >= e.maxHp).length;
    return { cast, R, hitMax: Math.max(0, ...hit), nHit: hit.length, miss };
  });
  await page.screenshot({ path: path.join(SHOT, 'giong-r-trong-tam-844x390.png') });
  ok(sky.cast && sky.nHit > 0 && sky.miss > 0, `Gióng R chỉ đánh quái quanh mình: trúng ${sky.nHit} quái (xa nhất ${Math.round(sky.hitMax)}, tầm x2 = ${Math.round(sky.R)}), ${sky.miss} quái ngoài tầm không bị đánh`);
  ok(errors.length === 0, 'không lỗi JS ' + errors.join(' | '));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
