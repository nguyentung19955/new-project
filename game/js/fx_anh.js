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
  // hu-bam-*, biểu tượng trạng thái trên đầu trùm, sao choáng trùm vùng). Cờ tắt ?vetaycu=1 (G.VE_TAY_MOI = false) → như cũ.
  // G.huVt(mã): cờ bật VÀ ảnh mã đó đã sẵn sàng (ảnh chưa về: vẽ code như cũ).
  let vtCu = false;
  try { vtCu = typeof location !== 'undefined' && /[?&]vetaycu=1(&|$)/.test(String(location.search || '')); } catch (e) { vtCu = false; }
  if (G.VE_TAY_MOI == null) G.VE_TAY_MOI = !vtCu;
  G.huVt = (ma) => G.VE_TAY_MOI !== false && FA.co(ma);
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
      const n = a.net, sw = a.fw * n, sh = a.fh * n;
      c.drawImage(mau ? FA.nhuom(a, mau, kieu) || a.img : a.img, (f % a.cot) * sw, Math.floor(f / a.cot) * sh, sw, sh, -a.ax, -a.ay, a.fw, a.fh);
    } finally { c.restore(); }
    return true;
  }
})();
