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
//   - Hình vũ khí trong ô đồ: bộ zed-vk (4 loại × 4 cấp, cùng ảnh js/zed_moi.js vẽ trên tay Zed); chưa tải xong thì vẽ như cũ.
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
  VM.boDuoc = function (sv, bo) { // '' là nâng được; không thì lý do
    sv = sv || G.save;
    if (!G.ZED_BO || !G.ZED_BO[bo]) return 'Không có bộ này';
    if (!G.zedBoMo(bo, sv)) return 'Chưa mở bộ';
    const g = VM.boGia(VM.boCap(sv, bo));
    if (!g) return 'Đã tối đa';
    if (VM.lk(sv) < g.lk) return 'Thiếu linh khí';
    if ((sv.gold | 0) < g.vang) return 'Thiếu vàng';
    return '';
  };
  VM.nangBo = function (sv, bo) {
    if (VM.boDuoc(sv, bo) !== '') return false;
    const cap = VM.boCap(sv, bo), g = VM.boGia(cap);
    sv.linhKhi = r1(VM.lk(sv) - g.lk); sv.gold -= g.vang;
    if (!sv.boCap || typeof sv.boCap !== 'object' || Array.isArray(sv.boCap)) sv.boCap = {};
    sv.boCap[bo] = cap + 1;
    return true;
  };
  VM.coTheNangBo = function (sv) {
    sv = sv || G.save;
    return !!(G.ZED_BO_KEYS && G.ZED_BO_KEYS.some((k) => VM.boDuoc(sv, k) === ''));
  };

  // ---------- thưởng thay đồ rơi (js/stage.js gọi) ----------
  const vung = (r) => kep(r | 0, 0, 2);
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
  VM.baoChuyen = function (sv) {
    const h = sv && sv.heMoiBao;
    if (sv) delete sv.heMoiBao;
    if (!h || typeof h !== 'object') return null;
    const phan = [];
    if (h.vk) phan.push(G.t('{0} vũ khí trùng', h.vk));
    if (h.ao) phan.push(G.t('{0} món quần áo cũ', h.ao));
    return G.t('Vũ khí nay cố định 4 món (Kiếm, Thương, Búa, Phi tiêu), nâng bằng linh khí ở Ông Thợ Rèn. {0}Hoàn lại: {1} vàng, {2} linh khí.',
      phan.length ? G.t('Đã đổi {0}. ', phan.join(', ')) : '', h.vang | 0, Math.floor(num(h.lk, 0)));
  };

  if (G.fixSave && !G.fixSave.vkMoiBoc) {
    const goc = G.fixSave;
    G.fixSave = function (s) {
      const vao = s && typeof s === 'object' && !Array.isArray(s);
      if (vao && s.v === 1 && s.heMoi !== 1) saoLuu(s); // bản gốc, trước mọi phần sửa
      const r = goc.apply(this, arguments);
      if (!r || typeof r !== 'object') return r;
      if (r.heMoi !== 1) {
        // chuyển trên bản sao; lỗi giữa chừng thì bản lưu không bị chuyển dở (lần nạp sau thử lại)
        try {
          const c = JSON.parse(JSON.stringify(r));
          VM.chuyen(c);
          for (const k of Object.keys(r)) if (!(k in c)) delete r[k];
          Object.assign(r, c);
        } catch (e) { console.error('Linh Khí: lỗi khi chuyển bản lưu sang hệ thống mới (giữ nguyên bản lưu)', e); }
      }
      try { VM.chuan(r); } catch (e) { console.error('Linh Khí: lỗi khi sửa vũ khí của bản lưu hệ thống mới', e); }
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
      VM.themLk(G.save, n);
      const W = G.getWorld && G.getWorld();
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
  function anhVk(V, loai, cap, he) {
    const r = V.tep.vk[loai][cap];
    if (!he || typeof document === 'undefined') return { img: V.img, x: r[0], y: r[1], w: r[2], h: r[3] };
    const k = loai + cap + he;
    let cv = NHUOM.get(k);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = r[2]; cv.height = r[3];
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(V.img, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
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
    const a = anhVk(V, loai, cap, he), cheo = loai !== 'phitieu';
    const k = cheo ? (size * 1.35) / (a.w + a.h) : size / Math.max(a.w, a.h);
    c.save();
    c.imageSmoothingEnabled = k < 1;
    c.translate(Math.round(x), Math.round(y));
    if (cheo) c.rotate(-Math.PI / 4);
    c.drawImage(a.img, a.x, a.y, a.w, a.h, (-a.w * k) / 2, (-a.h * k) / 2, a.w * k, a.h * k);
    c.restore();
    return true;
  };
  if (G.art && G.art.weaponIcon && !G.art.weaponIcon.vkMoiBoc) {
    const goc = G.art.weaponIcon;
    G.art.weaponIcon = function (c, w, x, y, size) {
      if (w) { try { if (VM.icon(c, w, x, y, size || 22)) return; } catch (e) { /* vẽ như cũ */ } }
      return goc.apply(this, arguments);
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
      T.slot(x + 3, y + 3, 32, 0);
      G.art.weaponIcon(G.ux, w, x + 19, y + 19, 26);
      const bw = ro ? 0 : 150, tw = wd - 44 - bw;
      tx(G.wName(w) + (dau ? ' · ' + G.t('cầm khi vào ải') : ''), x + 40, y + 10, tw, { size: 7.5, bold: true, color: E ? E.col : TXT });
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
  VM.boPanel = function (x, y, wd, ro, say) {
    const T = G.theme, sv = G.save;
    if (!T || !sv || !G.ZED_BO || !G.zedBo) return y;
    say = say || (() => {});
    T.head('Bộ trang phục Zed', x, y + 8);
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
      if (!ro && T.sbtn(x + wd - 92, y, 90, 15, why && why !== 'Thiếu linh khí' && why !== 'Thiếu vàng' ? why : 'Nâng cấp bộ', { size: 7, pad: 1, primary: !why, disabled: !!why })) {
        if (VM.nangBo(sv, bo)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên cấp {1}!', G.tv(B.ten), cap + 1)); }
      }
      y += 17;
    } else { ui.text('Bộ này đã nâng tối đa.', x, y + 9, { size: 7, bold: true, color: GOOD }); y += 13; }
    const ds = (G.ZED_BO_KEYS || []).map((k) => G.tv(G.ZED_BO[k].ten) + ' ' + (G.zedBoMo(k, sv) ? VM.boCap(sv, k) + '/' + max : G.t('(chưa mở)')));
    y = ui.para(G.t('Các bộ: {0}', ds.join(' · ')), x, y + 6, wd, { size: 6.5, color: TXT });
    return y;
  };
})();
