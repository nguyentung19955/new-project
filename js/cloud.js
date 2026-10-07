'use strict';

// ============================================================
//  LƯU ĐÁM MÂY (Firebase): Auth ẩn danh + đăng nhập Google, Firestore users/{uid}
//  - Máy vẫn lưu localStorage như cũ; có mạng thì đẩy bản lưu lên mây (gộp nhiều lần ghi trong 4 giây).
//  - Mở game: bản trên mây mới hơn bản trên máy thì dùng bản trên mây.
//  - Đăng nhập Google: chơi tiếp trên máy khác / sau khi xoá dữ liệu trình duyệt.
//  Chưa điền js/firebase-config.js → CLOUD.enabled = false, game chạy như cũ.
// ============================================================
const FB_VER = '10.12.2';
// v163: tài khoản được xem màn "Góp ý nhận được" (phải khớp hàm isAdmin() trong firestore.rules — bảo mật thật nằm ở luật)
const ADMIN_EMAILS = ['ly230595@gmail.com'];
const CLOUD = {
  enabled: typeof FIREBASE_CONFIG !== 'undefined' && !!FIREBASE_CONFIG.apiKey,
  // chạy trong app Android / iOS (Capacitor): Google chặn đăng nhập bằng cửa sổ bật lên trong WebView
  native: !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()),
  ready: false, user: null, status: 'off', lastSync: 0, error: '',
  _timer: null, _pending: null, _listeners: [],
  onChange(fn) { this._listeners.push(fn); },
  _emit() { for (const f of this._listeners) try { f(this); } catch (e) { /* bỏ qua */ } },
  label() {
    if (!this.enabled) return 'Chưa đăng nhập';
    if (this.status === 'error') return 'Lỗi: ' + this.error;
    if (!this.user) return 'Đang kết nối…';
    const who = this.user.isAnonymous ? 'Khách' : (this.user.displayName || this.user.email || 'Tài khoản Google');
    return who;
  },
  _load(src) {
    return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  },
  async init(getLocal, applyCloud) {
    if (!this.enabled) return;
    this.status = 'loading'; this._emit();
    try {
      const base = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
      await this._load(base + 'firebase-app-compat.js');
      await Promise.all([this._load(base + 'firebase-auth-compat.js'), this._load(base + 'firebase-firestore-compat.js')]);
      firebase.initializeApp(FIREBASE_CONFIG);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      // v73: bắt buộc đăng nhập (Google / email). Phiên đăng nhập được Firebase nhớ trên máy (LOCAL),
      // mở lại game là vào thẳng. Tài khoản khách cũ (ẩn danh) vẫn được nối khi đăng nhập để giữ tiến trình.
      await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
      this.auth.onAuthStateChanged(async (u) => {
        this.user = u;
        this.signedIn = !!(u && !u.isAnonymous);
        this.ready = !!u; this.status = u ? 'ok' : 'signedout'; this.authKnown = true;
        if (u) await this.pull(getLocal, applyCloud);
        this._emit();
      });
    } catch (e) { this._fail(e); }
  },
  _fail(e) { this.status = 'error'; this.error = (e && (e.code || e.message)) || 'không kết nối được'; this._emit(); },
  _doc() { return this.db.collection('users').doc(this.user.uid); },
  // lấy bản trên mây; mới hơn bản trên máy thì dùng (applyCloud nạp lại giao diện)
  async pull(getLocal, applyCloud) {
    if (!this.ready) return;
    try {
      const snap = await this._doc().get();
      const local = getLocal();
      // bản lưu trên máy thuộc tài khoản khác (đổi tài khoản trên cùng máy) → không trộn
      const other = local.owner && local.owner !== this.user.uid;
      if (snap.exists) {
        const d = snap.data();
        if ((other || (d.updatedAt || 0) > (local.savedAt || 0)) && d.save) { applyCloud(JSON.parse(d.save), this.user.uid); this.lastSync = Date.now(); return; }
      } else if (other) { applyCloud(null, this.user.uid); }
      const cur = getLocal(); cur.owner = this.user.uid;
      await this.push(cur, true);
    } catch (e) { this._fail(e); }
  },
  // đẩy bản lưu (gộp các lần ghi liên tiếp trong 4 giây)
  push(save, now) {
    if (!this.ready) return Promise.resolve();
    this._pending = save;
    clearTimeout(this._timer);
    const go = async () => {
      const s = this._pending; this._pending = null;
      try {
        await this._doc().set({ save: JSON.stringify(s), updatedAt: s.savedAt || Date.now(), v: 1,
          name: this.user.isAnonymous ? '' : (this.user.displayName || '') });
        this.lastSync = Date.now(); this.status = 'ok'; this._emit();
      } catch (e) { this._fail(e); }
    };
    if (now) return go();
    this._timer = setTimeout(go, 4000);
    return Promise.resolve();
  },
  // đăng nhập Google: nối tài khoản khách hiện tại (giữ tiến trình); tài khoản đã có dữ liệu thì chuyển sang nó
  _err(e) {
    const m = { 'auth/invalid-email': 'Email không hợp lệ', 'auth/missing-password': 'Chưa nhập mật khẩu',
      'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự', 'auth/email-already-in-use': 'Email này đã có tài khoản — chọn Đăng nhập',
      'auth/invalid-credential': 'Sai email hoặc mật khẩu', 'auth/wrong-password': 'Sai email hoặc mật khẩu', 'auth/user-not-found': 'Chưa có tài khoản với email này',
      'auth/too-many-requests': 'Thử sai nhiều lần, đợi một lát', 'auth/network-request-failed': 'Mất mạng, thử lại',
      'auth/operation-not-allowed': 'Đăng nhập bằng email chưa được bật trong Firebase', 'auth/popup-blocked': 'Trình duyệt chặn cửa sổ đăng nhập',
      'auth/popup-closed-by-user': 'Đã đóng cửa sổ đăng nhập', 'auth/unauthorized-domain': 'Tên miền chưa được cho phép trong Firebase' };
    return m[e && e.code] || (e && (e.code || e.message)) || 'Lỗi';
  },
  // đăng nhập / đăng ký bằng email (dùng được cả trong app Android)
  async email(mode, email, pass, name) {
    if (!this.auth) throw new Error('Chưa kết nối');
    try {
      if (mode === 'reset') { await this.auth.sendPasswordResetEmail(email); return 'Đã gửi email đặt lại mật khẩu'; }
      if (mode === 'up') {
        const cred = firebase.auth.EmailAuthProvider.credential(email, pass);
        const r = this.user && this.user.isAnonymous ? await this.user.linkWithCredential(cred) : await this.auth.createUserWithEmailAndPassword(email, pass);
        if (name) await r.user.updateProfile({ displayName: name });
        this.user = this.auth.currentUser; this.signedIn = true; this._emit();
        return '';
      }
      await this.auth.signInWithEmailAndPassword(email, pass);
      return '';
    } catch (e) { throw new Error(this._err(e)); }
  },
  async google(getLocal, applyCloud) {
    if (!this.auth) return;
    if (!this.user) {
      if (this.native) throw new Error('Trong app hãy đăng nhập bằng email');
      try { await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); return; } catch (e) { throw new Error(this._err(e)); }
    }
    if (this.native) throw new Error('Trong app hãy đăng nhập bằng email');
    const prov = new firebase.auth.GoogleAuthProvider();
    try {
      if (this.user.isAnonymous) {
        try { await this.user.linkWithPopup(prov); this.user = this.auth.currentUser || this.user; this.signedIn = true; await this.push(getLocal(), true); }
        catch (e) {
          if (e.code !== 'auth/credential-already-in-use') throw e;
          await this.auth.signInWithCredential(e.credential);   // onAuthStateChanged sẽ kéo bản lưu của tài khoản đó
        }
      } else await this.auth.signInWithPopup(prov);
      this._emit();
    } catch (e) { throw new Error(this._err(e)); }
  },
  // ---------- v72: bảng xếp hạng — boards/{bảng}/scores/{uid}; chỉ ghi khi điểm cao hơn điểm cũ
  async submitScore(board, score, info) {
    if (!this.ready || !this.user) return false;
    const ref = this.db.collection('boards').doc(board).collection('scores').doc(this.user.uid);
    try {
      const old = await ref.get();
      if (old.exists && (old.data().score || 0) >= score) return false;
      await ref.set({ score, name: String(info.name || 'Khách').slice(0, 24), detail: String(info.detail || '').slice(0, 60),
        at: Date.now(), google: !this.user.isAnonymous });
      return true;
    } catch (e) { this._fail(e); return false; }
  },
  async topScores(board, n = 50) {
    if (!this.ready) return null;
    try {
      const q = await this.db.collection('boards').doc(board).collection('scores').orderBy('score', 'desc').limit(n).get();
      return q.docs.map((d) => ({ uid: d.id, ...d.data() }));
    } catch (e) { this._fail(e); return null; }
  },
  // ---------- v149: góp ý — feedback/{tự sinh}; người chơi chỉ được tạo; chỉ tài khoản quản trị (v163) đọc / đổi trạng thái / xoá.
  // Không gửi email; uid là mã ẩn danh của Firebase Auth. Lỗi → ném ra để giao diện xếp vào hàng đợi gửi lại.
  async sendFeedback(f) {
    if (!this.ready || !this.user || !this.db) throw new Error('offline');
    const doc = { kind: f.kind, text: f.text, contact: f.contact || '', shot: f.shot || '', ver: f.ver, where: f.where,
      scr: f.scr, ua: f.ua, at: f.at, uid: this.user.uid, guest: !!this.user.isAnonymous };
    await this.db.collection('feedback').add(doc);
    return true;
  },
  // ---------- v163: xem góp ý (chỉ tài khoản quản trị — luật Firestore isAdmin() mới là chốt chặn thật)
  // Ẩn nút chỉ là giao diện; tài khoản khác gọi các hàm này sẽ bị máy chủ từ chối (permission-denied).
  isAdmin() {
    const u = this.user;
    return !!(u && !u.isAnonymous && u.emailVerified && u.email && ADMIN_EMAILS.includes(String(u.email).toLowerCase()));
  },
  // email quản trị nhưng chưa xác minh (đăng ký bằng email/mật khẩu) → giao diện nhắc xác minh
  adminUnverified() {
    const u = this.user;
    return !!(u && !u.isAnonymous && !u.emailVerified && u.email && ADMIN_EMAILS.includes(String(u.email).toLowerCase()));
  },
  async verifyAdminEmail(check) {
    if (!this.user) throw new Error('Chưa đăng nhập');
    try {
      if (check) { await this.user.reload(); this.user = (this.auth && this.auth.currentUser) || this.user; if (this.user.emailVerified) await this.user.getIdToken(true); this._emit(); return this.user.emailVerified; }
      await this.user.sendEmailVerification(); return true;
    } catch (e) { throw new Error(this._err(e)); }
  },
  _fbAdminErr(e) {
    if (e && e.code === 'permission-denied') return new Error(this.isAdmin() ? 'Máy chủ chưa đăng luật mới (Firestore → Rules → dán firestore.rules → Publish)' : 'Tài khoản này không có quyền xem góp ý');
    return new Error((e && e.message === 'offline') ? 'Chưa kết nối máy chủ' : (e && (e.code || e.message)) || 'Lỗi');
  },
  // mới nhất trước; opts.limit (mặc định 20), opts.after = con trỏ trả về từ lần trước → trang kế tiếp
  async listFeedback(opts = {}) {
    if (!this.ready || !this.db) throw this._fbAdminErr(new Error('offline'));
    const n = opts.limit || 20;
    try {
      let q = this.db.collection('feedback').orderBy('at', 'desc');
      if (opts.after) q = q.startAfter(opts.after);
      const snap = await q.limit(n).get();
      const docs = snap.docs;
      return { items: docs.map((d) => ({ id: d.id, ...d.data() })), cursor: docs.length ? docs[docs.length - 1] : null, more: docs.length === n };
    } catch (e) { throw this._fbAdminErr(e); }
  },
  // status: 'new' | 'seen' | 'done'; note ≤ 300 ký tự (luật chỉ cho đổi 2 trường này)
  async setFeedbackStatus(id, status, note) {
    if (!this.ready || !this.db) throw this._fbAdminErr(new Error('offline'));
    const d = { status };
    if (note !== undefined) d.note = String(note).slice(0, 300);
    try { await this.db.collection('feedback').doc(id).update(d); return true; } catch (e) { throw this._fbAdminErr(e); }
  },
  async deleteFeedback(id) {
    if (!this.ready || !this.db) throw this._fbAdminErr(new Error('offline'));
    try { await this.db.collection('feedback').doc(id).delete(); return true; } catch (e) { throw this._fbAdminErr(e); }
  },
  async signOut() { if (this.auth) { clearTimeout(this._timer); await this.auth.signOut(); } },
};
