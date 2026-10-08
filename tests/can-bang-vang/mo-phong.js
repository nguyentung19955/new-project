// claude/can-bang-tuong-vang: bot chơi Vô tận để đo độ khó với 1 tướng Vàng đơn độc / đội 6 tướng hỗn hợp.
// Ghi đợt mất mạng đầu tiên + đợt thua + qua đợt 30. Cách chạy: xem cuối file. MAXW=70 (đợt tối đa), J=4 (số ván song song), SET='câu lệnh JS' (mỗi dòng một lệnh, chạy trước ván).
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
    const kinds = (lg) => Object.keys(HEROES).filter((k) => (lg ? HEROES[k].legend === lg : BASIC_HEROES.includes(k)));
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    // chọn n tướng khác hành nhau nhiều nhất có thể
    const pickEl = (pool, n, used) => { const out = []; for (let i = 0; i < n; i++) { const fresh = pool.filter((k) => !used.has(HEROES[k].el) && !out.includes(k)); const k = pick(fresh.length ? fresh : pool.filter((x) => !out.includes(x))); out.push(k); used.add(HEROES[k].el); } return out; };
    const asc = (h) => { h.from = ASCEND_FROM[h.type] || h.type; return h; };
    const [k0, ty] = kind.split(':');
    if (k0 === 'vang' || k0 === 'tim') team.push(asc(place(ty || pick(kinds(k0 === 'vang' ? 'legendary' : 'epic')), { tier: 0 })));
    else if (k0 === 'thuong6') { for (const t of pickEl(kinds(), 6, new Set())) team.push(place(t, { tier: 3 })); }
    else {   // hon: 1 Vàng tầm xa + 2 Tím + 3 Thường ★★★, khác hành
      const used = new Set(), ranged = kinds('legendary').filter((k) => HEROES[k].attack !== 'melee');
      for (const t of pickEl(ranged, 1, used)) team.push(asc(place(t, {})));
      for (const t of pickEl(kinds('epic'), 2, used)) team.push(asc(place(t, {})));
      for (const t of pickEl(kinds(), 3, used)) team.push(place(t, { tier: 3 }));
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
    const shapes = [], dbg = {}; let w30 = false; let firstLoss = null, t = 0, guard = 0; const DT = 1 / 20;
    while (!g.over && g.wave < maxW && guard++ < 20 * 60 * 120) {
      const l0 = g.lives;
      g.update(DT); t += DT;
      if (g.lives < l0 && firstLoss == null) firstLoss = g.wave;
      if (g.wave >= 31 && !g.over) w30 = true;
      if (g.stage && (shapes[shapes.length - 1] || '').split('@')[0] !== String(g.stage.shape)) shapes.push(g.stage.shape + '@' + g.wave + (team[0] ? '/s' + team[0].slot : ''));
      if (g.rest) g.rest = null;
      if (g.holdStage) g.holdStage = false;
      if (g.wave % 10 === 0 && !dbg[g.wave]) { const h = team[0], st = heroStats(h); dbg[g.wave] = `đ${g.wave}: dmg ${Math.round(st.damage)} skP ${st.skillPower?.toFixed?.(2)} grow ${h.grow} train ${h.train || 0} skill ${JSON.stringify(h.skillLv)} vàng ${Math.round(g.gold)} máuQ ${Math.round(waveHpMult(effWave(g.wave, g.level)))} thếTrận ${JSON.stringify(g.teamB)} bonus% ${st.bonusDmgPct}`; }
      if (t >= 0.5) { t = 0; for (let k = 0; k < 4; k++) think(); }
    }
    return { firstLoss, w30, over: g.over, wave: g.wave, lives: g.lives, team: team.map((h) => `${h.type}${h.tier}/L${h.level}`).join(' '), time: Math.round(g.time), shapes: shapes.join(' '), dbg: Object.values(dbg).join('\n') + (window.__tally ? '\n' + Object.entries(window.__tally).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => k + ':' + v.toExponential(2)).join(' ') : '') };
  }, [kind, hard, level, seed, gold, maxW, set]);
  await browser.close();
  return Object.assign(r, { errors: errors.slice(0, 2) });
}
module.exports = { run };

if (require.main === module) (async () => {
  // node mo-phong.js <đội,…> <chế độ,…> [số ván]   đội: vang:matroi | tim | tim:<mã> | thuong6 | hon · chế độ: de | thuong | kho | kho4
  const MODES = { de: [0, 0], thuong: [3, 0], kho: [0, 1], kho4: [3, 1] };   // Dễ = ải 1 Thường · Thường = ải 4 · Khó = ải 1 bật Khó (lỗi người dùng báo) · kho4 = ải 4 bật Khó
  const kinds = (process.argv[2] || 'vang:matroi,tim,thuong6,hon').split(','), modes = (process.argv[3] || 'de,thuong,kho').split(',');
  const N = +(process.argv[4] || 4), maxW = +(process.env.MAXW || 70), J = +process.env.J || 4;
  for (const kind of kinds) for (const m of modes) {
    const [level, hard] = MODES[m], rs = [];
    for (let k = 0; k < N; k += J) rs.push(...await Promise.all(Array.from({ length: Math.min(J, N - k) }, (_, j) => run({ kind, hard, level, seed: 4321 + (k + j) * 7919, gold: +(process.env.GOLD || 0), maxW, set: process.env.SET }))));
    const avg = (f) => (rs.reduce((a, x) => a + f(x), 0) / rs.length).toFixed(1);
    console.log(`${kind.padEnd(12)} ${m.padEnd(6)}: mất mạng đầu đ${avg((x) => x.firstLoss ?? maxW)} · thua đ${avg((x) => x.wave)} · qua đợt 30: ${rs.filter((x) => x.w30).length}/${N} · ${rs.map((x) => `[${x.firstLoss ?? '-'}→${x.over ? '' : '≥'}${x.wave} ${x.team}]`).join(' ')}${process.env.SH ? '\n   màn: ' + rs.map((x) => x.shapes).join('\n   màn: ') : ''}${process.env.DBG ? '\n' + rs[0].dbg : ''}${rs[0].errors.length ? ' LỖI ' + rs[0].errors : ''}`);
  }
})();
