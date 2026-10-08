// Dựng cảnh: mượn bộ máy chiến đấu thật của game để có hero, quái, hiệu ứng thật, rồi ghép với phòng tự vẽ.
(function () {
  const G = window.G, A = G.art, M = window.Mock, ui = G.ui;
  const U = M.util, mk = U.mk;

  // Dừng vòng lặp của game, cố định số ngẫu nhiên để ảnh dựng lại giống hệt.
  M.init = function () {
    window.requestAnimationFrame = () => 0;
    const rnd = G.srand(20261008);
    Math.random = rnd; G.rnd = rnd;
    G.sfx = () => {};
    G.testSave({ lvl: 12, tier: 1, branch: 'fire', marks: 140, armor: 'a_moc', helm: 'h_moc' });
  };

  // o: { reg, w, bounds:{x0,y0,x1,y1}, hero:{x,y,face,hp,mana}, ents:[{role,x,y,el,face,hp}], props:[...], zones:[...], real }
  function setup(o) {
    const rnd = G.srand(o.seed || 77);
    Math.random = rnd; G.rnd = rnd;
    G.startStage(o.reg, 2, 0);
    G.gotoRoom(o.roomNo || 3); // phòng thứ tư của ải, loại đánh quái
    const S = G.getRun(), W = S.W, P = S.P;
    W.ents.length = 0; W.waves = []; W.zones.length = 0; W.projs.length = 0; W.texts.length = 0; W.parts.length = 0; W.slashes.length = 0;
    if (!o.keepProps) W.props.length = 0;
    W.banner = null; S.hint = null; S.tut = false; W.cleared = !!o.cleared; S.fade = 0;
    if (o.bounds) Object.assign(W, o.bounds);
    if (o.w) W.w = o.w;
    if (G.fx.reset) G.fx.reset();
    P.x = o.hero.x; P.y = o.hero.y; P.face = o.hero.face || 1; P.inv = 0;
    P.mana = P.maxmana * (o.hero.mana == null ? 0.62 : o.hero.mana);
    for (const e of o.ents || []) {
      const m = G.spawnEnemy(e.role, e.x, e.y, { el: e.el, resist: e.resist });
      m.face = e.face || (e.x > P.x ? -1 : 1); m.inside = true; m.cd = e.cd == null ? 3 : e.cd; m.t = e.t == null ? m.t : e.t;
      if (e.hp) m.hp = m.maxhp * e.hp;
      m.speed = e.speed == null ? 7 : e.speed; // gần như đứng yên để bố cục không xô lệch
      if (e.wind) { m.wind = e.wind; m.cd = 9; }
      if (e.status) G.applyStatus(m, e.status, 4, 2);
    }
    for (const p of o.props || []) W.props.push(Object.assign({ env: true }, p));
    for (const z of o.zones || []) W.zones.push(Object.assign({ shape: 'circle', t: 0, life: 9, tick: 9, dmg: 0 }, z));
    return { S, W, P };
  }

  // Chạy vài khung hình thật: hero đi rồi vung vũ khí, quái phản ứng. Dừng giữa nhát chém.
  function play(o) {
    const S = G.getRun(), W = S.W, P = S.P;
    const inp = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false });
    let cur = inp();
    G.botInput = () => cur;
    const step = (i) => { cur = i; G.tick(); cur = inp(); };
    for (let i = 0; i < (o.warm || 6); i++) step(Object.assign(inp(), o.move || {}));
    const hits = o.hits == null ? 1 : o.hits;
    for (let h = 0; h < hits; h++) {
      step(Object.assign(inp(), { atk: true, atkP: true }));
      const stopAt = h === hits - 1 ? (o.stopAt || 0.5) : 0.98;
      for (let i = 0; i < 90; i++) {
        const k = P.atkT > 0 ? 1 - P.atkT / P.atkDur : 1;
        if (k >= stopAt) break;
        step(Object.assign(inp(), { atk: true }));
      }
    }
    if (o.hp != null) P.hp = Math.round(P.maxhp * o.hp);
    G.botInput = null;
  }
  M.setup = setup; M.play = play;

  // Vẽ thế giới bằng G.drawWorld thật, chỉ thay nền bằng phòng của mình.
  // view: { w, h } kích thước khung nhìn gốc; k: hệ số phóng ra ảnh cuối (3 hoặc 4,5)
  function renderWorld(room, view, k, reg, camX, outW) {
    outW = outW || 1440;
    const S = G.getRun(), W = S.W;
    const wc = mk(view.w, view.h);
    const ov = mk(outW, Math.round(outW * 9 / 16));
    ov.imageSmoothingEnabled = true;
    const keep = { wx: G.wx, ux: G.ux, bg: A.bg, W: G.W, H: G.H };
    G.wx = wc; G.ux = ov;
    W.cam = camX || 0;
    if (room && room.base) A.bg = (cx) => { cx.drawImage(room.base, -Math.round(W.cam), 0); };
    else if (room && room.bgFn) A.bg = function (cx) { keep.bg.apply(A, arguments); room.bgFn(cx); };
    ov.setTransform(k, 0, 0, k, 0, 0);
    ov.textBaseline = 'alphabetic';
    try { G.drawWorld(reg); } finally { G.wx = keep.wx; A.bg = keep.bg; }
    wc.setTransform(1, 0, 0, 1, 0, 0);
    if (room && room.fore) wc.drawImage(room.fore, -Math.round(W.cam), 0);
    ov.setTransform(outW / 480, 0, 0, outW / 480, 0, 0);
    return { wc, ov, restore() { G.ux = keep.ux; } };
  }
  function compose(wc, ov) {
    const out = mk(ov.canvas.width, ov.canvas.height);
    out.imageSmoothingEnabled = false;
    out.drawImage(wc.canvas, 0, 0, ov.canvas.width, ov.canvas.height);
    out.imageSmoothingEnabled = true;
    out.drawImage(ov.canvas, 0, 0);
    return out;
  }
  M.renderWorld = renderWorld; M.compose = compose;

  // ---------- bản đồ nhỏ ----------
  // Ô phòng: 'cur' đang đứng, 'seen' đã qua, 'next' kề bên chưa vào (chỉ viền). Phòng chưa biết không vẽ.
  const MAP0 = {
    cells: [[0, 1, 'seen'], [1, 1, 'seen'], [1, 2, 'seen', 'chest'], [2, 1, 'cur'], [3, 1, 'next'], [2, 0, 'next'], [2, 2, 'next']],
    links: [[0, 1, 1, 1], [1, 1, 1, 2], [1, 1, 2, 1], [2, 1, 3, 1], [2, 1, 2, 0], [2, 1, 2, 2]],
  };
  function minimap(x, y, o) {
    o = o || {};
    const cw = o.cw || 15, ch = o.ch || 11, gp = o.gap || 5, cols = 4, rows = 3;
    const w = cols * cw + (cols - 1) * gp + 12, h = rows * ch + (rows - 1) * gp + 23;
    ui.rect(x, y, w, h, 'rgba(14,10,10,0.88)', '#7a5a3a');
    ui.rect(x + 1.5, y + 1.5, w - 3, h - 3, null, 'rgba(255,220,160,0.12)');
    ui.text('Bản đồ', x + 6, y + 10.5, { size: 7, bold: true, color: '#ffd27a' });
    ui.text(o.sub || 'Phòng 4/8', x + w - 6, y + 10.5, { size: 6.5, align: 'right', color: '#d9cdb8' });
    const X = (i) => x + 6 + i * (cw + gp), Y = (j) => y + 16 + j * (ch + gp);
    const MAP = o.map || MAP0;
    const st = {}; for (const cl of MAP.cells) st[cl[0] + ',' + cl[1]] = cl[2];
    for (const l of MAP.links) {
      const dim = st[l[2] + ',' + l[3]] === 'next' || st[l[0] + ',' + l[1]] === 'next';
      const col = dim ? 'rgba(200,170,120,0.45)' : '#c8a878';
      if (l[1] === l[3]) ui.rect(X(Math.min(l[0], l[2])) + cw, Y(l[1]) + ch / 2 - 1.5, gp, 3, col);
      else ui.rect(X(l[0]) + cw / 2 - 1.5, Y(Math.min(l[1], l[3])) + ch, 3, gp, col);
    }
    for (const cl of MAP.cells) {
      const cx = X(cl[0]), cy = Y(cl[1]);
      if (cl[2] === 'cur') {
        ui.rect(cx - 2, cy - 2, cw + 4, ch + 4, 'rgba(255,210,122,0.28)');
        ui.rect(cx, cy, cw, ch, '#ffd27a', '#fff6d8');
        // chấm hero
        ui.rect(cx + cw / 2 - 2, cy + ch / 2 - 2, 4, 4, '#5a2a10');
      } else if (cl[2] === 'seen') {
        ui.rect(cx, cy, cw, ch, '#9a7f5e', '#5a4632');
        if (cl[3] === 'chest') { ui.rect(cx + cw / 2 - 3, cy + ch / 2 - 2, 6, 4, '#e8c050', '#5a3a10'); }
      } else {
        ui.rect(cx, cy, cw, ch, 'rgba(0,0,0,0.25)', '#c8a878');
        ui.text('?', cx + cw / 2, cy + ch / 2 + 2.6, { size: 7, align: 'center', bold: true, color: '#c8a878', shadow: false });
      }
    }
    return { w, h };
  }
  M.minimap = minimap;

  // ---------- giao diện cho Kiểu A: dồn hết ra hai lề ----------
  function hudA(P, S) {
    const c = G.ux;
    ui.bar(6, 6, 112, 8, P.hp / P.maxhp, '#d8453a');
    ui.text(Math.ceil(P.hp) + '/' + P.maxhp, 62, 13, { size: 6.5, align: 'center', bold: true });
    ui.bar(6, 16, 112, 5, P.mana / P.maxmana, '#3f8be0');
    ui.rect(6, 25, 54, 20, 'rgba(160,40,30,0.85)', '#e2b36a');
    ui.text('Bình máu ×' + P.potions, 33, 38, { size: 7, align: 'center', bold: true, color: '#fff3da' });
    ui.rect(64, 25, 30, 20, 'rgba(40,36,32,0.8)', '#e2b36a');
    ui.text('Dừng', 79, 38, { size: 7, align: 'center', bold: true });
    ui.text('Bùa Lửa 4 giây', 6, 57, { size: 7.5, color: G.EL.fire.col, bold: true });
    ui.text('Lâu đài cổ 3', 6, 70, { size: 7, color: '#d9cdb8' });
    P.weapons.forEach((w, i) => {
      const x = 364 + i * 57, on = i === P.cur;
      ui.rect(x, 4, 54, 35, on ? 'rgba(90,60,30,0.9)' : 'rgba(30,26,22,0.75)', on ? '#ffd27a' : '#6a5a4a');
      c.save(); c.translate(x + 12, 14);
      A.weaponIcon(c, Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }), 0, 0);
      c.restore();
      const mi = G.markInfo(w);
      ui.text(G.TIERS[w.tier].name + (w.sharpen ? ' +' + w.sharpen : ''), x + 51, 15, { size: 7, align: 'right', bold: on, color: on ? '#fff3da' : '#b8b0a0' });
      ui.text(G.STAGE_NAMES[G.wStage(w)], x + 27, 30.5, { size: 6.5, align: 'center', color: w.branch ? G.EL[w.branch].col : '#b8b0a0' });
      ui.bar(x + 3, 33.5, 48, 3, mi.frac, mi.col);
    });
    minimap(376, 45);
    // cần di chuyển: đang đẩy sang phải
    ui.circle(62, 214, 26, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.35)');
    ui.circle(74, 211, 11, 'rgba(255,255,255,0.35)');
    const BT = { atk: [434, 224, 28], dodge: [384, 248, 17], special: [386, 204, 17], skill: [426, 170, 17] };
    const lab = { atk: 'Đánh', dodge: 'Né', special: 'Đặc biệt', skill: G.HEROES[P.key].skill };
    const colr = { atk: '200,90,40', dodge: '120,120,120', special: '63,139,224', skill: '160,110,220' };
    for (const n in BT) {
      const b = BT[n];
      ui.circle(b[0], b[1], b[2], 'rgba(' + colr[n] + ',' + (n === 'atk' ? 0.6 : 0.3) + ')', 'rgba(255,255,255,0.55)');
      ui.text(lab[n], b[0], b[1] + 2.5, { size: n === 'atk' ? 9 : 6.5, align: 'center', bold: true, color: '#fff' });
    }
  }

  // ====================================================================
  // KIỂU A: phòng vuông nhìn từ trên, vừa một màn hình
  // ====================================================================
  M.geoA = function (states) {
    states = states || {};
    const g = { W: 480, H: 270, fx0: 136, fy0: 56, fx1: 344, fy1: 252, wh: 42, cap: 7, sw: 14, fw: 12 };
    const cx = 240, cy = 154;
    g.doors = [
      { side: 'top', at: cx, state: states.top || 'locked' }, { side: 'bottom', at: cx, state: states.bottom || 'locked' },
      { side: 'left', at: cy, state: states.left || 'locked' }, { side: 'right', at: cy, state: states.right || 'locked' },
    ];
    g.bounds = { x0: g.fx0 + 9, x1: g.fx1 - 9, y0: g.fy0 + 8, y1: g.fy1 - 4 };
    return g;
  };
  const PROP_OF = ['mushroom', 'crystal', 'brazier'];
  M.sceneA = function (theme, o) {
    o = o || {};
    const T = M.themes[theme], g = M.geoA(o.states);
    const room = M.buildRoom(T, g, o.seed || 11);
    const el = ['poison', 'ice', 'fire'][T.reg];
    if (o.bounds) Object.assign(g.bounds, o.bounds);
    setup(Object.assign({
      reg: T.reg, w: 480, bounds: g.bounds, seed: 5,
      hero: { x: 212, y: 174, face: 1 },
      ents: [
        { role: 'rusher', x: 240, y: 175, hp: 0.6, cd: 9 },
        { role: 'shield', x: 282, y: 150, cd: 9 },
        { role: 'swarm', x: 286, y: 108, cd: 9 }, { role: 'swarm', x: 312, y: 186, cd: 9 },
        { role: 'archer', x: 322, y: 100, wind: 1.2 },
        { role: 'nimble', x: 172, y: 226, face: 1, cd: 9 },
      ],
      props: [{ type: PROP_OF[T.reg], x: 316, y: 230 }, { type: 'chest', x: 164, y: 88 }],
      zones: [
        { x: 190, y: 122, r: 20, pool: true, team: 'enemy', el },
        { x: 262, y: 216, r: 24, t: 3, t0: 4.2, life: 0.12 },
      ],
    }, o.scene || {}));
    play(Object.assign({ warm: 5, move: { mx: 1 }, hits: 1, stopAt: 0.52, hp: 0.86 }, o.play || {}));
    return { room, g, T };
  };
  M.cvA = function () {
    const { room, T } = M.sceneA('castle');
    const S = G.getRun();
    const R = renderWorld(room, { w: 480, h: 270 }, 3, T.reg, 0);
    hudA(S.P, S);
    R.restore();
    return compose(R.wc, R.ov).canvas;
  };
  // Giao diện thật của game (thanh máu, vũ khí, nút bấm), vẽ lên lớp phủ.
  function realHud(o) {
    o = o || {};
    const S = G.getRun();
    const keep = { dw: G.drawWorld, cx: G.cx, cy: G.cy, rooms: S.rooms, idx: S.idx };
    G.drawWorld = () => {}; G.cx = 0; G.cy = 0;
    if (o.noDots) { S.rooms = []; }
    try { G.StageScene.draw(); } finally { G.drawWorld = keep.dw; G.cx = keep.cx; G.cy = keep.cy; S.rooms = keep.rooms; }
  }

  // ====================================================================
  // KIỂU B: giữ phòng nhìn ngang, thêm cửa bốn hướng
  // ====================================================================
  M.cvB = function () {
    setup({
      reg: 2, seed: 5,
      hero: { x: 196, y: 198, face: 1 },
      ents: [
        { role: 'rusher', x: 224, y: 199, hp: 0.6, cd: 9 },
        { role: 'shield', x: 292, y: 180, cd: 9 },
        { role: 'swarm', x: 268, y: 160, cd: 9 }, { role: 'swarm', x: 348, y: 206, cd: 9 },
        { role: 'archer', x: 338, y: 164, wind: 1.2 },
        { role: 'nimble', x: 140, y: 230, face: 1, cd: 9 },
      ],
      props: [{ type: 'brazier', x: 238, y: 156 }, { type: 'chest', x: 76, y: 170 }],
      zones: [
        { x: 118, y: 190, r: 20, pool: true, team: 'enemy', el: 'fire' },
        { x: 300, y: 220, r: 24, t: 3, t0: 4.2, life: 0.12 },
      ],
    });
    play({ warm: 5, move: { mx: 1 }, hits: 1, stopAt: 0.52, hp: 0.86 });
    const S = G.getRun();
    const fore = mk(480, 270);
    const room = { bgFn: (cx) => M.doorsB(cx, 'locked'), fore: fore.canvas };
    M.doorsBFore(fore, 'locked');
    const R = renderWorld(room, { w: 480, h: 270 }, 3, 2, 0);
    realHud({ noDots: true });
    M.minimap(389, 42);
    R.restore();
    return compose(R.wc, R.ov).canvas;
  };
  // Cửa của Kiểu B. Trái, phải: dùng luôn cổng sắt có sẵn trên tường bên của game.
  // Lên: một cửa vòm trên tường sau, có bậc bước lên. Xuống: miệng cầu thang ở mép trước của sàn.
  const UPX = 181, DNX = 240;
  M.doorsB = function (cx, state) {
    const K = M.K, D = U.DARK, yb = G.GY0, at = UPX;
    U.setC(cx);
    const r = (x, y, w, h, col) => { cx.fillStyle = col; cx.fillRect(x, y, w, h); };
    // khung vòm
    r(at - 24, yb - 62, 48, 62, D);
    r(at - 23, yb - 58, 46, 58, K.stone); r(at - 20, yb - 63, 40, 5, K.stone); r(at - 15, yb - 66, 30, 3, K.stone);
    r(at - 23, yb - 58, 2, 58, K.stoneL); r(at - 20, yb - 63, 40, 1, K.stoneL); r(at - 15, yb - 66, 30, 1, K.stoneL); r(at + 21, yb - 58, 2, 58, U.dim(K.stone, 0.3));
    for (let y = yb - 50; y < yb; y += 10) { r(at - 23, y, 7, 1, U.dim(K.stone, 0.4)); r(at + 16, y, 7, 1, U.dim(K.stone, 0.4)); }
    // lòng cửa
    r(at - 16, yb - 50, 32, 50, '#1a1214'); r(at - 13, yb - 55, 26, 5, '#1a1214'); r(at - 9, yb - 58, 18, 3, '#1a1214');
    for (let x = at - 14; x <= at + 12; x += 5) { r(x, yb - 56, 2, 56, K.iron); r(x, yb - 56, 1, 56, K.ironL); }
    for (const y of [yb - 42, yb - 26, yb - 10]) { r(at - 16, y, 32, 2, K.iron); r(at - 16, y, 32, 1, K.ironL); }
    r(at - 3, yb - 73, 6, 6, D); r(at - 2, yb - 72, 4, 4, '#e03a2a'); r(at - 2, yb - 72, 2, 1, '#ffb09a');
    U.padlock(at, yb - 24);
    // bậc thềm bước lên cửa
    r(at - 27, yb - 1, 54, 5, D); r(at - 26, yb - 1, 52, 4, K.stoneL); r(at - 26, yb + 2, 52, 1, U.dim(K.stone, 0.3));
    r(at - 31, yb + 4, 62, 5, D); r(at - 30, yb + 4, 60, 4, K.stone); r(at - 30, yb + 4, 60, 1, K.stoneL); r(at - 30, yb + 8, 60, 1, 'rgba(0,0,0,0.35)');
    // ổ khóa trên hai cổng bên
    U.padlock(23, 150); U.padlock(457, 150);
  };
  M.doorsBFore = function (cx, state) {
    const K = M.K, D = U.DARK, at = DNX, y = 238;
    U.setC(cx);
    const r = (x, yy, w, h, col) => { cx.fillStyle = col; cx.fillRect(x, yy, w, h); };
    // miệng cầu thang đi xuống, khoét vào mép trước của sàn
    r(at - 31, y - 3, 62, 25, D);
    r(at - 30, y - 2, 60, 3, K.stoneL); r(at - 30, y + 1, 60, 1, U.dim(K.stone, 0.3));
    r(at - 30, y + 1, 5, 20, K.stone); r(at + 25, y + 1, 5, 20, K.stone); r(at - 30, y + 1, 1, 20, K.stoneL); r(at + 29, y + 1, 1, 20, U.dim(K.stone, 0.4));
    r(at - 25, y + 2, 50, 19, '#0c0808');
    r(at - 24, y + 2, 48, 4, U.dim(K.floor, 0.1)); r(at - 24, y + 2, 48, 1, K.stoneL);
    r(at - 22, y + 7, 44, 4, U.dim(K.floor, 0.35)); r(at - 22, y + 7, 44, 1, U.dim(K.stoneL, 0.3));
    r(at - 20, y + 12, 40, 4, U.dim(K.floor, 0.58)); r(at - 20, y + 12, 40, 1, U.dim(K.stoneL, 0.55));
    r(at - 18, y + 17, 36, 3, U.dim(K.floor, 0.75));
    // song sắt đậy miệng cầu thang
    for (let x = at - 21; x <= at + 19; x += 8) { r(x - 1, y + 1, 4, 20, D); r(x, y + 1, 2, 20, K.iron); r(x, y + 1, 1, 20, K.ironL); }
    r(at - 25, y + 9, 50, 2, K.iron); r(at - 25, y + 9, 50, 1, K.ironL);
    U.padlock(at, y + 14);
    // hai trụ nhỏ có đèn đánh dấu lối xuống
    for (const px of [at - 38, at + 32]) {
      r(px - 1, y - 13, 8, 25, D); r(px, y - 12, 6, 23, K.stone); r(px, y - 12, 1, 23, K.stoneL); r(px, y - 12, 6, 2, K.stoneL);
      r(px + 1, y - 19, 4, 7, D); r(px + 2, y - 18, 2, 5, '#ff7a2a'); r(px + 2, y - 16, 2, 3, '#ffd23f');
      U.glow(px + 3, y - 15, 9, 7, '#ff9a40', 0.08, 3);
    }
  };
  // ====================================================================
  // KIỂU C: phòng rộng hơn màn hình, camera theo hero
  // ====================================================================
  // Khung nhìn gốc 320x180 phóng 4,5 lần (thay vì 480x270 phóng 3 lần) để nhân vật to gấp rưỡi Kiểu A
  // mà điểm ảnh vẫn đều. Phòng rộng khoảng hai màn hình mỗi chiều.
  M.geoC = function () {
    const g = { W: 700, H: 420, fx0: 40, fy0: 52, fx1: 640, fy1: 384, wh: 42, cap: 7, sw: 14, fw: 12 };
    g.doors = [
      { side: 'top', at: 340, state: 'locked' }, { side: 'bottom', at: 340, state: 'locked' },
      { side: 'left', at: 218, state: 'locked' }, { side: 'right', at: 218, state: 'locked' },
    ];
    g.bounds = { x0: g.fx0 + 9, x1: g.fx1 - 9, y0: g.fy0 + 8, y1: g.fy1 - 4 };
    return g;
  };
  M.cvC = function () {
    const g = M.geoC(), cam = 236;
    const room = M.buildRoom(M.themes.castle, g, 23);
    const X = (sx) => cam + sx;
    setup({
      reg: 2, w: g.W, bounds: g.bounds, seed: 5,
      hero: { x: X(140), y: 116, face: 1 },
      ents: [
        { role: 'rusher', x: X(168), y: 117, hp: 0.6, cd: 9 },
        { role: 'shield', x: X(210), y: 92, cd: 9 },
        { role: 'swarm', x: X(186), y: 72, cd: 9 }, { role: 'swarm', x: X(226), y: 162, cd: 9 },
        { role: 'archer', x: X(244), y: 120, wind: 1.2 },
        { role: 'nimble', x: X(84), y: 156, face: 1, cd: 9 },
      ],
      props: [{ type: 'brazier', x: X(148), y: 70 }, { type: 'chest', x: X(40), y: 84 }],
      zones: [
        { x: X(92), y: 110, r: 20, pool: true, team: 'enemy', el: 'fire' },
        { x: X(176), y: 154, r: 24, t: 3, t0: 4.2, life: 0.12 },
      ],
    });
    play({ warm: 5, move: { mx: 1 }, hits: 1, stopAt: 0.52, hp: 0.86 });
    const R = renderWorld(room, { w: 320, h: 180 }, 4.5, 2, cam);
    realHud({ noDots: true });
    M.minimap(389, 42);
    R.restore();
    return compose(R.wc, R.ov).canvas;
  };
  // Vẽ Kiểu A của một chủ đề, không có giao diện, trả về canvas 480x270 (đã có chữ sát thương thì bỏ qua).
  M.plainA = function (theme, o, outW) {
    o = o || {};
    const { room, T } = M.sceneA(theme, o);
    outW = outW || 1440;
    const R = renderWorld(room, { w: 480, h: 270 }, outW / 480, T.reg, 0, outW);
    if (o.after) o.after(R);
    R.restore();
    return compose(R.wc, R.ov).canvas;
  };
  M.thu = (theme) => M.plainA(theme).toDataURL('image/png');
  M.kieuA = () => M.cvA().toDataURL('image/png');
  M.kieuB = () => M.cvB().toDataURL('image/png');
  M.kieuC = () => M.cvC().toDataURL('image/png');
  M.png = (cv) => cv.toDataURL('image/png');
})();
