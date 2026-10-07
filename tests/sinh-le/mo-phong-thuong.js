// Mô phỏng cân bằng bảng thưởng boss "Chọn 1 trong 3" (nhánh claude/can-bang-phan-thuong).
// Bot giống nhau (mua thẻ, ghép, hợp thể, mở / nâng kỹ năng, lên cấp, mặc đồ cả đội), chỉ khác CÁCH CHỌN thưởng:
//   0 / 1 / 2 = luôn chọn ô thứ 1 / 2 / 3 · ngau = ngẫu nhiên · tham = chọn ô có "vàng tương đương" cao nhất
//   + theo kiểu (chỉ bản mới): ngay, lau, thu, cong, he, ruiro, bau, do — có ô kiểu đó thì chọn, không có thì tham
// Mỗi lần mở bảng thưởng ghi "vàng tương đương" của cả 3 ô (cùng một thước đo cho bản cũ và bản mới):
//   vàng = vàng · mạng = MANG_G vàng/mạng · lực chiến tăng (đồ / cấp / buff) quy ra vàng theo giá lên cấp
//   (vàng cần để tăng 1 điểm lực chiến bằng cách lên cấp, trung vị các tướng trên sân) · thu nhập theo đợt × 0.85
//   · cược = xác suất qua đợt không mất mạng (theo 3 đợt gần nhất) × thưởng.
// Chạy: node tests/sinh-le/mo-phong-thuong.js [số ván=4] [ải,…=2,4] [chiến lược,…=0,1,2,ngau,tham] [đợt tối đa=60]
//   (không thuộc bộ test, chỉ để đo; vô tận để bot thua ở đợt nào đó → so đợt đạt được)
const { open, enter } = require('../cho-tuong/helpers');
const N = +process.argv[2] || 4;
const LEVELS = (process.argv[3] || '2,4').split(',').map(Number);
const STRATS = (process.argv[4] || '0,1,2,ngau,tham').split(',');
const MAXW = +process.argv[5] || 60;
const J = +process.env.J || 4;

async function run(level, strat, seed) {
  const { browser, page, errors } = await open(844, 390, {});
  await enter(page, level, true);
  const r = await page.evaluate(([strat, seed, MAXW]) => {
    let s = seed; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const g = game, DT = 1 / 20;
    g.running = false; g.owned = null;
    const MANG_G = 40, REVIVE_G = (w) => 120 + 8 * w;
    // ---- thước đo "vàng tương đương" (cùng công thức với Game.rewardValue bản mới, chép lại để đo được cả bản cũ)
    const rates = () => {
      const m = new Map(), all = [];
      for (const h of g.heroes) {
        if (!h || h.level >= CONFIG.maxLevel) continue;
        const p0 = heroPower(h); h.level++; const p1 = heroPower(h); h.level--; heroStats(h);
        if (p1 > p0) { const r = g.levelCost(h) / (p1 - p0); m.set(h, r); all.push(r); }
      }
      all.sort((a, b) => a - b); m.mid = all.length ? all[all.length >> 1] : 5;
      return m;
    };
    const pg = (h, dp, R) => dp * (R.get(h) || R.mid);
    const recentSafe = () => { const L = g._lossLog.slice(-3); return L.length ? L.filter((x) => !x).length / L.length : 0.75; };
    const itemsGain = (ids, R) => {
      const tried = []; let sum = 0;
      for (const id of ids) {
        const inst = makeItem(id); let best = null, bg = 0;
        for (const h of g.heroes) { if (!h) continue; const gn = pg(h, upgradeGain(h, inst), R); if (gn > bg) { bg = gn; best = h; } }
        if (best) { const sl = slotFor(best, inst); tried.push([best, sl, best.equip[sl]]); best.equip[sl] = inst; sum += bg; }
      }
      for (const [h, sl, old] of tried.reverse()) h.equip[sl] = old;
      for (const h of g.heroes) if (h) heroStats(h);
      return sum;
    };
    const value = (o, R) => {
      let v = (o.gold || 0) + (o.lives || 0) * MANG_G;
      if (o.kind === 'item') {
        v += itemsGain(o.ids || [o.id], R);
        if (ITEMS[o.id] && ITEMS[o.id].revive) v += REVIVE_G(g.wave);
      } else if (o.kind === 'levelup') {
        for (const h of g.heroes) {
          if (!h || (o.who && !o.who.includes(h.id))) continue;
          const L = h.level;
          for (let i = 0; i < o.levels && h.level < CONFIG.maxLevel; i++) { v += g.levelCost(h); h.level++; }
          h.level = L;
        }
      } else if (o.kind === 'income') v += o.per * o.waves * 0.85;
      else if (o.kind === 'elbuff') {
        for (const h of g.heroes) {
          if (!h || HEROES[h.type].el !== o.el) continue;
          const b = h.buff, p0 = heroPower(h);
          h.buff = Object.assign({}, b, { elPct: ((b && b.elPct) || 0) + o.pct });
          v += pg(h, heroPower(h) - p0, R); h.buff = b; heroStats(h);
        }
      } else if (o.kind === 'bet') { const p = recentSafe(); v = (o.lives || 0) * MANG_G + p * o.win + (1 - p) * o.lose; }
      return Math.round(v);
    };
    // ---- bot (giống tests/hop-the/mo-phong.js, thêm mặc đồ cả đội)
    const recipes = FUSION.filter((f) => HEROES[f.to].legend === 'epic');
    const think = () => {
      for (const a of g.heroes) for (const b of g.heroes) if (a && b && a !== b && typeof g.canFuse(a, b) !== 'string' && fusionFor(a.type, b.type)) { g.fuse(a.slot, b.slot); return; }
      g.autoMerge();
      for (const h of g.heroes) if (h && !h.from) for (let i = 0; i < 4; i++) {
        if (!skillLevel(h, i)) { if (g.unlockSkill(h, i) === true) return; } else if (h.skillPts > 0 && g.upgradeSkill(h, i) === true) return;
      }
      const m = g.ensureMarket(), free = g.freeSlots().length, n = g.heroes.filter(Boolean).length;
      const want = m.types.map((ty, i) => ({ i, sc: g.marketTwin(ty) ? 3 : recipes.some((f) => (f.a === ty || f.b === ty) && g.heroes.some((o) => o && o.type === (f.a === ty ? f.b : f.a))) ? 2 : g.heroes.some((o) => o && o.type === ty) ? 1 : 0 }))
        .sort((x, y) => y.sc - x.sc)[0];
      if (g.gold >= g.summonCost() && (free > 0 || want.sc === 3) && (want.sc >= 1 || n < 5)) { g.buyCard(want.i, -1); return; }
      if (want.sc === 0 && n >= 5 && free > 0 && g.gold >= g.summonCost() + 2 * g.rerollCost()) { g.rerollMarket(); return; }
      const tgt = g.heroes.filter((h) => h && h.level < CONFIG.maxLevel).sort((a, b) => a.level - b.level)[0];
      if (tgt && g.gold >= g.levelCost(tgt)) g.levelUp(tgt);
    };
    const picks = [], offers = [];
    let t = 0, livesW = g.lives, lastW = g.wave;
    g._lossLog = [];
    const choose = (opts) => {
      const R = rates();
      const vals = opts.map((o) => value(o, R));
      const best = vals.indexOf(Math.max(...vals));
      offers.push({ wave: g.wave, kinds: opts.map((o) => o.tag || (o.sinhLe ? 'sinhle' : o.jar ? 'hu' : o.kind)), vals, best });
      let i;
      if (/^[0-2]$/.test(strat)) i = +strat;
      else if (strat === 'ngau') i = Math.floor(Math.random() * opts.length);
      else if (strat === 'tham') i = best;
      else { i = opts.findIndex((o) => o.tag === strat); if (i < 0) i = best; }
      picks.push(i);
      g.claimReward(opts[i]);
      g.autoEquipAll();
    };
    while (!g.over && g.wave <= MAXW && g.time < 7200) {
      g.update(DT); t += DT;
      for (let k = g.events.length - 1; k >= 0; k--) {
        const ev = g.events[k];
        if (ev.type === 'reward') { g.events.splice(k, 1); choose(ev.options); }
      }
      if (g.events.length > 50) g.events.length = 0;
      if (g.wave !== lastW) { g._lossLog.push(g.lives < livesW); livesW = g.lives; lastW = g.wave; g.autoEquipAll(); }
      if (t >= 0.5) { t = 0; for (let k = 0; k < 6; k++) think(); }
    }
    return { wave: g.over ? g.wave : g.wave, over: g.over, lives: g.lives, time: Math.round(g.time), picks, offers };
  }, [strat, seed, MAXW]);
  await browser.close();
  if (errors.length) r.errors = errors.slice(0, 3);
  return r;
}

async function pool(tasks, j) {
  const out = new Array(tasks.length); let i = 0;
  await Promise.all(Array.from({ length: j }, async () => { while (i < tasks.length) { const k = i++; out[k] = await tasks[k](); } }));
  return out;
}

(async () => {
  const tasks = [], keys = [];
  for (const lv of LEVELS) for (const st of STRATS) for (let k = 0; k < N; k++) { keys.push([lv, st, k]); tasks.push(() => run(lv, st, 1234 + k * 977)); }
  const res = await pool(tasks, J);
  const all = {};
  res.forEach((r, i) => { const [lv, st] = keys[i]; (all[`${lv}|${st}`] = all[`${lv}|${st}`] || []).push(r); });
  console.log('\n=== Kết quả từng chiến lược (vô tận, tối đa đợt ' + MAXW + ') ===');
  for (const lv of LEVELS) for (const st of STRATS) {
    const rs = all[`${lv}|${st}`];
    const avg = (f) => (rs.reduce((a, x) => a + f(x), 0) / rs.length).toFixed(1);
    console.log(`ải ${lv + 1} · ${st.padEnd(5)}: đợt TB ${avg((x) => x.wave)} · ${rs.map((x) => x.wave + (x.over ? '' : '+')).join(' ')}${rs.some((x) => x.errors) ? ' · LỖI ' + rs.find((x) => x.errors).errors[0] : ''}`);
  }
  // giá trị từng ô: gom mọi bảng thưởng của mọi ván
  const offers = res.flatMap((r) => r.offers);
  const byKind = {}, slot = [0, 0, 0];
  let spreadSum = 0, within15 = 0;
  for (const o of offers) {
    slot[o.best]++;
    const mx = Math.max(...o.vals), mn = Math.min(...o.vals);
    const sp = mx > 0 ? (mx - mn) / mx : 0; spreadSum += sp; if (sp <= 0.15) within15++;
    o.kinds.forEach((k, i) => {
      const b = byKind[k] = byKind[k] || { n: 0, best: 0, v: 0, rel: 0 };
      b.n++; b.v += o.vals[i]; b.rel += mx ? o.vals[i] / mx : 0; if (i === o.best) b.best++;
    });
  }
  console.log(`\n=== ${offers.length} bảng thưởng · ô tốt nhất: ô1 ${slot[0]} · ô2 ${slot[1]} · ô3 ${slot[2]} · chênh (max-min)/max TB ${(100 * spreadSum / offers.length).toFixed(0)}% · ≤15%: ${within15}/${offers.length}`);
  for (const [k, b] of Object.entries(byKind).sort((a, b) => b[1].n - a[1].n)) {
    console.log(`  ${k.padEnd(8)} xuất hiện ${String(b.n).padStart(3)} · tốt nhất ${(100 * b.best / b.n).toFixed(0).padStart(3)}% · vàng tương đương TB ${Math.round(b.v / b.n)} · so với ô tốt nhất ${(100 * b.rel / b.n).toFixed(0)}%`);
  }
  for (const w of [10, 20, 30, 40, 50]) {
    const os = offers.filter((o) => o.wave === w);
    if (!os.length) continue;
    const kv = {};
    for (const o of os) o.kinds.forEach((k, i) => { (kv[k] = kv[k] || []).push(o.vals[i]); });
    console.log(`  đợt ${w}: ` + Object.entries(kv).map(([k, v]) => `${k} ${Math.round(v.reduce((a, b) => a + b, 0) / v.length)}`).join(' · '));
  }
  if (process.env.JSON_OUT) require('fs').writeFileSync(process.env.JSON_OUT, JSON.stringify({ all, offers }, null, 1));
})();
