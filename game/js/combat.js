// Chiến đấu: người chơi, quái, hiệu ứng ba hệ, kết hợp hệ, dấu ấn và tiến hóa vũ khí.
(function () {
  const G = window.G;
  let W = null; // thế giới của phòng hiện tại
  G.getWorld = () => W;
  // Gọi lớp hiệu ứng (js/fx.js). Chạy không vẽ thì bỏ qua hẳn; thiếu fx.js game vẫn chạy.
  function FX(n, a, b, c, d, e) {
    if (G.noRender) return;
    const f = G.fx && G.fx[n];
    if (f) f(a, b, c, d, e);
  }

  // ---------- vũ khí ----------
  G.wStage = function (w) {
    if (!w || !w.branch) return 0;
    const m = w.marks[w.branch];
    const s = m >= G.MARKS[2] ? 3 : m >= G.MARKS[1] ? 2 : m >= G.MARKS[0] ? 1 : 0;
    return Math.min(s, G.RARITY[G.wRar(w)].maxStage);
  };
  // Bậc 0..3 (Thường, Lam, Tím, Vàng). Bản sao vũ khí hoặc vũ khí dựng tạm chỉ có tier cũ vẫn đọc được.
  G.wRar = (w) => G.clamp((w.rarity != null ? w.rarity : w.tier) | 0, 0, G.RARITY.length - 1);
  G.wHas = (w, k) => !!(w && w.affixes && w.affixes.includes(k)); // có dòng phụ k không
  // Tên hiển thị lấy theo hình (dòng, nhánh, mốc) từ js/weapon_art.js, kèm danh hiệu và cấp mài.
  G.wName = function (w) {
    const st = G.wStage(w), WA = G.weaponArt;
    // Hệ thống mới (G.HE_MOI): bỏ dòng vũ khí → tên = loại + chữ theo hệ và cấp (Kiếm Than Hồng, Phi tiêu Băng Đế…).
    const dong = WA && !G.HE_MOI;
    const base = dong ? WA.name(WA.fromWeapon(w)) : G.WTYPES[w.type].name + (st ? ' ' + G.NAME_WORDS[w.branch][st - 1] : '');
    // Ngôn ngữ khác: dịch tên gốc và danh hiệu lúc hiện (w.title nằm trong bản lưu, luôn là tiếng Việt).
    if (G.LANG !== 'vi') return (dong || !st ? G.tv(base) : G.tv(G.WTYPES[w.type].name) + ' ' + G.tv(G.NAME_WORDS[w.branch][st - 1])) + titleOf(w.title) + (w.sharpen ? ' +' + w.sharpen : '');
    return base + (w.title || '') + (w.sharpen ? ' +' + w.sharpen : '');
  };
  const KE_HA = ', kẻ hạ ';
  function titleOf(t) { return !t ? '' : t.indexOf(KE_HA) === 0 ? G.t(', kẻ hạ {0}', t.slice(KE_HA.length)) : G.tv(t); }
  // Hệ số bậc: Vàng của vùng sau cao hơn (G.GOLD_MULT).
  G.wRarMult = (w) => (G.wRar(w) === 3 ? G.GOLD_MULT[w.gold | 0] || G.GOLD_MULT[0] : G.RARITY[G.wRar(w)].mult);
  G.wBase = function (w, lvl) {
    return G.WTYPES[w.type].dmg * G.wRarMult(w) * G.STAGE_MULT[G.wStage(w)] * (1 + 0.08 * w.sharpen) * (1 + G.LVL_DMG * ((lvl || 1) - 1));
  };
  function nameWeapon(w) {
    // Danh hiệu chỉ tính boss vùng, không tính trùm nhỏ.
    const bk = Object.keys(w.bossKills || {}).filter((k) => G.REGIONS.some((r) => r.bossName === k)).sort((a, b) => w.bossKills[b] - w.bossKills[a])[0];
    w.title = bk ? KE_HA + bk : w.kills >= 1000 ? ', nghìn mạng' : '';
    w.named = true;
  }
  G.addMarks = function (w, el, n, quiet) {
    if (!w || n <= 0) return;
    const before = G.wStage(w);
    w.marks[el] += n;
    if (!w.branch && w.marks[el] >= G.MARKS[0]) w.branch = el;
    const after = G.wStage(w);
    if (W) {
      W.marksGained += n;
      if (G.lk) G.lk.log(w, el, n); // sổ ghi dấu ấn từng hệ cho màn kết quả (js/linhkhi.js)
      if (!quiet) FX('marks', el, n);
      const next = G.MARKS[Math.min(2, after)];
      G.sfx('mark', 0.8 + 0.6 * Math.min(1, w.marks[el] / next));
    }
    if (after === 3 && !w.named) nameWeapon(w);
    if (after === 3 && el === w.branch) doiThua(w);
    if (after > before) {
      // Lên Thành hình và Thức tỉnh: báo luôn tên đặc trưng hệ vừa mở.
      const ft = after >= 2 ? G.HE_FEATURES[w.branch][after - 2] : null;
      if (W) W.banner = { s: ft ? G.t('{0} đạt mốc {1}! Mở đặc trưng: {2}', G.wName(w), G.STAGE_NAMES[after], ft.name) : G.t('{0} đạt mốc {1}!', G.wName(w), G.STAGE_NAMES[after]), col: G.EL[w.branch].col, t: ft ? 4.5 : 3.5, feature: ft ? ft.name : null };
      G.sfx('evolve');
      if (W) FX('evolve', w.branch, after);
    }
  };

  // Dấu ấn thừa (phiên cân bằng, mục 2): vũ khí đã Thức tỉnh, hệ chính vượt mốc cuối mỗi G.LK_THUA dấu ấn thì đổi ra
  // 1 nguyên liệu vùng của hệ đó (G.LK_THUA_MAT). Ghi vào danh sách "Trong ải" của lượt chơi để màn kết quả hiện ra.
  function doiThua(w, sv0) {
    const sv = sv0 || G.save, k = G.LK_THUA || 0, el = w.branch;
    if (!sv || !sv.mats || !(k > 0) || !el) return 0;
    const top = G.MARKS[G.MARKS.length - 1];
    let n = 0;
    while (w.marks[el] >= top + k && n < 1000) { w.marks[el] -= k; n++; }
    if (!n) return 0;
    const mi = G.LK_THUA_MAT[el] | 0;
    sv.mats[mi] += n;
    const S = !sv0 && G.getRun && G.getRun();
    const mat = G.tv(G.REGIONS[mi].mat.toLowerCase()), txt = G.t('{0} {1} (dấu ấn thừa của {2})', n, mat, G.wName(w));
    if (S && S.got && S.W === W) S.got.push(txt);
    if (!sv0 && W && !W.banner) W.banner = { s: G.t('Dấu ấn thừa đổi ra {0} {1}', n, mat), col: G.EL[el].col, t: 2.5 };
    return n;
  }
  G.lkDoiThua = doiThua;

  // ---------- chỉ số người chơi ----------
  G.buildPlayer = function () {
    const sv = G.save, key = sv.hero, H = G.HEROES[key], hs = sv.heroes[key];
    if (G.outfit) G.outfit.sync(sv); // mũ, áo, bùa kiểu cũ (nếu còn) chuyển sang trang phục mới trước khi tính chỉ số
    const sk = hs.sk;
    const armor = sv.armor ? G.GEAR.armor[sv.armor] : null;
    const helm = sv.helm ? G.GEAR.helm[sv.helm] : null;
    const set = armor && helm && armor.set && armor.set === helm.set ? armor.set : null;
    const osum = G.outfit ? G.outfit.sum(sv) : null; // trang phục đang mặc: máu cộng vào trước các hệ số, như áo của bản cũ
    let maxhp = H.hp * (1 + G.LVL_HP * (hs.lvl - 1)) + (armor ? armor.hp : 0) + (osum ? osum.stats.hp || 0 : 0);
    if (sk.def >= 1) maxhp *= 1.1;
    // ZED (js/data.js G.ZED_DAY): phần giảm sát thương từ nội tại (Cu Lì 25%; Zed được Cu Lì dạy 12%) — Sức mạnh, Lực chiến chỉ tính một nửa
    const zed = G.zedLa ? G.zedLa(key) : false;
    const drNT = key === 'wrestler' ? 0.25 : zed && G.zedHoc('wrestler') ? G.ZED_DAY.wrestler.dr : 0;
    if ((sv.charm === 'c_greed' || (osum && osum.oldCharm === 'c_greed')) && hs.lvl >= 5) maxhp *= 0.9;
    const P = {
      isPlayer: true, key, lvl: hs.lvl, sk, x: 60, y: 190, r: 7, hr: 6, face: 1,
      maxhp: Math.round(maxhp), hp: Math.round(maxhp),
      maxmana: H.mana + (sk.elem >= 1 ? 20 : 0), mana: 0,
      speed: 72 * H.speed * (sv.armor === 'a_ho' ? 1.08 : 1),
      weapons: sv.carry.map((id) => G.weaponById(id)).filter(Boolean), cur: 0, coats: {},
      atkT: 0, atkDur: 0, cdT: 0, hitDone: true, comboI: -1, lastAtk: 0, hitCount: 0,
      dodgeT: 0, dodgeCd: 0, dodgeBuf: 0, ddx: 1, ddy: 0, inv: 0, hurtT: 0, dashT: 0, dashHit: null,
      castT: 0, specT: 0, deadT: 0, // đồng hồ cho hoạt ảnh: dùng kỹ năng, tung đòn đặc biệt, gục
      st: { fire: 0, poison: 0, ice: 0 }, dot: 0, dotT: 0,
      potions: 2, skillCd: 0, specCd: 0, swapCd: 0, gongT: 0, firstHit: false, boost: false, stillT: 0, t: 0, moving: false,
      dmgMult: (1 + (sk.atk >= 1 ? 0.08 : 0) + (sk.atk >= 4 ? 0.08 : 0)),
      crit: sk.atk >= 5 ? 0.1 : 0, specCost: 25 - (sk.atk >= 2 ? 5 : 0), statusBonus: sk.atk >= 3 ? 1.15 : 1,
      dodgeCdMax: sk.def >= 2 ? 0.75 : 1, roomHeal: sk.def >= 3 ? 0.08 : 0,
      dr: (armor ? armor.dr : 0) + (sk.def >= 5 ? 0.1 : 0) + drNT,
      resist: { fire: 0, poison: 0, ice: 0 },
      manaHit: 2 + (sk.elem >= 2 ? 1 : 0), comboMult: sk.elem >= 3 ? 1.3 : 1, swapProc: sk.elem >= 4,
      statusDur: (key === 'healer' ? 1.3 : 1) * (zed && G.zedHoc('healer') ? G.ZED_DAY.healer.statusDur : 1) * (sk.elem >= 5 ? 1.25 : 1),
      markMult: key === 'smith' ? 1.2 : 1, set,
      // nội tại "đánh quái bị khống chế" (Cu Tèo; Zed khi đã được Cu Tèo dạy), phản đòn cận chiến (Cu Lì; Zed khi Cu Lì dạy)
      ccMult: key === 'hunter' ? 1.25 : zed && G.zedHoc('hunter') ? G.ZED_DAY.hunter.cc : 1,
      reflect: key === 'wrestler' ? 0.5 : zed && G.zedHoc('wrestler') ? G.ZED_DAY.wrestler.reflect : 0,
      drNT: drNT, charm: hs.lvl >= 5 ? sv.charm : null, helm: sv.helm, armor: sv.armor,
    };
    if (helm) P.resist[helm.res] += helm.pct;
    if (sk.def >= 4) for (const e of G.ELS) P.resist[e] = Math.min(0.8, P.resist[e] + 0.3);
    if (G.outfit) G.outfit.apply(P, sv); // trang phục: chỉ số, bộ, tác dụng đặc biệt, hình đang mặc (js/outfit.js)
    if (G.chuong) G.chuong.attach(P, sv); // nút Chưởng thay kỹ năng riêng: cây chưởng đang dùng, nét riêng của em bé (js/chuong.js)
    P.mana = Math.round(P.maxmana * 0.5);
    return P;
  };
  // SỨC MẠNH của em bé (một con số để so với "Sức mạnh khuyên dùng" của ải): căn bậc hai của (đòn mạnh nhất x máu hữu hiệu).
  // Đòn: vũ khí mạnh nhất đang mang, quy về thang của kiếm (cấp hero, bậc, mài, mốc tiến hóa, điểm Công, chí mạng).
  // Máu hữu hiệu: máu tối đa (cấp hero, áo, điểm Thủ) chia cho phần sát thương còn nhận (giáp, nội tại), cộng chút kháng hệ của mũ.
  // Em bé mới cấp 1 cầm kiếm Thường có sức mạnh 99. Trang phục đang mặc cũng được tính (máu, giảm sát thương, kháng, bộ, tác dụng, cánh).
  G.power = function () {
    const q = G.powerParts();
    return q ? q.power : 0;
  };
  // Hai thành phần của sức mạnh: off (đòn mạnh nhất, thang kiếm) và ehp (máu hữu hiệu).
  G.powerParts = function () {
    if (!G.save || !G.save.heroes) return null;
    const P = G.buildPlayer();
    let off = 0;
    // Cày nâng cấp: tính cả vũ khí thứ hai (75% món mạnh nhất + 25% món còn lại). Trùm thích nghi kháng hệ đang dùng nhiều nên phải đổi
    // sang vũ khí kia; vũ khí thứ hai bỏ mặc +0 thì đánh trùm rất khó, nên con số Sức mạnh và gợi ý nâng cấp phải thấy được điều đó.
    const offs = P.weapons.map((w) => (G.pDamage(P, w) / G.WTYPES[w.type].dmg) * 10 * (G.wHas(w, 'crit') ? 1.1 : 1)).sort((a, b) => b - a);
    if (offs.length) off = offs.length > 1 ? offs[0] * 0.75 + offs[1] * 0.25 : offs[0];
    if (!off) off = 10 * (1 + 0.01 * (P.lvl - 1));
    off *= 1 + P.crit;
    // Chưởng (js/chuong.js): mỗi điểm chưởng đã học cộng thêm một chút vào phần đòn
    if (G.chuong) off *= G.chuong.powerMult(G.save, P.key);
    let res = 0;
    for (const e of G.ELS) res = Math.max(res, P.resist[e] || 0);
    // Phiên cân bằng (mục 6): nội tại giảm 25% sát thương của Cu Lì chỉ tính một nửa (Đô Vật bị đếm cao hơn Thợ Rèn 26%
    // dù thắng như nhau với số máu mất tương đương).
    const drP = P.dr - (P.drNT || 0) / 2;
    let ehp = (P.maxhp / (1 - Math.min(0.75, drP))) * (1 + 0.25 * Math.min(0.8, res));
    // Trang phục (js/outfit.js): máu, giảm sát thương, kháng hệ đã nằm trong P; thêm phần thưởng đủ bộ (sát thương hệ),
    // mỗi tác dụng riêng của món Tím, Vàng (khiên, vệt, vũng, nổ) và cánh (lộn xa hơn, khiên sau khi lộn).
    if (P.elBonus) { let eb = 0; for (const e in P.elBonus) eb = Math.max(eb, P.elBonus[e] || 0); off *= 1 + eb * 0.6; }
    if (P.oSp) { let n = 0; for (const k in P.oSp) n += P.oSp[k].length; ehp *= 1 + 0.04 * Math.min(5, n); }
    if (P.dodgeMul > 1) ehp *= 1 + (P.dodgeMul - 1) * 0.3;
    return { off, ehp, power: Math.round(3 * Math.sqrt(off * ehp) * (P.powerMult || 1)) };
  };
  // Màu so sánh: đủ (xanh), sát nút (vàng, từ 90% khuyên dùng), thiếu (đỏ).
  G.powerCol = function (have, need) { return have >= need ? '#6fdc6a' : have >= need * 0.9 ? '#ffd23f' : '#ff6a5a'; };
  const curW = (P) => P.weapons[P.cur];
  G.curW = curW;
  G.activeEl = function (P, w) {
    const c = P.coats[w.id];
    if (c && c.t > 0) return c.el;
    return G.wStage(w) > 0 ? w.branch : null;
  };
  G.pDamage = function (P, w) {
    return G.wBase(w, P.lvl) * P.dmgMult * ((G.favOf ? G.favOf(P.key) : G.HEROES[P.key].fav).includes(w.type) ? 1.1 : 1);
  };

  // ---------- thế giới ----------
  G.newWorld = function (P, o) {
    W = {
      P, w: o.w || 480, x0: 10, x1: (o.w || 480) - 10, y0: G.GY0 + 8, y1: G.GY1,
      ents: [], boss: null, props: [], projs: [], zones: [], parts: [], texts: [], slashes: [],
      cam: 0, shake: 0, banner: o.banner || null, base: o.base, region: o.region,
      stats: o.stats, marksMult: o.marksMult || 1, haste: o.haste || 1, hpFloor: o.hpFloor || false,
      marksGained: 0, loot: o.loot, over: null, usedPotion: false, shrink: null, seed: o.seed || 1,
    };
    // V17: sổ máu mất theo nguồn, dùng chung cả lượt (gắn vào o.stats của ải, mọi phòng cùng một sổ). Xem G.hurtPlayer.
    const book = o.stats || {};
    W.hurtBy = book.hurtBy || (book.hurtBy = {});
    W.lastHurt = book.lastHurt || null;
    P.x = 50; P.y = (W.y0 + W.y1) / 2;
    P.inv = 0.6;
    P.spearOut = null; P.slideT = 0; // giáo Phi Thương đang bay ở phòng cũ thì coi như đã về tay
    if (G.outfit && P.oSp) G.outfit.onRoom(P); // khiên đầu phòng của trang phục
    return W;
  };
  G.setWorld = (w) => { W = w; };

  function st0() {
    return { fire: 0, fireDmg: 0, poisonN: 0, poisonT: 0, poisonDmg: 0, iceN: 0, iceT: 0, frozen: 0, freezeImm: 0, stun: 0, root: 0, comboCd: 0, tick: 0, last: null, ch: {} }; // ch: hệ nào do chưởng gây (js/chuong.js)
  }
  G.st0 = st0;
  // ---------- hệ của dấu ấn linh khí theo hiệu ứng ĐANG THẤY trên quái (phiên linh-khi-theo-thay) ----------
  // Chủ dự án chọn: quái đang cháy thì cộng Lửa (kể cả lửa do bùa gây) dù vũ khí là Độc. Quái dính nhiều hệ cùng lúc thì lấy hệ
  // NỔI NHẤT: ngọn lửa đang cháy và khối băng (đóng băng) là hiệu ứng to, điểm 1..2 theo phần thời gian còn lại; bọt độc và
  // hạt băng làm chậm là hiệu ứng nhỏ, điểm 0..1 theo số tầng (5 tầng = 1). Hoà điểm thì hệ gây sau cùng (st.last) như cũ.
  // `on` là các hệ được tính (G.kill bỏ hiệu ứng do chưởng gây: e.st.ch). Cờ G.LK_THEO_THAY = false (hay ?lkthay=0): luật cũ
  // "hệ gây sau cùng nếu còn hiệu lực".
  if (G.LK_THEO_THAY === undefined) { let tat = false; try { tat = typeof location !== 'undefined' && /[?&]lkthay=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.LK_THEO_THAY = !tat; }
  G.lkHeThay = function (st, on) {
    if (G.LK_THEO_THAY === false) return st.last && on[st.last] ? st.last : on.fire ? 'fire' : on.poison ? 'poison' : 'ice';
    const d = (W && W.P && W.P.statusDur) || 1;
    const sc = {
      fire: on.fire ? 1 + Math.min(1, st.fire / (3 * d)) : -1,
      ice: on.ice ? (st.frozen > 0 ? 1 + Math.min(1, st.frozen / (1.5 * d)) : Math.min(1, (st.iceN || 0) / 5)) : -1,
      poison: on.poison ? Math.min(1, (st.poisonN || 0) / 5) : -1,
    };
    let best = null;
    for (const k of ['fire', 'ice', 'poison']) if (sc[k] >= 0 && (best == null || sc[k] > sc[best] + 1e-6)) best = k;
    if (best == null) return 'ice';
    if (st.last && sc[st.last] >= 0 && Math.abs(sc[st.last] - sc[best]) <= 1e-6) return st.last;
    return best;
  };
  G.hasStatus = (e) => e.st.fire > 0 || e.st.poisonN > 0 || e.st.iceN > 0 || e.st.frozen > 0;

  G.spawnEnemy = function (role, x, y, o) {
    o = o || {};
    const R = G.ROLES[role] || G.ROLES.rusher;
    const reg = G.REGIONS[W.region];
    const e = {
      role, x, y, r: R.r, hr: role === 'elite' ? 9 : 6, face: -1, t: G.rnd() * 5,
      maxhp: W.base.hp * R.hp * (o.hpMult || 1), dmg: W.base.dmg * R.dmg * (o.dmgMult || 1), speed: R.speed * W.haste,
      armor: R.armor || 0, marks: o.add ? 0 : R.marks, skin: reg.skin, el: role === 'elite' ? o.el || reg.el : o.el || null,
      st: st0(), flash: 0, wind: 0, cd: G.rr(0.4, 1.4), state: 'move', moving: false, scale: role === 'elite' ? 1.5 : 1,
      h: role === 'swarm' ? 10 : role === 'nimble' || role === 'shield' ? 15 : 24, resist: o.resist || null, slamCd: 4,
      add: !!o.add,
    };
    e.hp = e.maxhp;
    W.ents.push(e);
    if (G.mobInit) G.mobInit(e, o); // hình mới và cơ chế theo vai (js/mobs.js)
    return e;
  };

  // ---------- hiệu ứng nhỏ ----------
  G.burst = function (x, y, col, n, sp) {
    FX('burst', x, y, col, n, sp);
  };
  G.inZone = function (z, e, pad) {
    if (z.shape !== 'circle' && z.shape !== 'rect' && G.inShape) return G.inShape(z, e, pad || 0); // đường thẳng, quạt, vành khăn (js/mobs.js)
    if (z.shape === 'circle') {
      const dx = (e.x - z.x) / z.r, dy = (e.y - z.y) / (z.r * (G.ZK || 0.6));
      return dx * dx + dy * dy <= 1;
    }
    return e.x >= z.x && e.x <= z.x + z.w && e.y >= z.y && e.y <= z.y + z.h;
  };
  G.zoneCircle = function (x, y, r, t, dmg, el, extra) {
    const z = Object.assign({ shape: 'circle', x, y, r, t, t0: t, dmg, el: el || null, life: 0.12 }, extra || {});
    W.zones.push(z);
    return z;
  };
  G.zoneRect = function (x, y, w, h, t, dmg, el, extra) {
    const z = Object.assign({ shape: 'rect', x, y, w, h, t, t0: t, dmg, el: el || null, life: 0.12 }, extra || {});
    W.zones.push(z);
    return z;
  };

  // ---------- sát thương ----------
  G.targets = function () {
    const a = W.ents.filter((e) => !e.dead && !e.hidden && !e.ghost); // đang lặn dưới đất hay đang nổ thì không nhắm được
    if (W.boss && !W.boss.dead && !W.boss.hidden) a.push(W.boss);
    return a;
  };
  G.damage = function (t, amt, o) {
    o = o || {};
    if (t.dead || t.hidden || t.ghost || amt <= 0) return 0;
    if (t.invuln > 0) return 0; // trùm đang ra mắt hay đang chuyển pha
    let m = 1;
    m *= 1 + 0.04 * t.st.poisonN;
    const arm = G.mobArmor ? G.mobArmor(t, o) : t.armor; // giáp quái mới chỉ che phía trước
    // Ăn mòn của Độc chưởng (js/chuong.js): quái đang dính độc của chưởng mất thêm giáp và nhận thêm sát thương
    const corr = t.st.chCorr && t.st.poisonN > 0 && t.st.ch && t.st.ch.poison ? t.st.chCorr : 0;
    if (corr) m *= 1 + 0.04 * corr;
    if (arm) m *= 1 - Math.max(0, arm - 0.09 * t.st.poisonN - 0.06 * corr);
    if (t.resist && o.el === t.resist) m *= 0.75;
    if (t.isBoss) {
      for (const l of t.layers) {
        if (l.type === 'resist' && o.el === l.el) m *= 1 - l.pct;
      }
      // Phiên cân bằng (mục 8): đánh bằng hệ khắc chế +50% (trước +30%), để đổi hệ khi trùm kháng thật sự đáng.
      if (o.el && t.weak.includes(o.el)) { m *= 1.5; t.weakHits++; }
      // V13: "Chống đánh xa" giảm còn 50% (trước 30%) và có báo: số sát thương xám (fx.js tự làm xám khi hệ số < 0,8)
      // kèm chữ "Xa quá!" trên đầu trùm lần đầu bị giảm, nhắc lại tối đa mỗi 6 giây.
      // Phiên cân bằng (mục 7): 50% → 60% (cung làm vũ khí chính bớt bị phạt), chữ báo nay là "Xa quá! Lại gần".
      if (o.ranged && t.layers.some((l) => l.type === 'antiRanged') && t.rangedShield && t.rangedShield(W.P)) {
        m *= 0.6;
        if (!(G.time - (t.farHintT == null ? -99 : t.farHintT) < 6)) {
          t.farHintT = G.time;
          FX('farHint', t);
        }
      }
      if (t.exposed > 0) m *= 1.5;
      if (t.onHit) t.onHit(o);
    }
    if (o.fromPlayer !== false && o.el && G.outfit) m *= G.outfit.elMult(W.P, o.el); // đủ bộ trang phục một hệ: tăng sát thương hệ đó
    if (o.fromPlayer !== false && !o.ch) { // trùm chỉ học theo vũ khí (chưởng không tính, js/chuong.js)
      W.stats.el[o.el || 'none'] += amt;
      if (o.src === 'hit') { if (o.ranged) W.stats.ranged += amt; else W.stats.melee += amt; }
    }
    const d = amt * m;
    t.hp -= d;
    t.flash = 0.07;
    t.lastEl = o.el || null;
    if (!G.noRender) FX('dmg', t, d, { crit: o.crit, el: o.el, m, dot: o.src === 'dot' });
    if (t.hp <= 0) G.kill(t, o);
    return d;
  };

  G.applyStatus = function (t, el, src, stacks) {
    if (t.dead || t.hidden) return;
    const st = t.st, P = W.P;
    const dur = P.statusDur;
    stacks = stacks || 1;
    // Hiệu ứng do chưởng gây (G.chSrc, js/chuong.js) được đánh dấu st.ch[hệ]: không kết hợp hệ với vũ khí (không Nổ khói, Sốc nhiệt),
    // không tính hệ cho dấu ấn linh khí. Vũ khí gây lại hệ đó thì hiệu ứng thành của vũ khí.
    const chOn = !!G.chSrc, chs = st.ch || (st.ch = {});
    const has = { fire: st.fire > 0 && !chs.fire, poison: st.poisonN > 0 && !chs.poison, ice: (st.iceN > 0 || st.frozen > 0) && !chs.ice };
    if (st.comboCd <= 0 && !chOn) {
      if ((el === 'fire' && has.poison) || (el === 'poison' && has.fire)) {
        st.comboCd = 0.6;
        // Gây sát thương trước rồi mới tiêu độc, để kết liễu bằng Nổ khói vẫn được tính dấu ấn.
        for (const o of G.targets()) if (o !== t && Math.hypot(o.x - t.x, (o.y - t.y) * 1.6) < 42) G.damage(o, 1.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        G.damage(t, 1.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        st.poisonN = 0; st.poisonDmg = 0; st.poisonT = 0;
        FX('combo', 'smoke', t);
        G.sfx('boom');
        if (el === 'poison') return;
      } else if ((el === 'fire' && has.ice) || (el === 'ice' && has.fire)) {
        st.comboCd = 0.6;
        G.damage(t, 2.5 * src * P.comboMult, { el: 'fire', src: 'combo' });
        st.fire = 0; st.fireDmg = 0; st.iceN = 0; st.iceT = 0; st.frozen = Math.min(st.frozen, 0);
        FX('combo', 'shock', t);
        G.sfx('boom', 1.6);
        return;
      }
    }
    if (t.dead) return;
    const n = (st.fire > 0 ? 1 : 0) + (st.poisonN > 0 ? 1 : 0) + (st.iceN > 0 || st.frozen > 0 ? 1 : 0);
    const mine = el === 'fire' ? st.fire > 0 : el === 'poison' ? st.poisonN > 0 : st.iceN > 0 || st.frozen > 0;
    if (!mine && n >= 2) return;
    st.last = el;
    chs[el] = chOn;
    if (el === 'fire') {
      st.fire = 3 * dur;
      st.fireDmg = Math.max(st.fireDmg, src * 0.2);
      G.sfx('fire');
    } else if (el === 'poison') {
      st.poisonN = Math.min(5, st.poisonN + stacks);
      st.poisonT = 5 * dur;
      st.poisonDmg = Math.max(st.poisonDmg, src * 0.06);
      G.sfx('poison');
    } else {
      st.iceT = 4 * dur;
      st.iceN += stacks;
      if (st.freezeImm > 0) st.iceN = Math.min(4, st.iceN);
      else if (st.iceN >= 5) {
        st.iceN = 0;
        st.freezeImm = 5;
        if (t.isBoss) st.stun = Math.max(st.stun, 0.5); else st.frozen = 1.5 * dur;
        FX('freeze', t);
      }
      G.sfx('ice');
    }
    FX('status', t, el);
  };

  function tickStatus(e, dt) {
    const st = e.st;
    st.comboCd -= dt; st.freezeImm -= dt; st.stun -= dt; st.root -= dt; st.frozen -= dt;
    st.tick -= dt;
    const tick = st.tick <= 0;
    if (tick) st.tick = 0.5;
    if (st.fire > 0) {
      st.fire -= dt;
      if (tick) G.damage(e, st.fireDmg * 0.5, { el: 'fire', src: 'dot' });
      if (st.fire <= 0) st.fireDmg = 0;
    }
    if (!e.dead && st.poisonN > 0) {
      st.poisonT -= dt * (st.iceN > 0 ? 0.5 : 1);
      if (tick) G.damage(e, st.poisonDmg * st.poisonN * 0.5, { el: 'poison', src: 'dot' });
      if (st.poisonT <= 0) { st.poisonN = 0; st.poisonDmg = 0; }
    }
    if (st.iceN > 0) {
      st.iceT -= dt;
      if (st.iceT <= 0) st.iceN = 0;
    }
  }
  G.tickStatus = tickStatus;
  const slowOf = (e) => Math.max(0.4, 1 - 0.15 * e.st.iceN) * (G.boSk ? G.boSk.cham(e) : 1); // × chậm của skill bộ Biển "Thuỷ triều"

  G.kill = function (e, o) {
    if (e.dead) return;
    e.dead = true;
    if (G.mobOnKill) G.mobOnKill(e); // tinh anh nổ khi chết, đồng hồ màn chết của trùm (js/mobs.js)
    const P = W.P, w = (o && o.w) || curW(P);
    G.sfx('die');
    FX('death', e, o);
    if (e.illusion) return;
    if (w) w.kills++;
    const L = G.LINHKHI, big = e.role === 'elite' || e.isBoss, regEl = G.REGIONS[W.region] ? G.REGIONS[W.region].el : 'fire';
    // Linh khí chỉ đến từ vũ khí: hiệu ứng do chưởng gây (e.st.ch) không tính hệ, quái thường bị chưởng kết liễu không cho dấu ấn.
    // Tinh anh, trùm gục vì chưởng vẫn cho phần thưởng linh khí của nó cho vũ khí đang cầm (hệ theo hiệu ứng của vũ khí, không thì của vùng).
    const chs = e.st.ch || {};
    const on = { fire: e.st.fire > 0 && !chs.fire, poison: e.st.poisonN > 0 && !chs.poison, ice: (e.st.iceN > 0 || e.st.frozen > 0) && !chs.ice };
    const hasW = on.fire || on.poison || on.ice;
    if ((hasW && !(o && o.ch)) || (big && L)) {
      // Hệ của dấu ấn: hiệu ứng gây sau cùng nếu nó còn hiệu lực, không thì hiệu ứng đang có; tinh anh, trùm không dính gì thì hệ của vùng.
      // Phiên linh-khi-theo-thay: hệ theo hiệu ứng ĐANG THẤY trên quái (G.lkHeThay); cờ tắt ?lkthay=0 về luật cũ ở trên.
      const el = !hasW ? regEl : G.lkHeThay(e.st, on);
      let n = big && L ? (e.isBoss ? (e.kind === 'mini' ? L.mini : L.boss) : L.elite) : e.marks == null ? 1 : e.marks;
      // Ải hướng dẫn 1-1 (mục 9): phòng đầu dạy chậu than → dấu ấn Lửa, nên ở ải này dấu ấn Lửa x2, Độc chỉ x0,2 (trước kiếm
      // ra khỏi ải với +5 Lửa, +38 Độc). Tinh anh, trùm không dính hệ thì cho Lửa thay vì Độc của Rừng già.
      const run = G.getRun && G.getRun();
      let elx = el;
      if (run && run.tut && run.W === W) { if (!hasW) elx = 'fire'; n *= elx === 'fire' ? 2 : elx === 'poison' ? 0.2 : 1; }
      G.addMarks(w, elx, n * P.markMult * W.marksMult);
      // Vũ khí thứ hai (mục 7) nhận một nửa số dấu ấn, vào hệ chính của nó; chưa khoá hệ thì vào hệ nó đang nhiều nhất, còn trắng
      // thì vào hệ KHẮC CHẾ hệ vừa nhận (G.WEAK): trùm kháng hệ của vũ khí chính thì vũ khí thứ hai sẵn hệ khắc chế để đổi sang.
      // Hệ thống mới: linh khí vào túi chung (js/vk_moi.js bọc G.addMarks) → vũ khí thứ hai không nhận thêm phần nào.
      const w2 = !G.HE_MOI && P.weapons && P.weapons.find((x) => x && x !== w);
      if (w2 && G.LK_PHU > 0) {
        let e2 = w2.branch;
        if (!e2) { for (const x of G.ELS) if ((w2.marks[x] || 0) > 0 && (!e2 || w2.marks[x] > w2.marks[e2])) e2 = x; }
        // Vũ khí thứ hai cộng lặng lẽ (không ghi đè hạt và chữ bay "+N <hệ>" của vũ khí đang cầm); cờ tắt thì như cũ.
      G.addMarks(w2, e2 || G.WEAK[elx], n * P.markMult * W.marksMult * G.LK_PHU, G.LK_THEO_THAY !== false);
      }
      FX('markOrbs', e);
    }
    if (P.charm === 'c_spirit' && G.hasStatus(e)) P.mana = Math.min(P.maxmana, P.mana + 5);
    // quái thường thỉnh thoảng rơi một viên linh khí của vùng: phải nhặt mới có (js/do_roi.js gọi onPick)
    if (!big && L && !e.add && G.doRoi && G.rnd() < L.drop) {
      const n = Math.round(L.orb * W.marksMult);
      G.doRoi.tha(W, e.x, e.y, { kind: 'linhkhi', el: regEl, s: G.t('Linh khí {0}', G.EL[regEl].name), onPick: () => { const P2 = W.P, cw = curW(P2); if (cw) { G.addMarks(cw, regEl, n * P2.markMult); G.flashMarks && G.flashMarks(); } } });
    }
    if (G.moves) G.moves.onKill(e, o, w); // đặc trưng hệ khi quái chết: Nổ lan, Lây độc (chỉ ở Thức tỉnh)
    if (G.chuong) G.chuong.onKill(e); // Lây độc của Độc chưởng, Băng vỡ của Băng chưởng
    if (G.outfit) G.outfit.onKill(P, e); // bùa có hệ: quái gục gần bé nổ nhỏ
    P.mana = Math.min(P.maxmana, P.mana + 5);
    if (P.charm === 'c_leech') P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.02);
    if (!e.add) {
      W.loot.kills++;
      if (e.role === 'elite' && G.rnd() < 0.25) W.loot.charm = true;
      if (e.role === 'elite' && G.onEliteDown) G.onEliteDown(e); // tinh anh có thể rơi vũ khí (js/stage.js)
      if (G.onMobDown) G.onMobDown(e); // quái, tinh anh, trùm có thể rơi trang phục (js/stage.js)
    }
    if (e.isBoss) {
      W.loot.bossDown = true;
      W.loot.finalEl = (o && o.el) || null;
      if (w) w.bossKills[e.name] = (w.bossKills[e.name] || 0) + 1;
      for (const x of W.ents) if (!x.dead) G.kill(x, {});
      W.zones.length = 0;
      W.projs.length = 0;
      W.shake = 0.6;
    }
  };

  // ---------- người chơi ra đòn ----------
  function playerHit(e, mult, o) {
    const P = W.P, w = o.w;
    let d = G.pDamage(P, w) * mult;
    let crit = false;
    if (G.rnd() < P.crit + (G.wHas(w, 'crit') ? 0.1 : 0)) { d *= 2; crit = true; }
    const bk = G.boSk ? G.boSk.danh(P, e, o, crit) : null; // skill bộ: Bóng lướt, Ám sát (Ninja), Khí thế (Lâu đài) — js/bo_skill.js
    if (bk) { d *= bk.k; if (bk.crit && !crit) { d *= 2; crit = true; } }
    // dòng mạnh riêng của bậc Vàng
    if (w.power === 'boss' && (e.isBoss || e.role === 'elite')) d *= 1.2;
    if (w.power === 'first' && e.hp >= e.maxhp) d *= 2;
    if (G.hasStatus(e)) d *= P.statusBonus;
    if (P.charm === 'c_ember' && e.st.fire > 0) d *= 1.15;
    if ((P.ccMult || 1) > 1 && (e.st.frozen > 0 || e.st.stun > 0 || e.st.root > 0 || e.exposed > 0)) d *= P.ccMult;
    if (P.boost) { d *= 1.6; P.boost = false; }
    const el = G.activeEl(P, w);
    G.damage(e, d, { el, ranged: o.ranged, src: 'hit', w, crit });
    if (G.boSk) G.boSk.trung(P, e, o); // skill bộ Rừng "Bẫy dây leo": đòn giữ rồi thả (o.manh) trói chân
    if (!G.noRender) FX('hit', e, { el, type: w.type, ranged: o.ranged, crit, dead: e.dead, heavy: o.heavy, rain: o.rain, dir: o.dir || (e.x >= P.x ? 1 : -1) });
    if (G.moves) G.moves.onHit(e, d, el, o); // luật riêng của hệ khi đòn trúng (js/moves.js)
    if (G.mobOnHit) G.mobOnHit(e, d, o); // quái gai phản đòn, giáp vỡ (js/mobs.js)
    const T = G.WTYPES[w.type];
    if (T.stagger && !e.isBoss && !e.dead) e.st.stun = Math.max(e.st.stun, T.stagger);
    if (o.stun && !e.dead) e.st.stun = Math.max(e.st.stun, e.isBoss ? o.stun * 0.4 : o.stun);
    if (el && !e.dead) {
      const stage = G.wStage(w);
      const coat = P.coats[w.id] && P.coats[w.id].t > 0;
      let chance = coat ? 1 : G.PROC[stage];
      if (w.power === 'proc') chance += 0.25;
      // V46: tỉ lệ gây hệ tính theo nhịp vũ khí, để vũ khí chậm không tích dấu ấn chậm hơn hẳn (kiếm 0,36 giây là chuẩn):
      // búa x2,2, cung x1,4, giáo x1,2, kiếm giữ nguyên; tối đa 100%.
      chance = Math.min(1, chance * Math.max(1, (T.cd || 0.36) / 0.36));
      if (P.firstHit && P.swapProc) chance = 1;
      if (G.rnd() < chance) G.applyStatus(e, el, d, 1);
    }
    P.firstHit = false;
  }
  function hitProps(x0, x1, y, depth) {
    for (const pr of W.props) {
      if (pr.env && !pr.used && pr.x >= x0 && pr.x <= x1 && Math.abs(pr.y - y) <= depth) G.triggerProp(pr);
    }
  }
  G.triggerProp = function (pr) {
    const P = W.P, w = curW(P);
    pr.used = true;
    pr.dead = true;
    const el = pr.type === 'brazier' ? 'fire' : pr.type === 'mushroom' ? 'poison' : 'ice';
    const src = G.pDamage(P, w);
    FX('propBlast', pr, el);
    G.sfx('boom', 1.3);
    for (const t of G.targets()) {
      if (Math.hypot(t.x - pr.x, (t.y - pr.y) / G.ZK) < 52) {
        G.damage(t, src * 0.8, { el, src: 'prop' });
        G.applyStatus(t, el, src, el === 'fire' ? 1 : 3);
      }
    }
  };
  function meleeBox(P, reach, depth, mult, o) {
    let hit = 0;
    const f = P.face;
    for (const e of G.targets()) {
      const dx = (e.x - P.x) * f;
      if (dx > -8 - e.r * 0.5 && dx < reach + e.r && Math.abs(e.y - P.y) <= depth / 2 + e.hr) {
        playerHit(e, mult, o);
        hit++;
      }
    }
    hitProps(Math.min(P.x, P.x + f * reach) - 4, Math.max(P.x, P.x + f * reach) + 4, P.y, depth / 2 + 6);
    return hit;
  }
  function nearest(P, maxD, maxDy, frontOnly) {
    let best = null, bd = 1e9;
    for (const e of G.targets()) {
      const dx = e.x - P.x, dy = e.y - P.y;
      if (Math.abs(dy) > maxDy + e.hr) continue;
      if (frontOnly && dx * P.face < -6) continue;
      const d = Math.abs(dx) - e.r + Math.abs(dy) * 0.5;
      if (d < maxD && d < bd) { bd = d; best = e; }
    }
    return best;
  }
  G.nearest = nearest;
  // Đoạn tên bay (px,py)->(x,y) có cắt vùng trúng hình bầu dục của quái e không. Trả về vị trí cắt dọc đoạn (0..1), không cắt thì -1.
  function segHit(o, e) {
    const B = G.MOVES && G.MOVES.bow, kx = 1 / (e.r + (B ? B.hitX : 4)), ky = 1 / (e.hr + (B ? B.hitY : 7));
    const ax = (o.px - e.x) * kx, ay = (o.py - e.y) * ky, dx = (o.x - o.px) * kx, dy = (o.y - o.py) * ky;
    const L = dx * dx + dy * dy;
    const t = L > 0 ? G.clamp(-(ax * dx + ay * dy) / L, 0, 1) : 0;
    const qx = ax + dx * t, qy = ay + dy * t;
    return qx * qx + qy * qy <= 1 ? t : -1;
  }

  function startAttack(P) {
    const w = curW(P), T = G.WTYPES[w.type];
    const reach = T.ranged ? 320 : T.reach * (G.wHas(w, 'reach') ? 1.15 : 1);
    const tgt = nearest(P, reach + 34, T.ranged ? 44 : 22, false);
    if (tgt && Math.abs(tgt.x - P.x) > 3) P.face = tgt.x > P.x ? 1 : -1;
    P.comboI = G.time - P.lastAtk < T.cd + 0.35 ? (P.comboI + 1) % 3 : 0;
    P.lastAtk = G.time;
    P.atkDur = T.cd; P.atkT = T.cd; P.cdT = T.cd; P.hitDone = false; P.hitAt = null;
    G.sfx('swing', w.type === 'hammer' ? 0.6 : 1);
  }
  function doHit(P) {
    const w = curW(P), T = G.WTYPES[w.type];
    P.hitDone = true;
    const el = G.activeEl(P, w);
    const col = el ? G.EL[el].col : '#f1ead9';
    const third = P.comboI === 2;
    let hits = 0;
    if (T.ranged) {
      const tgt = nearest(P, 330, 44, true);
      let vy = 0;
      if (tgt) vy = G.clamp(((tgt.y - P.y) / Math.max(20, Math.abs(tgt.x - P.x))) * 270, -90, 90);
      W.projs.push({ team: 'player', kind: 'arrow', x: P.x + P.face * 8, y: P.y, vx: P.face * 270, vy, t: 1.3, w, mult: third ? 1.6 : 1, pierce: third ? 3 : 0, big: third, col, seen: [] });
    } else {
      const reach = T.reach * (G.wHas(w, 'reach') ? 1.15 : 1);
      hits = meleeBox(P, reach, T.depth, w.type === 'sword' && third ? 1.5 : 1, { w, heavy: third });
      if (!G.noRender) FX('swing', P, { type: w.type, combo: P.comboI, reach, el, stage: G.wStage(w) });
      if (w.type === 'hammer') W.shake = Math.max(W.shake, 0.08);
    }
    if (hits > 0) {
      P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (G.wHas(w, 'mana') ? 1 : 0));
      G.sfx('hit');
    }
  }
  // Các hàm ra đòn dùng chung cho js/moves.js (lối đánh riêng của từng vũ khí).
  G.cb = { playerHit, meleeBox, hitProps, nearest, startAttack, doHit };
  function special(P) {
    const w = curW(P);
    P.mana -= P.specCost;
    P.specT = 0.35;
    P.specCd = 0.8 * (P.cdMul || 1);
    const el = G.activeEl(P, w);
    G.sfx('boom', 1.8);
    if (w.type !== 'bow' && G.moves && G.moves.cast) {
      // Tám hướng và chiêu riêng: kiếm Trảm Nguyệt, giáo Phi Thương, búa Địa Chấn (luật trong js/moves.js, đều theo hướng nhắm)
      G.moves.cast(P, w);
    } else {
      // Sửa góp ý 1: mưa tên đặt tâm vào quái (hoặc cụm quái) gần nhất theo mọi hướng, đón đầu nhẹ quái đang chạy.
      // Không có quái thì mưa rơi phía trước theo hướng đang đi hoặc đang nhìn, luôn nằm trong sàn phòng.
      const sp = G.moves ? G.moves.bowSpot(P, 330, 40, 0.25) : null;
      let x, y;
      if (sp) { x = sp.x; y = sp.y; }
      else {
        const ux = P.moving && P.ldx != null ? P.ldx : P.face, uy = P.moving && P.ldy != null ? P.ldy : 0, L = Math.min(110, (W.x1 - W.x0) * 0.4);
        x = P.x + ux * L; y = P.y + uy * L * 0.6;
      }
      x = G.clamp(x, W.x0 + 20, W.x1 - 20); y = G.clamp(y, W.y0, W.y1); // tâm mưa luôn trong sàn (vùng mưa rộng 40 vẫn phủ quái sát tường)
      W.zones.push({ shape: 'circle', x, y, r: 40, t: 0, pool: true, team: 'player', rain: true, life: 0.95, tick: 0, w, el });
    }
    if (G.moves) G.moves.special(P, w); // phần riêng theo hệ của đòn đặc biệt
  }
  // Nút kỹ năng riêng của em bé nay là nút Chưởng (js/chuong.js). Kỹ năng cũ (Nung, Đặt bẫy, Bình thuốc, Gồng) thành nét riêng của chưởng.
  G.addCoat = function (el, t) {
    const P = W.P;
    for (const w of P.weapons) P.coats[w.id] = { el, t };
  };

  // V17: ghi máu bé mất theo nguồn trong lượt, để bảng thua (stage.js, phiên 2C) nói "mất máu nhiều nhất vì gì, gục vì đòn nào".
  //   W.hurtBy[key] = { key, name, amt, n, boss }  (cộng dồn cả lượt; amt là máu thật sự mất)
  //     key: vai quái ('archer', 'spiky', 'elite'...; name là tên vai ở G.ROLES), 'gaiPhan' (gai phản đòn),
  //          'trum' (đòn trực tiếp/đạn của trùm), 'trumVung' (vùng đỏ, vũng, sóng, tường nước của trùm),
  //          'vung' (vùng, vũng không rõ chủ ngoài phòng trùm), 'chay' / 'doc' (máu mất mỗi nhịp khi bé đang cháy / trúng độc).
  //   W.lastHurt = { key, name, skill, boss, amt, el, t, fatal }  đòn cuối cùng làm bé mất máu (fatal: đòn này hạ bé).
  //     skill: tên chiêu trùm đang ra (b.skillName, do boss.js đặt; chưa có thì null). boss: tên trùm.
  let hurtKind = null; // 'vung' khi vết thương đến từ vùng/vũng/sóng/tường (đặt quanh lời gọi ở updateWorld)
  function hurtKey(src, melee) {
    const b = src && src.isBoss ? src : !src && W.boss && !W.boss.dead ? W.boss : null;
    if (b) {
      const zone = hurtKind === 'vung' && !melee; // vùng đỏ cận chiến (z.melee) tính là đòn trực tiếp
      return { key: zone ? 'trumVung' : 'trum', name: zone ? 'Vùng đỏ của trùm' : 'Đòn của trùm', boss: b.name || null, skill: b.skillName || null };
    }
    if (src && src.role) {
      if (src.spikeUp > 0 && !melee && !hurtKind) return { key: 'gaiPhan', name: 'Gai phản đòn' };
      const R = G.ROLES && G.ROLES[src.role];
      return { key: src.role, name: R ? R.name : 'Quái' };
    }
    return { key: 'vung', name: 'Vùng nguy hiểm' };
  }
  function noteHurt(info, lost, el) {
    if (!(lost > 0) || !W.hurtBy) return;
    const P = W.P, rec = W.hurtBy[info.key] || (W.hurtBy[info.key] = { key: info.key, name: info.name, amt: 0, n: 0, boss: null });
    rec.amt += lost; rec.n++;
    if (info.boss) rec.boss = info.boss;
    W.lastHurt = { key: info.key, name: info.name, skill: info.skill || null, boss: info.boss || null, amt: lost, el: el || null, t: G.time, fatal: P.hp <= 0 };
    if (W.stats) W.stats.lastHurt = W.lastHurt;
  }
  G.hurtPlayer = function (amt, el, src, melee) {
    const P = W.P;
    if (G.boSk && !P.dead && !W.over && !W.safe) G.boSk.phanDon(P, amt, src); // skill bộ Lâu đài "Phản đòn": vừa lộn thì phản đòn (js/bo_skill.js)
    if (P.inv > 0 || P.dead || W.over || W.safe) return false; // W.safe: đã hạ trùm, đang đi dạo chờ vào cổng
    if (G.outfit && G.outfit.block(P)) return false; // khiên của trang phục (cánh, khiên đầu phòng) chặn đòn này
    if (G.boSk && G.boSk.chan(P)) return false; // skill bộ Biển "Khiên nước" chặn trọn đòn này (js/bo_skill.js)
    const raw = amt;
    amt *= 1 - Math.min(0.75, P.dr);
    if (G.boSk) amt *= G.boSk.nhan(P); // skill bộ Lâu đài "Giáp bạc"
    if (P.gongT > 0) amt *= 0.4;
    const hp0 = P.hp;
    P.hp -= amt;
    if (src && src.trait === 'hut' && !src.dead) src.hp = Math.min(src.maxhp, src.hp + amt * 1.5); // tinh anh hút máu
    if (W.hpFloor && P.hp < 1) P.hp = 1;
    P.inv = 0.55; P.hurtT = 0.2;
    W.shake = Math.max(W.shake, 0.18);
    G.sfx('hurt');
    if (!G.noRender) FX('hurt', P, amt, el, P.gongT > 0);
    if (P.reflect > 0 && melee && src && !src.dead) G.damage(src, raw * P.reflect, { src: 'reflect', fromPlayer: false });
    if (G.outfit) G.outfit.onHurt(P, src); // mũ có hệ: quái đánh trúng bé bị cháy, độc hoặc chậm
    if (el) {
      const k = 1 - P.resist[el];
      if (el === 'fire') { P.st.fire = 3 * k; P.dot = raw * 0.05; } // tổng cộng thêm khoảng 30% nếu cháy đủ 3 giây
      if (el === 'poison') { P.st.poison = 4 * k; P.dot = raw * 0.035; }
      if (el === 'ice') P.st.ice = 2.5 * k;
    }
    if (P.hp <= 0) { P.dead = true; W.over = 'dead'; }
    noteHurt(hurtKey(src, melee), hp0 - Math.max(0, P.hp), el); // V17
    if (G.boSk) G.boSk.biDanh(P, src); // skill bộ: Gai độc (Rừng), Khí thế (Lâu đài)
    return true;
  };

  const DODGE_BUF = 0.15; // V7: bấm Né sớm bấy nhiêu giây vẫn được nhớ
  G.updatePlayer = function (P, inp, dt) {
    P.t += dt;
    for (const k of ['atkT', 'cdT', 'dodgeCd', 'inv', 'hurtT', 'skillCd', 'specCd', 'swapCd', 'gongT', 'castT', 'specT']) if (P[k] > 0) P[k] -= dt;
    if (P.dead && P.chHold) P.chHold = false;
    if (P.dead) P.deadT += dt;
    for (const id in P.coats) if (P.coats[id].t > 0) P.coats[id].t -= dt;
    if (G.outfit) G.outfit.tick(P, dt); // tác dụng trang phục theo thời gian: vệt khi lộn, vũng mỗi vài giây
    if (G.boSk) G.boSk.tick(P, dt); // skill bộ trang phục Zed theo thời gian (js/bo_skill.js)
    // hiệu ứng trên người chơi
    P.dotT -= dt;
    for (const k of ['fire', 'poison', 'ice']) if (P.st[k] > 0) P.st[k] -= dt;
    if (P.dotT <= 0) {
      P.dotT = 0.5;
      if (!P.dead && (P.st.fire > 0 || P.st.poison > 0)) {
        const hp0 = P.hp;
        P.hp -= P.dot;
        if (P.hp < 1) P.hp = 1;
        const fire = P.st.fire > 0;
        noteHurt({ key: fire ? 'chay' : 'doc', name: fire ? 'Cháy' : 'Trúng độc' }, hp0 - P.hp, fire ? 'fire' : 'poison'); // V17
      }
    }
    if (W.over) { P.moving = false; return; }
    // V7: bộ nhớ nút Né. Bấm Né khi chưa lộn được (Né còn hồi, đang lướt, đang bị đóng băng) thì được nhớ DODGE_BUF giây,
    // lộn ngay khi được phép. Trong lúc lướt hay đóng băng bộ nhớ không trôi (lướt chỉ 0,12–0,16 giây, đóng băng 0,65 giây).
    if (inp.dodgeP) P.dodgeBuf = DODGE_BUF;
    else if (P.dodgeBuf > 0 && !(P.frozenT > 0) && !(P.dashT > 0)) P.dodgeBuf -= dt;
    if (P.frozenT > 0) { P.frozenT -= dt; P.moving = false; P.atkT = 0; return; } // bị nổ băng: đóng băng ngắn
    const w = curW(P);
    const MV = G.moves; // lối đánh riêng của từng vũ khí; thiếu moves.js thì đánh kiểu cũ
    if (MV) MV.input(P, inp, dt);
    const slow = P.st.ice > 0 ? 0.65 : 1;
    let mx = inp.mx, my = inp.my;
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    P.moving = false;

    // V33: Nhát lướt (P.dashNe) huỷ được bằng Né: dừng lướt ngay, xuống dưới lộn như thường
    if (P.dashT > 0 && P.dashNe && P.dodgeBuf > 0 && P.dodgeCd <= 0) { P.dashT = 0; P.atkT = 0; P.dashNe = false; }
    if (P.dashT > 0) {
      // Lướt và lao đi theo hướng thật (P.dashVx, P.dashVy, tám hướng); chạm tường thì dừng ngay, không xuyên tường.
      const dd = Math.min(dt, P.dashT); // khung cuối chỉ đi nốt phần còn lại, để quãng lao đúng bằng con số đã định
      P.dashT -= dt;
      const vx = P.dashVx != null ? P.dashVx : P.dashV, vy = P.dashVy || 0;
      const nx = G.clamp(P.x + vx * dd, W.x0, W.px1 != null ? W.px1 : W.x1), ny = G.clamp(P.y + vy * dd, W.y0, W.y1);
      const K = G.ZK || 0.85, ux = P.dashUx != null ? P.dashUx : vx < 0 ? -1 : 1, uy = P.dashUy || 0;
      let nDash = 0;
      for (const e of G.targets()) {
        if (P.dashHit.includes(e)) continue;
        // đoạn vừa lướt qua, đo trên sàn; nằm ngang thì đúng bằng hộp cũ (lệch dọc 12 + thân quái, hai đầu nới 6 + thân quái)
        const sx = nx - P.x, sy = (ny - P.y) / K, px = e.x - P.x, py = (e.y - P.y) / K, L = sx * sx + sy * sy;
        const t = L > 0 ? G.clamp((px * sx + py * sy) / L, 0, 1) : 0, Ls = Math.sqrt(L);
        const a = px * ux + py * uy, b = Math.abs(py * ux - px * uy);
        if (a >= -e.r - 6 && a <= Ls + e.r + 6 && b <= Math.abs(ux) * (12 + e.hr) / K + Math.abs(uy) * (e.r + 8) && t >= 0) {
          P.dashHit.push(e);
          playerHit(e, P.dashMult, P.dashOpt ? Object.assign({ w }, P.dashOpt) : { w, stun: P.dashStun });
          nDash++;
        }
      }
      if (nDash > 0) G.sfx('hit'); // V10: Nhát lướt, Xốc tới trúng quái thì có tiếng trúng (một lần mỗi khung)
      hitProps(Math.min(P.x, nx) - 4, Math.max(P.x, nx) + 4, (P.y + ny) / 2, 14 + Math.abs(ny - P.y) / 2);
      // Chạm tường thì đòn lao dừng ngay tại đó (không chạy tại chỗ sát tường, không kẹt ở cửa): người chơi điều khiển lại được liền.
      if ((nx !== P.x + vx * dd || ny !== P.y + vy * dd) && P.dashT > 0) { P.dashT = 0; P.atkT = Math.min(P.atkT, 0.05); P.cdT = Math.min(P.cdT, 0.12); }
      P.x = nx; P.y = ny;
      if (P.dashT <= 0 && G.CHAY_DANH_MOI !== false && ml > 0.12) P.moving = true; // chạy + đánh: hết lướt mà còn giữ cần → hàng chạy ngay, không chen khung Đứng
      return;
    }
    if (P.slideT > 0) { // lùi nửa bước khi tung Trảm Nguyệt (không chặn điều khiển)
      const dd = Math.min(dt, P.slideT);
      P.slideT -= dt;
      P.x = G.clamp(P.x + P.slideVx * dd, W.x0, W.px1 != null ? W.px1 : W.x1); P.y = G.clamp(P.y + P.slideVy * dd, W.y0, W.y1);
    }
    if (P.dodgeT > 0) {
      P.dodgeT -= dt;
      const ox = P.x;
      // Phòng vuông nhìn từ trên: lộn dọc đi xa gần bằng lộn ngang (cùng tỉ lệ 0,75 như lúc đi bộ), tám hướng đều đúng góc.
      const dm = P.dodgeMul || 1; // cánh cấp 2 trở lên: lộn xa hơn
      P.x += P.ddx * G.DODGE.vx * dm * dt;
      P.y += P.ddy * G.DODGE.vx * G.DODGE.ky * dm * dt;
      if (P.charm === 'c_mist' || P.set === 'ngu') {
        for (const e of G.targets()) {
          if (!e.misted && e.x >= Math.min(ox, P.x) - e.r && e.x <= Math.max(ox, P.x) + e.r && Math.abs(e.y - P.y) < 14 + e.hr) {
            e.misted = true;
            G.applyStatus(e, 'ice', G.pDamage(P, w), 1);
          }
        }
      }
      if (P.dodgeT <= 0) {
        for (const e of W.ents) e.misted = false;
        if (W.boss) W.boss.misted = false;
        if (P.set === 'ho') P.boost = true;
        if (G.outfit) G.outfit.dodgeEnd(P);
        if (G.boSk) G.boSk.lonXong(P); // skill bộ Ninja "Bóng lướt"
        if (G.CHAY_DANH_MOI !== false && ml > 0.12) P.moving = true; // ưu tiên Né > … > Chạy: hết Né còn giữ cần → chạy ngay (không chen khung Đứng)
      }
    } else {
      const sp = P.speed * slow * (P.atkT > 0 ? (MV && MV.speedAtk ? MV.speedAtk(P) : 0.4) : 1) * (MV ? MV.speed(P) : 1) * (P.chHold ? 0.6 : 1) * (G.CHAY_DANH_MOI !== false && P.specT > 0 && G.CHAY_DANH_CFG ? G.CHAY_DANH_CFG.dacBiet : 1); // đang tích lực chưởng: đi chậm; đòn Đặc biệt khi chạy: chậm nhẹ (js/moves.js CHAY_DANH_CFG)
      if (ml > 0.12) {
        P.x += mx * sp * dt;
        P.y += my * sp * 0.75 * dt;
        P.moving = true;
        // Nhịp chân hàng chạy ảnh AI theo tốc độ đi thật (phiên sửa dáng chạy 12/10): đẩy cần nửa chừng, vừa chạy vừa đánh (đi chậm 0,4)
        // thì chân bước chậm lại thay vì đạp hết nhịp tại chỗ (trượt). Chỉ đổi hình (js/sprite_custom.js SC.chonEmBe đọc o.tc), không đổi tốc độ đi.
        P.chayT = (P.chayT || 0) + dt * G.clamp((sp * Math.min(1, ml)) / (P.speed || sp || 1), 0.55, 1.2);
        P.diTL = (sp * Math.min(1, ml)) / (P.speed || sp || 1); // bộ Zed mới (js/zed_moi.js): tốc độ đi so với tốc độ chạy đầy, chậm thì vẽ hàng ĐI BỘ. Chỉ để vẽ, không đổi tốc độ.
        if (P.atkT <= 0 && Math.abs(mx) > 0.2) P.face = mx > 0 ? 1 : -1;
        { const l1 = Math.hypot(mx, my); P.ldx = mx / l1; P.ldy = my / l1; } // nhớ hướng di chuyển gần nhất, để Né khi không đẩy cần
      }
      // Phiên cân bằng (mục 12): búa có "giáp nhẹ" — đã lấy đà quá nửa phần trước lúc chạm thì Né không huỷ nhát nện: cú lộn chờ
      // (giữ trong bộ nhớ Né) tới lúc búa chạm rồi mới ra, chậm nhiều nhất ~0,14 giây. Trước búa bị huỷ 43-44% nhát.
      const cw0 = curW(P);
      const giapBua = cw0 && cw0.type === 'hammer' && P.atkT > 0 && !P.hitDone && P.hitAt != null && P.atkDur > 0 && 1 - P.atkT / P.atkDur >= 0.5 * P.hitAt;
      if (giapBua && (inp.dodgeP || P.dodgeBuf > 0) && P.dodgeCd <= 0) {
        P.dodgeBuf = Math.max(P.dodgeBuf, 0.12);
      } else if ((inp.dodgeP || P.dodgeBuf > 0) && P.dodgeCd <= 0) {
        P.dodgeBuf = 0;
        P.dodgeT = 0.27; P.dodgeCd = 1 * P.dodgeCdMax; P.inv = Math.max(P.inv, 0.32); // Q13: giữ bất tử 0,32 giây
        // V15 (Q5): Né huỷ nhát đang vung thì không bắt chờ hết thời gian nhát đó (búa trước phải chờ thêm ~0,43 giây sau cú lộn)
        if (P.atkT > 0) P.cdT = Math.min(P.cdT, 0.1);
        P.atkT = 0; P.chHold = false; P.chT = 0; // lộn thì bỏ phần chưởng đang tích
        // Không đẩy cần thì lộn theo hướng di chuyển gần nhất; chưa đi bước nào thì mới theo hướng mặt.
        // Hướng lộn luôn dài bằng 1: đẩy cần nhẹ hay mạnh thì quãng lộn vẫn như nhau.
        if (ml > 0.12) { const l0 = Math.hypot(mx, my); P.ddx = mx / l0; P.ddy = my / l0; } else if (P.ldx != null) { P.ddx = P.ldx; P.ddy = P.ldy; } else { P.ddx = P.face; P.ddy = 0; }
        if (Math.abs(P.ddx) > 0.2) P.face = P.ddx > 0 ? 1 : -1;
        W.stats.dodges++;
        G.sfx('swing', 0.7);
        FX('dodge', P);
        if (G.boSk) G.boSk.lon(P); // skill bộ: Phân thân (Ninja), Sóng dội (Biển), mốc Phản đòn (Lâu đài)
      } else if (inp.specialP && P.mana >= P.specCost && P.specCd <= 0 && !(G.moves && G.moves.canSpecial && !G.moves.canSpecial(P, w))) {
        special(P);
      } else if (G.chuong && G.chuong.input(P, !!inp.skillP, !!(inp.skill || inp.skillP), dt)) {
        // nút Chưởng: bấm là bắn; Hỏa chưởng có Tích lực thì giữ để tích, thả ra mới bắn (js/chuong.js)
      } else if (MV) {
        MV.act(P, inp, dt);
      } else if ((inp.atk || inp.atkP) && P.cdT <= 0) {
        startAttack(P);
      }
      if (inp.swapP && P.weapons.length > 1 && P.swapCd <= 0) {
        P.cur = (P.cur + 1) % P.weapons.length; // xoay vòng (hệ thống mới: 4 vũ khí cố định; cũ: 2 món như trước)
        P.swapCd = G.SWAP_CD || 1.5; // hệ thống mới 0,75 giây (xoay 4 món), cũ 1,5
        // V34: đổi vũ khí giữa đòn thì huỷ sạch đòn đang vung (không gây sát thương bằng vũ khí mới, không chạy tiếp
        // động tác cũ với hình vũ khí mới); combo và phần lấy đà về đầu ở moves.js (M.input thấy đổi vũ khí).
        P.atkT = 0; P.hitDone = true; P.cdT = Math.min(P.cdT, 0.1);
        if (P.mv) P.mv.cur = null;
        P.firstHit = true;
        P.comboI = -1;
        G.sfx('pick');
        if (!G.noRender) FX('swap', P, G.activeEl(P, curW(P)));
      }
      if (inp.potionP && P.potions > 0 && P.hp < P.maxhp && !W.noPotion) {
        P.potions--;
        P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.3);
        W.usedPotion = true;
        FX('potion', P);
        G.sfx('pick', 1.4);
      }
    }
    // V15: đòn chạm khi đi được P.hitAt phần động tác (moves.js đặt; búa nện 0,35), mặc định 0,45 (còn 55% thời gian) như cũ.
    if (P.atkT > 0 && !P.hitDone && P.atkT <= P.atkDur * (1 - (P.hitAt != null ? P.hitAt : 0.45))) { if (MV) MV.hit(P); else doHit(P); }
    P.x = G.clamp(P.x, W.x0, W.px1 != null ? W.px1 : W.x1);
    P.y = G.clamp(P.y, W.y0, W.y1);
    if (P.set === 'moc') {
      P.stillT = P.moving || P.atkT > 0 ? 0 : P.stillT + dt;
      if (P.stillT > 2) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.02 * dt);
    }
  };

  // ---------- quái ----------
  function strike(e, reach, depth, mult) {
    const P = W.P;
    const dx = (P.x - e.x) * e.face;
    if (dx > -6 && dx < reach && Math.abs(P.y - e.y) < depth) G.hurtPlayer(e.dmg * (mult || 1), e.el, e, true);
  }
  function updateEnemy(e, dt) {
    const P = (G.boSk && G.boSk.dich(e)) || W.P; // skill bộ Ninja "Phân thân": quái đi tới / ngắm vào bóng (đòn trúng vẫn đo trên Zed thật)
    e.t += dt;
    if (e.flash > 0) e.flash -= dt;
    tickStatus(e, dt);
    if (e.dead) return;
    if (G.mob && e.art) { G.mob.update(e, dt); return; } // quái mới (js/mobs.js)
    e.moving = false;
    if (e.st.frozen > 0 || e.st.stun > 0) { e.wind = 0; return; }
    const sp = e.speed * slowOf(e) * (e.st.root > 0 ? 0 : 1);
    const dx = P.x - e.x, dy = P.y - e.y, ad = Math.abs(dx);
    e.cd -= dt;
    if (e.wind > 0) {
      e.wind -= dt;
      if (e.wind <= 0) {
        if (e.role === 'archer') {
          const d = Math.max(30, Math.hypot(dx, dy));
          W.projs.push({ team: 'enemy', kind: 'fruit', x: e.x + e.face * 6, y: e.y, vx: (dx / d) * 135, vy: (dy / d) * 135, t: 3, dmg: e.dmg, el: e.el, col: e.el ? G.EL[e.el].col : null });
        } else if (e.role === 'nimble') {
          e.lunge = 0.18; e.lv = e.face * 230;
          FX('lunge', e);
        } else {
          strike(e, 30 + e.r, 12 + e.hr * 0.5, 1);
          FX('enemySwing', e);
        }
        e.cd = e.role === 'archer' ? 2.3 : e.role === 'swarm' ? 1.3 : 1.4;
      }
      return;
    }
    if (e.lunge > 0) {
      e.lunge -= dt;
      e.x += e.lv * dt;
      if (!e.lhit && Math.abs(W.P.x - e.x) < 12 && Math.abs(W.P.y - e.y) < 11) { e.lhit = true; G.hurtPlayer(e.dmg, e.el, e, true); }
      if (e.lunge <= 0) { e.lhit = false; e.retreat = 0.7; }
      return;
    }
    e.face = dx >= 0 ? 1 : -1;
    let tx = P.x, ty = P.y;
    if (e.role === 'archer') {
      const want = Math.min(150, (W.x1 - W.x0) * 0.45); // phòng hẹp thì đứng gần hơn
      tx = P.x - e.face * want;
      tx = G.clamp(tx, W.x0 + 6, W.x1 - 6);
      if (Math.abs(tx - e.x) < 14 && Math.abs(dy) < 60 && e.cd <= 0 && e.x > W.x0 && e.x < W.x1) { e.wind = 0.5; G.sfx('warn', 1.3); return; }
    } else if (e.role === 'nimble') {
      if (e.retreat > 0) {
        e.retreat -= dt;
        tx = e.x - e.face * 60; ty = e.y + (e.t % 2 < 1 ? 30 : -30);
      } else {
        const side = P.face; // vòng ra sau lưng người chơi
        tx = P.x - side * 46;
        if (Math.abs(dy) < 9 && ad < 64 && ad > 20 && e.cd <= 0) { e.wind = 0.4; return; }
      }
    } else {
      if (e.role === 'elite') {
        e.slamCd -= dt;
        if (e.slamCd <= 0 && ad < 140) {
          e.slamCd = 5;
          G.zoneCircle(P.x, P.y, 30, 0.85, e.dmg * 1.3, e.el);
          G.sfx('warn');
          e.wind = 0.5; e.cd = 1.2;
          return;
        }
      }
      tx = P.x - e.face * (12 + e.r);
      // Vào thật gần mới vung đòn, và đòn với xa hơn tầm bắt đầu 14 điểm: lùi chậm thì vẫn trúng, phải bước hẳn ra hoặc lăn né.
      if (ad < 16 + e.r && Math.abs(dy) < 10 && e.cd <= 0) {
        e.wind = e.role === 'swarm' ? 0.3 : e.role === 'shield' ? 0.55 : 0.42;
        return;
      }
    }
    const mdx = tx - e.x, mdy = ty - e.y, md = Math.hypot(mdx, mdy);
    if (md > 2) {
      e.x += (mdx / md) * sp * dt;
      e.y += (mdy / md) * sp * 0.75 * dt;
      e.moving = true;
    }
    e.y = G.clamp(e.y, W.y0, W.y1);
  }
  function separate() {
    const a = W.ents;
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) {
        const A1 = a[i], B = a[j];
        if (A1.dead || B.dead) continue;
        const dx = B.x - A1.x, dy = (B.y - A1.y) * 1.6;
        const d = Math.hypot(dx, dy), min = (A1.r + B.r) * 0.9;
        if (d < min && d > 0.01) {
          const k = ((min - d) / d) * 0.5;
          A1.x -= dx * k; B.x += dx * k;
          A1.y -= (dy * k) / 1.6; B.y += (dy * k) / 1.6;
          // đẩy nhau sát mép sàn thì không được lọt ra ngoài sàn theo chiều dọc (tests/fuzz.py)
          A1.y = G.clamp(A1.y, W.y0, W.y1); B.y = G.clamp(B.y, W.y0, W.y1);
        }
      }
    }
  }

  // ---------- cập nhật mỗi khung ----------
  G.updateWorld = function (dt, inp) {
    const P = W.P;
    // Khựng hình khi đòn trúng: chỉ có khi đang vẽ, nút bấm trong lúc khựng được giữ lại cho khung sau.
    if (!G.noRender && G.fx && G.fx.frozen && G.fx.frozen(dt, inp)) return;
    G.updatePlayer(P, inp, dt);
    for (const e of W.ents) if (!e.dead) updateEnemy(e, dt);
    separate();
    // Quái đã vào phòng thì không được lùi hay bị đẩy ra ngoài mép phòng (ngoài đó người chơi không với tới).
    for (const e of W.ents) {
      if (e.x >= W.x0 && e.x <= W.x1) e.inside = true;
      else if (e.inside) e.x = G.clamp(e.x, W.x0, W.x1);
    }
    if (W.boss && !W.boss.dead) G.updateBoss(W.boss, dt);
    if (G.mob) G.mob.tick(dt); // chuỗi đòn hẹn giờ của quái mới
    // đạn
    for (const o of W.projs) {
      o.t -= dt;
      if (o.homing) {
        const dx = P.x - o.x, dy = P.y - o.y, d = Math.max(1, Math.hypot(dx, dy));
        o.vx += ((dx / d) * o.homing - o.vx) * dt * 2.5;
        o.vy += ((dy / d) * o.homing - o.vy) * dt * 2.5;
      }
      if (o.fresh) o.fresh = false; else { o.px = o.x; o.py = o.y; } // khung đầu của tên: giữ điểm đầu đoạn ở giữa người bắn
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (o.team === 'player') {
        // Sửa góp ý 1: kiểm tra trúng theo cả đoạn tên vừa bay trong khung (không chỉ điểm cuối), nên tên nhanh không "nhảy qua"
        // quái; khung đầu tiên đoạn này bắt đầu từ giữa người bắn (px, py), nên quái đứng sát người vẫn trúng.
        // Vùng trúng là hình bầu dục rộng hơn thân quái một chút (C.hitX, C.hitY), cùng hệ trục với chỗ đứng của quái.
        const zf = G.MOVES && G.MOVES.bow ? G.MOVES.bow.zFly : 11;
        if (o.kind === 'arrow' && o.z > zf) o.z = Math.max(zf, o.z - dt * 45); // rời dây cung ở trên cao rồi hạ dần về tầm bay
        const hits = [];
        for (const e of G.targets()) {
          if (o.seen.includes(e)) continue;
          const t = segHit(o, e);
          if (t >= 0) hits.push([t, e]);
        }
        hits.sort((a, b) => a[0] - b[0]);
        for (const hx of hits) {
          const e = hx[1];
          o.seen.push(e);
          playerHit(e, o.mult, { w: o.w, ranged: true, heavy: o.big, dir: o.vx < 0 ? -1 : 1, manh: o.charged > 0 }); // manh: phát giữ rồi thả (js/bo_skill.js)
          if (G.moves) G.moves.arrowHit(o, e);
          P.mana = Math.min(P.maxmana, P.mana + P.manaHit + (G.wHas(o.w, 'mana') ? 1 : 0));
          G.sfx('hit', 1.3);
          if (o.pierce > 0) { o.pierce--; if (o.pierceMult) o.mult *= o.pierceMult; } else { o.t = 0; break; } // tên thường xuyên qua thì yếu đi (pierceMult)
        }
        // đồ vật trên sàn (lò lửa, nấm, đá băng): tên bay qua thì kích nổ nhưng không bị chặn lại
        for (const pr of W.props) if (pr.env && !pr.used && Math.abs(pr.x - o.x) < 8 && Math.abs(pr.y - o.y) < 10) G.triggerProp(pr);
      } else if (Math.abs(P.x - o.x) < 7 && Math.abs(P.y - o.y) < 8) {
        if (G.hurtPlayer(o.dmg, o.el, o.src || null, false) || P.inv <= 0) { o.t = 0; if (o.onHit) o.onHit(o); }
      }
      if (o.x < -30 || o.x > W.w + 30) o.t = 0;
    }
    W.projs = W.projs.filter((o) => o.t > 0);
    // vùng nguy hiểm và vũng
    for (const z of W.zones) {
      if (z.wall && G.mobWall) { hurtKind = 'vung'; G.mobWall(z, dt, P); hurtKind = null; continue; } // tường nước chạy (js/mobs.js)
      if (z.wave) {
        if (z.wait > 0) { z.wait -= dt; continue; } // sóng đứng yên báo trước rồi mới tràn tới
        z.x += z.vx * dt;
        if (!z.hit && Math.abs(P.x - z.x) < 6 && (P.y < z.g0 || P.y > z.g1)) { hurtKind = 'vung'; if (G.hurtPlayer(z.dmg, z.el, null, false)) z.hit = true; hurtKind = null; }
        if (z.x < -20) z.dead = true;
        continue;
      }
      if (z.src && z.src.dead && z.cancel) { z.dead = true; continue; } // quái chết hoặc bị choáng trước khi ra đòn: huỷ vùng báo
      if (z.wait > 0) { z.wait -= dt; continue; } // vùng chưa bắt đầu báo (chuỗi đòn nối nhau)
      if (z.t > 0) {
        z.t -= dt;
        if (z.t <= 0) {
          if (z.team !== 'player' && z.team !== 'fx' && z.dmg && G.inZone(z, P)) { hurtKind = 'vung'; const hit = G.hurtPlayer(z.dmg, z.el, z.src || null, !!z.melee); hurtKind = null; if (hit && z.onHit) z.onHit(z); }
          if (z.onFire) z.onFire(z);
          if (z.then) { z.pool = true; z.life = z.then; z.tick = 0.4; }
          FX('zoneFire', z);
          W.shake = Math.max(W.shake, 0.06);
        }
        continue;
      }
      z.life -= dt;
      if (z.pool) {
        z.tick -= dt;
        if (z.tick <= 0) {
          if (z.team === 'player') {
            if (z.rain) {
              z.tick = 0.15;
              for (const e of G.targets()) if (Math.hypot(e.x - z.x, (e.y - z.y) * 1.6) < z.r + e.r) playerHit(e, G.MOVES && G.MOVES.bow.rain ? G.MOVES.bow.rain.mult : 0.5, { w: z.w, ranged: true, rain: true });
              const rx = z.x + G.rr(-30, 30), ry = z.y + G.rr(-12, 12); // vẫn rút hai số ngẫu nhiên như trước
              FX('rainDrop', rx, ry, z.el);
            } else {
              z.tick = z.every || 1;
              for (const e of G.targets()) if (Math.hypot(e.x - z.x, (e.y - z.y) * 1.6) < z.r + e.r) G.applyStatus(e, z.el, z.src, 1);
            }
          } else {
            z.tick = 0.5;
            if (G.inZone(z, P)) { hurtKind = 'vung'; G.hurtPlayer(z.dmg * 0.3, z.el, null, false); hurtKind = null; }
          }
        }
        if (z.heal && G.inZone(z, P)) P.hp = Math.min(P.maxhp, P.hp + P.maxhp * 0.03 * dt);
      }
      if (z.life <= 0) z.dead = true;
    }
    W.zones = W.zones.filter((z) => !z.dead);
    if (G.moves) G.moves.update(W, dt); // sóng chấn động, đòn hẹn giờ của js/moves.js
    if (G.chuong) G.chuong.update(W, dt); // chưởng đang bay, vệt lửa và mây độc của chưởng (js/chuong.js)
    // bẫy của Thợ Săn
    for (const pr of W.props) {
      if (pr.type !== 'trap' || pr.dead) continue;
      pr.t -= dt;
      if (pr.t <= 0) { pr.dead = true; continue; }
      for (const e of G.targets()) {
        if (Math.abs(e.x - pr.x) < 10 + e.r * 0.5 && Math.abs(e.y - pr.y) < 9 + e.hr * 0.5) {
          pr.dead = true;
          e.st.root = e.isBoss ? 0.8 : 2;
          const src = G.pDamage(P, pr.w);
          if (pr.el) G.applyStatus(e, pr.el, src, pr.el === 'fire' ? 1 : 2);
          G.damage(e, src * 1.5, { el: pr.el, src: 'trap', w: pr.w });
          G.sfx('hit', 0.6);
          FX('trapSnap', pr, e);
          break;
        }
      }
    }
    W.props = W.props.filter((p) => !p.dead);
    W.ents = W.ents.filter((e) => !e.dead);
    // hạt, chữ, vệt chém
    for (const o of W.parts) { o.t -= dt; o.x += o.vx * dt; o.y += o.vy * dt; o.vy += 90 * dt; }
    W.parts = W.parts.filter((o) => o.t > 0);
    for (const o of W.texts) { o.t -= dt; o.y -= 22 * dt; }
    W.texts = W.texts.filter((o) => o.t > 0);
    for (const o of W.slashes) o.t -= dt;
    W.slashes = W.slashes.filter((o) => o.t > 0);
    if (W.shake > 0) W.shake -= dt;
    if (W.banner) { W.banner.t -= dt; if (W.banner.t <= 0) W.banner = null; }
    // Trong phòng trùm cố định, đặt người chơi lệch trái để thấy rõ phía trùm.
    const lead = W.boss && !W.boss.dead && W.boss.kind !== 'ho' ? 150 : G.W / 2;
    const camTo = G.clamp(P.x - lead, 0, Math.max(0, W.w - G.W));
    W.cam += (camTo - W.cam) * Math.min(1, dt * 6);
    if (!G.noRender && G.fx && G.fx.update) G.fx.update(dt);
  };

  // ---------- vẽ ----------
  // Tham số vẽ hero. fx.js cũng dùng để vẽ bóng mờ ở vị trí cũ.
  G.heroArgs = function (P) {
    const w = curW(P);
    return {
      p: P, // hero_art.js đọc thêm trạng thái hoạt ảnh từ đây (chỉ đọc)
      x: P.x, y: P.y, face: P.face, key: P.key, move: P.moving, t: P.t, tc: P.chayT,
      mdx: P.moving && P.ldx != null ? P.ldx : 0, // hướng chạy (ngang) cho chân khi chạy + chém (js/zed_moi.js ghép eo): chân theo cần, thân trên theo hướng chém
      atk: P.atkT > 0 ? 1 - P.atkT / P.atkDur : -1, dodge: P.dodgeT > 0 ? 1 - P.dodgeT / 0.27 : -1,
      flash: P.hurtT > 0, alpha: P.inv > 0 && P.dodgeT <= 0 && Math.floor(G.time * 20) % 2 ? 0.5 : null,
      // giáo đang bay (Phi Thương): tay không, chưa vẽ cây giáo trên tay
      weapon: Object.assign({}, w, { coat: P.coats[w.id] && P.coats[w.id].t > 0 ? P.coats[w.id].el : null }, P.spearOut === w.id ? { type: 'fist' } : null),
      helm: P.helm, armor: P.armor, outfit: P.outfit || null, gong: P.gongT > 0,
      roundShadow: !!W.geo, // phòng vuông nhìn từ trên: bóng đổ tròn
    };
  };
  // Thứ tự lớp: nền, vùng và vũng, hiệu ứng sát đất, nhân vật (kèm hiệu ứng bám theo), đạn, hiệu ứng phía trên, rồi lớp giao diện.
  G.drawWorld = function (reg) {
    const c = G.wx, A = G.art, P = W.P;
    const F = G.noRender ? null : G.fx;
    const cam = Math.round(W.cam);
    let sx = 0, sy = 0;
    if (F && F.shakeOffset) { const o = F.shakeOffset(); sx = o.x; sy = o.y; }
    else if (W.shake > 0) { sx = Math.round(Math.random() * 4 - 2); sy = Math.round(Math.random() * 2 - 1); }
    G.wxDat(c, 0, 0);
    A.bg(c, reg, W.seed, cam, W.w, W.shrink);
    G.wxDat(c, -cam + sx, sy);
    const dimBe = F && F.dim2 ? F.dim2() : 1; // độ đọc trận 12/10: vũng / vùng do EM BÉ tạo nhạt đi (vùng của quái giữ nguyên)
    for (const z of W.zones) {
      if (z.oz) continue; // 11/10 (chủ dự án): vệt, vũng hệ do trang phục của bé rải ra vẫn gây hiệu ứng nhưng không vẽ vòng trên sàn
      const nhat = dimBe < 1 && z.team === 'player';
      if (nhat) { c.save(); c.globalAlpha = dimBe; }
      try { if (F && F.zone && F.zone(c, z, W)) continue; } finally { if (nhat) c.restore(); }
      if (nhat) { c.save(); c.globalAlpha = dimBe; }
      if (z.wave) {
        // lúc còn báo trước thì sóng mờ và nhấp nháy, khe hở nhìn thấy ngay
        const wc = z.wait > 0 ? 'rgba(160,220,250,' + (Math.floor(G.time * 10) % 2 ? 0.3 : 0.5) + ')' : 'rgba(160,220,250,0.85)';
        A.p(c, Math.round(z.x) - 3, W.y0 - 6, 6, z.g0 - W.y0 + 6, wc);
        A.p(c, Math.round(z.x) - 3, z.g1, 6, G.H - z.g1, wc);
      } else if (z.team === 'fx') A.ellipse(c, z.x, z.y, z.r, z.r * (G.ZK || 0.6), 'rgba(255,240,200,0.35)');
      else A.zone(c, z);
      if (nhat) c.restore();
    }
    if (F && F.drawGround) F.drawGround(c);
    const ent = F && F.entity, rec = F && F.recoil, xf = F && F.xf; // xf: nhún, nghiêng, nảy khi trúng đòn (js/fx.js), chỉ đổi hình
    const list = [];
    for (const e of W.ents) {
      list.push({ y: e.y, f: () => {
        const up = e.mvLift > 0 ? Math.round(Math.sin((e.mvLift / 0.45) * Math.PI) * 10) : 0; // bị Địa Chấn hất tung
        if (xf && xf(c, e, up)) { // đã gồm giật lùi
          if (e.illusion) A.boss(c, e); else A.enemy(c, e);
          c.restore();
        } else {
          const k = rec ? rec(e) : 0; // giật lùi khi trúng đòn: chỉ dời hình
          if (k || up) c.translate(k, -up);
          if (e.illusion) A.boss(c, e); else A.enemy(c, e);
          if (k || up) c.translate(-k, up);
        }
        if (ent) ent(c, e);
      } });
    }
    for (const pr of W.props) if (pr.type !== 'loot') list.push({ y: pr.y - (pr.type === 'door' || pr.type === 'portal' ? 200 : 0), f: () => A.prop(c, pr) }); // cổng dịch chuyển nằm sát sàn: vẽ dưới mọi thứ
    if (W.boss && !W.boss.dead) {
      const b = W.boss;
      list.push({ y: b.y + (b.kind === 'moc' ? -30 : 0), f: () => {
        const on = xf && xf(c, b, 0), k = on ? 0 : rec ? rec(b) : 0;
        if (k) c.translate(k, 0);
        if (b.kind === 'mini') A.enemy(c, b); else A.boss(c, b);
        if (k) c.translate(-k, 0);
        if (on) c.restore();
        if (!b.hidden) A.status(c, b, Math.round(b.x), Math.round(b.y - b.h - 6));
        if (ent) ent(c, b);
      } });
    }
    if (G.roomArt && G.roomArt.vatCao) for (const q of G.roomArt.vatCao(c, W)) list.push(q); // Rà soát C: vật trang trí cao che đúng lớp ai đứng sau nó
    list.push({ y: P.y, f: () => { const on = xf && xf(c, P, 0); A.hero(c, G.heroArgs(P)); if (on) c.restore(); if (ent) ent(c, P); } });
    if (F && F.sorted) F.sorted(list, c);
    for (const pr of W.props) if (pr.type === 'loot') A.prop(c, pr); // đồ rơi nằm ở lớp sàn: không che quái, em bé, vùng báo trước (js/do_roi.js)
    if (G.baoTruoc) G.baoTruoc.snap(c); // chụp nền (đã có vũng, vết) trước khi vẽ nhân vật: để vùng báo trước nằm dưới nhân vật
    list.sort((a, b) => a.y - b.y);
    for (const o of list) o.f();
    if (G.mobHeroOver) G.mobHeroOver(c, P); // em bé đứng sau quái to: vẽ thêm bóng mờ của bé lên trên để không bị che mất
    if (!ent) {
      if (P.st.fire > 0) { A.p(c, Math.round(P.x) - 3, Math.round(P.y) - 38, 2, 3, '#ff7a2a'); A.p(c, Math.round(P.x) + 1, Math.round(P.y) - 40, 2, 4, '#ffd23f'); }
      if (P.st.poison > 0) A.p(c, Math.round(P.x) - 2, Math.round(P.y) - 38, 3, 3, '#6fcf3a');
      if (P.st.ice > 0) A.p(c, Math.round(P.x) - 5, Math.round(P.y) - 2, 10, 2, '#7fd4ff');
    }
    const pj = F && F.proj;
    for (const o of W.projs) { if (pj) pj(c, o); A.proj(c, o); }
    for (const s of W.slashes) A.slash(c, s);
    for (const o of W.parts) A.p(c, Math.round(o.x), Math.round(o.y), o.s, o.s, o.col);
    if (F && F.drawOver) F.drawOver(c);
    if (F && F.vienBe) F.vienBe(c, P); // độ đọc trận 12/10: viền sáng + bóng mờ em bé trên mọi hiệu ứng (js/fx.js)
    G.wxDat(c, 0, 0);
    // chữ sát thương vẽ ở lớp giao diện cho nét
    for (const o of W.texts) G.ui.text(o.s, o.x - cam, o.y, { size: o.size, align: 'center', color: o.col, bold: true });
    if (G.doRoi && !P.dead) G.doRoi.nhan(W, P); // tên ngắn của đồ rơi khi lại gần
    if (F && F.drawUI) F.drawUI(cam);
    // V9: vùng báo trước đòn vẽ SAU số sát thương, để số không che vùng nguy hiểm (vẽ mịn ở lớp giao diện, js/bao_truoc.js)
    if (G.baoTruoc) G.baoTruoc.draw(cam, sx, sy);
  };
})();
