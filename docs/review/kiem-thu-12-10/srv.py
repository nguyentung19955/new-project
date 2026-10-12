"""Máy chủ thử giống Firebase Hosting: gzip, ETag/304, Cache-Control theo cấu hình workflow. Chạy: python3 srv.py <thư mục> <cổng> [regex chặn]"""
import gzip, hashlib, http.server, os, re, sys, threading

GOC = sys.argv[1]; CONG = int(sys.argv[2]); CHAN = sys.argv[3] if len(sys.argv) > 3 else None
NHO = {}
LOCK = threading.Lock()
TYPES = {'.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json'}


class H(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *a): pass

    def do_GET(self):
        sys.stderr.write('%.2f GET %s inm=%s\n' % (__import__('time').time(), self.path[:60], bool(self.headers.get('If-None-Match')))); sys.stderr.flush()
        ten = self.path.split('?')[0].lstrip('/') or 'index.html'
        # Ảnh rời (Tải nhanh 12/10) nằm trong thư mục con anh/: giữ một cấp thư mục, chặn '..'
        p = os.path.join(GOC, *[x for x in ten.split('/') if x not in ('', '.', '..')][-2:])
        if (CHAN and re.search(CHAN, ten)) or not os.path.isfile(p):
            self.send_response(404); self.send_header('Content-Length', '0'); self.end_headers(); return
        with LOCK:
            if p not in NHO:
                raw = open(p, 'rb').read()
                NHO[p] = (gzip.compress(raw, 6), '"' + hashlib.md5(raw).hexdigest() + '"')
        d, etag = NHO[p]
        cc = 'public, max-age=31536000, immutable' if re.match(r'linh-khi-anh\..*\.json$', ten) else 'no-cache'
        if self.headers.get('If-None-Match') == etag:
            self.send_response(304); self.send_header('ETag', etag); self.send_header('Cache-Control', cc); self.send_header('Content-Length', '0'); self.end_headers(); return
        ext = os.path.splitext(p)[1]
        self.send_response(200)
        self.send_header('Content-Type', TYPES.get(ext, 'application/octet-stream'))
        self.send_header('Content-Encoding', 'gzip'); self.send_header('Content-Length', str(len(d)))
        self.send_header('Cache-Control', cc); self.send_header('ETag', etag)
        self.end_headers()
        try:
            for i in range(0, len(d), 65536): self.wfile.write(d[i:i + 65536])
        except Exception: pass


http.server.ThreadingHTTPServer(('127.0.0.1', CONG), H).serve_forever()
