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

  // Khoá ngang: cầm máy dọc thì xoay cả khung game 90 độ để game luôn nằm ngang kín màn hình.
  // Trình duyệt không cho trang web tắt tự xoay của máy, nên ta tự xoay hình và tự đổi toạ độ ngón tay.
  const shell = document.getElementById('shell');
  G.rot = false;
  function applyRot() {
    const de = document.documentElement;
    const vw = window.innerWidth || de.clientWidth, vh = window.innerHeight || de.clientHeight;
    const rot = !G.noRotLock && vh > vw * 1.1;
    G.rot = rot; G.rotW = vw;
    if (!shell) return;
    if (rot) {
      shell.style.position = 'fixed'; shell.style.left = '0'; shell.style.top = '0';
      shell.style.width = vh + 'px'; shell.style.height = vw + 'px';
      shell.style.transformOrigin = '0 0';
      shell.style.transform = 'translate(' + vw + 'px,0) rotate(90deg)';
      // Vùng an toàn khi xoay: mép trái của khung là mép trên màn hình (tai thỏ), mép phải là mép dưới (thanh điều hướng).
      shell.style.padding = 'var(--sa-r) max(16px, var(--sa-b)) var(--sa-l) max(16px, var(--sa-t))';
    } else {
      for (const k of ['position', 'left', 'top', 'width', 'height', 'transformOrigin', 'transform', 'padding']) shell.style[k] = '';
    }
  }
  function resize() {
    applyRot();
    // Kích thước theo bố cục (không bị phép xoay làm đổi), để lúc xoay vẫn tính đúng.
    const box = { width: fit.clientWidth, height: fit.clientHeight };
    const s = Math.max(0.4, Math.min(box.width / G.W, box.height / G.H));
    const cw = Math.floor(G.W * s), ch = Math.floor(G.H * s);
    wrap.style.width = cw + 'px';
    wrap.style.height = ch + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1); // V27: lớp chữ #ui tối đa nét gấp 2 (gấp 3 tốn ~40% thời gian vẽ trên máy yếu, mắt gần như không thấy khác)
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
    const was = G.portrait, wasRot = G.rot;
    resize();
    // Xoay máy thì vị trí các ngón đang giữ không còn đúng nữa, bỏ hết.
    if ((was !== G.portrait || wasRot !== G.rot) && G.dropPointers) G.dropPointers();
  }
  // Máy nào cho phép (Android khi toàn màn hình) thì xin khoá ngang thật; không được cũng không sao.
  G.lockLandscape = function () { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* không sao */ } };
  document.addEventListener('fullscreenchange', () => { if (document.fullscreenElement) G.lockLandscape(); setTimeout(onResize, 80); });
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
    if (G.rot) {
      // Khung đang xoay 90 độ: điểm (x, y) trên màn hình ứng với (y, rộng - x) trong khung.
      const sr = shell.getBoundingClientRect();
      const lx = e.clientY - sr.top, ly = sr.right - e.clientX;
      return { x: (lx - fit.offsetLeft - wrap.offsetLeft) / G.scale, y: (ly - fit.offsetTop - wrap.offsetTop) / G.scale };
    }
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
  // Nút cần chạy NGAY trong lúc chạm (mở cửa sổ đăng nhập Google: Safari chỉ cho mở cửa sổ phụ trong chính sự kiện chạm,
  // còn nút vẽ trên canvas được xử lý ở khung hình sau nên bị chặn [popup-blocked]). Màn nào cần thì mỗi khung hình
  // đặt G.syncTaps = [{ x, y, w, h, fn }] (toạ độ khung game 480x270).
  G.syncTaps = [];
  let syncAt = 0;
  function syncTap(e) {
    if (!G.syncTaps.length || performance.now() - syncAt < 400) return;
    const t0 = e.changedTouches && e.changedTouches[0];
    const p = pos(t0 ? { clientX: t0.clientX, clientY: t0.clientY } : e);
    for (const b of G.syncTaps) {
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) { syncAt = performance.now(); try { b.fn(); } catch (err) { /* bỏ qua */ } return; }
    }
  }
  fit.addEventListener('touchend', syncTap);
  fit.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch') syncTap(e); });
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
      // V73: iPhone sau cuộc gọi để trạng thái 'interrupted' (không phải 'suspended'): cứ khác 'running' là xin chạy lại
      if (ac.state !== 'running' && ac.state !== 'closed') ac.resume().catch(() => {});
    } catch (e) { /* máy không có âm thanh */ }
  };
  // V73: quay lại trang (sau cuộc gọi, đổi ứng dụng) thì thử bật lại âm thanh ngay, không chờ lần chạm tiếp theo
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ac) G.audioStart(); });
  // V72: âm lượng 3 nấc (G.save.vol: 0 nhỏ, 1 vừa, 2 to). Bản lưu cũ chưa có thì là 2 = to như trước đây.
  G.VOL_NAMES = ['nhỏ', 'vừa', 'to'];
  const VOL_K = [0.35, 0.65, 1];
  // Mỗi tiếng: [tần số Hz, thời lượng giây, kiểu sóng, độ to, (tuỳ chọn) tần số cuối = tần số × số này]
  const SFX = {
    hit: [220, 0.05, 'square', 0.05], swing: [520, 0.04, 'triangle', 0.03], hurt: [110, 0.12, 'sawtooth', 0.07, 0.5],
    mark: [1040, 0.09, 'sine', 0.06], evolve: [660, 0.35, 'triangle', 0.08, 2], warn: [330, 0.1, 'square', 0.04],
    gong: [98, 0.6, 'sine', 0.12], pick: [780, 0.08, 'sine', 0.05], die: [160, 0.1, 'square', 0.04],
    fire: [300, 0.08, 'sawtooth', 0.03], poison: [180, 0.1, 'triangle', 0.04], ice: [1400, 0.06, 'sine', 0.04],
    boom: [70, 0.25, 'sawtooth', 0.1, 0.5], ui: [600, 0.03, 'square', 0.03], win: [880, 0.5, 'triangle', 0.08, 2],
    // V37: tiếng trúng phân cấp. hitHeavy = đòn nặng (nhát 3, giương đầy), crit = chí mạng (cao, sáng, trượt xuống),
    // block = đánh vào khiên/giáp (tiếng "keng" kim loại ngắn). V40: hitHammer = búa (trầm, dài hơn).
    hitHeavy: [150, 0.09, 'square', 0.065, 0.6], crit: [1250, 0.12, 'triangle', 0.07, 0.55], block: [1700, 0.06, 'square', 0.035, 0.85],
    hitHammer: [85, 0.17, 'sawtooth', 0.075, 0.5],
    // V81: tiếng riêng cho uống bình máu, qua cửa phòng, đổi vũ khí, lộn né
    potion: [480, 0.18, 'sine', 0.05, 1.7], door: [140, 0.22, 'triangle', 0.06, 0.7], swap: [440, 0.06, 'triangle', 0.04, 1.5],
    dodge: [760, 0.09, 'sine', 0.035, 0.45],
  };
  G.SFX_NAMES = Object.keys(SFX); // để bài kiểm tra biết có những tiếng nào
  // V30: giới hạn tiếng cùng lúc để 20 quái chết một lúc không thành 20 tiếng chồng nhau (rè, to bất thường).
  // Mỗi loại tối đa 2 tiếng đang kêu, tổng tối đa 8 tiếng, tổng âm lượng các tiếng đang kêu không quá 0,28.
  // Hết "chỗ" âm lượng thì tiếng mới nhỏ lại cho vừa; còn quá ít thì bỏ qua.
  // (Giới hạn tính trên độ to gốc, trước khi nhân nấc âm lượng V72, nên vặn nhỏ không làm đổi số tiếng được kêu.)
  const OLD_RAMP = { evolve: 1, win: 1, boom: 1, hurt: 1 };
  const voices = [], MAX_SAME = 2, MAX_VOICES = 8, MAX_GAIN = 0.28;
  // o (tuỳ chọn, V40): { delay: giây } — phát trễ (vd. tiếng vung ở ~35% động tác thay vì lúc bắt đầu lấy đà).
  G.sfx = function (name, pitch, o) {
    if (!ac || !G.save.sound || G.noRender || ac.state !== 'running') return;
    const d = SFX[name];
    if (!d) return;
    try {
      const now = ac.currentTime, at = now + Math.max(0, Math.min(0.5, (o && o.delay) || 0));
      for (let i = voices.length - 1; i >= 0; i--) if (voices[i].end <= now) voices.splice(i, 1);
      let same = 0, sum = 0;
      for (const v of voices) { sum += v.g; if (v.name === name) same++; }
      if (same >= MAX_SAME || voices.length >= MAX_VOICES) return;
      const vol = Math.min(d[3], MAX_GAIN - sum);
      if (vol < 0.01) return;
      voices.push({ name, end: at + d[1] + 0.02, g: vol });
      const k = VOL_K[G.save.vol] != null ? VOL_K[G.save.vol] : 1;
      const o2 = ac.createOscillator(), g = ac.createGain();
      o2.type = d[2];
      o2.frequency.setValueAtTime(d[0] * (pitch || 1), at);
      // 4 tiếng cũ (evolve, win, boom, hurt) giữ đúng cách trượt như trước: tần số cuối không nhân pitch
      if (d[4]) o2.frequency.exponentialRampToValueAtTime(d[0] * d[4] * (OLD_RAMP[name] ? 1 : pitch || 1), at + d[1]);
      g.gain.setValueAtTime(vol * k, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + d[1]);
      o2.connect(g); g.connect(ac.destination);
      o2.start(at); o2.stop(at + d[1] + 0.02);
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  };
  // V37/V40: chọn tiếng trúng theo loại đòn. h: { block, crit, heavy, hammer } (true/false). Ưu tiên: khiên > chí mạng > búa > nặng > thường.
  // Chỗ gọi (combat.js, moves.js) chưa dùng hàm này: xem đề nghị trong docs/review/gd3/gd3-b.md.
  G.sfxHit = function (h, pitch) {
    h = h || {};
    G.sfx(h.block ? 'block' : h.crit ? 'crit' : h.hammer ? 'hitHammer' : h.heavy ? 'hitHeavy' : 'hit', pitch);
  };

  // ---------- lưu game ----------
  const KEY = 'linhkhi_save_v1';
  // Trường "tier" cũ là tên khác của "rarity": đọc và ghi w.tier vẫn chạy, nhưng bản lưu chỉ ghi rarity.
  G.linkTier = function (w) {
    delete w.tier;
    Object.defineProperty(w, 'tier', { get() { return this.rarity; }, set(v) { this.rarity = v; }, enumerable: false, configurable: true });
    return w;
  };
  // Cho đủ số dòng phụ và dòng mạnh theo bậc. pick(danh sách) chọn một dòng; không truyền thì chọn ngẫu nhiên.
  G.fitAffixes = function (w, pick) {
    const R = G.RARITY[w.rarity], keys = Object.keys(G.AFFIX);
    pick = pick || G.pick;
    w.affixes = (w.affixes || []).filter((k, i, a) => G.AFFIX[k] && a.indexOf(k) === i).slice(0, R.affixes);
    while (w.affixes.length < R.affixes) w.affixes.push(pick(keys.filter((k) => !w.affixes.includes(k))));
    if (!R.power) { w.power = null; w.gold = 0; } else if (!G.POWER[w.power]) w.power = pick(Object.keys(G.POWER));
    return w;
  };
  // o: { family: dòng 0..9 (không truyền thì ngẫu nhiên), gold: vùng của vũ khí Vàng 0..2 }
  G.newWeapon = function (save, type, rarity, o) {
    o = o || {};
    const w = {
      id: save.nextId++, type, family: o.family != null ? o.family : Math.floor(G.rnd() * G.FAMILIES) % G.FAMILIES,
      rarity: G.clamp(rarity | 0, 0, G.RARITY.length - 1), gold: 0,
      marks: { fire: 0, poison: 0, ice: 0 }, branch: null,
      sharpen: 0, name: null, title: '', kills: 0, bossKills: {}, affixes: [], power: null,
    };
    if (w.rarity === 3) w.gold = G.clamp(o.gold | 0, 0, G.GOLD_MULT.length - 1);
    G.linkTier(w);
    G.fitAffixes(w);
    save.weapons.push(w);
    return w;
  };
  G.newSave = function () {
    const s = {
      v: 1, gold: 0, ore: 0, stones: 0, mats: [0, 0, 0], shards: [0, 0, 0], forge: 1,
      heroes: {}, hero: 'smith', weapons: [], nextId: 1, carry: [null, null],
      owned: { helm: [], armor: [], charm: [] }, helm: null, armor: null, charm: null, outfit: G.outfit ? G.outfit.blank() : null,
      stars: {}, stars2: {}, scars: {}, tut: {}, sound: true, wins: 0, bossGold: {},
      vol: 2, lowFx: false, // V72 nấc âm lượng (0 nhỏ, 1 vừa, 2 to); V41 "Giảm hiệu ứng" — cài đặt riêng của máy, không đẩy lên mây
    };
    for (const k of G.HKEYS) s.heroes[k] = { unlocked: k === 'smith', lvl: 1, xp: 0, sk: { atk: 0, def: 0, elem: 0 }, ch: { cay: G.CHUONG ? G.CHUONG.defTree[k] : 'hoa', n: {} } };
    s.carry[0] = G.newWeapon(s, 'sword', 0, { family: 0 }).id; // Kiếm Rèn
    s.carry[1] = G.newWeapon(s, 'bow', 0, { family: 3 }).id;   // Cung Tre
    return s;
  };
  // V3: bản lưu trên máy đọc không được (hỏng, sai phiên bản, phần sửa bản lưu gặp lỗi) thì trước khi chơi tiếp bằng bản trắng
  // phải chép nguyên văn bản cũ sang khoá dự phòng linhkhi_save_v1_hong (giữ bản sao đầu tiên; lần sau nằm ở ..._hong2), để còn cứu lại được.
  const KEY_HONG = KEY + '_hong';
  let fixFailed = false; // fixSave vừa phải bỏ bản lưu đưa vào và trả bản mới
  G.loadSave = function () {
    let s = null, raw = null, bad = false;
    try {
      raw = window.localStorage.getItem(KEY);
      if (raw) s = JSON.parse(raw);
    } catch (e) { s = null; bad = !!raw; if (bad) console.error('Linh Khí: bản lưu trên máy không đọc được', e); }
    G.save = G.fixSave(s);
    if (raw && (bad || fixFailed)) {
      try {
        const ls = window.localStorage, old = ls.getItem(KEY_HONG);
        if (old === null || old === raw) ls.setItem(KEY_HONG, raw);
        else ls.setItem(KEY_HONG + '2', raw);
        console.error('Linh Khí: bản lưu cũ không dùng được, đã chép sang khoá dự phòng ' + KEY_HONG);
      } catch (e) { /* bộ nhớ đầy: chơi tiếp */ }
    }
    if (G.applyLowFx) G.applyLowFx(G.save.lowFx); // V41: bật lại "Giảm hiệu ứng" đã chọn (js/vfx_cfg.js)
  };
  // Kiểm tra bản lưu cũ hoặc hỏng: thiếu gì thì bù, sai gì thì sửa, hỏng nặng thì tạo mới.
  G.fixSave = function (s) {
    const base = G.newSave();
    fixFailed = false;
    try {
      if (!s || typeof s !== 'object' || Array.isArray(s) || s.v !== 1) { fixFailed = s != null; return base; }
      const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
      const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
      const arr3 = (v) => [0, 1, 2].map((i) => Math.max(0, num(Array.isArray(v) ? v[i] : 0, 0)));
      for (const k in base) if (!(k in s)) s[k] = base[k];
      for (const k of ['gold', 'ore', 'stones', 'wins']) s[k] = Math.max(0, Math.floor(num(s[k], 0)));
      s.mats = arr3(s.mats); s.shards = arr3(s.shards);
      s.forge = G.clamp(Math.floor(num(s.forge, 1)), 1, G.FORGE_CAP.length - 1);
      s.sound = s.sound !== false;
      s.vol = G.clamp(Math.floor(num(s.vol, 2)), 0, 2); // bản cũ chưa có: to (như trước)
      s.lowFx = s.lowFx === true; // bản cũ chưa có: tắt (hiệu ứng đầy đủ như trước)
      for (const k of ['stars', 'stars2', 'scars', 'tut']) s[k] = obj(s[k]);
      for (const k of ['stars', 'stars2']) for (const id in s[k]) s[k][id] = G.clamp(Math.floor(num(s[k][id], 1)), 1, 3);
      for (const id in s.scars) if (!G.ELS.includes(s.scars[id])) delete s.scars[id];
      // "Quyết tâm" (thua nhiều thì mạnh thêm) đã bỏ: bản lưu cũ còn trường grit thì xoá đi, phần còn lại đọc bình thường.
      delete s.grit;
      // hero
      s.heroes = obj(s.heroes);
      for (const k of G.HKEYS) {
        const h = obj(s.heroes[k]), sk = obj(h.sk);
        const lvl = G.clamp(Math.floor(num(h.lvl, 1)), 1, G.MAX_LEVEL);
        const fix = { unlocked: k === 'smith' || !!h.unlocked, lvl, xp: Math.max(0, num(h.xp, 0)), sk: {} };
        for (const b of G.SKEYS) fix.sk[b] = G.clamp(Math.floor(num(sk[b], 0)), 0, 5);
        if (fix.sk.atk + fix.sk.def + fix.sk.elem > Math.floor(lvl / 3)) fix.sk = { atk: 0, def: 0, elem: 0 };
        s.heroes[k] = Object.assign(h, fix);
        // Cây chưởng (js/chuong.js): bản lưu cũ chưa có thì nhận cây mặc định, điểm chưởng tính theo cấp nên tự có đủ điểm bù.
        if (G.chuong) G.chuong.fix(s.heroes[k], k);
      }
      if (!G.HKEYS.includes(s.hero) || !s.heroes[s.hero].unlocked) s.hero = 'smith';
      // vũ khí
      const seen = {};
      s.weapons = (Array.isArray(s.weapons) ? s.weapons : []).filter((w) => {
        if (!w || typeof w !== 'object' || !G.WTYPES[w.type] || typeof w.id !== 'number' || seen[w.id]) return false;
        seen[w.id] = true;
        // Bản lưu cũ chỉ có tier (Sắt, Bạc, Linh): chuyển thành rarity (Thường, Lam, Tím). Bản mới đã có rarity.
        w.rarity = G.clamp(Math.floor(num(w.rarity != null ? w.rarity : w.tier, 0)), 0, G.RARITY.length - 1);
        G.linkTier(w);
        // Dòng vũ khí: bản lưu cũ chưa có thì gán theo quy tắc cố định là số thứ tự của món chia 10 lấy dư.
        w.family = Number.isInteger(w.family) && w.family >= 0 && w.family < G.FAMILIES ? w.family : ((Math.floor(w.id) % G.FAMILIES) + G.FAMILIES) % G.FAMILIES;
        w.gold = w.rarity === 3 ? G.clamp(Math.floor(num(w.gold, 0)), 0, G.GOLD_MULT.length - 1) : 0;
        const m = obj(w.marks);
        w.marks = { fire: Math.max(0, num(m.fire, 0)), poison: Math.max(0, num(m.poison, 0)), ice: Math.max(0, num(m.ice, 0)) };
        w.branch = G.ELS.includes(w.branch) ? w.branch : null;
        w.sharpen = G.clamp(Math.floor(num(w.sharpen, 0)), 0, G.MAX_SHARPEN || 15);
        // Tên nay lấy theo hình (G.weaponArt.name); chỉ giữ lại danh hiệu phía sau dấu phẩy của tên cũ.
        if (typeof w.title !== 'string') w.title = typeof w.name === 'string' && w.name.indexOf(', ') > 0 ? w.name.slice(w.name.indexOf(', ')) : '';
        w.name = null;
        w.kills = Math.max(0, num(w.kills, 0));
        if (w.lock) w.lock = 1; else delete w.lock; // khoá đồ (js/ban_do.js): bản lưu cũ không có thì không khoá
        w.bossKills = obj(w.bossKills);
        // Dòng phụ: dòng cũ (affix) được giữ; thiếu thì bù theo số thứ tự của món để lần nào nạp cũng ra như nhau.
        const af = Array.isArray(w.affixes) ? w.affixes.slice() : [];
        if (G.AFFIX[w.affix] && !af.includes(w.affix)) af.unshift(w.affix);
        delete w.affix;
        w.affixes = af;
        let n = Math.floor(w.id);
        G.fitAffixes(w, (list) => list[Math.abs(n++) % list.length]);
        return true;
      });
      s.nextId = Math.max(Math.floor(num(s.nextId, 1)), 1, ...s.weapons.map((w) => w.id + 1));
      if (!s.weapons.length) G.newWeapon(s, 'sword', 0, { family: 0 });
      if (s.weapons.length < 2) G.newWeapon(s, 'bow', 0, { family: 3 });
      s.bossGold = obj(s.bossGold); // trùm vùng nào đã rơi vũ khí Vàng lần đầu
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
      // trang phục (js/outfit.js): kiểm tra phần đã lưu, rồi chuyển mũ, áo, bùa kiểu cũ ở trên sang hệ mới
      if (G.outfit) G.outfit.fix(s);
      return s;
    } catch (e) { fixFailed = true; console.error('Linh Khí: lỗi khi sửa bản lưu, dùng bản mới', e); return base; }
  };
  // V65: ghi không được (bộ nhớ đầy, trình duyệt chặn lưu) thì bật cờ G.saveFail để làng báo "Không lưu được trên máy này".
  G.saveFail = false;
  G.persist = function () {
    try { window.localStorage.setItem(KEY, JSON.stringify(G.save)); G.saveFail = false; } catch (e) {
      if (!G.saveFail) console.error('Linh Khí: không lưu được trên máy này', e);
      G.saveFail = true;
    }
  };
  G.resetSave = function () {
    G.save = G.newSave();
    if (G.applyLowFx) G.applyLowFx(G.save.lowFx); // V41: bản mới thì hiệu ứng trở lại đầy đủ
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
  // Sàn cỡ chữ (V25): chữ không nhỏ hơn 7,5 đơn vị (khoảng 11 px trên điện thoại cầm ngang; trước là 6,5 ≈ 9,4 px).
  // Sàn nằm ngay trong ui.font nên mọi chỗ đo chữ (ui.wrap, measureText sau ui.font) cũng đo đúng cỡ sẽ vẽ, chữ xuống dòng không tràn.
  // tiny = true: số nhỏ trên ô vũ khí, nhãn trong ô chật được giữ sàn cũ 6,5 (truyền { tiny: true } cho ui.text / ui.para).
  ui.MIN = 7.5; ui.MIN_TINY = 6.5;
  ui.fs = (size, tiny) => Math.max(tiny ? ui.MIN_TINY : ui.MIN, size || 9);
  ui.font = function (size, bold, tiny) {
    G.ux.font = (bold ? '700 ' : '500 ') + ui.fs(size, tiny) + 'px ' + FONT;
  };
  ui.text = function (str, x, y, o) {
    o = o || {};
    const c = G.ux;
    ui.font(o.size || 9, o.bold, o.tiny); // sàn cỡ chữ: ui.fs ở trên
    c.textAlign = o.align || 'left';
    if (o.shadow !== false) {
      c.fillStyle = 'rgba(0,0,0,0.75)';
      c.fillText(str, x + 0.6, y + 0.6);
    }
    c.fillStyle = o.color || '#f1ead9';
    c.fillText(str, x, y);
  };
  ui.wrap = function (str, maxW, size, bold, tiny) {
    ui.font(size || 9, bold, tiny);
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
    const size = ui.fs(o.size, o.tiny);
    const lines = ui.wrap(str, maxW, size, o.bold, o.tiny);
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
    G.syncTaps = [];
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
      if (G.theme && G.theme.endFrame) G.theme.endFrame(); // tên biểu tượng tài nguyên khi chạm vào
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
