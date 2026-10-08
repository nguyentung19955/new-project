# Chụp các tờ phác thảo thành ảnh PNG. Chạy: python3 chup.py [tên tờ ...]
import sys, os
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__))
ALL = ['vung-bien', 'trum-bien-cac-pha', 'vung-rung', 'vung-lau-dai', 'tat-ca-trum', 'truoc-va-sau']
names = sys.argv[1:] or ALL
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={'width': 1760, 'height': 1000})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    for n in names:
        pg.goto('file://' + D + '/to.html?to=' + n)
        pg.wait_for_function("document.title === 'xong'", timeout=20000)
        pg.locator('#to').screenshot(path=os.path.join(D, '..', n + '.png'))
        print(n, 'lỗi:', errs[:3]); errs.clear()
    br.close()
