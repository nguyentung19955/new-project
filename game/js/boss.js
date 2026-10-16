// Trùm: lớp thích nghi theo cách chơi, trùm nhỏ (2 chiêu riêng) và ba trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh: ba pha, năm chiêu).
// Hình và cử động lấy từ G.monsterArt (js/monster_art.js); mọi đòn ngắm theo góc bất kỳ tới em bé.
// Người chơi không nhảy: chiêu nào cũng né được bằng đi bộ hoặc lộn (vùng đỏ luôn có chỗ đứng hoặc khe hở).
(function () {
  const G = window.G;
  const W = () => G.getWorld();
  const PI = Math.PI, TAU = PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function FX(n, a, b, c, d, e) { if (G.noRender) return; const f = G.fx && G.fx[n]; if (f) f(a, b, c, d, e); }
  function dur(id, a) { const m = G.monsterArt; return (m && m.dur(id, a)) || 1; }
  function moc(id, a) { const m = G.monsterArt, l = m && m.list.find((x) => x.id === id), an = l && l.anims.find((x) => x.id === a); return (an && an.moc) || [0.45, 0.75]; }

  // Từ số liệu cách chơi trong ải, chọn ra các lớp thích nghi của trùm.
  G.computeLayers = function (stats, max, pct) {
    const L = [];
    const el = stats.el;
    const tot = el.fire + el.poison + el.ice + el.none;
    if (tot > 0) {
      const top = G.ELS.slice().sort((a, b) => el[b] - el[a])[0];
      if (el[top] / tot > 0.5) L.push({ type: 'resist', el: top, pct });
    }
    const rm = stats.ranged + stats.melee;
    if (rm > 0) {
      if (stats.ranged / rm > 0.6) L.push({ type: 'antiRanged' });
      else if (stats.melee / rm > 0.6) L.push({ type: 'antiMelee' });
    }
    if (stats.dodges > 15) L.push({ type: 'antiDodge' });
    return L.slice(0, max);
  };
  // Gọi được qua layers.map(G.layerText): khi hệ khắc chế cũng đang bị kháng thì không ghi "yếu".
  G.layerText = function (l, i, all) {
    if (l.type === 'resist') {
      const weakOk = !Array.isArray(all) || !all.some((x) => x.type === 'resist' && x.el === G.WEAK[l.el]);
      const s = weakOk ? G.t('Kháng {0}, yếu {1}', G.EL[l.el].name, G.EL[G.WEAK[l.el]].name) : G.t('Kháng {0}', G.EL[l.el].name);
      return l.scar ? G.t('{0} (vết sẹo)', s) : s;
    }
    if (l.type === 'antiRanged') return G.t('Chống đánh xa');
    if (l.type === 'antiMelee') return G.t('Chống áp sát');
    return G.t('Bắt bài lăn né');
  };
  function setWeak(b) {
    const res = b.layers.filter((l) => l.type === 'resist').map((l) => l.el);
    b.weak = res.map((e) => G.WEAK[e]).filter((e) => !res.includes(e));
  }
  const has = (b, type) => b.layers.some((l) => l.type === type);

  // Kích thước thân để đánh trúng (r: nửa bề ngang, hr: độ sâu, h: chiều cao hình)
  const BODY = { mocTinh: [30, 14, 124], nguTinh: [36, 16, 100], hoTinh: [32, 14, 110], cuaDa: [26, 12, 68], caTre: [26, 12, 68], namChua: [22, 12, 62], hoLua: [26, 12, 62] };
  const SPEED = { moc: 16, ngu: 36, ho: 60, mini: 30, thuong: 36 }; // thuong: Thuồng Luồng (vùng 4)

  G.makeBoss = function (kind, o) {
    const w = W();
    const reg = G.REGIONS[w.region];
    const g = w.geo || { cx: (w.x0 + w.x1) / 2, cy: (w.y0 + w.y1) / 2 };
    const M = G.MOB_ART || { boss: {}, mini: [] };
    const art = G.monsterArt ? (kind === 'mini' ? M.mini[w.region] : M.boss[kind]) : null;
    const bd = BODY[art] || [20, 10, 50];
    const b = {
      isBoss: true, kind, name: o.name, layers: o.layers, weak: [], weakHits: 0, phase: 0, exposed: 0, flash: 0,
      seq: [], cd: 1.2, face: -1, t: 0, hidden: false, st: G.st0(), dmg: w.base.dmg * (w.base.bossDmg || 1), marks: kind === 'mini' ? 10 : 20,
      maxhp: w.base.hp * (kind === 'mini' ? G.MINI_HP : (G.BOSS_HP_OF && G.BOSS_HP_OF[kind]) || G.BOSS_HP) * (w.base.bossHp || 1) * (cbOn() ? (kind === 'mini' ? CBS().mau[art] || CBS().mau.mini : CBS().mau[kind]) || 1 : 1), last: null, // × bù máu luật công bằng (G.CONG_BANG.mau: trùm vùng theo loại, trùm nhỏ theo hình)
      wind: 0, moving: false,
      x: g.cx + 60, y: g.cy - 6, r: bd[0], hr: bd[1], h: bd[2], art, scale: 1, busy: 0, tired: 0,
      speed: (SPEED[kind] || 30) * (w.haste || 1), el: reg.el, skin: reg.skin, resist: null, dirA: PI,
    };
    if (kind === 'mini') Object.assign(b, { role: 'mini' });
    b.hp = b.maxhp;
    setWeak(b);
    // Vùng 4 phiên 3B (js/thuong_luong.js): Thuồng Luồng — sân bãi đá giữa sông (thu hẹp chỗ đứng), đầu ở mép phải, hệ theo pha (lớp kháng + điểm yếu).
    if (kind === 'thuong' && G.thuongLuong) G.thuongLuong.tao(b, w);
    // Chống đánh xa: đứng xa trùm quá 120 thì tên chỉ còn 60% sức (js/combat.js G.damage).
    b.rangedShield = (P) => Math.hypot(P.x - b.x, P.y - b.y) > 120;
    if (kind === 'ho') {
      b.hopCd = 2; b.tpCd = 0;
      b.onHit = function (hit) {
        // Chống đánh xa: bị bắn thì Hồ Tinh biến mất rồi hiện ra ngay sau lưng em bé, vồ một cái
        if (hit.ranged && has(b, 'antiRanged') && b.tpCd <= 0 && b.busy <= 0 && !b.dead && !(b.invuln > 0)) {
          const P = w.P;
          b.tpCd = 4.5;
          b.skillName = 'Biến ra sau lưng vồ';
          FX('burst', b.x, b.y - 30, '#ffffff', 12, 60);
          b.x = clamp(P.x - P.face * 40, w.x0 + 10, w.x1 - 10); b.y = clamp(P.y, w.y0, w.y1);
          b.face = P.x >= b.x ? 1 : -1;
          G.zoneCircle(P.x, P.y, 24, 0.6, b.dmg, null, { src: b, skill: b.skillName });
          G.sfx('warn', 1.5);
          b.busy = 0.8; b.cd = Math.max(b.cd, 0.6);
          play(b, 'idle');
        }
      };
    }
    // Ra mắt: trùm vùng diễn màn ra mắt, trùm nhỏ diễn cử động xuất hiện; lúc này chưa đánh và không nhận sát thương.
    const intro = art ? dur(art, kind === 'mini' ? 'spawn' : 'intro') : 0.5;
    b.invuln = intro; b.busy = intro; b.intro = intro;
    play(b, kind === 'mini' ? 'spawn' : 'intro');
    if (kind !== 'mini') w.shake = Math.max(w.shake, 0.4);
    // 14/10 trum-chet-pha3: tải sẵn ảnh dáng pha 2, 3 ngay khi trùm ra (trước đây chỉ tải lúc đã sang pha → vài khung đầu cảnh chuyển pha
    // còn hình pha cũ rồi "nhảy" sang hình mới khi ảnh về). Chỉ gọi tải, không đổi gì khác.
    if (kind !== 'mini' && art && G.spriteCustom && G.spriteCustom.phaTrum) { const sp = G.spriteCustom.ds && G.spriteCustom.ds[art]; if (sp) { G.spriteCustom.phaTrum(sp, 2, 'idle'); G.spriteCustom.phaTrum(sp, 3, 'idle'); } }
    w.px1 = null; w.shrink = null;
    w.boss = b;
    return b;
  };

  // ======================= LUẬT CÔNG BẰNG (16/10 tư vấn 2, bảng G.CONG_BANG ở js/data.js; cờ tắt ?trumcongbang=0) =======================
  // Dùng chung cho trùm vùng, trùm nhỏ (ở đây), tinh anh (js/mobs.js thinkElite), chiêu ở js/chieu_trum.js, js/thuong_luong.js.
  const CB = (G.congBang = { thuHut: false });
  const cbOn = () => G.TRUM_CONG_BANG !== false && !!G.CONG_BANG;
  CB.on = cbOn;
  const CBS = () => G.CONG_BANG;
  // Đòn nặng của từng chiêu (hệ số sát thương đòn chính ≥ 1,2): khoá "loại trùm.mã chiêu". Trùm nhỏ: "mini.<hình>.<chiêu>".
  CB.NANG = {
    'moc.c1': 1, 'moc.c5': 1, 'ngu.c1': 1, 'ngu.c2': 1, 'ngu.c3': 1, 'ngu.c5': 1, 'ho.c2': 1, 'ho.c3': 1,
    'thuong.c1': 1, 'thuong.c2': 1, 'thuong.c3': 1, 'thuong.dop': 1, 'thuong.n1': 1, 'thuong.n2': 1, 'thuong.c5': 1, 'thuong.x2': 1, 'thuong.l2': 1,
    'thuong.d2': 1, 'thuong.m3': 1, 'thuong.s3': 1, 'thuong.dl': 1,
    'mini.cuaDa.atk': 1, 'mini.cuaDa.chieu1': 1, 'mini.hoLua.atk': 1, 'mini.hoLua.chieu1': 1, 'mini.hoLua.chieu2': 1, 'mini.caTre.chieu1': 1, 'mini.caTre.chieu2': 1,
  };
  // Đợt thêm (G.NOI_GIAN.chieu) là đòn nặng.
  // Đợt thêm là một hàng nổ lan dần (giây từ ô đầu tới ô cuối): đợt kế tính nghỉ từ lúc ô cuối nổ.
  CB.DAI = { mocRe: 0.54, namHang: 0.48 };
  CB.NANG_DOT = { mocQuat: 1, nguRiu: 1, nguPhun: 1, hoQuat: 1, cuaDap: 1, hoVoLua: 1, hoPhun: 1 };
  CB.nang = (b, k) => !!CB.NANG[(b.kind === 'mini' ? 'mini.' + b.art : b.kind) + '.' + k];
  // Báo trước tối thiểu của đòn nặng (0 khi cờ tắt).
  CB.baoNang = () => (cbOn() ? CBS().baoNang : 0);
  // Theo dõi vùng đỏ của một con (gọi mỗi khung): vùng nặng mới hiện → tiếng báo (nếu chưa có tiếng báo ngay trước đó); vùng nổ → ghi lúc
  // nổ; vùng NẶNG nổ mà không trúng Cu Tí (đứng ngoài hoặc đang lộn bất tử) → con đó nghỉ nghiSauHut giây không ra đòn mới.
  const laDon = (z) => !!z.dmg && !z.pool && !z.knBao && !z.ctBao && !z.wall && !z.team && !z.ct && !z.kn; // vùng đánh thật (không phải vũng, vùng chỉ để báo, vật tự quản)
  CB.theo = function (e) {
    if (!cbOn() || !e || e.dead) return;
    const w = W(), P = w.P, S = CBS(), now = G.time || 0;
    let nangNo = 0, trung = false;
    for (const z of w.zones) {
      if (z.src !== e) continue;
      let c = z.cb;
      if (!c) {
        if (!laDon(z)) { z.cb = { bo: true }; continue; }
        c = z.cb = { nang: z.dmg >= S.nang * (e.dmg || 1) - 1e-6, t0: (z.t0 || 0) + (z.wait || 0) };
        if (c.nang && c.t0 >= 0.3 && now - (e.cbAm == null ? -9 : e.cbAm) > 0.25) { e.cbAm = now; G.sfx('warn', 1.25); } // âm báo đòn nặng (âm có sẵn)
      }
      if (c.bo || c.no) continue;
      if (z.t <= 0 && !(z.wait > 0)) {
        c.no = true; e.cbNo = now;
        if (c.nang) { nangNo++; if (!CB.thuHut && P && !P.dead && G.inZone(z, P) && !(P.inv > 0)) trung = true; }
      }
    }
    if (nangNo && !trung) e.cbNghiDen = Math.max(e.cbNghiDen || 0, now + S.nghiSauHut);
  };
  // Đang phải chờ (không ra đòn mới): nghỉ sau đòn nặng hụt, vừa nổ đòn trước chưa đủ nghiNham, hoặc còn vùng báo (≤ choTre) chưa nổ.
  CB.cho = function (e) {
    if (!cbOn() || !e) return false;
    const S = CBS(), now = G.time || 0;
    if (now < (e.cbNghiDen || 0)) return true;
    if (e.cbNo != null && now < e.cbNo + S.nghiNham) return true;
    // (vùng vừa tạo trong khung này chưa qua CB.theo — xét thẳng trên vùng)
    for (const z of W().zones) if (z.src === e && z.t > 0 && !(z.cb && (z.cb.bo || z.cb.no)) && laDon(z) && (z.t0 || 0) + (z.wait || 0) <= S.choTre) return true;
    return false;
  };
  // Lúc bắt đầu báo của một đòn nhắm lại chỗ Cu Tí trong cùng chiêu: không sớm hơn lúc đòn nhắm trước nổ (e.cbLap, giây tính từ lúc ra chiêu)
  // + nghiHut (đòn nặng) / nghiNham. Trả lúc nổ mới (tk cũ khi cờ tắt).
  // Gọi lúc ra chiêu (đồng bộ) nên vùng của chính nó đang báo (≤ choTre) cho biết lúc đòn chính nổ xong: lấy mốc muộn nhất.
  CB.dot = function (e, tk, bao, nang) {
    if (!cbOn()) return tk;
    const S = CBS();
    let moc0 = e.cbLap || 0;
    for (const z of W().zones) if (z.src === e && z.dmg && !z.pool && !z.wall && z.t > 0 && (z.t0 || 0) <= S.choTre) moc0 = Math.max(moc0, z.t + (z.wait || 0));
    const t0 = Math.max(tk - bao, moc0 + (nang ? S.nghiHut : S.nghiNham));
    e.cbLap = t0 + bao;
    return e.cbLap;
  };

  // ======================= NỔI GIẬN (15/10 noi-gian-manh, bảng G.NOI_GIAN ở js/data.js) =======================
  const NGB = () => (G.NOI_GIAN ? G.NOI_GIAN : null);
  // Bảng hệ số của trùm này (trùm vùng / trùm nhỏ), null khi cờ tắt.
  function bangNG(b) { const N = NGB(); return N ? (b.kind === 'mini' ? N.nho : N.vung) : null; }
  const ngPh = (a, ph) => a[Math.min(ph | 0, a.length - 1)];
  // Số đòn của chiêu key theo pha (G.NOI_GIAN.chieu[key][f]); cờ tắt hoặc chưa có trong bảng → cu (số cũ).
  function soNG(b, key, f, cu) { const N = NGB(), a = N && N.chieu && N.chieu[key] && N.chieu[key][f]; return a ? ngPh(a, b.phase) : cu; }
  // Báo trước tối thiểu (sàn công bằng) khi đang nổi giận: to = vùng to / nhiều đợt (0,6 giây), vùng thường 0,45 giây. Pha 1: 0 (như cũ).
  function sanNG(b, to) { const N = NGB(); if (!N || !(b.phase > 0)) return 0; return to ? N.san.baoTo : N.san.bao; }
  G.noiGianSo = soNG; G.noiGianSan = sanNG; G.noiGianBang = bangNG;
  // Giữ trùm bận tới X giây kể từ lúc ra chiêu (chiêu có đợt thêm dài hơn cử động).
  function giuBan(b, X) { b.seq.push({ t: 0, f: () => { if (!b.dead) b.busy = Math.max(b.busy, X - 1 / 60); } }); }
  // Thời gian mệt sau chiêu lớn theo pha (× met).
  function metNG(b, t) { const B = bangNG(b); return B ? t * ngPh(B.met, b.phase) : t; }
  G.noiGianMet = metNG;
  const satDotNG = () => { const N = NGB(); return (N && N.satDot) || 1; }; // × sát thương nhát của đợt thêm (ngoài số đợt cũ)

  function play(b, n, spd, o) { b.an = Object.assign({ n, t: 0, spd: spd || 1 }, o || {}); }
  function later(b, t, f) { b.seq.push({ t, f }); }
  // Chỉ dùng khi thử: ép trùm ra một chiêu cho trước ở lượt kế tiếp ('c1'..'c5' cho trùm vùng, 'atk', 'chieu1', 'chieu2' cho trùm nhỏ).
  G.bossDebug = function (name) { const b = W().boss; if (b) { b.dbg = name; b.cd = 0; } return b; };
  function choose(b, opts) {
    if (b.dbg) { const n = b.dbg; b.dbg = null; b.last = n; return n; }
    let pool = opts.filter((x) => x !== b.last);
    if (!pool.length) pool = opts;
    b.last = G.pick(pool);
    return b.last;
  }
  const near = (x, y, dx, dy) => G.mobNear(x, y, dx, dy);
  const ang = (b, P) => Math.atan2(P.y - b.y, P.x - b.x);
  // Tên chiêu đang ra (b.skillName, đặt trong thinkBig/thinkMini) cũng gắn vào vùng đỏ/đạn (trường skill) để bảng thua biết bị gì đánh.
  const skn = () => (W().boss && W().boss.skillName) || null;
  const Z = (shape, geo, t, dmg, el, o) => G.mobZone(shape, geo, t, dmg, el, Object.assign({ src: W().boss, skill: skn() }, o || {}));
  function circle(x, y, r, t, dmg, el, o) { return G.zoneCircle(x, y, r, t, dmg, el, Object.assign({ src: W().boss, skill: skn() }, o || {})); }
  function shot(b, a, sp, o) {
    const B = bangNG(b); if (B && b.phase > 0) sp *= Math.min(NGB().san.danMax, ngPh(B.dan, b.phase)); // nổi giận: đạn bay nhanh hơn (tối đa × danMax)
    W().projs.push(Object.assign({ team: 'enemy', kind: 'orb', x: b.x + Math.cos(a) * 14, y: b.y + Math.sin(a) * 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 3.2, dmg: b.dmg * 0.8, el: b.el, src: b, skill: b.skillName || null, z: 22 }, o || {}));
  }
  function aimFace(b, a) { b.dirA = a; if (Math.abs(Math.cos(a)) > 0.15) b.face = Math.cos(a) > 0 ? 1 : -1; }
  // Lao thân: dời vị trí thật trong T giây theo góc a, quãng L (giữ trong sàn)
  function lunge(b, a, L, T) { b.lunge = { vx: Math.cos(a) * L / T, vy: Math.sin(a) * L / T, t: T }; }
  // 14/10 (cờ tắt ?hutrum=0, js/fx_anh.js): ảnh hiệu ứng chiêu trùm (hu-*) đặt đúng chỗ một vùng sát thương thật, phát trong `giay` giây,
  // bắt đầu sớm `lead` giây để khung "chạm đất" trùng lúc vùng nổ (sau t giây). Chỉ là hình: vùng, sát thương, thời gian giữ nguyên.
  function anhVung(b, ma, x, y, t, lead, giay, sc) {
    // 14/10 trum-chet-pha3: mờ vào/ra ngắn (mr); quả độc rơi 5 khung trong 0,7 giây (~7 khung/giây) → 0,45 giây (~11 khung/giây), khung chạm đất
    // (khung 2) vẫn trùng lúc vùng nổ (lead 0,14 → 0,09 giây).
    if (ma === 'hu-qua-doc-roi') { lead = 0.09; giay = 0.45; }
    later(b, Math.max(0, t - lead), () => { if (!b.dead && G.huTrum && G.huTrum(ma) && G.fx && G.fx.anh) G.fx.anh(ma, x, y, { t: giay, gian: true, sc, mr: true }); });
  }
  // 14/10 (đợt trùm nhỏ, cờ tắt ?huthem=0 hoặc ?hutrum=0): như anhVung cho 7 hiệu ứng thêm (G.huThem). Hiện dùng: hàng nấm độc của Nấm Chúa.
  function anhVungThem(b, ma, x, y, t, lead, giay, sc) {
    later(b, Math.max(0, t - lead), () => { if (!b.dead && G.huThem && G.huThem(ma) && G.fx && G.fx.anh) G.fx.anh(ma, x, y, { t: giay, gian: true, sc }); });
  }

  // Hướng của đợt thêm: chiêu có `nham: true` trong G.NOI_GIAN.chieu (rễ đâm, hàng nấm, vồ lửa — kiểu "đuổi") nhắm lại chỗ em bé lúc đợt
  // đó hiện; chiêu khác theo G.NOI_GIAN.nhamLai (false: đánh lại đúng hướng cũ a — đứng ngoài vùng đợt đầu là an toàn, dồn dập nhưng không đuổi).
  function huongDot(b, P, a, key) { const N = NGB(), c = N && N.chieu && N.chieu[key]; const nl = c && c.nham != null ? c.nham : N && N.nhamLai; return nl ? ang(b, P) : a; }
  // Nổi giận — đợt thêm của một chiêu: hiện vùng báo trước đúng `bao` giây trước lúc nổ tk (tính từ lúc ra chiêu), cử động chiêu `key` chạy
  // lại cho khớp (mốc ra đòn trùng lúc nổ), f(w) tạo vùng lúc đó (hướng: huongDot; w: số giây báo trước thật). Đổi pha thì huỷ (b.seq xoá).
  function lapDot(b, key, tk, bao, f, ngKey) {
    // Luật công bằng: đợt thêm NHẮM LẠI chỗ Cu Tí (nham: true) chỉ bắt đầu báo sau khi đợt / đòn trước nổ + nghỉ (nặng 0,65 / nhẹ 0,35 giây);
    // đợt nặng báo trước ≥ 0,7 giây; trùm bận tới lúc đợt nổ; thân chớp báo (b.wind) như đòn chính.
    if (cbOn()) {
      const N0 = NGB(), c = ngKey && N0 && N0.chieu && N0.chieu[ngKey], nham = c && c.nham != null ? c.nham : N0 && N0.nhamLai, nang = !!(ngKey && CB.NANG_DOT[ngKey]);
      if (nang) bao = Math.max(bao, CBS().baoNang);
      if (nham || nang) { tk = CB.dot(b, tk, bao, nang); b.cbLap += CB.DAI[ngKey] || 0; } // đợt nặng (kể cả đánh lại cùng hướng): nghỉ sau đợt trước như sau đòn nặng hụt
      giuBan(b, tk + 0.3);
      b.cbHet = Math.max(b.cbHet || 0, tk + 0.3);
    }
    const t0 = Math.max(0, tk - bao), w = tk - t0;
    later(b, t0, () => {
      if (b.dead) return;
      if (cbOn()) b.wind = w;
      // trùm nhỏ: mốc ra đòn = nửa cử động
      if (key && b.art) { const m0 = b.kind === 'mini' ? 0.5 : moc(b.art, key)[0], du = dur(b.art, key); play(b, key, clamp((m0 * du) / Math.max(0.05, w), 0.5, 3)); }
      const d0 = b.dmg, N = NGB(); // đòn của đợt thêm: × satDot (G.NOI_GIAN.satDot) — dồn dập nhưng mỗi nhát nhẹ hơn nhát chính
      if (N && N.satDot) b.dmg = d0 * N.satDot;
      try { f(w); } finally { b.dmg = d0; }
      if (b.phase >= 2) later(b, w, () => { W().shake = Math.max(W().shake, 0.12); }); // hóa cuồng: dậm rung nhẹ
    });
  }

  G.noiGianLapDot = lapDot; G.noiGianHuong = huongDot; // cho js/chieu_trum.js (chiêu mới cũng có đợt thêm)

  // ======================= CHIÊU CỦA TRÙM VÙNG =======================
  // Mỗi chiêu: anim cX đã gồm báo trước → ra đòn → dư âm; T là lúc vùng đỏ nổ (mốc moc[0]), D là độ dài cả chiêu.
  const SK = {
    ngu: {
      c1: { name: 'Bổ rìu san hô', f: null }, // thân chiêu: js/chieu_trum.js (15/10 don-tep B: bỏ thân chiêu cũ cùng cờ ?chieucu=1)
      c2: { name: 'Sóng thần', to: true, f(b, P, T, D, a, sp) { // tường nước chạy theo hướng em bé, chừa một khe
        const mk = (wait, off, ks) => {
          const lat = G.rr(-70, 70) + off;
          W().zones.push({ wall: true, x: b.x, y: b.y, ang: a, s: 10, v: 155, th: 14, half: 260, g: clamp(lat, -110, 110), gw: 26, wait, maxS: 340, dmg: b.dmg * 1.2 * (ks || 1), el: 'ice', src: b, skill: b.skillName });
        };
        mk(T, 0);
        const nT = soNG(b, 'nguSong', 'tuong', b.phase >= 1 ? 2 : 1);
        // nổi giận: thêm tường, mỗi bức chạy sau bức trước 0,5 giây, khe lệch xen kẽ (vẫn báo trước T giây như bức đầu)
        // luật công bằng: tường chạy cùng tốc nên tường sau đi qua chỗ Cu Tí sau tường trước đúng cachT giây → cachT ≥ nghỉ sau đòn nặng (0,65)
        const cachT = cbOn() ? Math.max(0.5, CBS().nghiHut) : 0.5;
        if (NGB()) { for (let k = 1; k < nT; k++) { const off = (k % 2 ? 1 : -1) * (G.rnd() < 0.5 ? 60 : -60); later(b, k * cachT, () => { if (!b.dead) mk(T, off, k >= 2 ? satDotNG() : 1); }); } if (cbOn() && nT > 1) giuBan(b, (nT - 1) * cachT + T + 0.3); }
        else if (b.phase >= 1) later(b, 0.7, () => mk(T - 0.2, G.rnd() < 0.5 ? 60 : -60));
        later(b, D, () => tire(b, 1.0)); // GĐ2 (V14): mệt sau chiêu lớn ngay từ pha 1
      } },
      c3: { name: 'Phun băng', near: true, to: true, f(b, P, T, D, a) { // quạt băng, sàn mọc gai băng làm chậm
        const nG = soNG(b, 'nguPhun', 'gai', 3), st = nG > 3 ? 120 / nG : 34; // nổi giận: nhiều ô gai hơn, vẫn trong tầm quạt
        const gai = (g) => { for (let i = 1; i <= nG; i++) G.zoneCircle(clamp(b.x + Math.cos(g) * i * st, W().x0, W().x1), clamp(b.y + Math.sin(g) * i * st, W().y0, W().y1), 15, 0, b.dmg * 0.4, 'ice', { pool: true, life: 2, tick: 0.3 }); };
        Z('cone', { x: b.x, y: b.y, ang: a, r: 125, span: 1.0 }, T, b.dmg * 1.3, 'ice');
        later(b, T, () => gai(a));
        // nổi giận: phun thêm (cùng hướng, G.NOI_GIAN.chieu.nguPhun)
        const n = soNG(b, 'nguPhun', 'dot', 1), gap = 0.6;
        for (let k = 1; k < n; k++) lapDot(b, 'c3', T + k * gap, sanNG(b, true) || 0.6, (w) => { const g = huongDot(b, P, a, 'nguPhun'); aimFace(b, g); Z('cone', { x: b.x, y: b.y, ang: g, r: 125, span: 1.0 }, w, b.dmg * 1.3, 'ice'); later(b, w, () => gai(g)); }, 'nguPhun');
        if (n > 1) giuBan(b, T + (n - 1) * gap + 0.25);
      } },
      c4: { name: 'Cột nước đuổi', f: null }, // thân chiêu: js/chieu_trum.js (15/10 don-tep B: bỏ thân chiêu cũ cùng cờ ?chieucu=1)
      c5: { name: 'Xoáy hút', near: true, f: null }, // thân chiêu: js/chieu_trum.js (15/10 don-tep B: bỏ thân chiêu cũ cùng cờ ?chieucu=1)
    },
    moc: {
      c1: { name: 'Quật cành', near: true, to: true, f(b, P, T, D, a) {
        Z('cone', { x: b.x, y: b.y - 6, ang: a, r: 118, span: 2.0 }, T, b.dmg * 1.4, null, { melee: true });
        // nổi giận: quật thêm, mỗi lần cách 0,6 giây, báo trước như vùng to
        const n = soNG(b, 'mocQuat', 'dot', 1), gap = 0.6;
        // lần quật thứ 2 quật NGƯỢC ra sau lưng (đứng sau lưng trùm để chém không còn an toàn), lần 3 quật lại phía trước
        for (let k = 1; k < n; k++) lapDot(b, 'c1', T + k * gap, sanNG(b, true) || 0.6, (w) => { const g = k % 2 ? a + PI : huongDot(b, P, a, 'mocQuat'); aimFace(b, g); Z('cone', { x: b.x, y: b.y - 6, ang: g, r: 118, span: 2.0 }, w, b.dmg * 1.4, null, { melee: true }); }, 'mocQuat');
        if (n > 1) giuBan(b, T + (n - 1) * gap + 0.25);
      } },
      c2: { name: 'Rễ đâm', to: true, f(b, P, T, D, a) { // hàng gai rễ trồi lên nối nhau theo hướng em bé
        const rows = soNG(b, 'mocRe', 'hang', b.phase >= 1 ? 2 : 1) >= 2 ? [-0.32, 0.32] : [0];
        const hang = (g, rs, t) => { for (const off of rs) for (let i = 0; i < 7; i++) {
          const x = b.x + Math.cos(g + off) * (26 + i * 22), y = b.y + Math.sin(g + off) * (26 + i * 22);
          if (x < W().x0 - 4 || x > W().x1 + 4 || y < W().y0 - 4 || y > W().y1 + 4) continue;
          circle(x, y, 14, t + i * 0.09, b.dmg * 1.1, null, { fxKind: 'root' });
          anhVung(b, 'hu-gai-re', x, y, t + i * 0.09, 0.2, 0.6, 0.8);
        } };
        hang(a, rows, T);
        // nổi giận: thêm đợt rễ (một hàng, nhắm lại chỗ em bé), mỗi đợt sau đợt trước 0,75 giây
        const n = soNG(b, 'mocRe', 'dot', 1), gap = 0.75;
        for (let k = 1; k < n; k++) lapDot(b, 'c2', T + k * gap, sanNG(b, true) || 0.6, (w) => { const g = huongDot(b, P, a, 'mocRe'); aimFace(b, g); hang(g, [0], w); }, 'mocRe');
        if (n > 1) giuBan(b, T + (n - 1) * gap + 0.4);
      } },
      c3: { name: 'Mưa quả độc', to: true, f(b, P, T, D) { // quả độc vỡ thành vũng độc
        const n = soNG(b, 'mocQua', 'so', b.phase >= 2 ? 6 : 5), ro = n > 6 ? 1.2 : 1; // nhiều quả thì rải rộng hơn một chút
        for (let i = 0; i < n; i++) { const q = i ? near(P.x, P.y, 70 * ro, 40 * ro) : [P.x, P.y]; circle(q[0], q[1], 18, T + i * 0.1, b.dmg * 0.8, 'poison', { then: 3.5, fxKind: 'fruit' }); anhVung(b, 'hu-qua-doc-roi', q[0], q[1], T + i * 0.1, 0.14, 0.7, 1); }
        later(b, D, () => tire(b, 1.0)); // GĐ2 (V14): mệt sau chiêu lớn ngay từ pha 1
      } },
      c4: { name: 'Bùa bay', f(b, P, T, D, a) { // năm lá bùa bay uốn lượn đuổi theo em bé rồi cháy nổ
        const n = soNG(b, 'mocBua', 'so', 5), gap = Math.min(0.45, 1.8 / Math.max(1, n - 1)); // nổi giận: thêm lá bùa, vẫn trong một quạt ~1,8 rad
        later(b, T, () => { for (let i = 0; i < n; i++) shot(b, a + (i - (n - 1) / 2) * gap, 62, { kind: 'bua', homing: 44, t: 3.6, dmg: b.dmg * 0.85, el: 'poison' }); });
      } },
      c5: { name: 'Rừng gai', near: true, to: true, f(b, P, T, D, a, sp) { // ba vòng gai lan ra, mỗi vòng chừa bốn khe để né
        const R0 = [[24, 58], [58, 92], [92, 126]], nV = soNG(b, 'mocGai', 'vong', 3), R = [], khe = [];
        for (let i = 0; i < nV; i++) R.push(R0[i % 3]); // nổi giận: vòng 4, 5 lan lại từ trong ra (khe đổi chỗ)
        R.forEach((r, i) => { const o = G.rnd() * TAU, gaps = [0, 1, 2, 3].map((k) => o + k * PI / 2); khe.push(gaps); Z('donut', { x: b.x, y: b.y, r0: r[0], r1: r[1], gaps, gw: 0.3 }, T + i * 0.38, b.dmg * 1.2 * (i >= 3 ? satDotNG() : 1), 'poison'); });
        // 14/10: hình gai rễ (ảnh hu-gai-re, js/monster_art.js mocTinh c5) vẽ theo đúng ba vòng này: bán kính, khe, lúc nổ (tính theo giờ của cử động)
        if (b.an) b.an.vongGai = { R, khe, gw: 0.3, t: R.map((r, i) => (T + i * 0.38) * (sp || 1)) };
        const X = Math.max(D, T + (nV - 1) * 0.38 + 0.2);
        if (X > D) giuBan(b, X);
        later(b, X, () => tire(b, 1.5));
      } },
    },
    ho: {
      c1: { name: 'Hồ hoả', f(b, P, T, D, a) { // cầu lửa ma từ đầu đuôi bay vòng cung đuổi theo
        const n = soNG(b, 'hoHoa', 'so', [5, 6, 8][b.phase]);
        for (let i = 0; i < n; i++) later(b, T + i * 0.05, () => shot(b, a + PI + (i / (n - 1) - 0.5) * 2.6, 72, { kind: 'fire', homing: 40, t: 3, dmg: b.dmg * 0.7, el: 'fire' }));
      } },
      // tele: báo trước tối thiểu (giây). GĐ2 (V8, Q4): Vồ mồi trước chỉ báo 0,44 s (pha 3 còn 0,37 s), không đi bộ ra kịp.
      // Phiên cân bằng (mục 11): báo trước lần vồ đầu 0,63 → 0,65 giây, lần vồ thứ hai 0,5 → 0,62 giây (cả hai ≥ 0,6).
      c2: { name: 'Vồ nhảy', tele: 0.65, f: null }, // thân chiêu: js/chieu_trum.js (15/10 don-tep B: bỏ thân chiêu cũ cùng cờ ?chieucu=1)
      c3: { name: 'Quạt đuôi', near: true, to: true, f(b, P, T, D, a) { // ba lớp vệt lửa hình trăng khuyết, sàn cháy xanh
        const quat = (g, t) => {
          [[0, 62], [56, 98], [92, 134]].forEach((r, i) => Z('donut', { x: b.x, y: b.y, r0: r[0], r1: r[1], gaps: [g + PI], gw: PI - 0.85 }, t + i * 0.12, b.dmg * 1.2, 'fire'));
          later(b, t + 0.3, () => { for (let i = 1; i <= 3; i++) G.zoneCircle(clamp(b.x + Math.cos(g) * i * 36, W().x0, W().x1), clamp(b.y + Math.sin(g) * i * 36, W().y0, W().y1), 16, 0, b.dmg * 0.5, 'fire', { pool: true, life: 2.5, tick: 0.3 }); });
        };
        quat(a, T);
        // nổi giận: quạt thêm (cùng hướng), mỗi lần sau lần trước 0,7 giây
        const n = soNG(b, 'hoQuat', 'dot', 1), gap = 0.7;
        for (let k = 1; k < n; k++) lapDot(b, 'c3', T + k * gap, sanNG(b, true) || 0.6, (w) => { const g = huongDot(b, P, a, 'hoQuat'); aimFace(b, g); quat(g, w); }, 'hoQuat');
        const X = Math.max(D, T + (n - 1) * gap + 0.45);
        if (X > D) giuBan(b, X);
        later(b, X, () => tire(b, 1.0)); // GĐ2 (V14): Hồ Tinh pha 1 chỉ có c1-c3 (c4 mở từ pha 2) nên mệt cả sau Quạt đuôi
      } },
      c4: { name: 'Hồ ly phân thân', to: true, f: null }, // thân chiêu: js/chieu_trum.js (15/10 don-tep B: bỏ thân chiêu cũ cùng cờ ?chieucu=1)
      c5: { name: 'Bão hồ hoả', f(b, P, T, D, a) { // ba đợt cầu lửa toả tròn, mỗi đợt lệch nhau để luồn qua khe
        // 14/10 trum-chet-pha3: đạn xuất phát trên một vòng TRÒN bán kính 14 quanh tâm trùm (cũ: elip 14 × 10 nên đường bay không đi qua tâm,
        // vòng đạn méo); hướng, tốc độ, sát thương giữ nguyên.
        const o0 = (q) => ({ x: b.x + Math.cos(q) * 14, y: b.y + Math.sin(q) * 14 });
        const nD = soNG(b, 'hoBao', 'dot', 3), X = Math.max(D, T + (nD - 1) * 0.32 + 0.2); // nổi giận: thêm đợt cầu lửa (lệch nửa khe xen kẽ)
        for (let j = 0; j < nD; j++) later(b, T + j * 0.32, () => { for (let i = 0; i < 10; i++) { const q = a + ((i + j * 0.5) / 10) * TAU; shot(b, q, 82, Object.assign({ kind: 'fire', t: 2.6, dmg: b.dmg * 0.75 * (j >= 3 ? satDotNG() : 1), el: 'fire' }, o0(q))); } });
        if (X > D) giuBan(b, X);
        later(b, X, () => tire(b, 1.4));
      } },
    },
  };
  // Vùng 4 (bước 3 phiên 1, HÌNH TẠM): Thuồng Luồng mượn bộ chiêu Ngư Tinh. Phiên 3B: js/thuong_luong.js (nạp sau js/chieu_trum.js) thay
  // G.bossSK.thuong bằng bộ chiêu riêng pha 1 (Quật đuôi, Phun nước đen, Vòng thân) + chọn chiêu theo pha (S.chon); phiên 3C thêm pha 2, 3.
  // Dòng dưới chỉ còn là đường lui khi tắt ?tlrieng=0 (G.TL_RIENG = false): Thuồng Luồng dùng chiêu Ngư Tinh như phiên 1.
  if (G.VUNG4 && !SK.thuong) SK.thuong = SK.ngu;
  G.bossSK = SK; // chỉ để bài kiểm tra đọc thời gian báo trước tối thiểu (tele)
  // Mệt sau chiêu lớn: choáng một lúc, nhận thêm sát thương (cơ hội phản công)
  // Trùm nhỏ không có hình 'stun' riêng: đặt thêm choáng thật (st.stun) để hình lảo đảo (js/mobs.js vẽ 'hit' khi choáng).
  function tire(b, t) {
    if (b.dead) return;
    t = metNG(b, t); // nổi giận: mệt ngắn hơn (vẫn có cửa phản công)
    b.tired = t; b.exposed = Math.max(b.exposed, t); b.busy = Math.max(b.busy, t);
    if (b.kind === 'mini' && b.st) b.st.stun = Math.max(b.st.stun || 0, t);
  }

  // 14/10 (bước 1, mục 3): skill bộ Ninja "Phân thân" — lúc chọn chiêu có thể nhắm vào bóng (js/bo_skill.js G.boSk.dichTrum, 30%);
  // "Thuỷ triều" — chậm tốc đi và nhịp ra chiêu (G.boSk.cham, trùm 50% hiệu lực). Cờ tắt: ?skillbotrum=0 (G.SKILL_BO_TRUM = false).
  if (G.SKILL_BO_TRUM === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]skillbotrum=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.SKILL_BO_TRUM = !tat; }
  const dichOf = (b, P) => (G.SKILL_BO_TRUM && G.boSk && G.boSk.dichTrum ? G.boSk.dichTrum(b) || P : P);
  const chamOf = (b) => (G.SKILL_BO_TRUM && G.boSk && G.boSk.cham ? G.boSk.cham(b) : 1);
  function thinkBig(b) {
    const w = W(), P = dichOf(b, w.P), ph = b.phase, S = SK[b.kind];
    // S.chon (nếu có, vd Thuồng Luồng js/thuong_luong.js): bộ chiêu được dùng theo pha; không có thì c1-c3, pha 2 thêm c4, pha 3 thêm c5 như cũ.
    const opts = S.chon ? S.chon(b, ph) : ['c1', 'c2', 'c3'];
    if (!S.chon && ph >= 1) opts.push('c4');
    if (!S.chon && ph >= 2) opts.push('c5');
    // Chống áp sát: em bé đứng sát thì trùm hay dùng chiêu đánh quanh mình hơn
    if (has(b, 'antiMelee') && Math.hypot(P.x - b.x, P.y - b.y) < 75) for (const k of opts.slice()) if (S[k].near) opts.push(k, k);
    const k0 = choose(b, opts), sk = S[k0] || S.c1, k = sk.anim || k0; // sk.anim: chiêu mượn cử động khác (vd Đớp của Thuồng Luồng dùng 'atk')
    const B = bangNG(b), spd = B ? ngPh(B.toc, ph) : [1, 1.1, 1.2][ph], a = ang(b, P);
    let D = dur(b.art, k) / spd, T = moc(b.art, k)[0] * D, aspd = spd;
    b.skillName = sk.name; // tên chiêu đang ra: bảng thua (js/stage.js) đọc
    // Báo trước tối thiểu sk.tele: kéo dài phần lấy đà (hình chạy chậm lại tới lúc ra đòn, rồi về tốc độ thường) — mọi pha như nhau.
    // Nổi giận: thêm sàn công bằng (G.NOI_GIAN.san: ≥ 0,45 giây, vùng to / nhiều đợt ≥ 0,6 giây).
    // Luật công bằng: đòn nặng báo trước ≥ 0,7 giây (kéo dài phần lấy đà — tư thế lấy đà giữ lâu hơn), đòn nhẹ giữ như cũ.
    const tele = Math.max(sk.tele || 0, sanNG(b, !!sk.to), CB.nang(b, k0) ? CB.baoNang() : 0);
    if (tele && T < tele) {
      const T0 = T;
      T = tele; D += T - T0; aspd = spd * T0 / T;
      later(b, T, () => { if (b.an && b.an.n === k) b.an.spd = spd; });
    }
    aimFace(b, a);
    play(b, k, aspd);
    b.cbLap = T; b.cbHet = 0; b.cbAm = G.time || 0; b.cbSoChieu = (b.cbSoChieu || 0) + 1; // luật công bằng: mốc đòn chính, đếm chiêu (đo)
    sk.f(b, P, T, D, a, spd);
    b.busy = D; b.wind = T;
    G.sfx('warn', 1.1);
    // Bắt bài lăn né: thêm một vùng đỏ đúng chỗ em bé sẽ lăn tới
    if (has(b, 'antiDodge')) later(b, T + 0.3, () => { const P2 = W().P; circle(clamp(P2.x + (P2.ddx || 0) * 46, w.x0, w.x1), clamp(P2.y + (P2.ddy || 0) * 34, w.y0, w.y1), 18, 0.6, b.dmg, null); });
    if (B && ph >= 2) later(b, T, () => { W().shake = Math.max(W().shake, 0.12); }); // hóa cuồng: dậm rung nhẹ
    const NG0 = S.nghi || [1.3, 1.0, 0.8]; // S.nghi: nghỉ sau chiêu theo pha của riêng trùm này (Thuồng Luồng, js/thuong_luong.js)
    b.cd = nghiNG(b, NG0[ph], NG0[0]);
  }
  // Nổi giận: nghỉ sau chiêu (× nghi) và NỐI CHIÊU — đầu mỗi chuỗi gieo số chiêu liền nhau (noi: [xác suất ≥ 2, xác suất 3]); chiêu chưa phải
  // chiêu cuối của chuỗi thì nghỉ noiNghi (0,3 giây) rồi ra chiêu kế. Chuỗi đang dở mà đổi pha thì bỏ (b.ngConLai = 0 ở chỗ đổi pha).
  // cu: nghỉ cũ của pha đang ở (cờ tắt); cu1: nghỉ pha 1 — nổi giận lấy nghỉ pha 1 × nghi[pha] (như các hệ số khác của bảng: so với pha 1).
  function nghiNG(b, cu, cu1) {
    const B = bangNG(b);
    if (!B) return cu;
    const ph = b.phase | 0;
    if (b.ngConLai > 0) b.ngConLai--;
    else { const nn = ngPh(B.noi, ph), r = G.rnd(); b.ngConLai = r < nn[1] ? 2 : r < nn[0] ? 1 : 0; b.ngNoi = 0; }
    if (b.ngConLai > 0) { b.ngNoi = (b.ngNoi || 0) + 1; return B.noiNghi; }
    // Luật công bằng — đổi nhịp: dồn chiêu xong thì nghỉ dài hơn (× (1 + sauNoi × số chiêu đã nối)), nhịp chung không nhanh quá ~15%.
    if (cbOn() && b.ngNoi > 0) { const k = 1 + CBS().ng.sauNoi * b.ngNoi; b.ngNoi = 0; return cu1 * ngPh(B.nghi, ph) * k; }
    return cu1 * ngPh(B.nghi, ph);
  }

  // ======================= TRÙM NHỎ =======================
  // Tên chiêu trùm nhỏ (b.skillName) theo hình: atk đòn thường, chieu1, chieu2.
  const MINI_SK = {
    cuaDa: { atk: 'Kẹp càng', chieu1: 'Đập càng rung sàn', chieu2: 'Tường tinh thể' }, // chiêu 2 (Cua Đá, Nấm Chúa): js/chieu_trum.js
    namChua: { atk: 'Phun bào tử', chieu1: 'Hàng nấm độc', chieu2: 'Nấm mẹ đẻ con' },
    hoLua: { atk: 'Cào', chieu1: 'Vồ lửa', chieu2: 'Gầm phun lửa' },
    caTre: { atk: 'Phun bùn', chieu1: 'Quất râu', chieu2: 'Lặn bùn' }, // vùng 4 (phiên 3A): thân chiêu ở js/chieu_trum.js CT.caTre
  };
  // Phiên cân bằng (mục 11): mỗi trùm nhỏ một nhịp riêng (trước ba con dùng chung một kịch bản, 12 chiêu đầu gần như giống hệt).
  //  - Nấm Chúa: đứng xa rải bào tử, ưa Bão bào tử, nghỉ lâu giữa hai chiêu.
  //  - Cua Đá: chậm, chắc; đứng gần thì hay đập sàn rồi kẹp liền (đòn đôi), ở xa thì mưa tinh thể.
  //  - Hổ Lửa: nhanh, dồn dập; ưa Vồ lửa và có thể vồ hai lần liền, nghỉ ngắn.
  // w: trọng số [chiêu 1, chiêu 2, đòn thường khi đứng gần]; cd: nghỉ sau chiêu theo pha; lap: được lặp chiêu vừa ra.
  const MINI_NHIP = {
    namChua: { w: [1, 2, 1], wXa: [1, 3, 0], cd: [1.7, 1.35, 1.1], lap: false },
    cuaDa: { w: [3, 1, 2], wXa: [1, 2, 0], cd: [1.5, 1.2, 1.0], lap: false, combo: { chieu1: 'atk' } }, // (cua-tuong-kho: giữ nhịp, đổi tầm / hướng chiêu — G.CUA_SO)
    hoLua: { w: [3, 1, 2], wXa: [3, 2, 0], cd: [1.05, 0.85, 0.7], lap: true },
    // Cá Trê Râu Roi (vùng 4, phiên 3A): gần thì hay quất râu, xa thì phun bùn / lặn bùn đuổi tới; nghỉ vừa (KE-HOACH bước 3 mục 2.3).
    caTre: { w: [3, 1, 1], wXa: [0, 2, 2], cd: [1.4, 1.1, 0.9], lap: false },
  };
  G.MINI_NHIP = MINI_NHIP;

  // ======================= CUA ĐÁ: KHÔNG CÒN CHỖ ĐỨNG AN TOÀN (15/10 cua-tuong-kho, cờ tắt ?cuade=1 → G.CUA_MOI = false, y hệt cũ) =======================
  // Mô phỏng Node (docs/review/ke-hoach-cai-thien/cua-tuong-kho/bao-cao.md): đứng sát mép trên / dưới gần như không mất máu vì (1) Cua Đá
  // chậm (30 điểm/giây, đi dọc chỉ 24) và dừng cách em bé 56 — Kẹp càng tầm 58 chỉ chạm rìa; (2) Đập càng chỉ là vòng quanh thân; (3) Tường
  // tinh thể cố định giữa phòng, hàng mảnh chỉ từ y ≈ 97 tới 217 (dải sát mép trên / dưới không mảnh nào tới) và khe giữa hai hàng đứng yên được.
  // Sửa: cua đi ngang nhanh + lướt ngang khi em bé ở xa, đứng sát hơn; Kẹp càng vươn theo em bé (lao tới); Đập càng thêm vết nứt chạy qua chỗ
  // em bé tới tận mép sàn và đá rơi dọc chân tường khi em bé đứng sát mép; Tường tinh thể (js/chieu_trum.js tuongNhot) nhốt hai bên em bé.
  const CUA = (b) => G.CUA_MOI !== false && !!b && b.art === 'cuaDa';
  const CUA_SO = {
    di: { ngang: 1.8, doc: 1.1, gan: 40 }, // tốc đi × (ngang, dọc) — cũ × (1, 0,8); dừng khi cách em bé gan + 12 = 52 (cũ 56)
    luot: { xa: 96, dai: 84, giay: 0.3, cd: 2.4 }, // lướt ngang: em bé xa hơn xa thì lao tới dai điểm trong giay giây, nghỉ cd giây
    kep: { r: 58, rMax: 96, them: 18, span: [2.0, 1.5], satXa: 1.0 }, // Kẹp càng: tầm = cách em bé + them (r..rMax); vươn xa thì quạt hẹp hơn, lao theo, sát thương × satXa (gần: 1,2 như cũ)
    nut: { rong: 26, tu: 76, tre: 0.55, sat: 0.65 }, // Đập càng: vết nứt từ rìa vòng đập (tu) chạy qua hướng em bé tới tận mép sàn, nổ sau vòng đập tre giây
    da: { mep: 40, xa: 60, r: 18, cach: 30, so: 5, lui: 4, tre: 0.35, sat: 0.7 }, // em bé đứng xa trùm (> xa) VÀ cách mép < mep: so tảng đá rơi dọc chân tường đó (bước vào trong là né)
  };
  G.CUA_SO = CUA_SO; G.cuaMoi = CUA;
  // Quãng từ (x, y) theo góc a tới mép sàn (vết nứt chạy hết sàn, không bị cắt ngắn).
  function toiMep(x, y, a) {
    const w = W(), c = Math.cos(a), s = Math.sin(a);
    let t = 1e9;
    if (c > 1e-6) t = Math.min(t, (w.x1 - x) / c); else if (c < -1e-6) t = Math.min(t, (w.x0 - x) / c);
    if (s > 1e-6) t = Math.min(t, (w.y1 - y) / s); else if (s < -1e-6) t = Math.min(t, (w.y0 - y) / s);
    return Math.max(0, t === 1e9 ? 0 : t);
  }
  function cuaNut(b, g, t) {
    const S = CUA_SO.nut, L = toiMep(b.x, b.y, g);
    if (!(S.rong > 0) || L <= S.tu) return; // em bé trong vòng đập, sát mép: vòng đập đã phủ tới mép
    Z('line', { x: b.x + Math.cos(g) * S.tu, y: b.y + Math.sin(g) * S.tu, ang: g, len: L - S.tu + 6, w: S.rong }, t, b.dmg * S.sat, null);
  }
  // Đá rơi dọc chân tường: em bé đứng cách mép nào < da.mep thì một hàng đá rơi dọc mép đó, giữa hàng ngay chỗ em bé (góc: cả hai mép).
  function cuaDaRoi(b, P, t) {
    const S = CUA_SO.da, w = W();
    if (Math.hypot(P.x - b.x, P.y - b.y) <= S.xa) return;
    const mep = [['tren', P.y - w.y0], ['duoi', w.y1 - P.y], ['trai', P.x - w.x0], ['phai', w.x1 - P.x]].filter((m) => m[1] < S.mep);
    for (const [m] of mep) for (let i = 0; i < S.so; i++) {
      const k = (i - (S.so - 1) / 2) * S.cach, ngang = m === 'tren' || m === 'duoi';
      const x = ngang ? P.x + k : m === 'trai' ? w.x0 + S.lui : w.x1 - S.lui;
      const y = ngang ? (m === 'tren' ? w.y0 + S.lui : w.y1 - S.lui) : P.y + k * (G.ZK || 0.85);
      if (x < w.x0 - 8 || x > w.x1 + 8 || y < w.y0 - 8 || y > w.y1 + 8) continue;
      circle(x, y, S.r, t, b.dmg * S.sat, null, { fxKind: 'spout' });
    }
  }
  G.MINI_SK = MINI_SK; // 14/10 ky-nang-trum-rieng: chiêu 2 của Nấm Chúa, Cua Đá chạy ở js/chieu_trum.js
  function thinkMini(b) {
    const w = W(), P = dichOf(b, w.P), ph = b.phase, id = b.art;
    const d = Math.hypot(P.x - b.x, P.y - b.y), a = ang(b, P);
    const N = MINI_NHIP[id], gan = d < 70;
    const opts = [];
    if (N) {
      const wt = gan ? N.w : N.wXa;
      for (let j = 0; j < wt[0]; j++) opts.push('chieu1');
      for (let j = 0; j < wt[1]; j++) opts.push('chieu2');
      for (let j = 0; j < wt[2]; j++) opts.push('atk');
      // đòn đôi (Cua Đá): vừa đập sàn mà em bé còn đứng gần thì kẹp ngay
      if (N.combo && N.combo[b.last] && gan && !b.dbg) b.dbg = N.combo[b.last];
    } else {
      opts.push('chieu1', 'chieu2');
      if (gan) opts.push('atk', 'atk');
    }
    // cua-tuong-kho: Tường tinh thể còn đứng thì không dựng tường mới (trùm vẫn kẹp / đập trong lúc tường đứng)
    if (CUA(b) && b.cuaTuongHet > b.t) for (let j = opts.length - 1; j >= 0; j--) if (opts[j] === 'chieu2' && opts.length > 1) opts.splice(j, 1);
    // GĐ2 (V38): Chống áp sát — em bé đứng gần thì trùm nhỏ hay ra chiêu 1 hơn (Cua Đá đập sàn quanh mình, Nấm Chúa hàng nấm, Hổ Lửa vồ)
    if (has(b, 'antiMelee') && d < 75) opts.push('chieu1', 'chieu1');
    const B = bangNG(b), k = N && N.lap && !b.dbg ? (b.last = G.pick(opts)) : choose(b, opts), spd = B ? ngPh(B.toc, ph) : [1, 1.08, 1.16][ph];
    b.skillName = (MINI_SK[id] && MINI_SK[id][k]) || (k === 'atk' ? 'Đòn thường' : k === 'chieu1' ? 'Chiêu 1' : 'Chiêu 2');
    aimFace(b, a);
    G.sfx('warn');
    b.cbAm = G.time || 0; b.cbSoChieu = (b.cbSoChieu || 0) + 1;
    // Vùng 4 (phiên 3A): Cá Trê Râu Roi — cả ba chiêu ở js/chieu_trum.js (CT.caTre đặt b.busy / b.wind, mệt sau chiêu); cờ ?trumsong=0 thì không có con này.
    if (id === 'caTre' && G.chieuTrum && G.chieuTrum.caTre && G.chieuTrum.caTre(b, k, P, d, a, spd)) { /* chiêu riêng */ }
    else if (k === 'atk') {
      const T = Math.max(0.75 / spd, CB.nang(b, 'atk') ? CB.baoNang() : 0); // luật công bằng: đòn nặng (Kẹp càng, Cào) báo ≥ 0,7 giây
      b.cbLap = T;
      play(b, 'tele', 0.7 / 0.75 * spd);
      later(b, T, () => play(b, 'atk', spd));
      const don = (g, t) => {
        if (id === 'namChua') Z('cone', { x: b.x, y: b.y, ang: g, r: 64, span: 1.2 }, t, b.dmg * 1.1, 'poison');
        else if (CUA(b)) { // Cua Đá (cua-tuong-kho): càng vươn tới chỗ em bé, vươn xa thì lao theo lúc kẹp
          const K = CUA_SO.kep, rr = clamp(Math.hypot(P.x - b.x, P.y - b.y) + K.them, K.r, K.rMax), xa = rr > K.r + 10;
          Z('cone', { x: b.x, y: b.y, ang: g, r: rr, span: xa ? K.span[1] : K.span[0] }, t, b.dmg * (xa ? K.satXa : 1.2), null, { melee: true });
          if (xa) later(b, t, () => { if (!b.dead) lunge(b, g, rr - K.r, 0.18); });
        } else Z('cone', { x: b.x, y: b.y, ang: g, r: 58, span: 2.0 }, t, b.dmg * 1.2, null, { melee: true });
      };
      don(a, T);
      b.busy = T + dur(id, 'atk') / spd; b.wind = T;
      // nổi giận: đánh thêm nhát nữa (bảng nhoDon; mặc định tắt), lấy đà lại, báo trước ≥ 0,45 giây
      const n = soNG(b, 'nhoDon', 'dot', 1), bao = sanNG(b, false) || 0.45, gap = bao + (0.6 * dur(id, 'atk')) / spd; // nhát sau lấy đà khi nhát trước gần xong
      for (let j = 1; j < n; j++) later(b, T + j * gap - bao, () => {
        if (b.dead) return;
        const g = huongDot(b, P, a, 'nhoDon'), d0 = b.dmg, Nn = NGB(); aimFace(b, g); play(b, 'tele', dur(id, 'tele') / bao); later(b, bao, () => play(b, 'atk', spd));
        if (Nn && Nn.satDot) b.dmg = d0 * Nn.satDot;
        try { don(g, bao); } finally { b.dmg = d0; }
        b.wind = bao;
      });
      if (n > 1) giuBan(b, T + (n - 1) * gap + dur(id, 'atk') / spd);
    } else {
      // luật công bằng: chiêu nặng (Đập càng, Vồ lửa, Gầm phun lửa) chạy cử động chậm lại cho mốc ra đòn (nửa cử động) ≥ 0,7 giây
      const spk = CB.nang(b, k) && (0.5 * dur(id, k)) / spd < CB.baoNang() ? (0.5 * dur(id, k)) / CB.baoNang() : spd;
      const D = dur(id, k) / spk, T = 0.5 * D;
      let xong = 0; // nổi giận: lúc đợt thêm cuối xong (giữ trùm bận tới đó)
      b.cbLap = T; b.cbHet = 0;
      play(b, k, spk);
      b.busy = D; b.wind = T; b.ngXong = 0;
      // 14/10 ky-nang-trum-rieng (js/chieu_trum.js; 15/10 don-tep B bỏ cờ ?chieucu=1 và nhánh cũ): chiêu 2 của Nấm Chúa (Nấm mẹ đẻ con) và Cua Đá (Tường tinh thể) thay
      // Bão bào tử / Mưa tinh thể (hai kiểu bị lặp: toả tròn đạn, mưa rơi quanh em bé). Cùng cử động, cùng mốc T, sát thương mỗi lần trúng giữ.
      if (k === 'chieu2' && G.chieuTrum && G.chieuTrum.mini(b, id, k, P, T, D, a)) { /* chiêu mới */ }
      else if (id === 'cuaDa' && k === 'chieu1') {
        // Đập càng rung sàn: sóng chấn động quanh mình, chạy ra ngoài vòng đỏ
        circle(b.x, b.y, 80, T, b.dmg * 1.3, null, { fxKind: 'slam' });
        if (ph >= 1) Z('donut', { x: b.x, y: b.y, r0: 80, r1: 118 }, T + 0.5, b.dmg, null);
        // cua-tuong-kho: vết nứt chạy qua chỗ em bé tới tận mép sàn + đá rơi dọc chân tường nếu em bé đứng sát mép (G.CUA_SO)
        if (CUA(b)) { cuaNut(b, a, T + CUA_SO.nut.tre); cuaDaRoi(b, P, T + CUA_SO.da.tre); }
        // nổi giận: đập thêm một lần (sau vòng sóng), báo trước như vùng to
        const n = soNG(b, 'cuaDap', 'dot', 1);
        for (let j = 1; j < n; j++) lapDot(b, 'chieu1', T + 0.5 + j * 0.55, sanNG(b, true) || 0.6, (wt) => {
          circle(b.x, b.y, 80, wt, b.dmg * 1.3, null, { fxKind: 'slam' });
          if (CUA(b)) { const g = ang(b, W().P); aimFace(b, g); cuaNut(b, g, wt + CUA_SO.nut.tre); } // nứt lại theo chỗ em bé lúc này
        }, 'cuaDap');
        if (n > 1) xong = T + 0.5 + (n - 1) * 0.55 + 0.2;
      } else if (id === 'namChua' && k === 'chieu1') {
        // Hàng nấm độc: nấm mọc vọt nối nhau theo hướng em bé
        const vu = (B ? ph >= 1 : ph >= 2) ? 2 : 0; // vũng độc ở lại: pha cuối (nổi giận: pha 2)
        const hang = (g, t) => { for (let i = 0; i < 7; i++) { const x = b.x + Math.cos(g) * (22 + i * 21), y = b.y + Math.sin(g) * (22 + i * 21); if (x > w.x0 - 6 && x < w.x1 + 6 && y > w.y0 - 6 && y < w.y1 + 6) { circle(x, y, 14, t + i * 0.08, b.dmg, 'poison', { fxKind: 'root', then: vu }); anhVungThem(b, 'hu-nam-moc', x, y, t + i * 0.08, 0.2, 0.6, 1); } } };
        hang(a, T);
        // nổi giận: thêm một hàng nấm, nhắm lại chỗ em bé
        const n = soNG(b, 'namHang', 'dot', 1);
        for (let j = 1; j < n; j++) lapDot(b, 'chieu1', T + j * 0.75, sanNG(b, true) || 0.6, (wt) => { const g = huongDot(b, P, a, 'namHang'); aimFace(b, g); hang(g, wt); }, 'namHang');
        if (n > 1) xong = T + (n - 1) * 0.75 + 0.6;
      } else if (id === 'hoLua' && k === 'chieu1') {
        // Vồ lửa: chồm tới một đường dài, để lại vệt lửa trên sàn
        const vo = (g, L, t, vet) => {
          Z('line', { x: b.x, y: b.y, ang: g, len: L, w: 32 }, t, b.dmg * 1.4, 'fire', { melee: true });
          later(b, t, () => {
            const x0 = b.x, y0 = b.y;
            lunge(b, g, L - 30, 0.25);
            if (vet !== false) for (let i = 0; i < 4; i++) G.zoneCircle(clamp(x0 + Math.cos(g) * (20 + i * (L - 30) / 3), w.x0, w.x1), clamp(y0 + Math.sin(g) * (20 + i * (L - 30) / 3), w.y0, w.y1), 15, 0, b.dmg * 0.5, 'fire', { pool: true, life: 2.6, tick: 0.3 });
          });
        };
        vo(a, clamp(d + 30, 90, 160), T);
        b.an.cut = 0.75;
        // nổi giận: vồ thêm lần nữa, nhắm lại chỗ em bé (sau khi lần trước đáp)
        const n = soNG(b, 'hoVoLua', 'dot', 1);
        for (let j = 1; j < n; j++) lapDot(b, 'chieu1', T + j * 0.8, Math.max(0.5, sanNG(b, false)), (wt) => { const g = huongDot(b, P, a, 'hoVoLua'); aimFace(b, g); vo(g, clamp(Math.hypot(P.x - b.x, P.y - b.y) + 30, 90, 160), wt, false); if (b.an) b.an.cut = 0.75; }, 'hoVoLua'); // lần vồ thêm không để vệt lửa (đo bot: vệt lửa gấp đôi làm Hổ Lửa tụt mạnh)
        if (n > 1) xong = T + (n - 1) * 0.8 + 0.3;
      } else {
        // Gầm phun lửa: phun lửa hình quạt rộng
        Z('cone', { x: b.x, y: b.y, ang: a, r: 112, span: 1.5 }, T, b.dmg * 1.3, 'fire');
        // nổi giận: phun thêm một lần (cùng hướng)
        const n = soNG(b, 'hoPhun', 'dot', 1);
        for (let j = 1; j < n; j++) lapDot(b, 'chieu2', T + j * 0.7, sanNG(b, true) || 0.6, (wt) => { const g = huongDot(b, P, a, 'hoPhun'); aimFace(b, g); Z('cone', { x: b.x, y: b.y, ang: g, r: 112, span: 1.5 }, wt, b.dmg * 1.3, 'fire'); }, 'hoPhun');
        if (n > 1) xong = T + (n - 1) * 0.7 + 0.3;
      }
      if (b.ngXong > xong) xong = b.ngXong; // chiêu mới (js/chieu_trum.js) có đợt thêm
      if (b.cbHet > xong) xong = b.cbHet; // luật công bằng: đợt thêm bị lùi lại
      b.ngXong = 0;
      if (xong > D) giuBan(b, xong);
      // GĐ2 (V14, Q3): trùm nhỏ mệt ngắn sau chiêu 1 (nổi giận: sau đợt cuối)
      if (k === 'chieu1') later(b, Math.max(D, xong), () => tire(b, 0.8));
    }
    if (has(b, 'antiDodge')) later(b, b.wind + 0.3, () => { const P2 = W().P; circle(clamp(P2.x + (P2.ddx || 0) * 46, w.x0, w.x1), clamp(P2.y + (P2.ddy || 0) * 34, w.y0, w.y1), 18, 0.6, b.dmg, b.el); });
    const cdCu = N ? N.cd : [1.4, 1.15, 0.9];
    b.cd = nghiNG(b, cdCu[ph], cdCu[0]);
  }

  // ======================= DI CHUYỂN =======================
  function move(b, dt) {
    const w = W(), P = w.P;
    b.moving = false;
    if (b.busy > 0 || b.st.stun > 0 || b.st.root > 0 || b.st.frozen > 0) return;
    if (b.kind === 'thuong' && G.thuongLuong && G.thuongLuong.di(b, dt)) return; // Thuồng Luồng: đầu ở mép phải, chỉ trườn dọc theo em bé
    const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy) || 0.01;
    if (Math.abs(dx) > 4) b.face = dx > 0 ? 1 : -1;
    b.dirA = b.face > 0 ? 0 : PI;
    if (b.kind === 'ho' && has(b, 'antiMelee') && d < 46 && b.hopCd <= 0) {
      // Chống áp sát: Hồ Tinh bật lùi ra xa, để lại vũng lửa chỗ cũ
      b.hopCd = 3.5;
      b.skillName = 'Vũng lửa ma';
      G.zoneCircle(b.x, b.y, 24, 0, b.dmg, 'fire', { pool: true, life: 3, tick: 0.3, skill: b.skillName });
      lunge(b, Math.atan2(-dy, -dx), 90, 0.25);
      return;
    }
    const cua = CUA(b), want = cua ? CUA_SO.di.gan : b.kind === 'moc' ? 70 : b.kind === 'ngu' || b.kind === 'thuong' ? 85 : b.kind === 'ho' ? 100 : 44;
    const BN = bangNG(b), sp = b.speed * Math.max(0.4, 1 - 0.15 * b.st.iceN) * chamOf(b) * (BN ? ngPh(BN.diChuyen, b.phase) : 1); // × nổi giận
    // cua-tuong-kho: Cua Đá đi ngang nhanh, em bé ở xa thì lướt ngang một đoạn (đuổi được tới sát mép / góc)
    if (cua && d > CUA_SO.luot.xa && !(b.luotCd > 0) && !b.lunge) { const L = CUA_SO.luot; lunge(b, Math.atan2(dy, dx), Math.min(L.dai, d - want), L.giay); b.luotCd = L.cd; b.cd = Math.max(b.cd, L.giay + 0.05); b.moving = true; FX('burst', b.x, b.y, '#d8c08a', 6, 50); return; }
    if (d > want + 12) { b.x += (dx / d) * sp * (cua ? CUA_SO.di.ngang : 1) * dt; b.y += (dy / d) * sp * (cua ? CUA_SO.di.doc : 0.8) * dt; b.moving = true; }
    else if (d < want - 30 && b.kind !== 'mini') { b.x -= (dx / d) * sp * 0.45 * dt; b.y -= (dy / d) * sp * 0.3 * dt; b.moving = true; }
    if (b.kind === 'ho') b.y += Math.sin(b.t * 1.7) * 14 * dt;
  }

  G.updateBoss = function (b, dt) {
    const w = W();
    b.t += dt;
    if (b.flash > 0) b.flash -= dt;
    if (b.exposed > 0) b.exposed -= dt;
    if (b.wind > 0) b.wind -= dt;
    if (b.tpCd > 0) b.tpCd -= dt;
    if (b.hopCd > 0) b.hopCd -= dt;
    if (b.luotCd > 0) b.luotCd -= dt;
    if (b.invuln > 0) b.invuln -= dt;
    if (b.busy > 0) b.busy -= dt;
    if (b.tired > 0) b.tired -= dt;
    if (b.an) b.an.t += dt * (b.an.spd || 1);
    if (b.hitT > 0) b.hitT -= dt;
    G.tickStatus(b, dt);
    if (b.dead) return;
    if (b.lunge) {
      const L = b.lunge, k = Math.min(dt, L.t);
      b.x += L.vx * k; b.y += L.vy * k; L.t -= dt;
      if (L.t <= 0) b.lunge = null;
    }
    b.x = clamp(b.x, w.x0 + 4, w.x1 - 4); b.y = clamp(b.y, w.y0, w.y1);
    // Ba pha: đổi ở 66% và 33% máu. Trùm vùng diễn cảnh chuyển pha (không nhận sát thương), hình đổi theo pha.
    const frac = b.hp / b.maxhp, BN = bangNG(b);
    // Nổi giận: trùm nhỏ chỉ có hai pha, đổi ở G.NOI_GIAN.nho.nguong (50%) máu; cờ tắt → ba pha 66% / 33% như cũ.
    const ph = BN && b.kind === 'mini' ? (frac <= BN.nguong ? 1 : 0) : frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2;
    if (ph > b.phase && !(b.intro > 0 && b.invuln > 0)) {
      b.phase = ph;
      b.seq.length = 0; b.lunge = null; b.tired = 0;
      if (BN) { if (b.dmg0 == null) b.dmg0 = b.dmg; b.dmg = b.dmg0 * ngPh((BN.satTrum && BN.satTrum[b.kind]) || BN.sat, ph); // satTrum: hệ số riêng một trùm (nếu có)
        b.ngConLai = 0; } // nổi giận: × sát thương, chuỗi nối chiêu dở thì bỏ
      w.zones = w.zones.filter((z) => z.src !== b || !(z.t > 0 || z.wall));
      if (b.kind !== 'mini') {
        const D = dur(b.art, ph === 1 ? 'phase2' : 'phase3');
        play(b, ph === 1 ? 'phase2' : 'phase3');
        b.invuln = D; b.busy = D; b.cd = 0.4;
        w.projs = w.projs.filter((o) => o.team !== 'enemy');
        w.shake = Math.max(w.shake, 0.5);
      }
      b.roarT = 1.2; b.roarPh = ph;
      w.banner = { s: ph === 1 ? G.t('{0} nổi giận!', b.name) : G.t('{0} hóa cuồng!', b.name), col: '#ff6a5a', t: 2 };
      if (BN) { // dòng nhỏ mô tả (dải thông báo dòng thứ hai; cờ đọc trận tắt thì nối vào biểu ngữ)
        const mt = ph >= 2 ? 'Nhanh hơn nữa, nối chiêu dồn dập' : 'Ra chiêu nhanh hơn, nối chiêu';
        if (G.DO_DOC_TRAN === true && G.docTran && G.docTran.bao) G.docTran.bao(G.t(mt), '#ffb0a0', 2.6);
        else { w.banner.s += ' — ' + G.t(mt); w.banner.t = 2.6; }
      }
      if (b.doiPha) b.doiPha(b, ph); // trùm đổi hệ theo pha (Thuồng Luồng, js/thuong_luong.js)
      G.sfx('gong');
    }
    CB.theo(b); // luật công bằng: tiếng báo đòn nặng, nghỉ sau đòn nặng hụt
    for (const s of b.seq) s.t -= dt;
    const due = b.seq.filter((s) => s.t <= 0);
    b.seq = b.seq.filter((s) => s.t > 0);
    for (const s of due) s.f();
    if (b.diT > 0) b.diT -= dt; // 15/10 soat-muot Phiên 1 mục 4: đồng hồ chỉ để vẽ
    move(b, dt);
    // hình: đang ra chiêu thì giữ cử động chiêu; xong chiêu thì đứng thở hoặc đi
    const busyAnim = b.an && (b.an.n === 'intro' || b.an.n === 'spawn' || b.an.n === 'phase2' || b.an.n === 'phase3' || /^c\d$|^chieu|^atk|^tele/.test(b.an.n));
    if (b.busy <= 0 || !busyAnim) {
      let n = b.moving ? 'move' : 'idle';
      // 15/10 soat-muot Phiên 1 mục 4 (cờ ?didung=0, G.DI_DUNG_EM ở js/mobs.js): trùm đứng sát mốc dừng (d ≈ want + 12) bật tắt cờ đi vài khung một lần,
      // mỗi lần về khung 1 → run tại chỗ. Nay: hết đi 0,13 giây mới đổi sang đứng; mỗi hàng đi / đứng nhớ đồng hồ, quay lại trong 0,2 giây thì đi tiếp từ khung cũ.
      // Chỉ đổi hình (b.an), không đổi đường đi.
      if (G.DI_DUNG_EM !== false) {
        if (b.moving) b.diT = 0.13; else if (b.diT > 0) n = 'move';
        if (!b.an || b.an.n !== n) {
          const nho = b.anNho || (b.anNho = {});
          if (b.an && (b.an.n === 'idle' || b.an.n === 'move')) nho[b.an.n] = { t: b.an.t, luc: b.t };
          const c = nho[n];
          play(b, n);
          if (c && b.t - c.luc < 0.2) b.an.t = c.t;
        }
      } else if (!b.an || b.an.n !== n) play(b, n);
    }
    if (b.busy <= 0 && b.st.stun <= 0 && b.st.frozen <= 0) {
      b.cd -= dt * chamOf(b);
      if (b.cd <= 0 && !CB.cho(b)) { // luật công bằng: chờ hết nghỉ / vùng báo của chính nó nổ xong
        const noi = b.ngConLai > 0; // chiêu này nối liền chiêu trước (nổi giận)
        if (b.kind === 'mini') thinkMini(b); else thinkBig(b);
        if (noi && !b.dead) FX('text', b.x, b.y - (b.h || 60) - 10, 'Nối chiêu!', '#ff8a5a', 8); // chuỗi tĩnh: dịch lúc vẽ (tools/ngon-ngu/tu-dien/noi-gian.json)
      }
    }
  };

  // ======================= VẼ =======================
  const A = G.art;
  if (A) {
    const boss0 = A.boss;
    A.boss = function (c, b) {
      if (!b.art || !G.monsterArt || b.kind === 'mini' || b.illusion) return boss0(c, b);
      let n = b.an ? b.an.n : 'idle', t = b.an ? b.an.t : 0;
      if (b.an && b.an.cut) { const D = dur(b.art, n); t = Math.min(t, b.an.cut * D); }
      if (b.dying != null) { n = 'die'; t = b.dying * dur(b.art, 'die'); }
      else if ((b.st && b.st.stun > 0) || b.tired > 0) { n = 'stun'; t = G.time; }
      else if (b.hitT > 0 && (n === 'idle' || n === 'move')) { n = 'hit'; t = 0.4 - b.hitT; }
      const phase = (b.phase | 0) + 1;
      // Đợt 1: có ảnh AI (js/sprite_custom.js dùng cùng một ảnh cho mọi pha) thì KHÔNG co 72%, kẻo thân pha 3 nhỏ đi so với pha 1, 2.
      const anhAI = !!(G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds[b.art] && G.spriteCustom.ds[b.art].ready);
      const pha3 = b.kind === 'ho' && !anhAI && (phase >= 3 && !(n === 'phase3' && t < dur(b.art, 'phase3') * 0.5));
      const s = pha3 ? 0.72 : 1; // Hồ Tinh pha 3 to gấp rưỡi: thu nhỏ cho vừa phòng
      b.drawW = (pha3 ? 281 : b.kind === 'ho' ? 174 : 150) * s; b.drawH = (pha3 ? 174 : b.h) * s;
      const fk = G.fx && G.fx.chop ? G.fx.chop() : 1; // khựng hình: chỉ khung đầu chớp trắng hẳn (js/fx.js)
      const o = { anim: n, t, face: b.face, dir: b.dirA != null ? b.dirA : b.face > 0 ? 0 : PI, phase, hit: b.flash > 0 ? 0.7 * fk : 0, chop: fk, tint: (G.fx && G.fx.dotTint ? G.fx.dotTint(b) : null) || (G.noiGian ? G.noiGian.tint(b) : null), bao: false,
        huTrum: true, vongGai: b.an && b.an.n === n && b.an.vongGai ? b.an.vongGai : null }; // 14/10: ảnh chiêu trùm (js/monster_art.js MA.huTrum) // nhịp độc/cháy: nhuộm màu hệ thay chớp trắng
      {
        // 14/10 trum-chet-pha3: nhịp khung đều cho ảnh AI (js/sprite_custom.js SC.chonTrum, cần mốc ra đòn của chiêu),
        // bóng chân đứng yên dưới ảnh (dáng vẽ code còn rung P.x). (15/10 don-tep B: bỏ cờ ?trumcu=1.)
        o.nhip = { moc: /^c\d$/.test(n) ? moc(b.art, n) : null };
        o.bongGoc = anhAI;
        // Trùm vùng gục khi đã có ảnh AI: bỏ hẳn hiệu ứng chết vẽ tay của cử động 'die' (TRUM.chetLon: nổ lốp bốp, tia, vòng sóng, chớp, lá rơi,
        // cột nước) — đã có ảnh nổ trên thân (hu-no-nho) và nổ cuối (hu-trum-no) ở js/fx.js. Thân gục theo hàng 'die' của ảnh pha đang ở.
        if (b.dying != null && anhAI) o.fx = false;
      }
      // 14/10 ky-nang-trum-rieng: chiêu mới (js/chieu_trum.js) dùng lại cử động của chiêu cũ → tắt hiệu ứng vẽ code của chiêu CŨ trong cử động đó.
      if (G.chieuTrum && G.chieuTrum.tatFx(b, n)) o.fx = false;
      // Phiên E2 (chỉ khi trùm dùng ảnh AI, chỉ là hình, không đổi luật): hình vẽ bằng code tự chớp trắng lúc sắp ra đòn và lúc đổi dáng giữa cảnh chuyển pha, ảnh AI thì mất.
      // 1) 0,25 giây cuối trước khi đòn ra (b.wind, cùng mốc với dấu "!" của quái): thân nhấp nháy trắng. 2) Có tệp dáng pha (<mã>-p2 / -p3, js/sprite_custom.js): chớp trắng che lúc đổi dáng.
      if (anhAI && b.dying == null) {
        if (b.wind > 0 && b.wind < 0.25 && /^c\d$|^chieu|^atk|^tele/.test(n) && Math.floor(G.time * 20) % 2) o.baoDon = 0.35 * fk;
        // Phiên Kiểm 3 pha (12/10): mở đầu cảnh chuyển pha thân chớp trắng mạnh rồi nhạt dần (mọi trùm vùng có ảnh AI, kể cả chưa có tệp dáng pha).
        if ((n === 'phase2' || n === 'phase3') && G.PHA_TRUM_DU) { const u0 = t / (dur(b.art, n) || 1); if (u0 < 0.14) o.baoDon = Math.max(o.baoDon || 0, 0.85 * (1 - u0 / 0.14)); }
        if ((n === 'phase2' || n === 'phase3') && G.spriteCustom.phaTrum && G.spriteCustom.phaTrum(G.spriteCustom.ds[b.art], phase, 'tele')) {
          const u = t / (dur(b.art, n) || 1);
          if (u >= 0.45 && u < 0.58) o.baoDon = Math.max(o.baoDon || 0, 1 - ((u - 0.45) / 0.13) * 0.5);
        }
      }
      const NGv = G.noiGian && b.dying == null ? G.noiGian : null; // 15/10 noi-gian-manh: quầng đỏ dưới chân + đốm lửa giận suốt pha 2, 3 (js/noi_gian.js)
      if (NGv) NGv.veDuoi(c, b);
      if (s !== 1) { c.save(); c.translate(Math.round(b.x), Math.round(b.y)); c.scale(s, s); G.monsterArt.draw(c, b.art, 0, 0, o); c.restore(); }
      else G.monsterArt.draw(c, b.art, b.x, b.y, o);
      if (NGv) NGv.veTren(c, b);
      if (b.dying == null && b.invuln > 0 && b.intro == null) {} // (chỗ trống cho dấu hiệu miễn sát thương)
    };
  }
})();
