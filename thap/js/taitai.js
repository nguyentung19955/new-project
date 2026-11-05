// TURRET MERGE — MÀN TẢI (thanh tiến độ thật) + MÀN MẤT MẠNG
// Quy tắc: không bao giờ hiện hình vẽ code thay ảnh còn đang tải → che bằng màn tải (ảnh ChatGPT: nen_menu, logo,
// khung thanh hud_trum_khung, dải đầy tai_day cắt từ tia_laser) tới khi mọi ảnh của màn đã GIẢI MÃ xong (img.decode()).
// Mất mạng (sự kiện 'offline', navigator.onLine, tải lỗi liên tiếp) → dừng trận, hiện màn "Connection lost";
// có mạng lại + tải được tệp → nút "Back to menu" (về menu, nạp lại ảnh).
'use strict';

const TAI_MAT = { matMang: true };
const TAI = {
  dbg: /[?&]debug(=|&|$)/.test(location.search),
  xem: !!new URLSearchParams(location.search).get('preview'), // iframe Test range của trang ụ
  mat: false, lai: false, cho: false, daBoot: false, loiLien: 0, _phien: 0,
  thieu: new Set(), daTai: new Set(),
  ngu(ms) { return new Promise(r => setTimeout(r, ms)); },
  tuyetDoi(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } },

  // ---------- tải 1 ảnh: decode xong mới tính; 404 → ghi thiếu; lỗi mạng → thử lại giãn cách tăng dần ----------
  async mot(it) {
    for (let lan = 0; ; lan++) {
      if (this.mat) throw TAI_MAT;
      const im = new Image(); im.decoding = 'async';
      im.src = it.url + (lan ? (it.url.indexOf('?') >= 0 ? '&' : '?') + 'r=' + lan : '');
      try { await im.decode(); this.loiLien = 0; return im; } catch (e) { }
      if (this.mat) throw TAI_MAT;
      let st = -1;
      try { st = (await fetch(it.url, { cache: 'no-store' })).status; } catch (e) { }
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
  // tải cả danh sách (6 luồng song song), báo tiến độ (xong, tổng)
  async nap(ds, moi) {
    const tong = ds.length; let xong = 0, i = 0;
    if (moi) moi(0, tong);
    const lam = async (it) => {
      if (!this.sanSang(it)) {
        const im = await this.mot(it);
        if (im) { this.daTai.add(it.url); if (it.ten) this.giao(it.ten, im); }
      }
      xong++; if (moi) moi(xong, tong);
    };
    const luong = async () => { while (i < ds.length) await lam(ds[i++]); };
    await Promise.all(Array.from({ length: Math.min(6, ds.length) }, luong));
  },

  // ---------- danh sách ảnh ----------
  ds() {
    const m = new Map();
    const them = (url, ten) => {
      if (!url || /^data:/.test(url) || /\.(woff2?|ttf|otf)(\?|$)/i.test(url)) return;
      const k = this.tuyetDoi(url), c = m.get(k);
      if (c) { if (ten) c.ten = ten; } else m.set(k, { url: k, ten: ten || null });
    };
    return { them, anh: (ten) => them('assets/' + ten + '.png', ten), ket: () => [...m.values()] };
  },
  ANH_TAI: ['assets/tai_day.png', 'assets/hud_trum_khung.png', 'assets/fx_vong_lv.png'],
  CO_DINH: ['khay', 'duong_thang', 'duong_goc', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana', 'fx_vong_lv'],
  dsMenu() {
    const d = this.ds();
    for (const u of this.ANH_TAI) d.them(u);
    if (!this.xem) {
      d.them('assets/nen_menu.jpg'); d.them('assets/logo.png'); d.them('assets/khung_bang.png');
      // ảnh JS chèn ở màn UI (pass 4 vẽ tay): sao trong chữ, ngọc/vòng độ hiếm, huy chương chỉ huy, mũi tên grow-up, thông báo nổi
      for (const n of ['sao_chu', 'mui_tiep', 'h2_ngoc', 'h2_mv_huy', 'h2_tam_do'].concat(...(typeof TIER_LIST !== 'undefined' ? TIER_LIST : []).map(b => ['ngoc_' + b, 'tier_ring_' + b]))) d.them('assets/' + n + '.png');
      // ảnh trong mọi file CSS (khung, nút, HUD…)
      for (const sh of document.styleSheets) {
        let rs; try { rs = sh.cssRules; } catch (e) { continue; }
        const goc = sh.href || location.href;
        const duyet = (ls) => { for (const r of ls) { if (r.cssRules) duyet(r.cssRules); const t = r.cssText || ''; let k; const re = /url\("?([^")]+)"?\)/g; while ((k = re.exec(t))) d.them(new URL(k[1], goc).href); } };
        try { duyet(rs); } catch (e) { }
      }
      for (const im of document.images) d.them(im.getAttribute('src'));
      // thẻ ụ: icon + chân dung phi công; chỉ huy: chân dung + biểu tượng
      for (const r of G.roster || []) { d.them(iconOf(r.id)); if (hasPilot(r.id)) d.them(portraitOf(r.id)); }
      for (const id in MAVUONG) { d.them('assets/' + MAVUONG[id].anh + '.png'); d.them(mvIcURL(id)); }
    }
    for (const t of this.CO_DINH) d.anh(t);
    return d.ket();
  },

  // ---------- màn tải ----------
  dung() {
    if (this._dung) return; this._dung = true;
    const w = document.getElementById('wrap') || document.body;
    const t = document.createElement('div'); t.id = 'tai'; if (this.xem) t.className = 'nho';
    t.innerHTML = '<div class="tai-giua"><div class="tai-logo"></div>' +
      '<div class="tai-thanh"><div class="tai-day" style="--p:0%"><img src="assets/tai_day.png" alt=""></div></div>' +
      '<div class="tai-chu"><b>LOADING</b><span class="tai-pt">0%</span><span class="tai-so"></span></div></div>';
    w.appendChild(t);
    const m = document.createElement('div'); m.id = 'matmang'; m.hidden = true;
    m.innerHTML = '<div class="mm-bang"><img class="mm-ic" src="' + TAI_ANH.vong_xich + '" alt="">' +
      '<div class="mm-ten">CONNECTION LOST</div><div class="mm-phu">Check your network. The match has ended.</div>' +
      '<button class="mm-nut" id="mm-nut">RECONNECT</button></div>';
    w.appendChild(m);
    m.querySelector('.mm-bang').style.borderImageSource = 'url(' + TAI_ANH.khung_bang + ')';
    m.querySelector('.mm-nut').style.backgroundImage = 'url(' + TAI_ANH.hud_trieu_san + ')';
    m.querySelector('#mm-nut').addEventListener('click', (e) => { e.stopPropagation(); if (this.lai) this.veMenu(); else this.thu(true); });
    this.el = t;
  },
  hien(nhan) {
    this.dung(); const t = this.el;
    t.hidden = false; t.classList.remove('het'); if (!this.xem) document.documentElement.classList.add('tai-mo');
    t.querySelector('.tai-chu b').textContent = nhan || 'LOADING';
    this.tienDo(0, 0);
  },
  an() { if (this.el) this.el.hidden = true; document.documentElement.classList.remove('tai-mo'); },
  tienDo(xong, tong) {
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
  async napMenu() {
    this.hien('LOADING');
    try { await this.nap(this.dsMenu(), (a, b) => { if (!this.cho) this.tienDo(a, b); }); }
    catch (e) { if (e === TAI_MAT) return; throw e; }
    if (this.mat) return;
    this.daBoot = true; if (!this.cho) this.an(); // trận đang chờ tải (?mode= / khung xem trước) → giữ màn tải
    if (this._bootXong) this._bootXong();
  },
  // ---------- vào trận: đợi mọi ảnh của trận giải mã xong; vòng lặp đứng yên (TAI.cho) ----------
  tran(ds) {
    const phien = ++this._phien; this.cho = true;
    this.hien(this.xem ? 'LOADING' : 'LOADING BATTLE');
    const d = this.ds(); for (const t of ds) d.anh(t); d.anh('fx_vong_lv');
    (async () => {
      try { await this.bootP; if (phien !== this._phien) return; await this.nap(d.ket(), (a, b) => { if (phien === this._phien) this.tienDo(a, b); }); }
      catch (e) { if (e === TAI_MAT) return; throw e; }
      if (phien !== this._phien || this.mat) return;
      this.cho = false; this.an();
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
TAI.hien('LOADING'); { const w = document.getElementById('wrap'); if (w) w.classList.remove('dang-tai'); } // che ngay từ đầu (khung xem trước: thanh nhỏ, đợi ảnh của ụ)
addEventListener('offline', () => TAI.matMang('offline'));
addEventListener('online', () => TAI.thu());
if (!navigator.onLine) TAI.matMang('boot-offline');
