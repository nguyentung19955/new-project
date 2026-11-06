// TURRET MERGE — MÀN TẢI (thanh tiến độ thật) + MÀN MẤT MẠNG
// Quy tắc: không bao giờ hiện hình vẽ code thay ảnh còn đang tải → che bằng màn tải (ảnh ChatGPT: nen_menu, logo,
// khung thanh hud_trum_khung, dải đầy tai_day cắt từ tia_laser) tới khi mọi ảnh của màn đã GIẢI MÃ xong (img.decode()).
// Mất mạng (sự kiện 'offline', navigator.onLine, tải lỗi liên tiếp) → dừng trận, hiện màn "Connection lost";
// có mạng lại + tải được tệp → nút "Back to menu" (về menu, nạp lại ảnh).
'use strict';

const TAI_MAT = { matMang: true };
// ảnh theo TÊN → URL thật: bản .webp (nén chất lượng cao lúc xuất bản, cùng số điểm ảnh — tools/thap-ver.py → ANH_W) nếu có,
// không thì .png?v=băm. Màn tải, REN.taiAnh, chân dung (portraitOf), khung thẻ… đều đi qua đây → cùng 1 URL, không tải 2 lần.
var TAI_WEBP = true;
// lúc tệp gần nhất về (PerformanceObserver): mạng còn chạy thì không huỷ ảnh đang tải chậm (TAI._mot)
var TAI_VE = Date.now();
try { new PerformanceObserver((l) => { if (l.getEntries().length) TAI_VE = Date.now(); }).observe({ type: 'resource', buffered: false }); } catch (e) { }
function anhUrl(ten) {
  if (typeof anhTen === 'function') ten = anhTen(ten); // ?ucu=1: bộ đầu cũ <ten>_v1 (text.js)
  const w = TAI_WEBP && typeof ANH_W !== 'undefined' && ANH_W[ten];
  if (w) return 'assets/' + ten + '.webp?v=' + w;
  const v = typeof ANH_V !== 'undefined' && ANH_V[ten];
  return 'assets/' + ten + '.png' + (v ? '?v=' + v : '');
}
// máy không đọc được webp (rất cũ): ảnh DOM lỗi → về .png; từ đó mọi anhUrl trả .png
addEventListener('error', (e) => {
  const im = e.target; if (!im || im.tagName !== 'IMG') return;
  const u = im.getAttribute('src') || ''; if (!/assets\/.*\.webp\?v=/.test(u) || im._veP) return;
  im._veP = 1; TAI_WEBP = false; im.src = u.replace(/\.webp\?v=[0-9a-f]+/, '.png');
}, true);
// thuộc tính ảnh cho phần menu đang ẩn (màn bộ bài): trước khi HOME hiện → 'data-tm-src' (chưa tải), TAI.ganSrc() gán sau đợt nền
function srcTai() { return (typeof TAI !== 'undefined' && !TAI.daBoot && !TAI.xem) ? 'data-tm-src' : 'src'; }
if (!window.TDO) window.TDO = { p: 0, dot() { return { them() { }, xong() { }, ket() { } }; }, ve() { } }; // trang không có bộ nạp của index.html
const TAI = {
  dbg: /[?&]debug(=|&|$)/.test(location.search),
  xem: !!new URLSearchParams(location.search).get('preview'), // iframe Test range của trang ụ
  mat: false, lai: false, cho: false, daBoot: false, loiLien: 0, _phien: 0,
  thieu: new Set(), daTai: new Set(), hua: new Map(), nenXong: false,
  ngu(ms) { return new Promise(r => setTimeout(r, ms)); },
  tuyetDoi(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } },

  // ---------- tải 1 ảnh: decode xong mới tính; 404 → ghi thiếu; lỗi mạng → thử lại giãn cách tăng dần ----------
  // cùng 1 URL đang tải (màn HOME / nạp nền / vào trận) → dùng chung 1 lời hứa
  mot(it) {
    let p = this.hua.get(it.url);
    if (!p) { p = this._mot(it); this.hua.set(it.url, p); p.then((im) => { if (!im) this.hua.delete(it.url); }, () => this.hua.delete(it.url)); }
    return p;
  },
  async _mot(it) {
    let png = false;
    for (let lan = 0; ; lan++) {
      if (this.mat) throw TAI_MAT;
      const im = new Image(); im.decoding = 'async';
      const url = png ? it.url.replace(/\.webp\?v=[0-9a-f]+/, '.png') : it.url;
      im.src = url + (lan ? (url.indexOf('?') >= 0 ? '&' : '?') + 'r=' + lan : '');
      // yêu cầu treo (mạng chập chờn, Safari đứng tải) → không đợi mãi: hết hạn 20 s, 40 s… thì tải lại bằng URL mới
      let het = false, hen = 0;
      try {
        // chỉ coi là treo khi KHÔNG tệp nào về trong 15 s (3G chậm: ảnh 450 KB chia băng thông có thể mất > 40 s mà vẫn đang về —
        // huỷ rồi tải lại từ đầu chỉ làm chậm thêm: đo Fast 3G thấy nen_home / home_af_hero bị tải 2 lần)
        await Promise.race([im.decode(), new Promise((ok, no) => { const xem = () => { hen = setTimeout(() => { if (Date.now() - TAI_VE < 15000) return xem(); het = true; no(new Error('het han')); }, 20000 * (lan + 1)); }; xem(); })]);
        clearTimeout(hen); this.loiLien = 0; return im;
      } catch (e) { clearTimeout(hen); }
      if (this.mat) throw TAI_MAT;
      if (het) { im.src = ''; console.warn('[TAI] tải treo, thử lại', it.url); continue; }
      let st = -1; // chỉ hỏi trạng thái (HEAD) — GET no-store từng tải lại CẢ tệp (ảnh tới 1,5 MB) chỉ để xem 200/404
      try { st = (await fetch(url, { method: 'HEAD', cache: 'no-store' })).status; } catch (e) { }
      if (st >= 200 && st < 300 && !png && /\.webp\?v=/.test(url)) { png = true; TAI_WEBP = false; continue; } // có tệp mà không giải mã được webp → .png
      if (st === 404 || st === 410 || (st >= 200 && st < 300 && lan >= 2) || (st >= 400 && lan >= 5)) {
        this.thieu.add(it.url); console.warn('[TAI] missing asset', it.url, st); return null;
      }
      if (st < 0 && (++this.loiLien >= 4 || !navigator.onLine)) { this.matMang('fetch'); throw TAI_MAT; }
      await this.ngu(Math.min(8000, 500 * 2 ** lan));
    }
  },
  sanSang(it) {
    if (it.ten) { const a = REN.anh[it.ten]; if (a && (a._cv || (a.complete && a.naturalWidth && !a._loi))) return true; }
    return !it.ten && this.daTai.has(it.url);
  },
  // ảnh canvas: trao Image đã giải mã cho REN (REN.img chép sang canvas ở lần vẽ đầu)
  giao(ten, im) {
    const a = REN.anh[ten];
    if (a && (a._cv || (a.complete && a.naturalWidth && !a._loi))) return;
    if (a) { clearTimeout(a._hen); a.onload = a.onerror = null; }
    REN.anh[ten] = im; REN.thieu.delete(ten);
    if (REN._choNen && /^(khay|duong_)/.test(ten)) REN.lamNen();
  },
  // số byte của 1 tệp (js/ver-anh.js ANH_B do tools/thap-ver.py ghi lúc xuất bản) — thanh % tính theo byte
  byte(url) {
    if (typeof ANH_B === 'undefined') return 60000;
    let p = url; try { p = new URL(url, location.href).pathname; } catch (e) { }
    const i = p.lastIndexOf('/assets/'); return ANH_B[i >= 0 ? p.slice(i + 1) : p] || 60000;
  },
  // tải cả danh sách (so luồng song song, mặc định 6); dot() → đợt TDO đang hiện (hoặc null) để báo % theo byte
  async nap(ds, dot, so, nen) { // nen: việc nền — nhường hết băng thông khi đang tải trận (TAI.cho)
    const lay = typeof dot === 'function' ? dot : () => dot;
    let i = 0;
    const lam = async (it) => {
      const d = lay();
      if (!this.sanSang(it)) {
        if (d) d.them(it.url, this.byte(it.url));
        const im = await this.mot(it);
        if (im) { this.daTai.add(it.url); if (it.ten) this.giao(it.ten, im); }
      }
      const d2 = lay(); if (d2) { d2.them(it.url, this.byte(it.url)); d2.xong(it.url); }
    };
    const d0 = lay(); if (d0) for (const it of ds) d0.them(it.url, this.byte(it.url), true);
    const luong = async () => { while (i < ds.length) { while (nen && this.cho) await this.ngu(250); if (i >= ds.length) break; await lam(ds[i++]); } };
    await Promise.all(Array.from({ length: Math.min(so || 6, ds.length) }, luong));
  },

  // ---------- danh sách ảnh ----------
  ds() {
    const m = new Map();
    const them = (url, ten) => {
      if (!url || /^data:/.test(url) || /\.(woff2?|ttf|otf)(\?|$)/i.test(url)) return;
      const k = this.tuyetDoi(url), c = m.get(k);
      if (c) { if (ten) c.ten = ten; } else m.set(k, { url: k, ten: ten || null });
    };
    return { them, anh: (ten) => them(anhUrl(ten), ten), ket: () => [...m.values()] };
  },
  ANH_TAI: ['assets/tai_day.png', 'assets/hud_trum_khung.png', 'assets/fx_vong_lv.png'],
  CO_DINH: ['khay', 'duong_thang', 'duong_goc', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana', 'fx_vong_lv'],
  dsMenu() {
    const d = this.ds();
    for (const u of this.ANH_TAI) d.them(u);
    if (!this.xem) {
      d.them('assets/nen_menu.jpg'); d.them('assets/logo.png'); d.them('assets/khung_bang.png');
      // ảnh JS chèn ở màn UI (pass 4 vẽ tay): sao trong chữ, ngọc/vòng độ hiếm, huy chương chỉ huy, mũi tên grow-up, thông báo nổi
      for (const n of ['sao_chu', 'mui_tiep', 'h2_ngoc', 'h2_mv_huy', 'h2_tam_do'].concat(...(typeof TIER_LIST !== 'undefined' ? TIER_LIST : []).map(b => ['ngoc_' + b, 'tier_ring_' + b]))) d.them(anhUrl(n));
      // ảnh trong mọi file CSS (khung, nút, HUD…)
      for (const sh of document.styleSheets) {
        let rs; try { rs = sh.cssRules; } catch (e) { continue; }
        const goc = sh.href || location.href;
        const duyet = (ls) => { for (const r of ls) { if (r.cssRules) duyet(r.cssRules); const t = r.cssText || ''; let k; const re = /url\("?([^")]+)"?\)/g; while ((k = re.exec(t))) d.them(new URL(k[1], goc).href); } };
        try { duyet(rs); } catch (e) { }
      }
      for (const im of document.images) d.them(im.getAttribute('src') || im.getAttribute('data-tm-src'));
      // thẻ ụ: icon + chân dung phi công; chỉ huy: chân dung + biểu tượng
      for (const r of G.roster || []) { d.them(iconOf(r.id)); if (hasPilot(r.id)) d.them(portraitOf(r.id)); }
      for (const id in MAVUONG) { d.them(anhUrl(MAVUONG[id].anh)); d.them(mvIcURL(id)); }
    }
    for (const t of this.CO_DINH) d.anh(t);
    return d.ket();
  },

  // ẢNH CẦN NGAY CHO HOME: chỉ những ảnh màn HOME đang thực sự hiện (nền/viền/mặt nạ CSS của phần tử + ::before/::after,
  // <img> đang hiện — logo, ảnh chỉ huy, icon, 5 chân dung bộ bài…). Phần còn lại của menu tải nền sau khi HOME hiện.
  dsHome() {
    const goc = document.getElementById('hm'); if (!goc || this.xem) return null;
    const d = this.ds(); for (const u of this.ANH_TAI) d.them(u);
    const lay = (v) => { if (!v || v === 'none') return; let k; const re = /url\("?([^")]+)"?\)/g; while ((k = re.exec(v))) d.them(k[1]); };
    const els = [document.getElementById('wrap'), document.getElementById('chon'), goc, ...goc.querySelectorAll('*')];
    for (const e of els) {
      if (!e || !e.getClientRects().length) continue; // không hiện (display:none / [hidden])
      for (const ps of [null, '::before', '::after']) {
        const s = getComputedStyle(e, ps); if (ps && (s.content === 'none' || s.content === 'normal')) continue;
        lay(s.backgroundImage); lay(s.borderImageSource); lay(s.webkitMaskImage); lay(s.maskImage); lay(s.listStyleImage); if (ps) lay(s.content);
      }
      if (e.tagName === 'IMG') d.them(e.getAttribute('src'));
    }
    return d.ket();
  },

  // ---------- màn tải ----------
  dung() {
    if (this._dung) return; this._dung = true;
    // tràn màn: gắn vào <body> (ngoài khung #wrap đã co) — riêng khung xem trước (iframe Test range) giữ trong #wrap
    const w = (this.xem && document.getElementById('wrap')) || document.body;
    this.tk(); addEventListener('resize', () => this.tk()); if (window.visualViewport) visualViewport.addEventListener('resize', () => this.tk());
    // màn tải đã có sẵn trong index.html (hiện ngay từ HTML) → dùng lại; trang khác: dựng mới
    let t = document.getElementById('tai');
    if (!t) {
      t = document.createElement('div'); t.id = 'tai';
      t.innerHTML = '<div class="tai-giua"><div class="tai-logo"></div>' +
        '<div class="tai-thanh"><div class="tai-day" style="--p:0%"><img src="assets/tai_day.png" alt=""></div></div>' +
        '<div class="tai-chu"><b>LOADING</b><span class="tai-pt">0%</span><span class="tai-so"></span></div></div>';
    }
    if (this.xem) t.classList.add('nho');
    if (t.parentNode !== w) w.appendChild(t);
    const m = document.createElement('div'); m.id = 'matmang'; m.hidden = true;
    m.innerHTML = '<div class="mm-bang"><img class="mm-ic" src="' + TAI_ANH.vong_xich + '" alt="">' +
      '<div class="mm-ten">CONNECTION LOST</div><div class="mm-phu">Check your network. The match has ended.</div>' +
      '<button class="mm-nut" id="mm-nut">RECONNECT</button></div>';
    w.appendChild(m);
    m.querySelector('.mm-bang').style.borderImageSource = 'url(' + TAI_ANH.khung_bang + ')';
    m.querySelector('.mm-nut').style.borderImageSource = 'url(' + TAI_ANH.hud_trieu_san + ')';
    m.querySelector('#mm-nut').addEventListener('click', (e) => { e.stopPropagation(); if (this.lai) this.veMenu(); else this.thu(true); });
    this.el = t;
  },
  // hệ số co nội dung màn tải/mất mạng theo cửa sổ (nền thì luôn phủ kín cửa sổ)
  tk() {
    const vw = innerWidth || document.documentElement.clientWidth || 390, vh = innerHeight || document.documentElement.clientHeight || 844;
    const k = Math.max(0.8, Math.min(1.6, vw / 430, vh / 640));
    document.documentElement.style.setProperty('--tk', k.toFixed(3));
  },
  // giu: giữ % đang chạy (đợt khởi động từ index.html); không → đợt mới từ 0 %
  hien(nhan, giu) {
    this.dung(); const t = this.el;
    t.hidden = false; t.classList.remove('het'); if (!this.xem) document.documentElement.classList.add('tai-mo');
    t.querySelector('.tai-chu b').textContent = nhan || 'LOADING';
    if (!giu) TDO.dot(0, 100);
  },
  an() { if (this.el) this.el.hidden = true; document.documentElement.classList.remove('tai-mo'); },
  tienDo(xong, tong) { // (cũ — theo số tệp) giữ cho tương thích; thanh giờ do TDO tính theo byte
    if (!this.el) return;
    const p = tong ? Math.floor(xong / tong * 100) : 0;
    this.el.querySelector('.tai-day').style.setProperty('--p', p + '%');
    this.el.querySelector('.tai-pt').textContent = p + '%';
    this.el.querySelector('.tai-so').textContent = tong ? xong + '/' + tong : '';
    this.el.dataset.p = p;
  },
  // vòng xoay PNG nhỏ (fx_vong_lv) trên canvas — chỗ một ảnh lẻ còn đang tải trong trận
  veXoay(ctx, x, y, d) {
    const a = REN.img('fx_vong_lv'); if (!a) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(REN.t * 5); ctx.globalAlpha *= 0.8;
    ctx.drawImage(REN.mip(a, d * REN.s * REN.dpr), -d / 2, -d / 2, d, d); ctx.restore();
  },

  // ---------- khởi động: menu ----------
  // KHỞI ĐỘNG NHANH: đợt 1 = chỉ ảnh HOME đang hiện (thanh tiếp nối % của đợt css/js) → HOME bấm được ngay;
  // đợt 2 = phần còn lại của menu (bộ bài, bộ sưu tập, 85 chân dung, khung, ảnh CSS của trận…) tải NỀN, 4 luồng.
  // Bấm nút menu khi đợt 2 chưa xong → màn tải (đợt 2) rồi mới mở (không bao giờ lộ hình thiếu ảnh). PLAY đủ bộ → vào trận (tran() tự đợi).
  async napMenu() {
    const dauTien = !this.daBoot;
    this.hien('LOADING', dauTien);
    // trận đang chờ (lần đầu → trận hướng dẫn, ?mode=): HOME không hiện → không đợi ảnh menu nào (trước: đợi CẢ menu ~10 MB,
    // gồm 85 chân dung, trước khi trận được tải); tran() tự lấy phần cần cho trận, còn lại tải nền SAU khi trận chạy
    const tat = this.dsMenu(), home = this.xem ? tat : this.cho && dauTien ? [] : (this.dsHome() || tat);
    const dot = this.cho ? null : TDO.dot(dauTien ? Math.max(TDO.p || 0, 20) : 0, 100, dauTien);
    try { await this.nap(home, () => (this.cho ? null : dot)); }
    catch (e) { if (e === TAI_MAT) return; throw e; }
    if (this.mat) return;
    if (dot) dot.ket();
    this.daBoot = true; if (!this.cho) this.an(); // trận đang chờ tải (?mode= / khung xem trước) → giữ màn tải
    if (this._bootXong) this._bootXong();
    this.thaHoan();
    this.napNen(tat);
    if (dauTien) setTimeout(() => this.ktVer(), 1500);
  },
  napNen(tat) {
    const con = tat.filter(it => !this.sanSang(it));
    this.nenCon = con; this.nenDot = null;
    if (!con.length) { this.nenXong = true; this.ganSrc(); return; }
    this.nenXong = false;
    const phien = this._nenPhien = (this._nenPhien || 0) + 1;
    this.nenP = this.nap(con, () => this.nenDot, 4, true).then(() => {
      if (phien !== this._nenPhien) return;
      this.nenXong = true; if (this.nenDot) this.nenDot.ket(); this.nenDot = null; this.ganSrc();
      const b = this._choBam; this._choBam = null;
      if (b) { if (!this.cho && !this.mat) this.an(); setTimeout(() => { try { b.click(); } catch (e) { } }, 30); }
    }, (e) => { if (e !== TAI_MAT) console.warn('[TAI] nen', e); });
  },
  // REN.taiAnh gọi trước khi HOME hiện (ảnh canvas của trận: CO_DINH, hiệu ứng ghép, HUD…) → xếp hàng, gán src sau đợt HOME
  _hoan: [],
  hoan(a, u, ten) { if (this.daBoot || this.xem || this.cho || this._hetHoan) return false; this._hoan.push([a, u, ten]); return true; },
  // việc nạp ảnh của các tệp js lúc khởi động (KHUNG.tai, HUD2.tai…) không cần cho HOME → chạy sau khi HOME hiện
  _sau: [],
  sauHome(fn) { if (this.daBoot || this.xem || this.cho || this._hetHoan) fn(); else this._sau.push(fn); },
  thaHoan() { this._hetHoan = true; const sau = this._sau; this._sau = []; for (const f of sau) { try { f(); } catch (e) { console.error('[TAI] sauHome', e); } } const ds = this._hoan; this._hoan = []; for (const [a, u, ten] of ds) if (!a.src && (!ten || REN.anh[ten] === a)) a.src = u; },
  // ảnh thẻ dựng lúc khởi động (cardArt → data-tm-src) → gán src thật khi đợt nền đã tải xong (lấy từ bộ đệm)
  ganSrc(vung) { document.querySelectorAll(vung ? vung.split(',').map(v => v.trim() + ' img[data-tm-src]').join(',') : 'img[data-tm-src]').forEach(im => { im.setAttribute('src', im.getAttribute('data-tm-src')); im.removeAttribute('data-tm-src'); }); },
  // bấm nút menu khi đợt nền chưa xong: hiện màn tải với % của phần còn lại, xong thì bấm lại hộ
  choNen(el) {
    this._choBam = el;
    if (this.nenDot) return;
    this.hien('LOADING', true);
    const d = this.nenDot = TDO.dot(0, 100);
    for (const it of this.nenCon || []) { d.them(it.url, this.byte(it.url), true); if (this.daTai.has(it.url) || this.sanSang(it)) d.xong(it.url); else if (this.hua.has(it.url)) d.them(it.url); }
  },
  // ver.json (tools/thap-ver.py): bản trên máy chủ mới hơn bản đang chạy → nạp lại trang, nhưng CHỈ khi đang đứng ở HOME
  // (không bao giờ chặn màn tải đầu, không cắt ngang trận / bảng đang mở)
  ktVer() {
    const m = document.querySelector('meta[name="tm-ver"]'); if (!m || this.xem) return;
    const V = m.getAttribute('content');
    fetch('ver.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).then(j => {
      if (!j || !j.v || j.v === V) return;
      const k = 'tm-ver-tai'; try { if (sessionStorage.getItem(k) === j.v) return; } catch (e) { return; }
      const thu = () => {
        const c = document.getElementById('chon'), mo = document.getElementById('hm-mo');
        const oHome = c && !c.hidden && c.classList.contains('xem-hm') && (!mo || mo.hidden) && !(G.ban && G.ban.length) && !this.cho && !this.mat && this.nenXong !== false;
        if (!oHome) return setTimeout(thu, 2000);
        try { sessionStorage.setItem(k, j.v); } catch (e) { }
        location.reload();
      };
      thu();
    }).catch(() => { });
  },
  // ---------- vào trận: đợi mọi ảnh của trận giải mã xong; vòng lặp đứng yên (TAI.cho) ----------
  tran(ds) {
    const phien = ++this._phien; this.cho = true;
    // ảnh tĩnh của HUD trận (index.html data-tm-src) → gán src; danh sách dưới đợi chúng giải mã. CHỈ vùng trận — lưới 85 thẻ
    // của màn bộ bài (cũng data-tm-src) để đợt nền gán sau, không tranh băng thông với màn tải trận
    this.thaHoan(); this.ganSrc('#top, #duoi, #canh-bao, #cutin, #tt, #ketqua, #dung, #bang-wave, #tb-doi');
    this.hien(this.xem ? 'LOADING' : 'LOADING BATTLE');
    // ảnh TRÙM (~5 MB, 12 trùm × dải 8 khung/hướng; trùm đầu tiên ở wave 10): màn tải trận KHÔNG đợi — tải nền 3 luồng ngay khi
    // trận chạy, theo thứ tự xuất hiện (REN.img vẫn tự tải nếu cần sớm hơn). Trận hướng dẫn lần đầu trên 3G: 137 s → ~66 s.
    const sau = this.xem ? [] : ds.filter(t => /^(fx_)?trum_/.test(t)); if (sau.length) ds = ds.filter(t => !/^(fx_)?trum_/.test(t));
    const d = this.ds(); for (const t of ds) d.anh(t); d.anh('fx_vong_lv');
    const dot = TDO.dot(0, 100);
    (async () => {
      try {
        await this.bootP; if (phien !== this._phien) return;
        // đợt nền của menu chưa xong: lấy thêm ảnh CSS/DOM (HUD trận…) + chân dung của bộ bài đang ra trận, bỏ chân dung/icon khác
        if (!this.nenXong && this.nenCon) {
          const bo = new Set(); for (const b of (G.ban || [])) for (const id of b.deck || []) { bo.add(this.tuyetDoi(portraitOf(id))); bo.add(this.tuyetDoi(iconOf(id))); }
          for (const it of this.nenCon) if (!/\/(pilot_|nho\/|af_)/.test(it.url) || bo.has(it.url)) d.them(it.url, it.ten);
        }
        await this.nap(d.ket(), () => (phien === this._phien ? dot : null));
      }
      catch (e) { if (e === TAI_MAT) return; throw e; }
      if (phien !== this._phien || this.mat) return;
      dot.ket(); this.cho = false; this.an();
      if (sau.length) { const d2 = this.ds(); for (const t of sau) d2.anh(t); try { await this.nap(d2.ket(), null, 3); } catch (e) { if (e !== TAI_MAT) console.warn('[TAI] trum', e); } }
    })();
  },

  // ---------- mất mạng ----------
  matMang(lyDo) {
    if (this.mat) return;
    this.mat = true; this.lai = false; this.cho = false; this._phien++;
    console.warn('[TAI] connection lost:', lyDo);
    this.dung();
    // rời trận ngay: trận kết thúc (người chơi muốn thoát game khi mất mạng)
    if (typeof G !== 'undefined' && G.ban && G.ban.length && !this.xem) {
      G.dung = true; G.ban = []; G.quai = [];
      try { SND.nhac(0); } catch (e) { }
      for (const s of ['#top', '#duoi', '#dung', '#ketqua', '#tt', '#cutin', '#canh-bao', '#bang-wave', '#tb-doi']) { const e = document.querySelector(s); if (e) e.hidden = true; }
    } else if (typeof G !== 'undefined') G.dung = true;
    const m = document.getElementById('matmang');
    m.hidden = false; m.classList.toggle('nho', this.xem);
    this.chu('CONNECTION LOST', 'Check your network. The match has ended.', 'RECONNECT');
    clearInterval(this._hen); this._hen = setInterval(() => this.thu(), 3000);
  },
  chu(ten, phu, nut) {
    const m = document.getElementById('matmang'); if (!m) return;
    m.querySelector('.mm-ten').textContent = ten; m.querySelector('.mm-phu').textContent = phu; m.querySelector('.mm-nut').textContent = nut;
  },
  // thử kết nối: có mạng + tải được 1 tệp nhỏ → đề nghị về menu
  async thu(bam) {
    if (!this.mat || this._dangThu) return;
    if (!navigator.onLine) { if (bam) this.chu('CONNECTION LOST', 'Still offline. Waiting for network…', 'RECONNECT'); return; }
    this._dangThu = true; if (bam) this.chu('CONNECTION LOST', 'Checking connection…', 'RECONNECT');
    let ok = false;
    try { ok = (await fetch('assets/roster.json?ping=' + Date.now(), { cache: 'no-store' })).ok; } catch (e) { }
    this._dangThu = false;
    if (!this.mat) return;
    if (ok) { this.lai = true; clearInterval(this._hen); this.chu('BACK ONLINE', 'Connection restored.', 'BACK TO MENU'); }
    else if (bam) this.chu('CONNECTION LOST', 'Still offline. Waiting for network…', 'RECONNECT');
  },
  veMenu() {
    this.mat = false; this.lai = false; this.loiLien = 0; clearInterval(this._hen);
    // chưa khởi động xong (mất mạng lúc mở game) hoặc khung xem trước → nạp lại trang = màn tải từ đầu
    if (!this.daBoot || this.xem || typeof UI === 'undefined') { location.reload(); return; }
    document.getElementById('matmang').hidden = true;
    G.ban = []; G.quai = []; G.dung = false;
    for (const s of ['#top', '#duoi', '#dung', '#ketqua', '#tt']) { const e = document.querySelector(s); if (e) e.hidden = true; }
    const c = document.querySelector('#chon'); if (c) c.hidden = false;
    try { UI.veChon(); } catch (e) { }
    REN.thuLaiLoi();
    this.napMenu(); // nạp lại ảnh (ảnh lỗi lúc mất mạng)
  },
  // ảnh lẻ (REN.taiAnh) lỗi giữa trận → kiểm tra mạng
  async loiAnh() {
    if (this.mat || this._kt) return; this._kt = true;
    let ok = navigator.onLine;
    if (ok) { try { ok = (await fetch('assets/roster.json?ping=' + Date.now(), { cache: 'no-store' })).ok; } catch (e) { ok = false; } }
    this._kt = false;
    if (!ok && ++this.loiLien >= 2) this.matMang('asset');
    else if (ok) this.loiLien = 0;
  },
};

// ---------- ĐẶT KHUNG #wrap NGAY KHI TRANG MỞ (trước phông/roster/ảnh) ----------
// Lỗi F5 trên iPhone Safari: trước đây chỉ REN.coLai() (gọi trong UI.init, sau khi chờ phông + roster.json) mới đặt
// left/top/scale cho #wrap → nếu bước chờ bị treo/chậm, #wrap nằm ở left:50% top:50% chưa co (màn đen, nền lệch góc phải dưới).
// Giờ đặt khung đồng bộ ngay đây + mọi lần đổi cỡ (resize, visualViewport, xoay máy, pageshow/bfcache, load).
// innerWidth/Height = 0 (Safari lúc khôi phục trang) → bỏ qua, thử lại khung sau.
// datKhung() khai báo trong index.html (script nội tuyến ngay trong #wrap); dự phòng nếu thiếu:
if (typeof datKhung !== 'function') window.datKhung = function () {
  const wrap = document.getElementById('wrap'); if (!wrap) return false;
  const vw = innerWidth || document.documentElement.clientWidth, vh = innerHeight || document.documentElement.clientHeight;
  if (!(vw > 0 && vh > 0)) return false;
  const thuc = devicePixelRatio || 1, s = Math.min(vw / 430, vh / 860);
  wrap.style.left = Math.round((vw - 430 * s) / 2 * thuc) / thuc + 'px'; wrap.style.top = Math.round((vh - 860 * s) / 2 * thuc) / thuc + 'px';
  wrap.style.transformOrigin = '0 0'; wrap.style.transform = 'scale(' + s + ')';
  return true;
};
// gọi lại bố cục: REN đã sẵn sàng → REN.coLai() (cả canvas); chưa → chỉ đặt khung. Gom nhiều sự kiện vào 1 khung hình.
let _hkLai = 0, _hkCu = '';
function hoiKhung(ep) {
  if (_hkLai) return;
  _hkLai = requestAnimationFrame(() => {
    _hkLai = 0;
    const k = innerWidth + 'x' + innerHeight + '@' + devicePixelRatio;
    if (!ep && k === _hkCu) return; _hkCu = k;
    if (typeof REN !== 'undefined' && REN.cv) REN.coLai(); else if (!datKhung()) { _hkCu = ''; hoiKhung(); }
  });
}
datKhung() || hoiKhung();
addEventListener('resize', () => hoiKhung());
addEventListener('orientationchange', () => { hoiKhung(); setTimeout(() => hoiKhung(), 300); setTimeout(() => hoiKhung(true), 800); });
addEventListener('pageshow', () => hoiKhung(true));
addEventListener('load', () => { hoiKhung(true); setTimeout(() => hoiKhung(), 500); });
if (window.visualViewport) visualViewport.addEventListener('resize', () => hoiKhung());
document.addEventListener('visibilitychange', () => { if (!document.hidden) hoiKhung(true); });
TAI.bootP = new Promise(r => { TAI._bootXong = r; });
TAI.dung();
TAI.hien('LOADING', true); { const w = document.getElementById('wrap'); if (w) w.classList.remove('dang-tai'); document.documentElement.classList.remove('dang-tai'); } // che ngay từ đầu (khung xem trước: thanh nhỏ, đợi ảnh của ụ)
// cổng bấm: nút menu (ngoài HOME) cần ảnh của đợt nền → đợi đợt nền (pha capture, trước mọi bộ bắt khác)
addEventListener('click', (e) => {
  if (TAI.xem || !TAI.daBoot || TAI.nenXong || TAI.mat || TAI.cho || !e.isTrusted) return;
  const el = e.target && e.target.closest && e.target.closest('#chon [data-act], #chon button, #chon label, #chon input'); if (!el) return;
  if (el.dataset && el.dataset.act === 'hm-choi' && typeof UI !== 'undefined' && UI.chon && UI.chon.length >= 5) return; // vào trận: tran() tự đợi phần cần
  e.preventDefault(); e.stopImmediatePropagation();
  TAI.choNen(el);
}, true);
addEventListener('offline', () => TAI.matMang('offline'));
addEventListener('online', () => TAI.thu());
if (!navigator.onLine) TAI.matMang('boot-offline');
