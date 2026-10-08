'use strict';

// ============================================================
//  HIỆU ỨNG PIXEL (claude/vfx-kenney; hệ hạt từ v35): hạt, đạn bay, trạng thái trên quái, hiệu ứng chiêu / sự kiện
//  vẽ bằng PIXEL ART: sprite lưới ký tự tools/pixel/src/vfx/*.txt → node tools/build-pixel.js → assets/pixel/vfx/*.png
//  (docs/pixel/QUY-CHUAN.md), cộng các hình vẽ bằng code theo ô điểm ảnh (vòng elip, đường, chấm).
//  - Một điểm ảnh sprite = PU đơn vị bản đồ, phóng theo SỐ NGUYÊN điểm ảnh màn hình, vị trí bám lưới, không khử răng cưa.
//  - Màu: chỉ màu bảng chung (tools/pixel/palette.txt, docs/pixel/QUY-CHUAN.md); màu truyền vào được quy về màu gần nhất.
//  - Pool hạt + giới hạn MAX (theo mức đồ hoạ) + hạn mức ảnh trạng thái mỗi khung → không giật trên điện thoại.
//  - Chưa có / chưa tải sprite → hạt vẽ ô vuông màu; trạng thái / đạn / hiệu ứng trả false → main.js /
//    render.js vẽ cách cũ bằng code (dự phòng).
// ============================================================
const VFX = (() => {
  let MAX = 700;          // hạ xuống khi máy yếu (đồ hoạ tự động)
  const parts = [];
  const PU = 2;           // một điểm ảnh sprite = 2 đơn vị bản đồ
  const R = (a, b) => a + Math.random() * (b - a);

  // ---------- dữ liệu sprite (nhóm vfx của bộ pixel chung: tools/pixel/src/vfx/*.txt → node tools/build-pixel.js →
  // assets/pixel/vfx/<mã>.png + manifest window.PIXEL_MANIFEST['vfx/<mã>'] trong js/pixel/vfx.js) + bảng màu chung
  // Bản sao tools/pixel/palette.txt (tests/hieu-ung/hat-vfx.test.js kiểm tra khớp): quy màu bất kỳ về màu gần nhất.
  const C = { 'vien': '#140C06', 'toi': '#2E241B', 'khoi': '#24201C', 'sat-toi': '#33363C', 'sat': '#555A62', 'sat-sang': '#8A9098', 'bac': '#C3C6C4', 'trang-xam': '#B8AE98', 'trang': '#E4DCC8', 'sang': '#F5EED8', 'da-toi': '#9A5E3E', 'da': '#C98A62', 'da-sang': '#E2B58A', 'dat-toi': '#3E2716', 'dat': '#6B4426', 'dat-sang': '#946538', 'cat': '#C2A26A', 'dong-toi': '#5A3814', 'dong': '#8E5A22', 'dong-sang': '#BF863A', 'vang-nghe': '#D6A532', 'vang-sang': '#ECD08A', 'son-toi': '#5A1610', 'son': '#92301C', 'son-sang': '#BC4A2E', 'hong': '#C7786A', 'lua': '#D2661E', 'lua-sang': '#E8A048', 'la-toi': '#1C3A1E', 'la': '#35632A', 'la-ma': '#6A9A38', 'la-sang': '#A8C46A', 'reu-toi': '#3A4A22', 'reu': '#5E7434', 'reu-sang': '#869A4C', 'cham-toi': '#161E3A', 'cham': '#26406A', 'cham-sang': '#44699A', 'nuoc': '#3478A6', 'nuoc-sang': '#78B4CC', 'troi': '#B8D8E0', 'tim-toi': '#36204A', 'tim': '#63407E', 'tim-sang': '#9478B0', 'ngoc': '#2A8A7E', 'ngoc-sang': '#6CC0B0' };
  const PAL = Object.values(C).map((h) => [h, parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const MF = () => (typeof window !== 'undefined' && window.PIXEL_MANIFEST) || {};
  const D = Object.keys(MF()).some((k) => k.startsWith('vfx/'));   // có sprite hiệu ứng pixel không
  const snapCache = new Map();
  // màu bất kỳ (#rgb / #rrggbb) → màu gần nhất trong bảng màu chung
  function pal(color) {
    if (!color) return C.trang;
    let c = snapCache.get(color);
    if (c) return c;
    let h = String(color);
    if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    if (!/^#[0-9a-f]{6}/i.test(h)) { snapCache.set(color, C.trang); return C.trang; }
    const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    let best = PAL[0], bd = 1e9;
    for (const p of PAL) { const d = (p[1] - r) ** 2 * 3 + (p[2] - g) ** 2 * 4 + (p[3] - b) ** 2 * 2; if (d < bd) { bd = d; best = p; } }
    snapCache.set(color, best[0]);
    return best[0];
  }
  // sprite → { w, h, ax, ay, anims, fr: [canvas] }: cắt dải khung PNG một lần khi ảnh đã tải; null = chưa có / chưa tải xong
  const sprCache = new Map();
  const sheetOf = (name) => (typeof asset === 'function' ? asset('pixel/vfx/' + name + '.png', true) : null);
  function spr(name) {
    const s0 = sprCache.get(name);
    if (s0 !== undefined) return s0;
    const e = MF()['vfx/' + name];
    if (!e || typeof document === 'undefined') { sprCache.set(name, null); return null; }
    const sheet = sheetOf(name);
    if (!sheet) return null;                       // đang tải: thử lại khung sau
    const s = { w: e.w, h: e.h, ax: e.ax, ay: e.ay, anims: e.anims, fr: [] };
    for (let i = 0; i < e.n; i++) {
      const c = document.createElement('canvas');
      c.width = e.w; c.height = e.h;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(sheet, i * e.w, 0, e.w, e.h, 0, 0, e.w, e.h);
      s.fr.push(c);
    }
    sprCache.set(name, s);
    return s;
  }
  // tải sẵn mọi dải hiệu ứng (vài trăm byte mỗi dải) để lần đầu tung chiêu đã có hình
  if (D) for (const k of Object.keys(MF())) if (k.startsWith('vfx/')) sheetOf(k.slice(4));
  const ready = (name) => !!spr(name);
  // chỉ số khung: p (0..1) cho động tác một lần, hoặc thời gian t cho vòng lặp
  function frameOf(s, p, t, seed = 0) {
    const a = s.anims.main || Object.values(s.anims)[0];
    const k = p !== undefined && p !== null ? Math.min(a.n - 1, Math.max(0, Math.floor(p * a.n))) : Math.floor((t || 0) * a.fps + seed) % a.n;
    return a.start + ((k % a.n) + a.n) % a.n;
  }

  // ---------- vẽ theo lưới điểm ảnh màn hình
  // G: hệ số của khung hiện tại (đặt bởi begin): m = ma trận bản đồ, n = cỡ một điểm ảnh sprite trên màn hình (số nguyên)
  const G = { a: 1, d: 1, e: 0, f: 0, k: 1, n: 2 };
  function begin(ctx, scale = 1) {
    const m = ctx.getTransform();
    G.a = m.a; G.d = m.d; G.e = m.e; G.f = m.f;
    G.k = Math.hypot(m.a, m.b) || 1;
    G.n = Math.max(1, Math.round(PU * scale * G.k));
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  const end = (ctx) => ctx.restore();
  const sx = (x) => Math.round(G.a * x + G.e), sy = (y) => Math.round(G.d * y + G.f);
  // một ô điểm ảnh (cỡ c ô) tại toạ độ bản đồ (x, y), bám lưới n
  function dot(ctx, x, y, color, c = 1) {
    const n = G.n, X = Math.round((G.a * x + G.e) / n) * n, Y = Math.round((G.d * y + G.f) / n) * n;
    ctx.fillStyle = color;
    ctx.fillRect(X - ((c * n) >> 1), Y - ((c * n) >> 1), c * n, c * n);
  }
  // sprite tại điểm neo (x, y); sc = bội số nguyên; flip = lật ngang
  function blit(ctx, name, i, x, y, sc = 1, flip = false) {
    const s = spr(name);
    if (!s) return false;
    const n = G.n * Math.max(1, Math.round(sc)), X = sx(x), Y = sy(y);
    const c = s.fr[Math.max(0, Math.min(s.fr.length - 1, i))];
    if (flip) { ctx.save(); ctx.translate(X, Y); ctx.scale(-1, 1); ctx.drawImage(c, -s.ax * n, -s.ay * n, s.w * n, s.h * n); ctx.restore(); }
    else ctx.drawImage(c, X - s.ax * n, Y - s.ay * n, s.w * n, s.h * n);
    return true;
  }
  // vòng elip bằng ô điểm ảnh; o.dash: bỏ bớt ô theo nhịp, o.drum: chấm hoa văn trống đồng phía ngoài, o.c: cỡ ô
  function ring(ctx, x, y, rx, ry, color, o = {}) {
    const n = G.n, c = o.c || 1;
    const RX = rx * G.k, RY = ry * G.k;
    if (RX < n * 0.6) { dot(ctx, x, y, color, c); return; }
    const steps = Math.max(8, Math.ceil((2 * Math.PI * Math.max(RX, RY)) / n));
    const cx = G.a * x + G.e, cy = G.d * y + G.f, seen = new Set();
    ctx.fillStyle = color;
    for (let i = 0; i < steps; i++) {
      if (o.dash && Math.floor(i / o.dash + (o.phase || 0)) % 2) continue;
      const a = (i / steps) * Math.PI * 2;
      const X = Math.round((cx + Math.cos(a) * RX) / n), Y = Math.round((cy + Math.sin(a) * RY) / n);
      const key = X * 65536 + Y;
      if (seen.has(key)) continue;
      seen.add(key);
      ctx.fillRect(X * n, Y * n, c * n, c * n);
      if (o.drum && i % o.drum === 0) {
        ctx.fillStyle = o.drumColor || color;
        ctx.fillRect(Math.round((cx + Math.cos(a) * (RX + 3 * n)) / n) * n, Math.round((cy + Math.sin(a) * (RY + 2 * n)) / n) * n, n, n);
        ctx.fillStyle = color;
      }
    }
  }
  // đoạn thẳng bằng ô (Bresenham trên lưới n)
  function seg(ctx, x1, y1, x2, y2, color, c = 1) {
    const n = G.n;
    let X = Math.round(sx(x1) / n), Y = Math.round(sy(y1) / n);
    const X2 = Math.round(sx(x2) / n), Y2 = Math.round(sy(y2) / n);
    const dx = Math.abs(X2 - X), dy = -Math.abs(Y2 - Y), stx = X < X2 ? 1 : -1, sty = Y < Y2 ? 1 : -1;
    let err = dx + dy, guard = 0;
    ctx.fillStyle = color;
    for (;;) {
      ctx.fillRect(X * n, Y * n, c * n, c * n);
      if ((X === X2 && Y === Y2) || ++guard > 600) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; X += stx; }
      if (e2 <= dx) { err += dx; Y += sty; }
    }
  }
  // tia sét gấp khúc bằng ô
  function zig(ctx, x1, y1, x2, y2, color, seg0 = 6) {
    let px = x1, py = y1;
    for (let i = 1; i <= seg0; i++) {
      const q = i / seg0, nx = x1 + (x2 - x1) * q + (i < seg0 ? R(-8, 8) : 0), ny = y1 + (y2 - y1) * q;
      seg(ctx, px, py, nx, ny, color);
      px = nx; py = ny;
    }
  }
  const step = (a) => Math.max(0, Math.min(1, Math.ceil(a * 4) / 4));   // độ mờ theo bậc (đúng chất pixel)

  // ---------- ánh xạ tên ảnh cũ (Kenney assets/fx, chiêu đánh của tướng trong costume.js) → sprite pixel / vòng
  const TEXMAP = {
    circle_02: 'ring', circle_03: 'ring', circle_05: 'dot', light_03: 'ring', magic_01: 'ring', magic_02: 'ring', magic_03: 'kim-quang',
    magic_05: 'nuoc-ban', dirt_01: 'bui-dat', fire_01: 'lua-chay', fire_02: 'lua-chay', flame_05: 'lua-chay', flame_06: 'lua-chay',
    flare_01: 'trung', muzzle_02: 'lua-chay', scorch_01: 'no', scorch_02: 'no', scratch_01: 'chem', slash_01: 'chem', slash_03: 'chem',
    smoke_03: 'khoi', smoke_07: 'khoi', smoke_09: 'khoi', spark_01: 'set', spark_06: 'set', star_04: 'trung', star_06: 'trung',
    star_08: 'tuyet', star_09: 'trung', trace_05: 'trung', twirl_01: 'gio-xoay', twirl_02: 'gio-xoay',
  };
  const pxName = (name) => (MF()['vfx/' + name] ? name : TEXMAP[name] || null);

  // ---------- hạt
  // o: { x, y, vx, vy, life, size, grow, color, kind ('glow'|'soft'|'spark'|'leaf'|'petal'|'tex'), tex, grav, drag, sy, a, must, sc }
  // Pool: hạt chết cất vào pool để dùng lại (không tạo object mới mỗi khung). Đầy MAX: bỏ hạt mới; hạt `must` (nổ lớn,
  // boss chết) thế chỗ một hạt bất kỳ.
  const pool = [];
  const BASE = { x: 0, y: 0, vx: 0, vy: 0, life: 0.3, size: 3, color: '#ffffff', grav: 0, drag: 0.9, grow: 0, add: true, kind: 'glow',
    spin: 0, rot: 0, stretch: false, tex: null, sy: 1, a: undefined, must: false, sc: 0, flip: false, loopT: false };
  let dropped = 0;
  function emit(o) {
    let p;
    if (parts.length >= MAX) {
      dropped++;
      if (!o.must || !parts.length) return;
      p = parts[(Math.random() * parts.length) | 0];
    } else { p = pool.pop() || {}; parts.push(p); }
    Object.assign(p, BASE, o);
    p.max = p.life;
  }
  function burst(x, y, n, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = R(0, Math.PI * 2), sp = R(o.min ?? 40, o.speed ?? 160);
      emit({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (o.flat ?? 0.6) - (o.up ?? 0),
        life: R(0.25, o.life ?? 0.55), size: R(o.size ?? 3, (o.size ?? 3) * 2), color, kind: o.kind || 'glow',
        grav: o.grav ?? 0, drag: o.drag ?? 0.88, stretch: o.stretch, grow: o.grow ?? 0, a: o.a, must: o.must });
    }
  }
  // ảnh pixel (sprite / vòng) đặt một chỗ: size = nửa cỡ (đơn vị bản đồ) như ảnh cũ; sy < 1 = nằm dẹt trên mặt đất
  function decal(x, y, name, color, size, life, o = {}) {
    emit({ x, y, vx: o.vx || 0, vy: o.vy || 0, life, size, color, kind: 'tex', tex: name, grow: o.grow || 0, drag: o.drag ?? 1, grav: o.grav || 0,
      sy: o.sy || 1, a: o.a, must: o.must, sc: o.sc || 0, flip: o.flip ?? Math.random() < 0.5, loopT: !!o.loop });
  }
  // nhiều mảnh sprite bay toả ra (bông tuyết, lá tre, đồng xu, tàn lửa…)
  function shards(x, y, n, name, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = R(0, Math.PI * 2), sp = R(o.min ?? 30, o.speed ?? 140);
      decal(x + R(-(o.spread || 0), o.spread || 0), y, name, color, o.size ?? 5, R((o.life ?? 0.6) * 0.6, o.life ?? 0.6), {
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (o.flat ?? 0.6) - (o.up ?? 0), drag: o.drag ?? 0.9, grav: o.grav, a: o.a, must: o.must,
        sc: o.sc || 1, loop: true });
    }
  }
  function flare(x, y, color, size = 40, life = 0.3) { decal(x, y, 'trung', color, size * 0.5, Math.min(0.3, life), { sc: size > 50 ? 2 : 1 }); }
  function rise(x, y, n, color, spread = 30) {
    for (let i = 0; i < n; i++)
      emit({ x: x + R(-spread, spread), y: y + R(-spread * 0.4, spread * 0.3), vx: R(-10, 10), vy: R(-70, -30),
        life: R(0.5, 1.1), size: R(2, 4.5), color, kind: 'glow', drag: 0.97 });
  }
  function line(x1, y1, x2, y2, n, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const k = Math.random();
      emit({ x: x1 + (x2 - x1) * k, y: y1 + (y2 - y1) * k, vx: R(-30, 30), vy: R(-30, 30), life: R(0.2, 0.5), size: R(2, o.size ?? 4), color, kind: 'glow', drag: 0.85 });
    }
  }

  function update(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        const last = parts.pop();          // bỏ bằng đổi chỗ với hạt cuối (O(1)), cất vào pool
        if (last !== p) parts[i] = last;
        if (pool.length < 1024) pool.push(p);
        continue;
      }
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d; p.vy = p.vy * d + p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.size += p.grow * dt;
    }
  }

  let clock = 0;
  function draw(ctx) {
    if (!parts.length) return;
    clock += 1 / 60;
    begin(ctx);
    for (const p of parts) {
      const k = p.life / p.max;
      ctx.globalAlpha = step(Math.min(1, k * 1.6) * (p.a ?? 1));
      if (ctx.globalAlpha <= 0) continue;
      const cells = Math.max(1, Math.min(3, Math.round(p.size / PU * 0.7)));
      if (p.kind === 'tex') {
        const nm = pxName(p.tex);
        if (nm === 'ring' || nm === 'dot' || !nm) {
          const c = pal(p.color && p.color !== '#ffffff' ? p.color : '#F2C230');
          if (nm === 'dot' || !nm) dot(ctx, p.x, p.y, c, Math.min(3, cells));
          else ring(ctx, p.x, p.y, Math.max(1, p.size), Math.max(1, p.size) * (p.sy || 1), c, { drum: p.size > 30 ? 9 : 0 });
          continue;
        }
        const s = spr(nm);
        if (!s) { dot(ctx, p.x, p.y, pal(p.color), cells); continue; }
        const sc = p.sc || Math.max(1, Math.min(4, Math.round((p.size * 2) / (Math.max(s.w, s.h) * PU))));
        const i = p.loopT ? frameOf(s, null, clock + p.max * 7) : frameOf(s, 1 - k);
        blit(ctx, nm, i, p.x, p.y, sc, p.flip);
        continue;
      }
      if (p.kind === 'leaf' || p.kind === 'petal') {
        const nm = p.kind === 'leaf' ? 'la-tre' : 'hoa-sen', s = spr(nm);
        if (s) { blit(ctx, nm, frameOf(s, null, clock + p.max * 5), p.x, p.y, 1, p.vx < 0); continue; }
      }
      const c = pal(p.kind === 'soft' ? p.color || '#CFC6B2' : p.color);
      if (p.kind === 'spark' || p.stretch) {
        // tia: đoạn ngắn theo hướng bay
        const sp = Math.hypot(p.vx, p.vy) || 1, L = Math.min(4, 1 + sp / 70) * PU;
        seg(ctx, p.x - (p.vx / sp) * L, p.y - (p.vy / sp) * L, p.x, p.y, c);
      } else {
        if (p.kind === 'soft') ctx.globalAlpha = step(ctx.globalAlpha * 0.7);
        dot(ctx, p.x, p.y, c, cells);
      }
    }
    end(ctx);
  }

  // ---------- đuôi đạn (mỗi khung cho từng viên đạn): vài chấm pixel màu đạn
  const TRAIL = {
    fireball: { c: '#F07A1E', smoke: '#5E6470', n: 1.2 }, frostbolt: { c: '#8FD3EE', n: 1 }, arrow: { c: '#D9B97A', n: 0.5, thin: true },
    bolt: { c: '#F2C230', n: 0.5, thin: true }, orb: { c: '#7FE0D0', n: 1 }, feather: { c: '#F4EFE2', n: 0.6 }, petal: { c: '#F29A8A', n: 0.6 },
    melon: { c: '#7FBF3F', n: 0.5 }, rice: { c: '#D9B97A', n: 0.5 }, evil: { c: '#7A4AA8', n: 0.8 },
  };
  function trail(p, dt) {
    const tr = TRAIL[p.kind] || TRAIL.fireball;
    const c = p.st && p.st.poison && (p.kind === 'arrow' || p.kind === 'bolt') ? '#6F8A3C' : tr.c;
    const rate = tr.n * 60 * dt;
    for (let i = 0; i < rate; i++) {
      if (Math.random() > rate - i) break;
      emit({ x: p.x + R(-2, 2), y: p.y + R(-2, 2), vx: R(-10, 10), vy: R(-10, 10), life: R(0.12, tr.thin ? 0.2 : 0.3), size: tr.thin ? 2 : 3, color: c, kind: 'glow', drag: 0.9 });
      if (tr.smoke && Math.random() < 0.3) emit({ x: p.x, y: p.y, vx: R(-6, 6), vy: R(-20, -8), life: R(0.25, 0.45), size: 3, color: tr.smoke, kind: 'soft', a: 0.6 });
    }
  }
  function projGlow() { /* pixel: không quầng sáng mềm */ }
  // đạn bay bằng sprite pixel (gọi trong drawProjectile sau khi đã dịch + xoay theo hướng bay); false = vẽ cách cũ
  const PROJ = { fireball: 'dan-lua', frostbolt: 'dan-bang', arrow: 'mui-ten', bolt: 'ne-no', orb: 'ngoc', feather: 'long-vu', petal: 'hoa-sen',
    melon: 'dua', rice: 'gao', evil: 'ta-khi' };
  const SPIN = { petal: 1, melon: 1, evil: 1, orb: 1 };
  function drawProj(ctx, p, t) {
    let nm = PROJ[p.kind] || 'dan-lua';
    // đạn chung (cầu lửa) của tướng hệ Kim / Mộc / Thủy / Thổ → đạn theo hệ (Lô 44: dan-<hệ>)
    const el = p.hero && typeof HEROES !== 'undefined' && HEROES[p.hero.type] && HEROES[p.hero.type].el;
    if (nm === 'dan-lua' && el && el !== 'hoa' && spr('dan-' + el)) nm = 'dan-' + el;
    if (nm === 'dan-lua' && p.st && p.st.slow) nm = 'dan-bang';
    const s = spr(nm);
    if (!s) return false;
    const m = ctx.getTransform(), k = Math.hypot(m.a, m.b) || 1;
    const n = Math.max(1, Math.round(PU * k)), u = n / k;
    ctx.save();
    if (SPIN[p.kind]) ctx.rotate(-(p.angle || 0));      // tròn: không xoay theo hướng bay, chỉ đổi khung
    ctx.imageSmoothingEnabled = false;
    const i = frameOf(s, null, t, (p.id || 0) * 0.3);
    ctx.drawImage(s.fr[i], -s.ax * u, -s.ay * u, s.w * u, s.h * u);
    ctx.restore();
    return true;
  }

  // ---------- hiệu ứng trạng thái trên quái (bỏng, độc, choáng, đóng băng, làm chậm) — sprite pixel theo thời gian t
  // Vẽ TRƯỚC thanh máu và không vượt đỉnh hình quái → không che thanh máu. Hạn mức số sprite mỗi khung (SB.max);
  // hết hạn mức hoặc chưa có sprite → trả cờ false để render.js vẽ cách cũ bằng code.
  const SB = { n: 0, max: 180 };
  function frame() { SB.n = 0; }
  function isFire(c) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c || '');
    if (!m) return false;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return r >= g && r >= b && r > 150;
  }
  function sb(n) { if (SB.n + n > SB.max) return false; SB.n += n; return true; }
  // ngọn lửa bỏng 5×7 ô (thu nhỏ từ dáng lua-chay), đáy giữa tại (x, y), mỗi ô c điểm ảnh màn hình; f = nhịp, flip = lật
  const FLAME = [['..r..', '.ro..', '.ror.', 'rooyr', 'royyr', 'royyo', '.kkk.'], ['...r.', '..ro.', '.ror.', 'royor', 'royyr', 'oyyor', '.kkk.']];
  const FLAME_C = { r: 'son-sang', o: 'lua', y: 'vang-sang', k: 'son' };
  function flame(ctx, x, y, c, f, flip) {
    const X = Math.round(sx(x) / c) * c, Y = Math.round(sy(y) / c) * c, rows = FLAME[f];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) {
      const ch = rows[j][flip ? 4 - i : i];
      if (ch === '.') continue;
      ctx.fillStyle = C[FLAME_C[ch]];
      ctx.fillRect(X + (i - 2) * c - (c >> 1), Y - (7 - j) * c, c, c);
    }
  }
  // khối băng THẬP LỤC GIÁC kiểu pha lê bao hộp [x0, x1] × [y0, y1] (toạ độ bản đồ): 4 cạnh thẳng + mỗi góc 3 cạnh (cung 90°
  // chia 3) = 16 cạnh thẳng nối đỉnh bằng nét pixel. Viền trong thụt vào + nét vát nối đỉnh ngoài–trong, mỗi mặt vát tô sáng/tối
  // theo hướng (trên sáng, dưới tối) → cạnh cứng, rõ. Mặt trong trong suốt nhạt
  const ARC = [0, 30, 60, 90].map((d) => (d * Math.PI) / 180);
  function polyPts(X0, Y0, X1, Y1, R) {          // 16 đỉnh theo chiều kim đồng hồ (toạ độ màn hình)
    const cs = [[X1 - R, Y0 + R, -Math.PI / 2], [X1 - R, Y1 - R, 0], [X0 + R, Y1 - R, Math.PI / 2], [X0 + R, Y0 + R, Math.PI]], out = [];
    for (const [cx, cy, a0] of cs) for (const a of ARC) out.push([cx + Math.cos(a0 + a) * R, cy + Math.sin(a0 + a) * R]);
    return out;
  }
  function fillPoly(ctx, P, n) {                  // tô đa giác lồi theo hàng ô lưới n
    let y0 = Infinity, y1 = -Infinity;
    for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0 / n) * n; y < y1; y += n) {
      const yc = y + n / 2;
      let a = Infinity, b = -Infinity;
      for (let i = 0; i < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length];
        if ((ay <= yc && by >= yc) || (by <= yc && ay >= yc)) { const x = ay === by ? Math.min(ax, bx) : ax + ((bx - ax) * (yc - ay)) / (by - ay); const x2 = ay === by ? Math.max(ax, bx) : x; a = Math.min(a, x); b = Math.max(b, x2); }
      }
      if (b > a) { const L = Math.round(a / n) * n, Rr = Math.round(b / n) * n; if (Rr > L) ctx.fillRect(L, y, Rr - L, n); }
    }
  }
  function lineS(ctx, x1, y1, x2, y2, n) {        // nét pixel giữa 2 điểm màn hình, bám lưới n
    let X = Math.round(x1 / n), Y = Math.round(y1 / n);
    const X2 = Math.round(x2 / n), Y2 = Math.round(y2 / n), dx = Math.abs(X2 - X), dy = -Math.abs(Y2 - Y), stx = X < X2 ? 1 : -1, sty = Y < Y2 ? 1 : -1;
    let err = dx + dy, g = 0;
    for (;;) {
      ctx.fillRect(X * n, Y * n, n, n);
      if ((X === X2 && Y === Y2) || ++g > 400) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; X += stx; }
      if (e2 <= dx) { err += dx; Y += sty; }
    }
  }
  function iceOct(ctx, x0, y0, x1, y1) {
    const n = G.n, m = Math.max(3 * n / G.k, 0.11 * Math.min(x1 - x0, y1 - y0));
    const X0 = Math.floor(sx(x0 - m) / n) * n, X1 = Math.ceil(sx(x1 + m) / n) * n;
    const Y0 = Math.floor(sy(y0 - m) / n) * n, Y1 = Math.ceil(sy(y1 + m) / n) * n;
    // bán kính góc R ≤ 3,16 lề thì góc hộp vẫn nằm trong 3 cạnh góc (khoảng cách tâm–góc (R−m)√2 ≤ R·cos15°)
    const R = Math.min(Math.floor((X1 - X0) / 2), Math.floor((Y1 - Y0) / 2), Math.max(2 * n, Math.floor((3 * m * G.k) / n) * n));
    const b = Math.max(2 * n, Math.min(Math.round((R * 0.32) / n) * n, R - n)), Ri = Math.max(n, R - b);
    const O = polyPts(X0, Y0, X1, Y1, R), I = polyPts(X0 + b, Y0 + b, X1 - b, Y1 - b, Ri);
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.troi; fillPoly(ctx, O, n);          // nền băng trong suốt bao trọn
    for (let i = 0; i < 16; i++) {                   // mặt vát: hướng pháp tuyến lên → sáng, xuống → tối
      const j = (i + 1) % 16, ny = (O[i][1] + O[j][1]) / 2 - (I[i][1] + I[j][1]) / 2, nx = (O[i][0] + O[j][0]) / 2 - (I[i][0] + I[j][0]) / 2;
      const up = -ny / (Math.hypot(nx, ny) || 1) - nx / (Math.hypot(nx, ny) || 1) * 0.4;
      const alt = i % 4 === 1 || i % 4 === 2 ? 0.12 : 0;   // mặt góc xen sáng / tối với mặt kề → cạnh tách rõ
      ctx.globalAlpha = (up > 0.3 ? 0.4 : up > -0.3 ? 0.22 : 0.32) + (i % 2 ? alt : -alt / 2);
      ctx.fillStyle = up > 0.3 ? C.sang : up > -0.3 ? C['nuoc-sang'] : C.cham;
      fillPoly(ctx, [O[i], O[j], I[j], I[i]], n);
    }
    ctx.globalAlpha = 0.7; ctx.fillStyle = C.trang;  // viền trong + nét vát từ cả 16 đỉnh
    for (let i = 0; i < 16; i++) { const j = (i + 1) % 16; lineS(ctx, I[i][0], I[i][1], I[j][0], I[j][1], n); lineS(ctx, O[i][0], O[i][1], I[i][0], I[i][1], n); }
    ctx.globalAlpha = 1;                             // viền ngoài 16 cạnh: nửa dưới chàm sáng, còn lại nước sáng; đỉnh chấm trắng
    for (let i = 0; i < 16; i++) { const j = (i + 1) % 16; ctx.fillStyle = (O[i][1] + O[j][1]) / 2 > (Y0 + Y1) / 2 + R * 0.3 ? C['cham-sang'] : C['nuoc-sang']; lineS(ctx, O[i][0], O[i][1], O[j][0], O[j][1], n); }
    ctx.fillStyle = C.sang;                          // đỉnh: chấm sáng → thấy rõ góc gãy + vệt sáng chéo
    for (const p of O) ctx.fillRect(Math.round(p[0] / n) * n, Math.round(p[1] / n) * n, n, n);
    for (let i = 0; i < 3; i++) ctx.fillRect(Math.round((X0 + b + R * 0.4) / n) * n + (1 + i) * n, Math.round((Y0 + b + R * 0.4) / n) * n + (3 - i) * n, n, n);
  }
  function status(ctx, e, box, lift, t) {
    const r = { dot: false, stun: false, slow: false, ice: false, iceArt: false };
    if (!e || e.dead || !D) return r;
    const W = box.w, H = Math.max(10, box.ay), fy = e.y - lift, cx = e.x + (box.dx || 0), id = e.id || 0;
    const bar = fy - H - 3;                          // đáy thanh máu: không vẽ gì cao hơn
    begin(ctx, 0.6);                                 // sprite trạng thái nhỏ hơn hạt chiêu: không lấn át quái
    const big = W > 80 ? 2 : 1;
    // đóng băng: khối băng THẬP LỤC GIÁC pixel bọc trọn hộp hình (lề ~11%, góc bo 3 cạnh, góc hộp vẫn nằm trong), co giãn theo
    // cỡ từng con (boss to → khối to, quái bay → bọc đúng chỗ đang bay) + tinh thể băng dưới chân
    if (e.stunT > 0 && e.stunKind === 'ice' && ready('bang-tinh') && sb(3)) {
      r.ice = r.iceArt = true;
      iceOct(ctx, cx - W / 2, fy - H, cx + W / 2, fy + (box.db || 0));
      ctx.globalAlpha = 1;
      blit(ctx, 'bang-tinh', frameOf(spr('bang-tinh'), null, t, id), cx - W * 0.42, fy + 1, big);
      blit(ctx, 'bang-tinh', frameOf(spr('bang-tinh'), null, t + 0.5, id), cx + W * 0.42, fy + 1, big, true);
    }
    // làm chậm: sương lạnh dưới chân + bông tuyết rơi
    if ((e.slowT > 0 || e.zoneSlow > 0) && !r.ice && ready('suong-lanh') && sb(2)) {
      r.slow = true;
      const s = spr('suong-lanh'), sc = Math.max(1, Math.round(W * 0.9 / (s.w * PU)));
      ctx.globalAlpha = 0.85;
      blit(ctx, 'suong-lanh', frameOf(s, null, t, id), cx, fy, sc);
      const q = (t * 0.5 + id * 0.29) % 1;
      ctx.globalAlpha = step(Math.sin(q * Math.PI));
      blit(ctx, 'tuyet', 0, cx + Math.sin(id + t) * W * 0.3, fy - H * (0.8 - q * 0.7), 1);
      ctx.globalAlpha = 1;
    }
    // bỏng / độc
    if (e.poisonT > 0) {
      const fire = isFire(e.dotColor);
      if (fire && ready('lua-chay') && sb(W > 60 ? 3 : 2)) {
        r.dot = true;
        // 1–2 ngọn lửa 5×7 ô ngang vai, cao ~26% hình quái (cỡ ô theo cỡ quái, bám lưới điểm ảnh), lửa liếm 2 nhịp
        const n = W > 50 ? 2 : 1, c = Math.max(1, Math.round((H * 0.26 * G.k) / 7));
        for (let i = 0; i < n; i++) flame(ctx, cx + (n > 1 ? (i ? 0.26 : -0.28) : 0.05) * W, fy - H * (i ? 0.5 : 0.45), c, Math.floor(t * 7 + id + i * 1.3) % 2, i === 1);
        const q = (t * 1.2 + id * 0.17) % 1;      // tàn lửa bay lên
        ctx.globalAlpha = step(1 - q);
        dot(ctx, cx + Math.sin(id + t * 3) * W * 0.3, fy - H * (0.35 + q * 0.3), C['vang-nghe']);
        ctx.globalAlpha = 1;
      } else if (!fire && ready('may-doc') && sb(3)) {
        r.dot = true;
        const s = spr('may-doc'), sc = Math.max(1, Math.round(W * 0.8 / (s.w * PU)));
        ctx.globalAlpha = 0.9;
        blit(ctx, 'may-doc', frameOf(s, null, t, id), cx, fy - 1, sc);
        ctx.globalAlpha = 1;
        for (let i = 0; i < 2; i++) {
          const q = (t * 0.8 + i / 2 + id * 0.41) % 1;
          blit(ctx, 'bong-doc', q > 0.85 ? 1 : 0, cx + (i ? 0.22 : -0.18) * W + Math.sin(t * 3 + i) * 2, fy - H * (0.15 + q * 0.5), 1);
        }
      }
    }
    // choáng: 2 chim Lạc + 2 xoáy khí lượn vòng TRÊN đỉnh đầu (đỉnh bbox hình quái, thay ngôi sao hoạt hình), không đè mặt
    const stunOn = e.stunT > 0 && !['ice', 'root', 'music', 'net'].includes(e.stunKind);
    if (stunOn && ready('chim-lac') && ready('gio-xoay') && sb(4)) {
      r.stun = true;
      // đáy vòng chạm nhẹ đỉnh hình quái (±3); thanh máu vẽ sau đè lên
      const rx = Math.min(24, Math.max(12, W * 0.32));
      stunRing(ctx, cx, fy - H, rx, rx * 0.28, t, id, 4);
    }
    end(ctx);
    return r;
  }

  // ---------- hiệu ứng sự kiện (gọi 1 lần khi hiệu ứng mới xuất hiện): sinh hạt pixel
  const IMPACT = {
    fireball: (x, y) => { decal(x, y, 'no', null, 10, 0.32, { sc: 1 }); burst(x, y, 8, '#F07A1E', { speed: 120, grav: 160, size: 2.5 }); burst(x, y, 3, '#5E6470', { kind: 'soft', speed: 30, up: 30, life: 0.5 }); },
    frostbolt: (x, y) => { shards(x, y, 3, 'tuyet', null, { speed: 90, life: 0.4 }); burst(x, y, 6, '#CDEFF8', { kind: 'spark', speed: 140 }); },
    arrow: (x, y) => { decal(x, y, 'trung', null, 5, 0.18, { sc: 1 }); burst(x, y, 3, '#D9B97A', { kind: 'spark', speed: 110, life: 0.22 }); },
    bolt: (x, y) => { decal(x, y, 'trung', null, 6, 0.2, { sc: 1 }); burst(x, y, 4, '#F2C230', { kind: 'spark', speed: 130, life: 0.25 }); },
    orb: (x, y) => { decal(x, y, 'nuoc-ban', null, 10, 0.32, { sc: 1 }); burst(x, y, 5, '#7FE0D0', { speed: 90 }); },
    melon: (x, y) => burst(x, y, 10, '#B23A1E', { kind: 'soft', speed: 110, grav: 260, size: 2.5, a: 1 }),
    feather: (x, y) => burst(x, y, 6, '#F4EFE2', { speed: 60, life: 0.5 }),
    petal: (x, y) => burst(x, y, 6, '#F29A8A', { kind: 'petal', speed: 70, life: 0.6 }),
    rice: (x, y) => burst(x, y, 7, '#F4EFE2', { kind: 'soft', speed: 90, grav: 220, size: 2, a: 1 }),
    evil: (x, y) => burst(x, y, 7, '#7A4AA8', { speed: 90 }),
  };
  // điểm nhấn trúng đòn theo NGŨ HÀNH của tướng bắn: Kim ánh bạc · Mộc lá tre · Thủy nước bắn · Hỏa lửa · Thổ bụi đất
  const EL_HIT = {
    kim: (x, y) => { decal(x, y - 4, 'kim-quang', null, 6, 0.22, { sc: 1 }); burst(x, y, 3, '#D4D8DE', { kind: 'spark', speed: 120, life: 0.25 }); },
    moc: (x, y) => { burst(x, y, 3, '#3E7A2E', { kind: 'leaf', speed: 70, life: 0.6 }); },
    thuy: (x, y) => { decal(x, y + 2, 'nuoc-ban', null, 10, 0.3, { sc: 1 }); },
    hoa: (x, y) => { decal(x, y, 'lua-chay', null, 8, 0.35, { sc: 1, vy: -20 }); },
    tho: (x, y) => { decal(x, y + 2, 'bui-dat', null, 10, 0.35, { sc: 1 }); },
  };
  const EL_COL = { kim: '#D4D8DE', moc: '#7FBF3F', thuy: '#3E8FC4', hoa: '#E0583A', tho: '#D99A3E' };
  function splashFx(x, y, el, r) {
    const big = (r || 40) > 70 ? 2 : 1;
    decal(x, y - 4, !el || el === 'hoa' ? 'no' : 'no-' + el, null, 12, 0.4, { sc: big });   // nổ theo hệ (Lô 44: no-<hệ>)
    decal(x, y + 2, 'ring', EL_COL[el] || '#F07A1E', Math.max(8, (r || 40) * 0.25), 0.3, { grow: (r || 40) * 2, sy: 0.45 });
  }
  function onEffect(f) {
    const x = f.x, y = f.y;
    switch (f.type) {
      case 'impact': (IMPACT[f.kind] || IMPACT.fireball)(x, y); if (f.el && EL_HIT[f.el]) EL_HIT[f.el](x, y); if (f.splash) splashFx(x, y, f.kind === 'fireball' && !f.el ? 'hoa' : f.el, f.splash); break;
      case 'slash': decal(x, y - 4, 'chem', null, 12, 0.22, { sc: 1, flip: (f.dir || 1) < 0 }); burst(x, y, 4, '#D4D8DE', { kind: 'spark', speed: 150, life: 0.22 }); break;
      case 'xslash': case 'claw': decal(x, y - 4, 'chem', null, 14, 0.28, { sc: f.big ? 2 : 1 }); decal(x, y - 4, 'chem', null, 14, 0.28, { sc: f.big ? 2 : 1, flip: true }); decal(x, y, 'trung', null, 6, 0.2, { sc: 1 }); burst(x, y, 6, f.color || '#F2C230', { kind: 'spark', speed: 180, life: 0.3 }); break;
      case 'bash': decal(x, y - 6, 'trung', null, 10, 0.24, { sc: 2 }); decal(x, y + 4, 'bui-dat', null, 12, 0.4, { sc: 1 }); burst(x, y, 6, '#F2C230', { kind: 'spark', speed: 170 }); break;
      case 'explosion': decal(x, y - 10, 'no', null, 30, 0.5, { sc: (f.r || 60) > 70 ? 3 : 2, must: true }); decal(x, y - 24, 'khoi', null, 20, 0.9, { sc: 2, vy: -20, must: true }); decal(x, y + 4, 'bui-dat', null, 14, 0.5, { sc: 2 }); burst(x, y, 18, '#F07A1E', { speed: 220, grav: 160, life: 0.6, size: 2.5 }); burst(x, y, 6, '#5E6470', { kind: 'soft', speed: 60, up: 30, life: 0.9 }); break;
      case 'pillar': for (let i = 0; i < 6; i++) decal(x + R(-14, 14), y - R(0, 30), 'lua-chay', null, 10, R(0.4, 0.7), { sc: 2, vy: R(-90, -50), loop: true }); burst(x, y - 30, 12, '#F2C230', { speed: 60, up: 90, life: 0.8 }); break;
      case 'nova': shards(x, y - 6, 8, 'tuyet', null, { speed: 200, min: 80, life: 0.6 }); burst(x, y, 14, '#CDEFF8', { kind: 'spark', speed: 220 }); break;
      case 'snow': for (let i = 0; i < 14; i++) decal(x + R(-f.r, f.r), y + R(-f.r * 0.5, f.r * 0.3) - 60, 'tuyet', null, 4, R(0.9, 1.6), { vx: R(-15, 15), vy: R(30, 70), drag: 0.99, sc: 1, loop: true }); break;
      case 'bolt': burst(x, y, 10, '#B58AE0', { kind: 'spark', speed: 220 }); decal(x, y - 2, 'trung', null, 8, 0.25, { sc: 2 }); break;
      case 'heal': for (let i = 0; i < 3; i++) decal(x + R(-14, 14), y - R(4, 20), 'hoi', null, 6, R(0.6, 0.9), { vy: -36, sc: 1, loop: true }); rise(x, y - 10, 6, f.color || '#7FBF3F', 18); break;
      case 'dome': rise(x, y, 10, f.color || '#F2C230', (f.r || 60) * 0.6); break;
      case 'rockfall': decal(x, y, 'bui-dat', null, 14, 0.5, { sc: 2 }); burst(x, y, 10, '#7A4E2C', { kind: 'soft', speed: 110, grav: 200, life: 0.7, a: 1 }); break;
      case 'cracks': decal(x, y, 'bui-dat', null, 14, 0.5, { sc: 2 }); burst(x, y, 14, '#A8743E', { kind: 'soft', speed: 140, grav: 200, life: 0.6, a: 1 }); break;
      case 'splat': burst(x, y, 12, '#B23A1E', { kind: 'soft', speed: 140, grav: 300, size: 2.5, a: 1 }); break;
      case 'wave': decal(x, y, 'nuoc-ban', null, 14, 0.4, { sc: 2 }); burst(x, y, 16, f.color || '#3E8FC4', { speed: (f.r || 120) * 1.4, life: 0.5, size: 2.5 }); break;
      case 'gust': shards(x, y - 10, 4, 'gio-xoay', null, { speed: (f.r || 120) * 1.2, life: 0.5 }); burst(x, y, 12, f.color || '#CFC6B2', { speed: (f.r || 120) * 1.4, life: 0.5, size: 2.5 }); break;
      case 'petals': for (let i = 0; i < 12; i++) emit({ x: x + R(-(f.r || 60), f.r || 60), y: y - R(40, 90), vx: R(-20, 20), vy: R(20, 60), life: R(0.8, 1.4), size: 4, color: f.color || '#F29A8A', kind: 'petal', drag: 0.98 }); break;
      case 'beam': case 'streak': line(f.x, f.y, f.x2, f.y2, f.type === 'beam' ? 24 : 10, f.color || '#FFE7A0', { size: f.type === 'beam' ? 5 : 3 }); break;
      case 'cast': rise(x, y - 20, f.ult ? 18 : 8, f.color || '#F2C230', 26); if (f.ult) shards(x, y - 30, 6, 'kim-quang', null, { speed: 70, up: 40, life: 0.6 }); break;
      case 'evolve': shards(x, y - 30, f.big ? 10 : 6, 'kim-quang', null, { speed: f.big ? 220 : 150, life: 0.7 }); burst(x, y - 30, f.big ? 30 : 16, f.color || '#F2C230', { speed: f.big ? 240 : 160, life: 0.8 }); rise(x, y, 14, '#FFE7A0', 30); break;
      case 'levelup': case 'promote': { const hx = f.hero ? f.hero.x : x, hy = f.hero ? f.hero.y : y; decal(hx, hy - 40, 'len-cap', null, 8, 0.8, { vy: -30, sc: 1 }); rise(hx, hy - 10, 8, '#F2C230', 16); break; }
      case 'summon': decal(x, y - 6, 'khoi', null, 12, 0.5, { sc: 2 }); rise(x, y, 10, '#7FE0D0', 20); break;
      case 'proc': burst(x, y, 6, f.color || '#F2C230', { kind: 'spark', speed: 120, life: 0.3 }); break;
      case 'die': {
        const boss = typeof ENEMIES !== 'undefined' && ENEMIES[f.etype] && ENEMIES[f.etype].boss;
        if (boss) {
          // boss gục: hai vụ nổ lớn + khói bốc cao + tàn lửa + vòng hoa văn trống đồng (hạt must: luôn hiện)
          decal(x, y - 30, 'no', null, 40, 0.7, { sc: 3, must: true });
          decal(x + R(-20, 20), y - 50, 'no', null, 30, 0.6, { sc: 2, must: true });
          decal(x, y - 60, 'khoi', null, 30, 1.4, { sc: 3, vy: -26, must: true });
          decal(x, y + 2, 'ring', '#F2C230', 20, 0.7, { grow: 160, sy: 0.45, must: true });
          shards(x, y - 30, 8, 'kim-quang', null, { speed: 240, min: 90, life: 0.9, must: true });
          burst(x, y - 30, 26, '#F07A1E', { speed: 260, grav: 160, life: 0.9, must: true });
        } else {
          decal(x, y - 10, 'khoi', null, 10, 0.5, { sc: 1 });
          burst(x, y - 8, 5, '#CFC6B2', { kind: 'soft', speed: 70, grav: 200, size: 2, a: 1 });
        }
        break;
      }
      case 'scorch': {
        const rr = f.r || 26;
        for (let i = 0; i < (f.r ? 6 : 3); i++) decal(x + R(-rr, rr), y + R(-rr * 0.4, rr * 0.3), 'lua-chay', null, 9, R(0.5, (f.max || 1.2) * 0.8), { vy: R(-14, -6), sc: 1, loop: true });
        burst(x, y - 8, 4, '#5E6470', { kind: 'soft', speed: 20, up: 30, life: 1 });
        break;
      }
      default: break;
    }
  }

  // ---------- hiệu ứng vẽ mỗi khung (thay case tương ứng trong drawEffects của main.js). true = đã vẽ pixel, bỏ phần cũ.
  const OWN = new Set(['ring', 'slash', 'spark', 'bolt', 'scorch', 'bash', 'streak', 'beam', 'volley', 'warn', 'rain', 'pillar', 'meteor',
    'explosion', 'vortex', 'xslash', 'claw', 'nova', 'snow', 'heal', 'revive', 'wave', 'gust', 'dome', 'cracks', 'splat', 'petals', 'summon',
    'proc', 'equipflash', 'promote', 'die', 'coin', 'lob', 'levelup', 'evolve', 'rockfall', 'impact',
    'skyride', 'tiger', 'bird', 'horse', 'sweep', 'mark', 'afterimage', 'hook', 'raise', 'notes']);
  const LOB = { den: 'vat-den-troi', chai: 'vat-chai', gom: 'vat-binh-gom', dua: 'dua' };
  function drawFx(ctx, f, p, t) {
    if (!D || !OWN.has(f.type) || (f.x === undefined && !f.hero && f.type !== 'skyride')) return false;
    if (f.type === 'mark' && (!f.target || f.target.dead)) return false;
    const k = 1 - p, x = f.x, y = f.y;
    begin(ctx);
    ctx.globalAlpha = step(Math.min(1, k * 1.5));
    const col = (c, d) => pal(c || d);
    switch (f.type) {
      case 'ring': ring(ctx, x, y, Math.max(1, f.r * (1 - k * 0.6)), Math.max(1, f.r * (1 - k * 0.6)), col(f.color, '#F2C230')); break;
      case 'slash': case 'xslash': case 'claw': case 'impact': case 'die': break;     // hạt pixel (onEffect) là đủ
      case 'spark': { const d = p * (f.d || 22); dot(ctx, x + Math.cos(f.a) * d, y + Math.sin(f.a) * d + p * p * 10, col(f.color, '#F2C230'), k > 0.5 ? 2 : 1); break; }
      case 'bolt': {
        ctx.globalAlpha = 1;
        if (Math.random() < 0.8 || p < 0.3) { zig(ctx, x + 6, y - 260, x, y - 6, C.sang, 8); zig(ctx, x + 6, y - 260, x, y - 6, C['tim-sang'], 8); zig(ctx, x, y - 120, x - 40, y - 60, C['tim-sang'], 4); }
        const s = spr('set');
        if (s) blit(ctx, 'set', frameOf(s, null, t), x, y, 2);
        break;
      }
      case 'scorch': ctx.globalAlpha = step(0.5 * k); ring(ctx, x, y + 2, f.r || 26, (f.r || 26) * 0.4, C['dat-toi'], { c: 1 }); ring(ctx, x, y + 2, (f.r || 26) * 0.7, (f.r || 26) * 0.28, C.toi); break;
      case 'bash': ring(ctx, x, y + 8, 12 + p * 34, 5 + p * 13, C['vang-nghe'], { c: 2 }); ring(ctx, x, y + 8, 10 + p * 26, 4 + p * 10, C['vang-sang'], { dash: 2 }); break;
      case 'streak': case 'beam': {
        const hx = x + (f.x2 - x) * Math.min(1, p * 2.2), hy = y + (f.y2 - y) * Math.min(1, p * 2.2);
        const w = f.type === 'beam' ? 3 : 2;
        seg(ctx, x, y, hx, hy, col(f.color, '#F2C230'), w);
        seg(ctx, x, y, hx, hy, C.sang, 1);
        if (f.type === 'beam') zig(ctx, x, y, hx, hy, C['vang-sang'], 6);
        else dot(ctx, hx, hy, C.sang, 3);
        break;
      }
      case 'volley': for (let i = 0; i < 6; i++) { const ox = (i - 2.5) * 6, oy = -p * 160 - i * 6; seg(ctx, x + ox, y + oy, x + ox, y + oy - 12, C.cat); dot(ctx, x + ox, y + oy - 14, C['dong-sang']); } break;
      case 'warn': {
        const pulse = 0.5 + Math.sin(t * 20) * 0.3;
        ctx.globalAlpha = step(0.45 + pulse * 0.4);
        ring(ctx, x, y, f.r, f.r * 0.45, col(f.color, '#E0583A'), { dash: 3, phase: t * 2 });
        ring(ctx, x, y, f.r * p, f.r * 0.45 * p, col(f.color, '#E0583A'));
        break;
      }
      case 'rain': {
        if (f.delay > 0) break;
        ctx.globalAlpha = 1;
        for (let i = 0; i < 22; i++) {
          const rr = f.r * (((i * 37) % 100) / 100), a = i * 2.4;
          const tx = x + Math.cos(a) * rr, ty = y + Math.sin(a) * rr * 0.45;
          const fall = Math.min(1, p * 1.6 + (i % 4) * 0.08), ay = ty - (1 - fall) * 160;
          if (fall < 1) { seg(ctx, tx + 3, ay - 14, tx, ay, C.cat); dot(ctx, tx, ay, C['dong-sang']); } else { ctx.globalAlpha = step(k * 1.5); seg(ctx, tx, ty, tx + 2, ty - 6, C.cat); ctx.globalAlpha = 1; }
        }
        break;
      }
      case 'pillar': {
        const h = 110 * Math.min(1, p * 3), s = spr('lua-chay');
        ring(ctx, x, y, 40, 15, C.son, { dash: 2, phase: t * 4 });
        if (s) for (let i = 0; i < 5; i++) blit(ctx, 'lua-chay', frameOf(s, null, t, i), x + Math.sin(i * 2.1 + t * 6) * 8, y - (h * i) / 5, 2, i % 2 === 1);
        break;
      }
      case 'meteor': {
        ctx.globalAlpha = 1;
        const mx = x + k * 140, my = y - k * 320;
        for (let i = 6; i >= 1; i--) { ctx.globalAlpha = step(0.9 - i * 0.12); dot(ctx, mx + i * 9, my - i * 20, i < 3 ? C['vang-nghe'] : C.son, Math.max(1, 4 - (i >> 1))); }
        ctx.globalAlpha = 1;
        const s = spr('no');
        if (s) blit(ctx, 'no', s.anims.main.start + 1, mx, my, 2);
        break;
      }
      case 'explosion': ring(ctx, x, y + 2, f.r * (0.3 + p * 0.8), f.r * (0.3 + p * 0.8) * 0.45, C.son, { dash: 2, phase: p * 6 }); break;
      case 'vortex': for (let i = 0; i < 3; i++) { const a0 = t * 8 + i * 2.1, rr = 10 + i * 8 * k; for (let j = 0; j < 6; j++) { const a = a0 + j * 0.35; dot(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, col(f.color, '#3E8FC4')); } } break;
      case 'nova': { const r = f.r * Math.min(1, p * 1.8); ring(ctx, x, y, r, r * 0.45, C.troi, { c: 2 }); ring(ctx, x, y, r * 0.9, r * 0.4, C['nuoc-sang'], { dash: 2 }); const s = spr('bang-tinh'); if (s) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; blit(ctx, 'bang-tinh', 0, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.45, 1, i % 2 === 1); } break; }
      case 'snow': { ctx.globalAlpha = step(Math.min(1, k * 2)); ring(ctx, x, y, f.r, f.r * 0.45, C.troi, { dash: 3, phase: t }); for (let i = 0; i < 30; i++) { const a = i * 2.4 + t * 1.5, rr = f.r * (((i * 37) % 100) / 100), fy = ((t * 70 + i * 23) % 50) - 25; dot(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7 + fy, i % 5 ? C.trang : C.troi, i % 5 ? 1 : 2); } break; }
      case 'heal': ring(ctx, x, y, f.r * p, f.r * 0.45 * p, col(f.color, '#7FBF3F'), { drum: 8, drumColor: C['la-sang'] }); break;
      case 'revive': { ctx.globalAlpha = step(k); const w = 14 + p * 6; for (let i = 0; i < 14; i++) { const yy = y - i * 10; ctx.globalAlpha = step(k * (1 - i / 14)); seg(ctx, x - w, yy, x + w, yy, i % 2 ? C['vang-sang'] : C['vang-nghe']); } ring(ctx, x, y, 24, 10, C['vang-nghe'], { drum: 6 }); break; }
      case 'wave': { const r = f.r * (0.3 + p * 0.8); ring(ctx, x, y, r, r * 0.45, col(f.color, '#3E8FC4'), { c: 2 }); ring(ctx, x, y, r * 0.85, r * 0.38, C.troi, { dash: 3 }); break; }
      case 'gust': for (let i = 0; i < 4; i++) { const r = f.r * (0.3 + p * 0.7) - i * 8; if (r <= 0) continue; for (let j = 0; j < 8; j++) { const a = -0.6 + i * 0.25 + j * 0.13; dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, col(f.color, '#CFC6B2')); } } break;
      case 'dome': { const r = f.r * Math.min(1, p * 2); ctx.globalAlpha = step(k * 0.8); ring(ctx, x, y, r, r * 0.25, col(f.color, '#F2C230'), { drum: 10 }); for (let i = 0; i <= 16; i++) { const a = Math.PI + (i / 16) * Math.PI; dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5, col(f.color, '#F2C230')); } break; }
      case 'cracks': for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3; const mx = x + Math.cos(a) * f.r * 0.5, my = y + Math.sin(a) * f.r * 0.2 + 4; seg(ctx, x, y, mx, my, C.toi); seg(ctx, mx, my, x + Math.cos(a + 0.2) * f.r * 0.9, y + Math.sin(a + 0.2) * f.r * 0.4, C.toi); } break;
      case 'rockfall': { ctx.globalAlpha = 1; const yy = y - 120 * Math.max(0, 1 - p * 2.5); ring(ctx, x, yy - 12, 18, 13, C['dat-toi'], { c: 2 }); ring(ctx, x, yy - 12, 13, 9, C.dat, { c: 2 }); dot(ctx, x - 5, yy - 17, C['dat-sang'], 2); break; }
      case 'splat': ring(ctx, x, y, f.r * 0.6, f.r * 0.25, C.son, { dash: 2 }); break;
      case 'petals': break;
      case 'summon': ring(ctx, x, y, 10 + p * 34, 4 + p * 12, C['vang-nghe'], { drum: 6 }); break;
      case 'proc': { ring(ctx, x, y, f.r * (0.4 + p * 0.8), f.r * (0.4 + p * 0.8), col(f.color, '#F2C230')); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + f.r, r0 = f.r * (0.3 + p * 0.6); seg(ctx, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * (r0 + 6 * k), y + Math.sin(a) * (r0 + 6 * k), col(f.color, '#F2C230')); } break; }
      case 'equipflash': case 'promote': { const fl = f.type === 'promote' ? Math.abs(Math.sin(p * Math.PI * 2)) : Math.sin(p * Math.PI); ctx.globalAlpha = step(fl); const r = f.type === 'promote' ? 16 : 10 + p * 8; ring(ctx, x, y, r, r, col(f.color, '#F2C230'), { c: 2 }); dot(ctx, x, y, C.sang, 3); break; }
      case 'coin': { const yy = y - 18 * Math.sin(Math.min(1, p * 1.5) * Math.PI * 0.5), s = spr('xu'); ctx.globalAlpha = step(Math.min(1, k / 0.4)); if (s) blit(ctx, 'xu', frameOf(s, null, t), x, yy, 1); break; }
      case 'lob': { const nm = LOB[f.kind] || 'dua', xx = x + (f.x2 - x) * p, yy = y + (f.y2 - y) * p - Math.sin(p * Math.PI) * 60, s = spr(nm); ctx.globalAlpha = 1; if (!s) { end(ctx); return false; } blit(ctx, nm, frameOf(s, null, t), xx, yy, 1); break; }
      case 'skyride': {
        // Gióng bay dọc sông (R) / tảng đá Lạc Hầu lăn ngược dòng: vệt chấm pixel + sprite
        if (typeof PATH === 'undefined') { end(ctx); return false; }
        const d = f.d1 + (f.d2 - f.d1) * Math.min(1, p * 1.3), stp = f.d2 >= f.d1 ? 14 : -14;
        ctx.globalAlpha = 1;
        let i = 0;
        for (let dd = f.d1; stp > 0 ? dd <= d : dd >= d; dd += stp, i++) { const q = PATH.at(dd); dot(ctx, q.x, q.y - (f.rock ? 6 : 30), f.rock ? (i % 2 ? C.dat : C['dat-sang']) : (i % 2 ? C.lua : C['vang-nghe']), 2); }
        const q = PATH.at(d), nm = f.rock ? 'vat-da-lan' : 'giong-bay', s = spr(nm);
        if (!s) { end(ctx); return false; }
        blit(ctx, nm, frameOf(s, null, t), q.x, q.y - (f.rock ? 16 : 34), 2, f.d2 < f.d1);
        break;
      }
      case 'tiger': case 'bird': {
        const e = f.target, s = spr(f.type === 'tiger' ? 'ho-ba-vi' : f.kind === 'lac' ? 'chim-lac' : 'chim-than');
        if (!e || !s) { end(ctx); return false; }
        const q = Math.min(1, p * (f.type === 'tiger' ? 1.15 : 1.2));
        const xx = x + (e.x - x) * q, yy = f.type === 'tiger' ? y + (e.y - y) * q - Math.sin(q * Math.PI) * 26 : y + (e.y - 20 - y) * q - Math.sin(q * Math.PI) * 30;
        ctx.globalAlpha = 1;
        blit(ctx, f.type === 'tiger' ? 'ho-ba-vi' : f.kind === 'lac' ? 'chim-lac' : 'chim-than', frameOf(s, null, t * 2), xx, yy, f.kind === 'lac' ? 2 : 1, e.x < x);
        break;
      }
      case 'horse': {
        const s = spr('ngua-sat');
        if (!s) { end(ctx); return false; }
        const xx = x + (f.x2 - x) * p, yy = y + (f.y2 - y) * p - Math.sin(p * Math.PI) * 30;
        ctx.globalAlpha = 1;
        for (let i = 1; i < 6; i++) { ctx.globalAlpha = step(1 - i / 6); dot(ctx, xx - (f.x2 - x) * 0.05 * i, yy - 6 - i, i < 3 ? C['vang-nghe'] : C.lua, 2); }
        ctx.globalAlpha = 1;
        blit(ctx, 'ngua-sat', frameOf(s, null, t * 2), xx, yy + 8, 1, f.x2 < x);
        break;
      }
      case 'sweep': {
        // gậy tre quét vòng cung: dải ô 2 lớp
        const a0 = f.dir > 0 ? -1.6 : Math.PI + 1.6, r = f.r * 0.7;
        for (let i = 0; i <= 14; i++) { const a = a0 - 1.2 + (p * 2.4 + (i / 14) * 1.2) * f.dir; dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, i > 10 ? C['vang-sang'] : col(f.color, '#C2A26A'), 2); }
        break;
      }
      case 'mark': {
        // dấu săn: vòng + 4 khấc son, xoay theo bậc 45°
        const e = f.target, r = 26 - p * 10, rot = Math.round(p * 6) * Math.PI / 4;
        ctx.globalAlpha = 1;
        ring(ctx, e.x, e.y - 10, r, r, C['son-sang']);
        for (let i = 0; i < 4; i++) { const a = rot + (i * Math.PI) / 2; seg(ctx, e.x + Math.cos(a) * (r - 6), e.y - 10 + Math.sin(a) * (r - 6), e.x + Math.cos(a) * (r + 5), e.y - 10 + Math.sin(a) * (r + 5), C['son-sang']); }
        break;
      }
      case 'afterimage': for (let i = 0; i < 5; i++) { const q = i / 4, xx = x + (f.x2 - x) * q, yy = y + (f.y2 - y) * q; ctx.globalAlpha = step(k * (0.25 + q * 0.5)); seg(ctx, xx, yy - 8, xx, yy - 34, col(f.color, '#9478B0'), 3); dot(ctx, xx, yy - 42, col(f.color, '#9478B0'), 3); } break;
      case 'hook': {
        const h = f.hero, e = f.target;
        if (!h || !e) { end(ctx); return false; }
        ctx.globalAlpha = 1;
        const out = Math.min(1, p / 0.35), hx = h.x, hy = h.y - 22, tx = hx + (e.x - hx) * out, ty = hy + (e.y - 8 - hy) * out;
        seg(ctx, hx, hy, tx, ty, C['dat-toi'], 2); seg(ctx, hx, hy, tx, ty, col(f.color, '#5E7434'));
        dot(ctx, tx, ty, C['la-ma'], 3);
        break;
      }
      case 'raise': {
        // Mọc Núi: núi đất bậc thang pixel trồi lên
        const hgt = 36 * Math.sin(Math.min(1, p * 1.5) * Math.PI / 2) * (p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1);
        ctx.globalAlpha = 1;
        const rows = Math.max(1, Math.round(hgt / PU));
        for (let i = 0; i < rows; i++) { const q = i / rows, w = 26 * (1 - q); seg(ctx, x - w, y - i * PU, x + w * 0.8, y - i * PU, i > rows * 0.7 ? C['dat-sang'] : i % 3 ? C.dat : C['dat-toi']); }
        break;
      }
      case 'notes': {
        // nốt nhạc pixel (đầu 2×2 + đuôi) xoay vòng, bay lên
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + t, r = 20 + p * f.r, nx = x + Math.cos(a) * r, ny = y - 30 + Math.sin(a) * r * 0.45 - p * 20, c = i % 2 ? C['vang-nghe'] : C.trang;
          dot(ctx, nx, ny, c, 2); seg(ctx, nx + PU, ny, nx + PU, ny - 4 * PU, c); if (i % 3 === 0) seg(ctx, nx + PU, ny - 4 * PU, nx + 3 * PU, ny - 3 * PU, c);
        }
        break;
      }
      case 'levelup': {
        const hx = f.hero ? f.hero.x : x, hy = f.hero ? f.hero.y : y;
        ctx.globalAlpha = step(Math.min(1, k * 1.6));
        ring(ctx, hx, hy, 16 + p * 22, (16 + p * 22) * 0.4, C['vang-nghe'], { drum: 5, drumColor: C['dong-sang'] });
        end(ctx);
        // chữ "Cấp N" giữ nguyên (chữ không đổi sang pixel ở lô này)
        const ty = hy - 66 - p * 22;
        ctx.save();
        ctx.globalAlpha = Math.min(1, k * 2.2);
        ctx.font = '800 15px "Alegreya SC", serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(13,11,8,0.9)';
        const str = f.count > 1 ? `+${f.count} cấp` : `Cấp ${f.lv}`;
        ctx.strokeText(str, hx, ty); ctx.fillStyle = '#FFD66B'; ctx.fillText(str, hx, ty);
        ctx.restore();
        return true;
      }
      case 'evolve': {
        const hx = f.hero ? f.hero.x : x, hy = f.hero ? f.hero.y : y;
        const c1 = Math.sin(Math.PI * Math.min(1, p / 0.85));
        ctx.globalAlpha = step(c1);
        const w = 30 * (0.6 + 0.4 * c1);
        for (let i = 0; i < 15; i++) { const yy = hy - i * 10, ww = w * (1 - i / 22); ctx.globalAlpha = step(c1 * (1 - i / 15)); seg(ctx, hx - ww, yy, hx + ww, yy, i % 2 ? C['dong-sang'] : C['vang-sang']); }
        ctx.globalAlpha = step(c1);
        ring(ctx, hx, hy, 22 + c1 * 8, (22 + c1 * 8) * 0.4, C['dong-sang'], { drum: 5, drumColor: C['vang-nghe'] });
        if (p > 0.55) { const q = (p - 0.55) / 0.45; ctx.globalAlpha = step(1 - q); ring(ctx, hx, hy, 20 + q * 40, (20 + q * 40) * 0.4, C['vang-nghe'], { drum: 4 }); }
        break;
      }
      default: end(ctx); return false;
    }
    end(ctx);
    return true;
  }

  // ---------- các chỗ vẽ khác (móc ở main.js / render.js; true = đã vẽ pixel, false = vẽ cách cũ)
  // vùng đất trên đường: vệt lửa dọc sông, ruộng lúa, Cây Đa Thần, đá núi (main.js drawZones)
  function zone(ctx, z, t) {
    if (!D) return false;
    const k = Math.min(1, z.ttl / 0.4, (z.max - z.ttl) / 0.25);
    if (z.kind === 'fire') {
      const s = spr('lua-chay');
      if (!s || typeof PATH === 'undefined') return false;
      begin(ctx);
      ctx.globalAlpha = step(k);
      let i = 0;
      for (let d = z.d1; d <= z.d2; d += 12, i++) {
        const q = PATH.at(d);
        if (i % 2) { dot(ctx, q.x, q.y, C.son, 2); continue; }
        blit(ctx, 'lua-chay', frameOf(s, null, t, i * 0.7), q.x, q.y + 2, 1, i % 4 === 0);
      }
      end(ctx);
      return true;
    }
    if (z.kind === 'rice') {
      begin(ctx);
      ctx.globalAlpha = step(k);
      ring(ctx, z.x, z.y, z.r, z.r * 0.45, C.cat, { dash: 3 });
      for (let i = 0; i < 22; i++) {
        const a = i * 2.4, rr = z.r * (((i * 37) % 100) / 100), x = z.x + Math.cos(a) * rr, y = z.y + Math.sin(a) * rr * 0.45;
        const sw = Math.round(Math.sin(t * 3 + i)) * PU;
        seg(ctx, x, y, x + sw, y - 12, C['reu-sang']); dot(ctx, x + sw, y - 14, C['vang-nghe'], 2);
      }
      end(ctx);
      return true;
    }
    if (z.kind === 'tree') {
      const s = spr('cay-da');
      if (!s) return false;
      begin(ctx);
      ctx.globalAlpha = step(k);
      ring(ctx, z.x, z.y, z.r, z.r * 0.45, C['la-ma'], { dash: 2, phase: t * 2 });
      if (z.heal) ring(ctx, z.x, z.y, z.heal.r, z.heal.r * 0.45, C['la-sang'], { dash: 3, phase: -t * 3 });
      const grow = Math.min(1, (z.max - z.ttl) / 0.5);
      blit(ctx, 'cay-da', frameOf(s, null, t), z.x, z.y + 2 - (1 - grow) * 10, grow > 0.5 ? 2 : 1);
      end(ctx);
      return true;
    }
    if (z.kind === 'rock') {
      const s = spr('vat-da-lan');
      if (!s) return false;
      begin(ctx);
      ctx.globalAlpha = step(k);
      ring(ctx, z.x, z.y, z.r, z.r * 0.45, C.dat, { dash: 2 });
      const grow = Math.min(1, (z.max - z.ttl) / 0.3);
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9, rr = z.r * (0.25 + ((i * 41) % 70) / 100);
        blit(ctx, 'vat-da-lan', s.anims.main.start + (i % 4), z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr * 0.45 + (1 - grow) * 8, 1);
      }
      end(ctx);
      return true;
    }
    return false;
  }
  // đàn Lạc Tử chặn đường (main.js drawBlocks): 7 đứa trẻ pixel đứng 2 hàng
  function lacTu(ctx, p, t, k) {
    const s = spr('lac-tu');
    if (!s) return false;
    begin(ctx);
    ctx.globalAlpha = step(k);
    for (let i = 0; i < 7; i++) {
      const x = p.x - 24 + (i % 4) * 16 + (i > 3 ? 8 : 0), y = p.y + (i > 3 ? 6 : -6);
      blit(ctx, 'lac-tu', frameOf(s, null, t, i * 0.5), x, y, 1, i % 2 === 1);
    }
    end(ctx);
    return true;
  }
  // hào quang đốt quanh boss / quái (render.js, toạ độ đã dịch về chân quái): trống trận · lửa ma · mưa gió (Thủy Tinh)
  function aura(ctx, a, t) {
    if (!D) return false;
    const R = a.radius;
    begin(ctx);
    const c = pal(a.color || '#3478A6');
    if (a.kind === 'drum') {
      ctx.globalAlpha = 0.6;
      ring(ctx, 0, 0, R, R * 0.45, c, { dash: 2, drum: 7, drumColor: C['dong-sang'] });
      for (let i = 0; i < 3; i++) { const q = (t * 0.9 + i / 3) % 1; ctx.globalAlpha = step((1 - q) * 0.8); ring(ctx, 0, 0, R * q, R * q * 0.45, c); }
    } else if (a.kind) {
      ctx.globalAlpha = 0.6;
      ring(ctx, 0, 0, R, R * 0.45, c, { dash: 2, phase: t * 2 });
      for (let i = 0; i < 10; i++) { const q = (t * 0.6 + i / 10) % 1, an = i * 2.4; ctx.globalAlpha = step((1 - q) * 0.9); dot(ctx, Math.cos(an) * R * 0.7, Math.sin(an) * R * 0.3 - q * 50, c, q < 0.5 ? 2 : 1); }
    } else {
      ctx.globalAlpha = 0.55;
      ring(ctx, 0, 0, R, R * 0.45, C['nuoc-sang'], { dash: 3, phase: t * 2 });
      for (let i = 0; i < 14; i++) {
        const rx = ((i * 53 + t * 40) % (R * 2)) - R, ry = (((i * 31) % 60) - 30) + ((t * 260 + i * 40) % 80) - 60;
        ctx.globalAlpha = 0.8; seg(ctx, rx, ry, rx - 4, ry + 12, C.troi);
      }
    }
    end(ctx);
    return true;
  }
  // hiệu ứng quái biến thể (render.js drawEnemyFxBack, toạ độ khung quái): hạt pixel theo loại; ma / bóng tối = cụm khói
  const EFX = { fire: ['lua-sang', 'lua'], frost: ['troi', 'nuoc-sang'], ghost: ['tim-sang', 'trang-xam'], gold: ['vang-sang', 'vang-nghe'],
    steel: null, shadow: ['tim-toi', 'khoi'], poison: ['la-ma', 'reu-sang'], water: ['nuoc-sang', 'ngoc-sang'] };
  function enemyFx(ctx, kind, w, h, t, id, fly) {
    if (!D || !(kind in EFX)) return false;
    const cs = EFX[kind];
    if (!cs) return true;
    begin(ctx);
    const base = fly ? h * 0.5 : 0, n = 6;
    for (let i = 0; i < n; i++) {
      const p = (t * (kind === 'fire' ? 1.1 : 0.6) + i / n + id * 0.13) % 1;
      const x = Math.sin(i * 2.3 + t + id) * w * 0.35, y = base - p * h * (kind === 'shadow' ? 0.8 : 1.1);
      ctx.globalAlpha = step(Math.sin(p * Math.PI) * (kind === 'shadow' || kind === 'ghost' ? 0.6 : 0.9));
      dot(ctx, x, y, C[cs[i % 2]], kind === 'shadow' || kind === 'ghost' ? 3 : p < 0.5 ? 2 : 1);
    }
    end(ctx);
    return true;
  }
  // vòng tinh anh dưới chân quái + dấu nhỏ theo loại (render.js; toạ độ đã dịch về chân quái)
  const ELITE_ICON = { armored: 'khien-giap', regen: 'giot-nuoc', swift: 'song-cuon' };
  function elite(ctx, kind, color, w, t) {
    if (!D) return false;
    begin(ctx);
    ctx.globalAlpha = step(0.6 + Math.sin(t * 6) * 0.3);
    ring(ctx, 0, 2, w * 0.55, w * 0.18, pal(color), { c: 1, drum: kind === 'shield' ? 0 : 6, drumColor: pal(color) });
    if (kind === 'shield') ring(ctx, 0, -w * 0.4, w * 0.55, w * 0.6, C['nuoc-sang'], { dash: 2, phase: t * 3 });
    ctx.globalAlpha = 1;
    const nm = ELITE_ICON[kind];
    if (nm && spr(nm)) blit(ctx, nm, frameOf(spr(nm), null, t), -w * 0.45, -4 + Math.round(Math.sin(t * 3)) * PU, 1);
    end(ctx);
    return true;
  }
  // vòng choáng: elip xoáy khí nét 2 ô (bóng tối bên dưới cho nổi trên mọi nền) + chim Lạc / xoáy khí đậu trên vòng,
  // đáy vòng chạm đỉnh đầu headTop; mỗi sprite đặt đáy lên đường vòng → không thòng xuống mặt. Gọi sau begin
  function stunRing(ctx, cx, headTop, rx, ry, t, id, cnt) {
    const u = G.n / G.k, y0 = headTop - ry - 2 * u, items = [];
    for (let i = 0; i < cnt; i++) { const a = t * 3.2 + (i * Math.PI * 2) / cnt; items.push({ a, z: Math.sin(a), bird: i % 2 === 0 }); }
    items.sort((p, q) => p.z - q.z);                // sau trước: phía sau vẽ trước
    ring(ctx, cx, y0 + u, rx, ry, C.toi, { dash: 3, phase: t * 6, c: 2 });
    ring(ctx, cx, y0, rx, ry, C.trang, { dash: 3, phase: t * 6, c: 2 });
    for (const it of items) {
      const nm = it.bird ? 'chim-lac' : 'gio-xoay', sp = spr(nm);
      const x = cx + Math.cos(it.a) * rx, y = y0 + it.z * ry - (sp.h - sp.ay) * u;
      ctx.globalAlpha = it.z < -0.3 ? 0.7 : 1;
      blit(ctx, nm, frameOf(sp, null, t, id + (it.bird ? 0 : it.a)), x, y, 1, it.bird && Math.sin(it.a) < 0);
    }
    ctx.globalAlpha = 1;
  }
  // tướng bị choáng: chim Lạc + xoáy khí lượn trên vòng xoáy (thay ngôi sao), đáy vòng chạm đỉnh đầu headTop
  function heroStun(ctx, x, headTop, t) {
    if (!spr('chim-lac') || !spr('gio-xoay')) return false;
    begin(ctx, 0.6);
    stunRing(ctx, x, headTop, 14, 14 * 0.3, t, 0, 2);
    end(ctx);
    return true;
  }
  // tướng sa lầy: vũng bùn nước chàm + gợn vòng pixel
  function bog(ctx, x, y, rx, ry, t) {
    if (!D) return false;
    begin(ctx);
    ctx.globalAlpha = 0.85;
    ring(ctx, x, y - 2, rx, ry, C.cham, { c: 2 });
    ring(ctx, x, y - 2, rx * 0.6, ry * 0.6, C['cham-sang'], { dash: 2 });
    for (let i = 0; i < 2; i++) { const p = (t * 0.8 + i * 0.5) % 1; ctx.globalAlpha = step(1 - p); ring(ctx, x, y - 2, rx * (0.7 + p * 0.8), ry * (0.7 + p * 0.7), C['nuoc-sang']); }
    end(ctx);
    return true;
  }
  // hào quang phụ kiện huyền thoại dưới chân tướng (render.js drawAccAura, toạ độ chân tướng): vòng + chấm hoa văn trống đồng
  function accAura(ctx, a, s, t, glowOnly) {
    if (!D) return false;
    if (glowOnly) return true;                       // pixel: không quầng mềm
    const k = s / 0.28, rx = 30 * (typeof DK !== 'undefined' ? DK : 1) * k, ry = rx / 3;
    const c = pal(a.kind === 'copper' ? '#C8603A' : a.color);
    begin(ctx);
    ctx.globalAlpha = step(0.6 + Math.sin(t * 3) * 0.15);
    ring(ctx, 0, 0, rx, ry, c, { drum: 6, drumColor: C['vang-nghe'] });
    if (a.kind === 'drum') for (let i = 0; i < 2; i++) { const p = (t * 0.7 + i * 0.5) % 1; ctx.globalAlpha = step((1 - p) * 0.7); ring(ctx, 0, 0, rx * (1 + p * 0.6), ry * (1 + p * 0.6), c); }
    for (let i = 0; i < 3; i++) { const q = (t * 0.5 + i / 3) % 1; ctx.globalAlpha = step(1 - q); dot(ctx, Math.sin(i * 2.1 + t) * rx * 0.6, -q * 40 * k, c, 1); }
    end(ctx);
    return true;
  }

  // ---------- hào quang theo bậc của tướng (render.js; toạ độ chân tướng hoặc khung 200×230 của tướng)
  // Thần tinh (asc): vòng lửa thần nét đứt + tàn lửa bay lên
  function ascAura(ctx, asc, s, t) {
    if (!D) return false;
    const k = s / 0.28, rx = 30 * (typeof DK !== 'undefined' ? DK : 1) * k, ry = rx / 3;
    begin(ctx);
    for (let i = 0; i < asc; i++) { ctx.globalAlpha = 0.8 - i * 0.15; ring(ctx, 0, 0, rx * (1 + i * 0.22), ry * (1 + i * 0.22), i % 2 ? C.lua : C['son-sang'], { dash: 3, phase: (i % 2 ? 1 : -1) * t * 2 }); }
    for (let i = 0; i < 2 + asc; i++) { const a = i * 2.4 + t * 0.7, q = (t * 0.7 + i * 0.37) % 1; ctx.globalAlpha = step((1 - q) * 0.8); dot(ctx, Math.cos(a) * rx * 0.8, Math.sin(a) * ry * 0.8 - q * 34 * k, i % 2 ? C['lua-sang'] : C.lua); }
    end(ctx);
    return true;
  }
  // tiến hoá ★1–★3: vòng hoa văn trống đồng (chấm xoay ngược chiều mỗi vòng)
  function evoAura(ctx, tier, attrColor, s, t) {
    if (!D || !tier) return false;
    const k = s / 0.28, rx = 24 * (typeof DK !== 'undefined' ? DK : 1) * k, ry = rx / 3;
    begin(ctx);
    for (let i = 0; i < tier; i++) {
      const f = 1 - i * 0.24, c = i === 1 ? pal(attrColor) : C['dong-sang'];
      ctx.globalAlpha = 0.85;
      ring(ctx, 0, 0, rx * f, ry * f, c);
      const n = 12 - i * 2;
      for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2 + t * (i % 2 ? -0.5 : 0.4); dot(ctx, Math.cos(a) * rx * f * 0.88, Math.sin(a) * ry * f * 0.88, j % 3 ? c : C['vang-nghe']); }
    }
    end(ctx);
    return true;
  }
  // khói hào quang Tím / Vàng (khung 200×230): cụm ô khói bay lên
  function smokeAura(ctx, t, rgb, k, h) {
    if (!D) return false;
    const m = /(\d+)\D+(\d+)\D+(\d+)/.exec(String(rgb));
    const c = m ? pal('#' + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, '0')).join('')) : C['tim-sang'];
    const seed = ((h && h.id) || 0) * 1.37, n = Math.round(6 + 3 * k);
    begin(ctx);
    for (let i = 0; i < n; i++) {
      const p = (t * 0.32 + i / n + seed) % 1;
      ctx.globalAlpha = step(Math.sin(p * Math.PI) * 0.5 * Math.min(1.7, k));
      dot(ctx, 100 + Math.sin(i * 2.1 + t * 0.9 + seed) * (26 + p * 40), 215 - p * (170 + 30 * k), c, p < 0.5 ? 3 : 2);
    }
    end(ctx);
    return true;
  }
  // bụi sáng Tím / Vàng + lửa vàng đồ Huyền thoại quanh chân (khung tướng, gốc ở chân)
  function packFront(ctx, L, legendGear, t, hgt) {
    if (!D) return false;
    begin(ctx);
    if (L) {
      const n = L === 'legendary' ? 9 : 6, c = L === 'epic' ? C['tim-sang'] : C['vang-nghe'];
      for (let i = 0; i < n; i++) { const p = (t * 0.45 + i / n) % 1; ctx.globalAlpha = step(Math.sin(p * Math.PI)); dot(ctx, Math.sin(i * 2.7 + t * 0.8) * 70, -p * hgt * 1.05, c, p < 0.4 ? 3 : 2); }
    }
    if (legendGear && spr('lua-chay')) for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.9; blit(ctx, 'lua-chay', frameOf(spr('lua-chay'), null, t, i), (i - 1.5) * 34, 0, 3, i % 2 === 1); }
    end(ctx);
    return true;
  }
  // Thần tinh: ngọc lam bay vòng quanh người (thay ngôi sao), khung 200×230
  function ascGems(ctx, t, asc, L, front) {
    if (!spr('ngoc')) return false;
    begin(ctx);
    for (let i = 0; i < asc; i++) {
      const a = t * 1.6 + i * (Math.PI * 2 / asc), z = Math.sin(a);
      if ((z > 0) !== front) continue;
      ctx.globalAlpha = z < 0 ? 0.7 : 1;
      blit(ctx, L === 'epic' ? 'kim-quang' : 'ngoc', frameOf(spr(L === 'epic' ? 'kim-quang' : 'ngoc'), null, t, i), 100 + Math.cos(a) * 78, 130 + z * 18, 4);
    }
    end(ctx);
    return true;
  }
  // vầng mặt trời trống đồng sau lưng (★★★ / Thần tinh 3): vòng + 12 tia, xoay theo bậc
  function sunHalo(ctx, t) {
    if (!D) return false;
    begin(ctx);
    const rot = Math.round(t * 0.15 * 12 / Math.PI) * Math.PI / 12;
    ctx.globalAlpha = 0.85;
    ring(ctx, 100, 112, 40, 40, C['dong-sang'], { c: 2 });
    ring(ctx, 100, 112, 26, 26, C['vang-nghe'], { dash: 2 });
    for (let i = 0; i < 12; i++) { const a = rot + (i / 12) * Math.PI * 2; seg(ctx, 100 + Math.cos(a) * 48, 112 + Math.sin(a) * 48, 100 + Math.cos(a) * (i % 2 ? 62 : 74), 112 + Math.sin(a) * (i % 2 ? 62 : 74), i % 2 ? C['vang-nghe'] : C['dong-sang'], 2); }
    end(ctx);
    return true;
  }

  // ---------- ảnh hiệu ứng cũ theo tên (costume.js: đòn đánh của tướng) → vẽ sprite pixel tương đương; false = không có
  function pxTex(ctx, name, color, cx, cy, r, rot = 0, sy = 1, alpha = 1) {
    const nm = pxName(name);
    if (!nm || !D) return false;
    begin(ctx);
    ctx.globalAlpha = step(ctx.globalAlpha * alpha) || 0;
    // toạ độ đang ở hệ khung tướng (đã dịch / lật) → ma trận lấy theo begin()
    if (nm === 'ring' || nm === 'dot') ring(ctx, cx, cy, r, r * sy, pal(color || '#F2C230'), { dash: nm === 'dot' ? 0 : 2 });
    else {
      const s = spr(nm);
      const sc = Math.max(1, Math.min(3, Math.round((r * 2) / (Math.max(s.w, s.h) * PU))));
      blit(ctx, nm, frameOf(s, null, clock), cx, cy, sc, G.a < 0);
    }
    end(ctx);
    return true;
  }
  // tương thích: VFX.tex cũ (ảnh Kenney) không còn — trả null để nơi gọi dùng đường khác
  const tex = () => null;
  const sprite = () => null;

  // công cụ vẽ pixel cho nơi khác (main.js / render.js): begin(ctx, scale) … end(ctx); toạ độ bản đồ, bám lưới điểm ảnh
  const px = { begin, end, dot, ring, seg, zig, blit, spr, frameOf, step, pal, C, G, zone, lacTu, aura, enemyFx, elite, heroStun, bog, accAura, ascAura, evoAura, smokeAura, packFront, ascGems, sunHalo };
  return { emit, burst, flare, rise, line, update, draw, trail, projGlow, drawProj, onEffect, drawFx, sprite, tex, pxTex, decal, shards, status,
    frame, ready, isFire, pal, spr, PU, OWN, px,
    count: () => parts.length, max: () => MAX, poolSize: () => pool.length, dropped: () => dropped, statusDrawn: () => SB.n,
    setMax: (n) => { MAX = n; SB.max = Math.max(100, Math.round(180 * n / 700)); if (parts.length > n) pool.push(...parts.splice(0, parts.length - n)); } };
})();
