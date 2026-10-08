// Dựng nhanh một bản lưu để thử, và công cụ đo trong ải. Chỉ dùng khi kiểm tra.
(function () {
  const G = window.G;
  // o: { hero, lvl, tier (bậc 0..3), sharpen, armor, helm, charm, forge, branch, marks, melee, sk, affixes, power, family }
  G.testSave = function (o) {
    o = o || {};
    G.resetSave();
    const sv = G.save;
    sv.sound = false; sv.tut.done = true;
    for (const k of G.HKEYS) sv.heroes[k].unlocked = true;
    sv.hero = o.hero || 'smith';
    const hs = sv.heroes[sv.hero];
    hs.lvl = o.lvl || 1;
    if (o.sk) hs.sk = Object.assign({ atk: 0, def: 0, elem: 0 }, o.sk);
    else { let pts = Math.min(10, Math.floor(hs.lvl / 3)); for (let i = 0; pts > 0; i++, pts--) hs.sk[G.SKEYS[i % 3]]++; }
    sv.weapons = []; sv.nextId = 1;
    const a = G.newWeapon(sv, o.melee || 'sword', o.tier || 0), b = G.newWeapon(sv, 'bow', o.tier || 0);
    for (const w of [a, b]) {
      // Dòng phụ và dòng mạnh chọn ngẫu nhiên sẽ làm số đo lệch: bài kiểm tra chỉ có khi tự yêu cầu (o.affixes, o.power).
      w.affixes = (o.affixes || []).slice(); w.power = o.power || null; w.family = o.family || 0;
      w.sharpen = o.sharpen || 0;
      if (o.branch) { w.marks[o.branch] = o.marks == null ? 30 : o.marks; if (w.marks[o.branch] >= G.MARKS[0]) w.branch = o.branch; }
    }
    sv.carry = [a.id, b.id];
    if (o.armor) { sv.owned.armor.push(o.armor); sv.armor = o.armor; }
    if (o.helm) { sv.owned.helm.push(o.helm); sv.helm = o.helm; }
    if (o.charm) { sv.owned.charm.push(o.charm); sv.charm = o.charm; }
    sv.forge = o.forge || 1;
    sv.gold = o.gold || 0;
    return sv;
  };
  // Chơi một ải bằng bot và ghi lại: thời gian từng phòng, nguồn sát thương lên người chơi, lỗi số liệu.
  G.probeRun = function (maxSec) {
    const out = { t: 0, rooms: [], hurt: {}, bad: [] };
    const orig = G.hurtPlayer;
    G.hurtPlayer = function (amt, el, src, melee) {
      const W = G.getWorld(), hp0 = W.P.hp;
      const r = orig(amt, el, src, melee);
      if (r) {
        const k = W.type + ':' + (src ? (src.isBoss ? 'trùm-đánh' : src.role) : W.boss ? 'vùng-trùm' : 'vùng/đạn');
        out.hurt[k] = Math.round((out.hurt[k] || 0) + (hp0 - W.P.hp));
      }
      return r;
    };
    let idx = -1, t0 = 0;
    try {
      for (let s = 0; s < maxSec * 2; s++) {
        const S = G.getRun();
        if (!S) break;
        if (S.idx !== idx) { if (idx >= 0) out.rooms.push([S.rooms[idx], Math.round(out.t - t0)]); idx = S.idx; t0 = out.t; }
        if (S.mode === 'result' || S.mode === 'dead') {
          const P = S.P, b = S.W.boss;
          out.rooms.push([S.rooms[idx], Math.round(out.t - t0)]);
          Object.assign(out, { win: S.mode === 'result', stars: S.result.stars, room: S.idx + 1, hp: Math.round(P.hp), maxhp: P.maxhp, potions: P.potions,
            layers: (S.layers || []).map(G.layerText), bossHp: b ? Math.round(Math.max(0, b.hp) / b.maxhp * 100) : null, marks: Math.round(S.marks), kills: S.loot.kills, dodges: S.stats.dodges });
          break;
        }
        if (S.mode !== 'play') { G.botRun(1); continue; }
        G.sim(30);
        out.t += 0.5;
        const W = S.W, P = S.P;
        if (!isFinite(P.hp) || !isFinite(P.x) || !isFinite(P.y)) out.bad.push('người chơi NaN ở phòng ' + S.idx);
        for (const e of W.ents.concat(W.boss && !W.boss.dead ? [W.boss] : [])) {
          if (!isFinite(e.hp) || !isFinite(e.x) || !isFinite(e.y)) out.bad.push('quái NaN ' + (e.role || e.kind));
          if (e.inside && (e.x < W.x0 - 1 || e.x > W.x1 + 1)) out.bad.push('quái ngoài phòng ' + e.role);
        }
        if (out.bad.length > 5) break;
      }
    } finally { G.hurtPlayer = orig; }
    out.t = Math.round(out.t);
    return out;
  };
})();
