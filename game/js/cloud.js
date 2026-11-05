// LƯU MÂY (Firebase, dự án dùng chung "sontinhthuytinh"; dữ liệu Linh Khí nằm riêng ở linhkhi_users, linhkhi_scores, linhkhi_feedback).
//  - Vào game tự đăng nhập khách (ẩn danh). Máy vẫn lưu localStorage như cũ; có mạng thì đẩy bản lưu lên mây, gộp các lần lưu trong 4 giây.
//  - Mở game: bản trên mây mới hơn thì dùng bản trên mây; nếu bản trên máy có tiến độ cao hơn rõ rệt thì hỏi lại (không mất tiến trình).
//  - Âm thanh (cài đặt riêng của máy) giữ theo máy.
//  - "Đăng nhập Google" ở Anh Mõ nối tài khoản khách vào Google (giữ nguyên tiến trình) để chơi tiếp trên máy khác.
//  - Bảng vàng (xếp hạng) và hòm thư góp ý cũng đi qua đây.
// Không có cấu hình, mở từ tệp trên máy, chạy trong khung xem trước (claude.ai), không có mạng hoặc không tải được thư viện:
// đám mây tự tắt, game chơi bình thường, không báo lỗi.
(function () {
  const G = window.G;
  const FB_VER = '10.12.2';
  // tài khoản xem được "Góp ý nhận được" (chỉ để hiện nút; chốt chặn thật là hàm isAdmin() trong game/firebase/linhkhi.rules)
  const ADMIN_EMAILS = ['ly230595@gmail.com'];
  const COL = { users: 'linhkhi_users', scores: 'linhkhi_scores', feedback: 'linhkhi_feedback' };
  const BOSSES = ['moc', 'ngu', 'ho']; // khoá trùm vùng (G.REGIONS[r].boss)
  if (G.VUNG4) BOSSES.push('thuong'); // vùng 4 (bước 3): b_thuong trên bảng vàng — cần luật Firestore mới (game/firebase/linhkhi.rules)
  G.VERSION = G.VERSION || 'lk-2026.10.09';

  // Vì sao đám mây không chạy ('' = chạy được)
  function whyOff() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey) return 'no-config';
    if (/[?&]cloud=0\b/.test(location.search)) return 'off';
    if (window.LK_CLOUD_TEST) return ''; // bài kiểm tra: Firebase giả có sẵn trong trang
    if (!/^https?:$/.test(location.protocol)) return 'file';
    if (location.origin === 'null') return 'frame';
    try { if (window.top !== window.self) void window.top.location.href; } catch (e) { return 'frame'; } // khung khác nguồn (xem trước)
    if (navigator.onLine === false) return 'offline';
    return '';
  }

  // Chữ hiển thị theo ngôn ngữ (js/ngon_ngu.js); không có G.t (bài kiểm tra chạy riêng tệp này) thì chỉ điền {0}… vào chuỗi gốc.
  function tr(s) { const a = arguments; return G.t ? G.t.apply(G, a) : String(s).replace(/\{(\d)\}/g, (m, i) => a[+i + 1]); }

  // ---------- đo tiến độ một bản lưu (để so khi hai bản lệch nhau) ----------
  function starSum(s) { let n = 0; for (const m of [s.stars || {}, s.stars2 || {}]) for (const k in m) n += Math.max(0, Math.min(3, m[k] | 0)); return n; }
  function far(s) { let f = 0; for (const k in s.stars || {}) { const [r, i] = k.split('-').map(Number); if (r >= 0 && i >= 0) f = Math.max(f, r * 5 + i + 1); } return f; }
  function farText(f) { if (!f) return tr('chưa qua ải nào'); const r = Math.floor((f - 1) / 5), i = (f - 1) % 5; return tr('{0} {1}', G.REGIONS[r] ? G.REGIONS[r].name : tr('Vùng {0}', r + 1), i + 1); }
  function maxLvl(s) { let l = 1; for (const k in s.heroes || {}) l = Math.max(l, (s.heroes[k] && s.heroes[k].lvl) || 1); return l; }
  function progress(s) {
    if (!s) return 0;
    let lv = 0; for (const k in s.heroes || {}) if (s.heroes[k] && s.heroes[k].unlocked) lv += s.heroes[k].lvl || 1;
    return starSum(s) * 3 + far(s) * 5 + lv + Math.min(30, (s.weapons || []).length);
  }
  function summary(s) { return { stars: starSum(s), far: far(s), farText: farText(far(s)), lvl: maxLvl(s), weapons: (s.weapons || []).length, gold: s.gold || 0 }; }

  // phần "nội dung" của bản lưu: bỏ mốc thời gian, chủ bản lưu và cài đặt riêng của máy
  // V2: hỏi khi bản trên máy MỚI HƠN theo giờ nhưng bản trên mây có nhiều tiến độ hơn rõ rệt.
  // Dùng lại hộp hỏi có sẵn (G.cloudUI.conflict, vốn viết cho chiều ngược lại) và chỉ sửa lời cho đúng chiều này.
  // Đóng hộp bằng ✕/Esc thì giữ bản nhiều tiến độ hơn = bản trên mây (hộp gốc trả 'local' khi đóng).
  async function askCloudRicher(local, cloud, at) {
    let choseLocal = false, watched = false;
    const pr = G.cloudUI.conflict(summary(local), summary(cloud), at);
    try {
      const box = document.getElementById('lk-conflict');
      if (box) {
        const msg = box.querySelector('.lk-body > div');
        if (msg) msg.textContent = tr('Bản lưu trên máy này mới hơn, nhưng bản trên mây có nhiều tiến độ hơn. Bạn muốn giữ bản nào? Bản không chọn sẽ bị thay.');
        const sub = box.querySelector('.lk-card .lk-sub');
        if (sub) sub.textContent = tr('lưu sau, ít tiến độ hơn');
        const b = box.querySelector('[data-act="cf-local"]');
        if (b) { watched = true; b.addEventListener('click', () => { choseLocal = true; }, true); }
      }
    } catch (e) { /* hộp hỏi khác cấu trúc: vẫn hỏi bình thường */ }
    const use = await pr;
    return use === 'local' && watched && !choseLocal ? 'cloud' : use; // chỉ nghi ngờ khi đã gắn được theo dõi nút
  }

  // F2 (bảo vệ bản lưu): siêu dữ liệu mới (revision, updatedAt…, js/luu_an_toan.js) không tính là "nội dung" (không tự đẩy mây chỉ vì đóng dấu)
  const META = ['savedAt', 'owner', 'sound', 'revision', 'updatedAt', 'gameBuild', 'schemaVersion', 'tgChoi', '_saoLuuMay'];
  // Đường lưu mới (js/luu_an_toan.js); ?luucu=1 → G.luuAT.bat = false → mọi hàm dưới đây chạy nhánh cũ y như trước
  const MOI = () => !!(G.luuAT && G.luuAT.bat);
  const SAO_MAY = 3, SAO_CACH = 15 * 60 * 1000, TRAN = 380000; // giữ 3 bản sao mây, cách nhau ≥ 15 phút; cả tài liệu < 400000 ký tự (luật Firestore)
  const numv = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  // Dấu của tài liệu mây (so-sánh-rồi-ghi): nội dung chuỗi bản lưu + updatedAt. Bản web cũ ghi đè cũng làm dấu đổi.
  function tokenOf(d) { return d && typeof d.save === 'string' && d.save ? G.luuAT.hash(d.save) + ':' + numv(d.updatedAt, 0) : 'trong'; }
  // Đọc tài liệu mây → { trong, hong, moi, s (đã nâng cấp, chưa G.fixSave), raw, token, sao (bản sao mây), at }
  function docMay(d) {
    const LA = G.luuAT, token = tokenOf(d);
    if (!d || typeof d.save !== 'string' || !d.save) return { trong: true, token, sao: [] };
    let s;
    try { s = JSON.parse(d.save); } catch (e) { return { hong: true, raw: d.save, token, sao: [] }; }
    if (!LA.hopLe(s).ok) return { hong: true, raw: d.save, token, sao: [] };
    const sao = Array.isArray(s._saoLuuMay) ? s._saoLuuMay.filter((x) => x && typeof x.s === 'string') : [];
    delete s._saoLuuMay;
    const m = LA.nangCap(s);
    if (m.moi) return { moi: true, raw: d.save, token, sao };
    if (m.loi) return { hong: true, raw: d.save, token, sao };
    return { s: m.s, raw: d.save, token, sao, at: numv(d.updatedAt, 0) };
  }
  // Danh sách cho màn Khôi phục: bản mây chính + các bản sao mây
  function dsMay(may) {
    const LA = G.luuAT, out = [];
    if (may.s) out.push({ nguon: 'may', s: JSON.parse(JSON.stringify(may.s)), raw: may.raw, nhan: ['Mây: bản chính'], tt: LA.tomTat(may.s, may.at) });
    may.sao.forEach((x, i) => {
      try {
        const o = JSON.parse(x.s);
        if (!LA.hopLe(o).ok) return;
        delete o._saoLuuMay;
        out.push({ nguon: 'may', s: o, raw: x.s, nhan: ['Mây: bản sao {0}', i + 1], tt: LA.tomTat(o, x.at) });
      } catch (e) { /* bản sao hỏng: bỏ */ }
    });
    return out;
  }
  // Tài liệu sẽ ghi: revision > revision trên mây; bản đang có trên mây (nếu khác dòng / cũ hơn 15 phút / ep) thành bản sao mây
  function taoPayload(o, cur, ep) {
    const LA = G.luuAT;
    let curS = null;
    try { curS = cur && typeof cur.save === 'string' ? JSON.parse(cur.save) : null; } catch (e) { curS = null; }
    if (curS && (typeof curS !== 'object' || Array.isArray(curS))) curS = null;
    const curRev = curS ? LA.rev(curS) : 0;
    const ob = Object.assign({}, o);
    delete ob._saoLuuMay;
    ob.revision = Math.max(LA.rev(o), curRev + 1);
    let sao = curS && Array.isArray(curS._saoLuuMay) ? curS._saoLuuMay.filter((x) => x && typeof x.s === 'string') : [];
    if (curS) {
      const truoc = Object.assign({}, curS); delete truoc._saoLuuMay;
      const dau = sao[0], khacDong = truoc.saveId && o.saveId && truoc.saveId !== o.saveId;
      if (ep || khacDong || !dau || numv(cur.updatedAt, 0) - numv(dau.at, 0) > SAO_CACH) sao.unshift({ rev: curRev, at: numv(cur.updatedAt, 0), prog: numv(cur.prog, 0), s: JSON.stringify(truoc) });
    } else if (cur && typeof cur.save === 'string' && cur.save) sao.unshift({ rev: 0, at: numv(cur.updatedAt, 0), prog: 0, s: cur.save.slice(0, 150000), hong: 1 }); // bản mây hỏng: giữ lại
    sao = sao.slice(0, SAO_MAY);
    const chuoi = () => JSON.stringify(sao.length ? Object.assign({}, ob, { _saoLuuMay: sao }) : ob);
    let str = chuoi();
    while (str.length > TRAN && sao.length) { sao.pop(); str = chuoi(); }
    if (str.length >= 400000) { const e = new Error('Bản lưu quá lớn để lưu mây'); e.code = 'lk-qua-lon'; throw e; }
    return { save: str, updatedAt: numv(o.savedAt, Date.now()), prog: progress(o), v: 1, ver: String(G.VERSION).slice(0, 20) };
  }
  function body(s) { const o = Object.assign({}, s); for (const k of META) delete o[k]; return JSON.stringify(o); }
  let lastBody = null;

  const C = (G.cloud = {
    COL, BOSSES, ADMIN_EMAILS, progress, summary, starSum, far, farText,
    why: whyOff(), enabled: false, status: 'off', ready: false, user: null, lastSync: 0, error: '',
    dirty: false, _timer: null, _changeSeq: 0, myScore: null, adminNew: null, pendingApply: null,
    _load(src) { return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }); },

    // Dòng trạng thái hiện ở Anh Mõ
    label() {
      if (MOI() && this.online()) {
        if (G.luuAT.khoa === 'phucHoi') return tr('Đang chờ chọn bản lưu để khôi phục');
        if (this.choChon) return tr('Đang chờ chọn bản lưu (mây hay máy này)');
        if (this.chanGhi) return tr('Bản trên mây do game mới hơn tạo: chưa lưu lên mây');
        if (this.tamDung) return tr('Đã tạm dừng lưu mây trong lần chơi này');
      }
      if (this.why === 'frame') return 'Bản xem trước: không kết nối được mây, chỉ lưu trên máy';
      if (this.why === 'file') return 'Mở từ tệp trên máy: chỉ lưu trên máy';
      if (this.why === 'no-config' || this.why === 'off') return 'Chưa bật lưu mây: chỉ lưu trên máy';
      if (this.why === 'offline' || this.status === 'error') return 'Đang ngoại tuyến: vẫn lưu trên máy, có mạng sẽ lưu lên mây';
      if (this.status === 'loading' || !this.user) return 'Đang kết nối mây…';
      if (this.dirty || this.status === 'saving') return 'Đang lưu lên mây…';
      if (this.lastSync) { const d = new Date(this.lastSync); return tr('Đã lưu lên mây lúc {0}', String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); }
      return 'Đã kết nối mây';
    },
    online() { return !!(this.ready && this.user && this.db); },
    who() {
      const u = this.user;
      if (!u) return '';
      if (u.isAnonymous) return 'Khách';
      return this.gName() || u.email || 'Tài khoản Google';
    },
    gName() {
      const u = this.user;
      if (!u || u.isAnonymous) return '';
      const p = (u.providerData || []).find((x) => x && x.displayName);
      return u.displayName || (p && p.displayName) || '';
    },
    isGuest() { return !this.user || !!this.user.isAnonymous; },

    async init() {
      this.why = whyOff();
      if (this.why) { this.status = 'off'; if (this.why === 'offline') addEventListener('online', () => this.init(), { once: true }); return; }
      if (this.enabled) return;
      this.enabled = true; this.status = 'loading';
      try {
        if (!window.firebase) {
          const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
          await this._load(base + 'firebase-app-compat.js');
          await Promise.all([this._load(base + 'firebase-auth-compat.js'), this._load(base + 'firebase-firestore-compat.js')]);
        }
        const fb = window.firebase;
        const app = (fb.apps && fb.apps.find((a) => a.name === 'linhkhi')) || fb.initializeApp(window.FIREBASE_CONFIG, 'linhkhi');
        this.auth = app.auth(); this.db = app.firestore();
        if (this.auth.setPersistence && fb.auth.Auth) await this.auth.setPersistence(fb.auth.Auth.Persistence.LOCAL).catch(() => {});
        this.auth.onAuthStateChanged((u) => this._onUser(u));
        // quay về từ trang đăng nhập Google (redirect): báo kết quả; tài khoản Google đã có dữ liệu thì chuyển sang nó
        let back = false; try { back = localStorage.getItem('lk_gredir') === '1'; localStorage.removeItem('lk_gredir'); } catch (e) { /* bỏ qua */ }
        if (back) this.auth.getRedirectResult().then((r) => {
          if (r && r.user) { this.gMsg = 'Đã đăng nhập Google.'; this._authMoiOk(); this.myScore = null; setTimeout(() => this.push(true), 1500); return; }
          this.gMsg = 'Google chưa trả kết quả đăng nhập về [no-redirect-result]';
          this._authLui(null);
        }, (e) => {
          if (e && e.code === 'auth/credential-already-in-use' && e.credential) {
            this._authMoiOk(); this._giuKhach();
            this.auth.signInWithCredential(e.credential).then(() => { this.gMsg = 'Đã đăng nhập Google.'; }, (e2) => { this.gMsg = 'Chưa đăng nhập được: ' + this._err(e2); });
            return;
          }
          this.gMsg = 'Chưa đăng nhập được: ' + this._err(e);
          this._authLui(e);
        });
      } catch (e) {
        // không tải được thư viện (mất mạng, bị chặn): tắt mây, game chạy như cũ
        this.enabled = false; this.why = 'offline'; this.status = 'off';
        addEventListener('online', () => this.init(), { once: true });
      }
    },
    async _onUser(u) {
      if (!u) {
        this.user = null; this.ready = false;
        try { await this.auth.signInAnonymously(); } catch (e) { this._fail(e); }
        return;
      }
      this.user = u; this.ready = true; this.status = 'ok'; this.myScore = null; this.adminNew = null;
      this.daDongBo = false; this.mayToken = undefined; this.choChon = false; this.tamDung = false; this.chanGhi = '';
      await this.pull();
      this.flushFeedback && this.flushFeedback();
      if (G.bangVang) G.bangVang.sync();
      if (this.isAdmin()) this.countNew();
    },
    _fail(e) { this.status = 'error'; this.error = (e && (e.code || e.message)) || 'lỗi'; },
    // PWA bỏ thanh URL (15/10): đăng nhập kiểu mới (authDomain = tên miền game, js/firebase-config.js) đã chạy được trên máy này → không bao giờ tự quay lui.
    _authMoiOk() { try { if (window.LK_AUTH && window.LK_AUTH.moi) localStorage.setItem('lk_authmoi_ok', '1'); } catch (e) { /* bỏ qua */ } },
    // Lần chuyển trang đăng nhập kiểu mới không trả kết quả (Google báo lỗi redirect_uri_mismatch, tên miền chưa được phép, bấm quay lại…) và máy này
    // chưa từng đăng nhập kiểu mới thành công → nhớ lk_authcu để lần mở sau dùng lại cách cũ (authDomain cũ + cửa sổ phụ), như trước bản sửa này.
    // Mất mạng thì không quay lui.
    _authLui(e) {
      try {
        if (!(window.LK_AUTH && window.LK_AUTH.moi)) return;
        if (e && e.code === 'auth/network-request-failed') return;
        if (localStorage.getItem('lk_authmoi_ok') === '1') return;
        localStorage.setItem('lk_authcu', '1');
        this.gMsg = 'Chưa đăng nhập được: Google chưa nhận cách đăng nhập mới, game đã chuyển về cách cũ. Tắt hẳn game, mở lại rồi bấm "Đăng nhập Google" lần nữa. [authcu]';
      } catch (er) { /* bỏ qua */ }
    },
    // Quay về từ trang Google mà tài khoản Google đó đã có tiến trình: cất bản lưu khách trên máy (giống guestKeep ở js/village.js) trước khi chuyển tài khoản.
    _giuKhach() {
      try {
        const s = G.save;
        if (!s || !Object.keys(s.stars || {}).length) return;
        const snap = JSON.stringify(s), ls = window.localStorage, K = 'linhkhi_save_v1_khach', old = ls.getItem(K);
        ls.setItem(old === null || old === snap ? K : K + '2', snap);
      } catch (e) { /* bộ nhớ đầy: bỏ qua */ }
    },
    _doc() { return this.db.collection(COL.users).doc(this.user.uid); },

    // ---------- bản lưu ----------
    async pull() {
      if (MOI()) return this.pullMoi();
      if (!this.online()) return;
      const uid = this.user.uid;
      try {
        const snap = await this._doc().get();
        const local = G.save;
        const other = !!(local.owner && local.owner !== uid); // bản trên máy của tài khoản khác (đổi tài khoản trên cùng máy)
        const d = snap.exists ? snap.data() : null;
        let cs = null;
        try { cs = d && d.save ? JSON.parse(d.save) : null; } catch (e) { cs = null; }
        if (cs) {
          const chuaLuyen = cs.luyenChuyen !== 1; // 16/10 Luyện vũ khí (js/luyen.js): bản trên mây chưa chuyển → G.fixSave chuyển một lần
          const cloud = G.fixSave(cs);
          const cloudNewer = (d.updatedAt || 0) > (local.savedAt || 0);
          if (other || cloudNewer) {
            const lp = progress(local), cp = progress(cloud);
            let use = 'cloud';
            // bản trên máy tiến xa hơn rõ rệt: hỏi lại, mặc định giữ bản nhiều tiến độ hơn
            // Đợt 1 (quyết định B): bản trên máy thuộc tài khoản khác (khách vừa liên kết/đổi sang Google đã có tiến trình)
            // và đã qua ít nhất 1 ải → LUÔN hỏi chọn bản, không tự lấy bản mây dù chênh lệch nhỏ. Bản trắng (chưa qua ải) thì không hỏi.
            const hoiKhach = other && far(local) >= 1;
            if ((lp >= cp + 8 || hoiKhach) && G.cloudUI && G.cloudUI.conflict) use = await G.cloudUI.conflict(summary(local), summary(cloud), d.updatedAt || 0);
            if (use === 'cloud') {
              this.apply(cloud, d.updatedAt || Date.now()); this.lastSync = Date.now();
              // bản trên mây vừa được chuyển sang Luyện: đẩy bản đã chuyển lên ngay (máy khác nạp không phải chuyển lại; cùng mốc giờ, không đổi nội dung chơi)
              if (chuaLuyen && G.save === cloud && cloud.luyenChuyen === 1) await this.push(true);
              return;
            }
          } else if ((d.updatedAt || 0) === (local.savedAt || 0)) { this.lastSync = d.updatedAt || Date.now(); this._own(); return; }
          else if (progress(cloud) >= progress(local) + 8 && G.cloudUI && G.cloudUI.conflict) {
            // V2: bản trên máy mới hơn theo giờ (giờ mỗi máy một khác) nhưng bản trên mây đi xa hơn rõ rệt → hỏi, không ghi đè mây ngay
            const use = await askCloudRicher(local, cloud, d.updatedAt || 0);
            if (use === 'cloud') { this.apply(cloud, d.updatedAt || Date.now()); this.lastSync = Date.now(); return; }
          }
        }
        this._own();
        await this.push(true);
      } catch (e) { this._fail(e); }
    },
    _own() { if (G.save.owner !== this.user.uid) { G.save.owner = this.user.uid; basePersist(); } },
    // ---------- bản lưu, đường mới (F2): đọc trước, quyết định theo bảng mục 4.4, ghi bằng transaction so-sánh-rồi-ghi ----------
    pullMoi() {
      if (!this.online()) return Promise.resolve();
      if (this._pulling) return this._pulling;
      this._pulling = this._pullMoi().catch((e) => this._fail(e)).then(() => { this._pulling = null; });
      return this._pulling;
    },
    async _pullMoi() {
      const LA = G.luuAT, uid = this.user.uid;
      const snap = await this._doc().get();
      if (!this.user || this.user.uid !== uid) return;
      const d = snap.exists ? snap.data() : null;
      const may = docMay(d);
      this.mayToken = may.token; this.mayRaw = may.raw || null;
      LA.mayUngVien = dsMay(may); LA.mayDaXem = true;
      if (LA.khoa === 'phucHoi') return; // máy đang chờ người chơi chọn bản khôi phục: chưa đụng gì (màn Khôi phục đã có thêm bản mây)
      let cloud = null;
      if (may.s) { const r = LA.thuNap(may.s); if (r && !r.moi) cloud = r.s; else may.hong = true; }
      const local = G.save;
      const qd = LA.quyetDinh({ local, mayS: cloud, mayTrong: !!may.trong, mayHong: !!may.hong, mayMoi: !!may.moi, mayToken: may.token, dongBo: LA.docDongBo(uid) });
      this.qdCuoi = qd;
      if (qd === 'chan-moi') {
        this.chanGhi = 'moi';
        LA.moMan({ loai: 'tb', tieuDe: 'Cần cập nhật game', chu: 'Bản lưu này do phiên bản Talesworn mới hơn tạo ra. Hãy tải lại trang để cập nhật. Game sẽ không ghi đè bản lưu này.', nut: [['Tải lại', () => { try { location.reload(); } catch (e) { /* bỏ qua */ } }], ['Đóng', null]] });
        return;
      }
      if (qd === 'hoi') {
        this.choChon = true;
        LA.cat(LA.K.xdMay, JSON.stringify(local)); LA.cat(LA.K.xdMayC, may.raw); // sao lưu cả hai trước khi chọn
        const at = numv(d && d.updatedAt, 0);
        LA.moMan({ loai: 'xd', may: LA.tomTat(cloud, at), thietBi: LA.tomTat(local), xong: (lua) => this._xongXd(lua, cloud, at, may.token, uid) });
        return;
      }
      this.daDongBo = true;
      if (qd === 'tai') {
        LA.cat(LA.K.xdMay, JSON.stringify(local)); // giữ bản máy trước khi thay
        this.apply(cloud, numv(d && d.updatedAt, 0) || Date.now(), may.token);
        this.lastSync = Date.now(); this.dirty = false;
        return;
      }
      this._own();
      if (qd === 'giong') { LA.ghiDongBo(uid, { token: may.token, hash: LA.hashND(local) }); this.lastSync = Date.now(); this.dirty = false; return; }
      if (qd === 'may-hong') LA.cat(LA.K.mayHong, may.raw);
      // 'day' / 'may-hong': đẩy bản máy (không ghi ngay lúc vừa đăng nhập: gộp 4 giây, và transaction kiểm lại mây chưa đổi)
      // 'cho-ghi-dau': mây trống → chờ lần lưu thật đầu tiên (G.persist → queue) mới đưa lên
      if (qd !== 'cho-ghi-dau' || this.dirty) { this.dirty = true; this.queue(); }
    },
    _xongXd(lua, cloud, at, token, uid) {
      this.choChon = false;
      if (!this.user || this.user.uid !== uid) return;
      if (lua === 'may') { this.daDongBo = true; this.apply(cloud, at || Date.now(), token); this.lastSync = Date.now(); this.dirty = false; return; }
      if (lua === 'thietBi') { this.daDongBo = true; this._own(); this._epSaoLuu = true; this.dirty = true; this.push(true); return; }
      this.tamDung = true; // Huỷ: không đồng bộ trong lần chơi này (máy vẫn lưu bình thường); mở lại game sẽ hỏi lại
    },
    // Người chơi vừa chọn ở màn Khôi phục. Chọn đúng bản mây chính đang có → coi như đã đồng bộ với bản đó (không hỏi lại).
    sauKhoiPhuc(u) {
      if (this.online() && u && u.nguon === 'may' && u.raw && u.raw === this.mayRaw) G.luuAT.ghiDongBo(this.user.uid, { token: this.mayToken, hash: G.luuAT.hashND(G.save) });
      this.daDongBo = false; this.dirty = true;
      if (this.online()) this.pullMoi();
    },
    async pushMoi() {
      clearTimeout(this._timer);
      if (!this.online()) { this.dirty = true; return; }
      const LA = G.luuAT;
      if (LA.khoa || this.chanGhi || this.choChon || this.tamDung || this.pendingApply) { this.dirty = true; return; }
      if (!this.daDongBo) { this.dirty = true; return this.pullMoi(); } // chưa đọc mây lần nào (hoặc vừa xung đột): đọc trước
      const uid = this.user.uid, s = G.save;
      s.owner = uid;
      if (!s.savedAt) s.savedAt = Date.now();
      const seq = this._changeSeq, ep = !!this._epSaoLuu, mong = this.mayToken;
      const o = JSON.parse(JSON.stringify(s)); delete o._saoLuuMay;
      const hash = LA.hashND(o);
      this.status = 'saving';
      let payload;
      try {
        const ref = this._doc();
        payload = await this.db.runTransaction(async (tx) => {
          const sn = await tx.get(ref);
          const cur = sn.exists ? sn.data() : null;
          if (tokenOf(cur) !== mong) { const e = new Error('Bản trên mây vừa đổi'); e.code = 'lk-xung-dot'; throw e; }
          const p = taoPayload(o, cur, ep);
          tx.set(ref, p);
          return p;
        });
      } catch (e) {
        if (e && e.code === 'lk-xung-dot') { this.status = 'ok'; this.daDongBo = false; this.dirty = true; return this.pullMoi(); }
        this._fail(e); this.dirty = true;
        clearTimeout(this._timer);
        this._retry = Math.min(60000, (this._retry || 2500) * 2);
        this._timer = setTimeout(() => { if (this.dirty && this.online()) this.push(true); }, this._retry);
        return;
      }
      if (!this.user || this.user.uid !== uid) return;
      this._epSaoLuu = false;
      this.mayToken = tokenOf(payload);
      LA.ghiDongBo(uid, { token: this.mayToken, hash });
      try { const rv = LA.rev(JSON.parse(payload.save)); if (G.save === s && rv > LA.rev(s)) s.revision = rv; } catch (e) { /* bỏ qua */ }
      this.lastSync = Date.now(); this.status = 'ok'; this._retry = 0;
      if (seq === this._changeSeq) this.dirty = false;
      else { this.dirty = true; this.queue(); }
    },
    // dùng bản trên mây; đang trong ải thì chờ về làng mới thay (không làm rối trận đang đánh)
    apply(s, at, token) {
      if (G.scene === G.StageScene) { this.pendingApply = { s, at, token }; return; }
      if (MOI() && s) delete s._saoLuuMay;
      const snd = G.save ? G.save.sound : true, net = G.save ? G.save.net : undefined;
      s.sound = snd; if (net) s.net = net; else delete s.net; // âm thanh, độ nét: giữ theo máy
      if (G.LANG === 'en') s.lang = 'en'; else delete s.lang; // ngôn ngữ: giữ theo máy (js/ngon_ngu.js)
      s.owner = this.user ? this.user.uid : s.owner; s.savedAt = at || s.savedAt || Date.now();
      G.save = s; lastBody = body(s); basePersist();
      this.pendingApply = null;
      if (MOI() && token && this.user) G.luuAT.ghiDongBo(this.user.uid, { token, hash: G.luuAT.hashND(s) });
      try { if (G.villageScene && G.villageScene.checkNews) G.villageScene.checkNews(); } catch (e) { /* bỏ qua */ }
      try { if (G.villageScene && G.villageScene.say && G.scene === G.Village) G.villageScene.say('Đã tải tiến trình từ mây.'); } catch (e) { /* bỏ qua */ }
    },
    // đánh dấu cần lưu; gộp các lần lưu liên tiếp trong 4 giây
    queue() {
      this.dirty = true;
      if (!this.online()) return;
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.push(true), 4000);
    },
    async push(now) {
      if (!now) { this.queue(); return; }
      if (MOI()) return this.pushMoi();
      clearTimeout(this._timer);
      if (!this.online()) { this.dirty = true; return; }
      const s = G.save;
      s.owner = this.user.uid;
      if (!s.savedAt) s.savedAt = Date.now();
      // Chụp phiên bản dữ liệu trước khi gửi. Nếu người chơi lưu tiếp trong lúc
      // Firestore đang xử lý, không được xoá cờ dirty của thay đổi mới hơn.
      const seq = this._changeSeq;
      const payload = { save: JSON.stringify(s), updatedAt: s.savedAt, prog: progress(s), v: 1, ver: String(G.VERSION).slice(0, 20) };
      this.status = 'saving';
      try {
        await this._doc().set(payload);
        this.lastSync = Date.now(); this.status = 'ok'; this._retry = 0;
        if (seq === this._changeSeq) this.dirty = false;
        else { this.dirty = true; this.queue(); }
      } catch (e) {
        this._fail(e); this.dirty = true;
        // Lỗi mạng thoáng qua không nên khiến bản lưu mắc kẹt cho tới lần
        // thay đổi tiếp theo của người chơi hoặc một sự kiện 'online'.
        clearTimeout(this._timer);
        // Giãn dần 5s → 10s → 20s … tối đa 60s để lỗi kéo dài (mất quyền, hết hạn mức) không gọi liên tục.
        this._retry = Math.min(60000, (this._retry || 2500) * 2);
        this._timer = setTimeout(() => { if (this.dirty && this.online()) this.push(true); }, this._retry);
      }
    },

    // ---------- đăng nhập Google: nối tài khoản khách hiện tại (giữ tiến trình) ----------
    _err(e) {
      const m = { 'auth/popup-blocked': 'Trình duyệt chặn cửa sổ đăng nhập', 'auth/popup-closed-by-user': 'Đã đóng cửa sổ đăng nhập',
        'auth/cancelled-popup-request': 'Đã đóng cửa sổ đăng nhập', 'auth/network-request-failed': 'Mất mạng, thử lại sau',
        'auth/unauthorized-domain': 'Tên miền này chưa được cho phép trong Firebase', 'auth/operation-not-supported-in-this-environment': 'Chỗ này không đăng nhập được',
        // Đợt 1: thêm lời tiếng Việt cho các lỗi liên kết hay gặp (trước đây hiện nguyên câu tiếng Anh của Firebase)
        'auth/credential-already-in-use': 'Tài khoản Google này đã được dùng cho một tiến trình khác', 'auth/email-already-in-use': 'Tài khoản Google này đã được dùng cho một tiến trình khác',
        'auth/provider-already-linked': 'Tài khoản này đã liên kết Google rồi', 'auth/too-many-requests': 'Thử quá nhiều lần, chờ một lát rồi thử lại',
        'auth/user-cancelled': 'Đã huỷ đăng nhập', 'auth/internal-error': 'Máy chủ đăng nhập báo lỗi, thử lại sau' };
      const code = e && e.code ? String(e.code).replace('auth/', '') : '';
      return ((e && m[e.code]) || (e && e.message) || 'Lỗi') + (code ? ' [' + code + ']' : ''); // kèm mã lỗi để chủ dự án báo lại
    },
    async google() {
      if (!this.online()) throw new Error('Chưa kết nối mây');
      const fb = window.firebase, prov = new fb.auth.GoogleAuthProvider();
      // Mở từ biểu tượng màn hình chính (chế độ ứng dụng) hay khi cửa sổ phụ bị chặn: chuyển trang đăng nhập (redirect) thay cho cửa sổ phụ.
      const app = (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;
      const redirect = () => { try { localStorage.setItem('lk_gredir', '1'); } catch (e) { /* bỏ qua */ } return this.user.isAnonymous ? this.user.linkWithRedirect(prov) : this.auth.signInWithRedirect(prov); };
      // Trước 15/10: luôn dùng cửa sổ phụ (chuyển trang bị mất kết quả vì trang đăng nhập ở tên miền khác). Nay: chế độ ứng dụng trên spiritblade.web.app
      // dùng authDomain = tên miền game (js/firebase-config.js, window.LK_AUTH.moi) → chuyển trang KHÔNG còn mất kết quả và không mở cửa sổ phụ
      // (cửa sổ phụ trong chế độ ứng dụng mở khung trình duyệt có thanh URL; iPhone còn mở sang Safari với bộ nhớ riêng). Còn lại giữ cửa sổ phụ như cũ.
      const moi = !!(window.LK_AUTH && window.LK_AUTH.moi);
      try {
        if (app && moi) { await redirect(); return 'redirect'; }
        if (this.user.isAnonymous) {
          try {
            const r = await this.user.linkWithPopup(prov).catch((e) => { throw e; });
            if (r === null) return 'redirect';
            this.user = (r && r.user) || this.auth.currentUser || this.user;
            if (this.user.reload) await this.user.reload().catch(() => {});
            this.user = this.auth.currentUser || this.user;
            if (this.user.getIdToken) await this.user.getIdToken(true).catch(() => {});
            this.myScore = null;
            await this.push(true);
            if (G.bangVang) G.bangVang.sync(true);
            if (this.isAdmin()) this.countNew();
            return 'linked';
          } catch (e) {
            if (e.code !== 'auth/credential-already-in-use' || !e.credential) throw e;
            // tài khoản Google này đã có dữ liệu: chuyển sang nó (onAuthStateChanged kéo bản lưu về, hỏi lại nếu bản trên máy hơn rõ rệt)
            await this.auth.signInWithCredential(e.credential);
            return 'switched';
          }
        }
        await this.auth.signInWithPopup(prov);
        return 'switched';
      } catch (e) { throw new Error(this._err(e)); }
    },

    // ---------- bảng vàng: linhkhi_scores/{uid}, mỗi người một dòng, chỉ ghi khi tốt hơn ----------
    async getMyScore() {
      if (!this.online()) return null;
      if (this.myScore) return this.myScore;
      try { const s = await this.db.collection(COL.scores).doc(this.user.uid).get(); this.myScore = s.exists ? s.data() : {}; } catch (e) { this.myScore = null; }
      return this.myScore;
    },
    // e: { name, power, stars, far, hero, b: { moc, ngu, ho } } → gộp với dòng cũ, chỉ ghi khi có gì tốt hơn (hoặc đổi tên)
    async submitScore(e) {
      if (!this.online()) return false;
      const old = await this.getMyScore();
      if (old === null) return false;
      const m = { name: e.name, power: Math.max(old.power || 0, Math.floor(e.power || 0)), stars: Math.max(old.stars || 0, e.stars | 0),
        far: Math.max(old.far || 0, e.far | 0), hero: e.hero, g: !this.user.isAnonymous };
      for (const k of BOSSES) {
        const a = old['b_' + k], b = e.b && e.b[k];
        const v = a && b ? Math.min(a, b) : a || b;
        if (v) m['b_' + k] = Math.round(v * 10) / 10;
      }
      const same = ['name', 'power', 'stars', 'far', 'g', 'hero'].every((k) => old[k] === m[k]) && BOSSES.every((k) => old['b_' + k] === m['b_' + k]);
      if (same) return false;
      m.at = Date.now();
      // Vùng 4: luật Firestore cũ (chưa dán bản mới) chỉ nhận far ≤ 15, sao ≤ 90, không có b_thuong → bị từ chối thì ghi bản "vừa luật cũ"
      // (cắt far / sao, bỏ b_thuong) để bảng vàng vẫn chạy; nhớ lại (luatCu) để lần sau ghi thẳng bản đó, khỏi tốn một lần bị từ chối.
      const vuaLuatCu = (x) => {
        const y = Object.assign({}, x); delete y.b_thuong;
        y.far = Math.min(15, y.far | 0); y.stars = Math.min(y.stars | 0, y.far >= 15 ? 90 : y.far * 3);
        for (const k of ['power', 'stars', 'far']) if (typeof old[k] === 'number') y[k] = Math.max(y[k], old[k]);
        return y;
      };
      const vuot = (x) => (x.far | 0) > 15 || (x.stars | 0) > 90 || 'b_thuong' in x;
      const ghi = async (x) => { await this.db.collection(COL.scores).doc(this.user.uid).set(x); this.myScore = x; return true; };
      try {
        if (this.luatCu && vuot(m)) { const y = vuaLuatCu(m); if (['power', 'stars', 'far', 'name', 'g', 'hero'].every((k) => old[k] === y[k]) && BOSSES.every((k) => old['b_' + k] === y['b_' + k])) return false; return await ghi(y); }
        return await ghi(m);
      } catch (er) {
        if (er && er.code === 'permission-denied' && vuot(m)) {
          this.luatCu = true;
          try { return await ghi(vuaLuatCu(m)); } catch (er2) { this._fail(er2); return false; }
        }
        this._fail(er); return false;
      }
    },
    // một trang của bảng; field: power | stars | b_moc | b_ngu | b_ho; after: con trỏ trang trước
    async topScores(field, after, n) {
      if (!this.online()) return null;
      let q = this.db.collection(COL.scores).orderBy(field, field.indexOf('b_') === 0 ? 'asc' : 'desc');
      if (after) q = q.startAfter(after);
      const snap = await q.limit(n || 8).get();
      return { items: snap.docs.map((d) => Object.assign({ uid: d.id }, d.data())), cursor: snap.docs.length ? snap.docs[snap.docs.length - 1] : null, more: snap.docs.length === (n || 8) };
    },

    // ---------- góp ý: người chơi chỉ được tạo; chỉ quản trị đọc / đổi trạng thái / xoá ----------
    async sendFeedback(f) {
      if (!this.online()) throw new Error('offline');
      const doc = { kind: f.kind, text: f.text, contact: f.contact || '', shot: f.shot || '', ver: f.ver, where: f.where,
        scr: f.scr, ua: f.ua, at: f.at, uid: this.user.uid, guest: !!this.user.isAnonymous };
      await this.db.collection(COL.feedback).add(doc);
      return true;
    },
    isAdmin() {
      const u = this.user;
      return !!(u && !u.isAnonymous && u.emailVerified && u.email && ADMIN_EMAILS.includes(String(u.email).toLowerCase()));
    },
    _adminErr(e) {
      if (e && e.code === 'permission-denied') return new Error(this.isAdmin() ? 'Máy chủ chưa có luật mới (xem docs/firebase-linh-khi/HUONG-DAN.md)' : 'Tài khoản này không có quyền xem góp ý');
      return new Error(!this.online() ? 'Chưa kết nối mây' : (e && (e.code || e.message)) || 'Lỗi');
    },
    async listFeedback(o) {
      o = o || {};
      if (!this.online()) throw this._adminErr(null);
      const n = o.limit || 20;
      try {
        let q = this.db.collection(COL.feedback).orderBy('at', 'desc');
        if (o.after) q = q.startAfter(o.after);
        const snap = await q.limit(n).get();
        const docs = snap.docs;
        return { items: docs.map((d) => Object.assign({ id: d.id }, d.data())), cursor: docs.length ? docs[docs.length - 1] : null, more: docs.length === n };
      } catch (e) { throw this._adminErr(e); }
    },
    async countNew() {
      if (!this.isAdmin()) { this.adminNew = null; return; }
      try { const r = await this.listFeedback({ limit: 50 }); this.adminNew = r.items.filter((x) => !x.status || x.status === 'new').length; } catch (e) { this.adminNew = null; }
    },
    async setFeedbackStatus(id, status, note) {
      if (!this.online()) throw this._adminErr(null);
      const d = { status };
      if (note !== undefined) d.note = String(note).slice(0, 300);
      try { await this.db.collection(COL.feedback).doc(id).update(d); return true; } catch (e) { throw this._adminErr(e); }
    },
    async deleteFeedback(id) {
      if (!this.online()) throw this._adminErr(null);
      try { await this.db.collection(COL.feedback).doc(id).delete(); return true; } catch (e) { throw this._adminErr(e); }
    },
  });

  // ---------- móc vào bản lưu của game ----------
  const basePersist = G.persist, baseLoad = G.loadSave;
  G.persist = function () {
    const s = G.save;
    if (s) {
      const b = body(s);
      if (b !== lastBody) {
        lastBody = b; s.savedAt = Date.now(); C._changeSeq++;
        if (C.enabled) C.queue();
      }
    }
    basePersist();
  };
  G.loadSave = function () {
    baseLoad();
    lastBody = body(G.save);
    setTimeout(() => C.init(), 0);
  };
  // về làng: thay bản lưu đang chờ (tải từ mây lúc còn trong ải)
  if (G.Village) {
    const baseEnter = G.Village.enter;
    G.Village.enter = function () {
      // F2: bản mây chờ thay trong lúc đánh ải → về làng thì ĐỌC LẠI và quyết định lại (máy có thể vừa có kết quả ải mới)
      if (C.pendingApply && MOI()) { C.pendingApply = null; C.daDongBo = false; C.pullMoi(); }
      else if (C.pendingApply) C.apply(C.pendingApply.s, C.pendingApply.at, C.pendingApply.token);
      return baseEnter.apply(this, arguments);
    };
  }
  // có mạng lại: đẩy phần còn chờ
  addEventListener('online', () => { if (C.dirty && C.online()) C.push(true); });
  // rời trang: cố đẩy nốt
  addEventListener('pagehide', () => { if (C.dirty && C.online()) C.push(true); });
})();
