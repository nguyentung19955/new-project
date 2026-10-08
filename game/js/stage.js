// Một ải: bản đồ 8 phòng vuông (js/mapgen.js), cửa bốn phía và chuyển phòng, điều khiển, bảng thông tin trên màn hình và các bảng chọn trong ải.
(function () {
  const G = window.G, ui = G.ui;
  let S = null;
  G.getRun = () => S;

  // o: { family, gold } như G.newWeapon. Rương đồ đầy (12 món) thì đổi thành vàng, trừ vũ khí Vàng luôn được giữ.
  G.giveWeapon = function (type, tier, o) {
    if (G.save.weapons.length >= 12 && tier < 3) { G.save.gold += 30 * (tier + 1); return null; }
    return G.newWeapon(G.save, type, tier, o);
  };
  // Bậc của vũ khí rơi từ rương và tinh anh ở vùng r: đa số Thường, cao nhất Tím, vùng sau tỉ lệ tốt hơn.
  G.rollRarity = function (r) {
    const t = G.DROP.table[G.clamp(r | 0, 0, G.DROP.table.length - 1)], x = G.rnd();
    return x < t[0] ? 0 : x < t[0] + t[1] ? 1 : 2;
  };
  // Vũ khí rơi của trùm vùng r: lần đầu hạ chắc chắn Vàng, đánh lại thì 12% Vàng, còn lại Tím.
  G.bossDrop = function (r) {
    const sv = G.save, key = G.REGIONS[r].boss, first = !sv.bossGold[key];
    const gold = first || G.rnd() < G.DROP.bossAgain;
    sv.bossGold[key] = true;
    return G.giveWeapon(G.pick(G.WKEYS), gold ? 3 : 2, { gold: r });
  };
  const rarName = (w) => G.wName(w) + ' (' + G.RARITY[G.wRar(w)].name + ')';
  // Tinh anh gục: có thể rơi một vũ khí bậc ngẫu nhiên (combat.js gọi).
  G.onEliteDown = function (e) {
    if (!S || !S.W || G.rnd() >= G.DROP.elite) return;
    const w = G.giveWeapon(G.pick(G.WKEYS), G.rollRarity(S.r));
    if (!w) { S.got.push('vàng (rương đồ đầy)'); return; }
    S.got.push({ s: rarName(w), w });
    S.W.banner = { s: 'Tinh anh rơi ' + rarName(w), col: G.RARITY[G.wRar(w)].col, t: 3 };
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
    start: 'Bắt đầu', fight: 'Đánh quái', elite: 'Tinh anh', chest: 'Rương báu', fountain: 'Suối hồi', boss: 'Trùm',
    merchant: 'Thương nhân', challenge: 'Thử thách', curse: 'Lời nguyền',
  };
  // Lời chỉ dẫn của ải đầu, theo loại phòng.
  const TUT = {
    start: 'Kéo cần bên trái để di chuyển. Giữ nút Đánh để ra đòn, bấm Né để lăn tránh. Hết quái thì cửa mở.',
    fight1: 'Đánh vỡ chậu than để đốt quái. Kết liễu quái đang cháy thì kiếm nhận dấu ấn Lửa.',
    chest: 'Lại gần rương rồi bấm Đánh để mở. Bùa hệ phủ hệ đó lên vũ khí trong 60 giây.',
    fight2: 'Thanh xanh là mana. Đủ 25 mana thì bấm Đặc biệt để tung đòn mạnh.',
    elite: 'Quái tinh anh mang hệ. Chạm ô vũ khí ở góc trên bên phải để đổi sang cung.',
    fountain: 'Lại gần suối đỏ để hồi máu hoặc suối xanh để hồi mana rồi bấm Đánh, chỉ chọn được một. Dòng chữ phía trên cho biết trùm đã học gì từ bạn.',
    boss: 'Trùm kháng hệ bạn dùng nhiều nhất. Đánh vỡ vật mang hệ khắc chế ở gần nó để gây sát thương lớn.',
    merchant: 'Thương nhân bán bình máu, bùa hệ và quặng. Lại gần rồi bấm Đánh để xem hàng.',
    challenge: 'Phòng thử thách: hạ hết quái trước khi hết giờ để nhận thưởng.',
    curse: 'Bàn thờ lời nguyền: chịu một bất lợi để dấu ấn tăng gấp đôi đến hết ải. Bỏ qua cũng được.',
    door: 'Hết quái rồi, cửa đã mở. Đi vào cửa có mũi tên để sang phòng kề. Bản đồ nhỏ ở góc phải cho biết phòng nào ở đâu.',
  };
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  let runNo = 0;

  // o (không bắt buộc): { kind: 'A' | 'B' | 'C', seed } để dựng lại đúng một bản đồ khi kiểm tra.
  G.startStage = function (r, i, diff, o) {
    o = o || {};
    const tut = r === 0 && i === 0 && !diff && !G.save.tut.done;
    // Ải cuối vùng luôn là Kiểu C; ải dạy chơi dùng Kiểu A cho dễ theo; còn lại ngẫu nhiên, tránh kiểu vừa chơi.
    const kind = o.kind || (tut ? 'A' : G.mapgen.pickKind(i, G.save.lastKind, G.rnd));
    const seed = o.seed || 1 + Math.floor(G.rnd() * 999999);
    const map = G.mapgen.make(kind, seed);
    G.save.lastKind = kind;
    S = {
      r, i, diff: diff ? 1 : 0, base: G.stageStats(r, i, diff), P: G.buildPlayer(), map, rooms: map.rooms.map((x) => x.type), idx: -1,
      worlds: {}, cleared: {}, seen: {}, known: {}, visits: 0, uid: ++runNo, trans: null, doorCd: 0,
      stats: { el: { fire: 0, poison: 0, ice: 0, none: 0 }, ranged: 0, melee: 0, dodges: 0 },
      loot: { kills: 0, charm: false, bossDown: false, finalEl: null }, won: false, portal: null, got: [], curse: null, marksMult: 1, haste: 1,
      tut, mode: 'play', endT: 0, layers: null, usedPotion: false, marks: 0,
      fade: 0, W: null, near: null, sel: null, swapped: false, opts: null, result: null,
    };
    if (S.tut) S.marksMult = 2;
    enterRoom(map.start, null);
    S.fade = 0.35;
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

  // Sàn nhỏ (khoảng 40% diện tích cũ): mỗi đợt ít quái hơn, bù lại bằng nhiều đợt hơn.
  // Số đợt và hệ số điểm nằm ở G.ROOM_WAVES (data.js) để dễ cân chỉnh.
  function buildWaves(type) {
    const waves = [], B = G.ROOM_WAVES;
    const late = S.i >= 3;
    const count = type === 'start' ? (S.i >= 2 ? B.start[1] : B.start[0]) : type === 'challenge' ? B.challenge : late ? B.late : B.early;
    const roles = ['rusher', 'swarm', 'archer'];
    if (S.i >= 1 || S.r > 0) roles.push('shield');
    if (S.i >= 2 || S.r > 0) roles.push('nimble');
    const cost = { rusher: 1, swarm: 1.5, archer: 1, shield: 1.5, nimble: 1.2 };
    for (let k = 0; k < count; k++) {
      let pts = (3 + Math.min(1.5, S.i * 0.4) + S.r * 0.5 + (S.diff ? 1 : 0)) * (late ? B.ptsLate : B.pts);
      const list = [];
      if (type === 'elite' && k === count - 1) { list.push('elite'); pts -= 2.5; }
      for (let guard = 0; guard < 30 && pts > 0.9 && list.length < B.maxPerWave; guard++) {
        const r = G.pick(roles);
        // sàn nhỏ: mỗi đợt chỉ một bầy nhỏ, để người chơi không bị sáu con vây cùng lúc
        if (cost[r] > pts + 0.3 || (r === 'swarm' && (list.includes('swarm') || list.length + 3 > B.maxPerWave))) continue;
        if (r === 'swarm') list.push('swarm', 'swarm', 'swarm'); else list.push(r);
        pts -= cost[r];
      }
      if (!list.length) list.push('rusher');
      waves.push(list);
    }
    return waves;
  }
  // Quái hiện ra ngay trong phòng: một vệt tối loang trên sàn báo trước nửa giây rồi quái trồi lên.
  function freeSpot(minD, pad) {
    const W = S.W, P = S.P;
    let best = null, bd = -1;
    for (let k = 0; k < 14; k++) {
      const x = G.rr(W.x0 + pad, (W.px1 != null ? W.px1 : W.x1) - pad), y = G.rr(W.y0 + pad, W.y1 - 6);
      let d = Math.hypot(x - P.x, y - P.y);
      for (const s of W.spawns) d = Math.min(d, Math.hypot(x - s.x, y - s.y) * 3);
      if (d >= minD) return [x, y];
      if (d > bd) { bd = d; best = [x, y]; }
    }
    return best;
  }
  function spawnWave(list) {
    const W = S.W;
    // Sàn nhỏ nên quái không ập ra cùng lúc: nửa đầu hiện trước, nửa sau hiện sau một nhịp.
    const half = Math.ceil(list.length / 2);
    list.forEach((role, j) => {
      const q = freeSpot(role === 'archer' ? 84 : 66, role === 'elite' ? 18 : 10);
      const t = 0.5 + j * 0.07 + (j >= half && list.length > 3 ? G.ROOM_WAVES.stagger : 0);
      W.spawns.push({ role, x: q[0], y: q[1], t, t0: t, big: role === 'elite' });
    });
    G.sfx('warn', 0.8);
  }
  function tickSpawns(dt) {
    const W = S.W;
    if (!W.spawns.length) return;
    const el = S.stats.el, tot = el.fire + el.poison + el.ice + el.none;
    const top = G.ELS.slice().sort((a, b) => el[b] - el[a])[0];
    for (const s of W.spawns) {
      s.t -= dt;
      if (s.t > 0) continue;
      const e = G.spawnEnemy(s.role, s.x, s.y, {});
      e.inside = true;
      e.cd = Math.max(e.cd, 0.9); // vừa hiện ra thì chưa đánh ngay
      // Quái tinh anh cũng học: kháng nhẹ hệ bạn dùng nhiều nhất
      if (s.role === 'elite' && tot > 0 && el[top] / tot > 0.4) e.resist = top;
      G.burst(s.x, s.y - 6, ['#c2f58a', '#bfeaff', '#ffd0a0'][S.r] || '#ffffff', s.big ? 14 : 7, 60);
    }
    W.spawns = W.spawns.filter((s) => s.t > 0);
  }
  // Chỗ đặt vật mang hệ: trong sàn, không nằm trên lối vào cửa, không đè lên vật khác.
  function propSpot() {
    const W = S.W, g = W.geo;
    for (let k = 0; k < 30; k++) {
      const x = G.rr(W.x0 + 16, (W.px1 != null ? W.px1 : W.x1) - 16), y = G.rr(W.y0 + 16, W.y1 - 8);
      if (Math.abs(x - g.cx) < 26 && (y < W.y0 + 44 || y > W.y1 - 40)) continue;
      if (Math.abs(y - g.cy) < 26 && (x < W.x0 + 40 || x > W.x1 - 40)) continue;
      if (W.props.some((p) => p.type !== 'roomFore' && Math.hypot(p.x - x, p.y - y) < 30)) continue;
      if (Math.hypot(x - g.cx, y - g.cy - 26) < 24) continue; // chỗ người chơi đứng khi bắt đầu ở giữa phòng
      return [x, y];
    }
    return [g.cx + G.rr(-40, 40), g.cy + G.rr(-30, 30)];
  }
  function addEnv(n, el) {
    const W = S.W, reg = G.REGIONS[S.r];
    for (let k = 0; k < n; k++) {
      const e = el || (G.rnd() < 0.65 ? reg.el : G.pick(G.ELS));
      const q = propSpot();
      W.props.push({ type: PROP_OF[e], env: true, x: q[0], y: q[1] });
    }
  }

  // Dựng một phòng lần đầu bước vào.
  function buildRoom(id) {
    const P = S.P, R = S.map.rooms[id], type = R.type, M = G.mapgen;
    const bs = type === 'boss' ? bossSetup() : null;
    const geo = G.roomArt.geo(type === 'boss');
    const W = G.newWorld(P, {
      w: G.W, base: S.base, region: S.r, stats: S.stats, marksMult: S.marksMult, haste: S.haste,
      hpFloor: S.tut && type !== 'boss', loot: S.loot, seed: (S.map.seed % 100000) * 10 + id + 1,
    });
    Object.assign(W, geo.bounds);
    W.geo = geo; W.room = id; W.uid = S.uid + ':' + id; W.variant = (S.map.seed + id * 7) % 3;
    W.type = type; W.cleared = false; W.waves = []; W.waveI = -1; W.waveT = 0.6; W.spawns = []; W.hadWaves = false;
    W.doors = M.DKEYS.filter((d) => R.doors[d] != null).map((d) => ({ dir: d, to: R.doors[d], gate: M.isGate(S.map, id, R.doors[d]), boss: S.map.rooms[R.doors[d]].type === 'boss', open: false }));
    W.props.push({ type: 'roomFore', x: 0, y: 9999 }); // lớp phủ trước của phòng, vẽ sau nhân vật
    S.W = W; S.challenge = null;
    const cx = geo.cx, cy = geo.cy;
    if (type === 'start' || type === 'fight' || type === 'elite' || type === 'challenge') {
      W.waves = buildWaves(type);
      if (S.tut && type === 'start') W.waves = [['rusher', 'rusher', 'rusher']];
      else if (S.tut && id === 1) {
        W.waves = [['swarm', 'swarm', 'swarm', 'swarm', 'swarm'], ['swarm', 'swarm', 'swarm', 'swarm', 'rusher']];
        W.props.push({ type: 'brazier', env: true, x: cx - 34, y: cy - 12 }, { type: 'brazier', env: true, x: cx + 36, y: cy + 22 });
      } else if (type !== 'start') {
        if (type === 'challenge') W.props.push({ type: 'pedestal', x: cx, y: cy - 2 });
        addEnv(1 + (G.rnd() < 0.5 ? 1 : 0));
      }
      if (type === 'challenge') S.challenge = { t: G.ROOM_WAVES.challengeTime, hits: 0, hp: P.hp };
      W.hadWaves = true;
    } else if (type === 'chest') {
      W.props.push({ type: 'chest', x: cx, y: cy + 4, act: 'chest' });
      W.cleared = true;
    } else if (type === 'fountain') {
      W.props.push({ type: 'fountain', kind: 'hp', x: cx - 44, y: cy + 14, act: 'fountain' });
      W.props.push({ type: 'fountain', kind: 'mana', x: cx + 44, y: cy + 14, act: 'fountain' });
      W.props.push({ type: 'stash', x: geo.fx0 + 40, y: W.y0 + 6, act: 'stash' });
      W.cleared = true;
    } else if (type === 'merchant') {
      W.props.push({ type: 'merchant', x: cx, y: cy - 2, act: 'merchant' });
      S.shop = { el: G.pick(G.ELS), bought: {} };
      W.cleared = true;
    } else if (type === 'curse') {
      W.props.push({ type: 'altar', x: cx, y: cy - 2, act: 'altar' });
      S.curseOffer = G.pick(G.CURSES);
      W.cleared = true;
    } else if (type === 'boss') {
      S.layers = bs.layers;
      const b = G.makeBoss(bs.kind, { name: bs.name, layers: bs.layers });
      const res = bs.layers.find((l) => l.type === 'resist');
      const el = res ? G.WEAK[res.el] : G.pick(G.ELS);
      const xr = (W.px1 != null ? W.px1 : W.x1) - W.x0;
      W.props.push({ type: PROP_OF[el], env: true, x: W.x0 + xr * 0.3, y: W.y0 + 20 }, { type: PROP_OF[el], env: true, x: W.x0 + xr * 0.68, y: W.y1 - 14 });
      W.banner = { s: b.name + (bs.layers.length ? ': ' + bs.layers.map(G.layerText).join(' · ') : ' xuất hiện'), col: '#ff6a5a', t: 4 };
      G.sfx('gong');
    }
    if (W.cleared) S.cleared[id] = true;
    return W;
  }
  // Cửa của phòng hiện tại: mở khi phòng đã dọn; cửa dẫn tới Trùm còn phải đủ điều kiện của bản đồ.
  function updateDoors() {
    const W = S.W, ok = G.mapgen.gateOpen(S.map, S.cleared);
    for (const d of W.doors) d.open = !!W.cleared && (W.type !== 'boss' || !!S.won) && (!d.gate || ok || W.type === 'boss');
  }
  // Rời phòng: gom dấu ấn, dọn những thứ chỉ sống trong lúc đánh.
  function leaveRoom() {
    const W = S.W;
    if (!W) return;
    S.marks += W.marksGained; W.marksGained = 0;
    if (W.usedPotion) S.usedPotion = true;
    S.challenge = null;
    W.projs = []; W.zones = []; W.parts = []; W.texts = []; W.slashes = []; W.spawns = []; W.banner = null; W.shake = 0;
    for (const p of W.props) if (p.type === 'trap') p.dead = true;
    W.props = W.props.filter((p) => !p.dead);
  }
  // Vào phòng id. from: hướng vừa đi (ví dụ 'up' là đi qua cửa trên, sẽ hiện ra ở cửa dưới của phòng mới).
  function enterRoom(id, from) {
    const P = S.P, map = S.map;
    leaveRoom();
    S.idx = id;
    let W = S.worlds[id];
    const first = !W;
    if (first) {
      W = buildRoom(id);
      S.worlds[id] = W;
      S.visits++;
      if (S.visits > 1 && P.roomHeal) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * P.roomHeal);
    } else {
      G.setWorld(W);
      S.W = W;
      if (W.cleared) W.waves = [];
    }
    W.marksMult = S.marksMult; W.haste = S.haste; W.noPotion = S.curse === 'dry';
    if (S.won) W.safe = true; // đã thắng: đi dạo các phòng không bị mất máu nữa
    S.near = null; S.endT = 0; S.roomT = 0; S.doorCd = 0.3;
    S.seen[id] = true; S.known[id] = true;
    for (const d of W.doors) S.known[d.to] = true;
    // vị trí xuất hiện: ngay trong cửa đối diện với hướng vừa đi, hoặc giữa phòng nếu là phòng đầu
    const g = W.geo;
    if (from) {
      const q = G.roomArt.doorPos(g, OPP[from]);
      P.x = q.x + DIRV[from][0] * 14; P.y = q.y + DIRV[from][1] * 14;
    } else { P.x = W.boss ? W.x0 + 30 : g.cx; P.y = g.cy + (W.boss ? 0 : 26); }
    if (W.boss && from && first) {
      const b = W.boss;
      if (b.kind === 'mini') {
        // trùm nhỏ đứng ở nửa phòng đối diện với cửa vừa vào
        b.x = G.clamp(g.cx + DIRV[from][0] * 70, W.x0 + 30, W.x1 - 30); b.y = G.clamp(g.cy + DIRV[from][1] * 46, W.y0 + 20, W.y1 - 10);
      } else if (W.px1 != null) P.x = Math.min(P.x, W.px1 - 24); // boss vùng chắn bên phải: không hiện ra sau lưng nó
    }
    P.inv = Math.max(P.inv, first ? 0.6 : 0.3);
    P.dashT = 0; P.dodgeT = 0;
    if (W.type === 'fountain') S.preview = bossSetup().layers;
    S.hint = S.tut ? TUT[W.type === 'fight' ? (id === 1 ? 'fight1' : 'fight2') : W.type] || null : null;
    updateDoors();
  }
  function clearRoom() {
    const W = S.W, map = S.map, M = G.mapgen;
    const was = M.gateOpen(map, S.cleared);
    W.cleared = true;
    S.cleared[S.idx] = true;
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
      for (const p of W.props) if (p.type === 'pedestal') p.used = true;
    }
    // điều kiện mở cửa Trùm: mảnh chìa (Kiểu C) hoặc số phòng quái đã dọn (Kiểu B)
    if (map.gate && map.gate.ids.includes(S.idx)) {
      const n = M.gateCount(map, S.cleared), keys = map.gate.rule === 'keys';
      if (!was && M.gateOpen(map, S.cleared)) {
        W.banner = { s: keys ? 'Đủ 3 mảnh chìa! Cửa phía trên sảnh đã mở' : 'Dọn đủ 3 phòng quái! Cửa Trùm đã mở', col: '#ffd23f', t: 3.5 };
        G.sfx('evolve');
      } else if (!W.banner) W.banner = { s: keys ? 'Nhặt được mảnh chìa ' + n + '/3' : 'Đã dọn ' + n + '/3 phòng quái', col: '#ffd27a', t: 2.5 };
    }
    updateDoors();
  }
  // Đồ rơi sau khi thắng: đi ngang qua là nhặt, hiện chữ phần thưởng bay lên (thưởng đã được cộng lúc thắng).
  function pickLoot(W, P) {
    for (const pr of W.props) {
      if (pr.type !== 'loot' || pr.got || G.time < pr.born + 0.5) continue;
      if (Math.hypot(pr.x - P.x, (pr.y - P.y) * 1.3) < 14) { pr.got = G.time; G.sfx('pick', 1.2); }
    }
    for (const pr of W.props) if (pr.type === 'loot' && pr.got && G.time - pr.got > 0.9) pr.dead = true;
    if (W.props.some((p) => p.dead && p.type === 'loot')) W.props = W.props.filter((p) => !(p.dead && p.type === 'loot'));
  }
  // Người chơi đang đẩy vào cửa nào (đứng sát mép sàn, đúng chỗ cửa, và đang đi về phía cửa).
  function doorAt(inp) {
    const W = S.W, P = S.P;
    let mx = inp.mx, my = inp.my;
    const l = Math.hypot(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    if (P.dodgeT > 0) { mx = P.ddx; my = P.ddy; }
    for (const d of W.doors) {
      const q = G.roomArt.doorPos(W.geo, d.dir), v = DIRV[d.dir];
      if (mx * v[0] + my * v[1] < 0.35) continue;
      const along = v[0] ? Math.abs(P.y - q.y) : Math.abs(P.x - q.x);
      const depth = v[0] ? (q.x - P.x) * v[0] : (q.y - P.y) * v[1];
      if (along <= 12 && depth <= 1.5) return d;
    }
    return null;
  }

  function chestOptions() {
    const tier = G.rollRarity(S.r);
    const type = G.pick(G.WKEYS), family = Math.floor(G.rnd() * G.FAMILIES) % G.FAMILIES;
    const look = { type, family, rarity: tier, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0 };
    return [
      { kind: 'weapon', type, tier, family, look, label: G.wName(look), sub: 'Bậc ' + G.RARITY[tier].name + '. Vũ khí mới, cất vào rương đồ' },
      { kind: 'ore', n: 5 + S.r * 3, label: (5 + S.r * 3) + ' quặng', sub: 'Dùng để mài vũ khí ở lò rèn' },
      { kind: 'charm', el: S.tut ? 'fire' : G.pick(G.ELS), label: '', sub: 'Phủ hệ lên cả hai vũ khí trong 60 giây' },
    ].map((o) => { if (o.kind === 'charm') o.label = 'Bùa ' + G.EL[o.el].name; return o; });
  }
  // Suối hồi chỉ dùng được khi đã dọn đủ 3 phòng quái (2 Đánh quái và Tinh anh). Ở Kiểu A và C thì lúc tới suối luôn đã đủ;
  // ở Kiểu B (mê cung) người chơi có thể đi ngang suối từ sớm: lúc đó suối hiện mờ, chưa dùng được.
  const FOUNTAIN_NEED = 3;
  function fightsCleared() { return S.map.rooms.filter((r) => (r.type === 'fight' || r.type === 'elite') && S.cleared[r.id]).length; }
  function fountainLocked() { return fightsCleared() < FOUNTAIN_NEED; }
  G.fountainLocked = () => !!S && fountainLocked();
  function interact(pr) {
    const W = S.W, P = S.P;
    if (pr.act === 'fountain' && fountainLocked()) return;
    if (pr.act === 'chest' && !pr.used) { S.opts = chestOptions(); S.mode = 'chest'; S.prop = pr; } else if (pr.act === 'fountain' && !pr.used) {
      if (pr.kind === 'hp') P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.5); else P.mana = P.maxmana;
      for (const o of W.props) if (o.type === 'fountain') o.used = true;
      G.burst(pr.x, pr.y, pr.kind === 'hp' ? '#ff6a5a' : '#6ab0ff', 20, 80);
      G.sfx('evolve', 0.8);
    } else if (pr.act === 'stash') { S.mode = 'swap'; S.sel = null; } else if (pr.act === 'merchant') S.mode = 'merchant';
    else if (pr.act === 'altar' && !pr.used) { S.mode = 'curse'; S.prop = pr; }
    else if (pr.act === 'portal') G.usePortal();
  }
  function rebuildWeapons() {
    const P = S.P;
    const cur = P.weapons[P.cur];
    P.weapons = G.save.carry.map((id) => G.weaponById(id)).filter(Boolean);
    P.cur = Math.max(0, P.weapons.indexOf(cur));
  }

  // Tính và lưu phần thưởng (gọi đúng một lần mỗi lượt chơi). Thắng thì gọi ngay lúc hạ trùm, trước khi người chơi vào cổng.
  function settle(win) {
    const sv = G.save, reg = G.REGIONS[S.r], W = S.W;
    S.marks += W.marksGained; W.marksGained = 0;
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
      // Vũ khí rơi: trùm vùng theo G.bossDrop (lần đầu chắc chắn Vàng); ải thường thì 50% một món bậc ngẫu nhiên.
      if (big || G.rnd() < G.DROP.stage) {
        const nw = big ? G.bossDrop(S.r) : G.giveWeapon(G.pick(G.WKEYS), G.rollRarity(S.r));
        R.lines.push(nw ? { s: (big ? reg.bossName + ' rơi ' : 'Nhặt được ') + rarName(nw), w: nw } : 'Rương đồ đầy, vũ khí rớt đổi thành vàng');
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
      const xp = Math.round(S.base.xp * 0.4 * (Math.max(0, S.visits - 1) / S.rooms.length));
      const gold = S.loot.kills * 2;
      sv.gold += gold;
      R.lines.push('+' + xp + ' kinh nghiệm', '+' + gold + ' vàng');
      R.up = G.addXp(sv.hero, xp);
    }
    if (S.marks > 0) R.lines.push('Vũ khí nhận ' + Math.round(S.marks) + ' dấu ấn');
    if (R.up) R.lines.push(G.HEROES[sv.hero].name + ' lên cấp ' + sv.heroes[sv.hero].lvl + '!');
    for (const g of S.got) R.lines.push(g.w ? { s: 'Trong ải: ' + g.s, w: g.w } : 'Trong ải: ' + g);
    S.result = R; S.gotN = S.got.length; S.marksAt = S.marks;
    G.persist();
  }
  // Hiện bảng kết quả. Thắng mà đã tính thưởng lúc hạ trùm: thêm các thứ nhặt được sau đó (rương, tinh anh còn sót, dấu ấn).
  function finish(win) {
    if (!S.result) settle(win);
    else if (S.won && win) {
      const W = S.W, R = S.result;
      S.marks += W.marksGained; W.marksGained = 0;
      const more = Math.round(S.marks - (S.marksAt || 0));
      if (more > 0) R.lines.push('Sau trận trùm: vũ khí nhận thêm ' + more + ' dấu ấn');
      for (const g of S.got.slice(S.gotN || 0)) R.lines.push(g.w ? { s: 'Trong ải: ' + g.s, w: g.w } : 'Trong ải: ' + g);
      S.gotN = S.got.length; S.marksAt = S.marks;
      G.persist();
    }
    S.mode = win ? 'result' : 'dead';
  }
  G.finishStage = finish;
  // Sửa góp ý 2: hạ trùm cuối ải thì KHÔNG hiện bảng kết quả ngay. Thưởng được tính và lưu ngay, dòng báo thắng hiện lên,
  // đồ rơi nằm lại trên sàn để nhặt, và một cổng dịch chuyển mọc lên giữa phòng trùm. Người chơi đi lại tự do (cửa phòng trùm mở,
  // rương, suối, thương nhân còn dùng được), tới gần cổng thì nút Đánh thành "Vào cổng"; vào cổng mới hiện bảng kết quả.
  function winPortal() {
    const W = S.W, g = W.geo, b = W.boss;
    settle(true);
    S.won = true; W.safe = true; W.px1 = null; // trùm vùng đã gục: bỏ bức chắn bên phải để nhặt được đồ rơi chỗ nó
    const P = S.P; P.st.fire = 0; P.st.poison = 0; P.st.ice = 0;
    if (!W.cleared) clearRoom(); else updateDoors();
    // cổng ở giữa sàn; nếu trùm gục ngay giữa phòng thì đồ rơi toả quanh chỗ trùm, cổng vẫn ở giữa
    const px = g.cx, py = g.cy + 6;
    W.props.push({ type: 'portal', act: 'portal', x: px, y: py, born: G.time });
    S.portal = { room: S.idx, x: px, y: py };
    // đồ rơi: mỗi phần thưởng một món nằm trên sàn quanh chỗ trùm gục; đi ngang qua là nhặt (thưởng đã được cộng sẵn)
    const bx = b ? G.clamp(b.x, W.x0 + 20, W.x1 - 20) : px - 40, by = b ? G.clamp(b.y, W.y0 + 10, W.y1 - 10) : py;
    const items = [];
    for (const l of S.result.lines) {
      if (l && l.w) { items.push({ kind: 'weapon', w: l.w, s: G.wName(l.w) }); continue; }
      if (typeof l !== 'string' || l.indexOf('Trong ải') === 0) continue;
      const k = /vàng/.test(l) ? 'gold' : /quặng/.test(l) ? 'ore' : /đá tôi/.test(l) ? 'stone' : /mảnh/.test(l) ? 'shard' + S.r : /kinh nghiệm/.test(l) ? 'xp' : /^\+\d+ /.test(l) ? 'mat' + S.r : null;
      if (k) items.push({ kind: k, s: l });
    }
    items.forEach((it, i) => {
      const a = (i / Math.max(1, items.length)) * Math.PI * 2 + 0.4, rr = 18 + (i % 2) * 8;
      let x = G.clamp(bx + Math.cos(a) * rr, W.x0 + 8, W.x1 - 8), y = G.clamp(by + Math.sin(a) * rr * 0.7, W.y0 + 6, W.y1 - 4);
      if (Math.hypot(x - px, (y - py) * 1.3) < 30) x = G.clamp(x + (x < px ? -26 : 26), W.x0 + 8, W.x1 - 8); // không nằm đè lên cổng
      W.props.push(Object.assign({ type: 'loot', x, y, born: G.time + i * 0.08, sx: bx, sy: by - 10 }, it));
    });
    W.banner = { s: 'Thắng rồi! Nhặt đồ rơi, đi dạo tuỳ ý, xong thì vào cổng dịch chuyển', col: '#ffd23f', t: 5 };
    G.sfx('evolve', 0.8);
  }
  G.winPortal = () => { if (S && !S.won && S.loot.bossDown) winPortal(); };
  // Bước vào cổng (bài kiểm tra dùng thẳng hàm này): hiện bảng kết quả.
  G.usePortal = function () { if (S && S.won && S.mode === 'play') { G.sfx('evolve', 1.4); finish(true); } };
  // Dùng khi chạy thử: nhảy thẳng tới phòng số n (0 là Bắt đầu, 7 là Trùm). type: ép loại phòng và dựng lại phòng đó.
  G.gotoRoom = function (n, type) {
    if (type) { S.map.rooms[n].type = type; S.rooms[n] = type; delete S.worlds[n]; delete S.cleared[n]; }
    S.trans = null; S.mode = 'play';
    enterRoom(n, null);
  };

  // ---------- điều khiển ----------
  const BTN0 = { atk: [430, 220, 28], dodge: [380, 246, 18], special: [384, 196, 18], skill: [434, 162, 18] }; // nút kỹ năng nhích lên 4 để ngọn lửa của nút Đánh không chạm thẻ giá
  // Có lề trống (màn hình dài hoặc đang cầm dọc) thì đẩy nút ra lề để không che trận đấu.
  // Phòng trùm rộng hơn (sàn tới x = 380): màn hình không đủ lề (16:9) thì dùng bộ nút thu nhỏ, nằm sát mép phải, không đè lên sàn.
  const BTN_BIG = { atk: [450, 222, 26], dodge: [400, 248, 17], special: [401, 200, 17], skill: [448, 167, 17] };
  const bigRoom = () => !!(S && S.W && S.W.geo && S.W.geo.big);
  function btnPos(name) { const b = (bigRoom() && G.cx < 20 ? BTN_BIG : BTN0)[name]; return [b[0] + G.cx, b[1] + G.cy, b[2]]; }
  // Cần điều khiển lúc chưa chạm: phòng trùm thì lùi sát mép trái để không đè tường.
  function stickPos() { return [(bigRoom() && G.cx < 30 ? 42 : 62) - G.cx * 0.6, 216 + G.cy, 24]; }
  const BTN = BTN0;
  // Ô bình máu và nút tạm dừng: [x, y, rộng, cao]. Vùng chạm rộng hơn hình vẽ 4 đơn vị mỗi phía.
  const POT = [4, 23, 50, 21], PAU = [58, 23, 30, 21];
  const hitBox = (d, b) => G.inRect(d, b[0] - 4, b[1] - 3, b[2] + 8, b[3] + 7);
  function setMode(m) { S.mode = m; S.sel = null; }
  G.stageUi = { btnPos, stickPos, POT, PAU }; // để bài kiểm tra biết nút nằm ở đâu
  function readInput() {
    const k = G.keys, kp = G.keyP;
    const inp = {
      mx: (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0),
      my: (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0),
      atk: !!(k.KeyJ || k.KeyZ || k.Space), atkP: !!(kp.KeyJ || kp.KeyZ || kp.Space),
      dodgeP: !!(kp.KeyK || kp.KeyX || kp.ShiftLeft), specialP: !!(kp.KeyL || kp.KeyC), skillP: !!(kp.KeyI || kp.KeyV),
      swapP: !!(kp.KeyQ || kp.Tab), potionP: !!(kp.KeyE || kp.KeyH), pauseP: !!(kp.Escape || kp.KeyP), mapP: !!kp.KeyM,
    };
    const mm = G.minimap.rect(S);
    for (const d of G.downs) {
      if (G.inRect(d, 368, 0, 112, 38)) { inp.swapP = true; d.role = 'ui'; continue; }
      if (G.inRect(d, mm[0] - 2, mm[1], mm[2] + 4, mm[3] + 3)) { inp.mapP = true; d.role = 'ui'; continue; }
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
        if (kp.Escape || (kp.KeyP && S.mode === 'paused') || (kp.KeyM && S.mode === 'map')) {
          if (S.mode === 'result' || S.mode === 'dead') { S = null; G.setScene(G.Village); return; }
          setMode('play'); G.sfx('ui');
        }
        return;
      }
      // đang chuyển phòng: màn hình trượt theo hướng đi, trận đấu đứng yên
      if (S.trans) {
        const T = S.trans;
        T.t += dt;
        if (T.phase === 0 && T.t >= TRANS_OUT) { enterRoom(T.to, T.dir); T.phase = 1; T.t = 0; }
        else if (T.phase === 1 && T.t >= TRANS_IN) S.trans = null;
        return;
      }
      const inp = G.botInput ? G.botInput(S) : readInput();
      if (inp.pauseP) { setMode('paused'); return; }
      if (inp.mapP) { setMode('map'); G.sfx('ui'); return; }
      S.roomT = (S.roomT || 0) + dt;
      if (S.doorCd > 0) S.doorCd -= dt;
      // tương tác với đồ vật gần nhất
      S.near = null;
      let bd = 26;
      const fLock = W.type === 'fountain' && fountainLocked();
      for (const pr of W.props) if (pr.type === 'fountain') pr.dim = fLock && !pr.used; // suối chưa dùng được thì vẽ mờ
      for (const pr of W.props) {
        if (!pr.act || pr.used || (fLock && pr.act === 'fountain')) continue;
        const d = Math.hypot(pr.x - P.x, (pr.y - P.y) * 1.3);
        if (d < bd) { bd = d; S.near = pr; }
      }
      if (S.near && inp.atkP) { inp.atk = false; inp.atkP = false; interact(S.near); if (S.mode !== 'play' || S.W !== W) return; }
      else if (S.near) inp.atk = false;
      G.updateWorld(dt, inp);
      // đạn không bay xuyên tường ra lề màn hình
      if (W.projs.length) W.projs = W.projs.filter((o) => o.x > W.geo.fx0 - 2 && o.x < W.geo.fx1 + 2 && o.y > W.geo.fy0 - 26 && o.y < W.geo.fy1 + 8);
      for (const z of W.zones) if (z.wave && z.x < W.geo.fx0 + 3) z.dead = true; // sóng của Ngư Tinh tan khi chạm tường trái
      // đợt quái
      tickSpawns(dt);
      if (W.waves.length && !W.cleared) {
        if (W.ents.filter((e) => !e.add).length === 0 && !W.spawns.length) {
          W.waveT -= dt;
          if (W.waveT <= 0) {
            W.waveI++;
            W.waveT = 0.7;
            if (W.waveI < W.waves.length) spawnWave(W.waves[W.waveI]); else clearRoom();
          }
        }
      }
      if (S.challenge) S.challenge.t -= dt;
      if (W.type === 'boss' && S.loot.bossDown && !S.won) { S.endT += dt; if (S.endT > 1.2) winPortal(); return; }
      if (W.over === 'dead' && !S.won) { S.endT += dt; if (S.endT > 1.2) finish(false); return; }
      if (S.won) pickLoot(W, P);
      // bước vào cửa đang mở thì sang phòng kề (phòng trùm: chỉ sau khi đã thắng)
      if (W.cleared && (W.type !== 'boss' || S.won) && S.doorCd <= 0) {
        const d = doorAt(inp);
        if (d && d.open) { S.trans = { to: d.to, dir: d.dir, phase: 0, t: 0 }; G.sfx('swing', 0.5); }
        else if (d && d.gate && !S.gateMsgT) { S.gateMsgT = 2; }
      }
      if (S.gateMsgT > 0) S.gateMsgT = Math.max(0, S.gateMsgT - dt);
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
      if (S.trans) slideWorld();
      drawHud();
      if (S.mode === 'map') { G.minimap.drawBig(S); if (G.click) { G.click = null; setMode('play'); G.sfx('ui'); } }
      else if (S.mode === 'chest') panelChest();
      else if (S.mode === 'swap') panelSwap();
      else if (S.mode === 'merchant') panelMerchant();
      else if (S.mode === 'curse') panelCurse();
      else if (S.mode === 'paused') panelPause();
      else if (S.mode === 'result' || S.mode === 'dead') panelResult();
      if (S && S.fade > 0) ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,' + Math.min(1, S.fade / 0.35) + ')'); // S có thể vừa bị xoá khi bấm Về làng
    },
  };

  // Chuyển phòng: phòng cũ trượt ra và tối dần, phòng mới trượt vào từ phía cửa vừa bước qua.
  const TRANS_OUT = 0.13, TRANS_IN = 0.2, SLIDE = 40;
  function slideWorld() {
    const T = S.trans, c = G.wx, v = DIRV[T.dir];
    const k = T.phase === 0 ? Math.min(1, T.t / TRANS_OUT) : 1 - Math.min(1, T.t / TRANS_IN);
    const sgn = T.phase === 0 ? -1 : 1;
    const ox = Math.round(v[0] * SLIDE * k * sgn), oy = Math.round(v[1] * SLIDE * k * sgn);
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (ox || oy) {
      c.globalCompositeOperation = 'copy';
      c.drawImage(c.canvas, ox, oy);
      c.globalCompositeOperation = 'source-over';
    }
    c.fillStyle = 'rgba(0,0,0,' + Math.min(1, k * 1.1).toFixed(3) + ')';
    c.fillRect(0, 0, G.W, G.H);
  }

  function markInfo(w) {
    if (!w.branch) {
      const top = G.ELS.slice().sort((a, b) => w.marks[b] - w.marks[a])[0];
      return { frac: w.marks[top] / G.MARKS[0], col: w.marks[top] > 0 ? G.EL[top].col : '#666', txt: w.marks[top] > 0 ? G.EL[top].name + ' ' + Math.floor(w.marks[top]) + '/' + G.MARKS[0] : 'Chưa có dấu ấn' };
    }
    const st = G.wStage(w), m = w.marks[w.branch];
    const cap = G.RARITY[G.wRar(w)].maxStage;
    if (st >= cap) return { frac: 1, col: G.EL[w.branch].col, txt: G.EL[w.branch].name + ' · ' + G.STAGE_NAMES[st] + (cap < 3 ? ' (tối đa bậc ' + G.RARITY[G.wRar(w)].name + ')' : ' (tối đa)') };
    return { frac: (m - (st ? G.MARKS[st - 1] : 0)) / (G.MARKS[st] - (st ? G.MARKS[st - 1] : 0)), col: G.EL[w.branch].col, txt: G.EL[w.branch].name + ' · ' + G.STAGE_NAMES[st] + ' ' + Math.floor(m) + '/' + G.MARKS[st] };
  }
  G.markInfo = markInfo;

  function drawHud() {
    const W = S.W, P = S.P, c = G.ux;
    // máu, mana
    const T = G.theme;
    T.bar(6, 3, 112, 'hp', P.hp / P.maxhp, Math.ceil(P.hp) + '/' + P.maxhp, { h: 9 });
    T.bar(6, 13, 100, 'mana', P.mana / P.maxmana, null, { h: 7 });
    const canDrink = P.potions > 0 && !W.noPotion;
    const BA = G.btnArt; // bộ nút riêng (js/btn_art.js)
    const heldBox = (b) => [...G.pointers.values()].some((p) => p.role === 'ui' && hitBox({ x: p.sx, y: p.sy }, b));
    BA.draw(c, 'potion', POT[0] + 13, POT[1] + 11, 11, { count: P.potions, disabled: !canDrink, pressed: heldBox(POT) });
    ui.text(W.noPotion ? 'Cấm' : 'Bình máu', POT[0] + 28, POT[1] + 14, { size: 6.5, bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    BA.draw(c, 'pause', PAU[0] + PAU[2] / 2 + 6, PAU[1] + 11, 10, { pressed: heldBox(PAU) });
    let sx = 6;
    for (const k of G.ELS) if (P.st[k] > 0) { ui.rect(sx, 48, 10, 10, G.EL[k].col, '#000'); sx += 12; }
    const cw = G.curW(P), coat = P.coats[cw.id];
    if (coat && coat.t > 0) ui.text('Bùa ' + G.EL[coat.el].name + ' ' + Math.ceil(coat.t) + ' giây', sx, 56.5, { size: 7.5, color: G.EL[coat.el].col, bold: true });
    // tên vùng và loại phòng ở lề trái; bản đồ nhỏ ở lề phải (thay hàng chấm phòng trước đây)
    ui.text(G.REGIONS[S.r].name + ' ' + (S.i + 1) + ' · ' + ROOM_NAME[W.type], 6, 69, { size: 7, color: '#d9cdb8' });
    G.minimap.draw(S);
    // vũ khí: hình và bậc ở trên, mốc tiến hóa ở dưới, thanh dấu ấn sát đáy
    P.weapons.forEach((w, i) => {
      const x = 368 + i * 56, on = i === P.cur;
      // Khung ô vũ khí cùng bộ với nút, viền mang màu bậc. Hình vũ khí sống và chữ do game vẽ ở các dòng dưới.
      const rar = G.RARITY[G.wRar(w)];
      BA.slot(c, x, 3, 54, 35, {
        weapon: { type: w.type, branch: G.activeEl(P, w), stage: G.wStage(w), rarity: G.wRar(w) },
        active: on, cd: on ? 0 : P.swapCd / 1.5, icon: false, gem: false, id: 'slot' + i,
      });
      G.art.weaponIcon(c, Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }), x + 13, 13, 19, on ? (P.atkT > 0 ? 'attack' : 'idle') : 'sleep');
      const mi = markInfo(w);
      ui.text(rar.name + (w.sharpen ? ' +' + w.sharpen : ''), x + 51, 14, { size: 7, align: 'right', bold: on, color: rar.col });
      ui.text(G.STAGE_NAMES[G.wStage(w)], x + 27, 29.5, { size: 6.5, align: 'center', color: w.branch ? G.EL[w.branch].col : '#b8b0a0' });
      ui.bar(x + 3, 32.5, 48, 3, mi.frac, mi.col);
    });
    if (P.weapons.length > 1 && S.tut && W.type === 'elite') ui.text('↑ Chạm để đổi vũ khí', 366, 24, { size: 7, align: 'right', bold: true, color: '#ffd27a' });
    // trùm: thanh máu và các lớp thích nghi nằm trên mặt tường sau, không che sàn
    const b = W.boss;
    if (b && !b.dead) {
      T.bar(133, 7, 214, 'boss', b.hp / b.maxhp, null, { h: 9, marks: 1 });
      ui.rect(140 + 200 * 0.6, 9, 1, 5, '#fff0c4');
      ui.rect(140 + 200 * 0.3, 9, 1, 5, '#fff0c4');
      ui.text(b.name, 140, 24, { size: 7.5, bold: true, color: '#ffd9c8' });
      let lx = 340;
      for (const l of b.layers.slice().reverse()) {
        const s = l.type === 'resist' ? 'Kháng ' + G.EL[l.el].name : G.layerText(l);
        ui.font(6.5, true);
        const tw = G.ux.measureText(s).width + 6;
        lx -= tw + 2;
        ui.rect(lx, 17, tw, 9, l.type === 'resist' ? G.EL[l.el].dark : '#1f4f4a', '#1a120a');
        ui.text(s, lx + 3, 24, { size: 6.5, bold: true });
      }
      if (b.weak.length) ui.text('Yếu ' + b.weak.map((e) => G.EL[e].name).join(', '), 240, 35, { size: 7, align: 'center', color: G.EL[b.weak[0]].col, bold: true });
      if (b.exposed > 0) ui.text('LỘ ĐIỂM YẾU!', 240, 46, { size: 8, align: 'center', color: '#ffd23f', bold: true });
    }
    let by = b && !b.dead ? 58 : S.challenge ? 26 : 8;
    if (W.type === 'fountain') {
      const t = S.preview.length ? 'Trùm đã học: ' + S.preview.map(G.layerText).join(' · ') : 'Trùm chưa học được gì từ bạn';
      const lines = ui.wrap(t, 228, 7, true);
      T.plate(122, 8, 236, lines.length * 9 + 7);
      lines.forEach((l, i) => ui.text(l, 240, 18 + i * 9, { size: 7, align: 'center', color: '#ffd9c8', bold: true }));
      by = 14 + lines.length * 9 + 4;
    }
    if (S.challenge) { ui.text('Thử thách: hạ hết quái trong ' + Math.max(0, Math.ceil(S.challenge.t)) + ' giây', 240, 20, { size: 8, align: 'center', color: S.challenge.t > 8 ? '#ffd27a' : '#ff6a5a', bold: true }); }
    // Lời chỉ dẫn của ải đầu nằm ở lề trái, không che phòng. Ở phòng trùm tự ẩn sau 12 giây.
    let hint = S.hint;
    if (hint && W.cleared && W.hadWaves) hint = TUT.door;
    if (hint && W.type === 'boss' && S.roomT > 12) hint = null;
    if (hint && S.mode === 'play') {
      const hw = W.geo.big ? 62 : 116; // phòng trùm rộng hơn nên ô chữ hẹp lại, không đè lên sàn
      const lines = ui.wrap(hint, hw - 8, 7);
      T.plate(3, 75, hw, Math.round(lines.length * 9.5 + 8));
      lines.forEach((l, i) => ui.text(l, 7, 85 + i * 9.5, { size: 7 }));
    }
    if (W.banner) {
      // dòng báo nằm trên tường sau; dài quá thì thu chữ, vẫn dài thì xuống dòng
      const maxW = W.geo.big ? 290 : 228;
      let size = 10, lines = [W.banner.s];
      for (const sz of [10, 8.5, 7.5]) { size = sz; ui.font(sz, true); if (G.ux.measureText(W.banner.s).width <= maxW) break; }
      ui.font(size, true);
      if (G.ux.measureText(W.banner.s).width > maxW) lines = ui.wrap(W.banner.s, maxW, size, true);
      let tw = 0;
      ui.font(size, true);
      for (const l of lines) tw = Math.max(tw, G.ux.measureText(l).width);
      tw += 14;
      const lh = size + 3, bh = lines.length * lh + 5;
      T.plate(Math.round(240 - tw / 2) - 2, by - 1, Math.round(tw) + 4, Math.round(bh) + 2);
      lines.forEach((l, i) => ui.text(l, 240, by + size + 1.5 + i * lh, { size, align: 'center', bold: true, color: W.banner.col }));
    }
    // cửa dẫn tới Trùm còn khóa: ghi rõ còn thiếu gì, ngay cạnh cửa
    if (S.mode === 'play' && W.cleared && !S.trans) {
      const gi = G.minimap.gateInfo(S);
      for (const d of W.doors) {
        if (!d.gate || d.open || !gi) continue;
        const q = G.roomArt.doorPos(W.geo, d.dir), v = DIRV[d.dir];
        const tx = q.x - v[0] * 34, ty = q.y - v[1] * 22 + (v[1] < 0 ? 4 : 0);
        const hot = S.gateMsgT > 0 && Math.floor(G.time * 6) % 2;
        ui.text(gi.keys ? 'Cần 3 mảnh chìa' : 'Dọn 3 phòng quái', tx, ty, { size: 7, align: 'center', bold: true, color: hot ? '#ffffff' : '#ff9a8a' });
        ui.text('Đã có ' + gi.n + '/' + gi.need, tx, ty + 9, { size: 7, align: 'center', bold: true, color: '#ffd27a' });
      }
    }
    // tên các vật bấm được, để người mới biết đó là gì
    const PNAME = { chest: 'Rương báu', stash: 'Rương đồ', merchant: 'Thương nhân', altar: 'Bàn thờ lời nguyền', portal: 'Cổng dịch chuyển' };
    if (S.mode === 'play') {
      const fLock = W.type === 'fountain' && fountainLocked();
      if (fLock && W.props.some((p) => p.type === 'fountain' && !p.used)) {
        // suối còn khóa: một dòng chữ mờ giữa hai suối, kèm số phòng quái đã dọn
        const fs = W.props.filter((p) => p.type === 'fountain'), fx = fs.reduce((a, p) => a + p.x, 0) / fs.length, fy = fs[0].y - 44;
        ui.text('Dọn hết quái rồi quay lại', fx, fy, { size: 7.5, align: 'center', bold: true, color: '#b8b0a0' });
        ui.text('Đã dọn ' + fightsCleared() + '/' + FOUNTAIN_NEED + ' phòng quái', fx, fy + 9, { size: 6.5, align: 'center', color: '#8f887c' });
      }
      for (const pr of W.props) {
        if (!pr.act || pr.used || (fLock && pr.act === 'fountain')) continue;
        const nm = pr.act === 'fountain' ? (pr.kind === 'hp' ? 'Hồi máu' : 'Hồi mana') : PNAME[pr.act];
        const py = pr.y - (pr.act === 'stash' ? 28 : pr.act === 'fountain' ? 40 : pr.act === 'portal' ? 44 : 36);
        if (pr === S.near) ui.text(pr.act === 'portal' ? 'Bấm Vào cổng' : 'Bấm Đánh', pr.x - W.cam, py, { size: 8, align: 'center', bold: true, color: '#fff3b0' });
        else if (nm) ui.text(nm, pr.x - W.cam, py, { size: 7, align: 'center', bold: true, color: pr.act === 'fountain' ? (pr.kind === 'hp' ? '#ff9a8a' : '#9ac8ff') : '#f0d9b0' });
      }
    }
    // nút cảm ứng
    if (S.mode === 'play') {
      const joy = [...G.pointers.values()].find((p) => p.role === 'joy');
      let jdx = 0, jdy = 0;
      if (joy) {
        jdx = joy.x - joy.sx; jdy = joy.y - joy.sy;
        const jl = Math.hypot(jdx, jdy);
        if (jl > 24) { jdx *= 24 / jl; jdy *= 24 / jl; }
        BA.stick(c, joy.sx, joy.sy, 24, jdx, jdy, true);
      } else { const sp = stickPos(); BA.stick(c, sp[0], sp[1], sp[2], 0, 0, false); }
      const held = (name) => [...G.pointers.values()].some((p) => p.role === name);
      const cw2 = G.curW(P);
      // Vũ khí đang cầm: loại, hệ đang có hiệu lực (kể cả lúc đang Nung), mốc tiến hóa, bậc.
      const wst = { type: cw2.type, branch: G.activeEl(P, cw2), stage: G.wStage(cw2), rarity: G.wRar(cw2) };
      const showLab = !!S.tut; // chữ tên nút chỉ hiện ở ải hướng dẫn
      // Mũi tên trên nút Né: theo cần điều khiển hoặc phím; không đẩy thì theo hướng di chuyển gần nhất (đúng hướng sẽ lộn).
      const kx = (G.keys.ArrowRight || G.keys.KeyD ? 1 : 0) - (G.keys.ArrowLeft || G.keys.KeyA ? 1 : 0) + jdx / 24;
      const ky = (G.keys.ArrowDown || G.keys.KeyS ? 1 : 0) - (G.keys.ArrowUp || G.keys.KeyW ? 1 : 0) + jdy / 24;
      const DK = G.DODGE.ky; // mũi tên chỉ đúng góc sẽ lộn trên màn hình (chiều dọc đi ngắn hơn chiều ngang)
      const dir = P.dodgeT > 0 ? Math.atan2(P.ddy * DK, P.ddx) : Math.hypot(kx, ky) > 0.18 ? Math.atan2(ky * DK, kx) : P.ldx != null ? Math.atan2(P.ldy * DK, P.ldx) : P.face > 0 ? 0 : Math.PI;
      S.dodgeDir = dir; // để bài kiểm tra đọc
      // Vòng nạp quanh nút Đánh khi đang giữ để lấy đà (P.mv của js/moves.js). Búa có 2 nấc.
      const mv = P.mv, chg = mv && mv.holding ? mv.charge : 0, mcfg = G.MOVES && G.MOVES[cw2.type];
      let bt = btnPos('atk');
      // đứng gần cổng dịch chuyển: nút Đánh thành "Vào cổng" (giống nút Nói chuyện ở làng)
      if (S.near && S.near.act === 'portal' && G.theme && G.theme.round) G.theme.round(bt[0], bt[1], bt[2] + 1, 'talk', { lit: true, pressed: held('atk') || G.keys.KeyJ, label: 'Vào cổng' });
      else BA.draw(c, 'atk', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, pressed: held('atk') || G.keys.KeyJ, glow: !!S.near, label: showLab ? 'Đánh' : null,
        charge: chg > 0 ? chg : undefined, chargeSteps: mcfg && mcfg.charge ? (mcfg.charge.lv1 != null ? 2 : 1) : 0,
      });
      bt = btnPos('special');
      BA.draw(c, 'special', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, cost: P.specCost, disabled: P.mana < P.specCost, pressed: held('special'),
        cd: P.specCd / 0.8, cdSec: P.specCd, label: showLab ? G.WTYPES[cw2.type].special : null, labelAt: 'top',
      });
      bt = btnPos('skill');
      BA.draw(c, 'skill', bt[0], bt[1], bt[2] + 1, {
        hero: P.key, cost: 40, disabled: P.mana < 40, pressed: held('skill'),
        cd: P.skillCd / 5, cdSec: P.skillCd, label: showLab ? G.HEROES[P.key].skill : null, labelAt: 'top',
      });
      bt = btnPos('dodge');
      BA.draw(c, 'dodge', bt[0], bt[1], bt[2] + 1, {
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
      const isW = o.kind === 'weapon';
      if (ui.btn(x, 84, 108, 100, isW ? '' : o.label, { sub: '', size: 10 })) {
        if (isW) { const w = G.giveWeapon(o.type, o.tier, { family: o.family }); S.got.push(w ? { s: rarName(w), w } : 'vàng (rương đồ đầy)'); }
        if (o.kind === 'ore') { G.save.ore += o.n; S.got.push(o.n + ' quặng'); }
        if (o.kind === 'charm') G.addCoat(o.el, 60);
        S.prop.used = true;
        S.mode = 'play';
        G.sfx('pick');
      }
      if (isW) { // hình vũ khí sống trong khung màu bậc, tên mang màu bậc
        const rar = G.RARITY[o.tier];
        G.theme.slot(x + 36, 89, 36, o.tier);
        G.art.weaponIcon(G.ux, o.look, x + 54, 107, 30, 'idle');
        ui.wrap(o.label, 100, 8.5, true).slice(0, 2).forEach((l, k) => ui.text(l, x + 54, 137 + k * 10, { size: 8.5, bold: true, align: 'center', color: rar.col }));
      }
      ui.para(o.sub, x + 6, isW ? 162 : 160, 96, { size: 6.5, color: '#f0d9b0' });
    });
  }
  function weaponLine(w, x, y, wd, sel) {
    const mi = markInfo(w);
    const rar = G.RARITY[G.wRar(w)];
    G.theme.inset(x, y, wd, 22, sel);
    // ô hình vũ khí: viền mang màu bậc
    G.theme.slot(x + 2, y + 1, 20, G.wRar(w));
    G.art.weaponIcon(G.ux, w, x + 12, y + 11, 17);
    ui.text(G.wName(w), x + 26, y + 9.5, { size: 7.5, bold: true, color: rar.col });
    ui.text(mi.txt, x + 26, y + 18.5, { size: 6.5, color: mi.col === '#666' ? '#a9c2b4' : mi.col });
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
    ui.text(sv.gold + ' vàng', 398, 65, { size: 8, align: 'right', color: '#ffd23f', bold: true });
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
    // đã hạ trùm: không còn "bỏ ải" mà là rời ải, sang bảng kết quả thắng
    if (S.won) { if (ui.btn(165, 154, 150, 28, 'Rời ải', { color: '#a8452a' })) finish(true); }
    else if (ui.btn(165, 154, 150, 28, 'Bỏ ải, về làng', { color: '#6a2a22' })) { S.quit = true; finish(false); }
  }
  function panelResult() {
    const R = S.result;
    if (G.time - S.modeT < 0.45) G.click = null; // tránh bấm nhầm khi bảng vừa hiện lúc đang đánh
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.65)');
    ui.panel(70, 22, 340, 228, R.win ? 'Qua ải ' + G.REGIONS[S.r].name + ' ' + (S.i + 1) : S.quit ? 'Đã bỏ ải ở phòng ' + ROOM_NAME[S.rooms[S.idx]] : 'Bạn đã gục ở phòng ' + ROOM_NAME[S.rooms[S.idx]]);
    let y = 54;
    if (R.win) {
      const notes = ['Qua ải', 'Không dùng bình máu', 'Hạ trùm bằng hệ khắc chế'];
      for (let i = 0; i < 3; i++) {
        ui.text(R.starNote[i] ? '★' : '☆', 86, y, { size: 12, color: R.starNote[i] ? '#ffd23f' : '#5a7a72' });
        ui.text(notes[i], 102, y - 1, { size: 8, color: R.starNote[i] ? '#f1ead9' : '#8fa49e' });
        y += 14;
      }
      y += 2;
    }
    // Phần thưởng: chữ ở cột trái; vũ khí nhận được thành thẻ viền màu bậc ở cột phải (khung thẻ của chủ đề trống đồng).
    const TH = G.theme, texts = R.lines.filter((l) => !l.w), weps = R.lines.filter((l) => l.w);
    const rows = Math.max(1, Math.floor((208 - y) / 11.5));
    const line = (l, cx, cy) => ui.text(l, cx, cy, { size: 7.5, color: l.includes('lên cấp') || l.includes('Cứu được') ? '#ffd27a' : '#e8dfcc' });
    texts.slice(0, rows).forEach((l, i) => line(l, 86, y + i * 11.5));
    let ry = y - 9;
    // ít vũ khí thì thẻ cao hai dòng; nhiều thì thẻ thấp lại một dòng để món nào cũng có hình
    const avail = 208 - ry, nW = weps.length, pitch = G.clamp(Math.floor(avail / Math.max(1, nW)), 15, 26), maxCards = Math.max(1, Math.floor(avail / pitch));
    const cut = (str, wd, sz) => { const a = ui.wrap(str, wd, sz, true); return a.length > 1 ? a[0] + '…' : a[0]; };
    weps.slice(0, maxCards).forEach((l, i) => {
      if (i === maxCards - 1 && nW > maxCards) { ui.text('và ' + (nW - i) + ' vũ khí nữa (xem ở Bà Hàng Xén)', 246, ry + 10, { size: 7, color: '#ffd27a' }); ry += 14; return; }
      const rar = G.wRar(l.w), nm = G.wName(l.w), k = l.s.indexOf(nm), h = pitch - 2;
      TH.card(244, ry, 152, h, { rar });
      if (pitch >= 22) {
        TH.slot(247, ry + 2, 20, rar);
        G.art.weaponIcon(G.ux, l.w, 257, ry + 12, 16);
        ui.text((k > 0 ? l.s.slice(0, k).trim().replace(/:$/, '') : 'Nhận được') + ' · bậc ' + G.RARITY[rar].name, 271, ry + 9.5, { size: 6.5, color: '#a9c2b4' });
        ui.text(cut(nm, 118, 7.5), 271, ry + 19.5, { size: 7.5, bold: true, color: G.RARITY[rar].col });
      } else {
        G.art.weaponIcon(G.ux, l.w, 254, ry + h / 2, Math.min(12, h - 2));
        ui.text(cut(nm, 128, 7), 263, ry + h / 2 + 2.6, { size: 7, bold: true, color: G.RARITY[rar].col });
      }
      ry += pitch;
    });
    // chữ còn dư thì xuống cột phải, dưới các thẻ vũ khí
    texts.slice(rows).forEach((l, i) => { const cy = ry + 9 + i * 11.5; if (cy <= 208) line(l, 246, cy); });
    if (!R.win && !S.quit) ui.para('Mẹo: về làng mài vũ khí ở lò rèn, hoặc chơi lại ải cũ để lên cấp rồi quay lại.', 86, 196, 308, { size: 7.5, color: '#d9cdb8' });
    // Thắng thì có nút đi thẳng sang ải kế (hoặc vùng kế sau trùm vùng), không phải vòng về làng.
    const nx = R.win ? (S.i < 4 ? [S.r, S.i + 1] : S.r < G.REGIONS.length - 1 ? [S.r + 1, 0] : null) : null;
    if (nx) {
      if (ui.btn(80, 216, 96, 26, 'Về làng', { size: 8.5 })) { S = null; G.setScene(G.Village); return; }
      if (ui.btn(182, 216, 96, 26, 'Chơi lại', { size: 8.5 })) { G.startStage(S.r, S.i, S.diff); return; }
      if (ui.btn(284, 214, 116, 30, nx[1] === 0 ? 'Sang vùng mới ▶' : 'Ải tiếp theo ▶', { size: 9.5, color: '#a8452a' })) G.startStage(nx[0], nx[1], S.diff);
      return;
    }
    if (ui.btn(86, 216, 140, 26, 'Về làng')) { S = null; G.setScene(G.Village); return; }
    if (ui.btn(254, 216, 140, 26, R.win ? 'Chơi lại ải này' : 'Thử lại')) G.startStage(S.r, S.i, S.diff);
  }
})();
