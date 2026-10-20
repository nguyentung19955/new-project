#!/usr/bin/env python3
"""Chụp ảnh demo.build.html (headless Chromium, SwiftShader) ở 1280×720 và 844×390 (iPhone ngang):
đứng, chạy, nhảy, đâm, echo → game/xem-thu/anh/chibi-*.png. Chạy build-demo.py trước."""
import os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.dirname(HERE)
URL = 'file://' + os.path.join(GAME, 'demo.build.html')
OUT = os.path.join(GAME, 'xem-thu', 'anh'); os.makedirs(OUT, exist_ok=True)
ARGS = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader']

def chay(p, w, h, ten, touch):
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=3 if touch else 1, has_touch=touch)
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e))); pg.on('console', lambda m: m.type == 'error' and loi.append(m.text))
    pg.goto(URL); pg.wait_for_function('window.TVDEMO && TVDEMO.ready', timeout=30000)
    print(ten, 'TVDEMO.chibi =', pg.evaluate('JSON.stringify(TVDEMO.chibi)'))
    pg.click('#btn-start'); pg.wait_for_timeout(300)
    def shot(n):
        if touch: pg.evaluate('setMode(true)'); pg.wait_for_timeout(60)
        pg.screenshot(path=os.path.join(OUT, 'chibi-%s-%s.png' % (n, ten)))
    kb = pg.keyboard
    pg.wait_for_timeout(700); shot('dung')
    kb.down('KeyD'); pg.wait_for_timeout(450); shot('chay')
    kb.down('Space'); pg.wait_for_timeout(260); shot('nhay'); kb.up('Space'); kb.up('KeyD')
    pg.wait_for_timeout(900)
    kb.press('KeyX'); pg.wait_for_timeout(110); shot('dam')
    pg.wait_for_timeout(600)
    # Tiếng Vọng: ghi (chạy trái rồi đâm), dừng ghi; Lam đứng yên, bóng phát lại từ chỗ bắt đầu ghi
    kb.press('KeyV'); kb.down('KeyA'); pg.wait_for_timeout(700); kb.up('KeyA'); pg.wait_for_timeout(150); kb.press('KeyX'); pg.wait_for_timeout(350); kb.press('KeyV')
    pg.wait_for_timeout(330); shot('echo')
    b.close()
    if loi: print(ten, 'LỖI:', loi)
    return loi

with sync_playwright() as p:
    l = chay(p, 1280, 720, '1280', False) + chay(p, 844, 390, 'iphone', True)
sys.exit(1 if l else 0)
