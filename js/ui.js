'use strict';

// ============================================================
//  GIAO DIỆN theo bản thiết kế "Thủ Thành – Bộ giao diện gameplay":
//  1 · Gameplay HUD (thanh trên, đợt sắp tới, bản đồ nhỏ, thanh dưới)
//  2 · Cây kỹ năng  3 · Lò rèn  4 · Tiến hoá & Cây Sự Sống
//  5 · Bách khoa quái & lịch 30 đợt
// ============================================================

const $ = (s) => document.querySelector(s);

const WCLASS_ICON = { blade: '⚔️', bow: '🏹', staff: '🪄' };
const SLOT_ICON = { helmet: '⛑️', armor: '🛡️', acc: '💍' };
const BRANCH_COLORS = ['#4aa3ff', '#e0563a', '#7bd36a', '#f0c46a'];
const CLOSE_SVG = '<svg viewBox="0 0 16 16"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2.5"/></svg>';

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
const LINEUPS = [['archer', 'knight', 'mage', 'frost'], ['assassin', 'butcher', 'knight', 'archer']];

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

function itemCard(id, attrs = '', hint = '') {
  const it = ITEMS[id];
  const r = RARITY[it.rarity];
  const sub = it.slot === 'weapon' ? `Vũ khí ${WCLASS_NAMES[it.wclass].toLowerCase()}` : SLOT_NAMES[it.slot];
  const tag = attrs ? 'button' : 'div';
  return `<${tag} class="item" style="--rc:${r.color}" ${attrs}>
    <span class="icon">${itemIcon(id)}</span>
    <span class="meta"><b>${it.name}</b><small>${sub}${it.desc ? ' · ' + it.desc : ''}</small>
      <small>${statText(it.stats)}</small>${it.set ? `<small class="set">${SETS[it.set].name}</small>` : ''}${hint ? `<small class="hint">${hint}</small>` : ''}</span>
  </${tag}>`;
}

// Vẽ quái lên canvas nhỏ (dùng ở bảng đợt sắp tới, bách khoa)
function drawEnemyIcon(cv, type, box, unknown) {
  const def = ENEMIES[type];
  const c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height);
  c.save();
  c.translate(cv.width / 2, cv.height * 0.72);
  const s = (box / 2.6) / def.size;
  c.scale(s, s);
  if (unknown) c.filter = 'brightness(0)';
  drawEnemy(c, { x: 0, y: 0, def, type, id: 1, dir: 1, hp: 1, maxHp: 1, slowT: 0, stunT: 0, poisonT: 0, noBar: true }, 0);
  c.restore();
}

function drawTreeArt(c, stage, t) {
  const W = c.canvas.width, H = c.canvas.height;
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#1c2a1c';
  c.beginPath(); c.ellipse(W / 2, H - 10, W * 0.4, 9, 0, 0, Math.PI * 2); c.fill();
  const k = 0.45 + stage * 0.13;
  c.save();
  c.translate(W / 2, H - 10);
  c.scale(k, k);
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 12; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-4, 0); c.lineTo(-8, -70); c.quadraticCurveTo(-12, -95, -40, -105);
  c.moveTo(4, 0); c.lineTo(8, -80); c.quadraticCurveTo(12, -105, 42, -112);
  c.moveTo(0, -40); c.lineTo(0, -130);
  c.stroke();
  const leaf = ['#3e7a35', '#4f9a43', '#5fb050'];
  [[0, -140, 52], [-46, -112, 36], [44, -118, 38], [0, -168, 32]].forEach(([x, y, r], i) => {
    c.fillStyle = leaf[i % 3];
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  });
  if (stage >= 3) {
    for (const [x, y] of [[-24, -140], [30, -130], [6, -172], [-50, -110], [48, -112]].slice(0, stage)) {
      c.fillStyle = '#f0c46a';
      c.beginPath(); c.arc(x, y + Math.sin(t * 2 + x) * 2, 7, 0, Math.PI * 2); c.fill();
    }
  }
  if (stage >= 5) {
    c.strokeStyle = `rgba(157,255,196,${0.3 + Math.sin(t * 2) * 0.15})`;
    c.lineWidth = 6;
    c.beginPath(); c.arc(0, -135, 92, 0, Math.PI * 2); c.stroke();
  }
  c.restore();
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
    this.scale = 1;
    this.sel = -1;          // tướng đang chọn (ô)
    this.spot = -1;         // ô trống đang chọn để triệu hồi
    this.armed = null;      // loại tướng đã chọn sẵn ở bảng triệu hồi
    this.screen = null;     // { kind: 'hero'|'forge'|'codex'|'grow', ... }
    this.sig = {};
    this.refreshT = 0;
    this.best = loadBest();
    this.coachSlot = -1;
    this.sellArmed = false;
    this.rewardOpts = null;

    $('#btn-play').onclick = () => this.startGame();
    $('#btn-howto').onclick = () => { $('#howto').hidden = false; };
    $('#btn-howto-close').onclick = () => { $('#howto').hidden = true; };
    $('#btn-restart').onclick = () => this.restart();
    $('#btn-endless').onclick = () => {
      this.game.endless = true;
      this.game.running = true;
      $('#overlay').hidden = true;
    };
    $('#btn-run').onclick = () => { this.game.running = !this.game.running; };
    $('#btn-speed').onclick = () => {
      const g = this.game;
      g.speed = g.speed === 1 ? 2 : g.speed === 2 ? 3 : 1;
      $('#btn-speed').textContent = 'x' + g.speed;
    };
    $('#btn-early').onclick = () => {
      const g = this.game;
      if (g.wave === 0) { g.running = true; return; }
      const bonus = g.callEarly();
      g.running = true;
      if (bonus) this.toast(`Gọi sớm +${bonus}💰`, '#f0c46a');
    };
    $('#btn-codex').onclick = () => this.openScreen({ kind: 'codex' });
    $('#btn-forge').onclick = () => this.openScreen({ kind: 'forge', tab: 'recipe', recipe: null });
    $('#btn-tree').onclick = () => this.openScreen({ kind: 'grow', evo: this.sel });
    $('#wp-list').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-info]');
      if (!el) return;
      const d = ENEMIES[el.dataset.info];
      this.toast(`<b>${d.name}</b> · Giáp ${d.armor || 0} · Kháng phép ${d.mr || 0}%<br>${d.desc}`, d.boss ? '#e0563a' : '#b07bd9');
    });
    $('#build-grid').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-type]');
      if (el) this.pickBuild(el.dataset.type);
    });
    $('#bt-skills').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-skill]');
      if (el && this.sel >= 0) this.openScreen({ kind: 'hero', slot: this.sel, tab: 'skills', skill: +el.dataset.skill });
    });
    $('#bt-items').addEventListener('click', () => {
      if (this.sel >= 0) this.openScreen({ kind: 'hero', slot: this.sel, tab: 'equip' });
    });
    $('#bt-portrait').addEventListener('click', () => {
      if (this.sel >= 0) this.openScreen({ kind: 'hero', slot: this.sel, tab: 'skills' });
    });
    $('#screen').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-act]');
      if (el && !el.disabled) this.action(el.dataset);
    });
    $('#rw-list').addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-rw]');
      if (el) this.pickReward(+el.dataset.rw);
    });
    this.buildBuildGrid();
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

  restart() {
    const g = this.game;
    g.reset();
    g.started = true;
    g.running = false;
    this.sel = this.spot = -1;
    this.armed = null;
    this.sig = {};
    this.closeScreen();
    $('#overlay').hidden = true;
    $('#reward').hidden = true;
  }

  toast(msg, color = '#d9a441') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color;
    el.innerHTML = msg;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 2800);
  }

  // ---------- chạm vào bản đồ
  // Ô gần điểm chạm nhất: ô có tướng tính theo thân tướng, ô trống bắt dính quanh đó
  slotAt(x, y) {
    let best = -1, bd = Infinity;
    CONFIG.slots.forEach(([sx, sy], i) => {
      const h = this.game.heroes[i];
      const d = h ? Math.hypot(sx - x, sy - 26 - y) : Math.hypot(sx - x, sy - y);
      if (d < (h ? 34 : 34) && d < bd) { bd = d; best = i; }
    });
    return best;
  }

  tapMap(x, y) {
    const g = this.game;
    if (!g.started) return;
    const slot = this.slotAt(x, y);
    if (slot < 0) { this.sel = -1; this.spot = -1; return; }
    if (g.heroes[slot]) {
      this.sel = this.sel === slot ? -1 : slot;
      this.spot = -1;
      this.sellArmed = false;
      return;
    }
    if (this.armed) return this.place(this.armed, slot);
    this.spot = this.spot === slot ? -1 : slot;
  }

  pickBuild(type) {
    if (this.spot >= 0) return this.place(type, this.spot);
    this.armed = this.armed === type ? null : type;
    if (this.armed) this.toast(`Chạm vào chỗ trống để đặt ${HEROES[type].name}`, '#f0c46a');
  }

  place(type, slot) {
    const g = this.game;
    if (!g.placeHero(slot, type)) return this.toast(`Cần ${HEROES[type].cost} vàng`, '#e0563a');
    this.toast(`${HEROES[type].name} đã vào vị trí`, '#7bd36a');
    this.spot = -1;
    this.armed = null;
    this.sel = slot;
    if (g.heroes.filter(Boolean).length === 2 && !g.flags.dragTip) {
      g.flags.dragTip = true;
      setTimeout(() => this.toast('Mẹo: giữ và kéo tướng sang chỗ khác để đổi vị trí', '#9dffc4'), 900);
    }
  }

  // ---------- cập nhật mỗi khung hình
  tick(dt) {
    const g = this.game;
    if (!$('#menu').hidden) this.drawMenuArt();
    this.handleEvents();
    if (!g.started) return;
    this.updateTopbar();
    this.updateWavePanel();
    this.updateBoss();
    this.updateBottom();
    this.updateBuildGrid();
    this.drawMinimap();
    this.updateCoach();

    if (g.over && $('#overlay').hidden) {
      if (g.wave > this.best) { this.best = g.wave; saveBest(g.wave); }
      $('#ov-title').textContent = 'THÀNH ĐÃ THẤT THỦ';
      $('#ov-text').textContent = `Bạn trụ được tới đợt ${g.wave}`;
      $('#final-best').textContent = `Kỷ lục: đợt ${this.best}`;
      $('#btn-endless').hidden = true;
      $('#overlay').hidden = false;
      this.closeScreen();
    }
    if (this.screen) {
      this.refreshT -= dt;
      if (this.refreshT <= 0) { this.refreshT = 0.25; this.renderScreen(false); }
      this.liveScreen();
    }
  }

  handleEvents() {
    const g = this.game;
    while (g.events.length) {
      const ev = g.events.shift();
      if (ev.type === 'newEnemy') {
        const d = ENEMIES[ev.enemy];
        this.toast(`<b>Quái mới: ${d.name}</b><br>${d.desc}`, d.boss ? '#e0563a' : '#b07bd9');
      } else if (ev.type === 'reward') {
        this.showReward(ev.options);
      } else if (ev.type === 'boss') {
        this.toast(`<b>${ev.name.toUpperCase()} XUẤT HIỆN</b> · Giáp ${ev.armor}`, '#e0563a');
      } else if (ev.type === 'victory') {
        if (g.wave > this.best) { this.best = g.wave; saveBest(g.wave); }
        g.running = false;
        $('#ov-title').textContent = 'CHIẾN THẮNG!';
        $('#ov-text').textContent = `Thành trì đứng vững qua ${CONFIG.totalWaves} đợt quái.`;
        $('#final-best').textContent = 'Chơi tiếp chế độ vô tận: quái mạnh dần, boss mỗi 10 đợt.';
        $('#btn-endless').hidden = false;
        $('#overlay').hidden = false;
      }
    }
  }

  updateTopbar() {
    const g = this.game;
    const total = g.endless ? '' : ` / ${CONFIG.totalWaves}`;
    this.setText('#tb-wave', `ĐỢT ${g.wave}${total}`);
    let sub, fill;
    const left = g.spawnQueue.length + g.enemies.length;
    if (!g.running) {
      sub = g.wave === 0 ? 'BẤM ▶ ĐỂ BẮT ĐẦU' : 'ĐANG TẠM DỪNG';
      fill = g.waveActive ? 1 - left / Math.max(1, g.waveTotal) : 0;
    } else if (g.waveActive) {
      sub = `ĐANG DIỄN RA · CÒN ${left} QUÁI`;
      fill = 1 - left / Math.max(1, g.waveTotal);
    } else {
      const s = Math.ceil(Math.max(0, g.nextWaveT));
      sub = `ĐỢT KẾ TIẾP SAU 00:${String(s).padStart(2, '0')}`;
      fill = 1 - Math.max(0, g.nextWaveT) / CONFIG.waveBreak;
    }
    this.setText('#tb-sub', sub);
    $('#tb-fill').style.width = Math.max(0, Math.min(1, fill)) * 100 + '%';
    this.setText('#gold', g.gold);
    this.setText('#lives', `${g.lives}/${CONFIG.startLives}`);
    const run = $('#btn-run');
    run.classList.toggle('on', g.running);
    run.setAttribute('aria-label', g.running ? 'Dừng' : 'Bắt đầu');
    $('#run-icon').setAttribute('d', g.running ? 'M5 3 V15 M13 3 V15' : 'M5 3 L15 9 L5 15 Z');
    $('#run-icon').setAttribute('stroke', 'currentColor');
    $('#run-icon').setAttribute('stroke-width', g.running ? '3' : '0');
    $('#run-icon').setAttribute('fill', g.running ? 'none' : 'currentColor');
  }

  setText(sel, v) {
    const el = $(sel);
    const s = String(v);
    if (el.textContent !== s) el.textContent = s;
  }

  // Bảng "ĐỢT n SẮP TỚI": loại quái, số lượng, cảnh báo, gọi sớm
  updateWavePanel() {
    const g = this.game;
    const n = g.wave + 1;
    const done = g.wave >= CONFIG.totalWaves && !g.endless;
    const key = `${n}|${done}`;
    if (this.sig.wave !== key) {
      this.sig.wave = key;
      const counts = {};
      let elites = 0, armor = 0, mr = 0, air = 0;
      for (const x of g.nextWave) {
        counts[x.type] = (counts[x.type] || 0) + 1;
        const d = ENEMIES[x.type];
        armor += d.armor || 0; mr += d.mr || 0;
        if (d.flying) air++;
        if (x.elite) elites++;
      }
      const types = Object.keys(counts).sort((a, b) => (ENEMIES[b].boss ? 1e3 : counts[b]) - (ENEMIES[a].boss ? 1e3 : counts[a]));
      const boss = types.find((t) => ENEMIES[t].boss);
      const title = $('#wp-title');
      title.textContent = done ? 'ĐÃ QUA 30 ĐỢT' : boss ? `ĐỢT ${n} · BOSS` : `ĐỢT ${n} SẮP TỚI`;
      title.classList.toggle('boss', !!boss);
      $('#wp-list').innerHTML = done ? '' : types.slice(0, 4).map((t) =>
        `<button class="wp-row ${ENEMIES[t].boss ? 'boss' : ''}" data-info="${t}"><canvas width="56" height="56"></canvas><span>${ENEMIES[t].name}</span><b>x${counts[t]}</b></button>`).join('');
      $('#wp-list').querySelectorAll('canvas').forEach((cv, i) => drawEnemyIcon(cv, types[i], 50));
      const total = g.nextWave.length || 1;
      let warn = '';
      if (boss) warn = ENEMIES[boss].desc;
      else if (air / total > 0.3) warn = 'Đợt bay · cần Cung Thủ hoặc Pháp Sư';
      else if (mr / total >= 22) warn = 'Kháng phép cao · ưu tiên sát thương vật lý';
      else if (armor / total >= 5) warn = 'Giáp dày · ưu tiên sát thương phép';
      if (elites) warn += (warn ? ' · ' : '') + `${elites} quái tinh anh`;
      if (types.length > 4) warn += (warn ? ' · ' : '') + `+${types.length - 4} loại khác`;
      $('#wp-warn').textContent = done ? 'Chiến dịch đã hoàn thành' : warn;
      $('#wp-warn').hidden = !$('#wp-warn').textContent;
    }
    const btn = $('#btn-early');
    btn.disabled = done;
    this.setText('#btn-early', g.wave === 0 ? 'BẮT ĐẦU' : `GỌI SỚM +${g.earlyBonus()} VÀNG`);
  }

  updateBoss() {
    const b = this.game.boss;
    $('#bossbanner').hidden = !b;
    if (!b) return;
    const name = b.champion ? `${b.def.name} khổng lồ` : b.def.name;
    this.setText('#bb-text', `${name.toUpperCase()} · GIÁP ${b.armor}${b.reviveT > 0 ? ' · ĐANG HỒI SINH' : ''}`);
    $('#bb-fill').style.width = Math.max(0, b.hp / b.maxHp) * 100 + '%';
  }

  // Thanh dưới: tướng đang chọn (chân dung, máu, năng lượng, QWER, 6 ô đồ)
  updateBottom() {
    const g = this.game;
    const h = this.sel >= 0 ? g.heroes[this.sel] : null;
    if (!h) this.sel = -1;
    const key = h ? `${h.id}|${h.kills}|${h.level}|${h.skillPts}|${SLOTS.map((s) => h.equip[s]).join()}` : 'none';
    if (this.sig.bottom !== key) {
      this.sig.bottom = key;
      if (!h) {
        this.setText('#bt-name', 'Chưa chọn tướng');
        this.setText('#bt-title', 'Chạm vào một tướng trên bản đồ');
        $('#bt-lv').textContent = '';
        $('#bt-pts').hidden = true;
        $('#bt-skills').innerHTML = [0, 1, 2, 3].map((i) =>
          `<div class="skill"><div class="skbtn lock"><span class="key">${SKILL_KEYS[i]}</span></div><div class="pips"></div></div>`).join('');
        $('#bt-items').innerHTML = SLOTS.map(() => '<div class="it">+</div>').join('');
        ['#bt-hp', '#bt-mp', '#bt-xp'].forEach((s) => ($(s).style.width = '0'));
        $('#bt-hp-t').textContent = $('#bt-mp-t').textContent = '';
        const c = $('#portrait').getContext('2d');
        c.clearRect(0, 0, 208, 232);
      } else {
        const def = HEROES[h.type];
        this.setText('#bt-name', `${def.name} ${'★'.repeat(tierOf(h.kills))}`);
        this.setText('#bt-title', `${def.title} · ${ATTRS[def.attr].name} · đã hạ ${h.kills}`);
        $('#bt-lv').textContent = `Lv ${h.level}`;
        $('#bt-pts').hidden = !h.skillPts;
        $('#bt-pts').textContent = `+${h.skillPts}`;
        $('#bt-portrait').style.borderColor = ATTRS[def.attr].color;
        $('#bt-skills').innerHTML = def.skills.map((sk, i) => {
          const lv = skillLevel(h, i);
          const c = BRANCH_COLORS[i];
          const canUp = lv && lv < SKILL_MAX[i] && h.skillPts > 0 && h.level >= skillReqLevel(i, lv + 1);
          return `<div class="skill">
            <button class="skbtn ${lv ? '' : 'lock'}" data-skill="${i}" style="--ring:${lv ? c : '#3a3426'};--bg2:${lv ? c + '26' : '#161a18'}" aria-label="${sk.name}">
              <span class="glyph">${sk.icon}</span>
              <span class="cd" id="cd-${i}"></span><span class="cdt" id="cdt-${i}"></span>
              <span class="key">${SKILL_KEYS[i]}</span>
              ${sk.active && lv ? `<span class="mana">${sk.active.mana}</span>` : ''}
              ${lv ? '' : `<span class="lk">${sk.unlock}☠</span>`}
              ${canUp ? '<span class="up">+</span>' : ''}
            </button>
            <div class="pips">${Array.from({ length: SKILL_MAX[i] }, (_, k) => `<i class="${k < lv ? 'on' : ''}"></i>`).join('')}</div>
          </div>`;
        }).join('');
        $('#bt-items').innerHTML = SLOTS.map((s) => {
          const id = h.equip[s];
          return id ? `<div class="it" style="--c:${RARITY[ITEMS[id].rarity].color}">${itemIcon(id)}</div>` : '<div class="it">+</div>';
        }).join('');
      }
    }
    if (!h) return;
    const st = heroStats(h);
    $('#bt-hp').style.width = (h.hp / st.hpMax) * 100 + '%';
    this.setText('#bt-hp-t', h.dead ? `Hồi sinh sau ${Math.ceil(h.respawnT)}s` : `${Math.ceil(h.hp)} / ${st.hpMax}`);
    $('#bt-mp').style.width = (h.mana / st.maxMana) * 100 + '%';
    this.setText('#bt-mp-t', `${Math.floor(h.mana)} / ${st.maxMana}`);
    const lo = xpForLevel(h.level), hi = xpForLevel(h.level + 1);
    $('#bt-xp').style.width = (h.level >= CONFIG.maxLevel ? 100 : ((h.xp - lo) / (hi - lo)) * 100) + '%';
    HEROES[h.type].skills.forEach((sk, i) => {
      const cd = document.getElementById('cd-' + i);
      if (!cd || !sk.active) return;
      const left = h.skillCd[sk.id] || 0;
      const total = sk.active.cooldown * (1 - st.cdr / 100);
      cd.style.height = left > 0 ? Math.min(100, (left / total) * 100) + '%' : '0';
      document.getElementById('cdt-' + i).textContent = left > 0 ? Math.ceil(left) : '';
      cd.parentElement.classList.toggle('nomana', h.mana < sk.active.mana);
    });
    this.drawPortrait($('#portrait'), h, 1.9);
  }

  drawPortrait(cv, h, scale) {
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const grd = c.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, h.dead ? '#2a2a2a' : '#2a3e5a');
    grd.addColorStop(1, '#141c26');
    c.fillStyle = grd;
    c.fillRect(0, 0, W, H);
    const look = computeLook(h.type, h.equip, h.kills);
    c.globalAlpha = h.dead ? 0.35 : 1;
    drawHero(c, look, W / 2, H * 0.94, { t: performance.now() / 1000, dir: 1, scale: (W / 104) * scale / ((1 + look.tier * 0.1) * look.bulk), swing: h.swing });
    c.globalAlpha = 1;
  }

  buildBuildGrid() {
    $('#build-grid').innerHTML = Object.entries(HEROES).map(([type, def]) =>
      `<button class="bcard" data-type="${type}" style="--c:${ATTRS[def.attr].color}"><canvas width="68" height="68"></canvas><span><b>${def.name}</b><small>${def.cost} vàng</small></span></button>`).join('');
    $('#build-grid').querySelectorAll('.bcard').forEach((b) => {
      const c = b.querySelector('canvas').getContext('2d');
      const look = computeLook(b.dataset.type, {}, 0);
      // chỉ vẽ phần thân trên cho vừa vòng tròn
      drawHero(c, look, 34, 104, { scale: 2.1 / look.bulk, t: 1 });
    });
  }

  updateBuildGrid() {
    const g = this.game;
    document.querySelectorAll('.bcard').forEach((b) => {
      b.classList.toggle('poor', g.gold < HEROES[b.dataset.type].cost);
      b.classList.toggle('armed', this.armed === b.dataset.type);
    });
    const hint = $('#build-hint');
    const txt = this.spot >= 0 ? 'Chọn tướng để đặt vào ô đã chọn' : this.armed ? `Chạm chỗ trống để đặt ${HEROES[this.armed].name}` : 'Chọn ô trống trên bản đồ';
    this.setText('#build-hint', txt);
    hint.classList.toggle('armed', this.spot >= 0 || !!this.armed);
  }

  drawMinimap() {
    const cv = $('#mm');
    const c = cv.getContext('2d');
    const k = cv.width / CONFIG.W;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.fillStyle = '#18231c';
    c.fillRect(0, 0, CONFIG.W, CONFIG.H);
    c.strokeStyle = '#57452e';
    c.lineWidth = 60;
    c.lineJoin = 'round';
    c.beginPath();
    CONFIG.path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
    const [cx, cy] = CONFIG.path[CONFIG.path.length - 1];
    c.fillStyle = '#d9a441';
    c.fillRect(cx - 55, cy - 30, 110, 100);
    for (const h of this.game.heroes) {
      if (!h) continue;
      c.fillStyle = h.dead ? '#555' : ATTRS[HEROES[h.type].attr].color;
      c.beginPath(); c.arc(h.x, h.y, h.slot === this.sel ? 34 : 24, 0, Math.PI * 2); c.fill();
    }
    for (const e of this.game.enemies) {
      c.fillStyle = e.def.boss || e.champion ? '#ff7043' : '#e0563a';
      c.beginPath(); c.arc(e.x, e.y, e.def.boss || e.champion ? 40 : 20, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = '#e9e2cf';
    c.lineWidth = 10;
    c.strokeRect(0, 56, CONFIG.W, 572 - 56);
  }

  drawMenuArt() {
    const c = $('#menu-art').getContext('2d');
    const t = performance.now() / 1000;
    const g = c.createLinearGradient(0, 0, 0, 230);
    g.addColorStop(0, '#1a2a2a');
    g.addColorStop(0.55, '#3a4a3a');
    g.addColorStop(0.56, '#2d4a24');
    g.addColorStop(1, '#16261a');
    c.fillStyle = g;
    c.fillRect(0, 0, 640, 230);
    const step = Math.floor(t / 2.2);
    const set = SHOWCASE[step % SHOWCASE.length];
    const lineup = LINEUPS[Math.floor(step / SHOWCASE.length) % LINEUPS.length];
    lineup.forEach((type, i) => {
      drawHero(c, computeLook(type, set[HEROES[type].wclass], set.kills), 95 + i * 150, 205, { t: t + i, dir: i >= 2 ? -1 : 1, scale: 1.7 });
    });
  }

  // Gợi ý cho người mới
  updateCoach() {
    const g = this.game;
    const coach = $('#coach');
    let pos = null, text = '', down = false;
    this.coachSlot = -1;
    $('#btn-run').classList.remove('pulse');
    if (!g.over && !this.screen && $('#reward').hidden) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length && this.spot < 0 && !this.armed) {
        this.coachSlot = CONFIG.coachSlot;
        const [x, y] = CONFIG.slots[CONFIG.coachSlot];
        pos = [x * this.scale, (y - 18) * this.scale];
        text = 'Chạm vào bãi cỏ sát đường để chọn chỗ đặt tướng';
      } else if (!heroes.length) {
        const r = $('#build-grid').getBoundingClientRect(), w = $('#wrap').getBoundingClientRect();
        pos = [r.left - w.left + r.width / 2, r.top - w.top - 24 * this.scale];
        text = 'Chọn một tướng để triệu hồi';
      } else if (g.wave === 0 && !g.running) {
        $('#btn-run').classList.add('pulse');
        const r = $('#btn-run').getBoundingClientRect(), w = $('#wrap').getBoundingClientRect();
        pos = [r.left - w.left + r.width / 2, r.bottom - w.top + 10 * this.scale];
        text = 'Bấm ▶ để quái tràn tới';
        down = true;
      }
      if (g.wave >= 1 && !g.waveActive && !g.flags.equipped && !g.flags.gearTip) {
        g.flags.gearTip = true;
        this.toast('Mẹo: chạm vào tướng rồi chạm vào ô đồ ở thanh dưới để mặc đồ', '#9dffc4');
      } else if (g.wave >= 2 && !g.waveActive && !g.flags.shopOpened && !g.flags.shopTip && g.gold >= 100) {
        g.flags.shopTip = true;
        this.toast('Mẹo: mua nguyên liệu và rèn đồ ở Lò rèn (nút đe ở trên)', '#9dffc4');
      }
    }
    coach.hidden = !pos;
    if (!pos) return;
    if ($('#coach-text').textContent !== text) $('#coach-text').textContent = text;
    coach.classList.toggle('down', down);
    const half = coach.offsetWidth / 2 + 6;
    const W = $('#wrap').clientWidth;
    coach.style.left = Math.max(half, Math.min(W - half, pos[0])) + 'px';
    coach.style.top = pos[1] + 'px';
  }

  // ---------- thưởng boss
  showReward(options) {
    const g = this.game;
    this.rewardOpts = options;
    this.rewardWasRunning = g.running;
    g.running = false;
    this.closeScreen();
    $('#rw-title').textContent = `ĐỢT ${g.wave}`;
    $('#rw-list').innerHTML = options.map((o, i) => {
      let body;
      if (o.kind === 'item') body = itemCard(o.id);
      else if (o.kind === 'treasure') body = `<div class="item" style="--rc:#f0c46a"><span class="icon">💰</span><span class="meta"><b>+${o.gold} vàng</b><small>Sửa thành +${o.lives} mạng</small></span></div>`;
      else body = `<div class="item" style="--rc:#b07bd9"><span class="icon">⬆</span><span class="meta"><b>+${o.levels} cấp</b><small>Cho tất cả tướng đang có</small></span></div>`;
      return `<button class="rw-opt" data-rw="${i}"><span class="rw-name">${o.title}</span>${body}<span class="rw-pick">CHỌN</span></button>`;
    }).join('');
    $('#reward').hidden = false;
  }

  pickReward(i) {
    const g = this.game;
    const o = this.rewardOpts[i];
    g.claimReward(o);
    $('#reward').hidden = true;
    g.running = this.rewardWasRunning;
    if (o.kind === 'item') this.toast(`Nhận <b>${ITEMS[o.id].name}</b>. Chọn tướng rồi chạm ô đồ để mặc`, RARITY[ITEMS[o.id].rarity].color);
    else if (o.kind === 'treasure') this.toast(`+${o.gold}💰 và +${o.lives} mạng thành`, '#f0c46a');
    else this.toast(`Toàn quân lên ${o.levels} cấp!`, '#b07bd9');
  }

  // ============================================================
  //  MÀN HÌNH LỚN
  // ============================================================
  openScreen(sc) {
    if (sc.kind === 'hero' && !this.game.heroes[sc.slot]) return;
    if (sc.kind === 'forge') this.game.flags.shopOpened = true;
    this.screen = { skill: 0, ...sc };
    if (sc.kind === 'hero' && sc.skill === undefined) {
      const h = this.game.heroes[sc.slot];
      this.screen.skill = HEROES[h.type].skills.reduce((a, s, i) => (h.kills >= s.unlock ? i : a), 0);
    }
    this.sellArmed = false;
    $('#screen').hidden = false;
    this.renderScreen(true);
  }

  closeScreen() {
    this.screen = null;
    $('#screen').hidden = true;
  }

  action(d) {
    const g = this.game;
    const sc = this.screen;
    const h = sc && sc.kind === 'hero' ? g.heroes[sc.slot] : null;
    switch (d.act) {
      case 'close': return this.closeScreen();
      case 'tab': sc.tab = d.tab; break;
      case 'skill': sc.skill = +d.i; break;
      case 'upgrade': {
        const r = g.upgradeSkill(h, sc.skill);
        if (r === true) this.toast(`${HEROES[h.type].skills[sc.skill].name} lên cấp ${skillLevel(h, sc.skill)}!`, '#f0c46a');
        else this.toast(r, '#e0563a');
        break;
      }
      case 'equip': {
        const it = ITEMS[g.inventory[+d.idx]];
        const r = h && g.equip(h, +d.idx);
        if (r === true) this.toast(`${HEROES[h.type].name} mặc <b>${it.name}</b>`, RARITY[it.rarity].color);
        else if (r) this.toast(r, '#e0563a');
        break;
      }
      case 'unequip': if (h) g.unequip(h, d.slot); break;
      case 'sell':
        if (!this.sellArmed) { this.sellArmed = true; break; }
        g.sellHero(sc.slot);
        this.sel = -1;
        return this.closeScreen();
      case 'recipe': sc.recipe = d.id; break;
      case 'craft': {
        const it = ITEMS[d.id];
        if (g.craft(d.id)) this.toast(`Rèn thành công <b>${it.name}</b>!`, RARITY[it.rarity].color);
        break;
      }
      case 'buy': {
        const it = ITEMS[d.id];
        if (g.buy(d.id)) this.toast(`Đã mua <b>${it.name}</b>`, '#7bd36a');
        else this.toast(`Cần ${it.price} vàng`, '#e0563a');
        break;
      }
      case 'chest': {
        const id = g.buyChest();
        if (!id) { this.toast(`Cần ${CONFIG.chestCost} vàng`, '#e0563a'); break; }
        this.toast(`Mở rương được <b>${ITEMS[id].name}</b> (${RARITY[ITEMS[id].rarity].name})`, RARITY[ITEMS[id].rarity].color);
        break;
      }
      case 'evo': sc.evo = +d.slot; break;
      case 'water': {
        const r = g.waterTree();
        this.toast(r === true ? 'Đã tưới nước: Cây Sự Sống lớn thêm' : r, r === true ? '#7bd36a' : '#e0563a');
        break;
      }
      case 'harvest': {
        const n = g.harvestTree();
        this.toast(n ? `Thu hoạch ${n} quả: +${n * TREE.fruitGold}💰, tướng hồi máu` : 'Chưa có quả', n ? '#f0c46a' : '#e0563a');
        break;
      }
    }
    this.renderScreen(true);
  }

  changed(key, v) {
    if (this.sig[key] === v) return false;
    this.sig[key] = v;
    return true;
  }

  head(title, sub, tabs, right, cls) {
    return `<div class="scr-head">
      <h2>${title}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}
      ${tabs ? `<nav class="tabs">${tabs.map(([k, n]) => `<button data-act="tab" data-tab="${k}" class="${this.screen.tab === k ? 'on' : ''}">${n}</button>`).join('')}</nav>` : ''}
      <div class="spacer"></div>${right || ''}
      <button class="x" data-act="close" aria-label="Đóng">${CLOSE_SVG}</button>
    </div>`;
  }

  renderScreen(force) {
    const sc = this.screen;
    if (!sc) return;
    const g = this.game;
    let key;
    if (sc.kind === 'hero') {
      const h = g.heroes[sc.slot];
      if (!h) return this.closeScreen();
      key = `${sc.tab}|${sc.skill}|${h.kills}|${h.level}|${h.skillPts}|${SLOTS.map((s) => h.equip[s]).join()}|${g.inventory.join()}|${this.sellArmed}`;
    } else if (sc.kind === 'forge') key = `${sc.tab}|${sc.recipe}|${g.gold}|${g.inventory.join()}`;
    else if (sc.kind === 'codex') key = `${g.wave}|${Object.keys(g.seen).join()}`;
    else key = `${sc.evo}|${g.heroes.map((h) => h && h.kills).join()}|${g.gold}|${g.tree.growth}|${g.tree.fruits}|${g.tree.watered}`;
    if (!force && this.sig.screen === key) return;
    this.sig.screen = key;
    const body = $('#screen-body');
    body.className = 'scr ' + sc.kind;
    body.innerHTML = this['render_' + sc.kind]();
    this.afterRender();
  }

  // ---------- 2 · Cây kỹ năng / Trang bị
  render_hero() {
    const g = this.game, sc = this.screen;
    const h = g.heroes[sc.slot];
    const def = HEROES[h.type];
    const st = heroStats(h);
    const head = this.head(sc.tab === 'equip' ? 'TRANG BỊ' : 'CÂY KỸ NĂNG', `${def.name} · ${def.title}`,
      [['skills', 'Kỹ năng'], ['equip', 'Trang bị']], `<div class="pill">Điểm kỹ năng: <b>${h.skillPts}</b></div>`);
    const left = `<div class="col" style="width:calc(var(--p) * 230);flex:none">
      <div class="hs-portrait" style="border-color:${ATTRS[def.attr].color}"><canvas id="hs-portrait" width="230" height="210"></canvas></div>
      <div class="statrow"><span>Cấp</span><b style="color:var(--gold-hi)">${h.level} / ${CONFIG.maxLevel}</b></div>
      <div class="bar xp" style="height:calc(var(--p) * 8)"><i style="width:${h.level >= CONFIG.maxLevel ? 100 : ((h.xp - xpForLevel(h.level)) / (xpForLevel(h.level + 1) - xpForLevel(h.level))) * 100}%"></i></div>
      <div class="scroll" style="flex:1;min-height:0">
        ${[['Sát thương', `${st.damage.toFixed(0)} ${def.dmgType === 'magic' ? 'phép' : 'vật lý'}`], ['Tốc đánh', `${(1 / st.cooldown).toFixed(2)}/s`], ['Tầm đánh', Math.round(st.range)],
          ['Máu', st.hpMax], ['Năng lượng', st.maxMana], ['Hồi năng lượng', `${st.manaRegen.toFixed(1)}/s`],
          ['Chí mạng', `${Math.round(st.crit)}%`], ['Giảm hồi chiêu', `${Math.round(st.cdr)}%`], ['Đã hạ', `${h.kills} quái`]]
          .map(([k, v]) => `<div class="statrow"><span>${k}</span><b>${v}</b></div>`).join('')}
      </div>
      <button class="btn-line btn-danger ${this.sellArmed ? 'confirm' : ''}" data-act="sell">${this.sellArmed ? `Chạm lần nữa để bán` : `Bán tướng · +${Math.floor(def.cost * CONFIG.sellRatio)} vàng`}</button>
    </div>`;
    if (sc.tab === 'equip') {
      const slots = SLOTS.map((s) => {
        const id = h.equip[s];
        if (!id) return `<div class="slot empty"><span class="ico">${s === 'weapon' ? WCLASS_ICON[def.wclass] : SLOT_ICON[s.indexOf('acc') === 0 ? 'acc' : s]}</span><small>${SLOT_NAMES[s]}: trống</small></div>`;
        const it = ITEMS[id];
        return `<button class="slot" style="--c:${RARITY[it.rarity].color}" data-act="unequip" data-slot="${s}"><span class="ico">${itemIcon(id)}</span><b>${it.name}</b><small>Chạm để tháo</small></button>`;
      }).join('');
      const sets = activeSets(h.equip).map((k) => `<div class="set">✦ ${SETS[k].name}: ${SETS[k].desc}</div>`).join('');
      const bag = g.inventory.map((id, i) => ({ id, i })).filter(({ id }) => canEquip(h.type, id))
        .map(({ id, i }) => itemCard(id, `data-act="equip" data-idx="${i}"`, 'Chạm để mặc')).join('');
      return head + `<div class="scr-body">${left}
        <div class="col" style="flex:1"><span class="label">6 Ô ĐỒ · 3 TRANG PHỤC ĐỔI HÌNH DẠNG + 3 PHỤ KIỆN</span><div class="slots6">${slots}</div>${sets}
          <div class="note">Vũ khí, mũ, giáp đổi ngay hình dạng tướng. Đủ 3 món Bộ Rồng thì mọc cánh. Phụ kiện mua và rèn ở Lò rèn.</div></div>
        <div class="col" style="width:calc(var(--p) * 330);flex:none"><span class="label">TÚI ĐỒ</span>
          <div class="items scroll" style="flex:1;min-height:0">${bag || '<p class="muted">Chưa có đồ hợp với tướng này. Ghé Lò rèn hoặc diệt quái để có thêm.</p>'}</div></div>
      </div>`;
    }
    // cây kỹ năng: mỗi kỹ năng một nhánh, mỗi nút là một cấp
    const branches = def.skills.map((sk, i) => {
      const c = BRANCH_COLORS[i];
      const lv = skillLevel(h, i);
      const nodes = Array.from({ length: SKILL_MAX[i] }, (_, k) => {
        const L = k + 1;
        let state = 'lock';
        if (lv >= L) state = lv === SKILL_MAX[i] ? 'max' : 'on';
        else if (lv && L === lv + 1) state = 'next';
        const ring = state === 'max' ? '#f0c46a' : state === 'on' ? c : state === 'next' ? (sc.skill === i ? '#ffffff' : c + '88') : '#3a3426';
        const bg = state === 'max' ? '#3a2c14' : state === 'on' ? '#1c2632' : '#161a18';
        const fg = state === 'lock' ? '#6d675a' : '#e9e2cf';
        const req = L === 1 ? (sk.unlock ? `${sk.unlock} quái` : 'Có sẵn') : `Tướng cấp ${skillReqLevel(i, L)}`;
        return `<div class="node" style="--rc:${ring};--bgc:${bg};--fg:${fg};--op:${state === 'lock' ? 0.55 : 1};--lc:${lv >= L ? c : '#2a2620'};--rad:${i === 3 ? '12px' : '50%'}">
          ${k ? '<div class="ln"></div>' : ''}
          <button data-act="skill" data-i="${i}" aria-label="${sk.name} cấp ${L}">${i === 3 ? 'R' + L : L}</button>
          <small>${lv >= L ? `Cấp ${L}` : req}</small></div>`;
      }).join('');
      return `<div class="branch" style="--c:${c};${sc.skill === i ? 'border-color:' + c : ''}">
        <span class="bname">${sk.icon} ${sk.name}</span>
        <span class="bsub">${SKILL_KEYS[i]} · ${sk.active ? `Chủ động · ${sk.active.mana} NL` : 'Nội tại'}</span>${nodes}</div>`;
    }).join('');
    const i = sc.skill, sk = def.skills[i], lv = skillLevel(h, i), c = BRANCH_COLORS[i];
    const next = Math.min(SKILL_MAX[i], lv + 1);
    const can = lv && lv < SKILL_MAX[i] && h.skillPts > 0 && h.level >= skillReqLevel(i, lv + 1);
    const cdNow = sk.active ? (sk.active.cooldown * (1 - st.cdr / 100)).toFixed(1) + 's' : '–';
    const detail = `<div class="panel detail" style="--c:${c}">
      <div class="dt-head"><div class="dt-icon" style="--c:${c}">${sk.icon}</div>
        <div style="display:flex;flex-direction:column"><span class="dt-name">${sk.name}</span>
        <span class="dt-sub">${SKILL_KEYS[i]} · ${lv ? `Cấp ${lv}${lv < SKILL_MAX[i] ? ` → ${next}` : ' (tối đa)'}` : 'Chưa mở'}</span></div></div>
      <p class="dt-desc">${sk.info(Math.max(0, h.kills - sk.unlock))}</p>
      <div class="dt-grid"><span class="h"></span><span class="h">Hiện tại</span><span class="h">Sau nâng</span>
        <span>Hiệu lực</span><span>x${skillMult(lv).toFixed(2)}</span><span class="up">x${skillMult(next).toFixed(2)}</span>
        ${sk.active ? `<span>Hồi chiêu</span><span>${cdNow}</span><span>${cdNow}</span><span>Năng lượng</span><span>${sk.active.mana}</span><span>${sk.active.mana}</span>` : ''}
      </div>
      <div class="dt-req">${!lv ? `Mở khi hạ ${sk.unlock} quái (còn ${sk.unlock - h.kills})` : lv >= SKILL_MAX[i] ? 'Đã đạt cấp tối đa' :
        `Yêu cầu: tướng cấp ${skillReqLevel(i, lv + 1)} ${h.level >= skillReqLevel(i, lv + 1) ? '✓' : '✗'} · điểm kỹ năng ${h.skillPts > 0 ? '✓' : '✗'}`}</div>
      <div class="spacer"></div>
      <button class="btn-gold" data-act="upgrade" ${can ? '' : 'disabled'}>NÂNG CẤP · 1 ĐIỂM</button>
      <span class="dt-req">Kỹ năng tự dùng khi có quái trong tầm và đủ năng lượng.</span>
    </div>`;
    return head + `<div class="scr-body">${left}<div class="branches">${branches}</div>${detail}</div>`;
  }

  // ---------- 3 · Lò rèn
  render_forge() {
    const g = this.game, sc = this.screen;
    const head = this.head('LÒ RÈN', '', [['recipe', 'Rèn đồ'], ['shop', 'Nguyên liệu'], ['chest', 'Rương']],
      `<span style="font-size:calc(var(--f) * 16)">Vàng <b style="color:var(--gold-hi)">${g.gold}</b></span>`);
    const counts = {};
    for (const id of g.inventory) counts[id] = (counts[id] || 0) + 1;
    const bag = `<div class="col" style="width:calc(var(--p) * 270);flex:none"><span class="label">TÚI NGUYÊN LIỆU</span>
      <div class="bag-grid">${Object.entries(counts).map(([id, n]) => `<div class="bag-cell" style="--c:${RARITY[ITEMS[id].rarity].color}" title="${ITEMS[id].name}">${itemIcon(id)}<b>${n}</b></div>`).join('')}
      ${Array.from({ length: Math.max(0, 12 - Object.keys(counts).length) }, () => '<div class="bag-cell"></div>').join('')}</div>
      <div class="note">Nguyên liệu mua ở mục Nguyên liệu. Đồ trang phục rơi từ quái, rương và boss. Đồ rèn xong vào túi, chọn tướng để mặc.</div></div>`;
    if (sc.tab === 'shop') {
      const items = Object.keys(ITEMS).filter((id) => ITEMS[id].price).map((id) => {
        const it = ITEMS[id];
        return `<div class="item" style="--rc:${RARITY[it.rarity].color}"><span class="icon">${itemIcon(id)}</span>
          <span class="meta"><b>${it.name}</b><small>${statText(it.stats)}</small></span>
          <button class="price" data-act="buy" data-id="${id}" ${g.gold < it.price ? 'disabled' : ''}>${it.price} 💰</button></div>`;
      }).join('');
      return head + `<div class="scr-body"><div class="forge-main" style="align-items:stretch"><span class="label">NGUYÊN LIỆU CƠ BẢN</span><div class="shop-grid scroll">${items}</div></div>${bag}</div>`;
    }
    if (sc.tab === 'chest') {
      const odds = Object.values(RARITY), tot = odds.reduce((a, r) => a + r.weight, 0);
      return head + `<div class="scr-body"><div class="forge-main" style="justify-content:center">
        <div class="result" style="--c:#f0a050"><span class="ico">🎁</span><span>Rương trang bị</span></div>
        <p class="dt-desc" style="text-align:center">Ngẫu nhiên một món vũ khí, mũ hoặc giáp. Mặc vào là tướng đổi dáng.</p>
        <div class="fm-stats" style="max-width:calc(var(--p) * 360)">${odds.map((r) => `<span style="color:${r.color}">${r.name}</span><span>${Math.round((r.weight / tot) * 100)}%</span>`).join('')}</div>
        <button class="btn-gold btn-forge" data-act="chest" ${g.gold < CONFIG.chestCost ? 'disabled' : ''}>MỞ RƯƠNG · ${CONFIG.chestCost} VÀNG</button></div>${bag}</div>`;
    }
    const recipes = Object.keys(ITEMS).filter((id) => ITEMS[id].recipe);
    if (!sc.recipe) sc.recipe = recipes[0];
    const list = recipes.map((id) => {
      const it = ITEMS[id];
      const ok = !g.missingParts(id).length;
      return `<button class="rbtn ${sc.recipe === id ? 'sel' : ''}" data-act="recipe" data-id="${id}" style="--c:${RARITY[it.rarity].color}">
        <span class="sw">${it.icon}</span><span class="nm"><b>${it.name}</b><small>${RARITY[it.rarity].name}</small></span>
        <span class="ok" style="color:${ok ? 'var(--green)' : 'var(--red)'}">${ok ? 'Đủ' : 'Thiếu'}</span></button>`;
    }).join('');
    const it = ITEMS[sc.recipe];
    const missing = g.missingParts(sc.recipe).slice();
    const inputs = it.recipe.parts.map((p) => {
      const mi = missing.indexOf(p);
      const has = mi < 0;
      if (!has) missing.splice(mi, 1);
      return `<div class="inp" style="--c:${RARITY[ITEMS[p].rarity].color};--qc:${has ? 'var(--green)' : 'var(--red)'}"><span class="ico">${ITEMS[p].icon}</span><span>${ITEMS[p].name}</span><b>${has ? '1/1' : '0/1'}</b></div>`;
    }).join('') + `<div class="inp" style="--c:#d9a441;--qc:${g.gold >= it.recipe.cost ? 'var(--green)' : 'var(--red)'}"><span class="ico">💰</span><span>Vàng</span><b>${Math.min(g.gold, it.recipe.cost)}/${it.recipe.cost}</b></div>`;
    const ok = !g.missingParts(sc.recipe).length && g.gold >= it.recipe.cost;
    const main = `<div class="forge-main">
      <span class="fm-name">${it.name}</span><span class="fm-tier" style="color:${RARITY[it.rarity].color}">${RARITY[it.rarity].name} · Phụ kiện</span>
      <div class="fm-row"><div class="inputs">${inputs}</div>
        <svg width="70" height="30" viewBox="0 0 70 30" aria-hidden="true"><path d="M 2 15 L 60 15 M 48 4 L 62 15 L 48 26" stroke="#f0a050" stroke-width="4" fill="none"/></svg>
        <div class="result" style="--c:${RARITY[it.rarity].color}"><span class="ico">${it.icon}</span><span>${statText(it.stats).split(' · ')[0]}</span></div></div>
      <div class="fm-stats">${statText(it.stats).split(' · ').map((x) => `<span>${x}</span>`).join('')}${it.look && it.look.aura ? '<span style="color:#8fc4ff">Tướng có hào quang riêng</span>' : ''}</div>
      <button class="btn-gold btn-forge" data-act="craft" data-id="${sc.recipe}" ${ok ? '' : 'disabled'}>RÈN · ${it.recipe.cost} VÀNG</button>
    </div>`;
    return head + `<div class="scr-body"><div class="col rlist"><span class="label">CÔNG THỨC</span><div class="col scroll" style="flex:1;min-height:0;gap:calc(var(--p) * 7)">${list}</div></div>${main}${bag}</div>`;
  }

  // ---------- 5 · Bách khoa quái & lịch 30 đợt
  render_codex() {
    const g = this.game;
    const types = Object.keys(ENEMIES).filter((t) => !ENEMIES[t].minion);
    const seen = types.filter((t) => g.seen[t]).length;
    const head = this.head('BÁCH KHOA QUÁI', `Đã gặp ${seen} / ${types.length} loại`);
    const sb = (k, v, w, c) => `<div class="sbar"><span>${k}</span><div><i style="width:${Math.min(100, w)}%;background:${c}"></i></div><b>${v}</b></div>`;
    const cards = types.map((t) => {
      const d = ENEMIES[t];
      const known = g.seen[t];
      const c = d.boss ? '#e0563a' : d.flying ? '#9c86c4' : '#7a7466';
      const kind = d.boss ? `Boss · đợt ${Object.keys(BOSS_WAVES).filter((n) => BOSS_WAVES[n] === t).join(', ')}` : d.flying ? 'Bay · chỉ tướng đánh xa bắn được' : d.ranged ? 'Pháp sư · tầm xa' : 'Bộ binh';
      return `<div class="ccard ${known ? '' : 'unknown'}" style="--c:${c}"><canvas data-codex="${t}" data-unknown="${known ? '' : 1}" width="200" height="110"></canvas>
        <span class="nm">${known ? d.name : '???'}</span><span class="tp">${known ? kind : 'Chưa gặp'}</span>
        ${known ? sb('Máu', d.hp, (d.hp / 1300) * 100, '#4f9a43') + sb('Giáp', d.armor || 0, (d.armor || 0) * 5, '#cfd6e0') + sb('Tốc độ', d.speed, d.speed, '#d9a441') + sb('Kháng phép', (d.mr || 0) + '%', d.mr || 0, '#8fc4ff') : ''}
        <span class="ds">${known ? d.desc : 'Gặp loại quái này để mở thông tin.'}</span>
        <span class="dr">${known ? (d.boss ? `Rơi: ${ITEMS[d.reward].name}, Huy Hiệu Phượng Hoàng` : `Rơi đồ: ${Math.round(d.drop * 100)}%`) : ''}</span></div>`;
    }).join('');
    const cells = Array.from({ length: CONFIG.totalWaves }, (_, k) => {
      const n = k + 1, kind = waveKind(n), past = n < g.wave + (g.waveActive ? 0 : 1), cur = n === g.wave && g.waveActive || n === g.wave + 1 && !g.waveActive;
      const bg = cur ? '#d9a441' : kind === 'boss' ? '#5a1e16' : kind === 'air' ? '#2e2540' : kind === 'champion' ? '#3a3020' : past ? '#2a2420' : '#1f1820';
      const bd = kind === 'boss' ? '#e0563a' : kind === 'air' ? '#6b5a8e' : kind === 'champion' ? '#d9a441' : '#3a2a30';
      return `<div style="--bg:${bg};--bd:${bd};--fg:${cur ? '#1a1408' : past ? '#6d675a' : '#e9e2cf'}">${n}</div>`;
    }).join('');
    return head + `<div class="scr-body" style="flex-direction:column">
      <div class="cards scroll-x" style="flex:1;min-height:0">${cards}</div>
      <div class="sched"><div style="display:flex;justify-content:space-between"><span class="label">LỊCH 30 ĐỢT</span>
        <span class="muted" style="font-size:calc(var(--f) * 13)">Đang ở đợt ${g.wave} · boss ở đợt 10, 20, 30 · Golem khổng lồ ở đợt 5, 15, 25</span></div>
        <div class="cells">${cells}</div>
        <div class="legend"><span><i style="background:#2a2420"></i>Đã qua</span><span><i style="background:#d9a441"></i>Hiện tại</span><span><i style="background:#6b5a8e"></i>Đợt bay</span><span><i style="background:#d9a441;opacity:0.5"></i>Golem khổng lồ</span><span><i style="background:#e0563a"></i>Boss</span></div>
      </div></div>`;
  }

  // ---------- 4 · Tiến hoá tướng & Cây Sự Sống
  render_grow() {
    const g = this.game, sc = this.screen;
    const heroes = g.heroes.filter(Boolean);
    if (!heroes.find((h) => h.slot === sc.evo)) sc.evo = heroes.length ? heroes[0].slot : -1;
    const head = this.head('TIẾN HOÁ & CÂY SỰ SỐNG', '');
    let evo = '<div class="evo"><span class="label">TIẾN HOÁ TƯỚNG</span><p class="muted">Chưa có tướng nào. Triệu hồi tướng để xem đường tiến hoá.</p></div>';
    if (sc.evo >= 0) {
      const h = g.heroes[sc.evo], def = HEROES[h.type], tier = tierOf(h.kills);
      const info = [['Tân Binh', 'Ngoại hình gốc'], ['★ Tinh Nhuệ', '+10% sát thương, to hơn'], ['★★ Anh Hùng', '+20% sát thương, hào quang'], ['★★★ Huyền Thoại', '+30% sát thương, hình thể lớn nhất']];
      const nodes = info.map(([n, d], k) => {
        const need = CONFIG.tiers[k];
        const state = tier >= k ? 'done' : k === tier + 1 ? 'next' : 'lock';
        return (k ? '<div class="earrow"></div>' : '') + `<div class="enode" style="--rc:${state === 'done' ? '#4a4232' : state === 'next' ? '#d9a441' : '#2a332d'};--bgc:${state === 'next' ? '#1f1c12' : '#141a16'};--cc:${state === 'done' ? 'var(--green)' : state === 'next' ? 'var(--gold-hi)' : '#6d675a'}">
          <b>${n}</b><small>${d}</small><span class="cost">${state === 'done' ? 'Đã đạt' : `Hạ ${need} quái`}</span></div>`;
      }).join('');
      const nextNeed = CONFIG.tiers[tier + 1];
      evo = `<div class="evo"><span class="label">TIẾN HOÁ TƯỚNG · ${def.name.toUpperCase()} · ĐÃ HẠ ${h.kills} QUÁI</span>
        <div class="evo-pick">${heroes.map((x) => `<button class="${x.slot === sc.evo ? 'on' : ''}" data-act="evo" data-slot="${x.slot}">${HEROES[x.type].name} ${'★'.repeat(tierOf(x.kills))}</button>`).join('')}</div>
        <div class="evo-row">${nodes}</div>
        <div class="hs-portrait" style="height:calc(var(--p) * 150);width:calc(var(--p) * 150);align-self:center"><canvas id="evo-portrait" width="150" height="150"></canvas></div>
        <div class="evo-foot"><b class="disp" style="font-family:var(--display)">${def.name}</b>
          <span class="muted">Sát thương</span><span>${heroStats(h).damage.toFixed(0)}</span>
          <span class="muted">Tiến hoá kế</span><span>${nextNeed ? `${h.kills} / ${nextNeed} quái` : 'Đã tối đa'}</span>
          <div class="bar xp" style="width:calc(var(--p) * 120);height:calc(var(--p) * 8)"><i style="width:${nextNeed ? (h.kills / nextNeed) * 100 : 100}%;background:var(--gold)"></i></div></div>
      </div>`;
    }
    const stage = g.treeStage();
    const toNext = stage >= TREE.stages.length ? 0 : TREE.stageWaves - (g.tree.growth % TREE.stageWaves);
    const tree = `<div class="tree"><h3>CÂY SỰ SỐNG</h3>
      <span class="muted" style="font-size:calc(var(--f) * 13);margin-top:calc(var(--p) * -6)">Lớn dần qua mỗi đợt, sinh vàng và hồi mạng cho thành</span>
      <canvas id="tree-art" width="320" height="160"></canvas>
      <div class="statrow"><span>Giai đoạn</span><b style="color:var(--green)">${stage} / ${TREE.stages.length} · ${TREE.stages[stage - 1]}</b></div>
      <div class="stages">${TREE.stages.map((_, k) => `<i class="${k < stage ? 'on' : ''}"></i>`).join('')}</div>
      <div class="statrow"><span>Vàng mỗi đợt</span><b>+${stage * TREE.goldPerStage}</b></div>
      <div class="statrow"><span>Hồi mạng thành</span><b>${stage >= 2 ? '+1 mỗi 3 đợt' : 'mở ở giai đoạn 2'}</b></div>
      <div class="statrow"><span>Quả Sự Sống</span><b>${stage >= 3 ? `${g.tree.fruits} sẵn sàng` : 'mở ở giai đoạn 3'}</b></div>
      <div class="statrow"><span>Giai đoạn kế</span><b>${toNext ? `sau ${toNext} đợt` : 'đã tối đa'}</b></div>
      <div class="spacer"></div>
      <div class="row" style="flex-wrap:nowrap">
        <button class="btn-green" data-act="water" ${g.tree.watered || g.gold < TREE.waterCost || !toNext ? 'disabled' : ''}>TƯỚI · ${TREE.waterCost} VÀNG</button>
        <button class="btn-fruit" data-act="harvest" ${g.tree.fruits ? '' : 'disabled'}>Hái ${g.tree.fruits} quả</button>
      </div></div>`;
    return head + `<div class="scr-body">${evo}${tree}</div>`;
  }

  afterRender() {
    document.querySelectorAll('canvas[data-codex]').forEach((cv) => drawEnemyIcon(cv, cv.dataset.codex, 80, !!cv.dataset.unknown));
    this.liveScreen();
  }

  // phần động của màn hình (chân dung, cây) vẽ mỗi khung hình
  liveScreen() {
    const sc = this.screen;
    if (!sc) return;
    const g = this.game;
    if (sc.kind === 'hero') {
      const cv = document.getElementById('hs-portrait');
      if (cv && g.heroes[sc.slot]) this.drawPortrait(cv, g.heroes[sc.slot], 1.25);
    } else if (sc.kind === 'grow') {
      const cv = document.getElementById('evo-portrait');
      if (cv && g.heroes[sc.evo]) this.drawPortrait(cv, g.heroes[sc.evo], 1.2);
      const tr = document.getElementById('tree-art');
      if (tr) drawTreeArt(tr.getContext('2d'), g.treeStage(), performance.now() / 1000);
    }
  }
}
