// Mô phỏng cân bằng (v180–181): thời điểm trung bình có tướng Tím đầu tiên theo từng luật hợp thể:
//   cu = v136: 2 tướng Thường ★★, không cần kỹ năng · kn2 = ★★ + kỹ năng tối đa · v180 = ★★★ + kỹ năng tối đa · v181 = v180 + ★★★ lên cấp ½ giá.
// Bot tham lam giống nhau ở mọi luật (đội 6 tướng = 3 cặp hợp thể Tím), chỉ đổi điều kiện hợp thể.
// own1 (cho-6-the) = luật hiện tại, tài khoản đã mở mọi tướng Thường + 1 tướng Tím.
// Chạy: node tests/hop-the/mo-phong.js [số ván mỗi ải=6] [luật,… = cu,kn2,v180,v181,r12]   (không thuộc bộ test, chỉ để đo)
// claude/r-cap-12: luật `nay` = game hiện tại không đổi gì · `rA-B-C` = game hiện tại với R_REQ = [0, A, B, C] (vd r6-11-16, r5-9-12)
// Biến môi trường RREQ=A,B,C áp R_REQ cho mọi luật (vd RREQ=6,11,16 với own1).
// Thêm `het` làm tham số thứ 3 → chơi tiếp đến hết ải (hoặc thua) để đo độ khó: mạng còn lại / đợt thua.
const { open, enter } = require('../cho-tuong/helpers');
const N = +process.argv[2] || 6, LEVELS = process.env.LV ? process.env.LV.split(",").map(Number) : [0, 2, 4];

const FULL = process.argv[4] === 'het';
async function run(level, rule, seed) {
  const { browser, page } = await open(844, 390, {});
  await enter(page, level);
  const r = await page.evaluate(([rule, seed, full, rreq, set]) => {
    // phương án (đều trên luật v180 ★★★ + KN): v180 = bản gốc (★★★ lên cấp nguyên giá) · v181 = ★★★ lên cấp ½ giá (đang dùng) · r12 = R3 ở cấp 12
    if (rule === 'cu' || rule === 'kn2') COSTS.ascendTier = 2;
    if (['cu', 'kn2', 'v180', 'r12'].includes(rule)) COSTS.lvDisc3 = 1;     // claude/sao3-re-nhanh: own1/nay giữ giá game thật (★★★ ½ giá)
    if (rule === 'r12') R_REQ.splice(0, 4, 0, 6, 9, 12);
    const rq = /^r(\d+)-(\d+)-(\d+)$/.exec(rule);
    if (rq) { COSTS.lvDisc3 = 0.5; R_REQ.splice(0, 4, 0, +rq[1], +rq[2], +rq[3]); }
    if (rule === 'nay') COSTS.lvDisc3 = 0.5;
    if (rreq) R_REQ.splice(0, 4, 0, ...rreq);
    // claude/sao3-re-nhanh: SET=lvDisc3=0.34,lv3Min=8,W.hop=12 → thử đòn bẩy (COSTS.* hoặc MARKET_W.*)
    for (const kv of (set || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); if (k.startsWith('W.')) MARKET_W[k.slice(2)] = +v; else COSTS[k] = +v; }   // RREQ=6,11,16 node … → áp ngưỡng R cho mọi luật (vd own1)
    if (rule === 'cu') { const orig = game.fusionReady.bind(game); game.fusionReady = (h) => ((h.tier || 0) >= game.ascendNeed(h) && !h.from ? true : orig(h)); }
    // claude/bo-chon-doi: không còn đội ưu tiên — chợ rút từ mọi tướng Thường
    game.market = null;
    let s = seed; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    game.running = false; game.owned = null;
    // cho-6-the: own1 = người chơi đã mở mọi tướng Thường + đúng 1 tướng Tím (đích công thức Tím đầu tiên: Cá Ông)
    if (rule === 'own1') { const f0 = FUSION.find((f) => HEROES[f.to].legend === 'epic' && BASIC_HEROES.includes(f.a) && BASIC_HEROES.includes(f.b)); game.owned = new Set([...BASIC_HEROES, f0.to]); }
    const g = game, DT = 1 / 20, recipes = FUSION.filter((f) => HEROES[f.to].legend === 'epic' && (rule !== 'own1' || g.ownsHero(f.to)));     // own1: bot theo công thức đã mở
    const partnerOn = (h) => recipes.some((f) => (f.a === h.type || f.b === h.type) && g.heroes.some((o) => o && o !== h && o.type === (f.a === h.type ? f.b : f.a)));
    let first = null, t = 0; const mk = {};
    // claude/sao3-re-nhanh: vàng tiêu theo hạng mục tới lúc ra Tím (MK=1 in ra)
    const spend = {};
    for (const fn of ['buyCard', 'levelUp', 'unlockSkill', 'rerollMarket', 'fuse']) { const o = g[fn].bind(g); g[fn] = (...a) => { const g0 = g.gold, r = o(...a); if (!first) spend[fn] = (spend[fn] || 0) + Math.max(0, g0 - g.gold); return r; }; }
    const note = (k) => { if (!mk[k]) mk[k] = g.wave; };
    const think = () => {
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
    while (!g.over && !g.won && (full || !first) && g.time < (full ? 4000 : 1800)) {
      g.update(DT); t += DT;
      if (g.heroes.some((h) => h && !h.from && h.tier >= 3)) note('s3');     // claude/sao3-re-nhanh: đợt có ★★★ đầu tiên
      if (rule === 'own1') for (const [k, ty] of [['A', recipes[0].a], ['B', recipes[0].b]]) { const h = g.heroes.filter((x) => x && x.type === ty).sort((x, y) => (y.tier || 0) - (x.tier || 0))[0]; if (h && h.tier >= 3) note(k + '3'); if (h && h.tier >= 3 && !g.skillGap(h)) note(k + 'kn'); }
      if (t >= 0.5) { t = 0; for (let k = 0; k < 6; k++) think(); }
    }
    return { spend, first, over: g.over, win: g.won, wave: g.wave, lives: g.lives, time: Math.round(g.time), mk, board: g.heroes.filter(Boolean).map((h) => h.type + h.tier + '/L' + h.level).join(' '), gold: Math.round(g.gold), rec: recipes.map((f) => f.a + '+' + f.b).join() };
  }, [rule, seed, FULL, process.env.RREQ ? process.env.RREQ.split(',').map(Number) : null, process.env.SET]);
  await browser.close();
  return r;
}

(async () => {
  const out = {};
  for (const lv of LEVELS) for (const rule of (process.argv[3] || 'cu,v180,v181').split(',')) {
    const rs = [], J = +process.env.J || 4;     // claude/sao3-re-nhanh: chạy song song J ván
    for (let k = 0; k < N; k += J) rs.push(...await Promise.all(Array.from({ length: Math.min(J, N - k) }, (_, j) => run(lv, rule, 1234 + (k + j) * 977))));
    const got = rs.filter((x) => x.first);
    const avg = (f) => (got.length ? (got.reduce((a, x) => a + f(x), 0) / got.length).toFixed(1) : '-');
    if (FULL) console.log(`   hết ải: thắng ${rs.filter((x) => x.win).length}/${N} · mạng còn TB ${(rs.reduce((a, x) => a + Math.max(0, x.lives), 0) / N).toFixed(1)} · ${rs.map((x) => (x.win ? `thắng(${x.lives}♥)` : x.over ? `thua đ${x.wave}` : `đ${x.wave}`)).join(' ')}`);
    const s3 = rs.filter((x) => x.mk.s3); console.log(`   ★★★ đầu tiên: ${s3.length}/${N} ván · đợt TB ${s3.length ? (s3.reduce((a, x) => a + x.mk.s3, 0) / s3.length).toFixed(1) : '-'}`);
    out[`${lv}/${rule}`] = { coTim: `${got.length}/${N}`, giay: avg((x) => x.first.t), dot: avg((x) => x.first.wave), thua: rs.filter((x) => !x.first && x.over).length };
    console.log(`ải ${lv + 1} · luật ${{ own1: 'luật hiện tại, đã mở 1 tướng Tím', cu: 'v136 ★★', kn2: '★★+KN (nguyên giá)', v180: 'v180 ★★★+KN', v181: 'v181 ★★★+KN, ★★★ lên cấp ½ giá', r12: '★★★+KN, R3 cấp 12' }[rule] || rule}: có Tím ${got.length}/${N} ván · TB ${avg((x) => x.first.t)} s · đợt ${avg((x) => x.first.wave)} · ${rs.map((x) => (x.first ? `đ${x.first.wave}` : x.over ? `thua/hết@${x.wave}` : '—')).join(' ')}`);
    if (process.env.MK) for (const x of rs) console.log('   mốc', JSON.stringify(x.mk), JSON.stringify(x.spend), 'đợt', x.wave, 't', x.time, 'vàng', x.gold, x.rec, '|', x.board);
  }
})();
