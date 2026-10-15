// BƯỚC 2 — PHIÊN C: THÀNH TỰU + DANH HIỆU (docs/ke-hoach/buoc-2/KE-HOACH.md mục 1.3, mục 2, mục 4 "Phiên C")
//   - 30 thành tựu (bảng G.THANH_TUU ở cuối js/data.js), thưởng MỘT lần, phải bấm "Nhận". Ba cấp huy hiệu: Đồng, Bạc, Vàng.
//   - Bộ đếm trọn đời ở G.save.tt.dem (quai, tinhAnh, khongBinh, khacChe, khongKip, heTT, chuongDay): cộng trong bộ nhớ khi nghe sự kiện
//     của js/su_kien.js (haQuai, hetAi), KHÔNG ghi localStorage mỗi con — settle / luu_luot.js / làng đã gọi G.persist().
//   - Thành tựu đọc từ tiến độ (sao, trùm đã hạ, cấp, bậc ép, cấp vũ khí, mài, bộ đồ, cây chưởng, sổ, rương ngày) tự đạt ngay khi kiểm,
//     nên bản lưu cũ được "bù" ngay lần đầu (cờ tt.bu = 1); thành tựu đếm số bắt đầu đếm từ bản này.
//   - Sổ yêu quái (G.save.so, Phiên A) và Việc hôm nay (G.save.nv, Phiên B) chỉ ĐỌC an toàn: chưa có thì coi như 0.
//   - Thẻ "Thành tựu" ở Ông Từ (G.villageApi.PANELS.thanhTuu), mở sau khi qua ải Rừng già 1. Chọn danh hiệu (chỉ để khoe, không cộng sức mạnh);
//     danh hiệu hiện ở bảng này, ở Hành trang (dưới hình Cu Tí, js/hanh_trang.js gọi G.thanhTuu.hanhTrang) và trên đầu Cu Tí trong làng.
//   - Ảnh chưa có (B11 gd-huy-khung, B12 gd-huy-hinh, B13 gd-danh-hieu, B17 hu-huy-hieu): vẽ code tạm; có ảnh (Phiên D) thì tự dùng ảnh.
// Cờ quay lui: ?thanhtuu=0 (G.THANH_TUU_BAT = false): không nghe sự kiện, thẻ ẩn, không hiện danh hiệu; dữ liệu tt trong bản lưu giữ nguyên.
// ?sukien=0 cũng tắt hệ này (không có sự kiện, thẻ Bước 2 ẩn).
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.THANH_TUU) return;
  if (G.THANH_TUU_BAT === undefined) { let tat = false; try { tat = /[?&]thanhtuu=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; } G.THANH_TUU_BAT = !tat; }
  const D = G.THANH_TUU, num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const obj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const TT = (G.thanhTuu = { D });
  TT.bat = () => G.THANH_TUU_BAT !== false && !!(G.suKien && G.suKien.bat && G.suKien.bat());
  const BY = {}; for (const a of D.DS) BY[a.ma] = a;
  TT.theoMa = (ma) => BY[ma] || null;

  // ---------- chữ tiếng Anh ----------
  if (G.ngonNgu && G.ngonNgu.them) {
    G.ngonNgu.them({
      'Đồng': 'Bronze', 'Bạc': 'Silver', 'Vàng': 'Gold',
      'Bước đầu': 'First Steps', 'Qua ải hướng dẫn': 'Clear the tutorial stage',
      'Cứu bạn đầu tiên': 'First Rescue', 'Hạ Mộc Tinh, cứu Cu Tèo': 'Defeat Moc Tinh, rescue Cu Tèo',
      'Cứu Cái Bống': 'Rescue Cái Bống', 'Hạ Ngư Tinh, cứu Cái Bống': 'Defeat Ngu Tinh, rescue Cái Bống',
      'Cứu Cu Lì': 'Rescue Cu Lì', 'Hạ Hồ Tinh, cứu Cu Lì': 'Defeat Ho Tinh, rescue Cu Lì',
      'Diệt yêu': 'Monster Bane', 'Hạ 100 quái': 'Defeat 100 monsters',
      'Trừ yêu': 'Monster Hunter', 'Hạ 1.000 quái': 'Defeat 1,000 monsters',
      'Khắc tinh yêu quái': 'Bane of Monsters', 'Hạ 5.000 quái': 'Defeat 5,000 monsters',
      'Săn tinh anh': 'Elite Hunter', 'Hạ 50 tinh anh': 'Defeat 50 elites',
      'Mười lăm sao': 'Fifteen Stars', 'Tổng 15 sao (độ khó thường)': '15 stars in total (normal difficulty)',
      'Trọn sao': 'All Stars', 'Đủ 45 sao ở 15 ải độ khó thường': 'All 45 stars on the 15 normal stages',
      'Gan dạ': 'Brave', 'Qua 1 ải độ khó 2': 'Clear 1 stage on difficulty 2',
      'Không sợ trùm': 'Fearless', 'Hạ Hồ Tinh ở độ khó 2': 'Defeat Ho Tinh on difficulty 2',
      'Không cần thuốc': 'No Potions Needed', 'Qua 10 ải không dùng bình máu': 'Clear 10 stages without a potion',
      'Biết người biết ta': 'Know Your Foe', 'Hạ trùm bằng hệ khắc chế 10 lần': 'Defeat bosses with their weak element 10 times',
      'Nhanh hơn trùm': 'Faster than the Boss', 'Hạ một trùm vùng khi nó chưa kịp kháng hệ nào': 'Defeat a region boss before it resists any element',
      'Mầm non': 'Sprout', 'Nâng 1 vũ khí lên Mầm': 'Raise 1 weapon to Sprout',
      'Nâng 1 vũ khí lên Thức tỉnh': 'Raise 1 weapon to Awakened',
      'Bốn món thần binh': 'Four Divine Weapons', 'Cả 4 vũ khí lên Thức tỉnh': 'Raise all 4 weapons to Awakened',
      'Đủ ba hệ': 'Three Elements', 'Có vũ khí Thức tỉnh hệ Lửa, Độc và Băng (cùng lúc hoặc lần lượt)': 'Own an Awakened Fire, Poison and Ice weapon (at once or in turn)',
      'Ép đồ lên Tím': 'Purple Tier', 'Ép 1 vũ khí lên bậc Tím': 'Refine 1 weapon to Purple tier',
      'Rực lửa': 'Blazing', 'Ép 1 vũ khí lên bậc Rực lửa': 'Refine 1 weapon to Blazing tier',
      'Mài sắc': 'Razor Sharp', 'Mài 1 vũ khí lên +10': 'Sharpen 1 weapon to +10',
      'Lớn khôn': 'Growing Up', 'Cu Tí lên cấp 20': 'Cu Tí reaches level 20',
      'Trưởng thành': 'All Grown Up', 'Cu Tí lên cấp 40': 'Cu Tí reaches level 40',
      'Tủ đồ': 'Wardrobe', 'Mở đủ 4 bộ trang phục': 'Unlock all 4 outfits',
      'Chưởng đầy': 'Full Palm', 'Học đầy 1 cây chưởng': 'Fill 1 palm-blast tree',
      'Chép sổ': 'Note Taker', '12 trang Sổ yêu quái đạt ★': '12 Monster Book pages at ★',
      'Sổ đủ trang': 'Complete Book', 'Cả 36 trang Sổ yêu quái đạt ★★': 'All 36 Monster Book pages at ★★',
      'Chăm chỉ': 'Hard Worker', 'Nhận rương ngày 7 lần': 'Open the daily chest 7 times',
      'Siêng năng': 'Diligent', 'Nhận rương ngày 30 lần': 'Open the daily chest 30 times',
      'Tân binh': 'Rookie', 'Người cứu bạn': 'Friend Saver', 'Anh hùng làng': 'Village Hero', 'Sao sáng': 'Shining Star',
      'Không biết sợ': 'Fearless One', 'Quân sư nhí': 'Little Strategist', 'Tia chớp': 'Lightning', 'Chủ thần binh': 'Divine Arms Master',
      'Thợ rèn lửa': 'Fire Smith', 'Đại hiệp nhí': 'Little Hero', 'Nhà yêu quái học': 'Monsterologist', 'Chăm ngoan': 'Good Kid',
      'Con ngoan trò giỏi': 'Star Pupil',
      'Thợ săn Rừng già': 'Old Forest Hunter', 'Thợ săn Hang biển': 'Sea Cave Hunter', 'Thợ săn Lâu đài cổ': 'Ancient Castle Hunter',
      'Bậc thầy Rừng già': 'Old Forest Master', 'Bậc thầy Hang biển': 'Sea Cave Master', 'Bậc thầy Lâu đài cổ': 'Ancient Castle Master',
      'Danh hiệu': 'Title', 'Đổi danh hiệu': 'Change title', 'Chưa đeo danh hiệu': 'No title', 'Không đeo': 'None', '← Thành tựu': '← Achievements',
      'Chọn danh hiệu': 'Pick a title', 'Nhận': 'Claim', 'Đã nhận': 'Claimed',
      'Đã đạt {0}/{1}': 'Done {0}/{1}', 'Chờ nhận: {0}': 'To claim: {0}', 'Huy hiệu {0}': '{0} badge', 'Tiến độ: {0}/{1}': 'Progress: {0}/{1}',
      'Thưởng: {0}': 'Reward: {0}', '{0} vàng': '{0} gold', '{0} linh khí': '{0} spirit', '{0} đá nâng bậc': '{0} tier stones', '{0} bùa giữ bậc': '{0} tier wards',
      '{0} quặng': '{0} ore', 'danh hiệu "{0}"': 'title "{0}"', 'Danh hiệu: {0}': 'Title: {0}',
      'Chạm một huy hiệu để xem cách đạt.': 'Tap a badge to see how to earn it.',
      'Chưa có danh hiệu nào. Nhận thành tựu có danh hiệu để đeo.': 'No titles yet. Claim an achievement with a title to wear it.',
      'Danh hiệu chỉ để khoe, không thêm sức mạnh.': 'Titles are just for show, they add no power.',
      'Mỗi huy hiệu là một công lao của cháu. Đạt rồi thì bấm Nhận nhé.': 'Each badge is a deed of yours. Tap Claim once you earn it.',
      'Có {0} huy hiệu đang chờ cháu nhận đấy!': '{0} badges are waiting for you to claim!',
      'Giỏi lắm! Ông đã ghi công cho cháu.': 'Well done! I have recorded your deed.',
      'Đã đeo danh hiệu "{0}".': 'Now wearing the title "{0}".', 'Đã cất danh hiệu.': 'Title removed.',
      'Cháu thích danh hiệu nào thì đeo danh hiệu đó.': 'Wear whichever title you like best.',
    });
  }

  // ---------- đọc bản lưu an toàn ----------
  function tt(sv) {
    sv = sv || G.save;
    if (!obj(sv)) return null;
    if (!obj(sv.tt)) { if (G.suKien && G.suKien.suaBanLuu) G.suKien.suaBanLuu(sv); if (!obj(sv.tt)) return null; }
    const o = sv.tt;
    if (typeof o.v === 'number' && o.v > 1) return null; // bản game mới hơn: không đụng
    if (!obj(o.dem)) o.dem = {}; if (!obj(o.xong)) o.xong = {}; if (!obj(o.nhan)) o.nhan = {};
    return o;
  }
  TT.tt = tt;
  const dem = (o, k) => Math.max(0, num(o && o.dem ? o.dem[k] : 0, 0));
  const cong = (o, k, n) => { o.dem[k] = Math.min(1e12, dem(o, k) + (n == null ? 1 : n)); };
  const tongSao = (m) => { let s = 0; if (obj(m)) for (const k in m) s += Math.max(0, Math.min(3, num(m[k], 0))); return s; };
  const hs = (sv) => (obj(sv.heroes) ? sv.heroes[sv.hero] || sv.heroes.smith : null) || null;
  const dsVk = (sv) => (Array.isArray(sv.weapons) ? sv.weapons.filter(Boolean) : []);
  const capVk = (w) => { try { return G.wStage ? G.wStage(w) | 0 : 0; } catch (e) { return 0; } };
  const bacEp = (w) => { try { return G.epDo && G.epDo.bac ? G.epDo.bac(w) | 0 : 0; } catch (e) { return 0; } };
  // Sổ yêu quái (Phiên A): trang ★ = đã hạ (h > 0), ★★ = tìm ra điểm yếu (k). Chỉ tính mã có trong bảng sổ nếu bảng đã có.
  function maSo() {
    const S = G.SO_YQ;
    if (Array.isArray(S)) return S.map((t) => (t && (t.ma || t.id)) || t).filter((m) => typeof m === 'string');
    if (obj(S) && Array.isArray(S.ds)) return S.ds.map((t) => t && (t.ma || t.id)).filter((m) => typeof m === 'string');
    if (obj(S)) return Object.keys(S);
    return null;
  }
  function soTrang(sv, sao) {
    const q = obj(sv.so) && obj(sv.so.q) ? sv.so.q : null;
    if (!q) return 0;
    const ma = maSo(), ks = ma && ma.length ? ma.filter((m) => obj(q[m])) : Object.keys(q);
    let n = 0;
    for (const m of ks) { const t = q[m]; if (!obj(t)) continue; if (sao >= 2 ? t.k : num(t.h, 0) > 0 || t.k) n++; }
    return n;
  }
  const BIT_HE = { fire: 1, poison: 2, ice: 4 };
  const demBit = (b) => (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1);
  // Ghi các mốc "lần lượt" (đã từng có): hệ của vũ khí Thức tỉnh, cây chưởng đầy. Trả về true nếu có gì mới.
  function ghiMoc(sv, o) {
    let moi = false;
    let b = dem(o, 'heTT') | 0;
    for (const w of dsVk(sv)) if (capVk(w) >= 3 && BIT_HE[w.branch] && !(b & BIT_HE[w.branch])) { b |= BIT_HE[w.branch]; moi = true; }
    if (moi) o.dem.heTT = b;
    if (!dem(o, 'chuongDay')) {
      try {
        const h = hs(sv);
        if (h && G.chuong && G.CHUONG && obj(h.ch) && G.CHUONG.trees[h.ch.cay]) {
          const full = G.chuong.fullPts(h.ch.cay); let s = 0;
          if (obj(h.ch.n)) for (const k in h.ch.n) s += Math.max(0, num(h.ch.n[k], 0));
          if (full > 0 && s >= full) { o.dem.chuongDay = 1; moi = true; }
        }
      } catch (e) { /* bỏ qua */ }
    }
    return moi;
  }
  // Tiến độ một thành tựu: [đã có, cần]
  function tienDo(a, sv, o) {
    const d = a.dk || {}, k = d.k;
    try {
      if (k === 'huongDan') return [(sv.tut && sv.tut.done) || (obj(sv.stars) && sv.stars['0-0'] > 0) ? 1 : 0, 1];
      if (k === 'cuu') {
        const r = d.vung | 0, reg = G.REGIONS && G.REGIONS[r], ai = r + '-4';
        const ok = (obj(sv.stars) && sv.stars[ai] > 0) || (obj(sv.stars2) && sv.stars2[ai] > 0) || (reg && reg.rescue && obj(sv.heroes) && sv.heroes[reg.rescue] && sv.heroes[reg.rescue].unlocked && G.zedHoc && G.zedHoc(reg.rescue, sv));
        return [ok ? 1 : 0, 1];
      }
      if (k === 'dem') return [Math.floor(dem(o, d.dem)), d.can];
      if (k === 'sao') return [tongSao(sv.stars), d.can];
      if (k === 'kho2') return [obj(sv.stars2) ? Object.keys(sv.stars2).filter((x) => sv.stars2[x] > 0).length : 0, d.can];
      if (k === 'kho2Ai') return [obj(sv.stars2) && sv.stars2[d.ai] > 0 ? 1 : 0, 1];
      if (k === 'vkCap') return [dsVk(sv).filter((w) => capVk(w) >= d.cap).length, d.so];
      if (k === 'baHe') return [demBit(dem(o, 'heTT') | 0), 3];
      if (k === 'ep') return [dsVk(sv).reduce((m, w) => Math.max(m, bacEp(w)), 0), d.bac];
      if (k === 'mai') return [dsVk(sv).reduce((m, w) => Math.max(m, num(w.sharpen, 0)), 0), d.can];
      if (k === 'cap') { const h = hs(sv); return [h ? num(h.lvl, 1) : 1, d.can]; }
      if (k === 'boDo') return [G.ZED_BO_KEYS && G.zedBoMo ? G.ZED_BO_KEYS.filter((b) => G.zedBoMo(b, sv)).length : 1, d.can];
      if (k === 'chuongDay') return [dem(o, 'chuongDay') ? 1 : 0, 1];
      if (k === 'soSao') return [soTrang(sv, d.sao), d.can];
      if (k === 'ruongNgay') return [obj(sv.nv) ? Math.max(0, num(sv.nv.demRuong, 0)) : 0, d.can];
    } catch (e) { /* điều kiện lỗi: coi như chưa đạt */ }
    return [0, 1];
  }
  TT.tienDo = (ma, sv) => { sv = sv || G.save; const a = BY[ma], o = tt(sv); return a && o ? tienDo(a, sv, o) : [0, 1]; };
  // Kiểm mọi thành tựu: đánh dấu xong (giữ mãi, kể cả khi tiến độ sau đó giảm — ví dụ ép tụt bậc). Lần đầu: bù bản lưu cũ (tt.bu = 1).
  // Trả về danh sách mã vừa đạt.
  TT.kiem = function (sv) {
    sv = sv || G.save;
    const o = tt(sv);
    if (!o) return [];
    ghiMoc(sv, o);
    const moi = [];
    for (const a of D.DS) {
      if (o.xong[a.ma]) continue;
      const p = tienDo(a, sv, o);
      if (p[0] >= p[1]) { o.xong[a.ma] = 1; moi.push(a.ma); }
    }
    if (!o.bu) o.bu = 1;
    return moi;
  };
  TT.choNhan = function (sv) { const o = tt(sv); if (!o) return []; return D.DS.filter((a) => o.xong[a.ma] && !o.nhan[a.ma]).map((a) => a.ma); };
  TT.soXong = function (sv) { const o = tt(sv); return o ? D.DS.filter((a) => o.xong[a.ma]).length : 0; };

  // ---------- thưởng ----------
  function chuThuong(th) {
    const a = [];
    if (th.vang) a.push(G.t('{0} vàng', th.vang));
    if (th.lk) a.push(G.t('{0} linh khí', th.lk));
    if (th.da) a.push(G.t('{0} đá nâng bậc', th.da));
    if (th.bua) a.push(G.t('{0} bùa giữ bậc', th.bua));
    if (th.quang) a.push(G.t('{0} quặng', th.quang));
    if (th.dh && D.DH[th.dh]) a.push(G.t('danh hiệu "{0}"', G.tv(D.DH[th.dh].ten)));
    return a.join(', ');
  }
  TT.chuThuong = (ma) => (BY[ma] ? chuThuong(BY[ma].th || {}) : '');
  // Nhận thưởng: chỉ khi đã đạt và chưa nhận (một lần duy nhất). Có danh hiệu mà đang chưa đeo gì thì tự đeo luôn.
  TT.nhan = function (ma, sv) {
    sv = sv || G.save;
    const a = BY[ma], o = tt(sv);
    if (!a || !o || !TT.bat()) return false;
    if (!o.xong[ma]) TT.kiem(sv);
    if (!o.xong[ma] || o.nhan[ma]) return false;
    const th = a.th || {};
    o.nhan[ma] = 1;
    if (th.vang) sv.gold = num(sv.gold, 0) + th.vang;
    if (th.lk) { if (G.vkMoi && G.vkMoi.themLk) G.vkMoi.themLk(sv, th.lk); else sv.linhKhi = num(sv.linhKhi, 0) + th.lk; }
    if (th.da) { if (G.epDo && G.epDo.themDa) G.epDo.themDa(sv, th.da); else sv.daBac = num(sv.daBac, 0) + th.da; }
    if (th.bua) { if (G.epDo && G.epDo.themBua) G.epDo.themBua(sv, th.bua); else sv.buaBac = num(sv.buaBac, 0) + th.bua; }
    if (th.quang) sv.ore = num(sv.ore, 0) + th.quang;
    if (th.dh && D.DH[th.dh] && !(o.dh && TT.coDh(o.dh, sv))) o.dh = th.dh;
    return true;
  };

  // ---------- danh hiệu ----------
  TT.coDh = function (ma, sv) {
    sv = sv || G.save;
    const h = D.DH[ma], o = tt(sv);
    if (!h || !o) return false;
    if (h.tu === 'so') { const v = obj(sv.so) && obj(sv.so.vung) ? num(sv.so.vung[h.vung], 0) : 0; return !!(v & h.bit); }
    return D.DS.some((a) => a.th && a.th.dh === ma && o.nhan[a.ma]);
  };
  TT.dsDh = (sv) => Object.keys(D.DH).filter((m) => TT.coDh(m, sv));
  // Danh hiệu đang đeo (đã có thật) → { ma, ten, cap } | null
  TT.dangDeo = function (sv) {
    sv = sv || G.save;
    if (!TT.bat()) return null;
    const o = tt(sv);
    if (!o || !o.dh || !D.DH[o.dh] || !TT.coDh(o.dh, sv)) return null;
    return Object.assign({ ma: o.dh }, D.DH[o.dh]);
  };
  TT.deo = function (ma, sv) {
    sv = sv || G.save;
    const o = tt(sv);
    if (!o) return false;
    if (!ma) { delete o.dh; return true; }
    if (!TT.coDh(ma, sv)) return false;
    o.dh = ma; return true;
  };

  // ---------- nghe sự kiện (js/su_kien.js) ----------
  if (TT.bat() && G.suKien && G.suKien.on) {
    G.suKien.on('haQuai', (d) => {
      const o = tt(); if (!o) return;
      cong(o, 'quai');
      if (d.tinhAnh) cong(o, 'tinhAnh');
    });
    G.suKien.on('hetAi', (d) => {
      const o = tt(); if (!o || !d.win || d.quit) return;
      if (!d.aiNgay && !d.tut) {
        if (d.khongBinh) cong(o, 'khongBinh');
        if (d.khacChe) cong(o, 'khacChe');
        const L = d.S && Array.isArray(d.S.layers) ? d.S.layers : null;
        if (d.trumVung && L && !L.some((l) => l && l.type === 'resist')) cong(o, 'khongKip');
      }
      TT.kiem();
    });
    G.suKien.on('nangCap', () => { TT.kiem(); });
  }

  // ---------- vẽ (code tạm, chờ ảnh B11 / B12 / B13 / B17) ----------
  const ui = G.ui, T = G.theme;
  const gd = (ma) => { const s = G.spriteCustom; return s && s.gdSan ? s.gdSan(ma) : null; };
  const veGd = (ma, x, y, w, h) => { const g = gd(ma); return !!(g && G.spriteCustom.veGd(G.ux, g, x, y, w, h)); };
  const SOFT = '#a9c2b4', TXT = '#f1e6c6', GOLD = '#f6dc92', GOOD = '#9be07a', INK = '#14182e';
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  // Hình nhỏ giữa huy hiệu (16 hình như tấm B12). Vẽ trên lưới 9×9 ô, mỗi ô k điểm, tâm (cx, cy).
  const HINH = [
    // 0 chim Lạc
    ['...##....', '..####...', '.##.###..', '#########', '...#####.', '....####.', '...##..##', '..##.....', '.........'],
    // 1 bé
    ['...###...', '..#####..', '..#.#.#..', '..#####..', '...###...', '.#######.', '#..###..#', '...#.#...', '..##.##..'],
    // 2 sọ quái (có sừng)
    ['#.......#', '##.....##', '.#######.', '##.###.##', '#########', '.##.#.##.', '..#####..', '..#.#.#..', '.........'],
    // 3 sao
    ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'],
    // 4 bình máu
    ['...###...', '....#....', '...###...', '..#####..', '.#######.', '.#######.', '.#######.', '..#####..', '.........'],
    // 5 hai vũ khí bắt chéo
    ['#.......#', '.#.....#.', '..#...#..', '...#.#...', '....#....', '...#.#...', '.##...##.', '##.....##', '.........'],
    // 6 mầm
    ['.##...##.', '####.####', '.###.###.', '...###...', '....#....', '....#....', '....#....', '..#####..', '.#######.'],
    // 7 kiếm Thức tỉnh
    ['........#', '.......##', '......##.', '.....##..', '#...##...', '.#.##....', '..##.....', '.#.#.....', '#...#....'],
    // 8 ba hệ (ba viên tròn)
    ['...###...', '..#####..', '..#####..', '...###...', '.........', '###...###', '###...###', '###...###', '.........'],
    // 9 đe
    ['.........', '#########', '.#######.', '..#####..', '...###...', '...###...', '..#####..', '.#######.', '.........'],
    // 10 lửa
    ['....#....', '...##....', '...###...', '..####.#.', '..######.', '.#######.', '.###.###.', '..#...#..', '...###...'],
    // 11 đá mài
    ['.........', '......##.', '....####.', '..######.', '.#######.', '.######..', '.####....', '.##......', '.........'],
    // 12 sổ mở
    ['.........', '##.....##', '####.####', '####.####', '####.####', '####.####', '#########', '....#....', '.........'],
    // 13 lịch mặt trời
    ['#.#.#.#.#', '.........', '#.#####.#', '..#####..', '#.##.##.#', '..#####..', '#.#####.#', '.........', '#.#.#.#.#'],
    // 14 rương
    ['.........', '.#######.', '#########', '#########', '####.####', '#########', '#########', '#########', '.........'],
    // 15 vương miện
    ['.........', '#...#...#', '##.###.##', '#########', '#########', '#########', '.#######.', '.........', '.........'],
  ];
  function veHinh(i, cx, cy, s, col, toi) {
    if (veGd('gd-huy-hinh-' + i, cx - s / 2, cy - s / 2, s, s)) return;
    const c = G.ux, m = HINH[i] || HINH[0], k = s / 9;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) if (m[y][x] === '#') {
      if (toi) rect(c, cx - s / 2 + x * k + k * 0.35, cy - s / 2 + y * k + k * 0.35, k, k, toi);
      rect(c, cx - s / 2 + x * k, cy - s / 2 + y * k, k, k, col);
    }
  }
  // Huy hiệu tròn khung đồng / bạc / vàng / khoá (ảnh B11 gd-huy-khung-<cap|khoa> khi có)
  function veHuy(a, cx, cy, r, st, chon) {
    const c = G.ux, C = D.CAP[a.cap] || D.CAP.dong, khoa = st === 0, t = G.time || 0;
    if (chon) { c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 5); c.beginPath(); c.arc(cx, cy, r + 2.5, 0, 7); c.fillStyle = GOLD; c.fill(); c.restore(); }
    if (!veGd('gd-huy-khung-' + (khoa ? 'khoa' : a.cap), cx - r, cy - r, r * 2, r * 2)) {
      c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fillStyle = INK; c.fill();
      c.beginPath(); c.arc(cx, cy, r - 1, 0, 7); c.fillStyle = khoa ? '#4a4e56' : C.toi; c.fill();
      c.beginPath(); c.arc(cx, cy, r - 2, 0, 7); c.fillStyle = khoa ? '#7a7e86' : C.mau; c.fill();
      // răng cưa mặt trống đồng trên vành
      c.fillStyle = khoa ? '#5a5e66' : C.toi;
      for (let i = 0; i < 12; i++) { const g = (i / 12) * Math.PI * 2; c.fillRect(Math.round(cx + Math.cos(g) * (r - 2.5) - 0.5), Math.round(cy + Math.sin(g) * (r - 2.5) - 0.5), 1, 1); }
      c.beginPath(); c.arc(cx, cy, r - 4, 0, 7); c.fillStyle = khoa ? '#24282e' : '#2a1a12'; c.fill();
    }
    if (khoa) {
      veHinh(a.hinh, cx, cy, Math.round(r * 1.05), 'rgba(150,156,166,0.35)');
      // ổ khoá nhỏ góc dưới phải
      const lx = cx + r * 0.32, ly = cy + r * 0.2;
      c.strokeStyle = '#c8ccd4'; c.lineWidth = 1; c.beginPath(); c.arc(lx + 2.5, ly, 1.8, Math.PI, 0); c.stroke();
      rect(c, lx, ly, 5, 4, '#c8ccd4'); rect(c, lx + 2, ly + 1, 1, 2, INK);
      return;
    }
    veHinh(a.hinh, cx, cy, Math.round(r * 1.05), st === 2 ? GOLD : C.mau, 'rgba(0,0,0,0.55)');
    if (st === 1) { // đã đạt, chờ nhận: lấp lánh + chấm đỏ
      const k = (t * 1.6 + cx * 0.07) % 1;
      c.save(); c.globalAlpha = 1 - k; c.strokeStyle = '#fff2b0'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r + k * 4, 0, 7); c.stroke(); c.restore();
      c.beginPath(); c.arc(cx + r - 2, cy - r + 2, 3, 0, 7); c.fillStyle = '#ff5a3a'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = INK; c.stroke();
    }
  }
  TT.veHuy = veHuy;
  // Dải băng danh hiệu (ảnh B13 gd-danh-hieu-<cap> khi có), chữ trong lòng băng bằng T.chuTrongKhung
  function veDai(x, y, w, h, ten, cap, o) {
    o = o || {};
    const c = G.ux, C = D.CAP[cap] || null;
    const anh = C && veGd('gd-danh-hieu-' + cap, x, y, w, h);
    const duoi = Math.min(6, Math.floor(h / 2));
    if (!anh) {
      const m = C ? C.mau : '#6a6e76', d = C ? C.toi : '#3a3e46';
      // hai đuôi gấp
      for (const s of [-1, 1]) {
        const bx = s < 0 ? x : x + w - duoi - 1;
        rect(c, bx, y + 2, duoi + 1, h - 2, INK); rect(c, bx + (s < 0 ? 1 : 0), y + 3, duoi, h - 4, d);
        rect(c, s < 0 ? x : x + w - 2, y + 3 + Math.floor((h - 6) / 2), 2, 2, INK);
      }
      rect(c, x + duoi - 1, y, w - duoi * 2 + 2, h, INK);
      rect(c, x + duoi, y + 1, w - duoi * 2, h - 2, m);
      rect(c, x + duoi, y + 1, w - duoi * 2, 1, 'rgba(255,255,255,0.45)');
      rect(c, x + duoi, y + h - 2, w - duoi * 2, 1, d);
      for (let i = x + duoi + 2; i < x + w - duoi - 2; i += 4) rect(c, i, y + 2, 2, 1, d); // hoa văn chữ 回 tối giản
    }
    if (ten) T.chuTrongKhung(ten, x, y, w, h, { vien: [2, duoi + 1, 2, duoi + 1], size: o.size || 7.5, min: 6, bold: true, color: C ? '#2a1606' : '#d8dce4', shadow: false });
  }
  TT.veDai = veDai;
  // Hiệu ứng bấm Nhận (B15 hu-nhan-thuong / B17 hu-huy-hieu khi có ảnh): tia vàng + mảnh lấp lánh toả ra, 0,7 giây
  const U = { fx: null };
  function veFx() {
    const f = U.fx; if (!f) return;
    const a = (G.time || 0) - f.t0;
    if (a > 0.7 || a < 0) { U.fx = null; return; }
    const c = G.ux, k = a / 0.7;
    c.save();
    c.globalAlpha = 1 - k;
    c.strokeStyle = '#fff2b0'; c.lineWidth = 1.5; c.beginPath(); c.arc(f.x, f.y, 6 + k * 18, 0, 7); c.stroke();
    for (let i = 0; i < 10; i++) { const g = (i / 10) * Math.PI * 2 + 0.3, d = 4 + k * 22; rect(c, Math.round(f.x + Math.cos(g) * d), Math.round(f.y + Math.sin(g) * d + k * k * 8), 2, 2, i % 3 ? GOLD : '#c07cff'); }
    c.restore();
  }

  // ---------- thẻ "Thành tựu" ở Ông Từ ----------
  const VA = G.villageApi;
  const CX = 160, CW = 304, TOP = 68;
  const COT = 10, O_W = 30, O_H = 27, LUOI_Y = 100;
  function trangThai(o, a) { return o.nhan[a.ma] ? 2 : o.xong[a.ma] ? 1 : 0; }
  function panel() {
    const sv = G.save, V = VA.V;
    VA.khungThe('tu', 'Sân đình: thành tựu');
    const o = tt(sv);
    if (!o) { ui.para('Đang soạn…', CX + 4, 96, CW - 8, { size: 8, color: SOFT }); return ''; }
    TT.kiem(sv);
    // hàng danh hiệu đang đeo
    const dd = TT.dangDeo(sv), coDs = TT.dsDh(sv).length;
    ui.text('Danh hiệu', CX + 2, TOP + 11, { size: 8, bold: true, color: SOFT });
    ui.font(8, true); const lx = CX + 6 + Math.ceil(G.ux.measureText(G.tv('Danh hiệu')).width);
    const bw = CW - (lx - CX) - 92;
    veDai(lx, TOP + 2, bw, 15, dd ? dd.ten : coDs ? 'Chọn danh hiệu' : 'Chưa đeo danh hiệu', dd ? dd.cap : null);
    if (V.ttDoi) { if (T.sbtn(CX + CW - 86, TOP + 1, 86, 17, '← Thành tựu', { size: 7, pad: 2 })) { V.ttDoi = false; G.sfx('ui'); } }
    else if (T.sbtn(CX + CW - 86, TOP + 1, 86, 17, 'Đổi danh hiệu', { size: 7, pad: 2, disabled: !coDs })) { V.ttDoi = true; G.sfx('ui'); }
    if (V.ttDoi) return chonDanhHieu(sv, o);
    // dòng đếm
    const cho = TT.choNhan(sv).length;
    ui.text(G.t('Đã đạt {0}/{1}', TT.soXong(sv), D.DS.length), CX + 2, TOP + 28, { size: 7.5, bold: true, color: GOLD });
    if (cho) ui.text(G.t('Chờ nhận: {0}', cho), CX + CW - 2, TOP + 28, { size: 7.5, bold: true, align: 'right', color: '#ff9a7a' });
    // lưới huy hiệu 10 × 3
    if (V.ttSel == null || !BY[V.ttSel]) { const c1 = TT.choNhan(sv)[0]; V.ttSel = c1 || D.DS[0].ma; }
    D.DS.forEach((a, i) => {
      const x = CX + 2 + (i % COT) * O_W, y = LUOI_Y + Math.floor(i / COT) * O_H, st = trangThai(o, a);
      veHuy(a, x + O_W / 2, y + O_H / 2, 11.5, st, V.ttSel === a.ma);
      if (T.hit(x, y, O_W, O_H)) V.ttSel = a.ma;
    });
    // ô chi tiết
    const a = BY[V.ttSel], st = trangThai(o, a), p = tienDo(a, sv, o), C = D.CAP[a.cap];
    const y0 = LUOI_Y + 3 * O_H + 3, h0 = 262 - y0;
    T.inset(CX, y0, CW, h0, false);
    veHuy(a, CX + 20, y0 + 22, 14, st, false);
    const tx = CX + 40, tw = CW - 40 - 66;
    T.chuO(a.ten, CX, y0, CW, h0, { vung: [tx, y0 + 3, tw, 13], align: 'left', size: 9, min: 7, bold: true, color: st ? GOLD : TXT });
    T.chuO(G.t('Huy hiệu {0}', G.tv(C.ten)), CX, y0, CW, h0, { vung: [CX + CW - 66, y0 + 3, 62, 13], align: 'right', size: 7, min: 6, bold: true, color: C.mau });
    T.chuO(a.cach, CX, y0, CW, h0, { vung: [tx, y0 + 15, CW - 44, 20], align: 'left', dong: 2, gian: 1.5, size: 7, min: 6, bold: false, color: TXT });
    // thanh tiến độ
    const xong = st > 0, fr = xong ? 1 : Math.max(0, Math.min(1, p[0] / p[1]));
    const by = y0 + 37, bwid = CW - 44 - 70;
    T.bar(tx, by, bwid, 'xp', fr, null, { h: 7 });
    T.chuO(G.t('Tiến độ: {0}/{1}', xong ? p[1] : Math.min(p[0], p[1]), p[1]), CX, y0, CW, h0, { vung: [tx + bwid + 4, by - 3, CW - 44 - bwid - 4, 13], align: 'right', size: 6.5, min: 6, bold: true, color: xong ? GOOD : SOFT });
    T.chuO(G.t('Thưởng: {0}', chuThuong(a.th || {})), CX, y0, CW, h0, { vung: [CX + 4, by + 9, CW - 74, 24], align: 'left', dong: 2, gian: 1.5, size: 7, min: 6, bold: false, color: GOLD });
    const nbx = CX + CW - 66, nby = y0 + h0 - 24;
    if (st === 2) T.chuO('Đã nhận', CX, y0, CW, h0, { vung: [nbx, nby, 62, 20], align: 'center', size: 8, bold: true, color: GOOD });
    else if (T.sbtn(nbx, nby, 62, 20, 'Nhận', { size: 9, pad: 3, primary: st === 1, disabled: st !== 1 })) {
      const hx = CX + 2 + (D.DS.indexOf(a) % COT) * O_W + O_W / 2, hy = LUOI_Y + Math.floor(D.DS.indexOf(a) / COT) * O_H + O_H / 2;
      if (TT.nhan(a.ma, sv)) {
        U.fx = { x: hx, y: hy, t0: G.time || 0 };
        G.persist(); G.sfx('evolve');
        VA.say(a.th && a.th.dh && o.dh === a.th.dh ? G.t('Đã đeo danh hiệu "{0}".', G.tv(D.DH[a.th.dh].ten)) : 'Giỏi lắm! Ông đã ghi công cho cháu.');
        const tiep = TT.choNhan(sv)[0]; if (tiep) V.ttSel = tiep;
      }
    }
    veFx();
    if (cho) return G.t('Có {0} huy hiệu đang chờ cháu nhận đấy!', cho);
    return 'Mỗi huy hiệu là một công lao của cháu. Đạt rồi thì bấm Nhận nhé.';
  }
  // Chọn danh hiệu: danh sách danh hiệu đã có (2 cột) + "Không đeo"
  function chonDanhHieu(sv, o) {
    const ds = TT.dsDh(sv), V = VA.V;
    ui.para('Danh hiệu chỉ để khoe, không thêm sức mạnh.', CX + 2, TOP + 30, CW - 4, { size: 7, color: SOFT });
    if (!ds.length) { ui.para('Chưa có danh hiệu nào. Nhận thành tựu có danh hiệu để đeo.', CX + 2, TOP + 50, CW - 4, { size: 8, color: TXT }); return 'Cháu thích danh hiệu nào thì đeo danh hiệu đó.'; }
    const muc = ds.concat(['']), w = Math.floor((CW - 6) / 2), h = 20, per = 14;
    const trang = VA.pager(muc.length, per, CX + CW / 2 - 50, 244);
    muc.slice(V.page * per, V.page * per + per).forEach((m, i) => {
      const x = CX + (i % 2) * (w + 6), y = TOP + 38 + Math.floor(i / 2) * (h + 3), h0 = D.DH[m];
      const dang = (o.dh || '') === m;
      T.inset(x, y, w, h, dang);
      if (m) veDai(x + 4, y + 3, w - 8, h - 6, h0.ten, h0.cap, { size: 7 });
      else T.chuO('Không đeo', x, y, w, h, { sel: dang, size: 7.5, bold: true, color: SOFT });
      if (T.hit(x, y, w, h)) {
        TT.deo(m || null, sv); G.persist(); G.sfx('ui');
        VA.say(m ? G.t('Đã đeo danh hiệu "{0}".', G.tv(h0.ten)) : 'Đã cất danh hiệu.');
      }
    });
    void trang;
    return 'Cháu thích danh hiệu nào thì đeo danh hiệu đó.';
  }

  // ---------- Hành trang (js/hanh_trang.js gọi): dải danh hiệu dưới hình Cu Tí; ở làng chạm vào thì sang Ông Từ, thẻ Thành tựu ----------
  TT.hanhTrang = function (x, y, w, h, ro) {
    if (!TT.bat() || !T) return;
    const sv = G.save;
    if (!TT.mo(sv)) return;
    const dd = TT.dangDeo(sv);
    if (!dd && !TT.dsDh(sv).length) return;
    const bx = x + 4, by = y + h - 15, bw = w - 8, bh = 14;
    veDai(bx, by, bw, bh, dd ? dd.ten : 'Chọn danh hiệu', dd ? dd.cap : null, { size: 7 });
    if (!ro && T.hit(bx, by, bw, bh) && G.villageScene) {
      if (G.hanhTrang) G.hanhTrang.sel = null;
      G.villageScene.goNpc('tu', true); // như nút "Đến chỗ…" của Hành trang: tới Ông Từ, mở bảng
      if (VA.V.who === 'tu' && VA.theMo('thanhTuu')) { VA.V.tab = 'thanhTuu'; VA.V.ttab = 'thanhTuu'; VA.V.ttDoi = !dd; }
    }
  };

  // ---------- trên đầu Cu Tí trong làng (bọc G.villageScene.drawWorld, vẽ lên lớp giao diện ngay sau cảnh) ----------
  TT.mo = (sv) => { sv = sv || G.save; return TT.bat() && obj(sv) && obj(sv.stars) && sv.stars['0-0'] > 0; };
  const VS = G.villageScene;
  if (TT.bat() && VS && VS.drawWorld && !VS.drawWorld.thanhTuuBoc) {
    const goc = VS.drawWorld;
    VS.drawWorld = function (o) {
      const r = goc.apply(this, arguments);
      try {
        if (!(o && (o.hideHero || o.dim)) && G.scene === G.Village && TT.mo()) {
          const dd = TT.dangDeo(), S = VS.state;
          if (dd && S && !(S.bubble && !S.bubble.who)) {
            ui.font(6.5, true);
            const tw = Math.ceil(G.ux.measureText(G.tv(dd.ten)).width) + 16, hx = Math.round(S.x - S.cam), hy = Math.round(S.y + (VS.OY || 0) - 39);
            veDai(Math.round(hx - tw / 2), hy - 1, tw, 12, dd.ten, dd.cap, { size: 6.5 });
          }
        }
      } catch (e) { /* vẽ danh hiệu lỗi: bỏ qua */ }
      return r;
    };
    VS.drawWorld.thanhTuuBoc = true;
  }

  // ---------- gắn thẻ ----------
  if (TT.bat() && VA && VA.PANELS) {
    const f = function () { return panel(); };
    f.mo = (sv) => TT.mo(sv);
    f.cham = (sv) => { if (!TT.mo(sv)) return false; TT.kiem(sv); return TT.choNhan(sv).length > 0; };
    VA.PANELS.thanhTuu = f;
  }
})();
