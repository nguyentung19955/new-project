// Fake firebase compat (app+auth+database) for local tests, talking to server.js over WebSocket.
(function () {
  const WS = 'ws://localhost:8790';
  let ws, ready, rid = 0, sid = 0; const pend = {}, subsCb = {}, subsPath = {}, subsCancel = {}; let hello = null;
  function connect() {
    ws = new WebSocket(WS);
    ready = new Promise(ok => ws.onopen = ok);
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.op === 'res') { const p = pend[m.rid]; delete pend[m.rid]; p && p(m); } else if (m.op === 'val') { const c = subsCb[m.id]; c && c(m.v); } else if (m.op === 'cancel') { const h = subsCancel[m.id]; delete subsCb[m.id]; if (h) h(Object.assign(new Error('permission_denied'), { code: 'PERMISSION_DENIED' })); else console.warn('fake rtdb: read denied ' + subsPath[m.id]); } };
  }
  connect();
  function send(o) { return ready.then(() => new Promise(ok => { o.rid = ++rid; pend[o.rid] = ok; ws.send(JSON.stringify(o)); })); }
  function chk(m) { if (m.err) { const e = new Error(m.err + ': permission_denied'); e.code = 'PERMISSION_DENIED'; throw e; } return m; }
  // ---- auth ----
  const LS = 'fake_fb_user';
  let cur = null; try { cur = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { }
  const listeners = [];
  function wrapUser(u) { if (!u) return null; const o = Object.assign({}, u);
    o.linkWithPopup = async () => { window.__linkVia = 'popup'; u.isAnonymous = false; u.displayName = 'Google Tester'; u.providerData = [{ providerId: 'google.com', displayName: 'Google Tester', email: 'tester@example.com' }]; save(); return { user: wrapUser(u) }; };
    o.linkWithRedirect = async () => { localStorage.setItem('fake_link_via', 'redirect'); u.isAnonymous = false; u.displayName = 'Google Tester'; u.providerData = [{ providerId: 'google.com', displayName: 'Google Tester', email: 'tester@example.com' }]; save(); location.reload(); };
    return o; }
  function save() { localStorage.setItem(LS, JSON.stringify(cur)); AUTH.currentUser = wrapUser(cur); hello = send({ op: 'hello', uid: cur && cur.uid }); listeners.forEach(f => f(AUTH.currentUser)); }
  const AUTH = {
    currentUser: wrapUser(cur),
    onAuthStateChanged(f) { listeners.push(f); setTimeout(() => f(AUTH.currentUser), 0); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; },
    async signInAnonymously() { cur = { uid: 'u' + Math.random().toString(36).slice(2, 12), isAnonymous: true, displayName: null }; save(); return { user: AUTH.currentUser }; },
    async getRedirectResult() { return { user: null }; },
    async signInWithPopup() { return AUTH.currentUser.linkWithPopup(); },
    async signInWithRedirect() { },
    async signInWithCredential() { },
  };
  if (cur) hello = send({ op: 'hello', uid: cur.uid });
  // ---- database ----
  const P = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'; let lastT = 0, lastR = [];
  function pushId() { let t = Date.now(); const dup = t === lastT; lastT = t; const tc = []; for (let i = 7; i >= 0; i--) { tc[i] = P.charAt(t % 64); t = Math.floor(t / 64); } let id = tc.join('');
    if (!dup) for (let i = 0; i < 12; i++) lastR[i] = Math.floor(Math.random() * 64); else { let i; for (i = 11; i >= 0 && lastR[i] === 63; i--) lastR[i] = 0; lastR[i]++; }
    for (let i = 0; i < 12; i++) id += P.charAt(lastR[i]); return id; }
  function snap(key, v) { return { key, val: () => v == null ? null : JSON.parse(JSON.stringify(v)), exists: () => v != null, child: (k) => snap(k, v && v[k]) }; }
  const join = (a, b) => (a ? a + '/' : '') + b;
  const live = {};
  function Ref(path, q) {
    const key = path.split('/').filter(Boolean).pop() || null;
    const r = {
      key, path,
      child: (p) => Ref(join(path, p)),
      push(v) { const k = pushId(); const c = Ref(join(path, k)); const pr = v === undefined ? Promise.resolve() : c.set(v); const o = Object.assign(pr.then(() => c), c); o.key = k; return o; },
      async set(v) { await hello; chk(await send({ op: v == null ? 'remove' : 'set', path, v })); },
      async update(v) { await hello; chk(await send({ op: 'update', path, v })); },
      async remove() { await hello; chk(await send({ op: 'remove', path })); },
      async once() { await hello; if (path.startsWith('.info')) return snap(key, path === '.info/connected' ? true : 0); const m = chk(await send({ op: 'get', path })); return snap(key, m.v); },
      on(ev, cb, huy) {
        if (path === '.info/connected') { setTimeout(() => cb(snap('connected', true)), 0); return cb; }
        if (path === '.info/serverTimeOffset') { setTimeout(() => cb(snap('o', 0)), 0); return cb; }
        const id = ++sid; subsPath[id] = path; if (typeof huy === 'function') subsCancel[id] = huy; const seen = new Set();
        subsCb[id] = (v) => {
          if (ev === 'value') cb(snap(key, v));
          else if (ev === 'child_added' && v && typeof v === 'object') for (const k of Object.keys(v).sort()) { if (seen.has(k)) continue; if (q && q.startAt && k < q.startAt) continue; seen.add(k); cb(snap(k, v[k])); }
        };
        (live[path + '|' + ev] = live[path + '|' + ev] || []).push({ cb, id });
        hello.then(() => ready).then(() => ws.send(JSON.stringify({ op: 'sub', id, path })));
        return cb;
      },
      off(ev, cb) { const l = live[path + '|' + ev] || []; for (const x of l) if (!cb || x.cb === cb) { ws.send(JSON.stringify({ op: 'unsub', id: x.id })); delete subsCb[x.id]; } live[path + '|' + ev] = cb ? l.filter(x => x.cb !== cb) : []; },
      orderByKey() { return { startAt: (k) => Ref(path, { startAt: k }) }; },
      async transaction(fn) { await hello; let curV = (await r.once()).val();
        for (let i = 0; i < 25; i++) { const nv = fn(curV == null ? null : JSON.parse(JSON.stringify(curV))); if (nv === undefined) return { committed: false, snapshot: snap(key, curV) };
          const m = await send({ op: 'tx', path, expect: JSON.stringify(curV), v: nv }); if (m.retry) { curV = m.cur; continue; } chk(m); return { committed: true, snapshot: snap(key, nv) }; }
        throw new Error('tx retries'); },
      onDisconnect() { return { set: async (v) => { await hello; await send({ op: 'od', path, kind: 'set', v }); }, update: async (v) => { await hello; await send({ op: 'od', path, kind: 'update', v }); }, remove: async () => { await hello; await send({ op: 'od', path, kind: 'remove' }); }, cancel: async () => { await send({ op: 'odc', path }); } }; },
    };
    return r;
  }
  const DB = { ref: (p) => Ref(p || '') };
  AUTH.signOut = async () => { cur = null; localStorage.removeItem(LS); AUTH.currentUser = null; listeners.forEach(f => f(null)); };
  function GP() { this.setCustomParameters = () => { }; }
  window.firebase = {
    apps: [], initializeApp(cfg, name) { window.__fbcfg = cfg; const a = { name: name || '[DEFAULT]', options: cfg, auth: () => AUTH, database: () => DB }; this.apps.push(a); return a; }, app() { return this.apps[0]; },
    auth: Object.assign(() => AUTH, { GoogleAuthProvider: GP }),
    database: Object.assign(() => DB, { ServerValue: { TIMESTAMP: { '.sv': 'timestamp' } } }),
  };
  window.__fakeFirebase = true;
})();
