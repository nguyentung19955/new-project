// Mô phỏng cân bằng sự kiện đợt (nhánh vo-tan-su-kien): đội 8 tướng cố định, hệ số sát thương M.
// simWave(page, n, M, evOn) chạy trọn 1 đợt n, trả về số mạng mất + thời gian.
// minM(...) = hệ số M nhỏ nhất để qua đợt mà mất ≤ 2 mạng → "đợt sự kiện khó hơn đợt thường ×(M sự kiện / M thường)".
// Chạy riêng để xem bảng: node tests/vo-tan-su-kien/mo-phong.js
const TEAM = ['xathu', 'lactuong', 'thaymo', 'thansuong', 'lucsi', 'thosan', 'thoren', 'nguphu'];

// evOn: false = tắt sự kiện · true = theo lịch · 'tinhanh'… = ép sự kiện đó (mức k = evK) vào đợt n
async function simWave(page, n, M, evOn, evK = 0, level = 0, seed = 7) {
  return page.evaluate(([n, M, evOn, evK, level, seed, TEAM]) => {
    const g = game;
    if (!window.__origStats) { window.__origStats = heroStats; window.__origEv = eventAt; }
    window.__M = M;
    heroStats = (h) => { const s = window.__origStats(h); s.damage *= window.__M; return s; };
    eventAt = evOn === true ? window.__origEv : typeof evOn === 'string' ? ((w) => (w === n ? waveEventOf(evOn, n, evK) : null)) : (() => null);
    let s = seed; const rnd = Math.random; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    try {
      g.reset(level); g.endless = true; g.started = true; g.running = false; g.owned = null;
      g.gold = 1e9; g.lives = g.maxLives = 10000;
      const slots = [1, 3, 5, 7, 9, 11, 13, 15].filter((i) => i < CONFIG.slots.length);
      TEAM.forEach((t, i) => { const sl = slots[i]; if (g.heroes[sl] || g.isFlooded(sl)) return; g.placeHero(sl, t); const h = g.heroes[sl]; if (h) { h.level = 12; h.tier = 2; } });
      for (const h of g.heroes) if (h) h.hp = heroStats(h).hpMax;
      g.wave = n - 1; g.restWave = n - 1; g.nextWave = buildWave(n, level); g.nextWaveT = 0;
      g.startWave();
      // máu còn lại của quái lọt vào thành (đo mượt hơn số mạng)
      let leakHp = 0; const ue = g.updateEnemy;
      g.updateEnemy = function (e, dt) { const l = this.lives; ue.call(this, e, dt); if (this.lives < l) leakHp += Math.max(0, e.hp); };
      const lives0 = g.lives, DT = 1 / 20; let t = 0;
      while (g.waveActive && t < 600) { g.update(DT); t += DT; g.rest = null; }
      delete g.updateEnemy;
      g.events.length = 0;
      return { lost: lives0 - g.lives, leakHp, t: Math.round(t), done: !g.waveActive };
    } finally { Math.random = rnd; eventAt = window.__origEv; heroStats = window.__origStats; }
  }, [n, M, evOn, evK, level, seed, TEAM]);
}

// nhân đôi tìm khoảng rồi chia đôi theo log (5 lần, sai số ~2%)
// mỗi mức M chạy 3 seed, qua khi tổng mất ≤ 3 × maxLost (bớt nhiễu may rủi)
async function minM(page, n, evOn, from = 40, evK = 0, maxLost = 2) {
  const pass = async (M) => { let lost = 0; for (const sd of [7, 1234, 98765]) { const r = await simWave(page, n, M, evOn, evK, 0, sd); if (!r.done) return false; lost += r.lost; } return lost <= 3 * maxLost; };
  let lo, hi;
  if (await pass(from)) { hi = from; lo = from / 2; while (await pass(lo)) { hi = lo; lo /= 2; if (lo < 1e-3) return hi; } }
  else { lo = from; hi = from * 2; while (!(await pass(hi))) { lo = hi; hi *= 2; if (hi > 1e8) return Infinity; } }
  for (let i = 0; i < 5; i++) { const m = Math.sqrt(lo * hi); if (await pass(m)) hi = m; else lo = m; }
  return hi;
}
// thước đo mượt hơn: tổng mạng mất + máu quái lọt thành trên lưới lực đội M × [0,8 · 1 · 1,25] và 8 seed (một lần qua/thua rất nhiễu)
const SEEDS = [7, 1234, 98765, 4242, 31337, 555, 2024, 8080];
async function leaks(page, n, evOn, M, evK = 0, grid = [0.8, 1, 1.25]) {
  let lost = 0, hp = 0, out = 0;
  for (const f of grid) for (const sd of SEEDS) {
    const r = await simWave(page, n, M * f, evOn, evK, 0, sd); lost += r.lost; hp += r.leakHp; if (!r.done) out++;
  }
  return { lost, hp, out };
}
module.exports = { simWave, minM, leaks, TEAM };

if (require.main === module) (async () => {
  const { open, enter } = require('../cho-tuong/helpers');
  const { browser, page } = await open(844, 390, {});
  await enter(page, 0, true);
  const ids = await page.evaluate(() => WAVE_EVENT_IDS);
  const waves = (process.argv[2] || '60:0,100:4,150:9').split(',').map((x) => x.split(':').map(Number));
  for (const [n, k] of waves) {
    const t0 = Date.now();
    const b = await minM(page, n, false);
    const L0 = await leaks(page, n, false, b);
    const row = [];
    for (const id of ids) { const L = await leaks(page, n, id, b, k); row.push(`${id}: mất ${L.lost} mạng (×${(L.lost / Math.max(1, L0.lost)).toFixed(2)}) · máu lọt ×${(L.hp / Math.max(1, L0.hp)).toFixed(2)} · không xong ${L.out}`); }
    console.log(`đợt ${n} (k=${k}): M thường ${b.toFixed(1)} · lưới 24 trận: mất ${L0.lost} mạng\n  ${row.join('\n  ')}\n  (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  await browser.close();
})();
