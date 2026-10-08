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
  let QX = 0, QY = 0; // độ dời của nhóm ô đang vẽ (để nhún, ngả, vươn từng phần thân)
  const q = (x, y, w, h, col) => {
    x += QX; y += QY;
    if (OUT) { cx.fillStyle = OC; cx.fillRect(x - 1, y - 1, w + 2, h + 2); } else { cx.fillStyle = col; cx.fillRect(x, y, w, h); }
  };
  // Chi tiết bên trong, không có viền.
  const d = (x, y, w, h, col) => { if (!OUT) { cx.fillStyle = col; cx.fillRect(x + QX, y + QY, w, h); } };
  // Đoạn thẳng dày, ít ô vuông.
  function seg(x0, y0, x1, y1, t, col) {
    const o = OUT ? 1 : 0, h = t >> 1;
    x0 += QX; x1 += QX; y0 += QY; y1 += QY;
    cx.fillStyle = OUT ? OC : col;
    const dx = x1 - x0, dy = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(1, t - 1)));
    for (let i = 0; i <= n; i++) cx.fillRect(Math.round(x0 + (dx * i) / n) - h - o, Math.round(y0 + (dy * i) / n) - h - o, t + 2 * o, t + 2 * o);
  }
  // Elip thô, mỗi hàng cao 2 điểm.
  function qe(x, y, rx, ry, col) {
    if (OUT) { rx += 1; ry += 1; col = OC; }
    x += QX; y += QY;
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

  // ---------- khung tạm và hình nướng sẵn ----------
  // Sinh vật được vẽ bằng ô vuông vào một khung nhỏ (nướng sẵn nếu tư thế rời rạc), rồi dán ra màn hình.
  // Nhờ vậy co giãn, nghiêng, đổ, tan rã đều giữ được điểm ảnh sắc cạnh.
  function mk(w, h) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d', { willReadFrequently: true }); // khung nhỏ, giữ ở bộ nhớ thường cho nhẹ
    g.imageSmoothingEnabled = false;
    return g;
  }
  const SCR = {};
  function scr(slot, w, h) {
    const key = slot + ':' + w + 'x' + h;
    let g = SCR[key];
    if (!g) g = SCR[key] = mk(w, h);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, w, h);
    return g;
  }
  // Vẽ fn hai lượt (viền rồi màu) vào g, gốc toạ độ đặt ở (ax, ay).
  function bake(g, ax, ay, fn) {
    const pc = cx, po = OUT, pq = QX, pr = QY;
    g.setTransform(1, 0, 0, 1, ax, ay);
    cx = g; QX = 0; QY = 0;
    OUT = true; fn(); QX = 0; QY = 0;
    OUT = false; fn();
    cx = pc; OUT = po; QX = pq; QY = pr;
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  // Bản phủ màu của một hình (mode 'source-atop' là nhuộm, 'source-in' là bóng đặc).
  function tinted(slot, src, col, alpha, mode) {
    const g = scr(slot, src.width, src.height);
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = mode || 'source-atop';
    g.globalAlpha = alpha;
    g.fillStyle = col;
    g.fillRect(0, 0, src.width, src.height);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    return g.canvas;
  }
  // Mặt nạ nhiễu để hình tan dần theo điểm ảnh.
  const NOISE = [];
  function noise(level) {
    let cv = NOISE[level];
    if (cv) return cv;
    const g = mk(64, 64);
    g.fillStyle = '#000';
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const h = ((x * 73856093) ^ (y * 19349663) ^ ((x * y + 7) * 83492791)) >>> 0;
      if ((h % 100) < level * 20) g.fillRect(x, y, 1, 1);
    }
    return (NOISE[level] = g.canvas);
  }
  // Xoá bớt điểm ảnh của khung g theo mức 0..5 (5 là xoá hết).
  function dissolve(g, level) {
    if (level <= 0) return;
    g.globalCompositeOperation = 'destination-out';
    const w = g.canvas.width, h = g.canvas.height, n = noise(Math.min(5, level));
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) g.drawImage(n, x, y);
    g.globalCompositeOperation = 'source-over';
  }
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeOut = (v) => 1 - (1 - v) * (1 - v);
  const easeIn = (v) => v * v;
  const smooth = (v) => v * v * (3 - 2 * v);
  const lerp = (a, b, k) => a + (b - a) * k;
  // Số giả ngẫu nhiên cố định theo chỉ số, dùng cho mảnh vụn và hạt (không đụng G.rnd).
  const hsh = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------- quái ----------
  const BLK = '#1a1210', WHT = '#ffffff';
  const EYE = ['#ffe14a', '#ffe14a', '#ffb030'];
  const SWC = 'rgba(255,255,255,0.8)', SWD = 'rgba(255,255,255,0.4)';
  const MOUTH = '#7a1010';
  // Màu thân riêng cho vài loài để mỗi vùng bớt một màu.
  const ALT = [
    { rusher: '#8a5a34', archer: '#a8703a', nimble: '#8c8c84' },
    { archer: '#a860a8', shield: '#5a9a7a', nimble: '#38a890' },
    { shield: '#807a78', archer: '#6a3a6a', nimble: '#e8a848', swarm: '#6a4a6a' },
  ];
  const WX = [2, 0, -2, 0], TW = [0, 1, 0, -1], W1 = [1, 0, -1, 0];
  // Vệt vung hình cung quanh (x, y); góc tính bằng radian, 0 là phía trước, âm là hướng lên.
  function swoosh(x, y, r, a0, a1, col, ry) {
    const n = Math.max(3, Math.round((Math.abs(a1 - a0) * r) / 2.5));
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n, s = i > n * 0.55 ? 2 : 1;
      d(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * (ry || r)), s, s, col || SWC);
    }
  }
  // Tư thế chung của loài đi hai chân: fo là độ vung chân, by là nhún thân, ln là ngả người.
  function base(a) {
    const w = a.w;
    return {
      fo: w < 0 ? 0 : WX[w],
      by: w === 1 || w === 3 ? -1 : w < 0 && !a.an && !a.sk && a.br ? -1 : 0,
      ln: a.an ? (a.an > 1 ? -2 : -1) : a.sk === 1 ? 3 : a.sk === 2 ? 2 : a.sk === 3 ? 1 : 0,
    };
  }
  const rest = (a) => a.w < 0 && !a.an && !a.sk && !a.lg;

  // ===== Rừng già: yêu gỗ, nấm con, bọ giáp, khỉ ném quả, sói rừng, chúa rừng =====
  function fHuman(a, el, m, k, l, eye) {
    const B = base(a), fo = B.fo, by = B.by, ln = B.ln, w = a.w, an = a.an, sk = a.sk, tw = TW[a.tl];
    q(-4 - fo - (an ? 1 : 0), -5, 3, w === 1 ? 3 : 5, k);
    q(1 + fo + (sk ? 2 : 0), -5, 3, w === 3 ? 3 : 5, k);
    QX = ln; QY = by;
    q(-7 - (fo >> 1), -15, 2, 6, k);
    q(el ? -6 : -5, -16, el ? 12 : 10, 11 - by, m);
    d(-5, -6 - by, 10, 1, k);
    d(-3, -14, 1, 6, k); d(0, -12, 1, 5, k);
    if (el) {
      // bướu rêu trên vai, lõi sáng giữa ngực
      q(-8, -18, 4, 4, k); q(5, -18, 4, 4, k);
      d(-7, -18, 2, 1, l); d(6, -18, 2, 1, l);
      d(-2, -12, 3, 3, eye);
      if (a.br || an) d(-1, -11, 1, 1, WHT);
    }
    QX = ln + (an ? -1 : sk === 1 ? 1 : 0); QY = by + (an === 3 ? -1 : sk === 1 ? 1 : 0);
    q(-4, -22, 9, 7, m);
    d(-4, -22, 9, 1, l);
    if (a.bl) { d(1, -19, 2, 1, k); d(4, -19, 1, 1, k); } else { d(1, -20, 2, 2, eye); d(4, -20, 1, 2, eye); }
    if (an || sk === 1 || sk === 2) { d(1, -17, 4, 2, BLK); d(1, -17, 1, 1, WHT); d(4, -17, 1, 1, WHT); } else d(1, -17, 4, 1, BLK);
    if (el) {
      q(-5, -26, 2, 4, l); q(-7, -28, 2, 3, l); q(-4, -29, 1, 3, l);
      q(3, -26, 2, 4, l); q(5, -28, 2, 3, l); q(3, -29, 1, 3, l);
    } else {
      q(-1, -25, 2, 3, l);
      q(1 + tw, -26, 3, 2, l);
    }
    QX = ln; QY = by;
    // tay cầm chùy: [tay x, y, đầu chùy x, y]
    const C = an === 1 ? [6, -18, 6, -27] : an === 2 ? [4, -21, -1, -29] : an === 3 ? [3, -22, -6, -27]
      : sk === 1 ? [10, -13, 17, -8] : sk === 2 ? [9, -10, 15, -3] : sk === 3 ? [8, -12, 13, -11]
        : [6 + (fo >> 1), -13, 9 + (fo >> 1), -20 - (w === 1 || w === 3 ? 1 : 0)];
    seg(4, -14, C[0], C[1], 2, k);
    seg(C[0], C[1], C[2], C[3], 2, k);
    q(C[2] - 2, C[3] - 2, 5, 5, l);
    d(C[2] - 2, C[3] - 2, 5, 1, WHT);
    if (sk === 1) swoosh(3, -13, 18, -1.9, 0.25);
    if (sk === 2) { swoosh(3, -13, 17, -0.5, 0.7, SWD); d(12, -1, 2, 1, SWC); d(18, -2, 2, 1, SWC); }
    QX = QY = 0;
  }
  function fSwarm(a, m, k, l) {
    const w = a.w, an = a.an, sk = a.sk;
    const hop = w < 0 ? 0 : [0, -2, -3, -1][w]; // nhảy lóc cóc
    const sh = an ? 5 - Math.min(2, an) : sk === 1 ? 6 : w === 0 ? 4 : w === 1 ? 6 : rest(a) && a.br ? 6 : 5;
    const wide = an >= 2 || w === 0 || sk === 3 ? 1 : 0;
    QX = sk === 1 ? 4 : sk === 2 ? 3 : sk === 3 ? 1 : an ? -1 : 0; QY = hop;
    q(-2, -sh, 4, sh, l);
    if (w === 2) { d(-3, 0, 2, 1, k); d(1, 0, 2, 1, k); } else if (w === 1 || w === 3) { d(-3, -1, 2, 1, k); d(1, -1, 2, 1, k); }
    const cxo = sk === 1 ? 2 : sk === 2 ? 1 : an === 3 ? -1 : 0, cy = -sh - 4 + (sk === 1 ? 1 : 0);
    q(-5 - wide + cxo, cy, 10 + wide * 2, 4, m);
    q(-3 + cxo, cy - 1, 6, 1, m);
    d(-5 - wide + cxo, cy + 3, 10 + wide * 2, 1, k);
    d(-3 + cxo, cy, 2, 1, l);
    d(2 + cxo, cy + 1, 2, 1, l);
    const ey = -sh + 1;
    if (a.bl) { d(0, ey + 1, 1, 1, BLK); d(2, ey + 1, 1, 1, BLK); } else { d(0, ey, 1, 2, BLK); d(2, ey, 1, 2, BLK); }
    if (an) d(1, ey + 2, 2, 1, MOUTH);
    if (sk === 1) { d(8, cy + 1, 1, 1, l); d(10, cy - 1, 1, 1, l); d(9, cy + 4, 1, 1, l); d(11, cy + 2, 1, 1, WHT); }
    QX = QY = 0;
  }
  function fShield(a, m, k, l) {
    const w = a.w, an = a.an, sk = a.sk;
    const A1 = w < 0 ? 0 : W1[w];
    const by = an ? 1 : w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : 0;
    const fx = sk === 1 ? 4 : sk === 2 ? 3 : sk === 3 ? 1 : an === 3 ? -2 : an ? -1 : 0;
    q(-6 + A1, -3, 2, w === 1 ? 2 : 3, m);
    q(-1 - A1, -3, 2, w === 3 ? 2 : 3, m);
    q(3 + A1, -3, 2, w === 1 ? 2 : 3, m);
    // đầu và sừng: cúi thấp lấy đà rồi húc lên
    const hy = an ? -8 + an : sk === 1 ? -12 : sk === 2 ? -10 : -8 + (rest(a) && a.tl === 1 ? -1 : 0);
    const hx = an ? 1 - an : sk === 1 ? 3 : sk === 2 ? 2 : 0;
    QX = fx + hx; QY = by;
    q(6, hy, 5, 5, m);
    q(10, hy - 3, 2, 4, l);
    q(11, hy - 5, 2, 3, l);
    d(8, hy + 1, 1, 1, a.bl ? m : BLK);
    QX = fx;
    q(-8, -12, 14, 9, k);
    q(-6, -14, 10, 2, k);
    d(-6, -13, 5, 1, m);
    d(-7, -11, 1, 4, m);
    d(-1, -14, 1, 10, BLK);
    d(-5, -9, 3, 3, m);
    d(1, -9, 3, 3, m);
    if (an) { d(-8 + an * 4, -13, 2, 1, WHT); d(-7 + an * 4, -12, 1, 2, WHT); } // ánh lướt trên mai khi gồng
    if (sk === 1) swoosh(8, -6, 10, 0.3, -1.3);
    if (sk === 2) swoosh(8, -6, 10, -0.6, -1.5, SWD);
    QX = QY = 0;
  }
  function fruit(x, y, col) {
    q(x - 2, y - 2, 4, 4, col);
    d(x - 2, y - 2, 2, 1, '#fff3b0');
    d(x, y - 3, 1, 1, '#4d6b28');
  }
  function fArcher(a, m, k, l) {
    const B = base(a), fo = B.fo, by = B.by, w = a.w, an = a.an, sk = a.sk, tw = TW[a.tl];
    const ln = an >= 2 ? -2 : an ? -1 : sk === 1 ? 2 : sk === 2 ? 1 : 0;
    // đuôi cong ve vẩy
    q(-7, -12, 2, 6, k);
    q(-9 + (tw > 0 ? -1 : 0), -15, 3, 2, k);
    q(-9 + (tw > 0 ? -1 : 0), -17 - (tw < 0 ? 1 : 0), 2, 2, k);
    q(-3 - fo, -6, 2, w === 1 ? 4 : 6, k);
    q(1 + fo, -6, 2, w === 3 ? 4 : 6, k);
    QX = ln; QY = by;
    q(-3, -15, 7, 9 - by, m);
    d(0, -13, 3, 6, l);
    QX = ln + (an ? -1 : sk === 1 ? 1 : 0);
    q(-3, -22, 8, 7, m);
    q(-5, -21, 2, 3, l);
    d(1, -20, 4, 4, l);
    if (a.bl) d(3, -19, 1, 1, BLK); else d(3, -20, 1, 2, BLK);
    if (an || sk === 1) d(3, -17, 2, 2, BLK); else d(2, -17, 3, 1, k);
    QX = ln;
    if (an === 1) { seg(4, -14, 6, -21, 2, m); fruit(6, -25, '#e0c040'); }
    else if (an === 2) { seg(4, -14, 3, -22, 2, m); fruit(1, -26, '#e0c040'); }
    else if (an === 3) { seg(4, -14, 0, -21, 2, m); fruit(-3, -25, '#e0c040'); }
    else if (sk === 1) { seg(4, -15, 11, -18, 2, m); swoosh(3, -15, 12, -2.6, -0.3); }
    else if (sk === 2) { seg(4, -15, 10, -12, 2, m); swoosh(3, -15, 11, -1.2, 0.2, SWD); }
    else if (sk === 3) seg(4, -14, 8, -10, 2, m);
    else q(4 + (fo >> 1), -14, 2, 6, m);
    QX = QY = 0;
  }
  // Thú bốn chân: sói rừng (cat = false) và báo núi (cat = true).
  function quad(a, m, k, l, eye, cat) {
    const w = a.w, an = a.an, lg = a.lg, tw = TW[a.tl];
    const f = lg ? 0 : w;
    const bx = an ? -an : 0;
    const by = lg ? -2 : an ? 1 : f === 0 || f === 2 ? -1 : 0;
    const c1 = k, c2 = cat ? m : k;
    // chân: [x hông, x bàn, y bàn] lần lượt sau-xa, sau-gần, trước-gần, trước-xa
    let L;
    if (an) L = [[-6 + bx, -6, 0], [-4 + bx, -4, 0], [4 + bx, 6, 0], [6 + bx, 8, 0]];
    else if (f === 0) L = [[-6, -11, -2], [-4, -9, -1], [4, 10, -2], [6, 12, -1]];
    else if (f === 1) L = [[-6, -8, -3], [-4, -6, -2], [4, 7, 0], [6, 9, 0]];
    else if (f === 2) L = [[-6, -2, 0], [-4, 0, 0], [4, 3, 0], [6, 5, 0]];
    else if (f === 3) L = [[-6, -8, 0], [-4, -6, 0], [4, 8, -3], [6, 10, -4]];
    else L = [[-6, -6, 0], [-4, -4, 0], [4, 4, 0], [6, 6, 0]];
    const hip = (cat ? -5 : -4) + by;
    for (let i = 0; i < 4; i++) seg(L[i][0], hip, L[i][1], L[i][2] - 1, 2, i === 0 || i === 3 ? c1 : c2);
    QX = bx; QY = by;
    const run = f >= 0 || lg;
    if (cat) {
      q(-11, -10, 3, 2, m);
      if (run) { q(-16, -11 - (f & 1), 6, 2, m); d(-16, -11 - (f & 1), 2, 2, l); }
      else { q(-13, -14 - tw - (an ? 1 : 0), 2, 5 + tw, m); d(-13, -15 - tw - (an ? 1 : 0), 2, 2, l); }
      q(-8, -10, 14, 6, m);
      if (f === 2) q(-5, -11, 8, 1, m);
      d(-6, -9, 2, 1, k); d(-2, -8, 2, 1, k); d(2, -9, 2, 1, k); d(-4, -6, 2, 1, k);
      d(-5, -5, 9, 1, l);
    } else {
      if (run) { q(-14, -9, 7, 3, l); q(-16, -9 + (f & 1), 3, 2, l); }
      else { q(-12, -11 - (an ? 2 : 0), 5, 3, l); q(-13, -12 + tw - (an ? 3 : 0), 2, 2, l); }
      q(-8, -9, 14, 6, m);
      if (f === 2) q(-5, -10, 8, 1, m);
      d(-8, -9, 14, 1, k);
      d(-5, -4, 9, 1, l);
    }
    // đầu: rạp xuống khi rình, vươn ra khi lao
    QX = bx + (lg ? 2 : an ? 1 : 0); QY = by + (an ? 1 : lg ? -1 : f === 1 ? 1 : 0);
    const open = an || lg;
    if (cat) {
      q(5, -13, 6, 6, m);
      if (lg) { q(4, -14, 3, 2, k); } else { q(5, -15, 2, 2 + (rest(a) && a.tl === 2 ? 1 : 0), k); q(9, -15, 2, 2, k); }
      d(9, -10, 2, 2, l);
      if (!a.bl) d(8, -12, 2, 1, eye);
      if (open) { d(9, -8, 2, 2, MOUTH); d(10, -8, 1, 1, WHT); }
    } else {
      q(5, -12, 6, 6, m);
      q(10, -9, 3, 3, m);
      if (lg) { q(4, -13, 3, 2, k); } else { q(6, -15, 2, 3, k); q(9, -15 - (rest(a) && a.tl === 2 ? 1 : 0), 2, 3, k); }
      d(12, -9, 1, 1, BLK);
      if (!a.bl) d(9, -10, 1, 1, '#ff5040');
      if (open) { d(10, -6, 3, 2, MOUTH); d(10, -6, 1, 1, WHT); d(12, -6, 1, 1, WHT); if (an === 3 || lg) d(10, -4, 3, 1, m); }
    }
    QX = QY = 0;
  }

  // ===== Hang biển: ngư nhân, cua con, rùa đá, mực phun, rắn biển, tướng cá =====
  function trident(x0, y0, x1, y1, l) {
    seg(x0, y0, x1, y1, 1, l);
    q(x1, y1 - 2, 1, 5, l);
    q(x1 + 1, y1 - 2, 2, 1, l); q(x1 + 1, y1, 3, 1, l); q(x1 + 1, y1 + 2, 2, 1, l);
  }
  function sHuman(a, el, m, k, l, eye) {
    const B = base(a), fo = B.fo, by = B.by, ln = B.ln, w = a.w, an = a.an, sk = a.sk, tw = TW[a.tl];
    const bx = -fo - (an ? 1 : 0), fx = fo + (sk ? 2 : 0);
    q(-3 + bx, -5, 2, w === 1 ? 3 : 5, k);
    q(1 + fx, -5, 2, w === 3 ? 3 : 5, k);
    if (w !== 1) q(-5 + bx, -1, 4, 1, k);
    if (w !== 3) q(0 + fx, -1, 4, 1, k);
    QX = ln; QY = by;
    q(-7 - (fo >> 1), -14, 3, 6, k);
    q(el ? -5 : -4, -15, el ? 10 : 8, 10 - by, m);
    d(-1, -14, 4, 8, l);
    if (el) {
      // giáp vỏ sò
      q(-8, -17, 4, 4, l); q(5, -17, 4, 4, l);
      d(-8, -15, 4, 1, k); d(5, -15, 4, 1, k);
      d(0, -11, 3, 3, eye);
      if (a.br || an) d(1, -10, 1, 1, WHT);
    }
    QX = ln + (an ? -1 : sk === 1 ? 1 : 0);
    q(-4, -22, 9, 8, m);
    q(-3, -24, 2, 2, k); q(0, -26 - (tw > 0 ? 1 : 0), 2, 4 + (tw > 0 ? 1 : 0), k); q(3, -24 - (tw < 0 ? 1 : 0), 2, 2 + (tw < 0 ? 1 : 0), k);
    if (a.bl) d(2, -19, 3, 1, k); else { d(2, -20, 3, 3, eye); d(4, -19, 1, 1, BLK); }
    if (an || sk === 1) d(2, -16, 4, 2, BLK); else d(2, -16, 4, 1, BLK);
    d(-4, -18, a.br ? 3 : 2, 1, k); d(-4, -16, a.br ? 2 : 3, 1, k); // mang phập phồng
    if (el) { q(-1, -29, 3, 4, l); q(-4, -27, 2, 3, l); q(3, -27, 2, 3, l); } // mào cao
    QX = ln; QY = by;
    // đinh ba: dựng đứng khi đi, kéo ngang ra sau rồi đâm thẳng
    if (an === 1) { q(4, -15, 4, 2, k); trident(0, -11, 12, -17, l); }
    else if (an === 2) { q(2, -15, 4, 2, k); trident(-9, -14, 7, -14, l); }
    else if (an === 3) { q(0, -15, 4, 2, k); trident(-12, -14, 4, -14, l); }
    else if (sk === 1) { q(4, -15, 8, 2, k); trident(2, -14, 19, -14, l); d(7, -17, 8, 1, SWC); d(5, -11, 9, 1, SWC); d(10, -19, 5, 1, SWD); }
    else if (sk === 2) { q(4, -15, 7, 2, k); trident(1, -14, 17, -14, l); d(6, -17, 6, 1, SWD); }
    else if (sk === 3) { q(4, -14, 5, 2, k); trident(1, -12, 13, -16, l); }
    else {
      const u = w === 1 || w === 3 ? -1 : 0;
      q(4, -13 + u, 4, 2, k);
      q(7, -20 + u, 1, 14, l); q(6, -22 + u, 3, 3, l);
      d(5, -22 + u, 1, 2, l); d(9, -22 + u, 1, 2, l);
    }
    QX = QY = 0;
  }
  function sSwarm(a, m, k, l) {
    const w = a.w, an = a.an, sk = a.sk;
    const s = w < 0 ? 0 : W1[w];
    const by = w === 1 || w === 3 ? -1 : an ? -Math.min(2, an) : rest(a) && a.br ? -1 : 0;
    const lh = 2 - by;
    q(-5 - s, -lh, 2, lh, k);
    q(3 + s, -lh, 2, lh, k);
    q(-2 + s, -lh, 1, lh, k);
    q(1 - s, -lh, 1, lh, k);
    QX = sk === 1 ? 3 : sk === 2 ? 2 : an ? -1 : 0; QY = by;
    q(-4, -6, 8, 4, m);
    d(-3, -6, 6, 1, l);
    if (a.bl) { q(-2, -7, 1, 1, k); q(1, -7, 1, 1, k); } else { q(-2, -8, 1, 2, k); q(1, -8, 1, 2, k); d(-2, -9, 1, 1, WHT); d(1, -9, 1, 1, WHT); }
    d(-1, -4, 2, 1, BLK);
    // càng: kẹp luân phiên khi rảnh, giơ cao rồi kẹp tới khi đánh
    if (an) {
      q(-8, -9 - an, 3, 3, k); q(5, -9 - an, 3, 4, k);
      d(6, -9 - an, 1, 2, BLK); d(-7, -9 - an, 1, 2, BLK);
    } else if (sk === 1) {
      q(-6, -7, 3, 3, k); q(5, -8, 5, 3, k);
      d(11, -9, 1, 1, WHT); d(12, -7, 1, 1, WHT); d(11, -5, 1, 1, WHT);
    } else if (sk) {
      q(-7, -7, 3, 3, k); q(5, -8, 4, 3, k);
    } else {
      const c1 = w >= 0 ? w & 1 : a.tl === 1 ? 1 : 0, c2 = w >= 0 ? 1 - (w & 1) : a.tl === 3 ? 1 : 0;
      q(-7, -8 - c1, 3, 3, k);
      q(4, -7 - c2, 3, 3, k);
    }
    QX = QY = 0;
  }
  function sShield(a, m, k, l) {
    const w = a.w, an = a.an, sk = a.sk;
    const A1 = w < 0 ? 0 : W1[w];
    const by = an >= 2 ? 1 : w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : 0;
    q(-6 + A1, -3, 3, w === 1 ? 2 : 3, m);
    q(3 - A1, -3, 3, w === 3 ? 2 : 3, m);
    q(-10, -5 - (a.tl === 1 && rest(a) ? 1 : 0), 2, 2, m);
    // đầu rụt vào mai khi gồng, phóng ra khi đớp
    const hx = an === 1 ? 4 : an === 2 ? 2 : an === 3 ? 1 : sk === 1 ? 13 : sk === 2 ? 11 : sk === 3 ? 8 : 6 + (w === 0 ? 1 : 0);
    QY = by;
    if (hx > 6) q(5, -8, hx - 4, 3, l);
    q(hx, -9, 5, 4, l);
    d(hx + 3, -8, 1, 1, a.bl ? l : BLK);
    if (sk === 1) { d(hx + 2, -6, 3, 2, MOUTH); d(hx + 4, -6, 1, 1, WHT); d(hx + 6, -10, 1, 1, SWC); d(hx + 7, -7, 2, 1, SWC); d(hx + 6, -4, 1, 1, SWC); }
    else d(hx + 2, -6, 3, 1, k);
    q(-8, -12, 14, 8, k);
    q(-6, -14, 10, 2, k);
    d(-6, -13, 3, 3, m); d(-2, -13, 3, 3, m); d(2, -13, 3, 3, m);
    d(-4, -9, 3, 3, m); d(0, -9, 3, 3, m);
    d(-8, -5, 14, 1, l);
    if (an) { d(-8 + an * 4, -13, 2, 1, WHT); d(-7 + an * 4, -12, 1, 2, WHT); }
    QX = QY = 0;
  }
  function sArcher(a, m, k, l) {
    const w = a.w, an = a.an, sk = a.sk, f = w >= 0 ? w : a.tl;
    const by = w === 1 || w === 3 ? -1 : an ? -1 : rest(a) && a.br ? -1 : 0;
    const puff = an >= 2 ? 1 : 0, thin = sk === 1 ? 1 : 0;
    // xúc tu uốn lượn
    for (let i = 0; i < 3; i++) {
      const x = -4 + i * 3, o = W1[(f + i) & 3];
      q(x, -6, 2, 3, k);
      q(x + o, -3, 2, 3 - (o > 0 && w >= 0 ? 1 : 0), k);
    }
    QY = by;
    q(-6 - puff, -19 + TW[f], 2, 5, k);
    q(-4 - puff + thin, -18 - thin, 8 + puff * 2 - thin * 2, 12 + thin - by, m);
    q(-3 + thin, -21 - thin * 2, 6 - thin * 2, 3 + thin, m);
    q(-1, -23 - thin * 2, 2, 2, m);
    d(-3, -19, 2, 1, l);
    d(-2, -16, 1, 1, l);
    if (a.bl) { d(0, -11, 4, 1, k); } else { d(0, -12, 4, 4, l); d(an ? 3 : 2, -11, an ? 1 : 2, an ? 1 : 2, BLK); }
    d(-4 + thin, -7 - by, 8 - thin * 2, 1, k);
    // tay ném: bóng mực phình to dần rồi quất tới
    if (an === 1) { seg(4, -14, 6, -20, 2, k); q(5, -24, 3, 3, '#e0c040'); }
    else if (an === 2) { seg(4, -14, 4, -21, 2, k); q(2, -26, 4, 4, '#e0c040'); d(2, -26, 2, 1, '#fff3b0'); }
    else if (an === 3) { seg(4, -14, 1, -21, 2, k); q(-3, -27, 5, 5, '#e0c040'); d(-3, -27, 2, 1, '#fff3b0'); d(3, -29, 1, 1, '#fff3b0'); }
    else if (sk === 1) { seg(3, -15, 11, -17, 2, k); swoosh(2, -15, 12, -2.5, -0.2); }
    else if (sk === 2) { seg(3, -15, 10, -12, 2, k); swoosh(2, -15, 11, -1.1, 0.2, SWD); }
    else { q(4, -19 - TW[f], 2, 5, k); q(4, -10, 2, 5, k); }
    QX = QY = 0;
  }
  function sNimble(a, m, k, l) {
    const an = a.an, lg = a.lg, f = a.w >= 0 ? a.w : a.tl;
    const wv = (i) => (lg ? 0 : TW[(f + i) & 3]);
    const cl = an ? Math.min(2, an) : 0; // cuộn mình lại trước khi phóng
    q(-14 + cl * 2, -3 + wv(0), 3, 2, l);
    q(-12 + cl * 2, -4 + wv(1), 5, 3, m);
    q(-8 + cl, -5 + wv(2) - cl, 5, 3 + cl, m);
    q(-4 + (lg ? 1 : 0), -4 + wv(3), 5, 3, m);
    q(0 + (lg ? 2 : 0), -6 + wv(0), 5, 4, m);
    d(-11 + cl * 2, -4 + wv(1), 3, 1, l);
    d(-3, -4 + wv(3), 3, 1, l);
    const hx = lg ? 5 : an ? -an : 0, hy = lg ? 5 : an ? -Math.min(2, an) : 0;
    q(3 + (hx >> 1), -11 + hy, 4, 7 - hy, m);
    d(4 + (hx >> 1), -11 + hy, 1, 6 - hy, l);
    q(5 + hx, -14 + hy, 7, 5, m);
    q(6 + hx, -16 + hy, 3, 2, k);
    if (!a.bl) d(9 + hx, -13 + hy, 2, 1, '#ff5040');
    d(5 + hx, -10 + hy, 2, 1, k);
    if (an || lg) { d(9 + hx, -10 + hy, 3, 2, MOUTH); d(9 + hx, -10 + hy, 1, 2, WHT); d(11 + hx, -10 + hy, 1, 2, WHT); }
    else if (a.tl === 1 && a.w < 0) d(12, -11, 2, 1, '#ff5040'); // lè lưỡi
    QX = QY = 0;
  }

  // ===== Lâu đài cổ: quỷ đá, dơi, golem, thầy mo, báo núi, chúa quỷ =====
  function rHuman(a, el, m, k, l, eye) {
    const B = base(a), fo = B.fo, by = B.by, ln = B.ln, w = a.w, an = a.an, sk = a.sk, tw = TW[a.tl];
    q(-4 - fo - (an ? 1 : 0), -5, 3, w === 1 ? 3 : 5, k);
    q(1 + fo + (sk ? 2 : 0), -5, 3, w === 3 ? 3 : 5, k);
    // đuôi ngoe nguẩy
    q(-8, -8, 3, 2, k);
    q(-9 - (tw > 0 ? 1 : 0), -11 - (tw < 0 ? 1 : 0), 2, 3 + (tw < 0 ? 1 : 0), k);
    d(-9 - (tw > 0 ? 1 : 0), -12 - (tw < 0 ? 1 : 0), 1, 1, l);
    QX = ln; QY = by;
    q(-7 - (fo >> 1), -15, 2, 6, k);
    q(el ? -6 : -5, -15, el ? 12 : 10, 10 - by, m);
    d(-3, -13, 1, 4, k);
    d(-2, -10, 3, 1, k);
    if (el) {
      // giáp vai đá, lõi lửa giữa ngực
      q(-9, -18, 5, 5, k); q(5, -18, 5, 5, k);
      d(-9, -18, 5, 1, l); d(5, -18, 5, 1, l);
      d(-2, -12, 4, 3, eye);
      d(-1, -9, 2, 2, eye);
      if (a.br || an) d(-1, -11, 2, 1, WHT);
    }
    QX = ln + (an ? -1 : sk === 1 ? 1 : 0); QY = by + (sk === 1 ? 1 : 0);
    q(-4, -22, 9, 8, m);
    if (a.bl) { d(1, -19, 2, 1, k); d(4, -19, 1, 1, k); } else { d(1, -20, 2, 2, eye); d(4, -20, 1, 2, eye); }
    d(0, -21, 4, 1, k);
    if (an || sk === 1) { d(1, -16, 4, 2, BLK); } else d(1, -16, 4, 1, BLK);
    d(1, -17, 1, 1, WHT); d(4, -17, 1, 1, WHT);
    if (el) {
      q(-5, -25, 2, 4, l); q(-7, -28, 2, 4, l); q(-6, -30, 1, 2, l);
      q(3, -25, 2, 4, l); q(5, -28, 2, 4, l); q(6, -30, 1, 2, l);
    } else {
      q(-4, -25, 2, 3, l);
      q(3, -25, 2, 3, l);
    }
    QX = ln; QY = by;
    // tay vuốt: giơ cao ra sau rồi cào xuống
    if (an === 1) { seg(4, -14, 7, -19, 2, k); d(7, -22, 1, 2, l); d(9, -21, 1, 2, l); }
    else if (an === 2) { seg(4, -14, 5, -22, 2, k); d(4, -25, 1, 2, l); d(6, -25, 1, 2, l); d(8, -24, 1, 2, l); }
    else if (an === 3) { seg(4, -14, 2, -23, 2, k); d(0, -26, 1, 2, l); d(2, -27, 1, 3, l); d(4, -26, 1, 2, l); }
    else if (sk === 1) {
      seg(4, -14, 12, -10, 3, k);
      d(13, -12, 3, 1, l); d(14, -10, 3, 1, l); d(13, -8, 3, 1, l);
      swoosh(3, -13, 18, -1.7, 0.2); swoosh(3, -13, 15, -1.6, 0.3); swoosh(3, -13, 12, -1.4, 0.4, SWD);
    } else if (sk === 2) {
      seg(4, -14, 11, -6, 3, k);
      d(12, -5, 3, 1, l); d(12, -3, 2, 1, l);
      swoosh(3, -13, 17, -0.4, 0.6, SWD); swoosh(3, -13, 14, -0.3, 0.6, SWD);
    } else if (sk === 3) { q(4, -12, 5, 2, k); d(8, -12, 2, 1, l); d(8, -10, 2, 1, l); }
    else {
      const o = fo >> 1;
      q(4 + o, -13, 4, 2, k); d(7 + o, -13, 2, 1, l); d(7 + o, -11, 2, 1, l);
    }
    QX = QY = 0;
  }
  function rSwarm(a, m, k) {
    const an = a.an, sk = a.sk, f = a.tl;
    // đập cánh liên tục; vút lên lấy đà rồi bổ nhào
    QX = sk === 1 ? 4 : sk === 2 ? 3 : sk === 3 ? 1 : an ? -1 : 0;
    QY = (sk === 1 ? 5 : sk === 2 ? 3 : sk === 3 ? 1 : an ? -1 - an : 0) + (sk ? 0 : [1, 0, -1, 0][f]);
    const y0 = -12;
    q(-2, y0, 4, 5, k);
    q(-2, y0 - 2, 1, 2, k);
    q(1, y0 - 2, 1, 2, k);
    d(-1, y0 + 1, 1, 1, '#ff5040');
    d(1, y0 + 1, 1, 1, '#ff5040');
    if (an || sk) { d(-1, y0 + 4, 1, 2, WHT); d(1, y0 + 4, 1, 2, WHT); }
    if (sk === 1 || sk === 2) {
      q(-9, y0 - 3, 7, 2, m); q(-10, y0 - 5, 3, 2, m);
      q(2, y0 - 1, 3, 2, m);
      d(-8, y0 - 7, 1, 1, SWC); d(-6, y0 - 9, 1, 1, SWC); d(-11, y0 - 8, 1, 1, SWD);
    } else if (f === 0 || an) {
      q(-7, y0 - 2, 5, 3, m); q(2, y0 - 2, 5, 3, m);
      q(-9, y0 - 4 - (an ? 1 : 0), 3, 2, m); q(6, y0 - 4 - (an ? 1 : 0), 3, 2, m);
    } else if (f === 2) {
      q(-8, y0 + 1, 6, 2, m); q(2, y0 + 1, 6, 2, m);
      q(-8, y0 + 3, 2, 2, m); q(6, y0 + 3, 2, 2, m);
    } else {
      q(-8, y0, 6, 2, m); q(2, y0, 6, 2, m);
      q(-10, y0 + (f === 1 ? 1 : -1), 2, 2, m); q(8, y0 + (f === 1 ? 1 : -1), 2, 2, m);
    }
    QX = QY = 0;
  }
  function rShield(a, m, k, l, eye) {
    const w = a.w, an = a.an, sk = a.sk;
    const A1 = w < 0 ? 0 : W1[w];
    const by = w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : sk === 1 ? 1 : 0;
    const ln = an >= 2 ? -1 : sk === 1 ? 2 : sk === 2 ? 1 : 0;
    q(-6 + A1, -3, 4, w === 1 ? 2 : 3, m);
    q(2 - A1, -3, 4, w === 3 ? 2 : 3, m);
    QX = ln; QY = by;
    q(-8, -13, 15, 10, k);
    q(-6, -15, 11, 2, k);
    d(-7, -13, 6, 1, l);
    d(-8, -12, 1, 5, l);
    // vết nứt phát sáng theo nhịp, rực lên khi sắp đấm
    const gl = an === 3 ? WHT : a.br || an || sk ? eye : dim(eye, 0.3);
    d(-4, -10, 1, 5, gl);
    d(-3, -8, 3, 1, gl);
    d(2, -12, 1, 4, gl);
    const hy = an ? -11 - Math.min(2, an) : sk === 1 ? -9 : -11;
    q(6, hy, 5, 6, m);
    if (a.bl) d(8, hy + 2, 2, 1, k); else d(8, hy + 1, 2, 2, eye);
    d(7, hy + 4, 3, 1, BLK);
    // nắm đấm đá
    const F = an === 1 ? [8, -11] : an === 2 ? [7, -17] : an === 3 ? [4, -21] : sk === 1 ? [11, -5] : sk === 2 ? [11, -5] : sk === 3 ? [9, -7] : [8 + (w >= 0 ? A1 : 0), -5];
    if (an) seg(7, -10, F[0] + 2, F[1] + 4, 3, k);
    q(F[0], F[1], 5, 5, m);
    d(F[0], F[1], 5, 1, l);
    if (sk === 1) { swoosh(4, -9, 13, -1.6, 0.2); d(17, -2, 3, 1, l); d(19, -5, 2, 2, l); d(16, -7, 1, 1, WHT); d(8, -1, 2, 1, l); }
    if (sk === 2) { d(19, -3, 2, 1, l); d(21, -7, 1, 1, l); d(7, -2, 1, 1, l); }
    QX = QY = 0;
  }
  function rArcher(a, m, k, l, eye) {
    const w = a.w, an = a.an, sk = a.sk;
    const by = w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : 0;
    const sw = w < 0 ? 0 : W1[w];
    const ln = an === 3 ? -1 : sk === 1 ? 1 : 0;
    // áo choàng: gấu áo đung đưa khi lướt đi
    q(-4 + ln, -15 + by, 8, 12 - by, m);
    q(-4 - sw, -3, 8, 3, k);
    if (sk === 1 || sk === 2) q(-7, -9, 3, 7, m);
    d(-4 + ln, -15 + by, 2, 12 - by, k);
    d(-2 + sw, -1, 2, 1, BLK);
    d(2 - sw, -1, 2, 1, BLK);
    QX = ln; QY = by;
    q(-4, -22, 8, 8, k);
    q(-2, -24, 4, 2, k);
    d(0, -20, 4, 4, BLK);
    if (!a.bl) { d(1, -19, 1, 1, an >= 2 ? WHT : eye); d(3, -19, 1, 1, an >= 2 ? WHT : eye); }
    d(-1, -12, 3, 1, l);
    // gậy phép: giơ cao tụ lửa rồi chĩa tới
    const orb = '#e0c040';
    if (an === 1) { q(3, -16, 3, 2, m); q(6, -27, 1, 21, l); q(5, -30, 3, 3, orb); }
    else if (an === 2) { q(3, -17, 3, 2, m); q(6, -29, 1, 21, l); q(4, -33, 5, 5, orb); d(5, -32, 2, 2, '#fff3b0'); d(2, -35, 1, 1, '#fff3b0'); d(10, -31, 1, 1, '#fff3b0'); }
    else if (an === 3) { q(3, -17, 3, 2, m); seg(6, -10, 3, -29, 1, l); q(0, -35, 6, 6, orb); d(1, -34, 3, 3, '#fff3b0'); d(-2, -37, 1, 1, WHT); d(7, -36, 1, 1, WHT); d(-3, -31, 1, 1, '#fff3b0'); d(8, -30, 1, 1, '#fff3b0'); }
    else if (sk === 1) { q(3, -15, 5, 2, m); seg(5, -9, 14, -22, 1, l); d(13, -25, 5, 5, WHT); d(15, -27, 1, 9, '#fff3b0'); d(11, -23, 9, 1, '#fff3b0'); }
    else if (sk === 2) { q(3, -15, 5, 2, m); seg(5, -9, 13, -22, 1, l); q(12, -24, 3, 3, l); d(16, -24, 1, 1, '#fff3b0'); d(18, -21, 1, 1, '#fff3b0'); }
    else if (sk === 3) { q(3, -14, 4, 2, m); seg(6, -5, 9, -24, 1, l); q(8, -26, 3, 3, l); }
    else {
      const u = w === 1 || w === 3 ? -1 : 0;
      q(3, -14, 3, 2, m);
      q(6, -23 + u - by, 1, 23 - u, l);
      q(5, -25 + u - by, 3, 3, l);
      d(6, -24 + u - by, 1, 1, a.tl === 1 ? WHT : eye);
    }
    QX = QY = 0;
  }

  function monShape(reg, role, a, m, k, l, eye) {
    const el = role === 'elite';
    if (reg === 1) {
      if (role === 'swarm') sSwarm(a, m, k, l);
      else if (role === 'shield') sShield(a, m, k, l);
      else if (role === 'archer') sArcher(a, m, k, l);
      else if (role === 'nimble') sNimble(a, m, k, l);
      else sHuman(a, el, m, k, l, eye);
    } else if (reg === 2) {
      if (role === 'swarm') rSwarm(a, m, k);
      else if (role === 'shield') rShield(a, m, k, l, eye);
      else if (role === 'archer') rArcher(a, m, k, l, eye);
      else if (role === 'nimble') quad(a, m, k, l, eye, true);
      else rHuman(a, el, m, k, l, eye);
    } else {
      if (role === 'swarm') fSwarm(a, m, k, l);
      else if (role === 'shield') fShield(a, m, k, l);
      else if (role === 'archer') fArcher(a, m, k, l);
      else if (role === 'nimble') quad(a, m, k, l, eye, false);
      else fHuman(a, el, m, k, l, eye);
    }
  }

  // ===== Trùm nhỏ của từng vùng: Nấm Chúa, Cua Đá, Hổ Lửa =====
  // a.kd là tên đòn đang ra (slam, charge, burst, summon, swipe), a.an là mức lấy đà 1..3, a.sk là nhịp sau khi đòn nổ 1..3.
  function mini0(a) {
    const st = '#eadfc4', stD = '#b8a888', cap = '#a8386c', capD = '#6e2046', capL = '#d05a8e', spot = '#f6e8c8', gold = '#ffd23f', gl = '#8fe04a';
    const w = a.w, an = a.an, sk = a.sk, kd = a.kd;
    const A1 = w < 0 ? 0 : W1[w];
    const roar = kd === 'summon' || a.roar;
    // lùn xuống khi lấy đà, bẹp dí khi nện
    const sq = kd === 'slam' ? (an ? an - 1 : sk === 1 ? 3 : sk === 2 ? 2 : sk === 3 ? 1 : 0) : kd === 'charge' && an ? 1 : kd === 'swipe' && an ? 1 : 0;
    const by = w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : 0;
    const ln = kd === 'charge' ? (an ? an : sk ? 4 : 0) : kd === 'swipe' ? (an ? -2 : sk === 1 ? 2 : 0) : roar ? -1 : 0;
    const pf = kd === 'burst' ? (an ? an : sk === 1 ? 2 : 0) : roar ? 1 : 0; // mũ phồng lên
    const wd = sq >= 2 ? 2 : sq ? 1 : pf >= 2 ? 1 : 0;
    q(-5 + A1, -2, 4, w === 1 ? 1 : 2, stD);
    q(1 - A1, -2, 4, w === 3 ? 1 : 2, stD);
    QY = by + sq;
    const armsUp = roar || kd === 'burst';
    if (kd === 'slam' && an) q(-9, -15 - an * 2, 4, 4, st);
    else if (armsUp) q(-8, -16, 3, 7, st);
    else q(-7 - (kd === 'charge' && (an || sk) ? 2 : 0), -9, 3, 2, st);
    q(-5, -12, 10, 10 - by - sq, st);
    d(-5, -12, 2, 10 - by - sq, stD);
    d(-5, -3 - by - sq, 10, 1, stD);
    // mũ nấm
    QX = ln; QY = by + sq + (ln > 2 ? 1 : 0);
    q(-10 - wd, -19, 20 + wd * 2, 6, cap);
    q(-8 - wd, -22 - pf, 16 + wd * 2, 3 + pf, cap);
    q(-5, -24 - pf, 10, 2, cap);
    d(-10 - wd, -14, 20 + wd * 2, 1, capD);
    d(-8, -13, 16, 1, gl);
    d(-7, -22 - pf, 6, 1, capL);
    d(-9 - wd, -19, 1, 3, capL);
    d(-6, -19, 3, 2, spot);
    d(1, -22 - pf, 3, 2, spot);
    d(6, -18, 2, 2, spot);
    d(-1, -17, 2, 1, spot);
    if (pf >= 2) { d(-4, -20, 2, 1, gl); d(3, -19, 2, 1, gl); d(-8, -17, 1, 1, gl); }
    // vương miện
    q(-3, -26 - pf, 7, 2, gold);
    q(-3, -28 - pf, 1, 2, gold); q(0, -28 - pf, 1, 2, gold); q(3, -28 - pf, 1, 2, gold);
    d(0, -26 - pf, 1, 1, '#d8372d');
    if (pf || roar) {
      // bào tử bốc lên
      const f = a.tl;
      d(-9 + f * 2, -28 - pf - f, 1, 1, gl); d(7 - f, -27 - pf - f, 1, 1, gl); d(-2 + f * 3, -32 - pf, 1, 1, gl); d(11, -21 - f * 2, 1, 1, gl);
      if (pf >= 3) { d(-6, -31 - f, 2, 2, gl); d(4, -33 + f, 2, 2, gl); d(-12, -24, 1, 1, WHT); d(12, -26, 1, 1, WHT); }
    }
    // mặt
    QX = ln >> 1; QY = by + sq;
    d(-1, -11, 4, 1, capD);
    if (a.bl) { d(0, -9, 2, 1, BLK); d(4, -9, 1, 1, BLK); } else { d(0, -10, 2, 3, BLK); d(4, -10, 1, 3, BLK); d(0, -10, 1, 1, gl); }
    const open = roar || an || sk === 1;
    if (open) { d(1, -6, 4, 3 - (sq > 2 ? 1 : 0), BLK); d(2, -6, 1, 1, WHT); } else d(1, -5, 4, 1, BLK);
    // tay trước
    if (kd === 'slam' && an) { seg(5, -9, 8, -13 - an * 2, 3, st); q(6, -17 - an * 2, 5, 5, st); }
    else if (kd === 'slam' && sk) { q(5, -8, 4, 3, st); q(8, -6 + (sk === 3 ? -2 : 0), 5, 5, st); if (sk < 3) { d(14, -2, 3, 1, spot); d(16, -5, 2, 1, spot); d(6, -1, 2, 1, spot); } }
    else if (kd === 'swipe' && an) q(-9, -11, 5, 3, st);
    else if (kd === 'swipe' && sk === 1) { q(5, -10, 11, 3, st); swoosh(0, -8, 18, -2.6, 0.5, SWC, 8); swoosh(0, -8, 15, -2.2, 0.5, SWD, 6); }
    else if (kd === 'swipe' && sk === 2) { q(5, -8, 8, 3, st); swoosh(0, -8, 18, -0.4, 1.2, SWD, 8); }
    else if (armsUp) q(6, -16, 3, 7, st);
    else if (kd === 'charge' && (an || sk)) q(4, -8, 3, 2, st);
    else q(5, -9, 3, 2, st);
    QX = QY = 0;
  }
  function mini1(a) {
    const s = '#8693a0', sD = '#4f5b68', sL = '#bcc8d0', ice = '#7fd4ff', iceL = '#e9f9ff';
    const w = a.w, an = a.an, sk = a.sk, kd = a.kd;
    const A1 = w < 0 ? 0 : W1[w];
    const roar = kd === 'summon' || a.roar;
    const by = w === 1 || w === 3 ? -1 : kd === 'charge' && an ? 1 : kd === 'slam' && sk === 1 ? 1 : rest(a) && a.br ? -1 : 0;
    const bx = kd === 'charge' ? (an ? -an : sk ? 2 : 0) : 0;
    // chân bò ngang
    q(-11 + A1, -3, 2, 3, sD); q(-8 - A1, -2, 2, 2, sD); q(6 + A1, -2, 2, 2, sD); q(9 - A1, -3, 2, 3, sD);
    q(-12 - (A1 > 0 ? 1 : 0), -5, 3, 2, sD); q(9 + (A1 < 0 ? 1 : 0), -5, 3, 2, sD);
    QX = bx; QY = by;
    // tinh thể băng trên lưng: dài ra và rực sáng trước khi bắn
    const gr = kd === 'burst' ? (an ? an * 2 : sk === 1 ? -2 : sk === 2 ? -1 : 0) : 0;
    q(-5, -17 - gr, 3, 5 + gr, ice); q(-1, -20 - gr, 3, 8 + gr, ice); q(3, -16 - gr, 2, 4 + gr, ice);
    d(-1, -20 - gr, 1, 4, iceL); d(-5, -17 - gr, 1, 2, iceL);
    if (kd === 'burst' && an >= 2) { d(0, -19 - gr, 1, 6 + gr, WHT); d(-4, -16 - gr, 1, 3 + gr, WHT); d(-7, -22 - gr, 1, 1, WHT); d(5, -21 - gr, 1, 1, WHT); d(1, -24 - gr, 1, 1, iceL); }
    // mai
    q(-9, -11, 18, 8, s);
    q(-7, -13, 14, 2, s);
    d(-9, -5, 18, 2, sD);
    d(-6, -13, 7, 1, sL);
    d(-9, -11, 1, 4, sL);
    d(-3, -10, 1, 4, sD); d(-2, -7, 3, 1, sD); d(4, -11, 1, 3, sD);
    // mắt
    q(5, -16, 2, 4, sD); q(8, -15, 2, 3, sD);
    if (a.bl) { d(5, -15, 2, 1, sL); d(8, -14, 2, 1, sL); } else {
      d(5, -16, 2, 2, '#ffe14a'); d(8, -15, 2, 2, '#ffe14a');
      d(6, -16, 1, 1, BLK); d(9, -15, 1, 1, BLK);
    }
    if (roar || an) { d(5, -8, 4, 2, BLK); if (a.tl & 1) d(10, -9, 1, 1, iceL); else d(11, -11, 1, 1, iceL); } else d(5, -8, 4, 1, BLK);
    // càng: [x, y] càng lớn bên phải và càng nhỏ bên trái
    const bob = w >= 0 ? (w & 1) : rest(a) && a.tl === 1 ? 1 : 0;
    let R = [9, -13 - bob], L = [-14, -11 + bob], open = 0;
    if (kd === 'slam') {
      if (an) { R = [9 - an, -13 - an * 4]; open = 1; } else if (sk === 1 || sk === 2) R = [12, -7]; else if (sk === 3) R = [10, -10];
    } else if (kd === 'charge') {
      if (an) { R = [10, -9]; L = [-13, -8]; open = 1; } else if (sk) { R = [13, -10]; L = [-10, -9]; }
    } else if (roar) {
      R = [9, -19 - (a.tl & 1) * 2]; L = [-14, -17 - ((a.tl + 1) & 1) * 2]; open = a.tl & 1;
    } else if (kd === 'swipe') {
      if (an) { R = [11, -13 - an]; L = [-17, -11 - an]; open = 1; } else if (sk === 1) { R = [14, -11]; L = [-19, -10]; } else if (sk === 2) { R = [12, -11]; L = [-17, -10]; }
    } else if (kd === 'burst' && (an || sk)) { R = [9, -10]; L = [-14, -9]; }
    seg(9, -9, R[0] + 2, R[1] + 5, 3, sD);
    q(R[0], R[1], 6, 7, s);
    d(R[0], R[1], 6, 1, sL);
    d(R[0] + 3, R[1] + 3 - open, 3, 2 + open, BLK);
    d(R[0] + 5, R[1] + 2 - open, 1, 1, WHT);
    seg(-10, -9, L[0] + 3, L[1] + 4, 3, sD);
    q(L[0], L[1], 5, 6, s);
    d(L[0], L[1], 5, 1, sL);
    d(L[0], L[1] + 3 - open, 3, 2 + open, BLK);
    if (kd === 'slam' && (sk === 1 || sk === 2)) { d(19, -2, 3, 1, sL); d(21, -5, 2, 1, sL); d(10, -1, 2, 1, sL); if (sk === 1) swoosh(6, -10, 14, -1.7, 0.1); }
    if (kd === 'swipe' && sk === 1) { swoosh(0, -8, 23, -2.9, -0.2, SWC, 9); swoosh(0, -8, 23, 0.2, 2.9, SWC, 7); }
    if (kd === 'swipe' && sk === 2) { swoosh(0, -8, 24, -2.2, -0.9, SWD, 9); swoosh(0, -8, 24, 0.9, 2.2, SWD, 7); }
    QX = QY = 0;
  }
  function mini2(a) {
    const o = '#f08a2a', oD = '#b85a14', cr = '#ffe6c0', sp = '#3a1a10', f1 = '#ff7a2a', f2 = '#ffd23f';
    const w = a.w, an = a.an, sk = a.sk, kd = a.kd, f = a.f3;
    const A1 = w < 0 ? 0 : W1[w];
    const roar = kd === 'summon' || kd === 'burst' || a.roar;
    const dash = kd === 'charge' && sk > 0 && sk < 3;
    const crouch = kd === 'charge' && an ? Math.min(2, an) : kd === 'swipe' && an ? 1 : 0;
    const rear = kd === 'slam' && an ? 1 : 0;
    const by = dash ? -2 : crouch ? crouch : w === 1 || w === 3 ? -1 : rest(a) && a.br ? -1 : 0;
    const big = roar ? 2 : kd === 'swipe' && sk ? 2 : dash ? 1 : 0; // lửa bốc cao
    // đuôi có ngọn lửa
    const tw = TW[a.tl];
    QY = by;
    if (dash) { q(-17, -12, 7, 2, o); d(-15, -12, 2, 1, sp); d(-22, -14, 6, 4, f1); d(-21, -13, 3, 2, f2); d(-26, -12, 3, 1, f1); }
    else {
      q(-13, -12, 2, 6, o); q(-15 + (tw > 0 ? 1 : 0), -16, 2, 5, o);
      d(-13, -10, 2, 1, sp); d(-15 + (tw > 0 ? 1 : 0), -14, 2, 1, sp);
      const tx = -16 + (tw > 0 ? 1 : 0);
      d(tx, -20 - (f === 1 ? 1 : 0) - big, 4, 4 + big, f1); d(tx + 1, -19, 2, 2, f2); d(tx + 1 + f, -22 - big, 1, 2, f1);
    }
    QY = 0;
    // chân
    if (dash) {
      seg(-8, -6, -14, -3, 3, o); seg(-6, -6, -11, -2, 3, oD); seg(5, -6, 12, -3, 3, oD); seg(7, -6, 15, -4, 3, o);
    } else {
      const lh = 5 - (by > 0 ? by : 0);
      q(-8 - A1, -lh, 3, lh - (w === 1 ? 2 : 0), o); q(-6 + A1, -lh, 3, lh - (w === 3 ? 2 : 0), oD);
      if (rear) { seg(6, -8, 10, -5, 3, oD); seg(8, -8, 13, -7, 3, o); d(12, -6, 2, 1, cr); }
      else {
        q(5 - A1, -lh, 3, lh - (w === 3 ? 2 : 0), oD); q(7 + A1, -lh, 3, lh - (w === 1 ? 2 : 0), o);
        if (w !== 1) d(7 + A1, -1, 4, 1, cr);
      }
      if (w !== 1) d(-8 - A1, -1, 4, 1, cr);
    }
    QY = by;
    // bờm lửa
    d(-7 + f, -17 - big, 3, 4 + big, f1); d(-2, -18 - f - big, 3, 5 + big, f1); d(3 - f, -17 - big, 3, 4 + big, f1);
    d(-6 + f, -15, 1, 2, f2); d(-1, -16 - f, 1, 3, f2); d(4 - f, -15, 1, 2, f2);
    // thân
    q(-10, -13, 18, 8, o);
    d(-8, -7, 14, 2, cr);
    d(-7, -13, 1, 5, sp); d(-3, -13, 1, 6, sp); d(1, -13, 1, 5, sp); d(5, -13, 1, 4, sp);
    d(-10, -13, 18, 1, oD);
    // đầu: ngẩng lên khi gầm, rạp xuống khi lấy đà
    const open = roar || an || sk === 1 || dash;
    QX = crouch ? 1 : dash ? 2 : 0; QY = by + (roar || rear ? -2 : crouch ? 1 : 0);
    q(6, -18, 8, 8, o);
    q(6, -20, 2, 2, o); q(11, -20, 2, 2, o);
    d(8, -18, 1, 2, sp); d(10, -18, 1, 3, sp); d(6, -15, 2, 1, sp); d(6, -13, 2, 1, sp);
    q(10, -14, 5, 4, cr);
    d(14, -14, 1, 1, BLK);
    if (a.bl) d(10, -15, 4, 1, sp); else { d(10, -16, 2, 1, '#ffe14a'); d(13, -16, 1, 1, '#ffe14a'); }
    if (open) {
      d(10, -11, 5, 3, MOUTH); d(10, -11, 1, 2, WHT); d(14, -11, 1, 2, WHT);
      d(15, -10, 2, 1, f2);
      if (roar) { d(16 + f, -11, 2, 2, f1); d(19, -12 + f, 2, 2, f2); d(21 + f, -9, 1, 1, f1); }
    } else d(11, -11, 3, 1, BLK);
    QX = 0; QY = by;
    if (kd === 'swipe' && sk === 1) { swoosh(0, -9, 21, -3.0, 0.5, f1, 9); swoosh(0, -9, 18, -2.7, 0.5, f2, 7); }
    if (kd === 'swipe' && sk === 2) { swoosh(0, -9, 22, -0.6, 1.4, f1, 9); }
    if (kd === 'slam' && (sk === 1 || sk === 2)) { d(15, -2, 3, 1, f2); d(18, -5, 2, 2, f1); d(13, -7, 1, 1, f2); }
    QX = QY = 0;
  }

  // ---------- vẽ quái ----------
  const ST0 = { fire: 0, poisonN: 0, iceN: 0, frozen: 0, stun: 0, root: 0 };
  const RATE = { rusher: 8, swarm: 11, shield: 6, archer: 8, nimble: 12, elite: 7, mini: 6 };
  const SKD = 0.27; // thời gian giữ dáng ra đòn sau khi hết lấy đà
  const MW = 80, MH = 64, MAX = 40, MAY = 52;
  const SPR = new Map();
  function mem(e) {
    let a = e._a;
    if (!a) a = e._a = { pw: 0, w0: 0.4, skT: -9 };
    return a;
  }
  function monPose(e, a, reg) {
    const st = e.st || ST0, now = G.time, t = e.t || 0;
    const stopped = st.frozen > 0 || st.stun > 0;
    const wind = e.wind > 0 ? e.wind : 0;
    if (wind > 0 && (a.pw <= 0 || wind > a.w0)) a.w0 = wind;
    // đòn vừa tung: wind vừa về 0 mà không phải do choáng hay đóng băng
    if (a.pw > 0 && wind <= 0 && !stopped && !e.dead) a.skT = now;
    a.pw = wind;
    const P = { w: -1, br: 0, bl: 0, tl: 0, an: 0, sk: 0, lg: 0 };
    if (st.frozen > 0) return P;
    const sd = now - a.skT;
    if (e.lunge > 0) P.lg = 1;
    else if (wind > 0) { const u = 1 - wind / a.w0; P.an = u < 0.3 ? 1 : u < 0.65 ? 2 : 3; }
    else if (sd >= 0 && sd < SKD && e.role !== 'nimble') P.sk = sd < 0.09 ? 1 : sd < 0.18 ? 2 : 3;
    else if (st.stun > 0) P.bl = 1;
    else if (e.moving) { P.w = Math.floor(t * (RATE[e.role] || 8)) & 3; P.tl = P.w; }
    else { P.br = Math.floor(t * 2.4) & 1; P.bl = t % 3.3 < 0.13 ? 1 : 0; P.tl = Math.floor(t * 5) & 3; }
    if (reg === 2 && e.role === 'swarm') { P.tl = Math.floor(t * 14) & 3; P.w = -1; P.br = 0; } // dơi lúc nào cũng đập cánh
    return P;
  }
  function monSprite(reg, e, P) {
    const role = e.role;
    const key = reg + role + (e.el || '-') + P.w + P.br + P.bl + P.tl + P.an + P.sk + P.lg;
    let s = SPR.get(key);
    if (s) return s;
    if (SPR.size > 1400) SPR.clear();
    const S = e.skin || G.REGIONS[reg].skin;
    const E = e.el ? G.EL[e.el] : null;
    const alt = ALT[reg][role];
    const m = E ? E.dark : alt ? mix(S[0], alt, 0.65) : S[0], k = E ? '#2a2224' : alt ? mix(S[1], dim(alt, 0.35), 0.5) : S[1], l = E ? E.col : S[2];
    const eye = E ? E.col2 : EYE[reg];
    const g = mk(MW, MH);
    OC = DARK;
    bake(g, MAX, MAY, () => monShape(reg, role, P, m, k, l, eye));
    SPR.set(key, g.canvas);
    return g.canvas;
  }
  // Mảnh vụn bay ra theo vòng: v là tiến độ 0..1.
  function bits(c, n, v, r, col, col2, seed, up) {
    if (v <= 0 || v >= 1) return;
    for (let i = 0; i < n; i++) {
      const an = i * 2.399 + seed, sp = 0.5 + hsh(i + seed * 7) * 0.7;
      const bx = Math.cos(an) * r * sp * easeOut(v), by = Math.sin(an) * r * 0.5 * sp * easeOut(v) - (up || 12) * v + (up || 12) * 2.2 * v * v;
      const s = v < 0.5 && i % 3 === 0 ? 2 : 1;
      if (v > 0.75 && i % 2) continue;
      p(c, Math.round(bx), Math.round(by), s, s, i % 3 === 1 && col2 ? col2 : col);
    }
  }
  // Kiểu ngã của từng loài khi chết.
  const DIE = [
    { rusher: 'topple', swarm: 'pop', shield: 'flip', archer: 'topple', nimble: 'flip', elite: 'topple' },
    { rusher: 'topple', swarm: 'pop', shield: 'flip', archer: 'melt', nimble: 'melt', elite: 'topple' },
    { rusher: 'shatter', swarm: 'fall', shield: 'shatter', archer: 'crumple', nimble: 'flip', elite: 'shatter' },
  ];
  function dieMon(c, e, reg) {
    const k = clamp01(e.dying), x = Math.round(e.x), y = Math.round(e.y), sc = e.scale || 1, f = e.face < 0 ? -1 : 1;
    const role = e.role, style = (DIE[reg] && DIE[reg][role]) || 'topple', big = role === 'elite';
    const img = monSprite(reg, e, { w: -1, br: 0, bl: 1, tl: 0, an: role === 'swarm' ? 0 : 1, sk: 0, lg: 0 });
    const S = e.skin || G.REGIONS[reg].skin;
    const col = e.el ? G.EL[e.el].col : S[0], col2 = e.el ? G.EL[e.el].col2 : S[2];
    if (k < 0.9) A.ellipse(c, x, y, e.r * 1.1 * (1 - k * 0.5), 2, 'rgba(0,0,0,' + (0.3 * (1 - k)).toFixed(2) + ')');
    const A0 = 0.28; // phần đầu: trúng đòn, giật lùi, loé trắng
    const u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0));
    let ox = -6 * easeOut(u), oy = 0, rot = -0.22 * u, sx = 1 + 0.12 * Math.sin(u * Math.PI), sy = 1 - 0.14 * Math.sin(u * Math.PI), alpha = 1;
    let src = img;
    const hot = k < A0 ? 1 - u : 0;
    c.save();
    c.translate(x, y);
    c.scale(f * sc, sc);
    if (style === 'pop') {
      // phồng lên rồi nổ bụp
      const g = 1 + 0.55 * easeOut(v);
      if (v < 0.3) { c.save(); c.translate(ox, 0); c.scale(g * sx, g * sy); c.drawImage(tinted('t', img, '#ffffff', Math.max(hot, v * 3)), -MAX, -MAY); c.restore(); }
      c.translate(ox, -6);
      bits(c, 9, clamp01((v - 0.15) / 0.85), 20, col, col2, 1.3, 10);
      c.restore();
      return;
    }
    if (style === 'shatter') {
      // vỡ thành từng mảng đá văng ra
      const cols = 3, rows = big ? 4 : 3, x0 = -12, y0 = -30, tw = 8, th = Math.ceil(30 / rows);
      src = hot > 0 ? tinted('t', img, '#ffffff', hot * 0.9) : v > 0.5 ? tinted('t', img, '#000000', (v - 0.5) * 0.8) : img;
      c.translate(ox, 0);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const n = i * rows + j, late = hsh(n + 3) * 0.25;
        const vv = clamp01((v - late * 0.4) / (1 - late * 0.4));
        if (vv > 0.8 && n % 2) continue;
        if (vv >= 0.97) continue;
        const dx = (i - 1) * 9 * easeOut(vv) + (hsh(n) - 0.5) * 6 * vv - 5 * vv;
        const up = (rows - j) * 5 + 4;
        const dy = -up * vv * 1.6 + (up * 1.6 + (rows - j - 1) * th * 0.9 + 2) * vv * vv;
        c.drawImage(src, MAX + x0 + i * tw, MAY + y0 + j * th, tw, th, Math.round(x0 + i * tw + dx), Math.round(y0 + j * th + Math.min(dy, (rows - j - 1) * th + 2)), tw, th);
      }
      c.translate(0, -8);
      bits(c, big ? 10 : 6, v, 18, col, col2, 2.1, 10);
      c.restore();
      return;
    }
    if (style === 'topple') {
      // ngã ngửa ra sau, nảy nhẹ rồi tan
      const fall = clamp01(v / 0.45);
      rot = -0.22 - (Math.PI / 2 - 0.22) * easeIn(fall);
      if (v > 0.45 && v < 0.62) oy = -3 * Math.sin(((v - 0.45) / 0.17) * Math.PI);
      alpha = v > 0.9 ? 0.3 : v > 0.78 ? 0.6 : 1;
    } else if (style === 'flip') {
      // bật ngửa, chổng chân lên trời
      const fl = clamp01(v / 0.4);
      oy = -9 * Math.sin(fl * Math.PI) - 12 * easeOut(fl);
      rot = -Math.PI * easeOut(fl);
      c.translate(ox, oy - 0);
      c.translate(0, -6); c.rotate(rot); c.translate(0, 6);
      if (v > 0.4) c.translate(Math.floor(k * 40) & 1, 0);
      alpha = v > 0.9 ? 0.3 : v > 0.78 ? 0.6 : 1;
      c.globalAlpha = alpha;
      c.drawImage(hot > 0 ? tinted('t', img, '#ffffff', hot * 0.9) : img, -MAX, -MAY);
      c.restore();
      c.save(); c.translate(x - f * 6 * sc, y - 6 * sc); bits(c, 5, clamp01((v - 0.35) / 0.5), 14, col2, col, 0.7, 6); c.restore();
      return;
    } else if (style === 'melt' || style === 'crumple') {
      // sụp xuống thành một vũng
      const m = smooth(clamp01(v / 0.6));
      sy = (1 - 0.14 * Math.sin(u * Math.PI)) * (1 - 0.86 * m);
      sx = 1 + (style === 'melt' ? 0.7 : 0.25) * m;
      rot = -0.22 * (1 - m);
      alpha = v > 0.88 ? 0.3 : v > 0.72 ? 0.6 : 1;
      if (style === 'melt' && v > 0.2) src = tinted('t', img, col2, Math.min(0.6, v * 0.8));
    } else if (style === 'fall') {
      // rơi xoáy xuống đất
      const fl = clamp01(v / 0.5);
      oy = 12 * easeIn(fl);
      rot = -0.22 - fl * 5;
      if (v > 0.5) { rot = Math.PI; sy = 0.6; oy = 12; }
      alpha = v > 0.9 ? 0.3 : v > 0.75 ? 0.6 : 1;
    }
    c.translate(ox, oy);
    if (style === 'fall') { c.translate(0, -10); c.rotate(rot); c.translate(0, 10); } else c.rotate(rot);
    c.scale(sx, sy);
    c.globalAlpha = alpha;
    if (hot > 0 && src === img) src = tinted('t', img, '#ffffff', hot * 0.9);
    c.drawImage(src, -MAX, -MAY);
    c.restore();
    // bụi và mảnh vụn lúc chạm đất
    c.save();
    c.translate(x - f * 8 * sc, y - 4 * sc);
    const bv = style === 'melt' || style === 'crumple' ? clamp01((v - 0.2) / 0.7) : clamp01((v - 0.42) / 0.5);
    if (style === 'melt') {
      for (let i = 0; i < 4; i++) { const bu = clamp01(bv * 1.4 - i * 0.12); if (bu > 0 && bu < 1) p(c, Math.round(-8 + i * 6 + Math.sin(bu * 6 + i) * 2), Math.round(2 - bu * 18), bu < 0.5 ? 2 : 1, bu < 0.5 ? 2 : 1, col2); }
    } else if (style === 'crumple') {
      for (let i = 0; i < 4; i++) { const bu = clamp01(bv * 1.3 - i * 0.1); if (bu > 0 && bu < 1) p(c, Math.round(-6 + i * 4 + Math.sin(bu * 5 + i * 2) * 3), Math.round(-4 - bu * 24), 2, 2, i % 2 ? '#8a7a80' : '#5a4a54'); }
    } else bits(c, big ? 9 : 5, bv, big ? 20 : 13, col2, col, 0.4, 7);
    c.restore();
  }
  // Vẽ trực tiếp ra màn hình bằng hai lượt viền và màu (cho vật nhỏ không cần khung tạm).
  function two(c, fn) {
    const pc = cx;
    cx = c; QX = 0; QY = 0; OC = DARK;
    OUT = true; fn(); OUT = false; fn();
    cx = pc;
  }
  // Vật bay theo cung từ (x0, y0 - z0) xuống mặt đất tại (x1, y1); u là tiến độ 0..1.
  function lob(c, x0, y0, z0, x1, y1, u, h, col, col2, big) {
    if (u <= 0 || u >= 1) return;
    A.ellipse(c, x1, y1, 3 + 5 * u, 1 + 2 * u, 'rgba(0,0,0,' + (0.15 + 0.2 * u).toFixed(2) + ')');
    for (let i = 2; i >= 0; i--) {
      const v = u - i * 0.05;
      if (v <= 0) continue;
      const px = Math.round(lerp(x0, x1, v)), py = Math.round(lerp(y0 - z0, y1, v) - h * 4 * v * (1 - v));
      if (i) { p(c, px - 1, py - 1, 3 - i, 3 - i, A.hexA(col, 0.6 - i * 0.2)); continue; }
      p(c, px - 3, py - 2, 6, 4, DARK); p(c, px - 2, py - 3, 4, 6, DARK);
      p(c, px - 2, py - 2, 4, 4, col);
      p(c, px - 2, py - 2, 2, 1, col2 || WHT);
      if (big) { p(c, px - 4, py - 3, 8, 6, DARK); p(c, px - 3, py - 4, 6, 8, DARK); p(c, px - 3, py - 3, 6, 6, col); p(c, px - 2, py - 3, 3, 2, col2 || WHT); p(c, px, py - 6, 1, 2, '#4d6b28'); }
    }
  }
  // Hiệu ứng ngắn do trùm tạo ra (b.fx), toạ độ thế giới.
  function drawFx(c, b) {
    if (!b.fx) return;
    for (const f of b.fx) {
      const v = clamp01(f.t / f.d), x = Math.round(f.x), y = Math.round(f.y);
      if (f.k === 'spike') {
        // gai rễ trồi lên từ đất rồi rút xuống
        const H = v < 0.15 ? easeOut(v / 0.15) : v < 0.6 ? 1 : 1 - (v - 0.6) / 0.4;
        ring(c, x, y, 6 + 12 * easeOut(v), 3 + 6 * easeOut(v), 'rgba(60,36,20,' + (0.7 * (1 - v)).toFixed(2) + ')');
        two(c, () => {
          const h1 = Math.round(28 * H), h2 = Math.round(19 * H), h3 = Math.round(15 * H);
          if (h2 > 1) { seg(x - 6, y + 1, x - 10, y - h2, 3, '#40291a'); seg(x - 10, y - h2, x - 12, y - h2 - 3, 1, '#d8cfa8'); }
          if (h3 > 1) { seg(x + 6, y + 2, x + 11, y - h3, 3, '#40291a'); seg(x + 11, y - h3, x + 13, y - h3 - 3, 1, '#d8cfa8'); }
          if (h1 > 1) { seg(x, y + 2, x + 1, y - h1, 4, '#6a4429'); seg(x + 1, y - h1, x + 2, y - h1 - 4, 2, '#d8cfa8'); d(x - 1, y - h1 + 2, 1, Math.max(1, h1 - 4), '#8a6040'); }
          if (h1 > 12) { seg(x + 1, y - 10, x + 5, y - 14, 1, '#d8cfa8'); seg(x, y - 17, x - 4, y - 20, 1, '#d8cfa8'); }
        });
        c.save(); c.translate(x, y - 2); bits(c, 8, clamp01(v * 1.6), 18, '#5a3a22', '#8a6040', 0.9, 14); c.restore();
      } else if (f.k === 'thorns') {
        // vòng gai bật lên quanh gốc
        const H = v < 0.18 ? easeOut(v / 0.18) : v < 0.55 ? 1 : 1 - (v - 0.55) / 0.45;
        const r = f.r || 60;
        two(c, () => {
          for (let i = 0; i < 16; i++) {
            const an = i * 0.393 + 0.2, rr = r * (0.45 + 0.5 * hsh(i + 2));
            const sx = Math.round(x + Math.cos(an) * rr), sy = Math.round(y + Math.sin(an) * rr * 0.6);
            const h = Math.round((9 + hsh(i) * 9) * H), ln = Math.round(Math.cos(an) * 4 * H);
            if (h < 2) continue;
            seg(sx, sy, sx + ln, sy - h, 3, '#d8cfa8');
            seg(sx + ln, sy - h, sx + ln + (ln > 0 ? 1 : -1), sy - h - 3, 1, '#f4eed0');
            d(sx + 1, sy - h + 2, 1, Math.max(1, h - 3), '#9a906a');
          }
        });
      } else if (f.k === 'column') {
        // cột nước dội xuống rồi bắn lên
        const up = v < 0.3 ? easeOut(v / 0.3) : 1, fall = v < 0.3 ? 0 : (v - 0.3) / 0.7;
        const h = Math.round(34 * up * (1 - fall * fall)), w = Math.round(9 - 4 * fall);
        ring(c, x, y, 8 + 14 * v, 4 + 7 * v, 'rgba(225,245,255,' + (0.9 * (1 - v)).toFixed(2) + ')');
        if (h > 1) {
          p(c, x - (w >> 1) - 1, y - h, w + 2, h, '#3f8fb5');
          p(c, x - (w >> 1), y - h, w, h, '#7fd4ff');
          p(c, x - (w >> 1) + 1, y - h, 2, h, '#e9f9ff');
          p(c, x - (w >> 1) - 2, y - h - 2, w + 4, 3, '#ffffff');
        }
        c.save(); c.translate(x, y - 6); bits(c, 9, v, 22, '#bfeaff', '#ffffff', 1.7, 26); c.restore();
      } else if (f.k === 'splat') {
        ring(c, x, y, 6 + 14 * easeOut(v), 3 + 8 * easeOut(v), A.hexA(f.col || '#8fe04a', 0.9 * (1 - v)));
        c.save(); c.translate(x, y - 3); bits(c, 9, v, 20, f.col || '#8fe04a', '#ffffff', 2.9, 16); c.restore();
      } else if (f.k === 'quake') {
        // đất nứt và đá văng lên
        const r = f.r || 30, e = easeOut(v);
        ring(c, x, y, r * (0.4 + 0.6 * e), r * 0.6 * (0.4 + 0.6 * e), 'rgba(255,240,200,' + (0.8 * (1 - v)).toFixed(2) + ')');
        for (let i = 0; i < 6; i++) {
          const an = i * 1.047 + 0.3, len = r * (0.4 + 0.5 * hsh(i)) * Math.min(1, v * 4);
          A.line(c, x, y, Math.round(x + Math.cos(an) * len), Math.round(y + Math.sin(an) * len * 0.6), 'rgba(30,18,14,' + (0.8 * (1 - v)).toFixed(2) + ')', 1);
        }
        c.save(); c.translate(x, y - 3); bits(c, 10, v, r, '#8a7a6a', '#d8cfa8', 1.1, 20); c.restore();
      }
    }
  }

  function drawMon(c, e, reg) {
    const x = Math.round(e.x), y = Math.round(e.y), sc = e.scale || 1, f = e.face < 0 ? -1 : 1;
    const st = e.st || ST0, a = mem(e), P = monPose(e, a, reg), now = G.time;
    A.ellipse(c, x, y, e.r * 1.1, Math.max(2, e.r * 0.42), 'rgba(0,0,0,0.3)'); // bóng tròn hơn cho sàn nhìn từ trên
    if (e.resist) {
      // vòng hào quang kháng hệ dưới chân
      const rc = G.EL[e.resist].col, rr = Math.round(e.r * 1.1) + 3, k = Math.floor(now * 6) % 3;
      ring(c, x, y, rr, 3, rc);
      p(c, x - rr, y - 6 - k, 1, 3, rc);
      p(c, x + rr - 1, y - 9 + k, 1, 3, rc);
    }
    const img = monSprite(reg, e, P);
    const frozen = st.frozen > 0;
    let ox = 0, rot = 0, sx = 1, sy = 1;
    const u = P.an ? clamp01(1 - e.wind / a.w0) : 0;
    if (P.an) { sy = 1 - 0.1 * u; sx = 1 + 0.07 * u; if (u > 0.6 && (Math.floor(now * 30) & 1)) ox = 1; } // dồn lực, rung nhẹ
    else if (P.sk === 1) { sx = 1.12; sy = 0.94; ox = 2; }
    else if (P.sk === 2) { sx = 1.06; ox = 1; }
    if (P.lg) { sx = 1.3; sy = 0.84; }
    if (!frozen) {
      if (st.stun > 0) rot = Math.sin(now * 9 + x) * 0.16;
      if (st.root > 0) { ox += W1[Math.floor(now * 14) & 3]; sy *= 1 + 0.06 * Math.sin(now * 14); } // giãy giụa
      if (e.flash > 0) { ox -= 2; rot -= 0.12; } // giật lùi
    }
    c.save();
    c.translate(x, y);
    c.scale(f * sc, sc);
    c.translate(ox, 0);
    if (rot) c.rotate(rot);
    c.scale(sx, sy);
    let main = img;
    if (frozen) {
      // bọc trong lớp băng
      const sh = tinted('t2', img, '#e9f9ff', 1, 'source-in');
      c.drawImage(sh, -MAX - 1, -MAY); c.drawImage(sh, -MAX + 1, -MAY); c.drawImage(sh, -MAX, -MAY - 1);
      main = tinted('t', img, '#a8dcf5', 0.7);
    } else if (e.flash > 0) main = tinted('t', img, '#ffffff', 0.6);
    else if (P.an) {
      // viền đỏ báo đòn, càng gần lúc ra đòn càng chớp gấp
      const hot = u > 0.55 && (Math.floor(now * 20) & 1);
      const sh = tinted('t2', img, hot ? '#ffd27a' : '#d02818', 1, 'source-in');
      c.drawImage(sh, -MAX - 1, -MAY); c.drawImage(sh, -MAX + 1, -MAY); c.drawImage(sh, -MAX, -MAY - 1); c.drawImage(sh, -MAX, -MAY + 1);
      if (hot && u > 0.8) main = tinted('t', img, '#fff0c8', 0.35);
    }
    c.drawImage(main, -MAX, -MAY);
    c.restore();
    const top = y - (e.h || 22) * sc;
    if (P.lg) {
      for (let i = 0; i < 3; i++) p(c, x - f * (13 + i * 6) - (f > 0 ? 7 : 0), y - 5 - i * 3, 8 - i * 2, 1, 'rgba(255,255,255,' + (0.6 - i * 0.15) + ')');
    }
    if (frozen) {
      p(c, x - 7, y - 3, 4, 3, '#bfeaff'); p(c, x + 3, y - 2, 4, 2, '#e9f9ff'); p(c, x - 2, y - 1, 5, 1, '#bfeaff');
      if (Math.floor(now * 4) & 1) { p(c, x + 5, top + 4, 1, 3, WHT); p(c, x + 4, top + 5, 3, 1, WHT); }
    } else {
      if (st.stun > 0) {
        // sao xoay trên đầu
        for (let i = 0; i < 3; i++) { const an = now * 6 + i * 2.09; p(c, Math.round(x + Math.cos(an) * 7) - 1, Math.round(top - 3 + Math.sin(an) * 2) - 1, 2, 2, Math.sin(an) > 0 ? '#ffd23f' : '#b8922a'); }
      }
      if (st.root > 0) {
        // dây leo quấn chân
        p(c, x - 6, y - 4, 2, 4, '#4d6b28'); p(c, x + 4, y - 5, 2, 5, '#4d6b28'); p(c, x - 5, y - 2, 10, 1, '#8fae4a'); p(c, x - 3, y - 5, 1, 2, '#8fae4a'); p(c, x + 2, y - 4, 2, 1, '#8fae4a');
      }
    }
    if (e.wind > 0) {
      // dấu chấm than báo sắp ra đòn
      const ty = top - (e.role === 'elite' ? 8 : 0);
      const cc = Math.floor(now * 10) & 1 ? '#fff3b0' : '#ff4030';
      p(c, x - 2, ty - 15, 4, 7, DARK);
      p(c, x - 2, ty - 7, 4, 4, DARK);
      p(c, x - 1, ty - 14, 2, 5, cc);
      p(c, x - 1, ty - 6, 2, 2, cc);
    }
    A.status(c, e, x, top);
  }

  const MINI = [mini0, mini1, mini2];
  const MNW = 112, MNH = 84, MNX = 56, MNY = 66;
  function miniTop(reg) { return reg === 1 ? 22 : reg === 2 ? 20 : 28; }
  function drawMini(c, b, reg) {
    const x = Math.round(b.x), y = Math.round(b.y), sc = b.scale || 2.4, f = b.face < 0 ? -1 : 1;
    const an = b.anim, st = b.st || ST0, t = b.t || 0, now = G.time;
    const P = { w: -1, br: 0, bl: 0, tl: Math.floor(now * 8) & 3, an: 0, sk: 0, lg: 0, kd: '', roar: b.roarT > 0 ? 1 : 0, f3: Math.floor(now * 10) % 3 };
    let vx = 0, vy = 0, oy = 0, ox = 0, rot = 0, sx = 1, sy = 1, piv = 0, trail = 0, U = 0;
    if (an) {
      P.kd = an.name;
      if (an.fire != null) {
        if (an.t < an.fire) { U = an.t / an.fire; P.an = U < 0.3 ? 1 : U < 0.65 ? 2 : 3; }
        else { const sd = an.t - an.fire; P.sk = sd < 0.1 ? 1 : sd < 0.24 ? 2 : sd < 0.42 ? 3 : 0; }
      } else if (an.name === 'burst' && an.shots.length) {
        const t0 = an.shots[0].land - 0.55;
        if (an.t < t0) { U = an.t / t0; P.an = U < 0.4 ? 1 : U < 0.75 ? 2 : 3; }
        else {
          P.an = 1;
          for (const s of an.shots) { const d0 = an.t - (s.land - 0.55); if (d0 >= 0 && d0 < 0.09) { P.an = 0; P.sk = 1; } }
          if (an.t > an.shots[an.shots.length - 1].land - 0.4) { P.an = 0; if (!P.sk) P.kd = ''; }
        }
      }
      if (an.name === 'slam') {
        if (P.an) {
          if (reg === 2) { rot = -0.34 * smooth(U); piv = -7; } // chồm lên bằng chân sau
          else if (reg === 0) { if (U > 0.5) oy = -15 * Math.sin(((U - 0.5) / 0.5) * Math.PI); else { sy = 1 - 0.08 * U; sx = 1 + 0.06 * U; } }
          else sy = 1 + 0.06 * U;
        } else if (P.sk === 1) { sx = 1.18; sy = 0.82; } else if (P.sk === 2) { sx = 1.08; sy = 0.93; }
      } else if (an.name === 'charge') {
        if (P.an) { ox = -3 * U; sy = 1 - 0.07 * U; sx = 1 + 0.05 * U; if (U > 0.65 && (Math.floor(now * 30) & 1)) ox += 1; }
        else {
          const dd = (an.t - an.fire) / an.dash;
          if (dd < 1) { const k = 1 - easeOut(clamp01(dd)); vx = (an.fx - b.x) * k; vy = (an.fy - b.y) * k; sx = 1.22; sy = 0.9; trail = an.dir * f; }
          else if (dd < 1.6) { sx = 0.92; sy = 1.06; }
        }
      } else if (an.name === 'burst') {
        if (P.an) { sx = sy = 1 + 0.03 * Math.sin(now * 26) + 0.04 * U; } else if (P.sk === 1) { sx = 1.1; sy = 0.92; }
      } else if (an.name === 'summon') {
        vx = Math.floor(now * 30) & 1; sy = 1.04;
      } else if (an.name === 'swipe') {
        if (P.an) { sx = 1 - 0.06 * U; } else if (P.sk === 1) sx = 1.16; else if (P.sk === 2) sx = 1.06;
      }
    } else if (b.wind > 0) P.an = 2;
    if (P.roar) vx += Math.floor(now * 30) & 1;
    if (!P.an && !P.sk && P.kd !== 'summon' && !P.roar) {
      if (b.moving) P.w = Math.floor(t * (RATE.mini)) & 3;
      else { P.br = Math.floor(t * 2) & 1; P.bl = t % 3.7 < 0.14 ? 1 : 0; }
      if (b.exposed > 0) { P.br = Math.floor(t * 7) & 1; P.bl = 1; } // thở dốc sau cú lao
    }
    if (st.stun > 0) { rot += Math.sin(now * 9) * 0.1; P.bl = 1; }
    if (b.flash > 0) ox -= 1;
    A.ellipse(c, x + vx, y + vy, b.r * 1.6 * (oy < 0 ? 0.8 : 1), 8, 'rgba(0,0,0,0.3)');
    const g = scr('mini', MNW, MNH);
    OC = DARK;
    bake(g, MNX, MNY, () => MINI[reg](P));
    let img = g.canvas;
    if (b.flash > 0) img = tinted('t', img, '#ffffff', 0.5);
    c.save();
    c.translate(x + Math.round(vx), y + Math.round(vy) + Math.round(oy * sc));
    c.scale(f * sc, sc);
    c.translate(ox, 0);
    if (rot) { c.translate(piv, 0); c.rotate(rot); c.translate(-piv, 0); }
    c.scale(sx, sy);
    if (trail) {
      // bóng mờ kéo theo sau cú lao
      const sh = tinted('t2', g.canvas, b.el ? G.EL[b.el].col : '#ffffff', 1, 'source-in');
      for (let i = 3; i >= 1; i--) { c.globalAlpha = 0.5 - i * 0.12; c.drawImage(sh, -MNX - trail * i * 9, -MNY); }
      c.globalAlpha = 1;
    }
    if (P.an && !b.flash) {
      const hot = U > 0.55 && (Math.floor(now * 20) & 1);
      const sh = tinted('t2', g.canvas, hot ? '#ffd27a' : '#d02818', 1, 'source-in');
      c.globalAlpha = 0.5 + 0.5 * U;
      c.drawImage(sh, -MNX - 0.5, -MNY); c.drawImage(sh, -MNX + 0.5, -MNY); c.drawImage(sh, -MNX, -MNY - 0.5);
      c.globalAlpha = 1;
    }
    c.drawImage(img, -MNX, -MNY);
    c.restore();
    // đạn hệ bắn vòng cầu của đòn rải
    if (an && an.name === 'burst') {
      const E = G.EL[an.el] || G.EL.fire;
      for (const s of an.shots) lob(c, x, y, miniTop(reg) * sc, s.x, s.y, (an.t - (s.land - 0.55)) / 0.55, 26, E.col, E.col2);
    }
    if (an && an.name === 'summon') {
      // vòng sóng gầm
      const v = clamp01(an.t / 0.6);
      ring(c, x, y - 30, 12 + 40 * v, 8 + 22 * v, 'rgba(255,255,255,' + (0.6 * (1 - v)).toFixed(2) + ')');
    }
    drawFx(c, b);
    const top = y - (b.h || 58);
    if (b.wind > 0) {
      const ty = top + 4;
      const cc = Math.floor(now * 10) & 1 ? '#fff3b0' : '#ff4030';
      p(c, x - 2, ty - 15, 4, 7, DARK);
      p(c, x - 2, ty - 7, 4, 4, DARK);
      p(c, x - 1, ty - 14, 2, 5, cc);
      p(c, x - 1, ty - 6, 2, 2, cc);
    }
    A.status(c, b, x, top);
  }
  function dieMini(c, b, reg) {
    const k = clamp01(b.dying), x = Math.round(b.x), y = Math.round(b.y), sc = b.scale || 2.4, f = b.face < 0 ? -1 : 1;
    const E = b.el ? G.EL[b.el] : null, col = E ? E.col : '#ffffff', col2 = E ? E.col2 : '#ffd27a';
    const P = { w: -1, br: 0, bl: 1, tl: Math.floor(k * 30) & 3, an: 0, sk: 0, lg: 0, kd: '', roar: k < 0.5 ? 1 : 0, f3: k > 0.5 ? 0 : Math.floor(k * 40) % 3 };
    const g = scr('mini', MNW, MNH);
    OC = DARK;
    bake(g, MNX, MNY, () => MINI[reg](P));
    const A0 = 0.42, u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0));
    if (k < 0.92) A.ellipse(c, x, y, b.r * 1.6 * (1 - v * 0.5), 4, 'rgba(0,0,0,' + (0.3 * (1 - v)).toFixed(2) + ')');
    c.save();
    c.translate(x, y);
    // giai đoạn đầu: co giật, loé sáng, phồng lên
    if (k < A0) {
      const sw = 1 + 0.12 * u, fl = Math.abs(Math.sin(u * 14));
      c.translate((Math.floor(k * 70) & 1) * 2 - 1, 0);
      c.scale(f * sc * sw, sc * (sw - 0.05 * Math.sin(u * 20)));
      c.drawImage(tinted('t', g.canvas, '#ffffff', 0.75 * fl), -MNX, -MNY);
      c.restore();
      c.save(); c.translate(x, y - 12 * sc);
      for (let i = 0; i < 3; i++) bits(c, 7, (u - i * 0.3) / 0.4, 34, col, col2, i * 1.9 + 0.5, 18);
      c.restore();
      return;
    }
    c.scale(f * sc, sc);
    if (reg === 0) {
      // mũ nấm bật tung, thân xẹp xuống, bào tử bay mù
      const cut = MNY - 13;
      const sq = 1 - 0.75 * smooth(v);
      const lv = v > 0.85 ? 4 : v > 0.7 ? 3 : v > 0.5 ? 1 : 0;
      const g2 = scr('dz', MNW, MNH); g2.drawImage(g.canvas, 0, 0); dissolve(g2, lv);
      c.save(); c.scale(1 + 0.3 * smooth(v), sq);
      c.drawImage(g2.canvas, 0, cut, MNW, MNH - cut, -MNX, -13, MNW, MNH - cut);
      c.restore();
      c.save();
      c.translate(8 * v, -13 - 15 * Math.sin(Math.min(1, v * 1.25) * Math.PI) + 6 * v);
      c.rotate(-1.3 * v);
      c.drawImage(g2.canvas, 0, 0, MNW, cut, -MNX, -cut + 13 - 13, MNW, cut);
      c.restore();
      c.restore();
      c.save(); c.translate(x, y - 14 * sc);
      bits(c, 14, v, 44, '#8fe04a', '#d05a8e', 0.3, 30);
      bits(c, 10, clamp01(v * 1.3 - 0.2), 30, '#f6e8c8', '#8fe04a', 2.2, 40);
      c.restore();
      return;
    }
    if (reg === 1) {
      // vỡ vụn thành đá và băng
      const cols = 5, rows = 4, x0 = -20, y0 = -26, tw = 8, th = 7;
      const src = v > 0.4 ? tinted('t', g.canvas, '#0c1420', Math.min(0.6, (v - 0.4))) : g.canvas;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const n = i * rows + j, late = hsh(n + 5) * 0.3;
        const vv = clamp01((v - late) / (1 - late));
        if (vv >= 0.96 || (vv > 0.8 && n % 2)) continue;
        const dx = (i - 2) * 7 * easeOut(vv) + (hsh(n) - 0.5) * 6 * vv;
        const up = (rows - j) * 4 + 5 + hsh(n + 9) * 6;
        const ground = (rows - j - 1) * th + 2;
        const dy = Math.min(ground, -up * vv * 1.8 + (up * 1.8 + ground) * vv * vv);
        c.drawImage(src, MNX + x0 + i * tw, MNY + y0 + j * th, tw, th, Math.round(x0 + i * tw + dx), Math.round(y0 + j * th + dy), tw, th);
      }
      c.restore();
      c.save(); c.translate(x, y - 10 * sc);
      bits(c, 16, v, 50, '#7fd4ff', '#e9f9ff', 1.4, 26);
      c.restore();
      return;
    }
    // Hổ Lửa: lửa tắt, hoá tro, đổ nghiêng rồi tan
    const fall = clamp01(v / 0.45);
    const lv = v > 0.9 ? 4 : v > 0.78 ? 3 : v > 0.66 ? 2 : v > 0.55 ? 1 : 0;
    const g2 = scr('dz', MNW, MNH);
    g2.drawImage(tinted('t', g.canvas, '#4a4040', Math.min(0.9, 0.3 + v)), 0, 0);
    dissolve(g2, lv);
    c.rotate(-(Math.PI / 2) * easeIn(fall));
    if (v > 0.45 && v < 0.6) c.translate(-2 * Math.sin(((v - 0.45) / 0.15) * Math.PI), 0);
    c.drawImage(g2.canvas, -MNX, -MNY);
    c.restore();
    c.save(); c.translate(x - f * 14 * sc * fall, y - 8 * sc);
    for (let i = 0; i < 8; i++) {
      // tàn lửa bay lên
      const bu = clamp01(v * 1.5 - i * 0.09);
      if (bu > 0 && bu < 1) p(c, Math.round(-22 + i * 7 + Math.sin(bu * 7 + i) * 4), Math.round(4 - bu * 46), bu < 0.5 ? 2 : 1, bu < 0.5 ? 2 : 1, i % 2 ? '#ff7a2a' : '#ffd23f');
    }
    c.restore();
  }

  A.enemy = function (c, e) {
    if (e.illusion) return A.boss(c, e); // ảo ảnh của Hồ Tinh dùng chung hình cáo
    const reg = region();
    const pc = cx;
    if (e.role === 'mini') { if (e.dying != null) dieMini(c, e, reg); else drawMini(c, e, reg); }
    else if (e.dying != null) dieMon(c, e, reg);
    else drawMon(c, e, reg);
    cx = pc; OUT = false; OC = DARK; QX = 0; QY = 0;
  };
  A.status = function (c, e, x, top) {
    const t = G.time, st = e.st || ST0;
    if (st.fire > 0) {
      const f = Math.floor(t * 12) % 3;
      p(c, x - 4 + f, top - 4, 3, 4, '#ff7a2a');
      p(c, x + 1 - f, top - 6, 2, 5, '#ff7a2a');
      p(c, x - 1, top - 3, 3, 3, '#ffd23f');
      p(c, x + 1 - f, top - 4, 1, 2, '#ffd23f');
    }
    if (st.poisonN > 0) {
      const f = Math.floor(t * 6) % 4;
      for (let i = 0; i < Math.min(5, st.poisonN); i++) {
        const py = top + 2 - ((f + i) % 3);
        p(c, x - 7 + i * 3, py - 1, 4, 4, '#1c3a10');
        p(c, x - 6 + i * 3, py, 2, 2, '#8fe04a');
      }
    }
    if (st.iceN > 0 || st.frozen > 0) {
      const n = Math.max(st.iceN, st.frozen > 0 ? 4 : 0);
      for (let i = 0; i < n; i++) {
        p(c, x - 7 + i * 3, top + 5, 4, 4, '#173a5a');
        p(c, x - 6 + i * 3, top + 6, 2, 2, '#bfeaff');
      }
    }
    if (st.root > 0) {
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
  const hasL = (b, type) => b.layers && b.layers.some((l) => l.type === type);
  const BSP = new Map(); // phần thân tĩnh của trùm, nướng một lần
  function bsprite(key, w, h, ax, ay, fn) {
    let s = BSP.get(key);
    if (s) return s;
    const g = mk(w, h);
    OC = DARK;
    bake(g, ax, ay, fn);
    BSP.set(key, g.canvas);
    return g.canvas;
  }
  const stage3 = (u) => (u < 0.3 ? 1 : u < 0.65 ? 2 : 3);

  // ===== Mộc Tinh =====
  const MCW = 150, MCH = 152, MCX = 75, MCY = 142;
  function mocCols(T) {
    return { bark: T[0], barkD: T[1], barkL: lite(T[0], 0.18), leaf: T[2], leafD: dim(T[2], 0.32), leafL: lite(T[2], 0.22) };
  }
  function mocBack(T, leafy) {
    return bsprite('mocB' + T[0] + T[2] + leafy, MCW, MCH, MCX, MCY, () => {
      const C = mocCols(T);
      // rễ phụ rủ xuống kiểu cây đa
      d(-31, -98, 1, 62, C.barkD); d(-27, -96, 1, 74, C.barkD); d(29, -96, 1, 66, C.barkD); d(34, -100, 1, 48, C.barkD);
      if (leafy) {
        qe(-34, -106, 22, 12, C.leafD);
        qe(34, -106, 22, 12, C.leafD);
        qe(0, -110, 40, 14, C.leafD);
      } else {
        // cành trụi lá khi nổi giận
        seg(-10, -96, -30, -124, 4, C.barkD); seg(-22, -112, -38, -116, 3, C.barkD); seg(-30, -124, -26, -132, 2, C.barkD);
        seg(8, -96, 26, -122, 4, C.barkD); seg(18, -110, 34, -112, 3, C.barkD); seg(26, -122, 30, -130, 2, C.barkD);
        seg(0, -96, 2, -130, 4, C.barkD); seg(1, -118, -8, -128, 2, C.barkD);
        d(-39, -119, 3, 2, C.leaf); d(33, -115, 3, 2, C.leaf); d(-9, -131, 3, 2, C.leaf);
      }
    });
  }
  function mocTrunk(T) {
    return bsprite('mocT' + T[0], MCW, MCH, MCX, MCY, () => {
      const C = mocCols(T), bark = C.bark, barkD = C.barkD, barkL = C.barkL;
      q(-30, -8, 60, 8, barkD);
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
      d(-3, -64, 6, 8, barkD); d(-3, -64, 2, 6, barkL);
    });
  }
  function mocCanopy(T) {
    return bsprite('mocC' + T[2], MCW, MCH, MCX, MCY, () => {
      const C = mocCols(T), leaf = C.leaf, leafD = C.leafD, leafL = C.leafL;
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
    });
  }
  // Dán hình theo từng dải ngang, dải càng cao càng lệch: thân nghiêng mà điểm ảnh vẫn vuông.
  function shearBlit(c, img, lean, y0, y1, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    if (!lean) { c.drawImage(img, 0, MCY + y0, MCW, y1 - y0, -MCX + dx, y0 + dy, MCW, y1 - y0); return; }
    for (let y = y0; y < y1; y += 8) {
      const h = Math.min(8, y1 - y);
      const o = Math.round((lean * Math.max(0, -(y + 4))) / 124);
      c.drawImage(img, 0, MCY + y, MCW, h, -MCX + o + dx, y + dy, MCW, h);
    }
  }
  const lxAt = (lean, y) => Math.round((lean * Math.max(0, -y)) / 124);
  // Cánh tay cành: vai S, khuỷu E, bàn H; ngón xoè theo hướng khuỷu tới bàn.
  function mocArm(S, E, H, col, colL, grip) {
    seg(S[0], S[1], E[0], E[1], 6, col);
    seg(E[0], E[1], H[0], H[1], 5, col);
    const dx = H[0] - E[0], dy = H[1] - E[1], l = Math.max(1, Math.hypot(dx, dy)), ux = dx / l, uy = dy / l;
    const fl = grip ? 5 : 9;
    for (let i = -1; i <= 1; i++) {
      const fx = ux * fl - uy * i * 5, fy = uy * fl + ux * i * 5;
      seg(H[0], H[1], Math.round(H[0] + fx), Math.round(H[1] + fy), 2, col);
    }
    d(E[0] - 2, E[1] - 3, 4, 1, colL);
  }
  // Trạng thái hoạt ảnh của Mộc Tinh ở thời điểm hiện tại.
  function mocState(b, t) {
    const an = b.dying != null ? null : b.anim, w = G.getWorld() || {};
    const ry = Math.round(Math.sin(t * 2) * 3), ly = Math.round(Math.sin(t * 1.6 + 1) * 2);
    const S = {
      lean: Math.sin(t * 0.9) * 1.2, jx: 0, dy: 0, mouth: Math.sin(t * 1.3) > 0.6 ? 1 : 0, eye: t % 4.2 < 0.14 ? 2 : 0,
      LE: [-40, -80 + (ly >> 1)], LH: [-58, -54 + ly], RE: [40, -84], RH: [52, -62 - ry],
      whip: null, canX: 0, canY: Math.sin(t * 1.3) > 0 ? 0 : 1, th: 1, footL: 0, footR: 0, glow: 0, grip: 0,
    };
    if (b.exposed > 0) { S.lean = -3; S.mouth = 2; S.eye = 3; S.LE = [-42, -66]; S.LH = [-62, -34]; S.canY = 2; }
    if (b.walking && !an) {
      // lết từng bước: nghiêng qua lại, rễ hai bên thay nhau nhấc lên
      const s = Math.sin(t * 5.2);
      S.lean = s * 3.5; S.footL = s > 0.3 ? 1 : 0; S.footR = s < -0.3 ? 1 : 0; S.dy = Math.abs(s) > 0.75 ? -1 : 0;
      S.LH = [-58 + Math.round(s * 4), -54 - Math.round(s * 3)]; S.RH = [52 + Math.round(s * 4), -62 + Math.round(s * 3)];
    }
    if (an) {
      const a = an.t;
      if (an.name === 'sweep') {
        const F = an.fire, zc = Math.round((an.y0 + an.y1) / 2 - b.y), far = Math.round(Math.min(-120, an.x0 - b.x + 30));
        if (a < F) {
          // vung tay ra sau lấy đà
          const k = smooth(clamp01(a / (F * 0.7))), qv = a > F * 0.7 ? (Math.floor(t * 30) & 1) : 0;
          S.lean = 6 * k; S.eye = 1; S.mouth = k > 0.5 ? 0 : S.mouth;
          S.LE = [Math.round(lerp(-40, -50, k)), Math.round(lerp(-80, -112, k))];
          S.LH = [Math.round(lerp(-58, -22, k)) + qv, Math.round(lerp(-54, -156, k))];
          S.front = 1;
          S.RE = [42, -78]; S.RH = [56, -52];
          S.glow = k;
        } else if (a < F + 0.12) {
          // quất ngang qua nửa sân
          const v = (a - F) / 0.12, e = easeOut(v);
          S.lean = lerp(6, -8, e); S.eye = 1; S.mouth = 2;
          S.whip = { pts: [[-22, -72], [Math.round(lerp(-50, -52, e)), Math.round(lerp(-112, zc - 16, e))], [Math.round(lerp(-36, far * 0.5, e)), Math.round(lerp(-140, zc - 6, e))], [Math.round(lerp(-22, far, e)), Math.round(lerp(-156, zc, e))]], v, zc, far, smear: 1 };
          S.front = 1;
        } else if (a < F + 0.5) {
          const v = (a - F - 0.12) / 0.38, sh = v < 0.3 ? (Math.floor(t * 30) & 1) : 0;
          S.lean = lerp(-8, -4, v); S.mouth = 2; S.eye = 1;
          S.whip = { pts: [[-22, -72], [-52, zc - 16 + sh], [Math.round(far * 0.5), zc - 6 - sh], [far, zc]], v: 1, zc, far, dust: v };
        } else {
          // thu tay về
          const v = smooth(clamp01((a - F - 0.5) / 0.45));
          S.lean = lerp(-4, -3, v);
          S.whip = { pts: [[-22, -72], [Math.round(lerp(-52, -42, v)), Math.round(lerp(zc - 16, -66, v))], [Math.round(lerp(far * 0.5, -52, v)), Math.round(lerp(zc - 6, -50, v))], [Math.round(lerp(far, -62, v)), Math.round(lerp(zc, -34, v))]], v: 1, zc, far };
        }
      } else if (an.name === 'roots') {
        // cắm hai tay xuống đất, bơm rễ
        const k = smooth(clamp01(a / 0.2)), out = smooth(clamp01((an.dur - a) / 0.3)), m = Math.min(k, out);
        const pump = Math.round(Math.sin(a * 16) * 3);
        S.jx = m > 0.5 ? (Math.floor(t * 30) & 1) * 2 - 1 : 0; S.lean = -2 * m; S.eye = 1; S.mouth = 0; S.dy = m > 0.5 && pump > 1 ? 1 : 0;
        S.LE = [Math.round(lerp(-40, -46, m)), Math.round(lerp(-80, -56, m))]; S.LH = [Math.round(lerp(-58, -50, m)), Math.round(lerp(-54, -8 + pump, m))];
        S.RE = [Math.round(lerp(40, 46, m)), Math.round(lerp(-84, -56, m))]; S.RH = [Math.round(lerp(52, 50, m)), Math.round(lerp(-62, -8 - pump, m))];
        S.grip = 1; S.pump = m;
      } else if (an.name === 'fruit') {
        // rung cành cho quả rụng
        const k = clamp01(1 - a / 0.75), up = smooth(clamp01(a / 0.15)) * smooth(clamp01((an.dur - a) / 0.3));
        S.canX = k > 0 ? Math.round(Math.sin(a * 50) * 3 * k) : 0;
        S.jx = k > 0.4 ? (Math.floor(t * 30) & 1) : 0; S.eye = 1;
        S.LE = [Math.round(lerp(-40, -44, up)), Math.round(lerp(-80, -94, up))]; S.LH = [Math.round(lerp(-58, -50, up)) + S.canX, Math.round(lerp(-54, -116, up))];
        S.RE = [Math.round(lerp(40, 44, up)), Math.round(lerp(-84, -94, up))]; S.RH = [Math.round(lerp(52, 50, up)) + S.canX, Math.round(lerp(-62, -116, up))];
        S.grip = 1;
      } else if (an.name === 'summon') {
        S.roar = clamp01(a / 0.75);
      } else if (an.name === 'thorn') {
        // gốc xù gai
        const u = clamp01(a / an.fire), post = a - an.fire;
        S.th = post < 0 ? 1 + 0.9 * smooth(u) + ((Math.floor(t * 30) & 1) ? 0.12 : 0) : post < 0.15 ? 2.5 : Math.max(1, 2.5 - (post - 0.15) * 5);
        S.lean = -2 * u; S.dy = post >= 0 && post < 0.15 ? 2 : u > 0.5 ? 1 : 0; S.eye = 1; S.mouth = post >= 0 && post < 0.3 ? 2 : 0;
        S.jx = post < 0 && u > 0.6 ? (Math.floor(t * 30) & 1) : 0;
        S.LE = [-46, -54]; S.LH = [-58, -12]; S.RE = [46, -54]; S.RH = [58, -12]; S.grip = 1;
      }
    }
    if (b.roarT > 0 && b.dying == null) S.roar = Math.max(S.roar || 0, clamp01(1 - b.roarT / 1.2)), S.big = 1;
    if (S.roar > 0 && S.roar < 1) {
      // gầm: ngả ra sau rồi chồm tới, miệng há to
      const r = S.roar;
      S.lean = r < 0.2 ? 5 * (r / 0.2) : lerp(5, -5, smooth(clamp01((r - 0.2) / 0.25))) * (r > 0.8 ? (1 - r) / 0.2 : 1);
      S.mouth = 3; S.eye = 1; S.jx = r > 0.2 && r < 0.85 ? (Math.floor(t * 30) & 1) * 2 - 1 : 0;
      if (!an || an.name === 'summon') {
        const k = smooth(clamp01(r / 0.25)) * (r > 0.8 ? (1 - r) / 0.2 : 1);
        S.LE = [Math.round(lerp(-40, -48, k)), Math.round(lerp(-80, -94, k))]; S.LH = [Math.round(lerp(-58, -70, k)), Math.round(lerp(-54, -112, k))];
        S.RE = [Math.round(lerp(40, 48, k)), Math.round(lerp(-84, -94, k))]; S.RH = [Math.round(lerp(52, 70, k)), Math.round(lerp(-62, -114, k))];
      }
    }
    if (b.st && b.st.stun > 0 && b.dying == null) { S.eye = 3; S.lean += Math.sin(t * 9) * 2; }
    if (b.flash > 0) S.lean += 1.5;
    return S;
  }
  // Mặt, miệng và lõi nhựa (vẽ lên thân, không viền).
  function mocFace(b, T, S, t, dead) {
    const C = mocCols(T), barkD = C.barkD, barkL = C.barkL;
    QX = lxAt(S.lean, -70);
    const ec = dead > 0.6 ? '#3a2a1a' : S.eye === 1 ? '#ffd23f' : '#ffb030';
    d(-17, -70, 12, 7, BLK); d(5, -70, 12, 7, BLK);
    const br = S.eye === 1 ? 1 : 0; // cau mày khi ra đòn
    d(-19, -75, 7, 3, barkD); d(-13, -73 + br, 9, 3, barkD);
    d(12, -75, 7, 3, barkD); d(4, -73 + br, 9, 3, barkD);
    if (S.eye === 2) { d(-15, -66, 6, 1, barkD); d(6, -66, 6, 1, barkD); }
    else if (S.eye === 3) { d(-15, -67, 5, 2, '#a8641e'); d(6, -67, 5, 2, '#a8641e'); }
    else {
      d(-15, -68, 5, 4, ec); d(6, -68, 5, 4, ec);
      d(-15, -67, 2, 2, dead > 0.6 ? '#5a4020' : '#fff0a0'); d(6, -67, 2, 2, dead > 0.6 ? '#5a4020' : '#fff0a0');
      if (S.eye === 1 && !dead) { d(-18, -68, 2, 1, '#ff8a20'); d(12, -68, 2, 1, '#ff8a20'); }
    }
    // miệng: o là độ há thêm
    QX = lxAt(S.lean, -44);
    const o = S.mouth === 3 ? 5 : S.mouth === 2 ? 2 : S.mouth === 1 ? 1 : 0;
    d(-13, -50 - o, 26, 16 + o * 2, BLK);
    d(-16, -47 - o, 3, 9 + o * 2, BLK); d(13, -47 - o, 3, 9 + o * 2, BLK);
    const dark = dead != null && dead > 0.33;
    if ((b.exposed > 0 || (dead != null && dead <= 0.33 && (Math.floor(t * 20) & 1))) && !dark) {
      const f = Math.floor(t * 8) % 2;
      d(-8, -48, 16, 12, '#ff8a20');
      d(-6, -47, 12, 10, '#ffb030');
      d(-3, -45, 6, 6, '#fff0a0');
      d(-11 - f, -44, 3, 4, '#ff8a20'); d(8 + f, -44, 3, 4, '#ff8a20');
      d(-1, -52 - f, 2, 3, '#ffd23f');
      d(-12, -33 + o, 24, 1, '#ffb030'); d(-8, -32 + o, 16, 1, '#ff8a20');
    } else if (dark) {
      d(-3, -46, 6, 6, '#1a1210'); d(-2, -45, 2, 2, '#2a1c14');
    } else {
      const pl = S.glow > 0.5 || S.mouth === 3 ? 1 : 0; // lõi rực lên khi dồn sức
      d(-3 - pl, -46 - pl, 6 + pl * 2, 6 + pl * 2, pl ? '#a86a1e' : '#6a400e');
      d(-2, -45, 2 + pl, 2 + pl, pl ? '#ffb030' : '#a86a1e');
    }
    for (let i = 0; i < 5; i++) {
      d(-12 + i * 5, -50 - o, 3, 3 + (i % 2) * 2, barkL);
      d(-11 + i * 5, -37 + o - ((i + 1) % 2) * 2, 3, 3 + ((i + 1) % 2) * 2, barkL);
    }
    QX = 0;
  }
  // Dấu hiệu kháng hệ trên thân và tán.
  function mocMarks(b, el, t, S, leafy) {
    QX = lxAt(S.lean, -60);
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
      QX = lxAt(S.lean, -118) + S.canX; QY = S.canY;
      if (leafy) for (let i = 0; i < 7; i++) d(-40 + ((i * 23) % 80), -122 + ((i * 11) % 18), 2, 1, Math.floor(t * 3 + i) % 2 ? '#ff7a2a' : '#a8320a');
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
      d(-22, -60, 3, 2, '#bfeaff'); d(16, -44, 4, 2, '#bfeaff'); d(-8, -26, 5, 2, '#bfeaff');
      if (Math.floor(t * 3) % 2) { d(-14, -84, 1, 3, WHT); d(-15, -83, 3, 1, WHT); d(15, -34, 1, 3, WHT); d(14, -33, 3, 1, WHT); }
      QX = 0;
      d(-30, -9, 60, 2, '#e9f9ff'); d(-39, -6, 8, 1, '#e9f9ff'); d(30, -6, 8, 1, '#e9f9ff');
      QX = lxAt(S.lean, -118) + S.canX; QY = S.canY;
      if (leafy) {
        de(-22, -126, 16, 3, '#e9f9ff'); de(22, -126, 16, 3, '#e9f9ff'); de(0, -131, 16, 3, '#e9f9ff');
        for (let i = 0; i < 6; i++) d(-50 + i * 19, -103 + ((i * 3) % 4), 2, 4 + ((i * 7) % 5), '#bfeaff');
      }
    }
    QX = 0; QY = 0;
  }
  // Lá rơi: n lá, v là tiến độ 0..1, spread là độ toả ngang.
  function leaves(c, n, v, col, col2, spread, seed, fall) {
    if (v <= 0 || v >= 1) return;
    for (let i = 0; i < n; i++) {
      const h1 = hsh(i + seed), h2 = hsh(i * 3 + seed + 5);
      const vv = clamp01(v * 1.3 - h2 * 0.3);
      if (vv <= 0 || vv >= 1) continue;
      const x = (h1 - 0.5) * 100 + (h1 - 0.5) * spread * vv + Math.sin(vv * 9 + i) * 5;
      const y = -128 + h2 * 26 + (fall || 110) * vv * vv - 10 * vv;
      p(c, Math.round(x), Math.round(y), 2 + (i & 1), 1 + ((i >> 1) & 1), i % 3 ? col : col2);
    }
  }
  function mocDraw(c, b, T, el, t) {
    const C = mocCols(T), leafy = b.phase < 1;
    const dying = b.dying != null ? clamp01(b.dying) : null;
    const S = mocState(b, t);
    const an = dying != null ? null : b.anim;
    if (dying != null) return mocDie(c, b, T, el, t, S, dying);
    A.ellipse(c, 0, 0, 46, 10, 'rgba(0,0,0,0.35)');
    const pcx = cx;
    c.save();
    c.translate(S.jx, S.dy);
    const flash = b.flash > 0;
    const tintOf = (img, slot) => (flash ? tinted(slot, img, '#fff6dc', 0.2) : img);
    shearBlit(c, tintOf(mocBack(T, leafy), 'mb'), S.lean, -MCY, -20, leafy ? 0 : S.canX);
    cx = c; OC = DARK;
    const lS = lxAt(S.lean, -72);
    const leftArm = () => {
      if (S.whip) {
        // tay vươn dài thành roi dây
        const P = S.whip.pts;
        seg(P[0][0] + lS, P[0][1], P[1][0], P[1][1], 6, C.barkD);
        seg(P[1][0], P[1][1], P[2][0], P[2][1], 5, C.barkD);
        seg(P[2][0], P[2][1], P[3][0], P[3][1], 4, C.barkD);
        seg(P[3][0], P[3][1], P[3][0] - 9, P[3][1] - 4, 2, C.barkD); seg(P[3][0], P[3][1], P[3][0] - 10, P[3][1] + 2, 2, C.barkD); seg(P[3][0], P[3][1], P[3][0] - 5, P[3][1] + 6, 2, C.barkD);
        for (let i = 1; i < 6; i++) { const k = i / 6, lx = Math.round(lerp(P[1][0], P[3][0], k)), ly = Math.round(lerp(P[1][1], P[3][1], k)); d(lx, ly - 5, 3, 2, i % 2 ? C.leaf : C.leafL); }
      } else mocArm([-22 + lS, -72], S.LE, S.LH, C.barkD, C.barkL, S.grip);
    };
    const drawArms = () => {
      if (!S.front) leftArm();
      mocArm([22 + lS, -72], S.RE, S.RH, C.barkD, C.barkL, S.grip);
      // rễ hai bên gốc (nhấc lên khi bước)
      q(-39 - S.footL * 2, -5 - S.footL * 3, 10, 5, C.barkD); q(-46 - S.footL * 3, -2 - S.footL * 3, 8, 2, C.barkD);
      q(29 - S.footR * 2, -5 - S.footR * 3, 10, 5, C.barkD); q(38 - S.footR * 2, -2 - S.footR * 3, 8, 2, C.barkD);
      if (S.pump) {
        // rễ gồ lên từng nhịp quanh gốc
        for (let i = 0; i < 5; i++) { const h = Math.round((2 + 3 * Math.abs(Math.sin(t * 16 + i * 1.3))) * S.pump); q(-52 + i * 24 + (i > 2 ? 6 : 0), -h, 7, h, C.barkD); }
      }
    };
    if (S.whip && S.whip.smear) {
      // vệt mờ theo đường quất
      const P = S.whip.pts;
      for (let i = 1; i <= 3; i++) {
        const k = 1 - i * 0.22;
        A.line(c, Math.round(lerp(-50, P[1][0], k)), Math.round(lerp(-112, P[1][1], k)), Math.round(lerp(-22, P[3][0], k)), Math.round(lerp(-156, P[3][1], k * k)), 'rgba(255,246,220,' + (0.4 - i * 0.1) + ')', 2);
      }
    }
    OUT = true; QX = QY = 0; drawArms(); OUT = false; drawArms();
    shearBlit(c, tintOf(mocTrunk(T), 'mt'), S.lean, -104, 4);
    if (leafy) shearBlit(c, tintOf(mocCanopy(T), 'mc'), S.lean, -MCY, -94, S.canX, S.canY);
    mocFace(b, T, S, t, null);
    mocMarks(b, el, t, S, leafy);
    if (S.front) { OUT = true; QX = QY = 0; leftArm(); OUT = false; leftArm(); } // tay đang vung thì vẽ đè lên tán
    // gai dưới gốc chống áp sát (hoặc khi đang ra đòn gai)
    const thornOn = hasL(b, 'antiMelee') || (an && an.name === 'thorn');
    if (thornOn) {
      const th = S.th;
      const thorns = () => {
        for (let i = 0; i < 9; i++) {
          const tx = -47 + i * 11, k = i % 2, sp = Math.round((i - 4) * (th - 1) * 2.5);
          const h1 = Math.round((5 + k) * th), h2 = Math.round((4 + k) * th), h3 = Math.round((3 + k) * th);
          q(tx + sp, -h1, 5, h1, '#d8cfa8');
          q(tx + 1 + sp, -h1 - h2 + 1, 3, h2, '#d8cfa8');
          q(tx + 2 + sp, -h1 - h2 - h3 + 2, 1, h3, '#f4eed0');
          d(tx + 3 + sp, -h1 - h2 + 2, 1, h1 + h2 - 2, '#9a906a');
        }
      };
      OUT = true; thorns(); OUT = false; thorns();
    }
    // rèm lá chống đánh xa
    if (hasL(b, 'antiRanged')) {
      const vines = () => {
        for (let i = 0; i < 5; i++) {
          const s = Math.round(Math.sin(t * 1.5 + i * 1.3) * 2) + (S.canX >> 1), vx = -70 + i * 5, len = 98 - ((i * 13) % 20);
          q(vx, -112, 3, len >> 1, C.leafD);
          q(vx + s, -112 + (len >> 1), 3, len >> 1, C.leafD);
          for (let j = 0; j < 7; j++) d(vx - 1 + (j % 2) * 2 + (j > 3 ? s : 0), -108 + j * 13 + ((i * 5) % 7), 3, 2, j % 2 ? C.leaf : C.leafL);
        }
        q(-74, -116, 30, 5, C.leafD);
        d(-72, -116, 12, 1, C.leafL);
      };
      OUT = true; vines(); OUT = false; vines();
    }
    OC = DARK;
    c.restore();
    // lá rơi lác đác; khi trụi lá vẫn còn vài chiếc bay
    if (!leafy) {
      for (let i = 0; i < 3; i++) {
        const ly = (t * 16 + i * 37) % 110;
        p(c, Math.round(-34 + i * 30 + Math.sin(t * 2 + i) * 5), Math.round(-122 + ly), 2, 1, C.leaf);
      }
    } else leaves(c, 2, (t * 0.35) % 1, C.leaf, C.leafL, 20, Math.floor(t * 0.35));
    if (S.roar > 0 && S.roar < 1) {
      // sóng gầm toả ra từ miệng, lá rụng lả tả
      const mx = lxAt(S.lean, -44);
      for (let i = 0; i < 3; i++) {
        const v = clamp01((S.roar - 0.22 - i * 0.14) / 0.45);
        if (v > 0 && v < 1) ring(c, mx - 14 - 60 * v, -42, 5 + 12 * v, 10 + 22 * v, 'rgba(255,246,220,' + (0.7 * (1 - v)).toFixed(2) + ')');
      }
      leaves(c, S.big ? 26 : 12, S.roar, C.leaf, C.leafL, S.big ? 190 : 60, 3, S.big ? 150 : 110);
    }
    if (an && an.name === 'fruit') leaves(c, 6, clamp01(an.t / 0.9), C.leaf, C.leafL, 30, 11);
    if (S.whip && S.whip.dust != null) {
      // bụi đất dọc đường roi quất
      const v = S.whip.dust;
      for (let i = 0; i < 9; i++) {
        const px = Math.round(lerp(-50, S.whip.far, i / 8)), h = hsh(i + 1);
        const vv = clamp01(v * 1.6 - h * 0.3);
        if (vv > 0 && vv < 1) { p(c, px + Math.round((h - 0.5) * 10), Math.round(S.whip.zc - 4 - 16 * vv + 10 * vv * vv), 2, 2, 'rgba(230,214,170,' + (0.9 * (1 - vv)).toFixed(2) + ')'); p(c, px + 5, Math.round(S.whip.zc - 2 - 9 * vv), 1, 1, '#8a6a44'); }
      }
    }
    if (b.walking && !an) {
      const s = Math.sin(t * 5.2), v = Math.abs(s) < 0.3 ? 1 - Math.abs(s) / 0.3 : 0;
      if (v > 0) { const fx = s > 0 ? 36 : -44; p(c, fx - 4, -2 - Math.round(v * 3), 2, 2, 'rgba(230,214,170,0.7)'); p(c, fx + 8, -1 - Math.round(v * 4), 2, 1, 'rgba(230,214,170,0.6)'); }
    }
    cx = pcx;
  }
  // Phần vẽ theo toạ độ thế giới của Mộc Tinh: ụ đất chạy tới chỗ rễ trồi, quả bay.
  function mocWorld(c, b, T) {
    const an = b.anim;
    if (!an || b.dying != null) return;
    if (an.name === 'roots') {
      for (const h of an.hits) {
        const u = (an.t - h.t) / h.fire;
        if (u < 0 || u >= 1) continue;
        const sx = b.x - 40, sy = b.y - 2, e = easeIn(u);
        const mx = Math.round(lerp(sx, h.x, e)), my = Math.round(lerp(sy, h.y, e));
        // vệt nứt và ụ đất chạy ngầm tới mục tiêu
        for (let i = 0; i < 10; i++) { const k = (i / 10) * e; if ((i + Math.floor(an.t * 20)) % 3) p(c, Math.round(lerp(sx, h.x, k)), Math.round(lerp(sy, h.y, k)) + (i % 2), 3, 1, 'rgba(30,18,12,0.7)'); }
        p(c, mx - 4, my - 2, 9, 3, '#3a2416'); p(c, mx - 3, my - 4, 6, 2, '#5a3a22'); p(c, mx - 1, my - 5, 3, 1, '#8a6040');
        if (u > 0.75) { const f = Math.floor(an.t * 30) & 1; p(c, Math.round(h.x) - 6 + f * 2, Math.round(h.y) - 3 - f, 2, 2, '#5a3a22'); p(c, Math.round(h.x) + 4 - f * 2, Math.round(h.y) - 2 - f, 2, 2, '#8a6040'); }
      }
    } else if (an.name === 'fruit') {
      const lx = lxAt(Math.sin(G.time * 0.9) * 1.2, -118);
      an.shots.forEach((s, i) => {
        const t0 = 0.22 + i * 0.06, sx = b.x - 32 + i * 16 + lx, z0 = 112 - (i % 2) * 6;
        if (an.t < t0) {
          // quả chín dần trên tán
          const k = clamp01(an.t / t0), r = k > 0.6 ? 2 : 1;
          p(c, Math.round(sx) - r - 1, Math.round(b.y - z0) - r - 1, r * 2 + 2, r * 2 + 2, DARK);
          p(c, Math.round(sx) - r, Math.round(b.y - z0) - r, r * 2, r * 2, '#8fe04a');
          p(c, Math.round(sx) - r, Math.round(b.y - z0) - r, 1, 1, '#e9ffd0');
        } else lob(c, sx, b.y, z0, s.x, s.y, (an.t - t0) / (s.land - t0), 34, '#8fe04a', '#e9ffd0', 1);
      });
    }
  }
  // Mộc Tinh gục: nứt toác, lõi tắt, thân tách đôi rồi đổ sang hai bên.
  const MOC_CRACK = [[0, -44], [-3, -56], [2, -66], [-2, -78], [3, -90], [0, -100], [0, -44], [3, -34], [-2, -24], [2, -12], [0, 0]];
  function mocDie(c, b, T, el, t, S, k) {
    const C = mocCols(T), leafy = b.phase < 1;
    const A0 = 0.42, u = clamp01(k / A0), v = clamp01((k - A0) / (1 - A0));
    A.ellipse(c, 0, 0, 46 + 20 * v, 5, 'rgba(0,0,0,' + (0.35 * (1 - v * 0.6)).toFixed(2) + ')');
    // ghép cả thân vào một khung để tách đôi
    const g = scr('mocAll', MCW, MCH);
    const S2 = Object.assign({}, S, { lean: 0, jx: 0, dy: 0, mouth: 3, eye: k > 0.3 ? 3 : 1, canX: 0, canY: Math.round(4 * u), roar: 0, whip: null });
    g.drawImage(mocBack(T, leafy), 0, 0);
    g.drawImage(mocTrunk(T), 0, 0);
    if (leafy) g.drawImage(mocCanopy(T), 0, S2.canY);
    const pc = cx;
    cx = g; g.setTransform(1, 0, 0, 1, MCX, MCY); OUT = false; QX = QY = 0;
    mocFace(b, T, S2, t, k);
    // vết nứt lan từ lõi ra
    const n = Math.round((MOC_CRACK.length - 1) * clamp01(u * 1.3));
    for (let i = 0; i < n; i++) {
      if (i === 5) continue;
      const a0 = MOC_CRACK[i], a1 = MOC_CRACK[i + 1];
      seg(a0[0], a0[1], a1[0], a1[1], 2, k < 0.33 ? '#ffb030' : '#1a1210');
      if (k < 0.33) seg(a0[0], a0[1], a1[0], a1[1], 1, '#fff0a0');
      if (i % 2) seg(a1[0], a1[1], a1[0] + (i % 4 === 1 ? 7 : -7), a1[1] - 4, 1, k < 0.33 ? '#ffb030' : '#1a1210');
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    cx = pc;
    let img = g.canvas;
    if (k < 0.36 && k > 0.3) img = tinted('mt', img, '#ffffff', 0.7); // loé sáng lúc lõi tắt
    else if (k >= 0.36) img = tinted('mt', img, '#120c0c', Math.min(0.55, 0.25 + v * 0.4));
    if (v > 0.82) { const g2 = scr('mocDz', MCW, MCH); g2.drawImage(img, 0, 0); dissolve(g2, v > 0.94 ? 3 : v > 0.88 ? 2 : 1); img = g2.canvas; }
    if (k < A0) {
      const j = (Math.floor(t * 30) & 1) * 2 - 1;
      c.drawImage(img, -MCX + j * (u > 0.5 ? 2 : 1), -MCY);
      // tay buông thõng
      cx = c; const lh = Math.round(lerp(-54, -22, u));
      const arms = () => { mocArm([-22, -72], [-42, Math.round(lerp(-80, -62, u))], [-56, lh], C.barkD, C.barkL, 0); mocArm([22, -72], [42, Math.round(lerp(-84, -62, u))], [56, lh], C.barkD, C.barkL, 0); };
      OUT = true; arms(); OUT = false; arms(); cx = pc;
    } else {
      // hai nửa đổ sang hai bên, nảy nhẹ khi chạm đất
      const fall = easeIn(clamp01(v / 0.62));
      const bounce = v > 0.62 && v < 0.8 ? Math.sin(((v - 0.62) / 0.18) * Math.PI) * 0.06 : 0;
      const ang = (Math.PI / 2 - 0.12) * fall - bounce;
      c.save(); c.translate(-27, 0); c.rotate(-ang); c.drawImage(img, 0, 0, MCX, MCH, -MCX + 27, -MCY, MCX, MCH); c.restore();
      c.save(); c.translate(27, 0); c.rotate(ang * 0.92); c.drawImage(img, MCX, 0, MCW - MCX, MCH, -27, -MCY, MCW - MCX, MCH); c.restore();
      // gốc cụt còn lại và khói từ lõi
      p(c, -27, -7, 54, 7, DARK); p(c, -26, -6, 52, 6, dim(C.barkD, 0.3)); p(c, -8, -9, 5, 3, dim(C.barkD, 0.3)); p(c, 6, -10, 4, 4, dim(C.barkD, 0.3));
      for (let i = 0; i < 7; i++) {
        const bu = clamp01(v * 1.6 - i * 0.1);
        if (bu > 0 && bu < 1) p(c, Math.round(-12 + i * 4 + Math.sin(bu * 6 + i) * 5), Math.round(-10 - bu * 70), bu < 0.4 ? 3 : 2, bu < 0.4 ? 3 : 2, bu < 0.25 ? '#ffb030' : i % 2 ? '#5a4a44' : '#3a302c');
      }
      if (v > 0.6) { c.save(); c.translate(-80, -6); bits(c, 10, (v - 0.6) / 0.4, 34, '#8a6a44', C.leaf, 0.6, 16); c.translate(160, 0); bits(c, 10, (v - 0.6) / 0.4, 34, '#8a6a44', C.leaf, 2.6, 16); c.restore(); }
    }
    leaves(c, leafy ? 30 : 8, clamp01(k * 1.15), C.leaf, C.leafL, 150, 7, 150);
    c.save(); c.translate(0, -50); for (let i = 0; i < 3; i++) bits(c, 8, (u - i * 0.3) / 0.45, 46, '#ffb030', C.barkL, i * 2.2 + 0.4, 20); c.restore();
  }

  // ===== Ngư Tinh =====
  const NGW = 190, NGH = 124, NGX = 96, NGY = 100;
  function nguSpike(sx, by, h, col, tip) {
    q(sx, by - (h >> 1), 5, (h >> 1) + 2, col);
    q(sx + 1, by - h + 2, 3, h >> 1, col);
    q(sx + 2, by - h, 1, 3, col);
    if (tip) d(sx + 2, by - h, 1, (h >> 1), tip);
  }
  // Thân tĩnh: lưng, mình, đầu trên, vảy.
  function nguBodySprite(T, el) {
    return bsprite('ngu' + T[0] + (el || ''), NGW, NGH, NGX, NGY, () => {
      const body = T[0], dk = T[1], sc = lite(T[0], 0.22), belly = mix(T[0], '#f4f0dc', 0.6);
      q(42, -28, 10, 14, body);
      q(-22, -44, 60, 5, dk);
      qe(4, -22, 42, 19, body);
      de(2, -12, 38, 9, belly);
      d(-12, -40, 34, 1, sc);
      q(-60, -34, 30, 28, body);
      q(-55, -38, 27, 5, body);
      q(-64, -31, 6, 8, body);
      d(-64, -25, 28, 1, dk);
      for (let i = 0; i < 12; i++) {
        const sx = -8 + ((i * 23) % 46), sy = -35 + ((i * 11) % 15);
        d(sx, sy, 3, 1, sc); d(sx + 3, sy + 1, 1, 1, sc);
      }
      if (el === 'ice') for (let i = 0; i < 6; i++) { d(-34 + i * 13, -36 + ((i * 5) % 6), 5, 4, dk); d(-34 + i * 13, -36 + ((i * 5) % 6), 5, 1, sc); }
    });
  }
  // Ghép cả con cá vào khung tạm theo tư thế S rồi trả về khung.
  function nguCompose(b, T, el, t, S) {
    const body = T[0], dk = T[1], sc = lite(T[0], 0.22), fin = mix(T[1], T[2], 0.6);
    const g = scr('ngu', NGW, NGH);
    OC = DARK;
    bake(g, NGX, NGY, () => {
      // đuôi chẻ đôi: quẫy ngang (tw), vểnh lên khi sắp đập (tr)
      const tw = S.tw, tr = S.tr;
      q(49, -31 - (tr >> 2), 5, 20, fin);
      q(53 + (tw >> 1), -37 - (tr >> 1), 5, 32, fin);
      q(57 + tw, -43 - tr, 4, 16, fin); q(57 + tw, -17 - tr, 4, 16, fin);
      q(60 + tw, -47 - tr - (tr >> 2), 3, 12, fin); q(60 + tw, -10 - tr - (tr >> 2), 3, 10, fin);
      d(51, -28 - (tr >> 1), 9 + tw, 1, dk); d(51, -21 - (tr >> 1), 7 + tw, 1, dk); d(51, -14 - (tr >> 1), 9 + tw, 1, dk);
      // gai lưng
      for (let i = 0; i < 6; i++) nguSpike(-24 + i * 11, -43, 8 + ((i * 5) % 4) + Math.round(S.up * (0.8 + 0.2 * ((i * 3) % 2))), S.red ? '#e0563a' : dk, S.red ? '#fff0c0' : sc);
    });
    g.drawImage(nguBodySprite(T, el), 0, 0);
    bake(g, NGX, NGY, () => {
      const j = S.jaw;
      // hàm dưới hạ xuống j điểm
      q(-68, -14 + j, 36, 9, dk);
      q(-64, -5 + j, 28, 3, dk);
      d(-60, -12 + j, 26, 2, lite(T[1], 0.15));
      d(-64, -24, 27, 10 + j, '#2a0f14');
      d(-58, -17 + j, 16, 3, '#8a2434');
      if (S.puff) { d(-40, -22, 5, 12, lite(T[0], 0.25)); q(-38, -8 + j, 8, 4, body); }
      for (let i = 0; i < 6; i++) {
        d(-62 + i * 4, -24, 2, 3 + ((i + 1) % 2) * 2, WHT);
        const h = 3 + (i % 2) * 2;
        d(-64 + i * 4, -14 - h + j, 2, h, WHT);
      }
      d(-64, -24, 3, 6, WHT);
      q(-68, -21 + j, 3, 7, WHT);
      d(-67, -15 + j, 2, 1, '#c8c8c8');
      if (S.glowMouth) { d(-60, -20, 18, 4 + j, '#7fd4ff'); d(-58, -19, 12, 2 + j, '#e9f9ff'); }
      // mắt: 0 thường, 1 dữ, 2 lờ đờ, 3 đã gục
      d(-53, -36, 9, 8, '#101a22');
      if (S.eye === 3) { d(-52, -35, 7, 6, '#c8c8b8'); d(-51, -34, 5, 1, BLK); d(-49, -35, 1, 5, BLK); }
      else {
        d(-52, -35, 7, 6, S.eye === 1 ? '#ff9a3a' : '#ffe14a');
        d(-51 + S.look, -35, 3, 6, '#1a0808');
        d(-47, -35, 1, 1, WHT);
        if (S.eye === 2) d(-52, -35, 7, 3, dk);
        if (S.blink) d(-52, -35, 7, 6, dk);
      }
      d(-56, -37 + (S.eye === 1 ? 1 : 0), 5, 2, dk); d(-52, -38 + (S.eye === 1 ? 1 : 0), 9, 2, dk);
      // mang phát sáng, phập phồng
      const ex = S.gill === 2, gp = ex && Math.floor(t * 8) % 2;
      const gl = ex ? (gp ? '#ffffff' : '#bff0ff') : S.gill === 1 ? '#6fc8f0' : '#3fa8d8';
      if (ex) { d(-31, -34, 20, 22, 'rgba(127,212,255,0.35)'); d(-29, -36, 16, 26, 'rgba(127,212,255,0.25)'); }
      for (let i = 0; i < 3; i++) {
        const gx = -28 + i * 5, w = S.gill ? 3 : 2;
        d(gx, -30, w, 14, gl);
        d(gx + 1, -32, 2, 3, gl);
        d(gx + 1, -17, 2, 3, gl);
        if (!ex) d(gx, -30, 1, 14, '#1c6a98');
      }
      // vây ngực
      const pf = S.pf;
      q(-12, -12 + pf, 12, 5, fin); q(-6, -8 + pf * 2, 12, 4, fin);
      d(-10, -10 + pf, 14, 1, dk);
      if (el === 'poison') for (let i = 0; i < 8; i++) d(-50 + ((i * 31) % 100), -48 + ((i * 13 + Math.floor(t * 6)) % 44), 2 + (i % 2), 2 + (i % 2), '#f2f7f7');
      if (el === 'fire') for (let i = 0; i < 6; i++) d(-44 + ((i * 37) % 90), -52 - ((i * 7 + Math.floor(t * 8)) % 12), 3, 2, 'rgba(232,251,255,0.6)');
    });
    return g.canvas;
  }
  // Vây lưng rẽ nước khi cá đang lặn; x, y là toạ độ thế giới.
  function nguFin(c, x, y, T, t, small, shake) {
    const fx = Math.round(Math.sin(t * 3) * 3) + (shake ? (Math.floor(t * 30) & 1) : 0), f = Math.floor(t * 6) % 2;
    x = Math.round(x); y = Math.round(y);
    c.save();
    c.translate(x, y);
    if (!small) A.ellipse(c, 0, 3, 46, 6, 'rgba(8,18,34,0.4)'); else A.ellipse(c, 0, 2, 16, 3, 'rgba(8,18,34,0.4)');
    two(c, () => {
      {
        q(-6 + fx, -4, 13, 4, T[1]); q(-4 + fx, -9, 9, 5, T[1]); q(-2 + fx, -13, 6, 4, T[1]); q(1 + fx, -17, 2, 4, T[1]);
        d(-3 + fx, -8, 1, 6, lite(T[1], 0.25)); d(0 + fx, -12, 1, 9, lite(T[1], 0.25));
      }
    });
    const w = small ? 14 : 34;
    p(c, -(w >> 1), -1, w, 2, 'rgba(210,240,252,0.8)');
    p(c, -(w >> 1) - 8 - f * 2, 1, 10, 1, 'rgba(210,240,252,0.6)');
    p(c, (w >> 1) - 2 + f * 2, 1, 10, 1, 'rgba(210,240,252,0.6)');
    if (!small) p(c, -12 + f * 3, 3, 8, 1, 'rgba(210,240,252,0.4)');
    c.restore();
  }
  // Nước bắn toé tại (x, y): v là tiến độ 0..1.
  function splash(c, x, y, v, r, n) {
    if (v <= 0 || v >= 1) return;
    x = Math.round(x); y = Math.round(y);
    ring(c, x, y, r * (0.4 + 0.6 * easeOut(v)), r * 0.35 * (0.4 + 0.6 * easeOut(v)), 'rgba(225,245,255,' + (0.9 * (1 - v)).toFixed(2) + ')');
    c.save(); c.translate(x, y - 4); bits(c, n || 12, v, r * 0.9, '#bfeaff', '#ffffff', r * 0.13, 30); c.restore();
    const h = Math.round(r * 0.5 * Math.sin(Math.min(1, v * 1.6) * Math.PI));
    if (h > 1) { p(c, x - 7, y - h, 4, h, '#e9f9ff'); p(c, x + 3, y - Math.round(h * 0.7), 4, Math.round(h * 0.7), '#bfeaff'); p(c, x - 2, y - Math.round(h * 1.2), 3, Math.round(h * 1.2), '#ffffff'); }
  }
  // Dán con cá ra màn hình: (x, y) là điểm mặt nước dưới bụng, rot xoay quanh giữa thân, clipY cắt phần chìm dưới nước.
  function nguBlit(c, img, x, y, o) {
    c.save();
    if (o.clipY != null) { c.beginPath(); c.rect(x - 260, o.clipY - 300, 520, 300); c.clip(); }
    c.translate(Math.round(x + (o.dx || 0)), Math.round(y + (o.dy || 0)));
    c.scale(o.flip ? -1 : 1, 1);
    if (o.rot) { c.translate(o.px || 0, o.py == null ? -20 : o.py); c.rotate(o.rot); c.translate(-(o.px || 0), -(o.py == null ? -20 : o.py)); }
    if (o.sx || o.sy) { c.translate(0, -22); c.scale(o.sx || 1, o.sy || 1); c.translate(0, 22); }
    if (o.alpha != null) c.globalAlpha = o.alpha;
    c.drawImage(img, -NGX, -NGY);
    c.restore();
  }
  function nguFoam(c, x, y, t, k) {
    const f = Math.floor(t * 5) % 2;
    if (k) {
      A.ellipse(c, x, y, 70, 6, 'rgba(8,18,34,0.35)');
      A.ellipse(c, x, y, 66, 5, 'rgba(120,190,225,0.5)');
      return;
    }
    p(c, x - 62 + f * 3, y - 2, 14, 1, 'rgba(225,245,255,0.8)');
    p(c, x - 30 - f * 2, y + 1, 18, 1, 'rgba(225,245,255,0.6)');
    p(c, x + 8 + f * 3, y - 1, 16, 1, 'rgba(225,245,255,0.8)');
    p(c, x + 38 - f * 2, y + 2, 14, 1, 'rgba(225,245,255,0.6)');
  }
  function nguDraw(c, b, T, el, t) {
    const x = Math.round(b.x), y = Math.round(b.y), W = G.getWorld() || {}, cam = W.cam || 0;
    const dying = b.dying != null ? clamp01(b.dying) : null;
    const an = dying != null ? null : b.anim, a = an ? an.t : 0;
    const flip = b.face > 0;
    // tư thế mặc định: bơi tại chỗ, nhấp nhô, há ngậm miệng, mang phập phồng
    const S = {
      tw: Math.round(Math.sin(t * 3) * 2), tr: 0, up: 0, red: false, jaw: Math.round(1.6 + 1.6 * Math.sin(t * 2.3)), puff: 0, glowMouth: 0,
      eye: 0, look: Math.sin(t * 0.7) > 0.8 ? 1 : 0, blink: t % 3.9 < 0.12, gill: Math.sin(t * 2.3) > 0.3 ? 1 : 0, pf: Math.floor(t * 4) % 2,
    };
    const O = { dy: Math.round(Math.sin(t * 1.7) * 2), dx: 0, rot: 0, flip, clipY: y + 4 };
    let body = true, fin = null, foam = true;
    const post = []; // phần vẽ sau thân (nước bắn, đạn nước...)
    if (b.spikes) { S.up = 9; S.red = true; }
    if (b.exposed > 0) {
      // nổi lên thở dốc, lộ mang
      S.jaw = Math.round(5 + 3 * Math.sin(t * 10)); S.eye = 2; S.gill = 2; O.dy += 2; S.tw = Math.round(Math.sin(t * 8) * 2);
      const v = (t * 1.6) % 1;
      post.push(() => { p(c, x - 74 - Math.round(v * 12), y - 22 - Math.round(v * 10), 2, 2, 'rgba(225,245,255,' + (0.8 * (1 - v)).toFixed(2) + ')'); p(c, x - 70 - Math.round(v * 8), y - 14 - Math.round(v * 16), 1, 1, 'rgba(225,245,255,0.7)'); });
    }
    if (b.st && b.st.stun > 0) { S.eye = 2; O.rot = Math.sin(t * 9) * 0.04; }
    const surface = (v) => {
      // trồi lên khỏi mặt nước
      O.dy = Math.round(44 * (1 - easeOut(clamp01(v))) - 6 * Math.sin(clamp01(v) * Math.PI));
      O.rot = 0.18 * (1 - clamp01(v)); S.jaw = 7;
      post.push(() => splash(c, x - 10, y, v, 64, 18));
    };
    const dive = (v) => {
      // chúi đầu lặn xuống
      O.rot = -0.55 * easeOut(v); O.dy = Math.round(52 * easeIn(v)); O.dx = -Math.round(10 * v); S.jaw = 0; S.tr = Math.round(8 * v);
      post.push(() => splash(c, x - 30, y, v, 50, 12));
    };
    if (an) {
      if (an.name === 'spout') {
        // ngửa đầu, phồng má rồi phun từng bọc nước
        const first = an.shots.length ? an.shots[0].land - 0.5 : 0.35, last = an.shots.length ? an.shots[an.shots.length - 1].land - 0.5 : 0.5;
        const up = smooth(clamp01(a / first)) * smooth(clamp01((an.dur - a) / 0.4));
        O.rot = 0.3 * up; O.px = 30; O.py = -8; S.eye = 1;
        S.jaw = 0; S.puff = a < first ? 1 : 0;
        if (a >= first && a < last + 0.12) { S.jaw = 6; S.glowMouth = 1; }
        for (const s of an.shots) { const d0 = a - (s.land - 0.5); if (d0 >= 0 && d0 < 0.07) { O.dx = 3; S.jaw = 9; } }
        const mx = x + (flip ? 1 : -1) * 54, mz = 30 + 26 * up;
        post.push(() => { for (const s of an.shots) lob(c, mx, y, mz, s.x, s.y, (a - (s.land - 0.5)) / 0.5, 30, '#7fd4ff', '#e9f9ff'); });
      } else if (an.name === 'wave') {
        // vểnh đuôi lên rồi đập xuống tạo sóng
        for (const s of an.slaps) {
          const pre = a - (s - 0.55), aft = a - s;
          if (pre >= 0 && aft < 0) { const r = smooth(clamp01(pre / 0.45)); S.tr = Math.round(11 * r); O.rot = -0.1 * r; O.px = -20; S.eye = 1; if (pre > 0.45) O.dx = Math.floor(t * 30) & 1; }
          else if (aft >= 0 && aft < 0.45) {
            const r = clamp01(aft / 0.12);
            S.tr = Math.round(lerp(11, -6, easeOut(r))) * (aft < 0.25 ? 1 : 0); O.rot = 0.06 * (1 - clamp01(aft / 0.3)); O.dy += aft < 0.15 ? 2 : 0; S.jaw = 6;
            const tx = x + (flip ? -1 : 1) * 58;
            post.push(() => { splash(c, tx, y, aft / 0.45, 46, 16); const v = aft / 0.45; p(c, Math.round(lerp(tx, x - 50, easeOut(v))) - 6, y + 2, 12, 1, 'rgba(225,245,255,' + (0.8 * (1 - v)).toFixed(2) + ')'); p(c, Math.round(lerp(tx, x - 50, easeOut(v))) - 3, y + 5, 8, 1, 'rgba(225,245,255,0.5)'); });
          }
        }
      } else if (an.name === 'spikes') {
        // gai dựng dần rồi bung ra
        const u = clamp01(a / an.fire), aft = a - an.fire;
        S.red = true; S.eye = 1;
        if (aft < 0) { S.up = 10 * smooth(u) + ((Math.floor(t * 30) & 1) ? 1 : 0); O.dx = u > 0.5 ? (Math.floor(t * 30) & 1) : 0; O.dy += Math.round(2 * u); }
        else if (aft < 0.14) { S.up = 24; O.dy -= 2; S.jaw = 8; }
        else { S.up = Math.max(0, 24 * (1 - (aft - 0.14) / 0.25)); S.red = aft < 0.3; }
        if (aft >= 0 && aft < 0.22) {
          const v = aft / 0.22, zx = an.zx, zy = an.zy, r = an.r;
          post.push(() => {
            for (let i = 0; i < 16; i++) {
              const ang = i * 0.3927 + 0.2, r0 = r * (0.25 + 0.7 * v), r1 = r * (0.4 + 0.7 * v);
              A.line(c, Math.round(zx + Math.cos(ang) * r0), Math.round(zy - 14 * (1 - v) + Math.sin(ang) * r0 * 0.6), Math.round(zx + Math.cos(ang) * r1), Math.round(zy - 14 * (1 - v) + Math.sin(ang) * r1 * 0.6), i % 2 ? '#fff0c0' : '#e0563a', 1);
            }
          });
        }
      } else if (an.name === 'charge' || an.name === 'dive') {
        body = false; foam = false;
        if (a < an.dive) { body = true; dive(a / an.dive); }
        else if (a >= an.up) {
          body = true; foam = true;
          const v = (a - an.up) / 0.4;
          if (v < 1) surface(v);
        } else if (a > an.up - 0.35) fin = [x, y, false, a > an.up - 0.12];
        if (an.name === 'charge') {
          for (const r of an.rows) {
            const tt = a - r.t;
            if (tt < 0) continue;
            const uu = tt / r.fire, D = 0.36;
            const xs = r.dir < 0 ? cam + 500 : cam - 20, xe = r.dir < 0 ? cam - 90 : cam + 570;
            if (uu < 1) {
              // vây lượn vào đầu hàng, rung lên trước khi lao
              const fx = xs + r.dir * (26 + 44 * smooth(uu));
              fin = [fx, r.y, false, uu > 0.7];
              post.push(() => { for (let i = 0; i < 4; i++) { const k = (uu * 3 + i * 0.25) % 1; p(c, Math.round(fx - r.dir * (14 + k * 30)), Math.round(r.y - 3 + (i % 2) * 5), 6, 1, 'rgba(225,245,255,' + (0.7 * (1 - k)).toFixed(2) + ')'); } });
            } else if (tt < r.fire + D + 0.25) {
              // cả thân vọt qua hàng, nước rẽ thành vệt
              const vv = (tt - r.fire) / D;
              const bx = lerp(xs + r.dir * 40, xe, vv);
              post.push(() => {
                for (let i = 0; i < 14; i++) {
                  const sx = lerp(xs, xe, i / 13);
                  if ((r.dir < 0 ? sx < bx : sx > bx)) continue;
                  const age = clamp01((tt - r.fire) / (D + 0.25) - (i / 13) * 0.5);
                  const h = hsh(i + 3);
                  p(c, Math.round(sx), Math.round(r.y - 2 + h * 6), 16, 1, 'rgba(225,245,255,' + (0.85 * (1 - age)).toFixed(2) + ')');
                  p(c, Math.round(sx + h * 10), Math.round(r.y - 6 - 22 * age + 30 * age * age - h * 6), 2, 2, 'rgba(191,234,255,' + (0.9 * (1 - age)).toFixed(2) + ')');
                  p(c, Math.round(sx + 8 - h * 6), Math.round(r.y - 3 - 14 * age + 20 * age * age), 1, 1, '#ffffff');
                }
                if (vv < 1) {
                  const S2 = Object.assign({}, S, { jaw: 9, eye: 1, tw: Math.round(Math.sin(t * 40) * 3), up: 4, gill: 1 });
                  let img = nguCompose(b, T, el, t, S2);
                  const o2 = { flip: r.dir > 0, dy: -Math.round(12 * Math.sin(vv * Math.PI)) + 6, rot: 0.14 * Math.cos(vv * Math.PI), clipY: r.y + 5, sx: 1.08, sy: 0.94 };
                  A.ellipse(c, bx, r.y, 60, 5, 'rgba(8,18,34,0.3)');
                  nguBlit(c, tinted('t2', img, '#e9f9ff', 1, 'source-in'), bx - r.dir * 26, r.y, Object.assign({}, o2, { alpha: 0.3 }));
                  nguBlit(c, img, bx, r.y, o2);
                  p(c, Math.round(bx + r.dir * 60) - 8, Math.round(r.y) - 1, 16, 2, '#ffffff');
                  p(c, Math.round(bx + r.dir * 50) - 6, Math.round(r.y) + 3, 12, 1, '#e9f9ff');
                }
              });
            }
          }
        } else if (an.tx != null) {
          const tx = Math.round(an.tx), ty = Math.round(an.ty), tt = a - an.dive;
          if (a < an.fire) {
            // bóng đen lớn dần dưới chân, vây lượn vòng
            const u = clamp01(tt / (an.fire - an.dive));
            post.push(() => {
              A.ellipse(c, tx, ty, 8 + 20 * u, 4 + 11 * u, 'rgba(8,18,34,' + (0.4 + 0.35 * u).toFixed(2) + ')');
              ring(c, tx, ty, 8 + 20 * u, 4 + 11 * u, 'rgba(160,220,250,0.7)');
              for (let i = 0; i < 3; i++) { const k = (a * 1.8 + i * 0.33) % 1; p(c, tx - 12 + i * 11 + Math.round(Math.sin(a * 5 + i) * 3), ty - Math.round(k * 12), 2, 2, 'rgba(225,245,255,' + (0.8 * (1 - k)).toFixed(2) + ')'); }
            });
            const ang = a * 7;
            fin = [tx + Math.cos(ang) * 20 * (1 - u * 0.5), ty + Math.sin(ang) * 9 * (1 - u * 0.5), true, u > 0.75];
          } else if (a < an.fire + 0.45) {
            // vọt thẳng lên từ dưới chân người chơi
            const vv = (a - an.fire) / 0.45;
            const rise = vv < 0.4 ? lerp(70, -14, easeOut(vv / 0.4)) : lerp(-14, 90, easeIn((vv - 0.4) / 0.6));
            post.push(() => {
              const S2 = Object.assign({}, S, { jaw: vv < 0.5 ? 9 : 3, eye: 1, up: 5, tw: Math.round(Math.sin(t * 30) * 3) });
              const img = nguCompose(b, T, el, t, S2);
              c.save();
              c.beginPath(); c.rect(tx - 80, ty - 260, 160, 264); c.clip();
              c.translate(tx + (vv > 0.4 ? Math.round((vv - 0.4) * 10) : 0), ty + Math.round(rise));
              c.rotate(Math.PI / 2 + 0.2 * (vv - 0.4));
              c.drawImage(img, -NGX, -NGY + 22);
              c.restore();
              splash(c, tx, ty, vv, 44, 20);
              if (vv > 0.55) splash(c, tx + 6, ty, (vv - 0.55) / 0.45, 36, 10);
            });
          }
        }
      }
    } else if (b.hidden && dying == null) { body = false; foam = false; fin = [x, y, false, false]; }
    if (b.roarT > 0 && dying == null && body) {
      // gầm lúc nước dâng
      const r = 1 - b.roarT / 1.2, k = smooth(clamp01(r / 0.2)) * smooth(clamp01((1 - r) / 0.25));
      O.rot += 0.22 * k; O.px = 30; O.py = -8; S.jaw = Math.round(9 * k); S.eye = 1; O.dx += k > 0.6 ? (Math.floor(t * 30) & 1) : 0; S.up = Math.max(S.up, 6 * k);
      post.push(() => { for (let i = 0; i < 3; i++) { const v = clamp01((r - 0.15 - i * 0.15) / 0.45); if (v > 0 && v < 1) ring(c, x - 70 - 50 * v, y - 36, 5 + 12 * v, 10 + 20 * v, 'rgba(225,245,255,' + (0.7 * (1 - v)).toFixed(2) + ')'); } });
    }
    if (dying != null) {
      // quẫy đạp, lật ngửa bụng rồi chìm dần
      const k = dying;
      S.jaw = 8; S.eye = 3; S.gill = 0; S.up = 0; S.red = false; S.blink = false;
      O.sy = 1;
      if (k < 0.45) { const u = k / 0.45; O.rot = Math.sin(u * 22) * 0.3 * (1 - u * 0.6); O.dy = Math.round(-6 * Math.abs(Math.sin(u * 22))); S.tw = Math.round(Math.sin(u * 40) * 4); S.eye = 1; post.push(() => { for (let i = 0; i < 3; i++) splash(c, x - 40 + i * 44, y, (u * 3 - i * 0.8) % 1, 40, 10); }); }
      else if (k < 0.68) { const u = (k - 0.45) / 0.23; O.sy = Math.cos(u * Math.PI); if (Math.abs(O.sy) < 0.12) O.sy = O.sy < 0 ? -0.12 : 0.12; O.dy = Math.round(u * 6); }
      else { const u = (k - 0.68) / 0.32; O.sy = -1; O.dy = 6 + Math.round(60 * easeIn(u)); O.rot = 0.12 * u; post.push(() => { for (let i = 0; i < 7; i++) { const bu = clamp01(u * 1.7 - i * 0.1); if (bu > 0 && bu < 1) p(c, x - 50 + i * 16 + Math.round(Math.sin(bu * 8 + i) * 4), y - 2 - Math.round(bu * 34), bu < 0.6 ? 3 : 2, bu < 0.6 ? 3 : 2, 'rgba(225,245,255,' + (0.9 * (1 - bu)).toFixed(2) + ')'); } ring(c, x, y, 30 + 40 * u, 4 + 5 * u, 'rgba(225,245,255,' + (0.7 * (1 - u)).toFixed(2) + ')'); }); }
      O.sx = 1;
    }
    if (foam) nguFoam(c, x, y, t, true);
    if (body) {
      let img = nguCompose(b, T, el, t, S);
      if (b.flash > 0 && dying == null) img = tinted('t', img, '#fff6dc', 0.35);
      else if (dying != null && dying > 0.45) img = tinted('t', img, '#c8d8e0', Math.min(0.45, (dying - 0.45)));
      nguBlit(c, img, x, y, O);
    }
    if (foam) nguFoam(c, x, y, t, false);
    if (fin) nguFin(c, fin[0], fin[1], T, t, fin[2], fin[3]);
    for (const f of post) f();
    drawFx(c, b);
  }

  // ===== Hồ Tinh =====
  const HOW = 190, HOH = 140, HOX = 90, HOY = 108;
  // Vị trí bàn chân theo từng dáng: [trước-xa, trước-gần, sau-gần, sau-xa], mỗi chân [x, y].
  const HO_RUN = [
    [[-25, -3], [-21, -1], [19, -1], [23, -3]],
    [[-17, 0], [-12, 0], [14, -4], [18, -5]],
    [[-9, 0], [-5, -1], [3, 0], [7, 0]],
    [[-21, -5], [-16, -6], [13, 0], [18, 0]],
  ];
  const HO_AIR1 = [[-27, -5], [-23, -3], [21, -2], [25, -4]], HO_AIR2 = [[-22, 2], [-18, 3], [19, -8], [23, -9]];
  // P: tư thế. Vẽ cáo quay mặt sang trái, chân chạm đất tại y = 0.
  function hoBody(b, T, t, P) {
    const fur = T[0], sh = T[1], ac = T[2];
    const n = P.n, s = P.s;
    // chín đuôi xòe hình quạt; đuôi bị kéo trễ theo hướng ngược chiều chuyển động
    const tc = P.tipCol || (b.tailEl ? G.EL[b.tailEl].col : ac), tc2 = P.tipCol2 || (b.tailEl ? G.EL[b.tailEl].col2 : lite(T[2], 0.4));
    for (let i = 0; i < n; i++) {
      let deg = -42 + (-62 + (i * 124) / 8) * P.fan;
      if (P.ring > 0) deg = lerp(deg, i * 40 + P.spin, P.ring);
      const a = (deg * Math.PI) / 180, a2 = a + (Math.sin(t * 2 + i) * 10 * Math.PI) / 180 * (1 - P.ring);
      let ux = Math.cos(a), uy = Math.sin(a), vx = Math.cos(a2), vy = Math.sin(a2);
      if (P.lag) {
        ux += P.lagX * 0.6; uy += P.lagY * 0.6; vx += P.lagX * 1.3; vy += P.lagY * 1.3;
        const l1 = Math.hypot(ux, uy) || 1, l2 = Math.hypot(vx, vy) || 1; ux /= l1; uy /= l1; vx /= l2; vy /= l2;
      }
      const L = P.tlen;
      const mx = Math.round(16 + ux * 14 * L), my = Math.round(-18 + s + uy * 14 * L);
      const ex = Math.round(16 + vx * 31 * L), ey = Math.round(-18 + s + vy * 31 * L);
      seg(16, -18 + s, mx, my, 3, i % 2 ? sh : fur);
      seg(mx, my, ex, ey, 5, i % 2 ? sh : fur);
      if (!OUT) seg(mx, my, ex, ey, 3, fur);
      const fl = P.flare > 0.3 ? 1 : 0;
      q(ex - 2 - fl, ey - 2 - fl, 5 + fl * 2, 5 + fl * 2, tc);
      d(ex - 1, ey - 1, 2 + fl, 2 + fl, P.flare > 0.6 ? WHT : tc2);
      if (P.flare > 0.15 || P.big) { const f = (Math.floor(t * 12) + i) % 3; d(ex - 1 + f, ey - 5 - fl - f, 2, 2, tc); if (fl) d(ex + 1 - f, ey - 7 - f, 1, 2, tc2); }
    }
    // chân
    const F = P.feet;
    const hy = -11 + s;
    if (F) {
      seg(-13, hy, F[0][0], F[0][1] - 1, 3, sh); seg(8, hy, F[3][0], F[3][1] - 1, 3, sh);
    } else {
      q(-15, -11 + s, 3, 11 - s, sh); q(7, -11 + s, 3, 11 - s, sh);
    }
    // thân
    const ar = P.arch;
    q(-14, -23 + s - ar, 30, 11 + ar, fur);
    q(8, -25 + s, 11, 13, fur);
    q(-19, -26 + s, 8, 12, fur);
    d(-10, -14 + s, 20, 2, sh);
    d(-18, -16 + s, 5, 2, sh); d(-17, -14 + s, 3, 2, sh);
    d(-6, -23 + s - ar, 14, 1, lite(T[0], 0.5));
    if (P.big) {
      // lông dựng ngược khi hoá cuồng
      for (let i = 0; i < 5; i++) q(-10 + i * 5, -26 + s - ar - ((i + Math.floor(t * 8)) % 2), 2, 3, fur);
      d(-8, -21 + s, 3, 1, ac); d(0, -20 + s, 3, 1, ac); d(7, -21 + s, 3, 1, ac);
    }
    if (F) {
      seg(-7, hy, F[1][0], F[1][1] - 1, 3, fur); seg(14, hy, F[2][0], F[2][1] - 1, 3, fur);
      d(F[1][0] - 1, F[1][1] - 2, 3, 2, ac); d(F[2][0] - 1, F[2][1] - 2, 3, 2, ac);
    } else {
      q(-8, -11 + s, 3, 10 - s, fur); q(14, -11 + s, 3, 10 - s, fur);
      d(-8, -3, 3, 2, ac); d(14, -3, 3, 2, ac);
    }
    // đầu
    QX = P.hx; QY = P.hy;
    q(-27, -34 + s, 13, 11, fur);
    q(-34, -29 + s, 8, 5, fur);
    const eb = P.earBack;
    q(-26 + eb * 2, -40 + s + eb * 2, 4, 7 - eb * 2, fur); q(-19 + eb * 2, -40 + s + eb * 2, 4, 7 - eb * 2, fur);
    q(-25 + eb * 2, -42 + s + eb * 3, 2, 2, fur); q(-18 + eb * 2, -42 + s + eb * 3, 2, 2, fur);
    d(-25 + eb * 2, -39 + s + eb * 2, 2, 5 - eb * 2, ac); d(-18 + eb * 2, -39 + s + eb * 2, 2, 5 - eb * 2, ac);
    d(-35, -29 + s, 2, 2, BLK);
    if (P.mouth) {
      // há miệng: hàm dưới trễ xuống, lộ nanh
      const o = P.mouth;
      q(-33, -24 + s, 7, 1 + o, fur);
      d(-33, -25 + s, 7, 1 + o, MOUTH);
      d(-33, -25 + s, 1, 2, WHT); d(-30, -25 + s, 1, 1, WHT); d(-32, -24 + s + o, 1, 1, WHT);
    } else d(-33, -25 + s, 7, 1, sh);
    if (P.blink) d(-29, -30 + s, 3, 1, sh);
    else {
      d(-29, -31 + s, 3, 2, '#e01818'); d(-28, -31 + s, 1, 2, BLK);
      if (P.big) { d(-30, -32 + s, 5, 1, '#ff5a2a'); d(-26, -32 + s, 4, 1, '#ffd23f'); d(-22, -33 + s, 3, 1, '#ff7a2a'); }
    }
    d(-26, -32 + s, 3, 1, ac); d(-23, -33 + s, 2, 1, ac);
    d(-23, -36 + s, 2, 2, ac);
    d(-21, -27 + s, 3, 1, ac); d(-22, -25 + s, 3, 1, ac);
    if (P.tired) {
      // lộ điểm yếu: thè lưỡi, choáng
      d(-33, -24 + s, 2, 3, '#e05a6a');
      const f = Math.floor(t * 6) % 4;
      d(-30 + f * 4, -46 + (f % 2) * 2, 2, 2, '#ffd23f');
      d(-18 - f * 4, -47 + ((f + 1) % 2) * 2, 2, 2, '#ffd23f');
    }
    QX = QY = 0;
    // đốm linh khí theo hệ kháng
    if (P.orbs) {
      const f = Math.floor(t * 5) % 3;
      d(-40 + f, -44 - f, 2, 2, ac); d(2 - f, -52 + f, 2, 2, ac); d(48, -30 - f * 2, 2, 2, ac);
    }
  }
  function hoPose(n) {
    return { n, s: 0, fan: 1, tlen: 1, ring: 0, spin: 0, lag: 0, lagX: 0, lagY: 0, flare: 0, feet: null, arch: 0, hx: 0, hy: 0, earBack: 0, mouth: 0, blink: false, tired: false, big: false, orbs: false, tipCol: null, tipCol2: null };
  }
  function hoCompose(b, T, t, P) {
    const g = scr('ho', HOW, HOH);
    OC = DARK;
    bake(g, HOX, HOY, () => hoBody(b, T, t, P));
    return g.canvas;
  }
  // Dán cáo: (x, y) là điểm chân trên mặt đất, z là độ cao, o là các phép biến đổi.
  function hoBlit(c, img, x, y, face, scale, o) {
    c.save();
    c.translate(Math.round(x), Math.round(y - (o.z || 0)));
    c.scale((face < 0 ? 1 : -1) * scale, scale);
    if (o.rot) { c.translate(0, -18); c.rotate(o.rot); c.translate(0, 18); }
    if (o.sx || o.sy) c.scale(o.sx || 1, o.sy || 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    c.drawImage(img, -HOX, -HOY);
    c.restore();
  }
  // Đốm lửa hồn bay lên: v là tiến độ 0..1.
  function wisp(c, x, y, v, col, col2, seed) {
    if (v <= 0 || v >= 1) return;
    const px = Math.round(x + Math.sin(v * 7 + seed) * 5), py = Math.round(y - 30 * v);
    const s = v < 0.5 ? 3 : v < 0.8 ? 2 : 1;
    p(c, px - 1, py - 1, s + 2, s + 2, A.hexA(col, 0.5 * (1 - v)));
    p(c, px, py, s, s, col2);
    p(c, px, py + s + 1, 1, 2, A.hexA(col, 0.6 * (1 - v)));
  }
  function hoDraw(c, b, T, el, t) {
    const ill = !!b.illusion;
    const dying = b.dying != null ? clamp01(b.dying) : null;
    const an = dying != null || ill ? null : b.anim, a = an ? an.t : 0;
    const m = b._a || (b._a = { lx: 0, ly: 0, px: b.x, py: b.y, pz: 0, pt: t, tails: b.tails, lost: [] });
    const n0 = b.tails != null ? b.tails : 9;
    const P = hoPose(n0);
    const tired = b.exposed > 0 && !ill;
    let x = b.x, y = b.y, z = 0, face = b.face;
    const O = { rot: 0, sx: 0, sy: 0 };
    let alpha = b.alpha != null ? b.alpha : null;
    let scale = b.big ? 1.5 : 1;
    let tint = null, ghosts = null, show = true;
    const post = [], pre = [];
    P.big = !!b.big; P.orbs = !!el && !ill; P.tired = tired; P.s = tired ? 2 : 0;
    P.blink = !tired && t % 3.1 < 0.12;
    // dáng chạy khi đổi chỗ
    const moving = ill ? b.moving : b.moving && !an;
    if (moving && !tired) {
      const f = Math.floor((b.t || t) * 11) & 3;
      P.feet = HO_RUN[f]; P.arch = f === 2 ? 2 : 0; P.s = f === 0 ? 1 : f === 2 ? -1 : 0; P.earBack = 1; P.hy = f === 1 ? 1 : 0;
    } else if (!tired) P.s = Math.sin(t * 2.6) > 0.5 ? 1 : 0;
    if (ill && b.wind > 0) { P.mouth = 3; P.hx = 2; P.s = 2; P.earBack = 1; } // ảo ảnh sắp cắn
    if (ill && b.fromX != null && (b.t || 0) < 0.6) {
      // ảo ảnh tách ra từ chỗ cáo thật
      const v = clamp01(((b.t || 0) - 0.12) / 0.45), e = easeOut(v);
      x = lerp(b.fromX, b.x, e); y = lerp(b.fromY, b.y, e);
      alpha = 0.35 + 0.35 * v; P.feet = HO_AIR1; P.earBack = 1;
      if ((b.t || 0) < 0.12) tint = ['#ffffff', 0.8];
    }
    if (an) {
      if (an.name === 'pounce') {
        const F = an.fire, c0 = F * 0.45;
        P.blink = false;
        if (a < c0) {
          // thu mình lấy đà
          const k = smooth(a / c0);
          x = an.fx; y = an.fy; P.s = Math.round(5 * k); P.fan = 1 - 0.55 * k; P.hy = Math.round(2 * k); P.hx = -Math.round(2 * k); P.earBack = 1; P.mouth = k > 0.6 ? 1 : 0;
          O.sx = 1 + 0.08 * k; O.sy = 1 - 0.1 * k; O.rot = -0.16 * k; P.tlen = 1 + 0.15 * k;
          P.feet = [[-19 - Math.round(3 * k), 0], [-12 - Math.round(3 * k), 0], [14, 0], [9, 0]];
          if (k > 0.7) x += Math.floor(t * 30) & 1;
        } else if (a < F) {
          // bay theo cung tới chỗ vồ
          const v = (a - c0) / (F - c0);
          x = lerp(an.fx, an.tx, v); y = lerp(an.fy, an.ty, v); z = 34 * Math.sin(v * Math.PI);
          face = an.tx >= an.fx ? 1 : -1;
          P.feet = v < 0.55 ? HO_AIR1 : HO_AIR2; P.earBack = 1; P.mouth = v > 0.5 ? 3 : 1; P.s = -1;
          O.rot = 0.5 * Math.cos(v * Math.PI); O.sx = 1.12; O.sy = 0.92;
          ghosts = [[lerp(an.fx, an.tx, Math.max(0, v - 0.12)), lerp(an.fy, an.ty, Math.max(0, v - 0.12)), 34 * Math.sin(Math.max(0, v - 0.12) * Math.PI), 0.3]];
        } else {
          // đáp xuống, khựng lại
          const w = (a - F) / 0.2;
          if (w < 1) { O.sx = 1 + 0.22 * (1 - w); O.sy = 1 - 0.26 * (1 - w); P.s = Math.round(4 * (1 - w)); P.tired = false; P.mouth = 2; }
          const dv = (a - F) / 0.4;
          post.push(() => { ring(c, b.x, b.y, 10 + 26 * easeOut(clamp01(dv)), 4 + 12 * easeOut(clamp01(dv)), 'rgba(240,230,200,' + (0.8 * (1 - clamp01(dv))).toFixed(2) + ')'); c.save(); c.translate(Math.round(b.x), Math.round(b.y - 3)); bits(c, 10, dv, 30, '#d8cfa8', '#ffffff', 1.9, 12); c.restore(); });
        }
      } else if (an.name === 'fox') {
        // đuôi xoè rộng, đầu ngọn bùng lửa lúc cầu lửa bay ra
        const k = 1 - smooth(clamp01(a / 0.75));
        P.flare = k; P.fan = 1 + 0.45 * k; P.tlen = 1 + 0.25 * k; P.s = Math.round(3 * k); P.blink = false;
        if (k > 0.3) { P.tipCol = '#ff7a2a'; P.tipCol2 = '#ffd23f'; }
        if (a < 0.45) { P.hy = -3; P.hx = 2; P.mouth = 3; }
        const v = a / 0.3;
        post.push(() => { if (v < 1) { ring(c, x - face * 12 * scale, y - 26 * scale, 10 + 30 * easeOut(v), 8 + 22 * easeOut(v), 'rgba(255,200,90,' + (0.9 * (1 - v)).toFixed(2) + ')'); ring(c, x - face * 12 * scale, y - 26 * scale, 6 + 20 * easeOut(v), 5 + 14 * easeOut(v), 'rgba(255,255,255,' + (0.8 * (1 - v)).toFixed(2) + ')'); } });
      } else if (an.name === 'nova') {
        // đuôi xoay thành vòng, thân nhấc lên, rồi nổ theo màu hệ đã học
        const F = an.fire, E = G.EL[an.el] || G.EL.fire;
        P.tipCol = E.col; P.tipCol2 = E.col2; P.blink = false;
        if (a < F) {
          const u = a / F;
          P.ring = smooth(clamp01(u / 0.35)); P.spin = u * u * 900; P.flare = u; z = 12 * smooth(u); P.feet = [[-16, -3], [-9, -2], [13, -2], [8, -3]]; P.hy = -1; P.tlen = 1 + 0.15 * u;
          pre.push(() => { A.ellipse(c, x, y, 20 + 42 * u, (20 + 42 * u) * (G.ZK || 0.6), A.hexA(E.col, 0.12 + 0.15 * u)); for (let i = 0; i < 8; i++) { const ang = i * 0.785 - a * 6, r = 62 * (1 - ((u * 2 + i * 0.13) % 1)); p(c, Math.round(x + Math.cos(ang) * r), Math.round(y + Math.sin(ang) * r * 0.6), 2, 2, E.col2); } });
        } else {
          const w = clamp01((a - F) / 0.35);
          P.ring = 1 - smooth(w); P.spin = 900 + w * 120; P.tlen = 1.55 - 0.55 * w; P.flare = 1 - w; z = 12 * (1 - easeIn(clamp01(w * 2.2))); P.mouth = 3; P.hy = -2;
          if (w > 0.45 && w < 0.8) { O.sx = 1.12; O.sy = 0.88; }
          post.push(() => {
            if (w >= 1) return;
            const r = an.r * (0.3 + 0.7 * easeOut(w));
            ring(c, x, y, r, r * (G.ZK || 0.6), A.hexA(E.col2, 1 - w)); ring(c, x, y, r - 3, r * (G.ZK || 0.6) - 2, A.hexA(E.col, 0.9 * (1 - w))); ring(c, x, y, r * 0.6, r * 0.36, A.hexA(E.col, 0.6 * (1 - w)));
            for (let i = 0; i < 14; i++) { const ang = i * 0.449 + 0.1, r0 = r * 0.75, r1 = r * 1.02; A.line(c, Math.round(x + Math.cos(ang) * r0), Math.round(y - 10 * (1 - w) + Math.sin(ang) * r0 * 0.6), Math.round(x + Math.cos(ang) * r1), Math.round(y - 10 * (1 - w) + Math.sin(ang) * r1 * 0.6), i % 2 ? E.col : E.col2, 2); }
          });
        }
      } else if (an.name === 'illusion') {
        // loé sáng tại chỗ cũ rồi các bóng tách ra
        const v = clamp01((a - 0.12) / 0.45), e = easeOut(v);
        if (a < 0.6) {
          x = lerp(an.fx, b.x, e); y = lerp(an.fy, b.y, e);
          alpha = 0.35 + 0.35 * v; P.feet = HO_AIR1; P.earBack = 1;
          if (a < 0.12) { tint = ['#ffffff', 0.8]; O.sx = 1 + 0.3 * Math.sin((a / 0.12) * Math.PI); }
          pre.push(() => { const r = clamp01(a / 0.4); ring(c, an.fx, an.fy - 16, 8 + 36 * r, 6 + 22 * r, 'rgba(255,255,255,' + (0.9 * (1 - r)).toFixed(2) + ')'); });
        }
      } else if (an.name === 'hop') {
        // nhảy lùi theo cung
        const v = clamp01(a / an.air);
        if (v < 1) {
          x = lerp(an.fx, b.x, smooth(v)); y = lerp(an.fy, b.y, v); z = 16 * Math.sin(v * Math.PI);
          P.feet = HO_AIR2; O.rot = -0.3 * Math.cos(v * Math.PI) - 0.1; P.earBack = 1; P.s = -1;
          ghosts = [[lerp(an.fx, b.x, smooth(Math.max(0, v - 0.2))), y, z * 0.7, 0.25]];
        } else { const w = (a - an.air) / (an.dur - an.air); O.sx = 1 + 0.12 * (1 - w); O.sy = 1 - 0.14 * (1 - w); P.s = 2; }
      } else if (an.name === 'bite') {
        // vụt biến tới sau lưng, vệt nhoè nối hai chỗ, rồi ngoạm
        const F = an.fire;
        P.blink = false;
        if (a < 0.1) {
          show = false;
          const v = a / 0.1;
          post.push(() => { for (let i = 0; i < 5; i++) { const k = i / 4; if (k > v + 0.3) continue; const gx = lerp(an.fx, b.x, k), gy = lerp(an.fy, b.y, k); hoBlit(c, tinted('t2', hoCompose(b, T, t, Object.assign(hoPose(n0), { feet: HO_AIR1, earBack: 1, big: P.big })), '#ffffff', 1, 'source-in'), gx, gy, face, scale, { sx: 1.5, sy: 0.6, alpha: 0.18 + 0.4 * k * v }); } });
        } else if (a < 0.24) {
          const w = (a - 0.1) / 0.14;
          O.sx = lerp(0.3, 1, easeOut(w)); O.sy = lerp(1.35, 1, easeOut(w)); tint = ['#ffffff', 0.9 * (1 - w)];
          pre.push(() => A.line(c, Math.round(an.fx), Math.round(an.fy - 16), Math.round(b.x), Math.round(b.y - 16), 'rgba(255,255,255,' + (0.5 * (1 - w)).toFixed(2) + ')', 2));
        } else if (a < F) {
          const u = (a - 0.24) / (F - 0.24);
          P.s = Math.round(3 * u); P.hx = Math.round(4 * u); P.hy = -Math.round(3 * u); P.mouth = 2 + Math.round(2 * u); P.earBack = 1; P.fan = 1 + 0.2 * u;
          if (u > 0.7) x += Math.floor(t * 30) & 1;
        } else if (a < F + 0.16) {
          const w = (a - F) / 0.16;
          P.hx = -7; P.hy = 2; P.mouth = w < 0.4 ? 3 : 0; P.earBack = 1; O.sx = 1.14; x += face * 5;
          post.push(() => { const jx = Math.round(x + face * 36 * scale), jy = Math.round(y - 27 * scale); if (w > 0.35) { p(c, jx - 4, jy, 9, 1, WHT); p(c, jx, jy - 4, 1, 9, WHT); p(c, jx - 2, jy - 2, 5, 5, 'rgba(255,255,255,0.6)'); } });
        } else { const w = clamp01((a - F - 0.16) / 0.2); P.hx = -Math.round(7 * (1 - w)); x += face * 5 * (1 - w); }
      }
    }
    if (b.roarT > 0 && dying == null && !ill) {
      // tru lên khi đổi giai đoạn; lớn dần lúc hoá cuồng
      const r = 1 - b.roarT / 1.2, k = smooth(clamp01(r / 0.2)) * smooth(clamp01((1 - r) / 0.25));
      if (!an) { P.hy = -Math.round(4 * k); P.hx = Math.round(3 * k); P.mouth = Math.round(4 * k); P.fan = 1 + 0.4 * k; P.flare = Math.max(P.flare, 0.5 * k); P.tired = false; P.blink = false; }
      if (b.big && b.roarPh === 2) { const g = clamp01(r / 0.35); scale = lerp(1, 1.5, easeOut(g)); if (g < 1) tint = ['#ff6a3a', 0.6 * (1 - g)]; }
      post.push(() => { for (let i = 0; i < 3; i++) { const v = clamp01((r - 0.12 - i * 0.15) / 0.45); if (v > 0 && v < 1) ring(c, x, y - 30 * scale, 12 + 50 * v, 8 + 30 * v, A.hexA(T[2], 0.7 * (1 - v))); } });
    }
    if (b.st && b.st.stun > 0 && dying == null) { P.blink = true; O.rot += Math.sin(t * 9) * 0.06; }
    // đuôi trễ theo vận tốc của hình vẽ (tính trong hệ toạ độ quay mặt sang trái)
    const dt = Math.max(1 / 120, Math.min(0.1, t - m.pt));
    if (t !== m.pt) {
      let vx = (x - m.px) / dt, vy = (y - z - (m.py - m.pz)) / dt;
      if (Math.abs(x - m.px) > 40) { vx = 0; vy = 0; }
      const fx = face < 0 ? 1 : -1;
      const k = Math.min(1, dt * 9);
      m.lx += (clamp01(Math.abs(vx) / 110) * -Math.sign(vx) * fx - m.lx) * k;
      m.ly += (Math.max(-1, Math.min(1, -vy / 220)) - m.ly) * k;
      m.px = x; m.py = y; m.pz = z; m.pt = t;
    }
    if (Math.abs(m.lx) > 0.03 || Math.abs(m.ly) > 0.03) { P.lag = 1; P.lagX = m.lx * 1.1; P.lagY = m.ly * 0.9; }
    // mất đuôi khi máu tụt: đuôi vừa mất hoá thành đốm lửa hồn
    if (!ill && dying == null) {
      if (m.tails != null && n0 < m.tails) for (let i = n0; i < m.tails; i++) m.lost.push({ i, t });
      m.tails = n0;
      m.lost = m.lost.filter((o) => t - o.t < 0.7);
    }
    const tipAt = (i) => { const deg = -42 + (-62 + (i * 124) / 8), r = (deg * Math.PI) / 180; return [x - face * (16 + Math.cos(r) * 31) * scale, y - z + (-18 + Math.sin(r) * 31) * scale]; };
    for (const o of m.lost) post.push(() => { const q2 = tipAt(o.i); wisp(c, q2[0], q2[1], (t - o.t) / 0.7, T[2], '#ffffff', o.i); });
    let dz = 0;
    if (dying != null) {
      // đuôi tắt dần từng chiếc, thân khuỵu xuống rồi tan thành đốm lửa hồn
      const k = dying;
      if (ill) { dz = Math.min(5, Math.ceil(k * 6)); alpha = 0.7; tint = ['#ffffff', 0.5]; }
      else {
        const left = k < 0.6 ? Math.ceil(n0 * (1 - k / 0.6)) : 0;
        P.n = left; P.blink = true; P.tired = false; P.orbs = false; P.mouth = k < 0.3 ? 2 : 0;
        P.s = Math.round(7 * smooth(clamp01(k / 0.6))); P.hy = Math.round(5 * smooth(clamp01((k - 0.2) / 0.4))); P.fan = 1 - 0.3 * k;
        if (k < 0.25) x += (Math.floor(k * 60) & 1) * 2 - 1;
        for (let i = left; i < n0; i++) { const k0 = 0.6 * (1 - (i + 1) / n0); post.push(() => { const q2 = tipAt(i); wisp(c, q2[0], q2[1] - 4, (k - k0) / 0.3, T[2], '#ffffff', i); }); }
        if (k > 0.55) {
          const v = (k - 0.55) / 0.45;
          dz = Math.min(5, 1 + Math.floor(v * 5)); tint = ['#ffffff', Math.min(0.8, v)];
          post.push(() => {
            for (let i = 0; i < 16; i++) { const h = hsh(i + 2), vv = clamp01(v * 1.5 - h * 0.5); wisp(c, x - 30 * scale + h * 60 * scale + Math.sin(i) * 6, y - 6 - hsh(i * 3) * 26 * scale - 26 * vv, vv, T[2], i % 3 ? '#ffffff' : '#bfeaff', i * 1.7); }
            if (v > 0.5) { const w = (v - 0.5) / 0.5, py = Math.round(y - 20 * scale - 50 * w); p(c, Math.round(x) - 3, py - 3, 7, 7, A.hexA(T[2], 0.5 * (1 - w))); p(c, Math.round(x) - 2, py - 2, 5, 5, 'rgba(255,255,255,' + (1 - w).toFixed(2) + ')'); p(c, Math.round(x), py + 4, 1, 4, 'rgba(255,255,255,' + (0.6 * (1 - w)).toFixed(2) + ')'); }
          });
        }
      }
    }
    // bóng đổ
    if (!ill && (dying == null || dying < 0.8)) A.ellipse(c, x, y, (b.big ? 34 : 24) * (z > 0 ? Math.max(0.5, 1 - z / 60) : 1) * (scale / (b.big ? 1.5 : 1)), b.big ? 5 : 4, 'rgba(0,0,0,' + (0.35 * (z > 0 ? 0.7 : 1)).toFixed(2) + ')');
    for (const f of pre) f();
    if (P.big && dying == null && show) {
      // lửa giận bốc quanh chân
      for (let i = 0; i < 6; i++) { const k = (t * 1.4 + i * 0.17) % 1; p(c, Math.round(x - 36 + i * 14 + Math.sin(t * 5 + i) * 3), Math.round(y + 2 - z - k * 26), k < 0.5 ? 2 : 1, k < 0.5 ? 3 : 2, k < 0.3 ? '#ffd23f' : A.hexA(T[2], 0.9 * (1 - k))); }
    }
    if (show) {
      let img = hoCompose(b, T, t, P);
      if (dz) { dissolve(SCR['ho:' + HOW + 'x' + HOH], dz); }
      if (ghosts) { const sil = tinted('t2', img, '#ffffff', 1, 'source-in'); for (const gq of ghosts) hoBlit(c, sil, gq[0], gq[1], face, scale, { z: gq[2], rot: O.rot, sx: O.sx, sy: O.sy, alpha: gq[3] }); }
      if (b.flash > 0 && dying == null) img = tinted('t', img, '#ffffff', 0.4);
      else if (tint) img = tinted('t', img, tint[0], tint[1]);
      hoBlit(c, img, x, y, face, scale, { z, rot: O.rot, sx: O.sx, sy: O.sy, alpha });
    }
    for (const f of post) f();
    if (!ill) drawFx(c, b);
  }

  A.boss = function (c, b) {
    const x = Math.round(b.x), y = Math.round(b.y);
    const res = b.layers && b.layers.find((l) => l.type === 'resist');
    const el = res ? res.el : null;
    const T = TINT[b.kind][el || 'none'];
    const t = G.time;
    const pc = cx;
    if (b.kind === 'moc') {
      c.save();
      c.translate(x, y);
      mocDraw(c, b, T, el, t);
      c.restore();
      mocWorld(c, b, T);
      drawFx(c, b);
    } else if (b.kind === 'ngu') nguDraw(c, b, T, el, t);
    else hoDraw(c, b, T, el, t);
    cx = pc; OUT = false; OC = DARK; QX = 0; QY = 0;
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
    const ZK = G.ZK || 0.6; // độ dẹt của vùng tròn (data.js)
    const tele = z.t > 0;
    const blink = Math.floor(G.time * 10) % 2;
    const pulse = 0.3 + 0.16 * Math.abs(Math.sin(G.time * 14));
    if (z.pool) {
      const hex = z.team === 'player' ? (z.el ? G.EL[z.el].col : '#6fcf3a') : z.el ? G.EL[z.el].col : '#d03c28';
      if (z.shape === 'circle') {
        A.ellipse(c, z.x, z.y, z.r, z.r * ZK, hexA(hex, 0.34));
        ring(c, z.x, z.y, z.r, z.r * ZK, hexA(hex, z.team === 'player' ? 0.7 : 0.95));
        const f = Math.floor(G.time * 5) % 3;
        p(c, Math.round(z.x - z.r * 0.4) + f, Math.round(z.y - 3 - f), 2, 2, hexA(hex, 0.8));
        p(c, Math.round(z.x + z.r * 0.3) - f, Math.round(z.y + 2 - f), 2, 2, hexA(hex, 0.8));
        p(c, Math.round(z.x), Math.round(z.y - z.r * 0.3 + f), 1, 1, '#ffffff');
      } else p(c, Math.round(z.x), Math.round(z.y), Math.round(z.w), Math.round(z.h), hexA(hex, 0.4));
      return;
    }
    if (z.shape === 'circle') {
      if (tele) {
        A.ellipse(c, z.x, z.y, z.r, z.r * ZK, 'rgba(255,40,24,' + pulse + ')');
        if (z.t0) { const k = 1 - z.t / z.t0; A.ellipse(c, z.x, z.y, z.r * k, z.r * ZK * k, 'rgba(255,90,50,0.45)'); }
        ring(c, z.x, z.y, z.r, z.r * ZK, blink ? '#ff3a22' : '#ffb09a');
        ring(c, z.x, z.y, z.r + 2, z.r * ZK + 1.5, 'rgba(120,0,0,0.6)');
      } else {
        A.ellipse(c, z.x, z.y, z.r, z.r * ZK, 'rgba(255,244,210,0.85)');
        ring(c, z.x, z.y, z.r, z.r * ZK, '#ffffff');
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
