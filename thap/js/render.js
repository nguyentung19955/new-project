// TURRET MERGE — vẽ: mọi hình là ảnh ChatGPT trong assets/; code chỉ vẽ hạt, quầng sáng, bóng, chữ, thanh máu
'use strict';

// màu vệt đạn theo ảnh đạn
const MAU_VET = { dan_lien: '#ffb347', dan_bang: '#8fe3ff', dan_doc: '#8dff4a', dan_tia: '#7fd0ff', tia_lua: '#ffc070' };
const REN = {
  cv: null, ctx: null, s: 1, dpr: 1, anh: {}, nen: null, xam: {}, trang: {}, cham: {}, cache: {}, t: 0, thieu: new Set(), dt: 0, a: 1, _vet: {}, _glow: {},

  init(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d', { alpha: false }); // canvas đục: trình duyệt khỏi trộn nền khi ghép lớp
    this.coLai();
    addEventListener('resize', () => this.coLai());
    if (document.fonts) document.fonts.addEventListener('loadingdone', () => { this._chu = null; this.cache = {}; }); // phông về muộn: dựng lại ảnh chữ
  },
  // Độ phân giải vẽ = đúng mật độ điểm ảnh thật của máy (tối đa 3×). Trước đây kẹp 2× → máy 3× (iPhone, nhiều Android)
  // phải phóng ảnh 1.5× → mọi hình mềm nhoè, viền răng cưa. Máy yếu (khung > 18 ms kéo dài) tự lùi về 2×.
  coLai() {
    const vw = innerWidth, vh = innerHeight;
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
    this.min(this.ctx); this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round'; // nét vẽ (vòng, tia, sét) đầu tròn, khử răng cưa
    this.cache = {}; this._chu = null;
    if (G.ban.length) this.lamNen();
  },
  // bật lọc ảnh chất lượng cao cho mọi ngữ cảnh vẽ 2D
  min(x) { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; return x; },
  c2d(c) { return this.min(c.getContext('2d')); },
  // theo dõi thời gian khung: máy không kham nổi 3× (TB > 18 ms suốt ~3 s khi đang chơi) → lùi về 2× một lần
  doKhung(dt) {
    if (this.dpr <= 2 || !G.ban.length || G.dung || !(dt > 0) || dt > 0.1 || (G.debug && G.debug.dpr)) return;
    this._ft = this._ft == null ? dt : this._ft * 0.94 + dt * 0.06;
    if (this._ft > 0.018) {
      if ((this._cham = (this._cham || 0) + dt) > 3) { this.dprMax = 2; this._ft = null; this._cham = 0; this.coLai(); }
    } else this._cham = Math.max(0, (this._cham || 0) - dt);
  },
  // thu nhỏ chất lượng cao: giảm một nửa nhiều bước (mỗi bước lọc 'high') tới khi còn ≤ 2× đích, rồi mới vẽ lần cuối
  // → không lấm tấm/răng cưa như khi thu 1 lần từ ảnh 256–1290 px xuống vài chục px
  thuNho(a, sx, sy, sw, sh, nw, nh) {
    let src = a, x0 = sx, y0 = sy, w = sw, h = sh;
    while (w >= nw * 2 && h >= nh * 2 && w > 4 && h > 4) {
      const w2 = Math.max(1, Math.round(w / 2)), h2 = Math.max(1, Math.round(h / 2));
      const t = document.createElement('canvas'); t.width = w2; t.height = h2;
      this.c2d(t).drawImage(src, x0, y0, w, h, 0, 0, w2, h2);
      src = t; x0 = 0; y0 = 0; w = w2; h = h2;
    }
    return [src, x0, y0, w, h];
  },
  // vẽ a (vùng sx,sy,sw,sh) vào ngữ cảnh x tại (dx,dy,dw,dh) — dw,dh tính bằng điểm ảnh thiết bị
  veNho(x, a, sx, sy, sw, sh, dx, dy, dw, dh) {
    const [s2, x0, y0, w, h] = this.thuNho(a, sx, sy, sw, sh, dw, dh);
    x.drawImage(s2, x0, y0, w, h, dx, dy, dw, dh);
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

  // ---------- ảnh ----------
  img(ten) {
    let a = this.anh[ten];
    if (!a) {
      a = new Image(); a.decoding = 'async';
      a.onerror = () => { a._loi = true; this.thieu.add(ten); };
      a.onload = () => { if (this._choNen) this.lamNen(); };
      a.src = 'assets/' + ten + '.png';
      this.anh[ten] = a;
    }
    if (a._cv) return a._cv;
    if (!(a.complete && a.naturalWidth && !a._loi)) return null;
    // chép sang canvas 1 lần: vẽ từ canvas không đụng bộ nhớ đệm giải mã ảnh của trình duyệt (bị dọn → giải mã lại mỗi khung)
    const c = document.createElement('canvas'); c.width = a.naturalWidth; c.height = a.naturalHeight;
    this.c2d(c).drawImage(a, 0, 0);
    return (a._cv = c);
  },
  napTruoc(ds) { return Promise.all(ds.map(t => new Promise(ok => { this.img(t); const a = this.anh[t]; if (a.complete) ok(); else { a.addEventListener('load', ok, { once: true }); a.addEventListener('error', ok, { once: true }); } }))); },
  // bản trắng (chớp khi trúng đòn) / bản xám (hoá đá) — dựng 1 lần, dùng lại
  banTrang(ten) {
    if (this.trang[ten]) return this.trang[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    return (this.trang[ten] = c);
  },
  banXam(ten) {
    if (this.xam[ten]) return this.xam[ten];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.85 + 18; p[i] = l * 1.02; p[i + 1] = l; p[i + 2] = l * 0.94; }
    x.putImageData(d, 0, 0);
    return (this.xam[ten] = c);
  },
  // ảnh đã thu nhỏ sẵn đúng cỡ vẽ (px logic) — vẽ 1:1 nhanh hơn nhiều trên điện thoại; bien: '' | 'xam' | 'trang' | 'den'
  co(ten, px, bien) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(px * k)), key = ten + '|' + n + '|' + (bien || '');
    let c = this.cache[key]; if (c) return c;
    const a = bien === 'xam' ? this.banXam(ten) : bien === 'trang' ? this.banTrang(ten) : this.img(ten);
    if (!a) return null;
    const w = a.width, h = a.height, nw = Math.max(2, Math.round(n * w / Math.max(w, h))), nh = Math.max(2, Math.round(n * h / Math.max(w, h)));
    c = document.createElement('canvas'); c.width = nw; c.height = nh;
    const x = this.c2d(c);
    if (bien === 'den') { x.filter = 'blur(' + Math.max(1, n / 40) + 'px)'; this.veNho(x, a, 0, 0, w, h, 0, 0, nw, nh); x.filter = 'none'; x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 0, nw, nh); }
    else this.veNho(x, a, 0, 0, w, h, 0, 0, nw, nh);
    if (Object.keys(this.cache).length > 900) this.cache = {};
    return (this.cache[key] = c);
  },
  // dải khung (quái/trùm 4 khung) thu nhỏ sẵn TỪNG KHUNG riêng, cách nhau 2 px trong suốt: cỡ khung nguyên điểm ảnh,
  // không lấy lẹm điểm ảnh khung bên cạnh khi lọc (trước đây dải 768 px thu về bề rộng lẻ → mép khung lem/nhoè)
  coDai(ten, px, bien) {
    const k = this.s * this.dpr, m = Math.max(2, Math.round(px * k)), key = 'dai|' + ten + '|' + m + '|' + (bien || '');
    let c = this.cache[key]; if (c) return c;
    const a = bien === 'trang' ? this.banTrang(ten) : this.img(ten); if (!a) return null;
    const n = Math.max(1, Math.round(a.width / a.height)), fw = a.width / n, G2 = 2;
    c = document.createElement('canvas'); c.width = n * (m + G2); c.height = m;
    const x = this.c2d(c);
    for (let i = 0; i < n; i++) this.veNho(x, a, Math.round(i * fw), 0, Math.round(fw), a.height, i * (m + G2), 0, m, m);
    c.nf = n; c.fm = m; c.gap = G2;
    if (Object.keys(this.cache).length > 900) this.cache = {};
    return (this.cache[key] = c);
  },
  // vẽ ảnh thu nhỏ sẵn ở tâm (0,0) với cỡ px
  ve1(ctx, ten, px, bien, ox, oy) { const c = this.co(ten, px, bien); if (!c) return false; const h = px * c.height / c.width; ctx.drawImage(c, (ox || 0) - px / 2, (oy || 0) - h / 2, px, h); return true; },
  // chấm sáng mềm theo màu (hạt) — dựng sẵn để không tạo gradient mỗi khung
  cham1(mau) {
    if (this.cham[mau]) return this.cham[mau];
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, mau); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return (this.cham[mau] = c);
  },

  // hạt bụi mềm (đĩa xám mép mờ) thay vòng tròn mép cứng
  bui1() {
    if (this._bui) return this._bui;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(154,150,144,1)'); g.addColorStop(0.55, 'rgba(154,150,144,.85)'); g.addColorStop(1, 'rgba(154,150,144,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return (this._bui = c);
  },
  // vệt đạn (motion blur) dựng sẵn theo màu: đuôi mảnh trong suốt → đầu sáng trắng
  vet(mau) {
    let c = this._vet[mau]; if (c) return c;
    c = document.createElement('canvas'); c.width = 128; c.height = 32;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, mau + '00'); g.addColorStop(0.55, mau + '70'); g.addColorStop(0.9, mau + 'ee'); g.addColorStop(1, '#ffffff');
    x.filter = 'blur(2.5px)'; x.fillStyle = g;
    x.beginPath(); x.moveTo(2, 16); x.lineTo(112, 7); x.quadraticCurveTo(126, 16, 112, 25); x.closePath(); x.fill();
    x.filter = 'none';
    const g2 = x.createLinearGradient(30, 0, 124, 0); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(255,255,255,.95)');
    x.fillStyle = g2; x.beginPath(); x.moveTo(30, 16); x.lineTo(118, 13.6); x.lineTo(122, 16); x.lineTo(118, 18.4); x.closePath(); x.fill();
    return (this._vet[mau] = c);
  },
  // ảnh bàn "dịu": giảm bão hoà (sat), giảm tương phản (con), tối đi (bri), ngả nhẹ về gunmetal #292D32 — xử lý điểm ảnh 1 lần
  // (không dùng ctx.filter vì Safari iOS chưa hỗ trợ). Tư vấn mục C: bàn tối, trung tính, ít chi tiết sáng.
  diu(ten, sat, con, bri) {
    const key = 'diu|' + ten + '|' + sat + con + bri;
    if (this.xam[key]) return this.xam[key];
    const a = this.img(ten); if (!a) return null;
    const c = document.createElement('canvas'); c.width = a.width; c.height = a.height;
    const x = c.getContext('2d'); x.drawImage(a, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
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
    x.putImageData(d, 0, 0);
    return (this.xam[key] = c);
  },
  diaCong(co) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(co * k)), key = 'dia|' + n;
    let c = this.cache[key]; if (c) return c;
    const a = this.img('cong'); if (!a) return null;
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'); x.beginPath(); x.arc(n / 2, n / 2, n * 0.3, 0, 7); x.clip(); this.min(x); this.veNho(x, a, 0, 0, a.width, a.height, 0, 0, n, n);
    return (this.cache[key] = c);
  },
  // chữ nổi dựng sẵn thành ảnh (viền + chữ) — vẽ chữ mỗi khung rất tốn; mỗi con số chỉ dựng 1 lần rồi dùng lại suốt đời nó
  chuAnh(s, mau, px) {
    const k = this.s * this.dpr, key = s + '|' + mau + '|' + px;
    const M = this._chu || (this._chu = new Map());
    let c = M.get(key); if (c) return c;
    if (M.size > 320) M.clear();
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
  // quầng sáng tròn dựng sẵn (thay createRadialGradient mỗi khung)
  glow(key, stops) {
    let c = this._glow[key]; if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [o, m] of stops) g.addColorStop(o, m);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
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
    for (let i = 0; i < pts.length - 1; i++) this.tia(ctx, 'tia_set', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rong, 0, true);
    ctx.strokeStyle = 'rgba(255,255,230,.9)'; ctx.lineWidth = 1.6; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0);
    for (const p of pts) ctx.lineTo(p[0], p[1]); ctx.stroke();
  },

  // ---------- nền tĩnh (khay + đường) dựng 1 lần ----------
  lamNen() {
    const c = this.nen || (this.nen = document.createElement('canvas'));
    const k = this.s * this.dpr;
    c.width = this.cv.width; c.height = this.cv.height;
    const x = this.c2d(c);
    x.setTransform(k, 0, 0, k, 0, 0);
    // sàn xưởng máy tối (gradient + quầng tối viền)
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1c1e22'); g.addColorStop(0.5, '#25272b'); g.addColorStop(1, '#17181b');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const v = x.createRadialGradient(W / 2, H * 0.45, 120, W / 2, H * 0.45, 560);
    v.addColorStop(0, 'rgba(255,255,255,0.05)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
    x.fillStyle = v; x.fillRect(0, 0, W, H);
    let du = true;
    // khay bàn máy móc xám (bóng đổ dưới khay)
    for (const B of G.ban) {
      x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 18; x.shadowOffsetY = 8;
      const kh = this.diu('khay', 0.22, 0.72, 0.6);
      if (kh) x.drawImage(this.mip(kh, B.h * k), B.x, B.y, B.w, B.h); else { du = false; x.fillStyle = '#3a3d42'; x.fillRect(B.x, B.y, B.w, B.h); }
      x.restore();
    }
    // đường đi: ghép ảnh đường thẳng + góc
    const th = this.diu('duong_thang', 0.25, 0.7, 0.74), gc = this.diu('duong_goc', 0.25, 0.7, 0.74);
    if (!th || !gc) du = false;
    const daVe = new Set();
    for (const p of G.duong) {
      const pts = p.pts;
      for (let i = 0; i < pts.length - 1; i++) {
        const key = pts[i] + '|' + pts[i + 1];
        if (daVe.has(key)) continue; daVe.add(key);
        let [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
        const goc0 = i > 0, goc1 = i < pts.length - 2;
        const chung = G.chung && i === 1; // hành lang chung co-op bắt đầu từ tâm ngã ba
        const a0 = goc0 && !chung ? DUONG_RONG / 2 : (i === 0 ? -6 : 0), a1 = goc1 ? DUONG_RONG / 2 : -10;
        this.veDoanDuong(x, th, ax + dx * a0, ay + dy * a0, bx - dx * a1, by - dy * a1);
      }
      if (!G.chung) for (let i = 1; i < pts.length - 1; i++) this.veGoc(x, gc, pts[i - 1], pts[i], pts[i + 1]);
    }
    if (G.chung) { // ngã ba co-op: vẽ lại hành lang chung đè lên làn dọc
      const p = G.duong[0], [ax, ay] = p.pts[1], [bx, by] = p.pts[2];
      this.veDoanDuong(x, th, ax, ay, bx + 10, by);
    }
    this._choNen = !du;
  },
  veDoanDuong(x, th, ax, ay, bx, by) {
    const L = Math.hypot(bx - ax, by - ay); if (L < 1) return;
    x.save(); x.translate(ax, ay); x.rotate(Math.atan2(by - ay, bx - ax) - Math.PI / 2);
    x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 10;
    if (!th) { x.fillStyle = '#44474d'; x.fillRect(-DUONG_RONG / 2, 0, DUONG_RONG, L); x.restore(); return; }
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
        x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 10;
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
  },
  ve0() {
    const ctx = this.ctx, k = this.s * this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.nen) ctx.drawImage(this.nen, 0, 0); else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.cv.width, this.cv.height); }
    ctx.setTransform(k, 0, 0, k, FX.rungX * k, FX.rungY * k);
    if (!G.ban.length) return;
    this.veCongLoi(ctx);
    this.veNhanBan(ctx);
    // vật trên đường (mây độc, vũng độc, mìn, cầu vồng…) vẽ dưới quái
    for (const o of G.hu) if (HU[o.k] && HU[o.k].duoi) HU[o.k].ve(ctx, o, this);
    this.veQuai(ctx);
    for (const o of G.hu) if (o.k === 'hoden') HU.hoden.ve(ctx, o, this); // hố đen đè lên quái bị hút
    this.veO(ctx);
    for (const o of G.hu) if (o.k === 'tuong') HU.tuong.ve(ctx, o, this);
    this.veLaser(ctx);
    this.veDan(ctx);
    for (const o of G.hu) if (o.k !== 'hoden' && o.k !== 'tuong' && HU[o.k] && HU[o.k].ve && !HU[o.k].duoi) HU[o.k].ve(ctx, o, this);
    this.veFx(ctx);
    VX.veDs(ctx, this); // hiệu ứng sự kiện: sao lên mốc, kỹ năng ghép, dây liên kết, bingo, tiếng hú
    if (this.veHoTro) this.veHoTro(ctx); // chạm/giữ ụ hỗ trợ: hiển thị vùng & loại buff
    this.veKeo(ctx);
    this.veChu(ctx);
    if (FX.chop > 0) { ctx.globalAlpha = Math.min(0.3, FX.chop); ctx.fillStyle = FX.chopMau; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
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
      const l = this.img('loi'), cl = 60, bob = Math.sin(t * 2.4) * 1.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (0.24 + 0.06 * Math.sin(t * 3)) / 0.6;
      ctx.drawImage(this.glow('loi', [[0, 'rgba(90,240,255,.6)'], [0.05, 'rgba(90,240,255,.6)'], [1, 'rgba(90,240,255,0)']]), e[0] - 44, e[1] - 52, 88, 88); ctx.restore(); ctx.globalAlpha = 1;
      if (l) this.ve1(ctx, 'loi', cl, '', e[0], e[1] - 6 + bob);
    }
  },
  veNhanBan(ctx) {
    ctx.font = '800 10px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const B of G.ban) {
      if (G.ban.length < 2) break;
      const s = B.ten, w = Math.ceil(ctx.measureText(s).width) + 14, h = 15;
      const x = Math.min(B.x + B.w - w - 10, W - w - 8), y = B.y + 1; // y = tâm nhãn
      ctx.fillStyle = B.i === 0 ? 'rgba(46,96,150,.88)' : (G.che === 'pvp' ? 'rgba(150,50,56,.88)' : 'rgba(46,120,92,.88)');
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y - h / 2, w, h, 5) : ctx.rect(x, y - h / 2, w, h); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(s, x + w / 2, y + 0.5);
    }
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
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(E.x + 2, E.y + 3 + (bay ? 6 : 0), co * 0.3 * (bay ? 0.75 : 1), 0, 7); ctx.fill(); // bóng tròn (nhìn thẳng từ trên)
      ctx.globalAlpha = al;
      const ten = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
      let f, f2 = -1, fr = 0;
      if (E.trum) f = E.bao ? 3 : [0, 1, 2, 1][Math.floor(E.khung * 0.8) % 4];
      else { const kf = E.khung % 4; f = Math.floor(kf); const r = kf - f; if (r > 0.65) { f2 = (f + 1) % 4; fr = (r - 0.65) / 0.35; fr = fr * fr * (3 - 2 * fr); } }
      const goc = E.trum ? 0 : (E.gv != null ? E.gv : E.goc) - Math.PI / 2;
      const x = E.x, y = E.y + oy, cv = co * sc;
      if (E.bao) { // trùm báo trước: quầng màu chiêu
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gg = ctx.createRadialGradient(x, y, 4, x, y, co * 0.9); const m = TRUM[E.trum].mau;
        gg.addColorStop(0, m + 'aa'); gg.addColorStop(1, m + '00');
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 20); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, co * 0.9, 0, 7); ctx.fill(); ctx.restore();
        ctx.globalAlpha = al;
      }
      const lanh = E.cham > 0 && !E.d.khangCham && !E.chet;
      if (lanh) { // bị chậm: viền băng mỏng quanh quái (không tô xanh cả thân) + bông tuyết cạnh thanh máu (vẽ sau)
        if (!E._lanhT) { E._lanhT = this.t; FX.no('bang_vo', x, y, co * 0.8, 0.19); } // lúc vừa dính chậm: loé băng 190 ms
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2 * al;
        this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = al;
      } else E._lanhT = 0;
      if ((E.yeu > 0 || E.cvT > 0 || E.giapT > 0) && !E.chet) { // dấu suy yếu (Phá Giáp: tím), cầu vồng (sắc màu), giáp đối thủ (vàng)
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * al;
        const mm = E.cvT > 0 ? ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'][Math.floor(this.t * 6 + E.uid) % 5] : E.giapT > 0 ? '#ffd23f' : '#c77dff';
        this.anhGiua(ctx, this.cham1(mm), x, y, co * 1.15); ctx.restore(); ctx.globalAlpha = al;
      }
      const dai = this.coDai(ten, co);
      if (!dai || !this.khung(ctx, ten, f, x, y, cv, goc, dai)) { ctx.fillStyle = '#a040ff'; ctx.beginPath(); ctx.arc(x, y, co * 0.3, 0, 7); ctx.fill(); }
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
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(x - w / 2 - 1, yy - 1, w + 2, 5);
        ctx.fillStyle = E.docT > 0 ? '#7cff4a' : (E.cham > 0 && !E.d.khangCham ? '#6fd8ff' : '#ff4a4a');
        ctx.fillRect(x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 3);
      }
      if (lanh) { ctx.globalAlpha = 0.85 * al; const k = this.kyHieu('cham', 8); ctx.drawImage(k, x - Math.max(18, co * 0.55) / 2 - 10, y - co * 0.42 - 3, 8, 8); ctx.globalAlpha = al; }
      if (E.trum && !E.chet) {
        const w = 70, yy = y - co * 0.55;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(x - w / 2 - 2, yy - 2, w + 4, 8);
        ctx.fillStyle = TRUM[E.trum].mau; ctx.fillRect(x - w / 2, yy, w * clamp(E.hp / E.max, 0, 1), 4);
        if (E.bao) { // đường ngắm tới ụ bị nhắm
          const B = G.ban[E.ban];
          ctx.save(); ctx.strokeStyle = TRUM[E.trum].mau; ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -this.t * 60;
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
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
        if (keo && keo.dang && keo.T.ban === B.i) {
          if (hopLeGhep(keo.T, T)) o.dich = true; else o.alpha = 0.45;
        }
        this.veU(ctx, T, B.o[i].x, B.o[i].y, o);
      }
    }
    // ụ bay vào nhau khi ghép
    for (const b of G.bay) VX.veBay(ctx, b, this);
  },

  // vẽ 1 ụ: bóng · vòng bậc · bệ · đầu súng xoay (giật lùi) · lớp phủ trạng thái · xúc xắc sao
  veU(ctx, T, x, y, o) {
    o = o || {};
    const B = G.ban[T.ban] || G.ban[0];
    const S = Math.min(B.cw, B.ch) * 0.98 * (o.scale || 1);
    // hoạt ảnh xuất hiện (triệu hồi / ghép / biến hình hộp) theo THỜI GIAN THỰC — hieuung.js; trả về độ phóng (đều), độ nảy, ẩn/hiện
    const A = o.ghost ? null : VX.truoc(ctx, T, x, y, S, o);
    if (A && A.an) { VX.sau(ctx, T, x, y, S, A); return; } // đang quay số thẻ / chưa lộ: chỉ vẽ hiệu ứng
    let sx = A ? A.sx : 1, sy = A ? A.sy : 1, oy = A ? A.oy : 0;
    const an = A && A.dong ? A : null;
    const al = (o.alpha != null ? o.alpha : 1) * (A ? A.al : 1);
    ctx.globalAlpha = al;
    // bóng tiếp đất (lúc đứng yên: đã nướng sẵn trong ảnh thân → bớt 1 lần tô hình mỗi ụ mỗi khung) — hình TRÒN, không méo
    const bongSan = !an && sx === 1 && sy === 1;
    if (!bongSan) {
      ctx.fillStyle = 'rgba(0,0,0,.42)';
      ctx.beginPath(); ctx.arc(x + 2, y + 3 + S * 0.05, S * 0.36 * Math.min(sx, sy), 0, 7); ctx.fill();
    }
    if (o.dich) { // đích ghép hợp lệ: quầng nháy
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 + 0.14 * Math.sin(this.t * 10);
      this.anhGiua(ctx, this.cham1('#bfffd0'), x, y, S * 1.15); ctx.restore(); ctx.globalAlpha = al;
    }
    if (T.st.lua > 0 || B.cuong > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.16; this.anhGiua(ctx, this.cham1('#ff7a2a'), x, y, S * 1.1); ctx.restore(); ctx.globalAlpha = al; }
    ctx.save(); ctx.translate(x, y + oy); ctx.scale(sx, sy);
    const da = T.st.da;
    // vòng bậc (sau bệ, ló viền + ngọc); vàng/đỏ ánh lấp lánh
    // thân tĩnh (bệ + vòng bậc + xúc xắc sao) dựng sẵn 1 ảnh → mỗi khung chỉ 1 lần vẽ
    const than = this.than(T, S, da, bongSan);
    if (than) {
      if (bongSan && !oy) { // đứng yên: vẽ 1:1 đúng lưới điểm ảnh (nhanh nhất, không lọc ảnh)
        const k = this.s * this.dpr, q = 1 / k;
        ctx.drawImage(than, Math.round((x + FX.rungX - S * 0.75) * k) * q - x - FX.rungX, Math.round((y + FX.rungY - S * 0.75) * k) * q - y - FX.rungY, than.width * q, than.height * q);
      } else ctx.drawImage(than, -S * 0.75, -S * 0.75, S * 1.5, S * 1.5);
    }
    // (bỏ vòng bậc phát sáng trên sân — độ hiếm chỉ còn viên ngọc nhỏ ở bệ + viền thẻ)
    // nạp năng lượng (overlord, tường, hố đen, mana): vòng sáng quanh bệ
    const skT = SKILLS[T.id] || {};
    if (T.nap > 0.02 && !o.ghost && !laGrow(T.id) && (T.id === 'overlord' || T.id === 'wallgen' || T.id === 'blackhole' || T.id === 'mana' || skT.napMau)) {
      const m = skT.napMau || (T.id === 'overlord' ? '#ff5040' : T.id === 'mana' ? '#c77dff' : T.id === 'blackhole' ? '#ff3b9b' : '#7ffcff');
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = m; ctx.lineWidth = 1.8; ctx.globalAlpha = al * 0.7;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.36, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * T.nap); ctx.stroke();
      if (T.nap > 0.8) { ctx.globalAlpha = al * (T.nap - 0.8) * 1.2 * (0.6 + 0.4 * Math.sin(this.t * 30)); this.anhGiua(ctx, this.cham1(m), 0, 0, S * 0.9); }
      ctx.restore(); ctx.globalAlpha = al;
    }
    // vòng quét nâng cấp
    if (T.lvSang > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7dff6a'; ctx.lineWidth = 3; ctx.globalAlpha = T.lvSang;
      const a0 = (1 - T.lvSang) * Math.PI * 4;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.4, a0, a0 + Math.PI * 1.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, S * (0.3 + (1 - T.lvSang) * 0.5), 0, 7); ctx.stroke(); ctx.restore(); ctx.globalAlpha = al;
    }
    // đầu súng
    const C0 = S / 0.98, gd = !o.ghost && T.gd && laGrow(T.id) ? T.gd : 0;
    if (!o.ghost) VX.duoiDau(ctx, T, S, al, this); // hào quang dạng thức tỉnh + vòng tiến độ grow-up (dưới đầu súng)
    const D = C0 * this.dauK(T.id, gd);
    const dau = this.co(this.dauTen(T.id, gd), D, da ? 'xam' : '');
    if (dau) {
      ctx.save();
      let goc = T.goc;
      if (T.id === 'mana') { goc = 0; const p = 1 + 0.04 * Math.sin(this.t * 3 + T.pha) + 0.1 * T.sang; ctx.translate(0, -2 + Math.sin(this.t * 2 + T.pha) * 1.6); ctx.scale(p, p); }
      if (T.id === 'mimic') goc = T.goc;
      if (skT.gocDau) { const g2 = skT.gocDau(T, this.t, ctx); if (g2 != null) goc = g2; } // đầu không xoay theo mục tiêu (hộp, cột…)
      // đầu súng + bóng mềm đổ xuống bệ, dựng sẵn chung 1 ảnh → 1 lần vẽ xoay mỗi ụ (thay vì 2)
      ctx.rotate(goc); ctx.translate(T.rx || 0, 0);
      if (!VX.veBien(ctx, T, C0, al, da, this)) this.veDauLop(ctx, T.id, gd, C0, al, 1, da); // đang biến hình: hoà 2 dạng
      // ánh sáng phụ: mimic cầu vồng, mana phát sáng, tesla cuộn nạp, laser nóng
      let sang = 0;
      if (T.id === 'mana') sang = 0.15 + 0.15 * Math.sin(this.t * 3) + T.sang * 0.6;
      if (T.id === 'set' && T.cd < 0.18 && !da) sang = (0.18 - T.cd) * 4;
      if (T.id === 'laser' && T.las && T.las.on) sang = 0.2 + T.las.ramp * 0.5;
      if (T.id === 'overlord') sang = T.nap * T.nap * 0.7;
      if (T.id === 'mimic') sang = Math.max(sang, 0.25 + 0.2 * Math.sin(this.t * 4 + T.pha));
      if (T.chop > 0) sang = Math.max(sang, T.chop * 3);
      if (skT.sangDau) sang = Math.max(sang, skT.sangDau(T, this.t) || 0);
      if (sang > 0 && !da) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * Math.min(0.45, sang * 0.6); ctx.drawImage(dau, -D / 2, -D / 2, D, D); }
      ctx.restore();
      if (T.id === 'mimic') { // ánh cầu vồng chạy vòng (bản sắc Mimic; buff Aurora hiện bằng ký hiệu)
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * 0.22;
        const mau = ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'];
        const k = Math.floor(this.t * 3 + (T.pha || 0)) % 5;
        const a = this.t * 2.5 + (T.pha || 0);
        this.anhGiua(ctx, this.cham1(mau[k]), Math.cos(a) * S * 0.26, Math.sin(a) * S * 0.26, S * 0.45);
        ctx.restore(); ctx.globalAlpha = al;
      }
    }
    // tesla: cuộn sáng ở đầu nòng trước khi phóng
    if (T.id === 'set' && T.cd < 0.18 && !da && !o.ghost) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.18 - T.cd) * 3;
      this.anhGiua(ctx, this.cham1('#fff27a'), Math.cos(T.goc) * D * 0.4, Math.sin(T.goc) * D * 0.4, S * 0.5); ctx.restore(); ctx.globalAlpha = al;
    }
    // vẽ thêm riêng của kỹ năng (quả cầu, đồng hồ bom, hào quang, dây liên kết…) — toạ độ quanh tâm ụ
    if (skT.veThem && !o.ghost) { ctx.save(); skT.veThem(ctx, T, S, al, this, B); ctx.restore(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over'; }
    if (T.banSao && !o.ghost) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.14 + 0.06 * Math.sin(this.t * 6)); this.anhGiua(ctx, this.cham1('#ffd23f'), 0, 0, S * 0.95); ctx.restore(); ctx.globalAlpha = al; }
    if (T.st.kep > 0 && !o.ghost) { // bị Kẹp Phá: vòng xích tím quay
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#c77dff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.lineDashOffset = this.t * 30; ctx.globalAlpha = al * 0.7;
      ctx.beginPath(); ctx.arc(0, 0, S * 0.38, 0, 7); ctx.stroke(); ctx.restore(); ctx.globalAlpha = al;
    }
    // lớp phủ trạng thái
    if (T.st.bang > 0) { ctx.globalAlpha = al * 0.95; this.ve1(ctx, 'phu_bang', S * 1.12); ctx.globalAlpha = al; }
    if (da) this.ve1(ctx, 'phu_da', S * 1.15);
    if (T.st.lua > 0) { const f = 1 + 0.04 * Math.sin(this.t * 22); ctx.save(); ctx.scale(f, f); this.ve1(ctx, 'phu_lua', S * 1.2, '', 0, -2); ctx.restore(); }
    if (T.st.ngam > 0) { ctx.save(); ctx.rotate(this.t * 2); const f = 1.25 - 0.2 * (1 - T.st.ngam / 1.4); ctx.globalAlpha = al * (0.6 + 0.4 * Math.sin(this.t * 24)); this.anhGiua(ctx, 'phu_ngam', 0, 0, S * f); ctx.restore(); ctx.globalAlpha = al; }
    ctx.restore();

    // lớp UI trên ụ (không xoay theo đầu súng, neo theo ô): huy hiệu cấp sao + biểu tượng buff nhỏ
    if (!o.noBadge) {
      const C = S / 0.98; // cạnh ô (đã gồm tỉ lệ phóng)
      ctx.globalAlpha = al;
      const hs = A ? A.huy : 1; // huy hiệu sao bật nảy lúc lộ kết quả ghép
      if (hs > 0.02) this.veHuyHieu(ctx, x + C * 0.31, y + oy - C * 0.31, T.sao, C * 0.3 * hs);
      if (!o.ghost && T.buf) this.veBuffNho(ctx, T, x - B.cw / 2 + 3, y + oy - B.ch / 2 + 4); // ký hiệu buff: góc TRÊN-TRÁI ô (sao ở trên-phải)
    }
    ctx.globalAlpha = 1;
    if (A) VX.sau(ctx, T, x, y, S, A);
  },
  dauBong(ten, D, da) {
    const k = this.s * this.dpr, n = Math.max(2, Math.round(D * k)), key = 'db|' + ten + '|' + n + '|' + (da ? 1 : 0);
    let c = this.cache[key]; if (c) return c;
    const a = this.co(ten, D, da ? 'xam' : ''); if (!a) return null;
    const pad = Math.ceil(n * 0.12), N = n + pad * 2;
    c = document.createElement('canvas'); c.width = c.height = N;
    const x = this.c2d(c), ox = pad + Math.round((n - a.width) / 2), oy = pad + Math.round((n - a.height) / 2); // đặt nguyên điểm ảnh: không nhoè thêm
    x.filter = 'blur(' + Math.max(1, n / 30) + 'px)'; x.drawImage(a, ox, oy + n * 0.035); x.filter = 'none';
    x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 0, N, N);
    x.globalCompositeOperation = 'source-over'; x.drawImage(a, ox, oy);
    c.sc = N / n;
    return (this.cache[key] = c);
  },
  // thân ụ dựng sẵn: BỆ CHUNG trung tính (de_chung.png, mọi ụ như nhau) + viên ngọc độ hiếm nhỏ ở mép bệ.
  // Không còn vòng bậc / ô xúc xắc sao (tư vấn B.2, G). Bệ = 70% cạnh ngắn ô (~60% cạnh dài), tròn tuyệt đối.
  than(T, S, da, bong) {
    const k = this.s * this.dpr, n = Math.round(S * 1.5 * k), key = 'than|' + T.bac + '|' + (da ? 1 : 0) + '|' + n + (bong ? '|b' : '');
    let c = this.cache[key]; if (c) return c;
    let de = da ? this.banXam('de_chung') : this.img('de_chung');
    if (!de && !(this.anh.de_chung && this.anh.de_chung._loi)) return null; // còn đang tải
    if (!de) de = this.deCode(da);
    c = document.createElement('canvas'); c.width = c.height = n;
    const x = this.c2d(c);
    const q = n / (S * 1.5); x.scale(q, q); x.translate(S * 0.75, S * 0.75);
    const SB = S * 0.714;
    de = this.mip(de, SB * q);
    if (bong) { x.fillStyle = 'rgba(0,0,0,.42)'; x.beginPath(); x.arc(2, SB * 0.06 + 3, SB * 0.5, 0, 7); x.fill(); }
    x.drawImage(de, -SB / 2, -SB / 2, SB, SB);
    // ngọc độ hiếm: hình thoi nhỏ ở mép dưới-trái bệ (ưu tiên thấp nhất)
    const gx = -SB * 0.4, gy = SB * 0.4, gr = Math.max(3, S * 0.055);
    x.beginPath(); x.moveTo(gx, gy - gr); x.lineTo(gx + gr, gy); x.lineTo(gx, gy + gr); x.lineTo(gx - gr, gy); x.closePath();
    x.fillStyle = da ? '#8a8a8a' : TIERS[T.bac].mau; x.fill();
    x.lineWidth = 1.4; x.strokeStyle = 'rgba(8,10,12,.9)'; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(gx, gy - gr * 0.6); x.lineTo(gx + gr * 0.4, gy - gr * 0.1); x.lineTo(gx, gy); x.closePath(); x.fill();
    return (this.cache[key] = c);
  },
  // bệ dự phòng vẽ bằng code (khi chưa có de_chung.png): tấm tròn gunmetal trung tính
  deCode(da) {
    const key = 'deCode|' + (da ? 1 : 0); if (this.cache[key]) return this.cache[key];
    const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d'), r = N / 2;
    let g = x.createRadialGradient(r * 0.8, r * 0.7, r * 0.1, r, r, r);
    g.addColorStop(0, '#5a6068'); g.addColorStop(0.7, '#3a3f46'); g.addColorStop(1, '#23272c');
    x.fillStyle = g; x.beginPath(); x.arc(r, r, r - 2, 0, 7); x.fill();
    x.lineWidth = 6; x.strokeStyle = '#15181c'; x.stroke();
    x.lineWidth = 4; x.strokeStyle = '#4a5058'; x.beginPath(); x.arc(r, r, r * 0.8, 0, 7); x.stroke();
    x.fillStyle = '#1f2328'; x.beginPath(); x.arc(r, r, r * 0.62, 0, 7); x.fill();
    x.fillStyle = '#5c636b';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5; x.beginPath(); x.arc(r + Math.cos(a) * r * 0.88, r + Math.sin(a) * r * 0.88, 7, 0, 7); x.fill(); }
    if (da) { x.globalCompositeOperation = 'saturation'; x.fillStyle = '#888'; x.fillRect(0, 0, N, N); }
    return (this.cache[key] = c);
  },
  // HUY HIỆU CẤP SAO: 1 ngôi sao vàng ấm + số 1–7 (tư vấn G) — không xoay, neo góc trên-phải ô.
  // Cấp 7: thêm đĩa đỏ thẫm viền vàng phía sau + số trắng → khác cả hình lẫn màu.
  huyHieu(n, d) {
    const k = this.s * this.dpr, N = Math.max(8, Math.round(d * 1.5 * k)), key = 'hh|' + n + '|' + N;
    let c = this.cache[key]; if (c) return c;
    c = document.createElement('canvas'); c.width = c.height = N;
    const x = this.c2d(c), q = N / (d * 1.5); x.scale(q, q); x.translate(d * 0.75, d * 0.75);
    const R = d / 2, sao = (ro, ri) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? ri : ro; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); };
    x.lineJoin = 'round';
    if (n >= 7) { // đĩa nền đỏ thẫm + viền vàng
      x.beginPath(); x.arc(0, 0, R * 1.18, 0, 7); x.fillStyle = '#7a0f1c'; x.fill();
      x.lineWidth = R * 0.16; x.strokeStyle = '#ffd25a'; x.stroke();
      x.lineWidth = R * 0.08; x.strokeStyle = '#1a0a0a'; x.beginPath(); x.arc(0, 0, R * 1.3, 0, 7); x.stroke();
    }
    const ro = n >= 7 ? R * 1.02 : R * 1.08, ri = ro * 0.6;
    sao(ro, ri); x.lineWidth = R * 0.32; x.strokeStyle = '#120c04'; x.stroke(); // viền tối dày → nổi trên mọi nền
    const g = x.createLinearGradient(0, -ro, 0, ro);
    if (n >= 7) { g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#ffc21a'); g.addColorStop(1, '#ff7a00'); }
    else { g.addColorStop(0, '#ffe9a0'); g.addColorStop(0.55, '#f4c24a'); g.addColorStop(1, '#c98a1c'); }
    sao(ro, ri); x.fillStyle = g; x.fill();
    const f = Math.round(R * 1.25);
    x.font = '900 ' + f + 'px ' + FONT.display; x.textAlign = 'center'; x.textBaseline = 'middle';
    const ty = R * 0.12;
    if (n >= 7) { x.lineWidth = R * 0.28; x.strokeStyle = '#5a0a10'; x.strokeText(n, 0, ty); x.fillStyle = '#ffffff'; x.fillText(n, 0, ty); }
    else { x.fillStyle = '#1a1206'; x.fillText(n, 0, ty); }
    return (this.cache[key] = c);
  },
  veHuyHieu(ctx, x, y, n, d) { const c = this.huyHieu(n, d); ctx.drawImage(c, x - d * 0.75, y - d * 0.75, d * 1.5, d * 1.5); },

  // laser: bật/tắt mờ dần (thời gian thực), cuộn vân + độ rộng/độ sáng dao động theo thời gian (không theo khung)
  veLaser(ctx) {
    const dt = this.dt;
    for (const B of G.ban) for (const T of B.t) {
      if (!T || T.id !== 'laser') continue;
      const E = T.las && T.las.E, bat = !!(T.las && T.las.on && E && !E.chet && !(T.st.bang > 0) && !T.st.da);
      if (bat) { T._lx = E.x; T._ly = E.y; T._lr = T.las.ramp; }
      T._la = (T._la || 0) + ((bat ? 1 : 0) - (T._la || 0)) * Math.min(1, dt * (bat ? 22 : 12));
      if (T._la < 0.02 || T._lx === undefined) continue;
      const [x, y] = dauNong(T), r = T._lr || 0, A = T._la, tt = this.t;
      const w = (6 + r * 10 + Math.sin(tt * 37) * 1.2 + Math.sin(tt * 23.3) * 0.8) * (0.55 + 0.45 * A);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = A * (0.86 + 0.08 * Math.sin(tt * 29) + 0.06 * Math.sin(tt * 47.7));
      this.tia(ctx, 'tia_laser', x, y, T._lx, T._ly, w, tt * 420);
      ctx.globalAlpha = A * 0.9;
      this.khungMuot(ctx, 'fx_laser_trung', 1 + (tt * 14) % 2.999, T._lx, T._ly, (30 + r * 26) * (0.7 + 0.3 * A), tt * 3, 1);
      ctx.globalAlpha = A * 0.6; this.anhGiua(ctx, this.cham1('#ff7af0'), x, y, (16 + r * 8) * (0.6 + 0.4 * A));
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
      const hien = Math.min(1, d._ra / 0.05), sc = 0.55 + 0.45 * hien;
      if (d.cong) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.globalAlpha = hien; ctx.beginPath(); ctx.arc(d.x, d.y + 3, 4 + z * 0.02, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      // hướng bay trên màn = hướng chuyển động giữa 2 bước (gồm cả độ cao vòng cung)
      let goc = d.goc || 0;
      if (d._x !== undefined) { const mx = hx - d._x, my = hy - (d._y - (d._z || 0)); if (mx * mx + my * my > 0.04) goc = Math.atan2(my, mx); }
      if (d._g == null) d._g = goc; else d._g += gocLech(d._g, goc) * Math.min(1, dt * 30); // hướng vẽ mượt (đạn đuổi rẽ cong êm)
      goc = d._g;
      const co = d.co * (1 + z / 140) * sc;
      if (d.img !== 'dan_phao') {
        const mau = MAU_VET[d.img] || '#ffd080', tracer = d.img === 'dan_lien' ? 2.6 : 1.5;
        let L = d.sp * k / 60 * tracer + co * 0.6;
        const tu = Math.hypot(hx - d.sx, hy - d.sy) + co * 0.3; // không kéo vệt ra sau đầu nòng
        L = Math.min(L, tu, 150);
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(goc);
        ctx.globalCompositeOperation = 'lighter';
        if (L > 2) { const wv = Math.max(5, co * 0.62); ctx.globalAlpha = 0.9 * hien; ctx.drawImage(this.vet(mau), -L + co * 0.18, -wv / 2, L, wv); }
      } else { ctx.save(); ctx.translate(hx, hy); ctx.rotate(goc); }
      ctx.globalAlpha = hien;
      const im = this.co(d.img, d.co);
      if (im) { const h = co * im.height / im.width; ctx.drawImage(im, -co / 2, -h / 2, co, h); }
      else { ctx.fillStyle = '#ffd060'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill(); }
      ctx.restore();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  },
  veFx(ctx) {
    ctx.globalCompositeOperation = 'lighter';
    for (const a of FX.anim) {
      const u = Math.min(1, a.t / a.song);
      let x = a.x, y = a.y, goc = a.goc, al, sc;
      if (a.bam && !a.bam.chet) { x = a.bam.x; y = a.bam.y; }
      if (a.ten === 'chop_nong') { // chớp đầu nòng: bung nhanh (ease-out) rồi tắt mềm, bám theo nòng đang xoay/giật
        const T = a.T;
        if (T && G.ban[T.ban] && G.ban[T.ban].t[T.o] === T) { [x, y] = dauNong(T); goc = T.goc + (a.dg || 0); }
        sc = 0.55 + 0.6 * (1 - (1 - u) * (1 - u) * (1 - u)); al = (1 - u) * (1 - u) * (1.4 - 0.4 * u);
      } else {
        sc = 0.9 + 0.16 * (1 - (1 - u) * (1 - u));
        al = Math.min(1, u / 0.06);
        if (u > 0.65) { const v = (u - 0.65) / 0.35; al *= 1 - v * v * (3 - 2 * v); }
      }
      ctx.globalAlpha = 1;
      this.khungMuot(ctx, 'fx_' + a.ten, u * 5.999, x, y, a.co * sc, goc, Math.min(0.82, al)); // trần độ sáng cộng
    }
    for (const v of FX.vong) {
      const u = v.t / v.song, e = 1 - (1 - u) * (1 - u);
      ctx.globalAlpha = (1 - u) * 0.6; ctx.strokeStyle = v.mau; ctx.lineCap = 'round'; ctx.lineWidth = Math.min(3, v.day) * (1 - u) + 0.5;
      ctx.beginPath(); ctx.arc(v.x, v.y, Math.max(0.5, v.r0 + (v.r1 - v.r0) * e), 0, 7); ctx.stroke();
    }
    const lua = this.co('tia_lua', 24);
    for (const p of FX.hat) {
      const u = p.t / p.song;
      if (p.k === 'khoi') continue;
      if (p.k === 'bui') continue;
      ctx.globalAlpha = (1 - u) * Math.min(1, u * 14 + 0.3) * 0.75;
      const c = p.co * (p.k === 'than' ? 1 : 1 - u * 0.5);
      if (p.k === 'lua' && lua && (p.mau === '#ffb060' || p.mau === '#ffd080')) ctx.drawImage(lua, p.x - c / 2, p.y - c / 2, c, c);
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
      else if (p.k === 'bui') { ctx.globalAlpha = 0.5 * (1 - u); const r = p.co * (0.6 + u * 0.7); ctx.drawImage(this.mip(this.bui1(), r * 2 * this.s * this.dpr), p.x - r, p.y - r, r * 2, r * 2); }
    }
    ctx.globalAlpha = 1;
  },
  veKeo(ctx) {
    const k = UI.keo; if (!k || !k.dang) return;
    const T = k.T;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(k.x + 8, k.y + 14, 20, 0, 7); ctx.fill();
    this.veU(ctx, T, k.x, k.y - 10, { scale: 1.12 });
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
        ctx.drawImage(im, cx - w / 2, y - im.by * q2, w, h);
        continue;
      }
      ctx.font = '900 ' + Math.round(c.co * sc) + 'px ' + FONT.display;
      ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      if (c.kieu === 'nhan') { // nhãn kỹ năng trên ụ: viên thuốc tối viền màu bậc
        const w = Math.ceil(ctx.measureText(c.s).width) + 14, h = Math.round(c.co * sc) + 7, cy = y - h / 2 + 4; // cy = tâm viên thuốc
        const x = clamp(c.x, w / 2 + 4, W - w / 2 - 4); // không tràn mép màn
        ctx.fillStyle = 'rgba(10,12,16,.85)'; ctx.strokeStyle = c.vien || c.mau; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, cy - h / 2, w, h, 6) : ctx.rect(x - w / 2, cy - h / 2, w, h); ctx.fill(); ctx.stroke();
        ctx.textBaseline = 'middle'; ctx.fillStyle = c.mau; ctx.fillText(c.s, x, cy + 0.5); ctx.textBaseline = 'alphabetic'; continue;
      }
      if (c.kieu === 'mana') { this.anhGiua(ctx, 'ui_mana', c.x - ctx.measureText(c.s).width / 2 - 8, y - c.co * 0.35, 14); }
      const hw = ctx.measureText(c.s).width / 2 + 4, cx = clamp(c.x, hw, W - hw);
      ctx.strokeText(c.s, cx, y); ctx.fillStyle = c.mau; ctx.fillText(c.s, cx, y);
    }
    ctx.globalAlpha = 1;
  },
};
