// TURRET MERGE — máy chủ GIẢ cho bài kiểm CO-OP online (không dùng Firebase thật, không dùng tài khoản thật).
// Mô phỏng phần Realtime Database mà thap/js/online/net.js dùng: set / update / remove / get, nghe 'value' + 'child_added'
// (kể cả startAt theo khoá), onDisconnect, giờ máy chủ {'.sv':'timestamp'}; đăng nhập giả: khách ẩn danh / "Google".
// Đồng thời phục vụ tệp tĩnh của repo (http://localhost:PORT/thap/?net=mock&mockws=ws://localhost:PORT).
// Chạy: NODE_PATH=<thư mục có node_modules/ws> node tools/thap-online-mock-server.js [PORT]
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = +(process.argv[2] || 8787), GOC = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.svg': 'image/svg+xml' };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(GOC, p);
  if (!f.startsWith(GOC)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(d);
  });
});

// ---------- cây dữ liệu ----------
let goc = {};
const tach = (p) => (p || '').split('/').filter(Boolean);
function lay(p) { let o = goc; for (const k of tach(p)) { if (o == null || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; }
function ts(v) {
  if (v && typeof v === 'object') {
    if (v['.sv'] === 'timestamp') return Date.now();
    const r = Array.isArray(v) ? [] : {}; for (const k in v) { const x = ts(v[k]); if (x !== null && x !== undefined) r[k] = x; } return Object.keys(r).length ? r : null;
  }
  return v;
}
function datGiaTri(p, v) {
  const ks = tach(p); v = ts(v);
  if (!ks.length) { goc = v || {}; return; }
  let o = goc;
  for (let i = 0; i < ks.length - 1; i++) { if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
  const k = ks[ks.length - 1];
  if (v === null || v === undefined) delete o[k]; else o[k] = v;
  // dọn nút rỗng phía trên (giống RTDB)
  for (let i = ks.length - 1; i > 0; i--) { const cha = lay(ks.slice(0, i).join('/')); if (cha && typeof cha === 'object' && !Object.keys(cha).length) datGiaTri(ks.slice(0, i).join('/'), null); else break; }
}

// ---------- người nghe ----------
const subs = new Map(); // sid toàn cục → { ws, sid, p, ev, sau, biet:Set }
function baoThayDoi(pw) {
  for (const s of subs.values()) {
    const a = tach(s.p).join('/'), b = tach(pw).join('/');
    const lienQuan = a === b || b.startsWith(a + '/') || a.startsWith(b + '/') || !a || !b;
    if (!lienQuan) continue;
    if (s.ev === 'value') gui(s.ws, { sid: s.sid, v: lay(s.p) });
    else {
      const v = lay(s.p) || {};
      for (const k of Object.keys(v).sort()) if (!s.biet.has(k) && (!s.sau || k >= s.sau)) { s.biet.add(k); gui(s.ws, { sid: s.sid, k, v: v[k] }); }
      for (const k of [...s.biet]) if (!(k in v)) s.biet.delete(k);
    }
  }
}
const TRE = +(process.env.DELAY || 0); // giả độ trễ mạng (ms, mỗi chiều server → máy)
function gui(ws, m) { const s = JSON.stringify(m); const f = () => { if (ws.readyState === 1) ws.send(s); }; if (TRE) setTimeout(f, TRE); else f(); }

const wss = new WebSocketServer({ server: srv });
const USERS = {}; // uid → user
wss.on('connection', (ws) => {
  ws.od = new Map(); ws.mySubs = new Set();
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const tl = (v, err) => gui(ws, { id: m.id, v, err });
    const P = 'turretmerge/' + (m.p || '');
    switch (m.op) {
      case 'hello': ws.uid = m.uid; USERS[m.uid] = USERS[m.uid] || { uid: m.uid, anon: true, name: '', email: '', photo: '' }; return tl(USERS[m.uid]);
      case 'google': { const u = USERS[ws.uid]; u.anon = false; u.name = 'Google Tester'; u.email = 'tester@example.com'; return tl(u); }
      case 'signout': { const uid = 'u' + Math.random().toString(36).slice(2, 10); ws.uid = uid; USERS[uid] = { uid, anon: true, name: '', email: '', photo: '' }; return tl(USERS[uid]); }
      case 'get': return tl(lay(P));
      case 'set':
        // luật tối thiểu giống database.rules: ô 'khach' chỉ ghi khi còn trống (hoặc chính mình)
        if (/^turretmerge\/rooms\/[A-Z]{4}\/khach$/.test(P)) { const cu = lay(P); if (cu && cu !== ws.uid) return tl(null, 'PERMISSION_DENIED'); }
        datGiaTri(P, m.v); baoThayDoi(P); return tl(null);
      case 'update':
        if (/^turretmerge\/rooms\/[A-Z]{4}$/.test(P) && m.v && m.v.khach) { const cu = lay(P + '/khach'); if (cu && cu !== ws.uid) return tl(null, 'PERMISSION_DENIED'); }
        for (const k in m.v) datGiaTri(P + '/' + k, m.v[k]); baoThayDoi(P); return tl(null);
      case 'remove': datGiaTri(P, null); baoThayDoi(P); return tl(null);
      case 'cas': { // so-và-ghi cho NET.tx (transaction): giá trị đã đổi → báo thử lại
        const cu = lay(P); if (JSON.stringify(cu == null ? null : cu) !== m.cu) return tl({ lai: true });
        datGiaTri(P, m.v); baoThayDoi(P); return tl({ lai: false });
      }
      case 'sub': {
        const key = ws.uid + ':' + m.sid + ':' + Math.random();
        const s = { ws, sid: m.sid, p: P, ev: m.ev, sau: m.sau, biet: new Set() };
        subs.set(key, s); ws.mySubs.add(key);
        if (m.ev === 'value') gui(ws, { sid: m.sid, v: lay(P) });
        else { const v = lay(P) || {}; for (const k of Object.keys(v).sort()) if (!m.sau || k >= m.sau) { s.biet.add(k); gui(ws, { sid: m.sid, k, v: v[k] }); } }
        return tl(null);
      }
      case 'unsub': for (const key of [...ws.mySubs]) if (subs.get(key).sid === m.sid) { subs.delete(key); ws.mySubs.delete(key); } return tl(null);
      case 'od': ws.od.set(P, m.v); return tl(null);
      case 'odx': ws.od.delete(P); return tl(null);
    }
  });
  ws.on('close', () => {
    for (const key of ws.mySubs) subs.delete(key);
    for (const [p, v] of ws.od) { datGiaTri(p, v); baoThayDoi(p); }
  });
});
srv.listen(PORT, () => console.log('mock online server on http://localhost:' + PORT));
