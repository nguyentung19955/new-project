"""Chụp tờ phác thảo: python3 chup.py so-sanh.html ../so-sanh-ba-chu-de.png"""
import sys, os
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 800})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto('file://' + os.path.join(here, src))
    pg.wait_for_timeout(500)
    pg.locator('canvas').first.screenshot(path=os.path.join(here, out))
    print('lỗi:', errs)
    b.close()
