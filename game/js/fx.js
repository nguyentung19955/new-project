// Hiệu ứng hình ảnh: vệt chém, tia lửa, số sát thương, rung màn hình, trạng thái, vũng, cái chết của quái.
// Chỉ đọc trạng thái game, không ghi trường nào của luật chơi. Dùng bộ sinh số ngẫu nhiên riêng.
(function () {
  const G = window.G;
  const fx = (G.fx = {});
  fx.errs = 0;
  const MAXP = 400, MAXE = 72, MAXN = 28;
  const TAU = Math.PI * 2;

  // ---------- số ngẫu nhiên riêng cho hình ảnh ----------
  let seed = 0x2f6e2b1;
  function R() {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return ((seed >>> 0) % 1000003) / 1000003;
  }
  const rr = (a, b) => a + R() * (b - a);
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------- bảng màu theo vòng đời hạt ----------
  const RAMP = {
    fire: ['#fff3b0', '#ffd23f', '#ffa53a', '#ff7a2a', '#d8481a', '#a8320a', '#5a2a1c'],
    ember: ['#fff3b0', '#ffd23f', '#ff7a2a', '#a8320a'],
    poison: ['#e6ffc0', '#c2f58a', '#8fe04a', '#6fcf3a', '#3f8f22', '#2f6b1a'],
    ice: ['#ffffff', '#e9f9ff', '#bfeaff', '#7fd4ff', '#4a9ad0', '#2b6ea3'],
    steel: ['#ffffff', '#f1ead9', '#d6d0c2', '#a8a69e', '#7a7a78'],
    gold: ['#ffffff', '#fff3b0', '#ffd23f', '#e2a83a', '#a8742a'],
    hurt: ['#ffffff', '#ffb0a0', '#ff6a5a', '#c8372d', '#7a1c18'],
    water: ['#ffffff', '#d8f2ff', '#9fd0e8', '#6aa8d0', '#4a80b0'],
    rock: ['#b8a890', '#8a7a66', '#6a5a4a', '#4a3e34'],
    smoke: ['rgba(214,204,188,0.9)', 'rgba(190,180,166,0.8)', 'rgba(160,152,142,0.65)', 'rgba(130,124,118,0.5)', 'rgba(110,104,100,0.32)', 'rgba(100,96,92,0.16)'],
    dark: ['rgba(90,80,74,0.85)', 'rgba(70,62,58,0.7)', 'rgba(56,50,48,0.5)', 'rgba(50,44,42,0.3)'],
    dust: ['rgba(226,212,184,0.85)', 'rgba(206,192,166,0.7)', 'rgba(186,172,150,0.5)', 'rgba(170,158,138,0.3)', 'rgba(160,150,130,0.15)'],
    vapor: ['rgba(170,235,110,0.7)', 'rgba(140,215,90,0.55)', 'rgba(111,207,58,0.4)', 'rgba(90,170,50,0.25)', 'rgba(70,140,40,0.12)'],
    mist: ['rgba(233,249,255,0.75)', 'rgba(200,236,255,0.55)', 'rgba(170,220,250,0.4)', 'rgba(150,205,240,0.25)', 'rgba(140,195,230,0.12)'],
    steam: ['rgba(255,255,255,0.9)', 'rgba(240,248,255,0.75)', 'rgba(225,238,248,0.55)', 'rgba(215,228,240,0.35)', 'rgba(205,220,235,0.18)'],
    heal: ['#ffffff', '#e6ffc0', '#a8f078', '#6fcf3a'],
    red: ['#ffffff', '#ffb09a', '#ff4a30', '#a81c10'],
    white: ['#ffffff', '#ffffff', '#e8e8f0', '#b8b8c8'],
  };
  // Bộ màu theo hệ: sáng, chính, tối, bảng hạt, bảng khói
  const PAL = {
    fire: { hi: '#fff3b0', c2: '#ffd23f', c: '#ff7a2a', d: '#a8320a', ramp: RAMP.fire, puff: RAMP.smoke, a: 'rgba(255,122,42,' },
    poison: { hi: '#e6ffc0', c2: '#c2f58a', c: '#6fcf3a', d: '#2f6b1a', ramp: RAMP.poison, puff: RAMP.vapor, a: 'rgba(111,207,58,' },
    ice: { hi: '#ffffff', c2: '#e9f9ff', c: '#7fd4ff', d: '#2b6ea3', ramp: RAMP.ice, puff: RAMP.mist, a: 'rgba(127,212,255,' },
    none: { hi: '#ffffff', c2: '#ffffff', c: '#e4e0d4', d: '#8a93a0', ramp: RAMP.steel, puff: RAMP.dust, a: 'rgba(241,234,217,' },
    foe: { hi: '#ffffff', c2: '#ffd0c0', c: '#ff5a40', d: '#8a1c12', ramp: RAMP.red, puff: RAMP.dust, a: 'rgba(255,90,64,' },
    gold: { hi: '#ffffff', c2: '#fff3b0', c: '#ffd23f', d: '#a8742a', ramp: RAMP.gold, puff: RAMP.dust, a: 'rgba(255,210,63,' },
  };
  const pal = (el) => PAL[el] || PAL.none;
  fx.pal = pal;
  // Đoán bảng màu từ một mã màu bất kỳ (để G.burst cũ vẫn dùng được).
  const RAMP_OF = new Map();
  function rampOf(col) {
    if (Array.isArray(col)) return col;
    let r = RAMP_OF.get(col);
    if (r) return r;
    const n = parseInt(String(col).slice(1), 16);
    if (!isFinite(n)) r = RAMP.steel;
    else {
      const cr = n >> 16, cg = (n >> 8) & 255, cb = n & 255;
      const mx = (k) => '#' + [cr, cg, cb].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)).toString(16).padStart(2, '0')).join('');
      r = ['#ffffff', mx(0.5), col, col, mx(-0.3), mx(-0.55)];
    }
    RAMP_OF.set(col, r);
    return r;
  }

  // ---------- trạng thái theo từng phòng ----------
  let S = null;
  const PT = [];
  for (let i = 0; i < MAXP; i++) PT.push({ k: 0, x: 0, y: 0, vx: 0, vy: 0, g: 0, dr: 0, t: 0, t0: 1, c: RAMP.steel, s: 1, fy: 1e9, ly: 1, a: 0, b: 0 });
  function fresh(W) {
    return {
      W, t: 0, np: 0, ovr: 0, E: [], N: [], dying: [], ghosts: [],
      trauma: 0, kx: 0, ky: 0, sx: 0, sy: 0, shakeSeen: 0,
      stop: 0, stopGap: 0, latch: {}, hurt: 0, flash: 0, flashCol: '255,255,255', lowT: 0,
      stepT: 0, auraT: 0, emT: 0, ghostT: 0, cleared: !!W.cleared, clearT: 0, hp: W.P ? W.P.hp : 0,
      gong: 0, dash: 0, dodge: 0,
    };
  }
  function sync() {
    const W = G.getWorld && G.getWorld();
    if (!W) { S = null; return null; }
    if (!S || S.W !== W) S = fresh(W);
    return S;
  }
  fx.reset = function () { S = null; };
  function fail(e) {
    fx.errs++;
    fx.lastErr = String((e && e.stack) || e);
    if (fx.errs <= 3 && window.console) console.warn('fx: ' + fx.lastErr);
  }
  // Mọi hàm công khai đều qua đây: bỏ qua khi chạy không vẽ, và không bao giờ ném lỗi ra ngoài.
  function api(name, f) {
    fx[name] = function (a, b, c, d, e) {
      if (G.noRender) return undefined;
      try { if (!sync()) return undefined; return f(a, b, c, d, e); } catch (err) { fail(err); return undefined; }
    };
  }
  fx.state = () => S; // cho kiểm thử
  fx.parts = () => PT;
  fx.stats = () => (S ? { parts: S.np, fx: S.E.length, nums: S.N.length, dying: S.dying.length } : null);

  // ---------- vẽ điểm ảnh ----------
  function p(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function ell(c, x, y, rx, ry, col) {
    c.fillStyle = col;
    x = Math.round(x); y = Math.round(y);
    const n = Math.floor(ry);
    for (let dy = -n; dy <= n; dy++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01))));
      if (hw > 0) c.fillRect(x - hw, y + dy, hw * 2, 1);
    }
  }
  // Vành elip dày th điểm ảnh
  function ring(c, x, y, rx, ry, th, col, dither) {
    if (rx < 1 || ry < 0.6) return;
    c.fillStyle = col;
    x = Math.round(x); y = Math.round(y);
    const n = Math.floor(ry), ix = rx - th, iy = Math.max(0.1, ry - Math.max(1, th * 0.6));
    for (let dy = -n; dy <= n; dy++) {
      if (dither && ((dy + y) & 1)) continue;
      const ho = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01))));
      const hi = Math.abs(dy) < iy && ix > 0 ? Math.round(ix * Math.sqrt(Math.max(0, 1 - (dy * dy) / (iy * iy)))) : 0;
      if (ho <= 0) continue;
      if (hi <= 0) c.fillRect(x - ho, y + dy, ho * 2, 1);
      else { c.fillRect(x - ho, y + dy, ho - hi, 1); c.fillRect(x + hi, y + dy, ho - hi, 1); }
    }
  }
  function line(c, x0, y0, x1, y1, col, t) {
    c.fillStyle = col;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), st = t > 1 ? 2 : 1;
    for (let i = 0; i <= n; i += st) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, t);
  }
  // Ngôi sao bốn cánh (tia chớp va chạm, lấp lánh)
  function star(c, x, y, r, col, core) {
    x = Math.round(x); y = Math.round(y); r = Math.round(r);
    if (r < 1) { p(c, x, y, 1, 1, col); return; }
    c.fillStyle = col;
    c.fillRect(x - r, y, r * 2 + 1, 1); c.fillRect(x, y - r, 1, r * 2 + 1);
    if (r >= 2) { const h = r >> 1; c.fillRect(x - h, y - h, h * 2 + 1, h * 2 + 1); }
    if (core) { c.fillStyle = core; c.fillRect(x - (r > 3 ? 1 : 0), y - (r > 3 ? 1 : 0), r > 3 ? 3 : 1, r > 3 ? 3 : 1); }
  }
  // Lưỡi liềm: đĩa A (tâm x,y bán kính ra,rb) trừ đĩa B lệch (ox,oy). Chỉ vẽ trong cửa sổ [lo,hi] dọc theo trục quét.
  function crescent(c, x, y, ra, rb, ox, oy, shrink, col, lo, hi, vert, dither, fw, back) {
    c.fillStyle = col;
    const n = Math.floor(rb);
    const ia = ra * shrink, ib = rb * shrink;
    for (let dy = -n; dy <= n; dy++) {
      if (dither && ((dy + (y | 0)) & 1)) continue;
      const u = (dy + rb) / (2 * rb);
      if (vert && (u < lo || u > hi)) continue;
      const ha = ra * Math.sqrt(Math.max(0, 1 - (dy * dy) / (rb * rb)));
      if (ha < 0.5) continue;
      let a0 = -ha, a1 = ha;
      const by = dy - oy;
      let b0 = 1, b1 = 0;
      if (Math.abs(by) < ib) { const hb = ia * Math.sqrt(1 - (by * by) / (ib * ib)); b0 = ox - hb; b1 = ox + hb; }
      if (fw > 0) a0 = Math.max(a0, -back); else if (fw < 0) a1 = Math.min(a1, back);
      if (a1 <= a0) continue;
      if (!vert) { a0 = Math.max(a0, -ra + lo * 2 * ra); a1 = Math.min(a1, -ra + hi * 2 * ra); if (a1 <= a0) continue; }
      if (b1 <= b0 || b1 <= a0 || b0 >= a1) span(c, x, y + dy, a0, a1);
      else { if (b0 > a0) span(c, x, y + dy, a0, b0); if (b1 < a1) span(c, x, y + dy, b1, a1); }
    }
  }
  function span(c, x, y, a, b) {
    const x0 = Math.round(x + a), w = Math.round(x + b) - x0;
    if (w > 0) c.fillRect(x0, Math.round(y), w, 1);
  }
  // Chữ số 3x5 để ghi số tầng hiệu ứng ngay trên canvas điểm ảnh
  const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001010010010', '111101111101111', '111101111001111'];
  function digit(c, x, y, n, col) {
    const d = DIG[Math.max(0, Math.min(9, n | 0))];
    p(c, x - 1, y - 1, 5, 7, '#140d0e');
    c.fillStyle = col;
    for (let i = 0; i < 15; i++) if (d[i] === '1') c.fillRect(x + (i % 3), y + ((i / 3) | 0), 1, 1);
  }

  // ---------- hạt ----------
  // Loại: 0 vuông, 1 co dần, 2 khói phồng, 3 vệt theo hướng bay, 4 mảnh xoay, 5 giọt (dính đất), 6 lấp lánh,
  // 7 mũi tên rơi, 8 mảnh vụn nảy, 9 lưỡi lửa, 10 dấu cộng hồi máu, 11 bong bóng
  function emit(k, x, y, vx, vy, t, c, s, g, dr, fy, ly) {
    let o;
    if (S.np < MAXP) o = PT[S.np++]; else { o = PT[S.ovr]; S.ovr = (S.ovr + 1) % MAXP; }
    o.k = k; o.x = x; o.y = y; o.vx = vx; o.vy = vy; o.t = t; o.t0 = t; o.c = c; o.s = s || 1;
    o.g = g || 0; o.dr = dr || 0; o.fy = fy == null ? 1e9 : fy; o.ly = ly == null ? 1 : ly; o.a = R(); o.b = 0;
    return o;
  }
  function updParts(dt) {
    for (let i = 0; i < S.np; i++) {
      const o = PT[i];
      o.t -= dt;
      if (o.t <= 0) { const l = PT[--S.np]; PT[S.np] = o; PT[i] = l; i--; continue; }
      if (o.dr) { const k = Math.max(0, 1 - o.dr * dt); o.vx *= k; o.vy *= k; }
      o.vy += o.g * dt;
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.y >= o.fy && o.vy > 0) {
        o.y = o.fy;
        if (o.k === 8 && o.b < 2) { o.b++; o.vy *= -0.4; o.vx *= 0.6; }
        else if (o.k === 7) { land(o); o.t = 0; }
        else if (o.k === 5) { o.vx = 0; o.vy = 0; o.g = 0; o.b = 1; if (o.t > 0.25) o.t = 0.25; }
        else { o.vx *= 0.5; o.vy = 0; o.g = 0; }
      }
    }
  }
  function land(o) {
    // mũi tên cắm xuống đất: để lại thân tên và chút bụi
    add({ ty: 'stuck', x: o.x, y: o.fy, t: 0.45, c: o.c, ly: 1 });
    for (let i = 0; i < 3; i++) emit(2, o.x + rr(-2, 2), o.fy, rr(-14, 14), rr(-12, -2), rr(0.18, 0.3), RAMP.dust, 2, 0, 3, null, 1);
    emit(6, o.x, o.fy - 1, 0, 0, 0.12, o.c, 2, 0, 0, null, 1);
  }
  function drawParts(c, ly) {
    for (let i = 0; i < S.np; i++) {
      const o = PT[i];
      if (o.ly !== ly) continue;
      const u = 1 - o.t / o.t0, r = o.c;
      c.fillStyle = r[Math.min(r.length - 1, (u * r.length) | 0)];
      const x = Math.round(o.x), y = Math.round(o.y);
      switch (o.k) {
        case 0: c.fillRect(x, y, o.s, o.s); break;
        case 1: { const s = Math.max(1, Math.round(o.s * (1 - u))); c.fillRect(x - (s >> 1), y - (s >> 1), s, s); break; }
        case 2: {
          const s = Math.max(2, Math.round(o.s * (1 + u * 1.2))), h = s >> 1;
          c.fillRect(x - h, y - h + 1, s, s - 2 > 0 ? s - 2 : 1); c.fillRect(x - h + 1, y - h, s - 2 > 0 ? s - 2 : 1, s);
          break;
        }
        case 3: {
          const L = o.a2 * (1 - u * 0.7), sp = Math.hypot(o.vx, o.vy) || 1, ux = -o.vx / sp, uy = -o.vy / sp;
          const n = Math.max(1, Math.round(L / o.s));
          for (let j = 0; j <= n; j++) c.fillRect(Math.round(o.x + ux * j * o.s), Math.round(o.y + uy * j * o.s), o.s, o.s);
          break;
        }
        case 4: {
          const f = ((o.a * 4 + (o.t0 - o.t) * 14) | 0) & 3, s = o.s;
          if (f === 0) c.fillRect(x - s, y, s * 2 + 1, 1); else if (f === 2) c.fillRect(x, y - s, 1, s * 2 + 1);
          else { const q = f === 1 ? 1 : -1; c.fillRect(x - 1, y - q, 1, 1); c.fillRect(x, y, 1, 1); c.fillRect(x + 1, y + q, 1, 1); if (s > 1) { c.fillRect(x - 2, y - 2 * q, 1, 1); c.fillRect(x + 2, y + 2 * q, 1, 1); } }
          break;
        }
        case 5: if (o.b) c.fillRect(x - 1, y, 3, 1); else c.fillRect(x, y - 1, o.s > 1 ? 2 : 1, 2); break;
        case 6: { const q = Math.round(o.s * Math.sin(u * Math.PI)); c.fillRect(x - q, y, q * 2 + 1, 1); c.fillRect(x, y - q, 1, q * 2 + 1); break; }
        case 7: c.fillRect(x, y - 11, 2, 11); c.fillStyle = '#ffffff'; c.fillRect(x, y - 3, 2, 3); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(x, y - 24, 1, 13); c.fillStyle = '#c8372d'; c.fillRect(x - 1, y - 13, 4, 2); break;
        case 8: c.fillRect(x - 1, y - 1, o.s, o.s); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - 1, y - 2 + o.s, o.s, 1); break;
        case 9: { const s = Math.max(1, Math.round(o.s * (1 - u * 0.8))); c.fillRect(x - (s >> 1), y - s, s, s + 1); if (s > 2) c.fillRect(x - (s >> 1) + 1, y - s - 1, s - 2, 1); break; }
        case 10: c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); break;
        case 11: {
          if (u > 0.82) { c.fillRect(x - 2, y, 1, 1); c.fillRect(x + 2, y, 1, 1); c.fillRect(x, y - 2, 1, 1); }
          else { c.fillRect(x - 1, y - 1, 2, 2); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(x - 1, y - 1, 1, 1); }
          break;
        }
        default: c.fillRect(x, y, 1, 1);
      }
    }
  }
  // Vệt bay: hạt loại 3 cần độ dài riêng
  function streak(x, y, vx, vy, t, c, s, len, g, dr, fy) { const o = emit(3, x, y, vx, vy, t, c, s, g, dr, fy, 1); o.a2 = len; return o; }
  // Toé hạt theo hình nón quanh hướng ang
  function spray(k, x, y, n, ang, spread, v0, v1, t0, t1, c, s, g, dr, fy) {
    for (let i = 0; i < n; i++) {
      const a = ang + rr(-spread, spread), v = rr(v0, v1);
      const o = emit(k, x, y, Math.cos(a) * v, Math.sin(a) * v * 0.8, rr(t0, t1), c, s, g, dr, fy, 1);
      if (k === 3) o.a2 = rr(4, 8);
    }
  }
  function puffs(x, y, n, c, sp, s, up) {
    for (let i = 0; i < n; i++) { const a = R() * TAU, v = rr(sp * 0.3, sp); emit(2, x + rr(-3, 3), y + rr(-2, 2), Math.cos(a) * v, Math.sin(a) * v * 0.5 - (up || 0), rr(0.3, 0.6), c, s || 3, 0, 2.5, null, 1); }
  }

  // ---------- hiệu ứng có hình riêng (vệt chém, vòng sóng, vết nứt...) ----------
  function add(o) {
    o.t0 = o.t; o.d = o.d || 0;
    if (S.E.length >= MAXE) S.E.shift();
    S.E.push(o);
    return o;
  }
  function addRing(x, y, r0, r1, t, col, th, ly, d) { return add({ ty: 'ring', x, y, r0, r1, t, c: col, th: th || 2, ly: ly == null ? 0 : ly, d: d || 0 }); }

  // ---------- rung màn hình và khựng hình ----------
  function trauma(a) { S.trauma = Math.min(1, Math.max(S.trauma, a * 0.75) + a * 0.3); }
  function kick(dx, dy) { S.kx = Math.max(-4, Math.min(4, S.kx + dx)); S.ky = Math.max(-3, Math.min(3, S.ky + dy)); }
  function stop(ms) {
    const s = ms / 1000;
    if (S.stop > 0) { if (s > S.stop) S.stop = s; return; }
    if (S.stopGap > 0 && ms < 100) return; // không khựng liên tục khi đánh cả đám
    S.stop = s;
  }
  api('shake', (a, dx, dy) => { trauma(a || 0.3); if (dx || dy) kick(dx || 0, dy || 0); });
  api('hitStop', (ms) => stop(ms));
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP', 'potionP'];
  // Gọi đầu mỗi lần cập nhật thế giới. Trả về true nếu đang khựng hình (thế giới đứng yên một nhịp).
  // Nút bấm trong lúc khựng được giữ lại và trả về ở khung hình kế tiếp.
  fx.frozen = function (dt, inp) {
    if (G.noRender) return false;
    try {
      if (!sync()) return false;
      if (S.stop > 0) {
        S.stop -= dt;
        if (S.stop <= 0) S.stopGap = 0.07;
        if (inp) for (const k of PRESS) if (inp[k]) S.latch[k] = true;
        step(dt, true);
        return true;
      }
      if (inp) for (const k of PRESS) if (S.latch[k]) { inp[k] = true; S.latch[k] = false; }
      return false;
    } catch (e) { fail(e); if (S) S.stop = 0; return false; }
  };
  fx.shakeOffset = function () {
    if (G.noRender || !S) return ZERO;
    OFF.x = S.sx; OFF.y = S.sy;
    return OFF;
  };
  const ZERO = { x: 0, y: 0 }, OFF = { x: 0, y: 0 };

  // ---------- số sát thương và chữ nổi (vẽ ở lớp giao diện) ----------
  const FONT = '"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  function num(x, y, s, o) {
    // dời chỗ để các số ra cùng lúc không đè lên nhau
    let lift = 0, side = 0;
    for (const q of S.N) {
      if (q.t0 - q.t < 0.3 && Math.abs(q.x0 - x) < 16 && Math.abs(q.y0 - (y - lift)) < 8) { lift += 8; side = side > 0 ? -side : -side + 5; if (lift >= 32) break; }
    }
    if (S.N.length >= MAXN) S.N.shift();
    const n = { x: x + side + rr(-3, 3), y: y - lift, x0: x, y0: y - lift, vx: o.vx == null ? rr(-9, 9) + side * 1.5 : o.vx, vy: o.vy == null ? -34 : o.vy, s, col: o.col || '#ffffff', size: o.size || 8,
      t: o.t || 0.75, t0: o.t || 0.75, pop: o.pop == null ? 0.7 : o.pop, edge: o.edge || 'rgba(12,8,8,0.9)', kind: o.kind || 0, d: o.d || 0 };
    S.N.push(n);
    return n;
  }
  // Số sát thương lên quái. o: { el, crit, m (hệ số kháng/yếu), dot }
  api('dmg', (t, d, o) => {
    o = o || {};
    const top = t.y - Math.min(60, (t.h || 24) * (t.scale || 1)) - 4;
    const s = String(Math.max(1, Math.round(d)));
    if (o.crit) num(t.x, top - 2, s + '!', { col: '#ffd23f', size: 12, pop: 1.3, t: 0.95, edge: 'rgba(90,30,0,0.95)', kind: 1 });
    else if (o.dot) { if (S.N.length < 12) num(t.x + rr(-6, 6), top + 4, s, { col: o.el ? pal(o.el).c2 : '#ffffff', size: 6.5, pop: 0.2, t: 0.55, vy: -20 }); }
    else if (o.m < 0.8) num(t.x, top, s, { col: '#9a9a9a', size: 7, pop: 0.3, t: 0.6 });
    else num(t.x, top, s, { col: o.el ? pal(o.el).c2 : '#ffffff', size: o.m > 1.25 ? 10 : 8, pop: o.m > 1.25 ? 1 : 0.7 });
  });
  api('text', (x, y, s, col, size) => { num(x, y, s, { col, size: size || 8 }); });
  // Tên đòn kết hợp: chữ to, bật ra, có hai nét gạch hai bên
  api('comboName', (x, y, s, el) => {
    num(x, y, s, { col: el === 'ice' ? '#bfeaff' : '#ffd23f', size: 13, pop: 0.8, t: 1.15, vx: 0, vy: -12, edge: el === 'ice' ? 'rgba(20,50,90,0.95)' : 'rgba(120,30,0,0.95)', kind: 2 });
  });
  const FONTS = new Map();
  function fontOf(size) {
    const k = Math.round(size * 2);
    let f = FONTS.get(k);
    if (!f) { f = '700 ' + (k / 2) + 'px ' + FONT; FONTS.set(k, f); }
    return f;
  }
  function drawNums(cam) {
    const c = G.ux;
    c.textAlign = 'center';
    c.lineJoin = 'round';
    for (const n of S.N) {
      if (n.d > 0) continue;
      const age = n.t0 - n.t;
      const sc = 1 + n.pop * Math.max(0, 1 - age / 0.13) - (age < 0.05 ? 0.25 : 0);
      const size = Math.max(6.5, n.size * sc);
      const a = n.t < n.t0 * 0.3 ? n.t / (n.t0 * 0.3) : 1;
      const x = n.x - cam, y = n.y + size * 0.35;
      c.globalAlpha = a;
      c.font = fontOf(size);
      if (n.kind) {
        // chí mạng, tên đòn kết hợp, chữ quan trọng: viền dày
        c.lineWidth = 2.2;
        c.strokeStyle = n.edge;
        c.strokeText(n.s, x, y);
      } else {
        c.fillStyle = n.edge;
        c.fillText(n.s, x + 0.7, y + 0.7);
      }
      c.fillStyle = n.kind === 1 && age < 0.07 ? '#ffffff' : n.col;
      c.fillText(n.s, x, y);
      if (n.kind === 2) {
        // nét gạch trang trí toả ra hai bên
        const w = c.measureText(n.s).width / 2 + 3, k = Math.min(1, age / 0.18), L = 12 * k;
        c.fillStyle = n.col;
        c.fillRect(x - w - L, y - size * 0.38, L, 1.4); c.fillRect(x + w, y - size * 0.38, L, 1.4);
        c.fillStyle = '#ffffff';
        c.fillRect(x - w - L - 2, y - size * 0.38 - 0.8, 2.6, 2.6); c.fillRect(x + w + L - 0.6, y - size * 0.38 - 0.8, 2.6, 2.6);
      }
    }
    c.globalAlpha = 1;
  }

  // ---------- đòn cận chiến ----------
  const stageOf = (w) => (w ? G.wStage(w) : 0);
  // Hạt theo hệ văng ra từ vệt chém (vũ khí mốc 2-3)
  function elemBits(el, x, y, n, dir, sp) {
    const P_ = pal(el);
    for (let i = 0; i < n; i++) {
      const px = x + rr(-4, 4), py = y + rr(-12, 10);
      if (el === 'fire') emit(9, px, py, dir * rr(10, sp), rr(-50, -15), rr(0.25, 0.5), RAMP.fire, 3, -40, 2, null, 1);
      else if (el === 'poison') emit(5, px, py, dir * rr(10, sp), rr(-40, 10), rr(0.35, 0.6), RAMP.poison, 2, 260, 0, y + 14 + rr(-3, 3), 1);
      else if (el === 'ice') emit(4, px, py, dir * rr(10, sp), rr(-30, 20), rr(0.3, 0.55), RAMP.ice, R() < 0.4 ? 2 : 1, 60, 1.5, null, 1);
      else emit(1, px, py, dir * rr(10, sp), rr(-20, 20), rr(0.15, 0.3), P_.ramp, 2, 0, 3, null, 1);
    }
  }
  // o: { type, combo, reach, el, stage }
  api('swing', (P, o) => {
    const f = P.face, el = o.el, st = o.stage || 0, PL = pal(el);
    const R0 = o.reach || 32;
    if (o.type === 'sword') {
      const fin = o.combo === 2;
      if (fin) {
        add({ ty: 'cres', x: P.x + f * 2, y: P.y - 12, f, ra: R0 * 1.12, rb: 12, off: 10, oy: 0, vert: false, rev: false, pl: PL, t: 0.24, big: true, st, ly: 1, back: R0 * 0.45 });
        add({ ty: 'cres', x: P.x + f * 2, y: P.y - 13, f, ra: R0 * 0.8, rb: 20, off: 6, oy: -2, vert: true, rev: false, pl: PL, t: 0.18, big: false, st, ly: 1, d: 0.03 });
        for (let i = 0; i < 6; i++) streak(P.x + f * rr(8, R0), P.y - 12 + rr(-8, 8), f * rr(90, 170), rr(-25, 25), rr(0.12, 0.22), PL.ramp, 1, rr(6, 12), 0, 3);
        kick(f * 1.5, 0); trauma(0.12);
      } else {
        const up = o.combo === 1;
        add({ ty: 'cres', x: P.x + f * 3, y: P.y - 15, f, ra: R0 * (up ? 0.92 : 0.86), rb: up ? 21 : 19, off: up ? 7 : 6, oy: up ? 4 : -4, vert: true, rev: up, pl: PL, t: 0.16, big: false, st, ly: 1 });
      }
      if (st >= 2 || el) elemBits(el, P.x + f * R0 * 0.7, P.y - 14, (st >= 3 ? 6 : st >= 2 ? 4 : 2) + (fin ? 3 : 0), f, 70);
    } else if (o.type === 'hammer') {
      const ix = P.x + f * R0 * 0.72, iy = P.y;
      add({ ty: 'cres', x: P.x + f * 4, y: P.y - 17, f, ra: R0 * 0.9, rb: 27, off: 10, oy: -5, vert: true, rev: false, pl: PL, t: 0.2, big: true, st, ly: 1 });
      slam(ix, iy, 20, el, 0.7);
      kick(0, 2.5); trauma(0.3);
      if (st >= 2 || el) elemBits(el, ix, iy - 6, st >= 3 ? 8 : 5, f, 60);
    } else if (o.type === 'spear') {
      add({ ty: 'thrust', x: P.x + f * 8, y: P.y - 13, f, len: R0 + 2, pl: PL, t: 0.17, st, big: o.combo === 2, ly: 1 });
      for (let i = 0; i < 3; i++) streak(P.x + f * rr(14, R0 - 6), P.y - 13 + rr(-4, 4), f * rr(120, 200), 0, rr(0.1, 0.18), PL.ramp, 1, rr(6, 10), 0, 4);
      if (st >= 2 || el) elemBits(el, P.x + f * R0, P.y - 13, st >= 3 ? 5 : st >= 2 ? 3 : 2, f, 80);
      kick(f, 0);
    }
  });
  // Nện xuống đất: vòng sóng, bụi hai bên, mảnh vụn, vết nứt
  function slam(x, y, r, el, power) {
    const PL = pal(el);
    add({ ty: 'crack', x, y, r: r * 0.8, t: 1.6, c: el ? PL.d : '#3a2e26', ly: 0, sd: R() * 100 });
    addRing(x, y, 4, r * 1.25, 0.28, PL.c2, 3, 0);
    addRing(x, y, 2, r * 0.9, 0.22, '#ffffff', 2, 0, 0.04);
    const n = Math.round(8 * power) + 3;
    for (let i = 0; i < n; i++) {
      const sd = i % 2 ? 1 : -1;
      emit(2, x + sd * rr(2, r * 0.5), y + rr(-2, 3), sd * rr(25, 70) * power, rr(-22, -4), rr(0.3, 0.6), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
    }
    const m = Math.round(6 * power) + 2;
    for (let i = 0; i < m; i++) emit(8, x + rr(-r * 0.4, r * 0.4), y - 1, rr(-60, 60) * power, rr(-150, -70) * (0.6 + power * 0.5), rr(0.5, 0.9), el && R() < 0.4 ? PL.ramp : RAMP.rock, R() < 0.35 ? 3 : 2, 420, 0, y + rr(-2, 5), 1);
    add({ ty: 'flash', x, y: y - 2, r: 5 + r * 0.25, t: 0.09, c: '#ffffff', c2: PL.c2, ly: 1 });
  }
  // Đòn vung của quái: vệt cào đỏ nhỏ để thấy rõ lúc đòn tung ra
  api('enemySwing', (e) => {
    const sc = e.scale || 1;
    add({ ty: 'cres', x: e.x + e.face * 4, y: e.y - Math.min(20, (e.h || 20) * sc * 0.55), f: e.face, ra: (22 + e.r) * 0.8, rb: 9 + e.r * 0.5, off: 5, oy: 2, vert: true, rev: false, pl: e.el ? pal(e.el) : PAL.foe, t: 0.14, big: false, st: 0, ly: 1 });
  });
  api('lunge', (e) => {
    for (let i = 0; i < 5; i++) streak(e.x - e.face * rr(0, 10), e.y - rr(3, 14), -e.face * rr(30, 80), 0, rr(0.15, 0.25), e.el ? pal(e.el).ramp : RAMP.red, 1, rr(8, 14), 0, 2);
    emit(2, e.x, e.y, -e.face * 20, -6, 0.3, RAMP.dust, 3, 0, 3, null, 1);
  });

  // ---------- trúng đòn ----------
  // o: { el, type (loại vũ khí), ranged, crit, dead, heavy, dir, rain }
  api('hit', (e, o) => {
    const el = o.el, PL = pal(el), dir = o.dir || 1;
    const hh = Math.min(16, (e.h || 24) * (e.scale || 1) * 0.55);
    const cx = e.x - dir * Math.min(e.r, 12) * 0.5, cy = e.y - hh;
    const ang = dir > 0 ? 0 : Math.PI;
    if (o.rain) {
      spray(3, cx, cy, 2, Math.PI / 2, 0.9, 30, 70, 0.1, 0.18, PL.ramp, 1, 0, 4);
      return;
    }
    // giật lùi nhẹ (chỉ là dời hình lúc vẽ)
    e.fxK = 0.13; e.fxD = dir * (e.isBoss ? 1 : o.heavy || o.crit ? 4 : 2);
    const big = o.heavy || o.crit || o.dead;
    const blunt = o.type === 'hammer', pierce = o.type === 'spear' || o.ranged;
    if (blunt) {
      add({ ty: 'flash', x: cx, y: cy, r: big ? 9 : 7, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1, sq: true });
      addRing(cx, cy, 3, big ? 16 : 12, 0.16, PL.c2, 2, 1);
      spray(8, cx, cy, big ? 7 : 5, ang, 2.6, 40, 110, 0.3, 0.55, PL.ramp, 2, 380, 0, e.y + 2);
    } else if (pierce) {
      add({ ty: 'flash', x: cx, y: cy, r: big ? 6 : 4, t: 0.08, c: '#ffffff', c2: PL.c2, ly: 1 });
      // tia xuyên ra sau lưng mục tiêu
      for (let i = 0; i < (big ? 6 : 4); i++) streak(e.x + dir * rr(0, e.r), cy + rr(-3, 3), dir * rr(110, 220), rr(-30, 30), rr(0.1, 0.2), PL.ramp, 1, rr(6, 12), 0, 4);
      spray(1, cx, cy, 3, ang + Math.PI, 0.8, 30, 70, 0.12, 0.22, PL.ramp, 2, 0, 3);
    } else {
      add({ ty: 'flash', x: cx, y: cy, r: big ? 7 : 5, t: 0.08, c: '#ffffff', c2: PL.c2, ly: 1 });
      add({ ty: 'cut', x: cx + dir * 2, y: cy, f: dir, r: big ? 11 : 8, t: 0.12, c: PL.c2, up: (S.cutN = (S.cutN | 0) + 1) & 1, ly: 1 });
      for (let i = 0; i < (big ? 8 : 5); i++) { const a = ang + rr(-0.9, 0.9), v = rr(70, 170); streak(cx, cy, Math.cos(a) * v, Math.sin(a) * v * 0.8 - 20, rr(0.12, 0.24), PL.ramp, 1, rr(4, 9), 200, 3); }
    }
    // chất liệu riêng của từng hệ
    if (el === 'fire') { for (let i = 0; i < (big ? 5 : 3); i++) emit(9, cx + rr(-4, 4), cy + rr(-4, 4), dir * rr(5, 40), rr(-60, -20), rr(0.25, 0.45), RAMP.fire, 3, -30, 2, null, 1); }
    else if (el === 'poison') { for (let i = 0; i < (big ? 6 : 4); i++) emit(5, cx, cy, dir * rr(10, 70), rr(-90, -20), rr(0.4, 0.7), RAMP.poison, 2, 320, 0, e.y + rr(-2, 4), 1); }
    else if (el === 'ice') { for (let i = 0; i < (big ? 6 : 4); i++) emit(4, cx, cy, dir * rr(10, 80), rr(-60, 30), rr(0.3, 0.5), RAMP.ice, R() < 0.4 ? 2 : 1, 120, 1.5, null, 1); emit(6, cx + rr(-5, 5), cy + rr(-6, 6), 0, 0, 0.25, RAMP.ice, 3, 0, 0, null, 1); }
    if (o.crit) {
      add({ ty: 'flash', x: cx, y: cy, r: 12, t: 0.14, c: '#fff3b0', c2: '#ffd23f', ly: 1 });
      addRing(cx, cy, 4, 20, 0.2, '#ffd23f', 2, 1);
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; streak(cx, cy, Math.cos(a) * 150, Math.sin(a) * 110, 0.2, RAMP.gold, 1, 9, 0, 4); }
    }
    // khựng hình và rung
    if (o.ranged) { if (big) { stop(50); trauma(0.15); } kick(dir * 0.8, 0); }
    else {
      stop(o.crit ? 115 : o.dead ? 100 : o.heavy ? 90 : blunt ? 70 : 45);
      trauma(o.crit ? 0.4 : o.heavy || blunt ? 0.3 : 0.14);
      kick(dir * (big ? 2.5 : 1.2), blunt ? 1.5 : 0);
    }
  });

  // ---------- đạn và tên ----------
  function stepProjs(W, dt) {
    for (const o of W.projs) {
      const py = o.y - (o.z || 10);
      if (!o.fxT) {
        o.fxT = 0.001;
        if (o.team === 'enemy') {
          // ánh chớp cảnh báo lúc đạn rời tay quái
          add({ ty: 'flash', x: o.x, y: py, r: 6, t: 0.16, c: '#ffffff', c2: '#ff4a30', ly: 1 });
          addRing(o.x, py, 2, 9, 0.18, '#ff4a30', 1, 1);
        } else if (o.big) {
          add({ ty: 'flash', x: o.x, y: py, r: 7, t: 0.1, c: '#ffffff', c2: o.col || '#ffffff', ly: 1 });
          addRing(o.x, py, 2, 12, 0.16, o.col || '#ffffff', 2, 1);
        }
      }
      o.fxT += dt;
      const tick = ((o.fxT * 60) | 0);
      if (o.team === 'player') {
        if (o.big) { if (tick % 2 === 0) emit(1, o.x - Math.sign(o.vx) * 8, py + rr(-2, 2), -o.vx * 0.1, rr(-12, 12), 0.22, rampOf(o.col || '#ffffff'), 2, 0, 0, null, 1); }
        else if (o.w && G.wStage(o.w) >= 2 && tick % 4 === 0) emit(1, o.x - Math.sign(o.vx) * 7, py, -o.vx * 0.05, rr(-8, 8), 0.2, rampOf(o.col || '#ffffff'), 2, 0, 0, null, 1);
      } else if (o.kind === 'fire') {
        if (tick % 2 === 0) emit(9, o.x + rr(-2, 2), py + rr(-1, 3), -o.vx * 0.15, -o.vy * 0.15 - 10, rr(0.25, 0.4), RAMP.fire, 4, -20, 0, null, 1);
        if (tick % 9 === 0) emit(2, o.x, py, 0, -12, 0.4, RAMP.dark, 2, 0, 0, null, 1);
      } else if (tick % 3 === 0) {
        emit(1, o.x + rr(-1, 1), py + rr(-1, 1), -o.vx * 0.08, -o.vy * 0.08, 0.28, o.el ? pal(o.el).ramp : RAMP.gold, 3, 0, 0, null, 1);
      }
    }
  }
  // Vệt sau mũi tên và viền cảnh báo của đạn quái (vẽ trước hình viên đạn)
  fx.proj = function (c, o) {
    if (G.noRender || !S) return;
    try {
      const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
      if (o.kind === 'arrow') {
        const k = o.vx < 0 ? -1 : 1, PL = rampOf(o.col || '#e8e2d0');
        const L = o.big ? 34 : 18;
        const seg = (a, len, h, col) => p(c, k > 0 ? x - a - len : x + a, y - (h >> 1), len, h, col);
        if (o.big) {
          seg(4, L, 3, PL[4]); seg(4, L * 0.7, 3, PL[2]); seg(4, L * 0.45, 1, '#ffffff');
          seg(6, 10, 5, PL[2]); seg(-7, 3, 5, PL[1]); seg(-9, 2, 3, '#ffffff');
          const f = ((S.t * 30) | 0) % 3;
          seg(L * 0.5 + f * 4, 5, 1, PL[1]);
          p(c, x - k * (10 + f * 5), y - 3, 2, 1, PL[1]); p(c, x - k * (16 - f * 3), y + 3, 2, 1, PL[1]);
        } else {
          seg(5, L, 1, 'rgba(255,255,255,0.55)'); seg(5, L * 0.55, 1, PL[1]);
          if (o.col && o.col !== '#f1ead9') seg(9, L * 0.5, 3, A_(o.col, 0.35));
        }
      } else if (o.team === 'enemy') {
        // vòng đỏ nhấp nháy quanh đạn của quái: nhìn là biết phải né
        const f = ((S.t * 12) | 0) % 2;
        const col = f ? '#ff3a22' : '#ffb09a';
        p(c, x - 5, y - 6, 10, 1, col); p(c, x - 5, y + 5, 10, 1, col); p(c, x - 6, y - 5, 1, 10, col); p(c, x + 5, y - 5, 1, 10, col);
        if (((S.t * 4 + o.fxT * 3) | 0) % 3 === 0) star(c, x + 3, y - 4, 2, '#ffffff');
      }
    } catch (e) { fail(e); }
  };
  const AC = new Map();
  function A_(hex, a) {
    const key = hex + a;
    let v = AC.get(key);
    if (!v) { const n = parseInt(hex.slice(1), 16); v = 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; AC.set(key, v); }
    return v;
  }
  // Tên từ mưa tên rơi xuống (vị trí do luật chơi chọn)
  api('rainDrop', (x, y, el) => {
    const PL = pal(el);
    const o = emit(7, x, y - 150, 0, 620, 0.5, el ? [PL.c2, PL.c] : ['#e8e2d0', '#c9ccd2'], 1, 0, 0, y, 1);
    o.vx = 0;
    // thêm vài mũi tên phụ cho dày
    for (let i = 0; i < 3; i++) emit(7, x + rr(-34, 34), y + rr(-16, 16) - rr(120, 190), 0, 620, 0.6, el ? [PL.c2, PL.c] : ['#e8e2d0', '#c9ccd2'], 1, 0, 0, y + rr(-16, 16), 1);
  });

  // ---------- trạng thái trên quái và người chơi ----------
  function stView(e) {
    const s = e.st;
    if (e.isPlayer) return { fire: s.fire > 0, pn: s.poison > 0 ? 1 : 0, ice: s.ice > 0 ? 2 : 0, frozen: false, root: false, stun: false };
    return { fire: s.fire > 0, pn: s.poisonN, ice: s.iceN, frozen: s.frozen > 0, root: s.root > 0, stun: s.stun > 0 && !(s.frozen > 0) };
  }
  function bodyOf(e) {
    const sc = e.scale || 1;
    BODY.w = Math.max(4, Math.min(22, (e.isPlayer ? 6 : e.r) * (e.isBoss && e.kind !== 'mini' ? 0.7 : 0.9)));
    BODY.h = e.isPlayer ? 28 : Math.min(44, (e.h || 24) * sc);
    return BODY;
  }
  const BODY = { w: 6, h: 24 };
  function stepStatus(e) {
    if (e.dead || e.hidden) return;
    const v = stView(e), B = bodyOf(e), x = e.x, y = e.y;
    if (v.fire) {
      if (R() < (e.isPlayer ? 0.35 : 0.75)) emit(9, x + rr(-B.w, B.w), y - rr(2, B.h), rr(-6, 6), rr(-55, -25), rr(0.25, 0.5), RAMP.fire, R() < 0.4 ? 4 : 3, -30, 0, null, 1);
      if (R() < 0.25) emit(2, x + rr(-B.w, B.w) * 0.6, y - B.h - 2, rr(-5, 5), rr(-26, -14), rr(0.5, 0.8), RAMP.dark, 3, 0, 0.5, null, 1);
      if (R() < 0.2) emit(0, x + rr(-B.w, B.w), y - rr(4, B.h), rr(-15, 15), rr(-70, -40), rr(0.3, 0.5), RAMP.ember, 1, 0, 0, null, 1);
    }
    if (v.pn > 0) {
      const k = 0.25 + 0.12 * v.pn;
      if (R() < k) emit(11, x + rr(-B.w, B.w), y - rr(3, B.h * 0.9), rr(-4, 4), rr(-22, -10), rr(0.5, 0.85), RAMP.poison, 2, 0, 0, null, 1);
      if (R() < k * 0.7) emit(5, x + rr(-B.w, B.w) * 0.8, y - rr(4, B.h * 0.6), 0, 5, 0.6, RAMP.poison, 1, 220, 0, y + rr(-1, 2), 1);
      if (R() < 0.12 + 0.05 * v.pn) emit(2, x + rr(-B.w, B.w), y - rr(2, B.h * 0.7), rr(-5, 5), rr(-12, -5), rr(0.5, 0.8), RAMP.vapor, 3, 0, 0.5, null, 1);
    }
    if (v.ice > 0 || v.frozen) {
      if (R() < 0.3) emit(2, x + rr(-B.w - 3, B.w + 3), y - rr(0, 4), rr(-10, 10), rr(-5, 0), rr(0.5, 0.9), RAMP.mist, 3, 0, 0.5, null, 0);
      if (R() < 0.12 + 0.06 * v.ice) emit(6, x + rr(-B.w, B.w), y - rr(3, B.h), 0, 8, rr(0.3, 0.5), RAMP.ice, R() < 0.3 ? 2 : 1, 0, 0, null, 1);
      if (R() < 0.15) emit(0, x + rr(-B.w, B.w), y - rr(6, B.h), rr(-4, 4), rr(10, 24), rr(0.4, 0.7), RAMP.ice, 1, 0, 0, y, 1);
    }
  }
  function edges(e) {
    if (e.isPlayer) return;
    const fz = e.st.frozen > 0, rt = e.st.root > 0;
    if (e.fxFz && !fz && !e.dead) shatter(e);
    e.fxFz = fz;
    if (rt && !e.fxRt) e.fxRt0 = S.t;
    if (e.fxRt && !rt && !e.dead) for (let i = 0; i < 4; i++) emit(8, e.x + rr(-6, 6), e.y - 2, rr(-50, 50), rr(-90, -40), 0.5, RAMP.steel, 2, 400, 0, e.y + 2, 1);
    e.fxRt = rt;
    if (e.fxK > 0) e.fxK -= 1 / 60;
  }
  // Khối băng vỡ
  function shatter(e) {
    const B = bodyOf(e);
    for (let i = 0; i < 12; i++) { const a = R() * TAU, v = rr(40, 130); emit(i % 3 ? 4 : 8, e.x + rr(-B.w, B.w), e.y - rr(2, B.h), Math.cos(a) * v, Math.sin(a) * v - 40, rr(0.35, 0.7), RAMP.ice, i % 3 ? 2 : 3, 320, 0, e.y + rr(-2, 4), 1); }
    addRing(e.x, e.y - B.h * 0.5, 4, B.w + 12, 0.2, '#e9f9ff', 2, 1);
    puffs(e.x, e.y - B.h * 0.4, 4, RAMP.mist, 30, 3, 8);
    add({ ty: 'flash', x: e.x, y: e.y - B.h * 0.5, r: 7, t: 0.08, c: '#ffffff', c2: '#bfeaff', ly: 1 });
  }
  // Một lưỡi lửa: ba khúc hẹp dần, cao thấp theo nhịp riêng
  function tongue(c, x, y, h, w) {
    if (h < 2) return;
    p(c, x - w, y - (h * 0.45 | 0), w * 2 + 1, (h * 0.45 | 0) + 1, '#ff7a2a');
    p(c, x - w + 1, y - (h * 0.8 | 0), Math.max(1, w * 2 - 1), (h * 0.4 | 0) + 1, '#ff7a2a');
    p(c, x, y - h, 1, (h * 0.3 | 0) + 1, '#ffa53a');
    p(c, x - (w > 1 ? 1 : 0), y - (h * 0.4 | 0), w > 1 ? 3 : 1, (h * 0.4 | 0), '#ffd23f');
    if (h > 6) p(c, x, y - (h * 0.25 | 0), 1, 2, '#fff3b0');
  }
  // Vẽ thêm lên từng nhân vật sau khi hình của nó đã vẽ xong
  fx.entity = function (c, e) {
    if (G.noRender || !S || e.dead || e.hidden) return;
    try {
      const v = stView(e), B = bodyOf(e), x = Math.round(e.x), y = Math.round(e.y), t = S.t;
      const id = (e.fxId || (e.fxId = 1 + ((R() * 1000) | 0)));
      const top = y - Math.round((e.h || 24) * (e.scale || 1));
      if (v.frozen) {
        // khối băng trong: viền, mặt bóng, vệt sáng chéo
        const w = Math.round(B.w + 4), h = Math.round(B.h + 5);
        p(c, x - w, y - h + 2, w * 2, h - 1, 'rgba(160,220,250,0.24)');
        p(c, x - w + 2, y - h, w * 2 - 4, 2, 'rgba(200,236,255,0.5)');
        p(c, x - w, y - h + 2, 1, h - 2, '#e9f9ff'); p(c, x + w - 1, y - h + 2, 1, h - 2, '#4a9ad0');
        p(c, x - w + 2, y - h, w * 2 - 4, 1, '#e9f9ff'); p(c, x - w + 1, y - h + 1, 1, 1, '#e9f9ff'); p(c, x + w - 2, y - h + 1, 1, 1, '#7fd4ff');
        p(c, x - w, y, w * 2, 1, '#2b6ea3');
        const sh = ((t * 14 + id) | 0) % 40;
        for (let i = 0; i < 5; i++) { const yy = y - h + 4 + i * 3 + (sh < 10 ? sh : 0); if (yy < y - 2) p(c, x - w + 3 + i * 2, yy, 2, 1, 'rgba(255,255,255,0.8)'); }
        p(c, x + w - 4, y - 6, 2, 1, 'rgba(255,255,255,0.6)'); p(c, x + w - 3, y - 5, 1, 2, 'rgba(255,255,255,0.6)');
        // gai băng dưới chân
        p(c, x - w - 2, y - 3, 2, 3, '#bfeaff'); p(c, x - w - 1, y - 5, 1, 2, '#e9f9ff'); p(c, x + w, y - 4, 2, 4, '#7fd4ff'); p(c, x + w + 1, y - 6, 1, 2, '#bfeaff');
      } else if (v.ice > 0) {
        // tinh thể sương bám trên người, càng nhiều tầng càng dày
        const n = Math.min(6, 1 + v.ice);
        for (let i = 0; i < n; i++) {
          const hx = Math.round((hash(id + i * 7.3) - 0.5) * 2 * B.w), hy = Math.round(hash(id * 3 + i * 1.7) * (B.h - 4)) + 2;
          const tw = ((t * 5 + i * 1.3 + id) | 0) % 5 === 0;
          p(c, x + hx, y - hy, 2, 2, '#bfeaff'); p(c, x + hx, y - hy, 1, 1, '#ffffff');
          if (tw) { p(c, x + hx - 1, y - hy, 4, 1, '#e9f9ff'); p(c, x + hx, y - hy - 1, 1, 4, '#e9f9ff'); }
        }
        const f = ((t * 6) | 0) % 4;
        p(c, x - Math.round(B.w) - 2 + f, y, 5, 1, 'rgba(200,236,255,0.6)'); p(c, x + Math.round(B.w) - 4 - f, y + 1, 5, 1, 'rgba(200,236,255,0.5)');
      }
      if (v.fire) {
        const n = e.isPlayer ? 2 : B.w > 12 ? 5 : B.w > 7 ? 4 : 3;
        for (let i = 0; i < n; i++) {
          const fx0 = x + Math.round(((i + 0.5) / n - 0.5) * 2 * B.w);
          const ph = t * (9 + (i % 3) * 2.3) + i * 2.1 + id;
          const h = (e.isPlayer ? 3 : 5) + Math.round((Math.sin(ph) * 0.5 + 0.5) * (e.isPlayer ? 4 : 6) + (Math.sin(ph * 2.7) > 0.6 ? 3 : 0));
          const by = y - Math.round(B.h * (0.25 + 0.5 * hash(id + i * 3.1))) + ((ph | 0) % 2);
          tongue(c, fx0 + (((ph * 0.7) | 0) % 2), by, h, i % 2 ? 1 : 2);
        }
        // quầng sáng dưới chân
        p(c, x - Math.round(B.w), y, Math.round(B.w) * 2, 1, ((t * 12) | 0) % 2 ? 'rgba(255,160,60,0.5)' : 'rgba(255,122,42,0.35)');
      }
      if (v.pn > 0) {
        // nước độc chảy thành vệt trên người
        for (let i = 0; i < Math.min(4, v.pn); i++) {
          const hx = Math.round((hash(id + i * 5.1) - 0.5) * 1.6 * B.w), cyc = (t * 0.9 + hash(id + i)) % 1;
          const yy = y - Math.round(B.h * 0.75) + Math.round(cyc * B.h * 0.5);
          p(c, x + hx, yy - 2, 1, 3, '#6fcf3a'); p(c, x + hx, yy + 1, 1, 1, '#c2f58a');
        }
        if (!e.isPlayer && v.pn >= 2) digit(c, x + 10, top - 1, v.pn, '#c2f58a');
      }
      if (v.ice >= 2 && !v.frozen && !e.isPlayer) digit(c, x + 10, top + 6, Math.min(9, v.ice), '#bfeaff');
      if (v.root) {
        // hàm bẫy kẹp quanh chân
        const k = Math.min(1, (t - (e.fxRt0 || 0)) / 0.08), w = Math.round(B.w + 3), up = Math.round(5 * k);
        p(c, x - w, y + 1, w * 2, 2, '#3a3436'); p(c, x - w, y, w * 2, 1, '#8a93a0');
        for (let i = 0; i < w * 2 - 1; i += 3) { p(c, x - w + i, y - up, 2, up, '#c9ccd2'); p(c, x - w + i, y - up - 1, 1, 1, '#ffffff'); }
        p(c, x - w - 1, y - 1, 1, 3, '#5a5456'); p(c, x + w, y - 1, 1, 3, '#5a5456');
      }
      if (v.stun) {
        // sao choáng xoay trên đầu
        for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.094; const sx = x + Math.round(Math.cos(a) * 7), sy = top - 4 + Math.round(Math.sin(a) * 2); if (Math.sin(a) > -0.3) star(c, sx, sy, 1, '#ffd23f', '#ffffff'); else p(c, sx, sy, 1, 1, '#a8742a'); }
      }
    } catch (err) { fail(err); }
  };
  // Dời hình khi vừa trúng đòn (điểm ảnh, theo trục ngang)
  fx.recoil = function (e) {
    if (G.noRender || !(e.fxK > 0)) return 0;
    return Math.round(e.fxD * Math.min(1, e.fxK / 0.09));
  };

  // ---------- kết hợp hệ và vụ nổ ----------
  function blastFire(x, y, r, power) {
    add({ ty: 'scorch', x, y, r: r * 0.55, t: 2.2, ly: 0 });
    addRing(x, y, 5, r, 0.3, '#ffd23f', 4, 0);
    addRing(x, y, 2, r * 0.8, 0.26, '#ff7a2a', 3, 0, 0.05);
    add({ ty: 'flash', x, y: y - 8, r: 12 * power, t: 0.12, c: '#fff3b0', c2: '#ffa53a', ly: 1, sq: true });
    const n = Math.round(16 * power);
    for (let i = 0; i < n; i++) { const a = R() * TAU, d = rr(0, r * 0.5), v = rr(20, 70); emit(9, x + Math.cos(a) * d, y - 4 + Math.sin(a) * d * 0.5, Math.cos(a) * v, Math.sin(a) * v * 0.4 - rr(30, 80), rr(0.3, 0.65), RAMP.fire, R() < 0.5 ? 6 : 4, -40, 1.5, null, 1); }
    for (let i = 0; i < n * 0.6; i++) { const a = R() * TAU, v = rr(30, r * 1.6); emit(2, x + Math.cos(a) * 6, y - 8 + Math.sin(a) * 4, Math.cos(a) * v, Math.sin(a) * v * 0.5 - 16, rr(0.5, 1.0), R() < 0.5 ? RAMP.smoke : RAMP.dark, R() < 0.5 ? 6 : 4, -14, 2.2, null, 1); }
    for (let i = 0; i < 8; i++) { const a = R() * TAU, v = rr(60, 150); emit(0, x, y - 6, Math.cos(a) * v, Math.sin(a) * v * 0.6 - 60, rr(0.4, 0.8), RAMP.ember, 1, 220, 0, y + rr(-4, 6), 1); }
  }
  function blastPoison(x, y, r, power) {
    addRing(x, y, 5, r, 0.34, '#c2f58a', 3, 0);
    addRing(x, y, 2, r * 0.75, 0.3, '#6fcf3a', 2, 0, 0.06);
    add({ ty: 'flash', x, y: y - 8, r: 9 * power, t: 0.1, c: '#e6ffc0', c2: '#8fe04a', ly: 1, sq: true });
    const n = Math.round(14 * power);
    for (let i = 0; i < n; i++) { const a = R() * TAU, v = rr(20, r * 1.5); emit(2, x, y - 6, Math.cos(a) * v, Math.sin(a) * v * 0.5 - 6, rr(0.6, 1.2), RAMP.vapor, R() < 0.5 ? 6 : 4, -6, 2.2, null, 1); }
    for (let i = 0; i < n; i++) { const a = R() * TAU, v = rr(40, 130); emit(5, x, y - 8, Math.cos(a) * v, Math.sin(a) * v * 0.5 - rr(60, 140), rr(0.5, 0.9), RAMP.poison, 2, 380, 0, y + rr(-8, 10), 1); }
    for (let i = 0; i < 7; i++) emit(11, x + rr(-r, r) * 0.6, y + rr(-r, r) * 0.3, 0, rr(-26, -10), rr(0.5, 1.0), RAMP.poison, 2, 0, 0, null, 1);
  }
  function blastIce(x, y, r, power) {
    addRing(x, y, 5, r, 0.26, '#ffffff', 3, 0);
    addRing(x, y, 2, r * 0.85, 0.3, '#7fd4ff', 2, 0, 0.05);
    add({ ty: 'flash', x, y: y - 8, r: 11 * power, t: 0.1, c: '#ffffff', c2: '#bfeaff', ly: 1 });
    add({ ty: 'spikes', x, y, r: r * 0.7, t: 0.55, ly: 1, sd: R() * 50 });
    const n = Math.round(16 * power);
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rr(-0.2, 0.2), v = rr(70, 190); emit(4, x, y - 8, Math.cos(a) * v, Math.sin(a) * v * 0.55 - 30, rr(0.35, 0.7), RAMP.ice, R() < 0.5 ? 2 : 1, 200, 1.5, y + rr(-6, 8), 1); }
    for (let i = 0; i < 8; i++) { const a = R() * TAU, v = rr(20, r); emit(2, x, y - 2, Math.cos(a) * v, Math.sin(a) * v * 0.4, rr(0.5, 0.9), RAMP.mist, 4, 0, 2, null, 0); }
    for (let i = 0; i < 6; i++) emit(6, x + rr(-r, r) * 0.7, y - rr(0, 26), 0, 0, rr(0.25, 0.6), RAMP.ice, 3, 0, 0, null, 1);
  }
  // Nổ khói: mây khói lẫn lửa nở rộng. Sốc nhiệt: hơi nước bắn thẳng, mảnh băng văng
  api('combo', (kind, t) => {
    const x = t.x, y = t.y, hh = Math.min(20, (t.h || 24) * (t.scale || 1) * 0.5);
    if (kind === 'smoke') {
      addRing(x, y, 6, 42, 0.36, '#ff7a2a', 4, 0);
      addRing(x, y, 3, 34, 0.3, '#ffd23f', 2, 0, 0.06);
      add({ ty: 'scorch', x, y, r: 20, t: 1.8, ly: 0 });
      add({ ty: 'flash', x, y: y - hh, r: 13, t: 0.12, c: '#fff3b0', c2: '#ff7a2a', ly: 1, sq: true });
      for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU + rr(-0.2, 0.2), v = rr(50, 120); emit(2, x + Math.cos(a) * 4, y - hh + Math.sin(a) * 3, Math.cos(a) * v, Math.sin(a) * v * 0.55 - 12, rr(0.6, 1.1), i % 3 === 0 ? RAMP.dark : RAMP.smoke, i % 2 ? 7 : 5, -10, 2.6, null, 1); }
      for (let i = 0; i < 12; i++) { const a = R() * TAU, v = rr(20, 80); emit(9, x, y - hh, Math.cos(a) * v, Math.sin(a) * v * 0.5 - rr(20, 60), rr(0.3, 0.55), RAMP.fire, R() < 0.5 ? 6 : 4, -30, 2, null, 1); }
      for (let i = 0; i < 6; i++) emit(0, x, y - hh, rr(-110, 110), rr(-150, -50), rr(0.4, 0.8), RAMP.ember, 1, 260, 0, y + rr(-3, 6), 1);
      fx.comboName(x, y - hh * 2 - 16, 'Nổ khói', 'fire');
      trauma(0.45); stop(80);
    } else {
      addRing(x, y, 4, 30, 0.2, '#ffffff', 2, 0);
      add({ ty: 'flash', x, y: y - hh, r: 15, t: 0.13, c: '#ffffff', c2: '#bfeaff', ly: 1 });
      addRing(x, y - hh, 3, 22, 0.16, '#e9f9ff', 2, 1);
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + 0.26, v = rr(170, 260); streak(x, y - hh, Math.cos(a) * v, Math.sin(a) * v * 0.7, rr(0.14, 0.24), RAMP.white, i % 3 === 0 ? 2 : 1, rr(8, 14), 0, 3.5); }
      for (let i = 0; i < 14; i++) emit(2, x + rr(-8, 8), y - hh + rr(-8, 4), rr(-50, 50), rr(-130, -40), rr(0.4, 0.8), RAMP.steam, R() < 0.5 ? 6 : 4, 0, 2.6, null, 1);
      for (let i = 0; i < 9; i++) { const a = R() * TAU, v = rr(60, 150); emit(4, x, y - hh, Math.cos(a) * v, Math.sin(a) * v * 0.6 - 50, rr(0.4, 0.7), i % 2 ? RAMP.ice : RAMP.ember, 2, 300, 0, y + rr(-3, 6), 1); }
      fx.comboName(x, y - hh * 2 - 16, 'Sốc nhiệt', 'ice');
      trauma(0.5); stop(100); kick(0, -2);
    }
  });
  // Lò than, nấm độc, tinh thể băng phát nổ
  api('propBlast', (pr, el) => {
    const x = pr.x, y = pr.y;
    if (el === 'fire') blastFire(x, y, 52, 1.5); else if (el === 'poison') blastPoison(x, y, 52, 1.5); else blastIce(x, y, 52, 1.4);
    for (let i = 0; i < 7; i++) emit(8, x + rr(-5, 5), y - rr(2, 10), rr(-90, 90), rr(-190, -80), rr(0.6, 1.0), el === 'ice' ? RAMP.ice : el === 'poison' ? RAMP.poison : RAMP.rock, R() < 0.5 ? 3 : 2, 460, 0, y + rr(-6, 8), 1);
    trauma(0.6); stop(90);
  });
  // Đóng băng vừa xong: sương toả và tinh thể mọc
  api('freeze', (t) => {
    const B = bodyOf(t);
    addRing(t.x, t.y, 3, B.w + 12, 0.24, '#e9f9ff', 2, 0);
    for (let i = 0; i < 8; i++) emit(6, t.x + rr(-B.w, B.w) * 1.3, t.y - rr(0, B.h), 0, 0, rr(0.2, 0.5), RAMP.ice, 3, 0, 0, null, 1);
    puffs(t.x, t.y - 4, 5, RAMP.mist, 34, 3, 0);
    add({ ty: 'flash', x: t.x, y: t.y - B.h * 0.5, r: 6, t: 0.08, c: '#ffffff', c2: '#bfeaff', ly: 1 });
  });
  // Dính hiệu ứng mới: một nhúm hạt nhỏ báo hệ
  api('status', (t, el) => {
    const B = bodyOf(t), y = t.y - B.h * 0.5;
    if (el === 'fire') for (let i = 0; i < 4; i++) emit(9, t.x + rr(-B.w, B.w), y + rr(-4, 6), rr(-10, 10), rr(-60, -30), rr(0.25, 0.4), RAMP.fire, 4, -20, 0, null, 1);
    else if (el === 'poison') for (let i = 0; i < 4; i++) emit(5, t.x + rr(-B.w, B.w), y, rr(-30, 30), rr(-70, -20), rr(0.4, 0.6), RAMP.poison, 2, 300, 0, t.y + rr(-1, 3), 1);
    else for (let i = 0; i < 3; i++) emit(6, t.x + rr(-B.w, B.w), y + rr(-8, 8), 0, 0, rr(0.2, 0.35), RAMP.ice, 3, 0, 0, null, 1);
  });

  // ---------- vùng báo trước của quái và trùm khi phát nổ ----------
  function impact(x, y, r, el) {
    const k = Math.min(1.6, r / 20);
    if (el === 'fire') {
      // cột lửa phụt lên
      add({ ty: 'pillar', x, y, w: Math.max(5, r * 0.5), h: 26 + r * 0.9, t: 0.34, ly: 1 });
      addRing(x, y, 3, r, 0.24, '#ffd23f', 3, 0);
      add({ ty: 'scorch', x, y, r: r * 0.6, t: 1.6, ly: 0 });
      for (let i = 0; i < 6 * k; i++) emit(9, x + rr(-r, r) * 0.6, y - rr(0, 6), rr(-20, 20), rr(-110, -40), rr(0.3, 0.55), RAMP.fire, 5, -30, 1, null, 1);
      for (let i = 0; i < 4 * k; i++) emit(0, x, y - 6, rr(-80, 80), rr(-160, -70), rr(0.4, 0.8), RAMP.ember, 1, 260, 0, y + rr(-3, 5), 1);
      for (let i = 0; i < 3 * k; i++) emit(2, x + rr(-4, 4), y - 20, rr(-10, 10), rr(-40, -20), rr(0.5, 0.9), RAMP.dark, 4, 0, 1, null, 1);
    } else if (el === 'ice') {
      // nước bắn thành vành, giọt rơi lại, vụn băng
      addRing(x, y, 3, r, 0.26, '#e9f9ff', 3, 0);
      addRing(x, y, 2, r * 0.6, 0.3, '#9fd0e8', 2, 0, 0.08);
      add({ ty: 'pillar', x, y, w: Math.max(4, r * 0.35), h: 16 + r * 0.6, t: 0.26, ly: 1, water: true });
      for (let i = 0; i < 9 * k; i++) { const a = -Math.PI / 2 + rr(-1.1, 1.1), v = rr(70, 170); emit(5, x + Math.cos(a) * 4, y - 2, Math.cos(a) * v * 0.8, Math.sin(a) * v, rr(0.4, 0.75), RAMP.water, R() < 0.4 ? 2 : 1, 420, 0, y + rr(-4, 6), 1); }
      for (let i = 0; i < 4 * k; i++) emit(4, x, y - 6, rr(-90, 90), rr(-120, -40), rr(0.35, 0.6), RAMP.ice, 2, 300, 0, y + rr(-3, 5), 1);
      for (let i = 0; i < 3 * k; i++) emit(2, x + rr(-r, r) * 0.6, y - 2, rr(-14, 14), rr(-10, 0), rr(0.4, 0.7), RAMP.mist, 4, 0, 1, null, 0);
    } else if (el === 'poison') {
      addRing(x, y, 3, r, 0.28, '#c2f58a', 3, 0);
      for (let i = 0; i < 9 * k; i++) { const a = -Math.PI / 2 + rr(-1.2, 1.2), v = rr(60, 150); emit(5, x, y - 2, Math.cos(a) * v * 0.8, Math.sin(a) * v, rr(0.4, 0.75), RAMP.poison, 2, 400, 0, y + rr(-4, 6), 1); }
      for (let i = 0; i < 4 * k; i++) emit(2, x + rr(-r, r) * 0.5, y - rr(2, 10), rr(-16, 16), rr(-26, -8), rr(0.5, 0.9), RAMP.vapor, 5, 0, 1.2, null, 1);
      for (let i = 0; i < 3 * k; i++) emit(11, x + rr(-r, r) * 0.6, y + rr(-r, r) * 0.3, 0, rr(-22, -8), rr(0.4, 0.8), RAMP.poison, 2, 0, 0, null, 1);
      add({ ty: 'flash', x, y: y - 4, r: 5 + r * 0.15, t: 0.08, c: '#e6ffc0', c2: '#8fe04a', ly: 1, sq: true });
    } else {
      // đất đá: vết nứt, bụi, đá văng
      add({ ty: 'crack', x, y, r: r * 0.8, t: 1.5, c: '#3a2e26', ly: 0, sd: R() * 100 });
      addRing(x, y, 3, r, 0.24, '#e2d4b8', 3, 0);
      for (let i = 0; i < 7 * k; i++) emit(8, x + rr(-r, r) * 0.5, y - 1, rr(-70, 70), rr(-170, -70), rr(0.5, 0.9), RAMP.rock, R() < 0.4 ? 3 : 2, 440, 0, y + rr(-4, 6), 1);
      for (let i = 0; i < 6 * k; i++) { const sd = i % 2 ? 1 : -1; emit(2, x + sd * rr(0, r * 0.6), y + rr(-2, 3), sd * rr(20, 60), rr(-20, -4), rr(0.35, 0.7), RAMP.dust, 4, 0, 2.6, null, 1); }
      add({ ty: 'flash', x, y: y - 3, r: 5 + r * 0.15, t: 0.08, c: '#ffffff', c2: '#e2d4b8', ly: 1, sq: true });
    }
  }
  api('zoneFire', (z) => {
    if (z.team === 'player' || z.team === 'fx') return;
    if (z.shape === 'circle') { impact(z.x, z.y, z.r, z.el); trauma(Math.min(0.5, 0.15 + z.r / 120)); kick(0, 1.5); return; }
    // vùng chữ nhật lớn: rải nhiều điểm nổ, chỉ trong phần đang thấy trên màn hình
    const W = S.W, x0 = Math.max(z.x, W.cam - 10, W.x0 - 12), x1 = Math.min(z.x + z.w, W.cam + G.W + 10, W.x1 + 12);
    const n = Math.max(2, Math.min(9, Math.round(((x1 - x0) * z.h) / 1500)));
    const cols = Math.max(1, Math.round(n / (z.h > 40 ? 2 : 1)));
    for (let i = 0; i < n; i++) {
      const cx = x0 + ((i % cols) + 0.5 + rr(-0.25, 0.25)) * ((x1 - x0) / cols);
      const cy = z.y + (z.h > 40 ? ((i / cols) | 0) % 2 ? 0.72 : 0.3 : 0.5) * z.h + rr(-3, 3);
      impact(cx, cy, Math.min(20, z.h * 0.42), z.el);
    }
    trauma(0.55); kick(0, 2.5);
  });
  // Vũng nằm lại trên đất: mép gợn sóng, bong bóng, lửa, sương
  const POOLC = {
    poison: { base: 'rgba(40,110,26,0.55)', mid: 'rgba(111,207,58,0.45)', rim: '#8fe04a', rimP: 'rgba(143,224,74,0.75)' },
    fire: { base: 'rgba(168,50,10,0.6)', mid: 'rgba(255,122,42,0.5)', rim: '#ffd23f', rimP: 'rgba(255,210,63,0.75)' },
    ice: { base: 'rgba(43,110,163,0.5)', mid: 'rgba(159,208,232,0.45)', rim: '#e9f9ff', rimP: 'rgba(233,249,255,0.7)' },
    heal: { base: 'rgba(40,120,60,0.42)', mid: 'rgba(150,240,150,0.4)', rim: '#e6ffc0', rimP: 'rgba(200,255,190,0.85)' },
    none: { base: 'rgba(120,24,14,0.55)', mid: 'rgba(208,60,40,0.45)', rim: '#ff6a5a', rimP: 'rgba(255,106,90,0.75)' },
  };
  const BH = new Int16Array(96), BS = new Int8Array(96);
  // Hình vũng: tính mép từng hàng một lần, tô nền một lượt rồi viền một lượt (ít đổi màu vẽ)
  function blob(c, x, y, rx, ry, col, t, id, rim, dither) {
    const n = Math.min(47, Math.floor(ry));
    for (let dy = -n; dy <= n; dy++) {
      const q = 1 - (dy * dy) / (ry * ry + 0.01), k = dy + n;
      if (q <= 0 || (dither && ((dy + y) & 1))) { BH[k] = 0; continue; }
      const wob = Math.sin(dy * 0.5 + t * 3 + id) * 1.3 + Math.sin(dy * 0.23 - t * 2.2 + id * 2) * 1;
      BH[k] = Math.round(rx * Math.sqrt(q) + wob); BS[k] = Math.round(Math.sin(dy * 0.35 + t * 1.7 + id) * 0.8);
    }
    c.fillStyle = col;
    for (let k = 0; k <= 2 * n; k++) if (BH[k] > 0) c.fillRect(x - BH[k] + BS[k], y + k - n, BH[k] * 2, 1);
    if (!rim) return;
    c.fillStyle = rim;
    for (let k = 0; k <= 2 * n; k++) {
      const hw = BH[k];
      if (hw <= 0) continue;
      if (k === 0 || k === 2 * n) { c.fillRect(x - hw + BS[k], y + k - n, hw * 2, 1); continue; }
      c.fillRect(x - hw + BS[k] - 1, y + k - n, 2, 1); c.fillRect(x + hw + BS[k] - 1, y + k - n, 2, 1);
    }
  }
  // Lớp sáng bên trong vũng: hàng cao 2 điểm ảnh cho nhẹ
  function inner(c, x, y, rx, ry, col, t, id) {
    c.fillStyle = col;
    const n = Math.floor(ry);
    for (let dy = -n; dy < n; dy += 2) {
      const q = 1 - ((dy + 0.5) * (dy + 0.5)) / (ry * ry + 0.01);
      if (q <= 0) continue;
      const hw = Math.round(rx * Math.sqrt(q) + Math.sin(dy * 0.4 + t * 2.4 + id) * 1.6);
      if (hw > 0) c.fillRect(x - hw, y + dy, hw * 2, 2);
    }
  }
  function pool(c, z) {
    const t = S.t, id = z.fxId || 1;
    const k = Math.max(0, Math.min(1, ((z.fxA || 0) - (z.fxD || 0)) / 0.22));
    if (k <= 0) return;
    const fade = Math.min(1, z.life / 0.45);
    const x = Math.round(z.x), y = Math.round(z.y);
    const rx = z.r * (1 - (1 - k) * (1 - k)) * (0.75 + 0.25 * fade), ry = rx * (G.ZK || 0.6);
    const foe = z.team !== 'player';
    if (z.rain) {
      // vòng ngắm của mưa tên: nét đứt xoay chậm
      const col = z.el ? pal(z.el).c2 : '#f1ead9';
      c.fillStyle = col;
      for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU + t * 1.5; if (i % 2) continue; c.fillRect(Math.round(x + Math.cos(a) * rx) - 2, Math.round(y + Math.sin(a) * ry), 4, 2); }
      p(c, x - 3, y, 7, 1, col); p(c, x, y - 2, 1, 5, col);
      ell(c, x, y, rx, ry, 'rgba(255,255,255,0.07)');
      return;
    }
    const key = z.heal ? 'heal' : z.el || 'none', C = POOLC[key];
    const dth = fade < 0.5;
    blob(c, x, y, rx, ry, C.base, t, id, foe ? C.rim : C.rimP, dth);
    if (rx > 6) inner(c, x, y, rx - 4, ry - 2.4, C.mid, t, id);
    if (foe) {
      // vũng của địch có thêm viền đỏ nhấp nháy để không lẫn với vũng của mình
      c.fillStyle = ((t * 6) | 0) % 2 ? 'rgba(255,58,34,0.9)' : 'rgba(255,58,34,0.5)';
      for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU + t * 0.8; c.fillRect(Math.round(x + Math.cos(a) * (rx + 3)) - 1, Math.round(y + Math.sin(a) * (ry + 2)), 2, 1); }
    }
    if (rx < 8) return;
    const n = Math.max(3, Math.min(7, (rx / 6) | 0));
    for (let i = 0; i < n; i++) {
      const a = hash(id + i * 3.7) * TAU, d = 0.2 + hash(id * 2 + i) * 0.6;
      const bx = x + Math.round(Math.cos(a) * rx * d), by = y + Math.round(Math.sin(a) * ry * d);
      const u = (t * (0.7 + hash(i + id) * 0.6) + hash(id + i * 9.1)) % 1;
      if (key === 'fire') {
        const h = 4 + Math.round((Math.sin(t * 11 + i * 2.3 + id) * 0.5 + 0.5) * 6);
        tongue(c, bx, by, h, i % 2 ? 1 : 2);
      } else if (key === 'ice') {
        // vệt sáng trôi trên mặt nước và gai băng ở mép
        p(c, bx - 3 + Math.round(u * 6), by, 4, 1, 'rgba(255,255,255,0.75)');
        if (i % 2 === 0) { const ex = x + Math.round(Math.cos(a) * rx), ey = y + Math.round(Math.sin(a) * ry); p(c, ex, ey - 3, 2, 3, '#bfeaff'); p(c, ex, ey - 5, 1, 2, '#ffffff'); }
      } else if (key === 'heal') {
        const tw = u < 0.5;
        p(c, bx - 1, by, 3, 1, tw ? '#ffffff' : '#a8f078'); p(c, bx, by - 1, 1, 3, tw ? '#ffffff' : '#a8f078');
      } else {
        // bong bóng phồng lên rồi vỡ
        if (u < 0.5) p(c, bx, by, 1, 1, C.rim);
        else if (u < 0.85) { p(c, bx - 1, by - 1, 3, 3, C.rim); p(c, bx, by, 1, 1, C.base); p(c, bx - 1, by - 1, 1, 1, '#ffffff'); }
        else { p(c, bx - 2, by - 1, 1, 1, C.rim); p(c, bx + 2, by - 1, 1, 1, C.rim); p(c, bx, by - 3, 1, 1, C.rim); }
      }
    }
  }
  function stepZones(W, dt, tick) {
    for (const z of W.zones) {
      if (z.wave) {
        if (!(z.wait > 0) && tick) for (let i = 0; i < 3; i++) {
          const top = R() < 0.5, yy = top ? rr(W.y0 - 6, z.g0) : rr(z.g1, W.y1 + 4);
          emit(5, z.x + rr(2, 8), yy, rr(20, 70), rr(-60, -10), rr(0.25, 0.45), RAMP.water, R() < 0.3 ? 2 : 1, 260, 0, yy + 6, 1);
        }
        continue;
      }
      if (!z.pool || z.t > 0) continue;
      if (!z.fxId) z.fxId = 1 + R() * 50;
      z.fxA = (z.fxA || 0) + dt;
      if (!tick || z.rain || z.fxA < (z.fxD || 0)) continue;
      const a = R() * TAU, d = Math.sqrt(R()) * 0.85, x = z.x + Math.cos(a) * z.r * d, y = z.y + Math.sin(a) * z.r * (G.ZK || 0.6) * d;
      if (z.heal) { if (R() < 0.6) emit(10, x, y - 2, 0, rr(-30, -16), rr(0.6, 1.0), RAMP.heal, 1, 0, 0, null, 1); }
      else if (z.el === 'fire') { if (R() < 0.6) emit(9, x, y, rr(-5, 5), rr(-50, -25), rr(0.3, 0.5), RAMP.fire, 3, -20, 0, null, 1); if (R() < 0.15) emit(2, x, y - 10, 0, -18, 0.6, RAMP.dark, 3, 0, 0, null, 1); }
      else if (z.el === 'ice') { if (R() < 0.3) emit(2, x, y - 1, rr(-8, 8), -4, rr(0.5, 0.8), RAMP.mist, 3, 0, 0, null, 0); if (R() < 0.2) emit(6, x, y - rr(0, 6), 0, 0, 0.3, RAMP.ice, 2, 0, 0, null, 1); }
      else { if (R() < 0.35) emit(11, x, y - 1, 0, rr(-20, -10), rr(0.4, 0.7), z.el ? RAMP.poison : RAMP.red, 2, 0, 0, null, 1); if (R() < 0.2) emit(2, x, y - 3, rr(-4, 4), rr(-12, -6), rr(0.5, 0.9), z.el ? RAMP.vapor : RAMP.dark, 3, 0, 0, null, 1); }
    }
  }
  // Sóng tràn của Ngư Tinh: tường nước có bọt ở mép trước, chừa khe an toàn
  function wave(c, z, W) {
    const t = S.t, x = Math.round(z.x), wait = z.wait > 0;
    const blink = ((t * 10) | 0) % 2;
    const col = (y0, y1) => {
      for (let y = Math.round(y0); y < y1; y += 3) {
        const h = Math.min(3, y1 - y);
        if (wait) { if (((y / 3) | 0) % 2 === blink) p(c, x - 5, y, 10, h, 'rgba(160,220,250,0.5)'); p(c, x - 5, y, 1, h, 'rgba(255,255,255,0.7)'); continue; }
        const o = Math.round(Math.sin(y * 0.21 + t * 12) * 2);
        p(c, x - 4 + o, y, 14, h, 'rgba(74,128,176,0.55)');
        p(c, x - 5 + o, y, 9, h, '#6aa8d0');
        p(c, x - 4 + o, y, 4, h, '#9fd0e8');
        p(c, x - 7 + o, y, 3, h, '#ffffff');
        if (((y / 3 + ((t * 8) | 0)) | 0) % 3 === 0) { p(c, x - 9 + o, y, 2, 1, '#e9f9ff'); p(c, x + 10 + o, y + 1, 3, 1, 'rgba(159,208,232,0.7)'); }
      }
    };
    col(W.y0 - 6, z.g0); col(z.g1, W.y1 + 7);
    // mép khe hở: chỗ đứng an toàn
    const g = wait ? (blink ? '#ffffff' : '#9fd0e8') : '#ffffff';
    p(c, x - 8, Math.round(z.g0) - 1, 16, 2, g); p(c, x - 8, Math.round(z.g1) - 1, 16, 2, g);
    if (wait) { p(c, x - 1, Math.round(z.g0) + 4, 2, Math.round(z.g1 - z.g0) - 8, 'rgba(120,255,160,0.25)'); }
  }
  // Vẽ một vùng. Trả về false nếu để art.js vẽ như cũ (vùng đỏ báo trước giữ nguyên cho dễ đọc).
  fx.zone = function (c, z, W) {
    if (G.noRender || !S) return false;
    try {
      if (z.wave) { wave(c, z, W); return true; }
      if (z.team === 'fx') { ring(c, z.x, z.y, z.r, z.r * (G.ZK || 0.6), 2, 'rgba(255,240,200,0.5)'); return true; }
      if (z.pool && z.shape === 'circle' && !(z.t > 0)) { pool(c, z); return true; }
    } catch (e) { fail(e); }
    return false;
  };

  // ---------- đòn đặc biệt và kỹ năng hero ----------
  const hand = (P) => { HAND.x = P.x + P.face * 7; HAND.y = P.y - 14; return HAND; };
  const HAND = { x: 0, y: 0 };
  api('dash', (P, type, el) => {
    const PL = pal(el), f = P.face;
    S.dash = 0.2;
    add({ ty: 'dashline', x: P.x, x1: P.x, y: P.y - 13, f, pl: PL, t: 0.4, spear: type === 'spear', P, ly: 1 });
    add({ ty: 'flash', x: P.x + f * 6, y: P.y - 13, r: 7, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
    for (let i = 0; i < 5; i++) emit(2, P.x - f * rr(0, 8), P.y + rr(-2, 2), -f * rr(30, 80), rr(-16, -4), rr(0.3, 0.5), RAMP.dust, 4, 0, 3, null, 1);
    kick(f * 2.5, 0); trauma(0.25);
  });
  api('slam', (P, el) => {
    slam(P.x, P.y, 46, el, 1.7);
    const PL = pal(el);
    addRing(P.x, P.y, 8, 58, 0.3, PL.c, 4, 0);
    addRing(P.x, P.y, 4, 58, 0.36, '#ffffff', 2, 0, 0.05);
    for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU + rr(-0.2, 0.2); add({ ty: 'crack', x: P.x + Math.cos(a) * 34, y: P.y + Math.sin(a) * 20, r: 9, t: 1.4, c: el ? PL.d : '#3a2e26', ly: 0, sd: R() * 100 }); }
    if (el === 'fire') for (let i = 0; i < 10; i++) { const a = R() * TAU; emit(9, P.x + Math.cos(a) * rr(10, 50), P.y + Math.sin(a) * rr(6, 30), 0, rr(-80, -40), rr(0.3, 0.6), RAMP.fire, 5, -20, 0, null, 1); }
    else if (el === 'ice') add({ ty: 'spikes', x: P.x, y: P.y, r: 44, t: 0.5, ly: 1, sd: R() * 50 });
    else if (el === 'poison') for (let i = 0; i < 10; i++) { const a = R() * TAU, v = rr(30, 90); emit(2, P.x, P.y - 4, Math.cos(a) * v, Math.sin(a) * v * 0.5, rr(0.5, 0.9), RAMP.vapor, 5, 0, 2, null, 1); }
    trauma(0.8); kick(0, 3); stop(70);
  });
  // Nung: vũ khí bắt lửa
  api('nung', (P) => {
    const h = hand(P);
    add({ ty: 'flash', x: h.x, y: h.y - 4, r: 11, t: 0.14, c: '#fff3b0', c2: '#ff7a2a', ly: 1, sq: true });
    addRing(P.x, P.y, 4, 26, 0.3, '#ff7a2a', 3, 0);
    addRing(h.x, h.y - 4, 2, 16, 0.22, '#ffd23f', 2, 1);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; emit(9, h.x + Math.cos(a) * 3, h.y - 4 + Math.sin(a) * 3, Math.cos(a) * rr(30, 70), Math.sin(a) * rr(20, 50) - 40, rr(0.3, 0.6), RAMP.fire, R() < 0.5 ? 6 : 4, -40, 2, null, 1); }
    for (let i = 0; i < 8; i++) emit(0, h.x, h.y - 4, rr(-90, 90), rr(-170, -60), rr(0.4, 0.8), RAMP.ember, 1, 240, 0, P.y + rr(-3, 5), 1);
    add({ ty: 'pillar', x: P.x, y: P.y, w: 7, h: 44, t: 0.3, ly: 1 });
    trauma(0.3);
  });
  api('trapPlace', (x, y, el) => {
    const PL = pal(el);
    addRing(x, y, 2, 14, 0.2, PL.c2, 2, 0);
    for (let i = 0; i < 5; i++) emit(2, x + rr(-6, 6), y, rr(-30, 30), rr(-14, -4), rr(0.25, 0.45), RAMP.dust, 3, 0, 3, null, 1);
    emit(6, x, y - 3, 0, 0, 0.3, RAMP.steel, 4, 0, 0, null, 1);
  });
  api('trapSnap', (pr, e) => {
    const PL = pal(pr.el);
    add({ ty: 'flash', x: pr.x, y: pr.y - 4, r: 8, t: 0.1, c: '#ffffff', c2: PL.c2, ly: 1 });
    addRing(pr.x, pr.y, 3, 18, 0.2, PL.c2, 2, 0);
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + rr(-1.3, 1.3), v = rr(80, 170); streak(pr.x, pr.y - 3, Math.cos(a) * v, Math.sin(a) * v, rr(0.12, 0.22), RAMP.steel, 1, 6, 300, 2); }
    for (let i = 0; i < 4; i++) emit(8, pr.x + rr(-5, 5), pr.y - 2, rr(-60, 60), rr(-130, -60), 0.6, RAMP.steel, 2, 420, 0, pr.y + rr(-1, 4), 1);
    trauma(0.3); stop(70); kick(0, 2);
    if (e) { e.fxK = 0.13; e.fxD = 0; }
  });
  // Bình thuốc của Thầy Lang: bay theo đường cong rồi vỡ, vũng loang ra sau đó
  api('bottle', (P, z) => {
    z.fxD = 0.24;
    add({ ty: 'bottle', x: P.x + P.face * 6, y: P.y, tx: z.x, ty2: z.y, t: 0.24, ly: 1, r: z.r });
  });
  function bottleBreak(o) {
    const x = o.tx, y = o.ty2;
    add({ ty: 'flash', x, y: y - 3, r: 8, t: 0.1, c: '#ffffff', c2: '#c2f58a', ly: 1, sq: true });
    addRing(x, y, 4, o.r, 0.3, '#c2f58a', 3, 0);
    for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + rr(-1.4, 1.4), v = rr(60, 160); emit(5, x, y - 3, Math.cos(a) * v, Math.sin(a) * v, rr(0.4, 0.8), RAMP.poison, 2, 400, 0, y + rr(-10, 12), 1); }
    for (let i = 0; i < 5; i++) emit(8, x, y - 3, rr(-70, 70), rr(-140, -60), 0.6, ['#e9f9ff', '#bfeaff', '#7fd4ff'], 2, 420, 0, y + rr(-5, 8), 1);
    for (let i = 0; i < 6; i++) emit(10, x + rr(-o.r, o.r) * 0.6, y + rr(-o.r, o.r) * 0.3, 0, rr(-40, -20), rr(0.5, 0.9), RAMP.heal, 1, 0, 0, null, 1);
    puffs(x, y - 4, 5, RAMP.vapor, 40, 4, 6);
    trauma(0.15);
  }
  // Gồng: vòng sóng vàng đẩy lùi, sau đó hào quang giữ suốt thời gian hiệu lực
  api('gong', (P) => {
    addRing(P.x, P.y, 6, 60, 0.3, '#ffd23f', 4, 0);
    addRing(P.x, P.y, 3, 60, 0.38, '#fff3b0', 2, 0, 0.06);
    addRing(P.x, P.y - 14, 4, 26, 0.22, '#fff3b0', 2, 1);
    add({ ty: 'flash', x: P.x, y: P.y - 14, r: 12, t: 0.12, c: '#ffffff', c2: '#ffd23f', ly: 1, sq: true });
    for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; streak(P.x + Math.cos(a) * 8, P.y - 6 + Math.sin(a) * 5, Math.cos(a) * 200, Math.sin(a) * 120, 0.22, RAMP.gold, i % 2 ? 2 : 1, 10, 0, 3); }
    for (let i = 0; i < 10; i++) { const sd = i % 2 ? 1 : -1; emit(2, P.x + sd * rr(4, 14), P.y + rr(-3, 3), sd * rr(50, 120), rr(-16, -4), rr(0.3, 0.6), RAMP.dust, 4, 0, 3, null, 1); }
    trauma(0.6); stop(60);
  });
  api('dodge', (P) => {
    S.dodge = 0.27; S.ghostT = 0;
    for (let i = 0; i < 6; i++) emit(2, P.x - P.ddx * rr(0, 6), P.y + rr(-2, 2), -P.ddx * rr(20, 70) + rr(-10, 10), rr(-22, -4), rr(0.25, 0.5), RAMP.dust, R() < 0.4 ? 4 : 3, 0, 3, null, 1);
    for (let i = 0; i < 3; i++) streak(P.x, P.y - rr(4, 22), -P.ddx * rr(40, 90), -P.ddy * 40, 0.16, RAMP.white, 1, rr(8, 14), 0, 2);
  });
  api('potion', (P) => {
    addRing(P.x, P.y, 3, 16, 0.3, '#ff9a8a', 2, 0);
    for (let i = 0; i < 10; i++) emit(10, P.x + rr(-9, 9), P.y - rr(0, 24), 0, rr(-44, -20), rr(0.5, 0.9), RAMP.hurt, 1, 0, 0, null, 1);
    for (let i = 0; i < 5; i++) emit(6, P.x + rr(-10, 10), P.y - rr(4, 28), 0, -10, rr(0.3, 0.5), RAMP.hurt, 2, 0, 0, null, 1);
  });
  api('swap', (P, el) => {
    const h = hand(P), PL = pal(el);
    addRing(h.x, h.y, 2, 11, 0.16, PL.c2, 2, 1);
    for (let i = 0; i < 5; i++) emit(6, h.x + rr(-6, 6), h.y + rr(-8, 6), 0, 0, rr(0.15, 0.3), PL.ramp, 2, 0, 0, null, 1);
  });

  // ---------- người chơi trúng đòn ----------
  api('hurt', (P, amt, el, blocked) => {
    const PL = el ? pal(el) : PAL.foe;
    S.hurt = 0.3;
    add({ ty: 'flash', x: P.x, y: P.y - 14, r: 8, t: 0.1, c: '#ffffff', c2: '#ff6a5a', ly: 1 });
    for (let i = 0; i < 7; i++) { const a = R() * TAU, v = rr(60, 140); streak(P.x, P.y - 14, Math.cos(a) * v, Math.sin(a) * v * 0.7, rr(0.14, 0.26), i % 2 ? RAMP.hurt : PL.ramp, 1, 6, 150, 3); }
    if (blocked) { addRing(P.x, P.y - 14, 5, 18, 0.18, '#ffd23f', 2, 1); for (let i = 0; i < 5; i++) emit(6, P.x + rr(-10, 10), P.y - rr(4, 26), 0, 0, 0.25, RAMP.gold, 3, 0, 0, null, 1); }
    num(P.x, P.y - 38, '-' + Math.round(amt), { col: '#ff6a5a', size: 10, pop: 1, edge: 'rgba(60,0,0,0.95)', kind: 3 });
    trauma(0.45); kick(rr(-2, 2), 2); stop(60);
  });

  // ---------- dấu ấn và tiến hoá vũ khí ----------
  api('marks', (el, n) => { S.pend = { el, n, t: 0.05 }; });
  api('markOrbs', (e) => {
    const m = S.pend;
    if (!m) return;
    S.pend = null;
    const k = e.isBoss ? 7 : Math.max(1, Math.min(4, Math.round(m.n / 1.2)));
    const hh = Math.min(30, (e.h || 24) * (e.scale || 1) * 0.5);
    for (let i = 0; i < k; i++) {
      const a = -Math.PI / 2 + rr(-1.5, 1.5), v = rr(70, 130);
      add({ ty: 'orb', x: e.x + rr(-4, 4), y: e.y - hh + rr(-4, 4), vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 1.4, pl: pal(m.el), ly: 1, d: i * 0.05, el: m.el, n: i === 0 ? m.n : 0, big: e.isBoss, px: 0, py: 0 });
    }
  });
  function markText(P, el, n) {
    if (n >= 0.5) num(P.x, P.y - 42, '+' + Math.round(n) + ' ' + G.EL[el].name, { col: G.EL[el].col, size: 8.5, pop: 0.9, t: 0.95, vx: 0, vy: -20, kind: 3 });
  }
  function orbArrive(o) {
    const P = S.W.P, h = hand(P);
    addRing(h.x, h.y, 2, o.big ? 14 : 9, 0.18, o.pl.c2, 2, 1);
    add({ ty: 'flash', x: h.x, y: h.y, r: o.big ? 6 : 4, t: 0.08, c: '#ffffff', c2: o.pl.c2, ly: 1 });
    for (let i = 0; i < 4; i++) emit(6, h.x + rr(-6, 6), h.y + rr(-7, 5), 0, -8, rr(0.2, 0.4), o.pl.ramp, 2, 0, 0, null, 1);
    S.pulse = 0.25; S.pulseEl = o.el;
    if (o.n) markText(P, o.el, o.n);
  }
  api('evolve', (el, stage) => {
    const P = S.W.P, PL = pal(el), x = P.x, y = P.y;
    S.flash = 0.45; S.flashCol = el === 'fire' ? '255,170,80' : el === 'poison' ? '150,240,100' : '170,225,255';
    add({ ty: 'beam', x, y, t: 0.9, pl: PL, ly: 1, P });
    addRing(x, y, 6, 70, 0.5, PL.c, 5, 0);
    addRing(x, y, 4, 54, 0.44, PL.c2, 3, 0, 0.08);
    addRing(x, y, 2, 38, 0.4, '#ffffff', 2, 0, 0.16);
    addRing(x, y - 14, 4, 30, 0.3, '#ffffff', 2, 1);
    add({ ty: 'flash', x, y: y - 14, r: 16, t: 0.16, c: '#ffffff', c2: PL.c2, ly: 1, sq: true });
    const n = 12 + stage * 4;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; streak(x + Math.cos(a) * 6, y - 14 + Math.sin(a) * 5, Math.cos(a) * rr(180, 260), Math.sin(a) * rr(130, 190), rr(0.25, 0.4), PL.ramp, i % 2 ? 2 : 1, rr(10, 18), 0, 2.5); }
    elemBits(el, x, y - 14, 10, 1, 90); elemBits(el, x, y - 14, 10, -1, 90);
    S.rise = 1.3; S.riseEl = el;
    trauma(0.6); stop(110);
  });

  // ---------- cái chết của quái và trùm ----------
  api('death', (e, o) => {
    const el = e.lastEl || (o && o.el) || e.el || null;
    const snap = Object.assign({}, e);
    snap.st = G.st0 ? G.st0() : { fire: 0, poisonN: 0, iceN: 0, frozen: 0, stun: 0, root: 0 };
    snap.dead = false; snap.wind = 0; snap.flash = 0.09; snap.moving = false; snap.dying = 0; snap.resist = null; snap.fxK = 0; snap.hidden = false;
    const B = bodyOf(e), x = e.x, y = e.y, PL = pal(el);
    const skin = e.skin && e.skin[0] ? rampOf(e.skin[0]) : RAMP.steel;
    if (e.isBoss) {
      S.dying.push({ e: snap, t: 1.25, t0: 1.25, boss: true, mini: e.kind === 'mini', pl: PL, skin, nb: 0, hh: Math.min(110, (e.h || 40) * (e.scale && e.kind !== 'mini' ? e.scale : 1)), w: Math.max(14, e.r) });
      S.flash = 0.5; S.flashCol = '255,255,255';
      trauma(1); stop(120);
      return;
    }
    if (S.dying.length >= 16) S.dying.shift();
    S.dying.push({ e: snap, t: 0.42, t0: 0.42, boss: false, ill: !!e.illusion, pl: PL });
    if (e.st && e.st.frozen > 0) shatter(e);
    // khói theo hệ và mảnh vụn rơi
    for (let i = 0; i < 6; i++) emit(2, x + rr(-B.w, B.w), y - rr(2, B.h), rr(-24, 24), rr(-34, -8), rr(0.35, 0.65), el ? PL.puff : RAMP.dust, R() < 0.4 ? 5 : 4, 0, 2, null, 1);
    for (let i = 0; i < 6; i++) emit(8, x + rr(-B.w, B.w), y - rr(4, B.h), rr(-70, 70), rr(-130, -40), rr(0.5, 0.85), i % 2 ? skin : PL.ramp, R() < 0.4 ? 3 : 2, 420, 0, y + rr(-2, 5), 1);
    for (let i = 0; i < 4; i++) { const a = R() * TAU; streak(x, y - B.h * 0.5, Math.cos(a) * 140, Math.sin(a) * 100, 0.18, PL.ramp, 1, 7, 0, 3); }
    if (e.illusion) puffs(x, y - 14, 8, RAMP.steam, 50, 4, 10);
    if (e.role === 'elite') { addRing(x, y, 4, 28, 0.3, PL.c2, 3, 0); trauma(0.4); }
  });
  function stepDying(dt) {
    for (let i = S.dying.length - 1; i >= 0; i--) {
      const d = S.dying[i];
      d.t -= dt;
      if (d.t <= 0) {
        if (d.boss) bossEnd(d);
        S.dying.splice(i, 1);
        continue;
      }
      const k = 1 - d.t / d.t0;
      d.e.dying = k;
      d.e.t += dt * 0.3;
      if (d.e.flash > 0) d.e.flash -= dt;
      if (!d.boss) continue;
      // chuỗi nổ nhỏ chạy khắp thân trùm, càng về cuối càng dồn dập
      d.nb -= dt;
      if (d.nb <= 0) {
        d.nb = 0.16 - 0.09 * k;
        const x = d.e.x + rr(-d.w, d.w), y = d.e.y - rr(4, d.hh);
        add({ ty: 'flash', x, y, r: rr(6, 11), t: 0.1, c: '#ffffff', c2: d.pl.c2, ly: 1, sq: R() < 0.5 });
        addRing(x, y, 2, rr(10, 18), 0.2, d.pl.c2, 2, 1);
        for (let j = 0; j < 4; j++) { const a = R() * TAU, v = rr(60, 150); emit(8, x, y, Math.cos(a) * v, Math.sin(a) * v - 50, rr(0.5, 0.9), j % 2 ? d.skin : d.pl.ramp, R() < 0.4 ? 3 : 2, 400, 0, d.e.y + rr(-3, 6), 1); }
        for (let j = 0; j < 2; j++) emit(2, x, y, rr(-20, 20), rr(-30, -10), rr(0.4, 0.7), RAMP.smoke, 5, 0, 2, null, 1);
        d.e.flash = 0.05;
        trauma(0.35 + 0.3 * k);
      }
    }
  }
  function bossEnd(d) {
    const x = d.e.x, y = d.e.y - d.hh * 0.4;
    S.flash = 0.6; S.flashCol = '255,255,255';
    addRing(x, d.e.y, 8, 110, 0.6, d.pl.c2, 6, 0);
    addRing(x, d.e.y, 4, 80, 0.5, '#ffffff', 3, 0, 0.08);
    addRing(x, y, 6, 50, 0.35, '#ffffff', 3, 1);
    add({ ty: 'flash', x, y, r: 26, t: 0.2, c: '#ffffff', c2: d.pl.c2, ly: 1, sq: true });
    for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU, v = rr(160, 300); streak(x, y, Math.cos(a) * v, Math.sin(a) * v * 0.7, rr(0.3, 0.5), i % 2 ? d.pl.ramp : RAMP.white, i % 3 ? 1 : 2, rr(10, 20), 0, 2.5); }
    for (let i = 0; i < 22; i++) { const a = R() * TAU, v = rr(60, 200); emit(8, x + rr(-d.w, d.w), y + rr(-d.hh, d.hh) * 0.4, Math.cos(a) * v, Math.sin(a) * v - 90, rr(0.7, 1.2), i % 2 ? d.skin : d.pl.ramp, R() < 0.5 ? 3 : 2, 420, 0, d.e.y + rr(-6, 10), 1); }
    for (let i = 0; i < 16; i++) { const a = R() * TAU, v = rr(30, 110); emit(2, x, y, Math.cos(a) * v, Math.sin(a) * v * 0.6 - 12, rr(0.6, 1.2), i % 2 ? RAMP.smoke : d.pl.puff, R() < 0.5 ? 7 : 5, -8, 2, null, 1); }
    for (let i = 0; i < 12; i++) emit(6, x + rr(-50, 50), y + rr(-40, 30), 0, -10, rr(0.3, 0.9), RAMP.gold, 4, 0, 0, null, 1);
    trauma(1); kick(0, 3);
  }

  // ---------- điểm nhấn nhỏ ----------
  api('sparkle', (x, y, col, n) => {
    const r = rampOf(col || '#ffd23f');
    addRing(x, y, 3, 20, 0.3, r[1], 2, 0);
    for (let i = 0; i < (n || 12); i++) emit(6, x + rr(-12, 12), y - rr(0, 26), 0, rr(-30, -8), rr(0.3, 0.8), r, R() < 0.4 ? 4 : 2, 0, 0, null, 1);
    for (let i = 0; i < 6; i++) emit(1, x + rr(-8, 8), y - rr(2, 14), rr(-20, 20), rr(-70, -30), rr(0.4, 0.7), r, 2, 60, 0, null, 1);
  });
  // G.burst cũ: toé hạt tròn đều, nay dùng chung kho hạt mới
  api('burst', (x, y, col, n, sp) => {
    const r = rampOf(col);
    n = Math.min(n, 30); sp = sp || 50;
    for (let i = 0; i < n; i++) {
      const a = R() * TAU, v = rr(sp * 0.25, sp);
      if (i % 3 === 0) streak(x, y - 10, Math.cos(a) * v * 1.6, Math.sin(a) * v - 20, rr(0.15, 0.3), r, 1, 6, 120, 2);
      else emit(i % 3 === 1 ? 1 : 0, x, y - 10, Math.cos(a) * v, Math.sin(a) * v * 0.6 - 20, rr(0.25, 0.6), r, i % 3 === 1 ? 3 : R() < 0.3 ? 2 : 1, 90, 0, null, 1);
    }
    if (n >= 10) { addRing(x, y, 3, Math.min(40, sp * 0.4), 0.22, r[1], 2, 0); add({ ty: 'flash', x, y: y - 10, r: 5, t: 0.08, c: '#ffffff', c2: r[1], ly: 1 }); }
  });

  // ---------- cập nhật ----------
  function stepFx(dt) {
    const E = S.E;
    let w = 0;
    for (let i = 0; i < E.length; i++) {
      const o = E[i];
      if (o.d > 0) { o.d -= dt; E[w++] = o; continue; }
      o.t -= dt;
      if (o.ty === 'orb') {
        const h = hand(S.W.P), dx = h.x - o.x, dy = h.y - o.y, d = Math.hypot(dx, dy) || 1, age = o.t0 - o.t;
        if (age > 0.16) {
          const sp = 180 + age * 520, k = Math.min(1, dt * (5 + age * 14));
          o.vx += ((dx / d) * sp - o.vx) * k; o.vy += ((dy / d) * sp - o.vy) * k;
        } else { o.vx *= 1 - dt * 3; o.vy *= 1 - dt * 3; }
        o.px = o.x; o.py = o.y;
        o.x += o.vx * dt; o.y += o.vy * dt;
        emit(1, o.x, o.y, rr(-8, 8), rr(-8, 8), 0.22, o.pl.ramp, o.big ? 3 : 2, 0, 0, null, 1);
        if ((d < 8 && age > 0.16) || o.t <= 0) { orbArrive(o); o.t = 0; }
      } else if (o.ty === 'bottle' && o.t <= 0) bottleBreak(o);
      else if (o.ty === 'dashline' && o.P.dashT > 0) o.x1 = o.P.x;
      if (o.t > 0) E[w++] = o;
    }
    E.length = w;
  }
  function stepNums(dt) {
    const N = S.N;
    let w = 0;
    for (let i = 0; i < N.length; i++) {
      const n = N[i];
      if (n.d > 0) { n.d -= dt; N[w++] = n; continue; }
      n.t -= dt;
      if (n.t0 - n.t > 0.1) { n.x += n.vx * dt; n.y += n.vy * dt; n.vy += 46 * dt; n.vx *= 1 - dt * 2; }
      if (n.t > 0) N[w++] = n;
    }
    N.length = w;
  }
  function stepShake(dt, W) {
    // chỗ khác trong game vẫn đặt W.shake: đổi thành độ rung của hệ mới
    if (W.shake > S.shakeSeen + 0.004) trauma(Math.min(1, W.shake * 1.7));
    S.shakeSeen = W.shake > 0 ? W.shake : 0;
    S.trauma = Math.max(0, S.trauma - dt * 1.9);
    const a = S.trauma * S.trauma;
    S.sx = Math.round(S.kx + (R() * 2 - 1) * 4 * a);
    S.sy = Math.round(S.ky + (R() * 2 - 1) * 3 * a);
    S.kx *= -0.55; S.ky *= -0.55;
    if (Math.abs(S.kx) < 0.4) S.kx = 0;
    if (Math.abs(S.ky) < 0.4) S.ky = 0;
  }
  function legacy(W) {
    // chữ và hạt do mã cũ đẩy thẳng vào mảng của thế giới: chuyển sang hệ mới
    if (W.texts.length) { for (const o of W.texts) num(o.x, o.y, o.s, { col: o.col, size: o.size }); W.texts.length = 0; }
    if (W.parts.length) { for (const o of W.parts) emit(0, o.x, o.y, o.vx, o.vy, o.t, rampOf(o.col), o.s, 90, 0, null, 1); W.parts.length = 0; }
  }
  function stepPlayer(W, P, dt, tick) {
    const moving = P.moving && !(P.dodgeT > 0) && !(P.dashT > 0) && !P.dead;
    if (moving) {
      S.stepT -= dt;
      if (S.stepT <= 0) {
        S.stepT = 0.21;
        emit(2, P.x - P.face * 3, P.y + 1, -P.face * rr(6, 18), rr(-10, -3), rr(0.25, 0.4), RAMP.dust, 2, 0, 2, null, 0);
        if (R() < 0.5) emit(2, P.x - P.face * 5 + rr(-2, 2), P.y, -P.face * rr(4, 12), rr(-6, -2), rr(0.2, 0.3), RAMP.dust, 2, 0, 2, null, 0);
      }
    } else S.stepT = 0.05;
    // bóng mờ khi lăn né và lướt
    const fast = P.dodgeT > 0 || P.dashT > 0;
    if (fast && G.heroArgs) {
      S.ghostT -= dt;
      if (S.ghostT <= 0) {
        S.ghostT = P.dashT > 0 ? 0.04 : 0.065;
        const a = G.heroArgs(P);
        a.p = Object.assign({}, P); a.flash = false;
        if (S.ghosts.length >= 5) S.ghosts.shift();
        S.ghosts.push({ a, t: 0.24, t0: 0.24 });
      }
      if (P.dashT > 0 && tick) for (let i = 0; i < 2; i++) streak(P.x - P.face * 4, P.y - rr(3, 24), -P.face * rr(60, 140), 0, rr(0.12, 0.2), RAMP.white, 1, rr(8, 16), 0, 2);
    } else S.ghostT = 0;
    for (let i = S.ghosts.length - 1; i >= 0; i--) { S.ghosts[i].t -= dt; if (S.ghosts[i].t <= 0) S.ghosts.splice(i, 1); }
    if (P.dead) return;
    // hào quang quanh tay cầm vũ khí: mốc 2-3 hoặc đang phủ hệ
    const w = G.curW(P);
    if (w && tick) {
      const st = G.wStage(w), el = G.activeEl(P, w), coat = P.coats[w.id] && P.coats[w.id].t > 0;
      if (el && (st >= 2 || coat)) {
        const h = hand(P), k = st >= 3 ? 0.9 : coat ? 0.7 : 0.45;
        if (R() < k) {
          const x = h.x + rr(-3, 5) * P.face, y = h.y + rr(-9, 3);
          if (el === 'fire') emit(R() < 0.6 ? 9 : 0, x, y, rr(-6, 6), rr(-40, -18), rr(0.25, 0.45), R() < 0.6 ? RAMP.fire : RAMP.ember, 2, -10, 0, null, 1);
          else if (el === 'poison') { if (R() < 0.5) emit(5, x, y, 0, 6, 0.55, RAMP.poison, 1, 200, 0, P.y + rr(-1, 2), 1); else emit(11, x, y, rr(-3, 3), rr(-18, -8), 0.5, RAMP.poison, 2, 0, 0, null, 1); }
          else emit(R() < 0.5 ? 6 : 0, x, y, rr(-4, 4), R() < 0.5 ? 0 : 14, rr(0.3, 0.5), RAMP.ice, R() < 0.5 ? 2 : 1, 0, 0, null, 1);
        }
      }
    }
    if (P.gongT > 0) {
      S.gong -= dt;
      if (S.gong <= 0) { S.gong = 0.45; addRing(P.x, P.y, 6, 20, 0.4, 'rgba(255,210,63,0.8)', 2, 0); }
      if (tick && R() < 0.7) emit(R() < 0.5 ? 6 : 0, P.x + rr(-11, 11), P.y - rr(0, 10), 0, rr(-50, -24), rr(0.4, 0.7), RAMP.gold, R() < 0.5 ? 2 : 1, 0, 0, null, 1);
    } else S.gong = 0;
    if (S.rise > 0) {
      S.rise -= dt;
      const r = pal(S.riseEl).ramp;
      for (let i = 0; i < 2; i++) emit(R() < 0.3 ? 6 : 1, P.x + rr(-16, 16), P.y - rr(-2, 10), 0, rr(-80, -40), rr(0.4, 0.8), r, R() < 0.3 ? 3 : 2, 0, 0, null, 1);
    }
    if (S.pulse > 0) S.pulse -= dt;
    if (S.pend) { S.pend.t -= dt; if (S.pend.t <= 0) { markText(P, S.pend.el, S.pend.n); S.pend = null; } }
  }
  function stepRoom(W, tick) {
    for (const pr of W.props) {
      if (pr.act && pr.used && !pr.fxU) { pr.fxU = 1; if (pr.type === 'chest' || pr.type === 'altar') fx.sparkle(pr.x, pr.y, pr.type === 'altar' ? '#b46aff' : '#ffd23f', 16); }
      else if (tick && pr.type === 'chest' && !pr.used && R() < 0.12) emit(6, pr.x + rr(-10, 10), pr.y - rr(2, 16), 0, -6, rr(0.3, 0.6), RAMP.gold, R() < 0.4 ? 3 : 2, 0, 0, null, 1);
      else if (tick && pr.type === 'trap' && R() < 0.06) emit(6, pr.x + rr(-6, 6), pr.y - 2, 0, 0, 0.25, pr.el ? pal(pr.el).ramp : RAMP.steel, 2, 0, 0, null, 1);
    }
    if (W.cleared && !S.cleared && W.waves && W.waves.length) {
      // dọn sạch phòng: lấp lánh vàng chạy khắp sân và một dòng chữ ngắn
      for (let i = 0; i < 26; i++) { const o = emit(6, rr(W.x0, W.x1), rr(W.y0, W.y1), 0, rr(-34, -12), rr(0.5, 1.1), RAMP.gold, R() < 0.4 ? 4 : 2, 0, 0, null, 1); o.t0 = o.t; }
      addRing(W.P.x, W.P.y, 6, 90, 0.6, 'rgba(255,210,63,0.8)', 3, 0);
      num(W.cam + G.W / 2, 112, 'Sạch bóng quái!', { col: '#ffd23f', size: 12, pop: 1.4, t: 1.5, vx: 0, vy: -6, edge: 'rgba(90,40,0,0.95)', kind: 2 });
    }
    S.cleared = !!W.cleared;
  }
  function step(dt, frozen) {
    const W = S.W, P = W.P;
    legacy(W);
    stepShake(dt, W);
    stepNums(dt);
    if (S.hurt > 0) S.hurt -= dt;
    if (S.flash > 0) S.flash -= dt;
    if (S.stopGap > 0 && !frozen) S.stopGap -= dt;
    if (frozen) { updParts(dt * 0.3); return; }
    S.t += dt;
    S.emT -= dt;
    const tick = S.emT <= 0;
    if (tick) S.emT = 0.07;
    updParts(dt);
    stepFx(dt);
    stepDying(dt);
    stepProjs(W, dt);
    stepZones(W, dt, tick);
    for (const e of W.ents) { edges(e); if (tick) stepStatus(e); }
    if (W.boss && !W.boss.dead) { edges(W.boss); if (tick) stepStatus(W.boss); }
    if (tick && !P.dead) stepStatus(P);
    stepPlayer(W, P, dt, tick);
    stepRoom(W, tick);
    if (fx.heStep) fx.heStep(W, dt, tick); // hiệu ứng theo hệ và theo lối đánh (js/fx_he.js)
  }
  // Gọi cuối mỗi lần cập nhật thế giới
  fx.update = function (dt) {
    if (G.noRender) return;
    try { if (sync()) step(dt, false); } catch (e) { fail(e); }
  };

  // ---------- vẽ các hiệu ứng có hình riêng ----------
  function drawFx(c, ly) {
    const E = S.E;
    for (let i = 0; i < E.length; i++) {
      const o = E[i];
      if (o.ly !== ly || o.d > 0) continue;
      const k = 1 - o.t / o.t0, x = Math.round(o.x), y = Math.round(o.y);
      switch (o.ty) {
        case 'ring': {
          const e = 1 - (1 - k) * (1 - k), r = o.r0 + (o.r1 - o.r0) * e;
          ring(c, x, y, r, ly === 0 ? r * (G.ZK || 0.6) : r * 0.85, Math.max(1, Math.round(o.th * (1 - k * 0.8))), o.c, k > 0.6);
          break;
        }
        case 'flash': {
          const r = o.r * (k < 0.35 ? 0.7 + k : 1.05 - k * 0.6);
          star(c, x, y, r, o.c2, null);
          if (o.sq) { const h = Math.round(r * 0.55); p(c, x - h, y - h, h * 2 + 1, h * 2 + 1, o.c2); const d = Math.round(r * 0.75); p(c, x - d, y - d, 2, 2, o.c2); p(c, x + d - 1, y - d, 2, 2, o.c2); p(c, x - d, y + d - 1, 2, 2, o.c2); p(c, x + d - 1, y + d - 1, 2, 2, o.c2); }
          if (k < 0.7) star(c, x, y, r * 0.5, o.c, null);
          break;
        }
        case 'cut': {
          const q = o.up ? -1 : 1, a = Math.min(1, k * 3), b = Math.max(0, (k - 0.4) / 0.6);
          const x0 = x - o.f * o.r, y0 = y - q * o.r * 0.7, x1 = x + o.f * o.r, y1 = y + q * o.r * 0.7;
          line(c, Math.round(x0 + (x1 - x0) * b), Math.round(y0 + (y1 - y0) * b), Math.round(x0 + (x1 - x0) * a), Math.round(y0 + (y1 - y0) * a), o.c, 2);
          if (k < 0.6) line(c, Math.round(x0 + (x1 - x0) * (b + 0.15)), Math.round(y0 + (y1 - y0) * (b + 0.15)), Math.round(x0 + (x1 - x0) * a * 0.85), Math.round(y0 + (y1 - y0) * a * 0.85), '#ffffff', 1);
          break;
        }
        case 'cres': {
          // đầu vệt chạy trước, đuôi đuổi theo; càng về cuối càng mỏng rồi thưa điểm ảnh
          let hi = Math.min(1, k * 2.6 + 0.15), lo = Math.max(0, k * 1.9 - 0.75);
          if (o.rev) { const t = lo; lo = 1 - hi; hi = 1 - t; }
          const thin = k < 0.4 ? 1 : k < 0.7 ? 1.05 : 1.1, dth = k > 0.72;
          const ox = -o.f * o.off, PL = o.pl, bk = o.back || 0;
          if (o.big || o.st >= 3) crescent(c, x - o.f, y, o.ra + 2, o.rb + 2, ox - o.f, o.oy, thin, PL.d, lo, hi, o.vert, dth, o.f, bk);
          crescent(c, x, y, o.ra, o.rb, ox, o.oy, thin, PL.c, lo, hi, o.vert, dth, o.f, bk);
          if (k < 0.75) crescent(c, x + o.f, y, o.ra - 1, o.rb - 1, ox * 0.62, o.oy * 0.7, thin, PL.c2, lo, hi, o.vert, false, o.f, bk);
          if (k < 0.5) crescent(c, x + o.f, y, o.ra - 1, o.rb - 2, ox * 0.3, o.oy * 0.4, 1, '#ffffff', lo + 0.1, hi, o.vert, false, o.f, bk);
          break;
        }
        case 'thrust': {
          const L = o.len * Math.min(1, k * 4 + 0.3), s0 = o.len * Math.max(0, (k - 0.35) / 0.65), PL = o.pl, f = o.f;
          const seg = (a, b, h, col, dth) => { if (b <= a) return; const xa = f > 0 ? x + a : x - b; if (dth) { for (let q = 0; q < b - a; q += 2) p(c, Math.round(xa + q), y - (h >> 1), 1, h, col); } else p(c, Math.round(xa), y - (h >> 1), Math.round(b - a), h, col); };
          seg(s0, L, o.big ? 5 : 3, PL.d, k > 0.6);
          seg(s0 + (L - s0) * 0.3, L, o.big ? 3 : 3, PL.c, k > 0.75);
          seg(s0 + (L - s0) * 0.15, L + 2, 1, k < 0.6 ? '#ffffff' : PL.c2, false);
          if (k < 0.65) { const tx = x + f * L; star(c, tx, y, (o.big ? 7 : 5) * (1 - k), PL.c2, '#ffffff'); p(c, tx - f * 6, y - 3, 3, 1, PL.c2); p(c, tx - f * 6, y + 3, 3, 1, PL.c2); }
          break;
        }
        case 'crack': {
          const len = k > 0.75 ? 1 - (k - 0.75) * 3 : Math.min(1, k * 14 + 0.3);
          for (let j = 0; j < 5; j++) {
            const a = (j / 5) * TAU + hash(o.sd + j) * 1.1, L = o.r * (0.55 + hash(o.sd + j * 3) * 0.45) * len;
            const mx = x + Math.cos(a) * L * 0.5, my = y + Math.sin(a) * L * 0.3, bend = (hash(o.sd + j * 7) - 0.5) * 0.9;
            line(c, x, y, Math.round(mx), Math.round(my), o.c, 1);
            line(c, Math.round(mx), Math.round(my), Math.round(mx + Math.cos(a + bend) * L * 0.5), Math.round(my + Math.sin(a + bend) * L * 0.3), o.c, 1);
          }
          p(c, x - 1, y - 1, 3, 2, o.c);
          break;
        }
        case 'scorch': {
          const a = k > 0.7 ? (1 - k) / 0.3 : 1;
          ell(c, x, y, o.r, o.r * 0.6, 'rgba(26,16,12,' + (0.42 * a).toFixed(2) + ')');
          ell(c, x, y, o.r * 0.55, o.r * 0.33, 'rgba(16,10,8,' + (0.35 * a).toFixed(2) + ')');
          if (k < 0.5) for (let j = 0; j < 4; j++) if (((S.t * 8 + j * 1.7) | 0) % 3) p(c, x + Math.round((hash(o.r + j) - 0.5) * o.r * 1.4), y + Math.round((hash(o.r + j * 5) - 0.5) * o.r * 0.7), 1, 1, j % 2 ? '#ff7a2a' : '#ffd23f');
          break;
        }
        case 'spikes': {
          const g = k < 0.2 ? k / 0.2 : k > 0.7 ? (1 - k) / 0.3 : 1;
          for (let j = 0; j < 9; j++) {
            const a = (j / 9) * TAU + hash(o.sd + j), d = 0.45 + hash(o.sd + j * 3) * 0.55;
            const sx = x + Math.round(Math.cos(a) * o.r * d), sy = y + Math.round(Math.sin(a) * o.r * 0.6 * d);
            const h = Math.round((7 + hash(o.sd + j * 5) * 9) * g);
            if (h < 2) continue;
            p(c, sx - 2, sy - (h * 0.4 | 0), 5, (h * 0.4 | 0) + 1, '#4a9ad0'); p(c, sx - 1, sy - (h * 0.75 | 0), 3, (h * 0.75 | 0), '#7fd4ff');
            p(c, sx, sy - h, 1, h, '#e9f9ff'); p(c, sx - 1, sy - (h * 0.5 | 0), 1, (h * 0.3 | 0) + 1, '#ffffff');
          }
          break;
        }
        case 'pillar': {
          const up = Math.min(1, k * 5), h = o.h * up, lift = k > 0.55 ? ((k - 0.55) / 0.45) * o.h * 0.8 : 0;
          const w = o.w * (1 - k * 0.5);
          const C0 = o.water ? '#6aa8d0' : '#ff7a2a', C1 = o.water ? '#bfeaff' : '#ffd23f', C2 = o.water ? '#ffffff' : '#fff3b0';
          for (let yy = lift; yy < h; yy += 3) {
            const u = yy / o.h, ww = Math.max(1, w * (1 - u * 0.75)), ox = Math.round(Math.sin(yy * 0.4 + S.t * 30) * (1 + u * 2));
            p(c, Math.round(x - ww + ox), y - Math.round(yy) - 3, Math.round(ww * 2), 3, C0);
            if (ww > 2) p(c, Math.round(x - ww * 0.6 + ox), y - Math.round(yy) - 3, Math.round(ww * 1.2), 3, C1);
            if (ww > 4 && k < 0.6) p(c, Math.round(x - ww * 0.25 + ox), y - Math.round(yy) - 3, Math.max(1, Math.round(ww * 0.5)), 3, C2);
          }
          break;
        }
        case 'bottle': {
          const bx = Math.round(o.x + (o.tx - o.x) * k), by = Math.round(o.y + (o.ty2 - o.y) * k - 14 * (1 - k) - Math.sin(k * Math.PI) * 24);
          const f = ((k * 8) | 0) % 4;
          if (f % 2 === 0) { p(c, bx - 2, by - 3, 5, 6, '#1c3a10'); p(c, bx - 1, by - 2, 3, 4, '#6fcf3a'); p(c, bx - 1, by - 2, 1, 2, '#e6ffc0'); p(c, bx - 1, f ? by + 3 : by - 5, 2, 2, '#caa15a'); }
          else { p(c, bx - 3, by - 2, 6, 5, '#1c3a10'); p(c, bx - 2, by - 1, 4, 3, '#6fcf3a'); p(c, bx - 2, by - 1, 2, 1, '#e6ffc0'); p(c, f === 1 ? bx + 3 : bx - 5, by - 1, 2, 2, '#caa15a'); }
          p(c, Math.round(o.x + (o.tx - o.x) * k) - 2, Math.round(o.y + (o.ty2 - o.y) * k), 4, 1, 'rgba(0,0,0,0.3)');
          break;
        }
        case 'orb': {
          const s = o.big ? 2 : 1;
          line(c, Math.round(o.px), Math.round(o.py), x, y, o.pl.c, s + 1);
          p(c, x - s - 1, y - s, s * 2 + 3, s * 2 + 1, o.pl.c); p(c, x - s, y - s - 1, s * 2 + 1, s * 2 + 3, o.pl.c);
          p(c, x - s, y - s, s * 2 + 1, s * 2 + 1, o.pl.c2); p(c, x - (s >> 1), y - (s >> 1), s, s, '#ffffff');
          break;
        }
        case 'beam': {
          const bx = Math.round(o.P.x), by = Math.round(o.P.y), w = Math.round(13 * (1 - k) * (1 - k)) + 1, a = (0.55 * (1 - k)).toFixed(2);
          p(c, bx - w - 3, by - 170, w * 2 + 6, 170, o.pl.a + (0.3 * (1 - k)).toFixed(2) + ')');
          p(c, bx - w, by - 170, w * 2, 170, o.pl.a + a + ')');
          if (w > 3) p(c, bx - (w >> 1), by - 170, w, 170, 'rgba(255,255,255,' + a + ')');
          ell(c, bx, by, w + 8, 4, o.pl.a + a + ')');
          break;
        }
        case 'dashline': {
          const f = o.f, PL = o.pl, a = o.x + (o.x1 - o.x) * Math.max(0, (k - 0.25) / 0.75), b = o.x1;
          const x0 = Math.round(Math.min(a, b)), w = Math.round(Math.abs(b - a));
          if (w < 2) break;
          const dth = k > 0.6;
          if (dth) { c.fillStyle = PL.c; for (let q = 0; q < w; q += 2) c.fillRect(x0 + q, y - 2, 1, o.spear ? 3 : 5); }
          else { p(c, x0, y - (o.spear ? 2 : 4), w, o.spear ? 5 : 9, PL.a + '0.3)'); p(c, x0, y - (o.spear ? 1 : 2), w, o.spear ? 3 : 5, PL.c); p(c, x0 + (f > 0 ? Math.round(w * 0.3) : 0), y - 1, Math.round(w * 0.7), o.spear ? 1 : 3, PL.c2); }
          p(c, x0 + (f > 0 ? Math.round(w * 0.2) : 0), y, Math.round(w * 0.8), 1, k < 0.6 ? '#ffffff' : PL.c2);
          p(c, x0 + (f > 0 ? 0 : Math.round(w * 0.4)), y - 7, Math.round(w * 0.6), 1, PL.a + '0.6)'); p(c, x0 + (f > 0 ? Math.round(w * 0.2) : Math.round(w * 0.3)), y + 6, Math.round(w * 0.5), 1, PL.a + '0.6)');
          if (k < 0.7) {
            const tx = Math.round(b) + f * (o.spear ? 16 : 8);
            if (o.spear) { star(c, tx, y, 7 * (1 - k), PL.c2, '#ffffff'); p(c, tx - f * 12 - (f < 0 ? 8 : 0), y - 1, 8, 3, '#ffffff'); }
            else { crescent(c, tx - f * 4, y - 1, 18, 15, -f * 7, 0, 1, PL.c, 0, 1, true, k > 0.5, f, 0); crescent(c, tx - f * 3, y - 1, 17, 14, -f * 4, 0, 1, '#ffffff', 0, 1, true, k > 0.35, f, 0); }
          }
          break;
        }
        case 'stuck': {
          const h = o.t < 0.15 ? Math.max(1, Math.round(6 * (o.t / 0.15))) : 6;
          p(c, x, y - h, 1, h, o.c[0]); p(c, x - 1, y - h - 1, 3, 2, '#c8372d'); p(c, x - 1, y, 3, 1, 'rgba(0,0,0,0.3)');
          break;
        }
        default: if (o.draw) o.draw(c, o, k, x, y); break; // hình riêng do js/fx_he.js thêm vào
      }
    }
  }

  // ---------- các lớp vẽ, gọi từ G.drawWorld ----------
  function layer(name, f) {
    fx[name] = function (a, b) {
      if (G.noRender || !S || S.W !== G.getWorld()) return;
      try { f(a, b); } catch (e) { fail(e); }
    };
  }
  // Lớp sát đất, vẽ trước các nhân vật
  layer('drawGround', (c) => { drawFx(c, 0); drawParts(c, 0); });
  // Xác quái đang tan và bóng mờ của hero: xếp chung thứ tự xa gần với các nhân vật
  layer('sorted', (list, c) => {
    const A = G.art;
    for (const d of S.dying) list.push({ y: d.e.y - (d.boss && d.e.kind === 'moc' ? 30 : 0), f: () => dyingDraw(c, d, A) });
    for (const g of S.ghosts) list.push({ y: g.a.y - 0.5, f: () => { const q = g.t / g.t0; g.a.alpha = q > 0.66 ? 0.45 : q > 0.33 ? 0.3 : 0.15; try { A.hero(c, g.a); } catch (e) { fail(e); } c.globalAlpha = 1; } });
  });
  function dyingDraw(c, d, A) {
    const k = 1 - d.t / d.t0, e = d.e;
    c.save();
    try {
      if (d.boss) {
        c.globalAlpha = k < 0.45 ? 1 : k < 0.6 ? 0.8 : k < 0.75 ? 0.6 : k < 0.9 ? 0.4 : 0.2;
        c.translate(Math.round((hash(k * 97) - 0.5) * 5 * (0.3 + k)), 0);
        if (d.mini) A.enemy(c, e); else A.boss(c, e);
      } else {
        c.globalAlpha = k < 0.3 ? 1 : k < 0.5 ? 0.75 : k < 0.7 ? 0.5 : 0.25;
        if (k > 0.7 && ((S.t * 30) | 0) % 2) c.globalAlpha = 0.1;
        if (d.ill) A.boss(c, e); else A.enemy(c, e);
      }
    } catch (err) { fail(err); }
    c.restore();
  }
  // Lớp trên cùng của thế giới
  layer('drawOver', (c) => {
    drawFx(c, 1); drawParts(c, 1);
    if (S.pulse > 0) { const h = hand(S.W.P), PL = pal(S.pulseEl); star(c, h.x, h.y - 2, 2 + (S.pulse / 0.25) * 4, PL.c2, '#ffffff'); }
  });
  // Lớp giao diện: số sát thương, viền đỏ khi trúng đòn, nhịp đỏ khi máu thấp, chớp sáng khi tiến hoá
  layer('drawUI', (cam) => {
    const c = G.ux, P = S.W.P;
    let a = S.hurt > 0 ? (S.hurt / 0.3) * 0.6 : 0;
    if (!P.dead && P.hp / P.maxhp < 0.3) a = Math.max(a, 0.2 + 0.14 * Math.sin(S.t * 5.5));
    if (a > 0.01) vignette(c, a);
    if (S.flash > 0) { c.fillStyle = 'rgba(' + S.flashCol + ',' + (Math.min(1, S.flash / 0.45) * 0.38).toFixed(3) + ')'; c.fillRect(0, 0, G.W, G.H); }
    drawNums(cam);
  });
  // Viền đỏ quanh màn hình: vẽ sẵn một lần vào canvas nhỏ, mỗi khung chỉ dán lại với độ trong suốt
  let VIG = null;
  function vignette(c, a) {
    if (!VIG) {
      VIG = document.createElement('canvas');
      VIG.width = 240; VIG.height = 135;
      const v = VIG.getContext('2d'), W = 240, H = 135, d = 27, col = 'rgba(210,20,10,';
      const side = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = v.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, col + '1)'); g.addColorStop(1, col + '0)');
        v.fillStyle = g; v.fillRect(rx, ry, rw, rh);
      };
      side(0, 0, d, 0, 0, 0, d, H); side(W, 0, W - d, 0, W - d, 0, d, H);
      side(0, 0, 0, d * 0.7, 0, 0, W, d * 0.7); side(0, H, 0, H - d * 0.7, 0, H - d * 0.7, W, d * 0.7);
    }
    c.globalAlpha = Math.min(1, a);
    c.drawImage(VIG, 0, 0, G.W, G.H);
    c.globalAlpha = 1;
  }
  // Bộ đồ nghề cho js/fx_he.js: dùng chung kho hạt, bảng màu và các hàm vẽ điểm ảnh ở trên.
  fx.kit = { S: () => S, api, layer, fail, emit, streak, spray, puffs, add, addRing, trauma, kick, stop, num, pal, PAL, RAMP, R, rr, hash, p, ell, ring, line, star, crescent, tongue, slam, blastFire, blastPoison, blastIce, elemBits, bodyOf, hand, A_ };
})();
