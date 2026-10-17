// Bộ máy: canvas, co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vòng lặp.
(function () {
  const G = window.G;
  const world = document.getElementById('world');
  const uiCv = document.getElementById('ui');
  const wrap = document.getElementById('stage');
  const fit = document.getElementById('fit');
  G.wx = world.getContext('2d');
  G.ux = uiCv.getContext('2d');
  if (G.ngonNgu) G.ngonNgu.gan(); // tiếng Anh: lệnh vẽ chữ tự tra từ điển (js/ngon_ngu.js); tiếng Việt: không đụng gì
  G.wx.imageSmoothingEnabled = false;
  G.scale = 1;
  // Độ nét gấp đôi: canvas thế giới có số điểm ảnh thật gấp G.NET lần (480x270 -> 960x540), nhưng mọi code vẫn vẽ theo
  // toạ độ 480x270 như cũ nhờ phép phóng xNET đặt sẵn. Chỗ nào tự đặt lại phép biến hình (setTransform) trên canvas thế giới
  // thì nhân thêm G.NET (dùng G.wxDat). Hình vẽ bằng code: mỗi điểm ảnh cũ thành 2x2, trông y như trước; ảnh AI có "net": 2
  // thì hiện đủ chi tiết gấp đôi. Cài đặt "Độ nét" (Anh Mõ): Cao = 2, Thường = 1 (G.save.net = 'thuong').
  // NÉT CAO (thử nghiệm 17/10, docs/review/ke-hoach-cai-thien/net-cao/bao-cao.md): ?netcao=3 / ?netcao=4 (hoặc cài đặt "Rất cao" = 4) → canvas
  // thế giới 1440×810 / 1920×1080; mọi chỗ đã tính theo G.NET (wxDat, lamTron, canvas phụ) tự theo. Cu Tí, vũ khí, vệt kiếm nặng có ảnh
  // dựng sẵn đúng cỡ (tải lười, chỉ khi bật); quái / nền vẽ phóng nguyên lần (×1,5 / ×2) như cũ. Mặc định (không cờ) y như trước: 2.
  G.NET = 0;
  { let m = null; try { m = /[?&]netcao=([0-9])(&|$)/.exec((typeof location !== 'undefined' && location.search) || ''); } catch (e) { m = null; } G.NET_CAO = m && +m[1] >= 3 ? Math.min(4, +m[1]) : m && m[1] === '0' ? -1 : 0; }
  G.setNet = function (n) {
    n = n >= 4 ? 4 : n >= 3 ? 3 : n >= 2 ? 2 : 1;
    if (G.NET === n && world.width === G.W * n) return;
    G.NET = n;
    world.width = G.W * n; world.height = G.H * n; // đổi cỡ canvas thì mọi trạng thái bút bị đặt lại
    G.wx.imageSmoothingEnabled = false;
    G.wx.setTransform(n, 0, 0, n, 0, 0);
  };
  // Có ảnh nét cao dựng sẵn không (chỉ bản web ảnh rời; bản một tệp không có → cài đặt không hiện "Rất cao").
  G.netCaoCo = () => { try { const z = G.spriteCustom && G.spriteCustom.zed && G.spriteCustom.zed['zed-moi']; return !!(z && z.tep && Array.isArray(z.tep.tam_n4)); } catch (e) { return false; } };
  G.netMuon = () => (G.save && G.save.net === 'thuong' ? 1 : G.NET_CAO > 0 ? G.NET_CAO : G.save && G.save.net === 'ratcao' && G.NET_CAO !== -1 ? 4 : 2); // ?netcao=0: bỏ qua cài đặt Rất cao
  // Đặt phép biến hình cho canvas thế giới theo toạ độ game: tương đương c.setTransform(a, 0, 0, a, x, y) của bản cũ.
  G.wxDat = function (c, x, y, a) { const n = G.NET || 1; a = a == null ? 1 : a; c.setTransform(a * n, 0, 0, a * n, (x || 0) * n, (y || 0) * n); };
  G.setNet(2);

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
    let p = pos(t0 ? { clientX: t0.clientX, clientY: t0.clientY } : e);
    if (G.uiBang) p = G.uiBang.doiCham(p); // mục 15: bảng đang phóng lúc mở → đổi toạ độ ngược đúng phép phóng (khớp hình)
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
  // Soát mượt phiên 3 mục 22 (?venhe=0: chép mảng như cũ): hỏi "có ngón nào thoả fn" / "ngón đầu tiên thoả fn" mà không chép G.pointers
  // ra mảng mới mỗi lần (ui.button hỏi cho từng nút mỗi khung).
  G.coTro = function (fn) { if (G.VE_NHE === false) return [...G.pointers.values()].some(fn); for (const p of G.pointers.values()) if (fn(p)) return true; return false; };
  G.timTro = function (fn) { if (G.VE_NHE === false) return [...G.pointers.values()].find(fn); for (const p of G.pointers.values()) if (fn(p)) return p; return undefined; };
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
  // Một AudioContext cho cả game, tạo ở lần chạm / bấm phím đầu tiên (luật iOS). Tiếng hiệu ứng đi qua nút âm lượng "Tiếng",
  // nhạc nền (js/nhac.js) đi qua nút "Nhạc" riêng. G.save.sound = false tắt cả hai (nút Âm thanh ở Anh Mõ).
  // Âm lượng lưu ở G.save.nhac và G.save.tieng (0..100); không có trường thì là mặc định (nhạc 60, tiếng 100 = to như trước).
  let ac = null, sfxBus = null;
  const AM_MD = { nhac: 60, tieng: 100 };
  G.amThanh = {
    ac: () => ac,
    MD: AM_MD,
    // Âm lượng 0..1 đang dùng (đã tính nút bật/tắt âm thanh)
    vol(k) {
      const sv = G.save;
      if (!sv || !sv.sound) return 0;
      const v = sv[k];
      return (typeof v === 'number' && isFinite(v) ? G.clamp(v, 0, 100) : AM_MD[k] != null ? AM_MD[k] : 100) / 100;
    },
    so(k) { const v = G.save && G.save[k]; return Math.round(typeof v === 'number' && isFinite(v) ? G.clamp(v, 0, 100) : AM_MD[k]); },
    // Đổi âm lượng thì gọi để áp ngay
    capNhat() {
      try { if (ac && sfxBus) sfxBus.gain.setTargetAtTime(G.amThanh.vol('tieng'), ac.currentTime, 0.03); } catch (e) { /* bỏ qua */ }
      if (G.nhac && G.nhac.capNhat) G.nhac.capNhat();
    },
  };
  G.audioStart = function () {
    if (!G.save || !G.save.sound) return;
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        // Mục 13 (soát mượt Phiên 2): latencyHint 'interactive' cho tiếng đánh ra sát lúc chạm (máy không nhận tuỳ chọn thì tạo như cũ). ?amcu=1: như cũ.
        if (G.AM_MOI !== false) { try { ac = new AC({ latencyHint: 'interactive' }); } catch (e) { ac = null; } }
        if (!ac) ac = new AC();
        sfxBus = ac.createGain(); sfxBus.gain.value = G.amThanh.vol('tieng'); sfxBus.connect(ac.destination);
      }
      if (ac.state === 'suspended' && !document.hidden) ac.resume().catch(() => {});
    } catch (e) { /* máy không có âm thanh */ }
  };
  const SFX = {
    hit: [220, 0.05, 'square', 0.05], swing: [520, 0.04, 'triangle', 0.03], hurt: [110, 0.12, 'sawtooth', 0.07],
    mark: [1040, 0.09, 'sine', 0.06], evolve: [660, 0.35, 'triangle', 0.08], warn: [330, 0.1, 'square', 0.04],
    gong: [98, 0.6, 'sine', 0.12], pick: [780, 0.08, 'sine', 0.05], die: [160, 0.1, 'square', 0.04],
    fire: [300, 0.08, 'sawtooth', 0.03], poison: [180, 0.1, 'triangle', 0.04], ice: [1400, 0.06, 'sine', 0.04],
    boom: [70, 0.25, 'sawtooth', 0.1], ui: [600, 0.03, 'square', 0.03], win: [880, 0.5, 'triangle', 0.08],
    // Mục 13: tiếng trúng theo vũ khí (G.sfxDanh) và lớp cao của chí mạng
    hitKiem: [240, 0.05, 'square', 0.05], hitGiao: [330, 0.045, 'triangle', 0.06], hitBua: [118, 0.1, 'square', 0.075],
    hitDam: [190, 0.045, 'square', 0.045], hitTieu: [430, 0.035, 'triangle', 0.04], chiMang: [1320, 0.08, 'sine', 0.035],
  };
  // ---------- Mục 13 (soát mượt Phiên 2): tiếng đánh đổi cao độ, theo vũ khí, vung đúng lúc ----------
  // G.AM_MOI (tắt: ?amcu=1 → một tiếng 'hit' 220 Hz cho mọi đòn, tiếng vung lúc bấm nút như cũ):
  //  - tiếng vung / trúng / chí mạng đổi cao độ ngẫu nhiên ±8% (Math.random, không đụng chuỗi ngẫu nhiên G.rnd của luật chơi);
  //  - tiếng trúng theo vũ khí: kiếm, giáo, búa (thấp, to, trầm dần), đấm, phi tiêu; đòn nặng (nhát kết, quét, nện) thấp hơn x0,82 và to hơn x1,3;
  //    chí mạng thêm lớp cao 1320 Hz;
  //  - tiếng vung phát ở ~60% đà (G.sfxVung, hẹn giờ bằng đồng hồ âm thanh) thay vì lúc bấm.
  if (G.AM_MOI === undefined) { let cu = false; try { cu = /[?&]amcu=1(&|$)/.test(location.search || ''); } catch (e) { cu = false; } G.AM_MOI = !cu; }
  const DOI_CAO = { hit: 1, swing: 1, hitKiem: 1, hitGiao: 1, hitBua: 1, hitDam: 1, hitTieu: 1, chiMang: 1 };
  const AM_VK = { sword: 'hitKiem', spear: 'hitGiao', hammer: 'hitBua', fist: 'hitDam', bow: 'hitTieu' };
  let amCho = { crit: false, nang: false }; // js/combat.js playerHit ghi lại đòn vừa trúng có chí mạng / nặng không (G.amGhi)
  G.amGhi = function (crit, nang) { if (crit) amCho.crit = true; if (nang) amCho.nang = true; };
  // Tiếng trúng của đòn người chơi. type: loại vũ khí; cu: cao độ tiếng 'hit' của bản cũ ở chỗ gọi (mặc định 1).
  G.sfxDanh = function (type, cu) {
    const ch = amCho; amCho = { crit: false, nang: false };
    if (G.AM_MOI === false) { G.sfx('hit', cu); return; }
    const nang = ch.nang || type === 'hammer';
    G.sfx(AM_VK[type] || 'hit', nang && type !== 'hammer' ? 0.82 : 1, nang ? 1.3 : 1);
    if (ch.crit) G.sfx('chiMang');
  };
  // Tiếng vung: bản mới hẹn ở 60% quãng từ lúc ra đòn tới lúc chạm (hitAt, mặc định 0,45 động tác). dur: thời lượng đòn, phase: đã đi sẵn.
  G.sfxVung = function (pitch, dur, hitAt, phase) {
    if (G.AM_MOI === false) { G.sfx('swing', pitch); return; }
    const tre = Math.max(0, ((hitAt != null ? hitAt : 0.45) * 0.6 - (phase || 0)) * (dur || 0));
    G.sfx('swing', pitch, 1, Math.min(0.4, tre));
  };
  // V30: giới hạn tiếng cùng lúc để 20 quái chết một lúc không thành 20 tiếng chồng nhau (rè, to bất thường).
  // Mỗi loại tối đa 2 tiếng đang kêu, tổng tối đa 8 tiếng, tổng âm lượng các tiếng đang kêu không quá 0,28.
  // Hết "chỗ" âm lượng thì tiếng mới nhỏ lại cho vừa; còn quá ít thì bỏ qua.
  const voices = [], MAX_SAME = 2, MAX_VOICES = 8, MAX_GAIN = 0.28;
  G.sfx = function (name, pitch, to, tre) { // to: nhân âm lượng (mục 13), tre: phát trễ bao nhiêu giây (mục 13, tiếng vung)
    if (!ac || !G.save.sound || G.noRender || ac.state !== 'running' || !sfxBus) return;
    const d = SFX[name];
    if (!d) return;
    try {
      const now = ac.currentTime + (tre > 0 ? tre : 0);
      if (G.AM_MOI !== false && DOI_CAO[name]) pitch = (pitch || 1) * (1 + (Math.random() * 2 - 1) * 0.08);
      for (let i = voices.length - 1; i >= 0; i--) if (voices[i].end <= ac.currentTime) voices.splice(i, 1);
      let same = 0, sum = 0;
      for (const v of voices) { sum += v.g; if (v.name === name) same++; }
      if (same >= MAX_SAME || voices.length >= MAX_VOICES) return;
      const vol = Math.min(d[3] * (to > 0 ? to : 1), MAX_GAIN - sum);
      if (vol < 0.01) return;
      voices.push({ name, end: now + d[1] + 0.02, g: vol });
      // Tiếng "gong" (trùm ra mắt, đổi pha) là tiếng chiêng ấm, ngân dài (js/nhac.js); không có js/nhac.js thì như cũ.
      if (name === 'gong' && G.nhac && G.nhac.chieng) { G.nhac.chieng(sfxBus, now, 98 * (pitch || 1), vol * 1.2, 0.8); return; }
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = d[2];
      o.frequency.value = d[0] * (pitch || 1);
      if (name === 'evolve' || name === 'win') o.frequency.exponentialRampToValueAtTime(d[0] * 2, ac.currentTime + d[1]);
      if (name === 'boom' || name === 'hurt') o.frequency.exponentialRampToValueAtTime(d[0] * 0.5, now + d[1]);
      if (name === 'hitBua') o.frequency.exponentialRampToValueAtTime(d[0] * (pitch || 1) * 0.6, now + d[1]); // búa: trầm dần
      if (name === 'chiMang') o.frequency.exponentialRampToValueAtTime(d[0] * (pitch || 1) * 1.5, now + d[1]); // chí mạng: vút lên
      if (now > ac.currentTime) { g.gain.setValueAtTime(vol, now); } else g.gain.value = vol;
      g.gain.exponentialRampToValueAtTime(0.0001, now + d[1]);
      o.connect(g); g.connect(sfxBus);
      o.start(now); o.stop(now + d[1] + 0.02);
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  };

  // ---------- lưu game ----------
  // Đợt 2: bỏ cờ ?hethongcu=1 (bản lưu riêng ..._hecu không còn được đọc/ghi). Bản sao trước khi chuyển hệ mới vẫn nằm ở ..._truoc_he_moi.
  const KEY = 'linhkhi_save_v1';
  G.SAVE_KEY = KEY;
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
      v: 1, gold: 0, ore: 0, stones: 0, mats: [0, 0, 0], shards: G.REGIONS.map(() => 0), forge: 1, // shards: mỗi vùng một loại mảnh trùm (vùng 4: 4 ô)
      heroes: {}, hero: 'smith', weapons: [], nextId: 1, carry: [null, null],
      stars: {}, stars2: {}, scars: {}, tut: {}, sound: true, wins: 0, bossGold: {},
    };
    for (const k of G.HKEYS) s.heroes[k] = { unlocked: k === 'smith', lvl: 1, xp: 0, sk: { atk: 0, def: 0, elem: 0 }, ch: { cay: G.CHUONG ? G.CHUONG.defTree[k] : 'hoa', n: {} } };
    s.carry[0] = G.newWeapon(s, 'sword', 0, { family: 0 }).id; // Kiếm Rèn
    s.carry[1] = G.newWeapon(s, 'bow', 0, { family: 0 }).id;   // Phi tiêu (Cung Tre)
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
    if (G.ngonNgu) G.ngonNgu.tuBanLuu(); // ngôn ngữ theo máy; máy chưa chọn thì theo bản lưu
    if (raw && (bad || fixFailed)) {
      try {
        const ls = window.localStorage, old = ls.getItem(KEY_HONG);
        if (old === null || old === raw) ls.setItem(KEY_HONG, raw);
        else ls.setItem(KEY_HONG + '2', raw);
        console.error('Linh Khí: bản lưu cũ không dùng được, đã chép sang khoá dự phòng ' + KEY_HONG);
      } catch (e) { /* bộ nhớ đầy: chơi tiếp */ }
    }
  };
  // Kiểm tra bản lưu cũ hoặc hỏng: thiếu gì thì bù, sai gì thì sửa, hỏng nặng thì tạo mới.
  // Hệ thống mới đợt 1: phần chuyển bản lưu cũ sang 4 vũ khí cố định / bỏ quần áo cũ (một lần, cờ s.heMoi = 1) và giữ đúng 4 vũ khí mỗi
  // lần nạp nằm ở js/vk_moi.js (bọc G.fixSave, chạy SAU phần dưới đây và sau js/linhkhi.js; mọi đường nạp máy / mây đều đi qua).
  // Phiên hiệu năng (bản lưu): sửa TỪNG PHẦN riêng. Một phần gặp lỗi (ví dụ bản cập nhật có lỗi trong phần sửa vũ khí) thì giữ nguyên dữ liệu cũ
  // của phần đó (sai kiểu hẳn thì lấy phần đó của bản mới), các phần khác vẫn sửa bình thường, KHÔNG trả bản trắng. Có phần lỗi thì vẫn
  // chép bản gốc sang khoá dự phòng như trước (fixFailed). Chỉ bản không phải đối tượng / sai phiên bản mới thành bản mới.
  // PHIÊN BẢN CÂN LẠI ĐỒ (đợt 4, YEU-CAU-4-RESET-CAN-BANG.md): bản lưu có s.canLai khác số này thì js/vk_moi.js (VM.canLai, chạy SAU phần
  // dưới đây) tính lại MỘT lần mọi món theo luật hiện hành: 4 vũ khí chỉ giữ cấp + hệ + mài (mài vượt G.MAX_SHARPEN thì hoàn quặng / vàng /
  // nguyên liệu), bộ trang phục mở đúng theo trùm đã hạ, bỏ trường đồ cũ, điểm kỹ năng / chưởng sai luật trả lại, đá tôi đổi ra quặng.
  // Không đụng vàng, linh khí, cấp, sao ải, tiến độ vùng. Đổi luật đồ lần sau: tăng số này là mọi bản lưu (máy + mây) chạy lại một lần.
  // Lưu ý: KHÔNG thêm cờ s.canLai vào G.newSave — vòng "thiếu gì thì bù" bên dưới sẽ chép cờ của bản mới sang bản cũ (đã gặp ở cờ heMoi).
  G.SAVE_CAN_LAI = 1;
  G.fixSave = function (s) {
    const base = G.newSave();
    fixFailed = false;
    G.fixSaveLoi = [];
    try {
      if (!s || typeof s !== 'object' || Array.isArray(s) || s.v !== 1) { fixFailed = s != null; return base; }
      const kieu = (v) => (Array.isArray(v) ? 'arr' : v === null ? 'null' : typeof v);
      const phan = (ten, keys, f) => {
        try { f(); } catch (e) {
          fixFailed = true; G.fixSaveLoi.push(ten);
          console.error('Linh Khí: lỗi khi sửa phần "' + ten + '" của bản lưu, giữ dữ liệu cũ của phần này', e);
          for (const k of keys) if (base[k] !== undefined && base[k] !== null && kieu(s[k]) !== kieu(base[k])) s[k] = base[k];
        }
      };
      const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
      const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
      const arr3 = (v) => [0, 1, 2].map((i) => Math.max(0, num(Array.isArray(v) ? v[i] : 0, 0)));
      for (const k in base) if (!(k in s)) s[k] = base[k];
      phan('tài nguyên', ['gold', 'ore', 'stones', 'wins', 'mats', 'shards', 'forge'], () => {
      for (const k of ['gold', 'ore', 'stones', 'wins']) s[k] = Math.max(0, Math.floor(num(s[k], 0)));
      // mảnh trùm: mỗi vùng một ô (vùng 4 → 4 ô); bản lưu cũ 3 ô thêm ô 0; tắt vùng 4 (?vung4=0) vẫn giữ ô thứ 4 đã có, không xoá
      const nSh = Math.max(G.REGIONS.length, Math.min(4, Array.isArray(s.shards) ? s.shards.length : 0));
      s.mats = arr3(s.mats); s.shards = arr3(s.shards).concat(Array.from({ length: Math.max(0, nSh - 3) }, (_, j) => Math.max(0, num(Array.isArray(s.shards) ? s.shards[3 + j] : 0, 0))));
      s.forge = G.clamp(Math.floor(num(s.forge, 1)), 1, G.FORGE_CAP.length - 1);
      });
      phan('cài đặt', [], () => {
      s.sound = s.sound !== false;
      if (s.lang !== 'en') delete s.lang; // ngôn ngữ: không có (mặc định) là tiếng Việt, 'en' là tiếng Anh (js/ngon_ngu.js)
      if (s.net !== 'thuong' && s.net !== 'ratcao') delete s.net; // độ nét: không có (mặc định) là Cao, 'thuong' là Thường, 'ratcao' là Rất cao (thử nghiệm, nét 4)
      if (s.pin !== true) delete s.pin; // tiết kiệm pin (vẽ 30 khung/giây, js/engine.js V6): không có là tắt
      // âm lượng Nhạc / Tiếng 0..100 (G.amThanh): không có trường là mặc định; số hỏng thì bỏ (về mặc định)
      for (const k of ['nhac', 'tieng']) { if (typeof s[k] === 'number' && isFinite(s[k])) s[k] = G.clamp(Math.round(s[k]), 0, 100); else delete s[k]; }
      // tiến độ truyện (js/truyen.js): { mo, v, n }; sai kiểu thì bỏ, js/truyen.js tự dựng lại theo tiến độ chơi
      if (s.truyen != null && (typeof s.truyen !== 'object' || Array.isArray(s.truyen))) delete s.truyen;
      });
      phan('sao, dấu', ['stars', 'stars2', 'scars', 'tut'], () => {
      for (const k of ['stars', 'stars2', 'scars', 'tut']) s[k] = obj(s[k]);
      for (const k of ['stars', 'stars2']) for (const id in s[k]) s[k][id] = G.clamp(Math.floor(num(s[k][id], 1)), 1, 3);
      for (const id in s.scars) if (!G.ELS.includes(s.scars[id])) delete s.scars[id];
      // "Quyết tâm" (thua nhiều thì mạnh thêm) đã bỏ: bản lưu cũ còn trường grit thì xoá đi, phần còn lại đọc bình thường.
      delete s.grit;
      });
      // hero (từng em bé riêng: một em lỗi không kéo theo em khác)
      phan('em bé', ['heroes'], () => { s.heroes = obj(s.heroes); });
      for (const k of G.HKEYS) phan('em bé ' + k, [], () => {
        if (!s.heroes || typeof s.heroes !== 'object') s.heroes = {};
        const h = obj(s.heroes[k]), sk = obj(h.sk);
        const lvl = G.clamp(Math.floor(num(h.lvl, 1)), 1, G.MAX_LEVEL);
        const fix = { unlocked: k === 'smith' || !!h.unlocked, lvl, xp: Math.max(0, num(h.xp, 0)), sk: {} };
        for (const b of G.SKEYS) fix.sk[b] = G.clamp(Math.floor(num(sk[b], 0)), 0, G.SKILLS && G.SKILLS[b] ? G.SKILLS[b].nodes.length : 5);
        if (fix.sk.atk + fix.sk.def + fix.sk.elem > Math.floor(lvl / 3)) fix.sk = { atk: 0, def: 0, elem: 0 };
        s.heroes[k] = Object.assign(h, fix);
        // Cây chưởng (js/chuong.js): bản lưu cũ chưa có thì nhận cây mặc định, điểm chưởng tính theo cấp nên tự có đủ điểm bù.
        if (G.chuong) G.chuong.fix(s.heroes[k], k);
      });
      phan('em bé đang chơi', ['hero'], () => {
      for (const k of G.HKEYS) if (!s.heroes[k] || typeof s.heroes[k] !== 'object') s.heroes[k] = base.heroes[k]; // em lỗi nặng: lấy bản mới của riêng em đó
      if (!G.HKEYS.includes(s.hero) || !s.heroes[s.hero].unlocked) s.hero = 'smith';
      });
      // ZED: một nhân vật. Bản lưu cũ nhiều em bé được CHUYỂN, không xoá:
      //  - Zed (khoá smith) nhận cấp, kinh nghiệm, điểm kỹ năng, cây chưởng của em bé cấp cao nhất (bằng cấp thì kinh nghiệm nhiều hơn);
      //    dữ liệu cũ của Cu Tí cất ở save.zed.cuTi, dữ liệu ba bé kia để nguyên trong save.heroes (đợt 2 bỏ cờ ?zed=0, chỉ còn để đọc).
      //  - Trùm vùng nào đã hạ (bé đã được cứu, hoặc có sao ải trùm) = bạn đó đã dạy Zed (save.zed.hoc).
      //  - Vũ khí, đồ, vàng, tiến trình không đụng tới. Chuyển một lần (save.zed.v = 1); có thay đổi thì làng báo một lần (save.zed.bao).
      // Dữ liệu zed lỗi: dựng lại từ đầu theo luật trên (an toàn, không mất gì vì em bé cũ vẫn còn trong save.heroes).
      phan('Zed', [], () => {
        let z = s.zed;
        if (!z || typeof z !== 'object' || Array.isArray(z)) z = null;
        if (!z || z.v !== 1) {
          const nz = { v: 1, hoc: {} };
          let best = 'smith';
          for (const k of G.HKEYS) {
            const h = s.heroes[k], b = s.heroes[best];
            if (!h || !h.unlocked) continue;
            if ((h.lvl | 0) > (b.lvl | 0) || ((h.lvl | 0) === (b.lvl | 0) && num(h.xp, 0) > num(b.xp, 0))) best = k;
          }
          if (best !== 'smith') {
            const sm = s.heroes.smith, h = s.heroes[best];
            nz.cuTi = JSON.parse(JSON.stringify(sm));
            sm.lvl = h.lvl; sm.xp = h.xp; sm.sk = Object.assign({}, h.sk);
            if (h.ch && typeof h.ch === 'object') sm.ch = JSON.parse(JSON.stringify(h.ch));
            if (G.chuong) G.chuong.fix(sm, 'smith');
            nz.tu = best;
          }
          for (let r = 0; r < G.REGIONS.length; r++) {
            const k = G.REGIONS[r].rescue;
            if (k && ((s.heroes[k] && s.heroes[k].unlocked) || (s.stars && s.stars[r + '-4']))) nz.hoc[k] = 1;
          }
          if (nz.tu || Object.keys(nz.hoc).length) nz.bao = 1;
          s.zed = z = nz;
        }
        const hoc = z.hoc && typeof z.hoc === 'object' && !Array.isArray(z.hoc) ? z.hoc : {};
        z.hoc = {};
        for (const k of G.ZED_DAY_KEYS) {
          // bản lưu cũ (chơi bằng cờ ?zed=0 trước đợt 2) đã cứu thêm bạn: bạn đó cũng đã dạy
          if (hoc[k] || (s.heroes[k] && s.heroes[k].unlocked)) { z.hoc[k] = 1; if (s.heroes[k]) s.heroes[k].unlocked = true; }
        }
        if (z.bao !== 1) delete z.bao;
        if (z.tu && !G.HKEYS.includes(z.tu)) delete z.tu;
        // trang phục Zed (js/data.js G.ZED_BO): boMo = các bộ đã CÓ, bo = bộ đang mặc. Bản lưu cũ không có → 'ninja'.
        // 15/10 (bo-do-mua): hạ trùm vùng chỉ MỞ BÁN bộ (boBan), mua bằng vàng ở Cô Thợ May mới có. boMua = 1: bản lưu đã theo luật mua.
        // Bản lưu CŨ (chưa có boMua) đã hạ trùm mà chưa có bộ thì tặng luôn như luật cũ (không bắt mua lại, cấp bộ giữ nguyên),
        // rồi đánh dấu boMua. ?bocu=1 (G.BO_MUA_BAT = false): lần nạp nào cũng tặng như cũ.
        if (G.ZED_BO) {
          const mua = G.BO_MUA_BAT !== false, cu = z.boMua !== 1;
          const mo = z.boMo && typeof z.boMo === 'object' && !Array.isArray(z.boMo) ? z.boMo : {};
          const ban = z.boBan && typeof z.boBan === 'object' && !Array.isArray(z.boBan) ? z.boBan : {};
          z.boMo = {}; z.boBan = {};
          for (const k of G.ZED_BO_KEYS) {
            if (k === 'ninja') continue;
            const r = G.zedBoVung(k), ha = r >= 0 && !!((s.stars && s.stars[r + '-4']) || (s.stars2 && s.stars2[r + '-4']));
            const haCu = r >= 0 && !!(s.stars && s.stars[r + '-4']); // luật cũ chỉ tặng bù theo sao độ khó 1
            if (mo[k]) z.boMo[k] = 1;
            else if (haCu && (!mua || cu)) { z.boMo[k] = 1; z.boBao = 1; } // mở bù (bản lưu cũ / ?bocu=1): làng báo một lần
            else if (mua && (ban[k] || ha)) z.boBan[k] = 1; // mở bán, chưa mua
          }
          if (mua) z.boMua = 1;
          if (!Object.keys(z.boMo).length) delete z.boMo;
          if (!Object.keys(z.boBan).length) delete z.boBan;
          if (z.bo && z.bo !== 'ninja' && G.ZED_BO[z.bo] && z.boMo && z.boMo[z.bo]) z.bo = String(z.bo); else delete z.bo;
          if (z.boBao !== 1 || !z.boMo) delete z.boBao;
          if (z.boBanBao !== 1 || !z.boBan) delete z.boBanBao;
          if (z.boXem && (typeof z.boXem !== 'object' || Array.isArray(z.boXem))) delete z.boXem;
        }
        s.hero = 'smith';
      });
      // vũ khí
      phan('vũ khí', ['weapons', 'nextId', 'bossGold', 'carry'], () => {
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
        delete w.lock; // khoá đồ của bản cũ (bán đồ đã bỏ ở đợt 2)
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
      if (s.weapons.length < 2) G.newWeapon(s, 'bow', 0, { family: 0 });
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
      });
      // Mũ, áo, bùa đời cũ (s.owned, s.helm, s.armor, s.charm) và trang phục cũ (s.outfit): đợt 2 bỏ js/outfit.js; js/vk_moi.js đọc
      // thẳng các trường này (bỏ qua mã lạ) để hoàn vàng + linh khí một lần khi chuyển hệ mới, rồi xoá.
      return s;
    } catch (e) { fixFailed = true; console.error('Linh Khí: lỗi khi sửa bản lưu, dùng bản mới', e); return base; }
  };
  G.persist = function () {
    try { window.localStorage.setItem(KEY, JSON.stringify(G.save)); } catch (e) { /* chơi không lưu */ }
  };
  G.resetSave = function () {
    G.save = G.newSave();
    // sua-mat-bac-ep: bản "Xoá hết" là bản mới theo luật hiện hành → đánh dấu đã cân lại, để lần nạp sau VM.canLai (js/vk_moi.js) không
    // chạy lại vô cớ. Chỉ đặt ở đây, KHÔNG trong G.newSave (xem ghi chú ở G.SAVE_CAN_LAI).
    G.save.canLai = G.SAVE_CAN_LAI || 1;
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
    // Tải nhanh (12/10): kiểu nối / đầu nét về mặc định mỗi khung. Có chỗ vẽ code đặt lineJoin = 'round' mà không trả lại (ví dụ chữ LINH KHÍ
    // khi ảnh logo chưa về); ảnh về muộn thì nét để lại làm góc khung HUD tròn đi, khác bản ảnh có sẵn ngay từ đầu.
    c.lineJoin = 'miter'; c.lineCap = 'butt';
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
    const words = String(G.tv ? G.tv(str) : str).split(' ');
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
    const hover = G.coTro((p) => !p.role && !p.stale && G.inRect(p, x, y, w, h));
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

  // ---------- SOÁT MƯỢT PHIÊN 3 (15/10, docs/review/ke-hoach-cai-thien/soat-muot/bao-cao-phien-3.md): cờ quay lui, mỗi mục một cờ ----------
  // Chỉ đổi HÌNH (cách vẽ), không đổi luật chơi. Cờ bật mặc định; đặt G.X = false trước khi nạp, hoặc thêm cờ trên địa chỉ:
  //   ?noisuy=0  mục 1: nội suy vị trí khi vẽ + làm tròn camera / nhân vật cùng kiểu nửa điểm ảnh  (G.NOI_SUY)
  //   ?humo=0    mục 8: hiệu ứng ảnh một lần mờ dần cuối + giữ khung cuối, nổ / trúng đòn nảy nhẹ (G.HU_MO, js/fx.js)
  //   ?bthoa=0   mục 9A: vùng báo trước hoà khung kế + nhịp sáng 0,15 giây cuối (G.BT_HOA, js/bao_truoc.js)
  //   ?hoalap=0  mục 16A: hiệu ứng lặp chậm (4,5–9 khung/giây) hoà nhẹ khung kế (G.HOA_LAP, js/fx_anh.js)
  //   ?uimuot=0  mục 15: chuyển màn mờ ra / vào, bảng mở / đóng, truyện hoà ảnh + chữ chạy, thanh kinh nghiệm chạy, màn tải mờ (G.UI_MUOT)
  //   ?thocuti=0 mục 17: Cu Tí đứng thở / tụ lực búa phát đi đi về về (G.THO_CUTI, js/zed_moi.js)
  //   ?nhipcuti=0 mục 20: Cu Tí giữ pha bước chung cho đi / chạy, vùng đệm đổi đi↔chạy (G.NHIP_CUTI, js/zed_moi.js)
  //   ?tile05=0  mục 21: cỡ hiệu ứng ảnh làm tròn bậc 0,5; đạn xoay theo 16 hướng (G.TILE05, js/fx_anh.js, js/fx_dan.js)
  //   ?venhe=0   mục 22: bớt việc vẽ (viền bé, bộ nhớ thanh, vệt chém, quạt báo trước, mảng tạm) (G.VE_NHE)
  G.coTat = function (re) { try { return re.test(String((typeof location !== 'undefined' && location.search) || '')); } catch (e) { return false; } };
  for (const [k, ten] of [['NOI_SUY', 'noisuy'], ['HU_MO', 'humo'], ['BT_HOA', 'bthoa'], ['HOA_LAP', 'hoalap'], ['UI_MUOT', 'uimuot'], ['THO_CUTI', 'thocuti'], ['NHIP_CUTI', 'nhipcuti'], ['TILE05', 'tile05'], ['VE_NHE', 'venhe']]) {
    if (G[k] == null) G[k] = !G.coTat(new RegExp('[?&]' + ten + '=0(&|$)'));
  }
  // Mục 1: làm tròn vị trí vẽ. Bật: theo nửa điểm ảnh game (= 1 điểm ảnh thật khi G.NET = 2, không vỡ nét); camera và nhân vật dùng CÙNG
  // một kiểu nên không lệch nhau 1 điểm ảnh khi camera đuổi chậm. Tắt (?noisuy=0) hoặc Độ nét Thường (G.NET = 1): Math.round như cũ.
  G.lamTron = (v) => { const n = G.NOI_SUY !== false ? G.NET || 1 : 1; return n > 1 ? Math.round(v * n) / n : Math.round(v); };
  G.nsAlpha = 1; // phần lẻ của nhịp logic lúc vẽ (0..1), do vòng lặp đặt; js/combat.js dùng để vẽ ở vị trí trung gian

  // ---------- Mục 15: bảng mở / đóng (cờ G.UI_MUOT) ----------
  // Mở: phóng 0,94 → 1 cùng độ hiện trong 0,12 giây (ease-out) quanh giữa khung. Trong lúc phóng, toạ độ chạm (G.click, nút chạy ngay
  // G.syncTaps) được đổi ngược đúng phép phóng → chạm vào đâu trên hình là đúng nút đó (vùng chạm khớp hình đang thấy).
  // Đóng: hình bảng vừa đóng (chụp lớp #ui của khung trước) mờ dần 0,12 giây đè lên màn mới; không nhận chạm (chạm rơi vào màn mới bên dưới).
  // Làng: cả lớp #ui khi đang mở bảng (nền làng tối ở #world không phóng). Trong ải: chỉ phần bảng (js/stage.js gọi G.uiBang.vao / ra).
  const BANG_MO = 0.12, BANG_DONG = 0.12;
  const BANG_AI = { paused: 1, map: 1, bag: 1, result: 1, dead: 1, chest: 1, merchant: 1, curse: 1 };
  const BANG_LANG_KHONG = { hub: 1, title: 1, map: 1, aingay: 1 }; // màn đầy đủ / làng: không tính là bảng
  const UB = { khoa: '', canh: null, mo: -9, dong: -9, bong: null, bongCv: null, s: 1, a: 1, phong: false, clickGoc: null, clickMoi: null };
  function khoaBang() {
    try {
      const sc = G.scene;
      if (sc && sc === G.Village) { const V = G.villageApi && G.villageApi.V; return V && V.tab && !BANG_LANG_KHONG[V.tab] ? 'lang:' + V.tab : ''; }
      if (sc && sc === G.StageScene && G.getRun) { const S = G.getRun(); return S && BANG_AI[S.mode] ? 'ai:' + S.mode : ''; }
    } catch (e) { /* bỏ qua */ }
    return '';
  }
  const daoDong = (u) => 1 - (1 - u) * (1 - u) * (1 - u); // ease-out
  // Gọi đầu khung vẽ (trước ui.begin): nhận ra bảng vừa mở / vừa đóng. Đóng thì chụp lại lớp #ui của khung trước làm bóng mờ dần.
  function bangDauKhung(now) {
    UB.s = 1; // phép phóng chỉ còn hiệu lực nếu khung này lại phóng (bangVao); bảng đóng giữa chừng thì chạm không bị đổi nữa
    if (G.UI_MUOT === false) { UB.khoa = ''; UB.bong = null; return; }
    const k = khoaBang(), sc = G.scene;
    if (sc !== UB.canh) { UB.canh = sc; UB.khoa = k; UB.mo = -9; UB.bong = null; return; } // đổi màn: phần chuyển màn lo
    if (k === UB.khoa) return;
    if (k && !UB.khoa) UB.mo = now; // từ không bảng → có bảng: mở
    else if (!k && UB.khoa) { // đóng bảng: chụp bóng
      try {
        if (!UB.bongCv) UB.bongCv = document.createElement('canvas');
        const b = UB.bongCv;
        if (b.width !== uiCv.width || b.height !== uiCv.height) { b.width = uiCv.width; b.height = uiCv.height; }
        const g = b.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, b.width, b.height); g.drawImage(uiCv, 0, 0);
        UB.bong = b; UB.dong = now;
      } catch (e) { UB.bong = null; }
      UB.mo = -9;
    }
    UB.khoa = k;
  }
  function bangCuoiKhung(now) { // vẽ bóng bảng vừa đóng (đè lên trên, không nhận chạm)
    if (!UB.bong) return;
    const u = (now - UB.dong) / BANG_DONG;
    if (u >= 1 || u < 0) { UB.bong = null; return; }
    const c = G.ux; c.save();
    try { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1 - daoDong(u); c.drawImage(UB.bong, 0, 0); } finally { c.restore(); }
  }
  // Áp phép phóng mở bảng lên G.ux (đã ui.begin). Trả về true nếu đã áp (khi đó PHẢI gọi G.uiBang.ra()).
  function bangVao(now) {
    if (G.UI_MUOT === false || UB.phong) return false;
    const u = (now - UB.mo) / BANG_MO;
    if (!(u >= 0 && u < 1)) { UB.s = 1; return false; }
    const e = daoDong(u), s = 0.94 + 0.06 * e, cx = G.W / 2, cy = G.H / 2, c = G.ux;
    c.save(); c.translate(cx, cy); c.scale(s, s); c.translate(-cx, -cy); c.globalAlpha *= e;
    UB.s = s; UB.phong = true;
    UB.clickGoc = G.click;
    if (G.click) { G.click = { x: cx + (G.click.x - cx) / s, y: cy + (G.click.y - cy) / s }; UB.clickMoi = G.click; } else UB.clickMoi = null;
    return true;
  }
  function bangRa() {
    if (!UB.phong) return;
    UB.phong = false;
    try { G.ux.restore(); } catch (e) { /* bỏ qua */ }
    if (UB.clickMoi && G.click === UB.clickMoi) G.click = UB.clickGoc; // chạm chưa dùng: trả lại toạ độ gốc cho phần vẽ sau
    UB.clickGoc = UB.clickMoi = null;
  }
  // Toạ độ chạm của nút chạy ngay (G.syncTaps) theo đúng phép phóng của khung vừa vẽ.
  function bangDoiCham(p) {
    if (!(UB.s < 1) || G.UI_MUOT === false) return p;
    const cx = G.W / 2, cy = G.H / 2;
    return { x: cx + (p.x - cx) / UB.s, y: cy + (p.y - cy) / UB.s };
  }
  G.uiBang = { vao: () => bangVao(performance.now() / 1000), ra: bangRa, khoa: khoaBang, doiCham: bangDoiCham, _UB: UB };

  // ---------- Mục 15: chuyển màn (cờ G.UI_MUOT) ----------
  // Đổi màn vẫn tức thì như cũ (luật, enter(), chạm của màn mới không trễ). Chỉ phần HÌNH: 0,1 giây đầu hiện ảnh chụp màn cũ tối dần
  // về đen (trong lúc đó bỏ chạm, vì màn mới chưa thấy), rồi 0,15 giây màn mới hiện dần từ đen. Tổng 0,25 giây.
  const CM_RA = 0.1, CM_VAO = 0.15;
  const CM = { cho: false, at: -9, cv: null, co: false };
  function chuyenDauKhung(now) { // gọi đầu khung vẽ, trước khi màn mới vẽ đè: chụp màn cũ (#world + #ui của khung trước)
    if (!CM.cho) return;
    CM.cho = false;
    try {
      if (!CM.cv) CM.cv = document.createElement('canvas');
      const b = CM.cv;
      if (b.width !== uiCv.width || b.height !== uiCv.height) { b.width = uiCv.width; b.height = uiCv.height; }
      const g = b.getContext('2d'), d = G.dpr || 1;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, b.width, b.height);
      g.imageSmoothingEnabled = false;
      g.drawImage(world, G.ox * d, G.oy * d, G.W * G.scale * d, G.H * G.scale * d);
      g.drawImage(uiCv, 0, 0);
      CM.co = true;
    } catch (e) { CM.co = false; }
    CM.at = now;
  }
  function chuyenCuoiKhung(now) {
    const u = now - CM.at;
    if (!(u >= 0) || u >= CM_RA + CM_VAO) { CM.co = false; return; }
    const c = G.ux, d = G.dpr || 1;
    c.save();
    try {
      c.setTransform(1, 0, 0, 1, 0, 0);
      const x = G.ox * d, y = G.oy * d, w = G.W * G.scale * d, h = G.H * G.scale * d;
      if (u < CM_RA) {
        if (CM.co && CM.cv) { c.globalAlpha = 1; c.drawImage(CM.cv, 0, 0); }
        c.globalAlpha = u / CM_RA; c.fillStyle = '#000'; c.fillRect(x, y, w, h);
      } else { const k = 1 - (u - CM_RA) / CM_VAO; c.globalAlpha = k * k; c.fillStyle = '#000'; c.fillRect(x, y, w, h); }
    } finally { c.restore(); }
  }
  const dangChuyenRa = (now) => G.UI_MUOT !== false && now - CM.at >= 0 && now - CM.at < CM_RA;

  // ---------- vòng lặp ----------
  G.scene = null;
  G.setScene = function (s) {
    if (G.UI_MUOT !== false && G.scene && s !== G.scene && !G.noRender && daVe) CM.cho = true; // mục 15: lần vẽ tới chụp màn cũ rồi mờ
    // Phiên hiệu năng (V2): về làng thì bỏ khung / tấm nhuộm của quái và trùm vừa gặp (ải sau gặp quái khác; cần thì tự dựng lại).
    if (s && s === G.Village && G.scene !== s && G.boNho && G.BO_NHO) { try { G.boNho.xoaNhom('quai'); } catch (e) { /* bỏ qua */ } }
    G.scene = s;
    G.syncTaps = [];
    G.click = null;
    G.stalePointers();
    if (s.enter) s.enter();
  };
  G.time = 0;
  const STEP = 1 / 60;
  let last = 0, acc = 0, daVe = false;
  G.tick = function () {
    G.time += STEP;
    if (G.NOI_SUY !== false && G.nsChup) { try { G.nsChup(); } catch (e) { /* bỏ qua */ } } // mục 1: nhớ vị trí trước lượt tính (js/combat.js)
    if (G.scene) G.scene.update(STEP);
    G.keyP = {};
    G.downs.length = 0;
  };
  // Đợt 10 (Q5): chỉ báo nhỏ ở góc dưới trái trong lúc tải phần ảnh tải sau (js/sprite_custom.js: SC.sauChiBao). Chỉ là chữ nhỏ và một chấm nháy,
  // không che nút, không nhận chạm; tải xong thì tự mất. Bản một tệp không có gì để tải nên không bao giờ vẽ.
  let daGoiSau = false;
  function veTaiSau() {
    try {
      const SC = G.spriteCustom, b = SC && SC.sauChiBao ? SC.sauChiBao() : null;
      if (!b) return;
      const c = G.ux, ga = c.globalAlpha, x = 5, y = 266;
      c.globalAlpha = ga * 0.92;
      if (b.loi) ui.text(G.t('Mạng yếu: thiếu vài ảnh, game vẫn chơi bình thường'), x, y, { size: 7.5, color: '#e8d7b0' });
      else {
        c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(x - 1, y - 6, 5, 5);
        c.globalAlpha = ga * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(Date.now() / 220)));
        c.fillStyle = '#ffd27a'; c.fillRect(x, y - 5, 3, 3);
        c.globalAlpha = ga * 0.92;
        ui.text(G.t('Đang tải thêm ảnh… {0}%', b.pct), x + 7, y, { size: 7.5, color: '#e8d7b0' });
      }
      c.globalAlpha = ga;
    } catch (e) { /* chỉ báo hỏng thì bỏ qua, không được làm đứng game */ }
  }
  // ---------- Phiên hiệu năng (V6): bớt vẽ khi màn hình đứng yên, tuỳ chọn tiết kiệm pin ----------
  // Đang tạm dừng / mở bản đồ, túi đồ / màn kết quả trong ải, đang mở bảng ở làng, hoặc đứng yên ở làng không chạm gì 5 giây:
  // chỉ vẽ lại 10 khung/giây (cảnh gần như không đổi), vẽ đủ ngay khi có chạm / phím và trong 1,5 giây đầu sau khi đổi màn (hiệu ứng mở bảng).
  // Logic game (G.tick) vẫn chạy đủ nhịp như cũ. Tắt: G.TIET_KIEM_VE = false hoặc ?vechan=0.
  // Tiết kiệm pin: G.save.pin = true (hoặc ?fps=30) → vẽ nhiều nhất 30 khung/giây (logic vẫn 60 nhịp/giây).
  if (G.TIET_KIEM_VE === undefined) { let tat = false; try { tat = /[?&]vechan=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.TIET_KIEM_VE = !tat; }
  let fps30 = false; try { fps30 = /[?&]fps=30(&|$)/.test(location.search || ''); } catch (e) { fps30 = false; }
  let veCuoi = -1, lanCham = 0, manCu = '', doiMan = 0;
  const danhDauCham = () => { lanCham = performance.now() / 1000; };
  try { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'keydown', 'wheel']) window.addEventListener(ev, danhDauCham, { passive: true, capture: true }); } catch (e) { /* bỏ qua */ }
  const YEN_AI = { paused: 1, map: 1, bag: 1, result: 1 };
  function canhYen(now) { // trả về số khung/giây tối đa khi cảnh đứng yên, 0 = vẽ đủ
    try {
      const sc = G.scene; let man = '', fps = 0;
      if (G.lucChienUI && G.lucChienUI.dangHien && G.lucChienUI.dangHien()) return 0; // dải "Lực chiến ▲" đang chạy số (js/luc_chien.js): vẽ đủ khung
      if (G.truyen && G.truyen.dang) return 0; // đang chiếu truyện (js/truyen.js): vẽ đủ khung cho chữ, hình chuyển mượt
      if (sc && sc === G.StageScene && G.getRun) { const S = G.getRun(); if (S && YEN_AI[S.mode]) { man = 'ai:' + S.mode; fps = 10; } }
      else if (sc && sc === G.Village) {
        const V = G.villageApi && G.villageApi.V, VS = G.villageScene && G.villageScene.state;
        if (V && V.tab !== 'hub' && V.tab !== 'title') { man = 'lang:' + V.tab; fps = 10; }
        else if (V && V.tab === 'hub' && VS && !VS.moving && !VS.path && !VS.joy && !VS.talk && now - lanCham > 5) { man = 'lang:yen'; fps = 10; }
      }
      if (man !== manCu) { manCu = man; doiMan = now; }
      return fps && now - doiMan > 1.5 ? fps : 0;
    } catch (e) { return 0; }
  }
  function nenVe(now) {
    if (veCuoi < 0 || G.click || G.downs.length || G.pointers.size || now - lanCham < 0.4) return true;
    let fps = G.TIET_KIEM_VE ? canhYen(now) : 0;
    if ((fps30 || (G.save && G.save.pin)) && (!fps || fps > 30)) fps = 30;
    return !fps || now - veCuoi >= 1 / fps - 0.004;
  }
  G.veYen = { canhYen: (t) => canhYen(t == null ? performance.now() / 1000 : t) }; // cho kiểm thử
  function frame(ts) {
    requestAnimationFrame(frame); // đặt trước để một lỗi lẻ không làm đứng game
    const now = ts / 1000;
    acc += Math.min(0.1, Math.max(0, now - last || 0));
    last = now;
    let n = 0;
    while (acc >= STEP && n < 5) { G.tickDraw = n === 0; G.tick(); acc -= STEP; n++; }
    if (acc > STEP) acc = 0; // khung hình quá chậm: bỏ phần dư, không chạy bù dồn
    if (G.scene && !G.noRender && !nenVe(performance.now() / 1000)) { G.click = null; return; } // V6: khung này không vẽ lại (hình cũ vẫn trên màn)
    veCuoi = performance.now() / 1000;
    if (G.scene && !G.noRender) {
      if (G.NET !== G.netMuon()) G.setNet(G.netMuon());
      const bayGio = veCuoi;
      chuyenDauKhung(bayGio); // mục 15: vừa đổi màn → chụp màn cũ trước khi màn mới vẽ đè
      bangDauKhung(bayGio); // mục 15: bảng vừa mở / đóng
      if (dangChuyenRa(bayGio)) { G.click = null; G.syncTaps = []; } // đang hiện ảnh màn cũ: chạm chưa nhắm được gì của màn mới
      ui.begin();
      G.nsAlpha = G.NOI_SUY !== false ? G.clamp(acc / STEP, 0, 1) : 1;
      const ns = G.NOI_SUY !== false && G.nsVao ? G.nsVao(G.nsAlpha) : false; // mục 1: vẽ ở vị trí trung gian giữa hai lượt tính
      const bl = UB.khoa.indexOf('lang:') === 0 && G.uiBang.vao(); // mục 15: bảng ở làng đang mở → phóng cả lớp #ui
      try { G.scene.draw(); } finally { if (bl) G.uiBang.ra(); if (ns) G.nsRa(); }
      if (G.theme && G.theme.endFrame) G.theme.endFrame(); // tên biểu tượng tài nguyên khi chạm vào
      bangCuoiKhung(bayGio);
      chuyenCuoiKhung(bayGio);
      if (dangChuyenRa(bayGio)) G.syncTaps = [];
      if (!daVe) { // Đợt 1: khung hình đầu đã vẽ xong → gỡ màn hình tải (index.html). Mục 15: mờ dần 0,3 giây rồi mới gỡ (?uimuot=0: gỡ ngay)
        daVe = true;
        try {
          const el = document.getElementById('lk-tai');
          if (el && G.UI_MUOT !== false && el.style) { el.style.transition = 'opacity 0.3s ease-out'; el.style.opacity = '0'; setTimeout(() => { try { el.remove(); } catch (e) { /* bỏ qua */ } }, 320); }
          else if (el) el.remove();
        } catch (e) { /* bỏ qua */ }
      }
      if (!daGoiSau) { daGoiSau = true; try { if (G.spriteCustom && G.spriteCustom.napSau) G.spriteCustom.napSau(); } catch (e) { /* bỏ qua */ } } // Đợt 10: màn chào đã vẽ → mới bắt đầu tải phần ảnh tải sau (bản 2 tệp)
      veTaiSau();
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
