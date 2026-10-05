'use strict';

// ============================================================
//  LOGIC GAME: đợt quái, tướng tấn công, cấp & thuộc tính,
//  kỹ năng, boss, cửa hàng & ghép đồ, rơi đồ
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
  for (const sk of def.skills) {
    if (h.kills >= sk.unlock && sk.apply) sk.apply(s, h.kills - sk.unlock);
  }
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
  s.damage *= 1 + s.bonusDmgPct / 100;
  s.cooldown = s.baseCooldown / Math.max(0.2, 1 + s.haste / 100);
  return s;
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
    GEAR_SLOTS.includes(ITEMS[id].slot) && order.indexOf(ITEMS[id].rarity) >= min);
  const total = pool.reduce((a, id) => a + RARITY[ITEMS[id].rarity].weight, 0);
  let r = Math.random() * total;
  for (const id of pool) {
    r -= RARITY[ITEMS[id].rarity].weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1];
}

// --- Kỹ năng chủ động. Trả về true nếu đã dùng (để tính hồi chiêu)
const SKILL_CASTS = {
  judgement(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'bolt', x: e.x, y: e.y, ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#f1c40f' });
    return true;
  },
  arrowrain(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'rain', x, y, r: 90, ttl: 0.6, max: 0.6 });
    for (const e of game.enemiesInRange(x, y, 90)) {
      game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { color: '#2ecc71' });
    }
    return true;
  },
  meteor(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({
      type: 'meteor', x, y, ttl: 0.7, max: 0.7,
      onEnd: () => {
        game.effects.push({ type: 'ring', x, y, r: 110, color: '#e67e22', ttl: 0.5, max: 0.5 });
        for (const e of game.enemiesInRange(x, y, 110)) {
          game.hit(e, (st.damage * 5 + n * 2) * st.skillPower, h, { big: true, color: '#e67e22' });
        }
      },
    });
    return true;
  },
  hook(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 1.8);
    if (!e) return false;
    game.effects.push({ type: 'line', x: h.x, y: h.y - 20, x2: e.x, y2: e.y - 8, color: '#8d6e63', w: 3, ttl: 0.35, max: 0.35 });
    if (!e.def.boss) {
      e.dist = Math.max(0, e.dist - 120);
      const p = PATH.at(e.dist);
      e.x = p.x; e.y = p.y;
    }
    game.hit(e, (40 + n * 1.5) * st.skillPower, h, { big: true, color: '#d7a985' });
    return true;
  },
  devour(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (!list.length) return false;
    const normal = list.filter((e) => !e.def.boss);
    game.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 60, color: '#8bc34a', ttl: 0.5, max: 0.5 });
    if (normal.length) {
      const e = normal.reduce((a, b) => (b.hp > a.hp ? b : a));
      game.text(e.x, e.y - 30, 'NUỐT!', '#8bc34a', 0.9);
      game.hit(e, e.hp + 1, h, {});
    } else {
      game.hit(list[0], (st.damage * 6 + n * 2) * st.skillPower, h, { big: true, color: '#8bc34a' });
    }
    return true;
  },
  shadowstep(game, h, st) {
    const e = game.findTarget(h.x, h.y, st.range * 2);
    if (!e) return false;
    game.effects.push({ type: 'line', x: h.x, y: h.y - 20, x2: e.x, y2: e.y - 8, color: '#9b59b6', w: 5, ttl: 0.3, max: 0.3 });
    game.hit(e, st.damage * 2 * st.skillPower, h, { st, big: true, color: '#c39bd3' });
    return true;
  },
  assassinate(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 2.5);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'line', x: h.x, y: h.y - 20, x2: e.x, y2: e.y - 8, color: '#e74c3c', w: 4, ttl: 0.4, max: 0.4 });
    game.effects.push({ type: 'ring', x: e.x, y: e.y - 8, r: 30, color: '#e74c3c', ttl: 0.4, max: 0.4 });
    game.hit(e, (st.damage * 6 + n * 3) * st.skillPower, h, { big: true, color: '#e74c3c' });
    return true;
  },
  nova(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'ring', x, y, r: 80, color: '#aee9ff', ttl: 0.45, max: 0.45 });
    for (const e of game.enemiesInRange(x, y, 80)) {
      game.hit(e, (60 + n) * st.skillPower, h, { color: '#aee9ff' });
      if (!e.dead) { e.slowT = 2.5; e.slowPct = Math.max(e.slowPct, 60); }
    }
    return true;
  },
  blizzard(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range);
    if (!list.length) return false;
    game.effects.push({ type: 'snow', x: h.x, y: h.y, r: st.range, ttl: 1.2, max: 1.2 });
    for (const e of list) {
      e.stunT = e.def.boss ? 1 : 2;
      game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { color: '#aee9ff' });
    }
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
    this.bossesKilled = 0;
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
      dead: false, respawnT: 0, stunT: 0, hp: 0,
      equip: { weapon: null, helmet: null, armor: null, acc1: null, acc2: null, acc3: null },
      skillCd: {},
    };
    h.hp = heroStats(h).hpMax;
    this.heroes[slot] = h;
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

  get boss() {
    return this.enemies.find((e) => e.def.boss && !e.dead) || null;
  }

  // ---------- vòng lặp
  update(dt) {
    if (this.over) return;
    this.time += dt;
    this.updateSpawns(dt);
    for (const e of this.enemies.slice()) this.updateEnemy(e, dt);
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

  spawn(type, dist) {
    const def = ENEMIES[type];
    const hp = def.hp * waveHpMult(this.wave) * (def.boss ? 1 + this.bossesKilled * 0.35 : 1);
    const p = PATH.at(dist);
    const e = {
      id: nextId++, type, def, hp, maxHp: hp, dist, x: p.x, y: p.y, dir: 1,
      slowT: 0, slowPct: 0, stunT: 0, poisonT: 0, poisonDps: 0, poisonBy: null, dotColor: '#2ecc71',
      atkCd: 1, slamCd: 4, summonCd: 6, dead: false,
    };
    this.enemies.push(e);
    return e;
  }

  updateSpawns(dt) {
    if (!this.spawnQueue.length) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const next = this.spawnQueue.shift();
    this.spawnTimer = next.gap;
    const e = this.spawn(next.type, 0);
    if (e.def.boss) this.events.push({ type: 'boss', name: e.def.name });
  }

  updateEnemy(e, dt) {
    if (e.dead) return;
    const d = e.def;
    if (e.slowT > 0) e.slowT -= dt;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.hit(e, e.poisonDps * dt, e.poisonBy, { silent: true });
      if (e.dead) return;
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
    // boss: dậm đất làm choáng tướng + gọi quái con
    if (d.slam) {
      e.slamCd -= dt;
      if (e.slamCd <= 0 && this.nearestHero(e.x, e.y, d.slam.range)) {
        e.slamCd = d.slam.cd;
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: d.slam.range, color: '#e67e22', ttl: 0.6, max: 0.6 });
        for (const h of this.heroes) {
          if (!h || h.dead || Math.hypot(h.x - e.x, h.y - e.y) > d.slam.range) continue;
          h.stunT = d.slam.stun;
          this.damageHero(h, d.slam.dmg * (1 + this.wave * 0.06));
        }
      }
      e.summonCd -= dt;
      if (e.summonCd <= 0) {
        e.summonCd = d.summon.cd;
        for (let i = 0; i < d.summon.count; i++) this.spawn(d.summon.type, Math.max(0, e.dist - 10 - i * 18));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#8e44ad', ttl: 0.4, max: 0.4 });
      }
    }

    if (e.stunT > 0) { e.stunT -= dt; return; }
    const speed = d.speed * (e.slowT > 0 ? 1 - e.slowPct / 100 : 1);
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
    h.swing = Math.max(0, h.swing - dt * 4);
    for (const sk of def.skills) {
      if (sk.active && h.kills >= sk.unlock) h.skillCd[sk.id] = (h.skillCd[sk.id] || 0) - dt;
    }
    if (h.stunT > 0) { h.stunT -= dt; return; }
    h.cd -= dt;

    // hào quang gây sát thương (Mùi Hôi Thối)
    if (st.stench) {
      for (const e of this.enemiesInRange(h.x, h.y, 95)) this.hit(e, st.stench * dt, h, { silent: true });
    }

    for (const sk of def.skills) {
      if (!sk.active || h.kills < sk.unlock || h.skillCd[sk.id] > 0) continue;
      if (SKILL_CASTS[sk.active.cast](this, h, st, h.kills - sk.unlock)) {
        h.skillCd[sk.id] = sk.active.cooldown * (1 - st.cdr / 100);
        h.swing = 1;
        this.text(h.x, h.y - 62, sk.name + '!', '#fff', 1);
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
        p.ty = p.target.y - (p.kind === 'evil' ? 20 : 8);
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
        if (st.poison > 0) this.dot(p.target, st.poison, hero, '#2ecc71');
        if (st.slow > 0) { p.target.slowT = 1.5; p.target.slowPct = st.slow; }
      } else {
        this.effects.push({ type: 'ring', x: p.tx, y: p.ty, r: st.splash, color: '#e67e22', ttl: 0.3, max: 0.3 });
        for (const e of this.enemiesInRange(p.tx, p.ty, Math.max(st.splash, 14))) {
          this.hit(e, st.damage, hero, { st });
          if (!e.dead && st.poison > 0) this.dot(e, st.poison, hero, '#e67e22');
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  dot(e, dps, hero, color) {
    e.poisonT = 3;
    e.poisonDps = dps;
    e.poisonBy = hero;
    e.dotColor = color;
  }

  updateEffects(dt) {
    for (const f of this.effects.slice()) {
      f.ttl -= dt;
      if (f.vy) f.y += f.vy * dt;
      if (f.ttl <= 0 && f.onEnd) { f.onEnd(); f.onEnd = null; }
    }
    this.effects = this.effects.filter((f) => f.ttl > 0);
  }

  // ---------- sát thương & hạ gục
  hit(e, amount, hero, o = {}) {
    if (e.dead) return;
    let dmg = amount;
    if (o.st && Math.random() * 100 < o.st.crit) {
      dmg *= o.st.critMult || 2;
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

    // Kinh nghiệm chia đều cho các tướng đứng gần (như Dota), người hạ luôn được chia
    const near = this.heroes.filter((h) => h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= 230);
    if (hero && !hero.dead && this.heroes[hero.slot] === hero && !near.includes(hero)) near.push(hero);
    for (const h of near) this.gainXp(h, Math.round((e.def.xp * 1.5) / near.length));

    if (e.def.boss) {
      this.bossesKilled++;
      this.inventory.push('phoenix_badge');
      this.notify(`Hạ ${e.def.name}! Nhận Huy Hiệu Phượng Hoàng`, '#f39c12');
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
