'use strict';

// ============================================================
//  LOGIC GAME: đợt quái, tướng tấn công, cấp & thuộc tính,
//  kỹ năng, boss, cửa hàng & ghép đồ, rơi đồ
// ============================================================

let nextId = 1;

// --- Sinh lưới vị trí đặt tướng (khoảng 40 ô) dọc hai bên đường, tránh sông & lâu đài
(function buildSpots() {
  const { sx, sy, minD, maxD } = CONFIG.buildGrid;
  const out = [];
  let row = 0;
  for (let y = 40; y <= CONFIG.H - 20; y += sy, row++) {
    for (let x = 30 + (row % 2 ? sx / 2 : 0); x <= CONFIG.W - 30; x += sx) {
      const d = distToPath(x, y);
      if (d < minD || d > maxD) continue;
      // không đặt dưới các bảng giao diện
      if (CONFIG.hudZones.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) continue;
      out.push([Math.round(x), y]);
    }
  }
  CONFIG.slots = out;
  // ô gợi ý cho người mới: gần giữa bản đồ
  let best = 0;
  out.forEach(([x, y], i) => {
    if (Math.hypot(x - 590, y - 300) < Math.hypot(out[best][0] - 590, out[best][1] - 300)) best = i;
  });
  CONFIG.coachSlot = best;
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
  };
})();

function heroAttrs(h) {
  const def = HEROES[h.type];
  const out = {};
  for (const a of Object.keys(ATTRS)) out[a] = def.attrs[a] + def.gain[a] * (h.level - 1);
  return out;
}

// --- Chỉ số cuối = gốc + thuộc tính theo cấp + kỹ năng (theo số quái hạ) + đồ + set
function heroStats(h) {
  const def = HEROES[h.type];
  const base = heroAttrs(h);
  const s = {
    damage: def.base.damage, range: def.base.range, baseCooldown: def.base.cooldown,
    haste: 0, crit: 5, critMult: 2, cleave: 0, arrows: 1, poison: 0,
    splash: def.base.splash || 0, slow: def.base.slow || 0, stench: 0, bonusDmgPct: 0,
    str: base.str, agi: base.agi, int: base.int, hp: 0, regen: 0, cdr: 0,
  };
  def.skills.forEach((sk, i) => {
    if (h.kills < sk.unlock || !sk.apply) return;
    // nội tại: hiệu lực nhân theo cấp kỹ năng
    const before = { ...s };
    sk.apply(s, h.kills - sk.unlock);
    const m = skillMult(skillLevel(h, i));
    if (m > 1) {
      for (const k in s) {
        if (typeof s[k] === 'number' && s[k] !== before[k]) s[k] += (s[k] - before[k]) * (m - 1);
      }
      s.arrows = Math.round(s.arrows);
    }
  });
  for (const slot of SLOTS) {
    const it = ITEMS[h.equip[slot]];
    if (it) for (const k in it.stats) s[k] += it.stats[k];
  }
  for (const set of activeSets(h.equip)) SETS[set].apply(s);

  // quy đổi thuộc tính như Dota
  s.damage += s[def.attr];                         // thuộc tính chính -> sát thương
  s.haste += s.agi;                                // nhanh nhẹn -> tốc đánh
  s.hpMax = Math.round(150 + s.str * 18 + s.hp);   // sức mạnh -> máu
  s.regen += 0.5 + s.str * 0.06;
  s.skillPower = 1 + s.int * 0.015;                // trí tuệ -> sức mạnh kỹ năng
  s.cdr = Math.min(50, s.cdr + s.int * 0.3);       // trí tuệ -> giảm hồi chiêu
  s.cleave = Math.min(1, s.cleave);
  s.bonusDmgPct += tierOf(h.kills) * 10;          // mỗi sao tiến hóa +10% sát thương
  s.damage *= 1 + s.bonusDmgPct / 100;
  s.maxMana = Math.round(80 + s.int * 12);          // trí tuệ -> năng lượng
  s.manaRegen = 1 + s.int * 0.06;
  s.cooldown = s.baseCooldown / Math.max(0.2, 1 + s.haste / 100);
  return s;
}

// Cấp hiện tại của kỹ năng thứ i (0 = chưa mở)
function skillLevel(h, i) {
  const sk = HEROES[h.type].skills[i];
  if (h.kills < sk.unlock) return 0;
  return 1 + ((h.skillLv && h.skillLv[sk.id]) || 0);
}

function canEquip(heroType, itemId) {
  const it = ITEMS[itemId];
  if (!it) return false;
  return it.slot !== 'weapon' || it.wclass === HEROES[heroType].wclass;
}

// Đồ rơi / trong rương: chỉ đồ trang phục (phụ kiện mua ở cửa hàng)
function rollItem(minRarity) {
  const order = Object.keys(RARITY);
  const min = order.indexOf(minRarity || 'common');
  const pool = Object.keys(ITEMS).filter((id) =>
    GEAR_SLOTS.includes(ITEMS[id].slot) && !ITEMS[id].bossOnly && order.indexOf(ITEMS[id].rarity) >= min);
  const total = pool.reduce((a, id) => a + RARITY[ITEMS[id].rarity].weight, 0);
  let r = Math.random() * total;
  for (const id of pool) {
    r -= RARITY[ITEMS[id].rarity].weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1];
}

// --- Kỹ năng chủ động. Trả về true nếu đã dùng (để tính hồi chiêu).
// Mỗi chiêu đẩy hiệu ứng vào game.effects (vẽ ở main.js); chiêu có thời gian
// bay/rơi thì gây sát thương khi hiệu ứng kết thúc (onEnd) cho khớp hình ảnh.
const SKILL_COLOR = {
  bash: '#f6e58d', judgement: '#f1c40f', pierce: '#7bed9f', arrowrain: '#2ecc71',
  firepillar: '#ff7f50', meteor: '#e67e22', hook: '#d7a985', devour: '#8bc34a',
  shadowstep: '#a55eea', assassinate: '#e74c3c', nova: '#aee9ff', blizzard: '#74b9ff',
};

const SKILL_CASTS = {
  bash(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, false);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    game.stun(e, e.def.boss ? 0.4 : 1, 'stun');
    game.hit(e, (st.damage * 2 + n * 0.6) * st.skillPower, h, { big: true, color: '#f6e58d' });
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
    game.sparks(e.x, e.y - 8, '#f9e79f', 12);
    game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#f1c40f', dt: 'magic' });
    game.shake = Math.max(game.shake, 6);
    return true;
  },
  pierce(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    const len = st.range * 1.6;
    const d = Math.hypot(t.x - h.x, t.y - h.y) || 1;
    const dx = (t.x - h.x) / d, dy = (t.y - h.y) / d;
    const x1 = h.x, y1 = h.y - 28, x2 = h.x + dx * len, y2 = h.y - 28 + dy * len;
    game.effects.push({ type: 'streak', x: x1, y: y1, x2, y2, color: '#7bed9f', ttl: 0.4, max: 0.4 });
    for (const e of game.enemies) {
      if (e.dead) continue;
      // khoảng cách từ quái tới đường bay
      const k = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - 8 - y1) * (y2 - y1)) / (len * len)));
      if (Math.hypot(x1 + (x2 - x1) * k - e.x, y1 + (y2 - y1) * k - (e.y - 8)) < 18) {
        game.hit(e, (st.damage * 2 + n * 0.8) * st.skillPower, h, { big: true, color: '#7bed9f' });
      }
    }
    return true;
  },
  arrowrain(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'volley', x: h.x, y: h.y - 30, ttl: 0.35, max: 0.35 });
    game.effects.push({ type: 'warn', x, y, r: 90, color: '#2ecc71', ttl: 0.35, max: 0.35 });
    game.effects.push({
      type: 'rain', x, y, r: 90, ttl: 0.7, max: 0.7, delay: 0.3,
      onEnd: () => {
        for (const e of game.enemiesInRange(x, y, 90)) {
          game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { color: '#2ecc71' });
        }
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
    game.effects.push({ type: 'warn', x, y, r: 110, color: '#e74c3c', ttl: 0.8, max: 0.8 });
    game.effects.push({
      type: 'meteor', x, y, ttl: 0.8, max: 0.8,
      onEnd: () => {
        game.effects.push({ type: 'explosion', x, y, r: 110, ttl: 0.6, max: 0.6 });
        game.effects.push({ type: 'scorch', x, y, r: 60, ttl: 1.6, max: 1.6 });
        game.sparks(x, y - 10, '#ffbe76', 16);
        game.shake = Math.max(game.shake, 9);
        for (const e of game.enemiesInRange(x, y, 110)) {
          game.hit(e, (st.damage * 5 + n * 2) * st.skillPower, h, { big: true, color: '#e67e22' });
        }
      },
    });
    return true;
  },
  hook(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 1.8, false);
    if (!e) return false;
    game.effects.push({ type: 'hook', hero: h, target: e, ttl: 0.55, max: 0.55 });
    // móc trúng sau 0.2s, rồi kéo quái lùi lại dọc đường
    game.effects.push({
      type: 'none', ttl: 0.2, max: 0.2,
      onEnd: () => {
        if (e.dead) return;
        if (!e.def.boss) { e.pullT = 0.3; e.pullSpeed = 120 / 0.3; }
        game.hit(e, (40 + n * 1.5) * st.skillPower, h, { big: true, color: '#d7a985' });
      },
    });
    return true;
  },
  devour(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    const normal = list.filter((e) => !e.def.boss);
    game.effects.push({ type: 'vortex', x: h.x, y: h.y - 22, color: '#8bc34a', ttl: 0.6, max: 0.6 });
    if (normal.length) {
      const e = normal.reduce((a, b) => (b.hp > a.hp ? b : a));
      game.effects.push({ type: 'swallow', x: e.x, y: e.y - 8, x2: h.x, y2: h.y - 26, r: e.def.size, color: e.def.color, ttl: 0.45, max: 0.45 });
      game.text(e.x, e.y - 30, 'NUỐT!', '#8bc34a', 0.9, 18);
      game.hit(e, e.hp + (e.shield || 0) + 1, h, { dt: 'pure' });
    } else {
      game.hit(list[0], (st.damage * 6 + n * 2) * st.skillPower, h, { big: true, color: '#8bc34a' });
    }
    return true;
  },
  shadowstep(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!e) return false;
    game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#a55eea', ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#c39bd3', ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { st, big: true, color: '#c39bd3' });
    return true;
  },
  assassinate(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 2.5, false);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'mark', target: e, ttl: 0.45, max: 0.45,
      onEnd: () => {
        if (e.dead) return;
        game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#e74c3c', ttl: 0.35, max: 0.35 });
        game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#ff6b6b', ttl: 0.4, max: 0.4, big: true });
        game.sparks(e.x, e.y - 8, '#c0392b', 12);
        game.shake = Math.max(game.shake, 5);
        game.hit(e, (st.damage * 6 + n * 3) * st.skillPower, h, { big: true, color: '#e74c3c' });
      } });
    return true;
  },
  nova(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'nova', x, y, r: 80, ttl: 0.55, max: 0.55 });
    for (const e of game.enemiesInRange(x, y, 80)) {
      game.hit(e, (60 + n) * st.skillPower, h, { color: '#aee9ff' });
      if (!e.dead) { e.slowT = 2.5; e.slowPct = Math.max(e.slowPct, 60); }
    }
    return true;
  },
  blizzard(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range);
    if (!list.length) return false;
    game.effects.push({ type: 'snow', x: h.x, y: h.y, r: st.range, ttl: 2, max: 2 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 1 : 2, 'ice');
      game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { color: '#aee9ff' });
    }
    game.shake = Math.max(game.shake, 3);
    return true;
  },
};

class Game {
  constructor(notify) {
    this.notify = notify || (() => {});
    this.reset();
  }

  reset() {
    this.gold = CONFIG.startGold;
    this.lives = CONFIG.startLives;
    this.wave = 0;
    this.heroes = CONFIG.slots.map(() => null);
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.over = false;
    this.time = 0;
    this.started = false;
    this.flags = { equipped: false, shopOpened: false };
    this.running = false;      // nút Bắt đầu/Dừng: đợt quái tự nối tiếp khi đang chạy
    this.nextWaveT = 0;        // đếm ngược tới đợt kế
    this.nextWave = buildWave(1);
    this.shake = 0;
    this.bossesKilled = 0;
    this.seen = {};         // loại quái đã gặp (báo "quái mới")
    this.endless = false;   // chơi tiếp sau đợt 30
    this.won = false;
    this.tree = { growth: 0, watered: false, fruits: 0 };
    this.events = [];   // sự kiện lớn cho giao diện (boss xuất hiện...)
    // Đồ khởi đầu để thử ngay việc thay đổi hình dạng
    this.inventory = ['leather_cap', 'leather_armor', 'iron_sword', 'hunter_bow', 'oak_staff'];
  }

  // ---------- hành động của người chơi
  placeHero(slot, type) {
    const def = HEROES[type];
    if (this.heroes[slot] || this.gold < def.cost) return false;
    this.gold -= def.cost;
    const [x, y] = CONFIG.slots[slot];
    const h = {
      id: nextId++, type, slot, x, y, kills: 0, level: 1, xp: 0, cd: 0, swing: 0, dir: 1,
      dead: false, respawnT: 0, stunT: 0, hp: 0, mana: 0, skillLv: {}, skillPts: 0,
      equip: { weapon: null, helmet: null, armor: null, acc1: null, acc2: null, acc3: null },
      skillCd: {},
    };
    h.hp = heroStats(h).hpMax;
    h.mana = heroStats(h).maxMana;
    this.heroes[slot] = h;
    this.effects.push({ type: 'ring', x, y: y - 15, r: 40, color: '#fff', ttl: 0.4, max: 0.4 });
    return true;
  }

  // Kéo tướng sang bệ khác: bệ trống thì chuyển, bệ có tướng thì đổi chỗ
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

  sellHero(slot) {
    const h = this.heroes[slot];
    if (!h) return;
    for (const s of SLOTS) if (h.equip[s]) this.inventory.push(h.equip[s]);
    this.gold += Math.floor(HEROES[h.type].cost * CONFIG.sellRatio);
    this.heroes[slot] = null;
  }

  // Trả về true nếu mặc được, ngược lại là câu báo lỗi
  equip(h, invIndex) {
    const id = this.inventory[invIndex];
    const it = ITEMS[id];
    if (!canEquip(h.type, id)) return 'Vũ khí này không hợp với tướng';
    let slot = it.slot;
    if (slot === 'acc') {
      slot = ACC_SLOTS.find((s) => !h.equip[s]);
      if (!slot) return 'Hết ô phụ kiện. Chạm vào một ô để tháo bớt';
    }
    const before = heroStats(h).hpMax;
    this.inventory.splice(invIndex, 1);
    if (h.equip[slot]) this.inventory.push(h.equip[slot]);
    h.equip[slot] = id;
    if (!h.dead) h.hp += Math.max(0, heroStats(h).hpMax - before);
    this.flags.equipped = true;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 35, color: RARITY[it.rarity].color, ttl: 0.5, max: 0.5 });
    return true;
  }

  unequip(h, slot) {
    if (!h.equip[slot]) return;
    this.inventory.push(h.equip[slot]);
    h.equip[slot] = null;
    h.hp = Math.min(h.hp, heroStats(h).hpMax);
  }

  buyChest() {
    if (this.gold < CONFIG.chestCost) return null;
    this.gold -= CONFIG.chestCost;
    const id = rollItem();
    this.inventory.push(id);
    return id;
  }

  buy(id) {
    const it = ITEMS[id];
    if (!it.price || this.gold < it.price) return false;
    this.gold -= it.price;
    this.inventory.push(id);
    return true;
  }

  // Ghép đồ: cần đủ nguyên liệu trong túi + vàng
  missingParts(id) {
    const left = this.inventory.slice();
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
    for (const p of r.parts) this.inventory.splice(this.inventory.indexOf(p), 1);
    this.gold -= r.cost;
    this.inventory.push(id);
    return true;
  }

  startWave() {
    if (this.waveActive || this.over) return;
    this.wave++;
    this.spawnQueue = this.nextWave;
    this.waveTotal = this.spawnQueue.length;
    this.nextWave = buildWave(this.wave + 1);
    this.spawnTimer = 0;
    this.waveActive = true;
  }

  // Gọi sớm: giữa hai đợt thì bắt đầu ngay; đang trong đợt thì dồn đợt kế vào luôn
  earlyBonus() {
    if (this.wave === 0) return 0;
    return this.waveActive ? 30 + this.wave * 3 : 10 + Math.round(Math.max(0, this.nextWaveT) * 4);
  }

  callEarly() {
    if (this.over || (this.wave >= CONFIG.totalWaves && !this.endless)) return 0;
    const bonus = this.earlyBonus();
    this.gold += bonus;
    if (this.waveActive) {
      this.wave++;
      this.spawnQueue = this.spawnQueue.concat(this.nextWave);
      this.waveTotal += this.nextWave.length;
      this.nextWave = buildWave(this.wave + 1);
    } else {
      this.startWave();
    }
    return bonus;
  }

  // Nâng kỹ năng bằng điểm kỹ năng. Trả về true hoặc câu báo lỗi
  upgradeSkill(h, i) {
    const sk = HEROES[h.type].skills[i];
    const lv = skillLevel(h, i);
    if (!lv) return `Cần hạ ${sk.unlock} quái để mở kỹ năng này`;
    if (lv >= SKILL_MAX[i]) return 'Kỹ năng đã đạt cấp tối đa';
    if (h.level < skillReqLevel(i, lv + 1)) return `Cần tướng cấp ${skillReqLevel(i, lv + 1)}`;
    if (h.skillPts <= 0) return 'Chưa có điểm kỹ năng (lên cấp để nhận)';
    h.skillPts--;
    h.skillLv[sk.id] = (h.skillLv[sk.id] || 0) + 1;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 40, color: '#f0c46a', ttl: 0.5, max: 0.5 });
    return true;
  }

  // ---------- Cây Sự Sống
  treeStage() {
    return Math.min(TREE.stages.length, 1 + Math.floor(this.tree.growth / TREE.stageWaves));
  }

  waterTree() {
    if (this.tree.watered) return 'Hôm nay cây đã được tưới (mỗi đợt 1 lần)';
    if (this.gold < TREE.waterCost) return `Cần ${TREE.waterCost} vàng`;
    if (this.treeStage() >= TREE.stages.length) return 'Cây đã lớn tối đa';
    this.gold -= TREE.waterCost;
    this.tree.watered = true;
    this.tree.growth++;
    return true;
  }

  harvestTree() {
    const n = this.tree.fruits;
    if (!n) return 0;
    this.tree.fruits = 0;
    this.gold += n * TREE.fruitGold;
    for (const h of this.heroes) {
      if (h && !h.dead) h.hp = Math.min(heroStats(h).hpMax, h.hp + heroStats(h).hpMax * 0.25 * n);
    }
    return n;
  }

  growTree() {
    const t = this.tree;
    t.growth++;
    t.watered = false;
    const st = this.treeStage();
    const gold = st * TREE.goldPerStage;
    this.gold += gold;
    if (st >= 2 && this.wave % 3 === 0) this.lives++;
    if (st >= 3) t.fruits = Math.min(5, t.fruits + 1);
    return gold;
  }

  // ---------- truy vấn
  // air = false: không tính quái bay (tướng cận chiến không với tới)
  enemiesInRange(x, y, r, air = true) {
    return this.enemies.filter((e) => !e.dead && (air || !e.def.flying) && Math.hypot(e.x - x, e.y - y) <= r);
  }

  // Ưu tiên quái đi xa nhất (gần lâu đài nhất)
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

  // ---------- vòng lặp
  update(dt) {
    if (this.over) return;
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 30);
    if (!this.waveActive && (this.wave < CONFIG.totalWaves || this.endless)) {
      this.nextWaveT -= dt;
      if (this.nextWaveT <= 0) this.startWave();
    }
    this.updateSpawns(dt);
    for (const e of this.enemies.slice()) this.updateEnemy(e, dt);
    for (const h of this.heroes) if (h) this.updateHero(h, dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.enemies = this.enemies.filter((e) => !e.dead);

    if (this.waveActive && !this.spawnQueue.length && !this.enemies.length) {
      this.waveActive = false;
      this.nextWaveT = CONFIG.waveBreak;
      const bonus = 20 + this.wave * 5;
      this.gold += bonus;
      const treeGold = this.growTree();
      this.notify(`Hoàn thành đợt ${this.wave}! +${bonus}💰 · Cây Sự Sống +${treeGold}💰`, '#f1c40f');
      if (this.wave >= CONFIG.totalWaves && !this.endless && !this.won) {
        this.won = true;
        this.events.push({ type: 'victory' });
      }
    }
  }

  spawn(type, dist, elite) {
    const def = ENEMIES[type];
    // boss tăng máu chậm hơn quái thường để không đột biến ở cuối chiến dịch
    let hp = def.hp * (def.boss ? Math.pow(waveHpMult(this.wave), 0.85) : waveHpMult(this.wave));
    if (elite) hp *= 1.8;
    const p = PATH.at(dist);
    const e = {
      id: nextId++, type, def, hp, maxHp: hp, dist, x: p.x, y: p.y, dir: 1,
      slowT: 0, slowPct: 0, stunT: 0, poisonT: 0, poisonDps: 0, poisonBy: null, dotColor: '#2ecc71', dotType: 'pure',
      atkCd: 1, slamCd: 4, summonCd: 6, healCd: 2, burnT: 0, dead: false, stunKind: 'stun', pullT: 0, pullSpeed: 0,
      elite: elite || null, armor: (def.armor || 0) + (elite === 'armored' ? 10 : 0), mr: def.mr || 0,
      shield: elite === 'shield' ? hp * 0.4 : 0, phase: 0, reborn: false, enraged: false,
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
      // Golem khổng lồ đợt 5/15/25
      e.champion = true;
      e.hp = e.maxHp = e.maxHp * 3;
      e.armor += 15;
      this.events.push({ type: 'boss', name: `${e.def.name} khổng lồ`, armor: e.armor, champion: true });
    }
    if (e.def.boss) this.events.push({ type: 'boss', name: e.def.name, armor: e.armor });
  }

  updateEnemy(e, dt) {
    if (e.dead) return;
    const d = e.def;
    if (e.slowT > 0) e.slowT -= dt;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.hit(e, e.poisonDps * dt, e.poisonBy, { silent: true, dt: e.dotType });
      if (e.dead) return;
    }
    if (e.reviveT > 0) {
      // Vua Xương đang hồi sinh
      e.reviveT -= dt;
      e.hp = Math.min(e.maxHp * d.reincarnate.pct, e.hp + (e.maxHp * d.reincarnate.pct / d.reincarnate.delay) * dt);
      return;
    }
    if (e.elite === 'regen') e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03 * dt);
    // hóa điên khi máu thấp
    if (d.enrage && !e.enraged && e.hp < e.maxHp * d.enrage.below) {
      e.enraged = true;
      this.text(e.x, e.y - 30, d.boss ? 'HÓA ĐIÊN!' : 'Điên!', '#ff4d4d', 0.9, d.boss ? 18 : 13);
    }
    // hồi máu đồng đội (Pháp Sư Quỷ)
    if (d.heal) {
      e.healCd -= dt;
      if (e.healCd <= 0) {
        e.healCd = d.heal.cd;
        const hurt = this.enemies.filter((o) => !o.dead && o !== e && o.hp < o.maxHp && Math.hypot(o.x - e.x, o.y - e.y) <= d.heal.radius);
        if (hurt.length) {
          this.effects.push({ type: 'heal', x: e.x, y: e.y, r: d.heal.radius, ttl: 0.6, max: 0.6 });
          for (const o of hurt) {
            o.hp = Math.min(o.maxHp, o.hp + o.maxHp * d.heal.pct);
            this.text(o.x, o.y - 26, '+', '#55efc4', 0.6, 16);
          }
        }
      }
    }
    // thiêu đốt tướng đứng gần (Chúa Tể Tro Tàn)
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
    // gọi quân mỗi khi mất 25% máu
    if (d.phaseSummon) {
      const ph = Math.floor((1 - e.hp / e.maxHp) / 0.25);
      while (e.phase < Math.min(3, ph)) {
        e.phase++;
        for (let i = 0; i < d.phaseSummon.count; i++) this.spawn(d.phaseSummon.type, Math.max(0, e.dist - 8 - i * 16));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 70, color: '#ff7043', ttl: 0.6, max: 0.6 });
        this.text(e.x, e.y - 60, 'Trỗi dậy, lũ quỷ lửa!', '#ff7043', 1.2, 15);
        this.shake = Math.max(this.shake, 4);
      }
    }

    // quái tầm xa bắn tướng
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
    // boss: dậm đất làm choáng tướng
    if (d.slam) {
      e.slamCd -= dt;
      if (e.slamCd <= 0 && this.nearestHero(e.x, e.y, d.slam.range)) {
        e.slamCd = d.slam.cd * (e.enraged ? 0.65 : 1);
        this.shake = Math.max(this.shake, 4);
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: d.slam.range, color: '#e67e22', ttl: 0.6, max: 0.6 });
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
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#8e44ad', ttl: 0.4, max: 0.4 });
      }
    }

    if (e.pullT > 0) {
      // bị móc kéo lùi
      e.pullT -= dt;
      e.dist = Math.max(0, e.dist - e.pullSpeed * dt);
      const p = PATH.at(e.dist);
      e.x = p.x; e.y = p.y;
      return;
    }
    if (e.stunT > 0) { e.stunT -= dt; return; }
    const slow = e.slowT > 0 ? (e.slowPct / 100) * (1 - (d.slowResist || 0)) : 0;
    const speed = d.speed * (1 - slow) * (e.enraged ? d.enrage.speed : 1) * (e.elite === 'swift' ? 1.4 : 1);
    e.dist += speed * dt;
    if (e.dist >= PATH.total) {
      e.dead = true;
      this.lives -= d.lives || 1;
      this.effects.push({ type: 'flash', ttl: 0.3, max: 0.3 });
      if (this.lives <= 0) {
        this.lives = 0;
        this.over = true;
      }
      return;
    }
    const p = PATH.at(e.dist);
    if (Math.abs(p.dx) > 0.1) e.dir = p.dx > 0 ? 1 : -1;
    e.x = p.x;
    e.y = p.y;
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

  damageHero(h, amount) {
    if (h.dead) return;
    h.hp -= amount;
    this.text(h.x, h.y - 50, '-' + Math.round(amount), '#ff6b6b', 0.7);
    if (h.hp > 0) return;
    const def = HEROES[h.type];
    const badge = ACC_SLOTS.find((s) => h.equip[s] && ITEMS[h.equip[s]].revive);
    if (badge) {
      h.equip[badge] = null;
      h.hp = heroStats(h).hpMax;
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 70, color: '#f39c12', ttl: 0.9, max: 0.9 });
      this.notify(`${def.name} hồi sinh nhờ Huy Hiệu Phượng Hoàng!`, '#f39c12');
      return;
    }
    h.dead = true;
    h.hp = 0;
    h.respawnT = 4 + h.level * 0.8;
    this.notify(`${def.name} đã gục! Hồi sinh sau ${Math.ceil(h.respawnT)} giây`, '#e74c3c');
  }

  gainXp(h, amount) {
    if (h.level >= CONFIG.maxLevel) return;
    h.xp += amount;
    let up = false;
    while (h.level < CONFIG.maxLevel && h.xp >= xpForLevel(h.level + 1)) {
      const before = heroStats(h).hpMax;
      h.level++;
      h.skillPts++;
      h.hp += heroStats(h).hpMax - before;
      up = true;
    }
    if (up) {
      this.text(h.x, h.y - 70, `LÊN CẤP ${h.level}`, '#f6c945', 1.1);
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 45, color: '#f6c945', ttl: 0.6, max: 0.6 });
    }
  }

  updateHero(h, dt) {
    const def = HEROES[h.type];
    const st = heroStats(h);
    if (h.dead) {
      h.respawnT -= dt;
      if (h.respawnT <= 0) {
        h.dead = false;
        h.hp = st.hpMax;
        this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 40, color: '#fff', ttl: 0.5, max: 0.5 });
      }
      return;
    }
    h.hp = Math.min(st.hpMax, h.hp + st.regen * dt);
    h.mana = Math.min(st.maxMana, h.mana + st.manaRegen * dt);
    h.swing = Math.max(0, h.swing - dt * 4);
    if (h.castT > 0) h.castT -= dt;
    for (const sk of def.skills) {
      if (sk.active && h.kills >= sk.unlock) h.skillCd[sk.id] = (h.skillCd[sk.id] || 0) - dt;
    }
    if (h.stunT > 0) { h.stunT -= dt; return; }
    h.cd -= dt;

    // hào quang gây sát thương (Mùi Hôi Thối)
    if (st.stench) {
      for (const e of this.enemiesInRange(h.x, h.y, 95, false)) this.hit(e, st.stench * dt, h, { silent: true, dt: 'magic' });
    }

    for (const [i, sk] of def.skills.entries()) {
      if (!sk.active || h.kills < sk.unlock || h.skillCd[sk.id] > 0 || h.mana < sk.active.mana) continue;
      const cst = { ...st, skillPower: st.skillPower * skillMult(skillLevel(h, i)) };
      if (SKILL_CASTS[sk.active.cast](this, h, cst, h.kills - sk.unlock)) {
        h.mana -= sk.active.mana;
        h.skillCd[sk.id] = sk.active.cooldown * (1 - st.cdr / 100);
        h.swing = 1;
        const color = SKILL_COLOR[sk.active.cast] || '#fff';
        h.castT = 0.5;
        h.castColor = color;
        this.effects.push({ type: 'cast', x: h.x, y: h.y, color, ttl: 0.5, max: 0.5 });
        this.text(h.x, h.y - 66, sk.name + '!', color, 1.1, 17);
        break;   // mỗi lần chỉ tung một chiêu
      }
    }

    const air = def.attack !== 'melee';
    const target = this.findTarget(h.x, h.y, st.range, air);
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
    } else if (def.attack === 'arrow') {
      const targets = this.enemies
        .filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
        .sort((a, b) => b.dist - a.dist)
        .slice(0, st.arrows);
      for (const e of targets) this.shoot(h, e, 'arrow', 520, st);
    } else if (def.attack === 'frost') {
      this.shoot(h, target, 'frostbolt', 360, st);
    } else {
      this.shoot(h, target, 'fireball', 300, st);
    }
  }

  shoot(h, target, kind, speed, st) {
    this.projectiles.push({
      kind, x: h.x + h.dir * 10, y: h.y - 30, target, tx: target.x, ty: target.y,
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
        if (!p.target.dead) this.damageHero(p.target, p.dmg);
      } else if (p.kind === 'arrow' || p.kind === 'frostbolt') {
        if (p.target.dead) continue;
        this.hit(p.target, st.damage, hero, { st });
        if (p.target.dead) continue;
        if (st.poison > 0) this.dot(p.target, st.poison, hero, '#2ecc71', 'pure');
        if (st.slow > 0) { p.target.slowT = 1.5; p.target.slowPct = st.slow; }
      } else {
        this.effects.push({ type: 'ring', x: p.tx, y: p.ty, r: st.splash, color: '#e67e22', ttl: 0.3, max: 0.3 });
        for (const e of this.enemiesInRange(p.tx, p.ty, Math.max(st.splash, 14))) {
          this.hit(e, st.damage, hero, { st });
          if (!e.dead && st.poison > 0) this.dot(e, st.poison, hero, '#e67e22', 'magic');
        }
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
  // Sát thương vật lý bị giáp giảm (như Dota), sát thương phép bị kháng phép giảm,
  // sát thương chuẩn (pure) không bị giảm. Khiên phép hút sát thương trước.
  hit(e, amount, hero, o = {}) {
    if (e.dead || e.reviveT > 0) return;
    const type = o.dt || (hero ? HEROES[hero.type].dmgType : 'phys');
    let dmg = amount;
    const crit = o.st && Math.random() * 100 < o.st.crit;
    if (crit) dmg *= o.st.critMult || 2;
    if (type === 'phys') dmg *= 1 - (0.06 * e.armor) / (1 + 0.06 * e.armor);
    else if (type === 'magic') dmg *= 1 - e.mr / 100;
    if (crit) this.text(e.x, e.y - 30, Math.round(dmg) + '!', '#f1c40f', 0.7);
    else if (o.big) this.text(e.x, e.y - 30, Math.round(dmg), o.color || '#fff', 0.8);
    if (e.shield > 0) {
      const a = Math.min(e.shield, dmg);
      e.shield -= a;
      dmg -= a;
      if (e.shield <= 0) this.effects.push({ type: 'ring', x: e.x, y: e.y - 10, r: 26, color: '#74b9ff', ttl: 0.4, max: 0.4 });
    }
    e.hp -= dmg;
    if (e.hp > 0) return;
    if (e.def.reincarnate && !e.reborn) {
      // Vua Xương hồi sinh một lần
      e.reborn = true;
      e.hp = 1;
      e.reviveT = e.def.reincarnate.delay;
      this.effects.push({ type: 'revive', x: e.x, y: e.y, ttl: e.def.reincarnate.delay, max: e.def.reincarnate.delay });
      this.text(e.x, e.y - 70, 'VUA XƯƠNG HỒI SINH!', '#dfe6e9', 1.6, 18);
      this.shake = Math.max(this.shake, 5);
      return;
    }
    this.kill(e, hero);
  }

  kill(e, hero) {
    e.dead = true;
    const eliteMult = e.elite ? 2.5 : 1;
    const gold = Math.round(e.def.gold * (1 + this.wave * 0.04) * eliteMult);
    this.gold += gold;
    this.text(e.x, e.y - 20, '+' + gold, '#f1c40f', 0.7);
    for (let i = 0; i < 6; i++) {
      this.effects.push({ type: 'spark', x: e.x, y: e.y - 8, a: Math.random() * 6.28, color: e.def.color, ttl: 0.4, max: 0.4 });
    }

    if (hero && this.heroes[hero.slot] === hero) {
      const def = HEROES[hero.type];
      const oldTier = tierOf(hero.kills);
      hero.kills++;
      def.skills.forEach((sk, i) => {
        if (sk.unlock === hero.kills && sk.unlock > 0) {
          this.notify(`${def.name} mở khóa [${SKILL_KEYS[i]}] ${sk.name}!`, '#9b59b6');
          this.effects.push({ type: 'ring', x: hero.x, y: hero.y - 20, r: 50, color: '#9b59b6', ttl: 0.6, max: 0.6 });
        }
      });
      if (tierOf(hero.kills) > oldTier) {
        this.notify(`${def.name} tiến hóa lên ${'★'.repeat(tierOf(hero.kills))}!`, '#f1c40f');
        this.effects.push({ type: 'ring', x: hero.x, y: hero.y - 20, r: 60, color: '#f1c40f', ttl: 0.8, max: 0.8 });
      }
    }

    // Kinh nghiệm cho các tướng đứng gần (như Dota), người hạ luôn được chia
    const near = this.heroes.filter((h) => h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= 230);
    if (hero && !hero.dead && this.heroes[hero.slot] === hero && !near.includes(hero)) near.push(hero);
    // mỗi tướng nhận một phần, giảm dần theo căn bậc hai số tướng cùng chia (tướng đứng sát nhau vẫn lên cấp đều)
    for (const h of near) this.gainXp(h, Math.round((e.def.xp * 1.3 * (e.elite ? 2 : 1)) / Math.sqrt(near.length)));

    // tách con khi chết (Bọ Phân Thân)
    if (e.def.split) {
      for (let i = 0; i < e.def.split.count; i++) this.spawn(e.def.split.type, Math.max(0, e.dist - 6 + i * 8));
      this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 30, color: e.def.color, ttl: 0.4, max: 0.4 });
    }

    if (e.def.boss) {
      this.bossesKilled++;
      this.inventory.push('phoenix_badge');
      this.notify(`Hạ ${e.def.name}! Nhận Huy Hiệu Phượng Hoàng`, '#f39c12');
      this.shake = Math.max(this.shake, 8);
      this.sparks(e.x, e.y - 20, '#f6c945', 24);
      this.events.push({ type: 'reward', options: this.bossRewards(e.type) });
    }
    if (Math.random() < e.def.drop * (e.elite ? 3 : 1)) {
      const id = rollItem(e.def.boss ? 'rare' : e.elite ? 'rare' : 'common');
      this.inventory.push(id);
      const it = ITEMS[id];
      this.notify(`Rơi đồ: ${it.name} (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
      this.text(e.x, e.y - 40, '🎁', '#fff', 1);
    }
  }

  // Ba lựa chọn thưởng sau khi hạ boss
  bossRewards(bossType) {
    const opts = [{ kind: 'item', id: ENEMIES[bossType].reward, title: 'Bảo vật Boss' }];
    opts.push({ kind: 'item', id: rollItem('epic'), title: 'Rương Huyền Thoại' });
    if (Math.random() < 0.5) {
      opts.push({ kind: 'treasure', gold: 200 + this.wave * 15, lives: 3, title: 'Kho Báu & Sửa Thành' });
    } else {
      opts.push({ kind: 'levelup', levels: 2, title: 'Thăng Cấp Toàn Quân' });
    }
    return opts;
  }

  claimReward(o) {
    if (o.kind === 'item') {
      this.inventory.push(o.id);
    } else if (o.kind === 'treasure') {
      this.gold += o.gold;
      this.lives += o.lives;
    } else if (o.kind === 'levelup') {
      for (const h of this.heroes) {
        if (!h) continue;
        const target = Math.min(CONFIG.maxLevel, h.level + o.levels);
        if (target > h.level) this.gainXp(h, xpForLevel(target) - h.xp);
      }
    }
  }

  text(x, y, str, color, ttl, size) {
    this.effects.push({ type: 'text', x, y, str: String(str), color, ttl, max: ttl, vy: -40, size: size || 15 });
  }
}
