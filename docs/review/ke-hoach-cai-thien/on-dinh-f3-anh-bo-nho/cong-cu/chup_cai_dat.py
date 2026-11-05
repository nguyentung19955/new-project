"""Chụp Cài đặt › Âm thanh, pin, điều khiển (nút "Hình ảnh") và bảng số ?perf=1 trong ải, hai thứ tiếng. Dùng: python3 chup_cai_dat.py <cổng> <thư mục ra>"""
import os, sys
from playwright.sync_api import sync_playwright
GAME = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..', 'game'))
port = int(sys.argv[1]); ra = sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    for lang in ('vi', 'en'):
        pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=2)
        loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
        pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0&perf=1&lang=%s' % (port, lang))
        pg.wait_for_function('window.G && G.scene && G.villageApi', timeout=120000)
        pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js')); pg.wait_for_timeout(4000)
        pg.evaluate("() => { G.testSave({}); G.setScene(G.Village); if (G.truyen) G.truyen.dang = null; G.villageApi.open('mo'); G.villageApi.V.tab = 'settings'; G.villageApi.V.cd2 = true; }")
        pg.wait_for_timeout(2500); pg.screenshot(path=os.path.join(ra, 'cai-dat-hinh-anh-%s.png' % lang))
        pg.evaluate("G.hieuNang.dat('thap')"); pg.wait_for_timeout(800); pg.screenshot(path=os.path.join(ra, 'cai-dat-hinh-anh-thap-%s.png' % lang))
        pg.evaluate("G.hieuNang.dat('tu')")
        print(lang, 'lỗi JS', loi[:3])
        pg.close()
    b.close()
