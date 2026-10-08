// Lối đánh riêng của từng vũ khí: chuỗi kiếm, giương cung, loạt đâm của giáo, lấy đà của búa.
// combat.js gọi sang đây qua G.moves. Mọi đòn vẫn đi qua playerHit và G.damage của combat.js,
// nên dấu ấn tiến hóa và thống kê cho trùm (hệ, đánh xa hay gần, số lần né) được ghi như cũ.
(function () {
  const G = window.G;
  const M = (G.moves = {});
  function FX(n, a, b, c, d, e) {
    if (G.noRender) return;
    const f = G.fx && G.fx[n];
    if (f) f(a, b, c, d, e);
  }

  // ---------- con số cân bằng của các lối đánh ----------
  // dur: thời gian một nhát (giây). mult: hệ số sát thương so với chỉ số vũ khí. reach, depth, len: điểm ảnh.
  G.MOVES = {
    tap: 0.16,  // giữ nút lâu hơn ngần này thì tính là "giữ", ngắn hơn là "bấm"
    hold: 0.8,  // lấy đà đầy rồi mà vẫn giữ quá ngần này giây thì đòn tự tung ra
    buffer: 0.25, // bấm sớm khi đòn trước chưa xong thì được nhớ trong ngần này giây
    sword: {
      gap: 0.45, // ngừng bấm quá lâu thì chuỗi về đầu
      chain: [
        { name: 'Chém ngang', dur: 0.3, mult: 0.9, reach: 32, depth: 20 },
        { name: 'Chém ngược', dur: 0.3, mult: 0.95, reach: 34, depth: 20 },
        { name: 'Nhát kết', dur: 0.46, mult: 1.7, reach: 40, depth: 30, push: 10, heavy: true, finish: 1 },
      ],
      glide: { name: 'Nhát lướt', win: 0.35, len: 30, t: 0.12, mult: 1.4 }, // đánh ngay sau khi Né
    },
    bow: {
      shot: { name: 'Bắn', still: 0.4, move: 0.47, mult: 1, speed: 290, range: 215 },
      charge: { name: 'Tên mạnh', time: 0.75, min: 0.3, slow: 0.55, mult0: 1.2, mult1: 3.0, speed: 340, range: 265, recover: 0.5 },
    },
    spear: {
      gap: 0.45,
      chain: [
        { name: 'Đâm', dur: 0.34, mult: 0.85, reach: 54, depth: 10 },
        { name: 'Đâm', dur: 0.3, mult: 0.85, reach: 54, depth: 10 },
        { name: 'Đâm', dur: 0.3, mult: 0.85, reach: 56, depth: 10 },
        { name: 'Quét vòng', dur: 0.5, mult: 1.5, r: 40, push: 8, heavy: true, sweep: true, finish: 1 },
      ],
      // giữ rồi thả: lao một đoạn ngắn xuyên qua quái (đòn Đặc biệt "Lao tới" thì dài hơn và làm choáng)
      charge: { name: 'Xốc tới', time: 0.5, min: 0.3, slow: 0.6, len0: 30, len1: 58, t: 0.16, mult0: 1.0, mult1: 2.2, depth: 12 },
    },
    hammer: {
      swing: { name: 'Nện', dur: 0.8, mult: 1, reach: 32, depth: 26 },
      // giữ để lấy đà 2 nấc; chưa tới nấc 1 mà thả thì chỉ là nhát thường
      charge: {
        name: 'Lấy đà', lv1: 0.5, time: 1.1, min: 0.45, slow: 0.45, recover: 0.7, ahead: 22, waveV: 200, waveDepth: 26,
        slam: [null,
          { name: 'Nện đất', mult: 1.1, r: 30, stun: 0, wave: { mult: 0.4, len: 60, stun: 0 } },
          { name: 'Nện đất mạnh', mult: 1.6, r: 38, stun: 0.7, wave: { mult: 0.6, len: 96, stun: 0.5 } }],
      },
    },
  };
  // Luật riêng của từng hệ khi vũ khí đã có nhánh hệ (hoặc đang được phủ hệ). Mọi sát thương là hệ số nhân với
  // chỉ số vũ khí, rồi nhân tiếp với k theo mốc: Mầm 0,5 / Thành hình 0,75 / Thức tỉnh 1.
  G.HE = {
    k: [0, 0.5, 0.75, 1],
    maxZones: 6, // số vệt cháy, màn khói cùng lúc trên sân
    fire: {
      blast: 0.35, blastR: 20, blastRLv: 4,   // nhát kết, đòn thả, đòn đặc biệt: nổ nhỏ lan ra
      trailR: 14, trailRLv: 2, trailLife: 1.2, trailLifeLv: 0.6, trailSrc: 0.5, trailEvery: 0.5, // vệt cháy đốt quái đi qua
      arrow: 0.25, arrowR: 20,                 // tên lửa nổ khi trúng
    },
    poison: {
      cloudR: 18, cloudRLv: 3, cloudLife: 2, cloudLifeLv: 0.6, cloudSrc: 0.8, cloudEvery: 1, // màn khói độc: quái đứng trong mỗi giây thêm 1 tầng Độc
      spreadR: 32, spread: [0, 1, 1, 2],       // quái chết khi đang trúng độc thì lây sang quái gần: 1 tầng, Thức tỉnh thì 2 tầng
      shards: [0, 1, 1, 2], shard: 0.2, shardRange: 50, shardV: 210, // tên mạnh đầy đà thêm 1 mảnh // tên độc tách thành mảnh khi trúng
    },
  };
  // Một dòng chỉ dẫn cho mỗi vũ khí, hiện khi vào ải và lần đầu đổi sang vũ khí đó.
  G.MOVE_TIPS = {
    sword: 'Kiếm: bấm Đánh liên tiếp ra chuỗi 3 nhát. Đánh ngay sau khi Né để lướt chém.',
    bow: 'Cung: bấm để bắn nhanh. Giữ Đánh để giương cung, thả ra bắn tên mạnh xuyên quái.',
    spear: 'Giáo: bấm Đánh liên tiếp để đâm rồi quét vòng. Giữ rồi thả để lao tới.',
    hammer: 'Búa: giữ Đánh để lấy đà, thả ra nện đất gây chấn động. Đủ 2 nấc thì làm choáng.',
  };
  const C = G.MOVES, HE = G.HE;

  // ---------- trạng thái đòn đánh trên người chơi (P.mv) ----------
  // Lớp vẽ nào cũng đọc được: name (tên đòn), step (nhịp trong chuỗi), chain (đã đánh mấy nhịp),
  // charge (tỉ lệ lấy đà 0..1), level (nấc lấy đà), prog (tiến độ đòn 0..1), holding (đang giữ để lấy đà).
  function st(P) {
    if (!P.mv) {
      P.mv = {
        name: '', kind: '', step: 0, chain: 0, charge: 0, level: 0, prog: 0, holding: false,
        holdT: 0, wasHeld: false, relP: false, buf: 0, pressBuf: 0, chargeT: 0, fullT: 0,
        afterDodge: 0, wasDodge: false, wid: null, cur: null, lastT: -9, gap: 0.45, dashDur: 0, tips: {}, tipWait: null,
      };
    }
    return P.mv;
  }
  M.state = st;
  function cancel(mv) { mv.holding = false; mv.charge = 0; mv.level = 0; mv.chargeT = 0; mv.fullT = 0; }
  const reachOf = (w, r) => r * (w.affix === 'reach' ? 1.15 : 1);
  // Mức hiệu ứng hệ của vũ khí: null nếu đòn đang không mang hệ. lv 1..3 theo mốc Mầm, Thành hình, Thức tỉnh.
  function heOf(P, w) {
    const el = G.activeEl(P, w);
    if (!el) return null;
    return { el, lv: w.branch === el ? Math.max(1, G.wStage(w)) : 1 };
  }
  M.heOf = heOf;

  function tip(P, mv, w, W) {
    if (mv.tips[w.type] || !G.MOVE_TIPS[w.type]) return;
    if (W.banner && !W.banner.tip) { mv.tipWait = w.type; return; } // đang có thông báo khác: chờ nó tắt
    mv.tips[w.type] = true; mv.tipWait = null;
    W.banner = { s: G.MOVE_TIPS[w.type], col: '#ffd27a', t: 5, tip: true };
  }

  // Gọi mỗi khung cho người chơi, kể cả lúc đang lăn né hay lướt: theo dõi nút Đánh được bấm, giữ, thả.
  M.input = function (P, inp, dt) {
    const mv = st(P), w = G.curW(P), W = G.getWorld();
    const held = !!(inp.atk || inp.atkP);
    mv.relP = !held && mv.wasHeld;
    if (held && !mv.wasHeld) { mv.holdT = 0; mv.pressBuf = C.buffer; }
    if (held) mv.holdT += dt;
    if (mv.relP && !mv.holding) mv.buf = C.buffer;
    mv.wasHeld = held;
    if (mv.buf > 0 && !mv.relP) mv.buf -= dt;
    if (mv.pressBuf > 0 && !held) mv.pressBuf -= dt;
    if (mv.afterDodge > 0) mv.afterDodge -= dt;
    if (P.dodgeT > 0) mv.wasDodge = true;
    else if (mv.wasDodge) { mv.wasDodge = false; mv.afterDodge = C.sword.glide.win; }
    if (P.dashOpt && !(P.dashT > 0)) P.dashOpt = null;
    if (!w) return;
    if (mv.wid !== w.id) { mv.wid = w.id; cancel(mv); mv.chain = 0; mv.buf = 0; mv.cur = null; tip(P, mv, w, W); }
    else if (mv.tipWait && !W.banner) tip(P, mv, w, W);
    // lăn né, lướt, tung đòn đặc biệt hay kỹ năng thì bỏ phần đà đang lấy
    if (mv.holding && (P.dodgeT > 0 || P.dashT > 0 || P.specT > 0 || P.castT > 0 || P.dead)) cancel(mv);
    if (mv.chain > 0 && !(P.atkT > 0) && G.time - mv.lastT > mv.gap) mv.chain = 0;
    const busy = P.atkT > 0 || P.dashT > 0;
    mv.prog = P.atkT > 0 ? 1 - P.atkT / P.atkDur : P.dashT > 0 && mv.dashDur > 0 ? G.clamp(1 - P.dashT / mv.dashDur, 0, 1) : 0;
    if (!busy && !mv.holding) { mv.name = ''; mv.kind = ''; }
  };
  // Đi chậm lại trong lúc lấy đà
  M.speed = function (P) {
    const mv = P.mv;
    if (!mv || !mv.holding) return 1;
    const cfg = C[G.curW(P).type];
    return cfg && cfg.charge ? cfg.charge.slow : 1;
  };

  function aim(P, reach, maxDy) {
    const tgt = G.cb.nearest(P, reach + 34, maxDy, false);
    if (tgt && Math.abs(tgt.x - P.x) > 3) P.face = tgt.x > P.x ? 1 : -1;
  }
  // Bắt đầu một nhát: phase > 0 là vào thẳng giữa động tác (dùng khi thả đòn đã lấy đà sẵn).
  function begin(P, w, o, dur, phase) {
    const mv = P.mv;
    P.atkDur = dur; P.atkT = dur * (1 - (phase || 0)); P.cdT = P.atkT; P.hitDone = false; P.lastAtk = G.time;
    P.comboI = o.pose || 0;
    mv.name = o.name; mv.kind = o.kind; mv.step = o.step || 0; mv.cur = o; mv.lastT = G.time + P.atkT;
    G.sfx('swing', w.type === 'hammer' ? 0.6 : 1);
  }
  function gain(P, w, n) {
    if (n <= 0) return;
    P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (w.affix === 'mana' ? 1 : 0));
    G.sfx('hit');
  }
  // Đánh mọi quái trong hộp trước mặt. Trả về danh sách quái trúng đòn.
  function boxHit(P, reach, depth, mult, o) {
    const f = P.face, out = [];
    for (const e of G.targets()) {
      const dx = (e.x - P.x) * f;
      if (dx > -8 - e.r * 0.5 && dx < reach + e.r && Math.abs(e.y - P.y) <= depth / 2 + e.hr) { G.cb.playerHit(e, mult, o); out.push(e); }
    }
    G.cb.hitProps(Math.min(P.x, P.x + f * reach) - 4, Math.max(P.x, P.x + f * reach) + 4, P.y, depth / 2 + 6);
    return out;
  }
  function push(list, dx) {
    for (const e of list) if (!e.dead && !e.isBoss) e.x += dx;
  }
  function swingFx(P, w, o, extra) {
    if (G.noRender) return;
    const h = heOf(P, w);
    const info = Object.assign({ type: w.type, move: o.kind, name: o.name, step: o.step || 0, combo: o.pose || 0, reach: o.reach || 0, depth: o.depth || 0, el: h ? h.el : null, lv: h ? h.lv : 0, stage: G.wStage(w) }, extra || {});
    if (G.fx && G.fx.mvSwing) FX('mvSwing', P, info); else FX('swing', P, info);
  }

  // ---------- kiếm ----------
  function swordChain(P, w) {
    const mv = P.mv, i = mv.chain % 3, m = C.sword.chain[i];
    aim(P, reachOf(w, m.reach), 22);
    begin(P, w, { kind: 'chem', name: m.name, step: i, pose: i, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
    mv.chain = i + 1; mv.gap = C.sword.gap;
  }
  function swordGlide(P, w) {
    const mv = P.mv, g = C.sword.glide;
    mv.afterDodge = 0;
    aim(P, g.len + 20, 22);
    P.dashT = g.t; P.dashV = (g.len / g.t) * P.face; P.dashHit = []; P.dashMult = g.mult; P.dashStun = 0; P.dashOpt = { stun: 0 };
    P.atkT = g.t; P.atkDur = g.t; P.cdT = g.t + 0.08; P.hitDone = true; P.lastAtk = G.time; P.comboI = 0;
    mv.name = g.name; mv.kind = 'luot'; mv.step = 0; mv.cur = null; mv.dashDur = g.t;
    mv.chain = 1; mv.gap = C.sword.gap; mv.lastT = G.time + g.t; // nhát lướt thay cho nhát đầu của chuỗi
    G.sfx('swing', 1.3);
    swingFx(P, w, { kind: 'luot', name: g.name, reach: g.len + 14, depth: 24 });
  }

  // ---------- cung ----------
  function shoot(P, w, o) {
    const W = G.getWorld(), h = heOf(P, w);
    const col = h ? G.EL[h.el].col : '#f1ead9';
    const tgt = G.cb.nearest(P, o.range + 10, 44, true);
    let vy = 0;
    if (tgt) vy = G.clamp(((tgt.y - P.y) / Math.max(20, Math.abs(tgt.x - P.x))) * o.speed, -90, 90);
    W.projs.push({ team: 'player', kind: 'arrow', x: P.x + P.face * 8, y: P.y, vx: P.face * o.speed, vy, t: o.range / o.speed, w, mult: o.mult, pierce: o.pierce || 0, big: !!o.big, col, seen: [], he: h, charged: o.charged || 0 });
  }
  function bowTap(P, w) {
    const s = C.bow.shot;
    aim(P, s.range, 44);
    // đứng yên thì giương nhanh hơn một chút so với vừa chạy vừa bắn
    begin(P, w, { kind: 'ban', name: s.name, pose: 0, arrow: { mult: s.mult, speed: s.speed, range: s.range } }, P.moving ? s.move : s.still);
  }
  function bowRelease(P, w, c) {
    const ch = C.bow.charge, full = c >= 1;
    aim(P, ch.range, 44);
    const o = { kind: 'banManh', name: ch.name, pose: 2, charge: c };
    begin(P, w, o, ch.recover, 0.43); // dây cung đã căng sẵn: buông tên ngay
    P.hitDone = true;
    shoot(P, w, { mult: ch.mult0 + (ch.mult1 - ch.mult0) * c, speed: ch.speed, range: ch.range * (0.7 + 0.3 * c), pierce: full ? 4 : c > 0.6 ? 2 : 1, big: true, charged: c });
    swingFx(P, w, o, { charge: c });
  }

  // ---------- giáo ----------
  function spearTap(P, w) {
    const mv = P.mv, i = mv.chain % 4, m = C.spear.chain[i];
    aim(P, reachOf(w, m.reach || m.r), 22);
    if (m.sweep) begin(P, w, { kind: 'quet', name: m.name, step: i, pose: 3, m, reach: reachOf(w, m.r) }, m.dur);
    else begin(P, w, { kind: 'dam', name: m.name, step: i, pose: i, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
    mv.chain = i + 1; mv.gap = C.spear.gap;
  }
  function spearLunge(P, w, c) {
    const mv = P.mv, ch = C.spear.charge;
    aim(P, ch.len1 + 10, 22);
    const len = ch.len0 + (ch.len1 - ch.len0) * c;
    P.dashT = ch.t; P.dashV = (len / ch.t) * P.face; P.dashHit = []; P.dashMult = ch.mult0 + (ch.mult1 - ch.mult0) * c; P.dashStun = 0;
    P.dashOpt = { stun: 0, heavy: c >= 1 };
    P.inv = Math.max(P.inv, ch.t); // đang xuyên qua quái thì không dính đòn
    P.atkT = ch.t; P.atkDur = ch.t; P.cdT = ch.t + 0.2; P.hitDone = true; P.lastAtk = G.time; P.comboI = 2;
    mv.name = ch.name; mv.kind = 'xoc'; mv.step = 0; mv.cur = null; mv.dashDur = ch.t; mv.chain = 0; mv.lastT = G.time + ch.t;
    G.sfx('swing', 1.4);
    swingFx(P, w, { kind: 'xoc', name: ch.name, reach: len, depth: ch.depth }, { charge: c });
    if (c >= 0.5) finish(P, w, { x: P.x, y: P.y, dir: P.face, power: 0.5 + 0.5 * c, line: len });
  }

  // ---------- búa ----------
  function hammerTap(P, w) {
    const m = C.hammer.swing;
    aim(P, reachOf(w, m.reach), 22);
    begin(P, w, { kind: 'nen', name: m.name, pose: 0, m, reach: reachOf(w, m.reach), depth: m.depth }, m.dur);
  }
  function hammerRelease(P, w, c, lv) {
    const ch = C.hammer.charge, sl = ch.slam[lv];
    if (!sl) { hammerTap(P, w); return; }
    aim(P, 40, 22);
    begin(P, w, { kind: 'nenDat', name: sl.name, pose: 2, level: lv, sl }, ch.recover, 0.36); // búa đã giơ sẵn: nện xuống ngay
  }
  function hammerSlam(P, w, o) {
    const W = G.getWorld(), ch = C.hammer.charge, sl = o.sl, f = P.face;
    const r = reachOf(w, sl.r), cx = G.clamp(P.x + f * ch.ahead, W.x0, W.x1), cy = P.y;
    let n = 0;
    for (const e of G.targets()) {
      if (Math.hypot(e.x - cx, (e.y - cy) * 1.5) < r + e.r) { G.cb.playerHit(e, sl.mult, { w, stun: sl.stun, heavy: true, dir: e.x >= P.x ? 1 : -1 }); n++; }
    }
    G.cb.hitProps(cx - r, cx + r, cy, r * 0.66);
    // sóng chấn động chạy trên mặt đất theo hướng đánh
    (W.mvWaves || (W.mvWaves = [])).push({ x: cx, y: cy, dir: f, left: sl.wave.len, v: ch.waveV, depth: ch.waveDepth, mult: sl.wave.mult, stun: sl.wave.stun, w, seen: [], level: o.level, he: heOf(P, w) });
    W.shake = Math.max(W.shake, o.level >= 2 ? 0.3 : 0.16);
    G.sfx('boom', o.level >= 2 ? 1.5 : 1.9);
    swingFx(P, w, o, { level: o.level, x: cx, y: cy, r });
    finish(P, w, { x: cx, y: cy, dir: f, power: o.level >= 2 ? 1.3 : 0.8 });
    gain(P, w, n);
  }

  // ---------- nút Đánh ----------
  const TAPS = { bow: bowTap, spear: spearTap, hammer: hammerTap };
  const RELEASES = { bow: bowRelease, spear: spearLunge, hammer: hammerRelease };
  function levelOf(ch, t) {
    if (ch.lv1 != null) return t >= ch.time ? 2 : t >= ch.lv1 ? 1 : 0;
    return t >= ch.time ? 1 : 0;
  }
  function release(P, w, cfg) {
    const mv = P.mv, c = mv.charge, lv = mv.level;
    cancel(mv);
    if (c < cfg.charge.min) { TAPS[w.type](P, w); return; }
    RELEASES[w.type](P, w, c, lv);
  }
  // Gọi khi người chơi đang rảnh tay (không né, không lướt, không vừa bấm đòn đặc biệt hay kỹ năng).
  M.act = function (P, inp, dt) {
    const mv = st(P), w = G.curW(P), cfg = C[w.type];
    const held = mv.wasHeld, can = P.cdT <= 0;
    if (!cfg) { // vũ khí chưa có lối đánh riêng: đánh kiểu cũ
      if (held && can) { mv.cur = null; G.cb.startAttack(P); }
      return;
    }
    if (!cfg.charge) { // kiếm: bấm hoặc giữ đều ra chuỗi
      if ((held || mv.pressBuf > 0) && can) {
        mv.pressBuf = 0;
        if (mv.afterDodge > 0 && cfg.glide) swordGlide(P, w); else swordChain(P, w);
      }
      return;
    }
    const ch = cfg.charge;
    if (mv.holding) {
      if (!held) { release(P, w, cfg); return; }
      const lv0 = mv.level;
      mv.chargeT += dt;
      mv.charge = Math.min(1, mv.chargeT / ch.time);
      mv.level = levelOf(ch, mv.chargeT);
      if (mv.level > lv0) { G.sfx('pick', 0.9 + 0.3 * mv.level); FX('mvCharge', P, mv.level); }
      if (mv.charge >= 1) { mv.fullT += dt; if (mv.fullT >= C.hold) release(P, w, cfg); }
      return;
    }
    if (held && mv.holdT >= C.tap && can) {
      mv.holding = true; mv.chargeT = 0; mv.charge = 0; mv.level = 0; mv.fullT = 0; mv.buf = 0;
      mv.name = ch.name; mv.kind = 'layDa';
    } else if (mv.buf > 0 && can) {
      mv.buf = 0;
      TAPS[w.type](P, w);
    }
  };

  // Thời điểm đòn chạm (gần giữa động tác): gây sát thương theo đòn đang ra.
  M.hit = function (P) {
    const mv = st(P), o = mv.cur, w = G.curW(P);
    if (!o) { G.cb.doHit(P); return; }
    P.hitDone = true;
    if (o.kind === 'chem') {
      const m = o.m;
      const list = boxHit(P, o.reach, o.depth, m.mult, { w, heavy: !!m.heavy });
      if (m.push) push(list, P.face * m.push);
      swingFx(P, w, o);
      if (m.finish) finish(P, w, { x: P.x + P.face * o.reach * 0.6, y: P.y, dir: P.face, power: 1 });
      gain(P, w, list.length);
    } else if (o.kind === 'ban') {
      shoot(P, w, o.arrow);
    } else if (o.kind === 'dam' || o.kind === 'nen') {
      const list = boxHit(P, o.reach, o.depth, o.m.mult, { w });
      swingFx(P, w, o);
      if (o.kind === 'nen') G.getWorld().shake = Math.max(G.getWorld().shake, 0.08);
      gain(P, w, list.length);
    } else if (o.kind === 'quet') {
      // quét một vòng quanh người: trúng cả quái sau lưng, hất nhẹ ra ngoài
      const m = o.m, list = [];
      for (const e of G.targets()) {
        if (Math.hypot(e.x - P.x, (e.y - P.y) * 1.5) < o.reach + e.r) { G.cb.playerHit(e, m.mult, { w, heavy: true, dir: e.x >= P.x ? 1 : -1 }); list.push(e); }
      }
      G.cb.hitProps(P.x - o.reach, P.x + o.reach, P.y, o.reach * 0.66);
      for (const e of list) if (!e.dead && !e.isBoss) e.x += (e.x >= P.x ? 1 : -1) * m.push;
      swingFx(P, w, o);
      finish(P, w, { x: P.x + P.face * 10, y: P.y, dir: P.face, power: 1, round: true });
      gain(P, w, list.length);
    } else if (o.kind === 'nenDat') {
      hammerSlam(P, w, o);
    }
  };

  // ---------- luật riêng của từng hệ ----------
  // Sát thương phụ của hệ: vẫn qua G.damage nên được tính vào thống kê hệ và đánh xa/gần của trùm, và kết liễu vẫn cho dấu ấn.
  function heDamage(e, amt, el, w, ranged) {
    if (!e.dead) G.damage(e, amt, { el, src: 'hit', ranged: !!ranged, w });
  }
  function around(x, y, r, fn, skip) {
    for (const e of G.targets()) if (e !== skip && Math.hypot(e.x - x, (e.y - y) * 1.5) < r + e.r) fn(e);
  }
  // Vũng nằm lại trên đất (vệt cháy, màn khói độc): dùng đúng loại vũng "pool" sẵn có của combat.js.
  function heZone(W, x, y, r, life, el, src, every, extra) {
    const mine = W.zones.filter((z) => z.he);
    if (mine.length >= HE.maxZones) mine[0].dead = true;
    const z = Object.assign({ shape: 'circle', x: G.clamp(x, W.x0, W.x1), y: G.clamp(y, W.y0, W.y1), r, t: 0, pool: true, team: 'player', el, life, tick: 0.2, every, src, he: true }, extra || {});
    W.zones.push(z);
    return z;
  }
  // Điểm nhấn của hệ ở nhát kết chuỗi, đòn giữ rồi thả và đòn đặc biệt.
  // o: { x, y, dir, power, line (độ dài đường lao), round (toả quanh người), ranged }
  function finish(P, w, o) {
    const h = heOf(P, w);
    if (!h) return;
    const W = G.getWorld(), D = G.pDamage(P, w), k = HE.k[h.lv] * (o.power || 1);
    const info = { x: o.x, y: o.y, dir: o.dir, power: o.power || 1, line: o.line || 0, round: !!o.round, r: 0, pts: [] };
    if (h.el === 'fire') {
      // nổ nhỏ lan ra, rồi để lại vệt cháy trên đất
      const F = HE.fire, r = F.blastR + F.blastRLv * h.lv, tr = F.trailR + F.trailRLv * h.lv, life = F.trailLife + F.trailLifeLv * h.lv;
      info.r = r;
      if (o.line) {
        const n = Math.max(2, Math.round(o.line / 24));
        for (let i = 0; i < n; i++) {
          const x = o.x + o.dir * ((i + 0.5) * o.line) / n;
          around(x, o.y, tr, (e) => { if (!info.hit || !info.hit.includes(e)) { (info.hit || (info.hit = [])).push(e); heDamage(e, D * F.blast * k, 'fire', w, o.ranged); } });
          heZone(W, x, o.y, tr - 2, life, 'fire', D * F.trailSrc, F.trailEvery);
          info.pts.push(x);
        }
      } else {
        around(o.x, o.y, r, (e) => heDamage(e, D * F.blast * k, 'fire', w, o.ranged));
        heZone(W, o.x, o.y, tr, life, 'fire', D * F.trailSrc, F.trailEvery);
      }
    }
    else if (h.el === 'poison') {
      // để lại màn khói độc lơ lửng; đường lao thì rải hai đám
      const Q = HE.poison, r = Q.cloudR + Q.cloudRLv * h.lv, life = (Q.cloudLife + Q.cloudLifeLv * h.lv) * Math.min(1.2, 0.7 + 0.3 * (o.power || 1));
      info.r = r;
      if (o.line) {
        for (const u of [0.35, 0.85]) { const x = o.x + o.dir * o.line * u; heZone(W, x, o.y, r - 3, life, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true }); info.pts.push(x); }
      } else heZone(W, o.x, o.y, r, life, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true });
    }
    FX('heFinish', h.el, h.lv, info);
  }
  M.finish = finish;

  M.onHit = function (e, d, el, o) {};
  M.onKill = function (e, o, w) {
    const W = G.getWorld(), P = W.P;
    if (!w || e.illusion) return;
    const h = heOf(P, w);
    if (!h) return;
    if (h.el === 'poison' && e.st.poisonN > 0) {
      // chết khi đang trúng độc: độc lây sang quái đứng gần
      const n = Math.min(e.st.poisonN, HE.poison.spread[h.lv]), src = e.st.poisonDmg / 0.06, got = [];
      around(e.x, e.y, HE.poison.spreadR, (t) => { got.push(t); }, e);
      for (const t of got) G.applyStatus(t, 'poison', src, n);
      if (got.length) FX('heSpread', e, got);
    }
  };
  // Tên của người chơi vừa trúng một con quái
  M.arrowHit = function (o, e) {
    const h = o.he;
    if (!h || o.shard) return;
    const W = G.getWorld(), P = W.P, D = G.pDamage(P, o.w), k = HE.k[h.lv];
    if (h.el === 'fire') {
      // tên lửa nổ khi trúng; tên mạnh đầy đà thì nổ to và để lại vệt cháy
      const F = HE.fire, c = o.charged || 0, r = F.arrowR + (c >= 1 ? 8 : 0);
      around(e.x, e.y, r, (t) => heDamage(t, D * F.arrow * k * (1 + c), 'fire', o.w, true), e);
      heDamage(e, D * F.arrow * k * (1 + c) * 0.5, 'fire', o.w, true);
      if (c >= 1 && !o.heTrail) { o.heTrail = true; heZone(W, e.x, e.y, F.trailR + F.trailRLv * h.lv, F.trailLife + F.trailLifeLv * h.lv, 'fire', D * F.trailSrc, F.trailEvery); }
      FX('heArrow', 'fire', h.lv, { x: e.x, y: e.y, r, big: c >= 1, dir: o.vx < 0 ? -1 : 1 });
    } else if (h.el === 'poison') {
      // tên độc tách thành mảnh khi trúng con quái đầu tiên
      if (o.split) return;
      o.split = true;
      const Q = HE.poison, c = o.charged || 0, n = Q.shards[h.lv] + (c >= 1 ? 1 : 0), dir = o.vx < 0 ? -1 : 1;
      for (let i = 0; i < n; i++) {
        // mảnh độc bay chéo ra sau lưng con quái vừa trúng; chỉ gây sát thương Độc, không tính là một đòn đánh mới
        const a = n === 1 ? ((W.mvFlip = !W.mvFlip) ? 0.42 : -0.42) : n === 3 ? (i - 1) * 0.5 : (i ? 0.42 : -0.42);
        (W.mvShards || (W.mvShards = [])).push({ x: e.x + dir * 4, y: e.y, vx: dir * Q.shardV * Math.cos(a), vy: Q.shardV * Math.sin(a) * 0.7, left: Q.shardRange, w: o.w, dmg: D * Q.shard * k * (1 + 0.6 * c), skip: e, he: h });
      }
      if (c >= 1) heZone(W, e.x, e.y, Q.cloudR + Q.cloudRLv * h.lv, Q.cloudLife, 'poison', D * Q.cloudSrc, Q.cloudEvery, { cloud: true });
      FX('heArrow', 'poison', h.lv, { x: e.x, y: e.y, r: 16, big: c >= 1, dir });
    }
  };
  // Phần riêng theo hệ của đòn đặc biệt (gọi sau khi combat.js đã tung đòn)
  M.special = function (P, w) {
    const mv = st(P), W = G.getWorld();
    cancel(mv); mv.chain = 0;
    if (!heOf(P, w)) return;
    if (w.type === 'sword' || w.type === 'spear') {
      const len = Math.abs(P.dashV) * P.dashT, end = G.clamp(P.x + P.face * len, W.x0, W.x1);
      finish(P, w, { x: P.x, y: P.y, dir: P.face, power: 1.2, line: Math.max(20, Math.abs(end - P.x)) });
    } else if (w.type === 'hammer') {
      finish(P, w, { x: P.x, y: P.y, dir: P.face, power: 1.5, round: true });
    } else {
      // mưa tên: điểm nhấn của hệ rơi xuống khi trận mưa sắp dứt
      const z = W.zones[W.zones.length - 1];
      if (z && z.rain) (W.mvTimers || (W.mvTimers = [])).push({ t: 0.8, fn: () => finish(P, w, { x: z.x, y: z.y, dir: P.face, power: 1.3, ranged: true, round: true }) });
    }
  };
  M.update = function (W, dt) {
    const ts = W.mvTimers;
    if (ts && ts.length) {
      for (const q of ts) { q.t -= dt; if (q.t <= 0 && !W.over) q.fn(); }
      W.mvTimers = ts.filter((q) => q.t > 0);
    }
    const sh = W.mvShards;
    if (sh && sh.length) {
      for (const q of sh) {
        q.x += q.vx * dt; q.y += q.vy * dt; q.left -= Math.hypot(q.vx, q.vy) * dt;
        for (const e of G.targets()) {
          if (e !== q.skip && Math.abs(e.x - q.x) < e.r + 3 && Math.abs(e.y - q.y) < e.hr + 6) { heDamage(e, q.dmg, 'poison', q.w, true); FX('heArrow', 'poison', 1, { x: e.x, y: e.y, r: 8, big: false, dir: q.vx < 0 ? -1 : 1, small: true }); q.left = 0; break; }
        }
        if (q.x < W.x0 - 10 || q.x > W.x1 + 10) q.left = 0;
      }
      W.mvShards = sh.filter((q) => q.left > 0);
    }
    const ws = W.mvWaves;
    if (!ws || !ws.length) return;
    for (const z of ws) {
      const x0 = z.x, d = z.v * dt;
      z.x += z.dir * d; z.left -= d;
      const a = Math.min(x0, z.x), b = Math.max(x0, z.x);
      for (const e of G.targets()) {
        if (z.seen.includes(e)) continue;
        if (e.x >= a - e.r - 4 && e.x <= b + e.r + 4 && Math.abs(e.y - z.y) <= z.depth / 2 + e.hr) {
          z.seen.push(e);
          G.cb.playerHit(e, z.mult, { w: z.w, stun: z.stun, dir: z.dir });
        }
      }
      G.cb.hitProps(a - 4, b + 4, z.y, z.depth / 2 + 4);
      if (z.he && z.level >= 2) {
        // sóng nấc 2 của búa mang hệ: cứ 30 điểm ảnh để lại một dấu của hệ trên đường đi
        z.heD = (z.heD || 0) + d;
        if (z.heD >= 30) { z.heD = 0; finish(W.P, z.w, { x: z.x, y: z.y, dir: z.dir, power: 0.5 }); }
      }
      if (z.x <= W.x0 || z.x >= W.x1) z.left = 0;
    }
    W.mvWaves = ws.filter((z) => z.left > 0);
  };
})();
