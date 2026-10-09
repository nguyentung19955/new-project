// Chiến đấu: người chơi, quái, hiệu ứng ba hệ, kết hợp hệ, dấu ấn và tiến hóa vũ khí.
(function () {
  const G = window.G;
  let W = null; // thế giới của phòng hiện tại
  G.getWorld = () => W;
  // Gọi lớp hiệu ứng (js/fx.js). Chạy không vẽ thì bỏ qua hẳn; thiếu fx.js game vẫn chạy.
  function FX(n, a, b, c, d, e) {
    if (G.noRender) return;
    const f = G.fx && G.fx[n];
    if (f) f(a, b, c, d, e);
  }

  // ---------- vũ khí ----------
  G.wStage = function (w) {
    if (!w || !w.branch) return 0;
    const m = w.marks[w.branch];
    const s = m >= G.MARKS[2] ? 3 : m >= G.MARKS[1] ? 2 : m >= G.MARKS[0] ? 1 : 0;
    return Math.min(s, G.RARITY[G.wRar(w)].maxStage);
  };
  // Bậc 0..3 (Thường, Lam, Tím, Vàng). Bản sao vũ khí hoặc vũ khí dựng tạm chỉ có tier cũ vẫn đọc được.
  G.wRar = (w) => G.clamp((w.rarity != null ? w.rarity : w.tier) | 0, 0, G.RARITY.length - 1);
  G.wHas = (w, k) => !!(w && w.affixes && w.affixes.includes(k)); // có dòng phụ k không
  // Tên hiển thị lấy theo hình (dòng, nhánh, mốc) từ js/weapon_art.js, kèm danh hiệu và cấp mài.
  G.wName = function (w) {
    const st = G.wStage(w), WA = G.weaponArt;
    const base = WA ? WA.name(WA.fromWeapon(w)) : G.WTYPES[w.type].name + (st ? ' ' + G.NAME_WORDS[w.branch][st - 1] : '');
    return base + (w.title || '') + (w.sharpen ? ' +' + w.sharpen : '');
  };
  // Hệ số bậc: Vàng của vùng sau cao hơn (G.GOLD_MULT).
  G.wRarMult = (w) => (G.wRar(w) === 3 ? G.GOLD_MULT[w.gold | 0] || G.GOLD_MULT[0] : G.RARITY[G.wRar(w)].mult);
  G.wBase = function (w, lvl) {
    return G.WTYPES[w.type].dmg * G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * w.sharpen) * (1 + G.LVL_DMG * ((lvl || 1) - 1));
  };
  function nameWeapon(w) {
    // Danh hiệu chỉ tính boss vùng, không tính trùm nhỏ.
    const bk = Object.keys(w.bossKills || {}).filter((k) => G.REGIONS.some((r) => r.bossName === k)).sort((a, b) => w.bossKills[b] - w.bossKills[a])[0];
    w.title = bk ? ', kẻ hạ ' + bk : w.kills >= 1000 ? ', nghìn mạng' : '';
    w.named = true;
  }
  G.addMarks = function (w, el, n) {
    if (!w || n <= 0) return;
    const before = G.wStage(w);
    w.marks[el] += n;
    if (!w.branch && w.marks[el] >= G.MARKS[0]) w.branch = el;
    const after = G.wStage(w);
    if (W) {
      W.marksGained += n;
      FX('marks', el, n);
      const next = G.MARKS[Math.min(2, after)];
      G.sfx('mark', 0.8 + 0.6 * Math.min(1, w.marks[el] / next));
    }
    if (after === 3 && !w.named) nameWeapon(w);
    if (after > before) {
      // Lên Thành hình và Thức tỉnh: báo luôn tên đặc trưng hệ vừa mở.
      const ft = after >= 2 ? G.HE_FEATURES[w.branch][after - 2] : null;
      if (W) W.banner = { s: G.wName(w) + ' đạt mốc ' + G.STAGE_NAMES[after] + '!' + (ft ? ' Mở đặc trưng: ' + ft.name : ''), col: G.EL[w.branch].col, t: ft ? 4.5 : 3.5, feature: ft ? ft.name : null };
      G.sfx('evolve');
      if (W) FX('evolve', w.branch, after);
    }
  };

  // ---------- chỉ số người chơi ----------
  G.buildPlayer = function () {
    const sv = G.save, key = sv.hero, H = G.HEROES[key], hs = sv.heroes[key];
    const sk = hs.sk;
    const armor = sv.armor ? G.GEAR.armor[sv.armor] : null;
    const helm = sv.helm ? G.GEAR.helm[sv.helm] : null;
    const set = armor && helm && armor.set && armor.set === helm.set ? armor.set : null;
    let maxhp = H.hp * (1 + G.LVL_HP * (hs.lvl - 1)) + (armor ? armor.hp : 0);
    if (sk.def >= 1) maxhp *= 1.1;
    if (sv.charm === 'c_greed' && hs.lvl >= 5) maxhp *= 0.9;
    const P = {
      isPlayer: true, key, lvl: hs.lvl, sk, x: 60, y: 190, r: 7, hr: 6, face: 1,
      maxhp: Math.round(maxhp), hp: Math.round(maxhp),
      maxmana: H.mana + (sk.elem >= 1 ? 20 : 0), mana: 0,
      speed: 72 * H.speed * (sv.armor === 'a_ho' ? 1.08 : 1),
      weapons: sv.carry.map((id) => G.weaponById(id)).filter(Boolean), cur: 0, coats: {},
      atkT: 0, atkDur: 0, cdT: 0, hitDone: true, comboI: -1, lastAtk: 0, hitCount: 0,
      dodgeT: 0, dodgeCd: 0, ddx: 1, ddy: 0, inv: 0, hurtT: 0, dashT: 0, dashHit: null,
      castT: 0, specT: 0, deadT: 0, // đồng hồ cho hoạt ảnh: dùng kỹ năng, tung đòn đặc biệt, gục
      st: { fire: 0, poison: 0, ice: 0 }, dot: 0, dotT: 0,
      potions: 2, skillCd: 0, specCd: 0, swapCd: 0, gongT: 0, firstHit: false, boost: false, stillT: 0, t: 0, moving: false,
      dmgMult: (1 + (sk.atk >= 1 ? 0.08 : 0) + (sk.atk >= 4 ? 0.08 : 0)),
      crit: sk.atk >= 5 ? 0.1 : 0, specCost: 25 - (sk.atk >= 2 ? 5 : 0), statusBonus: sk.atk >= 3 ? 1.15 : 1,
      dodgeCdMax: sk.def >= 2 ? 0.75 : 1, roomHeal: sk.def >= 3 ? 0.08 : 0,
      dr: (armor ? armor.dr : 0) + (sk.def >= 5 ? 0.1 : 0) + (key === 'wrestler' ? 0.25 : 0),
      resist: { fire: 0, poison: 0, ice: 0 },
      manaHit: 2 + (sk.elem >= 2 ? 1 : 0), comboMult: sk.elem >= 3 ? 1.3 : 1, swapProc: sk.elem >= 4,
      statusDur: (key === 'healer' ? 1.3 : 1) * (sk.elem >= 5 ? 1.25 : 1),
      markMult: key === 'smith' ? 1.2 : 1, set, charm: hs.lvl >= 5 ? sv.charm : null, helm: sv.helm, armor: sv.armor,
    };
    if (helm) P.resist[helm.res] += helm.pct;
    if (sk.def >= 4) for (const e of G.ELS) P.resist[e] = Math.min(0.8, P.resist[e] + 0.3);
    P.mana = Math.round(P.maxmana * 0.5);
    return P;
  };
  // SỨC MẠNH của em bé (một con số để so với "Sức mạnh khuyên dùng" của ải): căn bậc hai của (đòn mạnh nhất x máu hữu hiệu).
  // Đòn: vũ khí mạnh nhất đang mang, quy về thang của kiếm (cấp hero, bậc, mài, mốc tiến hóa, điểm Công, chí mạng).
  // Máu hữu hiệu: máu tối đa (cấp hero, áo, điểm Thủ) chia cho phần sát thương còn nhận (giáp, nội tại), cộng chút kháng hệ của mũ.
  // Em bé mới cấp 1 cầm kiếm Thường có sức mạnh 100. Trang phục có chỉ số (G.outfitStats nếu có) cũng được tính.
  G.power = function () {
    if (!G.save || !G.save.heroes) return 0;
    const P = G.buildPlayer();
    let off = 0;
    for (const w of P.weapons) off = Math.max(off, (G.pDamage(P, w) / G.WTYPES[w.type].dmg) * 10 * (G.wHas(w, 'crit') ? 1.1 : 1));
    if (!off) off = 10 * (1 + 0.01 * (P.lvl - 1));
    off *= 1 + P.crit;
    let res = 0;
    for (const e of G.ELS) res = Math.max(res, P.resist[e] || 0);
    const ehp = (P.maxhp / (1 - Math.min(0.75, P.dr))) * (1 + 0.25 * Math.min(0.8, res));
    return Math.round(3 * Math.sqrt(off * ehp) * (P.powerMult || 1));
  };
  // Màu so sánh: đủ (xanh), sát nút (vàng, từ 90% khuyên dùng), thiếu (đỏ).
  G.powerCol = function (have, need) { return have >= need ? '#6fdc6a' : have >= need * 0.9 ? '#ffd23f' : '#ff6a5a'; };
  const curW = (P) => P.weapons[P.cur];
  G.curW = curW;
  G.activeEl = function (P, w) {
    const c = P.coats[w.id];
    if (c && c.t > 0) return c.el;
    return G.wStage(w) > 0 ? w.branch : null;
  };
  G.pDamage = function (P, w) {
    return G.wBase(w, P.lvl) * P.dmgMult * (G.HEROES[P.key].fav.includes(w.type) ? 1.1 : 1);
  };

  // ---------- thế giới ----------
  G.newWorld = function (P, o) {
    W = {
      P, w: o.w || 480, x0: 10, x1: (o.w || 480) - 10, y0: G.GY0 + 8, y1: G.GY1,
      ents: [], boss: null, props: [], projs: [], zones: [], parts: [], texts: [], slashes: [],
      cam: 0, shake: 0, banner: o.banner || null, base: o.base, region: o.region,
      stats: o.stats, marksMult: o.marksMult || 1, haste: o.haste || 1, hpFloor: o.hpFloor || false,
      marksGained: 0, loot: o.loot, over: null, usedPotion: false, shrink: null, seed: o.seed || 1,
    };
    P.x = 50; P.y = (W.y0 + W.y1) / 2;
    P.inv = 0.6;
    return W;
  };
  G.setWorld = (w) => { W = w; };

  function st0() {
    return { fire: 0, fireDmg: 0, poisonN: 0, poisonT: 0, poisonDmg: 0, iceN: 0, iceT: 0, frozen: 0, freezeImm: 0, stun: 0, root: 0, comboCd: 0, tick: 0, last: null };
  }
  G.st0 = st0;
  G.hasStatus = (e) => e.st.fire > 0 || e.st.poisonN > 0 || e.st.iceN > 0 || e.st.frozen > 0;

  G.spawnEnemy = function (role, x, y, o) {
    o = o || {};
    const R = G.ROLES[role] || G.ROLES.rusher;
    const reg = G.REGIONS[W.region];
    const e = {
      role, x, y, r: R.r, hr: role === 'elite' ? 9 : 6, face: -1, t: G.rnd() * 5,
      maxhp: W.base.hp * R.hp * (o.hpMult || 1), dmg: W.base.dmg * R.dmg * (o.dmgMult || 1), speed: R.speed * W.haste,
      armor: R.armor || 0, marks: o.add ? 0 : R.marks, skin: reg.skin, el: role === 'elite' ? o.el || reg.el : o.el || null,
      st: st0(), flash: 0, wind: 0, cd: G.rr(0.4, 1.4), state: 'move', moving: false, scale: role === 'elite' ? 1.5 : 1,
      h: role === 'swarm' ? 10 : role === 'nimble' || role === 'shield' ? 15 : 24, resist: o.resist || null, slamCd: 4,
      add: !!o.add,
    };
    e.hp = e.maxhp;
    W.ents.push(e);
    if (G.mobInit) G.mobInit(e, o); // hình mới và cơ chế theo vai (js/mobs.js)
    return e;
  };

  // ---------- hiệu ứng nhỏ ----------
  G.burst = function (x, y, col, n, sp) {
    FX('burst', x, y, col, n, sp);
  };
  G.inZone = function (z, e, pad) {
    if (z.shape !== 'circle' && z.shape !== 'rect' && G.inShape) return G.inShape(z, e, pad || 0); // đường thẳng, quạt, vành khăn (js/mobs.js)
    if (z.shape === 'circle') {
      const dx = (e.x - z.x) / z.r, dy = (e.y - z.y) / (z.r * (G.ZK || 0.6));
      return dx * dx + dy * dy <= 1;
    }
    return e.x >= z.x && e.x <= z.x + z.w && e.y >= z.y && e.y <= z.y + z.h;
  };
  G.zoneCircle = function (x, y, r, t, dmg, el, extra) {
    const z = Object.assign({ shape: 'circle', x, y, r, t, t0: t, dmg, el: el || null, life: 0.12 }, extra || {});
    W.zones.push(z);
    return z;
  };
  G.zoneRect = function (x, y, w, h, t, dmg, el, extra) {
    const z = Object.assign({ shape: 'rect', x, y, w, h, t, t0: t, dmg, el: el || null, life: 0.12 }, extra || {});
    W.zones.push(z);
    return z;
  };

  // ---------- sát thương ----------
  G.targets = function () {
    const a = W.ents.filter((e) => !e.dead && !e.hidden && !e.ghost); // đang lặn dưới đất hay đang nổ thì không nhắm được
    if (W.boss && !W.boss.dead && !W.boss.hidden) a.push(W.boss);
    return a;
  };
  G.damage = function (t, amt, o) {
    o = o || {};
    if (t.dead || t.hidden || t.ghost || amt <= 0) return 0;
    if (t.invuln > 0) return 0; // trùm đang ra mắt hay đang chuyển pha
    let m = 1;
    m *= 1 + 0.04 * t.st.poisonN;
    const arm = G.mobArmor ? G.mobArmor(t, o) : t.armor; // giáp quái mới chỉ che phía trước
    if (arm) m *= 1 - Math.max(0, arm - 0.09 * t.st.poisonN);
    if (t.resist && o.el === t.resist) m *= 0.75;
    if (t.isBoss) {
      for (const l of t.layers) {
        if (l.type === 'resist' && o.el === l.el) m *= 1 - l.pct;
      }
      if (o.el && t.weak.includes(o.el)) { m *= 1.3; t.weakHits++; }
      if (o.ranged && t.layers.some((l) => l.type === 'antiRanged') && t.rangedShield && t.rangedShield(W.P)) m *= 0.3;
      if (t.exposed > 0) m *= 1.5;
      if (t.onHit) t.onHit(o);
    }
    if (o.fromPlayer !== false) {
      W.stats.el[o.el || 'none'] += amt;
      if (o.src === 'hit') { if (o.ranged) W.stats.ranged += amt; else W.stats.melee += amt; }
    }
    const d = amt * m;
    t.hp -= d;
    t.flash = 0.07;
    t.lastEl = o.el || null;
    if (!G.noRender) FX('dmg', t, d, { crit: o.crit, el: o.el, m, dot: o.src === 'dot' });
    if (t.hp <= 0) G.kill(t, o);
    return d;
  };

  G.applyStatus = function (t, el, src, stacks) {
    if (t.dead || t.hidden) return;
    const st = t.st, P = W.P;
    const dur = P.statusDur;
    stacks = stacks || 1;
    const has = { fire: st.fire > 0, poison: st.poisonN > 0, ice: st.iceN > 0 || st.frozen > 0 };
    if (st.comboCd <= 0) {
      if ((el === 'fire' && has.poison) || (el === 'poison' && has.fire)) {
        st.comboCd = 0.6;
        // Gây sát thương trước rồi mới tiêu độc, để kết liễu bằng Nổ khói vẫn được tính dấu ấn.
        for (const o of G.targets()) if (o !== t && Math.hypot(o.x - t.x, (o.y - t.y) * 1.6) < 42) G.damage(o, 1.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        G.damage(t, 1.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        st.poisonN = 0; st.poisonDmg = 0; st.poisonT = 0;
        FX('combo', 'smoke', t);
        G.sfx('boom');
        if (el === 'poison') return;
      } else if ((el === 'fire' && has.ice) || (el === 'ice' && has.fire)) {
        st.comboCd = 0.6;
        G.damage(t, 2.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        st.fire = 0; st.fireDmg = 0; st.iceN = 0; st.iceT = 0; st.frozen = Math.min(st.frozen, 0);
        FX('combo', 'shock', t);
        G.sfx('boom', 1.6);
        return;
      }
    }
    if (t.dead) return;
    const n = (st.fire > 0 ? 1 : 0) + (st.poisonN > 0 ? 1 : 0) + (st.iceN > 0 || st.frozen > 0 ? 1 : 0);
    const mine = el === 'fire' ? st.fire > 0 : el === 'poison' ? st.poisonN > 0 : st.iceN > 0 || st.frozen > 0;
    if (!mine && n >= 2) return;
    st.last = el;
    if (el === 'fire') {
      st.fire = 3 * dur;
      st.fireDmg = Math.max(st.fireDmg, src * 0.2);
      G.sfx('fire');
    } else if (el === 'poison') {
      st.poisonN = Math.min(5, st.poisonN + stacks);
      st.poisonT = 5 * dur;
      st.poisonDmg = Math.max(st.poisonDmg, src * 0.06);
      G.sfx('poison');
    } else {
      st.iceT = 4 * dur;
      st.iceN += stacks;
      if (st.freezeImm > 0) st.iceN = Math.min(4, st.iceN);
      else if (st.iceN >= 5) {
        st.iceN = 0;
        st.freezeImm = 5;
        if (t.isBoss) st.stun = Math.max(st.stun, 0.5); else st.frozen = 1.5 * dur;
        FX('freeze', t);
      }
      G.sfx('ice');
    }
    FX('status', t, el);
  };

  function tickStatus(e, dt) {
    const st = e.st;
    st.comboCd -= dt; st.freezeImm -= dt; st.stun -= dt; st.root -= dt; st.frozen -= dt;
    st.tick -= dt;
    const tick = st.tick <= 0;
    if (tick) st.tick = 0.5;
    if (st.fire > 0) {
      st.fire -= dt;
      if (tick) G.damage(e, st.fireDmg * 0.5, { el: 'fire', src: 'dot' });
      if (st.fire <= 0) st.fireDmg = 0;
    }
    if (!e.dead && st.poisonN > 0) {
      st.poisonT -= dt * (st.iceN > 0 ? 0.5 : 1);
      if (tick) G.damage(e, st.poisonDmg * st.poisonN * 0.5, { el: 'poison', src: 'dot' });
      if (st.poisonT <= 0) { st.poisonN = 0; st.poisonDmg = 0; }
    }
    if (st.iceN > 0) {
      st.iceT -= dt;
      if (st.iceT <= 0) st.iceN = 0;
    }
  }
  G.tickStatus = tickStatus;
  const slowOf = (e) => Math.max(0.4, 1 - 0.15 * e.st.iceN);

  G.kill = function (e, o) {
    if (e.dead) return;
    e.dead = true;
    if (G.mobOnKill) G.mobOnKill(e); // tinh anh nổ khi chết, đồng hồ màn chết của trùm (js/mobs.js)
    const P = W.P, w = (o && o.w) || curW(P);
    G.sfx('die');
    FX('death', e, o);
    if (e.illusion) return;
    if (w) w.kills++;
    if (G.hasStatus(e)) {
      // Hệ của dấu ấn: hiệu ứng gây sau cùng nếu nó còn hiệu lực, không thì hiệu ứng đang có.
      const on = { fire: e.st.fire > 0, poison: e.st.poisonN > 0, ice: e.st.iceN > 0 || e.st.frozen > 0 };
      const el = e.st.last && on[e.st.last] ? e.st.last : on.fire ? 'fire' : on.poison ? 'poison' : 'ice';
      G.addMarks(w, el, (e.marks == null ? 1 : e.marks) * P.markMult * W.marksMult);
      FX('markOrbs', e);
      if (P.charm === 'c_spirit') P.mana = Math.min(P.maxmana, P.mana + 5);
    }
    if (G.moves) G.moves.onKill(e, o, w); // đặc trưng hệ khi quái chết: Nổ lan, Lây độc (chỉ ở Thức tỉnh)
    P.mana = Math.min(P.maxmana, P.mana + 5);
    if (P.charm === 'c_leech') P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.02);
    if (!e.add) {
      W.loot.kills++;
      if (e.role === 'elite' && G.rnd() < 0.25) W.loot.charm = true;
      if (e.role === 'elite' && G.onEliteDown) G.onEliteDown(e); // tinh anh có thể rơi vũ khí (js/stage.js)
    }
    if (e.isBoss) {
      W.loot.bossDown = true;
      W.loot.finalEl = (o && o.el) || null;
      if (w) w.bossKills[e.name] = (w.bossKills[e.name] || 0) + 1;
      for (const x of W.ents) if (!x.dead) G.kill(x, {});
      W.zones.length = 0;
      W.projs.length = 0;
      W.shake = 0.6;
    }
  };

  // ---------- người chơi ra đòn ----------
  function playerHit(e, mult, o) {
    const P = W.P, w = o.w;
    let d = G.pDamage(P, w) * mult;
    let crit = false;
    if (G.rnd() < P.crit + (G.wHas(w, 'crit') ? 0.1 : 0)) { d *= 2; crit = true; }
    // dòng mạnh riêng của bậc Vàng
    if (w.power === 'boss' && (e.isBoss || e.role === 'elite')) d *= 1.2;
    if (w.power === 'first' && e.hp >= e.maxhp) d *= 2;
    if (G.hasStatus(e)) d *= P.statusBonus;
    if (P.charm === 'c_ember' && e.st.fire > 0) d *= 1.15;
    if (P.key === 'hunter' && (e.st.frozen > 0 || e.st.stun > 0 || e.st.root > 0 || e.exposed > 0)) d *= 1.25;
    if (P.boost) { d *= 1.6; P.boost = false; }
    const el = G.activeEl(P, w);
    G.damage(e, d, { el, ranged: o.ranged, src: 'hit', w, crit });
    if (!G.noRender) FX('hit', e, { el, type: w.type, ranged: o.ranged, crit, dead: e.dead, heavy: o.heavy, rain: o.rain, dir: o.dir || (e.x >= P.x ? 1 : -1) });
    if (G.moves) G.moves.onHit(e, d, el, o); // luật riêng của hệ khi đòn trúng (js/moves.js)
    if (G.mobOnHit) G.mobOnHit(e, d, o); // quái gai phản đòn, giáp vỡ (js/mobs.js)
    const T = G.WTYPES[w.type];
    if (T.stagger && !e.isBoss && !e.dead) e.st.stun = Math.max(e.st.stun, T.stagger);
    if (o.stun && !e.dead) e.st.stun = Math.max(e.st.stun, e.isBoss ? o.stun * 0.4 : o.stun);
    if (el && !e.dead) {
      const stage = G.wStage(w);
      const coat = P.coats[w.id] && P.coats[w.id].t > 0;
      let chance = coat ? 1 : G.PROC[stage];
      if (w.power === 'proc') chance += 0.25;
      if (P.firstHit && P.swapProc) chance = 1;
      if (G.rnd() < chance) G.applyStatus(e, el, d, 1);
    }
    P.firstHit = false;
  }
  function hitProps(x0, x1, y, depth) {
    for (const pr of W.props) {
      if (pr.env && !pr.used && pr.x >= x0 && pr.x <= x1 && Math.abs(pr.y - y) <= depth) G.triggerProp(pr);
    }
  }
  G.triggerProp = function (pr) {
    const P = W.P, w = curW(P);
    pr.used = true;
    pr.dead = true;
    const el = pr.type === 'brazier' ? 'fire' : pr.type === 'mushroom' ? 'poison' : 'ice';
    const src = G.pDamage(P, w);
    FX('propBlast', pr, el);
    G.sfx('boom', 1.3);
    for (const t of G.targets()) {
      if (Math.hypot(t.x - pr.x, (t.y - pr.y) / G.ZK) < 52) {
        G.damage(t, src * 0.8, { el, src: 'prop' });
        G.applyStatus(t, el, src, el === 'fire' ? 1 : 3);
      }
    }
  };
  function meleeBox(P, reach, depth, mult, o) {
    let hit = 0;
    const f = P.face;
    for (const e of G.targets()) {
      const dx = (e.x - P.x) * f;
      if (dx > -8 - e.r * 0.5 && dx < reach + e.r && Math.abs(e.y - P.y) <= depth / 2 + e.hr) {
        playerHit(e, mult, o);
        hit++;
      }
    }
    hitProps(Math.min(P.x, P.x + f * reach) - 4, Math.max(P.x, P.x + f * reach) + 4, P.y, depth / 2 + 6);
    return hit;
  }
  function nearest(P, maxD, maxDy, frontOnly) {
    let best = null, bd = 1e9;
    for (const e of G.targets()) {
      const dx = e.x - P.x, dy = e.y - P.y;
      if (Math.abs(dy) > maxDy + e.hr) continue;
      if (frontOnly && dx * P.face < -6) continue;
      const d = Math.abs(dx) - e.r + Math.abs(dy) * 0.5;
      if (d < maxD && d < bd) { bd = d; best = e; }
    }
    return best;
  }
  G.nearest = nearest;
  // Đoạn tên bay (px,py)->(x,y) có cắt vùng trúng hình bầu dục của quái e không. Trả về vị trí cắt dọc đoạn (0..1), không cắt thì -1.
  function segHit(o, e) {
    const B = G.MOVES && G.MOVES.bow, kx = 1 / (e.r + (B ? B.hitX : 4)), ky = 1 / (e.hr + (B ? B.hitY : 7));
    const ax = (o.px - e.x) * kx, ay = (o.py - e.y) * ky, dx = (o.x - o.px) * kx, dy = (o.y - o.py) * ky;
    const L = dx * dx + dy * dy;
    const t = L > 0 ? G.clamp(-(ax * dx + ay * dy) / L, 0, 1) : 0;
    const qx = ax + dx * t, qy = ay + dy * t;
    return qx * qx + qy * qy <= 1 ? t : -1;
  }

  function startAttack(P) {
    const w = curW(P), T = G.WTYPES[w.type];
    const reach = T.ranged ? 320 : T.reach * (G.wHas(w, 'reach') ? 1.15 : 1);
    const tgt = nearest(P, reach + 34, T.ranged ? 44 : 22, false);
    if (tgt && Math.abs(tgt.x - P.x) > 3) P.face = tgt.x > P.x ? 1 : -1;
    P.comboI = G.time - P.lastAtk < T.cd + 0.35 ? (P.comboI + 1) % 3 : 0;
    P.lastAtk = G.time;
    P.atkDur = T.cd; P.atkT = T.cd; P.cdT = T.cd; P.hitDone = false;
    G.sfx('swing', w.type === 'hammer' ? 0.6 : 1);
  }
  function doHit(P) {
    const w = curW(P), T = G.WTYPES[w.type];
    P.hitDone = true;
    const el = G.activeEl(P, w);
    const col = el ? G.EL[el].col : '#f1ead9';
    const third = P.comboI === 2;
    let hits = 0;
    if (T.ranged) {
      const tgt = nearest(P, 330, 44, true);
      let vy = 0;
      if (tgt) vy = G.clamp(((tgt.y - P.y) / Math.max(20, Math.abs(tgt.x - P.x))) * 270, -90, 90);
      W.projs.push({ team: 'player', kind: 'arrow', x: P.x + P.face * 8, y: P.y, vx: P.face * 270, vy, t: 1.3, w, mult: third ? 1.6 : 1, pierce: third ? 3 : 0, big: third, col, seen: [] });
    } else {
      const reach = T.reach * (G.wHas(w, 'reach') ? 1.15 : 1);
      hits = meleeBox(P, reach, T.depth, w.type === 'sword' && third ? 1.5 : 1, { w, heavy: third });
      if (!G.noRender) FX('swing', P, { type: w.type, combo: P.comboI, reach, el, stage: G.wStage(w) });
      if (w.type === 'hammer') W.shake = Math.max(W.shake, 0.08);
    }
    if (hits > 0) {
      P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (G.wHas(w, 'mana') ? 1 : 0));
      G.sfx('hit');
    }
  }
  // Các hàm ra đòn dùng chung cho js/moves.js (lối đánh riêng của từng vũ khí).
  G.cb = { playerHit, meleeBox, hitProps, nearest, startAttack, doHit };
  function special(P) {
    const w = curW(P);
    P.mana -= P.specCost;
    P.specT = 0.35;
    P.specCd = 0.8;
    const el = G.activeEl(P, w);
    G.sfx('boom', 1.8);
    if (w.type === 'sword' || w.type === 'spear') {
      // Đường lao dài theo bề ngang phòng (G.MOVES.dash): phòng thường ngắn hơn phòng trùm, để không lao hết nửa phòng rồi đập tường.
      const dc = G.MOVES && G.MOVES.dash && G.MOVES.dash[w.type];
      const len = dc ? G.clamp((W.x1 - W.x0) * dc.frac, dc.min, dc.max) : w.type === 'sword' ? 92 : 112;
      P.dashT = 0.2; P.dashV = (len / 0.2) * P.face; P.dashHit = []; P.inv = Math.max(P.inv, 0.25);
      P.dashMult = w.type === 'sword' ? 2.2 : 2.0;
      P.dashStun = w.type === 'spear' ? 0.5 : 0;
      P.atkT = 0.2; P.atkDur = 0.2; P.cdT = 0.3; P.hitDone = true;
      FX('dash', P, w.type, el);
    } else if (w.type === 'hammer') {
      W.shake = 0.3;
      FX('slam', P, el);
      for (const e of G.targets()) if (Math.hypot(e.x - P.x, (e.y - P.y) / G.ZK) < 58 + e.r) playerHit(e, 2.4, { w, stun: 0.8, heavy: true });
      hitProps(P.x - 58, P.x + 58, P.y, 58 * G.ZK);
      W.zones.push({ shape: 'circle', x: P.x, y: P.y, r: 58, t: 0, life: 0.15, team: 'fx' });
    } else {
      // Sửa góp ý 1: mưa tên đặt tâm vào quái (hoặc cụm quái) gần nhất theo mọi hướng, đón đầu nhẹ quái đang chạy.
      // Không có quái thì mưa rơi phía trước theo hướng đang đi hoặc đang nhìn, luôn nằm trong sàn phòng.
      const sp = G.moves ? G.moves.bowSpot(P, 330, 40, 0.25) : null;
      let x, y;
      if (sp) { x = sp.x; y = sp.y; }
      else {
        const ux = P.moving && P.ldx != null ? P.ldx : P.face, uy = P.moving && P.ldy != null ? P.ldy : 0, L = Math.min(110, (W.x1 - W.x0) * 0.4);
        x = P.x + ux * L; y = P.y + uy * L * 0.6;
      }
      x = G.clamp(x, W.x0 + 20, W.x1 - 20); y = G.clamp(y, W.y0, W.y1); // tâm mưa luôn trong sàn (vùng mưa rộng 40 vẫn phủ quái sát tường)
      W.zones.push({ shape: 'circle', x, y, r: 40, t: 0, pool: true, team: 'player', rain: true, life: 0.95, tick: 0, w, el });
    }
    if (G.moves) G.moves.special(P, w); // phần riêng theo hệ của đòn đặc biệt
  }
  function heroSkill(P) {
    const w = curW(P);
    P.mana -= 40;
    P.castT = 0.4;
    P.skillCd = 5;
    G.sfx('evolve', 1.4);
    if (P.key === 'smith') {
      P.coats[w.id] = { el: 'fire', t: 6 };
      FX('nung', P);
    } else if (P.key === 'hunter') {
      const traps = W.props.filter((p) => p.type === 'trap' && !p.dead);
      if (traps.length >= 2) traps[0].dead = true;
      // Sửa góp ý 1: đang cầm cung thì bẫy ném thẳng vào chỗ quái gần nhất (trong tầm 150, đón đầu nhẹ); không có quái thì đặt trước mặt.
      const sp = w.type === 'bow' && G.moves ? G.moves.bowSpot(P, 150, 14, 0.3) : null;
      const tx = G.clamp(sp ? sp.x : P.x + P.face * 26, W.x0, W.x1), ty = G.clamp(sp ? sp.y : P.y, W.y0, W.y1);
      W.props.push({ type: 'trap', x: tx, y: ty, el: G.activeEl(P, w), t: 15, w });
      FX('trapPlace', tx, ty, G.activeEl(P, w));
    } else if (P.key === 'healer') {
      W.zones.push({ shape: 'circle', x: G.clamp(P.x + P.face * 22, W.x0, W.x1), y: P.y, r: 42, t: 0, pool: true, team: 'player', el: 'poison', heal: true, life: 5, tick: 0, src: G.pDamage(P, w) });
      FX('bottle', P, W.zones[W.zones.length - 1]);
    } else {
      P.gongT = 3;
      W.shake = 0.2;
      FX('gong', P);
      for (const e of G.targets()) {
        const d = Math.hypot(e.x - P.x, (e.y - P.y) / G.ZK);
        if (d < 60 + e.r) {
          playerHit(e, 0.8, { w, stun: 0.4 });
          if (!e.isBoss) { e.x += (e.x >= P.x ? 1 : -1) * 40; }
        }
      }
    }
  }
  G.addCoat = function (el, t) {
    const P = W.P;
    for (const w of P.weapons) P.coats[w.id] = { el, t };
  };

  G.hurtPlayer = function (amt, el, src, melee) {
    const P = W.P;
    if (P.inv > 0 || P.dead || W.over || W.safe) return false; // W.safe: đã hạ trùm, đang đi dạo chờ vào cổng
    const raw = amt;
    amt *= 1 - Math.min(0.75, P.dr);
    if (P.gongT > 0) amt *= 0.4;
    P.hp -= amt;
    if (src && src.trait === 'hut' && !src.dead) src.hp = Math.min(src.maxhp, src.hp + amt * 1.5); // tinh anh hút máu
    if (W.hpFloor && P.hp < 1) P.hp = 1;
    P.inv = 0.55; P.hurtT = 0.2;
    W.shake = Math.max(W.shake, 0.18);
    G.sfx('hurt');
    if (!G.noRender) FX('hurt', P, amt, el, P.gongT > 0);
    if (P.key === 'wrestler' && melee && src && !src.dead) G.damage(src, raw * 0.5, { src: 'reflect', fromPlayer: false });
    if (el) {
      const k = 1 - P.resist[el];
      if (el === 'fire') { P.st.fire = 3 * k; P.dot = raw * 0.05; } // tổng cộng thêm khoảng 30% nếu cháy đủ 3 giây
      if (el === 'poison') { P.st.poison = 4 * k; P.dot = raw * 0.035; }
      if (el === 'ice') P.st.ice = 2.5 * k;
    }
    if (P.hp <= 0) { P.dead = true; W.over = 'dead'; }
    return true;
  };

  G.updatePlayer = function (P, inp, dt) {
    P.t += dt;
    for (const k of ['atkT', 'cdT', 'dodgeCd', 'inv', 'hurtT', 'skillCd', 'specCd', 'swapCd', 'gongT', 'castT', 'specT']) if (P[k] > 0) P[k] -= dt;
    if (P.dead) P.deadT += dt;
    for (const id in P.coats) if (P.coats[id].t > 0) P.coats[id].t -= dt;
    // hiệu ứng trên người chơi
    P.dotT -= dt;
    for (const k of ['fire', 'poison', 'ice']) if (P.st[k] > 0) P.st[k] -= dt;
    if (P.dotT <= 0) {
      P.dotT = 0.5;
      if (!P.dead && (P.st.fire > 0 || P.st.poison > 0)) {
        P.hp -= P.dot;
        if (P.hp < 1) P.hp = 1;
      }
    }
    if (W.over) { P.moving = false; return; }
    if (P.frozenT > 0) { P.frozenT -= dt; P.moving = false; P.atkT = 0; return; } // bị nổ băng: đóng băng ngắn
    const w = curW(P);
    const MV = G.moves; // lối đánh riêng của từng vũ khí; thiếu moves.js thì đánh kiểu cũ
    if (MV) MV.input(P, inp, dt);
    const slow = P.st.ice > 0 ? 0.65 : 1;
    let mx = inp.mx, my = inp.my;
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    P.moving = false;

    if (P.dashT > 0) {
      const dd = Math.min(dt, P.dashT); // khung cuối chỉ đi nốt phần còn lại, để quãng lao đúng bằng con số đã định
      P.dashT -= dt;
      const nx = G.clamp(P.x + P.dashV * dd, W.x0, W.px1 != null ? W.px1 : W.x1);
      for (const e of G.targets()) {
        if (P.dashHit.includes(e)) continue;
        if (e.x >= Math.min(P.x, nx) - e.r - 6 && e.x <= Math.max(P.x, nx) + e.r + 6 && Math.abs(e.y - P.y) <= 12 + e.hr) {
          P.dashHit.push(e);
          playerHit(e, P.dashMult, P.dashOpt ? Object.assign({ w }, P.dashOpt) : { w, stun: P.dashStun });
        }
      }
      hitProps(Math.min(P.x, nx) - 4, Math.max(P.x, nx) + 4, P.y, 14);
      // Chạm tường thì đòn lao dừng ngay tại đó (không chạy tại chỗ sát tường, không kẹt ở cửa): người chơi điều khiển lại được liền.
      if (nx !== P.x + P.dashV * dd && P.dashT > 0) { P.dashT = 0; P.atkT = Math.min(P.atkT, 0.05); P.cdT = Math.min(P.cdT, 0.12); }
      P.x = nx;
      return;
    }
    if (P.dodgeT > 0) {
      P.dodgeT -= dt;
      const ox = P.x;
      // Phòng vuông nhìn từ trên: lộn dọc đi xa gần bằng lộn ngang (cùng tỉ lệ 0,75 như lúc đi bộ), tám hướng đều đúng góc.
      P.x += P.ddx * G.DODGE.vx * dt;
      P.y += P.ddy * G.DODGE.vx * G.DODGE.ky * dt;
      if (P.charm === 'c_mist' || P.set === 'ngu') {
        for (const e of G.targets()) {
          if (!e.misted && e.x >= Math.min(ox, P.x) - e.r && e.x <= Math.max(ox, P.x) + e.r && Math.abs(e.y - P.y) < 14 + e.hr) {
            e.misted = true;
            G.applyStatus(e, 'ice', G.pDamage(P, w), 1);
          }
        }
      }
      if (P.dodgeT <= 0) {
        for (const e of W.ents) e.misted = false;
        if (W.boss) W.boss.misted = false;
        if (P.set === 'ho') P.boost = true;
      }
    } else {
      const sp = P.speed * slow * (P.atkT > 0 ? 0.4 : 1) * (MV ? MV.speed(P) : 1);
      if (ml > 0.12) {
        P.x += mx * sp * dt;
        P.y += my * sp * 0.75 * dt;
        P.moving = true;
        if (P.atkT <= 0 && Math.abs(mx) > 0.2) P.face = mx > 0 ? 1 : -1;
        { const l1 = Math.hypot(mx, my); P.ldx = mx / l1; P.ldy = my / l1; } // nhớ hướng di chuyển gần nhất, để Né khi không đẩy cần
      }
      if (inp.dodgeP && P.dodgeCd <= 0) {
        P.dodgeT = 0.27; P.dodgeCd = 1 * P.dodgeCdMax; P.inv = Math.max(P.inv, 0.32);
        P.atkT = 0;
        // Không đẩy cần thì lộn theo hướng di chuyển gần nhất; chưa đi bước nào thì mới theo hướng mặt.
        // Hướng lộn luôn dài bằng 1: đẩy cần nhẹ hay mạnh thì quãng lộn vẫn như nhau.
        if (ml > 0.12) { const l0 = Math.hypot(mx, my); P.ddx = mx / l0; P.ddy = my / l0; } else if (P.ldx != null) { P.ddx = P.ldx; P.ddy = P.ldy; } else { P.ddx = P.face; P.ddy = 0; }
        if (Math.abs(P.ddx) > 0.2) P.face = P.ddx > 0 ? 1 : -1;
        W.stats.dodges++;
        G.sfx('swing', 0.7);
        FX('dodge', P);
      } else if (inp.specialP && P.mana >= P.specCost && P.specCd <= 0) {
        special(P);
      } else if (inp.skillP && P.mana >= 40 && P.skillCd <= 0) {
        heroSkill(P);
      } else if (MV) {
        MV.act(P, inp, dt);
      } else if ((inp.atk || inp.atkP) && P.cdT <= 0) {
        startAttack(P);
      }
      if (inp.swapP && P.weapons.length > 1 && P.swapCd <= 0) {
        P.cur = 1 - P.cur;
        P.swapCd = 1.5;
        P.firstHit = true;
        P.comboI = -1;
        G.sfx('pick');
        if (!G.noRender) FX('swap', P, G.activeEl(P, curW(P)));
      }
      if (inp.potionP && P.potions > 0 && P.hp < P.maxhp && !W.noPotion) {
        P.potions--;
        P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.3);
        W.usedPotion = true;
        FX('potion', P);
        G.sfx('pick', 1.4);
      }
    }
    if (P.atkT > 0 && !P.hitDone && P.atkT <= P.atkDur * 0.55) { if (MV) MV.hit(P); else doHit(P); }
    P.x = G.clamp(P.x, W.x0, W.px1 != null ? W.px1 : W.x1);
    P.y = G.clamp(P.y, W.y0, W.y1);
    if (P.set === 'moc') {
      P.stillT = P.moving || P.atkT > 0 ? 0 : P.stillT + dt;
      if (P.stillT > 2) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.02 * dt);
    }
  };

  // ---------- quái ----------
  function strike(e, reach, depth, mult) {
    const P = W.P;
    const dx = (P.x - e.x) * e.face;
    if (dx > -6 && dx < reach && Math.abs(P.y - e.y) < depth) G.hurtPlayer(e.dmg * (mult || 1), e.el, e, true);
  }
  function updateEnemy(e, dt) {
    const P = W.P;
    e.t += dt;
    if (e.flash > 0) e.flash -= dt;
    tickStatus(e, dt);
    if (e.dead) return;
    if (G.mob && e.art) { G.mob.update(e, dt); return; } // quái mới (js/mobs.js)
    e.moving = false;
    if (e.st.frozen > 0 || e.st.stun > 0) { e.wind = 0; return; }
    const sp = e.speed * slowOf(e) * (e.st.root > 0 ? 0 : 1);
    const dx = P.x - e.x, dy = P.y - e.y, ad = Math.abs(dx);
    e.cd -= dt;
    if (e.wind > 0) {
      e.wind -= dt;
      if (e.wind <= 0) {
        if (e.role === 'archer') {
          const d = Math.max(30, Math.hypot(dx, dy));
          W.projs.push({ team: 'enemy', kind: 'fruit', x: e.x + e.face * 6, y: e.y, vx: (dx / d) * 135, vy: (dy / d) * 135, t: 3, dmg: e.dmg, el: e.el, col: e.el ? G.EL[e.el].col : null });
        } else if (e.role === 'nimble') {
          e.lunge = 0.18; e.lv = e.face * 230;
          FX('lunge', e);
        } else {
          strike(e, 30 + e.r, 12 + e.hr * 0.5, 1);
          FX('enemySwing', e);
        }
        e.cd = e.role === 'archer' ? 2.3 : e.role === 'swarm' ? 1.3 : 1.4;
      }
      return;
    }
    if (e.lunge > 0) {
      e.lunge -= dt;
      e.x += e.lv * dt;
      if (!e.lhit && Math.abs(P.x - e.x) < 12 && Math.abs(P.y - e.y) < 11) { e.lhit = true; G.hurtPlayer(e.dmg, e.el, e, true); }
      if (e.lunge <= 0) { e.lhit = false; e.retreat = 0.7; }
      return;
    }
    e.face = dx >= 0 ? 1 : -1;
    let tx = P.x, ty = P.y;
    if (e.role === 'archer') {
      const want = Math.min(150, (W.x1 - W.x0) * 0.45); // phòng hẹp thì đứng gần hơn
      tx = P.x - e.face * want;
      tx = G.clamp(tx, W.x0 + 6, W.x1 - 6);
      if (Math.abs(tx - e.x) < 14 && Math.abs(dy) < 60 && e.cd <= 0 && e.x > W.x0 && e.x < W.x1) { e.wind = 0.5; G.sfx('warn', 1.3); return; }
    } else if (e.role === 'nimble') {
      if (e.retreat > 0) {
        e.retreat -= dt;
        tx = e.x - e.face * 60; ty = e.y + (e.t % 2 < 1 ? 30 : -30);
      } else {
        const side = P.face; // vòng ra sau lưng người chơi
        tx = P.x - side * 46;
        if (Math.abs(dy) < 9 && ad < 64 && ad > 20 && e.cd <= 0) { e.wind = 0.4; return; }
      }
    } else {
      if (e.role === 'elite') {
        e.slamCd -= dt;
        if (e.slamCd <= 0 && ad < 140) {
          e.slamCd = 5;
          G.zoneCircle(P.x, P.y, 30, 0.85, e.dmg * 1.3, e.el);
          G.sfx('warn');
          e.wind = 0.5; e.cd = 1.2;
          return;
        }
      }
      tx = P.x - e.face * (12 + e.r);
      // Vào thật gần mới vung đòn, và đòn với xa hơn tầm bắt đầu 14 điểm: lùi chậm thì vẫn trúng, phải bước hẳn ra hoặc lăn né.
      if (ad < 16 + e.r && Math.abs(dy) < 10 && e.cd <= 0) {
        e.wind = e.role === 'swarm' ? 0.3 : e.role === 'shield' ? 0.55 : 0.42;
        return;
      }
    }
    const mdx = tx - e.x, mdy = ty - e.y, md = Math.hypot(mdx, mdy);
    if (md > 2) {
      e.x += (mdx / md) * sp * dt;
      e.y += (mdy / md) * sp * 0.75 * dt;
      e.moving = true;
    }
    e.y = G.clamp(e.y, W.y0, W.y1);
  }
  function separate() {
    const a = W.ents;
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) {
        const A1 = a[i], B = a[j];
        if (A1.dead || B.dead) continue;
        const dx = B.x - A1.x, dy = (B.y - A1.y) * 1.6;
        const d = Math.hypot(dx, dy), min = (A1.r + B.r) * 0.9;
        if (d < min && d > 0.01) {
          const k = ((min - d) / d) * 0.5;
          A1.x -= dx * k; B.x += dx * k;
          A1.y -= (dy * k) / 1.6; B.y += (dy * k) / 1.6;
        }
      }
    }
  }

  // ---------- cập nhật mỗi khung ----------
  G.updateWorld = function (dt, inp) {
    const P = W.P;
    // Khựng hình khi đòn trúng: chỉ có khi đang vẽ, nút bấm trong lúc khựng được giữ lại cho khung sau.
    if (!G.noRender && G.fx && G.fx.frozen && G.fx.frozen(dt, inp)) return;
    G.updatePlayer(P, inp, dt);
    for (const e of W.ents) if (!e.dead) updateEnemy(e, dt);
    separate();
    // Quái đã vào phòng thì không được lùi hay bị đẩy ra ngoài mép phòng (ngoài đó người chơi không với tới).
    for (const e of W.ents) {
      if (e.x >= W.x0 && e.x <= W.x1) e.inside = true;
      else if (e.inside) e.x = G.clamp(e.x, W.x0, W.x1);
    }
    if (W.boss && !W.boss.dead) G.updateBoss(W.boss, dt);
    if (G.mob) G.mob.tick(dt); // chuỗi đòn hẹn giờ của quái mới
    // đạn
    for (const o of W.projs) {
      o.t -= dt;
      if (o.homing) {
        const dx = P.x - o.x, dy = P.y - o.y, d = Math.max(1, Math.hypot(dx, dy));
        o.vx += ((dx / d) * o.homing - o.vx) * dt * 2.5;
        o.vy += ((dy / d) * o.homing - o.vy) * dt * 2.5;
      }
      if (o.fresh) o.fresh = false; else { o.px = o.x; o.py = o.y; } // khung đầu của tên: giữ điểm đầu đoạn ở giữa người bắn
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.team === 'player') {
        // Sửa góp ý 1: kiểm tra trúng theo cả đoạn tên vừa bay trong khung (không chỉ điểm cuối), nên tên nhanh không "nhảy qua"
        // quái; khung đầu tiên đoạn này bắt đầu từ giữa người bắn (px, py), nên quái đứng sát người vẫn trúng.
        // Vùng trúng là hình bầu dục rộng hơn thân quái một chút (C.hitX, C.hitY), cùng hệ trục với chỗ đứng của quái.
        const zf = G.MOVES && G.MOVES.bow ? G.MOVES.bow.zFly : 11;
        if (o.kind === 'arrow' && o.z > zf) o.z = Math.max(zf, o.z - dt * 45); // rời dây cung ở trên cao rồi hạ dần về tầm bay
        const hits = [];
        for (const e of G.targets()) {
          if (o.seen.includes(e)) continue;
          const t = segHit(o, e);
          if (t >= 0) hits.push([t, e]);
        }
        hits.sort((a, b) => a[0] - b[0]);
        for (const hx of hits) {
          const e = hx[1];
          o.seen.push(e);
          playerHit(e, o.mult, { w: o.w, ranged: true, heavy: o.big, dir: o.vx < 0 ? -1 : 1 });
          if (G.moves) G.moves.arrowHit(o, e);
          P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (G.wHas(o.w, 'mana') ? 1 : 0));
          G.sfx('hit', 1.3);
          if (o.pierce > 0) { o.pierce--; if (o.pierceMult) o.mult *= o.pierceMult; } else { o.t = 0; break; } // tên thường xuyên qua thì yếu đi (pierceMult)
        }
        // đồ vật trên sàn (lò lửa, nấm, đá băng): tên bay qua thì kích nổ nhưng không bị chặn lại
        for (const pr of W.props) if (pr.env && !pr.used && Math.abs(pr.x - o.x) < 8 && Math.abs(pr.y - o.y) < 10) G.triggerProp(pr);
      } else if (Math.abs(P.x - o.x) < 7 && Math.abs(P.y - o.y) < 8) {
        if (G.hurtPlayer(o.dmg, o.el, o.src || null, false) || P.inv <= 0) { o.t = 0; if (o.onHit) o.onHit(o); }
      }
      if (o.x < -30 || o.x > W.w + 30) o.t = 0;
    }
    W.projs = W.projs.filter((o) => o.t > 0);
    // vùng nguy hiểm và vũng
    for (const z of W.zones) {
      if (z.wall && G.mobWall) { G.mobWall(z, dt, P); continue; } // tường nước chạy (js/mobs.js)
      if (z.wave) {
        if (z.wait > 0) { z.wait -= dt; continue; } // sóng đứng yên báo trước rồi mới tràn tới
        z.x += z.vx * dt;
        if (!z.hit && Math.abs(P.x - z.x) < 6 && (P.y < z.g0 || P.y > z.g1)) { if (G.hurtPlayer(z.dmg, z.el, null, false)) z.hit = true; }
        if (z.x < -20) z.dead = true;
        continue;
      }
      if (z.src && z.src.dead && z.cancel) { z.dead = true; continue; } // quái chết hoặc bị choáng trước khi ra đòn: huỷ vùng báo
      if (z.wait > 0) { z.wait -= dt; continue; } // vùng chưa bắt đầu báo (chuỗi đòn nối nhau)
      if (z.t > 0) {
        z.t -= dt;
        if (z.t <= 0) {
          if (z.team !== 'player' && z.team !== 'fx' && z.dmg && G.inZone(z, P)) { if (G.hurtPlayer(z.dmg, z.el, z.src || null, !!z.melee) && z.onHit) z.onHit(z); }
          if (z.onFire) z.onFire(z);
          if (z.then) { z.pool = true; z.life = z.then; z.tick = 0.4; }
          FX('zoneFire', z);
          W.shake = Math.max(W.shake, 0.06);
        }
        continue;
      }
      z.life -= dt;
      if (z.pool) {
        z.tick -= dt;
        if (z.tick <= 0) {
          if (z.team === 'player') {
            if (z.rain) {
              z.tick = 0.15;
              for (const e of G.targets()) if (Math.hypot(e.x - z.x, (e.y - z.y) * 1.6) < z.r + e.r) playerHit(e, G.MOVES && G.MOVES.bow.rain ? G.MOVES.bow.rain.mult : 0.5, { w: z.w, ranged: true, rain: true });
              const rx = z.x + G.rr(-30, 30), ry = z.y + G.rr(-12, 12); // vẫn rút hai số ngẫu nhiên như trước
              FX('rainDrop', rx, ry, z.el);
            } else {
              z.tick = z.every || 1;
              for (const e of G.targets()) if (Math.hypot(e.x - z.x, (e.y - z.y) * 1.6) < z.r + e.r) G.applyStatus(e, z.el, z.src, 1);
            }
          } else {
            z.tick = 0.5;
            if (G.inZone(z, P)) G.hurtPlayer(z.dmg * 0.3, z.el, null, false);
          }
        }
        if (z.heal && G.inZone(z, P)) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.03 * dt);
      }
      if (z.life <= 0) z.dead = true;
    }
    W.zones = W.zones.filter((z) => !z.dead);
    if (G.moves) G.moves.update(W, dt); // sóng chấn động, đòn hẹn giờ của js/moves.js
    // bẫy của Thợ Săn
    for (const pr of W.props) {
      if (pr.type !== 'trap' || pr.dead) continue;
      pr.t -= dt;
      if (pr.t <= 0) { pr.dead = true; continue; }
      for (const e of G.targets()) {
        if (Math.abs(e.x - pr.x) < 10 + e.r * 0.5 && Math.abs(e.y - pr.y) < 9 + e.hr * 0.5) {
          pr.dead = true;
          e.st.root = e.isBoss ? 0.8 : 2;
          const src = G.pDamage(P, pr.w);
          if (pr.el) G.applyStatus(e, pr.el, src, pr.el === 'fire' ? 1 : 2);
          G.damage(e, src * 1.5, { el: pr.el, src: 'trap', w: pr.w });
          G.sfx('hit', 0.6);
          FX('trapSnap', pr, e);
          break;
        }
      }
    }
    W.props = W.props.filter((p) => !p.dead);
    W.ents = W.ents.filter((e) => !e.dead);
    // hạt, chữ, vệt chém
    for (const o of W.parts) { o.t -= dt; o.x += o.vx * dt; o.y += o.vy * dt; o.vy += 90 * dt; }
    W.parts = W.parts.filter((o) => o.t > 0);
    for (const o of W.texts) { o.t -= dt; o.y -= 22 * dt; }
    W.texts = W.texts.filter((o) => o.t > 0);
    for (const o of W.slashes) o.t -= dt;
    W.slashes = W.slashes.filter((o) => o.t > 0);
    if (W.shake > 0) W.shake -= dt;
    if (W.banner) { W.banner.t -= dt; if (W.banner.t <= 0) W.banner = null; }
    // Trong phòng trùm cố định, đặt người chơi lệch trái để thấy rõ phía trùm.
    const lead = W.boss && !W.boss.dead && W.boss.kind !== 'ho' ? 150 : G.W / 2;
    const camTo = G.clamp(P.x - lead, 0, Math.max(0, W.w - G.W));
    W.cam += (camTo - W.cam) * Math.min(1, dt * 6);
    if (!G.noRender && G.fx && G.fx.update) G.fx.update(dt);
  };

  // ---------- vẽ ----------
  // Tham số vẽ hero. fx.js cũng dùng để vẽ bóng mờ ở vị trí cũ.
  G.heroArgs = function (P) {
    const w = curW(P);
    return {
      p: P, // hero_art.js đọc thêm trạng thái hoạt ảnh từ đây (chỉ đọc)
      x: P.x, y: P.y, face: P.face, key: P.key, move: P.moving, t: P.t,
      atk: P.atkT > 0 ? 1 - P.atkT / P.atkDur : -1, dodge: P.dodgeT > 0 ? 1 - P.dodgeT / 0.27 : -1,
      flash: P.hurtT > 0, alpha: P.inv > 0 && P.dodgeT <= 0 && Math.floor(G.time * 20) % 2 ? 0.5 : null,
      weapon: Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }),
      helm: P.helm, armor: P.armor, gong: P.gongT > 0,
      roundShadow: !!W.geo, // phòng vuông nhìn từ trên: bóng đổ tròn
    };
  };
  // Thứ tự lớp: nền, vùng và vũng, hiệu ứng sát đất, nhân vật (kèm hiệu ứng bám theo), đạn, hiệu ứng phía trên, rồi lớp giao diện.
  G.drawWorld = function (reg) {
    const c = G.wx, A = G.art, P = W.P;
    const F = G.noRender ? null : G.fx;
    const cam = Math.round(W.cam);
    let sx = 0, sy = 0;
    if (F && F.shakeOffset) { const o = F.shakeOffset(); sx = o.x; sy = o.y; }
    else if (W.shake > 0) { sx = Math.round(Math.random() * 4 - 2); sy = Math.round(Math.random() * 2 - 1); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    A.bg(c, reg, W.seed, cam, W.w, W.shrink);
    c.setTransform(1, 0, 0, 1, -cam + sx, sy);
    for (const z of W.zones) {
      if (F && F.zone && F.zone(c, z, W)) continue;
      if (z.wave) {
        // lúc còn báo trước thì sóng mờ và nhấp nháy, khe hở nhìn thấy ngay
        const wc = z.wait > 0 ? 'rgba(160,220,250,' + (Math.floor(G.time * 10) % 2 ? 0.3 : 0.5) + ')' : 'rgba(160,220,250,0.85)';
        A.p(c, Math.round(z.x) - 3, W.y0 - 6, 6, z.g0 - W.y0 + 6, wc);
        A.p(c, Math.round(z.x) - 3, z.g1, 6, G.H - z.g1, wc);
      } else if (z.team === 'fx') A.ellipse(c, z.x, z.y, z.r, z.r * (G.ZK || 0.6), 'rgba(255,240,200,0.35)');
      else A.zone(c, z);
    }
    if (F && F.drawGround) F.drawGround(c);
    const ent = F && F.entity, rec = F && F.recoil;
    const list = [];
    for (const e of W.ents) {
      list.push({ y: e.y, f: () => {
        const k = rec ? rec(e) : 0; // giật lùi khi trúng đòn: chỉ dời hình
        if (k) c.translate(k, 0);
        if (e.illusion) A.boss(c, e); else A.enemy(c, e);
        if (k) c.translate(-k, 0);
        if (ent) ent(c, e);
      } });
    }
    for (const pr of W.props) list.push({ y: pr.y - (pr.type === 'door' || pr.type === 'portal' ? 200 : 0), f: () => A.prop(c, pr) }); // cổng dịch chuyển nằm sát sàn: vẽ dưới mọi thứ
    if (W.boss && !W.boss.dead) {
      const b = W.boss;
      list.push({ y: b.y + (b.kind === 'moc' ? -30 : 0), f: () => {
        const k = rec ? rec(b) : 0;
        if (k) c.translate(k, 0);
        if (b.kind === 'mini') A.enemy(c, b); else A.boss(c, b);
        if (k) c.translate(-k, 0);
        if (!b.hidden) A.status(c, b, Math.round(b.x), Math.round(b.y - b.h - 6));
        if (ent) ent(c, b);
      } });
    }
    list.push({ y: P.y, f: () => { A.hero(c, G.heroArgs(P)); if (ent) ent(c, P); } });
    if (F && F.sorted) F.sorted(list, c);
    list.sort((a, b) => a.y - b.y);
    for (const o of list) o.f();
    if (G.mobHeroOver) G.mobHeroOver(c, P); // em bé đứng sau quái to: vẽ thêm bóng mờ của bé lên trên để không bị che mất
    if (!ent) {
      if (P.st.fire > 0) { A.p(c, Math.round(P.x) - 3, Math.round(P.y) - 38, 2, 3, '#ff7a2a'); A.p(c, Math.round(P.x) + 1, Math.round(P.y) - 40, 2, 4, '#ffd23f'); }
      if (P.st.poison > 0) A.p(c, Math.round(P.x) - 2, Math.round(P.y) - 38, 3, 3, '#6fcf3a');
      if (P.st.ice > 0) A.p(c, Math.round(P.x) - 5, Math.round(P.y) - 2, 10, 2, '#7fd4ff');
    }
    const pj = F && F.proj;
    for (const o of W.projs) { if (pj) pj(c, o); A.proj(c, o); }
    for (const s of W.slashes) A.slash(c, s);
    for (const o of W.parts) A.p(c, Math.round(o.x), Math.round(o.y), o.s, o.s, o.col);
    if (F && F.drawOver) F.drawOver(c);
    c.setTransform(1, 0, 0, 1, 0, 0);
    // chữ sát thương vẽ ở lớp giao diện cho nét
    for (const o of W.texts) G.ui.text(o.s, o.x - cam, o.y, { size: o.size, align: 'center', color: o.col, bold: true });
    if (F && F.drawUI) F.drawUI(cam);
  };
})();
