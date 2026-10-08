// Bộ máy: canvas, co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vòng lặp.
(function () {
  const G = window.G;
  const world = document.getElementById('world');
  const uiCv = document.getElementById('ui');
  const wrap = document.getElementById('stage');
  const fit = document.getElementById('fit');
  G.wx = world.getContext('2d');
  G.ux = uiCv.getContext('2d');
  G.wx.imageSmoothingEnabled = false;
  G.scale = 1;

  function resize() {
    const box = fit.getBoundingClientRect();
    const s = Math.max(0.4, Math.min(box.width / G.W, box.height / G.H));
    const cw = Math.floor(G.W * s), ch = Math.floor(G.H * s);
    wrap.style.width = cw + 'px';
    wrap.style.height = ch + 'px';
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    uiCv.width = Math.max(1, Math.round(box.width * dpr));
    uiCv.height = Math.max(1, Math.round(box.height * dpr));
    G.scale = cw / G.W;
    G.uiScale = G.scale * dpr;
    // Lề trống quanh khung game, tính theo đơn vị của game. Nút cảm ứng tận dụng phần lề này.
    G.ox = (box.width - cw) / 2; G.oy = (box.height - ch) / 2; G.dpr = dpr;
    G.mx = G.ox / G.scale; G.my = G.oy / G.scale;
    G.cx = Math.min(G.mx, 56);
    G.cy = G.my > 44 ? Math.min(G.my - 6, 124) : 0;
    G.portrait = box.height > box.width * 1.1;
  }
  function onResize() {
    const was = G.portrait;
    resize();
    // Xoay máy thì vị trí các ngón đang giữ không còn đúng nữa, bỏ hết.
    if (was !== G.portrait && G.dropPointers) G.dropPointers();
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 60));
  if (window.ResizeObserver) { try { new ResizeObserver(onResize).observe(fit); } catch (e) { /* không sao */ } }
  resize();

  // ---------- tiện ích ----------
  G.rnd = Math.random;
  G.rr = (a, b) => a + G.rnd() * (b - a);
  G.ri = (a, b) => Math.floor(G.rr(a, b + 1));
  G.pick = (arr) => arr[Math.floor(G.rnd() * arr.length)];
  G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  G.srand = function (seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  // ---------- bàn phím ----------
  G.keys = {};
  G.keyP = {};
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!G.keys[e.code]) G.keyP[e.code] = true;
    G.keys[e.code] = true;
    G.audioStart();
  });
  window.addEventListener('keyup', (e) => { G.keys[e.code] = false; });

  // ---------- con trỏ và cảm ứng ----------
  G.pointers = new Map();
  G.click = null; // một lần chạm hoàn chỉnh trong khung hình này
  G.downs = []; // các lần vừa chạm xuống trong khung hình này
  function pos(e) {
    const r = wrap.getBoundingClientRect();
    return { x: (e.clientX - r.left) / G.scale, y: (e.clientY - r.top) / G.scale };
  }
  fit.addEventListener('pointerdown', (e) => {
    if (e.cancelable) e.preventDefault();
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = pos(e);
    // Mã ngón có thể được dùng lại: ngón mới luôn thay ngón cũ cùng mã.
    const o = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, role: null, stale: false };
    G.pointers.set(e.pointerId, o);
    G.downs.push(o);
    try { fit.setPointerCapture(e.pointerId); } catch (err) { /* không sao */ }
    G.audioStart();
  });
  fit.addEventListener('pointermove', (e) => {
    const o = G.pointers.get(e.pointerId);
    if (!o) return;
    const p = pos(e);
    o.x = p.x; o.y = p.y;
  });
  function up(e) {
    const o = G.pointers.get(e.pointerId);
    if (!o) return;
    const p = pos(e);
    // Chỉ tính là một lần bấm nếu ngón không dùng để điều khiển và màn hình chưa đổi từ lúc chạm xuống.
    if (e.type === 'pointerup' && !o.role && !o.stale && Math.hypot(p.x - o.sx, p.y - o.sy) < 12) G.click = { x: o.sx, y: o.sy };
    G.pointers.delete(e.pointerId);
    G.audioStart();
  }
  fit.addEventListener('pointerup', up);
  fit.addEventListener('pointercancel', up);
  // Bỏ hết ngón đang giữ (khi mất tiêu điểm, xoay máy, ẩn trang).
  G.dropPointers = function () { G.pointers.clear(); G.downs.length = 0; G.click = null; };
  // Đánh dấu các ngón đang giữ là cũ: nhấc lên sẽ không tính là bấm vào màn hình mới.
  G.stalePointers = function () { for (const o of G.pointers.values()) o.stale = true; };
  function dropInput() { G.dropPointers(); G.keys = {}; G.keyP = {}; }
  window.addEventListener('blur', dropInput);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      dropInput();
      if (G.scene && G.scene.hide) { try { G.scene.hide(); } catch (e) { /* không sao */ } }
    }
  });
  // Chặn cuộn trang, phóng to bằng hai ngón, bảng chọn khi nhấn giữ.
  const stop = (e) => { if (e.cancelable) e.preventDefault(); };
  document.addEventListener('contextmenu', stop);
  for (const t of ['touchstart', 'touchmove', 'touchend']) fit.addEventListener(t, stop, { passive: false });
  document.addEventListener('touchmove', stop, { passive: false });
  for (const t of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick', 'selectstart', 'dragstart']) document.addEventListener(t, stop);
  window.addEventListener('wheel', (e) => { if (e.ctrlKey) stop(e); }, { passive: false });
  G.inRect = (p, x, y, w, h) => p && p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;

  // ---------- âm thanh ----------
  let ac = null;
  G.audioStart = function () {
    if (!G.save || !G.save.sound) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume().catch(() => {});
    } catch (e) { /* máy không có âm thanh */ }
  };
  const SFX = {
    hit: [220, 0.05, 'square', 0.05], swing: [520, 0.04, 'triangle', 0.03], hurt: [110, 0.12, 'sawtooth', 0.07],
    mark: [1040, 0.09, 'sine', 0.06], evolve: [660, 0.35, 'triangle', 0.08], warn: [330, 0.1, 'square', 0.04],
    gong: [98, 0.6, 'sine', 0.12], pick: [780, 0.08, 'sine', 0.05], die: [160, 0.1, 'square', 0.04],
    fire: [300, 0.08, 'sawtooth', 0.03], poison: [180, 0.1, 'triangle', 0.04], ice: [1400, 0.06, 'sine', 0.04],
    boom: [70, 0.25, 'sawtooth', 0.1], ui: [600, 0.03, 'square', 0.03], win: [880, 0.5, 'triangle', 0.08],
  };
  G.sfx = function (name, pitch) {
    if (!ac || !G.save.sound || G.noRender || ac.state !== 'running') return;
    const d = SFX[name];
    if (!d) return;
    try {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = d[2];
      o.frequency.value = d[0] * (pitch || 1);
      if (name === 'evolve' || name === 'win') o.frequency.exponentialRampToValueAtTime(d[0] * 2, ac.currentTime + d[1]);
      if (name === 'boom' || name === 'hurt') o.frequency.exponentialRampToValueAtTime(d[0] * 0.5, ac.currentTime + d[1]);
      g.gain.value = d[3];
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d[1]);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + d[1] + 0.02);
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  };

  // ---------- lưu game ----------
  const KEY = 'linhkhi_save_v1';
  G.newWeapon = function (save, type, tier) {
    const w = {
      id: save.nextId++, type, tier, marks: { fire: 0, poison: 0, ice: 0 }, branch: null,
      sharpen: 0, name: null, kills: 0, bossKills: {}, affix: null,
    };
    if (tier === 2) w.affix = G.pick(Object.keys(G.AFFIX));
    save.weapons.push(w);
    return w;
  };
  G.newSave = function () {
    const s = {
      v: 1, gold: 0, ore: 0, stones: 0, mats: [0, 0, 0], shards: [0, 0, 0], forge: 1,
      heroes: {}, hero: 'smith', weapons: [], nextId: 1, carry: [null, null],
      owned: { helm: [], armor: [], charm: [] }, helm: null, armor: null, charm: null,
      stars: {}, stars2: {}, scars: {}, tut: {}, sound: true, wins: 0,
    };
    for (const k of G.HKEYS) s.heroes[k] = { unlocked: k === 'smith', lvl: 1, xp: 0, sk: { atk: 0, def: 0, elem: 0 } };
    s.carry[0] = G.newWeapon(s, 'sword', 0).id;
    s.carry[1] = G.newWeapon(s, 'bow', 0).id;
    return s;
  };
  G.loadSave = function () {
    let s = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) s = JSON.parse(raw);
    } catch (e) { s = null; }
    G.save = G.fixSave(s);
  };
  // Kiểm tra bản lưu cũ hoặc hỏng: thiếu gì thì bù, sai gì thì sửa, hỏng nặng thì tạo mới.
  G.fixSave = function (s) {
    const base = G.newSave();
    try {
      if (!s || typeof s !== 'object' || Array.isArray(s) || s.v !== 1) return base;
      const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
      const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
      const arr3 = (v) => [0, 1, 2].map((i) => Math.max(0, num(Array.isArray(v) ? v[i] : 0, 0)));
      for (const k in base) if (!(k in s)) s[k] = base[k];
      for (const k of ['gold', 'ore', 'stones', 'wins']) s[k] = Math.max(0, Math.floor(num(s[k], 0)));
      s.mats = arr3(s.mats); s.shards = arr3(s.shards);
      s.forge = G.clamp(Math.floor(num(s.forge, 1)), 1, G.FORGE_CAP.length - 1);
      s.sound = s.sound !== false;
      for (const k of ['stars', 'stars2', 'scars', 'tut']) s[k] = obj(s[k]);
      for (const k of ['stars', 'stars2']) for (const id in s[k]) s[k][id] = G.clamp(Math.floor(num(s[k][id], 1)), 1, 3);
      for (const id in s.scars) if (!G.ELS.includes(s.scars[id])) delete s.scars[id];
      // hero
      s.heroes = obj(s.heroes);
      for (const k of G.HKEYS) {
        const h = obj(s.heroes[k]), sk = obj(h.sk);
        const lvl = G.clamp(Math.floor(num(h.lvl, 1)), 1, G.MAX_LEVEL);
        const fix = { unlocked: k === 'smith' || !!h.unlocked, lvl, xp: Math.max(0, num(h.xp, 0)), sk: {} };
        for (const b of G.SKEYS) fix.sk[b] = G.clamp(Math.floor(num(sk[b], 0)), 0, 5);
        if (fix.sk.atk + fix.sk.def + fix.sk.elem > Math.floor(lvl / 3)) fix.sk = { atk: 0, def: 0, elem: 0 };
        s.heroes[k] = Object.assign(h, fix);
      }
      if (!G.HKEYS.includes(s.hero) || !s.heroes[s.hero].unlocked) s.hero = 'smith';
      // vũ khí
      const seen = {};
      s.weapons = (Array.isArray(s.weapons) ? s.weapons : []).filter((w) => {
        if (!w || typeof w !== 'object' || !G.WTYPES[w.type] || typeof w.id !== 'number' || seen[w.id]) return false;
        seen[w.id] = true;
        w.tier = G.clamp(Math.floor(num(w.tier, 0)), 0, G.TIERS.length - 1);
        const m = obj(w.marks);
        w.marks = { fire: Math.max(0, num(m.fire, 0)), poison: Math.max(0, num(m.poison, 0)), ice: Math.max(0, num(m.ice, 0)) };
        w.branch = G.ELS.includes(w.branch) ? w.branch : null;
        w.sharpen = G.clamp(Math.floor(num(w.sharpen, 0)), 0, 10);
        w.name = typeof w.name === 'string' ? w.name : null;
        w.kills = Math.max(0, num(w.kills, 0));
        w.bossKills = obj(w.bossKills);
        w.affix = G.AFFIX[w.affix] ? w.affix : null;
        return true;
      });
      s.nextId = Math.max(Math.floor(num(s.nextId, 1)), 1, ...s.weapons.map((w) => w.id + 1));
      if (!s.weapons.length) G.newWeapon(s, 'sword', 0);
      if (s.weapons.length < 2) G.newWeapon(s, 'bow', 0);
      const has = (id) => s.weapons.some((w) => w.id === id);
      const c = Array.isArray(s.carry) ? s.carry.slice(0, 2) : [];
      for (let i = 0; i < 2; i++) {
        if (!has(c[i]) || (i === 1 && c[1] === c[0])) {
          const free = s.weapons.find((w) => w.id !== c[0] && w.id !== c[1]);
          c[i] = free ? free.id : null;
        }
      }
      s.carry = c;
      // trang bị
      const own = obj(s.owned);
      s.owned = {};
      for (const slot of ['helm', 'armor', 'charm']) {
        s.owned[slot] = (Array.isArray(own[slot]) ? own[slot] : []).filter((id, i, a) => G.GEAR[slot][id] && a.indexOf(id) === i);
        if (!s.owned[slot].includes(s[slot])) s[slot] = null;
      }
      return s;
    } catch (e) { return base; }
  };
  G.persist = function () {
    try { window.localStorage.setItem(KEY, JSON.stringify(G.save)); } catch (e) { /* chơi không lưu */ }
  };
  G.resetSave = function () {
    G.save = G.newSave();
    G.persist();
  };
  G.weaponById = (id) => G.save.weapons.find((w) => w.id === id) || null;

  // ---------- vẽ giao diện (toạ độ 480x270, chữ nét ở độ phân giải thật) ----------
  const FONT = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const ui = (G.ui = {});
  ui.begin = function () {
    const c = G.ux;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, uiCv.width, uiCv.height);
    c.setTransform(G.uiScale, 0, 0, G.uiScale, G.ox * G.dpr, G.oy * G.dpr);
    c.textBaseline = 'alphabetic';
  };
  ui.font = function (size, bold) {
    G.ux.font = (bold ? '700 ' : '500 ') + size + 'px ' + FONT;
  };
  ui.text = function (str, x, y, o) {
    o = o || {};
    const c = G.ux;
    // Chữ không nhỏ hơn 6,5 để còn đọc được trên điện thoại.
    ui.font(Math.max(6.5, o.size || 9), o.bold);
    c.textAlign = o.align || 'left';
    if (o.shadow !== false) {
      c.fillStyle = 'rgba(0,0,0,0.75)';
      c.fillText(str, x + 0.6, y + 0.6);
    }
    c.fillStyle = o.color || '#f1ead9';
    c.fillText(str, x, y);
  };
  ui.wrap = function (str, maxW, size, bold) {
    ui.font(Math.max(6.5, size || 9), bold);
    const words = String(str).split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (G.ux.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };
  ui.para = function (str, x, y, maxW, o) {
    o = o || {};
    const size = Math.max(6.5, o.size || 9);
    const lines = ui.wrap(str, maxW, size, o.bold);
    lines.forEach((l, i) => ui.text(l, x, y + i * (size + 3), o));
    return y + lines.length * (size + 3);
  };
  ui.rect = function (x, y, w, h, fill, stroke) {
    const c = G.ux;
    if (fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
  };
  ui.panel = function (x, y, w, h, title) {
    ui.rect(x, y, w, h, 'rgba(20,16,14,0.94)', '#7a5a3a');
    ui.rect(x + 2, y + 2, w - 4, h - 4, null, 'rgba(255,220,160,0.12)');
    if (title) ui.text(title, x + 8, y + 15, { size: 11, bold: true, color: '#ffd27a' });
  };
  ui.btn = function (x, y, w, h, label, o) {
    o = o || {};
    const hover = [...G.pointers.values()].some((p) => !p.role && !p.stale && G.inRect(p, x, y, w, h));
    const base = o.disabled ? '#3a322c' : o.color || '#8a4b25';
    ui.rect(x, y, w, h, hover && !o.disabled ? '#b5672f' : base, o.disabled ? '#51463d' : '#e2b36a');
    const size = o.size || 9;
    ui.text(label, x + w / 2, y + h / 2 + size * 0.36 - (o.sub ? 4 : 0), {
      size, bold: true, align: 'center', color: o.disabled ? '#8a7f74' : '#fff3da',
    });
    if (o.sub) ui.text(o.sub, x + w / 2, y + h / 2 + 8, { size: o.subSize || 7, align: 'center', color: o.disabled ? '#8a7f74' : '#f0d9b0' });
    if (!o.disabled && G.click && G.inRect(G.click, x, y, w, h)) {
      G.click = null;
      G.sfx('ui');
      return true;
    }
    return false;
  };
  ui.bar = function (x, y, w, h, frac, col, back) {
    ui.rect(x, y, w, h, back || 'rgba(0,0,0,0.6)');
    ui.rect(x, y, Math.max(0, w * G.clamp(frac, 0, 1)), h, col);
    ui.rect(x, y, w, h, null, 'rgba(0,0,0,0.8)');
  };
  ui.circle = function (x, y, r, fill, stroke) {
    const c = G.ux;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.2; c.stroke(); }
  };

  // ---------- vòng lặp ----------
  G.scene = null;
  G.setScene = function (s) {
    G.scene = s;
    G.click = null;
    G.stalePointers();
    if (s.enter) s.enter();
  };
  G.time = 0;
  const STEP = 1 / 60;
  let last = 0, acc = 0;
  G.tick = function () {
    G.time += STEP;
    if (G.scene) G.scene.update(STEP);
    G.keyP = {};
    G.downs.length = 0;
  };
  function frame(ts) {
    requestAnimationFrame(frame); // đặt trước để một lỗi lẻ không làm đứng game
    const now = ts / 1000;
    acc += Math.min(0.1, Math.max(0, now - last || 0));
    last = now;
    let n = 0;
    while (acc >= STEP && n < 5) { G.tickDraw = n === 0; G.tick(); acc -= STEP; n++; }
    if (acc > STEP) acc = 0; // khung hình quá chậm: bỏ phần dư, không chạy bù dồn
    if (G.scene && !G.noRender) {
      ui.begin();
      G.scene.draw();
      if (G.portrait) {
        ui.text('Xoay ngang điện thoại để hình to và dễ chơi hơn', 240, -10, { size: 13, align: 'center', color: '#ffd27a' });
      }
    }
    G.click = null; // nút bấm trong giao diện được kiểm tra lúc vẽ, nên xoá sau khi vẽ
  }
  G.run = function () { requestAnimationFrame(frame); };
  // Dùng khi chạy thử tự động: chạy n bước mà không vẽ.
  G.sim = function (n) {
    G.noRender = true;
    try { for (let i = 0; i < n; i++) { G.tick(); G.click = null; } } finally { G.noRender = false; }
  };
})();
