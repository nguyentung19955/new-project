// Máy chủ thử giống Firebase Hosting, HTTP/2 + TLS (Firebase phục vụ HTTP/2): gzip cho html/json/js (ảnh không nén), ETag/304,
// Cache-Control: no-cache, riêng ảnh rời /anh/* và linh-khi-anh.*.json là immutable 1 năm (như firebase.json trong workflow).
// Giả lập mạng PHÍA MÁY CHỦ (đúng cả cho yêu cầu đi qua service worker, thứ mà giả lập mạng của DevTools không bóp):
//   LK_MBPS=<Mbps> một đường truyền chung cho mọi tệp (chia lượt từng mẩu 16 KB), LK_RTT=<ms> trễ trước mỗi phản hồi.
// Chạy: node srv_h2.js <thư mục site> <cổng> [regex chặn đường dẫn]   (cần key.pem, cert.pem trong thư mục LK_TLS_DIR: openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -subj /CN=localhost)
const http2 = require('http2'), fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const [GOC, CONG, CHAN] = [process.argv[2], +process.argv[3], process.argv[4] ? new RegExp(process.argv[4]) : null];
const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
const NEN = { '.html': 1, '.json': 1, '.js': 1, '.webmanifest': 1 };
const nho = new Map();
const MBPS = +process.env.LK_MBPS || 0, RTT = +process.env.LK_RTT || 0, BPS = MBPS * 1e6 / 8;
let ranh = 0; // thời điểm đường truyền chung rảnh (ms)
function gui(st, d) {
  if (!BPS) { st.end(d); return; }
  let i = 0;
  const tiep = () => {
    if (st.destroyed || st.closed) return;
    if (i >= d.length) { st.end(); return; }
    const m = d.subarray(i, i + 16384); i += m.length;
    const now = Date.now(); ranh = Math.max(ranh, now) + (m.length / BPS) * 1000;
    setTimeout(() => { if (!st.destroyed) st.write(m); tiep(); }, Math.max(0, ranh - now));
  };
  tiep();
}
const srv = http2.createSecureServer({ key: fs.readFileSync(path.join(process.env.LK_TLS_DIR || __dirname, 'key.pem')), cert: fs.readFileSync(path.join(process.env.LK_TLS_DIR || __dirname, 'cert.pem')) });
srv.on('stream', (st, h) => { if (RTT) setTimeout(() => xuLy(st, h), RTT); else xuLy(st, h); });
function xuLy(st, h) {
  if (process.env.LK_LOG) process.stderr.write(Date.now() + ' ' + h[':path'] + ' inm=' + !!h['if-none-match'] + '\n');
  let p = decodeURIComponent((h[':path'] || '/').split('?')[0]).replace(/^\/+/, '') || 'index.html';
  if (p.includes('..')) p = 'x';
  const f = path.join(GOC, p);
  if ((CHAN && CHAN.test(p)) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { st.respond({ ':status': 404, 'content-length': '0' }); st.end(); return; }
  if (!nho.has(f)) { const raw = fs.readFileSync(f), ext = path.extname(f); nho.set(f, { d: NEN[ext] ? zlib.gzipSync(raw, { level: 6 }) : raw, gz: !!NEN[ext], etag: '"' + crypto.createHash('md5').update(raw).digest('hex') + '"', type: TYPES[ext] || 'application/octet-stream' }); }
  const o = nho.get(f);
  const cc = /^anh\/|^linh-khi-anh\..*\.json$/.test(p) ? 'public, max-age=31536000, immutable' : 'no-cache';
  if (h['if-none-match'] === o.etag) { st.respond({ ':status': 304, etag: o.etag, 'cache-control': cc }); st.end(); return; }
  const hd = { ':status': 200, 'content-type': o.type, 'content-length': String(o.d.length), 'cache-control': cc, etag: o.etag };
  if (o.gz) hd['content-encoding'] = 'gzip';
  st.respond(hd); gui(st, o.d);
}
srv.listen(CONG, '127.0.0.1');
