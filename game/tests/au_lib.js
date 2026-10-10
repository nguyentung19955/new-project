// Công cụ đo cho bài AUDIT chiến đấu (tests/au_*.py). Chỉ dùng khi kiểm tra, không nạp trong game thật.
// Không sửa luật chơi: chỉ dựng phòng, bơm nút bấm qua G.botInput, bọc tạm G.damage / G.hurtPlayer để đếm rồi trả lại.
(function () {
  const G = window.G;
  const AU = (window.AU = {});
  const BLANK = () => ({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, skill: false, swapP: false, potionP: false, pauseP: false, mapP: false });
  AU.inp = BLANK();
  // Vòng lặp thật (requestAnimationFrame) vẫn chạy giữa các lần gọi từ Python: chặn nó lại, chỉ cho chạy khi AU.run gọi.
  const TICK0 = G.tick;
  AU.manual = false;
  G.tick = function () { if (AU.manual) TICK0(); };
  AU.live = function (on) { G.tick = on ? TICK0 : function () { if (AU.manual) TICK0(); }; };
  // Nút bấm cho khung kế tiếp: các nút "P" (vừa bấm) tự xoá sau một khung.
  AU.press = function (o) { Object.assign(AU.inp, o); };
  function feed() { const o = Object.assign({}, AU.inp); for (const k of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP', 'potionP']) AU.inp[k] = false; return o; }

  // Dựng một phòng trống. o: { hero, lvl, tier, sharpen, melee, branch, marks, region, stage, boss }
  AU.room = function (o) {
    o = o || {};
    for (const k of G.HKEYS) G.HEROES[k].fav = []; // bỏ thưởng vũ khí ưa thích cho công bằng giữa các loại
    G.testSave({ hero: o.hero || 'smith', melee: o.melee || 'sword', lvl: o.lvl || 10, tier: o.tier || 0, sharpen: o.sharpen || 0, branch: o.branch, marks: o.marks, sk: o.sk });
    G.rnd = G.srand(o.seed || 7);
    G.startStage(o.region || 0, o.stage || 0, 0, { kind: 'A', seed: 3 });
    const S = G.getRun();
    if (o.big) G.gotoRoom(S.map.boss);
    const W = G.getWorld(), P = S.P;
    W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'door'); W.zones = []; W.banner = null; W.ents = []; W.projs = [];
    if (W.boss && !o.keepBoss) { W.boss.dead = true; W.boss = null; W.px1 = null; W.shrink = null; }
    W.cleared = false;
    P.x = W.geo.cx; P.y = W.geo.cy; P.inv = 0; P.mana = P.maxmana;
    G.botInput = feed;
    AU.inp = BLANK();
    S.hint = null;
    return { S, W, P };
  };
  AU.want = function (P, type) { if (G.curW(P).type !== type) { P.cur = 1 - P.cur; P.mv = null; } };
  // Bia đứng yên: quái kiểu cũ (không có hình mới), không đi, không đánh.
  AU.dummy = function (x, y, o) {
    o = o || {};
    const e = G.spawnEnemy(o.role || 'rusher', x, y, Object.assign({ noArt: true }, o.opt || {}));
    e.speed = 0; e.cd = 1e9; e.inside = true;
    if (o.hp) { e.maxhp = o.hp; e.hp = o.hp; }
    e.dummy = true;
    return e;
  };
  // Giữ bia đứng yên mỗi khung (đẩy nhau, bị đẩy lùi thì kéo về chỗ cũ nếu fix).
  AU.pin = function (list) { for (const q of list) { q.e.x = q.x; q.e.y = q.y; q.e.cd = 1e9; } };
  // Chạy n khung. fx = true: chạy như lúc có vẽ (có khựng hình của fx.js) nhưng không vẽ; false: G.sim (không vẽ, không khựng).
  AU.run = function (n, fx, each) {
    AU.manual = true;
    try {
      for (let i = 0; i < n; i++) {
        if (each && each(i) === false) break;
        if (fx) { G.noRender = false; G.tick(); G.click = null; } else G.sim(1);
      }
    } finally { AU.manual = false; }
  };
  // Đếm sát thương người chơi gây ra trong fn.
  AU.count = function (fn) {
    const d0 = G.damage, out = { dmg: 0, hits: 0, list: [] };
    G.damage = function (t, amt, o) {
      const h = t.hp, r = d0(t, amt, o);
      if (!o || o.fromPlayer !== false) { out.dmg += Math.max(0, h - Math.max(0, t.hp)); if (o && o.src === 'hit') out.hits++; out.list.push({ t: G.time, d: r, src: o && o.src, w: o && o.w && o.w.type, crit: !!(o && o.crit) }); }
      return r;
    };
    try { fn(); } finally { G.damage = d0; }
    return out;
  };
  AU.hurtLog = function (fn) {
    const h0 = G.hurtPlayer, out = [];
    G.hurtPlayer = function (a, b, c, d, e) { const W = G.getWorld(), P = W.P, inv = P.inv; const r = h0(a, b, c, d, e); out.push({ t: G.time, ok: r, inv }); return r; };
    try { fn(); } finally { G.hurtPlayer = h0; }
    return out;
  };
})();
