'use strict';

// ============================================================
//  LOGIC GAME: đợt quái theo dòng sông, tướng tấn công, nâng cấp
//  bằng vàng, kỹ năng, hào quang, Nước Dâng & Mọc Núi, boss,
//  Lò đúc đồng, túi đồ (cường hóa, thăng phẩm, đổi vàng)
// ============================================================

let nextId = 1;

// --- Dòng sông (đường quái đi) lấy từ bản thiết kế: lấy mẫu đường cong SVG
const RIVER_D = 'M -20 210 C 100 210 150 120 280 128 S 450 240 580 214 S 740 140 880 160';
function sampleSvgPath(d, steps = 26) {
  const tok = d.match(/[MCS]|-?\d*\.?\d+/g);
  const pts = [];
  let i = 0, cx = 0, cy = 0, lastC = null, cmd = '';
  const num = () => parseFloat(tok[i++]);
  const cubic = (x1, y1, x2, y2, x, y) => {
    for (let k = 1; k <= steps; k++) {
      const t = k / steps, u = 1 - t;
      pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
                u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
    }
    lastC = [x2, y2]; cx = x; cy = y;
  };
  while (i < tok.length) {
    if (/[MCS]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { cx = num(); cy = num(); pts.push([cx, cy]); lastC = null; }
    else if (cmd === 'C') cubic(num(), num(), num(), num(), num(), num());
    else if (cmd === 'S') {
      const [rx, ry] = lastC ? [2 * cx - lastC[0], 2 * cy - lastC[1]] : [cx, cy];
      cubic(rx, ry, num(), num(), num(), num());
    }
  }
  return pts;
}
CONFIG.path = sampleSvgPath(RIVER_D).map(([x, y]) => [x * DK, y * DK]);

function distToPolyline(pts, x, y) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const dx = bx - ax, dy = by - ay;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(ax + dx * k - x, ay + dy * k - y));
  }
  return best;
}
const distToPath = (x, y) => distToPolyline(CONFIG.path, x, y);

// --- Sinh khoảng 43 ô đặt tướng dọc hai bờ sông, chia 3 bậc độ cao
(function buildSpots() {
  const { sx, sy, minD, maxD } = CONFIG.buildGrid;
  const out = [];
  let row = 0;
  for (let y = 60; y <= 336; y += sy, row++) {
    for (let x = 20 + (row % 2 ? sx / 2 : 0); x <= 912; x += sx) {
      const d = distToPath(x * DK, y * DK) / DK;
      if (d < minD || d > maxD) continue;
      if (CONFIG.hudZones.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) continue;
      out.push({ x: Math.round(x * DK), y: Math.round(y * DK), d });
    }
  }
  // bậc độ cao theo khoảng cách tới sông: gần nhất = Thấp
  const order = out.map((s, i) => i).sort((a, b) => out[a].d - out[b].d);
  const tier = [];
  order.forEach((idx, rank) => {
    tier[idx] = rank < CONFIG.tierCounts[0] ? 0 : rank < CONFIG.tierCounts[0] + CONFIG.tierCounts[1] ? 1 : 2;
  });
  CONFIG.slots = out.map((s) => [s.x, s.y]);
  CONFIG.slotTier = tier;
  // ô gợi ý cho người mới: ô bậc Giữa gần giữa bản đồ
  let best = -1;
  out.forEach((s, i) => {
    if (tier[i] !== 1) return;
    if (best < 0 || Math.hypot(s.x - 560, s.y - 230) < Math.hypot(out[best].x - 560, out[best].y - 230)) best = i;
  });
  CONFIG.coachSlot = Math.max(0, best);
})();

// --- Đường đi: tính sẵn độ dài từng đoạn để quái di chuyển theo quãng đường
const PATH = (() => {
  const segs = [];
  let total = 0;
  for (let i = 1; i < CONFIG.path.length; i++) {
    const [ax, ay] = CONFIG.path[i - 1], [bx, by] = CONFIG.path[i];
    const len = Math.hypot(bx - ax, by - ay);
    segs.push({ ax, ay, bx, by, len, start: total });
    total += len;
  }
  return {
    total,
    at(d) {
      const s = segs.find((g) => d <= g.start + g.len) || segs[segs.length - 1];
      const k = Math.max(0, Math.min(1, (d - s.start) / s.len));
      return { x: s.ax + (s.bx - s.ax) * k, y: s.ay + (s.by - s.ay) * k, dx: s.bx - s.ax };
    },
    // quãng đường gần nhất với một điểm (để đặt vệt lửa, thành chặn...)
    distOf(x, y) {
      let best = 0, bd = Infinity;
      for (const s of segs) {
        const dx = s.bx - s.ax, dy = s.by - s.ay;
        const k = Math.max(0, Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / (dx * dx + dy * dy || 1)));
        const d = Math.hypot(s.ax + dx * k - x, s.ay + dy * k - y);
        if (d < bd) { bd = d; best = s.start + s.len * k; }
      }
      return best;
    },
  };
})();

// ------------------------------------------------------------
//  ĐỒ: mỗi món trong túi là một bản riêng { uid, id, rarity, plus, locked, spent }
// ------------------------------------------------------------
function makeItem(id, rarity) {
  return { uid: nextId++, id, rarity: rarity || ITEMS[id].rarity, plus: 0, locked: false, spent: 0 };
}

// Chỉ số của một món: chỉ số gốc theo độ hiếm hiện tại, mỗi cấp cường hóa +10%
function itemStats(inst) {
  const it = ITEMS[inst.id];
  const k = (RARITY[inst.rarity].mult / RARITY[it.rarity].mult) * (1 + 0.1 * inst.plus);
  const out = {};
  for (const s in it.stats) out[s] = Math.round(it.stats[s] * k * 10) / 10;
  return out;
}
const enhanceCost = (inst) => (inst.plus + 1) * COSTS.enhance[inst.rarity];
const promoteCost = (inst) => COSTS.promote[inst.rarity] || 0;
const scrapValue = (inst) => COSTS.scrap[inst.rarity] + Math.floor(inst.spent * 0.6);

function heroAttrs(h) {
  const def = HEROES[h.type];
  const out = {};
  for (const a of Object.keys(ATTRS)) out[a] = def.attrs[a] + def.gain[a] * (h.level - 1);
  return out;
}

// Cấp hiện tại của kỹ năng thứ i (0 = chưa mở khóa)
function skillLevel(h, i) {
  return h.skillLv[HEROES[h.type].skills[i].id] || 0;
}

// --- Chỉ số cuối = gốc + thuộc tính theo cấp + kỹ năng + đồ + bộ + hào quang
function heroStats(h) {
  const def = HEROES[h.type];
  const base = heroAttrs(h);
  const b = h.buff || {};
  const s = {
    damage: def.base.damage, range: def.base.range, baseCooldown: def.base.cooldown,
    haste: 0, crit: 5, critMult: 2, cleave: 0, arrows: 1, poison: 0,
    splash: def.base.splash || 0, slow: def.base.slow || 0, stench: 0, bonusDmgPct: 0,
    str: base.str, agi: base.agi, int: base.int, hp: 0, regen: 0, cdr: 0, dr: 0,
    pierce: h.type === 'caolo' ? 50 : 0, canAir: def.attack !== 'melee', airMult: 1,
    goldOnKill: 0, stunChance: 0,
  };
  def.skills.forEach((sk, i) => {
    const lv = skillLevel(h, i);
    if (!lv || !sk.apply) return;
    const before = { ...s };
    sk.apply(s, skillN(h.level));
    const m = skillMult(lv);
    if (m > 1) {
      for (const k in s) {
        const b0 = typeof before[k] === 'number' ? before[k] : 0;
        if (typeof s[k] === 'number' && s[k] !== b0) s[k] += (s[k] - b0) * (m - 1);
      }
      s.arrows = Math.round(s.arrows);
    }
  });
  for (const slot of SLOTS) {
    const inst = h.equip[slot];
    if (!inst) continue;
    const st = itemStats(inst);
    for (const k in st) s[k] += st[k];
    if (ITEMS[inst.id].stunChance) s.stunChance += ITEMS[inst.id].stunChance;
  }
  for (const set of activeSets(h.equip)) SETS[set].apply(s);

  // quy đổi thuộc tính như Dota
  s.damage += s[def.attr];
  s.haste += s.agi + (b.haste || 0);
  const grow = 1 + (h.grow || 0) * 0.05;             // Thánh Gióng: Vươn Vai
  s.hpMax = Math.round((150 + s.str * 18 + s.hp) * grow * (1 + (b.hpPct || 0) / 100));
  s.regen += 0.5 + s.str * 0.06 + (b.regen || 0);
  s.skillPower = 1 + s.int * 0.015;
  s.cdr = Math.min(50, s.cdr + s.int * 0.3);
  s.cleave = Math.min(1, s.cleave);
  s.pierce = Math.min(100, s.pierce + (b.pierce || 0));
  s.bonusDmgPct += (h.tier || 0) * 10;               // mỗi sao tiến hóa +10% sát thương
  if (h.type === 'llq' && h.flooded) s.bonusDmgPct += 30;   // Con Rồng
  if (def.dmgType === 'magic') s.bonusDmgPct += b.magicPct || 0;
  s.damage *= (1 + s.bonusDmgPct / 100) * grow;
  s.maxMana = Math.round(80 + s.int * 12);
  s.manaRegen = (1.5 + s.int * 0.08) * (1 + (b.manaPct || 0) / 100);
  s.dr = Math.min(80, s.dr);
  s.cooldown = s.baseCooldown / Math.max(0.2, 1 + s.haste / 100);
  if (h.bogged) { s.cooldown *= 2; s.manaRegen = 0; }   // sa lầy: -50% tốc đánh, không hồi năng lượng
  return s;
}

function setCounts(equip) {
  const counts = {};
  for (const slot of GEAR_SLOTS) {
    const it = equip[slot] && ITEMS[equip[slot].id];
    if (it && it.set) counts[it.set] = (counts[it.set] || 0) + 1;
  }
  return counts;
}

function activeSets(equip) {
  const c = setCounts(equip);
  return Object.keys(c).filter((k) => SETS[k] && c[k] >= SETS[k].pieces);
}

function canEquip(heroType, itemId) {
  const it = ITEMS[itemId];
  if (!it) return false;
  return it.slot !== 'weapon' || it.wclass === HEROES[heroType].wclass;
}

// Đồ rơi / trong hũ: chỉ đồ trang phục (phụ kiện mua ở Lò đúc)
function rollItem(minRarity) {
  const min = RARITY_ORDER.indexOf(minRarity || 'common');
  const pool = Object.keys(ITEMS).filter((id) =>
    GEAR_SLOTS.includes(ITEMS[id].slot) && !ITEMS[id].bossOnly && RARITY_ORDER.indexOf(ITEMS[id].rarity) >= min);
  const total = pool.reduce((a, id) => a + RARITY[ITEMS[id].rarity].weight, 0);
  let r = Math.random() * total;
  for (const id of pool) {
    r -= RARITY[ITEMS[id].rarity].weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1];
}

// ------------------------------------------------------------
//  KỸ NĂNG CHỦ ĐỘNG. Trả về true nếu đã dùng (để tính hồi chiêu).
//  Mỗi chiêu đẩy hiệu ứng vào game.effects (vẽ ở main.js).
// ------------------------------------------------------------
const SKILL_COLOR = {
  bash: '#F2D27A', judgement: '#C8A8FF', pierce: '#7bed9f', arrowrain: '#7FC24A',
  firepillar: '#ff7f50', meteor: '#F28A2E', hook: '#8BC34A', devour: '#B9A274',
  shadowstep: '#7FC24A', assassinate: '#E25A3A', nova: '#BDEBFA', blizzard: '#9EDDF2',
  bamboo: '#D4DC70', firetrail: '#FF8A2E', skyride: '#FFB04A',
  claw: '#7FE0F0', seawave: '#5AB4D6', dragonbeam: '#BFF0FF',
  goldshell: '#F2D27A', quake: '#C8A040', guardcity: '#FFD66B',
  chop: '#E8C070', lute: '#FFE08A', slayer: '#FF6B4A',
  triple: '#F2D27A', turtlearrow: '#9EDDF2', divinebow: '#FFF1C4',
  melon: '#3EDC4E', birds: '#F2E6C8', melonrain: '#3EDC4E',
  flowerheal: '#FF9EC4', mothermountain: '#B9A274', hundredeggs: '#F2E6C8',
  staffheal: '#9EDDF2', redriver: '#E07050', nightcastle: '#C8A878',
  fan: '#FFC8E0', lotus: '#FF9EC4', flowerrain: '#FFB8D8',
  banhchung: '#7FC24A', ricefield: '#E8D070', ancestor: '#FFE08A',
};

function healHeroes(game, x, y, r, pct, color) {
  let n = 0;
  for (const o of game.heroes) {
    if (!o || o.dead || Math.hypot(o.x - x, o.y - y) > r) continue;
    const mx = heroStats(o).hpMax;
    if (o.hp >= mx) continue;
    o.hp = Math.min(mx, o.hp + mx * pct);
    game.effects.push({ type: 'heal', x: o.x, y: o.y, r: 26, color, ttl: 0.7, max: 0.7 });
    n++;
  }
  return n;
}
const hurtNear = (game, x, y, r, below = 0.8) => game.heroes.some((o) =>
  o && !o.dead && Math.hypot(o.x - x, o.y - y) <= r && o.hp < heroStats(o).hpMax * below);
function shieldHeroes(game, x, y, r, pct, color) {
  for (const o of game.heroes) {
    if (!o || o.dead || Math.hypot(o.x - x, o.y - y) > r) continue;
    o.shield = Math.max(o.shield || 0, heroStats(o).hpMax * pct);
    o.shieldT = 8;
    game.effects.push({ type: 'ring', x: o.x, y: o.y - 22, r: 30, color, ttl: 0.6, max: 0.6 });
  }
}
// đẩy lùi quái dọc dòng sông
function knockback(e, dist) {
  if (e.def.boss) dist *= 0.3;
  e.pullT = 0.3;
  e.pullSpeed = dist / 0.3;
}

const SKILL_CASTS = {
  // ----- 6 tướng cơ bản
  bash(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, false);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    game.stun(e, e.def.boss ? 0.4 : 1, 'stun');
    game.hit(e, (st.damage * 2 + n * 0.6) * st.skillPower, h, { big: true, color: '#F2D27A' });
    game.shake = Math.max(game.shake, 3);
    return true;
  },
  judgement(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'dim', ttl: 0.35, max: 0.35 });
    game.effects.push({ type: 'bolt', x: e.x, y: e.y, ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'scorch', x: e.x, y: e.y, ttl: 1.2, max: 1.2 });
    game.sparks(e.x, e.y - 8, '#E0D0FF', 12);
    game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#C8A8FF', dt: 'magic' });
    game.shake = Math.max(game.shake, 6);
    return true;
  },
  pierce(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    game.lineHit(h, t, st.range * 1.6, (st.damage * 2 + n * 0.8) * st.skillPower, { color: '#7bed9f' });
    return true;
  },
  arrowrain(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'volley', x: h.x, y: h.y - 30, ttl: 0.35, max: 0.35 });
    game.effects.push({ type: 'warn', x, y, r: 90, color: '#7FC24A', ttl: 0.35, max: 0.35 });
    game.effects.push({
      type: 'rain', x, y, r: 90, ttl: 0.7, max: 0.7, delay: 0.3,
      onEnd: () => {
        for (const e of game.enemiesInRange(x, y, 90)) game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { color: '#7FC24A' });
      },
    });
    return true;
  },
  firepillar(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    const { x, y } = t;
    game.effects.push({ type: 'pillar', x, y, ttl: 0.8, max: 0.8 });
    for (const e of game.enemiesInRange(x, y, 48)) {
      game.hit(e, (st.damage * 1.8 + n * 0.8) * st.skillPower, h, { big: true, color: '#ff7f50' });
      if (!e.dead) game.dot(e, Math.max(st.poison, 5 + n * 0.1), h, '#e67e22', 'magic');
    }
    return true;
  },
  meteor(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'warn', x, y, r: 110, color: '#E25A3A', ttl: 0.8, max: 0.8 });
    game.effects.push({
      type: 'meteor', x, y, ttl: 0.8, max: 0.8,
      onEnd: () => {
        game.effects.push({ type: 'explosion', x, y, r: 110, ttl: 0.6, max: 0.6 });
        game.effects.push({ type: 'scorch', x, y, r: 60, ttl: 1.6, max: 1.6 });
        game.sparks(x, y - 10, '#ffbe76', 16);
        game.shake = Math.max(game.shake, 9);
        for (const e of game.enemiesInRange(x, y, 110)) game.hit(e, (st.damage * 5 + n * 2) * st.skillPower, h, { big: true, color: '#F28A2E' });
      },
    });
    return true;
  },
  hook(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 1.8, false);
    if (!e) return false;
    game.effects.push({ type: 'hook', hero: h, target: e, color: '#6A8A2A', ttl: 0.55, max: 0.55 });
    game.effects.push({
      type: 'none', ttl: 0.2, max: 0.2,
      onEnd: () => {
        if (e.dead) return;
        if (!e.def.boss) { e.pullT = 0.3; e.pullSpeed = 120 / 0.3; }
        game.hit(e, (40 + n * 1.5) * st.skillPower, h, { big: true, color: '#8BC34A' });
      },
    });
    return true;
  },
  devour(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    const normal = list.filter((e) => !e.def.boss && !e.champion);
    game.effects.push({ type: 'vortex', x: h.x, y: h.y - 22, color: '#B9A274', ttl: 0.6, max: 0.6 });
    if (normal.length) {
      const e = normal.reduce((a, b) => (b.hp > a.hp ? b : a));
      game.effects.push({ type: 'rockfall', x: e.x, y: e.y, ttl: 0.6, max: 0.6 });
      game.text(e.x, e.y - 30, 'VÙI ĐÁ!', '#E8D8B0', 0.9, 18);
      game.hit(e, e.hp + (e.shield || 0) + 1, h, { dt: 'pure' });
    } else {
      game.hit(list[0], (st.damage * 6 + n * 2) * st.skillPower, h, { big: true, color: '#B9A274' });
    }
    return true;
  },
  shadowstep(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!e) return false;
    game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#7FC24A', ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#C8F0A0', ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { st, big: true, color: '#C8F0A0' });
    return true;
  },
  assassinate(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 2.5, false);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'mark', target: e, ttl: 0.45, max: 0.45,
      onEnd: () => {
        if (e.dead) return;
        game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#E25A3A', ttl: 0.35, max: 0.35 });
        game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#ff6b6b', ttl: 0.4, max: 0.4, big: true });
        game.sparks(e.x, e.y - 8, '#c0392b', 12);
        game.shake = Math.max(game.shake, 5);
        game.hit(e, (st.damage * 6 + n * 3) * st.skillPower, h, { big: true, color: '#E25A3A' });
      } });
    return true;
  },
  nova(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'nova', x, y, r: 80, ttl: 0.55, max: 0.55 });
    for (const e of game.enemiesInRange(x, y, 80)) {
      game.hit(e, (60 + n) * st.skillPower, h, { color: '#BDEBFA' });
      if (!e.dead) game.slow(e, 60, 2.5);
    }
    return true;
  },
  blizzard(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range);
    if (!list.length) return false;
    game.effects.push({ type: 'snow', x: h.x, y: h.y, r: st.range, ttl: 2, max: 2 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 1 : 2, 'ice');
      game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { color: '#BDEBFA' });
    }
    game.shake = Math.max(game.shake, 3);
    return true;
  },

  // ----- Thánh Gióng
  bamboo(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'sweep', x: h.x, y: h.y - 20, r: st.range, dir: h.dir, color: '#D4DC70', ttl: 0.4, max: 0.4 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.25 : 0.6, 'stun');
      game.hit(e, (st.damage * 1.6 + n) * st.skillPower, h, { color: '#D4DC70' });
    }
    game.shake = Math.max(game.shake, 3);
    return true;
  },
  firetrail(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.4, false);
    if (!t) return false;
    const d0 = t.dist;
    game.zones.push({ kind: 'fire', d1: Math.max(0, d0 - 160), d2: d0 + 60, ttl: 4, max: 4,
      dps: (10 + n * 0.5) * st.skillPower * (1 + st.int * 0.01), hero: h, dt: 'magic' });
    game.effects.push({ type: 'horse', x: h.x, y: h.y, x2: t.x, y2: t.y, ttl: 0.5, max: 0.5 });
    return true;
  },
  skyride(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.5, false);
    if (!t) return false;
    const d1 = Math.max(0, t.dist - 260), d2 = t.dist + 260;
    game.effects.push({ type: 'skyride', d1, d2, ttl: 0.9, max: 0.9 });
    game.effects.push({ type: 'banner', str: 'Bay Về Trời', color: '#FFB04A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFE0A0', ttl: 0.3, max: 0.3 });
    game.shake = Math.max(game.shake, 8);
    for (const e of game.enemies) {
      if (!e.dead && e.dist >= d1 && e.dist <= d2) game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#FFB04A' });
    }
    return true;
  },
  // ----- Lạc Long Quân
  claw(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, false);
    if (!e) return false;
    game.effects.push({ type: 'claw', x: e.x, y: e.y - 10, color: '#7FE0F0', ttl: 0.4, max: 0.4 });
    for (let i = 0; i < 2; i++) game.hit(e, (st.damage * 1.5 + n * 0.5) * st.skillPower, h, { st, big: i === 1, color: '#7FE0F0' });
    return true;
  },
  seawave(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r: st.range * 1.2, color: '#5AB4D6', ttl: 0.7, max: 0.7 });
    for (const e of list) {
      knockback(e, 90);
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#9EDDF2' });
    }
    return true;
  },
  dragonbeam(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: 'Hóa Rồng', color: '#7FE0F0', ttl: 1.6, max: 1.6 });
    game.lineHit(h, t, st.range * 2.2, (st.damage * 5 + n * 2) * st.skillPower,
      { color: '#BFF0FF', width: 26, dt: 'magic', stun: 0.5, bolt: true });
    game.shake = Math.max(game.shake, 7);
    return true;
  },
  // ----- Thần Kim Quy
  goldshell(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 170, 0.95) && !game.enemiesInRange(h.x, h.y, 200).length) return false;
    shieldHeroes(game, h.x, h.y, 170, (0.2 + n * 0.0025) * skillMult(skillLevel(h, 0)), '#F2D27A');
    game.effects.push({ type: 'dome', x: h.x, y: h.y, r: 170, color: '#F2D27A', ttl: 0.8, max: 0.8 });
    return true;
  },
  quake(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'ring', x: h.x, y: h.y, r: st.range, color: '#C8A040', ttl: 0.6, max: 0.6 });
    game.effects.push({ type: 'cracks', x: h.x, y: h.y, r: st.range, ttl: 1, max: 1 });
    game.shake = Math.max(game.shake, 6);
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.5 : 1.2, 'stun');
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#E8C070' });
    }
    return true;
  },
  guardcity(game, h) {
    const danger = game.enemies.some((e) => !e.dead && e.dist > PATH.total - 170);
    if (!danger) return false;
    game.guardT = 5;
    game.effects.push({ type: 'banner', str: 'Kim Quy Hộ Thành', color: '#FFD66B', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFE08A', ttl: 0.3, max: 0.3 });
    return true;
  },
  // ----- Thạch Sanh
  chop(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, true);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { st, big: true, color: '#E8C070' });
    return true;
  },
  lute(game, h, st) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (list.length < 2) return false;
    game.effects.push({ type: 'notes', x: h.x, y: h.y, r: st.range * 1.2, ttl: 1.5, max: 1.5 });
    for (const e of list) game.stun(e, e.def.boss ? 0.6 : 1.5, 'music');
    return true;
  },
  slayer(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'banner', str: 'Diệt Chằn Tinh', color: '#FF6B4A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#FFB04A', ttl: 0.45, max: 0.45, big: true });
    game.shake = Math.max(game.shake, 8);
    const boss = e.def.boss || e.champion ? 3 : 1;
    game.hit(e, (st.damage * 8 + n * 3) * st.skillPower * boss, h, { big: true, color: '#FF6B4A' });
    return true;
  },
  // ----- Cao Lỗ
  triple(game, h, st, n) {
    const list = game.enemies.filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
      .sort((a, b) => b.dist - a.dist).slice(0, 3);
    if (!list.length) return false;
    for (const e of list) game.shoot(h, e, 'bolt', 620, { ...st, damage: (st.damage * 1.5 + n * 0.5) * st.skillPower });
    return true;
  },
  turtlearrow(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.armor > a.armor || (b.armor === a.armor && b.hp > a.hp) ? b : a));
    game.effects.push({ type: 'streak', x: h.x, y: h.y - 28, x2: e.x, y2: e.y - 8, color: '#9EDDF2', ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { big: true, color: '#9EDDF2', dt: 'pure' });
    return true;
  },
  divinebow(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: 'Nỏ Thần', color: '#FFF1C4', ttl: 1.6, max: 1.6 });
    game.lineHit(h, t, st.range * 2.6, (st.damage * 6 + n * 2) * st.skillPower, { color: '#FFF1C4', width: 18, dt: 'pure' });
    game.shake = Math.max(game.shake, 5);
    return true;
  },
  // ----- Mai An Tiêm
  melon(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    game.effects.push({ type: 'lob', x: h.x, y: h.y - 30, x2: t.x, y2: t.y, color: '#3EDC4E', ttl: 0.45, max: 0.45,
      onEnd: () => {
        game.effects.push({ type: 'splat', x: t.x, y: t.y, r: 70, color: '#E04848', ttl: 0.6, max: 0.6 });
        for (const e of game.enemiesInRange(t.x, t.y, 70)) {
          game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#3EDC4E' });
          if (!e.dead) game.slow(e, 50, 2.5);
        }
      } });
    return true;
  },
  birds(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (!list.length) return false;
    for (let i = 0; i < 6; i++) {
      const e = list[i % list.length];
      game.effects.push({ type: 'bird', x: h.x, y: h.y - 40, target: e, ttl: 0.4 + i * 0.08, max: 0.4 + i * 0.08,
        onEnd: () => { if (!e.dead) game.hit(e, (st.damage + n * 0.5) * st.skillPower, h, { color: '#F2E6C8' }); } });
    }
    return true;
  },
  melonrain(game, h, st, n) {
    const list = game.enemies.filter((e) => !e.dead);
    if (list.length < 4) return false;
    game.effects.push({ type: 'banner', str: 'Mưa Dưa', color: '#3EDC4E', ttl: 1.6, max: 1.6 });
    for (const e of list) {
      game.effects.push({ type: 'lob', x: e.x - 40, y: e.y - 220, x2: e.x, y2: e.y, color: '#3EDC4E', ttl: 0.4 + Math.random() * 0.5, max: 0.9,
        onEnd: () => {
          game.effects.push({ type: 'splat', x: e.x, y: e.y, r: 30, color: '#E04848', ttl: 0.4, max: 0.4 });
          if (!e.dead) { game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { color: '#3EDC4E' }); if (!e.dead) game.slow(e, 40, 2); }
        } });
    }
    return true;
  },
  // ----- Âu Cơ
  flowerheal(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 180)) return false;
    healHeroes(game, h.x, h.y, 180, (0.25 + n * 0.003) * skillMult(skillLevel(h, 0)), '#FF9EC4');
    game.effects.push({ type: 'petals', x: h.x, y: h.y, r: 180, color: '#FF9EC4', ttl: 1, max: 1 });
    return true;
  },
  mothermountain(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2, false);
    if (!t) return false;
    game.zones.push({ kind: 'rock', x: t.x, y: t.y, r: 75, ttl: 4, max: 4, slow: 50,
      dps: (12 + n * 0.4) * st.skillPower, hero: h, dt: 'magic' });
    game.shake = Math.max(game.shake, 3);
    return true;
  },
  hundredeggs(game, h, st) {
    const t = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!t) return false;
    game.blocks.push({ kind: 'eggs', dist: Math.min(PATH.total - 40, t.dist + 50), ttl: 6, max: 6 });
    game.effects.push({ type: 'banner', str: 'Bọc Trăm Trứng', color: '#F2E6C8', ttl: 1.6, max: 1.6 });
    return true;
  },
  // ----- Chử Đồng Tử
  staffheal(game, h, st, n) {
    let best = null;
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 200) continue;
      const r = o.hp / heroStats(o).hpMax;
      if (r < 0.75 && (!best || r < best.r)) best = { o, r };
    }
    if (!best) return false;
    const mx = heroStats(best.o).hpMax;
    best.o.hp = Math.min(mx, best.o.hp + mx * (0.35 + n * 0.003) * skillMult(skillLevel(h, 0)));
    game.effects.push({ type: 'heal', x: best.o.x, y: best.o.y, r: 40, color: '#9EDDF2', ttl: 0.8, max: 0.8 });
    game.effects.push({ type: 'streak', x: h.x, y: h.y - 40, x2: best.o.x, y2: best.o.y - 30, color: '#9EDDF2', ttl: 0.3, max: 0.3 });
    return true;
  },
  redriver(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r: st.range, color: '#C8604A', ttl: 0.7, max: 0.7 });
    for (const e of list) {
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#E07050' });
      if (!e.dead) game.slow(e, 50, 3);
    }
    return true;
  },
  nightcastle(game, h, st) {
    const t = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!t) return false;
    game.blocks.push({ kind: 'wall', dist: Math.min(PATH.total - 40, t.dist + 40), ttl: 6, max: 6 });
    game.effects.push({ type: 'banner', str: 'Thành Một Đêm', color: '#C8A878', ttl: 1.6, max: 1.6 });
    game.shake = Math.max(game.shake, 4);
    return true;
  },
  // ----- Tiên Dung
  fan(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'gust', x: h.x, y: h.y - 20, r: st.range, color: '#FFC8E0', ttl: 0.6, max: 0.6 });
    for (const e of list) {
      knockback(e, 70);
      game.hit(e, (st.damage * 1.2 + n) * st.skillPower, h, { color: '#FFC8E0' });
    }
    return true;
  },
  lotus(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 180)) return false;
    healHeroes(game, h.x, h.y, 180, (0.2 + n * 0.003) * skillMult(skillLevel(h, 2)), '#FF9EC4');
    game.effects.push({ type: 'petals', x: h.x, y: h.y, r: 120, color: '#FF9EC4', ttl: 1, max: 1 });
    return true;
  },
  flowerrain(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: 'Mưa Hoa Tiên', color: '#FFB8D8', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'petals', x: t.x, y: t.y, r: 130, color: '#FFB8D8', ttl: 1.4, max: 1.4 });
    for (const e of game.enemiesInRange(t.x, t.y, 130)) game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#FFB8D8' });
    healHeroes(game, h.x, h.y, 200, 0.3, '#FFB8D8');
    return true;
  },
  // ----- Lang Liêu
  banhchung(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 170, 0.95) && !game.enemiesInRange(h.x, h.y, 200).length) return false;
    shieldHeroes(game, h.x, h.y, 170, (0.2 + n * 0.0025) * skillMult(skillLevel(h, 0)), '#7FC24A');
    game.effects.push({ type: 'dome', x: h.x, y: h.y, r: 170, color: '#7FC24A', ttl: 0.8, max: 0.8 });
    return true;
  },
  ricefield(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2, false);
    if (!t) return false;
    game.zones.push({ kind: 'rice', x: t.x, y: t.y, r: 80, ttl: 4, max: 4, slow: 40,
      dps: (8 + n * 0.3) * st.skillPower, hero: h, dt: 'magic' });
    return true;
  },
  ancestor(game, h) {
    if (!game.heroes.some((o) => o && !o.dead && o.hp < heroStats(o).hpMax * 0.5)) return false;
    game.effects.push({ type: 'banner', str: 'Lễ Tổ Tiên', color: '#FFE08A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFF1C4', ttl: 0.4, max: 0.4 });
    for (const o of game.heroes) {
      if (!o || o.dead) continue;
      o.hp = heroStats(o).hpMax;
      o.invulnT = 2;
      game.effects.push({ type: 'heal', x: o.x, y: o.y, r: 36, color: '#FFE08A', ttl: 0.9, max: 0.9 });
    }
    return true;
  },
};

// ------------------------------------------------------------
//  TRẠNG THÁI TRẬN
// ------------------------------------------------------------
class Game {
  constructor(notify) {
    this.notify = notify || (() => {});
    this.reset(0);
  }

  reset(level) {
    this.level = level || 0;
    this.lv = LEVELS[this.level];
    this.gold = CONFIG.startGold;
    this.lives = CONFIG.startLives;
    this.wave = 0;
    this.heroes = CONFIG.slots.map(() => null);
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.zones = [];          // vùng đất có hiệu ứng (vệt lửa, ruộng lúa, đá núi)
    this.blocks = [];         // vật chặn đường (Lạc Tử, Thành Một Đêm)
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.over = false;
    this.time = 0;
    this.started = false;
    this.flags = { equipped: false, shopOpened: false };
    this.running = false;
    this.nextWaveT = 0;
    this.nextWave = buildWave(1, this.level);
    this.shake = 0;
    this.bossesKilled = 0;
    this.seen = {};
    this.endless = false;
    this.won = false;
    this.guardT = 0;
    // Nước Dâng
    this.water = this.lv.water || 0;           // số bậc đã ngập (0..3)
    this.raised = CONFIG.slots.map(() => false);   // ô đã Mọc Núi (khô vĩnh viễn)
    this.tempFlood = CONFIG.slots.map(() => 0);    // ngập tạm tới thời điểm
    this.moc = 1;                                   // lượt Mọc Núi còn lại
    // Núi Tản Viên
    this.mountain = { growth: 0, soiled: false, herbs: 0 };
    this.stats = { kills: 0, goldEarned: 0 };
    this.events = [];
    // Đồ khởi đầu để thử ngay việc thay đổi hình dạng
    this.inventory = ['mu_long_chim', 'ao_vai', 'riu_dong', 'no_tre', 'gay_mo'].map((id) => makeItem(id));
  }

  get levelWaves() { return this.lv.waves; }

  // ---------- Nước Dâng
  isFlooded(slot) {
    if (this.raised[slot]) return false;
    return CONFIG.slotTier[slot] < this.water || this.tempFlood[slot] > this.time;
  }
  // bậc sắp ngập (nhấp nháy xanh) hoặc -1
  floodSoon() {
    const boss = this.waveActive ? bossAt(this.wave, this.level) : bossAt(this.wave + 1, this.level);
    return boss && this.water < 3 ? this.water : -1;
  }
  mocMax() { return this.mountainStage() >= 4 ? 2 : 1; }
  canRaise(slot) {
    return !this.raised[slot] && (CONFIG.slotTier[slot] < 3);
  }
  raiseSpot(slot) {
    if (this.moc <= 0) return 'Hết lượt Mọc Núi (mỗi đợt nạp lại)';
    if (this.raised[slot]) return 'Ô này đã là núi';
    this.raised[slot] = true;
    this.tempFlood[slot] = 0;
    this.moc--;
    const [x, y] = CONFIG.slots[slot];
    this.effects.push({ type: 'raise', x, y, ttl: 0.9, max: 0.9 });
    this.effects.push({ type: 'ring', x, y, r: 40, color: '#F2D27A', ttl: 0.6, max: 0.6 });
    this.shake = Math.max(this.shake, 3);
    return true;
  }
  riseWater() {
    if (this.water >= 3) return;
    this.water++;
    this.effects.push({ type: 'floodrise', ttl: 1.6, max: 1.6 });
    this.events.push({ type: 'flood', level: this.water });
    this.notify(`Thủy Tinh dâng nước! Các ô bậc ${TIER_NAMES[this.water - 1]} đã ngập`, '#5AB4D6');
  }

  // ---------- hành động của người chơi
  legendCount() {
    return this.heroes.filter((h) => h && HEROES[h.type].legend).length;
  }
  canPlace(slot, type) {
    const def = HEROES[type];
    if (this.heroes[slot]) return 'Ô đã có tướng';
    if (this.isFlooded(slot)) return 'Ô đang ngập: dùng Mọc Núi để cứu ô này';
    if (def.legend && this.legendCount() >= CONFIG.maxLegends) return `Tối đa ${CONFIG.maxLegends} tướng huyền thoại trên sân`;
    if (this.gold < def.cost) return `Cần ${def.cost} vàng`;
    return true;
  }
  placeHero(slot, type) {
    if (this.canPlace(slot, type) !== true) return false;
    const def = HEROES[type];
    this.gold -= def.cost;
    const [x, y] = CONFIG.slots[slot];
    const h = {
      id: nextId++, type, slot, x, y, kills: 0, level: 1, cd: 0, swing: 0, dir: 1,
      dead: false, respawnT: 0, stunT: 0, hp: 0, mana: 0, skillLv: { [def.skills[0].id]: 1 }, skillPts: 0,
      tier: 0, spent: def.cost, grow: 0, shield: 0, shieldT: 0, invulnT: 0, reviveCd: 0,
      equip: { weapon: null, helmet: null, armor: null, acc1: null, acc2: null, acc3: null },
      skillCd: {}, buff: {}, summonT: 0.5,
    };
    this.heroes[slot] = h;
    this.updateAuras();
    h.hp = heroStats(h).hpMax;
    h.mana = heroStats(h).maxMana * 0.5;
    this.effects.push({ type: 'summon', x, y, ttl: 0.6, max: 0.6 });
    return true;
  }

  // Kéo tướng sang ô khác: ô trống thì chuyển, ô có tướng thì đổi chỗ
  moveHero(from, to) {
    if (from === to || !this.heroes[from]) return false;
    const a = this.heroes[from], b = this.heroes[to];
    this.heroes[to] = a;
    this.heroes[from] = b;
    for (const [h, slot] of [[a, to], [b, from]]) {
      if (!h) continue;
      h.slot = slot;
      [h.x, h.y] = CONFIG.slots[slot];
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 15, r: 34, color: '#9dffc4', ttl: 0.4, max: 0.4 });
    }
    return true;
  }

  sellValue(h) { return Math.floor(h.spent * CONFIG.sellRatio); }
  sellHero(slot) {
    const h = this.heroes[slot];
    if (!h) return;
    for (const s of SLOTS) if (h.equip[s]) this.addItem(h.equip[s], true);
    this.gold += this.sellValue(h);
    this.heroes[slot] = null;
  }

  // Nâng cấp tướng bằng vàng: +1 cấp, +1 điểm kỹ năng
  levelCost(h) { return COSTS.level(h.level); }
  levelUp(h) {
    if (h.level >= CONFIG.maxLevel) return 'Tướng đã đạt cấp tối đa';
    const c = this.levelCost(h);
    if (this.gold < c) return `Cần ${c} vàng`;
    const before = heroStats(h).hpMax;
    this.gold -= c;
    h.spent += c;
    h.level++;
    h.skillPts++;
    if (!h.dead) h.hp += heroStats(h).hpMax - before;
    this.text(h.x, h.y - 70, `CẤP ${h.level}`, '#F2D27A', 1.1);
    this.effects.push({ type: 'levelup', x: h.x, y: h.y, ttl: 0.8, max: 0.8 });
    return true;
  }

  // Mở khóa kỹ năng W/E/R bằng vàng
  unlockSkill(h, i) {
    const sk = HEROES[h.type].skills[i];
    if (skillLevel(h, i)) return 'Kỹ năng đã mở';
    if (h.level < COSTS.unlockReq[i]) return `Cần tướng cấp ${COSTS.unlockReq[i]}`;
    if (this.gold < COSTS.unlock[i]) return `Cần ${COSTS.unlock[i]} vàng`;
    this.gold -= COSTS.unlock[i];
    h.spent += COSTS.unlock[i];
    h.skillLv[sk.id] = 1;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 50, color: '#A86CE0', ttl: 0.6, max: 0.6 });
    return true;
  }

  // Nâng kỹ năng bằng điểm kỹ năng
  upgradeSkill(h, i) {
    const sk = HEROES[h.type].skills[i];
    const lv = skillLevel(h, i);
    if (!lv) return 'Mở khóa kỹ năng trước';
    if (lv >= SKILL_MAX[i]) return 'Kỹ năng đã đạt cấp tối đa';
    if (h.level < skillReqLevel(i, lv + 1)) return `Cần tướng cấp ${skillReqLevel(i, lv + 1)}`;
    if (h.skillPts <= 0) return 'Chưa có điểm kỹ năng (nâng cấp tướng để nhận)';
    h.skillPts--;
    h.skillLv[sk.id] = lv + 1;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 40, color: '#F2D27A', ttl: 0.5, max: 0.5 });
    return true;
  }

  // Tiến hoá bằng vàng, lần lượt từng bậc
  evolve(h) {
    const t = h.tier || 0;
    if (t >= 3) return 'Đã đạt bậc cao nhất';
    if (h.level < COSTS.evoReq[t]) return `Cần tướng cấp ${COSTS.evoReq[t]}`;
    if (this.gold < COSTS.evo[t]) return `Cần ${COSTS.evo[t]} vàng`;
    this.gold -= COSTS.evo[t];
    h.spent += COSTS.evo[t];
    h.tier = t + 1;
    this.notify(`${HEROES[h.type].name} tiến hoá lên ${'★'.repeat(h.tier)}!`, '#F2D27A');
    this.effects.push({ type: 'evolve', x: h.x, y: h.y, ttl: 1.2, max: 1.2 });
    return true;
  }

  // ---------- túi đồ
  addItem(inst, silent) {
    if (typeof inst === 'string') inst = makeItem(inst);
    if (this.inventory.length >= CONFIG.bagSize) {
      const v = scrapValue(inst);
      this.gold += v;
      if (!silent) this.notify(`Túi đầy: ${ITEMS[inst.id].name} tự đổi ra ${v} vàng`, '#E8E0CC');
      return null;
    }
    this.inventory.push(inst);
    return inst;
  }
  invIndex(uid) { return this.inventory.findIndex((i) => i.uid === uid); }

  // Trả về true nếu mặc được, ngược lại là câu báo lỗi
  equip(h, uid) {
    const idx = this.invIndex(uid);
    if (idx < 0) return 'Không tìm thấy món đồ';
    const inst = this.inventory[idx];
    const it = ITEMS[inst.id];
    if (!canEquip(h.type, inst.id)) return `Vũ khí này dành cho tướng dùng ${WCLASS_NAMES[it.wclass]}`;
    let slot = it.slot;
    if (slot === 'acc') {
      slot = ACC_SLOTS.find((s) => !h.equip[s]);
      if (!slot) return 'Hết ô phụ kiện. Tháo bớt một món trước';
    }
    const before = heroStats(h).hpMax;
    this.inventory.splice(idx, 1);
    if (h.equip[slot]) this.inventory.push(h.equip[slot]);
    h.equip[slot] = inst;
    if (!h.dead) h.hp += Math.max(0, heroStats(h).hpMax - before);
    this.flags.equipped = true;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 35, color: RARITY[inst.rarity].color, ttl: 0.5, max: 0.5 });
    return true;
  }

  unequip(h, slot) {
    if (!h.equip[slot]) return 'Ô trống';
    if (this.inventory.length >= CONFIG.bagSize) return 'Túi đầy';
    this.inventory.push(h.equip[slot]);
    h.equip[slot] = null;
    h.hp = Math.min(h.hp, heroStats(h).hpMax);
    return true;
  }

  // tìm món theo uid trong túi hoặc trên tướng
  findItem(uid) {
    const inv = this.inventory.find((i) => i.uid === uid);
    if (inv) return { inst: inv, hero: null };
    for (const h of this.heroes) {
      if (!h) continue;
      for (const s of SLOTS) if (h.equip[s] && h.equip[s].uid === uid) return { inst: h.equip[s], hero: h, slot: s };
    }
    return null;
  }

  enhance(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (inst.plus >= 5) return 'Đã cường hóa tối đa +5';
    const c = enhanceCost(inst);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.plus++;
    return true;
  }

  promote(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (inst.plus < 5) return 'Cần cường hóa đủ +5 để thăng phẩm';
    const nextR = RARITY_ORDER[RARITY_ORDER.indexOf(inst.rarity) + 1];
    if (!nextR) return 'Đồ Huyền thoại +5 là tối đa';
    const c = promoteCost(inst);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.rarity = nextR;
    inst.plus = 0;
    return true;
  }

  toggleLock(uid) {
    const f = this.findItem(uid);
    if (f) f.inst.locked = !f.inst.locked;
  }

  scrap(uid) {
    const idx = this.invIndex(uid);
    if (idx < 0) return 'Chỉ đổi được đồ trong túi';
    const inst = this.inventory[idx];
    if (inst.locked) return 'Món đồ đang khóa';
    const v = scrapValue(inst);
    this.inventory.splice(idx, 1);
    this.gold += v;
    return v;
  }

  // Đổi hàng loạt theo bộ lọc chất lượng
  scrapList(filter) {
    return this.inventory.filter((i) => filter.rarities.includes(i.rarity) && !i.locked &&
      !(filter.skipUpgraded && i.spent > 0));
  }
  scrapMany(filter) {
    const list = this.scrapList(filter);
    let total = 0;
    for (const inst of list) {
      total += scrapValue(inst);
      this.inventory.splice(this.inventory.indexOf(inst), 1);
    }
    this.gold += total;
    return { count: list.length, gold: total };
  }

  sortBag() {
    const r = (i) => -RARITY_ORDER.indexOf(i.rarity);
    const s = (i) => ['weapon', 'helmet', 'armor', 'acc'].indexOf(ITEMS[i.id].slot);
    this.inventory.sort((a, b) => r(a) - r(b) || s(a) - s(b) || b.plus - a.plus || a.id.localeCompare(b.id));
  }

  buyChest() {
    if (this.gold < CONFIG.chestCost) return null;
    if (this.inventory.length >= CONFIG.bagSize) return null;
    this.gold -= CONFIG.chestCost;
    return this.addItem(rollItem());
  }

  buy(id) {
    const it = ITEMS[id];
    if (!it.price || this.gold < it.price) return false;
    if (this.inventory.length >= CONFIG.bagSize) return false;
    this.gold -= it.price;
    return this.addItem(id);
  }

  // Ghép đồ: cần đủ nguyên liệu trong túi (không tính món đã khóa) + vàng
  countOwned(id) { return this.inventory.filter((i) => i.id === id && !i.locked).length; }
  missingParts(id) {
    const left = this.inventory.filter((i) => !i.locked).map((i) => i.id);
    const missing = [];
    for (const p of ITEMS[id].recipe.parts) {
      const i = left.indexOf(p);
      if (i < 0) missing.push(p); else left.splice(i, 1);
    }
    return missing;
  }

  craft(id) {
    const r = ITEMS[id].recipe;
    if (this.missingParts(id).length || this.gold < r.cost) return false;
    for (const p of r.parts) {
      // ưu tiên dùng món chưa nâng cấp
      const cands = this.inventory.filter((i) => i.id === p && !i.locked).sort((a, b) => a.spent - b.spent);
      this.inventory.splice(this.inventory.indexOf(cands[0]), 1);
    }
    this.gold -= r.cost;
    return this.addItem(id);
  }

  startWave() {
    if (this.waveActive || this.over) return;
    this.wave++;
    this.spawnQueue = this.nextWave;
    this.waveTotal = this.spawnQueue.length;
    this.nextWave = buildWave(this.wave + 1, this.level);
    this.spawnTimer = 0;
    this.waveActive = true;
  }

  // Gọi sớm: giữa hai đợt thì bắt đầu ngay; đang trong đợt thì dồn đợt kế vào luôn
  earlyBonus() {
    if (this.wave === 0) return 0;
    return this.waveActive ? 30 + this.wave * 3 : 10 + Math.round(Math.max(0, this.nextWaveT) * 4);
  }

  callEarly() {
    if (this.over || (this.wave >= this.levelWaves && !this.endless)) return 0;
    const bonus = this.earlyBonus();
    this.addGold(bonus);
    if (this.waveActive) {
      this.wave++;
      this.spawnQueue = this.spawnQueue.concat(this.nextWave);
      this.waveTotal += this.nextWave.length;
      this.nextWave = buildWave(this.wave + 1, this.level);
    } else {
      this.startWave();
    }
    return bonus;
  }

  addGold(n) {
    this.gold += n;
    this.stats.goldEarned += n;
  }

  // ---------- Núi Tản Viên
  mountainStage() {
    return Math.min(MOUNTAIN.stages.length, 1 + Math.floor(this.mountain.growth / MOUNTAIN.stageWaves));
  }
  mountainProgress() {
    if (this.mountainStage() >= MOUNTAIN.stages.length) return 1;
    return (this.mountain.growth % MOUNTAIN.stageWaves) / MOUNTAIN.stageWaves;
  }

  soilMountain() {
    if (this.mountain.soiled) return 'Đợt này đã bồi đất (mỗi đợt 1 lần)';
    if (this.gold < MOUNTAIN.soilCost) return `Cần ${MOUNTAIN.soilCost} vàng`;
    if (this.mountainStage() >= MOUNTAIN.stages.length) return 'Núi đã cao tối đa';
    this.gold -= MOUNTAIN.soilCost;
    this.mountain.soiled = true;
    this.mountain.growth++;
    return true;
  }

  harvestHerbs() {
    const n = this.mountain.herbs;
    if (!n) return 0;
    this.mountain.herbs = 0;
    this.stats.herbs = (this.stats.herbs || 0) + n;
    this.addGold(n * MOUNTAIN.herbGold);
    for (const h of this.heroes) {
      if (h && !h.dead) h.hp = Math.min(heroStats(h).hpMax, h.hp + heroStats(h).hpMax * 0.25 * n);
    }
    return n;
  }

  growMountain() {
    const m = this.mountain;
    m.growth++;
    m.soiled = false;
    const st = this.mountainStage();
    const gold = st * MOUNTAIN.goldPerStage;
    this.addGold(gold);
    if (st >= 2 && this.wave % 3 === 0) this.lives++;
    if (st >= 3) m.herbs = Math.min(5, m.herbs + 1);
    return gold;
  }

  // ---------- truy vấn
  enemiesInRange(x, y, r, air = true) {
    return this.enemies.filter((e) => !e.dead && (air || !e.def.flying) && Math.hypot(e.x - x, e.y - y) <= r);
  }

  // Ưu tiên quái đi xa nhất (gần thành nhất)
  findTarget(x, y, r, air = true) {
    let best = null;
    for (const e of this.enemies) {
      if (e.dead || (!air && e.def.flying) || Math.hypot(e.x - x, e.y - y) > r) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    return best;
  }

  get boss() {
    return this.enemies.find((e) => (e.def.boss || e.champion) && !e.dead) || null;
  }

  // Sát thương theo đường thẳng từ tướng qua mục tiêu
  lineHit(h, t, len, dmg, o) {
    const d = Math.hypot(t.x - h.x, t.y - h.y) || 1;
    const dx = (t.x - h.x) / d, dy = (t.y - h.y) / d;
    const x1 = h.x, y1 = h.y - 28, x2 = h.x + dx * len, y2 = h.y - 28 + dy * len;
    this.effects.push({ type: o.bolt ? 'beam' : 'streak', x: x1, y: y1, x2, y2, color: o.color, w: o.width, ttl: 0.45, max: 0.45 });
    const w = o.width || 18;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const k = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - 8 - y1) * (y2 - y1)) / (len * len)));
      if (Math.hypot(x1 + (x2 - x1) * k - e.x, y1 + (y2 - y1) * k - (e.y - 8)) < w) {
        if (o.stun) this.stun(e, e.def.boss ? o.stun / 2 : o.stun, 'stun');
        this.hit(e, dmg, h, { big: true, color: o.color, dt: o.dt });
      }
    }
  }

  // ---------- hào quang & đặc trưng tướng (tính lại mỗi khung hình)
  updateAuras() {
    const list = this.heroes.filter((h) => h);
    for (const h of list) {
      h.buff = {};
      h.flooded = this.isFlooded(h.slot);
      h.bogged = h.flooded && h.type !== 'llq';
    }
    const near = (a, b, r) => a !== b && Math.hypot(a.x - b.x, a.y - b.y) <= r;
    for (const src of list) {
      if (src.dead) continue;
      const t = src.type;
      const own = heroStatsNoAura(src);
      for (const o of list) {
        if (o.dead) continue;
        const b = o.buff;
        // Trống Đồng: +20% tốc đánh cho tướng xung quanh (cả bản thân)
        if (own.hasteAura && (o === src || near(src, o, 170))) b.haste = Math.max(b.haste || 0, own.hasteAura);
        if (!near(src, o, 170)) continue;
        if (t === 'kimquy' && near(src, o, 110)) b.dr = Math.max(b.dr || 0, 30);
        if (own.pierceAura) b.pierce = Math.max(b.pierce || 0, own.pierceAura);
        if (t === 'thachsanh') b.manaPct = Math.max(b.manaPct || 0, 50);
        if (t === 'auco') b.healPct = Math.max(b.healPct || 0, 2);
        if (own.magicAura) b.magicPct = (b.magicPct || 0) + own.magicAura;
        if (t === 'langlieu') b.hpPct = Math.max(b.hpPct || 0, 10);
        if (own.regenAura) b.regen = Math.max(b.regen || 0, own.regenAura);
        if (own.blockAura) b.block = Math.max(b.block || 0, own.blockAura);
      }
      // Đôi Uyên Ương
      if ((t === 'tiendung' || t === 'cdt') && list.some((o) => !o.dead && o.type === (t === 'cdt' ? 'tiendung' : 'cdt') && near(src, o, 140))) {
        src.buff.magicPct = (src.buff.magicPct || 0) + 20;
        src.buff.pair = true;
      }
    }
  }

  // ---------- vòng lặp
  update(dt) {
    if (this.over) return;
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 30);
    if (this.guardT > 0) this.guardT -= dt;
    if (!this.waveActive && (this.wave < this.levelWaves || this.endless)) {
      this.nextWaveT -= dt;
      if (this.nextWaveT <= 0) this.startWave();
    }
    this.updateAuras();
    this.updateSpawns(dt);
    this.updateZones(dt);
    for (const e of this.enemies.slice()) this.updateEnemy(e, dt);
    for (const h of this.heroes) if (h) this.updateHero(h, dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.blocks = this.blocks.filter((b) => (b.ttl -= dt) > 0);

    if (this.waveActive && !this.spawnQueue.length && !this.enemies.length) this.waveComplete();
  }

  waveComplete() {
    this.waveActive = false;
    this.nextWaveT = CONFIG.waveBreak;
    const bonus = 20 + this.wave * 5;
    this.addGold(bonus);
    const mGold = this.growMountain();
    let extra = 0;
    for (const h of this.heroes) {
      if (!h) continue;
      if (h.type === 'giong' && h.grow < 10) { h.grow++; this.text(h.x, h.y - 80, 'Vươn Vai!', '#FFB04A', 1.2); }
      if (h.type === 'antiem') extra += 20;
    }
    if (extra) this.addGold(extra);
    this.moc = this.mocMax();
    this.notify(`Hoàn thành đợt ${this.wave}! +${bonus + extra} vàng · Núi Tản Viên +${mGold}`, '#F2D27A');
    if (bossAt(this.wave, this.level)) this.riseWater();
    if (this.wave >= this.levelWaves && !this.endless && !this.won) {
      this.won = true;
      this.running = false;
      this.events.push({ type: 'victory' });
    }
  }

  stars() {
    if (!this.won) return 0;
    return this.lives >= CONFIG.startLives ? 3 : this.lives >= 15 ? 2 : 1;
  }

  spawn(type, dist, elite) {
    const def = ENEMIES[type];
    // boss tăng máu chậm hơn quái thường để không đột biến ở cuối chiến dịch
    let hp = def.hp * (def.boss ? Math.pow(waveHpMult(this.wave), 0.85) : waveHpMult(this.wave)) * this.lv.hp;
    if (elite) hp *= 1.8;
    const p = PATH.at(dist);
    const e = {
      id: nextId++, type, def, hp, maxHp: hp, dist, x: p.x, y: p.y, dir: 1,
      slowT: 0, slowPct: 0, stunT: 0, poisonT: 0, poisonDps: 0, poisonBy: null, dotColor: '#2ecc71', dotType: 'pure',
      atkCd: 1, slamCd: 4, summonCd: 6, healCd: 2, burnT: 0, dead: false, stunKind: 'stun', pullT: 0, pullSpeed: 0,
      elite: elite || null, armor: (def.armor || 0) + (elite === 'armored' ? 10 : 0), mr: def.mr || 0,
      shield: elite === 'shield' ? hp * 0.4 : 0, phase: 0, reborn: false, enraged: false, hitT: 0, zoneSlow: 0,
    };
    this.enemies.push(e);
    if (!def.minion && !this.seen[type]) {
      this.seen[type] = true;
      if (this.wave > 1 || def.boss) this.events.push({ type: 'newEnemy', enemy: type });
    }
    return e;
  }

  updateSpawns(dt) {
    if (!this.spawnQueue.length) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const next = this.spawnQueue.shift();
    this.spawnTimer = next.gap;
    const e = this.spawn(next.type, 0, next.elite);
    if (next.champion) {
      e.champion = true;
      e.hp = e.maxHp = e.maxHp * 3;
      e.armor += 15;
      this.events.push({ type: 'boss', name: `${e.def.name} khổng lồ`, armor: e.armor, champion: true });
    }
    if (e.def.boss) this.events.push({ type: 'boss', name: e.def.name, armor: e.armor, enemy: e.type });
  }

  // vùng đất có hiệu ứng: gây sát thương và làm chậm quái đứng trong vùng
  updateZones(dt) {
    for (const z of this.zones) {
      z.ttl -= dt;
      for (const e of this.enemies) {
        if (e.dead || e.def.flying) continue;
        const inside = z.d1 !== undefined ? e.dist >= z.d1 && e.dist <= z.d2 : Math.hypot(e.x - z.x, e.y - z.y) <= z.r;
        if (!inside) continue;
        this.hit(e, z.dps * dt, z.hero, { silent: true, dt: z.dt });
        if (z.slow) e.zoneSlow = Math.max(e.zoneSlow, z.slow);
      }
    }
    this.zones = this.zones.filter((z) => z.ttl > 0);
  }

  slow(e, pct, t) {
    e.slowT = Math.max(e.slowT, t);
    e.slowPct = Math.max(e.slowT > 0 ? e.slowPct : 0, pct);
  }

  updateEnemy(e, dt) {
    if (e.dead) return;
    const d = e.def;
    if (e.hitT > 0) e.hitT -= dt;
    if (e.slowT > 0) e.slowT -= dt; else e.slowPct = 0;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.hit(e, e.poisonDps * dt, e.poisonBy, { silent: true, dt: e.dotType });
      if (e.dead) return;
    }
    if (e.reviveT > 0) {
      // Hà Bá lặn xuống nước rồi trồi lên
      e.reviveT -= dt;
      e.hp = Math.min(e.maxHp * d.reincarnate.pct, e.hp + (e.maxHp * d.reincarnate.pct / d.reincarnate.delay) * dt);
      return;
    }
    if (e.elite === 'regen') e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03 * dt);
    if (d.enrage && !e.enraged && e.hp < e.maxHp * d.enrage.below) {
      e.enraged = true;
      this.text(e.x, e.y - 30, d.boss ? 'HÓA ĐIÊN!' : 'Điên!', '#ff4d4d', 0.9, d.boss ? 18 : 13);
    }
    // hồi máu đồng đội (Phù Thủy Nước)
    if (d.heal) {
      e.healCd -= dt;
      if (e.healCd <= 0) {
        e.healCd = d.heal.cd;
        const hurt = this.enemies.filter((o) => !o.dead && o !== e && o.hp < o.maxHp && Math.hypot(o.x - e.x, o.y - e.y) <= d.heal.radius);
        if (hurt.length) {
          this.effects.push({ type: 'heal', x: e.x, y: e.y, r: d.heal.radius, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
          for (const o of hurt) {
            o.hp = Math.min(o.maxHp, o.hp + o.maxHp * d.heal.pct);
            this.text(o.x, o.y - 26, '+', '#3EDC4E', 0.6, 16);
          }
        }
      }
    }
    // hô mưa gọi gió: gây sát thương tướng đứng gần (Thủy Tinh)
    if (d.burnAura) {
      e.burnT -= dt;
      if (e.burnT <= 0) {
        e.burnT = 1;
        for (const h of this.heroes) {
          if (h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= d.burnAura.radius) {
            this.damageHero(h, d.burnAura.dps * (1 + this.wave * 0.06));
          }
        }
      }
    }
    // mỗi khi mất 25% máu: gọi Giao Long Con, làm ngập tạm vài ô
    if (d.phaseSummon) {
      const ph = Math.floor((1 - e.hp / e.maxHp) / 0.25);
      while (e.phase < Math.min(3, ph)) {
        e.phase++;
        for (let i = 0; i < d.phaseSummon.count; i++) this.spawn(d.phaseSummon.type, Math.max(0, e.dist - 8 - i * 16));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 70, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        this.text(e.x, e.y - 60, 'Nước dâng lên!', '#9EDDF2', 1.2, 15);
        this.shake = Math.max(this.shake, 4);
        if (d.tempFlood) this.tempFloodSpots(d.tempFlood.count, d.tempFlood.time);
      }
    }

    // quái tầm xa phun nước bắn tướng
    if (d.ranged) {
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        const h = this.nearestHero(e.x, e.y, d.ranged.range);
        if (h) {
          e.atkCd = d.ranged.cd;
          this.projectiles.push({
            kind: 'evil', x: e.x, y: e.y - 14, target: h, tx: h.x, ty: h.y - 20, speed: 260,
            dmg: d.ranged.dmg * (1 + this.wave * 0.08),
          });
        }
      }
    }
    // boss: quẫy đuôi làm choáng tướng
    if (d.slam) {
      e.slamCd -= dt;
      if (e.slamCd <= 0 && this.nearestHero(e.x, e.y, d.slam.range)) {
        e.slamCd = d.slam.cd * (e.enraged ? 0.65 : 1);
        this.shake = Math.max(this.shake, 4);
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: d.slam.range, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        this.effects.push({ type: 'wave', x: e.x, y: e.y, r: d.slam.range, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        for (const h of this.heroes) {
          if (!h || h.dead || Math.hypot(h.x - e.x, h.y - e.y) > d.slam.range) continue;
          h.stunT = d.slam.stun;
          this.damageHero(h, d.slam.dmg * (1 + this.wave * 0.06));
        }
      }
    }
    // boss: gọi quân theo chu kỳ
    if (d.summon) {
      e.summonCd -= dt;
      if (e.summonCd <= 0) {
        e.summonCd = d.summon.cd;
        for (let i = 0; i < d.summon.count; i++) this.spawn(d.summon.type, Math.max(0, e.dist - 10 - i * 18));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#5AB4D6', ttl: 0.4, max: 0.4 });
      }
    }

    if (e.pullT > 0) {
      // bị kéo / đẩy lùi
      e.pullT -= dt;
      e.dist = Math.max(0, e.dist - e.pullSpeed * dt);
      const p = PATH.at(e.dist);
      e.x = p.x; e.y = p.y;
      return;
    }
    if (e.stunT > 0) { e.stunT -= dt; e.zoneSlow = 0; return; }
    const slowPct = Math.max(e.slowT > 0 ? e.slowPct : 0, e.zoneSlow);
    e.zoneSlow = 0;
    const slow = (slowPct / 100) * (1 - (d.slowResist || 0));
    const speed = d.speed * (1 - slow) * (e.enraged ? d.enrage.speed : 1) * (e.elite === 'swift' ? 1.4 : 1);
    let nd = e.dist + speed * dt;
    // vật chặn đường (Lạc Tử, Thành Một Đêm): quái đi bộ phải dừng lại
    if (!d.flying) {
      for (const b of this.blocks) {
        if (e.dist <= b.dist && nd > b.dist) { nd = b.dist; e.blocked = true; }
      }
    }
    e.dist = nd;
    if (e.dist >= PATH.total) {
      e.dead = true;
      if (this.guardT > 0) {
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#FFD66B', ttl: 0.5, max: 0.5 });
        this.text(e.x, e.y - 30, 'Kim Quy chặn!', '#FFD66B', 0.9, 14);
        return;
      }
      this.lives -= d.lives || 1;
      this.effects.push({ type: 'flash', ttl: 0.3, max: 0.3 });
      if (this.lives <= 0) {
        this.lives = 0;
        this.over = true;
        this.running = false;
        this.events.push({ type: 'defeat' });
      }
      return;
    }
    const p = PATH.at(e.dist);
    if (Math.abs(p.dx) > 0.1) e.dir = p.dx > 0 ? 1 : -1;
    e.x = p.x;
    e.y = p.y;
  }

  tempFloodSpots(count, time) {
    const dry = CONFIG.slots.map((s, i) => i).filter((i) => !this.isFlooded(i));
    for (let k = 0; k < count && dry.length; k++) {
      const i = dry.splice(Math.floor(Math.random() * dry.length), 1)[0];
      this.tempFlood[i] = this.time + time;
      const [x, y] = CONFIG.slots[i];
      this.effects.push({ type: 'ring', x, y, r: 30, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
    }
  }

  nearestHero(x, y, r) {
    let best = null, bd = r;
    for (const h of this.heroes) {
      if (!h || h.dead) continue;
      const d = Math.hypot(h.x - x, h.y - y);
      if (d <= bd) { best = h; bd = d; }
    }
    return best;
  }

  damageHero(h, amount, ranged) {
    if (h.dead || h.invulnT > 0) return;
    const b = h.buff || {};
    if (ranged && b.block && Math.random() * 100 < b.block) {
      this.text(h.x, h.y - 50, 'Chặn!', '#9EDDF2', 0.6, 13);
      return;
    }
    const st = heroStats(h);
    amount *= (1 - st.dr / 100) * (1 - (b.dr || 0) / 100);
    if (h.shield > 0) {
      const a = Math.min(h.shield, amount);
      h.shield -= a;
      amount -= a;
      if (amount <= 0) return;
    }
    h.hp -= amount;
    h.hurtT = 0.2;
    this.text(h.x, h.y - 50, '-' + Math.round(amount), '#ff6b6b', 0.7);
    if (h.hp > 0) return;
    const def = HEROES[h.type];
    const badge = ACC_SLOTS.find((s) => h.equip[s] && ITEMS[h.equip[s].id].revive);
    if (badge) {
      h.equip[badge] = null;
      h.hp = st.hpMax;
      this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
      this.notify(`${def.name} hồi sinh nhờ Ngọc Hồi Sinh!`, '#F0A030');
      return;
    }
    h.dead = true;
    h.hp = 0;
    h.respawnT = 4 + h.level * 0.8;
    h.fallT = 0.6;
    this.notify(`${def.name} đã gục! Hồi sinh sau ${Math.ceil(h.respawnT)} giây`, '#E25A3A');
  }

  reviveHero(h) {
    h.dead = false;
    h.hp = heroStats(h).hpMax;
    this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
  }

  updateHero(h, dt) {
    const def = HEROES[h.type];
    const st = heroStats(h);
    if (h.summonT > 0) h.summonT -= dt;
    if (h.hurtT > 0) h.hurtT -= dt;
    if (h.dead) {
      if (h.fallT > 0) h.fallT -= dt;
      h.respawnT -= dt;
      if (h.respawnT <= 0) this.reviveHero(h);
      return;
    }
    if (h.invulnT > 0) h.invulnT -= dt;
    if (h.shieldT > 0) { h.shieldT -= dt; if (h.shieldT <= 0) h.shield = 0; }
    const heal = (h.buff.healPct || 0) / 100 * st.hpMax;
    h.hp = Math.min(st.hpMax, h.hp + (st.regen + heal) * dt);
    h.mana = Math.min(st.maxMana, h.mana + st.manaRegen * dt);
    h.swing = Math.max(0, h.swing - dt * 4);
    if (h.castT > 0) h.castT -= dt;
    for (const sk of def.skills) {
      if (sk.active) h.skillCd[sk.id] = (h.skillCd[sk.id] || 0) - dt;
    }
    // Chử Đồng Tử: hồi sinh tướng gục gần nhất
    if (h.type === 'cdt') {
      h.reviveCd -= dt;
      if (h.reviveCd <= 0) {
        let best = null, bd = 280;
        for (const o of this.heroes) {
          if (!o || !o.dead || o === h) continue;
          const d = Math.hypot(o.x - h.x, o.y - h.y);
          if (d < bd) { bd = d; best = o; }
        }
        if (best) {
          this.reviveHero(best);
          h.reviveCd = 40;
          this.text(best.x, best.y - 70, 'Gậy Thần hồi sinh!', '#9EDDF2', 1.2, 15);
          this.effects.push({ type: 'streak', x: h.x, y: h.y - 40, x2: best.x, y2: best.y - 30, color: '#9EDDF2', ttl: 0.4, max: 0.4 });
        }
      }
    }
    if (h.stunT > 0) { h.stunT -= dt; return; }
    h.cd -= dt;

    // bụi đá quanh mình (Lực Sĩ Núi)
    if (st.stench) {
      for (const e of this.enemiesInRange(h.x, h.y, 95, false)) this.hit(e, st.stench * dt, h, { silent: true, dt: 'magic' });
    }

    // ưu tiên chiêu lớn (R rồi E): khi chiêu lớn đã hồi xong thì để dành năng lượng cho nó
    let reserve = 0;
    for (let i = 3; i >= 1; i--) {
      const sk = def.skills[i];
      if (sk.active && skillLevel(h, i) && h.skillCd[sk.id] <= 0) { reserve = sk.active.mana; break; }
    }
    for (let i = 3; i >= 0; i--) {
      const sk = def.skills[i];
      const lv = skillLevel(h, i);
      if (!sk.active || !lv || h.skillCd[sk.id] > 0 || h.mana < sk.active.mana) continue;
      if (sk.active.mana < reserve && h.mana - sk.active.mana < reserve) continue;
      const cst = { ...st, skillPower: st.skillPower * skillMult(lv) };
      if (SKILL_CASTS[sk.active.cast](this, h, cst, skillN(h.level))) {
        h.mana -= sk.active.mana;
        h.skillCd[sk.id] = sk.active.cooldown * (1 - st.cdr / 100);
        h.swing = 1;
        const color = SKILL_COLOR[sk.active.cast] || '#fff';
        h.castT = i === 3 ? 0.9 : 0.5;
        h.castColor = color;
        h.castUlt = i === 3;
        this.effects.push({ type: 'cast', x: h.x, y: h.y, color, ult: i === 3, ttl: 0.5, max: 0.5 });
        this.text(h.x, h.y - 66, sk.name + '!', color, 1.1, 17);
        break;   // mỗi lần chỉ tung một chiêu
      } else {
        h.skillCd[sk.id] = 0.4;   // chưa có mục tiêu: thử lại sau
      }
    }

    const target = this.findTarget(h.x, h.y, st.range, st.canAir);
    if (!target) return;
    h.dir = target.x >= h.x ? 1 : -1;
    if (h.cd > 0) return;
    h.cd = st.cooldown;
    h.swing = 1;

    if (def.attack === 'melee') {
      this.effects.push({ type: 'slash', x: target.x, y: target.y - 10, dir: h.dir, ttl: 0.2, max: 0.2 });
      this.hit(target, st.damage, h, { st });
      if (st.cleave > 0) {
        for (const e of this.enemiesInRange(h.x, h.y, st.range, false)) {
          if (e !== target) this.hit(e, st.damage * st.cleave, h, { st });
        }
      }
    } else if (st.arrows > 1) {
      const targets = this.enemies
        .filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
        .sort((a, b) => b.dist - a.dist)
        .slice(0, st.arrows);
      for (const e of targets) this.shoot(h, e, def.proj, 520, st);
    } else {
      const speed = def.proj === 'arrow' || def.proj === 'bolt' ? 520 : def.proj === 'frostbolt' ? 360 : 320;
      this.shoot(h, target, def.proj, speed, st);
    }
  }

  shoot(h, target, kind, speed, st) {
    this.projectiles.push({
      kind, x: h.x + h.dir * 10, y: h.y - 30, sx: h.x, sy: h.y - 30, target, tx: target.x, ty: target.y,
      speed, hero: h, st: { ...st },
    });
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (!p.target.dead) {
        p.tx = p.target.x;
        p.ty = p.target.y - (p.kind === 'evil' ? 20 : p.target.def && p.target.def.flying ? 30 : 8);
      }
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      p.angle = Math.atan2(dy, dx);
      if (d > step) {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
        continue;
      }
      p.done = true;
      const { st, hero } = p;
      if (p.kind === 'evil') {
        if (!p.target.dead) this.damageHero(p.target, p.dmg, true);
      } else if (st.splash > 0) {
        this.effects.push({ type: 'ring', x: p.tx, y: p.ty, r: st.splash, color: p.kind === 'melon' ? '#3EDC4E' : '#F28A2E', ttl: 0.3, max: 0.3 });
        for (const e of this.enemiesInRange(p.tx, p.ty, Math.max(st.splash, 14))) {
          this.hit(e, st.damage, hero, { st });
          if (!e.dead && st.poison > 0) this.dot(e, st.poison, hero, '#e67e22', 'magic');
        }
      } else {
        if (p.target.dead) continue;
        this.hit(p.target, st.damage, hero, { st });
        if (p.target.dead) continue;
        if (st.poison > 0) this.dot(p.target, st.poison, hero, '#7FC24A', 'pure');
        if (st.slow > 0) this.slow(p.target, st.slow, 1.5);
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  stun(e, t, kind) {
    t *= 1 - (e.def.stunResist || 0);
    e.stunT = Math.max(e.stunT, t);
    e.stunKind = kind;
  }

  sparks(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      this.effects.push({ type: 'spark', x, y, a: Math.random() * 6.28, color, ttl: 0.5, max: 0.5, d: 20 + Math.random() * 25 });
    }
  }

  dot(e, dps, hero, color, type) {
    e.poisonT = 3;
    e.poisonDps = dps;
    e.poisonBy = hero;
    e.dotColor = color;
    e.dotType = type || 'pure';
  }

  updateEffects(dt) {
    for (const f of this.effects.slice()) {
      if (f.delay > 0) { f.delay -= dt; continue; }
      f.ttl -= dt;
      if (f.vy) f.y += f.vy * dt;
      if (f.ttl <= 0 && f.onEnd) { f.onEnd(); f.onEnd = null; }
    }
    this.effects = this.effects.filter((f) => f.ttl > 0);
  }

  // ---------- sát thương & hạ gục
  // Vật lý bị giáp giảm (xuyên giáp bỏ qua một phần), phép bị kháng phép giảm,
  // chuẩn (pure) không bị giảm. Màng Nước hút sát thương trước.
  hit(e, amount, hero, o = {}) {
    if (e.dead || e.reviveT > 0) return;
    const def = hero ? HEROES[hero.type] : null;
    const type = o.dt || (def ? def.dmgType : 'phys');
    let dmg = amount;
    const st = o.st;
    const crit = st && Math.random() * 100 < st.crit;
    if (crit) dmg *= st.critMult || 2;
    if (st && e.def.flying && st.airMult > 1) dmg *= st.airMult;
    if (type === 'phys') {
      const pierce = st ? st.pierce : hero ? heroStats(hero).pierce : 0;
      const armor = e.armor * (1 - pierce / 100);
      dmg *= 1 - (0.06 * armor) / (1 + 0.06 * armor);
    } else if (type === 'magic') dmg *= 1 - e.mr / 100;
    if (st && st.stunChance && Math.random() * 100 < st.stunChance) this.stun(e, 0.5, 'stun');
    if (!o.silent) e.hitT = 0.12;
    if (crit) this.text(e.x, e.y - 30, Math.round(dmg) + '!', '#FFD66B', 0.7);
    else if (o.big) this.text(e.x, e.y - 30, Math.round(dmg), o.color || '#fff', 0.8);
    if (e.shield > 0) {
      const a = Math.min(e.shield, dmg);
      e.shield -= a;
      dmg -= a;
      if (e.shield <= 0) this.effects.push({ type: 'ring', x: e.x, y: e.y - 10, r: 26, color: '#5AB4D6', ttl: 0.4, max: 0.4 });
    }
    e.hp -= dmg;
    if (e.hp > 0) return;
    if (e.def.reincarnate && !e.reborn) {
      // Hà Bá lặn xuống nước rồi trồi lên một lần
      e.reborn = true;
      e.hp = 1;
      e.reviveT = e.def.reincarnate.delay;
      this.effects.push({ type: 'dive', x: e.x, y: e.y, ttl: e.def.reincarnate.delay, max: e.def.reincarnate.delay });
      this.text(e.x, e.y - 70, 'HÀ BÁ LẶN XUỐNG!', '#9EDDF2', 1.6, 18);
      this.shake = Math.max(this.shake, 5);
      return;
    }
    this.kill(e, hero);
  }

  kill(e, hero) {
    e.dead = true;
    const eliteMult = e.elite ? 2.5 : 1;
    let gold = Math.round(e.def.gold * (1 + this.wave * 0.04) * eliteMult);
    if (hero && this.heroes[hero.slot] === hero) gold += Math.round(heroStats(hero).goldOnKill);
    this.addGold(gold);
    this.stats.kills++;
    this.text(e.x, e.y - 20, '+' + gold, '#F2D27A', 0.7);
    for (let i = 0; i < 6; i++) {
      this.effects.push({ type: 'spark', x: e.x, y: e.y - 8, a: Math.random() * 6.28, color: e.def.color, ttl: 0.4, max: 0.4 });
    }
    this.effects.push({ type: 'die', x: e.x, y: e.y, etype: e.type, dir: e.dir, ttl: 0.4, max: 0.4 });
    if (hero && this.heroes[hero.slot] === hero) hero.kills++;

    if (e.def.split) {
      for (let i = 0; i < e.def.split.count; i++) this.spawn(e.def.split.type, Math.max(0, e.dist - 6 + i * 8));
      this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 30, color: e.def.color, ttl: 0.4, max: 0.4 });
    }

    if (e.def.boss) {
      this.bossesKilled++;
      this.notify(`Đã hạ ${e.def.name}!`, '#F0A030');
      this.shake = Math.max(this.shake, 8);
      this.sparks(e.x, e.y - 20, '#F2D27A', 24);
      this.events.push({ type: 'reward', boss: e.type, options: this.bossRewards(e.type) });
    }
    if (Math.random() < e.def.drop * (e.elite ? 3 : 1)) {
      const id = rollItem(e.def.boss ? 'rare' : e.elite ? 'rare' : 'common');
      const inst = this.addItem(id);
      if (inst) {
        const it = ITEMS[id];
        this.notify(`Rơi đồ: ${it.name} (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
        this.effects.push({ type: 'drop', x: e.x, y: e.y, color: RARITY[it.rarity].color, ttl: 1, max: 1 });
      }
    }
  }

  // Vua Hùng ban thưởng: chọn 1 trong 3
  bossRewards(bossType) {
    const opts = [{ kind: 'item', id: ENEMIES[bossType].reward, title: 'Sính lễ' }];
    opts.push({ kind: 'item', id: rollItem('epic'), title: 'Hũ Vua Hùng', jar: true });
    if (Math.random() < 0.5) {
      opts.push({ kind: 'treasure', gold: 200 + this.wave * 15, lives: 3, title: 'Kho lúa · Đắp thành' });
    } else {
      opts.push({ kind: 'levelup', levels: 2, title: 'Hội làng mừng thắng' });
    }
    return opts;
  }

  claimReward(o) {
    if (o.kind === 'item') {
      this.addItem(o.id);
    } else if (o.kind === 'treasure') {
      this.addGold(o.gold);
      this.lives += o.lives;
    } else if (o.kind === 'levelup') {
      for (const h of this.heroes) {
        if (!h) continue;
        for (let i = 0; i < o.levels && h.level < CONFIG.maxLevel; i++) {
          const before = heroStats(h).hpMax;
          h.level++;
          h.skillPts++;
          if (!h.dead) h.hp += heroStats(h).hpMax - before;
        }
        this.effects.push({ type: 'levelup', x: h.x, y: h.y, ttl: 0.8, max: 0.8 });
      }
    }
  }

  text(x, y, str, color, ttl, size) {
    this.effects.push({ type: 'text', x, y, str: String(str), color, ttl, max: ttl, vy: -40, size: size || 15 });
  }
}

// Chỉ số không tính hào quang (dùng khi tính hào quang để tránh vòng lặp)
function heroStatsNoAura(h) {
  const saved = h.buff;
  h.buff = {};
  const s = heroStats(h);
  h.buff = saved;
  let hasteAura = 0;
  for (const slot of ACC_SLOTS) {
    const inst = h.equip[slot];
    if (inst && ITEMS[inst.id].hasteAura) hasteAura = Math.max(hasteAura, ITEMS[inst.id].hasteAura);
  }
  s.hasteAura = hasteAura;
  return s;
}
