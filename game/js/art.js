// Hình pixel vẽ bằng mã: hero, quái, boss, cảnh nền, đồ vật. Chỉ dùng fillRect toạ độ nguyên, màu phẳng.
(function () {
  const G = window.G;
  const A = (G.art = {});
  const p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  A.p = p;

  A.line = function (c, x0, y0, x1, y1, col, t) {
    t = t || 1;
    c.fillStyle = col;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      c.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, t);
    }
  };
  A.ellipse = function (c, x, y, rx, ry, col) {
    c.fillStyle = col;
    x = Math.round(x); y = Math.round(y);
    for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      if (hw > 0) c.fillRect(x - hw, y + dy, hw * 2, 1);
    }
  };

  // ---------- tiện ích màu và viền ----------
  // Trộn hai màu hex, có nhớ kết quả để không tính lại mỗi khung hình.
  const MIX = new Map();
  function mix(a, b, k) {
    const key = a + b + k;
    let v = MIX.get(key);
    if (v) return v;
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const f = (s) => { const u = (x >> s) & 255, w = (y >> s) & 255; return Math.round(u + (w - u) * k); };
    v = '#' + ((1 << 24) | (f(16) << 16) | (f(8) << 8) | f(0)).toString(16).slice(1);
    MIX.set(key, v);
    return v;
  }
  const lite = (h, k) => mix(h, '#ffffff', k);
  const dim = (h, k) => mix(h, '#000000', k);

  // Vẽ hai lượt: lượt viền (OUT) tô khối tối rộng hơn 1 điểm, lượt sau tô màu thật.
  const DARK = '#140d0e';
  let OUT = false, OC = DARK, cx = null;
  const q = (x, y, w, h, col) => {
    if (OUT) { cx.fillStyle = OC; cx.fillRect(x - 1, y - 1, w + 2, h + 2); } else { cx.fillStyle = col; cx.fillRect(x, y, w, h); }
  };
  // Chi tiết bên trong, không có viền.
  const d = (x, y, w, h, col) => { if (!OUT) { cx.fillStyle = col; cx.fillRect(x, y, w, h); } };
  // Đoạn thẳng dày, ít ô vuông.
  function seg(x0, y0, x1, y1, t, col) {
    const o = OUT ? 1 : 0, h = t >> 1;
    cx.fillStyle = OUT ? OC : col;
    const dx = x1 - x0, dy = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(1, t - 1)));
    for (let i = 0; i <= n; i++) cx.fillRect(Math.round(x0 + (dx * i) / n) - h - o, Math.round(y0 + (dy * i) / n) - h - o, t + 2 * o, t + 2 * o);
  }
  // Elip thô, mỗi hàng cao 2 điểm.
  function qe(x, y, rx, ry, col) {
    if (OUT) { rx += 1; ry += 1; col = OC; }
    cx.fillStyle = col;
    for (let dy = -ry; dy < ry; dy += 2) {
      const m = dy + 1;
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (m * m) / (ry * ry))));
      if (hw > 0) cx.fillRect(x - hw, y + dy, hw * 2, 2);
    }
  }
  const de = (x, y, rx, ry, col) => { if (!OUT) qe(x, y, rx, ry, col); };
  // Vòng elip rỗng (chỉ viền).
  function ring(c, x, y, rx, ry, col) {
    c.fillStyle = col;
    x = Math.round(x); y = Math.round(y);
    const n = Math.floor(ry);
    if (n < 1 || rx < 2) return;
    const hwAt = (k) => (k > n ? 0 : Math.round(rx * Math.sqrt(Math.max(0, 1 - (k * k) / (ry * ry)))));
    for (let dy = -n; dy <= n; dy++) {
      const a = Math.abs(dy), hw = hwAt(a);
      if (hw <= 0) continue;
      const w = Math.min(hw, Math.max(2, hw - hwAt(a + 1) + 1));
      c.fillRect(x - hw, y + dy, w, 1);
      c.fillRect(x + hw - w, y + dy, w, 1);
    }
  }
  const region = () => { const w = G.getWorld && G.getWorld(); return w && w.region != null ? w.region : 0; };

  // ---------- vũ khí ----------
  A.weaponLook = function (w) {
    const stage = w ? G.wStage(w) : 0;
    const el = w ? (w.coat || (stage > 0 ? w.branch : null)) : null;
    return {
      type: w ? w.type : 'sword', stage,
      col: el ? G.EL[el].col : w ? G.TIERS[w.tier].col : '#b9c0c9',
      col2: el ? G.EL[el].col2 : '#ffffff', el,
    };
  };
  // Vẽ vũ khí từ bàn tay (x0, y0) theo góc ang (độ, 0 là chĩa thẳng về trước, âm là chĩa lên).
  A.weapon = function (c, look, x0, y0, ang, pull) {
    const r = (ang * Math.PI) / 180;
    const cs = Math.cos(r), sn = Math.sin(r);
    const pt = (k) => [Math.round(x0 + cs * k), Math.round(y0 + sn * k)];
    const st = look.stage;
    if (look.type === 'sword') {
      const L = 14 + st * 2;
      const a = pt(-2), b = pt(3), e = pt(L);
      A.line(c, a[0], a[1], b[0], b[1], '#5a4030', 2);
      A.line(c, b[0], b[1], e[0], e[1], look.col, 2);
      A.line(c, b[0], b[1], e[0], e[1], look.col2, 1);
      if (st >= 2) { const m = pt(L - 4); A.line(c, m[0], m[1], e[0], e[1], look.col2, 2); }
      const g1 = [Math.round(b[0] - sn * 3), Math.round(b[1] + cs * 3)], g2 = [Math.round(b[0] + sn * 3), Math.round(b[1] - cs * 3)];
      A.line(c, g1[0], g1[1], g2[0], g2[1], '#caa15a', 2);
    } else if (look.type === 'hammer') {
      const L = 13;
      const a = pt(-2), e = pt(L);
      A.line(c, a[0], a[1], e[0], e[1], '#7a5a3a', 2);
      const s = 7 + st;
      p(c, e[0] - (s >> 1) - 1, e[1] - (s >> 1) - 1, s + 3, s + 2, '#2a2422');
      p(c, e[0] - (s >> 1), e[1] - (s >> 1), s + 1, s, look.col);
      p(c, e[0] - (s >> 1), e[1] - (s >> 1), s + 1, 1, look.col2);
      p(c, e[0] - (s >> 1), e[1] - (s >> 1), 1, s, look.col2);
      p(c, e[0] - (s >> 1), e[1] + (s >> 1) - 1, s + 1, 1, 'rgba(0,0,0,0.35)');
    } else if (look.type === 'spear') {
      const a = pt(-10), b = pt(18), e = pt(23 + st), k = pt(16);
      A.line(c, a[0], a[1], b[0], b[1], '#8a6a44', 1);
      A.line(c, k[0], k[1], b[0], b[1], '#c8372d', 2);
      A.line(c, b[0], b[1], e[0], e[1], look.col, 2);
      p(c, e[0], e[1], 1, 1, look.col2);
    } else {
      // cung: thân cong, dây thẳng hoặc kéo về tay
      const top = [x0 + 1, y0 - 9], bot = [x0 + 1, y0 + 9], mid = [x0 + 5, y0];
      const bc = st ? look.col : '#9a7448';
      A.line(c, top[0], top[1], mid[0], mid[1] - 4, bc, 1);
      A.line(c, mid[0], mid[1] - 4, mid[0], mid[1] + 4, bc, 2);
      A.line(c, mid[0], mid[1] + 4, bot[0], bot[1], bc, 1);
      const sx = x0 + 1 - (pull || 0);
      A.line(c, top[0], top[1], sx, y0, '#e8e2d0', 1);
      A.line(c, sx, y0, bot[0], bot[1], '#e8e2d0', 1);
      if (pull) { A.line(c, sx, y0, x0 + 8, y0, '#e8e2d0', 1); p(c, x0 + 8, y0 - 1, 2, 3, look.col); }
    }
  };
  A.weaponIcon = function (c, w, x, y) {
    c.save();
    c.translate(Math.round(x), Math.round(y));
    const look = A.weaponLook(w);
    if (look.type === 'bow') A.weapon(c, look, -3, 0, 0, 0);
    else if (look.type === 'spear') { c.scale(0.7, 0.7); A.weapon(c, look, -4, 6, -40, 0); }
    else A.weapon(c, look, -6, 6, -45, 0);
    c.restore();
  };

  // ---------- hero ----------
  // acc là màu đồ đội đầu, sẽ đổi theo mũ đang mặc.
  const LOOK = {
    smith: { skin: '#e3a877', cloth: '#b8824a', cloth2: '#4a4458', hair: '#2b1b12', acc: '#d8372d', w: 10 },
    hunter: { skin: '#dba071', cloth: '#5c9a40', cloth2: '#6a4a2e', hair: '#2b1b12', acc: '#e8cc80', w: 8 },
    healer: { skin: '#e0b08a', cloth: '#4658ac', cloth2: '#2c3878', hair: '#f2f2f2', acc: '#232c5e', w: 8 },
    wrestler: { skin: '#c98a5a', cloth: '#d0382e', cloth2: '#8a1f1a', hair: '#1e1410', acc: '#d0382e', w: 14 },
  };
  const ARMOR_COL = { a_r1: '#9a8a6a', a_r2: '#4a7f9a', a_r3: '#7a6a62', a_moc: '#6b4a2a', a_ngu: '#3f8fb5', a_ho: '#f0ece2' };
  const HELM_COL = { h_r1: '#d9b46a', h_r2: '#4a7f9a', h_r3: '#b0502a', h_moc: '#7a5a3a', h_ngu: '#5fb0d0', h_ho: '#f4f1ea' };
  let FLK = 0; // độ sáng lên khi trúng đòn
  const K = (k) => (FLK ? lite(k, FLK) : k);

  function heroBody(o, L, key, look) {
    const hw = L.w >> 1, big = key === 'wrestler';
    const skin = K(L.skin), skinD = K(dim(L.skin, 0.2));
    const cloth = K(L.cloth), cloth2 = K(L.cloth2), hair = K(L.hair);
    const accRaw = o.helm && HELM_COL[o.helm] ? HELM_COL[o.helm] : L.acc;
    const acc = K(accRaw);
    const armRaw = (o.armor && ARMOR_COL[o.armor]) || (big ? L.skin : L.cloth);
    const torso = K(armRaw), torsoD = K(dim(armRaw, 0.22));
    if (o.dodge >= 0) {
      // lăn né: cuộn tròn, đầu xoay quanh thân
      const r = Math.floor(o.dodge * 4) % 4;
      q(-5, -14, 10, 13, torso);
      q(-7, -12, 14, 9, torso);
      d(-5, -3, 10, 2, torsoD);
      const hx = [1, 2, -6, -7][r], hy = [-15, -7, -6, -14][r];
      q(hx, hy, 6, 6, skin);
      d(hx + (r === 0 || r === 3 ? 0 : 4), hy + (r < 2 ? 0 : 4), 2, 2, acc);
      d(hx + (r < 2 ? 4 : 0), hy + (r === 0 || r === 3 ? 0 : 4), 2, 2, hair);
      d([-6, 3, 3, -6][r], [-4, -4, -13, -13][r], 3, 2, K(big ? L.cloth : L.cloth2));
      d(-15, -10, 6, 1, 'rgba(255,255,255,0.6)');
      d(-13, -6, 5, 1, 'rgba(255,255,255,0.4)');
      d(-16, -3, 4, 1, 'rgba(255,255,255,0.3)');
      return;
    }
    const mv = o.move ? Math.floor(o.t * 9) % 4 : -1;
    const melee = o.atk >= 0 && look.type !== 'bow';
    const bob = mv === 1 || mv === 3 ? -1 : 0;
    let fo = mv === 0 ? 2 : mv === 2 ? -2 : 0;
    if (melee && mv < 0) fo = 2;
    const bo = mv < 0 ? (melee ? -1 : 0) : -fo;
    const ln = melee ? 1 : 0;
    const top = big ? -22 : -20;
    const hx0 = (key === 'healer' ? 1 : 0) + ln;
    const hy = top - 9 + bob;
    const shoe = K('#2a1c14');
    // tay sau
    q(-hw - 2 + ln - (fo >> 1), top + 1 + bob, big ? 3 : 2, 8, key === 'healer' ? torsoD : skinD);
    if (key === 'healer') {
      // áo dài phủ tới mắt cá
      q(-hw - 1, -10 + bob, L.w + 2, 9 - bob, torsoD);
      q(-3 + bo, -1, 3, 1, shoe);
      q(1 + fo, -1, 3, 1, shoe);
    } else {
      const lw = big ? 4 : 3;
      const lc = big ? skin : cloth2, lcD = big ? skinD : K(dim(L.cloth2, 0.25));
      const bl = mv === 3 ? 1 : 0, fl = mv === 1 ? 1 : 0;
      q(-hw + 1 + bo, -8, lw, 8 - bl, lcD);
      q(hw - lw - 1 + fo, -8, lw, 8 - fl, lc);
      if (!bl) q(-hw + 1 + bo, -2, lw + 1, 2, big ? skinD : shoe);
      if (!fl) q(hw - lw - 1 + fo, -2, lw + 1, 2, big ? skin : shoe);
    }
    // thân
    q(-hw + ln, top + bob, L.w, -8 - top, torso);
    d(-hw + ln, top + bob, 2, -8 - top, torsoD);
    if (key === 'smith') {
      const ap = K('#4a3020'), apL = K('#6e4a32');
      d(-1 + ln, top + 1 + bob, 5, 6, ap);
      q(-hw + 2 + ln, -14 + bob, L.w - 2, 8, ap);
      d(-hw + 2 + ln, -14 + bob, L.w - 2, 1, apL);
      d(1 + ln, top + bob, 1, 1, ap);
      d(hw - 2 + ln, -11 + bob, 2, 2, K('#b9c0c9'));
    } else if (key === 'hunter') {
      q(-hw - 2, top - 1 + bob, 3, 10, K('#7a4a2a'));
      q(-hw - 2, top - 4 + bob, 1, 3, K('#e8e2d0'));
      q(-hw, top - 5 + bob, 1, 4, K('#e8e2d0'));
      q(-hw + ln, -8 + bob, L.w, 2, cloth);
      d(-hw + ln, -11 + bob, L.w, 2, K('#6a4a2e'));
      d(1 + ln, -11 + bob, 2, 2, K('#d9b46a'));
      d(-hw + 2 + ln, top + bob, L.w - 2, 1, K(dim(L.cloth, 0.3)));
    } else if (key === 'healer') {
      d(-hw + ln, -12 + bob, L.w, 2, K('#d9b46a'));
      q(-hw - 2, -12 + bob, 3, 4, K('#d98a3a'));
      d(-hw - 1, -14 + bob, 1, 2, K('#8a5a2a'));
      d(hw - 2 + ln, top + bob, 1, 8, K('#e8e2d0'));
    } else {
      d(-hw + 3 + ln, top + 4 + bob, L.w - 4, 1, skinD);
      d(hw - 3 + ln, top + 6 + bob, 1, 4, skinD);
      d(hw - 2 + ln, top + 2 + bob, 1, 1, skinD);
      d(-hw + ln, -11 + bob, L.w, 3, cloth);
      d(-hw + ln, -11 + bob, L.w, 1, K(lite(L.cloth, 0.25)));
      q(1 + ln, -8 + bob, 5, 5, cloth);
      d(1 + ln, -4 + bob, 5, 1, cloth2);
      if (o.armor) d(-hw + ln, top + bob, L.w, 3, torsoD);
    }
    // đầu
    q(-4 + hx0, hy, 9, 9, skin);
    q(5 + hx0, hy + 4, 1, 2, skin);
    d(-4 + hx0, hy + 8, 8, 1, skinD);
    d(3 + hx0, hy + 3, 1, 2, '#1a1210');
    if (key === 'smith') {
      const fl = mv >= 0 && mv % 2 ? -1 : 0;
      d(-4 + hx0, hy, 9, 2, hair);
      d(-4 + hx0, hy + 4, 2, 3, hair);
      d(2 + hx0, hy + 7, 3, 2, hair);
      d(-4 + hx0, hy + 2, 9, 2, acc);
      q(-6 + hx0, hy + 2, 2, 2, acc);
      q(-7 + hx0, hy + 4 + fl, 2, 3, acc);
    } else if (key === 'hunter') {
      const hat = K('#e8cc80'), hatD = K('#b08a45');
      d(-4 + hx0, hy + 2, 2, 6, hair);
      d(1 + hx0, hy + 2, 1, 6, K('#5a3a22'));
      q(-9 + hx0, hy + 1, 19, 1, o.helm ? acc : hatD);
      q(-7 + hx0, hy, 15, 1, hat);
      q(-5 + hx0, hy - 1, 11, 1, hat);
      q(-3 + hx0, hy - 2, 7, 1, hat);
      q(-1 + hx0, hy - 3, 3, 1, o.helm ? acc : hat);
      d(-6 + hx0, hy, 5, 1, hatD);
      d(-4 + hx0, hy - 1, 3, 1, hatD);
    } else if (key === 'healer') {
      const wh = hair;
      q(-5 + hx0, hy - 2, 11, 4, acc);
      d(-5 + hx0, hy, 11, 1, K(lite(accRaw, 0.25)));
      d(-3 + hx0, hy - 2, 6, 1, K(lite(accRaw, 0.12)));
      q(-6 + hx0, hy - 1, 1, 3, acc);
      d(-4 + hx0, hy + 2, 2, 5, wh);
      d(2 + hx0, hy + 2, 3, 1, wh);
      q(2 + hx0, hy + 6, 4, 6, wh);
      q(3 + hx0, hy + 12, 2, 3, wh);
      d(2 + hx0, hy + 9, 1, 3, K('#c8c8d0'));
    } else {
      d(-4 + hx0, hy, 9, 2, hair);
      d(-4 + hx0, hy + 2, 2, 4, hair);
      d(2 + hx0, hy + 2, 3, 1, hair);
      q(-1 + hx0, hy - 4, 3, 4, hair);
      d(-1 + hx0, hy - 1, 3, 1, acc);
      if (o.helm) d(-4 + hx0, hy + 1, 9, 1, acc);
    }
    if (o.helm === 'h_moc') { q(-5 + hx0, hy - 3, 2, 4, acc); q(4 + hx0, hy - 3, 2, 4, acc); q(-6 + hx0, hy - 4, 1, 2, acc); q(6 + hx0, hy - 4, 1, 2, acc); }
    if (o.helm === 'h_ngu') { q(-1 + hx0, hy - 6, 2, 5, acc); q(-3 + hx0, hy - 4, 2, 3, acc); }
    if (o.helm === 'h_ho') { q(-4 + hx0, hy - 3, 2, 3, acc); q(3 + hx0, hy - 3, 2, 3, acc); d(-4 + hx0, hy - 2, 1, 2, K('#d02020')); d(3 + hx0, hy - 2, 1, 2, K('#d02020')); }
    // tay trước và vũ khí
    let hx = hw + 2 + ln, hyy = -14 + bob + (mv === 0 ? 1 : 0), ang = -55, pull = 0;
    const a = o.atk;
    if (look.type === 'bow') {
      hx = hw + 3; hyy = -16 + bob; ang = 0;
      if (a >= 0) pull = a < 0.5 ? Math.round(a * 8) : 0;
    } else if (look.type === 'spear') {
      ang = -8;
      if (a >= 0) { hx += Math.round(Math.sin(a * Math.PI) * 9); ang = 0; }
    } else if (a >= 0) {
      const e = a < 0.5 ? a * 2 : 1;
      ang = -125 + 175 * e;
      hx = hw + 1 + ln + Math.round(3 * e);
      hyy = -21 + Math.round(9 * e) + bob;
    }
    seg(hw - 1 + ln, top + 2 + bob, hx, hyy, big ? 3 : 2, key === 'healer' ? torso : skin);
    q(hx - 1, hyy - 1, 2, 2, skin);
    if (!OUT) A.weapon(cx, look, hx, hyy, ang, pull);
  }
  A.hero = function (c, o) {
    const key = LOOK[o.key] ? o.key : 'smith';
    const L = LOOK[key];
    const x = Math.round(o.x), y = Math.round(o.y);
    A.ellipse(c, x, y, (L.w >> 1) + 4, 2, 'rgba(0,0,0,0.3)');
    c.save();
    c.translate(x, y);
    c.scale(o.face < 0 ? -1 : 1, 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    cx = c;
    FLK = o.flash ? 0.6 : 0;
    const look = A.weaponLook(o.weapon);
    OC = DARK;
    if (o.alpha == null) { OUT = true; heroBody(o, L, key, look); OUT = false; }
    heroBody(o, L, key, look);
    FLK = 0;
    if (o.gong) {
      // hào quang lúc Gồng
      const f = Math.floor(G.time * 10) % 3, hw = (L.w >> 1) + 4;
      p(c, -hw, -30 + f * 3, 1, 5, '#ffd27a');
      p(c, hw, -24 - f * 3, 1, 5, '#ffd27a');
      p(c, -hw - 2, -12 - f * 2, 1, 4, '#fff3b0');
      p(c, hw + 2, -16 + f * 2, 1, 4, '#fff3b0');
      p(c, -hw, 1, hw * 2 + 1, 1, '#ffd27a');
      p(c, -hw + 2, -1, 2, 1, '#fff3b0');
      p(c, hw - 3, -1, 2, 1, '#fff3b0');
    }
    c.restore();
  };

  // ---------- quái ----------
  let TM = 0; // 0 thường, 1 trúng đòn, 2 đóng băng, 3 nháy báo đòn
  const tn = (k) => (TM === 1 ? lite(k, 0.5) : TM === 2 ? mix(k, '#a8dcf5', 0.7) : TM === 3 ? lite(k, 0.4) : k);
  const BLK = '#1a1210', WHT = '#ffffff';
  const EYE = ['#ffe14a', '#ffe14a', '#ffb030'];
  // Màu thân riêng cho vài loài để mỗi vùng bớt một màu.
  const ALT = [
    { rusher: '#8a5a34', archer: '#a8703a', nimble: '#8c8c84' },
    { archer: '#a860a8', shield: '#5a9a7a', nimble: '#38a890' },
    { shield: '#807a78', archer: '#6a3a6a', nimble: '#e8a848', swarm: '#6a4a6a' },
  ];

  // Rừng già: yêu gỗ, nấm con, bọ giáp, khỉ ném quả, sói rừng, chúa rừng.
  function shapeForest(role, mv, wind, m, k, l, eye) {
    if (role === 'swarm') {
      const o = mv ? -1 : 0;
      q(-2, -5 + o, 4, 5, l);
      q(-5, -9 + o, 10, 4, m);
      q(-3, -10 + o, 6, 1, m);
      d(-5, -6 + o, 10, 1, k);
      d(-3, -9 + o, 2, 1, l);
      d(2, -8 + o, 2, 1, l);
      d(0, -4 + o, 1, 2, BLK);
      d(2, -4 + o, 1, 2, BLK);
      if (mv) { d(-3, -1, 2, 1, k); d(1, -1, 2, 1, k); }
    } else if (role === 'shield') {
      const hy = wind ? -11 : -8;
      q(mv ? -7 : -6, -3, 2, 3, m);
      q(-1, -3, 2, 3, m);
      q(mv ? 4 : 3, -3, 2, 3, m);
      q(-8, -12, 14, 9, k);
      q(-6, -14, 10, 2, k);
      d(-6, -13, 5, 1, m);
      d(-7, -11, 1, 4, m);
      d(-1, -14, 1, 10, BLK);
      d(-5, -9, 3, 3, m);
      d(1, -9, 3, 3, m);
      q(6, hy, 5, 5, m);
      q(10, hy - 3, 2, 4, l);
      q(11, hy - 5, 2, 3, l);
      d(8, hy + 1, 1, 1, BLK);
    } else if (role === 'archer') {
      q(-7, -12, 2, 6, k);
      q(-9, -15, 3, 2, k);
      q(-9, -17, 2, 2, k);
      q(-3, -6, 2, mv ? 5 : 6, k);
      q(1, -6, 2, mv ? 6 : 5, k);
      q(-3, -15, 7, 9, m);
      d(0, -13, 3, 6, l);
      q(-3, -22, 8, 7, m);
      q(-5, -21, 2, 3, l);
      d(1, -20, 4, 4, l);
      d(3, -20, 1, 2, BLK);
      d(2, -17, 3, 1, k);
      if (wind) { q(4, -23, 2, 9, m); q(3, -27, 4, 4, '#e0c040'); d(3, -27, 2, 1, '#fff3b0'); d(5, -28, 1, 1, '#4d6b28'); } else q(4, -14, 2, 6, m);
    } else if (role === 'nimble') {
      const s = wind ? 1 : 0;
      q(mv ? -7 : -6, -3, 2, 3, k);
      q(mv ? -3 : -4, -3, 2, 3, k);
      q(mv ? 3 : 4, -3, 2, 3, k);
      q(mv ? 7 : 6, -3, 2, 3, k);
      q(-12, -11, 5, 3, l);
      q(-13, -12 - (mv ? 1 : 0), 2, 2, l);
      q(-8, -9 + s, 14, 6, m);
      d(-8, -9 + s, 14, 1, k);
      d(-5, -4 + s, 9, 1, l);
      q(5, -12 + s, 6, 6, m);
      q(10, -9 + s, 3, 3, m);
      q(6, -15 + s, 2, 3, k);
      q(9, -15 + s, 2, 3, k);
      d(12, -9 + s, 1, 1, BLK);
      d(9, -10 + s, 1, 1, '#ff5040');
      if (wind) { d(10, -6 + s, 3, 2, '#7a1010'); d(10, -6 + s, 1, 1, WHT); d(12, -6 + s, 1, 1, WHT); }
    } else {
      const el = role === 'elite';
      q(-4, -5, 3, mv ? 4 : 5, k);
      q(1, -5, 3, mv ? 5 : 4, k);
      q(-7, -15, 2, 6, k);
      q(el ? -6 : -5, -16, el ? 12 : 10, 11, m);
      q(-4, -22, 9, 7, m);
      d(-5, -6, 10, 1, k);
      d(-3, -14, 1, 6, k);
      d(0, -12, 1, 5, k);
      d(-4, -22, 9, 1, l);
      d(1, -20, 2, 2, eye);
      d(4, -20, 1, 2, eye);
      d(1, -17, 4, 1, BLK);
      if (el) {
        // gạc hươu và bướu rêu trên vai
        q(-5, -26, 2, 4, l); q(-7, -28, 2, 3, l); q(-4, -29, 1, 3, l);
        q(3, -26, 2, 4, l); q(5, -28, 2, 3, l); q(3, -29, 1, 3, l);
        q(-8, -18, 4, 4, k); q(5, -18, 4, 4, k);
        d(-7, -18, 2, 1, l); d(6, -18, 2, 1, l);
        d(1, -17, 1, 2, WHT); d(4, -17, 1, 2, WHT);
        d(-2, -12, 3, 3, eye);
      } else {
        q(-1, -25, 2, 3, l);
        q(1, -26, 3, 2, l);
      }
      if (wind) { q(3, -24, 3, 10, k); q(2, -29, 5, 6, l); d(2, -29, 5, 1, WHT); } else { q(4, -14, 5, 2, k); q(8, -18, 3, 7, l); }
    }
  }
  // Hang biển: ngư nhân, cua con, rùa đá, mực phun, rắn biển, tướng cá.
  function shapeSea(role, mv, wind, m, k, l, eye) {
    if (role === 'swarm') {
      const a = mv ? 1 : 0;
      q(-5 - a, -2, 2, 2, k);
      q(3 + a, -2, 2, 2, k);
      q(-2, -2, 1, 2, k);
      q(1, -2, 1, 2, k);
      q(-4, -6, 8, 4, m);
      d(-3, -6, 6, 1, l);
      q(-2, -8, 1, 2, k);
      q(1, -8, 1, 2, k);
      d(-2, -9, 1, 1, WHT);
      d(1, -9, 1, 1, WHT);
      q(-7, -8 - a, 3, 3, k);
      q(4, -7 - (1 - a), 3, 3, k);
      d(-1, -4, 2, 1, BLK);
    } else if (role === 'shield') {
      const hx = wind ? 8 : 6;
      q(mv ? -7 : -6, -3, 3, 3, m);
      q(mv ? 4 : 3, -3, 3, 3, m);
      q(-10, -5, 2, 2, m);
      q(-8, -12, 14, 8, k);
      q(-6, -14, 10, 2, k);
      d(-6, -13, 3, 3, m); d(-2, -13, 3, 3, m); d(2, -13, 3, 3, m);
      d(-4, -9, 3, 3, m); d(0, -9, 3, 3, m);
      d(-8, -5, 14, 1, l);
      q(hx, -9, 5, 4, l);
      if (wind) q(6, -8, 2, 3, l);
      d(hx + 3, -8, 1, 1, BLK);
      d(hx + 2, -6, 3, 1, k);
    } else if (role === 'archer') {
      q(-4, -6, 2, mv ? 5 : 6, k);
      q(-1, -6, 2, mv ? 6 : 5, k);
      q(2, -6, 2, mv ? 5 : 6, k);
      q(-6, -19, 2, 5, k);
      q(4, -19, 2, 5, k);
      q(-4, -18, 8, 12, m);
      q(-3, -21, 6, 3, m);
      q(-1, -23, 2, 2, m);
      d(-3, -19, 2, 1, l);
      d(-2, -16, 1, 1, l);
      d(0, -12, 4, 4, l);
      d(2, -11, 2, 2, BLK);
      d(-4, -7, 8, 1, k);
      if (wind) { q(5, -17, 2, 9, k); q(4, -21, 4, 4, '#e0c040'); d(4, -21, 2, 1, '#fff3b0'); } else q(4, -10, 2, 5, k);
    } else if (role === 'nimble') {
      const s = wind ? 1 : 0, w = mv ? 1 : 0;
      q(-14, -3, 3, 2, l);
      q(-12, -4 - w, 5, 3, m);
      q(-8, -5 + w, 5, 3, m);
      q(-4, -4 - w, 5, 3, m);
      q(0, -6 + w, 5, 4, m);
      q(3, -11 + s, 4, 7, m);
      q(5, -14 + s, 7, 5, m);
      d(-11, -5 - w, 3, 1, l);
      d(-3, -5 - w, 3, 1, l);
      d(4, -11 + s, 1, 6, l);
      q(6, -16 + s, 3, 2, k);
      d(9, -13 + s, 2, 1, '#ff5040');
      d(5, -10 + s, 2, 1, k);
      if (wind) { d(9, -10 + s, 3, 2, '#7a1010'); d(9, -10 + s, 1, 2, WHT); d(11, -10 + s, 1, 2, WHT); }
    } else {
      const el = role === 'elite';
      q(-3, -5, 2, mv ? 4 : 5, k);
      q(1, -5, 2, mv ? 5 : 4, k);
      q(-5, -1, 4, 1, k);
      q(0, -1, 4, 1, k);
      q(-7, -14, 3, 6, k);
      q(el ? -5 : -4, -15, el ? 10 : 8, 10, m);
      d(-1, -14, 4, 8, l);
      q(-4, -22, 9, 8, m);
      q(-3, -24, 2, 2, k); q(0, -26, 2, 4, k); q(3, -24, 2, 2, k);
      d(2, -20, 3, 3, eye);
      d(4, -19, 1, 1, BLK);
      d(2, -16, 4, 1, BLK);
      d(-4, -18, 2, 1, k); d(-4, -16, 2, 1, k);
      if (el) {
        // mào cao và giáp vỏ sò
        q(-1, -29, 3, 4, l); q(-4, -27, 2, 3, l); q(3, -27, 2, 3, l);
        q(-8, -17, 4, 4, l); q(5, -17, 4, 4, l);
        d(-8, -15, 4, 1, k); d(5, -15, 4, 1, k);
        d(0, -11, 3, 3, eye);
      }
      if (wind) { q(4, -15, 7, 2, k); q(10, -22, 1, 14, l); q(9, -24, 3, 3, l); d(8, -22, 1, 2, l); d(12, -22, 1, 2, l); } else { q(4, -13, 4, 2, k); q(7, -20, 1, 14, l); q(6, -22, 3, 3, l); }
    }
  }
  // Núi đá: quỷ đá, dơi, golem, thầy mo, báo núi, chúa quỷ.
  function shapeRock(role, mv, wind, m, k, l, eye, fl) {
    if (role === 'swarm') {
      const y0 = -12 + (fl ? 1 : 0);
      q(-2, y0, 4, 5, k);
      q(-2, y0 - 2, 1, 2, k);
      q(1, y0 - 2, 1, 2, k);
      d(-1, y0 + 1, 1, 1, '#ff5040');
      d(1, y0 + 1, 1, 1, '#ff5040');
      if (fl) { q(-8, y0 + 1, 6, 2, m); q(2, y0 + 1, 6, 2, m); q(-8, y0 + 3, 2, 2, m); q(6, y0 + 3, 2, 2, m); } else { q(-7, y0 - 2, 5, 3, m); q(2, y0 - 2, 5, 3, m); q(-9, y0 - 4, 3, 2, m); q(6, y0 - 4, 3, 2, m); }
    } else if (role === 'shield') {
      const hy = wind ? -13 : -11;
      q(mv ? -7 : -6, -3, 4, 3, m);
      q(mv ? 3 : 2, -3, 4, 3, m);
      q(-8, -13, 15, 10, k);
      q(-6, -15, 11, 2, k);
      d(-7, -13, 6, 1, l);
      d(-8, -12, 1, 5, l);
      d(-4, -10, 1, 5, eye);
      d(-3, -8, 3, 1, eye);
      d(2, -12, 1, 4, eye);
      q(6, hy, 5, 6, m);
      d(8, hy + 1, 2, 2, eye);
      d(7, hy + 4, 3, 1, BLK);
      q(8, wind ? -19 : -5, 5, 5, m);
      d(8, wind ? -19 : -5, 5, 1, l);
    } else if (role === 'archer') {
      q(-4, -15, 8, 15, m);
      d(-4, -3, 8, 3, k);
      d(-4, -15, 2, 12, k);
      d(mv ? -3 : -2, -1, 2, 1, BLK);
      d(mv ? 1 : 2, -1, 2, 1, BLK);
      q(-4, -22, 8, 8, k);
      q(-2, -24, 4, 2, k);
      d(0, -20, 4, 4, BLK);
      d(1, -19, 1, 1, eye);
      d(3, -19, 1, 1, eye);
      d(-1, -12, 3, 1, l);
      q(3, -14, 3, 2, m);
      if (wind) { q(6, -27, 1, 20, l); q(4, -31, 5, 5, '#e0c040'); d(5, -30, 2, 2, '#fff3b0'); } else { q(6, -23, 1, 23, l); q(5, -25, 3, 3, l); d(6, -24, 1, 1, eye); }
    } else if (role === 'nimble') {
      const s = wind ? 1 : 0;
      q(mv ? -7 : -6, -4, 2, 4, k);
      q(mv ? -3 : -4, -4, 2, 4, m);
      q(mv ? 3 : 4, -4, 2, 4, m);
      q(mv ? 7 : 6, -4, 2, 4, k);
      q(-11, -10, 3, 2, m);
      q(-13, -14 - (mv ? 1 : 0), 2, 5, m);
      d(-13, -15 - (mv ? 1 : 0), 2, 2, l);
      q(-8, -10 + s, 14, 6, m);
      d(-6, -9 + s, 2, 1, k); d(-2, -8 + s, 2, 1, k); d(2, -9 + s, 2, 1, k); d(-4, -6 + s, 2, 1, k);
      d(-5, -5 + s, 9, 1, l);
      q(5, -13 + s, 6, 6, m);
      q(5, -15 + s, 2, 2, k);
      q(9, -15 + s, 2, 2, k);
      d(9, -10 + s, 2, 2, l);
      d(8, -12 + s, 2, 1, eye);
      if (wind) { d(9, -8 + s, 2, 2, '#7a1010'); d(10, -8 + s, 1, 1, WHT); }
    } else {
      const el = role === 'elite';
      q(-4, -5, 3, mv ? 4 : 5, k);
      q(1, -5, 3, mv ? 5 : 4, k);
      q(-8, -8, 3, 2, k);
      q(-9, -11, 2, 3, k);
      q(-7, -15, 2, 6, k);
      q(el ? -6 : -5, -15, el ? 12 : 10, 10, m);
      q(-4, -22, 9, 8, m);
      d(-3, -13, 1, 4, k);
      d(-2, -10, 3, 1, k);
      d(1, -20, 2, 2, eye);
      d(4, -20, 1, 2, eye);
      d(0, -21, 4, 1, k);
      d(1, -16, 4, 1, BLK);
      d(1, -17, 1, 1, WHT); d(4, -17, 1, 1, WHT);
      if (el) {
        // sừng lớn và giáp vai đá
        q(-5, -25, 2, 4, l); q(-7, -28, 2, 4, l); q(-6, -30, 1, 2, l);
        q(3, -25, 2, 4, l); q(5, -28, 2, 4, l); q(6, -30, 1, 2, l);
        q(-9, -18, 5, 5, k); q(5, -18, 5, 5, k);
        d(-9, -18, 5, 1, l); d(5, -18, 5, 1, l);
        d(-2, -12, 4, 3, eye);
        d(-1, -9, 2, 2, eye);
      } else {
        q(-4, -25, 2, 3, l);
        q(3, -25, 2, 3, l);
      }
      if (wind) { q(4, -16, 8, 3, k); d(11, -17, 2, 1, l); d(11, -15, 2, 1, l); d(11, -13, 2, 1, l); } else { q(4, -13, 4, 2, k); d(7, -13, 2, 1, l); d(7, -11, 2, 1, l); }
    }
  }

  // Trùm nhỏ của từng vùng: Nấm Chúa, Cua Đá, Hổ Lửa.
  function miniShape(reg, e) {
    const mv = e.moving ? Math.floor(e.t * 6) % 2 : 0;
    const wind = e.wind > 0;
    const t = G.time;
    if (reg === 0) {
      const st = tn('#eadfc4'), stD = tn('#b8a888'), cap = tn('#a8386c'), capD = tn('#6e2046'), capL = tn('#d05a8e');
      const spot = tn('#f6e8c8'), gold = tn('#ffd23f'), gl = tn('#8fe04a');
      const u = wind ? -1 : 0;
      q(mv ? -6 : -5, -2, 4, 2, stD);
      q(mv ? 2 : 1, -2, 4, 2, stD);
      q(-7, -9, 3, 2, st);
      q(-5, -12, 10, 10, st);
      d(-5, -12, 2, 10, stD);
      d(-5, -3, 10, 1, stD);
      // mũ nấm
      q(-10, -19 + u, 20, 6, cap);
      q(-8, -22 + u, 16, 3, cap);
      q(-5, -24 + u, 10, 2, cap);
      d(-10, -14 + u, 20, 1, capD);
      d(-8, -13 + u, 16, 1, gl);
      d(-7, -22 + u, 6, 1, capL);
      d(-9, -19 + u, 1, 3, capL);
      d(-6, -19 + u, 3, 2, spot);
      d(1, -22 + u, 3, 2, spot);
      d(6, -18 + u, 2, 2, spot);
      d(-1, -17 + u, 2, 1, spot);
      // vương miện
      q(-3, -26 + u, 7, 2, gold);
      q(-3, -28 + u, 1, 2, gold); q(0, -28 + u, 1, 2, gold); q(3, -28 + u, 1, 2, gold);
      d(0, -26 + u, 1, 1, tn('#d8372d'));
      // mặt
      d(-1, -11, 4, 1, capD);
      d(0, -10, 2, 3, BLK);
      d(4, -10, 1, 3, BLK);
      d(0, -10, 1, 1, gl);
      if (wind) {
        d(1, -6, 4, 3, BLK);
        d(2, -6, 1, 1, WHT);
        q(5, -13, 6, 3, st);
        const f = Math.floor(t * 10) % 3;
        d(-9 + f * 2, -27 - f, 1, 1, gl); d(7 - f, -26 - f, 1, 1, gl); d(-2 + f * 3, -31, 1, 1, gl); d(11, -20 - f * 2, 1, 1, gl);
      } else {
        d(1, -5, 4, 1, BLK);
        q(5, -9, 3, 2, st);
      }
    } else if (reg === 1) {
      const s = tn('#8693a0'), sD = tn('#4f5b68'), sL = tn('#bcc8d0'), ice = tn('#7fd4ff'), iceL = tn('#e9f9ff');
      const a = mv ? 1 : 0, cy = wind ? -19 : -13;
      // chân
      q(-11 + a, -3, 2, 3, sD); q(-8 - a, -2, 2, 2, sD); q(6 + a, -2, 2, 2, sD); q(9 - a, -3, 2, 3, sD);
      q(-12, -5, 3, 2, sD); q(9, -5, 3, 2, sD);
      // tinh thể băng trên lưng
      q(-5, -17, 3, 5, ice); q(-1, -20, 3, 8, ice); q(3, -16, 2, 4, ice);
      d(-1, -20, 1, 4, iceL); d(-5, -17, 1, 2, iceL);
      // mai
      q(-9, -11, 18, 8, s);
      q(-7, -13, 14, 2, s);
      d(-9, -5, 18, 2, sD);
      d(-6, -13, 7, 1, sL);
      d(-9, -11, 1, 4, sL);
      d(-3, -10, 1, 4, sD); d(-2, -7, 3, 1, sD); d(4, -11, 1, 3, sD);
      // mắt
      q(5, -16, 2, 4, sD); q(8, -15, 2, 3, sD);
      d(5, -16, 2, 2, tn('#ffe14a')); d(8, -15, 2, 2, tn('#ffe14a'));
      d(6, -16, 1, 1, BLK); d(9, -15, 1, 1, BLK);
      d(5, -8, 4, 1, BLK);
      // càng
      q(8, -10, 3, 3, sD);
      q(9, cy, 6, 7, s);
      d(9, cy, 6, 1, sL);
      d(12, cy + 3, 3, 2, BLK);
      d(14, cy + 2, 1, 1, WHT);
      q(-11, -10, 3, 3, sD);
      q(-14, cy + 2 + (wind ? 0 : a), 5, 6, s);
      d(-14, cy + 2 + (wind ? 0 : a), 5, 1, sL);
      d(-14, cy + 5 + (wind ? 0 : a), 3, 2, BLK);
    } else {
      const o = tn('#f08a2a'), oD = tn('#b85a14'), cr = tn('#ffe6c0'), sp = tn('#3a1a10'), f1 = tn('#ff7a2a'), f2 = tn('#ffd23f');
      const s = wind ? 1 : 0, f = Math.floor(t * 10) % 3;
      // đuôi có ngọn lửa
      q(-13, -12, 2, 6, o); q(-15, -16, 2, 5, o);
      d(-13, -10, 2, 1, sp); d(-15, -14, 2, 1, sp);
      d(-16, -20 - (f === 1 ? 1 : 0), 4, 4, f1); d(-15, -19, 2, 2, f2); d(-15 + f, -22, 1, 2, f1);
      // chân
      q(mv ? -9 : -8, -5, 3, 5, o); q(mv ? -5 : -6, -5, 3, 5, oD); q(mv ? 4 : 5, -5, 3, 5, oD); q(mv ? 8 : 7, -5, 3, 5, o);
      d(mv ? -9 : -8, -1, 4, 1, cr); d(mv ? 8 : 7, -1, 4, 1, cr);
      // bờm lửa
      d(-7 + f, -17 + s, 3, 4, f1); d(-2, -18 + s - f, 3, 5, f1); d(3 - f, -17 + s, 3, 4, f1);
      d(-6 + f, -15 + s, 1, 2, f2); d(-1, -16 + s - f, 1, 3, f2); d(4 - f, -15 + s, 1, 2, f2);
      // thân
      q(-10, -13 + s, 18, 8, o);
      d(-8, -7 + s, 14, 2, cr);
      d(-7, -13 + s, 1, 5, sp); d(-3, -13 + s, 1, 6, sp); d(1, -13 + s, 1, 5, sp); d(5, -13 + s, 1, 4, sp);
      d(-10, -13 + s, 18, 1, oD);
      // đầu
      q(6, -18 + s, 8, 8, o);
      q(6, -20 + s, 2, 2, o); q(11, -20 + s, 2, 2, o);
      d(8, -18 + s, 1, 2, sp); d(10, -18 + s, 1, 3, sp); d(6, -15 + s, 2, 1, sp); d(6, -13 + s, 2, 1, sp);
      q(10, -14 + s, 5, 4, cr);
      d(14, -14 + s, 1, 1, BLK);
      d(10, -16 + s, 2, 1, tn('#ffe14a'));
      d(13, -16 + s, 1, 1, tn('#ffe14a'));
      if (wind) { d(10, -11 + s, 5, 3, '#7a1010'); d(10, -11 + s, 1, 2, WHT); d(14, -11 + s, 1, 2, WHT); d(15, -10 + s, 2, 1, f2); } else d(11, -11 + s, 3, 1, BLK);
    }
  }

  A.enemy = function (c, e) {
    const x = Math.round(e.x), y = Math.round(e.y);
    const sc = e.scale || 1;
    const reg = region();
    const mini = e.role === 'mini';
    A.ellipse(c, x, y, e.r * (mini ? 1.6 : 1.1), mini ? 4 : 2, 'rgba(0,0,0,0.3)');
    if (e.resist) {
      // vòng hào quang kháng hệ dưới chân
      const rc = G.EL[e.resist].col, rr = Math.round(e.r * 1.1) + 3, f = Math.floor(G.time * 6) % 3;
      ring(c, x, y, rr, 3, rc);
      p(c, x - rr, y - 6 - f, 1, 3, rc);
      p(c, x + rr - 1, y - 9 + f, 1, 3, rc);
    }
    const blink = e.wind > 0 && Math.floor(e.t * 16) % 2;
    TM = e.flash > 0 ? 1 : e.st.frozen > 0 ? 2 : blink ? 3 : 0;
    c.save();
    c.translate(x, y);
    c.scale((e.face < 0 ? -1 : 1) * sc, sc);
    cx = c;
    OC = blink && TM === 3 ? '#7a1408' : DARK;
    if (mini) {
      OUT = true; miniShape(reg, e); OUT = false;
      miniShape(reg, e);
    } else {
      const S = e.skin || G.REGIONS[reg].skin;
      const E = e.el ? G.EL[e.el] : null;
      const alt = ALT[reg][e.role];
      const m = tn(E ? E.dark : alt ? mix(S[0], alt, 0.65) : S[0]), k = tn(E ? '#2a2224' : alt ? mix(S[1], dim(alt, 0.35), 0.5) : S[1]), l = tn(E ? E.col : S[2]);
      const eye = E ? E.col2 : EYE[reg];
      const mv = e.moving ? Math.floor(e.t * 8) % 2 : 0, wind = e.wind > 0;
      const fn = reg === 1 ? shapeSea : reg === 2 ? shapeRock : shapeForest;
      const fl = Math.floor(e.t * 8) % 2;
      OUT = true; fn(e.role, mv, wind, m, k, l, eye, fl); OUT = false;
      fn(e.role, mv, wind, m, k, l, eye, fl);
    }
    TM = 0;
    OC = DARK;
    c.restore();
    const top = y - (e.h || 22) * sc;
    if (e.wind > 0) {
      const ty = top - (e.role === 'elite' ? 8 : mini ? -4 : 0);
      // dấu chấm than báo sắp ra đòn
      const cc = blink ? '#fff3b0' : '#ff4030';
      p(c, x - 2, ty - 15, 4, 7, '#140d0e');
      p(c, x - 2, ty - 7, 4, 4, '#140d0e');
      p(c, x - 1, ty - 14, 2, 5, cc);
      p(c, x - 1, ty - 6, 2, 2, cc);
    }
    A.status(c, e, x, top);
  };
  A.status = function (c, e, x, top) {
    const t = G.time;
    if (e.st.fire > 0) {
      const f = Math.floor(t * 12) % 3;
      p(c, x - 4 + f, top - 4, 3, 4, '#ff7a2a');
      p(c, x + 1 - f, top - 6, 2, 5, '#ff7a2a');
      p(c, x - 1, top - 3, 3, 3, '#ffd23f');
      p(c, x + 1 - f, top - 4, 1, 2, '#ffd23f');
    }
    if (e.st.poisonN > 0) {
      const f = Math.floor(t * 6) % 4;
      for (let i = 0; i < Math.min(5, e.st.poisonN); i++) {
        const py = top + 2 - ((f + i) % 3);
        p(c, x - 7 + i * 3, py - 1, 4, 4, '#1c3a10');
        p(c, x - 6 + i * 3, py, 2, 2, '#8fe04a');
      }
    }
    if (e.st.iceN > 0 || e.st.frozen > 0) {
      const n = Math.max(e.st.iceN, e.st.frozen > 0 ? 4 : 0);
      for (let i = 0; i < n; i++) {
        p(c, x - 7 + i * 3, top + 5, 4, 4, '#173a5a');
        p(c, x - 6 + i * 3, top + 6, 2, 2, '#bfeaff');
      }
    }
    if (e.st.root > 0) {
      p(c, x - 6, top + 10, 12, 1, '#caa15a');
      p(c, x - 6, top + 9, 1, 3, '#caa15a');
      p(c, x + 5, top + 9, 1, 3, '#caa15a');
    }
  };

  // ---------- boss ----------
  // Mỗi bộ màu: [thân, tối, điểm nhấn]
  const TINT = {
    moc: { none: ['#6a4429', '#40291a', '#4a8a36'], fire: ['#4c3a32', '#241a16', '#7a5240'], poison: ['#586430', '#353f1e', '#8fc440'], ice: ['#66747c', '#414c54', '#a8d8e4'] },
    ngu: { none: ['#2f8f8a', '#1a5560', '#f0a050'], fire: ['#6fb4c0', '#356a7a', '#e8fbff'], poison: ['#5a9a84', '#2c5a50', '#f2f7f7'], ice: ['#7d8794', '#444c58', '#c4ccd6'] },
    ho: { none: ['#f6f3ec', '#c4bcae', '#d02020'], fire: ['#ffe6c8', '#dc9a68', '#ff6a1a'], poison: ['#e4f4d0', '#98b87c', '#4fae2a'], ice: ['#e9f7ff', '#a4cbe6', '#3a8fd8'] },
  };
  let BF = false; // boss đang nháy trúng đòn
  const C = (k) => (BF ? lite(k, 0.14) : k);
  const hasL = (b, type) => b.layers && b.layers.some((l) => l.type === type);

  function mocBody(b, T, el, t) {
    const bark = C(T[0]), barkD = C(T[1]), barkL = C(lite(T[0], 0.18)), leaf = C(T[2]), leafD = C(dim(T[2], 0.32)), leafL = C(lite(T[2], 0.22));
    const sw = b.armSwing || 0;
    // rễ phụ rủ xuống kiểu cây đa
    d(-31, -98, 1, 62, barkD); d(-27, -96, 1, 74, barkD); d(29, -96, 1, 66, barkD); d(34, -100, 1, 48, barkD);
    if (b.phase < 1) {
      qe(-34, -106, 22, 12, leafD);
      qe(34, -106, 22, 12, leafD);
      qe(0, -110, 40, 14, leafD);
    } else {
      // cành trụi lá khi nổi giận
      seg(-10, -96, -30, -124, 4, barkD); seg(-22, -112, -38, -116, 3, barkD); seg(-30, -124, -26, -132, 2, barkD);
      seg(8, -96, 26, -122, 4, barkD); seg(18, -110, 34, -112, 3, barkD); seg(26, -122, 30, -130, 2, barkD);
      seg(0, -96, 2, -130, 4, barkD); seg(1, -118, -8, -128, 2, barkD);
      d(-39, -119, 3, 2, leaf); d(33, -115, 3, 2, leaf); d(-9, -131, 3, 2, leaf);
      for (let i = 0; i < 3; i++) {
        const ly = (t * 16 + i * 37) % 110;
        d(Math.round(-34 + i * 30 + Math.sin(t * 2 + i) * 5), Math.round(-122 + ly), 2, 1, leaf);
      }
    }
    // tay cành
    const ex = -40, ey = -80 + Math.round(sw * 8), hx = -58, hy = -54 + Math.round(sw * 30);
    seg(-22, -72, ex, ey, 6, barkD);
    seg(ex, ey, hx, hy, 5, barkD);
    seg(hx, hy, hx - 8, hy - 3, 2, barkD); seg(hx, hy, hx - 8, hy + 4, 2, barkD); seg(hx, hy, hx - 3, hy + 9, 2, barkD);
    d(ex - 2, ey - 3, 4, 1, barkL);
    const ry = Math.round(Math.sin(t * 2) * 3);
    seg(22, -72, 40, -84, 6, barkD);
    seg(40, -84, 52, -62 - ry, 5, barkD);
    seg(52, -62 - ry, 60, -66 - ry, 2, barkD); seg(52, -62 - ry, 59, -56 - ry, 2, barkD); seg(52, -62 - ry, 54, -52 - ry, 2, barkD);
    // gốc và rễ
    q(-30, -8, 60, 8, barkD);
    q(-39, -5, 10, 5, barkD); q(29, -5, 10, 5, barkD);
    q(-46, -2, 8, 2, barkD); q(38, -2, 8, 2, barkD);
    // thân: chân loe, eo thắt, vai xòe
    q(-34, -13, 9, 7, bark); q(25, -13, 9, 7, bark);
    q(-27, -20, 54, 14, bark);
    q(-22, -46, 44, 28, bark);
    q(-20, -80, 40, 36, bark);
    q(-22, -92, 44, 14, bark);
    q(-25, -99, 50, 8, bark);
    d(-27, -8, 54, 2, barkD);
    for (let i = 0; i < 6; i++) d(-16 + i * 6, -90 + ((i * 13) % 9), 2, 64 + ((i * 7) % 16), barkD);
    d(-20, -90, 2, 44, barkL); d(-22, -46, 2, 28, barkL); d(-27, -20, 2, 10, barkL); d(-12, -96, 1, 20, barkL); d(8, -30, 1, 18, barkL);
    d(17, -92, 3, 46, barkD); d(19, -46, 3, 28, barkD); d(23, -20, 4, 12, barkD);
    d(-20, -30, 5, 3, barkD); d(-19, -29, 2, 1, BLK);
    if (b.phase < 1) {
      qe(-22, -118, 24, 12, leaf);
      qe(22, -118, 24, 12, leaf);
      qe(0, -124, 26, 10, leaf);
      qe(-44, -110, 12, 8, leaf);
      qe(44, -110, 12, 8, leaf);
      qe(-53, -103, 9, 6, leaf);
      qe(53, -103, 9, 6, leaf);
      qe(-13, -130, 13, 6, leaf);
      qe(17, -131, 12, 5, leaf);
      de(0, -103, 30, 4, leafD);
      de(-26, -122, 12, 4, leafL); de(16, -123, 12, 4, leafL); de(-2, -129, 12, 3, leafL); de(-46, -113, 6, 3, leafL);
      for (let i = 0; i < 10; i++) d(-44 + ((i * 29) % 88), -124 + ((i * 17) % 22), 3, 1, i % 2 ? leafD : leafL);
      d(-18, -100, 4, 3, leaf); d(10, -100, 5, 2, leaf); d(-4, -99, 3, 3, leafD);
    }
    // mặt: mày cau, mắt hổ phách
    d(-17, -70, 12, 7, BLK); d(5, -70, 12, 7, BLK);
    d(-19, -75, 7, 3, barkD); d(-13, -73, 9, 3, barkD);
    d(12, -75, 7, 3, barkD); d(4, -73, 9, 3, barkD);
    d(-15, -68, 5, 4, '#ffb030'); d(6, -68, 5, 4, '#ffb030');
    d(-15, -67, 2, 2, '#fff0a0'); d(6, -67, 2, 2, '#fff0a0');
    d(-3, -64, 6, 8, barkD); d(-3, -64, 2, 6, barkL);
    // miệng và lõi nhựa
    d(-13, -50, 26, 16, BLK);
    d(-16, -47, 3, 9, BLK); d(13, -47, 3, 9, BLK);
    if (b.exposed > 0) {
      const f = Math.floor(t * 8) % 2;
      d(-8, -48, 16, 12, '#ff8a20');
      d(-6, -47, 12, 10, '#ffb030');
      d(-3, -45, 6, 6, '#fff0a0');
      d(-11 - f, -44, 3, 4, '#ff8a20'); d(8 + f, -44, 3, 4, '#ff8a20');
      d(-1, -52 - f, 2, 3, '#ffd23f');
      d(-12, -33, 24, 1, '#ffb030'); d(-8, -32, 16, 1, '#ff8a20');
    } else {
      d(-3, -46, 6, 6, '#6a400e');
      d(-2, -45, 2, 2, '#a86a1e');
    }
    for (let i = 0; i < 5; i++) {
      d(-12 + i * 5, -50, 3, 3 + (i % 2) * 2, barkL);
      d(-11 + i * 5, -37 - ((i + 1) % 2) * 2, 3, 3 + ((i + 1) % 2) * 2, barkL);
    }
    // dấu hiệu kháng hệ
    if (el === 'fire') {
      // cháy sém, than hồng trong khe nứt
      for (let i = 0; i < 9; i++) {
        const hot = Math.floor(t * 4 + i) % 3;
        d(-18 + ((i * 17) % 36), -86 + ((i * 29) % 52), 1, 5, hot ? '#ff7a2a' : '#ffd23f');
        d(-17 + ((i * 17) % 36), -83 + ((i * 29) % 52), 1, 2, '#a8320a');
      }
      d(-22, -20, 1, 6, '#ff7a2a'); d(20, -26, 1, 7, '#ff7a2a'); d(-6, -14, 1, 5, '#ffd23f');
      for (let i = 0; i < 4; i++) {
        const k = (t * 18 + i * 31) % 60;
        d(Math.round(-30 + i * 19 + Math.sin(t * 3 + i) * 3), Math.round(-98 - k), 1, 1, i % 2 ? '#ffd23f' : '#ff7a2a');
      }
      if (b.phase < 1) for (let i = 0; i < 7; i++) d(-40 + ((i * 23) % 80), -122 + ((i * 11) % 18), 2, 1, Math.floor(t * 3 + i) % 2 ? '#ff7a2a' : '#a8320a');
    } else if (el === 'poison') {
      // nấm mọc trên thân
      const M = [[-25, -84], [20, -80], [-24, -36], [19, -40], [-8, -90], [10, -28], [23, -58], [-27, -56]];
      for (let i = 0; i < M.length; i++) {
        const mx = M[i][0], my = M[i][1];
        d(mx + 2, my + 2, 2, 3, '#e8e2d0');
        d(mx, my, 6, 2, '#8fe04a');
        d(mx + 1, my - 1, 4, 1, '#c2f58a');
        d(mx + 1, my, 1, 1, '#e9ffd0');
      }
      d(-22, -22, 9, 2, '#8fc440'); d(8, -24, 12, 2, '#8fc440'); d(-12, -98, 14, 2, '#8fc440');
      for (let i = 0; i < 4; i++) {
        const k = (t * 10 + i * 23) % 50;
        d(Math.round(-28 + i * 18 + Math.sin(t * 2 + i * 2) * 4), Math.round(-70 - k), 1, 1, '#c2f58a');
      }
    } else if (el === 'ice') {
      // sương giá và nhũ băng
      for (let i = 0; i < 8; i++) d(-22 + ((i * 11) % 42), -99, 3, 5 + ((i * 5) % 6), '#e9f9ff');
      d(-24, -100, 48, 2, '#e9f9ff');
      d(-30, -9, 60, 2, '#e9f9ff'); d(-39, -6, 8, 1, '#e9f9ff'); d(30, -6, 8, 1, '#e9f9ff');
      d(-22, -60, 3, 2, '#bfeaff'); d(16, -44, 4, 2, '#bfeaff'); d(-8, -26, 5, 2, '#bfeaff');
      if (b.phase < 1) {
        de(-22, -126, 16, 3, '#e9f9ff'); de(22, -126, 16, 3, '#e9f9ff'); de(0, -131, 16, 3, '#e9f9ff');
        for (let i = 0; i < 6; i++) d(-50 + i * 19, -103 + ((i * 3) % 4), 2, 4 + ((i * 7) % 5), '#bfeaff');
      }
      if (Math.floor(t * 3) % 2) { d(-14, -84, 1, 3, WHT); d(-15, -83, 3, 1, WHT); d(15, -34, 1, 3, WHT); d(14, -33, 3, 1, WHT); }
    }
    // gai dưới gốc chống áp sát
    if (hasL(b, 'antiMelee')) {
      for (let i = 0; i < 9; i++) {
        const tx = -47 + i * 11, k = i % 2;
        q(tx, -5 - k, 5, 5 + k, '#d8cfa8');
        q(tx + 1, -9 - k * 2, 3, 4 + k, '#d8cfa8');
        q(tx + 2, -12 - k * 3, 1, 3 + k, '#f4eed0');
        d(tx + 3, -8 - k * 2, 1, 8 + k * 2, '#9a906a');
      }
    }
    // rèm lá chống đánh xa
    if (hasL(b, 'antiRanged')) {
      for (let i = 0; i < 5; i++) {
        const s = Math.round(Math.sin(t * 1.5 + i * 1.3) * 2), vx = -70 + i * 5, len = 98 - ((i * 13) % 20);
        q(vx, -112, 3, len >> 1, leafD);
        q(vx + s, -112 + (len >> 1), 3, len >> 1, leafD);
        for (let j = 0; j < 7; j++) d(vx - 1 + (j % 2) * 2 + (j > 3 ? s : 0), -108 + j * 13 + ((i * 5) % 7), 3, 2, j % 2 ? leaf : leafL);
      }
      q(-74, -116, 30, 5, leafD);
      d(-72, -116, 12, 1, leafL);
    }
  }

  function nguSpike(sx, by, h, col, tip) {
    q(sx, by - (h >> 1), 5, (h >> 1) + 2, col);
    q(sx + 1, by - h + 2, 3, h >> 1, col);
    q(sx + 2, by - h, 1, 3, col);
    if (tip) d(sx + 2, by - h, 1, (h >> 1), tip);
  }
  function nguBody(b, T, el, t) {
    const body = C(T[0]), dk = C(T[1]), sc = C(lite(T[0], 0.22)), belly = C(mix(T[0], '#f4f0dc', 0.6)), fin = C(mix(T[1], T[2], 0.6));
    const tw = Math.round(Math.sin(t * 3) * 2);
    // đuôi chẻ đôi
    q(49, -31, 5, 20, fin);
    q(53 + (tw >> 1), -37, 5, 32, fin);
    q(57 + tw, -43, 4, 16, fin); q(57 + tw, -17, 4, 16, fin);
    q(60 + tw, -47, 3, 12, fin); q(60 + tw, -10, 3, 10, fin);
    d(51, -28, 9 + tw, 1, dk); d(51, -21, 7 + tw, 1, dk); d(51, -14, 9 + tw, 1, dk);
    q(42, -28, 10, 14, body);
    // gai lưng, dựng cao khi sắp xòe gai
    const up = b.spikes ? 9 : 0;
    q(-22, -44, 60, 5, dk);
    for (let i = 0; i < 6; i++) nguSpike(-24 + i * 11, -43, 8 + ((i * 5) % 4) + up, b.spikes ? C('#e0563a') : dk, b.spikes ? '#fff0c0' : sc);
    // thân
    qe(4, -22, 42, 19, body);
    de(2, -12, 38, 9, belly);
    d(-12, -40, 34, 1, sc);
    // đầu và hàm
    q(-60, -34, 30, 28, body);
    q(-55, -38, 27, 5, body);
    q(-64, -31, 6, 8, body);
    q(-68, -14, 36, 9, dk);
    q(-64, -5, 28, 3, dk);
    d(-60, -12, 26, 2, C(lite(T[1], 0.15)));
    d(-64, -24, 27, 10, '#2a0f14');
    d(-58, -17, 16, 3, '#8a2434');
    d(-64, -25, 28, 1, dk);
    for (let i = 0; i < 6; i++) {
      d(-62 + i * 4, -24, 2, 3 + ((i + 1) % 2) * 2, WHT);
      const h = 3 + (i % 2) * 2;
      d(-64 + i * 4, -14 - h, 2, h, WHT);
    }
    d(-64, -24, 3, 6, WHT);
    q(-68, -21, 3, 7, WHT);
    d(-67, -15, 2, 1, '#c8c8c8');
    // mắt
    d(-53, -36, 9, 8, '#101a22');
    d(-52, -35, 7, 6, '#ffe14a');
    d(-51, -35, 3, 6, '#1a0808');
    d(-47, -35, 1, 1, WHT);
    d(-56, -37, 5, 2, dk); d(-52, -38, 9, 2, dk);
    // mang phát sáng
    const ex = b.exposed > 0, gp = ex && Math.floor(t * 8) % 2;
    const gl = ex ? (gp ? '#ffffff' : '#bff0ff') : '#3fa8d8';
    if (ex) { d(-31, -34, 20, 22, 'rgba(127,212,255,0.35)'); d(-29, -36, 16, 26, 'rgba(127,212,255,0.25)'); }
    for (let i = 0; i < 3; i++) {
      const gx = -28 + i * 5;
      d(gx, -30, 2, 14, gl);
      d(gx + 1, -32, 2, 3, gl);
      d(gx + 1, -17, 2, 3, gl);
      if (!ex) d(gx, -30, 1, 14, '#1c6a98');
    }
    // vây ngực và vảy
    const pf = Math.floor(t * 4) % 2;
    q(-12, -12 + pf, 12, 5, fin); q(-6, -8 + pf, 12, 4, fin);
    d(-10, -10 + pf, 14, 1, dk);
    for (let i = 0; i < 12; i++) {
      const sx = -8 + ((i * 23) % 46), sy = -35 + ((i * 11) % 15);
      d(sx, sy, 3, 1, sc); d(sx + 3, sy + 1, 1, 1, sc);
    }
    if (el === 'poison') for (let i = 0; i < 8; i++) d(-50 + ((i * 31) % 100), -48 + ((i * 13 + Math.floor(t * 6)) % 44), 2 + (i % 2), 2 + (i % 2), '#f2f7f7');
    if (el === 'fire') for (let i = 0; i < 6; i++) d(-44 + ((i * 37) % 90), -52 - ((i * 7 + Math.floor(t * 8)) % 12), 3, 2, 'rgba(232,251,255,0.6)');
    if (el === 'ice') for (let i = 0; i < 6; i++) { d(-34 + i * 13, -36 + ((i * 5) % 6), 5, 4, dk); d(-34 + i * 13, -36 + ((i * 5) % 6), 5, 1, sc); }
  }

  function hoBody(b, T, t, outline) {
    const fur = C(T[0]), sh = C(T[1]), ac = C(T[2]);
    const n = b.tails != null ? b.tails : 9;
    const tired = b.exposed > 0 && !b.illusion;
    const s = tired ? 2 : 0;
    // chín đuôi xòe hình quạt
    for (let i = 0; i < n; i++) {
      const a = ((-104 + (i * 124) / 8) * Math.PI) / 180, a2 = a + (Math.sin(t * 2 + i) * 10 * Math.PI) / 180;
      const mx = Math.round(16 + Math.cos(a) * 14), my = Math.round(-18 + s + Math.sin(a) * 14);
      const ex = Math.round(16 + Math.cos(a2) * 31), ey = Math.round(-18 + s + Math.sin(a2) * 31);
      seg(16, -18 + s, mx, my, 3, i % 2 ? sh : fur);
      seg(mx, my, ex, ey, 5, i % 2 ? sh : fur);
      if (!OUT) seg(mx, my, ex, ey, 3, fur);
      q(ex - 2, ey - 2, 5, 5, b.tailEl ? G.EL[b.tailEl].col : ac);
      d(ex - 1, ey - 1, 2, 2, b.tailEl ? G.EL[b.tailEl].col2 : C(lite(T[2], 0.4)));
    }
    // chân
    const lg = tired ? 0 : Math.floor(t * 8) % 2;
    q(-15 - lg, -11 + s, 3, 11 - s - lg, sh); q(-8 + lg, -11 + s, 3, 10 - s + lg, fur);
    q(7 - lg, -11 + s, 3, 11 - s - lg, sh); q(14 + lg, -11 + s, 3, 10 - s + lg, fur);
    d(-8 + lg, -3 + lg, 3, 2, ac); d(14 + lg, -3 + lg, 3, 2, ac);
    // thân
    q(-14, -23 + s, 30, 11, fur);
    q(8, -25 + s, 11, 13, fur);
    q(-19, -26 + s, 8, 12, fur);
    d(-10, -14 + s, 20, 2, sh);
    d(-18, -16 + s, 5, 2, sh); d(-17, -14 + s, 3, 2, sh);
    d(-6, -23 + s, 14, 1, C(lite(T[0], 0.5)));
    // đầu
    q(-27, -34 + s, 13, 11, fur);
    q(-34, -29 + s, 8, 5, fur);
    q(-26, -40 + s, 4, 7, fur); q(-19, -40 + s, 4, 7, fur);
    q(-25, -42 + s, 2, 2, fur); q(-18, -42 + s, 2, 2, fur);
    d(-25, -39 + s, 2, 5, ac); d(-18, -39 + s, 2, 5, ac);
    d(-35, -29 + s, 2, 2, BLK);
    d(-33, -25 + s, 7, 1, sh);
    d(-29, -31 + s, 3, 2, '#e01818'); d(-28, -31 + s, 1, 2, BLK);
    d(-26, -32 + s, 3, 1, ac); d(-23, -33 + s, 2, 1, ac);
    d(-23, -36 + s, 2, 2, ac);
    d(-21, -27 + s, 3, 1, ac); d(-22, -25 + s, 3, 1, ac);
    if (tired) {
      // lộ điểm yếu: thè lưỡi, choáng
      d(-33, -24 + s, 2, 3, '#e05a6a');
      const f = Math.floor(t * 6) % 4;
      d(-30 + f * 4, -46 + (f % 2) * 2, 2, 2, '#ffd23f');
      d(-18 - f * 4, -47 + ((f + 1) % 2) * 2, 2, 2, '#ffd23f');
    }
    // đốm linh khí theo hệ kháng
    if (outline) {
      const f = Math.floor(t * 5) % 3;
      d(-40 + f, -44 - f, 2, 2, ac); d(2 - f, -52 + f, 2, 2, ac); d(48, -30 - f * 2, 2, 2, ac);
    }
  }

  A.boss = function (c, b) {
    const x = Math.round(b.x), y = Math.round(b.y);
    const res = b.layers && b.layers.find((l) => l.type === 'resist');
    const el = res ? res.el : null;
    const T = TINT[b.kind][el || 'none'];
    const t = G.time;
    BF = b.flash > 0;
    // Trúng đòn: viền sáng lên và thân nhạt đi một chút, không tô trắng cả khối.
    OC = BF ? '#fff6dc' : DARK;
    cx = c;
    c.save();
    c.translate(x, y);
    if (b.kind === 'moc') {
      A.ellipse(c, 0, 0, 46, 5, 'rgba(0,0,0,0.35)');
      OUT = true; mocBody(b, T, el, t); OUT = false;
      mocBody(b, T, el, t);
    } else if (b.kind === 'ngu') {
      if (b.hidden) {
        // chỉ còn vây lưng rẽ nước
        const fx = Math.round(Math.sin(t * 3) * 3), f = Math.floor(t * 6) % 2;
        A.ellipse(c, 0, 3, 46, 6, 'rgba(8,18,34,0.4)');
        for (let k = 0; k < 2; k++) {
          OUT = k === 0;
          q(-6 + fx, -4, 13, 4, C(T[1])); q(-4 + fx, -9, 9, 5, C(T[1])); q(-2 + fx, -13, 6, 4, C(T[1])); q(1 + fx, -17, 2, 4, C(T[1]));
          d(-3 + fx, -8, 1, 6, C(lite(T[1], 0.25))); d(0 + fx, -12, 1, 9, C(lite(T[1], 0.25)));
        }
        OUT = false;
        p(c, -16, -1, 34, 2, 'rgba(210,240,252,0.8)');
        p(c, -24 - f * 2, 1, 10, 1, 'rgba(210,240,252,0.6)');
        p(c, 16 + f * 2, 1, 10, 1, 'rgba(210,240,252,0.6)');
        p(c, -12 + f * 3, 3, 8, 1, 'rgba(210,240,252,0.4)');
      } else {
        c.scale(b.face < 0 ? 1 : -1, 1);
        const f = Math.floor(t * 5) % 2;
        A.ellipse(c, 0, 0, 70, 6, 'rgba(8,18,34,0.35)');
        A.ellipse(c, 0, 0, 66, 5, 'rgba(120,190,225,0.5)');
        OUT = true; nguBody(b, T, el, t); OUT = false;
        nguBody(b, T, el, t);
        p(c, -62 + f * 3, -2, 14, 1, 'rgba(225,245,255,0.8)');
        p(c, -30 - f * 2, 1, 18, 1, 'rgba(225,245,255,0.6)');
        p(c, 8 + f * 3, -1, 16, 1, 'rgba(225,245,255,0.8)');
        p(c, 38 - f * 2, 2, 14, 1, 'rgba(225,245,255,0.6)');
      }
    } else {
      c.scale(b.face < 0 ? 1 : -1, 1);
      const solid = b.alpha == null || b.alpha >= 1;
      if (!b.illusion) A.ellipse(c, 0, 0, b.big ? 34 : 24, b.big ? 5 : 4, 'rgba(0,0,0,0.35)');
      if (b.alpha != null) c.globalAlpha = b.alpha;
      const s = b.big ? 1.5 : 1;
      c.scale(s, s);
      if (solid) { OUT = true; hoBody(b, T, t, false); OUT = false; }
      hoBody(b, T, t, solid && !!el);
    }
    OUT = false;
    BF = false;
    OC = DARK;
    c.restore();
  };

  // ---------- cảnh nền ----------
  // Dãy núi răng cưa trôi chậm theo camera.
  function ridge(c, par, seed, base, amp, col, step) {
    c.fillStyle = col;
    const off = ((par % step) + step) % step;
    for (let sx = -off; sx < G.W; sx += step) {
      const i = Math.round((sx + par) / step) + (seed % 50) + 8;
      const a = Math.abs(((i * 0.23) % 2) - 1), b = Math.abs(((i * 0.071 + 0.4) % 2) - 1), e = Math.abs(((i * 0.61) % 2) - 1);
      const h = Math.round(amp * (0.2 + 0.5 * b + 0.22 * a + 0.08 * e));
      c.fillRect(sx, base - h, step, h);
    }
  }
  function e2(c, x, y, rx, ry, col) {
    c.fillStyle = col;
    for (let dy = -ry; dy < ry; dy += 2) {
      const m = dy + 1;
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (m * m) / (ry * ry))));
      if (hw > 0) c.fillRect(x - hw, y + dy, hw * 2, 2);
    }
  }
  function bgForest(c, R, seed, cam, width) {
    const W = G.W, Y = G.GY0, t = G.time;
    p(c, 0, Y - 30, W, 30, '#35603c');
    p(c, 0, Y - 12, W, 12, '#427248');
    // hàng cây xa mờ trong sương
    let rn = G.srand(seed * 131 + 5), par = Math.round(cam * 0.15);
    let span = W + Math.max(0, width - W) * 0.15 + 80;
    for (let i = 0, n = Math.ceil(span / 22); i < n; i++) {
      const bx = Math.round(rn() * span) - 40 - par, tw = 4 + Math.floor(rn() * 7);
      if (bx < -12 || bx > W) continue;
      p(c, bx, 0, tw, Y, '#28502f');
      p(c, bx, 0, 1, Y, '#306039');
    }
    // thân cây gần
    rn = G.srand(seed * 977 + 13); par = Math.round(cam * 0.4);
    span = W + Math.max(0, width - W) * 0.4 + 120;
    for (let i = 0, n = Math.ceil(span / 60); i < n; i++) {
      const bx = Math.round(rn() * span) - 60 - par, tw = 9 + Math.floor(rn() * 12), k = rn(), vy = 30 + Math.floor(rn() * 60);
      if (bx < -50 || bx > W + 30) continue;
      p(c, bx, 0, tw, Y, R.deco);
      p(c, bx, 0, 2, Y, '#24402a');
      p(c, bx + tw - 2, 0, 2, Y, '#12241a');
      p(c, bx - 3, Y - 7, tw + 6, 7, R.deco);
      p(c, bx - 6, Y - 3, tw + 12, 3, R.deco);
      p(c, bx + 3, 40 + Math.floor(k * 50), 2, 5, '#12241a');
      if (k > 0.5) {
        // cành ngang và tán lá
        p(c, bx + tw, vy, 14, 3, R.deco);
        e2(c, bx + tw + 16, vy - 2, 14, 8, '#1d3a22');
        p(c, bx + tw + 8, vy - 7, 10, 2, '#2a5230');
      } else {
        // dây leo
        p(c, bx - 4, 0, 1, vy + 30, '#2a5a30');
        p(c, bx - 5, vy, 3, 2, '#3f7a3a');
        p(c, bx - 4, vy + 14, 3, 2, '#3f7a3a');
        p(c, bx + tw + 3, 0, 1, vy, '#2a5a30');
        p(c, bx + tw + 2, vy - 2, 3, 2, '#3f7a3a');
      }
      if (k > 0.25 && k < 0.8) { e2(c, bx - 12, Y - 4, 13, 6, '#1f3f25'); p(c, bx - 18, Y - 8, 8, 1, '#2f5a32'); }
    }
    // tán lá phủ phía trên
    p(c, 0, 0, W, 12, '#0f1f16');
    const o2 = ((par % 44) + 44) % 44;
    for (let sx = -o2 - 10; sx < W; sx += 44) {
      p(c, sx, 12, 34, 5, '#0f1f16'); p(c, sx + 5, 17, 22, 4, '#0f1f16'); p(c, sx + 11, 21, 9, 3, '#0f1f16');
      p(c, sx + 26, 12, 20, 3, '#17301f'); p(c, sx + 30, 15, 10, 2, '#17301f');
    }
    // đom đóm
    for (let i = 0; i < 7; i++) {
      if (Math.sin(t * 3 + i * 1.7) < 0) continue;
      const fx = Math.round(((i * 97 + seed * 13) % W) + Math.sin(t * 0.7 + i) * 8), fy = Math.round(56 + ((i * 37) % 70) + Math.cos(t * 0.9 + i * 2) * 5);
      p(c, fx - 1, fy - 1, 3, 3, 'rgba(244,255,154,0.25)');
      p(c, fx, fy, 1, 1, '#f4ff9a');
    }
  }
  function bgCave(c, R, seed, cam, width) {
    const W = G.W, Y = G.GY0, t = G.time;
    p(c, 0, 70, W, 2, '#102236'); p(c, 0, 112, W, 2, '#173450');
    // cửa hang nhìn ra biển đêm
    let par = Math.round(cam * 0.15);
    for (let k = 0; k < 3; k++) {
      const ox = 300 + k * 430 + ((seed * 53) % 120) - par;
      if (ox < -90 || ox > W + 90) continue;
      e2(c, ox, Y - 18, 76, 50, '#1b4864');
      e2(c, ox, Y - 14, 62, 40, '#2a6c8c');
      p(c, ox - 60, Y - 20, 120, 20, '#1f5878');
      p(c, ox - 60, Y - 21, 120, 1, '#5fb0d0');
      p(c, ox + 16, Y - 46, 7, 7, '#e9f9ff'); p(c, ox + 15, Y - 45, 9, 5, '#e9f9ff');
      const f = Math.floor(t * 2) % 2;
      p(c, ox + 10 + f, Y - 16, 18, 1, '#9fdcf0'); p(c, ox + 14 - f, Y - 12, 12, 1, '#7fc4e0'); p(c, ox + 12 + f, Y - 8, 14, 1, '#7fc4e0'); p(c, ox - 30 - f, Y - 10, 10, 1, '#3f88a8');
    }
    p(c, 0, 0, W, 10, '#070e18');
    // thạch nhũ và măng đá
    const rn = G.srand(seed * 977 + 13);
    par = Math.round(cam * 0.4);
    const span = W + Math.max(0, width - W) * 0.4 + 120;
    for (let i = 0, n = Math.ceil(span / 34); i < n; i++) {
      const bx = Math.round(rn() * span) - 60 - par, tw = 8 + Math.floor(rn() * 14), th = 22 + Math.floor(rn() * 62), k = rn();
      if (bx < -40 || bx > W + 20) continue;
      if (i % 3 !== 2) {
        for (let j = 0; j < 5; j++) {
          const w = Math.max(2, Math.round(tw * (1 - j / 5))), x0 = bx + Math.round((tw - w) / 2);
          p(c, x0, Math.round((j * th) / 5), w, Math.ceil(th / 5), R.deco);
          p(c, x0, Math.round((j * th) / 5), 1, Math.ceil(th / 5), '#1c3a56');
        }
        if (i % 3 === 0) {
          const dy = th + ((t * 70 + i * 43) % (Y - th + 30));
          if (dy < Y) p(c, bx + (tw >> 1), Math.round(dy), 1, 3, '#9fdcff');
        }
      } else {
        const sh = 12 + (th >> 1);
        for (let j = 0; j < 4; j++) {
          const w = Math.max(2, Math.round((tw + 6) * (1 - j / 4))), x0 = bx + Math.round((tw + 6 - w) / 2);
          p(c, x0, Y - Math.round(((j + 1) * sh) / 4), w, Math.ceil(sh / 4), '#0b1a28');
          p(c, x0, Y - Math.round(((j + 1) * sh) / 4), 1, Math.ceil(sh / 4), '#1c3a56');
        }
      }
      if (k > 0.55) {
        // cụm tinh thể phát sáng trên vách
        const gx = bx + tw + 8, gy = 64 + Math.floor(k * 60);
        p(c, gx - 3, gy - 2, 9, 9, 'rgba(79,196,232,0.12)');
        p(c, gx, gy - 2, 2, 7, '#4fc4e8'); p(c, gx + 2, gy + 1, 2, 4, '#2f8fc0'); p(c, gx - 2, gy + 2, 2, 3, '#2f8fc0');
        if (Math.sin(t * 2 + i) > 0.3) p(c, gx, gy - 2, 1, 2, '#e9f9ff');
      }
    }
  }
  function bgRock(c, R, seed, cam, width) {
    const W = G.W, Y = G.GY0, t = G.time;
    // mặt trời đỏ và mây vệt
    const sx = 340 - Math.round(cam * 0.05);
    e2(c, sx, 92, 28, 28, '#ffb45a');
    e2(c, sx, 92, 22, 22, '#ffd27a');
    p(c, sx - 28, 96, 56, 2, R.sky[2]); p(c, sx - 28, 104, 56, 3, R.sky[2]); p(c, sx - 28, 112, 56, 4, R.sky[2]);
    const cl = Math.round(cam * 0.08);
    p(c, 40 - cl, 34, 90, 2, '#5a2618'); p(c, 70 - cl, 38, 50, 2, '#5a2618'); p(c, 230 - cl, 52, 110, 2, '#7a3a20'); p(c, 420 - cl, 28, 80, 2, '#5a2618'); p(c, 560 - cl, 60, 90, 2, '#7a3a20');
    ridge(c, Math.round(cam * 0.12), seed, Y, 78, '#8a3e22', 8);
    ridge(c, Math.round(cam * 0.25) + 300, seed + 17, Y, 50, '#4e2216', 8);
    // cột đá gần
    const rn = G.srand(seed * 977 + 13), par = Math.round(cam * 0.4);
    const span = W + Math.max(0, width - W) * 0.4 + 140;
    for (let i = 0, n = Math.ceil(span / 70); i < n; i++) {
      const bx = Math.round(rn() * span) - 70 - par, tw = 22 + Math.floor(rn() * 30), th = 26 + Math.floor(rn() * 60), k = rn();
      if (bx < -60 || bx > W + 10) continue;
      for (let j = 0; j < 4; j++) {
        const w = Math.max(6, Math.round(tw * (1 - j * 0.2))), x0 = bx + Math.round((tw - w) * (k > 0.5 ? 0.3 : 0.7)), y0 = Y - Math.round(((j + 1) * th) / 4);
        p(c, x0, y0, w, Math.ceil(th / 4), R.deco);
        p(c, x0, y0, 2, Math.ceil(th / 4), '#5a2c1c');
        if (j === 3) p(c, x0, y0, w, 1, '#6e3822');
      }
      if (k < 0.35) {
        // cây khô
        const tx = bx + tw + 10;
        p(c, tx, Y - 30, 2, 30, '#1c0e0a'); p(c, tx - 5, Y - 24, 5, 1, '#1c0e0a'); p(c, tx - 5, Y - 28, 1, 4, '#1c0e0a'); p(c, tx + 2, Y - 19, 6, 1, '#1c0e0a'); p(c, tx + 7, Y - 24, 1, 5, '#1c0e0a');
      }
    }
    p(c, 0, Y - 4, W, 4, 'rgba(255,122,42,0.16)');
    // tàn lửa bay lên
    for (let i = 0; i < 8; i++) {
      const ex = Math.round(((i * 61 + seed * 7) % W) + Math.sin(t * 1.3 + i) * 6), ey = Math.round(Y - ((t * 14 + i * 23) % 110));
      p(c, ex, ey, 1, 1, i % 2 ? '#ffb040' : '#ff6a2a');
    }
  }
  // Mặt đất đi được: mép sáng, hoạ tiết bám theo camera.
  const GROUND = [
    { edge: '#6a9a40', edge2: '#2a4220', far: 'rgba(10,30,14,0.22)' },
    { edge: '#70869c', edge2: '#2c3846', far: 'rgba(6,14,26,0.25)' },
    { edge: '#96694a', edge2: '#3e2619', far: 'rgba(30,10,6,0.22)' },
  ];
  function bgGround(c, reg, R, seed, cam, width) {
    const W = G.W, H = G.H, Y = G.GY0, t = G.time, K = GROUND[reg];
    p(c, 0, Y, W, H - Y, R.ground);
    p(c, 0, Y + 3, W, 12, K.far);
    p(c, 0, Y + 15, W, 10, reg === 0 ? 'rgba(10,30,14,0.1)' : reg === 1 ? 'rgba(6,14,26,0.12)' : 'rgba(30,10,6,0.1)');
    const rn = G.srand(seed * 31 + 7);
    const n = Math.min(150, Math.round(width / 6));
    for (let i = 0; i < n; i++) {
      const gx = Math.round(rn() * width) - cam, gy = Y + 6 + Math.floor(rn() * (H - Y - 10)), w = 2 + Math.floor(rn() * 6), k = i % 12;
      if (gx < -30 || gx > W + 4) continue;
      if (k < 6) p(c, gx, gy, w + 2, 1, k % 3 ? R.ground2 : 'rgba(255,255,255,0.07)');
      else if (reg === 0) {
        if (k < 9) { p(c, gx, gy - 2, 1, 3, '#6a9a40'); p(c, gx + 2, gy - 3, 1, 4, '#7fb04a'); p(c, gx + 4, gy - 1, 1, 2, '#6a9a40'); } else if (k === 9) { p(c, gx, gy, 1, 2, '#4a7a30'); p(c, gx - 1, gy - 2, 3, 2, i % 2 ? '#f4e9b0' : '#f0a8c0'); p(c, gx, gy - 1, 1, 1, '#e0a030'); } else if (k === 10) { p(c, gx, gy - 2, 6, 3, '#59604c'); p(c, gx, gy - 2, 5, 1, '#8a9078'); p(c, gx + 1, gy + 1, 6, 1, 'rgba(0,0,0,0.25)'); } else { p(c, gx, gy, 3, 1, '#8a6a2a'); p(c, gx + 1, gy - 1, 2, 1, '#a8842f'); }
      } else if (reg === 1) {
        if (k === 6) p(c, gx, gy, w + 4, 1, '#3d4c5e');
        else if (k === 7) {
          // vũng nước
          A.ellipse(c, gx, gy, w * 2 + 6, 2 + (w >> 2), '#35688a');
          p(c, gx - w - 2 + (Math.floor(t * 2 + i) % 3), gy - 1, w + 1, 1, '#8fd0ea');
        } else if (k < 10) { p(c, gx, gy, 7, 1, '#2c3846'); p(c, gx + 6, gy + 1, 5, 1, '#2c3846'); p(c, gx + 3, gy - 1, 1, 1, '#2c3846'); } else if (k === 10) { p(c, gx, gy - 2, 6, 3, '#313e4c'); p(c, gx, gy - 2, 5, 1, '#8497aa'); } else { p(c, gx, gy - 1, 3, 2, i % 2 ? '#f0c8c0' : '#f0a050'); p(c, gx + 1, gy - 2, 1, 1, '#ffffff'); if (i % 2 === 0) { p(c, gx + 1, gy - 2, 1, 4, '#f0a050'); p(c, gx - 1, gy, 5, 1, '#f0a050'); } }
      } else {
        if (k < 8) { p(c, gx, gy, 8, 1, '#3e2619'); p(c, gx + 7, gy + 1, 5, 1, '#3e2619'); p(c, gx + 2, gy - 1, 1, 1, '#3e2619'); } else if (k === 8) {
          // khe nứt dung nham
          const hot = Math.floor(t * 3 + i) % 2;
          p(c, gx - 1, gy - 1, 14, 4, 'rgba(255,122,42,0.14)');
          p(c, gx, gy, 7, 1, '#ff7a2a'); p(c, gx + 6, gy + 1, 6, 1, '#ff7a2a'); p(c, gx + 2, gy, 3, 1, hot ? '#ffd23f' : '#ff7a2a');
        } else if (k === 9) { p(c, gx, gy - 3, 8, 4, '#4a3026'); p(c, gx, gy - 3, 7, 1, '#a07a62'); p(c, gx + 1, gy + 1, 8, 1, 'rgba(0,0,0,0.3)'); } else if (k === 10) { p(c, gx, gy - 2, 1, 3, '#c09a58'); p(c, gx + 2, gy - 3, 1, 4, '#c09a58'); p(c, gx + 3, gy - 1, 1, 2, '#a07a40'); } else { p(c, gx, gy, 5, 1, '#d8cfb8'); p(c, gx - 1, gy - 1, 1, 3, '#d8cfb8'); p(c, gx + 5, gy - 1, 1, 3, '#d8cfb8'); }
      }
    }
    // mép trên của dải đất
    p(c, 0, Y - 2, W, 2, 'rgba(0,0,0,0.45)');
    p(c, 0, Y, W, 2, K.edge);
    p(c, 0, Y + 2, W, 1, K.edge2);
    const off = ((cam % 24) + 24) % 24;
    for (let sx = -off; sx < W; sx += 24) {
      const j = Math.round((sx + cam) / 24);
      if (reg === 0) { p(c, sx + 3, Y - 2, 1, 2, K.edge); p(c, sx + 5, Y - 3 - (j % 2), 1, 3 + (j % 2), '#7fb04a'); p(c, sx + 11, Y - 1, 1, 1, K.edge); } else if (reg === 1) { p(c, sx + 2 + (j % 3) * 3, Y - 1, 4, 1, K.edge); p(c, sx + 9, Y + 2, 5, 1, '#3d4c5e'); } else { p(c, sx + 1 + (j % 3) * 4, Y - 1, 5, 1, K.edge); p(c, sx + 2 + (j % 3) * 4, Y - 2, 2, 1, K.edge); }
    }
  }
  A.bg = function (c, reg, seed, cam, width, shrink) {
    const R = G.REGIONS[reg];
    const W = G.W, H = G.H, Y = G.GY0;
    cam = Math.round(cam);
    p(c, 0, 0, W, 50, R.sky[0]);
    p(c, 0, 50, W, 42, R.sky[1]);
    p(c, 0, 92, W, Y - 92, R.sky[2]);
    if (reg === 0) bgForest(c, R, seed, cam, width);
    else if (reg === 1) bgCave(c, R, seed, cam, width);
    else bgRock(c, R, seed, cam, width);
    bgGround(c, reg, R, seed, cam, width);
    p(c, 0, G.GY1 + 8, W, H - G.GY1 - 8, 'rgba(0,0,0,0.25)');
    if (shrink) {
      // nước dâng ở ải Ngư Tinh
      const wc = 'rgba(50,130,185,0.6)', foam = 'rgba(220,245,255,0.75)', f = Math.floor(G.time * 3) % 2;
      p(c, 0, Y, W, shrink.y0 - Y, wc);
      p(c, 0, shrink.y1, W, H - shrink.y1, wc);
      const o = ((cam % 24) + 24) % 24;
      for (let sx = -o; sx < W; sx += 24) {
        p(c, sx + f * 3, shrink.y0 - 1, 14, 1, foam);
        p(c, sx + 10 - f * 3, shrink.y1, 14, 1, foam);
        p(c, sx + 6 + f * 2, shrink.y0 - 7, 6, 1, 'rgba(220,245,255,0.3)');
        p(c, sx + 2 - f * 2, shrink.y1 + 6, 6, 1, 'rgba(220,245,255,0.3)');
      }
      if (shrink.x0 > 0) {
        p(c, -cam, shrink.y0, shrink.x0, shrink.y1 - shrink.y0, wc);
        for (let yy = shrink.y0 + 2; yy < shrink.y1; yy += 8) p(c, shrink.x0 - cam - 1, yy + f * 2, 1, 5, foam);
      }
    }
  };

  // ---------- đồ vật ----------
  A.prop = function (c, o) {
    const x = Math.round(o.x), y = Math.round(o.y);
    const t = G.time;
    if (o.type !== 'door') A.ellipse(c, x, y, o.type === 'merchant' ? 15 : 11, 3, 'rgba(0,0,0,0.3)');
    if (o.type === 'chest') {
      p(c, x - 10, y - 11, 20, 11, DARK);
      p(c, x - 9, y - 10, 18, 9, '#8a5a2a');
      p(c, x - 9, y - 3, 18, 2, '#5e3b1c');
      p(c, x - 7, y - 10, 2, 9, '#55504a'); p(c, x + 5, y - 10, 2, 9, '#55504a');
      if (o.used) {
        p(c, x - 10, y - 20, 20, 10, DARK);
        p(c, x - 9, y - 19, 18, 8, '#5e3b1c');
        p(c, x - 9, y - 19, 18, 1, '#8a5a2a');
        p(c, x - 7, y - 19, 2, 8, '#3a3632'); p(c, x + 5, y - 19, 2, 8, '#3a3632');
        p(c, x - 8, y - 11, 16, 2, '#1a100a');
      } else {
        p(c, x - 10, y - 16, 20, 6, DARK);
        p(c, x - 9, y - 15, 18, 5, '#a8702f');
        p(c, x - 8, y - 15, 16, 1, '#d09a48');
        p(c, x - 7, y - 15, 2, 5, '#77706a'); p(c, x + 5, y - 15, 2, 5, '#77706a');
        p(c, x - 2, y - 12, 4, 5, '#ffd23f'); p(c, x - 1, y - 10, 2, 2, '#5e3b1c');
        if (Math.floor(t * 3) % 2) { p(c, x + 6, y - 21, 1, 5, '#fff3b0'); p(c, x + 4, y - 19, 5, 1, '#fff3b0'); } else { p(c, x - 7, y - 20, 1, 3, '#fff3b0'); p(c, x - 8, y - 19, 3, 1, '#fff3b0'); }
      }
    } else if (o.type === 'fountain') {
      const hp = o.kind === 'hp';
      const col = hp ? '#e8483a' : '#3a8ef0', colL = hp ? '#ffa89a' : '#a8d4ff', colD = hp ? '#a8281e' : '#1e5ab8';
      p(c, x - 8, y - 4, 16, 4, DARK);
      p(c, x - 13, y - 10, 26, 7, DARK);
      p(c, x - 7, y - 3, 14, 3, '#6f727a');
      p(c, x - 12, y - 8, 24, 5, '#8d8f96');
      p(c, x - 12, y - 4, 24, 1, '#5a5d66');
      p(c, x - 12, y - 9, 24, 2, '#c0c2c8');
      p(c, x - 3, y - 18, 6, 9, DARK);
      p(c, x - 2, y - 17, 4, 8, '#8d8f96'); p(c, x - 2, y - 17, 1, 8, '#c0c2c8');
      if (!o.used) {
        const f = Math.floor(t * 6) % 2;
        p(c, x - 11, y - 9, 22, 2, col);
        p(c, x - 9 + f * 2, y - 9, 4, 1, colL); p(c, x + 4 - f * 2, y - 8, 4, 1, colL);
        p(c, x - 2, y - 20 - f, 4, 3, col); p(c, x - 1, y - 21 - f, 2, 1, colL);
        p(c, x - 5, y - 17 + f, 2, 8, col); p(c, x + 3, y - 17 + (1 - f), 2, 8, col);
        p(c, x - 5, y - 17 + f, 1, 3, colL); p(c, x + 4, y - 17 + (1 - f), 1, 3, colL);
        // biểu tượng: chữ thập là máu, giọt là mana
        const iy = y - 31 + Math.round(Math.sin(t * 3) * 1.5);
        if (hp) { p(c, x - 2, iy - 1, 5, 7, DARK); p(c, x - 4, iy + 1, 9, 3, DARK); p(c, x - 1, iy, 3, 5, col); p(c, x - 3, iy + 1, 7, 3, col); p(c, x - 1, iy, 1, 2, colL); } else { p(c, x - 3, iy + 1, 7, 5, DARK); p(c, x - 2, iy - 1, 5, 3, DARK); p(c, x - 1, iy - 2, 3, 2, DARK); p(c, x - 2, iy + 2, 5, 3, col); p(c, x - 1, iy, 3, 2, col); p(c, x, iy - 1, 1, 1, col); p(c, x - 1, iy + 2, 1, 2, colL); }
      } else p(c, x - 11, y - 9, 22, 2, colD === '#a8281e' ? '#4a3432' : '#323a4a');
    } else if (o.type === 'stash') {
      // rương đồ: thùng gỗ có cán vũ khí thò ra
      p(c, x + 2, y - 22, 1, 10, '#8a6a44'); p(c, x + 1, y - 24, 3, 3, '#b9c0c9');
      p(c, x - 5, y - 20, 2, 8, '#5a4030'); p(c, x - 7, y - 20, 6, 1, '#caa15a');
      p(c, x - 10, y - 14, 20, 14, DARK);
      p(c, x - 9, y - 13, 18, 12, '#6a543e');
      p(c, x - 9, y - 13, 18, 2, '#8a7458');
      p(c, x - 9, y - 9, 18, 1, '#3a2c20'); p(c, x - 9, y - 5, 18, 1, '#3a2c20');
      p(c, x - 9, y - 13, 2, 12, '#4a3a2a'); p(c, x + 7, y - 13, 2, 12, '#4a3a2a');
      p(c, x - 2, y - 8, 4, 3, '#caa15a'); p(c, x - 1, y - 7, 2, 1, '#3a2c20');
    } else if (o.type === 'altar') {
      p(c, x - 11, y - 5, 22, 5, DARK);
      p(c, x - 9, y - 13, 18, 9, DARK);
      p(c, x - 10, y - 4, 20, 4, '#4a3a4a');
      p(c, x - 10, y - 4, 20, 1, '#6a586a');
      p(c, x - 8, y - 12, 16, 8, '#5a465a');
      p(c, x - 8, y - 12, 16, 2, '#8a6a8a');
      p(c, x - 4, y - 10, 8, 6, '#7a2a8a'); p(c, x - 1, y - 9, 2, 3, '#f0c0ff');
      p(c, x - 8, y - 16, 2, 4, '#e8e2d0'); p(c, x + 6, y - 16, 2, 4, '#e8e2d0');
      if (!o.used) {
        const f = Math.floor(t * 5) % 2;
        p(c, x - 8, y - 18 - f, 2, 2, '#ffd23f'); p(c, x + 6, y - 18 - (1 - f), 2, 2, '#ffd23f');
        p(c, x - 3, y - 15, 6, 3, '#3a2a3a');
        p(c, x - 2, y - 20 - f, 4, 5, '#c05af0'); p(c, x - 1, y - 23 - f, 2, 4, '#c05af0'); p(c, x - 1, y - 19 - f, 2, 3, '#f0c0ff');
        p(c, x - 5 + f * 9, y - 26, 1, 1, '#f0c0ff');
      } else p(c, x - 3, y - 15, 6, 3, '#3a2a3a');
    } else if (o.type === 'merchant') {
      // sạp hàng mái sọc, ông lái buôn đội nón
      p(c, x - 13, y - 30, 2, 30, '#5a4030'); p(c, x + 11, y - 30, 2, 30, '#5a4030');
      p(c, x - 4, y - 25, 9, 8, DARK);
      p(c, x - 3, y - 24, 7, 7, '#e0b08a');
      p(c, x - 2, y - 21, 1, 1, BLK); p(c, x + 2, y - 21, 1, 1, BLK); p(c, x - 1, y - 19, 3, 1, '#8a4a3a');
      p(c, x - 7, y - 26, 15, 1, '#b08a45'); p(c, x - 5, y - 27, 11, 1, '#e8cc80'); p(c, x - 3, y - 28, 7, 1, '#e8cc80'); p(c, x - 1, y - 29, 3, 1, '#e8cc80');
      p(c, x - 5, y - 17, 11, 7, '#6a4a8a'); p(c, x - 1, y - 17, 3, 7, '#8a6aaa');
      p(c, x - 15, y - 35, 30, 6, DARK);
      for (let i = 0; i < 7; i++) p(c, x - 14 + i * 4, y - 34, 4, 4 + (i % 2), i % 2 ? '#f0e6d0' : '#c8372d');
      p(c, x - 14, y - 34, 28, 1, '#e86a5a');
      p(c, x - 14, y - 12, 28, 12, DARK);
      p(c, x - 13, y - 11, 26, 3, '#a8702f'); p(c, x - 13, y - 11, 26, 1, '#d09a48');
      p(c, x - 13, y - 8, 26, 8, '#6b4a30'); p(c, x - 13, y - 5, 26, 1, '#4a3020');
      p(c, x - 10, y - 14, 3, 3, '#e8483a'); p(c, x - 5, y - 14, 3, 3, '#3a8ef0'); p(c, x + 1, y - 13, 4, 2, '#ffd23f'); p(c, x + 7, y - 15, 2, 4, '#8fe04a');
      p(c, x + 12, y - 28, 1, 4, '#3a2c20'); p(c, x + 11, y - 24, 3, 4, Math.floor(t * 4) % 2 ? '#ffd23f' : '#ffb030');
    } else if (o.type === 'brazier') {
      p(c, x - 5, y - 5, 1, 5, '#3a3632'); p(c, x + 4, y - 5, 1, 5, '#3a3632'); p(c, x - 1, y - 5, 2, 5, '#3a3632');
      p(c, x - 8, y - 10, 16, 6, DARK);
      p(c, x - 6, y - 8, 12, 3, '#55504a');
      p(c, x - 7, y - 9, 14, 2, '#8a827a');
      if (!o.used) {
        const f = Math.floor(t * 10) % 3;
        p(c, x - 7, y - 21, 14, 12, 'rgba(255,122,42,0.14)');
        p(c, x - 5, y - 13, 10, 4, '#ff7a2a');
        p(c, x - 4 + f, y - 17, 4, 5, '#ff7a2a'); p(c, x + f - 1, y - 20 - f, 3, 5, '#ff7a2a');
        p(c, x - 3, y - 12, 6, 3, '#ffd23f'); p(c, x - 1, y - 16 - f, 2, 5, '#ffd23f');
        p(c, x - 4 + f * 3, y - 24 - f, 1, 1, '#ffd23f');
      } else { p(c, x - 5, y - 10, 10, 1, '#2a2422'); p(c, x - 2, y - 10, 2, 1, '#a8320a'); }
    } else if (o.type === 'mushroom') {
      if (!o.used) {
        const f = Math.floor(t * 4) % 3;
        p(c, x - 3, y - 8, 6, 8, DARK);
        p(c, x - 9, y - 16, 18, 9, DARK);
        p(c, x - 2, y - 7, 4, 7, '#e8e2d0'); p(c, x - 2, y - 7, 1, 7, '#b8b0a0');
        p(c, x - 8, y - 12, 16, 4, '#5cb82e'); p(c, x - 6, y - 15, 12, 3, '#6fcf3a'); p(c, x - 3, y - 16, 6, 1, '#6fcf3a');
        p(c, x - 8, y - 9, 16, 1, '#2f6b1a');
        p(c, x - 5, y - 13, 3, 2, '#e9ffd0'); p(c, x + 2, y - 14, 2, 2, '#e9ffd0'); p(c, x + 5, y - 11, 2, 1, '#e9ffd0'); p(c, x - 1, y - 11, 2, 1, '#e9ffd0');
        p(c, x - 9 + f * 2, y - 20 - f, 1, 1, '#c2f58a'); p(c, x + 7 - f, y - 19 - f * 2, 1, 1, '#c2f58a');
      } else { p(c, x - 2, y - 4, 4, 4, '#b8b0a0'); p(c, x - 5, y - 1, 3, 1, '#2f6b1a'); p(c, x + 3, y - 2, 3, 1, '#2f6b1a'); }
    } else if (o.type === 'crystal') {
      if (!o.used) {
        p(c, x - 8, y - 10, 6, 10, DARK); p(c, x - 4, y - 19, 8, 19, DARK); p(c, x + 2, y - 13, 7, 13, DARK);
        p(c, x - 7, y - 8, 4, 8, '#5ab4e8'); p(c, x - 6, y - 9, 2, 1, '#5ab4e8');
        p(c, x + 3, y - 11, 5, 11, '#4a9ed8'); p(c, x + 4, y - 12, 3, 1, '#4a9ed8');
        p(c, x - 3, y - 16, 6, 16, '#7fd4ff'); p(c, x - 2, y - 18, 4, 2, '#7fd4ff');
        p(c, x - 3, y - 16, 2, 14, '#e9f9ff'); p(c, x - 7, y - 8, 1, 6, '#bfeaff'); p(c, x + 1, y - 14, 2, 14, '#5ab4e8');
        if (Math.floor(t * 3) % 2) { p(c, x + 5, y - 17, 1, 3, WHT); p(c, x + 4, y - 16, 3, 1, WHT); }
      } else { p(c, x - 5, y - 3, 3, 3, '#5ab4e8'); p(c, x + 1, y - 4, 4, 4, '#7fd4ff'); p(c, x - 1, y - 2, 2, 2, '#e9f9ff'); p(c, x + 6, y - 1, 2, 1, '#5ab4e8'); }
    } else if (o.type === 'trap') {
      const ec = o.el ? G.EL[o.el].col : '#e8e2d0';
      p(c, x - 8, y - 3, 16, 4, DARK);
      p(c, x - 7, y - 2, 14, 2, '#8d8f96'); p(c, x - 7, y - 2, 14, 1, '#c9ccd2');
      for (let i = 0; i < 4; i++) { p(c, x - 7 + i * 4, y - 6, 3, 4, DARK); p(c, x - 6 + i * 4, y - 5, 1, 3, '#e8eef5'); }
      p(c, x - 1, y - 3, 3, 3, ec);
      if (Math.floor(t * 4) % 2) p(c, x, y - 8, 1, 2, ec);
    } else if (o.type === 'door') {
      const dc = o.col || '#3a2c20';
      const hexOk = /^#[0-9a-f]{6}$/i.test(dc);
      const dl = hexOk ? lite(dc, 0.3) : dc, dd = hexOk ? dim(dc, 0.35) : dc;
      p(c, x - 17, y - 52, 34, 52, DARK);
      p(c, x - 16, y - 51, 32, 51, '#7a5a3a');
      p(c, x - 16, y - 51, 32, 5, '#a8804a'); p(c, x - 16, y - 51, 32, 1, '#d0a868');
      p(c, x - 16, y - 46, 3, 46, '#8a6a44'); p(c, x + 13, y - 46, 3, 46, '#5e4630');
      p(c, x - 19, y - 54, 38, 3, DARK); p(c, x - 18, y - 53, 36, 1, '#d0a868');
      p(c, x - 12, y - 45, 24, 45, '#1a1210');
      p(c, x - 11, y - 44, 22, 44, dc);
      p(c, x - 11, y - 44, 22, 1, dl); p(c, x - 11, y - 44, 1, 44, dl);
      p(c, x, y - 44, 1, 44, dd); p(c, x - 11, y - 24, 22, 1, dd);
      p(c, x - 8, y - 40, 5, 12, dd); p(c, x + 4, y - 40, 5, 12, dd); p(c, x - 8, y - 20, 5, 14, dd); p(c, x + 4, y - 20, 5, 14, dd);
      p(c, x - 3, y - 24, 2, 3, '#ffd23f'); p(c, x + 2, y - 24, 2, 3, '#ffd23f');
      p(c, x - 2, y - 50, 4, 3, dl);
      p(c, x - 14, y, 28, 2, '#5e4630'); p(c, x - 14, y, 28, 1, '#a8804a');
    }
  };

  // Vùng nguy hiểm và vũng trên mặt đất
  A.zone = function (c, z) {
    const tele = z.t > 0;
    const blink = Math.floor(G.time * 10) % 2;
    const pulse = 0.3 + 0.16 * Math.abs(Math.sin(G.time * 14));
    if (z.pool) {
      const hex = z.team === 'player' ? (z.el ? G.EL[z.el].col : '#6fcf3a') : z.el ? G.EL[z.el].col : '#d03c28';
      if (z.shape === 'circle') {
        A.ellipse(c, z.x, z.y, z.r, z.r * 0.6, hexA(hex, 0.34));
        ring(c, z.x, z.y, z.r, z.r * 0.6, hexA(hex, z.team === 'player' ? 0.7 : 0.95));
        const f = Math.floor(G.time * 5) % 3;
        p(c, Math.round(z.x - z.r * 0.4) + f, Math.round(z.y - 3 - f), 2, 2, hexA(hex, 0.8));
        p(c, Math.round(z.x + z.r * 0.3) - f, Math.round(z.y + 2 - f), 2, 2, hexA(hex, 0.8));
        p(c, Math.round(z.x), Math.round(z.y - z.r * 0.3 + f), 1, 1, '#ffffff');
      } else p(c, Math.round(z.x), Math.round(z.y), Math.round(z.w), Math.round(z.h), hexA(hex, 0.4));
      return;
    }
    if (z.shape === 'circle') {
      if (tele) {
        A.ellipse(c, z.x, z.y, z.r, z.r * 0.6, 'rgba(255,40,24,' + pulse + ')');
        if (z.t0) { const k = 1 - z.t / z.t0; A.ellipse(c, z.x, z.y, z.r * k, z.r * 0.6 * k, 'rgba(255,90,50,0.45)'); }
        ring(c, z.x, z.y, z.r, z.r * 0.6, blink ? '#ff3a22' : '#ffb09a');
        ring(c, z.x, z.y, z.r + 2, z.r * 0.6 + 1.5, 'rgba(120,0,0,0.6)');
      } else {
        A.ellipse(c, z.x, z.y, z.r, z.r * 0.6, 'rgba(255,244,210,0.85)');
        ring(c, z.x, z.y, z.r, z.r * 0.6, '#ffffff');
      }
    } else {
      const x = Math.round(z.x), y = Math.round(z.y), w = Math.round(z.w), h = Math.round(z.h);
      if (tele) {
        p(c, x, y, w, h, 'rgba(255,40,24,' + pulse + ')');
        if (z.t0) { const k = 1 - z.t / z.t0, hh = Math.round(h * k); p(c, x, y + ((h - hh) >> 1), w, hh, 'rgba(255,90,50,0.35)'); }
        const bc = blink ? '#ff3a22' : '#ffb09a';
        p(c, x, y, w, 2, bc); p(c, x, y + h - 2, w, 2, bc); p(c, x, y, 2, h, bc); p(c, x + w - 2, y, 2, h, bc);
        p(c, x, y - 1, w, 1, 'rgba(120,0,0,0.6)'); p(c, x, y + h, w, 1, 'rgba(120,0,0,0.6)');
      } else {
        p(c, x, y, w, h, 'rgba(255,244,210,0.85)');
        p(c, x, y, w, 1, '#ffffff'); p(c, x, y + h - 1, w, 1, '#ffffff');
      }
    }
  };
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  A.hexA = hexA;

  A.proj = function (c, o) {
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10));
    const f = Math.floor(G.time * 12) % 2;
    p(c, x - 3, Math.round(o.y), 6, 1, 'rgba(0,0,0,0.3)');
    if (o.kind === 'arrow') {
      const k = o.vx < 0 ? -1 : 1, col = o.col || '#c9ccd2';
      const r = (a, b, w, h, cc) => p(c, k > 0 ? x + a : x - a - w, y + b, w, h, cc);
      if (o.big) { r(-14, -1, 10, 3, hexA(o.col || '#ffffff', 0.45)); r(-20, 0, 8, 1, hexA(o.col || '#ffffff', 0.3)); }
      r(-6, -1, 11, 3, DARK);
      r(-5, 0, 9, 1, '#e8e2d0');
      r(-6, -1, 2, 3, '#c8372d');
      r(3, -1, 2, 3, col); r(5, 0, 1, 1, col);
      r(-11, 0, 4, 1, 'rgba(255,255,255,0.35)');
    } else if (o.kind === 'fruit') {
      const col = o.col || '#e0c040';
      p(c, x - 3, y - 3, 6, 6, DARK); p(c, x - 2, y - 4, 4, 8, DARK); p(c, x - 4, y - 2, 8, 4, DARK);
      p(c, x - 2, y - 3, 4, 6, col); p(c, x - 3, y - 2, 6, 4, col);
      p(c, x - 2, y - 2, 2, 2, '#ffffff');
      p(c, x, y - 5, 1, 2, '#3f7a32');
    } else if (o.kind === 'fire') {
      const k = o.vx < 0 ? 1 : -1;
      p(c, x - 4, y - 4, 8, 8, '#a8320a'); p(c, x - 3, y - 5, 6, 10, '#a8320a'); p(c, x - 5, y - 3, 10, 6, '#a8320a');
      p(c, x - 3, y - 4, 6, 8, '#ff7a2a'); p(c, x - 4, y - 3, 8, 6, '#ff7a2a');
      p(c, x - 2, y - 2, 4, 4, '#ffd23f'); p(c, x - 1, y - 1, 2, 2, '#fff3b0');
      p(c, x + k * 5 - 1, y - 2 + f, 3, 3, '#ff7a2a'); p(c, x + k * 8, y - 1 - f, 2, 2, '#a8320a');
    } else {
      const col = o.col || '#7fd4ff';
      p(c, x - 3, y - 3, 7, 7, DARK);
      p(c, x - 2, y - 2, 5, 5, col);
      p(c, x - 1, y - 1, 2, 2, '#ffffff');
      p(c, x - 3 + f * 6, y + 3, 1, 1, col);
    }
  };

  // Vệt chém hình cung: đuôi mảnh, đầu dày và sáng
  A.slash = function (c, s) {
    const k = 1 - s.t / s.t0;
    const a0 = -1.9 + k * 1.2, a1 = a0 + 1.6;
    const cy = s.y - 14;
    for (let a = a0; a < a1; a += 0.08) {
      const u = (a - a0) / (a1 - a0);
      const sz = u < 0.3 ? 1 : u < 0.6 ? 2 : s.wide ? 4 : 3;
      const rx = Math.cos(a) * s.r * s.face, ry = Math.sin(a) * s.r * 0.55;
      c.fillStyle = s.col;
      c.fillRect(Math.round(s.x + rx) - (sz >> 1), Math.round(cy + ry) - (sz >> 1), sz, sz);
      if (s.wide && u > 0.3) c.fillRect(Math.round(s.x + rx * 0.82), Math.round(cy + ry * 0.82), 2, 2);
      if (u > 0.55) {
        c.fillStyle = '#ffffff';
        c.fillRect(Math.round(s.x + rx * 0.94), Math.round(cy + ry * 0.94), sz > 2 ? 2 : 1, sz > 2 ? 2 : 1);
      }
    }
  };
})();
