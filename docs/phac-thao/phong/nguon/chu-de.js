// Hai chủ đề còn lại cho phòng vuông nhìn từ trên: hang động và rừng.
(function () {
  const G = window.G, M = window.Mock, U = M.util;
  const DARK = U.DARK, mix = U.mix, dim = U.dim, lite = U.lite, rgba = U.rgba;
  const r = (x, y, w, h, col) => { const c = M.cur(); c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const ell = U.ell, glow = U.glow;
  const ri = (rn, a, b) => a + Math.floor(rn() * (b - a + 1));
  // Tam giác nhọn: dir 1 chĩa xuống, -1 chĩa lên
  function spike(x, y, w, h, dir, col, hi) {
    for (let i = 0; i < h; i++) {
      const ww = Math.max(1, Math.round(w * (1 - i / h)));
      r(x - ww / 2, y + dir * i, ww, 1, col);
      if (hi) r(x - ww / 2, y + dir * i, 1, 1, hi);
    }
  }

  // ====================================================================
  // HANG ĐỘNG
  // ====================================================================
  const C = {
    void: '#0a121c', rock: '#22303f', rockD: '#141d29', rockL: '#34495c', wet: '#6f9ab8',
    cry: '#58c8ea', cryL: '#d8f6ff', cryD: '#2a7fae', floor: '#3f4853', water: '#1b4a66', waterD: '#123650', waterL: '#8fd0ea', light: '#9fe0f4',
  };
  function crystal(x, yb, s, glowOn) {
    if (glowOn !== false) glow(x, yb - s * 4, s * 7, s * 6, C.cry, 0.06, 4);
    const sh = (dx, w, h, c1, c2) => {
      for (let i = 0; i < h; i++) {
        const ww = i < 3 ? Math.max(1, Math.round((w * (i + 1)) / 3)) : w;
        r(x + dx - ww / 2, yb - h + i, ww, 1, c1);
        r(x + dx - ww / 2, yb - h + i, Math.max(1, ww >> 1), 1, c2);
      }
      r(x + dx - 1, yb - h, 1, 2, C.cryL);
    };
    sh(-3 * s, 3 * s, 6 * s, C.cryD, C.cry); sh(3 * s, 3 * s, 5 * s, C.cryD, C.cry); sh(0, 4 * s, 9 * s, C.cry, C.cryL);
  }
  function rockFace(x, y, w, h, rn) {
    U.clipRect(x, y, w, h, () => {
      r(x, y, w, h, C.rock);
      for (let i = 0, n = (w * h) / 150; i < n; i++) {
        const cx = x + rn() * w, cy = y + rn() * h, rx = ri(rn, 7, 16), ry = ri(rn, 3, 6);
        ell(cx, cy + 2, rx, ry, C.rockD); ell(cx, cy, rx, ry, rn() < 0.5 ? C.rockL : mix(C.rock, C.rockL, 0.5));
        r(cx - rx * 0.5, cy - ry + 1, rx, 1, lite(C.rockL, 0.08));
      }
      for (let i = 0, n = w / 22; i < n; i++) { const cx = x + rn() * w, cy = y + rn() * h; r(cx, cy, 1, ri(rn, 4, 9), C.rockD); r(cx + 1, cy + 3, 1, 3, C.rockD); }
    });
  }
  function bumps(x0, y0, x1, y1, horiz, rn, inward) {
    // gờ đá lồi lõm dọc mép tường
    const len = horiz ? x1 - x0 : y1 - y0;
    for (let i = 0; i < len; i += ri(rn, 7, 12)) {
      const s = ri(rn, 4, 8);
      const cx = horiz ? x0 + i : x0 + inward * 1, cy = horiz ? y0 + inward * 1 : y0 + i;
      ell(cx, cy, horiz ? s : s * 0.7, horiz ? s * 0.55 : s, C.rock);
      ell(cx - 1, cy - 1, (horiz ? s : s * 0.7) * 0.6, (horiz ? s * 0.55 : s) * 0.5, C.rockL);
    }
  }
  const Cave = {
    name: 'Hang biển', reg: 1, light: C.light,
    paintVoid(g, rn) {
      r(0, 0, g.W, g.H, C.void);
      for (let i = 0; i < (g.W * g.H) / 1500; i++) ell(rn() * g.W, rn() * g.H, ri(rn, 8, 20), ri(rn, 3, 7), '#0d1622');
    },
    floor(g, rn) {
      const w = g.fx1 - g.fx0, h = g.fy1 - g.fy0;
      U.clipRect(g.fx0, g.fy0, w, h, () => {
        r(g.fx0, g.fy0, w, h, dim(C.floor, 0.12));
        // phiến đá phẳng xếp không đều
        for (let i = 0, n = (w * h) / 170; i < n; i++) {
          const cx = g.fx0 + rn() * w, cy = g.fy0 + rn() * h, rx = ri(rn, 8, 17), ry = ri(rn, 5, 10), k = rn();
          const col = k < 0.2 ? lite(C.floor, 0.05) : k < 0.5 ? dim(C.floor, 0.06) : C.floor;
          ell(cx, cy + 1, rx, ry, dim(C.floor, 0.3)); ell(cx, cy, rx, ry, col);
          r(cx - rx * 0.5, cy - ry + 1, rx, 1, lite(col, 0.07));
        }
        for (let i = 0, n = (w * h) / 900; i < n; i++) { const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h; r(x, y, 5, 1, dim(C.floor, 0.35)); r(x + 4, y + 1, 3, 1, dim(C.floor, 0.35)); }
        for (let i = 0, n = (w * h) / 1400; i < n; i++) { const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h; r(x, y, 2, 1, C.rockL); r(x, y + 1, 2, 1, C.rockD); }
        // vũng nước
        for (let i = 0, n = Math.max(3, (w * h) / 9000); i < n; i++) {
          const cx = g.fx0 + 24 + rn() * (w - 48), cy = g.fy0 + 24 + rn() * (h - 48), rx = ri(rn, 10, 18);
          ell(cx, cy, rx, rx * 0.5, C.waterD); ell(cx, cy - 1, rx - 2, rx * 0.5 - 1, C.water);
          r(cx - rx * 0.4, cy - 2, rx * 0.5, 1, C.waterL); r(cx + 2, cy + 1, 3, 1, rgba(C.waterL, 0.5));
        }
      });
    },
    back(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2, wy = g.fy0 - g.wh;
      rockFace(x0, wy, w, g.wh, rn);
      r(x0, wy, w, 6, 'rgba(0,0,0,0.3)'); r(x0, wy + 6, w, 4, 'rgba(0,0,0,0.14)');
      r(x0, g.fy0 - 3, w, 3, C.rockD);
      // nóc hang
      r(x0, wy - g.cap, w, g.cap, C.rockD); r(x0, wy - g.cap, w, 1, mix(C.rockD, C.rockL, 0.4));
    },
    backDeco(g, rn) {
      const wy = g.fy0 - g.wh, tops = g.doors.filter((d) => d.side === 'top').map((d) => d.at);
      const near = (x, m) => tops.some((t) => Math.abs(t - x) < m);
      // nhũ đá rủ xuống
      for (let x = g.fx0 - 4; x < g.fx1 + 6; x += ri(rn, 7, 15)) {
        if (near(x, 18)) continue;
        const h = ri(rn, 6, 18), w = ri(rn, 4, 7);
        spike(x + 1, wy, w + 2, h + 1, 1, C.rockD); spike(x, wy, w, h, 1, rn() < 0.5 ? C.rockL : mix(C.rock, C.rockL, 0.6), lite(C.rockL, 0.15));
        if (rn() < 0.3) r(x, wy + h + ri(rn, 2, 7), 1, 2, C.wet);
      }
      // tinh thể mọc ở chân vách
      for (let x = g.fx0 + 22, i = 0; x < g.fx1 - 14; x += ri(rn, 34, 52), i++) {
        if (near(x, 30)) continue;
        crystal(x, g.fy0 + 1, i % 2 ? 1 : 2);
        glow(x, g.fy0 + 10, 22, 10, C.cry, 0.05, 3);
      }
      // gờ đá chân vách
      bumps(g.fx0, g.fy0, g.fx1, g.fy0, true, rn, 0);
    },
    sides(g, rn) {
      const y0 = g.fy0 - g.wh - g.cap, h = g.fy1 + g.fw - y0;
      for (const x of [g.fx0 - g.sw, g.fx1]) {
        r(x, y0, g.sw, h, C.rockD);
        for (let y = y0 + 4; y < y0 + h; y += ri(rn, 8, 13)) { ell(x + g.sw / 2, y, g.sw / 2 - 1, 4, C.rock); r(x + 3, y - 3, g.sw - 7, 1, C.rockL); }
        r(x, y0, 1, h, x < g.fx0 ? DARK : C.rockL); r(x + g.sw - 1, y0, 1, h, x < g.fx0 ? C.rockL : DARK);
      }
      r(g.fx0, g.fy0, g.fx1 - g.fx0, 3, 'rgba(0,0,0,0.34)'); r(g.fx0, g.fy0 + 3, g.fx1 - g.fx0, 2, 'rgba(0,0,0,0.16)');
      r(g.fx0, g.fy0, 2, g.fy1 - g.fy0, 'rgba(0,0,0,0.25)'); r(g.fx1 - 2, g.fy0, 2, g.fy1 - g.fy0, 'rgba(0,0,0,0.25)');
      const skip = (y) => g.doors.some((d) => (d.side === 'left' || d.side === 'right') && Math.abs(d.at - y) < 26);
      for (let y = g.fy0 + 10; y < g.fy1 - 4; y += ri(rn, 9, 15)) {
        if (skip(y)) continue;
        for (const [x, s] of [[g.fx0, 1], [g.fx1, -1]]) { const sz = ri(rn, 3, 6); ell(x + s, y, sz, sz * 0.8, C.rock); ell(x + s - 1, y - 1, sz * 0.6, sz * 0.4, C.rockL); }
      }
    },
    front(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2;
      r(x0, g.fy1, w, g.fw, C.rockD); r(x0, g.fy1, w, 1, C.rockL); r(x0, g.fy1 + g.fw - 1, w, 1, DARK);
      for (let x = x0 + 5; x < x0 + w; x += ri(rn, 9, 14)) { ell(x, g.fy1 + g.fw / 2, 5, g.fw / 2 - 2, C.rock); r(x - 3, g.fy1 + 2, 6, 1, C.rockL); }
    },
    fore(g, rn) {
      // măng đá nhô lên ở mép trước, che một phần chân nhân vật khi đứng sát mép
      const skip = (x) => g.doors.some((d) => d.side === 'bottom' && Math.abs(d.at - x) < 26);
      for (let x = g.fx0 + 4; x < g.fx1; x += ri(rn, 10, 20)) {
        if (skip(x)) continue;
        const h = ri(rn, 5, 12), w = ri(rn, 5, 8);
        spike(x + 1, g.fy1 + 3, w + 2, h + 2, -1, DARK); spike(x, g.fy1 + 3, w, h, -1, C.rock, C.rockL);
      }
      crystal(g.fx0 + 20, g.fy1 + 4, 1); crystal(g.fx1 - 30, g.fy1 + 4, 1);
    },
    door(g, d, rn) {
      const open = d.state === 'open', L = C.light, at = d.at;
      const barrier = (x, yb, s) => { crystal(x, yb, s, false); };
      if (d.side === 'top') {
        const yb = g.fy0;
        // miệng hang: vòm đá sáng màu bao quanh
        for (const [dx, w, h] of [[0, 38, 38], [0, 30, 40]]) {
          for (let i = 0; i < h; i++) { const ww = i < 10 ? Math.round(w * (0.55 + 0.045 * i)) : w; r(at - ww / 2, yb - h + i, ww, 1, C.rockL); }
        }
        for (let i = 0; i < 34; i++) { const ww = i < 9 ? Math.round(28 * (0.45 + 0.06 * i)) : 28; r(at - ww / 2, yb - 34 + i, ww, 1, '#05090e'); }
        r(at - 19, yb - 38, 1, 38, lite(C.rockL, 0.15)); r(at - 12, yb - 40, 24, 1, lite(C.rockL, 0.15));
        ell(at - 18, yb - 2, 6, 4, C.rockL); ell(at + 18, yb - 2, 6, 4, C.rockL);
        if (open) {
          for (let i = 0; i < 30; i++) { const ww = i > 24 ? 20 : 28; r(at - ww / 2, yb - 1 - i, ww, 1, rgba(L, Math.max(0, 0.9 - i * 0.03))); }
          r(at - 9, yb - 13, 18, 13, rgba('#f0ffff', 0.45));
          U.spill('top', at, g, L, 44); U.arrow(at, yb + 9, 'up', '#d8f6ff');
          // tinh thể chắn đã vỡ, còn vài mảnh dưới đất
          r(at - 12, yb - 2, 3, 2, C.cry); r(at + 9, yb - 3, 3, 3, C.cry); r(at - 5, yb + 1, 2, 2, C.cryL);
        } else {
          barrier(at - 7, yb, 1); barrier(at + 7, yb, 1); barrier(at, yb + 1, 2);
          r(at - 14, yb - 1, 28, 2, 'rgba(255,60,40,0.4)');
          U.padlock(at, yb - 10);
        }
        return null;
      }
      if (d.side === 'bottom') {
        const y = g.fy1;
        r(at - 16, y, 32, g.fw, dim(C.floor, 0.25));
        for (const x of [at - 21, at + 21]) { ell(x, y + 4, 7, 8, DARK); ell(x, y + 3, 6, 7, C.rock); ell(x - 1, y, 4, 3, C.rockL); }
        if (open) {
          r(at - 15, y, 30, g.fw, rgba(L, 0.7)); r(at - 11, y + 2, 22, g.fw - 2, rgba('#f0ffff', 0.45));
          for (let i = 0; i < g.H - y - g.fw; i++) r(at - 15, y + g.fw + i, 30, 1, rgba(L, Math.max(0, 0.5 - i * 0.09)));
          U.spill('bottom', at, g, L, 44); U.arrow(at, y - 9, 'down', '#d8f6ff');
          return null;
        }
        r(at - 15, y - 1, 30, 2, 'rgba(255,60,40,0.4)');
        return () => { barrier(at - 9, y + 9, 1); barrier(at + 9, y + 9, 1); barrier(at, y + 10, 2); U.padlock(at, y + 3); };
      }
      const lf = d.side === 'left', x = lf ? g.fx0 - g.sw : g.fx1, cx = x + (g.sw >> 1);
      r(x, at - 16, g.sw, 32, dim(C.floor, 0.25));
      for (const y of [at - 21, at + 21]) { ell(cx, y + 1, g.sw / 2 + 2, 8, DARK); ell(cx, y, g.sw / 2 + 1, 7, C.rock); ell(cx - 1, y - 3, g.sw / 2 - 2, 3, C.rockL); }
      if (open) {
        r(x, at - 15, g.sw, 30, rgba(L, 0.7)); r(x + (lf ? 0 : 2), at - 11, g.sw - 2, 22, rgba('#f0ffff', 0.45));
        for (let i = 0; i < 8; i++) r(lf ? x - 1 - i : x + g.sw + i, at - 15, 1, 30, rgba(L, Math.max(0, 0.5 - i * 0.07)));
        U.spill(d.side, at, g, L, 44); U.arrow(lf ? g.fx0 + 8 : g.fx1 - 9, at, d.side, '#d8f6ff');
        return null;
      }
      r(lf ? g.fx0 : g.fx1 - 2, at - 15, 2, 30, 'rgba(255,60,40,0.4)');
      barrier(cx, at - 4, 1); barrier(cx + (lf ? 2 : -2), at + 6, 2); barrier(cx, at + 15, 1);
      U.padlock(cx, at + 4);
      return null;
    },
  };

  // ====================================================================
  // RỪNG
  // ====================================================================
  const F = {
    void: '#0b1610', leafD: '#13291a', leafM: '#1d3d25', leafL: '#2f5f34', leafH: '#4c8a3e',
    bark: '#3b2d20', barkD: '#261c14', barkL: '#57432e', moss: '#3d6a2e', mossL: '#69994a',
    floor: '#4a4433', light: '#e4f0a0', thorn: '#8a6a44',
  };
  function leafBlob(x, y, rx, ry, rn) {
    ell(x, y + 1, rx, ry, F.leafD); ell(x, y, rx, ry - 1, F.leafM); ell(x - 1, y - 1, rx * 0.65, ry * 0.55, F.leafL);
    if (rn() < 0.6) { r(x - rx * 0.3, y - ry * 0.5, 2, 1, F.leafH); r(x + 1, y - ry * 0.3, 1, 1, F.leafH); }
  }
  function trunk(x, w, yt, yb, rn) {
    r(x - 1, yt, w + 2, yb - yt, DARK);
    r(x, yt, w, yb - yt, F.bark); r(x, yt, 3, yb - yt, F.barkL); r(x + w - 4, yt, 4, yb - yt, F.barkD);
    for (let i = 0, n = w / 4; i < n; i++) { const sx = x + 3 + Math.floor(rn() * (w - 7)), sy = yt + Math.floor(rn() * (yb - yt - 8)); r(sx, sy, 1, ri(rn, 5, 12), rn() < 0.5 ? F.barkD : F.barkL); }
    if (rn() < 0.6) { const my = yt + ri(rn, 8, yb - yt - 10); r(x, my, ri(rn, 4, 8), 2, F.moss); r(x, my, 3, 1, F.mossL); }
    // rễ xòe xuống sàn
    for (const [dx, dir] of [[-1, -1], [w, 1], [w >> 1, 0]]) {
      const len = ri(rn, 5, 10);
      for (let i = 0; i < len; i++) { const ww = Math.max(1, 5 - (i >> 1)); r(x + dx + dir * i - (dir <= 0 ? ww - 1 : 0) + (dir === 0 ? -2 : 0), yb - 3 + i * (dir === 0 ? 0.8 : 0.6), ww, 2, i < 2 ? F.bark : F.barkD); }
    }
    r(x - 2, yb - 2, w + 4, 2, F.barkD);
  }
  // Dây gai: đường gấp khúc màu nâu có gai nhọn sáng màu
  function thornVine(x0, y0, x1, y1, rn) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const t = i / n, w = Math.sin(t * 9) * 2;
      const x = x0 + (x1 - x0) * t + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? w : 0), y = y0 + (y1 - y0) * t + (Math.abs(y1 - y0) > Math.abs(x1 - x0) ? 0 : w);
      r(x - 1, y - 1, 4, 4, DARK);
    }
    for (let i = 0; i <= n; i++) {
      const t = i / n, w = Math.sin(t * 9) * 2;
      const vert = Math.abs(y1 - y0) > Math.abs(x1 - x0);
      const x = x0 + (x1 - x0) * t + (vert ? w : 0), y = y0 + (y1 - y0) * t + (vert ? 0 : w);
      r(x, y, 2, 2, '#5a3f26'); r(x, y, 1, 1, F.thorn);
      if (i % 4 === 0) { const s = (i / 4) % 2 ? 1 : -1; if (vert) { r(x + s * 2, y, 2, 1, '#d8c090'); r(x + s * 3, y - 1, 1, 1, '#d8c090'); } else { r(x, y + s * 2, 1, 2, '#d8c090'); r(x + 1, y + s * 3, 1, 1, '#d8c090'); } }
    }
  }
  const Forest = {
    name: 'Rừng già', reg: 0, light: F.light,
    paintVoid(g, rn) {
      r(0, 0, g.W, g.H, F.void);
      for (let i = 0; i < (g.W * g.H) / 900; i++) ell(rn() * g.W, rn() * g.H, ri(rn, 8, 18), ri(rn, 4, 8), rn() < 0.5 ? '#0e1c13' : '#0d1911');
    },
    floor(g, rn) {
      const w = g.fx1 - g.fx0, h = g.fy1 - g.fy0, cx = (g.fx0 + g.fx1) / 2, cy = (g.fy0 + g.fy1) / 2;
      U.clipRect(g.fx0, g.fy0, w, h, () => {
        r(g.fx0, g.fy0, w, h, F.floor);
        for (let i = 0, n = (w * h) / 260; i < n; i++) {
          const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h, k = rn();
          ell(x, y, ri(rn, 6, 16), ri(rn, 3, 7), k < 0.4 ? dim(F.floor, 0.1) : k < 0.7 ? lite(F.floor, 0.05) : mix(F.floor, '#5a4a30', 0.4));
        }
        // lối mòn nối các cửa
        for (const d of g.doors) {
          const tx = d.side === 'left' ? g.fx0 : d.side === 'right' ? g.fx1 : d.at, ty = d.side === 'top' ? g.fy0 : d.side === 'bottom' ? g.fy1 : d.at;
          for (let t = 0; t <= 1; t += 0.03) ell(cx + (tx - cx) * t + Math.sin(t * 7) * 3, cy + (ty - cy) * t + Math.cos(t * 6) * 3, 9, 6, mix(F.floor, '#6a5a3c', 0.5));
        }
        ell(cx, cy, 26, 18, mix(F.floor, '#6a5a3c', 0.5));
        for (let i = 0, n = (w * h) / 500; i < n; i++) { const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h; r(x, y, 2, 1, dim(F.floor, 0.3)); if (rn() < 0.4) r(x + 3, y + 1, 1, 1, lite(F.floor, 0.2)); }
        // cỏ: dày ở sát tường, thưa dần vào giữa
        for (let i = 0, n = (w * h) / 60; i < n; i++) {
          const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h;
          const edge = Math.min(x - g.fx0, g.fx1 - x, y - g.fy0, g.fy1 - y);
          if (rn() * 46 < edge) continue;
          const col = rn() < 0.5 ? F.moss : F.leafL;
          r(x, y, 1, 3, col); r(x + 2, y + 1, 1, 2, col); r(x - 2, y + 1, 1, 2, rn() < 0.4 ? F.mossL : col);
        }
        // lá rụng, hoa dại
        for (let i = 0, n = (w * h) / 1500; i < n; i++) { const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h; r(x, y, 3, 2, rn() < 0.5 ? '#8a6a2e' : '#a04a26'); r(x + 1, y, 1, 1, '#c8963a'); }
        for (let i = 0, n = (w * h) / 2600; i < n; i++) { const x = g.fx0 + rn() * w, y = g.fy0 + rn() * h; r(x, y + 1, 1, 3, F.moss); r(x - 1, y, 3, 1, '#f0e8c0'); r(x, y - 1, 1, 3, '#f0e8c0'); r(x, y, 1, 1, '#f0b040'); }
      });
    },
    back(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2, wy = g.fy0 - g.wh;
      // khe tối giữa các thân cây, có lá phía sau
      r(x0, wy, w, g.wh, '#07100b');
      for (let x = x0; x < x0 + w; x += 9) leafBlob(x + rn() * 6, wy + 8 + rn() * (g.wh - 14), ri(rn, 6, 9), ri(rn, 4, 6), rn);
      r(x0, wy, w, g.wh, 'rgba(4,10,6,0.55)');
      // thân cây khổng lồ: cây chứa cửa trước, rồi lấp đầy phần còn lại
      const tops = g.doors.filter((d) => d.side === 'top').map((d) => d.at).sort((a, b) => a - b);
      const spans = [];
      let px = x0;
      for (const t of tops) { spans.push([px, t - 30]); px = t + 30; }
      spans.push([px, x0 + w]);
      for (const [a, b] of spans) {
        let x = a + 1;
        while (x < b - 8) {
          let tw = ri(rn, 24, 38);
          if (x + tw > b - 3) tw = b - 3 - x;
          if (tw < 10) break;
          trunk(x, tw, wy, g.fy0, rn);
          x += tw + ri(rn, 3, 7);
        }
      }
      for (const t of tops) trunk(t - 27, 54, wy, g.fy0, rn);
      r(x0, wy, w, 5, 'rgba(0,0,0,0.3)'); r(x0, wy + 5, w, 4, 'rgba(0,0,0,0.14)');
    },
    backDeco(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2, wy = g.fy0 - g.wh;
      const tops = g.doors.filter((d) => d.side === 'top').map((d) => d.at);
      // tán lá phủ nóc
      r(x0, wy - g.cap, w, g.cap, F.leafD);
      for (let x = x0; x < x0 + w; x += 8) leafBlob(x + rn() * 5, wy - g.cap / 2 + rn() * 5, ri(rn, 7, 11), ri(rn, 5, 7), rn);
      // dây leo rủ
      for (let x = g.fx0 + 6; x < g.fx1; x += ri(rn, 16, 30)) {
        if (tops.some((t) => Math.abs(t - x) < 18)) continue;
        const len = ri(rn, 8, 22);
        for (let i = 0; i < len; i++) { r(x + Math.round(Math.sin(i * 0.7)), wy + 4 + i, 1, 1, F.moss); if (i % 4 === 2) r(x + Math.round(Math.sin(i * 0.7)) + 1, wy + 4 + i, 2, 1, F.leafH); }
      }
      // nấm phát sáng ở gốc cây, đom đóm
      for (let x = g.fx0 + 18; x < g.fx1 - 10; x += ri(rn, 36, 60)) {
        if (tops.some((t) => Math.abs(t - x) < 34)) continue;
        glow(x, g.fy0 + 1, 12, 7, '#b0f070', 0.07, 3);
        r(x - 1, g.fy0 - 1, 2, 4, '#e8e0c0'); r(x - 3, g.fy0 - 4, 6, 3, '#9ad860'); r(x - 2, g.fy0 - 5, 4, 1, '#d0f8a0');
        r(x + 5, g.fy0 + 1, 1, 2, '#e8e0c0'); r(x + 4, g.fy0 - 1, 3, 2, '#9ad860');
      }
      for (let i = 0; i < (g.fx1 - g.fx0) / 26; i++) { const x = g.fx0 + rn() * (g.fx1 - g.fx0), y = wy + 6 + rn() * (g.wh + 30); glow(x, y, 3, 3, '#e4f0a0', 0.12, 2); r(x, y, 1, 1, '#f8ffd0'); }
    },
    sides(g, rn) {
      const y0 = g.fy0 - g.wh - g.cap, h = g.fy1 + g.fw - y0;
      r(g.fx0, g.fy0, g.fx1 - g.fx0, 3, 'rgba(0,0,0,0.3)'); r(g.fx0, g.fy0 + 3, g.fx1 - g.fx0, 2, 'rgba(0,0,0,0.14)');
      r(g.fx0, g.fy0, 3, g.fy1 - g.fy0, 'rgba(0,0,0,0.22)'); r(g.fx1 - 3, g.fy0, 3, g.fy1 - g.fy0, 'rgba(0,0,0,0.22)');
      for (const x of [g.fx0 - g.sw, g.fx1]) {
        r(x, y0, g.sw, h, F.leafD);
        const skip = (y) => g.doors.some((d) => (d.side === (x < g.fx0 ? 'left' : 'right')) && Math.abs(d.at - y) < 17);
        // hàng rào gai: bụi lá dày, dây gai chạy dọc
        for (let y = y0 + 3; y < y0 + h; y += 6) { if (skip(y)) continue; leafBlob(x + g.sw / 2 + (rn() * 4 - 2), y, g.sw / 2 + 2, 5, rn); }
        for (const d of [{ a: g.fy0 - g.wh, b: -1 }]) void d;
        const segs = [[y0 + 4, y0 + h - 4]];
        for (const dd of g.doors) if (dd.side === (x < g.fx0 ? 'left' : 'right')) { const s = segs.pop(); segs.push([s[0], dd.at - 20], [dd.at + 20, s[1]]); }
        for (const [a, b] of segs) if (b - a > 10) thornVine(x + g.sw / 2 - 1, a, x + g.sw / 2 - 1, b, rn);
      }
    },
    front(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2;
      r(x0, g.fy1, w, g.fw, F.leafD);
      const skip = (x) => g.doors.some((d) => d.side === 'bottom' && Math.abs(d.at - x) < 17);
      for (let x = x0 + 3; x < x0 + w; x += 6) { if (skip(x)) continue; leafBlob(x + rn() * 3, g.fy1 + g.fw / 2 + 1, 6, g.fw / 2, rn); }
      const segs = [[x0 + 4, x0 + w - 4]];
      for (const dd of g.doors) if (dd.side === 'bottom') { const s = segs.pop(); segs.push([s[0], dd.at - 20], [dd.at + 20, s[1]]); }
      for (const [a, b] of segs) if (b - a > 10) thornVine(a, g.fy1 + g.fw / 2, b, g.fy1 + g.fw / 2, rn);
    },
    fore(g, rn) {
      // cỏ cao ở mép trước
      const skip = (x) => g.doors.some((d) => d.side === 'bottom' && Math.abs(d.at - x) < 17);
      for (let x = g.fx0; x < g.fx1; x += ri(rn, 3, 6)) { if (skip(x)) continue; const h = ri(rn, 3, 7); r(x, g.fy1 - h + 2, 1, h, rn() < 0.5 ? F.leafL : F.moss); if (rn() < 0.3) r(x, g.fy1 - h + 2, 1, 1, F.leafH); }
    },
    door(g, d, rn) {
      const open = d.state === 'open', L = F.light, at = d.at;
      const stump = (x, y) => { r(x - 5, y - 9, 10, 13, DARK); r(x - 4, y - 5, 8, 8, F.bark); r(x - 4, y - 5, 2, 8, F.barkL); r(x - 4, y - 8, 8, 3, '#8a6a44'); r(x - 2, y - 7, 4, 1, '#5a3f26'); };
      if (d.side === 'top') {
        const yb = g.fy0;
        // hốc cây: cửa vòm khoét vào thân cây khổng lồ
        for (let i = 0; i < 36; i++) { const ww = i < 10 ? Math.round(32 * (0.5 + 0.05 * i)) : 32; r(at - ww / 2, yb - 36 + i, ww, 1, F.barkL); }
        for (let i = 0; i < 33; i++) { const ww = i < 9 ? Math.round(26 * (0.45 + 0.06 * i)) : 26; r(at - ww / 2, yb - 33 + i, ww, 1, '#060c08'); }
        r(at - 16, yb - 26, 1, 26, lite(F.barkL, 0.2));
        r(at - 10, yb - 39, 8, 3, F.moss); r(at - 8, yb - 40, 4, 1, F.mossL); r(at + 5, yb - 38, 6, 2, F.moss);
        if (open) {
          for (let i = 0; i < 30; i++) { const ww = i > 24 ? 18 : 26; r(at - ww / 2, yb - 1 - i, ww, 1, rgba(L, Math.max(0, 0.9 - i * 0.03))); }
          r(at - 8, yb - 13, 16, 13, rgba('#fffff0', 0.45));
          U.spill('top', at, g, L, 44); U.arrow(at, yb + 9, 'up', '#f4ffb0');
          r(at - 13, yb - 30, 2, 9, '#5a3f26'); r(at + 11, yb - 28, 2, 7, '#5a3f26'); r(at - 13, yb - 22, 2, 1, '#d8c090');
        } else {
          thornVine(at - 12, yb - 28, at + 11, yb - 3, rn); thornVine(at + 11, yb - 28, at - 12, yb - 3, rn); thornVine(at - 13, yb - 15, at + 12, yb - 15, rn);
          r(at - 13, yb - 1, 26, 2, 'rgba(255,60,40,0.4)');
          U.padlock(at, yb - 12);
        }
        return null;
      }
      if (d.side === 'bottom') {
        const y = g.fy1;
        r(at - 16, y, 32, g.fw, mix(F.floor, '#6a5a3c', 0.4));
        stump(at - 20, y + 8); stump(at + 20, y + 8);
        if (open) {
          r(at - 15, y, 30, g.fw, rgba(L, 0.6)); r(at - 11, y + 2, 22, g.fw - 2, rgba('#fffff0', 0.4));
          for (let i = 0; i < g.H - y - g.fw; i++) r(at - 15, y + g.fw + i, 30, 1, rgba(L, Math.max(0, 0.45 - i * 0.08)));
          U.spill('bottom', at, g, L, 44); U.arrow(at, y - 9, 'down', '#f4ffb0');
          return null;
        }
        r(at - 15, y - 1, 30, 2, 'rgba(255,60,40,0.4)');
        return () => { thornVine(at - 15, y - 4, at + 14, y + 8, rn); thornVine(at - 15, y + 8, at + 14, y - 4, rn); thornVine(at - 16, y + 2, at + 15, y + 2, rn); U.padlock(at, y + 4); };
      }
      const lf = d.side === 'left', x = lf ? g.fx0 - g.sw : g.fx1, cx = x + (g.sw >> 1);
      r(x, at - 16, g.sw, 32, mix(F.floor, '#6a5a3c', 0.4));
      stump(cx, at - 19); stump(cx, at + 24);
      if (open) {
        r(x, at - 14, g.sw, 30, rgba(L, 0.6)); r(x + (lf ? 0 : 2), at - 10, g.sw - 2, 22, rgba('#fffff0', 0.4));
        for (let i = 0; i < 8; i++) r(lf ? x - 1 - i : x + g.sw + i, at - 14, 1, 30, rgba(L, Math.max(0, 0.45 - i * 0.06)));
        U.spill(d.side, at, g, L, 44); U.arrow(lf ? g.fx0 + 8 : g.fx1 - 9, at, d.side, '#f4ffb0');
        return null;
      }
      r(lf ? g.fx0 : g.fx1 - 2, at - 14, 2, 30, 'rgba(255,60,40,0.4)');
      thornVine(x + 1, at - 13, x + g.sw - 3, at + 15, rn); thornVine(x + g.sw - 3, at - 13, x + 1, at + 15, rn); thornVine(cx - 1, at - 14, cx - 1, at + 16, rn);
      U.padlock(cx, at + 3);
      return null;
    },
  };

  M.themes.cave = Cave;
  M.themes.forest = Forest;
})();
