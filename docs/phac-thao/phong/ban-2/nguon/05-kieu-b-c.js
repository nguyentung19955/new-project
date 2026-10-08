// Kiểu B (giữ phòng nhìn ngang của game, thêm cửa bốn hướng) và Kiểu C (phòng lớn hơn màn hình, camera đi theo hero).
(function () {
  const G = window.G, PT = window.PT, p = PT.p;
  const ST = { out: '#1b1717', fr: '#817267', hi: '#9a8a7c', mid: '#675952', dk: '#504341', sh: '#302728' };

  // Cửa ở tường sau: lối đi "lên". x: tâm cửa, yb: chân tường (mép trên của nền)
  function doorUp(c, x, yb, open) {
    const w = 34, h = 52, ox = x - w / 2, oy = yb - 2 - h;
    p(c, ox - 8, oy - 8, w + 16, h + 10, ST.out); p(c, ox - 7, oy - 7, w + 14, h + 9, ST.fr);
    for (let yy = oy + 2; yy < yb - 3; yy += 8) { p(c, ox - 7, yy, 7, 1, ST.dk); p(c, ox + w, yy, 7, 1, ST.dk); }
    for (let xx = ox - 2; xx < ox + w; xx += 9) p(c, xx, oy - 7, 1, 7, ST.dk);
    p(c, ox - 7, oy - 7, w + 14, 1, ST.hi); p(c, x - 5, oy - 9, 10, 9, ST.hi); p(c, x - 5, oy - 1, 10, 1, ST.dk); p(c, x - 5, oy - 9, 10, 1, '#b8a898');
    const ins = (i) => (i < 1 ? 8 : i < 2 ? 6 : i < 3 ? 4 : i < 5 ? 3 : i < 7 ? 2 : i < 10 ? 1 : 0);
    c.save(); c.beginPath(); for (let i = 0; i < h; i++) c.rect(ox + ins(i), oy + i, w - 2 * ins(i), 1); c.clip();
    if (open) {
      const g2 = c.createLinearGradient(0, oy, 0, yb); g2.addColorStop(0, '#8a5222'); g2.addColorStop(0.5, '#e8ac58'); g2.addColorStop(1, '#fff0c4');
      c.fillStyle = g2; c.fillRect(ox, oy, w, h);
      p(c, ox, oy, 5, h, 'rgba(90,50,20,0.45)'); p(c, ox + w - 5, oy, 5, h, 'rgba(90,50,20,0.45)');
    } else p(c, ox, oy, w, h, '#0e0a0a');
    // bậc thang đi lên nhìn thấy sau cửa
    for (let i = 0; i < 6; i++) {
      const yy = oy + h - 5 - i * 6, k = 1 - i / 7, inset = 2 + i * 2;
      p(c, ox + inset, yy, w - inset * 2, 5, open ? 'rgba(120,80,40,' + (0.5 * k).toFixed(2) + ')' : 'rgba(104,90,84,' + (0.9 * k).toFixed(2) + ')');
      p(c, ox + inset, yy, w - inset * 2, 1, open ? 'rgba(255,246,214,' + (0.8 * k).toFixed(2) + ')' : 'rgba(150,134,124,' + k.toFixed(2) + ')');
    }
    if (open) { for (let i = 0; i * 5 < w; i++) { p(c, ox + 2 + i * 5, oy, 2, 7, '#4a4a52'); p(c, ox + 2 + i * 5, oy + 7, 1, 2, '#4a4a52'); } p(c, ox, oy + 4, w, 1, '#3a3a42'); } else {
      for (let i = 0; i * 5 < w; i++) { p(c, ox + 2 + i * 5, oy, 2, h, '#62626a'); p(c, ox + 2 + i * 5, oy, 1, h, '#9a9aa4'); }
      for (const yy of [oy + 12, oy + 30, oy + 46]) { p(c, ox, yy, w, 2, '#4a4a52'); p(c, ox, yy, w, 1, '#7a7a84'); }
    }
    c.restore();
    // ba bậc thềm chìa ra nền
    for (let i = 0; i < 3; i++) { const sw = w + 12 + i * 8, yy = yb - 3 + i * 4; p(c, x - sw / 2 - 1, yy, sw + 2, 5, ST.out); p(c, x - sw / 2, yy, sw, 2, ST.hi); p(c, x - sw / 2, yy + 2, sw, 2, ST.mid); }
    if (open) PT.spill(c, 's', ox + 2, ox + w - 2, yb + 9, 44, 20, '255,222,160', 0.3);
  }
  // Lối "xuống" ở mép trước: một ô cầu thang khoét vào nền, bậc đi xuống về phía người xem
  function stairsDown(c, x, y, open) {
    const w = 58, h = 270 - y;
    p(c, x - w / 2 - 5, y - 5, w + 10, h + 5, ST.out);
    p(c, x - w / 2 - 4, y - 4, w + 8, h + 4, ST.fr); p(c, x - w / 2 - 4, y - 4, w + 8, 1, ST.hi);
    for (let xx = x - w / 2 + 6; xx < x + w / 2; xx += 12) p(c, xx, y - 4, 1, 4, ST.dk);
    for (let yy = y + 5; yy < 270; yy += 8) { p(c, x - w / 2 - 4, yy, 4, 1, ST.dk); p(c, x + w / 2, yy, 4, 1, ST.dk); }
    p(c, x - w / 2, y, w, h, '#0a0808');
    const cols = ['#9a8c82', '#82756c', '#695d57', '#4f4541', '#352e2c', '#1f1a19'];
    for (let i = 0; i < 6; i++) { const yy = y + i * 5, inset = i * 2; p(c, x - w / 2 + inset, yy, w - inset * 2, 5, cols[i]); p(c, x - w / 2 + inset, yy, w - inset * 2, 1, i < 4 ? '#c0b2a6' : '#5a504c'); p(c, x - w / 2 + inset, yy + 4, w - inset * 2, 1, '#120e0e'); p(c, x - w / 2, yy, inset, 5, '#241e1d'); p(c, x + w / 2 - inset, yy, inset, 5, '#241e1d'); }
    if (open) { PT.glow(c, x, 268, 34, '255,200,120', 0.5); PT.spill(c, 'n', x - w / 2 + 3, x + w / 2 - 3, y - 5, 36, 14, '255,222,160', 0.22); } else {
      for (let i = 0; i * 9 < w - 2; i++) { p(c, x - w / 2 + 3 + i * 9, y, 2, h, '#62626a'); p(c, x - w / 2 + 3 + i * 9, y, 1, h, '#b0b0ba'); }
      for (const yy of [y + 3, y + 22]) { p(c, x - w / 2, yy, w, 2, '#4a4a52'); p(c, x - w / 2, yy, w, 1, '#8a8a94'); }
    }
  }
  PT.doorUp = doorUp; PT.stairsDown = stairsDown;

  PT.sceneB = function (o) {
    o = o || {};
    const fight = o.fight !== false, open = o.state === 'open';
    PT.scene({
      reg: 2, seed: 9, hp: 0.82, bounds: {},
      hero: { x: 118, y: 196, face: 1 },
      mobs: fight ? [
        { role: 'rusher', x: 152, y: 194 }, { role: 'rusher', x: 84, y: 200, speed: 0.8 },
        { role: 'shield', x: 204, y: 172, speed: 0.3 }, { role: 'archer', x: 318, y: 176, cd: 0.9, speed: 0.1 },
        { role: 'swarm', x: 80, y: 162, speed: 0.22 }, { role: 'nimble', x: 330, y: 230, speed: 0.12 },
      ] : [],
      props: [{ type: 'brazier', env: true, x: 172, y: 160 }, { type: 'brazier', env: true, x: 308, y: 160 }, { type: 'chest', x: 352, y: 196, act: 'chest', used: !fight }],
      zones: fight ? [{ x: 276, y: 212, r: 24 }, { x: 184, y: 228, r: 16, pool: 'fire' }] : [],
      frames: 34, input: fight ? { atk: true, atkP: true } : {},
    });
    if (fight) PT.untilSwing(0.25, 0.4);
    const W = G.getWorld();
    return PT.shot((c) => {
      PT.realBg.call(G.art, c, 2, W.seed, 0, 480, null);
      doorUp(c, 240, G.GY0, open);
      stairsDown(c, 240, 241, open);
    }, (c) => {
      if (!open) { PT.padlock(c, 240, 112); PT.padlock(c, 240, 255); PT.padlock(c, 21, 168); PT.padlock(c, 459, 168); } else { PT.chevron(c, 240, 160, 'n', '#ffe9a8'); PT.chevron(c, 240, 232, 's', '#ffe9a8'); PT.chevron(c, 36, 190, 'w', '#ffe9a8'); PT.chevron(c, 444, 190, 'e', '#ffe9a8'); }
    });
  };
  PT.kieuB = function () {
    const world = PT.sceneB();
    const st = PT.hudState(); st.title = 'Đánh quái · Lâu đài cổ 3';
    return PT.compose(world, 3, (c) => PT.hud(c, PT.LAYOUT.game, st, PT.MAP));
  };

  // ---------- Kiểu C ----------
  // Màn hình chỉ thấy 320x180 điểm ảnh của một phòng 640x360, nên nhân vật to gấp rưỡi so với Kiểu A.
  PT.VIEW_C = { x: 80, y: 45, w: 320, h: 180 };
  PT.sceneC = function () {
    const V = PT.VIEW_C;
    const g = PT.geom({ x: V.x - 190, y: V.y, w: 640, h: 360, faceH: 46, theme: 'castle', seed: 23, state: 'lock' });
    PT.scene({
      reg: 2, seed: 12, hp: 0.82,
      bounds: { x0: g.fx0 + 8, x1: g.fx1 - 8, y0: g.fy0 + 8, y1: g.fy1 - 3 },
      hero: { x: 232, y: 156, face: 1 },
      mobs: [
        { role: 'rusher', x: 266, y: 154 }, { role: 'rusher', x: 196, y: 162, speed: 0.8 },
        { role: 'shield', x: 300, y: 136, speed: 0.3 }, { role: 'archer', x: 316, y: 114, cd: 0.9, speed: 0.001 },
        { role: 'swarm', x: 180, y: 130, speed: 0.22 }, { role: 'nimble', x: 190, y: 204, speed: 0.12 },
      ],
      props: [{ type: 'brazier', env: true, x: 158, y: 114 }, { type: 'brazier', env: true, x: 262, y: 114 }, { type: 'chest', x: 112, y: 140, act: 'chest' }],
      zones: [{ x: 250, y: 200, r: 22 }, { x: 140, y: 172, r: 17, pool: 'fire' }],
      frames: 34, input: { atk: true, atkP: true },
    });
    PT.untilSwing(0.25, 0.4);
    const T = PT.themes.castle;
    return PT.shot((c) => { T.bgOutside(c, PT.rng(4)); PT.room(c, g); }, (c) => PT.roomOver(c, g), 4.5);
  };
  PT.kieuC = function () {
    const world = PT.sceneC();
    const st = PT.hudState(); st.title = 'Đánh quái · Lâu đài cổ 3';
    return PT.compose(world, 4.5, (c) => PT.hud(c, PT.LAYOUT.game, st, PT.MAP), PT.VIEW_C, 3);
  };
})();
