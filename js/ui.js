'use strict';

// ============================================================
//  GIAO DIỆN: menu, HUD, gợi ý người mới, bảng chọn tướng,
//  bảng tướng (trang bị + kỹ năng), túi đồ
// ============================================================

const $ = (s) => document.querySelector(s);

const WEAPON_ICON = { knight: '⚔️', archer: '🏹', mage: '🪄' };
const SLOT_ICON = { helmet: '⛑️', armor: '🛡️' };
const ROLE = { knight: 'Cận chiến', archer: 'Tầm xa', mage: 'Phép nổ lan' };

// Bộ đồ mẫu để màn hình bắt đầu khoe việc mặc đồ đổi dáng
const SHOWCASE = [
  { knight: {}, archer: {}, mage: {}, kills: 0 },
  { knight: { helmet: 'iron_helm', armor: 'chain_mail', weapon: 'iron_sword' },
    archer: { helmet: 'leather_cap', armor: 'leather_armor', weapon: 'elven_bow' },
    mage: { helmet: 'arcane_hat', armor: 'mage_robe', weapon: 'crystal_staff' }, kills: 30 },
  { knight: { helmet: 'horned_helm', armor: 'royal_plate', weapon: 'flame_blade' },
    archer: { helmet: 'iron_helm', armor: 'chain_mail', weapon: 'storm_bow' },
    mage: { helmet: 'horned_helm', armor: 'mage_robe', weapon: 'void_staff' }, kills: 80 },
  { knight: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_blade' },
    archer: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_bow' },
    mage: { helmet: 'dragon_crown', armor: 'dragon_armor', weapon: 'dragon_staff' }, kills: 160 },
];

function itemIcon(id) {
  const it = ITEMS[id];
  return it.slot === 'weapon' ? WEAPON_ICON[it.for] : SLOT_ICON[it.slot];
}

function statText(stats) {
  return Object.entries(stats)
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${STAT_NAMES[k] || k}`)
    .join(' · ');
}

function itemCard(id, attrs = '', hint = '') {
  const it = ITEMS[id];
  const r = RARITY[it.rarity];
  const setTxt = it.set ? `<span class="set">${SETS[it.set].name}</span>` : '';
  const tag = attrs ? 'button' : 'div';
  return `<${tag} class="item" style="--rc:${r.color}" ${attrs}>
    <span class="icon">${itemIcon(id)}</span>
    <span class="meta"><b style="color:${r.color}">${it.name}</b>
      <small>${statText(it.stats)}</small>${setTxt}${hint ? `<small class="act-hint">${hint}</small>` : ''}</span>
  </${tag}>`;
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
    this.sheet = null;        // { kind: 'build'|'hero'|'bag', slot }
    this.tab = 'gear';
    this.sellArmed = false;
    this.previewCanvas = null;
    this.sig = {};
    this.refreshTimer = 0;
    this.scale = 1;
    this.best = loadBest();
    this.coachSlot = -1;

    $('#chest-cost').textContent = CONFIG.chestCost + '💰';
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
    $('#btn-chest').onclick = () => {
      const id = game.buyChest();
      if (!id) return this.toast(`Cần ${CONFIG.chestCost} vàng để mở rương`, '#e58b74');
      const it = ITEMS[id];
      this.toast(`Mở rương được <b>${it.name}</b> (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
    };
    $('#btn-bag').onclick = () => (this.sheet && this.sheet.kind === 'bag' ? this.close() : this.open({ kind: 'bag' }));
    $('#sheet').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-act]');
      if (el) this.action(el.dataset);
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
  tapMap(x, y) {
    if (!this.game.started) return;
    const slot = CONFIG.slots.findIndex(([sx, sy]) => Math.hypot(sx - x, sy - (y + 14)) < 38);
    if (slot < 0) return this.close();
    if (this.sheet && this.sheet.slot === slot) return this.close();
    this.open({ kind: this.game.heroes[slot] ? 'hero' : 'build', slot });
  }

  open(sheet) {
    this.sheet = sheet;
    this.sellArmed = false;
    this.sig = {};
    $('#sheet').hidden = false;
    const body = $('#sheet-body');
    if (sheet.kind === 'hero') {
      body.innerHTML = `
        <div class="hero-head">
          <canvas id="preview" width="240" height="240"></canvas>
          <div id="hs-info"></div>
        </div>
        <div class="tabs">
          <button data-act="tab" data-tab="gear" class="${this.tab === 'gear' ? 'on' : ''}">Trang bị</button>
          <button data-act="tab" data-tab="skills" class="${this.tab === 'skills' ? 'on' : ''}">Kỹ năng</button>
        </div>
        <div id="hs-tab"></div>`;
      this.previewCanvas = $('#preview');
    } else {
      this.previewCanvas = null;
      body.innerHTML = '<div id="sheet-dyn"></div>';
    }
    $('.sheet-inner').scrollTop = 0;
    this.refresh(true);
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
      case 'build':
        if (g.placeHero(this.sheet.slot, d.type)) {
          this.toast(`${HEROES[d.type].name} đã vào vị trí`, '#7cc45f');
          this.close();
        } else {
          this.toast(`Cần ${HEROES[d.type].cost} vàng`, '#e58b74');
        }
        return;
      case 'tab':
        this.tab = d.tab;
        document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === d.tab));
        break;
      case 'equip': {
        const it = ITEMS[g.inventory[+d.idx]];
        if (h && g.equip(h, +d.idx)) this.toast(`${HEROES[h.type].name} mặc <b>${it.name}</b>`, RARITY[it.rarity].color);
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
    $('#paused-tag').hidden = !(g.started && (g.paused || this.sheet));

    const bw = $('#btn-wave');
    bw.disabled = g.waveActive;
    if (g.waveActive) {
      $('#wave-label').textContent = `Đợt ${g.wave}`;
      $('#wave-sub').textContent = `Còn ${g.spawnQueue.length + g.enemies.length} quái`;
    } else {
      $('#wave-label').textContent = `Gọi đợt ${g.wave + 1}`;
      $('#wave-sub').textContent = (g.wave + 1) % 5 === 0 ? 'Có boss!' : `Qua đợt +${25 + g.wave * 5} vàng`;
    }

    if (g.over && $('#overlay').hidden) {
      if (g.wave > this.best) { this.best = g.wave; saveBest(g.wave); }
      $('#final-wave').textContent = g.wave;
      $('#final-best').textContent = `Kỷ lục: đợt ${this.best}`;
      $('#overlay').hidden = false;
      this.close();
    }

    this.updateCoach();

    this.refreshTimer -= dt;
    if (this.refreshTimer <= 0) {
      this.refreshTimer = 0.25;
      this.refresh(false);
    }

    if (this.previewCanvas && this.sheet) {
      const h = g.heroes[this.sheet.slot];
      if (!h) return this.close();
      const ctx = this.previewCanvas.getContext('2d');
      const grd = ctx.createRadialGradient(120, 160, 10, 120, 150, 140);
      grd.addColorStop(0, '#4d6b3a');
      grd.addColorStop(1, '#1e2a17');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 240, 240);
      const look = computeLook(h.type, h.equip, h.kills);
      drawHero(ctx, look, 120, 222, {
        t: performance.now() / 1000, dir: 1, scale: 3.1 / (1 + look.tier * 0.1), swing: h.swing,
      });
    }
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
    const stage = Math.floor(t / 2.2) % SHOWCASE.length;
    const set = SHOWCASE[stage];
    ['archer', 'knight', 'mage'].forEach((type, i) => {
      const x = 105 + i * 135;
      drawHero(ctx, computeLook(type, set[type], set.kills), x, 205 - (i === 1 ? 6 : 0), {
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

    if (g.started && !g.over && !this.sheet) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length) {
        this.coachSlot = 3;
        const [x, y] = CONFIG.slots[3];
        pos = [x, y - 22];
        text = 'Chạm vào bệ đá để đặt tướng';
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
      }
    }
    coach.hidden = !pos;
    if (pos) {
      coach.style.left = pos[0] * this.scale + 'px';
      coach.style.top = pos[1] * this.scale + 'px';
      if ($('#coach-text').textContent !== text) $('#coach-text').textContent = text;
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
    const g = this.game;
    const s = this.sheet;

    if (s.kind === 'build') {
      if (!this.changed('build', g.gold)) return;
      $('#sheet-dyn').innerHTML = `
        <div class="sheet-head"><h3>Chọn tướng</h3><button class="x" data-act="close" aria-label="Đóng">✕</button></div>
        <div class="build-list">${
          Object.entries(HEROES).map(([type, def]) => `
            <div class="hero-card ${g.gold < def.cost ? 'disabled' : ''}">
              <canvas data-hero="${type}" width="90" height="100"></canvas>
              <b>${def.name}</b>
              <span class="role">${ROLE[type]}</span>
              <button class="go" data-act="build" data-type="${type}">${def.cost} 💰</button>
            </div>`).join('')
        }</div>
        <p class="dim build-note">Tướng nào diệt quái nhiều sẽ mạnh lên và mở thêm kỹ năng.</p>`;
      document.querySelectorAll('canvas[data-hero]').forEach((c) => {
        drawHero(c.getContext('2d'), computeLook(c.dataset.hero, {}, 0), 45, 92, { scale: 1.55, t: 1 });
      });
      return;
    }

    if (s.kind === 'bag') {
      if (!this.changed('bag', g.inventory.join())) return;
      $('#sheet-dyn').innerHTML = `
        <div class="sheet-head"><h3>Túi đồ <span class="dim">(${g.inventory.length})</span></h3>
          <button class="x" data-act="close" aria-label="Đóng">✕</button></div>
        <p class="dim">Chạm vào một tướng trên bản đồ để mặc đồ. Đủ 3 món <span class="set">Bộ Rồng</span> thì tướng mọc cánh.</p>
        <div class="items">${g.inventory.map((id) => itemCard(id)).join('') || '<p class="dim">Túi đang trống. Diệt quái hoặc mở rương để có đồ.</p>'}</div>`;
      return;
    }

    // --- bảng tướng
    const h = g.heroes[s.slot];
    if (!h) return;
    const def = HEROES[h.type];
    const st = heroStats(h);
    const tier = tierOf(h.kills);
    const curTier = CONFIG.tiers[tier], nextTier = CONFIG.tiers[tier + 1];
    const eqSig = `${h.equip.weapon}|${h.equip.helmet}|${h.equip.armor}`;

    if (this.changed('info', `${h.kills}|${eqSig}|${this.sellArmed}`)) {
      const sets = activeSets(h.equip).map((k) => `<span class="set">✦ ${SETS[k].name}: ${SETS[k].desc}</span>`).join('');
      const pct = nextTier ? ((h.kills - curTier) / (nextTier - curTier)) * 100 : 100;
      const refund = Math.floor(def.cost * CONFIG.sellRatio);
      $('#hs-info').innerHTML = `
        <div class="sheet-head" style="margin:0"><h3>${def.name} <span class="stars">${'★'.repeat(tier)}</span></h3>
          <button class="x" data-act="close" aria-label="Đóng">✕</button></div>
        <div class="kills"><span>Đã hạ <b>${h.kills}</b> quái</span><span>${nextTier ? `tiến hóa ở ${nextTier}` : 'tiến hóa tối đa'}</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="chips">
          <span class="chip"><i>Sát thương</i> ${st.damage.toFixed(0)}</span>
          <span class="chip"><i>Tầm</i> ${Math.round(st.range)}</span>
          <span class="chip"><i>Đánh/giây</i> ${(1 / st.cooldown).toFixed(2)}</span>
          <span class="chip"><i>Chí mạng</i> ${st.crit}%</span>
        </div>${sets}
        <button class="danger-link ${this.sellArmed ? 'confirm' : ''}" data-act="sell">${this.sellArmed ? `Chạm lần nữa để bán (+${refund}💰)` : `Bán tướng (+${refund}💰)`}</button>`;
    }

    if (this.tab === 'skills' && this.changed('tab', `skills|${h.kills}`)) {
      $('#hs-tab').innerHTML = def.skills.map((sk) => {
        const on = h.kills >= sk.unlock;
        const pct = on ? 100 : Math.floor((h.kills / sk.unlock) * 100);
        return `<div class="skill ${on ? 'on' : ''}">
          <span class="lvl">${on ? '✓' : sk.unlock}</span>
          <div><b>${sk.name}</b><span class="tag ${sk.active ? 'act' : ''}">${sk.active ? 'Chủ động' : 'Nội tại'}</span></div>
          <small>${on ? sk.info(h.kills - sk.unlock) : `Mở khóa khi hạ ${sk.unlock} quái (còn ${sk.unlock - h.kills})`}</small>
          ${on ? '' : `<div class="bar"><i style="width:${pct}%"></i></div>`}
        </div>`;
      }).join('');
    }

    if (this.tab === 'gear' && this.changed('tab', `gear|${eqSig}|${g.inventory.join()}`)) {
      const slots = SLOTS.map((slot) => {
        const id = h.equip[slot];
        return id
          ? itemCard(id, `data-act="unequip" data-slot="${slot}"`, 'Chạm để tháo')
          : `<div class="item empty"><span class="icon">${slot === 'weapon' ? WEAPON_ICON[h.type] : SLOT_ICON[slot]}</span>
             <span class="meta"><small>${SLOT_NAMES[slot]}: trống</small></span></div>`;
      }).join('');
      const inv = g.inventory
        .map((id, i) => ({ id, i }))
        .filter(({ id }) => canEquip(h.type, id))
        .map(({ id, i }) => itemCard(id, `data-act="equip" data-idx="${i}"`, 'Chạm để mặc'))
        .join('');
      $('#hs-tab').innerHTML = `
        <h4>Đang mặc</h4><div class="items">${slots}</div>
        <h4>Trong túi</h4><div class="items">${inv || '<p class="dim">Chưa có đồ hợp với tướng này. Diệt quái hoặc mở rương để có thêm.</p>'}</div>`;
    }
  }
}
