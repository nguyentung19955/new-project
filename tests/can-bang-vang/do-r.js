// claude/can-bang-tuong-vang: đo chiêu R (tối thượng) của mọi tướng — mỗi tướng max cấp / sao / kỹ năng đứng một mình
// (ô phủ đường nhiều nhất, mạng vô hạn) đánh đợt A..B của ải 1 Vô tận. Ghi: hồi chiêu thực tế, số lần tung, sát thương
// mỗi lần, % sát thương trận đến từ R (tính cả đạn / vùng / hiệu ứng nổ chậm do R tạo ra; trừ sát thương đốt / độc theo thời gian).
// Chạy: node tests/can-bang-vang/do-r.js [mã,… | all] [đợt A=15] [đợt B=25]
const { open, enter } = require('../cho-tuong/helpers');

async function measure(page, types, A, B) {
  return page.evaluate(([types, A, B]) => {
    const g = game, out = [];
    if (!window.__rHook) {
      window.__rHook = true; window.__inUlt = 0;
      const own = (a) => a === g.effects || a === g.zones || a === g.projectiles;
      const push0 = Array.prototype.push;
      Array.prototype.push = function (...xs) {
        if ((g.ultCast || window.__inUlt > 0) && own(this)) for (const o of xs) if (o && typeof o === 'object') {
          o.__ult = true;
          if (typeof o.onEnd === 'function' && !o.__w) { const f = o.onEnd; o.onEnd = (...a) => { window.__inUlt++; try { return f(...a); } finally { window.__inUlt--; } }; o.__w = true; }
        }
        return push0.apply(this, xs);
      };
      for (const [fn, key] of [['updateZones', 'zones'], ['updateProjectiles', 'projectiles']]) {
        const o = g[fn].bind(g);
        g[fn] = (dt) => {
          const all = g[key], u = all.filter((z) => z.__ult), r = all.filter((z) => !z.__ult);
          g[key] = u; window.__inUlt++; try { o(dt); } finally { window.__inUlt--; }
          const u2 = g[key]; g[key] = r; o(dt); g[key] = u2.concat(g[key]);
        };
      }
      const hit0 = g.hit.bind(g);
      g.hit = (e, d, hero, o) => {
        const b = Math.max(0, e.hp) + (e.shield || 0), r = hit0(e, d, hero, o), dd = Math.max(0, b - Math.max(0, e.hp) - (e.shield || 0));
        window.__dmg.all += dd; if (g.ultCast || window.__inUlt > 0) window.__dmg.r += dd;
        return r;
      };
    }
    const cover = (sl, r) => { const [x, y] = CONFIG.slots[sl]; let n = 0; PATH.lanes.forEach((L, li) => { for (let d = 0; d < L.total + (L.off || 0); d += 8) { const p = PATH.at(d, li); if (Math.hypot(p.x - x, p.y - y) <= r) n++; } }); return n; };
    for (const ty of types) {
      let s = 777; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      g.reset(0); g.endless = true; g.started = true; g.running = false; g.owned = null; g.hard = false;
      g.lives = g.maxLives = 1e6; g.gold = 0;
      const free = g.freeSlots(), lg = HEROES[ty].legend;
      const h = g.spawnHero(free[0], ty, { tier: lg ? 3 : 3 });
      if (lg) h.from = ASCEND_FROM[ty] || ty;
      h.level = CONFIG.maxLevel;
      HEROES[ty].skills.forEach((sk, i) => { h.skillLv[sk.id] = SKILL_MAX[i]; });
      const rr = heroStats(h).range || 120; g.heroes[h.slot] = null;
      const sl = free.sort((a, b) => cover(b, rr) - cover(a, rr))[0];
      g.heroes[sl] = Object.assign(h, { slot: sl, x: CONFIG.slots[sl][0], y: CONFIG.slots[sl][1] });
      g.updateAuras(); h.hp = heroStats(h).hpMax; h.mana = heroStats(h).maxMana;
      const rid = HEROES[ty].skills[3].id, cd0 = HEROES[ty].skills[3].active ? HEROES[ty].skills[3].active.cooldown : 0;
      let casts = 0, prev = 0;
      g.wave = A - 1; g.evWave = A - 1; g.nextWave = buildWave(A, 0); g.nextWaveT = 0;
      window.__dmg = { all: 0, r: 0 };
      const DT = 1 / 20; let t = 0;
      while (g.wave <= B && t < 1200) {
        g.update(DT); t += DT; g.rest = null; g.holdStage = false;
        const c = h.skillCd[rid] || 0; if (c > prev + 0.5) casts++; prev = c;
        if (g.wave === B && !g.waveActive) break;
      }
      const st = heroStats(h);
      out.push({ ty, lg: lg || 'thuong', cd0, cdEff: +(cd0 * (1 - st.cdr / 100)).toFixed(1), casts, perMin: +(casts / (t / 60)).toFixed(1), perCast: casts ? Math.round(window.__dmg.r / casts) : 0, rPct: window.__dmg.all ? Math.round(100 * window.__dmg.r / window.__dmg.all) : 0, all: Math.round(window.__dmg.all), t: Math.round(t), cast: HEROES[ty].skills[3].active && HEROES[ty].skills[3].active.cast });
      g.heroes[sl] = null;
    }
    return out;
  }, [types, A, B]);
}
module.exports = { measure };

if (require.main === module) (async () => {
  const A = +(process.argv[3] || 15), B = +(process.argv[4] || 25);
  const { browser, page } = await open(844, 390, {});
  await enter(page, 0, true);
  let types = (process.argv[2] || 'all').split(',');
  if (types[0] === 'all') types = await page.evaluate(() => Object.keys(HEROES).filter((k) => HEROES[k].skills && HEROES[k].skills[3] && (BASIC_HEROES.includes(k) || HEROES[k].legend)));
  const rs = await measure(page, types, A, B);
  console.log('nhóm      tướng        R gốc→thực  lần/phút  sát thương/lần   %R   tổng sát thương  (cast)');
  for (const r of rs.sort((a, b) => b.rPct - a.rPct)) console.log(`${r.lg.padEnd(9)} ${r.ty.padEnd(12)} ${String(r.cd0).padStart(3)}→${String(r.cdEff).padEnd(5)}  ${String(r.perMin).padStart(5)}  ${String(r.perCast).padStart(12)}  ${String(r.rPct).padStart(4)}%  ${String(r.all).padStart(14)}  (${r.cast})`);
  await browser.close();
})();
