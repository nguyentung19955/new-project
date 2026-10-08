#!/usr/bin/env python3
"""Dựng lại các ảnh phác thảo kiểu phòng.

Cách chạy (từ thư mục gốc của kho):
    python3 docs/phac-thao/phong/nguon/dung.py            # dựng tất cả
    python3 docs/phac-thao/phong/nguon/dung.py kieu-A     # chỉ dựng một ảnh

Kịch bản mở trang game thật (game/index.html) bằng Playwright, nạp thêm phong.js và canh.js
(mượn hình hero, quái, đồ vật, hiệu ứng của game), rồi lưu ảnh vào docs/phac-thao/phong/.
Không sửa gì trong game/.
"""
import base64
import os
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.path.abspath(os.path.join(HERE, '..'))
JOBS = {
    'kieu-A': 'Mock.kieuA()',
    'kieu-B': 'Mock.kieuB()',
    'kieu-C': 'Mock.kieuC()',
    'kieu-A-ba-chu-de': 'Mock.baChuDe()',
    'trang-thai-cua': 'Mock.trangThaiCua()',
    'so-sanh-kieu-phong': 'Mock.soSanh()',
}


def main():
    want = sys.argv[1:] or list(JOBS)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1472, 'height': 810})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text else None)
        pg.goto('file://' + os.path.join(ROOT, 'game', 'index.html'))
        pg.wait_for_timeout(1600)  # chờ game khởi động (phông chữ trên mạng có thể không tải được, không sao)
        pg.add_script_tag(path=os.path.join(ROOT, 'game', 'tests', 'setup.js'))
        for f in ('phong.js', 'chu-de.js', 'canh.js', 'ghep.js'):
            path = os.path.join(HERE, f)
            if os.path.exists(path):
                pg.add_script_tag(path=path)
        pg.evaluate('Mock.init()')
        for name in want:
            url = pg.evaluate(JOBS[name])
            data = base64.b64decode(url.split(',', 1)[1])
            with open(os.path.join(OUT, name + '.png'), 'wb') as fh:
                fh.write(data)
            print('đã dựng', name + '.png', len(data), 'byte')
        b.close()
    if errs:
        print('cảnh báo:', errs[:8])


if __name__ == '__main__':
    main()
