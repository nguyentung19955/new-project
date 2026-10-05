'use strict';

// ============================================================
//  GIAO DIỆN: HUD, bảng chọn tướng, bảng tướng (đồ + kỹ năng), túi đồ
// ============================================================

const $ = (s) => document.querySelector(s);

const WEAPON_ICON = { knight: '⚔️', archer: '🏹', mage: '🪄' };
const SLOT_ICON = { helmet: '⛑️', armor: '🛡️' };

function itemIcon(id) {
  const it = ITEMS[id];
  return it.slot === 'weapon' ? WEAPON_ICON[it.for] : SLOT_ICON[it.slot];
}

function statText(stats) {
  return Object.entries(stats)
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${STAT_NAMES[k] || k}`)
    .join(', ');
}

function itemCard(id, attrs = '', extra = '') {
  const it = ITEMS[id];
  const r = RARITY[it.rarity];
  const forTxt = it.for ? ` · ${HEROES[it.for].name}` : '';
  const setTxt = it.set ? `<div class="set">${SETS[it.set].name}</div>` : '';
  return `<div class="item" style="--rc:${r.color}" ${attrs}>
    <div class="icon">${itemIcon(id)}</div>
    <div class="meta"><b style="color:${r.color}">${it.name}</b>
      <small>${SLOT_NAMES[it.slot]}${forTxt}</small>
      <small>${statText(it.stats)}</small>${setTxt}${extra}</div>
  </div>`;
}

class UI {
  constructor(game) {
    this.game = game;
    this.sheet = null;       // { kind: 'build'|'hero'|'bag', slot }
    this.previewCanvas = null;
    this.sig = {};
    this.refreshTimer = 0;

    $('#btn-wave').onclick = () => game.startWave();
    $('#btn-speed').onclick = () => {
      game.speed = game.speed === 1 ? 2 : game.speed === 2 ? 3 : 1;
      $('#btn-speed').textContent = 'x' + game.speed;
    };
    $('#btn-pause').onclick = () => {
      game.paused = !game.paused;
      $('#btn-pause').textContent = game.paused ? '▶' : '⏸';
    };
    $('#btn-chest').onclick = () => {
      const id = game.buyChest();
      if (!id) return this.toast('Không đủ vàng!', '#e74c3c');
      const it = ITEMS[id];
      this.toast(`Mở rương: ${it.name} (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
    };
    $('#btn-bag').onclick = () => this.open({ kind: 'bag' });
    $('#btn-restart').onclick = () => {
      game.reset();
      this.close();
      $('#overlay').classList.add('hidden');
    };
    $('#sheet').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-act]');
      if (el) this.action(el.dataset);
    });
    $('#btn-chest').innerHTML = `🎁 Rương ${CONFIG.chestCost}💰`;
  }

  // ---------- chạm vào bản đồ
  tapMap(x, y) {
    const slot = CONFIG.slots.findIndex(([sx, sy]) => Math.hypot(sx - x, sy - (y + 12)) < 34);
    if (slot < 0) return this.close();
    this.open({ kind: this.game.heroes[slot] ? 'hero' : 'build', slot });
  }

  open(sheet) {
    this.sheet = sheet;
    this.sig = {};
    $('#sheet').classList.remove('hidden');
    const body = $('#sheet-body');
    if (sheet.kind === 'hero') {
      body.innerHTML = `
        <div class="hero-head">
          <canvas id="preview" width="240" height="240"></canvas>
          <div id="hs-info"></div>
        </div>
        <div id="hs-skills"></div>
        <div id="hs-equip"></div>`;
      this.previewCanvas = $('#preview');
    } else {
      this.previewCanvas = null;
      body.innerHTML = '<div id="sheet-dyn"></div>';
    }
    this.refresh(true);
  }

  close() {
    this.sheet = null;
    this.previewCanvas = null;
    $('#sheet').classList.add('hidden');
  }

  action(d) {
    const g = this.game;
    const h = this.sheet && this.sheet.kind === 'hero' ? g.heroes[this.sheet.slot] : null;
    switch (d.act) {
      case 'build':
        if (g.placeHero(this.sheet.slot, d.type)) this.open({ kind: 'hero', slot: this.sheet.slot });
        else this.toast('Không đủ vàng!', '#e74c3c');
        break;
      case 'equip': {
        const it = ITEMS[g.inventory[+d.idx]];
        if (h && g.equip(h, +d.idx)) this.toast(`${HEROES[h.type].name} mặc ${it.name}`, RARITY[it.rarity].color);
        break;
      }
      case 'unequip':
        if (h) g.unequip(h, d.slot);
        break;
      case 'close':
        return this.close();
      case 'sell':
        g.sellHero(this.sheet.slot);
        this.close();
        break;
    }
    this.refresh(true);
  }

  toast(msg, color = '#fff') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderColor = color;
    el.innerHTML = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 2600);
  }

  // ---------- cập nhật mỗi khung hình
  tick(dt) {
    const g = this.game;
    $('#lives').textContent = g.lives;
    $('#gold').textContent = g.gold;
    $('#wave').textContent = g.wave;
    $('#bag-count').textContent = g.inventory.length;
    const bw = $('#btn-wave');
    bw.disabled = g.waveActive;
    bw.textContent = g.waveActive ? `Đợt ${g.wave}...` : `▶ Đợt ${g.wave + 1}`;
    if (g.over && $('#overlay').classList.contains('hidden')) {
      $('#final-wave').textContent = g.wave;
      $('#overlay').classList.remove('hidden');
    }

    this.refreshTimer -= dt;
    if (this.refreshTimer <= 0) {
      this.refreshTimer = 0.25;
      this.refresh(false);
    }

    if (this.previewCanvas && this.sheet) {
      const h = g.heroes[this.sheet.slot];
      if (!h) return this.close();
      const ctx = this.previewCanvas.getContext('2d');
      ctx.clearRect(0, 0, 240, 240);
      const grd = ctx.createRadialGradient(120, 150, 10, 120, 150, 120);
      grd.addColorStop(0, '#3d5a40');
      grd.addColorStop(1, '#1b2a1d');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 240, 240);
      drawHero(ctx, computeLook(h.type, h.equip, h.kills), 120, 200, {
        t: performance.now() / 1000, dir: 1, scale: 2.4, swing: h.swing,
      });
    }
  }

  // Chỉ dựng lại phần DOM nào có dữ liệu thay đổi (tránh mất thao tác chạm)
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
      $('#sheet-dyn').innerHTML = `<h3>Chọn tướng</h3><div class="build-list">${
        Object.entries(HEROES).map(([type, def]) => `
          <div class="hero-card ${g.gold < def.cost ? 'disabled' : ''}" data-act="build" data-type="${type}">
            <canvas data-hero="${type}" width="90" height="100"></canvas>
            <div><b>${def.name}</b> <span class="cost">${def.cost}💰</span>
            <small>${def.desc}</small>
            <small class="dim">${def.skills.map((k) => k.name + (k.unlock ? ` (${k.unlock}☠)` : '')).join(' · ')}</small></div>
          </div>`).join('')
      }</div>`;
      document.querySelectorAll('canvas[data-hero]').forEach((c) => {
        drawHero(c.getContext('2d'), computeLook(c.dataset.hero, {}, 0), 45, 90, { scale: 1.6 });
      });
      return;
    }

    if (s.kind === 'bag') {
      if (!this.changed('bag', g.inventory.join())) return;
      $('#sheet-dyn').innerHTML = `<h3>Túi đồ (${g.inventory.length})</h3>
        <p class="dim">Chạm vào một tướng trên bản đồ để mặc đồ. Mặc đồ sẽ thay đổi hình dạng tướng!
        Mặc đủ 3 món <b style="color:#2ecc71">Bộ Rồng</b> để mọc cánh.</p>
        <div class="items">${g.inventory.map((id) => itemCard(id)).join('') || '<p class="dim">Trống</p>'}</div>`;
      return;
    }

    // --- bảng tướng
    const h = g.heroes[s.slot];
    if (!h) return;
    const def = HEROES[h.type];
    const st = heroStats(h);
    const tier = tierOf(h.kills);
    const nextTier = CONFIG.tiers[tier + 1];

    if (this.changed('info', `${h.kills}|${h.equip.weapon}|${h.equip.helmet}|${h.equip.armor}`)) {
      const sets = activeSets(h.equip).map((k) => `<div class="set">✦ ${SETS[k].name}: ${SETS[k].desc}</div>`).join('');
      $('#hs-info').innerHTML = `
        <button class="close" data-act="close">✕</button>
        <h3>${def.name} <span class="stars">${'★'.repeat(tier)}</span></h3>
        <div>☠ Đã hạ: <b>${h.kills}</b></div>
        ${nextTier ? `<div class="dim">Tiến hóa tiếp ở ${nextTier} mạng</div>` : '<div class="dim">Đã tiến hóa tối đa</div>'}
        <div class="stats">
          <span>⚔ ${st.damage.toFixed(1)}</span>
          <span>🎯 ${Math.round(st.range)}</span>
          <span>⏱ ${(1 / st.cooldown).toFixed(2)}/s</span>
          <span>💥 ${st.crit}%</span>
        </div>${sets}
        <button class="danger" data-act="sell">Bán (+${Math.floor(def.cost * CONFIG.sellRatio)}💰)</button>`;

      $('#hs-skills').innerHTML = `<h4>Kỹ năng (lớn dần theo số quái tiêu diệt)</h4>` +
        def.skills.map((sk) => {
          const on = h.kills >= sk.unlock;
          const pct = on ? 100 : Math.floor((h.kills / sk.unlock) * 100);
          return `<div class="skill ${on ? 'on' : ''}">
            <div><b>${sk.name}</b> ${sk.active ? '<span class="tag">Chủ động</span>' : '<span class="tag">Nội tại</span>'}
              ${on ? '' : `<span class="dim">— cần ${sk.unlock} mạng</span>`}</div>
            <small>${sk.info(Math.max(0, h.kills - sk.unlock))}</small>
            ${on ? '' : `<div class="bar"><i style="width:${pct}%"></i></div>`}
          </div>`;
        }).join('');
    }

    if (this.changed('equip', `${h.equip.weapon}|${h.equip.helmet}|${h.equip.armor}|${g.inventory.join()}`)) {
      const slots = SLOTS.map((slot) => {
        const id = h.equip[slot];
        return id
          ? itemCard(id, `data-act="unequip" data-slot="${slot}"`, '<small class="dim">Chạm để tháo</small>')
          : `<div class="item empty"><div class="icon">${slot === 'weapon' ? WEAPON_ICON[h.type] : SLOT_ICON[slot]}</div>
             <div class="meta"><small>${SLOT_NAMES[slot]}: trống</small></div></div>`;
      }).join('');
      const inv = g.inventory
        .map((id, i) => ({ id, i }))
        .filter(({ id }) => canEquip(h.type, id))
        .map(({ id, i }) => itemCard(id, `data-act="equip" data-idx="${i}"`))
        .join('');
      $('#hs-equip').innerHTML = `
        <h4>Trang bị đang mặc</h4><div class="items">${slots}</div>
        <h4>Túi đồ — chạm để mặc</h4><div class="items">${inv || '<p class="dim">Không có đồ phù hợp. Mở rương hoặc diệt quái để nhặt đồ.</p>'}</div>`;
    }
  }
}
