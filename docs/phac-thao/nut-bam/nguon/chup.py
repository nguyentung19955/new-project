"""Chụp các tờ phác thảo thành ảnh PNG. Dùng: python3 chup.py to-1.html ../bo-nut.png"""
import sys, os
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1500, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(here, src))
    pg.wait_for_timeout(400)
    pg.locator('body').screenshot(path=os.path.join(here, out))
    print('lỗi:', errs)
    b.close()
