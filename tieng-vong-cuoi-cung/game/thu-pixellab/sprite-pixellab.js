'use strict';
/* =====================================================================================================================
   sprite-pixellab.js – NẠP + VẼ SPRITE từ lam-pixellab.json (module tách riêng, không biết luật game).
   JSON (art/huong-moi/lam-pixel/pixellab/lam-pixellab.json, do code/nhap_pixellab.py ghi, sửa tay được):
     clip.<tên> = {
       anh: "chay.png" | ["a-0.png", "a-1.png", …]   (đường dẫn tính từ thư mục JSON)
       xep: "hang" (một hàng ô đều) | "luoi" (nhiều hàng, cần "cot") | "tung_file" (mỗi file một hình) | "tung_khung" (danh sách "khung")
       o: [rộng, cao] cỡ ô · so_hinh · cot · khung: [[x, y, w, h], …] (xep tung_khung)
       chan: [x, y] điểm chân trong ô (mặt phải) · ti_le: px logic / điểm (mặc định ti_le_mac_dinh = 2)
       ms: 100 | [80, 80, 120…] thời lượng từng hình · fps · lap: true/false   (chỉ cho clip không gắn pha đòn)
       phat: "quang_duong" + quang: 132  (chạy: đổi hình theo quãng đường đi được, không theo thời gian)
       manh: [2, 3] khung "mạnh" (pha ra đòn) · pha: {layda: [...], rado: [...], hoi: [...]}  (chỉ số khung từng pha)
       mat: {diem: [[[x, y]…] từng hình], doi: {"#b8ccd3": "#f2a33a", …}}  (tô mắt hổ phách: CHỈ các điểm này)
       tam: true  = hình tạm (không phải PixelLab) }
     trang_thai.<trạng thái game> = [tên clip ưu tiên, …]  → clip đầu tiên nạp được.
   Lật trái bằng code quanh điểm chân. Vẽ nearest-neighbor, phóng số nguyên ti_le, toạ độ làm tròn px logic.
   ===================================================================================================================== */
const SpritePL = (() => {
  const CLIP = {};      // tên → {ten, def, hinh:[{img, sx, sy, sw, sh}], ok, loi}
  let J = null, GOC = '', TL = 2;
  const OPT = {mat: DC_Q.get('mat') !== 'goc'};   // ?mat=goc: không tô mắt hổ phách (xem màu PixelLab gốc)

  function napAnh(src){
    return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
  }
  function hex(h){ return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  // tô mắt: CHỈ các điểm có trong danh sách của hình, đổi theo bảng màu (màu khác giữ nguyên) → canvas riêng cho hình đó
  function toMat(h, diem, doi){
    try {
      const c = document.createElement('canvas'); c.width = h.sw; c.height = h.sh;
      const g = c.getContext('2d'); g.drawImage(h.img, h.sx, h.sy, h.sw, h.sh, 0, 0, h.sw, h.sh);
      const d = g.getImageData(0, 0, h.sw, h.sh), a = d.data, map = {};
      for (const k in doi) map[k.toLowerCase()] = hex(doi[k]);
      let n = 0;
      for (const [x, y] of diem){
        const i = (y * h.sw + x) * 4; if (!a[i + 3]) continue;
        const k = '#' + [a[i], a[i + 1], a[i + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
        const m = map[k]; if (m){ a[i] = m[0]; a[i + 1] = m[1]; a[i + 2] = m[2]; n++; }
      }
      g.putImageData(d, 0, 0);
      return n ? {img:c, sx:0, sy:0, sw:h.sw, sh:h.sh} : h;
    } catch (e){ return h; }   // ảnh bị khoá (mở file://) → giữ màu gốc
  }
  async function napClip(ten){
    const d = J.clip[ten]; const C = {ten, def:d, hinh:[], ok:false, tam:!!d.tam, ti_le:d.ti_le || TL, chan:d.chan || [0, 0]};
    CLIP[ten] = C;
    try {
      const xep = d.xep || 'hang';
      if (xep === 'tung_file'){
        const ds = await Promise.all(d.anh.map(a => napAnh(GOC + a)));
        if (ds.some(i => !i)) throw 'thiếu ảnh';
        C.hinh = ds.map(i => ({img:i, sx:0, sy:0, sw:i.width, sh:i.height}));
      } else {
        const img = await napAnh(GOC + d.anh); if (!img) throw 'không nạp được ' + d.anh;
        if (xep === 'tung_khung') C.hinh = d.khung.map(k => ({img, sx:k[0], sy:k[1], sw:k[2], sh:k[3]}));
        else {
          const [w, h] = d.o, cot = xep === 'luoi' ? (d.cot || Math.floor(img.width / w)) : Math.floor(img.width / w);
          const n = d.so_hinh || cot * Math.floor(img.height / h);
          for (let i = 0; i < n; i++) C.hinh.push({img, sx:(i % cot) * w, sy:Math.floor(i / cot) * h, sw:w, sh:h});
        }
      }
      if (OPT.mat && d.mat && d.mat.diem) C.hinh = C.hinh.map((h, i) => d.mat.diem[i] && d.mat.diem[i].length ? toMat(h, d.mat.diem[i], d.mat.doi || {}) : h);
      // thời lượng từng hình (ms) cho clip phát theo thời gian
      const n = C.hinh.length;
      C.ms = Array.isArray(d.ms) ? d.ms.slice(0, n) : Array(n).fill(d.ms || (d.fps ? 1000 / d.fps : 100));
      while (C.ms.length < n) C.ms.push(C.ms[C.ms.length - 1] || 100);
      C.tong = C.ms.reduce((a, b) => a + b, 0); C.lap = d.lap !== undefined ? !!d.lap : true;
      // pha đòn: chỉ số khung từng pha – từ "pha", hoặc suy từ "manh", hoặc chia mặc định ≈ 1/3 lấy đà · 1/6 ra đòn · còn lại hồi
      if (d.pha) C.pha = {layda:d.pha.layda || [], rado:d.pha.rado || [], hoi:d.pha.hoi || []};
      else if (d.manh && d.manh.length){ const a = Math.min(...d.manh), b = Math.max(...d.manh), r = (u, v) => Array.from({length:Math.max(0, v - u)}, (_, i) => u + i);
        C.pha = {layda:r(0, a), rado:r(a, b + 1), hoi:r(b + 1, n)}; }
      else { const a = Math.round(n * 0.34), b = a + Math.max(1, Math.round(n * 0.17)), r = (u, v) => Array.from({length:Math.max(0, Math.min(v, n) - u)}, (_, i) => u + i);
        C.pha = {layda:r(0, a), rado:r(a, b), hoi:r(b, n)}; }
      C.ok = n > 0;
    } catch (e){ C.loi = String(e); }
    return C;
  }
  async function nap(urlJson){
    GOC = urlJson.slice(0, urlJson.lastIndexOf('/') + 1);
    J = await fetch(urlJson).then(r => r.json());
    TL = J.ti_le_mac_dinh || 2;
    const can = new Set(); for (const ds of Object.values(J.trang_thai || {})) for (const t of ds) if (J.clip[t]) can.add(t);
    await Promise.all([...can].map(napClip));
    return J;
  }
  // clip dùng cho một trạng thái (null = không có → khối màu)
  function chon(trangThai){
    const ds = (J && J.trang_thai[trangThai]) || [trangThai];
    for (const t of ds) if (CLIP[t] && CLIP[t].ok) return CLIP[t];
    return null;
  }
  // vẽ hình k của clip C, CHÂN tại (fx, fy) px logic, lat = quay trái
  function ve(g, C, k, fx, fy, lat, alpha){
    const h = C.hinh[Math.max(0, Math.min(C.hinh.length - 1, k))], s = C.ti_le;
    const cx = Math.round(C.chan[0] * s), cy = Math.round(C.chan[1] * s);
    fx = Math.round(fx); fy = Math.round(fy);
    if (alpha !== undefined) g.globalAlpha = alpha;
    if (!lat) g.drawImage(h.img, h.sx, h.sy, h.sw, h.sh, fx - cx, fy - cy, h.sw * s, h.sh * s);
    else { g.save(); g.translate(fx, 0); g.scale(-1, 1); g.drawImage(h.img, h.sx, h.sy, h.sw, h.sh, -cx, fy - cy, h.sw * s, h.sh * s); g.restore(); }
    if (alpha !== undefined) g.globalAlpha = 1;
  }
  function danhSach(){ return Object.values(CLIP).map(C => ({ten:C.ten, ok:C.ok, tam:C.tam, n:C.hinh.length, loi:C.loi})); }
  return {nap, chon, ve, danhSach, CLIP, OPT, get json(){ return J; }};
})();
