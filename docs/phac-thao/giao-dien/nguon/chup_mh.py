"""Chụp ba tờ màn hình theo chủ đề."""
import os
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
outs = ['chu-de-1-dong-ho.png', 'chu-de-2-trong-dong.png', 'chu-de-3-den-long.png']
with sync_playwright() as p:
    b = p.chromium.launch()
    for k, o in enumerate(outs):
        pg = b.new_page(viewport={'width': 1200, 'height': 800})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + os.path.join(here, 'man-hinh.html') + '?t=%d' % k)
        pg.wait_for_function("document.title === 'ok'", timeout=8000)
        pg.locator('canvas').first.screenshot(path=os.path.join(here, '..', o))
        print(o, 'lỗi:', errs); pg.close()
    b.close()
