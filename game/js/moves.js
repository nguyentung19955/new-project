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
      shot: { name: 'Bắn', still: 0.42, move: 0.5, mult: 1, speed: 290, range: 215 },
      charge: { name: 'Tên mạnh', time: 0.75, min: 0.3, slow: 0.55, mult0: 1.2, mult1: 3.0, speed: 340, range: 265, recover: 0.5 },
    },
  };
  // Một dòng chỉ dẫn cho mỗi vũ khí, hiện khi vào ải và lần đầu đổi sang vũ khí đó.
  G.MOVE_TIPS = {
    sword: 'Kiếm: bấm Đánh liên tiếp ra chuỗi 3 nhát. Đánh ngay sau khi Né để lướt chém.',
    bow: 'Cung: bấm để bắn nhanh. Giữ Đánh để giương cung, thả ra bắn tên mạnh xuyên quái.',
    spear: 'Giáo: bấm Đánh liên tiếp để đâm rồi quét vòng. Giữ rồi thả để lao tới.',
    hammer: 'Búa: giữ Đánh để lấy đà, thả ra nện đất gây chấn động. Đủ 2 nấc thì làm choáng.',
  };
  const C = G.MOVES;

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
    if (W.banner) { mv.tipWait = w.type; return; }
    mv.tips[w.type] = true; mv.tipWait = null;
    W.banner = { s: G.MOVE_TIPS[w.type], col: '#ffd27a', t: 5 };
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

  // ---------- nút Đánh ----------
  const TAPS = { bow: bowTap };
  const RELEASES = { bow: bowRelease };
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
      gain(P, w, list.length);
    } else if (o.kind === 'ban') {
      shoot(P, w, o.arrow);
    }
  };

  // ---------- các điểm nối khác từ combat.js (luật riêng của hệ sẽ nằm ở đây) ----------
  M.onHit = function (e, d, el, o) {};
  M.onKill = function (e, o, w) {};
  M.arrowHit = function (o, e) {};
  M.special = function (P, w) {};
  M.update = function (W, dt) {};
})();
