// TURRET MERGE — vẽ: mọi hình là ảnh ChatGPT trong assets/; code chỉ vẽ hạt, quầng sáng, bóng, chữ, thanh máu
'use strict';

// bộ đếm bộ nhớ canvas (Safari iOS có trần tổng bộ nhớ canvas; vượt trần → canvas mới trắng/null, ảnh lỗi giải mã):
// ghi nhận mọi <canvas> tạo ra bằng WeakRef → REN.boNho() cộng số điểm ảnh của các canvas còn sống
const _DS_CV = [];
(() => {
  if (typeof WeakRef === 'undefined') return;
  const goc = document.createElement.bind(document);
  let dem = 0;
  document.createElement = function (ten, o) {
    const e = goc(ten, o);
    if (typeof ten === 'string' && ten.toLowerCase() === 'canvas') {
      _DS_CV.push(new WeakRef(e));
      if (++dem % 3000 === 0) for (let i = _DS_CV.length - 1; i >= 0; i--) { const c = _DS_CV[i].deref(); if (!c || !c.width) _DS_CV.splice(i, 1); }
    }
    return e;
  };
})();
// màu vệt đạn theo ảnh đạn
const MAU_VET = { dan_lien: '#ffb347', dan_bang: '#8fe3ff', dan_doc: '#8dff4a', dan_tia: '#7fd0ff', tia_lua: '#ffc070' };
const REN = {
  dbg: /[?&]debug(=|&|$)/.test(location.search), // ?debug: cho phép hình vẽ code dự phòng khi thiếu ảnh (chỉ để gỡ lỗi)
  cv: null, ctx: null, s: 1, dpr: 1, anh: {}, nen: null, xam: {}, trang: {}, cham: {}, cache: {}, t: 0, thieu: new Set(), dt: 0, a: 1, _vet: {}, _glow: {},

  init(cv) {
    // NỀN TĨNH = 1 canvas DOM riêng (#cv-nen) nằm DƯỚI canvas trận, dựng 1 lần (lamNen). Canvas trận trong suốt: mỗi khung chỉ
    // xoá + vẽ vật động. Trước đây mỗi khung vẽ lại cả tấm nền phóng 2×→3× (lọc 'high') ≈ 45% thời gian vẽ → máy nóng (tuvan/nong).
    this.nen = document.createElement('canvas'); this.nen.id = 'cv-nen'; this.nen.setAttribute('aria-hidden', 'true'); this.nen.width = this.nen.height = 0;
    cv.parentNode.insertBefore(this.nen, cv);
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.coLai(); // đổi cỡ/xoay/pageshow/visualViewport: taitai.js hoiKhung() gọi lại coLai()
    if (document.fonts) document.fonts.addEventListener('loadingdone', () => { this._chu = null; this._glyph = null; this.donCache(); }); // phông về muộn: dựng lại ảnh chữ
    // quay lại trang/tab (iOS có thể đã xoá vùng nhớ canvas khi chạy nền) → dựng lại nền; ảnh lỗi → thử tải lại ngay
    const hoi = () => { if (document.hidden) return; this.thuLaiLoi(); if (G.ban.length) this.lamNen(); };
    document.addEventListener('visibilitychange', hoi); addEventListener('pageshow', hoi);
  },
  // iOS Safari: trần tổng bộ nhớ canvas thấp → canvas lớn (nền) giữ ≤ 2×
  laIOS: /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  // ---------- bộ nhớ đệm ảnh thu nhỏ: 2 THẾ HỆ theo ngân sách điểm ảnh ----------
  // vượt ngân sách → thế hệ hiện tại thành "cũ", bắt đầu thế hệ mới; tra trúng ở thế hệ cũ → chuyển lên mới (không dựng lại).
  // Ảnh không dùng nữa (ụ đã bán/không còn trên bàn, cỡ cũ) tự rơi khỏi bộ nhớ sau 2 lần xoay → tổng ≤ ~2 × ngân sách.
  _cacheCu: {}, _cachePx: 0,
  nganSach() { return (this.laIOS ? 6 : 9) * 1048576 * Math.min(1, this.dpr * this.dpr / 9) * 9 / 4; }, // điểm ảnh (≈ 13.5 MB iOS / 20 MB máy khác mỗi thế hệ ở 3×)
  cGet(key) {
    let c = this.cache[key]; if (c) return c;
    c = this._cacheCu[key]; if (!c) return null;
    delete this._cacheCu[key]; this.cache[key] = c; this._cachePx += c.width * c.height; return c;
  },
  cSet(key, c) {
    if (!c) return c;
    this._cachePx += c.width * c.height;
    if (this._cachePx > this.nganSach() || Object.keys(this.cache).length > 900) { this._cacheCu = this.cache; this.cache = {}; this._cachePx = c.width * c.height; }
    return (this.cache[key] = c);
  },
  donCache() { this.cache = {}; this._cacheCu = {}; this._cachePx = 0; if (this._nongCo) this._nongCo.clear(); },
  // Độ phân giải vẽ = đúng mật độ điểm ảnh thật của máy (tối đa 3×). Trước đây kẹp 2× → máy 3× (iPhone, nhiều Android)
  // phải phóng ảnh 1.5× → mọi hình mềm nhoè, viền răng cưa. Máy yếu (khung > 18 ms kéo dài) tự lùi về 2×.
  coLai() {
    const vw = innerWidth || document.documentElement.clientWidth, vh = innerHeight || document.documentElement.clientHeight;
    if (!(vw > 0 && vh > 0)) { if (typeof hoiKhung === 'function') setTimeout(() => hoiKhung(true), 50); return; } // Safari chưa có viewport → thử lại
    this.s = Math.min(vw / W, vh / H);
    const thuc = devicePixelRatio || 1;
    this.dpr = Math.max(1, Math.min(this.dprMax || 3, G.debug && G.debug.dpr ? G.debug.dpr : thuc));
    const wrap = document.getElementById('wrap');
    // đặt khung ở toạ độ NGUYÊN điểm ảnh thiết bị (không dùng translate -50%): lệch nửa điểm ảnh làm trình duyệt
    // nội suy lại cả canvas lẫn chữ → nhoè toàn màn
    const L = Math.round((vw - W * this.s) / 2 * thuc) / thuc, T = Math.round((vh - H * this.s) / 2 * thuc) / thuc;
    wrap.style.left = L + 'px'; wrap.style.top = T + 'px';
    wrap.style.transformOrigin = '0 0'; wrap.style.transform = 'scale(' + this.s + ')';
    this.cv.width = Math.round(W * this.s * this.dpr); this.cv.height = Math.round(H * this.s * this.dpr);
    // cỡ CSS khớp CHÍNH XÁC số điểm ảnh canvas → 1 điểm canvas = 1 điểm màn (không bị kéo giãn/lọc lại)
    const r = thuc / this.dpr;
    this.cv.style.width = (this.cv.width * r / (this.s * thuc)) + 'px'; this.cv.style.height = (this.cv.height * r / (this.s * thuc)) + 'px';
    this.nen.style.width = this.cv.style.width; this.nen.style.height = this.cv.style.height;
    this.min(this.ctx); this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round'; // nét vẽ (vòng, tia, sét) đầu tròn, khử răng cưa
    this.donCache(); this._chu = null; this._glyph = null;
    if (G.ban.length) this.lamNen();
  },
  // làm tròn toạ độ logic về điểm ảnh thiết bị (UI tĩnh: tấm tên, khung) → ảnh không bị lọc lại lệch nửa điểm ảnh (nhoè)
  px(v) { const k = this.s * this.dpr; return Math.round(v * k) / k; },
  // bật lọc ảnh chất lượng cao cho mọi ngữ cảnh vẽ 2D
  min(x) { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; return x; },
  c2d(c) { return this.min(c.getContext('2d')); },
  // ĐỘ PHÂN GIẢI THÍCH ỨNG (chống nóng máy — tuvan/nong): bắt đầu đúng mật độ thật (3× nét); máy GỒNG kéo dài → lùi 2× (rồi 1,5× chỉ
  // khi bật Tiết kiệm pin hoặc máy 2×). "Gồng" = khoảng khung > 1,3 × mục tiêu (16,7 ms; 33 ms khi tiết kiệm pin) suốt 4 s, HOẶC JS > 11 ms.
  // Trước đây chỉ xét JS → Safari vẽ canvas ngoài JS nên không bao giờ lùi dù máy nóng. Khoá 30 Hz đều của "Nguồn điện thấp"
  // (khung ~33 ms, rất đều) KHÔNG tính là gồng → không mờ oan. Đang kéo/ghép: không dựng lại canvas giữa chừng.
  doKhung(dt) {
    if (!G.ban.length || G.dung || !(dt > 0) || dt > 0.1 || (G.debug && G.debug.dpr)) return;
    if ((typeof UI !== 'undefined' && UI.keo) || (typeof GF !== 'undefined' && (GF.cam || GF.mg.length || GF.ve.length))) return;
    const tk = typeof TKP !== 'undefined' && TKP.on(), muc = tk ? 1 / 30 : 1 / 60, v = (this._viec || 0) / 1000;
    this._ft = this._ft == null ? dt : this._ft * 0.96 + dt * 0.04;
    this._fj = this._fj == null ? 0 : this._fj * 0.96 + Math.abs(dt - this._ft) * 0.04;
    this._fv = this._fv == null ? v : this._fv * 0.96 + v * 0.04;
    const khoa30 = !tk && Math.abs(this._ft - 1 / 30) < 0.003 && this._fj < 0.0025;
    const nang = (this._ft > muc * 1.3 && !khoa30) || this._fv > 0.011;
    if (typeof TKP !== 'undefined') TKP.baoNang(dt, nang);
    const san = tk || (devicePixelRatio || 1) <= 2 ? 1.5 : 2;
    if (this.dpr <= san) return;
    if (nang) {
      if ((this._cham = (this._cham || 0) + dt) > 4) { this.dprMax = this.dpr > 2 ? 2 : 1.5; this._ft = this._fv = this._fj = null; this._cham = 0; this.coLai(); }
    } else this._cham = Math.max(0, (this._cham || 0) - dt * 2);
  },
  // thu nhỏ chất lượng cao: giảm một nửa nhiều bước (mỗi bước lọc 'high') tới khi còn ≤ 2× đích, rồi mới vẽ lần cuối
  // → không lấm tấm/răng cưa như khi thu 1 lần từ ảnh 256–1290 px xuống vài chục px
  // tầng trung gian dùng 2 canvas NHÁP cố định (đổi lượt nhau, chỉ lớn thêm, ≤ 1 M điểm mỗi cái) thay vì tạo canvas mới mỗi tầng:
  // trước đây ~600 canvas tạo-rồi-bỏ mỗi phút trận → bộ nhớ ngoài tăng vọt → trình duyệt dọn rác dồn 40–140 ms (tuvan/giat-ghep)
  _nhap: [null, null], NHAP_MAX: 1 << 20,
  nhap(i, w, h) {
    if (w * h > this.NHAP_MAX) { const t = document.createElement('canvas'); t.width = w; t.height = h; return t; }
    let c = this._nhap[i];
    if (!c) { c = this._nhap[i] = document.createElement('canvas'); c._nhap = true; c.width = w; c.height = h; c._x = c.getContext('2d'); }
    else if (c.width < w || c.height < h) {
      const nw = Math.max(c.width, w), nh = Math.max(c.height, h);
      if (nw * nh > this.NHAP_MAX) { c.width = w; c.height = h; } else { c.width = nw; c.height = nh; }
      c._x = c.getContext('2d');
    } else { c._x.setTransform(1, 0, 0, 1, 0, 0); c._x.globalAlpha = 1; c._x.globalCompositeOperation = 'source-over'; c._x.filter = 'none'; c._x.clearRect(0, 0, w, h); }
    return c;
  },
  thuNho(a, sx, sy, sw, sh, nw, nh) {
    let src = a, x0 = sx, y0 = sy, w = sw, h = sh, lan = 0;
    while (w >= nw * 2 && h >= nh * 2 && w > 4 && h > 4) {
      const w2 = Math.max(1, Math.round(w / 2)), h2 = Math.max(1, Math.round(h / 2));
      const t = this.nhap(lan++ & 1, w2, h2);
      const tx = t._nhap ? t._x : this.c2d(t); tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high';
      tx.drawImage(src, x0, y0, w, h, 0, 0, w2, h2);
      if (src !== a && !src._nhap) src.width = src.height = 0; // trả bộ nhớ tầng trung gian ngay (Safari chỉ thu canvas rác rất muộn)
      src = t; x0 = 0; y0 = 0; w = w2; h = h2;
    }
    return [src, x0, y0, w, h];
  },
  // vẽ a (vùng sx,sy,sw,sh) vào ngữ cảnh x tại (dx,dy,dw,dh) — dw,dh tính bằng điểm ảnh thiết bị
  veNho(x, a, sx, sy, sw, sh, dx, dy, dw, dh) {
    const [s2, x0, y0, w, h] = this.thuNho(a, sx, sy, sw, sh, dw, dh);
    x.drawImage(s2, x0, y0, w, h, dx, dy, dw, dh);
    if (s2 !== a && !s2._nhap) s2.width = s2.height = 0;
  },
  // chuỗi mipmap của 1 ảnh/canvas (mỗi tầng = ½ tầng trên): vẽ cỡ thay đổi từng khung (khói, hiệu ứng, tia, biểu tượng…)
  // lấy tầng nhỏ nhất vẫn ≥ cỡ cần (điểm ảnh thiết bị) → GPU chỉ thu ≤ 2× → mịn, không nhấp nháy
  mip(a, can) {
    if (!a || !(can > 0)) return a;
    const ch = a._mip || (a._mip = [a]);
    let i = 0;
    for (;;) {
      const c = ch[i], d = Math.min(c.width, c.height);
      if (d / 2 < can || d < 8) return c;
      if (!ch[i + 1]) {
        const t = document.createElement('canvas'); t.width = Math.max(1, Math.round(c.width / 2)); t.height = Math.max(1, Math.round(c.height / 2));
        this.c2d(t).drawImage(c, 0, 0, t.width, t.height); ch[i + 1] = t;
      }
      i++;
    }
  },

  // tổng bộ nhớ canvas còn sống (MB, 4 byte/điểm) + canvas lớn nhất + ảnh gốc còn giữ bản giải mã
  boNho() {
    let px = 0, n = 0, lon = 0;
    for (let i = _DS_CV.length - 1; i >= 0; i--) {
      const c = _DS_CV[i].deref();
      if (!c || !c.width) { _DS_CV.splice(i, 1); continue; }
      const p = c.width * c.height; px += p; n++; if (p > lon) lon = p;
    }
    let anh = 0; for (const k in this.anh) { const a = this.anh[k]; if (a instanceof Image && a.naturalWidth) anh += a.naturalWidth * a.naturalHeight; }
    return { canvasMB: +(px * 4 / 1048576).toFixed(1), soCanvas: n, lonNhatMB: +(lon * 4 / 1048576).toFixed(1), anhGocMB: +(anh * 4 / 1048576).toFixed(1) };
  },

  // ---------- ảnh ----------
  // Tải ảnh. Lỗi (mạng chập chờn / Safari iOS hết bộ nhớ giải mã) → THỬ LẠI với giãn cách tăng dần (1 s, 2 s, 4 s … ≤ 30 s),
  // không bao giờ bỏ cuộc vĩnh viễn; tải xong → nếu nền đang vẽ tạm (thiếu khay/đường) thì dựng lại nền ngay.
  taiAnh(ten, lan) {
    const a = new Image(); a.decoding = 'async';
    a._lan = lan || 0;
    a.onerror = () => {
      a._loi = true; this.thieu.add(ten);
      if (typeof TAI !== 'undefined') TAI.loiAnh(); // lỗi tải giữa trận → kiểm tra mất mạng
      clearTimeout(a._hen);
      if (a._lan >= 7 && !this.CO_DINH.has(ten)) return; // ảnh thật sự không có (404): thôi sau ~2 phút; ảnh nền thì thử mãi
      a._hen = setTimeout(() => { if (this.anh[ten] === a) this.taiAnh(ten, a._lan + 1); }, Math.min(30000, 1000 * 2 ** Math.min(5, a._lan)));
    };
    a.onload = () => { a._loi = false; this.thieu.delete(ten); if (this._choNen && /^(khay|duong_)/.test(ten)) this.lamNen(); };
    const gia = G.debug && G.debug.hongKhay > a._lan && ten === 'khay'; // kiểm thử: giả lỗi tải
    // ?v=<băm nội dung> (js/ver-anh.js do tools/thap-ver.py dán lúc xuất bản): ảnh đổi → URL đổi → điện thoại không dùng bản cũ trong bộ đệm
    // anhUrl (taitai.js): bản .webp nén lúc xuất bản nếu có (ANH_W), không thì .png?v=băm — cùng URL với màn tải → không tải 2 lần
    const u = gia ? 'assets/__gia_loi__.png' : (typeof anhUrl === 'function' ? anhUrl(ten) : 'assets/' + ten + '.png' + (typeof ANH_V !== 'undefined' && ANH_V[ten] ? '?v=' + ANH_V[ten] : ''));
    const uu = u + (a._lan ? (u.indexOf('?') >= 0 ? '&' : '?') + 'r=' + a._lan : '');
    // khởi động: ảnh canvas (trận) gọi sớm từ các tệp js → hoãn tới khi HOME đã hiện (không giành băng thông với màn HOME)
    if (!(typeof TAI !== 'undefined' && TAI.hoan && TAI.hoan(a, uu, ten))) a.src = uu;
    this.anh[ten] = a;
    return a;
  },
  // thử lại NGAY mọi ảnh đang lỗi (quay lại trang, mạng về)
  thuLaiLoi() { for (const k in this.anh) { const a = this.anh[k]; if (a._loi) { clearTimeout(a._hen); this.taiAnh(k, a._lan + 1); } } },
  img(ten) {
    let a = this.anh[ten] || this.taiAnh(ten);
    if (a._cv) return a._cv;
    if (!(a.complete && a.naturalWidth && !a._loi)) return null;
    // chép sang canvas 1 lần: vẽ từ canvas không đụng bộ nhớ đệm giải mã ảnh của trình duyệt (bị dọn → giải mã lại mỗi khung)
    const c = document.createElement('canvas'); c.width = a.naturalWidth; c.height = a.naturalHeight;
    const x = c.getContext('2d');
    if (!x) { c.width = c.height = 0; return a; } // hết trần bộ nhớ canvas: vẽ thẳng từ ảnh còn hơn trả null
    this.min(x).drawImage(a, 0, 0);
    // bỏ đối tượng Image (bản giải mã của trình duyệt) → chỉ còn 1 bản điểm ảnh trong bộ nhớ thay vì 2
    a.onload = a.onerror = null;
    this.anh[ten] = { _cv: c, complete: true, naturalWidth: c.width, naturalHeight: c.height };
    return c;
  },
  napTruoc(ds) { return Promise.all(ds.map(t => new Promise(ok => { const a = this.anh[t] || this.taiAnh(t); if (a.complete) ok(); else { a.addEventListener('load', ok, { once: true }); a.addEventListener('error', ok, { once: true }); } }))); },
  // trận mới: bỏ mọi ảnh/bộ đệm của ụ, chỉ huy, hiệu ứng KHÔNG thuộc danh sách cần dùng (bộ bài khác của trận trước)
  chiGiu(ds) {
    const giu = new Set(ds);
    for (const k in this.anh) if (!giu.has(k) && !this.CO_DINH.has(k) && this.anh[k]._cv) delete this.anh[k];
    for (const k in this.trang) if (!giu.has(k)) delete this.trang[k];
    for (const k in this.xam) if (!k.startsWith('diu|') && !giu.has(k)) delete this.xam[k];
    this.donCache(); this._chu = null; this._glyph = null;
  },
  // ảnh TÌNH HUỐNG (hào quang buff, nổ/tia riêng của vài ụ, đồ vật kỹ năng): không bắt màn tải đợi giải mã trước trận —
  // tải khi vẽ lần đầu (img() tự tải), chỉ ảnh thật sự xuất hiện mới chiếm bộ nhớ. Ảnh đã cắt lại ở 3× nặng hơn → giữ ngân sách iOS.
  LUOI: /^(fxb_|hu_|pandora_dia$|fx_(dien|laser_trung|khoi_doc|bang_vo|link|awaken)$)/,
  boLuoi(ds) { return ds.filter(t => !this.LUOI.test(t)); },
  CO_DINH: new Set(['khay', 'duong_thang', 'duong_goc', 'duong_nga3', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana']),
  // bản trắng (chớp khi trúng đòn) / bản xám (hoá đá) — dựng 1 lần, dùng lại
  banTrang(ten) {
    if (this.trang[ten]) return this.trang[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); // vetay-ok: png (bản trắng của ảnh)
    return (this.trang[ten] = c);
  },
  banXam(ten) {
    if (this.xam[ten]) return this.xam[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.85 + 18; p[i] = l * 1.02; p[i + 1] = l; p[i + 2] = l * 0.94; }
    x.putImageData(d, 0, 0); // vetay-ok: png (bản xám của ảnh)
    return (this.xam[ten] = c);
  },
  // ảnh đã thu nhỏ sẵn đúng cỡ vẽ (px logic) — vẽ 1:1 nhanh hơn nhiều trên điện thoại; bien: '' | 'xam' | 'trang' | 'den'
  co(ten, px, bien) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(px * k)), key = ten + '|' + n + '|' + (bien || '');
    let c = this.cGet(key); if (c) return c;
    if (bien === 'xam' || bien === 'trang') { // biến thể dựng từ bản ĐÃ THU NHỎ (không giữ bản trắng/xám cỡ gốc)
      const b = this.co(ten, px, ''); if (!b) return null;
      return this.cSet(key, this.toBien(b, bien));
    }
    const a = this.img(ten);
    if (!a) return null;
    const w = a.width, h = a.height, nw = Math.max(2, Math.round(n * w / Math.max(w, h))), nh = Math.max(2, Math.round(n * h / Math.max(w, h)));
    c = document.createElement('canvas'); c.width = nw; c.height = nh;
    const x = this.c2d(c);
    if (bien === 'den') { x.filter = 'blur(' + Math.max(1, n / 40) + 'px)'; this.veNho(x, a, 0, 0, w, h, 0, 0, nw, nh); x.filter = 'none'; x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, nw, nh); } // vetay-ok: png (bóng = ảnh tô đen)
    else this.veNho(x, a, 0, 0, w, h, 0, 0, nw, nh);
    return this.cSet(key, c);
  },
  // bản trắng (source-in) / xám (độ sáng) của 1 canvas đã thu nhỏ
  toBien(b, bien) {
    const c = document.createElement('canvas'); c.width = b.width; c.height = b.height;
    const x = c.getContext('2d'); x.drawImage(b, 0, 0);
    if (bien === 'trang') { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } // vetay-ok: png
    else {
      const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.85 + 18; p[i] = l * 1.02; p[i + 1] = l; p[i + 2] = l * 0.94; }
      x.putImageData(d, 0, 0); // vetay-ok: png
    }
    for (const q of ['nf', 'fm', 'gap']) if (b[q] != null) c[q] = b[q];
    return c;
  },
  // dải khung (quái/trùm 4 khung) thu nhỏ sẵn TỪNG KHUNG riêng, cách nhau 2 px trong suốt: cỡ khung nguyên điểm ảnh,
  // không lấy lẹm điểm ảnh khung bên cạnh khi lọc (trước đây dải 768 px thu về bề rộng lẻ → mép khung lem/nhoè)
  coDai(ten, px, bien) {
    const k = this.s * this.dpr, m = Math.max(2, Math.round(px * k)), key = 'dai|' + ten + '|' + m + '|' + (bien || '');
    let c = this.cGet(key); if (c) return c;
    if (bien === 'trang') { const b = this.coDai(ten, px, ''); return b ? this.cSet(key, this.toBien(b, 'trang')) : null; }
    const a = this.img(ten); if (!a) return null;
    const n = Math.max(1, Math.round(a.width / a.height)), fw = a.width / n, G2 = 2;
    c = document.createElement('canvas'); c.width = n * (m + G2); c.height = m;
    const x = this.c2d(c);
    for (let i = 0; i < n; i++) this.veNho(x, a, Math.round(i * fw), 0, Math.round(fw), a.height, i * (m + G2), 0, m, m);
    c.nf = n; c.fm = m; c.gap = G2;
    return this.cSet(key, c);
  },
  // vẽ ảnh thu nhỏ sẵn ở tâm (0,0) với cỡ px
  ve1(ctx, ten, px, bien, ox, oy) { const c = this.co(ten, px, bien); if (!c) return false; const h = px * c.height / c.width; ctx.drawImage(c, (ox || 0) - px / 2, (oy || 0) - h / 2, px, h); return true; },
  // ẢNH PNG TÔ MÀU (QUY-TAC-HINH mục 3: tô màu ảnh ChatGPT trắng) — dựng 1 lần mỗi màu; ảnh chưa tải → canvas rỗng (không vẽ gì)
  toMauA(ten, mau, a) {
    const M = this._toMau || (this._toMau = {}), key = ten + '|' + mau + '|' + (a || 0.78);
    if (M[key]) return M[key];
    const im = this.img(ten); if (!im) return this.rong();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = a || 0.78; x.fillStyle = mau; x.fillRect(0, 0, c.width, c.height); // vetay-ok: png (tô màu ảnh trắng fx_*)
    return (M[key] = c);
  },
  // thanh máu = h2_thanh.png: nền tô đen + phần đầy CẮT theo tỉ lệ, tô màu (QUY-TAC-HINH mục 3)
  thanhAnh(ctx, x, y, w, h, u, mau) {
    const nen = this.toMauA('h2_thanh', '#05070a', 0.82), day = this.toMauA('h2_thanh', mau, 0.85); if (nen === this._rong) return;
    u = clamp(u, 0, 1); ctx.drawImage(nen, x - 1, y - 1, w + 2, h + 2);
    if (u > 0) ctx.drawImage(day, 0, 0, day.width * u, day.height, x, y, w * u, h);
  },
  rong() { return this._rong || (this._rong = Object.assign(document.createElement('canvas'), { width: 1, height: 1 })); },
  // màu thuộc dải LỬA (đỏ–cam–vàng hổ phách)? — hạt than/tia lửa giữ ảnh gốc màu lửa, màu khác thì tô màu (kiểm: tools/thap-kt-mau.js)
  laLua(mau) {
    const M = this._laLua || (this._laLua = {}); if (M[mau] != null) return M[mau];
    const m = /^#([0-9a-f]{6})$/i.exec(mau || ''); if (!m) return (M[mau] = true);
    const n = parseInt(m[1], 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn < 0.12) return (M[mau] = false);
    let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
    return (M[mau] = h <= 60 || h >= 340);
  },
  // chấm sáng mềm theo màu = fx_cham_trang.png (ChatGPT T22) tô màu — không còn gradient vẽ code
  cham1(mau) {
    if (this.cham[mau]) return this.cham[mau];
    const c = this.toMauA('fx_cham_trang', mau);
    if (c !== this._rong) this.cham[mau] = c;
    return c;
  },
  // hạt bụi = fx_bui.png (ChatGPT)
  bui1() { return this.img('fx_bui') || this.rong(); },
  // vệt đạn = fx_vet_trang.png (ChatGPT) tô màu
  vet(mau) {
    const c = this.toMauA('fx_vet_trang', mau);
    if (c !== this._rong) this._vet[mau] = c;
    return c;
  },
  // ảnh bàn "dịu": giảm bão hoà (sat), giảm tương phản (con), tối đi (bri), ngả nhẹ về gunmetal #292D32 — xử lý điểm ảnh 1 lần
  // (không dùng ctx.filter vì Safari iOS chưa hỗ trợ). Tư vấn mục C: bàn tối, trung tính, ít chi tiết sáng.
  diu(ten, sat, con, bri) {
    const key = 'diu|' + ten + '|' + sat + con + bri;
    if (this.xam[key]) {
      // iOS Safari có thể xoá vùng nhớ canvas (chạy nền, F5/bfcache, thiếu bộ nhớ) mà KHÔNG báo lỗi → bản dịu thành trong suốt
      // → khay mất cả viền/khung (SOLO/CO-OP "bàn không có viền"). Tâm ảnh khay/đường luôn đục: tâm trong suốt = bản hỏng → dựng lại.
      if (this.conSong(this.xam[key])) return this.xam[key];
      delete this.xam[key];
    }
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d');
    let d;
    try { x.drawImage(a, 0, 0); d = x.getImageData(0, 0, c.width, c.height); }
    catch (e) { c.width = c.height = 0; this._diuTam = true; return a; } // thiếu bộ nhớ: tạm dùng ảnh gốc, lamNen sẽ thử lại
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const L = p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11;
      for (let k = 0; k < 3; k++) {
        let v = L + (p[i + k] - L) * sat;           // bão hoà
        v = (v - 118) * con + 118;                  // tương phản (cắt bớt điểm sáng)
        v = v * bri;                                // độ sáng
        v = v * 0.85 + [41, 45, 50][k] * 0.15 * bri * 1.6; // ngả về gunmetal
        p[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
    x.putImageData(d, 0, 0); // vetay-ok: png (ảnh khay/đường dịu màu)
    // ảnh nền (khay, đường) chỉ dùng qua bản dịu → bỏ bản gốc cỡ lớn khỏi bộ nhớ
    if (this.anh[ten] && this.anh[ten]._cv === a) delete this.anh[ten];
    return (this.xam[key] = c);
  },
  // canvas còn điểm ảnh? (đọc 1 điểm ở tâm; canvas 0×0 / bị trình duyệt xoá → false)
  conSong(c) {
    if (!c || !(c.width > 0 && c.height > 0)) return false;
    if (!(c instanceof HTMLCanvasElement)) return true;
    try { const x = c.getContext('2d'); return !!x && x.getImageData(c.width >> 1, c.height >> 1, 1, 1).data[3] > 0; } catch (e) { return true; }
  },
  diaCong(co) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(co * k)), key = 'dia|' + n;
    let c = this.cGet(key); if (c) return c;
    const a = this.img('cong'); if (!a) return null;
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'); x.beginPath(); x.arc(n / 2, n / 2, n * 0.3, 0, 7); x.clip(); // vetay-ok: mask (cắt tròn lõi cổng PNG)
    this.min(x); this.veNho(x, a, 0, 0, a.width, a.height, 0, 0, n, n);
    return this.cSet(key, c);
  },
  // chữ nổi dựng sẵn thành ảnh (viền + chữ) — vẽ chữ mỗi khung rất tốn; mỗi con số chỉ dựng 1 lần rồi dùng lại suốt đời nó
  chuAnh(s, mau, px) {
    const k = this.s * this.dpr, key = s + '|' + mau + '|' + px;
    const M = this._chu || (this._chu = new Map());
    let c = M.get(key); if (c) return c;
    // SỐ SÁT THƯƠNG (chỉ chữ số): ghép từ ảnh từng chữ số dựng sẵn (viền / ruột riêng) — không dựng canvas + vẽ chữ mới cho MỖI con số.
    // Đợt nhiều skill cùng lúc sinh hàng chục số khác nhau trong 1 khung → trước đây 50–150 ms vẽ chữ (giật). Xem giat_skill/BAO-CAO.md.
    if (/^[0-9]{1,12}$/.test(s)) return this.chuSo(s, mau, px);
    if (M.size > 200) M.clear();
    const f = '900 ' + px + 'px ' + FONT.display;
    const m = this._mx || (this._mx = document.createElement('canvas').getContext('2d'));
    m.font = f; const tw = m.measureText(s).width, lw = tw + 8, lh = px * 1.35 + 6;
    c = document.createElement('canvas'); c.width = Math.ceil(lw * k); c.height = Math.ceil(lh * k);
    const x = this.c2d(c); x.scale(k, k);
    x.font = f; x.textAlign = 'center'; x.lineJoin = 'round'; x.lineWidth = 3.5; x.strokeStyle = 'rgba(0,0,0,.85)';
    const by = px + 3; x.strokeText(s, lw / 2, by); x.fillStyle = mau; x.fillText(s, lw / 2, by);
    c.tw = tw; c.lw = lw; c.lh = lh; c.by = by;
    M.set(key, c); return c;
  },
  // 1 chữ số → 2 ảnh (viền đen, ruột màu) ở mật độ điểm ảnh thật; số = dãy chữ số, vẽ 2 lượt (mọi viền rồi mọi ruột) như strokeText+fillText
  chuSo(s, mau, px) {
    const k = this.s * this.dpr, f = '900 ' + px + 'px ' + FONT.display;
    const GM = this._glyph || (this._glyph = new Map());
    const m = this._mx || (this._mx = document.createElement('canvas').getContext('2d'));
    const lh = px * 1.35 + 6, by = px + 3, gl = [];
    let x = 4;
    for (const ch of s) {
      const gk = ch + '|' + mau + '|' + px + '|' + k;
      let g = GM.get(gk);
      if (!g) {
        m.font = f; const adv = m.measureText(ch).width, gw = adv + 8;
        const mk = (vien) => { const c = document.createElement('canvas'); c.width = Math.ceil(gw * k); c.height = Math.ceil(lh * k);
          const y = this.c2d(c); y.scale(k, k); y.font = f; y.textAlign = 'left'; y.lineJoin = 'round';
          if (vien) { y.lineWidth = 3.5; y.strokeStyle = 'rgba(0,0,0,.85)'; y.strokeText(ch, 4, by); } else { y.fillStyle = mau; y.fillText(ch, 4, by); } return c; };
        g = { adv, gw, v: mk(true), r: mk(false) }; GM.set(gk, g);
      }
      gl.push([g, x - 4]); x += g.adv;
    }
    const tw = x - 4, c = { so: gl, tw, lw: tw + 8, lh, by };
    const M = this._chu; if (M.size > 400) M.clear(); M.set(s + '|' + mau + '|' + px, c);
    return c;
  },
  // vẽ ảnh chữ (canvas hoặc số ghép) tại (x,y) cỡ w×h logic
  veChuAnh(ctx, im, x, y, w, h) {
    if (!im.so) { ctx.drawImage(im, x, y, w, h); return; }
    const q = w / im.lw;
    for (const [g, ox] of im.so) ctx.drawImage(g.v, x + ox * q, y, g.gw * q, h);
    for (const [g, ox] of im.so) ctx.drawImage(g.r, x + ox * q, y, g.gw * q, h);
  },
  // quầng sáng tròn = fx_cham_trang.png tô màu (màu + độ mờ lấy từ mốc đầu) — thay gradient vẽ code
  glow(key, stops) {
    let c = this._glow[key]; if (c) return c;
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(stops[0][1]) || [0, 255, 255, 255, 1];
    const im = this.toMauA('fx_cham_trang', 'rgb(' + m[1] + ',' + m[2] + ',' + m[3] + ')', 0.9); if (im === this._rong) return im;
    c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'); x.globalAlpha = Math.min(1, (+m[4] || 1) * 1.5); x.drawImage(im, 0, 0, 128, 128);
    return (this._glow[key] = c);
  },

  // ---------- vẽ ảnh tiện ích ----------
  anhGiua(ctx, ten, x, y, co, goc, alpha) {
    let a = typeof ten === 'string' ? this.img(ten) : ten; if (!a) return false;
    const w = co, h = co * (a.height / a.width);
    a = this.mip(a, Math.min(w, h) * this.s * this.dpr);
    if (alpha != null) ctx.globalAlpha = alpha;
    if (goc) { ctx.save(); ctx.translate(x, y); ctx.rotate(goc); ctx.drawImage(a, -w / 2, -h / 2, w, h); ctx.restore(); }
    else ctx.drawImage(a, x - w / 2, y - h / 2, w, h);
    if (alpha != null) ctx.globalAlpha = 1;
    return true;
  },
  // dải khung ngang (fx_* 6 khung, quai_* / trum_* 4 khung)
  khung(ctx, ten, f, x, y, co, goc, banAnh) {
    const a = banAnh || this.mip(this.img(ten), co * this.s * this.dpr); if (!a) return false;
    const n = a.nf || Math.round(a.width / a.height), fw = a.fm || a.width / n, st = a.fm ? a.fm + a.gap : fw;
    f = ((f % n) + n) % n;
    ctx.save(); ctx.translate(x, y); if (goc) ctx.rotate(goc);
    ctx.drawImage(a, f * st, 0, fw, a.height, -co / 2, -co / 2, co, co);
    ctx.restore(); return true;
  },
  // dải khung có HOÀ TRỘN 2 khung liền nhau (f thực: 2.4 = 60% khung 2 + 40% khung 3) → 6 khung trông như 30
  khungMuot(ctx, ten, f, x, y, co, goc, al, banAnh) {
    const a = banAnh || this.mip(this.img(ten), co * this.s * this.dpr); if (!a) return false;
    const n = Math.round(a.width / a.height), fw = a.width / n;
    const f0 = Math.max(0, Math.min(n - 1, Math.floor(f))), f1 = Math.min(n - 1, f0 + 1);
    let fr = f1 === f0 ? 0 : Math.max(0, (f - f0 - 0.4) / 0.6); fr = fr * fr * (3 - 2 * fr); // hoà ở 60% cuối mỗi khung (êm, đỡ tốn)
    const g0 = ctx.globalAlpha;
    ctx.save(); ctx.translate(x, y); if (goc) ctx.rotate(goc);
    if (fr < 0.98) { ctx.globalAlpha = g0 * al * (1 - fr); ctx.drawImage(a, f0 * fw, 0, fw, a.height, -co / 2, -co / 2, co, co); }
    if (fr > 0.02) { ctx.globalAlpha = g0 * al * fr; ctx.drawImage(a, f1 * fw, 0, fw, a.height, -co / 2, -co / 2, co, co); }
    ctx.restore(); ctx.globalAlpha = g0; return true;
  },
  // tia lặp ảnh dọc đoạn thẳng (tia_laser, tia_set); keo = kéo giãn một ảnh (vệt đạn)
  tia(ctx, ten, x0, y0, x1, y1, rong, lech, keo) {
    if (this._T && typeof ten === 'string' && (ten === 'tia_laser' || ten === 'tia_set' || ten === 'dan_tia')) { const t2 = FXU.ten(this._T, 'tia'); if (t2 && this.img(t2)) { ten = t2; keo = false; } } // tia v2 lặp dọc đường
    const a = this.mip(typeof ten === 'string' ? this.img(ten) : ten, rong * this.s * this.dpr); if (!a) return;
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) return;
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
    if (keo) { ctx.drawImage(a, 0, -rong / 2, L, rong); ctx.restore(); return; }
    const tw = a.width * (rong / a.height);
    let x = -((lech || 0) % tw); if (x > 0) x -= tw;
    while (x < L) {
      const x0c = Math.max(0, x), x1c = Math.min(L, x + tw);
      const sx = ((x0c - x) / tw) * a.width, sw = ((x1c - x0c) / tw) * a.width;
      if (sw > 0.5) ctx.drawImage(a, sx, 0, sw, a.height, x0c, -rong / 2, x1c - x0c, rong);
      x += tw;
    }
    ctx.restore();
  },
  // sét gấp khúc: chia đoạn, rung ngẫu nhiên theo hạt giống (đổi mỗi ~50 ms)
  set(ctx, x0, y0, x1, y1, rong, seed) {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / 22));
    const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    let r = seed * 9301 + 49297; const rn = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 - 0.5; };
    const pts = [[x0, y0]];
    for (let i = 1; i < n; i++) { const u = i / n, j = rn() * Math.min(26, L * 0.18); pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]); }
    pts.push([x1, y1]);
    const t2 = this._T && typeof FXU !== 'undefined' && FXU.ten(this._T, 'tia');
    if (t2 && this.img(t2)) { // sét v2: dải sét PNG của ụ lặp theo từng đoạn gấp khúc (bỏ lõi kẻ code)
      for (let i = 0; i < pts.length - 1; i++) this.tia(ctx, t2, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rong * 1.1, seed * 37 % 200);
      return;
    }
    for (let i = 0; i < pts.length - 1; i++) this.tia(ctx, 'tia_set', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rong, 0, true);
  },

  // ---------- nền tĩnh (khay + đường) dựng 1 lần ----------
  // Nền dựng ở độ phân giải RIÊNG: iOS ≤ 2× (nền 3× = 10 MB + lớp đường 10 MB, sát trần bộ nhớ canvas của Safari).
  // Lỗi bất kỳ (ảnh chưa về, hết bộ nhớ) → _choNen = true: vòng vẽ tự thử dựng lại mỗi ~1.5 s, không kẹt mãi ở khay xám.
  lamNen() {
    this._tNen = performance.now();
    try { this.lamNen0(); }
    catch (e) { this._choNen = true; if (G.debug && G.debug.log) console.warn('lamNen', e); }
  },
  lamNen0() {
    this._diuTam = false;
    const c = this.nen;
    const dn = this.laIOS ? Math.min(2, this.dpr) : this.dpr, q = dn / this.dpr;
    const k = this.s * dn;
    c.width = Math.round(this.cv.width * q); c.height = Math.round(this.cv.height * q);
    const x = c.getContext('2d'); if (!x) { this._choNen = true; return; }
    this.min(x);
    x.setTransform(k, 0, 0, k, 0, 0);
    // sàn: KHÔNG gradient code — ảnh ChatGPT san_tran.png (raw_p4_board_1) trên 1 màu nền đặc
    x.fillStyle = '#1d1f23'; x.fillRect(0, 0, W, H); // vetay-ok: nen (1 màu nền đặc lót dưới ảnh sàn)
    let du = true;
    const san = this.diu('san_tran', 0.55, 0.8, 0.62); // sàn xưởng ChatGPT (raw_p4_board_1), dịu màu — phủ kín (cover)
    if (san) { const k2 = Math.max(W / san.width, H / san.height), sw = san.width * k2, sh = san.height * k2; x.drawImage(san, (W - sw) / 2, (H - sh) / 2, sw, sh); } else du = false;
    // khay bàn máy móc xám (bóng đổ dưới khay)
    for (const B of G.ban) {
      x.save(); // (bỏ bóng đổ code dưới khay — khung khay PNG đã có viền tối)
      const kh = this.diu('khay', 0.22, 0.72, 0.6);
      if (kh) { try { x.drawImage(this.mip(kh, B.h * k), B.x, B.y, B.w, B.h); } catch (e) { x.drawImage(kh, B.x, B.y, B.w, B.h); this._diuTam = true; } } else { du = false; }
      x.restore();
    }
    this.thaMip(this.xam['diu|khay|0.220.720.6']); // các tầng mip chỉ cần lúc dựng nền
    // đường đi: ghép ảnh đường thẳng + góc (+ ô ngã ba co-op) lên 1 lớp riêng KHÔNG bóng,
    // rồi đổ bóng 1 lần cho cả lớp → các mảnh ghép không đè bóng lên nhau, không lộ mối nối
    const th = this.diu('duong_thang', 0.25, 0.7, 0.74), gc = this.diu('duong_goc', 0.25, 0.7, 0.74);
    const n3 = G.chung ? this.diu('duong_nga3', 0.25, 0.7, 0.74) : 1;
    if (!th || !gc || !n3) du = false;
    const lp = this._lopDuong || (this._lopDuong = document.createElement('canvas'));
    lp.width = c.width; lp.height = c.height;
    const y = lp.getContext('2d'); if (!y) { this._choNen = true; return; }
    this.min(y); y.setTransform(k, 0, 0, k, 0, 0);
    const R = DUONG_RONG / 2, daVe = new Set();
    for (const p of G.duong) {
      const pts = p.pts;
      for (let i = 0; i < pts.length - 1; i++) {
        const key = pts[i] + '|' + pts[i + 1];
        if (daVe.has(key)) continue; daVe.add(key);
        let [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
        const goc0 = i > 0, goc1 = i < pts.length - 2;
        // co-op: làn dọc dừng đúng mép ô ngã ba; hành lang chung bắt đầu đúng mép phải ô ngã ba
        const a0 = goc0 ? R : -6, a1 = goc1 ? R : -10;
        this.veDoanDuong(y, th, ax + dx * a0, ay + dy * a0, bx - dx * a1, by - dy * a1);
      }
      if (!G.chung) for (let i = 1; i < pts.length - 1; i++) this.veGoc(y, gc, pts[i - 1], pts[i], pts[i + 1]);
    }
    if (G.chung && n3 !== 1 && n3) { // ô ngã ba: ray trái liền, mở lên/xuống/phải
      const [jx, jy] = G.duong[0].pts[1];
      y.drawImage(n3, jx - R, jy - R, DUONG_RONG, DUONG_RONG);
    }
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.drawImage(lp, 0, 0); x.restore();
    lp.width = lp.height = 0; // lớp đường chỉ là trung gian: trả bộ nhớ ngay (giữ đối tượng để dùng lại)
    this._choNen = !du || this._diuTam;
    if (G.debug && G.debug.log) console.log('[nen]', du ? 'khay OK' : 'TẠM (thiếu ảnh)', c.width + 'x' + c.height, JSON.stringify(this.boNho()));
  },
  thaMip(a) { if (a && a._mip) { for (let i = 1; i < a._mip.length; i++) a._mip[i].width = a._mip[i].height = 0; a._mip = null; } },
  veDoanDuong(x, th, ax, ay, bx, by) {
    const L = Math.hypot(bx - ax, by - ay); if (L < 1) return;
    x.save(); x.translate(ax, ay); x.rotate(Math.atan2(by - ay, bx - ax) - Math.PI / 2);
    if (!th) { x.restore(); return; } // ảnh đường chưa tải: không vẽ thay
    const tl = th.height * (DUONG_RONG / th.width);
    for (let y = 0; y < L; y += tl) {
      const h = Math.min(tl, L - y);
      x.drawImage(th, 0, 0, th.width, th.height * (h / tl), -DUONG_RONG / 2, y, DUONG_RONG, h);
    }
    x.restore();
  },
  veGoc(x, gc, p0, p1, p2) {
    if (!gc) return;
    const din = [Math.sign(p1[0] - p0[0]), Math.sign(p1[1] - p0[1])], dout = [Math.sign(p2[0] - p1[0]), Math.sign(p2[1] - p1[1])];
    const can = [[-din[0], -din[1]], dout];
    let up = [0, -1], rt = [1, 0];
    for (let k = 0; k < 4; k++) {
      const ok = (a, b) => a[0] === b[0] && a[1] === b[1];
      if ((ok(up, can[0]) && ok(rt, can[1])) || (ok(up, can[1]) && ok(rt, can[0]))) {
        x.save(); x.translate(p1[0], p1[1]); x.rotate(k * Math.PI / 2);
        x.drawImage(gc, -DUONG_RONG / 2, -DUONG_RONG / 2, DUONG_RONG, DUONG_RONG); x.restore(); return;
      }
      up = [-up[1], up[0]]; rt = [-rt[1], rt[0]];
    }
  },

  coU(T) { const B = G.ban[T.ban]; return Math.min(B.cw, B.ch) * 0.98; },
  // đầu súng: đường kính vẽ = cạnh ô × K (artscale.js, đo từ ảnh: thân ~61% ô, mũi nòng ≤ 92% ô) — bệ chung = 70% cạnh ngắn ô
  kDau(id) { const k = (window.HEAD_K || {})[id]; if (k) return k; const m = (window.ART_META || {})[id] || { s: 1 }; return 0.8 * m.s; },
  coDau(T) { const B = G.ban[T.ban]; return Math.min(B.cw, B.ch) * this.dauK(T.id, T.gd); },
  // tên ảnh + hệ số cỡ của đầu súng ở dạng gd (0 = đầu thường, 1..3 = dạng grow-up)
  dauTen(id, gd) { return gd && STAGE_K[id] ? id + '_nong_s' + gd : id + '_nong'; },
  dauK(id, gd) { return gd && STAGE_K[id] ? STAGE_K[id][gd - 1] : this.kDau(id); },
  // vẽ 1 lớp đầu súng (đã xoay sẵn ở ctx): bien '' thường | 'trang' bóng trắng | 'den' bóng tối; sc = phóng ĐỀU
  veDauLop(ctx, id, gd, C, al, sc, da, bien) {
    const ten = this.dauTen(id, gd), D = C * this.dauK(id, gd) * (sc || 1);
    ctx.globalAlpha = al;
    if (bien) { const c = this.co(ten, D, bien); if (c) ctx.drawImage(c, -D / 2, -D / 2, D, D); ctx.globalAlpha = 1; return; }
    const db = this.dauBong(ten, D, da);
    if (db) { const P = D * db.sc; ctx.drawImage(db, -P / 2, -P / 2, P, P); }
    else { const a = this.co(ten, D, da ? 'xam' : ''); if (a) ctx.drawImage(a, -D / 2, -D / 2, D, D); }
    ctx.globalAlpha = 1;
  },

  // ---------- khung hình ----------
  // đặt tạm toạ độ NỘI SUY (giữa bước trước và bước hiện tại) cho mọi vật chuyển động; traLai() trả lại số thật
  noiSuy(a) {
    const b = (1 - a) * BUOC;
    for (const E of G.quai) {
      E.__x = E.x; E.__y = E.y; E.__g = E.gv; E.__c = E.tChet;
      if (E._x !== undefined) { E.x = E._x + (E.x - E._x) * a; E.y = E._y + (E.y - E._y) * a; if (E._g != null && E.gv != null) E.gv = E._g + gocLech(E._g, E.gv) * a; }
      if (E.chet) E.tChet = Math.max(0, E.tChet - b);
    }
    for (const d of G.dan) {
      d.__x = d.x; d.__y = d.y; d.__z = d.z;
      if (d._x !== undefined) { d.x = d._x + (d.x - d._x) * a; d.y = d._y + (d.y - d._y) * a; if (d.z !== undefined) d.z = d._z + (d.z - d._z) * a; }
    }
    for (const B of G.ban) for (const T of B.t) if (T) {
      T.__g = T.goc; T.__rx = T.rx;
      if (T._g !== undefined) { T.goc = T._g + gocLech(T._g, T.goc) * a; T.rx = T._rx + (T.rx - T._rx) * a; }
      if (T.anim) { T.anim.__t = T.anim.t; T.anim.t = Math.max(0, T.anim.t - b); }
    }
    for (const o of G.hu) {
      o.__t = o.t; o.t = Math.max(0, o.t - b);
      if (o._x !== undefined) { o.__x = o.x; o.__y = o.y; o.x = o._x + (o.x - o._x) * a; o.y = o._y + (o.y - o._y) * a; }
      if (o.ds) for (const q of o.ds) { q.__x = q.x; q.__y = q.y; if (q._x !== undefined) { q.x = q._x + (q.x - q._x) * a; q.y = q._y + (q.y - q._y) * a; } }
    }
    for (const v of G.bay) { v.__t = v.t; v.t = Math.max(0, v.t - b); }
  },
  traLai() {
    for (const E of G.quai) { E.x = E.__x; E.y = E.__y; E.gv = E.__g; E.tChet = E.__c; }
    for (const d of G.dan) { d.x = d.__x; d.y = d.__y; d.z = d.__z; }
    for (const B of G.ban) for (const T of B.t) if (T) { T.goc = T.__g; T.rx = T.__rx; if (T.anim && T.anim.__t !== undefined) T.anim.t = T.anim.__t; }
    for (const o of G.hu) {
      o.t = o.__t;
      if (o._x !== undefined) { o.x = o.__x; o.y = o.__y; }
      if (o.ds) for (const q of o.ds) { q.x = q.__x; q.y = q.__y; }
    }
    for (const v of G.bay) v.t = v.__t;
  },
  ve(dt, a) {
    this.t += dt; this.dt = dt; this.a = a == null ? 1 : a;
    if (typeof VX !== 'undefined') VX.cap(dt);
    this.doKhung(dt);
    if (!G.ban.length) return this.ve0();
    this.noiSuy(this.a);
    try { this.ve0(); } finally { this.traLai(); }
    if (this._nong.length) this.chayNong();
  },
  ve0() {
    const ctx = this.ctx, k = this.s * this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this._choNen && G.ban.length && !(performance.now() - this._tNen < 1500)) this.lamNen(); // nền tạm → thử dựng lại
    if (G.debug && G.debug.log && !(performance.now() - (this._tLog || 0) < 10000)) { this._tLog = performance.now(); console.log('[bo-nho]', JSON.stringify(this.boNho())); }
    // nền nằm ở canvas DOM #cv-nen bên dưới → chỉ xoá; nền chưa dựng được: lót 1 màu đặc như cũ
    const coNen = this.nen.width > 2 && G.ban.length > 0;
    if (this._nenHien !== coNen) { this._nenHien = coNen; this.nen.style.visibility = coNen ? '' : 'hidden'; }
    if (coNen) ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    else { ctx.fillStyle = '#1d1f23'; ctx.fillRect(0, 0, this.cv.width, this.cv.height); } // vetay-ok: nen
    ctx.setTransform(k, 0, 0, k, FX.rungX * k, FX.rungY * k);
    if (!G.ban.length) return;
    if (typeof AN !== 'undefined') AN.khung(); // animation hybrid: cài đặt FX / giảm chuyển động / LOD bàn đông (anim.js)
    this.veDongChay(ctx);
    this.veCongLoi(ctx);
    this.veNhanBan(ctx);
    // vật trên đường (mây độc, vũng độc, mìn, cầu vồng…) vẽ dưới quái
    for (const o of G.hu) if (HU[o.k] && HU[o.k].duoi) { this._T = o.T || o._T || null; HU[o.k].ve(ctx, o, this); }
    this._T = null;
    this.veQuai(ctx);
    for (const o of G.hu) if (o.k === 'hoden') { this._T = o.T || o._T || null; HU.hoden.ve(ctx, o, this); } // hố đen đè lên quái bị hút
    this._T = null;
    this._hang = [];
    this.veO(ctx);
    for (const o of G.hu) if (o.k === 'tuong') { this._T = o.T || o._T || null; HU.tuong.ve(ctx, o, this); }
    this._T = null;
    this.veLaser(ctx);
    this.veDan(ctx);
    for (const o of G.hu) if (o.k !== 'hoden' && o.k !== 'tuong' && HU[o.k] && HU[o.k].ve && !HU[o.k].duoi) { this._T = o.T || o._T || null; HU[o.k].ve(ctx, o, this); }
    this._T = null;
    this.veFx(ctx);
    VX.veDs(ctx, this); // hiệu ứng sự kiện: sao lên mốc, kỹ năng ghép, dây liên kết, bingo, tiếng hú
    if (this.veHoTro) this.veHoTro(ctx); // chạm/giữ ụ hỗ trợ: hiển thị vùng & loại buff
    ND.veSoi(ctx); // chạm thẻ bộ bài: khoanh các ụ cùng loại
    ND.veKeo(ctx); // kéo ghép: viền ô hợp lệ / cung nối / gạch chéo
    { const hg = this._hang; this._hang = null; if (hg) for (const h of hg) ND.veHuyHieu(ctx, h); } // lớp huy hiệu (loại + sao)
    this.veKeo(ctx);
    ND.veKeoTren(ctx);
    this.veChu(ctx);
    if (typeof CORE !== 'undefined') CORE.veHud(ctx, this); // số tim trên lõi nhà chính
    if (FX.chop > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(0.3, FX.chop); ctx.drawImage(this.cham1(FX.chopMau), -W * 0.6, -H * 0.4, W * 2.2, H * 1.8); ctx.restore(); ctx.globalAlpha = 1; } // chớp màn = fx_cham_trang PNG phóng to
  },

  // dòng chảy: mũi tên ›› mờ trôi dọc đường về lõi (co-op: 2 làn nhập vào hành lang chung đọc rõ)
  veDongChay(ctx) {
    const t = this.t, KC = 30, V = 22, daVe = new Set();
    const mui = this.co('duong_mui', 14); // mũi tên ChatGPT (S4) dập dọc đường; chưa tải → (chỉ ?debug) nét vẽ code
    if (!mui && !this.dbg) return;
    const hien = Math.max(0, Math.min(1, (8 - (G.t || 0)) / 2)); // chỉ hiện lúc mới vào trận (~6 s) rồi mờ dần tắt
    if (hien <= 0) return;
    ctx.save(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.lineWidth = 3;
    const m0 = ctx.getTransform();
    if (mui) ctx.globalAlpha = 0.42 * hien;
    ctx.beginPath();
    for (const p of G.duong) {
      const pts = p.pts; let s0 = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
        const key = pts[i] + '|' + pts[i + 1];
        if (!daVe.has(key)) {
          daVe.add(key);
          const dau = i === 0 ? 30 : 0, cuoi = i === pts.length - 2 ? L - 34 : G.chung ? L - 16 : L; // co-op: 2 làn dừng trước tâm ngã ba, hành lang nối tiếp
          for (let u = ((t * V - s0) % KC + KC) % KC; u < cuoi; u += KC) {
            if (u < dau) continue;
            const cx = ax + dx * u, cy = ay + dy * u, nx = -dy * 6, ny = dx * 6;
            if (mui) { ctx.setTransform(m0.a * dx, m0.a * dy, -m0.a * dy, m0.a * dx, m0.e + m0.a * cx, m0.f + m0.a * cy); ctx.drawImage(mui, -9, -4.7, 14, 9.3); continue; }
            ctx.moveTo(cx - dx * 5 + nx, cy - dy * 5 + ny); ctx.lineTo(cx + dx * 2, cy + dy * 2); ctx.lineTo(cx - dx * 5 - nx, cy - dy * 5 - ny); // vetay-ok: debug (chỉ ?debug khi thiếu duong_mui)
          }
        }
        s0 += L;
      }
    }
    if (!mui) { ctx.strokeStyle = 'rgba(120,235,255,.2)'; ctx.stroke(); } // vetay-ok: debug
    ctx.restore();
  },
  veCongLoi(ctx) {
    const t = this.t, daLoi = new Set();
    for (const p of G.duong) {
      const [x, y] = p.pts[0];
      // cổng sinh: vòng ngoài đứng yên, lõi xoáy quay (cắt tròn rồi xoay chính ảnh)
      const a = this.img('cong'), co = 56;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(this.glow('cong', [[0, 'rgba(150,70,230,.22)'], [0.09, 'rgba(150,70,230,.22)'], [1, 'rgba(150,70,230,0)']]), x - 46, y - 46, 92, 92); ctx.restore();
      if (a) {
        this.ve1(ctx, 'cong', co, '', x, y);
        const dia = this.diaCong(co); // lõi xoáy đã cắt tròn sẵn → chỉ cần xoay, khỏi clip mỗi khung
        if (dia) { ctx.save(); ctx.translate(x, y); ctx.rotate(-t * 2.2); ctx.drawImage(dia, -co / 2, -co / 2, co, co); ctx.restore(); }
      }
      const e = p.pts[p.pts.length - 1], key = e + '';
      if (daLoi.has(key)) continue; daLoi.add(key);
      if (typeof CORE !== 'undefined' && CORE.veLoi(ctx, this, e, key)) continue; // lõi + hư hại/chớp đỏ: js/corehud.js
      const l = this.img('loi'), cl = 60, bob = Math.sin(t * 2.4) * 1.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (0.24 + 0.06 * Math.sin(t * 3)) / 0.6;
      ctx.drawImage(this.glow('loi', [[0, 'rgba(90,240,255,.6)'], [0.05, 'rgba(90,240,255,.6)'], [1, 'rgba(90,240,255,0)']]), e[0] - 44, e[1] - 52, 88, 88); ctx.restore(); ctx.globalAlpha = 1;
      if (l) this.ve1(ctx, 'loi', cl, '', e[0], e[1] - 6 + bob);
    }
  },
  veNhanBan(ctx) {
    // nhãn bàn = tấm thép dập nhỏ + đèn màu phe (You xanh · Ally xanh lá · Rival đỏ), chữ thường, không viên thuốc phát sáng
    ctx.font = FONT.u(11, 800); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const B of G.ban) {
      if (G.ban.length < 2) break;
      if (B.i === 0) continue; // HUD mượt B: bàn của mình (to, ở dưới) không cần nhãn "You"
      const s = B.ten, w = Math.ceil(ctx.measureText(s).width) + 22, h = 16;
      const x = Math.min(B.x + B.w - w - 10, W - w - 8), y = B.y + 1; // y = tâm nhãn
      const den = B.i === 0 ? '#5aa8ff' : (G.che === 'pvp' ? '#ff4b3e' : '#63d68b');
      const tam = this.img('hud_ten_ban'); // tấm tên thép ChatGPT (S1): 3 mảnh (đầu có ổ LED · giữa giãn · đuôi)
      if (tam) {
        const th = 20, tw = this.px(w + 6), sc = th / tam.height, dau = Math.round(tam.height * 1.05), cuoi = Math.round(tam.height * 0.45);
        const x0 = this.px(x - 3), y0 = this.px(y - th / 2), xa = this.px(x0 + dau * sc), xb = this.px(x0 + tw - cuoi * sc); // mép mảnh trùng điểm ảnh thiết bị: không lằn nối, không nhoè
        ctx.drawImage(tam, 0, 0, dau, tam.height, x0, y0, xa - x0, th);
        ctx.drawImage(tam, dau, 0, tam.width - dau - cuoi, tam.height, xa, y0, xb - xa, th);
        ctx.drawImage(tam, tam.width - cuoi, 0, cuoi, tam.height, xb, y0, x0 + tw - xb, th);
        // (đèn phe: không vẽ chấm code — ổ LED đã có trong ảnh hud_ten_ban)
        ctx.fillStyle = '#16181c'; ctx.fillText(s, x0 + dau * sc + 1, y + 1.3); ctx.fillStyle = '#f2f4f7'; ctx.fillText(s, x0 + dau * sc + 1, y + 0.5);
        continue;
      }
      // ảnh tấm tên chưa tải: chỉ chữ (không vẽ tấm thép code)
      ctx.fillStyle = '#dfe3e9'; ctx.fillText(s, x + 15, y + 0.5);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
  },

  veQuai(ctx) {
    for (const E of G.quai) {
      const co = E.d.co * (E.trum ? 1 : 1), bay = E.d.bay;
      let sc = 1, al = 1;
      if (E.chet) { if (E.tChet >= 0.25) continue; sc = 1 + E.tChet * 1.6; al = 1 - E.tChet / 0.25; }
      sc *= 0.6 + 0.4 * E.vao;
      const oy = bay ? -6 + Math.sin(E.bob) * 2.5 : 0;
      // bóng tiếp đất
      ctx.globalAlpha = 0.45 * al;
      this.anhGiua(ctx, this.cham1('#000000'), E.x + 2, E.y + 3 + (bay ? 6 : 0), co * 0.75 * (bay ? 0.75 : 1)); // bóng = fx_cham_trang PNG tô đen (không arc code)
      ctx.globalAlpha = al;
      const ten = E.trum ? (this.tenQuai ? this.tenQuai(E).replace(/_8$/, '') : 'trum_' + E.trum) : 'quai_' + (E.d.anh || E.id); // trùm mới: ảnh mượn (trum.js)
      let f, f2 = -1, fr = 0;
      if (E.trum) f = E.bao ? 3 : [0, 1, 2, 1][Math.floor(E.khung * 0.8) % 4];
      else { const kf = E.khung % 4; f = Math.floor(kf); const r = kf - f; if (r > 0.65) { f2 = (f + 1) % 4; fr = (r - 0.65) / 0.35; fr = fr * fr * (3 - 2 * fr); } }
      const goc = E.trum ? 0 : (E.gv != null ? E.gv : E.goc) - Math.PI / 2;
      let x = E.x, y = E.y + oy; const cv = co * sc;
      if (typeof AN !== 'undefined' && AN._lac.length && !E.chet) { const q = AN.lacQuai(E); x += q[0]; y += q[1]; } // rung CỤC BỘ ở khung trúng đòn (anim.js)
      if (E.bao) { // trùm báo trước: quầng màu chiêu
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 20); this.anhGiua(ctx, this.cham1(TRUM[E.trum].mau), x, y, co * 1.9); ctx.restore(); // quầng = PNG tô màu
        ctx.globalAlpha = al;
      }
      const lanh = E.cham > 0 && !E.d.khangCham && !E.chet;
      if (lanh) { // bị chậm: viền băng mỏng quanh quái (không tô xanh cả thân) + bông tuyết cạnh thanh máu (vẽ sau)
        if (!E._lanhT) { E._lanhT = this.t; FX.no('bang_vo', x, y, co * 0.8, 0.19); } // lúc vừa dính chậm: loé băng 190 ms
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2 * al;
        this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = al;
      } else E._lanhT = 0;
      if ((E.yeu > 0 || E.cvT > 0 || E.cvPT > 0 || E.giapT > 0) && !E.chet) { // dấu suy yếu (Phá Giáp: tím), cầu vồng (sắc màu), giáp đối thủ (vàng)
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * al;
        const mm = E.cvT > 0 || E.cvPT > 0 ? ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'][Math.floor(this.t * 6 + E.uid) % 5] : E.giapT > 0 ? '#ffd23f' : '#c77dff';
        this.anhGiua(ctx, this.cham1(mm), x, y, co * 1.15); ctx.restore(); ctx.globalAlpha = al;
      }
      const dai = this.coDai(ten, co);
      if (!dai || !this.khung(ctx, ten, f, x, y, cv, goc, dai)) { if (this.dbg) { ctx.fillStyle = '#a040ff'; ctx.beginPath(); ctx.arc(x, y, co * 0.3, 0, 7); ctx.fill(); } } // vetay-ok: debug
      else if (f2 >= 0) { ctx.globalAlpha = al * fr; this.khung(ctx, ten, f2, x, y, cv, goc, dai); ctx.globalAlpha = al; } // chuyển khung bước đi êm
      if (E.flash > 0 || E.chet) {
        const w = this.coDai(ten, co, 'trang');
        if (w) { ctx.globalAlpha = (E.chet ? 0.8 * al : E.flash / 0.09) * 0.85; this.khung(ctx, ten, f, x, y, cv, goc, w); }
      }
      if (E.docT > 0 && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      ctx.globalAlpha = 1;
      // thanh máu
      if (!E.chet && E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = y - co * 0.42;
        this.thanhAnh(ctx, x - w / 2, yy, w, 3.5, E.hp / E.max, E.docT > 0 ? '#7cff4a' : (E.cham > 0 && !E.d.khangCham ? '#6fd8ff' : '#ff4a4a'));
      }
      if (lanh) { ctx.globalAlpha = 0.85 * al; const k = this.kyHieu('cham', 8); ctx.drawImage(k, x - Math.max(18, co * 0.55) / 2 - 10, y - co * 0.42 - 3, 8, 8); ctx.globalAlpha = al; }
      if (E.trum && !E.chet) {
        const w = 70, yy = y - co * 0.55;
        this.thanhAnh(ctx, x - w / 2, yy - 1, w, 6, E.hp / E.max, TRUM[E.trum].mau);
        if (E.bao) { // đường ngắm tới ụ bị nhắm
          const B = G.ban[E.ban];
          ctx.save(); ctx.globalAlpha = 0.75; const ln = this.toMauA('sup_link', TRUM[E.trum].mau, 0.6), vd = this.img('h2_vong_do'); // dây ngắm = sup_link PNG cuộn + vòng đỏ PNG trên ụ bị nhắm
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; this.tia(ctx, ln, x, y, c.x, c.y, 7, this.t * 60); if (vd) this.anhGiua(ctx, vd, c.x, c.y, Math.min(B.cw, B.ch) * 0.86, 0, 0.8); }
          ctx.restore();
        }
      }
    }
  },

  veO(ctx) {
    const keo = UI.keo;
    for (const B of G.ban) {
      for (let i = 0; i < 15; i++) {
        const T = B.t[i]; if (!T) continue;
        if (keo && keo.T === T && keo.dang) { // ô gốc khi đang kéo: bóng mờ
          this.veU(ctx, T, B.o[i].x, B.o[i].y, { alpha: 0.25 }); continue;
        }
        let o = {};
        const ng = typeof KG !== 'undefined' ? KG.nguon() : (keo && keo.dang ? keo.T : null); // kéo hoặc chạm–chạm (keoghep.js)
        if (ng && ng.ban === B.i && ng !== T && !hopLeGhep(ng, T)) o.alpha = 0.62; // ô không ghép được: mờ nhẹ (spec TU-VAN-HIEU-UNG-CHUNG mục 1D)
        this.veU(ctx, T, B.o[i].x, B.o[i].y, o);
      }
    }
    // ụ bay vào nhau khi ghép
    for (const b of G.bay) VX.veBay(ctx, b, this);
  },

  // vẽ 1 ụ: bóng · bệ · đầu súng xoay (giật lùi) · lớp phủ trạng thái · xúc xắc sao
  veU(ctx, T, x, y, o) {
    o = o || {};
    const B = G.ban[T.ban] || G.ban[0];
    // phóng ĐỘNG (nhấc 0.95→1.14→1.10, hút ghép 1.06→0.32): dùng LẠI ảnh thân/đầu đã dựng ở cỡ ô rồi phóng bằng ma trận
    // → không dựng canvas mới (thu nhỏ nhiều bước + lọc mờ bóng) mỗi khung — nguyên nhân giật khi kéo ghép (tuvan/muotghep)
    const kS = o.scale || 1, S = Math.min(B.cw, B.ch) * 0.98, St = S * kS;
    // hoạt ảnh xuất hiện (triệu hồi / ghép / biến hình hộp) theo THỜI GIAN THỰC — hieuung.js; trả về độ phóng (đều), độ nảy, ẩn/hiện
    const A = o.ghost ? null : VX.truoc(ctx, T, x, y, St, o);
    if (A && A.an) { VX.sau(ctx, T, x, y, St, A); return; } // đang quay số thẻ / chưa lộ: chỉ vẽ hiệu ứng
    let sx = (A ? A.sx : 1) * kS, sy = (A ? A.sy : 1) * kS, oy = A ? A.oy : 0;
    const an = A && A.dong ? A : null;
    const al = (o.alpha != null ? o.alpha : 1) * (A ? A.al : 1);
    ctx.globalAlpha = al;
    // bóng tiếp đất (lúc đứng yên: đã nướng sẵn trong ảnh thân → bớt 1 lần tô hình mỗi ụ mỗi khung) — hình TRÒN, không méo
    const bongSan = !an && sx === 1 && sy === 1;
    if (!bongSan) {
      this.anhGiua(ctx, this.cham1('#000000'), x + 2, y + 3 + S * 0.05, S * 0.9 * Math.min(sx, sy), 0, al * 0.7); ctx.globalAlpha = al; // bóng = PNG tô đen
    }
    if (T.st.lua > 0 || B.cuong > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.1; this.anhGiua(ctx, this.cham1('#ff7a2a'), x, y, S * 1.1); ctx.restore(); ctx.globalAlpha = al; }
    ctx.save(); ctx.translate(x, y + oy); ctx.scale(sx, sy);
    const da = T.st.da;
    // thân tĩnh (bệ chung) dựng sẵn 1 ảnh → mỗi khung chỉ 1 lần vẽ
    const than = this.than(T, S, da, bongSan);
    if (than) {
      if (bongSan && !oy) { // đứng yên: vẽ 1:1 đúng lưới điểm ảnh (nhanh nhất, không lọc ảnh)
        const k = this.s * this.dpr, q = 1 / k;
        ctx.drawImage(than, Math.round((x + FX.rungX - S * 0.75) * k) * q - x - FX.rungX, Math.round((y + FX.rungY - S * 0.75) * k) * q - y - FX.rungY, than.width * q, than.height * q);
      } else ctx.drawImage(than, -S * 0.75, -S * 0.75, S * 1.5, S * 1.5);
    }
    // (bỏ vòng bậc phát sáng trên sân — độ hiếm chỉ còn viên ngọc nhỏ ở bệ + viền thẻ)
    const skT = SKILLS[T.id] || {};
    // vòng quét nâng cấp
    const vlv = T.lvSang > 0 ? this.co('fx_vong_lv', S * 1.1) : null; // vòng lên cấp ChatGPT (S4): xoay, nở ra, mờ dần
    if (vlv) {
      const k2 = 1 - T.lvSang, r = S * (0.42 + k2 * 0.35);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * Math.min(1, T.lvSang * 1.4);
      ctx.rotate(k2 * Math.PI * 2.2); ctx.drawImage(vlv, -r, -r, r * 2, r * 2); ctx.restore(); ctx.globalAlpha = al;
    } // fx_vong_lv chưa tải: không vẽ vòng code
    // đầu súng
    const C0 = S / 0.98, gd = !o.ghost && T.gd && laGrow(T.id) ? T.gd : 0;
    if (!o.ghost) VX.duoiDau(ctx, T, S, al, this); // hào quang dạng thức tỉnh + vòng tiến độ grow-up (dưới đầu súng)
    const D = C0 * this.dauK(T.id, gd);
    const dau = this.co(this.dauTen(T.id, gd), D, da ? 'xam' : '');
    // animation hybrid (anim.js): thở / tụ lực / giật / hồi lò xo / xung hỗ trợ — hàm của thời gian sự kiện thật, không chặn phát bắn
    const AU = typeof AN !== 'undefined' && !o.ghost && !T.st.bang ? AN.u(T, D) : null;
    if (dau) {
      ctx.save();
      let goc = T.goc;
      if (T.id === 'mana') { goc = 0; const p = 1 + 0.1 * T.sang; ctx.translate(0, -2); ctx.scale(p, p); } // VFX P3: bỏ nhún + phập phồng ảnh đầu (lúc sinh mana vẫn phồng 1 nhịp theo T.sang)
      if (T.id === 'mimic') goc = T.goc;
      if (skT.gocDau) { const g2 = skT.gocDau(T, this.t, ctx); if (g2 != null) goc = g2; } // đầu không xoay theo mục tiêu (hộp, cột…)
      // đầu súng + bóng mềm đổ xuống bệ, dựng sẵn chung 1 ảnh → 1 lần vẽ xoay mỗi ụ (thay vì 2)
      if (AU) { if (AU.by) ctx.translate(0, AU.by); AN.veDuoi(ctx, T, C0, al, gd, da, this, goc); }
      ctx.rotate(goc + (AU ? AU.tw : 0)); ctx.translate(AU ? AU.rx : (T.rx || 0), AU ? AU.py : 0);
      if (AU && (AU.sx !== 1 || AU.sy !== 1)) ctx.scale(AU.sx, AU.sy);
      if (!VX.veBien(ctx, T, C0, al, da, this)) this.veDauLop(ctx, T.id, gd, C0, al, 1, da); // đang biến hình: hoà 2 dạng
      if (AU) AN.veTren(ctx, T, C0, al, gd, da, this);
      // ánh sáng phụ: mimic cầu vồng, mana phát sáng, tesla cuộn nạp, laser nóng
      let sang = 0;
      if (T.id === 'mana') sang = 0.2 + T.sang * 0.6; // VFX P3: bỏ đầu sáng phập phồng
      if (T.id === 'set' && T.cd < 0.18 && !da) sang = (0.18 - T.cd) * 4;
      if (T.id === 'laser' && T.las && T.las.on) sang = 0.2 + T.las.ramp * 0.5;
      if (T.id === 'overlord') sang = T.nap * T.nap * 0.7;
      if (T.id === 'mimic') sang = Math.max(sang, 0.3); // VFX P3: bỏ nhấp nháy
      if (T.chop > 0) sang = Math.max(sang, T.chop * 3);
      if (skT.sangDau) sang = Math.max(sang, skT.sangDau(T, this.t) || 0);
      if (AU && AU.glow > 0.004) sang = Math.max(sang, AU.glow); // thở lõi 1–3% · tụ lực · xung (anim.js)
      if (sang > 0 && !da) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * Math.min(0.45, sang * 0.6); ctx.drawImage(dau, -D / 2, -D / 2, D, D); }
      ctx.restore();
      if (T.id === 'mimic') { // ánh cầu vồng chạy vòng (bản sắc Mimic; buff Aurora hiện bằng ký hiệu)
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.1;
        const mau = ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'];
        const k = Math.floor(this.t * 3 + (T.pha || 0)) % 5;
        const a = this.t * 2.5 + (T.pha || 0);
        this.anhGiua(ctx, this.cham1(mau[k]), Math.cos(a) * S * 0.26, Math.sin(a) * S * 0.26, S * 0.45);
        ctx.restore(); ctx.globalAlpha = al;
      }
    } else if (!o.ghost && typeof TAI !== 'undefined') TAI.veXoay(ctx, 0, 0, D * 0.55); // đầu súng đang tải: vòng xoay PNG nhỏ (không vẽ hình thay thế)
    // tesla: cuộn sáng ở đầu nòng trước khi phóng
    if (T.id === 'set' && T.cd < 0.18 && !da && !o.ghost) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.18 - T.cd) * 3;
      this.anhGiua(ctx, this.cham1('#fff27a'), Math.cos(T.goc) * D * 0.4, Math.sin(T.goc) * D * 0.4, S * 0.5); ctx.restore(); ctx.globalAlpha = al;
    }
    // nạp năng lượng / hồi chiêu kỹ năng: VÒNG XANH LÁ đầy dần từ 12 giờ theo chiều kim đồng hồ (PX.vongHoi — cùng kiểu mọi chế độ)
    // vẽ SAU đầu súng (không bị đầu che), TRƯỚC huy hiệu sao (huy hiệu luôn nằm trên)
    if (!o.ghost && !laGrow(T.id) && (typeof MV !== 'undefined' ? MV.coNap(T) : T.nap > 0.02 && (T.id === 'overlord' || T.id === 'wallgen' || T.id === 'blackhole' || T.id === 'mana' || skT.napMau))) { // luật chung MV.coNap (motvong.js)
      ctx.save(); PX.vongHoi(ctx, T, T.nap, S * 0.41, al, this.t, !!skT.chuDong); ctx.restore(); ctx.globalAlpha = al;
    }
    // vẽ thêm riêng của kỹ năng (quả cầu, đồng hồ bom, hào quang, dây liên kết…) — toạ độ quanh tâm ụ
    if (skT.veThem && !o.ghost) { ctx.save(); skT.veThem(ctx, T, S, al, this, B); ctx.restore(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over'; }
    // bản sao của Copycat: quầng TÍM (màu ảo ảnh của đầu Copycat) rõ hơn + huy hiệu nho/saochep ở góc trên-trái (nhandien.js) → không nhầm với ụ thật
    if (T.banSao && !o.ghost) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.22; this.anhGiua(ctx, this.cham1('#a35cff'), 0, 0, S * 1.05); /* VFX P3 */ ctx.restore(); ctx.globalAlpha = al; }
    const xich = T.st.kep > 0 && !o.ghost ? this.co('vong_xich', S * 0.9) : null; // vòng xích ChatGPT (S4), xoay chậm
    if (xich) { ctx.save(); ctx.globalAlpha = al * 0.9; ctx.rotate(this.t * 0.6); ctx.drawImage(xich, -S * 0.45, -S * 0.45, S * 0.9, S * 0.9); ctx.restore(); ctx.globalAlpha = al; }
    // lớp phủ trạng thái
    // băng (Freezer & mọi nguồn): khối băng bọc ô + vành + lấp lánh; hết băng → vỡ (js/bangfx.js)
    if (T.st.bang > 0 && !o.ghost) { if (typeof BANGFX !== 'undefined') BANGFX.ve(ctx, T, S, al, this, B, x, y); else { ctx.globalAlpha = al * 0.95; this.ve1(ctx, 'phu_bang', S * 1.12); ctx.globalAlpha = al; } }
    else if (T._bangVe && !o.ghost && typeof BANGFX !== 'undefined') BANGFX.vo(T, B, x, y);
    if (da) this.ve1(ctx, 'phu_da', S * 1.15);
    if (T.st.lua > 0) { const f = 1; ctx.save(); ctx.scale(f, f); // VFX P3: bỏ phập phồng ảnh lửa
      this.ve1(ctx, 'phu_lua', S * 1.2, '', 0, -2); ctx.restore(); }
    if (T.st.ngam > 0 && !T.st.ngamK) { ctx.save(); ctx.rotate(this.t * 2); /* ngamK: dấu báo chiêu trùm riêng (trumvfx.js) */ const f = 1.25 - 0.2 * (1 - T.st.ngam / 1.4); ctx.globalAlpha = al * (0.6 + 0.4 * Math.sin(this.t * 24)); this.anhGiua(ctx, 'phu_ngam', 0, 0, S * f); ctx.restore(); ctx.globalAlpha = al; }
    ctx.restore();

    // lớp UI trên ụ (không xoay theo đầu súng, neo theo ô): huy hiệu cấp sao + biểu tượng buff nhỏ
    if (!o.noBadge) {
      const C = St / 0.98; // cạnh ô (đã gồm tỉ lệ phóng)
      ctx.globalAlpha = al;
      const hs = A ? A.huy : 1; // huy hiệu sao bật nảy lúc lộ kết quả ghép
      // biểu tượng loại (trên-trái) + số sao (trên-phải): vẽ SAU đạn/hiệu ứng (lớp huy hiệu) → không bị che
      if (hs > 0.02) { const h = ND.xep(T, x, y + oy, C, hs, al, B); h.dong = hs !== 1 || kS !== 1; if (this._hang && !o.ghost) this._hang.push(h); else ND.veHuyHieu(ctx, h); }
      const k2 = C / Math.min(B.cw, B.ch);
      // buff: không còn ký hiệu nhỏ trên ô — hiện bằng hào quang ảnh quanh đầu súng (buffvfx.js), số chỉ ở bảng chạm
    }
    ctx.globalAlpha = 1;
    if (A) VX.sau(ctx, T, x, y, St, A);
  },
  dauBong(ten, D, da) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(D * k)), key = 'db|' + ten + '|' + n + '|' + (da ? 1 : 0);
    let c = this.cGet(key); if (c) return c;
    const a = this.co(ten, D, da ? 'xam' : ''); if (!a) return null;
    const pad = Math.ceil(n * 0.12), N = n + pad * 2;
    c = document.createElement('canvas'); c.width = c.height = N;
    const x = this.c2d(c), ox = pad + Math.round((n - a.width) / 2), oy = pad + Math.round((n - a.height) / 2); // đặt nguyên điểm ảnh: không nhoè thêm
    x.filter = 'blur(' + Math.max(1, n / 30) + 'px)'; x.drawImage(a, ox, oy + n * 0.035); x.filter = 'none';
    x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 0, N, N); // vetay-ok: png (bóng đầu súng = ảnh tô đen)
    x.globalCompositeOperation = 'source-over'; x.drawImage(a, ox, oy);
    c.sc = N / n;
    return this.cSet(key, c);
  },
  // thân ụ dựng sẵn: BỆ CHUNG trung tính (de_chung.png, mọi ụ như nhau) + viên ngọc độ hiếm nhỏ ở mép bệ.
  // Không còn vòng bậc / ô xúc xắc sao (tư vấn B.2, G). Bệ = 70% cạnh ngắn ô (~60% cạnh dài), tròn tuyệt đối.
  // Ụ MODULE (claude/u-module): 7 ụ có BỆ RIÊNG gen ChatGPT (tools/thap-cat-umod.py) — hình bóng khác nhau thay bệ tròn chung.
  // giá trị = khung ảnh <id>_de / cạnh lớn nhất của bệ (tâm ảnh = điểm gắn đầu) → bệ chiếm cùng chỗ với de_chung (SB)
  DE_RIENG: { canon: 1.017, lien: 1.025, set: 1.261, bang: 1.062, radar: 1.014, blackhole: 1.101, doc: 1.013 },
  than(T, S, da, bong) {
    const km = 0; // (vòng màu khoá đã bỏ)
    // bệ riêng đã tải xong → dùng; đang tải / lỗi → bệ chung (không chờ)
    const kR = this.DE_RIENG[T.id], tenR = kR ? T.id + '_de' : null;
    const rieng = tenR && this.img(tenR) ? tenR : null, ten = rieng || 'de_chung';
    const k = this.s * this.dpr, n = Math.round(S * 1.5 * k), key = 'than|' + (rieng || T.bac) + '|' + (da ? 1 : 0) + '|' + n + (bong ? '|b' : '') + '|' + km;
    let c = this.cGet(key); if (c) return c;
    let de = da ? this.banXam(ten) : this.img(ten);
    if (!de && !(this.anh[ten] && this.anh[ten]._loi)) return null; // còn đang tải
    if (!de) return null; // KHÔNG vẽ bệ code (đang tải → vòng xoay PNG)
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = this.c2d(c);
    const q = n / (S * 1.5); x.scale(q, q); x.translate(S * 0.75, S * 0.75);
    const SB = S * 0.714, SD = rieng ? SB * kR : SB;
    de = this.mip(de, SD * q);
    if (bong) { x.globalAlpha = 0.7; x.drawImage(this.cham1('#000000'), 2 - SB * 0.62, SB * 0.06 + 3 - SB * 0.62, SB * 1.24, SB * 1.24); x.globalAlpha = 1; } // bóng = PNG tô đen
    x.drawImage(de, -SD / 2, -SD / 2, SD, SD);
    // (bỏ vòng màu khoá vẽ code quanh bệ — QUY-TAC-HINH 1/4; nhận diện = biểu tượng vai trò PNG góc ô)
    // (BỎ vòng bậc tier_ring_<bac> quanh bệ — người dùng 2026-11-06: đầu ụ đã thể hiện bậc; mọi chế độ / bóng kéo / bảng kết quả đều qua hàm này)
    return this.cSet(key, c);
  },
  // HUY HIỆU CẤP SAO (TU-VAN-NHAN-DIEN 7C): 1 lục giác tối cố định, viền vàng nhạt, SỐ to màu ngà (1–7) — cùng cỡ mọi cấp.
  // Không xoay, neo góc trên-phải ô. 7★: nền đỏ thẫm + vương miện nhỏ phía trên (ngoài huy hiệu).
  huyHieu(n, d) {
    const anh = this.img(n >= 7 ? 'sao_hex7' : 'sao_hex'); // tấm lục giác ChatGPT (S2); chưa tải → vẽ code
    if (!anh) return null; // chưa tải: không vẽ lục giác code
    const k = this.s * this.dpr, N = Math.max(8, Math.round(d * 1.5 * k)), key = 'hh2|' + n + '|' + N + (anh ? '|a' : '');
    let c = this.cGet(key); if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = N;
    const x = this.c2d(c), q = N / (d * 1.5); x.scale(q, q); x.translate(d * 0.75, d * 0.75);
    const R = d / 2;
    x.lineJoin = 'round';
    if (anh) {
      // sao_hex: lục giác chiếm ~94% ô; sao_hex7 có vương miện phía trên (lục giác ở ~70% dưới) → canh để lục giác trùng chỗ cũ
      const w = n >= 7 ? R * 2.75 : R * 2.2, oy = n >= 7 ? -R * 0.3 : 0;
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
      const px = w * q, cx = N / 2, cy = N / 2 + oy * q;
      this.veNho(x, anh, 0, 0, anh.width, anh.height, Math.round(cx - px / 2), Math.round(cy - px / 2), Math.round(px), Math.round(px));
      x.restore();
      const f = Math.round(R * 1.42 * 10) / 10;
      x.font = '800 ' + f + 'px ' + FONT.display; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = R * 0.22; x.strokeStyle = '#05070a'; x.strokeText(n, 0, R * 0.09);
      x.fillStyle = '#fff6df'; x.fillText(n, 0, R * 0.09);
      return this.cSet(key, c);
    }
  },
  veHuyHieu(ctx, x, y, n, d) { const c = this.huyHieu(n, d); if (!c) return; ctx.drawImage(c, x - d * 0.75, y - d * 0.75, d * 1.5, d * 1.5); },
  // ---------- MƯỢT KÉO GHÉP (docs/demo-hop-tuong/tuvan/muotghep): cỡ ĐANG CHUYỂN ĐỘNG → bậc cỡ cố định ----------
  // Huy hiệu / tấm phóng to-nhỏ mỗi khung trước đây dựng 1 canvas MỚI mỗi khung (thu nhỏ nhiều bước từ PNG 3×) → giật.
  // qd(): làm tròn LÊN cỡ về lưới hình học 8 % (điểm ảnh thiết bị) → mỗi bậc dựng 1 lần, vẽ thu ≤ 8 % (vẫn nét).
  qd(d) { const k = this.s * this.dpr, n = Math.max(2, d * k), L = Math.log(1.08); return Math.pow(1.08, Math.ceil(Math.log(n) / L - 1e-6)) / k; },
  // huy hiệu cỡ động: canvas ở bậc qd(d), vẽ đúng cỡ d (tỉ lệ ô vẽ / d đọc từ chính canvas → hợp cả bản hud2 1.7d lẫn bản gốc 1.5d)
  huyHieuDong(n, d) { const dq = this.qd(d), c = this.huyHieu(n, dq); if (c) c._E = c.width / (dq * this.s * this.dpr); return c; },
  veHuyHieuDong(ctx, x, y, n, d) { const c = this.huyHieuDong(n, d); if (!c) return; const P = d * c._E; ctx.drawImage(c, x - P / 2, y - P / 2, P, P); },
  // việc dựng sẵn rải theo khung: mỗi khung chạy 1 việc nhỏ (không dồn vào 1 khung)
  _nong: [], _nongCo: new Set(),
  nong(key, fn) { if (key && this._nongCo.has(key)) return; if (key) this._nongCo.add(key); this._nong.push(fn); },
  chayNong() { for (let i = 0; i < 1 && this._nong.length; i++) { const f = this._nong.shift(); try { f(); } catch (e) { } } },
  ctxNong() { if (!this._cn) { const c = document.createElement('canvas'); c.width = c.height = 2; this._cn = c.getContext('2d'); } this._cn.setTransform(1, 0, 0, 1, 0, 0); this._cn.globalAlpha = 1; return this._cn; },
  // dựng sẵn huy hiệu sao n ở nhiều cỡ: MỖI cỡ 1 việc (1 khung) — không dồn
  nongHuy(n, ds) { for (const d of ds) this.nong('hd|' + n + '|' + Math.round(this.qd(d) * this.s * this.dpr), () => this.huyHieuDong(n, d)); },
  // ấn giữ 1 ụ (trước khi kéo đủ 7 px): dựng sẵn bóng nhấc + huy hiệu sao các bậc sẽ dùng khi rê/thả (rải theo khung)
  nongKeo(T) {
    if (!T || !G.ban.length) return;
    const B = G.ban[T.ban] || G.ban[0], C = Math.min(B.cw, B.ch), n1 = Math.min(LUAT.saoMax, T.sao + 1), ds = [];
    this.nong('bong|' + Math.round(C * 0.74 * this.s * this.dpr), () => this.co('de_chung', C * 0.74, 'den'));
    for (const k of [0.7, 0.8, 0.9, 1]) ds.push(C * 0.42 * k); // sao kế tiếp bay lên (GF.veXemTruoc)
    for (let k = 0.9; k <= 1.36; k *= 1.08) ds.push(C * 0.34 * 1.8 * k); // con dấu sao lúc ghép (GF.veDau)
    for (const k of [1.1 / 0.98]) ds.push(C * 0.34 * k); // huy hiệu ụ đang nhấc (phóng 1.10)
    this.nongHuy(n1, ds); this.nongHuy(T.sao, [C * 0.34 * 1.1]);
  },


  // laser: bật/tắt mờ dần (thời gian thực), cuộn vân + độ rộng/độ sáng dao động theo thời gian (không theo khung)
  veLaser(ctx) {
    const dt = this.dt;
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.id !== 'laser') continue;
      const E = T.las && T.las.E, bat = !!(T.las && T.las.on && E && !E.chet && !(T.st.bang > 0) && !T.st.da);
      if (bat) { T._lx = E.x; T._ly = E.y; T._lr = T.las.ramp; }
      T._la = (T._la || 0) + ((bat ? 1 : 0) - (T._la || 0)) * (1 - Math.exp(-dt * (bat ? 22 : 12))); // theo thời gian (30/60 FPS như nhau)
      if (T._la < 0.02 || T._lx === undefined) continue;
      const [x, y] = typeof AN !== 'undefined' ? AN.muzzle(T) : dauNong(T), r = T._lr || 0, tt = this.t;
      const A = T._la * (0.94 + 0.06 * Math.sin(tt * 7.3 + (T.uid || 0))); // tia: alpha dao động rất nhẹ (không nhấp nháy)
      const w = (6 + r * 10) * (0.55 + 0.45 * A); // VFX P3: bỏ rung bề rộng tia (tia vẫn chạy = ảnh cuộn dọc)
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = A * 0.9;
      this._T = T; this.tia(ctx, 'tia_laser', x, y, T._lx, T._ly, w, tt * 420); this._T = null;
      ctx.globalAlpha = A * 0.9;
      const lt = typeof FXU !== 'undefined' && FXU.ten(T, 'trung'), ln = typeof FXU !== 'undefined' && FXU.ten(T, 'no');
      const ds3 = lt && typeof CG !== 'undefined' && CG.K3 && CG.K3.dai(lt, 'trung'); // VFX P3: điểm cháy = dải dựng sẵn (loé → bung → khoét) chạy LẶP khung 1–4, không còn ảnh tĩnh xoay + phập phồng
      if (ds3) { ctx.globalCompositeOperation = 'source-over'; this.khungMuot(ctx, null, 1 + (tt * 12) % 3.999, T._lx, T._ly, (26 + r * 18) * (0.75 + 0.25 * A) / 0.88, 0, A * 0.95, ds3); ctx.globalCompositeOperation = 'lighter'; }
      else if (lt) { ctx.globalCompositeOperation = 'source-over'; this.anhGiua(ctx, lt, T._lx, T._ly, (26 + r * 18) * (0.75 + 0.25 * A), 0, A * 0.95); ctx.globalCompositeOperation = 'lighter'; }
      else this.khungMuot(ctx, 'fx_laser_trung', 1 + (tt * 14) % 2.999, T._lx, T._ly, (30 + r * 26) * (0.7 + 0.3 * A), tt * 3, 1);
      if (ln) FXU.veNeo(ctx, ln, x, y, (22 + r * 8) * (0.7 + 0.3 * A), T.goc, A * 0.9);
      else { ctx.globalAlpha = A * 0.6; this.anhGiua(ctx, this.cham1('#ff7af0'), x, y, (16 + r * 8) * (0.6 + 0.4 * A)); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  },
  // đạn: vị trí nội suy + VỆT (motion blur) dài theo vận tốc thật trên màn (2×/3× → vệt dài hơn, không "dịch chuyển tức thời"),
  // hiện dần ở đầu nòng, đạn liên thanh thành chuỗi tia sáng
  veDan(ctx) {
    const k = G.tocDo || 1, dt = this.dt;
    for (const d of G.dan) {
      const z = d.z || 0, hx = d.x, hy = d.y - z;
      d._ra = (d._ra || 0) + dt;
      // muzzle: đạn sinh ở tâm ụ → che dưới đầu súng tới khi qua mũi nòng (anim.js) — hiện ra đúng cửa nòng
      const che = typeof AN !== 'undefined' && d.T ? AN.danChe(d) : 0, di = che ? Math.hypot(hx - d.sx, hy - d.sy) : 0;
      if (che && di < che) continue;
      if (d._v0 === undefined) d._v0 = [hx, hy];
      const hien = Math.min(1, d._ra / 0.05), sc = 0.55 + 0.45 * hien;
      if (d.cong) { this.anhGiua(ctx, this.cham1('#000000'), d.x, d.y + 3, (4 + z * 0.02) * 2.6, 0, hien * 0.45); ctx.globalAlpha = 1; } // bóng đạn cong = PNG tô đen
      // hướng bay trên màn = hướng chuyển động giữa 2 bước (gồm cả độ cao vòng cung)
      let goc = d.goc || 0;
      if (d._x !== undefined) { const mx = hx - d._x, my = hy - (d._y - (d._z || 0)); if (mx * mx + my * my > 0.04) goc = Math.atan2(my, mx); }
      if (d._g == null) d._g = goc; else d._g += gocLech(d._g, goc) * (1 - Math.exp(-dt * 30)); // hướng vẽ mượt (đạn đuổi rẽ cong êm) — theo thời gian, không theo khung
      goc = d._g;
      const co = d.co * (1 + z / 140) * sc;
      const dv2 = typeof FXU !== 'undefined' && !d.mau && ((d.T && FXU.DAN_CHUNG.has(d.img) && FXU.ten(d.T, 'dan')) || (FXU.THAY[d.img] && FXU.co(FXU.THAY[d.img]) && FXU.THAY[d.img]));
      if (dv2) { // đạn v2 của ụ (ảnh đã có vệt chuyển động) — neo ở thân đạn, xoay theo hướng bay
        ctx.globalCompositeOperation = 'source-over';
        FXU.veNeo(ctx, dv2, hx, hy, co * 0.85 * ((d.T && FXU.cfg(d.T.id).k) || 2.3), goc, hien);
        ctx.globalAlpha = 1; continue;
      }
      if (d.img !== 'dan_phao') {
        const mau = d.mau || MAU_VET[d.img] || '#ffd080', tracer = d.img === 'dan_lien' ? 2.6 : 1.5;
        let L = d.sp * k / 60 * tracer + co * 0.6;
        const tu = Math.hypot(hx - d.sx, hy - d.sy) - che + co * 0.3; // không kéo vệt ra sau đầu nòng
        L = Math.min(L, tu, 150);
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(goc);
        ctx.globalCompositeOperation = 'lighter';
        if (L > 2) { const wv = Math.max(5, co * 0.62), vt = typeof FXU !== 'undefined' && FXU.co('fx_vet_trang') && FXU.mau('fx_vet_trang', mau); ctx.globalAlpha = 0.9 * hien; ctx.drawImage(vt || this.vet(mau), -L + co * 0.18, -wv / 2, L, wv); }
      } else { ctx.save(); ctx.translate(hx, hy); ctx.rotate(goc); }
      ctx.globalAlpha = hien;
      const im = d.mau ? this.toMauA(d.img, d.mau, 0.6) : this.co(d.img, d.co); // đạn chung tô màu nguyên tố của ụ (ảnh PNG tô màu — QUY-TAC mục 3)
      if (im && im.width > 1) { const h = co * im.height / im.width; ctx.drawImage(im, -co / 2, -h / 2, co, h); }
      else if (this.dbg) { ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill(); } // vetay-ok: debug
      ctx.restore();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  },
  veFx(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    for (const a of FX.anim) {
      const u = Math.min(1, a.t / a.song);
      if (a.mot) { this.veMot(ctx, a, u); continue; }
      let x = a.x, y = a.y, goc = a.goc, al, sc;
      if (a.bam && !a.bam.chet) { x = a.bam.x; y = a.bam.y; }
      if (a.ten === 'chop_nong') { // chớp đầu nòng: bung nhanh (ease-out) rồi tắt mềm, bám theo nòng đang xoay/giật
        const T = a.T;
        if (T && G.ban[T.ban] && G.ban[T.ban].t[T.o] === T) { [x, y] = typeof AN !== 'undefined' ? AN.muzzle(T, a.lat) : dauNong(T); goc = T.goc + (a.dg || 0); } // muzzle socket (anim.js)
        sc = 0.55 + 0.6 * (1 - (1 - u) * (1 - u) * (1 - u)); al = (1 - u) * (1 - u) * (1.4 - 0.4 * u);
      } else {
        sc = 0.9 + 0.16 * (1 - (1 - u) * (1 - u));
        al = Math.min(1, u / 0.06);
        if (u > 0.65) { const v = (u - 0.65) / 0.35; al *= 1 - v * v * (3 - 2 * v); }
      }
      ctx.globalAlpha = 1;
      const aI = this.img('fx_' + a.ten), nK = aI ? Math.round(aI.width / aI.height) : 6; // dải 6 khung (fx_*) hoặc 16 khung (fx_trum_<id>)
      this.khungMuot(ctx, 'fx_' + a.ten, u * (nK - 0.001), x, y, a.co * sc, goc, Math.min(0.82, al) * (window.CG ? CG.kA(a) : 1)); // trần độ sáng cộng · CG.kA: trần sáng chung + chỉ 1 dải T4 sáng đủ (camgiac.js)
    }
    const vm = typeof FXU !== 'undefined' && FXU.co('fx_vong_mong') && this.img('fx_vong_mong');
    for (const v of FX.vong) {
      const u = v.t / v.song, e = 1 - (1 - u) * (1 - u);
      if (vm) { // vòng mảnh PNG (T22) tô màu — thay arc vẽ code
        const r = Math.max(1, v.r0 + (v.r1 - v.r0) * e), im = FXU.mau('fx_vong_mong', v.mau);
        if (im) { ctx.globalAlpha = (1 - u) * 0.85; ctx.drawImage(this.mip(im, r * 2.3 * this.s * this.dpr), v.x - r * 1.15, v.y - r * 1.15, r * 2.3, r * 2.3); }
        continue;
      }
      // fx_vong_mong chưa tải: không vẽ vòng code
    }
    const lua = this.co('tia_lua', 24), tuyet = this.co('hat_tuyet', 12); // hat_tuyet: bông tuyết ChatGPT (S4) cho Blizzard
    const v2 = typeof FXU !== 'undefined' && FXU.co('fx_cham_trang'), than = v2 && FXU.co('fx_than') && this.co('fx_than', 24); // hạt chung T22
    for (const p of FX.hat) {
      const u = p.t / p.song;
      if (p.k === 'khoi') continue;
      if (p.k === 'bui') continue;
      ctx.globalAlpha = (1 - u) * Math.min(1, u * 14 + 0.3) * 0.75;
      const c = p.co * (p.k === 'than' ? 1 : 1 - u * 0.5);
      if (p.k === 'lua' && lua && (p.mau === '#ffb060' || p.mau === '#ffd080')) ctx.drawImage(lua, p.x - c / 2, p.y - c / 2, c, c);
      else if (p.mau === '#e8fbff' && tuyet) ctx.drawImage(tuyet, p.x - c * 1.1, p.y - c * 1.1, c * 2.2, c * 2.2);
      else if (p.k === 'than' && than) { const tm = this.laLua(p.mau) ? than : FXU.mau('fx_than', p.mau); if (tm) ctx.drawImage(tm === than ? than : this.mip(tm, c * 2 * this.s * this.dpr), p.x - c, p.y - c, c * 2, c * 2); } // than KHÔNG phải lửa (băng / nước / tím…) → ảnh fx_than tô màu nguyên tố (trước: luôn than hồng cam)
      else if (v2) { const im = FXU.mau('fx_cham_trang', p.mau); if (im) ctx.drawImage(this.mip(im, c * 2 * this.s * this.dpr), p.x - c, p.y - c, c * 2, c * 2); }
      else ctx.drawImage(this.mip(this.cham1(p.mau), c * 2 * this.s * this.dpr), p.x - c, p.y - c, c * 2, c * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // khói + bụi (hoà trộn thường)
    for (const p of FX.hat) {
      const u = p.t / p.song;
      if (p.k === 'khoi') { // khói: hoà 2 khung liền nhau, hiện dần + tan dần
        const fk = u * 3.999, f0 = Math.floor(fk); let fr = Math.max(0, (fk - f0 - 0.4) / 0.6); fr = fr * fr * (3 - 2 * fr); const A = 0.55 * Math.min(1, u / 0.12) * (1 - u * u), cs = p.co * (0.8 + u * 0.9);
        if (fr < 0.98) { ctx.globalAlpha = A * (1 - fr); this.anhGiua(ctx, 'khoi_' + f0, p.x, p.y, cs, p.xoay); }
        if (fr > 0.02 && f0 < 3) { ctx.globalAlpha = A * fr; this.anhGiua(ctx, 'khoi_' + (f0 + 1), p.x, p.y, cs, p.xoay); }
      }
      else if (p.k === 'bui') { ctx.globalAlpha = 0.5 * (1 - u); const r = p.co * (0.6 + u * 0.7), b = typeof FXU !== 'undefined' && FXU.co('fx_bui') && this.img('fx_bui'); ctx.drawImage(this.mip(b || this.bui1(), r * 2 * this.s * this.dpr), p.x - r, p.y - r, r * 2, r * 2); }
    }
    ctx.globalAlpha = 1;
  },
  // ảnh tĩnh v2 (fxu.js): chớp nòng phóng 0.55→1.15 ease-out, mờ (1−u)², bám nòng · nổ trúng phóng 0.6→1.1, mờ sau 65%
  veMot(ctx, a, u) {
    const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'source-over';
    if (a.mot === 'no') {
      let x = a.x, y = a.y, goc = a.goc; const T = a.T;
      if (T && G.ban[T.ban] && G.ban[T.ban].t[T.o] === T) { [x, y] = typeof AN !== 'undefined' ? AN.muzzle(T, a.lat) : dauNong(T); goc = T.goc + (a.dg || 0); } // muzzle socket (anim.js)
      const e = 1 - (1 - u) * (1 - u) * (1 - u);
      FXU.veNeo(ctx, a.ten, x, y, a.co * (0.55 + 0.6 * e), goc, Math.min(1, (1 - u) * (1 - u) * 1.3));
    } else {
      const e = 1 - (1 - u) * (1 - u); let al = Math.min(1, u / 0.08);
      if (u > 0.65) { const v = (u - 0.65) / 0.35; al *= 1 - v * v * (3 - 2 * v); }
      let x = a.x, y = a.y; if (a.bam && !a.bam.chet) { x = a.bam.x; y = a.bam.y; }
      this.anhGiua(ctx, a.ten, x, y, a.co * (0.6 + 0.5 * e), a.goc, al * (window.CG ? CG.kA(a) : 1));
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = op;
  },
  veKeo(ctx) {
    const k = UI.keo; if (!k || !k.dang) return;
    const T = k.T;
    const [hx, hy] = UI.diemKeo(k); // đầu ụ nằm trên ngón tay (chạm) — điểm thả = tâm đầu ụ
    this.veU(ctx, T, hx, hy - (k.lech ? 0 : 10), { scale: 1.12 });
  },
  veChu(ctx) {
    ctx.textAlign = 'center'; ctx.lineJoin = 'round';
    for (const c of FX.chu) {
      const u = c.t / c.song;
      let sc = 1, y = c.y - VX.eo(u) * (c.kieu === 'crit' ? 17 : c.kieu ? 26 : 13);
      if (c.kieu === 'crit') sc = c.t < 0.09 ? 1 + 0.12 * Math.sin(c.t / 0.09 * Math.PI) : 1; // chí mạng: nảy 112% trong 90 ms
      if (c.kieu === 'nhan') { sc = u < 0.1 ? 0.6 + u * 4 : 1; y = c.y - Math.min(1, u * 4) * 10; }
      if (c.kieu === 'to') { sc = u < 0.15 ? 0.5 + u / 0.15 * 0.7 : 1.2 - Math.min(0.2, (u - 0.15)); y = c.y - u * 18; }
      ctx.globalAlpha = u > 0.7 ? (1 - u) / 0.3 : 1;
      if (c.kieu !== 'nhan') {
        const mx = c.kieu === 'crit' ? 1.6 : c.kieu === 'to' ? 1.2 : 1, px = Math.round(c.co * mx), im = this.chuAnh(c.s, c.mau, px), q = sc / mx;
        let q2 = q; if (im.lw * q2 > W - 12) q2 = (W - 12) / im.lw; // chữ dài: tự thu nhỏ cho vừa màn
        const w = im.lw * q2, h = im.lh * q2, cx = clamp(c.x, w / 2 + 2, W - w / 2 - 2);
        if (c.kieu === 'mana') this.anhGiua(ctx, 'ui_mana', cx - im.tw * q / 2 - 8, y - c.co * 0.35, 14);
        this.veChuAnh(ctx, im, cx - w / 2, y - im.by * q2, w, h);
        continue;
      }
      ctx.font = '900 ' + Math.round(c.co * sc) + 'px ' + FONT.display;
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      if (c.kieu === 'nhan') { // nhãn kỹ năng trên ụ: viên thuốc tối viền màu bậc
        const w = Math.ceil(ctx.measureText(c.s).width) + 14, h = Math.round(c.co * sc) + 7, cy = y - h / 2 + 4; // cy = tâm viên thuốc
        const x = clamp(c.x, w / 2 + 4, W - w / 2 - 4); // không tràn mép màn
        const kn = this.img('nhan_kn'); // tấm viên thuốc ChatGPT (S10-7), co giãn 3 mảnh; chưa tải → viên thuốc vẽ code (dự phòng)
        if (kn) { const sw = kn.width, sh = kn.height, cs = Math.round(sw * 0.24), hh = h + 6, cd = cs * hh / sh, ww = Math.max(w + 10, cd * 2 + 2), x0 = x - ww / 2, y0 = cy - hh / 2;
          ctx.drawImage(kn, 0, 0, cs, sh, x0, y0, cd, hh); ctx.drawImage(kn, cs, 0, sw - 2 * cs, sh, x0 + cd, y0, ww - 2 * cd, hh); ctx.drawImage(kn, sw - cs, 0, cs, sh, x0 + ww - cd, y0, cd, hh); }
        // nhan_kn chưa tải: chỉ chữ (không viên thuốc code)
        ctx.textBaseline = 'middle'; if (!kn) ctx.strokeText(c.s, x, cy + 0.5); ctx.fillStyle = c.mau; ctx.fillText(c.s, x, cy + 0.5); ctx.textBaseline = 'alphabetic'; continue;
      }
      if (c.kieu === 'mana') { this.anhGiua(ctx, 'ui_mana', c.x - ctx.measureText(c.s).width / 2 - 8, y - c.co * 0.35, 14); }
      const hw = ctx.measureText(c.s).width / 2 + 4, cx = clamp(c.x, hw, W - hw);
      ctx.strokeText(c.s, cx, y); ctx.fillStyle = c.mau; ctx.fillText(c.s, cx, y);
    }
    ctx.globalAlpha = 1;
  },
};
