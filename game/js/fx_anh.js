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
  FA.ve = function (c, ma, x, y, t, goc, co, lat, mo, mau, kieu) {
    const a = FA.ds[ma];
    if (!a || !a.ready || !c) return false;
    const f = FA.khung(a, t);
    if (f < 0) return false;
    return veF(c, a, f, x, y, goc, co, lat, mo, mau, kieu);
  };
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
