// Quái mới vào game: nối hình và cử động của G.monsterArt (js/monster_art.js) với luật chơi.
// - Mỗi vai có một con riêng ở từng vùng (G.MOB_ART trong data.js).
// - Đòn của quái ngắm theo góc bất kỳ tới em bé (tám hướng và mọi góc giữa), vùng báo trước xoay theo góc.
// - Cơ chế theo vai: xông tới, bầy nhỏ, giáp (che phía trước, hồi máu cho bạn), bắn xa (gọi thêm bầy nhỏ),
//   nhanh nhẹn (lặn/chui đất rồi trồi lên), cảm tử, đặt bom, gai (phản đòn cận chiến).
// - Tinh anh: mạnh hơn, có chiêu riêng và một dấu hiệu ngẫu nhiên (biểu tượng nhỏ trên đầu).
// Vùng nổ theo hệ của vùng: Băng đóng băng ngắn, Độc để vũng độc, Lửa để vệt cháy.
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const MA = () => G.monsterArt;
  const DEF = (id) => (G.monsterArt && G.monsterArt._defs[id]) || {};
  function dur(id, a) { const m = MA(); return (m && m.dur(id, a)) || 0.6; }
  const INFO = {};
  function info(id) {
    if (!INFO[id]) { const m = MA(); INFO[id] = (m && m.list.find((x) => x.id === id)) || { w: 30, h: 24 }; }
    return INFO[id];
  }
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  const angTo = (e, P) => Math.atan2(P.y - e.y, P.x - e.x);
  const regEl = () => (G.REGIONS[W().region | 0] || G.REGIONS[0]).el;
  function play(e, n, spd) { e.an = { n, t: 0, spd: spd || 1 }; }
  function loop(e, n) { if (!e.an || e.an.n !== n) e.an = { n, t: 0, spd: 1 }; }

  // ---------- 15/10 soat-muot Phiên 1 "Quái động mượt" (docs/review/ke-hoach-cai-thien/soat-muot/bao-cao.md mục 2, 3, 4, 6A, 10A, 18, 19) ----------
  // CHỈ ĐỔI HÌNH: không đổi thời gian ra đòn, vùng sát thương, tốc độ, hồi chiêu. Các ô e.duT, e.diT, e.dh, e.anNho, e.buocT chỉ để vẽ.
  // Mỗi mục một cờ quay lui (thêm vào địa chỉ trang):
  //   ?dondu=0     (G.DON_DU)     mục 2: hàng đánh không chạy đủ tới khung cuối, không giữ khung cuối trước khi về đứng
  //   ?choangcu=1  (G.CHOANG_YEN) mục 3: quái choáng vẽ 'hit' (viền trắng nhấp nháy) như cũ
  //   ?didung=0    (G.DI_DUNG_EM) mục 4: đi↔đứng lật ngay, mỗi lần đổi về khung 1 (cả js/boss.js)
  //   ?baodeu=0    (G.BAO_DEU)    mục 6A: hàng báo đòn kéo giãn đúng bằng thời gian báo như cũ (js/sprite_custom.js)
  //   ?xihoi=0     (G.XI_HOI)     mục 10A: không chèn khung "xì hơi / thu gai" (hàng báo đòn phát ngược) cho nhóm phồng / cuộn
  //   ?buoctoc=0   (G.BUOC_TOC)   mục 18: bước chân theo đồng hồ hàng đi như cũ (không theo tốc độ thật, lùi vẫn bước tới)
  //   ?trungdu=0   (G.TRUNG_DU)   mục 19: hàng trúng đòn chia theo 0,35 giây như cũ (khung 4 chỉ ~37 ms)
  // (Mục 11A dùng cờ có sẵn ?khungtrang=1 ở js/sprite_custom.js.)
  function coMuot(ten, re) {
    if (G[ten] !== undefined) return;
    let tat = false;
    try { tat = typeof location !== 'undefined' && re.test(location.search || ''); } catch (er) { tat = false; }
    G[ten] = !tat;
  }
  coMuot('DON_DU', /[?&]dondu=0(&|$)/); coMuot('CHOANG_YEN', /[?&]choangcu=1(&|$)/); coMuot('DI_DUNG_EM', /[?&]didung=0(&|$)/);
  coMuot('BAO_DEU', /[?&]baodeu=0(&|$)/); coMuot('XI_HOI', /[?&]xihoi=0(&|$)/); coMuot('BUOC_TOC', /[?&]buoctoc=0(&|$)/); coMuot('TRUNG_DU', /[?&]trungdu=0(&|$)/);
  const GIU_CUOI = 0.06; // mục 2: giữ khung cuối hàng đánh ~1 nhịp rồi mới về đứng
  const DI_EM = 0.13, NHO_HANG = 0.2; // mục 4: hết đi 0,13 giây mới coi là đứng; quay lại hàng cũ trong 0,2 giây thì đi tiếp từ khung cũ
  // Mục 10A: nhóm phồng / cuộn (đo bằng ảnh, soat-muot/bao-cao.md mục 10): vao = lúc vào đánh (báo đòn phồng/cuộn hết cỡ → khung đánh đầu
  // nhảy cỡ ×1,3–2,3), ve = lúc về đứng (Nhím Biển lăn, gai bung → đứng ×1,78). Chèn hàng báo đòn phát NGƯỢC thật nhanh làm khung xì hơi / thu gai.
  const XI_VAO = { caNoc: 1, caNocChua: 1, nhimDoc: 1, nhimThan: 1 }, XI_VE = { nhim: 1 }, XI_T_VAO = 0.1, XI_T_VE = 0.15;
  const BUOC0 = 600; // mục 18: đồng hồ bước bắt đầu ở 600 giây để chạy lùi (đi ngược hướng mặt) không bao giờ xuống dưới 0
  function coAnh(e) { const S = G.spriteCustom, sp = S && S.ds ? S.ds[e.art] : null; return !!(sp && sp.ready); }
  // 15/10 soát mượt (ảnh gen P1, P2): tấm đã vẽ đúng chỗ nối thì bỏ vá tạm ("bo_va" trong tệp ảnh); Nhím có khung duỗi về đứng ("ve" của hàng đánh).
  // Cờ ?anhmuotcu=1 nạp lại tấm cũ (không có hai mục này) → vá tạm chạy như Phiên 1.
  function spAnh(e) { const S = G.spriteCustom, sp = S && S.ds ? S.ds[e.art] : null; return sp && sp.ready ? sp : null; }
  function boVa(e, k) { const sp = spAnh(e); return !!(sp && sp.boVa && sp.boVa.indexOf(k) >= 0); }
  function veAnh(e) { const sp = spAnh(e); return !!(sp && sp.dt && sp.dt.atk && sp.dt.atk.ve); }
  // Mục 4: đổi hàng đi / đứng, mỗi hàng nhớ đồng hồ riêng (quay lại trong 0,2 giây thì không về khung 1).
  function doiHang(e, n) {
    if (e.an && e.an.n === n) return;
    const nho = e.anNho || (e.anNho = {}), luc = e.dh || 0;
    if (e.an && (e.an.n === 'idle' || e.an.n === 'move')) nho[e.an.n] = { t: e.an.t, luc };
    const c = nho[n];
    e.an = { n, t: c && luc - c.luc < NHO_HANG ? c.t : 0, spd: 1 };
  }
  function diDung(e) {
    if (G.DI_DUNG_EM === false) { loop(e, e.moving ? 'move' : 'idle'); return; }
    if (e.moving) e.diT = DI_EM;
    doiHang(e, e.moving || e.diT > 0 ? 'move' : 'idle');
  }
  // Mục 18: bước chân theo quãng đi thật (÷ tốc độ gốc, trong 0,5–1,5); đi ngược hướng mặt thì hàng đi phát ngược.
  function buoc(e, x0, y0, dt) {
    if (G.BUOC_TOC === false || !(dt > 0)) return;
    if (e.buocT == null) e.buocT = BUOC0;
    let k = 0.5, chieu = 1;
    if (e.moving) {
      const dx = e.x - x0, dy = (e.y - y0) / 0.8, v = Math.hypot(dx, dy) / dt;
      k = clamp(v / Math.max(1, e.speed || 1), 0.5, 1.5);
      if (dx * (e.face || 1) < 0 && Math.abs(dx) > Math.abs(dy) * 0.5) chieu = -1;
    }
    e.buocT = Math.max(0, e.buocT + dt * k * chieu);
  }
  // Mục 2 (+ 10A lúc vào đánh): thời gian vẽ hàng đánh. Lượt đánh thật kết thúc ở e.act.end (thường T + D×0,75, kỹ năng đặt riêng) nhưng
  // hàng đánh chia theo cả D → khung thu đòn không bao giờ hiện. Nay: nén cho khung cuối hiện đúng lúc lượt đánh hết (chỉ nén, không kéo giãn:
  // lượt đánh dài hơn hàng ảnh thì như cũ — giữ khung cuối / Nhím lăn lặp "lap_tu").
  function gioDanh(e, t, o) {
    const D = dur(e.art, 'atk'), nang = e.role === 'elite' || e.role === 'shield', a1 = D * 0.2;
    // Ra đòn nặng (tinh anh, quái giáp): giữ khung vừa đánh ra lâu hơn một chút rồi thu đòn chậm (cảm giác có trọng lượng).
    const f = nang ? (x) => (x < a1 ? x : x < a1 + 0.08 ? a1 : a1 + (x - a1 - 0.08) * 0.9) : (x) => x;
    const A = e.act, chuan = !!(A && A.fired && e.an && (e.an.spd || 1) === 1);
    let tt = t;
    if (chuan && G.XI_HOI !== false && XI_VAO[e.art] && coAnh(e) && !boVa(e, 'xi_vao')) {
      if (t < XI_T_VAO) { o.xiHoi = { u: t / XI_T_VAO }; return 0; }
      tt = t - XI_T_VAO;
    }
    if (chuan && G.DON_DU !== false) {
      const tong = tt + Math.max(0, A.end - A.t), Dc = D * 0.999, ft = f(tong);
      if (tong > 0.05 && ft < Dc) return Math.min(Dc, f(tt) * Dc / ft);
    }
    return nang ? f(tt) : tt;
  }

  // ---------- hình dạng vùng mới: đường thẳng, quạt, vành khăn (có khe), tường nước chạy ----------
  // Toạ độ thật (không bẹp theo chiều dọc) cho khớp với hình báo trước của js/monster_art.js.
  G.inShape = function (z, e, pad) {
    const dx = e.x - z.x, dy = e.y - z.y;
    if (z.shape === 'line') {
      const c = Math.cos(z.ang), s = Math.sin(z.ang), al = dx * c + dy * s, ac = -dx * s + dy * c;
      return al >= -4 - pad && al <= z.len + 3 + pad && Math.abs(ac) <= z.w / 2 + 3 + pad;
    }
    if (z.shape === 'cone') {
      const d = Math.hypot(dx, dy);
      if (d > z.r + 3 + pad) return false;
      if (d < 8 + pad) return true;
      let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      return Math.abs(da) <= z.span / 2 + (4 + pad) / Math.max(d, 1);
    }
    if (z.shape === 'donut') {
      const d = Math.hypot(dx, dy / (G.ZK || 1)); // vành khăn dẹt theo chiều dọc như vùng tròn (G.ZK)
      if (d < z.r0 - 3 - pad || d > z.r1 + 3 + pad) return false;
      if (z.gaps) { const a = Math.atan2(dy / (G.ZK || 1), dx); for (const g of z.gaps) { let da = a - g; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < z.gw - (pad ? 0 : 3 / Math.max(d, 1))) return false; } }
      return true;
    }
    return false;
  };
  // Hướng chạy thoát khỏi một vùng (cho bot thử nghiệm).
  G.zoneEscape = function (z, P) {
    const dx = P.x - z.x, dy = P.y - z.y;
    if (z.shape === 'line') {
      const c = Math.cos(z.ang), s = Math.sin(z.ang), ac = -dx * s + dy * c, k = ac >= 0 ? 1 : -1;
      return [-s * k, c * k];
    }
    if (z.shape === 'cone') {
      let da = Math.atan2(dy, dx) - z.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      const a = z.ang + (da >= 0 ? 1 : -1) * (z.span / 2 + 0.9);
      return [Math.cos(a), Math.sin(a)];
    }
    const d = Math.hypot(dx, dy) || 1;
    if (z.shape === 'donut' && z.gaps) {
      // chạy về khe gần nhất
      const a = Math.atan2(dy / (G.ZK || 1), dx);
      let best = z.gaps[0], bd = 9;
      for (const g of z.gaps) { const da = Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))); if (da < bd) { bd = da; best = g; } }
      const r = (z.r0 + z.r1) / 2, tx = z.x + Math.cos(best) * r, ty = z.y + Math.sin(best) * r * (G.ZK || 1), l = Math.hypot(tx - P.x, ty - P.y) || 1;
      return [(tx - P.x) / l, (ty - P.y) / l];
    }
    if (z.shape === 'donut' && Math.hypot(dx, dy / (G.ZK || 1)) < (z.r0 + z.r1) / 2) return [-dx / d, -dy / d];
    return [dx / d, dy / d];
  };
  function addZone(shape, geo, t, dmg, el, o) {
    const z = Object.assign({ shape, t, t0: t, dmg, el: el || null, life: 0.12 }, geo, o || {});
    W().zones.push(z);
    return z;
  }
  G.mobZone = addZone;
  // Tường nước chạy (chiêu sóng thần): chạy theo hướng ang, chừa một khe; đứng đúng khe thì không sao.
  G.mobWall = function (z, dt, P) {
    if (z.wait > 0) { z.wait -= dt; return; }
    z.s += z.v * dt;
    const c = Math.cos(z.ang), s = Math.sin(z.ang), dx = P.x - z.x, dy = P.y - z.y, al = dx * c + dy * s, ac = -dx * s + dy * c;
    if (!z.hit && Math.abs(al - z.s) < z.th / 2 + 3 && Math.abs(ac) < z.half && Math.abs(ac - z.g) > z.gw) { if (G.hurtPlayer(z.dmg, z.el, z.src || null, false)) { z.hit = true; if (z.onHit) z.onHit(z); } }
    if (z.s > z.maxS) z.dead = true;
  };

  // ---------- khởi tạo quái theo vai ----------
  G.mobInit = function (e, o) {
    const w = W(), M = G.MOB_ART;
    if (!G.monsterArt || !M || !w || o.noArt) return;
    const r = clamp(w.region | 0, 0, G.REGIONS.length - 1); // vùng 4: không lặng lẽ dùng quái vùng 3
    let id = null;
    if (e.role === 'elite') id = o.art || M.elite[r][G.rnd() < 0.5 ? 0 : 1];
    else if (M[e.role] && typeof M[e.role][r] === 'string') id = o.art || M[e.role][r];
    if (!id || !DEF(id).anims) return;
    const I = info(id), elite = e.role === 'elite';
    e.art = id; e.don = DEF(id).don || {}; e.scale = 1;
    e.r = clamp(Math.round(I.w * (elite ? 0.2 : 0.24)), 6, elite ? 16 : 12);
    e.hr = clamp(Math.round(I.h * 0.18), 5, elite ? 11 : 8);
    e.h = MA().cao ? MA().cao(id) : I.h; e.w = I.w; // chiều cao hình thật (gồm độ bay, chừa nhịp thở): thanh máu mảnh, biểu tượng, số sát thương đặt trên đỉnh hình, không chạm hình. Chỉ để vẽ, không phải vùng va chạm (e.r, e.hr).
    e.dirA = e.face > 0 ? 0 : PI;
    e.act = null; e.hitT = 0; e.turnT = 0;
    play(e, 'spawn');
    e.spawnT = o.add ? dur(id, 'spawn') * 0.7 : dur(id, 'spawn');
    e.cd = G.rr(0.4, 1.1);
    if (e.role === 'shield') { e.armor = G.ROLES.shield.armor || 0.45; e.armorMax = e.maxhp * 0.45; e.armorHp = e.armorMax; e.healCd = G.rr(3, 6); }
    if (e.role === 'archer') e.sumCd = G.rr(7, 10);
    if (e.role === 'nimble') e.diveCd = G.rr(0.6, 1.8);
    if (e.role === 'spiky') e.spikeCd = G.rr(1.2, 2.5);
    if (elite) {
      e.skCd = G.rr(2.5, 4);
      const tr = Object.keys(G.ELITE_TRAITS || {});
      e.trait = o.trait || (tr.length ? tr[Math.floor(G.rnd() * tr.length)] : null);
      if (e.trait === 'nhanh') e.speed *= 1.45;
    }
    if (G.knQuai && G.knQuai.init) G.knQuai.init(e); // kỹ năng riêng của từng con (js/ky_nang_quai.js)
  };
  // Giáp: quái giáp chỉ che phía trước (phải vòng ra sau hoặc phá giáp); tinh anh "Bọc giáp" che mọi phía.
  G.mobArmor = function (t, o) {
    if (!t.art) return t.armor;
    let a = t.trait === 'giap' ? 0.35 : 0;
    if (t.role === 'shield' && !(t.brokeT > 0)) {
      const P = W().P;
      if ((P.x - t.x) * t.face > -4) a = Math.max(a, t.armor || 0.45);
    }
    return a;
  };
  G.mobOnHit = function (e, d, o) {
    if (!e.art || e.dead) return;
    e.hitT = 0.3;
    if (G.knQuai && G.knQuai.onHit) G.knQuai.onHit(e, d, o); // Ốc rút vỏ (js/ky_nang_quai.js)
    const P = W().P;
    // Gai: đang dựng gai mà bị đánh cận chiến thì phản đòn (kèm hệ của vùng).
    if (e.spikeUp > 0 && !o.ranged && !(e.reflT > 0)) {
      e.reflT = 0.45;
      G.hurtPlayer(e.dmg * 0.7, regEl(), e, false);
      FX('text', P.x, P.y - 46, 'Phản đòn!', '#ff7a5a', 8);
    }
    // Giáp phía trước: đánh trúng giáp thì giáp mòn dần, mòn hết thì vỡ một lúc.
    if (e.role === 'shield' && !(e.brokeT > 0) && (P.x - e.x) * e.face > -4) {
      e.armorHp -= d;
      if (e.armorHp <= 0) { e.brokeT = 6; FX('text', e.x, e.y - e.h - 8, 'Vỡ giáp!', '#ffd23f', 9); if (!(G.fx && G.fx.anh && G.fx.anh('hu-pha-giap', e.x, e.y - e.h - 6, { f: e.face, sc: 0.55 }))) FX('burst', e.x + e.face * 8, e.y - e.h * 0.4, '#d0c8b8', 14, 70); G.sfx('boom', 1.4); }
    }
  };
  G.mobOnKill = function (e) {
    const w = W();
    if (e.trait === 'no') {
      // Tinh anh "Nổ khi chết": vòng đỏ lớn, nổ sau một lúc
      addZone('circle', { x: e.x, y: e.y, r: 44 }, 0.95, e.dmg * 1.2, regEl(), { fxKind: 'bomb', bomb: { x0: e.x, y0: e.y, fl: 0, big: true }, onFire: (z) => blast(z.x, z.y, z.r, regEl(), e.dmg) });
      G.sfx('warn', 0.9);
    }
    if (e.isBoss && e.art) w.bossDieT = dur(e.art, 'die') + 0.4;
  };

  // ---------- nổ theo hệ của vùng ----------
  function blast(x, y, r, el, dmg) {
    const w = W();
    FX('propBlast', { x, y, nr: r }, el); // nr: bán kính nổ thật để hình nổ đúng cỡ vùng sát thương (js/fx.js)
    G.sfx('boom', 1.1);
    if (el === 'poison') addZone('circle', { x, y, r: Math.round(r * 0.75) }, 0, dmg * 0.6, 'poison', { pool: true, life: 4, tick: 0.3 });
    else if (el === 'fire') {
      // vệt cháy: ba vũng lửa nhỏ loang ra
      for (let i = 0; i < 3; i++) { const a = G.rnd() * TAU, d = i ? r * 0.5 : 0; addZone('circle', { x: clamp(x + Math.cos(a) * d, w.x0, w.x1), y: clamp(y + Math.sin(a) * d * 0.7, w.y0, w.y1), r: Math.round(r * 0.45) }, 0, dmg * 0.6, 'fire', { pool: true, life: 3.2, tick: 0.3 }); }
    }
  }
  // Đòn nổ trúng em bé: Băng thì đóng băng ngắn.
  function onBlastHit(el) { return el === 'ice' ? () => { const P = W().P; P.frozenT = Math.max(P.frozenT || 0, 0.65); FX('text', P.x, P.y - 48, 'Đóng băng!', '#bfeaff', 8); } : null; }

  // ---------- đòn đánh theo kiểu của từng con (don.kieu trong js/monster_art.js) ----------
  // Trả về vùng báo trước, đã xoay theo góc a.
  function strikeZone(e, a, T, mult, o) {
    const d = e.don, k = d.kieu || 'chem', tam = d.tam || 26, dmg = e.dmg * (mult || 1), base = Object.assign({ src: e, cancel: true, melee: true, quiet: true }, o || {}); // đòn thường (chém, húc, lao, đập): không vẽ vùng báo trước, chỉ có cử động lấy đà
    if (k === 'lao') return addZone('line', { x: e.x, y: e.y, ang: a, len: tam + 8, w: Math.max(14, (d.rong || 12) + 4) }, T, dmg, null, base);
    if (k === 'dap' || k === 'no') return addZone('circle', { x: e.x, y: e.y, r: tam }, T, dmg, null, base);
    if (k === 'phun') return addZone('cone', { x: e.x, y: e.y, ang: a, r: tam + 8, span: d.xoe || 1.2 }, T, dmg, null, base);
    return addZone('cone', { x: e.x, y: e.y, ang: a, r: tam + 6, span: Math.min(2.2, d.xoe || 1.9) }, T, dmg, null, base);
  }
  function reachOf(e) {
    const d = e.don, k = d.kieu || 'chem', tam = d.tam || 26;
    return k === 'lao' ? tam * 0.8 : k === 'dap' || k === 'no' ? tam * 0.7 : tam * 0.75;
  }
  function cancelZones(e) { for (const z of W().zones) if (z.src === e && z.t > 0 && !z.knGiu) z.dead = true; } // knGiu: vật đã ném ra (bom, bào tử, vũng điện của js/ky_nang_quai.js) không tắt theo quái
  // Một lượt ra đòn: báo trước (anim tele) T giây, rồi ra đòn (anim atk).
  function begin(e, k, a, T, o) {
    e.act = Object.assign({ k, t: 0, T, a, fired: false, end: T + dur(e.art, 'atk') * 0.75 }, o || {});
    e.dirA = a;
    if (!(o && o.keepFace) && Math.abs(Math.cos(a)) > 0.15) e.face = Math.cos(a) > 0 ? 1 : -1; // quái giáp giữ hướng mặt (quay chậm)
    play(e, o && o.anim0 ? o.anim0 : 'tele', o && o.spd0);
    e.wind = T;
  }
  function shoot(e, a, sp, o) {
    const w = W(), d = e.don, cols = d.mau || null;
    w.projs.push(Object.assign({ team: 'enemy', kind: 'orb', x: e.x + Math.cos(a) * 8, y: e.y + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 3, dmg: e.dmg, el: null, src: e, col: cols ? cols[1] : null, col2: cols ? cols[0] : null, z: Math.min(18, e.h * 0.45) }, o || {}));
  }
  // Bom: bay từ (x0, y0) tới (x, y) trong fl giây, nằm đếm ngược fuse giây (vòng đỏ đầy dần), rồi nổ.
  function bomb(e, x, y, fl, fuse, r, o) {
    const w = W(), el = regEl();
    x = clamp(x, w.x0, w.x1); y = clamp(y, w.y0, w.y1);
    return addZone('circle', { x, y, r: r || 26 }, fl + fuse, e.dmg * 1.2, el, Object.assign({ fxKind: 'bomb', bomb: { x0: e.x, y0: e.y - e.h * 0.5, fl, art: e.art }, onHit: onBlastHit(el), onFire: (z) => blast(z.x, z.y, z.r, el, e.dmg) }, o || {}));
  }
  G.mobBomb = bomb;
  // Gọi quái phụ: vòng báo rồi quái phụ trồi lên.
  function summon(role, x, y, o) {
    const w = W();
    w.spawns = w.spawns || [];
    w.spawns.push({ role, x: clamp(x, w.x0 + 6, w.x1 - 6), y: clamp(y, w.y0 + 4, w.y1 - 4), t: 0.8, t0: 0.8, add: true, opt: Object.assign({ add: true }, o || {}) });
  }

  // ---------- cập nhật mỗi khung ----------
  const G_mob = (G.mob = {});
  G_mob.muot = { gioDanh, coAnh, XI_T_VE }; // Phiên 1 soát mượt: phần vẽ (khối dưới) dùng
  G_mob.update = function (e, dt) {
    // skill bộ Ninja "Phân thân" (js/bo_skill.js): quái thường đi tới / ngắm đòn vào bóng; P ở đây chỉ dùng toạ độ, đòn trúng vẫn đo trên Zed thật
    const w = W(), P = (G.boSk && G.boSk.dich(e)) || w.P;
    if (e.an) e.an.t += dt * (e.an.spd || 1);
    if (e.role === 'elite' && G.noiGian) G.noiGian.tinhAnh(e); // 15/10 noi-gian-manh: tinh anh nổi giận ở ≤ 35% máu (js/noi_gian.js)
    if (e.role === 'elite' && G.congBang) G.congBang.theo(e); // 16/10 luật công bằng (js/boss.js): theo dõi vùng của tinh anh mỗi khung
    if (e.hitT > 0) e.hitT -= dt;
    e.dh = (e.dh || 0) + dt; if (e.duT > 0) e.duT -= dt; if (e.diT > 0) e.diT -= dt; // Phiên 1 soát mượt: đồng hồ chỉ để vẽ
    if (e.reflT > 0) e.reflT -= dt;
    if (e.brokeT > 0) { e.brokeT -= dt; if (e.brokeT <= 0) e.armorHp = e.armorMax; }
    e.moving = false;
    if (e.boomT != null) { e.boomT -= dt; if (e.boomT <= 0) e.dead = true; return; } // cảm tử đang nổ
    if (e.spawnT > 0) { e.spawnT -= dt; if (e.spawnT <= 0) loop(e, 'idle'); return; }
    if (e.dive) { stepDive(e, dt, P); return; }
    if (e.st.frozen > 0 || e.st.stun > 0) {
      if (e.act && !e.act.fired) { cancelZones(e); e.act = null; }
      e.wind = 0; e.lungeT = 0; e.spikeUp = 0;
      return;
    }
    const sp = e.speed * Math.max(0.4, 1 - 0.15 * e.st.iceN) * (e.st.root > 0 ? 0 : 1) * (G.boSk ? G.boSk.cham(e) : 1); // × chậm "Thuỷ triều" (skill bộ Biển)
    if (e.lungeT > 0) {
      const k = Math.min(dt, e.lungeT); e.lungeT -= dt;
      e.x += Math.cos(e.act ? e.act.a : e.dirA) * e.lv * k; e.y += Math.sin(e.act ? e.act.a : e.dirA) * e.lv * k;
      e.x = clamp(e.x, w.x0, w.x1); e.y = clamp(e.y, w.y0, w.y1);
    }
    e.cd -= dt;
    if (e.act) { stepAct(e, dt, P); return; }
    if (e.spikeUp > 0) { e.spikeUp -= dt; if (e.spikeUp <= 0) spikeShot(e); return; }
    const x0 = e.x, y0 = e.y;
    think(e, dt, P, sp);
    if (!e.act && !e.dive) diDung(e); // mục 4 (cờ ?didung=0: loop(e, e.moving ? 'move' : 'idle') như cũ)
    e.y = clamp(e.y, w.y0, w.y1);
    buoc(e, x0, y0, dt); // mục 18: chỉ để vẽ
  };
  function stepAct(e, dt, P) {
    const A = e.act;
    A.t += dt;
    e.wind = Math.max(0, A.T - A.t);
    if (!A.fired && A.t >= A.T) {
      A.fired = true;
      e.wind = 0;
      play(e, A.anim1 || 'atk', A.spd1);
      if (A.fire) A.fire(e, A, P);
    }
    if (A.step) A.step(e, A, dt, P);
    if (A.t >= A.end) {
      const k = A.k;
      // mục 2 / 10A (chỉ để vẽ): vừa hết lượt đánh bằng hàng đánh thì giữ khung cuối GIU_CUOI giây (Nhím Biển: thu gai XI_T_VE giây) rồi mới về đứng
      if (k !== 'boom' && e.an && e.an.n === 'atk' && (e.an.spd || 1) === 1) {
        if (G.DON_DU !== false && veAnh(e)) { e.duT = XI_T_VE; e.duK = 've'; } // soát mượt P2: khung duỗi về đứng vẽ sẵn
        else if (G.XI_HOI !== false && XI_VE[e.art] && coAnh(e) && !boVa(e, 'xi_ve')) { e.duT = XI_T_VE; e.duK = 've'; }
        else if (G.DON_DU !== false) { e.duT = GIU_CUOI; e.duK = 'giu'; }
      }
      e.act = null; e.cd = A.cd != null ? A.cd : 1.4; if (A.after) A.after(e); if (k !== 'boom') loop(e, 'idle');
    }
  }
  // Đi tới cách em bé khoảng want (đứng xa thì tiến lại, đứng gần quá thì lùi), có lượn vòng nhẹ.
  function keep(e, P, want, sp, dt, side) {
    const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy) || 1, w = W();
    let tx, ty;
    if (Math.abs(d - want) < 10) { const a = Math.atan2(-dy, -dx) + (side || 0.5) * 0.6; tx = P.x + Math.cos(a) * want; ty = P.y + Math.sin(a) * want; }
    else { tx = P.x - (dx / d) * want; ty = P.y - (dy / d) * want; }
    tx = clamp(tx, w.x0 + 4, w.x1 - 4); ty = clamp(ty, w.y0 + 2, w.y1 - 2);
    const mx = tx - e.x, my = ty - e.y, md = Math.hypot(mx, my);
    if (md > 3) { e.x += (mx / md) * sp * dt; e.y += (my / md) * sp * 0.8 * dt; e.moving = true; }
    if (Math.abs(dx) > 3) e.face = dx > 0 ? 1 : -1;
    return d;
  }
  // Quái giáp xoay mặt chậm: em bé đứng sau lưng hơn 0,9 giây nó mới quay lại.
  function faceSlow(e, P, dt) {
    const want = P.x >= e.x ? 1 : -1;
    if (want === e.face) { e.turnT = 0; return; }
    e.turnT += dt;
    if (e.turnT > 0.9) { e.face = want; e.turnT = 0; }
  }

  function think(e, dt, P, sp) {
    const w = W(), d = Math.hypot(P.x - e.x, P.y - e.y), a = angTo(e, P), role = e.role;
    if (role === 'elite') return thinkElite(e, dt, P, sp, d, a);
    if (G.knQuai && G.knQuai.think && G.knQuai.think(e, dt, P, sp, d, a)) return; // 24 quái con: cách đánh riêng theo vùng (js/ky_nang_quai.js)
    if (role === 'archer') {
      e.sumCd -= dt;
      const allies = w.ents.filter((x) => !x.dead && x.sum === e).length + (w.spawns || []).filter((s) => s.opt && s.opt.sumBy === e).length;
      if (e.sumCd <= 0 && allies < 2 && w.ents.length < 9) {
        e.sumCd = G.rr(12, 16);
        begin(e, 'summon', a, 0.6, { cd: 1, fire: (q) => { for (let i = 0; i < 2; i++) { const b = a + PI + (i ? 0.9 : -0.9); summon('swarm', q.x + Math.cos(b) * 26, q.y + Math.sin(b) * 20, { hpMult: 0.45, sumBy: q }); } FX('sparkle', q.x, q.y - q.h * 0.5, '#ffd23f', 10); } });
        return;
      }
      const want = Math.min(120, (w.x1 - w.x0) * 0.42);
      keep(e, P, want, sp, dt, e.t % 6 < 3 ? 1 : -1);
      if (e.cd <= 0 && d < 190) {
        // Cân bằng phải cày: quái bắn xa là nguồn mất máu lớn nhất, nên bắn thưa hơn (2,2 -> 3 giây), ngắm lâu hơn (0,55 -> 0,7 giây)
        // và đạn chậm hơn (140 -> 118) để kịp né. Số nằm ở G.ROLES.archer (data.js).
        const A = G.ROLES.archer;
        if (e.don.kieu === 'nem') begin(e, 'lob', a, A.wind, { cd: A.shotCd, end: A.wind + 0.5, fire: (q) => { bomb(q, P.x, P.y, 0.45, 0.6, 18); } });
        else begin(e, 'shot', a, A.wind, { cd: A.shotCd, end: A.wind + 0.45, aim: true, fire: (q, A2) => { const b = angTo(q, P); q.dirA = b; shoot(q, b, A.shotSpd); } });
        G.sfx('warn', 1.3);
      }
      return;
    }
    if (role === 'bomber') {
      keep(e, P, e.art === 'sua' ? 60 : 95, sp, dt, 1);
      if (e.cd <= 0 && d < 170) {
        if (e.art === 'sua') begin(e, 'drop', a, 0.5, { cd: 3, end: 0.9, anim1: 'idle', fire: (q) => bomb(q, q.x, q.y, 0, 1.6, 28) });
        else begin(e, 'lob', a, 0.5, { cd: 3, end: 0.5 + dur(e.art, 'atk') * 0.8, fire: (q) => bomb(q, P.x, P.y, 0.5, 1.2, 26) });
      }
      return;
    }
    if (role === 'kami') {
      const tam = e.don.tam || 32;
      if (d > tam * 0.6) { moveTo(e, P.x, P.y, sp, dt); }
      if (d < tam + 6 && e.cd <= 0) {
        const el = regEl();
        begin(e, 'boom', a, 0.85, {
          cd: 9, end: 0.85 + dur(e.art, 'atk'),
          zone: addZone('circle', { x: e.x, y: e.y, r: tam + 6 }, 0.85, e.dmg * 1.3, el, { src: e, cancel: true, onHit: onBlastHit(el) }),
          fire: (q) => { q.ghost = true; q.boomT = dur(q.art, 'atk') * 0.95; blast(q.x, q.y, tam, el, q.dmg); },
        });
        G.sfx('warn', 0.8);
      }
      return;
    }
    if (role === 'spiky') {
      e.spikeCd -= dt;
      if (e.spikeCd <= 0 && d < 140) {
        e.spikeCd = G.rr(4.5, 6);
        e.spikeUp = 2.2; e.spikeT0 = 2.2;
        play(e, 'tele', 0.5);
        G.sfx('warn', 0.7);
        return;
      }
      keep(e, P, 46, sp, dt, 1);
      if (e.cd <= 0 && d < 60) melee(e, a, 0.6, 1.5);
      return;
    }
    if (role === 'shield') {
      e.healCd -= dt;
      faceSlow(e, P, dt);
      if (e.healCd <= 0) {
        const hurt = w.ents.filter((x) => !x.dead && x !== e && x.hp < x.maxhp * 0.95 && Math.hypot(x.x - e.x, x.y - e.y) < 90);
        e.healCd = hurt.length ? G.rr(7, 9) : 1.5;
        if (hurt.length) {
          begin(e, 'heal', e.face > 0 ? 0 : PI, 0.6, { cd: 1, keepFace: true, fire: (q) => {
            // Con vẽ tay đợt 3 (YEU-CAU-3.md): vòng elip xanh lá vẽ code → ảnh hu-vong-hoi-quai trên sàn dưới con hồi máu
            // (vòng khung 4 rộng 90 khi co 1 → co 2 = rộng 180 = đúng bán kính hồi 90). Bỏ ảnh thay tạm hu-hoi-mau của đợt 2.
            // Ảnh chưa tải: không vẽ vòng (vẫn còn số +máu xanh).
            for (const x of w.ents) if (!x.dead && Math.hypot(x.x - q.x, x.y - q.y) < 90) { const h = x.maxhp * 0.14; x.hp = Math.min(x.maxhp, x.hp + h); FX('text', x.x, x.y - x.h - 4, '+' + Math.round(h), '#8fe86a', 8); }
            FX('anh', 'hu-vong-hoi-quai', q.x, q.y, { sc: 2, ly: 0, mo: 0.85 });
            FX('sparkle', q.x, q.y - 6, '#8fe86a', 14); G.sfx('pick', 1.6);
          } });
          return;
        }
      }
      const dx = P.x - e.x, dd = Math.hypot(dx, P.y - e.y);
      if (dd > 20) { const k = sp / dd; e.x += dx * k * dt; e.y += (P.y - e.y) * k * 0.75 * dt; e.moving = true; }
      // đòn ngắm thẳng vào em bé (mọi góc), nhưng chỉ khi em bé ở nửa phía trước; đứng sau lưng thì nó phải quay lại trước
      if (e.cd <= 0 && d < reachOf(e) + 4 && (P.x - e.x) * e.face > -8) begin(e, 'slam', a, 0.6, { cd: 1.6, keepFace: true, zone: strikeZone(e, a, 0.6), fire: () => { W().shake = Math.max(W().shake, 0.08); } });
      return;
    }
    if (role === 'nimble') {
      e.diveCd -= dt;
      if (e.diveCd <= 0) { startDive(e); return; }
      if (e.retreat > 0) { e.retreat -= dt; keep(e, P, 90, sp, dt, 1); return; }
      keep(e, P, reachOf(e) * 0.9, sp, dt, 1);
      if (e.cd <= 0 && d < reachOf(e) + 8) melee(e, a, 0.45, 1.8, () => { e.retreat = 0.9; });
      return;
    }
    // xông tới và bầy nhỏ
    const reach = reachOf(e);
    if (d > reach * 0.85) moveTo(e, P.x, P.y, sp, dt);
    else if (Math.abs(P.x - e.x) > 3) e.face = P.x > e.x ? 1 : -1;
    if (e.cd <= 0 && d < reach + 6) melee(e, a, role === 'swarm' ? 0.5 : 0.58, role === 'swarm' ? 1.3 : 1.5); // GĐ2 (V8, Q4): bầy nhỏ báo trước 0,42 -> 0,5 s
  }
  function moveTo(e, tx, ty, sp, dt) {
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d > 2) { e.x += (dx / d) * sp * dt; e.y += (dy / d) * sp * 0.8 * dt; e.moving = true; }
    if (Math.abs(dx) > 3) e.face = dx > 0 ? 1 : -1;
  }
  // Đòn cận chiến theo kiểu của con quái; lao thì thân lao tới thật (tự dời vị trí, chỉ dùng nửa đầu cử động).
  function melee(e, a, T, cd, after) {
    const lao = e.don.kieu === 'lao';
    begin(e, 'melee', a, T, {
      cd, after, zone: strikeZone(e, a, T),
      fire: (q) => { if (lao) { const L = (q.don.tam || 30) * 0.8; q.lungeT = 0.16; q.lv = L / 0.16; FX('lunge', q); } },
      end: T + dur(e.art, 'atk') * (lao ? 0.5 : 0.75),
    });
  }
  // Gai: hết lúc dựng gai thì bắn gai toả tròn tám hướng.
  function spikeShot(e) {
    const n = e.don.so || 8, el = regEl();
    play(e, 'atk');
    for (let i = 0; i < n; i++) shoot(e, i / n * TAU + (e.t % 1) * 0.4, 105, { kind: 'spike', dmg: e.dmg * 0.8, el: el === 'poison' ? 'poison' : null, t: 1.4 });
    e.cd = 1.2;
    G.sfx('swing', 1.4);
  }
  // Nhanh nhẹn: lặn / chui xuống, đi ngầm tới sau lưng em bé, vòng đỏ báo chỗ trồi lên, trồi lên kèm một đòn.
  function startDive(e) {
    e.dive = { k: 'down', t: 0, T: dur(e.art, 'spawn') * 0.5 };
    e.act = null; e.wind = 0;
    play(e, 'spawn'); e.an.rev = true;
    G.sfx('swing', 0.6);
  }
  function stepDive(e, dt, P) {
    const D = e.dive, w = W();
    D.t += dt;
    if (D.k === 'down') {
      if (D.t >= D.T) { e.hidden = true; D.k = 'under'; D.t = 0; D.T = 0.5; }
    } else if (D.k === 'under') {
      if (D.t >= D.T) {
        // chỗ trồi lên: sau lưng hoặc bên cạnh em bé, có vòng đỏ báo trước
        const side = G.rnd() < 0.5 ? -P.face : (G.rnd() < 0.5 ? 1 : -1);
        const x = clamp(P.x + side * 34, w.x0 + 6, w.x1 - 6), y = clamp(P.y + G.rr(-16, 16), w.y0 + 3, w.y1 - 3);
        D.x = x; D.y = y; D.k = 'warn'; D.t = 0; D.T = 0.75;
        D.zone = addZone('circle', { x, y, r: 20 }, 0.75, e.dmg, null, { src: e, melee: true, quiet: true }); // trồi lên húc: không vẽ vòng báo, chỉ có đất nứt khi trồi
        e.x = x; e.y = y;
      }
    } else if (D.k === 'warn') {
      if (D.t >= D.T) { e.hidden = false; D.k = 'up'; D.t = 0; D.T = dur(e.art, 'spawn') * 0.55; play(e, 'spawn', 1.8); e.face = P.x >= e.x ? 1 : -1; FX('burst', e.x, e.y, '#d8d0c0', 10, 70); }
    } else if (D.t >= D.T) {
      e.dive = null; e.diveCd = G.rr(4.5, 6.5); e.cd = 0.15;
      loop(e, 'idle');
    }
  }

  // ---------- tinh anh ----------
  function thinkElite(e, dt, P, sp, d, a) {
    const w = W(), id = e.art, el = e.el || regEl();
    // 15/10 noi-gian-manh (js/noi_gian.js, G.NOI_GIAN.tinhAnh): nổi giận thì tốc chiêu × toc (báo trước chia tốc nhưng không
    // dưới sàn công bằng 0,45 giây), hồi chiêu riêng × hoi. Chưa giận / cờ tắt: ng = 1, như cũ.
    const NGq = G.noiGian, ng = NGq ? NGq.tinhAnh(e) : 1, bao = (t, to) => (NGq && ng !== 1 ? NGq.baoTinhAnh(e, t, to) : t);
    const fast = (e.trait === 'nhanh' ? 0.75 : 1) / ng;
    e.skCd -= dt;
    // 16/10 luật công bằng (G.congBang, js/boss.js): theo dõi vùng của mình (tiếng báo đòn nặng, nghỉ sau đòn nặng hụt); đang phải chờ thì
    // không ra đòn mới (vẫn đi). Nổi giận: bung chiêu riêng ngay (đổi nhịp) thay vì chỉ nhanh hơn.
    const CBq = G.congBang && G.congBang.on() ? G.congBang : null;
    if (CBq) { if (e.ngGian && !e.cbBung) { e.cbBung = true; e.skCd = Math.min(e.skCd, G.CONG_BANG.ng.tinhAnh.bung); } }
    const cho = !!CBq && CBq.cho(e);
    if (e.skCd <= 0 && d < 170 && !cho) {
      e.skCd = G.rr(6, 7.5) * (e.trait === 'nhanh' ? 0.75 : 1) * (NGq ? NGq.hoiTinhAnh(e) : 1);
      e.cbAm = G.time || 0; e.cbSoChieu = (e.cbSoChieu || 0) + 1;
      const T = Math.max(bao(0.7 * (e.trait === 'nhanh' ? 0.85 : 1), true), CBq ? G.CONG_BANG.baoNang : 0), D = dur(id, 'chieu1') / ng; // luật công bằng: chiêu riêng ≥ 0,7 giây
      const o = { cd: 1.2 * fast, anim0: 'chieu1', anim1: 'chieu1', end: D };
      if (ng !== 1) { o.spd0 = ng; o.spd1 = ng; } // cử động chiêu chạy nhanh theo
      // Chiêu riêng chạy trọn cử động chieu1 (đã gồm báo trước trong hình); vùng báo của luật chơi nổ ở mốc T.
      // 14/10 ky-nang-trum-rieng (js/chieu_trum.js): Nấm Phồng Chúa Nhảy dập, Cá Nóc Chúa Phồng lăn, Hũ Chúa Đổ dầu châm lửa
      // thay Mưa bào tử / Gai xoáy / Vòng cầu lửa (kiểu bị lặp). 15/10 don-tep B: bỏ cờ ?chieucu=1 và ba nhánh cũ.
      if (G.chieuTrum && G.chieuTrum.elite(e, id, P, a, T, D, o)) { /* chiêu mới */ }
      else if (id === 'cuaTuong') {
        // Kẹp chéo: hai đường chém chéo hình chữ X đi qua chỗ em bé đứng
        const L = 110;
        for (const s of [-1, 1]) { const b = a + s * PI / 4; addZone('line', { x: P.x - Math.cos(b) * L / 2, y: P.y - Math.sin(b) * L / 2, ang: b, len: L, w: 14 }, T + 0.1, e.dmg * 1.3, el, { src: e, cancel: true, melee: true }); }
      } else if (id === 'heoNanh') {
        // Húc ba lần zíc zắc: mỗi lần nhắm lại theo chỗ em bé
        // 16/10 luật công bằng: mỗi cú húc (nặng, nhắm thẳng) báo trước 0,7 giây với tư thế lấy đà ('tele'), cú sau chỉ báo sau khi cú trước
        // húc xong + nghỉ 0,65 giây (cũ: báo 0,45 giây, cú sau hiện ngay 0,1 giây sau cú trước).
        const hb = CBq ? G.CONG_BANG.baoNang : 0.45, hg = CBq ? hb + G.CONG_BANG.nghiHut : 0.55;
        o.end = 0.5 + 3 * hg; o.anim1 = 'atk';
        for (let j = 0; j < 3; j++) G.later(j * hg, () => {
          if (e.dead || !e.act || e.act.k !== 'sk') return;
          const b = angTo(e, P) + (j - 1) * 0.35; e.act.a = b; e.dirA = b; if (Math.abs(Math.cos(b)) > 0.15) e.face = Math.cos(b) > 0 ? 1 : -1;
          if (CBq && j > 0) play(e, 'tele', dur(id, 'tele') / hb);
          addZone('line', { x: e.x, y: e.y, ang: b, len: 66, w: 22 }, hb, e.dmg * 1.2, null, { src: e, cancel: true, melee: true, onFire: () => { if (!e.dead && e.act) { e.lungeT = 0.15; e.lv = 52 / 0.15; play(e, 'atk', 1.4); } } });
        });
        o.anim0 = 'tele'; o.T = hb;
      } else if (id === 'tuongMa') {
        // Đao xoáy: xoay hai vòng chém quanh mình
        for (let j = 0; j < 2; j++) addZone('circle', { x: e.x, y: e.y, r: 50 }, T + j * 0.45, e.dmg * 1.1, null, { src: e, cancel: true, melee: true });
      }
      begin(e, 'sk', a, o.T || T, o);
      G.sfx('warn', 0.9);
      return;
    }
    const reach = reachOf(e);
    const k = e.don.kieu;
    if (k === 'gai' || k === 'no') {
      keep(e, P, reach * 0.7, sp, dt, 1);
      if (e.cd <= 0 && d < reach + 8 && !cho) {
        if (k === 'gai') begin(e, 'gai', a, bao(0.6 * fast * ng), { cd: 1.8 * fast, fire: (q) => { for (let i = 0; i < 8; i++) shoot(q, i / 8 * TAU, 100, { kind: 'spike', dmg: q.dmg * 0.8, el: 'ice', t: 1.3 }); } });
        else begin(e, 'no', a, bao(0.7 * fast * ng), { cd: 1.9 * fast, zone: addZone('circle', { x: e.x, y: e.y, r: (e.don.tam || 40) }, bao(0.7 * fast * ng), e.dmg * 1.1, el, { src: e, cancel: true, melee: true }) });
      }
      return;
    }
    if (d > reach * 0.85) moveTo(e, P.x, P.y, sp, dt);
    if (e.cd <= 0 && d < reach + 8 && !cho) melee(e, a, bao(0.6 * fast * ng), 1.5 * fast);
  }
  function near(x, y, dx, dy) { const w = W(); return [clamp(x + G.rr(-dx, dx), w.x0 + 6, w.x1 - 6), clamp(y + G.rr(-dy, dy), w.y0, w.y1)]; }
  G.mobNear = near;
  // Hàm dùng chung cho js/ky_nang_quai.js (kỹ năng riêng của 24 quái con).
  G_mob.H = { addZone, begin, shoot, bomb, blast, onBlastHit, keep, moveTo, faceSlow, play, loop, dur, regEl, angTo, summon, strikeZone, reachOf, cancelZones, near };
  // Hẹn giờ nhỏ dùng chung (chạy theo thời gian của thế giới, xoá khi đổi phòng).
  G.later = function (t, f) { const w = W(); if (!w) return; (w.timers || (w.timers = [])).push({ t, f }); };
  G.mob.tick = function (dt) {
    const w = W();
    if (!w || !w.timers || !w.timers.length) return;
    for (const o of w.timers) o.t -= dt;
    const due = w.timers.filter((o) => o.t <= 0);
    w.timers = w.timers.filter((o) => o.t > 0);
    for (const o of due) o.f();
  };
})();

// ======================= VẼ =======================
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const A = G.art;
  if (!A) return;
  const MA = () => G.monsterArt;
  const MU = () => G.mob.muot; // Phiên 1 soát mượt (khối trên)
  const dur = (id, a) => { const m = MA(); return (m && m.dur(id, a)) || 0.6; };
  const p = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

  // ---------- vùng báo trước: quét từng hàng điểm ảnh, kiểu giống vùng tròn của art.js ----------
  function zcols(z) {
    const tele = z.t > 0, blink = Math.floor(G.time * 10) % 2;
    if (!tele) { const a = (0.45 * clamp((z.life || 0) / 0.12, 0, 1)).toFixed(2); return ['rgba(255,244,210,' + a + ')', 'rgba(255,244,210,' + a + ')', 'rgba(255,255,255,' + a + ')']; } // chớp sáng nhẹ lúc nổ
    const pulse = (0.26 + 0.14 * Math.abs(Math.sin(G.time * 14))).toFixed(2);
    return ['rgba(255,40,24,' + pulse + ')', 'rgba(255,90,50,0.5)', blink ? '#ff3a22' : '#ffb09a'];
  }
  function prog(z) { return z.t > 0 && z.t0 ? clamp(1 - z.t / z.t0, 0, 1) : 1; }
  // Lòng vùng tô bằng đường viền của canvas (nhanh), mép vẽ bằng từng điểm ảnh cho sắc nét.
  function dots(c, pts, col) { c.fillStyle = col; for (const q of pts) c.fillRect(Math.round(q[0]), Math.round(q[1]), 1, 1); }
  function drawLine(c, z) {
    const cs = Math.cos(z.ang), sn = Math.sin(z.ang), L = z.len, hw = z.w / 2, u = prog(z), col = zcols(z);
    const at = (a, b) => [z.x + a * cs - b * sn, z.y + a * sn + b * cs];
    const quad = (len) => { const q = [at(0, -hw), at(len, -hw), at(len, hw), at(0, hw)]; c.beginPath(); c.moveTo(q[0][0], q[0][1]); for (let i = 1; i < 4; i++) c.lineTo(q[i][0], q[i][1]); c.closePath(); c.fill(); };
    c.fillStyle = col[0]; quad(L);
    if (u > 0 && u < 1) { c.fillStyle = col[1]; quad(L * u); }
    const e = [];
    for (let a = 0; a <= L; a += 1) { e.push(at(a, -hw)); e.push(at(a, hw)); }
    for (let b = -hw; b <= hw; b += 1) { e.push(at(0, b)); e.push(at(L, b)); }
    dots(c, e, col[2]);
  }
  function drawCone(c, z) {
    const r = z.r, u = prog(z), half = z.span / 2, col = zcols(z), a0 = z.ang - half, a1 = z.ang + half;
    const fan = (rr) => { c.beginPath(); c.moveTo(z.x, z.y); c.arc(z.x, z.y, rr, a0, a1); c.closePath(); c.fill(); };
    c.fillStyle = col[0]; fan(r);
    if (u > 0 && u < 1) { c.fillStyle = col[1]; fan(r * u); }
    const e = [], n = Math.ceil(r * z.span);
    for (let i = 0; i <= n; i++) { const a = a0 + (z.span * i) / n; e.push([z.x + Math.cos(a) * r, z.y + Math.sin(a) * r]); }
    for (let d = 0; d <= r; d += 1) { e.push([z.x + Math.cos(a0) * d, z.y + Math.sin(a0) * d]); e.push([z.x + Math.cos(a1) * d, z.y + Math.sin(a1) * d]); }
    dots(c, e, col[2]);
  }
  function drawDonut(c, z) {
    const u = prog(z), rm = z.r0 + (z.r1 - z.r0) * u, col = zcols(z);
    // các cung còn lại sau khi trừ khe
    let segs = [[0, TAU]];
    if (z.gaps && z.gw) {
      const g = z.gaps.map((x) => ((x % TAU) + TAU) % TAU).sort((p1, p2) => p1 - p2);
      segs = g.map((x, i) => [x + z.gw, (i + 1 < g.length ? g[i + 1] : g[0] + TAU) - z.gw]).filter((q) => q[1] > q[0]);
    }
    const K = G.ZK || 1;
    const band = (ra, rb) => { for (const [s0, s1] of segs) { c.beginPath(); c.ellipse(z.x, z.y, rb, rb * K, 0, s0, s1); c.ellipse(z.x, z.y, Math.max(0, ra), Math.max(0, ra) * K, 0, s1, s0, true); c.closePath(); c.fill(); } };
    c.fillStyle = col[0]; band(z.r0, z.r1);
    if (u > 0 && u < 1) { c.fillStyle = col[1]; band(z.r0, rm); }
    const e = [];
    for (const [s0, s1] of segs) {
      for (const R of [z.r0, z.r1]) { if (R < 1) continue; const n = Math.ceil(R * (s1 - s0)); for (let i = 0; i <= n; i++) { const a = s0 + ((s1 - s0) * i) / n; e.push([z.x + Math.cos(a) * R, z.y + Math.sin(a) * R * K]); } }
      if (segs.length > 1 || s1 - s0 < TAU - 0.01) for (const a of [s0, s1]) for (let d = z.r0; d <= z.r1; d += 1) e.push([z.x + Math.cos(a) * d, z.y + Math.sin(a) * d * K]);
    }
    dots(c, e, col[2]);
  }
  // Tường nước chạy: dải nước vuông góc hướng chạy, chừa khe (mép khe sáng trắng)
  function drawWall(c, z) {
    const cs = Math.cos(z.ang), sn = Math.sin(z.ang), t = G.time;
    const at = (a, b) => [z.x + a * cs - b * sn, z.y + a * sn + b * cs];
    if (z.wait > 0) {
      // báo trước: vệt đỏ dọc đường tường sẽ chạy qua, khe để trắng
      const blink = Math.floor(t * 10) % 2;
      for (let b = -z.half; b <= z.half; b += 2) {
        if (Math.abs(b - z.g) <= z.gw) {
          // khe an toàn: hai cột trắng hai bên và lối xanh nhạt ở giữa
          const edge = Math.abs(Math.abs(b - z.g) - z.gw) < 2;
          for (let a = 0; a < 40; a += edge ? 2 : 6) { const q = at(z.s + a, b); p(c, q[0], q[1], 2, 2, edge ? '#ffffff' : 'rgba(150,255,170,0.35)'); }
          continue;
        }
        for (let a = 0; a < 40; a += 3) { const q = at(z.s + a, b); p(c, q[0], q[1], 2, 2, blink ? 'rgba(255,58,34,0.5)' : 'rgba(255,176,154,0.4)'); }
      }
      return;
    }
    // 14/10 (cờ tắt ?hutrum=0): ảnh sóng thần hu-song-than của Ngư Tinh xếp nối dọc bức tường (chừa khe), chỉ trong sàn phòng; mép trước vẫn chấm đỏ cam.
    if (z.src && z.src.isBoss && G.huTrum && G.huTrum('hu-song-than')) {
      const W0 = G.getWorld(), FA = G.fxAnh, so = FA.ds['hu-song-than'].so, co = 0.75, L = [];
      for (let b = -z.half, i = 0; b <= z.half; b += 14, i++) {
        if (Math.abs(b - z.g) <= z.gw + 6) continue;
        const q = at(z.s, b);
        if (W0 && (q[0] < W0.x0 - 6 || q[0] > W0.x1 + 6 || q[1] < W0.y0 - 6 || q[1] > W0.y1 + 10)) continue;
        L.push([q[0], q[1] + 4, i]);
      }
      L.sort((p1, p2) => p1[1] - p2[1]);
      for (const [x, y, i] of L) FA.veK(c, 'hu-song-than', x, y, (Math.floor(t * 12) + i * 2) % so, 0, co, cs < 0);
      for (let b = -z.half; b <= z.half; b += 2) { if (Math.abs(b - z.g) <= z.gw) continue; if (((b >> 1) + ((t * 16) | 0)) % 3) { const q = at(z.s + z.th / 2 + 3, b); p(c, q[0], q[1], 1, 2, '#ff5a40'); } }
      for (const s of [-1, 1]) { const q = at(z.s, z.g + s * z.gw); p(c, q[0] - 1, q[1] - 1, 3, 3, '#ffffff'); }
      return;
    }
    for (let b = -z.half; b <= z.half; b += 2) {
      if (Math.abs(b - z.g) <= z.gw) continue;
      const o = Math.sin(b * 0.2 + t * 12) * 2;
      for (let a = -z.th / 2; a <= z.th / 2; a += 2) { const q = at(z.s + a + o, b); p(c, q[0], q[1], 2, 2, a > z.th / 2 - 3 ? '#ffffff' : a > 0 ? '#9fd0e8' : '#4a80b0'); }
      // mép trước đang gây sát thương: chấm đỏ cam chạy trước bọt (khác vệt báo trước nhấp nháy), màu vùng nguy hiểm docs/vfx/BANG-MAU.md
      if (((b >> 1) + ((t * 16) | 0)) % 3) { const q = at(z.s + z.th / 2 + 3 + o, b); p(c, q[0], q[1], 1, 2, '#ff5a40'); }
    }
    for (const s of [-1, 1]) { const q = at(z.s, z.g + s * z.gw); p(c, q[0] - 1, q[1] - 1, 3, 3, '#ffffff'); }
  }
  // Bom: lúc bay thì vẽ quả bom theo vòng cung, lúc nằm thì quả bom nhấp nháy giữa vòng đỏ đếm ngược
  function drawBomb(c, z) {
    const B = z.bomb, el = z.el, T0 = z.t0, gone = T0 - z.t;
    const col = el === 'ice' ? ['#1b4c92', '#3883d4', '#a6deff'] : el === 'poison' ? ['#58208c', '#9a48d4', '#e4a8ff'] : ['#5a1a0a', '#c43c10', '#ffd23c'];
    let x = z.x, y = z.y, lift = 0;
    if (B.fl > 0 && gone < B.fl && B.nx != null && B.f1 > 0) {
      // hạt dẻ nảy (js/ky_nang_quai.js, Sóc): vòng cung cao tới chỗ chạm đất (nx, ny), rồi nảy một vòng cung thấp tới chỗ nổ
      if (gone < B.f1) { const q = gone / B.f1; x = B.x0 + (B.nx - B.x0) * q; y = B.y0 + (B.ny - B.y0) * q; lift = Math.sin(q * PI) * 26; }
      else { const q = Math.min(1, (gone - B.f1) / Math.max(0.01, B.fl - B.f1)); x = B.nx + (z.x - B.nx) * q; y = B.ny + (z.y - B.ny) * q; lift = Math.sin(q * PI) * 10; }
    } else if (B.fl > 0 && gone < B.fl) { const q = gone / B.fl; x = B.x0 + (z.x - B.x0) * q; y = B.y0 + (z.y - B.y0) * q; lift = Math.sin(q * PI) * 26; }
    const s = B.big ? 5 : 3;
    p(c, x - s, y - 1, s * 2, 2, 'rgba(0,0,0,0.3)');
    const by = y - s - lift - 1;
    // Ảnh AI quả nổ của Sóc Ném Quả Nổ (hu-dan-qua-no, js/fx_anh.js); không có tệp thì vẽ quả bom vuông như cũ
    // Phiên hieu-ung-b1: thêm bom to của tinh anh (hu-bom-to), bó pháo của Tiểu Yêu và bom vùng lửa (hu-bom-phao), bom băng của Sứa, Hải Quỳ và vùng băng (hu-bom-bang).
    // Ảnh bom neo ở ĐÁY (đáy quả bom chạm đất). Chưa có tệp thì vẽ quả bom vuông như cũ.
    const FA = G.fxAnh;
    const maBom = !FA ? null : B.big ? 'hu-bom-to' : B.art === 'tieuYeu' ? 'hu-bom-phao' : B.art === 'sua' || B.art === 'haiQuy' ? 'hu-bom-bang' : el === 'ice' ? 'hu-bom-bang' : el === 'fire' ? 'hu-bom-phao' : null;
    const anhBom = maBom ? FA.get(maBom) : null;
    let dinh = by - s; // mép trên của quả bom: ngòi nhấp nháy vẽ ngay trên đó
    if (B.anh && FA && FA.co(B.anh)) FA.ve(c, B.anh, x, by, gone, 0, 1); // ảnh riêng của vật ném (js/ky_nang_quai.js: hạt bào tử hu-dan-bao-tu)
    else if (B.art === 'socNo' && FA && FA.co('hu-dan-qua-no')) FA.ve(c, 'hu-dan-qua-no', x, by, gone, 0, 1);
    else if (anhBom) { FA.ve(c, maBom, x, y - lift, gone, 0, 1); dinh = Math.round(y - lift - (anhBom.ay - 2) * anhBom.co); }
    else {
      p(c, x - s, by - s + 1, s * 2, s * 2 - 2, '#14182e'); p(c, x - s + 1, by - s, s * 2 - 2, s * 2, '#14182e');
      p(c, x - s + 1, by - s + 1, s * 2 - 2, s * 2 - 2, col[1]); p(c, x - s + 1, by - s + 1, 2, 2, col[2]);
    }
    if (z.t > 0 && (gone >= B.fl)) {
      const k = 1 - z.t / Math.max(0.01, T0 - B.fl), fast = k > 0.7 ? 20 : 8;
      if (Math.floor(G.time * fast) % 2) p(c, x - 1, dinh - 3, 2, 3, '#ffd23c');
      p(c, x, dinh - 4, 1, 1, '#ffffff');
    }
  }
  G.mobDrawBomb = drawBomb; // js/bao_truoc.js vẽ vòng đỏ, quả bom vẫn vẽ ở đây
  const zone0 = A.zone;
  A.zone = function (c, z) {
    if (z.wall) return drawWall(c, z);
    if (z.shape === 'line') return z.pool ? null : drawLine(c, z);
    if (z.shape === 'cone') return drawCone(c, z);
    if (z.shape === 'donut') return drawDonut(c, z);
    zone0(c, z);
    if (z.bomb) drawBomb(c, z);
  };
  // fx.zoneFire chỉ biết vùng tròn và chữ nhật: vùng mới thì rải vài chớp sáng dọc hình
  if (G.fx && G.fx.zoneFire) {
    const zf0 = G.fx.zoneFire;
    G.fx.zoneFire = function (z) {
      if (!z || z.shape === 'circle' || z.shape === 'rect' || z.wave) return zf0(z);
      if (G.noRender || z.team === 'player') return;
      const pts = [];
      if (z.shape === 'line') for (let i = 0; i <= 3; i++) pts.push([z.x + Math.cos(z.ang) * z.len * i / 3, z.y + Math.sin(z.ang) * z.len * i / 3]);
      else if (z.shape === 'cone') for (let i = 0; i < 4; i++) { const a = z.ang + (i / 3 - 0.5) * z.span; pts.push([z.x + Math.cos(a) * z.r * 0.7, z.y + Math.sin(a) * z.r * 0.7]); }
      else if (z.shape === 'donut') for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = (z.r0 + z.r1) / 2; pts.push([z.x + Math.cos(a) * r, z.y + Math.sin(a) * r * (G.ZK || 1)]); }
      const col = z.el && G.EL[z.el] ? G.EL[z.el].col : '#fff0c8';
      // 15/10 con-ve-tay: có ảnh hu-va-cham thì mỗi điểm là ảnh va chạm nhuộm màu hệ (thay 4 hạt vuông vẽ code); ảnh chưa tải thì không rải hạt
      const vc = G.huVt && G.huVt('hu-va-cham');
      if (vc) for (const q of pts) G.fx.anh('hu-va-cham', q[0], q[1] - 3, { sc: 1.1, mau: z.el && G.EL[z.el] ? col : null }); // đợt 2: ảnh chưa tải thì không rải hạt vuông
      if (G.fx.shake) G.fx.shake(0.15);
    };
  }

  // ---------- đạn của quái ----------
  const proj0 = A.proj;
  A.proj = function (c, o) {
    if (o.team !== 'enemy' || !(o.kind === 'spike' || o.kind === 'orb' || o.kind === 'bua')) return proj0(c, o);
    const x = Math.round(o.x), y = Math.round(o.y - (o.z || 10)), sp = Math.hypot(o.vx, o.vy) || 1, ux = o.vx / sp, uy = o.vy / sp;
    p(c, x - 2, Math.round(o.y), 4, 1, 'rgba(0,0,0,0.3)');
    const col = o.col || (o.el ? G.EL[o.el].col : '#bfeaff');
    if (o.kind === 'spike') {
      for (let i = -4; i <= 3; i++) p(c, x + ux * i, y + uy * i, 1, 1, i > 1 ? '#ffffff' : i > -2 ? col : '#14182e');
      p(c, x + ux * 4, y + uy * 4, 1, 1, '#ffffff');
      return;
    }
    if (o.kind === 'bua') {
      // lá bùa bay: tờ giấy vàng chữ đỏ, rung nhẹ
      const f = Math.floor(G.time * 10) % 2;
      p(c, x - 3, y - 4 + f, 6, 8, '#14182e'); p(c, x - 2, y - 3 + f, 4, 6, '#f4e070'); p(c, x - 1, y - 2 + f, 2, 1, '#c8372d'); p(c, x - 1, y + f, 2, 1, '#c8372d');
      return;
    }
    p(c, x - 3, y - 2, 6, 4, '#14182e'); p(c, x - 2, y - 3, 4, 6, '#14182e');
    p(c, x - 2, y - 2, 4, 4, col); p(c, x - 1, y - 2, 1, 1, '#ffffff');
    for (let i = 1; i < 3; i++) p(c, x - ux * i * 3, y - uy * i * 3, 1, 1, o.col2 || col);
  };

  // ---------- biểu tượng nhỏ trên đầu ----------
  // Phiên C2 (chủ dự án: "9×9 quá bé"): biểu tượng đặc tính nay 12×12 trên ô nền 13×13 (trước là hình 5–7 điểm trên ô 9×9).
  // Có tệp gd-quai-<nhanh|giap|no|hut|gai> thì dùng ảnh AI (thu vừa 12×12), chưa có thì vẽ bằng bảng điểm ảnh dưới đây.
  const IC_CO = 13, IC_BUOC = IC_CO + 2; // cạnh ô nền; khoảng cách giữa hai tâm biểu tượng (giữ khe 2 điểm như cũ: 11 - 9)
  const IC_BM = {
    nhanh: ['......aaaa..', '.....aaab...', '....aaab....', '...aaab.....', '..aaaaaaaa..', '..bbbaaaab..', '.....aaab...', '....aaab....', '...aaab.....', '...aab......', '..aab.......', '..ab........'],
    giap: ['.aaaaaaaaaa.', '.acaabbaaaa.', '.acaabbaaaa.', '.acaabbaaaa.', '.aaaabbaaaa.', '.aaaabbaaaa.', '.aaaabbaaaa.', '..aaabbaaa..', '..aaabbaaa..', '...aabbaa...', '....abba....', '.....aa.....'],
    no: ['.........ss.', '........fs..', '.......f....', '....kkkf....', '..kkkkkkkk..', '.kkhhkkkkkk.', '.khhkkkkkkd.', '.khkkkkkkdd.', '.kkkkkkkkdd.', '.kkkkkkkddd.', '..kkkkdddd..', '....dddd....'],
    hut: ['.....aa.....', '.....aa.....', '....aaaa....', '....aaaa....', '...aaaaaa...', '..aaaaaaaa..', '..ahaaaaaa..', '.aahaaaaaaa.', '.aahaaaaaaa.', '.aaahaaaaaa.', '..aaaaaaaa..', '...aaaaaa...'],
    gai: ['.....aa.....', '.....aa.....', '....aaaa....', '.a..aaaa..a.', '.a..aaaa..a.', 'aaa.aaaa.aaa', 'aaa.aaaa.aaa', 'aaaaaaaaaaaa', 'aaaaaaaaaaaa', 'aaaaaaaaaaaa', 'bbbbbbbbbbbb', '............'], // ba mũi gai (bản 9×9 cũ là một vạch đứng, dễ lẫn với dấu "!" sắp ra đòn)
    vo: ['.aaaaakaaaa.', '.aaaakkaaaa.', '.aaaakaaaaa.', '.aaaakkaaaa.', '.aaaaakaaaa.', '.aaaakkaaaa.', '.aaaakaaaaa.', '..aaakkaaa..', '..aaaakaaa..', '...aakkaa...', '....akaa....', '.....ka.....'],
  };
  const IC_PAL = {
    nhanh: [{ a: '#ffd23f', b: '#c98c34' }],
    giap: [{ a: '#c9ccd2', b: '#6a7080', c: '#ffffff' }],
    no: [{ k: '#5a5d70', d: '#3a3c4e', h: '#c8ccd6', f: '#c8a060', s: '#ffd23f' }, { k: '#5a5d70', d: '#3a3c4e', h: '#c8ccd6', f: '#c8a060', s: '#ff5a2a' }], // thân bom xám sáng hơn bản cũ (#2a2a2a) để nổi trên ô nền tối
    hut: [{ a: '#e02a3a', h: '#ffb0b8' }],
    gai: [{ a: '#ffffff', b: '#c9270c' }, { a: '#ff3a22', b: '#7a1408' }],
    vo: [{ a: '#7a7a80', k: '#14182e' }],
  };
  const IC_CV = new Map();
  function iconCode(kind, f) {
    const pal = IC_PAL[kind]; f = f % pal.length;
    let cv = IC_CV.get(kind + f);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = 12; cv.height = 12;
      const g = cv.getContext('2d');
      IC_BM[kind].forEach((r, j) => { for (let i = 0; i < 12; i++) if (pal[f][r[i]]) { g.fillStyle = pal[f][r[i]]; g.fillRect(i, j, 1, 1); } });
      IC_CV.set(kind + f, cv);
    }
    return cv;
  }
  const gdAnh = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; };
  let IC_NEN_AI = false; // ?icnen=1: lót ô nền tối cả dưới ảnh AI (như trước 14/10), chỉ để so
  try { IC_NEN_AI = typeof location !== 'undefined' && /[?&]icnen=1(&|$)/.test(location.search || ''); } catch (e) { IC_NEN_AI = false; }
  function icon(c, kind, x, y) {
    x = Math.round(x); y = Math.round(y);
    // Lỗi "nền đen" 14/10 (docs/review/ke-hoach-cai-thien/loi-nen-den): ô nền tối 13×13 chỉ dành cho hình vẽ code (không viền).
    // Ảnh AI (gd-quai-*, hu-pha-giap) có nền trong suốt và viền tối riêng → vẽ thẳng lên sàn, không lót ô (trước đây hiện ô đen sau
    // quả bom tinh anh "Nổ khi chết" và mũi gai của nhím). ?icnen=1 bật lại ô nền cho cả ảnh AI để so.
    const lot = () => p(c, x - 6, y - 6, IC_CO, IC_CO, 'rgba(20,24,46,0.85)');
    if (!IC_BM[kind]) { lot(); return; }
    // hình 12×12 nằm giữa ô 13×13: lệch nửa điểm game (= 1 điểm thật khi màn nét gấp đôi) cho cân hai bên
    const o = (G.NET || 1) >= 2 ? 5.5 : 6, g = gdAnh('gd-quai-' + kind), sm = c.imageSmoothingEnabled, ga = c.globalAlpha;
    const coAnhVo = !g && kind === 'vo' && G.fxAnh && G.fxAnh.co('hu-pha-giap');
    if ((!g && !coAnhVo) || IC_NEN_AI) lot();
    if (g) { // ảnh AI: đứng yên; riêng "gai" vẫn nhấp nháy (mờ/rõ) để báo nguy hiểm như bản code
      if (kind === 'gai' && Math.floor(G.time * 12) % 2 === 0) c.globalAlpha = ga * 0.55;
      G.spriteCustom.veGd(c, g, x - o, y - o, 12, 12);
      c.globalAlpha = ga;
      return;
    }
    c.imageSmoothingEnabled = false;
    if (coAnhVo) { // biểu tượng vỡ giáp: khung đầu của ảnh AI thu nhỏ vào ô 12×12
      const a = G.fxAnh.get('hu-pha-giap'), n = a.net, sw = a.fw * n, sh = a.fh * n, k = Math.min(12 / a.fw, 12 / a.fh);
      c.drawImage(a.img, (a.so - 2) * sw, 0, sw, sh, x - Math.round(a.fw * k / 2), y - Math.round(a.fh * k / 2), Math.round(a.fw * k), Math.round(a.fh * k));
    } else c.drawImage(iconCode(kind, kind === 'no' ? Math.floor(G.time * 10) : kind === 'gai' ? Math.floor(G.time * 12) : 0), x - o, y - o, 12, 12);
    c.imageSmoothingEnabled = sm;
  }
  G.mobIconCo = IC_CO; // cho bài kiểm tra
  // Số biểu tượng đang hiện trên đầu một con quái (js/linhkhi.js dùng để nâng huy hiệu hệ lên trên hàng biểu tượng, khỏi che nhau).
  G.mobIconN = (e) => (e && e.art && e.dying == null ? (e.trait ? 1 : 0) + (e.spikeUp > 0 ? 1 : 0) + (e.role === 'shield' && e.brokeT > 0 ? 1 : 0) : 0);
  // Mặt khiên của quái giáp: vệt cong vàng ở phía trước (biết phải vòng ra sau)
  function shieldArc(c, e) {
    const f = e.face, r = e.r + 5;
    // 16/10 con-ve-tay-5 (chủ game: "chấm vàng sau con bọ"): đang chặn hình vẽ code thì thay vệt chấm vàng bằng ảnh có sẵn gd-quai-giap
    // (biểu tượng giáp, 10×10) ở mặt khiên — vẫn biết phải vòng ra sau. Chưa có ảnh: không vẽ gì. ?vecode=1: vệt chấm cũ.
    if (G.dangChan && G.dangChan()) {
      const g = gdAnh('gd-quai-giap');
      if (!g || !G.spriteCustom || !G.spriteCustom.veGd) return;
      const ga = c.globalAlpha;
      c.globalAlpha = ga * (e.hitT > 0.2 ? 1 : 0.85);
      try { G.spriteCustom.veGd(c, g, Math.round(e.x + f * r) - 5, Math.round(e.y - 4 - r * 0.35) - 5, 10, 10); } finally { c.globalAlpha = ga; }
      return;
    }
    for (let i = -4; i <= 4; i++) { const a = (i / 4) * 0.9, x = e.x + f * Math.cos(a) * r, y = e.y - 4 + Math.sin(a) * r * 0.7; p(c, x, y, 2, 2, e.hitT > 0.2 ? '#ffffff' : 'rgba(255,214,90,0.85)'); }
  }

  // ---------- Đợt 7: trạng thái dính độc / cháy / đóng băng hiện TRÊN THÂN quái ----------
  // Cờ tắt một chỗ: G.TRANG_THAI_TREN_THAN = false (hoặc mở trang với ?than=0) → vẽ y cũ: biểu tượng trạng thái trên đầu, không nhuộm thân, không hạt.
  // Chỉ là hình: không đọc, không đổi sát thương theo thời gian hay thời lượng trạng thái (e.st do js/combat.js quản).
  // Số liệu theo docs/review/ke-hoach-cai-thien/dac-ta-trang-thai-va-tile.md mục 1, 2.
  if (G.TRANG_THAI_TREN_THAN == null) G.TRANG_THAI_TREN_THAN = !(typeof location !== 'undefined' && /[?&]than=0(&|$)/.test(location.search || ''));
  const TT_MAU = ['#9cfefa', '#fe7d04', '#5aca02'], TT_MUC = [0.45, 0.35, 0.4], TT_IT = [3, 2, 1]; // thứ tự ưu tiên nhuộm: 0 băng > 1 cháy > 2 độc (độc: thử 35% thì Heo Rừng Con và Bọ Hung chênh sáng với sàn rừng chưa tới 0,15 nên lấy 40%); TT_IT: số hạt ít nhất khi phải nhường chỗ (tổng ≤ 6)
  const TT_ST0 = { fire: 0, poisonN: 0, iceN: 0, frozen: 0 }, TT_THU = [0, 1, 2];
  let ttSo = 0;
  const ttRnd = (a) => { a = (a ^ 61) ^ (a >>> 16); a = (a + (a << 3)) | 0; a ^= a >>> 4; a = Math.imul(a, 0x27d4eb2d); a ^= a >>> 15; return (a >>> 0) / 4294967296; };
  // Tính trạng thái hiển thị của một con quái trong khung này. Trả null nếu quái không có ảnh AI sẵn sàng (khi đó vẽ y cũ).
  function ttQuai(e) {
    const SC = G.spriteCustom, sp = SC && SC.get && SC.get(e.art);
    if (!sp) return null;
    // Sổ nhỏ gắn trên quái (chỉ để vẽ, như e.fxId của js/fx.js). Lúc chết js/fx.js chép quái sang bản "đang chết" nên sổ đi theo: hạt tan dần chứ không tắt phụt.
    let R = e.ttR;
    if (!R) R = e.ttR = { id: ++ttSo, tu: [-1, -1, -1], n: [0, 0, 0], cung: false, chet: -1, nhuom: null, than: { mau: '', muc: 0, suong: 0 }, D: null, s: 2, k: 1 };
    const now = G.time, st = e.st || TT_ST0;
    let D = SC.dangQuai ? SC.dangQuai(sp) : null;
    if (!D) { const q = info(e.art), w = q.w || 30, h = q.h || 24; D = R.D || { x0: -w / 2, x1: w / 2, y0: -h, y1: 0, w, h, tren: null, sau: null, cx0: 0, cy0: 0, chan: [-w * 0.35, w * 0.35] }; }
    R.D = D; R.s = Math.max(2, Math.round(D.h / 12)); R.nhuom = null; R.k = 1;
    if (e.dying != null) { // chết: tắt nhuộm, hạt tan trong 6 khung
      if (R.chet < 0) R.chet = now;
      R.k = 1 - (now - R.chet) * 60 / 6;
      return R;
    }
    const on0 = st.iceN > 0 || st.frozen > 0, on1 = st.fire > 0, on2 = st.poisonN > 0;
    R.tu[0] = on0 ? (R.tu[0] < 0 ? now : R.tu[0]) : -1; R.tu[1] = on1 ? (R.tu[1] < 0 ? now : R.tu[1]) : -1; R.tu[2] = on2 ? (R.tu[2] < 0 ? now : R.tu[2]) : -1;
    R.cung = st.frozen > 0;
    // số hạt: theo cỡ thân, tổng không quá 6; phải bớt thì bớt của trạng thái dính lâu nhất trước
    const nb = clamp(Math.round(D.h / 12), 2, 5), n = R.n;
    n[0] = on0 ? (R.cung ? 3 + (nb >= 5 ? 2 : 1) : 3) : 0; n[1] = on1 ? clamp(nb, 2, 4) : 0; n[2] = on2 ? nb : 0;
    let tong = n[0] + n[1] + n[2];
    if (tong > 6) {
      TT_THU.sort((a, b) => R.tu[a] - R.tu[b]);
      for (let i = 0; i < 3 && tong > 6; i++) { const k = TT_THU[i]; if (R.tu[k] < 0) continue; const bo = Math.min(tong - 6, n[k] - TT_IT[k]); if (bo > 0) { n[k] -= bo; tong -= bo; } }
    }
    // màu nhuộm: chỉ MỘT màu. Trạng thái vừa dính đè trong 6 khung đầu, sau đó băng > cháy > độc. Hai khung đầu của chớp trắng trúng đòn thì tắt nhuộm.
    let m = on0 ? 0 : on1 ? 1 : on2 ? 2 : -1;
    if (m >= 0) {
      let moi = m;
      for (let k = 0; k < 3; k++) if (R.tu[k] > R.tu[moi]) moi = k;
      if (now - R.tu[moi] < 0.1) m = moi;
      if (!(e.flash > 0.037)) {
        const T = R.than;
        T.mau = TT_MAU[m]; T.suong = m === 0 ? 0.2 : 0;
        T.muc = m === 1 ? 0.35 + 0.05 * Math.round(Math.sin(now * 60 / 12 * TAU)) : TT_MUC[m]; // cháy: dao động 30–40% chu kỳ 12 khung
        R.nhuom = T;
      }
    }
    return R;
  }
  // Bong bóng độc: thân s×s màu #c8f90b, viền ngoài #277600 (bo góc), lõi 1 px #fbfed0.
  function ttBong(c, x, y, s) {
    x = Math.round(x); y = Math.round(y);
    if (s < 2) { p(c, x, y, 1, 1, '#c8f90b'); return; }
    p(c, x, y - 1, s, s + 2, '#277600'); p(c, x - 1, y, s + 2, s, '#277600');
    p(c, x, y, s, s, '#c8f90b'); p(c, x + ((s - 1) >> 1), y + ((s - 1) >> 1), 1, 1, '#fbfed0');
  }
  // Lưỡi lửa 3 nấc: chân #c9270c, thân #fe7d04, ngọn #ffc90e + 1 px #feec86. (x, y) = giữa chân lửa; rộng s, cao h; kieu: 0 thấp, 1 cao, 2 nghiêng về phía lưng (lech).
  function ttLua(c, x, y, s, h, kieu, lech) {
    x = Math.round(x - s / 2); y = Math.round(y);
    const hc = Math.max(1, Math.round(h * 0.25)), hn = Math.max(1, Math.round(h * 0.4)), ht = Math.max(1, h - hc - hn), wn = Math.max(1, s - 1), xn = x + (kieu === 2 ? lech : 0) + ((s - wn + (lech > 0 ? 1 : 0)) >> 1);
    p(c, x, y - hc, s, hc, '#c9270c');
    p(c, x, y - hc - ht, s, ht, '#fe7d04');
    p(c, xn, y - h, wn, hn, '#ffc90e');
    p(c, xn + (kieu === 2 && lech > 0 ? wn - 1 : 0), y - h, 1, 1, '#feec86');
  }
  // Mảnh băng góc cạnh: thân #9cfefa, viền ngoài #217bc3, điểm sáng 1 px trắng. (x, y) = mép trái chân mảnh; rộng s, cao h; dinh: cột nào cao nhất.
  function ttBang(c, x, y, s, h, dinh, nhay) {
    x = Math.round(x); y = Math.round(y);
    for (let i = 0; i < s; i++) { const hi = Math.max(1, h - Math.abs(i - dinh) * Math.max(1, Math.round(h / (s + 1)))); p(c, x + i - 1, y - hi - 1, 3, hi + 1, '#217bc3'); }
    for (let i = 0; i < s; i++) { const hi = Math.max(1, h - Math.abs(i - dinh) * Math.max(1, Math.round(h / (s + 1)))); p(c, x + i, y - hi, 1, hi, '#9cfefa'); }
    p(c, x + dinh, y - h + (h > 2 ? 1 : 0), 1, 1, '#ffffff');
    if (nhay && h > 2) p(c, x + dinh, y - h, 1, 1, '#ffffff'); // nhấp sáng một lần mỗi 40 khung
  }
  // Vẽ hạt bám thân. lop: 0 = sau thân (gọi trước khi vẽ quái), 1 = trước thân (gọi sau).
  function ttHat(c, e, R, lop) {
    const k = R.k;
    if (!(k > 0) || G.ttTatHat) return; // G.ttTatHat: chỉ bài kiểm dùng (so ảnh riêng phần nhuộm)
    const n = R.n;
    if (!n[0] && !n[1] && !n[2]) return;
    const D = R.D, f = e.face < 0 ? -1 : 1, F = Math.floor(G.time * 60), s = Math.max(1, Math.round(R.s * k)), ex = Math.round(e.x), ey = Math.round(e.y);
    // 15/10 con-ve-tay: js/fx.js (fx.entity) đã vẽ ảnh hu-bam-bang / hu-bam-lua / hu-bam-doc trên MỌI quái đang dính hệ → hạt vẽ code ở đây
    // (mảnh băng ở chân, lưỡi lửa, bong bóng độc VUÔNG xanh lục) chồng thêm một lớp nữa. Có ảnh thì bỏ phần hạt code đó; nhuộm thân giữ.
    // ?hudot3=0: không có ảnh hu-bam-* → hạt code như cũ. (15/10 don-tep B: bỏ cờ ?vetaycu=1.)
    // Đợt 2 (YEU-CAU-2): ảnh hu-bam-* chưa tải xong cũng KHÔNG vẽ hạt code (gọi G.huDot3 chỉ để báo tải ngay).
    const coA = (ma) => { if (G.huDot3) G.huDot3(ma); return G.HU_DOT3 !== false; };
    const boBang = coA('hu-bam-bang'), boLua = coA('hu-bam-lua'), boDoc = coA('hu-bam-doc');
    const tren = (xr) => { if (!D.tren) return D.y0; const i = clamp(Math.round(xr - D.cx0), 0, D.tren.length - 1), v = D.tren[i]; return v > 9999 ? D.y0 : v; };
    const lung = (yr) => { if (!D.sau) return D.x0; const i = clamp(Math.round(yr - D.cy0), 0, D.sau.length - 1), v = D.sau[i]; return v > 9999 ? D.x0 : v; };
    const wx = (xr, rong) => (f > 0 ? ex + xr : ex - xr - rong); // xr: toạ độ khi quái quay phải; quay trái thì lật quanh tâm
    // --- băng: 3 mảnh ở chân (trước thân), khi đông cứng thêm 1–2 mảnh ở vai phía lưng (sau thân). Đứng yên.
    if (n[0] && !boBang) {
      const h = Math.max(2, Math.round(R.s * 1.5 * k)), nhay = F % 40 < 3;
      if (lop === 1) for (let j = 0; j < 3 && j < n[0]; j++) {
        const xr = D.chan[0] + (D.chan[1] - D.chan[0] - s) * (0.06 + 0.44 * j);
        ttBang(c, wx(xr, s), ey + D.y1, s, h - (j === 1 ? 0 : 1), j === 0 ? 0 : j === 1 ? (s >> 1) : s - 1, nhay && j === 1);
      }
      else for (let j = 3; j < n[0]; j++) {
        const yr = D.y0 + D.h * (j === 3 ? 0.3 : 0.42), xr = Math.max(D.x0 - 1, lung(yr) - Math.round(s * 0.6)); // bám sát viền lưng, không ló quá hộp thân 2 px
        ttBang(c, wx(xr, s), ey + yr + Math.round(h / 2), s, h, f > 0 ? 0 : s - 1, nhay && j === 3);
      }
    }
    // --- độc: bong bóng nổi lên 1 px mỗi 4 khung, sống 24 khung rồi co về 1 px, sinh so le. Trên thân: vẽ trước; ở mép lưng: vẽ sau thân (ló ra ngoài viền).
    if (n[2] && !boDoc) for (let j = 0; j < n[2]; j++) {
      const sau = n[2] >= 3 && j === n[2] - 1;
      if ((lop === 0) !== sau) continue;
      const ph = F + Math.round(j * 30 / n[2]) + R.id * 7, a = ph % 30, g = (R.id * 131 + j * 17 + Math.floor(ph / 30) * 7919) | 0;
      const sz = a < 24 ? s : Math.max(1, Math.round(s * (1 - (a - 23) / 6)));
      const y0 = D.y0 + D.h * (0.55 + 0.33 * ttRnd(g + 1)) - Math.floor(a / 4);
      const xr = sau ? Math.max(D.x0 - 1, lung(Math.round(y0)) - Math.min(2, Math.round(s * 0.5))) : D.x0 + D.w * 0.2 + Math.max(0, D.w * 0.42 - s - 2) * ttRnd(g); // trên thân: tránh 1/3 phía mặt (kể cả viền bong bóng)
      ttBong(c, wx(xr, sz), ey + y0 - sz, sz);
    }
    // --- cháy: lưỡi lửa ở vai và lưng (nửa trên, phía lưng), 3 khung lặp thấp–cao–nghiêng, 6 khung mỗi ảnh. Luôn trước thân.
    if (n[1] && !boLua && lop === 1) for (let j = 0; j < n[1]; j++) {
      const xr = D.x0 + D.w * (0.14 + (n[1] > 1 ? 0.34 * j / (n[1] - 1) : 0.15)), kh = Math.floor((F + j * 5) / 6) % 3;
      const h = Math.max(2, Math.round((kh === 0 ? 1.5 : 2) * s));
      const yb = clamp(tren(xr) + s, D.y0 + 2 * s - 2, D.y0 + D.h * 0.45);
      ttLua(c, wx(xr, 0) + (kh === 2 ? -f : kh === 1 ? 0 : f) * (j & 1 ? 1 : 0), ey + yb, s, h, kh, -f);
    }
  }
  G.ttQuai = ttQuai; // cho bài kiểm và công cụ xem thử

  // ---------- vẽ quái thường và tinh anh ----------
  const enemy0 = A.enemy;
  A.enemy = function (c, e) {
    if (!e.art || !MA()) return enemy0(c, e);
    if (e.hidden && e.dying == null) { drawUnder(c, e); return; }
    let n = e.an ? e.an.n : 'idle', t = e.an ? e.an.t : 0, o = {};
    if (e.dying != null) { n = 'die'; t = e.dying * dur(e.art, 'die'); }
    else if (e.st && e.st.frozen > 0) { n = 'idle'; t = 0; }
    // mục 3: choáng → 'stun' (lảo đảo trên hàng trúng đòn, KHÔNG chớp viền như js/boss.js), chỉ khi quái có ảnh AI (hình vẽ code không có cử động 'stun'). Cờ ?choangcu=1: như cũ.
    else if (e.st && e.st.stun > 0) { if (G.CHOANG_YEN !== false && MU().coAnh(e)) { n = 'stun'; t = G.time; } else { n = 'hit'; t = 0.08 + 0.06 * Math.sin(G.time * 9); } }
    // mục 19: e.hitT chạy 0,3 giây nhưng hàng trúng đòn chia theo D (0,35) → khung 4 chỉ ~37 ms. Nay trải đủ hàng trong 0,3 giây. Cờ ?trungdu=0: như cũ.
    else if (e.hitT > 0 && (n === 'idle' || n === 'move')) { n = 'hit'; t = G.TRUNG_DU !== false ? clamp((0.3 - e.hitT) / 0.3, 0, 1) * dur(e.art, 'hit') * 0.999 : 0.3 - e.hitT; }
    // mục 2 / 10A: vừa đánh xong — giữ khung cuối hàng đánh (hoặc Nhím Biển thu gai: hàng báo đòn phát ngược) rồi mới về đứng
    else if (e.duT > 0 && !e.act && (n === 'idle' || n === 'move')) {
      if (e.duK === 've') o.xiHoi = { u: clamp(1 - e.duT / MU().XI_T_VE, 0, 1) };
      else { n = 'atk'; t = dur(e.art, 'atk') * 0.999; o.fx = false; }
    }
    // mục 18: hàng đi theo đồng hồ bước (tốc độ thật, đi lùi thì phát ngược)
    else if (n === 'move' && !e.act && e.buocT != null && G.BUOC_TOC !== false) t = e.buocT;
    if (e.an && e.an.rev && n === 'spawn') t = Math.max(0, dur(e.art, 'spawn') - t); // lặn xuống: cử động xuất hiện chạy ngược
    if (e.an && e.an.cut && n === e.an.n) t = Math.min(t, e.an.cut * dur(e.art, n)); // cú lao: chỉ dùng nửa đầu cử động
    const k = e.don && e.don.kieu;
    if (n === 'atk' && (k === 'ban' || k === 'nem')) o.fx = false; // đạn thật do luật chơi bắn, không vẽ thêm đạn giả
    if (G.chieuTrum && G.chieuTrum.tatFx(e, n)) o.fx = false; // 14/10 ky-nang-trum-rieng: chiêu mới dùng cử động chiêu cũ → tắt hiệu ứng vẽ code của chiêu cũ
    const dir = e.act ? e.act.a : e.dirA != null ? e.dirA : e.face > 0 ? 0 : PI;
    // Lấy đà: cử động 'tele' trải đúng theo thời gian lấy đà thật (e.wind / e.act.T) nên tư thế co người đạt đỉnh và rung đúng lúc
    // sắp ra đòn, dù đòn lấy đà ngắn (bầy nhỏ 0,5 giây) hay dài (tinh anh, bom 0,85 giây). Chỉ đổi hình, không đổi thời gian ra đòn.
    if (n === 'tele' && e.act && e.wind > 0 && e.act.T > 0) {
      t = clamp(1 - e.wind / e.act.T, 0, 1) * dur(e.art, 'tele') * 0.999;
      if (G.BAO_DEU !== false) o.baoDeu = { tt: Math.max(0, e.act.T - e.wind), T: e.act.T }; // mục 6A: ảnh AI chạy hàng báo ~12 khung/giây rồi đưa đi đưa lại 3 khung cuối (js/sprite_custom.js)
    }
    // Ra đòn: đủ khung tới khung cuối (mục 2), nhóm phồng / cuộn xì hơi trước (mục 10A), đòn nặng giữ khung (xem gioDanh)
    else if (n === 'atk' && e.dying == null && !(e.duT > 0 && !e.act)) t = MU().gioDanh(e, t, o);
    const fk = G.fx && G.fx.chop ? G.fx.chop() : 1; // khựng hình: chỉ khung đầu chớp trắng hẳn
    Object.assign(o, { anim: n, t, face: e.face, dir, hit: e.flash > 0 ? (e.fxHk >= 3 ? 0.85 : e.fxHk === 2 ? 0.7 : 0.55) * fk : 0, chop: fk, tint: G.fx && G.fx.dotTint ? G.fx.dotTint(e) : null, bao: false }); // chớp trắng mạnh dần: thường, nặng, chí mạng (js/fx.js đặt e.fxHk); nhịp độc/cháy: nhuộm màu hệ
    // 14/10 (YEU-CAU-TRUM-NHO): trùm nhỏ có tệp ảnh pha 2 (<mã>-p2, js/sprite_custom.js) thì đổi sang hình pha 2 khi máu dưới 50%.
    // Lúc gục dùng hàng chết của pha 1. Tắt: ?trumnho=0 (G.TRUM_NHO_PHA = false).
    // 15/10 noi-gian-manh: nay là pha 2 THẬT (js/boss.js đổi b.phase ở G.NOI_GIAN.nho.nguong = 50% máu: nhanh hơn, thêm đòn, nối chiêu) → hình theo
    // đúng b.phase.
    if (e.role === 'mini' && e.dying == null && G.TRUM_NHO_PHA !== false && e.maxhp > 0) o.phase = G.NOI_GIAN ? (e.phase >= 1 ? 2 : 1) : e.hp < e.maxhp * 0.5 ? 2 : 1;
    if (e.role === 'mini') o.huTrum = true;
    // 15/10 noi-gian-manh (js/noi_gian.js): trùm nhỏ pha 2, tinh anh nổi giận — thân đỏ nhẹ có nhịp (nhuộm hệ có trước thì giữ), quầng đỏ dưới chân, đốm lửa giận
    const NGv = G.noiGian && e.dying == null ? G.noiGian : null;
    if (NGv && !o.tint) o.tint = NGv.tint(e); // 14/10: trong trận (js/monster_art.js HT.trongTran): ảnh hàng nấm đã đặt đúng vùng thật ở js/boss.js, ảnh đập sàn / phun lửa theo cỡ vùng thật
    if (e.role === 'shield' && !(e.brokeT > 0) && e.dying == null) shieldArc(c, e);
    if (e.spikeUp > 0 && e.dying == null) {
      // đang dựng gai: vòng đỏ nhấp nháy quanh chân
      const bl = Math.floor(G.time * 12) % 2, BT = G.baoTruoc;
      if (BT && BT.on && !G.noRender) BT.add({ k: 'circle', x: e.x, y: e.y, r: e.r + 7, ky: 0.6, u: 0, age: 1, el: e.el || null, dim: 0.8 + 0.2 * Math.sin(G.time * 12) }); // vẽ mịn ở js/bao_truoc.js
      else A.ellipse(c, e.x, e.y, e.r + 7, (e.r + 7) * 0.6, bl ? 'rgba(255,58,34,0.35)' : 'rgba(255,176,154,0.25)');
    }
    if (false && e.act && e.act.aim && e.wind > 0) { // chủ dự án: bắn thường không cần đường ngắm báo trước
      // đường ngắm của quái bắn xa
      const P = W().P, a = Math.atan2(P.y - e.y, P.x - e.x), L = Math.min(150, Math.hypot(P.x - e.x, P.y - e.y));
      const bl = Math.floor(G.time * 14) % 2, BT = G.baoTruoc;
      if (BT && BT.on && !G.noRender) BT.add({ k: 'aim', x: e.x + Math.cos(a) * 10, y: e.y - 6 + Math.sin(a) * 10, ang: a, len: Math.max(0, L - 10), w: 3, el: null, u: clamp(1 - e.wind / (e.act.T || 0.6), 0, 1), age: (e.act.T || 0.6) - e.wind }); // vẽ mịn ở js/bao_truoc.js
      else for (let i = 10; i < L; i += 4) p(c, e.x + Math.cos(a) * i, e.y - 6 + Math.sin(a) * i, 2, 1, bl ? 'rgba(255,58,34,0.8)' : 'rgba(255,200,180,0.6)');
    }
    const TR = G.TRANG_THAI_TREN_THAN !== false ? ttQuai(e) : null; // Đợt 7: trạng thái trên thân (null = cờ tắt hoặc quái chưa có ảnh AI → vẽ y cũ)
    if (TR) { o.than = TR.nhuom; ttHat(c, e, TR, 0); }
    if (NGv) NGv.veDuoi(c, e);
    G.monsterArt.draw(c, e.art, e.x, e.y, o);
    if (NGv) NGv.veTren(c, e);
    if (TR) ttHat(c, e, TR, 1);
    if (e.dying != null) return;
    const top = e.y - e.h - 2;
    const ic = [];
    if (e.trait) ic.push(e.trait);
    if (e.spikeUp > 0) ic.push('gai');
    if (e.role === 'shield' && e.brokeT > 0) ic.push('vo');
    ic.forEach((k2, i) => icon(c, k2, e.x + (i - (ic.length - 1) / 2) * IC_BUOC, top - 8)); // C2: ô 13×13, mép dưới vẫn ở top - 2 như ô 9×9 cũ
    // V50 (gd2-b): dấu "!" báo sắp ra đòn nay hiện cả khi quái có biểu tượng (tinh anh luôn có dấu hiệu): đặt lệch sang phải hàng biểu tượng thay vì bỏ.
    if (e.wind > 0 && e.wind < 0.25) {
      const sang = Math.floor(G.time * 10) & 1, cc = sang ? '#fff3b0' : '#ff4030', bx = ic.length ? Math.round(e.x + ((ic.length - 1) / 2) * IC_BUOC + 10) : e.x - 1, gs = gdAnh('gd-quai-sap-danh');
      if (gs) { const ga = c.globalAlpha; if (!sang) c.globalAlpha = ga * 0.55; G.spriteCustom.veGd(c, gs, Math.round(bx) - 1, Math.round(top) - 13, 4, 10); c.globalAlpha = ga; } // ảnh AI 4×10, cùng tâm với dấu code 2×8
      else { p(c, bx, top - 12, 2, 5, cc); p(c, bx, top - 6, 2, 2, cc); }
    }
    if (!TR) A.status(c, e, Math.round(e.x), Math.round(top)); // Đợt 7: cờ bật thì bỏ biểu tượng trạng thái trên đầu (đã hiện trên thân); biểu tượng tinh anh, vỡ giáp, thanh máu giữ nguyên
  };
  // Đang đi ngầm dưới đất: chỉ thấy vệt đất gợn
  function drawUnder(c, e) {
    const D = e.dive;
    if (!D || D.k === 'down') return;
    const f = Math.floor(G.time * 12) % 3;
    p(c, e.x - 5 + f, e.y, 4, 1, 'rgba(0,0,0,0.35)'); p(c, e.x + 1 - f, e.y + 1, 4, 1, 'rgba(0,0,0,0.25)');
  }

  // ---------- em bé đứng sau quái to: vẽ thêm bóng mờ của bé lên trên ----------
  G.mobHeroOver = function (c, P) {
    const w = W();
    if (!w || P.dead) return;
    const big = [];
    for (const e of w.ents) if (e.art && !e.dead && !e.hidden) big.push(e);
    if (w.boss && !w.boss.dead && w.boss.art) big.push(w.boss);
    for (const e of big) {
      const hw = (e.drawW || e.w || 40) * 0.42, hh = e.drawH || e.h || 30;
      // chỉ khi hình quái che hẳn thân bé (không chỉ chạm gót chân)
      if (e.y > P.y && Math.abs(P.x - e.x) < hw - 3 && P.y - 8 > e.y - hh * 0.9) {
        const a = G.heroArgs(P); a.alpha = 0.5;
        A.hero(c, a);
        return;
      }
    }
  };
})();
