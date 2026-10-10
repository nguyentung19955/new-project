// Phòng vuông nhìn từ trên xuống chếch: tường sau thấy mặt, tường hai bên và tường trước là viền.
// Vẽ kiến trúc phòng (sàn, tường, cửa bốn phía) cho ba chủ đề: Rừng già, Hang biển, Lâu đài cổ.
// Nhân vật, quái, đồ vật bấm được vẫn do art.js và env_art.js vẽ; tệp này chỉ thay nền và thêm lớp phủ trước.
(function () {
  const G = window.G, A = G.art;
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
    if (building) return;
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

  // ---------- Giai đoạn 2 (đấu trường): lưới chấm (dither), nhiễu mượt, tô theo dải màu ----------
  // Mọi chuyển sáng tối trên nền đều làm bằng lưới chấm Bayer 4x4: điểm ảnh vẫn sắc, không mờ nhoè, không dải màu mịn.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bay = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];
  const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  // Nhiễu mượt (value noise): lưới số ngẫu nhiên cách nhau `cell` điểm ảnh, nội suy mượt. Dùng để chia sàn thành mảng lớn có chủ đích.
  function vnoise(rn, cell, W, H) {
    const gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2, v = new Float32Array(gw * gh);
    for (let i = 0; i < v.length; i++) v[i] = rn();
    return (x, y) => {
      const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy);
      let tx = fx - ix, ty = fy - iy;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      const a = v[iy * gw + ix], b = v[iy * gw + ix + 1], c2 = v[(iy + 1) * gw + ix], d = v[(iy + 1) * gw + ix + 1];
      return a + (b - a) * tx + (c2 - a) * ty + (a - b - c2 + d) * tx * ty;
    };
  }
  // Tô hình chữ nhật theo dải màu: fn(x, y) trả về chỉ số (số thực) trong dải, hoặc SKIP để giữ nguyên điểm ảnh cũ.
  // Lối mòn: 1 ở giữa lối nối tâm phòng với từng cửa (hơi uốn), 0 ở xa; có khoảng sân tròn ở giữa phòng.
  function pathField(g, hw) {
    const cx = (g.fx0 + g.fx1) / 2, cy = (g.fy0 + g.fy1) / 2;
    const segs = g.doors.map((d) => [d.side === 'left' ? g.fx0 : d.side === 'right' ? g.fx1 : d.at, d.side === 'top' ? g.fy0 : d.side === 'bottom' ? g.fy1 : d.at]);
    return (x, y) => {
      let best = 1e9;
      for (const [tx, ty] of segs) {
        const vx = tx - cx, vy = ty - cy, L2 = vx * vx + vy * vy || 1;
        const t = Math.max(0, Math.min(1, ((x - cx) * vx + (y - cy) * vy) / L2));
        const wob = Math.sin(t * 7.5 + tx * 0.05) * 3;
        const px = cx + vx * t + (Math.abs(vy) > Math.abs(vx) ? wob : 0), py = cy + vy * t + (Math.abs(vy) > Math.abs(vx) ? 0 : wob);
        best = Math.min(best, Math.hypot(x - px, y - py) - (1 - t) * 3);
      }
      const e = Math.hypot((x - cx) / 30, (y - cy) / 21);
      return Math.max(1 - smooth(hw * 0.45, hw, best), 1 - smooth(0.7, 1.05, e));
    };
  }
  // Làm gắt phần lẻ: chỉ chấm xen kẽ ở dải hẹp giữa hai nấc, còn lại là mảng màu phẳng (đúng kiểu pixel art, không rỗ khắp nơi).
  const sharp = (f) => { const i = Math.floor(f), t = f - i; return i + (t < 0.32 ? 0 : t > 0.68 ? 0.999 : (t - 0.32) / 0.36); };
  const SKIP = -99;
  function rampFill(x0, y0, w, h, ramp, fn) {
    const cols = ramp.map(hex), n = cols.length - 1, id = c.getImageData(x0, y0, w, h), d = id.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gx = x0 + x, gy = y0 + y, f = fn(gx, gy);
        if (f === SKIP) continue;
        const k = Math.max(0, Math.min(n, Math.floor(sharp(f) + bay(gx, gy)))), cc = cols[k], o = (y * w + x) * 4;
        d[o] = cc[0]; d[o + 1] = cc[1]; d[o + 2] = cc[2]; d[o + 3] = 255;
      }
    }
    c.putImageData(id, x0, y0);
  }

  // ====================================================================
  // CHỦ ĐỀ LÂU ĐÀI
  // ====================================================================
  const K = {
    void: '#120c0c', brick: '#4b3f3f', brickD: '#342a2b', brickL: '#5f504c', stone: '#6e5f58', stoneL: '#8a7a6e',
    wood: '#4a3020', woodD: '#2e1c12', woodL: '#6a4830', iron: '#55555e', ironL: '#8a8a96',
    red: '#7a2a2a', redD: '#4e1c20', gold: '#c89a3a', floor: '#4f4745', light: '#ffc878', cap: '#3a3031', capL: '#4c4041', capD: '#2a2223',
  };
  function torch(x, y, g) {
    if (g && g.lights) g.lights.push({ k: 'torch', x, y });
    glow(x, y - 4, 26, 20, '#ff9a40', 0.07, 4);
    r(x - 1, y, 2, 9, K.iron); r(x - 3, y, 6, 2, K.ironL); r(x - 2, y + 2, 4, 1, K.iron);
    r(x - 2, y - 5, 4, 5, '#ff7a2a'); r(x - 1, y - 8, 2, 4, '#ff7a2a'); r(x - 1, y - 4, 2, 4, '#ffd23f'); r(x, y - 6, 1, 2, '#ffd23f'); r(x, y - 2, 1, 2, '#fff3b0');
    r(x + 1, y - 10, 1, 1, '#ffd23f');
    // quầng sáng ấm hắt xuống sàn: tô bằng lưới chấm ở lightPass
    if (g && g.glows) g.glows.push({ x, y: g.fy0 + 10, rx: 44, ry: 26, a: 0.2, col: '#ffb060' });
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
            r(x, y + ts - 2, ts - 1, 1, dim(col, 0.1)); // mép dưới viên đá hơi tối: viên đá có khối
            if (rn() < 0.07) { const cx = x + 3 + Math.floor(rn() * 6), cy = y + 4 + Math.floor(rn() * 7); r(cx, cy, 5, 1, dim(col, 0.3)); r(cx + 4, cy + 1, 3, 1, dim(col, 0.3)); r(cx + 2, cy - 1, 1, 1, dim(col, 0.3)); }
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
        if (g.casts) g.casts.push({ x: x - 1, y: g.fy0, w: 11, len: 11, a: 0.34 }); // cột đổ bóng xuống sàn
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
        else { r(x - 6, wy + 8, 12, 20, DARK); r(x - 5, wy + 9, 10, 18, '#a8502a'); r(x - 5, wy + 9, 10, 6, '#d8823a'); r(x - 1, wy + 9, 1, 18, DARK); r(x - 5, wy + 17, 10, 1, DARK); r(x - 6, wy + 7, 12, 1, K.stoneL); if (g.amb) g.amb.push({ k: 'win', x, y: wy + 9, ph: rn() * 9 }); }
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
    cry: '#58c8ea', cryL: '#d8f6ff', cryD: '#2a7fae', floor: '#39424d', water: '#1b4a66', waterD: '#123650', waterL: '#8fd0ea', light: '#9fe0f4',
    // dải màu sàn đá (tối -> sáng). Xem docs/vfx/BANG-MAU.md
    ground: ['#1b222b', '#29313b', '#333c47', '#3e4853', '#4a5560'],
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
    clipRect(x, y, w, h, () => {
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
      // Sàn hang: phiến đá lớn xếp không đều (ô Voronoi), mỗi phiến một độ sáng, khe nứt tối, mép trên phiến có gờ sáng, mép dưới tối.
      // Đá ướt loang thành mảng lớn (nhiễu mượt). Không rắc chấm lẻ; vũng nước ít, to, có viền.
      const w = g.fx1 - g.fx0, h = g.fy1 - g.fy0, CS = 25;
      const n1 = vnoise(rn, 34, g.W, g.H), n2 = vnoise(rn, 7, g.W, g.H);
      const gw = Math.ceil(g.W / CS) + 2, gh = Math.ceil(g.H / CS) + 2, sx = new Float32Array(gw * gh), sy = new Float32Array(gw * gh), tone = new Float32Array(gw * gh);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const k = j * gw + i; sx[k] = (i - 1 + 0.2 + rn() * 0.6) * CS; sy[k] = (j - 1 + 0.2 + rn() * 0.6) * CS * 0.8; tone[k] = rn(); }
      rampFill(g.fx0, g.fy0, w, h, C.ground, (x, y) => {
        const ci = Math.floor(x / CS) + 1, cj = Math.floor(y / (CS * 0.8)) + 1;
        let d1 = 1e9, d2 = 1e9, k1 = 0;
        for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
          if (i < 0 || j < 0 || i >= gw || j >= gh) continue;
          const k = j * gw + i, dx = x - sx[k], dy = (y - sy[k]) * 1.25, dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < d1) { d2 = d1; d1 = dd; k1 = k; } else if (dd < d2) d2 = dd;
        }
        const e = d2 - d1;
        if (e < 1.1) return 0.6 + (tone[k1] - 0.5) * 0.6;
        let f = 2.1 + (tone[k1] - 0.5) * 1.1 + (n1(x, y) - 0.5) * 1.3 + (n2(x, y) - 0.5) * 0.35;
        if (e < 2.6) f += sy[k1] > y ? 0.9 : -0.6;
        return Math.max(0, Math.min(3.999, f));
      });
      clipRect(g.fx0, g.fy0, w, h, () => {
        // vài viên sỏi có bóng
        for (let i = 0; i < 5; i++) { const x = g.fx0 + 10 + rn() * (w - 20), y = g.fy0 + 14 + rn() * (h - 22), sw = ri(rn, 2, 4); r(x - 1, y + 2, sw + 1, 1, C.ground[0]); r(x, y, sw, 2, '#55636f'); r(x, y, sw - 1, 1, '#71818d'); }
        // vũng nước: ít mà to, viền đá tối, mặt nước có ánh
        for (let i = 0, n = Math.max(2, Math.round((w * h) / 16000)); i < n; i++) {
          const cx = g.fx0 + 26 + rn() * (w - 52), cy = g.fy0 + 28 + rn() * (h - 52), rx = ri(rn, 11, 17);
          ell(cx, cy + 1, rx + 1, rx * 0.5 + 1, C.ground[0]); ell(cx, cy, rx, rx * 0.5, C.waterD); ell(cx, cy - 1, rx - 2, rx * 0.5 - 1, C.water);
          r(cx - rx * 0.4, cy - 2, rx * 0.5, 1, C.waterL); r(cx + 2, cy + 1, 3, 1, rgba(C.waterL, 0.5));
          if (g.amb) g.amb.push({ k: 'pud', x: Math.round(cx), y: Math.round(cy - 1), rx: rx - 2, ry: Math.round(rx * 0.5 - 1), ph: rn() * 9 });
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
        if (rn() < 0.3) { r(x, wy + h + ri(rn, 2, 7), 1, 2, C.wet); if (g.amb) g.amb.push({ k: 'drip', x, y: wy + h + 1, y1: g.fy0 + 3 + ri(rn, 0, 5), ph: rn() * 9, sp: 0.7 + rn() * 0.6 }); }
      }
      // tinh thể mọc ở chân vách
      for (let x = g.fx0 + 22, i = 0; x < g.fx1 - 14; x += ri(rn, 34, 52), i++) {
        if (near(x, 30)) continue;
        crystal(x, g.fy0 + 1, i % 2 ? 1 : 2);
        if (g.glows) g.glows.push({ x, y: g.fy0 + 8, rx: 30, ry: 16, a: i % 2 ? 0.1 : 0.16, col: C.cry });
        if (g.amb) g.amb.push({ k: 'cry', x, y: g.fy0 - (i % 2 ? 4 : 8), s: i % 2 ? 1 : 2, ph: rn() * 9 });
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
          spill('top', at, g, L, 44); arrow(at, yb + 9, 'up', '#d8f6ff');
          // tinh thể chắn đã vỡ, còn vài mảnh dưới đất
          r(at - 12, yb - 2, 3, 2, C.cry); r(at + 9, yb - 3, 3, 3, C.cry); r(at - 5, yb + 1, 2, 2, C.cryL);
        } else {
          barrier(at - 7, yb, 1); barrier(at + 7, yb, 1); barrier(at, yb + 1, 2);
          r(at - 14, yb - 1, 28, 2, 'rgba(255,60,40,0.4)');
          padlock(at, yb - 10);
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
          spill('bottom', at, g, L, 44); arrow(at, y - 9, 'down', '#d8f6ff');
          return null;
        }
        r(at - 15, y - 1, 30, 2, 'rgba(255,60,40,0.4)');
        return () => { barrier(at - 9, y + 9, 1); barrier(at + 9, y + 9, 1); barrier(at, y + 10, 2); padlock(at, y + 3); };
      }
      const lf = d.side === 'left', x = lf ? g.fx0 - g.sw : g.fx1, cx = x + (g.sw >> 1);
      r(x, at - 16, g.sw, 32, dim(C.floor, 0.25));
      for (const y of [at - 21, at + 21]) { ell(cx, y + 1, g.sw / 2 + 2, 8, DARK); ell(cx, y, g.sw / 2 + 1, 7, C.rock); ell(cx - 1, y - 3, g.sw / 2 - 2, 3, C.rockL); }
      if (open) {
        r(x, at - 15, g.sw, 30, rgba(L, 0.7)); r(x + (lf ? 0 : 2), at - 11, g.sw - 2, 22, rgba('#f0ffff', 0.45));
        for (let i = 0; i < 8; i++) r(lf ? x - 1 - i : x + g.sw + i, at - 15, 1, 30, rgba(L, Math.max(0, 0.5 - i * 0.07)));
        spill(d.side, at, g, L, 44); arrow(lf ? g.fx0 + 8 : g.fx1 - 9, at, d.side, '#d8f6ff');
        return null;
      }
      r(lf ? g.fx0 : g.fx1 - 2, at - 15, 2, 30, 'rgba(255,60,40,0.4)');
      barrier(cx, at - 4, 1); barrier(cx + (lf ? 2 : -2), at + 6, 2); barrier(cx, at + 15, 1);
      padlock(cx, at + 4);
      return null;
    },
  };

  // ====================================================================
  // RỪNG
  // ====================================================================
  const F = {
    void: '#0b1610', leafD: '#13291a', leafM: '#1d3d25', leafL: '#2f5f34', leafH: '#4c8a3e',
    bark: '#3b2d20', barkD: '#261c14', barkL: '#57432e', moss: '#3d6a2e', mossL: '#69994a',
    floor: '#3d402e', light: '#e4f0a0', thorn: '#8a6a44', mist: '#c8dcb0',
    // dải màu sàn (tối -> sáng): 5 nấc đất nền rồi 4 nấc rêu. Xem docs/vfx/BANG-MAU.md
    ground: ['#262a1d', '#313526', '#3d402e', '#4a4936', '#56523c', '#283620', '#314327', '#3b512d', '#466033'],
    grassD: '#34502a', grassM: '#4a6c34', grassL: '#66894a',
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
      // Sàn nhiều lớp: đất nền chia mảng lớn (nhiễu mượt) – lối mòn đất nện nối các cửa – mảng rêu dày dần về phía tường.
      // Chuyển giữa các nấc màu bằng lưới chấm; chi tiết nhỏ (khóm cỏ, lá, đá) ít và đi theo cụm, không rắc đều.
      const w = g.fx1 - g.fx0, h = g.fy1 - g.fy0;
      const n1 = vnoise(rn, 30, g.W, g.H), n2 = vnoise(rn, 8, g.W, g.H), nm = vnoise(rn, 22, g.W, g.H), pf = pathField(g, 9);
      const edgeOf = (x, y) => 1 - smooth(0, 34, Math.min(x - g.fx0, g.fx1 - x, (y - g.fy0) * 1.3, g.fy1 - y));
      const MOSS0 = 5; // các nấc rêu nằm sau các nấc đất trong dải màu
      rampFill(g.fx0, g.fy0, w, h, F.ground, (x, y) => {
        const p = pf(x, y), m = nm(x, y) + edgeOf(x, y) * 0.28 - p * 0.7;
        if (m > 0.64 + (bay(x, y) - 0.5) * 0.04) return MOSS0 + Math.max(0, Math.min(2.6, (m - 0.64) * 8 + (n2(x, y) - 0.5) * 0.9 + 0.3));
        return Math.max(0, Math.min(3.999, 1.7 + (n1(x, y) - 0.5) * 1.8 + (n2(x, y) - 0.5) * 0.6 + p * 1.5));
      });
      clipRect(g.fx0, g.fy0, w, h, () => {
        // khóm cỏ: chỉ mọc trong mảng rêu, mỗi khóm vài lá có gốc tối
        const spot = (pred, tries) => { for (let k = 0; k < (tries || 30); k++) { const x = g.fx0 + 6 + rn() * (w - 12), y = g.fy0 + 10 + rn() * (h - 16); if (pred(x, y)) return [Math.round(x), Math.round(y)]; } return null; };
        for (let i = 0; i < 16; i++) {
          const s0 = spot((x, y) => nm(x, y) + edgeOf(x, y) * 0.28 - pf(x, y) * 0.7 > 0.68);
          if (!s0) continue;
          const [x, y] = s0, n = ri(rn, 3, 5);
          r(x - 2, y + 1, n + 3, 1, F.grassD);
          for (let k = 0; k < n; k++) { const hh = ri(rn, 2, 4), xx = x - 1 + k; r(xx, y + 1 - hh, 1, hh, k % 2 ? F.grassM : F.grassD); r(xx, y + 1 - hh, 1, 1, k % 2 ? F.grassL : F.grassM); }
        }
        // lá rụng: vài cụm nhỏ trên đất
        for (let i = 0; i < 5; i++) {
          const s0 = spot((x, y) => pf(x, y) < 0.2);
          if (!s0) continue;
          for (let k = 0, n = ri(rn, 2, 3); k < n; k++) { const x = s0[0] + ri(rn, -5, 5), y = s0[1] + ri(rn, -3, 3), col = pick3(rn, '#6e5226', '#7a3c22', '#86682c'); r(x, y + 1, 3, 1, dim(col, 0.35)); r(x, y, 3, 1, col); r(x + 1, y, 1, 1, lite(col, 0.18)); }
        }
        // đá nhỏ có bóng và cạnh sáng
        for (let i = 0; i < 4; i++) {
          const s0 = spot((x, y) => pf(x, y) < 0.3);
          if (!s0) continue;
          const [x, y] = s0, sw = ri(rn, 3, 5);
          r(x - 1, y + 2, sw + 1, 1, F.ground[0]); r(x, y, sw, 2, '#5c5a4c'); r(x, y, sw - 1, 1, '#76735f');
        }
        // một cụm hoa dại nhỏ sát mép
        const fl = spot((x, y) => edgeOf(x, y) > 0.6 && pf(x, y) < 0.1);
        if (fl) for (let k = 0; k < 3; k++) { const x = fl[0] + ri(rn, -6, 6), y = fl[1] + ri(rn, -4, 4); r(x, y + 1, 1, 2, F.grassD); r(x - 1, y, 3, 1, '#d8cfa4'); r(x, y - 1, 1, 3, '#d8cfa4'); r(x, y, 1, 1, '#e0a440'); }
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
        if (g.glows) g.glows.push({ x, y: g.fy0 + 4, rx: 22, ry: 12, a: 0.13, col: '#b0f070' });
        if (g.amb) g.amb.push({ k: 'shroom', x, y: g.fy0 - 3, ph: rn() * 9 });
        r(x - 1, g.fy0 - 1, 2, 4, '#e8e0c0'); r(x - 3, g.fy0 - 4, 6, 3, '#9ad860'); r(x - 2, g.fy0 - 5, 4, 1, '#d0f8a0');
        r(x + 5, g.fy0 + 1, 1, 2, '#e8e0c0'); r(x + 4, g.fy0 - 1, 3, 2, '#9ad860');
      }
    },
    sides(g, rn) {
      const y0 = g.fy0 - g.wh - g.cap, h = g.fy1 + g.fw - y0;
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
          spill('top', at, g, L, 44); arrow(at, yb + 9, 'up', '#f4ffb0');
          r(at - 13, yb - 30, 2, 9, '#5a3f26'); r(at + 11, yb - 28, 2, 7, '#5a3f26'); r(at - 13, yb - 22, 2, 1, '#d8c090');
        } else {
          thornVine(at - 12, yb - 28, at + 11, yb - 3, rn); thornVine(at + 11, yb - 28, at - 12, yb - 3, rn); thornVine(at - 13, yb - 15, at + 12, yb - 15, rn);
          r(at - 13, yb - 1, 26, 2, 'rgba(255,60,40,0.4)');
          padlock(at, yb - 12);
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
          spill('bottom', at, g, L, 44); arrow(at, y - 9, 'down', '#f4ffb0');
          return null;
        }
        r(at - 15, y - 1, 30, 2, 'rgba(255,60,40,0.4)');
        return () => { thornVine(at - 15, y - 4, at + 14, y + 8, rn); thornVine(at - 15, y + 8, at + 14, y - 4, rn); thornVine(at - 16, y + 2, at + 15, y + 2, rn); padlock(at, y + 4); };
      }
      const lf = d.side === 'left', x = lf ? g.fx0 - g.sw : g.fx1, cx = x + (g.sw >> 1);
      r(x, at - 16, g.sw, 32, mix(F.floor, '#6a5a3c', 0.4));
      stump(cx, at - 19); stump(cx, at + 24);
      if (open) {
        r(x, at - 14, g.sw, 30, rgba(L, 0.6)); r(x + (lf ? 0 : 2), at - 10, g.sw - 2, 22, rgba('#fffff0', 0.4));
        for (let i = 0; i < 8; i++) r(lf ? x - 1 - i : x + g.sw + i, at - 14, 1, 30, rgba(L, Math.max(0, 0.45 - i * 0.06)));
        spill(d.side, at, g, L, 44); arrow(lf ? g.fx0 + 8 : g.fx1 - 9, at, d.side, '#f4ffb0');
        return null;
      }
      r(lf ? g.fx0 : g.fx1 - 2, at - 14, 2, 30, 'rgba(255,60,40,0.4)');
      thornVine(x + 1, at - 13, x + g.sw - 3, at + 15, rn); thornVine(x + g.sw - 3, at - 13, x + 1, at + 15, rn); thornVine(cx - 1, at - 14, cx - 1, at + 16, rn);
      padlock(cx, at + 3);
      return null;
    },
  };


  // ====================================================================
  // BIẾN THỂ SÀN VÀ ĐỒ TRANG TRÍ: để các phòng trong một ải không giống hệt nhau
  // ====================================================================
  const fw_ = (g) => g.fx1 - g.fx0, fh_ = (g) => g.fy1 - g.fy0;
  // Thảm ngắn dẫn vào từng cửa
  function runners(g, cc, ed) {
    const L = Math.min(40, fh_(g) * 0.2);
    for (const d of g.doors) {
      if (d.side === 'top' || d.side === 'bottom') {
        const y0 = d.side === 'top' ? g.fy0 : g.fy1 - L;
        r(d.at - 11, y0, 22, L, cc); r(d.at - 9, y0, 1, L, ed); r(d.at + 8, y0, 1, L, ed);
      } else {
        const x0 = d.side === 'left' ? g.fx0 : g.fx1 - L;
        r(x0, d.at - 11, L, 22, cc); r(x0, d.at - 9, L, 1, ed); r(x0, d.at + 8, L, 1, ed);
      }
    }
  }
  Castle.floors = [
    (g, rn) => { Castle.floor(g, rn); Castle.carpet(g, rn); },
    // phiến đá lớn, rêu trong kẽ, chỉ có thảm ở cửa
    (g, rn) => {
      const w = fw_(g), h = fh_(g);
      clipRect(g.fx0, g.fy0, w, h, () => {
        r(g.fx0, g.fy0, w, h, dim(K.floor, 0.34));
        for (let y = g.fy0, j = 0; y < g.fy1; y += 20, j++) {
          for (let x = g.fx0 - (j % 2 ? 14 : 0); x < g.fx1; x += 28) {
            const k = rn(), col = k < 0.2 ? lite(K.floor, 0.04) : k < 0.45 ? dim(K.floor, 0.1) : mix(K.floor, '#5a5560', 0.3);
            r(x, y, 27, 19, col); r(x, y, 27, 1, lite(col, 0.08)); r(x, y + 18, 27, 1, dim(col, 0.18));
            if (rn() < 0.12) { r(x + 4 + rn() * 14, y + 5 + rn() * 8, 6, 1, dim(col, 0.3)); }
            if (rn() < 0.22) { const mx = x + rn() * 20, my = y + 17; r(mx, my, 5, 2, '#3f5a34'); r(mx + 1, my, 2, 1, '#5f8046'); }
          }
        }
      });
      runners(g, '#3a3050', '#6a6a8a');
    },
    // gạch ô cờ hai màu, tấm thảm vuông ở giữa
    (g, rn) => {
      const w = fw_(g), h = fh_(g), cx = (g.fx0 + g.fx1) >> 1, cy = (g.fy0 + g.fy1) >> 1;
      clipRect(g.fx0, g.fy0, w, h, () => {
        r(g.fx0, g.fy0, w, h, dim(K.floor, 0.3));
        for (let y = g.fy0, j = 0; y < g.fy1; y += 16, j++) {
          for (let x = g.fx0, i = 0; x < g.fx1; x += 16, i++) {
            const col = (i + j) % 2 ? dim(K.floor, 0.12 + rn() * 0.05) : lite(K.floor, 0.03 + rn() * 0.04);
            r(x, y, 15, 15, col); r(x, y, 15, 1, lite(col, 0.06));
            if (rn() < 0.05) { r(x + 4, y + 6, 6, 1, dim(col, 0.3)); r(x + 9, y + 7, 2, 1, dim(col, 0.3)); }
          }
        }
      });
      r(cx - 34, cy - 24, 68, 48, '#77593a'); r(cx - 32, cy - 22, 64, 44, '#4e2a32'); r(cx - 28, cy - 18, 56, 36, '#5c3038');
      for (let x = cx - 26; x < cx + 26; x += 6) { r(x, cy - 16, 3, 1, '#77593a'); r(x, cy + 15, 3, 1, '#77593a'); }
      r(cx - 6, cy - 6, 12, 12, '#77593a'); r(cx - 4, cy - 4, 8, 8, '#4e2a32'); r(cx - 1, cy - 1, 2, 2, K.gold);
      runners(g, '#4e2a32', '#77593a');
    },
  ];
  Cave.floors = [
    (g, rn) => Cave.floor(g, rn),
    // hồ nước ở một góc, mảnh tinh thể rải rác
    (g, rn) => {
      Cave.floor(g, rn);
      const left = rn() < 0.5, top = rn() < 0.5;
      const cx = left ? g.fx0 + 34 : g.fx1 - 34, cy = top ? g.fy0 + 40 : g.fy1 - 34;
      clipRect(g.fx0, g.fy0, fw_(g), fh_(g), () => {
        ell(cx, cy + 1, 30, 20, C.rockD); ell(cx, cy, 28, 18, C.waterD); ell(cx, cy - 1, 25, 15, C.water);
        if (g.amb) g.amb.push({ k: 'pud', x: cx, y: cy - 1, rx: 25, ry: 15, ph: rn() * 9, big: 1 });
        r(cx - 14, cy - 6, 10, 1, C.waterL); r(cx + 4, cy + 3, 7, 1, rgba(C.waterL, 0.6)); r(cx - 4, cy - 1, 4, 1, rgba(C.waterL, 0.5));
        for (let i = 0; i < 4; i++) { const x = g.fx0 + 14 + rn() * (fw_(g) - 28), y = g.fy0 + 16 + rn() * (fh_(g) - 28); r(x, y, 2, 3, C.cry); r(x, y, 1, 1, C.cryL); r(x + 2, y + 1, 1, 2, C.cryD); }
      });
    },
    // nền cát ẩm, vỏ sò và sao biển
    (g, rn) => {
      Cave.floor(g, rn);
      clipRect(g.fx0, g.fy0, fw_(g), fh_(g), () => {
        for (let i = 0; i < 4; i++) {
          const x = g.fx0 + rn() * fw_(g), y = g.fy0 + rn() * fh_(g), rx = ri(rn, 14, 28);
          ell(x, y, rx, rx * 0.55, mix(C.floor, '#8a8266', 0.24)); ell(x - 2, y - 1, rx * 0.7, rx * 0.35, mix(C.floor, '#a09878', 0.22));
        }
        for (let i = 0; i < 4; i++) {
          const x = g.fx0 + 12 + rn() * (fw_(g) - 24), y = g.fy0 + 14 + rn() * (fh_(g) - 24);
          if (rn() < 0.5) { r(x, y, 4, 3, '#d8c8b0'); r(x + 1, y, 2, 1, '#f0e8d8'); r(x, y + 2, 4, 1, '#9a8a74'); }
          else { r(x, y, 5, 1, '#c8684a'); r(x + 2, y - 2, 1, 5, '#c8684a'); r(x + 2, y, 1, 1, '#f0a080'); }
        }
      });
    },
  ];
  Forest.floors = [
    (g, rn) => Forest.floor(g, rn),
    // bãi hoa dại, vòng đá ở giữa
    (g, rn) => {
      Forest.floor(g, rn);
      const cx = (g.fx0 + g.fx1) / 2, cy = (g.fy0 + g.fy1) / 2;
      clipRect(g.fx0, g.fy0, fw_(g), fh_(g), () => {
        // bãi hoa mọc thành ba cụm (không rắc đều cả phòng)
        const cl = [0, 1, 2].map(() => [g.fx0 + 20 + rn() * (fw_(g) - 40), g.fy0 + 24 + rn() * (fh_(g) - 40)]);
        for (let i = 0; i < 21; i++) {
          const q = cl[i % 3], x = q[0] + (rn() - 0.5) * 22, y = q[1] + (rn() - 0.5) * 14, col = pick3(rn, '#e0d8b0', '#d898b8', '#e0b858');
          r(x, y + 1, 1, 2, F.moss); r(x - 1, y, 3, 1, col); r(x, y - 1, 1, 3, col); r(x, y, 1, 1, '#f0b040');
        }
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, x = cx + Math.cos(a) * 34, y = cy + Math.sin(a) * 24; r(x - 3, y - 1, 7, 5, DARK); r(x - 2, y - 2, 5, 5, '#8a8a80'); r(x - 2, y - 2, 4, 1, '#b8b8ac'); r(x + 1, y + 1, 2, 2, '#5a5a54'); }
      });
    },
    // đất ẩm, rễ cây và lá rụng
    (g, rn) => {
      Forest.floor(g, rn);
      clipRect(g.fx0, g.fy0, fw_(g), fh_(g), () => {
        for (let i = 0; i < 9; i++) { const x = g.fx0 + rn() * fw_(g), y = g.fy0 + rn() * fh_(g); ell(x, y, ri(rn, 12, 24), ri(rn, 6, 11), mix(F.floor, '#2e2a20', 0.5)); }
        for (let i = 0; i < 5; i++) {
          const x0 = g.fx0 + rn() * fw_(g), y0 = g.fy0 + 10 + rn() * (fh_(g) - 20), len = ri(rn, 18, 40), dir = rn() < 0.5 ? 1 : -1;
          for (let k = 0; k < len; k++) { const y = y0 + Math.sin(k * 0.22) * 4; r(x0 + dir * k, y, 2, 2, k % 7 < 5 ? F.bark : F.barkD); if (k % 5 === 0) r(x0 + dir * k, y - 1, 1, 1, F.barkL); }
        }
        for (let i = 0; i < 14; i++) { const q = i % 2 ? [g.fx0 + 30, g.fy1 - 30] : [g.fx1 - 34, g.fy0 + 34], x = q[0] + (rn() - 0.5) * 40, y = q[1] + (rn() - 0.5) * 26, col = pick3(rn, '#7a5a2a', '#8a4426', '#9a7a30'); r(x, y + 1, 3, 1, dim(col, 0.4)); r(x, y, 3, 1, col); r(x + 1, y, 1, 1, lite(col, 0.2)); }
      });
    },
  ];
  function pick3(rn, a, b, d) { const k = rn(); return k < 0.34 ? a : k < 0.67 ? b : d; }

  // Dấu trên sàn theo loại phòng: nhìn sàn là biết phòng gì
  function ringMark(cx, cy, R1, col, a) {
    for (let i = 0; i < 64; i++) {
      const an = (i / 64) * Math.PI * 2;
      r(cx + Math.cos(an) * R1 - 1, cy + Math.sin(an) * R1 * 0.82 - 1, 2, 2, rgba(col, a));
    }
  }
  function mark(T, g) {
    const cx = (g.fx0 + g.fx1) >> 1, cy = (g.fy0 + g.fy1) >> 1, t = g.type;
    if (t === 'start') {
      ringMark(cx, cy, 20, '#8fe06a', 0.5); ringMark(cx, cy, 13, '#8fe06a', 0.3);
      for (const [dx, dy] of [[0, -16], [0, 16], [-20, 0], [20, 0]]) { r(cx + dx - 1, cy + dy * 0.82 - 1, 3, 3, rgba('#e0ffc8', 0.7)); }
    } else if (t === 'elite') {
      ringMark(cx, cy, 30, '#ff8a3a', 0.45);
      for (let i = 0; i < 3; i++) { r(cx - 8 + i * 7, cy - 6, 2, 12, rgba('#ff8a3a', 0.4)); r(cx - 9 + i * 7, cy - 8, 2, 3, rgba('#ff8a3a', 0.4)); }
    } else if (t === 'challenge') {
      ringMark(cx, cy, 34, '#4ad0c0', 0.45); ringMark(cx, cy, 28, '#4ad0c0', 0.25);
    } else if (t === 'curse') {
      ringMark(cx, cy - 4, 24, '#b46aff', 0.4);
    } else if (t === 'boss') {
      const col = T.light;
      ringMark(cx, cy, 58, col, 0.3); ringMark(cx, cy, 50, col, 0.18);
      for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2; r(cx + Math.cos(an) * 54 - 2, cy + Math.sin(an) * 54 * 0.82 - 2, 4, 4, rgba(col, 0.4)); }
    }
  }

  // Đồ trang trí nhỏ ở bốn góc phòng (không nằm trên lối vào cửa, không che đồ vật bấm được ở giữa)
  const DECOR = {
    2: [ // lâu đài
      (x, y) => { ell(x, y + 1, 7, 3, 'rgba(0,0,0,0.3)'); r(x - 6, y - 11, 12, 12, DARK); r(x - 5, y - 10, 10, 10, K.wood); r(x - 5, y - 10, 2, 10, K.woodL); r(x - 5, y - 8, 10, 1, K.ironL); r(x - 5, y - 3, 10, 1, K.ironL); r(x - 4, y - 12, 8, 2, K.woodL); },
      (x, y) => { ell(x, y + 1, 8, 3, 'rgba(0,0,0,0.3)'); r(x - 7, y - 9, 14, 10, DARK); r(x - 6, y - 8, 12, 8, K.woodL); r(x - 6, y - 8, 12, 1, lite(K.woodL, 0.2)); r(x - 6, y - 4, 12, 1, K.woodD); r(x - 1, y - 8, 2, 8, K.woodD); },
      (x, y) => { r(x - 5, y - 1, 10, 2, '#d8d0bc'); r(x - 6, y - 2, 2, 4, '#d8d0bc'); r(x + 4, y - 2, 2, 4, '#d8d0bc'); r(x - 2, y - 6, 5, 4, '#d8d0bc'); r(x - 1, y - 5, 1, 1, DARK); r(x + 1, y - 5, 1, 1, DARK); },
      (x, y, g) => { ell(x, y + 1, 5, 2, 'rgba(0,0,0,0.3)'); r(x - 1, y - 12, 2, 12, K.iron); r(x - 3, y - 1, 6, 2, K.ironL); r(x - 3, y - 13, 6, 2, K.ironL); g.lights.push({ k: 'candle', x, y: y - 15 }); g.glows.push({ x, y: y - 2, rx: 16, ry: 9, a: 0.14, col: '#ffc070' }); },
    ],
    1: [ // hang
      (x, y) => { ell(x, y + 1, 9, 4, 'rgba(0,0,0,0.3)'); ell(x - 3, y - 3, 6, 4, C.rock); ell(x + 4, y - 2, 5, 3, C.rockL); ell(x, y - 6, 4, 3, C.rockL); r(x - 2, y - 8, 4, 1, lite(C.rockL, 0.15)); },
      (x, y, g) => { crystal(x, y, 1); g.lights.push({ k: 'twinkle', x, y: y - 8 }); },
      (x, y, g) => { ell(x, y, 10, 5, C.waterD); ell(x, y - 1, 8, 3, C.water); r(x - 4, y - 2, 5, 1, C.waterL); if (g && g.amb) g.amb.push({ k: 'pud', x, y: y - 1, rx: 8, ry: 3, ph: x * 0.13 }); },
      (x, y) => { r(x - 3, y - 2, 7, 4, DARK); r(x - 2, y - 2, 5, 3, '#d8c8b0'); r(x - 1, y - 2, 3, 1, '#f0e8d8'); r(x - 2, y, 1, 1, '#9a8a74'); r(x, y, 1, 1, '#9a8a74'); r(x + 2, y, 1, 1, '#9a8a74'); },
    ],
    0: [ // rừng
      (x, y) => { ell(x, y + 1, 8, 3, 'rgba(0,0,0,0.3)'); r(x - 6, y - 8, 12, 9, DARK); r(x - 5, y - 5, 10, 6, F.bark); r(x - 5, y - 5, 2, 6, F.barkL); r(x - 5, y - 8, 10, 3, '#8a6a44'); r(x - 3, y - 7, 5, 1, '#5a3f26'); r(x - 1, y - 7, 1, 1, '#c8a060'); },
      (x, y, g, rn) => { leafBlob(x - 4, y - 3, 7, 5, rn); leafBlob(x + 4, y - 2, 6, 4, rn); r(x - 2, y - 5, 2, 2, '#e85a5a'); r(x + 5, y - 3, 2, 2, '#e85a5a'); },
      (x, y, g) => { r(x - 1, y - 4, 2, 5, '#e8e0c0'); r(x - 4, y - 7, 8, 3, '#c85a3a'); r(x - 3, y - 8, 6, 1, '#e88a5a'); r(x - 2, y - 6, 1, 1, '#fff0d0'); r(x + 1, y - 7, 1, 1, '#fff0d0'); r(x + 5, y - 1, 1, 3, '#e8e0c0'); r(x + 3, y - 3, 4, 2, '#c85a3a'); g.lights.push({ k: 'firefly', x, y: y - 14 }); },
      (x, y) => { ell(x, y + 1, 12, 3, 'rgba(0,0,0,0.3)'); r(x - 11, y - 5, 22, 6, DARK); r(x - 10, y - 4, 20, 4, F.bark); r(x - 10, y - 4, 20, 1, F.barkL); r(x - 10, y - 4, 2, 4, '#8a6a44'); r(x - 4, y - 5, 6, 1, F.moss); r(x + 2, y - 3, 1, 3, F.barkD); },
    ],
  };
  // Giai đoạn 2: ít vật hơn (2 món, phòng trùm 3), không đặt ở góc dành cho điểm nhấn và hai góc dưới (tiền cảnh che).
  function decor(T, g, rn) {
    const items = DECOR[T.reg];
    let spots = [[g.fx0 + 20, g.fy0 + 26, -1], [g.fx1 - 20, g.fy0 + 26, 1], [g.fx0 + 18, g.fy1 - 42, 0], [g.fx1 - 18, g.fy1 - 42, 0]];
    if (fw_(g) > 240) spots.push([g.fx0 + 70, g.fy0 + 22, 0], [g.fx1 - 70, g.fy0 + 22, 0]);
    spots = spots.filter((s) => s[2] !== g.accSide);
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rn() * (i + 1)), t = spots[i]; spots[i] = spots[j]; spots[j] = t; }
    const used = [];
    for (const s of spots.slice(0, g.big ? 3 : 2)) {
      let k = Math.floor(rn() * items.length);
      if (used.includes(k)) k = (k + 1) % items.length;
      used.push(k);
      items[k](Math.round(s[0] + rn() * 10 - 5), Math.round(s[1] + rn() * 8 - 4), g, rn);
    }
  }
  // Huy hiệu đầu lâu cạnh cửa dẫn tới Trùm; xích vàng trên cửa còn chờ điều kiện
  function skull(x, y) {
    r(x - 5, y - 5, 11, 11, DARK); r(x - 4, y - 4, 9, 6, '#e8e0d0'); r(x - 3, y + 2, 7, 2, '#e8e0d0'); r(x - 4, y - 4, 9, 1, '#fffaf0');
    r(x - 3, y - 2, 2, 3, '#b01818'); r(x + 2, y - 2, 2, 3, '#b01818'); r(x - 2, y + 3, 1, 1, DARK); r(x, y + 3, 1, 1, DARK); r(x + 2, y + 3, 1, 1, DARK);
  }
  function chain(x0, y0, x1, y1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 3;
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n; r(x - 1, y - 1, 3, 3, DARK); r(x, y, 2, 2, i % 2 ? '#e8c050' : '#a8842a'); }
  }
  function emblem(g, d) {
    const at = d.at, sx = d.side === 'left' ? g.fx0 - g.sw : g.fx1;
    if (d.gate && d.state !== 'open') {
      if (d.side === 'top') { chain(at - 13, g.fy0 - 28, at + 13, g.fy0 - 4); chain(at + 13, g.fy0 - 28, at - 13, g.fy0 - 4); }
      else if (d.side === 'left' || d.side === 'right') { chain(sx + 1, at - 14, sx + g.sw - 2, at + 14); chain(sx + g.sw - 2, at - 14, sx + 1, at + 14); }
    }
    if (!d.boss) return;
    if (d.side === 'top') skull(at, g.fy0 - 45);
    else if (d.side === 'bottom') { skull(at - 29, g.fy1 + 6); skull(at + 29, g.fy1 + 6); }
    else skull(sx + (g.sw >> 1), at - 34);
  }

  // ====================================================================
  // DỰNG PHÒNG
  // ====================================================================
  const THEMES = [Forest, Cave, Castle]; // theo số vùng: 0 Rừng già, 1 Hang biển, 2 Lâu đài cổ
  // Ánh sáng từng vùng (Giai đoạn 2): bóng tường [trên, trái, phải, dưới] (điểm ảnh), độ đậm màu sàn, sáng giữa phòng, tối ở rìa.
  Object.assign(Forest, { shade: [13, 8, 4, 5], voidCol: F.void, sat: 0.84, centerLight: 0.1, edgeDark: 0.17 });
  Object.assign(Cave, { shade: [12, 7, 4, 5], voidCol: C.void, sat: 0.88, centerLight: 0.09, edgeDark: 0.15 });
  Object.assign(Castle, { shade: [12, 7, 3, 4], voidCol: K.void, sat: 0.86, centerLight: 0.07, edgeDark: 0.15 });
  const SIDE_OF = { up: 'top', down: 'bottom', left: 'left', right: 'right' };
  const RA = (G.roomArt = { THEMES, SIDE_OF });
  // Khung phòng. big: phòng trùm rộng hơn. Sàn là hình chữ nhật fx0..fx1, fy0..fy1; nhân vật đứng trong bounds.
  RA.geo = function (big) {
    const g = big ? { fx0: 80, fy0: 56, fx1: 380, fy1: 254 } : { fx0: 136, fy0: 56, fx1: 344, fy1: 252 };
    Object.assign(g, { W: 480, H: 270, wh: 42, cap: 7, sw: 14, fw: 12, big: !!big });
    g.cx = (g.fx0 + g.fx1) / 2; g.cy = (g.fy0 + g.fy1) / 2;
    g.bounds = { x0: g.fx0 + 9, x1: g.fx1 - 9, y0: g.fy0 + 8, y1: g.fy1 - 4 };
    return g;
  };
  // Vị trí cửa trên sàn theo hướng: chỗ người chơi bước vào để sang phòng kề.
  RA.doorPos = function (g, dir) {
    const b = g.bounds;
    if (dir === 'up') return { x: g.cx, y: b.y0 };
    if (dir === 'down') return { x: g.cx, y: b.y1 };
    if (dir === 'left') return { x: b.x0, y: g.cy };
    return { x: b.x1, y: g.cy };
  };
  let building = false; // khi dựng nền thì không vẽ mũi tên chỉ lối (mũi tên vẽ động ở lớp sống)
  const arrow0 = arrow;
  // Trộn số hạt giống: G.srand là LCG nên hai hạt giống liền nhau (các phòng trong một ải) cho số đầu gần như nhau.
  const hs = (n) => { n = (n | 0) || 11; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); return (n ^ (n >>> 16)) >>> 0; };
  function buildRoom(T, g, seed) {
    const rn = G.srand(hs(seed || 11));
    const base = mk(g.W, g.H), fore = mk(g.W, g.H);
    g.lights = [];
    g.glows = []; // quầng sáng hắt xuống sàn (đuốc, tinh thể, nấm...): tô một lần ở lightPass
    g.casts = []; // bóng đổ hình bình hành (cột, gốc cây, tượng)
    g.accSide = g.type === 'fountain' ? 1 : hs((seed || 11) + 101) & 1 ? -1 : 1; // góc trên đặt điểm nhấn (phòng suối: bên phải, bên trái có rương đồ)
    g.amb = []; // chỗ có chuyển động môi trường (vũng nước, giọt nhũ đá, nấm sáng...): ghi lại lúc dựng, vẽ động ở lớp sống
    c = base;
    T.paintVoid(g, rn);
    T.floors[g.variant % T.floors.length](g, rn);
    mark(T, g);
    decor(T, g, rn);
    T.back(g, rn);
    backPass(T, g);
    T.sides(g, rn);
    T.front(g, rn);
    T.backDeco(g, rn);
    const acc = accentPlan(T, g, G.srand(hs((seed || 11) * 7 + 3)));
    lightPass(T, g);
    if (acc) acc();
    const fores = [], rd = G.srand((seed || 11) + 5);
    for (const d of g.doors) { const f = T.door(g, d, rd); if (f) fores.push(f); emblem(g, d); }
    c = fore;
    for (const f of fores) f();
    if (T.fore) T.fore(g, G.srand((seed || 11) + 9));
    ambSetup(T, g, seed);
    const fgr = fgBuild(T, g, G.srand(hs((seed || 11) + 17)));
    return { base: base.canvas, fore: fore.canvas, fg: fgr.cv, fgCl: fgr.cl, g, T };
  }
  // ---------- Giai đoạn 2: điểm nhấn thị giác của phòng (một món, ở một góc trên, không đụng lối cửa) ----------
  // Lập kế hoạch trước lightPass (để quầng sáng của nó được tô xuống sàn), vẽ sau lightPass (để vật vẫn sáng rõ).
  // Rừng già: cột nắng xuyên tán lá hoặc gốc cây cổ thụ phủ rêu có nấm sáng. Hang biển: cụm tinh thể lớn hoặc tia sáng từ khe trần
  // rọi xuống vũng nước. Lâu đài cổ: lò than (lửa động) hoặc tượng đá vỡ có nến hai bên. Chỉ là hình vẽ: không va chạm, không đổi luật.
  function shaftAt(g, rn) {
    const tops = g.doors.filter((d) => d.side === 'top').map((d) => d.at);
    for (let k = 0; k < 12; k++) {
      const bx = Math.round(g.fx0 + 46 + rn() * (g.fx1 - g.fx0 - 70));
      if (!tops.some((t) => Math.abs(t - bx) < 36 && Math.abs(t - (bx - 24)) < 40) && Math.abs(bx - 24 - g.cx) > 18) return bx;
    }
    return g.accSide < 0 ? g.fx0 + 52 : g.fx1 - 20;
  }
  // Cột sáng (nắng/ánh trần): hình thang từ nóc tường xuống một vệt trên sàn, làm sáng bằng lưới chấm (một nửa số điểm ảnh), cạnh sắc.
  function shaft(g, bx, col, a) {
    const yt = g.fy0 - g.wh - g.cap + 2, yb = g.fy0 + 44, lc = hex(col);
    const y0 = Math.max(0, yt), id = c.getImageData(0, y0, g.W, yb - y0 + 1), d = id.data;
    for (let y = y0; y <= yb; y++) {
      const q = (y - yt) / (yb - yt), xl = Math.round(bx - 7 - q * 30), xr = Math.round(bx + 7 - q * 22);
      const al = a * (0.55 + 0.45 * q) * (y > yb - 6 ? (yb - y) / 6 : 1);
      for (let x = Math.max(0, xl); x <= Math.min(g.W - 1, xr); x++) {
        const edge = Math.min(x - xl, xr - x), th = edge < 2 ? 0.25 : 0.62; // mép cột thưa chấm hơn
        if (bay(x, y) > th) continue;
        const o = ((y - y0) * g.W + x) * 4;
        d[o] += (lc[0] - d[o]) * al; d[o + 1] += (lc[1] - d[o + 1]) * al; d[o + 2] += (lc[2] - d[o + 2]) * al;
      }
    }
    c.putImageData(id, 0, y0);
  }
  function accentPlan(T, g, rn) {
    const side = g.accSide, cx0 = side < 0 ? g.fx0 + 22 : g.fx1 - 22, cy0 = g.fy0 + 18, kind = rn() < 0.5 ? 0 : 1;
    if (T.reg === 0) {
      if (kind === 0) {
        const bx = shaftAt(g, rn), sx = bx - 26, sy = g.fy0 + 44;
        g.glows.push({ x: sx, y: sy, rx: 30, ry: 14, a: 0.22, col: '#f4f8b8' });
        if (g.amb) for (let i = 0; i < 5; i++) g.amb.push({ k: 'beam', bx, y0: g.fy0 - g.wh, y1: sy, ph: rn() * 20, sp: 0.6 + rn() * 0.6 });
        return () => {
          shaft(g, bx, '#f0f4c0', 0.2);
          for (let i = 0; i < 4; i++) { const x = sx + ri(rn, -12, 12), y = sy + ri(rn, -5, 5); r(x, y + 1, 1, 2, F.grassM); r(x - 1, y, 3, 1, '#f0ecd0'); r(x, y - 1, 1, 3, '#f0ecd0'); r(x, y, 1, 1, '#f0c050'); }
        };
      }
      const x = cx0, y = cy0 + 4;
      g.casts.push({ x: x - 10, y: y + 1, w: 20, len: 7, a: 0.36 });
      return () => { // gốc cổ thụ: vòng tuổi, vỏ có khối sáng tối, rêu phủ, dương xỉ (không có nấm: khỏi lẫn với nấm độc bấm được)
        ell(x, y + 2, 14, 4, 'rgba(0,0,0,0.35)');
        r(x - 12, y - 10, 24, 13, DARK); r(x - 11, y - 9, 22, 11, F.bark); r(x - 11, y - 9, 4, 11, F.barkL); r(x + 6, y - 9, 5, 11, F.barkD);
        for (let i = 0; i < 4; i++) r(x - 6 + i * 4, y - 6 + (i % 2) * 3, 1, 5, F.barkD);
        r(x - 11, y - 13, 22, 4, '#8a6a44'); r(x - 10, y - 14, 20, 1, '#a8885a'); r(x - 6, y - 12, 12, 1, '#6a4e30'); r(x - 2, y - 12, 4, 1, '#c8a060');
        r(x - 12, y - 14, 8, 3, F.moss); r(x - 11, y - 15, 5, 1, F.mossL); r(x - 13, y - 6, 3, 6, F.moss); r(x + 9, y - 3, 4, 4, F.moss);
        for (const [dx, dy] of [[-15, 1], [14, 0], [-4, 3]]) { r(x + dx, y + dy - 1, 5, 2, F.barkD); r(x + dx, y + dy - 1, 3, 1, F.bark); }
        for (const [dx, dir] of [[13, 1], [-15, -1]]) for (let k = 0; k < 8; k++) { const xx = x + dx + dir * Math.round(k * 0.5), yy = y + 1 - k; r(xx, yy, 1, 1, F.grassM); if (k % 2) r(xx + dir, yy, 1, 1, F.grassD); }
        r(x - 3, y - 13, 1, 1, '#f0ecd0'); r(x - 4, y - 12, 3, 1, '#f0ecd0'); r(x - 3, y - 12, 1, 1, '#e0a440');
      };
    }
    if (T.reg === 1) {
      if (kind === 0) { // mỏ neo cũ cắm nghiêng xuống sàn, xích, rong biển, vỏ sò
        const x = cx0, y = cy0 + 6;
        g.casts.push({ x: x - 4, y: y + 1, w: 9, len: 9, a: 0.32 });
        const IR = '#4a5560', IRL = '#7a8894', RU = '#7a4a2a';
        return () => {
          ell(x, y + 2, 12, 3, 'rgba(0,0,0,0.35)');
          ell(x, y + 1, 9, 3, C.ground[0]); // chỗ đất lõm quanh neo
          for (let k = 0; k < 20; k++) { const xx = x - 2 + Math.round(k * 0.2), yy = y - k; r(xx - 1, yy, 4, 1, DARK); r(xx, yy, 2, 1, k % 5 === 2 ? RU : IR); r(xx, yy, 1, 1, IRL); }
          r(x - 7, y - 3, 15, 2, DARK); r(x - 6, y - 3, 13, 1, IR); r(x - 6, y - 3, 13, 1, IRL); r(x - 8, y - 6, 2, 4, IR); r(x + 7, y - 6, 2, 4, IR); r(x - 8, y - 7, 1, 1, IRL); r(x + 8, y - 7, 1, 1, IRL);
          r(x + 1, y - 22, 5, 5, DARK); r(x + 2, y - 21, 3, 3, IR); r(x + 3, y - 20, 1, 1, DARK); r(x - 3, y - 17, 11, 2, IR); r(x - 3, y - 17, 11, 1, IRL);
          for (let k = 0; k < 7; k++) { const xx = x + 6 + k * 2, yy = y - 18 + k * 3; r(xx, yy, 2, 2, k % 2 ? IR : IRL); }
          for (let k = 0; k < 9; k++) { r(x - 9 + Math.round(Math.sin(k * 0.9)), y - k, 1, 1, '#2f6a50'); r(x + 10 + Math.round(Math.sin(k * 0.8 + 1)), y - k * 0.8, 1, 1, '#3a7a5a'); }
          r(x + 12, y + 1, 4, 3, '#d8c8b0'); r(x + 13, y + 1, 2, 1, '#f0e8d8'); r(x + 12, y + 3, 4, 1, '#9a8a74');
        };
      }
      const bx = shaftAt(g, rn), sx = bx - 26, sy = g.fy0 + 44;
      g.glows.push({ x: sx, y: sy, rx: 28, ry: 13, a: 0.2, col: '#bfefff' });
      if (g.amb) {
        g.amb.push({ k: 'pud', x: sx, y: sy, rx: 12, ry: 5, ph: rn() * 9, big: 1 });
        for (let i = 0; i < 4; i++) g.amb.push({ k: 'beam', bx, y0: g.fy0 - g.wh, y1: sy, ph: rn() * 20, sp: 0.5 + rn() * 0.5, col: '#d8f6ff' });
      }
      return () => {
        shaft(g, bx, '#cfefff', 0.16);
        ell(sx, sy + 1, 15, 7, C.ground[0]); ell(sx, sy, 14, 6, C.waterD); ell(sx, sy - 1, 12, 5, C.water); r(sx - 5, sy - 3, 6, 1, C.waterL); r(sx + 2, sy, 4, 1, rgba(C.waterL, 0.6));
      };
    }
    if (kind === 0) { // cửa sổ kính màu trên cao rọi một cột nắng ấm xuống sàn, vệt sáng có ô màu của kính
      const bx = shaftAt(g, rn), sx = bx - 26, sy = g.fy0 + 44, wy = g.fy0 - g.wh;
      g.glows.push({ x: sx, y: sy, rx: 30, ry: 14, a: 0.22, col: '#ffd8a0' });
      if (g.amb) {
        g.amb.push({ k: 'win', x: bx, y: wy + 6, ph: rn() * 9 });
        for (let i = 0; i < 5; i++) g.amb.push({ k: 'beam', bx, y0: wy + 10, y1: sy, ph: rn() * 20, sp: 0.5 + rn() * 0.5, col: '#ffe6b8' });
      }
      return () => {
        r(bx - 7, wy + 4, 14, 22, DARK); r(bx - 6, wy + 5, 12, 20, '#2a3a5a');
        for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) r(bx - 5 + i * 6, wy + 6 + j * 5, 4, 4, ['#d8823a', '#a8402a', '#4a7ab0', '#c8a040'][(i + j) % 4]);
        r(bx - 1, wy + 5, 1, 20, DARK); r(bx - 6, wy + 15, 12, 1, DARK); r(bx - 7, wy + 3, 14, 1, K.stoneL); r(bx - 8, wy + 26, 16, 2, K.stone); r(bx - 8, wy + 26, 16, 1, K.stoneL);
        shaft(g, bx, '#ffe2b0', 0.17);
        for (let j = -1; j <= 1; j++) for (let i = -2; i <= 1; i++) { const x = sx + i * 7 + j * 2, y = sy + j * 4; if ((i + j + 9) % 3 === 0) r(x, y, 3, 2, rgba(['#ffb060', '#ff8a6a', '#8ab8ff'][(i + 9) % 3], 0.18)); }
      };
    }
    const x = cx0, y = cy0 + 8;
    g.glows.push({ x: x - 10, y: y - 2, rx: 14, ry: 8, a: 0.14, col: '#ffc070' }, { x: x + 10, y: y - 2, rx: 14, ry: 8, a: 0.14, col: '#ffc070' });
    g.lights.push({ k: 'candle', x: x - 10, y: y - 7 }, { k: 'candle', x: x + 10, y: y - 7 });
    g.casts.push({ x: x - 6, y: y + 1, w: 12, len: 9, a: 0.38 });
    return () => { // tượng hiệp sĩ đá đã vỡ trên bệ, rêu ở chân, hai cây nến
      ell(x, y + 2, 11, 3, 'rgba(0,0,0,0.35)');
      r(x - 8, y - 6, 16, 8, DARK); r(x - 7, y - 5, 14, 6, K.stone); r(x - 7, y - 5, 14, 1, K.stoneL); r(x + 4, y - 4, 3, 5, dim(K.stone, 0.3));
      r(x - 5, y - 24, 10, 19, DARK); r(x - 4, y - 23, 8, 18, K.stone); r(x - 4, y - 23, 2, 18, K.stoneL); r(x + 2, y - 23, 2, 18, dim(K.stone, 0.3));
      r(x - 3, y - 29, 6, 6, DARK); r(x - 2, y - 28, 4, 5, K.stone); r(x - 2, y - 28, 1, 5, K.stoneL); r(x + 1, y - 29, 2, 2, K.void); // đầu sứt một góc
      r(x - 7, y - 21, 3, 9, K.stone); r(x - 7, y - 21, 1, 9, K.stoneL); r(x + 4, y - 18, 2, 10, dim(K.stone, 0.15)); r(x + 5, y - 26, 1, 16, K.ironL);
      r(x - 7, y, 5, 2, '#3f5a34'); r(x - 6, y, 2, 1, '#5f8046'); r(x + 9, y + 1, 4, 1, '#d8d0bc');
      for (const dx of [-10, 10]) { r(x + dx - 1, y - 6, 2, 6, '#e8e0c8'); r(x + dx - 2, y - 1, 4, 2, K.iron); }
    };
  }

  // ---------- Giai đoạn 2: tiền cảnh mép dưới (gần người xem nhất, tối, che rất ít) ----------
  // Hai cụm ở hai góc dưới, đè lên viền tường trước và lấn vào sàn vài điểm ảnh. Vẽ vào canvas riêng; khi em bé (hoặc quái)
  // đi vào sau cụm thì cụm mờ dần còn khoảng 35% (xem roomFore).
  const FG = {
    0: { d: '#08130b', m: '#112317', l: '#1c3622', rim: '#335a36' },
    1: { d: '#05090e', m: '#0e1823', l: '#182838', rim: '#36587a' },
    2: { d: '#0c0809', m: '#1e1717', l: '#2c2322', rim: '#5a4840' },
  };
  function fgBuild(T, g, rn) {
    const fg = mk(g.W, g.H), pv = c, P = FG[T.reg], cl = [];
    c = fg;
    for (const side of [-1, 1]) {
      const bx = side < 0 ? g.fx0 - g.sw + 2 : g.fx1 + g.sw - 2, by = g.fy1 + g.fw;
      const w = ri(rn, 30, 40), x0 = side < 0 ? bx - 4 : bx - w + 4;
      if (T.reg === 0) { // bụi dương xỉ, lá to
        for (let i = 0; i < 6; i++) {
          const x = x0 + 4 + rn() * (w - 8), y = by - 5 - rn() * 14, rx = ri(rn, 6, 10), ry = ri(rn, 4, 7);
          ell(x, y + 1, rx, ry, P.d); ell(x, y, rx - 1, ry - 1, P.m); ell(x - side * 1, y - 2, rx * 0.6, ry * 0.45, P.l); r(x - 2, y - ry + 1, 4, 1, P.rim);
        }
        for (let i = 0; i < 3; i++) { // lá dương xỉ chĩa lên
          const x = x0 + w * (0.25 + 0.25 * i), len = ri(rn, 10, 16), dir = side * (i === 1 ? 0.2 : 0.5);
          for (let k = 0; k < len; k++) { const xx = x + dir * k * 0.6, yy = by - 10 - k; r(xx, yy, 1, 1, P.l); if (k % 3 === 1) { r(xx - 2, yy + 1, 2, 1, P.m); r(xx + 1, yy + 1, 2, 1, P.m); } }
          r(x + dir * len * 0.6, by - 10 - len, 1, 1, P.rim);
        }
      } else if (T.reg === 1) { // tảng đá tối và măng đá, chóp có ánh lam
        for (let i = 0; i < 4; i++) {
          const x = x0 + 5 + rn() * (w - 10), y = by - 4 - rn() * 10, rx = ri(rn, 6, 11), ry = ri(rn, 4, 7);
          ell(x, y, rx, ry, P.d); ell(x - side, y - 1, rx - 2, ry - 2, P.m); r(x - rx * 0.5, y - ry + 1, rx * 0.8, 1, P.rim);
        }
        for (let i = 0; i < 2; i++) { const x = x0 + w * (0.3 + 0.35 * i), h = ri(rn, 12, 20); spike(x + 1, by - 4, 7, h + 1, -1, P.d); spike(x, by - 4, 5, h, -1, P.m, P.rim); }
      } else { // chân cột gãy có rãnh, đá vụn tròn cạnh, một mảnh gạch nghiêng
        const px = x0 + (side < 0 ? 8 : w - 22), ph = ri(rn, 22, 28);
        r(px - 1, by - ph - 1, 16, ph + 1, P.d); r(px, by - ph, 14, ph, P.m); r(px, by - ph, 3, ph, P.l); r(px + 11, by - ph, 3, ph, P.d);
        for (let k = 5; k < 11; k += 3) r(px + k, by - ph + 3, 1, ph - 4, P.d);
        for (let k = 0; k < 14; k += 2) r(px + k, by - ph - 1 - (k * 7 % 4), 2, 2 + (k * 7 % 4), P.m); // mặt gãy lởm chởm
        r(px + 1, by - ph - 2, 4, 1, P.rim); r(px + 8, by - ph - 3, 3, 1, P.rim);
        for (let i = 0; i < 5; i++) { const x = x0 + 4 + rn() * (w - 10), y = by - 2 - rn() * 7, rx = ri(rn, 3, 6); ell(x, y + 1, rx + 1, rx * 0.7 + 1, P.d); ell(x, y, rx, rx * 0.7, P.m); r(x - rx * 0.5, y - rx * 0.7 + 1, rx, 1, P.rim); }
      }
      cl.push({ x0: Math.max(0, x0 - 4), x1: Math.min(g.W, x0 + w + 4), y0: by - 36, y1: g.H, a: 1 });
    }
    c = pv;
    return { cv: fg.canvas, cl };
  }

  // ---------- Giai đoạn 2: ánh sáng sàn và hậu cảnh (vẽ một lần lúc dựng phòng, nằm trong nền đã nhớ) ----------
  // Sàn: giữa phòng (khu đánh nhau) sáng nhẹ theo màu đèn của vùng, rìa trầm hơn nhưng không đen kịt; tường đổ bóng xuống sàn
  // (ánh sáng chếch từ phía trên bên phải: bóng tường sau dày nhất, tường trái dày hơn tường phải); quầng đuốc/tinh thể/nấm
  // hắt xuống sàn. Mọi nấc sáng tối tô bằng lưới chấm. Sàn được giảm độ đậm màu một chút để em bé và quái nổi lên.
  function lightPass(T, g) {
    const x0 = g.fx0, y0 = g.fy0, w = g.fx1 - g.fx0, h = g.fy1 - g.fy0;
    const id = c.getImageData(x0, y0, w, h), d = id.data;
    const cx = (g.fx0 + g.fx1) / 2, cy = (g.fy0 + g.fy1) / 2 + 6, rx = w * 0.5, ry = h * 0.5;
    const LC = hex(T.light), glows = (g.glows || []).map((o) => Object.assign({ c: hex(o.col) }, o)), casts = g.casts || [];
    const STEP = 0.05, SAT = T.sat || 0.86, sh = T.shade, CL = T.centerLight || 0.09, ED = T.edgeDark || 0.16;
    for (let y = 0; y < h; y++) {
      const gy = y0 + y, dt = gy - g.fy0, db = g.fy1 - 1 - gy;
      for (let x = 0; x < w; x++) {
        const gx = x0 + x, o = (y * w + x) * 4;
        const e = Math.hypot((gx - cx) / rx, (gy - cy) / ry);
        const kc = CL * (1 - smooth(0.2, 1.0, e));
        let k = kc - ED * smooth(0.6, 1.3, e), kp = kc, tr = LC[0] * kc, tg = LC[1] * kc, tb = LC[2] * kc;
        const dl = gx - g.fx0, dr = g.fx1 - 1 - gx;
        let s = 0;
        if (dt < sh[0]) s = 0.55 * (1 - dt / sh[0]);
        if (dl < sh[1]) s = Math.max(s, 0.42 * (1 - dl / sh[1]));
        if (dr < sh[2]) s = Math.max(s, 0.36 * (1 - dr / sh[2]));
        if (db < sh[3]) s = Math.max(s, 0.3 * (1 - db / sh[3]));
        for (const q of casts) { // bóng đổ của cột, thân cây...: hình bình hành ngả về bên trái phía dưới
          const u = gy - q.y;
          if (u < 0 || u >= q.len) continue;
          const xl = q.x - u * 0.6;
          if (gx >= xl && gx < xl + q.w) s = Math.max(s, q.a * (1 - u / q.len * 0.5));
        }
        k -= s;
        for (const L of glows) {
          const q = Math.hypot((gx - L.x) / L.rx, (gy - L.y) / L.ry);
          if (q >= 1) continue;
          const a = L.a * (1 - q) * (1 - q * 0.5);
          k += a; kp += a; tr += L.c[0] * a; tg += L.c[1] * a; tb += L.c[2] * a;
        }
        const qk = Math.floor(sharp(k / STEP) + bay(gx, gy)) * STEP;
        let R = d[o], Gc = d[o + 1], B = d[o + 2];
        const lum = R * 0.3 + Gc * 0.59 + B * 0.11;
        R = lum + (R - lum) * SAT; Gc = lum + (Gc - lum) * SAT; B = lum + (B - lum) * SAT;
        if (qk < 0) { const m = Math.max(0, 1 + qk); R *= m; Gc *= m; B *= m; }
        else if (qk > 0 && kp > 0) {
          const f = (qk / kp) * 0.55;
          R = R * (1 + qk * 0.35) + tr * f; Gc = Gc * (1 + qk * 0.35) + tg * f; B = B * (1 + qk * 0.35) + tb * f;
        }
        d[o] = R > 255 ? 255 : R; d[o + 1] = Gc > 255 ? 255 : Gc; d[o + 2] = B > 255 ? 255 : B;
      }
    }
    c.putImageData(id, x0, y0);
  }
  // Hậu cảnh (tường sau, thân cây, vách hang): trầm dần lên phía trên và hơi ngả về màu khoảng tối của vùng,
  // để mắt dồn vào sàn. Đồ sáng (đuốc, nấm, tinh thể, cửa sổ) vẽ sau lượt này nên vẫn là điểm nhấn.
  function backPass(T, g) {
    const x0 = Math.max(0, g.fx0 - g.sw), y0 = Math.max(0, g.fy0 - g.wh - g.cap), w = Math.min(g.W, g.fx1 + g.sw) - x0, h = g.fy0 - y0;
    const id = c.getImageData(x0, y0, w, h), d = id.data, V = hex(T.voidCol || '#000000'), STEP = 0.06;
    for (let y = 0; y < h; y++) {
      const gy = y0 + y, up = 1 - smooth(0, 1, y / h); // 1 ở nóc tường, 0 ở chân tường
      for (let x = 0; x < w; x++) {
        const gx = x0 + x, o = (y * w + x) * 4;
        const a = Math.floor(sharp((0.1 + 0.32 * up) / STEP) + bay(gx, gy)) * STEP;
        let R = d[o], Gc = d[o + 1], B = d[o + 2];
        const lum = R * 0.3 + Gc * 0.59 + B * 0.11;
        R = lum + (R - lum) * 0.82; Gc = lum + (Gc - lum) * 0.82; B = lum + (B - lum) * 0.82;
        d[o] = R + (V[0] - R) * a; d[o + 1] = Gc + (V[1] - Gc) * a; d[o + 2] = B + (V[2] - B) * a;
      }
    }
    c.putImageData(id, x0, y0);
  }

  const cache = new Map();
  function get(W) {
    const doors = W.doors || [];
    const key = [W.uid, W.region, W.type, W.seed, doors.map((d) => d.dir + (d.open ? 1 : 0) + (d.gate ? 'g' : '') + (d.boss ? 'b' : '')).join(',')].join('|');
    let room = cache.get(key);
    if (!room) {
      const g = Object.assign({}, W.geo, { type: W.type, variant: W.variant || 0 });
      g.doors = doors.map((d) => ({ side: SIDE_OF[d.dir], dir: d.dir, at: d.dir === 'up' || d.dir === 'down' ? g.cx : g.cy, state: d.open ? 'open' : 'locked', gate: !!d.gate, boss: !!d.boss }));
      building = true;
      try { room = buildRoom(THEMES[W.region] || Castle, g, W.seed); } finally { building = false; }
      if (cache.size >= 4) cache.delete(cache.keys().next().value);
      cache.set(key, room);
    }
    return room;
  }
  RA.get = get;
  RA.cache = cache;

  // ---------- chuyển động môi trường theo vùng (VFX Phase 4) ----------
  // Chỉ những thứ hợp vùng: Rừng già có đom đóm, phấn hoa, lá rơi, cỏ lay, nấm sáng thở; Hang biển có vũng nước gợn,
  // giọt nhũ đá rơi, sương mỏng trôi sát sàn, tinh thể sáng nhịp; Lâu đài cổ có quầng đuốc chập chờn và bụi bay trong ánh lửa.
  // Hai lớp hạt khác tốc độ (xa chậm và mờ, gần nhanh hơn và rõ hơn) tạo chiều sâu. Mức chuyển động thấp để dành chú ý cho trận đánh.
  // Phần tĩnh vẫn nằm trong nền vẽ sẵn; ở đây chỉ vài chục ô vuông nhỏ mỗi khung hình. Cường độ theo G.VFX.moiTruong (0 = tắt).
  const ACOL = new Map();
  function acol(hexCol, a) { // chuỗi màu rgba dùng lại (chia 24 nấc độ trong) để khỏi tạo chuỗi mới mỗi khung hình
    const q = Math.max(0, Math.min(24, Math.round(a * 24))), key = hexCol + q;
    let v = ACOL.get(key);
    if (!v) { v = rgba(hexCol, (q / 24).toFixed(3)); ACOL.set(key, v); }
    return v;
  }
  function ambSetup(T, g, seed) {
    const rn = G.srand((seed || 11) * 31 + 23), A2 = (g.amb = g.amb || []);
    const wy = g.fy0 - g.wh, fw = g.fx1 - g.fx0, fh = g.fy1 - g.fy0;
    const mote = (layer, n, col, y0, y1) => { for (let i = 0; i < n; i++) A2.push({ k: 'mote', layer, x: g.fx0 + rn() * fw, y: y0 + rn() * (y1 - y0), ph: rn() * 20, sp: 0.6 + rn() * 0.8, col }); };
    if (T.reg === 0) {
      mote(0, 6, '#e8f0b0', wy + 6, g.fy0 + 26); // phấn hoa trôi chậm trước thân cây
      for (let i = 0; i < 6; i++) A2.push({ k: 'fly', x: g.fx0 + 10 + rn() * (fw - 20), y: g.fy0 + 16 + rn() * (fh - 40), ph: rn() * 20, sp: 0.7 + rn() * 0.6 });
      for (let i = 0; i < 3; i++) A2.push({ k: 'leaf', x: g.fx0 + 16 + rn() * (fw - 32), y1: g.fy0 + 14 + rn() * (fh - 30), ph: rn() * 30, per: 9 + rn() * 5, col: ['#a04a26', '#8a6a2e', '#b88a34'][i % 3] });
      // sương rìa: sát tường sau và hai bên, nhạt, chậm
      A2.push({ k: 'emist', y: g.fy0 + 3, h: 6, len: 60, sp: 3, ph: rn() * 90, col: F.mist }, { k: 'emist', y: g.fy1 - 9, h: 6, len: 54, sp: 2.4, ph: rn() * 90, col: F.mist });
      A2.push({ k: 'emist', v: 1, x: g.fx0 + 1, w: 9, len: 50, sp: 2.2, ph: rn() * 90, col: F.mist }, { k: 'emist', v: 1, x: g.fx1 - 10, w: 9, len: 46, sp: 2.8, ph: rn() * 90, col: F.mist });
      for (let i = 0; i < 12; i++) { const left = i % 2 === 0; A2.push({ k: 'tuft', x: left ? g.fx0 + 3 + rn() * 12 : g.fx1 - 4 - rn() * 12, y: g.fy0 + 14 + rn() * (fh - 22), h: 3 + Math.floor(rn() * 3), ph: rn() * 6 }); }
    } else if (T.reg === 1) {
      mote(0, 5, '#bfe9f4', wy + 4, g.fy0 + 20); // hạt sáng li ti trong hơi ẩm
      mote(1, 5, '#d8f6ff', g.fy0 + 20, g.fy1 - 8);
      for (let i = 0; i < 3; i++) A2.push({ k: 'mist', y: g.fy0 + 24 + i * Math.round((fh - 40) / 3) + rn() * 10, h: 7 + Math.floor(rn() * 4), ph: rn() * 90, sp: 2 + rn() * 2.5 });
    } else {
      mote(0, 5, '#ffd9a0', wy + 2, g.fy0 + 16); // bụi bay trong ánh đuốc
      mote(1, 6, '#ffe6b8', g.fy0 + 10, g.fy1 - 10);
    }
  }
  function ambLive(room, t) {
    const M = G.VFX ? +G.VFX.moiTruong : 1;
    if (!(M > 0)) return;
    const g = room.g, list = g.amb;
    if (!list) return;
    const fx0 = g.fx0, fx1 = g.fx1, fy0 = g.fy0, fy1 = g.fy1, fw = fx1 - fx0;
    for (const a of list) {
      switch (a.k) {
        case 'mote': { // lớp xa (0): chậm, mờ; lớp gần (1): nhanh hơn, rõ hơn
          const v = a.layer ? 4.5 : 2.2, amp = a.layer ? 5 : 3;
          let x = a.x + ((t * v * a.sp + a.ph * 13) % fw);
          if (x > fx1) x -= fw;
          const y = a.y + Math.sin(t * 0.6 * a.sp + a.ph) * amp, k = 0.5 + 0.5 * Math.sin(t * 1.1 * a.sp + a.ph * 2);
          r(x, y, 1, 1, acol(a.col, (a.layer ? 0.55 : 0.32) * k * M));
          break;
        }
        case 'fly': { // đom đóm: lượn chậm, sáng tắt theo nhịp riêng
          const x = a.x + Math.sin(t * 0.45 * a.sp + a.ph) * 14, y = a.y + Math.sin(t * 0.7 * a.sp + a.ph * 1.7) * 7;
          const k = Math.sin(t * 1.6 * a.sp + a.ph);
          if (k < -0.2) break;
          const b = (0.3 + 0.7 * Math.max(0, k)) * M;
          r(x - 1, y - 1, 3, 3, acol('#d2ff78', 0.18 * b)); r(x, y, 1, 1, acol('#f4ffb0', 0.95 * b));
          break;
        }
        case 'leaf': { // lá rơi từ tán xuống, đung đưa, nằm lại trên sàn rồi mờ đi
          const u = (t + a.ph) % a.per, fall = 6.5;
          const y0 = fy0 - g.wh - 2;
          if (u < fall) {
            const q = u / fall, y = y0 + (a.y1 - y0) * q, x = a.x + Math.sin(u * 1.9 + a.ph) * 6 * M;
            const flip = Math.floor(u * 3 + a.ph) % 2;
            r(x, y, flip ? 2 : 1, flip ? 1 : 2, a.col);
          } else if (u < fall + 1.6) {
            const q = (u - fall) / 1.6;
            r(a.x + Math.sin(fall * 1.9 + a.ph) * 6 * M, a.y1, 2, 1, acol(a.col, 1 - q));
          }
          break;
        }
        case 'tuft': { // khóm cỏ sát tường lay theo một làn gió chạy ngang phòng
          const wv = Math.sin(t * 1.4 - a.x * 0.045 + a.ph * 0.2) * M, dx = wv > 0.55 ? 1 : wv < -0.75 ? -1 : 0;
          r(a.x, a.y - a.h + 1, 1, a.h - 1, F.moss); r(a.x + dx, a.y - a.h, 1, 1, F.mossL);
          r(a.x + 2, a.y - a.h + 2, 1, a.h - 2, F.leafL); r(a.x + 2 + dx, a.y - a.h + 1, 1, 1, F.leafH);
          r(a.x - 2, a.y - a.h + 3, 1, a.h - 3, F.moss); r(a.x - 2 + dx, a.y - a.h + 2, 1, 1, F.leafL);
          break;
        }
        case 'shroom': { // nấm sáng "thở" chậm, thỉnh thoảng nhả một hạt bào tử
          const k = 0.5 + 0.5 * Math.sin(t * 1.2 + a.ph);
          ell(a.x, a.y + 3, 8 + k * 2, 4 + k, acol('#b0f070', (0.03 + 0.05 * k) * M));
          const u = (t * 0.3 + a.ph) % 1;
          if (u < 0.6) r(a.x + Math.sin(u * 9 + a.ph) * 2, a.y - 3 - u * 22, 1, 1, acol('#d0f8a0', 0.7 * (1 - u / 0.6) * M));
          break;
        }
        case 'pud': { // vũng nước: thỉnh thoảng có vòng gợn lan ra, vệt sáng trên mặt nước khẽ trôi
          const P = a.big ? 2.6 : 4 + (a.ph % 2), u = (t + a.ph) % P;
          if (u < 1.3) {
            const q = u / 1.3, rx = 1.5 + q * a.rx * 0.75, ry = Math.max(1, rx * (a.ry / a.rx)), col = acol('#8fd0ea', 0.55 * (1 - q) * M);
            const n = Math.max(8, Math.round(rx * 1.6));
            for (let i = 0; i < n; i++) { const an = (i / n) * 6.2832; r(a.x + Math.cos(an) * rx, a.y + Math.sin(an) * ry, 1, 1, col); }
          }
          const sx = Math.round(Math.sin(t * 0.5 + a.ph) * a.rx * 0.25);
          r(a.x - a.rx * 0.35 + sx, a.y - Math.max(1, a.ry * 0.4), Math.max(2, a.rx * 0.3), 1, acol('#d8f6ff', 0.35 * M));
          break;
        }
        case 'drip': { // giọt nước đọng ở chóp nhũ đá, rơi xuống chân vách và toé nhẹ
          const P = 3.2 / a.sp, u = (t + a.ph) % P, fallT = 0.42;
          if (u < P - fallT - 0.35) { if (u > P * 0.35) r(a.x, a.y, 1, u > P * 0.55 ? 2 : 1, acol('#9fdcff', 0.8)); }
          else if (u < P - 0.35) { const q = (u - (P - fallT - 0.35)) / fallT; r(a.x, a.y + (a.y1 - a.y) * q * q, 1, 2, '#9fdcff'); }
          else {
            const q = (u - (P - 0.35)) / 0.35, col = acol('#bfe9ff', 0.7 * (1 - q) * M);
            r(a.x - 1 - q * 3, a.y1 - 1 - (q < 0.5 ? q * 4 : (1 - q) * 4), 1, 1, col); r(a.x + 1 + q * 3, a.y1 - 1 - (q < 0.5 ? q * 4 : (1 - q) * 4), 1, 1, col);
            r(a.x - 1 - q * 4, a.y1, 2 + q * 8, 1, acol('#8fd0ea', 0.4 * (1 - q) * M));
          }
          break;
        }
        case 'cry': { // tinh thể chân vách sáng lên tối xuống rất chậm, chóp loé sáng
          const k = 0.5 + 0.5 * Math.sin(t * 0.9 + a.ph);
          ell(a.x, a.y, 5 * a.s + 2, 4 * a.s + 1, acol('#58c8ea', (0.03 + 0.06 * k) * M));
          if (((t * 0.5 + a.ph) % 4) < 0.18) { r(a.x, a.y - 4 * a.s - 3, 1, 3, '#ffffff'); r(a.x - 1, a.y - 4 * a.s - 2, 3, 1, '#ffffff'); }
          break;
        }
        case 'win': { // cửa sổ kính màu sáng ấm nhè nhẹ, vệt sáng hắt xuống sàn
          const k = 0.5 + 0.5 * Math.sin(t * 0.8 + a.ph) * (0.8 + 0.2 * Math.sin(t * 5.3 + a.ph));
          r(a.x - 5, a.y, 10, 18, acol('#ffd08a', (0.04 + 0.08 * k) * M));
          ell(a.x, fy0 + 10, 14 + k * 2, 6, acol('#ffb060', (0.03 + 0.03 * k) * M));
          break;
        }
        case 'beam': { // hạt bụi/phấn lấp lánh trôi chậm trong cột sáng
          const P = 7 / a.sp, u = ((t + a.ph) % P) / P, y = a.y0 + (a.y1 - a.y0) * u;
          const q = (y - (a.y0 - 7)) / (a.y1 - a.y0 + 7), x = a.bx - q * 26 + Math.sin(t * 0.8 + a.ph) * 4;
          r(x, y, 1, 1, acol(a.col || '#fbffd8', 0.75 * Math.sin(u * 3.1416) * M));
          break;
        }
        case 'emist': { // sương mỏng ở rìa phòng (Rừng già): dải ngắn trôi dọc theo tường, không đi qua giữa phòng
          const per = a.len + 40, off = (t * a.sp + a.ph) % per;
          if (a.v) { // dọc tường trái/phải
            for (let y = fy0 - per + off; y < fy1; y += per) { const y0 = Math.max(fy0 + 4, y), y1 = Math.min(fy1 - 4, y + a.len); if (y1 > y0) { r(a.x, y0, a.w, y1 - y0, acol(a.col, 0.05 * M)); r(a.x + (a.x < (fx0 + fx1) / 2 ? 0 : a.w - 3), y0 + 4, 3, Math.max(0, y1 - y0 - 8), acol(a.col, 0.04 * M)); } }
          } else {
            for (let x = fx0 - per + off; x < fx1; x += per) { const x0 = Math.max(fx0 + 2, x), x1 = Math.min(fx1 - 2, x + a.len); if (x1 > x0) { r(x0, a.y, x1 - x0, a.h, acol(a.col, 0.05 * M)); r(x0 + 6, a.y + 1, Math.max(0, x1 - x0 - 12), a.h - 2, acol(a.col, 0.035 * M)); } }
          }
          break;
        }
        case 'mist': { // dải sương mỏng trôi rất chậm sát mặt sàn
          const segW = 46, gap = 34, per = segW + gap;
          const off = (t * a.sp + a.ph) % per;
          for (let x = fx0 - per + off; x < fx1; x += per) {
            const x0 = Math.max(fx0 + 2, x), x1 = Math.min(fx1 - 2, x + segW);
            if (x1 <= x0) continue;
            r(x0, a.y, x1 - x0, a.h, acol('#cfe8f0', 0.05 * M));
            const i0 = Math.max(fx0 + 2, x + 8), i1 = Math.min(fx1 - 2, x + segW - 8);
            if (i1 > i0) r(i0, a.y + 2, i1 - i0, a.h - 4, acol('#e4f4f8', 0.045 * M));
          }
          break;
        }
      }
    }
    // quầng đuốc chập chờn (lâu đài): sáng tối không đều như lửa thật
    for (const l of g.lights) {
      if (l.k !== 'torch') continue;
      const f = 0.5 + 0.3 * Math.sin(t * 7.3 + l.x) + 0.2 * Math.sin(t * 12.7 + l.x * 1.7);
      ell(l.x, l.y - 5, 9 + f * 3, 8 + f * 2, acol('#ff9a40', (0.04 + 0.05 * f) * M));
      ell(l.x, fy0 + 12, 22 + f * 4, 10 + f * 2, acol('#ff9a40', (0.015 + 0.025 * f) * M));
    }
  }

  // ---------- lớp sống: lửa đuốc, mũi tên cửa mở, chỗ quái sắp hiện, nước dâng ----------
  function live(cx, W, room) {
    const g = room.g, t = G.time || 0, pv = c;
    c = cx;
    try {
      ambLive(room, t);
      for (const l of g.lights) {
        const f = Math.floor(t * 9 + l.x) % 3;
        if (l.k === 'torch') { r(l.x - 2 + (f === 1 ? 1 : 0), l.y - 9 - f, 3, 3, '#ff7a2a'); r(l.x - 1, l.y - 7 - (f === 2 ? 2 : 0), 2, 3, '#ffd23f'); r(l.x + (f - 1), l.y - 12 - f, 1, 1, '#ffd23f'); }
        else if (l.k === 'candle') { r(l.x - 1, l.y - (f === 0 ? 1 : 0), 2, 3, '#ffd23f'); r(l.x - 1, l.y + 1, 2, 1, '#ff7a2a'); r(l.x - 3, l.y - 2, 6, 6, 'rgba(255,200,80,0.10)'); }
        else if (l.k === 'twinkle') { if (Math.floor(t * 2 + l.x * 0.37) % 4 === 0) { r(l.x, l.y - 2, 1, 5, '#ffffff'); r(l.x - 2, l.y, 5, 1, '#ffffff'); } }
        else if (l.k === 'firefly') { const fx = l.x + Math.sin(t * 1.3 + l.x) * 7, fy = l.y + Math.cos(t * 1.7 + l.y) * 4; r(fx, fy, 1, 1, Math.floor(t * 3 + l.x) % 3 ? '#f8ffd0' : 'rgba(248,255,208,0.3)'); }
      }
      // mũi tên nhún nhảy ở cửa đang mở
      const bob = Math.floor(t * 4) % 2, col = room.T === Cave ? '#d8f6ff' : room.T === Forest ? '#f4ffb0' : '#ffe08a';
      for (const d of g.doors) {
        if (d.state !== 'open') continue;
        if (d.side === 'top') arrow0(d.at, g.fy0 + 9 - bob, 'up', col);
        else if (d.side === 'bottom') arrow0(d.at, g.fy1 - 9 + bob, 'down', col);
        else if (d.side === 'left') arrow0(g.fx0 + 8 - bob, d.at, 'left', col);
        else arrow0(g.fx1 - 9 + bob, d.at, 'right', col);
      }
      // nước dâng (trận Ngư Tinh): phủ phần sàn không còn đứng được
      const s = W.shrink;
      if (s) {
        const wc = 'rgba(50,130,185,0.62)', foam = 'rgba(220,245,255,0.8)', f = Math.floor(t * 3) % 2;
        const y0 = Math.round(s.y0), y1 = Math.round(s.y1), x0 = Math.round(s.x0 || 0);
        r(g.fx0, g.fy0, g.fx1 - g.fx0, y0 - g.fy0, wc); r(g.fx0, y1, g.fx1 - g.fx0, g.fy1 - y1, wc);
        for (let x = g.fx0 + 2; x < g.fx1 - 14; x += 24) { r(x + f * 3, y0 - 1, 14, 1, foam); r(x + 10 - f * 3, y1, 14, 1, foam); r(x + 6, y0 - 8 - f, 6, 1, 'rgba(220,245,255,0.3)'); r(x + 3, y1 + 7 + f, 6, 1, 'rgba(220,245,255,0.3)'); }
        if (x0 > g.fx0) { r(g.fx0, y0, x0 - g.fx0, y1 - y0, wc); for (let y = y0 + 2; y < y1; y += 8) r(x0 - 1, y + f * 2, 1, 5, foam); }
      }
      // chỗ quái sắp hiện ra: vệt tối loang dần, viền sáng theo màu chủ đề
      for (const sp of W.spawns || []) {
        if (sp.t > sp.t0) continue; // chưa tới lượt (đợt mọc lần lượt)
        const k = 1 - Math.max(0, sp.t) / sp.t0, rx = 4 + 7 * k + (sp.big ? 5 : 0);
        // vòng đỏ báo chỗ quái sắp mọc: viền nhấp nháy, lõi đầy dần
        const R0 = sp.big ? 22 : 16, bl = Math.floor(t * 10) % 2, BT = G.baoTruoc;
        if (BT && BT.on && !G.noRender) BT.add({ k: 'circle', x: sp.x, y: sp.y, r: R0, ky: 0.6, u: k, age: sp.t0 - Math.max(0, sp.t), el: null }); // vẽ mịn ở js/bao_truoc.js
        else {
          ell(sp.x, sp.y, R0, R0 * 0.6, bl ? 'rgba(255,58,34,0.30)' : 'rgba(255,120,90,0.22)');
          ell(sp.x, sp.y, R0 * k, R0 * 0.6 * k, 'rgba(255,70,40,0.28)');
        }
        ell(sp.x, sp.y, rx + 2, (rx + 2) * 0.7, rgba(room.T.light, 0.18 + 0.2 * k));
        ell(sp.x, sp.y, rx, rx * 0.7, 'rgba(8,4,10,0.75)');
        if (Math.floor(t * 12) % 2) ell(sp.x, sp.y, rx * 0.5, rx * 0.35, rgba(room.T.light, 0.35));
        if (k > 0.55) { const h = Math.round((k - 0.55) * 40); r(sp.x - 2, sp.y - h, 4, h, rgba(room.T.light, 0.5)); r(sp.x - 1, sp.y - h - 2, 2, 2, '#ffffff'); }
      }
    } finally { c = pv; }
  }

  // ---------- nối vào game: thay nền phòng và thêm vài đồ vật ----------
  const oldBg = A.bg, oldProp = A.prop;
  A.bg = function (cx, reg, seed, cam, width, shrink) {
    const W = G.getWorld ? G.getWorld() : null;
    if (!W || !W.geo) return oldBg.apply(this, arguments);
    try {
      const room = get(W);
      cx.drawImage(room.base, 0, 0);
      live(cx, W, room);
    } catch (e) {
      if (!A.roomErr) { A.roomErr = e; if (window.console) console.warn('room_art bg', e); }
      cx.fillStyle = '#120c0c'; cx.fillRect(0, 0, G.W, G.H);
    }
  };
  const PROPS = {
    // lớp phủ trước của phòng (song cửa dưới, măng đá, cỏ cao): vẽ sau nhân vật
    roomFore(o) {
      const W = G.getWorld ? G.getWorld() : null;
      if (!W || !W.geo) return;
      const room = get(W);
      c.drawImage(room.fore, 0, 0);
      // tiền cảnh: cụm nào có em bé hoặc quái đứng sau thì mờ dần còn 35%, đi ra thì hiện lại (khoảng 0,25 giây)
      const t = G.time || 0;
      for (const q of room.fgCl) {
        const hid = (e) => e && !e.dead && e.x > q.x0 - 6 && e.x < q.x1 + 6 && e.y > q.y0 - 2;
        const want = hid(W.P) || W.ents.some(hid) || (W.boss && hid(W.boss)) ? 0.35 : 1;
        const dt = Math.min(0.1, Math.max(0, t - (q.t || t)));
        q.t = t;
        q.a += Math.sign(want - q.a) * Math.min(Math.abs(want - q.a), dt * 2.6);
        const a = Math.round(q.a * 8) / 8;
        if (a <= 0) continue;
        const ga = c.globalAlpha;
        c.globalAlpha = ga * a;
        c.drawImage(room.fg, q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0, q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
        c.globalAlpha = ga;
      }
    },
    // bệ thử thách: cột đá có đồng hồ cát
    pedestal(o, x, y, t) {
      ell(x, y + 1, 12, 4, 'rgba(0,0,0,0.3)');
      r(x - 10, y - 5, 20, 6, DARK); r(x - 9, y - 4, 18, 4, '#5a6a70'); r(x - 9, y - 4, 18, 1, '#8aa0a4');
      r(x - 7, y - 16, 14, 12, DARK); r(x - 6, y - 15, 12, 11, '#6a7c82'); r(x - 6, y - 15, 2, 11, '#9ab0b4'); r(x + 4, y - 15, 2, 11, '#465458');
      r(x - 9, y - 19, 18, 4, DARK); r(x - 8, y - 18, 16, 2, '#8aa0a4'); r(x - 8, y - 18, 16, 1, '#c0d4d8');
      const live = !o.used, col = live ? '#4ad0c0' : '#5a6a70', f = Math.floor(t * 3) % 3;
      r(x - 5, y - 32, 10, 13, DARK); r(x - 4, y - 31, 8, 1, '#e8d8a0'); r(x - 4, y - 21, 8, 1, '#e8d8a0');
      r(x - 3, y - 30, 6, 3, col); r(x - 2, y - 27, 4, 1, col); r(x - 1, y - 26, 2, 1, col); r(x - 2, y - 25, 4, 1, col); r(x - 3, y - 24, 6, 3, col);
      if (live) { r(x - 2, y - 30, 3, 1, '#c8fff4'); r(x, y - 26 + f, 1, 1, '#ffffff'); ell(x, y - 26, 9, 9, 'rgba(74,208,192,0.10)'); }
    },
  };
  A.prop = function (cx, o) {
    const f = o && PROPS[o.type];
    if (!f) {
      if (o && o.dim) { // vật chưa dùng được (suối còn khóa): vẽ mờ
        cx.save(); cx.globalAlpha *= 0.38;
        try { return oldProp.apply(this, arguments); } finally { cx.restore(); }
      }
      return oldProp.apply(this, arguments);
    }
    const pv = c;
    c = cx;
    try { f(o, Math.round(o.x || 0), Math.round(o.y || 0), G.time || 0); } catch (e) {
      if (!A.roomErrP) { A.roomErrP = e; if (window.console) console.warn('room_art prop', e); }
    } finally { c = pv; }
  };
})();
