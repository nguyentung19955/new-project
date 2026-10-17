// Công cụ đo "hiệu ứng có dính vào quái không" (docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai). Chỉ dùng khi kiểm tra.
// Không đổi luật chơi: chỉ dựng cảnh, vẽ từng lớp vào canvas thế giới rồi đọc điểm ảnh. Nạp SAU tests/setup.js + T (tests/quai_lib.py).
(function () {
  const DQ = (window.DQ = {});
  const A = G.art;
  const ORIG = {};
  let iso = false;
  // ---------- tách lớp: nền trong suốt, bỏ em bé / vật / cửa / rung màn ----------
  DQ.iso = function (on) {
    if (on === iso) return;
    iso = on;
    if (on) {
      ORIG.bg = A.bg; ORIG.hero = A.hero; ORIG.prop = A.prop; ORIG.vienBe = G.fx.vienBe; ORIG.heroOver = G.mobHeroOver; ORIG.shake = G.fx.shakeOffset;
      ORIG.vatCao = G.roomArt && G.roomArt.vatCao;
      A.bg = function (c) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height); c.restore(); };
      A.hero = () => {}; A.prop = () => {}; G.mobHeroOver = () => {}; G.fx.shakeOffset = () => ({ x: 0, y: 0 });
      if (G.roomArt) G.roomArt.vatCao = () => [];
    } else {
      A.bg = ORIG.bg; A.hero = ORIG.hero; A.prop = ORIG.prop; G.fx.vienBe = ORIG.vienBe; G.mobHeroOver = ORIG.heroOver; G.fx.shakeOffset = ORIG.shake;
      if (G.roomArt) G.roomArt.vatCao = ORIG.vatCao;
    }
  };
  const W = () => G.getWorld();
  const N = () => G.NET || 1;
  function draw() {
    G.noRender = false;
    const S = G.getRun();
    G.drawWorld(S ? S.r : 0);
  }
  // Ảnh mặt nạ điểm ảnh của canvas thế giới (alpha ≥ thr)
  function grab(thr) {
    const cv = G.wx.canvas, w = cv.width, h = cv.height, d = G.wx.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h);
    for (let i = 0, j = 3; i < m.length; i++, j += 4) if (d[j] >= thr) m[i] = 1;
    return { m, d, w, h };
  }
  function bbox(g) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0, sx = 0, sy = 0;
    const { m, w, h } = g;
    for (let y = 0; y < h; y++) for (let x = 0, i = y * w; x < w; x++, i++) if (m[i]) { n++; sx += x; sy += y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (!n) return null;
    const k = N(), cam = G.camVe ? G.camVe(W()) : Math.round(W().cam || 0);
    return { x0: x0 / k + cam, x1: (x1 + 1) / k + cam, y0: y0 / k, y1: (y1 + 1) / k, cx: (sx / n + 0.5) / k + cam, cy: (sy / n + 0.5) / k, n: n / (k * k) };
  }
  function dilate(g, r) {
    const { m, w, h } = g, a = new Uint8Array(w * h), b = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) { let last = -1e9; const o = y * w; for (let x = 0; x < w; x++) { if (m[o + x]) last = x; if (x - last <= r) a[o + x] = 1; } last = 1e9; for (let x = w - 1; x >= 0; x--) { if (m[o + x]) last = x; if (last - x <= r) a[o + x] = 1; } }
    for (let x = 0; x < w; x++) { let last = -1e9; for (let y = 0; y < h; y++) { if (a[y * w + x]) last = y; if (y - last <= r) b[y * w + x] = 1; } last = 1e9; for (let y = h - 1; y >= 0; y--) { if (a[y * w + x]) last = y; if (last - y <= r) b[y * w + x] = 1; } }
    return { m: b, w, h };
  }
  // ---------- dọn trạng thái hình của một con để chụp thân sạch ----------
  const NEU = ['flash', 'fxK', 'mvLift', 'fxS', 'fxSV', 'fxL', 'fxLV', 'fxHop', 'fxBep', 'hitT', 'boTroiT', 'boChamT', 'wind', 'spikeUp'];
  function clean(e) {
    const s = { st: e.st, trait: e.trait };
    for (const k of NEU) s[k] = e[k];
    e.st = G.st0(); e.trait = null; for (const k of NEU) e[k] = 0;
    return s;
  }
  function restore(e, s) { e.st = s.st; e.trait = s.trait; for (const k of NEU) e[k] = s[k]; }
  function fxClear() {
    const S = G.fx.state(); if (!S) return;
    S.E.length = 0; S.np = 0; S.N.length = 0; S.dying.length = 0; S.trauma = 0; S.kx = 0; S.ky = 0; S.stop = 0;
  }
  DQ.fxClear = fxClear;
  // only: danh sách vật thể được vẽ (quái). Trả lại hàm khôi phục.
  function only(list) {
    const w = W(), keep = {};
    for (const k of ['ents', 'boss', 'props', 'zones', 'projs', 'mvSp', 'mvWaves', 'mvShards', 'slashes', 'parts', 'texts']) keep[k] = w[k];
    w.ents = list.filter((e) => !e.__laBoss);
    w.boss = list.find((e) => e.__laBoss) || null;
    for (const k of ['props', 'zones', 'projs', 'mvSp', 'mvWaves', 'mvShards', 'slashes', 'parts', 'texts']) if (w[k]) w[k] = [];
    return () => { for (const k in keep) w[k] = keep[k]; };
  }
  // ---------- chụp thân sạch ----------
  DQ.body = function (e) {
    DQ.iso(true);
    const s = clean(e), back = only([e]);
    const E0 = G.fx.state().E.slice(), np0 = G.fx.state().np;
    fxClear();
    const F = G.fx, L = { drawGround: F.drawGround, drawOver: F.drawOver, entity: F.entity, proj: F.proj, projAnh: F.projAnh, drawUI: F.drawUI, sorted: F.sorted }, BT = G.baoTruoc;
    for (const k in L) F[k] = null;
    G.baoTruoc = null;
    try { draw(); return grab(128); } finally { for (const k in L) F[k] = L[k]; G.baoTruoc = BT; back(); restore(e, s); const S = G.fx.state(); S.E.length = 0; for (const o of E0) S.E.push(o); S.np = np0; }
  };
  // ---------- chụp riêng hiệu ứng (thân quái không vẽ) ----------
  // o.boIcon: không vẽ biểu tượng trạng thái trên đầu (A.status); o.chiIcon: chỉ vẽ biểu tượng (bỏ fx.entity)
  DQ.fxOnly = function (e, o) {
    o = o || {};
    DQ.iso(true);
    const back = only([e]), en = A.enemy, bo = A.boss, as = A.status, ent = G.fx.entity, so = G.fx.sorted;
    A.enemy = () => {}; A.boss = () => {}; G.fx.sorted = null;
    if (o.boIcon) A.status = () => {};
    if (o.chiIcon) G.fx.entity = null;
    try { draw(); return grab(40); } finally { A.enemy = en; A.boss = bo; A.status = as; G.fx.entity = ent; G.fx.sorted = so; back(); }
  };
  // Bỏ khỏi E các điểm ảnh đã có y hệt ở ảnh nền E0 (hình không thuộc hiệu ứng đang đo)
  // Chỉ giữ điểm ảnh trong khung thế giới [x0, x1] × [y0, y1]
  DQ.cat = function (E, x0, y0, x1, y1) {
    const k = N(), cam = G.camVe ? G.camVe(W()) : Math.round(W().cam || 0);
    const X0 = Math.floor((x0 - cam) * k), X1 = Math.ceil((x1 - cam) * k), Y0 = Math.floor(y0 * k), Y1 = Math.ceil(y1 * k);
    for (let y = 0; y < E.h; y++) for (let x = 0; x < E.w; x++) if ((x < X0 || x > X1 || y < Y0 || y > Y1) && E.m[y * E.w + x]) E.m[y * E.w + x] = 0;
    return E;
  };
  DQ.tru = function (E, E0) {
    const m = new Uint8Array(E.m.length);
    for (let i = 0; i < m.length; i++) if (E.m[i]) { if (E0.m[i]) { const j = i * 4; if (Math.abs(E.d[j] - E0.d[j]) + Math.abs(E.d[j + 1] - E0.d[j + 1]) + Math.abs(E.d[j + 2] - E0.d[j + 2]) + Math.abs(E.d[j + 3] - E0.d[j + 3]) < 24) continue; } m[i] = 1; }
    return { m, d: E.d, w: E.w, h: E.h };
  };
  DQ.full = function (e) {
    DQ.iso(true);
    const back = only([e]);
    try { draw(); return grab(40); } finally { back(); }
  };
  // So hiệu ứng E với thân B (đã chụp). Trả thông số (toạ độ thế giới, điểm game).
  DQ.cmp = function (B, E, Fu) {
    const bb = bbox(B), eb = bbox(E);
    if (!eb) return { b: bb, e: null };
    const k = N(), D = dilate(B, 2 * k);
    let inn = 0, tot = 0, both = 0, front = 0;
    for (let i = 0; i < E.m.length; i++) if (E.m[i]) {
      tot++; if (D.m[i]) inn++;
      if (Fu && B.m[i]) { // điểm có cả thân lẫn hiệu ứng: ảnh cuối giống hiệu ứng (trước thân) hay giống thân (sau thân)
        both++;
        const j = i * 4, dE = Math.abs(Fu.d[j] - E.d[j]) + Math.abs(Fu.d[j + 1] - E.d[j + 1]) + Math.abs(Fu.d[j + 2] - E.d[j + 2]);
        const dB = Math.abs(Fu.d[j] - B.d[j]) + Math.abs(Fu.d[j + 1] - B.d[j + 1]) + Math.abs(Fu.d[j + 2] - B.d[j + 2]);
        if (dE < dB) front++;
      }
    }
    return { b: bb, e: eb, inn: tot ? inn / tot : 0, front: both ? front / both : null, both: both / (k * k) };
  };
  DQ.bbox = bbox;
  // Khoảng cách (điểm game) từ điểm thế giới (x, y) tới điểm ảnh thân gần nhất (tìm trong bán kính R điểm game)
  DQ.ganThan = function (B, x, y, R) {
    R = R || 60;
    const k = N(), cam = G.camVe ? G.camVe(W()) : Math.round(W().cam || 0), px = Math.round((x - cam) * k), py = Math.round(y * k), rr = R * k;
    let best = 1e9;
    for (let dy = -rr; dy <= rr; dy++) { const yy = py + dy; if (yy < 0 || yy >= B.h) continue; for (let dx = -rr; dx <= rr; dx++) { const xx = px + dx; if (xx < 0 || xx >= B.w) continue; if (B.m[yy * B.w + xx]) { const d = dx * dx + dy * dy; if (d < best) best = d; } } }
    return best > 1e8 ? 99 : Math.sqrt(best) / k;
  };
  // ---------- dựng quái ----------
  DQ.loaded = function () {
    const SC = G.spriteCustom, FA = G.fxAnh;
    let can = 0, xong = 0;
    for (const k of Object.keys(FA.ds)) { can++; if (FA.co(k)) xong++; }
    for (const q of G.monsterArt.list) { can++; if (SC.get(q.id)) xong++; }
    return [xong, can];
  };
  DQ.roster = function () {
    const M = G.MOB_ART, out = [];
    const roles = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky'];
    for (let r = 0; r < G.REGIONS.length; r++) {
      for (const ro of roles) out.push({ r, loai: 'thuong', role: ro, id: M[ro][r] });
      for (const id of M.elite[r]) out.push({ r, loai: 'tinhanh', role: 'elite', id });
      out.push({ r, loai: 'trumnho', role: 'mini', id: M.mini[r] });
      out.push({ r, loai: 'trum', role: 'boss', id: G.REGIONS[r].boss });
    }
    return out;
  };
  // Dựng một con trong phòng trống của vùng r. q: mục roster. o: { x, y, face, pha }
  DQ.spawn = function (q, o) {
    o = o || {};
    let e, P, w;
    if (q.loai === 'thuong' || q.loai === 'tinhanh') {
      const R = T.room(q.r, 2);
      w = R.W; P = R.P;
      e = G.spawnEnemy(q.role, o.x || w.geo.cx + 40, o.y || w.geo.cy, { art: q.id });
      e.spawnT = 0; e.an = { n: 'idle', t: 0, spd: 1 }; e.inside = true;
    } else {
      const R = T.boss(q.r, q.loai === 'trum');
      w = R.W; P = R.P; e = w.boss;
      if (!e) return null;
      e.__laBoss = true;
      w.ents = [];
      // bỏ phần ra mắt
      for (let i = 0; i < 400 && (e.intro > 0 || e.invuln > 0 || e.enterT > 0); i++) G.sim(1);
      w.ents = [];
      if (o.x) e.x = o.x; if (o.y) e.y = o.y;
    }
    w.waves = []; w.spawns = []; w.zones = []; w.projs = [];
    P.x = w.x0 + 10; P.y = w.y1 - 4; P.inv = 99; P.hp = P.maxhp;
    DQ.freeze(e);
    if (o.face) e.face = o.face;
    if (o.pha != null) e.phase = o.pha;
    G.fx.update(1 / 60); fxClear();
    return e;
  };
  // Giữ quái đứng yên, không đánh
  DQ.freeze = function (e) {
    e.cd = 1e9; e.speed = 0; e.act = null; e.wind = 0; e.dirA = e.face > 0 ? 0 : Math.PI;
    if (e.isBoss) { e.busy = 1e9; e.atkCd = 1e9; e.moveT = 0; if (e.seq) e.seq.length = 0; e.lunge = null; e.ctNhay = null; }
  };
})();
// ======================= ĐÒN CỦA CU TÍ TRÚNG QUÁI =======================
(function () {
  const DQ = window.DQ, W = () => G.getWorld();
  // Hàm hiệu ứng có thể là "hình trúng quái": ghi mọi hình (S.E) và số (S.N) sinh ra trong khung có quái mục tiêu mất máu.
  const VA = ['hit', 'dmg', 'chBoom', 'chHit', 'chShatter', 'chSpread', 'heBoom', 'heShatter', 'heSpread', 'heFinish', 'heArrow', 'combo', 'freeze', 'status', 'spPin', 'burst', 'sparkle', 'text', 'comboName', 'markOrbs'];
  let FR = null, target = null, trung = false, sat = [];
  let daBoc = false;
  function wrapAll() {
    if (daBoc) return; daBoc = true;
    for (const k of VA) {
      const f0 = G.fx[k];
      if (typeof f0 !== 'function') continue;
      G.fx[k] = function () {
        const S = G.fx.state();
        if (!FR || !S) return f0.apply(this, arguments);
        const e0 = S.E.length, n0 = new Set(S.N), v0 = new Map(S.N.map((q) => [q, q.val]));
        const r = f0.apply(this, arguments);
        const E = S.E.slice(e0).map((o) => Object.assign({}, o));
        const Nn = S.N.filter((q) => !n0.has(q) || v0.get(q) !== q.val).map((q) => ({ x0: q.x0, y0: q.y0, moi: !n0.has(q), chu: q.chu === target }));
        let laMt = false; for (const a of arguments) if (a === target) laMt = true;
        FR.push({ api: k, laMt, o: k === 'hit' ? Object.assign({}, arguments[1]) : null, E, N: Nn });
        return r;
      };
    }
    const d0 = G.damage;
    G.damage = function (t, amt, o) { const r = d0.apply(this, arguments); if (FR && t === target && r > 0) { trung = true; sat.push(o ? (o.src || o.type || '') : ''); } return r; };
  }
  // Chụp riêng một nhóm hình hiệu ứng (đã chép) ở đúng chỗ của chúng, tuổi a giây. Thân quái và trạng thái trên thân không vẽ.
  function chupHinh(e, E, a) {
    const S = G.fx.state(), e0 = S.E.slice(), np0 = S.np, N0 = S.N.slice(), st = e.st, tr = e.trait;
    S.E.length = 0; S.np = 0; S.N.length = 0; e.st = G.st0(); e.trait = null;
    for (const o of E) { const c = Object.assign({}, o); if (a) c.t = Math.max(0.001, c.t - a); c.d = 0; S.E.push(c); }
    try { return DQ.fxOnly(e); } finally { e.st = st; e.trait = tr; S.E.length = 0; for (const o of e0) S.E.push(o); S.np = np0; S.N.length = 0; for (const o of N0) S.N.push(o); }
  }
  DQ.chupHinh = chupHinh;
  const DON = {
    kiem: { w: 'sword', d: 1, f: 75, inp: (i) => (i % 12 === 0 && i < 40 ? { atkP: true } : {}) },
    thuong: { w: 'spear', d: 1, f: 95, inp: (i) => (i % 13 === 0 && i < 55 ? { atkP: true } : {}) },
    bua: { w: 'hammer', d: 1, f: 50, inp: (i) => (i === 0 ? { atkP: true } : {}) },
    phitieu: { w: 'bow', d: 80, f: 50, inp: (i) => (i === 0 ? { atkP: true } : {}) },
    db_kiem: { w: 'sword', d: 50, f: 60, inp: (i) => (i === 0 ? { specialP: true } : {}) },
    db_thuong: { w: 'spear', d: 60, f: 80, inp: (i) => (i === 0 ? { specialP: true } : {}) },
    db_bua: { w: 'hammer', d: 40, f: 70, inp: (i) => (i === 0 ? { specialP: true } : {}) },
    db_phitieu: { w: 'bow', d: 70, f: 120, inp: (i) => (i === 0 ? { specialP: true } : {}) },
    chuong_hoa: { w: 'sword', d: 70, f: 45, cay: 'hoa', inp: (i) => (i === 0 ? { skillP: true } : {}) },
    chuong_doc: { w: 'sword', d: 70, f: 45, cay: 'doc', inp: (i) => (i === 0 ? { skillP: true } : {}) },
    chuong_bang: { w: 'sword', d: 70, f: 45, cay: 'bang', inp: (i) => (i === 0 ? { skillP: true } : {}) },
  };
  DQ.DON = Object.keys(DON);
  // q: mục roster; ten: tên đòn; ben: -1 Cu Tí bên trái quái (quái quay trái), 1 bên phải; o: { mep, pl (mã phúc lành), he }
  DQ.danh = function (q, ten, ben, o) {
    o = o || {};
    const K = DON[ten];
    wrapAll();
    const save = { melee: K.w === 'bow' ? 'sword' : K.w, lvl: 14 };
    if (o.he) { save.branch = o.he; save.marks = 300; save.tier = 2; }
    const R0 = T.room; T.room = function (r, i, oo) { return R0(r, i, Object.assign({}, oo, { save })); };
    const B0 = T.boss; T.boss = function (r, big, oo) { return B0(r, big, Object.assign({}, oo, { save })); };
    const tsv = G.testSave; G.testSave = function (x) { const r = tsv.call(this, x); if (K.cay) { const hs = G.save.heroes[G.save.hero]; hs.ch = { cay: K.cay, n: {} }; } return r; };
    let e;
    try { e = DQ.spawn(q); } finally { T.room = R0; T.boss = B0; G.testSave = tsv; }
    if (!e) return null;
    const w = W(), P = G.getRun().P;
    target = e;
    e.maxhp = e.hp = 1e9; if (e.isBoss) { e.layers = []; e.weak = []; }
    const rr = e.r || 10, d = K.d === 1 ? rr + 14 : K.d + rr;
    if (o.mep) e.x = ben < 0 ? w.x1 - rr - 2 : w.x0 + rr + 2;
    else if (!e.__laBoss || e.kind === 'mini') e.x = w.geo.cx + (ben < 0 ? -30 : 30);
    if (e.kind !== 'thuong') { P.x = e.x + ben * d; P.y = e.y; } else { P.x = e.x + ben * d; P.y = e.y; }
    P.face = -ben; e.face = e.art === 'traiGai' ? -ben : ben;
    P.cur = Math.max(0, P.weapons.findIndex((x) => x.type === K.w));
    P.mana = P.maxmana = 200; P.inv = 99; P.hp = P.maxhp; P.specCd = 0; P.skillCd = 0;
    if (o.pl) { const S = G.getRun(); S.pl = { sau: 0, k: o.pl, opts: null, xong: true, cho: 0, dem: 0 }; }
    DQ.freeze(e);
    let inp = {};
    G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
    const ex0 = e.x, ey0 = e.y, out = [];
    for (let i = 0; i < K.f; i++) {
      inp = K.inp(i);
      FR = []; trung = false; sat = [];
      const ex = e.x, ey = e.y;
      G.noRender = false; G.tick(); G.click = null;
      const fr = FR, tr = trung, sa = sat; FR = null;
      e.hp = e.maxhp; P.hp = P.maxhp; DQ.freeze(e);
      if (e.art === 'traiGai') e.face = -ben; // Trai Sông Gai khép vỏ chặn đòn phía trước: đánh từ sau lưng
      if (tr) out.push(DQ.doTrung(e, fr, i, sa));
    }
    target = null;
    e.x = ex0; e.y = ey0;
    return { e: e.art || e.kind, list: out };
  };
  // Đo một khung có trúng: thân lúc này, hình hiệu ứng vừa sinh (gom theo hàm), số sát thương.
  DQ.doTrung = function (e, fr, f, sa) {
    const B = DQ.body(e), bb = DQ.bbox(B), ex = e.x, ey = e.y;
    const res = { f, src: sa, face: e.face, b: bb ? { x0: bb.x0 - ex, x1: bb.x1 - ex, y0: bb.y0 - ey, y1: bb.y1 - ey } : null, nhom: [], so: [] };
    for (const r of fr) {
      if (r.o) res.o = { type: r.o.type, heavy: !!r.o.heavy, crit: !!r.o.crit, ranged: !!r.o.ranged, el: r.o.el || null, dir: r.o.dir };
      for (const q of r.N) if (q.chu || r.laMt) res.so.push({ api: r.api, x: q.x0 - ex, y: q.y0 - ey, moi: q.moi });
      // hình gần quái (neo trong 70 điểm)
      const E = r.E.filter((o) => o.x != null && Math.abs(o.x - ex) < 70 && Math.abs(o.y - ey) < 140);
      if (!E.length) continue;
      const g = chupHinh(e, E, 0.05), eb = DQ.bbox(g);
      const cmp = eb ? DQ.cmp(B, g) : null;
      if (DQ.CHUP && eb && bb && DQ.CHUP(r.api)) res.anh = (res.anh || []).concat([DQ.ghep(B, g, [Math.min(bb.x0, eb.x0) - 14, Math.min(bb.y0, eb.y0) - 16, Math.max(bb.x1, eb.x1) + 14, Math.max(bb.y1, eb.y1) + 8], { than: bb, tam: [eb.cx, eb.cy], dung: { x0: bb.x0, x1: bb.x1, y0: bb.y0, y1: bb.y1 - 0.2 * (bb.y1 - bb.y0) } })]);
      const gt = eb ? +DQ.ganThan(B, eb.cx, eb.cy, 50).toFixed(1) : null;
      res.nhom.push({ gt, api: r.api, laMt: r.laMt, ma: E.map((o) => o.ma || o.ty).join(','), neo: E.map((o) => [Math.round(o.x - ex), Math.round(o.y - ey)]),
        e: eb ? { x0: eb.x0 - ex, x1: eb.x1 - ex, y0: eb.y0 - ey, y1: eb.y1 - ey, cx: eb.cx - ex, cy: eb.cy - ey, n: Math.round(eb.n) } : null, inn: cmp ? +cmp.inn.toFixed(2) : null });
    }
    return res;
  };
})();
// ======================= TRẠNG THÁI TRÊN THÂN QUÁI =======================
(function () {
  const DQ = window.DQ, W = () => G.getWorld();
  const TT = {
    chay: (e) => { e.st.fire = 3; e.st.fireDmg = 1; },
    doc: (e) => { e.st.poisonN = 3; e.st.poisonT = 3; e.st.poisonDmg = 1; },
    bang: (e) => { e.st.iceN = 2; e.st.iceT = 3; },
    dongbang: (e) => { e.st.frozen = 2; e.st.iceN = 3; e.st.iceT = 3; },
    choang: (e) => { e.st.stun = 2; },
    troi: (e) => { e.st.root = 2; e.boTroiT = 2; e.boTroiT0 = 2.4; const P = G.getRun().P; if (!P.boSkill) P.boSkill = { thu: 1 }; },
    cham: (e) => { e.boChamT = 2; e.boCham = 0.5; const P = G.getRun().P; if (!P.boSkill) P.boSkill = { thu: 1 }; },
    loyeu: (e) => { e.exposed = 2; e.tired = 2; },
  };
  DQ.TT = Object.keys(TT); window.DQ_TT = TT;
  const S = () => G.fx.state();
  function sach() { const s = S(); s.E.length = 0; s.np = 0; s.N.length = 0; }
  function bb(g) { return DQ.bbox(g); }
  function rel(b, e) { return b ? { x0: +(b.x0 - e.x).toFixed(1), x1: +(b.x1 - e.x).toFixed(1), y0: +(b.y0 - e.y).toFixed(1), y1: +(b.y1 - e.y).toFixed(1), cx: +(b.cx - e.x).toFixed(1), cy: +(b.cy - e.y).toFixed(1), n: Math.round(b.n) } : null; }
  // e đã dựng (DQ.spawn). ten: tên trạng thái. Trả số đo.
  DQ.trangThai = function (e, ten) {
    const st0 = e.st, ex0 = e.x; e.st = G.st0();
    const B = DQ.body(e), b0 = bb(B);
    for (let i = 0; i < 6; i++) G.fx.update(1 / 60);
    sach();
    const N0 = DQ.fxOnly(e, { boIcon: true }), I0 = DQ.fxOnly(e, { chiIcon: true });
    TT[ten](e);
    for (let i = 0; i < 6; i++) G.fx.update(1 / 60);
    sach();
    const khung = (g) => b0 ? DQ.cat(g, b0.x0 - 40, b0.y0 - 50, b0.x1 + 40, b0.y1 + 24) : g;
    const E = khung(DQ.tru(DQ.fxOnly(e, { boIcon: true }), N0)), Fu = DQ.full(e), c = DQ.cmp(B, E, Fu), eb = c.e;
    const Ic = bb(khung(DQ.tru(DQ.fxOnly(e, { chiIcon: true }), I0)));
    const out = { ten, b: rel(b0, e), e: rel(eb, e), inn: c.inn == null ? null : +c.inn.toFixed(2), front: c.front == null ? null : +c.front.toFixed(2), icon: rel(Ic, e) };
    const doRieng = (fn) => { fn(); sach(); const r = bb(DQ.cat(DQ.tru(DQ.fxOnly(e, { boIcon: true }), N0), b0.x0 - 40 + (e.x - ex0), b0.y0 - 50, b0.x1 + 40 + (e.x - ex0), b0.y1 + 24)); return r; };
    if (eb) {
      out.gt = +DQ.ganThan(B, eb.cx, eb.cy, 50).toFixed(1);
      if (!e.isBoss) { const E2 = doRieng(() => { e.mvLift = 0.225; }); e.mvLift = 0; out.hat = E2 ? +(E2.cy - eb.cy).toFixed(1) : null; }
      const x0 = e.x; const E3 = doRieng(() => { e.x += 20; }); e.x = x0; out.di = E3 ? +(E3.cx - eb.cx).toFixed(1) : null;
      const s1 = e.st, bt = e.boTroiT, bc = e.boChamT, ex = e.exposed;
      const E5 = doRieng(() => { e.st = G.st0(); e.boTroiT = 0; e.boChamT = 0; e.exposed = 0; });
      out.het = E5 ? Math.round(E5.n) : 0;
      e.st = s1; e.boTroiT = bt; e.boChamT = bc; e.exposed = ex;
    }
    e.st = st0;
    return out;
  };
  // Thân bị hất tung: chụp thân với mvLift (clean() xoá mvLift nên chụp riêng)
  DQ.thanHat = function (e) {
    e.mvLift = 0.225; DQ.iso(true);
    const F = G.fx, L = { drawGround: F.drawGround, drawOver: F.drawOver, entity: F.entity, proj: F.proj, projAnh: F.projAnh, drawUI: F.drawUI, sorted: F.sorted }, BT = G.baoTruoc;
    const st = e.st; e.st = G.st0();
    for (const k in L) F[k] = null; G.baoTruoc = null;
    const w = W(), en = w.ents, bo = w.boss; w.ents = e.__laBoss ? [] : [e]; w.boss = e.__laBoss ? e : null;
    try { G.noRender = false; G.drawWorld(G.getRun().r); } finally { for (const k in L) F[k] = L[k]; G.baoTruoc = BT; w.ents = en; w.boss = bo; e.st = st; }
    const cv = G.wx.canvas, d = G.wx.getImageData(0, 0, cv.width, cv.height).data, m = new Uint8Array(cv.width * cv.height);
    for (let i = 0, j = 3; i < m.length; i++, j += 4) if (d[j] >= 128) m[i] = 1;
    e.mvLift = 0;
    return rel(DQ.bbox({ m, w: cv.width, h: cv.height }), e);
  };
  // Chết khi đang dính trạng thái: hình trạng thái có tắt không
  DQ.chetKhiDinh = function (q) {
    const e = DQ.spawn(q); if (!e) return null;
    TT.chay(e); TT.doc(e); TT.bang(e); TT.choang(e);
    for (let i = 0; i < 4; i++) G.fx.update(1 / 60);
    const st = e.st; e.st = G.st0(); sach(); const N0 = DQ.fxOnly(e); e.st = st;
    sach();
    const E0 = DQ.bbox(DQ.tru(DQ.fxOnly(e), N0));
    e.hp = 1; e.invuln = 0; if (e.isBoss) { e.layers = []; }
    G.noRender = false;
    G.damage(e, 1e9, { src: 'hit' });
    let E1 = null;
    for (let i = 0; i < 3; i++) { G.tick(); }
    sach();
    E1 = DQ.bbox(DQ.tru(DQ.fxOnly(e), N0));
    return { truoc: E0 ? Math.round(E0.n) : 0, sau: E1 ? Math.round(E1.n) : 0, chet: !!(e.dead || e.dying != null) };
  };
  // Hình một lần khi vừa dính: G.fx.status (nhúm hạt), G.fx.freeze (vừa đóng băng)
  DQ.motLan = function (e, api, el) {
    const B = DQ.body(e); sach();
    const s = S(), e0 = s.E.length;
    G.noRender = false;
    if (api === 'freeze') G.fx.freeze(e); else G.fx.status(e, el);
    const E = s.E.slice(e0).map((o) => Object.assign({}, o));
    if (!E.length) return { api, el, e: null };
    const g = DQ.chupHinh(e, E, 0.05), eb = DQ.bbox(g), c = eb ? DQ.cmp(B, g) : null;
    return { api, el, e: rel(eb, e), b: rel(DQ.bbox(B), e), inn: c ? +c.inn.toFixed(2) : null, gt: eb ? +DQ.ganThan(B, eb.cx, eb.cy, 50).toFixed(1) : null, ma: E.map((o) => o.ma || o.ty).join(',') };
  };
})();
// ======================= ĐÒN CỦA QUÁI: CHỖ PHÁT RA =======================
(function () {
  const DQ = window.DQ, W = () => G.getWorld();
  const QA = ['enemySwing', 'lunge'];
  let REC = null, daBoc = false, nguon = null;
  function boc() {
    if (daBoc) return; daBoc = true;
    for (const k of QA) {
      const f0 = G.fx[k]; if (typeof f0 !== 'function') continue;
      G.fx[k] = function (e) {
        const S = G.fx.state(); if (!REC || !S || e !== nguon) return f0.apply(this, arguments);
        const e0 = S.E.length; const r = f0.apply(this, arguments);
        REC.push({ k, E: S.E.slice(e0).map((o) => Object.assign({}, o)), ex: e.x, ey: e.y, face: e.face });
        return r;
      };
    }
  }
  // Cho quái đánh Cu Tí (Cu Tí bất tử, đứng yên cách quái 60 điểm về phía ben). Ghi: đạn mới (chỗ thấy đầu tiên), vệt cào, bom ném.
  DQ.quaiDanh = function (q, ben, o) {
    o = o || {};
    boc();
    const e = DQ.spawn(q); if (!e) return null;
    const w = W(), P = G.getRun().P;
    e.speed = (G.ROLES[e.role] || {}).speed || 40; e.cd = 0.3; e.maxhp = e.hp = 1e9; if (e.isBoss) { e.busy = 0; e.atkCd = 0; e.layers = []; }
    if (o.pha != null && e.isBoss) { e.hp = e.maxhp * (o.pha === 1 ? 0.6 : 0.3); }
    if (!e.__laBoss || e.kind === 'mini') e.x = w.geo.cx;
    P.x = e.x + ben * (o.d || 60); P.y = e.y; P.inv = 99;
    nguon = e; REC = [];
    G.botInput = () => ({ mx: 0, my: 0 });
    const seen = new Set(w.projs), zs = new Set(w.zones), out = { dan: [], cao: [], bom: [] };
    const F = o.f || 300;
    for (let i = 0; i < F; i++) {
      P.x = G.clamp(e.x + ben * (o.d || 60), w.x0 + 6, w.x1 - 6); P.y = G.clamp(e.y, w.y0, w.y1); P.inv = 99; P.hp = P.maxhp; P.dead = false; if (w.over) w.over = null;
      e.hp = Math.max(e.hp, 1); if (o.pha == null || !e.isBoss) e.hp = e.maxhp;
      const r0 = REC.length;
      G.noRender = false; G.tick(); G.click = null;
      const moi = W().projs.filter((p) => !seen.has(p) && p.team !== 'player');
      for (const p of W().projs) seen.add(p);
      const zm = W().zones.filter((z) => !zs.has(z));
      for (const z of W().zones) zs.add(z);
      const can = moi.length && out.dan.length < 4 || REC.length > r0 && out.cao.length < 3 || zm.some((z) => z.bomb || z.kn && z.kn.x0 != null) && out.bom.length < 3;
      if (!can) continue;
      const B = DQ.body(e), bb = DQ.bbox(B);
      if (!bb) continue;
      const b = { x0: bb.x0 - e.x, x1: bb.x1 - e.x, y0: bb.y0 - e.y, y1: bb.y1 - e.y, cx: bb.cx - e.x, cy: bb.cy - e.y };
      for (const p of moi) if (out.dan.length < 4 && (!p.src || p.src === e)) {
        // chỗ đạn được sinh: lùi lại một bước bay (đạn đã bay một khung)
        const vx = p.x - p.vx / 60, vy = p.y - (p.vy || 0) / 60, z = p.z || 10;
        out.dan.push({ f: i, kind: p.kind, x: +(vx - e.x).toFixed(1), y: +(vy - z - e.y).toFixed(1), z, face: e.face, gt: +DQ.ganThan(B, vx, vy - z, 50).toFixed(1), b, tam: +Math.hypot(vx - bb.cx, vy - z - bb.cy).toFixed(1) });
      }
      for (let j = r0; j < REC.length && out.cao.length < 3; j++) {
        const r = REC[j]; if (!r.E.length) continue;
        const g = DQ.chupHinh(e, r.E, 0.04), eb = DQ.bbox(g);
        out.cao.push({ f: i, k: r.k, ma: r.E.map((x) => x.ma || x.ty).join(','), face: r.face, b, e: eb ? { x0: eb.x0 - e.x, x1: eb.x1 - e.x, y0: eb.y0 - e.y, y1: eb.y1 - e.y, cx: eb.cx - e.x, cy: eb.cy - e.y } : null, gt: eb ? +DQ.ganThan(B, eb.cx, eb.cy, 50).toFixed(1) : null });
      }
      for (const z of zm) if (z.kn && z.kn.x0 != null && z.kn.src === e && out.bom.length < 3) out.bom.push({ f: i, vat: true, x: +(z.kn.x0 - e.x).toFixed(1), y: +(z.kn.y0 - e.y).toFixed(1), face: e.face, b, gt: +DQ.ganThan(B, z.kn.x0, z.kn.y0, 50).toFixed(1) });
      for (const z of zm) if (z.bomb && out.bom.length < 3) out.bom.push({ f: i, x: +(z.bomb.x0 - e.x).toFixed(1), y: +(z.bomb.y0 - e.y).toFixed(1), face: e.face, b, gt: +DQ.ganThan(B, z.bomb.x0, z.bomb.y0, 50).toFixed(1) });
      if (out.dan.length >= 4 && out.cao.length >= 3) break;
    }
    REC = null; nguon = null;
    return out;
  };
})();
// ======================= ẢNH MINH HOẠ (×3) =======================
(function () {
  const DQ = window.DQ, W = () => G.getWorld();
  // Ghép thân B (đã chụp) + hiệu ứng E (đã chụp) → ảnh cắt quanh quái, phóng ×3 (điểm ảnh game ×3), khung thân xanh, tâm hiệu ứng đỏ.
  // khung: [x0, y0, x1, y1] thế giới. chu: dòng chữ.
  DQ.ghep = function (B, E, khung, o) {
    o = o || {};
    const k = G.NET || 1, cam = G.camVe ? G.camVe(W()) : Math.round(W().cam || 0);
    const X0 = Math.max(0, Math.floor((khung[0] - cam) * k)), Y0 = Math.max(0, Math.floor(khung[1] * k)), X1 = Math.min(B.w, Math.ceil((khung[2] - cam) * k)), Y1 = Math.min(B.h, Math.ceil(khung[3] * k));
    const w = X1 - X0, h = Y1 - Y0, S = 3 / k * 1; // ×3 theo điểm game
    const cv = document.createElement('canvas'); cv.width = Math.round(w * S); cv.height = Math.round(h * S) + 14;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    c.fillStyle = o.nen || '#3a3f4a'; c.fillRect(0, 0, cv.width, cv.height);
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; const t = tmp.getContext('2d'); const id = t.createImageData(w, h);
    const put = (g) => { if (!g) return; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y + Y0) * g.w + x + X0, j = i * 4, a = g.d[j + 3]; if (!a || (g.m && !g.m[i])) continue; const q = (y * w + x) * 4, al = a / 255; id.data[q] = id.data[q] * (1 - al) + g.d[j] * al; id.data[q + 1] = id.data[q + 1] * (1 - al) + g.d[j + 1] * al; id.data[q + 2] = id.data[q + 2] * (1 - al) + g.d[j + 2] * al; id.data[q + 3] = Math.max(id.data[q + 3], a); } };
    put(B); put(E);
    t.putImageData(id, 0, 0);
    c.drawImage(tmp, 0, 0, w, h, 0, 0, Math.round(w * S), Math.round(h * S));
    const tx = (x) => ((x - cam) * k - X0) * S, ty = (y) => (y * k - Y0) * S;
    if (o.than) { c.strokeStyle = 'rgba(80,255,120,0.9)'; c.lineWidth = 1; c.strokeRect(tx(o.than.x0) + 0.5, ty(o.than.y0) + 0.5, (o.than.x1 - o.than.x0) * 3, (o.than.y1 - o.than.y0) * 3); }
    if (o.dung) { c.strokeStyle = 'rgba(80,200,255,0.9)'; c.setLineDash([3, 3]); c.strokeRect(tx(o.dung.x0) + 0.5, ty(o.dung.y0) + 0.5, (o.dung.x1 - o.dung.x0) * 3, (o.dung.y1 - o.dung.y0) * 3); c.setLineDash([]); }
    if (o.tam) { c.strokeStyle = '#ff3030'; c.lineWidth = 2; const X = tx(o.tam[0]), Y = ty(o.tam[1]); c.beginPath(); c.moveTo(X - 6, Y); c.lineTo(X + 6, Y); c.moveTo(X, Y - 6); c.lineTo(X, Y + 6); c.stroke(); }
    if (o.so) { c.strokeStyle = '#ffe040'; c.lineWidth = 2; c.strokeRect(tx(o.so[0] - 6), ty(o.so[1] - 4), 36, 24); c.fillStyle = '#ffe040'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.fillText('12', tx(o.so[0]), ty(o.so[1]) + 6); c.textAlign = 'left'; }
    if (o.chu) { c.fillStyle = '#fff'; c.font = '10px sans-serif'; c.fillText(o.chu, 3, cv.height - 3); }
    return cv.toDataURL('image/png');
  };
  // Ảnh một trạng thái trên thân (thân + hiệu ứng, kể cả khi bị hất)
  DQ.anhTT = function (q, ten, face, hat) {
    const e = DQ.spawn(q, { face }); e.face = face;
    const B0 = DQ.body(e), bb = DQ.bbox(B0);
    window.DQ_TT[ten](e);
    for (let i = 0; i < 6; i++) G.fx.update(1 / 60);
    const s = G.fx.state(); s.E.length = 0; s.np = 0;
    if (hat) e.mvLift = 0.225;
    const F = DQ.full(e);
    const Bh = hat ? DQ.thanMask(e) : B0;
    const k = [bb.x0 - 20, bb.y0 - 26, bb.x1 + 20, bb.y1 + 10];
    const r = DQ.ghep(F, null, k, { than: hat ? { x0: bb.x0, x1: bb.x1, y0: bb.y0 - 10, y1: bb.y1 - 10 } : bb });
    e.mvLift = 0; void Bh;
    return r;
  };
  DQ.thanMask = function () { return null; };
})();

// Ảnh số sát thương: thân + ô số ở đúng chỗ số mọc ra (số vẽ ở lớp giao diện nên vẽ lại ô vàng)
(function () {
  const DQ = window.DQ;
  DQ.anhSo = function (q) {
    const r = DQ.danh(q, 'kiem', -1); if (!r || !r.list.length) return null;
    const x = r.list.find((a) => a.so && a.so.length); if (!x) return null;
    const e = G.getWorld().boss || G.getWorld().ents[0];
    const B = DQ.body(e), bb = DQ.bbox(B), s = x.so[0];
    const sy = e.y + s.y, sx = e.x + s.x;
    return DQ.ghep(B, null, [bb.x0 - 16, Math.min(bb.y0, sy - 8) - 8, bb.x1 + 16, bb.y1 + 6], { than: bb, so: [sx, sy] });
  };
  // Khung hình cho GIF: hàm dựng cảnh fn(e, i) rồi chụp toàn cảnh
  DQ.khungGif = function (q, ten, n, kieu) {
    const e = DQ.spawn(q, { face: -1 }); e.face = -1;
    const B0 = DQ.body(e), bb = DQ.bbox(B0), out = [];
    if (ten) window.DQ_TT[ten](e);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < 2; j++) G.fx.update(1 / 60);
      const s = G.fx.state(); s.E.length = 0; s.np = 0;
      if (kieu === 'hat') e.mvLift = 0.45 * (1 - i / (n - 1));
      if (kieu === 'di') e.x = bb.cx + Math.sin(i / n * 6.28) * 18;
      const F = DQ.full(e);
      out.push(DQ.ghep(F, null, [bb.x0 - 40, bb.y0 - 34, bb.x1 + 40, bb.y1 + 10], {}));
    }
    e.mvLift = 0;
    return out;
  };
})();
