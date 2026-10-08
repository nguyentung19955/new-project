#!/usr/bin/env python3
"""Dựng lại các ảnh phác thảo kiểu phòng.

Cách chạy (từ thư mục gốc của kho):
    python3 docs/phac-thao/phong/ban-2/nguon/dung.py            # dựng tất cả
    python3 docs/phac-thao/phong/ban-2/nguon/dung.py kieu-A     # chỉ dựng một ảnh

Kịch bản mở game/index.html bằng Playwright, nạp các tệp .js cùng thư mục rồi gọi PT.<tên>() để lấy ảnh.
Không sửa gì trong game/.
"""
import base64, pathlib, sys
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OUT = HERE.parent
JOBS = {
    'kieu-A': 'PT.kieuA()', 'kieu-B': 'PT.kieuB()', 'kieu-C': 'PT.kieuC()',
    'so-sanh-kieu-phong': 'PT.soSanh()', 'kieu-A-ba-chu-de': 'PT.baChuDe()', 'trang-thai-cua': 'PT.trangThaiCua()',
}

def main():
    want = sys.argv[1:] or list(JOBS)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name in want:
            pg = b.new_page(viewport={'width': 1440, 'height': 810})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
            pg.goto((ROOT / 'game' / 'index.html').as_uri())
            pg.wait_for_timeout(1000)
            pg.add_script_tag(path=str(ROOT / 'game' / 'tests' / 'bot.js'))
            for js in sorted(HERE.glob('*.js')):
                pg.add_script_tag(path=str(js))
            pg.evaluate('document.fonts.load(\'700 12px Inter\')')
            pg.wait_for_timeout(200)
            url = pg.evaluate('(() => { const cv = %s; return cv.toDataURL("image/png"); })()' % JOBS[name])
            (OUT / (name + '.png')).write_bytes(base64.b64decode(url.split(',', 1)[1]))
            print('đã dựng', name + '.png')
            pg.close()
        b.close()
    if errs:
        print('cảnh báo:', *sorted(set(errs))[:8], sep='\n  ')

if __name__ == '__main__':
    main()
