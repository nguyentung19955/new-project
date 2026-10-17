// Đo HÌNH BÁO TRƯỚC có tắt đúng lúc không (tests/bao_truoc_tat.py). Chỉ dùng khi kiểm tra, không nạp trong game thật.
// Không sửa luật chơi: chỉ bọc tạm G.baoTruoc.zone / add / dat / draw để biết khung nào vẽ hình báo của vùng nào,
// và ghi các "sự kiện đòn ra" (vùng gây sát thương nổ, đạn bay ra, quái ra đòn, vật tự quản xuất hiện, em bé bị đánh trúng).
(function () {
  const G = window.G, BT = G.baoTruoc;
  const W = () => G.getWorld();
  const D = (window.BTD = { on: false });
  let cur = null, nid = 0;
  const ids = new WeakMap();
  const idOf = (o) => { let v = ids.get(o); if (v == null) { v = ++nid; ids.set(o, v); } return v; };
  D.idOf = idOf;
  const zone0 = BT.zone;
  BT.zone = function (z) {
    cur = z; const n = BT.ghosts.length; let r;
    try { r = zone0.call(this, z); } finally { cur = null; }
    for (let i = n; i < BT.ghosts.length; i++) BT.ghosts[i]._z = z;
    return r;
  };
  const add0 = BT.add;
  BT.add = function (it) { if (it && !it._z) it._z = cur; if (D.on) D.adds.push(it); return add0.call(this, it); };
  const dat0 = BT.dat;
  BT.dat = function () { const ok = D.on && BT.anhBat() && W() === D.lastW; const r = dat0.apply(this, arguments); if (ok) { D.gh = BT.ghosts.slice(); D.go = BT.gone.slice(); } return r; }; // sau khi BT.dat lọc: đúng những hình vẽ ở khung này
  const draw0 = BT.draw;
  BT.draw = function () { const r = draw0.apply(this, arguments); D.lastW = W(); if (D.on && !BT.anhBat()) { D.gh = BT.ghosts.slice(); D.go = BT.gone.slice(); } return r; };

    // ---- một lượt đo ----
  D.begin = function () {
    D.on = true; D.adds = []; D.gh = []; D.go = []; D.rec = new Map(); D.ev = []; D.prevZ = new Map(); D.prevP = new Set(); D.prevA = new Map(); D.prevKn = new Set(); D.prevE = new Set(W().ents);
    D.t0 = G.time; D.hurt = [];
  };
  const T = () => +(G.time - D.t0).toFixed(4);
  const geoOf = (z) => ({ shape: z.shape, x: z.x, y: z.y, r: z.r, w: z.w, h: z.h, ang: z.ang, len: z.len, span: z.span, r0: z.r0, r1: z.r1, gaps: z.gaps, gw: z.gw });
  function srcOf(z) { return z && z.src ? z.src : null; }
  function tenSrc(s) { if (!s) return '?'; return s.art || s.name || s.role || '?'; }
  // trước mỗi khung: nhớ trạng thái
  D.pre = function () {
    const w = W();
    D.prevZ = new Map(); for (const z of w.zones) D.prevZ.set(z, z.t);
    D.prevP = new Set(w.projs);
    D.prevA = new Map(); for (const e of w.ents) if (e.act) D.prevA.set(e, !!e.act.fired);
    if (w.boss) { D.prevBL = !!w.boss.lunge; D.prevPh = w.boss.phase; }
  };
  const ev = (k, s, x, y, extra) => D.ev.push(Object.assign({ k, t: T(), s: s ? idOf(s) : 0, x, y }, extra || {}));
  // sau mỗi khung tính: sự kiện đòn ra
  D.post = function () {
    const w = W(), now = new Set(w.zones);
    for (const [z, t] of D.prevZ) {
      if (t > 0 && z.t <= 0 && !z.dead) { // vùng nổ
        if (z.dmg > 0 && z.team !== 'player' && z.team !== 'fx') ev('no', srcOf(z), z.x, z.y, { g: geoOf(z), zid: idOf(z) });
        const r = D.rec.get('z' + idOf(z)); if (r && r.fire == null) r.fire = T();
      } else if (t > 0 && (!now.has(z) || z.dead)) { const r = D.rec.get('z' + idOf(z)); if (r && r.huy == null) r.huy = T(); }
    }
    for (const z of w.zones) if (!D.prevZ.has(z) && z.shape === 'kn' && z.kn) ev('vat', z.kn.src || null, z.x, z.y);
    for (const o of w.projs) if (!D.prevP.has(o) && o.team === 'enemy') ev('dan', o.src || null, o.x, o.y);
    for (const e of w.ents) if (e.act && e.act.fired && D.prevA.get(e) === false) ev('ra', e, e.x, e.y);
    for (const e of w.ents) if (!D.prevE.has(e)) ev('hien', e, e.x, e.y);
    D.prevE = new Set(w.ents);
    const b = w.boss;
    if (b && b.lunge && !D.prevBL) ev('lao', b, b.x, b.y);
  };
  // sau khi vẽ một khung: ghi hình báo nào đang hiện
  D.seen = function () {
    const w = W(), t = T();
    const one = (it, kind) => {
      let key, z = it._z, s = null;
      if (z) { key = 'z' + idOf(z); s = srcOf(z); }
      else {
        // hình báo không gắn vùng: vòng gai (spikeUp) hoặc vòng chỗ quái mọc
        const e = w.ents.find((q) => q.spikeUp > 0 && Math.abs(q.x - it.x) < 0.5 && Math.abs(q.y - it.y) < 0.5);
        if (e) { key = 'gai' + idOf(e); s = e; } else key = 'moc' + Math.round(it.x) + ',' + Math.round(it.y);
      }
      let r = D.rec.get(key);
      if (!r) {
        r = { key, kind: z ? (z.wall ? 'tuong' : 'vung') : key.slice(0, 3) === 'gai' ? 'gai' : 'moc', first: t, last: t, lastTele: null, lastFlash: null, lastHuy: null, s: s ? idOf(s) : 0, ten: tenSrc(s),
          dmg: z ? z.dmg || 0 : 0, bao: z ? !!(z.knBao || z.ctBao || !(z.dmg > 0)) : true, t0: z ? z.t0 : null, shape: z ? (z.wall ? 'wall' : z.shape) : 'circle', g: z ? geoOf(z) : { shape: 'circle', x: it.x, y: it.y, r: it.r },
          knGiu: z ? !!z.knGiu : false, cancel: z ? !!z.cancel : false, skill: z ? z.skill || null : null, then: z ? !!z.then : false, state: {} };
        if (z) D.rec.set('z' + idOf(z), r); else D.rec.set(key, r);
        r.ph0 = w.boss ? w.boss.phase : null;
      }
      r.last = t;
      if (kind === 'tele') r.lastTele = t; else if (kind === 'flash') r.lastFlash = t; else r.lastHuy = t;
      // trạng thái của quái lúc hình còn hiện
      if (s) {
        const st = s.st || {};
        const mark = (k) => { if (r.state[k] == null) r.state[k] = [t, t]; else r.state[k][1] = t; };
        if (s.dead) mark('chet');
        else if (st.stun > 0 || st.frozen > 0) mark('choang');
        if (w.boss && s === w.boss && r.ph0 != null && w.boss.phase !== r.ph0) mark('doiPha');
        if (s.act === null && s.role && !s.isBoss && kind === 'tele' && !r.knGiu) mark('hetDon');
      }
    };
    for (const it of D.adds) one(it, 'tele');
    for (const g of D.gh) one(g, 'flash');
    for (const g of D.go) one(g, 'huy');
    D.nVis = D.adds.length + D.gh.length + D.go.length;
    D.adds = []; D.gh = []; D.go = [];
  };
  // Một khung: tính + vẽ như game thật (vòng vẽ thật bị chặn khi đo)
  D.frame = function (each) {
    D.pre();
    AU.manual = true;
    try { G.noRender = false; G.tick(); G.click = null; } finally { AU.manual = false; }
    D.post();
    G.ui.begin(); G.scene.draw();
    D.seen();
    if (each) each();
  };
  // kết quả: gắn "lúc đòn thật ra" cho từng hình báo
  const pts = (g) => {
    const out = [[g.x, g.y]];
    if (g.shape === 'line') for (let i = 1; i <= 4; i++) out.push([g.x + Math.cos(g.ang) * g.len * i / 4, g.y + Math.sin(g.ang) * g.len * i / 4]);
    else if (g.shape === 'rect') out.push([g.x + g.w / 2, g.y + g.h / 2], [g.x + g.w * 0.1, g.y + g.h * 0.5], [g.x + g.w * 0.9, g.y + g.h * 0.5]);
    else if (g.shape === 'cone') for (let i = 0; i < 3; i++) { const a = g.ang + (i - 1) * g.span / 3; out.push([g.x + Math.cos(a) * g.r * 0.6, g.y + Math.sin(a) * g.r * 0.6]); }
    else if (g.shape === 'donut') for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, rr = (g.r0 + g.r1) / 2; out.push([g.x + Math.cos(a) * rr, g.y + Math.sin(a) * rr * (G.ZK || 1)]); }
    return out;
  };
  const inG = (g, x, y, pad) => { try { if (g.shape === 'wall') return false; return G.inZone(g, { x, y }, pad || 0) || (g.shape === 'circle' && Math.hypot(x - g.x, (y - g.y) / (G.ZK || 0.6)) <= g.r + (pad || 0)); } catch (e) { return false; } };
  D.result = function () {
    const out = [];
    for (const r of D.rec.values()) {
      let atk = null, how = null;
      if (!r.bao) { if (r.fire != null) { atk = r.fire; how = 'tu-no'; } } // vùng gây sát thương: đòn ra đúng lúc chính nó nổ
      else if (r.kind === 'moc') { const e = D.ev.find((q) => q.k === 'hien' && q.t >= r.first - 0.001 && Math.hypot(q.x - r.g.x, q.y - r.g.y) < 6); if (e) { atk = e.t; how = 'hien'; } }
      else if (r.kind === 'vung' || r.kind === 'tuong' || r.kind === 'gai') {
        // vùng chỉ để báo: đòn thật = sự kiện đầu tiên của cùng con quái, sau lúc hình hiện, nằm trong vùng báo
        for (const e of D.ev) {
          if (e.k === 'hien' || e.t < r.first + 0.034 || (r.s && e.s !== r.s)) continue; // sự kiện cùng khung với lúc vùng báo sinh ra là chính lúc ném / đặt, chưa phải đòn
          let hit = false;
          if (r.kind === 'tuong') hit = false;
          else if (e.k === 'no') hit = pts(e.g).some((p) => inG(r.g, p[0], p[1], 8)) || pts(r.g).some((p) => inG(e.g, p[0], p[1], 8));
          else if (r.g.shape === 'line' || r.g.shape === 'cone') hit = Math.hypot(e.x - r.g.x, e.y - r.g.y) < (r.g.w || 0) / 2 + 14; // đòn theo đường / quạt bắt đầu ở GỐC vạch
          else hit = inG(r.g, e.x, e.y, 10);
          if (hit) { atk = e.t; how = e.k; break; }
        }
        if (atk == null && r.fire != null) { atk = r.fire; how = 'het-gio'; }
      }
      const den = (x) => (x == null ? null : +x.toFixed(3));
      const sau = atk != null ? den(r.last - atk) : null;
      out.push({ key: r.key, kind: r.kind, ten: r.ten, skill: r.skill, shape: r.shape, bao: r.bao, dmg: r.dmg, t0: den(r.t0), first: den(r.first), last: den(r.last), lastTele: den(r.lastTele), lastFlash: den(r.lastFlash), lastHuy: den(r.lastHuy),
        fire: den(r.fire), huy: den(r.huy), vanRa: !!((r.fire != null && r.dmg > 0) || r.knGiu), atk: den(atk), how, sau, teleSau: atk != null && r.lastTele != null ? den(r.lastTele - atk) : null, state: r.state, knGiu: r.knGiu, then: r.then });
    }
    D.on = false;
    return out;
  };
})();
