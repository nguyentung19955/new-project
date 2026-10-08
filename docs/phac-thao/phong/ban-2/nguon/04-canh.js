// Các cảnh: bày quái, đồ vật, vùng nguy hiểm rồi dựng từng ảnh.
(function () {
  const G = window.G, PT = window.PT, p = PT.p;
  const THEME = ['forest', 'cave', 'castle'], PROP = ['mushroom', 'crystal', 'brazier'];

  // ---------- Kiểu A ----------
  // reg: 0 rừng, 1 hang, 2 lâu đài. o: { state, fight, hero, mobs, props, zones, frames }
  PT.sceneA = function (reg, o) {
    o = o || {};
    const g = PT.geom({ x: 105, y: 0, w: 270, h: 270, theme: THEME[reg], seed: 11 + reg, state: o.state || 'lock' });
    const B = { x0: g.fx0 + 8, x1: g.fx1 - 8, y0: g.fy0 + 8, y1: g.fy1 - 3 };
    const fight = o.fight !== false;
    PT.scene({
      reg, el: o.el, bounds: B, seed: 5 + reg, hp: 0.82,
      hero: o.hero || { x: 226, y: 172, face: 1 },
      mobs: !fight ? [] : o.mobs || [
        { role: 'rusher', x: 262, y: 170 }, { role: 'rusher', x: 186, y: 180, speed: 0.8 },
        { role: 'shield', x: 312, y: 130, speed: 0.3 }, { role: 'archer', x: 338, y: 104, cd: 0.9, speed: 0.1 },
        { role: 'swarm', x: 172, y: 104, speed: 0.22 }, { role: 'nimble', x: 176, y: 238, speed: 0.12 },
      ],
      props: o.props || [{ type: PROP[reg], env: true, x: 142, y: 92 }, { type: PROP[reg], env: true, x: 338, y: 92 }, { type: 'chest', x: 150, y: 198, act: 'chest', used: !fight }],
      frames: o.frames || 34,
      zones: !fight ? [] : o.zones || [{ x: 296, y: 222, r: 25 }, { x: 166, y: 150, r: 19, pool: ['poison', 'ice', 'fire'][reg] }],
      input: fight ? { atk: true, atkP: true } : {},
    });
    if (fight) PT.untilSwing(o.lo || 0.25, o.hi || 0.4);
    const T = PT.themes[g.theme];
    const world = PT.shot((c) => { T.bgOutside(c, PT.rng(40 + reg)); PT.room(c, g); }, (c) => PT.roomOver(c, g));
    world.g = g;
    return world;
  };
  PT.kieuA = function () {
    const world = PT.sceneA(2);
    const st = PT.hudState();
    return PT.compose(world, 3, (c) => PT.hud(c, PT.LAYOUT.le, st, PT.MAP));
  };
})();
