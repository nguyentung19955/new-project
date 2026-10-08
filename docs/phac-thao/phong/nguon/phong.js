// Phác thảo các kiểu phòng cho game Linh Khí.
// File này được nạp vào trang game thật (game/index.html) bằng Playwright, KHÔNG phải mã game.
// Nó mượn hình thật của game (hero, quái, đồ vật, hiệu ứng) và tự vẽ phần kiến trúc phòng mới.
(function () {
  const G = window.G, A = G.art;
  const M = (window.Mock = {});
  const DARK = '#140d0e';

  // ---------- tiện ích ----------
  function mk(w, h) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const x = cv.getContext('2d');
    x.imageSmoothingEnabled = false;
    return x;
  }
  let c = null; // canvas đang vẽ
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, k) {
    const x = hex(a), y = hex(b);
    return '#' + [0, 1, 2].map((i) => Math.round(x[i] + (y[i] - x[i]) * k).toString(16).padStart(2, '0')).join('');
  }
  const dim = (a, k) => mix(a, '#000000', k);
  const lite = (a, k) => mix(a, '#ffffff', k);
  const rgba = (h, a) => { const v = hex(h); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; };
  const ell = (x, y, rx, ry, col) => A.ellipse(c, x, y, rx, ry, col);
  function glow(x, y, rx, ry, col, a, n) {
    n = n || 4;
    for (let i = 0; i < n; i++) ell(x, y, rx * (1 - i / n), ry * (1 - i / n), rgba(col, a));
  }
  function clipRect(x, y, w, h, fn) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); }
  function bricks(x, y, w, h, bw, bh, cols, joint, rn) {
    clipRect(x, y, w, h, () => {
      r(x, y, w, h, joint);
      for (let j = 0, yy = y; yy < y + h; yy += bh, j++) {
        for (let xx = x - (j % 2 ? bw >> 1 : 0); xx < x + w; xx += bw) {
          const col = cols[Math.floor(rn() * cols.length)];
          r(xx, yy, bw - 1, bh - 1, col);
          if (rn() < 0.3) r(xx, yy, bw - 1, 1, lite(col, 0.06));
        }
      }
    });
  }
  // Ổ khóa đỏ: dấu hiệu cửa đang khóa.
  function padlock(x, y) {
    r(x - 6, y - 5, 12, 10, DARK); r(x - 4, y - 10, 8, 6, DARK);
    r(x - 3, y - 9, 6, 1, '#d8d8e0'); r(x - 3, y - 9, 1, 4, '#d8d8e0'); r(x + 2, y - 9, 1, 4, '#d8d8e0');
    r(x - 5, y - 4, 10, 8, '#c8352a'); r(x - 5, y - 4, 10, 1, '#ff8a6a'); r(x - 5, y + 3, 10, 1, '#8a2018');
    r(x - 1, y - 2, 2, 2, '#2a0c0a'); r(x - 1, y, 2, 2, '#2a0c0a');
  }
  // Mũi tên vàng chỉ lối ra khi cửa mở. d: 'up' 'down' 'left' 'right'
  function arrow(x, y, d, col) {
    col = col || '#ffe08a';
    const dk = 'rgba(40,20,0,0.55)';
    for (const [ox, oy, cc] of [[1, 1, dk], [0, 0, col]]) {
      for (let i = 0; i < 5; i++) {
        if (d === 'up') r(x - i + ox, y + i + oy, 2 * i + 1, 2, cc);
        if (d === 'down') r(x - i + ox, y - i + oy, 2 * i + 1, 2, cc);
        if (d === 'left') r(x + i + ox, y - i + oy, 2, 2 * i + 1, cc);
        if (d === 'right') r(x - i + ox, y - i + oy, 2, 2 * i + 1, cc);
      }
    }
  }
  // Vệt sáng tràn từ cửa vào sàn. Hình thang, sáng dần về phía cửa.
  function spill(side, at, g, col, len, hw) {
    len = len || 40; hw = hw || 13;
    for (let i = 0; i < len; i++) {
      const a = 0.42 * Math.pow(1 - i / len, 1.3), w = hw + i * 0.4;
      const al = Math.round(a * 12) / 12;
      if (al <= 0) continue;
      if (side === 'top') r(at - w, g.fy0 + i, w * 2, 1, rgba(col, al));
      if (side === 'bottom') r(at - w, g.fy1 - 1 - i, w * 2, 1, rgba(col, al));
      if (side === 'left') r(g.fx0 + i, at - w, 1, w * 2, rgba(col, al));
      if (side === 'right') r(g.fx1 - 1 - i, at - w, 1, w * 2, rgba(col, al));
    }
  }

  // ====================================================================
  // CHỦ ĐỀ LÂU ĐÀI
  // ====================================================================
  const K = {
    void: '#120c0c', brick: '#4b3f3f', brickD: '#342a2b', brickL: '#5f504c', stone: '#6e5f58', stoneL: '#8a7a6e',
    wood: '#4a3020', woodD: '#2e1c12', woodL: '#6a4830', iron: '#55555e', ironL: '#8a8a96',
    red: '#7a2a2a', redD: '#4e1c20', gold: '#c89a3a', floor: '#544b49', light: '#ffc878', cap: '#3a3031', capL: '#4c4041', capD: '#2a2223',
  };
  function torch(x, y, g) {
    glow(x, y - 4, 26, 20, '#ff9a40', 0.07, 4);
    r(x - 1, y, 2, 9, K.iron); r(x - 3, y, 6, 2, K.ironL); r(x - 2, y + 2, 4, 1, K.iron);
    r(x - 2, y - 5, 4, 5, '#ff7a2a'); r(x - 1, y - 8, 2, 4, '#ff7a2a'); r(x - 1, y - 4, 2, 4, '#ffd23f'); r(x, y - 6, 1, 2, '#ffd23f'); r(x, y - 2, 1, 2, '#fff3b0');
    r(x + 1, y - 10, 1, 1, '#ffd23f');
    // quầng sáng ấm hắt xuống sàn
    if (g) glow(x, g.fy0 + 12, 30, 16, '#ff9a40', 0.045, 4);
  }
  function banner(x, y, col, colD) {
    r(x - 8, y - 1, 16, 2, K.gold);
    r(x - 7, y + 1, 14, 22, col); r(x - 7, y + 1, 2, 22, colD); r(x + 5, y + 1, 2, 22, colD);
    r(x - 7, y + 23, 4, 3, col); r(x + 3, y + 23, 4, 3, col); r(x - 2, y + 23, 4, 1, col);
    r(x - 1, y + 6, 2, 10, K.gold); r(x - 4, y + 9, 8, 2, K.gold);
    r(x - 7, y + 19, 14, 1, K.gold);
  }
  const Castle = {
    name: 'Lâu đài cổ', reg: 2, light: '#ffc878',
    paintVoid(g) {
      r(0, 0, g.W, g.H, K.void);
      for (let y = 0, j = 0; y < g.H; y += 9, j++) for (let x = -(j % 2) * 11; x < g.W; x += 22) r(x, y, 21, 8, '#150e0e');
    },
    floor(g, rn) {
      const w = g.fx1 - g.fx0, h = g.fy1 - g.fy0, ts = 16;
      clipRect(g.fx0, g.fy0, w, h, () => {
        r(g.fx0, g.fy0, w, h, dim(K.floor, 0.3));
        for (let y = g.fy0, j = 0; y < g.fy1; y += ts, j++) {
          for (let x = g.fx0 - (j % 2 ? ts / 2 : 0); x < g.fx1; x += ts) {
            const k = rn();
            const col = k < 0.14 ? lite(K.floor, 0.05) : k < 0.34 ? dim(K.floor, 0.09) : k < 0.42 ? mix(K.floor, '#6b4a38', 0.25) : K.floor;
            r(x, y, ts - 1, ts - 1, col);
            r(x, y, ts - 1, 1, lite(col, 0.07));
            if (rn() < 0.16) { const cx = x + 3 + Math.floor(rn() * 6), cy = y + 4 + Math.floor(rn() * 7); r(cx, cy, 5, 1, dim(col, 0.3)); r(cx + 4, cy + 1, 3, 1, dim(col, 0.3)); r(cx + 2, cy - 1, 1, 1, dim(col, 0.3)); }
            if (rn() < 0.05) r(x + 5, y + 6, 2, 2, dim(col, 0.22));
          }
        }
      });
    },
    carpet(g) {
      // thảm ngắn dẫn vào từng cửa và một hoa văn tròn giữa phòng: nhìn là biết phòng có bốn lối
      const cc = '#4e2a32', ed = '#77593a', L = Math.min(46, (g.fy1 - g.fy0) * 0.24);
      const cx = (g.fx0 + g.fx1) >> 1, cy = (g.fy0 + g.fy1) >> 1;
      for (const d of g.doors) {
        if (d.side === 'top' || d.side === 'bottom') {
          const y0 = d.side === 'top' ? g.fy0 : g.fy1 - L;
          r(d.at - 11, y0, 22, L, cc); r(d.at - 9, y0, 1, L, ed); r(d.at + 8, y0, 1, L, ed);
          const ye = d.side === 'top' ? g.fy0 + L : g.fy1 - L - 2;
          for (let x = d.at - 11; x < d.at + 11; x += 3) r(x, ye, 2, 2, ed);
        } else {
          const x0 = d.side === 'left' ? g.fx0 : g.fx1 - L;
          r(x0, d.at - 11, L, 22, cc); r(x0, d.at - 9, L, 1, ed); r(x0, d.at + 8, L, 1, ed);
          const xe = d.side === 'left' ? g.fx0 + L : g.fx1 - L - 2;
          for (let y = d.at - 11; y < d.at + 11; y += 3) r(xe, y, 2, 2, ed);
        }
      }
      // hoa văn tròn
      const R1 = 30;
      for (let dy = -R1; dy <= R1; dy++) {
        const hw = Math.round(Math.sqrt(R1 * R1 - dy * dy));
        r(cx - hw, cy + dy, hw * 2, 1, dim(K.floor, 0.2));
      }
      for (let dy = -R1 + 2; dy <= R1 - 2; dy++) {
        const hw = Math.round(Math.sqrt((R1 - 2) * (R1 - 2) - dy * dy));
        r(cx - hw, cy + dy, hw * 2, 1, lite(K.floor, 0.07));
      }
      for (let dy = -R1 + 6; dy <= R1 - 6; dy++) {
        const hw = Math.round(Math.sqrt((R1 - 6) * (R1 - 6) - dy * dy));
        r(cx - hw, cy + dy, hw * 2, 1, K.floor);
      }
      r(cx - 1, cy - 14, 2, 28, mix(K.floor, K.gold, 0.35)); r(cx - 14, cy - 1, 28, 2, mix(K.floor, K.gold, 0.35));
      r(cx - 4, cy - 4, 8, 8, mix(K.floor, K.red, 0.5)); r(cx - 2, cy - 2, 4, 4, mix(K.floor, K.gold, 0.5));
    },
    back(g, rn) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2, wy = g.fy0 - g.wh;
      bricks(x0, wy, w, g.wh, 16, 8, [K.brick, K.brick, K.brick, K.brick, K.brickD, K.brickD, K.brickL], dim(K.brickD, 0.25), rn);
      r(x0, wy, w, 5, 'rgba(0,0,0,0.22)'); r(x0, wy + 5, w, 3, 'rgba(0,0,0,0.1)');
      // chân tường
      r(x0, g.fy0 - 6, w, 6, dim(K.stone, 0.22)); r(x0, g.fy0 - 6, w, 1, K.stoneL); r(x0, g.fy0 - 1, w, 1, dim(K.stone, 0.5));
      for (let x = x0 + 9; x < x0 + w; x += 18) r(x, g.fy0 - 5, 1, 4, dim(K.stone, 0.45));
      // nóc tường
      r(x0, wy - g.cap, w, g.cap, K.cap); r(x0, wy - g.cap, w, 1, K.capL); r(x0, wy - 1, w, 1, DARK);
      for (let x = x0 + 7; x < x0 + w; x += 14) r(x, wy - g.cap + 1, 1, g.cap - 2, K.capD);
    },
    backDeco(g, rn) {
      const wy = g.fy0 - g.wh, tops = g.doors.filter((d) => d.side === 'top').map((d) => d.at);
      const near = (x, m) => tops.some((t) => Math.abs(t - x) < m);
      // cột đá
      const cols = [g.fx0 + 3, g.fx1 - 11];
      for (let x = g.fx0 + 3 + 98; x < g.fx1 - 60; x += 98) if (!near(x + 4, 40)) cols.push(x);
      for (const x of cols) {
        r(x, wy, 8, g.wh, K.stone); r(x, wy, 2, g.wh, K.stoneL); r(x + 6, wy, 2, g.wh, dim(K.stone, 0.3));
        r(x - 2, wy, 12, 3, K.stoneL); r(x - 2, wy + 3, 12, 1, dim(K.stone, 0.4)); r(x - 2, g.fy0 - 4, 12, 4, K.stone); r(x - 2, g.fy0 - 4, 12, 1, K.stoneL);
      }
      // đuốc hai bên mỗi cửa, cờ xa hơn
      for (const t of tops) {
        torch(t - 30, wy + 16, g); torch(t + 30, wy + 16, g);
        if (t - 62 > g.fx0 + 16) banner(t - 62, wy + 6, K.red, K.redD);
        if (t + 62 < g.fx1 - 16) banner(t + 62, wy + 6, K.red, K.redD);
      }
      // phòng rộng: rải thêm đuốc, cờ, cửa sổ
      for (let x = g.fx0 + 52, i = 0; x < g.fx1 - 40; x += 49, i++) {
        if (near(x, 82) || cols.some((cx) => Math.abs(cx + 4 - x) < 16)) continue;
        if (i % 3 === 0) torch(x, wy + 16, g);
        else if (i % 3 === 1) banner(x, wy + 6, '#3a4a6a', '#263248');
        else { r(x - 6, wy + 8, 12, 20, DARK); r(x - 5, wy + 9, 10, 18, '#a8502a'); r(x - 5, wy + 9, 10, 6, '#d8823a'); r(x - 1, wy + 9, 1, 18, DARK); r(x - 5, wy + 17, 10, 1, DARK); r(x - 6, wy + 7, 12, 1, K.stoneL); }
      }
    },
    sides(g) {
      const y0 = g.fy0 - g.wh - g.cap, h = g.fy1 + g.fw - y0;
      for (const x of [g.fx0 - g.sw, g.fx1]) {
        r(x, y0, g.sw, h, K.cap);
        for (let y = y0 + 6; y < y0 + h; y += 12) r(x + 1, y, g.sw - 2, 1, K.capD);
        r(x, y0, 1, h, x < g.fx0 ? DARK : K.capL); r(x + g.sw - 1, y0, 1, h, x < g.fx0 ? K.capL : DARK);
        r(x + (x < g.fx0 ? 1 : g.sw - 2), y0, 1, h, x < g.fx0 ? K.capD : K.capD);
      }
      // bóng tường đổ xuống sàn
      r(g.fx0, g.fy0, g.fx1 - g.fx0, 3, 'rgba(0,0,0,0.34)'); r(g.fx0, g.fy0 + 3, g.fx1 - g.fx0, 2, 'rgba(0,0,0,0.16)');
      r(g.fx0, g.fy0, 2, g.fy1 - g.fy0, 'rgba(0,0,0,0.25)'); r(g.fx1 - 2, g.fy0, 2, g.fy1 - g.fy0, 'rgba(0,0,0,0.25)');
      r(g.fx0, g.fy1 - 2, g.fx1 - g.fx0, 2, 'rgba(0,0,0,0.2)');
    },
    front(g) {
      const x0 = g.fx0 - g.sw, w = g.fx1 - g.fx0 + g.sw * 2;
      r(x0, g.fy1, w, g.fw, K.cap); r(x0, g.fy1, w, 1, K.capL); r(x0, g.fy1 + g.fw - 3, w, 3, '#241c1d'); r(x0, g.fy1 + g.fw - 1, w, 1, DARK);
      for (let x = x0 + 7; x < x0 + w; x += 14) r(x, g.fy1 + 1, 1, g.fw - 4, K.capD);
    },
    // Cửa. Trả về hàm vẽ lớp phía trước (che lên nhân vật) nếu có.
    door(g, d) {
      const open = d.state === 'open', L = K.light, at = d.at;
      if (d.side === 'top') {
        const yb = g.fy0;
        // khung vòm đá
        r(at - 20, yb - 34, 40, 34, K.stone); r(at - 18, yb - 37, 36, 3, K.stone); r(at - 14, yb - 39, 28, 2, K.stone);
        r(at - 20, yb - 34, 2, 34, K.stoneL); r(at - 18, yb - 37, 36, 1, K.stoneL); r(at - 14, yb - 39, 28, 1, K.stoneL); r(at + 18, yb - 34, 2, 34, dim(K.stone, 0.3));
        for (let y = yb - 28; y < yb; y += 9) { r(at - 20, y, 6, 1, dim(K.stone, 0.4)); r(at + 14, y, 6, 1, dim(K.stone, 0.4)); }
        // lòng cửa
        r(at - 14, yb - 29, 28, 29, '#0c0808'); r(at - 12, yb - 32, 24, 3, '#0c0808'); r(at - 9, yb - 34, 18, 2, '#0c0808');
        if (open) {
          for (let i = 0; i < 29; i++) r(at - 14, yb - 1 - i, 28, 1, rgba(L, Math.max(0, 0.95 - i * 0.03)));
          r(at - 12, yb - 32, 24, 3, rgba(L, 0.12));
          r(at - 9, yb - 12, 18, 12, rgba('#fff3d0', 0.5)); r(at - 6, yb - 20, 12, 8, rgba('#fff3d0', 0.25));
          // song sắt đã kéo lên, chỉ còn mũi nhọn ló ra
          for (let x = at - 12; x <= at + 10; x += 5) { r(x, yb - 34, 2, 6, K.iron); r(x, yb - 28, 2, 1, K.ironL); }
          spill('top', at, g, L, 44);
          arrow(at, yb + 9, 'up');
          r(at - 3, yb - 45, 6, 6, DARK); r(at - 2, yb - 44, 4, 4, '#8fe06a'); r(at - 2, yb - 44, 2, 1, '#e0ffc8');
        } else {
          r(at - 14, yb - 29, 28, 29, '#1a1214');
          for (let x = at - 12; x <= at + 10; x += 5) { r(x, yb - 33, 2, 33, K.iron); r(x, yb - 33, 1, 33, K.ironL); }
          r(at - 14, yb - 23, 28, 2, K.iron); r(at - 14, yb - 23, 28, 1, K.ironL); r(at - 14, yb - 10, 28, 2, K.iron); r(at - 14, yb - 10, 28, 1, K.ironL);
          r(at - 14, yb - 1, 28, 2, 'rgba(255,60,40,0.45)');
          r(at - 3, yb - 45, 6, 6, DARK); r(at - 2, yb - 44, 4, 4, '#e03a2a'); r(at - 2, yb - 44, 2, 1, '#ffb09a');
          padlock(at, yb - 14);
        }
        return null;
      }
      if (d.side === 'bottom') {
        const y = g.fy1;
        r(at - 16, y, 32, g.fw, dim(K.floor, 0.22)); r(at - 16, y, 32, 1, dim(K.floor, 0.05));
        for (const x of [at - 22, at + 16]) { r(x, y - 4, 6, g.fw + 4, K.stone); r(x, y - 4, 6, 1, K.stoneL); r(x, y - 4, 1, g.fw + 4, K.stoneL); r(x + 5, y - 4, 1, g.fw + 4, dim(K.stone, 0.35)); }
        if (open) {
          r(at - 16, y, 32, g.fw, rgba(L, 0.75)); r(at - 12, y + 2, 24, g.fw - 2, rgba('#fff3d0', 0.5));
          for (let i = 0; i < g.H - y - g.fw; i++) r(at - 16, y + g.fw + i, 32, 1, rgba(L, Math.max(0, 0.5 - i * 0.09)));
          spill('bottom', at, g, L, 44);
          arrow(at, y - 9, 'down');
          return () => { for (let x = at - 14; x <= at + 12; x += 6) { r(x, y + g.fw - 3, 3, 2, K.iron); r(x, y + g.fw - 3, 3, 1, K.ironL); } };
        }
        r(at - 16, y - 1, 32, 2, 'rgba(255,60,40,0.45)');
        return () => {
          for (let x = at - 14; x <= at + 12; x += 6) {
            r(x - 1, y - 12, 5, g.fw + 10, DARK); r(x, y - 11, 3, g.fw + 8, K.iron); r(x, y - 11, 1, g.fw + 8, K.ironL);
            r(x, y - 14, 3, 3, K.ironL); r(x + 1, y - 16, 1, 2, '#d0d0dc');
          }
          r(at - 16, y - 4, 32, 2, K.iron); r(at - 16, y - 4, 32, 1, K.ironL);
          padlock(at, y + 2);
        };
      }
      // cửa trái, phải
      const lf = d.side === 'left', x = lf ? g.fx0 - g.sw : g.fx1, cx = x + (g.sw >> 1);
      r(x, at - 16, g.sw, 32, dim(K.floor, 0.22));
      for (const y of [at - 22, at + 16]) {
        r(x - 1, y - 6, g.sw + 2, 12, DARK);
        r(x, y - 5, g.sw, 4, K.stoneL); r(x, y - 1, g.sw, 6, K.stone); r(x, y + 4, g.sw, 1, dim(K.stone, 0.4)); r(x, y - 5, g.sw, 1, lite(K.stoneL, 0.15));
      }
      if (open) {
        r(x, at - 16, g.sw, 32, rgba(L, 0.75)); r(x + (lf ? 0 : 2), at - 12, g.sw - 2, 24, rgba('#fff3d0', 0.5));
        for (let i = 0; i < 8; i++) r(lf ? x - 1 - i : x + g.sw + i, at - 16, 1, 32, rgba(L, Math.max(0, 0.5 - i * 0.07)));
        spill(d.side, at, g, L, 44);
        arrow(lf ? g.fx0 + 8 : g.fx1 - 9, at, d.side);
        for (let y = at - 12; y <= at + 12; y += 6) { r(cx - 2, y + 2, 4, 2, K.iron); r(cx - 2, y + 2, 4, 1, K.ironL); }
        return null;
      }
      r(lf ? g.fx0 : g.fx1 - 2, at - 16, 2, 32, 'rgba(255,60,40,0.45)');
      // song sắt chắn ngang lối: thanh ngang có mũi nhọn chĩa vào phòng, hai thanh dọc giữ
      const xa = lf ? x + 1 : x - 5, wl = g.sw + 4;
      r(x, at - 16, g.sw, 32, '#1a1214');
      for (let y = at - 13; y <= at + 11; y += 6) {
        r(xa - 1, y - 1, wl + 2, 4, DARK); r(xa, y, wl, 2, K.iron); r(xa, y, wl, 1, K.ironL);
        r(lf ? xa + wl : xa - 2, y, 2, 1, '#d0d0dc');
      }
      for (const vx of [x + 2, x + g.sw - 4]) { r(vx - 1, at - 16, 4, 32, DARK); r(vx, at - 16, 2, 32, K.iron); r(vx, at - 16, 1, 32, K.ironL); }
      padlock(cx, at + 3);
      return null;
    },
  };

  // ====================================================================
  // DỰNG PHÒNG
  // ====================================================================
  // g: { W, H, fx0, fy0, fx1, fy1, wh, cap, sw, fw, doors: [{ side, at, state }] }
  function buildRoom(T, g, seed) {
    const rn = G.srand(seed || 11);
    const base = mk(g.W, g.H), fore = mk(g.W, g.H);
    c = base;
    T.paintVoid(g, rn);
    T.floor(g, rn);
    if (T.carpet) T.carpet(g, rn);
    T.back(g, rn);
    T.sides(g, rn);
    T.front(g, rn);
    T.backDeco(g, rn);
    const fores = [];
    for (const d of g.doors) { const f = T.door(g, d, rn); if (f) fores.push(f); }
    if (T.over) T.over(g, rn);
    c = fore;
    for (const f of fores) f();
    if (T.fore) T.fore(g, rn);
    return { base: base.canvas, fore: fore.canvas, g };
  }
  M.buildRoom = buildRoom;
  M.themes = { castle: Castle };
  M.K = K; M.torch = torch;
  M.util = { mk, r: (ctx) => { c = ctx; return r; }, mix, dim, lite, rgba, glow, ell, clipRect, padlock, arrow, spill, bricks, setC: (x) => { c = x; }, DARK };
})();
