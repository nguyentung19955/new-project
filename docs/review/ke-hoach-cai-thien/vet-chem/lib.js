
(() => {
  const T = (window.T = {});
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  T.frame = (i) => { if (i) inp = Object.assign({}, i); G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of PRESS) delete inp[q]; };
  T.run = (i, n) => { for (let k = 0; k < n; k++) { T.frame(k === 0 ? i : null); if (T.P) { T.P.inv = 0; T.P.hp = T.P.maxhp; } } };
  T.hold = (i, n) => { for (let k = 0; k < n; k++) { T.frame(i); if (T.P) { T.P.inv = 0; T.P.hp = T.P.maxhp; } } };
  T.room = function (o) {
    o = o || {};
    G.rnd = G.srand(o.seed || 5);
    G.testSave({ hero: o.hero || 'smith', melee: o.melee, lvl: 30, tier: 2, branch: o.el || null, marks: o.el ? 130 : 0 });
    const hs = G.save.heroes[o.hero || 'smith'];
    if (o.cay) hs.ch = { cay: o.cay, n: Object.assign({}, o.n || {}) };
    G.MOVE_TIPS = {};
    G.startStage(o.region == null ? 0 : o.region, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null; S.hint = null;
    if (P.mv) { P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; P.mv.tipWait = null; }
    for (const e of W.ents) e.dead = true;
    W.ents = [];
    inp = {};
    for (let i = 0; i < 8; i++) T.frame({});
    W.banner = null;
    if (o.bow) P.cur = 1;
    P.x = W.geo.cx - (o.left || 50); P.y = W.geo.cy + 6; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp; P.ldx = null; P.ldy = null;
    T.dum = [];
    for (const d of o.dum || []) { const e = G.spawnEnemy(d[2] || 'rusher', P.x + d[0], P.y + d[1], { hpMult: 1e5 }); e.st.root = 1e9; e.inside = true; e.face = d[0] > 0 ? -1 : 1; e.speed = 0; e.cd = 1e9; T.dum.push(e); }
    for (let i = 0; i < 60; i++) T.frame({});
    W.zones = W.zones.filter((z) => z.team === 'player'); W.projs = []; P.mana = P.maxmana; P.cdT = 0; P.specCd = 0; P.skillCd = 0;
    T.W = W; T.P = P;
    return [P.x + (o.shift || 45), P.y - 14];
  };
  T.errs = [];
  window.addEventListener('error', (e) => T.errs.push(String(e.message)));
})();
