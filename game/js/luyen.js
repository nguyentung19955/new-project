// LUYỆN VŨ KHÍ 1–15 — phiên 1: luật, ví, chuyển bản lưu (16/10, docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md mục 5.2).
//   - Một đường duy nhất: mỗi vũ khí có cấp Luyện w.luyen = 1..15 (bảng G.LUYEN ở js/data.js) thay cho cấp hệ + mài + lò + ép đồ.
//     Luyện luôn thành công, không tụt cấp. Giới hạn theo số trùm vùng đã hạ (G.LUYEN.tran). Cấp 3/6/12 đổi hình thái
//     (Mầm chọn hệ / Thành hình / Thức tỉnh), cấp 9 mở phần phụ của loại, cấp 15 chọn 1 dòng Viên mãn (w.dongVM, đổi miễn phí).
//   - Ví: nguyên liệu rèn sv.nlr thay quặng (1:1), đá nâng bậc (1:2), bùa giữ bậc (1:6) — G.themNlr / G.themQuang; E.themDa / E.themBua
//     của js/ep_do.js đổi ra NLR khi cờ bật.
//   - Cờ: G.LUYEN_BAT (?luyen=0 → luật, ví, giao diện cũ y nguyên). Mọi móc đọc cờ lúc chạy.
//   - Bản lưu: bọc G.fixSave (nạp SAU js/vk_moi.js, js/ep_do.js, js/hinh_thai.js). Chuyển MỘT lần (sv.luyenChuyen = 1), trước khi
//     chuyển chép bản gốc sang khoá linhkhi_save_v1_truoc_luyen. Trường cũ (w.sharpen, w.ep, sv.ore, sv.daBac, sv.buaBac, sv.forge)
//     giữ nguyên; hình thái + hệ của hai luật giữ riêng (w.hcCu khi đang chạy luật Luyện, w.hcMoi khi đang chạy luật cũ) để bật / tắt
//     cờ lúc nào cũng về đúng bản của luật đó.
//   - Giao diện tối thiểu (phiên 2 làm đẹp): thẻ "Luyện" ở Ông Thợ Rèn và Hành trang (G.luyen.panel), dòng báo một lần ở làng.
(function () {
  'use strict';
  const G = window.G, ui = G.ui;
  if (!G || !G.LUYEN) return;
  const L = (G.luyen = {});
  const CF = G.LUYEN, C = CF.cap, MAX = C.length - 1;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const TEN_TRUM = ['Mộc Tinh', 'Ngư Tinh', 'Hồ Tinh', 'Thuồng Luồng'];
  const tenTrum = (i) => (G.REGIONS[i] && G.REGIONS[i].bossName) || TEN_TRUM[i] || '?';
  const tenNl = (i) => (G.REGIONS[i] && G.REGIONS[i].mat) || '?';
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Luyện': 'Temper', 'Nguyên liệu rèn': 'Forge materials', '{0} nguyên liệu rèn': '{0} forge materials', '+{0} nguyên liệu rèn': '+{0} forge materials',
    '{0} NLR': '{0} FM', 'Luyện {0}/{1}': 'Temper {0}/{1}', 'Lv {0}': 'Lv {0}', 'Luyện lên {0}': 'Temper to {0}', 'Luyện {0} lên {1}': 'Temper {0} to {1}',
    'Đã tối đa (cấp 15)': 'Maxed (Lv 15)', 'Cần hạ {0}': 'Beat {0} first', 'Cần hạ {0} để luyện quá cấp {1}': 'Beat {0} to temper past Lv {1}',
    'Thiếu vàng': 'Need gold', 'Thiếu linh khí': 'Need spirit', 'Thiếu nguyên liệu rèn': 'Need forge materials', 'Thiếu {0}': 'Need {0}', 'Thiếu mảnh {0}': 'Need {0} shards',
    'Chọn hệ': 'Pick an element', 'Chọn hệ (miễn phí)': 'Pick an element (free)', 'Luyện · {0}': 'Temper · {0}', 'Đổi {0} · {1}': '{0} · {1}',
    'Sức mạnh vũ khí ×{0} → ×{1}': 'Weapon power ×{0} → ×{1}', 'Đòn {0} → {1}': 'Hit {0} → {1}', 'Đòn {0}': 'Hit {0}', 'Tốn: {0}': 'Cost: {0}',
    'Mầm: chọn hệ, đòn có hiệu ứng hệ, vệt chém màu hệ': 'Sprout: pick an element, hits apply it',
    'Thành hình: mở {0}, hiệu ứng hệ 50%': 'Formed: unlocks {0}, 50% element chance', 'Thức tỉnh: mở {0}, hiệu ứng hệ 100%': 'Awakened: unlocks {0}, 100% element chance',
    'Tinh luyện: {0}': 'Refined: {0}', 'Viên mãn: chọn 1 dòng (đổi miễn phí)': 'Perfected: pick 1 line (free to switch)',
    'Cấp {0} mở: {1}': 'Lv {0} unlocks: {1}', 'Dòng Viên mãn': 'Perfected line', 'Chí mạng +8%': 'Crit +8%', 'Trùm, tinh anh +16%': 'Bosses, elites +16%', 'Hồi chiêu đặc biệt −12%': 'Special cooldown −12%',
    '+10% tốc đánh': '+10% attack speed', '+12% tầm đánh': '+12% reach', '+30% thời gian choáng': '+30% stun time', '+20% sát thương xuyên, xuyên thêm 1 quái': '+20% pierce damage, +1 pierce',
    '{0} Lv {1} → {2}: đòn +{3}': '{0} Lv {1} → {2}: hit +{3}', '{0} theo hệ {1}.': '{0} now uses {1}.', 'Đã chọn dòng: {0}': 'Line set: {0}', 'Cầm đầu': 'Lead', 'Đang cầm đầu': 'Leading',
    'Vào ải sẽ cầm {0} trước.': 'You will start with {0}.', 'Chọn một vũ khí để luyện.': 'Pick a weapon to temper.',
    'Luyện vũ khí: mỗi cấp chắc chắn thành công, không tụt cấp.': 'Tempering always succeeds and never drops a level.',
    'Lò rèn đã gộp thành Luyện vũ khí.': 'The forge now has a single Temper track.', 'Hoàn: {0}.': 'Refund: {0}.', 'lò rèn': 'forge',
    'Ải Rèn': 'Forge Trial', 'Tinh luyện': 'Refined', 'Viên mãn': 'Perfected', 'Đủ bộ': 'Full set',
    'Luyện 1 vũ khí lên cấp 3': 'Temper 1 weapon to Lv 3', 'Luyện 1 vũ khí lên cấp 9': 'Temper 1 weapon to Lv 9', 'Luyện 1 vũ khí lên cấp 12': 'Temper 1 weapon to Lv 12',
    'Luyện 1 vũ khí lên cấp 15': 'Temper 1 weapon to Lv 15', 'Luyện cả 4 vũ khí lên cấp 6': 'Temper all 4 weapons to Lv 6',
    'NLR': 'FM', '{0} vàng một nguyên liệu rèn. Mỗi ngày bà bán tối đa {1}; hôm nay còn {2}.': '{0} gold per forge material. Up to {1} a day; {2} left today.',
    'Đang có {0} · dùng để luyện vũ khí': 'Have {0} · used to temper weapons', 'Của cháu đây, {0} nguyên liệu rèn.': 'Here you go, {0} forge materials.',
    'Dùng để luyện vũ khí ở lò rèn': 'Used to temper weapons at the forge', 'Để luyện vũ khí': 'For tempering', 'Đến Ông Thợ Rèn: luyện vũ khí': 'Go to the Smith: temper weapons',
    'Đủ đồ rồi! Chọn vũ khí rồi bấm Luyện, lần nào cũng thành công.': 'You have enough! Pick a weapon and temper it, it always works.',
    'Luyện vũ khí cần vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng. Qua ải, Ải Rèn và trùm để gom.': 'Tempering needs gold, spirit, forge materials and region materials. Clear stages, the Forge Trial and bosses.',
    'Quặng, đá, bùa đổi ra {0} nguyên liệu rèn.': 'Ore, stones and wards became {0} forge materials.', 'Nguyên liệu rèn: {0} · Linh khí: {1} · Vàng: {2}': 'Forge materials: {0} · Spirit: {1} · Gold: {2}',
    'Luyện vũ khí thay ép đồ': 'Tempering replaces refining', 'Luyện đang tắt (?luyen=0)': 'Tempering is off (?luyen=0)', 'hạ tinh anh, trùm': 'beat elites, bosses', 'đặc trưng hệ': 'element trait',
    'Lò rèn': 'Forge', 'Đủ đá rồi! Ép lên bậc cao thì có thể hỏng, hỏng chỉ mất đá, không tụt bậc.': 'Enough stones! High tiers can fail; a failure only costs stones, no tier loss.', 'Đủ đồ luyện {0} lên {1} ở Ông Thợ Rèn!': 'Enough to temper {0} to {1} at the Smith!', 'Luyện vũ khí ở Ông Thợ Rèn: vàng, linh khí, nguyên liệu rèn.': 'Temper weapons at the Smith: gold, spirit, forge materials.',
    'Sát thương mỗi đòn {0} · Luyện {1}/{2}': 'Damage per hit {0} · Temper {1}/{2}', 'Luyện cấp {0}': 'Temper Lv {0}', 'Chưa có hệ. Luyện lên cấp 3 (Mầm) ở Ông Thợ Rèn và chọn Lửa, Độc hoặc Băng.': 'No element yet. Temper to Lv 3 (Sprout) at the Smith and pick Fire, Poison or Ice.',
  });
  L.bat = () => G.LUYEN_BAT !== false;
  L.MAX = MAX;
  // ---------- cấp, sức mạnh, giá ----------
  L.cap = (w) => (w ? kep(Math.floor(num(w.luyen, 1)), 1, MAX) : 1);
  L.M = (x) => C[kep((x && typeof x === 'object' ? L.cap(x) : x) | 0, 1, MAX)].M; // M(w) hoặc M(cấp)
  L.gia = (lv) => (lv >= 2 && lv <= MAX ? C[lv] : null); // giá để lên cấp lv từ lv − 1
  L.hinhThai = (lv) => (lv >= CF.hinhThai[2] ? 3 : lv >= CF.hinhThai[1] ? 2 : lv >= CF.hinhThai[0] ? 1 : 0);
  L.khung = (lv) => CF.khung[kep(lv | 0, 1, MAX)] | 0;
  L.phuTu = CF.phuTu;
  // phần sát thương trong M (từ cấp phuTu phần phụ của loại chiếm CF.phuSt, như ép đồ: sát thương = tổng / (1 + phần phụ))
  L.satThuong = (lv) => L.M(lv) / (lv >= CF.phuTu ? 1 + CF.phuSt : 1);
  const daHa = (sv, r) => !!(sv && ((obj(sv.stars) && sv.stars[r + '-4']) || (obj(sv.stars2) && sv.stars2[r + '-4'])));
  L.soTrum = function (sv) { let n = 0; while (n < CF.tran.length - 1 && daHa(sv, n)) n++; return n; };
  L.tran = (sv) => CF.tran[L.soTrum(sv || G.save)];
  L.choChonHe = (w) => !!w && L.cap(w) >= CF.hinhThai[0] && !G.EL[w.branch]; // đã tới Mầm mà chưa có hệ (bản lưu cũ Trắng đổi lên ≥ 3)
  L.dongVM = (w) => (w && CF.vm[w.dongVM] != null ? w.dongVM : CF.vmMacDinh);
  const nlr = (sv) => Math.max(0, Math.floor(num(sv && sv.nlr, 0)));
  L.nlr = (sv) => nlr(sv || G.save);
  const lk = (sv) => (G.vkMoi ? G.vkMoi.lk(sv) : Math.max(0, num(sv.linhKhi, 0)));
  // Lý do chưa luyện được ('' là được). el: hệ chọn khi lên Mầm (Trắng → 3).
  L.duoc = function (sv, w, el) {
    sv = sv || G.save;
    if (!L.bat()) return 'Luyện đang tắt (?luyen=0)';
    if (!sv || !w) return '?';
    const lv = L.cap(w), c = L.gia(lv + 1);
    if (!c) return 'Đã tối đa (cấp 15)';
    if (lv + 1 > L.tran(sv)) return G.t('Cần hạ {0}', tenTrum(L.soTrum(sv)));
    if (lv + 1 === CF.hinhThai[0] && !G.EL[w.branch] && !G.EL[el]) return 'Chọn hệ';
    if (num(sv.gold, 0) < (c.v | 0)) return 'Thiếu vàng';
    if (lk(sv) < (c.lk | 0)) return 'Thiếu linh khí';
    if (nlr(sv) < (c.r | 0)) return 'Thiếu nguyên liệu rèn';
    if (c.nl && num(sv.mats && sv.mats[c.nl[0]], 0) < c.nl[1]) return G.t('Thiếu {0}', G.tv(tenNl(c.nl[0])));
    if (c.m && num(sv.shards && sv.shards[c.m[0]], 0) < c.m[1]) return G.t('Thiếu mảnh {0}', tenTrum(c.m[0]));
    return '';
  };
  // Giá lên cấp lv theo dạng của js/upgrade.js (gold, nlr, lk, mat[], shard[])
  L.giaUpg = function (lv) {
    const c = L.gia(lv);
    if (!c) return null;
    const o = { gold: c.v | 0, nlr: c.r | 0, lk: c.lk | 0, mat: [0, 0, 0], shard: [0, 0, 0, 0] };
    if (c.nl) o.mat[c.nl[0]] += c.nl[1];
    if (c.m) o.shard[c.m[0]] += c.m[1];
    return o;
  };
  // Đặt hình thái theo cấp Luyện (dấu ấn đúng mốc để mọi mã đọc G.wStage / đặc trưng hệ chạy như cũ)
  function dongBo(w) {
    const ht = L.hinhThai(L.cap(w)), he = G.EL[w.branch] ? w.branch : null;
    if (!G.vkMoi) return;
    if (he && ht > 0) { if (G.wStage(w) !== ht) G.vkMoi.datCap(w, ht, he); } else if (G.wStage(w) !== 0 || w.branch) G.vkMoi.datCap(w, 0, null);
  }
  L.dongBo = dongBo;
  // Luyện w lên cấp kế. daTra: giá đã trừ ở ngoài (js/upgrade.js U.doIt). Trả về { L0, L1, d0, d1 } hoặc null.
  L.nang = function (sv, w, el, daTra) {
    if (!daTra && L.duoc(sv, w, el) !== '') return null;
    if (daTra && (!L.gia(L.cap(w) + 1))) return null;
    const lv = L.cap(w), c = L.gia(lv + 1), lvl = sv.heroes && sv.heroes[sv.hero] ? sv.heroes[sv.hero].lvl : 1;
    const d0 = G.wBase(w, lvl);
    if (!daTra) {
      sv.gold -= c.v | 0; sv.nlr = nlr(sv) - (c.r | 0);
      if (G.vkMoi) sv.linhKhi = Math.round((lk(sv) - (c.lk | 0)) * 10) / 10; else sv.linhKhi = lk(sv) - (c.lk | 0);
      if (c.nl) sv.mats[c.nl[0]] -= c.nl[1];
      if (c.m) sv.shards[c.m[0]] -= c.m[1];
    }
    if (!G.EL[w.branch] && lv + 1 >= CF.hinhThai[0] && G.EL[el]) w.branch = el;
    w.luyen = lv + 1;
    if (w.luyen === MAX && CF.vm[w.dongVM] == null) w.dongVM = CF.vmMacDinh;
    dongBo(w);
    return { L0: lv, L1: w.luyen, d0, d1: G.wBase(w, lvl) };
  };
  // Vũ khí đã tới Mầm mà chưa có hệ: chọn hệ miễn phí
  L.chonHe = function (sv, w, el) { if (!L.choChonHe(w) || !G.EL[el]) return false; w.branch = el; dongBo(w); return true; };
  L.datDong = function (w, m) { if (!w || L.cap(w) < MAX || CF.vm[m] == null) return false; w.dongVM = m; return true; };
  L.coTheLuyen = function (sv) { sv = sv || G.save; return !!(L.bat() && sv && Array.isArray(sv.weapons) && sv.weapons.some((w) => { const r = L.duoc(sv, w, 'fire'); return r === ''; })); };
  // Chữ mốc kế: cấp N mở gì
  const PHU_CHU = { sword: '+10% tốc đánh', spear: '+12% tầm đánh', hammer: '+30% thời gian choáng', bow: '+20% sát thương xuyên, xuyên thêm 1 quái' };
  L.moGi = function (w, lv) {
    const he = G.EL[w.branch] ? w.branch : null, F = he && G.HE_FEATURES ? G.HE_FEATURES[he] : null;
    if (lv === CF.hinhThai[0]) return G.tv('Mầm: chọn hệ, đòn có hiệu ứng hệ, vệt chém màu hệ');
    if (lv === CF.hinhThai[1]) return G.t('Thành hình: mở {0}, hiệu ứng hệ 50%', F ? G.tv(F[0].name) : G.tv('đặc trưng hệ'));
    if (lv === CF.hinhThai[2]) return G.t('Thức tỉnh: mở {0}, hiệu ứng hệ 100%', F ? G.tv(F[1].name) : G.tv('đặc trưng hệ'));
    if (lv === CF.phuTu) return G.t('Tinh luyện: {0}', G.tv(PHU_CHU[w.type] || ''));
    if (lv === MAX) return G.tv('Viên mãn: chọn 1 dòng (đổi miễn phí)');
    return '';
  };
  L.mocKe = function (w) { const lv = L.cap(w); for (const m of [CF.hinhThai[0], CF.hinhThai[1], CF.phuTu, CF.hinhThai[2], MAX]) if (m > lv) return m; return null; };
  const VM_CHU = { chiMang: 'Chí mạng +8%', trum: 'Trùm, tinh anh +16%', hoiChieu: 'Hồi chiêu đặc biệt −12%' };
  L.chuDong = (m) => G.tv(VM_CHU[m] || m);

  // ---------- ví: nguyên liệu rèn ----------
  G.themNlr = function (sv, n) { sv = sv || G.save; if (!sv || !(n > 0)) return; sv.nlr = nlr(sv) + Math.round(n); };
  // Mọi chỗ trước cộng quặng gọi hàm này (js/data.js khai sẵn bản dự phòng): cờ bật → NLR 1:1, tắt → quặng như cũ
  G.themQuang = function (sv, n) { sv = sv || G.save; if (!sv || !(n > 0)) return; if (L.bat()) G.themNlr(sv, n); else sv.ore = Math.max(0, num(sv.ore, 0)) + n; };
  G.chuQuang = () => (L.bat() ? '+{0} nguyên liệu rèn' : '+{0} quặng');

  // ---------- móc: sát thương, ép đồ, tên ----------
  if (G.wBase && !G.wBase.luyenBoc) {
    const goc = G.wBase;
    G.wBase = function (w, lvl) {
      if (!L.bat() || !w || !G.WTYPES[w.type]) return goc.apply(this, arguments);
      return G.WTYPES[w.type].dmg * G.wRarMult(w) * L.satThuong(L.cap(w)) * (1 + G.LVL_DMG * ((lvl || 1) - 1));
    };
    for (const k of Object.keys(goc)) if (!(k in G.wBase)) G.wBase[k] = goc[k];
    G.wBase.luyenBoc = true;
  }
  const E = G.epDo;
  if (E && !E.luyenBoc) {
    E.luyenBoc = true;
    const boc = (k, f) => { const goc = E[k]; E[k] = function () { return L.bat() ? f.apply(this, [goc].concat(Array.prototype.slice.call(arguments))) : goc.apply(this, arguments); }; };
    boc('bac', (goc, w) => (w ? L.khung(L.cap(w)) : 0)); // khung ô / màu theo cấp Luyện (phiên 2 đổi số góc ô thành 1–15)
    boc('satThuong', () => 1); // M của cấp Luyện đã nằm trong G.wBase
    boc('phu', (goc, w) => (w && L.cap(w) >= CF.phuTu ? CF.phu[w.type] || 0 : 0));
    boc('xuyen', (goc, w, pierce, pierceMult) => {
      if (!w || w.type !== 'bow' || L.cap(w) < CF.phuTu) return [pierce, pierceMult];
      return [pierce + (CF.xuyenThem | 0), pierceMult == null ? pierceMult : Math.min(1, pierceMult * (1 + (CF.phu.bow || 0)))];
    });
    boc('dong', (goc, w, m) => (w && L.cap(w) >= MAX && L.dongVM(w) === m ? CF.vm[m] : 0)); // chỉ dòng Viên mãn
    boc('duoc', () => 'Luyện vũ khí thay ép đồ');
    boc('coTheEp', () => false);
    boc('themDa', (goc, sv, n) => { G.themNlr(sv, (n > 0 ? n : 0) * G.QUY_DOI.da); });
    boc('themBua', (goc, sv, n) => { G.themNlr(sv, (n > 0 ? n : 0) * G.QUY_DOI.bua); });
    // đá từ trùm → NLR (×2); bùa 10% ở trùm vùng → 6 NLR
    boc('thuongTrum', (goc, sv, r, big, dau, diff) => {
      if (!sv) return [];
      const R = G.EP_DO.roi, i = kep(r | 0, 0, R.vung.length - 1);
      let n = big ? (dau ? R.vungDau[i] : R.vung[i]) : dau ? R.miniDau[i] : R.mini[i];
      if (diff) n = Math.round(n * R.kho2);
      let q = n * G.QUY_DOI.da;
      if (big && Math.random() < (CF.buaTrum || 0)) q += G.QUY_DOI.bua;
      if (q > 0) { G.themNlr(sv, q); return [['+{0} nguyên liệu rèn', q]]; }
      return [];
    });
  }
  // Tên: luật Luyện không ghi "+mài"
  if (G.wName && !G.wName.luyenBoc) {
    const goc = G.wName;
    G.wName = function (w) {
      if (!L.bat() || !w || !w.sharpen) return goc.apply(this, arguments);
      const sh = w.sharpen; w.sharpen = 0;
      try { return goc.apply(this, arguments); } finally { w.sharpen = sh; }
    };
    for (const k of Object.keys(goc)) if (!(k in G.wName)) G.wName[k] = goc[k];
    G.wName.luyenBoc = true;
  }
  // Ánh lưỡi (js/vien_vk.js) theo cấp Luyện thay cấp mài
  if (G.vienVk && G.vienVk.mai && !G.vienVk.mai.luyenBoc) {
    const goc = G.vienVk.mai;
    G.vienVk.mai = function (w) { return L.bat() && w ? Math.min(15, L.cap(w) - 1) : goc.apply(this, arguments); };
    G.vienVk.mai.luyenBoc = true;
  }
  // Nâng cấp hệ bằng linh khí (luật cũ) không còn khi Luyện bật: giá null → bảng / gợi ý cũ không cho nâng
  const VM = G.vkMoi;
  if (VM && !VM.luyenBoc) {
    VM.luyenBoc = true;
    const gia = VM.gia;
    VM.gia = function (st) { return L.bat() ? null : gia.apply(this, arguments); };
    const co = VM.coTheNang;
    VM.coTheNang = function (sv) { return L.bat() ? L.coTheLuyen(sv) : co.apply(this, arguments); };
    const nang = VM.nang;
    VM.nang = function () { return L.bat() ? false : nang.apply(this, arguments); };
    // thanh tiến độ vũ khí trên HUD trong ải (js/stage.js G.markInfo)
    const mi = VM.markInfo;
    VM.markInfo = function (w) {
      if (!L.bat() || !w) return mi.apply(this, arguments);
      const st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null, lv = L.cap(w);
      return { frac: lv / MAX, col: el ? G.EL[el].col : '#b8b0a0', txt: (el ? G.t('{0} · {1}', G.EL[el].name, G.STAGE_NAMES[st]) : G.STAGE_NAMES[0]) + ' · ' + G.t('Lv {0}', lv) };
    };
    // khối "Linh khí" của màn kết quả: nhắc Luyện thay "đủ linh khí nâng hệ"
    const kq = VM.ketQua;
    VM.ketQua = function (S, x, y, wd) {
      if (!L.bat()) return kq.apply(this, arguments);
      const T = G.theme, sv = G.save;
      if (T && T.head) T.head('Linh khí', x, y + 7, { size: 7.5 }); else ui.text('Linh khí', x, y + 7, { size: 7.5, bold: true });
      y += 11;
      const Lg = (S && S.lkGain) || {};
      let got = 0;
      for (const id in Lg) for (const e of ['fire', 'poison', 'ice']) got += num(Lg[id][e], 0);
      ui.rect(x, y, wd, 19, 'rgba(10,22,20,0.55)', 'rgba(255,220,160,0.14)');
      if (VM.gem) VM.gem(x + 8, y + 9.5, 1);
      const nho = !!(T && T.canMoi && T.canMoi()); // can-chu-khung (16/10): hai dòng giữ đúng cỡ 7 / 6,5 (trước bị nâng lên sàn 7,5 nên chồng nhau trong dải 19)
      tx(G.t('+{0} linh khí trận này · đang có {1}', Math.round(got), Math.floor(lk(sv))), x + 17, y + 8, wd - 22, { size: 7, bold: true, tiny: nho, color: '#ffe9a8' });
      const w = sv && Array.isArray(sv.weapons) ? sv.weapons.find((q) => L.duoc(sv, q, q.branch || 'fire') === '') : null;
      tx(w ? G.t('Đủ đồ luyện {0} lên {1} ở Ông Thợ Rèn!', G.tv(G.WTYPES[w.type].name), L.cap(w) + 1) : G.tv('Luyện vũ khí ở Ông Thợ Rèn: vàng, linh khí, nguyên liệu rèn.'), x + 17, y + 16, wd - 22, { size: 6.5, tiny: nho, color: w ? GOOD : '#e8dfcc' });
      return y + 21;
    };
    // ▲ trên HUD linh khí: đủ đồ luyện
    const hud = VM.hud;
    VM.hud = function (P, HUD) {
      const r = hud.apply(this, arguments);
      try { if (r && L.bat() && L.coTheLuyen(G.save)) ui.text('▲', HUD.x + HUD.w - 5, HUD.y + 11.8, { size: 7.5, bold: true, align: 'right', color: GOOD }); } catch (e) { /* bỏ qua */ }
      return r;
    };
  }
  // Thành tựu (G.THANH_TUU): điều kiện theo cấp Luyện (giữ mã; đã nhận vẫn giữ). js/thanh_tuu.js đọc dk.k = 'luyen'.
  if (L.bat() && G.THANH_TUU && Array.isArray(G.THANH_TUU.DS)) {
    const doi = {
      mam: { dk: { k: 'luyen', cap: 3, so: 1 }, cach: 'Luyện 1 vũ khí lên cấp 3' },
      thucTinh1: { dk: { k: 'luyen', cap: 12, so: 1 }, cach: 'Luyện 1 vũ khí lên cấp 12' },
      epTim: { dk: { k: 'luyen', cap: 9, so: 1 }, ten: 'Tinh luyện', cach: 'Luyện 1 vũ khí lên cấp 9' },
      epDo: { dk: { k: 'luyen', cap: 15, so: 1 }, ten: 'Viên mãn', cach: 'Luyện 1 vũ khí lên cấp 15' },
      mai10: { dk: { k: 'luyen', cap: 6, so: 4 }, ten: 'Đủ bộ', cach: 'Luyện cả 4 vũ khí lên cấp 6' },
    };
    for (const a of G.THANH_TUU.DS) if (doi[a.ma]) Object.assign(a, doi[a.ma]);
  }

  // ---------- bản lưu ----------
  const KHOA_TRUOC = 'linhkhi_save_v1_truoc_luyen';
  L.KHOA_TRUOC = KHOA_TRUOC;
  function saoLuu(s) {
    try { const ls = window.localStorage; if (ls && ls.getItem(KHOA_TRUOC) == null) ls.setItem(KHOA_TRUOC, JSON.stringify(s)); } catch (e) { /* bộ nhớ đầy: vẫn chuyển */ }
  }
  // Giá kỳ vọng CỘNG DỒN của ép đồ tới bậc b (tools/can-bang/tinh.js epDo({ n: 4000 }), luật có tụt bậc lúc thiết kế): bản lưu không ghi số lần ép
  const EP_KV = { vang: [0, 100, 321, 769, 1860, 4403, 10847], da: [0, 3, 9.6, 22.4, 54, 131.2, 335.5] };
  const bacCu = (w) => (obj(w.ep) ? kep(Math.floor(num(w.ep.b, 0)), 0, G.EP_DO.ten.length - 1) : 0);
  L.Mcu = (st, sh, b) => G.STAGE_MULT[st] * (1 + 0.08 * sh) * (G.EP_DO.tong[b] || 1);
  const SAN = [1, CF.hinhThai[0], CF.hinhThai[1], CF.hinhThai[2]];
  // THIET-KE.md mục 4.1: M cũ (+2,5% mỗi dòng ép bị bỏ) → cấp có M gần nhất; thấp hơn quá 7% thì +1; giữ hình thái nhưng không nhảy quá 2
  L.capTuongDuong = function (M, st, b) {
    M *= 1 + 0.025 * Math.max(0, (b | 0) - 2);
    let lv = 1;
    for (let k = 2; k <= MAX; k++) if (Math.abs(Math.log(C[k].M / M)) < Math.abs(Math.log(C[lv].M / M))) lv = k;
    if (C[lv].M < 0.93 * M && lv < MAX) lv++;
    lv = Math.max(lv, Math.min(SAN[st | 0], lv + 2));
    return Math.min(MAX, lv);
  };
  const LK_CU = (st) => { let s = 0; const g = (G.VK_MOI && G.VK_MOI.gia) || []; for (let k = 0; k < st; k++) s += g[k] | 0; return s; };
  L.daTieuCu = function (st, sh, b) {
    const o = { vang: 0, lk: LK_CU(st), quang: 0, da: 0 };
    for (let n = 0; n < sh; n++) { const c = G.sharpenFull(n); o.vang += c.gold; o.quang += c.ore; }
    o.vang += EP_KV.vang[b] || 0; o.da += EP_KV.da[b] || 0;
    o.vang = Math.round(o.vang);
    o.nlr = Math.round(o.quang + G.QUY_DOI.da * o.da);
    return o;
  };
  L.giaMoi = function (lv) { const o = { vang: 0, lk: 0, nlr: 0 }; for (let k = 2; k <= lv; k++) { o.vang += C[k].v | 0; o.lk += C[k].lk | 0; o.nlr += C[k].r | 0; } return o; };
  L.hoan = (cu, lv) => { const n = L.giaMoi(lv); return { vang: Math.max(0, cu.vang - n.vang), lk: Math.max(0, cu.lk - n.lk), nlr: Math.max(0, cu.nlr - n.nlr) }; };
  // Sức mạnh của bản lưu s theo luật cũ (bat = false) hoặc luật Luyện. null nếu không tính được (thiếu phần game lúc nạp).
  function sucManh(s, bat) {
    const keep = G.save, giu = G.LUYEN_BAT;
    try { G.LUYEN_BAT = bat; G.save = s; const p = G.power(); return isFinite(p) && p > 0 ? p : null; } catch (e) { return null; } finally { G.save = keep; G.LUYEN_BAT = giu; }
  }
  // Chuyển một bản lưu (đã qua phần sửa của js/engine.js … js/vk_moi.js). Trả về bảng báo.
  L.chuyen = function (s) {
    const cuBan = JSON.parse(JSON.stringify(s)); // để so Sức mạnh luật cũ
    const bao = { vk: [], vang: 0, lk: 0, nlr: 0, nl: [0, 0, 0], lo: 0, sm: null };
    const thong = [];
    for (const w of s.weapons) {
      const st = G.wStage(w), sh = Math.max(0, Math.floor(num(w.sharpen, 0))), b = bacCu(w);
      const lv = L.capTuongDuong(L.Mcu(st, sh, b), st, b);
      thong.push({ w, st, sh, b, cu: L.daTieuCu(st, sh, b) });
      w.hcCu = { marks: Object.assign({}, w.marks), branch: w.branch || null };
      w.luyen = lv;
      if (lv === MAX) w.dongVM = CF.vmMacDinh;
      dongBo(w);
    }
    // Không ai tụt Sức mạnh quá 7%: còn tụt thì nâng thêm cấp cho món làm Sức mạnh tăng nhiều nhất (tối đa 15)
    const p0 = sucManh(cuBan, false);
    if (p0) {
      for (let k = 0; k < 40; k++) {
        const p1 = sucManh(s, true);
        if (p1 == null || p1 >= p0 * (1 - CF.tutToiDa)) break;
        let best = null, bp = -1;
        for (const t of thong) {
          if (t.w.luyen >= MAX) continue;
          t.w.luyen++; dongBo(t.w);
          const p = sucManh(s, true);
          t.w.luyen--; dongBo(t.w);
          if (p != null && p > bp) { bp = p; best = t; }
        }
        if (!best) break;
        best.w.luyen++; if (best.w.luyen === MAX) best.w.dongVM = CF.vmMacDinh; dongBo(best.w);
      }
      bao.sm = [Math.round(p0), Math.round(sucManh(s, true) || 0)];
    }
    for (const t of thong) {
      const h = L.hoan(t.cu, t.w.luyen);
      bao.vang += h.vang; bao.lk += h.lk; bao.nlr += h.nlr;
      if (t.w.luyen > 1 || t.st || t.sh || t.b) bao.vk.push([t.w.type, t.w.luyen]);
    }
    // lò rèn bỏ: hoàn đủ phần đã nâng
    const lo = kep(Math.floor(num(s.forge, 1)), 1, G.FORGE_UP.length);
    for (let k = 1; k < lo; k++) { const u = G.FORGE_UP[k]; if (!u) continue; bao.vang += u.gold | 0; bao.nlr += u.ore | 0; (u.mat || []).forEach((m, i) => { bao.nl[i] += m | 0; }); }
    if (lo > 1) bao.lo = lo;
    // ví cũ → NLR (trường cũ giữ nguyên cho đường lui)
    const vi = Math.max(0, Math.floor(num(s.ore, 0))) + G.QUY_DOI.da * Math.max(0, Math.floor(num(s.daBac, 0))) + G.QUY_DOI.bua * Math.max(0, Math.floor(num(s.buaBac, 0)));
    s.nlr = vi + bao.nlr;
    bao.vi = vi;
    s.gold = Math.max(0, num(s.gold, 0)) + bao.vang;
    if (bao.lk) s.linhKhi = Math.round((lk(s) + bao.lk) * 10) / 10;
    for (let i = 0; i < 3; i++) if (bao.nl[i]) s.mats[i] = Math.max(0, num(s.mats[i], 0)) + bao.nl[i];
    s.luyenChuyen = 1;
    const coTienTrinh = (obj(s.stars) && Object.keys(s.stars).length) || (s.wins | 0) > 0 || bao.vk.length || vi;
    if (coTienTrinh) s.luyenBao = bao;
    return bao;
  };
  // Mỗi lần nạp: đổi bộ hình thái + hệ theo luật đang chạy; số hỏng thì sửa
  function hai(w, bat) {
    const lay = (o) => ({ marks: obj(o && o.marks) ? { fire: Math.max(0, num(o.marks.fire, 0)), poison: Math.max(0, num(o.marks.poison, 0)), ice: Math.max(0, num(o.marks.ice, 0)) } : { fire: 0, poison: 0, ice: 0 }, branch: o && G.EL[o.branch] ? o.branch : null });
    const nay = () => ({ marks: Object.assign({}, w.marks), branch: w.branch || null });
    if (bat && w.hcMoi) { const m = lay(w.hcMoi); w.hcCu = nay(); w.marks = m.marks; w.branch = m.branch; delete w.hcMoi; }
    else if (!bat && w.hcCu) { const m = lay(w.hcCu); w.hcMoi = nay(); w.marks = m.marks; w.branch = m.branch; delete w.hcCu; }
    if (w.hcCu && !obj(w.hcCu)) delete w.hcCu;
    if (w.hcMoi && !obj(w.hcMoi)) delete w.hcMoi;
    if (G.vkMoi) { const st = G.wStage(w); G.vkMoi.datCap(w, st, st > 0 ? w.branch : null); }
  }
  L.sua = function (s, bat) {
    if (!obj(s) || !Array.isArray(s.weapons)) return s;
    if (s.nlr != null || bat) s.nlr = Math.max(0, Math.floor(num(s.nlr, 0)));
    for (const w of s.weapons) {
      if (!obj(w)) continue;
      hai(w, bat);
      if (w.luyen != null) w.luyen = L.cap(w);
      if (w.dongVM != null && CF.vm[w.dongVM] == null) delete w.dongVM;
      if (bat && s.luyenChuyen === 1) { w.luyen = L.cap(w); if (w.luyen === MAX && w.dongVM == null) w.dongVM = CF.vmMacDinh; dongBo(w); }
    }
    if (s.luyenBao != null && !obj(s.luyenBao)) delete s.luyenBao;
    return s;
  };
  const chepCo = (moi, goc) => { for (const k of Object.keys(goc)) if (!(k in moi)) moi[k] = goc[k]; return moi; }; // giữ cờ "đã bọc" của lớp trong (…Boc)
  const daChuyen = (s) => s.luyenChuyen === 1 || (Array.isArray(s.weapons) && s.weapons.some((w) => w && typeof w === 'object' && w.luyen != null));
  if (G.fixSave && !G.fixSave.luyenBoc) {
    const goc = G.fixSave;
    G.fixSave = function (s) {
      const bat = L.bat(), vao = obj(s);
      const chua = bat && vao && s.v === 1 && !daChuyen(s);
      if (chua) saoLuu(s);
      const r = goc.apply(this, arguments);
      if (!obj(r)) return r;
      if (bat && vao && s.v === 1 && r === s && !chua && s.luyenChuyen !== 1) r.luyenChuyen = 1; // bản có w.luyen (tạo khi cờ bật) mà thiếu cờ
      if (chua && r === s) {
        try {
          const c = JSON.parse(JSON.stringify(r));
          L.chuyen(c);
          for (const k of Object.keys(r)) if (!(k in c)) delete r[k];
          Object.assign(r, c);
        } catch (e) { console.error('Linh Khí: lỗi khi chuyển bản lưu sang Luyện vũ khí (giữ nguyên bản lưu, lần nạp sau thử lại)', e); }
      } else if (bat && r !== s) r.luyenChuyen = 1; // bản mới thay bản hỏng / bản trắng
      try { L.sua(r, bat); } catch (e) { console.error('Linh Khí: lỗi khi sửa phần Luyện của bản lưu (bỏ qua)', e); }
      return r;
    };
    chepCo(G.fixSave, goc);
    G.fixSave.luyenBoc = true;
  }
  if (G.newSave && !G.newSave.luyenBoc) {
    const goc = G.newSave;
    G.newSave = function () {
      const s = goc.apply(this, arguments);
      if (obj(s) && L.bat()) { s.nlr = 0; for (const w of s.weapons || []) if (obj(w)) w.luyen = 1; }
      return s;
    };
    chepCo(G.newSave, goc);
    G.newSave.luyenBoc = true;
  }
  if (G.resetSave && !G.resetSave.luyenBoc) {
    const goc = G.resetSave;
    G.resetSave = function () {
      const r = goc.apply(this, arguments);
      if (L.bat() && obj(G.save)) { G.save.luyenChuyen = 1; G.persist(); }
      return r;
    };
    chepCo(G.resetSave, goc);
    G.resetSave.luyenBoc = true;
  }
  // Câu báo một lần ở làng (xoá dấu báo)
  L.bao = function (sv) {
    const b = sv && sv.luyenBao;
    if (sv) delete sv.luyenBao;
    if (!obj(b)) return null;
    const p = [G.tv('Lò rèn đã gộp thành Luyện vũ khí.')];
    if (Array.isArray(b.vk) && b.vk.length) p.push(b.vk.map((q) => G.tv(G.WTYPES[q[0]] ? G.WTYPES[q[0]].name : q[0]) + ' → ' + G.t('Lv {0}', q[1])).join(', ') + '.');
    const ds = [];
    if (b.vang > 0) ds.push(G.t('{0} vàng', Math.round(b.vang)));
    if (b.lk > 0) ds.push(G.t('{0} linh khí', Math.floor(b.lk)));
    if (b.nlr > 0) ds.push(G.t('{0} nguyên liệu rèn', Math.round(b.nlr)));
    for (let i = 0; i < 3; i++) if (b.nl && b.nl[i] > 0) ds.push(b.nl[i] + ' ' + G.tv(tenNl(i)).toLowerCase());
    if (ds.length) p.push(G.t('Hoàn: {0}.', ds.join(', ')));
    if (b.vi > 0) p.push(G.t('Quặng, đá, bùa đổi ra {0} nguyên liệu rèn.', b.vi));
    return p.join(' ');
  };

  // ---------- bảng Luyện (Ông Thợ Rèn, Hành trang › Vũ khí). Giao diện tối thiểu; phiên 2 làm bảng đẹp. ----------
  L.ui = { sel: null };
  const so2 = (v) => { const s = v.toFixed(2); return G.LANG === 'en' ? s : s.replace('.', ','); };
  const so1 = (v) => { const s = v.toFixed(1); return G.LANG === 'en' ? s : s.replace('.', ','); };
  function cat(s, w, size, bold) {
    s = G.tv ? G.tv(String(s)) : String(s);
    ui.font(Math.max(6.5, size), bold);
    const c = G.ux;
    if (c.measureText(s).width <= w) return s;
    let lo = 0, hi = s.length;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c.measureText(s.slice(0, m) + '…').width <= w) lo = m; else hi = m - 1; }
    return s.slice(0, lo).trimEnd() + '…';
  }
  const tx = (s, x, y, w, o) => ui.text(cat(s, w, o.size || 8, o.bold), x, y, o);
  L.chuGia = function (c, sv) {
    const a = [];
    if (c.v) a.push(G.t('{0} vàng', c.v));
    if (c.lk) a.push(G.t('{0} linh khí', c.lk));
    if (c.r) a.push(G.t('{0} NLR', c.r));
    if (c.nl) a.push(c.nl[1] + ' ' + G.tv(tenNl(c.nl[0])).toLowerCase());
    if (c.m) a.push(G.t('{0} mảnh {1}', c.m[1], tenTrum(c.m[0])));
    void sv;
    return a.join(', ');
  };
  L.panel = function (x, y, wd, o) {
    o = o || {};
    const T = G.theme, sv = G.save, say = o.say || (() => {}), ro = !!o.ro, h = o.h || 170;
    if (!T || !sv || !Array.isArray(sv.weapons)) return y;
    const U = L.ui;
    tx(G.t('Nguyên liệu rèn: {0} · Linh khí: {1} · Vàng: {2}', nlr(sv), Math.floor(lk(sv)), Math.floor(num(sv.gold, 0))), x + 2, y + 9, wd - 4, { size: 7, bold: true, color: GOLD });
    y += 13;
    const lw = 100, rowH = Math.min(38, Math.floor((h - 14) / 4));
    if (U.sel == null || !sv.weapons.some((w) => w.id === U.sel)) U.sel = sv.weapons[0] && sv.weapons[0].id;
    sv.weapons.forEach((w, i) => {
      const yy = y + i * rowH, sel = U.sel === w.id;
      T.inset(x, yy, lw, rowH - 2, sel);
      if (G.oBacVk) G.oBacVk(x + 2, yy + 2, rowH - 6, w);
      if (G.art && G.art.weaponIcon) G.art.weaponIcon(G.ux, w, x + 2 + (rowH - 6) / 2, yy + 2 + (rowH - 6) / 2, rowH - 14);
      // can-chu-khung (16/10): hai dòng (tên, cấp) là một khối nằm giữa ô theo chiều dọc (?canchucu=1: như cũ, dồn lên trên ~3 điểm)
      const b1 = T.canMoi && T.canMoi() ? yy + (rowH - 2 - (11 + 7.5 * 0.73)) / 2 + 7.5 * 0.73 : yy + 12;
      tx(G.tv(G.WTYPES[w.type].name), x + rowH, b1, lw - rowH - 3, { size: 7.5, bold: true, color: G.bacMauVk ? G.bacMauVk(w) : TXT });
      tx(G.t('Lv {0}', L.cap(w)) + (sv.carry && sv.carry[0] === w.id ? ' · ★' : ''), x + rowH, b1 + 11, lw - rowH - 3, { size: 7, color: TXT });
      if (!ro && (L.duoc(sv, w, 'fire') === '' || L.choChonHe(w))) { const c = G.ux; c.fillStyle = GOOD; c.beginPath(); c.arc(x + lw - 5, yy + 5, 2.4, 0, 7); c.fill(); }
      if (G.click && G.inRect(G.click, x, yy, lw, rowH - 2)) { U.sel = w.id; G.click = null; if (G.sfx) G.sfx('ui'); }
    });
    const w = sv.weapons.find((q) => q.id === U.sel);
    const rx = x + lw + 6, rw = wd - lw - 6, l5 = 6, rh = h - 14;
    T.inset(rx, y, rw, rh, false);
    if (!w) { ui.text(G.tv('Chọn một vũ khí để luyện.'), rx + 6, y + 14, { size: 7.5, color: SOFT }); return y + rh; }
    const lv = L.cap(w), c = L.gia(lv + 1), lvl = sv.heroes[sv.hero].lvl;
    let yy = y + 12;
    if (T.canMoi && T.canMoi()) T.chuO(G.wName(w) + ' · ' + G.t('Luyện {0}/{1}', lv, MAX), rx, y, rw, rh, { align: 'left', vung: [rx + l5 - 1, y, rw - 10, 15], size: 8, min: 7, bold: true, color: G.bacMauVk ? G.bacMauVk(w) : GOLD }); // can-chu-khung: dòng đầu trong lòng ô (trước: đè đinh góc trên trái)
    else tx(G.wName(w) + ' · ' + G.t('Luyện {0}/{1}', lv, MAX), rx + l5, yy, rw - 10, { size: 8, bold: true, color: G.bacMauVk ? G.bacMauVk(w) : GOLD });
    yy += 11;
    const d0 = G.wBase(w, lvl);
    let d1 = null;
    if (c) { const giu = w.luyen; w.luyen = lv + 1; try { d1 = G.wBase(w, lvl); } finally { w.luyen = giu; } }
    tx(c ? G.t('Sức mạnh vũ khí ×{0} → ×{1}', so2(L.M(lv)), so2(L.M(lv + 1))) + ' · ' + G.t('Đòn {0} → {1}', so1(d0), so1(d1)) : G.t('Đòn {0}', so1(d0)), rx + l5, yy, rw - 10, { size: 6.8, color: TXT });
    yy += 10;
    const mk = L.mocKe(w);
    if (mk) { tx(G.t('Cấp {0} mở: {1}', mk, L.moGi(w, mk)), rx + l5, yy, rw - 10, { size: 6.5, color: SOFT }); yy += 10; }
    if (lv >= CF.phuTu) { tx(G.t('Tinh luyện: {0}', G.tv(PHU_CHU[w.type] || '')), rx + l5, yy, rw - 10, { size: 6.5, color: GOOD }); yy += 10; }
    // hệ: chọn (đã tới Mầm mà chưa có hệ) / đổi hệ (tốn linh khí như cũ)
    const els = ['fire', 'poison', 'ice'], bw = Math.floor((rw - 14) / 3);
    if (!ro && L.choChonHe(w)) {
      tx('Chọn hệ (miễn phí)', rx + l5, yy, rw - 10, { size: 6.8, bold: true, color: GOLD }); yy += 3;
      els.forEach((e, i) => { if (T.sbtn(rx + l5 + i * (bw + 2), yy, bw, 13, G.tv(G.EL[e].name), { size: 6.8, pad: 1 })) { if (L.chonHe(sv, w, e)) { G.persist(); if (G.sfx) G.sfx('evolve'); say(G.t('{0} theo hệ {1}.', G.tv(G.WTYPES[w.type].name), G.tv(G.EL[e].name))); } } });
      yy += 17;
    } else if (!ro && G.wStage(w) > 0 && G.vkMoi) {
      const gd = G.vkMoi.giaDoiHe(G.wStage(w));
      let k = 0;
      els.forEach((e) => {
        if (e === w.branch) return;
        if (T.sbtn(rx + l5 + k * (bw + 2), yy, bw, 13, G.t('Đổi {0} · {1}', G.tv(G.EL[e].name), gd + ' LK'), { size: 6.3, pad: 1, disabled: lk(sv) < gd })) {
          if (G.vkMoi.doiHe(sv, w, e)) { G.persist(); if (G.sfx) G.sfx('evolve'); say(G.t('{0} theo hệ {1}.', G.tv(G.WTYPES[w.type].name), G.tv(G.EL[e].name))); }
        }
        k++;
      });
      if (!ro && T.sbtn(rx + l5 + k * (bw + 2), yy, bw, 13, sv.carry && sv.carry[0] === w.id ? 'Đang cầm đầu' : 'Cầm đầu', { size: 6.3, pad: 1, disabled: sv.carry && sv.carry[0] === w.id })) {
        G.vkMoi.camDau(sv, w.type); G.persist(); if (G.sfx) G.sfx('pick'); say(G.t('Vào ải sẽ cầm {0} trước.', G.tv(G.WTYPES[w.type].name)));
      }
      yy += 17;
    }
    // dòng Viên mãn
    if (lv >= MAX) {
      tx(G.tv('Dòng Viên mãn'), rx + l5, yy, rw - 10, { size: 6.8, bold: true, color: GOLD }); yy += 3;
      Object.keys(CF.vm).forEach((m, i) => {
        const on = L.dongVM(w) === m;
        if (T.sbtn(rx + l5 + i * (bw + 2), yy, bw, 13, L.chuDong(m), { size: 6, pad: 1, sel: on, disabled: ro }) && !ro && !on) { L.datDong(w, m); G.persist(); say(G.t('Đã chọn dòng: {0}', L.chuDong(m))); }
      });
      yy += 17;
    }
    if (ro) return y + rh;
    // phần luyện (dưới cùng)
    const yb = y + rh - 30;
    if (!c) { ui.text(G.tv('Đã tối đa (cấp 15)'), rx + l5, yb + 16, { size: 8, bold: true, color: GOOD }); return y + rh; }
    const why = L.duoc(sv, w, 'fire');
    const khoa = lv + 1 > L.tran(sv);
    tx(khoa ? G.t('Cần hạ {0} để luyện quá cấp {1}', tenTrum(L.soTrum(sv)), lv) : G.t('Tốn: {0}', L.chuGia(c, sv)), rx + l5, yb + 4, rw - 12, { size: 6.5, color: why && why !== 'Chọn hệ' ? WARN : TXT });
    const lam = (el) => {
      const ten = G.tv(G.WTYPES[w.type].name), kq = L.nang(sv, w, el);
      if (!kq) return;
      G.persist(); if (G.sfx) G.sfx('evolve');
      const mo = L.moGi(w, kq.L1);
      say(G.t('{0} Lv {1} → {2}: đòn +{3}', ten, kq.L0, kq.L1, so1(kq.d1 - kq.d0)) + (mo ? ' · ' + mo : ''));
    };
    if (lv + 1 === CF.hinhThai[0] && !G.EL[w.branch]) { // lên Mầm: chọn hệ ngay trên nút
      els.forEach((e, i) => {
        const r = L.duoc(sv, w, e);
        if (T.sbtn(rx + l5 + i * (bw + 2), yb + 10, bw, 16, G.t('Luyện · {0}', G.tv(G.EL[e].name)), { size: 6.8, pad: 1, primary: !r, disabled: !!r })) lam(e);
      });
    } else if (T.sbtn(rx + rw - 82, yb + 10, 76, 16, G.t('Luyện lên {0}', lv + 1), { size: 7.5, pad: 1, primary: !why, disabled: !!why })) lam(null);
    if (why && !khoa && why !== 'Chọn hệ') tx(why, rx + l5, yb + 21, rw - 92, { size: 6.5, color: WARN });
    return y + rh;
  };
})();
