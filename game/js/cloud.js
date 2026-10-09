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

  // ---------- đo tiến độ một bản lưu (để so khi hai bản lệch nhau) ----------
  function starSum(s) { let n = 0; for (const m of [s.stars || {}, s.stars2 || {}]) for (const k in m) n += Math.max(0, Math.min(3, m[k] | 0)); return n; }
  function far(s) { let f = 0; for (const k in s.stars || {}) { const [r, i] = k.split('-').map(Number); if (r >= 0 && i >= 0) f = Math.max(f, r * 5 + i + 1); } return f; }
  function farText(f) { if (!f) return 'chưa qua ải nào'; const r = Math.floor((f - 1) / 5), i = (f - 1) % 5; return (G.REGIONS[r] ? G.REGIONS[r].name : 'Vùng ' + (r + 1)) + ' ' + (i + 1); }
  function maxLvl(s) { let l = 1; for (const k in s.heroes || {}) l = Math.max(l, (s.heroes[k] && s.heroes[k].lvl) || 1); return l; }
  function progress(s) {
    if (!s) return 0;
    let lv = 0; for (const k in s.heroes || {}) if (s.heroes[k] && s.heroes[k].unlocked) lv += s.heroes[k].lvl || 1;
    return starSum(s) * 3 + far(s) * 5 + lv + Math.min(30, (s.weapons || []).length);
  }
  function summary(s) { return { stars: starSum(s), far: far(s), farText: farText(far(s)), lvl: maxLvl(s), weapons: (s.weapons || []).length, gold: s.gold || 0 }; }

  // phần "nội dung" của bản lưu: bỏ mốc thời gian, chủ bản lưu và cài đặt riêng của máy
  const META = ['savedAt', 'owner', 'sound'];
  function body(s) { const o = Object.assign({}, s); for (const k of META) delete o[k]; return JSON.stringify(o); }
  let lastBody = null;

  const C = (G.cloud = {
    COL, BOSSES, ADMIN_EMAILS, progress, summary, starSum, far, farText,
    why: whyOff(), enabled: false, status: 'off', ready: false, user: null, lastSync: 0, error: '',
    dirty: false, _timer: null, myScore: null, adminNew: null, pendingApply: null,
    _load(src) { return new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }); },

    // Dòng trạng thái hiện ở Anh Mõ
    label() {
      if (this.why === 'frame') return 'Bản xem trước: không kết nối được mây, chỉ lưu trên máy';
      if (this.why === 'file') return 'Mở từ tệp trên máy: chỉ lưu trên máy';
      if (this.why === 'no-config' || this.why === 'off') return 'Chưa bật lưu mây: chỉ lưu trên máy';
      if (this.why === 'offline' || this.status === 'error') return 'Đang ngoại tuyến: vẫn lưu trên máy, có mạng sẽ lưu lên mây';
      if (this.status === 'loading' || !this.user) return 'Đang kết nối mây…';
      if (this.dirty || this.status === 'saving') return 'Đang lưu lên mây…';
      if (this.lastSync) { const d = new Date(this.lastSync); return 'Đã lưu lên mây lúc ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
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
      await this.pull();
      this.flushFeedback && this.flushFeedback();
      if (G.bangVang) G.bangVang.sync();
      if (this.isAdmin()) this.countNew();
    },
    _fail(e) { this.status = 'error'; this.error = (e && (e.code || e.message)) || 'lỗi'; },
    _doc() { return this.db.collection(COL.users).doc(this.user.uid); },

    // ---------- bản lưu ----------
    async pull() {
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
          const cloud = G.fixSave(cs);
          const cloudNewer = (d.updatedAt || 0) > (local.savedAt || 0);
          if (other || cloudNewer) {
            const lp = progress(local), cp = progress(cloud);
            let use = 'cloud';
            // bản trên máy tiến xa hơn rõ rệt: hỏi lại, mặc định giữ bản nhiều tiến độ hơn
            if (lp >= cp + 8 && G.cloudUI && G.cloudUI.conflict) use = await G.cloudUI.conflict(summary(local), summary(cloud), d.updatedAt || 0);
            if (use === 'cloud') { this.apply(cloud, d.updatedAt || Date.now()); this.lastSync = Date.now(); return; }
          } else if ((d.updatedAt || 0) === (local.savedAt || 0)) { this.lastSync = d.updatedAt || Date.now(); this._own(); return; }
        }
        this._own();
        await this.push(true);
      } catch (e) { this._fail(e); }
    },
    _own() { if (G.save.owner !== this.user.uid) { G.save.owner = this.user.uid; basePersist(); } },
    // dùng bản trên mây; đang trong ải thì chờ về làng mới thay (không làm rối trận đang đánh)
    apply(s, at) {
      if (G.scene === G.StageScene) { this.pendingApply = { s, at }; return; }
      const snd = G.save ? G.save.sound : true;
      s.sound = snd; s.owner = this.user ? this.user.uid : s.owner; s.savedAt = at || s.savedAt || Date.now();
      G.save = s; lastBody = body(s); basePersist();
      this.pendingApply = null;
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
      clearTimeout(this._timer);
      if (!this.online()) { this.dirty = true; return; }
      const s = G.save;
      s.owner = this.user.uid;
      if (!s.savedAt) s.savedAt = Date.now();
      this.status = 'saving';
      try {
        await this._doc().set({ save: JSON.stringify(s), updatedAt: s.savedAt, prog: progress(s), v: 1, ver: String(G.VERSION).slice(0, 20) });
        this.lastSync = Date.now(); this.status = 'ok'; this.dirty = false;
      } catch (e) { this._fail(e); this.dirty = true; }
    },

    // ---------- đăng nhập Google: nối tài khoản khách hiện tại (giữ tiến trình) ----------
    _err(e) {
      const m = { 'auth/popup-blocked': 'Trình duyệt chặn cửa sổ đăng nhập', 'auth/popup-closed-by-user': 'Đã đóng cửa sổ đăng nhập',
        'auth/cancelled-popup-request': 'Đã đóng cửa sổ đăng nhập', 'auth/network-request-failed': 'Mất mạng, thử lại sau',
        'auth/unauthorized-domain': 'Tên miền này chưa được cho phép trong Firebase', 'auth/operation-not-supported-in-this-environment': 'Chỗ này không đăng nhập được' };
      return (e && m[e.code]) || (e && (e.code || e.message)) || 'Lỗi';
    },
    async google() {
      if (!this.online()) throw new Error('Chưa kết nối mây');
      const fb = window.firebase, prov = new fb.auth.GoogleAuthProvider();
      try {
        if (this.user.isAnonymous) {
          try {
            const r = await this.user.linkWithPopup(prov);
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
      try { await this.db.collection(COL.scores).doc(this.user.uid).set(m); this.myScore = m; return true; } catch (er) { this._fail(er); return false; }
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
      if (b !== lastBody) { lastBody = b; s.savedAt = Date.now(); if (C.enabled) C.queue(); }
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
      if (C.pendingApply) C.apply(C.pendingApply.s, C.pendingApply.at);
      return baseEnter.apply(this, arguments);
    };
  }
  // có mạng lại: đẩy phần còn chờ
  addEventListener('online', () => { if (C.dirty && C.online()) C.push(true); });
  // rời trang: cố đẩy nốt
  addEventListener('pagehide', () => { if (C.dirty && C.online()) C.push(true); });
})();
