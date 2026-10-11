"""Đợt 10 (Q5): đo dung lượng và thời gian tải của bản đóng gói. Một lượt Playwright cho mỗi lệnh, không chạy bộ test dài.
Chạy từ thư mục gốc repo:
  python3 docs/review/ke-hoach-cai-thien/dot-10/do.py cỡ  [THƯ_MỤC_GAME]            bảng dung lượng: tệp, JS, ảnh nhúng theo nhóm, gzip -9, brotli 11
  python3 docs/review/ke-hoach-cai-thien/dot-10/do.py tải [THƯ_MỤC_GAME] [lần=2]    thời gian tải ở 1,5 Mbps và 10 Mbps (Chromium giả lập mạng, tệp nén gzip như Firebase Hosting)
  python3 docs/review/ke-hoach-cai-thien/dot-10/do.py tất-cả <tệp ra .json> [THƯ_MỤC_GAME] [lần=2]
Thêm trang=linh-khi-nhe.html để đo bản 2 tệp (python3 game/build.py --hai-tep); mặc định đo linh-khi.html (bản một tệp).
THƯ_MỤC_GAME: thư mục game/ cần đo (mặc định bản đang có; bản trước khi sửa thì dùng một git worktree). Đo trên game/dist đã đóng gói sẵn.
Chỉ đọc tệp, không ghi gì vào game/. Trình duyệt tạm, chơi ?cloud=0, không đụng dữ liệu thật."""
import glob, gzip, http.server, importlib.util, json, os, re, subprocess, sys, threading, time

DAY = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(DAY, '..', '..', '..', '..', 'game'))
TRUM = ('mocTinh', 'nguTinh', 'hoTinh')
RUNG_AI1 = ['heoCon', 'ongVo', 'boHung', 'hoaBaoTu', 'chonBong', 'namPhong', 'socNo', 'nhimDoc']  # 8 quái thường vùng Rừng già (G.MOB_ART cột 0)
TRANG = ([x[6:] for x in sys.argv if x.startswith('trang=')] or ['linh-khi.html'])[0]
B64 = re.compile(r'data:image/png;base64,[A-Za-z0-9+/=]+')


def nhom(t):
    """Nhóm của một tệp sprite (để chia bảng dung lượng)."""
    ma, d = t['ma'], t.get('doi_tuong')
    if d == 'hieu-ung': return 'hiệu ứng (hu-*)'
    if d == 'giao-dien': return 'giao diện, phòng, làng (gd-*)'
    if d == 'ghep': return 'hồ sơ ghép (không ảnh)'
    if d == 'vu-khi': return 'vũ khí dòng 0' if re.match(r'^vk-[a-z]+-0(-|$)', ma) else 'vũ khí dòng 1–9'
    if d == 'trang-phuc': return 'trang phục rời (tp-*)'
    if d == 'vat-pham': return 'vật phẩm (vp-*)'
    if d == 'em-be': return 'em bé thân bộ trang phục' if re.search(r'-(rung|bien|lau)$', ma) else 'em bé 4 thân gốc'
    if d == 'nguoi-lang': return 'người làng (nl-*)'
    if ma.split('-')[0] in TRUM: return 'trùm vùng (3 con + dáng pha)'
    return 'quái vùng ' + {'rung': 'Rừng già', 'bien': 'Hang biển', 'laudai': 'Lâu đài cổ'}.get(t.get('vung'), 'khác')


def brotli(data):
    """brotli mức 11 bằng zlib có sẵn của node (máy không có lệnh brotli)."""
    p = subprocess.run(['node', '-e', "const z=require('zlib');const c=[];process.stdin.on('data',d=>c.push(d)).on('end',()=>{const o=z.brotliCompressSync(Buffer.concat(c),{params:{[z.constants.BROTLI_PARAM_QUALITY]:11,[z.constants.BROTLI_PARAM_LGWIN]:24}});process.stdout.write(String(o.length))})"],
                       input=data, capture_output=True, check=True)
    return int(p.stdout)


def nen(data):
    return {'byte': len(data), 'gzip9': len(gzip.compress(data, 9)), 'brotli11': brotli(data)}


def tep_phu(dist):
    """Tệp ảnh tải sau trong dist (chế độ 2 tệp), theo đúng tên ghi trong trang. Không có: None."""
    with open(os.path.join(dist, TRANG), encoding='utf-8') as f:
        m = re.search(r'\)\.ANH_SAU = (\{.*?\});', f.read())
    return json.loads(m.group(1)) if m else None


def co(game):
    dist = os.path.join(game, 'dist')
    with open(os.path.join(dist, TRANG), 'rb') as f:
        html = f.read()
    txt = html.decode('utf-8')
    kq = {TRANG: nen(html)}
    js = re.search(r'<script>\n(.*)</script>', txt, re.S).group(1)
    m = re.search(r'''\(window\.G = window\.G \|\| \{\}\)(?:\.customSpriteData|\['customSpriteData'\]) = (\[.*?\]);\n''', js, re.S)
    nhung = json.loads(m.group(1)) if m else []
    ma_js = js.replace(m.group(0), '') if m else js
    kq['phần mã JS (46 tệp, không kể ảnh)'] = nen(ma_js.encode('utf-8'))
    kq['phần khung trang (HTML, CSS)'] = nen(txt.replace(js, '').encode('utf-8'))
    kq['phần ảnh nhúng trong ' + TRANG] = dict(nen((m.group(1) if m else '').encode('utf-8')), so_tep=len(nhung))
    sau = tep_phu(dist)
    phu = []
    if sau:
        with open(os.path.join(dist, sau['tep']), 'rb') as f:
            raw = f.read()
        phu = json.loads(raw)
        kq['tệp ảnh tải sau (' + sau['tep'] + ')'] = dict(nen(raw), so_tep=len(phu))
        kq['tổng hai tệp'] = {k: kq[TRANG][k] + kq['tệp ảnh tải sau (' + sau['tep'] + ')'][k] for k in ('byte', 'gzip9', 'brotli11')}
    # theo nhóm: số tệp, cỡ ảnh (chuỗi base64), cỡ cả mục (ảnh + số liệu) như nằm trong bản đóng gói, gzip riêng của nhóm, nằm ở tệp nào
    nh = {}
    for o, noi in [(t, TRANG) for t in nhung] + [(t, 'tệp tải sau') for t in phu]:
        s = json.dumps(o, ensure_ascii=False, separators=(',', ':'))
        g = nh.setdefault(nhom(o), {'so_tep': 0, 'base64': 0, 'ca_muc': 0, '_gop': [], 'noi': set()})
        g['so_tep'] += 1; g['base64'] += sum(len(x) for x in B64.findall(s)); g['ca_muc'] += len(s.encode('utf-8')); g['_gop'].append(s); g['noi'].add(noi)
    for g in nh.values():
        d = '\n'.join(g.pop('_gop')).encode('utf-8'); g['gzip9'] = len(gzip.compress(d, 9)); g['brotli11'] = brotli(d)
        g['tb_moi_tep'] = round(g['ca_muc'] / g['so_tep']); g['noi'] = ' + '.join(sorted(g['noi']))
    kq['ảnh theo nhóm'] = dict(sorted(nh.items(), key=lambda kv: -kv[1]['ca_muc']))
    kq['tổng ảnh (mọi nhóm)'] = {k: sum(g[k] for g in nh.values()) for k in ('so_tep', 'base64', 'ca_muc')}
    kq['các tệp khác trong dist'] = {os.path.basename(p): os.path.getsize(p) for p in sorted(glob.glob(os.path.join(dist, '*'))) if os.path.basename(p) != TRANG}
    return kq


# ---------- máy chủ thử: trả tệp đã nén gzip -9 như Firebase Hosting ----------
class May(http.server.BaseHTTPRequestHandler):
    goc = '.'; nho = {}; chan = None  # chan: biểu thức tên tệp bị trả 404
    protocol_version = 'HTTP/1.1'

    def log_message(self, *a): pass

    def do_GET(self):
        ten = self.path.split('?')[0].lstrip('/') or TRANG
        p = os.path.join(self.goc, os.path.basename(ten))
        if (self.chan and re.search(self.chan, ten)) or not os.path.isfile(p):
            self.send_response(404); self.send_header('Content-Length', '0'); self.end_headers(); return
        if p not in self.nho:
            with open(p, 'rb') as f:
                self.nho[p] = gzip.compress(f.read(), 9)
        d = self.nho[p]
        self.send_response(200)
        self.send_header('Content-Type', 'application/json' if p.endswith('.json') else 'text/html; charset=utf-8')
        self.send_header('Content-Encoding', 'gzip'); self.send_header('Content-Length', str(len(d))); self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        try: self.wfile.write(d)
        except Exception: pass


def mo_may(dist, cong, chan=None):
    H = type('H', (May,), {'goc': dist, 'nho': {}, 'chan': chan})
    s = http.server.ThreadingHTTPServer(('127.0.0.1', cong), H)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


MOC = r"""(() => {
  const m = (window.__m = {}), cho = %s;
  const iv = setInterval(() => {
    const t = Math.round(performance.now()), G = window.G;
    if (m.tai == null && document.getElementById('lk-tai')) m.tai = t;                                   // khối "Đang tải…" đã có trên trang
    if (m.manChao == null && G && G.scene && !document.getElementById('lk-tai')) m.manChao = t;          // game đã vẽ khung hình đầu (màn chào)
    if (m.lang == null && G && G.scene && G.Village && G.scene === G.Village) m.lang = t;                // đã vào làng (sau một lần chạm ở màn chào)
    const SC = G && G.spriteCustom; if (!SC) return;
    const san = Object.keys(SC.ds).filter((k) => SC.ds[k].ready).length + Object.keys(SC.do).filter((k) => SC.do[k].ready).length;
    if (m.quaiRung == null && cho.rung.every((k) => SC.get(k))) m.quaiRung = t;                          // 8 quái thường Rừng già đã có ảnh
    if (m.duAnh == null && san >= cho.du) { m.duAnh = t; }                                               // mọi ảnh quái, em bé, đồ đã sẵn sàng
    m.san = san; if (SC.sau) m.sau = { tt: SC.sau.tt, xong: SC.sau.xong, tong: SC.sau.tong, lan: SC.sau.lan };
  }, 10);
})();"""


def tai_mot(pw, cong, mbps, tre, cho, cho_du=True):
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, service_workers='block')
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(re.compile(r'fonts\.(googleapis|gstatic)\.com'), lambda r: r.abort())  # phông chữ Google bị chặn trong lúc đo (như Đợt 1)
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Network.enable')
    cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': tre, 'downloadThroughput': mbps * 1e6 / 8, 'uploadThroughput': mbps * 1e6 / 16})
    pg.add_init_script(MOC % json.dumps(cho))
    t0 = time.time()
    pg.goto('http://127.0.0.1:%d/%s?cloud=0' % (cong, TRANG), wait_until='commit', timeout=180000)
    pg.wait_for_function('window.__m && __m.manChao != null', timeout=180000)
    pg.wait_for_timeout(120)
    pg.mouse.click(422, 120)  # chạm chỗ trống ở màn chào → vào làng (thao tác đầu tiên của người chơi)
    pg.wait_for_function('__m.lang != null', timeout=20000)
    if cho_du:
        pg.wait_for_function("__m.duAnh != null || (__m.sau && __m.sau.tt === 'loi')", timeout=180000)
    m = pg.evaluate("() => Object.assign({ ve: Object.fromEntries(performance.getEntriesByType('paint').map((e) => [e.name, Math.round(e.startTime)])) }, __m)")
    m['dong_ho_ngoai_s'] = round(time.time() - t0, 2); m['loi_js'] = errs
    b.close()
    return m


def tai(game, lan=2, chan=None, cong=8870):
    from playwright.sync_api import sync_playwright
    dist = os.path.join(game, 'dist')
    spec = importlib.util.spec_from_file_location('lk_build', os.path.join(game, 'build.py')); bd = importlib.util.module_from_spec(spec); spec.loader.exec_module(bd)
    ds = bd.custom_sprites()
    cho = {'rung': RUNG_AI1, 'du': sum(1 for t in ds if t.get('doi_tuong') not in ('hieu-ung', 'ghep', 'giao-dien'))}
    may = mo_may(dist, cong, chan)
    kq = {}
    with sync_playwright() as pw:
        for ten, mbps, tre in (('1,5 Mbps (trễ 150 ms)', 1.5, 150), ('10 Mbps (trễ 40 ms)', 10, 40)):
            cac = [tai_mot(pw, cong, mbps, tre, cho) for _ in range(lan)]
            kq[ten] = cac
            for m in cac:
                print(ten, json.dumps(m, ensure_ascii=False))
    may.shutdown()
    return kq


if __name__ == '__main__':
    lenh = sys.argv[1] if len(sys.argv) > 1 else ''
    a = [x for x in sys.argv[2:] if not x.startswith('lần=') and not x.startswith('trang=')]
    lan = ([int(x[4:]) for x in sys.argv if x.startswith('lần=')] or [2])[0]
    if lenh == 'cỡ':
        print(json.dumps(co(a[0] if a else GAME), ensure_ascii=False, indent=1))
    elif lenh == 'tải':
        tai(a[0] if a else GAME, lan)
    elif lenh == 'tất-cả':
        game = a[1] if len(a) > 1 else GAME
        kq = {'trang': TRANG, 'ban': subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=game, capture_output=True, text=True).stdout.strip(),
              'cach_do': 'Chromium (Playwright) 844×390, ?cloud=0, tệp nén gzip -9 như Firebase Hosting, phông Google bị chặn, không bộ nhớ đệm; mốc tính bằng ms từ lúc bắt đầu mở trang',
              'dung_luong': co(game), 'thoi_gian_tai': tai(game, lan)}
        with open(a[0], 'w', encoding='utf-8') as f:
            json.dump(kq, f, ensure_ascii=False, indent=1)
        print('Đã ghi', a[0])
    else:
        print(__doc__)
