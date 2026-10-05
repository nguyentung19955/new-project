'use strict';

// ============================================================
//  GIAO DIỆN: menu, HUD, gợi ý người mới, chọn tướng,
//  bảng tướng kiểu Dota (chân dung, QWER, 6 ô đồ), cửa hàng, túi đồ
// ============================================================

const $ = (s) => document.querySelector(s);

const WCLASS_ICON = { blade: '⚔️', bow: '🏹', staff: '🪄' };
const SLOT_ICON = { helmet: '⛑️', armor: '🛡️', acc: '💍' };

// Bộ đồ mẫu cho màn hình bắt đầu (theo loại vũ khí)
const SHOWCASE = [
  { kills: 0, blade: {}, bow: {}, staff: {} },
  { kills: 30,
    blade: { helmet: 'iron_helm', armor: 'chain_mail', weapon: 'iron_sword' },
    bow: { helmet: 'leather_cap', armor: 'leather_armor', weapon: 'elven_bow' },
    staff: { helmet: 'arcane_hat', armor: 'mage_robe', weapon: 'crystal_staff' } },
  { kills: 80,
    blade: { helmet: 'horned_helm', armor: 'royal_plate', weapon: 'flame_blade' },
    bow: { helmet: 'iron_helm', armor: 'chain_mail', weapon: 'storm_bow', acc1: 'twin_fury' },
    staff: { helmet: 'horned_helm', armor: 'mage_robe', weapon: 'void_staff', acc1: 'time_rod' } },
  { kills: 160,
    blade: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_blade' },
    bow: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_bow' },
    staff: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_staff' } },
];
const LINEUPS = [['archer', 'knight', 'mage'], ['assassin', 'butcher', 'frost']];

function itemIcon(id) {
  const it = ITEMS[id];
  if (it.icon) return it.icon;
  return it.slot === 'weapon' ? WCLASS_ICON[it.wclass] : SLOT_ICON[it.slot];
}

function statText(stats) {
  return Object.entries(stats)
    .map(([k, v]) => k === 'cleave' ? `Chém lan ${Math.round(v * 100)}%` : `${v > 0 ? '+' : ''}${v} ${STAT_NAMES[k] || k}`)
    .join(' · ');
}

function itemCard(id, attrs = '', hint = '', extra = '') {
  const it = ITEMS[id];
  const r = RARITY[it.rarity];
  const sub = it.slot === 'weapon' ? `Vũ khí ${WCLASS_NAMES[it.wclass].toLowerCase()}` : SLOT_NAMES[it.slot];
  const setTxt = it.set ? `<span class="set">${SETS[it.set].name}</span>` : '';
  const tag = attrs ? 'button' : 'div';
  return `<${tag} class="item" style="--rc:${r.color}" ${attrs}>
    <span class="icon">${itemIcon(id)}</span>
    <span class="meta"><b style="color:${r.color}">${it.name}</b>
      <small>${sub}${it.desc ? ' · ' + it.desc : ''}</small>
      <small>${statText(it.stats)}</small>${setTxt}${extra}${hint ? `<small class="act-hint">${hint}</small>` : ''}</span>
  </${tag}>`;
}

function attrBadge(attr) {
  return `<span class="attr-dot" style="--ac:${ATTRS[attr].color}" title="${ATTRS[attr].name}"></span>`;
}

function loadBest() {
  try { return +localStorage.getItem('tt_best') || 0; } catch (e) { return 0; }
}
function saveBest(n) {
  try { localStorage.setItem('tt_best', String(n)); } catch (e) { /* bỏ qua */ }
}

class UI {
  constructor(game) {
    this.game = game;
    this.sheet = null;        // { kind: 'hero'|'bag'|'shop', slot }
    this.skillSel = 0;
    this.shopTab = 'basic';
    this.sellArmed = false;
    this.previewCanvas = null;
    this.sig = {};
    this.refreshTimer = 0;
    this.scale = 1;
    this.best = loadBest();
    this.coachSlot = -1;
    this.bannerT = 0;
    this.pickSlot = -1;

    $('#btn-play').onclick = () => this.startGame();
    $('#btn-howto').onclick = () => { $('#howto').hidden = false; };
    $('#btn-howto-close').onclick = () => { $('#howto').hidden = true; };
    $('#btn-restart').onclick = () => {
      game.reset();
      this.close();
      $('#overlay').hidden = true;
      game.started = true;
    };
    $('#btn-wave').onclick = () => game.startWave();
    $('#btn-speed').onclick = () => {
      game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 3 : 1;
      $('#btn-speed').textContent = 'x' + game.speed;
    };
    $('#btn-pause').onclick = () => {
      game.paused = !game.paused;
      $('#btn-pause').textContent = game.paused ? '▶' : '❚❚';
    };
    $('#btn-shop').onclick = () => {
      game.flags.shopOpened = true;
      this.toggle({ kind: 'shop' });
    };
    $('#btn-bag').onclick = () => this.toggle({ kind: 'bag' });
    $('#picker').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-type]');
      if (el) this.pick(el.dataset.type);
    });
    $('#sheet').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-act]');
      if (el && !el.disabled) this.action(el.dataset);
    });
    this.showMenu();
  }

  showMenu() {
    $('#menu').hidden = false;
    document.querySelectorAll('.ingame').forEach((el) => (el.hidden = true));
    $('#best').textContent = this.best ? `Kỷ lục của bạn: đợt ${this.best}` : '';
  }

  startGame() {
    $('#menu').hidden = true;
    document.querySelectorAll('.ingame').forEach((el) => (el.hidden = false));
    this.game.started = true;
  }

  // ---------- chạm vào bản đồ
  // Vị trí gần điểm chạm nhất: ô có tướng thì tính theo thân tướng,
  // ô trống thì bắt dính khi chạm vào bãi cỏ quanh đó
  slotAt(x, y) {
    let best = -1, bd = Infinity;
    CONFIG.slots.forEach(([sx, sy], i) => {
      const h = this.game.heroes[i];
      const d = h ? Math.hypot(sx - x, sy - 20 - y) : Math.hypot(sx - x, sy - y);
      if (d < (h ? 28 : 38) && d < bd) { bd = d; best = i; }
    });
    return best;
  }

  tapMap(x, y) {
    if (!this.game.started) return;
    const slot = this.slotAt(x, y);
    if (slot < 0 || slot === this.pickSlot) { this.closePicker(); return this.close(); }
    if (this.game.heroes[slot]) {
      this.closePicker();
      if (this.sheet && this.sheet.slot === slot) return this.close();
      return this.open({ kind: 'hero', slot });
    }
    this.close();
    this.openPicker(slot);
  }

  // Bảng chọn tướng nhỏ gọn hiện ngay tại chỗ chạm
  openPicker(slot) {
    this.pickSlot = slot;
    const el = $('#picker');
    el.innerHTML = Object.entries(HEROES).map(([type, def]) => `
      <button class="pk" data-type="${type}" style="--ac:${ATTRS[def.attr].color}" aria-label="${def.name}">
        <canvas width="72" height="72"></canvas>
        <span class="pk-name">${def.name}</span>
        <span class="pk-cost">${def.cost}</span>
      </button>`).join('');
    el.querySelectorAll('.pk').forEach((b) => {
      const look = computeLook(b.dataset.type, {}, 0);
      drawHero(b.querySelector('canvas').getContext('2d'), look, 36, 66, { scale: 1.15 / look.bulk, t: 1 });
    });
    el.hidden = false;
    this.updatePicker();
    // đặt bảng ngay trên ô (không đủ chỗ thì đặt dưới), không tràn ra ngoài màn hình
    const [x, y] = CONFIG.slots[slot];
    const W = $('#wrap').clientWidth, H = $('#wrap').clientHeight;
    const w = el.offsetWidth, h = el.offsetHeight;
    let top = y * this.scale - h - 14 * this.scale;
    if (top < 50 * this.scale) top = y * this.scale + 14 * this.scale;
    top = Math.min(top, H - h - 80 * this.scale);
    const left = Math.max(6, Math.min(W - w - 6, x * this.scale - w / 2));
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  updatePicker() {
    if (this.pickSlot < 0) return;
    $('#picker').querySelectorAll('.pk').forEach((b) => {
      b.classList.toggle('poor', this.game.gold < HEROES[b.dataset.type].cost);
    });
  }

  closePicker() {
    this.pickSlot = -1;
    $('#picker').hidden = true;
  }

  pick(type) {
    const g = this.game;
    const slot = this.pickSlot;
    if (slot < 0) return;
    if (!g.placeHero(slot, type)) return this.toast(`Cần ${HEROES[type].cost} vàng`, '#e58b74');
    this.closePicker();
    this.toast(`${HEROES[type].name} đã vào vị trí`, '#7cc45f');
    if (g.heroes.filter(Boolean).length === 2 && !g.flags.dragTip) {
      g.flags.dragTip = true;
      setTimeout(() => this.toast('Mẹo: giữ và kéo tướng sang chỗ khác để đổi vị trí', '#9dffc4'), 900);
    }
  }

  toggle(sheet) {
    if (this.sheet && this.sheet.kind === sheet.kind) this.close();
    else this.open(sheet);
  }

  open(sheet) {
    this.closePicker();
    this.sheet = sheet;
    this.sellArmed = false;
    this.sig = {};
    $('#sheet').hidden = false;
    const body = $('#sheet-body');
    if (sheet.kind === 'hero') {
      const h = this.game.heroes[sheet.slot];
      const def = HEROES[h.type];
      this.skillSel = def.skills.reduce((a, sk, i) => (h.kills >= sk.unlock ? i : a), 0);
      body.innerHTML = `
        <div class="hero-head">
          <div class="portrait" style="--ac:${ATTRS[def.attr].color}">
            <canvas id="preview" width="240" height="240"></canvas>
            <span class="lv" id="hs-lv"></span>
            <span class="dead-tag" id="hs-dead" hidden></span>
          </div>
          <div class="hero-main">
            <div class="sheet-head">${attrBadge(def.attr)}<h3 id="hs-name"></h3>
              <button class="x" data-act="close" aria-label="Đóng">✕</button></div>
            <div class="vbar hp"><i id="hp-fill"></i><span id="hp-text"></span></div>
            <div class="vbar xp"><i id="xp-fill"></i><span id="xp-text"></span></div>
            <div class="attrs" id="hs-attrs"></div>
          </div>
        </div>
        <div class="chips" id="hs-chips"></div>
        <div class="skillbar" id="hs-skills"></div>
        <div class="skilldesc" id="hs-desc"></div>
        <h4>Đồ đang mặc <span class="dim">· chạm để tháo</span></h4>
        <div class="slots6" id="hs-slots"></div>
        <h4>Túi đồ <span class="dim">· chạm để mặc</span></h4>
        <div class="items" id="hs-bag"></div>
        <div class="hero-foot">
          <div class="evo" id="hs-evo"></div>
          <button class="danger-link" id="hs-sell" data-act="sell"></button>
        </div>`;
      this.previewCanvas = $('#preview');
    } else {
      this.previewCanvas = null;
      body.innerHTML = '<div id="sheet-dyn"></div>';
    }
    $('.sheet-inner').scrollTop = 0;
    this.refresh(true);
    this.tickLive();
  }

  close() {
    this.sheet = null;
    this.previewCanvas = null;
    $('#sheet').hidden = true;
  }

  action(d) {
    const g = this.game;
    const h = this.sheet && this.sheet.kind === 'hero' ? g.heroes[this.sheet.slot] : null;
    switch (d.act) {
      case 'close':
        return this.close();
      case 'skill':
        this.skillSel = +d.i;
        break;
      case 'equip': {
        const it = ITEMS[g.inventory[+d.idx]];
        const res = h && g.equip(h, +d.idx);
        if (res === true) this.toast(`${HEROES[h.type].name} mặc <b>${it.name}</b>`, RARITY[it.rarity].color);
        else if (res) this.toast(res, '#e58b74');
        break;
      }
      case 'unequip':
        if (h) g.unequip(h, d.slot);
        break;
      case 'sell':
        if (!this.sellArmed) {
          this.sellArmed = true;
        } else {
          g.sellHero(this.sheet.slot);
          this.close();
          return;
        }
        break;
      case 'shoptab':
        this.shopTab = d.tab;
        break;
      case 'buy': {
        const it = ITEMS[d.id];
        if (g.buy(d.id)) this.toast(`Đã mua <b>${it.name}</b>. Chạm vào tướng để mặc`, '#7cc45f');
        else this.toast(`Cần ${it.price} vàng`, '#e58b74');
        break;
      }
      case 'craft': {
        const it = ITEMS[d.id];
        if (g.craft(d.id)) this.toast(`Ghép thành công <b>${it.name}</b>!`, RARITY[it.rarity].color);
        break;
      }
      case 'chest': {
        const id = g.buyChest();
        if (!id) { this.toast(`Cần ${CONFIG.chestCost} vàng để mở rương`, '#e58b74'); break; }
        const it = ITEMS[id];
        this.toast(`Mở rương được <b>${it.name}</b> (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
        break;
      }
    }
    this.refresh(true);
  }

  toast(msg, color = '#d4a752') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color;
    el.innerHTML = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 2600);
  }

  // ---------- cập nhật mỗi khung hình
  tick(dt) {
    const g = this.game;
    if (!$('#menu').hidden) this.drawMenuArt();

    $('#lives').textContent = g.lives;
    $('#gold').textContent = g.gold;
    $('#wave').textContent = g.wave;
    $('#bag-count').textContent = g.inventory.length;
    $('#paused-tag').hidden = !(g.started && g.paused);

    const bw = $('#btn-wave');
    bw.disabled = g.waveActive;
    if (g.waveActive) {
      $('#wave-label').textContent = `Đợt ${g.wave}`;
      $('#wave-sub').textContent = `Còn ${g.spawnQueue.length + g.enemies.length} quái`;
    } else {
      $('#wave-label').textContent = `Gọi đợt ${g.wave + 1}`;
      $('#wave-sub').textContent = (g.wave + 1) % 5 === 0 ? 'Boss Thạch Long!' : `Qua đợt +${25 + g.wave * 5} vàng`;
    }

    // thanh máu boss + biển báo boss xuất hiện
    const boss = g.boss;
    $('#bossbar').hidden = !boss;
    $('#toasts').classList.toggle('below-boss', !!boss);
    if (boss) {
      $('#boss-name').textContent = boss.def.name;
      $('#boss-hp').textContent = `${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`;
      $('#boss-fill').style.width = (Math.max(0, boss.hp / boss.maxHp) * 100) + '%';
    }
    while (g.events.length) {
      const ev = g.events.shift();
      if (ev.type === 'boss') {
        $('#banner-text').textContent = ev.name;
        $('#banner').hidden = false;
        this.bannerT = 2.6;
      }
    }
    if (this.bannerT > 0) {
      this.bannerT -= dt;
      if (this.bannerT <= 0) $('#banner').hidden = true;
    }

    if (g.over && $('#overlay').hidden) {
      if (g.wave > this.best) { this.best = g.wave; saveBest(g.wave); }
      $('#final-wave').textContent = g.wave;
      $('#final-best').textContent = `Kỷ lục: đợt ${this.best}`;
      $('#overlay').hidden = false;
      this.close();
    }

    this.updateCoach();
    this.updatePicker();
    if (g.over) this.closePicker();

    this.refreshTimer -= dt;
    if (this.refreshTimer <= 0) {
      this.refreshTimer = 0.25;
      this.refresh(false);
    }
    this.tickLive();
  }

  // Phần cập nhật liên tục của bảng tướng: máu, kinh nghiệm, hồi chiêu, chân dung
  tickLive() {
    if (!this.sheet || this.sheet.kind !== 'hero') return;
    const g = this.game;
    const h = g.heroes[this.sheet.slot];
    if (!h) return this.close();
    const def = HEROES[h.type];
    const st = heroStats(h);

    $('#hp-fill').style.width = (h.hp / st.hpMax) * 100 + '%';
    $('#hp-text').textContent = `${Math.ceil(h.hp)} / ${st.hpMax}`;
    const lo = xpForLevel(h.level), hi = xpForLevel(h.level + 1);
    const maxed = h.level >= CONFIG.maxLevel;
    $('#xp-fill').style.width = (maxed ? 100 : ((h.xp - lo) / (hi - lo)) * 100) + '%';
    $('#xp-text').textContent = maxed ? 'Cấp tối đa' : `KN ${h.xp - lo} / ${hi - lo}`;
    $('#hs-lv').textContent = h.level;
    const dead = $('#hs-dead');
    dead.hidden = !h.dead;
    if (h.dead) dead.textContent = `Hồi sinh ${Math.ceil(h.respawnT)}s`;

    def.skills.forEach((sk, i) => {
      const el = document.getElementById('cd-' + i);
      if (!el) return;
      const left = h.skillCd[sk.id] || 0;
      const total = sk.active.cooldown * (1 - st.cdr / 100);
      if (left > 0) {
        const pct = Math.min(100, (left / total) * 100);
        el.style.background = `conic-gradient(rgba(10,8,6,0.72) ${pct}%, transparent 0)`;
        el.textContent = Math.ceil(left);
      } else {
        el.style.background = 'none';
        el.textContent = '';
      }
    });

    const ctx = this.previewCanvas.getContext('2d');
    const grd = ctx.createRadialGradient(120, 160, 10, 120, 150, 140);
    grd.addColorStop(0, h.dead ? '#3a3a3a' : '#4d6b3a');
    grd.addColorStop(1, '#1e2a17');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 240, 240);
    const look = computeLook(h.type, h.equip, h.kills);
    ctx.globalAlpha = h.dead ? 0.35 : 1;
    drawHero(ctx, look, 120, 222, {
      t: performance.now() / 1000, dir: 1, scale: 3 / ((1 + look.tier * 0.1) * look.bulk), swing: h.swing,
    });
    ctx.globalAlpha = 1;
  }

  drawMenuArt() {
    const c = $('#menu-art');
    const ctx = c.getContext('2d');
    const t = performance.now() / 1000;
    const g = ctx.createLinearGradient(0, 0, 0, 230);
    g.addColorStop(0, '#5b7fa6');
    g.addColorStop(0.55, '#a9c4d6');
    g.addColorStop(0.56, '#4f7f36');
    g.addColorStop(1, '#2f5222');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 480, 230);
    ctx.fillStyle = '#3d6a2c';
    ctx.beginPath();
    ctx.ellipse(240, 230, 300, 70, 0, Math.PI, 0);
    ctx.fill();
    const step = Math.floor(t / 2.2);
    const set = SHOWCASE[step % SHOWCASE.length];
    const lineup = LINEUPS[Math.floor(step / SHOWCASE.length) % LINEUPS.length];
    lineup.forEach((type, i) => {
      const x = 105 + i * 135;
      drawHero(ctx, computeLook(type, set[HEROES[type].wclass], set.kills), x, 205 - (i === 1 ? 6 : 0), {
        t: t + i, dir: i === 2 ? -1 : 1, scale: 1.75,
      });
    });
  }

  // Gợi ý từng bước cho người mới
  updateCoach() {
    const g = this.game;
    const coach = $('#coach');
    const bw = $('#btn-wave');
    let pos = null, text = '';
    this.coachSlot = -1;
    bw.classList.remove('pulse');

    if (g.started && !g.over && !this.sheet && this.pickSlot < 0) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length) {
        this.coachSlot = CONFIG.coachSlot;
        const [x, y] = CONFIG.slots[CONFIG.coachSlot];
        pos = [x, y - 22];
        text = 'Chạm vào bãi cỏ cạnh đường để đặt tướng';
      } else if (g.wave === 0 && !g.waveActive) {
        bw.classList.add('pulse');
        pos = [CONFIG.W - 105, CONFIG.H - 92];
        text = 'Bấm để gọi quái tới!';
      } else if (g.wave >= 1 && !g.waveActive && !g.flags.equipped) {
        const h = heroes.find((hh) => g.inventory.some((id) => canEquip(hh.type, id)));
        if (h) {
          pos = [h.x, h.y - 62];
          text = 'Chạm vào tướng để mặc đồ. Tướng sẽ đổi dáng!';
        }
      } else if (g.wave >= 2 && !g.waveActive && !g.flags.shopOpened && g.gold >= 100) {
        pos = [88, CONFIG.H - 92];
        text = 'Mua và ghép đồ ở Cửa hàng';
      }
    }
    coach.hidden = !pos;
    if (pos) {
      if ($('#coach-text').textContent !== text) $('#coach-text').textContent = text;
      // giữ bóng chữ trong màn hình (đo chiều rộng thật)
      const half = coach.offsetWidth / 2 + 6;
      const W = $('#wrap').clientWidth;
      const x = Math.max(half, Math.min(W - half, pos[0] * this.scale));
      coach.style.left = x + 'px';
      coach.style.top = Math.max(115, pos[1]) * this.scale + 'px';
    }
  }

  // Chỉ dựng lại phần DOM có dữ liệu thay đổi (tránh mất thao tác chạm)
  changed(key, value) {
    if (this.sig[key] === value) return false;
    this.sig[key] = value;
    return true;
  }

  refresh(force) {
    if (!this.sheet) return;
    if (force) this.sig = {};
    const kind = this.sheet.kind;
    if (kind === 'bag') this.renderBag();
    else if (kind === 'shop') this.renderShop();
    else this.renderHero();
  }

  renderBag() {
    const g = this.game;
    if (!this.changed('bag', g.inventory.join())) return;
    $('#sheet-dyn').innerHTML = `
      <div class="sheet-head"><h3>Túi đồ <span class="dim">(${g.inventory.length})</span></h3>
        <button class="x" data-act="close" aria-label="Đóng">✕</button></div>
      <p class="dim">Chạm vào một tướng trên bản đồ để mặc đồ. Mua thêm và ghép đồ ở Cửa hàng.</p>
      <div class="items">${g.inventory.map((id) => itemCard(id)).join('') || '<p class="dim">Túi đang trống. Diệt quái hoặc ghé Cửa hàng để có đồ.</p>'}</div>`;
  }

  renderShop() {
    const g = this.game;
    if (!this.changed('shop', `${g.inventory.join()}|${this.shopTab}`)) {
      $('#shop-gold').textContent = g.gold + ' 💰';
      document.querySelectorAll('[data-act=buy]').forEach((b) => { b.disabled = g.gold < ITEMS[b.dataset.id].price; });
      document.querySelectorAll('[data-act=craft]').forEach((b) => {
        const ok = !g.missingParts(b.dataset.id).length && g.gold >= ITEMS[b.dataset.id].recipe.cost;
        b.disabled = !ok;
        b.textContent = ok ? 'Ghép đồ' : 'Chưa đủ nguyên liệu';
      });
      document.querySelectorAll('[data-act=chest]').forEach((b) => { b.disabled = g.gold < CONFIG.chestCost; });
      document.querySelectorAll('.part.gold').forEach((el) => el.classList.toggle('has', g.gold >= +el.dataset.cost));
      return;
    }
    const tabs = [['basic', 'Cơ bản'], ['recipe', 'Ghép đồ'], ['chest', 'Rương']]
      .map(([k, n]) => `<button data-act="shoptab" data-tab="${k}" class="${this.shopTab === k ? 'on' : ''}">${n}</button>`).join('');
    let body = '';
    if (this.shopTab === 'basic') {
      body = `<div class="items">${Object.keys(ITEMS).filter((id) => ITEMS[id].price).map((id) => {
        const it = ITEMS[id];
        return itemCard(id, '', '', `<button class="buy go" data-act="buy" data-id="${id}" ${g.gold < it.price ? 'disabled' : ''}>${it.price} 💰</button>`);
      }).join('')}</div>`;
    } else if (this.shopTab === 'recipe') {
      body = `<p class="dim">Gom đủ nguyên liệu trong túi rồi trả thêm vàng để ghép. Đồ ghép cho tướng hào quang riêng.</p>
        <div class="recipes">${Object.keys(ITEMS).filter((id) => ITEMS[id].recipe).map((id) => {
          const it = ITEMS[id];
          const missing = g.missingParts(id).slice();
          const ok = !missing.length && g.gold >= it.recipe.cost;
          const parts = it.recipe.parts.map((p) => {
            const i = missing.indexOf(p);
            const has = i < 0;
            if (!has) missing.splice(i, 1);
            return `<span class="part ${has ? 'has' : ''}">${ITEMS[p].icon} ${ITEMS[p].name}</span>`;
          }).join('<span class="plus">+</span>');
          return `<div class="recipe" style="--rc:${RARITY[it.rarity].color}">
            <div class="recipe-top"><span class="icon">${it.icon}</span>
              <span class="meta"><b style="color:${RARITY[it.rarity].color}">${it.name}</b><small>${statText(it.stats)}</small></span></div>
            <div class="parts">${parts}<span class="plus">+</span><span class="part gold ${g.gold >= it.recipe.cost ? 'has' : ''}" data-cost="${it.recipe.cost}">${it.recipe.cost} 💰</span></div>
            <button class="go" data-act="craft" data-id="${id}" ${ok ? '' : 'disabled'}>${ok ? 'Ghép đồ' : 'Chưa đủ nguyên liệu'}</button>
          </div>`;
        }).join('')}</div>`;
    } else {
      const odds = Object.values(RARITY);
      const total = odds.reduce((a, r) => a + r.weight, 0);
      body = `<div class="chest-card">
        <div class="chest-ico">🎁</div>
        <p>Rương chứa ngẫu nhiên một món <b>vũ khí, mũ hoặc giáp</b>. Mặc vào là tướng đổi dáng.</p>
        <div class="odds">${odds.map((r) => `<span style="color:${r.color}">${r.name} ${Math.round((r.weight / total) * 100)}%</span>`).join('')}</div>
        <button class="go big" data-act="chest" ${g.gold < CONFIG.chestCost ? 'disabled' : ''}>Mở rương · ${CONFIG.chestCost} 💰</button>
      </div>`;
    }
    $('#sheet-dyn').innerHTML = `
      <div class="sheet-head"><h3>Cửa hàng</h3><span class="gold-chip" id="shop-gold">${g.gold} 💰</span>
        <button class="x" data-act="close" aria-label="Đóng">✕</button></div>
      <div class="tabs">${tabs}</div>${body}`;
  }

  renderHero() {
    const g = this.game;
    const h = g.heroes[this.sheet.slot];
    if (!h) return;
    const def = HEROES[h.type];
    const st = heroStats(h);
    const tier = tierOf(h.kills);
    const eqSig = SLOTS.map((s) => h.equip[s]).join('|');

    if (this.changed('stats', `${h.kills}|${h.level}|${eqSig}`)) {
      $('#hs-name').innerHTML = `${def.name} <span class="stars">${'★'.repeat(tier)}</span>`;
      const base = heroAttrs(h);
      $('#hs-attrs').innerHTML = Object.keys(ATTRS).map((a) => {
        const bonus = Math.round(st[a] - base[a]);
        return `<span class="attr ${a === def.attr ? 'main' : ''}" style="--ac:${ATTRS[a].color}">
          <i>${ATTRS[a].short}</i><b>${Math.round(base[a])}</b>${bonus ? `<em>+${bonus}</em>` : ''}</span>`;
      }).join('');
      const sets = activeSets(h.equip).map((k) => `<span class="set">✦ ${SETS[k].name}: ${SETS[k].desc}</span>`).join('');
      $('#hs-chips').innerHTML = `
        <span class="chip"><i>Sát thương</i> ${st.damage.toFixed(0)}</span>
        <span class="chip"><i>Đánh/giây</i> ${(1 / st.cooldown).toFixed(2)}</span>
        <span class="chip"><i>Tầm</i> ${Math.round(st.range)}</span>
        <span class="chip"><i>Chí mạng</i> ${Math.round(st.crit)}%</span>
        <span class="chip"><i>Đã hạ</i> ${h.kills}</span>
        <span class="chip"><i>Giảm hồi chiêu</i> ${Math.round(st.cdr)}%</span>${sets}`;
    }

    const unlocked = def.skills.filter((sk) => h.kills >= sk.unlock).length;
    if (this.changed('skills', `${unlocked}|${this.skillSel}`)) {
      const color = ATTRS[def.attr].color;
      $('#hs-skills').innerHTML = def.skills.map((sk, i) => {
        const on = h.kills >= sk.unlock;
        return `<button class="skbtn ${on ? 'on' : ''} ${i === this.skillSel ? 'sel' : ''}" data-act="skill" data-i="${i}" style="--ac:${color}">
          <span class="glyph">${sk.icon}</span><span class="key">${SKILL_KEYS[i]}</span>
          ${on ? (sk.active ? `<i class="cd" id="cd-${i}"></i>` : '') : `<span class="lock">${sk.unlock}☠</span>`}
        </button>`;
      }).join('');
    }
    if (this.changed('desc', `${h.kills}|${this.skillSel}|${Math.round(st.cdr)}`)) {
      const sk = def.skills[this.skillSel];
      const on = h.kills >= sk.unlock;
      const cd = sk.active ? ` · hồi ${(sk.active.cooldown * (1 - st.cdr / 100)).toFixed(1)}s` : '';
      $('#hs-desc').innerHTML = `
        <div><b>[${SKILL_KEYS[this.skillSel]}] ${sk.name}</b><span class="tag ${sk.active ? 'act' : ''}">${sk.active ? 'Chủ động' + cd : 'Nội tại'}</span></div>
        <small>${on ? sk.info(h.kills - sk.unlock) : `Mở khóa khi hạ ${sk.unlock} quái (còn ${sk.unlock - h.kills}). ${sk.info(0)}`}</small>
        ${on ? '' : `<div class="bar"><i style="width:${Math.floor((h.kills / sk.unlock) * 100)}%"></i></div>`}`;
    }

    if (this.changed('slots', eqSig)) {
      $('#hs-slots').innerHTML = SLOTS.map((slot) => {
        const id = h.equip[slot];
        const label = SLOT_NAMES[slot];
        if (!id) {
          const ico = slot === 'weapon' ? WCLASS_ICON[def.wclass] : SLOT_ICON[slot.indexOf('acc') === 0 ? 'acc' : slot];
          return `<div class="slot empty"><span>${ico}</span><small>${label}</small></div>`;
        }
        const it = ITEMS[id];
        return `<button class="slot" style="--rc:${RARITY[it.rarity].color}" data-act="unequip" data-slot="${slot}">
          <span>${itemIcon(id)}</span><small>${it.name}</small></button>`;
      }).join('');
    }

    if (this.changed('bag', `${eqSig}|${g.inventory.join()}`)) {
      const inv = g.inventory
        .map((id, i) => ({ id, i }))
        .filter(({ id }) => canEquip(h.type, id))
        .map(({ id, i }) => itemCard(id, `data-act="equip" data-idx="${i}"`))
        .join('');
      $('#hs-bag').innerHTML = inv || '<p class="dim">Chưa có đồ hợp với tướng này. Ghé Cửa hàng hoặc diệt quái để có thêm.</p>';
    }

    if (this.changed('evo', h.kills)) {
      const cur = CONFIG.tiers[tier], next = CONFIG.tiers[tier + 1];
      $('#hs-evo').innerHTML = `<span>${next ? `Tiến hóa ${'★'.repeat(tier + 1)} khi hạ ${next} quái` : 'Đã tiến hóa tối đa'}</span>
          <div class="bar"><i style="width:${next ? ((h.kills - cur) / (next - cur)) * 100 : 100}%"></i></div>`;
    }
    if (this.changed('sell', this.sellArmed)) {
      const refund = Math.floor(def.cost * CONFIG.sellRatio);
      $('#hs-sell').className = `danger-link ${this.sellArmed ? 'confirm' : ''}`;
      $('#hs-sell').textContent = this.sellArmed ? `Chạm lần nữa để bán (+${refund}💰)` : `Bán tướng (+${refund}💰)`;
    }
  }
}
