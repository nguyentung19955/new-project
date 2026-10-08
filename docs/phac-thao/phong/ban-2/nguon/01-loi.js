// Phác thảo kiểu phòng cho game Linh Khí: phần lõi.
// Chạy bên trong trang game/index.html (do dung.py nạp vào), dùng lại hình thật của game:
// đặt hero và quái vào một "phòng" tự bày, cho game chạy thật vài chục khung hình rồi vẽ bằng G.drawWorld,
// chỉ thay phần nền (G.art.bg) bằng kiến trúc phòng tự vẽ. Không sửa gì trong mã game.
(function () {
  const G = window.G, A = G.art;
  const PT = (window.PT = {});
  PT.realBg = A.bg; // nền phòng thật của game, dùng cho Kiểu B
  PT.W = 480; PT.H = 270;
  PT.FONT = 'Inter, "DejaVu Sans", sans-serif';

  // ---------- tiện ích vẽ ----------
  const p = (PT.p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); });
  PT.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return function () { s += 0x6d2b79f5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  PT.mk = function (w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return c; };
  // Quầng sáng mềm (cộng màu)
  PT.glow = function (c, x, y, r, rgb, a) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  };
  // Bóng tối mềm hình chữ nhật có hướng: side = 't' | 'b' | 'l' | 'r'
  PT.shade = function (c, x, y, w, h, side, a, rgb) {
    rgb = rgb || '0,0,0';
    const g = side === 't' ? c.createLinearGradient(0, y, 0, y + h) : side === 'b' ? c.createLinearGradient(0, y + h, 0, y) : side === 'l' ? c.createLinearGradient(x, 0, x + w, 0) : c.createLinearGradient(x + w, 0, x, 0);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(x, y, w, h);
  };
  PT.ell = function (c, x, y, rx, ry, col) { A.ellipse(c, Math.round(x), Math.round(y), rx, ry, col); };
  // Hình thang sáng tràn từ cửa: (x0..x1) ở mép cửa, toả ra theo hướng dir trong len điểm ảnh
  PT.spill = function (c, dir, a0, a1, at, len, grow, rgb, alpha) {
    for (let k = 0; k < 3; k++) {
      const L = Math.round(len * (1 - k * 0.28)), gw = grow * (1 - k * 0.28);
      for (let i = 0; i < L; i++) {
        const u = i / L, ex = gw * u, al = alpha * (1 - u) * (1 - u);
        c.fillStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')';
        if (dir === 's') c.fillRect(Math.round(a0 - ex), at + i, Math.round(a1 - a0 + ex * 2), 1);
        else if (dir === 'n') c.fillRect(Math.round(a0 - ex), at - i, Math.round(a1 - a0 + ex * 2), 1);
        else if (dir === 'e') c.fillRect(at + i, Math.round(a0 - ex), 1, Math.round(a1 - a0 + ex * 2));
        else c.fillRect(at - i, Math.round(a0 - ex), 1, Math.round(a1 - a0 + ex * 2));
      }
    }
  };

  // ---------- dựng cảnh bằng chính game ----------
  PT.stopLoop = function () { window.requestAnimationFrame = () => 0; };
  // o: { reg, el, bounds:{x0,x1,y0,y1}, hero:{x,y,face}, mobs:[{role,x,y,hp,el,resist,face}], props:[...], frames, input }
  PT.scene = function (o) {
    PT.stopLoop();
    G.resetSave();
    const sv = G.save; sv.sound = false; if (sv.tut) sv.tut.done = true;
    for (const k of G.HKEYS) { sv.heroes[k].unlocked = true; sv.heroes[k].lvl = 12; }
    if (o.el) { const w = G.weaponById(sv.carry[0]); w.marks[o.el] = 140; w.branch = o.el; w.tier = 1; }
    G.startStage(o.reg, 2, 0); G.gotoRoom(3);
    const S = G.getRun(), W = S.W, P = S.P;
    for (const k of ['ents', 'props', 'zones', 'projs', 'texts', 'parts', 'slashes']) W[k].length = 0;
    W.waves = [['x']]; W.waveI = 0; W.cleared = false; W.banner = null; W.cam = 0; W.w = 480; S.hint = null;
    Object.assign(W, o.bounds);
    P.x = o.hero.x; P.y = o.hero.y; P.face = o.hero.face || 1; P.inv = 0; P.mana = P.maxmana * (o.mana == null ? 0.55 : o.mana);
    if (o.hp != null) P.hp = Math.round(P.maxhp * o.hp);
    for (const m of o.mobs || []) {
      const e = G.spawnEnemy(m.role, m.x, m.y, { el: m.el, resist: m.resist });
      e.maxhp *= m.hp || 40; e.hp = e.maxhp; e.face = m.face || (m.x > P.x ? -1 : 1);
      if (m.cd != null) e.cd = m.cd;
      if (m.speed != null) e.speed *= m.speed;
    }
    for (const pr of o.props || []) W.props.push(Object.assign({}, pr));
    // vùng nguy hiểm đang báo trước (đỏ, đứng yên ở nửa chừng) và vũng hệ nằm lâu
    for (const z of o.zones || []) {
      if (z.pool) W.zones.push({ shape: 'circle', x: z.x, y: z.y, r: z.r, t: 0, pool: true, team: 'enemy', el: z.pool, life: 99, tick: 99, dmg: 0 });
      else if (z.w) G.zoneRect(z.x, z.y, z.w, z.h, 50, 0, null, { team: 'enemy', t0: 100 });
      else G.zoneCircle(z.x, z.y, z.r, 50, 0, null, { team: 'enemy', t0: 100 });
    }
    PT.input = o.input || null;
    // Trong ảnh phác thảo hero không mất máu, để màn hình không bị viền đỏ che
    if (!PT.hurt0) { PT.hurt0 = G.hurtPlayer; G.hurtPlayer = function () { return false; }; }
    G.rnd = PT.rng(o.seed || 7);
    for (let i = 0; i < (o.frames || 0); i++) { G.tick(); G.click = null; }
    return { S, W, P };
  };
  // Điều khiển hero: PT.input = null thì để bot của game tự chơi, có giá trị thì giữ nguyên các nút đó.
  PT.input = null;
  const bot = G.botInput;
  G.botInput = function (S) {
    if (!PT.input) return bot(S);
    return Object.assign({ mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false }, PT.input);
  };
  PT.step = function (n) { for (let i = 0; i < n; i++) { G.tick(); G.click = null; } };
  // Chạy tiếp tới khung hình hero đang vung vũ khí giữa chừng (để ảnh có đòn đánh và hiệu ứng)
  PT.untilSwing = function (lo, hi, max) {
    const P = G.getRun().P;
    for (let i = 0; i < (max || 240); i++) {
      G.tick(); G.click = null;
      const k = P.atkT > 0 ? 1 - P.atkT / P.atkDur : -1;
      if (k >= (lo || 0.35) && k <= (hi || 0.6) && G.getWorld().texts.length > 0) return i;
    }
    return -1;
  };
  // Vẽ thế giới hiện tại với nền tự vẽ. bg(c): vẽ nền; over(c): vẽ đè phía trước (mép tường trước...).
  // Trả về canvas 480x270 mới; số sát thương (game vẽ ở lớp giao diện nét) nằm ở .nums, đã phóng to k lần.
  PT.shot = function (bg, over, k) {
    k = k || 3;
    const S = G.getRun();
    const old = A.bg, oldUx = G.ux;
    const nums = PT.mk(480 * k, 270 * k); nums.setTransform(k, 0, 0, k, 0, 0);
    A.bg = function (c) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 480, 270); bg(c); };
    G.ux = nums;
    try { G.drawWorld(S.r); } finally { A.bg = old; G.ux = oldUx; }
    const c = G.wx; c.setTransform(1, 0, 0, 1, 0, 0);
    if (over) over(c);
    const out = PT.mk(480, 270); out.drawImage(c.canvas, 0, 0);
    out.canvas.nums = nums.canvas; out.canvas.k = k;
    return out.canvas;
  };
  // Phóng to kiểu nearest-neighbour rồi vẽ giao diện nét lên trên. hud(c): vẽ theo đơn vị gốc (đã nhân k sẵn).
  PT.compose = function (world, k, hud, crop, hudK) {
    crop = crop || { x: 0, y: 0, w: world.width, h: world.height };
    const c = PT.mk(Math.round(crop.w * k), Math.round(crop.h * k));
    c.drawImage(world, crop.x, crop.y, crop.w, crop.h, 0, 0, c.canvas.width, c.canvas.height);
    if (world.nums) { const q = world.k; c.imageSmoothingEnabled = true; c.drawImage(world.nums, crop.x * q, crop.y * q, crop.w * q, crop.h * q, 0, 0, c.canvas.width, c.canvas.height); c.imageSmoothingEnabled = false; }
    if (hud) { c.save(); c.scale(hudK || k, hudK || k); hud(c); c.restore(); }
    return c.canvas;
  };
  PT.text = function (c, s, x, y, o) {
    o = o || {};
    c.font = (o.bold ? '700 ' : '500 ') + (o.size || 8) + 'px ' + PT.FONT;
    c.textAlign = o.align || 'left'; c.textBaseline = 'alphabetic';
    if (!o.flat) { c.fillStyle = o.shadow || 'rgba(0,0,0,0.85)'; c.fillText(s, x + 0.5, y + 0.6); }
    c.fillStyle = o.color || '#f1ead9'; c.fillText(s, x, y);
  };
})();
