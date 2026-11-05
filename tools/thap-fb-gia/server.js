// TURRET MERGE — máy chủ Realtime Database GIẢ (WebSocket :8790) cho tools/thap-fb-gia/kt-2-may.py.
// Fake Firebase RTDB server for local tests — enforces the PUBLISHED turret-merge rules (see ONLINE-FIREBASE.md)
const { WebSocketServer } = require('ws');
const fs = require('fs');
const PORT = +process.env.PORT || 8790;
let root = {};
const LOG = process.env.LOG || null;
const subs = new Map(); // ws -> Map(id -> path)
const od = new Map();   // ws -> [{path, kind, v}]
const uids = new Map();
let denied = [];
const split = p => (p || '').split('/').filter(Boolean);
function get(t, p) { let c = t; for (const k of split(p)) { if (c == null || typeof c !== 'object') return null; c = c[k]; } return c === undefined ? null : c; }
function clone(v) { return v == null ? null : JSON.parse(JSON.stringify(v)); }
function norm(v) { if (v == null) return null; if (Array.isArray(v)) { const o = {}; v.forEach((x, i) => { if (x != null) o[i] = x; }); v = o; }
  if (typeof v === 'object') { const o = {}; for (const k in v) { const x = norm(v[k]); if (x != null) o[k] = x; } return Object.keys(o).length ? o : null; } return v; }
function denorm(v) { // object with 0..n keys -> array (like RTDB)
  if (v == null || typeof v !== 'object') return v; const ks = Object.keys(v); const o = {}; for (const k of ks) o[k] = denorm(v[k]);
  if (ks.length && ks.every(k => /^\d+$/.test(k))) { const mx = Math.max(...ks.map(Number)); if (mx < ks.length * 2) { const a = []; for (const k of ks) a[+k] = o[k]; for (let i = 0; i <= mx; i++) if (a[i] === undefined) a[i] = null; return a; } }
  return o; }
function sv(v) { if (v && typeof v === 'object') { if (v['.sv'] === 'timestamp') return Date.now(); const o = Array.isArray(v) ? [] : {}; for (const k in v) o[k] = sv(v[k]); return o; } return v; }
function setIn(t, p, v) { const ks = split(p); if (!ks.length) return norm(v) || {}; t = t || {}; let c = t; for (let i = 0; i < ks.length - 1; i++) { if (c[ks[i]] == null || typeof c[ks[i]] !== 'object') c[ks[i]] = {}; c = c[ks[i]]; } c[ks[ks.length - 1]] = v; return norm(t) || {}; }
// rules
function canRead(uid, p) { const k = split(p); if (!uid) return false; return k[0] === 'turretmerge' && (k[1] === 'profiles' || k[1] === 'rooms') && k.length >= 3; }
function canWrite(uid, p, newRoot) {
  const k = split(p); if (!uid || k[0] !== 'turretmerge' || k.length < 3) return false;
  if (k[1] === 'profiles') return uid === k[2];
  if (k[1] === 'rooms') { const base = 'turretmerge/rooms/' + k[2]; const data = get(root, base), nd = get(newRoot, base);
    return data == null || !!(data.members && data.members[uid] != null) || !!(nd && nd.members && nd.members[uid] != null); }
  return false;
}
function commit(newRoot) { root = newRoot; if (LOG) fs.writeFileSync(LOG, JSON.stringify(root)); notify(); }
function notify() { for (const [ws, m] of subs) for (const [id, s] of m) { const v = JSON.stringify(denorm(get(root, s.path))); if (v !== s.last) { s.last = v; ws.send(JSON.stringify({ op: 'val', id, v: JSON.parse(v) })); } } }
function doWrite(uid, op, p, v) {
  v = sv(clone(v));
  let nr = clone(root) || {};
  if (op === 'set') { nr = setIn(nr, p, v); if (!canWrite(uid, p, nr)) return 'PERMISSION_DENIED'; }
  else if (op === 'remove') { nr = setIn(nr, p, null); if (!canWrite(uid, p, nr)) return 'PERMISSION_DENIED'; }
  else if (op === 'update') { const paths = Object.keys(v); for (const k of paths) nr = setIn(nr, p + '/' + k, v[k]); for (const k of paths) if (!canWrite(uid, p + '/' + k, nr)) return 'PERMISSION_DENIED'; }
  commit(nr); return null;
}
const wss = new WebSocketServer({ port: PORT });
wss.on('connection', ws => {
  subs.set(ws, new Map()); od.set(ws, []);
  ws.on('message', raw => {
    const m = JSON.parse(raw); const uid = uids.get(ws);
    const res = (o) => ws.send(JSON.stringify(Object.assign({ op: 'res', rid: m.rid }, o)));
    switch (m.op) {
      case 'hello': uids.set(ws, m.uid); res({}); break;
      case 'sub': if (!canRead(uid, m.path)) { ws.send(JSON.stringify({ op: 'cancel', id: m.id, err: 'PERMISSION_DENIED' })); denied.push(['read', uid, m.path]); break; }
        { const s = { path: m.path, last: JSON.stringify(denorm(get(root, m.path))) }; subs.get(ws).set(m.id, s); ws.send(JSON.stringify({ op: 'val', id: m.id, v: JSON.parse(s.last) })); } break;
      case 'unsub': subs.get(ws).delete(m.id); break;
      case 'get': if (!canRead(uid, m.path)) { denied.push(['read', uid, m.path]); return res({ err: 'PERMISSION_DENIED' }); } res({ v: denorm(get(root, m.path)) }); break;
      case 'set': case 'update': case 'remove': { const e = doWrite(uid, m.op, m.path, m.v); if (e) denied.push([m.op, uid, m.path]); res({ err: e }); break; }
      case 'tx': { const cur = JSON.stringify(denorm(get(root, m.path))); if (cur !== m.expect) return res({ retry: true, cur: JSON.parse(cur) }); const e = doWrite(uid, 'set', m.path, m.v); if (e) denied.push(['tx', uid, m.path]); res({ err: e }); break; }
      case 'od': od.get(ws).push({ path: m.path, kind: m.kind, v: m.v }); res({}); break;
      case 'odc': od.set(ws, od.get(ws).filter(x => x.path !== m.path)); res({}); break;
      case 'dump': res({ v: root, denied }); break;
    }
  });
  ws.on('close', () => { const uid = uids.get(ws); for (const o of od.get(ws) || []) { const e = doWrite(uid, o.kind, o.path, o.v); if (e) denied.push(['od', uid, o.path]); } subs.delete(ws); od.delete(ws); uids.delete(ws); });
});
console.log('fake rtdb on', PORT);
