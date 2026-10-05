'use strict';

// ============================================================
//  GIAO DIỆN: menu, mở đầu, chiến dịch, màn chơi (thanh trên, triệu
//  hồi, bảng điều khiển dưới), các màn hình trong trận (Cây kỹ năng,
//  Lò đúc đồng, Túi đồ, Đổi vàng, Tiến hoá, Núi Tản Viên, Bách khoa),
//  sính lễ, thắng/thua, cài đặt. Theo bản thiết kế v14.
// ============================================================

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => Math.round(n).toLocaleString('vi-VN');
const ICON = {
  close: '<svg viewBox="0 0 16 16"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M10 3 L5 8 L10 13" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5 L6.5 12 L13 4.5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 16 16" width="12" height="12"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7 V5 A3 3 0 0 1 11 5 V7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  up: '<svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 14 V3 M3 8 L8 3 L13 8" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  dup: '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4 11 L10 5 L16 11 M4 16 L10 10 L16 16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  swap: '<svg viewBox="0 0 20 20"><path d="M3 7 H16 M12 3 L16 7 L12 11 M17 13 H4 M8 9 L4 13 L8 17" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  mount: '<svg viewBox="0 0 24 24"><path d="M2 19 L9 8 L13 14 L16 10 L22 19 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 3 V8 M14.5 5.5 H19.5" stroke="currentColor" stroke-width="2"/></svg>',
  bag: '<svg viewBox="0 0 20 20"><path d="M4 7 H16 L15 17 H5 Z M7 7 V5 A3 3 0 0 1 13 5 V7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 20 20"><path d="M10 2 L12.4 7.3 L18 7.8 L13.8 11.6 L15 17.3 L10 14.4 L5 17.3 L6.2 11.6 L2 7.8 L7.6 7.3 Z" fill="currentColor"/></svg>',
  stop: '<path d="M5 5 H15 V15 H5 Z" fill="currentColor"/>',
  play: '<path d="M6 4 L16 10 L6 16 Z" fill="currentColor"/>',
};
const svgI = (svg, cls = '') => `<span class="svgi ${cls}">${svg || ''}</span>`;
const coin = (sm) => `<i class="coin${sm ? ' sm' : ''}"></i>`;
const rarCls = (r) => ({ common: 'rt', rare: 'rh', epic: 'rs', legendary: 'rl' }[r]);
const ATTR_CLS = { str: 'a-str', agi: 'a-agi', int: 'a-int' };
const RUN_CHIP = '<span class="chip run">Quái vẫn đang chạy</span>';

function skillIcon(type, i) {
  return HAS_ART && ART.skill[type] ? ART.skill[type][SKILL_KEYS[i]] : '';
}
function itemIcon(id) {
  return HAS_ART && ART.item[id] ? ART.item[id] : '';
}
function sceneArt(k) {
  return HAS_ART && ART.scene[k] ? ART.scene[k] : '';
}
// Ảnh tướng ghép đủ các phần (để làm nút triệu hồi, chân dung nhỏ)
const heroUrlCache = {};
function heroImgUrl(type, crop) {
  const key = type + (crop || '');
  if (heroUrlCache[key]) return heroUrlCache[key];
  if (!HAS_ART || !ART.hero[type]) return '';
  const a = ART.hero[type];
  const vb = crop === 'head' ? '24 12 152 150' : '-30 -30 260 270';
  const body = ['back', 'legs', 'armB', 'body', 'head', 'armF', 'weapon'].map((p) => a[p] || '').join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="260" height="270">${a.defs || ''}${body}</svg>`;
  return (heroUrlCache[key] = svgUrl(svg));
}

// ---------- lưu tiến trình (chỉ trên máy người chơi)
const SAVE_KEY = 'nuicao.v1';
function loadSave() {
  const def = { stars: LEVELS.map(() => 0), unlocked: 1, last: 0, best: {}, storySeen: false,
    settings: { dmgText: true, shake: true, skipStory: false } };
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return { ...def, ...s, settings: { ...def.settings, ...(s.settings || {}) } };
  } catch (e) { return def; }
}
function writeSave(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* bỏ qua */ }
}

class UI {
  constructor(game) {
    this.game = game;
    this.save = loadSave();
    this.scale = 1;
    this.sel = -1;          // ô có tướng đang chọn
    this.spot = -1;         // ô trống đang chọn
    this.armed = null;      // loại tướng chờ đặt
    this.raising = false;   // đang chọn ô để Mọc Núi
    this.moving = -1;       // đang đổi chỗ tướng
    this.sellArmed = false;
    this.screen = null;     // { kind, ... }
    this.sig = {};
    this.refreshT = 0;
    this.coachSlot = -1;
    this.legendPick = null;
    this.toastList = [];
    this.bind();
    this.buildSummon();
    $('#menu-art').innerHTML = svgI(sceneArt('menu'));
    $('#rotate-art').innerHTML = sceneArt('rotate');
    $('#loading').hidden = true;
    this.showMenu();
  }

  // ---------- gắn sự kiện
  bind() {
    const g = this.game;
    $('#btn-continue').onclick = () => this.playLevel(this.save.last);
    $('#btn-campaign').onclick = () => this.showCampaign(this.save.last);
    $('#btn-temple').onclick = () => { location.href = 'den-anh-hung.html'; };
    $('#btn-menu-codex').onclick = () => this.openScreen('codex', { top: true });
    $('#btn-settings').onclick = () => this.showSettings(false);
    $('#btn-menu').onclick = () => this.showSettings(true);
    $('#btn-codex').onclick = () => this.openScreen('codex');
    $('#btn-forge').onclick = () => this.openScreen('forge');
    $('#btn-mountain').onclick = () => this.openScreen('mountain');
    $('#btn-run').onclick = () => {
      if (!g.started || g.over) return;
      if (g.won && !g.endless) return;
      g.running = !g.running;
      if (g.running && g.wave === 0 && !g.waveActive) g.startWave();
    };
    $('#btn-speed').onclick = () => { g.speed = g.speed === 1 ? 2 : g.speed === 2 ? 3 : 1; };
    $('#btn-early').onclick = () => {
      if (!g.started || g.over || g.wave === 0) return;
      if (g.wave >= g.levelWaves && !g.endless) return;
      const b = g.callEarly();
      g.running = true;
      if (b) this.toast(`Gọi sớm: +${b} vàng`, '#F2D27A');
    };
    $('#btn-legend').onclick = () => { $('#legends').hidden = !$('#legends').hidden; this.renderLegends(); };
    // ủy quyền sự kiện cho các vùng dựng lại liên tục
    for (const id of ['#screen', '#bt-cmds', '#bt-items', '#bt-info', '#reward', '#result', '#story', '#campaign', '#settings', '#legends']) {
      $(id).addEventListener('click', (ev) => {
        const el = ev.target.closest('[data-act]');
        if (el && !el.disabled) this.action(el.dataset, el);
      });
    }
    window.addEventListener('keydown', (ev) => {
      if (!g.started) return;
      const k = ev.key.toLowerCase();
      const h = g.heroes[this.sel];
      if (k === 'escape') return this.screen ? this.closeScreen() : this.clearSel();
      if (this.screen || !h) return;
      if (k === 'u') this.doLevelUp(h);
    });
  }

  // ---------- luồng menu
  showMenu() {
    this.hideOverlays();
    $('#menu').hidden = false;
    const s = this.save;
    const total = s.stars.reduce((a, b) => a + b, 0);
    $('#menu-stars').innerHTML = `<span style="color:#FFD66B">★</span> ${total} / ${LEVELS.length * 3}`;
    $('#continue-label').textContent = `${this.game.started && !this.game.over && !this.game.won ? 'Chơi tiếp' : 'Vào trận'} · Ải ${s.last + 1}`;
    this.setInGame(false);
  }
  hideOverlays() {
    for (const id of ['#menu', '#story', '#campaign', '#settings', '#result', '#reward']) $(id).hidden = true;
  }
  setInGame(on) {
    document.querySelectorAll('.ingame').forEach((el) => { el.hidden = !on; });
    if (!on) { $('#legends').hidden = true; $('#bossbar').hidden = true; $('#coach').hidden = true; }
  }

  playLevel(i) {
    const g = this.game;
    // đang chơi dở đúng ải này thì quay lại trận
    if (g.started && !g.over && !g.won && g.level === i) {
      this.hideOverlays();
      this.setInGame(true);
      return;
    }
    if (!this.save.storySeen && !this.save.settings.skipStory) return this.showStory(i);
    this.startLevel(i);
  }

  startLevel(i) {
    const g = this.game;
    g.reset(i);
    g.started = true;
    g.running = false;
    g.speed = 1;
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1;
    this.screen = null;
    $('#screen').hidden = true;
    this.save.last = i;
    writeSave(this.save);
    this.hideOverlays();
    this.setInGame(true);
    this.toast(`Ải ${i + 1} · ${LEVELS[i].name}: giữ thành Phong Châu qua ${LEVELS[i].waves} đợt`, '#F2D27A');
  }

  // ---------- Mở đầu: Vua Hùng kén rể
  showStory(level) {
    this.storyStep = 0;
    this.storyLevel = level;
    this.hideOverlays();
    $('#story').hidden = false;
    this.renderStory();
  }
  renderStory() {
    const st = this.storyStep;
    const caps = [
      '<b>Vua Hùng thứ 18</b> có con gái là công chúa <b>Mị Nương</b>, muốn kén cho nàng một người chồng xứng đáng.',
      '<b>Sơn Tinh</b> và <span class="w">Thủy Tinh</span> cùng đến cầu hôn. Vua ra sính lễ: <b>voi chín ngà, gà chín cựa, ngựa chín hồng mao</b>.',
      'Sơn Tinh mang lễ đến trước, rước <b>Mị Nương</b> về núi. <span class="w">Thủy Tinh</span> đến sau, nổi giận <span class="w">dâng nước</span> đánh Sơn Tinh.',
    ];
    const leads = ['Ngày xưa, ở đất Phong Châu…', 'Ai mang đủ lễ vật đến trước thì được rước dâu.', 'Từ đó, năm nào Thủy Tinh cũng dâng nước đánh Sơn Tinh. Hãy giữ lấy thành Phong Châu!'];
    $('#story').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><span class="ic">${svgI(sceneArt('drum'))}</span><h1 class="ttl">Vua Hùng kén rể</h1>
        <span class="chip dark">Truyền thuyết Sơn Tinh – Thủy Tinh</span><div class="sp"></div></div>
      <div class="story-panels">${[0, 1, 2].map((i) => `
        <div class="st-card ${i <= st ? 'on' : ''} ${i === st && i === 2 ? 'cur' : ''}">
          <div class="well">${svgI(sceneArt('story' + (i + 1)))}<span class="num">${i + 1}</span></div>
          <div class="cap inset">${caps[i]}</div>
        </div>`).join('')}</div>
      <div class="story-foot metal">
        <div class="dots">${[0, 1, 2].map((i) => `<i class="${i === st ? 'on' : ''}"></i>`).join('')}</div>
        <span class="cnt">${st + 1}/3</span>
        <span class="lead">${leads[st]}</span>
        <button class="btn metal title" style="height:44px;font-size:18px;padding:0 20px" data-act="story-skip">Bỏ qua</button>
        <button class="btn btn-gold" style="height:46px;font-family:var(--title);font-size:20px;padding:0 24px" data-act="story-next">${st < 2 ? 'Tiếp' : 'Vào trận'} ▸</button>
      </div></div>`;
  }

  // ---------- Bản đồ chiến dịch dọc sông Đà
  showCampaign(sel) {
    this.cpSel = Math.min(sel ?? this.save.last, this.save.unlocked - 1);
    this.hideOverlays();
    this.setInGame(false);
    $('#campaign').hidden = false;
    this.renderCampaign();
  }
  renderCampaign() {
    const s = this.save;
    const i = this.cpSel;
    const lv = LEVELS[i];
    const NODES = [[60, 330], [140, 286], [225, 246], [292, 182], [367, 200], [432, 140], [506, 102], [608, 62]];
    const total = s.stars.reduce((a, b) => a + b, 0);
    const bosses = [...new Set(Object.values(lv.bosses))].map((b) => ENEMIES[b].name).join(', ');
    const starsOf = (n) => '★'.repeat(n) + `<i>${'★'.repeat(3 - n)}</i>`;
    $('#campaign').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><button class="xbtn metal" data-act="cp-back" aria-label="Quay lại">${ICON.back}</button>
        <h1 class="ttl">Chiến dịch dọc sông Đà</h1><span class="chip dark">★ ${total} / ${LEVELS.length * 3}</span><div class="sp"></div></div>
      <div class="cp-body">
        <div class="cp-map"><div class="bgart">${svgI(sceneArt('campaign'))}</div>
          ${NODES.map(([x, y], k) => {
            const lock = k >= s.unlocked;
            return `<button class="cp-node ${lock ? 'lock' : ''} ${k === i ? 'sel' : ''}" style="left:${x / 640 * 100}%;top:${y / 382 * 100}%" data-act="cp-sel" data-i="${k}" ${lock ? 'disabled' : ''}>
              <span class="stars">${lock ? '' : starsOf(s.stars[k])}</span>
              <span class="c">${lock ? ICON.lock : k + 1}</span>
              <span class="lb">${k + 1} · ${LEVELS[k].name}</span></button>`;
          }).join('')}
        </div>
        <div class="cp-side">
          <div class="hd"><span class="no">Ải ${i + 1}</span><span class="ttl">${lv.name}</span><span class="op">${s.stars[i] ? '★'.repeat(s.stars[i]) : 'Đang mở'}</span></div>
          <div class="sub">${lv.waves} đợt · boss <b>${bosses}</b></div>
          <div class="desc">${lv.desc}</div>
          <div class="cond inset"><div class="h">ĐIỀU KIỆN SAO</div>
            ${STAR_RULES.map((r, k) => `<div class="${s.stars[i] > k ? 'got' : ''}"><span>${'★'.repeat(k + 1)}</span><span>${r}</span></div>`).join('')}</div>
          <div class="hint-h">TƯỚNG GỢI Ý</div>
          <div class="heroes">${lv.hint.map((t) => `<span style="border-color:${ATTRS[HEROES[t].attr].color};color:${ATTRS[HEROES[t].attr].color}">${HEROES[t].name}</span>`).join('')}</div>
          <button class="go btn-gold" data-act="cp-go">⚔ Vào trận</button>
        </div>
      </div></div>`;
  }

  // ---------- Cài đặt / tạm dừng
  showSettings(inGame) {
    const g = this.game;
    this.pauseWasRunning = inGame && g.running;
    if (inGame) g.running = false;
    $('#settings').hidden = false;
    this.settingsInGame = inGame;
    this.renderSettings();
  }
  renderSettings() {
    const st = this.save.settings;
    const inGame = this.settingsInGame;
    const tg = (k, name, desc) => `<div class="tg metal"><div><b>${name}</b><small>${desc}</small></div><button class="sw ${st[k] ? 'on' : ''}" style="margin-left:auto" data-act="set" data-k="${k}" aria-label="${name}"></button></div>`;
    $('#settings').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${inGame ? 'Tạm dừng' : 'Cài đặt'}</h1>${inGame ? `<span class="chip dark">Ải ${this.game.level + 1} · ${LEVELS[this.game.level].name} · Đợt ${this.game.wave}</span>` : ''}<div class="sp"></div>
        <button class="xbtn metal" data-act="set-close" aria-label="Đóng">${ICON.close}</button></div>
      <div class="set-list">
        ${inGame ? `<div style="display:flex;gap:10px">
          <button class="btn btn-gold" style="flex:1.3;height:48px;font-family:var(--title);font-size:18px" data-act="set-close">▶ Tiếp tục</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="restart">Chơi lại</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="to-map">Bản đồ</button>
          <button class="btn metal title" style="flex:1;height:48px;font-size:16px" data-act="to-menu">Menu chính</button></div>` : ''}
        ${tg('dmgText', 'Hiện số sát thương', 'Số bay lên khi tướng đánh trúng quái')}
        ${tg('shake', 'Rung màn hình', 'Rung khi boss quẫy đuôi và khi tung chiêu tối thượng')}
        ${tg('skipStory', 'Bỏ qua cốt truyện', 'Không hiện màn Vua Hùng kén rể trước trận')}
        <div class="tg metal"><div><b>Xoá tiến trình</b><small>Xoá sao và các ải đã mở trên máy này</small></div>
          <button class="btn metal" style="margin-left:auto;color:#FFB08A;border-color:#C8401E" data-act="wipe">${this.wipeArmed ? 'Bấm lần nữa để xoá' : 'Xoá'}</button></div>
        <div class="note" style="text-align:center">Núi Cao Nước Dâng · Phiên bản 14 · Tiến trình lưu trên trình duyệt của bạn</div>
      </div></div>`;
  }

  // ---------- thông báo
  toast(msg, color = '#F2D27A') {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.borderLeftColor = color;
    el.innerHTML = msg;
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => el.remove(), 3200);
  }

  // ---------- chạm bản đồ
  slotAt(x, y) {
    let best = -1, bd = Infinity;
    CONFIG.slots.forEach(([sx, sy], i) => {
      const h = this.game.heroes[i];
      const d = h ? Math.min(Math.hypot(sx - x, sy - 26 - y), Math.hypot(sx - x, sy - y)) : Math.hypot(sx - x, sy - y);
      if (d < 34 && d < bd) { bd = d; best = i; }
    });
    return best;
  }

  clearSel() {
    this.sel = -1; this.spot = -1; this.armed = null; this.raising = false; this.moving = -1; this.sellArmed = false;
  }

  tapMap(x, y) {
    const g = this.game;
    if (!g.started) return;
    $('#legends').hidden = true;
    const slot = this.slotAt(x, y);
    if (this.raising) {
      if (slot >= 0 && g.canRaise(slot)) {
        const r = g.raiseSpot(slot);
        if (r !== true) this.toast(r, '#E25A3A');
        else this.toast('Mọc Núi! Ô này khô ráo vĩnh viễn', '#F2D27A');
      }
      this.raising = false;
      return;
    }
    if (this.moving >= 0) {
      if (slot >= 0 && slot !== this.moving && g.heroes[this.moving]) {
        g.moveHero(this.moving, slot);
        this.sel = slot;
      }
      this.moving = -1;
      return;
    }
    if (slot < 0) { this.sel = -1; this.spot = -1; this.armed = null; return; }
    if (g.heroes[slot]) {
      this.sel = slot;
      this.spot = -1;
      this.armed = null;
      this.sellArmed = false;
      return;
    }
    if (this.armed) return this.place(this.armed, slot);
    this.spot = this.spot === slot ? -1 : slot;
    this.sel = -1;
    if (this.spot >= 0 && g.isFlooded(slot)) this.toast('Ô đang ngập: dùng Mọc Núi để cứu ô này', '#5AB4D6');
  }

  pickSummon(type) {
    if (this.spot >= 0) return this.place(type, this.spot);
    this.armed = this.armed === type ? null : type;
    if (this.armed) this.toast(`Chạm vào ô trống để triệu hồi ${HEROES[type].name}`, '#F2D27A');
  }

  place(type, slot) {
    const g = this.game;
    const ok = g.canPlace(slot, type);
    if (ok !== true) return this.toast(ok, '#E25A3A');
    g.placeHero(slot, type);
    this.toast(`${HEROES[type].name} đã vào vị trí`, '#6AE06A');
    this.spot = -1;
    this.armed = null;
    this.sel = slot;
    $('#legends').hidden = true;
    if (g.heroes.filter(Boolean).length === 2 && !g.flags.dragTip) {
      g.flags.dragTip = true;
      setTimeout(() => this.toast('Mẹo: giữ và kéo tướng sang ô khác để đổi vị trí', '#9dffc4'), 900);
    }
  }

  doLevelUp(h) {
    const r = this.game.levelUp(h);
    if (r !== true) this.toast(r, '#E25A3A');
  }

  // ---------- bảng triệu hồi
  buildSummon() {
    $('#sm-grid').innerHTML = BASIC_HEROES.map((t) => {
      const d = HEROES[t];
      return `<button class="sm-btn inset" data-type="${t}" style="border-color:${ATTRS[d.attr].color}" aria-label="${d.name}, ${d.cost} vàng">
        <img src="${heroImgUrl(t, 'head')}" alt=""><span class="cost">${d.cost}</span></button>`;
    }).join('');
    $('#sm-grid').querySelectorAll('.sm-btn').forEach((b) => { b.onclick = () => this.pickSummon(b.dataset.type); });
    $('#lg-grid').innerHTML = LEGEND_HEROES.map((t) => {
      const d = HEROES[t];
      return `<button class="lg-btn inset ${d.legend}" data-act="legend" data-type="${t}" aria-label="${d.name}, ${d.cost} vàng">
        <img src="${heroImgUrl(t)}" alt=""><span class="nm">${d.name}</span><span class="cost">${d.cost}</span></button>`;
    }).join('');
  }
  renderLegends() {
    const g = this.game;
    $('#lg-count').textContent = `Trên sân ${g.legendCount()}/${CONFIG.maxLegends} · Sử thi 180 · Huyền thoại 260`;
    document.querySelectorAll('.lg-btn').forEach((b) => {
      const d = HEROES[b.dataset.type];
      b.classList.toggle('poor', g.gold < d.cost);
      b.classList.toggle('sel', this.legendPick === b.dataset.type || this.armed === b.dataset.type);
    });
    const t = this.legendPick;
    $('#lg-info').innerHTML = t ? `<b>${HEROES[t].name}</b> · ${RARITY[HEROES[t].legend].name} · ${ATTRS[HEROES[t].attr].name} — <b>${HEROES[t].trait.name}:</b> ${HEROES[t].trait.desc}. Chạm lần nữa để triệu hồi.`
      : 'Chạm vào một tướng để xem đặc trưng, chạm lần nữa để triệu hồi vào ô đang chọn (hoặc chạm ô trống sau đó).';
  }

  // ============================================================
  //  CẬP NHẬT MỖI KHUNG HÌNH
  // ============================================================
  tick(dt) {
    const g = this.game;
    this.handleEvents();
    if (!g.started) return;
    const inGame = $('#menu').hidden && $('#campaign').hidden && $('#story').hidden;
    if (!inGame) return;
    this.updateTopbar();
    this.updateNextWaves();
    this.updateBoss();
    this.updateSummon();
    this.updateBottom();
    this.drawMinimap();
    this.updateCoach();
    if (!$('#legends').hidden) this.renderLegends();
    $('#paused-tag').hidden = g.running || g.wave === 0 || g.over || !!this.screen || !$('#settings').hidden;
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
        this.toast(`<b>Quái mới: ${d.name}</b> · ${d.short || d.desc}`, d.boss ? '#E25A3A' : '#5AB4D6');
      } else if (ev.type === 'reward') {
        this.showReward(ev);
      } else if (ev.type === 'boss') {
        this.banner(ev.champion ? 'Quái khổng lồ' : 'Boss xuất hiện', ev.name);
      } else if (ev.type === 'victory') {
        this.finishLevel(true);
      } else if (ev.type === 'defeat') {
        this.finishLevel(false);
      }
    }
  }

  banner(sub, text) {
    $('#banner-sub').textContent = sub;
    $('#banner-text').textContent = text;
    const b = $('#banner');
    b.hidden = false;
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    clearTimeout(this.bannerT);
    this.bannerT = setTimeout(() => { b.hidden = true; }, 2600);
  }

  setHTML(sel, key, html) {
    if (this.sig[sel] === key) return;
    this.sig[sel] = key;
    $(sel).innerHTML = html;
  }
  setText(sel, v) {
    const el = $(sel);
    if (el.textContent !== String(v)) el.textContent = v;
  }

  updateTopbar() {
    const g = this.game;
    const total = g.levelWaves;
    this.setText('#tb-wave', g.endless ? `Đợt ${g.wave} · Vô tận` : `Đợt ${g.wave} / ${total}`);
    const prog = g.waveActive && g.waveTotal ? 1 - (g.spawnQueue.length + g.enemies.length * 0.5) / (g.waveTotal * 1.5) : 0;
    $('#tb-fill').style.width = `${Math.max(0, Math.min(1, ((g.wave - 1 + Math.max(0, prog)) / total))) * 100}%`;
    this.setText('#tb-gold b', fmt(g.gold));
    this.setText('#tb-lives b', g.lives);
    this.setText('#tb-water b', `${g.water}/3`);
    this.setText('#btn-mountain', `Núi · ${g.mountainStage()}`);
    $('#btn-speed').textContent = 'x' + g.speed;
    $('#btn-speed').classList.toggle('on', g.speed > 1);
    const run = $('#btn-run');
    run.classList.toggle('go', !g.running);
    $('#run-icon').setAttribute('d', g.running ? 'M5 5 H15 V15 H5 Z' : 'M6 4 L16 10 L6 16 Z');
    run.setAttribute('aria-label', g.running ? 'Dừng' : 'Bắt đầu');
    const b = g.earlyBonus();
    const can = g.wave > 0 && !(g.wave >= g.levelWaves && !g.endless);
    this.setHTML('#btn-early', `${can}|${b}`, can ? `Gọi sớm <small>+${b}</small>` : 'Gọi sớm');
    $('#btn-early').disabled = !can;
  }

  updateNextWaves() {
    const g = this.game;
    const parts = [];
    if (!g.waveActive && g.wave < g.levelWaves && g.nextWaveT > 0 && g.wave > 0 && g.running) {
      parts.push(`<span><b>Đợt ${g.wave + 1}</b> sau <span class="cd">${Math.ceil(g.nextWaveT)}s</span></span>`);
    }
    // loại quái chính của đợt kế
    const cnt = {};
    for (const s of g.nextWave) cnt[s.type] = (cnt[s.type] || 0) + 1;
    const main = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const kindTxt = (n) => {
      const k = waveKind(n, g.level);
      const b = bossAt(n, g.level);
      if (k === 'boss') return `<span class="boss">Boss ${ENEMIES[b].name}</span>`;
      if (k === 'air') return 'Chim Bão <span class="air">(bay)</span>';
      if (k === 'champion') return 'Rùa khổng lồ';
      return null;
    };
    const lim = g.endless ? Infinity : g.levelWaves;
    if (g.wave + 1 <= lim && !parts.length) parts.push(`<span><b>Đợt ${g.wave + 1}</b> ${kindTxt(g.wave + 1) || (main ? ENEMIES[main].name : '')}</span>`);
    for (let n = g.wave + 2; n <= Math.min(lim, g.wave + 12) && parts.length < 3; n++) {
      const t = kindTxt(n);
      if (t) parts.push(`<span><b>Đợt ${n}</b> ${t}</span>`);
    }
    if (g.floodSoon() >= 0) parts.push(`<span class="flood">💧 Nước sắp dâng: ô bậc ${TIER_NAMES[g.floodSoon()]}</span>`);
    const html = parts.join('');
    this.setHTML('#nextwaves', html, html);
    $('#nextwaves').hidden = !html;
  }

  updateBoss() {
    const b = this.game.boss;
    $('#bossbar').hidden = !b;
    if (!b) return;
    this.setText('#bb-name', b.champion ? `${b.def.name} khổng lồ` : b.def.name);
    this.setText('#bb-hp', `${fmt(Math.max(0, b.hp))} / ${fmt(b.maxHp)}${b.reviveT > 0 ? ' · đang lặn' : ''}`);
    $('#bb-fill').style.width = `${Math.max(0, b.hp / b.maxHp) * 100}%`;
  }

  updateSummon() {
    const g = this.game;
    document.querySelectorAll('.sm-btn').forEach((b) => {
      const d = HEROES[b.dataset.type];
      b.classList.toggle('poor', g.gold < d.cost);
      b.classList.toggle('armed', this.armed === b.dataset.type);
    });
    $('#btn-legend').classList.toggle('on', !$('#legends').hidden);
  }

  // ---------- bảng điều khiển dưới
  updateBottom() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) this.sel = -1;
    const t = performance.now() / 1000;
    // chân dung
    const pc = $('#portrait');
    if (h) drawHeroPortrait(pc, h, t);
    else if (this.sig.portrait !== 'none') { pc.getContext('2d').clearRect(0, 0, pc.width, pc.height); }
    this.sig.portrait = h ? h.id : 'none';
    const st = h ? heroStats(h) : null;
    $('#pt-hp').style.width = h ? `${Math.max(0, h.hp / st.hpMax) * 100}%` : '0';
    $('#pt-mp').style.width = h ? `${Math.max(0, h.mana / st.maxMana) * 100}%` : '0';
    this.setText('#pt-star', h ? '★'.repeat(h.tier || 0) : '');

    // thông tin
    let infoKey, info;
    if (h) {
      const def = HEROES[h.type];
      const lc = g.levelCost(h);
      const t2 = h.tier || 0;
      const act = h.castT > 0 ? `Đang thi triển: ${def.skills.find((s, i) => SKILL_COLOR[s.active && s.active.cast] === h.castColor)?.name || ''}` :
        h.dead ? `Hồi sinh sau ${Math.ceil(h.respawnT)} giây` : h.bogged ? 'Sa lầy: −50% tốc đánh, không hồi năng lượng' : h.stunT > 0 ? 'Đang bị choáng' : '';
      infoKey = `h|${h.id}|${h.level}|${t2}|${g.gold >= lc}|${g.gold >= (COSTS.evo[t2] || 0)}|${act}|${this.sellArmed}`;
      info = `<div class="nm"><span class="ttl">${def.name}</span><small>Cấp ${h.level}</small></div>
        <div class="tags"><span class="${ATTR_CLS[def.attr]}">${ATTRS[def.attr].name}</span>
          ${t2 ? `<span style="background:#3A2410;color:#FFD66B">★ Bậc ${t2}</span>` : ''}
          ${def.legend ? `<span style="background:#3A2410;color:${RARITY[def.legend].color}">${RARITY[def.legend].name}</span>` : ''}
          <span style="background:#2A1810;color:#FFB08A">${def.dmgType === 'magic' ? 'Phép' : 'Vật lý'}</span>
          <span style="background:#1A1610;color:#C8BFA8">Ô ${TIER_NAMES[CONFIG.slotTier[h.slot]]}</span></div>
        <div class="kv"><span class="k">Nâng cấp</span>${h.level < CONFIG.maxLevel ? `<span class="v">Cấp ${h.level + 1}:</span><span class="g ${g.gold < lc ? 'no' : ''}">${coin(1)}${lc}</span>` : '<span class="v">Đã tối đa</span>'}</div>
        <div class="kv"><span class="k">Tiến hoá</span>${t2 < 3 ? `<span class="v">${'★'.repeat(t2 + 1)}:</span><span class="g ${g.gold < COSTS.evo[t2] ? 'no' : ''}">${coin(1)}${COSTS.evo[t2]}</span><span class="v" style="color:#C8BFA8">cần cấp ${COSTS.evoReq[t2]}</span>` : '<span class="v">★★★ cao nhất</span>'}</div>
        ${def.trait ? `<div class="kv"><span class="k">Đặc trưng</span><span class="v" style="color:#FFD66B">${def.trait.name}</span></div>` : ''}
        <div class="act">${act || `Sát thương ${Math.round(st.damage)} · Tầm ${Math.round(st.range)} · Đã hạ ${h.kills}`}</div>`;
    } else if (this.spot >= 0) {
      const s = this.spot;
      infoKey = `s|${s}|${g.isFlooded(s)}|${g.raised[s]}`;
      info = `<div class="nm"><span class="ttl">Ô bậc ${TIER_NAMES[CONFIG.slotTier[s]]}</span><small>${g.raised[s] ? 'Đã Mọc Núi' : g.isFlooded(s) ? 'Đang ngập' : 'Khô ráo'}</small></div>
        <div class="empty">${g.isFlooded(s) ? 'Ô ngập nước: không triệu hồi được. Bấm <b style="color:#FFD66B">Mọc Núi</b> rồi chạm ô này để cứu.' :
          'Chọn một tướng ở bảng <b style="color:#FFD66B">Triệu hồi</b> bên trái (hoặc ★ Huyền thoại).<br>' +
          ['Ô Thấp sát sông đánh được nhiều quái nhưng ngập trước (sau đợt boss 10).', 'Ô Giữa ngập sau đợt boss 20.', 'Ô Cao trên sườn núi an toàn, xa đường quái hơn.'][CONFIG.slotTier[s]]}</div>`;
    } else {
      infoKey = 'none';
      info = `<div class="nm"><span class="ttl">Sơn Tinh</span><small>giữ thành Phong Châu</small></div>
        <div class="empty">Chạm vào bãi cỏ sát sông để chọn ô, rồi triệu hồi tướng.<br>Chạm vào tướng để nâng cấp, mở kỹ năng, mặc đồ.<br>Giữ và kéo tướng để đổi chỗ.</div>`;
    }
    this.setHTML('#bt-info', infoKey, info);

    // 6 ô đồ
    const itemsKey = h ? `${h.id}|${SLOTS.map((s) => h.equip[s] ? h.equip[s].uid + ':' + h.equip[s].plus + h.equip[s].rarity : '').join()}` : 'none';
    const order = ['weapon', 'acc1', 'helmet', 'acc2', 'armor', 'acc3'];
    this.setHTML('#bt-items', itemsKey, order.map((s) => {
      const inst = h && h.equip[s];
      const lab = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp' }[s] || '';
      return `<button class="it-slot inset ${inst ? rarCls(inst.rarity) : ''}" data-act="slot" data-slot="${s}" ${h ? '' : 'disabled'} aria-label="${SLOT_NAMES[s]}${inst ? ': ' + ITEMS[inst.id].name : ' trống'}">
        ${inst ? svgI(itemIcon(inst.id)) + (inst.plus ? `<span class="lv">+${inst.plus}</span>` : '') : `<span class="ph">${lab}</span>`}</button>`;
    }).join(''));

    // lưới lệnh 4×3
    const mocMax = g.mocMax();
    const cmdKey = h ? `${h.id}|${h.level}|${h.skillPts}|${JSON.stringify(h.skillLv)}|${g.gold}|${Math.ceil(h.mana / 10)}|${def0(h)}|${g.moc}|${this.raising}|${this.moving}|${this.sellArmed}|${t2cd(h)}|${h.dead}`
      : `none|${g.moc}|${this.raising}`;
    if (this.sig.cmds !== cmdKey) {
      this.sig.cmds = cmdKey;
      $('#bt-cmds').innerHTML = this.renderCmds(h, mocMax);
    }
  }

  renderCmds(h, mocMax) {
    const g = this.game;
    const cells = [];
    if (h) {
      const def = HEROES[h.type];
      const st = heroStats(h);
      def.skills.forEach((sk, i) => {
        const lv = skillLevel(h, i);
        if (!lv) {
          const can = h.level >= COSTS.unlockReq[i];
          cells.push(`<button class="cmd inset" data-act="cmd-skill" data-i="${i}" aria-label="${SKILL_KEYS[i]} ${sk.name}, khóa, mở bằng ${COSTS.unlock[i]} vàng">
            <span class="lockp">${ICON.lock}<b class="${g.gold < COSTS.unlock[i] || !can ? 'no' : ''}">${can ? COSTS.unlock[i] : 'cấp ' + COSTS.unlockReq[i]}</b></span><span class="hk" style="color:#7A705C">${SKILL_KEYS[i]}</span></button>`);
          return;
        }
        const cd = sk.active ? Math.max(0, h.skillCd[sk.id] || 0) : 0;
        const max = sk.active ? sk.active.cooldown * (1 - st.cdr / 100) : 1;
        const noMana = sk.active && h.mana < sk.active.mana;
        cells.push(`<button class="cmd metal ${i === 0 ? 'q' : ''} ${noMana ? 'nomana' : ''}" data-act="cmd-skill" data-i="${i}" aria-label="${SKILL_KEYS[i]} ${sk.name}">
          ${svgI(skillIcon(h.type, i))}<span class="hk">${SKILL_KEYS[i]}</span>
          ${cd > 0.4 ? `<span class="cdov" style="height:${Math.min(100, cd / max * 100)}%"></span><span class="cdn">${Math.ceil(cd)}</span>` : `<span class="cdn" style="font-size:10px">${lv}</span>`}</button>`);
      });
    } else {
      for (let i = 0; i < 4; i++) cells.push(`<div class="cmd inset blank"><span class="hk" style="color:#5C4620">${SKILL_KEYS[i]}</span></div>`);
    }
    cells.push(`<button class="cmd moc ${this.raising ? 'on' : ''}" data-act="moc" ${g.moc <= 0 ? 'disabled' : ''} aria-label="Mọc Núi, còn ${g.moc} lượt">${ICON.mount}<span class="cdn">${g.moc}/${mocMax}</span></button>`);
    if (h) {
      cells.push(`<button class="cmd metal small ${this.moving >= 0 ? 'armed' : ''}" data-act="move" aria-label="Đổi chỗ">${ICON.swap}<span>Đổi chỗ</span></button>`);
      cells.push(`<button class="cmd metal small ${this.sellArmed ? 'armed' : ''}" data-act="sell" aria-label="Bán tướng">${coin()}<span>${this.sellArmed ? `+${g.sellValue(h)}?` : 'Bán 60%'}</span></button>`);
      cells.push(`<button class="cmd metal ${h.skillPts ? 'up' : ''}" data-act="open-skills" aria-label="Nâng kỹ năng, còn ${h.skillPts} điểm">${ICON.up}${h.skillPts ? `<span class="badge">${h.skillPts}</span>` : ''}</button>`);
      const lc = g.levelCost(h);
      cells.push(`<button class="cmd metal wide" data-act="levelup" ${h.level >= CONFIG.maxLevel ? 'disabled' : ''} aria-label="Nâng cấp tướng">${ICON.dup}
        <span class="lab"><b>Nâng cấp</b><span>${h.level >= CONFIG.maxLevel ? 'Tối đa' : coin(1) + lc}</span></span><span class="hk">U</span></button>`);
      cells.push(`<button class="cmd metal small" data-act="open-evo" aria-label="Tiến hoá"><span style="color:#FFD66B;font-size:15px;line-height:1">${'★'.repeat(Math.max(1, (h.tier || 0)))}</span><span>Tiến hoá</span></button>`);
      cells.push(`<button class="cmd metal small" data-act="open-bag" aria-label="Túi đồ">${ICON.bag}<span>Túi ${g.inventory.length}</span></button>`);
    } else {
      cells.push('<div class="cmd inset blank"></div>', '<div class="cmd inset blank"></div>', '<div class="cmd inset blank"></div>');
      cells.push(`<button class="cmd metal small" data-act="open-bag" style="grid-column:span 2" aria-label="Túi đồ">${ICON.bag}<span>Túi đồ ${g.inventory.length}/${CONFIG.bagSize}</span></button>`);
      cells.push('<div class="cmd inset blank"></div>', '<div class="cmd inset blank"></div>');
    }
    return cells.join('');
  }

  drawMinimap() {
    const cv = $('#minimap');
    const c = cv.getContext('2d');
    const g = this.game;
    const k = cv.width / CONFIG.W;
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (ready(mapImg)) c.drawImage(mapImg, 0, 0, cv.width, cv.height);
    else { c.fillStyle = '#2F4A22'; c.fillRect(0, 0, cv.width, cv.height); }
    c.setTransform(k, 0, 0, cv.height / CONFIG.H, 0, 0);
    if (g.water > 0) { c.globalAlpha = 0.35; strokePath(c, CONFIG.path, (104 + g.water * 70) * DK, '#2C6A86'); c.globalAlpha = 1; }
    for (const e of g.enemies) circle(c, e.x, e.y, e.def.boss ? 26 : 13, e.def.boss ? '#FF4A2A' : '#E25A3A');
    for (const h of g.heroes) if (h) circle(c, h.x, h.y, 13, h.slot === this.sel ? '#FFD66B' : '#3EDC4E');
    c.strokeStyle = '#ffffff';
    c.lineWidth = 8;
    c.strokeRect(4, 60, CONFIG.W - 8, 320);
  }

  updateCoach() {
    const g = this.game;
    const coach = $('#coach');
    let pos = null, text = '';
    this.coachSlot = -1;
    if (!g.over && !this.screen && $('#reward').hidden && $('#settings').hidden) {
      const heroes = g.heroes.filter(Boolean);
      if (!heroes.length && this.spot < 0 && !this.armed) {
        this.coachSlot = CONFIG.coachSlot;
        const [x, y] = CONFIG.slots[CONFIG.coachSlot];
        pos = [x / DK, y / DK - 30];
        text = 'Chạm vào ô cỏ sát sông để chọn chỗ đặt tướng';
      } else if (!heroes.length) {
        pos = [180, 140];
        text = '← Chọn một tướng ở bảng Triệu hồi';
      } else if (g.wave === 0 && !g.running) {
        pos = [800, 66];
        text = 'Bấm ▶ để quân Thủy Tinh tràn tới';
      } else if (g.floodSoon() >= 0 && !g.flags.floodTip && g.moc > 0) {
        pos = [560, 250];
        text = 'Nước sắp dâng! Bấm Mọc Núi rồi chạm ô nhấp nháy để cứu tướng';
      }
      if (g.water > 0) g.flags.floodTip = true;
      if (g.wave >= 1 && !g.waveActive && !g.flags.gearTip && heroes.length) {
        g.flags.gearTip = true;
        this.toast('Mẹo: chạm vào tướng, bấm <b>Nâng cấp</b> bằng vàng để lên cấp và có điểm kỹ năng', '#9dffc4');
      } else if (g.wave >= 3 && !g.waveActive && !g.flags.shopTip && g.gold >= 100) {
        g.flags.shopTip = true;
        this.toast('Mẹo: mua nguyên liệu và đúc đồ ở <b>Lò đúc</b>; mặc đồ là tướng đổi hình dạng', '#9dffc4');
      }
    }
    coach.hidden = !pos;
    if (!pos) return;
    if (coach.textContent !== text) coach.textContent = text;
    const w = coach.offsetWidth;
    coach.style.left = Math.max(4, Math.min(932 - w - 4, pos[0] - w / 2)) + 'px';
    coach.style.top = Math.max(48, pos[1] - 30) + 'px';
  }

  // ============================================================
  //  SÍNH LỄ, KẾT QUẢ
  // ============================================================
  showReward(ev) {
    this.rewardOpts = ev.options;
    this.rewardBoss = ev.boss;
    this.closeScreen();
    const g = this.game;
    const flood = g.water < 3;
    const gift = ev.options[0], jar = ev.options[1], misc = ev.options[2];
    const art = { voi_chin_nga: 'voi', ga_chin_cua: 'ga', ngua_hong_mao: 'ngua' }[gift.id];
    const it = ITEMS[gift.id];
    const jit = ITEMS[jar.id];
    $('#reward').innerHTML = `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">Chọn sính lễ</h1><span class="chip dark">Đợt ${g.wave}</span>
        <span class="chip ok">✓ Đã hạ ${ENEMIES[ev.boss].name}</span><span class="chip goldc">Chọn 1 trong 3</span><div class="sp"></div>
        <div class="goldbox inset">${coin()}${fmt(g.gold)}</div></div>
      <div class="sl-title">Vua Hùng ban thưởng</div>
      <div class="sl-cards">
        <div class="sl-card gift"><div class="sl-well">${svgI(sceneArt(art))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">SÍNH LỄ</span><span class="sl-tag" style="right:6px;background:#F0A030;color:#2A1A08">Huyền thoại</span></div>
          <div class="sl-name">${it.name}</div><div class="sl-desc">${esc(it.desc)}<br><b>${statLine(it.stats)}</b></div>
          <button class="sl-pick btn-gold" data-act="reward" data-i="0">Chọn</button></div>
        <div class="sl-card jar"><div class="sl-well">${svgI(sceneArt('hubau'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">HŨ BÁU</span><span class="sl-tag" style="right:6px;background:#A86CE0;color:#1A0A28">Sử thi+</span></div>
          <div class="sl-name">Hũ Vua Hùng</div><div class="sl-desc">Mở ra ngẫu nhiên 1 món đồ <b style="color:#C8A0F0">Sử thi</b> hoặc <b>Huyền thoại</b>.<br>Lần này: <span class="c-${jit.rarity}">${jit.name}</span></div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="1">Chọn</button></div>
        <div class="sl-card misc"><div class="sl-well">${svgI(sceneArt('kholua'))}<span class="sl-tag" style="left:6px;background:#0D0B08;border:1px solid #8C6A2E;color:#F2E6C8">${misc.kind === 'treasure' ? 'KHO LÚA' : 'HỘI LÀNG'}</span><span class="sl-tag" style="right:6px;background:#12301A;border:1px solid #3EDC4E;color:#6AE06A">Ngẫu nhiên</span></div>
          <div class="sl-name">${misc.title}</div>
          <div class="sl-desc">${misc.kind === 'treasure' ? `<span style="font-size:17px;font-weight:800;color:#FFD66B">${coin()} +${misc.gold} vàng</span> <span style="font-size:17px;font-weight:800;color:#FF8A6A">♥ +${misc.lives} mạng</span>`
            : '<span class="g">Mọi tướng trên sân +2 cấp</span> (kèm 2 điểm kỹ năng)'}<br>Lần khác có thể là: ${misc.kind === 'treasure' ? '<span class="g">Hội làng mừng thắng: mọi tướng +2 cấp</span>' : '<span class="g">Kho lúa · Đắp thành: vàng và +3 mạng</span>'}</div>
          <button class="sl-pick metal" style="color:#F2D27A" data-act="reward" data-i="2">Chọn</button></div>
      </div>
      ${flood ? `<div class="sl-warn"><span style="font-size:20px">💧</span><span style="flex:1"><b>Thủy Tinh dâng nước:</b> sau đợt này, các ô bậc <b>${TIER_NAMES[g.water]}</b> sẽ ngập và tướng đứng đó bị sa lầy. Dùng <span class="m">Mọc Núi</span> để cứu ô quan trọng.</span></div>` : ''}
    </div>`;
    $('#reward').hidden = false;
  }

  pickReward(i) {
    const o = this.rewardOpts[i];
    this.game.claimReward(o);
    $('#reward').hidden = true;
    if (o.kind === 'item') this.toast(`Nhận ${ITEMS[o.id].name}! Mở Túi đồ để đeo cho tướng`, RARITY[ITEMS[o.id].rarity].color);
    else if (o.kind === 'treasure') this.toast(`+${o.gold} vàng, +${o.lives} mạng`, '#F2D27A');
    else this.toast('Mọi tướng +2 cấp!', '#6AE06A');
  }

  finishLevel(win) {
    const g = this.game;
    const s = this.save;
    const lv = g.level;
    let stars = 0;
    if (win) {
      stars = g.stars();
      s.stars[lv] = Math.max(s.stars[lv], stars);
      s.unlocked = Math.max(s.unlocked, Math.min(LEVELS.length, lv + 2));
    }
    s.best[lv] = Math.max(s.best[lv] || 0, g.wave);
    writeSave(s);
    this.closeScreen();
    $('#reward').hidden = true;
    const rows = `<div><span>⚑ Đợt</span><b>${g.wave}/${g.levelWaves}</b></div>
      <div><span>♥ Mạng còn</span><b style="color:#FF8A6A">${g.lives}/${CONFIG.startLives}</b></div>
      <div><span>✕ Quái đã hạ</span><b>${fmt(g.stats.kills)}</b></div>
      <div><span>${coin()} Vàng nhận</span><b style="color:#FFD66B">+${fmt(g.stats.goldEarned)}</b></div>
      <div><span>Tướng trên sân</span><b>${g.heroes.filter(Boolean).length}</b></div>`;
    const name = `Ải ${lv + 1} · ${LEVELS[lv].name}`;
    const html = win ? `<div class="screen" style="z-index:auto">
      <div class="scr-head metal"><h1 class="ttl">${name}</h1><span class="chip ok">✓ Đã giữ thành</span><div class="sp"></div></div>
      <div class="res-body">
        <div class="res-art">${svgI(sceneArt('win'))}<span class="tg2">NƯỚC RÚT</span></div>
        <div class="res-main">
          <div class="res-title win">Chiến thắng!</div>
          <div class="res-stars">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></div>
          <div class="res-grid"><div class="res-table inset">${rows}</div>
            <div class="res-tips"><div class="h" style="color:#D9B25A">ĐIỀU KIỆN SAO</div>
              ${STAR_RULES.map((r, k) => `<div class="t"><i style="border-color:${stars > k ? '#3EDC4E' : '#5C4620'};color:${stars > k ? '#6AE06A' : '#7A705C'}">${k + 1}</i><span>${r}</span></div>`).join('')}</div></div>
          <div class="res-btns">
            ${lv + 1 < LEVELS.length ? '<button class="btn-gold" data-act="next-level">Ải tiếp theo ›</button>' : '<button class="btn-gold" data-act="endless">Năm nào cũng dâng nước ›</button>'}
            <button class="metal" style="color:#F2D27A" data-act="endless">Chơi vô tận</button>
            <button class="metal" style="color:#F2D27A" data-act="restart">↻ Chơi lại</button>
            <button class="metal" style="color:#F2D27A" data-act="to-map">Bản đồ</button></div>
        </div></div></div>`
      : `<div class="screen" style="z-index:auto">
      <div class="scr-head metal" style="border-color:#C8401E"><h1 class="ttl">${name}</h1><span class="chip run">Thành đã mất</span><div class="sp"></div></div>
      <div class="res-body">
        <div class="res-art" style="border-color:#2C6A86">${svgI(sceneArt('lose'))}<span class="tg2" style="border-color:#5AB4D6;color:#9EDDF2">NƯỚC NGẬP THÀNH</span></div>
        <div class="res-main">
          <div class="res-title lose">💧 Phong Châu thất thủ</div>
          <div style="display:flex;gap:12px;align-items:center"><div class="inset" style="padding:8px 16px;border-radius:6px;font-size:15px">Dừng ở đợt <b style="font-family:var(--title);font-size:34px;color:#9EDDF2">${g.wave}</b><span style="font-family:var(--title);font-size:20px;color:#9EDDF2">/${g.levelWaves}</span></div>
            <div style="flex:1"><div class="inset" style="height:12px;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${g.wave / g.levelWaves * 100}%;background:linear-gradient(90deg,#2C6A86,#5AB4D6)"></i></div>
            <div class="note" style="margin-top:4px">Kỷ lục ải này: đợt ${s.best[lv]}</div></div></div>
          <div class="res-tips"><div class="h">💡 MẸO LẦN SAU</div>
            <div class="t"><i>1</i><span>Dùng <b>Mọc Núi</b> trước khi nước dâng để giữ các ô quan trọng khỏi ngập.</span></div>
            <div class="t"><i>2</i><span>Đặt tướng <b>đánh xa</b> cho đợt <b style="color:#9EDDF2">Chim Bão</b> (quái bay).</span></div>
            <div class="t"><i>3</i><span>Nâng cấp tướng bằng <b>vàng</b> giữa các đợt; mở khóa W, E, R trong Cây kỹ năng.</span></div></div>
          <div class="res-btns">
            <button class="btn-gold" data-act="restart">↻ Chơi lại</button>
            <button class="metal" style="color:#F2D27A" data-act="to-map">Bản đồ</button>
            <button class="metal" style="color:#F2D27A" data-act="to-menu">Menu chính</button></div>
        </div></div></div>`;
    $('#result').innerHTML = html;
    $('#result').hidden = false;
  }

  // ============================================================
  //  HÀNH ĐỘNG (data-act)
  // ============================================================
  action(d) {
    const g = this.game;
    const sc = this.screen;
    const h = g.heroes[this.sel];
    const fail = (r) => { if (r !== true && typeof r === 'string') this.toast(r, '#E25A3A'); return r === true; };
    switch (d.act) {
      // ----- menu, truyện, chiến dịch, cài đặt
      case 'story-next':
        if (this.storyStep < 2) { this.storyStep++; this.renderStory(); } else { this.save.storySeen = true; writeSave(this.save); this.startLevel(this.storyLevel); }
        break;
      case 'story-skip': this.save.storySeen = true; writeSave(this.save); this.startLevel(this.storyLevel); break;
      case 'cp-back': this.showMenu(); break;
      case 'cp-sel': this.cpSel = +d.i; this.renderCampaign(); break;
      case 'cp-go': this.save.last = this.cpSel; this.playLevel(this.cpSel); break;
      case 'set':
        this.save.settings[d.k] = !this.save.settings[d.k];
        writeSave(this.save);
        this.renderSettings();
        break;
      case 'set-close':
        $('#settings').hidden = true;
        if (this.settingsInGame && this.pauseWasRunning) g.running = true;
        this.wipeArmed = false;
        break;
      case 'wipe':
        if (!this.wipeArmed) { this.wipeArmed = true; this.renderSettings(); break; }
        this.save = loadSave();
        this.save.stars = LEVELS.map(() => 0); this.save.unlocked = 1; this.save.last = 0; this.save.best = {}; this.save.storySeen = false;
        writeSave(this.save);
        this.wipeArmed = false;
        this.toast('Đã xoá tiến trình', '#E25A3A');
        this.renderSettings();
        break;
      case 'restart': this.startLevel(g.level); break;
      case 'to-map': this.showCampaign(g.level); break;
      case 'to-menu': $('#settings').hidden = true; this.showMenu(); break;
      case 'next-level': this.save.last = Math.min(LEVELS.length - 1, g.level + 1); writeSave(this.save); this.showCampaign(this.save.last); break;
      case 'endless':
        g.endless = true;
        g.running = true;
        $('#result').hidden = true;
        this.toast('Năm nào cũng dâng nước: quái mạnh dần, boss mỗi 10 đợt', '#5AB4D6');
        break;
      case 'reward': this.pickReward(+d.i); break;
      case 'legend': {
        const t = d.type;
        if (this.legendPick === t) {
          if (this.spot >= 0) this.place(t, this.spot);
          else { this.armed = t; $('#legends').hidden = true; this.toast(`Chạm vào ô trống để triệu hồi ${HEROES[t].name}`, '#F0A030'); }
        } else this.legendPick = t;
        this.renderLegends();
        break;
      }

      // ----- bảng điều khiển dưới
      case 'cmd-skill': {
        if (!h) break;
        const i = +d.i;
        if (!skillLevel(h, i) && h.level >= COSTS.unlockReq[i] && g.gold >= COSTS.unlock[i]) {
          if (fail(g.unlockSkill(h, i))) this.toast(`Mở khóa [${SKILL_KEYS[i]}] ${HEROES[h.type].skills[i].name}!`, '#A86CE0');
        } else this.openScreen('skills', { skill: i });
        break;
      }
      case 'moc':
        this.raising = !this.raising;
        this.moving = -1;
        if (this.raising) this.toast('Chạm vào ô ngập (hoặc sắp ngập) để Mọc Núi', '#F2D27A');
        break;
      case 'move':
        this.moving = this.moving >= 0 ? -1 : this.sel;
        if (this.moving >= 0) this.toast('Chạm vào ô muốn chuyển tướng tới (ô có tướng thì đổi chỗ)', '#9dffc4');
        break;
      case 'sell':
        if (!h) break;
        if (!this.sellArmed) { this.sellArmed = true; break; }
        this.toast(`Đã bán ${HEROES[h.type].name}: +${g.sellValue(h)} vàng`, '#F2D27A');
        g.sellHero(this.sel);
        this.clearSel();
        break;
      case 'levelup': if (h) this.doLevelUp(h); break;
      case 'open-skills': this.openScreen('skills', { skill: 0 }); break;
      case 'open-evo': this.openScreen('evo'); break;
      case 'open-bag': this.openScreen('bag', { slot: null }); break;
      case 'slot': this.openScreen('bag', { slot: d.slot }); break;

      // ----- màn hình chung
      case 'close': this.closeScreen(); break;
      case 'tab': sc.tab = d.tab; sc.pick = null; this.renderScreen(true); break;
      case 'hero-prev':
      case 'hero-next': {
        const list = g.heroes.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
        if (!list.length) break;
        const k = list.indexOf(this.sel);
        this.sel = list[(k + (d.act === 'hero-next' ? 1 : list.length - 1)) % list.length];
        this.renderScreen(true);
        break;
      }
      // Cây kỹ năng
      case 'sk-sel': sc.skill = +d.i; this.renderScreen(true); break;
      case 'sk-up': if (h && fail(g.upgradeSkill(h, +d.i))) this.renderScreen(true); break;
      case 'sk-unlock': if (h && fail(g.unlockSkill(h, +d.i))) { this.toast(`Mở khóa [${SKILL_KEYS[+d.i]}] ${HEROES[h.type].skills[+d.i].name}!`, '#A86CE0'); this.renderScreen(true); } break;
      case 'sk-level': if (h) { this.doLevelUp(h); this.renderScreen(true); } break;
      // Tiến hoá
      case 'evolve': if (h && fail(g.evolve(h))) this.renderScreen(true); break;
      // Núi Tản Viên
      case 'soil': if (fail(g.soilMountain())) { this.toast('Bồi đất: núi cao thêm!', '#F2D27A'); this.renderScreen(true); } break;
      case 'harvest': {
        const n = g.harvestHerbs();
        if (n) this.toast(`Hái ${n} Linh Chi: +${n * MOUNTAIN.herbGold} vàng, tướng hồi máu`, '#6AE06A');
        this.renderScreen(true);
        break;
      }
      // Lò đúc
      case 'recipe': sc.recipe = d.id; this.renderScreen(true); break;
      case 'craft':
        if (g.craft(d.id)) { this.toast(`Đã đúc ${ITEMS[d.id].name}!`, RARITY[ITEMS[d.id].rarity].color); sc.justCrafted = d.id; }
        else this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : 'Thiếu nguyên liệu hoặc vàng', '#E25A3A');
        this.renderScreen(true);
        break;
      case 'shop-sel': sc.shop = d.id; this.renderScreen(true); break;
      case 'buy': {
        const inst = g.buy(d.id);
        if (inst) { g.flags.shopOpened = true; this.toast(`Mua ${ITEMS[d.id].name}`, '#F2D27A'); }
        else this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : `Cần ${ITEMS[d.id].price} vàng`, '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'buy-craft': {
        const r = Object.keys(ITEMS).find((id) => ITEMS[id].recipe && ITEMS[id].recipe.parts.includes(d.id));
        if (g.buy(d.id) && r && !g.missingParts(r).length) {
          if (g.craft(r)) this.toast(`Đã đúc ${ITEMS[r].name}!`, RARITY[ITEMS[r].rarity].color);
        } else this.toast('Chưa đủ để ghép', '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'chest': {
        const inst = g.buyChest();
        if (!inst) { this.toast(g.inventory.length >= CONFIG.bagSize ? 'Túi đầy' : `Cần ${CONFIG.chestCost} vàng`, '#E25A3A'); break; }
        sc.opened = inst.uid;
        sc.shake = true;
        this.renderScreen(true);
        sc.shake = false;
        break;
      }
      case 'equip-new': {
        if (!h) { this.toast('Chọn một tướng trên bản đồ trước', '#E25A3A'); break; }
        if (fail(g.equip(h, +d.uid))) { this.toast(`${HEROES[h.type].name} đã đeo ${ITEMS[g.findItem(+d.uid).inst.id].name}`, '#6AE06A'); sc.opened = null; }
        this.renderScreen(true);
        break;
      }
      case 'stash': sc.opened = null; this.renderScreen(true); break;
      // Túi đồ
      case 'bag-pick': sc.pick = +d.uid; this.renderScreen(true); break;
      case 'bag-slot': {
        if (!h) break;
        const inst = h.equip[d.slot];
        sc.pick = inst ? inst.uid : null;
        sc.slot = d.slot;
        this.renderScreen(true);
        break;
      }
      case 'equip': if (h && fail(g.equip(h, +d.uid))) this.renderScreen(true); break;
      case 'unequip': if (h && fail(g.unequip(h, d.slot))) this.renderScreen(true); break;
      case 'enhance': if (fail(g.enhance(+d.uid))) { this.toast('Cường hóa thành công!', '#FFD66B'); this.renderScreen(true); } break;
      case 'promote': if (fail(g.promote(+d.uid))) { this.toast('Thăng phẩm!', '#A86CE0'); this.renderScreen(true); } break;
      case 'lock': g.toggleLock(+d.uid); this.renderScreen(true); break;
      case 'scrap': {
        const v = g.scrap(+d.uid);
        if (typeof v === 'number') { this.toast(`Đổi ra ${v} vàng`, '#F2D27A'); sc.pick = null; } else this.toast(v, '#E25A3A');
        this.renderScreen(true);
        break;
      }
      case 'sort': g.sortBag(); this.renderScreen(true); break;
      case 'flt': {
        const f = this.scrapFilter;
        f.rarities = f.rarities.includes(d.r) ? f.rarities.filter((x) => x !== d.r) : [...f.rarities, d.r];
        this.renderScreen(true);
        break;
      }
      case 'flt-up': this.scrapFilter.skipUpgraded = !this.scrapFilter.skipUpgraded; this.renderScreen(true); break;
      case 'open-scrap': sc.kind = 'scrap'; this.renderScreen(true); break;
      case 'back-bag': sc.kind = 'bag'; this.renderScreen(true); break;
      case 'scrap-go': {
        const r = g.scrapMany(this.scrapFilter);
        this.toast(`Đã đổi ${r.count} món: +${fmt(r.gold)} vàng`, '#F2D27A');
        sc.kind = 'bag';
        sc.pick = null;
        this.renderScreen(true);
        break;
      }
      // Bách khoa
      case 'bk-sel': sc.pick = d.id; this.renderScreen(true); break;
    }
  }

  // ============================================================
  //  MÀN HÌNH TRONG TRẬN
  // ============================================================
  openScreen(kind, o = {}) {
    const g = this.game;
    if (['skills', 'evo'].includes(kind) && !g.heroes[this.sel]) {
      const first = g.heroes.findIndex(Boolean);
      if (first < 0) return this.toast('Chưa có tướng nào trên sân', '#E25A3A');
      this.sel = first;
    }
    if (kind === 'bag' && !g.heroes[this.sel]) {
      const first = g.heroes.findIndex(Boolean);
      if (first >= 0) this.sel = first;
    }
    if (kind === 'forge') g.flags.shopOpened = true;
    this.scrapFilter = this.scrapFilter || { rarities: ['common', 'rare'], skipUpgraded: false };
    $('#legends').hidden = true;
    this.screen = { kind, tab: kind === 'forge' ? 'recipe' : kind === 'codex' ? 'enemy' : null, ...o };
    const el = $('#screen');
    el.style.zIndex = o.top ? 30 : '';
    el.hidden = false;
    this.sig.screen = null;
    this.renderScreen(true);
  }

  closeScreen() {
    this.screen = null;
    $('#screen').hidden = true;
  }

  head(title, chips, right, icon) {
    return `<div class="scr-head metal">${icon ? `<span class="ic">${icon}</span>` : ''}<h1 class="ttl">${title}</h1>${chips || ''}<div class="sp"></div>${right || ''}
      <div class="goldbox inset">${coin()}${fmt(this.game.gold)}</div>
      <button class="xbtn metal" data-act="close" aria-label="Đóng">${ICON.close}</button></div>`;
  }
  runChip() { return this.game.started && this.game.running && !this.screen?.top ? RUN_CHIP : ''; }

  renderScreen(force) {
    const sc = this.screen;
    if (!sc) return;
    const g = this.game;
    const h = g.heroes[this.sel];
    const heroKey = h ? `${h.id}|${h.level}|${h.skillPts}|${h.tier}|${JSON.stringify(h.skillLv)}|${SLOTS.map((s) => h.equip[s] ? h.equip[s].uid + '.' + h.equip[s].plus + h.equip[s].rarity + h.equip[s].locked : '').join()}` : '';
    const invKey = g.inventory.map((i) => i.uid + '.' + i.plus + i.rarity + (i.locked ? 'L' : '')).join();
    const key = [sc.kind, sc.tab, sc.skill, sc.pick, sc.recipe, sc.shop, sc.opened, sc.slot, g.gold, heroKey, invKey,
      g.mountain.growth, g.mountain.herbs, g.mountain.soiled, g.wave, g.running, JSON.stringify(this.scrapFilter), Object.keys(g.seen).length].join('|');
    if (!force && this.sig.screen === key) return;
    this.sig.screen = key;
    const el = $('#screen');
    el.innerHTML = this['render_' + sc.kind]();
    if (sc.shake) { const j = el.querySelector('.jar-stage'); if (j) j.classList.add('shake'); }
    el.querySelectorAll('canvas[data-enemy]').forEach((cv) => drawEnemyIcon(cv, cv.dataset.enemy, +cv.dataset.pad || 0.1));
    this.liveScreen();
  }

  liveScreen() {
    const g = this.game;
    const h = g.heroes[this.sel];
    const t = performance.now() / 1000;
    document.querySelectorAll('#screen canvas[data-hero]').forEach((cv) => {
      if (!h) return;
      const tier = cv.dataset.tier !== undefined ? +cv.dataset.tier : h.tier;
      drawHeroPortrait(cv, { ...h, tier }, t, { full: true });
    });
  }

  // ---------- Cây kỹ năng
  render_skills() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return this.closeScreen() || '';
    const def = HEROES[h.type];
    const sc = this.screen;
    const si = sc.skill ?? 0;
    const cols = def.skills.map((sk, i) => {
      const lv = skillLevel(h, i);
      const max = SKILL_MAX[i];
      const type = i === 3 ? 'TỐI THƯỢNG' : sk.active ? 'CHỦ ĐỘNG' : 'NỘI TẠI';
      const nodes = [];
      for (let L = max; L >= 1; L--) {
        const req = skillReqLevel(i, L);
        const label = L === 1 ? 'Cấp 1' : `Cấp ${L} · +${(L - 1) * 25}%`;
        let cls, right;
        if (L <= lv) { cls = 'done'; right = ICON.check; }
        else if (L === lv + 1 && lv > 0) {
          const okLv = h.level >= req;
          cls = okLv && h.skillPts > 0 ? 'nxt metal' : 'fut';
          right = `<span class="req ${okLv ? 'ok' : ''}">${okLv ? ICON.check : ICON.lock}cấp ${req}</span>`;
        } else { cls = lv ? 'fut' : 'lck'; right = `<span class="req ${h.level >= req ? 'ok' : ''}">${h.level >= req ? ICON.check : ICON.lock}cấp ${req}</span>`; }
        nodes.push(`<div class="nd ${cls}"><span>${label}</span>${right}</div>`);
        if (L > 1) nodes.push(`<div class="ln ${L <= lv ? '' : 'off'}"></div>`);
      }
      let btn;
      if (!lv) {
        const can = h.level >= COSTS.unlockReq[i];
        btn = `<div class="reqline ${can ? 'ok' : ''}">${can ? ICON.check : ICON.lock}<span>Cần tướng cấp ${COSTS.unlockReq[i]}${can ? ' · đã đạt' : ''}</span></div>
          <button class="up unl ${can && g.gold >= COSTS.unlock[i] ? 'btn-gold' : 'btn-ghost'}" data-act="sk-unlock" data-i="${i}" ${can && g.gold >= COSTS.unlock[i] ? '' : 'disabled'}>
            <span style="font-family:var(--title);font-size:15px">Mở khóa</span><span style="display:flex;align-items:center;gap:4px">${coin(1)}${COSTS.unlock[i]} vàng</span></button>`;
      } else if (lv >= max) {
        btn = `<button class="up metal" disabled style="color:#FFD66B">Đã tối đa</button>`;
      } else {
        const ok = h.skillPts > 0 && h.level >= skillReqLevel(i, lv + 1);
        btn = `<button class="up metal ${ok ? 'ok' : ''}" data-act="sk-up" data-i="${i}" ${ok ? '' : 'disabled'}>${ICON.up}Nâng · 1 điểm</button>`;
      }
      const status = !lv ? (i === 0 ? 'Có sẵn' : 'Chưa mở khóa') : i === 0 ? 'Có sẵn' : 'Đã mua';
      return `<div class="col metal ${si === i ? 'on' : ''} ${!lv ? 'lock' : ''}" data-act="sk-sel" data-i="${i}">
        <div class="hd"><div class="ico inset" style="${si === i ? 'border-color:#FFD66B' : ''}">${svgI(skillIcon(h.type, i))}</div>
          <div style="display:flex;flex-direction:column;flex:1;min-width:0"><span class="hk">${SKILL_KEYS[i]} · ${type}</span><span class="st ${lv && i ? 'ok' : ''}">${status}</span></div></div>
        <span class="nmx">${sk.name} <span>${lv}/${max}</span></span>
        ${nodes.join('')}
        ${btn}</div>`;
    }).join('');
    const sk = def.skills[si];
    const lv = skillLevel(h, si);
    const n = skillN(h.level);
    const nextOk = lv && lv < SKILL_MAX[si] && h.level >= skillReqLevel(si, lv + 1);
    const detail = `<div class="sk-detail panel metal">
      <div class="dh"><div class="ico inset">${svgI(skillIcon(h.type, si))}</div><div><div class="ttl">${sk.name}</div>
        <small>${SKILL_KEYS[si]} · ${sk.active ? 'Chủ động · tốn năng lượng' : 'Nội tại'}</small></div></div>
      <div class="desc">${esc(sk.info(n))}${sk.active ? '. Tướng tự dùng khi đủ năng lượng.' : '.'}</div>
      <div class="kvt inset">
        <div><span>Cấp kỹ năng</span><b>${lv} / ${SKILL_MAX[si]}</b></div>
        <div><span>Sức mạnh</span><b>${lv ? `+${(lv - 1) * 25}%` : '—'}${lv && lv < SKILL_MAX[si] ? ` → <span style="color:#6AE06A">+${lv * 25}%</span>` : ''}</b></div>
        ${sk.active ? `<div><span>Năng lượng · hồi chiêu</span><b>${sk.active.mana} · ${sk.active.cooldown}s</b></div>` : ''}
        ${lv && lv < SKILL_MAX[si] ? `<div><span>Cấp ${lv + 1} cần</span><b class="${nextOk ? 'ok' : 'no'}">Tướng cấp ${skillReqLevel(si, lv + 1)}</b></div>` : ''}
        ${!lv ? `<div><span>Mở khóa</span><b class="${h.level >= COSTS.unlockReq[si] ? 'ok' : 'no'}">${COSTS.unlock[si]} vàng · cấp ${COSTS.unlockReq[si]}</b></div>` : ''}
        <div><span>Chi phí</span><b>1 điểm (còn ${h.skillPts})</b></div>
      </div>
      ${!lv ? `<button class="big-btn btn-gold" data-act="sk-unlock" data-i="${si}" ${h.level >= COSTS.unlockReq[si] && g.gold >= COSTS.unlock[si] ? '' : 'disabled'}>Mở khóa · ${coin(1)} ${COSTS.unlock[si]}</button>`
        : lv < SKILL_MAX[si] ? `<button class="big-btn btn-gold" data-act="sk-up" data-i="${si}" ${nextOk && h.skillPts ? '' : 'disabled'}>${ICON.up} Nâng lên cấp ${lv + 1} · 1 điểm</button>`
        : '<button class="big-btn metal" disabled style="color:#FFD66B">Đã tối đa</button>'}
      ${!h.skillPts && h.level < CONFIG.maxLevel ? `<button class="btn metal" style="height:34px;color:#F2D27A" data-act="sk-level">Nâng cấp tướng · ${coin(1)} ${g.levelCost(h)} (+1 điểm)</button>` : ''}
    </div>`;
    return `${this.head('Cây kỹ năng', `<span class="chip dark">${def.name} · Cấp ${h.level}</span><span class="chip ${ATTR_CLS[def.attr]}">${ATTRS[def.attr].name}</span>
        ${h.skillPts ? `<span class="chip ok">Còn ${h.skillPts} điểm kỹ năng</span>` : ''}${this.runChip()}`)}
      <div class="scr-body" style="padding-bottom:4px"><div class="sk-cols">${cols}</div>${detail}</div>
      <div class="foot">${coin(1)} Giá mở khóa: <b>W 60</b> · <b>E 150</b> (cấp 3) · <b>R 300</b> (cấp 6) vàng <span style="color:#5C4620">|</span> Mỗi cấp tướng +1 điểm · mỗi cấp kỹ năng +25% sức mạnh · kỹ năng mạnh dần theo cấp tướng</div>`;
  }

  // ---------- Lò đúc đồng
  render_forge() {
    const g = this.game;
    const sc = this.screen;
    const tabs = `<div class="tabs">
      <button class="tab ${sc.tab === 'recipe' ? 'on' : 'metal'}" data-act="tab" data-tab="recipe">📜 Công thức</button>
      <button class="tab ${sc.tab === 'shop' ? 'on' : 'metal'}" data-act="tab" data-tab="shop">🪙 Cửa hàng</button>
      <button class="tab ${sc.tab === 'chest' ? 'on' : 'metal'}" data-act="tab" data-tab="chest">🏺 Hũ báu · ${CONFIG.chestCost}</button><span class="zig"></span></div>`;
    let body = '';
    if (sc.tab === 'recipe') {
      const recipes = Object.keys(ITEMS).filter((id) => ITEMS[id].recipe);
      const cur = sc.recipe || recipes[0];
      const it = ITEMS[cur];
      const miss = g.missingParts(cur);
      const list = recipes.map((id) => {
        const m = g.missingParts(id).length;
        return `<button class="row ${id === cur ? 'on metal' : 'inset'}" data-act="recipe" data-id="${id}">
          <span class="slot ${rarCls(ITEMS[id].rarity)}">${svgI(itemIcon(id))}</span>
          <span style="min-width:0;flex:1"><span class="rn" style="display:block">${ITEMS[id].name}</span><span class="ri" style="display:block">${ITEMS[id].recipe.parts.map((p) => ITEMS[p].name).join(' + ')}</span></span>
          <span class="rm ${m ? (id === cur ? 'mis' : '') : 'okk'}">${m ? `Thiếu ${m}` : 'Đủ'}</span></button>`;
      }).join('');
      const firstMiss = miss[0];
      const parts = it.recipe.parts.map((p, k) => {
        const have = !miss.includes(p) || it.recipe.parts.slice(0, k).filter((x) => x === p).length < g.countOwned(p);
        const ok = g.countOwned(p) >= it.recipe.parts.filter((x) => x === p).length || !miss.includes(p);
        return `${k ? '<span class="craft-plus">+</span>' : ''}<div class="craft-part"><span class="slot ${ok ? rarCls(ITEMS[p].rarity) : 'miss'}">${svgI(itemIcon(p))}${ok ? '<span class="eq" style="color:#3EDC4E;font-size:14px;top:-6px;left:auto;right:-6px">●</span>' : ''}</span>
          <span>${ITEMS[p].name}</span><small style="color:${ok ? '#6AE06A' : '#FFD66B'}">${ok ? 'Đã có' : 'Chưa có'}</small></div>`;
      }).join('');
      body = `<div class="scr-body">
        <div class="panel metal" style="width:282px;flex:none"><div class="ph"><span class="ttl">Công thức đúc</span><small>${recipes.length} công thức</small></div><div class="rc-list">${list}</div></div>
        <div class="panel metal" style="flex:1">
          <div class="ph"><span><span class="ttl" style="font-size:24px">${it.name}</span> <small style="margin-left:8px">Công thức · ${it.recipe.parts.length} món · ${RARITY[it.rarity].name}</small></span>
            ${miss.length ? `<span class="chip goldc" style="border-color:#F2D27A">Thiếu ${miss.length} món</span>` : '<span class="chip ok">Đủ nguyên liệu</span>'}</div>
          <div class="craft-stage inset">${parts}<span class="craft-arrow">➜</span>
            <div class="craft-part"><span class="craft-out">${svgI(itemIcon(cur))}</span><span class="ttl" style="font-size:15px">${it.name}</span></div></div>
          <div class="aura-line inset">${it.hasteAura ? `<b>Hào quang:</b> ${esc(it.desc.replace('Hào quang: ', ''))}` : `<b>Chỉ số:</b> ${statLine(it.stats)}`}</div>
          <div style="display:flex;gap:10px;margin-top:auto">
            ${firstMiss && ITEMS[firstMiss].price ? `<button class="btn btn-gold" style="flex:1;height:46px;font-size:15px" data-act="buy" data-id="${firstMiss}" ${g.gold < ITEMS[firstMiss].price ? 'disabled' : ''}>Mua ${ITEMS[firstMiss].name} · ${coin()} ${ITEMS[firstMiss].price} vàng</button>` : ''}
            <button class="btn ${miss.length ? 'btn-ghost' : 'btn-gold'}" style="flex:1;height:46px;font-size:15px" data-act="craft" data-id="${cur}" ${miss.length || g.gold < it.recipe.cost ? 'disabled' : ''}>
              ${miss.length ? `${ICON.lock} Ghép (thiếu ${miss.length} món)` : `Ghép · ${coin()} ${it.recipe.cost} vàng`}</button></div>
        </div></div>`;
    } else if (sc.tab === 'shop') {
      const shop = Object.keys(ITEMS).filter((id) => ITEMS[id].price);
      const cur = sc.shop || shop[shop.length - 1];
      const it = ITEMS[cur];
      const rec = Object.keys(ITEMS).find((id) => ITEMS[id].recipe && ITEMS[id].recipe.parts.includes(cur));
      const other = rec && ITEMS[rec].recipe.parts.filter((p) => p !== cur);
      const canCraftAfter = rec && other.every((p) => g.countOwned(p) > 0);
      const h = g.heroes[this.sel];
      const freeAcc = h ? ACC_SLOTS.filter((s) => !h.equip[s]).length : 0;
      body = `<div class="scr-body">
        <div class="panel metal" style="flex:1"><div class="ph"><span class="ttl">Phụ kiện cơ bản</span><small>Món nguyên liệu để ghép</small></div>
          <div class="shop-grid inset">${shop.map((id) => {
            const own = g.countOwned(id);
            return `<button class="shop-it ${id === cur ? 'on' : 'metal'}" data-act="shop-sel" data-id="${id}">
              <span class="slot rt">${svgI(itemIcon(id))}${own ? '<span class="lv" style="color:#6AE06A">●</span>' : ''}</span><span class="nm">${ITEMS[id].name}</span>
              <span class="pr ${own && id !== cur ? 'own' : ''}">${own && id !== cur ? `Đã có ${own}` : coin(1) + ITEMS[id].price}</span></button>`;
          }).join('')}</div>
          <div class="note" style="text-align:center">Chạm vào món để xem chi tiết</div></div>
        <div class="panel metal" style="width:260px;flex:none">
          <div class="it-head"><span class="slot rt">${svgI(itemIcon(cur))}</span><div><div class="ttl">${it.name}</div><small>Phụ kiện · Thường</small></div></div>
          <div class="aura-line inset">${esc(it.desc || '')}${rec ? `${canCraftAfter ? ` Bạn đã có ${other.map((p) => ITEMS[p].name).join(', ')}.` : ''}` : ''}</div>
          <div class="stat-list">${statLine(it.stats, true)}</div>
          ${rec ? `<div class="inset" style="border-radius:4px;padding:6px 8px;display:flex;align-items:center;gap:8px">
            ${ITEMS[rec].recipe.parts.map((p, k) => `${k ? '<b style="color:#F2D27A">+</b>' : ''}<span class="slot ${p === cur || g.countOwned(p) ? 'rt' : ''}" style="width:34px;height:34px;${p === cur ? 'border-style:dashed;border-color:#FFD66B !important' : ''}">${svgI(itemIcon(p))}</span>`).join('')}
            <b style="color:#F2D27A">→</b><span class="slot ${rarCls(ITEMS[rec].rarity)}" style="width:34px;height:34px;border-radius:50%">${svgI(itemIcon(rec))}</span><span style="font-size:12px;font-weight:800;color:#F2D27A">${ITEMS[rec].name}</span></div>` : ''}
          <div class="note">${h ? `Đeo cho: <b style="color:#E8E0CC">${HEROES[h.type].name}</b> (còn ${freeAcc} ô phụ kiện)` : 'Mua xong mở Túi đồ để đeo cho tướng'}</div>
          <button class="big-btn btn-gold" data-act="buy" data-id="${cur}" ${g.gold < it.price ? 'disabled' : ''}>Mua · ${coin()} ${it.price} vàng</button>
          ${rec && canCraftAfter ? `<button class="btn metal" style="height:40px;color:#FFD66B;font-size:14px" data-act="buy-craft" data-id="${cur}" ${g.gold < it.price + ITEMS[rec].recipe.cost ? 'disabled' : ''}>Mua và ghép luôn (+${ITEMS[rec].recipe.cost})</button>` : ''}
        </div></div>`;
    } else {
      const op = sc.opened && g.findItem(sc.opened);
      const inst = op && op.inst;
      body = `<div class="scr-body">
        <div class="panel metal" style="flex:1">
          <div class="jar-stage inset"><div class="t"><div class="ttl">Hũ báu</div><div class="note">Mở để nhận một món ngẫu nhiên</div></div>${svgI(sceneArt('hubau'))}</div>
          <div style="display:flex;align-items:center;gap:10px"><div class="rar-chips">Có thể ra:
            <span style="border-color:#8A8478;color:#C8C0B0">◆ Thường</span><span style="border-color:#4FA3D9;color:#7FC4F0">◆ Hiếm</span><span style="border-color:#A86CE0;color:#C8A0F0">◆ Sử thi</span><span style="border-color:#F0A030;color:#FFB84A">◆ Huyền thoại</span></div>
            <button class="btn btn-gold" style="margin-left:auto;height:46px;font-size:20px;padding:0 24px" data-act="chest" ${g.gold < CONFIG.chestCost ? 'disabled' : ''}>Mở hũ · ${coin()} ${CONFIG.chestCost}</button></div>
        </div>
        <div class="panel metal" style="width:260px;flex:none"><div class="ttl" style="font-size:17px">Vừa mở được</div>
          ${inst ? `<div class="inset" style="border-radius:6px;padding:10px;border-color:${RARITY[inst.rarity].color}"><div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id))}</span>
            <div><div class="ttl">${ITEMS[inst.id].name}</div><small class="c-${inst.rarity}">${RARITY[inst.rarity].name} · ${SLOT_NAMES[ITEMS[inst.id].slot]}</small></div></div>
            <div class="stat-list" style="margin-top:6px">${statLine(itemStats(inst), true)}</div></div>
            ${!op.hero ? `<button class="big-btn btn-gold" style="margin-top:0" data-act="equip-new" data-uid="${inst.uid}">Đeo cho tướng</button>
            <button class="btn metal" style="height:44px;font-size:14px" data-act="stash">${ICON.bag} Cất vào túi</button>` : '<div class="chip ok" style="text-align:center">Đã đeo</div>'}`
            : '<div class="note">Chưa mở hũ nào.</div>'}
          <div class="inset" style="margin-top:auto;border-radius:6px;padding:10px;display:flex;gap:8px"><span style="color:#5AB4D6">≈</span><span class="note">Đồ còn rơi ra từ quái trên sông. Quái tinh anh và boss rơi đồ xịn hơn.</span></div>
        </div></div>`;
    }
    return `${this.head('Lò đúc đồng', `<span class="chip dark">Đợt ${g.wave}</span>${this.runChip()}`, '', svgI(sceneArt('drum')))}${tabs}${body}`;
  }

  // ---------- Túi đồ
  render_bag() {
    const g = this.game;
    const sc = this.screen;
    const h = g.heroes[this.sel];
    const def = h && HEROES[h.type];
    const slotBtn = (s) => {
      const inst = h && h.equip[s];
      const lab = { weapon: 'Vũ khí', helmet: 'Mũ', armor: 'Giáp' }[s] || '';
      return `<button class="slot ${inst ? rarCls(inst.rarity) : ''} ${inst && sc.pick === inst.uid ? 'sel' : ''}" data-act="bag-slot" data-slot="${s}" ${h ? '' : 'disabled'} aria-label="${SLOT_NAMES[s]}">
        ${inst ? svgI(itemIcon(inst.id)) + (inst.plus ? `<span class="lv">+${inst.plus}</span>` : '') : `<span class="ph">${lab}</span>`}</button>`;
    };
    const left = `<div class="panel metal bag-hero">
      <div class="hsel"><button class="metal" data-act="hero-prev" aria-label="Tướng trước">‹</button><span class="ttl">${h ? def.name : 'Chưa có tướng'}</span><button class="metal" data-act="hero-next" aria-label="Tướng sau">›</button></div>
      <div style="text-align:center;font-size:12px;color:#C8BFA8">${h ? `Cấp ${h.level}${h.tier ? ' · ' + '★'.repeat(h.tier) : ''}` : 'Triệu hồi tướng để mặc đồ'}</div>
      <div class="eqwrap"><div class="eqcol"><small>Trang phục</small>${GEAR_SLOTS.map(slotBtn).join('')}</div>
        <div class="fig inset">${h ? '<canvas data-hero width="172" height="300"></canvas>' : ''}</div>
        <div class="eqcol"><small>Phụ kiện</small>${ACC_SLOTS.map(slotBtn).join('')}</div></div>
      <div class="note" style="text-align:center">${h && activeSets(h.equip).length ? '<b style="color:#3EDC4E">Bộ Lạc Long: +30% sát thương, mọc cánh rồng</b>' : 'Chạm đồ trong túi rồi bấm Đeo'}</div></div>`;
    const cells = [];
    for (let i = 0; i < CONFIG.bagSize; i++) {
      const inst = g.inventory[i];
      if (!inst) { cells.push('<span class="slot"></span>'); continue; }
      const bad = h && !canEquip(h.type, inst.id);
      cells.push(`<button class="slot ${rarCls(inst.rarity)} ${sc.pick === inst.uid ? 'sel' : ''} ${bad ? 'dim' : ''}" data-act="bag-pick" data-uid="${inst.uid}" aria-label="${ITEMS[inst.id].name}">
        ${svgI(itemIcon(inst.id))}${inst.plus ? `<span class="lv">+${inst.plus}</span>` : ''}${inst.locked ? `<span class="lk">${ICON.lock}</span>` : ''}</button>`);
    }
    const f = this.scrapFilter;
    const list = g.scrapList(f);
    const lockedN = g.inventory.filter((i) => f.rarities.includes(i.rarity) && i.locked).length;
    const mid = `<div class="bag-mid"><div class="bag-grid inset">${cells.join('')}</div>
      <div class="scrap-bar metal"><div class="ph"><span class="ttl">Đổi đồ ra vàng</span><small>Lọc theo chất lượng</small></div>
        <div class="rflt">${RARITY_ORDER.map((r) => `<button class="c-${r} ${f.rarities.includes(r) ? 'on' : ''}" data-act="flt" data-r="${r}">${f.rarities.includes(r) ? ICON.check : ''}${RARITY[r].name}</button>`).join('')}</div>
        <button class="scrap-go" data-act="open-scrap" ${list.length ? '' : 'disabled'}>Chọn ${list.length} món để đổi${lockedN ? ` (bỏ qua ${lockedN} món khóa)` : ''}</button></div></div>`;
    // thẻ chi tiết
    const f2 = sc.pick && g.findItem(sc.pick);
    let det;
    if (f2) {
      const inst = f2.inst;
      const it = ITEMS[inst.id];
      const nextR = RARITY_ORDER[RARITY_ORDER.indexOf(inst.rarity) + 1];
      const onHero = f2.hero;
      const canEq = h && canEquip(h.type, inst.id);
      det = `<div class="panel metal bag-det">
        <div class="it-head"><span class="slot ${rarCls(inst.rarity)}">${svgI(itemIcon(inst.id))}${inst.plus ? `<span class="lv">+${inst.plus}</span>` : ''}</span>
          <div style="min-width:0"><div class="ttl" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</div><small class="c-${inst.rarity}">${RARITY[inst.rarity].name} · ${it.slot === 'weapon' ? 'Vũ khí ' + WCLASS_NAMES[it.wclass].toLowerCase() : SLOT_NAMES[it.slot]}${onHero ? ' · đang đeo' : ''}</small></div></div>
        <div class="enh inset"><div class="row1"><span>Cường hóa</span>${inst.plus >= 5 ? '<span class="full">FULL +5</span>' : `<span style="color:#FFD66B;font-weight:800">+${inst.plus}</span>`}</div>
          <div class="pips">${[1, 2, 3, 4, 5].map((k) => `<i class="${inst.plus >= k ? 'on' : ''}"></i>`).join('')}</div>
          <div class="stat-list">${statLine(itemStats(inst), true)}</div>
          ${it.desc ? `<div class="note">${esc(it.desc)}</div>` : ''}</div>
        ${inst.plus >= 5 && nextR ? `<div class="prom"><span class="c-${inst.rarity}">${RARITY[inst.rarity].name} +5</span> ⟶ <span class="c-${nextR}">${RARITY[nextR].name} +0</span></div>` : ''}
        <div class="det-btns">
          ${inst.plus < 5 ? `<button class="btn btn-gold" data-act="enhance" data-uid="${inst.uid}" ${g.gold < enhanceCost(inst) ? 'disabled' : ''}>Cường hóa +${inst.plus + 1} · ${coin()} ${enhanceCost(inst)}</button>`
            : nextR ? `<button class="btn btn-gold" data-act="promote" data-uid="${inst.uid}" ${g.gold < promoteCost(inst) ? 'disabled' : ''}>Thăng phẩm · ${promoteCost(inst)} vàng</button>`
            : '<button class="btn metal" disabled style="color:#FFD66B">Huyền thoại +5 · tối đa</button>'}
          ${onHero ? `<button class="btn metal" style="color:#F2D27A" data-act="unequip" data-slot="${f2.slot}">Tháo xuống túi</button>`
            : `<button class="btn metal" style="color:${canEq ? '#6AE06A' : '#7A705C'}" data-act="equip" data-uid="${inst.uid}" ${canEq ? '' : 'disabled'}>${h ? (canEq ? `Đeo cho ${def.name}` : `Không hợp ${def.name}`) : 'Chưa có tướng'}</button>`}
          <div class="r2"><button class="btn metal" data-act="lock" data-uid="${inst.uid}">${ICON.lock} ${inst.locked ? 'Mở khóa' : 'Khóa'}</button>
            ${onHero ? '' : `<button class="btn metal" style="color:#FFD66B" data-act="scrap" data-uid="${inst.uid}" ${inst.locked ? 'disabled' : ''}>Đổi ra ${scrapValue(inst)} vàng</button>`}</div>
        </div></div>`;
    } else {
      det = `<div class="panel metal bag-det"><div class="ttl" style="font-size:17px">Chi tiết món đồ</div>
        <div class="note">Chạm một món trong túi hoặc trên tướng để xem chỉ số, cường hóa (+1 đến +5, mỗi cấp +10% chỉ số gốc), thăng phẩm khi đủ +5, khóa hoặc đổi ra vàng.</div>
        <div class="kvt inset"><div><span>Cường hóa Thường</span><b>20 × cấp</b></div><div><span>Hiếm / Sử thi</span><b>40 / 80 × cấp</b></div><div><span>Huyền thoại</span><b>150 × cấp</b></div>
          <div><span>Thăng phẩm</span><b>120 / 300 / 600</b></div></div>
        <div class="note">Đồ trang phục (vũ khí, mũ, giáp) làm <b style="color:#FFD66B">tướng đổi hình dạng</b>. Mặc đủ Bộ Lạc Long để mọc cánh rồng.</div></div>`;
    }
    return `${this.head('Túi đồ', `<span class="chip dark">${g.inventory.length} / ${CONFIG.bagSize} ô</span>${this.runChip()}`,
      '<button class="btn metal" data-act="sort">Sắp xếp</button>')}<div class="scr-body">${left}${mid}${det}</div>`;
  }

  // ---------- Đổi đồ ra vàng
  render_scrap() {
    const g = this.game;
    const f = this.scrapFilter;
    const list = g.scrapList(f);
    const by = (r) => g.inventory.filter((i) => i.rarity === r);
    const opts = RARITY_ORDER.map((r) => {
      const all = by(r), ok = all.filter((i) => list.includes(i));
      return `<button class="sc-opt c-${r} ${f.rarities.includes(r) ? 'on' : ''}" data-act="flt" data-r="${r}">
        <span class="ck">${f.rarities.includes(r) ? ICON.check : ''}</span><span class="n">${RARITY[r].name}</span>
        <span class="c">${ok.length < all.length && f.rarities.includes(r) ? `${ok.length} / ` : ''}${all.length} món</span><span class="p">${COSTS.scrap[r]} / món</span></button>`;
    }).join('');
    const lockedN = g.inventory.filter((i) => i.locked).length;
    const upN = g.inventory.filter((i) => i.spent > 0).length;
    const rows = RARITY_ORDER.map((r) => {
      const n = list.filter((i) => i.rarity === r).length;
      return n ? `<div><span class="c-${r}">${RARITY[r].name} × ${n}</span><b>${n * COSTS.scrap[r]}</b></div>` : '';
    }).join('');
    const upgraded = list.filter((i) => i.spent > 0);
    const refund = upgraded.reduce((a, i) => a + Math.floor(i.spent * 0.6), 0);
    const total = list.reduce((a, i) => a + scrapValue(i), 0);
    return `<div class="scr-head metal"><button class="xbtn metal" data-act="back-bag" aria-label="Quay lại">${ICON.back}</button><h1 class="ttl">Đổi đồ ra vàng</h1>
        <span class="chip dark">Túi: ${g.inventory.length} / ${CONFIG.bagSize} ô</span><div class="sp"></div><div class="goldbox inset">${coin()}${fmt(g.gold)}</div></div>
      <div class="scr-body">
        <div class="panel metal" style="flex:1"><div class="ttl" style="font-size:17px">Chọn chất lượng cần đổi</div>${opts}
          <div style="border-top:1px solid #3A3226;margin-top:2px"></div>
          <div class="tg"><span class="sw on" aria-hidden="true"></span><span>Bỏ qua đồ đã khóa</span><span class="n2">${lockedN} món</span></div>
          <div class="tg"><button class="sw ${f.skipUpgraded ? 'on' : ''}" data-act="flt-up" aria-label="Bỏ qua đồ đã nâng cấp"></button><span>Bỏ qua đồ đã nâng cấp</span><span class="n2">${upN} món</span></div></div>
        <div class="panel metal" style="flex:1.05"><div class="ph"><span class="ttl">Sẽ đổi ${list.length} món</span><small>Túi còn ${g.inventory.length - list.length} / ${CONFIG.bagSize} ô</small></div>
          <div class="inset" style="border-radius:6px;padding:6px;display:flex;gap:4px;flex-wrap:wrap;min-height:50px">${list.slice(0, 11).map((i) => `<span class="slot ${rarCls(i.rarity)}" style="width:36px;height:36px">${svgI(itemIcon(i.id))}${i.plus ? `<span class="lv">+${i.plus}</span>` : ''}</span>`).join('')}${list.length > 11 ? `<span class="slot" style="width:36px;height:36px;font-weight:800;color:#C8BFA8">+${list.length - 11}</span>` : ''}</div>
          <div class="sum inset">${rows || '<div><span>Chưa chọn món nào</span></div>'}${upgraded.length ? `<div><span>Hoàn 60% vàng đã nâng cấp (${upgraded.length} món)</span><b>${refund}</b></div>` : ''}
            <div class="tot"><span>Nhận được</span><b>${coin()} +${fmt(total)}</b></div></div>
          ${upgraded.length ? `<div class="warnbox">⚠ Có ${upgraded.length} món đã nâng cấp: ${upgraded.slice(0, 3).map((i) => `${ITEMS[i.id].name} +${i.plus}`).join(', ')}. Đổi rồi không lấy lại được.</div>` : ''}
          <div style="display:flex;gap:10px;margin-top:auto"><button class="btn metal" style="flex:1;height:46px;font-size:16px" data-act="back-bag">Hủy</button>
            <button class="btn btn-gold" style="flex:2;height:46px;font-size:16px" data-act="scrap-go" ${list.length ? '' : 'disabled'}>Đổi ${list.length} món · +${fmt(total)} vàng</button></div></div>
      </div>`;
  }

  // ---------- Tiến hoá
  render_evo() {
    const g = this.game;
    const h = g.heroes[this.sel];
    if (!h) return this.closeScreen() || '';
    const def = HEROES[h.type];
    const t = h.tier || 0;
    const cards = [0, 1, 2].map((k) => {
      const bought = t > k, cur = t === k;
      const needLv = COSTS.evoReq[k];
      const lvOk = h.level >= needLv;
      let btn;
      if (bought) btn = `<button class="big-btn done" disabled>${ICON.check} ĐÃ MUA</button>`;
      else if (cur && lvOk) btn = `<button class="big-btn btn-gold" data-act="evolve" ${g.gold < COSTS.evo[k] ? 'disabled' : ''}>Tiến hoá · ${coin()} ${COSTS.evo[k]}</button>`;
      else if (cur) btn = `<button class="big-btn metal" style="color:#F2D27A;border-color:#FFD66B;font-size:13px" data-act="sk-level" ${g.gold < g.levelCost(h) ? 'disabled' : ''}>${ICON.dup} Nâng cấp tướng · ${coin(1)} ${g.levelCost(h)}</button>`;
      else btn = `<button class="big-btn btn-ghost" disabled>${ICON.lock} Khóa · cần cấp ${needLv}</button>`;
      return `<div class="evo-card metal ${cur ? 'cur' : ''} ${!bought && !cur ? 'lockd' : ''}">
        <div class="stars ${bought || cur ? '' : 'off'}">${'★'.repeat(k + 1)}</div>
        <div class="well inset">${svgI(sceneArt('evo'))}<canvas data-hero data-tier="${k + 1}" width="250" height="300" style="position:absolute;inset:0;width:100%;height:150px"></canvas>${!bought && !cur ? `<span class="lk">${ICON.lock}</span>` : ''}</div>
        <div class="pr">${coin()} ${COSTS.evo[k]} vàng · <span class="req ${lvOk ? '' : 'no'}">${cur && !lvOk ? 'Cần' : 'cần'} cấp ${needLv}</span></div>
        <div class="ds">${k === 0 ? 'To hơn, hào quang trống đồng' : cur && !lvOk ? `Đang cấp ${h.level} · còn ${needLv - h.level} cấp` : k === 2 ? 'Bậc cao nhất' : 'Hào quang rực hơn'}<br><b>+${(k + 1) * 10}% sát thương</b></div>
        ${btn}</div>`;
    }).join('');
    const setIds = { blade: 'long_riu', bow: 'long_no', staff: 'long_truong' };
    const pieces = [[setIds[def.wclass], 'Vũ khí', 'weapon'], ['mu_lac_long', 'Mũ', 'helmet'], ['giap_vay_rong', 'Giáp', 'armor']];
    const have = pieces.filter(([id, , s]) => h.equip[s] && h.equip[s].id === id).length;
    return `${this.head('Tiến hoá', `<span class="chip dark">${def.name} · Cấp ${h.level}</span><span class="chip ${ATTR_CLS[def.attr]}">${ATTRS[def.attr].name}</span>${t ? `<span class="chip goldc">★ Bậc ${t}</span>` : ''}${this.runChip()}`)}
      <div class="scr-body">${cards}
        <div class="panel metal set-panel"><div class="ph"><span class="ttl" style="font-size:20px">Bộ Lạc Long</span><small style="font-weight:800;color:#E8E0CC;font-size:14px">${have} / 3 món</small></div>
          ${pieces.map(([id, lab, s]) => `<div class="set-row inset ${h.equip[s] && h.equip[s].id === id ? 'have' : ''}"><span class="slot ${h.equip[s] && h.equip[s].id === id ? 'rl' : ''}">${svgI(itemIcon(id))}</span><span class="n">${ITEMS[id].name}</span><small>${lab}</small></div>`).join('')}
          <div class="inset" style="margin-top:auto;border-radius:6px;padding:10px;display:flex;gap:10px;align-items:center"><span style="font-size:22px">🐉</span>
            <span style="font-size:13px"><b style="color:#F2D27A">Đủ bộ</b><br><b>+30% sát thương</b>, tướng mọc cánh rồng</span></div></div>
      </div>`;
  }

  // ---------- Núi Tản Viên
  render_mountain() {
    const g = this.game;
    const st = g.mountainStage();
    const m = g.mountain;
    const cards = MOUNTAIN.stages.map((name, i) => {
      const k = i + 1;
      const past = k < st, cur = k === st;
      return `<div class="mt-card metal ${cur ? 'cur' : ''} ${!past && !cur ? 'fut' : ''}">
        ${cur ? '<span class="tag">Hiện tại</span>' : ''}
        <div class="well inset">${svgI(sceneArt('mountain' + k))}${!past && !cur ? `<span class="lkb">${ICON.lock}</span>` : ''}</div>
        <div class="nm">${k} · ${name}</div>
        ${past ? `<div class="st ok">${ICON.check} Đã qua</div>` : cur ? (k < 5 ? `<div class="pbar inset"><i style="width:${g.mountainProgress() * 100}%"></i></div>` : '<div class="st gold">Đỉnh cao nhất</div>')
          : k === 4 ? '<div class="st gold">Mở: Mọc Núi 2 lượt/đợt</div>' : k === 3 ? '<div class="st gold">Mở: mọc Linh Chi</div>' : k === 2 ? '<div class="st gold">Mở: +1 mạng mỗi 3 đợt</div>' : '<div class="st">Giai đoạn cuối</div>'}
      </div>`;
    }).join('');
    return `${this.head('Núi Tản Viên', `<i style="font-size:14px;color:#C8BFA8">Nước dâng bao nhiêu, núi cao bấy nhiêu</i>${this.runChip()}`, '', ICON.mount)}
      <div class="scr-body" style="flex-direction:column">
        <div class="mt-stages">${cards}</div>
        <div class="mt-tiles">
          <div class="nt-tile inset"><div class="nt-ico metal">${coin()}</div><div><div class="nt-lbl">VÀNG MỖI ĐỢT</div><div class="nt-val">+${st * MOUNTAIN.goldPerStage}</div><div class="nt-note">Giai đoạn ${st} × ${MOUNTAIN.goldPerStage}</div></div></div>
          <div class="nt-tile inset"><div class="nt-ico metal" style="color:#E25A3A">♥</div><div><div class="nt-lbl">MẠNG THÀNH</div><div class="nt-val">${st >= 2 ? '+1 mỗi 3 đợt' : 'Chưa mở'}</div><div class="nt-note">Mở từ giai đoạn 2</div></div></div>
          <button class="nt-tile metal act" data-act="harvest" ${m.herbs ? '' : 'disabled'}><div class="nt-ico inset">🍄</div><div><div class="nt-val" style="font-size:19px;color:#F2D27A">Hái ${m.herbs} Linh Chi</div><div class="nt-note">${coin(1)} <b>+${m.herbs * MOUNTAIN.herbGold} vàng</b> · <b style="color:#6AE06A">hồi máu</b></div></div></button>
          <div class="nt-tile inset"><div class="nt-ico metal" style="color:#F2D27A">${ICON.mount}</div><div><div class="nt-lbl">MỌC NÚI</div><div class="nt-val">${g.mocMax()} lượt / đợt</div><div class="nt-note">Còn ${g.moc} lượt · giai đoạn 4: <b>2 lượt</b></div></div></div>
          <div class="nt-tile inset"><div class="nt-ico metal">🍄</div><div><div class="nt-lbl">LINH CHI</div><div class="nt-val">${MOUNTAIN.herbGold} vàng / cây</div><div class="nt-note">${st >= 3 ? 'Mọc 1 cây mỗi đợt (tối đa 5)' : 'Mọc từ giai đoạn 3'} · hồi <b style="color:#6AE06A">máu tướng</b></div></div></div>
          <button class="nt-tile actg" data-act="soil" ${m.soiled || g.gold < MOUNTAIN.soilCost || st >= 5 ? 'disabled' : ''}><div class="nt-ico" style="background:#0D0B0833;border:1px solid #5A3608">⛰</div><div><div class="nt-val">Bồi đất · ${MOUNTAIN.soilCost} vàng</div><div class="nt-note">${m.soiled ? 'Đợt này đã bồi đất' : 'Núi cao nhanh hơn · 1 lần/đợt'}</div></div></button>
        </div></div>`;
  }

  // ---------- Bách khoa thủy quái
  render_codex() {
    const g = this.game;
    const sc = this.screen;
    const isBoss = sc.tab === 'boss';
    const seg = `<div class="seg inset"><button class="${!isBoss ? 'on' : ''}" data-act="tab" data-tab="enemy">Quái</button><button class="${isBoss ? 'on' : ''}" data-act="tab" data-tab="boss">Boss</button></div>`;
    let body;
    if (!isBoss) {
      const list = ['tom', 'casau', 'rua', 'phuthuy', 'chimbao', 'echme'];
      const cur = list.includes(sc.pick) ? sc.pick : 'rua';
      const d = ENEMIES[cur];
      const cards = list.map((id) => `<button class="bk-card ${id === cur ? 'on' : ''} metal" data-act="bk-sel" data-id="${id}">
        <div class="well inset"><canvas data-enemy="${id}" data-pad="0.08" width="200" height="80"></canvas></div>
        <span class="nm">${ENEMIES[id].name}${ENEMIES[id].flying ? ' <span style="font-family:var(--body);font-size:12px;color:#9EDDF2">(bay)</span>' : ''}</span><span class="ds">${ENEMIES[id].short}</span></button>`).join('');
      const tags = [];
      if (d.armor >= 10) tags.push('<span class="bk-tag a">Giáp rất cao</span>');
      if (d.mr >= 30) tags.push('<span class="bk-tag m">Kháng phép cao</span>');
      if (d.stunResist) tags.push('<span class="bk-tag s">Kháng choáng</span>');
      if (d.flying) tags.push('<span class="bk-tag s">Bay</span>');
      if (d.enrage) tags.push('<span class="bk-tag d">Hóa điên</span>');
      if (d.heal) tags.push('<span class="bk-tag d">Hồi máu đồng đội</span>');
      if (d.split) tags.push('<span class="bk-tag d">Tách con</span>');
      const extra = cur === 'rua' ? `<div class="tipbox inset" style="display:flex;gap:12px;align-items:center"><canvas data-enemy="rua" width="64" height="40" style="width:44px;height:28px"></canvas><span style="font-size:15px"><b>Bản khổng lồ (tinh anh):</b> đợt 5, 15, 25</span></div>`
        : cur === 'chimbao' ? '<div class="tipbox inset"><b>Đợt bay:</b> 7, 13, 17, 24, 27 · chỉ Xạ Thủ, Cao Lỗ, An Tiêm, tướng phép và Thạch Sanh (Cung Tên Vàng) bắn được</div>'
        : cur === 'echme' ? `<div class="tipbox inset" style="display:flex;gap:12px;align-items:center"><canvas data-enemy="nongnoc" width="64" height="30" style="width:44px;height:20px"></canvas><span><b>Nòng Nọc:</b> ${ENEMIES.nongnoc.hp} máu, bơi rất nhanh. Dùng sát thương lan.</span></div>` : '';
      body = `<div class="bk-cards">${cards}</div>
        <div class="panel metal bk-det"><div class="top"><div class="pic"><canvas data-enemy="${cur}" data-pad="0.1" width="280" height="212"></canvas></div>
          <div><div class="ttl">${d.name}</div><div class="bk-tags">${tags.join('')}</div>
          <div class="bk-stat"><span>Máu gốc <b>${d.hp}</b></span><span>Giáp <b>${d.armor}</b></span><span>Kháng phép <b>${d.mr}%</b></span><span>Vàng <b>${d.gold}</b></span></div></div></div>
          <div class="mech inset" style="color:#E8E0CC;font-size:14px">${d.desc}</div>${extra}</div>`;
    } else {
      const cur = BOSS_ORDER.includes(sc.pick) ? sc.pick : 'haba';
      const d = ENEMIES[cur];
      const wave = { thuongluong: 10, haba: 20, thuytinh: 30 }[cur];
      const giftArt = { voi_chin_nga: 'voi_chin_nga', ga_chin_cua: 'ga_chin_cua', ngua_hong_mao: 'ngua_hong_mao' };
      const cards = BOSS_ORDER.map((id) => {
        const w = { thuongluong: 10, haba: 20, thuytinh: 30 }[id];
        const b = ENEMIES[id];
        return `<button class="boss-card metal ${id === cur ? 'on' : ''}" data-act="bk-sel" data-id="${id}">
          <div class="well inset"><canvas data-enemy="${id}" data-pad="0.06" width="220" height="300"></canvas><span class="wv">Đợt ${w}</span></div>
          <span class="nm">${b.name}</span><span class="ds">${b.short}</span>
          <span class="gift inset">${svgI(itemIcon(giftArt[b.reward]))}<span>Sính lễ<br><b>${ITEMS[b.reward].name}</b></span></span></button>`;
      }).join('');
      body = `<div class="boss-cards">${cards}</div>
        <div class="panel metal bk-det"><div class="top"><div class="pic" style="height:110px"><canvas data-enemy="${cur}" data-pad="0.05" width="280" height="220" style="height:110px"></canvas></div>
          <div><div style="display:flex;align-items:center;gap:10px"><span class="ttl" style="font-size:30px">${d.name}</span><span class="chip run" style="font-size:13px">Boss · Đợt ${wave}</span></div>
            <div class="bk-tags">${d.tags.map((t, k) => `<span class="bk-tag ${k % 2 ? 's' : 'd'}">${t}</span>`).join('')}</div>
            <div class="bk-stat"><span>Máu <b>${d.hp}+</b></span><span>Giáp <b>${d.armor}</b></span><span>Kháng phép <b>${d.mr}%</b></span><span>Lọt thành <b>−${d.lives} mạng</b></span></div></div></div>
          <div class="mech inset">${esc(d.desc)}</div>
          <div class="tipbox inset">🎁 <b>Hạ được:</b> chọn sính lễ <b>${ITEMS[d.reward].name}</b></div>
          <div class="tipbox inset">💡 <b>Mẹo:</b> ${esc(d.tip)}</div></div>`;
    }
    // lịch 30 đợt
    const lv = g.started ? g.level : this.save.last;
    const N = LEVELS[lv].waves;
    const cells = [];
    for (let n = 1; n <= N; n++) {
      const k = waveKind(n, lv);
      cells.push(`<span class="cell ${k === 'boss' ? 'boss' : k === 'air' ? 'air' : k === 'champion' ? 'champ' : ''} ${g.started && n < g.wave + (g.waveActive ? 0 : 1) ? 'past' : ''} ${g.started && n === g.wave ? 'cur' : ''}">${n}${k === 'boss' && n < N ? '<i class="fl"></i>' : ''}</span>`);
    }
    return `${this.head('Bách khoa thủy quái', this.runChip(), seg, '<svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#F2D27A" stroke-width="1.8"/><circle cx="12" cy="10" r="3" fill="none" stroke="#F2D27A" stroke-width="1.6"/></svg>')}
      <div class="scr-body" style="padding-bottom:6px">${body}</div>
      <div class="sched metal" style="margin:0 10px 10px"><div class="hd"><span class="ttl">Lịch ${N} đợt · Ải ${lv + 1}</span>
        <div class="lg"><span><i style="background:#8A2A12;border:1px solid #C8401E"></i>Boss</span><span><i style="background:#3A4A5A;border:1px solid #5A7088"></i>Bay</span><span><i style="background:#5A4E30;border:1px solid #8C7A5A"></i>Rùa khổng lồ</span><span><i style="background:#5AB4D6;width:4px"></i>Nước dâng</span><span><i style="border:2px solid #FFD66B"></i>Đợt hiện tại</span></div></div>
        <div class="cells">${cells.join('')}</div></div>`;
  }
}

// số hiệu phụ để dựng lại lưới lệnh khi hồi chiêu đổi
function def0(h) { return HEROES[h.type].skills.map((s) => Math.ceil(Math.max(0, h.skillCd[s.id] || 0))).join(''); }
function t2cd(h) { return h.tier || 0; }

// Dòng chỉ số món đồ
function statLine(stats, lines) {
  const parts = Object.entries(stats).filter(([, v]) => v).map(([k, v]) => {
    const val = k === 'cleave' ? Math.round(v * 100) + '%' : (v > 0 ? '+' : '') + (Math.round(v * 10) / 10);
    return lines ? `<div><b>${val}</b> ${STAT_NAMES[k] || k}</div>` : `${val} ${STAT_NAMES[k] || k}`;
  });
  return lines ? parts.join('') : parts.join(' · ');
}
