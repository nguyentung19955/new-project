// Hiệu ứng đạn: hình riêng cho từng loại đạn (xoay theo hướng bay), vệt bay, ánh sáng quanh đạn hệ, chớp lúc bắn,
// toé hạt và vòng sóng lúc trúng, cắm vào tường hoặc vỡ tan khi đụng tường.
// Chỉ đọc trạng thái game (W.projs), không đổi tốc độ, vùng trúng hay sát thương. Chạy không vẽ thì không làm gì.
// Đạn của quái: viền tối và quầng đỏ. Đạn của mình (mũi tên): quầng sáng trắng, lông đuôi màu bậc vũ khí.
(function () {
  const G = window.G, fx = G.fx, A = G.art;
  if (!fx || !fx.kit || !A) return;
  const K = fx.kit, TAU = Math.PI * 2;
  const { emit, add, addRing, trauma, RAMP, rr, R, fail } = K;

  // ---------- canvas nhỏ vẽ sẵn ----------
  const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  const cache = new Map();
  function cached(key, fn) { let v = cache.get(key); if (!v) { if (cache.size > 900) cache.clear(); v = fn(); cache.set(key, v); } return v; }
  function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  const RG = new Map();
  const ra = (hex, a) => { const k = hex + a; let v = RG.get(k); if (!v) { v = rgba(hex, a); RG.set(k, v); } return v; };

  // Quầng sáng: ba vòng chấm mờ dần (kiểu điểm ảnh, không mờ nhoè)
  function glow(col, r) {
    return cached('g|' + col + '|' + r, () => {
      const s = r * 2 + 1, cv = mk(s, s), g = cv.getContext('2d');
      for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
        const d = Math.hypot(x - r, y - r) / r;
        if (d > 1) continue;
        const a = d < 0.45 ? 0.32 : d < 0.75 ? 0.18 : ((x + y) & 1) ? 0.1 : 0;
        if (!a) continue;
        g.fillStyle = rgba(col, a); g.fillRect(x, y, 1, 1);
      }
      return cv;
    });
  }

  // Hình đạn nhìn về bên phải, tâm ở giữa ô 17x17. f: khung hoạt hình (0, 1). Mỗi hình trả về các điểm ảnh [x, y, màu].
  const SZ = 17, C0 = 8;
  const DK = '#1a0a0c'; // viền tối của đạn quái
  const LOOK = {
    // bọt nước của quái biển: tròn, trong, vành sáng
    bubble(px, f) {
      const r = f ? 4 : 3.6;
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
        const d = Math.hypot(x, y * (f ? 0.92 : 1.06));
        if (d <= r + 1 && d > r) px(x, y, DK);
        else if (d <= r && d > r - 1.2) px(x, y, '#9fe6ff');
        else if (d <= r - 1.2) px(x, y, (x + y) & 1 ? '#3f86b8' : '#5aa6d6');
      }
      px(-1, -2, '#ffffff'); px(-2, -1, '#ffffff'); px(0, -2, '#e9f9ff'); px(1, 2, '#bfeaff');
    },
    // gai băng: tinh thể dài nhọn, đầu trắng
    icespike(px, f) {
      for (let x = -6; x <= 5; x++) { const h = x > 2 ? 0 : x > -3 ? 1 : 0; for (let y = -h - 1; y <= h + 1; y++) px(x, y, DK); }
      px(6, 0, DK);
      for (let x = -5; x <= 4; x++) { const h = x > 2 ? 0 : x > -3 ? 1 : 0; for (let y = -h; y <= h; y++) px(x, y, y < 0 ? '#e9f9ff' : x > 1 ? '#ffffff' : '#7fd4ff'); }
      px(5, 0, '#ffffff'); px(-6 - f, -2, '#bfeaff'); px(-6 - f, 2, '#bfeaff');
    },
    // bào tử của quái rừng: cục lông tơ nâu tím, chấm sáng
    spore(px, f) {
      const pts = [[0, 0, 3.2]];
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
        const d = Math.hypot(x, y), w = 3.2 + (((x * 7 + y * 3 + f) & 3) === 0 ? 1 : 0);
        if (d <= w + 1 && d > w) px(x, y, DK);
        else if (d <= w) px(x, y, d < 1.6 ? '#e2c6ff' : (x + y + f) & 1 ? '#9a6fc6' : '#7a4fa6');
      }
      px(-1, -1, '#ffffff'); px(4 + f, -4, '#c9a8ef'); px(-4, 4 - f, '#c9a8ef');
      void pts;
    },
    // hạt độc: hạt nhọn xanh, giọt tím nhỏ đằng sau
    toxseed(px, f) {
      for (let x = -4; x <= 5; x++) { const h = x >= 4 ? 0 : x >= 2 ? 1 : x >= -2 ? 2 : 1; for (let y = -h - 1; y <= h + 1; y++) px(x, y, DK); }
      px(6, 0, DK);
      for (let x = -3; x <= 5; x++) { const h = x >= 4 ? 0 : x >= 2 ? 1 : x >= -2 ? 2 : 1; for (let y = -h; y <= h; y++) px(x, y, y < 0 ? '#c4f43c' : '#6fcf3a'); }
      px(0, -1, '#f0ffd0'); px(1, -1, '#e6ffc0');
      px(-6, f ? 1 : 0, '#9a5fd6'); px(-7, f ? 2 : 1, '#58208c');
    },
    // quả nổ: quả tròn đỏ cam, cuống xanh, ngòi đang cháy
    fruit(px, f) {
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
        const d = Math.hypot(x, y);
        if (d <= 4.4 && d > 3.4) px(x, y, DK);
        else if (d <= 3.4) px(x, y, y < -1 ? '#ffb347' : x + y > 2 ? '#a8320a' : '#e0552a');
      }
      px(-1, -2, '#fff3b0'); px(-2, -1, '#ffffff');
      px(0, -5, '#3f7a32'); px(1, -6, '#3f7a32'); px(2, -6, f ? '#ffd23f' : '#ff5a2a'); px(3, -7 + f, '#fff3b0');
    },
    // tàn lửa (lâu đài): cục lửa có đuôi kéo về sau
    ember(px, f) {
      for (let y = -4; y <= 4; y++) for (let x = -8; x <= 4; x++) {
        const w = x >= 0 ? Math.sqrt(Math.max(0, 16 - x * x)) : 4 + x * 0.45 + ((x + f) & 1 ? 0.6 : -0.3);
        const ay = Math.abs(y);
        if (ay > w + 0.5) continue;
        const e = ay > w - 0.6;
        px(x, y, e ? '#7a1e0a' : ay < w * 0.35 && x > -3 ? '#fff3b0' : ay < w * 0.7 ? '#ffd23f' : '#ff7a2a');
      }
      px(1, -1, '#ffffff');
    },
    // bùa: lá giấy vàng, chữ đỏ, viền tối, đuôi tua đỏ
    bua(px, f) {
      for (let y = -4; y <= 4; y++) for (let x = -3; x <= 3; x++) px(x, y + (f && x < 0 ? 1 : 0), Math.abs(x) === 3 || Math.abs(y) === 4 ? DK : '#f4e070');
      px(0, -2, '#c8372d'); px(-1, -1, '#c8372d'); px(0, -1, '#c8372d'); px(1, -1, '#c8372d'); px(0, 0, '#c8372d'); px(-1, 1, '#c8372d'); px(1, 2, '#c8372d');
      px(-4, 0, '#c8372d'); px(-5, f ? 1 : -1, '#c8372d'); px(-6, f ? 2 : -1, '#ff6a5a');
    },
    // đạn pháo (lâu đài): bi sắt đen, ánh đỏ, tia lửa ngòi
    cannon(px, f) {
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
        const d = Math.hypot(x, y);
        if (d <= 4.4 && d > 3.5) px(x, y, '#0a0608');
        else if (d <= 3.5) px(x, y, x + y < -2 ? '#7a7480' : x + y > 2 ? '#2a2630' : '#4a4652');
      }
      px(-1, -2, '#d6d0dc'); px(-2, -1, '#ffffff');
      px(-5, 0, f ? '#ffd23f' : '#ff7a2a'); px(-6, f ? -1 : 1, '#ff5a2a');
    },
    // quả cầu chung (màu theo quái)
    orb(px, f, col, col2) {
      for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
        const d = Math.hypot(x, y);
        if (d <= 3.9 && d > 2.9) px(x, y, DK);
        else if (d <= 2.9) px(x, y, d < 1.4 ? (col2 || '#ffffff') : col);
      }
      px(-1, -1, '#ffffff'); px(-4 - f, 0, col2 || col);
    },
    // gai thường (không hệ)
    thorn(px, f, col) {
      for (let x = -5; x <= 4; x++) { px(x, -1, DK); px(x, 1, DK); px(x, 0, x > 1 ? '#ffffff' : x > -2 ? col : '#5a3a2a'); }
      px(5, 0, DK); px(-6, 0, DK); px(-5 + f, f ? -2 : 2, col);
    },
  };

  // Vẽ hình đạn đã xoay (16 hướng) vào canvas đệm, lấy mẫu điểm gần nhất nên vẫn nét điểm ảnh.
  function sprite(look, f, ang, col, col2, big) {
    const nb = 16, b = ((Math.round((ang / TAU) * nb) % nb) + nb) % nb;
    const key = look + '|' + f + '|' + b + '|' + (col || '') + '|' + (col2 || '') + '|' + (big ? 1 : 0);
    return cached(key, () => {
      const sc = big ? 2 : 1, n = SZ * sc, src = new Map();
      LOOK[look]((x, y, cc) => { src.set((x | 0) + ',' + (y | 0), cc); }, f, col, col2);
      const cv = mk(n, n), g = cv.getContext('2d'), a = (b / nb) * TAU, ca = Math.cos(a), sa = Math.sin(a), h = n >> 1;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        // điểm (x, y) của hình đã xoay lấy màu từ điểm quay ngược về hình gốc
        const dx = (x - h) / sc, dy = (y - h) / sc;
        const sx = Math.round(dx * ca + dy * sa), sy = Math.round(-dx * sa + dy * ca);
        const cc = src.get(sx + ',' + sy);
        if (cc) { g.fillStyle = cc; g.fillRect(x, y, 1, 1); }
      }
      return cv;
    });
  }

  // ---------- chọn hình cho từng viên đạn (theo loại, hệ và vùng) ----------
  function lookOf(o) {
    if (o.dLook) return o.dLook;
    const W = G.getWorld(), reg = W && G.REGIONS[W.region], rel = reg ? reg.el : null;
    let L = 'orb';
    if (o.kind === 'fire') L = 'ember';
    else if (o.kind === 'bua') L = 'bua';
    else if (o.kind === 'fruit') L = rel === 'fire' ? 'cannon' : 'fruit';
    else if (o.kind === 'spike') L = o.el === 'ice' || (!o.el && rel === 'ice') ? 'icespike' : o.el === 'poison' ? 'toxseed' : 'thorn';
    else if (o.kind === 'orb') {
      if (o.el === 'poison') L = 'toxseed';
      else if (o.el === 'fire') L = 'ember';
      else if (o.el === 'ice') L = 'bubble';
      else L = rel === 'ice' ? 'bubble' : rel === 'poison' ? 'spore' : rel === 'fire' ? 'cannon' : 'orb';
    }
    o.dLook = L;
    o.dBig = !!(o.src && o.src.isBoss && o.src.kind !== 'mini');
    return L;
  }
  // màu hệ của viên đạn (để vẽ quầng và hạt)
  const LOOK_EL = { bubble: 'ice', icespike: 'ice', toxseed: 'poison', spore: 'poison', ember: 'fire', cannon: 'fire', fruit: 'fire', bua: 'poison' };
  const EL_GLOW = { fire: '#ff9a3a', poison: '#8fe04a', ice: '#9fe0ff' };
  const elOf = (o) => (o.team === 'player' ? (o.he ? o.he.el : null) : o.el || LOOK_EL[o.dLook] || null);

  // ---------- vẽ: trước hình viên đạn (quầng sáng, vệt bay) ----------
  function trail(c, x, y, ux, uy, L, cols, w) {
    // vệt mờ dần: đầu đậm, đuôi thưa (bỏ bớt điểm ở đuôi)
    const n = Math.round(L);
    for (let i = 2; i < n; i++) {
      const u = i / n;
      if (u > 0.6 && (i & 1)) continue;
      c.fillStyle = cols[u < 0.3 ? 0 : u < 0.6 ? 1 : 2];
      const px = Math.round(x - ux * i), py = Math.round(y - uy * i);
      if (w > 1 && u < 0.5) c.fillRect(px - 1, py - 1, 2, 2); else c.fillRect(px, py, 1, 1);
    }
  }
  const proj0 = fx.proj;
  fx.proj = function (c, o) {
    if (G.noRender) return;
    try {
      const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
      const sp = Math.hypot(o.vx, o.vy) || 1, ux = o.vx / sp, uy = o.vy / sp;
      if (o.team === 'player') {
        // quầng sáng trắng (mình) hoặc màu hệ quanh mũi tên, rồi vệt bay và hình hệ cũ
        const el = elOf(o), gc = el ? EL_GLOW[el] : '#ffffff', r = o.big ? 9 : el ? 6 : 4;
        const gl = glow(gc, r);
        c.drawImage(gl, x - r + Math.round(ux * 2), y - r + Math.round(uy * 2));
        proj0(c, o);
        return;
      }
      lookOf(o);
      const el = elOf(o), big = o.dBig, rr0 = big ? 10 : 7;
      // quầng đỏ sẫm: đạn quái luôn có vầng đỏ, đạn hệ thêm vầng màu hệ nhỏ bên trong
      c.drawImage(glow('#ff2a1a', rr0 + 2), x - rr0 - 2, y - rr0 - 2);
      if (el) { const g2 = glow(EL_GLOW[el], rr0 - 2); c.drawImage(g2, x - rr0 + 2, y - rr0 + 2); }
      // vệt bay dài theo tốc độ
      const L = Math.max(5, Math.min(22, sp * 0.09)) * (big ? 1.4 : 1);
      const base = el ? EL_GLOW[el] : o.col || '#ffb09a';
      trail(c, x, y, ux, uy, L, [ra(base, 0.7), ra(base, 0.42), ra('#ff3a22', 0.3)], big ? 2 : 1);
    } catch (e) { fail(e); }
  };

  // ---------- vẽ: hình viên đạn ----------
  const art0 = A.proj;
  // Ảnh AI (js/fx_anh.js): mũi tên của em bé (hu-dan-ten), viên bào tử (hu-dan-bao-tu). Không có tệp thì vẽ như cũ.
  const FA = () => G.fxAnh;
  A.proj = function (c, o) {
    if (o.team === 'player' && o.kind === 'arrow' && !G.noRender && FA() && FA().co('hu-dan-ten')) {
      FA().ve(c, 'hu-dan-ten', o.x, o.y - (o.z || 10), o.fxT || 0, Math.atan2(o.vy, o.vx), o.big ? 1.5 : 1);
      return;
    }
    if (o.team === 'player') {
      art0(c, o);
      if (G.noRender || o.kind !== 'arrow') return;
      try {
        // lông đuôi mang màu bậc vũ khí, mũi tên sáng viền trắng
        const rar = o.w ? G.wRar(o.w) : 0, rc = G.RARITY[rar].col;
        const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10)), sp = Math.hypot(o.vx, o.vy) || 1, ux = o.vx / sp, uy = o.vy / sp;
        c.fillStyle = rar ? rc : '#c8372d';
        for (const q of [[-6, -1], [-6, 1], [-5, -1], [-5, 1], [-7, -2], [-7, 2]]) c.fillRect(Math.floor(x + ux * (q[0] + 0.5) - uy * (q[1] + 0.5)), Math.floor(y + uy * (q[0] + 0.5) + ux * (q[1] + 0.5)), 1, 1);
        c.fillStyle = '#ffffff';
        c.fillRect(Math.floor(x + ux * 5.5), Math.floor(y + uy * 5.5), 1, 1);
      } catch (e) { fail(e); }
      return;
    }
    if (G.noRender) return art0(c, o);
    try {
      const L = lookOf(o), f = Math.floor(G.time * 10 + (o.x + o.y) * 0.01) & 1;
      const ang = L === 'bubble' || L === 'fruit' || L === 'cannon' || L === 'bua' ? 0 : Math.atan2(o.vy, o.vx);
      const col = o.col || (o.el ? G.EL[o.el].col : '#ffb09a');
      const sv = sprite(L, f, L === 'bua' || L === 'cannon' || L === 'fruit' ? ang + (o.vx < 0 ? Math.PI : 0) : ang, L === 'orb' || L === 'thorn' ? col : '', L === 'orb' ? o.col2 || '' : '', o.dBig);
      const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10)), h = sv.width >> 1;
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x - 3, Math.round(o.y), 6, 1);
      const baoTu = (L === 'spore' || (o.src && o.src.art === 'hoaBaoTu')) && FA() && FA().co('hu-dan-bao-tu');
      if (baoTu) FA().ve(c, 'hu-dan-bao-tu', x, y, o.fxT || G.time, Math.atan2(o.vy, o.vx), o.dBig ? 1.6 : 1);
      else c.drawImage(sv, x - h, y - h);
      // chấm đỏ nhấp nháy trên đầu đạn quái: nhìn là biết phải né
      if (((G.time * 8) | 0) % 2) { c.fillStyle = '#ff3a22'; c.fillRect(x - 1, y - h + (o.dBig ? 4 : 2), 2, 1); }
    } catch (e) { fail(e); art0(c, o); }
  };

  // ---------- mỗi khung: chớp lúc bắn, hạt rơi theo đường bay, trúng, đụng tường ----------
  let seenW = null, live = new Set();
  const HIT_RAMP = { fire: RAMP.fire, poison: RAMP.poison, ice: RAMP.ice };
  // Hệ số số hạt G.VFX.hat (js/vfx_cfg.js)
  const hatN = (n) => { const v = G.VFX && G.VFX.hat; return Math.round(n * (v == null ? 1 : v)); };
  // Nổ ngắn đúng chỗ va chạm. ux, uy: hướng bay của viên đạn (nếu có): vài tia sáng văng tiếp theo hướng đó.
  function impact(x, y, el, big, col, team, ux, uy) {
    const rp = el ? HIT_RAMP[el] : team === 'player' ? RAMP.steel : RAMP.hurt;
    addRing(x, y, 2, big ? 16 : 10, big ? 0.24 : 0.18, el ? EL_GLOW[el] : col || '#ffffff', big ? 2 : 1, 1);
    add({ ty: 'flash', x, y, r: big ? 7 : 4, t: 0.09, c: '#ffffff', c2: el ? EL_GLOW[el] : col || '#ffd9c8', ly: 1 });
    if (ux != null) {
      const m = hatN(big ? 4 : 2);
      for (let i = 0; i < m; i++) { const a = Math.atan2(uy, ux) + rr(-0.5, 0.5), v = rr(110, 190); K.streak(x, y, Math.cos(a) * v, Math.sin(a) * v, rr(0.08, 0.14), el ? HIT_RAMP[el] : RAMP.white, 1, rr(4, 7), 0, 4); }
    }
    const n = hatN(big ? 10 : 6);
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, v = rr(30, big ? 120 : 80);
      if (el === 'fire') emit(9, x, y, Math.cos(a) * v * 0.6, Math.sin(a) * v * 0.6 - 20, rr(0.2, 0.35), rp, 3, -20, 0, null, 1);
      else if (el === 'poison') emit(5, x, y, Math.cos(a) * v * 0.7, Math.sin(a) * v * 0.5 - 30, rr(0.35, 0.55), rp, 1, 260, 0, y + 10 + rr(-2, 3), 1);
      else if (el === 'ice') emit(4, x, y, Math.cos(a) * v, Math.sin(a) * v, rr(0.25, 0.4), rp, R() < 0.4 ? 2 : 1, 120, 1.5, null, 1);
      else emit(1, x, y, Math.cos(a) * v, Math.sin(a) * v, rr(0.15, 0.28), rp, 2, 0, 2, null, 1);
    }
  }
  // tên cắm vào tường rồi mờ dần
  function drawStuck(c, s) {
    const k = s.t / s.t0;
    if (k < 0.35 && ((K.S().t * 20) | 0) % 2) return;
    const x = Math.round(s.x), y = Math.round(s.y), ux = s.ux, uy = s.uy;
    const dot = (a, b, col) => { c.fillStyle = col; c.fillRect(Math.floor(x + ux * a - uy * b), Math.floor(y + uy * a + ux * b), 1, 1); };
    for (let i = -9; i <= -1; i++) dot(i + 0.5, 0.5, i < -7 ? s.rc : '#e8e2d0');
    dot(-8.5, -0.5, s.rc); dot(-8.5, 1.5, s.rc);
    dot(-0.5, -0.5, 'rgba(0,0,0,0.5)'); dot(0.5, 0.5, 'rgba(0,0,0,0.5)');
  }
  function wallHit(o, W) {
    const g = W.geo, x = G.clamp(o.x, g.fx0 - 1, g.fx1 + 1), py = o.y - (o.z || 10);
    const y = o.y < g.fy0 - 20 ? Math.max(py, g.fy0 - 36) : py;
    const el = elOf(o), sp = Math.hypot(o.vx, o.vy) || 1;
    if (o.team === 'player' && o.kind === 'arrow') {
      add({ ty: 'he', x, y, t: 0.9, ly: 1, draw: drawStuck, ux: o.vx / sp, uy: o.vy / sp, rc: o.w && G.wRar(o.w) ? G.RARITY[G.wRar(o.w)].col : '#c8372d' });
      for (let i = 0; i < 4; i++) emit(2, x + rr(-2, 2), y + rr(-2, 2), -o.vx * 0.05 + rr(-10, 10), rr(-20, -5), rr(0.25, 0.4), RAMP.dust || RAMP.smoke, 2, 0, 1, null, 1);
      if (el) impact(x, y, el, o.big, null, 'player');
      return;
    }
    // đạn quái vỡ tan: mảnh văng ngược lại, rơi xuống
    const rp = el ? HIT_RAMP[el] : RAMP.rock;
    for (let i = 0; i < 7; i++) emit(8, x, y, -o.vx * rr(0.1, 0.4) + rr(-30, 30), rr(-80, -20), rr(0.3, 0.5), rp, 2, 380, 0, o.y + rr(-1, 4), 1);
    impact(x, y, el, o.dBig, o.col, 'enemy');
  }
  function step(W, dt, tick) {
    if (seenW !== W) { seenW = W; live = new Set(); }
    const P = W.P, now = new Set();
    for (const o of W.projs) {
      now.add(o);
      const py = o.y - (o.z || 10), el = elOf(o);
      if (!live.has(o)) {
        // vừa bắn: chớp nhỏ ở dây cung hoặc đầu nòng
        o.dSeen = o.seen ? o.seen.length : 0;
        if (o.team === 'player') {
          const sp = Math.hypot(o.vx, o.vy) || 1;
          add({ ty: 'flash', x: o.x - (o.vx / sp) * 3, y: py, r: o.big ? 6 : 3, t: 0.07, c: '#ffffff', c2: el ? EL_GLOW[el] : '#fff3d0', ly: 1 });
          for (let i = 0; i < 2; i++) emit(1, o.x, py, (o.vx / sp) * rr(30, 70) + rr(-15, 15), rr(-25, 15), 0.14, el ? HIT_RAMP[el] : RAMP.steel, 2, 0, 3, null, 1);
        } else {
          lookOf(o);
          for (let i = 0; i < 3; i++) emit(1, o.x, py, o.vx * 0.3 + rr(-20, 20), o.vy * 0.3 + rr(-20, 20), 0.16, el ? HIT_RAMP[el] : RAMP.hurt, 2, 0, 3, null, 1);
        }
      }
      // tên xuyên qua quái: mỗi con trúng một lần toé hạt và vòng sóng tại chỗ
      if (o.seen && o.seen.length > (o.dSeen || 0)) {
        const sp = Math.hypot(o.vx, o.vy) || 1;
        for (let i = o.dSeen || 0; i < o.seen.length; i++) impact(o.x, py, el, o.big, '#ffffff', 'player', o.vx / sp, o.vy / sp);
        o.dSeen = o.seen.length;
        o.dHit = true;
      } else o.dHit = false;
      // hạt rơi theo đường bay (đạn hệ và đạn quái)
      if (tick && o.team === 'enemy') {
        const L = o.dLook;
        if (L === 'bubble' && R() < 0.4) emit(11, o.x + rr(-2, 2), py + rr(-2, 2), rr(-4, 4), rr(-14, -6), rr(0.3, 0.5), RAMP.ice, 1, 0, 0, null, 1);
        else if (L === 'spore' && R() < 0.5) emit(2, o.x, py, -o.vx * 0.05 + rr(-6, 6), rr(-6, 6), rr(0.35, 0.6), ['#e2c6ff', '#b98af0', '#9a6fc6', 'rgba(122,79,166,0.5)'], 2, 0, 1, null, 1);
        else if (L === 'toxseed' && R() < 0.35) emit(5, o.x, py + 1, -o.vx * 0.04, rr(0, 15), rr(0.35, 0.55), RAMP.poison, 1, 260, 0, o.y + rr(-1, 3), 1);
        else if (L === 'icespike' && R() < 0.3) emit(6, o.x + rr(-2, 2), py + rr(-2, 2), 0, 0, rr(0.2, 0.3), RAMP.ice, 1, 0, 0, null, 1);
        else if ((L === 'cannon' || L === 'fruit') && R() < 0.4) emit(2, o.x - Math.sign(o.vx) * 4, py - 3, rr(-6, 6), rr(-16, -6), rr(0.3, 0.5), RAMP.smoke, 2, 0, 0.6, null, 1);
        else if (L === 'bua' && R() < 0.3) emit(0, o.x + rr(-3, 3), py + rr(-3, 3), rr(-8, 8), rr(-10, 10), rr(0.3, 0.5), ['#fff3b0', '#f4e070', '#c8372d'], 1, 0, 0, null, 1);
      }
    }
    // viên nào vừa biến mất: trúng người, đụng tường hay hết tầm
    for (const o of live) {
      if (now.has(o)) continue;
      const g = W.geo, py = o.y - (o.z || 10), el = elOf(o);
      const out = g && (o.x <= g.fx0 + 1 || o.x >= g.fx1 - 1 || o.y < g.fy0 - 20 || o.y > g.fy1 + 6);
      if (o.team === 'player') {
        if (o.dHit) continue; // đã toé hạt lúc trúng
        if (out) wallHit(o, W);
        else { addRing(o.x, py, 1, 6, 0.15, el ? EL_GLOW[el] : '#e8e2d0', 1, 1); emit(1, o.x, py, o.vx * 0.05, 10, 0.2, el ? HIT_RAMP[el] : RAMP.steel, 2, 0, 0, null, 1); }
      } else {
        const hitP = P && !P.dead && Math.abs(P.x - o.x) < 10 && Math.abs(P.y - o.y) < 11;
        if (hitP) { const sp = Math.hypot(o.vx, o.vy) || 1; impact(o.x, py, el, o.dBig, o.col, 'enemy', o.vx / sp, o.vy / sp); if (o.dBig) trauma(0.18); }
        else if (out) wallHit(o, W);
        else { addRing(o.x, py, 1, o.dBig ? 9 : 6, 0.16, el ? EL_GLOW[el] : '#ffb09a', 1, 1); for (let i = 0; i < 3; i++) emit(1, o.x, py, rr(-30, 30), rr(-30, 10), 0.18, el ? HIT_RAMP[el] : RAMP.hurt, 2, 0, 2, null, 1); }
      }
    }
    live = now;
  }
  const he0 = fx.heStep;
  fx.heStep = function (W, dt, tick) {
    if (he0) he0(W, dt, tick);
    if (G.noRender) return;
    try { step(W, dt, tick); } catch (e) { fail(e); }
  };
  fx.danLook = lookOf; // cho bài kiểm tra
})();
