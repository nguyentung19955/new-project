// Mô phỏng cân bằng (v180–181): thời điểm trung bình có tướng Tím đầu tiên theo từng luật hợp thể:
//   cu = v136: 2 tướng Thường ★★, không cần kỹ năng · kn2 = ★★ + kỹ năng tối đa · v180 = ★★★ + kỹ năng tối đa · v181 = v180 + ★★★ lên cấp ½ giá.
// Bot tham lam giống nhau ở mọi luật (đội 6 tướng = 3 cặp hợp thể Tím), chỉ đổi điều kiện hợp thể.
// own1 (cho-6-the) = luật hiện tại, tài khoản đã mở mọi tướng Thường + 1 tướng Tím.
// Chạy: node tests/hop-the/mo-phong.js [số ván mỗi ải=6] [luật,… = cu,kn2,v180,v181,r12]   (không thuộc bộ test, chỉ để đo)
const { open, enter } = require('../cho-tuong/helpers');
const N = +process.argv[2] || 6, LEVELS = process.env.LV ? process.env.LV.split(",").map(Number) : [0, 2, 4];

async function run(level, rule, seed) {
  const { browser, page } = await open(844, 390, {});
  await enter(page, level);
  const r = await page.evaluate(([rule, seed]) => {
    // phương án (đều trên luật v180 ★★★ + KN): v180 = bản gốc (★★★ lên cấp nguyên giá) · v181 = ★★★ lên cấp ½ giá (đang dùng) · r12 = R3 ở cấp 12
    if (rule === 'cu' || rule === 'kn2') COSTS.ascendTier = 2;
    if (rule !== 'v181') COSTS.lvDisc3 = 1;
    if (rule === 'r12') R_REQ.splice(0, 4, 0, 6, 9, 12);
    if (rule === 'cu') { const orig = game.fusionReady.bind(game); game.fusionReady = (h) => ((h.tier || 0) >= game.ascendNeed(h) && !h.from ? true : orig(h)); }
    // đội = 3 cặp hợp thể ra Tím (tướng Thường, không trùng)
    const deck = [];
    for (const f of FUSION) if (HEROES[f.to].legend === 'epic' && BASIC_HEROES.includes(f.a) && BASIC_HEROES.includes(f.b) && !deck.includes(f.a) && !deck.includes(f.b) && deck.length < 6) deck.push(f.a, f.b);
    game.deck = deck; game.market = null;
    let s = seed; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    game.running = false; game.owned = null;
    // cho-6-the: own1 = người chơi đã mở mọi tướng Thường + đúng 1 tướng Tím (đích công thức đầu của đội)
    if (rule === 'own1') { const f0 = FUSION.find((f) => f.a === deck[0] && f.b === deck[1] || f.a === deck[1] && f.b === deck[0]); game.owned = new Set([...BASIC_HEROES, f0.to]); }
    const g = game, DT = 1 / 20, recipes = FUSION.filter((f) => HEROES[f.to].legend === 'epic' && (rule !== 'own1' || g.ownsHero(f.to)));     // own1: bot theo công thức đã mở
    const partnerOn = (h) => recipes.some((f) => (f.a === h.type || f.b === h.type) && g.heroes.some((o) => o && o !== h && o.type === (f.a === h.type ? f.b : f.a)));
    let first = null, t = 0; const mk = {};
    const note = (k) => { if (!mk[k]) mk[k] = g.wave; };
    const think = () => {
      if (g.rest) g.rest = null;
      // 1. hợp thể ra Tím
      for (const a of g.heroes) for (const b of g.heroes) if (a && b && a !== b && typeof g.canFuse(a, b) !== 'string' && HEROES[fusionFor(a.type, b.type).to].legend === 'epic') {
        g.fuse(a.slot, b.slot); if (!first) first = { t: Math.round(g.time), wave: g.wave }; return;
      }
      g.autoMerge();
      // 2. kỹ năng (trước khi mua thẻ: mở R đủ vàng thì mở ngay): mở / nâng bằng điểm
      for (const h of g.heroes) if (h && !h.from) for (let i = 0; i < 4; i++) {
        if (!skillLevel(h, i)) { if (g.unlockSkill(h, i) === true) return; } else if (h.skillPts > 0 && g.upgradeSkill(h, i) === true) return;
      }
      // 3. mua thẻ: ghép được / có cặp hợp thể trên sân / còn ít tướng
      const m = g.ensureMarket(), free = g.freeSlots().length, n = g.heroes.filter(Boolean).length;
      const nd = g.marketNeeds(); const want = m.types.map((ty, i) => ({ i, sc: g.marketTwin(ty) ? 3 : rule === 'own1' && g.marketHint(ty, nd) === 'hop' ? 2 : recipes.some((f) => (f.a === ty || f.b === ty) && g.heroes.some((o) => o && o.type === (f.a === ty ? f.b : f.a))) ? 2 : g.heroes.some((o) => o && o.type === ty) ? 1 : 0 }))
        .sort((x, y) => y.sc - x.sc)[0];
      if (g.gold >= g.summonCost() && (free > 0 || want.sc === 3) && (want.sc >= 1 || n < 5)) { g.buyCard(want.i, -1); return; }
      if (want.sc === 0 && n >= 5 && free > 0 && g.gold >= g.summonCost() + 2 * g.rerollCost()) { g.rerollMarket(); return; }
      // 4. lên cấp: dồn vàng vào CẶP hợp thể tốt nhất trên sân (sao cao nhất), chưa có cặp thì nâng tướng cấp thấp nhất
      const best = (ty) => g.heroes.filter((h) => h && h.type === ty).sort((a, b) => (b.tier || 0) - (a.tier || 0) || b.level - a.level)[0];
      const pairs = recipes.map((f) => [best(f.a), best(f.b)]).filter(([a, b]) => a && b)
        .sort((x, y) => Math.min(y[0].tier, y[1].tier) - Math.min(x[0].tier, x[1].tier) || (y[0].level + y[1].level) - (x[0].level + x[1].level));
      const pool = pairs.length ? pairs[0] : g.heroes.filter((h) => h && !h.from);
      const tgt = pool.filter((h) => h.level < 16 && g.skillGap(h) > 0).sort((a, b) => a.level - b.level)[0];
      if (tgt && g.gold >= g.levelCost(tgt)) g.levelUp(tgt);
    };
    while (!g.over && !first && g.time < 1800) {
      g.update(DT); t += DT;
      if (rule === 'own1') for (const [k, ty] of [['A', recipes[0].a], ['B', recipes[0].b]]) { const h = g.heroes.filter((x) => x && x.type === ty).sort((x, y) => (y.tier || 0) - (x.tier || 0))[0]; if (h && h.tier >= 3) note(k + '3'); if (h && h.tier >= 3 && !g.skillGap(h)) note(k + 'kn'); }
      if (t >= 0.5) { t = 0; for (let k = 0; k < 6; k++) think(); }
    }
    return { first, over: g.over, win: g.won, wave: g.wave, time: Math.round(g.time), deck, mk, board: g.heroes.filter(Boolean).map((h) => h.type + h.tier + '/L' + h.level).join(' '), gold: Math.round(g.gold), rec: recipes.map((f) => f.a + '+' + f.b).join() };
  }, [rule, seed]);
  await browser.close();
  return r;
}

(async () => {
  const out = {};
  for (const lv of LEVELS) for (const rule of (process.argv[3] || 'cu,v180,v181').split(',')) {
    const rs = [];
    for (let k = 0; k < N; k++) rs.push(await run(lv, rule, 1234 + k * 977));
    const got = rs.filter((x) => x.first);
    const avg = (f) => (got.length ? (got.reduce((a, x) => a + f(x), 0) / got.length).toFixed(1) : '-');
    out[`${lv}/${rule}`] = { coTim: `${got.length}/${N}`, giay: avg((x) => x.first.t), dot: avg((x) => x.first.wave), thua: rs.filter((x) => !x.first && x.over).length };
    console.log(`ải ${lv + 1} · luật ${{ own1: 'luật hiện tại, đã mở 1 tướng Tím', cu: 'v136 ★★', kn2: '★★+KN (nguyên giá)', v180: 'v180 ★★★+KN', v181: 'v181 ★★★+KN, ★★★ lên cấp ½ giá', r12: '★★★+KN, R3 cấp 12' }[rule] || rule}: có Tím ${got.length}/${N} ván · TB ${avg((x) => x.first.t)} s · đợt ${avg((x) => x.first.wave)} · ${rs.map((x) => (x.first ? `đ${x.first.wave}` : x.over ? `thua/hết@${x.wave}` : '—')).join(' ')}`);
    if (process.env.MK) for (const x of rs) console.log('   mốc', JSON.stringify(x.mk), 'đợt', x.wave, 't', x.time, 'vàng', x.gold, x.rec, '|', x.board);
  }
})();
