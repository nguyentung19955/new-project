// Firebase GIẢ cho bài kiểm tra lưu mây (tests/may.py): chạy hoàn toàn trong trang, không cần mạng.
// Nạp bằng add_init_script trước game. Dữ liệu "trên mây" giữ trong localStorage '__fakefs' để tải lại trang vẫn còn.
// Điều khiển từ bài kiểm tra:
//   window.__fbFail = true          mọi lệnh đọc/ghi Firestore báo lỗi (giả mất mạng)
//   window.__fsLog                  nhật ký các lệnh ghi { op, path, data }
//   localStorage '__fakeauth'       người dùng đang đăng nhập (giữ qua tải lại trang, giống Firebase thật)
//   window.__linkConflict           đăng nhập Google mà tài khoản đó đã có dữ liệu
//   window.__googleEmail            email Google khi nối tài khoản (mặc định nguoichoi@gmail.com)
(function () {
  window.LK_CLOUD_TEST = true;
  const LS = '__fakefs', LA = '__fakeauth';
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
  const fs = load(LS, {});
  const save = () => localStorage.setItem(LS, JSON.stringify(fs));
  window.__fs = fs; window.__fsLog = []; window.__fsReads = 0;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const fail = () => (window.__fbFail ? Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' })) : null);
  const wait = (v) => new Promise((r) => setTimeout(() => r(v), 5));
  let auto = 0;

  function snap(path, id) { const d = fs[path]; return { id, exists: !!d, data: () => (d ? clone(d) : undefined), ref: { path } }; }
  function Doc(col, id) {
    const path = col + '/' + id;
    return {
      id, path,
      get() { return fail() || (window.__fsReads++, wait(snap(path, id))); },
      set(data) { return fail() || (fs[path] = clone(data), save(), window.__fsLog.push({ op: 'set', path, data: clone(data) }), wait()); },
      update(data) { if (window.__fbFail) return fail(); if (!fs[path]) return Promise.reject(Object.assign(new Error('not-found'), { code: 'not-found' })); Object.assign(fs[path], clone(data)); save(); window.__fsLog.push({ op: 'update', path, data: clone(data) }); return wait(); },
      delete() { return fail() || (delete fs[path], save(), window.__fsLog.push({ op: 'delete', path }), wait()); },
    };
  }
  function Query(col, o) {
    o = o || {};
    const q = {
      orderBy(f, dir) { return Query(col, Object.assign({}, o, { f, dir: dir || 'asc' })); },
      startAfter(c) { return Query(col, Object.assign({}, o, { after: c && c.id })); },
      limit(n) { return Query(col, Object.assign({}, o, { n })); },
      get() {
        if (window.__fbFail) return fail();
        let docs = Object.keys(fs).filter((p) => p.indexOf(col + '/') === 0 && p.split('/').length === 2).map((p) => snap(p, p.split('/')[1]));
        if (o.f) {
          docs = docs.filter((d) => d.data()[o.f] !== undefined);
          docs.sort((a, b) => { const x = a.data()[o.f], y = b.data()[o.f]; return (x < y ? -1 : x > y ? 1 : a.id < b.id ? -1 : 1) * (o.dir === 'desc' ? -1 : 1); });
        }
        if (o.after) { const i = docs.findIndex((d) => d.id === o.after); docs = docs.slice(i + 1); }
        if (o.n) docs = docs.slice(0, o.n);
        window.__fsReads += Math.max(1, docs.length);
        return wait({ docs, size: docs.length, empty: !docs.length });
      },
    };
    return q;
  }
  function Col(name) {
    return Object.assign(Query(name), {
      doc: (id) => Doc(name, id),
      add(data) { if (window.__fbFail) return fail(); const id = 'fb' + (++auto) + '_' + Date.now(); fs[name + '/' + id] = clone(data); save(); window.__fsLog.push({ op: 'add', path: name + '/' + id, data: clone(data) }); return wait({ id }); },
    });
  }

  // ---------- đăng nhập ----------
  const listeners = [];
  let user = null;
  function mkUser(u) {
    if (!u) return null;
    const x = Object.assign({ uid: '', isAnonymous: true, email: null, emailVerified: false, displayName: null, providerData: [] }, u);
    x.reload = () => wait();
    x.getIdToken = () => wait('tok');
    x.linkWithPopup = () => {
      if (window.__linkConflict) {
        const other = { uid: 'google-cu', isAnonymous: false, email: window.__googleEmail || 'nguoichoi@gmail.com', emailVerified: true, displayName: 'Người Chơi Cũ' };
        return Promise.reject(Object.assign(new Error('in use'), { code: 'auth/credential-already-in-use', credential: { user: other } }));
      }
      Object.assign(x, { isAnonymous: false, email: window.__googleEmail || 'nguoichoi@gmail.com', emailVerified: true, displayName: 'Nguyễn Văn An' });
      localStorage.setItem(LA, JSON.stringify(plain(x)));
      return wait({ user: x });
    };
    return x;
  }
  const plain = (u) => (u ? { uid: u.uid, isAnonymous: u.isAnonymous, email: u.email, emailVerified: u.emailVerified, displayName: u.displayName } : null);
  function setUser(u) { user = mkUser(u); auth.currentUser = user; localStorage.setItem(LA, JSON.stringify(plain(user))); for (const f of listeners) f(user); }
  const auth = {
    currentUser: null,
    setPersistence: () => wait(),
    onAuthStateChanged(fn) { listeners.push(fn); setTimeout(() => fn(user), 10); return () => {}; },
    signInAnonymously() { if (window.__fbAuthFail) return Promise.reject(Object.assign(new Error('net'), { code: 'auth/network-request-failed' })); window.__anonCount = (window.__anonCount || 0) + 1; setTimeout(() => setUser({ uid: 'khach' + Math.random().toString(36).slice(2, 8), isAnonymous: true }), 5); return wait(); },
    signInWithCredential(c) { setTimeout(() => setUser(c.user), 5); return wait(); },
    signInWithPopup() { setTimeout(() => setUser({ uid: 'google-moi', isAnonymous: false, email: window.__googleEmail || 'nguoichoi@gmail.com', emailVerified: true, displayName: 'Nguyễn Văn An' }), 5); return wait(); },
    signOut() { setUser(null); return wait(); },
  };
  user = mkUser(load(LA, null)); auth.currentUser = user;
  const db = { collection: Col };
  const apps = [];
  function GoogleAuthProvider() {}
  const authFn = () => auth;
  authFn.GoogleAuthProvider = GoogleAuthProvider;
  authFn.Auth = { Persistence: { LOCAL: 'local' } };
  window.firebase = {
    apps,
    initializeApp(cfg, name) { window.__fbConfig = cfg; const a = { name: name || '[DEFAULT]', auth: () => auth, firestore: () => db }; apps.push(a); return a; },
    auth: authFn,
  };
})();
