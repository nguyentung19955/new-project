"""Kiểm Đợt 10 (Q5): bản 2 tệp chạy màn chào → làng → ải 1 (bot) khi tệp ảnh tải sau CÓ / KHÔNG CÓ (404) / BỊ CHẶN / NỘI DUNG LẠ / CỤT,
và bản một tệp (như cũ). Một lượt Playwright, không chạy bộ test dài. Trước đó: python3 game/build.py --hai-tep
Chạy từ thư mục gốc repo:
  python3 docs/review/ke-hoach-cai-thien/dot-10/kiem.py            mọi kịch bản → ket-qua-kiem.json + ảnh trong anh/
  python3 docs/review/ke-hoach-cai-thien/dot-10/kiem.py sw         kiểm cùng sw.js: mở lại khi mất mạng vẫn đủ ảnh; tệp ảnh bản cũ được dọn
  python3 docs/review/ke-hoach-cai-thien/dot-10/kiem.py cham       chỉ chụp chỉ báo "Đang tải thêm ảnh" ở mạng 1,5 Mbps (tiếng Việt và tiếng Anh)
Trình duyệt tạm, ?cloud=0, bản lưu thử tự tạo (G.testSave): không đụng dữ liệu thật."""
import gzip, http.server, json, os, re, sys, threading, time
from playwright.sync_api import sync_playwright

DAY = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(DAY, '..', '..', '..', '..', 'game'))
DIST = os.path.join(GAME, 'dist')
ANH = os.path.join(DAY, 'anh')
TEP_ANH = re.compile(r'linh-khi-anh\.[0-9a-f]+\.json')


class May(http.server.BaseHTTPRequestHandler):
    kieu = 'co'  # co | 404 | la (trả trang HTML thay tệp ảnh, như sw.js lúc mất mạng) | cut (tệp cụt còn 40%)
    protocol_version = 'HTTP/1.1'

    def log_message(self, *a): pass

    def do_GET(self):
        ten = os.path.basename(self.path.split('?')[0])
        p = os.path.join(DIST, ten)
        la_anh = bool(TEP_ANH.fullmatch(ten))
        if not os.path.isfile(p) or (la_anh and self.kieu == '404'):
            self.send_response(404); self.send_header('Content-Type', 'text/html'); self.send_header('Content-Length', '9'); self.end_headers(); self.wfile.write(b'Not Found'); return
        if la_anh and self.kieu == 'la': p = os.path.join(DIST, 'linh-khi-nhe.html')
        with open(p, 'rb') as f:
            d = f.read()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json' if p.endswith('.json') else 'text/html; charset=utf-8')
        if la_anh and self.kieu == 'cut': d = d[:int(len(d) * 0.4)]
        else: d = gzip.compress(d, 1); self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(d))); self.send_header('Cache-Control', 'no-cache'); self.end_headers()
        try: self.wfile.write(d)
        except Exception: pass


def mo_may(cong, kieu):
    s = http.server.ThreadingHTTPServer(('127.0.0.1', cong), type('H', (May,), {'kieu': kieu}))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


GIEO = "(() => { let a = 20261011; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"
TT = """() => { const SC = G.spriteCustom, d = (o) => Object.keys(o).filter((k) => o[k].ready).length;
  return { sau: SC.sau ? { tt: SC.sau.tt, xong: SC.sau.xong, tong: SC.sau.tong, lan: SC.sau.lan, loi: SC.sau.loi } : null, quai_embe: d(SC.ds), do: d(SC.do), hieu_ung: d(G.fxAnh.ds), giao_dien: d(SC.gd),
    heoCon: !!SC.get('heoCon'), mocTinh: !!SC.get('mocTinh'), em_be: !!SC.get('em-be-smith'), kiem_ren: !!(SC.do['vk-sword-0'] && SC.do['vk-sword-0'].ready), bua_5: !!(SC.do['vk-hammer-5'] && SC.do['vk-hammer-5'].ready), loi_sprite: SC.loi.slice(0, 5), phien_ban: G.VERSION }; }"""


def kich_ban(pw, ten, trang, kieu, cong, chan=False):
    may = mo_may(cong, kieu)
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs, tin, hong = [], [], []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: tin.append(m.text) if m.text.startswith('[Linh Khí]') else (errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and '404' not in m.text else None))
    pg.on('requestfailed', lambda r: hong.append(os.path.basename(r.url)))
    pg.route(re.compile(r'fonts\.(googleapis|gstatic)\.com'), lambda r: r.abort())
    if chan: pg.route(TEP_ANH, lambda r: r.abort())  # bị chặn: yêu cầu không tới được máy chủ (mất mạng giữa chừng, tường lửa)
    pg.add_init_script(GIEO)
    t0 = time.time()
    pg.goto('http://127.0.0.1:%d/%s?cloud=0' % (cong, trang))
    pg.wait_for_function("window.G && G.scene && !document.getElementById('lk-tai')")
    kq = {'trang': trang, 'tep_anh': kieu if not chan else 'bị chặn', 'man_chao_s': round(time.time() - t0, 2)}
    pg.wait_for_timeout(700)
    pg.screenshot(path=os.path.join(ANH, 'kiem-%s-1-man-chao.png' % ten))
    kq['man_chao'] = pg.evaluate("G.scene === G.Title")
    pg.mouse.click(422, 120)
    pg.wait_for_function("G.scene === G.Village"); pg.wait_for_timeout(900)
    pg.screenshot(path=os.path.join(ANH, 'kiem-%s-2-lang.png' % ten))
    kq['vao_lang'] = True
    # chờ phần tải sau ngã ngũ: xong, hoặc thôi sau 3 lượt (ngay, +3 giây, +10 giây)
    if trang != 'linh-khi.html':
        pg.wait_for_function("['xong', 'loi'].includes(G.spriteCustom.sau.tt)", timeout=60000)
        kq['nga_ngu_sau_s'] = round(time.time() - t0, 1)
        if pg.evaluate("G.spriteCustom.sau.tt") == 'loi':  # dòng báo "Mạng yếu…" hiện 6 giây ở góc
            pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(ANH, 'kiem-%s-2b-thong-bao.png' % ten))
    pg.wait_for_timeout(1200)
    kq['truoc_ai'] = pg.evaluate(TT)
    # ải 1 bằng bot, bản lưu thử, hạt giống cố định (để so kết quả giữa các kịch bản: ảnh có hay không thì luật chơi phải y hệt)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate("() => { G.pointers.clear(); G.testSave({ lvl: 1 }); G.rnd = G.srand(5); G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); G.getRun().fade = 0;\n      for (let i = 0; i < 40 && G.getWorld().ents.filter((e) => !e.dead && e.dying == null && e.inside).length < 2; i++) G.sim(30); // tới lúc có ít nhất 2 quái đã vào sân\n      G.sim(20); G.ui.begin(); G.scene.draw(); }")
    pg.screenshot(path=os.path.join(ANH, 'kiem-%s-3-ai-1.png' % ten))
    r = pg.evaluate("() => { const r = G.botRun(400); G.ui.begin(); G.scene.draw(); return r; }")
    kq['ai_1'] = {k: r.get(k) for k in ('win', 'stars', 't', 'room', 'rooms', 'hp', 'maxhp', 'marks', 'potions')}
    kq['ai_1_day_du'] = json.dumps(r, ensure_ascii=False, sort_keys=True)
    kq['sau_ai'] = pg.evaluate(TT)
    kq['loi_js'] = errs; kq['console_info'] = tin; kq['yeu_cau_hong'] = sorted(set(hong))
    b.close(); may.shutdown()
    return kq


def tat_ca():
    os.makedirs(ANH, exist_ok=True)
    kq = {}
    with sync_playwright() as pw:
        for i, (ten, trang, kieu, chan) in enumerate([
                ('co', 'linh-khi-nhe.html', 'co', False), ('khong-co', 'linh-khi-nhe.html', '404', False), ('bi-chan', 'linh-khi-nhe.html', 'co', True),
                ('noi-dung-la', 'linh-khi-nhe.html', 'la', False), ('cut', 'linh-khi-nhe.html', 'cut', False), ('mot-tep', 'linh-khi.html', 'co', False)]):
            kq[ten] = kich_ban(pw, ten, trang, kieu, 8880 + i, chan)
            k = kq[ten]
            print(ten, '| màn chào', k['man_chao'], '| làng', k['vao_lang'], '| ải 1', k['ai_1'], '| tải sau', k['truoc_ai']['sau'], '| lỗi JS', k['loi_js'])
    goc = kq['mot-tep']['ai_1_day_du']
    for ten, k in kq.items():
        k['ai_1_giong_ban_mot_tep'] = k.pop('ai_1_day_du') == goc
    print('Kết quả ải 1 giống hệt bản một tệp:', {t: k['ai_1_giong_ban_mot_tep'] for t, k in kq.items()})
    with open(os.path.join(DAY, 'ket-qua-kiem.json'), 'w', encoding='utf-8') as f:
        json.dump(kq, f, ensure_ascii=False, indent=1)


def cham():
    """Chụp chỉ báo ở mạng 1,5 Mbps: màn chào, làng, ải 1 (đang tải) rồi lúc tải xong; thêm màn chào tiếng Anh."""
    os.makedirs(ANH, exist_ok=True)
    may = mo_may(8890, 'co')
    with sync_playwright() as pw:
        for ng in ('vi', 'en'):
            b = pw.chromium.launch()
            ctx = b.new_context(viewport={'width': 844, 'height': 390})
            pg = ctx.new_page()
            pg.route(re.compile(r'fonts\.(googleapis|gstatic)\.com'), lambda r: r.abort())
            pg.add_init_script("try { localStorage.setItem('linhkhi_lang', '%s'); } catch (e) {}" % ng)
            cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable')
            cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150, 'downloadThroughput': 1.5e6 / 8, 'uploadThroughput': 0.75e6 / 8})
            pg.goto('http://127.0.0.1:8890/linh-khi-nhe.html?cloud=0', wait_until='commit')
            pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(ANH, 'cham-%s-0-dang-tai-trang.png' % ng))
            pg.wait_for_function("window.G && G.scene && !document.getElementById('lk-tai')", timeout=90000)
            pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(ANH, 'cham-%s-1-man-chao.png' % ng))
            print(ng, 'màn chào', pg.evaluate("JSON.stringify(G.spriteCustom.sau)"))
            if ng == 'vi':
                pg.mouse.click(422, 120); pg.wait_for_function("G.scene === G.Village"); pg.wait_for_timeout(1200)
                pg.screenshot(path=os.path.join(ANH, 'cham-vi-2-lang.png'))
                pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js')); pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
                pg.evaluate("() => { G.pointers.clear(); G.testSave({ lvl: 1 }); G.rnd = G.srand(5); G.startStage(0, 0, 0, { kind: 'A', seed: 3 }); }")
                pg.wait_for_timeout(6000); pg.screenshot(path=os.path.join(ANH, 'cham-vi-3-ai-1-dang-tai.png'))
                print('ải 1 đang tải', pg.evaluate("JSON.stringify(G.spriteCustom.sau)"))
                pg.wait_for_function("G.spriteCustom.sau.tt === 'xong'", timeout=90000); pg.wait_for_timeout(1500)
                pg.screenshot(path=os.path.join(ANH, 'cham-vi-4-ai-1-tai-xong.png'))
            b.close()
    may.shutdown()




def sw():
    """Kiểm cùng sw.js (bản cài lên màn hình chính): dựng thư mục như trên web (index.html = trang nhẹ, tệp ảnh, sw.js) trong thư mục tạm;
    mở lần 1 (sw.js lưu tệp), mở lần 2, rồi NGẮT MẠNG mở lần 3: phải đủ ảnh từ bộ lưu của máy. Tệp ảnh của bản cũ trong bộ lưu phải được dọn."""
    import glob, shutil, subprocess, tempfile
    d = tempfile.mkdtemp()
    shutil.copy(os.path.join(DIST, 'linh-khi-nhe.html'), os.path.join(d, 'index.html'))
    for p in glob.glob(os.path.join(DIST, 'linh-khi-anh.*.json')): shutil.copy(p, d)
    for p in glob.glob(os.path.join(GAME, 'web', '*')): shutil.copy(p, d)
    may = subprocess.Popen([sys.executable, '-m', 'http.server', '8895', '--bind', '127.0.0.1'], cwd=d, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    kq = {}
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}); pg = ctx.new_page()
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.route(re.compile(r'fonts\.(googleapis|gstatic)\.com'), lambda r: r.abort())
            xong = "window.G && G.spriteCustom && ['xong', 'loi'].includes(G.spriteCustom.sau.tt)"
            pg.goto('http://127.0.0.1:8895/?cloud=0'); pg.wait_for_function(xong, timeout=60000)
            pg.wait_for_function("navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true)")
            pg.evaluate("caches.open('linhkhi-v1').then((c) => c.put('/linh-khi-anh.000000000000.json', new Response('[]')))")  # giả tệp ảnh của bản cũ
            pg.reload(); pg.wait_for_function(xong, timeout=60000); pg.wait_for_timeout(1500)
            kq['lan_2_co_mang'] = pg.evaluate(TT)['sau']
            kq['bo_luu_sau_lan_2'] = pg.evaluate("caches.open('linhkhi-v1').then((c) => c.keys()).then((ks) => ks.map((k) => new URL(k.url).pathname).filter((p) => /anh|^\\/$|index/.test(p)))")
            ctx.set_offline(True)
            pg.reload(); pg.wait_for_function(xong, timeout=60000); pg.wait_for_timeout(1500)
            kq['lan_3_mat_mang'] = pg.evaluate(TT)
            kq['loi_js'] = errs
            b.close()
    finally:
        may.terminate(); shutil.rmtree(d, ignore_errors=True)
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    with open(os.path.join(DAY, 'ket-qua-sw.json'), 'w', encoding='utf-8') as f:
        json.dump(kq, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    lenh = sys.argv[1] if len(sys.argv) > 1 else ''
    if lenh == 'cham': cham()
    elif lenh == 'sw': sw()
    else: tat_ca()
