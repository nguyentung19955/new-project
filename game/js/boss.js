// Trùm: lớp thích nghi theo cách chơi, trùm nhỏ (2 chiêu riêng) và ba trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh: ba pha, năm chiêu).
// Hình và cử động lấy từ G.monsterArt (js/monster_art.js); mọi đòn ngắm theo góc bất kỳ tới em bé.
// Người chơi không nhảy: chiêu nào cũng né được bằng đi bộ hoặc lộn (vùng đỏ luôn có chỗ đứng hoặc khe hở).
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  function dur(id, a) { const m = G.monsterArt; return (m && m.dur(id, a)) || 1; }
  function moc(id, a) { const m = G.monsterArt, l = m && m.list.find((x) => x.id === id), an = l && l.anims.find((x) => x.id === a); return (an && an.moc) || [0.45, 0.75]; }

  // Từ số liệu cách chơi trong ải, chọn ra các lớp thích nghi của trùm.
  G.computeLayers = function (stats, max, pct) {
    const L = [];
    const el = stats.el;
    const tot = el.fire + el.poison + el.ice + el.none;
    if (tot > 0) {
      const top = G.ELS.slice().sort((a, b) => el[b] - el[a])[0];
      if (el[top] / tot > 0.5) L.push({ type: 'resist', el: top, pct });
    }
    const rm = stats.ranged + stats.melee;
    if (rm > 0) {
      if (stats.ranged / rm > 0.6) L.push({ type: 'antiRanged' });
      else if (stats.melee / rm > 0.6) L.push({ type: 'antiMelee' });
    }
    if (stats.dodges > 15) L.push({ type: 'antiDodge' });
    return L.slice(0, max);
  };
  // Gọi được qua layers.map(G.layerText): khi hệ khắc chế cũng đang bị kháng thì không ghi "yếu".
  G.layerText = function (l, i, all) {
    if (l.type === 'resist') {
      const weakOk = !Array.isArray(all) || !all.some((x) => x.type === 'resist' && x.el === G.WEAK[l.el]);
      return 'Kháng ' + G.EL[l.el].name + (weakOk ? ', yếu ' + G.EL[G.WEAK[l.el]].name : '') + (l.scar ? ' (vết sẹo)' : '');
    }
    if (l.type === 'antiRanged') return 'Chống đánh xa';
    if (l.type === 'antiMelee') return 'Chống áp sát';
    return 'Bắt bài lăn né';
  };
  function setWeak(b) {
    const res = b.layers.filter((l) => l.type === 'resist').map((l) => l.el);
    b.weak = res.map((e) => G.WEAK[e]).filter((e) => !res.includes(e));
  }
  const has = (b, type) => b.layers.some((l) => l.type === type);

  // Kích thước thân để đánh trúng (r: nửa bề ngang, hr: độ sâu, h: chiều cao hình)
  const BODY = { mocTinh: [30, 14, 124], nguTinh: [36, 16, 100], hoTinh: [32, 14, 110], cuaDa: [26, 12, 68], namChua: [22, 12, 62], hoLua: [26, 12, 62] };
  const SPEED = { moc: 16, ngu: 36, ho: 60, mini: 30 };

  G.makeBoss = function (kind, o) {
    const w = W();
    const reg = G.REGIONS[w.region];
    const g = w.geo || { cx: (w.x0 + w.x1) / 2, cy: (w.y0 + w.y1) / 2 };
    const M = G.MOB_ART || { boss: {}, mini: [] };
    const art = G.monsterArt ? (kind === 'mini' ? M.mini[w.region] : M.boss[kind]) : null;
    const bd = BODY[art] || [20, 10, 50];
    const b = {
      isBoss: true, kind, name: o.name, layers: o.layers, weak: [], weakHits: 0, phase: 0, exposed: 0, flash: 0,
      seq: [], cd: 1.2, face: -1, t: 0, hidden: false, st: G.st0(), dmg: w.base.dmg * (w.base.bossDmg || 1), marks: kind === 'mini' ? 10 : 20,
      maxhp: w.base.hp * (kind === 'mini' ? G.MINI_HP : (G.BOSS_HP_OF && G.BOSS_HP_OF[kind]) || G.BOSS_HP) * (w.base.bossHp || 1), last: null, wind: 0, moving: false,
      x: g.cx + 60, y: g.cy - 6, r: bd[0], hr: bd[1], h: bd[2], art, scale: 1, busy: 0, tired: 0,
      speed: (SPEED[kind] || 30) * (w.haste || 1), el: reg.el, skin: reg.skin, resist: null, dirA: PI,
    };
    if (kind === 'mini') Object.assign(b, { role: 'mini' });
    b.hp = b.maxhp;
    setWeak(b);
    // Chống đánh xa: đứng xa trùm quá 120 thì tên chỉ còn 30% sức.
    b.rangedShield = (P) => Math.hypot(P.x - b.x, P.y - b.y) > 120;
    if (kind === 'ho') {
      b.hopCd = 2; b.tpCd = 0;
      b.onHit = function (hit) {
        // Chống đánh xa: bị bắn thì Hồ Tinh biến mất rồi hiện ra ngay sau lưng em bé, vồ một cái
        if (hit.ranged && has(b, 'antiRanged') && b.tpCd <= 0 && b.busy <= 0 && !b.dead && !(b.invuln > 0)) {
          const P = w.P;
          b.tpCd = 4.5;
          FX('burst', b.x, b.y - 30, '#ffffff', 12, 60);
          b.x = clamp(P.x - P.face * 40, w.x0 + 10, w.x1 - 10); b.y = clamp(P.y, w.y0, w.y1);
          b.face = P.x >= b.x ? 1 : -1;
          G.zoneCircle(P.x, P.y, 24, 0.6, b.dmg, null, { src: b });
          G.sfx('warn', 1.5);
          b.busy = 0.8; b.cd = Math.max(b.cd, 0.6);
          play(b, 'idle');
        }
      };
    }
    // Ra mắt: trùm vùng diễn màn ra mắt, trùm nhỏ diễn cử động xuất hiện; lúc này chưa đánh và không nhận sát thương.
    const intro = art ? dur(art, kind === 'mini' ? 'spawn' : 'intro') : 0.5;
    b.invuln = intro; b.busy = intro; b.intro = intro;
    play(b, kind === 'mini' ? 'spawn' : 'intro');
    if (kind !== 'mini') w.shake = Math.max(w.shake, 0.4);
    w.px1 = null; w.shrink = null;
    w.boss = b;
    return b;
  };

  function play(b, n, spd, o) { b.an = Object.assign({ n, t: 0, spd: spd || 1 }, o || {}); }
  function later(b, t, f) { b.seq.push({ t, f }); }
  // Chỉ dùng khi thử: ép trùm ra một chiêu cho trước ở lượt kế tiếp ('c1'..'c5' cho trùm vùng, 'atk', 'chieu1', 'chieu2' cho trùm nhỏ).
  G.bossDebug = function (name) { const b = W().boss; if (b) { b.dbg = name; b.cd = 0; } return b; };
  function choose(b, opts) {
    if (b.dbg) { const n = b.dbg; b.dbg = null; b.last = n; return n; }
    let pool = opts.filter((x) => x !== b.last);
    if (!pool.length) pool = opts;
    b.last = G.pick(pool);
    return b.last;
  }
  const near = (x, y, dx, dy) => G.mobNear(x, y, dx, dy);
  const ang = (b, P) => Math.atan2(P.y - b.y, P.x - b.x);
  const Z = (shape, geo, t, dmg, el, o) => G.mobZone(shape, geo, t, dmg, el, Object.assign({ src: W().boss }, o || {}));
  function circle(x, y, r, t, dmg, el, o) { return G.zoneCircle(x, y, r, t, dmg, el, Object.assign({ src: W().boss }, o || {})); }
  function shot(b, a, sp, o) {
    W().projs.push(Object.assign({ team: 'enemy', kind: 'orb', x: b.x + Math.cos(a) * 14, y: b.y + Math.sin(a) * 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 3.2, dmg: b.dmg * 0.8, el: b.el, src: b, z: 22 }, o || {}));
  }
  function aimFace(b, a) { b.dirA = a; if (Math.abs(Math.cos(a)) > 0.15) b.face = Math.cos(a) > 0 ? 1 : -1; }
  // Lao thân: dời vị trí thật trong T giây theo góc a, quãng L (giữ trong sàn)
  function lunge(b, a, L, T) { b.lunge = { vx: Math.cos(a) * L / T, vy: Math.sin(a) * L / T, t: T }; }

  // ======================= CHIÊU CỦA TRÙM VÙNG =======================
  // Mỗi chiêu: anim cX đã gồm báo trước → ra đòn → dư âm; T là lúc vùng đỏ nổ (mốc moc[0]), D là độ dài cả chiêu.
  const SK = {
    ngu: {
      c1: { name: 'Đớp', f(b, P, T, D, a, sp) { // lao tới đớp theo đường thẳng
        const L = clamp(Math.hypot(P.x - b.x, P.y - b.y) + 24, 80, 160);
        Z('line', { x: b.x, y: b.y, ang: a, len: L, w: 46 }, T, b.dmg * 1.4, 'ice', { melee: true });
        later(b, T, () => lunge(b, a, L - 36, (moc(b.art, 'c1')[1] - moc(b.art, 'c1')[0]) * D));
        b.an.cut = moc(b.art, 'c1')[1]; // cú lao tự lùi về trong hình: chỉ dùng tới lúc đớp xong
      } },
      c2: { name: 'Sóng thần', f(b, P, T, D, a, sp) { // tường nước chạy theo hướng em bé, chừa một khe
        const mk = (wait, off) => {
          const lat = G.rr(-70, 70) + off;
          W().zones.push({ wall: true, x: b.x, y: b.y, ang: a, s: 10, v: 155, th: 14, half: 260, g: clamp(lat, -110, 110), gw: 26, wait, maxS: 340, dmg: b.dmg * 1.2, el: 'ice', src: b });
        };
        mk(T, 0);
        if (b.phase >= 1) later(b, 0.7, () => mk(T - 0.2, G.rnd() < 0.5 ? 60 : -60));
      } },
      c3: { name: 'Phun băng', near: true, f(b, P, T, D, a) { // quạt băng, sàn mọc gai băng làm chậm
        Z('cone', { x: b.x, y: b.y, ang: a, r: 125, span: 1.0 }, T, b.dmg * 1.3, 'ice');
        later(b, T, () => { for (let i = 1; i <= 3; i++) G.zoneCircle(clamp(b.x + Math.cos(a) * i * 34, W().x0, W().x1), clamp(b.y + Math.sin(a) * i * 34, W().y0, W().y1), 15, 0, b.dmg * 0.4, 'ice', { pool: true, life: 2, tick: 0.3 }); });
      } },
      c4: { name: 'Mưa băng nhọn', f(b, P, T, D) { // băng rơi thẳng xuống 7 chỗ quanh em bé
        for (let i = 0; i < 7; i++) { const q = i ? near(P.x, P.y, 75, 45) : [P.x, P.y]; circle(q[0], q[1], 16, T + i * 0.08, b.dmg, 'ice', { fxKind: 'spout' }); }
      } },
      c5: { name: 'Xoáy nước', near: true, f(b, P, T, D) { // xoáy quanh thân rồi bung vòng sóng (đứng ngoài xa, hoặc chạy vào giữa sau khi xoáy tan)
        circle(b.x, b.y, 60, T, b.dmg * 1.3, 'ice');
        Z('donut', { x: b.x, y: b.y, r0: 60, r1: 112 }, T + 0.55, b.dmg * 1.2, 'ice');
        later(b, D, () => tire(b, 1.5));
      } },
    },
    moc: {
      c1: { name: 'Quật cành', near: true, f(b, P, T, D, a) {
        Z('cone', { x: b.x, y: b.y - 6, ang: a, r: 118, span: 2.0 }, T, b.dmg * 1.4, null, { melee: true });
      } },
      c2: { name: 'Rễ đâm', f(b, P, T, D, a) { // hàng gai rễ trồi lên nối nhau theo hướng em bé
        const rows = b.phase >= 1 ? [-0.32, 0.32] : [0];
        for (const off of rows) for (let i = 0; i < 7; i++) {
          const x = b.x + Math.cos(a + off) * (26 + i * 22), y = b.y + Math.sin(a + off) * (26 + i * 22);
          if (x < W().x0 - 4 || x > W().x1 + 4 || y < W().y0 - 4 || y > W().y1 + 4) continue;
          circle(x, y, 14, T + i * 0.09, b.dmg * 1.1, null, { fxKind: 'root' });
        }
      } },
      c3: { name: 'Mưa quả độc', f(b, P, T, D) { // quả độc vỡ thành vũng độc
        const n = b.phase >= 2 ? 6 : 5;
        for (let i = 0; i < n; i++) { const q = i ? near(P.x, P.y, 70, 40) : [P.x, P.y]; circle(q[0], q[1], 18, T + i * 0.1, b.dmg * 0.8, 'poison', { then: 3.5, fxKind: 'fruit' }); }
      } },
      c4: { name: 'Bùa bay', f(b, P, T, D, a) { // năm lá bùa bay uốn lượn đuổi theo em bé rồi cháy nổ
        later(b, T, () => { for (let i = 0; i < 5; i++) shot(b, a + (i - 2) * 0.45, 62, { kind: 'bua', homing: 44, t: 3.6, dmg: b.dmg * 0.85, el: 'poison' }); });
      } },
      c5: { name: 'Rừng gai', near: true, f(b, P, T, D) { // ba vòng gai lan ra, mỗi vòng chừa bốn khe để né
        const R = [[24, 58], [58, 92], [92, 126]];
        R.forEach((r, i) => { const o = G.rnd() * TAU; Z('donut', { x: b.x, y: b.y, r0: r[0], r1: r[1], gaps: [0, 1, 2, 3].map((k) => o + k * PI / 2), gw: 0.3 }, T + i * 0.38, b.dmg * 1.2, 'poison'); });
        later(b, D, () => tire(b, 1.5));
      } },
    },
    ho: {
      c1: { name: 'Hồ hoả', f(b, P, T, D, a) { // cầu lửa ma từ đầu đuôi bay vòng cung đuổi theo
        const n = [5, 6, 8][b.phase];
        for (let i = 0; i < n; i++) later(b, T + i * 0.05, () => shot(b, a + PI + (i / (n - 1) - 0.5) * 2.6, 72, { kind: 'fire', homing: 40, t: 3, dmg: b.dmg * 0.7, el: 'fire' }));
      } },
      c2: { name: 'Vồ mồi', f(b, P, T, D, a) { // vồ hai lần, lần hai nhắm lại
        const L = clamp(Math.hypot(P.x - b.x, P.y - b.y) + 20, 70, 140);
        Z('line', { x: b.x, y: b.y, ang: a, len: L, w: 40 }, T, b.dmg * 1.25, null, { melee: true });
        later(b, T, () => { lunge(b, a, L - 26, 0.22); FX('burst', b.x, b.y, '#ffffff', 8, 60); });
        later(b, T + 0.55, () => {
          const a2 = ang(b, P), L2 = clamp(Math.hypot(P.x - b.x, P.y - b.y) + 20, 60, 130);
          aimFace(b, a2);
          Z('line', { x: b.x, y: b.y, ang: a2, len: L2, w: 40 }, 0.5, b.dmg * 1.25, null, { melee: true });
          later(b, 0.5, () => lunge(b, a2, L2 - 26, 0.22));
        });
        b.an.cut = 0.9;
      } },
      c3: { name: 'Quạt đuôi', near: true, f(b, P, T, D, a) { // ba lớp vệt lửa hình trăng khuyết, sàn cháy xanh
        [[0, 62], [56, 98], [92, 134]].forEach((r, i) => Z('donut', { x: b.x, y: b.y, r0: r[0], r1: r[1], gaps: [a + PI], gw: PI - 0.85 }, T + i * 0.12, b.dmg * 1.2, 'fire'));
        later(b, T + 0.3, () => { for (let i = 1; i <= 3; i++) G.zoneCircle(clamp(b.x + Math.cos(a) * i * 36, W().x0, W().x1), clamp(b.y + Math.sin(a) * i * 36, W().y0, W().y1), 16, 0, b.dmg * 0.5, 'fire', { pool: true, life: 2.5, tick: 0.3 }); });
      } },
      c4: { name: 'Vòng lửa ma', f(b, P, T, D, a) { // hai vòng cột lửa lệch chỗ nhau (giữa hai cột là khe đứng được)
        const V = [[62, 8, 0, 0.3], [102, 12, PI / 12, 0.5]];
        for (const [R, n, lech, t0] of V) for (let i = 0; i < n; i++) {
          const q = a + lech + (i / n) * TAU, x = b.x + Math.cos(q) * R, y = b.y + Math.sin(q) * R;
          if (x < W().x0 - 8 || x > W().x1 + 8 || y < W().y0 - 8 || y > W().y1 + 8) continue;
          circle(x, y, 12, (t0 + i * 0.015) * D, b.dmg * 1.1, 'fire', { fxKind: 'nova' });
        }
      } },
      c5: { name: 'Bão hồ hoả', f(b, P, T, D, a) { // ba đợt cầu lửa toả tròn, mỗi đợt lệch nhau để luồn qua khe
        for (let j = 0; j < 3; j++) later(b, T + j * 0.32, () => { for (let i = 0; i < 10; i++) shot(b, a + ((i + j * 0.5) / 10) * TAU, 82, { kind: 'fire', t: 2.6, dmg: b.dmg * 0.75, el: 'fire' }); });
        later(b, D, () => tire(b, 1.4));
      } },
    },
  };
  // Mệt sau chiêu lớn: choáng một lúc, nhận thêm sát thương (cơ hội phản công)
  function tire(b, t) { if (b.dead) return; b.tired = t; b.exposed = Math.max(b.exposed, t); b.busy = Math.max(b.busy, t); }

  function thinkBig(b) {
    const w = W(), P = w.P, ph = b.phase, S = SK[b.kind];
    const opts = ['c1', 'c2', 'c3'];
    if (ph >= 1) opts.push('c4');
    if (ph >= 2) opts.push('c5');
    // Chống áp sát: em bé đứng sát thì trùm hay dùng chiêu đánh quanh mình hơn
    if (has(b, 'antiMelee') && Math.hypot(P.x - b.x, P.y - b.y) < 75) for (const k of opts.slice()) if (S[k].near) opts.push(k, k);
    const k = choose(b, opts), sk = S[k] || S.c1;
    const spd = [1, 1.1, 1.2][ph], D = dur(b.art, k) / spd, T = moc(b.art, k)[0] * D, a = ang(b, P);
    aimFace(b, a);
    play(b, k, spd);
    sk.f(b, P, T, D, a, spd);
    b.busy = D; b.wind = T;
    G.sfx('warn', 1.1);
    // Bắt bài lăn né: thêm một vùng đỏ đúng chỗ em bé sẽ lăn tới
    if (has(b, 'antiDodge')) later(b, T + 0.3, () => { const P2 = W().P; circle(clamp(P2.x + (P2.ddx || 0) * 46, w.x0, w.x1), clamp(P2.y + (P2.ddy || 0) * 34, w.y0, w.y1), 18, 0.6, b.dmg, null); });
    b.cd = [1.3, 1.0, 0.8][ph];
  }

  // ======================= TRÙM NHỎ =======================
  function thinkMini(b) {
    const w = W(), P = w.P, ph = b.phase, id = b.art;
    const d = Math.hypot(P.x - b.x, P.y - b.y), a = ang(b, P);
    const opts = ['chieu1', 'chieu2'];
    if (d < 70) opts.push('atk', 'atk');
    const k = choose(b, opts), spd = [1, 1.08, 1.16][ph];
    aimFace(b, a);
    G.sfx('warn');
    if (k === 'atk') {
      const T = 0.75 / spd;
      play(b, 'tele', 0.7 / 0.75 * spd);
      later(b, T, () => play(b, 'atk', spd));
      if (id === 'namChua') Z('cone', { x: b.x, y: b.y, ang: a, r: 64, span: 1.2 }, T, b.dmg * 1.1, 'poison');
      else Z('cone', { x: b.x, y: b.y, ang: a, r: 58, span: 2.0 }, T, b.dmg * 1.2, null, { melee: true });
      b.busy = T + dur(id, 'atk') / spd; b.wind = T;
    } else {
      const D = dur(id, k) / spd, T = 0.5 * D;
      play(b, k, spd);
      b.busy = D; b.wind = T;
      if (id === 'cuaDa' && k === 'chieu1') {
        // Đập càng rung sàn: sóng chấn động quanh mình, chạy ra ngoài vòng đỏ
        circle(b.x, b.y, 80, T, b.dmg * 1.3, null, { fxKind: 'slam' });
        if (ph >= 1) Z('donut', { x: b.x, y: b.y, r0: 80, r1: 118 }, T + 0.5, b.dmg, null);
      } else if (id === 'cuaDa') {
        // Mưa tinh thể: tinh thể trên lưng bắn lên rồi cắm xuống 5 chỗ
        for (let i = 0; i < 5 + ph; i++) { const q = i ? near(P.x, P.y, 70, 40) : [P.x, P.y]; circle(q[0], q[1], 16, T + i * 0.1, b.dmg, 'ice', { fxKind: 'spout' }); }
      } else if (id === 'namChua' && k === 'chieu1') {
        // Hàng nấm độc: nấm mọc vọt nối nhau theo hướng em bé
        for (let i = 0; i < 7; i++) { const x = b.x + Math.cos(a) * (22 + i * 21), y = b.y + Math.sin(a) * (22 + i * 21); if (x > w.x0 - 6 && x < w.x1 + 6 && y > w.y0 - 6 && y < w.y1 + 6) circle(x, y, 14, T + i * 0.08, b.dmg, 'poison', { fxKind: 'root', then: ph >= 2 ? 2 : 0 }); }
      } else if (id === 'namChua') {
        // Bão bào tử: hai đợt bào tử toả tròn và vòng khí độc
        for (let j = 0; j < 2; j++) later(b, T + j * 0.4, () => { for (let i = 0; i < 9; i++) shot(b, a + ((i + j * 0.5) / 9) * TAU, 78, { kind: 'orb', col: '#c4f43c', col2: '#58208c', el: 'poison', t: 2.2 }); });
        later(b, T, () => G.zoneCircle(b.x, b.y, 34, 0, b.dmg * 0.5, 'poison', { pool: true, life: 3, tick: 0.3 }));
      } else if (id === 'hoLua' && k === 'chieu1') {
        // Vồ lửa: chồm tới một đường dài, để lại vệt lửa trên sàn
        const L = clamp(d + 30, 90, 160);
        Z('line', { x: b.x, y: b.y, ang: a, len: L, w: 32 }, T, b.dmg * 1.4, 'fire', { melee: true });
        later(b, T, () => {
          const x0 = b.x, y0 = b.y;
          lunge(b, a, L - 30, 0.25);
          for (let i = 0; i < 4; i++) G.zoneCircle(clamp(x0 + Math.cos(a) * (20 + i * (L - 30) / 3), w.x0, w.x1), clamp(y0 + Math.sin(a) * (20 + i * (L - 30) / 3), w.y0, w.y1), 15, 0, b.dmg * 0.5, 'fire', { pool: true, life: 2.6, tick: 0.3 });
        });
        b.an.cut = 0.75;
      } else {
        // Gầm phun lửa: phun lửa hình quạt rộng
        Z('cone', { x: b.x, y: b.y, ang: a, r: 112, span: 1.5 }, T, b.dmg * 1.3, 'fire');
      }
    }
    if (has(b, 'antiDodge')) later(b, b.wind + 0.3, () => { const P2 = W().P; circle(clamp(P2.x + (P2.ddx || 0) * 46, w.x0, w.x1), clamp(P2.y + (P2.ddy || 0) * 34, w.y0, w.y1), 18, 0.6, b.dmg, b.el); });
    b.cd = [1.4, 1.15, 0.9][ph];
  }

  // ======================= DI CHUYỂN =======================
  function move(b, dt) {
    const w = W(), P = w.P;
    b.moving = false;
    if (b.busy > 0 || b.st.stun > 0 || b.st.root > 0 || b.st.frozen > 0) return;
    const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy) || 0.01;
    if (Math.abs(dx) > 4) b.face = dx > 0 ? 1 : -1;
    b.dirA = b.face > 0 ? 0 : PI;
    if (b.kind === 'ho' && has(b, 'antiMelee') && d < 46 && b.hopCd <= 0) {
      // Chống áp sát: Hồ Tinh bật lùi ra xa, để lại vũng lửa chỗ cũ
      b.hopCd = 3.5;
      G.zoneCircle(b.x, b.y, 24, 0, b.dmg, 'fire', { pool: true, life: 3, tick: 0.3 });
      lunge(b, Math.atan2(-dy, -dx), 90, 0.25);
      return;
    }
    const want = b.kind === 'moc' ? 70 : b.kind === 'ngu' ? 85 : b.kind === 'ho' ? 100 : 44;
    const sp = b.speed * Math.max(0.4, 1 - 0.15 * b.st.iceN);
    if (d > want + 12) { b.x += (dx / d) * sp * dt; b.y += (dy / d) * sp * 0.8 * dt; b.moving = true; }
    else if (d < want - 30 && b.kind !== 'mini') { b.x -= (dx / d) * sp * 0.45 * dt; b.y -= (dy / d) * sp * 0.3 * dt; b.moving = true; }
    if (b.kind === 'ho') b.y += Math.sin(b.t * 1.7) * 14 * dt;
  }

  G.updateBoss = function (b, dt) {
    const w = W();
    b.t += dt;
    if (b.flash > 0) b.flash -= dt;
    if (b.exposed > 0) b.exposed -= dt;
    if (b.wind > 0) b.wind -= dt;
    if (b.tpCd > 0) b.tpCd -= dt;
    if (b.hopCd > 0) b.hopCd -= dt;
    if (b.invuln > 0) b.invuln -= dt;
    if (b.busy > 0) b.busy -= dt;
    if (b.tired > 0) b.tired -= dt;
    if (b.an) b.an.t += dt * (b.an.spd || 1);
    if (b.hitT > 0) b.hitT -= dt;
    G.tickStatus(b, dt);
    if (b.dead) return;
    if (b.lunge) {
      const L = b.lunge, k = Math.min(dt, L.t);
      b.x += L.vx * k; b.y += L.vy * k; L.t -= dt;
      if (L.t <= 0) b.lunge = null;
    }
    b.x = clamp(b.x, w.x0 + 4, w.x1 - 4); b.y = clamp(b.y, w.y0, w.y1);
    // Ba pha: đổi ở 66% và 33% máu. Trùm vùng diễn cảnh chuyển pha (không nhận sát thương), hình đổi theo pha.
    const frac = b.hp / b.maxhp;
    const ph = frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2;
    if (ph > b.phase && !(b.intro > 0 && b.invuln > 0)) {
      b.phase = ph;
      b.seq.length = 0; b.lunge = null; b.tired = 0;
      w.zones = w.zones.filter((z) => z.src !== b || !(z.t > 0 || z.wall));
      if (b.kind !== 'mini') {
        const D = dur(b.art, ph === 1 ? 'phase2' : 'phase3');
        play(b, ph === 1 ? 'phase2' : 'phase3');
        b.invuln = D; b.busy = D; b.cd = 0.4;
        w.projs = w.projs.filter((o) => o.team !== 'enemy');
        w.shake = Math.max(w.shake, 0.5);
      }
      b.roarT = 1.2; b.roarPh = ph;
      w.banner = { s: b.name + (ph === 1 ? ' nổi giận!' : ' hóa cuồng!'), col: '#ff6a5a', t: 2 };
      G.sfx('gong');
    }
    for (const s of b.seq) s.t -= dt;
    const due = b.seq.filter((s) => s.t <= 0);
    b.seq = b.seq.filter((s) => s.t > 0);
    for (const s of due) s.f();
    move(b, dt);
    // hình: đang ra chiêu thì giữ cử động chiêu; xong chiêu thì đứng thở hoặc đi
    const busyAnim = b.an && (b.an.n === 'intro' || b.an.n === 'spawn' || b.an.n === 'phase2' || b.an.n === 'phase3' || /^c\d$|^chieu|^atk|^tele/.test(b.an.n));
    if (b.busy <= 0 || !busyAnim) {
      const n = b.moving ? 'move' : 'idle';
      if (!b.an || b.an.n !== n) play(b, n);
    }
    if (b.busy <= 0 && b.st.stun <= 0 && b.st.frozen <= 0) {
      b.cd -= dt;
      if (b.cd <= 0) { if (b.kind === 'mini') thinkMini(b); else thinkBig(b); }
    }
  };

  // ======================= VẼ =======================
  const A = G.art;
  if (A) {
    const boss0 = A.boss;
    A.boss = function (c, b) {
      if (!b.art || !G.monsterArt || b.kind === 'mini' || b.illusion) return boss0(c, b);
      let n = b.an ? b.an.n : 'idle', t = b.an ? b.an.t : 0;
      if (b.an && b.an.cut) { const D = dur(b.art, n); t = Math.min(t, b.an.cut * D); }
      if (b.dying != null) { n = 'die'; t = b.dying * dur(b.art, 'die'); }
      else if ((b.st && b.st.stun > 0) || b.tired > 0) { n = 'stun'; t = G.time; }
      else if (b.hitT > 0 && (n === 'idle' || n === 'move')) { n = 'hit'; t = 0.4 - b.hitT; }
      const phase = (b.phase | 0) + 1;
      const pha3 = b.kind === 'ho' && (phase >= 3 && !(n === 'phase3' && t < dur(b.art, 'phase3') * 0.5));
      const s = pha3 ? 0.72 : 1; // Hồ Tinh pha 3 to gấp rưỡi: thu nhỏ cho vừa phòng
      b.drawW = (pha3 ? 281 : b.kind === 'ho' ? 174 : 150) * s; b.drawH = (pha3 ? 174 : b.h) * s;
      const o = { anim: n, t, face: b.face, dir: b.dirA != null ? b.dirA : b.face > 0 ? 0 : PI, phase, hit: b.flash > 0 ? 0.7 : 0, bao: false };
      if (s !== 1) { c.save(); c.translate(Math.round(b.x), Math.round(b.y)); c.scale(s, s); G.monsterArt.draw(c, b.art, 0, 0, o); c.restore(); }
      else G.monsterArt.draw(c, b.art, b.x, b.y, o);
      if (b.dying == null && b.invuln > 0 && b.intro == null) {} // (chỗ trống cho dấu hiệu miễn sát thương)
    };
  }
})();
