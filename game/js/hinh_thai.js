// HÌNH THÁI VŨ KHÍ (16/10, docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/bao-cao-C.md — góp ý ChatGPT 2: GOP-Y-CHATGPT-2-NANG-CAP.md)
// Mục tiêu: nhìn vũ khí là biết "đang ở cấp nào, sắp thành gì, nâng xong đánh khác ra sao". CHỈ lớp giao diện, không đổi luật / số.
//   1. Tên hình thái 4 vũ khí × 4 cấp (G.HINH_THAI.ten). G.wName trả tên hình thái (+ danh hiệu, +mài) → hiện ở ô đồ, lò rèn, Hành trang,
//      màn Xem vũ khí, thẻ kết quả... Tiếng Anh: js/ngon_ngu_en.js (khoá là tên Việt).
//   2. Ông Thợ Rèn › Linh khí (js/village.js gọi VM.vkPanel với o.lo): bảng mới — 4 ô vũ khí bên trái, thẻ bên phải: hình hiện tại → bóng
//      mờ có khoá của hình thái kế, "Còn thiếu N linh khí để mở <tên>", 1 câu đòn / hiệu ứng mở thêm (lấy đúng G.HE_FEATURES, G.PROC),
//      một thanh tiến độ linh khí, các nút nâng / chọn hệ / đổi hệ / cầm đầu như bảng cũ (cùng VM.nang, VM.doiHe, VM.camDau).
//   3. Ăn mừng khi nâng cấp thành công ở làng (~1,4 giây, bấm để bỏ qua): hình cũ co lại tan (hu-hat-no), hình mới ráp vào (hu-sao-chop),
//      loé màu hệ (vòng gd-vong-<hệ>), hiện tên hình thái. Vẽ trên lớp giao diện (G.ux), không đụng lớp trận.
//   4. Màn kết quả (VM.ketQua): dòng 2 thành tiến độ của món đang cầm tới hình thái kế (+ thanh mảnh).
// Cờ tắt toàn bộ: ?hinhthai=0 (G.HINH_THAI_BAT = false) → tên, bảng lò rèn, ăn mừng, dòng kết quả y như trước.
(function () {
  'use strict';
  const G = window.G, ui = G.ui, VM = G.vkMoi;
  if (!VM || !ui) return;
  let tat = false;
  try { tat = /[?&]hinhthai=0\b/i.test(String(location.search || '')); } catch (e) { tat = false; }
  if (G.HINH_THAI_BAT == null) G.HINH_THAI_BAT = !tat;
  const bat = () => G.HINH_THAI_BAT !== false;
  const HT = (G.hinhThai = { bat });
  const TXT = '#f1e6c6', SOFT = '#a9c2b4', GOLD = '#f6dc92', GOOD = '#9be07a', WARN = '#ff9a5a';
  const ELS = ['fire', 'poison', 'ice'];
  const kep = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ---------- 1. tên hình thái (chủ game duyệt ở bao-cao-C.md; sửa chữ ở đây, bản Anh ở js/ngon_ngu_en.js) ----------
  G.HINH_THAI = {
    ten: {
      sword: ['Kiếm tập sự', 'Kiếm lá đồng', 'Kiếm răng sói', 'Kiếm trăng khuyết'],
      spear: ['Thương tập sự', 'Thương tua đỏ', 'Thương lưỡi móc', 'Thương cánh én'],
      hammer: ['Búa tập sự', 'Búa đai đồng', 'Búa sừng trâu', 'Búa sấm sét'],
      bow: ['Phi tiêu tập sự', 'Phi tiêu vòng đồng', 'Phi tiêu chong chóng', 'Phi tiêu mặt trời'],
    },
  };
  HT.ten = function (type, st) { const a = G.HINH_THAI.ten[type]; return a ? a[kep(st | 0, 0, 3)] : (G.WTYPES[type] || {}).name || '?'; };
  HT.tenW = (w) => HT.ten(w.type, G.wStage(w));
  const tenV = (type, st) => G.tv(HT.ten(type, st)); // đã dịch (để ghép vào G.t)

  // G.wName: hình thái thay "loại + chữ theo hệ" (Kiếm Than Hồng…); danh hiệu và +mài giữ nguyên cách ghép cũ.
  const wNameCu = G.wName;
  if (wNameCu && !wNameCu.hinhThai) {
    const KE_HA = ', kẻ hạ ';
    const titleOf = (t) => (!t ? '' : t.indexOf(KE_HA) === 0 ? G.t(', kẻ hạ {0}', t.slice(KE_HA.length)) : G.tv(t));
    G.wName = function (w) {
      if (!bat() || !w || !G.HINH_THAI.ten[w.type]) return wNameCu.apply(this, arguments);
      const base = HT.tenW(w);
      if (G.LANG !== 'vi') return G.tv(base) + titleOf(w.title) + (w.sharpen ? ' +' + w.sharpen : '');
      return base + (w.title || '') + (w.sharpen ? ' +' + w.sharpen : '');
    };
    G.wName.hinhThai = true;
  }

  // ---------- đòn / hiệu ứng mở ở cấp kế (chỉ đọc luật có sẵn: G.PROC, G.HE_FEATURES) ----------
  const tenHieuUng = (el) => (el === 'fire' ? 'cháy' : el === 'poison' ? 'độc' : el === 'ice' ? 'chậm' : 'cháy, độc hoặc chậm');
  HT.moThem = function (w) {
    const st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null;
    if (st >= 3) return G.t('Đã mở đủ: {0}.', G.HE_FEATURES[el].map((f) => G.tv(f.name)).join(', '));
    if (st === 0) return G.t('Chọn hệ Lửa, Độc hoặc Băng: {0}% mỗi đòn gây cháy, độc hoặc chậm, vệt chém nhuốm màu hệ.', Math.round(G.PROC[1] * 100));
    const f = G.HE_FEATURES[el][st - 1];
    return G.t('Mở {0}: {1}.', G.tv(f.name), G.tv(f.desc)) + ' ' + G.t('Tỉ lệ gây ' + tenHieuUng(el) + ' {0}% → {1}%.', Math.round(G.PROC[st] * 100), Math.round(G.PROC[st + 1] * 100));
  };
  // VM.moTiep (dòng "cấp kế mở gì" ở Hành trang, màn Xem vũ khí): thêm tên hình thái kế
  const moTiepCu = VM.moTiep;
  VM.moTiep = function (w) {
    if (!bat() || !w || !G.HINH_THAI.ten[w.type]) return moTiepCu.apply(this, arguments);
    const st = G.wStage(w);
    if (st >= 3) return moTiepCu.apply(this, arguments);
    if (st === 0) return G.t('Lên {0}: chọn hệ Lửa, Độc hoặc Băng', tenV(w.type, 1));
    return G.t('Lên {0}: mở {1}', tenV(w.type, st + 1), G.tv(G.HE_FEATURES[w.branch][st - 1].name));
  };

  // ---------- ảnh vũ khí (bộ zed-vk qua VM.anhO, đúng loại / cấp / hệ như ô đồ) ----------
  function vkGia(w, st, el) { // vũ khí "giả" ở cấp st (để lấy ảnh hình thái kế)
    const v = { type: w.type, branch: null, marks: { fire: 0, poison: 0, ice: 0 } };
    if (st > 0 && G.EL[el]) { v.branch = el; v.marks[el] = G.MARKS[st - 1]; }
    return v;
  }
  const BONG = new Map();
  function bong(a) { // bóng sẫm của ảnh (hình thái chưa mở)
    if (typeof document === 'undefined') return null;
    const k = a.img; let m = BONG.get(k); if (!m) { m = new Map(); BONG.set(k, m); }
    const kk = a.x + ',' + a.y + ',' + a.w + ',' + a.h;
    let cv = m.get(kk);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = a.w; cv.height = a.h;
      const q = cv.getContext('2d'); q.imageSmoothingEnabled = false;
      q.drawImage(a.img, a.x, a.y, a.w, a.h, 0, 0, a.w, a.h);
      q.globalCompositeOperation = 'source-atop'; q.fillStyle = '#0c1a1c'; q.fillRect(0, 0, a.w, a.h);
      q.globalCompositeOperation = 'source-over'; q.globalAlpha = 0.22; q.drawImage(a.img, a.x, a.y, a.w, a.h, 0, 0, a.w, a.h);
      m.set(kk, cv);
    }
    return cv;
  }
  // Vẽ ảnh a (của loại type) giữa (x, y), cỡ như VM.icon (kiếm / thương / búa nằm chéo). o: { mo, co (nhân cỡ), xoay, bong }
  function veAnh(c, a, type, x, y, size, o) {
    if (!a) return false;
    o = o || {};
    const cheo = type !== 'bow', k = (cheo ? (size * 1.35) / (a.w + a.h) : size / Math.max(a.w, a.h)) * (o.co == null ? 1 : o.co);
    if (!(k > 0)) return true;
    const img = o.bong ? bong(a) : a.img, sx = o.bong ? 0 : a.x, sy = o.bong ? 0 : a.y;
    if (!img) return false;
    c.save();
    c.globalAlpha *= o.mo == null ? 1 : kep(o.mo, 0, 1);
    c.imageSmoothingEnabled = k < 1;
    c.translate(Math.round(x), Math.round(y));
    c.rotate((cheo ? -Math.PI / 4 : 0) + (o.xoay || 0));
    c.drawImage(img, sx, sy, a.w, a.h, (-a.w * k) / 2, (-a.h * k) / 2, a.w * k, a.h * k);
    c.restore();
    return true;
  }
  function khoa(x, y, s) { // ổ khoá: ảnh gd-phong-lock (giao diện); chưa có ảnh thì vẽ code (lớp giao diện)
    s = s || 1;
    const SC = G.spriteCustom, g = SC && SC.gdSan ? SC.gdSan('gd-phong-lock') : null;
    if (g && SC.veGd(G.ux, g, Math.round(x - 5 * s), Math.round(y - 5 * s), Math.round(10 * s), Math.round(10 * s))) return;
    const c = G.ux;
    c.strokeStyle = '#d8c9a0'; c.lineWidth = 1.4 * s; c.beginPath(); c.arc(x, y - 2 * s, 3 * s, Math.PI, 0); c.stroke();
    c.fillStyle = '#d8c9a0'; c.fillRect(x - 4.5 * s, y - 2 * s, 9 * s, 7 * s);
    c.fillStyle = '#3a2a1a'; c.fillRect(x - 0.7 * s, y, 1.4 * s, 3 * s);
  }
  HT.veAnh = veAnh; HT.vkGia = vkGia;

  const so1 = (v) => (G.LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ','));
  const chu = (s, x, y, w, h, o) => G.theme.chuTrongKhung(s, x, y, w, h, Object.assign({ vien: [0, 0, 0, 0], dem: 0, size: 7, min: 5.5, bold: false, color: TXT, dong: 1, gian: 1.2, align: 'left' }, o || {}));
  const bam = (x, y, w, h) => { if (G.click && G.inRect(G.click, x, y, w, h)) { G.click = null; return true; } return false; };

  // ---------- 2. bảng Linh khí ở Ông Thợ Rèn ----------
  const LO = { sel: null, doi: null };
  HT.lo = LO;
  function bangLo(x, y, wd, o) {
    const T = G.theme, sv = G.save, say = o.say || (() => {});
    if (!T || !sv || !Array.isArray(sv.weapons) || !sv.weapons.length) return y;
    const n = VM.lk(sv);
    VM.gem(x + 4, y + 6, 0.9);
    ui.text(G.t('Linh khí: {0}', Math.floor(n)), x + 11, y + 9, { size: 8.5, bold: true, color: GOLD });
    const L = G.LINHKHI || {};
    chu(G.t('Có từ tinh anh +{0}, trùm nhỏ +{1}, trùm vùng +{2}, rương báu, qua ải.', L.elite, L.mini, L.boss), x + 82, y + 1, wd - 84, 11, { size: 6.3, color: SOFT, align: 'right' });
    const top = y + 13, lw = 98, th = 37;
    const ws = sv.weapons;
    if (!ws.some((w) => w.id === LO.sel)) {
      const dau = ws.find((w) => sv.vkThu && sv.vkThu[0] === w.type);
      LO.sel = (ws.find((w) => { const c = VM.gia(G.wStage(w)); return c != null && n >= c; }) || dau || ws[0]).id;
    }
    // cột trái: 4 ô vũ khí
    ws.slice(0, 4).forEach((w, i) => {
      const ty = top + i * (th + 1), st = G.wStage(w), c = VM.gia(st), chon = w.id === LO.sel, el = st > 0 ? w.branch : null, E = el ? G.EL[el] : null;
      T.inset(x, ty, lw, th, chon);
      G.oBacVk(x + 3, ty + 4, 29, w);
      G.art.weaponIcon(G.ux, w, x + 17.5, ty + 18.5, 23);
      // can-chu-khung (16/10): tên một dòng thì cả khối (tên, hình thái, thanh) dịch lên 4 cho nằm giữa ô (trước: thấp ~3 điểm)
      const motDong = G.theme.canMoi && G.theme.canMoi() && G.theme.datChu(HT.tenW(w), x + 35, ty + 3, lw - 38, 19, { vien: [0, 0, 0, 0], dem: 0, size: 7, min: 5.5, bold: true, dong: 2, gian: 1.2, align: 'left' }).lines.length === 1;
      const dl = motDong ? 4 : 0;
      chu(HT.tenW(w), x + 35, ty + 3 + (motDong ? 1 : 0), lw - 38, motDong ? 13 : 19, { size: 7, min: 5.5, bold: true, dong: 2, color: E ? E.col : TXT });
      chu(G.tv(G.STAGE_NAMES[st]) + (E ? ' · ' + G.tv(E.name) : ''), x + 35, ty + 21 - dl, lw - 38, 8, { size: 6, min: 5, color: SOFT });
      ui.bar(x + 35, ty + 30 - dl, lw - 40, 3, c == null ? 1 : kep(n / c, 0, 1), c == null ? GOOD : n >= c ? '#ffd23f' : '#c9a24a');
      if (c != null && n >= c) ui.text('▲', x + lw - 4, ty + 10, { size: 7.5, bold: true, align: 'right', color: GOOD });
      if (bam(x, ty, lw, th)) { if (LO.sel !== w.id) { LO.sel = w.id; LO.doi = null; G.sfx && G.sfx('ui'); } }
    });
    // thẻ phải: món đang chọn
    const w = ws.find((q) => q.id === LO.sel);
    const cx = x + lw + 3, cw = wd - lw - 3, ch = 4 * (th + 1) - 1;
    T.inset(cx, top, cw, ch, false);
    if (!w) return top + ch;
    const st = G.wStage(w), el = st > 0 && G.EL[w.branch] ? w.branch : null, E = el ? G.EL[el] : null, c = VM.gia(st), dau = sv.vkThu && sv.vkThu[0] === w.type;
    const lvl = sv.heroes && sv.heroes[sv.hero] ? sv.heroes[sv.hero].lvl : 1;
    const bac = G.epDo && G.epDo.bat() ? G.epDo.bac(w) : 0;
    // can-chu-khung (16/10): hai dòng đầu của thẻ phải đặt trong LÒNG ảnh ô (trước: tên đè đinh góc trên trái)
    const moi = G.theme.canMoi && G.theme.canMoi();
    const chuThe = (s, x2, y2, w2, h2, o2) => (moi ? G.theme.chuO(s, cx, top, cw, ch, Object.assign({ vung: [x2, y2, w2, h2], vien: [0, 0, 0, 0], dem: 0, size: 7, min: 5.5, bold: false, color: TXT, dong: 1, gian: 1.2, align: 'left' }, o2 || {})) : chu(s, x2, y2, w2, h2, o2));
    chuThe(G.wName(w), cx + 5, top + 3, cw - 10, 11, { size: 8, min: 6.5, bold: true, color: bac ? G.epDo.mauBac(bac) : E ? E.col : TXT });
    chuThe(G.t('{0} · mài +{1} · đòn {2}', el ? G.t('{0} · hệ {1}', G.STAGE_NAMES[st], E.name) : G.STAGE_NAMES[0], w.sharpen | 0, so1(G.wBase(w, lvl))) + (bac ? ' · ' + G.t('Bậc {0}', G.epDo.tenBac(bac)) : ''), cx + 5, top + 14, cw - 10, 9, { size: 6.3, min: 5.2, color: SOFT });
    // hình hiện tại → hình thái kế (bóng mờ + khoá khi chưa đủ linh khí)
    const iy = top + 25, ih = 38, ix1 = cx + 8, ix2 = cx + cw - 8 - ih;
    G.oBacVk(ix1, iy, ih, w);
    G.art.weaponIcon(G.ux, w, ix1 + ih / 2, iy + ih / 2, 33);
    chu(G.STAGE_NAMES[st], ix1 - 4, iy + ih + 1, ih + 8, 9, { size: 6.2, min: 5, color: SOFT, align: 'center' });
    if (c != null) {
      const du = n >= c, sau = vkGia(w, st + 1, el), a = VM.anhO(sau);
      T.slot(ix2, iy, ih, 0);
      const nhay = du ? 0.75 + 0.25 * Math.sin((G.time || 0) * 5) : 1;
      if (a) veAnh(G.ux, a, w.type, ix2 + ih / 2, iy + ih / 2, 33, du ? { mo: 0.55 * nhay + 0.25 } : { bong: true, mo: 0.9 });
      if (!du) khoa(ix2 + ih - 7, iy + ih - 7, 1);
      // mũi tên giữa hai ô
      const ax = (ix1 + ih + ix2) / 2;
      ui.text('▶', ax, iy + ih / 2 + 4, { size: 11, bold: true, align: 'center', color: du ? GOOD : '#c9b58a' });
      // can-chu-khung: tên hình thái kế nằm trên mũi tên, không chồng
      chu(tenV(w.type, st + 1), ix1 + ih + 2, iy + (moi ? 1 : 3), ix2 - ix1 - ih - 4, moi ? 13 : 18, { size: 6.5, min: 5.2, bold: true, dong: 2, align: 'center', color: du ? GOOD : GOLD });
      chu(G.STAGE_NAMES[st + 1], ix2 - 4, iy + ih + 1, ih + 8, 9, { size: 6.2, min: 5, color: du ? GOOD : SOFT, align: 'center' });
      // thanh tiến độ linh khí tới cấp kế
      const by = iy + ih + 11;
      ui.bar(cx + 6, by, cw - 12, 5, kep(n / c, 0, 1), du ? '#ffd23f' : '#c9a24a');
      chu(G.t('{0}/{1}', Math.floor(Math.min(n, c)), c), cx + 6, by + 6, cw - 12, 8, { size: 6, min: 5, color: SOFT, align: 'right' });
      chu(du ? G.t('Đủ linh khí để mở {0}!', tenV(w.type, st + 1)) : G.t('Còn thiếu {0} linh khí để mở {1}', Math.ceil(c - n), tenV(w.type, st + 1)), cx + 6, by + 6, cw - 44, 9, { size: 6.6, min: 5.2, bold: true, color: du ? GOOD : WARN });
    } else {
      chu(G.t('{0} là hình thái cuối.', HT.tenW(w)), ix1 + ih + 6, iy + 8, cw - ih - 22, 22, { size: 7.5, min: 6, bold: true, dong: 2, color: GOOD });
      chu('Đã Thức tỉnh, mở đủ hai đặc trưng hệ.', ix1 + ih + 6, iy + 30, cw - ih - 22, 18, { size: 6.5, min: 5.2, dong: 2, color: TXT });
    }
    // một câu: nâng xong đánh khác ra sao (đúng luật có sẵn)
    chu(HT.moThem(w), cx + 6, iy + ih + 27, cw - 12, top + ch - 37 - (iy + ih + 27), { size: 6.3, min: 5, dong: 3, gian: 0.8, color: TXT });
    // nút (như bảng cũ)
    const b1 = top + ch - 35, b2 = top + ch - 18, bx = cx + 5, bw = cw - 10;
    if (o.ro) return top + ch;
    if (LO.doi === w.id && st >= 1) {
      const cd = VM.giaDoiHe(st), hw = (bw - 4) / 2;
      ELS.filter((e) => e !== w.branch).forEach((e, i) => {
        if (T.sbtn(bx + i * (hw + 4), b1, hw, 15, G.t('{0} · {1}', G.EL[e].name, cd), { size: 7, pad: 1, primary: true, disabled: n < cd })) {
          if (VM.doiHe(sv, w, e)) { LO.doi = null; G.persist(); G.sfx('evolve'); say(G.t('{0} đổi sang hệ {1}.', G.WTYPES[w.type].name, G.EL[e].name)); }
        }
      });
      if (T.sbtn(bx, b2, hw, 15, 'Thôi', { size: 7, pad: 1 })) LO.doi = null;
      chu(G.t('Đổi hệ: {0} linh khí', cd), bx + hw + 4, b2 + 3, hw, 10, { size: 6.5, color: n < cd ? WARN : SOFT, align: 'right' });
      return top + ch;
    }
    if (st === 0) {
      const hw = (bw - 8) / 3;
      ELS.forEach((e, i) => {
        if (T.sbtn(bx + i * (hw + 4), b1, hw, 15, G.EL[e].name, { size: 7, pad: 1, primary: n >= c, disabled: n < c })) {
          if (VM.nang(sv, w, e)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên Mầm, theo hệ {1}!', G.WTYPES[w.type].name, G.EL[e].name)); }
        }
      });
    } else if (c != null) {
      if (T.sbtn(bx, b1, bw, 15, G.t('Nâng thành {0} · {1}', tenV(w.type, st + 1), c), { size: 7, pad: 1, primary: n >= c, disabled: n < c })) {
        if (VM.nang(sv, w)) { G.persist(); G.sfx('evolve'); say(G.t('{0} lên {1}!', G.WTYPES[w.type].name, G.STAGE_NAMES[st + 1])); }
      }
    } else chu('Đã Thức tỉnh', bx, b1 + 2, bw, 11, { size: 7.5, bold: true, color: GOOD, align: 'center' });
    const hw = (bw - 4) / 2;
    if (st >= 1 && T.sbtn(bx, b2, hw, 15, G.t('Đổi hệ · {0}', VM.giaDoiHe(st)), { size: 7, pad: 1 })) LO.doi = w.id;
    if (dau) chu('cầm đầu', bx + hw + 4, b2 + 3, hw, 10, { size: 6.5, bold: true, color: GOOD, align: 'center' });
    else if (T.sbtn(bx + hw + 4, b2, hw, 15, 'Cầm đầu', { size: 7, pad: 1 })) { VM.camDau(sv, w.type); G.persist(); G.sfx('pick'); say(G.t('Vào ải sẽ cầm {0} trước.', G.WTYPES[w.type].name)); }
    return top + ch;
  }
  HT.bangLo = bangLo;
  const vkPanelCu = VM.vkPanel;
  VM.vkPanel = function (x, y, wd, o) {
    if (bat() && o && o.lo) { try { return bangLo(x, y, wd, o); } catch (e) { if (typeof console !== 'undefined') console.warn('hinh_thai: bảng lò rèn lỗi, dùng bảng cũ', e); } }
    return vkPanelCu.apply(this, arguments);
  };

  // ---------- 3. ăn mừng nâng cấp (lớp giao diện, ~1,4 giây, bấm để bỏ qua) ----------
  const AM = { on: null };
  HT.am = AM;
  HT.TG = { tan: 0.2, rap: 0.65, loe: 0.3, ten: 0.5, het: 1.45 }; // giây: tan 0–0,2 · ráp 0,2–0,85 · loé 0,85–1,15 · tên 0,95–1,45 (tổng < 1,5 s)
  const nangCu = VM.nang;
  VM.nang = function (sv, w, el, mienPhi) {
    const st = w ? G.wStage(w) : 0;
    const ok = nangCu.apply(this, arguments);
    if (ok && !mienPhi && bat() && sv === G.save && G.scene && G.scene === G.Village && !G.noRender) {
      AM.on = { t0: G.time || 0, w, type: w.type, cu: vkGia(w, st, st > 0 ? w.branch : null), moi: vkGia(w, st + 1, w.branch), st: st + 1, el: w.branch, ten: HT.ten(w.type, st + 1) };
    }
    return ok;
  };
  const ease = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
  HT.veAnMung = function (t) {
    const A = AM.on, c = G.ux, T = G.theme, TG = HT.TG;
    if (!A) return;
    const E = G.EL[A.el] || { col: '#ffd23f', col2: '#fff3b0', name: '' };
    const cx = 240, cy = 100, sz = 92;
    if (T && T.dim) T.dim(0.72 * Math.min(1, t / 0.12)); else ui.rect(0, 0, G.W, G.H, 'rgba(6,14,14,0.72)');
    const FA = G.fxAnh, aCu = VM.anhO(A.cu), aMoi = VM.anhO(A.moi);
    const t1 = TG.tan, t2 = t1 + TG.rap, t3 = t2 + TG.loe;
    // tan: hình cũ co lại và mờ đi, hạt nổ màu hệ
    if (t < t1 + 0.05) veAnh(c, aCu, A.type, cx, cy, sz, { co: 1 - 0.75 * ease(Math.min(1, t / t1)), mo: 1 - Math.min(1, t / (t1 + 0.05)) });
    if (FA && t >= t1 * 0.6 && t < t1 + 0.5) FA.ve(c, 'hu-hat-no', cx, cy, t - t1 * 0.6, 0, 2.6, false, 1, E.col);
    // ráp: hình mới từ to + mờ về đúng cỡ, xoay nhẹ về 0; sao chớp quanh
    if (t >= t1) {
      const u = Math.min(1, (t - t1) / TG.rap), e = ease(u);
      veAnh(c, aMoi, A.type, cx, cy, sz, { co: 1.7 - 0.7 * e, mo: Math.min(1, u * 1.6), xoay: (1 - e) * 0.5 });
      if (FA && u < 1) for (let i = 0; i < 4; i++) {
        const g = i * Math.PI / 2 + (G.time || 0) * 2, r = 46 * (1 - e) + 14;
        FA.ve(c, 'hu-sao-chop', cx + Math.cos(g) * r, cy + Math.sin(g) * r * 0.8, ((t - t1) * 1.6 + i * 0.05) % 0.12, 0, 1.4, false, 0.9, E.col2 || E.col);
      }
    }
    // loé màu hệ (0,3 s): lớp màu mờ dần + vòng sóng hu-vong-song nhuộm màu hệ nở ra + nổ nhỏ hu-no-nho-<hệ> ở tâm
    if (t >= t2 && t < t3 + 0.05) {
      const u = Math.min(1, (t - t2) / TG.loe);
      c.save();
      c.globalAlpha *= (1 - u) * 0.3; c.fillStyle = E.col; c.fillRect(-(G.mx || 0) - 2, -(G.my || 0) - 2, 484 + (G.mx || 0) * 2, 274 + (G.my || 0) * 2);
      c.restore();
      if (FA) {
        FA.ve(c, 'hu-vong-song', cx, cy, (t - t2) * (FA.giay('hu-vong-song') / TG.loe), 0, 2.6, false, 1 - u * 0.5, E.col);
        if (!FA.ve(c, 'hu-no-nho-' + A.el, cx, cy, t - t2, 0, 2.4, false, 1)) FA.ve(c, 'hu-hat-no', cx, cy, t - t2, 0, 2.4, false, 1, E.col);
      }
    }
    // tên hình thái
    const t4 = t2 + 0.1;
    if (t >= t4) {
      const u = Math.min(1, (t - t4) / 0.2), cg = c.globalAlpha;
      c.globalAlpha = cg * u;
      ui.text(G.tv(A.ten), cx, cy + 56 - 4 * (1 - u), { size: 15, bold: true, align: 'center', color: E.col2 || GOLD });
      ui.text(G.t('Lên {0}!', G.tv(G.STAGE_NAMES[A.st])) + (G.EL[A.el] ? ' · ' + G.tv(E.name) : ''), cx, cy + 70, { size: 8, bold: true, align: 'center', color: TXT });
      c.globalAlpha = cg;
    }
    ui.text('Chạm để bỏ qua', 474, 264, { size: 6.5, align: 'right', color: 'rgba(241,230,198,0.55)', shadow: false });
  };
  // Dải "Lực chiến ▲" (js/luc_chien.js) hiện đè giữa màn: chờ ăn mừng xong mới chạy (dời mốc thời gian của dải, không vẽ trong lúc ăn mừng)
  const LCU = G.lucChienUI;
  if (LCU && LCU.ve && !LCU.ve.hinhThai) {
    const veLc = LCU.ve; let tLc = 0;
    LCU.ve = function () {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000, dt = tLc ? Math.min(0.25, Math.max(0, now - tLc)) : 0;
      tLc = now;
      const q = LCU.st && LCU.st.toast;
      if (AM.on && q) { q.t0 += dt; q.born += dt; q.end += dt; return undefined; }
      return veLc.apply(this, arguments);
    };
    LCU.ve.hinhThai = true;
  }
  // gắn vào vòng vẽ của làng: đang ăn mừng thì lần chạm không lọt xuống bảng (chạm = bỏ qua)
  const VG = G.Village;
  if (VG && VG.draw && !VG.draw.hinhThai) {
    const veCu = VG.draw;
    VG.draw = function () {
      const A = AM.on;
      if (!A) return veCu.apply(this, arguments);
      const t = (G.time || 0) - A.t0, ck = G.click;
      G.click = null; G.syncTaps = [];
      veCu.apply(this, arguments);
      G.click = null;
      if (t >= HT.TG.het || t < 0 || (ck && t > 0.12) || !bat()) { AM.on = null; return; }
      try { HT.veAnMung(t); } catch (e) { AM.on = null; }
    };
    VG.draw.hinhThai = true;
  }

  // ---------- 4. màn kết quả: tiến độ món đang cầm ----------
  const ketQuaCu = VM.ketQua;
  VM.ketQua = function (S, x, y, wd) {
    if (!bat()) return ketQuaCu.apply(this, arguments);
    const T = G.theme, sv = G.save, P = S && S.P;
    const w0 = P && G.curW ? G.curW(P) : null;
    const w = w0 && sv && Array.isArray(sv.weapons) ? sv.weapons.find((q) => q.id === w0.id) || w0 : w0;
    if (!w || !G.HINH_THAI.ten[w.type]) return ketQuaCu.apply(this, arguments);
    if (T && T.head) T.head('Linh khí', x, y + 7, { size: 7.5 }); else ui.text('Linh khí', x, y + 7, { size: 7.5, bold: true });
    y += 11;
    const L = (S && S.lkGain) || {};
    let got = 0;
    for (const id in L) for (const e of ELS) got += +L[id][e] || 0;
    const n = VM.lk(sv), st = G.wStage(w), c = VM.gia(st);
    ui.rect(x, y, wd, 19, 'rgba(10,22,20,0.55)', 'rgba(255,220,160,0.14)');
    VM.gem(x + 8, y + 9.5, 1);
    chu(G.t('+{0} linh khí trận này · đang có {1}', Math.round(got), Math.floor(n)), x + 17, y + 1.5, wd - 22, 8.5, { size: 7, min: 5.5, bold: true, color: '#ffe9a8' });
    let s, col;
    if (c == null) { s = G.t('{0}: hình thái cuối (Thức tỉnh).', HT.tenW(w)); col = GOOD; }
    else if (n >= c) { s = G.t('{0}: đủ linh khí mở {1}! Ghé Ông Thợ Rèn.', tenV(w.type, st), tenV(w.type, st + 1)); col = GOOD; }
    else { s = G.t('{0} → {1}: {2}/{3} linh khí', tenV(w.type, st), tenV(w.type, st + 1), Math.floor(n), c); col = '#e8dfcc'; }
    chu(s, x + 17, y + 10, wd - 22, 7.5, { size: 6.5, min: 5.2, color: col, dy: 0 });
    if (c != null) { ui.rect(x + 17, y + 17, wd - 22, 1, 'rgba(0,0,0,0.5)'); ui.rect(x + 17, y + 17, Math.round((wd - 22) * kep(n / c, 0, 1)), 1, n >= c ? '#ffd23f' : '#c9a24a'); }
    return y + 21;
  };
})();
