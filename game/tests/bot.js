// Bot chơi thử tự động, chỉ dùng khi kiểm tra. Không được nạp trong game thật.
(function () {
  const G = window.G;
  G.botCfg = { chest: 'smart', props: true, swapOnResist: true, fountain: 'auto', explore: false, react: 0.2, missProj: 0.25, side: true }; // explore: thử cả rương đồ, thương nhân, bàn thờ; side: ghé cả phòng phụ
  // Phòng kế tiếp nên tới: phòng chưa vào gần nhất, Suối hồi để sau cùng, hết phòng thì tới Trùm. Trả về hướng cửa cần đi.
  G.botNextDoor = function (S) {
    const M = G.mapgen, map = S.map, cur = S.idx, cfg = G.botCfg;
    const pass = (a, b) => !M.isGate(map, a, b) || M.gateOpen(map, S.cleared);
    let best = null, bc = 1e9;
    for (const o of map.rooms) {
      if (S.seen[o.id] || o.type === 'boss') continue;
      if (!cfg.side && !o.main) continue;
      const p = M.path(map, cur, o.id, pass);
      if (!p) continue;
      const cost = p.length + (o.type === 'fountain' ? 50 : 0);
      if (cost < bc) { bc = cost; best = p; }
    }
    if (!best) best = M.path(map, cur, map.boss, pass);
    return best && best.length > 1 ? M.dirTo(map, cur, best[1]) : null;
  };
  function away(P, z, W) {
    if (z.shape !== 'circle' && z.shape !== 'rect' && G.zoneEscape) return G.zoneEscape(z, P); // đường thẳng, quạt, vành khăn của quái mới
    if (z.shape === 'circle') {
      let dx = P.x - z.x, dy = P.y - z.y;
      if (Math.abs(dx) + Math.abs(dy) < 1) { dx = 1; dy = 0; }
      const l = Math.hypot(dx, dy);
      return [dx / l, dy / l];
    }
    // vùng chữ nhật: thoát theo phía gần hơn mà còn chỗ đứng trong sân
    const up = P.y - z.y, down = z.y + z.h - P.y;
    const canUp = z.y - 9 >= W.y0, canDown = z.y + z.h + 9 <= W.y1;
    if (canUp && (!canDown || up <= down)) return [0, -1];
    if (canDown) return [0, 1];
    return [P.x > z.x + z.w / 2 ? 1 : -1, 0];
  }
  // Lối đánh riêng của từng vũ khí (js/moves.js): kiếm thì giữ nút; cung, giáo, búa thì bấm theo nhịp,
  // và giữ để lấy đà khi có từ hai quái trở lên nằm trong tầm đòn mạnh (hoặc quái còn ở xa đối với cung).
  function press(S, P, w, inp, tg) {
    const mv = P.mv, cfg = G.MOVES && G.MOVES[w.type];
    if (!cfg || !cfg.charge) { S.botHold = false; return; }
    // Đang lấy đà mà quái còn ở gần thì giữ tiếp cho tới khi đủ đà (không buông giữa chừng chỉ vì quái vừa nhích khỏi tầm đòn thường).
    if (w.type !== 'bow' && mv && mv.holding && S.botHold && tg.some((e) => Math.hypot(e.x - P.x, (e.y - P.y) * 1.5) < 80)) inp.keep = true; // (cung thì không: đứng giương cung giữa đám quái chỉ thiệt)
    if (!inp.atk) { if (!(mv && mv.holding && S.botHold && inp.keep)) S.botHold = false; if (!S.botHold) return; }
    if (!S.botHold && mv && !mv.holding && G.time - (S.botDecT || 0) > 0.35) {
      S.botDecT = G.time;
      let n = 0, far = 1e9;
      for (const e of tg) {
        const dx = (e.x - P.x) * P.face, dy = Math.abs(e.y - P.y);
        far = Math.min(far, Math.abs(e.x - P.x));
        if (w.type === 'bow' && dx > 10 && dx < 240 && dy < 16) n++;
        if (w.type === 'spear' && dx > 0 && dx < 80 && dy < 14) n++;
        if (w.type === 'hammer' && Math.hypot(e.x - P.x, dy * 1.5) < 60) n++;
      }
      const windup = W_near(S, P);
      if (w.type === 'bow') S.botHold = (n >= 2 || far > 130) && G.rnd() < 0.7;
      else S.botHold = n >= 2 && !windup && G.rnd() < 0.6;
    }
    if (S.botHold) {
      if (mv && mv.holding && mv.charge >= 1) { inp.atk = false; S.botHold = false; } else inp.atk = true;
    } else { S.botTap = !S.botTap; inp.atk = S.botTap; }
  }
  function W_near(S, P) {
    for (const e of S.W.ents) if (e.wind > 0 && Math.abs(e.x - P.x) < 34 && Math.abs(e.y - P.y) < 14) return true;
    return false;
  }
  G.botInput = function (S) {
    const W = S.W, P = S.P, cfg = G.botCfg;
    const inp = { mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false };
    const w = G.curW(P), T = G.WTYPES[w.type];
    if (P.hp < P.maxhp * 0.35 && P.potions > 0) inp.potionP = true;
    // né vùng nguy hiểm
    let danger = null;
    for (const z of W.zones) {
      if (z.team === 'player' || z.team === 'fx') continue;
      if (z.wave) {
        if (z.x > P.x - 10 && z.x - P.x < 150) {
          const gy = (z.g0 + z.g1) / 2;
          if (Math.abs(P.y - gy) > 8) { inp.my = P.y < gy ? 1 : -1; return inp; }
        }
        continue;
      }
      if (z.wall) {
        // tường nước chạy: đi ngang về phía khe trước khi tường tới
        const c = Math.cos(z.ang), s = Math.sin(z.ang), dx = P.x - z.x, dy = P.y - z.y, al = dx * c + dy * s, ac = -dx * s + dy * c;
        if (al - z.s > -6 && al - z.s < 110 && Math.abs(ac - z.g) > z.gw - 8) {
          if (z.botAt == null) z.botAt = G.time;
          if (G.time - z.botAt < cfg.react) continue;
          const k = z.g > ac ? 1 : -1;
          inp.mx = -s * k; inp.my = c * k;
          return inp;
        }
        continue;
      }
      const pad = { shape: z.shape, x: z.x, y: z.y, r: (z.r || 0) + 8, w: z.w, h: (z.h || 0) + 12 };
      if (z.shape === 'rect') { pad.y = z.y - 6; }
      if (z.shape === 'circle' || z.shape === 'rect' ? G.inZone(pad, P) : G.inZone(z, P, 8)) {
        // phản xạ của người thường: khoảng 0,2 giây sau khi thấy mình đứng trong vùng đỏ mới bắt đầu chạy
        if (z.botAt == null) z.botAt = G.time;
        if (G.time - z.botAt < cfg.react) continue;
        danger = z; break;
      }
    }
    if (danger) {
      const d = away(P, danger, W);
      inp.mx = d[0]; inp.my = d[1];
      if (danger.t < 0.3 && danger.t > 0 && P.dodgeCd <= 0 && G.rnd() < 0.5) inp.dodgeP = true;
      return inp;
    }
    // né đạn của quái: lăn xuyên qua nếu kịp, không thì bước ngang
    for (const o of W.projs) {
      if (o.team !== 'enemy') continue;
      if (o.botMiss == null) o.botMiss = G.rnd() < cfg.missProj; // đôi khi không kịp để ý viên đạn
      if (o.botMiss) continue;
      const dx = o.x - P.x, dy = o.y - P.y, d = Math.hypot(dx, dy);
      if (d < 34) {
        if (P.dodgeCd <= 0 && d < 22) { inp.dodgeP = true; inp.mx = Math.sign(dx) || 1; inp.my = 0; return inp; }
        inp.my = dy > 0 ? -1 : 1; inp.mx = -Math.sign(dx) * 0.5;
        return inp;
      }
    }
    const tg = G.targets();
    // ra khỏi phòng hoặc tương tác
    if (!tg.length) {
      let goal = null;
      for (const pr of W.props) {
        if (!pr.act || pr.used) continue;
        if (pr.act === 'stash' || pr.act === 'merchant' || pr.act === 'altar') { if (!cfg.explore || pr.botSeen) continue; }
        if (pr.act === 'fountain') {
          if (G.fountainLocked && G.fountainLocked()) continue; // suối còn khóa (chưa dọn đủ 3 phòng quái)
          // suối chỉ dùng một lần: để dành tới lúc sắp vào Trùm (ở Kiểu B có thể đi ngang qua suối từ sớm)
          if (S.map.rooms.some((o) => !S.seen[o.id] && o.type !== 'boss' && (cfg.side || o.main))) continue;
          const want = cfg.fountain === 'auto' ? (P.hp < P.maxhp * 0.7 ? 'hp' : 'mana') : cfg.fountain;
          if (pr.kind !== want) continue;
        }
        goal = pr; break;
      }
      if (goal) {
        const dx = goal.x - P.x, dy = goal.y - P.y;
        if (Math.hypot(dx, dy * 1.3) < 20) { inp.atkP = true; goal.botSeen = true; }
        else { inp.mx = Math.sign(dx) * Math.min(1, Math.abs(dx) / 6); inp.my = Math.sign(dy) * Math.min(1, Math.abs(dy) / 6); }
        return inp;
      }
      // phòng đã dọn: đi tới cửa dẫn sang phòng cần tới rồi đẩy vào cửa
      if (W.cleared && W.type !== 'boss') {
        const dir = G.botNextDoor(S);
        if (dir) {
          const q = G.roomArt.doorPos(W.geo, dir), v = G.mapgen.DIRS[dir];
          const dx = q.x - P.x, dy = q.y - P.y;
          const off = v[0] ? Math.abs(dy) : Math.abs(dx); // lệch khỏi trục cửa
          if (off > 5) { inp.mx = v[0] ? 0.4 * v[0] : Math.sign(dx); inp.my = v[1] ? 0.4 * v[1] : Math.sign(dy); }
          else { inp.mx = v[0]; inp.my = v[1]; }
        }
      }
      return inp;
    }
    // chọn mục tiêu gần nhất
    let t = null, bd = 1e9;
    // quái gai đang dựng gai: người chơi bình thường không chém vào (bị phản đòn), chọn con khác hoặc đứng chờ
    const spiky = (e) => e.spikeUp > 0 && !T.ranged;
    for (const e of tg) { const d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y) * 1.5 - e.r + (spiky(e) ? 400 : 0); if (d < bd) { bd = d; t = e; } }
    if (t && spiky(t)) {
      const dx0 = P.x - t.x, dy0 = P.y - t.y, l0 = Math.hypot(dx0, dy0) || 1;
      if (l0 < 70) { inp.mx = dx0 / l0; inp.my = dy0 / l0; }
      return inp;
    }
    // dùng đồ vật mang hệ nếu có quái đứng gần nó
    if (cfg.props) {
      for (const pr of W.props) {
        if (!pr.env || pr.used) continue;
        const nearby = tg.filter((e) => Math.hypot(e.x - pr.x, (e.y - pr.y) * 1.5) < 44).length;
        if (nearby >= 1 && Math.hypot(pr.x - P.x, pr.y - P.y) < 150) { t = { x: pr.x, y: pr.y, r: 4, hr: 4, prop: true }; break; }
      }
    }
    // đổi vũ khí khi trùm kháng hệ đang dùng
    const b = W.boss;
    if (cfg.swapOnResist && b && P.weapons.length > 1 && P.swapCd <= 0) {
      const el = G.activeEl(P, w), o = P.weapons[1 - P.cur], oel = G.activeEl(P, o);
      const res = (e) => e && b.layers.some((l) => l.type === 'resist' && l.el === e);
      if ((res(el) && !res(oel)) || (oel && b.weak.includes(oel) && !b.weak.includes(el))) inp.swapP = true;
    }
    if (cfg.prefer && !inp.swapP && P.swapCd <= 0 && P.weapons.length > 1 && w.type !== cfg.prefer && P.weapons[1 - P.cur].type === cfg.prefer && !(b && b.layers.some((l) => l.type === 'resist' && l.el === G.activeEl(P, P.weapons[1 - P.cur])))) inp.swapP = true;
    const dx = t.x - P.x, dy = t.y - P.y, ad = Math.abs(dx);
    if (T.ranged) {
      const want = Math.min(120, (W.x1 - W.x0) * 0.4); // phòng nhỏ thì đứng gần hơn, không chạy mãi về phía tường
      // tên ngắm chéo được (G.MOVES.bow.aim): chỉ cần quái nằm trong góc ngắm là bắn, lệch nhiều mới phải đi dọc cho thẳng hàng
      const aimA = (G.MOVES && G.MOVES.bow && G.MOVES.bow.aim) || { dy: 30, slope: 0.3 };
      const okDy = Math.min(aimA.dy - 6, Math.max(10, ad * aimA.slope * 0.9));
      if (Math.abs(dy) > Math.max(8, okDy * 0.7)) inp.my = Math.sign(dy);
      if (ad < want - 30) inp.mx = -Math.sign(dx); else if (ad > want + 60) inp.mx = Math.sign(dx);
      if (Math.abs(dy) < okDy) inp.atk = true;
    } else {
      const reach = T.reach * 0.75 + t.r;
      if (ad > reach) inp.mx = Math.sign(dx);
      else if (ad < 6) inp.mx = -Math.sign(dx || 1);
      const dep = T.depth / 2 + t.hr - 3;
      if (Math.abs(dy) > dep) inp.my = Math.sign(dy);
      if (ad <= reach + 6 && Math.abs(dy) <= dep + 2) inp.atk = true;
    }
    // quái nhanh nhẹn sắp lao tới: bước ngang ra khỏi đường lao (phản xạ chậm khoảng 0,25 giây)
    for (const e of W.ents) {
      if (e.role === 'nimble' && ((e.wind > 0 && e.wind < 0.15) || e.lunge > 0) && Math.abs(e.y - P.y) < 13 && Math.abs(e.x - P.x) < 75) {
        inp.my = P.y - e.y > 0 ? 1 : -1;
        if (P.y > W.y1 - 12) inp.my = -1; else if (P.y < W.y0 + 12) inp.my = 1;
        inp.atk = false;
        break;
      }
    }
    // né khi quái sắp ra đòn ở gần
    if (P.dodgeCd <= 0) {
      for (const e of W.ents) {
        if (e.wind > 0 && e.wind < 0.2 && e.role !== 'archer' && Math.abs(e.x - P.x) < 30 && Math.abs(e.y - P.y) < 14 && G.rnd() < 0.5) { inp.dodgeP = true; inp.my = P.y > (W.y0 + W.y1) / 2 ? -1 : 1; inp.mx = 0; inp.atk = false; break; }
      }
    }
    if (!t.prop && P.mana >= P.specCost && P.specCd <= 0 && (T.ranged || ad < 60) && G.rnd() < 0.2) { inp.specialP = true; }
    else if (!t.prop && P.mana >= (G.chuong ? G.chuong.cost(P) : 40) + P.specCost && P.skillCd <= 0 && G.rnd() < 0.1) inp.skillP = true; // nút Chưởng (js/chuong.js)
    press(S, P, w, inp, tg);
    return inp;
  };
  // Xử lý các bảng chọn bằng cách giả lập một lần chạm rồi vẽ một khung.
  function tap(x, y) { G.click = { x, y }; G.ui.begin(); G.scene.draw(); G.click = null; }
  G.botRun = function (maxSec) {
    const out = { t: 0 };
    for (let s = 0; s < maxSec; s++) {
      const S = G.getRun();
      if (!S) break;
      if (S.mode === 'chest') {
        let pick = G.botCfg.chest;
        if (pick === 'smart') {
          const o = S.opts[0];
          const same = G.save.weapons.filter((w) => (w.type === 'bow') === (o.type === 'bow'));
          const best = Math.max(-1, ...same.map((w) => w.tier));
          pick = o.tier > best ? 0 : G.save.ore < 14 ? 1 : 2;
        }
        tap(72 + pick * 114 + 54, 134);
      }
      else if (S.mode === 'swap') tap(97, 218);
      else if (S.mode === 'merchant') { if (G.botCfg.explore) { tap(132, 118); tap(240, 118); } tap(127, 194); }
      else if (S.mode === 'curse') { if (G.botCfg.explore) tap(162, 182); else tap(318, 182); }
      else if (S.mode === 'result' || S.mode === 'dead') {
        const P = S.P, b = S.W.boss;
        Object.assign(out, { win: S.mode === 'result', stars: S.result.stars, room: S.idx + 1, rooms: S.rooms.length, hp: Math.round(P.hp), maxhp: P.maxhp, potions: P.potions,
          layers: (S.layers || []).map(G.layerText), bossHp: b ? Math.round(Math.max(0, b.hp) / b.maxhp * 100) : null, marks: Math.round(S.marks), lines: S.result.lines, stats: S.stats });
        break;
      }
      G.sim(60);
      out.t = s + 1;
    }
    return out;
  };
})();
