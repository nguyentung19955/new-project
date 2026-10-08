// Trùm: lớp thích nghi theo cách chơi, trùm nhỏ và ba boss vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh).
(function () {
  const G = window.G;
  const W = () => G.getWorld();

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

  G.makeBoss = function (kind, o) {
    const w = W();
    const mid = (w.y0 + w.y1) / 2;
    const reg = G.REGIONS[w.region];
    const b = {
      isBoss: true, kind, name: o.name, layers: o.layers, weak: [], weakHits: 0, phase: 0, exposed: 0, flash: 0,
      seq: [], cd: 1.8, face: -1, t: 0, hidden: false, st: G.st0(), dmg: w.base.dmg, marks: kind === 'mini' ? 10 : 20,
      maxhp: w.base.hp * (kind === 'mini' ? G.MINI_HP : (G.BOSS_HP_OF && G.BOSS_HP_OF[kind]) || G.BOSS_HP), last: null, wind: 0, moving: false,
    };
    b.hp = b.maxhp;
    setWeak(b);
    if (kind === 'moc') {
      Object.assign(b, { x: w.w - 140, y: w.y1 - 24, r: 24, hr: 70, h: 124, armSwing: 0 });
      b.rangedShield = (P) => Math.abs(P.x - b.x) > 130;
      w.px1 = b.x - 26;
    } else if (kind === 'ngu') {
      Object.assign(b, { x: w.w - 130, y: mid + 6, r: 44, hr: 70, h: 44 });
      w.px1 = b.x - 62;
    } else if (kind === 'ho') {
      Object.assign(b, { x: w.w - 130, y: mid, r: 18, hr: 10, h: 42, tails: 9, tpCd: 0, hopCd: 2, speed: 84 });
      b.onHit = function (hit) {
        if (hit.ranged && has(b, 'antiRanged') && b.tpCd <= 0 && b.seq.length === 0 && !b.dead) {
          const P = w.P;
          b.tpCd = 4;
          G.burst(b.x, b.y, '#ffffff', 12, 60);
          act(b, 'bite', 0.95, { fire: 0.55, fx: b.x, fy: b.y }); // fx, fy: chỗ vừa biến mất
          b.x = P.x - P.face * 26;
          if (b.x < w.x0 + 4 || b.x > w.x1 - 4) b.x = P.x + P.face * 26; // sát mép sân thì hiện ra phía trước mặt
          b.x = G.clamp(b.x, w.x0, w.x1);
          b.y = P.y;
          G.zoneCircle(P.x, P.y, 22, 0.55, b.dmg, null);
          G.sfx('warn', 1.5);
          b.seq.push({ t: 0.7, f: () => {} });
        }
      };
    } else {
      Object.assign(b, { x: w.w - 200, y: mid, r: 16, hr: 10, h: 58, scale: 2.4, role: 'mini', skin: reg.skin, el: reg.el, speed: 30 * w.haste, resist: null });
    }
    w.boss = b;
    return b;
  };

  function later(b, t, f) { b.seq.push({ t, f }); }
  // Trạng thái hoạt ảnh: chỉ để vẽ, không đụng tới luật chơi hay số ngẫu nhiên.
  // b.anim = { name, t, dur, fire, ... }: đòn đang diễn, t tăng dần, fire là lúc vùng nguy hiểm nổ.
  // b.fx = [{ k, x, y, t, d }]: hiệu ứng ngắn tại một điểm (gai rễ trồi, cột nước...).
  function act(b, name, dur, o) { b.anim = Object.assign({ name, t: 0, dur }, o || {}); return b.anim; }
  function fx(b, k, x, y, d, o) { if (!b.fx) b.fx = []; b.fx.push(Object.assign({ k, x, y, t: 0, d }, o || {})); }
  // Chỉ dùng khi thử: ép trùm ra một đòn cho trước ở lượt kế tiếp.
  G.bossDebug = function (name) { const b = W().boss; if (b) { b.dbg = name; b.cd = 0; } return b; };
  function choose(b, opts) {
    if (b.dbg) { b.last = b.dbg; b.dbg = null; return b.last; }
    let pool = opts.filter((x) => x !== b.last);
    if (!pool.length) pool = opts;
    b.last = G.pick(pool);
    return b.last;
  }
  const adds = () => W().ents.filter((e) => e.add && !e.dead).length;
  function near(x, y, dx, dy) {
    const w = W();
    return [G.clamp(x + G.rr(-dx, dx), w.x0 + 6, (w.px1 != null ? w.px1 : w.x1) - 4), G.clamp(y + G.rr(-dy, dy), w.y0, w.y1)];
  }

  // ---------- Mộc Tinh ----------
  function thinkMoc(b) {
    const w = W(), P = w.P, ph = b.phase;
    const opts = ['sweep', 'roots', 'fruit'];
    if (ph >= 1 && adds() === 0) opts.push('summon'); // chỉ gọi quái từ giai đoạn 2, và khi sân đã sạch
    if (has(b, 'antiMelee') && Math.abs(P.x - b.x) < 100) opts.push('thorn', 'thorn');
    const a = choose(b, opts);
    const tele = ph >= 1 ? 0.95 : 1.05;
    G.sfx('warn');
    if (a === 'sweep') {
      const mid = (w.y0 + w.y1) / 2, top = P.y < mid;
      b.armSwing = -0.4;
      act(b, 'sweep', tele + 0.95, { fire: tele, top, x0: w.x0 - 4, y0: top ? w.y0 - 6 : mid, y1: top ? mid : w.y1 + 6 });
      G.zoneRect(w.x0 - 4, top ? w.y0 - 6 : mid, b.x - 22 - w.x0, top ? mid - w.y0 + 6 : w.y1 - mid + 6, tele, b.dmg * 1.4, null, {
        onFire: () => { b.armSwing = 1; b.exposed = 2.6; G.sfx('boom'); },
      });
      later(b, tele + 0.5, () => { b.armSwing = 0; });
    } else if (a === 'roots') {
      const n = ph >= 1 ? 3 : 1;
      const an = act(b, 'roots', n * 0.45 + 1.0, { n, hits: [] });
      const erupt = (z) => fx(b, 'spike', z.x, z.y, 0.55);
      for (let i = 0; i < n; i++) {
        later(b, i * 0.45, () => {
          G.zoneCircle(P.x, P.y, 16, 0.7, b.dmg, null, { fxKind: 'root', onFire: erupt });
          an.hits.push({ x: P.x, y: P.y, t: an.t, fire: 0.7 });
          if (has(b, 'antiDodge')) later(b, 0.35, () => {
            const zx = G.clamp(P.x + P.ddx * 46, w.x0, w.px1);
            G.zoneCircle(zx, P.y, 16, 0.6, b.dmg, null, { fxKind: 'root', onFire: erupt });
            an.hits.push({ x: zx, y: P.y, t: an.t, fire: 0.6 });
          });
        });
      }
      later(b, n * 0.45 + 0.5, () => {});
    } else if (a === 'fruit') {
      const n = ph >= 2 ? 5 : 3;
      const an = act(b, 'fruit', 1.0 + n * 0.12 + 0.3, { shots: [] });
      for (let i = 0; i < n; i++) {
        const q = near(P.x, P.y, 70, 30);
        G.zoneCircle(q[0], q[1], 18, 1.0 + i * 0.12, b.dmg * 0.8, 'poison', { then: 4, fxKind: 'fruit', onFire: (z) => fx(b, 'splat', z.x, z.y, 0.4, { col: '#8fe04a' }) });
        an.shots.push({ x: q[0], y: q[1], land: 1.0 + i * 0.12 });
      }
      later(b, 1.3, () => {});
    } else if (a === 'summon') {
      for (let i = 0; i < 2; i++) G.spawnEnemy('rusher', b.x - 46, w.y0 + 14 + i * (w.y1 - w.y0 - 28), { add: true, hpMult: 0.5, dmgMult: 0.7 });
      act(b, 'summon', 0.9);
      later(b, 0.6, () => {});
    } else {
      act(b, 'thorn', 1.5, { fire: 1.0, zx: b.x - 14, zy: (w.y0 + w.y1) / 2, r: 64 });
      G.zoneCircle(b.x - 14, (w.y0 + w.y1) / 2, 64, 1.0, b.dmg, null, { fxKind: 'thorn', onFire: (z) => fx(b, 'thorns', z.x, z.y, 0.5, { r: z.r }) });
      later(b, 1.2, () => {});
    }
    b.cd = [1.7, 1.3, 1.0][ph];
  }

  // ---------- Ngư Tinh ----------
  function thinkNgu(b) {
    const w = W(), P = w.P, ph = b.phase;
    const opts = ['charge', 'spout', 'wave'];
    if (has(b, 'antiRanged')) opts.push('dive', 'dive');
    if (has(b, 'antiMelee') && P.x > w.px1 - 56) opts.push('spikes', 'spikes');
    const a = choose(b, opts);
    G.sfx('warn');
    if (a === 'charge') {
      const n = ph >= 2 ? 3 : 1;
      b.hidden = true;
      // rows: từng hàng lao qua (y là tâm hàng, t là lúc bắt đầu báo, fire là thời gian báo, dir là hướng lao)
      const an = act(b, 'charge', 0.3 + n * 0.95 + 0.6 + 0.6, { rows: [], dive: 0.3, up: 0.3 + n * 0.95 + 0.6 });
      for (let i = 0; i < n; i++) {
        later(b, 0.3 + i * 0.95, () => {
          const zy = G.clamp(P.y, w.y0 + 8, w.y1 - 8) - 13;
          an.rows.push({ y: zy + 13, t: an.t, fire: 0.85, dir: an.rows.length % 2 ? 1 : -1 });
          G.zoneRect(-10, zy, w.w + 20, 26, 0.85, b.dmg * 1.35, 'ice', {
            fxKind: 'charge',
            onFire: (z) => { for (let k = 0; k < 8; k++) G.burst(w.x0 + k * 55, z.y + 13, '#9fd0e8', 4, 60); G.sfx('boom', 1.2); },
          });
          if (has(b, 'antiDodge') && i === n - 1) later(b, 0.45, () => {
            const zy2 = G.clamp(P.y, w.y0 + 8, w.y1 - 8) - 13;
            an.rows.push({ y: zy2 + 13, t: an.t, fire: 0.6, dir: an.rows.length % 2 ? 1 : -1 });
            G.zoneRect(-10, zy2, w.w + 20, 26, 0.6, b.dmg * 1.2, 'ice', { fxKind: 'charge' });
          });
        });
      }
      later(b, 0.3 + n * 0.95 + 0.6, () => { b.hidden = false; b.exposed = 2.6; });
    } else if (a === 'spout') {
      const n = ph >= 1 ? 6 : 4;
      const an = act(b, 'spout', 1.7, { shots: [] });
      for (let i = 0; i < n; i++) {
        const q = i === 0 ? [P.x, P.y] : near(P.x, P.y, 80, 34);
        G.zoneCircle(q[0], q[1], 17, 0.85 + i * 0.1, b.dmg, 'ice', { fxKind: 'spout', onFire: (z) => fx(b, 'column', z.x, z.y, 0.45) });
        an.shots.push({ x: q[0], y: q[1], land: 0.85 + i * 0.1 });
      }
      later(b, 1.5, () => {});
    } else if (a === 'wave') {
      const mk = () => {
        const g0 = G.rr(w.y0, w.y1 - 38);
        w.zones.push({ wave: true, x: b.x - 50, vx: -150, wait: 0.9, g0, g1: g0 + 38, dmg: b.dmg * 1.2, el: 'ice' });
      };
      mk();
      act(b, 'wave', ph >= 1 ? 2.3 : 1.4, { slaps: ph >= 1 ? [0.9, 1.8] : [0.9] }); // slaps: các lúc đuôi đập, sóng bắt đầu tràn
      if (ph >= 1) later(b, 0.9, mk);
      later(b, 2.4, () => {});
    } else if (a === 'dive') {
      b.hidden = true;
      const an = act(b, 'dive', 2.1, { dive: 0.3, fire: 1.15, up: 1.6, tx: null, ty: null }); // tx, ty: chỗ sẽ trồi lên
      later(b, 0.3, () => {
        an.tx = P.x; an.ty = P.y;
        G.zoneCircle(P.x, P.y, 30, 0.85, b.dmg * 1.4, 'ice', { fxKind: 'emerge', onFire: (z) => G.burst(z.x, z.y, '#9fd0e8', 20, 90) });
      });
      later(b, 1.6, () => { b.hidden = false; });
    } else {
      b.spikes = true;
      act(b, 'spikes', 1.3, { fire: 0.9, zx: b.x - 34, zy: b.y, r: 68 });
      G.zoneCircle(b.x - 34, b.y, 68, 0.9, b.dmg, null, { fxKind: 'spikes', onFire: () => { b.spikes = false; } });
      later(b, 1.1, () => {});
    }
    b.cd = [1.6, 1.25, 0.95][ph];
  }
  function phaseNgu(b) {
    const w = W();
    if (b.phase === 1) { w.y0 += 14; w.y1 -= 14; }
    if (b.phase === 2) { w.x0 = 150; }
    w.shrink = { y0: w.y0 - 6, y1: w.y1 + 8, x0: w.x0 > 20 ? w.x0 - 8 : 0 };
    w.banner = { s: 'Nước dâng!', col: '#7fd4ff', t: 2 };
  }

  // ---------- Hồ Tinh ----------
  function thinkHo(b) {
    const w = W(), P = w.P, ph = b.phase;
    const opts = ['pounce', 'pounce', 'fox', 'nova'];
    if (w.ents.filter((e) => e.illusion && !e.dead).length < 2) opts.push('illusion');
    const a = choose(b, opts);
    G.sfx('warn', 1.2);
    if (a === 'pounce') {
      const go = (tele) => {
        const tx = P.x, ty = P.y;
        // fx, fy: chỗ lấy đà; tx, ty: chỗ sẽ đáp (b.x, b.y chỉ đổi lúc vùng nổ, hình vẽ bay trước theo cung)
        act(b, 'pounce', tele + 0.45, { fire: tele, fx: b.x, fy: b.y, tx: G.clamp(tx + (b.x < tx ? -8 : 8), w.x0, w.x1), ty });
        G.zoneCircle(tx, ty, 24, tele, b.dmg * 1.15, null, {
          fxKind: 'pounce',
          onFire: () => { b.x = G.clamp(tx + (b.x < tx ? -8 : 8), w.x0, w.x1); b.y = ty; b.exposed = 2.0; G.burst(tx, ty, '#ffffff', 10, 60); },
        });
      };
      go(0.6);
      if (has(b, 'antiDodge')) later(b, 1.0, () => go(0.5));
      later(b, has(b, 'antiDodge') ? 2.6 : 2.0, () => {});
    } else if (a === 'fox') {
      const n = ph >= 1 ? 4 : 3;
      act(b, 'fox', 1.0, { n });
      for (let i = 0; i < n; i++) {
        const an = -1.2 + (i * 2.4) / (n - 1);
        w.projs.push({ team: 'enemy', kind: 'fire', x: b.x, y: b.y, vx: Math.cos(an) * 70 * b.face, vy: Math.sin(an) * 70, homing: 58, t: 3.6, dmg: b.dmg * 0.8, el: 'fire' });
      }
      later(b, 1.0, () => {});
    } else if (a === 'nova') {
      const el = w.stats.el;
      const top = G.ELS.slice().sort((x, y) => el[y] - el[x])[0];
      b.tailEl = el[top] > 0 ? top : 'fire';
      act(b, 'nova', 1.3, { fire: 0.8, el: b.tailEl, r: 62 });
      G.zoneCircle(b.x, b.y, 62, 0.8, b.dmg * 1.2, b.tailEl, { fxKind: 'nova' });
      later(b, 1.2, () => {});
    } else {
      G.burst(b.x, b.y, '#ffffff', 14, 70);
      const ox = b.x, oy = b.y;
      for (let i = 0; i < 2; i++) {
        if (w.ents.filter((e) => e.illusion && !e.dead).length >= 2) break;
        const q = near(P.x, P.y, 130, 40);
        w.ents.push({
          illusion: true, kind: 'ho', layers: b.layers, alpha: 0.7, x: q[0], y: q[1], r: 16, hr: 9, h: 36, hp: 1, maxhp: 1,
          st: G.st0(), dmg: b.dmg * 0.6, face: -1, t: 0, cd: ph >= 1 ? 1.2 : 99, tails: 9, add: true, role: 'illusion',
          speed: ph >= 1 ? 62 : 30, marks: 0, armor: 0, flash: 0, wind: 0, scale: 1, slamCd: 99,
          fromX: ox, fromY: oy, // chỗ tách ra, chỉ để vẽ
        });
      }
      const q = near(P.x, P.y, 150, 40);
      b.x = q[0]; b.y = q[1];
      act(b, 'illusion', 0.8, { fx: ox, fy: oy });
      later(b, 0.8, () => {});
    }
    b.cd = [1.5, 1.1, 0.8][ph];
  }
  function moveHo(b, dt) {
    const w = W(), P = w.P;
    if (b.seq.length || b.st.stun > 0 || b.st.root > 0) return;
    const dx = P.x - b.x || 0.01, dy = P.y - b.y, d = Math.hypot(dx, dy); // d không bao giờ bằng 0
    b.face = dx >= 0 ? 1 : -1;
    if (has(b, 'antiMelee') && d < 42 && b.hopCd <= 0 && b.exposed <= 0) {
      b.hopCd = 3.5;
      w.zones.push({ shape: 'circle', x: b.x, y: b.y, r: 24, t: 0, pool: true, team: 'enemy', el: 'fire', life: 3, tick: 0.3, dmg: b.dmg });
      act(b, 'hop', 0.4, { fx: b.x, fy: b.y, air: 0.28 });
      b.x = G.clamp(b.x - b.face * 100, w.x0, w.x1);
      return;
    }
    const want = 105;
    const sp = b.speed * Math.max(0.4, 1 - 0.15 * b.st.iceN);
    if (d > want + 20) { b.x += (dx / d) * sp * dt; b.y += (dy / d) * sp * 0.7 * dt; } else if (d < want - 30) { b.x -= (dx / d) * sp * 0.45 * dt; } // lùi chậm để người đánh gần còn đuổi kịp
    b.y += Math.sin(b.t * 1.7) * 18 * dt;
    b.x = G.clamp(b.x, w.x0, w.x1); b.y = G.clamp(b.y, w.y0, w.y1);
  }

  // ---------- trùm nhỏ ----------
  function thinkMini(b) {
    const w = W(), P = w.P, ph = b.phase;
    const d = Math.hypot(P.x - b.x, (P.y - b.y) * 1.5);
    const opts = ['slam', 'charge', 'burst'];
    if (adds() < 4) opts.push('summon');
    if (d < 44) opts.push('swipe', 'swipe');
    const a = choose(b, opts);
    G.sfx('warn');
    b.wind = 0.7;
    if (a === 'slam') {
      act(b, 'slam', 1.2, { fire: 0.8, tx: P.x, ty: P.y });
      G.zoneCircle(P.x, P.y, 30, 0.8, b.dmg * 1.3, b.el, { fxKind: 'slam', onFire: (z) => fx(b, 'quake', z.x, z.y, 0.4, { r: z.r }) });
      if (has(b, 'antiDodge')) later(b, 0.4, () => G.zoneCircle(G.clamp(P.x + P.ddx * 46, w.x0, w.x1), P.y, 26, 0.7, b.dmg, b.el, { fxKind: 'slam', onFire: (z) => fx(b, 'quake', z.x, z.y, 0.4, { r: z.r }) }));
      later(b, 1.1, () => {});
    } else if (a === 'charge') {
      const dir = P.x >= b.x ? 1 : -1, py = P.y;
      const x0 = dir > 0 ? b.x : b.x - 210;
      // fx, fy: chỗ lấy đà; hình vẽ lướt từ đó tới chỗ mới trong dash giây sau khi vùng nổ
      act(b, 'charge', 1.5, { fire: 0.8, dash: 0.2, dir, fx: b.x, fy: b.y, ty: py });
      G.zoneRect(x0, py - 12, 210, 24, 0.8, b.dmg * 1.4, b.el, {
        fxKind: 'charge',
        onFire: () => { b.x = G.clamp(b.x + dir * 190, w.x0 + 10, w.x1 - 10); b.y = py; G.sfx('boom'); b.exposed = 1.6; },
      });
      later(b, 2.2, () => {});
    } else if (a === 'burst') {
      const an = act(b, 'burst', 0.9 + (3 + ph) * 0.12 + 0.3, { shots: [], el: b.el });
      for (let i = 0; i < 3 + ph; i++) {
        const q = near(P.x, P.y, 70, 30);
        G.zoneCircle(q[0], q[1], 18, 0.9 + i * 0.12, b.dmg * 0.8, b.el, { then: 3, fxKind: 'burst', onFire: (z) => fx(b, 'splat', z.x, z.y, 0.4, { col: G.EL[b.el].col }) });
        an.shots.push({ x: q[0], y: q[1], land: 0.9 + i * 0.12 });
      }
      later(b, 1.3, () => {});
    } else if (a === 'summon') {
      for (let i = 0; i < 2; i++) G.spawnEnemy('swarm', b.x + G.rr(-20, 20), G.clamp(b.y + (i ? 24 : -24), w.y0, w.y1), { add: true });
      act(b, 'summon', 0.8);
      later(b, 0.6, () => {});
    } else {
      act(b, 'swipe', 1.0, { fire: 0.6, r: 38 });
      G.zoneCircle(b.x, b.y, 38, 0.6, b.dmg, b.el, { fxKind: 'swipe' });
      later(b, 0.9, () => {});
    }
    b.cd = [1.6, 1.3, 1.0][ph];
  }
  function moveMini(b, dt) {
    const w = W(), P = w.P;
    b.moving = false;
    if (b.seq.length || b.st.stun > 0 || b.st.root > 0) return;
    const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy);
    b.face = dx >= 0 ? 1 : -1;
    if (d > 44) {
      const sp = b.speed * Math.max(0.4, 1 - 0.15 * b.st.iceN);
      b.x += (dx / d) * sp * dt; b.y += (dy / d) * sp * 0.75 * dt;
      b.moving = true;
    }
    b.y = G.clamp(b.y, w.y0, w.y1);
  }

  G.updateBoss = function (b, dt) {
    const w = W();
    b.t += dt;
    if (b.flash > 0) b.flash -= dt;
    if (b.exposed > 0) b.exposed -= dt;
    if (b.wind > 0) b.wind -= dt;
    if (b.tpCd > 0) b.tpCd -= dt;
    if (b.hopCd > 0) b.hopCd -= dt;
    // đồng hồ hoạt ảnh
    if (b.anim) { b.anim.t += dt; if (b.anim.t >= b.anim.dur) b.anim = null; }
    if (b.fx && b.fx.length) { for (const f of b.fx) f.t += dt; b.fx = b.fx.filter((f) => f.t < f.d); }
    if (b.roarT > 0) b.roarT -= dt;
    G.tickStatus(b, dt);
    if (b.dead) return;
    const frac = b.hp / b.maxhp;
    const ph = frac > 0.6 ? 0 : frac > 0.3 ? 1 : 2;
    if (ph > b.phase) {
      b.phase = ph;
      if (b.kind === 'ngu') phaseNgu(b);
      if (b.kind === 'ho' && ph === 2) b.big = true;
      b.roarT = 1.2; b.roarPh = ph; // gầm khi đổi giai đoạn
      if (b.kind !== 'ngu') w.banner = { s: b.name + (ph === 1 ? ' nổi giận!' : ' hóa cuồng!'), col: '#ff6a5a', t: 2 };
      G.sfx('gong');
    }
    if (b.kind === 'ho') b.tails = Math.max(1, Math.ceil(9 * frac));
    if (b.kind === 'moc') {
      b.walking = b.phase === 2 && b.x > 360; // đang lết tới, để vẽ dáng đi
      if (b.phase === 2 && b.x > 360) b.x -= 7 * dt;
      w.px1 = b.x - 26;
    }
    for (const s of b.seq) s.t -= dt;
    const due = b.seq.filter((s) => s.t <= 0);
    b.seq = b.seq.filter((s) => s.t > 0);
    for (const s of due) s.f();
    const px = b.x, py = b.y;
    if (b.kind === 'ho') moveHo(b, dt);
    if (b.kind === 'mini') moveMini(b, dt);
    if (b.kind === 'ho') {
      // vận tốc để vẽ dáng chạy và đuôi trễ; bỏ qua các cú nhảy vị trí tức thời
      const vx = (b.x - px) / dt, vy = (b.y - py) / dt;
      const jump = Math.abs(b.x - px) > 6 || Math.abs(b.y - py) > 6;
      b.vx = jump ? 0 : vx; b.vy = jump ? 0 : vy;
      b.moving = !jump && Math.abs(vx) > 20;
    }
    if (b.seq.length === 0 && b.st.stun <= 0 && b.st.frozen <= 0) {
      b.cd -= dt;
      if (b.cd <= 0) {
        if (b.kind === 'moc') thinkMoc(b);
        else if (b.kind === 'ngu') thinkNgu(b);
        else if (b.kind === 'ho') thinkHo(b);
        else thinkMini(b);
      }
    }
  };
})();
