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
  // tô màu theo chiêu (giữ độ sáng / tối bên trong ảnh), mỗi cặp ảnh + màu tô một lần rồi lưu lại
  const FX_ROOT = 'assets/fx/';
  const fxImg = new Map(), fxTint = new Map();
  function texBase(name) {
    let a = fxImg.get(name);
    if (!a) { a = new Image(); a.decoding = 'async'; a.src = FX_ROOT + name + '.png'; fxImg.set(name, a); }
    return a.complete && a.naturalWidth ? a : null;
  }
  function tex(name, color = '#ffffff') {
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
  // nạp sẵn để lần đầu tung chiêu đã có ảnh
  ['circle_02', 'circle_03', 'circle_05', 'dirt_01', 'fire_01', 'fire_02', 'flame_05', 'flame_06', 'flare_01', 'light_03', 'magic_01', 'magic_02',
    'magic_03', 'magic_05', 'muzzle_02', 'scorch_01', 'scorch_02', 'scratch_01', 'slash_01', 'slash_03', 'smoke_03', 'smoke_07', 'smoke_09',
    'spark_01', 'spark_06', 'star_04', 'star_06', 'star_08', 'star_09', 'trace_05', 'twirl_01', 'twirl_02'].forEach(texBase);
  // một mảng ảnh lớn (vòng sóng, vết chém, vòng phép…): sy < 1 = nằm dẹt trên mặt đất
  function decal(x, y, name, color, size, life, o = {}) {
    emit({ x, y, vx: o.vx || 0, vy: o.vy || 0, life, size, color, kind: 'tex', tex: name, grow: o.grow || 0, drag: o.drag ?? 1,
      spin: o.spin || 0, rot: o.rot ?? Math.random() * 6.28, sy: o.sy || 1, add: o.add ?? true, a: o.a });
  }

  // o: { x, y, vx, vy, life, size, grow, color, kind, add (cộng sáng), grav, drag, spin, stretch }
  function emit(o) {
    if (parts.length >= MAX) { parts.shift(); if (parts.length >= MAX) return; }
    parts.push({ grav: 0, drag: 0.9, grow: 0, add: true, kind: 'glow', spin: 0, rot: Math.random() * 6.28, ...o, max: o.life });
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
      if (p.life <= 0) { parts.splice(i, 1); continue; }
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
        if (im) {
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
  function onEffect(f) {
    const x = f.x, y = f.y;
    switch (f.type) {
      case 'impact': (IMPACT[f.kind] || IMPACT.fireball)(x, y); break;
      case 'slash': decal(x, y, 'slash_03', '#FFF1C4', 16, 0.2, { rot: -0.6 + Math.random() * 1.2 }); burst(x, y, 6, '#FFF1C4', { kind: 'spark', speed: 170, life: 0.22 }); break;
      case 'xslash': case 'claw': decal(x, y, 'scratch_01', f.color || '#FFE08A', 22, 0.28, { rot: Math.random() * 6.28 }); flare(x, y, f.color || '#FFE08A', 18, 0.2); burst(x, y, 12, f.color || '#FFE08A', { kind: 'spark', speed: 220, life: 0.3 }); break;
      case 'bash': decal(x, y + 4, 'circle_03', '#FFE08A', 10, 0.35, { grow: 90, sy: 0.4, rot: 0 }); decal(x, y - 6, 'star_09', '#FFF1C4', 16, 0.22); flare(x, y, '#FFE08A', 20, 0.22); burst(x, y, 10, '#FFE08A', { kind: 'spark', speed: 200 }); burst(x, y + 6, 8, '#8A7650', { kind: 'soft', add: false, speed: 60, grow: 25, life: 0.6 }); break;
      case 'explosion': decal(x, y, 'scorch_02', '#FF8A2E', 40, 0.4, { grow: 60 }); decal(x, y + 4, 'circle_02', '#FFB04A', 20, 0.45, { grow: 180, sy: 0.45, rot: 0 }); decal(x, y - 10, 'smoke_09', '#8A7A6A', 30, 0.9, { grow: 40, add: false, a: 0.5, spin: 0.5 }); flare(x, y, '#FF8A2E', 70, 0.45); burst(x, y, 40, '#FFB04A', { speed: 260, grav: 150, life: 0.7 }); burst(x, y, 10, '#A89A8A', { kind: 'soft', add: false, speed: 90, grow: 50, life: 1, a: 0.3 }); break;
      case 'pillar': decal(x, y - 34, 'flame_05', '#FF8A2E', 40, 0.55, { rot: 0, grow: 20 }); decal(x, y, 'scorch_01', '#FF6B2A', 26, 0.5, { sy: 0.45, rot: 0 }); flare(x, y - 20, '#FF6B2A', 40, 0.5); rise(x, y, 30, '#FF8A2E', 30); break;
      case 'nova': decal(x, y, 'circle_03', '#BFF0FF', 20, 0.45, { grow: 220, sy: 0.5, rot: 0 }); decal(x, y - 10, 'magic_03', '#E8FBFF', 30, 0.4, { spin: 2 }); flare(x, y, '#9EDDF2', 60, 0.4); burst(x, y, 30, '#E8FBFF', { kind: 'spark', speed: 260 }); break;
      case 'snow': for (let i = 0; i < 40; i++) emit({ x: x + R(-f.r, f.r), y: y + R(-f.r * 0.5, f.r * 0.3) - 60, vx: R(-15, 15), vy: R(30, 70), life: R(0.8, 1.6), size: R(1.5, 3), color: '#E8FBFF', kind: 'glow', drag: 0.99 }); break;
      case 'bolt': decal(x, y - 60, 'spark_06', '#E0D0FF', 64, 0.25, { rot: 0 }); decal(x, y, 'scorch_01', '#C8B8FF', 20, 0.3, { sy: 0.45, rot: 0 }); flare(x, y - 10, '#E0D0FF', 60, 0.3); burst(x, y, 16, '#E0D0FF', { kind: 'spark', speed: 260 }); break;
      case 'heal': decal(x, y + 2, 'magic_02', f.color || '#6AE06A', 32, 0.7, { sy: 0.4, spin: 2, rot: 0 }); rise(x, y - 10, 10, f.color || '#6AE06A', 18); break;
      case 'dome': decal(x, y, 'circle_02', f.color || '#F2D27A', (f.r || 60) * 0.5, 0.6, { grow: (f.r || 60) * 0.8, sy: 0.45, rot: 0 }); rise(x, y, 14, f.color || '#F2D27A', (f.r || 60) * 0.6); break;
      case 'rockfall': decal(x, y, 'dirt_01', '#B89A6A', 26, 0.6, { add: false, grow: 20 }); burst(x, y, 12, '#8A7650', { kind: 'soft', add: false, speed: 110, grow: 30, life: 0.8 }); break;
      case 'cracks': decal(x, y, 'dirt_01', '#C8A040', 30, 0.5, { add: false, grow: 30, sy: 0.6 }); burst(x, y, 18, '#C8A040', { kind: 'soft', add: false, speed: 150, grow: 20, life: 0.6 }); break;
      case 'splat': burst(x, y, 14, '#E04848', { kind: 'soft', add: false, speed: 140, grav: 300, size: 2.5 }); break;
      case 'wave': case 'gust': decal(x, y, 'twirl_02', f.color || '#9EDDF2', (f.r || 120) * 0.4, 0.5, { grow: (f.r || 120), spin: 3 }); burst(x, y, 24, f.color || '#9EDDF2', { speed: (f.r || 120) * 1.6, life: 0.5, size: 2.5 }); break;
      case 'petals': for (let i = 0; i < 18; i++) emit({ x: x + R(-(f.r || 60), f.r || 60), y: y - R(40, 90), vx: R(-20, 20), vy: R(20, 60), life: R(0.8, 1.4), size: R(3, 5), color: f.color || '#FFB8D8', kind: 'petal', add: false, spin: R(-5, 5), drag: 0.98 }); break;
      case 'beam': case 'streak': line(f.x, f.y, f.x2, f.y2, f.type === 'beam' ? 40 : 12, f.color || '#FFF1C4', { size: f.type === 'beam' ? 6 : 3 }); break;
      case 'cast': decal(x, y + 2, f.ult ? 'magic_01' : 'magic_02', f.color || '#FFE08A', f.ult ? 58 : 40, f.ult ? 0.9 : 0.65, { sy: 0.38, spin: 1.6, rot: 0 }); flare(x, y - 30, f.color || '#FFE08A', f.ult ? 60 : 30, 0.35); rise(x, y - 20, f.ult ? 26 : 12, f.color || '#FFE08A', 26); break;
      case 'evolve': decal(x, y - 30, 'light_03', f.color || '#FFE08A', f.big ? 70 : 46, 0.7, { grow: 40, spin: 1 }); decal(x, y - 30, 'star_09', '#FFF1C4', f.big ? 50 : 34, 0.5); flare(x, y - 30, f.color || '#FFE08A', f.big ? 90 : 55, 0.6); burst(x, y - 30, f.big ? 50 : 24, f.color || '#FFE08A', { speed: f.big ? 280 : 180, life: 0.8 }); rise(x, y, 20, '#FFF1C4', 30); break;
      case 'summon': decal(x, y, 'circle_03', '#9dffc4', 14, 0.5, { grow: 60, sy: 0.4, rot: 0 }); decal(x, y - 20, 'star_04', '#FFFFFF', 20, 0.35); flare(x, y - 20, '#9dffc4', 30, 0.4); rise(x, y, 14, '#9dffc4', 20); break;
      case 'die': decal(x, y - 6, 'smoke_03', '#BFE8F5', 10, 0.5, { add: false, grow: 20, a: 0.6 }); burst(x, y - 6, 10, '#BFE8F5', { add: false, kind: 'soft', speed: 80, grav: 200, size: 2 }); break;
      case 'meteor': break;     // nổ do 'explosion'
      default: break;
    }
  }

  return { emit, burst, flare, rise, line, update, draw, trail, projGlow, onEffect, sprite, tex, decal, count: () => parts.length,
    setMax: (n) => { MAX = n; if (parts.length > n) parts.splice(0, parts.length - n); } };
})();
