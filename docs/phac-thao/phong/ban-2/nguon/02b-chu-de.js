// Hai chủ đề còn lại của phòng vuông: hang động và rừng.
(function () {
  const PT = window.PT, p = PT.p, TH = PT.themes, ell = PT.ell;
  const pick = (r, a) => a[(r() * a.length) | 0];

  // Cửa hông và cửa dưới dùng chung khung: st = { thr: [nền, mặt, viền sáng], light, bar(c, x, y), stub(c, x, y), post(c, x, y, w, h) }
  function doorSide(c, g, side, open, st) {
    const xa = side === 'w' ? g.x : g.fx1, T = g.T, y0 = g.cy - 18, y1 = g.cy + 18, xm = xa + T / 2;
    p(c, xa - 1, y0, T + 2, 36, st.thr[0]);
    for (let i = 0; i < 3; i++) { p(c, xa, y0 + 1 + i * 12, T, 11, st.thr[1]); p(c, xa, y0 + 1 + i * 12, T, 1, st.thr[2]); }
    if (open) {
      p(c, xa, y0, T, 36, 'rgba(' + st.light + ',0.5)');
      const g2 = c.createLinearGradient(side === 'w' ? xa : xa + T, 0, side === 'w' ? xa - 16 : xa + T + 16, 0);
      g2.addColorStop(0, 'rgba(' + st.light + ',0.6)'); g2.addColorStop(1, 'rgba(' + st.light + ',0)'); c.fillStyle = g2; c.fillRect(side === 'w' ? xa - 16 : xa + T, y0, 16, 36);
      PT.spill(c, side === 'w' ? 'e' : 'w', y0 + 3, y1 - 3, side === 'w' ? g.fx0 : g.fx1 - 1, 52, 16, st.light, 0.3);
      for (let i = 0; i < 5; i++) st.stub(c, xm, y0 + 5 + i * 7);
    } else {
      p(c, xa, y0, T, 36, 'rgba(0,0,0,0.4)');
      for (let i = 0; i < 5; i++) st.bar(c, xm, y0 + 6 + i * 7, i);
    }
    st.post(c, xa - 2, y0 - 10, T + 4, 11); st.post(c, xa - 2, y1, T + 4, 11);
  }
  function doorS(c, g, open, st) {
    const x = g.nx, y = g.fy1, T = g.T;
    p(c, x - 18, y - 1, 36, T + 1, st.thr[0]);
    for (let i = 0; i < 3; i++) { p(c, x - 17 + i * 12, y, 11, T, st.thr[1]); p(c, x - 17 + i * 12, y, 11, 1, st.thr[2]); }
    if (open) { p(c, x - 18, y, 36, T, 'rgba(' + st.light + ',0.55)'); for (let i = 0; i < 5; i++) st.stub(c, x - 14 + i * 7, y + 7); } else { p(c, x - 18, y, 36, T, 'rgba(0,0,0,0.4)'); for (let i = 0; i < 5; i++) st.bar(c, x - 14 + i * 7, y + 10, i); }
    st.post(c, x - 28, y - 3, 11, T + 3); st.post(c, x + 17, y - 3, 11, T + 3);
  }

  // =====================================================================
  // HANG ĐỘNG: vách đá, tinh thể, nhũ đá
  // =====================================================================
  const CV = { rock: '#1a2431', r2: '#202d3b', r3: '#243443', dk: '#121b26', out: '#080d14', top: '#2c3c4e', hi: '#3e5266', hi2: '#56708a' };
  function boulder(c, x, y, rx, ry) { ell(c, x, y + 1, rx + 1, ry + 1, CV.out); ell(c, x, y, rx, ry, CV.r3); ell(c, x - 1, y - 1, Math.max(1, rx - 2), Math.max(1, ry - 2), CV.top); p(c, x - rx + 2, y - ry + 1, Math.max(2, rx - 2), 1, CV.hi); }
  function crystal(c, x, y, s) {
    for (const d of [[-6, 7], [5, 9], [-1, 14], [2, 6]]) {
      const h = Math.round(d[1] * s), xx = x + d[0];
      p(c, xx - 2, y - h, 5, h, '#123a52'); p(c, xx - 1, y - h, 3, h, '#2a88b8'); p(c, xx - 1, y - h, 2, h, '#5fd0f0'); p(c, xx - 1, y - h, 1, h, '#d8f8ff');
      p(c, xx - 1, y - h - 2, 3, 2, '#123a52'); p(c, xx, y - h - 2, 1, 2, '#d8f8ff');
    }
  }
  function stoneSpike(c, x, y, i) {
    const h = 11 + (i % 2) * 3;
    p(c, x - 4, y - 1, 9, 3, CV.out);
    for (let k = 0; k < h; k++) { const w = Math.max(1, Math.round(7 * (1 - k / h))); p(c, x - (w >> 1), y - k, w, 1, '#4a5c70'); p(c, x - (w >> 1), y - k, Math.max(1, w >> 1), 1, '#8aa2b8'); }
    p(c, x, y - h, 1, 1, '#d0e0ee');
  }
  const caveSt = {
    thr: ['#0c131c', '#323c48', '#465260'], light: '150,225,255',
    bar: stoneSpike,
    stub(c, x, y) { p(c, x - 3, y - 1, 7, 3, CV.out); p(c, x - 2, y - 2, 5, 2, '#4a5c70'); p(c, x - 2, y - 2, 2, 1, '#8aa2b8'); },
    post(c, x, y, w, h) { boulder(c, x + w / 2, y + h / 2, w / 2 + 1, h / 2 + 1); },
  };
  TH.cave = {
    light: '150,225,255', arrow: '#c8f4ff',
    bgOutside(c, r) {
      p(c, 0, 0, 480, 270, '#060a10');
      for (let i = 0; i < 80; i++) ell(c, r() * 480, r() * 270, 8 + r() * 16, 3 + r() * 5, r() < 0.5 ? '#090f17' : '#0b121b');
    },
    floor(c, g, r) {
      const { fx0, fx1, fy0, fy1 } = g, w = fx1 - fx0, h = fy1 - fy0;
      c.save(); c.beginPath(); c.rect(fx0, fy0, w, h); c.clip();
      p(c, fx0, fy0, w, h, '#3b434e');
      for (let i = 0; i < w * h / 520; i++) ell(c, fx0 + r() * w, fy0 + r() * h, 7 + r() * 14, 3 + r() * 6, pick(r, ['#363e48', '#404852', '#363e48', '#3f4751', '#303740']));
      for (let i = 0; i < w * h / 1400; i++) { let x = (fx0 + r() * w) | 0, y = (fy0 + r() * h) | 0; for (let k = 0; k < 7; k++) { p(c, x, y, 2 + ((r() * 3) | 0), 1, '#2a3038'); x += 2 + ((r() * 2) | 0); y += r() < 0.4 ? 1 : 0; } }
      // vũng nước
      for (let i = 0; i < Math.max(4, w * h / 9000); i++) {
        const x = fx0 + 20 + r() * (w - 40), y = fy0 + 20 + r() * (h - 40), rx = 9 + r() * 12, ry = 3 + r() * 3;
        ell(c, x, y, rx + 1, ry + 1, '#2c343e'); ell(c, x, y, rx, ry, '#2a4457'); ell(c, x + 1, y + 1, rx - 3, Math.max(1, ry - 2), '#1e3446'); p(c, x - rx * 0.5, y - 1, rx * 0.6, 1, '#6a9ab8');
      }
      for (let i = 0; i < w * h / 700; i++) { const x = fx0 + r() * w, y = fy0 + r() * h; p(c, x, y + 1, 2, 1, '#262c34'); p(c, x, y, 2, 1, r() < 0.5 ? '#545c64' : '#4a525c'); }
      // rêu sẫm sát chân vách
      for (let x = fx0; x < fx1; x += 5) { ell(c, x, fy0 + 1, 4, 1 + r() * 3, '#2e363f'); ell(c, x, fy1, 4, 1 + r() * 2, '#2e363f'); }
      c.restore();
    },
    wallN(c, g, r) {
      const x0 = g.x, yT = g.y, yF = g.y + g.capN, yB = g.fy0, w = g.w, half = (g.fx1 - g.fx0) / 2;
      p(c, x0, yT, w, yB - yT, CV.rock);
      for (let i = 0; i < w / 2.2; i++) ell(c, x0 + r() * w, yF + r() * (yB - yF), 6 + r() * 16, 2 + r() * 3, pick(r, [CV.r2, CV.r3, CV.dk, '#1d2937', CV.r2]));
      PT.shade(c, x0, yF, w, 14, 't', 0.55);
      g.torches = [];
      // nhũ đá rủ từ mép trên
      for (let x = g.fx0 + 5; x < g.fx1; x += 7 + r() * 13) {
        const near = Math.abs(x - g.nx) < 24, L = (near ? 4 : 7 + r() * 17) | 0, W0 = near ? 3 : 4 + ((r() * 3) | 0);
        for (let i = 0; i < L; i++) { const ww = Math.max(1, Math.round(W0 * (1 - i / L))); p(c, x - (ww >> 1), yF + i, ww, 1, CV.dk); p(c, x - (ww >> 1), yF + i, 1, 1, CV.hi); }
        if (r() < 0.3) p(c, x, yF + L + 2 + r() * 6, 1, 2, '#9ad0f0');
      }
      // tảng đá chân vách và tinh thể
      for (let x = g.fx0 - 2; x < g.fx1 + 4; x += 9 + r() * 7) { if (Math.abs(x - g.nx) < 26) continue; boulder(c, x, yB - 2 - r() * 2, 6 + r() * 4, 3 + r() * 3); }
      for (const s of [-1, 1]) for (const k of [0.36, 0.8]) { const x = g.nx + s * Math.round(half * k), sc = k < 0.5 ? 1.25 : 0.9; crystal(c, x, yB - 1, sc); g.torches.push([x, yB - 9]); }
      if (half > 200) for (const s of [-1, 1]) { crystal(c, g.nx + s * Math.round(half * 0.58), yB - 1, 1.1); g.torches.push([g.nx + s * Math.round(half * 0.58), yB - 9]); }
      // mặt trên vách
      p(c, x0, yT, w, g.capN - 1, CV.top);
      for (let x = x0; x < x0 + w; x += 6) { ell(c, x + r() * 3, yF - 1, 5, 1 + r() * 2.5, CV.top); if (r() < 0.5) p(c, x, yT + 1 + r() * 4, 3 + r() * 4, 1, CV.hi); }
    },
    wallSide(c, g, r, side) {
      const xa = side === 'w' ? g.x : g.fx1, T = g.T;
      p(c, xa, g.y, T, g.h, CV.top);
      for (let y = g.y + 3; y < g.y + g.h; y += 5 + r() * 3) p(c, xa + 2 + r() * (T - 7), y, 3 + r() * 3, 1, r() < 0.5 ? CV.hi : CV.r3);
      const xi = side === 'w' ? xa + T - 1 : xa, xo = side === 'w' ? xa : xa + T - 1;
      for (let y = g.fy0 - 4; y < g.fy1 + 4; y += 7 + r() * 4) boulder(c, xi + (side === 'w' ? -1 : 1) * (1 + r() * 2), y, 4 + r() * 3, 3 + r() * 2);
      for (let y = g.y; y < g.y + g.h; y += 6) ell(c, xo, y, 2 + r() * 2, 4, '#060a10');
    },
    wallS(c, g, r) {
      const y = g.fy1, T = g.T;
      p(c, g.x, y + 2, g.w, T - 2, CV.top);
      for (let x = g.x + 2; x < g.x + g.w; x += 8 + r() * 6) boulder(c, x, y + 2 + r() * 2, 5 + r() * 4, 3 + r() * 2);
      for (let x = g.x; x < g.x + g.w; x += 7) { p(c, x + r() * 4, y + 7 + r() * 3, 3 + r() * 4, 1, CV.hi); }
      p(c, g.x, y + T - 1, g.w, 1, CV.out);
    },
    doorN(c, g, open) {
      const x = g.nx, yb = g.fy0, w = 32, h = Math.min(33, g.faceH - 6), ox = x - w / 2, oy = yb - h;
      const ins = (i) => (i < 1 ? 9 : i < 2 ? 6 : i < 4 ? 4 : i < 7 ? 2 : i < 11 ? 1 : 0);
      // viền đá quanh miệng hang
      for (let i = -3; i < h; i++) { const k = ins(Math.max(0, i)) - 4; p(c, ox + k, oy + i, w - 2 * k, 1, i < 0 ? CV.hi : CV.top); }
      for (let i = 0; i < h; i += 6) { p(c, ox + ins(i) - 4, oy + i, 3, 1, CV.hi2); p(c, ox + w - ins(i) + 1, oy + i + 3, 3, 1, CV.dk); }
      c.save(); c.beginPath(); for (let i = 0; i < h; i++) c.rect(ox + ins(i), oy + i, w - 2 * ins(i), 1); c.clip();
      if (open) {
        const g2 = c.createLinearGradient(0, oy, 0, yb); g2.addColorStop(0, '#12384e'); g2.addColorStop(0.6, '#6ac0e0'); g2.addColorStop(1, '#e0f8ff');
        c.fillStyle = g2; c.fillRect(ox, oy, w, h);
        p(c, ox, oy, 5, h, 'rgba(10,30,50,0.5)'); p(c, ox + w - 5, oy, 5, h, 'rgba(10,30,50,0.5)'); p(c, x - 5, oy + 12, 10, h - 12, 'rgba(240,252,255,0.5)');
        for (let i = 0; i < 5; i++) { p(c, ox + 3 + i * 6, oy, 3, 4 + (i % 2) * 2, '#3a4a5c'); p(c, ox + 4 + i * 6, yb - 3, 3, 3, '#3a4a5c'); }
      } else {
        p(c, ox, oy, w, h, '#05080c');
        // răng đá trên dưới cài vào nhau
        for (let i = 0; i < 5; i++) {
          const xx = ox + 4 + i * 6, L = 15 + (i % 2) * 4;
          for (let k = 0; k < L; k++) { const ww = Math.max(1, Math.round(6 * (1 - k / L))); p(c, xx + 3 - (ww >> 1), oy + k, ww, 1, '#3a4a5c'); p(c, xx + 3 - (ww >> 1), oy + k, 1, 1, '#7a92a8'); }
        }
        for (let i = 0; i < 6; i++) {
          const xx = ox + 1 + i * 6, L = 16 + ((i + 1) % 2) * 4;
          for (let k = 0; k < L; k++) { const ww = Math.max(1, Math.round(6 * (1 - k / L))); p(c, xx + 3 - (ww >> 1), yb - 1 - k, ww, 1, '#4a5c70'); p(c, xx + 3 - (ww >> 1), yb - 1 - k, Math.max(1, ww >> 1), 1, '#8aa2b8'); }
        }
      }
      c.restore();
      if (open) PT.spill(c, 's', ox + 2, ox + w - 2, yb, 52, 18, TH.cave.light, 0.26);
    },
    doorSide(c, g, side, open) { doorSide(c, g, side, open, caveSt); },
    doorS(c, g, open) { doorS(c, g, open, caveSt); },
    lights(c, g) { for (const t of g.torches || []) { PT.glow(c, t[0], t[1], 26, '70,190,255', 0.3); PT.glow(c, t[0], t[1] + 16, 30, '70,190,255', 0.1); } },
  };

  // =====================================================================
  // RỪNG: thân cây khổng lồ, rễ cây, hàng rào gai, khoảng đất trống
  // =====================================================================
  const FO = { bark: '#372a1e', barkD: '#231a12', barkL: '#513f2b', barkH: '#6a5438', leaf0: '#0b1810', leaf1: '#112618', leaf2: '#1a3a20', leaf3: '#2a5a2c', leaf4: '#4d8a3a', thorn: '#d8c890', berry: '#c8372d' };
  function bush(c, x, y, rx, ry, r) {
    ell(c, x, y + 1, rx + 1, ry + 1, '#060c08'); ell(c, x, y, rx, ry, pick(r, [FO.leaf1, FO.leaf2, FO.leaf2]));
    ell(c, x - 1, y - 1, Math.max(1, rx - 2), Math.max(1, ry - 2), FO.leaf2); p(c, x - rx + 2, y - ry + 1, Math.max(2, rx - 2), 1, FO.leaf3);
    if (r() < 0.6) p(c, x - 1 + r() * 3, y - 1, 2, 1, FO.leaf4);
  }
  function thorn(c, x, y, d) { p(c, x, y, 2, 1, FO.thorn); p(c, x + d, y - 1, 1, 1, '#fff3c8'); }
  function stump(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 - 1;
    ell(c, cx, cy + 3, w / 2 + 1, h / 2, FO.barkD); p(c, cx - w / 2, cy, w, 3, FO.bark); ell(c, cx, cy, w / 2, h / 2 - 1, FO.barkH); ell(c, cx, cy, w / 2 - 2, Math.max(1, h / 2 - 3), '#8a7048'); p(c, cx - 1, cy, 2, 1, FO.barkL);
  }
  function bramble(c, x, y, i) {
    // một đốt dây gai: thân xanh sẫm uốn lượn, gai sáng chĩa hai bên
    const o = i % 2 ? 2 : -2;
    p(c, x - 4, y, 9, 2, 'rgba(0,0,0,0.5)');
    p(c, x - 2 + o, y - 9, 5, 9, '#14220f'); p(c, x - 1 + o, y - 9, 3, 9, '#3d5a26'); p(c, x - 1 + o, y - 9, 1, 9, '#6b8f3a');
    thorn(c, x + 2 + o, y - 7, 1); thorn(c, x - 4 + o, y - 4, -1); thorn(c, x + 2 + o, y - 2, 1);
    if (i % 2 === 0) { p(c, x - 1 + o, y - 11, 3, 3, FO.berry); p(c, x + o, y - 11, 1, 1, '#ff9a8a'); }
  }
  const forestSt = {
    thr: ['#2a2418', '#5a5038', '#6e6446'], light: '240,246,170',
    bar: bramble,
    stub(c, x, y) { p(c, x - 2, y - 1, 5, 2, '#14220f'); p(c, x - 1, y - 2, 3, 2, '#3d5a26'); },
    post: stump,
  };
  TH.forest = {
    light: '240,246,170', arrow: '#f4ffb0',
    bgOutside(c, r) {
      p(c, 0, 0, 480, 270, '#060d08');
      for (let i = 0; i < 150; i++) ell(c, r() * 480, r() * 270, 6 + r() * 12, 3 + r() * 6, pick(r, ['#08120c', '#0a160e', '#0c1a11']));
      for (let i = 0; i < 60; i++) p(c, r() * 480, r() * 270, 2, 1, '#122418');
    },
    floor(c, g, r) {
      const { fx0, fx1, fy0, fy1 } = g, w = fx1 - fx0, h = fy1 - fy0;
      c.save(); c.beginPath(); c.rect(fx0, fy0, w, h); c.clip();
      p(c, fx0, fy0, w, h, '#544a33');
      for (let i = 0; i < w * h / 420; i++) ell(c, fx0 + r() * w, fy0 + r() * h, 8 + r() * 16, 3 + r() * 6, pick(r, ['#5c5138', '#4c432e', '#584e36', '#62573c', '#4a412c']));
      // rêu và cỏ loang
      for (let i = 0; i < w * h / 2600; i++) { const x = fx0 + r() * w, y = fy0 + r() * h; ell(c, x, y, 7 + r() * 9, 3 + r() * 3, '#4a4e30'); ell(c, x + 1, y, 4 + r() * 4, 2, '#4d5632'); }
      for (let i = 0; i < w * h / 600; i++) { const x = fx0 + r() * w, y = fy0 + r() * h; p(c, x, y + 1, 2, 1, '#3a3222'); p(c, x, y, 2, 1, pick(r, ['#7a7260', '#6a6250', '#8a5a2a', '#a8742a'])); }
      // vệt nắng lọt qua tán lá
      for (let i = 0; i < 6; i++) ell(c, fx0 + 20 + r() * (w - 40), fy0 + 20 + r() * (h - 40), 14 + r() * 14, 5 + r() * 5, 'rgba(255,240,150,0.07)');
      // cỏ mọc dày ở rìa khoảng trống
      const tuft = (x, y) => { const col = pick(r, ['#39632b', '#4d6b28', '#6b8f3a', '#2f5224']); p(c, x, y - 2, 1, 3, col); p(c, x + 1, y - 3 - ((r() * 2) | 0), 1, 4, col); p(c, x + 2, y - 1, 1, 2, col); };
      for (let x = fx0; x < fx1; x += 3) { if (r() < 0.8) tuft(x, fy0 + 3 + r() * 7); if (r() < 0.7) tuft(x, fy1 - 1 - r() * 6); }
      for (let y = fy0; y < fy1; y += 3) { if (r() < 0.7) tuft(fx0 + r() * 7, y); if (r() < 0.7) tuft(fx1 - 3 - r() * 7, y); }
      for (let i = 0; i < w * h / 900; i++) tuft(fx0 + r() * w, fy0 + r() * h);
      c.restore();
    },
    wallN(c, g, r) {
      const x0 = g.x, yT = g.y, yF = g.y + g.capN, yB = g.fy0, w = g.w, half = (g.fx1 - g.fx0) / 2;
      p(c, x0, yT, w, yB - yT, FO.leaf0);
      for (let i = 0; i < w / 3; i++) ell(c, x0 + r() * w, yF + r() * (yB - yF - 8), 5 + r() * 9, 3 + r() * 4, pick(r, ['#0d1c12', FO.leaf1, '#14301a']));
      // hàng rào gai dưới chân
      for (let x = g.fx0; x < g.fx1 + 6; x += 7) { bush(c, x + r() * 2, yB - 7 - r() * 5, 6 + r() * 2, 5 + r() * 2, r); if (r() < 0.5) thorn(c, x + r() * 4, yB - 3 - r() * 8, r() < 0.5 ? 1 : -1); if (r() < 0.2) { p(c, x + 2, yB - 8, 2, 2, FO.berry); } }
      g.torches = [];
      const trunk = (x, wd) => {
        const xl = Math.round(x - wd / 2), h = yB - yT + 2;
        p(c, xl - 1, yT, wd + 2, h, FO.barkD); p(c, xl, yT, wd, h, FO.bark); p(c, xl + 1, yT, 3, h, FO.barkL); p(c, xl + 1, yT, 1, h, FO.barkH); p(c, xl + wd - 4, yT, 4, h, '#2b2017');
        for (let i = 0; i < wd / 2; i++) p(c, xl + 4 + r() * (wd - 9), yT + r() * (h - 10), 1, 4 + r() * 9, r() < 0.7 ? FO.barkD : FO.barkL);
        for (let i = 0; i < 3; i++) { const mx = xl + 2 + r() * (wd - 8), my = yF + 6 + r() * (h - 24); p(c, mx, my, 4 + r() * 4, 2, '#39632b'); p(c, mx + 1, my - 1, 3, 1, '#4d8a3a'); }
        // rễ xoè ra hai bên, bò xuống nền
        for (const s of [-1, 1]) for (let i = 0; i < 12; i++) {
          const px = (s < 0 ? xl - 1 - i : xl + wd + i), top = yB - 11 + i + ((i / 4) | 0), bot = yB + 4 - ((i / 3) | 0);
          if (bot <= top) continue;
          p(c, px, top, 1, bot - top, FO.bark); p(c, px, top, 1, 1, FO.barkH); p(c, px, bot, 1, 1, '#1a120c');
        }
        p(c, xl, yB + 1, wd, 3, FO.bark); p(c, xl, yB + 4, wd, 1, '#1a120c');
      };
      for (const s of [-1, 1]) { trunk(g.nx + s * Math.round(half * 0.6), 30); trunk(g.nx + s * Math.round(half * 0.98), 24); if (half > 200) trunk(g.nx + s * Math.round(half * 0.3), 26); }
      // nấm phát sáng và đèn treo
      for (const s of [-1, 1]) {
        const lx = g.nx + s * 36, ly = yF + 14;
        p(c, lx, yF, 1, 12, FO.barkD); p(c, lx - 3, ly - 2, 7, 9, FO.barkD); p(c, lx - 2, ly - 1, 5, 7, '#ffd27a'); p(c, lx - 1, ly, 3, 4, '#fff3c8'); p(c, lx - 3, ly - 3, 7, 1, FO.barkL);
        g.torches.push([lx, ly + 2]);
        const mx = g.nx + s * Math.round(half * 0.33);
        if (half <= 200) for (let i = 0; i < 3; i++) { const x = mx + i * 5 - 5, hh = 3 + (i % 2) * 2; p(c, x, yB - hh, 1, hh, '#e8dcc0'); p(c, x - 2, yB - hh - 2, 5, 2, '#e07a3a'); p(c, x - 1, yB - hh - 3, 3, 1, '#f0a060'); }
      }
      // tán lá phủ phía trên, dây leo rủ xuống
      p(c, x0, yT, w, g.capN + 1, FO.leaf1);
      for (let x = x0; x < x0 + w; x += 5) { ell(c, x + r() * 3, yF + 1 + r() * 4, 6, 3 + r() * 2.5, pick(r, [FO.leaf1, '#16301c', FO.leaf2])); if (r() < 0.6) p(c, x, yT + 1 + r() * (g.capN + 3), 2 + r() * 2, 1, pick(r, [FO.leaf3, FO.leaf2, FO.leaf4])); }
      for (let x = g.fx0 + 8; x < g.fx1; x += 11 + r() * 16) { if (Math.abs(x - g.nx) < 20) continue; const L = 6 + r() * 16; p(c, x, yF + 3, 1, L, FO.leaf3); for (let k = 2; k < L; k += 4) p(c, x + (k % 8 ? -1 : 1), yF + 3 + k, 1, 1, FO.leaf4); }
    },
    wallSide(c, g, r, side) {
      const xa = side === 'w' ? g.x : g.fx1, T = g.T, s = side === 'w' ? 1 : -1;
      p(c, xa, g.y, T, g.h, FO.leaf0);
      for (let y = g.fy0 - 6; y < g.y + g.h; y += 5) {
        const cx = xa + T / 2 + (r() - 0.5) * 3;
        bush(c, cx, y, T / 2 + 1 + r() * 2, 4 + r() * 2, r);
        if (r() < 0.55) thorn(c, cx + s * (T / 2 + 1), y + 1, s);
        if (r() < 0.18) { p(c, cx - 1, y - 2, 2, 2, FO.berry); p(c, cx - 1, y - 2, 1, 1, '#ff9a8a'); }
      }
    },
    wallS(c, g, r) {
      const y = g.fy1, T = g.T;
      p(c, g.x, y + 3, g.w, T - 3, FO.leaf0);
      for (let x = g.x; x < g.x + g.w + 6; x += 6) {
        bush(c, x + r() * 2, y + 6 + r() * 2, 6 + r() * 2, 5 + r() * 2, r);
        if (r() < 0.5) thorn(c, x + r() * 4, y + 1, r() < 0.5 ? 1 : -1);
        if (r() < 0.16) { p(c, x + 1, y + 4, 2, 2, FO.berry); p(c, x + 1, y + 4, 1, 1, '#ff9a8a'); }
      }
    },
    doorN(c, g, open) {
      const x = g.nx, yb = g.fy0, w = 30, h = Math.min(34, g.faceH - 5), ox = x - w / 2, oy = yb - h;
      const ins = (i) => (i < 1 ? 8 : i < 2 ? 5 : i < 4 ? 3 : i < 7 ? 2 : i < 10 ? 1 : 0);
      // vòm rễ cây
      for (let i = -4; i < h; i++) { const k = ins(Math.max(0, i)) - 5; p(c, ox + k - 1, oy + i, w - 2 * k + 2, 1, FO.barkD); p(c, ox + k, oy + i, w - 2 * k, 1, i < -2 ? FO.barkH : FO.barkL); }
      for (let i = 0; i < h; i += 5) { p(c, ox + ins(i) - 4, oy + i, 2, 3, FO.barkH); p(c, ox + w - ins(i) + 2, oy + i + 2, 2, 3, FO.bark); }
      for (const s of [-1, 1]) for (let i = 0; i < 8; i++) { const px = s < 0 ? ox - 6 - i : ox + w + 5 + i; p(c, px, yb - 6 + i, 1, 9 - i - ((i / 3) | 0), FO.barkL); p(c, px, yb - 6 + i, 1, 1, FO.barkH); }
      c.save(); c.beginPath(); for (let i = 0; i < h; i++) c.rect(ox + ins(i), oy + i, w - 2 * ins(i), 1); c.clip();
      if (open) {
        const g2 = c.createLinearGradient(0, oy, 0, yb); g2.addColorStop(0, '#2e5a26'); g2.addColorStop(0.55, '#b8d870'); g2.addColorStop(1, '#fbffd0');
        c.fillStyle = g2; c.fillRect(ox, oy, w, h);
        p(c, ox, oy, 5, h, 'rgba(20,50,20,0.5)'); p(c, ox + w - 5, oy, 5, h, 'rgba(20,50,20,0.5)'); p(c, x - 5, oy + 12, 10, h - 12, 'rgba(255,255,230,0.5)');
        for (let i = 0; i < 4; i++) { p(c, ox + 1, oy + 4 + i * 8, 3, 2, '#3d5a26'); p(c, ox + w - 4, oy + 8 + i * 7, 3, 2, '#3d5a26'); }
      } else {
        p(c, ox, oy, w, h, '#050a06');
        // dây gai đan chéo bịt lối
        for (let k = -1; k < 4; k++) for (let i = 0; i < h + 6; i++) {
          const xa = ox - 4 + k * 10 + i * 0.75, xb = ox + w + 2 - k * 10 - i * 0.75;
          p(c, xa, oy + i, 3, 1, '#3d5a26'); p(c, xa, oy + i, 1, 1, '#6b8f3a'); p(c, xb, oy + i, 3, 1, '#2f4a20'); p(c, xb + 2, oy + i, 1, 1, '#14220f');
          if (i % 6 === 2) { thorn(c, xa + 3, oy + i, 1); thorn(c, xb - 2, oy + i, -1); }
        }
        for (const q of [[-7, 10], [6, 17], [-2, 25], [9, 6]]) { p(c, x + q[0] - 1, oy + q[1] - 1, 3, 3, FO.berry); p(c, x + q[0] - 1, oy + q[1] - 1, 1, 1, '#ff9a8a'); }
      }
      c.restore();
      if (open) PT.spill(c, 's', ox + 2, ox + w - 2, yb, 52, 18, TH.forest.light, 0.24);
    },
    doorSide(c, g, side, open) { doorSide(c, g, side, open, forestSt); },
    doorS(c, g, open) { doorS(c, g, open, forestSt); },
    lights(c, g, r) {
      for (const t of g.torches || []) { PT.glow(c, t[0], t[1], 24, '255,200,90', 0.3); PT.glow(c, t[0], t[1] + 18, 30, '255,200,90', 0.1); }
      // đom đóm
      for (let i = 0; i < 9; i++) { const x = g.fx0 + 10 + r() * (g.fx1 - g.fx0 - 20), y = g.fy0 - 20 + r() * (g.fy1 - g.fy0); p(c, x, y, 1, 1, '#e8ff9a'); PT.glow(c, x, y, 5, '200,255,120', 0.35); }
    },
  };
})();
