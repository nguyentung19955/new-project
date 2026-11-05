"""Giả lập lỗi mạng / ảnh cho bộ tải ảnh rời (bản web game/dist, phục vụ bằng python3 -m http.server).
Dùng: python3 mo_phong_f3.py <cổng> <kịch bản> ['<cờ thêm>'] [thuong]
Kịch bản:
  404        — 1/7 số ảnh (và zed-vk-gan) trả 404 trong 30 giây đầu; rồi hết lỗi: game cần zed-vk-gan, vào vùng 1, bấm "Thử lại" (roiThuLai)
  cham       — mạng 1,5 Mbps + 150 ms (CDP); đo thời gian ảnh lõi xong, hình đang cần (zed-vk-gan) về sau khi hỏi
  treo-mang  — 12 ảnh: 2 lượt đầu máy chủ không bao giờ trả lời (kết nối treo), lượt sau bình thường
  treo-giai-ma — img.decode() của 30 ảnh không bao giờ trả lời
  anh-hong   — 10 ảnh .webp là rác (200) → phải về bằng PNG; 3 ảnh cả .webp lẫn .png đều rác → hỏng hẳn, hàng không kẹt
  gan        — chặn 4 lượt đầu tới zed-vk-gan (như 22/10), rồi thả; game hỏi gân → phải về
In JSON: kết quả từng mốc + có kẹt hàng không (dang, hàng chờ còn việc mà không ai tải), ảnh cần có về không, lỗi JS.
"""
import json, os, re, sys, time, zlib
from playwright.sync_api import sync_playwright
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
port = int(sys.argv[1]); kb = sys.argv[2]; co = sys.argv[3] if len(sys.argv) > 3 else ''; thuong = len(sys.argv) > 4 and sys.argv[4] == 'thuong'  # thuong: giả máy 8 lõi / 8 GB
TT = r"""(() => { const SC = G.spriteCustom, R = SC.roi, tk = R.thongKe ? R.thongKe() : {}; let ve = 0, cho = 0, hong = 0, dangTai = 0;
  for (const it of R.ds.values()) { if (it.ve) ve++; else if (it.dangTai) dangTai++; else if (R.trangThai && R.trangThai(it.ma) === 'failed') hong++; else if (it.u != null && it.u < 90) cho++; }
  const z = SC.zed['zed-vk-gan'];
  return { ve, cho, hong, dangTai, dang: R.dang(), loiDs: R.loi(), gan: !!(z && z.ready), tt: tk.tt || null, decodeCham: tk.decodeCham, soLoiTai: tk.soLoiTai,
    lyDo: tk.loi ? [...new Set(tk.loi.map((x) => x.ly))] : null, mb: R.boNho ? +R.boNho().mb.toFixed(1) : null }; })()"""
def ten(url): return url.split('/anh/')[1].split('?')[0] if '/anh/' in url else ''
def chon(n, k): return zlib.crc32(n.split('.')[0].encode()) % k == 0
loi = []; kq = {'kich_ban': kb, 'co': co, 'moc': []}
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 844, 'height': 390}); pg = ctx.new_page()
    pg.on('pageerror', lambda e: loi.append(str(e)[:200]))
    if thuong: pg.add_init_script("Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });")
    t0 = time.time(); st = {'n': {}, 'mo': False}
    def moc(ten_moc): d = pg.evaluate(TT); d['moc'] = ten_moc; d['t'] = round(time.time() - t0, 1); kq['moc'].append(d); print(json.dumps(d, ensure_ascii=False)); return d
    if kb == '404':
        def r404(r):
            n = ten(r.request.url)
            if not st['mo'] and (n.startswith('zed-vk-gan.') or (chon(n, 7) and not n.startswith('bia-'))): r.fulfill(status=404, body='not found'); return
            r.continue_()
        pg.route(re.compile(r'/anh/'), r404)
    if kb == 'cham':
        cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable')
        cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150, 'downloadThroughput': 1.5 * 125000, 'uploadThroughput': 60000})
    if kb == 'treo-mang':
        treo = []
        def rtreo(r):
            n = ten(r.request.url); k = n.split('.')[0]
            if chon(n, 40) and not n.startswith('bia-'):
                st['n'][k] = st['n'].get(k, 0) + 1
                if st['n'][k] <= 2: treo.append(r); return  # không bao giờ trả lời
            r.continue_()
        pg.route(re.compile(r'/anh/'), rtreo)
    if kb == 'treo-giai-ma':
        pg.add_init_script(r"""(() => { let n = 0; const goc = Image.prototype.decode; window.__treo = [];
          Image.prototype.decode = function () { const s = String(this.src || ''); if (n < 30 && (s.indexOf('blob:') === 0 || /\/anh\//.test(s))) { n++; window.__treo.push(s.slice(-40)); return new Promise(() => {}); } return goc.apply(this, arguments); }; })()""")
    if kb == 'anh-hong':
        def rhong(r):
            n = ten(r.request.url); k = n.split('.')[0]
            if not n.startswith('bia-') and not n.startswith('truyen-'):
                if chon(k, 60) and (n.endswith('.webp') or n.endswith('.png')): st['n'][k] = 1; r.fulfill(status=200, body=b'rac' * 50, headers={'content-type': 'image/png' if n.endswith('.png') else 'image/webp'}); return
                if chon(k + 'w', 25) and n.endswith('.webp'): st['n'][k] = 2; r.fulfill(status=200, body=b'RIFF' + b'\0' * 60, headers={'content-type': 'image/webp'}); return
            r.continue_()
        pg.route(re.compile(r'/anh/'), rhong)
    if kb == 'gan':
        def rgan(r):
            n = ten(r.request.url)
            if n.startswith('zed-vk-gan.') and st['n'].get('g', 0) < 4: st['n']['g'] = st['n'].get('g', 0) + 1; r.abort(); return
            r.continue_()
        pg.route(re.compile(r'/anh/'), rgan)
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
    pg.wait_for_function('window.G && G.scene && G.spriteCustom && G.spriteCustom.roi', timeout=120000)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate('G.testSave({}); G.setScene(G.Village)')
    if kb == 'cham':
        t1 = time.time(); pg.wait_for_timeout(8000); moc('8 s')
        th = time.time(); pg.evaluate("G.spriteCustom.canAnh('zed-vk-gan')")
        pg.wait_for_function("G.spriteCustom.zed['zed-vk-gan'].ready", timeout=120000); kq['gan_ve_sau_khi_hoi_s'] = round(time.time() - th, 1)
        pg.wait_for_function("(() => { const R = G.spriteCustom.roi; for (const it of R.ds.values()) if (!it.ve && it.u != null && it.u < 4) return false; return true; })()", timeout=400000, polling=1000)
        kq['anh_lang_xong_s'] = round(time.time() - t1, 1); moc('ảnh làng + lõi xong')
    elif kb == '404':
        pg.wait_for_timeout(26000); moc('26 s (đang lỗi 404)')
        st['mo'] = True
        th = time.time(); pg.evaluate("G.spriteCustom.canAnh('zed-vk-gan')")
        try: pg.wait_for_function("G.spriteCustom.zed['zed-vk-gan'].ready", timeout=40000); kq['gan_ve_s'] = round(time.time() - th, 1)
        except Exception: kq['gan_ve_s'] = None
        pg.evaluate("G.spriteCustom.roiThuLai()"); pg.wait_for_timeout(15000); moc('hết lỗi + thử lại 15 s')
        pg.evaluate('G.startStage(0, 4)'); pg.wait_for_function('G.scene === G.StageScene', timeout=120000); pg.wait_for_timeout(4000); moc('vào ải vùng 1')
    elif kb == 'treo-mang':
        pg.wait_for_timeout(20000); moc('20 s'); pg.wait_for_timeout(25000); moc('45 s'); pg.wait_for_timeout(30000); moc('75 s'); kq['so_luot_treo'] = len(treo); kq['anh_bi_treo'] = len(st['n'])
        kq['anh_treo_da_ve'] = pg.evaluate("(ds) => ds.filter((m) => { const it = G.spriteCustom.roi.ds.get(m); return it && it.ve; }).length", list(st['n'].keys()))
        kq['anh_treo_khong_trong_hang'] = pg.evaluate("(ds) => ds.filter((m) => !G.spriteCustom.roi.ds.get(m)).length", list(st['n'].keys()))
    elif kb == 'treo-giai-ma':
        pg.wait_for_timeout(25000); moc('25 s'); kq['so_decode_treo'] = pg.evaluate('window.__treo.length')
        th = time.time(); pg.evaluate("G.spriteCustom.canAnh('zed-vk-gan')"); pg.wait_for_function("G.spriteCustom.zed['zed-vk-gan'].ready", timeout=60000); kq['gan_ve_s'] = round(time.time() - th, 1)
    elif kb == 'anh-hong':
        pg.wait_for_timeout(40000); moc('40 s')
        kq['webp_rac_ve_bang_png'] = pg.evaluate("(ds) => ds.filter((m) => { const it = G.spriteCustom.roi.ds.get(m); return it && it.ve; }).length", [k for k, v in st['n'].items() if v == 2])
        kq['webp_rac'] = sum(1 for v in st['n'].values() if v == 2); kq['rac_ca_hai'] = sum(1 for v in st['n'].values() if v == 1)
    elif kb == 'gan':
        pg.wait_for_timeout(20000); moc('20 s (sau 4 lượt chặn)')
        th = time.time(); pg.evaluate("G.spriteCustom.canAnh('zed-vk-gan')")
        try: pg.wait_for_function("G.spriteCustom.zed['zed-vk-gan'].ready", timeout=40000); kq['gan_ve_s'] = round(time.time() - th, 1)
        except Exception: kq['gan_ve_s'] = None
        moc('sau khi hỏi gân')
    b.close()
kq['loi_js'] = loi[:5]; kq['so_loi_js'] = len(loi)
print('KQ', json.dumps({k: v for k, v in kq.items() if k != 'moc'}, ensure_ascii=False))
