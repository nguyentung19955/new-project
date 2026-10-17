// HIỆU ỨNG ẢNH AI (trang công cụ tools/tach-hieu-ung → tệp hu-<tên>.sprite.json trong game/art/custom/).
// Mỗi tệp là một dải khung ngang (ảnh PNG), game phát khung theo thời gian thay cho hình vẽ bằng code của hiệu ứng đó.
// Không có tệp nào thì không có gì ở đây được dùng: game y hệt như trước (mọi chỗ móc đều hỏi G.fxAnh.co(mã) trước).
// Định dạng tệp:
//   { loai:"linh-khi-sprite", doi_tuong:"hieu-ung", ma:"hu-<tên>", ten, tam:"data:image/png;base64,…" (dải khung ngang),
//     khung_rong, khung_cao, goc:[x,y] (điểm neo: chỗ đặt vào game), so (số khung), giay (thời lượng), lap (lặp?),
//     xoay (xoay theo hướng bay/hướng đánh?), co (hệ số cỡ, mặc định 1), tron ("cong" = cộng sáng 'lighter' cho ánh sáng) }
// Tuỳ chọn "net" (số nguyên 1..4, mặc định 1): ảnh có số điểm ảnh gấp net lần; khung_rong, khung_cao, goc vẫn tính theo điểm ảnh game.
// Ảnh vẽ quay sang PHẢI; game tự lật khi quay trái. Dùng lại một ảnh, không tạo canvas mới mỗi khung (mượt trên điện thoại).
// Nạp TRƯỚC js/sprite_custom.js (sprite_custom chuyển tệp hiệu ứng sang đây).
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? (window.G = window.G || {}) : (globalThis.G = globalThis.G || {});
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const FA = (G.fxAnh = { ds: {}, loi: [] });

  // Nạp một tệp. Trả về hiệu ứng (đang nạp ảnh) hoặc null nếu tệp hỏng.
  FA.add = function (tep) {
    try {
      if (!tep || typeof tep !== 'object' || typeof tep.ma !== 'string' || !/^hu-[A-Za-z0-9_-]{1,37}$/.test(tep.ma)) throw new Error('mã phải bắt đầu bằng hu-');
      const SC0 = G.spriteCustom; // tải nhanh 12/10: bản ảnh rời cho đường dẫn anh/….png (js/sprite_custom.js SC.laAnh)
      if (typeof tep.tam !== 'string' || !(tep.tam.indexOf('data:image/png;base64,') === 0 || (SC0 && SC0.laAnh && SC0.laAnh(tep.tam)))) throw new Error('thiếu dải khung PNG');
      const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0;
      if (fw < 1 || fh < 1 || fw > 512 || fh > 512) throw new Error('cỡ khung sai');
      const goc = Array.isArray(tep.goc) ? tep.goc : [fw / 2, fh / 2];
      const a = {
        ma: tep.ma, ten: String(tep.ten || tep.ma), fw, fh, ax: isFinite(+goc[0]) ? +goc[0] : fw / 2, ay: isFinite(+goc[1]) ? +goc[1] : fh / 2,
        so: clamp(tep.so | 0, 1, 64), giay: +tep.giay > 0 ? clamp(+tep.giay, 0.05, 10) : 0.5, lap: !!tep.lap, xoay: !!tep.xoay,
        co: +tep.co > 0 ? clamp(+tep.co, 0.1, 8) : 1, cong: tep.tron === 'cong', img: null, ready: false, cot: 1,
        net: tep.net == null || !isFinite(+tep.net) ? 1 : clamp(Math.round(+tep.net), 1, 4),
        bk: Array.isArray(tep.ban_kinh) && tep.ban_kinh.every((v) => +v > 0) ? tep.ban_kinh.map(Number) : null, // 16/10 vẽ tay 6: bán kính vòng từng khung (hu-vong-song)
        det: +tep.det > 0.05 && +tep.det <= 1 ? +tep.det : 1, // 16/10 vẽ tay 7: ảnh vòng đã dẹt sẵn (cao / rộng); 1 = vòng tròn
        tamN4: typeof tep.tam_n4 === 'string' ? tep.tam_n4 : null, // nét cao (?netcao=3|4): cùng khung, ảnh gấp 4 điểm / điểm game; tải lười
      };
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => { a.img = img; a.cot = Math.max(1, Math.floor(img.width / (fw * a.net))); a.ready = true; };
        img.onerror = () => { FA.loi.push(a.ma + ': ảnh hỏng'); };
        const SCx = G.spriteCustom; // Phiên hiệu năng (V3): ảnh của tệp tải sau giải mã ngoài luồng chính rồi mới dùng
        if (SCx && SCx.napAnh) SCx.napAnh(img, tep.tam); else img.src = tep.tam;
      }
      FA.ds[a.ma] = a;
      return a;
    } catch (e) {
      FA.loi.push((tep && tep.ma) + ': ' + e.message);
      if (typeof console !== 'undefined') console.warn('fx_anh: bỏ qua tệp hiệu ứng hỏng', tep && tep.ma, e.message);
      return null;
    }
  };
  FA.remove = (ma) => { delete FA.ds[ma]; };
  FA.clear = () => { for (const k of Object.keys(FA.ds)) delete FA.ds[k]; };
  // Tải nhanh 12/10: hình có trong game mà ảnh rời chưa về → báo js/sprite_custom.js tải ngay (SC.canAnh); trong lúc đó vẽ bằng code.
  const can = (a) => { if (a && !a.ready && G.spriteCustom && G.spriteCustom.canAnh) G.spriteCustom.canAnh(a.ma); };
  FA.get = (ma) => { const a = FA.ds[ma]; can(a); return a && a.ready ? a : null; };
  // Có ảnh sẵn sàng để vẽ không (không có thì nơi gọi vẽ bằng code như cũ).
  FA.co = (ma) => { const a = FA.ds[ma]; can(a); return !!(a && a.ready); };
  FA.giay = (ma) => { const a = FA.ds[ma]; return a ? a.giay : 0; };
  FA.lap = (ma) => { const a = FA.ds[ma]; return !!(a && a.lap); };
  // Khung ở thời điểm t (giây từ lúc bắt đầu). Hiệu ứng một lần đã hết thì trả về -1.
  FA.khung = function (a, t) {
    t = Math.max(0, t || 0);
    const k = Math.floor((t / a.giay) * a.so + 1e-6);
    if (a.lap) return k % a.so;
    return k >= a.so ? -1 : k;
  };
  // ---------- HIỆU ỨNG ĐỢT 3 (13/10, docs/review/ke-hoach-cai-thien/hieu-ung-dot-3) ----------
  // Bật mặc định khi có ảnh. Cờ tắt: ?hudot3=0 (hoặc G.HU_DOT3 = false) → mọi chỗ của đợt 3 vẽ bằng code như cũ.
  // G.huDot3(mã): cờ bật VÀ ảnh mã đó đã sẵn sàng.
  let d3Tat = false;
  try { d3Tat = typeof location !== 'undefined' && /[?&]hudot3=0\b/i.test(String(location.search || '')); } catch (e) { d3Tat = false; }
  if (G.HU_DOT3 == null) G.HU_DOT3 = !d3Tat;
  G.huDot3 = (ma) => G.HU_DOT3 !== false && FA.co(ma);
  // ---------- CÒN VẼ TAY (15/10, docs/review/ke-hoach-cai-thien/con-ve-tay) ----------
  // Nối ảnh đã có vào các chỗ trong trận còn vẽ bằng code (ô vuông chớp ở vùng nổ, bong bóng / mảnh băng / lưỡi lửa vẽ code chồng lên ảnh
  // hu-bam-*, biểu tượng trạng thái trên đầu trùm, sao choáng trùm vùng). 15/10 don-tep B: bỏ cờ ?vetaycu=1 (G.VE_TAY_MOI).
  // G.huVt(mã): ảnh mã đó đã sẵn sàng.
  G.huVt = (ma) => FA.co(ma);
  // ---------- BỎ HẲN HÌNH VẼ CODE TRONG TRẬN (16/10, docs/review/ke-hoach-cai-thien/con-ve-tay-5) ----------
  // Chủ game: không giữ hình vẽ code nào trong trận, kể cả hình "nhỏ". Thay vì sửa từng hàm (hàng trăm chỗ ở fx.js, fx_he.js, fx_dan.js,
  // fx_ky_nang.js, bo_skill.js, monster_art.js, mobs.js, room_art.js...), G.drawWorld (js/combat.js) bật CHẶN trên bút canvas thế giới:
  // mọi lệnh tô hình bằng code (fillRect, strokeRect, fill, stroke) thành không vẽ gì; ảnh (drawImage) và chữ (fillText) vẫn vẽ.
  // Chỗ ảnh hưởng chơi được mở lại bằng G.moVe(fn): vùng báo nguy hiểm (js/bao_truoc.js), vùng / vũng gây hại của quái, sóng, nước dâng,
  // thân quái / Zed / trùm khi ảnh chưa tải (vẽ code dự phòng, kẻo vô hình), đạn quái chưa có ảnh. Số sát thương, thanh máu, viền đỏ
  // khi trúng đòn nằm ở lớp giao diện (G.ux) nên không bị chặn.
  // Cờ ?vecode=1 (hoặc G.VE_CODE = true): không chặn gì, vẽ code như trước để so.
  let veCode = false;
  try { veCode = typeof location !== 'undefined' && /[?&]vecode=1\b/i.test(String(location.search || '')); } catch (e) { veCode = false; }
  if (G.VE_CODE == null) G.VE_CODE = veCode;
  G.chanVe = 0; // > 0: đang chặn (chỉ tác dụng trên bút đã gắn G.ganChan)
  const CHAN_M = ['fillRect', 'strokeRect', 'fill', 'stroke'];
  G.ganChan = function (c) {
    if (!c || c.__chanVe) return c;
    try {
      for (const m of CHAN_M) {
        const g0 = c[m];
        if (typeof g0 !== 'function') continue;
        c[m] = function () { if (G.chanVe > 0) return undefined; return g0.apply(this, arguments); };
      }
      c.__chanVe = true;
    } catch (e) { /* bút lạ: bỏ qua, vẽ như cũ */ }
    return c;
  };
  // Tạm mở chặn trong fn (chỗ ảnh hưởng chơi). Không chặn thì gọi thẳng.
  G.moVe = function (fn) {
    if (!(G.chanVe > 0)) return fn();
    const k = G.chanVe; G.chanVe = 0;
    try { return fn(); } finally { G.chanVe = k; }
  };
  G.dangChan = () => G.chanVe > 0;
  // ---------- CÒN VẼ TAY 6 (16/10, docs/review/ke-hoach-cai-thien/con-ve-tay-6): 16 ảnh chủ game gen cho các hình code đã chặn ----------
  // Mỗi chỗ hình code cũ (đã bị chặn) nay vẽ ảnh thay, ĐÚNG lúc đang chặn (G.dangChan()) — ?vecode=1 không chặn thì vẽ code y cũ, không
  // vẽ thêm ảnh. G.anhThay(mã): đang ở chế độ chặn (không ?vecode=1) VÀ ảnh mã đó sẵn sàng — dùng ở chỗ SINH hình (lúc cập nhật, khi
  // G.chanVe chưa bật). Chỉ là hình: không đổi vùng, sát thương, thời gian.
  G.anhThay = (ma) => G.VE_CODE !== true && !G.noRender && FA.co(ma);
  // Bóng dưới chân (hu-bong-chan, ảnh 32 điểm bề ngang khi co 1, đã có 3 nấc alpha 45/30/15%): thay elip bóng vẽ code. rx: nửa bề ngang bóng
  // cũ → co = rx / 16 (co theo cỡ thân). mo: độ đậm thêm (bóng nhạt dần lúc nhảy / chết). Trả true nếu đã vẽ (nơi gọi bỏ lệnh elip code).
  G.bongAnh = function (c, x, y, rx, mo) {
    if (!(G.chanVe > 0 || (G.langVe > 0 && G.NOI9 !== false)) || !c || !(rx > 0)) return false; // vẽ tay 9: cả ở làng (G.langVe)
    const a = FA.get('hu-bong-chan');
    if (!a) return false;
    if (mo != null && !(mo > 0.01)) return true;
    return veF(c, a, 0, x, y, 0, rx / 16, false, mo == null ? 1 : mo);
  };
  // ---------- CÒN VẼ TAY 9 (16/10, docs/review/ke-hoach-cai-thien/con-ve-tay-9/bao-cao.md) ----------
  // Ba cờ, mỗi cờ tắt một phần (bật lại bản trước phiên này); ?vt9=0 tắt cả ba. ?vecode=1 cũng tắt cả ba (vẽ code như cũ để so).
  //   ?noi9=0     G.NOI9     7 hàng "có sẵn hình" của kiểm kê vẽ tay 8 (viền ô vũ khí, bóng / lá / đom đóm ở làng, sổ yêu quái, tinh thể / đom đóm phòng…)
  //   ?trum9=0    G.TRUM9    hiệu ứng code của trùm / quái lọt qua chặn vẽ (bút giả nhớ hàm cũ) + ảnh thay cho các hiệu ứng đó
  //   ?songnhanh=0 G.SONG9   nhuộm màu bằng ctx.filter kiểu cũ (lọc cả canvas trận mỗi lệnh vẽ: phòng trùm Sông sâu rất chậm)
  {
    let q = '';
    try { q = typeof location !== 'undefined' ? String(location.search || '') : ''; } catch (e) { q = ''; }
    const tat = (k) => new RegExp('[?&]' + k + '=0\\b', 'i').test(q);
    const het = tat('vt9') || G.VE_CODE === true;
    if (G.NOI9 == null) G.NOI9 = !het && !tat('noi9');
    if (G.TRUM9 == null) G.TRUM9 = !het && !tat('trum9');
    if (G.SONG9 == null) G.SONG9 = !tat('vt9') && !tat('songnhanh');
  }
  // ---------- VẼ TAY 8 GỘP: TRẬN (16/10, docs/review/ke-hoach-cai-thien/ve-tay-8-gop-tran/bao-cao.md) ----------
  // Ảnh gộp g2–g8 (lửa, nước, hiệu ứng trắng, vật Sông sâu, ô lặp Sông sâu, phủ màn, tường / cửa Sông sâu).
  //   ?gop8=0   G.GOP8   mọi chỗ của phiên này vẽ như bản trước (code / để trống)
  //   ?vecode=1          như cũ: vẽ code toàn bộ (cũng tắt phiên này)
  // G.gop8(mã): cờ bật, không ?vecode=1, ảnh mã đó sẵn sàng. G.gop8Bat(): cờ bật và không ?vecode=1 (dùng cho ảnh giao diện gd-*).
  {
    let q = '';
    try { q = typeof location !== 'undefined' ? String(location.search || '') : ''; } catch (e) { q = ''; }
    if (G.GOP8 == null) G.GOP8 = !/[?&]gop8=0\b/i.test(q);
  }
  G.gop8Bat = () => G.GOP8 !== false && G.VE_CODE !== true && !G.noRender;
  G.gop8 = (ma) => G.gop8Bat() && FA.co(ma);
  // Viền đỏ màn hình (js/fx.js vignette, js/noi_gian.js vien): ảnh gd-vien-man-do (alpha đã giải khỏi nền xanh) hoặc null → canvas chuyển màu cũ
  G.vienManDo = () => { const S = G.spriteCustom, a = G.gop8Bat() && S && S.gdSan ? S.gdSan('gd-vien-man-do') : null; return a ? a.img : null; };
  // Bóng dưới chân ở LÀNG (lớp làng không bị chặn vẽ): ảnh hu-bong-chan khi G.NOI9. Trả true nếu đã vẽ.
  G.bongLang = function (c, x, y, rx, mo) {
    if (G.NOI9 === false || !c || !(rx > 0)) return false;
    const a = FA.get('hu-bong-chan');
    if (!a) return false;
    if (mo != null && !(mo > 0.01)) return true;
    return veF(c, a, 0, x, y, 0, rx / 16, false, mo == null ? 1 : mo);
  };
  // Nhuộm màu NHANH thay cho ctx.filter trên canvas lớn (js/vung4.js, js/thuong_luong.js, js/ky_nang_quai.js KN.veTam).
  // Đo (headless, phòng trùm Sông sâu): mỗi lệnh vẽ khi ctx.filter đang bật bắt trình duyệt lọc cả một lớp bằng cỡ canvas trận.
  // G.locVe(c, css, fn): trong fn, "filter hiệu lực" của c là css (thay hẳn, như gán c.filter). Lệnh drawImage được lọc trên một tấm NHỎ
  // bằng đúng ô nguồn (ảnh: nhớ lại, canvas: tấm nháp dùng lại) rồi mới dán; lệnh tô code (fill / stroke) vẫn bật ctx.filter thật (đúng màu).
  // G.locHien(c): filter hiệu lực hiện tại (chuỗi rỗng = không lọc). Bộ lọc màu (hue / saturate / brightness / sepia) tính theo từng điểm
  // ảnh nên lọc ô nguồn trước rồi dán = lọc lúc dán (cùng kết quả).
  G.locHien = (c) => (c && c.__loc != null ? c.__loc : c && 'filter' in c && c.filter && c.filter !== 'none' ? c.filter : '');
  const LOC_NHO = new WeakMap();
  let nhap = null;
  function locNguon(src, sx, sy, sw, sh, css) {
    const w = Math.ceil(sw), h = Math.ceil(sh);
    if (!(w > 0 && h > 0) || w > 2048 || h > 2048) return null;
    const anh = typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement;
    let m = null, key = '';
    if (anh) {
      m = LOC_NHO.get(src); if (!m) { m = new Map(); LOC_NHO.set(src, m); }
      key = css + '|' + sx + '|' + sy + '|' + sw + '|' + sh;
      const o = m.get(key); if (o) return o;
    }
    let cv;
    if (anh) cv = document.createElement('canvas');
    else { if (!nhap) nhap = document.createElement('canvas'); cv = nhap; }
    if (cv.width < w || cv.height < h || anh) { cv.width = anh ? w : Math.max(w, cv.width); cv.height = anh ? h : Math.max(h, cv.height); }
    const g = cv.getContext('2d');
    if (!g || !('filter' in g)) return null;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    if (!anh) g.clearRect(0, 0, w, h);
    g.imageSmoothingEnabled = false; g.filter = css;
    g.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    g.filter = 'none';
    if (anh) { if (m.size > 48) m.delete(m.keys().next().value); m.set(key, cv); }
    return cv;
  }
  function bocLoc(c) {
    if (c.__locBoc) return;
    c.__locBoc = true;
    c.__loc = null;
    const di = c.drawImage;
    c.drawImage = function (src) {
      const css = c.__loc;
      if (!css || !src || typeof src !== 'object') return di.apply(this, arguments);
      const n = arguments.length, a = arguments;
      const W0 = src.naturalWidth || src.videoWidth || src.width, H0 = src.naturalHeight || src.videoHeight || src.height;
      let sx = 0, sy = 0, sw = W0, sh = H0, dx, dy, dw, dh;
      if (n === 3) { dx = a[1]; dy = a[2]; dw = W0; dh = H0; } else if (n === 5) { dx = a[1]; dy = a[2]; dw = a[3]; dh = a[4]; } else { sx = a[1]; sy = a[2]; sw = a[3]; sh = a[4]; dx = a[5]; dy = a[6]; dw = a[7]; dh = a[8]; }
      let t = null;
      if (sw > 0 && sh > 0 && sx >= 0 && sy >= 0 && sx + sw <= W0 + 0.01 && sy + sh <= H0 + 0.01) { try { t = locNguon(src, sx, sy, sw, sh, css); } catch (e) { t = null; } }
      if (!t) { const f0 = c.filter; c.filter = css; try { return di.apply(this, arguments); } finally { c.filter = f0; } }
      return di.call(this, t, 0, 0, sw, sh, dx, dy, dw, dh);
    };
    for (const m of ['fill', 'fillRect', 'stroke', 'strokeRect', 'fillText', 'strokeText']) {
      const g0 = c[m];
      if (typeof g0 !== 'function') continue;
      c[m] = function () {
        const css = c.__loc;
        if (!css) return g0.apply(this, arguments);
        const f0 = c.filter; c.filter = css;
        try { return g0.apply(this, arguments); } finally { c.filter = f0; }
      };
    }
  }
  G.locVe = function (c, css, fn) {
    if (!c || !('filter' in c)) return fn();
    css = css && css !== 'none' ? String(css) : '';
    if (G.SONG9 === false || typeof document === 'undefined') { const f0 = c.filter; c.filter = css || 'none'; try { return fn(); } finally { c.filter = f0; } }
    try { bocLoc(c); } catch (e) { const f0 = c.filter; c.filter = css || 'none'; try { return fn(); } finally { c.filter = f0; } }
    const truoc = c.__loc;
    c.__loc = css;
    try { return fn(); } finally { c.__loc = truoc; }
  };
  // ---------- HIỆU ỨNG CHIÊU TRÙM VÙNG (14/10, docs/review/ke-hoach-cai-thien/trum-moi/YEU-CAU-MOC-HO-HIEU-UNG-NEN.md) ----------
  // hu-song-than, hu-bang-nhon-roi, hu-xoay-nuoc, hu-phun-bang (Ngư Tinh), hu-gai-re, hu-qua-doc-roi, hu-la-chem (Mộc Tinh),
  // hu-cau-lua-ma (Hồ Tinh), hu-doi-pha (cả ba trùm lúc đổi pha). Bật mặc định khi có ảnh; cờ tắt ?hutrum=0 (hoặc G.HU_TRUM = false)
  // → mọi chỗ vẽ bằng code như cũ. G.huTrum(mã): cờ bật VÀ ảnh mã đó đã sẵn sàng. Chỉ là hình: không đổi vùng, sát thương, thời gian.
  let tTat = false;
  try { tTat = typeof location !== 'undefined' && /[?&]hutrum=0\b/i.test(String(location.search || '')); } catch (e) { tTat = false; }
  if (G.HU_TRUM == null) G.HU_TRUM = !tTat;
  G.huTrum = (ma) => G.HU_TRUM !== false && FA.co(ma);
  // ---------- 7 HIỆU ỨNG THÊM (14/10, docs/review/ke-hoach-cai-thien/trum-moi/YEU-CAU-TRUM-NHO-HIEU-UNG-GIAO-DIEN.md) ----------
  // hu-dap-san (Cua Đá đập sàn), hu-nam-moc (Nấm Chúa hàng nấm), hu-phun-lua-quat (Hổ Lửa phun lửa), hu-hat-linh-khi (hạt linh khí bay về
  // thanh, js/fx.js 'orb', nhuộm theo hệ), hu-nut-san (vết nứt sàn, js/fx.js 'crack', khung 1 mờ dần), hu-quai-hien (quái xuất hiện,
  // CH.spawn), hu-quai-dap (quái thường đập đất, DON.dap). Cờ tắt: ?huthem=0 (G.HU_THEM = false) hoặc cờ chung ?hutrum=0 → vẽ code như cũ.
  let thTat = false;
  try { thTat = typeof location !== 'undefined' && /[?&]huthem=0\b/i.test(String(location.search || '')); } catch (e) { thTat = false; }
  if (G.HU_THEM == null) G.HU_THEM = !thTat;
  G.huThem = (ma) => G.HU_TRUM !== false && G.HU_THEM !== false && FA.co(ma);
  // ---------- 9 HIỆU ỨNG KỸ NĂNG (15/10, docs/review/ke-hoach-cai-thien/hieu-ung-ky-nang/YEU-CAU.md) ----------
  // hu-cau-dat-lan, hu-vet-nhot, hu-vung-dien, hu-bua-tam-giac, hu-vo-oc (js/ky_nang_quai.js); hu-manh-san-ho, hu-tuong-tinh-the, hu-vet-dau,
  // hu-nam-con (js/chieu_trum.js). Thay hình vẽ tạm bằng code; thiếu tệp / ảnh chưa tải xong thì vẫn vẽ code.
  // Chỉ là hình: không đổi vùng, số, thời gian. (15/10 don-tep B: bỏ cờ ?fxcu=1 / G.FX_CU.)
  G.huKn = (ma) => !G.noRender && FA.co(ma);
  // Nhuộm màu (ảnh trắng-xám, game tự nhuộm): nhân màu rồi cộng lại một phần ảnh gốc cho lõi còn sáng (cùng cách js/fx_he.js nhuộm
  // vòng tụ lực). kieu 'sang': chỉ nhuộm điểm sáng gần trắng (ánh trong khe nứt), phần còn lại giữ màu gốc.
  // Tấm nhuộm làm MỘT lần cho mỗi (mã, màu, kiểu) rồi dùng lại. Lỗi (không có canvas) thì vẽ ảnh gốc.
  const NHUOM = new Map();
  const hex = (m) => { const v = parseInt(String(m).replace('#', ''), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  FA.nhuom = function (a, mau, kieu) {
    if (!mau || !a || !a.img || typeof document === 'undefined') return a && a.img;
    const key = a.ma + '|' + mau + '|' + (kieu || '');
    const o = NHUOM.get(key);
    if (o && o.img === a.img) return o.cv;
    try {
      const cv = document.createElement('canvas');
      cv.width = a.img.width; cv.height = a.img.height;
      const g = cv.getContext('2d');
      g.drawImage(a.img, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data, M = hex(mau);
      for (let i = 0; i < px.length; i += 4) {
        if (!px[i + 3]) continue;
        const r = px[i], gg = px[i + 1], b = px[i + 2];
        let k = 1;
        if (kieu === 'sang') { const mn = Math.min(r, gg, b), mx = Math.max(r, gg, b); k = mn > 150 && mx - mn < 60 ? Math.min(1, (mn - 150) / 50) : 0; if (!k) continue; }
        const nr = Math.min(255, r * M[0] / 255 + r * 0.25), ng = Math.min(255, gg * M[1] / 255 + gg * 0.25), nb = Math.min(255, b * M[2] / 255 + b * 0.25);
        px[i] = r + (nr - r) * k; px[i + 1] = gg + (ng - gg) * k; px[i + 2] = b + (nb - b) * k;
      }
      g.putImageData(d, 0, 0);
      NHUOM.set(key, { img: a.img, cv });
      return cv;
    } catch (e) { NHUOM.set(key, { img: a.img, cv: a.img }); return a.img; }
  };
  // Vẽ đúng khung số f (đợt 3: khiên nước lặp 1–4 rồi 5–6 khi vỡ, cầu tích chưởng theo độ tích...). mau/kieu: nhuộm (xem FA.nhuom).
  FA.veK = function (c, ma, x, y, f, goc, co, lat, mo, mau, kieu) {
    const a = FA.ds[ma];
    if (!a || !a.ready || !c) return false;
    f = Math.max(0, Math.min(a.so - 1, f | 0));
    return veF(c, a, f, x, y, goc, co, lat, mo, mau, kieu);
  };
  // Vẽ hiệu ứng ma tại (x, y) (điểm neo của ảnh trùng điểm này).
  // t: giây từ lúc bắt đầu; goc: góc (radian) — tệp có "xoay" thì xoay theo góc, không thì chỉ lật trái/phải theo hướng góc;
  // co: hệ số cỡ thêm (nhân với "co" của tệp); lat: lật ngang (quay trái); mo: độ đậm 0..1; mau, kieu (tuỳ chọn): nhuộm. Trả về true nếu đã vẽ.
  // Soát mượt phiên 3 mục 16A (?hoalap=0 tắt): hiệu ứng LẶP chậm (4,5–9 khung/giây: dính thân hu-bam-*, vùng sàn hu-vung-*, mây độc, cổng…)
  // vẽ thêm khung kế đè lên với độ hiện 0–35% theo phần lẻ của khung → đỡ "nhảy" giữa các khung. Hiệu ứng chậm cố ý (< 4,5 khung/giây) để nguyên.
  const lapCham = (a) => { if (!a.lap || a.so < 2) return false; const fps = a.so / a.giay; return fps >= 4.5 && fps < 9; };
  FA.lapCham = (ma) => { const a = FA.ds[ma]; return !!(a && lapCham(a)); };
  FA.ve = function (c, ma, x, y, t, goc, co, lat, mo, mau, kieu) {
    const a = FA.ds[ma];
    if (!a || !a.ready || !c) return false;
    const f = FA.khung(a, t);
    if (f < 0) return false;
    const ok = veF(c, a, f, x, y, goc, co, lat, mo, mau, kieu);
    if (ok && G.HOA_LAP !== false && lapCham(a)) {
      const v = (Math.max(0, t || 0) / a.giay) * a.so, fr = v - Math.floor(v);
      if (fr > 0.02) veF(c, a, (f + 1) % a.so, x, y, goc, co, lat, (mo == null ? 1 : clamp(mo, 0, 1)) * 0.35 * fr, mau, kieu);
    }
    return ok;
  };
  // Con vẽ tay đợt 3 (hu-tam-giac-bua): vẽ khung f sao cho 3 điểm S (tọa độ điểm game so với điểm neo của ảnh, khi co 1) rơi ĐÚNG vào 3 điểm
  // D trên màn hình (ánh xạ affine: dời, co giãn, xoay, xô nghiêng). Dùng để tam giác ảnh khớp đúng 3 đỉnh vùng va chạm thật. Trả về true nếu đã vẽ.
  FA.veAffine = function (c, ma, f, S, D, mo) {
    const a = FA.ds[ma];
    if (!a || !a.ready || !c) return false;
    const sx1 = S[1][0] - S[0][0], sy1 = S[1][1] - S[0][1], sx2 = S[2][0] - S[0][0], sy2 = S[2][1] - S[0][1];
    const det = sx1 * sy2 - sx2 * sy1;
    if (!det) return false;
    const ux1 = D[1][0] - D[0][0], uy1 = D[1][1] - D[0][1], ux2 = D[2][0] - D[0][0], uy2 = D[2][1] - D[0][1];
    const m11 = (ux1 * sy2 - ux2 * sy1) / det, m12 = (ux2 * sx1 - ux1 * sx2) / det, m21 = (uy1 * sy2 - uy2 * sy1) / det, m22 = (uy2 * sx1 - uy1 * sx2) / det;
    const tx = D[0][0] - (m11 * S[0][0] + m12 * S[0][1]), ty = D[0][1] - (m21 * S[0][0] + m22 * S[0][1]);
    if (![m11, m12, m21, m22, tx, ty].every(isFinite)) return false;
    f = Math.max(0, Math.min(a.so - 1, f | 0));
    c.save();
    try {
      c.transform(m11, m21, m12, m22, tx, ty);
      c.imageSmoothingEnabled = false;
      if (a.cong) c.globalCompositeOperation = 'lighter';
      if (mo != null && mo < 1) c.globalAlpha *= clamp(mo, 0, 1);
      const n = a.net, sw = a.fw * n, sh = a.fh * n;
      c.drawImage(a.img, (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, -a.ax, -a.ay, a.fw, a.fh);
    } finally { c.restore(); }
    return true;
  };
  // Soát mượt phiên 3 mục 21 (?tile05=0 tắt): FA.bac05(cỡ) làm tròn cỡ vẽ theo bậc 0,5 khi ≥ 0,75 — nền vẽ gấp đôi (G.NET 2) nên mỗi điểm ảnh
  // ảnh (tệp net 1) phủ số nguyên điểm ảnh thật, hết răng cưa lấp lánh. CHỈ dùng ở chỗ cỡ là tuỳ ý (vệt vũ khí scVet, nổ / trúng đòn trang trí);
  // KHÔNG dùng cho ảnh co theo bán kính vùng thật (vũng, vùng báo trước, nổ có bán kính sát thương): hình phải khớp đúng vùng chạm.
  const bac05 = (s) => (G.TILE05 !== false && s >= 0.75 ? Math.round(s * 2) / 2 : s);
  FA.bac05 = bac05;
  // Vẽ tay 8 gộp: vẽ khung f của ảnh ma KÉO vào ô (x, y, w, h) (vũng bầu dục theo rx / ry, dải dòng chảy, nước dâng...). quay: xoay 90°
  // theo chiều kim đồng hồ (ô vẫn tính sau khi xoay). Trả về true nếu đã vẽ.
  FA.veO = function (c, ma, f, x, y, w, h, mo, mau, quay) {
    const a = FA.ds[ma];
    if (!a || !a.ready || !c || !(w > 0) || !(h > 0)) return false;
    f = ((f | 0) % a.so + a.so) % a.so;
    const n = a.net, sw = a.fw * n, sh = a.fh * n;
    c.save();
    try {
      c.imageSmoothingEnabled = false;
      if (mo != null && mo < 1) c.globalAlpha *= clamp(mo, 0, 1);
      const img = mau ? FA.nhuom(a, mau) || a.img : a.img;
      if (quay) { c.translate(x + w, y); c.rotate(Math.PI / 2); c.drawImage(img, (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, 0, 0, h, w); }
      else c.drawImage(img, (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, x, y, w, h);
    } finally { c.restore(); }
    return true;
  };
  // NÉT CAO (net-cao/bao-cao.md): canvas thế giới nét ≥ 3 và tệp có "tam_n4" (vệt kiếm nặng) → vẽ bản nét 4 (tải lần đầu cần, chưa về thì
  // bản thường). Cùng khung, cùng neo: chỉ ô nguồn to gấp đôi. Mặc định (nét 2) không bao giờ đụng tới.
  function cao(a) {
    if (!a.tamN4 || !(G.NET > 2) || typeof Image === 'undefined') return null;
    if (!a.hi) { const img = new Image(), h = { img, ok: false }; img.onload = () => { h.ok = true; }; img.onerror = () => { h.hong = true; }; img.src = a.tamN4; a.hi = h; }
    return a.hi.ok ? a.hi.img : null;
  }
  function veF(c, a, f, x, y, goc, co, lat, mo, mau, kieu) {
    const s = a.co * (co > 0 ? co : 1);
    let flip = !!lat, rot = 0;
    if (goc) { if (a.xoay) rot = goc; else if (Math.cos(goc) < 0) flip = !flip; }
    c.save();
    try {
      c.translate(Math.round(x), Math.round(y));
      if (rot) c.rotate(rot);
      c.scale(flip ? -s : s, s);
      c.imageSmoothingEnabled = false;
      if (a.cong) c.globalCompositeOperation = 'lighter';
      if (mo != null && mo < 1) c.globalAlpha *= clamp(mo, 0, 1);
      const hi = mau ? null : cao(a), n = hi ? 4 : a.net, sw = a.fw * n, sh = a.fh * n;
      c.drawImage(hi || (mau ? FA.nhuom(a, mau, kieu) || a.img : a.img), (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, -a.ax, -a.ay, a.fw, a.fh);
    } finally { c.restore(); }
    return true;
  }
})();
