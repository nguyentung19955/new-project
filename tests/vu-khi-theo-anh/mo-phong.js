// Mô phỏng cân bằng nhánh vu-khi-theo-anh: 3 tướng đổi cận chiến ↔ đánh xa cho khớp vũ khí trong ảnh
// (Thợ Săn: dao găm → cung · Trẻ Chăn Trâu: ná → gậy). Thợ Gốm đã hoàn tác (ảnh cầm bình gốm — khớp ném bình như cũ), giữ dòng cũ để đo lại nếu cần.
// So bản CŨ (dựng lại chỉ số cũ ngay trong trang) với bản MỚI (js/data.js hiện tại):
//   1. lực chiến heroPower ở cấp 10 / 20 (★★★, kỹ năng 10)
//   2. trận thật: tướng thử cấp 12 ở ô phủ đường tốt nhất + Xạ Thủ cấp 8 (lo quái bay) + 2 tướng cấp 1, đánh tới đợt 20 — sát thương tướng thử gây ra, mạng còn lại.
// Chạy: node tests/vu-khi-theo-anh/mo-phong.js [số ván=3] [ải,…=1,3] [mã,…=thosan,chantrau]   (không thuộc bộ test, chỉ để đo)
const { open, enter } = require('../cho-tuong/helpers');
const N = +process.argv[2] || 3, LEVELS = (process.argv[3] || '1,3').split(',').map(Number);
const HEROS = (process.argv[4] || 'thosan,chantrau').split(',');

const OLD = {
  thosan: { attack: 'melee', proj: undefined, wclass: 'blade', base: { damage: 2, range: 140, cooldown: 0.85 } },
  thogom: { attack: 'arrow', proj: 'melon', wclass: 'bow', base: { damage: 6, range: 165, cooldown: 1.35, splash: 30 },
    gm_w: (s, n) => { s.damage += n * 0.3; s.splash = Math.min(90, 35 + n * 0.4); } },
  chantrau: { attack: 'arrow', proj: 'bolt', wclass: 'bow', base: { damage: 5, range: 170, cooldown: 0.95 } },
};

async function run(T, variant, level, seed) {
  const { browser, page } = await open(844, 390, {});
  await enter(page, level);
  const r = await page.evaluate(([T, variant, seed, OLDs]) => {
    const OLD = eval('(' + OLDs + ')');
    if (variant === 'cu') {
      const d = HEROES[T], o = OLD[T];
      d.attack = o.attack; d.proj = o.proj; d.wclass = o.wclass; d.base = o.base; d._main = undefined;
      if (o.gm_w) d.skills.find((k) => k.id === 'gm_w').apply = o.gm_w;
    }
    let s = seed; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const g = game;
    g.running = false; g.owned = null;
    g.heroes.forEach((h, i) => { if (h) g.heroes[i] = null; });
    // ô xếp theo độ phủ đường quái (số điểm trên đường trong bán kính 150): tướng thử đứng ô phủ tốt nhất,
    // 3 tướng đỡ (cấp 1) đứng các ô kế — tướng thử phải gánh phần lớn trận để đo được sức của nó
    const slots = g.freeSlots().map((i) => { const [x, y] = CONFIG.slots[i]; let c = 0; for (let d = 0; d < PATH.total; d += 10) { const p = PATH.at(d); if (Math.hypot(p.x - x, p.y - y) < 150) c++; } return { i, c }; })
      .sort((a, b) => b.c - a.c).map((o) => o.i);
    const prep = (h, lv) => { h.level = lv; h.tier = 3; for (const sk of HEROES[h.type].skills) h.skillLv[sk.id] = lv >= 10 ? 10 : 0; const st = heroStats(h); h.hp = st.hpMax; h.mana = st.maxMana; };
    prep(g.spawnHero(slots[0], T, { tier: 3 }), 12);
    // Xạ Thủ cấp 8 lo quái bay (như đội thật luôn có tướng bắn quái bay) — so phần đánh quái đất cho công bằng giữa cận chiến và đánh xa
    prep(g.spawnHero(slots[1], 'xathu', { tier: 2 }), 8);
    ['thaymo', 'lactuong'].forEach((t, i) => prep(g.spawnHero(slots[2 + i], t, { tier: 1 }), 1));
    const me = g.heroes.find((h) => h && h.type === T);
    const pw = {};
    for (const lv of [10, 20]) { prep(me, lv); pw[lv] = heroPower(me); }
    prep(me, 12);
    // đếm sát thương thật tướng thử gây ra (máu quái trước − sau mỗi đòn)
    let dmg = 0, air = 0;
    const hit0 = g.hit.bind(g);
    g.hit = (e, a, hero, o) => { const b = Math.max(0, e.hp); const r = hit0(e, a, hero, o); if (hero === me) { const d = b - Math.max(0, e.hp); dmg += d; if (e.def && e.def.flying) air += d; } return r; };
    const DT = 1 / 20;
    let t = 0;
    while (!g.over && g.wave < 20 && t < 1500) {
      if (g.rest) g.rest = null;
      g.update(DT); t += DT;
    }
    return { slot: me.slot, nslots: slots.length, pw, dmg: Math.round(dmg), air: Math.round(air), lives: g.lives, wave: g.wave, over: !!g.over, won: !!g.won };
  }, [T, variant, seed, `{ thosan: ${JSON.stringify(OLD.thosan)}, thogom: { attack: 'arrow', proj: 'melon', wclass: 'bow', base: ${JSON.stringify(OLD.thogom.base)}, gm_w: ${OLD.thogom.gm_w.toString()} }, chantrau: ${JSON.stringify(OLD.chantrau)} }`]);
  await browser.close();
  return r;
}

(async () => {
  const rows = [];
  for (const T of HEROS) for (const v of ['cu', 'moi']) {
    const acc = { pw10: 0, pw20: 0, dmg: 0, air: 0, lives: 0, wave: 0, n: 0 };
    for (const L of LEVELS) for (let k = 0; k < N; k++) {
      const r = await run(T, v, L, 1234 + k * 777);
      acc.pw10 = r.pw[10]; acc.pw20 = r.pw[20]; acc.dmg += r.dmg; acc.air += r.air; acc.lives += r.lives; acc.wave += r.wave; acc.n++;
    }
    const row = { T, v, pw10: acc.pw10, pw20: acc.pw20, dmg: Math.round(acc.dmg / acc.n), air: Math.round(acc.air / acc.n), lives: +(acc.lives / acc.n).toFixed(1), wave: +(acc.wave / acc.n).toFixed(1) };
    rows.push(row); console.log(JSON.stringify(row));
  }
  console.log('\n| Tướng | Bản | Lực chiến cấp 10 | cấp 20 | Sát thương / trận | trong đó lên quái bay | Mạng còn | Đợt |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.T} | ${r.v === 'cu' ? 'cũ' : 'mới'} | ${r.pw10} | ${r.pw20} | ${r.dmg} | ${r.air} | ${r.lives} | ${r.wave} |`);
})();
