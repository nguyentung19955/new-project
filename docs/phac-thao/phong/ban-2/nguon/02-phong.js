// Kiến trúc phòng vuông nhìn chếch từ trên xuống (Kiểu A và C). Ba chủ đề: lâu đài, hang động, rừng.
(function () {
  const PT = window.PT, p = PT.p;
  const TH = (PT.themes = {});

  // Kích thước một phòng. o: { x, y, w, h, capN, faceH, T, dw }
  PT.geom = function (o) {
    const g = Object.assign({ capN: 8, faceH: 40, T: 12, dw: 36 }, o);
    g.fx0 = g.x + g.T; g.fx1 = g.x + g.w - g.T; g.fy0 = g.y + g.capN + g.faceH; g.fy1 = g.y + g.h - g.T;
    g.nx = Math.round(g.x + g.w / 2); g.cy = Math.round((g.fy0 + g.fy1) / 2);
    g.doors = Object.assign({ n: true, e: true, s: true, w: true }, o.doors || {});
    return g;
  };
  const isOpen = (g, d) => (g.open && typeof g.open === 'object' ? !!g.open[d] : g.state === 'open');

  // Nền phòng: vẽ trước nhân vật
  PT.room = function (c, g) {
    const T = TH[g.theme], r = PT.rng(g.seed || 3);
    T.floor(c, g, r);
    PT.shade(c, g.fx0, g.fy0, g.fx1 - g.fx0, 12, 't', 0.45);
    PT.shade(c, g.fx0, g.fy0, 6, g.fy1 - g.fy0, 'l', 0.3);
    PT.shade(c, g.fx1 - 6, g.fy0, 6, g.fy1 - g.fy0, 'r', 0.3);
    PT.shade(c, g.fx0, g.fy1 - 8, g.fx1 - g.fx0, 8, 'b', 0.3);
    T.wallN(c, g, r);
    T.wallSide(c, g, r, 'w'); T.wallSide(c, g, r, 'e');
    if (g.doors.n) T.doorN(c, g, isOpen(g, 'n'));
    if (g.doors.w) T.doorSide(c, g, 'w', isOpen(g, 'w'));
    if (g.doors.e) T.doorSide(c, g, 'e', isOpen(g, 'e'));
    if (g.doors.s && isOpen(g, 's')) PT.spill(c, 'n', g.nx - 14, g.nx + 14, g.fy1 - 1, 46, 14, T.light, 0.26);
    if (T.lights) T.lights(c, g, r);
  };
  // Phần che phía trước: mép tường trước, cửa dưới, ổ khoá, mũi tên chỉ lối
  PT.roomOver = function (c, g) {
    const T = TH[g.theme], r = PT.rng((g.seed || 3) + 99);
    T.wallS(c, g, r);
    if (g.doors.s) T.doorS(c, g, isOpen(g, 's'));
    for (const d of ['n', 'e', 's', 'w']) {
      if (!g.doors[d]) continue;
      const q = PT.doorPoint(g, d);
      if (isOpen(g, d)) { if (!g.noArrows) PT.chevron(c, q.ax, q.ay, d, T.arrow || '#ffe9a8'); } else if (!g.noLocks) PT.padlock(c, q.lx, q.ly);
    }
  };
  // Vị trí ổ khoá (lx, ly) và mũi tên (ax, ay) của từng cửa
  PT.doorPoint = function (g, d) {
    if (d === 'n') return { lx: g.nx, ly: g.fy0 - 15, ax: g.nx, ay: g.fy0 + 9 };
    if (d === 's') return { lx: g.nx, ly: g.fy1 - 12, ax: g.nx, ay: g.fy1 - 10 };
    if (d === 'w') return { lx: g.fx0 + 9, ly: g.cy - 1, ax: g.fx0 + 9, ay: g.cy };
    return { lx: g.fx1 - 10, ly: g.cy - 1, ax: g.fx1 - 10, ay: g.cy };
  };
  PT.padlock = function (c, x, y) {
    x = Math.round(x); y = Math.round(y);
    PT.glow(c, x, y + 1, 13, '255,60,40', 0.55);
    p(c, x - 3, y - 6, 7, 1, '#1b1010'); p(c, x - 4, y - 5, 2, 4, '#1b1010'); p(c, x + 3, y - 5, 2, 4, '#1b1010');
    p(c, x - 2, y - 5, 5, 1, '#e4e4ec'); p(c, x - 3, y - 4, 1, 3, '#e4e4ec'); p(c, x + 3, y - 4, 1, 3, '#b0b0ba');
    p(c, x - 5, y - 2, 11, 9, '#1b1010');
    p(c, x - 4, y - 1, 9, 7, '#d23a2e'); p(c, x - 4, y - 1, 9, 1, '#ff8a7a'); p(c, x - 4, y + 5, 9, 1, '#8a2018');
    p(c, x - 1, y + 1, 3, 2, '#2a0e0c'); p(c, x, y + 2, 1, 3, '#2a0e0c');
  };
  PT.chevron = function (c, x, y, d, col) {
    x = Math.round(x); y = Math.round(y);
    const dark = 'rgba(20,12,6,0.75)';
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 4; i++) {
        const a = i, b = 3 - i; // a: lệch ngang, b: tiến theo hướng mũi tên
        const put = (ux, uy, cc) => { // (ux: ngang so với hướng, uy: dọc theo hướng)
          let px, py;
          if (d === 'n') { px = x + ux; py = y - uy + k * 5; } else if (d === 's') { px = x + ux; py = y + uy - k * 5; } else if (d === 'e') { px = x + uy - k * 5; py = y + ux; } else { px = x - uy + k * 5; py = y + ux; }
          p(c, px, py, 1, 1, cc);
        };
        for (const s of [-1, 1]) { put(s * a, b - 1, dark); put(s * a, b, k ? col : '#ffffff'); put(s * a, b + 1, col); }
      }
    }
  };
  // Song sắt, chông: một cây chông dựng đứng tại (x, y là chân)
  function spike(c, x, y, h, m, l, d) {
    p(c, x - 3, y - 1, 7, 3, '#141010');
    p(c, x - 2, y - h, 5, h, '#141010'); p(c, x - 1, y - h, 3, h, d); p(c, x - 1, y - h, 2, h, m); p(c, x - 1, y - h, 1, h, l);
    p(c, x - 1, y - h - 2, 3, 2, '#141010'); p(c, x - 1, y - h - 2, 2, 2, m); p(c, x - 1, y - h - 3, 1, 2, l);
  }
  function hole(c, x, y) { p(c, x - 3, y - 1, 7, 3, '#141010'); p(c, x - 2, y, 5, 1, '#2a2222'); }
  PT.spike = spike; PT.hole = hole;
  const pick = (r, a) => a[(r() * a.length) | 0];

  // =====================================================================
  // LÂU ĐÀI: gạch đá, đuốc, cờ
  // =====================================================================
  const CA = { mortar: '#302728', b: ['#463b3b', '#463b3b', '#4d3f3b', '#3f3434', '#504341', '#403636'], cap: '#675952', capL: '#817267', capD: '#504341', stone: '#5c4f4a', hi: '#9a8a7c', out: '#1b1717', red: '#722727' };
  TH.castle = {
    light: '255,222,160', outside: '#0f0c0c',
    bgOutside(c, r) {
      p(c, 0, 0, 480, 270, '#0f0c0c');
      for (let i = 0; i < 70; i++) p(c, (r() * 480) | 0, (r() * 270) | 0, 10 + ((r() * 18) | 0), 6 + ((r() * 6) | 0), r() < 0.5 ? '#131010' : '#161212');
    },
    floor(c, g, r) {
      const { fx0, fx1, fy0, fy1 } = g;
      c.save(); c.beginPath(); c.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.clip();
      p(c, fx0, fy0, fx1 - fx0, fy1 - fy0, '#3f3836');
      const tw = 22, th = 14, cols = ['#4f4644', '#4f4644', '#4f4644', '#544c4a', '#49403f', '#4a4140', '#524a48'];
      for (let row = 0, y = fy0; y < fy1; y += th, row++) for (let x = fx0 - (row % 2) * 11; x < fx1; x += tw) {
        p(c, x, y, tw - 1, th - 1, pick(r, cols));
        if (r() < 0.3) p(c, x, y, tw - 1, 1, '#595150');
        if (r() < 0.14) { let cx = (x + 3 + r() * 10) | 0, cy = (y + 2 + r() * 6) | 0; for (let i = 0; i < 5; i++) { p(c, cx, cy, 1 + ((r() * 2) | 0), 1, '#373130'); cx += 1 + ((r() * 2) | 0); cy += r() < 0.5 ? 1 : 0; } }
        if (r() < 0.1) p(c, x + 4 + r() * 10, y + 4 + r() * 5, 2, 1, '#5e5655');
      }
      // thảm cũ giữa phòng
      if (!g.noRug) {
        const rw = Math.round(Math.min(120, (fx1 - fx0) * 0.46)), rh = Math.round(Math.min(74, (fy1 - fy0) * 0.36)), x = g.nx - rw / 2, y = g.cy - rh / 2;
        p(c, x, y, rw, rh, '#3a1c1e'); p(c, x + 1, y + 1, rw - 2, rh - 2, '#552628');
        p(c, x + 3, y + 3, rw - 6, rh - 6, '#7a5a34'); p(c, x + 4, y + 4, rw - 8, rh - 8, '#4c2224');
        for (let i = 0; i < rw - 14; i += 6) { p(c, x + 7 + i, y + 7, 3, 1, '#6a3a30'); p(c, x + 7 + i, y + rh - 8, 3, 1, '#6a3a30'); }
        p(c, g.nx - 6, g.cy - 6, 12, 12, '#7a5a34'); p(c, g.nx - 5, g.cy - 5, 10, 10, '#552628'); p(c, g.nx - 1, g.cy - 4, 2, 8, '#a8843c'); p(c, g.nx - 4, g.cy - 1, 8, 2, '#a8843c');
        for (let i = 0; i < 26; i++) p(c, x + 2 + r() * (rw - 6), y + 2 + r() * (rh - 5), 2 + ((r() * 3) | 0), 1, r() < 0.5 ? '#42201f' : '#5e2e2c');
        for (let i = 0; i < rw; i += 3) { p(c, x + i, y - 1, 1, 1, '#7a5a34'); p(c, x + i + 1, y + rh, 1, 1, '#7a5a34'); }
      }
      c.restore();
    },
    wallN(c, g, r) {
      const x0 = g.x, yT = g.y, yF = g.y + g.capN, yB = g.fy0, w = g.w;
      p(c, x0, yF, w, yB - yF, CA.mortar);
      for (let row = 0, y = yF; y < yB - 6; y += 8, row++) for (let x = x0 - (row % 2) * 8; x < x0 + w; x += 16) {
        const col = pick(r, CA.b); p(c, x + 1, y + 1, 15, 7, col);
        if (r() < 0.25) p(c, x + 1, y + 1, 15, 1, '#5c4f4a');
        if (r() < 0.1) p(c, x + 4 + r() * 8, y + 3 + r() * 3, 3, 1, CA.mortar);
      }
      p(c, x0, yB - 6, w, 6, CA.out);
      for (let x = x0; x < x0 + w; x += 20) { p(c, x + 1, yB - 5, 19, 4, CA.stone); p(c, x + 1, yB - 5, 19, 1, CA.capL); }
      PT.shade(c, x0, yF, w, 10, 't', 0.45);
      // cột, cờ, đuốc xếp đối xứng hai bên cửa
      const half = (g.fx1 - g.fx0) / 2;
      const col = (x) => { p(c, x - 5, yF, 10, yB - yF - 1, CA.out); p(c, x - 4, yF, 8, yB - yF - 2, CA.cap); p(c, x - 4, yF, 2, yB - yF - 2, CA.capL); p(c, x + 2, yF, 2, yB - yF - 2, CA.capD); p(c, x - 6, yF, 12, 3, CA.capL); p(c, x - 6, yF + 3, 12, 1, CA.capD); p(c, x - 6, yB - 6, 12, 5, CA.capL); p(c, x - 6, yB - 2, 12, 1, CA.capD); };
      const banner = (x) => {
        const y = yF + 4;
        p(c, x - 8, y - 1, 16, 2, '#8a6a3a'); p(c, x - 8, y - 1, 16, 1, '#c09a54');
        p(c, x - 6, y + 1, 12, 20, '#5a1e1e'); p(c, x - 5, y + 1, 10, 19, CA.red); p(c, x - 5, y + 1, 2, 19, '#8a3030');
        p(c, x - 1, y + 5, 2, 9, '#d8a838'); p(c, x - 3, y + 8, 6, 2, '#d8a838');
        p(c, x - 6, y + 21, 3, 4, CA.red); p(c, x - 1, y + 21, 3, 2, CA.red); p(c, x + 3, y + 21, 3, 5, CA.red); p(c, x - 3, y + 21, 1, 1, '#5a1e1e');
      };
      g.torches = [];
      const torch = (x) => { const y = yF + 17; p(c, x - 1, y, 2, 7, '#2a1c14'); p(c, x - 3, y - 1, 6, 2, CA.capL); p(c, x - 2, y - 5, 4, 4, '#ff7a2a'); p(c, x - 1, y - 7, 2, 5, '#ffd23f'); p(c, x - 1, y - 9, 1, 2, '#ff7a2a'); p(c, x, y - 3, 1, 2, '#fff3b0'); g.torches.push([x, y - 4]); };
      const n = half > 200 ? 3 : 1;
      for (const s of [-1, 1]) {
        torch(g.nx + s * 30);
        banner(g.nx + s * Math.round(half * 0.47));
        col(g.nx + s * Math.round(half * 0.7));
        torch(g.nx + s * Math.round(half * 0.86));
        if (n > 1) { banner(g.nx + s * Math.round(half * 0.3)); col(g.nx + s * Math.round(half * 0.16) + s * 20); }
      }
      // mặt trên của tường
      p(c, x0, yT, w, g.capN - 2, CA.cap);
      for (let x = x0 + 9; x < x0 + w; x += 18) p(c, x, yT, 1, g.capN - 2, CA.capD);
      p(c, x0, yF - 2, w, 1, CA.capL); p(c, x0, yF - 1, w, 1, CA.out);
    },
    wallSide(c, g, r, side) {
      const xa = side === 'w' ? g.x : g.fx1, T = g.T, y0 = g.y, h = g.h;
      p(c, xa, y0, T, h, CA.cap);
      for (let y = y0 + 6, i = 0; y < y0 + h; y += 16, i++) { p(c, xa + 1, y, T - 2, 1, CA.capD); p(c, xa + (i % 2 ? 4 : 7), y - 8, 1, 8, CA.capD); }
      if (side === 'w') { p(c, xa, y0, 1, h, CA.out); p(c, xa + T - 2, g.fy0 - 6, 1, g.fy1 - g.fy0 + 6, CA.capL); p(c, xa + T - 1, g.fy0 - 6, 1, g.fy1 - g.fy0 + 6, CA.out); } else { p(c, xa + T - 1, y0, 1, h, CA.out); p(c, xa + 1, g.fy0 - 6, 1, g.fy1 - g.fy0 + 6, CA.capL); p(c, xa, g.fy0 - 6, 1, g.fy1 - g.fy0 + 6, CA.out); }
    },
    wallS(c, g, r) {
      const y = g.fy1, T = g.T;
      p(c, g.x, y, g.w, T, CA.cap);
      for (let x = g.x + 5, i = 0; x < g.x + g.w; x += 18, i++) { p(c, x, y + 1, 1, T - 1, CA.capD); p(c, x - 9, y + (i % 2 ? 4 : 7), 9, 1, CA.capD); }
      p(c, g.x, y, g.w, 1, CA.out); p(c, g.x, y + 1, g.w, 1, CA.capL); p(c, g.x, y + T - 1, g.w, 1, CA.out);
    },
    doorN(c, g, open) {
      const x = g.nx, yb = g.fy0, w = 30, h = Math.min(34, g.faceH - 6), ox = x - w / 2, oy = yb - h;
      p(c, ox - 5, oy - 5, w + 10, h + 5, CA.out); p(c, ox - 4, oy - 4, w + 8, h + 4, CA.capL);
      for (let yy = oy + 3; yy < yb - 2; yy += 7) { p(c, ox - 4, yy, 4, 1, CA.stone); p(c, ox + w, yy, 4, 1, CA.stone); }
      p(c, ox - 4, oy - 4, w + 8, 1, CA.hi); p(c, x - 4, oy - 5, 8, 5, CA.hi); p(c, x - 4, oy - 1, 8, 1, CA.stone);
      const ins = (i) => (i < 1 ? 6 : i < 2 ? 4 : i < 3 ? 3 : i < 5 ? 2 : i < 8 ? 1 : 0);
      c.save(); c.beginPath(); for (let i = 0; i < h; i++) c.rect(ox + ins(i), oy + i, w - 2 * ins(i), 1); c.clip();
      if (open) {
        const g2 = c.createLinearGradient(0, oy, 0, yb); g2.addColorStop(0, '#9a6026'); g2.addColorStop(0.55, '#f0b860'); g2.addColorStop(1, '#fff0c4');
        c.fillStyle = g2; c.fillRect(ox, oy, w, h);
        p(c, ox, oy, 4, h, 'rgba(90,50,20,0.45)'); p(c, ox + w - 4, oy, 4, h, 'rgba(90,50,20,0.45)');
        p(c, x - 5, oy + 10, 10, h - 10, 'rgba(255,250,220,0.5)');
        for (let i = 0; i * 5 < w; i++) { p(c, ox + 2 + i * 5, oy, 2, 5, '#4a4a52'); p(c, ox + 2 + i * 5, oy + 5, 1, 2, '#4a4a52'); }
        p(c, ox, oy + 3, w, 1, '#3a3a42');
      } else {
        p(c, ox, oy, w, h, '#0e0a0a');
        for (let i = 0; i * 5 < w; i++) { p(c, ox + 2 + i * 5, oy, 2, h, '#62626a'); p(c, ox + 2 + i * 5, oy, 1, h, '#9a9aa4'); }
        for (const yy of [oy + 8, oy + 20]) { p(c, ox, yy, w, 2, '#4a4a52'); p(c, ox, yy, w, 1, '#7a7a84'); }
      }
      c.restore();
      p(c, ox - 5, yb - 2, w + 10, 2, CA.hi); p(c, ox - 5, yb, w + 10, 1, CA.out);
      if (open) PT.spill(c, 's', ox + 2, ox + w - 2, yb, 52, 18, TH.castle.light, 0.3);
    },
    doorSide(c, g, side, open) {
      const xa = side === 'w' ? g.x : g.fx1, T = g.T, y0 = g.cy - 18, y1 = g.cy + 18, xm = xa + T / 2;
      p(c, xa, y0, T, 36, '#2a2222');
      for (let i = 0; i < 3; i++) { p(c, xa + 1, y0 + 1 + i * 12, T - 2, 11, '#5e5351'); p(c, xa + 1, y0 + 1 + i * 12, T - 2, 1, '#7a6c66'); }
      if (open) {
        p(c, xa, y0, T, 36, 'rgba(255,226,160,0.55)');
        const ox = side === 'w' ? xa - 16 : xa + T, g2 = c.createLinearGradient(side === 'w' ? xa : xa + T, 0, side === 'w' ? xa - 16 : xa + T + 16, 0);
        g2.addColorStop(0, 'rgba(255,226,160,0.6)'); g2.addColorStop(1, 'rgba(255,226,160,0)'); c.fillStyle = g2; c.fillRect(ox, y0, 16, 36);
        PT.spill(c, side === 'w' ? 'e' : 'w', y0 + 3, y1 - 3, side === 'w' ? g.fx0 : g.fx1 - 1, 52, 16, TH.castle.light, 0.3);
        for (let i = 0; i < 5; i++) hole(c, xm, y0 + 4 + i * 7);
      } else {
        p(c, xa, y0, T, 36, 'rgba(0,0,0,0.35)');
        for (let i = 0; i < 5; i++) spike(c, xm, y0 + 5 + i * 7, 10, '#8a8a94', '#d0d0da', '#4a4a52');
      }
      for (const yy of [y0 - 10, y1]) {
        p(c, xa - 2, yy, T + 4, 11, CA.out); p(c, xa - 1, yy + 1, T + 2, 6, CA.capL); p(c, xa - 1, yy + 1, T + 2, 1, CA.hi); p(c, xa - 1, yy + 7, T + 2, 3, CA.stone);
      }
    },
    doorS(c, g, open) {
      const x = g.nx, y = g.fy1, T = g.T;
      p(c, x - 18, y, 36, T, '#2a2222');
      for (let i = 0; i < 3; i++) { p(c, x - 17 + i * 12, y + 1, 11, T - 1, '#5e5351'); p(c, x - 17 + i * 12, y + 1, 11, 1, '#7a6c66'); }
      if (open) { p(c, x - 18, y, 36, T, 'rgba(255,226,160,0.6)'); for (let i = 0; i < 5; i++) hole(c, x - 14 + i * 7, y + 6); } else { p(c, x - 18, y, 36, T, 'rgba(0,0,0,0.35)'); for (let i = 0; i < 5; i++) spike(c, x - 14 + i * 7, y + 9, 11, '#8a8a94', '#d0d0da', '#4a4a52'); }
      for (const xx of [x - 27, x + 18]) { p(c, xx, y - 3, 10, T + 3, CA.out); p(c, xx + 1, y - 2, 8, T - 4, CA.capL); p(c, xx + 1, y - 2, 8, 1, CA.hi); p(c, xx + 1, y + T - 6, 8, 5, CA.stone); }
    },
    lights(c, g) {
      for (const t of g.torches || []) { PT.glow(c, t[0], t[1], 30, '255,150,60', 0.3); PT.glow(c, t[0], t[1] + 22, 34, '255,150,60', 0.1); }
    },
  };
})();
