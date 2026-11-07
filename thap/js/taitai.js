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
// lúc cuộn gần nhất (js/dkkeo.js tự cuộn lưới bộ bài + sự kiện scroll gốc ở bộ sưu tập/bảng) → đợt nạp nền nhường
var TAI_CUON = 0;
addEventListener('scroll', () => { TAI_CUON = performance.now(); }, { capture: true, passive: true });
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
  thieu: new Set(), daTai: new Set(), daXL: new Set(), hua: new Map(), nenXong: false,
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
      if (st < 0 && (++this.loiLien >= 4 || !navigator.onLine)) {
        // chỉ màn tải ĐẦU (chưa vào được game) và trận ONLINE mới che màn mất mạng; menu / SOLO / Test range: đợi mạng rồi tải tiếp
        if (this.canChe()) { this.matMang('fetch'); throw TAI_MAT; }
        await this.choMang(); this.loiLien = 0; continue;
      }
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
    // trọng số thanh %: mỗi tệp tính tối đa 350 KB — dải trùm ~8 MB tải sau cùng từng làm thanh đứng ở 20 % rồi nhảy vọt (07/11)
    const bw = (u) => Math.min(this.byte(u), 350000);
    let i = 0;
    const lam = async (it) => {
      const d = lay();
      if (it.tho) { // chỉ TẢI về máy (bộ đệm), chưa giải mã — giải mã nền sau khi HOME hiện (napNen)
        if (!this.daXL.has(it.url) && !this.sanSang(it)) { if (d) d.them(it.url, bw(it.url)); await this.layTho(it.url); }
      } else if (!this.sanSang(it)) {
        if (d) d.them(it.url, bw(it.url));
        const im = await this.mot(it);
        if (im) { this.daTai.add(it.url); if (it.ten) this.giao(it.ten, im); }
      }
      this.daXL.add(it.url); // đã xử lý (tải được HOẶC thiếu/lỗi) → choNen tính là xong, % và số tệp khớp nhau
      const d2 = lay(); if (d2) { d2.them(it.url, bw(it.url)); d2.xong(it.url); }
    };
    const d0 = lay(); if (d0) for (const it of ds) d0.them(it.url, bw(it.url), true);
    // nen: nhường khi đang tải trận (TAI.cho), khi người chơi đang cuộn lưới (giải mã ảnh nền giữa lúc cuộn = khung hình rớt trên iPhone)
    // VÀ khi đang đánh (dangDanh — chống nóng máy, tuvan/nong)
    const nhuong = () => this.cho || performance.now() - TAI_CUON < 450 || this.dangDanh();
    const luong = async () => { while (i < ds.length) { while (nen && nhuong()) await this.ngu(this.cho || this.dangDanh() ? 250 : 150); if (i >= ds.length) break; await lam(ds[i++]); } };
    await Promise.all(Array.from({ length: Math.min(so || 6, ds.length) }, luong));
  },

  // đang đánh (trận chạy, không tạm dừng, không phải khung xem trước): việc tải NỀN (ảnh menu chưa cần) nghỉ → không giải mã ảnh
  // chồng lên khung hình trận (chống nóng máy — tuvan/nong). Tạm dừng / về menu / kết thúc → tải tiếp.
  dangDanh() { return !this.xem && typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !G.dung && !G.ketThuc; },
  // tải thô 1 tệp vào bộ đệm (Service Worker / HTTP); lỗi mạng → thử lại 2 lần, vẫn lỗi thì để REN.img tự tải khi cần
  async layTho(u) {
    for (let lan = 0; lan < 3; lan++) {
      if (this.mat) throw TAI_MAT;
      try { const r = await fetch(u); if (r.ok) { await r.arrayBuffer(); return true; } if (r.status === 404) return false; } catch (e) { }
      await this.ngu(500 * (lan + 1));
    }
    return false;
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
  ANH_TAI: ['assets/tai_day.png', 'assets/tai_khung.webp?v=7509ba33', 'assets/fx_vong_lv.webp?v=22846933'],
  CO_DINH: ['khay', 'duong_thang', 'duong_goc', 'cong', 'loi', 'tia_lua', 'khoi_0', 'khoi_1', 'khoi_2', 'khoi_3', 'ui_mana', 'fx_vong_lv'],
  dsMenu() {
    const d = this.ds();
    for (const u of this.ANH_TAI) d.them(u);
    if (!this.xem) {
      d.them('assets/nen_menu.jpg'); d.them('assets/logo.webp?v=d6964dd9'); d.them('assets/khung_bang.webp?v=24d6a27d');
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
      for (const r of G.roster || []) { d.them(iconOf(r.id)); if (hasPilot(r.id)) d.them(thumbOf(r.id)); }
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
        '<div class="tai-chu"><b>LOADING</b><span class="tai-pt">0%</span></div></div>';
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
    this.el.dataset.p = p;
  },
  // vòng xoay PNG nhỏ (fx_vong_lv) trên canvas — chỗ một ảnh lẻ còn đang tải trong trận
  veXoay(ctx, x, y, d) {
    const a = REN.img('fx_vong_lv'); if (!a) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(REN.t * 5); ctx.globalAlpha *= 0.8;
    ctx.drawImage(REN.mip(a, d * REN.s * REN.dpr), -d / 2, -d / 2, d, d); ctx.restore();
  },

  // ---------- khởi động: MỘT màn tải duy nhất ----------
  // Người dùng: "đã vào game rồi, bấm màn khác lại vẫn load game" — trước đây đợt 1 chỉ tải ảnh HOME, phần còn lại tải NỀN;
  // bấm DECK/COLLECTION/PLAY khi nền chưa xong → hiện lại màn tải ('LOADING', 'LOADING BATTLE').
  // Giờ: màn tải đầu tải + giải mã HẾT ảnh của mọi màn (menu, bộ bài, bộ sưu tập, chân dung, HUD trận, quái, trùm, hiệu ứng,
  // bộ bài đã lưu + chân dung chỉ huy). Xong là không màn nào hiện màn tải nữa trong phiên. Ảnh của ụ KHÁC (đổi bộ bài, bàn máy
  // CO-OP/PVP) tải thô (không giải mã) vào bộ đệm sau đó → vào trận chỉ còn giải mã vài chục ms, không che màn.
  dsTranBoot() {
    if (this.xem || typeof UI === 'undefined' || !UI.dsTran) return [];
    const deck = (UI.chon && UI.chon.length === 5) ? UI.chon : [];
    let ds = []; try { ds = UI.dsTran([{ deck, mv: { id: UI.mv || 'hero' } }]); } catch (e) { console.warn('[TAI] dsTran', e); }
    if (REN.boLuoi) ds = REN.boLuoi(ds);
    for (const id in MAVUONG) ds.push(MAVUONG[id].anh); // chân dung cut-in mọi chỉ huy (bàn máy chọn ngẫu nhiên)
    return ds;
  },
  async napMenu() {
    const dauTien = !this.daBoot;
    if (dauTien) this.hien('LOADING', true);
    // trận đang chờ (lần đầu → trận hướng dẫn, ?mode=): HOME không hiện → không đợi ảnh menu; tran() lấy phần của trận,
    // menu tải + giải mã nền sau khi trận chạy (không còn màn tải nào sau đó — màn nào mở sớm thì ảnh hiện dần)
    const tat = this.dsMenu();
    let boot = tat;
    if (dauTien && !this.xem) {
      const d = this.ds(); for (const it of tat) d.them(it.url, it.ten); for (const t of this.dsTranBoot()) d.anh(t);
      // ảnh TRÙM (~8 MB dải khung, trùm đầu ở wave 10): tải về máy trong màn tải nhưng giải mã SAU (nền) — lần mở sau
      // không phải đợi giải mã 8 MB mới vào HOME
      boot = d.ket().map(it => (/\/(fx_)?trum_/.test(it.url) ? Object.assign({}, it, { tho: true }) : it));
    }
    // LẦN MỞ SAU (Service Worker đang giữ trang + lần trước đã tải đủ CÙNG bản này): mọi tệp đã nằm trong máy → chỉ đợi ảnh
    // HOME, phần còn lại giải mã nền từ bộ đệm (~1–2 s, không qua mạng). Bản mới / bộ đệm bị xoá → tải đủ như lần đầu.
    this.nhanh = dauTien && !this.xem && !this.cho && this.daDu();
    const home = this.cho && dauTien ? [] : this.nhanh ? (this.dsHome() || boot) : boot;
    const dot = dauTien && !this.cho ? TDO.dot(Math.max(TDO.p || 0, 20), 100, true) : null;
    try { await this.nap(home, () => dot, 8); } // (trước: cho=true → null → thanh khởi động ngừng cập nhật, đứng 20 % tới khi xong — 07/11; thanh trận dựng sau bootP nên không tranh)
    catch (e) { if (e === TAI_MAT) return; throw e; }
    if (this.mat) return;
    if (dot) dot.ket();
    this.daBoot = true; if (!this.cho && dauTien) this.an(); // trận đang chờ tải (?mode= / khung xem trước) → giữ màn tải
    this.ganSrc();
    if (this._bootXong) this._bootXong();
    this.thaHoan();
    this.napNen(boot);
    if (dauTien) { this.tBoot = performance.now(); setTimeout(() => this.ktVer(), 1500); setTimeout(() => this.napTho(), 600); setTimeout(() => this.swGiu(), 3000); }
  },
  napNen(tat) {
    const con = tat.filter(it => !this.sanSang(it)).map(it => (it.tho ? { url: it.url, ten: it.ten } : it));
    this.nenCon = con;
    if (!con.length) { this.nenXong = true; this.ganSrc(); return; }
    this.nenXong = false;
    const phien = this._nenPhien = (this._nenPhien || 0) + 1;
    this.nenP = this.nap(con, null, this.nhanh ? 6 : 4, true).then(() => {
      if (phien !== this._nenPhien) return;
      this.nenXong = true; this.ganSrc();
    }, (e) => { if (e !== TAI_MAT) console.warn('[TAI] nen', e); });
  },
  // TẢI THÔ (không giải mã, không giữ bộ nhớ ảnh): ảnh trận của MỌI ụ khác + ảnh tình huống → vào bộ đệm (Service Worker / HTTP).
  // Đổi bộ bài / bàn máy dùng ụ khác → vào trận lấy từ máy, giải mã ngay. 2 luồng, nhường khi đang cuộn / đang vào trận.
  async napTho() {
    if (this.xem || this._tho || typeof UI === 'undefined' || !UI.dsTran || !G.roster) return;
    this._tho = true;
    let ds = []; try { ds = UI.dsTran([{ deck: G.roster.map(r => r.id).filter(id => typeof SKILLS === 'undefined' || SKILLS[id]), mv: { id: UI.mv || 'hero' } }]); } catch (e) { return; }
    const urls = [...new Set(ds.map(t => this.tuyetDoi(anhUrl(t))))].filter(u => !this.daXL.has(u) && !this.hua.has(u));
    this.thoCon = urls.length;
    let i = 0;
    const luong = async () => {
      while (i < urls.length) {
        while (this.cho || this.doi || this.dangDanh() || performance.now() - TAI_CUON < 450) await this.ngu(300);
        const u = urls[i++];
        try { const r = await fetch(u); if (r.ok) await r.arrayBuffer(); } catch (e) { }
        this.thoCon--;
      }
    };
    await Promise.all([luong(), luong()]);
  },
  // lần trước đã tải đủ mọi tệp của ĐÚNG bản này vào bộ đệm Service Worker? (cờ đặt ở swGiu)
  verTrang() { const m = document.querySelector('meta[name="tm-ver"]'); return m ? m.getAttribute('content') : ''; },
  daDu() { try { const v = this.verTrang(); return !!(v && navigator.serviceWorker && navigator.serviceWorker.controller && localStorage.getItem('tm-du') === v); } catch (e) { return false; } },
  // Service Worker (sw.js): giữ trong bộ đệm đúng bản hiện hành của từng tệp (?v=băm) — xoá các bản cũ cùng đường dẫn
  swGiu() {
    if (!this.nenXong) { setTimeout(() => this.swGiu(), 5000); return; } // (trận hướng dẫn lần đầu) đợi phần menu tải xong
    try {
      const sw = navigator.serviceWorker && navigator.serviceWorker.controller; if (!sw) return;
      const m = {}, ghi = (u) => { try { const x = new URL(u, location.href); const v = x.searchParams.get('v'); if (v) m[x.pathname] = v; } catch (e) { } };
      for (const e of document.querySelectorAll('script[src], link[href]')) ghi(e.getAttribute('src') || e.getAttribute('href'));
      if (typeof ANH_V !== 'undefined') for (const t in ANH_V) { ghi('assets/' + t + '.png?v=' + ANH_V[t]); if (typeof ANH_W !== 'undefined' && ANH_W[t]) ghi('assets/' + t + '.webp?v=' + ANH_W[t]); }
      // tệp tải TRƯỚC khi Service Worker nhận trang (lần mở đầu): đưa vào bộ đệm từ bộ đệm HTTP (không tải lại qua mạng)
      const da = performance.getEntriesByType('resource').map(e => e.name).filter(u => u.indexOf(location.origin) === 0 && /[?&]v=[0-9a-f]{8}/.test(u));
      sw.postMessage({ tmGiu: m, tmThem: da });
      if (!this.nhanh) { const v = this.verTrang(); if (v) localStorage.setItem('tm-du', v); }
    } catch (e) { }
  },
  // REN.taiAnh gọi trước khi HOME hiện (ảnh canvas của trận: CO_DINH, hiệu ứng ghép, HUD…) → xếp hàng, gán src sau màn tải
  _hoan: [],
  hoan(a, u, ten) { if (this.daBoot || this.xem || this.cho || this._hetHoan) return false; this._hoan.push([a, u, ten]); return true; },
  // việc nạp ảnh của các tệp js lúc khởi động (KHUNG.tai, HUD2.tai…) → chạy sau màn tải
  _sau: [],
  sauHome(fn) { if (this.daBoot || this.xem || this.cho || this._hetHoan) fn(); else this._sau.push(fn); },
  thaHoan() { this._hetHoan = true; const sau = this._sau; this._sau = []; for (const f of sau) { try { f(); } catch (e) { console.error('[TAI] sauHome', e); } } const ds = this._hoan; this._hoan = []; for (const [a, u, ten] of ds) if (!a.src && (!ten || REN.anh[ten] === a)) a.src = u; },
  // ảnh thẻ dựng lúc khởi động (cardArt → data-tm-src) → gán src thật (ảnh đã giải mã trong màn tải → hiện ngay)
  ganSrc(vung) { document.querySelectorAll(vung ? vung.split(',').map(v => v.trim() + ' img[data-tm-src]').join(',') : 'img[data-tm-src]').forEach(im => { im.setAttribute('src', im.getAttribute('data-tm-src')); im.removeAttribute('data-tm-src'); }); },
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
    const phien = ++this._phien;
    // ảnh tĩnh của HUD trận (index.html data-tm-src) → gán src (đã giải mã trong màn tải đầu → hiện ngay)
    this.thaHoan(); this.ganSrc('#top, #duoi, #canh-bao, #cutin, #tt, #ketqua, #dung, #bang-wave, #tb-doi');
    const d = this.ds(); for (const t of ds) d.anh(t); d.anh('fx_vong_lv');
    // SAU MÀN TẢI ĐẦU: KHÔNG BAO GIỜ che màn nữa. Ảnh của trận gần như luôn sẵn (đã giải mã lúc khởi động / còn trong bộ đệm);
    // ảnh nào chưa sẵn (đổi sang ụ khác, bàn máy) → giải mã từ bộ đệm; trận hiện NGAY, mô phỏng đứng yên tối đa 1,2 s (TAI.doi,
    // bàn vẫn vẽ) để ảnh kịp vào, quá hạn thì chạy luôn — ảnh lẻ còn thiếu hiện dần (REN.img tự tải).
    if (this.daBoot && !this.xem) {
      this.cho = false;
      const tatT = d.ket(), laTrum = (it) => /\/(fx_)?trum_/.test(it.url);
      const thieu = tatT.filter(it => !laTrum(it) && !this.sanSang(it));
      const trumCon = tatT.filter(it => laTrum(it) && !this.sanSang(it)); // trùm (wave 10+): giải mã nền, không bắt đợi
      if (trumCon.length) this.nap(trumCon, null, 2).catch(() => { }); // không nghỉ khi đang đánh: trùm cần TRONG trận
      this.tranThieu = thieu.length;
      if (!thieu.length) { this.doi = false; return; }
      this.doi = true;
      const p = this.nap(thieu, null, 8).catch((e) => { if (e !== TAI_MAT) console.warn('[TAI] tran', e); });
      Promise.race([p, this.ngu(1200)]).then(() => { if (phien === this._phien) this.doi = false; });
      return;
    }
    // TRƯỚC khi màn tải đầu xong (?mode=, trận hướng dẫn lần đầu, khung xem trước Test range): đây CHÍNH là màn tải đầu
    this.cho = true;
    this.hien('LOADING', this.xem ? false : true);
    // ảnh TRÙM (~5 MB): màn tải trận KHÔNG đợi — tải nền 3 luồng ngay khi trận chạy (trùm đầu tiên ở wave 10)
    const sau = this.xem ? [] : ds.filter(t => /^(fx_)?trum_/.test(t));
    let ls = d.ket(); if (sau.length) ls = ls.filter(it => !/\/(fx_)?trum_/.test(it.url));
    // thanh % của trận chỉ dựng SAU khi nạp khởi động xong: dựng sớm (rỗng, chờ bootP) từng chiếm thanh → đứng 20 % suốt lúc ảnh menu đang tải (07/11)
    let dot = null;
    (async () => {
      try {
        await this.bootP; if (phien !== this._phien) return;
        dot = TDO.dot(this.xem ? 0 : Math.max(20, Math.min(TDO.p || 0, 85)), 100, false);
        await this.nap(ls, () => (phien === this._phien ? dot : null), 8);
      }
      catch (e) { if (e === TAI_MAT) return; throw e; }
      if (phien !== this._phien || this.mat) return;
      dot.ket(); this.cho = false; this.an();
      if (sau.length) { const d2 = this.ds(); for (const t of sau) d2.anh(t); try { await this.nap(d2.ket(), null, 3); } catch (e) { if (e !== TAI_MAT) console.warn('[TAI] trum', e); } }
    })();
  },

  // ---------- mất mạng ----------
  // Màn "CONNECTION LOST / BACK ONLINE" CHỈ thuộc về: (1) trận ONLINE (CO-OP / PVP qua phòng, ONS.on) đang đánh,
  // (2) màn tải ĐẦU khi chưa vào được game (thiếu ảnh không chơi được). KHÔNG BAO GIỜ ở menu, trang ụ, Test range (iframe
  // ?preview), SOLO / đấu máy — ở đó mất mạng chỉ làm ảnh lẻ tải chậm, có mạng lại thì tải tiếp (TAI.coMang).
  trongTranOnl() { return !this.xem && typeof ONS !== 'undefined' && ONS.on && typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !G.ketThuc; },
  canChe() { return !this.xem && (!this.daBoot || this.trongTranOnl()); },
  // đợi có mạng lại (sự kiện 'online' hoặc kiểm 3 s/lần) — không chặn gì, chỉ hoãn tải ảnh
  choMang() { return new Promise((ok) => { const xong = () => { removeEventListener('online', xong); clearInterval(t); ok(); }; const t = setInterval(() => { if (navigator.onLine) xong(); }, 3000); addEventListener('online', xong); }); },
  khiOffline() { if (this.canChe()) this.matMang('offline'); },
  coMang() {
    if (this.mat) { this.thu(); return; }
    this.loiLien = 0; try { if (typeof REN !== 'undefined' && REN.thuLaiLoi) REN.thuLaiLoi(); } catch (e) { } // ảnh lẻ lỗi lúc mất mạng → tải lại
  },
  matMang(lyDo) {
    if (this.mat) return;
    if (!this.canChe()) { console.warn('[TAI] offline (no overlay outside online matches):', lyDo); return; }
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
    if (!ok && ++this.loiLien >= 2 && this.canChe()) this.matMang('asset');
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
// SERVICE WORKER (sw.js, chỉ bản xuất bản có meta tm-ver): lần mở sau lấy tệp từ máy. ?nosw=1 → gỡ SW + xoá bộ đệm (gỡ lỗi).
(function () {
  if (!('serviceWorker' in navigator) || TAI.xem) return;
  if (/[?&]nosw=1/.test(location.search)) { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => { }); try { caches.keys().then(ks => ks.forEach(k => /^tm-/.test(k) && caches.delete(k))); } catch (e) { } return; }
  if (!document.querySelector('meta[name="tm-ver"]')) return;
  try { navigator.serviceWorker.register('sw.js', { scope: './' }).catch((e) => console.warn('[SW]', e)); } catch (e) { }
})();
TAI.bootP = new Promise(r => { TAI._bootXong = r; });
TAI.dung();
TAI.hien('LOADING', true); { const w = document.getElementById('wrap'); if (w) w.classList.remove('dang-tai'); document.documentElement.classList.remove('dang-tai'); } // che ngay từ đầu (khung xem trước: thanh nhỏ, đợi ảnh của ụ)
// (bỏ) cổng bấm "đợi đợt nền": sau màn tải đầu không còn màn tải nào; màn mở sớm (trận hướng dẫn lần đầu) → gán ảnh ngay, hiện dần
addEventListener('click', (e) => { if (TAI.daBoot && !TAI.nenXong && !TAI.xem) TAI.ganSrc(); }, true);
// mất / có mạng: KHÔNG che màn ở menu / SOLO / Test range (TAI.canChe) — chỉ màn tải đầu + trận online
addEventListener('offline', () => TAI.khiOffline());
addEventListener('online', () => TAI.coMang());
// mở game khi đang mất mạng: bản đã lưu trong máy (Service Worker) vẫn chơi được → để bước tải ảnh tự báo nếu thật sự thiếu
