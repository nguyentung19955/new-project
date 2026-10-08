# Dựng các tờ phác thảo thành ảnh PNG.
# Chạy: python3 dung.py 1 2 3 4 sosanh     (không ghi gì thì dựng tất cả)
#       python3 dung.py nhanh 1 [k] [đường dẫn ra]  (bảng xem nhanh khi đang vẽ)
import sys, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
RA = HERE.parent
TEN = {'1': 'huong-1-linh-thu.png', '2': 'huong-2-roi-nuoc.png', '3': 'huong-3-linh-khi-lam-chu.png',
       '4': 'huong-4-mat-na-hoi-lang.png', 'sosanh': 'so-sanh-4-huong.png'}
def chup(pg, q, ra):
    loi = []
    pg.on('pageerror', lambda e: loi.append(str(e)))
    pg.goto((HERE / 'trang.html').as_uri() + '?' + q)
    pg.wait_for_timeout(400)
    if loi: sys.exit('LỖI: ' + '; '.join(loi))
    pg.locator('#to').screenshot(path=str(ra))
    print('đã dựng', ra)
a = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1240, 'height': 900})
    if a and a[0] == 'nhanh':
        k = a[2] if len(a) > 2 else '8'
        chup(pg, 'nhanh=%s&k=%s' % (a[1], k), a[3] if len(a) > 3 else HERE / ('xem-nhanh-%s.png' % a[1]))
    else:
        for t in (a or list(TEN)):
            chup(pg, 'to=' + t, RA / TEN[t])
    b.close()
