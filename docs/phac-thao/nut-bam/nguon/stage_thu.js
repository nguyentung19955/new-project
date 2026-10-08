// BẢN SAO ĐỂ THỬ, tạo bằng tao_ban_thu.py. Đừng sửa tay.
// Một ải: chuỗi 7 đến 8 phòng, điều khiển, bảng thông tin trên màn hình và các bảng chọn trong ải.
(function () {
  const G = window.G, ui = G.ui;
  let S = null;
  G.getRun = () => S;

  G.giveWeapon = function (type, tier) {
    if (G.save.weapons.length >= 12) { G.save.gold += 30 * (tier + 1); return null; }
    return G.newWeapon(G.save, type, tier);
  };
  G.addXp = function (key, xp) {
    const hs = G.save.heroes[key];
    let up = 0;
    hs.xp += xp;
    while (hs.lvl < G.MAX_LEVEL && hs.xp >= G.xpNeed(hs.lvl)) { hs.xp -= G.xpNeed(hs.lvl); hs.lvl++; up++; }
    return up;
  };
  const PROP_OF = { fire: 'brazier', poison: 'mushroom', ice: 'crystal' };
  const ROOM_NAME = {
    fight: 'Đánh quái', elite: 'Đánh quái', chest: 'Rương báu', fountain: 'Suối hồi', choice: 'Chọn cửa', boss: 'Trùm',
    fight2: 'Đánh quái thêm', merchant: 'Thương nhân', challenge: 'Thử thách', curse: 'Lời nguyền',
  };
  const TUT = [
    'Kéo cần bên trái để di chuyển. Giữ nút Đánh để ra đòn, bấm Né để lăn tránh.',
    'Đánh vỡ chậu than để đốt quái. Kết liễu quái đang cháy thì kiếm nhận dấu ấn Lửa.',
    'Lại gần rương rồi bấm Đánh để mở. Bùa hệ phủ hệ đó lên vũ khí trong 60 giây.',
    'Thanh xanh là mana. Đủ 25 mana thì bấm Đặc biệt để tung đòn mạnh.',
    'Quái tinh anh mang hệ. Chạm ô vũ khí ở góc trên bên phải để đổi sang cung.',
    'Lại gần suối đỏ để hồi máu hoặc suối xanh để hồi mana rồi bấm Đánh, chỉ chọn được một. Dòng chữ phía trên cho biết trùm đã học gì từ bạn.',
    'Trùm kháng hệ bạn dùng nhiều nhất. Đánh vỡ vật mang hệ khắc chế ở gần nó để gây sát thương lớn.',
  ];

  G.startStage = function (r, i, diff) {
    const rooms = i < 2
      ? ['fight', 'fight', 'chest', 'fight', 'elite', 'fountain', 'boss']
      : ['fight', 'fight', 'chest', 'fight', 'choice', 'elite', 'fountain', 'boss'];
    S = {
      r, i, diff: diff ? 1 : 0, base: G.stageStats(r, i, diff), P: G.buildPlayer(), rooms, idx: -1,
      stats: { el: { fire: 0, poison: 0, ice: 0, none: 0 }, ranged: 0, melee: 0, dodges: 0 },
      loot: { kills: 0, charm: false, bossDown: false, finalEl: null }, got: [], curse: null, marksMult: 1, haste: 1,
      tut: r === 0 && i === 0 && !diff && !G.save.tut.done, mode: 'play', endT: 0, layers: null, usedPotion: false, marks: 0,
      fade: 0, W: null, near: null, sel: null, swapped: false, opts: null, result: null,
    };
    if (S.tut) S.marksMult = 2;
    nextRoom();
    G.setScene(G.StageScene);
  };

  function bossSetup() {
    const reg = G.REGIONS[S.r];
    const big = S.i === 4;
    const first = S.r === 0 && !S.diff && big;
    const layers = G.computeLayers(S.stats, big ? (first ? 1 : 2) : 1, first ? 0.3 : 0.5);
    const scar = G.save.scars[reg.boss];
    if (S.diff && big && scar && !layers.some((l) => l.type === 'resist' && l.el === scar)) layers.push({ type: 'resist', el: scar, pct: 0.5, scar: true });
    return { layers, kind: big ? reg.boss : 'mini', name: big ? reg.bossName : reg.mini };
  }

  function buildWaves(type) {
    const waves = [];
    const count = type === 'fight2' ? 2 : S.i >= 3 ? 3 : 2;
    const roles = ['rusher', 'swarm', 'archer'];
    if (S.i >= 1 || S.r > 0) roles.push('shield');
    if (S.i >= 2 || S.r > 0) roles.push('nimble');
    const cost = { rusher: 1, swarm: 1.5, archer: 1, shield: 1.5, nimble: 1.2 };
    for (let k = 0; k < count; k++) {
      let pts = 3 + Math.min(1.5, S.i * 0.4) + S.r * 0.5 + (S.diff ? 1 : 0);
      const list = [];
      if (type === 'elite' && k === count - 1) { list.push('elite'); pts -= 2.5; }
      for (let guard = 0; guard < 30 && pts > 0.9; guard++) {
        const r = G.pick(roles);
        if (cost[r] > pts + 0.3) continue;
        if (r === 'swarm') list.push('swarm', 'swarm', 'swarm'); else list.push(r);
        pts -= cost[r];
      }
      waves.push(list);
    }
    return waves;
  }
  function spawnWave(list) {
    const W = S.W;
    const el = S.stats.el, tot = el.fire + el.poison + el.ice + el.none;
    const top = G.ELS.slice().sort((a, b) => el[b] - el[a])[0];
    list.forEach((role, j) => {
      const left = G.rnd() < 0.25 && W.P.x > 170;
      const e = G.spawnEnemy(role, left ? -12 - j * 9 : W.w + 12 + j * 9, G.rr(W.y0, W.y1), {});
      // Quái tinh anh cũng học: kháng nhẹ hệ bạn dùng nhiều nhất
      if (role === 'elite' && tot > 0 && el[top] / tot > 0.4) e.resist = top;
    });
  }
  function addEnv(n, el) {
    const W = S.W, reg = G.REGIONS[S.r];
    for (let k = 0; k < n; k++) {
      const e = el || (G.rnd() < 0.65 ? reg.el : G.pick(G.ELS));
      W.props.push({ type: PROP_OF[e], env: true, x: G.rr(130, W.w - 110), y: G.rr(W.y0 + 6, W.y1 - 4) });
    }
  }

  function enterRoom(type) {
    const P = S.P;
    const bs = type === 'boss' ? bossSetup() : null;
    const W = G.newWorld(P, {
      w: !bs ? 480 : bs.kind === 'ngu' ? 560 : 640, base: S.base, region: S.r, stats: S.stats, marksMult: S.marksMult, haste: S.haste,
      hpFloor: S.tut && type !== 'boss', loot: S.loot, seed: S.r * 100 + S.i * 10 + S.idx + 1,
    });
    W.noPotion = S.curse === 'dry';
    W.type = type; W.cleared = false; W.waves = []; W.waveI = -1; W.waveT = 0.6;
    S.W = W; S.near = null; S.endT = 0; S.fade = 0.35; S.challenge = null; S.roomT = 0;
    if (S.idx > 0 && P.roomHeal) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * P.roomHeal);
    const mid = (W.y0 + W.y1) / 2;
    S.hint = S.tut ? TUT[Math.min(S.idx, TUT.length - 1)] : null;
    if (type === 'fight' || type === 'elite' || type === 'fight2' || type === 'challenge') {
      W.waves = buildWaves(type);
      if (S.tut && S.idx === 0) W.waves = [['rusher', 'rusher', 'rusher']];
      else if (S.tut && S.idx === 1) {
        W.waves = [['swarm', 'swarm', 'swarm', 'swarm', 'swarm'], ['swarm', 'swarm', 'swarm', 'swarm', 'rusher']];
        W.props.push({ type: 'brazier', env: true, x: 250, y: mid - 8 }, { type: 'brazier', env: true, x: 340, y: mid + 18 });
      } else addEnv(1 + (G.rnd() < 0.5 ? 1 : 0));
      if (type === 'challenge') S.challenge = { t: 30, hits: 0, hp: P.hp };
    } else if (type === 'chest') {
      W.props.push({ type: 'chest', x: 250, y: mid, act: 'chest' });
      W.cleared = true;
    } else if (type === 'fountain') {
      W.props.push({ type: 'fountain', kind: 'hp', x: 190, y: mid + 6, act: 'fountain' });
      W.props.push({ type: 'fountain', kind: 'mana', x: 300, y: mid + 6, act: 'fountain' });
      W.props.push({ type: 'stash', x: 245, y: W.y0 + 2, act: 'stash' });
      S.preview = bossSetup().layers;
      W.cleared = true;
    } else if (type === 'choice') {
      const kinds = ['fight2', 'merchant', 'challenge', 'curse'].sort(() => G.rnd() - 0.5).slice(0, 2);
      const col = { fight2: '#6a2a22', merchant: '#6a5a22', challenge: '#22506a', curse: '#4a226a' };
      W.props.push({ type: 'door', x: 180, y: W.y0, act: 'door', choice: kinds[0], col: col[kinds[0]] });
      W.props.push({ type: 'door', x: 310, y: W.y0, act: 'door', choice: kinds[1], col: col[kinds[1]] });
    } else if (type === 'merchant') {
      W.props.push({ type: 'merchant', x: 250, y: mid - 6, act: 'merchant' });
      S.shop = { el: G.pick(G.ELS), bought: {} };
      W.cleared = true;
    } else if (type === 'curse') {
      W.props.push({ type: 'altar', x: 250, y: mid - 4, act: 'altar' });
      S.curseOffer = G.pick(G.CURSES);
      W.cleared = true;
    } else if (type === 'boss') {
      S.layers = bs.layers;
      const b = G.makeBoss(bs.kind, { name: bs.name, layers: bs.layers });
      const res = bs.layers.find((l) => l.type === 'resist');
      const el = res ? G.WEAK[res.el] : G.pick(G.ELS);
      const xmax = (W.px1 != null ? W.px1 : W.x1) - 40;
      W.props.push({ type: PROP_OF[el], env: true, x: xmax * 0.45, y: W.y0 + 14 }, { type: PROP_OF[el], env: true, x: xmax * 0.75, y: W.y1 - 10 });
      W.banner = { s: b.name + (bs.layers.length ? ': ' + bs.layers.map(G.layerText).join(' · ') : ' xuất hiện'), col: '#ff6a5a', t: 4 };
      G.sfx('gong');
    }
  }
  function nextRoom() {
    if (S.W) { S.marks += S.W.marksGained; if (S.W.usedPotion) S.usedPotion = true; }
    S.idx++;
    enterRoom(S.rooms[S.idx]);
  }
  function clearRoom() {
    const W = S.W;
    W.cleared = true;
    G.sfx('pick', 0.8);
    S.P.hp = Math.min(S.P.maxhp, S.P.hp + S.P.maxhp * 0.08);
    if (S.challenge) {
      const ok = S.challenge.t > 0;
      if (ok) {
        if (G.rnd() < 0.5) { G.save.stones++; S.got.push('1 đá tôi'); } else { G.save.ore += 6; S.got.push('6 quặng'); }
        G.save.gold += 80;
        W.banner = { s: 'Vượt thử thách! Nhận ' + S.got[S.got.length - 1] + ' và 80 vàng', col: '#ffd23f', t: 3 };
      } else W.banner = { s: 'Hết giờ, không có thưởng', col: '#b8b0a0', t: 2.5 };
      S.challenge = null;
    }
  }

  function chestOptions() {
    const tier = S.challengeChest ? Math.min(2, (S.r >= 1 ? 1 : 0) + 1) : S.r >= 1 && G.rnd() < 0.6 ? 1 : G.rnd() < 0.15 ? 1 : 0;
    const type = G.pick(G.WKEYS);
    return [
      { kind: 'weapon', type, tier, label: G.WTYPES[type].name + ' ' + G.TIERS[tier].name, sub: 'Vũ khí mới, cất vào rương đồ' },
      { kind: 'ore', n: 5 + S.r * 3, label: (5 + S.r * 3) + ' quặng', sub: 'Dùng để mài vũ khí ở lò rèn' },
      { kind: 'charm', el: S.tut ? 'fire' : G.pick(G.ELS), label: '', sub: 'Phủ hệ lên cả hai vũ khí trong 60 giây' },
    ].map((o) => { if (o.kind === 'charm') o.label = 'Bùa ' + G.EL[o.el].name; return o; });
  }
  function interact(pr) {
    const W = S.W, P = S.P;
    if (pr.act === 'chest' && !pr.used) { S.opts = chestOptions(); S.mode = 'chest'; S.prop = pr; } else if (pr.act === 'fountain' && !pr.used) {
      if (pr.kind === 'hp') P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.5); else P.mana = P.maxmana;
      for (const o of W.props) if (o.type === 'fountain') o.used = true;
      G.burst(pr.x, pr.y, pr.kind === 'hp' ? '#ff6a5a' : '#6ab0ff', 20, 80);
      G.sfx('evolve', 0.8);
    } else if (pr.act === 'stash') { S.mode = 'swap'; S.sel = null; } else if (pr.act === 'merchant') S.mode = 'merchant';
    else if (pr.act === 'altar' && !pr.used) { S.mode = 'curse'; S.prop = pr; } else if (pr.act === 'door') {
      S.rooms[S.idx] = pr.choice;
      enterRoom(pr.choice);
    }
  }
  function rebuildWeapons() {
    const P = S.P;
    const cur = P.weapons[P.cur];
    P.weapons = G.save.carry.map((id) => G.weaponById(id)).filter(Boolean);
    P.cur = Math.max(0, P.weapons.indexOf(cur));
  }

  function finish(win) {
    const sv = G.save, reg = G.REGIONS[S.r], W = S.W;
    S.marks += W.marksGained;
    if (W.usedPotion) S.usedPotion = true;
    const R = { win, lines: [], stars: 0, up: 0 };
    if (win) {
      const b = W.boss;
      // Sao thứ ba: đòn kết liễu phải mang hệ khắc chế; trùm không kháng hệ nào thì chỉ cần đòn kết liễu có hệ.
      const third = b.weak.length ? b.weak.includes(S.loot.finalEl) : !!S.loot.finalEl;
      R.stars = 1 + (S.usedPotion ? 0 : 1) + (third ? 1 : 0);
      R.starNote = [true, !S.usedPotion, third];
      const map = S.diff ? sv.stars2 : sv.stars;
      const key = S.r + '-' + S.i;
      const prev = map[key] || 0;
      map[key] = Math.max(prev, R.stars);
      const big = S.i === 4;
      const xp = S.base.xp;
      let gold = S.base.gold + S.loot.kills * 2;
      if (sv.charm === 'c_greed' && sv.heroes[sv.hero].lvl >= 5) gold = Math.round(gold * 1.25);
      const ore = 3 + R.stars, mat = 5 + S.i;
      sv.gold += gold; sv.ore += ore; sv.mats[S.r] += mat;
      R.lines.push('+' + xp + ' kinh nghiệm', '+' + gold + ' vàng', '+' + ore + ' quặng', '+' + mat + ' ' + reg.mat.toLowerCase());
      if (big) { const ns = S.diff ? 4 : 3; sv.shards[S.r] += ns; R.lines.push('+' + ns + ' mảnh ' + reg.bossName); }
      if ((R.stars === 3 && prev < 3) || (!big && G.rnd() < 0.15)) { sv.stones++; R.lines.push('+1 đá tôi'); }
      let wdrop = null;
      if (big) wdrop = [G.pick(G.WKEYS), G.rnd() < 0.35 ? 2 : 1];
      else if (G.rnd() < 0.5) wdrop = [G.pick(G.WKEYS), S.r >= 1 ? (G.rnd() < 0.6 ? 1 : 0) : G.rnd() < 0.25 ? 1 : 0];
      if (wdrop) {
        const nw = G.giveWeapon(wdrop[0], wdrop[1]);
        R.lines.push(nw ? 'Nhặt được ' + G.wName(nw) : 'Rương đồ đầy, vũ khí rớt đổi thành vàng');
      }
      if (S.loot.charm) {
        const left = Object.keys(G.GEAR.charm).filter((k) => !sv.owned.charm.includes(k));
        if (left.length) { const c = G.pick(left); sv.owned.charm.push(c); R.lines.push('Nhặt được ' + G.GEAR.charm[c].name); }
      }
      if (big && !S.diff && !sv.heroes[reg.rescue].unlocked) {
        sv.heroes[reg.rescue].unlocked = true;
        R.lines.push('Cứu được ' + G.HEROES[reg.rescue].name + '! Hero mới đã mở.');
      }
      if (big && S.loot.finalEl) sv.scars[reg.boss] = S.loot.finalEl;
      if (S.tut) sv.tut.done = true;
      R.up = G.addXp(sv.hero, xp);
      G.sfx('win');
    } else {
      const xp = Math.round(S.base.xp * 0.4 * (S.idx / S.rooms.length));
      const gold = S.loot.kills * 2;
      sv.gold += gold;
      R.lines.push('+' + xp + ' kinh nghiệm', '+' + gold + ' vàng');
      R.up = G.addXp(sv.hero, xp);
    }
    if (S.marks > 0) R.lines.push('Vũ khí nhận ' + Math.round(S.marks) + ' dấu ấn');
    if (R.up) R.lines.push(G.HEROES[sv.hero].name + ' lên cấp ' + sv.heroes[sv.hero].lvl + '!');
    for (const g of S.got) R.lines.push('Trong ải: ' + g);
    S.result = R;
    S.mode = win ? 'result' : 'dead';
    G.persist();
  }
  G.finishStage = finish;
  G.gotoRoom = function (n) { S.idx = n - 1; nextRoom(); }; // dùng khi chạy thử

  // ---------- điều khiển ----------
  const BTN0 = { atk: [430, 220, 28], dodge: [380, 246, 18], special: [384, 196, 18], skill: [434, 166, 18] };
  // Có lề trống (màn hình dài hoặc đang cầm dọc) thì đẩy nút ra lề để không che trận đấu.
  function btnPos(name) { const b = BTN0[name]; return [b[0] + G.cx, b[1] + G.cy, b[2]]; }
  const BTN = BTN0;
  // Ô bình máu và nút tạm dừng: [x, y, rộng, cao]. Vùng chạm rộng hơn hình vẽ 4 đơn vị mỗi phía.
  const POT = [4, 23, 50, 21], PAU = [58, 23, 30, 21];
  const hitBox = (d, b) => G.inRect(d, b[0] - 4, b[1] - 3, b[2] + 8, b[3] + 7);
  function setMode(m) { S.mode = m; S.sel = null; }
  G.stageUi = { btnPos, POT, PAU }; // để bài kiểm tra biết nút nằm ở đâu
  function readInput() {
    const k = G.keys, kp = G.keyP;
    const inp = {
      mx: (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0),
      my: (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0),
      atk: !!(k.KeyJ || k.KeyZ || k.Space), atkP: !!(kp.KeyJ || kp.KeyZ || kp.Space),
      dodgeP: !!(kp.KeyK || kp.KeyX || kp.ShiftLeft), specialP: !!(kp.KeyL || kp.KeyC), skillP: !!(kp.KeyI || kp.KeyV),
      swapP: !!(kp.KeyQ || kp.Tab), potionP: !!(kp.KeyE || kp.KeyH), pauseP: !!(kp.Escape || kp.KeyP),
    };
    for (const d of G.downs) {
      if (G.inRect(d, 368, 0, 112, 38)) { inp.swapP = true; d.role = 'ui'; continue; }
      if (hitBox(d, POT)) { inp.potionP = true; d.role = 'ui'; continue; }
      if (hitBox(d, PAU)) { inp.pauseP = true; d.role = 'ui'; continue; }
      // nút tròn: lấy nút gần ngón nhất, vùng chạm rộng hơn hình vẽ một chút
      let hit = null, best = 1e9;
      for (const name in BTN) {
        const b = btnPos(name), dd = Math.hypot(d.x - b[0], d.y - b[1]);
        if (dd <= b[2] + 6 && dd - b[2] < best) { best = dd - b[2]; hit = name; }
      }
      if (hit) {
        d.role = hit;
        if (hit === 'atk') inp.atkP = true;
        if (hit === 'dodge') inp.dodgeP = true;
        if (hit === 'special') inp.specialP = true;
        if (hit === 'skill') inp.skillP = true;
      } else if (d.x < 240 && d.y > 48 && ![...G.pointers.values()].some((p) => p.role === 'joy' && p !== d)) d.role = 'joy';
      else d.role = 'none'; // chạm vào chỗ trống: không làm gì, cũng không tính là bấm nút
    }
    for (const p of G.pointers.values()) {
      if (p.role === 'atk') inp.atk = true;
      if (p.role === 'joy') {
        let dx = (p.x - p.sx) / 24, dy = (p.y - p.sy) / 24;
        const l = Math.hypot(dx, dy);
        if (l > 1) { dx /= l; dy /= l; }
        if (l > 0.18) { inp.mx += dx; inp.my += dy; }
      }
    }
    return inp;
  }

  // ---------- cảnh ----------
  G.StageScene = {
    update(dt) {
      if (!S) return;
      if (S.fade > 0) S.fade -= dt;
      const W = S.W, P = S.P;
      if (S.mode !== 'play') {
        const kp = G.keyP;
        if (kp.Escape || (kp.KeyP && S.mode === 'paused')) {
          if (S.mode === 'result' || S.mode === 'dead') { S = null; G.setScene(G.Village); return; }
          setMode('play'); G.sfx('ui');
        }
        return;
      }
      const inp = G.botInput ? G.botInput(S) : readInput();
      if (inp.pauseP) { setMode('paused'); return; }
      S.roomT = (S.roomT || 0) + dt;
      // tương tác với đồ vật gần nhất
      S.near = null;
      let bd = 26;
      for (const pr of W.props) {
        if (!pr.act || pr.used) continue;
        const d = Math.hypot(pr.x - P.x, (pr.y - P.y) * 1.3);
        if (d < bd) { bd = d; S.near = pr; }
      }
      if (S.near && inp.atkP) { inp.atk = false; inp.atkP = false; interact(S.near); if (S.mode !== 'play' || S.W !== W) return; }
      else if (S.near) inp.atk = false;
      G.updateWorld(dt, inp);
      // đợt quái
      if (W.waves.length && !W.cleared) {
        if (W.ents.filter((e) => !e.add).length === 0) {
          W.waveT -= dt;
          if (W.waveT <= 0) {
            W.waveI++;
            W.waveT = 0.7;
            if (W.waveI < W.waves.length) spawnWave(W.waves[W.waveI]); else clearRoom();
          }
        }
      }
      if (S.challenge) S.challenge.t -= dt;
      if (W.type === 'boss' && S.loot.bossDown) { S.endT += dt; if (S.endT > 1.6) finish(true); return; }
      if (W.over === 'dead') { S.endT += dt; if (S.endT > 1.2) finish(false); return; }
      if (W.cleared && W.type !== 'boss' && P.x >= W.x1 - 2) nextRoom();
    },
    // Trang bị ẩn (chuyển ứng dụng, tắt màn hình): tự tạm dừng.
    hide() { if (S && S.mode === 'play') setMode('paused'); },
    draw() {
      if (!S) return;
      if (S.mode !== S.shownMode) {
        // Bảng vừa mở hoặc đóng: ngón đang giữ không được bấm nhầm vào nút mới hiện.
        S.shownMode = S.mode; S.modeT = G.time; G.stalePointers(); G.click = null;
      }
      G.drawWorld(S.r);
      drawHud();
      if (S.mode === 'chest') panelChest();
      else if (S.mode === 'swap') panelSwap();
      else if (S.mode === 'merchant') panelMerchant();
      else if (S.mode === 'curse') panelCurse();
      else if (S.mode === 'paused') panelPause();
      else if (S.mode === 'result' || S.mode === 'dead') panelResult();
      if (S && S.fade > 0) ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,' + Math.min(1, S.fade / 0.35) + ')'); // S có thể vừa bị xoá khi bấm Về làng
    },
  };

  function markInfo(w) {
    if (!w.branch) {
      const top = G.ELS.slice().sort((a, b) => w.marks[b] - w.marks[a])[0];
      return { frac: w.marks[top] / G.MARKS[0], col: w.marks[top] > 0 ? G.EL[top].col : '#666', txt: w.marks[top] > 0 ? G.EL[top].name + ' ' + Math.floor(w.marks[top]) + '/' + G.MARKS[0] : 'Chưa có dấu ấn' };
    }
    const st = G.wStage(w), m = w.marks[w.branch];
    const cap = G.TIERS[w.tier].maxStage;
    if (st >= cap) return { frac: 1, col: G.EL[w.branch].col, txt: G.EL[w.branch].name + ' · ' + G.STAGE_NAMES[st] + ' (tối đa)' };
    return { frac: (m - (st ? G.MARKS[st - 1] : 0)) / (G.MARKS[st] - (st ? G.MARKS[st - 1] : 0)), col: G.EL[w.branch].col, txt: G.EL[w.branch].name + ' · ' + G.STAGE_NAMES[st] + ' ' + Math.floor(m) + '/' + G.MARKS[st] };
  }
  G.markInfo = markInfo;

  function drawHud() {
    const W = S.W, P = S.P, c = G.ux;
    // máu, mana
    ui.bar(6, 5, 112, 8, P.hp / P.maxhp, '#d8453a');
    ui.text(Math.ceil(P.hp) + '/' + P.maxhp, 62, 12, { size: 6.5, align: 'center', bold: true });
    ui.bar(6, 15, 112, 5, P.mana / P.maxmana, '#3f8be0');
    const canDrink = P.potions > 0 && !W.noPotion;
    const heldBox = (b) => [...G.pointers.values()].some((p) => p.role === 'ui' && hitBox({ x: p.sx, y: p.sy }, b));
    G.btnArt.draw(c, 'potion', POT[0] + 13, POT[1] + 11, 11, { count: P.potions, disabled: !canDrink, pressed: heldBox(POT) });
    ui.text(W.noPotion ? 'Cấm' : 'Bình máu', POT[0] + 28, POT[1] + 14, { size: 6.5, bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    G.btnArt.draw(c, 'pause', PAU[0] + PAU[2] / 2 + 6, PAU[1] + 11, 10, { pressed: heldBox(PAU) });
    let sx = 6;
    for (const k of G.ELS) if (P.st[k] > 0) { ui.rect(sx, 48, 10, 10, G.EL[k].col, '#000'); sx += 12; }
    const cw = G.curW(P), coat = P.coats[cw.id];
    if (coat && coat.t > 0) ui.text('Bùa ' + G.EL[coat.el].name + ' ' + Math.ceil(coat.t) + ' giây', sx, 56.5, { size: 7.5, color: G.EL[coat.el].col, bold: true });
    // chấm phòng
    const n = S.rooms.length;
    for (let i = 0; i < n; i++) {
      const x = 240 - (n * 9) / 2 + i * 9;
      const t = S.rooms[i];
      const col = i < S.idx ? '#7a6a55' : i === S.idx ? '#ffd27a' : t === 'boss' ? '#a0382e' : t === 'chest' ? '#b08a2a' : t === 'fountain' ? '#3a7ab0' : '#4a4038';
      ui.rect(x, 5, 7, 5, col, '#000');
    }
    ui.text(ROOM_NAME[W.type] + ' · ' + G.REGIONS[S.r].name + ' ' + (S.i + 1), 240, 19, { size: 7, align: 'center', color: '#d9cdb8' });
    // vũ khí: hình và bậc ở trên, mốc tiến hóa ở dưới, thanh dấu ấn sát đáy
    P.weapons.forEach((w, i) => {
      const x = 368 + i * 56, on = i === P.cur;
      // Khung ô vũ khí cùng bộ với nút. Hình vũ khí và chữ vẫn do game vẽ ở các dòng dưới.
      G.btnArt.slot(c, x, 3, 54, 35, {
        weapon: { type: w.type, branch: G.activeEl(P, w), stage: G.wStage(w), rarity: w.rarity != null ? w.rarity : w.tier },
        active: on, cd: on ? 0 : P.swapCd / 1.5, icon: false, gem: false, id: 'slot' + i,
      });
      c.save(); c.translate(x + 12, 13);
      G.art.weaponIcon(c, Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }), 0, 0);
      c.restore();
      const mi = markInfo(w);
      ui.text(G.TIERS[w.tier].name + (w.sharpen ? ' +' + w.sharpen : ''), x + 51, 14, { size: 7, align: 'right', bold: on, color: on ? '#fff3da' : '#b8b0a0' });
      ui.text(G.STAGE_NAMES[G.wStage(w)], x + 27, 29.5, { size: 6.5, align: 'center', color: w.branch ? G.EL[w.branch].col : '#b8b0a0' });
      ui.bar(x + 3, 32.5, 48, 3, mi.frac, mi.col);
    });
    if (P.weapons.length > 1 && S.tut && S.idx === 4) ui.text('Chạm để đổi vũ khí', 478, 47, { size: 7, align: 'right', bold: true, color: '#ffd27a' });
    // trùm
    const b = W.boss;
    if (b && !b.dead) {
      ui.bar(140, 24, 200, 6, b.hp / b.maxhp, '#c23a2e');
      ui.rect(140 + 200 * 0.6, 24, 1, 6, '#000');
      ui.rect(140 + 200 * 0.3, 24, 1, 6, '#000');
      ui.text(b.name, 140, 39, { size: 7.5, bold: true, color: '#ffd9c8' });
      let lx = 340;
      for (const l of b.layers.slice().reverse()) {
        const s = l.type === 'resist' ? 'Kháng ' + G.EL[l.el].name : G.layerText(l);
        ui.font(6.5, true);
        const tw = G.ux.measureText(s).width + 6;
        lx -= tw + 2;
        ui.rect(lx, 32, tw, 9, l.type === 'resist' ? G.EL[l.el].dark : '#4a4038', '#000');
        ui.text(s, lx + 3, 39, { size: 6.5, bold: true });
      }
      if (b.weak.length) ui.text('Yếu ' + b.weak.map((e) => G.EL[e].name).join(', '), 240, 50, { size: 7, align: 'center', color: G.EL[b.weak[0]].col, bold: true });
      if (b.exposed > 0) ui.text('LỘ ĐIỂM YẾU!', 240, 60, { size: 8, align: 'center', color: '#ffd23f', bold: true });
    }
    if (W.type === 'fountain') {
      const t = S.preview.length ? 'Trùm đã học: ' + S.preview.map(G.layerText).join(' · ') : 'Trùm chưa học được gì từ bạn';
      ui.rect(96, 30, 268, 13, 'rgba(20,16,14,0.8)');
      ui.text(t, 240, 39.5, { size: 7.5, align: 'center', color: '#ffd9c8', bold: true });
    }
    if (S.challenge) ui.text('Thử thách: hạ hết quái trong ' + Math.max(0, Math.ceil(S.challenge.t)) + ' giây', 240, 40, { size: 8, align: 'center', color: S.challenge.t > 8 ? '#ffd27a' : '#ff6a5a', bold: true });
    if (W.type === 'choice') {
      for (const pr of W.props) ui.text(ROOM_NAME[pr.choice], pr.x - W.cam, pr.y - 52, { size: 8, align: 'center', bold: true, color: '#ffd27a' });
      ui.text('Lại gần một cửa rồi bấm Đánh để chọn', 240, 60, { size: 8, align: 'center' });
    }
    // Lời chỉ dẫn của ải đầu. Ở phòng trùm thì nằm dưới thanh máu trùm và tự ẩn sau 12 giây.
    let by = 66;
    let hint = S.hint;
    if (hint && W.cleared && W.waves.length) hint = 'Hết quái rồi. Đi sang mép phải màn hình để qua phòng kế tiếp.';
    if (hint && W.type === 'boss' && S.roomT > 12) hint = null;
    if (hint && S.mode === 'play') {
      const lines = ui.wrap(hint, 286, 8);
      const hy = W.type === 'boss' ? 64 : 46, hh = lines.length * 11 + 6;
      ui.rect(90, hy, 300, hh, 'rgba(10,8,6,0.78)', '#7a5a3a');
      lines.forEach((l, i) => ui.text(l, 240, hy + 10 + i * 11, { size: 8, align: 'center' }));
      by = hy + hh + 3;
    }
    if (W.banner) {
      ui.font(10, true);
      const tw = Math.min(440, G.ux.measureText(W.banner.s).width + 16);
      ui.rect(240 - tw / 2, by, tw, 16, 'rgba(10,8,6,0.82)', W.banner.col);
      ui.text(W.banner.s, 240, by + 11.5, { size: tw >= 440 ? 7.5 : 10, align: 'center', bold: true, color: W.banner.col });
    }
    // tên các vật bấm được, để người mới biết đó là gì
    const PNAME = { chest: 'Rương báu', stash: 'Rương đồ', merchant: 'Thương nhân', altar: 'Bàn thờ lời nguyền' };
    if (S.mode === 'play') {
      for (const pr of W.props) {
        if (!pr.act || pr.used || pr.act === 'door') continue;
        const nm = pr.act === 'fountain' ? (pr.kind === 'hp' ? 'Hồi máu' : 'Hồi mana') : PNAME[pr.act];
        const py = pr.y - (pr.act === 'stash' ? 28 : pr.act === 'fountain' ? 40 : 36);
        if (pr === S.near) ui.text('Bấm Đánh', pr.x - W.cam, py, { size: 8, align: 'center', bold: true, color: '#fff3b0' });
        else if (nm) ui.text(nm, pr.x - W.cam, py, { size: 7, align: 'center', bold: true, color: pr.act === 'fountain' ? (pr.kind === 'hp' ? '#ff9a8a' : '#9ac8ff') : '#f0d9b0' });
      }
      if (S.near && S.near.act === 'door') ui.text('Bấm Đánh', S.near.x - W.cam, S.near.y - 62, { size: 8, align: 'center', bold: true, color: '#fff3b0' });
    }
    if (W.cleared && W.type !== 'boss' && Math.floor(G.time * 2.5) % 2) ui.text('ĐI TIẾP →', 474, 132, { size: 10, align: 'right', bold: true, color: '#ffd27a' });
    // nút cảm ứng
    if (S.mode === 'play') {
      const A = G.btnArt;
      const joy = [...G.pointers.values()].find((p) => p.role === 'joy');
      let jdx = 0, jdy = 0;
      if (joy) {
        jdx = joy.x - joy.sx; jdy = joy.y - joy.sy;
        const jl = Math.hypot(jdx, jdy);
        if (jl > 24) { jdx *= 24 / jl; jdy *= 24 / jl; }
        A.stick(c, joy.sx, joy.sy, 24, jdx, jdy, true);
      } else A.stick(c, 62 - G.cx * 0.6, 216 + G.cy, 24, 0, 0, false);
      const held = (name) => [...G.pointers.values()].some((p) => p.role === name);
      const cw2 = G.curW(P);
      // Vũ khí đang cầm: loại, hệ đang có hiệu lực (kể cả lúc đang Nung), mốc tiến hóa, bậc.
      const wst = { type: cw2.type, branch: G.activeEl(P, cw2), stage: G.wStage(cw2), rarity: cw2.rarity != null ? cw2.rarity : cw2.tier };
      const showLab = !!S.tut; // chữ tên nút chỉ hiện ở ải hướng dẫn
      // Hướng lộn: theo cần điều khiển hoặc phím; không đẩy thì theo hướng nhân vật đang quay mặt.
      const kx = (G.keys.ArrowRight || G.keys.KeyD ? 1 : 0) - (G.keys.ArrowLeft || G.keys.KeyA ? 1 : 0) + jdx / 24;
      const ky = (G.keys.ArrowDown || G.keys.KeyS ? 1 : 0) - (G.keys.ArrowUp || G.keys.KeyW ? 1 : 0) + jdy / 24;
      const dir = Math.hypot(kx, ky) > 0.18 ? Math.atan2(ky, kx) : P.face > 0 ? 0 : Math.PI;
      let bt = btnPos('atk');
      A.draw(c, 'atk', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, pressed: held('atk'), glow: !!S.near, label: showLab ? (S.near ? 'Bấm' : 'Đánh') : null, labelAt: 'top',
        // Khi game có đòn giữ rồi thả thì truyền thêm: charge: <0 đến 1>, chargeSteps: <số nấc>
      });
      bt = btnPos('special');
      A.draw(c, 'special', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, cost: P.specCost, disabled: P.mana < P.specCost, pressed: held('special'),
        cd: P.specCd / 0.8, cdSec: P.specCd, label: showLab ? G.WTYPES[cw2.type].special : null, labelAt: 'top',
      });
      bt = btnPos('skill');
      A.draw(c, 'skill', bt[0], bt[1], bt[2] + 1, {
        hero: P.key, cost: 40, disabled: P.mana < 40, pressed: held('skill'),
        cd: P.skillCd / 5, cdSec: P.skillCd, label: showLab ? G.HEROES[P.key].skill : null, labelAt: 'top',
      });
      bt = btnPos('dodge');
      A.draw(c, 'dodge', bt[0], bt[1], bt[2] + 1, {
        dir, pressed: held('dodge'), cd: P.dodgeCd / P.dodgeCdMax, cdSec: P.dodgeCd, label: showLab ? 'Né' : null, labelAt: 'top',
      });
    }
  }

  // ---------- bảng chọn ----------
  function panelChest() {
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.55)');
    ui.panel(60, 56, 360, 150, 'Rương báu: chọn một phần thưởng');
    S.opts.forEach((o, i) => {
      const x = 72 + i * 114;
      if (ui.btn(x, 84, 108, 100, o.label, { sub: '', size: 10 })) {
        if (o.kind === 'weapon') { const w = G.giveWeapon(o.type, o.tier); S.got.push(w ? G.wName(w) : 'vàng (rương đồ đầy)'); }
        if (o.kind === 'ore') { G.save.ore += o.n; S.got.push(o.n + ' quặng'); }
        if (o.kind === 'charm') G.addCoat(o.el, 60);
        S.prop.used = true;
        S.mode = 'play';
        G.sfx('pick');
      }
      ui.para(o.sub, x + 6, 160, 96, { size: 6.5, color: '#f0d9b0' });
    });
  }
  function weaponLine(w, x, y, wd, sel) {
    const mi = markInfo(w);
    ui.rect(x, y, wd, 22, sel ? 'rgba(120,80,30,0.9)' : 'rgba(50,42,36,0.9)', sel ? '#ffd27a' : '#6a5a4a');
    const c = G.ux;
    c.save(); c.translate(x + 12, y + 11); G.art.weaponIcon(c, w, 0, 0); c.restore();
    ui.text(G.wName(w), x + 26, y + 9.5, { size: 7.5, bold: true, color: G.TIERS[w.tier].col });
    ui.text(mi.txt, x + 26, y + 18.5, { size: 6.5, color: mi.col });
    return G.click && G.inRect(G.click, x, y, wd, 22);
  }
  G.weaponLine = weaponLine;
  function panelSwap() {
    const sv = G.save;
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.55)');
    ui.panel(40, 30, 400, 210, 'Rương đồ: đổi một vũ khí đang mang');
    ui.text('Đang mang', 52, 62, { size: 8, color: '#d9cdb8' });
    sv.carry.forEach((id, slot) => {
      const w = G.weaponById(id);
      if (!w) return;
      if (weaponLine(w, 52, 68 + slot * 26, 180, false) && S.sel != null && !S.swapped) {
        sv.carry[slot] = S.sel;
        S.sel = null; S.swapped = true;
        rebuildWeapons();
        G.click = null;
        G.sfx('pick');
      }
    });
    ui.text(S.swapped ? 'Đã đổi xong.' : S.sel != null ? 'Giờ chạm vào vũ khí đang mang để thay.' : 'Chạm một vũ khí trong rương để chọn.', 52, 134, { size: 7.5, color: '#ffd27a' });
    ui.text('Trong rương', 248, 62, { size: 8, color: '#d9cdb8' });
    const stash = sv.weapons.filter((w) => !sv.carry.includes(w.id)).slice(0, 6);
    if (!stash.length) ui.text('Rương trống.', 248, 80, { size: 8 });
    stash.forEach((w, k) => {
      if (weaponLine(w, 248, 68 + k * 26, 180, S.sel === w.id) && !S.swapped) { S.sel = w.id; G.click = null; G.sfx('ui'); }
    });
    if (ui.btn(52, 206, 90, 24, 'Đóng')) setMode('play');
  }
  function panelMerchant() {
    const sv = G.save, P = S.P, sh = S.shop;
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.55)');
    ui.panel(70, 50, 340, 166, 'Thương nhân');
    ui.text('Vàng: ' + sv.gold, 398, 65, { size: 8, align: 'right', color: '#ffd23f', bold: true });
    const items = [
      { id: 'potion', label: 'Bình máu', sub: 'Hồi 30% máu', cost: 60, ok: P.potions < 3, f: () => { P.potions++; } },
      { id: 'charm', label: 'Bùa ' + G.EL[sh.el].name, sub: 'Phủ hệ 60 giây', cost: 80, ok: true, f: () => G.addCoat(sh.el, 60) },
      { id: 'ore', label: '3 quặng', sub: 'Để mài vũ khí', cost: 100, ok: true, f: () => { sv.ore += 3; S.got.push('3 quặng'); } },
    ];
    items.forEach((it, i) => {
      const x = 82 + i * 108;
      const dis = sh.bought[it.id] || sv.gold < it.cost || !it.ok;
      if (ui.btn(x, 78, 100, 80, it.label, { sub: sh.bought[it.id] ? 'Đã mua' : it.cost + ' vàng', size: 9.5, disabled: dis })) {
        sv.gold -= it.cost; sh.bought[it.id] = true; it.f(); G.sfx('pick');
      }
      ui.text(it.sub, x + 50, 170, { size: 7, align: 'center', color: '#d9cdb8' });
    });
    if (ui.btn(82, 182, 90, 24, 'Đóng')) S.mode = 'play';
  }
  function panelCurse() {
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.55)');
    ui.panel(80, 60, 320, 146, 'Bàn thờ lời nguyền');
    ui.para('Nhận lời nguyền này để mọi dấu ấn từ giờ đến hết ải tăng gấp đôi:', 92, 92, 296, { size: 8.5 });
    ui.para(S.curseOffer.name, 92, 124, 296, { size: 10, bold: true, color: '#d48af5' });
    if (ui.btn(92, 168, 140, 28, 'Nhận lời nguyền', { color: '#6a2a8a' })) {
      const P = S.P;
      S.curse = S.curseOffer.id;
      S.marksMult *= 2;
      S.W.marksMult = S.marksMult;
      if (S.curse === 'frail') { P.maxhp = Math.round(P.maxhp * 0.8); P.hp = Math.min(P.hp, P.maxhp); }
      if (S.curse === 'dry') S.W.noPotion = true;
      if (S.curse === 'haste') S.haste = 1.15;
      S.prop.used = true;
      S.mode = 'play';
      G.sfx('gong');
    }
    if (ui.btn(248, 168, 140, 28, 'Bỏ qua')) S.mode = 'play';
  }
  function panelPause() {
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.6)');
    ui.panel(150, 60, 180, 150, 'Tạm dừng');
    if (ui.btn(165, 86, 150, 28, 'Chơi tiếp')) setMode('play');
    if (ui.btn(165, 120, 150, 28, 'Âm thanh: ' + (G.save.sound ? 'bật' : 'tắt'))) { G.save.sound = !G.save.sound; G.persist(); G.audioStart(); }
    if (ui.btn(165, 154, 150, 28, 'Bỏ ải, về làng', { color: '#6a2a22' })) { S.quit = true; finish(false); }
  }
  function panelResult() {
    const R = S.result;
    if (G.time - S.modeT < 0.45) G.click = null; // tránh bấm nhầm khi bảng vừa hiện lúc đang đánh
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.65)');
    ui.panel(70, 22, 340, 228, R.win ? 'Qua ải ' + G.REGIONS[S.r].name + ' ' + (S.i + 1) : S.quit ? 'Đã bỏ ải ở phòng ' + (S.idx + 1) : 'Bạn đã gục ở phòng ' + (S.idx + 1));
    let y = 54;
    if (R.win) {
      const notes = ['Qua ải', 'Không dùng bình máu', 'Hạ trùm bằng hệ khắc chế'];
      for (let i = 0; i < 3; i++) {
        ui.text(R.starNote[i] ? '★' : '☆', 86, y, { size: 12, color: R.starNote[i] ? '#ffd23f' : '#6a5a4a' });
        ui.text(notes[i], 102, y - 1, { size: 8, color: R.starNote[i] ? '#f1ead9' : '#8a7f74' });
        y += 14;
      }
      y += 2;
    }
    const two = R.lines.length > 8;
    R.lines.slice(0, 16).forEach((l, i) => {
      const cx = two && i >= 8 ? 244 : 86, cy = y + (two && i >= 8 ? i - 8 : i) * 11.5;
      ui.text(l, cx, cy, { size: 7.5, color: l.includes('lên cấp') || l.includes('Cứu được') ? '#ffd27a' : '#e8dfcc' });
    });
    if (!R.win && !S.quit) ui.para('Mẹo: về làng mài vũ khí ở lò rèn, hoặc chơi lại ải cũ để lên cấp rồi quay lại.', 86, 196, 308, { size: 7.5, color: '#d9cdb8' });
    if (ui.btn(86, 216, 140, 26, 'Về làng')) { S = null; G.setScene(G.Village); return; }
    if (ui.btn(254, 216, 140, 26, R.win ? 'Chơi lại ải này' : 'Thử lại')) G.startStage(S.r, S.i, S.diff);
  }
})();
