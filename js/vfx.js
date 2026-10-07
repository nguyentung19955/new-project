'use strict';

// ============================================================
//  HIỆU ỨNG HẠT (v35): vệt đuôi đạn, nổ tia khi trúng, bụi đất, nước bắn,
//  lá / hoa bay, vầng sáng cộng màu ("lighter"). Chỉ để nhìn, không ảnh hưởng luật chơi.
//  Ảnh hạt là gradient vẽ sẵn một lần (cache), mỗi khung chỉ drawImage → nhẹ trên điện thoại.
// ============================================================
const VFX = (() => {
  let MAX = 700;          // hạ xuống khi máy yếu (đồ hoạ tự động)
  const parts = [];
  const spriteCache = new Map();

  // ảnh hạt: 'glow' (tâm trắng → màu → trong suốt), 'soft' (khói / bụi), 'spark' (tia dài), 'leaf', 'petal'
  function sprite(kind, color) {
    // màu dạng #rgb → #rrggbb để ghép được độ trong suốt (#rrggbbaa)
    if (/^#[0-9a-f]{3}$/i.test(color)) color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    else if (!/^#[0-9a-f]{6}$/i.test(color)) color = '#ffffff';
    const key = kind + color;
    let c = spriteCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    const S = 64;
    c.width = c.height = S;
    const x = c.getContext('2d');
    if (kind === 'glow') {
      const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.18, color);
      g.addColorStop(0.5, color + '66');
      g.addColorStop(1, color + '00');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    } else if (kind === 'soft') {
      const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, color + 'cc');
      g.addColorStop(0.6, color + '55');
      g.addColorStop(1, color + '00');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    } else if (kind === 'spark') {
      const g = x.createLinearGradient(0, 0, S, 0);
      g.addColorStop(0, color + '00');
      g.addColorStop(0.7, color);
      g.addColorStop(1, '#ffffff');
      x.fillStyle = g;
      x.beginPath();
      x.ellipse(S / 2, S / 2, S / 2, S / 10, 0, 0, Math.PI * 2);
      x.fill();
    } else {
      // lá / cánh hoa: hình giọt có gân
      x.fillStyle = color;
      x.beginPath();
      x.moveTo(S * 0.08, S / 2);
      x.quadraticCurveTo(S / 2, S * 0.08, S * 0.92, S / 2);
      x.quadraticCurveTo(S / 2, S * 0.92, S * 0.08, S / 2);
      x.fill();
      x.strokeStyle = kind === 'leaf' ? '#2E5A1E' : '#ffffffaa';
      x.lineWidth = 3;
      x.beginPath(); x.moveTo(S * 0.12, S / 2); x.lineTo(S * 0.85, S / 2); x.stroke();
    }
    spriteCache.set(key, c);
    return c;
  }

  // ---------- ảnh hiệu ứng Kenney Particle Pack (CC0, assets/fx/): trắng trên nền trong,
  // tô màu theo chiêu (giữ độ sáng / tối bên trong ảnh), mỗi cặp ảnh + màu tô một lần rồi lưu lại.
  // Tên 'vfx/<tên>' = ảnh hạt trong assets/vfx/ (Kenney Particle Pack + Smoke Particles, CC0 — assets/vfx/NGUON-KENNEY.txt):
  // ảnh xám (lua-*, khoi-*, bang-*, choang-sao…) tô màu lúc chạy; ảnh có màu sẵn (no-*, doc-*, chop-1, khoi-den) vẽ nguyên.
  const fxImg = new Map(), fxTint = new Map();
  function texBase(name) {
    let a = fxImg.get(name);
    if (!a) {
      const rel = name.startsWith('vfx/') ? name + '.png' : 'fx/' + name + '.png';
      if (typeof hasAsset === 'function' && !hasAsset(rel)) a = {};   // v189: ảnh không có trong danh sách → khỏi tải
      else { a = new Image(); a.decoding = 'async'; a.src = 'assets/' + rel; }
      fxImg.set(name, a);
    }
    return a.complete && a.naturalWidth ? a : null;
  }
  function tex(name, color) {
    color = color || '#ffffff';
    const key = name + color;
    let c = fxTint.get(key);
    if (c) return c;
    const img = texBase(name);
    if (!img) return null;
    c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    if (color.toLowerCase() !== '#ffffff') {
      x.globalCompositeOperation = 'multiply'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
      x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0);
    }
    fxTint.set(key, c);
    return c;
  }
  const ready = (name) => !!texBase(name);
  // nạp sẵn để lần đầu tung chiêu đã có ảnh
  ['circle_02', 'circle_03', 'circle_05', 'dirt_01', 'fire_01', 'fire_02', 'flame_05', 'flame_06', 'flare_01', 'light_03', 'magic_01', 'magic_02',
    'magic_03', 'magic_05', 'muzzle_02', 'scorch_01', 'scorch_02', 'scratch_01', 'slash_01', 'slash_03', 'smoke_03', 'smoke_07', 'smoke_09',
    'spark_01', 'spark_06', 'star_04', 'star_06', 'star_08', 'star_09', 'trace_05', 'twirl_01', 'twirl_02'].forEach(texBase);
  const VFX_IMGS = ['anh-sang', 'bang-1', 'bang-2', 'choang-sao', 'chop-1', 'doc-1', 'doc-2', 'khoi-1', 'khoi-2', 'khoi-den', 'khoi-trang-1',
    'khoi-trang-2', 'lua-1', 'lua-2', 'lua-3', 'manh-vo', 'no-1', 'no-2', 'no-3', 'sao-lap-lanh', 'tia-set', 'vong-1'];
  VFX_IMGS.forEach((n) => texBase('vfx/' + n));
  // một mảng ảnh lớn (vòng sóng, vết chém, vòng phép…): sy < 1 = nằm dẹt trên mặt đất
  function decal(x, y, name, color, size, life, o = {}) {
    emit({ x, y, vx: o.vx || 0, vy: o.vy || 0, life, size, color, kind: 'tex', tex: name, grow: o.grow || 0, drag: o.drag ?? 1, grav: o.grav || 0,
      spin: o.spin || 0, rot: o.rot ?? Math.random() * 6.28, sy: o.sy || 1, add: o.add ?? true, a: o.a, must: o.must,
      fb: o.fb ?? (name.startsWith('vfx/') ? ((o.add ?? true) ? 'glow' : 'soft') : null), fbc: o.fbc });
  }
  // nhiều mảnh ảnh bay toả ra (bông tuyết, sao, tàn lửa, mảnh vỡ…): xoay, mờ dần, phóng to / thu nhỏ
  function shards(x, y, n, name, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = R(0, Math.PI * 2), sp = R(o.min ?? 30, o.speed ?? 140);
      decal(x + R(-(o.spread || 0), o.spread || 0), y, name, color, R(o.size ?? 5, (o.size ?? 5) * 1.6), R((o.life ?? 0.6) * 0.6, o.life ?? 0.6), {
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (o.flat ?? 0.6) - (o.up ?? 0), spin: R(-(o.spin ?? 4), o.spin ?? 4), grow: o.grow ?? 0,
        drag: o.drag ?? 0.9, add: o.add, a: o.a, fbc: o.fbc, grav: o.grav, must: o.must });
    }
  }

  // o: { x, y, vx, vy, life, size, grow, color, kind, add (cộng sáng), grav, drag, spin, stretch, tex, sy, a, fb (ảnh dự phòng), must }
  // Pool hạt: hạt chết được cất vào pool để dùng lại (không tạo object mới mỗi khung → đỡ dọn rác, đỡ giật trên điện thoại).
  // Đầy MAX: bỏ hạt mới (vệt đuôi, khói lặt vặt); hạt quan trọng (must: nổ lớn, boss chết) thế chỗ một hạt bất kỳ.
  const pool = [];
  const BASE = { x: 0, y: 0, vx: 0, vy: 0, life: 0.3, size: 3, color: '#ffffff', grav: 0, drag: 0.9, grow: 0, add: true, kind: 'glow',
    spin: 0, rot: 0, stretch: false, tex: null, sy: 1, a: undefined, fb: null, fbc: undefined, must: false };
  let dropped = 0;
  function emit(o) {
    let p;
    if (parts.length >= MAX) {
      dropped++;
      if (!o.must || !parts.length) return;
      p = parts[(Math.random() * parts.length) | 0];
    } else { p = pool.pop() || {}; parts.push(p); }
    Object.assign(p, BASE, o);
    if (o.rot === undefined) p.rot = Math.random() * 6.28;
    p.max = p.life;
  }
  const R = (a, b) => a + Math.random() * (b - a);
  // nổ toả tròn
  function burst(x, y, n, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = R(0, Math.PI * 2), sp = R(o.min ?? 40, o.speed ?? 160);
      emit({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (o.flat ?? 0.6) - (o.up ?? 0),
        life: R(0.25, o.life ?? 0.55), size: R(o.size ?? 3, (o.size ?? 3) * 2), color, kind: o.kind || 'glow',
        grav: o.grav ?? 0, drag: o.drag ?? 0.88, add: o.add ?? true, stretch: o.stretch, spin: o.spin ?? 0, grow: o.grow ?? 0, a: o.a });
    }
  }
  // một quầng sáng lớn, tắt nhanh
  function flare(x, y, color, size = 40, life = 0.3) {
    emit({ x, y, vx: 0, vy: 0, life, size, color, kind: 'glow', grow: size * 1.5, drag: 1 });
  }
  // hạt bay lên (hồi máu, phép, thần lực)
  function rise(x, y, n, color, spread = 30, o = {}) {
    for (let i = 0; i < n; i++)
      emit({ x: x + R(-spread, spread), y: y + R(-spread * 0.4, spread * 0.3), vx: R(-10, 10), vy: R(-70, -30),
        life: R(0.5, 1.1), size: R(2, 4.5), color, kind: o.kind || 'glow', drag: 0.97, spin: o.spin ?? 0 });
  }
  // dọc một đoạn thẳng (tia, chùm sáng)
  function line(x1, y1, x2, y2, n, color, o = {}) {
    for (let i = 0; i < n; i++) {
      const k = Math.random();
      emit({ x: x1 + (x2 - x1) * k, y: y1 + (y2 - y1) * k, vx: R(-30, 30), vy: R(-30, 30), life: R(0.2, 0.5),
        size: R(2, o.size ?? 4), color, kind: 'glow', drag: 0.85 });
    }
  }

  function update(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        // bỏ khỏi danh sách bằng cách đổi chỗ với hạt cuối (O(1)), cất vào pool
        const last = parts.pop();
        if (last !== p) parts[i] = last;
        if (pool.length < 1024) pool.push(p);
        continue;
      }
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d; p.vy = p.vy * d + p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.spin * dt;
      p.size += p.grow * dt;
    }
  }

  function draw(ctx) {
    if (!parts.length) return;
    ctx.save();
    let mode = '';
    for (const p of parts) {
      const m = p.add ? 'lighter' : 'source-over';
      if (m !== mode) { ctx.globalCompositeOperation = mode = m; }
      const k = p.life / p.max;
      ctx.globalAlpha = Math.min(1, k * 1.6) * (p.add ? 0.9 : 0.75) * (p.a ?? 1);
      const s = Math.max(0.5, p.size);
      if (p.kind === 'tex') {
        const im = tex(p.tex, p.color);
        if (!im && p.fb) {
          // ảnh chưa tải được / không có → vẽ quầng gradient cũ cho khỏi trống
          const g = sprite(p.fb, p.fbc || (p.color && p.color !== '#ffffff' ? p.color : '#FFB04A'));
          ctx.drawImage(g, p.x - s, p.y - s * p.sy, s * 2, s * 2 * p.sy);
        } else if (im) {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.sy !== 1) ctx.scale(1, p.sy);
          ctx.rotate(p.rot);
          ctx.drawImage(im, -s, -s, s * 2, s * 2);
          ctx.restore();
        }
        continue;
      }
      const img = sprite(p.kind, p.color);
      if (p.kind === 'spark' || p.stretch) {
        // tia: kéo dài theo hướng bay
        const sp = Math.hypot(p.vx, p.vy);
        const len = s * (2 + Math.min(6, sp / 40));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.drawImage(sprite('spark', p.color), -len, -s / 2, len * 2, s);
        ctx.restore();
      } else if (p.kind === 'leaf' || p.kind === 'petal') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(img, -s, -s / 2, s * 2, s);
        ctx.restore();
      } else {
        ctx.drawImage(img, p.x - s, p.y - s, s * 2, s * 2);
      }
    }
    ctx.restore();
  }

  // ---------- hiệu ứng trạng thái trên quái (bỏng, độc, choáng, đóng băng, làm chậm) bằng ảnh assets/vfx/
  // Vẽ thẳng theo thời gian t (không tạo hạt): mỗi quái vài ảnh nhỏ bay lên / xoay / mờ dần theo chu kỳ, lệch pha theo id.
  // Vẽ TRƯỚC thanh máu và không vượt quá đỉnh hình quái → không che thanh máu. Mỗi khung có hạn mức số ảnh (SB.max);
  // hết hạn mức hoặc ảnh chưa tải → trả cờ false để render.js vẽ cách cũ bằng code.
  const SB = { n: 0, max: 180 };
  function frame() { SB.n = 0; }
  function spr(ctx, name, color, x, y, s, rot, alpha, sy = 1) {
    if (SB.n >= SB.max || alpha <= 0.01) return;
    const im = tex(name, color);
    if (!im) return;
    SB.n++;
    ctx.globalAlpha = Math.min(1, alpha);
    if (!rot && sy === 1) { ctx.drawImage(im, x - s, y - s, s * 2, s * 2); return; }
    // xoay / dẹt rồi trả ngược lại (rẻ hơn save / restore khi vẽ nhiều)
    ctx.translate(x, y); ctx.scale(1, sy); ctx.rotate(rot || 0);
    ctx.drawImage(im, -s, -s, s * 2, s * 2);
    ctx.rotate(-(rot || 0)); ctx.scale(1, 1 / sy); ctx.translate(-x, -y);
  }
  // ảnh trạng thái VẼ TAY (docs/PROMPT-HIEU-UNG.txt phần E, cắt bằng tools/cat-fx.py dai → assets/vfx/tt-*.png):
  // dải N khung vuông chạy lặp theo thời gian; có ảnh thì thay ảnh Kenney, chưa có thì như cũ
  const art = (n) => (typeof asset === 'function' ? asset('vfx/' + n + '.png', true) : null);
  function loop(ctx, img, t, fps, x, y, w, h, alpha) {
    if (SB.n >= SB.max) return;
    SB.n++;
    const IW = img.naturalWidth || img.width, IH = img.naturalHeight || img.height, n = Math.max(1, Math.round(IW / IH));
    const fr = ((Math.floor(t * fps) % n) + n) % n, fw = IW / n;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, fr * fw, 0, fw, IH, x - w / 2, y - h / 2, w, h);
  }
  // lửa hay độc: màu DOT đỏ / cam = bỏng, còn lại (xanh, tím…) = độc
  function isFire(c) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c || '');
    if (!m) return false;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return r >= g && r >= b && r > 150;
  }
  function status(ctx, e, box, lift, t) {
    const r = { dot: false, stun: false, slow: false, ice: false, iceArt: false };
    if (!e || e.dead) return r;
    const W = box.w, H = Math.max(10, box.ay), fy = e.y - lift, cx = e.x, id = e.id || 0;
    const room = SB.n < SB.max;
    ctx.save();
    // làm chậm: sương lạnh dưới chân + bông tuyết rơi chậm (thêm vào lớp phủ xanh của render.js)
    const slowOn = (e.slowT > 0 || e.zoneSlow > 0) && !(e.stunT > 0 && e.stunKind === 'ice') && room;
    const aCham = slowOn && art('tt-cham');
    if (aCham) {
      // vòng sương lạnh vẽ tay dưới chân (dẹt theo mặt đất)
      r.slow = true;
      ctx.globalCompositeOperation = 'source-over';
      loop(ctx, aCham, t + id * 0.37, 8, cx, fy - 1, W * 1.15, W * 0.5, 0.9);
    } else if (slowOn && ready('vfx/khoi-trang-1') && ready('vfx/bang-1')) {
      r.slow = true;
      ctx.globalCompositeOperation = 'source-over';
      spr(ctx, 'vfx/khoi-trang-1', '#A8DCF5', cx, fy - 2, W * 0.42, t * 0.4 + id, 0.55, 0.42);
      const p = (t * 0.45 + id * 0.29) % 1;
      spr(ctx, 'vfx/bang-1', '#CFF4FF', cx + Math.sin(id + t) * W * 0.3, fy - H * (0.85 - p * 0.75), W * 0.08 + 3, t * 1.5, Math.sin(p * Math.PI));
    }
    // bỏng / độc
    if (e.poisonT > 0 && room) {
      const fire = isFire(e.dotColor);
      const aDot = art(fire ? 'tt-bong' : 'tt-doc');
      if (aDot) {
        // lửa / bong bóng độc vẽ tay phủ nửa dưới thân, hơi trong để không che mặt nhân vật
        r.dot = true;
        ctx.globalCompositeOperation = 'source-over';
        const S = Math.min(W * 0.8, H * 0.75);
        loop(ctx, aDot, t + id * 0.29, fire ? 10 : 7, cx, fy - H * 0.32, S, S, fire ? 0.9 : 0.85);
      } else if (fire && ready('vfx/lua-1') && ready('vfx/lua-2')) {
        r.dot = true;
        // vẽ thường (không cộng sáng): trên nền cát / nước sáng, cộng sáng làm lửa trắng nhoà mất
        ctx.globalCompositeOperation = 'source-over';
        const n = W > 60 ? 3 : 2;
        for (let i = 0; i < n; i++) {
          const p = (t * 1.7 + i / n + id * 0.37) % 1;
          const x = cx + Math.sin(i * 2.1 + id) * W * 0.26 + Math.sin(t * 5 + i) * 1.5;
          const y = fy - H * 0.12 - p * H * 0.55;
          spr(ctx, i % 2 ? 'vfx/lua-2' : 'vfx/lua-1', i % 2 ? '#FFB04A' : '#FF6A2A', x, y, W * (0.13 + 0.08 * Math.sin(p * Math.PI)) + 3, 0, Math.min(1, Math.sin(p * Math.PI) * 1.4));
        }
        // tàn lửa nhỏ
        ctx.globalCompositeOperation = 'lighter';
        const q = (t * 1.1 + id * 0.17) % 1;
        if (W > 36) spr(ctx, 'vfx/sao-lap-lanh', '#FFD27A', cx + Math.sin(id + t * 3) * W * 0.3, fy - H * (0.3 + q * 0.5), 3, t * 4, (1 - q) * 0.9);
      } else if (!fire && ready('vfx/vong-1') && ready('vfx/doc-1')) {
        r.dot = true;
        const c = e.dotColor && /^#[0-9a-f]{6}$/i.test(e.dotColor) ? e.dotColor : '#8BD44A';
        ctx.globalCompositeOperation = 'source-over';
        spr(ctx, 'vfx/doc-1', null, cx, fy - H * 0.12, W * 0.36, t * 0.6 + id, 0.45 + 0.08 * Math.sin(t * 3 + id), 0.55);
        for (let i = 0; i < 2; i++) {
          const p = (t * 0.9 + i / 2 + id * 0.41) % 1;
          spr(ctx, 'vfx/vong-1', c, cx + Math.sin(i * 2.4 + id + t * 1.3) * W * 0.28, fy - H * 0.15 - p * H * 0.6, 4 + W * 0.07 * (0.5 + p), 0, Math.min(1, Math.sin(p * Math.PI) * 1.6));
        }
      }
    }
    // choáng thường: sao vàng xoay vòng ngay trên đầu (dưới thanh máu)
    const stunOn = e.stunT > 0 && !['ice', 'root', 'music', 'net'].includes(e.stunKind);
    const aChoang = stunOn && art('tt-choang');
    if (aChoang) {
      // vòng sao vẽ tay: nội dung nằm ở dải giữa khung (±22% cạnh) → đặt tâm sao cho mép trên vẫn dưới thanh máu
      r.stun = true;
      ctx.globalCompositeOperation = 'source-over';
      const S = Math.min(60, Math.max(30, W * 0.9));
      loop(ctx, aChoang, t + id * 0.31, 10, cx, Math.max(fy - H * 0.86, fy - H - 1 + S * 0.24), S, S, 1);
    } else if (stunOn && ready('vfx/choang-sao') && SB.n + 4 <= SB.max) {
      r.stun = true;
      ctx.globalCompositeOperation = 'source-over';
      // quái thấp: hạ sao xuống để đỉnh sao (cỡ tối đa 11 + nhún 3) vẫn dưới đáy thanh máu (fy - H - 3)
      const y0 = Math.max(fy - H * 0.86, fy - H + 15), rx = Math.min(22, W * 0.3);
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + (i * Math.PI * 2) / 3, z = Math.sin(a);
        spr(ctx, 'vfx/choang-sao', '#FFC83A', cx + Math.cos(a) * rx, y0 + z * 3, 9 + z * 2, 0, 0.85 + z * 0.15);
      }
      ctx.globalCompositeOperation = 'lighter';
      spr(ctx, 'vfx/sao-lap-lanh', '#FFF4C4', cx + Math.cos(t * 5 + 1) * rx * 0.6, y0 - 2, 4, t * 2, 0.5 + 0.4 * Math.sin(t * 9 + id));
    }
    // đóng băng: khối băng vẽ bằng code (render.js) + ánh lấp lánh và mảnh băng
    const aBang = e.stunT > 0 && e.stunKind === 'ice' && art('tt-bang');
    if (aBang) {
      // khối băng vẽ tay bọc cả thân (thay khối băng vẽ bằng code trong render.js), hơi trong để còn thấy quái
      r.ice = r.iceArt = true;
      ctx.globalCompositeOperation = 'source-over';
      // ảnh vuông, khối băng chiếm ~70% rộng × 92% cao, đáy chạm đáy ảnh: đủ bọc thân, nhưng đỉnh không vượt thanh máu
      const S = Math.min(Math.max(W * 1.35, H * 1.08), (H + 1) / 0.92);
      loop(ctx, aBang, 0, 0, cx, fy - S / 2 + 2, S, S, 0.68);
    } else if (e.stunT > 0 && e.stunKind === 'ice' && ready('vfx/sao-lap-lanh') && ready('vfx/bang-2')) {
      r.ice = true;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const p = (t * 0.8 + i * 0.5 + id * 0.23) % 1;
        spr(ctx, 'vfx/sao-lap-lanh', '#E8FBFF', cx + (i ? 0.28 : -0.22) * W, fy - H * (i ? 0.62 : 0.32), 4 + 3 * Math.sin(p * Math.PI), p * 2, Math.sin(p * Math.PI));
      }
      spr(ctx, 'vfx/bang-2', '#BFF0FF', cx - W * 0.3, fy - H * 0.3, H * 0.22, -0.3, 0.55);
      spr(ctx, 'vfx/bang-2', '#BFF0FF', cx + W * 0.32, fy - H * 0.25, H * 0.18, 0.35, 0.5);
    }
    ctx.restore();
    return r;
  }

  // ---------- vệt đuôi đạn (gọi mỗi khung cho từng viên đạn)
  const TRAIL = {
    fireball: { c: '#FF8A2E', smoke: '#A89A8A', n: 2 },
    frostbolt: { c: '#9EDDF2', n: 2, ice: true },
    arrow: { c: '#F2E6C8', n: 1, thin: true },
    bolt: { c: '#FFE08A', n: 1, thin: true },
    orb: { c: '#7FD8F2', n: 2 },
    feather: { c: '#FF9EC4', n: 1 },
    petal: { c: '#FFB8D8', n: 1, petal: true },
    melon: { c: '#8AD05A', n: 1 },
    rice: { c: '#F2E6C8', n: 1 },
    evil: { c: '#5AB4D6', n: 1 },
  };
  function trail(p, dt) {
    const tr = TRAIL[p.kind] || TRAIL.fireball;
    const c = p.st && p.st.poison && (p.kind === 'arrow' || p.kind === 'bolt') ? '#8BD44A' : tr.c;
    const rate = tr.n * 60 * dt;
    for (let i = 0; i < rate; i++) {
      if (tr.thin) emit({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.18, size: 2.2, color: c, kind: 'glow', drag: 1 });
      else emit({ x: p.x + R(-2, 2), y: p.y + R(-2, 2), vx: R(-12, 12), vy: R(-12, 12), life: R(0.18, 0.35), size: R(3, 6), color: c, kind: 'glow', grow: -8 });
      if (tr.smoke && Math.random() < 0.4) emit({ x: p.x, y: p.y, vx: R(-8, 8), vy: R(-25, -10), life: R(0.3, 0.6), size: R(3, 5), color: tr.smoke, kind: 'soft', add: false, grow: 12, a: 0.3 });
      if (tr.ice && Math.random() < 0.3) emit({ x: p.x, y: p.y, vx: R(-20, 20), vy: R(-20, 20), life: 0.4, size: 2, color: '#E8FBFF', kind: 'spark' });
      if (tr.petal && Math.random() < 0.3) emit({ x: p.x, y: p.y, vx: R(-20, 20), vy: R(5, 25), life: 0.6, size: 4, color: '#FFB8D8', kind: 'petal', add: false, spin: R(-6, 6) });
    }
  }
  // quầng sáng quanh viên đạn (vẽ trước đạn)
  function projGlow(ctx, p) {
    const tr = TRAIL[p.kind] || TRAIL.fireball;
    const s = tr.thin ? 9 : 16;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.75;
    ctx.drawImage(sprite('glow', tr.c), p.x - s, p.y - s, s * 2, s * 2);
    ctx.restore();
  }

  // ---------- hiệu ứng theo sự kiện của game (gọi 1 lần khi hiệu ứng mới xuất hiện)
  const IMPACT = {
    fireball: (x, y) => { decal(x, y, 'scorch_01', '#FF9A3A', 16, 0.3, { grow: 30 }); flare(x, y, '#FF8A2E', 18); burst(x, y, 14, '#FFB04A', { speed: 140, grav: 120 }); burst(x, y, 4, '#A89A8A', { kind: 'soft', add: false, speed: 40, grow: 26, life: 0.6, a: 0.35 }); },
    frostbolt: (x, y) => { decal(x, y, 'star_08', '#BFF0FF', 14, 0.28, { spin: 4 }); flare(x, y, '#9EDDF2', 16); burst(x, y, 10, '#E8FBFF', { kind: 'spark', speed: 150 }); },
    arrow: (x, y) => burst(x, y, 5, '#F2E6C8', { kind: 'spark', speed: 120, life: 0.25 }),
    bolt: (x, y) => { decal(x, y, 'star_06', '#FFE08A', 10, 0.2); flare(x, y, '#FFE08A', 10, 0.18); burst(x, y, 6, '#FFE08A', { kind: 'spark', speed: 140, life: 0.25 }); },
    orb: (x, y) => { decal(x, y, 'magic_05', '#7FD8F2', 14, 0.3, { grow: 20 }); flare(x, y, '#7FD8F2', 16); burst(x, y, 10, '#BFF0FF', { speed: 110 }); },
    melon: (x, y) => burst(x, y, 12, '#E04848', { add: false, kind: 'soft', speed: 120, grav: 260, size: 2.5 }),
    feather: (x, y) => burst(x, y, 6, '#FFF4F8', { kind: 'petal', add: false, speed: 60, spin: 4, life: 0.6 }),
    petal: (x, y) => burst(x, y, 8, '#FFB8D8', { kind: 'petal', add: false, speed: 70, spin: 5, life: 0.7 }),
    rice: (x, y) => burst(x, y, 8, '#F2E6C8', { add: false, kind: 'soft', speed: 90, grav: 200, size: 2 }),
    evil: (x, y) => burst(x, y, 8, '#5AB4D6', { speed: 90 }),
  };
  // claude/vfx-kenney: điểm nhấn trúng đòn theo ngũ hành của tướng bắn (ảnh assets/vfx/) — nhỏ, tắt nhanh để không lấn nhân vật
  const EL_HIT = {
    kim: (x, y) => { shards(x, y, 4, 'vfx/sao-lap-lanh', '#F2F6FF', { speed: 120, size: 3, life: 0.3, spin: 6 }); },
    moc: (x, y) => { burst(x, y, 4, '#7FD05A', { kind: 'leaf', add: false, speed: 70, spin: 6, life: 0.55, size: 3 }); },
    thuy: (x, y) => { decal(x, y, 'vfx/vong-1', '#7FD8F2', 4, 0.3, { grow: 50, sy: 0.6, rot: 0 }); burst(x, y, 5, '#BFF0FF', { speed: 90, grav: 260, up: 40, life: 0.4, size: 1.8 }); },
    hoa: (x, y) => { shards(x, y - 4, 3, 'vfx/lua-2', '#FF8A2E', { speed: 50, up: 60, size: 4, life: 0.4, spin: 1, grow: -6 }); },
    tho: (x, y) => { decal(x, y + 2, 'vfx/manh-vo', '#B89A6A', 8, 0.4, { add: false, grow: 22, a: 0.8 }); },
  };
  // vụ nổ lan (đạn có splash): mây lửa có màu sẵn cho hệ Hỏa / đạn lửa, khói trắng tô theo hệ cho hệ khác
  function splashFx(x, y, el, r) {
    const sz = Math.max(12, Math.min(34, (r || 40) * 0.35));
    if (!el || el === 'hoa') decal(x, y - 4, 'vfx/no-1', null, sz * 0.6, 0.42, { add: false, grow: sz * 1.6, spin: 1.2, fbc: '#FF8A2E' });
    else decal(x, y - 2, 'vfx/khoi-trang-1', (typeof ELEMENTS !== 'undefined' && ELEMENTS[el] ? ELEMENTS[el].color : '#D8D8D8'), sz * 0.6, 0.45, { add: false, grow: sz * 1.4, spin: 1, a: 0.6 });
  }
  function onEffect(f) {
    const x = f.x, y = f.y;
    switch (f.type) {
      case 'impact': (IMPACT[f.kind] || IMPACT.fireball)(x, y); if (f.el && EL_HIT[f.el]) EL_HIT[f.el](x, y); if (f.splash) splashFx(x, y, f.kind === 'fireball' && !f.el ? 'hoa' : f.el, f.splash); break;
      case 'slash': decal(x, y, 'slash_03', '#FFF1C4', 16, 0.2, { rot: -0.6 + Math.random() * 1.2 }); burst(x, y, 6, '#FFF1C4', { kind: 'spark', speed: 170, life: 0.22 }); break;
      case 'xslash': case 'claw': decal(x, y, 'scratch_01', f.color || '#FFE08A', 22, 0.28, { rot: Math.random() * 6.28 }); flare(x, y, f.color || '#FFE08A', 18, 0.2); burst(x, y, 12, f.color || '#FFE08A', { kind: 'spark', speed: 220, life: 0.3 }); break;
      case 'bash': decal(x, y - 6, 'vfx/chop-1', null, 10, 0.2, { add: false, grow: 50, a: 0.7, fbc: '#FFE08A' }); decal(x, y + 4, 'circle_03', '#FFE08A', 10, 0.35, { grow: 90, sy: 0.4, rot: 0 }); decal(x, y - 6, 'star_09', '#FFF1C4', 16, 0.22); flare(x, y, '#FFE08A', 20, 0.22); burst(x, y, 10, '#FFE08A', { kind: 'spark', speed: 200 }); burst(x, y + 6, 8, '#8A7650', { kind: 'soft', add: false, speed: 60, grow: 25, life: 0.6 }); break;
      case 'explosion': decal(x, y - 8, 'vfx/no-2', null, 22, 0.5, { add: false, grow: 70, spin: 0.8, must: true, fbc: '#FF8A2E' }); decal(x, y - 26, 'vfx/khoi-den', null, 20, 1.1, { add: false, grow: 34, vy: -22, a: 0.45, fbc: '#5A4A40' }); decal(x, y + 4, 'vfx/manh-vo', '#8A7650', 18, 0.6, { add: false, grow: 40, a: 0.7 }); decal(x, y, 'scorch_02', '#FF8A2E', 40, 0.4, { grow: 60 }); decal(x, y + 4, 'circle_02', '#FFB04A', 20, 0.45, { grow: 180, sy: 0.45, rot: 0 }); decal(x, y - 10, 'smoke_09', '#8A7A6A', 30, 0.9, { grow: 40, add: false, a: 0.5, spin: 0.5 }); flare(x, y, '#FF8A2E', 70, 0.45); burst(x, y, 40, '#FFB04A', { speed: 260, grav: 150, life: 0.7 }); burst(x, y, 10, '#A89A8A', { kind: 'soft', add: false, speed: 90, grow: 50, life: 1, a: 0.3 }); break;
      case 'pillar': shards(x, y - 10, 6, 'vfx/lua-1', '#FF8A2E', { speed: 40, up: 120, drag: 0.95, size: 8, life: 0.7, spin: 0.6, spread: 14, grow: -4 }); decal(x, y - 34, 'flame_05', '#FF8A2E', 40, 0.55, { rot: 0, grow: 20 }); decal(x, y, 'scorch_01', '#FF6B2A', 26, 0.5, { sy: 0.45, rot: 0 }); flare(x, y - 20, '#FF6B2A', 40, 0.5); rise(x, y, 30, '#FF8A2E', 30); break;
      case 'nova': shards(x, y - 6, 10, 'vfx/bang-1', '#DFF8FF', { speed: 220, min: 80, size: 5, life: 0.6, spin: 5 }); decal(x, y, 'circle_03', '#BFF0FF', 20, 0.45, { grow: 220, sy: 0.5, rot: 0 }); decal(x, y - 10, 'magic_03', '#E8FBFF', 30, 0.4, { spin: 2 }); flare(x, y, '#9EDDF2', 60, 0.4); burst(x, y, 30, '#E8FBFF', { kind: 'spark', speed: 260 }); break;
      case 'snow': for (let i = 0; i < 12; i++) decal(x + R(-f.r, f.r), y + R(-f.r * 0.5, f.r * 0.3) - 60, 'vfx/bang-1', '#E8FBFF', R(3, 6), R(0.9, 1.6), { vx: R(-15, 15), vy: R(30, 70), drag: 0.99, spin: R(-2, 2) });
        for (let i = 0; i < 28; i++) emit({ x: x + R(-f.r, f.r), y: y + R(-f.r * 0.5, f.r * 0.3) - 60, vx: R(-15, 15), vy: R(30, 70), life: R(0.8, 1.6), size: R(1.5, 3), color: '#E8FBFF', kind: 'glow', drag: 0.99 }); break;
      case 'bolt': decal(x, y - 10, 'vfx/tia-set', '#E8DCFF', 22, 0.28, { grow: 30 }); decal(x, y - 60, 'spark_06', '#E0D0FF', 64, 0.25, { rot: 0 }); decal(x, y, 'scorch_01', '#C8B8FF', 20, 0.3, { sy: 0.45, rot: 0 }); flare(x, y - 10, '#E0D0FF', 60, 0.3); burst(x, y, 16, '#E0D0FF', { kind: 'spark', speed: 260 }); break;
      case 'heal': decal(x, y + 2, 'magic_02', f.color || '#6AE06A', 32, 0.7, { sy: 0.4, spin: 2, rot: 0 }); rise(x, y - 10, 10, f.color || '#6AE06A', 18); break;
      case 'dome': decal(x, y, 'circle_02', f.color || '#F2D27A', (f.r || 60) * 0.5, 0.6, { grow: (f.r || 60) * 0.8, sy: 0.45, rot: 0 }); rise(x, y, 14, f.color || '#F2D27A', (f.r || 60) * 0.6); break;
      case 'rockfall': decal(x, y - 4, 'vfx/khoi-trang-2', '#C8B48A', 14, 0.7, { add: false, grow: 36, a: 0.5 }); decal(x, y, 'dirt_01', '#B89A6A', 26, 0.6, { add: false, grow: 20 }); burst(x, y, 12, '#8A7650', { kind: 'soft', add: false, speed: 110, grow: 30, life: 0.8 }); break;
      case 'cracks': decal(x, y, 'dirt_01', '#C8A040', 30, 0.5, { add: false, grow: 30, sy: 0.6 }); burst(x, y, 18, '#C8A040', { kind: 'soft', add: false, speed: 150, grow: 20, life: 0.6 }); break;
      case 'splat': burst(x, y, 14, '#E04848', { kind: 'soft', add: false, speed: 140, grav: 300, size: 2.5 }); break;
      case 'wave': case 'gust': decal(x, y, 'twirl_02', f.color || '#9EDDF2', (f.r || 120) * 0.4, 0.5, { grow: (f.r || 120), spin: 3 }); burst(x, y, 24, f.color || '#9EDDF2', { speed: (f.r || 120) * 1.6, life: 0.5, size: 2.5 }); break;
      case 'petals': for (let i = 0; i < 18; i++) emit({ x: x + R(-(f.r || 60), f.r || 60), y: y - R(40, 90), vx: R(-20, 20), vy: R(20, 60), life: R(0.8, 1.4), size: R(3, 5), color: f.color || '#FFB8D8', kind: 'petal', add: false, spin: R(-5, 5), drag: 0.98 }); break;
      case 'beam': case 'streak': line(f.x, f.y, f.x2, f.y2, f.type === 'beam' ? 40 : 12, f.color || '#FFF1C4', { size: f.type === 'beam' ? 6 : 3 }); break;
      case 'cast': shards(x, y - 30, f.ult ? 8 : 4, 'vfx/sao-lap-lanh', f.color || '#FFE08A', { speed: 50, up: 50, size: 4, life: 0.7, spin: 3, spread: 18 }); decal(x, y + 2, f.ult ? 'magic_01' : 'magic_02', f.color || '#FFE08A', f.ult ? 58 : 40, f.ult ? 0.9 : 0.65, { sy: 0.38, spin: 1.6, rot: 0 }); flare(x, y - 30, f.color || '#FFE08A', f.ult ? 60 : 30, 0.35); rise(x, y - 20, f.ult ? 26 : 12, f.color || '#FFE08A', 26); break;
      case 'evolve': decal(x, y - 30, 'light_03', f.color || '#FFE08A', f.big ? 70 : 46, 0.7, { grow: 40, spin: 1 }); decal(x, y - 30, 'star_09', '#FFF1C4', f.big ? 50 : 34, 0.5); flare(x, y - 30, f.color || '#FFE08A', f.big ? 90 : 55, 0.6); burst(x, y - 30, f.big ? 50 : 24, f.color || '#FFE08A', { speed: f.big ? 280 : 180, life: 0.8 }); rise(x, y, 20, '#FFF1C4', 30); break;
      case 'summon': decal(x, y, 'circle_03', '#9dffc4', 14, 0.5, { grow: 60, sy: 0.4, rot: 0 }); decal(x, y - 20, 'star_04', '#FFFFFF', 20, 0.35); flare(x, y - 20, '#9dffc4', 30, 0.4); rise(x, y, 14, '#9dffc4', 20); break;
      case 'die': {
        const boss = typeof ENEMIES !== 'undefined' && ENEMIES[f.etype] && ENEMIES[f.etype].boss;
        if (boss) {
          // boss gục: nổ lớn + vòng sáng + khói đen bốc lên + tàn lửa (hạt must: luôn hiện dù đang đầy hạt)
          decal(x, y - 30, 'vfx/no-3', null, 40, 0.8, { add: false, grow: 120, spin: 0.6, must: true, fbc: '#FF8A2E' });
          decal(x, y - 20, 'vfx/no-2', null, 26, 0.6, { add: false, grow: 90, spin: -0.8, must: true, fbc: '#FFB04A' });
          decal(x, y - 30, 'vfx/anh-sang', '#FFE08A', 30, 0.7, { grow: 200, spin: 1, must: true });
          decal(x, y - 50, 'vfx/khoi-den', null, 36, 1.6, { add: false, grow: 50, vy: -26, a: 0.5, must: true, fbc: '#4A3A30' });
          flare(x, y - 30, '#FFB04A', 90, 0.5);
          shards(x, y - 30, 14, 'vfx/sao-lap-lanh', '#FFE08A', { speed: 260, min: 90, size: 5, life: 0.9, spin: 6, must: true });
          burst(x, y - 30, 30, '#FFB04A', { speed: 280, grav: 160, life: 0.9 });
        } else {
          // quái thường: phụt khói trắng (chibi "poof") + vài ánh sao
          decal(x, y - 10, 'vfx/khoi-trang-1', '#E8F0F5', 10, 0.5, { add: false, grow: 34, spin: 1.5, a: 0.6 });
          shards(x, y - 12, 3, 'vfx/sao-lap-lanh', '#FFF4C4', { speed: 90, up: 30, size: 3, life: 0.4, spin: 6 });
          decal(x, y - 6, 'smoke_03', '#BFE8F5', 10, 0.5, { add: false, grow: 20, a: 0.4 });
          burst(x, y - 6, 6, '#BFE8F5', { add: false, kind: 'soft', speed: 80, grav: 200, size: 2 });
        }
        break;
      }
      case 'scorch': {
        // đất cháy (Lửa thiêng / vết cháy): vài ngọn lửa bùng lên rồi tắt
        const rr = f.r || 26;
        for (let i = 0; i < (f.r ? 7 : 3); i++) decal(x + R(-rr, rr), y + R(-rr * 0.4, rr * 0.3), i % 2 ? 'vfx/lua-1' : 'vfx/lua-3', '#FF7A2E', R(6, 11), R(0.5, (f.max || 1.2) * 0.8), { vy: R(-18, -8), rot: 0, grow: R(-4, 2) });
        decal(x, y - 8, 'vfx/khoi-1', '#7A6A5A', rr * 0.4, 1, { add: false, vy: -20, grow: 20, a: 0.35 });
        break;
      }
      case 'meteor': break;     // nổ do 'explosion'
      default: break;
    }
  }

  return { emit, burst, flare, rise, line, update, draw, trail, projGlow, onEffect, sprite, tex, decal, shards, status, frame, ready, isFire,
    count: () => parts.length, max: () => MAX, poolSize: () => pool.length, dropped: () => dropped, statusDrawn: () => SB.n, VFX_IMGS,
    setMax: (n) => { MAX = n; SB.max = Math.max(100, Math.round(180 * n / 700)); if (parts.length > n) pool.push(...parts.splice(0, parts.length - n)); } };
})();
