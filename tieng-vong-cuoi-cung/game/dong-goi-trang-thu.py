#!/usr/bin/env python3
"""Đóng gói MỘT trang thử (game/thu-*/…html) thành 1 file HTML tự chứa để đăng artifact (mở được trong app Claude).

Cách làm: mở trang qua máy chủ cục bộ bằng Chromium, ghi lại mọi file nó tải; nhúng các file đó thành data URI
(PNG lớn → WebP q90 giữ alpha, cùng kích thước; JSON/JS giữ nguyên), chèn <script src> inline, và chèn một đoạn
"bản đồ" ở đầu trang để mọi lệnh tải ảnh / fetch / XHR theo đường dẫn tương đối lấy từ bản nhúng.
Chạy:  python3 game/dong-goi-trang-thu.py game/thu-p0a/index.html  [ra.html]
Mặc định ra <trang>.build.html cạnh trang gốc (không commit file build)."""
import base64, io, json, os, re, subprocess, sys, threading, http.server, socketserver, functools
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
trang = sys.argv[1]
ra = sys.argv[2] if len(sys.argv) > 2 else re.sub(r'\.html$', '.build.html', trang)
PORT = 8811

Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=GOC)
Handler.log_message = lambda *a: None
srv = socketserver.TCPServer(('127.0.0.1', PORT), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()

js = r"""
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:540}});const s=new Set();
pg.on('request',r=>{const u=r.url();if(u.startsWith('http://127.0.0.1:%d/'))s.add(decodeURIComponent(u.slice(%d).split('?')[0].split('#')[0]));});
let tLast=Date.now();pg.on('request',()=>{tLast=Date.now()});
await pg.goto('http://127.0.0.1:%d/'+process.argv[2]);const t0=Date.now();await pg.waitForTimeout(9000);
/* trang nạp tuần tự (vd. nhiều sheet nhân vật) có thể lâu hơn 9 s: chờ tới khi 6 s không còn yêu cầu mới (tối đa 120 s) */
while(Date.now()-tLast<6000&&Date.now()-t0<120000)await pg.waitForTimeout(1000);
console.log(JSON.stringify([...s]));await b.close();})();
""" % (PORT, len('http://127.0.0.1:%d/' % PORT), PORT)
tmp = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'dong-goi-req.js')
open(tmp, 'w').write(js)
tep = json.loads(subprocess.check_output(['node', tmp, trang], cwd='/tmp').decode().strip().splitlines()[-1])
srv.shutdown()

html = open(os.path.join(GOC, trang), encoding='utf-8').read()
thu_muc = os.path.dirname(trang)
MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json',
        '.js': 'text/javascript', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav'}

# 1) chèn inline các <script src="…"> cục bộ
def thay_script(m):
    src = m.group(1)
    if src.startswith('http'):
        return m.group(0)
    p = os.path.normpath(os.path.join(thu_muc, src))
    return '<script>\n' + open(os.path.join(GOC, p), encoding='utf-8').read().replace('</script', '<\\/script') + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', thay_script, html)

# 2) bản đồ đường dẫn → data URI
da_inline = {os.path.normpath(os.path.join(thu_muc, s)) for s in
              re.findall(r'<script src="([^"]+)"', open(os.path.join(GOC, trang), encoding='utf-8').read()) if not s.startswith('http')}
ban_do, tong = {}, 0
for p in tep:
    if p.endswith('.html') or os.path.normpath(p) in da_inline:
        continue
    f = os.path.join(GOC, p)
    if not os.path.isfile(f):
        continue
    ext = os.path.splitext(p)[1].lower()
    du_lieu, mime = open(f, 'rb').read(), MIME.get(ext, 'application/octet-stream')
    if ext == '.png' and len(du_lieu) > 150_000:
        im = Image.open(io.BytesIO(du_lieu)); buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=90, method=6); du_lieu, mime = buf.getvalue(), 'image/webp'
    tong += len(du_lieu)
    ban_do['/' + p] = 'data:%s;base64,%s' % (mime, base64.b64encode(du_lieu).decode())

moc = r"""<script>
/* bản nhúng: đường dẫn tương đối của trang → data URI */
(()=>{const M=%s;const G=location.origin+'/%s';
const tim=p=>{p=decodeURIComponent(p);if(M[p])return M[p];const a=p.split('/');for(let i=1;i<a.length;i++){const k='/'+a.slice(i).join('/');if(M[k])return M[k]}return null};
const R=u=>{try{if(typeof u!=='string'||u.startsWith('data:')||u.startsWith('blob:'))return u;const x=new URL(u,'http://g/%s');
if(x.host==='g')return M[decodeURIComponent(x.pathname)]||tim(x.pathname)||u;
const y=new URL(u,location.href);if(y.origin===location.origin||y.protocol==='file:'){
const dir=location.pathname.replace(/[^/]*$/,'');
{const A=dir.split('/').filter(Boolean),B=y.pathname.split('/').filter(Boolean);let i=0;while(i<A.length&&i<B.length-1&&A[i]===B[i])i++;const rel='../'.repeat(A.length-i)+B.slice(i).join('/');const z=new URL(rel,'http://g/%s');const k=decodeURIComponent(z.pathname);if(M[k])return M[k]}
return tim(y.pathname)||u}return u}catch(e){return u}};
const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
Object.defineProperty(HTMLImageElement.prototype,'src',{get(){return d.get.call(this)},set(v){d.set.call(this,R(v))}});
const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(k,v){return sa.call(this,k,(k==='src'||k==='href')?R(v):v)};
const sp=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(k,v,...a){if(typeof v==='string')v=v.replace(/url\(["']?([^"')]+)["']?\)/g,(m,u)=>'url("'+R(u)+'")');return sp.call(this,k,v,...a)};
/* fetch/XHR tới data: bị CSP của artifact chặn (Safari: "Load failed") → tự dựng Response từ base64, không đi mạng */
const DU=d=>{const i=d.indexOf(',');const mime=d.slice(5,d.indexOf(';'));const s=atob(d.slice(i+1));const b=new Uint8Array(s.length);for(let k=0;k<s.length;k++)b[k]=s.charCodeAt(k);return new Response(new Blob([b],{type:mime}),{status:200,headers:{'Content-Type':mime}})};
const f=window.fetch;window.fetch=(u,o)=>{const x=(typeof u==='string')?R(u):(u&&u.url?R(u.url):u);if(typeof x==='string'&&x.startsWith('data:'))return Promise.resolve(DU(x));return f(u,o)};
const xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u,...a){return xo.call(this,m,R(u),...a)};
const A=window.Audio;if(A)window.Audio=function(u){return new A(u===undefined?u:R(u))};
window.__NHUNG_R=R;})();
</script>""" % (json.dumps(ban_do), thu_muc, trang, trang)
if '<meta charset="utf-8">' in html:
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + moc, 1)
else:
    html = moc + html
if not html.lstrip().lower().startswith('<!doctype'):
    html = '<!doctype html>\n' + html
open(os.path.join(GOC, ra), 'w', encoding='utf-8').write(html)
print('%s → %s: %d file nhúng, %.1f MB dữ liệu, file ra %.1f MB' % (trang, ra, len(ban_do), tong / 1e6, os.path.getsize(os.path.join(GOC, ra)) / 1e6))
