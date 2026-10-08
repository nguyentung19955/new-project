// Cảnh phòng và đồ vật (ghi đè G.art.bg và G.art.prop).
// Mỗi phòng là một gian kín: tường sau, hai tường bên có cửa, sàn có phối cảnh, mép trước tối.
// Phần tĩnh của phòng được vẽ một lần vào canvas ẩn rồi dán lại mỗi khung hình; chỉ lửa, nước, tia sáng là vẽ trực tiếp.
(function () {
  const G = window.G, A = G && G.art;
  if (!A) return;
  const oldBg = A.bg, oldProp = A.prop;
  const Y = G.GY0, H = G.H, LIP = 254; // mép tường gặp sàn, đáy màn hình, mép trước của sàn
  const SW = 38, HZ = 60, KP = 0.537; // bề rộng tường bên, đường chân trời, độ dốc phối cảnh
  const DL = 5, DR = SW - 7; // ô cửa trên tường bên, tính từ mép phòng vào
  const DARK = '#140d0e';

  // ---------- tiện ích ----------
  const MIX = new Map();
  function mix(a, b, k) {
    const key = a + b + k;
    let v = MIX.get(key);
    if (v) return v;
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const f = (s) => { const u = (x >> s) & 255, w = (y >> s) & 255; return Math.round(u + (w - u) * k); };
    v = '#' + ((1 << 24) | (f(16) << 16) | (f(8) << 8) | f(0)).toString(16).slice(1);
    if (MIX.size < 4000) MIX.set(key, v);
    return v;
  }
  const lite = (h, k) => mix(h, '#ffffff', k);
  const dim = (h, k) => mix(h, '#000000', k);
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  let c = null; // ngữ cảnh đang vẽ
  const r = (x, y, w, h, col) => {
    if (w <= 0 || h <= 0) return;
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  function ell(x, y, rx, ry, col) {
    x = Math.round(x); y = Math.round(y); ry = Math.max(1, Math.floor(ry));
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5))));
      if (hw > 0) c.fillRect(x - hw, y + dy, hw * 2, 1);
    }
  }
  // Nửa trên của elip (đống, vòm thấp), đáy ở y.
  function dome(x, y, rx, ry, col) {
    x = Math.round(x); y = Math.round(y);
    c.fillStyle = col;
    for (let dy = 1; dy <= ry; dy++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - ((dy - 0.5) * (dy - 0.5)) / (ry * ry))));
      if (hw > 0) c.fillRect(x - hw, y - dy, hw * 2, 1);
    }
  }
  function ln(x0, y0, x1, y1, col, t) {
    t = t || 1;
    c.fillStyle = col;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, t);
  }
  // Gai nhọn: dir 1 là thạch nhũ rủ xuống từ y, dir -1 là măng đá mọc lên từ y.
  function spike(x, y, w, h, dir, col, hi) {
    const n = Math.max(3, Math.round(h / 4)), sh = Math.ceil(h / n);
    for (let j = 0; j < n; j++) {
      const ww = Math.max(1, Math.round(w * (1 - j / n) * (1 - j / n * 0.3)));
      const x0 = Math.round(x - ww / 2), yy = dir > 0 ? y + Math.floor((j * h) / n) : y - Math.floor(((j + 1) * h) / n);
      r(x0, yy, ww, sh, col);
      if (hi && ww > 4) r(x0, yy, 2, sh, hi);
    }
  }
  // Ô cửa vòm: x là mép trái, yb là đáy.
  function arch(x, yb, w, h, col) {
    const rad = w / 2;
    c.fillStyle = col;
    for (let dy = 0; dy < h; dy++) {
      let hw = rad;
      if (dy < rad) hw = Math.round(Math.sqrt(Math.max(0, rad * rad - (rad - dy - 0.5) * (rad - dy - 0.5))));
      if (hw > 0) c.fillRect(Math.round(x + rad - hw), Math.round(yb - h + dy), hw * 2, 1);
    }
  }
  function glow(x, y, rx, ry, hex, a) {
    ell(x, y, rx, ry, rgba(hex, a));
    ell(x, y, rx * 0.66, ry * 0.66, rgba(hex, a));
    ell(x, y, rx * 0.33, ry * 0.33, rgba(hex, a * 1.5));
  }
  function bricks(x, y, w, h, bw, bh, cols, joint, rn, ruin) {
    r(x, y, w, h, joint);
    for (let j = 0, yy = y; yy < y + h; yy += bh, j++) {
      const off = (j % 2) * (bw >> 1) + ((j * 7) % 5);
      for (let xx = x - off; xx < x + w; xx += bw) {
        const k = rn(), col = cols[Math.floor(k * cols.length)];
        const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + bw - 1), hh = Math.min(bh - 1, y + h - yy);
        if (x1 <= x0) continue;
        if (rn() < ruin * 0.5) { r(x0, yy, x1 - x0, hh, dim(col, 0.45)); continue; } // viên gạch rơi mất
        r(x0, yy, x1 - x0, hh, col);
        if (k > 0.6) r(x0, yy, x1 - x0, 1, lite(col, 0.08));
        if (rn() < ruin) { const cx = x0 + 2 + Math.floor(rn() * Math.max(1, x1 - x0 - 6)); r(cx, yy + 2, 3, 1, joint); r(cx + 2, yy + 3, 1, hh - 4, joint); }
      }
    }
  }

  // ---------- bảng màu ----------
  const F = {
    void: '#0b1610', leafD: '#13291a', leafM: '#1d3d25', leafL: '#2f5f34', leafH: '#4c8a3e',
    bark: '#3b2d20', barkD: '#261c14', barkL: '#57432e', moss: '#3d6a2e', mossL: '#69994a',
    stone: '#586252', stoneD: '#3f483c', stoneL: '#77826c', floor: '#4a4433', light: '#e4f0a0',
  };
  const C = {
    void: '#0a121c', rock: '#22303f', rockD: '#141d29', rockL: '#34495c', wet: '#6f9ab8',
    cry: '#58c8ea', cryL: '#d8f6ff', cryD: '#2a7fae', floor: '#3f4853', water: '#1b4a66', waterD: '#123650', waterL: '#8fd0ea', light: '#9fe0f4',
  };
  const K = {
    void: '#120c0c', brick: '#4b3f3f', brickD: '#342a2b', brickL: '#5f504c', stone: '#6e5f58', stoneL: '#8a7a6e',
    wood: '#4a3020', woodD: '#2e1c12', woodL: '#6a4830', iron: '#55555e', ironL: '#8a8a96',
    red: '#7a2a2a', redD: '#4e1c20', gold: '#c89a3a', floor: '#544b49', light: '#ffc878',
  };
  // Chất liệu khung cửa, tường bên theo từng vùng.
  const TH = [
    { side: '#14251a', sideLine: '#1c3422', course: 9, frame: F.bark, frameHi: F.barkL, inner: '#060c08', light: F.light, lip: '#0c120c', floor: F.floor },
    { side: '#18222e', sideLine: '#0f1822', course: 14, frame: C.rockL, frameHi: '#4a6278', inner: '#05090e', light: C.light, lip: '#0a1018', floor: C.floor },
    { side: '#3a3031', sideLine: '#2a2223', course: 10, frame: K.stone, frameHi: K.stoneL, inner: '#0c0808', light: K.light, lip: '#141010', floor: K.floor },
  ];

  // ---------- vùng đã có vật trang trí ----------
  const keep = (R, x0, x1) => R.kept.push([x0, x1]);
  const free = (R, x0, x1) => !R.kept.some((k) => x0 < k[1] && x1 > k[0]);
  const ri = (rn, a, b) => a + Math.floor(rn() * (b - a + 1));

  // ---------- sàn ----------
  const ROWS = [Y, 151, 162, 175, 190, 208, 229, LIP];
  function floorBase(R, base) {
    r(0, Y, R.w, H - Y, base);
    // sát tường tối hơn, ra phía trước sáng dần
    r(0, Y, R.w, 4, 'rgba(0,0,0,0.3)'); r(0, Y + 4, R.w, 7, 'rgba(0,0,0,0.16)'); r(0, Y + 11, R.w, 12, 'rgba(0,0,0,0.07)');
    r(0, 232, R.w, LIP - 232, 'rgba(255,255,255,0.025)');
  }
  // Mạch lát sàn tụ về một điểm ở xa: hàng càng gần càng cao và rộng.
  function persp(R, sp, col, o) {
    o = o || {};
    const vx = R.w / 2, vy = 40, rn = R.rn;
    for (let j = 0; j < ROWS.length - 1; j++) {
      const ya = ROWS[j], yb = ROWS[j + 1];
      if (j > 0) {
        if (o.broken) { for (let x = 0; x < R.w;) { const l = 14 + Math.floor(rn() * 40); if (rn() > o.broken) r(x, ya, l, 1, col); x += l; } } else r(0, ya, R.w, 1, col);
      }
      const k = ((ya + yb) / 2 - vy) / (LIP - vy);
      const off = o.stagger && j % 2 ? sp / 2 : 0;
      const n = Math.ceil(vx / (sp * k)) + 1;
      for (let q = -n; q <= n; q++) {
        const x = Math.round(vx + (q * sp + off) * k);
        if (x < 0 || x >= R.w) continue;
        if (o.broken && rn() < o.broken) continue;
        r(x, ya + 1, 1, yb - ya - 1, col);
      }
    }
  }
  // Vài ô sàn đậm nhạt khác nhau, rất nhẹ để sàn không rối.
  function patches(R, n, a) {
    const rn = R.rn;
    for (let i = 0; i < n; i++) {
      const j = Math.floor(rn() * (ROWS.length - 1)), x = Math.floor(rn() * R.w), wd = 14 + Math.floor(rn() * 22) + j * 4;
      r(x, ROWS[j] + 1, wd, ROWS[j + 1] - ROWS[j] - 1, rn() < 0.5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(0,0,0,' + a * 1.6 + ')');
    }
  }
  function lip(R, T, x1) {
    x1 = x1 == null ? R.w : x1;
    r(0, LIP, x1, H - LIP, T.lip);
    r(0, LIP, x1, 1, lite(T.floor, 0.14));
    r(0, LIP + 1, x1, 2, mix(T.lip, T.floor, 0.45));
  }
  // Thảm, chiếu: nền trầm, viền mảnh.
  function rug(x, y, w, h, col, edge) {
    r(x, y, w, h, col);
    r(x + 2, y + 2, w - 4, 1, edge); r(x + 2, y + h - 3, w - 4, 1, edge);
    r(x + 2, y + 2, 1, h - 4, edge); r(x + w - 3, y + 2, 1, h - 4, edge);
    r(x, y + h, w, 1, 'rgba(0,0,0,0.25)');
  }

  // ---------- vật trang trí dùng chung ----------
  function goldPile(R, x, yb, rx, ry) {
    dome(x, yb, rx, ry, '#8a6420'); dome(x, yb, rx - 2, ry - 1, '#c2942c');
    const rn = R.rn;
    for (let i = 0; i < rx; i++) {
      const dx = Math.round((rn() * 2 - 1) * (rx - 3)), dy = 1 + Math.floor(rn() * Math.max(1, ry * Math.sqrt(Math.max(0, 1 - (dx * dx) / (rx * rx))) - 1));
      r(x + dx, yb - dy, 2, 1, i % 3 ? '#e8bc48' : '#fff0a0');
    }
    R.anim.push({ k: 'glint', x: x - (rx >> 1), y: yb - ry + 2, ph: rn() * 6 }, { k: 'glint', x: x + (rx >> 1), y: yb - (ry >> 1), ph: rn() * 6 });
  }
  function urn(x, yb, col) {
    r(x - 4, yb - 9, 8, 9, dim(col, 0.5)); r(x - 5, yb - 7, 10, 5, dim(col, 0.5));
    r(x - 3, yb - 8, 6, 7, col); r(x - 4, yb - 6, 8, 3, col); r(x - 3, yb - 8, 1, 6, lite(col, 0.25));
    r(x - 3, yb - 11, 6, 2, dim(col, 0.3)); r(x - 4, yb - 5, 8, 1, lite(col, 0.3));
  }
  function crate(x, yb, s, col) {
    r(x, yb - s, s, s, dim(col, 0.55)); r(x + 1, yb - s + 1, s - 2, s - 2, col);
    r(x + 1, yb - s + 1, s - 2, 1, lite(col, 0.2)); r(x + 1, yb - s + 1, 2, s - 2, dim(col, 0.25)); r(x + s - 3, yb - s + 1, 2, s - 2, dim(col, 0.25));
    ln(x + 3, yb - s + 3, x + s - 4, yb - 3, dim(col, 0.3));
  }
  function barrel(x, yb, col) {
    r(x - 6, yb - 14, 12, 14, dim(col, 0.55)); r(x - 7, yb - 11, 14, 8, dim(col, 0.55));
    r(x - 5, yb - 13, 10, 12, col); r(x - 6, yb - 10, 12, 6, col); r(x - 5, yb - 13, 2, 12, lite(col, 0.18));
    r(x - 6, yb - 11, 12, 1, '#77777f'); r(x - 6, yb - 5, 12, 1, '#77777f');
  }
  function sack(x, yb, col) {
    dome(x, yb, 7, 8, dim(col, 0.5)); dome(x, yb, 6, 7, col); r(x - 2, yb - 10, 4, 3, col); r(x - 2, yb - 8, 4, 1, dim(col, 0.4)); r(x - 4, yb - 5, 2, 3, lite(col, 0.2));
  }
  function skull(x, yb) {
    r(x - 3, yb - 5, 6, 4, '#c9c2ae'); r(x - 2, yb - 1, 4, 1, '#a8a08c'); r(x - 2, yb - 4, 1, 2, '#1a1414'); r(x + 1, yb - 4, 1, 2, '#1a1414'); r(x - 3, yb - 5, 6, 1, '#e4dcc8');
  }
  function candle(R, x, yb, h) {
    r(x, yb - h, 2, h, '#d8d0b8'); r(x + 1, yb - h, 1, h, '#a89c84');
    R.anim.push({ k: 'candle', x: x, y: yb - h - 1, ph: R.rn() * 9 });
  }
  function chain(x, y0, len, col) {
    for (let y = y0; y < y0 + len; y += 3) { r(x, y, 1, 2, col); r(x + ((y / 3) & 1 ? 1 : -1), y + 1, 1, 1, dim(col, 0.3)); }
  }
  // Đèn lồng treo: dây, thân đèn và quầng sáng.
  function lantern(R, x, y, col, rope) {
    if (rope) r(x, y - rope, 1, rope, '#2a2018');
    glow(x, y + 4, 22, 16, col, 0.05);
    r(x - 3, y - 1, 6, 9, DARK); r(x - 2, y, 4, 7, col); r(x - 2, y, 1, 7, lite(col, 0.4)); r(x - 3, y - 1, 6, 1, '#5a3a20'); r(x - 3, y + 7, 6, 1, '#5a3a20'); r(x, y + 8, 1, 2, '#c8372d');
    R.anim.push({ k: 'lantern', x: x, y: y, col: lite(col, 0.5), ph: R.rn() * 9 });
  }
  // Dây đèn lồng chăng ngang.
  function lanternString(R, x0, x1, y, sag) {
    const cols = ['#e8a03a', '#d8553a', '#e8c85a', '#58b0a0'];
    let px = x0, py = y;
    for (let x = x0; x <= x1; x += 2) {
      const u = (x - x0) / (x1 - x0), yy = Math.round(y + sag * (1 - (2 * u - 1) * (2 * u - 1)));
      ln(px, py, x, yy, '#2a2018'); px = x; py = yy;
    }
    const n = Math.max(2, Math.round((x1 - x0) / 34));
    for (let i = 1; i < n; i++) {
      const u = i / n, x = Math.round(x0 + (x1 - x0) * u), yy = Math.round(y + sag * (1 - (2 * u - 1) * (2 * u - 1)));
      lantern(R, x, yy + 3, cols[i % cols.length], 2);
    }
  }
  function torch(R, x, y) {
    glow(x, y - 6, 38, 30, '#ff9a40', 0.045);
    r(x - 1, y, 2, 9, K.iron); r(x - 3, y, 6, 2, K.ironL); r(x - 2, y + 2, 4, 1, K.iron);
    R.anim.push({ k: 'torch', x: x, y: y, ph: R.rn() * 9 });
  }
  // Cây đuốc đứng cao sát tường (trang trí, khác hẳn chậu than đánh vỡ được).
  function wallBrazier(R, x, yb) {
    glow(x, yb - 44, 44, 34, '#ff9a40', 0.05);
    r(x - 1, yb - 36, 2, 36, K.iron); r(x - 1, yb - 36, 1, 36, K.ironL); r(x - 5, yb - 2, 10, 2, K.iron); r(x - 3, yb - 4, 6, 2, K.iron);
    r(x - 3, yb - 14, 6, 1, K.ironL); r(x - 3, yb - 26, 6, 1, K.ironL);
    r(x - 5, yb - 41, 10, 5, DARK); r(x - 4, yb - 40, 8, 3, K.ironL); r(x - 3, yb - 38, 6, 1, K.iron);
    R.anim.push({ k: 'torch', x: x, y: yb - 41, big: 1, ph: R.rn() * 9 });
  }
  function vine(R, x, y0, len, col) {
    const rn = R.rn;
    let xx = x;
    for (let y = y0; y < y0 + len; y += 4) {
      if (rn() < 0.3) xx += rn() < 0.5 ? -1 : 1;
      r(xx, y, 1, 4, col);
      if (rn() < 0.45) r(xx + (rn() < 0.5 ? -2 : 1), y + 1, 2, 1, F.leafH);
    }
    r(xx - 1, y0 + len, 3, 2, F.leafL);
  }

  // ---------- tường bên và cửa ----------
  // Toạ độ dọc của một đường ngang trên tường bên, lx tính từ mép phòng vào (0 là sát mép).
  const sy = (yc, lx) => Math.round(HZ + (yc - HZ) * (1 + KP * (1 - lx / SW)));
  const DM = (DL + DR) / 2, DH = (DR - DL) / 2;
  const doorTop = (lx) => sy(86 + Math.round(Math.pow(Math.abs(lx - DM) / DH, 2.4) * 10), lx);
  function sideWall(R, sd, T, st) {
    const X = (lx, ww) => (sd < 0 ? lx : R.w - lx - ww);
    const s = (lx, y, ww, h, col) => r(X(lx, ww), y, ww, h, col);
    for (let lx = 0; lx < SW; lx++) s(lx, 0, 1, sy(Y, lx), T.side);
    for (let yc = 6; yc < Y; yc += T.course) for (let lx = 0; lx < SW; lx++) s(lx, sy(yc, lx), 1, 1, T.sideLine);
    if (R.reg === 2) for (let yc = 6, j = 0; yc < Y; yc += T.course, j++) for (let lx = (j % 2) * 5 + 2; lx < SW; lx += 10) s(lx, sy(yc, lx), 1, sy(yc + T.course, lx) - sy(yc, lx), T.sideLine);
    if (R.reg === 0) for (let i = 0; i < 46; i++) { const lx = Math.floor(R.rn() * SW), yy = Math.floor(R.rn() * sy(Y - 6, lx)); s(lx, yy, 3, 2, R.rn() < 0.7 ? F.leafM : F.leafL); }
    if (R.reg === 1) for (let i = 0; i < 18; i++) { const lx = Math.floor(R.rn() * (SW - 4)), yy = Math.floor(R.rn() * sy(Y - 8, lx)); s(lx, yy, 5, 1, C.rockL); s(lx, yy + 1, 5, 2, C.rock); }
    for (let lx = 0; lx < 10; lx++) s(lx, 0, 1, sy(Y, lx), 'rgba(0,0,0,' + (0.035 * (10 - lx)).toFixed(3) + ')');
    if (st !== 'solid') {
      // khung và ô cửa nhìn chéo
      for (let lx = DL - 3; lx <= DR + 3; lx++) {
        const yt = doorTop(G.clamp(lx, DL, DR)), yb = sy(Y, lx);
        if (lx < DL || lx > DR) s(lx, yt - 5, 1, yb - yt + 5, lx === DR + 3 || lx === DL - 1 ? T.frameHi : lx === DL - 3 ? dim(T.frame, 0.3) : T.frame);
        else {
          s(lx, yt - 5, 1, 5, T.frame); s(lx, yt - 5, 1, 1, T.frameHi); s(lx, yt - 1, 1, 1, dim(T.frame, 0.4));
          if (st === 'open') {
            const k = Math.abs(lx - DM) / DH;
            s(lx, yt, 1, yb - yt, mix(lite(T.light, 0.35), T.light, k));
            s(lx, yt, 1, Math.round((yb - yt) * 0.22), rgba(T.inner, 0.28));
            if (k > 0.75) s(lx, yt, 1, yb - yt, rgba(T.inner, 0.25));
          } else s(lx, yt, 1, yb - yt, T.inner);
        }
      }
      if (st === 'open') for (let lx = DL - 3; lx <= DR + 4; lx++) s(lx, doorTop(G.clamp(lx, DL, DR)) - 7, 1, 2, rgba(T.light, 0.35));
      doorFill(R, s, T, st);
    }
    for (let lx = 0; lx < SW; lx++) s(lx, sy(Y, lx) - 1, 1, 2, 'rgba(0,0,0,0.45)');
    // góc phòng: cột chạy suốt chiều cao tường
    const cx = sd < 0 ? SW + 2 : R.w - SW - 2;
    if (R.reg === 0) {
      r(cx - 9, 0, 18, Y, F.bark); r(cx - 9, 0, 3, Y, F.barkL); r(cx + 5, 0, 4, Y, F.barkD);
      for (let i = 0; i < 9; i++) r(cx - 5 + Math.floor(R.rn() * 9), Math.floor(R.rn() * (Y - 30)), 1, 8 + Math.floor(R.rn() * 20), F.barkD);
      r(cx - 12, Y - 10, 24, 10, F.bark); r(cx - 15, Y - 4, 30, 4, F.bark); r(cx - 12, Y - 10, 2, 10, F.barkL); r(cx - 15, Y - 4, 2, 4, F.barkL);
      r(cx - 10, Y - 3, 9, 2, F.moss); r(cx + 3, Y - 5, 8, 2, F.moss); r(cx - 9, Y - 4, 5, 1, F.mossL);
      vine(R, cx - 6, 20, 40 + Math.floor(R.rn() * 30), '#2a5a30');
    } else if (R.reg === 1) {
      for (let y = 0; y < Y; y += 12) {
        const ww = 12 + ((y * 7 + R.seed) % 7) + (y > Y - 30 ? 6 : 0) + (y < 30 ? 5 : 0);
        r(cx - ww / 2, y, ww, 12, C.rock); r(cx - ww / 2, y, 2, 12, C.rockL); r(cx + ww / 2 - 3, y, 3, 12, C.rockD); r(cx - ww / 2 + 2, y, ww - 5, 1, mix(C.rock, C.rockL, 0.5));
      }
      r(cx - 2, 44, 1, 40, mix(C.rock, C.wet, 0.4));
    } else {
      pillar(cx, 14);
    }
  }
  function pillar(x, wd) {
    const h = wd >> 1;
    r(x - h, 38, wd, Y - 38, K.stone); r(x - h, 38, 2, Y - 38, K.stoneL); r(x + h - 4, 38, 4, Y - 38, mix(K.stone, K.brickD, 0.5));
    for (let yy = 58; yy < Y - 12; yy += 16) r(x - h, yy, wd, 1, mix(K.stone, K.brickD, 0.5));
    r(x - h - 2, 38, wd + 4, 6, K.stoneL); r(x - h - 2, 44, wd + 4, 1, K.brickD); r(x - h - 1, 45, wd + 2, 2, K.stone);
    r(x - h - 2, Y - 9, wd + 4, 9, K.stone); r(x - h - 2, Y - 9, wd + 4, 1, K.stoneL); r(x - h - 2, Y - 2, wd + 4, 2, K.brickD);
    r(x - 4, 22, 8, 8, K.woodD); r(x - 4, 22, 1, 8, K.wood);
  }
  // Thứ chắn cửa (đóng) hoặc dấu vết còn lại khi cửa mở.
  function doorFill(R, s, T, st) {
    const rn = R.rn, open = st === 'open';
    if (R.reg === 2) {
      // song sắt: hạ xuống khi đóng, kéo lên khi mở
      const drop = open ? 12 : 200;
      for (let lx = DL + 1; lx <= DR - 1; lx += 5) {
        const yt = doorTop(lx), yb = Math.min(sy(Y, lx) - 3, yt + drop);
        s(lx, yt, 2, yb - yt, K.iron); s(lx, yt, 1, yb - yt, K.ironL); s(lx, yb, 2, 2, K.ironL); s(lx, yb + 2, 1, 1, K.iron);
      }
      for (let yc = 98; yc <= (open ? 98 : 134); yc += 12) for (let lx = DL; lx <= DR; lx++) s(lx, sy(yc, lx), 1, 2, (lx - DL - 1) % 5 === 0 ? K.ironL : K.iron);
    } else if (R.reg === 0) {
      // rễ và gai đan chéo
      const n = open ? 2 : 6;
      for (let k = 0; k < n; k++) {
        const up = k % 2, y0 = open ? 92 : 94 + k * 9 + Math.floor(rn() * 5), sl = open ? 0.25 : 0.7 + rn() * 0.8;
        for (let lx = DL; lx <= DR; lx++) {
          const yy = sy(y0, lx) + Math.round((up ? DR - lx : lx - DL) * sl), yb = sy(Y, lx), yt = doorTop(lx);
          if (yy < yt || yy > yb - 2) continue;
          s(lx, yy, 1, open ? 2 : 3, F.bark); s(lx, yy, 1, 1, F.barkL);
          if (!open && lx % 5 === k % 5) { s(lx, yy - 2, 1, 2, '#c8b890'); s(lx + 1, yy + 3, 2, 1, F.leafL); }
        }
      }
      if (open) for (let lx = DL + 1; lx <= DR - 1; lx += 3) s(lx, doorTop(lx), 1, 4 + Math.floor(rn() * 9), lx % 2 ? F.leafM : '#2a5a30');
      else for (let lx = DL + 3; lx <= DR - 2; lx += 6) { const yt = doorTop(lx); s(lx, yt, 2, sy(Y, lx) - yt - 2, F.barkD); s(lx, yt, 1, sy(Y, lx) - yt - 2, F.bark); }
    } else {
      // đá tảng lấp lối, còn hở khe tối phía trên; mở ra thì chỉ còn vài hòn hai bên
      const rows = open ? 1 : 6;
      for (let j = 0; j < rows; j++) {
        for (let lx = DL + (j % 2) * 3; lx <= DR - 5; lx += open ? DR - DL - 6 : 7) {
          const sz = open ? 6 : 7 + Math.floor(rn() * 2), yb = sy(Y, lx + 3) - 1 - j * 8 - Math.floor(rn() * 2);
          if (yb - sz < doorTop(lx + 3) + 8) continue;
          const col = mix(C.rock, C.rockL, rn() * 0.6);
          s(lx, yb - sz, sz, sz, C.rockD); s(lx, yb - sz, sz - 1, sz - 1, col); s(lx + 1, yb - sz, sz - 3, 1, lite(col, 0.18));
        }
      }
    }
  }
  // Ánh sáng tràn qua cửa đã mở, đổ xuống sàn.
  function spill(R, T) {
    for (let y = Y + 2; y < 240; y += 2) {
      const lx0 = Math.max(0, Math.round(SW * (1 - (y - Y) / (sy(Y, 0) - Y)))), ext = Math.round(96 - Math.abs(y - 180) * 0.7);
      r(R.w - ext, y, ext - lx0, 2, rgba(T.light, 0.06));
      if (ext > 34) r(R.w - ext + 26, y, ext - 26 - lx0, 2, rgba(T.light, 0.07));
      if (ext > 62) r(R.w - ext + 54, y, ext - 54 - lx0, 2, rgba(T.light, 0.08));
    }
    R.anim.push({ k: 'exit', x: R.w, col: T.light });
  }

  // ---------- RỪNG GIÀ ----------
  function fCanopy(R) {
    const rn = R.rn, w = R.w;
    r(0, 0, w, 24, '#0c1a12');
    for (let x = -6; x < w; x += 15) ell(x + rn() * 8, 24 + rn() * 7, 12 + rn() * 9, 6 + rn() * 6, '#0c1a12');
    for (let x = 0; x < w; x += 19) { const yy = 20 + rn() * 12, xx = x + rn() * 10; ell(xx, yy, 7 + rn() * 5, 3 + rn() * 2, F.leafD); r(xx - 3, yy - 2, 5, 1, F.leafM); }
    for (let x = 12; x < w; x += 37 + Math.floor(rn() * 30)) if (free(R, x - 4, x + 4)) vine(R, x, 26, 14 + Math.floor(rn() * 34), '#24502c');
  }
  function fTrunk(R, x, w, hollow) {
    const rn = R.rn;
    r(x, 0, w, Y, F.bark);
    r(x, 0, 3, Y, F.barkL); r(x + 3, 0, 2, Y, mix(F.bark, F.barkL, 0.5));
    r(x + w - 6, 0, 6, Y, F.barkD); r(x + w - 9, 0, 3, Y, mix(F.bark, F.barkD, 0.5));
    for (let i = 0, n = Math.round(w / 3); i < n; i++) {
      const gx = x + 5 + Math.floor(rn() * (w - 12)), gy = Math.floor(rn() * (Y - 24)), gl = 8 + Math.floor(rn() * 30);
      r(gx, gy, 1, gl, F.barkD);
      if (rn() < 0.4) r(gx + 1, gy + 2, 1, gl - 4, mix(F.bark, F.barkL, 0.6));
    }
    // bạnh rễ toả ra chân tường
    r(x - 4, Y - 13, w + 8, 13, F.bark); r(x - 9, Y - 5, w + 18, 5, F.bark);
    r(x - 4, Y - 13, 2, 13, F.barkL); r(x - 9, Y - 5, 2, 5, F.barkL); r(x + w + 1, Y - 13, 3, 13, F.barkD); r(x + w + 5, Y - 5, 4, 5, F.barkD);
    r(x + (w >> 2), Y - 9, 1, 9, F.barkD); r(x + (w >> 1) + 3, Y - 11, 1, 11, F.barkD);
    for (let i = 0; i < 3; i++) { const mx = x - 6 + Math.floor(rn() * (w + 4)), mw = 6 + Math.floor(rn() * 10); r(mx, Y - 3 - Math.floor(rn() * 9), mw, 3, F.moss); r(mx + 1, Y - 4 - Math.floor(rn() * 9), mw - 3, 1, F.mossL); }
    if (rn() < 0.6) { const my = 40 + Math.floor(rn() * 40); r(x, my, 5 + Math.floor(rn() * 8), 16 + Math.floor(rn() * 20), F.moss); r(x, my + 3, 2, 10, F.mossL); }
    if (hollow) {
      const hy = 62 + Math.floor(rn() * 30), hx = x + (w >> 1);
      ell(hx, hy, 7, 10, F.barkL); ell(hx + 1, hy + 1, 6, 9, '#0f0a07');
      if (rn() < 0.5) { r(hx - 3, hy + 2, 2, 1, '#f4e060'); r(hx + 2, hy + 2, 2, 1, '#f4e060'); R.anim.push({ k: 'blink', x: hx - 3, y: hy + 2, w: 7, col: '#0f0a07', ph: rn() * 9 }); }
    } else if (rn() < 0.6) {
      // nấm bậc thang mọc trên vỏ cây
      const sx = x + w - 5, sy0 = 70 + Math.floor(rn() * 40);
      for (let k = 0; k < 3; k++) { r(sx - k * 3, sy0 + k * 7, 8, 2, '#c9a878'); r(sx - k * 3 + 1, sy0 + k * 7 + 2, 6, 1, '#8a6a48'); r(sx - k * 3, sy0 + k * 7, 8, 1, '#e4c898'); }
    }
  }
  // Bức tường đá đền hoang, rễ đa trùm lên.
  function fRuin(R, x0, x1, top) {
    const rn = R.rn;
    for (let x = x0; x < x1; x += 12) {
      const t = top + Math.floor(rn() * 3) * 6 * (R.lvl > 0.2 || rn() < 0.5 ? 1 : 0);
      bricks(x, t, Math.min(12, x1 - x), Y - t, 24, 12, [F.stone, mix(F.stone, F.stoneD, 0.4), mix(F.stone, F.stoneL, 0.25)], F.stoneD, rn, 0.05 + R.lvl * 0.1);
      r(x, t, Math.min(12, x1 - x), 1, F.stoneL);
      if (rn() < 0.6) { r(x, t - 1, 9, 3, F.moss); r(x + 1, t - 2, 5, 1, F.mossL); }
    }
    r(x0, Y - 14, x1 - x0, 14, 'rgba(0,0,0,0.12)'); r(x0, Y - 15, x1 - x0, 1, F.stoneL);
    for (let i = 0, n = (x1 - x0) / 26; i < n; i++) { const mx = x0 + Math.floor(rn() * (x1 - x0 - 12)), my = top + 14 + Math.floor(rn() * (Y - top - 26)); r(mx, my, 6 + Math.floor(rn() * 9), 2, F.moss); r(mx + 1, my + 2, 3, 1 + Math.floor(rn() * 4), F.moss); }
  }
  function fBanyan(R, x, spread) {
    const rn = R.rn;
    for (let k = 0; k < spread; k++) {
      let xx = x + (k - spread / 2) * 5 + Math.floor(rn() * 4), wd = 2 + Math.floor(rn() * 3);
      for (let y = 0; y < Y; y += 6) {
        if (rn() < 0.4) xx += rn() < 0.5 ? -1 : 1;
        if (y > Y - 30) xx += k < spread / 2 ? -1 : 1;
        r(xx, y, wd, 6, F.bark); r(xx, y, 1, 6, F.barkL); if (wd > 2) r(xx + wd - 1, y, 1, 6, F.barkD);
      }
      r(xx - 2, Y - 3, wd + 4, 3, F.bark);
    }
  }
  function fIdol(R, x, yb) {
    // tượng thần đá phủ rêu trong hốc
    arch(x - 17, yb, 34, 52, F.stoneL); arch(x - 14, yb, 28, 49, '#10160f');
    r(x - 8, yb - 30, 16, 30, F.stoneD); r(x - 7, yb - 40, 14, 12, F.stone); r(x - 9, yb - 42, 18, 3, F.stoneL);
    r(x - 5, yb - 36, 3, 2, '#10160f'); r(x + 2, yb - 36, 3, 2, '#10160f'); r(x - 3, yb - 31, 6, 1, '#10160f');
    r(x - 10, yb - 26, 20, 3, F.stone); r(x - 6, yb - 20, 12, 12, F.stone); r(x - 6, yb - 20, 12, 1, F.stoneL);
    r(x - 9, yb - 42, 6, 2, F.moss); r(x + 4, yb - 28, 6, 2, F.moss); r(x - 12, yb - 4, 24, 4, F.stone); r(x - 12, yb - 4, 24, 1, F.stoneL);
  }
  function fWall(R) {
    const rn = R.rn, w = R.w, t = R.type;
    const v = t === 'boss' ? 0 : t === 'chest' || t === 'merchant' ? 0 : t === 'fountain' || t === 'curse' || t === 'choice' ? 2 : Math.floor(rn() * 3);
    R.v = v;
    r(0, 0, w, Y, F.void);
    // bụi rậm và dây gai đan kín phía sau: không có khoảng trống nào nhìn xuyên ra ngoài
    for (let i = 0, n = w / 5; i < n; i++) ell(rn() * w, 22 + rn() * (Y - 26), 6 + rn() * 9, 3 + rn() * 4, rn() < 0.65 ? F.leafD : '#18331f');
    for (let x0 = -30; x0 < w; x0 += 34) { ln(x0, Y, x0 + 56, 26, '#22301c', 2); ln(x0 + 64, Y, x0 + 4, 36, '#1c2a18', 2); }
    for (let i = 0, n = w / 9; i < n; i++) { const x = rn() * w, y = 30 + rn() * (Y - 36); r(x, y, 4, 2, F.leafM); r(x + 1, y - 1, 2, 1, F.leafL); }
    if (v === 0) {
      let x = SW + 8 + Math.floor(rn() * 14);
      const big = t === 'boss';
      while (x < w - SW - 30) {
        const tw = (big ? 54 : 40) + Math.floor(rn() * 34);
        if (free(R, x - 10, x + tw + 10)) fTrunk(R, x, tw, rn() < 0.35);
        x += tw + 12 + Math.floor(rn() * 30);
      }
    } else if (v === 1) {
      // hàng rào gai đan bằng rễ, lá phủ kín
      for (let yy = 26; yy < Y; yy += 6) {
        for (let xx = ((yy / 6) % 2) * 5 - 4; xx < w; xx += 10) {
          const k = rn(), col = k < 0.45 ? F.leafM : k < 0.8 ? '#193622' : k < 0.95 ? F.leafL : F.leafH;
          const ox = xx + Math.floor(rn() * 3), oy = yy + Math.floor(rn() * 2);
          r(ox, oy, 7, 4, col); r(ox + 1, oy, 4, 1, lite(col, 0.1)); r(ox + 2, oy + 4, 3, 1, F.leafD);
        }
      }
      for (let x0 = -50; x0 < w; x0 += 30 + Math.floor(rn() * 12)) {
        ln(x0, Y, x0 + 72, 26, F.bark, 3); ln(x0, Y - 1, x0 + 72, 25, F.barkL, 1);
        ln(x0 + 80, Y, x0 + 10, 30, F.barkD, 3); ln(x0 + 80, Y - 1, x0 + 10, 29, F.bark, 1);
      }
      for (let i = 0, n = w / 14; i < n; i++) { const x = rn() * w, y = 34 + rn() * (Y - 44); r(x, y, 1, 3, '#d0c098'); r(x + 1, y + 1, 2, 1, '#d0c098'); }
      for (let i = 0, n = w / 40; i < n; i++) { const x = Math.floor(rn() * w), y = 40 + Math.floor(rn() * (Y - 56)), pc = rn() < 0.5 ? '#e8b0c8' : '#f0e8b8'; r(x - 1, y, 3, 1, pc); r(x, y - 1, 1, 3, pc); r(x, y, 1, 1, '#e0a030'); }
      r(0, Y - 8, w, 8, 'rgba(0,0,0,0.25)');
      // vài cọc gỗ lớn chống rào
      for (let x = SW + 70 + Math.floor(rn() * 40); x < w - SW - 60; x += 130 + Math.floor(rn() * 50)) if (free(R, x - 12, x + 12)) { r(x - 6, 30, 12, Y - 30, F.bark); r(x - 6, 30, 2, Y - 30, F.barkL); r(x + 3, 30, 3, Y - 30, F.barkD); r(x - 8, Y - 6, 16, 6, F.bark); r(x - 8, 60, 16, 3, '#8a7a50'); r(x - 8, 100, 16, 3, '#8a7a50'); }
    } else {
      fRuin(R, 0, w, 46);
    }
    fCanopy(R);
    if (v === 2) {
      const n = Math.max(2, Math.round(w / 170));
      for (let i = 0; i < n; i++) { const bx = Math.round(((i + 0.5 + (rn() - 0.5) * 0.5) * w) / n); if (free(R, bx - 22, bx + 22)) { fBanyan(R, bx, 3 + Math.floor(rn() * 3)); keep(R, bx - 16, bx + 16); } }
    }
  }
  function fDeco(R) {
    const rn = R.rn, w = R.w;
    // đèn lồng, tượng, nấm trên tường ở những chỗ còn trống
    for (let i = 0; i < 12; i++) {
      const x = SW + 30 + Math.floor(rn() * (w - 2 * SW - 60)), k = rn();
      if (!free(R, x - 26, x + 26)) continue;
      if (R.v === 2 && k < 0.4) { fIdol(R, x, Y - 15); candle(R, x - 12, Y - 15, 4); candle(R, x + 10, Y - 15, 5); } else if (k < 0.75) lantern(R, x, 58 + Math.floor(rn() * 22), '#e8b04a', 30);
      else { for (let j = 0; j < 4; j++) { const mx = x - 12 + j * 7 + Math.floor(rn() * 3), mh = 3 + Math.floor(rn() * 5); r(mx + 1, Y - mh, 2, mh, '#d8d0b8'); r(mx - 1, Y - mh - 2, 6, 2, j % 2 ? '#d07848' : '#c89a58'); r(mx, Y - mh - 3, 4, 1, '#e8a878'); } }
      keep(R, x - 30, x + 30);
    }
  }
  function fFloor(R) {
    const rn = R.rn, w = R.w;
    floorBase(R, F.floor);
    if (R.v === 2) {
      // đá lát đền hoang, cỏ mọc qua kẽ
      r(0, Y, w, LIP - Y, rgba(F.stone, 0.28));
      persp(R, 38, dim(F.floor, 0.22), { stagger: true, broken: 0.22 });
      patches(R, w / 26, 0.03);
    } else {
      // đất nện: rãnh mờ tụ về xa
      persp(R, 52, dim(F.floor, 0.12), { broken: 0.55 });
      for (let i = 0, n = w / 5; i < n; i++) { const x = rn() * w, y = Y + 8 + rn() * (LIP - Y - 12), l = 3 + rn() * 5 + (y - Y) / 16; r(x, y, l, 1, rn() < 0.6 ? dim(F.floor, 0.1) : lite(F.floor, 0.05)); }
    }
    // mảng rêu, lá rụng, sỏi
    for (let i = 0, n = w / 34; i < n; i++) { const x = rn() * w, y = Y + 10 + rn() * (LIP - Y - 20); ell(x, y, 8 + rn() * 14, 2 + rn() * 2, rgba(F.moss, 0.22)); }
    for (let i = 0, n = w / 16; i < n; i++) {
      const x = Math.floor(rn() * w), y = Y + 8 + Math.floor(rn() * (LIP - Y - 12)), k = rn();
      if (k < 0.4) { r(x, y, 3, 1, '#6a5a34'); r(x + 1, y - 1, 2, 1, '#7a6838'); } else if (k < 0.7) { r(x, y - 1, 4, 2, '#565848'); r(x, y - 1, 3, 1, '#6c6e5c'); } else { r(x, y - 2, 1, 3, '#4f6a34'); r(x + 2, y - 3, 1, 4, '#5c7a3a'); r(x + 4, y - 1, 1, 2, '#4f6a34'); }
    }
    // mép tường: cỏ và rễ bò ra sàn
    r(0, Y, w, 1, '#5c7a3a'); r(0, Y + 1, w, 1, dim(F.floor, 0.35));
    for (let x = 0; x < w; x += 7) { const k = rn(); if (k < 0.6) r(x + Math.floor(rn() * 4), Y - 2 - Math.floor(k * 4), 1, 3 + Math.floor(k * 4), k < 0.3 ? '#5c7a3a' : '#6f9440'); }
    for (let x = 30; x < w - 30; x += 50 + Math.floor(rn() * 60)) { const l = 10 + Math.floor(rn() * 16), d = rn() < 0.5 ? 1 : -1; ln(x, Y, x + d * l, Y + 5, F.bark, 2); ln(x, Y, x + d * l, Y + 4, F.barkL, 1); }
  }
  function fFore(R) {
    const rn = R.rn, w = R.w;
    // rễ và lá rủ sát mép trên, dương xỉ ở mép dưới
    for (let x = 4; x < w; x += 26 + Math.floor(rn() * 30)) { const l = 6 + Math.floor(rn() * 12); r(x, 0, 2, l, '#070d09'); r(x - 2, l, 5, 3, '#0b140d'); r(x - 1, l + 3, 3, 2, '#0b140d'); }
    for (let x = 6; x < w; x += 30 + Math.floor(rn() * 40)) {
      const h = 5 + Math.floor(rn() * 6);
      for (let k = -3; k <= 3; k++) { const hh = h - Math.abs(k) * 1.4; ln(x, LIP + 2, x + k * 4, LIP + 2 - hh, '#0e1a10', 2); }
    }
  }
  // Tia nắng xiên qua tán lá.
  function shaft(R, x, wd) {
    for (let y = 22; y < LIP; y += 2) r(Math.round(x - (y - 22) * 0.38), y, wd, 2, rgba(F.light, y < Y ? 0.055 : 0.03));
    ell(x - 62, 200, wd * 0.9, 9, rgba(F.light, 0.04));
    R.anim.push({ k: 'mote', x: x - 40, y: 90, ph: R.rn() * 9 });
  }
  function fBoss(R) {
    const rn = R.rn, w = R.w, big = R.boss === 'moc';
    const cx = big ? w - 140 : w / 2;
    // khoảng sáng mờ sau lưng trùm: hốc lớn giữa các thân cây khổng lồ
    ell(cx, 84, 118, 66, '#14301e'); ell(cx, 88, 92, 54, '#1c4028'); ell(cx, 94, 60, 40, '#285434'); ell(cx, 100, 30, 24, '#3a6e40');
    r(cx - 118, 120, 236, Y - 120, '#14301e'); r(cx - 92, 126, 184, Y - 126, '#1c4028');
    for (let i = 0; i < 7; i++) { const x = cx - 90 + i * 30 + Math.floor(rn() * 10); r(x, 30, 2 + (i % 2), Y - 30, '#102619'); }
    for (let i = 0; i < 5; i++) r(cx - 70 + i * 34, 24, 10, Y - 24, rgba(F.light, 0.05));
    // hai thân cổ thụ kẹp hai bên, rễ vòm phía trên
    fTrunk(R, cx - 150, 46, true); fTrunk(R, Math.min(w - 54, cx + 104), 50, false);
    for (let k = 0; k < 3; k++) { const yy = 40 + k * 9; for (let x = cx - 110; x <= cx + 110; x += 2) { const u = (x - cx) / 110; r(x, Math.round(yy + u * u * (26 - k * 6)), 2, 4 - k, k ? F.barkD : F.bark); } }
    for (let i = 0; i < 9; i++) vine(R, cx - 100 + i * 25 + Math.floor(rn() * 8), 44, 12 + Math.floor(rn() * 30), '#2a5a30');
    if (big) {
      // xương và sọ dưới gốc: hang ổ của Mộc Tinh
      for (let i = 0; i < 5; i++) skull(cx - 96 + i * 46 + Math.floor(rn() * 10), Y - 1);
      for (let i = 0; i < 4; i++) { const x = cx - 80 + i * 50; r(x, Y - 3, 9, 1, '#c9c2ae'); r(x - 1, Y - 4, 2, 3, '#c9c2ae'); }
    } else {
      fIdol(R, cx, Y - 12); candle(R, cx - 22, Y - 12, 5); candle(R, cx + 20, Y - 12, 6);
    }
    keep(R, cx - 160, cx + 160);
    lantern(R, cx - 126, 70, '#9be06a', 34); lantern(R, Math.min(w - 30, cx + 130), 64, '#9be06a', 30);
  }

  // ---------- HANG BIỂN ----------
  // Vách đá tự nhiên: các lớp trầm tích lượn sóng, u đá lồi và vệt nước rỉ.
  function cRock(x0, y0, x1, y1, rn) {
    r(x0, y0, x1 - x0, y1 - y0, C.rockD);
    const ph = rn() * 9, tones = [C.rock, mix(C.rock, C.rockD, 0.45), mix(C.rock, C.rockL, 0.3), mix(C.rock, C.rockD, 0.2), mix(C.rock, C.rockL, 0.12)];
    const hs = [];
    for (let y = y0 - 8, k = 0; y < y1 + 10; k++) { const h = 9 + Math.floor(rn() * 14); hs.push([y, h, tones[(k * 3 + Math.floor(rn() * 2)) % 5], 0.6 + rn() * 1.2, rn() * 6]); y += h; }
    for (let x = x0; x < x1; x += 3) {
      for (const b of hs) {
        const off = Math.round(Math.sin(x * 0.045 * b[3] + ph + b[4]) * 4 + Math.sin(x * 0.11 + b[4] * 2) * 2);
        const ya = Math.max(y0, b[0] + off), yb = Math.min(y1, b[0] + b[1] + off + 1);
        if (yb <= ya) continue;
        r(x, ya, 3, yb - ya, b[2]);
        r(x, ya, 3, 1, mix(b[2], C.rockL, 0.55));
        if (yb - ya > 4) r(x, yb - 2, 3, 2, mix(b[2], C.rockD, 0.5));
      }
    }
    // khe nứt dọc cắt qua các lớp
    for (let x = x0 + 10 + Math.floor(rn() * 30); x < x1; x += 30 + Math.floor(rn() * 50)) {
      let xx = x;
      for (let y = y0 + Math.floor(rn() * 30); y < y1 - Math.floor(rn() * 40); y += 5) { if (rn() < 0.5) xx += rn() < 0.5 ? -2 : 2; r(xx, y, 2, 5, C.rockD); }
    }
    // u đá lồi
    for (let i = 0, n = (x1 - x0) / 20; i < n; i++) {
      const x = x0 + rn() * (x1 - x0), y = y0 + 20 + rn() * (y1 - y0 - 30), rx = 7 + rn() * 12, ry = 4 + rn() * 6, col = mix(C.rock, C.rockL, rn() * 0.4);
      ell(x + 1, y + 2, rx, ry, C.rockD); ell(x, y, rx, ry, col); ell(x - rx * 0.2, y - ry * 0.35, rx * 0.6, ry * 0.4, mix(col, C.rockL, 0.45));
    }
    // vệt nước rỉ bóng loáng
    for (let i = 0, n = (x1 - x0) / 60; i < n; i++) { const x = x0 + Math.floor(rn() * (x1 - x0)), y = y0 + 30 + Math.floor(rn() * (y1 - y0 - 60)), l = 5 + Math.floor(rn() * 12); r(x, y, 2, l, rgba(C.wet, 0.22)); r(x, y + l - 2, 2, 2, rgba(C.wet, 0.5)); }
  }
  function crystal(R, x, y, s, col) {
    col = col || C.cry;
    glow(x, y - s, s * 3.2, s * 2.6, col, 0.06);
    const d = dim(col, 0.4), l = lite(col, 0.7);
    r(x - s, y - s * 1.2, s * 0.7, s * 1.2, d); r(x + s * 0.4, y - s * 1.5, s * 0.7, s * 1.5, d);
    r(x - s * 0.3, y - s * 2.2, s * 0.8, s * 2.2, col); r(x - s * 0.2, y - s * 2.5, s * 0.5, s * 0.4, col);
    r(x - s * 0.3, y - s * 2.2, Math.max(1, s * 0.25), s * 2, l); r(x - s, y - s * 1.2, 1, s, col);
    R.anim.push({ k: 'glint', x: Math.round(x), y: Math.round(y - s * 2.2), ph: R.rn() * 6 });
  }
  function cWall(R, x1) {
    const rn = R.rn, w = x1 || R.w;
    cRock(0, 0, w, Y, rn);
    r(0, 0, w, 20, 'rgba(4,8,14,0.6)'); r(0, 20, w, 14, 'rgba(4,8,14,0.34)'); r(0, 34, w, 12, 'rgba(4,8,14,0.14)');
    r(0, Y - 9, w, 9, 'rgba(4,8,14,0.28)');
  }
  function cSpikes(R, x1) {
    const rn = R.rn, w = x1 || R.w;
    for (let x = 6; x < w; x += 12 + Math.floor(rn() * 20)) {
      const k = rn(), h = 26 + Math.floor(k * k * 52), wd = 9 + Math.floor(rn() * 6) + (h >> 2);
      spike(x, 0, wd, h, 1, '#131f2c', '#36506a');
      if (h > 30 && rn() < 0.6) R.anim.push({ k: 'drip', x: x, y: h, y1: Y - 2, ph: rn() * 9 });
    }
    for (let x = SW + 20; x < w - SW - 10; x += 22 + Math.floor(rn() * 40)) {
      const h = 10 + Math.floor(rn() * 24), wd = 10 + (h >> 1);
      if (!free(R, x - wd, x + wd)) continue;
      spike(x, Y, wd, h, -1, mix(C.rock, C.rockD, 0.4), C.rockL);
      r(x - wd / 2 - 1, Y - 2, wd + 2, 2, C.rockD);
    }
  }
  // Hốc sâu nhìn vào lòng hang.
  function cAlcove(R, x, wd, hd) {
    arch(x - wd / 2 - 4, Y - 4, wd + 8, hd + 4, mix(C.rockL, C.rock, 0.3));
    arch(x - wd / 2 - 2, Y - 4, wd + 4, hd + 2, C.rockD);
    arch(x - wd / 2, Y - 4, wd, hd, '#09131e');
    ell(x, Y - 4 - hd * 0.42, wd * 0.34, hd * 0.26, '#0f2232'); ell(x, Y - 4 - hd * 0.42, wd * 0.2, hd * 0.15, '#15303f');
    keep(R, x - wd / 2 - 10, x + wd / 2 + 10);
  }
  function cBridge(R, x) {
    const wd = 124, hd = 78;
    cAlcove(R, x, wd, hd);
    // nhũ đá xa và cầu dây vắt ngang vực
    for (let i = 0; i < 6; i++) spike(x - 44 + i * 18 + (i % 2) * 5, Y - 4 - hd + 14 + Math.abs(i - 2.5) * 5, 5, 8 + (i * 5) % 9, 1, '#0d1a27');
    const bx0 = x - wd / 2 + 8, bx1 = x + wd / 2 - 8, by = Y - 44;
    for (let xx = bx0; xx <= bx1; xx += 1) {
      const u = (xx - bx0) / (bx1 - bx0), sag = Math.round(9 * (1 - (2 * u - 1) * (2 * u - 1)));
      r(xx, by + sag, 1, 1, '#5a4a36'); r(xx, by - 8 + Math.round(sag * 0.8), 1, 1, '#3e3428');
      if ((xx - bx0) % 5 === 0) { r(xx, by + sag + 1, 3, 1, '#7a6646'); r(xx + 1, by - 8 + Math.round(sag * 0.8), 1, 8 + Math.round(sag * 0.2), '#3e3428'); }
    }
    r(bx0 - 2, by - 12, 2, 14, '#4a3c2c'); r(bx1 + 1, by - 12, 2, 14, '#4a3c2c');
    r(x - wd / 2, by + 2, 10, Y - 4 - by - 2, C.rockD); r(x + wd / 2 - 10, by + 2, 10, Y - 4 - by - 2, C.rockD);
    crystal(R, x - 16, Y - 8, 4); crystal(R, x + 30, Y - 6, 3);
  }
  function cSteps(R, x) {
    // bậc đá đục vào vách dẫn lên một cửa hang nhỏ
    const d = R.rn() < 0.5 ? 1 : -1;
    for (let k = 0; k < 7; k++) {
      const sx = x - d * 36 + d * k * 11, yy = Y - 6 - k * 8;
      r(sx - 7, yy, 14, Y - yy, mix(C.rock, C.rockD, 0.25)); r(sx - 7, yy, 14, 2, C.rockL); r(sx - 7, yy + 2, 14, 2, C.rockD);
    }
    const dx = x + d * 44;
    arch(dx - 12, Y - 60, 24, 36, C.rockL); arch(dx - 10, Y - 60, 20, 34, '#070d14'); ell(dx, Y - 70, 5, 8, '#12283a');
    r(dx - 14, Y - 60, 28, 3, C.rockL);
    keep(R, x - 62, x + 62);
  }
  function cPool(R, x) {
    const wd = 116, hd = 52;
    cAlcove(R, x, wd, hd);
    r(x - wd / 2 + 1, Y - 20, wd - 2, 16, C.waterD); r(x - wd / 2 + 1, Y - 20, wd - 2, 1, '#3a7a98'); r(x - wd / 2 + 1, Y - 12, wd - 2, 8, C.water);
    crystal(R, x - 30, Y - 21, 5); crystal(R, x + 22, Y - 21, 4); crystal(R, x + 40, Y - 21, 3);
    r(x - 32, Y - 18, 6, 1, C.cry); r(x + 20, Y - 17, 5, 1, C.cry); r(x - 30, Y - 14, 3, 1, C.cryD);
    for (let xx = x - wd / 2 - 2; xx < x + wd / 2; xx += 9) { const h = 3 + ((xx * 7) & 3); r(xx, Y - 4 - h, 9, h + 4, mix(C.rock, C.rockL, 0.3)); r(xx, Y - 4 - h, 8, 1, C.rockL); }
    R.anim.push({ k: 'water', x: x - wd / 2 + 2, y: Y - 19, w: wd - 4, h: 12, col: 'rgba(143,208,234,0.5)' });
  }
  function cDeco(R) {
    const rn = R.rn, w = R.w;
    const fs = [cBridge, cSteps, cPool];
    const n = w > 500 ? 2 : 1, st = Math.floor(rn() * 3);
    for (let i = 0; i < n; i++) {
      for (let tries = 0; tries < 8; tries++) {
        const x = SW + 80 + Math.floor(rn() * (w - 2 * SW - 160));
        if (free(R, x - 72, x + 72)) { fs[(st + i) % 3](R, x); break; }
      }
    }
    for (let i = 0; i < 14; i++) {
      const x = SW + 16 + Math.floor(rn() * (w - 2 * SW - 32));
      if (!free(R, x - 14, x + 14)) continue;
      crystal(R, x, 60 + Math.floor(rn() * 76), 3 + Math.floor(rn() * 3), rn() < 0.8 ? C.cry : '#7ae0c0');
      keep(R, x - 26, x + 26);
    }
  }
  function cFloor(R) {
    const rn = R.rn, w = R.w;
    floorBase(R, C.floor);
    persp(R, 58, dim(C.floor, 0.18), { stagger: true, broken: 0.45 });
    patches(R, w / 22, 0.03);
    for (let i = 0, n = w / 60; i < n; i++) {
      // vũng nước đọng
      const x = rn() * w, y = Y + 14 + rn() * (LIP - Y - 26), rx = 9 + rn() * 12;
      ell(x, y, rx, 2 + rn() * 2, mix(C.floor, C.water, 0.5)); r(x - rx * 0.4, y - 1, rx * 0.5, 1, mix(C.floor, C.waterL, 0.3));
    }
    for (let i = 0, n = w / 14; i < n; i++) {
      const x = Math.floor(rn() * w), y = Y + 8 + Math.floor(rn() * (LIP - Y - 12)), k = rn();
      if (k < 0.5) { r(x, y, 6, 1, dim(C.floor, 0.25)); r(x + 5, y + 1, 4, 1, dim(C.floor, 0.25)); } else if (k < 0.85) { r(x, y - 1, 4, 2, '#343c46'); r(x, y - 1, 3, 1, '#667686'); } else { r(x, y - 1, 3, 2, '#c8b0a8'); r(x + 1, y - 2, 1, 1, '#e8dcd0'); }
    }
    r(0, Y, w, 1, '#62768a'); r(0, Y + 1, w, 1, dim(C.floor, 0.4));
    for (let x = 0; x < w; x += 8) { const k = rn(); if (k < 0.5) { const ww = 4 + Math.floor(k * 12); r(x, Y - 2, ww, 3, mix(C.rock, C.rockL, 0.4)); r(x, Y - 2, ww - 1, 1, '#62768a'); } }
  }
  function cFore(R, x1) {
    const rn = R.rn, w = x1 || R.w;
    for (let x = 8; x < R.w; x += 30 + Math.floor(rn() * 40)) spike(x, 0, 10 + Math.floor(rn() * 8), 8 + Math.floor(rn() * 12), 1, '#05090e');
    for (let x = 10; x < w; x += 34 + Math.floor(rn() * 50)) spike(x, LIP + 3, 9 + Math.floor(rn() * 8), 5 + Math.floor(rn() * 7), -1, '#070c12', '#1a2836');
  }
  // Ải Ngư Tinh: bên phải là nước sâu thông ra biển, nước dâng theo shrink.
  function cNguWall(R) {
    const rn = R.rn, w = R.w, sx = w - 188, hz = 116;
    cWall(R);
    // bầu trời đêm và mặt biển ngoài miệng hang
    r(sx, 0, 188, 60, '#0b1a30'); r(sx, 60, 188, 30, '#10283f'); r(sx, 90, 188, hz - 90, '#183a54'); r(sx, hz - 4, 188, 4, '#24506c');
    glow(w - 78, 66, 30, 26, '#cfeaff', 0.06);
    ell(w - 78, 66, 9, 9, '#e9f6ff'); r(w - 82, 62, 3, 2, '#bcd8ea'); r(w - 76, 68, 2, 2, '#bcd8ea');
    r(sx, hz, 188, Y - hz, C.waterD); r(sx, hz, 188, 1, '#4a8aa8'); r(sx, hz + 8, 188, Y - hz - 8, mix(C.waterD, C.water, 0.5));
    for (let i = 0; i < 4; i++) spike(sx + 40 + i * 38 + Math.floor(rn() * 12), hz + 1, 10 + Math.floor(rn() * 10), 10 + Math.floor(rn() * 16), -1, '#0c1826');
    R.anim.push({ k: 'water', x: sx + 20, y: hz + 2, w: 168, h: Y - hz - 2, col: 'rgba(170,220,240,0.35)' });
    R.anim.push({ k: 'moon', x: w - 78, y: hz + 3 });
    // viền miệng hang gồ ghề
    for (let x = sx - 6; x < w; x += 6) {
      const u = (x - sx) / 188, hgt = 30 + Math.round(26 * Math.pow(Math.abs(u - 0.55) * 1.9, 2)) + Math.floor(rn() * 6);
      r(x, 0, 6, hgt, C.rockD); r(x, hgt - 2, 6, 2, mix(C.rockD, C.rock, 0.6));
      if (rn() < 0.4) spike(x + 3, hgt, 4 + Math.floor(rn() * 3), 6 + Math.floor(rn() * 14), 1, '#0d1620', '#27394b');
    }
    for (let y = 30; y < Y; y += 6) {
      const u = (y - 30) / (Y - 30), ww = 8 + Math.round(18 * (1 - u) * (1 - u)) + Math.floor(rn() * 5);
      r(sx - 4, y, ww, 6, C.rock); r(sx - 4 + ww - 2, y, 2, 6, C.rockL);
      const w2 = 6 + Math.round(14 * (1 - u) * (1 - u)) + Math.floor(rn() * 4);
      r(w - w2, y, w2, 6, C.rockD); r(w - w2, y, 1, 6, C.rock);
    }
    keep(R, sx - 20, w);
  }
  function cFlood(R) {
    const rn = R.rn, w = R.w, sx = w - 188, sh = R.shrink;
    const foam = 'rgba(225,245,255,0.8)', wl = 'rgba(143,208,234,0.4)';
    // vùng nước sâu bên phải, nơi Ngư Tinh trồi lên
    r(sx, Y, 188, H - Y, C.waterD);
    r(sx + 60, Y + 30, 128, H - Y - 30, '#0e2c42');
    for (let y = Y; y < H; y += 4) {
      const off = Math.floor(rn() * 5);
      r(sx - off, y, off + 6, 4, C.water); r(sx - off - 2, y, 2, 4, lite(C.floor, 0.16)); r(sx - off, y, 1, 4, '#0c2030');
      r(sx + 6, y, 5, 4, mix(C.water, C.waterD, 0.5));
    }
    R.anim.push({ k: 'water', x: sx + 2, y: Y, w: 186, h: H - Y, col: wl });
    R.anim.push({ k: 'foamV', x: sx - 1, y: Y + 2, h: H - Y - 4 });
    if (!sh) return;
    const x0 = Math.max(0, sh.x0 || 0), y0 = sh.y0, y1 = sh.y1;
    // nước phủ đúng phần không còn đi được: dải trên, dải dưới và mé trái
    r(0, Y, sx, y0 - Y, C.water); r(0, Y, sx, 2, C.waterD);
    r(0, y1, sx, H - y1, C.water); r(0, y1 + 14, sx, H - y1 - 14, mix(C.water, C.waterD, 0.6));
    if (x0 > 0) { r(0, y0, x0, y1 - y0, C.water); r(0, y0, Math.max(0, x0 - 30), y1 - y0, mix(C.water, C.waterD, 0.4)); }
    // mép bệ đá còn khô
    r(x0, y0, sx - x0, 1, lite(C.floor, 0.2)); r(x0, y0 - 1, sx - x0, 1, '#0c2030');
    r(x0, y1 - 2, sx - x0, 2, dim(C.floor, 0.45)); r(x0, y1 - 3, sx - x0, 1, lite(C.floor, 0.12));
    if (x0 > 0) { r(x0, y0, 1, y1 - y0, lite(C.floor, 0.18)); r(x0 - 1, y0, 1, y1 - y0, '#0c2030'); }
    // đá ngầm lờ mờ dưới nước
    for (let i = 0; i < 16; i++) { const x = Math.floor(rn() * sx), top = rn() < 0.5, y = top ? Y + 3 + Math.floor(rn() * Math.max(1, y0 - Y - 8)) : y1 + 6 + Math.floor(rn() * Math.max(1, H - y1 - 12)); r(x, y, 8 + Math.floor(rn() * 10), 2, 'rgba(10,30,46,0.5)'); }
    R.anim.push({ k: 'water', x: 0, y: Y + 1, w: sx, h: y0 - Y - 2, col: wl }, { k: 'water', x: 0, y: y1 + 2, w: sx, h: H - y1 - 2, col: wl });
    R.anim.push({ k: 'foamH', x: x0, y: y0 - 2, w: sx - x0 }, { k: 'foamH', x: x0, y: y1, w: sx - x0 });
    if (x0 > 0) R.anim.push({ k: 'water', x: 0, y: y0, w: x0 - 2, h: y1 - y0, col: wl }, { k: 'foamV', x: x0 - 2, y: y0 + 2, h: y1 - y0 - 4 });
  }
  function cBoss(R) {
    // hang lớn của trùm nhỏ: hồ ngầm rộng và khối tinh thể khổng lồ
    const w = R.w, cx = w / 2;
    cPool(R, cx - 120); cBridge(R, cx + 110);
    for (let k = -2; k <= 2; k++) crystal(R, cx + k * 9, Y - 6 - (2 - Math.abs(k)) * 3, 9 - Math.abs(k) * 2, k % 2 ? '#7ae0c0' : C.cry);
    glow(cx, Y - 30, 70, 50, C.cry, 0.05);
    keep(R, cx - 40, cx + 40);
  }

  // ---------- LÂU ĐÀI CỔ ----------
  function kWall(R) {
    const rn = R.rn, w = R.w;
    bricks(0, 0, w, Y, 20, 10, [K.brick, K.brick, mix(K.brick, K.brickL, 0.5), mix(K.brick, K.brickD, 0.35)], K.brickD, rn, 0.03 + R.lvl * 0.1);
    bricks(0, Y - 18, w, 18, 30, 9, [K.stone, mix(K.stone, K.brick, 0.35), mix(K.stone, K.brick, 0.2)], K.brickD, rn, 0);
    r(0, Y - 19, w, 1, K.stoneL); r(0, Y - 2, w, 2, K.brickD);
    r(0, 0, w, 30, 'rgba(0,0,0,0.4)');
    // xà gỗ chạy suốt tường
    r(0, 30, w, 8, K.wood); r(0, 30, w, 1, K.woodL); r(0, 37, w, 1, K.woodD); r(0, 38, w, 4, 'rgba(0,0,0,0.3)');
    for (let x = 6; x < w; x += 34 + Math.floor(rn() * 30)) { r(x, 31, 1, 6, K.woodD); r(x + 5, 33, 7, 1, K.woodD); }
    r(0, 42, w, 16, 'rgba(0,0,0,0.12)'); r(0, Y - 30, w, 12, 'rgba(0,0,0,0.08)');
  }
  function kBays(R) {
    const w = R.w, t = R.type;
    let ps;
    if (t === 'choice') ps = [115, 245, 375];
    else if (w > 500) { const n = 5, bw = (w - 2 * SW) / n; ps = []; for (let i = 1; i < n; i++) ps.push(Math.round(SW + bw * i)); } else if (t === 'chest' || t === 'fountain' || t === 'merchant' || t === 'curse' || R.rn() < 0.4) ps = [164, 336];
    else ps = [134, 240, 346];
    const cs = [], all = [SW + 2].concat(ps, [w - SW - 2]);
    for (let i = 0; i < all.length - 1; i++) cs.push({ x: Math.round((all[i] + all[i + 1]) / 2), w: all[i + 1] - all[i] });
    return { ps, cs };
  }
  function kArmor(R, x) {
    const yb = Y - 19;
    arch(x - 22, yb, 44, 70, K.stoneL); arch(x - 20, yb, 40, 68, K.stone); arch(x - 17, yb, 34, 64, '#171011'); r(x - 17, yb - 20, 34, 20, '#1d1516');
    r(x - 9, yb - 3, 18, 3, K.stone); r(x - 9, yb - 3, 18, 1, K.stoneL);
    // bộ giáp đứng trong hốc tường
    r(x - 4, yb - 17, 3, 14, K.iron); r(x + 1, yb - 17, 3, 14, K.iron); r(x - 4, yb - 17, 1, 14, K.ironL);
    r(x - 6, yb - 32, 12, 15, K.iron); r(x - 6, yb - 32, 2, 15, K.ironL); r(x - 6, yb - 20, 12, 2, '#3a3a42'); r(x - 1, yb - 30, 2, 9, '#3a3a42');
    r(x - 10, yb - 34, 20, 5, K.ironL); r(x - 10, yb - 30, 20, 1, K.iron); r(x - 10, yb - 29, 3, 9, K.iron); r(x + 7, yb - 29, 3, 9, K.iron);
    r(x - 4, yb - 43, 8, 9, K.ironL); r(x - 4, yb - 43, 8, 2, '#b0b0bc'); r(x - 3, yb - 39, 6, 1, '#1a1414'); r(x, yb - 39, 1, 4, '#1a1414'); r(x - 1, yb - 47, 2, 4, K.red); r(x - 1, yb - 48, 4, 2, K.red);
    r(x + 12, yb - 56, 1, 53, K.woodL); r(x + 11, yb - 60, 3, 5, K.ironL); r(x + 12, yb - 62, 1, 2, K.ironL);
    ell(x - 9, yb - 20, 5, 7, K.redD); ell(x - 9, yb - 20, 4, 6, K.red); r(x - 10, yb - 21, 2, 2, K.gold);
  }
  function kWindow(R, x) {
    const yb = Y - 44, night = R.seed % 2;
    arch(x - 19, yb + 3, 38, 58, K.stoneL); arch(x - 17, yb + 3, 34, 56, K.stone);
    arch(x - 13, yb, 26, 50, night ? '#141c34' : '#5a2430');
    if (night) { r(x - 13, yb - 16, 26, 16, '#1c2a48'); ell(x + 3, yb - 33, 4, 4, '#e9f0ff'); r(x + 4, yb - 35, 2, 2, '#c4cce4'); r(x - 8, yb - 26, 1, 1, '#ffffff'); r(x + 8, yb - 12, 1, 1, '#ffffff'); r(x - 4, yb - 8, 1, 1, '#c8d4ff'); r(x - 6, yb - 40, 1, 1, '#ffffff'); } else { r(x - 13, yb - 28, 26, 10, '#8a3428'); r(x - 13, yb - 18, 26, 10, '#c0582c'); r(x - 13, yb - 8, 26, 8, '#e88838'); r(x - 8, yb - 22, 12, 1, '#5a2430'); r(x + 2, yb - 12, 9, 1, '#8a3428'); }
    for (let k = -8; k <= 8; k += 8) { r(x + k - 1, yb - 48, 2, 48, '#26262c'); r(x + k - 1, yb - 48, 1, 48, K.iron); }
    r(x - 13, yb - 30, 26, 2, '#26262c'); r(x - 13, yb - 14, 26, 2, '#26262c');
    r(x - 19, yb + 3, 38, 3, K.stoneL); r(x - 19, yb + 6, 38, 1, K.brickD);
    // vệt sáng hắt xuống tường và sàn
    const lc = night ? '#9ab8ff' : '#ffb060';
    for (let y = yb + 8; y < Y + 60; y += 2) r(x - 13 - (y - yb) * 0.3, y, 26, 2, rgba(lc, y < Y ? 0.05 : 0.035));
  }
  // Hình đầu cáo nhỏ dùng cho cờ và huy hiệu.
  function fox(x, y, col, eye) {
    r(x - 5, y - 4, 3, 4, col); r(x + 2, y - 4, 3, 4, col); r(x - 4, y - 6, 1, 2, col); r(x + 3, y - 6, 1, 2, col);
    r(x - 5, y, 10, 3, col); r(x - 4, y + 3, 8, 2, col); r(x - 2, y + 5, 4, 2, col); r(x - 1, y + 7, 2, 1, col);
    r(x - 3, y + 1, 2, 1, eye); r(x + 1, y + 1, 2, 1, eye); r(x - 1, y + 6, 2, 1, '#1a1414');
  }
  function kBanner(R, x, col, fx) {
    const rn = R.rn, wd = 22, len = 58 + Math.floor(rn() * 10);
    r(x - 13, 40, 26, 2, K.woodD); r(x - 13, 40, 26, 1, K.gold);
    for (let i = 0; i < wd; i += 2) {
      const l = len - Math.floor(rn() * (4 + R.lvl * 22)) - Math.abs(i - 10) * 0.6;
      r(x - 11 + i, 42, 2, l, i < 2 || i >= wd - 2 ? dim(col, 0.2) : col);
    }
    r(x - 11, 42, 22, 2, dim(col, 0.35)); r(x - 9, 44, 1, len - 22, K.gold); r(x + 8, 44, 1, len - 22, K.gold); r(x - 9, 48, 18, 1, K.gold);
    r(x - 4, 42, 2, len - 16, 'rgba(0,0,0,0.12)'); r(x + 3, 42, 2, len - 18, 'rgba(255,255,255,0.05)');
    if (fx) fox(x, 62, '#f0e4d0', '#c8372d');
    else { r(x - 1, 58, 2, 12, K.gold); r(x - 5, 63, 10, 2, K.gold); r(x - 3, 60, 6, 8, rgba(K.gold, 0.4)); }
    if (R.lvl > 0.3 && rn() < 0.6) r(x - 6 + Math.floor(rn() * 8), 76 + Math.floor(rn() * 10), 3, 5, K.brickD);
  }
  function kShield(R, x) {
    const y = 84;
    ln(x - 14, y - 14, x + 14, y + 16, K.ironL, 2); ln(x + 14, y - 14, x - 14, y + 16, K.ironL, 2); r(x - 16, y - 16, 4, 3, K.gold); r(x + 13, y - 16, 4, 3, K.gold);
    r(x - 9, y - 10, 18, 14, DARK); r(x - 7, y + 4, 14, 4, DARK); r(x - 4, y + 8, 8, 3, DARK);
    r(x - 8, y - 9, 16, 13, K.red); r(x - 6, y + 4, 12, 3, K.red); r(x - 3, y + 7, 6, 3, K.red); r(x - 8, y - 9, 16, 2, lite(K.red, 0.2)); r(x - 8, y - 9, 2, 13, lite(K.red, 0.15));
    r(x - 1, y - 9, 2, 19, K.gold); r(x - 8, y - 3, 16, 2, K.gold);
  }
  function kChains(R, x) {
    chain(x - 8, 38, 40, K.ironL); chain(x + 8, 38, 30, K.ironL);
    r(x - 10, 78, 5, 4, K.iron); r(x - 9, 79, 3, 2, '#171011'); r(x + 6, 68, 5, 4, K.iron); r(x + 7, 69, 3, 2, '#171011');
    r(x - 6, Y - 22, 3, 3, '#3a2a2a');
  }
  function kWallDeco(R) {
    const rn = R.rn, B = kBays(R), t = R.type;
    R.bays = B;
    for (const px of B.ps) { if (R.boss === 'ho' && Math.abs(px - R.w / 2) < 130) continue; pillar(px, 12); torch(R, px, 66); }
    if (t === 'boss') return;
    const fs = [kArmor, kWindow, kBanner, kShield, kWindow, kArmor, kBanner];
    if (t === 'elite' || R.lvl > 0.5) fs.push(kChains, kChains);
    let last = -1;
    const bcol = [K.red, '#2a4a6a', '#3a5a3a', '#5a3a6a'][R.seed % 4];
    for (const b of B.cs) {
      if (!free(R, b.x - 26, b.x + 26) || b.w < 60) continue;
      let k = Math.floor(rn() * fs.length);
      if (fs[k] === last) k = (k + 1) % fs.length;
      last = fs[k];
      if (last === kBanner) { kBanner(R, b.x, bcol, false); if (b.w > 120) { kBanner(R, b.x - 34, dim(bcol, 0.2), false); kBanner(R, b.x + 34, dim(bcol, 0.2), false); } } else last(R, b.x);
      keep(R, b.x - 26, b.x + 26);
    }
  }
  function kFloor(R) {
    const rn = R.rn, w = R.w;
    floorBase(R, K.floor);
    persp(R, 34, dim(K.floor, 0.2), { stagger: true });
    patches(R, w / 16, 0.035);
    for (let i = 0, n = (w / 40) * (1 + R.lvl * 2); i < n; i++) { const x = Math.floor(rn() * w), y = Y + 8 + Math.floor(rn() * (LIP - Y - 14)); r(x, y, 5, 1, dim(K.floor, 0.3)); r(x + 4, y + 1, 4, 1, dim(K.floor, 0.3)); r(x + 2, y - 1, 1, 1, dim(K.floor, 0.3)); }
    r(0, Y, w, 1, K.stoneL); r(0, Y + 1, w, 2, mix(K.stone, K.floor, 0.5)); r(0, Y + 3, w, 1, dim(K.floor, 0.35));
    if (R.carpet) {
      // thảm dài nối cửa vào với cửa ra
      const y0 = 180, y1 = 214, cc = R.type === 'boss' ? '#4a2638' : '#4e2a32';
      r(0, y0, w, y1 - y0, cc); r(0, y0, w, 1, dim(cc, 0.3)); r(0, y1, w, 1, 'rgba(0,0,0,0.3)');
      r(0, y0 + 3, w, 1, '#77593a'); r(0, y1 - 4, w, 1, '#77593a');
      for (let x = 14; x < w; x += 28) { r(x - 2, y0 + 16, 5, 1, lite(cc, 0.1)); r(x - 1, y0 + 15, 3, 3, lite(cc, 0.1)); r(x, y0 + 14, 1, 5, lite(cc, 0.1)); }
    }
  }
  function kFore(R) {
    const w = R.w;
    // vòm góc trần và chân cột ở mép trước
    for (let k = 0; k < 10; k++) { r(0, k * 2, 26 - k * 2.4, 2, '#0b0707'); r(w - 26 + k * 2.4, k * 2, 26 - k * 2.4, 2, '#0b0707'); }
    for (const x of w > 500 ? [70, w / 2, w - 70] : [60, w - 60]) { r(x - 15, LIP - 5, 30, H - LIP + 5, '#0f0b0b'); r(x - 11, LIP - 9, 22, 4, '#0f0b0b'); r(x - 15, LIP - 5, 30, 1, '#2a2222'); r(x - 11, LIP - 9, 22, 1, '#2a2222'); }
  }
  function chandelier(R, x) {
    glow(x, 60, 60, 36, '#ffb050', 0.04);
    chain(x, 0, 46, K.ironL);
    r(x - 20, 48, 40, 3, K.iron); r(x - 20, 48, 40, 1, K.ironL); r(x - 14, 51, 28, 2, '#33333a'); r(x - 2, 44, 4, 4, K.iron);
    for (let k = -18; k <= 18; k += 9) candle(R, x + k - 1, 48, 4);
  }
  const FOX = [
    '......#..#....', '......##.##...', '......#####...', '.....######...', '.....##e####..', '.....########.', '......#####...', '.....#####....', '....######....',
    '.#..#######...', '##..#######...', '##.########...', '##.########...', '.#####.####...', '..####.####...', '..####.####...', '.#####.#####..',
  ];
  // Tượng cáo đá ngồi chầu, mắt sáng.
  function foxStatue(R, x, yb, f) {
    const st = '#8a7c74', sl = '#b0a296', sd = '#5e524e', top = yb - 8 - FOX.length * 2;
    r(x - 16, yb - 8, 32, 8, K.stone); r(x - 16, yb - 8, 32, 1, K.stoneL); r(x - 14, yb - 10, 28, 2, K.stone); r(x - 16, yb - 2, 32, 2, K.brickD);
    FOX.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '.') continue;
        const px = f > 0 ? x - 14 + i * 2 : x + 12 - i * 2;
        const edgeL = i === 0 || row[i - 1] === '.', edgeR = i === row.length - 1 || row[i + 1] === '.';
        r(px, top + j * 2, 2, 2, ch === 'e' ? '#ff9a3a' : edgeL ? sl : edgeR ? sd : st);
        if (ch === 'e') R.anim.push({ k: 'eye', x: px, y: top + j * 2, ph: R.rn() * 9 });
      }
    });
  }
  function kBoss(R) {
    const w = R.w, cx = w / 2, ho = R.boss === 'ho', rn = R.rn;
    if (ho) {
      // chín đuôi cáo đắp nổi xoè sau ngai
      for (let k = 0; k < 9; k++) {
        const a = Math.PI * (1.06 + (k * 0.88) / 8), ox = cx, oy = Y - 44;
        let px = ox, py = oy;
        for (let q = 1; q <= 8; q++) {
          const rr = 14 + q * 8, aa = a + Math.sin(q * 0.7 + k) * 0.06, x = ox + Math.cos(aa) * rr * 1.2, y = Math.max(46, oy + Math.sin(aa) * rr);
          ln(px, py + 1, x, y + 1, '#3a2e2e', 6); ln(px, py, x, y, q > 6 ? '#c0b0a0' : '#85736a', q > 6 ? 4 : 6); px = x; py = y;
        }
        r(px - 1, py - 1, 4, 4, '#e8dcc8');
      }
      glow(cx, Y - 60, 90, 60, '#ff9a40', 0.04);
      // bệ và ngai
      r(cx - 62, Y - 8, 124, 8, K.stone); r(cx - 62, Y - 8, 124, 1, K.stoneL); r(cx - 50, Y - 15, 100, 7, K.stone); r(cx - 50, Y - 15, 100, 1, K.stoneL); r(cx - 62, Y - 2, 124, 2, K.brickD);
      r(cx - 24, Y - 100, 48, 86, DARK); r(cx - 22, Y - 98, 44, 84, K.redD); r(cx - 22, Y - 98, 44, 2, K.gold); r(cx - 22, Y - 98, 2, 84, K.gold); r(cx + 20, Y - 98, 2, 84, K.gold);
      r(cx - 15, Y - 91, 30, 46, K.red); r(cx - 15, Y - 91, 30, 1, lite(K.red, 0.25)); r(cx - 15, Y - 91, 1, 46, lite(K.red, 0.15));
      r(cx - 14, Y - 108, 28, 9, DARK); r(cx - 12, Y - 106, 24, 8, K.gold); r(cx - 6, Y - 112, 12, 6, DARK); r(cx - 4, Y - 110, 8, 5, K.gold); r(cx - 1, Y - 114, 2, 4, '#ffe9a3');
      r(cx - 28, Y - 110, 8, 14, DARK); r(cx + 20, Y - 110, 8, 14, DARK); r(cx - 27, Y - 109, 6, 12, K.gold); r(cx + 21, Y - 109, 6, 12, K.gold); r(cx - 26, Y - 113, 4, 4, '#ffe9a3'); r(cx + 22, Y - 113, 4, 4, '#ffe9a3');
      fox(cx, Y - 80, '#f0e4d0', '#ffb030'); r(cx - 9, Y - 62, 18, 1, K.gold); r(cx - 6, Y - 58, 12, 1, K.gold);
      r(cx - 28, Y - 44, 56, 10, DARK); r(cx - 27, Y - 43, 54, 8, K.wood); r(cx - 27, Y - 43, 54, 2, K.gold); r(cx - 21, Y - 41, 42, 5, K.red); r(cx - 21, Y - 41, 42, 1, lite(K.red, 0.2));
      r(cx - 32, Y - 56, 9, 42, DARK); r(cx + 23, Y - 56, 9, 42, DARK); r(cx - 31, Y - 55, 7, 40, K.wood); r(cx + 24, Y - 55, 7, 40, K.wood); r(cx - 31, Y - 55, 7, 2, K.gold); r(cx + 24, Y - 55, 7, 2, K.gold); r(cx - 31, Y - 53, 1, 38, K.woodL); r(cx + 24, Y - 53, 1, 38, K.woodL);
      r(cx - 24, Y - 34, 48, 20, K.woodD); r(cx - 24, Y - 34, 48, 1, K.wood); r(cx - 2, Y - 30, 4, 4, K.gold);
      foxStatue(R, cx - 84, Y - 2, 1); foxStatue(R, cx + 84, Y - 2, -1);
      wallBrazier(R, cx - 116, Y - 2); wallBrazier(R, cx + 116, Y - 2);
      keep(R, cx - 130, cx + 130);
      for (const b of R.bays.cs) if (free(R, b.x - 20, b.x + 20)) { kBanner(R, b.x, '#6a2430', true); keep(R, b.x - 26, b.x + 26); }
      chandelier(R, cx - 150); chandelier(R, cx + 150);
    } else {
      // sảnh lớn của trùm nhỏ: cửa sổ lớn giữa hai dãy cờ, đèn chùm
      kWindow(R, cx); kBanner(R, cx - 44, K.red, true); kBanner(R, cx + 44, K.red, true);
      wallBrazier(R, cx - 84, Y - 2); wallBrazier(R, cx + 84, Y - 2);
      keep(R, cx - 96, cx + 96);
      for (const b of R.bays.cs) if (free(R, b.x - 26, b.x + 26)) { (rn() < 0.5 ? kArmor : kShield)(R, b.x); keep(R, b.x - 26, b.x + 26); }
      chandelier(R, cx - 150); chandelier(R, cx + 150);
    }
  }

  // ---------- trang trí theo loại phòng ----------
  // Hốc kho báu sau lưng rương: khung theo vùng, bên trong chất vàng và bình gốm.
  function vault(R, T, cx) {
    if (R.reg === 0) { fTrunk(R, cx - 56, 112, false); r(cx - 56, 0, 112, 30, '#0c1a12'); }
    arch(cx - 42, Y - 2, 84, 78, T.frameHi); arch(cx - 39, Y - 2, 78, 75, T.frame); arch(cx - 34, Y - 2, 68, 70, '#0e0a08');
    glow(cx, Y - 26, 44, 34, '#ffc850', 0.07);
    if (R.reg === 2) for (let k = -30; k <= 30; k += 10) { r(cx + k, Y - 70, 2, 16 + (Math.abs(k) < 20 ? 0 : -12), K.iron); r(cx + k, Y - 56 + (Math.abs(k) < 20 ? 2 : -10), 2, 2, K.ironL); }
    if (R.reg === 1) { crystal(R, cx - 26, Y - 40, 4); crystal(R, cx + 24, Y - 46, 3, '#7ae0c0'); }
    goldPile(R, cx - 18, Y - 2, 16, 13); goldPile(R, cx + 16, Y - 2, 18, 17); goldPile(R, cx, Y - 2, 12, 8);
    urn(cx - 30, Y - 2, '#7a5a8a'); urn(cx + 30, Y - 4, '#4a7a8a');
    r(cx + 4, Y - 26, 12, 8, DARK); r(cx + 5, Y - 25, 10, 6, '#8a5a2a'); r(cx + 5, Y - 25, 10, 2, '#b88038'); r(cx + 9, Y - 23, 2, 2, '#ffd23f');
    // vàng rơi vãi dọc chân tường
    for (let i = 0; i < 12; i++) { const x = cx - 100 + Math.floor(R.rn() * 200); r(x, Y - 2, 3, 1, '#e8bc48'); r(x + 1, Y - 3, 1, 1, '#fff0a0'); }
    urn(cx - 62, Y - 1, '#8a6a3a'); urn(cx + 60, Y - 1, '#6a4a4a'); goldPile(R, cx - 78, Y - 1, 9, 5); goldPile(R, cx + 80, Y - 1, 10, 6);
    keep(R, cx - 96, cx + 96);
  }
  // Mạch nước chảy từ đầu đá trên tường xuống máng.
  function spring(R, T, x) {
    const st = R.reg === 1 ? C.rockL : R.reg === 0 ? F.stone : K.stone, sl = lite(st, 0.2);
    r(x - 8, 82, 16, 14, DARK); r(x - 7, 83, 14, 12, st); r(x - 7, 83, 14, 1, sl); r(x - 5, 86, 3, 2, '#1a1414'); r(x + 2, 86, 3, 2, '#1a1414'); r(x - 2, 91, 4, 3, '#0c2030');
    r(x - 1, 94, 2, Y - 104, '#3a8ab0');
    r(x - 16, Y - 12, 32, 12, DARK); r(x - 15, Y - 11, 30, 10, st); r(x - 15, Y - 11, 30, 1, sl); r(x - 13, Y - 10, 26, 3, '#2a6a90');
    r(x - 15, Y - 4, 30, 1, dim(st, 0.3));
    R.anim.push({ k: 'fall', x: x - 1, y: 94, h: Y - 104 }, { k: 'water', x: x - 13, y: Y - 10, w: 26, h: 3, col: 'rgba(200,236,250,0.7)' });
    keep(R, x - 22, x + 22);
  }
  function shrine(R, T, cx) {
    // khám thờ nhỏ trên tường, có bài vị và nến
    const st = R.reg === 1 ? C.rockL : R.reg === 0 ? F.stoneL : K.stoneL;
    arch(cx - 20, 112, 40, 52, st); arch(cx - 17, 112, 34, 48, '#161010');
    glow(cx, 96, 26, 22, '#ffc060', 0.07);
    r(cx - 5, 80, 10, 26, '#6a2a22'); r(cx - 5, 80, 10, 2, K.gold); r(cx - 1, 85, 2, 16, K.gold); r(cx - 8, 106, 16, 3, '#4a3020');
    candle(R, cx - 13, 109, 6); candle(R, cx + 11, 109, 6);
    r(cx - 22, 112, 44, 3, st); r(cx - 22, 115, 44, 1, 'rgba(0,0,0,0.4)');
    R.anim.push({ k: 'glint', x: cx, y: 76, ph: 1 });
    keep(R, cx - 28, cx + 28);
  }
  function camp(R, T, cx) {
    // trại của thương nhân: bạt căng, thùng hàng, dây đèn lồng
    const cl = ['#7a5a34', '#6a4a8a', '#3a6a6a'];
    r(cx - 60, 100, 122, Y - 100, 'rgba(0,0,0,0.38)'); // bóng trong lều
    r(cx - 50, Y - 22, 100, 2, K.wood); r(cx - 50, Y - 20, 100, 1, K.woodD); urn(cx - 38, Y - 22, '#7a5a8a'); urn(cx + 6, Y - 22, '#4a7a8a'); crate(cx - 22, Y - 22, 10, '#8a6a3c'); sack(cx + 34, Y - 22, '#a89878');
    for (let i = 0; i < 9; i++) { r(cx - 62 + i * 14, 70, 14, 40 - Math.abs(i - 4) * 2, i % 2 ? '#8a7a5a' : '#a8946a'); r(cx - 62 + i * 14, 70, 1, 40 - Math.abs(i - 4) * 2, 'rgba(0,0,0,0.12)'); }
    r(cx - 62, 70, 126, 2, '#5a4a34'); r(cx - 62, 72, 126, 3, 'rgba(0,0,0,0.2)');
    for (let i = 0; i < 9; i++) r(cx - 62 + i * 14, 110 - Math.abs(i - 4) * 2, 14, 2, '#5a4a34');
    r(cx - 64, 62, 3, Y - 62, K.wood); r(cx + 62, 62, 3, Y - 62, K.wood); r(cx - 64, 62, 1, Y - 62, K.woodL);
    crate(cx - 96, Y, 16, '#7a5a34'); crate(cx - 80, Y, 13, '#6a4a2c'); crate(cx - 92, Y - 16, 12, '#8a6a3c');
    barrel(cx + 82, Y, '#6a4a30'); barrel(cx + 98, Y, '#5a3c28'); sack(cx + 66, Y, '#a89878'); sack(cx - 60, Y, '#98886a');
    r(cx - 40, 76, 16, 22, cl[1]); r(cx - 40, 76, 16, 2, lite(cl[1], 0.2)); r(cx - 36, 82, 8, 8, K.gold);
    r(cx + 22, 78, 16, 20, cl[2]); r(cx + 22, 78, 16, 2, lite(cl[2], 0.2)); r(cx + 26, 84, 8, 2, '#f0e6d0'); r(cx + 26, 88, 8, 2, '#f0e6d0');
    lanternString(R, cx - 130, cx + 130, 46, 12);
    keep(R, cx - 134, cx + 134);
  }
  function darkAltar(R, T, cx) {
    // mặt quỷ đá mắt tím, nến và sọ dọc chân tường
    const st = R.reg === 1 ? C.rock : R.reg === 0 ? F.stoneD : K.brickD;
    arch(cx - 36, Y - 4, 72, 84, lite(st, 0.12)); arch(cx - 33, Y - 4, 66, 80, '#0d080f');
    glow(cx, Y - 46, 50, 40, '#b050f0', 0.06);
    r(cx - 20, Y - 68, 40, 44, '#2a2030'); r(cx - 16, Y - 74, 32, 6, '#2a2030'); r(cx - 14, Y - 24, 28, 8, '#2a2030'); r(cx - 20, Y - 68, 2, 44, '#3e3046');
    r(cx - 24, Y - 80, 6, 14, '#2a2030'); r(cx + 18, Y - 80, 6, 14, '#2a2030'); r(cx - 23, Y - 84, 3, 5, '#3e3046'); r(cx + 20, Y - 84, 3, 5, '#3e3046');
    r(cx - 13, Y - 56, 9, 5, '#d070ff'); r(cx + 4, Y - 56, 9, 5, '#d070ff'); r(cx - 10, Y - 55, 3, 3, '#ffffff'); r(cx + 7, Y - 55, 3, 3, '#ffffff');
    r(cx - 10, Y - 38, 20, 8, '#0d080f'); for (let k = -8; k < 10; k += 4) { r(cx + k, Y - 38, 2, 3, '#c9c2ae'); r(cx + k + 2, Y - 33, 2, 3, '#c9c2ae'); }
    R.anim.push({ k: 'eyes', x: cx - 13, y: Y - 56, ph: 0 });
    for (let k = 0; k < 5; k++) { candle(R, cx - 74 + k * 7, Y - 1, 3 + ((k * 3) % 5)); candle(R, cx + 46 + k * 7, Y - 1, 3 + ((k * 5) % 4)); }
    skull(cx - 88, Y - 1); skull(cx - 96, Y - 1); skull(cx - 92, Y - 5); skull(cx + 90, Y - 1); skull(cx + 98, Y - 1);
    chain(cx - 52, 30, 40, '#55505a'); chain(cx + 52, 30, 52, '#55505a');
    keep(R, cx - 104, cx + 104);
  }
  function ominous(R) {
    // phòng tinh anh: xích sắt, sọ cắm cọc, vết cào
    const rn = R.rn, w = R.w;
    for (let i = 0; i < 5; i++) {
      const x = SW + 30 + Math.floor(rn() * (w - 2 * SW - 60));
      if (!free(R, x - 10, x + 10)) continue;
      if (i % 2) { r(x, Y - 22, 1, 22, '#5a4a3a'); skull(x, Y - 20); } else { for (let k = 0; k < 3; k++) ln(x + k * 5, 70, x + k * 5 - 8, 96, '#1a0e0e', 2); }
      keep(R, x - 12, x + 12);
    }
    for (let x = 60; x < w - 40; x += 90 + Math.floor(rn() * 40)) chain(x, 26, 16 + Math.floor(rn() * 30), '#6a6a72');
  }
  function typeWall(R, T) {
    const t = R.type, cx = 250;
    if (t === 'chest') vault(R, T, cx);
    else if (t === 'fountain') { shrine(R, T, 245); spring(R, T, 112); spring(R, T, 378); } else if (t === 'merchant') camp(R, T, cx);
    else if (t === 'curse') darkAltar(R, T, cx);
    else if (t === 'choice') { keep(R, 150, 210); keep(R, 280, 340); if (R.reg !== 2) lantern(R, 245, 70, '#e8b04a', 36); keep(R, 225, 265); } else if (t === 'challenge') {
      // cờ đồng hồ cát báo hiệu phòng thử thách
      for (const x of [SW + 36, R.w - SW - 36]) { r(x - 1, 46, 2, Y - 46, '#5a4a3a'); r(x + 1, 48, 16, 22, '#22506a'); r(x + 1, 48, 16, 2, '#3a7a9a'); r(x + 5, 53, 8, 2, '#f0e6d0'); r(x + 7, 55, 4, 2, '#f0e6d0'); r(x + 8, 57, 2, 2, '#f0e6d0'); r(x + 7, 59, 4, 2, '#f0e6d0'); r(x + 5, 61, 8, 2, '#f0e6d0'); keep(R, x - 8, x + 22); }
    }
  }
  function typeFloor(R, T) {
    const t = R.type;
    if (t === 'merchant') rug(206, 178, 88, 24, R.reg === 2 ? '#3d4a56' : '#4a3a44', '#8a7a5a');
    else if (t === 'curse') {
      // vòng ấn chú quanh bàn thờ
      for (let a = 0; a < 6.28; a += 0.06) r(250 + Math.cos(a) * 46, 190 + Math.sin(a) * 20, 2, 1, 'rgba(176,80,240,0.3)');
      for (let a = 0; a < 6.28; a += 0.09) r(250 + Math.cos(a) * 34, 190 + Math.sin(a) * 15, 2, 1, 'rgba(176,80,240,0.2)');
      for (let k = 0; k < 6; k++) { const a = k * 1.047; r(250 + Math.cos(a) * 40 - 1, 190 + Math.sin(a) * 17.5 - 1, 3, 3, 'rgba(208,112,255,0.4)'); }
    } else if (t === 'choice') {
      // lối mòn từ hai cửa toả xuống
      for (const dx of [180, 310]) for (let y = Y + 2; y < 200; y += 2) { const k = (y - Y) / 58; r(dx - 14 - k * 10, y, 28 + k * 20, 2, 'rgba(255,255,255,' + (0.05 * (1 - k)).toFixed(3) + ')'); }
    } else if (t === 'fountain') {
      for (const fx of [190, 300]) { ell(fx, 200, 26, 9, 'rgba(0,0,0,0.1)'); ell(fx, 200, 22, 7, 'rgba(255,255,255,0.04)'); }
    } else if (t === 'chest') {
      ell(250, 191, 34, 11, 'rgba(255,210,90,0.06)'); ell(250, 191, 22, 7, 'rgba(255,210,90,0.06)');
    }
  }

  // ---------- dựng một phòng ----------
  function build(o) {
    const cv = document.createElement('canvas');
    cv.width = o.w; cv.height = H;
    const prev = c;
    c = cv.getContext('2d');
    const R = Object.assign({ rn: G.srand(o.seed * 7919 + o.reg * 131 + 17), anim: [], kept: [], lvl: Math.min(1, o.i / 4) }, o);
    const T = TH[o.reg], w = o.w, t = o.type;
    const ngu = o.reg === 1 && t === 'boss' && o.boss === 'ngu';
    try {
      keep(R, 0, SW + 14); keep(R, w - SW - 14, w);
      if (o.reg === 0) {
        fWall(R);
        if (t === 'boss') fBoss(R);
        typeWall(R, T);
        if (t === 'elite') ominous(R);
        fDeco(R);
        fFloor(R); typeFloor(R, T);
        lip(R, T); fFore(R);
      } else if (o.reg === 1) {
        if (ngu) cNguWall(R); else cWall(R);
        if (t === 'boss' && !ngu) cBoss(R);
        typeWall(R, T);
        if (t === 'elite') ominous(R);
        if (t === 'boss' || t === 'chest' || t === 'curse' || t === 'merchant') { for (let i = 0; i < 8; i++) { const x = SW + 20 + Math.floor(R.rn() * (w - 2 * SW - 40)); if (free(R, x - 14, x + 14)) { crystal(R, x, 62 + Math.floor(R.rn() * 70), 3 + Math.floor(R.rn() * 3)); keep(R, x - 24, x + 24); } } } else cDeco(R);
        cSpikes(R, ngu ? w - 196 : w);
        cFloor(R); typeFloor(R, T);
        lip(R, T); cFore(R, ngu ? w - 190 : w);
        if (ngu) cFlood(R);
      } else {
        R.carpet = t === 'boss' || t === 'elite' || (t !== 'curse' && t !== 'merchant' && R.rn() < 0.5);
        kWall(R);
        typeWall(R, T);
        kWallDeco(R);
        if (t === 'boss') kBoss(R);
        if (t === 'elite') ominous(R);
        kFloor(R); typeFloor(R, T);
        if (R.boss === 'ho') { const cx = w / 2; r(cx - 26, Y + 4, 52, 180 - Y - 4, '#4a2638'); r(cx - 23, Y + 4, 1, 180 - Y - 4, '#77593a'); r(cx + 22, Y + 4, 1, 180 - Y - 4, '#77593a'); }
        lip(R, T); kFore(R);
      }
      // tia nắng trong rừng
      if (o.reg === 0 && t !== 'curse') { const n = w > 500 ? 3 : 2; for (let i = 0; i < n; i++) shaft(R, Math.round((w * (i + 0.7 + R.rn() * 0.3)) / n), 16 + Math.floor(R.rn() * 12)); }
      // tường bên: cửa vào bên trái đã đóng lại, cửa ra bên phải mở khi dọn xong phòng
      sideWall(R, -1, T, 'closed');
      if (!ngu) {
        sideWall(R, 1, T, o.cleared ? 'open' : 'closed');
        if (o.cleared) spill(R, T);
      }
      // không khí chung: càng vào sâu càng tối, phòng lời nguyền và tinh anh có sắc riêng
      if (o.i > 0) r(0, 0, w, H, 'rgba(0,0,0,' + (0.03 * o.i).toFixed(2) + ')');
      if (t === 'curse') { r(0, 0, w, H, 'rgba(22,6,36,0.3)'); }
      if (t === 'elite') { r(0, 0, w, H, 'rgba(40,0,0,0.13)'); r(0, 0, w, 46, 'rgba(0,0,0,0.2)'); }
      for (let k = 0; k < 4; k++) { r(0, 0, 10 + k * 9, H, 'rgba(0,0,0,0.035)'); r(w - 10 - k * 9, 0, 10 + k * 9, H, 'rgba(0,0,0,0.035)'); }
      r(0, 0, w, 14, 'rgba(0,0,0,0.25)');
      // sinh vật nhỏ và bụi sáng bay trong phòng
      if (o.reg === 0) for (let i = 0; i < (w > 500 ? 8 : 6); i++) R.anim.push({ k: 'fly', x: 30 + R.rn() * (w - 60), y: 60 + R.rn() * 70, ph: R.rn() * 9 });
      if (o.reg === 2) for (let i = 0; i < 5; i++) R.anim.push({ k: 'ember', x: 30 + R.rn() * (w - 60), y: Y, ph: R.rn() * 9 });
    } finally { c = prev; }
    return { cv, anim: R.anim };
  }

  // ---------- phần chuyển động, vẽ trực tiếp mỗi khung hình ----------
  function live(cx, room, cam, t) {
    const W = G.W;
    const p = (x, y, w, h, col) => { cx.fillStyle = col; cx.fillRect(x, y, w, h); };
    for (const a of room.anim) {
      const x = Math.round(a.x - cam);
      if (a.k === 'water') {
        const xa = Math.max(0, x), xb = Math.min(W, x + a.w);
        if (xb <= xa) continue;
        cx.fillStyle = a.col;
        for (let yy = a.y + 1, row = 0; yy < a.y + a.h - 1; yy += 7, row++) {
          const off = (t * (5 + (row % 3) * 2.5) + row * 13) % 36;
          const len = 7 + (row % 3) * 3;
          for (let xx = x - 36 + Math.round(off) + (row % 2) * 13; xx < xb; xx += 36) {
            const u = Math.max(xa, xx), v = Math.min(xb, xx + len);
            if (v > u) cx.fillRect(u, yy + (Math.sin(t * 2 + row + xx * 0.1) > 0.4 ? 1 : 0), v - u, 1);
          }
        }
        continue;
      }
      if (a.k === 'foamH') {
        const xa = Math.max(0, x), xb = Math.min(W, x + a.w), f = Math.floor(t * 3) % 2;
        cx.fillStyle = 'rgba(225,245,255,0.8)';
        for (let xx = x - ((x % 22) + 22) % 22 + f * 4; xx < xb; xx += 22) { const u = Math.max(xa, xx), v = Math.min(xb, xx + 12); if (v > u) cx.fillRect(u, a.y + ((xx / 22) & 1), v - u, 1); }
        continue;
      }
      if (x < -40 || x > W + 40) continue;
      const f3 = Math.floor(t * 10 + a.ph) % 3;
      switch (a.k) {
        case 'torch': {
          const s = a.big ? 1 : 0;
          p(x - 2 - s, a.y - 4 - s, 4 + 2 * s, 4 + s, '#ff7a2a');
          p(x - 1 + (f3 === 1 ? 1 : f3 === 2 ? -1 : 0), a.y - 7 - f3 - s * 2, 2 + s, 4 + s, '#ff7a2a');
          p(x - 1, a.y - 3 - s, 2, 3, '#ffd23f'); p(x - 1 + (f3 & 1), a.y - 5 - s, 1, 2, '#ffd23f');
          if (f3 === 0) p(x + 1, a.y - 10 - s * 3, 1, 1, '#ffb040');
          break;
        }
        case 'candle': p(x, a.y - 1 - (f3 === 1 ? 1 : 0), 2, 2, '#ffd23f'); p(x, a.y, 1, 1, '#fff3b0'); break;
        case 'lantern': if (f3) p(x - 1, a.y + 1 + (f3 & 1), 2, 4, a.col); break;
        case 'glint': {
          const k = (t * 0.9 + a.ph) % 3;
          if (k < 0.3) { p(x, a.y - 2, 1, 5, '#ffffff'); p(x - 2, a.y, 5, 1, '#ffffff'); } else if (k < 0.45) p(x, a.y, 1, 1, '#ffffff');
          break;
        }
        case 'drip': { const dy = a.y + ((t * 70 + a.ph * 40) % (a.y1 - a.y + 60)); if (dy < a.y1) p(x, Math.round(dy), 1, 3, '#9fdcff'); else if (dy < a.y1 + 8) p(x - 2, a.y1, 5, 1, 'rgba(159,220,255,0.6)'); break; }
        case 'fall': { cx.fillStyle = '#bfe6f8'; for (let yy = a.y + ((t * 40) % 8 | 0); yy < a.y + a.h - 2; yy += 8) cx.fillRect(x + ((yy >> 3) & 1), yy, 1, 3); break; }
        case 'fly': {
          if (Math.sin(t * 3 + a.ph * 1.7) < 0) break;
          const fx = Math.round(x + Math.sin(t * 0.7 + a.ph) * 9), fy = Math.round(a.y + Math.cos(t * 0.9 + a.ph * 2) * 6);
          p(fx - 1, fy - 1, 3, 3, 'rgba(244,255,154,0.25)'); p(fx, fy, 1, 1, '#f4ff9a');
          break;
        }
        case 'ember': { const k = (t * 14 + a.ph * 23) % 110; p(Math.round(x + Math.sin(t * 1.3 + a.ph) * 6), Math.round(a.y - k), 1, 1, k > 70 ? '#a8501a' : a.ph > 4 ? '#ffb040' : '#ff6a2a'); break; }
        case 'mote': { for (let i = 0; i < 3; i++) { const k = (t * 5 + a.ph * 9 + i * 31) % 90; p(Math.round(x + i * 9 - k * 0.38 + Math.sin(t + i) * 3), Math.round(a.y + k), 1, 1, 'rgba(244,250,190,0.5)'); } break; }
        case 'blink': if ((t * 0.6 + a.ph) % 4 < 0.25) p(x, a.y, a.w, 1, a.col); break;
        case 'eye': p(x, a.y, 2, 1, Math.sin(t * 2.4 + a.ph) > 0 ? '#ffd23f' : '#ff7a2a'); break;
        case 'eyes': { const al = (0.25 + 0.25 * Math.sin(t * 2.2)).toFixed(2); p(x - 2, a.y - 2, 13, 9, 'rgba(208,112,255,' + al + ')'); p(x + 15, a.y - 2, 13, 9, 'rgba(208,112,255,' + al + ')'); break; }
        case 'moon': { const f = Math.floor(t * 2) % 2; p(x - 8 + f, a.y, 16, 1, '#cfeaff'); p(x - 5 - f, a.y + 4, 11, 1, '#9fcfe8'); p(x - 6 + f, a.y + 9, 13, 1, '#7fb8d8'); p(x - 3 - f, a.y + 15, 8, 1, '#7fb8d8'); break; }
        case 'foamV': { const f = Math.floor(t * 3) % 2; cx.fillStyle = 'rgba(225,245,255,0.8)'; for (let yy = a.y + f * 3; yy < a.y + a.h - 4; yy += 9) cx.fillRect(x + ((yy / 9) & 1), yy, 1, 5); break; }
        case 'exit': {
          // cửa ra đã mở: ánh sáng nhịp nhàng và ba mũi tên chỉ lối
          const al = 0.1 + 0.08 * Math.sin(t * 3);
          for (let k = 0; k < 4; k++) { const lx = DL + k * 7; p(x - lx - 7, sy(90, lx), 7, sy(Y, lx + 3) - sy(90, lx) - 2, rgba('#ffffff', al.toFixed(2))); }
          const ph = Math.floor(t * 4) % 4;
          for (let k = 0; k < 3; k++) {
            const ax = x - 80 + k * 11, ay = 154, col = rgba(a.col, k === ph ? 0.75 : 0.28);
            p(ax, ay - 3, 2, 2, col); p(ax + 2, ay - 1, 2, 2, col); p(ax + 4, ay + 1, 2, 1, col); p(ax + 2, ay + 2, 2, 2, col); p(ax, ay + 4, 2, 2, col);
          }
          break;
        }
      }
    }
  }

  // ---------- A.bg ----------
  const cache = new Map();
  function info(reg, seed, width, shrink) {
    const W = G.getWorld ? G.getWorld() : null, S = G.getRun ? G.getRun() : null;
    const o = { reg, seed, w: Math.max(G.W, Math.round(width) || G.W), type: 'fight', cleared: false, boss: null, i: Math.floor((seed % 100) / 10) % 5, shrink: null };
    if (W && W.seed === seed) {
      o.type = W.type || 'fight';
      o.cleared = !!W.cleared;
      if (o.type === 'boss') {
        o.boss = W.boss ? W.boss.kind : S && S.i === 4 ? G.REGIONS[reg].boss : 'mini';
        o.cleared = !!(W.boss && W.boss.dead) || !!(S && S.loot && S.loot.bossDown);
      }
      if (S && S.W === W && S.i != null) o.i = S.i;
    } else if (shrink && reg === 1) { o.type = 'boss'; o.boss = 'ngu'; }
    if (shrink) o.shrink = { y0: Math.round(shrink.y0), y1: Math.round(shrink.y1), x0: Math.round(shrink.x0 || 0) };
    o.key = [reg, seed, o.w, o.type, o.cleared ? 1 : 0, o.boss || '', o.i, o.shrink ? o.shrink.y0 + '_' + o.shrink.y1 + '_' + o.shrink.x0 : ''].join('|');
    return o;
  }
  A.bg = function (cx, reg, seed, cam, width, shrink) {
    try {
      if (!(reg >= 0 && reg <= 2)) return oldBg.apply(this, arguments);
      const o = info(reg, seed, width, shrink);
      let room = cache.get(o.key);
      if (!room) {
        room = build(o);
        if (cache.size >= 6) cache.delete(cache.keys().next().value);
        cache.set(o.key, room);
      }
      cam = Math.round(cam) || 0;
      cx.drawImage(room.cv, -cam, 0);
      live(cx, room, cam, G.time || 0);
    } catch (e) {
      if (!A.envErr) { A.envErr = e; if (window.console) console.warn('env_art bg', e); }
      oldBg.apply(this, arguments);
    }
  };
  A.envCache = cache;

  // ---------- đồ vật ----------
  let pc = null;
  const q = (x, y, w, h, col) => { pc.fillStyle = col; pc.fillRect(x, y, w, h); };
  function shadow(x, y, rx) { A.ellipse(pc, x, y, rx, 3, 'rgba(0,0,0,0.3)'); }
  // Quầng mời gọi dưới chân vật đánh vỡ được.
  function halo(x, y, col, t) {
    const k = 0.5 + 0.5 * Math.sin(t * 4);
    A.ellipse(pc, x, y, 13 + k * 2, 5 + k, rgba(col, 0.1 + 0.08 * k));
    if (k > 0.6) { q(x - 15, y, 2, 1, rgba(col, 0.6)); q(x + 14, y, 2, 1, rgba(col, 0.6)); }
  }
  function spark(x, y, col) { q(x, y - 2, 1, 5, col); q(x - 2, y, 5, 1, col); }
  const PROPS = {
    chest(o, x, y, t) {
      shadow(x, y, 14);
      q(x - 13, y - 12, 26, 12, DARK);
      q(x - 12, y - 11, 24, 10, '#7a4a22'); q(x - 12, y - 7, 24, 1, '#5a3418'); q(x - 12, y - 3, 24, 2, '#4e2e14');
      q(x - 9, y - 11, 3, 10, '#62626a'); q(x + 6, y - 11, 3, 10, '#62626a'); q(x - 9, y - 11, 1, 10, '#9a9aa4'); q(x + 6, y - 11, 1, 10, '#9a9aa4');
      q(x - 12, y - 11, 2, 2, '#d8a838'); q(x + 10, y - 11, 2, 2, '#d8a838'); q(x - 12, y - 3, 2, 2, '#d8a838'); q(x + 10, y - 3, 2, 2, '#d8a838');
      if (o.used) {
        // nắp bật ra sau, bên trong còn ánh vàng
        q(x - 13, y - 26, 26, 14, DARK);
        q(x - 12, y - 25, 24, 12, '#4e2e14'); q(x - 12, y - 25, 24, 2, '#9a6430'); q(x - 10, y - 22, 20, 8, '#3a2210');
        q(x - 9, y - 25, 3, 12, '#4a4a52'); q(x + 6, y - 25, 3, 12, '#4a4a52');
        q(x - 11, y - 13, 22, 3, '#1a100a'); q(x - 9, y - 13, 8, 2, '#c2942c'); q(x + 2, y - 12, 6, 1, '#c2942c'); q(x - 7, y - 13, 2, 1, '#fff0a0');
        if ((t * 1.3) % 2 < 0.3) spark(x + 4, y - 14, '#fff3b0');
      } else {
        q(x - 14, y - 20, 28, 9, DARK);
        q(x - 13, y - 19, 26, 7, '#9a6430'); q(x - 12, y - 19, 24, 1, '#d09a50'); q(x - 13, y - 13, 26, 1, '#5a3418');
        q(x - 9, y - 19, 3, 7, '#77777f'); q(x + 6, y - 19, 3, 7, '#77777f'); q(x - 9, y - 19, 1, 7, '#b0b0ba'); q(x + 6, y - 19, 1, 7, '#b0b0ba');
        q(x - 3, y - 14, 6, 7, DARK); q(x - 2, y - 13, 4, 5, '#f0c83a'); q(x - 2, y - 13, 4, 1, '#fff0a0'); q(x - 1, y - 11, 2, 2, '#5a3418');
        const k = (t * 1.2) % 2.4;
        if (k < 0.3) spark(x + 8, y - 22, '#fff3b0'); else if (k > 1.2 && k < 1.5) spark(x - 9, y - 20, '#fff3b0');
        // ánh vàng lọt qua khe nắp
        if (Math.floor(t * 3) % 2) q(x - 11, y - 12, 22, 1, 'rgba(255,224,120,0.55)');
      }
    },
    fountain(o, x, y, t) {
      const hp = o.kind === 'hp';
      const col = hp ? '#e8483a' : '#3a8ef0', colL = hp ? '#ffa89a' : '#a8d4ff', colD = hp ? '#8a2a22' : '#22508a';
      shadow(x, y, 16);
      q(x - 9, y - 5, 18, 5, DARK); q(x - 15, y - 12, 30, 8, DARK);
      q(x - 8, y - 4, 16, 4, '#6f727a'); q(x - 8, y - 4, 16, 1, '#8d8f96');
      q(x - 14, y - 11, 28, 6, '#8d8f96'); q(x - 14, y - 6, 28, 1, '#5a5d66'); q(x - 14, y - 11, 28, 1, '#c8cad0'); q(x - 14, y - 11, 1, 6, '#c8cad0');
      q(x - 10, y - 8, 2, 2, '#6f727a'); q(x - 1, y - 8, 2, 2, '#6f727a'); q(x + 8, y - 8, 2, 2, '#6f727a');
      q(x - 3, y - 23, 6, 12, DARK); q(x - 2, y - 22, 4, 11, '#8d8f96'); q(x - 2, y - 22, 1, 11, '#c8cad0');
      q(x - 6, y - 27, 12, 5, DARK); q(x - 5, y - 26, 10, 3, '#a8aab2'); q(x - 5, y - 26, 10, 1, '#d8dae0'); q(x - 3, y - 28, 6, 2, '#a8aab2');
      if (!o.used) {
        const f = Math.floor(t * 6) % 2;
        q(x - 13, y - 12, 26, 2, col); q(x - 11 + f * 3, y - 12, 5, 1, colL); q(x + 4 - f * 3, y - 11, 5, 1, colL);
        q(x - 2, y - 30 - f, 4, 3, col); q(x - 1, y - 31 - f, 2, 1, colL);
        q(x - 7, y - 25, 2, 14, col); q(x + 5, y - 25, 2, 14, col);
        q(x - 7, y - 24 + ((t * 20) % 10 | 0), 1, 3, colL); q(x + 6, y - 24 + ((t * 20 + 5) % 10 | 0), 1, 3, colL);
        q(x - 9, y - 13, 2, 1, colL); q(x + 7, y - 13, 2, 1, colL);
        // biểu tượng: chữ thập là máu, giọt là mana
        const iy = y - 36 + Math.round(Math.sin(t * 3));
        if (hp) { q(x - 2, iy - 1, 5, 7, DARK); q(x - 4, iy + 1, 9, 3, DARK); q(x - 1, iy, 3, 5, col); q(x - 3, iy + 2, 7, 1, col); q(x - 1, iy, 1, 2, colL); } else { q(x - 3, iy + 1, 7, 5, DARK); q(x - 2, iy - 1, 5, 3, DARK); q(x - 1, iy - 2, 3, 2, DARK); q(x - 2, iy + 2, 5, 3, col); q(x - 1, iy, 3, 2, col); q(x, iy - 1, 1, 1, col); q(x - 1, iy + 2, 1, 2, colL); }
      } else { q(x - 13, y - 12, 26, 2, '#3a3d46'); q(x - 9, y - 11, 8, 1, colD); q(x + 3, y - 11, 5, 1, colD); }
    },
    stash(o, x, y, t) {
      // rương đồ: giá vũ khí dựa tường và thùng gỗ
      shadow(x, y, 14);
      q(x - 12, y - 25, 1, 13, '#8a6a44'); q(x - 13, y - 27, 3, 3, '#c9ccd2'); q(x - 12, y - 28, 1, 1, '#e8eef5');
      q(x - 6, y - 24, 2, 12, '#b9c0c9'); q(x - 6, y - 24, 1, 12, '#e8eef5'); q(x - 8, y - 14, 6, 1, '#caa15a'); q(x - 6, y - 13, 2, 2, '#5a4030');
      q(x + 2, y - 22, 1, 10, '#8a6a44'); q(x, y - 25, 5, 4, '#77777f'); q(x, y - 25, 5, 1, '#b0b0ba');
      q(x + 8, y - 23, 1, 11, '#6a4a2a'); q(x + 9, y - 22, 1, 2, '#6a4a2a'); q(x + 10, y - 20, 1, 6, '#6a4a2a'); q(x + 9, y - 14, 1, 2, '#6a4a2a');
      q(x - 13, y - 14, 26, 14, DARK);
      q(x - 12, y - 13, 24, 12, '#6a543e'); q(x - 12, y - 13, 24, 2, '#8a7458'); q(x - 12, y - 9, 24, 1, '#3a2c20'); q(x - 12, y - 5, 24, 1, '#3a2c20');
      q(x - 12, y - 13, 2, 12, '#4a3a2a'); q(x + 10, y - 13, 2, 12, '#4a3a2a');
      q(x - 3, y - 9, 6, 5, DARK); q(x - 2, y - 8, 4, 3, '#caa15a'); q(x - 1, y - 7, 2, 1, '#3a2c20');
      if ((t * 0.8) % 3 < 0.25) spark(x - 5, y - 22, '#ffffff');
    },
    altar(o, x, y, t) {
      shadow(x, y, 14);
      q(x - 13, y - 6, 26, 6, DARK); q(x - 11, y - 16, 22, 11, DARK);
      q(x - 12, y - 5, 24, 5, '#3e3040'); q(x - 12, y - 5, 24, 1, '#5e4c62');
      q(x - 10, y - 15, 20, 10, '#4e3c52'); q(x - 10, y - 15, 20, 2, '#7a5e80'); q(x - 10, y - 15, 1, 10, '#6a5270');
      q(x - 6, y - 12, 12, 7, '#2a1c30');
      const on = !o.used, k = 0.5 + 0.5 * Math.sin(t * 3);
      // chữ ấn phát sáng ở mặt trước
      q(x - 4, y - 11, 2, 5, on ? rgba('#d070ff', 0.5 + 0.5 * k) : '#4a3a52'); q(x - 1, y - 11, 2, 2, on ? '#d070ff' : '#4a3a52'); q(x + 2, y - 11, 2, 5, on ? rgba('#d070ff', 0.5 + 0.5 * k) : '#4a3a52'); q(x - 1, y - 8, 2, 2, on ? '#f0c0ff' : '#4a3a52');
      q(x - 10, y - 20, 2, 5, '#e8e2d0'); q(x + 8, y - 20, 2, 5, '#e8e2d0'); q(x + 9, y - 20, 1, 5, '#b8b0a0');
      // đầu lâu trên mặt bàn thờ
      q(x - 4, y - 21, 8, 6, DARK); q(x - 3, y - 20, 6, 4, '#d8d0bc'); q(x - 2, y - 16, 4, 1, '#a8a08c'); q(x - 2, y - 19, 1, 2, on ? '#d070ff' : '#1a1414'); q(x + 1, y - 19, 1, 2, on ? '#d070ff' : '#1a1414');
      if (on) {
        const f = Math.floor(t * 5) % 2;
        q(x - 10, y - 22 - f, 2, 2, '#ffd23f'); q(x + 8, y - 22 - (1 - f), 2, 2, '#ffd23f');
        A.ellipse(pc, x, y - 27, 7, 6, 'rgba(192,90,240,0.18)');
        q(x - 2, y - 28 - f, 4, 6, '#c05af0'); q(x - 1, y - 31 - f, 2, 4, '#c05af0'); q(x - 1, y - 27 - f, 2, 4, '#f0c0ff');
        q(x - 6 + f * 11, y - 30 + f * 2, 1, 1, '#f0c0ff'); q(x + 4 - f * 9, y - 33, 1, 1, '#c05af0');
      } else { q(x - 3, y - 14, 1, 4, '#1a1014'); q(x - 2, y - 11, 3, 1, '#1a1014'); }
    },
    merchant(o, x, y, t) {
      shadow(x, y, 17);
      // sạp hàng mái sọc, ông lái buôn đội nón lá
      q(x - 15, y - 30, 2, 30, '#5a4030'); q(x + 13, y - 30, 2, 30, '#5a4030'); q(x - 15, y - 30, 1, 30, '#7a5a40');
      q(x - 5, y - 25, 10, 9, DARK);
      q(x - 4, y - 24, 8, 7, '#e0b08a'); q(x - 2, y - 21, 1, 1, '#1a1414'); q(x + 2, y - 21, 1, 1, '#1a1414'); q(x - 1, y - 19, 3, 1, '#8a4a3a'); q(x - 3, y - 18, 6, 1, '#d8d0c0');
      q(x - 8, y - 26, 17, 1, '#b08a45'); q(x - 6, y - 27, 13, 1, '#e8cc80'); q(x - 4, y - 28, 9, 1, '#e8cc80'); q(x - 2, y - 29, 5, 1, '#f0dc98');
      q(x - 6, y - 17, 13, 7, '#4a6a8a'); q(x - 1, y - 17, 3, 7, '#6a8aaa'); q(x - 8, y - 16, 3, 5, '#4a6a8a'); q(x + 6, y - 16, 3, 5, '#4a6a8a');
      q(x - 18, y - 35, 36, 7, DARK);
      for (let i = 0; i < 7; i++) q(x - 17 + i * 5, y - 34, i === 6 ? 4 : 5, 5 + (i % 2), i % 2 ? '#f0e6d0' : '#2a8a7a');
      q(x - 17, y - 34, 34, 1, '#5ac0a8');
      q(x - 17, y - 12, 34, 12, DARK);
      q(x - 16, y - 11, 32, 3, '#a8702f'); q(x - 16, y - 11, 32, 1, '#d09a48'); q(x - 16, y - 8, 32, 8, '#6b4a30'); q(x - 16, y - 5, 32, 1, '#4a3020'); q(x - 6, y - 8, 1, 8, '#4a3020'); q(x + 6, y - 8, 1, 8, '#4a3020');
      // hàng bày trên quầy
      q(x - 13, y - 15, 3, 4, '#e8483a'); q(x - 12, y - 16, 1, 1, '#f0e6d0'); q(x - 8, y - 15, 3, 4, '#3a8ef0'); q(x - 7, y - 16, 1, 1, '#f0e6d0');
      q(x + 3, y - 13, 5, 2, '#ffd23f'); q(x + 4, y - 14, 3, 1, '#fff0a0'); q(x + 10, y - 16, 2, 5, '#8fe04a'); q(x + 10, y - 16, 2, 1, '#e9ffd0');
      const f = Math.floor(t * 4) % 2;
      q(x + 14, y - 28, 1, 3, '#3a2c20'); q(x + 12, y - 25, 5, 6, DARK); q(x + 13, y - 24, 3, 4, f ? '#ffd23f' : '#ffb030'); q(x + 11, y - 26, 7, 8, 'rgba(255,200,80,0.12)');
    },
    brazier(o, x, y, t) {
      shadow(x, y, 11);
      q(x - 6, y - 7, 2, 7, DARK); q(x + 4, y - 7, 2, 7, DARK); q(x - 1, y - 7, 2, 7, DARK);
      q(x - 5, y - 6, 1, 6, '#55504a'); q(x + 4, y - 6, 1, 6, '#55504a'); q(x - 1, y - 6, 1, 6, '#6a645e');
      q(x - 9, y - 13, 18, 7, DARK); q(x - 8, y - 12, 16, 2, '#8a827a'); q(x - 8, y - 12, 16, 1, '#b0a89e'); q(x - 7, y - 10, 14, 3, '#55504a'); q(x - 5, y - 7, 10, 1, '#3a3632');
      if (!o.used) {
        const f = Math.floor(t * 10) % 3;
        halo(x, y, '#ff9a40', t);
        q(x - 8, y - 26, 16, 14, 'rgba(255,122,42,0.14)');
        q(x - 6, y - 16, 12, 4, '#ff7a2a'); q(x - 5 + f, y - 21, 5, 6, '#ff7a2a'); q(x + f - 1, y - 25 - f, 3, 6, '#ff7a2a'); q(x + 2 - f, y - 19, 3, 4, '#e8521a');
        q(x - 4, y - 15, 8, 3, '#ffd23f'); q(x - 1, y - 20 - f, 2, 6, '#ffd23f'); q(x - 1, y - 14, 2, 2, '#fff3b0');
        q(x - 5 + f * 4, y - 28 - f, 1, 1, '#ffd23f'); q(x + 4 - f * 2, y - 24 - f * 2, 1, 1, '#ff7a2a');
      } else { q(x - 6, y - 13, 12, 1, '#2a2422'); q(x - 2, y - 13, 2, 1, '#a8320a'); q(x + 2, y - 14, 1, 1, '#55504a'); }
    },
    mushroom(o, x, y, t) {
      if (!o.used) {
        const f = Math.floor(t * 4) % 3;
        halo(x, y, '#8fe04a', t);
        shadow(x, y, 9);
        q(x - 4, y - 9, 8, 9, DARK); q(x - 11, y - 19, 22, 11, DARK); q(x - 8, y - 21, 16, 3, DARK);
        q(x - 3, y - 8, 6, 8, '#e8e2d0'); q(x - 3, y - 8, 2, 8, '#b8b0a0'); q(x - 3, y - 8, 6, 1, '#8a8474');
        q(x - 10, y - 14, 20, 5, '#4fae28'); q(x - 9, y - 18, 18, 4, '#6fcf3a'); q(x - 6, y - 20, 12, 2, '#6fcf3a'); q(x - 4, y - 20, 6, 1, '#a0e860');
        q(x - 10, y - 10, 20, 1, '#2f6b1a'); q(x - 10, y - 14, 1, 4, '#3a8a22');
        q(x - 7, y - 16, 3, 3, '#e9ffd0'); q(x + 2, y - 18, 3, 2, '#e9ffd0'); q(x + 6, y - 13, 2, 2, '#e9ffd0'); q(x - 1, y - 13, 2, 2, '#e9ffd0');
        q(x + 8, y - 5, 3, 5, DARK); q(x + 6, y - 8, 7, 4, DARK); q(x + 9, y - 4, 1, 4, '#e8e2d0'); q(x + 7, y - 7, 5, 2, '#6fcf3a');
        q(x - 10 + f * 2, y - 23 - f, 1, 1, '#c2f58a'); q(x + 8 - f, y - 22 - f * 2, 1, 1, '#c2f58a'); q(x - 2 + f, y - 25 - f, 1, 1, '#e9ffd0');
      } else { q(x - 2, y - 4, 4, 4, '#b8b0a0'); q(x - 6, y - 1, 4, 1, '#2f6b1a'); q(x + 3, y - 2, 4, 1, '#2f6b1a'); q(x - 1, y - 5, 3, 1, '#4fae28'); }
    },
    crystal(o, x, y, t) {
      if (!o.used) {
        halo(x, y, '#7fd4ff', t);
        shadow(x, y, 10);
        // ba mũi tinh thể nhọn, mặt trái sáng, mặt phải sẫm
        q(x - 11, y - 10, 7, 10, DARK); q(x - 10, y - 13, 5, 3, DARK); q(x - 9, y - 15, 3, 2, DARK);
        q(x - 5, y - 21, 10, 21, DARK); q(x - 4, y - 24, 8, 3, DARK); q(x - 2, y - 26, 4, 2, DARK);
        q(x + 4, y - 13, 8, 13, DARK); q(x + 5, y - 16, 6, 3, DARK); q(x + 7, y - 18, 3, 2, DARK);
        q(x - 10, y - 10, 5, 10, '#5ab4e8'); q(x - 9, y - 12, 3, 2, '#5ab4e8'); q(x - 8, y - 14, 1, 2, '#bfeaff'); q(x - 10, y - 10, 2, 9, '#bfeaff'); q(x - 7, y - 9, 2, 9, '#2f7ab8');
        q(x + 5, y - 13, 6, 13, '#4a9ed8'); q(x + 6, y - 15, 4, 2, '#4a9ed8'); q(x + 8, y - 17, 1, 2, '#7fd4ff'); q(x + 5, y - 13, 2, 12, '#7fd4ff'); q(x + 9, y - 12, 2, 12, '#2f7ab8');
        q(x - 4, y - 21, 8, 21, '#7fd4ff'); q(x - 3, y - 23, 6, 2, '#7fd4ff'); q(x - 1, y - 25, 2, 2, '#e9f9ff');
        q(x - 4, y - 21, 3, 20, '#bfeaff'); q(x - 3, y - 23, 2, 2, '#e9f9ff'); q(x - 4, y - 19, 1, 14, '#ffffff'); q(x + 1, y - 21, 3, 21, '#4a9ed8'); q(x + 1, y - 23, 2, 2, '#5ab4e8');
        q(x - 1, y - 12, 2, 1, '#e9f9ff'); q(x - 1, y - 6, 2, 1, '#5ab4e8');
        q(x - 6, y - 2, 12, 2, '#2f7ab8');
        const k = (t * 1.4) % 2;
        if (k < 0.35) spark(x + 6, y - 19, '#ffffff'); else if (k > 1 && k < 1.3) spark(x - 6, y - 13, '#ffffff');
      } else { q(x - 6, y - 3, 3, 3, '#5ab4e8'); q(x + 1, y - 4, 4, 4, '#7fd4ff'); q(x - 1, y - 2, 2, 2, '#e9f9ff'); q(x + 6, y - 1, 2, 1, '#5ab4e8'); }
    },
    trap(o, x, y, t) {
      const ec = o.el && G.EL[o.el] ? G.EL[o.el].col : '#e8e2d0';
      A.ellipse(pc, x, y, 11, 3, 'rgba(0,0,0,0.3)');
      q(x - 10, y - 3, 20, 5, DARK);
      q(x - 9, y - 2, 18, 3, '#77797f'); q(x - 9, y - 2, 18, 1, '#c9ccd2'); q(x - 3, y - 1, 6, 2, '#3a3c42');
      for (let i = 0; i < 5; i++) { q(x - 10 + i * 4, y - 7, 3, 5, DARK); q(x - 9 + i * 4, y - 6, 1, 4, '#e8eef5'); }
      q(x - 2, y - 2, 4, 3, DARK); q(x - 1, y - 2, 2, 2, ec);
      if (Math.floor(t * 4) % 2) { q(x, y - 10, 1, 2, ec); q(x - 1, y - 2, 2, 1, '#ffffff'); }
    },
    door(o, x, y, t) {
      // cửa gắn vào tường sau, bậc thềm nằm trên sàn
      const yb = Math.min(y, Y + 1), W = G.getWorld ? G.getWorld() : null, S = G.getRun ? G.getRun() : null;
      const reg = W && W.region != null ? W.region : 2, T = TH[reg] || TH[2];
      const dc = /^#[0-9a-f]{6}$/i.test(o.col || '') ? o.col : '#3a2c20', dl = lite(dc, 0.3), dd = dim(dc, 0.4);
      const near = !!(S && S.near === o);
      q(x - 17, yb, 34, y - yb + 3, dim(T.frame, 0.25)); q(x - 17, yb, 34, 1, T.frameHi); q(x - 15, y + 3, 30, 1, 'rgba(0,0,0,0.35)');
      const pv = c; c = pc;
      arch(x - 20, yb, 40, 50, DARK); arch(x - 19, yb, 38, 49, T.frameHi); arch(x - 18, yb, 36, 48, T.frame); arch(x - 14, yb, 28, 43, '#0c0808');
      c = pv;
      for (let k = 0; k < 4; k++) q(x - 18, yb - 10 - k * 9, 4, 1, dim(T.frame, 0.35)), q(x + 14, yb - 10 - k * 9, 4, 1, dim(T.frame, 0.35));
      q(x - 2, yb - 49, 4, 5, T.frameHi); q(x - 1, yb - 48, 2, 3, dl);
      if (near) {
        // lại gần thì cánh cửa hé mở, ánh sáng màu của lựa chọn hắt ra
        const k = 0.5 + 0.5 * Math.sin(t * 5);
        q(x - 9, yb - 34, 18, 34, rgba(lite(dc, 0.45), 0.5 + 0.2 * k)); q(x - 5, yb - 30, 10, 30, rgba('#ffffff', 0.25));
        q(x - 13, yb - 36, 4, 36, dc); q(x - 13, yb - 36, 1, 36, dl); q(x + 9, yb - 36, 4, 36, dd);
      } else {
        const pv2 = c; c = pc; arch(x - 13, yb, 26, 41, dc); c = pv2;
        q(x - 13, yb - 28, 1, 28, dl); q(x, yb - 40, 1, 40, dd); q(x - 13, yb - 20, 26, 1, dd);
        q(x - 10, yb - 31, 8, 9, dd); q(x + 3, yb - 31, 8, 9, dd); q(x - 10, yb - 16, 8, 13, dd); q(x + 3, yb - 16, 8, 13, dd);
        q(x - 10, yb - 31, 8, 1, dl); q(x + 3, yb - 31, 8, 1, dl);
        q(x - 13, yb - 24, 26, 2, '#3a3a42'); q(x - 13, yb - 6, 26, 2, '#3a3a42');
        q(x - 3, yb - 20, 2, 4, '#ffd23f'); q(x + 2, yb - 20, 2, 4, '#ffd23f');
      }
      // huy hiệu cho biết sau cửa là gì
      const ix = x, iy = yb - 39, ic = '#fff0c8';
      q(ix - 6, iy - 5, 12, 11, DARK); q(ix - 5, iy - 4, 10, 9, dd);
      if (o.choice === 'fight2') { A.line(pc, ix - 3, iy - 3, ix + 3, iy + 3, ic, 1); A.line(pc, ix + 3, iy - 3, ix - 3, iy + 3, ic, 1); q(ix - 4, iy + 2, 2, 2, '#ff9a8a'); q(ix + 3, iy + 2, 2, 2, '#ff9a8a'); } else if (o.choice === 'merchant') { q(ix - 2, iy - 3, 5, 7, '#ffd23f'); q(ix - 3, iy - 2, 7, 5, '#ffd23f'); q(ix - 1, iy - 1, 3, 3, '#a8742a'); q(ix - 1, iy - 3, 2, 1, '#fff0a0'); } else if (o.choice === 'challenge') { q(ix - 3, iy - 3, 7, 1, ic); q(ix - 2, iy - 2, 5, 1, ic); q(ix - 1, iy - 1, 3, 1, ic); q(ix, iy, 1, 1, ic); q(ix - 1, iy + 1, 3, 1, ic); q(ix - 2, iy + 2, 5, 1, ic); q(ix - 3, iy + 3, 7, 1, ic); } else if (o.choice === 'curse') { q(ix - 3, iy - 3, 6, 5, ic); q(ix - 2, iy + 2, 4, 2, ic); q(ix - 2, iy - 1, 1, 2, '#7a2a8a'); q(ix + 1, iy - 1, 1, 2, '#7a2a8a'); }
    },
  };
  A.prop = function (cx, o) {
    const f = o && PROPS[o.type];
    if (!f) return oldProp.apply(this, arguments);
    try {
      pc = cx;
      f(o, Math.round(o.x), Math.round(o.y), G.time || 0);
    } catch (e) {
      if (!A.envErrP) { A.envErrP = e; if (window.console) console.warn('env_art prop', e); }
      oldProp.apply(this, arguments);
    }
  };
})();
