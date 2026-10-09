// Quái mới vào game: nối hình và cử động của G.monsterArt (js/monster_art.js) với luật chơi.
// - Mỗi vai có một con riêng ở từng vùng (G.MOB_ART trong data.js).
// - Đòn của quái ngắm theo góc bất kỳ tới em bé (tám hướng và mọi góc giữa), vùng báo trước xoay theo góc.
// - Cơ chế theo vai: xông tới, bầy nhỏ, giáp (che phía trước, hồi máu cho bạn), bắn xa (gọi thêm bầy nhỏ),
//   nhanh nhẹn (lặn/chui đất rồi trồi lên), cảm tử, đặt bom, gai (phản đòn cận chiến).
// - Tinh anh: mạnh hơn, có chiêu riêng và một dấu hiệu ngẫu nhiên (biểu tượng nhỏ trên đầu).
// Vùng nổ theo hệ của vùng: Băng đóng băng ngắn, Độc để vũng độc, Lửa để vệt cháy.
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const MA = () => G.monsterArt;
  const DEF = (id) => (G.monsterArt && G.monsterArt._defs[id]) || {};
  function dur(id, a) { const m = MA(); return (m && m.dur(id, a)) || 0.6; }
  const INFO = {};
  function info(id) {
    if (!INFO[id]) { const m = MA(); INFO[id] = (m && m.list.find((x) => x.id === id)) || { w: 30, h: 24 }; }
    return INFO[id];
  }
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  const angTo = (e, P) => Math.atan2(P.y - e.y, P.x - e.x);
  const regEl = () => (G.REGIONS[W().region | 0] || G.REGIONS[0]).el;
  function play(e, n, spd) { e.an = { n, t: 0, spd: spd || 1 }; }
  function loop(e, n) { if (!e.an || e.an.n !== n) e.an = { n, t: 0, spd: 1 }; }

  // ---------- hình dạng vùng mới: đường thẳng, quạt, vành khăn (có khe), tường nước chạy ----------
  // Toạ độ thật (không bẹp theo chiều dọc) cho khớp với hình báo trước của js/monster_art.js.
  G.inShape = function (z, e, pad) {
    const dx = e.x - z.x, dy = e.y - z.y;
    if (z.shape === 'line') {
      const c = Math.cos(z.ang), s = Math.sin(z.ang), al = dx * c + dy * s, ac = -dx * s + dy * c;
      return al >= -4 - pad && al <= z.len + 3 + pad && Math.abs(ac) <= z.w / 2 + 3 + pad;
    }
    if (z.shape === 'cone') {
      const d = Math.hypot(dx, dy);
      if (d > z.r + 3 + pad) return false;
      if (d < 8 + pad) return true;
      let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      return Math.abs(da) <= z.span / 2 + (4 + pad) / Math.max(d, 1);
    }
    if (z.shape === 'donut') {
      const d = Math.hypot(dx, dy);
      if (d < z.r0 - 3 - pad || d > z.r1 + 3 + pad) return false;
      if (z.gaps) { const a = Math.atan2(dy, dx); for (const g of z.gaps) { let da = a - g; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < z.gw - (pad ? 0 : 3 / Math.max(d, 1))) return false; } }
      return true;
    }
    return false;
  };
  // Hướng chạy thoát khỏi một vùng (cho bot thử nghiệm).
  G.zoneEscape = function (z, P) {
    const dx = P.x - z.x, dy = P.y - z.y;
    if (z.shape === 'line') {
      const c = Math.cos(z.ang), s = Math.sin(z.ang), ac = -dx * s + dy * c, k = ac >= 0 ? 1 : -1;
      return [-s * k, c * k];
    }
    if (z.shape === 'cone') {
      let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      const a = z.ang + (da >= 0 ? 1 : -1) * (z.span / 2 + 0.9);
      return [Math.cos(a), Math.sin(a)];
    }
    const d = Math.hypot(dx, dy) || 1;
    if (z.shape === 'donut' && z.gaps) {
      // chạy về khe gần nhất
      const a = Math.atan2(dy, dx);
      let best = z.gaps[0], bd = 9;
      for (const g of z.gaps) { const da = Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))); if (da < bd) { bd = da; best = g; } }
      const r = (z.r0 + z.r1) / 2, tx = z.x + Math.cos(best) * r, ty = z.y + Math.sin(best) * r, l = Math.hypot(tx - P.x, ty - P.y) || 1;
      return [(tx - P.x) / l, (ty - P.y) / l];
    }
    if (z.shape === 'donut' && d < (z.r0 + z.r1) / 2) return [-dx / d, -dy / d];
    return [dx / d, dy / d];
  };
  function addZone(shape, geo, t, dmg, el, o) {
    const z = Object.assign({ shape, t, t0: t, dmg, el: el || null, life: 0.12 }, geo, o || {});
    W().zones.push(z);
    return z;
  }
  G.mobZone = addZone;
  // Tường nước chạy (chiêu sóng thần): chạy theo hướng ang, chừa một khe; đứng đúng khe thì không sao.
  G.mobWall = function (z, dt, P) {
    if (z.wait > 0) { z.wait -= dt; return; }
    z.s += z.v * dt;
    const c = Math.cos(z.ang), s = Math.sin(z.ang), dx = P.x - z.x, dy = P.y - z.y, al = dx * c + dy * s, ac = -dx * s + dy * c;
    if (!z.hit && Math.abs(al - z.s) < z.th / 2 + 3 && Math.abs(ac) < z.half && Math.abs(ac - z.g) > z.gw) { if (G.hurtPlayer(z.dmg, z.el, z.src || null, false)) { z.hit = true; if (z.onHit) z.onHit(z); } }
    if (z.s > z.maxS) z.dead = true;
  };

  // ---------- khởi tạo quái theo vai ----------
  G.mobInit = function (e, o) {
    const w = W(), M = G.MOB_ART;
    if (!G.monsterArt || !M || !w || o.noArt) return;
    const r = clamp(w.region | 0, 0, 2);
    let id = null;
    if (e.role === 'elite') id = o.art || M.elite[r][G.rnd() < 0.5 ? 0 : 1];
    else if (M[e.role] && typeof M[e.role][r] === 'string') id = o.art || M[e.role][r];
    if (!id || !DEF(id).anims) return;
    const I = info(id), elite = e.role === 'elite';
    e.art = id; e.don = DEF(id).don || {}; e.scale = 1;
    e.r = clamp(Math.round(I.w * (elite ? 0.2 : 0.24)), 6, elite ? 16 : 12);
    e.hr = clamp(Math.round(I.h * 0.18), 5, elite ? 11 : 8);
    e.h = I.h; e.w = I.w;
    e.dirA = e.face > 0 ? 0 : PI;
    e.act = null; e.hitT = 0; e.turnT = 0;
    play(e, 'spawn');
    e.spawnT = o.add ? dur(id, 'spawn') * 0.7 : dur(id, 'spawn');
    e.cd = G.rr(0.4, 1.1);
    if (e.role === 'shield') { e.armor = G.ROLES.shield.armor || 0.45; e.armorMax = e.maxhp * 0.45; e.armorHp = e.armorMax; e.healCd = G.rr(3, 6); }
    if (e.role === 'archer') e.sumCd = G.rr(5, 8);
    if (e.role === 'nimble') e.diveCd = G.rr(0.6, 1.8);
    if (e.role === 'spiky') e.spikeCd = G.rr(1.2, 2.5);
    if (elite) {
      e.skCd = G.rr(2.5, 4);
      const tr = Object.keys(G.ELITE_TRAITS || {});
      e.trait = o.trait || (tr.length ? tr[Math.floor(G.rnd() * tr.length)] : null);
      if (e.trait === 'nhanh') e.speed *= 1.45;
    }
  };
  // Giáp: quái giáp chỉ che phía trước (phải vòng ra sau hoặc phá giáp); tinh anh "Bọc giáp" che mọi phía.
  G.mobArmor = function (t, o) {
    if (!t.art) return t.armor;
    let a = t.trait === 'giap' ? 0.35 : 0;
    if (t.role === 'shield' && !(t.brokeT > 0)) {
      const P = W().P;
      if ((P.x - t.x) * t.face > -4) a = Math.max(a, t.armor || 0.45);
    }
    return a;
  };
  G.mobOnHit = function (e, d, o) {
    if (!e.art || e.dead) return;
    e.hitT = 0.3;
    const P = W().P;
    // Gai: đang dựng gai mà bị đánh cận chiến thì phản đòn (kèm hệ của vùng).
    if (e.spikeUp > 0 && !o.ranged && !(e.reflT > 0)) {
      e.reflT = 0.45;
      G.hurtPlayer(e.dmg * 0.8, regEl(), e, false);
      FX('text', P.x, P.y - 46, 'Phản đòn!', '#ff7a5a', 8);
    }
    // Giáp phía trước: đánh trúng giáp thì giáp mòn dần, mòn hết thì vỡ một lúc.
    if (e.role === 'shield' && !(e.brokeT > 0) && (P.x - e.x) * e.face > -4) {
      e.armorHp -= d;
      if (e.armorHp <= 0) { e.brokeT = 6; FX('text', e.x, e.y - e.h - 8, 'Vỡ giáp!', '#ffd23f', 9); FX('burst', e.x + e.face * 8, e.y - e.h * 0.4, '#d0c8b8', 14, 70); G.sfx('boom', 1.4); }
    }
  };
  G.mobOnKill = function (e) {
    const w = W();
    if (e.trait === 'no') {
      // Tinh anh "Nổ khi chết": vòng đỏ lớn, nổ sau một lúc
      addZone('circle', { x: e.x, y: e.y, r: 44 }, 0.95, e.dmg * 1.2, regEl(), { fxKind: 'bomb', bomb: { x0: e.x, y0: e.y, fl: 0, big: true }, onFire: (z) => blast(z.x, z.y, z.r, regEl(), e.dmg) });
      G.sfx('warn', 0.9);
    }
    if (e.isBoss && e.art) w.bossDieT = dur(e.art, 'die') + 0.4;
  };

  // ---------- nổ theo hệ của vùng ----------
  function blast(x, y, r, el, dmg) {
    const w = W();
    FX('propBlast', { x, y }, el);
    G.sfx('boom', 1.1);
    if (el === 'poison') addZone('circle', { x, y, r: Math.round(r * 0.75) }, 0, dmg * 0.6, 'poison', { pool: true, life: 4, tick: 0.3 });
    else if (el === 'fire') {
      // vệt cháy: ba vũng lửa nhỏ loang ra
      for (let i = 0; i < 3; i++) { const a = G.rnd() * TAU, d = i ? r * 0.5 : 0; addZone('circle', { x: clamp(x + Math.cos(a) * d, w.x0, w.x1), y: clamp(y + Math.sin(a) * d * 0.7, w.y0, w.y1), r: Math.round(r * 0.45) }, 0, dmg * 0.6, 'fire', { pool: true, life: 3.2, tick: 0.3 }); }
    }
  }
  G.mobBlast = blast;
  // Đòn nổ trúng em bé: Băng thì đóng băng ngắn.
  function onBlastHit(el) { return el === 'ice' ? () => { const P = W().P; P.frozenT = Math.max(P.frozenT || 0, 0.65); FX('text', P.x, P.y - 48, 'Đóng băng!', '#bfeaff', 8); } : null; }

  // ---------- đòn đánh theo kiểu của từng con (don.kieu trong js/monster_art.js) ----------
  // Trả về vùng báo trước, đã xoay theo góc a.
  function strikeZone(e, a, T, mult, o) {
    const d = e.don, k = d.kieu || 'chem', tam = d.tam || 26, dmg = e.dmg * (mult || 1), base = Object.assign({ src: e, cancel: true, melee: true }, o || {});
    if (k === 'lao') return addZone('line', { x: e.x, y: e.y, ang: a, len: tam + 8, w: Math.max(14, (d.rong || 12) + 4) }, T, dmg, null, base);
    if (k === 'dap' || k === 'no') return addZone('circle', { x: e.x, y: e.y, r: tam }, T, dmg, null, base);
    if (k === 'phun') return addZone('cone', { x: e.x, y: e.y, ang: a, r: tam + 8, span: d.xoe || 1.2 }, T, dmg, null, base);
    return addZone('cone', { x: e.x, y: e.y, ang: a, r: tam + 6, span: Math.min(2.2, d.xoe || 1.9) }, T, dmg, null, base);
  }
  function reachOf(e) {
    const d = e.don, k = d.kieu || 'chem', tam = d.tam || 26;
    return k === 'lao' ? tam * 0.8 : k === 'dap' || k === 'no' ? tam * 0.7 : tam * 0.75;
  }
  function cancelZones(e) { for (const z of W().zones) if (z.src === e && z.t > 0) z.dead = true; }
  // Một lượt ra đòn: báo trước (anim tele) T giây, rồi ra đòn (anim atk).
  function begin(e, k, a, T, o) {
    e.act = Object.assign({ k, t: 0, T, a, fired: false, end: T + dur(e.art, 'atk') * 0.75 }, o || {});
    e.dirA = a;
    if (Math.abs(Math.cos(a)) > 0.15) e.face = Math.cos(a) > 0 ? 1 : -1;
    play(e, o && o.anim0 ? o.anim0 : 'tele', o && o.spd0);
    e.wind = T;
  }
  function shoot(e, a, sp, o) {
    const w = W(), d = e.don, cols = d.mau || null;
    w.projs.push(Object.assign({ team: 'enemy', kind: 'orb', x: e.x + Math.cos(a) * 8, y: e.y + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 3, dmg: e.dmg, el: null, src: e, col: cols ? cols[1] : null, col2: cols ? cols[0] : null, z: Math.min(18, e.h * 0.45) }, o || {}));
  }
  G.mobShoot = shoot;
  // Bom: bay từ (x0, y0) tới (x, y) trong fl giây, nằm đếm ngược fuse giây (vòng đỏ đầy dần), rồi nổ.
  function bomb(e, x, y, fl, fuse, r, o) {
    const w = W(), el = regEl();
    x = clamp(x, w.x0, w.x1); y = clamp(y, w.y0, w.y1);
    return addZone('circle', { x, y, r: r || 26 }, fl + fuse, e.dmg * 1.2, el, Object.assign({ fxKind: 'bomb', bomb: { x0: e.x, y0: e.y - e.h * 0.5, fl, art: e.art }, onHit: onBlastHit(el), onFire: (z) => blast(z.x, z.y, z.r, el, e.dmg) }, o || {}));
  }
  G.mobBomb = bomb;
  // Gọi quái phụ: vòng báo rồi quái phụ trồi lên.
  function summon(role, x, y, o) {
    const w = W();
    w.spawns = w.spawns || [];
    w.spawns.push({ role, x: clamp(x, w.x0 + 6, w.x1 - 6), y: clamp(y, w.y0 + 4, w.y1 - 4), t: 0.8, t0: 0.8, add: true, opt: Object.assign({ add: true }, o || {}) });
  }
  G.mobSummonSpot = summon;

  // ---------- cập nhật mỗi khung ----------
  const G_mob = (G.mob = {});
  G_mob.update = function (e, dt) {
    const w = W(), P = w.P;
    if (e.an) e.an.t += dt * (e.an.spd || 1);
    if (e.hitT > 0) e.hitT -= dt;
    if (e.reflT > 0) e.reflT -= dt;
    if (e.brokeT > 0) { e.brokeT -= dt; if (e.brokeT <= 0) e.armorHp = e.armorMax; }
    e.moving = false;
    if (e.boomT != null) { e.boomT -= dt; if (e.boomT <= 0) e.dead = true; return; } // cảm tử đang nổ
    if (e.spawnT > 0) { e.spawnT -= dt; if (e.spawnT <= 0) loop(e, 'idle'); return; }
    if (e.dive) { stepDive(e, dt, P); return; }
    if (e.st.frozen > 0 || e.st.stun > 0) {
      if (e.act && !e.act.fired) { cancelZones(e); e.act = null; }
      e.wind = 0; e.lungeT = 0; e.spikeUp = 0;
      return;
    }
    const sp = e.speed * Math.max(0.4, 1 - 0.15 * e.st.iceN) * (e.st.root > 0 ? 0 : 1);
    if (e.lungeT > 0) {
      const k = Math.min(dt, e.lungeT); e.lungeT -= dt;
      e.x += Math.cos(e.act ? e.act.a : e.dirA) * e.lv * k; e.y += Math.sin(e.act ? e.act.a : e.dirA) * e.lv * k;
      e.x = clamp(e.x, w.x0, w.x1); e.y = clamp(e.y, w.y0, w.y1);
    }
    e.cd -= dt;
    if (e.act) { stepAct(e, dt, P); return; }
    if (e.spikeUp > 0) { e.spikeUp -= dt; if (e.spikeUp <= 0) spikeShot(e); return; }
    think(e, dt, P, sp);
    if (!e.act && !e.dive) loop(e, e.moving ? 'move' : 'idle');
    e.y = clamp(e.y, w.y0, w.y1);
  };
  function stepAct(e, dt, P) {
    const A = e.act;
    A.t += dt;
    e.wind = Math.max(0, A.T - A.t);
    if (!A.fired && A.t >= A.T) {
      A.fired = true;
      e.wind = 0;
      play(e, A.anim1 || 'atk', A.spd1);
      if (A.fire) A.fire(e, A, P);
    }
    if (A.step) A.step(e, A, dt, P);
    if (A.t >= A.end) { const k = A.k; e.act = null; e.cd = A.cd != null ? A.cd : 1.4; if (A.after) A.after(e); if (k !== 'boom') loop(e, 'idle'); }
  }
  // Đi tới cách em bé khoảng want (đứng xa thì tiến lại, đứng gần quá thì lùi), có lượn vòng nhẹ.
  function keep(e, P, want, sp, dt, side) {
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, w = W();
    let tx, ty;
    if (Math.abs(d - want) < 10) { const a = Math.atan2(-dy, -dx) + (side || 0.5) * 0.6; tx = P.x + Math.cos(a) * want; ty = P.y + Math.sin(a) * want; }
    else { tx = P.x - (dx / d) * want; ty = P.y - (dy / d) * want; }
    tx = clamp(tx, w.x0 + 4, w.x1 - 4); ty = clamp(ty, w.y0 + 2, w.y1 - 2);
    const mx = tx - e.x, my = ty - e.y, md = Math.hypot(mx, my);
    if (md > 3) { e.x += (mx / md) * sp * dt; e.y += (my / md) * sp * 0.8 * dt; e.moving = true; }
    if (Math.abs(dx) > 3) e.face = dx > 0 ? 1 : -1;
    return d;
  }
  // Quái giáp xoay mặt chậm: em bé đứng sau lưng hơn 0,9 giây nó mới quay lại.
  function faceSlow(e, P, dt) {
    const want = P.x >= e.x ? 1 : -1;
    if (want === e.face) { e.turnT = 0; return; }
    e.turnT += dt;
    if (e.turnT > 0.9) { e.face = want; e.turnT = 0; }
  }

  function think(e, dt, P, sp) {
    const w = W(), d = Math.hypot(P.x - e.x, P.y - e.y), a = angTo(e, P), role = e.role;
    if (role === 'elite') return thinkElite(e, dt, P, sp, d, a);
    if (role === 'archer') {
      e.sumCd -= dt;
      const allies = w.ents.filter((x) => !x.dead && x.sum === e).length + (w.spawns || []).filter((s) => s.opt && s.opt.sumBy === e).length;
      if (e.sumCd <= 0 && allies < 2 && w.ents.length < 9) {
        e.sumCd = G.rr(9, 12);
        begin(e, 'summon', a, 0.6, { cd: 1, fire: (q) => { for (let i = 0; i < 2; i++) { const b = a + PI + (i ? 0.9 : -0.9); summon('swarm', q.x + Math.cos(b) * 26, q.y + Math.sin(b) * 20, { hpMult: 0.45, sumBy: q }); } FX('sparkle', q.x, q.y - q.h * 0.5, '#ffd23f', 10); } });
        return;
      }
      const want = Math.min(120, (w.x1 - w.x0) * 0.42);
      keep(e, P, want, sp, dt, e.t % 6 < 3 ? 1 : -1);
      if (e.cd <= 0 && d < 190) {
        if (e.don.kieu === 'nem') begin(e, 'lob', a, 0.55, { cd: 2.4, end: 0.55 + 0.5, fire: (q) => { bomb(q, P.x, P.y, 0.45, 0.55, 18); } });
        else begin(e, 'shot', a, 0.55, { cd: 2.2, end: 1.0, aim: true, fire: (q, A) => { const b = angTo(q, P); q.dirA = b; shoot(q, b, 140); } });
        G.sfx('warn', 1.3);
      }
      return;
    }
    if (role === 'bomber') {
      keep(e, P, e.art === 'sua' ? 60 : 95, sp, dt, 1);
      if (e.cd <= 0 && d < 170) {
        if (e.art === 'sua') begin(e, 'drop', a, 0.5, { cd: 3, end: 0.9, anim1: 'idle', fire: (q) => bomb(q, q.x, q.y, 0, 1.6, 28) });
        else begin(e, 'lob', a, 0.5, { cd: 3, end: 0.5 + dur(e.art, 'atk') * 0.8, fire: (q) => bomb(q, P.x, P.y, 0.5, 1.2, 26) });
      }
      return;
    }
    if (role === 'kami') {
      const tam = e.don.tam || 32;
      if (d > tam * 0.6) { moveTo(e, P.x, P.y, sp, dt); }
      if (d < tam + 6 && e.cd <= 0) {
        const el = regEl();
        begin(e, 'boom', a, 0.85, {
          cd: 9, end: 0.85 + dur(e.art, 'atk'),
          zone: addZone('circle', { x: e.x, y: e.y, r: tam + 6 }, 0.85, e.dmg * 1.3, el, { src: e, cancel: true, onHit: onBlastHit(el) }),
          fire: (q) => { q.ghost = true; q.boomT = dur(q.art, 'atk') * 0.95; blast(q.x, q.y, tam, el, q.dmg); },
        });
        G.sfx('warn', 0.8);
      }
      return;
    }
    if (role === 'spiky') {
      e.spikeCd -= dt;
      if (e.spikeCd <= 0 && d < 140) {
        e.spikeCd = G.rr(4.5, 6);
        e.spikeUp = 2.2; e.spikeT0 = 2.2;
        play(e, 'tele', 0.5);
        G.sfx('warn', 0.7);
        return;
      }
      keep(e, P, 46, sp, dt, 1);
      if (e.cd <= 0 && d < 60) melee(e, a, 0.6, 1.5);
      return;
    }
    if (role === 'shield') {
      e.healCd -= dt;
      faceSlow(e, P, dt);
      if (e.healCd <= 0) {
        const hurt = w.ents.filter((x) => !x.dead && x !== e && x.hp < x.maxhp * 0.95 && Math.hypot(x.x - e.x, x.y - e.y) < 90);
        e.healCd = hurt.length ? G.rr(7, 9) : 1.5;
        if (hurt.length) {
          begin(e, 'heal', e.face > 0 ? 0 : PI, 0.6, { cd: 1, keepFace: true, fire: (q) => {
            for (const x of w.ents) if (!x.dead && Math.hypot(x.x - q.x, x.y - q.y) < 90) { const h = x.maxhp * 0.14; x.hp = Math.min(x.maxhp, x.hp + h); FX('text', x.x, x.y - x.h - 4, '+' + Math.round(h), '#8fe86a', 8); }
            q.healFx = 0.6; FX('sparkle', q.x, q.y - 6, '#8fe86a', 14); G.sfx('pick', 1.6);
          } });
          return;
        }
      }
      const dx = P.x - e.x, dd = Math.hypot(dx, P.y - e.y);
      if (dd > 20) { const k = sp / dd; e.x += dx * k * dt; e.y += (P.y - e.y) * k * 0.75 * dt; e.moving = true; }
      if (e.cd <= 0 && d < reachOf(e) + 4) { const f = e.face > 0 ? 0 : PI; begin(e, 'hit', f, 0.6, { cd: 1.6, keepFace: true, zone: strikeZone(e, f, 0.6), fire: () => { W().shake = Math.max(W().shake, 0.08); } }); }
      return;
    }
    if (role === 'nimble') {
      e.diveCd -= dt;
      if (e.diveCd <= 0) { startDive(e); return; }
      if (e.retreat > 0) { e.retreat -= dt; keep(e, P, 90, sp, dt, 1); return; }
      keep(e, P, reachOf(e) * 0.9, sp, dt, 1);
      if (e.cd <= 0 && d < reachOf(e) + 8) melee(e, a, 0.45, 1.8, () => { e.retreat = 0.9; });
      return;
    }
    // xông tới và bầy nhỏ
    const reach = reachOf(e);
    if (d > reach * 0.85) moveTo(e, P.x, P.y, sp, dt);
    else if (Math.abs(P.x - e.x) > 3) e.face = P.x > e.x ? 1 : -1;
    if (e.cd <= 0 && d < reach + 6) melee(e, a, role === 'swarm' ? 0.42 : 0.58, role === 'swarm' ? 1.3 : 1.5);
  }
  function moveTo(e, tx, ty, sp, dt) {
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d > 2) { e.x += (dx / d) * sp * dt; e.y += (dy / d) * sp * 0.8 * dt; e.moving = true; }
    if (Math.abs(dx) > 3) e.face = dx > 0 ? 1 : -1;
  }
  // Đòn cận chiến theo kiểu của con quái; lao thì thân lao tới thật (tự dời vị trí, chỉ dùng nửa đầu cử động).
  function melee(e, a, T, cd, after) {
    const lao = e.don.kieu === 'lao';
    begin(e, 'melee', a, T, {
      cd, after, zone: strikeZone(e, a, T),
      fire: (q) => { if (lao) { const L = (q.don.tam || 30) * 0.8; q.lungeT = 0.16; q.lv = L / 0.16; FX('lunge', q); } },
      end: T + dur(e.art, 'atk') * (lao ? 0.5 : 0.75),
    });
  }
  // Gai: hết lúc dựng gai thì bắn gai toả tròn tám hướng.
  function spikeShot(e) {
    const n = e.don.so || 8, el = regEl();
    play(e, 'atk');
    for (let i = 0; i < n; i++) shoot(e, i / n * TAU + (e.t % 1) * 0.4, 105, { kind: 'spike', dmg: e.dmg * 0.8, el: el === 'poison' ? 'poison' : null, t: 1.4 });
    e.cd = 1.2;
    G.sfx('swing', 1.4);
  }
  // Nhanh nhẹn: lặn / chui xuống, đi ngầm tới sau lưng em bé, vòng đỏ báo chỗ trồi lên, trồi lên kèm một đòn.
  function startDive(e) {
    e.dive = { k: 'down', t: 0, T: dur(e.art, 'spawn') * 0.5 };
    e.act = null; e.wind = 0;
    play(e, 'spawn'); e.an.rev = true;
    G.sfx('swing', 0.6);
  }
  function stepDive(e, dt, P) {
    const D = e.dive, w = W();
    D.t += dt;
    if (D.k === 'down') {
      if (D.t >= D.T) { e.hidden = true; D.k = 'under'; D.t = 0; D.T = 0.5; }
    } else if (D.k === 'under') {
      if (D.t >= D.T) {
        // chỗ trồi lên: sau lưng hoặc bên cạnh em bé, có vòng đỏ báo trước
        const side = G.rnd() < 0.5 ? -P.face : (G.rnd() < 0.5 ? 1 : -1);
        const x = clamp(P.x + side * 34, w.x0 + 6, w.x1 - 6), y = clamp(P.y + G.rr(-16, 16), w.y0 + 3, w.y1 - 3);
        D.x = x; D.y = y; D.k = 'warn'; D.t = 0; D.T = 0.75;
        D.zone = addZone('circle', { x, y, r: 20 }, 0.75, e.dmg, null, { src: e, melee: true });
        e.x = x; e.y = y;
      }
    } else if (D.k === 'warn') {
      if (D.t >= D.T) { e.hidden = false; D.k = 'up'; D.t = 0; D.T = dur(e.art, 'spawn') * 0.55; play(e, 'spawn', 1.8); e.face = P.x >= e.x ? 1 : -1; FX('burst', e.x, e.y, '#d8d0c0', 10, 70); }
    } else if (D.t >= D.T) {
      e.dive = null; e.diveCd = G.rr(4.5, 6.5); e.cd = 0.15;
      loop(e, 'idle');
    }
  }

  // ---------- tinh anh ----------
  function thinkElite(e, dt, P, sp, d, a) {
    const w = W(), id = e.art, el = e.el || regEl(), fast = e.trait === 'nhanh' ? 0.75 : 1;
    e.skCd -= dt;
    if (e.skCd <= 0 && d < 170) {
      e.skCd = G.rr(6, 7.5) * fast;
      const T = 0.7 * (e.trait === 'nhanh' ? 0.85 : 1), D = dur(id, 'chieu1');
      const o = { cd: 1.2 * fast, anim0: 'chieu1', anim1: 'chieu1', end: D };
      // Chiêu riêng chạy trọn cử động chieu1 (đã gồm báo trước trong hình); vùng báo của luật chơi nổ ở mốc T.
      if (id === 'cuaTuong') {
        // Kẹp chéo: hai đường chém chéo hình chữ X đi qua chỗ em bé đứng
        const L = 110;
        for (const s of [-1, 1]) { const b = a + s * PI / 4; addZone('line', { x: P.x - Math.cos(b) * L / 2, y: P.y - Math.sin(b) * L / 2, ang: b, len: L, w: 14 }, T + 0.1, e.dmg * 1.3, el, { src: e, cancel: true, melee: true }); }
      } else if (id === 'caNocChua') {
        // Gai xoáy: hai đợt gai băng toả tròn lệch nhau
        o.fire = (q) => { for (let j = 0; j < 2; j++) G.later(j * 0.35, () => { if (!q.dead) for (let i = 0; i < 10; i++) shoot(q, (i + j * 0.5) / 10 * TAU, 100, { kind: 'spike', dmg: q.dmg * 0.8, el: 'ice', t: 1.6 }); }); };
      } else if (id === 'heoNanh') {
        // Húc ba lần zíc zắc: mỗi lần nhắm lại theo chỗ em bé
        o.end = 0.5 + 3 * 0.55; o.anim1 = 'atk';
        for (let j = 0; j < 3; j++) G.later(j * 0.55, () => {
          if (e.dead || !e.act || e.act.k !== 'sk') return;
          const b = angTo(e, P) + (j - 1) * 0.35; e.act.a = b; e.dirA = b; if (Math.abs(Math.cos(b)) > 0.15) e.face = Math.cos(b) > 0 ? 1 : -1;
          addZone('line', { x: e.x, y: e.y, ang: b, len: 66, w: 22 }, 0.45, e.dmg * 1.2, null, { src: e, cancel: true, melee: true, onFire: () => { if (!e.dead && e.act) { e.lungeT = 0.15; e.lv = 52 / 0.15; play(e, 'atk', 1.4); } } });
        });
        o.anim0 = 'tele'; o.T = 0.45;
      } else if (id === 'namPhongChua') {
        // Mưa bào tử: năm quả rơi quanh em bé, để lại khí độc
        for (let i = 0; i < 5; i++) { const q = near(P.x, P.y, i ? 60 : 0, i ? 30 : 0); addZone('circle', { x: q[0], y: q[1], r: 17 }, T + 0.2 + i * 0.1, e.dmg, 'poison', { src: e, cancel: true, then: 3, fxKind: 'fruit' }); }
      } else if (id === 'tuongMa') {
        // Đao xoáy: xoay hai vòng chém quanh mình
        for (let j = 0; j < 2; j++) addZone('circle', { x: e.x, y: e.y, r: 50 }, T + j * 0.45, e.dmg * 1.1, null, { src: e, cancel: true, melee: true });
      } else if (id === 'huChua') {
        // Vòng cầu lửa: hai đợt cầu lửa toả tròn
        o.fire = (q) => { for (let j = 0; j < 2; j++) G.later(j * 0.4, () => { if (!q.dead) for (let i = 0; i < 10; i++) shoot(q, (i + j * 0.5) / 10 * TAU, 95, { kind: 'fire', dmg: q.dmg * 0.8, el: 'fire', t: 1.8 }); }); };
      }
      begin(e, 'sk', a, o.T || T, o);
      G.sfx('warn', 0.9);
      return;
    }
    const reach = reachOf(e);
    const k = e.don.kieu;
    if (k === 'gai' || k === 'no') {
      keep(e, P, reach * 0.7, sp, dt, 1);
      if (e.cd <= 0 && d < reach + 8) {
        if (k === 'gai') begin(e, 'gai', a, 0.6 * fast, { cd: 1.8 * fast, fire: (q) => { for (let i = 0; i < 8; i++) shoot(q, i / 8 * TAU, 100, { kind: 'spike', dmg: q.dmg * 0.8, el: 'ice', t: 1.3 }); } });
        else begin(e, 'no', a, 0.7 * fast, { cd: 1.9 * fast, zone: addZone('circle', { x: e.x, y: e.y, r: (e.don.tam || 40) }, 0.7 * fast, e.dmg * 1.1, el, { src: e, cancel: true, melee: true }) });
      }
      return;
    }
    if (d > reach * 0.85) moveTo(e, P.x, P.y, sp, dt);
    if (e.cd <= 0 && d < reach + 8) melee(e, a, 0.6 * fast, 1.5 * fast);
  }
  function near(x, y, dx, dy) { const w = W(); return [clamp(x + G.rr(-dx, dx), w.x0 + 6, w.x1 - 6), clamp(y + G.rr(-dy, dy), w.y0, w.y1)]; }
  G.mobNear = near;
  // Hẹn giờ nhỏ dùng chung (chạy theo thời gian của thế giới, xoá khi đổi phòng).
  G.later = function (t, f) { const w = W(); if (!w) return; (w.timers || (w.timers = [])).push({ t, f }); };
  G.mob.tick = function (dt) {
    const w = W();
    if (!w || !w.timers || !w.timers.length) return;
    for (const o of w.timers) o.t -= dt;
    const due = w.timers.filter((o) => o.t <= 0);
    w.timers = w.timers.filter((o) => o.t > 0);
    for (const o of due) o.f();
  };
})();

// ======================= VẼ =======================
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const A = G.art;
  if (!A) return;
  const MA = () => G.monsterArt;
  const dur = (id, a) => { const m = MA(); return (m && m.dur(id, a)) || 0.6; };
  const p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

  // ---------- vùng báo trước: quét từng hàng điểm ảnh, kiểu giống vùng tròn của art.js ----------
  // f(px, py) trả 0 (ngoài), 1 (trong), 2 (phần đã đầy theo thời gian), 3 (viền)
  function scan(c, x0, y0, x1, y1, f, cols) {
    x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.ceil(x1); y1 = Math.ceil(y1);
    for (let y = y0; y <= y1; y++) {
      let run = -1, lv = 0;
      for (let x = x0; x <= x1 + 1; x++) {
        const v = x <= x1 ? f(x + 0.5, y + 0.5) : 0;
        if (v !== lv) { if (lv) { c.fillStyle = cols[lv - 1]; c.fillRect(run, y, x - run, 1); } run = x; lv = v; }
      }
    }
  }
  function zcols(z) {
    const tele = z.t > 0, blink = Math.floor(G.time * 10) % 2;
    if (!tele) return ['rgba(255,244,210,0.8)', 'rgba(255,244,210,0.8)', '#ffffff'];
    const pulse = (0.26 + 0.14 * Math.abs(Math.sin(G.time * 14))).toFixed(2);
    return ['rgba(255,40,24,' + pulse + ')', 'rgba(255,90,50,0.5)', blink ? '#ff3a22' : '#ffb09a'];
  }
  function prog(z) { return z.t > 0 && z.t0 ? clamp(1 - z.t / z.t0, 0, 1) : 1; }
  function drawLine(c, z) {
    const cs = Math.cos(z.ang), sn = Math.sin(z.ang), L = z.len, hw = z.w / 2, u = prog(z), lu = L * u;
    const pts = [[0, -hw], [0, hw], [L, -hw], [L, hw]].map(([a, b]) => [z.x + a * cs - b * sn, z.y + a * sn + b * cs]);
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    scan(c, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (px, py) => {
      const dx = px - z.x, dy = py - z.y, al = dx * cs + dy * sn, ac = -dx * sn + dy * cs;
      if (al < 0 || al > L || Math.abs(ac) > hw) return 0;
      if (al < 1.2 || al > L - 1.2 || Math.abs(ac) > hw - 1.2) return 3;
      return al <= lu ? 2 : 1;
    }, zcols(z));
  }
  function drawCone(c, z) {
    const r = z.r, u = prog(z), ru = r * u, half = z.span / 2;
    let x0 = z.x, x1 = z.x, y0 = z.y, y1 = z.y;
    for (let i = 0; i <= 8; i++) { const a = z.ang - half + (z.span * i) / 8; x0 = Math.min(x0, z.x + Math.cos(a) * r); x1 = Math.max(x1, z.x + Math.cos(a) * r); y0 = Math.min(y0, z.y + Math.sin(a) * r); y1 = Math.max(y1, z.y + Math.sin(a) * r); }
    scan(c, x0 - 1, y0 - 1, x1 + 1, y1 + 1, (px, py) => {
      const dx = px - z.x, dy = py - z.y, d = Math.hypot(dx, dy);
      if (d > r) return 0;
      let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) > half) return 0;
      if (d > r - 1.3 || Math.abs(da) > half - 1.3 / Math.max(d, 1)) return 3;
      return d <= ru ? 2 : 1;
    }, zcols(z));
  }
  function drawDonut(c, z) {
    const u = prog(z), rm = z.r0 + (z.r1 - z.r0) * u, gw = z.gw || 0;
    scan(c, z.x - z.r1 - 1, z.y - z.r1 - 1, z.x + z.r1 + 1, z.y + z.r1 + 1, (px, py) => {
      const dx = px - z.x, dy = py - z.y, d = Math.hypot(dx, dy);
      if (d > z.r1 || d < z.r0) return 0;
      if (z.gaps) { const a = Math.atan2(dy, dx); for (const g of z.gaps) { let da = a - g; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < gw) return Math.abs(da) > gw - 1.3 / d ? 3 : 0; } }
      if (d > z.r1 - 1.3 || d < z.r0 + 1.3) return 3;
      return d <= rm ? 2 : 1;
    }, zcols(z));
  }
  // Tường nước chạy: dải nước vuông góc hướng chạy, chừa khe (mép khe sáng trắng)
  function drawWall(c, z) {
    const cs = Math.cos(z.ang), sn = Math.sin(z.ang), t = G.time;
    const at = (a, b) => [z.x + a * cs - b * sn, z.y + a * sn + b * cs];
    if (z.wait > 0) {
      // báo trước: vệt đỏ dọc đường tường sẽ chạy qua, khe để trắng
      const blink = Math.floor(t * 10) % 2;
      for (let b = -z.half; b <= z.half; b += 2) {
        if (Math.abs(b - z.g) <= z.gw) { if (Math.abs(Math.abs(b - z.g) - z.gw) < 2) { const q = at(z.s + 6, b); p(c, q[0], q[1], 2, 2, '#ffffff'); } continue; }
        for (let a = 0; a < 26; a += 4) { const q = at(z.s + a, b); p(c, q[0], q[1], 2, 2, blink ? 'rgba(255,58,34,0.55)' : 'rgba(255,176,154,0.45)'); }
      }
      return;
    }
    for (let b = -z.half; b <= z.half; b += 2) {
      if (Math.abs(b - z.g) <= z.gw) continue;
      const o = Math.sin(b * 0.2 + t * 12) * 2;
      for (let a = -z.th / 2; a <= z.th / 2; a += 2) { const q = at(z.s + a + o, b); p(c, q[0], q[1], 2, 2, a > z.th / 2 - 3 ? '#ffffff' : a > 0 ? '#9fd0e8' : '#4a80b0'); }
    }
    for (const s of [-1, 1]) { const q = at(z.s, z.g + s * z.gw); p(c, q[0] - 1, q[1] - 1, 3, 3, '#ffffff'); }
  }
  // Bom: lúc bay thì vẽ quả bom theo vòng cung, lúc nằm thì quả bom nhấp nháy giữa vòng đỏ đếm ngược
  function drawBomb(c, z) {
    const B = z.bomb, el = z.el, T0 = z.t0, gone = T0 - z.t;
    const col = el === 'ice' ? ['#1b4c92', '#3883d4', '#a6deff'] : el === 'poison' ? ['#58208c', '#9a48d4', '#e4a8ff'] : ['#5a1a0a', '#c43c10', '#ffd23c'];
    let x = z.x, y = z.y, lift = 0;
    if (B.fl > 0 && gone < B.fl) { const q = gone / B.fl; x = B.x0 + (z.x - B.x0) * q; y = B.y0 + (z.y - B.y0) * q; lift = Math.sin(q * PI) * 26; }
    const s = B.big ? 5 : 3;
    p(c, x - s, y - 1, s * 2, 2, 'rgba(0,0,0,0.3)');
    const by = y - s - lift - 1;
    p(c, x - s, by - s + 1, s * 2, s * 2 - 2, '#14182e'); p(c, x - s + 1, by - s, s * 2 - 2, s * 2, '#14182e');
    p(c, x - s + 1, by - s + 1, s * 2 - 2, s * 2 - 2, col[1]); p(c, x - s + 1, by - s + 1, 2, 2, col[2]);
    if (z.t > 0 && (gone >= B.fl)) {
      const k = 1 - z.t / Math.max(0.01, T0 - B.fl), fast = k > 0.7 ? 20 : 8;
      if (Math.floor(G.time * fast) % 2) p(c, x - 1, by - s - 3, 2, 3, '#ffd23c');
      p(c, x, by - s - 4, 1, 1, '#ffffff');
    }
  }
  const zone0 = A.zone;
  A.zone = function (c, z) {
    if (z.wall) return drawWall(c, z);
    if (z.shape === 'line') return z.pool ? null : drawLine(c, z);
    if (z.shape === 'cone') return drawCone(c, z);
    if (z.shape === 'donut') return drawDonut(c, z);
    zone0(c, z);
    if (z.bomb) drawBomb(c, z);
  };
  // fx.zoneFire chỉ biết vùng tròn và chữ nhật: vùng mới thì rải vài chớp sáng dọc hình
  if (G.fx && G.fx.zoneFire) {
    const zf0 = G.fx.zoneFire;
    G.fx.zoneFire = function (z) {
      if (z.shape === 'circle' || z.shape === 'rect' || z.wave) return zf0(z);
      if (G.noRender || z.team === 'player') return;
      const pts = [];
      if (z.shape === 'line') for (let i = 0; i <= 3; i++) pts.push([z.x + Math.cos(z.ang) * z.len * i / 3, z.y + Math.sin(z.ang) * z.len * i / 3]);
      else if (z.shape === 'cone') for (let i = 0; i < 4; i++) { const a = z.ang + (i / 3 - 0.5) * z.span; pts.push([z.x + Math.cos(a) * z.r * 0.7, z.y + Math.sin(a) * z.r * 0.7]); }
      else if (z.shape === 'donut') for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = (z.r0 + z.r1) / 2; pts.push([z.x + Math.cos(a) * r, z.y + Math.sin(a) * r]); }
      const col = z.el ? G.EL[z.el].col : '#fff0c8';
      for (const q of pts) G.fx.burst(q[0], q[1], col, 4, 60);
      if (G.fx.shake) G.fx.shake(0.15);
    };
  }

  // ---------- đạn của quái ----------
  const proj0 = A.proj;
  A.proj = function (c, o) {
    if (o.team !== 'enemy' || !(o.kind === 'spike' || o.kind === 'orb' || o.kind === 'bua')) return proj0(c, o);
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10)), sp = Math.hypot(o.vx, o.vy) || 1, ux = o.vx / sp, uy = o.vy / sp;
    p(c, x - 2, Math.round(o.y), 4, 1, 'rgba(0,0,0,0.3)');
    const col = o.col || (o.el ? G.EL[o.el].col : '#bfeaff');
    if (o.kind === 'spike') {
      for (let i = -4; i <= 3; i++) p(c, x + ux * i, y + uy * i, 1, 1, i > 1 ? '#ffffff' : i > -2 ? col : '#14182e');
      p(c, x + ux * 4, y + uy * 4, 1, 1, '#ffffff');
      return;
    }
    if (o.kind === 'bua') {
      // lá bùa bay: tờ giấy vàng chữ đỏ, rung nhẹ
      const f = Math.floor(G.time * 10) % 2;
      p(c, x - 3, y - 4 + f, 6, 8, '#14182e'); p(c, x - 2, y - 3 + f, 4, 6, '#f4e070'); p(c, x - 1, y - 2 + f, 2, 1, '#c8372d'); p(c, x - 1, y + f, 2, 1, '#c8372d');
      return;
    }
    p(c, x - 3, y - 2, 6, 4, '#14182e'); p(c, x - 2, y - 3, 4, 6, '#14182e');
    p(c, x - 2, y - 2, 4, 4, col); p(c, x - 1, y - 2, 1, 1, '#ffffff');
    for (let i = 1; i < 3; i++) p(c, x - ux * i * 3, y - uy * i * 3, 1, 1, o.col2 || col);
  };

  // ---------- biểu tượng nhỏ trên đầu ----------
  function icon(c, kind, x, y) {
    x = Math.round(x); y = Math.round(y);
    p(c, x - 4, y - 4, 9, 9, 'rgba(20,24,46,0.85)');
    if (kind === 'nhanh') { p(c, x, y - 3, 2, 3, '#ffd23f'); p(c, x - 2, y - 1, 4, 2, '#ffd23f'); p(c, x - 1, y + 1, 2, 3, '#ffd23f'); }
    else if (kind === 'giap') { p(c, x - 3, y - 3, 7, 4, '#c9ccd2'); p(c, x - 2, y + 1, 5, 2, '#c9ccd2'); p(c, x - 1, y + 3, 3, 1, '#c9ccd2'); p(c, x, y - 2, 1, 4, '#6a7080'); }
    else if (kind === 'no') { p(c, x - 2, y - 1, 5, 5, '#2a2a2a'); p(c, x - 1, y - 2, 3, 7, '#2a2a2a'); p(c, x - 1, y, 1, 1, '#8a8a8a'); p(c, x + 1, y - 3, 1, 2, '#c8a060'); p(c, x + 2, y - 4, 2, 1, Math.floor(G.time * 10) % 2 ? '#ff5a2a' : '#ffd23f'); }
    else if (kind === 'hut') { p(c, x, y - 3, 1, 2, '#e02a3a'); p(c, x - 1, y - 1, 3, 2, '#e02a3a'); p(c, x - 2, y + 1, 5, 2, '#e02a3a'); p(c, x - 1, y + 3, 3, 1, '#e02a3a'); p(c, x - 1, y, 1, 1, '#ffb0b8'); }
    else if (kind === 'gai') { const f = Math.floor(G.time * 12) % 2; p(c, x - 1, y - 3, 3, 5, f ? '#ff3a22' : '#ffffff'); p(c, x - 1, y + 3, 3, 1, f ? '#ff3a22' : '#ffffff'); }
    else if (kind === 'vo') { p(c, x - 3, y - 3, 7, 4, '#7a7a80'); p(c, x - 2, y + 1, 5, 2, '#7a7a80'); p(c, x, y - 3, 1, 6, '#14182e'); p(c, x - 1, y - 1, 1, 1, '#14182e'); }
  }
  G.mobIcon = icon;
  // Mặt khiên của quái giáp: vệt cong vàng ở phía trước (biết phải vòng ra sau)
  function shieldArc(c, e) {
    const f = e.face, r = e.r + 5;
    for (let i = -4; i <= 4; i++) { const a = (i / 4) * 0.9, x = e.x + f * Math.cos(a) * r, y = e.y - 4 + Math.sin(a) * r * 0.7; p(c, x, y, 2, 2, e.hitT > 0.2 ? '#ffffff' : 'rgba(255,214,90,0.85)'); }
  }

  // ---------- vẽ quái thường và tinh anh ----------
  const enemy0 = A.enemy;
  A.enemy = function (c, e) {
    if (!e.art || !MA()) return enemy0(c, e);
    if (e.hidden && e.dying == null) { drawUnder(c, e); return; }
    let n = e.an ? e.an.n : 'idle', t = e.an ? e.an.t : 0, o = {};
    if (e.dying != null) { n = 'die'; t = e.dying * dur(e.art, 'die'); }
    else if (e.st && e.st.frozen > 0) { n = 'idle'; t = 0; }
    else if (e.st && e.st.stun > 0) { n = 'hit'; t = 0.08 + 0.06 * Math.sin(G.time * 9); }
    else if (e.hitT > 0 && (n === 'idle' || n === 'move')) { n = 'hit'; t = 0.3 - e.hitT; }
    if (e.an && e.an.rev && n === 'spawn') t = Math.max(0, dur(e.art, 'spawn') - t); // lặn xuống: cử động xuất hiện chạy ngược
    if (e.an && e.an.cut && n === e.an.n) t = Math.min(t, e.an.cut * dur(e.art, n)); // cú lao: chỉ dùng nửa đầu cử động
    const k = e.don && e.don.kieu;
    if (n === 'atk' && (k === 'ban' || k === 'nem')) o.fx = false; // đạn thật do luật chơi bắn, không vẽ thêm đạn giả
    const dir = e.act ? e.act.a : e.dirA != null ? e.dirA : e.face > 0 ? 0 : PI;
    Object.assign(o, { anim: n, t, face: e.face, dir, hit: e.flash > 0 ? 0.8 : 0, bao: false });
    if (e.role === 'shield' && !(e.brokeT > 0) && e.dying == null) shieldArc(c, e);
    if (e.spikeUp > 0 && e.dying == null) {
      // đang dựng gai: vòng đỏ nhấp nháy quanh chân
      const bl = Math.floor(G.time * 12) % 2;
      A.ellipse(c, e.x, e.y, e.r + 7, (e.r + 7) * 0.6, bl ? 'rgba(255,58,34,0.35)' : 'rgba(255,176,154,0.25)');
    }
    if (e.act && e.act.aim && e.wind > 0) {
      // đường ngắm của quái bắn xa
      const P = W().P, a = Math.atan2(P.y - e.y, P.x - e.x), L = Math.min(150, Math.hypot(P.x - e.x, P.y - e.y));
      const bl = Math.floor(G.time * 14) % 2;
      for (let i = 10; i < L; i += 4) p(c, e.x + Math.cos(a) * i, e.y - 6 + Math.sin(a) * i, 2, 1, bl ? 'rgba(255,58,34,0.8)' : 'rgba(255,200,180,0.6)');
    }
    G.monsterArt.draw(c, e.art, e.x, e.y, o);
    if (e.healFx > 0) { e.healFx -= 1 / 60; A.ellipse(c, e.x, e.y, 90 * (1 - e.healFx / 0.6), 90 * 0.6 * (1 - e.healFx / 0.6), 'rgba(143,232,106,0.18)'); }
    if (e.dying != null) return;
    const top = e.y - e.h - 2;
    const ic = [];
    if (e.trait) ic.push(e.trait);
    if (e.spikeUp > 0) ic.push('gai');
    if (e.role === 'shield' && e.brokeT > 0) ic.push('vo');
    ic.forEach((k2, i) => icon(c, k2, e.x + (i - (ic.length - 1) / 2) * 11, top - 6));
    if (e.wind > 0 && e.wind < 0.25 && !e.trait) { const cc = Math.floor(G.time * 10) & 1 ? '#fff3b0' : '#ff4030'; p(c, e.x - 1, top - 12, 2, 5, cc); p(c, e.x - 1, top - 6, 2, 2, cc); }
    A.status(c, e, Math.round(e.x), Math.round(top));
  };
  // Đang đi ngầm dưới đất: chỉ thấy vệt đất gợn
  function drawUnder(c, e) {
    const D = e.dive;
    if (!D || D.k === 'down') return;
    const f = Math.floor(G.time * 12) % 3;
    p(c, e.x - 5 + f, e.y, 4, 1, 'rgba(0,0,0,0.35)'); p(c, e.x + 1 - f, e.y + 1, 4, 1, 'rgba(0,0,0,0.25)');
  }

  // ---------- em bé đứng sau quái to: vẽ thêm bóng mờ của bé lên trên ----------
  G.mobHeroOver = function (c, P) {
    const w = W();
    if (!w || P.dead) return;
    const big = [];
    for (const e of w.ents) if (e.art && !e.dead && !e.hidden && e.h > 30) big.push(e);
    if (w.boss && !w.boss.dead && w.boss.art) big.push(w.boss);
    for (const e of big) {
      const hw = (e.drawW || e.w || 40) * 0.42, hh = e.drawH || e.h || 30;
      if (e.y > P.y && Math.abs(P.x - e.x) < hw && P.y > e.y - hh) {
        const a = G.heroArgs(P); a.alpha = 0.5;
        A.hero(c, a);
        return;
      }
    }
  };
})();
