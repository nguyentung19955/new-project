// Đo tỉ lệ trúng của cung: mỗi kiểu bắn (bắn thường, giữ rồi thả, đòn đặc biệt, kỹ năng) bắn vào quái ở tám hướng,
// cự ly gần và xa. Chỉ dùng khi kiểm tra. Gọi: G.bowProbe({ kind, move, walk, hero })
(function () {
  const G = window.G;
  G.bowProbe = function (o) {
    o = Object.assign({ kind: 'ban', move: 0, walk: false, hero: 'hunter', dists: [16, 26, 60, 100, 135] }, o || {});
    let inp = {};
    const hold0 = G.botInput;
    G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
    const run = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.sim(1); for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete inp[q]; } };
    G.testSave({ hero: o.hero, melee: 'sword', tier: 1 });
    G.HEROES[o.hero].fav = [];
    G.startStage(0, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.banner = null;
    P.cur = 1; run(6);
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2, res = { hit: 0, n: 0, miss: [] };
    const box = { x0: W.x0, x1: W.x1, y0: W.y0, y1: W.y1 };
    for (let d = 0; d < 8; d++) {
      for (const dist of o.dists) {
        const a = (d * Math.PI) / 4;
        W.ents.length = 0; W.projs.length = 0; W.zones.length = 0; W.props = W.props.filter((p) => p.type !== 'trap');
        P.x = cx; P.y = cy; P.face = d === 4 ? 1 : (d % 2 ? -1 : 1); // nhiều phát quay mặt ngược hướng quái
        P.inv = 99; P.hp = P.maxhp; P.mana = P.maxmana; P.cdT = 0; P.atkT = 0; P.specCd = 0; P.skillCd = 0; P.dashT = 0; P.castT = 0; P.specT = 0;
        if (P.mv) { P.mv.holding = false; P.mv.charge = 0; P.mv.buf = 0; P.mv.pressBuf = 0; }
        let ex = G.clamp(cx + Math.cos(a) * dist, W.x0 + 6, W.x1 - 6), ey = G.clamp(cy + Math.sin(a) * dist * 0.75, W.y0 + 4, W.y1 - 4);
        const e = G.spawnEnemy('rusher', ex, ey, { hpMult: 1e6 });
        e.st.stun = 1e9; e.inside = true;
        // quái đi ngang (vuông góc với đường ngắm), chạm tường thì quay lại
        const vx = -Math.sin(a) * o.move, vy = Math.cos(a) * o.move * 0.75;
        let sgn = 1;
        const step = () => {
          if (!o.move) return;
          e.x += vx * sgn / 60; e.y += vy * sgn / 60;
          if (e.x < W.x0 + 6 || e.x > W.x1 - 6 || e.y < W.y0 + 4 || e.y > W.y1 - 4) sgn = -sgn;
        };
        const walk = o.walk ? { mx: Math.cos(a + Math.PI / 2), my: Math.sin(a + Math.PI / 2) } : {};
        const fr = (n, i) => { for (let k = 0; k < n; k++) { step(); run(1, i); } };
        fr(3, Object.assign({}, walk)); // cho quái kịp chạy (đón đầu cần biết vận tốc)
        const hp0 = e.hp;
        if (o.kind === 'ban') { fr(2, Object.assign({ atk: true }, walk)); fr(56, Object.assign({}, walk)); }
        else if (o.kind === 'manh') { fr(58, Object.assign({ atk: true }, walk)); fr(56, Object.assign({}, walk)); }
        else if (o.kind === 'dacbiet') { fr(1, Object.assign({ specialP: true }, walk)); fr(80, Object.assign({}, walk)); }
        else if (o.kind === 'kynang') { fr(1, Object.assign({ skillP: true }, walk)); fr(90, Object.assign({}, walk)); }
        res.n++;
        if (e.hp < hp0) res.hit++;
        else res.miss.push(d * 45 + '°/' + dist);
      }
    }
    G.botInput = hold0;
    G.setScene(G.Village);
    res.box = box;
    return res;
  };
})();
