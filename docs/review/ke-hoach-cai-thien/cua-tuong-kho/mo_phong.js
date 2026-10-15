// MÔ PHỎNG CHỖ ĐỨNG (Node, không trình duyệt) — chạy trong tests/node_trang.js qua mo_phong.py.
// Vào phòng trùm của ải k, ghim trùm ở một pha (máu trùm giữ nguyên, em bé không đánh), cho em bé "đứng" ở một chỗ theo một kiểu bot,
// đo máu mất mỗi phút (% máu tối đa, em bé không chết: hồi đầy sau mỗi khung) và chiêu nào trúng / hụt.
//   kiểu 'dung': đứng yên một chỗ (bản đồ nhiệt).  kiểu 'ne': về chỗ đứng, thấy vùng đỏ thì chạy thoát / lộn né rồi quay lại.
(function () {
  const G = window.G;
  G.__moPhong = function (o) {
    const { k, sv, pts, giay, pha, kieu, pre } = o; // o.hinh: tách số trúng theo hình vùng (vòng, đường, quạt)
    if (pre) (0, eval)(pre);
    const r = Math.floor(k / 5), i = k % 5, out = [];
    for (const pt of pts) {
      G.save = G.fixSave(JSON.parse(sv)); G.save.sound = false;
      G.startStage(r, i, 0);
      const S = G.getRun(); G.gotoRoom(S.map.boss);
      const W = G.getWorld(), b = W.boss, P = S.P;
      const X = W.x0 + pt[0] * (W.x1 - W.x0), Y = W.y0 + pt[1] * (W.y1 - W.y0);
      P.x = X; P.y = Y;
      let mat = 0, lastZ = null;
      const trung = {}, ra = {};
      const iz0 = G.inZone; G.inZone = function (z, e, pad) { const v = iz0(z, e, pad); if (v && e === P) lastZ = z; return v; };
      const h0 = G.hurtPlayer;
      G.hurtPlayer = function (amt, el, src, melee) {
        const hp0 = P.hp, v = h0.apply(this, arguments);
        if (v && P.hp < hp0) { const n = ((lastZ && lastZ.skill) || (src && src.skill) || b.skillName || '?') + (lastZ && o.hinh ? ' [' + lastZ.shape + ']' : ''); const q = trung[n] || (trung[n] = [0, 0]); q[0] += hp0 - P.hp; q[1]++; mat += hp0 - P.hp; }
        lastZ = null; return v;
      };
      const ub = G.updateBoss;
      G.updateBoss = function (bb, dt) { const c0 = bb.cd; ub(bb, dt); if (bb === b && bb.cd > c0 + 0.05 && bb.skillName) ra[bb.skillName] = (ra[bb.skillName] || 0) + 1; };
      const bi0 = G.botInput; G.botCfg.react = 0.25; G.botCfg.missProj = 0.3;
      G.botInput = function (S) {
        const inp = { mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false };
        let tx = X, ty = Y;
        if (kieu === 'chay') {
          // "đứng mép" kiểu người thật: bám mép của chỗ đứng (góc: hai mép), trùm tới gần (< 110) thì chạy dọc mép ra xa trùm; vùng đỏ thì bot tự né.
          const nguy = W.zones.some((z) => z.team !== 'player' && z.team !== 'fx' && !z.ct && (z.wall || (z.dmg && z.t > 0 && G.inZone(z.shape === 'circle' ? Object.assign({}, z, { r: z.r + 8 }) : z, P, 8))));
          if (nguy) return bi0(S);
          const db = Math.hypot(b.x - P.x, b.y - P.y);
          if (!S.__muc || db < 110) {
            let best = null, bv = -1e9;
            for (const q of S.__mep || (S.__mep = (() => { const a = []; for (let x = W.x0; x <= W.x1; x += 8) { if (pt[1] === 0) a.push([x, W.y0]); if (pt[1] === 1) a.push([x, W.y1]); } for (let y = W.y0; y <= W.y1; y += 8) { if (pt[0] === 0) a.push([W.x0, y]); if (pt[0] === 1) a.push([W.x1, y]); } return a.length ? a : [[X, Y]]; })())) {
              const v = Math.min(140, Math.hypot(q[0] - b.x, q[1] - b.y)) - 0.25 * Math.hypot(q[0] - P.x, q[1] - P.y);
              if (v > bv) { bv = v; best = q; }
            }
            S.__muc = best;
          }
          tx = S.__muc[0]; ty = S.__muc[1];
        }
        if (kieu === 'bot') {
          // bot cân bằng (tests/bot.js): có vùng đỏ / tường chạy đè lên chỗ bé đứng thì để bot tự né như thường; hết nguy thì về chỗ đứng, chém khi trùm tới gần.
          const nguy = W.zones.some((z) => z.team !== 'player' && z.team !== 'fx' && !z.ct && (z.wall || (z.dmg && z.t > 0 && G.inZone(z.shape === 'circle' ? Object.assign({}, z, { r: z.r + 8 }) : z, P, 8))));
          if (nguy) return bi0(S);
          // vùng đỏ còn đè lên chỗ đứng: đứng chờ ngoài vùng, nổ xong mới quay về (không tự bước vào vùng sắp nổ)
          const H = { x: X, y: Y };
          if (W.zones.some((z) => z.team !== 'player' && z.team !== 'fx' && !z.ct && z.dmg && z.t > 0 && G.inZone(z.shape === 'circle' ? Object.assign({}, z, { r: z.r + 10 }) : z, H, 10))) return inp;
          if (Math.hypot(b.x - P.x, b.y - P.y) < 56 && Math.hypot(X - P.x, Y - P.y) < 6) { inp.atk = (G.time * 4 | 0) % 2 === 0; P.face = b.x >= P.x ? 1 : -1; }
        }
        if (kieu === 'ne') {
          for (const z of W.zones) {
            if (z.team === 'player' || z.team === 'fx' || !z.dmg || z.ct || !(z.t > 0)) continue;
            if (!G.inZone(z, P, 8)) continue;
            const a = z.shape === 'circle' ? (() => { const dx = P.x - z.x, dy = P.y - z.y, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; })() : G.zoneEscape(z, P);
            tx = P.x + a[0] * 40; ty = P.y + a[1] * 40;
            if (z.t < 0.22 && P.dodgeCd <= 0) inp.dodgeP = true;
            break;
          }
        }
        const dx = tx - P.x, dy = ty - P.y, l = Math.hypot(dx, dy);
        if (l > 2) { inp.mx = dx / l; inp.my = dy / l; }
        return inp;
      };
      lastZ = null;
      let t = 0;
      try {
        for (let f = 0; f < 60 * (giay + 3); f++) {
          if (b.intro == null || !(b.invuln > 0)) { if (pha) b.hp = b.maxhp * (pha === 1 ? 0.4 : 0.2); else b.hp = b.maxhp; }
          G.sim(1);
          if (f >= 180) t += 1 / 60;
          if (f === 179) { mat = 0; for (const q in trung) delete trung[q]; for (const q in ra) delete ra[q]; }
          P.hp = P.maxhp; P.dead = false;
          if (S.mode !== 'play') break;
        }
      } finally { G.inZone = iz0; G.hurtPlayer = h0; G.updateBoss = ub; G.botInput = bi0; }
      out.push({ pt, x: Math.round(X), y: Math.round(Y), px: Math.round(P.x), py: Math.round(P.y), bx: Math.round(b.x), by: Math.round(b.y), phut: Math.round(mat / P.maxhp * 100 / (t / 60) * 10) / 10, trung, ra });
      try { S.quit = true; G.finishStage(false); } catch (e) { /* bỏ qua */ }
    }
    return out;
  };
})();
