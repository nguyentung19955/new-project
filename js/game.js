'use strict';

// ============================================================
//  LOGIC GAME: đợt quái, tướng tấn công, kỹ năng, rơi đồ
// ============================================================

let nextId = 1;

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
      const k = Math.min(1, (d - s.start) / s.len);
      return { x: s.ax + (s.bx - s.ax) * k, y: s.ay + (s.by - s.ay) * k, dx: s.bx - s.ax };
    },
  };
})();

// --- Chỉ số cuối cùng của tướng = gốc + kỹ năng (theo số mạng) + đồ + set
function heroStats(h) {
  const def = HEROES[h.type];
  const s = {
    damage: def.base.damage, range: def.base.range, baseCooldown: def.base.cooldown,
    haste: 0, crit: 5, cleave: 0, arrows: 1, poison: 0, splash: def.base.splash || 0,
    slow: 0, bonusDmgPct: 0,
  };
  for (const sk of def.skills) {
    if (h.kills >= sk.unlock && sk.apply) sk.apply(s, h.kills - sk.unlock);
  }
  for (const slot of SLOTS) {
    const it = ITEMS[h.equip[slot]];
    if (it) for (const k in it.stats) s[k] += it.stats[k];
  }
  for (const set of activeSets(h.equip)) SETS[set].apply(s);
  s.damage *= 1 + s.bonusDmgPct / 100;
  s.cooldown = s.baseCooldown / Math.max(0.2, 1 + s.haste / 100);
  return s;
}

function canEquip(heroType, itemId) {
  const it = ITEMS[itemId];
  return it && (!it.for || it.for === heroType);
}

function rollItem(minRarity) {
  const order = Object.keys(RARITY);
  const min = order.indexOf(minRarity || 'common');
  const pool = Object.keys(ITEMS).filter((id) => order.indexOf(ITEMS[id].rarity) >= min);
  const total = pool.reduce((a, id) => a + RARITY[ITEMS[id].rarity].weight, 0);
  let r = Math.random() * total;
  for (const id of pool) {
    r -= RARITY[ITEMS[id].rarity].weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1];
}

// --- Kỹ năng chủ động
const SKILL_CASTS = {
  judgement(game, h, st, n) {
    const inRange = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!inRange.length) return false;
    const e = inRange.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'bolt', x: e.x, y: e.y, ttl: 0.35, max: 0.35 });
    game.hit(e, st.damage * 4 + n * 2, h, { big: true, color: '#f1c40f' });
    return true;
  },
  arrowrain(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'rain', x, y, r: 90, ttl: 0.6, max: 0.6 });
    for (const e of game.enemiesInRange(x, y, 90)) {
      game.hit(e, st.damage * 2 + n * 0.5, h, { color: '#2ecc71' });
    }
    return true;
  },
  meteor(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!target) return false;
    game.effects.push({
      type: 'meteor', x: target.x, y: target.y, ttl: 0.7, max: 0.7,
      onEnd: () => {
        game.effects.push({ type: 'ring', x: target.x, y: target.y, r: 110, color: '#e67e22', ttl: 0.5, max: 0.5 });
        for (const e of game.enemiesInRange(target.x, target.y, 110)) {
          game.hit(e, st.damage * 5 + n * 2, h, { big: true, color: '#e67e22' });
        }
      },
    });
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
    this.flags = { equipped: false };
    // Đồ khởi đầu để thử ngay việc thay đổi hình dạng
    this.inventory = ['leather_cap', 'leather_armor', 'iron_sword', 'hunter_bow', 'oak_staff'];
  }

  // ---------- hành động của người chơi
  placeHero(slot, type) {
    const def = HEROES[type];
    if (this.heroes[slot] || this.gold < def.cost) return false;
    this.gold -= def.cost;
    const [x, y] = CONFIG.slots[slot];
    this.heroes[slot] = {
      id: nextId++, type, slot, x, y, kills: 0, cd: 0, swing: 0, dir: 1,
      equip: { weapon: null, helmet: null, armor: null }, skillCd: {},
    };
    this.effects.push({ type: 'ring', x, y: y - 15, r: 40, color: '#fff', ttl: 0.4, max: 0.4 });
    return true;
  }

  sellHero(slot) {
    const h = this.heroes[slot];
    if (!h) return;
    for (const s of SLOTS) if (h.equip[s]) this.inventory.push(h.equip[s]);
    this.gold += Math.floor(HEROES[h.type].cost * CONFIG.sellRatio);
    this.heroes[slot] = null;
  }

  equip(h, invIndex) {
    const id = this.inventory[invIndex];
    if (!canEquip(h.type, id)) return false;
    const slot = ITEMS[id].slot;
    this.inventory.splice(invIndex, 1);
    if (h.equip[slot]) this.inventory.push(h.equip[slot]);
    h.equip[slot] = id;
    this.flags.equipped = true;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 35, color: RARITY[ITEMS[id].rarity].color, ttl: 0.5, max: 0.5 });
    return true;
  }

  unequip(h, slot) {
    if (!h.equip[slot]) return;
    this.inventory.push(h.equip[slot]);
    h.equip[slot] = null;
  }

  buyChest() {
    if (this.gold < CONFIG.chestCost) return null;
    this.gold -= CONFIG.chestCost;
    const id = rollItem();
    this.inventory.push(id);
    return id;
  }

  startWave() {
    if (this.waveActive || this.over) return;
    this.wave++;
    this.spawnQueue = buildWave(this.wave);
    this.spawnTimer = 0;
    this.waveActive = true;
  }

  // ---------- truy vấn
  enemiesInRange(x, y, r) {
    return this.enemies.filter((e) => !e.dead && Math.hypot(e.x - x, e.y - y) <= r);
  }

  // Ưu tiên quái đi xa nhất (gần lâu đài nhất)
  findTarget(x, y, r) {
    let best = null;
    for (const e of this.enemies) {
      if (e.dead || Math.hypot(e.x - x, e.y - y) > r) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    return best;
  }

  // ---------- vòng lặp
  update(dt) {
    if (this.over) return;
    this.time += dt;
    this.updateSpawns(dt);
    for (const e of this.enemies) this.updateEnemy(e, dt);
    for (const h of this.heroes) if (h) this.updateHero(h, dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.enemies = this.enemies.filter((e) => !e.dead);

    if (this.waveActive && !this.spawnQueue.length && !this.enemies.length) {
      this.waveActive = false;
      const bonus = 20 + this.wave * 5;
      this.gold += bonus;
      this.notify(`Hoàn thành đợt ${this.wave}! +${bonus}💰`, '#f1c40f');
    }
  }

  updateSpawns(dt) {
    if (!this.spawnQueue.length) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const next = this.spawnQueue.shift();
    this.spawnTimer = next.gap;
    const def = ENEMIES[next.type];
    const hp = def.hp * waveHpMult(this.wave);
    const p = PATH.at(0);
    this.enemies.push({
      id: nextId++, type: next.type, def, hp, maxHp: hp, dist: 0, x: p.x, y: p.y, dir: 1,
      slowT: 0, slowPct: 0, poisonT: 0, poisonDps: 0, poisonBy: null, dead: false,
    });
    if (def.boss) this.notify(`⚠️ ${def.name} xuất hiện!`, '#e74c3c');
  }

  updateEnemy(e, dt) {
    if (e.dead) return;
    if (e.slowT > 0) e.slowT -= dt;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.hit(e, e.poisonDps * dt, e.poisonBy, { silent: true });
      if (e.dead) return;
    }
    const speed = e.def.speed * (e.slowT > 0 ? 1 - e.slowPct / 100 : 1);
    e.dist += speed * dt;
    if (e.dist >= PATH.total) {
      e.dead = true;
      this.lives -= e.def.lives || 1;
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

  updateHero(h, dt) {
    const def = HEROES[h.type];
    const st = heroStats(h);
    h.swing = Math.max(0, h.swing - dt * 4);
    h.cd -= dt;

    for (const sk of def.skills) {
      if (!sk.active || h.kills < sk.unlock) continue;
      h.skillCd[sk.id] = (h.skillCd[sk.id] || 0) - dt;
      if (h.skillCd[sk.id] <= 0 && SKILL_CASTS[sk.active.cast](this, h, st, h.kills - sk.unlock)) {
        h.skillCd[sk.id] = sk.active.cooldown;
        h.swing = 1;
        this.text(h.x, h.y - 60, sk.name + '!', '#fff', 1);
      }
    }

    const target = this.findTarget(h.x, h.y, st.range);
    if (!target) return;
    h.dir = target.x >= h.x ? 1 : -1;
    if (h.cd > 0) return;
    h.cd = st.cooldown;
    h.swing = 1;

    if (def.attack === 'melee') {
      this.effects.push({ type: 'slash', x: target.x, y: target.y - 10, dir: h.dir, ttl: 0.2, max: 0.2 });
      this.hit(target, st.damage, h, { st });
      if (st.cleave > 0) {
        for (const e of this.enemiesInRange(h.x, h.y, st.range)) {
          if (e !== target) this.hit(e, st.damage * st.cleave, h, { st });
        }
      }
    } else if (def.attack === 'arrow') {
      const targets = this.enemies
        .filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
        .sort((a, b) => b.dist - a.dist)
        .slice(0, st.arrows);
      for (const e of targets) this.shoot(h, e, 'arrow', 520, st);
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
      if (!p.target.dead) { p.tx = p.target.x; p.ty = p.target.y - 8; }
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
      if (p.kind === 'arrow') {
        if (p.target.dead) continue;
        this.hit(p.target, st.damage, hero, { st });
        if (st.poison > 0 && !p.target.dead) {
          p.target.poisonT = 3;
          p.target.poisonDps = st.poison;
          p.target.poisonBy = hero;
        }
      } else {
        this.effects.push({ type: 'ring', x: p.tx, y: p.ty, r: st.splash, color: st.slow ? '#74b9ff' : '#e67e22', ttl: 0.3, max: 0.3 });
        for (const e of this.enemiesInRange(p.tx, p.ty, Math.max(st.splash, 14))) {
          this.hit(e, st.damage, hero, { st });
          if (st.slow > 0 && !e.dead) { e.slowT = 1.5; e.slowPct = st.slow; }
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  updateEffects(dt) {
    for (const f of this.effects) {
      f.ttl -= dt;
      if (f.vy) f.y += f.vy * dt;
      if (f.ttl <= 0 && f.onEnd) f.onEnd();
    }
    this.effects = this.effects.filter((f) => f.ttl > 0);
  }

  // ---------- sát thương & hạ gục
  hit(e, amount, hero, o = {}) {
    if (e.dead) return;
    let dmg = amount;
    if (o.st && Math.random() * 100 < o.st.crit) {
      dmg *= 2;
      this.text(e.x, e.y - 30, Math.round(dmg) + '!', '#f1c40f', 0.7);
    } else if (o.big) {
      this.text(e.x, e.y - 30, Math.round(dmg), o.color || '#fff', 0.8);
    }
    e.hp -= dmg;
    if (e.hp <= 0) this.kill(e, hero);
  }

  kill(e, hero) {
    e.dead = true;
    const gold = Math.round(e.def.gold * (1 + this.wave * 0.04));
    this.gold += gold;
    this.text(e.x, e.y - 20, '+' + gold, '#f1c40f', 0.7);
    for (let i = 0; i < 6; i++) {
      this.effects.push({ type: 'spark', x: e.x, y: e.y - 8, a: Math.random() * 6.28, color: e.def.color, ttl: 0.4, max: 0.4 });
    }

    if (hero && this.heroes[hero.slot] === hero) {
      const def = HEROES[hero.type];
      const oldTier = tierOf(hero.kills);
      hero.kills++;
      for (const sk of def.skills) {
        if (sk.unlock === hero.kills && sk.unlock > 0) {
          this.notify(`${def.name} mở khóa kỹ năng: ${sk.name}!`, '#9b59b6');
          this.effects.push({ type: 'ring', x: hero.x, y: hero.y - 20, r: 50, color: '#9b59b6', ttl: 0.6, max: 0.6 });
        }
      }
      if (tierOf(hero.kills) > oldTier) {
        this.notify(`${def.name} tiến hóa lên ${'★'.repeat(tierOf(hero.kills))}!`, '#f1c40f');
        this.effects.push({ type: 'ring', x: hero.x, y: hero.y - 20, r: 60, color: '#f1c40f', ttl: 0.8, max: 0.8 });
      }
    }

    if (Math.random() < e.def.drop) {
      const id = rollItem(e.def.boss ? 'rare' : 'common');
      this.inventory.push(id);
      const it = ITEMS[id];
      this.notify(`Rơi đồ: ${it.name} (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
      this.text(e.x, e.y - 40, '🎁', '#fff', 1);
    }
  }

  text(x, y, str, color, ttl) {
    this.effects.push({ type: 'text', x, y, str: String(str), color, ttl, max: ttl, vy: -40 });
  }
}
