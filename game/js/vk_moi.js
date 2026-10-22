// HỆ THỐNG MỚI ĐỢT 1 (13/10/2026) — docs/review/ke-hoach-cai-thien/he-thong-moi/YEU-CAU-1-VU-KHI.md
//   - Đúng 4 vũ khí cố định: Kiếm, Thương, Búa, Phi tiêu (loại 'bow'). sv.weapons luôn đúng 4 món, sv.carry = cả 4 (thứ tự xoay vòng
//     theo sv.vkThu; nút đổi vũ khí trong trận xoay vòng, js/combat.js).
//   - LINH KHÍ thành một túi chung sv.linhKhi: mọi dấu ấn trước đây cộng vào vũ khí (G.addMarks) nay cộng vào túi. Nâng vũ khí
//     Trắng → Mầm (chọn hệ Lửa/Độc/Băng) → Thành hình → Thức tỉnh bằng linh khí (G.VK_MOI.gia), đổi hệ tốn linh khí (G.VK_MOI.doiHe).
//     Cấp vẫn lưu bằng w.branch + w.marks (dấu ấn đặt đúng mốc G.MARKS) nên mọi mã cũ đọc G.wStage / đặc trưng hệ chạy y như trước.
//   - Không rơi đồ: thưởng thay thế G.ROI_MOI (js/stage.js gọi VM.thuongVk / thuongTrum / thuongAo / thuongAoTrum).
//   - Trang phục: chỉ 4 bộ Zed (G.ZED_BO). Cấp bộ sv.boCap[bo] = 0..3, nâng bằng linh khí + vàng (G.BO_MOI). Móc rỗng G.boSkill(bo, cap)
//     (đợt 3 gắn skill), gắn vào người chơi lúc dựng (P.bo, P.boCap, P.boSkill).
//   - Bản lưu: bọc G.fixSave (chạy sau js/engine.js và js/linhkhi.js; mọi đường nạp máy / mây đi qua): chuyển MỘT lần (cờ sv.heMoi = 1),
//     trước khi chuyển chép bản gốc sang khoá linhkhi_save_v1_truoc_he_moi (giữ bản đầu tiên; chỉ để cứu tay, game không đọc lại).
//     Mỗi lần nạp: giữ đúng 4 vũ khí, sửa số hỏng.
//     Đợt 2 (YEU-CAU-2-DON-CU.md): js/outfit.js đã xoá — bảng giá quần áo cũ dùng để hoàn tiền nằm ngay trong tệp này (AO_CU, AO_TU_CU).
//   - Hình vũ khí trong ô đồ: bộ zed-vk (4 loại × 4 cấp, cùng ảnh js/zed_moi.js vẽ trên tay Zed); chưa tải xong thì không vẽ gì (14/10).
// Đợt 2: bỏ cờ ?hethongcu=1 — luôn chạy luật này.
(function () {
  const G = window.G, ui = G.ui;
  const VM = (G.vkMoi = {});
  const ELS = ['fire', 'poison', 'ice'];
  const CFG = G.VK_MOI || { loai: ['sword', 'spear', 'hammer', 'bow'], family: {}, gia: [60, 340, 500], doiHe: [0, 20, 60, 120] };
  const LOAI = CFG.loai;
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const r1 = (v) => Math.round(v * 10) / 10;
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  // Đợt 4: bản tiếng Anh của chữ mới (cân lại đồ, mảnh trùm của bộ, skill bộ đổi số, bảng tài nguyên)
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Thiếu mảnh trùm': 'Need shards',
    'và {0} mảnh {1} (đang có {2}; hạ trùm vùng {3} được 3 mảnh)': 'and {0} {1} shards (have {2}; the {3} boss gives 3)',
    'Đã cân lại đồ theo luật mới.': 'Your gear has been rebalanced to the new rules.',
    'Hoàn lại: {0}.': 'Refunded: {0}.',
    '{0} nguyên liệu': '{0} materials',
    'Điểm kỹ năng đã trả lại, con phân lại ở Cụ Đồ nhé.': 'Skill points were refunded; reassign them at the Scholar.',
    'Điểm chưởng đã trả lại, học lại ở Cụ Đồ nhé.': 'Palm points were refunded; relearn them at the Scholar.',
    'Lộn để lại bóng mờ {0} giây, quái nhắm vào bóng; hồi {1} giây': 'Dodge leaves a decoy for {0}s that monsters target; {1}s cooldown',
    'Mỗi {0} giây có 1 lớp khiên chặn 1 đòn (tối đa {1}% máu)': 'Every {0}s a shield blocks one hit (up to {1}% HP)',
    'Khiên vỡ!': 'Shield broke!',
    'Qua ải, hạ quái, tinh anh, trùm, phòng thử thách': 'Clear stages, kill monsters, elites, bosses, challenge rooms',
    'Mài vũ khí, nâng lò cấp 4': 'Sharpen weapons, forge Lv 4',
    'Nâng lò cấp 2, mài +5 lên +6': 'Forge Lv 2, sharpen +5 to +6',
    'Mài từ +6 tới +9, nâng lò cấp 3': 'Sharpen +6 to +9, forge Lv 3',
    'Mài từ +9 trở lên, nâng lò cấp 4': 'Sharpen from +9 up, forge Lv 4',
    'Nâng bộ Ninja và bộ Rừng lên cấp 2, 3': 'Upgrade the Ninja and Forest outfits to Lv 2, 3',
    'Nâng bộ của vùng này lên cấp 2, 3': "Upgrade this region's outfit to Lv 2, 3",
  });

  // ---------- móc skill của bộ trang phục ----------
  // bo: 'ninja' | 'rung' | 'bien' | 'lau'; cap: 0..3. Trả về skill đã mở hoặc null. Bản rỗng này chỉ là dự phòng:
  // đợt 3 (js/bo_skill.js, nạp sau tệp này) thay bằng bản thật đọc bảng G.SKILL_BO (js/data.js); ?skillbo=0 → luôn null.
  G.boSkill = function (bo, cap) { void bo; void cap; return null; };

  // ---------- linh khí ----------
  VM.lk = (sv) => Math.max(0, num((sv || G.save || {}).linhKhi, 0));
  VM.themLk = function (sv, n) { sv = sv || G.save; if (!sv || !(n > 0)) return; sv.linhKhi = r1(VM.lk(sv) + n); };
  VM.gia = (st) => (st >= 0 && st < 3 ? CFG.gia[st] : null); // linh khí để lên cấp st + 1
  VM.giaDoiHe = (st) => CFG.doiHe[kep(st | 0, 0, 3)];
  // Đặt cấp st (0..3) và hệ el cho vũ khí: dấu ấn đặt đúng mốc để G.wStage(w) = st.
  VM.datCap = function (w, st, el) {
    w.marks = { fire: 0, poison: 0, ice: 0 };
    if (st > 0 && G.EL[el]) { w.branch = el; w.marks[el] = G.MARKS[st - 1]; } else w.branch = null;
  };
  // Nâng w lên cấp kế (Trắng → Mầm cần chọn hệ el). mienPhi: chỉ để tính thử (không trừ linh khí).
  VM.nang = function (sv, w, el, mienPhi) {
    if (!sv || !w) return false;
    const st = G.wStage(w), c = VM.gia(st);
    if (c == null) return false;
    const he = st === 0 ? el : w.branch;
    if (!G.EL[he]) return false;
    if (!mienPhi) { if (VM.lk(sv) < c) return false; sv.linhKhi = r1(VM.lk(sv) - c); }
    VM.datCap(w, st + 1, he);
    return true;
  };
  VM.doiHe = function (sv, w, el) {
    if (!sv || !w) return false;
    const st = G.wStage(w), c = VM.giaDoiHe(st);
    if (st < 1 || !G.EL[el] || el === w.branch || VM.lk(sv) < c) return false;
    sv.linhKhi = r1(VM.lk(sv) - c);
    VM.datCap(w, st, el);
    return true;
  };
  // Có vũ khí nào nâng được ngay không (chấm đỏ ở Ông Thợ Rèn)
  VM.coTheNang = function (sv) {
    sv = sv || G.save;
    if (!sv || !Array.isArray(sv.weapons)) return false;
    return sv.weapons.some((w) => { const c = VM.gia(G.wStage(w)); return c != null && VM.lk(sv) >= c; });
  };
  // Đưa loại t lên đầu vòng xoay (vũ khí cầm khi vào ải)
  VM.camDau = function (sv, t) {
    if (!sv || !Array.isArray(sv.vkThu) || sv.vkThu.indexOf(t) < 0) return;
    const i = sv.vkThu.indexOf(t);
    sv.vkThu = sv.vkThu.slice(i).concat(sv.vkThu.slice(0, i));
    sv.carry = sv.vkThu.map((k) => { const w = sv.weapons.find((x) => x.type === k); return w ? w.id : null; }).filter((id) => id != null);
  };

  // ---------- bộ trang phục Zed ----------
  VM.boCap = (sv, bo) => { sv = sv || G.save; const m = sv && sv.boCap && typeof sv.boCap === 'object' ? sv.boCap : {}; return kep(Math.floor(num(m[bo], 0)), 0, (G.BO_MOI || { max: 3 }).max); };
  VM.boGia = (cap) => (G.BO_MOI && cap >= 0 && cap < G.BO_MOI.max ? G.BO_MOI.gia[cap] : null);
  // Đợt 4: cấp 2, 3 của bộ tốn thêm mảnh trùm của vùng mở bộ đó (G.BO_MOI.vungManh; bộ Ninja dùng mảnh Mộc Tinh).
  VM.boVungManh = (bo) => kep(num(G.BO_MOI && G.BO_MOI.vungManh ? G.BO_MOI.vungManh[bo] : 0, 0) | 0, 0, 2);
  VM.manh = (sv, bo) => { sv = sv || G.save; return Math.max(0, num(sv && Array.isArray(sv.shards) ? sv.shards[VM.boVungManh(bo)] : 0, 0)); };
  VM.boDuoc = function (sv, bo) { // '' là nâng được; không thì lý do
    sv = sv || G.save;
    if (!G.ZED_BO || !G.ZED_BO[bo]) return 'Không có bộ này';
    if (!G.zedBoMo(bo, sv)) return G.BO_MUA_BAT !== false ? 'Chưa mua bộ' : 'Chưa mở bộ';
    const g = VM.boGia(VM.boCap(sv, bo));
    if (!g) return 'Đã tối đa';
    if (VM.lk(sv) < g.lk) return 'Thiếu linh khí';
    if ((sv.gold | 0) < g.vang) return 'Thiếu vàng';
    if (VM.manh(sv, bo) < (g.manh | 0)) return 'Thiếu mảnh trùm';
    return '';
  };
  VM.nangBo = function (sv, bo) {
    if (VM.boDuoc(sv, bo) !== '') return false;
    const cap = VM.boCap(sv, bo), g = VM.boGia(cap);
    sv.linhKhi = r1(VM.lk(sv) - g.lk); sv.gold -= g.vang;
    if (g.manh > 0 && Array.isArray(sv.shards)) sv.shards[VM.boVungManh(bo)] -= g.manh;
    if (!sv.boCap || typeof sv.boCap !== 'object' || Array.isArray(sv.boCap)) sv.boCap = {};
    sv.boCap[bo] = cap + 1;
    return true;
  };
  VM.coTheNangBo = function (sv) {
    sv = sv || G.save;
    return !!(G.ZED_BO_KEYS && G.ZED_BO_KEYS.some((k) => VM.boDuoc(sv, k) === ''));
  };
  // ---------- MUA bộ bằng vàng ở Cô Thợ May (15/10, bo-do-mua; giá G.BO_MUA trong js/data.js, cờ quay lui ?bocu=1) ----------
  VM.boMuaDuoc = function (sv, bo) { // '' là mua được; không thì lý do
    sv = sv || G.save;
    if (G.BO_MUA_BAT === false) return 'Tắt bán bộ';
    if (!G.ZED_BO || !G.ZED_BO[bo] || bo === 'ninja') return 'Không có bộ này';
    if (G.zedBoMo(bo, sv)) return 'Đã có';
    if (!G.zedBoBan(bo, sv)) return 'Chưa mở bán';
    if ((num(sv.gold, 0) | 0) < G.zedBoGia(bo)) return 'Thiếu vàng';
    return '';
  };
  VM.muaBo = function (sv, bo) {
    sv = sv || G.save;
    if (VM.boMuaDuoc(sv, bo) !== '') return false;
    sv.gold = Math.floor(num(sv.gold, 0)) - G.zedBoGia(bo);
    if (!sv.zed || typeof sv.zed !== 'object' || Array.isArray(sv.zed)) sv.zed = { v: 1, hoc: {} };
    const z = sv.zed;
    if (!z.boMo || typeof z.boMo !== 'object' || Array.isArray(z.boMo)) z.boMo = {};
    z.boMo[bo] = 1; z.boMua = 1;
    if (z.boBan && typeof z.boBan === 'object') { delete z.boBan[bo]; if (!Object.keys(z.boBan).length) { delete z.boBan; delete z.boBanBao; } }
    return true;
  };
  // còn bộ đang bán mà chưa mua
  VM.boDangBan = (sv) => (G.BO_MUA_BAT === false ? [] : (G.ZED_BO_KEYS || []).filter((k) => k !== 'ninja' && !G.zedBoMo(k, sv) && G.zedBoBan(k, sv)));
  // chấm đỏ Cô Thợ May: có bộ vừa mở bán chưa xem ở thẻ Mua, hoặc đủ vàng mua một bộ đang bán
  VM.coTheMuaBo = function (sv) {
    sv = sv || G.save;
    const xem = sv && sv.zed && sv.zed.boXem && typeof sv.zed.boXem === 'object' ? sv.zed.boXem : {};
    return VM.boDangBan(sv).some((k) => !xem[k] || VM.boMuaDuoc(sv, k) === '');
  };
  VM.daXemBan = function (sv) { // mở thẻ Mua: các bộ đang bán coi như đã xem (chỉ còn chấm khi đủ vàng)
    sv = sv || G.save;
    const ds = VM.boDangBan(sv);
    if (!ds.length || !sv.zed) return false;
    if (!sv.zed.boXem || typeof sv.zed.boXem !== 'object' || Array.isArray(sv.zed.boXem)) sv.zed.boXem = {};
    let doi = false;
    for (const k of ds) if (!sv.zed.boXem[k]) { sv.zed.boXem[k] = 1; doi = true; }
    return doi;
  };

  // ---------- thưởng thay đồ rơi (js/stage.js gọi) ----------
  const vung = (r) => kep(r | 0, 0, G.REGIONS.length - 1); // vùng 4: bảng G.ROI_MOI có phần tử thứ 4 (js/data.js)
  const chuThuong = (vang, lk) => (vang && lk ? G.t('{0} vàng, {1} linh khí', vang, lk) : lk ? G.t('{0} linh khí', lk) : G.t('{0} vàng', vang));
  VM.thuongVk = function (r) {
    const T = G.ROI_MOI.vk, i = vung(r), sv = G.save, vang = T.vang[i], lk = T.lk[i];
    sv.gold += vang; VM.themLk(sv, lk);
    return { vang, lk, s: chuThuong(vang, lk) };
  };
  VM.thuongTrum = function (r) {
    const T = G.ROI_MOI.trum, sv = G.save, reg = G.REGIONS[vung(r)];
    if (!sv.bossGold || typeof sv.bossGold !== 'object') sv.bossGold = {};
    const dau = !sv.bossGold[reg.boss];
    sv.bossGold[reg.boss] = true;
    const vang = dau ? T.vangDau : T.vang, lk = dau ? T.lkDau : T.lk;
    sv.gold += vang; VM.themLk(sv, lk);
    return { vang, lk, s: chuThuong(vang, lk) };
  };
  VM.thuongAo = function (r) {
    const vang = G.ROI_MOI.ao.vang[vung(r)];
    G.save.gold += vang;
    return { vang, lk: 0, s: chuThuong(vang, 0) };
  };
  // Phần trang phục của màn kết quả: bùa cũ của tinh anh, trùm nhỏ (35%) và trùm vùng (luôn). null nếu không có gì.
  VM.thuongAoTrum = function (r, big, bua) {
    const T = G.ROI_MOI;
    let vang = bua ? T.bua : 0;
    if (big) vang += T.aoTrumVung;
    else if (G.rnd() < 0.35) vang += T.aoTrum.vang[vung(r)]; // 35%: tỉ lệ trùm nhỏ rơi trang phục của luật cũ
    if (!vang) return null;
    G.save.gold += vang;
    return { vang, lk: 0, s: chuThuong(vang, 0) };
  };

  // ---------- bản lưu ----------
  const KHOA_TRUOC = 'linhkhi_save_v1_truoc_he_moi';
  VM.KHOA_TRUOC = KHOA_TRUOC;
  function saoLuu(s) {
    try {
      const ls = window.localStorage;
      if (ls && ls.getItem(KHOA_TRUOC) == null) ls.setItem(KHOA_TRUOC, JSON.stringify(s));
    } catch (e) { /* bộ nhớ đầy: vẫn chuyển, chỉ mất bản sao */ }
  }
  const OLD_MAX = [2, 3, 3, 3]; // cấp cao nhất theo bậc cũ (Thường chỉ tới Thành hình)
  const rarOf = (w) => kep(Math.floor(num(w.rarity != null ? w.rarity : w.tier, 0)), 0, 3);
  function capCu(w) {
    if (!w.branch || !w.marks) return 0;
    const m = num(w.marks[w.branch], 0), M = G.MARKS;
    const st = m >= M[2] ? 3 : m >= M[1] ? 2 : m >= M[0] ? 1 : 0;
    return Math.min(st, OLD_MAX[rarOf(w)]);
  }
  const W_GIA = [20, 60, 150, 400], W_MAI = 15, O_GIA = [10, 30, 80, 200], O_CANH = [0, 0, 40, 140], O_LK = [2, 5, 10, 20];
  VM.BANG_HOAN = { W_GIA, W_MAI, O_GIA, O_CANH, O_LK };
  // Quần áo cũ (chép từ js/outfit.js đã xoá ở đợt 2, chỉ phần cần để hoàn tiền): mã món → [ô, giá bà bán (0 = không bán)].
  const AO_CU = {
    mu_sung: ['hat', 0], ao_vo_cay: ['robe', 0], gui_tre: ['back', 0], bua_nanh: ['hand', 0], canh_la: ['wing', 0],
    mu_vay_ca: ['hat', 0], ao_vay: ['robe', 0], khan_bang: ['back', 0], bua_oc: ['hand', 0], canh_bang: ['wing', 0],
    mu_tai_cao: ['hat', 0], ao_long: ['robe', 0], trong_nho: ['back', 0], bua_lua: ['hand', 0], canh_lua: ['wing', 0],
    non_la: ['hat', 0], mu_da_ca: ['hat', 0], khan_lua: ['hat', 0], mu_rom: ['hat', 60], khan_xep: ['hat', 90], vong_la: ['hat', 0],
    ao_vai: ['robe', 100], ao_da_bien: ['robe', 0], giap_da: ['robe', 0], ao_toi: ['robe', 120], ao_the: ['robe', 140], ao_la: ['robe', 0],
    giap_tre: ['robe', 0], ao_choang: ['back', 110], ong_ten: ['back', 80], ho_lo: ['back', 0], bua_hut: ['hand', 0], bua_tan: ['hand', 0],
    bua_suong: ['hand', 0], bua_tham: ['hand', 0], bua_linh: ['hand', 0], canh_chuon: ['wing', 0],
  };
  // Mũ, áo, bùa đời trước nữa (s.owned) → [món, bậc] (cách js/outfit.js cũ chuyển sang trang phục).
  const AO_TU_CU = {
    h_r1: ['non_la', 0], h_r2: ['mu_da_ca', 0], h_r3: ['khan_lua', 0], h_moc: ['mu_sung', 1], h_ngu: ['mu_vay_ca', 1], h_ho: ['mu_tai_cao', 1],
    a_r1: ['ao_vai', 0], a_r2: ['ao_da_bien', 0], a_r3: ['giap_da', 0], a_moc: ['ao_vo_cay', 1], a_ngu: ['ao_vay', 1], a_ho: ['ao_long', 1],
    c_leech: ['bua_hut', 1], c_ember: ['bua_tan', 1], c_mist: ['bua_suong', 1], c_greed: ['bua_tham', 1], c_spirit: ['bua_linh', 1],
  };
  // Gom mọi món quần áo cũ của bản lưu (bỏ qua mã lạ, món trùng số, món hỏng): [{ k, r, lv }]. Tối đa 40 món như kho cũ.
  function aoCu(s) {
    const ds = [], seen = {}, cu = {};
    const items = s.outfit && typeof s.outfit === 'object' && Array.isArray(s.outfit.items) ? s.outfit.items : [];
    for (const it of items) {
      if (!it || typeof it !== 'object' || !AO_CU[it.k] || typeof it.id !== 'number' || !isFinite(it.id) || seen[it.id]) continue;
      seen[it.id] = true;
      if (it.old != null) cu[it.old] = true;
      ds.push({ k: it.k, r: kep(Math.floor(num(it.r, 0)), 0, 3), lv: kep(Math.floor(num(it.lv, 1)), 1, 3) });
    }
    const own = s.owned && typeof s.owned === 'object' && !Array.isArray(s.owned) ? s.owned : {};
    for (const slot of ['helm', 'armor', 'charm']) {
      const list = Array.isArray(own[slot]) ? own[slot] : [];
      list.forEach((id, i) => { const q = AO_TU_CU[id]; if (q && !cu[id] && list.indexOf(id) === i) { cu[id] = true; ds.push({ k: q[0], r: q[1], lv: 1 }); } });
    }
    return ds.slice(0, 40);
  }
  // Xoá các trường quần áo cũ khỏi bản lưu (đã hoàn tiền).
  function boAoCu(s) { delete s.outfit; delete s.owned; delete s.helm; delete s.armor; delete s.charm; }
  // Chuyển MỘT lần bản lưu cũ sang hệ mới (s đã qua phần sửa của js/engine.js và js/linhkhi.js; dấu ấn đã theo mốc G.MARKS).
  //  - Mỗi loại vũ khí: giữ món có cấp cao nhất (cấp theo bậc cũ), hệ của món đó; độ mài = mài cao nhất của loại đó.
  //    Dấu ấn còn dư của món giữ (phần vượt mốc cấp đang có) thành linh khí; hệ phụ tính một nửa.
  //  - Bậc màu của món giữ hoàn vàng (giá Bà Hàng Xén trừ giá đồ Thường). Món trùng: hoàn đủ giá Bà Hàng Xén (cả mài, trừ phần mài đã
  //    chuyển sang món giữ) + một nửa dấu ấn thành linh khí.
  //  - Quần áo cũ (kể cả mũ, áo, bùa đời cũ đã chuyển thành trang phục): hoàn gấp đôi giá Bà Hàng Xén mua lại + linh khí theo bậc.
  VM.chuyen = function (s) {
    const hoan = { vang: 0, lk: 0, vk: 0, ao: 0 };
    const giu = {}, ws = Array.isArray(s.weapons) ? s.weapons : [];
    for (const t of LOAI) {
      const ds = ws.filter((w) => w && w.type === t);
      if (!ds.length) continue;
      const mk = (w) => (w.branch && w.marks ? num(w.marks[w.branch], 0) : 0);
      ds.sort((a, b) => capCu(b) - capCu(a) || mk(b) - mk(a) || (b.sharpen | 0) - (a.sharpen | 0) || rarOf(b) - rarOf(a) || a.id - b.id);
      const w = ds[0], st = capCu(w), mai = Math.max.apply(null, ds.map((x) => x.sharpen | 0));
      const m = w.marks || {};
      const chinh = st > 0 ? w.branch : ELS.slice().sort((a, b) => num(m[b], 0) - num(m[a], 0))[0];
      for (const e of ELS) {
        const v = Math.max(0, num(m[e], 0));
        hoan.lk += e === chinh ? Math.max(0, v - (st > 0 ? G.MARKS[st - 1] : 0)) : v * 0.5;
      }
      hoan.vang += W_GIA[rarOf(w)] - W_GIA[0];
      let daLay = (w.sharpen | 0) === mai;
      for (const x of ds.slice(1)) {
        hoan.vk++;
        let sh = x.sharpen | 0;
        if (!daLay && sh === mai) { daLay = true; sh = 0; }
        hoan.vang += W_GIA[rarOf(x)] + sh * W_MAI;
        const xm = x.marks || {};
        for (const e of ELS) hoan.lk += Math.max(0, num(xm[e], 0)) * 0.5;
      }
      w.sharpen = mai;
      VM.datCap(w, st, st > 0 ? w.branch : null);
      giu[t] = w;
    }
    // thứ tự xoay vòng: món đang mang trước
    const thu = [];
    for (const id of Array.isArray(s.carry) ? s.carry : []) { const x = ws.find((w) => w && w.id === id); if (x && LOAI.indexOf(x.type) >= 0 && thu.indexOf(x.type) < 0) thu.push(x.type); }
    for (const t of LOAI) if (thu.indexOf(t) < 0) thu.push(t);
    s.vkThu = thu;
    s.weapons = LOAI.map((t) => giu[t]).filter(Boolean);
    // quần áo cũ
    for (const it of aoCu(s)) {
      const r = it.r, Ti = AO_CU[it.k];
      let p = O_GIA[r];
      if (r === 0 && Ti[1]) p = Math.min(p, Math.round(Ti[1] / 6));
      if (Ti[0] === 'wing') p += O_CANH[it.lv];
      hoan.ao++; hoan.vang += p * 2; hoan.lk += O_LK[r];
    }
    boAoCu(s);
    hoan.vang = Math.round(hoan.vang); hoan.lk = r1(hoan.lk);
    s.gold = Math.max(0, Math.floor(num(s.gold, 0))) + hoan.vang;
    s.linhKhi = r1(VM.lk(s) + hoan.lk);
    s.heMoi = 1;
    if (hoan.vang || hoan.lk || hoan.vk || hoan.ao) s.heMoiBao = hoan;
    return hoan;
  };
  // Mỗi lần nạp (và bản lưu mới): đúng 4 vũ khí một loại một món, không bậc / dòng phụ, cấp đặt đúng mốc; carry theo vkThu; số hỏng thì sửa.
  VM.chuan = function (s) {
    if (!Array.isArray(s.weapons)) s.weapons = [];
    const giu = {};
    for (const w of s.weapons) if (w && typeof w === 'object' && LOAI.indexOf(w.type) >= 0 && !giu[w.type]) giu[w.type] = w;
    s.nextId = Math.max(1, Math.floor(num(s.nextId, 1)), ...s.weapons.map((w) => (w && typeof w.id === 'number' ? w.id + 1 : 1)));
    for (const t of LOAI) if (!giu[t]) giu[t] = G.newWeapon(s, t, 0, { family: CFG.family[t] | 0 });
    s.weapons = LOAI.map((t) => giu[t]);
    for (const w of s.weapons) {
      w.rarity = 0; if (G.linkTier) G.linkTier(w);
      w.gold = 0; w.affixes = []; w.power = null; w.family = CFG.family[w.type] | 0;
      delete w.lock;
      if (!w.marks || typeof w.marks !== 'object') w.marks = { fire: 0, poison: 0, ice: 0 };
      const st = G.wStage(w);
      VM.datCap(w, st, st > 0 ? w.branch : null);
    }
    const thu = (Array.isArray(s.vkThu) ? s.vkThu : []).filter((t, i, a) => LOAI.indexOf(t) >= 0 && a.indexOf(t) === i);
    for (const t of LOAI) if (thu.indexOf(t) < 0) thu.push(t);
    s.vkThu = thu;
    s.carry = thu.map((t) => giu[t].id);
    s.linhKhi = r1(VM.lk(s));
    const bc = s.boCap && typeof s.boCap === 'object' && !Array.isArray(s.boCap) ? s.boCap : {};
    s.boCap = {};
    for (const k of G.ZED_BO_KEYS || []) { const v = kep(Math.floor(num(bc[k], 0)), 0, (G.BO_MOI || { max: 3 }).max); if (v) s.boCap[k] = v; }
    if (s.heMoiBao != null && (typeof s.heMoiBao !== 'object' || Array.isArray(s.heMoiBao))) delete s.heMoiBao;
    if (s.heMoi === 1) boAoCu(s); // bản lưu đã chuyển (kể cả chuyển ở đợt 1, còn trường trang phục rỗng): bỏ trường cũ
    return s;
  };
  // Câu báo một lần ở làng sau khi chuyển bản lưu cũ (xoá dấu báo).
  // Đợt 4: gộp luôn câu "đã cân lại đồ theo luật mới" (sv.canLaiBao) để hai câu không đè nhau (làng chỉ hiện một câu mỗi lúc).
  VM.baoChuyen = function (sv) {
    const h = sv && sv.heMoiBao, c = sv && sv.canLaiBao;
    if (sv) { delete sv.heMoiBao; delete sv.canLaiBao; }
    const cau = [];
    if (h && typeof h === 'object') {
      const phan = [];
      if (h.vk) phan.push(G.t('{0} vũ khí trùng', h.vk));
      if (h.ao) phan.push(G.t('{0} món quần áo cũ', h.ao));
      cau.push(G.t('Vũ khí nay cố định 4 món (Kiếm, Thương, Búa, Phi tiêu), nâng bằng linh khí ở Ông Thợ Rèn. {0}Hoàn lại: {1} vàng, {2} linh khí.',
        phan.length ? G.t('Đã đổi {0}. ', phan.join(', ')) : '', h.vang | 0, Math.floor(num(h.lk, 0))));
    }
    if (c && typeof c === 'object') {
      const ds = [];
      if (c.vang > 0) ds.push(G.t('{0} vàng', c.vang | 0));
      if (c.lk > 0) ds.push(G.t('{0} linh khí', Math.floor(c.lk)));
      if (c.quang > 0) ds.push(G.t('{0} quặng', c.quang | 0));
      if (c.nl > 0) ds.push(G.t('{0} nguyên liệu', c.nl | 0));
      const p = [G.t('Đã cân lại đồ theo luật mới.')];
      if (ds.length) p.push(G.t('Hoàn lại: {0}.', ds.join(', ')));
      if (c.diem) p.push(G.t('Điểm kỹ năng đã trả lại, con phân lại ở Cụ Đồ nhé.'));
      if (c.chuong) p.push(G.t('Điểm chưởng đã trả lại, học lại ở Cụ Đồ nhé.'));
      cau.push(p.join(' '));
    }
    return cau.length ? cau.join(' ') : null;
  };

  // ---------- ĐỢT 4: CÂN LẠI ĐỒ THEO LUẬT MỚI (YEU-CAU-4-RESET-CAN-BANG.md; phiên bản G.SAVE_CAN_LAI ở js/engine.js) ----------
  // Chạy MỘT lần cho mọi bản lưu (máy + mây, kể cả bản đã chuyển ở đợt 1), sau VM.chuyen / VM.chuan. Không đụng vàng, linh khí, cấp,
  // sao ải, tiến độ vùng (chỉ CỘNG phần hoàn lại).
  const CAN_LAI_V = () => G.SAVE_CAN_LAI || 1;
  const sao = (v) => JSON.parse(JSON.stringify(v));
  // Số liệu thô của bản lưu đưa vào, chụp TRƯỚC phần sửa của js/engine.js (phần đó kẹp mài về G.MAX_SHARPEN, trả điểm kỹ năng sai luật
  // mà không ghi lại): mài cao nhất mỗi loại vũ khí, điểm kỹ năng và cây chưởng của Zed.
  function chupTho(s) {
    const o = { mai: {}, sk: null, ch: null };
    for (const w of Array.isArray(s.weapons) ? s.weapons : []) {
      if (!w || typeof w !== 'object' || LOAI.indexOf(w.type) < 0) continue;
      const m = Math.floor(num(w.sharpen, 0));
      if (m > (o.mai[w.type] | 0)) o.mai[w.type] = m;
    }
    const hs = s.heroes && typeof s.heroes === 'object' ? s.heroes.smith : null;
    if (hs && typeof hs === 'object') {
      try { o.sk = JSON.stringify(hs.sk || null); } catch (e) { o.sk = null; }
      try { o.ch = JSON.stringify(hs.ch && hs.ch.n ? hs.ch.n : null); } catch (e) { o.ch = null; }
    }
    return o;
  }
  // Mài từ cấp a lên b (a < b) tốn bao nhiêu (để hoàn khi kẹp mài vượt mức tối đa).
  function giaMai(a, b) {
    const t = { ore: 0, gold: 0, mat: [0, 0, 0] };
    for (let n = a; n < b && n < 60; n++) {
      const c = G.sharpenFull ? G.sharpenFull(n) : { ore: 0, gold: 0, mat: [0, 0, 0] };
      t.ore += c.ore | 0; t.gold += c.gold | 0;
      for (let i = 0; i < 3; i++) t.mat[i] += (c.mat && c.mat[i]) | 0;
    }
    return t;
  }
  // Phần hoàn của đợt 1 bị SÓT: G.fixSave của js/engine.js bù trường thiếu từ G.newSave() (đã có heMoi = 1), nên bản lưu cũ nhận cờ
  // heMoi = 1 ngay trong lần nạp đầu và VM.chuyen không bao giờ chạy (không hoàn vàng / linh khí cho vũ khí trùng, bậc màu, quần áo cũ;
  // mỗi loại giữ món đầu danh sách thay vì món cấp cao nhất). Bản gốc trước khi chuyển vẫn nằm trên máy ở khoá KHOA_TRUOC:
  // tính lại phần hoàn từ bản đó, chỉ khi chắc là cùng một bản lưu (cùng chủ, số thứ tự đồ không lùi, sao ải cũ đều còn, vũ khí cũ còn
  // đó với số quái hạ không ít hơn). Trả về { vang, lk, vk, ao, giu: { loại: { st, he, mai } } } hoặc null.
  function hoanDot1(s, goc) {
    let raw = null;
    try { raw = window.localStorage ? window.localStorage.getItem(KHOA_TRUOC) : null; } catch (e) { raw = null; }
    if (!raw) return null;
    let b = null;
    try { b = JSON.parse(raw); } catch (e) { return null; }
    if (!b || typeof b !== 'object' || Array.isArray(b) || b.v !== 1 || b.heMoi === 1) return null;
    if (b.owner && s.owner && b.owner !== s.owner) return null;
    if (num(s.nextId, 0) < num(b.nextId, 0)) return null;
    const sb = b.stars && typeof b.stars === 'object' ? b.stars : {}, ss = s.stars && typeof s.stars === 'object' ? s.stars : {};
    for (const k in sb) if (!ss[k]) return null;
    const wb = Array.isArray(b.weapons) ? b.weapons : [], ws = Array.isArray(s.weapons) ? s.weapons : [];
    const cung = ws.some((w) => w && wb.some((x) => x && x.id === w.id && x.type === w.type && num(w.kills, 0) >= num(x.kills, 0)));
    if (!cung) return null;
    const c = goc(sao(b)); // phần sửa của js/engine.js + js/linhkhi.js (mốc dấu ấn), như lần nạp đợt 1
    if (!c || typeof c !== 'object' || c.v !== 1) return null;
    const hoan = VM.chuyen(c);
    const giu = {};
    for (const w of c.weapons || []) { const st = G.wStage(w); giu[w.type] = { st, he: st > 0 ? w.branch : null, mai: w.sharpen | 0 }; }
    return { vang: hoan.vang | 0, lk: r1(num(hoan.lk, 0)), vk: hoan.vk | 0, ao: hoan.ao | 0, giu };
  }
  // Cân lại một bản lưu (đã qua VM.chuan). tho: chupTho của bản đưa vào; hd: hoanDot1 (có thể null). Trả về dấu báo { vang, lk, ... }.
  VM.canLai = function (s, tho, hd) {
    tho = tho || { mai: {} };
    const bao = { vang: 0, lk: 0, quang: 0, nl: 0, diem: false, chuong: false };
    // 0. phần hoàn đợt 1 bị sót (xem hoanDot1)
    if (hd) {
      s.gold = Math.max(0, Math.floor(num(s.gold, 0))) + hd.vang; bao.vang += hd.vang;
      s.linhKhi = r1(VM.lk(s) + hd.lk); bao.lk += hd.lk;
      for (const w of s.weapons) {
        const q = hd.giu[w.type];
        if (!q) continue;
        if (q.st > G.wStage(w)) VM.datCap(w, q.st, q.he);
        if (q.mai > (w.sharpen | 0)) w.sharpen = q.mai;
        if ((tho.mai[w.type] | 0) < q.mai) tho.mai[w.type] = q.mai;
      }
      s.heMoiHoan = 1;
    }
    // 1. bốn vũ khí: dựng lại từ đầu, chỉ giữ loại, cấp, hệ, mài, bậc ép (và số quái đã hạ để thống kê); mọi chỉ số khác tính theo luật hiện hành
    const maxMai = G.MAX_SHARPEN || 15;
    s.weapons = s.weapons.map((w) => {
      const st = G.wStage(w), he = st > 0 && G.EL[w.branch] ? w.branch : null;
      let mai = Math.max(Math.floor(num(w.sharpen, 0)), tho.mai[w.type] | 0, 0);
      if (mai > maxMai) {
        const t = giaMai(maxMai, mai);
        s.ore = Math.max(0, Math.floor(num(s.ore, 0))) + t.ore; bao.quang += t.ore;
        s.gold = Math.max(0, Math.floor(num(s.gold, 0))) + t.gold; bao.vang += t.gold;
        if (!Array.isArray(s.mats)) s.mats = [0, 0, 0];
        for (let i = 0; i < 3; i++) { s.mats[i] = Math.max(0, num(s.mats[i], 0)) + t.mat[i]; bao.nl += t.mat[i]; }
        mai = maxMai;
      }
      const nw = {
        id: w.id, type: w.type, family: CFG.family[w.type] | 0, rarity: 0, gold: 0,
        marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: mai, name: null, title: '',
        kills: Math.max(0, Math.floor(num(w.kills, 0))), bossKills: w.bossKills && typeof w.bossKills === 'object' && !Array.isArray(w.bossKills) ? w.bossKills : {},
        affixes: [], power: null,
      };
      // sua-mat-bac-ep: GIỮ bậc ép + dòng hiệu ứng (w.ep, đã tốn đá / vàng / mảnh). js/ep_do.js (bọc G.fixSave sau file này) chuẩn hoá lại.
      if (w.ep && typeof w.ep === 'object' && !Array.isArray(w.ep)) nw.ep = w.ep;
      VM.datCap(nw, st, he);
      if (G.linkTier) G.linkTier(nw);
      return nw;
    });
    s.carry = s.vkThu.map((t) => { const w = s.weapons.find((x) => x.type === t); return w ? w.id : null; }).filter((id) => id != null);
    // 2. trang phục: chỉ 4 bộ; bộ đã mở = đúng các trùm vùng đã hạ (mọi độ khó); bộ không còn mở thì hoàn linh khí + vàng đã nâng
    //    15/10 (bo-do-mua): theo luật mua (G.BO_MUA_BAT) chỉ giữ bộ ĐÃ CÓ mà trùm vùng đã hạ — không tặng bộ chỉ mới mở bán. Bản lưu cũ
    //    tới đây đã được js/engine.js fixSave tặng bù mọi bộ đã hạ trùm nên vẫn giữ đủ như trước.
    if (!s.zed || typeof s.zed !== 'object' || Array.isArray(s.zed)) s.zed = { v: 1, hoc: {} };
    const z = s.zed, ha = (r) => !!((s.stars && s.stars[r + '-4']) || (s.stars2 && s.stars2[r + '-4']));
    const boMo = {}, coSan = z.boMo && typeof z.boMo === 'object' ? z.boMo : {};
    for (const k of G.ZED_BO_KEYS || []) { if (k === 'ninja') continue; const r = G.zedBoVung(k); if (r >= 0 && ha(r) && (G.BO_MUA_BAT === false || coSan[k])) boMo[k] = 1; }
    const moCu = z.boMo && typeof z.boMo === 'object' ? z.boMo : {};
    for (const k in boMo) if (!moCu[k]) z.boBao = 1; // mở bù: làng báo một lần (cách js/engine.js đang làm)
    if (Object.keys(boMo).length) z.boMo = boMo; else delete z.boMo;
    if (z.bo && (z.bo === 'ninja' || !G.ZED_BO || !G.ZED_BO[z.bo] || !boMo[z.bo])) delete z.bo;
    if (z.boBao !== 1 || !z.boMo) delete z.boBao;
    const bc = s.boCap && typeof s.boCap === 'object' ? s.boCap : {};
    for (const k of Object.keys(bc)) {
      if (k === 'ninja' || boMo[k]) continue;
      for (let l = 0; l < (bc[k] | 0); l++) { const g = VM.boGia(l); if (g) { s.gold += g.vang; bao.vang += g.vang; s.linhKhi = r1(VM.lk(s) + g.lk); bao.lk += g.lk; } }
      delete bc[k];
    }
    boAoCu(s); // mã đồ mặc cũ (outfit, owned, helm, armor, charm)
    // 3. chỉ số nhân vật: tính lúc dựng trận từ cấp + điểm kỹ năng (js/combat.js G.buildPlayer), không lưu; ở đây chỉ kiểm cấp,
    //    kinh nghiệm, điểm. Điểm sai luật đã được js/engine.js / js/chuong.js trả lại khi sửa: so với bản đưa vào để báo người chơi.
    const hs = s.heroes && s.heroes.smith;
    if (hs) {
      hs.lvl = kep(Math.floor(num(hs.lvl, 1)), 1, G.MAX_LEVEL);
      hs.xp = Math.max(0, num(hs.xp, 0));
      while (hs.lvl < G.MAX_LEVEL && hs.xp >= G.xpNeed(hs.lvl)) { hs.xp -= G.xpNeed(hs.lvl); hs.lvl++; } // kinh nghiệm thừa (không mất cấp)
      const sk = hs.sk || {};
      let tong = 0;
      for (const b of G.SKEYS) { sk[b] = kep(Math.floor(num(sk[b], 0)), 0, G.SKILLS[b].nodes.length); tong += sk[b]; }
      if (tong > Math.floor(hs.lvl / 3)) { for (const b of G.SKEYS) sk[b] = 0; }
      hs.sk = { atk: sk.atk, def: sk.def, elem: sk.elem };
      if (G.chuong) G.chuong.fix(hs, 'smith');
      let skCu = null, chCu = null;
      try { skCu = tho.sk ? JSON.parse(tho.sk) : null; } catch (e) { skCu = null; }
      try { chCu = tho.ch ? JSON.parse(tho.ch) : null; } catch (e) { chCu = null; }
      const dem = (o) => { let n = 0; if (o && typeof o === 'object') for (const k in o) n += Math.max(0, Math.floor(num(o[k], 0))); return n; };
      if (skCu && dem(skCu) > dem(hs.sk)) bao.diem = true;
      if (chCu && hs.ch && dem(chCu) > dem(hs.ch.n)) bao.chuong = true;
    }
    // 4. hành trang: đá tôi (không còn dùng) đổi ra quặng; nguyên liệu vùng, mảnh trùm, quặng giữ nguyên
    const da = Math.max(0, Math.floor(num(s.stones, 0)));
    if (da > 0) { const q = da * (G.DA_TOI_QUANG || 6); s.ore = Math.max(0, Math.floor(num(s.ore, 0))) + q; bao.quang += q; }
    s.stones = 0;
    for (const k of ['grit', 'hecu', '_hecu', 'heCu']) delete s[k]; // trường của luật đã bỏ
    s.canLai = CAN_LAI_V();
    bao.vang = Math.round(bao.vang); bao.lk = r1(bao.lk);
    // một dòng ở làng: bản lưu đã có tiến trình (bản mới tinh không cần báo)
    const coTienTrinh = (s.stars && Object.keys(s.stars).length) || (s.wins | 0) > 0 || (hs && hs.lvl > 1);
    if (coTienTrinh || bao.vang || bao.lk || bao.quang) s.canLaiBao = bao; else delete s.canLaiBao;
    return bao;
  };

  if (G.fixSave && !G.fixSave.vkMoiBoc) {
    const goc = G.fixSave;
    G.fixSave = function (s) {
      const vao = s && typeof s === 'object' && !Array.isArray(s);
      // Xét cờ trên bản ĐƯA VÀO, trước phần sửa của js/engine.js (phần đó bù trường thiếu từ G.newSave(), có cả heMoi = 1).
      const chuaChuyen = vao && s.v === 1 && s.heMoi !== 1;
      const canLai = vao && s.v === 1 && s.canLai !== CAN_LAI_V();
      if (chuaChuyen) saoLuu(s); // bản gốc, trước mọi phần sửa
      let hd = null, tho = null;
      if (canLai) {
        try { tho = chupTho(s); } catch (e) { tho = null; }
        // phần hoàn đợt 1 bị sót: tính TRƯỚC khi sửa bản chính (phần sửa của js/engine.js giữ cờ lỗi theo lần gọi gần nhất)
        if (!chuaChuyen && s.heMoiHoan !== 1) { try { hd = hoanDot1(s, (x) => goc.call(this, x)); } catch (e) { hd = null; console.error('Linh Khí: không tính được phần hoàn đợt 1 (bỏ qua)', e); } }
      }
      const r = goc.apply(this, arguments);
      if (!r || typeof r !== 'object') return r;
      if (chuaChuyen && r === s) {
        // chuyển trên bản sao; lỗi giữa chừng thì bản lưu không bị chuyển dở (lần nạp sau thử lại)
        try {
          const c = JSON.parse(JSON.stringify(r));
          VM.chuyen(c);
          c.heMoiHoan = 1;
          for (const k of Object.keys(r)) if (!(k in c)) delete r[k];
          Object.assign(r, c);
        } catch (e) { console.error('Linh Khí: lỗi khi chuyển bản lưu sang hệ thống mới (giữ nguyên bản lưu)', e); }
      }
      try { VM.chuan(r); } catch (e) { console.error('Linh Khí: lỗi khi sửa vũ khí của bản lưu hệ thống mới', e); }
      if (canLai && r === s) {
        // cân lại trên bản sao; lỗi giữa chừng thì giữ nguyên (lần nạp sau thử lại)
        try {
          const c = JSON.parse(JSON.stringify(r));
          VM.canLai(c, tho, hd);
          for (const k of Object.keys(r)) if (!(k in c)) delete r[k];
          Object.assign(r, c);
          if (G.linkTier) for (const w of r.weapons) G.linkTier(w);
        } catch (e) { console.error('Linh Khí: lỗi khi cân lại đồ theo luật mới (giữ nguyên bản lưu)', e); }
      } else if (r !== s && r.canLai !== CAN_LAI_V()) r.canLai = CAN_LAI_V(); // bản mới thay bản hỏng: không có gì để cân lại
      return r;
    };
    G.fixSave.vkMoiBoc = true;
  }
  if (G.newSave && !G.newSave.vkMoiBoc) {
    const goc = G.newSave;
    G.newSave = function () {
      const s = goc.apply(this, arguments);
      if (s && typeof s === 'object') {
        s.heMoi = 1; s.linhKhi = 0;
        s.vkThu = (CFG.thuMacDinh || LOAI).slice();
        try { VM.chuan(s); } catch (e) { console.error('Linh Khí: lỗi khi tạo bản lưu hệ thống mới', e); }
      }
      return s;
    };
    G.newSave.vkMoiBoc = true;
  }

  // ---------- linh khí khi đánh: vào túi chung ----------
  if (G.addMarks && !G.addMarks.vkMoiBoc) {
    const goc = G.addMarks;
    G.addMarks = function (w, el, n, quiet) {
      void goc;
      if (!w || !(n >= 0.01) || !G.save) return;
      const W = G.getWorld && G.getWorld();
      if (W && W.P && G.epDo) n *= G.epDo.linhKhi(W.P); // đợt 6: dòng ép đồ "Linh khí nhận" của vũ khí đang cầm
      VM.themLk(G.save, n);
      if (W) {
        W.marksGained = (W.marksGained || 0) + n;
        if (G.lk) G.lk.log(w, el, n);
        if (!quiet && !G.noRender && G.fx && G.fx.marks) { try { G.fx.marks(el, n); } catch (e) { /* bỏ qua hiệu ứng */ } }
        if (G.sfx) G.sfx('mark', 1);
      }
    };
    G.addMarks.vkMoiBoc = true;
  }

  // ---------- người chơi: gắn bộ đang mặc, cấp bộ, skill bộ (móc rỗng) ----------
  if (G.buildPlayer && !G.buildPlayer.vkMoiBoc) {
    const goc = G.buildPlayer;
    G.buildPlayer = function () {
      const P = goc.apply(this, arguments);
      if (P) {
        try { const bo = G.zedBo ? G.zedBo() : 'ninja'; P.bo = bo; P.boCap = VM.boCap(G.save, bo); P.boSkill = G.boSkill(bo, P.boCap); } catch (e) { /* bỏ qua */ }
      }
      return P;
    };
    G.buildPlayer.vkMoiBoc = true;
  }

  // ---------- hình vũ khí trong ô đồ: bộ zed-vk ----------
  const VK_LOAI = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' };
  function layVk() {
    const SC = G.spriteCustom, z = SC && SC.zed && SC.zed['zed-vk'];
    if (!z) return null;
    if (!z.ready && SC.canAnh) SC.canAnh('zed-vk');
    return z.ready && z.img && z.tep && z.tep.vk ? z : null;
  }
  const NHUOM = new Map();
  function anhVk(V, loai, cap, he, w) {
    const r = V.tep.vk[loai][cap];
    // 22/10 vk-he-3-loai (docs/review/ke-hoach-cai-thien/vk-he-3-loai/bao-cao.md): ẢNH HỆ ĐỨNG TRƯỚC ảnh gân — cấp ≥ 1 có hệ và tấm
    // zed-vk-he đã về thì dùng thẳng ảnh hệ (vân Lửa / Độc / Băng hiện từ Lv 3 Mầm, Lv 6 Thành hình, Lv 12 Thức tỉnh), không nhuộm.
    // (Trước 22/10: gân đứng trước nên có gân là ảnh hệ bị che.) G.vkHeAnh trả null khi chưa tải xong (tự gọi SC.canAnh) hoặc cờ tắt.
    const anhHe = he && typeof document !== 'undefined' && G.vkHeAnh ? G.vkHeAnh(loai, cap, he, r) : null;
    if (anhHe) return anhHe;
    // 16/10 gan-vk: vũ khí w đang ở cấp Luyện có gân (zed-vk-gan, js/vien_vk.js G.vkGan; ?gan=0 tắt) → ảnh "gân" cùng cỡ ô — CHỈ khi
    // không có ảnh hệ (vd Trắng Lv 2, hoặc tấm hệ chưa tải về / loại chưa có ô hệ)
    const gan = w && G.vkGan && G.vkGanAnh && G.vkGan(w, cap) ? G.vkGanAnh(loai, cap, r) : null;
    const goc = gan || { img: V.img, x: r[0], y: r[1], w: r[2], h: r[3] };
    if (!he || typeof document === 'undefined') return goc;
    const k = loai + cap + he + (gan ? 'g' : ''); // ảnh gân nhuộm hệ như ảnh thường
    let cv = NHUOM.get(k);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = r[2]; cv.height = r[3];
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(goc.img, goc.x, goc.y, r[2], r[3], 0, 0, r[2], r[3]);
      q.globalCompositeOperation = 'source-atop'; q.globalAlpha = 0.3; q.fillStyle = G.EL[he].col; q.fillRect(0, 0, r[2], r[3]);
      NHUOM.set(k, cv);
    }
    return { img: cv, x: 0, y: 0, w: r[2], h: r[3] };
  }
  VM.icon = function (c, w, x, y, size) {
    const V = layVk(), loai = w && VK_LOAI[w.type];
    if (!V || !loai || !V.tep.vk[loai]) return false;
    let cap = 0;
    try { cap = kep(G.wStage(w) | 0, 0, 3); } catch (e) { cap = 0; }
    if (!V.tep.vk[loai][cap]) return false;
    const he = w.coat && G.EL[w.coat] ? w.coat : cap > 0 && G.EL[w.branch] ? w.branch : null;
    const a = anhVk(V, loai, cap, he, w), cheo = loai !== 'phitieu';
    const k = cheo ? (size * 1.35) / (a.w + a.h) : size / Math.max(a.w, a.h);
    // 16/10 bậc ép đồ chỉ ở KHUNG Ô (js/ep_do.js E.khung; ?vienvk=1 tắt): hình nằm trong ô nơi gọi vừa vẽ → ghi số bậc lên góc ô đó sau
    // khi vẽ hình; nơi gọi không vẽ ô (dòng kết quả, dòng nhỏ) → tự vẽ ô gd-o-ep-<bậc> quanh hình rồi ghi số.
    const E = G.epDo, khung = E && E.khung && E.khung() && E.oChua;
    let oK = null, bK = 0;
    if (khung) {
      try {
        bK = E.bat() ? E.bac(w) : 0;
        oK = E.oChua(x, y);
        if (!oK) { const s0 = Math.round(size + 4); E.o(Math.round(x - s0 / 2), Math.round(y - s0 / 2), s0, bK, c); oK = E.oChua(x, y); }
      } catch (e) { oK = null; }
    }
    c.save();
    c.imageSmoothingEnabled = k < 1;
    c.translate(Math.round(x), Math.round(y));
    if (cheo) c.rotate(-Math.PI / 4);
    // 15/10 viền + hào quang theo bậc ép đồ, ánh lướt theo cấp mài (js/vien_vk.js; ?vienvk=0 tắt) — vẽ ở hệ toạ độ ảnh (đã xoay, thu theo k)
    const VV = G.vienVk, r0 = VV && VV.co(w) ? V.tep.vk[loai][cap] : null;
    if (r0) {
      const kv = 'zed-vk:' + loai + cap, dx = -a.w / 2, dy = -a.h / 2;
      c.scale(k, k);
      try { VV.truoc(c, w, V.img, r0[0], r0[1], r0[2], r0[3], kv, dx, dy, 1 / k); } catch (e) { /* bỏ qua */ }
      c.drawImage(a.img, a.x, a.y, a.w, a.h, dx, dy, a.w, a.h);
      try { VV.sau(c, w, V.img, r0[0], r0[1], r0[2], r0[3], kv, dx, dy, 1 / k); } catch (e) { /* bỏ qua */ }
    } else c.drawImage(a.img, a.x, a.y, a.w, a.h, (-a.w * k) / 2, (-a.h * k) / 2, a.w * k, a.h * k);
    c.restore();
    // Luyện vũ khí (js/luyen.js): số góc ô là cấp Luyện 1–15 (cả cấp Trắng 1–2), màu theo khung
    const soL = G.luyen && G.luyen.bat() && w ? G.luyen.cap(w) : null;
    if (oK && (bK > 0 || soL != null)) { try { const p = oK.so || [oK.x + oK.w - 1, oK.y + oK.h - 1]; E.soBac(c, p[0], p[1], bK, Math.min(oK.w, oK.h) < 24, soL); } catch (e) { /* bỏ qua */ } }
    return true;
  };
  // Ô zed-vk của một vũ khí (đúng loại, cấp, nhuộm hệ như ô đồ): { img, x, y, w, h } hoặc null khi ảnh chưa tải xong.
  // type: loại muốn lấy khi không có w (nút Đánh / Đặc biệt dự phòng: cấp Trắng). Dùng ở js/fx_he.js (Phi Thương) và js/btn_art.js.
  VM.anhO = function (w, type) {
    const V = layVk(), loai = VK_LOAI[(w && w.type) || type];
    if (!V || !loai || !V.tep.vk[loai]) return null;
    let cap = 0;
    if (w) { try { cap = kep(G.wStage(w) | 0, 0, 3); } catch (e) { cap = 0; } }
    if (!V.tep.vk[loai][cap]) return null;
    const he = w ? (w.coat && G.EL[w.coat] ? w.coat : cap > 0 && G.EL[w.branch] ? w.branch : null) : null;
    return anhVk(V, loai, cap, he, w);
  };
  // 14/10 (vũ khí cũ còn sót, mục 4): nạp zed-vk sớm cùng ảnh lõi (ngay khi tệp này chạy, trước khi vào làng).
  try { layVk(); } catch (e) { /* chưa có bộ nạp ảnh: bỏ qua */ }
  if (G.art && G.art.weaponIcon && !G.art.weaponIcon.vkMoiBoc) {
    G.art.weaponIcon = function (c, w, x, y, size) {
      if (w) { try { if (VM.icon(c, w, x, y, size || 22)) return; } catch (e) { /* bỏ qua */ } }
      // 14/10: zed-vk chưa tải xong thì KHÔNG vẽ gì (không bao giờ rơi về hình vũ khí cũ G.weaponArt / A.weapon).
    };
    G.art.weaponIcon.vkMoiBoc = true;
  }

  // ---------- chữ tiến độ của một vũ khí (thay G.markInfo của js/stage.js) ----------
  VM.markInfo = function (w) {
    const st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null, c = VM.gia(st), n = VM.lk();
    const col = el ? G.EL[el].col : '#b8b0a0';
    if (c == null) return { frac: 1, col, txt: G.t('{0} · {1} (tối đa)', G.EL[el].name, G.STAGE_NAMES[st]) };
    const ten = el ? G.t('{0} · {1}', G.EL[el].name, G.STAGE_NAMES[st]) : G.STAGE_NAMES[0];
    return { frac: kep(n / c, 0, 1), col: el ? col : n >= c ? '#ffd23f' : '#666', txt: G.t('{0} · lên {1}: {2}/{3} linh khí', ten, G.STAGE_NAMES[st + 1], Math.floor(n), c) };
  };
  VM.moTiep = function (w) { // cấp kế mở gì
    const st = G.wStage(w);
    if (st >= 3) return G.t('Đã mở: {0}', G.HE_FEATURES[w.branch].map((f) => G.tv(f.name)).join(', '));
    if (st === 0) return 'Lên Mầm: chọn hệ Lửa, Độc hoặc Băng; tăng chỉ số';
    return G.t('Lên {0}: mở {1}', G.STAGE_NAMES[st + 1], G.tv(G.HE_FEATURES[w.branch][st - 1].name));
  };

  // ---------- vẽ (dùng chung cho Ông Thợ Rèn, Hành trang, Cô Thợ May) ----------
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
  const so1 = (v) => (G.LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','));
  function gem(x, y, s) { // viên linh khí (hình thoi vàng)
    s = s || 1;
    const c = G.ux;
    // vẽ tay 8 đợt 1 (docs/review/ke-hoach-cai-thien/ve-tay-8-dot-1): ảnh gd-icon-linh-khi (8×10 điểm game, tâm tại x, y) thay hình thoi code.
    // ?vecode=1 hoặc chưa có ảnh: vẽ code như cũ.
    const SC = G.spriteCustom, ga = G.VE_CODE !== true && SC && SC.gdSan && SC.veGd ? SC.gdSan('gd-icon-linh-khi') : null;
    if (ga && SC.veGd(c, ga, x - 4 * s, y - 5 * s, 8 * s, 10 * s)) return;
    c.fillStyle = '#7a4a10'; c.beginPath(); c.moveTo(x, y - 5 * s); c.lineTo(x + 4 * s, y); c.lineTo(x, y + 5 * s); c.lineTo(x - 4 * s, y); c.closePath(); c.fill();
    c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(x, y - 4 * s); c.lineTo(x + 3 * s, y); c.lineTo(x, y + 4 * s); c.lineTo(x - 3 * s, y); c.closePath(); c.fill();
    c.fillStyle = '#fff6c8'; c.fillRect(x - 1 * s, y - 2 * s, 1 * s, 2 * s);
  }
  VM.gem = gem;
  VM.ui = { doi: null };

  // Tấm "Linh khí N" trong trận (thay ba vạch hệ, js/linhkhi.js gọi). Trả true nếu đã vẽ.
  let tTruoc = 0;
  VM.hud = function (P, HUD, pulse) {
    const T = G.theme, sv = G.save, w = G.curW(P);
    if (!sv || !w) return false;
    const dt = Math.max(0, Math.min(0.1, (G.time || 0) - tTruoc)); tTruoc = G.time || 0;
    let p = 0;
    if (pulse) for (const k in pulse) { if (pulse[k] > 0) pulse[k] = Math.max(0, pulse[k] - dt); p = Math.max(p, pulse[k] || 0); }
    if (T && T.plate) T.plate(HUD.x, HUD.y, HUD.w, HUD.h); else ui.rect(HUD.x, HUD.y, HUD.w, HUD.h, 'rgba(14,10,10,0.88)', '#7a5a3a');
    gem(HUD.x + 9, HUD.y + 8.5, 1);
    const n = Math.floor(VM.lk(sv)), c = VM.gia(G.wStage(w));
    ui.text(G.t('Linh khí {0}', n), HUD.x + 17, HUD.y + 11.8, { size: 7.5, bold: true, color: '#ffe9a8' });
    if (c != null && n >= c) ui.text('▲', HUD.x + HUD.w - 5, HUD.y + 11.8, { size: 7.5, bold: true, align: 'right', color: GOOD });
    if (p > 0) { const ga = G.ux.globalAlpha; G.ux.globalAlpha = ga * (p / 0.4) * 0.5; ui.rect(HUD.x + 1, HUD.y + 1, HUD.w - 2, HUD.h - 2, '#fff3b0'); G.ux.globalAlpha = ga; }
    if (G.lk && G.lk.state) G.lk.state.last = { wid: w.id, lk: n, rows: [] };
    return true;
  };
  // Khối linh khí của màn kết quả (js/linhkhi.js LK.resultBlock gọi): một dòng. Trả về y cuối.
  VM.ketQua = function (S, x, y, wd) {
    const T = G.theme, sv = G.save;
    if (T && T.head) T.head('Linh khí', x, y + 7, { size: 7.5 }); else ui.text('Linh khí', x, y + 7, { size: 7.5, bold: true });
    y += 11;
    const L = (S && S.lkGain) || {};
    let got = 0;
    for (const id in L) for (const e of ELS) got += num(L[id][e], 0);
    ui.rect(x, y, wd, 19, 'rgba(10,22,20,0.55)', 'rgba(255,220,160,0.14)');
    gem(x + 8, y + 9.5, 1);
    tx(G.t('+{0} linh khí trận này · đang có {1}', Math.round(got), Math.floor(VM.lk(sv))), x + 17, y + 8, wd - 22, { size: 7, bold: true, color: '#ffe9a8' });
    let goi = 'Nâng vũ khí bằng linh khí ở Ông Thợ Rèn (thẻ Linh khí).';
    const ws = (sv && sv.weapons) || [];
    const w = ws.find((q) => { const c = VM.gia(G.wStage(q)); return c != null && VM.lk(sv) >= c; });
    if (w) goi = G.t('Đủ nâng {0} lên {1} ở Ông Thợ Rèn!', G.WTYPES[w.type].name, G.STAGE_NAMES[G.wStage(w) + 1]);
    tx(goi, x + 17, y + 16, wd - 22, { size: 6.5, color: w ? GOOD : '#e8dfcc' });
    return y + 21;
  };

  // Danh sách 4 vũ khí với nút nâng cấp / chọn hệ / đổi hệ / cầm đầu. o: { ro (chỉ xem), say(s), rowH }. Trả về y cuối.
  VM.vkPanel = function (x, y, wd, o) {
    o = o || {};
    const T = G.theme, sv = G.save, ro = !!o.ro, rowH = o.rowH || 40, say = o.say || (() => {});
    if (!T || !sv) return y;
    const n = VM.lk(sv);
    gem(x + 4, y + 6, 0.9);
    ui.text(G.t('Linh khí: {0}', Math.floor(n)), x + 11, y + 9, { size: 8.5, bold: true, color: GOLD });
    const L = G.LINHKHI || {};
    tx(G.t('Nhận khi hạ tinh anh +{0}, trùm nhỏ +{1}, trùm vùng +{2}, kết liễu quái đang dính hệ +1; rương báu, phần thưởng ải.', L.elite, L.mini, L.boss), x + 80, y + 9, wd - 82, { size: 6.5, color: SOFT });
    y += 13;
    const lvl = sv.heroes && sv.heroes[sv.hero] ? sv.heroes[sv.hero].lvl : 1;
    sv.weapons.forEach((w) => {
      const st = G.wStage(w), el = st > 0 ? w.branch : null, E = el ? G.EL[el] : null, c = VM.gia(st), dau = sv.vkThu && sv.vkThu[0] === w.type;
      T.inset(x, y, wd, rowH - 2, VM.ui.doi === w.id);
      // đợt 6: ô và màu tên theo Bậc ép đồ (js/ep_do.js) khi đã ép; chưa ép thì như cũ
      const bac = G.epDo && G.epDo.bat() ? G.epDo.bac(w) : 0;
      if (bac || (G.epDo.khung && G.epDo.khung())) G.epDo.o(x + 3, y + 3, 32, bac); else T.slot(x + 3, y + 3, 32, 0); // 16/10: khung ô theo bậc cả Trắng
      G.art.weaponIcon(G.ux, w, x + 19, y + 19, 26);
      const bw = ro ? 0 : 150, tw = wd - 44 - bw;
      tx(G.wName(w) + (bac ? ' · ' + G.t('Bậc {0}', G.epDo.tenBac(bac)) : '') + (dau ? ' · ' + G.t('cầm khi vào ải') : ''), x + 40, y + 10, tw, { size: 7.5, bold: true, color: bac ? G.epDo.mauBac(bac) : E ? E.col : TXT });
      tx(G.t('{0} · mài +{1} · đòn {2}', el ? G.t('{0} · hệ {1}', G.STAGE_NAMES[st], E.name) : G.STAGE_NAMES[0], w.sharpen | 0, so1(G.wBase(w, lvl))), x + 40, y + 20, tw, { size: 6.5, color: TXT });
      tx(VM.moTiep(w), x + 40, y + 30, tw, { size: 6.5, color: SOFT });
      if (ro) { y += rowH; return; }
      const bx = x + wd - bw - 3, b1 = y + 3, b2 = y + 20;
      if (VM.ui.doi === w.id && st >= 1) {
        // đang chọn hệ mới
        const cd = VM.giaDoiHe(st);
        ELS.filter((e) => e !== w.branch).forEach((e, i) => {
          if (T.sbtn(bx + i * 76, b1, 74, 15, G.t('{0} · {1}', G.EL[e].name, cd), { size: 7, pad: 1, primary: true, disabled: n < cd })) {
            if (VM.doiHe(sv, w, e)) { VM.ui.doi = null; G.persist(); G.sfx('evolve'); say(G.t('{0} đổi sang hệ {1}.', G.WTYPES[w.type].name, G.EL[e].name)); }
          }
        });
        if (T.sbtn(bx, b2, 74, 15, 'Thôi', { size: 7, pad: 1 })) VM.ui.doi = null;
        ui.text(G.t('Đổi hệ: {0} linh khí', cd), bx + 150, b2 + 10.5, { size: 6.5, align: 'right', color: n < cd ? WARN : SOFT });
        y += rowH;
        return;
      }
      if (st === 0) {
        ELS.forEach((e, i) => {
          if (T.sbtn(bx + i * 51, b1, 48, 15, G.EL[e].name, { size: 7, pad: 1, primary: n >= c, disabled: n < c })) {
            if (VM.nang(sv, w, e)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên Mầm, theo hệ {1}!', G.WTYPES[w.type].name, G.EL[e].name)); }
          }
        });
        ui.text(G.t('Lên Mầm: {0} linh khí', c), bx, b2 + 10.5, { size: 6.5, bold: true, color: n < c ? WARN : GOOD });
      } else if (c != null) {
        if (T.sbtn(bx, b1, 150, 15, G.t('Lên {0} · {1} linh khí', G.STAGE_NAMES[st + 1], c), { size: 7, pad: 1, primary: n >= c, disabled: n < c })) {
          if (VM.nang(sv, w)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên {1}!', G.WTYPES[w.type].name, G.STAGE_NAMES[st + 1])); }
        }
      } else ui.text('Đã Thức tỉnh', bx + 75, b1 + 10.5, { size: 7.5, bold: true, align: 'center', color: GOOD });
      if (st >= 1 && T.sbtn(bx, b2, 74, 15, G.t('Đổi hệ · {0}', VM.giaDoiHe(st)), { size: 7, pad: 1 })) VM.ui.doi = w.id;
      if (dau) ui.text('cầm đầu', bx + 113, b2 + 10.5, { size: 6.5, bold: true, align: 'center', color: GOOD });
      else if (T.sbtn(bx + 76, b2, 74, 15, 'Cầm đầu', { size: 7, pad: 1 })) { VM.camDau(sv, w.type); G.persist(); G.sfx('pick'); say(G.t('Vào ải sẽ cầm {0} trước.', G.WTYPES[w.type].name)); }
      y += rowH;
    });
    return y;
  };

  // Khung nâng cấp bộ trang phục Zed (bộ đang mặc). ro: chỉ xem. Trả về y cuối.
  // o.boQuaDs: không in dòng "Các bộ: …" (bảng Cô Thợ May có thẻ Mua liệt kê đủ các bộ — 15/10 bo-do-mua, để nút dưới không đè chữ)
  VM.boPanel = function (x, y, wd, ro, say, o) {
    const T = G.theme, sv = G.save;
    if (!T || !sv || !G.ZED_BO || !G.zedBo) return y;
    say = say || (() => {});
    T.head('Bộ trang phục Cu Tí', x, y + 8);
    y += 11;
    const bo = G.zedBo(sv), B = G.ZED_BO[bo], cap = VM.boCap(sv, bo), max = G.BO_MOI.max, g = VM.boGia(cap);
    ui.text(G.t('{0} · cấp {1}/{2}', G.tv(B.ten), cap, max), x, y + 9, { size: 8, bold: true, color: GOLD });
    y += 12;
    y = ui.para('Mỗi bộ nâng riêng 3 cấp bằng linh khí và vàng. Mỗi cấp mở thêm một skill, chỉ có tác dụng khi đang mặc bộ đó.', x, y + 7, wd, { size: 6.5, color: SOFT });
    // Skill của bộ đang mặc (đợt 3, bảng G.SKILL_BO trong js/data.js, luật js/bo_skill.js): tên + mô tả 1 dòng, cấp nào đã mở
    const SK = G.SKILL_BO && G.SKILL_BO[bo];
    if (SK) {
      const tat = G.SKILL_BO_BAT === false;
      SK.forEach((sk, i) => {
        const mo = cap > i;
        const dau = mo ? (tat ? G.t('Cấp {0} · {1} (đang tắt)', i + 1, sk.ten) : G.t('Cấp {0} · {1} (đã mở)', i + 1, sk.ten)) : G.t('Cấp {0} · {1} (chưa mở)', i + 1, sk.ten);
        y = ui.para(dau, x, y + 2, wd, { size: 6.8, bold: true, color: mo && !tat ? GOOD : SOFT });
        y = ui.para(G.boSk ? G.boSk.moTa(sk) : '', x + 6, y - 1, wd - 6, { size: 6.3, color: mo && !tat ? TXT : SOFT });
      });
      if (tat) y = ui.para('Skill bộ đang tắt (cờ ?skillbo=0).', x, y + 1, wd, { size: 6.3, color: WARN });
    }
    if (g) {
      const why = VM.boDuoc(sv, bo);
      ui.text(G.t('Lên cấp {0}: {1} linh khí + {2} vàng', cap + 1, g.lk, g.vang), x, y + 9, { size: 7, bold: true, color: why ? WARN : GOOD });
      if (!ro && T.sbtn(x + wd - 92, y, 90, 15, why && why !== 'Thiếu linh khí' && why !== 'Thiếu vàng' && why !== 'Thiếu mảnh trùm' ? why : 'Nâng cấp bộ', { size: 7, pad: 1, primary: !why, disabled: !!why })) {
        if (VM.nangBo(sv, bo)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên cấp {1}!', G.tv(B.ten), cap + 1)); }
      }
      if (g.manh > 0) { // đợt 4: mảnh trùm (dòng riêng để không đè nút)
        const co = VM.manh(sv, bo), reg = G.REGIONS[VM.boVungManh(bo)];
        tx(G.t('và {0} mảnh {1} (đang có {2}; hạ trùm vùng {3} được 3 mảnh)', g.manh, reg.bossName, Math.floor(co), G.tv(reg.name)), x, y + 19, wd - 96, { size: 6.5, color: co < g.manh ? WARN : SOFT });
        y += 10;
      }
      y += 17;
    } else { ui.text('Bộ này đã nâng tối đa.', x, y + 9, { size: 7, bold: true, color: GOOD }); y += 13; }
    if (o && o.boQuaDs) return y;
    const ds = (G.ZED_BO_KEYS || []).map((k) => G.tv(G.ZED_BO[k].ten) + ' ' + (G.zedBoMo(k, sv) ? VM.boCap(sv, k) + '/' + max : G.BO_MUA_BAT !== false && G.zedBoBan(k, sv) ? G.t('(chưa mua)') : G.t('(chưa mở)')));
    y = ui.para(G.t('Các bộ: {0}', ds.join(' · ')), x, y + 6, wd, { size: 6.5, color: TXT });
    return y;
  };
})();
