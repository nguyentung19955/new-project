// TRANG PHỤC của em bé tinh linh (G.outfit): năm ô (Mũ, Áo, Đồ đeo lưng, Bùa và vật cầm tay, Cánh), bốn bậc như vũ khí,
// hệ Lửa/Độc/Băng, bộ theo vùng, chỉ số, tác dụng trong trận, cách kiếm (rơi, mua, may, nâng bậc, mở cấp cánh),
// lưu trong bản lưu (G.save.outfit) và chuyển mũ, áo, bùa của bản lưu cũ sang hệ mới.
// Hình vẽ của từng món nằm ở js/hero_tinhlinh.js (G.heroLooks); tệp này chỉ giữ số liệu và luật.
(function () {
  const G = window.G;
  const O = (G.outfit = {});
  O.SLOTS = ['hat', 'robe', 'back', 'hand', 'wing'];
  O.SLOT_NAME = { hat: 'Mũ', robe: 'Áo', back: 'Đồ đeo lưng', hand: 'Bùa, cầm tay', wing: 'Cánh' };
  // Hệ số chỉ số theo bậc Thường, Lam, Tím, Vàng.
  O.RMULT = [1, 1.25, 1.5, 1.8];
  O.MAX_ITEMS = 40; // kho trang phục đầy thì món rơi đổi thành vàng
  // Chỉ số: pct là phần trăm (0,1 = 10%).
  O.STATS = {
    hp: { name: 'Máu', pct: false }, mana: { name: 'Mana', pct: false }, dr: { name: 'Giảm sát thương', pct: true },
    spd: { name: 'Tốc chạy', pct: true }, cd: { name: 'Hồi chiêu nhanh', pct: true }, pick: { name: 'Tầm nhặt đồ', pct: false },
    res_fire: { name: 'Bớt thời gian cháy', pct: true }, res_poison: { name: 'Bớt thời gian trúng độc', pct: true }, res_ice: { name: 'Bớt thời gian bị chậm', pct: true },
  };
  // Bộ theo vùng. reg: vùng (0 Rừng già, 1 Hang biển, 2 Lâu đài cổ); old: hiệu ứng bộ 2 món của bản cũ (G.SETS).
  O.SETS = {
    rung: { name: 'Bộ Rừng Già', el: 'poison', reg: 0, old: 'moc' },
    bien: { name: 'Bộ Hang Biển', el: 'ice', reg: 1, old: 'ngu' },
    lau: { name: 'Bộ Lâu Đài', el: 'fire', reg: 2, old: 'ho' },
  };
  // DANH MỤC. Mỗi món: ô, tên, hình (look trong G.heroLooks), hệ, bộ, vùng (giá may và nâng bậc), chỉ số ở bậc Thường,
  // nguồn: shop (Bà Hàng Xén bán, giá vàng), craft (Cô Thợ May may), drop (rơi từ quái), boss (trùm vùng rơi bộ của vùng).
  // old: bùa của bản cũ (giữ tác dụng cũ, cần hero cấp 5 như trước).
  const I = (O.ITEMS = {});
  const def = (id, slot, name, o) => { I[id] = Object.assign({ id, slot, name, look: id, el: null, set: null, reg: 0, st: {}, src: [] }, o); };
  // --- Bộ Rừng Già (Độc) ---
  def('mu_sung', 'hat', 'Mũ sừng gỗ', { el: 'poison', set: 'rung', reg: 0, st: { res_poison: 0.32, hp: 6 }, src: ['craft', 'boss', 'drop'] });
  def('ao_vo_cay', 'robe', 'Áo vỏ cây', { el: 'poison', set: 'rung', reg: 0, st: { hp: 36, dr: 0.064 }, src: ['craft', 'boss', 'drop'] });
  def('gui_tre', 'back', 'Gùi tre độc', { el: 'poison', set: 'rung', reg: 0, st: { mana: 10, cd: 0.05 }, src: ['craft', 'boss', 'drop'] });
  def('bua_nanh', 'hand', 'Bùa nanh rắn', { el: 'poison', set: 'rung', reg: 0, st: { pick: 10, mana: 6 }, src: ['craft', 'boss', 'drop'] });
  def('canh_la', 'wing', 'Cánh lá', { look: 'la', el: 'poison', set: 'rung', reg: 0, st: { spd: 0.03, dr: 0.015 }, src: ['boss'] });
  // --- Bộ Hang Biển (Băng) ---
  def('mu_vay_ca', 'hat', 'Mũ vây cá', { el: 'ice', set: 'bien', reg: 1, st: { res_ice: 0.32, hp: 8 }, src: ['craft', 'boss', 'drop'] });
  def('ao_vay', 'robe', 'Áo vảy', { el: 'ice', set: 'bien', reg: 1, st: { hp: 68, dr: 0.08 }, src: ['craft', 'boss', 'drop'] });
  def('khan_bang', 'back', 'Khăn choàng sương', { el: 'ice', set: 'bien', reg: 1, st: { spd: 0.04, mana: 8 }, src: ['craft', 'boss', 'drop'] });
  def('bua_oc', 'hand', 'Bùa vỏ ốc', { el: 'ice', set: 'bien', reg: 1, st: { pick: 12, cd: 0.05 }, src: ['craft', 'boss', 'drop'] });
  def('canh_bang', 'wing', 'Cánh băng', { look: 'bang', el: 'ice', set: 'bien', reg: 1, st: { spd: 0.03, dr: 0.015 }, src: ['boss'] });
  // --- Bộ Lâu Đài (Lửa) ---
  def('mu_tai_cao', 'hat', 'Mũ tai cáo', { el: 'fire', set: 'lau', reg: 2, st: { res_fire: 0.32, hp: 10 }, src: ['craft', 'boss', 'drop'] });
  def('ao_long', 'robe', 'Áo lông trắng', { el: 'fire', set: 'lau', reg: 2, st: { hp: 104, dr: 0.08, spd: 0.064 }, src: ['craft', 'boss', 'drop'] });
  def('trong_nho', 'back', 'Trống đồng nhỏ', { el: 'fire', set: 'lau', reg: 2, st: { mana: 12, cd: 0.06 }, src: ['craft', 'boss', 'drop'] });
  def('bua_lua', 'hand', 'Bùa đá lửa', { el: 'fire', set: 'lau', reg: 2, st: { pick: 14, mana: 8 }, src: ['craft', 'boss', 'drop'] });
  def('canh_lua', 'wing', 'Cánh lửa', { look: 'lua', el: 'fire', set: 'lau', reg: 2, st: { spd: 0.03, dr: 0.015 }, src: ['boss'] });
  // --- Món lẻ ---
  def('non_la', 'hat', 'Nón lá rừng', { reg: 0, st: { res_poison: 0.25 }, src: ['craft'], cost: { mat: [6, 0, 0], gold: 80 } });
  def('mu_da_ca', 'hat', 'Mũ da cá', { reg: 1, st: { res_ice: 0.25 }, src: ['craft'], cost: { mat: [0, 6, 0], gold: 200 } });
  def('khan_lua', 'hat', 'Khăn đá lửa', { el: 'fire', reg: 2, st: { res_fire: 0.25 }, src: ['craft', 'drop'], cost: { mat: [0, 0, 6], gold: 400 } });
  def('mu_rom', 'hat', 'Mũ rơm', { st: { hp: 6 }, src: ['shop'], price: 60 });
  def('khan_xep', 'hat', 'Khăn xếp', { st: { mana: 8 }, src: ['shop'], price: 90 });
  def('vong_la', 'hat', 'Vòng lá', { el: 'poison', reg: 0, st: { hp: 4, res_poison: 0.1 }, src: ['drop'] });
  def('ao_vai', 'robe', 'Áo vải thô', { st: { hp: 20 }, src: ['shop', 'craft'], price: 100, cost: { mat: [8, 0, 0], gold: 100 } });
  def('ao_da_bien', 'robe', 'Áo da biển', { el: 'ice', reg: 1, st: { hp: 50, dr: 0.04 }, src: ['craft', 'drop'], cost: { mat: [0, 8, 0], gold: 250 } });
  def('giap_da', 'robe', 'Áo giáp đá', { el: 'fire', reg: 2, st: { hp: 90, dr: 0.06 }, src: ['craft', 'drop'], cost: { mat: [0, 0, 8], gold: 500 } });
  def('ao_toi', 'robe', 'Áo tơi lá', { st: { hp: 16, spd: 0.03 }, src: ['shop'], price: 120 });
  def('ao_the', 'robe', 'Áo the', { st: { hp: 12, mana: 10 }, src: ['shop'], price: 140 });
  def('ao_la', 'robe', 'Áo lá', { el: 'poison', reg: 0, st: { hp: 24, res_poison: 0.1 }, src: ['drop'] });
  def('giap_tre', 'robe', 'Giáp tre', { reg: 0, st: { hp: 30, dr: 0.03 }, src: ['drop'] });
  def('ao_choang', 'back', 'Áo choàng đỏ', { st: { spd: 0.03 }, src: ['shop'], price: 110 });
  def('ong_ten', 'back', 'Ống tên', { st: { pick: 8 }, src: ['shop'], price: 80 });
  def('ho_lo', 'back', 'Bầu hồ lô', { el: 'poison', reg: 0, st: { mana: 12 }, src: ['drop'] });
  def('bua_hut', 'hand', 'Bùa hút máu', { st: { hp: 6 }, old: 'c_leech', src: ['drop'] });
  def('bua_tan', 'hand', 'Bùa tàn lửa', { el: 'fire', reg: 2, st: { mana: 4 }, old: 'c_ember', src: ['drop'] });
  def('bua_suong', 'hand', 'Bùa sương', { el: 'ice', reg: 1, st: { mana: 4 }, old: 'c_mist', src: ['drop'] });
  def('bua_tham', 'hand', 'Bùa tham', { st: { pick: 10 }, old: 'c_greed', src: ['drop'] });
  def('bua_linh', 'hand', 'Bùa linh', { st: { mana: 8 }, old: 'c_spirit', src: ['drop'] });
  def('canh_chuon', 'wing', 'Cánh chuồn chuồn', { look: 'chuon', st: { spd: 0.03, dr: 0.015 }, src: ['craft'], cost: { mat: [6, 6, 6], gold: 300 } });
  // Bản cũ: mã mũ, áo, bùa cũ -> [món mới, bậc].
  O.FROM_OLD = {
    h_r1: ['non_la', 0], h_r2: ['mu_da_ca', 0], h_r3: ['khan_lua', 0], h_moc: ['mu_sung', 1], h_ngu: ['mu_vay_ca', 1], h_ho: ['mu_tai_cao', 1],
    a_r1: ['ao_vai', 0], a_r2: ['ao_da_bien', 0], a_r3: ['giap_da', 0], a_moc: ['ao_vo_cay', 1], a_ngu: ['ao_vay', 1], a_ho: ['ao_long', 1],
    c_leech: ['bua_hut', 1], c_ember: ['bua_tan', 1], c_mist: ['bua_suong', 1], c_greed: ['bua_tham', 1], c_spirit: ['bua_linh', 1],
  };
  // Tác dụng đặc biệt (món Tím và Vàng). Món có hệ: tác dụng theo ô; món không hệ: Khiên đầu phòng. Cánh: theo cấp.
  const HN = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
  O.special = function (it) {
    const T = I[it.k];
    if (!T) return null;
    if (T.slot === 'wing') {
      const lv = it.lv | 0;
      if (lv < 2) return { key: 'none', name: 'Mầm cánh', desc: 'Lên cấp 2 (cánh nhỏ) để lộn xa hơn và có khiên sau khi lộn.' };
      return lv >= 3
        ? { key: 'wing', name: 'Cánh lớn', desc: 'Lộn xa hơn 30%. Lộn xong có khiên 0,8 giây chặn một đòn (hồi 3 giây).' }
        : { key: 'wing', name: 'Cánh nhỏ', desc: 'Lộn xa hơn 20%. Lộn xong có khiên 0,5 giây chặn một đòn (hồi 4 giây).' };
    }
    if ((it.r | 0) < 2) return null;
    const gold = it.r >= 3, el = T.el, hn = HN[el];
    if (!el) return { key: 'guard', name: 'Khiên đầu phòng', desc: 'Vào phòng mới có khiên chặn ' + (gold ? '2 đòn' : '1 đòn') + '.' };
    const what = { fire: 'cháy', poison: 'trúng độc', ice: 'chậm' }[el];
    if (T.slot === 'hat') return { key: 'thorn', name: 'Mũ ' + hn.toLowerCase(), desc: 'Quái đánh trúng bé bị ' + what + (gold ? ' nặng.' : '.') };
    if (T.slot === 'robe') return { key: 'trail', name: 'Vệt ' + { fire: 'cháy', poison: 'độc', ice: 'băng' }[el], desc: 'Lộn để lại vệt ' + hn + ' trên đất, quái đi qua bị ' + what + (gold ? ', vệt lâu hơn.' : '.') };
    if (T.slot === 'back') return { key: 'pulse', name: 'Vũng ' + hn.toLowerCase(), desc: 'Mỗi ' + (gold ? 4 : 5) + ' giây rải một vũng ' + hn + ' nhỏ dưới chân khi còn quái.' };
    return { key: 'burst', name: 'Nổ ' + hn.toLowerCase(), desc: 'Quái gục gần bé nổ nhỏ, làm quái quanh đó bị ' + what + '.' };
  };

  // ---------- chỉ số một món ----------
  O.wingMult = (lv) => [0, 1, 1.4, 1.8][G.clamp(lv | 0, 0, 3)];
  O.stats = function (it) {
    const T = I[it.k], out = {};
    if (!T) return out;
    const m = O.RMULT[G.clamp(it.r | 0, 0, 3)] * (T.slot === 'wing' ? O.wingMult(it.lv || 1) : 1);
    for (const k in T.st) out[k] = O.STATS[k].pct ? Math.round(T.st[k] * m * 1000) / 1000 : Math.round(T.st[k] * m);
    return out;
  };
  O.statText = function (k, v) {
    const S = O.STATS[k];
    return S.name + ' +' + (S.pct ? Math.round(v * 100) + '%' : v);
  };
  O.name = function (it) {
    const T = I[it.k];
    if (!T) return '?';
    if (T.slot === 'wing') return T.name + ' · ' + ['', 'mầm', 'nhỏ', 'lớn'][G.clamp(it.lv | 0, 1, 3)];
    return T.name;
  };

  // ---------- bản lưu ----------
  O.blank = () => ({ items: [], wear: { hat: null, robe: null, back: null, hand: null, wing: null }, next: 1, got: 0, seen: 0 });
  O.add = function (sv, k, r, o) {
    o = o || {};
    const T = I[k];
    if (!T) return null;
    const S = sv.outfit;
    if (S.items.length >= O.MAX_ITEMS) { sv.gold += 40 * ((r | 0) + 1); return null; }
    const it = { id: S.next++, k, r: G.clamp(r | 0, 0, 3), n: o.quiet ? 0 : 1 };
    if (T.slot === 'wing') it.lv = G.clamp(o.lv || 1, 1, 3);
    S.items.push(it);
    S.got++;
    return it;
  };
  O.byId = (sv, id) => (id == null ? null : sv.outfit.items.find((x) => x.id === id) || null);
  O.worn = function (sv, slot) { return O.byId(sv, sv.outfit.wear[slot]); };
  O.wear = function (sv, it) { const T = I[it.k]; if (T) sv.outfit.wear[T.slot] = it.id; it.n = 0; };
  O.unwear = function (sv, slot) { sv.outfit.wear[slot] = null; };
  // Mũ, áo, bùa của bản lưu cũ (sv.owned, sv.helm, sv.armor, sv.charm) -> món mới. Gọi được nhiều lần: chuyển xong thì xoá chỗ cũ.
  O.migrate = function (sv) {
    if (!sv.owned || typeof sv.owned !== 'object') sv.owned = { helm: [], armor: [], charm: [] };
    const OS = sv.outfit;
    for (const slot of ['helm', 'armor', 'charm']) {
      const list = Array.isArray(sv.owned[slot]) ? sv.owned[slot] : [];
      for (const id of list) {
        const q = O.FROM_OLD[id];
        if (!q) continue;
        // Đã chuyển món này rồi (cùng mã cũ) thì không thêm lần nữa.
        let it = OS.items.find((x) => x.old === id);
        if (!it) { it = O.add(sv, q[0], q[1], { quiet: true }); if (it) it.old = id; }
        if (it && sv[slot] === id) O.wear(sv, it);
      }
      sv.owned[slot] = [];
      sv[slot] = null;
    }
  };
  // Kiểm tra phần trang phục của bản lưu (gọi từ G.fixSave): sai gì thì sửa, hỏng thì làm mới, rồi chuyển đồ cũ.
  O.fix = function (sv) {
    let S = sv.outfit;
    if (!S || typeof S !== 'object' || Array.isArray(S)) S = O.blank();
    const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
    const seen = {};
    S.items = (Array.isArray(S.items) ? S.items : []).filter((it) => {
      if (!it || typeof it !== 'object' || !I[it.k] || typeof it.id !== 'number' || !isFinite(it.id) || seen[it.id]) return false;
      seen[it.id] = true;
      it.r = G.clamp(Math.floor(num(it.r, 0)), 0, 3);
      it.n = it.n ? 1 : 0;
      if (I[it.k].slot === 'wing') it.lv = G.clamp(Math.floor(num(it.lv, 1)), 1, 3); else delete it.lv;
      if (it.old != null && !O.FROM_OLD[it.old]) delete it.old;
      return true;
    }).slice(0, O.MAX_ITEMS);
    S.next = Math.max(1, Math.floor(num(S.next, 1)), ...S.items.map((it) => it.id + 1));
    S.got = Math.max(S.items.length, Math.floor(num(S.got, 0)));
    S.seen = Math.max(0, Math.floor(num(S.seen, 0)));
    const w = S.wear && typeof S.wear === 'object' && !Array.isArray(S.wear) ? S.wear : {};
    S.wear = {};
    for (const slot of O.SLOTS) {
      const it = S.items.find((x) => x.id === w[slot]);
      S.wear[slot] = it && I[it.k].slot === slot ? it.id : null;
    }
    sv.outfit = S;
    O.migrate(sv);
    return S;
  };
  // Bản lưu cũ hoặc bài kiểm tra ghi thẳng vào sv.owned, sv.helm... sau khi nạp: chuyển nốt trước khi dùng.
  O.sync = function (sv) {
    sv = sv || G.save;
    if (!sv) return;
    if (!sv.outfit || !Array.isArray(sv.outfit.items)) O.fix(sv);
    const o = sv.owned;
    if (o && ((o.helm && o.helm.length) || (o.armor && o.armor.length) || (o.charm && o.charm.length) || sv.helm || sv.armor || sv.charm)) O.migrate(sv);
  };

  // ---------- tổng hợp đồ đang mặc ----------
  // Trả về { stats, specials: {key: [{el, r, item}]}, sets: {set: số món}, set2 (mã bộ cũ), elBonus, wingLv, oldCharm }
  O.sum = function (sv) {
    sv = sv || G.save;
    O.sync(sv);
    const out = { stats: {}, specials: {}, sets: {}, set2: null, elBonus: {}, wingLv: 0, oldCharm: null, items: [] };
    for (const slot of O.SLOTS) {
      const it = O.worn(sv, slot);
      if (!it) continue;
      const T = I[it.k];
      out.items.push(it);
      const st = O.stats(it);
      for (const k in st) out.stats[k] = (out.stats[k] || 0) + st[k];
      const sp = O.special(it);
      if (sp && sp.key !== 'none') (out.specials[sp.key] = out.specials[sp.key] || []).push({ el: T.el, r: it.r, it });
      if (T.set) out.sets[T.set] = (out.sets[T.set] || 0) + 1;
      if (slot === 'wing') out.wingLv = it.lv | 0;
      if (T.old) out.oldCharm = T.old;
    }
    for (const s in out.sets) {
      const n = out.sets[s], S = O.SETS[s];
      if (n >= 2 && !out.set2) out.set2 = S.old;
      if (n >= 3) out.elBonus[S.el] = (out.elBonus[S.el] || 0) + 0.1 + 0.04 * (n - 3);
    }
    return out;
  };
  // Hình đồ đang mặc cho js/hero_tinhlinh.js: { hat, robe, back, hand, wing: {kind, level}, rar: {...}, fx: {glow, els, aura} }.
  // Ô trống thì để undefined: em bé mặc đồ khởi đầu của mình.
  O.look = function (sv) {
    sv = sv || G.save;
    const L = { rar: {}, fx: { glow: null, els: [], aura: null }, wing: null };
    if (!sv) return L;
    O.sync(sv);
    let top = -1;
    for (const slot of O.SLOTS) {
      const it = O.worn(sv, slot);
      if (!it) continue;
      const T = I[it.k];
      if (slot === 'wing') L.wing = { kind: T.look, level: it.lv || 1 };
      else L[slot] = T.look;
      L.rar[slot] = it.r;
      if (it.r > top) top = it.r;
      if (T.el && !L.fx.els.includes(T.el)) L.fx.els.push(T.el);
    }
    if (top >= 2) L.fx.glow = G.RARITY[top].col; // ánh viền theo màu bậc cao nhất (Tím, Vàng)
    else if (top === 1) L.fx.glow = null;
    L.fx.top = top;
    const sm = O.sum(sv);
    for (const s in sm.sets) if (sm.sets[s] >= 3) L.fx.aura = O.SETS[s].el;
    L.fx.els = L.fx.els.slice(0, 2);
    return L;
  };

  // ---------- áp vào người chơi (combat.js gọi trong G.buildPlayer) ----------
  O.apply = function (P, sv) {
    const sm = O.sum(sv), s = sm.stats;
    // Máu của trang phục đã được G.buildPlayer cộng vào trước hệ số cây kỹ năng và Bùa tham (như áo của bản cũ).
    P.maxmana += s.mana || 0;
    P.dr += s.dr || 0;
    P.speed *= 1 + (s.spd || 0);
    P.cdMul = Math.max(0.6, 1 - (s.cd || 0));
    P.pickR = s.pick || 0;
    for (const e of G.ELS) if (s['res_' + e]) P.resist[e] = Math.min(0.8, P.resist[e] + s['res_' + e]);
    P.set = sm.set2;
    if (sm.oldCharm) P.charm = P.lvl >= 5 ? sm.oldCharm : null;
    P.elBonus = sm.elBonus;
    P.oSp = sm.specials;
    P.wingLv = sm.wingLv;
    P.dodgeMul = sm.wingLv >= 3 ? 1.3 : sm.wingLv >= 2 ? 1.2 : 1;
    P.oShield = 0; P.oShieldT = 0; P.oPulseT = 2; P.oTrailT = 0; P.oThornCd = 0; P.oBurstCd = 0;
    P.outfit = O.look(sv);
    return sm;
  };

  // ---------- tác dụng trong trận ----------
  const FX = (n, a, b, c, d, e) => { if (!G.noRender && G.fx && G.fx[n]) G.fx[n](a, b, c, d, e); };
  const W_ = () => (G.getWorld ? G.getWorld() : null);
  const top = (list) => list.reduce((a, b) => (b.r > a.r ? b : a));
  // Sức của tác dụng trang phục: sát thương mỗi đòn của vũ khí đang cầm, quy về nhịp đánh của kiếm (0,36 giây một đòn),
  // để vũ khí chậm hay nhanh đều được cộng thêm theo cùng một tỉ lệ sát thương mỗi giây (giữ nguyên thứ bậc giữa các vũ khí).
  const D = (P) => { const w = G.curW && G.curW(P); if (!w) return 10; return G.pDamage(P, w) * Math.min(1, 0.36 / (G.WTYPES[w.type].cd || 0.36)); };
  const COL = { fire: '#ff9a4a', poison: '#9be05a', ice: '#a8e4ff' };
  const WORD = { fire: 'Cháy!', poison: 'Độc!', ice: 'Chậm!' };
  function zone(W, P, x, y, r, life, el, src) {
    const mine = W.zones.filter((z) => z.oz);
    if (mine.length >= 8) mine[0].dead = true;
    const z = { shape: 'circle', x: G.clamp(x, W.x0, W.x1), y: G.clamp(y, W.y0, W.y1), r, t: 0, pool: true, team: 'player', el, life, tick: 0.15, every: 0.5, src, he: true, oz: true };
    W.zones.push(z);
    return z;
  }
  // Vào phòng mới: Khiên đầu phòng.
  O.onRoom = function (P) {
    const g = P.oSp && P.oSp.guard;
    P.oShield = g ? (g.some((q) => q.r >= 3) ? 2 : 1) : 0;
  };
  // Mỗi khung (combat.js gọi trong G.updatePlayer). Không đọc ngón tay, chỉ đọc trạng thái người chơi.
  O.tick = function (P, dt) {
    const W = W_(); if (!W || !P.oSp) return;
    if (P.oShieldT > 0) P.oShieldT -= dt;
    if (P.oWingCd > 0) P.oWingCd -= dt;
    if (P.oThornCd > 0) P.oThornCd -= dt;
    if (P.oBurstCd > 0) P.oBurstCd -= dt;
    if (W.over || W.safe || P.dead) return;
    const sp = P.oSp;
    // áo có hệ: lộn để lại vệt
    if (sp.trail && P.dodgeT > 0) {
      P.oTrailT -= dt;
      if (P.oTrailT <= 0) {
        P.oTrailT = 0.09;
        const q = top(sp.trail), k = q.r >= 3 ? 1.3 : 1;
        zone(W, P, P.x, P.y, 13, 1.8 * k, q.el, D(P) * 0.3 * k);
      }
    } else P.oTrailT = 0;
    // đồ đeo lưng có hệ: rải vũng mỗi vài giây khi còn quái
    if (sp.pulse) {
      const q = top(sp.pulse), live = W.ents.some((e) => !e.dead) || (W.boss && !W.boss.dead);
      P.oPulseT -= dt;
      if (P.oPulseT <= 0 && live) {
        P.oPulseT = q.r >= 3 ? 4 : 5;
        zone(W, P, P.x, P.y + 2, 20, 2.4, q.el, D(P) * 0.3 * (q.r >= 3 ? 1.3 : 1));
        FX('burst', P.x, P.y - 4, COL[q.el], 10, 50);
      }
    }
  };
  // Lộn xong (combat.js gọi): cánh cấp 2 trở lên cho khiên ngắn.
  // Khiên cánh có thời gian hồi (cánh nhỏ 4 giây, cánh lớn 3 giây) để không lộn liên tục mà miễn đòn mãi.
  O.dodgeEnd = function (P) {
    if (P.wingLv >= 2 && !(P.oWingCd > 0)) { P.oShieldT = P.wingLv >= 3 ? 0.8 : 0.5; P.oWingCd = P.wingLv >= 3 ? 3 : 4; FX('sparkle', P.x, P.y - 12, '#e8f6ff', 6); }
  };
  // Bé sắp trúng đòn: còn khiên thì chặn. Trả về true nếu đã chặn.
  O.block = function (P) {
    if (!(P.oShieldT > 0) && !(P.oShield > 0)) return false;
    if (P.oShieldT > 0) P.oShieldT = 0; else P.oShield--;
    P.inv = Math.max(P.inv, 0.35);
    FX('text', P.x, P.y - 30, 'Chặn!', '#bfe9ff', 9);
    FX('sparkle', P.x, P.y - 12, '#ffffff', 10);
    if (G.sfx) G.sfx('pick', 1.6);
    return true;
  };
  // Bé vừa trúng đòn của src: mũ có hệ làm quái bị hiệu ứng.
  O.onHurt = function (P, src) {
    const sp = P.oSp && P.oSp.thorn;
    if (!sp || !src || src.dead || src.isPlayer || !src.st || P.oThornCd > 0) return;
    const q = top(sp), k = q.r >= 3 ? 1.3 : 1;
    P.oThornCd = 0.6;
    G.applyStatus(src, q.el, D(P) * 0.6 * k, q.el === 'ice' ? 2 : 1);
    FX('text', src.x, src.y - (src.h || 16) - 8, WORD[q.el], COL[q.el], 8);
  };
  // Quái gục (combat.js gọi trong G.kill): bùa có hệ làm quái gục gần bé nổ nhỏ.
  O.onKill = function (P, e) {
    const sp = P.oSp && P.oSp.burst;
    if (!sp || P.oBurstCd > 0 || e.isBoss) return;
    if (Math.hypot(e.x - P.x, e.y - P.y) > 90) return;
    const q = top(sp), k = q.r >= 3 ? 1.3 : 1, src = D(P) * 0.3 * k;
    P.oBurstCd = 1.2;
    for (const o of G.targets()) if (o !== e && Math.hypot(o.x - e.x, (o.y - e.y) / (G.ZK || 0.85)) < 28 + o.r) { G.applyStatus(o, q.el, src, 1); G.damage(o, src * 0.5, { el: q.el, src: 'outfit' }); }
    FX('burst', e.x, e.y - 6, COL[q.el], 14, 70);
    FX('text', e.x, e.y - 22, 'Nổ ' + { fire: 'lửa', poison: 'độc', ice: 'băng' }[q.el], COL[q.el], 7.5);
  };
  // Hệ số sát thương theo hệ (đủ bộ 3 món trở lên).
  O.elMult = function (P, el) { return el && P && P.elBonus && P.elBonus[el] ? 1 + P.elBonus[el] : 1; };

  // ---------- cách kiếm ----------
  // Danh sách món có thể rơi ở vùng r: món lẻ có nguồn drop của vùng đó và món bộ của vùng.
  O.pool = function (r, onlySet) {
    return Object.keys(I).filter((k) => {
      const T = I[k];
      if (onlySet) return T.set && O.SETS[T.set].reg === r && T.src.includes('boss');
      return T.src.includes('drop') && (T.reg === r || !T.el);
    });
  };
  O.DROP = { mob: 0.012, elite: 0.12, mini: 0.35, table: [[0.8, 0.2, 0], [0.65, 0.32, 0.03], [0.5, 0.42, 0.08]], bossGold: 0.25 };
  // Rơi một món ở vùng r. kind: 'mob' | 'elite' | 'mini' | 'boss'. Trả về món mới hoặc null.
  O.roll = function (sv, r, kind) {
    r = G.clamp(r | 0, 0, 2);
    if (kind === 'boss') {
      const k = G.pick(O.pool(r, true));
      return O.add(sv, k, G.rnd() < O.DROP.bossGold ? 3 : 2);
    }
    const t = O.DROP.table[r], x = G.rnd(), rar = x < t[0] ? 0 : x < t[0] + t[1] ? 1 : 2;
    return O.add(sv, G.pick(O.pool(r, false)), kind === 'mini' ? Math.max(1, rar) : rar);
  };
  // Giá may (Cô Thợ May) của một món: món lẻ có giá riêng; món bộ: nguyên liệu vùng, 1 mảnh trùm, vàng.
  O.craftCost = function (k) {
    const T = I[k];
    if (!T || !T.src.includes('craft')) return null;
    if (T.cost) return T.cost;
    const mat = [0, 0, 0], shard = [0, 0, 0];
    mat[T.reg] = 10; shard[T.reg] = 1;
    return { mat, shard, gold: 150 + 200 * T.reg };
  };
  // Nâng bậc từ r lên r+1.
  O.upCost = function (it) {
    const T = I[it.k], r = it.r | 0;
    if (!T || r >= 3) return null;
    const reg = T.reg | 0, mat = [0, 0, 0];
    if (r === 0) { mat[reg] = 6; return { gold: 120, mat }; }
    if (r === 1) { mat[reg] = 10; return { gold: 350, mat, stones: 1 }; }
    // Cày nâng cấp: Tím lên Vàng tốn vàng, nguyên liệu vùng và đá tôi (trước là 2 mảnh trùm). Mảnh trùm để dành cho vũ khí Vàng,
    // cánh và may đồ bộ; trang phục thành đường cày máu và giáp bằng vàng và nguyên liệu, không bị kẹt chờ trùm.
    mat[reg] = 18;
    return { gold: 900, mat, stones: 2 };
  };
  // Mở cấp cánh từ lv lên lv+1 bằng mảnh trùm.
  O.wingCost = function (it) {
    const T = I[it.k], lv = it.lv | 0;
    if (!T || T.slot !== 'wing' || lv >= 3) return null;
    const shard = [0, 0, 0];
    if (!T.el) { shard[0] = lv; shard[1] = lv; shard[2] = lv; } else shard[T.reg] = lv === 1 ? 3 : 5;
    return { shard, gold: lv === 1 ? 300 : 800 };
  };
  // Vẽ hình một món (ô đồ, đồ rơi) vừa trong ô size, tâm (cx, cy). k: món trong kho hoặc mã món (khi chưa có).
  O.drawIcon = function (c, it, cx, cy, size) {
    if (typeof it === 'string') it = { k: it, r: 0, lv: 1 };
    const T = I[it.k];
    if (!T || !G.tinhLinh || !G.tinhLinh.itemIcon) return;
    try {
      const sp = G.tinhLinh.itemIcon(T.slot, T.look, it.r, it.lv || 1), w = sp.cv.width, h = sp.cv.height;
      let k = Math.min(size / w, size / h);
      if (k >= 1) k = Math.min(3, Math.floor(k));
      const sm = c.imageSmoothingEnabled;
      c.imageSmoothingEnabled = false;
      c.drawImage(sp.cv, Math.round(cx - (w * k) / 2), Math.round(cy - (h * k) / 2), w * k, h * k);
      c.imageSmoothingEnabled = sm;
    } catch (e) { /* thiếu hình thì bỏ qua */ }
  };
  // ---------- mua, may, nâng bậc, mở cấp cánh (bảng của Bà Hàng Xén và Cô Thợ May gọi) ----------
  O.canPay = function (sv, c) {
    if (!c) return false;
    if ((c.gold || 0) > sv.gold || (c.ore || 0) > sv.ore || (c.stones || 0) > sv.stones) return false;
    for (let i = 0; i < 3; i++) if ((c.mat && c.mat[i] || 0) > sv.mats[i] || (c.shard && c.shard[i] || 0) > sv.shards[i]) return false;
    return true;
  };
  O.pay = function (sv, c) {
    sv.gold -= c.gold || 0; sv.ore -= c.ore || 0; sv.stones -= c.stones || 0;
    for (let i = 0; i < 3; i++) { sv.mats[i] -= (c.mat && c.mat[i]) || 0; sv.shards[i] -= (c.shard && c.shard[i]) || 0; }
  };
  O.full = (sv) => sv.outfit.items.length >= O.MAX_ITEMS;
  O.buy = function (sv, k) {
    const T = I[k];
    if (!T || !T.src.includes('shop') || sv.gold < T.price || O.full(sv)) return null;
    sv.gold -= T.price;
    return O.add(sv, k, 0);
  };
  O.craft = function (sv, k) {
    const c = O.craftCost(k);
    if (!c || !O.canPay(sv, c) || O.full(sv)) return null;
    O.pay(sv, c);
    return O.add(sv, k, 0);
  };
  O.upgrade = function (sv, it) {
    const c = it && O.upCost(it);
    if (!c || !O.canPay(sv, c)) return false;
    O.pay(sv, c); it.r++;
    return true;
  };
  O.wingUp = function (sv, it) {
    const c = it && O.wingCost(it);
    if (!c || !O.canPay(sv, c)) return false;
    O.pay(sv, c); it.lv++;
    return true;
  };
  // Có món chưa may lần nào mà đủ nguyên liệu (dấu chấm than ở Cô Thợ May).
  O.canCraftNew = (sv) => O.craftList().some((k) => !O.has(sv, k) && O.canPay(sv, O.craftCost(k)));
  O.shopList = () => Object.keys(I).filter((k) => I[k].src.includes('shop'));
  O.craftList = () => Object.keys(I).filter((k) => I[k].src.includes('craft'));
  O.has = (sv, k) => sv.outfit.items.some((x) => x.k === k);
  O.newCount = (sv) => sv.outfit.items.filter((x) => x.n).length;
})();
