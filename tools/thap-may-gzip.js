// Máy chủ tĩnh giống GitHub Pages (gzip cho html/css/js/json/svg, keep-alive, Cache-Control max-age=600) — để đo khởi động sát thực tế.
// node tools/thap-may-gzip.js <thư mục gốc> <cổng> [key.pem cert.pem]   (có key/cert → HTTP/2 + TLS như GitHub Pages)
'use strict';
const http = require('http'), http2 = require('http2'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const GOC = path.resolve(process.argv[2] || '.'), PORT = +(process.argv[3] || 8800);
const KIEU = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4' };
const NEN = /\.(html|js|css|json|svg)$/;
const bo = new Map();
const xu = (rq, rs) => {
  let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(GOC, p); if (!f.startsWith(GOC)) { rs.writeHead(403); return rs.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { rs.writeHead(404); return rs.end('404'); }
    const h = { 'Content-Type': KIEU[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600', 'Last-Modified': st.mtime.toUTCString() };
    if (NEN.test(f) && /gzip/.test(rq.headers['accept-encoding'] || '')) {
      const k = f + st.mtimeMs; let b = bo.get(k); if (!b) { b = zlib.gzipSync(fs.readFileSync(f), { level: 6 }); bo.set(k, b); }
      h['Content-Encoding'] = 'gzip'; h['Content-Length'] = b.length; rs.writeHead(200, h); return rs.end(b);
    }
    h['Content-Length'] = st.size; rs.writeHead(200, h); fs.createReadStream(f).pipe(rs);
  });
};
const [, , , , KEY, CERT] = process.argv;
(KEY ? http2.createSecureServer({ key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT), allowHTTP1: true }, xu) : http.createServer(xu))
  .listen(PORT, () => console.log('may-gzip', GOC, PORT, KEY ? 'h2' : 'http/1.1'));
