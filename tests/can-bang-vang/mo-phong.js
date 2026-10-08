// claude/can-bang-tuong-vang: bot chơi Vô tận để đo độ khó với 1 tướng Vàng đơn độc / đội 6 tướng hỗn hợp.
// Ghi đợt mất mạng đầu tiên + đợt thua. Chạy: node tests/can-bang-vang/mo-phong.js [loại=vang1,doi6] [khó=0,1] [ải=0] [số ván=3] [tướng Vàng=…]
// Biến môi trường MAXW=60 (đợt tối đa), J=4 (số ván song song), SET='câu lệnh JS' (mỗi dòng một lệnh, chạy trước ván).
const { open, enter } = require('../cho-tuong/helpers');

async function run({ kind, hard, level, seed, gold, maxW, set }) {
  const { browser, page, errors } = await open(844, 390, {});
  await enter(page, level, true);
  const r = await page.evaluate(([kind, hard, level, seed, gold, maxW, set]) => {
    for (const kv of (set || '').split('\n').filter(Boolean)) (0, eval)(kv);     // SET='ENDLESS_STAGES.hardFrom=20;…' thử đòn bẩy
    let s = seed; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const g = game;
    g.running = false; g.owned = null; g.hard = !!hard;
    for (let i = 0; i < g.heroes.length; i++) g.heroes[i] = null;
    // ô phủ đường nhiều nhất cho tướng tầm r
    const cover = (sl, r) => { const [x, y] = CONFIG.slots[sl]; let n = 0; for (const L of PATH.lanes) for (let d = 0; d < L.total + (L.off || 0); d += 8) { const p = PATH.at(d, PATH.lanes.indexOf(L)); if (Math.hypot(p.x - x, p.y - y) <= r) n++; } return n; };
    const place = (type, o) => {
      const free = g.freeSlots().filter((sl) => !g.isFlooded || !g.isFlooded(sl));
      const tmp = g.spawnHero(free[0], type, o); const rr = heroStats(tmp).range || 120; g.heroes[free[0]] = null;
      const sl = free.sort((a, b) => cover(b, rr) - cover(a, rr))[0];
      const h = g.spawnHero(sl, type, o); return h;
    };
    const team = [];
    if (kind.startsWith('vang')) {
      const ty = kind.slice(5) || 'giong';
      const h = place(ty, { tier: 0 }); h.from = ASCEND_FROM[ty] || ty; team.push(h);
    } else {
      // đội 6 hỗn hợp: 1 Vàng + 2 Tím + 3 Thường ★★
      const legs = Object.keys(HEROES).filter((k) => HEROES[k].legend === 'legendary'), epics = Object.keys(HEROES).filter((k) => HEROES[k].legend === 'epic');
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const L = place(pick(legs), {}); L.from = ASCEND_FROM[L.type] || L.type; team.push(L);
      for (let i = 0; i < 2; i++) { const h = place(pick(epics), {}); h.from = ASCEND_FROM[h.type] || h.type; team.push(h); }
      for (let i = 0; i < 3; i++) team.push(place(pick(BASIC_HEROES), { tier: 2 }));
    }
    g.gold = gold;
    const think = () => {
      for (const h of team) {
        for (let i = 0; i < 4; i++) { if (!skillLevel(h, i)) g.unlockSkill(h, i); else if (h.from) g.upgradeSkill(h, i); else if (h.skillPts > 0) g.upgradeSkill(h, i); }
        if (h.from) g.evolve(h);
      }
      const h = team.slice().sort((a, b) => a.level - b.level)[0];
      if (h.level < CONFIG.maxLevel && g.gold >= g.levelCost(h)) g.levelUp(h);
    };
    const shapes = [], dbg = {}; let firstLoss = null, t = 0, guard = 0; const DT = 1 / 20;
    while (!g.over && g.wave < maxW && guard++ < 20 * 60 * 120) {
      const l0 = g.lives;
      g.update(DT); t += DT;
      if (g.lives < l0 && firstLoss == null) firstLoss = g.wave;
      if (g.stage && (shapes[shapes.length - 1] || '').split('@')[0] !== String(g.stage.shape)) shapes.push(g.stage.shape + '@' + g.wave + (team[0] ? '/s' + team[0].slot : ''));
      if (g.rest) g.rest = null;
      if (g.holdStage) g.holdStage = false;
      if (g.wave % 10 === 0 && !dbg[g.wave]) { const h = team[0], st = heroStats(h); dbg[g.wave] = `đ${g.wave}: dmg ${Math.round(st.damage)} skP ${st.skillPower?.toFixed?.(2)} grow ${h.grow} train ${h.train || 0} skill ${JSON.stringify(h.skillLv)} vàng ${Math.round(g.gold)} máuQ ${Math.round(waveHpMult(effWave(g.wave, g.level)))}`; }
      if (t >= 0.5) { t = 0; for (let k = 0; k < 4; k++) think(); }
    }
    return { firstLoss, over: g.over, wave: g.wave, lives: g.lives, team: team.map((h) => `${h.type}${h.tier}/L${h.level}`).join(' '), time: Math.round(g.time), shapes: shapes.join(' '), dbg: Object.values(dbg).join('\n') + (window.__tally ? '\n' + Object.entries(window.__tally).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => k + ':' + v.toExponential(2)).join(' ') : '') };
  }, [kind, hard, level, seed, gold, maxW, set]);
  await browser.close();
  return Object.assign(r, { errors: errors.slice(0, 2) });
}
module.exports = { run };

if (require.main === module) (async () => {
  const kinds = (process.argv[2] || 'vang1,doi6').split(','), hards = (process.argv[3] || '0,1').split(',').map(Number);
  const level = +(process.argv[4] || 0), N = +(process.argv[5] || 3), maxW = +(process.env.MAXW || 60), J = +process.env.J || 4;
  for (const kind0 of kinds) for (const hard of hards) {
    const kind = kind0 === 'vang1' ? 'vang:' + (process.argv[6] || 'giong') : kind0;
    const rs = [];
    for (let k = 0; k < N; k += J) rs.push(...await Promise.all(Array.from({ length: Math.min(J, N - k) }, (_, j) => run({ kind, hard, level, seed: 4321 + (k + j) * 7919, gold: +(process.env.GOLD || 0), maxW, set: process.env.SET }))));
    const avg = (f) => (rs.reduce((a, x) => a + f(x), 0) / rs.length).toFixed(1);
    console.log(`${kind} ${hard ? 'KHÓ' : 'thường'} ải ${level + 1}: mất mạng đầu TB đ${avg((x) => x.firstLoss ?? maxW)} · thua ${rs.filter((x) => x.over).length}/${N} (đợt TB ${avg((x) => x.wave)}) · ${rs.map((x) => `[${x.firstLoss ?? '-'}→${x.over ? 'thua ' : ''}đ${x.wave} ${x.lives}♥ ${x.team}]`).join(' ')}${process.env.SH ? '\n   màn: ' + rs.map((x) => x.shapes).join('\n   màn: ') : ''}${process.env.DBG ? '\n' + rs[0].dbg : ''}${rs[0].errors.length ? ' LỖI ' + rs[0].errors : ''}`);
  }
})();
