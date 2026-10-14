// Một ải: bản đồ 8 phòng vuông (js/mapgen.js), cửa bốn phía và chuyển phòng, điều khiển, bảng thông tin trên màn hình và các bảng chọn trong ải.
(function () {
  const G = window.G, ui = G.ui;
  let S = null;
  G.getRun = () => S;

  // Đợt 2: bỏ G.giveWeapon, G.rollRarity, G.bossDrop (luật rơi vũ khí cũ). Thưởng thay thế: js/vk_moi.js (G.ROI_MOI).
  // Ảnh AI giao diện (phiên C2): gd-tt-<chay|doc|bang> (trạng thái em bé trên HUD), gd-sao, gd-sao-rong (màn kết quả), gd-bua-<hệ> (rương báu, thương nhân).
  // Chưa có tệp thì trả về null và mọi chỗ vẽ y như cũ.
  const gdAnh = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; };
  const TT_MA = { fire: 'chay', poison: 'doc', ice: 'bang' };
  // Các lớp thích nghi của trùm thành một dòng chữ (G.layerText của js/boss.js), theo ngôn ngữ đang dùng.
  const layerTexts = (ls, sep) => ls.map((l, i, all) => G.tv(G.layerText(l, i, all))).join(sep);
  // Tinh anh gục (combat.js gọi): tỉ lệ G.DROP.elite cho vàng + linh khí (G.ROI_MOI.vk, js/vk_moi.js) — không rơi vũ khí nữa.
  G.onEliteDown = function (e) {
    if (!S || !S.W || !G.vkMoi || G.rnd() >= G.DROP.elite) return;
    const q = G.vkMoi.thuongVk(S.r);
    S.got.push(q.s);
    S.W.banner = { s: G.t('Tinh anh rơi {0}', q.s), col: '#ffd23f', t: 3 };
    if (G.fx && G.fx.text) G.fx.text(e.x, e.y - 24, q.s, '#ffd23f', 8);
  };
  // Quái gục (combat.js gọi): tỉ lệ cũ rơi trang phục (quái thường 1,2%, tinh anh 12%) nay cho vàng (G.ROI_MOI.ao). Trùm tính ở settle.
  const ROI_AO = { mob: 0.012, elite: 0.12 };
  G.onMobDown = function (e) {
    if (!S || !S.W || !G.vkMoi || e.isBoss || e.add || e.illusion) return;
    if (G.rnd() >= (e.role === 'elite' ? ROI_AO.elite : ROI_AO.mob)) return;
    const q = G.vkMoi.thuongAo(S.r);
    S.got.push(q.s);
    if (G.fx && G.fx.text) G.fx.text(e.x, e.y - 24, q.s, '#ffd23f', 8);
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
    start: 'Kéo cần bên trái để đi. Bấm (hoặc giữ) nút Đánh để chém, bấm Né để lăn tránh.',
    fight1: 'Đánh vỡ chậu than để đốt quái. Kết liễu quái đang cháy thì kiếm nhận dấu ấn Lửa.',
    chest: 'Lại gần rương rồi bấm Đánh để mở. Bùa hệ phủ hệ đó lên vũ khí trong 60 giây.',
    fight2: 'Thanh xanh là mana. Đủ 25 mana thì bấm Đặc biệt để tung đòn mạnh.',
    elite: 'Quái tinh anh mang hệ. Chạm ô vũ khí ở góc trên bên phải để đổi sang cung.',
    fountain: 'Lại gần suối đỏ để hồi máu hoặc suối xanh để hồi mana rồi bấm Đánh, chỉ chọn được một. Từ ải sau, dòng chữ phía trên cho biết trùm đã học gì từ bạn.',
    // Phiên cân bằng (mục 8, V39): trùm ải hướng dẫn không học theo người chơi nữa, câu gợi ý nói đúng như vậy.
    boss: 'Trùm đầu tiên chưa học gì từ bạn. Từ ải sau, trùm kháng hệ bạn dùng nhiều nhất nhưng yếu hệ khắc chế: đổi vũ khí khác hệ để đánh mạnh hơn.',
    merchant: 'Thương nhân bán bình máu, bùa hệ và quặng. Lại gần rồi bấm Đánh để xem hàng.',
    challenge: 'Phòng thử thách: hạ hết quái trước khi hết giờ để nhận thưởng.',
    curse: 'Bàn thờ lời nguyền: chịu một bất lợi để dấu ấn tăng gấp đôi đến hết ải. Bỏ qua cũng được.',
    door: 'Hết quái rồi, cửa đã mở. Đi vào cửa có mũi tên để sang phòng kề. Bản đồ nhỏ ở góc phải cho biết phòng nào ở đâu.',
  };
  const DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  let runNo = 0;

  // o (không bắt buộc): { kind: 'A' | 'B' | 'C', seed } để dựng lại đúng một bản đồ khi kiểm tra.
  function uuTienTrum(r, phongTrum) {
    try {
      const SC = G.spriteCustom, R = G.REGIONS && G.REGIONS[r], ma = R && G.MOB_ART && G.MOB_ART.boss ? G.MOB_ART.boss[R.boss] : null;
      if (ma && SC && SC.uuTienTrum) SC.uuTienTrum(ma, !!phongTrum);
    } catch (e) { /* chỉ là tải ảnh: không được làm hỏng việc vào ải */ }
  }
  G.startStage = function (r, i, diff, o) {
    o = o || {};
    uuTienTrum(r); // phiên kiểm 3 pha trùm: ảnh trùm vùng (pha 1, 2, 3) chưa về thì tải trước ngay khi vào ải của vùng (js/sprite_custom.js)
    const tut = r === 0 && i === 0 && !diff && !G.save.tut.done;
    // Ải cuối vùng luôn là Kiểu C; ải dạy chơi dùng Kiểu A cho dễ theo; còn lại ngẫu nhiên, tránh kiểu vừa chơi.
    const kind = o.kind || (tut ? 'A' : G.mapgen.pickKind(i, G.save.lastKind, G.rnd));
    const seed = o.seed || 1 + Math.floor(G.rnd() * 999999);
    // Đợt 6: ẢI THEO NGÀY (js/ai_ngay.js) — một phòng đánh, nhiều đợt quái + 1 tinh anh cuối, không cửa, không trùm
    const an = o.aiNgay && G.aiNgay ? o.aiNgay : null;
    const map = an ? { kind: 'N', seed, rooms: [{ id: 0, x: 0, y: 0, type: 'fight', main: true, doors: {} }], start: 0, fountain: -1, boss: -1, gate: null, w: 1, h: 1 } : G.mapgen.make(kind, seed);
    // Ải hướng dẫn: phòng phụ ngẫu nhiên (Thử thách, Lời nguyền) đổi thành Thương nhân cho người mới dễ hiểu.
    if (tut) for (const R of map.rooms) if (R.type === 'challenge' || R.type === 'curse') R.type = 'merchant';
    if (!an) G.save.lastKind = kind;
    S = {
      r, i, diff: diff ? 1 : 0, base: G.stageStats(r, i, diff), P: G.buildPlayer(), map, rooms: map.rooms.map((x) => x.type), idx: -1,
      worlds: {}, cleared: {}, seen: {}, known: {}, visits: 0, uid: ++runNo, trans: null, doorCd: 0,
      stats: { el: { fire: 0, poison: 0, ice: 0, none: 0 }, ranged: 0, melee: 0, dodges: 0 },
      loot: { kills: 0, charm: false, bossDown: false, finalEl: null }, won: false, portal: null, got: [], curse: null, marksMult: 1, haste: 1,
      tut, mode: 'play', endT: 0, layers: null, usedPotion: false, marks: 0,
      fade: 0, W: null, near: null, sel: null, swapped: false, opts: null, result: null,
      power: G.power(), rec: G.stageRec(r, i, diff), // sức mạnh lúc vào ải và sức mạnh khuyên dùng (thanh trên, thưởng khi cày)
    };
    if (an) { S.aiNgay = an; S.base = G.stageStats(r, 4, 0); S.rec = G.stageRec(r, 4, 0); }
    if (S.tut) S.marksMult = 2;
    enterRoom(map.start, null);
    if (S.tut && S.W) S.W.waveT = 3.5; // phòng đầu ải hướng dẫn: quái ra sau 3,5 giây để người mới kịp đọc chỉ dẫn
    S.fade = 0.35;
    G.setScene(G.StageScene);
  };

  function bossSetup() {
    const reg = G.REGIONS[S.r];
    const big = S.i === 4;
    const first = S.r === 0 && !S.diff && big;
    // Phiên cân bằng (mục 8): mức kháng 0,5 → 0,3 (Mộc Tinh lần đầu 0,3 → 0,2); ải 1-1 (ải hướng dẫn) không có lớp thích nghi nào.
    const hoc = !(S.r === 0 && S.i === 0 && !S.diff);
    const layers = hoc ? G.computeLayers(S.stats, big ? (first ? 1 : 2) : 1, first ? 0.2 : 0.3) : [];
    const scar = G.save.scars[reg.boss];
    if (S.diff && big && scar && !layers.some((l) => l.type === 'resist' && l.el === scar)) layers.push({ type: 'resist', el: scar, pct: 0.3, scar: true });
    return { layers, kind: big ? reg.boss : 'mini', name: big ? reg.bossName : reg.mini };
  }

  // Sàn nhỏ (khoảng 40% diện tích cũ): mỗi đợt ít quái hơn, bù lại bằng nhiều đợt hơn.
  // Số đợt và hệ số điểm nằm ở G.ROOM_WAVES (data.js) để dễ cân chỉnh.
  function buildWaves(type) {
    const waves = [], B = G.ROOM_WAVES;
    const late = S.i >= 3;
    const count = type === 'start' ? (S.i >= 2 ? B.start[1] : B.start[0]) : type === 'challenge' ? B.challenge : late ? B.late : B.early;
    // Vùng đầu mở dần các vai; từ vùng hai trở đi có đủ tám vai (js/mobs.js).
    const roles = ['rusher', 'swarm', 'archer', 'kami'];
    if (S.i >= 1 || S.r > 0) roles.push('shield', 'spiky');
    if (S.i >= 2 || S.r > 0) roles.push('nimble', 'bomber');
    const cost = { rusher: 1, swarm: 1.3, archer: 1, shield: 1.5, nimble: 1.2, kami: 0.9, bomber: 1.2, spiky: 1.2 };
    for (let k = 0; k < count; k++) {
      let pts = (3 + Math.min(1.5, S.i * 0.4) + S.r * 0.5 + (S.diff ? 1 : 0)) * (late ? B.ptsLate : B.pts);
      const list = [];
      if (type === 'elite' && k === count - 1) { list.push('elite'); pts -= 2.5; }
      for (let guard = 0; guard < 30 && pts > 0.9 && list.length < B.maxPerWave; guard++) {
        const r = G.pick(roles);
        // sàn nhỏ: mỗi đợt chỉ một bầy nhỏ, để người chơi không bị sáu con vây cùng lúc
        // sàn nhỏ: mỗi đợt chỉ một bầy nhỏ và một con cảm tử
        if (cost[r] > pts + 0.3 || ((r === 'swarm' || r === 'kami' || r === 'bomber') && list.includes(r))) continue;
        list.push(r);
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
  // Kiểu xuất hiện của một đợt: lần lượt từng con, cả đợt cùng lúc, hoặc từng tốp ba con.
  // Chỗ sắp mọc có vòng đỏ báo trước; quái mọc lên thì đẩy em bé ra khỏi vòng.
  function spawnWave(list) {
    const W = S.W;
    const r = G.rnd();
    const mode = list.length <= 4 && r < 0.3 ? 'all' : r < 0.62 ? 'group' : 'one';
    W.spawnMode = mode;
    list.forEach((role, j) => {
      const q = freeSpot(role === 'archer' || role === 'bomber' ? 84 : 66, role === 'elite' ? 18 : 10);
      const t = mode === 'all' ? 0.95 : mode === 'group' ? 0.8 + Math.floor(j / 3) * 1.9 + (j % 3) * 0.08 : 0.8 + j * 0.6;
      W.spawns.push({ role, x: q[0], y: q[1], t, t0: Math.min(t, 1.0), big: role === 'elite' });
    });
    G.sfx('warn', 0.8);
  }
  function tickSpawns(dt) {
    const W = S.W;
    if (!W.spawns.length) return;
    const el = S.stats.el, tot = el.fire + el.poison + el.ice + el.none;
    const top = G.ELS.slice().sort((a, b) => el[b] - el[a])[0];
    // Cân bằng phải cày: phòng thường nhỏ mà quái mới to, nên trong phòng chỉ có tối đa G.ROOM_WAVES.maxAlive quái cùng lúc
    // (tinh anh tính là hai). Đủ số thì quái kế tiếp chờ (vòng đỏ vẫn hiện), có chỗ mới mọc: thành từng tốp nối nhau.
    const cap = W.geo && W.geo.big ? 99 : G.ROOM_WAVES.maxAlive;
    let alive = 0;
    for (const e of W.ents) if (!e.dead && !e.add) alive += e.role === 'elite' ? 2 : 1;
    for (const s of W.spawns) {
      s.t -= dt;
      if (s.t > 0) continue;
      if (alive >= cap) { s.t = 0.35 + G.rnd() * 0.3; continue; }
      alive += s.role === 'elite' ? 2 : 1;
      const e = G.spawnEnemy(s.role, s.x, s.y, s.opt || {});
      e.inside = true;
      if (s.opt && s.opt.sumBy) e.sum = s.opt.sumBy;
      e.cd = Math.max(e.cd, e.art ? 0.3 : 0.9); // vừa hiện ra thì chưa đánh ngay (quái mới còn diễn cử động xuất hiện)
      // em bé đứng ngay chỗ quái mọc: bị đẩy ra ngoài vòng
      const P = S.P, dx = P.x - s.x, dy = P.y - s.y, d = Math.hypot(dx, dy), R0 = s.big ? 22 : 16;
      if (d < R0) { const k = d > 0.5 ? 1 / d : 0; P.x = G.clamp(s.x + (k ? dx * k : 1) * R0, W.x0, W.x1); P.y = G.clamp(s.y + (k ? dy * k : 0) * R0, W.y0, W.y1); }
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
      banner: S.heldTip || null, // mẹo vũ khí bị hoãn ở phòng đầu ải hướng dẫn thì hiện ở phòng kế
    });
    S.heldTip = null;
    Object.assign(W, geo.bounds);
    W.geo = geo; W.room = id; W.uid = S.uid + ':' + id; W.variant = (S.map.seed + id * 7) % 3;
    W.type = type; W.cleared = false; W.waves = []; W.waveI = -1; W.waveT = 0.6; W.spawns = []; W.hadWaves = false;
    W.doors = M.DKEYS.filter((d) => R.doors[d] != null).map((d) => ({ dir: d, to: R.doors[d], gate: M.isGate(S.map, id, R.doors[d]), boss: S.map.rooms[R.doors[d]].type === 'boss', open: false }));
    W.props.push({ type: 'roomFore', x: 0, y: 9999 }); // lớp phủ trước của phòng, vẽ sau nhân vật
    S.W = W; S.challenge = null;
    const cx = geo.cx, cy = geo.cy;
    if (type === 'start' || type === 'fight' || type === 'elite' || type === 'challenge') {
      W.waves = buildWaves(type);
      if (S.aiNgay) { // ải ngày: G.AI_NGAY.dot đợt quái, đợt cuối thêm 1 tinh anh
        const n = (G.AI_NGAY && G.AI_NGAY.dot) || 5;
        W.waves = [];
        for (let k = 0; k < n; k++) W.waves.push(buildWaves(k === n - 1 ? 'elite' : 'fight').slice(-1)[0]);
        addEnv(2);
      } else if (S.tut && type === 'start') W.waves = [['rusher', 'rusher', 'rusher']];
      else if (S.tut && id === 1) {
        W.waves = [['swarm', 'swarm'], ['swarm', 'swarm', 'rusher']];
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
      W.banner = { s: bs.layers.length ? G.t('{0}: {1}', b.name, layerTexts(bs.layers, ' · ')) : G.t('{0} xuất hiện', b.name), col: '#ff6a5a', t: 4 };
      // Phiên cân bằng (mục 7): trùm chắn tên xa thì nói rõ cách đánh (đứng gần hơn 120 điểm ảnh mới đủ sức)
      if (bs.layers.some((l) => l.type === 'antiRanged')) { W.banner.s += ' — ' + G.t('bắn từ xa yếu đi, lại gần hơn'); W.banner.t = 5; }
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
    W.projs = []; W.zones = []; W.parts = []; W.texts = []; W.slashes = []; W.spawns = []; W.timers = []; W.banner = null; W.shake = 0;
    W.props = W.props.filter((p) => !p.dead);
  }
  // Vào phòng id. from: hướng vừa đi (ví dụ 'up' là đi qua cửa trên, sẽ hiện ra ở cửa dưới của phòng mới).
  function enterRoom(id, from) {
    const P = S.P, map = S.map;
    leaveRoom();
    S.idx = id;
    if (map.rooms[id] && map.rooms[id].type === 'boss') uuTienTrum(S.r, true); // lượt tải trước lúc vào ải chưa xong / hỏng: thử lại khi vào phòng trùm
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
    P.dashT = 0; P.dodgeT = 0; P.slideT = 0; P.spearOut = null; if (W.mvSp) W.mvSp.length = 0;
    if (W.type === 'fountain') S.preview = bossSetup().layers;
    S.hint = S.tut ? TUT[W.type === 'fight' ? (id === 1 ? 'fight1' : 'fight2') : W.type] || null : null;
    updateDoors();
  }
  function clearRoom() {
    const W = S.W, map = S.map, M = G.mapgen;
    const was = M.gateOpen(map, S.cleared);
    W.cleared = true;
    S.cleared[S.idx] = true;
    for (const e of W.ents) if (e.add && !e.dead) G.kill(e, {}); // quái phụ (bầy được gọi thêm) tan theo
    W.zones = W.zones.filter((z) => z.team === 'player' || !(z.t > 0) && !z.wall);
    G.sfx('pick', 0.8);
    S.P.hp = Math.min(S.P.maxhp, S.P.hp + S.P.maxhp * 0.08);
    if (S.challenge) {
      const ok = S.challenge.t > 0;
      if (ok) {
        // đợt 4: đá tôi bỏ hẳn — nửa phần thưởng trước là 1 đá tôi nay cũng là quặng (G.DA_TOI_QUANG)
        { const q = G.rnd() < 0.5 ? G.DA_TOI_QUANG || 6 : 6; G.save.ore += q; S.got.push(G.t('{0} quặng', q)); }
        G.save.gold += 80;
        W.banner = { s: G.t('Vượt thử thách! Nhận {0} và 80 vàng', S.got[S.got.length - 1]), col: '#ffd23f', t: 3 };
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
      } else if (!W.banner) W.banner = { s: keys ? G.t('Nhặt được mảnh chìa {0}/3', n) : G.t('Đã dọn {0}/3 phòng quái', n), col: '#ffd27a', t: 2.5 };
    }
    updateDoors();
  }
  // Đồ rơi sau khi thắng: đi ngang qua là nhặt, hiện chữ phần thưởng bay lên (thưởng đã được cộng lúc thắng).
  function pickLoot(W, P) {
    if (G.doRoi) { G.doRoi.hut(W, P, 1 / 60); return; } // hút về khi lại gần (js/do_roi.js)
    for (const pr of W.props) {
      if (pr.type !== 'loot' || pr.got || G.time < pr.born + 0.5) continue;
      if (Math.hypot(pr.x - P.x, (pr.y - P.y) * 1.3) < 14 + (P.pickR || 0)) { pr.got = G.time; G.sfx('pick', 1.2); } // trang phục tăng tầm nhặt
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
    // lựa chọn "vũ khí mới" của luật cũ nay là túi linh khí cùng giá trị (G.ROI_MOI.ruong)
    const lkN = G.ROI_MOI.ruong.lk[G.clamp(S.r | 0, 0, 2)];
    return [
      { kind: 'lk', n: lkN, label: G.t('{0} linh khí', lkN), sub: 'Dùng để nâng vũ khí (Mầm, Thành hình, Thức tỉnh) và nâng bộ trang phục' },
      { kind: 'ore', n: 5 + S.r * 3, label: G.t('{0} quặng', 5 + S.r * 3), sub: 'Dùng để mài vũ khí ở lò rèn' },
      { kind: 'charm', el: S.tut ? 'fire' : G.pick(G.ELS), label: '', sub: 'Phủ hệ lên cả hai vũ khí trong 60 giây' },
    ].map((o) => { if (o.kind === 'charm') o.label = G.t('Bùa {0}', G.EL[o.el].name); return o; });
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
    } else if (pr.act === 'merchant') S.mode = 'merchant';
    else if (pr.act === 'altar' && !pr.used) { S.mode = 'curse'; S.prop = pr; }
    else if (pr.act === 'portal') G.usePortal();
  }

  // Dòng tổng kết: chữ theo ngôn ngữ đang dùng (G.t). Việc nhận loại dòng (vàng, quặng, lên cấp…) vẫn xét trên bản tiếng Việt,
  // nên khi không ở tiếng Việt thì nhớ bản tiếng Việt của dòng ở R.vi (viOf đọc lại). Tiếng Việt: y như ghép chuỗi trước đây.
  function ln(R, tpl) {
    const a = Array.prototype.slice.call(arguments, 2), s = G.t.apply(null, [tpl].concat(a));
    if (G.LANG !== 'vi') (R.vi || (R.vi = {}))[s] = String(tpl).replace(/\{(\d)\}/g, (m, i) => (a[+i] === undefined ? m : a[+i]));
    return s;
  }
  const viOf = (R, l) => (R && R.vi && typeof l === 'string' && R.vi[l]) || l;
  // Tính và lưu phần thưởng (gọi đúng một lần mỗi lượt chơi). Thắng thì gọi ngay lúc hạ trùm, trước khi người chơi vào cổng.
  function settle(win) {
    const sv = G.save, reg = G.REGIONS[S.r], W = S.W;
    S.marks += W.marksGained; W.marksGained = 0;
    if (W.usedPotion) S.usedPotion = true;
    if (S.aiNgay && G.aiNgay) { // đợt 6: ải ngày tự tính thưởng (js/ai_ngay.js), không sao, không trùm
      const R = { win, lines: [], stars: 0, up: 0, aiNgay: true };
      G.aiNgay.thuong(S, R, win, function () { return ln.apply(null, [R].concat(Array.prototype.slice.call(arguments))); });
      if (R.up) R.lines.push(ln(R, '{0} lên cấp {1}!', G.HEROES[sv.hero].name, sv.heroes[sv.hero].lvl));
      for (const g of S.got) R.lines.push(g.w ? { s: G.t('Trong ải: {0}', g.s), w: g.w } : ln(R, 'Trong ải: {0}', g));
      S.result = R; S.gotN = S.got.length; S.marksAt = S.marks;
      if (win) G.sfx('win');
      G.persist();
      return;
    }
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
      // Cân bằng phải cày: chơi lại ải đã qua vẫn được đủ thưởng, trừ khi em bé đã mạnh vượt xa ải (G.grindMult): kinh nghiệm
      // và vàng giảm dần (thấp nhất 40%), nguyên liệu vùng và quặng thì vẫn đủ.
      const gm = G.grindMult(S.power, S.rec);
      const xp = Math.round(S.base.xp * gm);
      let gold = Math.round((S.base.gold + S.loot.kills * 2) * gm);
      const ore = 3 + R.stars + 2 * S.r, mat = 5 + S.i; // cày nâng cấp: vùng sau cho nhiều quặng hơn (mài cao tốn quặng)
      sv.gold += gold; sv.ore += ore; sv.mats[S.r] += mat;
      // kho đổi vàng lấy nguyên liệu (G.DOI_NL, js/upgrade.js): mỗi ải thắng thêm vài lượt đổi
      if (G.DOI_NL) sv.doiNL = Math.min(G.DOI_NL.max, (sv.doiNL | 0) + G.DOI_NL.them);
      R.lines.push(ln(R, '+{0} kinh nghiệm', xp), ln(R, '+{0} vàng', gold), ln(R, '+{0} quặng', ore), ln(R, '+{0} {1}', mat, reg.mat.toLowerCase()));
      if (gm < 1) R.lines.push(ln(R, 'Ải đã quá dễ với sức mạnh của bé: kinh nghiệm và vàng còn {0}%', Math.round(gm * 100)));
      if (big) { const ns = S.diff ? 4 : 3; sv.shards[S.r] += ns; R.lines.push(ln(R, '+{0} mảnh {1}', ns, reg.bossName)); }
      // đợt 6: đá nâng bậc từ trùm nhỏ / trùm vùng (lần đầu qua ải này nhiều hơn), bùa giữ bậc (trùm vùng) — js/ep_do.js
      if (G.epDo) for (const q of G.epDo.thuongTrum(sv, S.r, big, !prev, S.diff)) R.lines.push(ln(R, q[0], q[1]));
      // đợt 4: đá tôi bỏ hẳn (Tôi lại, nâng bậc đã bỏ) — thay bằng quặng (G.DA_TOI_QUANG)
      if ((R.stars === 3 && prev < 3) || (!big && G.rnd() < 0.15)) { const q = G.DA_TOI_QUANG || 6; sv.ore += q; R.lines.push(ln(R, '+{0} quặng', q)); }
      // Không rơi vũ khí / trang phục (đợt 1, js/vk_moi.js): trùm vùng và ải thường (G.DROP.stage) cho vàng + linh khí cùng giá trị.
      if (G.vkMoi) {
        const q = big ? G.vkMoi.thuongTrum(S.r) : G.rnd() < G.DROP.stage ? G.vkMoi.thuongVk(S.r) : null;
        if (q) R.lines.push(big ? ln(R, '{0} để lại {1}', reg.bossName, q.s) : ln(R, 'Nhặt được {0}', q.s));
        // bùa cũ của tinh anh (25%), trang phục của trùm nhỏ / trùm vùng: đổi ra vàng
        const qa = G.vkMoi.thuongAoTrum(S.r, big, !!S.loot.charm);
        if (qa) R.lines.push(ln(R, 'Nhặt được {0}', qa.s));
      }
      // ZED (js/data.js G.ZED_DAY): bạn được cứu không thành em bé chơi được nữa mà DẠY Zed nét riêng của mình, đúng 1 lần (save.zed.hoc).
      const zedDay = big && !S.diff && reg.rescue && G.ZED_DAY[reg.rescue] && !G.zedHoc(reg.rescue, sv);
      if (zedDay) {
        if (!sv.zed || typeof sv.zed !== 'object' || Array.isArray(sv.zed)) sv.zed = { v: 1, hoc: {} };
        if (!sv.zed.hoc || typeof sv.zed.hoc !== 'object') sv.zed.hoc = {};
        sv.zed.v = 1; sv.zed.hoc[reg.rescue] = 1;
        const D = G.ZED_DAY[reg.rescue], ten = G.HEROES[reg.rescue].name;
        // bảng kết quả hẹp: 3 dòng ngắn; đủ chữ ở dòng báo giữa trận, ở làng (Ông Từ) và Hành trang
        R.lines.push(ln(R, 'Cứu được {0}! Bạn ấy dạy Cu Tí:', ten), ln(R, '· {0}', G.tv(D.ngan[0])), ln(R, '· {0}', G.tv(D.ngan[1])));
        if (S.W) S.W.banner = { s: G.t('{0} dạy Cu Tí: {1}', ten, G.tv(D.noiTai)), col: '#ffd23f', t: 4 }; // dòng báo giữa trận (đè dòng báo rơi đồ)
      }
      // TRANG PHỤC ZED (js/data.js G.ZED_BO): hạ trùm vùng của bộ (mọi độ khó) thì mở bộ đó, báo một dòng; làng nhắc chỗ đổi (save.zed.boBao)
      if (G.ZED_BO && big) {
        for (const bk of G.ZED_BO_KEYS) {
          if (bk === 'ninja' || G.zedBoVung(bk) !== S.r || G.zedBoMo(bk, sv)) continue;
          if (!sv.zed || typeof sv.zed !== 'object' || Array.isArray(sv.zed)) sv.zed = { v: 1, hoc: {} };
          if (!sv.zed.boMo || typeof sv.zed.boMo !== 'object' || Array.isArray(sv.zed.boMo)) sv.zed.boMo = {};
          sv.zed.boMo[bk] = 1; sv.zed.boBao = 1;
          R.lines.push(ln(R, 'Cu Tí mở được trang phục mới: {0}!', G.tv(G.ZED_BO[bk].ten)));
        }
      }
      // bạn được cứu về làng (NPC ngồi ở sân đình, js/village_scene.js); dòng báo "dạy Zed" ở trên
      if (big && !S.diff && sv.heroes[reg.rescue]) sv.heroes[reg.rescue].unlocked = true;
      if (big && S.loot.finalEl) sv.scars[reg.boss] = S.loot.finalEl;
      if (S.tut) sv.tut.done = true;
      R.up = G.addXp(sv.hero, xp);
      G.sfx('win');
    } else {
      const gm = G.grindMult(S.power, S.rec);
      const xp = Math.round(S.base.xp * 0.4 * (Math.max(0, S.visits - 1) / S.rooms.length) * gm);
      const gold = Math.round(S.loot.kills * 2 * gm);
      sv.gold += gold;
      R.lines.push(ln(R, '+{0} kinh nghiệm', xp), ln(R, '+{0} vàng', gold));
      // Phiên cân bằng (mục 17): đã vào tới phòng trùm mà thua thì vẫn nhận 30% nguyên liệu vùng và quặng của ải (bỏ ải thì không).
      if (!S.quit && S.W && S.W.type === 'boss') {
        const mat = Math.round((5 + S.i) * 0.3), ore = Math.round((4 + 2 * S.r) * 0.3);
        sv.mats[S.r] += mat; sv.ore += ore;
        R.lines.push(ln(R, '+{0} {1}', mat, reg.mat.toLowerCase()), ln(R, '+{0} quặng', ore));
      }
      R.up = G.addXp(sv.hero, xp);
      // Thua không làm bé mạnh thêm (chủ dự án: sức mạnh chỉ đến từ cày nâng cấp). Thay vào đó bảng thua gợi ý nên cày gì (G.upgradeTips).
      if (!S.quit && G.upgradeTips) R.tips = G.upgradeTips(S.r, S.i, S.diff);
    }
    if (S.marks > 0 && !G.lk) R.lines.push(ln(R, 'Vũ khí nhận {0} dấu ấn', Math.round(S.marks))); // có js/linhkhi.js thì ghi từng vũ khí, từng hệ ở khối riêng
    if (R.up) R.lines.push(ln(R, '{0} lên cấp {1}!', G.HEROES[sv.hero].name, sv.heroes[sv.hero].lvl));
    for (const g of S.got) R.lines.push(g.w ? { s: G.t('Trong ải: {0}', g.s), w: g.w } : ln(R, 'Trong ải: {0}', g));
    if (G.onStageEnd) G.onStageEnd(S, R); // bảng vàng (js/bang_vang.js): ghi kỷ lục, thêm dòng báo kỷ lục mới
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
      if (more > 0 && !G.lk) R.lines.push(ln(R, 'Sau trận trùm: vũ khí nhận thêm {0} dấu ấn', more));
      for (const g of S.got.slice(S.gotN || 0)) R.lines.push(g.w ? { s: G.t('Trong ải: {0}', g.s), w: g.w } : ln(R, 'Trong ải: {0}', g));
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
      if (typeof l !== 'string') continue;
      const v = viOf(S.result, l); // nhận loại theo bản tiếng Việt của dòng
      if (v.indexOf('Trong ải') === 0) continue;
      const k = /vàng/.test(v) ? 'gold' : /quặng/.test(v) ? 'ore' : /đá tôi|đá nâng bậc|bùa giữ bậc/.test(v) ? 'stone' : /mảnh/.test(v) ? 'shard' + S.r : /kinh nghiệm/.test(v) ? 'xp' : /^\+\d+ /.test(v) ? 'mat' + S.r : null;
      if (k) items.push({ kind: k, s: l });
    }
    items.forEach((it, i) => {
      const a = (i / Math.max(1, items.length)) * Math.PI * 2 + 0.4, rr = 18 + (i % 2) * 8;
      let x = G.clamp(bx + Math.cos(a) * rr, W.x0 + 8, W.x1 - 8), y = G.clamp(by + Math.sin(a) * rr * 0.7, W.y0 + 6, W.y1 - 4);
      if (Math.hypot(x - px, (y - py) * 1.3) < 30) x = G.clamp(x + (x < px ? -26 : 26), W.x0 + 8, W.x1 - 8); // không nằm đè lên cổng
      W.props.push(Object.assign({ type: 'loot', x, y, born: G.time + i * 0.08, sx: bx, sy: by - 10 }, it));
    });
    W.banner = { s: 'Thắng rồi! Nhặt đồ rơi, đi dạo tùy ý, xong thì vào cổng dịch chuyển', col: '#ffd23f', t: 5 };
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
  // Đợt 2: phòng thường nay cũng rộng như phòng trùm (geo.rong), nên dùng chung bố cục nút này.
  const bigRoom = () => !!(S && S.W && S.W.geo && S.W.geo.rong);
  function btnPos(name) { const b = (bigRoom() && G.cx < 20 ? BTN_BIG : BTN0)[name]; return [b[0] + G.cx, b[1] + G.cy, b[2]]; }
  // Cần điều khiển lúc chưa chạm: phòng trùm thì lùi sát mép trái để không đè tường.
  function stickPos() { return [(bigRoom() && G.cx < 30 ? 42 : 62) - G.cx * 0.6, 216 + G.cy, 24]; }
  const BTN = BTN0;
  // Ô bình máu và nút tạm dừng: [x, y, rộng, cao]. Vùng chạm rộng hơn hình vẽ 4 đơn vị mỗi phía.
  const POT = [4, 26, 54, 24], PAU = [G.CHU_RO !== false ? 70 : 62, 26, 30, 24]; // 12/10 (cờ G.CHU_RO): nút Dừng dời phải 8 để không che chữ "Bình máu"; vùng chạm hai nút không chồng nhau // cao 24 (+ vùng chạm nới 4) để vừa ngón tay trên điện thoại
  const hitBox = (d, b) => G.inRect(d, b[0] - 4, b[1] - 4, b[2] + 8, G.CHAM44 && G.theme.chamMin ? Math.max(b[3] + 9, G.theme.chamMin()) : b[3] + 9); // Rà soát C: cao đủ 44 pt cả khi khung nhỏ (iPhone SE, có tai thỏ) // vùng chạm cao 33 (khoảng 44 điểm trên điện thoại)
  function setMode(m) { S.mode = m; S.sel = null; }
  G.stageUi = { btnPos, stickPos, POT, PAU }; // để bài kiểm tra biết nút nằm ở đâu
  function readInput() {
    const k = G.keys, kp = G.keyP;
    const inp = {
      mx: (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0),
      my: (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0),
      atk: !!(k.KeyJ || k.KeyZ || k.Space), atkP: !!(kp.KeyJ || kp.KeyZ || kp.Space),
      dodgeP: !!(kp.KeyK || kp.KeyX || kp.ShiftLeft), specialP: !!(kp.KeyL || kp.KeyC), skillP: !!(kp.KeyI || kp.KeyV), skill: !!(k.KeyI || k.KeyV),
      swapP: !!(kp.KeyQ || kp.Tab), potionP: !!(kp.KeyE || kp.KeyH), pauseP: !!(kp.Escape || kp.KeyP), mapP: !!kp.KeyM,
    };
    const mm = G.minimap.rect(S);
    for (const d of G.downs) {
      if (G.inRect(d, 368, 0, 112, 38)) { inp.swapP = true; d.role = 'ui'; continue; }
      // 12/10 (cờ G.CHU_RO): nút "Bản đồ" thu nhỏ ở phòng trùm có vùng chạm cao 31 (≈ 44 pt), nới xuống dưới (phía trên là dải linh khí)
      const m44 = G.CHAM44 && G.theme.chamMin ? G.theme.chamMin() : 31, mmH = G.CHU_RO !== false && mm[3] < m44 ? m44 : mm[3] + 3, mmY = G.CHU_RO !== false && mm[3] < m44 ? mm[1] - 4 : mm[1];
      if (G.inRect(d, mm[0] - 2, mmY, mm[2] + 4, mmH)) { inp.mapP = true; d.role = 'ui'; continue; }
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
      if (p.role === 'skill') inp.skill = true; // giữ nút Chưởng (Tích lực của Hỏa chưởng)
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
        // Hành trang mở từ bảng Tạm dừng (js/hanh_trang.js): Esc đóng chi tiết vũ khí rồi quay về Tạm dừng
        if (S.mode === 'bag') { if (kp.Escape) { setMode('paused'); G.sfx('ui'); } return; }
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
      if (DOC()) msgTick(W, dt); // Đợt 8: dải thông báo (dòng đã bị dòng mới đẩy lên thì tự đếm giờ ở đây)
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
      // trùm chết hoành tráng (cử động chết dài vài giây) rồi mới mọc cổng dịch chuyển
      if (W.type === 'boss' && S.loot.bossDown && !S.won) { S.endT += dt; if (S.endT > (W.bossDieT || 1.2)) winPortal(); return; }
      if (S.aiNgay && W.cleared && !S.won && W.over !== 'dead') { S.endT += dt; if (S.endT > 1.2) { S.won = true; finish(true); } return; } // ải ngày: dọn hết đợt là thắng
      if (W.over === 'dead' && !S.won) { S.endT += dt; if (S.endT > 1.2) finish(false); return; }
      // Mẹo bình máu: lần đầu máu xuống dưới 40% mà còn bình thì nhắc một lần (lưu ở G.save.tut.potion)
      const sv = G.save;
      if (sv.tut && !sv.tut.potion && !G.noRender && !W.banner && P.potions > 0 && !W.noPotion && !P.dead && P.hp < P.maxhp * 0.4) {
        sv.tut.potion = 1;
        W.banner = { s: 'Máu thấp! Chạm ô Bình máu (góc trên bên trái) để hồi 30% máu.', col: '#ffb0a0', t: 5, tip: true, urgent: true };
      }
      pickLoot(W, P); // đồ rơi trên sàn (sau trùm, tinh anh, quái): đi lại gần là nhặt
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
      if (DOC()) {
        // Đợt 8 — thứ bậc hình ảnh: G.drawWorld gọi lại G.docTran.duoi() (chữ phụ, thông báo) NGAY TRƯỚC số sát thương và G.docTran.tren()
        // (thanh máu quái / trùm) NGAY SAU số, rồi mới vẽ vùng báo đòn. Phần nào chưa được gọi (đang chuyển phòng...) thì vẽ bù ở đây.
        S.docN = (S.docN || 0) + 1;
        veTran = true;
        try { G.drawWorld(S.r); } finally { veTran = false; }
        if (S.trans) slideWorld();
        if (S.docTren !== S.docN) drawHud('tren');
        if (S.docDuoi !== S.docN) drawHud('duoi');
        drawHud('vien');
      } else {
        G.drawWorld(S.r);
        if (S.trans) slideWorld();
        drawHud();
      }
      if (S.mode === 'map') { G.minimap.drawBig(S); if (G.click) { G.click = null; setMode('play'); G.sfx('ui'); } }
      else if (S.mode === 'chest') panelChest();
      else if (S.mode === 'merchant') panelMerchant();
      else if (S.mode === 'curse') panelCurse();
      else if (S.mode === 'paused') panelPause();
      else if (S.mode === 'bag') { ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.6)'); if (G.hanhTrang) G.hanhTrang.panel(true, () => setMode('paused')); else setMode('paused'); }
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
    c.setTransform(1, 0, 0, 1, 0, 0); // dán lại chính canvas: theo điểm ảnh thật (gấp G.NET)
    if (ox || oy) {
      c.globalCompositeOperation = 'copy';
      c.drawImage(c.canvas, ox * G.NET, oy * G.NET);
      c.globalCompositeOperation = 'source-over';
    }
    G.wxDat(c, 0, 0);
    c.fillStyle = 'rgba(0,0,0,' + Math.min(1, k * 1.1).toFixed(3) + ')';
    c.fillRect(0, 0, G.W, G.H);
  }

  function markInfo(w) {
    if (G.vkMoi) return G.vkMoi.markInfo(w); // cấp + hệ + linh khí cần để lên cấp kế (dưới đây: dự phòng khi thiếu js/vk_moi.js)
    if (!w.branch) {
      const top = G.ELS.slice().sort((a, b) => w.marks[b] - w.marks[a])[0];
      return { frac: w.marks[top] / G.MARKS[0], col: w.marks[top] > 0 ? G.EL[top].col : '#666', txt: w.marks[top] > 0 ? G.t('{0} {1}/{2}', G.EL[top].name, Math.floor(w.marks[top]), G.MARKS[0]) : 'Chưa có dấu ấn' };
    }
    const st = G.wStage(w), m = w.marks[w.branch];
    const cap = G.RARITY[G.wRar(w)].maxStage;
    if (st >= cap) return { frac: 1, col: G.EL[w.branch].col, txt: cap < 3 ? G.t('{0} · {1} (tối đa bậc {2})', G.EL[w.branch].name, G.STAGE_NAMES[st], G.RARITY[G.wRar(w)].name) : G.t('{0} · {1} (tối đa)', G.EL[w.branch].name, G.STAGE_NAMES[st]) };
    return { frac: (m - (st ? G.MARKS[st - 1] : 0)) / (G.MARKS[st] - (st ? G.MARKS[st - 1] : 0)), col: G.EL[w.branch].col, txt: G.t('{0} · {1} {2}/{3}', G.EL[w.branch].name, G.STAGE_NAMES[st], Math.floor(m), G.MARKS[st]) };
  }
  G.markInfo = markInfo;
  // Gọi khi nhặt linh khí (js/combat.js): hẹn lúc viên linh khí bay tới ô vũ khí thì ô loé sáng.
  G.flashMarks = function () { if (S) S.markFlashAt = (G.time || 0) + 0.45; };

  // Thanh máu nhỏ trên đầu quái: chỉ hiện ít giây sau khi quái trúng đòn (tinh anh: hiện suốt khi đã mất máu), có phần tụt dần.
  // Thanh mảnh (2 điểm ảnh) nằm trên đầu, không đè vùng báo nguy hiểm dưới sàn. Cường độ theo G.VFX.giaoDien.
  const MOBHP = new WeakMap();
  function mobBars(W) {
    const gd = G.VFX ? +G.VFX.giaoDien : 1;
    if (!(gd > 0) || !G.theme || !G.theme.lagOf) return;
    const c = G.ux, ga = c.globalAlpha, now = G.time || 0, cam = W.cam || 0;
    for (const e of W.ents) {
      if (!e || e.dead || !(e.maxhp > 0)) continue;
      let m = MOBHP.get(e);
      if (!m) { m = { hp: e.hp, at: -9 }; MOBHP.set(e, m); }
      if (e.hp < m.hp - 1e-6) m.at = now;
      m.hp = e.hp;
      const frac = G.clamp(e.hp / e.maxhp, 0, 1), st = G.theme.lagOf(e, frac); // gọi mỗi khung để phần tụt dần luôn theo kịp
      const he = G.lk && G.lk.vienHe ? G.lk.vienHe(e) : null; // Đợt 8b (cờ G.DAU_LINH_KHI_VIEN, js/linhkhi.js): hệ của dấu Linh Khí quái đang mang → viền thanh máu; null = vẽ y như cũ
      if (he) m.at = Math.max(m.at, now - 1.9); // đang mang dấu thì thanh máu hiện suốt (thay ô dấu cũ); hết dấu thì mờ dần trong nửa giây như sau một đòn
      const elite = e.role === 'elite', age = now - m.at;
      if (!(age < 2.4 || (elite && e.hp < e.maxhp))) continue;
      const a = elite && e.hp < e.maxhp ? 1 : age < 1.9 ? 1 : 1 - (age - 1.9) / 0.5;
      if (a <= 0) continue;
      const bw = elite ? 26 : 16, x = Math.round(e.x - cam - bw / 2), y = Math.round(e.y - (e.h || 24) * (e.art ? 1 : e.scale || 1) - 4); // giữa đỉnh đầu và biểu tượng hệ (js/linhkhi.js)
      c.globalAlpha = ga * a * Math.min(1, gd);
      if (he) { c.fillStyle = G.lk.VIEN[he]; c.fillRect(x - 1, y - 1, bw + 2, 4); c.fillStyle = '#0e0808'; c.fillRect(x, y, bw, 2); } // viền 1 điểm ảnh màu hệ, lòng thanh vẫn tối
      else { c.fillStyle = 'rgba(14,8,8,0.85)'; c.fillRect(x - 1, y - 1, bw + 2, 4); }
      const fw = Math.round(bw * st.shown), lw = Math.round(bw * st.lag);
      if (lw > fw) { c.fillStyle = st.hit > 0 ? '#fff6e0' : '#ffd98a'; c.fillRect(x + fw, y, lw - fw, 2); }
      c.fillStyle = elite ? '#ff8a3a' : '#e8483a'; c.fillRect(x, y, fw, 2);
      c.fillStyle = elite ? '#ffc890' : '#ff9a8a'; c.fillRect(x, y, fw, 1);
    }
    c.globalAlpha = ga;
  }
  // ---------- Đợt 8: độ đọc trận đấu ----------
  // Cờ tắt G.DO_DOC_TRAN (js/ui_theme.js). Bảng thứ bậc hình ảnh và các hằng số: G.theme.DOC.
  const DOC = () => G.DO_DOC_TRAN === true && !!(G.theme && G.theme.DOC);
  let veTran = false; // đang ở trong G.drawWorld của cảnh ải (để hai hàm gọi lại dưới đây không chạy nhầm ở cảnh khác)
  const MSG = { khung: { dong: 0, hop: null } };
  // DẢI THÔNG BÁO CHIẾN ĐẤU: một dải trên mặt tường sau, ngay dưới khối trên cùng (thanh máu trùm / tinh anh), giữa nút tạm dừng và ô vũ khí
  // (x 126–364). Tối đa G.theme.DOC.dongToiDa (2) DÒNG cùng lúc; dòng mới đẩy dòng cũ lên, quá 2 thì dòng cũ nhất mất. Không bao giờ vẽ
  // xuống giữa sàn. Nguồn: mọi chỗ trong game đặt W.banner (không phải mẹo .tip) và G.docTran.bao(...) ("Sạch bóng quái!" của js/fx.js).
  function msgDong(W) {
    if (S.msgW !== W) { S.msgW = W; S.msgs = []; S.msgB = null; }
    const b = W.banner;
    if (b && !b.tip) { if (b !== S.msgB) msgThem({ b, s: b.s, col: b.col }); S.msgB = b; } else if (!b) S.msgB = null;
  }
  function msgThem(e) {
    const L = S.msgs, last = L[L.length - 1];
    e.at = G.time;
    if (last && last.s === e.s && last.b.t > 0) { e.at = last.at; e.y = last.y; L[L.length - 1] = e; } // cùng một câu báo lại: làm mới, không thêm dòng
    else L.push(e);
    while (L.length > G.theme.DOC.dongToiDa) L.shift();
  }
  function msgTick(W, dt) {
    msgDong(W);
    for (const e of S.msgs) if (e.b !== W.banner) e.b.t -= dt;
    if (S.msgs.some((e) => !(e.b.t > 0))) S.msgs = S.msgs.filter((e) => e.b.t > 0);
  }
  // Vẽ dải thông báo từ y = by. Trả về y ngay dưới dải (để khối khác xếp tiếp bên dưới).
  function veThongBao(W, by) {
    const D = G.theme.DOC, T = G.theme, c = G.ux, X0 = 126, X1 = 364, mid = (X0 + X1) / 2, maxW = X1 - X0 - 14; // từ 126: né thanh máu, thanh mana của em bé (tới x = 124)
    msgDong(W);
    MSG.khung = { dong: 0, hop: null };
    const list = S.msgs.filter((e) => e.b.t > 0);
    if (!list.length) return by;
    // Khối trên cùng đã cao (trùm có thẻ kháng/yếu và đang "LỘ ĐIỂM YẾU!") thì chỉ còn chỗ cho 1 dòng: dải không được xuống quá mép trên sàn 20 điểm ảnh.
    let con = by + D.dongToiDa * 12 + 4 <= W.geo.fy0 + 20 ? D.dongToiDa : 1;
    const rows = [];
    for (let i = list.length - 1; i >= 0 && con > 0; i--) { // dòng mới nhất được chỗ trước
      const e = list[i], str = G.tv ? G.tv(e.s) : e.s;
      let size = 7.5, lines = null;
      for (const sz of [9.5, 8.5, 7.5]) { ui.font(sz, true); if (c.measureText(str).width <= maxW) { size = sz; lines = [str]; break; } }
      if (!lines) lines = ui.wrap(str, maxW, 7.5, true);
      if (lines.length > con) {
        if (rows.length) break; // dòng cũ không còn đủ chỗ: nhường hẳn cho dòng mới
        lines = lines.slice(0, con);
        ui.font(7.5, true);
        let l = lines[con - 1];
        while (l.length > 4 && c.measureText(l + '…').width > maxW) l = l.slice(0, -1);
        lines[con - 1] = l + '…';
      }
      con -= lines.length;
      rows.unshift({ e, size, lines });
    }
    const ga = c.globalAlpha, gd = G.VFX ? +G.VFX.giaoDien : 1;
    let y = by, hop = null, dong = 0;
    for (const r of rows) {
      const e = r.e, lh = r.size + 2.5, bh = Math.round(r.lines.length * lh + 4);
      let tw = 0;
      ui.font(r.size, true);
      for (const l of r.lines) tw = Math.max(tw, c.measureText(l).width);
      const pw = Math.min(X1 - X0, Math.ceil(tw) + 14), px = Math.round(mid - pw / 2);
      // dòng mới trượt vào từ trên một nhịp; dòng cũ bị đẩy thì trôi mượt về chỗ mới; sắp hết giờ thì mờ dần
      if (e.y == null || !(gd > 0)) e.y = gd > 0 ? y - 4 : y;
      else e.y += (y - e.y) * 0.35;
      if (Math.abs(e.y - y) < 0.4) e.y = y;
      const age = G.time - e.at, py = Math.round(e.y);
      c.globalAlpha = ga * (gd > 0 ? Math.min(1, age < 0.12 ? 0.35 + (age / 0.12) * 0.65 : 1, e.b.t < 0.3 ? Math.max(0, e.b.t / 0.3) : 1) : 1);
      T.plate(px, py, pw, bh, { a: D.nen });
      r.lines.forEach((l, i) => ui.text(l, mid, py + r.size + 1 + i * lh, { size: r.size, align: 'center', bold: true, color: e.col || '#ffd27a' }));
      hop = hop ? [Math.min(hop[0], px), Math.min(hop[1], py), Math.max(hop[2], px + pw), Math.max(hop[3], py + bh)] : [px, py, px + pw, py + bh];
      dong += r.lines.length;
      y += bh + 1;
    }
    c.globalAlpha = ga;
    MSG.khung = { dong, hop };
    return y + 1;
  }
  // Tấm nền tối (70%) sau một dòng chữ căn giữa phải đọc trong trận (đếm giờ thử thách, "Bấm Đánh", cửa còn khoá...).
  function nenChu(lines, cx, y, size, lh) {
    let tw = 0;
    ui.font(size, true);
    for (const l of lines) tw = Math.max(tw, G.ux.measureText(G.tv ? G.tv(l) : l).width);
    G.theme.plate(Math.round(cx - tw / 2) - 5, Math.round(y - size - 1.5), Math.ceil(tw) + 10, Math.round(size + 5 + (lines.length - 1) * (lh || 9)), { a: G.theme.DOC.nen });
  }
  G.docTran = {
    duoi() { if (veTran && S && S.W) { S.docDuoi = S.docN; drawHud('duoi'); } },
    tren() { if (veTran && S && S.W) { S.docTren = S.docN; drawHud('tren'); } },
    // Thêm một dòng vào dải thông báo (không qua W.banner). t: số giây hiện.
    bao(s, col, t) { if (S && S.W) { msgDong(S.W); msgThem({ b: { s, col, t: t || 2 }, s, col }); } },
    khung: () => MSG.khung, // cho bài kiểm tra: { dong: số dòng vừa vẽ, hop: [x0, y0, x1, y1] }
  };

  // part (Đợt 8, chỉ khi cờ G.DO_DOC_TRAN bật): vẽ riêng một lớp của bảng thứ bậc — 'duoi' (chữ phụ, lời chỉ dẫn, thông báo: trước số sát thương),
  // 'tren' (thanh máu quái, khung trùm / tinh anh: sau số sát thương), 'vien' (thanh máu em bé, ô vũ khí, bản đồ nhỏ, nút: ngoài sàn, vẽ sau cùng).
  // Không truyền part (cờ tắt): vẽ tất cả theo đúng thứ tự cũ.
  function drawHud(part) {
    const W = S.W, P = S.P, c = G.ux;
    const doc = !!part, on = (p) => !part || part === p;
    if (on('tren') && S.mode === 'play' && W.ents) mobBars(W);
    if (on('duoi') && G.doRoi && G.doRoi.veBay) G.doRoi.veBay(); // đồ vừa nhặt bay vào ô / hiện trên đầu (vẽ trước ô giao diện)
    // máu, mana
    const T = G.theme;
    const BA = G.btnArt; // bộ nút riêng (js/btn_art.js)
    if (on('vien')) {
    // Giai đoạn 4 (yêu cầu 2): thanh máu to hơn, chữ số to; thanh năng lượng có số để biết đủ mana cho chiêu chưa.
    T.bar(4, 3, 120, 'hp', Math.max(0, P.hp / P.maxhp), (G.CHU_RO !== false ? Math.max(0, Math.ceil(P.hp)) : Math.ceil(P.hp)) + ' / ' + P.maxhp, { h: 11, lag: P, size: 7.5 }); // lag: phần máu vừa mất tụt dần (js/ui_theme.js); khoá theo em bé của lượt chơi này
    T.bar(4, 15, 108, 'mana', P.mana / P.maxmana, Math.floor(P.mana) + ' / ' + P.maxmana, { h: 8, size: 6.5 });
    const canDrink = P.potions > 0 && !W.noPotion;
    const heldBox = (b) => [...G.pointers.values()].some((p) => p.role === 'ui' && hitBox({ x: p.sx, y: p.sy }, b));
    BA.draw(c, 'potion', POT[0] + 13, POT[1] + 12, 12, { count: P.potions, disabled: !canDrink, pressed: heldBox(POT) });
    ui.text(W.noPotion ? 'Cấm' : 'Bình máu', POT[0] + 29, POT[1] + 15, { size: 7, bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    BA.draw(c, 'pause', PAU[0] + PAU[2] / 2, PAU[1] + 12, 11, { pressed: heldBox(PAU) });
    let sx = 5;
    for (const k of G.ELS) if (P.st[k] > 0) { const gt = gdAnh('gd-tt-' + TT_MA[k]); if (gt) { ui.rect(sx, 54, 11, 11, 'rgba(14,10,8,0.85)', G.EL[k].col); G.spriteCustom.veGd(G.ux, gt, sx + 1, 55, 9, 9); } else if (G.lk && G.lk.icon) { ui.rect(sx, 54, 11, 11, 'rgba(14,10,8,0.85)', G.EL[k].col); G.lk.icon(k, sx + 5.5, 59.5, 0.9, false, 1); } else ui.rect(sx, 54, 10, 10, G.EL[k].col, '#000'); sx += 13; }
    const cw = G.curW(P), coat = P.coats[cw.id];
    if (coat && coat.t > 0) ui.text(G.t('Bùa {0} {1} giây', G.EL[coat.el].name, Math.ceil(coat.t)), sx + 1, 62.5, { size: 7.5, color: G.EL[coat.el].col, bold: true });
    }
    if (on('duoi')) {
    // tên vùng và loại phòng ở lề trái; bản đồ nhỏ ở lề phải (thay hàng chấm phòng trước đây)
    // Phòng trùm rộng (sàn từ x = 80): cột trái hẹp nên chữ sức mạnh xuống hai dòng, không tràn vào sàn.
    const narrow = !!(W.geo && W.geo.rong);
    // Đợt 2: phòng thường sàn rộng thì tên vùng và loại phòng xuống hai dòng (tên dài như "Thương nhân" không tràn vào sàn).
    const wide2 = narrow && !W.geo.big;
    if (S.aiNgay && G.aiNgay) ui.text(G.aiNgay.tenNgan(S), 5, 76, { size: 7, color: '#d9cdb8' }); // đợt 6: ải ngày
    else if (wide2) { ui.text(G.t('{0} {1}', G.REGIONS[S.r].name, S.i + 1), 5, 76, { size: 7, color: '#d9cdb8' }); ui.text(ROOM_NAME[W.type], 5, 85, { size: 7, color: '#d9cdb8' }); }
    else ui.text(G.t('{0} {1} · {2}', G.REGIONS[S.r].name, S.i + 1, ROOM_NAME[W.type]), 5, 76, { size: 7, color: '#d9cdb8' });
    // sức mạnh của bé lúc vào ải so với sức mạnh khuyên dùng của ải (xanh đủ, vàng sát nút, đỏ thiếu)
    if (wide2) { ui.text(G.t('Sức mạnh {0}', S.power), 5, 95, { size: 7, bold: true, color: G.powerCol(S.power, S.rec) }); ui.text(G.t('khuyên {0}', S.rec), 5, 104, { size: 6.5, color: '#bfb39c' }); }
    else if (narrow) { ui.text(G.t('Sức mạnh {0}', S.power), 5, 85, { size: 7, bold: true, color: G.powerCol(S.power, S.rec) }); ui.text(G.t('khuyên {0}', S.rec), 5, 94, { size: 6.5, color: '#bfb39c' }); }
    else ui.text(G.t('Sức mạnh {0} / khuyên {1}', S.power, S.rec), 5, 86, { size: 7, bold: true, color: G.powerCol(S.power, S.rec) });
    }
    if (on('vien')) {
    G.minimap.draw(S);
    // vũ khí: hình và bậc ở trên, mốc tiến hóa ở dưới, thanh dấu ấn sát đáy
    // Hệ thống mới: 4 vũ khí xoay vòng, HUD vẫn 2 ô: ô trái = món đang cầm, ô phải = món kế tiếp khi bấm đổi.
    const hienVk = P.weapons.length > 2 ? [P.weapons[P.cur], P.weapons[(P.cur + 1) % P.weapons.length]] : P.weapons;
    hienVk.forEach((w, i) => {
      const x = 368 + i * 56, on = w === P.weapons[P.cur];
      // Khung ô vũ khí cùng bộ với nút, viền mang màu bậc. Hình vũ khí sống và chữ do game vẽ ở các dòng dưới.
      const rar = G.RARITY[G.wRar(w)];
      BA.slot(c, x, 3, 54, 35, {
        weapon: { type: w.type, branch: G.activeEl(P, w), stage: G.wStage(w), rarity: G.wRar(w) },
        active: on, cd: on ? 0 : P.swapCd / (G.SWAP_CD || 1.5), icon: false, gem: false, id: 'slot' + i,
      });
      if (G.epDo) G.epDo.vien(c, x, 3, 54, 35, G.epDo.bac(w)); // đợt 6: viền màu Bậc ép đồ (Rực lửa có lửa chạy)
      G.art.weaponIcon(c, Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }), x + 13, 13, 19, on ? (P.atkT > 0 ? 'attack' : 'idle') : 'sleep');
      const mi = markInfo(w);
      // bậc và độ mài nằm ở phần phải của ô, không chồng lên hình vũ khí (hình chiếm 26 điểm bên trái)
      if (w.sharpen) ui.text('+' + w.sharpen, x + 51, 22, { size: 7, align: 'right', bold: true, color: on ? '#fff3da' : '#cbbd9e' });
      ui.text(G.CHU_RO !== false && !G.wStage(w) ? 'Chưa hệ' : G.STAGE_NAMES[G.wStage(w)], x + 27, 29.5, { size: 6.5, align: 'center', color: w.branch ? G.EL[w.branch].col : '#b8b0a0' });
      ui.bar(x + 3, 32.5, 48, 3, mi.frac, mi.col);
      // linh khí vừa bay tới ô vũ khí đang cầm: ô loé sáng màu hệ, viền sáng nở ra (VFX Phase 5)
      const fa = on && S.markFlashAt != null ? G.time - S.markFlashAt : -1;
      if (fa >= 0 && fa < 0.32) {
        const q = fa / 0.32, ga = c.globalAlpha, col = (w.branch && G.EL[w.branch] && G.EL[w.branch].col) || '#fff3b0', gr = Math.round(q * 3);
        c.globalAlpha = ga * 0.3 * (1 - q); c.fillStyle = '#fff8d8'; c.fillRect(x + 2, 5, 50, 31);
        c.globalAlpha = ga * 0.8 * (1 - q); c.fillStyle = col;
        c.fillRect(x - gr, 3 - gr, 54 + gr * 2, 1); c.fillRect(x - gr, 37 + gr, 54 + gr * 2, 1); c.fillRect(x - gr, 3 - gr, 1, 35 + gr * 2); c.fillRect(x + 53 + gr, 3 - gr, 1, 35 + gr * 2);
        c.globalAlpha = ga;
      }
    });
    if (G.lk) G.lk.hud(P, W); // ba vạch linh khí cạnh ô vũ khí, biểu tượng hệ trên đầu quái (js/linhkhi.js)
    }
    if (!doc && P.weapons.length > 1 && S.tut && W.type === 'elite') {
      // Đợt 2: chữ nằm trong một ô nền riêng, cách ô vũ khí 5 điểm ảnh nên không còn bị ô vũ khí cắt mất chữ cuối.
      const s0 = G.tv('Chạm để đổi vũ khí →'); ui.font(7, true);
      const tw0 = Math.ceil(G.ux.measureText(s0).width) + 8;
      T.plate(362 - tw0, 14, tw0, 12, { a: 0.78 });
      ui.text(s0, 362 - 4, 23, { size: 7, align: 'right', bold: true, color: '#ffd27a' });
    }
    // trùm: thanh máu và các lớp thích nghi nằm trên mặt tường sau, không che sàn.
    // Phân cấp (Giai đoạn 4): trùm vùng khung to viền vàng, tên chữ to, số phần trăm; trùm nhỏ khung vừa; tinh anh khung nhỏ.
    const b = W.boss;
    let topY = 0; // đáy của khối trên cùng giữa màn hình (để dòng báo xếp bên dưới)
    let by = doc ? S.docBy || 8 : 8;
    if (on('tren')) {
    if (b && !b.dead) {
      const big = b.kind !== 'mini';
      topY = T.bossBar(240, 2, { tier: big ? 'big' : 'mini', name: b.name, frac: b.hp / b.maxhp, lag: b, marks: [0.3, 0.6] });
      // các lớp thích nghi và điểm yếu: một hàng thẻ nhỏ ngay dưới khung, căn giữa
      const chips = [];
      for (const l of b.layers) chips.push([l.type === 'resist' ? G.t('Kháng {0}', G.EL[l.el].name) : G.tv(G.layerText(l)), l.type === 'resist' ? G.EL[l.el].dark : '#1f4f4a', '#f1e6c6']);
      if (b.weak.length) chips.push([G.t('Yếu {0}', b.weak.map((e) => G.tv(G.EL[e].name)).join(', ')), 'rgba(20,14,8,0.9)', G.EL[b.weak[0]].col]);
      ui.font(doc ? 7 : 6.5, true);
      let tot = 0; for (const q of chips) { q[3] = Math.ceil(G.ux.measureText(q[0]).width) + 8; tot += q[3] + 3; }
      let lx = Math.round(240 - (tot - 3) / 2);
      for (const q of chips) {
        ui.rect(lx, topY + 1, q[3], 10, q[1], '#1a120a');
        ui.rect(lx + 1, topY + 1, q[3] - 2, 1, 'rgba(255,240,196,0.25)');
        ui.text(q[0], lx + q[3] / 2, topY + 8.5, { size: doc ? 7 : 6.5, bold: true, align: 'center', color: q[2] });
        lx += q[3] + 3;
      }
      if (chips.length) topY += 12;
      if (b.exposed > 0) { if (doc) nenChu(['LỘ ĐIỂM YẾU!'], 240, topY + 9, 8.5); ui.text('LỘ ĐIỂM YẾU!', 240, topY + 9, { size: 8.5, align: 'center', color: Math.floor(G.time * 8) % 2 ? '#ffd23f' : '#fff3b0', bold: true }); topY += 11; }
    } else if (W.type === 'elite' && S.mode === 'play') {
      // phòng tinh anh: khung nhỏ ở mép trên với tên loài và dấu hiệu (nhanh, bọc giáp...)
      const el = W.ents.find((e) => e && !e.dead && e.role === 'elite');
      if (el) {
        const info = G.monsterArt && G.monsterArt.list ? G.monsterArt.list.find((q) => q.id === el.art) : null;
        const tr = el.trait && G.ELITE_TRAITS ? G.ELITE_TRAITS[el.trait] : null;
        topY = T.bossBar(240, 2, { tier: 'elite', name: info && info.ten ? G.t('Tinh anh · {0}', info.ten) : 'Tinh anh', sub: tr ? tr.name : null, frac: el.hp / el.maxhp, lag: el });
      }
    }
    by = topY ? topY + 3 : S.challenge ? 26 : 8;
    if (W.type === 'fountain') {
      const t = S.preview.length ? G.t('Trùm đã học: {0}', layerTexts(S.preview, ' · ')) : 'Trùm chưa học được gì từ bạn';
      const lines = ui.wrap(t, 228, 7, true);
      T.plate(122, 8, 236, lines.length * 9 + 7);
      lines.forEach((l, i) => ui.text(l, 240, 18 + i * 9, { size: 7, align: 'center', color: '#ffd9c8', bold: true }));
      by = 14 + lines.length * 9 + 4;
    }
    if (S.challenge) { const cs = G.t('Thử thách: hạ hết quái trong {0} giây', Math.max(0, Math.ceil(S.challenge.t))); if (doc) { nenChu([cs], 240, 20, 8); by = Math.max(by, 27); } ui.text(cs, 240, 20, { size: 8, align: 'center', color: S.challenge.t > 8 ? '#ffd27a' : '#ff6a5a', bold: true }); }
    if (doc) S.docBy = by;
    }
    if (on('duoi')) {
    if (doc && P.weapons.length > 1 && S.tut && W.type === 'elite') {
      // Đợt 8: nhãn này trước nằm cùng hàng với khung tinh anh nên bị khung che mất nửa chữ. Nay xuống một hàng riêng ngay dưới khung, sát ô vũ khí.
      const s0 = G.tv('Chạm để đổi vũ khí →'); ui.font(7, true);
      const tw0 = Math.ceil(G.ux.measureText(s0).width) + 8;
      T.plate(364 - tw0, by, tw0, 12, { a: 0.78 });
      ui.text(s0, 364 - 4, by + 9, { size: 7, align: 'right', bold: true, color: '#ffd27a' });
      by += 14;
    }
    if (doc) by = veThongBao(W, by);
    // Lời chỉ dẫn của ải đầu nằm ở lề trái, không che phòng. Ở phòng trùm tự ẩn sau 12 giây.
    let hint = S.hint;
    if (hint && W.cleared && W.hadWaves) hint = TUT.door;
    if (hint && W.type === 'boss' && S.roomT > 12) hint = null;
    // Dòng mẹo (cách đánh của vũ khí, mẹo nút Chưởng: W.banner.tip) cũng nằm ở lề trái dưới lời chỉ dẫn, không đè tường và cửa phía trên.
    let tipB = W.banner && W.banner.tip ? W.banner : null;
    // Phòng đầu ải hướng dẫn chỉ một ô chữ: mẹo vũ khí chờ (không đếm giờ), sang phòng kế mới hiện.
    if (tipB && !tipB.urgent && hint && S.tut && W.type === 'start') { tipB.t = Math.max(tipB.t, 5); S.heldTip = tipB; tipB = null; }
    if (S.mode === 'play' && (hint || tipB) && W.geo.rong && !W.geo.big) {
      // Đợt 2 (sàn phòng thường rộng 300): cột trái chỉ còn 66 điểm ảnh nên lời chỉ dẫn dời xuống ĐÁY GIỮA, nằm trên dải tường trước
      // (y 252–270). Một dòng thì không chạm sàn; câu dài hai dòng thì lấn mép dưới sàn chừng 9 điểm ảnh. Cỡ chữ giữ 7 như cũ.
      // Chỉ hiện MỘT ô mỗi lúc để không che trận đánh: dòng mẹo (có đếm giờ) hiện trước, hết giờ thì lời chỉ dẫn hiện lại.
      const q = tipB ? [tipB.s, tipB.col || '#ffd27a', tipB.t < 0.4 ? Math.max(0, tipB.t / 0.4) : 1] : [hint, '#f1e6c6', 1];
      // Phòng có cửa dưới đang MỞ: ô chữ ở đáy sẽ che mất lối ra và mũi tên chỉ lối, nên lúc đó ô chữ lên mặt tường sau (dưới các khối trên cùng),
      // nằm giữa nút tạm dừng (tới x = 96) và ô vũ khí (từ x = 366); phòng Suối hồi còn né thêm chữ "Rương đồ" ở góc trái.
      const len = W.doors.some((d) => d.dir === 'down' && d.open), lx0 = len ? (W.type === 'fountain' ? 142 : doc ? 126 : 98) : 77, lx1 = len ? 364 : 383; // Đợt 8: chữ đậm rộng hơn nên ô chữ bắt đầu từ 126, khỏi đè thanh máu / mana (tới x = 124)
      const bold = doc || q[1] !== '#f1e6c6', lines = ui.wrap(q[0], lx1 - lx0 - 10, 7, bold).slice(0, 4); // Đợt 8: lời chỉ dẫn cũng chữ đậm
      let tw = 0; ui.font(7, bold);
      for (const l of lines) tw = Math.max(tw, G.ux.measureText(l).width);
      const pw = Math.min(lx1 - lx0, Math.ceil(tw) + 12), ph = Math.round(lines.length * 9.5 + 6), mid = (lx0 + lx1) / 2, px = Math.round(mid - pw / 2), ga = G.ux.globalAlpha;
      const py = len ? by : 269 - ph;
      if (len) by += ph + 2;
      // Rà soát C: ô chữ ở đáy (y 244–269) che chân em bé / quái / vùng sát thương ở mép dưới sàn: lúc có ai hay vùng nào dưới ô thì mờ còn 35%
      let mo = 1;
      if (!len && G.RSC !== false) {
        const cam = W.cam || 0, x0 = px - 6 + cam, x1 = px + pw + 6 + cam, y0 = py - 4;
        const duoi = (o, rr) => o && !o.dead && o.y + (rr || 0) >= y0 && o.x + (rr || 0) >= x0 && o.x - (rr || 0) <= x1;
        if (duoi(S.P) || duoi(W.boss) || W.ents.some((e) => duoi(e)) || W.zones.some((z) => z.team !== 'player' && duoi(z, z.r || 0))) mo = 0.35;
      }
      G.ux.globalAlpha = ga * q[2] * mo;
      T.plate(px, py, pw, ph, { a: 0.78 });
      lines.forEach((l, i) => ui.text(l, mid, py + 9.5 + i * 9.5, { size: 7, align: 'center', color: q[1], bold }));
      G.ux.globalAlpha = ga;
    } else if (S.mode === 'play' && (hint || tipB)) {
      const hw = W.geo.big ? 64 : 118; // phòng trùm rộng hơn nên ô chữ hẹp lại, không đè lên sàn
      let hy = W.geo.big ? 100 : 93;
      for (const q of [hint ? [hint, '#f1e6c6', 1] : null, tipB ? [tipB.s, tipB.col || '#ffd27a', tipB.t < 0.4 ? Math.max(0, tipB.t / 0.4) : 1] : null]) {
        if (!q) continue;
        // Đợt 8: chữ đậm cho dễ đọc; cột trái phòng trùm hẹp, nếu chữ đậm làm ô quá cao (chạm cần điều khiển) thì giữ chữ thường như cũ
        let dam = doc, lines = ui.wrap(q[0], hw - 9, 7, dam);
        if (dam && hy + Math.round(lines.length * 9.5 + 7) > 186) { dam = false; lines = ui.wrap(q[0], hw - 9, 7); }
        const ph = Math.round(lines.length * 9.5 + 7), ga = G.ux.globalAlpha;
        if (hy + ph > 186) break; // không xuống tới cần điều khiển
        G.ux.globalAlpha = ga * q[2];
        T.plate(2, hy, hw, ph, { a: 0.78 });
        lines.forEach((l, i) => ui.text(l, 7, hy + 10 + i * 9.5, { size: 7, color: q[1], bold: dam || q[1] !== '#f1e6c6' }));
        G.ux.globalAlpha = ga;
        hy += ph + 3;
      }
    }
    if (!doc && W.banner && !W.banner.tip) {
      // dòng báo nằm trên tường sau; dài quá thì thu chữ, vẫn dài thì xuống dòng
      const maxW = W.geo.rong ? 290 : 228;
      let size = 10, lines = [W.banner.s];
      for (const sz of [10, 8.5, 7.5]) { size = sz; ui.font(sz, true); if (G.ux.measureText(W.banner.s).width <= maxW) break; }
      ui.font(size, true);
      if (G.ux.measureText(W.banner.s).width > maxW) lines = ui.wrap(W.banner.s, maxW, size, true);
      let tw = 0;
      ui.font(size, true);
      for (const l of lines) tw = Math.max(tw, G.ux.measureText(l).width);
      tw += 14;
      const lh = size + 3, bh = lines.length * lh + 5;
      // hiện ra: nảy từ trên xuống một nhịp; sắp hết: mờ dần (VFX Phase 5, theo G.VFX.giaoDien)
      const gd = G.VFX ? +G.VFX.giaoDien : 1, bn = W.banner;
      if (bn.t0 == null || bn.t > bn.t0) bn.t0 = bn.t;
      const age = bn.t0 - bn.t, cx0 = G.ux, ga0 = cx0.globalAlpha;
      let pdy = 0;
      if (gd > 0) {
        pdy = age < 0.14 ? -Math.round(5 * (1 - age / 0.14)) : age < 0.26 ? 1 : 0;
        cx0.globalAlpha = ga0 * Math.min(1, age < 0.12 ? 0.3 + age / 0.12 * 0.7 : 1, bn.t < 0.3 ? Math.max(0, bn.t / 0.3) : 1);
      }
      T.plate(Math.round(240 - tw / 2) - 2, by - 1 + pdy, Math.round(tw) + 4, Math.round(bh) + 2);
      lines.forEach((l, i) => ui.text(l, 240, by + pdy + size + 1.5 + i * lh, { size, align: 'center', bold: true, color: W.banner.col }));
      cx0.globalAlpha = ga0;
    }
    // cửa dẫn tới Trùm còn khóa: ghi rõ còn thiếu gì, ngay cạnh cửa
    if (S.mode === 'play' && W.cleared && !S.trans) {
      const gi = G.minimap.gateInfo(S);
      for (const d of W.doors) {
        if (!d.gate || d.open || !gi) continue;
        const q = G.roomArt.doorPos(W.geo, d.dir), v = DIRV[d.dir];
        const tx = q.x - v[0] * 34, ty = q.y - v[1] * 22 + (v[1] < 0 ? 4 : 0);
        const hot = S.gateMsgT > 0 && Math.floor(G.time * 6) % 2;
        if (doc) nenChu([gi.keys ? 'Cần 3 mảnh chìa' : 'Dọn 3 phòng quái', G.t('Đã có {0}/{1}', gi.n, gi.need)], tx, ty, 7, 9);
        ui.text(gi.keys ? 'Cần 3 mảnh chìa' : 'Dọn 3 phòng quái', tx, ty, { size: 7, align: 'center', bold: true, color: hot ? '#ffffff' : '#ff9a8a' });
        ui.text(G.t('Đã có {0}/{1}', gi.n, gi.need), tx, ty + 9, { size: 7, align: 'center', bold: true, color: '#ffd27a' });
      }
    }
    // tên các vật bấm được, để người mới biết đó là gì
    const PNAME = { chest: 'Rương báu', merchant: 'Thương nhân', altar: 'Bàn thờ lời nguyền', portal: 'Cổng dịch chuyển' };
    if (S.mode === 'play') {
      const fLock = W.type === 'fountain' && fountainLocked();
      if (fLock && W.props.some((p) => p.type === 'fountain' && !p.used)) {
        // suối còn khóa: một dòng chữ mờ giữa hai suối, kèm số phòng quái đã dọn
        const fs = W.props.filter((p) => p.type === 'fountain'), fx = fs.reduce((a, p) => a + p.x, 0) / fs.length, fy = fs[0].y - 44;
        if (doc) nenChu(['Dọn hết quái rồi quay lại', G.t('Đã dọn {0}/{1} phòng quái', fightsCleared(), FOUNTAIN_NEED)], fx, fy, 7.5, 9);
        ui.text('Dọn hết quái rồi quay lại', fx, fy, { size: 7.5, align: 'center', bold: true, color: doc ? '#d9cdb8' : '#b8b0a0' });
        ui.text(G.t('Đã dọn {0}/{1} phòng quái', fightsCleared(), FOUNTAIN_NEED), fx, fy + 9, { size: doc ? 7 : 6.5, align: 'center', bold: doc, color: doc ? '#bfb39c' : '#8f887c' });
      }
      for (const pr of W.props) {
        if (!pr.act || pr.used || (fLock && pr.act === 'fountain')) continue;
        const nm = pr.act === 'fountain' ? (pr.kind === 'hp' ? 'Hồi máu' : 'Hồi mana') : PNAME[pr.act];
        const py = pr.y - (pr.act === 'fountain' ? 40 : pr.act === 'portal' ? 44 : 36);
        if (doc && pr === S.near) nenChu([pr.act === 'portal' ? 'Bấm Vào cổng' : 'Bấm Đánh'], pr.x - W.cam, py, 8);
        if (pr === S.near) ui.text(pr.act === 'portal' ? 'Bấm Vào cổng' : 'Bấm Đánh', pr.x - W.cam, py, { size: 8, align: 'center', bold: true, color: '#fff3b0' });
        else if (nm) ui.text(nm, pr.x - W.cam, py, { size: 7, align: 'center', bold: true, color: pr.act === 'fountain' ? (pr.kind === 'hp' ? '#ff9a8a' : '#9ac8ff') : '#f0d9b0' });
      }
    }
    }
    // nút cảm ứng
    if (on('vien') && S.mode === 'play') {
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
      // nút Chưởng (thay nút kỹ năng riêng): hình theo cây chưởng đang dùng, vòng tích lực khi giữ (Hỏa chưởng có Tích lực)
      const chs = P.ch, chc = chs ? G.chuong.cost(P) : 30, chg2 = G.chuong ? G.chuong.chargeOf(P) : 0;
      BA.draw(c, chs ? 'chuong' : 'skill', bt[0], bt[1], bt[2] + 1, {
        hero: P.key, el: chs ? chs.el : null, cost: chc, disabled: P.mana < chc, pressed: held('skill') || !!P.chHold,
        cd: P.skillCd / ((chs ? chs.cd : 5) * (P.cdMul || 1)), cdSec: P.skillCd, label: showLab ? 'Chưởng' : null, labelAt: 'top',
        charge: chg2 > 0 ? chg2 : undefined, chargeSteps: 1,
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
      if (ui.btn(x, 84, 108, 100, o.label, { sub: '', size: 10 })) {
        if (o.kind === 'ore') { G.save.ore += o.n; S.got.push(G.t('{0} quặng', o.n)); }
        if (o.kind === 'lk' && G.vkMoi) { G.vkMoi.themLk(G.save, o.n); S.got.push(G.t('{0} linh khí', o.n)); }
        if (o.kind === 'charm') G.addCoat(o.el, 60);
        S.prop.used = true;
        S.mode = 'play';
        G.sfx('pick');
      }
      if (o.kind === 'charm') { const gb = gdAnh('gd-bua-' + o.el); if (gb) G.spriteCustom.veGd(G.ux, gb, x + 42, 97, 24, 24); } // hình lá bùa hệ (ảnh AI, phiên C2); chưa có tệp thì chỉ có chữ như cũ
      ui.para(o.sub, x + 6, 160, 96, { size: 6.5, color: '#f0d9b0' });
    });
  }
  // Cắt một dòng chữ cho vừa bề rộng wd (thêm "…"). Đo bằng ui.font nên theo đúng sàn cỡ chữ (V25).
  function cutLine(str, wd, size, bold) {
    str = G.tv(str);
    str = String(str);
    ui.font(size, bold);
    const c = G.ux;
    if (c.measureText(str).width <= wd) return str;
    let lo = 0, hi = str.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(str.slice(0, m) + '…').width <= wd) lo = m; else hi = m - 1; }
    return str.slice(0, lo).trimEnd() + '…';
  }
  // rightPad: chừa chỗ bên phải dòng tên (lò rèn ghi "đang mang" ở đó)
  function weaponLine(w, x, y, wd, sel, rightPad) {
    const mi = markInfo(w);
    const rar = G.RARITY[G.wRar(w)];
    G.theme.inset(x, y, wd, 22, sel);
    // ô hình vũ khí: viền mang màu bậc
    G.theme.slot(x + 2, y + 1, 20, G.wRar(w));
    G.art.weaponIcon(G.ux, w, x + 12, y + 11, 17);
    ui.text(cutLine(G.wName(w), wd - 30 - (rightPad || 0), 7.5, true), x + 26, y + 9.5, { size: 7.5, bold: true, color: rar.col });
    ui.text(cutLine(mi.txt, wd - 30, 6.5), x + 26, y + 18.5, { size: 6.5, color: mi.col === '#666' ? '#a9c2b4' : mi.col });
    return G.click && G.inRect(G.click, x, y, wd, 22);
  }
  G.weaponLine = weaponLine;
  function panelMerchant() {
    const sv = G.save, P = S.P, sh = S.shop;
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.55)');
    ui.panel(70, 50, 340, 166, 'Thương nhân');
    ui.text(G.t('{0} vàng', sv.gold), 398, 65, { size: 8, align: 'right', color: '#ffd23f', bold: true });
    const items = [
      { id: 'potion', label: 'Bình máu', sub: 'Hồi 30% máu', cost: 60, ok: P.potions < 3, f: () => { P.potions++; } },
      { id: 'charm', label: G.t('Bùa {0}', G.EL[sh.el].name), sub: 'Phủ hệ 60 giây', cost: 80, ok: true, f: () => G.addCoat(sh.el, 60) },
      { id: 'ore', label: '3 quặng', sub: 'Để mài vũ khí', cost: 100, ok: true, f: () => { sv.ore += 3; S.got.push('3 quặng'); } },
    ];
    // Phiên cân bằng (mục 3): bán thêm 1 nguyên liệu của vùng đã qua (vùng đang thiếu nhất), dùng chung kho lượt đổi với Bà Hàng Xén.
    const U = G.upg, mr = U && U.doiVung ? U.doiVung(sv) : null;
    // đợt 6: Bùa giữ bậc (ép đồ, js/ep_do.js) — giá cao
    if (G.epDo && G.epDo.bat() && G.EP_DO.bua) items.push({ id: 'buaBac', label: 'Bùa giữ bậc', sub: 'Ép không tụt bậc', cost: G.EP_DO.bua.thuongNhan, ok: true, f: () => { G.epDo.themBua(sv, 1); S.got.push(G.t('{0} bùa giữ bậc', 1)); } });
    if (mr != null) items.push({ id: 'mat', label: G.t('1 {0}', G.REGIONS[mr].mat.toLowerCase()), sub: G.t('Còn {0} lượt đổi', sv.doiNL | 0), cost: U.doiGia(), ok: U.doiDuoc(sv, mr) === '', f: () => { if (U.doi(sv, mr)) S.got.push(G.t('1 {0}', G.REGIONS[mr].mat.toLowerCase())); } });
    const bw = items.length > 4 ? 60 : items.length > 3 ? 76 : 100, bs = items.length > 4 ? 64 : items.length > 3 ? 81 : 108;
    items.forEach((it, i) => {
      const x = 82 + i * bs;
      const dis = sh.bought[it.id] || sv.gold < it.cost || !it.ok;
      if (ui.btn(x, 78, bw, 80, it.label, { sub: sh.bought[it.id] ? 'Đã mua' : G.t('{0} vàng', it.cost), size: 9.5, disabled: dis })) {
        if (it.id === 'mat') it.f(); // U.doi tự trừ vàng và lượt đổi
        else { sv.gold -= it.cost; it.f(); }
        sh.bought[it.id] = true; G.sfx('pick');
      }
      if (it.id === 'charm') { const gb = gdAnh('gd-bua-' + sh.el); if (gb) { const c = G.ux, ga = c.globalAlpha; if (dis) c.globalAlpha = ga * 0.5; G.spriteCustom.veGd(c, gb, x + bw / 2 - 12, 83, 24, 24); c.globalAlpha = ga; } } // hình lá bùa hệ (ảnh AI, phiên C2)
      ui.text(it.sub, x + bw / 2, 170, { size: 7, align: 'center', color: '#d9cdb8' });
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
    ui.panel(150, 48, 180, G.hanhTrang ? 210 : 182, 'Tạm dừng');
    if (ui.btn(165, 86, 150, 28, 'Chơi tiếp')) setMode('play');
    if (ui.btn(165, 120, 150, 28, G.t('Âm thanh: {0}', G.save.sound ? 'bật' : 'tắt'))) { G.save.sound = !G.save.sound; G.persist(); G.audioStart(); }
    // đã hạ trùm: không còn "bỏ ải" mà là rời ải, sang bảng kết quả thắng
    if (S.won) { if (ui.btn(165, 154, 150, 28, 'Rời ải', { color: '#a8452a' })) finish(true); }
    else if (ui.btn(165, 154, 150, 28, 'Bỏ ải, về làng', { color: '#6a2a22' })) { S.quit = true; finish(false); }
    // hòm thư góp ý (js/cloud_ui.js), kèm ảnh chụp trận
    if (G.cloudUI && ui.btn(165, 192, 150, 26, '✉ Góp ý', { color: '#2f5a52', size: 8.5 })) G.cloudUI.feedback({ shot: true });
    // Hành trang (js/hanh_trang.js): xem nhân vật, vũ khí, trang phục, linh khí, kỹ năng, tài nguyên; trong ải chỉ xem
    if (G.hanhTrang) {
      if (ui.btn(165, 224, 150, 26, '    Hành trang (xem)', { size: 8.5 })) { G.hanhTrang.reset(); setMode('bag'); }
      G.hanhTrang.icon(186, 237, 1);
    }
  }
  function panelResult() {
    const R = S.result;
    if (G.time - S.modeT < 0.45) G.click = null; // tránh bấm nhầm khi bảng vừa hiện lúc đang đánh
    ui.rect(0, 0, G.W, G.H, 'rgba(0,0,0,0.65)');
    if (R.aiNgay && G.aiNgay) { // đợt 6: bảng kết quả của ải ngày
      ui.panel(70, 22, 340, 228, G.aiNgay.tieuDe(S, R));
      R.lines.filter((l) => !l.w).slice(0, 13).forEach((l, i) => ui.text(l, 86, 56 + i * 11.5, { size: 7.5, color: '#e8dfcc', ten: G.CHU_RO !== false, tenCol: '#c9bfa6' }));
      if (G.lk && S.P) G.lk.resultBlock(S, 84, 182, 312);
      if (ui.btn(86, 216, 140, 26, 'Về làng')) { S = null; G.setScene(G.Village); return; }
      const lai = G.aiNgay.choiLai(S);
      if (ui.btn(254, 216, 140, 26, R.win ? 'Chơi lại' : 'Thử lại', { disabled: !lai })) G.aiNgay.vao(S.aiNgay.loai, S.aiNgay.muc);
      return;
    }
    ui.panel(70, 22, 340, 228, R.win ? G.t('Qua ải {0} {1}', G.REGIONS[S.r].name, S.i + 1) : S.quit ? G.t('Đã bỏ ải ở phòng {0}', ROOM_NAME[S.rooms[S.idx]]) : G.t(G.CHU_RO !== false ? 'Cháu ngã ở phòng {0} rồi' : 'Bạn đã gục ở phòng {0}', ROOM_NAME[S.rooms[S.idx]])); // 12/10: giọng người làng
    if (G.cloudUI && G.theme.sbtn(338, 25, 68, 17, '✉ Góp ý', { size: 7.5, pad: 2 })) G.cloudUI.feedback({ shot: true });
    let y = 54;
    if (R.win) {
      const notes = ['Qua ải', 'Không dùng bình máu', 'Hạ trùm bằng hệ khắc chế'];
      for (let i = 0; i < 3; i++) {
        const gs = gdAnh(R.starNote[i] ? 'gd-sao' : 'gd-sao-rong'); // ảnh AI 12×12 thay ký tự ★ ☆
        if (gs) G.spriteCustom.veGd(G.ux, gs, 85, y - 10, 12, 12);
        else ui.text(R.starNote[i] ? '★' : '☆', 86, y, { size: 12, color: R.starNote[i] ? '#ffd23f' : '#5a7a72' });
        ui.text(notes[i], 102, y - 1, { size: 8, color: R.starNote[i] ? '#f1ead9' : '#8fa49e' });
        y += 12;
      }
      y += 2;
    }
    if (!R.win && !S.quit && R.tips) { panelLose(R); return; }
    // Phần thưởng: chữ ở cột trái; vũ khí nhận được thành thẻ viền màu bậc ở cột phải (khung thẻ của chủ đề trống đồng).
    const TH = G.theme, texts = R.lines.filter((l) => !l.w), weps = R.lines.filter((l) => l.w);
    // Khối linh khí (js/linhkhi.js) nằm sát trên hàng nút: mỗi vũ khí đang mang một dòng. Phần thưởng xếp phía trên khối này.
    const lkN = G.lk && S.P ? 1 : 0, lkTop = lkN ? (!R.win && !S.quit ? 186 : 213) - (11 + lkN * 21) : 0;
    const lim = lkN ? lkTop - 3 : 208;
    const rows = Math.max(1, Math.floor((lim - y) / 11.5));
    // dòng nổi bật (lên cấp, cứu được em bé, kỷ lục): xét trên bản tiếng Việt của dòng; dòng kỷ lục của bảng vàng mở đầu bằng ★
    const hot = (l) => { const v = viOf(R, l); return v.includes('lên cấp') || v.includes('Cứu được') || v.indexOf('· ') === 0 || v.includes('Kỷ lục') || (G.LANG !== 'vi' && l.charAt(0) === '★'); };
    const line = (l, cx, cy) => ui.text(l, cx, cy, { size: 7.5, color: hot(l) ? '#ffd27a' : '#e8dfcc', ten: G.CHU_RO !== false, tenCol: '#c9bfa6' }); // 12/10: "+128 [hình] Kinh nghiệm"
    // Ảnh AI "lên cấp" (hu-len-cap, js/fx_anh.js): quầng sáng chạy lặp sau dòng chữ lên cấp. Không có tệp thì như cũ.
    if (R.up && G.fxAnh && G.fxAnh.co('hu-len-cap')) { const i = texts.slice(0, rows).findIndex((l) => typeof l === 'string' && viOf(R, l).includes('lên cấp')); if (i >= 0) G.fxAnh.ve(G.ux, 'hu-len-cap', 146, y + i * 11.5 - 2, G.time - S.modeT, 0, 0.6, false, 0.85); }
    texts.slice(0, rows).forEach((l, i) => line(l, 86, y + i * 11.5));
    let ry = y - 9;
    // ít vũ khí thì thẻ cao hai dòng; nhiều thì thẻ thấp lại một dòng để món nào cũng có hình
    const avail = lim - ry, nW = weps.length, pitch = G.clamp(Math.floor(avail / Math.max(1, nW)), 15, 26), maxCards = Math.max(1, Math.floor(avail / pitch));
    const cut = (str, wd, sz) => { const a = ui.wrap(str, wd, sz, true); return a.length > 1 ? a[0] + '…' : a[0]; };
    weps.slice(0, maxCards).forEach((l, i) => {
      if (i === maxCards - 1 && nW > maxCards) { ui.text(G.t('và {0} vũ khí nữa (xem ở Bà Hàng Xén)', nW - i), 246, ry + 10, { size: 7, color: '#ffd27a' }); ry += 14; return; }
      const rar = G.wRar(l.w), nm = G.wName(l.w), k = l.s.indexOf(nm), h = pitch - 2;
      TH.card(244, ry, 152, h, { rar });
      if (pitch >= 22) {
        TH.slot(247, ry + 2, 20, rar);
        G.art.weaponIcon(G.ux, l.w, 257, ry + 12, 16);
        // V26: ▲/▼ so với vũ khí đang mang (Sức mạnh nếu mang món này thay một ô; món đang mang rồi thì không ghi)
        const cmp = cmpMark(l.w), cw = cmp ? cutLine(cmp.s, 50, 6.5, true) : '';
        if (cmp) { ui.font(6.5, true); }
        const cmpW = cmp ? G.ux.measureText(cw).width + 3 : 0;
        ui.text(cutLine(G.t('{0} · bậc {1}', k > 0 ? l.s.slice(0, k).trim().replace(/:$/, '') : 'Nhận được', G.RARITY[rar].name), 121 - cmpW, 6.5), 271, ry + 9.5, { size: 6.5, color: '#a9c2b4' });
        if (cmp) ui.text(cw, 392, ry + 9.5, { size: 6.5, bold: true, align: 'right', color: cmp.up ? '#9be07a' : '#ff9a5a' });
        ui.text(cut(nm, 118, 7.5), 271, ry + 19.5, { size: 7.5, bold: true, color: G.RARITY[rar].col });
      } else {
        G.art.weaponIcon(G.ux, l.w, 254, ry + h / 2, Math.min(12, h - 2));
        const cmp = cmpMark(l.w);
        if (cmp) ui.text(cmp.up ? '▲' : '▼', 392, ry + h / 2 + 2.6, { size: 7, bold: true, align: 'right', color: cmp.up ? '#9be07a' : '#ff9a5a' });
        ui.text(cut(nm, cmp ? 116 : 128, 7), 263, ry + h / 2 + 2.6, { size: 7, bold: true, color: G.RARITY[rar].col });
      }
      ry += pitch;
    });
    // chữ còn dư thì xuống cột phải, dưới các thẻ vũ khí
    texts.slice(rows).forEach((l, i) => { const cy = ry + 9 + i * 11.5; if (cy <= lim) line(l, 246, cy); });
    if (lkN) G.lk.resultBlock(S, 84, lkTop, 312);
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
  // V26: thẻ vũ khí ở màn kết quả: ▲ nếu mang món này thay một ô đang mang thì Sức mạnh tăng, ▼ nếu ô nào cũng giảm.
  function cmpMark(w) {
    const sv = G.save, U = G.upg;
    if (!w || !U || !U.swapGain || !sv.carry || sv.carry.includes(w.id) || !G.weaponById(w.id)) return null;
    let best = null;
    for (let slot = 0; slot < sv.carry.length; slot++) { const g = U.swapGain(w, slot, sv); if (best == null || g > best) best = g; }
    if (!best) return null;
    return { up: best > 0, s: (best > 0 ? '▲ ' : '▼ ') + G.tv(U.gainText(best, true)) };
  }
  // V17: VÌ SAO THUA. Đọc máu mất theo nguồn (W.hurtBy) và đòn cuối (W.lastHurt) do js/combat.js ghi; tên chiêu trùm b.skillName (js/boss.js).
  // Chưa có số liệu (bản cũ, hay khoá khác tên) thì bỏ qua, bảng thua giữ như trước. Không bao giờ được làm lỗi bảng thua.
  const HURT = { // tên nguồn và một mẹo cố định cho nguồn đó
    spiky: ['Gai', 'Gai đang dựng gai thì đừng chém: đứng xa chờ gai bay qua rồi hãy đánh.'],
    archer: ['Xạ thủ', 'Hạ Xạ thủ trước, và đi vòng chứ đừng đứng yên một chỗ.'],
    kami: ['Cảm tử', 'Cảm tử lao tới rồi nổ: thấy vòng đỏ quanh nó là lăn né ra xa.'],
    bomber: ['Đặt bom', 'Bom có vòng báo trước: bước ra khỏi vòng rồi mới đánh tiếp.'],
    nimble: ['Nhanh nhẹn', 'Nhanh nhẹn lặn rồi trồi sau lưng: thấy vòng đỏ dưới chân thì né.'],
    shield: ['Khiên', 'Khiên đỡ đòn phía trước: vòng ra sau lưng nó mà đánh.'],
    swarm: ['Bầy nhỏ', 'Bầy nhỏ đông: vừa đánh vừa lùi, đừng để bị vây.'],
    rusher: ['Lính xông', 'Lính xông lao thẳng tới: né sang bên rồi đánh vào lưng.'],
    elite: ['Tinh anh', 'Tinh anh đánh đau: đánh vài đòn rồi lăn né, đừng đứng đỡ.'],
    mini: ['Trùm nhỏ', 'Trùm nhỏ ra đòn có báo trước: thấy là lăn né rồi mới đánh.'],
    boss: ['Đòn trùm', 'Trùm ra chiêu có báo trước: thấy là lăn né, đừng tham đánh thêm.'],
    zone: ['Vùng đỏ của trùm', 'Vùng đỏ dưới đất sắp nổ: ra khỏi vùng đỏ trước rồi mới đánh.'],
    dot: ['Cháy, độc', 'Đang cháy hay trúng độc thì đừng đứng yên, máu thấp thì uống bình máu sớm.'],
    other: ['Đòn khác', 'Lăn né đúng lúc thì không bị trúng đòn: né khi thấy báo trước.'],
  };
  const HURT_ALIAS = { gai: 'spiky', xathu: 'archer', camtu: 'kami', datbom: 'bomber', bom: 'bomber', bomb: 'bomber', khien: 'shield', bay: 'swarm', bayn: 'swarm',
    tinhanh: 'elite', trumnho: 'mini', minis: 'mini', trum: 'boss', bosshit: 'boss', bossskill: 'boss', bossmelee: 'boss', bossatk: 'boss', bossshot: 'boss',
    bosszone: 'zone', bossarea: 'zone', bossvung: 'zone', area: 'zone', vung: 'zone', vungdo: 'zone', fire: 'dot', poison: 'dot', burn: 'dot', dots: 'dot', chay: 'dot', doc: 'dot' };
  function hurtKey(k) {
    const s = String(k);
    if (HURT[s]) return s;
    const lo = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z]/g, '');
    if (HURT[lo]) return lo;
    if (HURT_ALIAS[lo]) return HURT_ALIAS[lo];
    if (G.ROLES && G.ROLES[s]) return s;
    if (/zone|area|vung/.test(lo)) return 'zone';
    if (/^boss|^trum/.test(lo)) return 'boss';
    return s;
  }
  function hurtInfo(k) {
    const key = hurtKey(k);
    if (HURT[key]) return { key, name: HURT[key][0], tip: HURT[key][1] };
    if (G.ROLES && G.ROLES[key]) return { key, name: G.ROLES[key].name, tip: HURT.other[1] };
    if (/[^\x00-\x7f]| /.test(key)) return { key, name: key, tip: HURT.other[1] }; // khoá đã là tên tiếng Việt
    return { key: 'other', name: HURT.other[0], tip: HURT.other[1] };
  }
  const hurtAmt = (v) => (typeof v === 'number' ? v : v && typeof v === 'object' ? +(v.amt != null ? v.amt : v.hp != null ? v.hp : v.dmg != null ? v.dmg : v.v != null ? v.v : v.n) || 0 : 0);
  function loseWhy() {
    const W = S.W, b = W && W.boss, out = { most: null, pct: 0, last: null, boss: null };
    // 1. Máu mất theo nguồn: cộng ở phòng đang đứng và các phòng đã qua (mỗi bảng đếm chỉ cộng một lần)
    const tot = {}, seen = new Set();
    const add = (o) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      for (const k in o) { const a = hurtAmt(o[k]); if (a > 0 && isFinite(a)) { const q = hurtInfo(k).name; tot[q] = (tot[q] || 0) + a; tot['\u0000' + q] = hurtInfo(k).tip; } }
    };
    add(S.hurtBy);
    if (W) add(W.hurtBy);
    if (S.worlds) for (const id in S.worlds) add(S.worlds[id] && S.worlds[id].hurtBy);
    let sum = 0;
    for (const q in tot) if (q[0] !== '\u0000') { sum += tot[q]; if (!out.most || tot[q] > tot[out.most]) out.most = q; }
    if (out.most && sum > 0) { out.pct = Math.round((tot[out.most] / sum) * 100); out.tip = tot['\u0000' + out.most]; } else out.most = null;
    // 2. Đòn cuối hạ bé
    const lh = (W && W.lastHurt) || S.lastHurt;
    if (lh) {
      let nm = null, key = null;
      if (typeof lh === 'string') nm = lh;
      else if (typeof lh === 'object') { nm = lh.name || lh.skill || lh.skillName || null; key = lh.src || lh.kind || lh.key || lh.role || lh.type || null; if (typeof key !== 'string') key = null; }
      if (!nm && key) { const hi = hurtInfo(key); if ((hi.key === 'boss' || hi.key === 'zone') && b && b.skillName) nm = b.skillName; else nm = hi.name; }
      if (typeof nm === 'string' && nm) out.last = nm;
    }
    // 3. Thua ở phòng trùm: trùm kháng gì, yếu gì, đã học gì (như hàng chip dưới tên trùm)
    if (b && !b.dead) {
      const parts = [];
      for (const l of b.layers || []) parts.push(l.type === 'resist' ? G.t('kháng {0}', G.EL[l.el].name) : G.tv(G.layerText(l)));
      if (b.weak && b.weak.length) parts.push(G.t('yếu {0}', b.weak.map((e) => G.tv(G.EL[e].name)).join(', ')));
      if (parts.length) out.boss = b.name ? G.t('{0}: {1}', b.name, parts.join(', ')) : G.t('Trùm: {0}', parts.join(', '));
    }
    return out.most || out.last || out.boss ? out : null;
  }
  // BẢNG THUA: không có "thua nhiều thì mạnh thêm". Bảng chỉ rõ nên cày gì: Sức mạnh hiện tại so với khuyên dùng, rồi 2-3 gợi ý
  // nâng cấp cụ thể (G.upgradeTips, js/upgrade.js). Bấm một gợi ý thì về làng và mở thẳng bảng của người làng làm việc đó.
  function panelLose(R) {
    const T2 = R.tips, W0 = 86;
    // phần nhận được: gộp một dòng
    const texts = R.lines.filter((l) => !l.w), nW = R.lines.length - texts.length;
    const got = texts.join(' · ') + (nW ? G.t(' · nhặt {0} vũ khí (ở Bà Hàng Xén)', nW) : '');
    const gl = ui.wrap(got, 308, 7, true);
    ui.text(gl[0] + (gl.length > 1 ? '…' : ''), W0, 52, { size: 7, color: '#e8dfcc' });
    // sức mạnh hiện tại / khuyên dùng
    const pw = T2.power, rec = T2.rec, col = G.powerCol(pw, rec);
    ui.text(pw < rec ? G.t('Sức mạnh {0} / khuyên dùng {1} · còn thiếu {2}', pw, rec, rec - pw) : G.t('Sức mạnh {0} / khuyên dùng {1} · đủ sức, thử lại né kỹ hơn nhé', pw, rec), W0, 65, { size: 8, bold: true, color: col });
    ui.bar(W0, 69, 308, 3, G.clamp(pw / rec, 0, 1), col);
    // V17: vì sao thua (tối đa 3 dòng); có thì bớt một gợi ý nâng cấp cho vừa bảng. Không có số liệu: bảng như cũ.
    if (R.why === undefined) { try { R.why = loseWhy(); } catch (e) { R.why = null; } }
    const why = R.why, wl = [];
    if (why) {
      const gv = why.last ? G.t(' · gục vì: {0}', why.last) : '';
      if (why.most) {
        wl.push([G.t('Mất máu nhiều nhất: {0} ({1}%)', why.most, why.pct) + gv, '#ff9a7a', true]);
        wl.push([G.t('Mẹo: {0}', why.tip), '#d9cdb8', false]);
      } else if (gv) wl.push([G.t('Bé gục vì: {0}', why.last), '#ff9a7a', true]);
      if (why.boss) wl.push([why.boss, '#f6dc92', false]);
    }
    wl.forEach((q, i) => ui.text(cutLine(q[0], 308, 7.5, q[2]), W0, 78 + i * 10, { size: 7.5, bold: q[2], color: q[1] }));
    const tips = wl.length ? T2.tips.slice(0, 2) : T2.tips, hy = wl.length ? 80 + wl.length * 10 : 82, ty = hy + 4;
    ui.text(tips.length ? 'Nên cày gì (bấm để tới chỗ người làng):' : 'Đã nâng cấp hết mức hiện có: chơi lại ải cũ để lên cấp.', W0, hy, { size: 7, bold: true, color: '#f6dc92' });
    tips.forEach((t, k) => {
      const y = ty + k * 23, h = 21;
      ui.rect(W0, y, 308, h, t.ok ? 'rgba(60,110,60,0.45)' : 'rgba(30,48,46,0.85)', t.ok ? '#8fd07a' : '#5f7a74');
      const hit = G.click && G.inRect(G.click, W0, y, 308, h);
      ui.text(cutLine(G.t('{0}. {1}', k + 1, t.text), 236, 7.5, true), W0 + 5, y + 8.5, { size: 7.5, bold: true, color: '#fff0c4' });
      ui.text(t.gain > 0 ? G.t('+{0} sức mạnh', t.gain) : 'không tốn gì', W0 + 302, y + 8.5, { size: 7, bold: true, align: 'right', color: '#9be07a' });
      const sl = ui.wrap(t.sub, 270, 6.5, true);
      ui.text(sl[0] + (sl.length > 1 ? '…' : ''), W0 + 12, y + 17.5, { size: 6.5, color: t.ok ? '#c8f0b0' : '#d9cdb8' });
      ui.text('▶', W0 + 302, y + 17.5, { size: 7, align: 'right', color: '#f6dc92' });
      if (hit) { G.click = null; G.sfx('ui'); G.villageGo = t.go; S = null; G.setScene(G.Village); }
    });
    if (!S) return;
    // khối linh khí của từng vũ khí (js/linhkhi.js) nằm dưới các gợi ý
    const lkN = G.lk && S.P ? 1 : 0;
    if (lkN) G.lk.resultBlock(S, 84, Math.max(ty + tips.length * 23 + 2, 213 - (11 + lkN * 21)), 312);
    if (ui.btn(86, 216, 140, 26, 'Về làng')) { S = null; G.setScene(G.Village); return; }
    if (ui.btn(254, 216, 140, 26, 'Thử lại')) G.startStage(S.r, S.i, S.diff);
  }
})();
