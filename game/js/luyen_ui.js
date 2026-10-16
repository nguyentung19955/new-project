// LUYỆN VŨ KHÍ — phiên 2: giao diện (16/10, docs/review/ke-hoach-cai-thien/luyen-vu-khi/THIET-KE.md mục 5.1, 5.2; báo cáo bao-cao-2.md).
// Chỉ lớp giao diện, không đổi luật / số (G.LUYEN, js/luyen.js giữ nguyên). Nạp SAU js/luyen.js. Cờ ?luyen=0 (G.LUYEN_BAT = false): mọi hàm dưới
// trả về bản cũ / không làm gì.
//   1. Bảng Ông Thợ Rèn › Luyện (G.luyen.panel, o.h có số): khung của phiên Vũ khí C (js/hinh_thai.js bangLo) — cột trái 4 ô vũ khí, thẻ phải:
//      hình hiện tại ▶ hình MỐC KẾ (3/6/9/12/15; mốc 9/15 không đổi dáng: hình hiện tại trong khung màu kế + tên hiệu ứng), thanh tiến độ tới
//      mốc, "nâng xong đánh khác ra sao", giá bằng biểu tượng (thiếu thì đỏ), nút "Luyện lên N · giá", dòng khoá "Cần 1 mảnh … — hạ … ở …".
//   2. Hành trang › Vũ khí (G.luyen.panel không có o.h): bản rút gọn, mỗi vũ khí một hàng.
//   3. Ăn mừng 3 kiểu khi luyện ở làng: dài 1,45 s ở cấp 3/6/12 (đổi dáng: dùng lại HT.veAnMung của phiên Vũ khí C), ngắn 0,9 s ở cấp 9/15
//      (loé khung màu mới + tên hiệu ứng), dải "+1 · đòn +X" 0,5 s ở cấp thường (không chặn chạm).
//   4. Màn kết quả: "Kiếm lá đồng Lv 4 → Kiếm răng sói (Lv 6): còn 2 cấp · thiếu 120 vàng".
//   5. Thanh tài nguyên ở làng 3 ô (vàng, NLR, linh khí); biểu tượng NLR mượn ảnh quặng (T.resIcon 'nlr'), linh khí dùng viên ngọc VM.gem.
//   6. Bảng báo một lần khi chuyển bản lưu cũ (thay câu nói của phiên 1).
// Chữ trong khung: T.chuTrongKhung (căn giữa trong lòng khung, docs/review/ke-hoach-cai-thien/can-chu-khung).
(function () {
  'use strict';
  const G = window.G, ui = G && G.ui, L = G && G.luyen;
  if (!G || !ui || !L || !G.LUYEN) return;
  const CF = G.LUYEN, MAX = L.MAX, HT = G.hinhThai, VM = G.vkMoi, E = G.epDo;
  const TXT = '#f1e6c6', SOFT = '#a9c2b4', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const ELS = ['fire', 'poison', 'ice'];
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const so1 = (v) => (G.LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','));
  const soN = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, G.LANG === 'en' ? ',' : '.');
  const T = () => G.theme;
  const chu = (s, x, y, w, h, o) => T().chuTrongKhung(s, x, y, w, h, Object.assign({ vien: [0, 0, 0, 0], dem: 0, size: 7, min: 5.2, bold: false, color: TXT, dong: 1, gian: 1, align: 'left' }, o || {}));
  const bam = (x, y, w, h) => { if (G.click && G.inRect(G.click, x, y, w, h)) { G.click = null; return true; } return false; };
  const lk = (sv) => (VM ? VM.lk(sv) : Math.max(0, num(sv.linhKhi, 0)));
  const tenTrum = (i) => G.tv((G.REGIONS[i] && G.REGIONS[i].bossName) || '?');
  const tenVung = (i) => G.tv((G.REGIONS[i] && G.REGIONS[i].name) || '?');
  const tenNl = (i) => G.tv((G.REGIONS[i] && G.REGIONS[i].mat) || '?');
  const tenLoai = (w) => G.tv(G.WTYPES[w.type].name);
  const tenHT = (w, st) => (HT && HT.ten ? G.tv(HT.ten(w.type, st)) : tenLoai(w));
  const htCua = (lv) => L.hinhThai(lv);
  const mauKhung = (lv) => (E && E.mauBac ? E.mauBac(L.khung(lv)) : GOLD);

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Lv {0}/{1}': 'Lv {0}/{1}', 'còn {0} cấp': '{0} levels to go', 'còn 1 cấp': '1 level to go', 'Lv {0} → {1}': 'Lv {0} → {1}',
    'Luyện lên {0} · {1}': 'Temper to {0} · {1}', 'Lên Lv {0}: đòn {1} → {2}': 'Lv {0}: hit {1} → {2}',
    'Cần {0} mảnh {1} — hạ {1} ở {2} 5': 'Need {0} {1} shard(s) — beat {1} at {2} 5', 'Cần hạ {0} ở {1} 5 để luyện quá cấp {2}': 'Beat {0} at {1} 5 to temper past Lv {2}',
    'Cấp cao nhất': 'Top level', 'Viên mãn, đã luyện tối đa.': 'Perfected, fully tempered.', 'Dòng Viên mãn (đổi miễn phí)': 'Perfected line (free to switch)',
    'Chọn hệ cho vũ khí (miễn phí)': 'Pick an element (free)', 'Thôi': 'Cancel', 'Đổi hệ · {0}': 'Switch · {0}', 'Đổi hệ: {0} linh khí': 'Switch: {0} spirit',
    'Luyện chắc chắn thành công': 'Tempering always succeeds', 'Mốc kế': 'Next milestone',
    '+1 · {0} Lv {1} · đòn +{2}': '+1 · {0} Lv {1} · hit +{2}', 'Lên Lv {0}!': 'Lv {0}!', 'Chạm để bỏ qua': 'Tap to skip',
    '{0} Lv {1} → {2} (Lv {3}): còn {4} cấp': '{0} Lv {1} → {2} (Lv {3}): {4} to go', '{0} Lv {1}: đã luyện tối đa.': '{0} Lv {1}: fully tempered.',
    'thiếu {0}': 'need {0}', 'đủ đồ luyện lên {0}!': 'ready for Lv {0}!', 'cần hạ {0}': 'beat {0} first', 'cần chọn hệ ở Ông Thợ Rèn': 'pick an element at the Smith',
    '{0} mảnh {1}': '{0} {1} shards', '{0} NLR': '{0} FM',
    'Đã luyện tối đa': 'Fully tempered', 'Đến Ông Thợ Rèn để chọn hệ': 'Pick an element at the Smith',
    'Lò rèn đã gộp thành Luyện vũ khí': 'The forge is now Tempering', 'Vũ khí của Cu Tí': "Cu Tí's weapons", 'Được hoàn lại': 'Refunded',
    'Quặng, đá, bùa cũ đổi ra': 'Old ore, stones, wards became', 'Luyện chắc chắn thành công, không tụt cấp. Mở bảng ở Ông Thợ Rèn.': 'Tempering always succeeds and never drops a level. Open it at the Smith.',
    'Đã hiểu': 'Got it', 'Chí mạng': 'Crit', 'Trùm': 'Bosses', 'Hồi chiêu': 'Cooldown', 'Không có gì để hoàn.': 'Nothing to refund.', 'Nguyên liệu rèn': 'Forge materials', 'Linh khí': 'Spirit',
  });

  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Luyện vũ khí, mua và nâng bộ trang phục, đổi nguyên liệu, mua NLR, đặt lại điểm kỹ năng': 'Temper weapons, outfits, trade materials, buy FM, reset skills',
    'Luyện vũ khí ở Ông Thợ Rèn': 'Temper weapons at the Smith',
    'Qua ải, rương báu, phòng thử thách, thương nhân, trùm, Ải Rèn, Bà Hàng Xén (thẻ NLR)': 'Stages, chests, challenge rooms, merchants, bosses, Forge Trial, the Grocer',
    'Luyện cấp 3–6 và cấp 14': 'Temper Lv 3–6 and Lv 14', 'Luyện cấp 7–10 và cấp 15': 'Temper Lv 7–10 and Lv 15', 'Luyện cấp 11–13': 'Temper Lv 11–13',
    'Luyện lên cấp 6': 'Temper to Lv 6', 'Luyện lên cấp 10': 'Temper to Lv 10', 'Luyện lên cấp 13': 'Temper to Lv 13', 'Luyện lên cấp 14 và 15': 'Temper to Lv 14 and 15', '{0}; nâng bộ trang phục': '{0}; upgrade outfits',
    'Linh khí vào một túi chung. Cu Tí mang đủ 4 vũ khí (Kiếm, Thương, Búa, Phi tiêu); ở Ông Thợ Rèn luyện từng món từ cấp 1 lên 15: cấp 3 thành Mầm (chọn Lửa, Độc hoặc Băng), cấp 6 Thành hình, cấp 12 Thức tỉnh.':
      'Spirit goes into one shared pouch. Cu Tí carries all 4 weapons (Sword, Spear, Hammer, Shuriken); at the Smith, temper each from Lv 1 to 15: Lv 3 Sprout (pick Fire, Poison or Ice), Lv 6 Formed, Lv 12 Awakened.',
    'Luyện vũ khí ở Ông Thợ Rèn lần nào cũng thành công, không tụt cấp. Khung ô đổi màu theo cấp: Trắng, Xanh lam, Xanh lục, Tím, Vàng, Đỏ, Rực lửa.':
      'Tempering at the Smith always succeeds and never drops a level. The slot frame changes colour with the level: White, Blue, Green, Purple, Gold, Red, Blazing.',
    'Mỗi ải có Sức mạnh khuyên dùng. Số đỏ là bé còn yếu: chơi lại ải cũ để lên cấp, kiếm vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng, rồi luyện vũ khí.':
      'Each stage has a recommended Power. Red means you are still weak: replay old stages to level up and gather gold, spirit, forge materials and region materials, then temper your weapons.',
    'Thiếu nguyên liệu của vùng đã qua? Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải đổi vàng lấy nguyên liệu. Thiếu nguyên liệu rèn thì mua ở thẻ NLR của Bà Hàng Xén (mỗi ngày có hạn).':
      'Short on materials from a cleared region? The Grocer (Materials tab) and merchants in stages trade gold for them. Buy forge materials in the Grocer\'s FM tab (daily limit).',
  });
  // Sổ: gợi ý G.HINTS số 1, 7, 9, 10 nói theo Luyện (cờ tắt thì giữ câu cũ của js/data.js)
  if (L.bat() && Array.isArray(G.HINTS) && G.HINTS.length > 10) {
    G.HINTS[1] = 'Linh khí vào một túi chung. Cu Tí mang đủ 4 vũ khí (Kiếm, Thương, Búa, Phi tiêu); ở Ông Thợ Rèn luyện từng món từ cấp 1 lên 15: cấp 3 thành Mầm (chọn Lửa, Độc hoặc Băng), cấp 6 Thành hình, cấp 12 Thức tỉnh.';
    G.HINTS[7] = 'Luyện vũ khí ở Ông Thợ Rèn lần nào cũng thành công, không tụt cấp. Khung ô đổi màu theo cấp: Trắng, Xanh lam, Xanh lục, Tím, Vàng, Đỏ, Rực lửa.';
    G.HINTS[9] = 'Mỗi ải có Sức mạnh khuyên dùng. Số đỏ là bé còn yếu: chơi lại ải cũ để lên cấp, kiếm vàng, linh khí, nguyên liệu rèn và nguyên liệu vùng, rồi luyện vũ khí.';
    G.HINTS[10] = 'Thiếu nguyên liệu của vùng đã qua? Bà Hàng Xén (thẻ Nguyên liệu) và Thương nhân trong ải đổi vàng lấy nguyên liệu. Thiếu nguyên liệu rèn thì mua ở thẻ NLR của Bà Hàng Xén (mỗi ngày có hạn).';
  }

  // ---------- giá: thiếu gì (chữ ngắn) ----------
  // Phần thiếu đầu tiên của lần luyện lên cấp kế, dạng "120 vàng" / "2 gỗ linh" / "1 mảnh Mộc Tinh" ('' là đủ)
  L.thieu = function (sv, w) {
    sv = sv || G.save;
    const c = L.gia(L.cap(w) + 1);
    if (!c || !sv) return '';
    if (num(sv.gold, 0) < (c.v | 0)) return G.t('{0} vàng', soN((c.v | 0) - num(sv.gold, 0)));
    if (lk(sv) < (c.lk | 0)) return G.t('{0} linh khí', Math.ceil((c.lk | 0) - lk(sv)));
    if (L.nlr(sv) < (c.r | 0)) return G.t('{0} NLR', (c.r | 0) - L.nlr(sv));
    if (c.nl && num(sv.mats && sv.mats[c.nl[0]], 0) < c.nl[1]) return (c.nl[1] - num(sv.mats[c.nl[0]], 0)) + ' ' + tenNl(c.nl[0]).toLowerCase();
    if (c.m && num(sv.shards && sv.shards[c.m[0]], 0) < c.m[1]) return G.t('{0} mảnh {1}', c.m[1] - num(sv.shards[c.m[0]], 0), tenTrum(c.m[0]));
    return '';
  };
  // Dòng khoá của cấp kế (trần theo truyện hoặc thiếu mảnh trùm): '' khi không khoá
  L.khoa = function (sv, w) {
    sv = sv || G.save;
    const lv = L.cap(w), c = L.gia(lv + 1);
    if (!c || !sv) return '';
    const tran = lv + 1 > L.tran(sv), thieuM = c.m && num(sv.shards && sv.shards[c.m[0]], 0) < c.m[1];
    if (!tran && !thieuM) return '';
    if (c.m) return G.t('Cần {0} mảnh {1} — hạ {1} ở {2} 5', c.m[1], tenTrum(c.m[0]), tenVung(c.m[0]));
    const i = L.soTrum(sv);
    return G.t('Cần hạ {0} ở {1} 5 để luyện quá cấp {2}', tenTrum(i), tenVung(i), lv);
  };
  // Mốc trước (để thanh tiến độ đếm từ đó)
  const MOC = [1, CF.hinhThai[0], CF.hinhThai[1], CF.phuTu, CF.hinhThai[2], MAX];
  const mocTruoc = (lv) => { let m = 1; for (const k of MOC) if (k <= lv) m = k; return m; };
  L.tienDo = function (w) { // { mk, tu, frac, con }
    const lv = L.cap(w), mk = L.mocKe(w);
    if (!mk) return { mk: null, tu: lv, frac: 1, con: 0 };
    const tu = mocTruoc(lv);
    return { mk, tu, frac: kep((lv - tu) / Math.max(1, mk - tu), 0, 1), con: mk - lv };
  };
  // Tên mốc: tên hình thái mới (3/6/12) hoặc Tinh luyện / Viên mãn (9/15)
  L.tenMoc = function (w, mk) {
    if (mk === CF.phuTu) return G.tv('Tinh luyện');
    if (mk === MAX) return G.tv('Viên mãn');
    return tenHT(w, htCua(mk));
  };

  // ---------- vẽ: giá bằng biểu tượng ----------
  // Một hàng chip "biểu tượng + số" (thiếu thì số đỏ). Trả về x cuối.
  function veGia(c, sv, x, y, maxX) {
    const Th = T(), items = [];
    if (c.v) items.push(['gold', c.v | 0, num(sv.gold, 0) >= (c.v | 0)]);
    if (c.lk) items.push(['lk', c.lk | 0, lk(sv) >= (c.lk | 0)]);
    if (c.r) items.push(['nlr', c.r | 0, L.nlr(sv) >= (c.r | 0)]);
    if (c.nl) items.push(['mat' + c.nl[0], c.nl[1], num(sv.mats[c.nl[0]], 0) >= c.nl[1]]);
    if (c.m) items.push(['shard' + c.m[0], c.m[1], num(sv.shards[c.m[0]], 0) >= c.m[1]]);
    const size = 7, ih = 8;
    for (const q of items) {
      const s = soN(q[1]);
      ui.font(size, true);
      const tw = G.ux.measureText(s).width;
      if (x + ih + 1.5 + tw > maxX) break;
      if (q[0] === 'lk' && VM && VM.gem) VM.gem(x + ih / 2, y - ih / 2 + 1, 0.8); else Th.resIcon(q[0], x, y - ih + 1, ih);
      ui.text(s, x + ih + 1.5, y, { size, bold: true, color: q[2] ? TXT : WARN, tiny: true });
      x += ih + 1.5 + tw + 5;
    }
    return x;
  }
  L.veGia = veGia;
  // Số cấp Luyện ở góc ô (cùng kiểu E.soBac của js/ep_do.js)
  const soGoc = (c, x, y, s, lv) => { if (E && E.soBac) E.soBac(c, x + s - 1, y + s - 1, L.khung(lv), s < 24, lv); };

  // Ô hình mốc kế (ix, iy, cỡ s): khung màu của mốc + hình (đổi dáng → bóng mờ có khoá khi chưa tới; 9/15 → hình hiện tại)
  function veMocKe(w, mk, ix, iy, s, du, khoa) {
    const c = G.ux, st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null;
    if (E && E.o) E.o(ix, iy, s, L.khung(mk)); else T().slot(ix, iy, s, 0);
    const doiDang = htCua(mk) !== htCua(L.cap(w));
    const nhay = du ? 0.75 + 0.25 * Math.sin((G.time || 0) * 5) : 1;
    if (HT && HT.veAnh && HT.vkGia && VM && VM.anhO) {
      const a = VM.anhO(doiDang ? HT.vkGia(w, htCua(mk), el) : w);
      if (a) HT.veAnh(c, a, w.type, ix + s / 2, iy + s / 2, s - 5, doiDang ? (du ? { mo: 0.55 * nhay + 0.25 } : { bong: true, mo: 0.9 }) : { mo: du ? 0.7 + 0.3 * nhay : 0.85 });
    } else if (G.art && G.art.weaponIcon) { c.save(); c.globalAlpha *= 0.5; G.art.weaponIcon(c, w, ix + s / 2, iy + s / 2, s - 5); c.restore(); }
    soGoc(c, ix, iy, s, mk);
    if (khoa) veKhoa(ix + s - 7, iy + 7);
  }
  function veKhoa(x, y) {
    const SC = G.spriteCustom, g = SC && SC.gdSan ? SC.gdSan('gd-phong-lock') : null;
    if (g && SC.veGd(G.ux, g, Math.round(x - 5), Math.round(y - 5), 10, 10)) return;
    const c = G.ux;
    c.strokeStyle = '#d8c9a0'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y - 2, 3, Math.PI, 0); c.stroke();
    c.fillStyle = '#d8c9a0'; c.fillRect(x - 4.5, y - 2, 9, 7);
    c.fillStyle = '#3a2a1a'; c.fillRect(x - 0.7, y, 1.4, 3);
  }
  function muiLen(x, y) { const c = G.ux; c.fillStyle = GOOD; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3.5, y + 5); c.lineTo(x - 3.5, y + 5); c.closePath(); c.fill(); }
  // Ô vũ khí hiện tại (khung theo cấp + hình + số góc tự vẽ qua VM.icon)
  function veO(w, x, y, s, icon) { G.oBacVk(x, y, s, w); if (G.art && G.art.weaponIcon) G.art.weaponIcon(G.ux, w, x + s / 2, y + s / 2, icon || s - 6); }

  const VM_NGAN = { chiMang: 'Chí mạng', trum: 'Trùm', hoiChieu: 'Hồi chiêu' }; // chữ trên nút dòng Viên mãn (dòng đã chọn ghi đủ ở trên)
  // ---------- 1. bảng Ông Thợ Rèn ----------
  const U = L.ui; // { sel } của phiên 1
  U.doi = null; U.nut = {};
  const ghiNut = (k, x, y, w, h) => { U.nut[k] = [x, y, w, h]; }; // vị trí nút (bài kiểm bấm theo đây)
  function panelDay(x, y, wd, o) {
    const Th = T(), sv = G.save, say = o.say || (() => {});
    if (!Th || !sv || !Array.isArray(sv.weapons) || !sv.weapons.length) return y;
    U.nut = {};
    // dòng ví: 3 tài nguyên của Luyện bằng biểu tượng + câu nhắc
    const xr = Th.resRow([['gold', soN(num(sv.gold, 0)), '#ffd23f'], ['nlr', soN(L.nlr(sv)), '#c9ccd2'], ['lk', soN(lk(sv)), '#ffe9a8']], x + 2, y + 9, { size: 7.5, gap: 8 });
    chu('Luyện chắc chắn thành công', xr + 4, y + 1, x + wd - xr - 6, 11, { size: 6.3, color: SOFT, align: 'right' });
    const top = y + 13, lw = 98, th = 37, ws = sv.weapons;
    if (!ws.some((w) => w.id === U.sel)) {
      const dau = ws.find((w) => sv.carry && sv.carry[0] === w.id);
      U.sel = (ws.find((w) => L.duoc(sv, w, w.branch || 'fire') === '') || dau || ws[0]).id;
    }
    // cột trái: 4 ô vũ khí
    ws.slice(0, 4).forEach((w, i) => {
      const ty = top + i * (th + 1), chon = w.id === U.sel, lv = L.cap(w), td = L.tienDo(w), st = G.wStage(w), Eh = st > 0 && G.EL[w.branch] ? G.EL[w.branch] : null;
      const du = L.duoc(sv, w, w.branch || 'fire') === '' || L.choChonHe(w);
      Th.inset(x, ty, lw, th, chon);
      veO(w, x + 3, ty + 4, 29, 23);
      // tên (1–2 dòng) + "Lv N/15 · hệ" là một khối nằm giữa lòng ô (T.chuO, can-chu-khung); thanh tiến độ tới mốc ở thẻ phải
      Th.chuO(HT && HT.tenW ? G.tv(HT.tenW(w)) : tenLoai(w), x, ty, lw, th, { sel: chon, vung: [x + 35, ty, lw - 38, th], align: 'left', size: 7, min: 5.5, bold: true, dong: 2, gian: 1, color: mauKhung(lv),
        phu: { s: G.t('Lv {0}/{1}', lv, MAX) + (Eh ? ' · ' + G.tv(Eh.name) : ''), size: 6.3, bold: false, color: SOFT } });
      void td;
      if (du) muiLen(x + lw - 7, ty + 6); // dấu "luyện được" (hình, không phải chữ: không tính vào khối chữ giữa ô)
      if (bam(x, ty, lw, th)) { if (U.sel !== w.id) { U.sel = w.id; U.doi = null; if (G.sfx) G.sfx('ui'); } }
    });
    // thẻ phải
    const w = ws.find((q) => q.id === U.sel), cx = x + lw + 3, cw = wd - lw - 3, ch = 4 * (th + 1) - 1;
    Th.inset(cx, top, cw, ch, false);
    if (!w) return top + ch;
    const lv = L.cap(w), c = L.gia(lv + 1), st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null, Eh = el ? G.EL[el] : null;
    const lvl = sv.heroes && sv.heroes[sv.hero] ? sv.heroes[sv.hero].lvl : 1, d0 = G.wBase(w, lvl);
    const why = c ? L.duoc(sv, w, w.branch || 'fire') : 'max', khoa = c ? L.khoa(sv, w) : '', td = L.tienDo(w), mk = td.mk;
    Th.chuO(G.wName(w), cx, top, cw, ch, { align: 'left', vung: [cx + 4, top, cw - 8, 13], size: 8, min: 6.5, bold: true, color: mauKhung(lv) }); // dòng đầu trong lòng ô (không đè đinh góc)
    chu([G.tv(G.STAGE_NAMES[st]) + (Eh ? ' · ' + G.tv(Eh.name) : ''), G.t('Lv {0}/{1}', lv, MAX), G.t('Đòn {0}', so1(d0))].join(' · '), cx + 5, top + 13, cw - 10, 9, { size: 6.3, min: 5, color: SOFT });
    // hình hiện tại ▶ hình mốc kế
    const iy = top + 23, ih = 34, ix1 = cx + 8, ix2 = cx + cw - 8 - ih;
    veO(w, ix1, iy, ih, 29);
    chu(G.t('Lv {0}', lv), ix1 - 4, iy + ih + 1, ih + 8, 8, { size: 6.2, min: 5, color: SOFT, align: 'center' });
    if (mk) {
      const duNgay = mk === lv + 1 && why === '';
      veMocKe(w, mk, ix2, iy, ih, duNgay, !!khoa && mk >= lv + 1);
      const mx = ix1 + ih + 2, mw = ix2 - mx - 2;
      chu(G.tv('Mốc kế'), mx, iy, mw, 8, { size: 5.8, min: 5, color: SOFT, align: 'center' });
      chu(L.tenMoc(w, mk), mx, iy + 8, mw, 17, { size: 7, min: 5.5, bold: true, dong: 2, align: 'center', color: duNgay ? GOOD : mauKhung(mk) });
      ui.text('▶', mx + mw / 2, iy + ih - 1, { size: 10, bold: true, align: 'center', color: duNgay ? GOOD : '#c9b58a' });
      chu(G.t('Lv {0}', mk), ix2 - 4, iy + ih + 1, ih + 8, 8, { size: 6.2, min: 5, color: duNgay ? GOOD : SOFT, align: 'center' });
      // thanh tiến độ tới mốc
      const by = iy + ih + 10;
      ui.bar(cx + 6, by, cw - 12, 4, td.frac, duNgay ? '#ffd23f' : '#c9a24a');
      chu(G.t('Lv {0} → {1}', td.tu, mk), cx + 6, by + 5, (cw - 12) / 2, 8, { size: 6, min: 5, color: SOFT });
      chu(td.con === 1 ? G.tv('còn 1 cấp') : G.t('còn {0} cấp', td.con), cx + cw / 2, by + 5, cw / 2 - 6, 8, { size: 6, min: 5, color: SOFT, align: 'right' });
    } else {
      chu(G.tv('Cấp cao nhất'), ix1 + ih + 6, iy + 4, cw - ih - 22, 11, { size: 8, min: 6, bold: true, color: GOOD });
      chu('Viên mãn, đã luyện tối đa.', ix1 + ih + 6, iy + 16, cw - ih - 22, 18, { size: 6.5, min: 5.2, dong: 2, color: TXT });
      ui.bar(cx + 6, iy + ih + 10, cw - 12, 4, 1, GOOD);
    }
    // nâng xong đánh khác ra sao: đòn lần kế + hiệu ứng của mốc
    const yd = top + 82;
    if (c) {
      const giu = w.luyen; let d1 = d0;
      w.luyen = lv + 1; try { d1 = G.wBase(w, lvl); } finally { w.luyen = giu; }
      chu(G.t('Lên Lv {0}: đòn {1} → {2}', lv + 1, so1(d0), so1(d1)), cx + 6, yd, cw - 12, 8.5, { size: 6.5, min: 5.2, bold: true, color: TXT });
      const mo = mk ? L.moGi(w, mk) : '';
      if (mo) chu(mo, cx + 6, yd + 8.5, cw - 12, 10, { size: 6.2, min: 5, color: GOLD });
    } else {
      const dong = L.dongVM(w);
      chu(G.t('Tinh luyện: {0}', G.tv(({ sword: '+10% tốc đánh', spear: '+12% tầm đánh', hammer: '+30% thời gian choáng', bow: '+20% sát thương xuyên, xuyên thêm 1 quái' })[w.type] || '')), cx + 6, yd, cw - 12, 8.5, { size: 6.3, min: 5, color: GOOD });
      chu(G.t('Đã chọn dòng: {0}', L.chuDong(dong)), cx + 6, yd + 8.5, cw - 12, 10, { size: 6.3, min: 5, color: GOLD });
    }
    // dòng giá / khoá
    const yg = top + ch - 50, b1 = top + ch - 38, b2 = top + ch - 19, bx = cx + 5, bw = cw - 10, H1 = 18, H2 = 17; // nút cao 17–18: chữ có dấu không chạm viền (can-chu-khung)
    if (o.ro) return top + ch;
    const doiHe = U.doi === w.id && st >= 1 && VM;
    if (doiHe) {
      const cd = VM.giaDoiHe(st), hw = (bw - 4) / 2;
      chu(G.t('Đổi hệ: {0} linh khí', cd), bx, yg, bw, 10, { size: 6.5, color: lk(sv) < cd ? WARN : SOFT });
      ELS.filter((e) => e !== w.branch).forEach((e, i) => {
        ghiNut('doi-' + e, bx + i * (hw + 4), b1, hw, H1);
        if (Th.sbtn(bx + i * (hw + 4), b1, hw, H1, G.t('{0} · {1}', G.tv(G.EL[e].name), cd), { size: 7, pad: 1, primary: true, disabled: lk(sv) < cd })) {
          if (VM.doiHe(sv, w, e)) { U.doi = null; G.persist(); if (G.sfx) G.sfx('evolve'); say(G.t('{0} theo hệ {1}.', tenLoai(w), G.tv(G.EL[e].name))); }
        }
      });
      if (Th.sbtn(bx, b2, hw, H2, 'Thôi', { size: 7, pad: 1 })) U.doi = null;
      return top + ch;
    }
    const lam = (e) => {
      const kq = L.nang(sv, w, e);
      if (!kq) return;
      G.persist(); if (G.sfx) G.sfx('evolve');
      const mo = L.moGi(w, kq.L1);
      say(G.t('{0} Lv {1} → {2}: đòn +{3}', tenLoai(w), kq.L0, kq.L1, so1(kq.d1 - kq.d0)) + (mo ? ' · ' + mo : ''));
    };
    if (!c) { // cấp 15: chọn dòng Viên mãn
      chu('Dòng Viên mãn (đổi miễn phí)', bx, yg, bw, 10, { size: 6.5, bold: true, color: GOLD });
      const hw = (bw - 8) / 3;
      Object.keys(CF.vm).forEach((m, i) => {
        const on = L.dongVM(w) === m;
        ghiNut('vm-' + m, bx + i * (hw + 4), b1, hw, H1);
        if (Th.sbtn(bx + i * (hw + 4), b1, hw, H1, VM_NGAN[m] || L.chuDong(m), { size: 7, pad: 1, sel: on }) && !on) { L.datDong(w, m); G.persist(); say(G.t('Đã chọn dòng: {0}', L.chuDong(m))); }
      });
    } else if (L.choChonHe(w)) { // bản lưu cũ Trắng đổi lên ≥ 3: chọn hệ miễn phí
      chu('Chọn hệ cho vũ khí (miễn phí)', bx, yg, bw, 10, { size: 6.5, bold: true, color: GOLD });
      const hw = (bw - 8) / 3;
      ELS.forEach((e, i) => {
        ghiNut('he-' + e, bx + i * (hw + 4), b1, hw, H1);
        if (Th.sbtn(bx + i * (hw + 4), b1, hw, H1, G.tv(G.EL[e].name), { size: 7, pad: 1, primary: true })) {
          if (L.chonHe(sv, w, e)) { G.persist(); if (G.sfx) G.sfx('evolve'); say(G.t('{0} theo hệ {1}.', tenLoai(w), G.tv(G.EL[e].name))); }
        }
      });
    } else {
      if (khoa) chu(khoa, bx, yg - 1, bw, 11, { size: 6.5, min: 5, bold: true, color: WARN });
      else {
        const xe = veGia(c, sv, bx + 1, yg + 8, bx + bw);
        const th = why && why !== 'Chọn hệ' ? L.thieu(sv, w) : '', t = th ? G.t('thiếu {0}', th) : why && why !== 'Chọn hệ' ? G.tv(why) : '';
        if (t && xe < bx + bw - 30) chu(t, xe, yg, bx + bw - xe, 10, { size: 6.2, min: 5, color: WARN, align: 'right' });
      }
      const gia = G.t('{0} vàng', soN(c.v | 0));
      if (lv + 1 === CF.hinhThai[0] && !G.EL[w.branch]) { // lên Mầm: chọn hệ ngay trên nút
        const hw = (bw - 8) / 3;
        ELS.forEach((e, i) => {
          const r = L.duoc(sv, w, e);
          ghiNut('luyen-' + e, bx + i * (hw + 4), b1, hw, H1); // lên Mầm: nút là tên hệ (dòng trên đã ghi "Lên Lv 3" và giá)
          if (Th.sbtn(bx + i * (hw + 4), b1, hw, H1, G.tv(G.EL[e].name), { size: 7.5, pad: 1, primary: !r, disabled: !!r })) lam(e);
        });
      } else {
        ghiNut('luyen', bx, b1, bw, H1);
        if (Th.sbtn(bx, b1, bw, H1, G.t('Luyện lên {0} · {1}', lv + 1, gia), { size: 7, pad: 1, primary: !why, disabled: !!why })) lam(null);
      }
    }
    // hàng dưới: đổi hệ · cầm đầu
    const hw = (bw - 4) / 2, dau = sv.carry && sv.carry[0] === w.id;
    if (st >= 1 && VM) { ghiNut('doiHe', bx, b2, hw, H2); if (Th.sbtn(bx, b2, hw, H2, G.t('Đổi hệ · {0}', VM.giaDoiHe(st)), { size: 7, pad: 1 })) U.doi = w.id; }
    if (dau) chu('Đang cầm đầu', bx + hw + 4, b2 + 3, hw, 11, { size: 6.5, bold: true, color: GOOD, align: 'center' });
    else if (VM) { ghiNut('camDau', bx + hw + 4, b2, hw, H2); if (Th.sbtn(bx + hw + 4, b2, hw, H2, 'Cầm đầu', { size: 7, pad: 1 })) { VM.camDau(sv, w.type); G.persist(); if (G.sfx) G.sfx('pick'); say(G.t('Vào ải sẽ cầm {0} trước.', tenLoai(w))); } }
    return top + ch;
  }

  // ---------- 2. Hành trang › Vũ khí: bản rút gọn (mỗi vũ khí một hàng) ----------
  function panelGon(x, y, wd, o) {
    const Th = T(), sv = G.save, say = o.say || (() => {}), ro = !!o.ro;
    if (!Th || !sv || !Array.isArray(sv.weapons)) return y;
    U.nut = {};
    const xr = Th.resRow([['gold', soN(num(sv.gold, 0)), '#ffd23f'], ['nlr', soN(L.nlr(sv)), '#c9ccd2'], ['lk', soN(lk(sv)), '#ffe9a8']], x + 2, y + 9, { size: 7.5, gap: 8 });
    chu('Luyện chắc chắn thành công', xr + 4, y + 1, x + wd - xr - 6, 11, { size: 6.3, color: SOFT, align: 'right' });
    y += 13;
    const rh = 32, lvl = sv.heroes && sv.heroes[sv.hero] ? sv.heroes[sv.hero].lvl : 1;
    sv.weapons.slice(0, 4).forEach((w, i) => {
      const yy = y + i * (rh + 2), lv = L.cap(w), c = L.gia(lv + 1), td = L.tienDo(w), st = G.wStage(w), Eh = st > 0 && G.EL[w.branch] ? G.EL[w.branch] : null;
      const dau = sv.carry && sv.carry[0] === w.id;
      Th.inset(x, yy, wd, rh, false);
      veO(w, x + 3, yy + 3, 26, 21);
      const nx = x + 33, bwBtn = 96, colW = Math.floor((wd - 33 - bwBtn - 10) / 2);
      chu(G.wName(w) + (dau ? ' ★' : ''), nx, yy + 2, colW, 10, { size: 7.5, min: 6, bold: true, color: mauKhung(lv) });
      chu([G.t('Lv {0}/{1}', lv, MAX), G.tv(G.STAGE_NAMES[st]) + (Eh ? ' · ' + G.tv(Eh.name) : ''), G.t('Đòn {0}', so1(G.wBase(w, lvl)))].join(' · '), nx, yy + 12, colW, 9, { size: 6.2, min: 5, color: SOFT });
      ui.bar(nx, yy + 23, colW, 4, td.frac, td.mk ? '#c9a24a' : GOOD);
      // giữa: mốc kế
      const mx = nx + colW + 6;
      if (td.mk) {
        chu(G.t('Cấp {0} mở: {1}', td.mk, L.tenMoc(w, td.mk)), mx, yy + 2, colW, 10, { size: 6.5, min: 5, bold: true, color: mauKhung(td.mk) });
        chu(L.moGi(w, td.mk), mx, yy + 12, colW, 17, { size: 6, min: 5, dong: 2, color: TXT });
      } else chu('Viên mãn, đã luyện tối đa.', mx, yy + 2, colW, 26, { size: 6.5, min: 5, dong: 2, color: GOOD });
      // phải: giá + nút (trong ải chỉ xem)
      const bx = x + wd - bwBtn - 4;
      if (!c) { chu('Đã luyện tối đa', bx, yy + 2, bwBtn, rh - 4, { size: 7, bold: true, color: GOOD, align: 'center' }); return; }
      const khoa = L.khoa(sv, w), why = L.duoc(sv, w, w.branch || 'fire');
      if (khoa) { chu(khoa, bx, yy + 2, bwBtn, rh - 4, { size: 6, min: 5, dong: 3, color: WARN, align: 'center' }); return; }
      veGia(c, sv, bx, yy + 10, bx + bwBtn);
      if (ro) { chu(G.t('Lv {0} → {1}', lv, lv + 1), bx, yy + 17, bwBtn, 12, { size: 6.5, color: SOFT, align: 'center' }); return; }
      if (why === 'Chọn hệ' || L.choChonHe(w)) { chu('Đến Ông Thợ Rèn để chọn hệ', bx, yy + 15, bwBtn, 14, { size: 6.2, min: 5, color: GOLD, align: 'center' }); return; }
      ghiNut('gon-' + w.id, bx, yy + 14, bwBtn, 15);
      if (Th.sbtn(bx, yy + 14, bwBtn, 15, G.t('Luyện lên {0}', lv + 1), { size: 7, pad: 1, primary: !why, disabled: !!why })) {
        const kq = L.nang(sv, w, null);
        if (kq) { G.persist(); if (G.sfx) G.sfx('evolve'); say(G.t('{0} Lv {1} → {2}: đòn +{3}', tenLoai(w), kq.L0, kq.L1, so1(kq.d1 - kq.d0))); }
      }
    });
    return y + 4 * (rh + 2);
  }
  const panelCu = L.panel;
  L.panel = function (x, y, wd, o) {
    o = o || {};
    if (!L.bat()) return panelCu.apply(this, arguments);
    try { return o.h ? panelDay(x, y, wd, o) : panelGon(x, y, wd, o); } catch (e) { if (typeof console !== 'undefined') console.warn('luyen_ui: bảng Luyện lỗi, dùng bảng phiên 1', e); return panelCu.apply(this, arguments); }
  };

  // ---------- 3. ăn mừng 3 kiểu (lớp giao diện của làng) ----------
  const AN = { on: null };
  L.anMung = AN;
  L.TG = { dai: HT && HT.TG ? HT.TG.het : 1.45, ngan: 0.9, mot: 0.5 };
  const nangCu = L.nang;
  L.nang = function (sv, w, el, daTra) {
    const truoc = w ? { st: G.wStage(w), el: G.EL[w.branch] ? w.branch : null } : null;
    const kq = nangCu.apply(this, arguments);
    try {
      if (kq && sv === G.save && G.scene && G.scene === G.Village && !G.noRender && L.bat()) {
        const L1 = kq.L1, ht = CF.hinhThai.indexOf(L1) >= 0;
        if (ht && HT && HT.am && HT.vkGia && HT.bat && HT.bat()) {
          // dài (đổi dáng): dùng lại ăn mừng của phiên Vũ khí C
          HT.am.on = { t0: G.time || 0, w, type: w.type, cu: HT.vkGia(w, truoc.st, truoc.el), moi: HT.vkGia(w, G.wStage(w), w.branch), st: G.wStage(w), el: w.branch, ten: HT.ten(w.type, G.wStage(w)), luyen: L1 };
          AN.on = null;
        } else if (ht || L1 === CF.phuTu || L1 === MAX) AN.on = { kieu: 'ngan', t0: G.time || 0, w, L0: kq.L0, L1, het: L.TG.ngan };
        else AN.on = { kieu: 'mot', t0: G.time || 0, w, L0: kq.L0, L1, dd: kq.d1 - kq.d0, het: L.TG.mot };
      }
    } catch (e) { AN.on = null; }
    return kq;
  };
  const ease = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
  // ngắn 0,9 s (cấp 9 / 15): ô to bật ra trong khung màu mới, loé vòng màu khung, tên hiệu ứng
  L.veNgan = function (A, t) {
    const c = G.ux, Th = T(), FA = G.fxAnh, col = mauKhung(A.L1), cx = 240, cy = 96, s = 64;
    if (Th && Th.dim) Th.dim(0.66 * Math.min(1, t / 0.1));
    const u = Math.min(1, t / 0.25), co = 1.35 - 0.35 * ease(u);
    c.save();
    c.translate(cx, cy); c.scale(co, co); c.translate(-cx, -cy);
    c.globalAlpha *= Math.min(1, t / 0.12);
    veO(A.w, Math.round(cx - s / 2), Math.round(cy - s / 2), s, 52);
    c.restore();
    if (t >= 0.12 && t < 0.55) {
      const v = (t - 0.12) / 0.43;
      c.save(); c.globalAlpha *= (1 - v) * 0.25; c.fillStyle = col; c.fillRect(-(G.mx || 0) - 2, -(G.my || 0) - 2, 484 + (G.mx || 0) * 2, 274 + (G.my || 0) * 2); c.restore();
      if (FA) { FA.ve(c, 'hu-vong-song', cx, cy, v * (FA.giay('hu-vong-song') || 0.4), 0, 2.4, false, 1 - v * 0.5, col); FA.ve(c, 'hu-sao-chop', cx + 30, cy - 26, (t * 1.6) % 0.12, 0, 1.4, false, 0.9, col); FA.ve(c, 'hu-sao-chop', cx - 30, cy + 22, (t * 1.6 + 0.05) % 0.12, 0, 1.4, false, 0.9, col); }
    }
    if (t >= 0.25) {
      const v = Math.min(1, (t - 0.25) / 0.18), g = c.globalAlpha;
      c.globalAlpha = g * v;
      const ten = A.L1 === MAX ? G.tv('Viên mãn') : G.tv('Tinh luyện'), mo = L.moGi(A.w, A.L1).replace(/^[^:]*:\s*/, '');
      T().chuTrongKhung(ten, cx - 120, cy + 38 - 3 * (1 - v), 240, 18, { vien: [0, 0, 0, 0], dem: 0, size: 14, min: 10, bold: true, color: col });
      T().chuTrongKhung(G.t('Lên Lv {0}!', A.L1) + (mo ? ' · ' + mo : ''), cx - 150, cy + 56, 300, 11, { vien: [0, 0, 0, 0], dem: 0, size: 7.5, min: 6, bold: true, color: TXT });
      c.globalAlpha = g;
    }
    ui.text(G.tv('Chạm để bỏ qua'), 474, 264, { size: 6.5, align: 'right', color: 'rgba(241,230,198,0.55)', shadow: false });
  };
  // dải "+1" 0,5 s (cấp thường): không làm tối màn, không chặn chạm
  L.veMot = function (A, t) {
    const c = G.ux, Th = T(), u = t / A.het, a = u < 0.2 ? u / 0.2 : u > 0.75 ? (1 - u) / 0.25 : 1;
    const s = G.t('+1 · {0} Lv {1} · đòn +{2}', tenHT(A.w, G.wStage(A.w)), A.L1, so1(Math.max(0, A.dd || 0)));
    ui.font(8, true);
    const w = Math.min(300, Math.ceil(G.ux.measureText(s).width) + 26), x = Math.round(240 - w / 2), y = Math.round(60 - 6 * (1 - Math.min(1, u / 0.2)));
    const g = c.globalAlpha;
    c.globalAlpha = g * kep(a, 0, 1);
    if (Th.plate) Th.plate(x, y, w, 16); else ui.rect(x, y, w, 16, 'rgba(10,22,20,0.85)');
    Th.chuTrongKhung(s, x, y, w, 16, { khung: 'gd-khung-nho', vien: [2, 2, 2, 2], size: 8, min: 6, bold: true, color: mauKhung(A.L1) });
    c.globalAlpha = g;
  };
  // ---------- 6. bảng báo một lần khi chuyển bản lưu cũ ----------
  const BAO = { on: null };
  L.baoBang = BAO;
  const baoCu = L.bao;
  L.bao = function (sv) { // js/village_scene.js gọi khi làng rảnh: mở bảng thay câu nói (trả null → làng không nói)
    if (!L.bat() || G.noRender || !(G.scene && G.scene === G.Village)) return baoCu.apply(this, arguments);
    const b = sv && sv.luyenBao;
    const s = baoCu.apply(this, arguments);
    if (!s || !b || typeof b !== 'object') return s;
    BAO.on = { b, s, t0: G.time || 0 };
    return null;
  };
  L.veBao = function (ck) {
    const A = BAO.on, Th = T(), sv = G.save, b = A.b;
    const W = 300, x = 90, y = 34;
    const vk = Array.isArray(b.vk) ? b.vk.filter((q) => G.WTYPES[q[0]]) : [];
    const ds = [];
    if (b.vang > 0) ds.push(['gold', Math.round(b.vang)]);
    if (b.lk > 0) ds.push(['lk', Math.floor(b.lk)]);
    if (b.nlr > 0) ds.push(['nlr', Math.round(b.nlr)]);
    for (let i = 0; i < 3; i++) if (b.nl && b.nl[i] > 0) ds.push(['mat' + i, b.nl[i]]);
    const H = 70 + (vk.length ? 40 : 0) + 34 + (b.vi > 0 ? 12 : 0);
    Th.dim(0.6);
    Th.panel(x, y, W, H, G.tv('Lò rèn đã gộp thành Luyện vũ khí'));
    let yy = y + 24;
    chu('Luyện chắc chắn thành công, không tụt cấp. Mở bảng ở Ông Thợ Rèn.', x + 10, yy, W - 20, 18, { size: 7, min: 5.5, dong: 2, color: TXT });
    yy += 21;
    if (vk.length) {
      chu('Vũ khí của Cu Tí', x + 10, yy, W - 20, 9, { size: 6.5, bold: true, color: GOLD });
      yy += 10;
      const cw = Math.floor((W - 20) / Math.max(1, vk.length));
      vk.forEach((q, i) => {
        const w = sv && Array.isArray(sv.weapons) ? sv.weapons.find((v) => v.type === q[0]) : null, xx = x + 10 + i * cw;
        if (w) veO(w, xx, yy, 26, 21);
        chu(G.tv(G.WTYPES[q[0]].name), xx + 28, yy + 2, cw - 30, 10, { size: 6.8, min: 5, bold: true, color: mauKhung(q[1]) });
        chu(G.t('Lv {0}', q[1]), xx + 28, yy + 13, cw - 30, 10, { size: 7, min: 5, bold: true, color: TXT });
      });
      yy += 30;
    }
    chu('Được hoàn lại', x + 10, yy, W - 20, 9, { size: 6.5, bold: true, color: GOLD });
    yy += 10;
    if (ds.length) {
      let xx = x + 12;
      for (const q of ds) {
        const s = soN(q[1]);
        if (q[0] === 'lk' && VM && VM.gem) VM.gem(xx + 4.5, yy + 5, 0.9); else Th.resIcon(q[0], xx, yy + 1, 9);
        ui.text(s, xx + 11, yy + 8.5, { size: 7.5, bold: true, color: TXT, tiny: true });
        ui.font(7.5, true); xx += 11 + G.ux.measureText(s).width + 9;
      }
    } else chu('Không có gì để hoàn.', x + 10, yy, W - 20, 10, { size: 6.8, color: SOFT });
    yy += 13;
    if (b.vi > 0) {
      const s0 = G.tv('Quặng, đá, bùa cũ đổi ra');
      ui.font(6.5, false);
      const xi = Math.min(x + W - 50, x + 14 + Math.ceil(G.ux.measureText(s0).width));
      chu(s0, x + 10, yy, xi - x - 12, 10, { size: 6.5, color: SOFT });
      Th.resIcon('nlr', xi, yy + 1, 8); ui.text(soN(b.vi), xi + 10, yy + 8, { size: 7, bold: true, color: TXT, tiny: true });
      yy += 12;
    }
    ghiNut('baoOk', x + W / 2 - 45, y + H - 24, 90, 18);
    const ok = ck && G.inRect(ck, x + W / 2 - 45 - 3, y + H - 24 - 3, 96, 24);
    G.click = ck && ok ? ck : null;
    const bam1 = Th.sbtn(x + W / 2 - 45, y + H - 24, 90, 18, 'Đã hiểu', { size: 8, pad: 1, primary: true });
    G.click = null;
    return bam1 || ok;
  };
  // gắn vào vòng vẽ của làng (sau js/hinh_thai.js): bảng báo / ăn mừng ngắn chặn chạm, dải +1 không chặn
  const VG = G.Village;
  if (VG && VG.draw && !VG.draw.luyenUi) {
    const veCu = VG.draw;
    VG.draw = function () {
      if (!L.bat() || (!AN.on && !BAO.on)) return veCu.apply(this, arguments);
      if (BAO.on) {
        const ck = G.click; G.click = null; G.syncTaps = [];
        veCu.apply(this, arguments);
        G.click = null;
        let xong = false;
        try { xong = L.veBao(ck) && (G.time || 0) - BAO.on.t0 > 0.3; } catch (e) { xong = true; }
        if (xong) { BAO.on = null; if (G.sfx) G.sfx('ui'); }
        return undefined;
      }
      const A = AN.on, t = (G.time || 0) - A.t0;
      if (t >= A.het || t < 0) { AN.on = null; return veCu.apply(this, arguments); }
      if (A.kieu === 'mot') { const r = veCu.apply(this, arguments); try { L.veMot(A, t); } catch (e) { AN.on = null; } return r; }
      const ck = G.click; G.click = null; G.syncTaps = [];
      veCu.apply(this, arguments);
      G.click = null;
      if (ck && t > 0.12) { AN.on = null; return undefined; }
      try { L.veNgan(A, t); } catch (e) { AN.on = null; }
      return undefined;
    };
    VG.draw.luyenUi = true;
  }

  // ---------- 4. màn kết quả: tiến độ món đang cầm tới mốc kế ----------
  if (VM && VM.ketQua && !VM.ketQua.luyenUi) {
    const kqCu = VM.ketQua;
    VM.ketQua = function (S, x, y, wd) {
      if (!L.bat()) return kqCu.apply(this, arguments);
      const Th = T(), sv = G.save, P = S && S.P;
      const w0 = P && G.curW ? G.curW(P) : null;
      const w = w0 && sv && Array.isArray(sv.weapons) ? sv.weapons.find((q) => q.id === w0.id) || null : null;
      if (!w || !Th) return kqCu.apply(this, arguments);
      if (Th.head) Th.head('Linh khí', x, y + 7, { size: 7.5 }); else ui.text('Linh khí', x, y + 7, { size: 7.5, bold: true });
      y += 11;
      const Lg = (S && S.lkGain) || {};
      let got = 0;
      for (const id in Lg) for (const e of ELS) got += num(Lg[id][e], 0);
      ui.rect(x, y, wd, 19, 'rgba(10,22,20,0.55)', 'rgba(255,220,160,0.14)');
      if (VM.gem) VM.gem(x + 8, y + 9.5, 1);
      chu(G.t('+{0} linh khí trận này · đang có {1}', Math.round(got), Math.floor(lk(sv))), x + 17, y + 1.5, wd - 22, 8.5, { size: 7, min: 5.5, bold: true, color: '#ffe9a8' });
      L.dongKetQua(sv, w, x + 17, y + 10, wd - 22);
      return y + 21;
    };
    VM.ketQua.luyenUi = true;
  }
  // "Kiếm lá đồng Lv 4 → Kiếm răng sói (Lv 6): còn 2 cấp · thiếu 120 vàng" + thanh mảnh
  L.chuKetQua = function (sv, w) {
    const lv = L.cap(w), td = L.tienDo(w), ten = tenHT(w, G.wStage(w));
    if (!td.mk) return { s: G.t('{0} Lv {1}: đã luyện tối đa.', ten, lv), col: GOOD, frac: 1 };
    let s = G.t('{0} Lv {1} → {2} (Lv {3}): còn {4} cấp', ten, lv, L.tenMoc(w, td.mk), td.mk, td.con), col = '#e8dfcc';
    const why = L.duoc(sv, w, w.branch || 'fire'), khoa = L.khoa(sv, w), th = L.thieu(sv, w);
    if (khoa) { s += ' · ' + G.t('cần hạ {0}', tenTrum((L.gia(lv + 1).m || [L.soTrum(sv)])[0])); col = WARN; }
    else if (why === 'Chọn hệ') { s += ' · ' + G.tv('cần chọn hệ ở Ông Thợ Rèn'); col = GOOD; }
    else if (th) s += ' · ' + G.t('thiếu {0}', th);
    else { s += ' · ' + G.t('đủ đồ luyện lên {0}!', lv + 1); col = GOOD; }
    return { s, col, frac: td.frac };
  };
  L.dongKetQua = function (sv, w, x, y, wd) {
    const k = L.chuKetQua(sv, w);
    chu(k.s, x, y, wd, 7.5, { size: 6.5, min: 5, color: k.col });
    ui.rect(x, y + 7, wd, 1, 'rgba(0,0,0,0.5)'); ui.rect(x, y + 7, Math.round(wd * k.frac), 1, k.col === GOOD ? '#ffd23f' : '#c9a24a');
  };

  // ---------- 5. biểu tượng, tên tài nguyên; thanh tài nguyên ở làng 3 ô ----------
  // 'nlr' mượn ảnh quặng (vp-ore / ô 7×7 'ore'); 'lk' vẽ viên ngọc linh khí (VM.gem). Có ảnh vp-nlr riêng thì js/sprite_custom.js tự dùng.
  function moc() {
    const Th = T();
    if (!Th || Th.luyenUi) return !!Th;
    Th.luyenUi = true;
    const icon = Th.resIcon;
    Th.resIcon = function (kind, x, y, h) {
      if (kind === 'nlr') return T().resIcon('ore', x, y, h); // qua lớp ngoài cùng (ảnh vp-ore nếu có)
      if (kind === 'lk') { h = h || 7; if (VM && VM.gem) VM.gem(x + h / 2, y + h / 2, h / 10); return undefined; }
      return icon.apply(this, arguments);
    };
    const ten = Th.resName;
    Th.resName = function (kind) { if (kind === 'nlr') return 'Nguyên liệu rèn'; if (kind === 'lk') return 'Linh khí'; return ten.apply(this, arguments); };
    return true;
  }
  if (!moc() && typeof setTimeout !== 'undefined') { let n = 0; const thu = () => { if (!moc() && n++ < 50) setTimeout(thu, 50); }; setTimeout(thu, 0); }
  const VS = G.villageScene;
  if (VS && VS.resParts && !VS.resParts.luyenUi) {
    const rp = VS.resParts;
    VS.resParts = function () {
      if (!L.bat() || !G.save) return rp.apply(this, arguments);
      const sv = G.save;
      return [['gold', sv.gold, '#ffd23f'], ['nlr', L.nlr(sv), '#c9ccd2'], ['lk', Math.floor(lk(sv)), '#ffe9a8']];
    };
    VS.resParts.luyenUi = true;
  }
})();
