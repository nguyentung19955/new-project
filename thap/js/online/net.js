// TURRET MERGE — lớp mạng (NET) cho tài khoản + CO-OP online. Hai "bộ chuyển":
//   · firebase : Firebase Auth (ẩn danh + Google) + Realtime Database, SDK compat để sẵn trong js/online/vendor (chỉ tải khi cần)
//   · mock     : máy chủ thử nghiệm WebSocket (tools/thap-online-mock-server.js) — CHỈ cho bài kiểm tự động: ?net=mock&mockws=ws://…
// Dự án Firebase: turret-merge (cấu hình: js/online/firebase-config.js). Mọi đường dẫn (path) tính từ gốc  turretmerge/  của database.
'use strict';

const NET = {
  GOC: 'turretmerge/',
  kieu: null,        // 'firebase' | 'mock' | null (chưa bật / lỗi)
  ok: false,         // đã sẵn sàng (SDK + đăng nhập)
  loi: '',           // lỗi gần nhất (chữ ngắn để hiện)
  user: null,        // { uid, anon, name, email, photo }
  noi: false,        // đang kết nối tới máy chủ
  lechGio: 0,        // giờ máy chủ − giờ máy (ms)
  _authCb: [], _noiCb: [], _p: null,

  // khởi động (gọi nhiều lần an toàn). Trả Promise<boolean>
  san() {
    if (this._p) return this._p;
    const q = new URLSearchParams(location.search);
    const mock = q.get('net') === 'mock';
    // ?net=0 = tắt online. Trình duyệt tự động (Playwright/kiểm thử của các phiên khác) không gọi Firebase thật trừ khi ?net=fb.
    if (q.get('net') === '0' || (navigator.webdriver && !mock && q.get('net') !== 'fb')) {
      this.loi = 'disabled'; this._p = Promise.resolve(false); return this._p;
    }
    this._p = (mock ? this._moMock(q.get('mockws') || 'ws://localhost:8787') : this._moFirebase())
      .then(() => { this.ok = true; return true; })
      .catch((e) => { this.loi = (e && (e.code || e.message)) || String(e); console.warn('[NET]', this.loi); this.ok = false; return false; });
    return this._p;
  },
  khiDoiTK(cb) { this._authCb.push(cb); if (this.user) cb(this.user); },
  khiNoi(cb) { this._noiCb.push(cb); cb(this.noi); },
  _baoTK(u) { this.user = u; for (const cb of this._authCb) try { cb(u); } catch (e) { console.error(e); } },
  _baoNoi(v) { this.noi = !!v; for (const cb of this._noiCb) try { cb(this.noi); } catch (e) { console.error(e); } },
  gio() { return Date.now() + this.lechGio; },
  // CHỐNG NÓNG 4G (tuvan/nong/BAO-CAO.md): kết nối Firebase (WebSocket + nhịp giữ kết nối) bật suốt phiên giữ sóng di động thức
  // → đang đánh SOLO / CO-OP / PVP với máy (không phòng online), hoặc app bị ẩn khi không ở phòng → ngắt (goOffline);
  // về menu / mở app lại → nối lại (goOnline). Ghi kết quả trận lúc ngắt được Firebase xếp hàng, nối lại thì gửi.
  ngu(v) {
    if (this.kieu !== 'firebase' || !this._db || !!v === !!this._ngu) return;
    this._ngu = !!v;
    try { if (v) this._db.goOffline(); else this._db.goOnline(); } catch (e) { }
  },
  canNgu() {
    const phong = (typeof ONL !== 'undefined' && ONL.code) || (typeof ONS !== 'undefined' && ONS.on);
    if (phong) return false;
    if (document.hidden) return true;
    return typeof G !== 'undefined' && G.ban && G.ban.length > 0; // trận offline (SOLO/CO-OP/PVP với máy, Test range)
  },
  theoDoiNgu() {
    if (this._tdNgu) return; this._tdNgu = true;
    const kt = () => this.ngu(this.canNgu());
    setInterval(kt, 2000); // chỉ đọc biến trong máy (không dùng mạng)
    document.addEventListener('visibilitychange', kt); addEventListener('pagehide', kt); addEventListener('pageshow', kt);
  },
  TS: { '.sv': 'timestamp' }, // giờ máy chủ (Firebase ServerValue.TIMESTAMP)

  // ---------------------------------------------------------------- FIREBASE
  _taiJS(src) {
    return new Promise((ok, hong) => {
      if (document.querySelector('script[data-tm="' + src + '"]')) return ok();
      const s = document.createElement('script'); s.src = src; s.async = false; s.dataset.tm = src;
      s.onload = () => ok(); s.onerror = () => hong(new Error('Không tải được ' + src)); document.head.appendChild(s);
    });
  },
  _moFirebase() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) return Promise.reject(new Error('Chưa có cấu hình Firebase (js/online/firebase-config.js)'));
    const v = 'js/online/vendor/';
    return this._taiJS(v + 'firebase-app-compat.js')
      .then(() => Promise.all([this._taiJS(v + 'firebase-auth-compat.js'), this._taiJS(v + 'firebase-database-compat.js')]))
      .then(() => {
        const fb = window.firebase;
        const app = fb.apps.find(a => a.name === 'turretmerge') || fb.initializeApp(cfg, 'turretmerge');
        this.kieu = 'firebase'; this._fb = fb; this._auth = app.auth(); this._db = app.database(); this.theoDoiNgu();
        this._db.ref('.info/connected').on('value', s => this._baoNoi(s.val()));
        this._db.ref('.info/serverTimeOffset').on('value', s => { this.lechGio = s.val() || 0; });
        // kết quả đăng nhập kiểu chuyển trang (iPhone ở chế độ ứng dụng / trình duyệt chặn cửa sổ bật lên)
        this._auth.getRedirectResult().catch(e => this._xuLyLoiGoogle(e));
        return new Promise((ok, hong) => {
          let dau = true;
          this._auth.onAuthStateChanged((u) => {
            if (!u) { this._auth.signInAnonymously().catch(e => { if (dau) { dau = false; hong(e); } }); return; } // mặc định: khách ẩn danh
            this._baoTK(this._chuanUser(u));
            if (dau) { dau = false; ok(); }
          });
        });
      });
  },
  _chuanUser(u) {
    const g = (u.providerData || []).find(p => p && p.providerId === 'google.com');
    return { uid: u.uid, anon: !!u.isAnonymous, name: (g && g.displayName) || u.displayName || '', email: (g && g.email) || u.email || '', photo: (g && g.photoURL) || '' };
  },
  laIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); },
  laApp() { const m = (s) => !!(window.matchMedia && matchMedia(s).matches); return navigator.standalone === true || m('(display-mode: standalone)') || m('(display-mode: fullscreen)'); },
  // Đăng nhập Google. Khách ẩn danh → NỐI tài khoản (linkWith…: giữ nguyên uid + hồ sơ). Google đã có tài khoản khác → chuyển sang tài khoản đó.
  // Máy tính: cửa sổ bật lên (popup). iPhone/iPad (Safari, cả khi mở từ màn hình chính): chuyển trang (redirect) — kết quả xử lý ở
  // getRedirectResult() lần mở trang sau. Popup bị chặn trên máy tính → tự chuyển sang redirect.
  dangNhapGoogle() {
    if (this.kieu === 'mock') return this._mockGui('google', {}).then(u => { this._baoTK(u); return u; });
    if (!this._auth) return Promise.reject(new Error('offline'));
    const fb = this._fb, pv = new fb.auth.GoogleAuthProvider(); pv.setCustomParameters({ prompt: 'select_account' });
    const u = this._auth.currentUser, chuyenTrang = this.laIOS() || this.laApp();
    const lam = (kieu) => u && u.isAnonymous
      ? (kieu === 'popup' ? u.linkWithPopup(pv) : u.linkWithRedirect(pv))
      : (kieu === 'popup' ? this._auth.signInWithPopup(pv) : this._auth.signInWithRedirect(pv));
    const p = chuyenTrang ? lam('redirect') : lam('popup').catch((e) => {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return lam('redirect');
      throw e;
    });
    return p.then(() => this._capNhatTK()).catch(e => this._xuLyLoiGoogle(e));
  },
  _xuLyLoiGoogle(e) {
    if (!e) return;
    // tài khoản Google này đã có hồ sơ (đăng nhập ở máy khác) → dùng luôn tài khoản đó
    if ((e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use') && e.credential) {
      return this._auth.signInWithCredential(e.credential).then(() => this._capNhatTK());
    }
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
    this.loi = e.code || e.message;
    throw e;
  },
  _capNhatTK() { const u = this._auth && this._auth.currentUser; if (u) this._baoTK(this._chuanUser(u)); return this.user; },
  dangXuat() {
    if (this.kieu === 'mock') return this._mockGui('signout', {}).then(u => this._baoTK(u));
    return this._auth.signOut(); // onAuthStateChanged tự vào lại bằng khách ẩn danh mới
  },
  _ref(p) { return this._db.ref(this.GOC + p); },

  // ---------------------------------------------------------------- API dùng chung
  get(p) { return this.kieu === 'mock' ? this._mockGui('get', { p }) : this._ref(p).once('value').then(s => s.val()); },
  set(p, v) { return this.kieu === 'mock' ? this._mockGui('set', { p, v }) : this._ref(p).set(v); },
  update(p, v) { return this.kieu === 'mock' ? this._mockGui('update', { p, v }) : this._ref(p).update(v); },
  remove(p) { return this.kieu === 'mock' ? this._mockGui('remove', { p }) : this._ref(p).remove(); },
  // transaction: fn(giá trị hiện tại) → giá trị mới | undefined (= thôi). Trả Promise<{committed}>; bị luật từ chối → reject.
  tx(p, fn) {
    if (this.kieu !== 'mock') return this._ref(p).transaction(fn, undefined, false).then((r) => ({ committed: !!(r && r.committed) }));
    const thu = (lan) => this._mockGui('get', { p }).then((cu) => {
      const moi = fn(cu == null ? null : JSON.parse(JSON.stringify(cu)));
      if (moi === undefined) return { committed: false };
      return this._mockGui('cas', { p, cu: JSON.stringify(cu == null ? null : cu), v: moi }).then((r) => (r && r.lai && lan < 20) ? thu(lan + 1) : { committed: !(r && r.lai) });
    });
    return thu(0);
  },
  // khoá mới theo thứ tự thời gian (giống push key)
  khoa() { return this.kieu === 'mock' ? this._mockKhoa() : this._db.ref().push().key; },
  // nghe: ev = 'value' | 'child_added'; o.sau = khoá → chỉ nhận con có khoá ≥ o.sau. Trả hàm huỷ.
  nghe(p, ev, cb, o) {
    o = o || {};
    if (this.kieu === 'mock') {
      const sid = 's' + (++this._mSid);
      this._mSub[sid] = cb; this._mockGui('sub', { p, ev, sid, sau: o.sau || null }).catch(() => { });
      return () => { delete this._mSub[sid]; this._mockGui('unsub', { sid }).catch(() => { }); }; // mất mạng: máy chủ giả đã quên lượt nghe khi socket đóng
    }
    let q = this._ref(p);
    if (o.sau) q = q.orderByKey().startAt(o.sau);
    const f = ev === 'value' ? (s) => cb(s.val()) : (s) => cb(s.val(), s.key);
    q.on(ev, f, (e) => { this.loi = e.code || e.message; console.warn('[NET] nghe', p, this.loi); });
    return () => q.off(ev, f);
  },
  // khi mất kết nối (đóng tab, mất mạng): máy chủ tự ghi v (null = xoá)
  khiNgat(p, v) { return this.kieu === 'mock' ? this._mockGui('od', { p, v }) : (v === null ? this._ref(p).onDisconnect().remove() : this._ref(p).onDisconnect().set(v)); },
  huyKhiNgat(p) { return this.kieu === 'mock' ? this._mockGui('odx', { p }) : this._ref(p).onDisconnect().cancel(); },

  // ---------------------------------------------------------------- MOCK (chỉ kiểm thử)
  _mSid: 0, _mId: 0, _mCho: {}, _mSub: {}, _mBen: {},
  _mockKhoa() { const t = Date.now().toString(36).padStart(9, '0'); let r = ''; for (let i = 0; i < 6; i++) r += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; return t + (++this._mId).toString(36).padStart(4, '0') + r; },
  _moMock(url) {
    this.kieu = 'mock';
    let uid = null; try { uid = localStorage.getItem('tm_mock_uid'); } catch (e) { }
    if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); try { localStorage.setItem('tm_mock_uid', uid); } catch (e) { } }
    this._mUid = uid;
    return new Promise((ok, hong) => {
      let dau = true;
      const mo = () => {
        const ws = new WebSocket(url); this._ws = ws;
        ws.onopen = () => {
          this._mockGui('hello', { uid }).then((u) => {
            this._baoTK(u); this._baoNoi(true);
            // mở lại mọi lượt nghe + onDisconnect sau khi nối lại (máy chủ quên hết khi socket đóng)
            for (const m of Object.values(this._mBen)) ws.send(JSON.stringify(m));
            if (dau) { dau = false; ok(); }
          });
        };
        ws.onmessage = (e) => {
          const m = JSON.parse(e.data);
          if (m.sid) { const cb = this._mSub[m.sid]; if (cb) cb(m.v === undefined ? null : m.v, m.k); return; }
          const c = this._mCho[m.id]; if (!c) return; delete this._mCho[m.id];
          if (m.err) c[1](Object.assign(new Error(m.err), { code: m.err })); else c[0](m.v === undefined ? null : m.v);
        };
        ws.onclose = () => {
          this._baoNoi(false);
          if (dau) { dau = false; hong(new Error('mock ws closed')); return; }
          setTimeout(mo, this._mNgatMs || 400);
        };
      };
      mo();
    });
  },
  _mockGui(op, d) {
    return new Promise((ok, hong) => {
      const id = ++this._mId; const m = Object.assign({ op, id }, d);
      const ben = op === 'sub' ? 'sub:' + d.sid : op === 'od' ? 'od:' + d.p : null;
      if (op === 'unsub') delete this._mBen['sub:' + d.sid];
      if (op === 'odx') delete this._mBen['od:' + d.p];
      if (ben) { this._mBen[ben] = m; if (!(this._ws && this._ws.readyState === 1)) return ok(null); }
      this._mCho[id] = [ok, hong];
      if (this._ws && this._ws.readyState === 1) this._ws.send(JSON.stringify(m));
      else { delete this._mCho[id]; hong(new Error('offline')); }
    });
  },
  // kiểm thử: giả mất mạng ms mili-giây (đóng socket → máy chủ chạy onDisconnect → tự nối lại)
  _mockNgat(ms) { this._mNgatMs = ms || 400; if (this._ws) this._ws.close(); },
};
