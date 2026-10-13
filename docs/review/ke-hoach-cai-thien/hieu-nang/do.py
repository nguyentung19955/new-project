"""ĐO HIỆU NĂNG (phiên hieu-nang, 13/10). CHỈ ĐO, không phải bài kiểm chức năng, không sửa game.

Giả lập điện thoại: khung 844x390, mật độ điểm ảnh 3, chạm, CPU chậm 4 lần (CDP). Chromium có sẵn ở /opt/pw-browsers
(KHÔNG chạy "playwright install"). Mọi trang mở với ?cloud=0 (không đụng Firebase); phông Google bị chặn để số đo không phụ thuộc mạng ngoài
(game tự dùng phông máy sau khi tệp phông lỗi, đúng như khi mạng chặn Google).

Cần đóng gói trước:  cd game && LK_HAI_TEP=1 python3 build.py   (có dist/linh-khi.html, dist/linh-khi-nhe.html, dist/anh/)
Chạy:  python3 docs/review/ke-hoach-cai-thien/hieu-nang/do.py <nhãn> [tai|fps|hoso|tat-ca] [giây đo mỗi cảnh, mặc định 15]
       python3 docs/review/ke-hoach-cai-thien/hieu-nang/do.py so-sanh <thư mục dist bản trước> [số vòng] [giây]  (đo xen kẽ trước/sau)
Ghi:   docs/review/ke-hoach-cai-thien/hieu-nang/so-do-<nhãn>.json

  tai   : tải trang đầu (bản hai tệp linh-khi-nhe.html + ảnh rời, bản một tệp linh-khi.html), mạng giả 4G 10 Mbit/s, trễ 70 ms,
          và không giới hạn mạng; đo byte tải, số ảnh tải sau, mốc khung hình đầu / màn chào / hình làng xong / mọi ảnh xong.
  fps   : 4 cảnh (màn chào, làng có đi lại, ải thường vùng 1 bot tự chơi, trận đông quái vùng 3 + Thức tỉnh + mưa phi tiêu + chạy chém):
          khoảng cách giữa các khung, thời gian JS của mỗi khung, khung chậm, đỉnh bộ nhớ JS, rác mỗi giây.
  hoso  : hồ sơ CPU trận đông quái (10 hàm tốn nhất, quy về ms mỗi khung) + đếm số canvas / ảnh / getImageData tạo ra mỗi khung.
"""
import gzip, http.server, json, os, socketserver, statistics, sys, threading, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
DIST = os.environ.get('LK_DIST') or os.path.join(REPO, 'game', 'dist')  # LK_DIST: đo một bản đóng gói khác (ví dụ bản trước khi sửa)
BOT = os.path.join(REPO, 'game', 'tests', 'bot.js')
SETUPJS = os.path.join(REPO, 'game', 'tests', 'setup.js')
PHONE = dict(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
CPU = 4
MANG_4G = {'offline': False, 'latency': 70, 'downloadThroughput': 10_000_000 / 8, 'uploadThroughput': 3_000_000 / 8}
PORT = 8765
PHONG_CO = os.environ.get('LK_PHONG') == 'co'  # LK_PHONG=co: tệp CSS phông Google trả về ngay (mặc định: bị chặn)


# ---------- máy chủ tĩnh có gzip cho html/js/json (giống Firebase Hosting) ----------
class H(http.server.SimpleHTTPRequestHandler):
    cache = {}

    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIST, **k)

    def log_message(self, *a):
        pass

    def do_GET(self):
        p = self.path.split('?')[0]
        f = os.path.join(DIST, p.lstrip('/'))
        if p.endswith(('.html', '.js', '.json')) and os.path.isfile(f) and 'gzip' in self.headers.get('Accept-Encoding', ''):
            k = (f, os.path.getmtime(f))
            if k not in H.cache:
                with open(f, 'rb') as fh:
                    H.cache[k] = gzip.compress(fh.read(), 6)
            b = H.cache[k]
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8' if p.endswith('.html') else 'application/json')
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(b)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(b)
            return
        return super().do_GET()


def server():
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    s = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), H)
    s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


BASE = 'http://127.0.0.1:%d/' % PORT

# Mốc thời gian trong trang (cài trước mọi mã game). Chỉ đọc, không đổi gì của game.
INIT = r"""
(() => {
  window.__moc = {};
  const moc = (k) => { if (window.__moc[k] == null) window.__moc[k] = Math.round(performance.now()); };
  let thay = false; // màn hình tải đã có trong trang rồi mới bị gỡ (khung hình đầu đã vẽ, js/engine.js)
  new MutationObserver(() => { const el = document.getElementById('lk-tai'); if (el) thay = true; else if (thay) moc('khung_dau'); })
    .observe(document, { childList: true, subtree: true });
  const t = setInterval(() => {
    const G = window.G;
    if (!G) return;
    if (G.scene && G.Title && G.scene === G.Title) moc('man_chao');
    const SC = G.spriteCustom;
    if (SC && SC.roi && SC.roi.ds && SC.roi.ds.size) {
      let b0 = 0, b0x = 0;
      for (const it of SC.roi.ds.values()) if (it.bac === 0) { b0++; if (it.ve) b0x++; }
      if (b0 && b0x === b0) moc('anh_lang_xong');
      if (SC.sau && SC.sau.tt === 'xong') { moc('moi_anh_xong'); clearInterval(t); }
    } else if (SC && window.__moc.man_chao != null && !G.ANH_ROI) {
      // bản một tệp: ảnh nhúng sẵn, coi là xong khi mọi <img> của game đã giải mã
      const ds = window.__imgs || [];
      if (ds.length && ds.every((i) => i.complete)) { moc('anh_lang_xong'); moc('moi_anh_xong'); clearInterval(t); }
    }
  }, 20);
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  window.__imgs = [];
  Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, get() { return d.get.call(this); },
    set(v) { window.__imgs.push(this); return d.set.call(this, v); } });
})();
"""

# Đo khung: khoảng cách giữa các lần gọi rAF và thời gian chạy hàm frame của engine (bọc requestAnimationFrame).
INIT_KHUNG = r"""
(() => {
  window.__ft = []; window.__work = []; window.__heap = []; window.__do = false;
  const raf = window.requestAnimationFrame.bind(window);
  let last = 0;
  window.requestAnimationFrame = (cb) => raf((ts) => {
    if (cb && cb.name === 'frame') {
      const t0 = performance.now();
      cb(ts);
      if (window.__do) { window.__work.push(performance.now() - t0); if (last) window.__ft.push(ts - last); }
      last = ts;
    } else cb(ts);
  });
  setInterval(() => { if (window.__do && performance.memory) window.__heap.push([performance.now(), performance.memory.usedJSHeapSize]); }, 250);
})();
"""

# Đếm thứ được tạo / gọi mỗi khung (chỉ dùng ở lượt hồ sơ, vì bọc hàm làm chậm đi một chút).
INIT_DEM = r"""
(() => {
  const noi = window.__noi = {};
  const ghiNoi = (k) => { const st = (new Error().stack || '').split('\n')[3] || ''; const m = /:(\d+):\d+\)?$/.exec(st); const key = k + '@' + (m ? m[1] : '?'); noi[key] = (noi[key] || 0) + 1; };
  const D = window.__dem = { canvas: 0, offscreen: 0, image: 0, getImageData: 0, putImageData: 0, toDataURL: 0, createPattern: 0, gradient: 0, filter: 0, khung: 0 };
  const ce = Document.prototype.createElement;
  Document.prototype.createElement = function (n) { if (String(n).toLowerCase() === 'canvas') { D.canvas++; ghiNoi('canvas'); } return ce.apply(this, arguments); };
  if (window.OffscreenCanvas) { const O = window.OffscreenCanvas; window.OffscreenCanvas = function (w, h) { D.offscreen++; return new O(w, h); }; window.OffscreenCanvas.prototype = O.prototype; }
  const n0 = (window.__imgs || []).length; Object.defineProperty(D, 'image', { enumerable: true, get: () => (window.__imgs || []).length - n0 - (D._i0 || 0), set: (v) => { D._i0 = (window.__imgs || []).length - n0; } }); // ảnh mới gán src (không bọc hàm Image: bọc làm sai đường vẽ)
  for (const C of [CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D].filter(Boolean)) {
    const P = C.prototype;
    for (const k of ['getImageData', 'putImageData', 'createPattern']) { const f = P[k]; P[k] = function () { D[k]++; ghiNoi(k); return f.apply(this, arguments); }; }
    for (const k of ['createLinearGradient', 'createRadialGradient']) { const f = P[k]; P[k] = function () { D.gradient++; return f.apply(this, arguments); }; }
    const fd = Object.getOwnPropertyDescriptor(P, 'filter');
    if (fd && fd.set) Object.defineProperty(P, 'filter', { configurable: true, get() { return fd.get.call(this); }, set(v) { if (v && v !== 'none') { D.filter++; ghiNoi('filter'); } fd.set.call(this, v); } });
  }
  const td = HTMLCanvasElement.prototype.toDataURL; HTMLCanvasElement.prototype.toDataURL = function () { D.toDataURL++; return td.apply(this, arguments); };
})();
"""


def tk(ft):
    ft = sorted(ft)
    n = len(ft)
    if not n:
        return {}
    q = lambda p: round(ft[min(n - 1, int(p * n))], 2)
    return {'n': n, 'tb': round(sum(ft) / n, 2), 'p50': q(0.5), 'p95': q(0.95), 'p99': q(0.99), 'max': round(ft[-1], 1)}


def mo_trang(p, url, cpu=1, mang=None, them=()):
    b = p.chromium.launch(args=['--enable-precise-memory-info'])
    ctx = b.new_context(**PHONE)
    def tuyen(r):
        u = r.request.url
        if u.startswith(BASE) or u.startswith('data:'):
            return r.continue_()
        if PHONG_CO and u.startswith('https://fonts.googleapis.com/'):  # giả lập mạng tải được tệp CSS phông ngay (nội dung rỗng)
            return r.fulfill(status=200, content_type='text/css', body='')
        return r.abort()
    ctx.route('**/*', tuyen)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    for s in (INIT,) + tuple(them):
        pg.add_init_script(s)
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Network.enable')
    cdp.send('Network.setCacheDisabled', {'cacheDisabled': True})
    if mang:
        cdp.send('Network.emulateNetworkConditions', mang)
    if cpu > 1:
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': cpu})
    return b, pg, cdp, errs


# ---------- 1. tải trang ----------
def mot_lan_tai(p, ten, mang):
    reqs = {}
    b, pg, cdp, errs = mo_trang(p, None, CPU, mang)
    cdp.on('Network.requestWillBeSent', lambda e: reqs.setdefault(e['requestId'], {'url': e['request']['url'], 't0': e['timestamp']}))
    cdp.on('Network.loadingFinished', lambda e: reqs.get(e['requestId'], {}).update({'byte': e['encodedDataLength'], 't1': e['timestamp']}))
    t0 = time.time()
    pg.goto(BASE + ten + '?cloud=0', wait_until='commit')
    pg.wait_for_function('window.__moc && window.__moc.moi_anh_xong != null', timeout=180000, polling=200)
    moc = pg.evaluate('window.__moc')
    nav = pg.evaluate("(() => { const n = performance.getEntriesByType('navigation')[0]; return { html_xong: Math.round(n.responseEnd), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) }; })()")
    pg.wait_for_timeout(300)
    b.close()
    anh = [r for r in reqs.values() if '/anh/' in r['url']]
    trang = [r for r in reqs.values() if r['url'].split('?')[0].endswith('.html')]
    return dict(nav, **moc, byte_tong=sum(r.get('byte', 0) for r in reqs.values()), byte_trang=sum(r.get('byte', 0) for r in trang),
                so_anh_tai_sau=len(anh), byte_anh=sum(r.get('byte', 0) for r in anh), loi=errs[:3])


def do_tai(p, lan=3):
    out = {}
    for ten, nhan in (('linh-khi-nhe.html', 'hai_tep'), ('linh-khi.html', 'mot_tep')):
        for mn, mang in (('4g', MANG_4G), ('khong_gioi_han', None)):
            ds = [mot_lan_tai(p, ten, mang) for _ in range(lan)]
            gop = {k: (statistics.median([d[k] for d in ds]) if isinstance(ds[0][k], (int, float)) else ds[0][k]) for k in ds[0]}
            gop['lan'] = lan
            out[nhan + '_' + mn] = gop
            print('tải', nhan, mn, json.dumps(gop, ensure_ascii=False), flush=True)
    return out


# ---------- 2. FPS các cảnh ----------
CANH = {
    'man_chao': r"""() => { G.setScene(G.Title); return true; }""",
    'lang': r"""() => {
      G.testSave({ hero: 'smith', melee: 'sword', lvl: 12, branch: 'fire', marksMoi: G.MARKS[1] });
      G.save.stars = { '0-0': 3, '0-1': 3, '0-2': 3, '0-3': 3, '0-4': 3 };
      G.setScene(G.Village);
      const V = G.villageApi.V; V.tab = 'hub';
      const S = G.villageScene.state; const diem = [[150, 190], [600, 175], [360, 215], [80, 170]]; let i = 0;
      setInterval(() => { if (!S.path) { S.path = [diem[i % 4].slice()]; i++; } }, 100);
      return true; }""",
    'ai_thuong': r"""() => {
      G.testSave({ hero: 'smith', melee: 'sword', lvl: 6, branch: 'fire', marksMoi: G.MARKS[0] });
      G.startStage(0, 1, 0, { kind: 'A', seed: 777 });
      const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
      setInterval(() => { const S = G.getRun(); if (S && S.P) S.P.hp = S.P.maxhp; if (S && (S.mode === 'result' || S.mode === 'dead')) { G.startStage(0, 1, 0, { kind: 'A', seed: 777 }); } }, 500);
      return true; }""",
    'tran_dong': r"""() => {
      G.testSave({ hero: 'smith', melee: 'sword', lvl: 30, branch: 'fire', marksMoi: G.MARKS[2] + 50 });
      G.startStage(2, 2, 0, { kind: 'A', seed: 4242 });
      const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null;
      G.testGoto('fight');
      const W = S.W; W.waves = []; W.spawns = [];
      Object.assign(G.botCfg, { explore: false, props: false });
      const roles = ['rusher', 'swarm', 'shield', 'kami', 'nimble', 'bomber', 'archer', 'spiky', 'elite'];
      let k = 0;
      setInterval(() => {
        const S = G.getRun(); if (!S || G.scene !== G.StageScene) return;
        const W = S.W, P = S.P; if (S.mode !== 'play') S.mode = 'play';
        const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
        for (let i = W.ents.length; i < 18; i++, k++) { const e = G.spawnEnemy(roles[k % roles.length], W.x0 + 10 + (k * 53) % rw, W.y0 + 20 + (k * 37) % rh, { hpMult: 6 }); e.inside = true; }
        P.hp = P.maxhp; P.mana = Math.max(P.mana, P.specCost || 30); W.over = null;
      }, 250);
      // bot tự chạy chém; thêm: cứ ~1,2 giây ra đòn Đặc biệt (kiếm: Trảm Nguyệt; phi tiêu: mưa phi tiêu), ~3 giây đổi vũ khí
      const g0 = G.botInput; let n = 0;
      G.botInput = function (S) { const inp = g0(S); n++; if (n % 72 === 0) inp.specialP = true; if (n % 180 === 90) inp.swapP = true; return inp; };
      return true; }""",
}


def do_canh(p, ten, giay, them=(), hoso=False):
    b, pg, cdp, errs = mo_trang(p, None, 1, None, (INIT_KHUNG,) + tuple(them))
    pg.goto(BASE + 'linh-khi-nhe.html?cloud=0')
    pg.wait_for_function('window.__moc && window.__moc.moi_anh_xong != null', timeout=180000, polling=250)
    pg.add_script_tag(path=BOT)
    pg.add_script_tag(path=SETUPJS)
    pg.evaluate(CANH[ten])
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': CPU})
    pg.wait_for_timeout(3000)
    cdp.send('HeapProfiler.collectGarbage')
    pg.evaluate("() => { window.__ft = []; window.__work = []; window.__heap = []; if (window.__dem) for (const k in window.__dem) window.__dem[k] = 0; if (window.__noi) for (const k in window.__noi) delete window.__noi[k]; window.__do = true; }")
    prof = None
    if hoso:
        cdp.send('Profiler.enable')
        cdp.send('Profiler.setSamplingInterval', {'interval': 200})
        cdp.send('Profiler.start')
    pg.wait_for_timeout(giay * 1000)
    if hoso:
        prof = cdp.send('Profiler.stop')['profile']
    r = pg.evaluate("() => { window.__do = false; const W = G.getWorld && G.getWorld(); return { ft: window.__ft, work: window.__work, heap: window.__heap, dem: window.__dem || null, noi: window.__noi || null,"
                    " ents: W && W.ents ? W.ents.length : null, hat: G.fx && G.fx.stats ? G.fx.stats() : null }; }")
    src = None
    b.close()
    ft, work, heap = r['ft'], r['work'], r['heap']
    dur = (heap[-1][0] - heap[0][0]) / 1000 if len(heap) > 2 else giay
    up = sum(max(0, heap[i][1] - heap[i - 1][1]) for i in range(1, len(heap)))
    out = {'fps': round(1000 * len(ft) / sum(ft), 1) if ft else 0, 'khoang_cach_ms': tk(ft), 'js_moi_khung_ms': tk(work),
           'khung_cham_33ms': sum(1 for x in ft if x > 33.4), 'khung_cham_50ms': sum(1 for x in ft if x > 50),
           'dinh_heap_MB': round(max(h[1] for h in heap) / 1e6, 1) if heap else None, 'rac_MB_moi_giay': round(up / dur / 1e6, 2),
           'quai': r['ents'], 'loi': errs[:3]}
    if r['dem'] and ft:
        out['moi_khung'] = {k: round(v / len(work), 3) for k, v in r['dem'].items() if k not in ('khung', '_i0')}
        tep = ban_do_dong()
        out['noi_tao'] = sorted([[k.split('@')[0] + ' @ ' + (tep(int(k.split('@')[1]) - 1) if k.split('@')[1].isdigit() else '?'), round(v / len(work), 3)] for k, v in r['noi'].items()], key=lambda x: -x[1])[:20]
    if prof:
        out['top_ham'] = top_ham(prof, src, len(work))
    return out


def ban_do_dong():
    """Dòng trong dist/linh-khi-nhe.html → 'js/tệp.js:dòng' theo dấu "// ===== js/x.js =====" của bản gộp."""
    import re, bisect
    moc = []
    with open(os.path.join(DIST, 'linh-khi-nhe.html'), encoding='utf-8') as fh:
        for i, l in enumerate(fh):
            m = re.match(r'// ===== (js/[\w.]+) =====', l)
            if m:
                moc.append((i, m.group(1)))
    keys = [m[0] for m in moc]

    def tep(line):
        j = bisect.bisect_right(keys, line) - 1
        return '%s:%d' % (moc[j][1], line - moc[j][0]) if j >= 0 else '?:%d' % line
    return tep


def top_ham(prof, html, so_khung):
    """Thời gian TỰ THÂN theo hàm (ms mỗi khung) và thời gian gồm cả lệnh vẽ của trình duyệt mà hàm JS gọi (drawImage, getImageData…
    tính cho hàm JS gần nhất gọi nó)."""
    tep = ban_do_dong()
    nodes = {n['id']: n for n in prof['nodes']}
    cha = {}
    for n in prof['nodes']:
        for c in n.get('children', []):
            cha[c] = n['id']

    def ten(n):
        cf = n['callFrame']
        if cf['url'] and 'linh-khi' in cf['url']:
            return (cf['functionName'] or '(vô danh)') + ' @ ' + tep(cf['lineNumber'])
        return None
    self_us, gan_us = {}, {}
    dt = prof['timeDeltas']
    for i, sid in enumerate(prof['samples']):
        d = dt[i + 1] if i + 1 < len(dt) else 0
        n = nodes[sid]
        k = ten(n) or (n['callFrame']['functionName'] or n['callFrame']['url'].split('/')[-1] or '?')
        self_us[k] = self_us.get(k, 0) + d
        # gán lệnh gốc của trình duyệt cho hàm JS gần nhất
        j, kg = sid, None
        while j is not None:
            kg = ten(nodes[j])
            if kg:
                break
            j = cha.get(j)
        kg = kg or k
        gan_us[kg] = gan_us.get(kg, 0) + d
    tong = sum(self_us.values())
    f = lambda ds: [[k, round(v / 1000 / max(1, so_khung), 3), round(100 * v / tong, 1)] for k, v in sorted(ds.items(), key=lambda x: -x[1])[:25]]
    return {'tong_ms_moi_khung': round(tong / 1000 / max(1, so_khung), 2), 'ham': f(self_us), 'ham_gom_lenh_ve': f(gan_us)}


def so_sanh(dist_truoc, vong=2, giay=15):
    """Đo xen kẽ bản TRƯỚC (thư mục dist_truoc) và bản SAU (game/dist) nhiều vòng trên cùng máy, để nhiễu của máy kiểm tra chia đều
    cho hai bên. Ghi so-do-truoc.json / so-do-sau.json (khoá 'tai', 'fps'; giữ các khoá khác đã có, ví dụ hồ sơ CPU)."""
    global DIST
    goc = DIST
    bo = {'truoc': dist_truoc, 'sau': goc}
    kq = {k: {'tai': [], 'fps': {}} for k in bo}
    s = server()
    with sync_playwright() as p:
        for v in range(vong):
            for nhan, d in (bo.items() if v % 2 == 0 else reversed(list(bo.items()))):
                DIST = d
                kq[nhan]['tai'].append(do_tai(p, 1))
                for ten in ('man_chao', 'lang', 'ai_thuong', 'tran_dong'):
                    kq[nhan]['fps'].setdefault(ten, []).append(do_canh(p, ten, giay))
                    print(v, nhan, ten, json.dumps(kq[nhan]['fps'][ten][-1], ensure_ascii=False)[:300], flush=True)
    DIST = goc
    s.shutdown()

    def gop(ds):  # trung bình các vòng cho số, giữ cấu trúc
        if isinstance(ds[0], dict):
            return {k: gop([d[k] for d in ds]) for k in ds[0] if all(k in d for d in ds)}
        if isinstance(ds[0], (int, float)) and not isinstance(ds[0], bool):
            return round(sum(ds) / len(ds), 2)
        return ds[0]
    for nhan in bo:
        f = os.path.join(HERE, 'so-do-%s.json' % nhan)
        res = json.load(open(f)) if os.path.isfile(f) else {}
        res['tai'] = gop(kq[nhan]['tai'])
        res['fps'] = {ten: gop(ds) for ten, ds in kq[nhan]['fps'].items()}
        res['vong_xen_ke'] = vong
        with open(f, 'w', encoding='utf-8') as fo:
            json.dump(res, fo, ensure_ascii=False, indent=1)
        print('ghi', f)


def main():
    if len(sys.argv) > 2 and sys.argv[1] == 'so-sanh':
        return so_sanh(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 2, int(sys.argv[4]) if len(sys.argv) > 4 else 15)
    nhan = sys.argv[1] if len(sys.argv) > 1 else 'thu'
    viec = sys.argv[2] if len(sys.argv) > 2 else 'tat-ca'
    giay = int(sys.argv[3]) if len(sys.argv) > 3 else 15
    f = os.path.join(HERE, 'so-do-%s.json' % nhan)
    res = json.load(open(f)) if os.path.isfile(f) else {}
    s = server()
    with sync_playwright() as p:
        if viec in ('tai', 'tat-ca'):
            res['tai'] = do_tai(p)
        if viec in ('fps', 'tat-ca'):
            res['fps'] = {}
            for ten in ('man_chao', 'lang', 'ai_thuong', 'tran_dong'):
                res['fps'][ten] = do_canh(p, ten, giay)
                print('fps', ten, json.dumps(res['fps'][ten], ensure_ascii=False), flush=True)
        if viec.startswith('canh:'):
            ten = viec[5:]
            res.setdefault('fps', {})[ten] = do_canh(p, ten, giay)
            print('fps', ten, json.dumps(res['fps'][ten], ensure_ascii=False), flush=True)
        if viec == 'hoso-nhanh':
            res['hoso_tran_dong'] = do_canh(p, 'tran_dong', giay, hoso=True)
            res['dem_tran_dong'] = do_canh(p, 'tran_dong', max(5, giay // 2), them=(INIT_DEM,))
            for k in ('hoso_tran_dong', 'dem_tran_dong'):
                print(k, json.dumps(res[k], ensure_ascii=False), flush=True)
        if viec in ('hoso', 'tat-ca'):
            res['hoso_tran_dong'] = do_canh(p, 'tran_dong', giay, hoso=True)
            res['dem_tran_dong'] = do_canh(p, 'tran_dong', max(5, giay // 2), them=(INIT_DEM,))
            res['hoso_lang'] = do_canh(p, 'lang', giay, hoso=True)
            for k in ('hoso_tran_dong', 'dem_tran_dong', 'hoso_lang'):
                print(k, json.dumps(res[k], ensure_ascii=False)[:3000], flush=True)
    s.shutdown()
    with open(f, 'w', encoding='utf-8') as fo:
        json.dump(res, fo, ensure_ascii=False, indent=1)
    print('ghi', f)


if __name__ == '__main__':
    main()
