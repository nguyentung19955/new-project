'use strict';
/* =====================================================================================================================
   sprite-mn.js – NẠP + VẼ hình từng file (fNN.png / cNN.png) theo manifest JSON. Không biết luật game.
   Một "clip" = {thu_muc, tien_to:'f', so_hinh, bat_dau:0, ms, lap, chan:[x,y]}  (xem GHI-CHU.md).
   Thiếu thư mục / thiếu ảnh KHÔNG làm hỏng trang: clip.ok = false → nơi gọi tự vẽ khối màu.
   ===================================================================================================================== */
const SpriteMN = (() => {
  const BUSTER = Date.now();   // chống bộ nhớ đệm (githack/điện thoại giữ ảnh cũ)
  const pad = n => String(n).padStart(2, '0');
  function napAnh(src){
    return new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src + '?v=' + BUSTER; });
  }
  // ms (số hoặc mảng) → mảng đúng n phần tử
  function msMang(ms, n){
    const a = Array.isArray(ms) ? ms.slice(0, n) : Array(n).fill(ms || 100);
    while (a.length < n) a.push(a[a.length - 1] || 100);
    return a;
  }
  // (camgiac) XEM THỬ chu kỳ chạy mới 10 khung (chờ người dùng duyệt): mở trang bất kỳ có ?chay=moi (nhớ trên máy), ?chay=cu = về bản cũ.
  // Clip có "ban_thu" (vd troi) sẽ dùng bản thử đó thay bản chính. Chưa bật = y như cũ.
  function chayMoi(){
    try { const q = new URLSearchParams(location.search).get('chay');
      if (q === 'moi') localStorage.setItem('tvcc-chay-moi', '1'); else if (q === 'cu') localStorage.removeItem('tvcc-chay-moi');
      return localStorage.getItem('tvcc-chay-moi') === '1'; } catch (e){ return false; }
  }
  async function napClip(goc, def, ten){
    if (def && def.ban_thu && chayMoi()) def = Object.assign({}, def, def.ban_thu, {ban_thu:null});
    const C = {ten, def:def || {}, hinh:[], ok:false, chan:null, ms:[], buoc:[], tong:0, lap:!def || def.lap !== false, loi:''};
    if (!def || !def.thu_muc){ C.loi = 'not declared'; C.ms = msMang(def && def.ms, 9); C.buoc = C.ms.map(m => m * 0.06); C.tong = C.buoc.reduce((a, b) => a + b, 0); return C; }
    const tt = def.tien_to ?? 'f', bd = def.bat_dau || 0, dir = goc + String(def.thu_muc).replace(/\/$/, '') + '/';
    if (def.so_hinh){
      const ds = await Promise.all(Array.from({length:def.so_hinh}, (_, i) => napAnh(dir + tt + pad(bd + i) + '.png')));
      C.hinh = ds.filter(Boolean);
      if (C.hinh.length < ds.length) C.loi = 'missing ' + (ds.length - C.hinh.length) + '/' + ds.length + ' frames';
    } else {   // không ghi so_hinh: dò f00, f01… tới khi hết (từng lô 8 ảnh)
      for (let i = 0; i < 64; i += 8){
        const ds = await Promise.all(Array.from({length:8}, (_, j) => napAnh(dir + tt + pad(bd + i + j) + '.png')));
        const het = ds.indexOf(null);
        C.hinh.push(...(het < 0 ? ds : ds.slice(0, het)));
        if (het >= 0) break;
      }
      if (!C.hinh.length) C.loi = 'not found ' + dir + tt + pad(bd) + '.png';
    }
    C.ok = C.hinh.length > 0;
    // thiếu ảnh vẫn tính thời gian theo so_hinh / ms (gameplay không đổi, chỉ vẽ khối màu)
    const n = C.ok ? C.hinh.length : (def.so_hinh || (Array.isArray(def.ms) ? def.ms.length : 9));
    if (C.ok){ const w = C.hinh[0].width, h = C.hinh[0].height; C.chan = def.chan || [Math.round(w / 2), h - 2]; }
    C.ms = msMang(def.ms, n);
    C.buoc = C.ms.map(m => m * 0.06);          // ms → bước 60 Hz
    C.tong = C.buoc.reduce((a, b) => a + b, 0);
    return C;
  }
  // hình ở thời điểm t (bước 60 Hz) – lap: lặp; không lặp: giữ hình cuối
  function khungTheoBuoc(C, t){
    if (!C || !C.buoc.length) return 0;
    const n = C.buoc.length; let m = C.lap ? t % C.tong : Math.min(t, C.tong - 0.001), k = 0;
    while (k < n - 1 && m >= C.buoc[k]){ m -= C.buoc[k]; k++; }
    return k;
  }
  // (camgiac) khung theo QUÃNG ĐƯỜNG (px logic) cho clip có "quang_chu_ky" (vd chạy): 1 vòng hoạt ảnh = quang_chu_ky px; khung bắt đầu = "khung_dau"
  function khungTheoQuang(C, q){
    const n = C && C.hinh.length || (C && C.buoc.length) || 1, L = C && C.def && C.def.quang_chu_ky; if (!L) return 0;
    return (Math.floor(q / L * n) + (C.def.khung_dau || 0)) % n;
  }
  // bóng trắng của một ảnh (chớp khi trúng đòn) – tạo 1 lần rồi giữ
  const TRANG = new WeakMap();
  function trangHoa(img){
    let c = TRANG.get(img); if (c) return c;
    c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
    TRANG.set(img, c); return c;
  }
  // (camgiac) làm tròn điểm neo theo ĐIỂM ẢNH THẬT của canvas (không theo px logic): canvas iPhone 2,17 điểm/px logic → làm tròn px logic làm hình nhích bậc 2 điểm
  function tron(g, v, truc){
    const m = g.getTransform ? g.getTransform() : null;
    if (!m || m.b !== 0 || m.c !== 0) return Math.round(v);
    const k = truc ? m.d : m.a, e = truc ? m.f : m.e; if (!(k > 0)) return Math.round(v);
    return (Math.round(e + k * v) - e) / k;
  }
  // vẽ hình k của clip C, ĐIỂM NEO (chân) tại (fx, fy) px logic; lat = lật gương quanh điểm neo; s = px logic / điểm ảnh
  function ve(g, C, k, fx, fy, lat, s, alpha, trang){
    let img = C.hinh[Math.max(0, Math.min(C.hinh.length - 1, k))];
    if (trang) img = trangHoa(img);
    const cx = C.chan[0] * s, cy = C.chan[1] * s;
    fx = tron(g, fx, 0); fy = tron(g, fy, 1);
    if (alpha !== undefined) g.globalAlpha = alpha;
    if (!lat) g.drawImage(img, fx - cx, fy - cy, img.width * s, img.height * s);
    else { g.save(); g.translate(fx, 0); g.scale(-1, 1); g.drawImage(img, -cx, fy - cy, img.width * s, img.height * s); g.restore(); }
    if (alpha !== undefined) g.globalAlpha = 1;
  }
  // viền sáng quanh hình (để quái nổi trên nền tối): bóng màu `mau` lệch 4 phía d px
  const VIEN = new Map();
  function toMau(img, mau){
    const key = mau; let m = VIEN.get(img); if (!m){ m = {}; VIEN.set(img, m); }
    if (m[key]) return m[key];
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = mau; g.fillRect(0, 0, c.width, c.height);
    return (m[key] = c);
  }
  function veVien(g, C, k, fx, fy, lat, s, mau, d, alpha){
    const img = C.hinh[Math.max(0, Math.min(C.hinh.length - 1, k))]; if (!img) return;
    const t = toMau(img, mau), cx = C.chan[0] * s, cy = C.chan[1] * s;
    fx = tron(g, fx, 0); fy = tron(g, fy, 1); g.save(); g.globalAlpha = alpha ?? 1;
    if (lat){ g.translate(fx, 0); g.scale(-1, 1); fx = 0; }
    for (const [ox, oy] of [[-d, 0], [d, 0], [0, -d], [0, d]]) g.drawImage(t, fx - cx + ox, fy - cy + oy, img.width * s, img.height * s);
    g.restore();
  }
  async function napJson(url){ return fetch(url + '?v=' + BUSTER, {cache:'no-store'}).then(r => r.json()); }
  return {napClip, napJson, khungTheoBuoc, khungTheoQuang, chayMoi, ve, veVien, msMang};
})();
