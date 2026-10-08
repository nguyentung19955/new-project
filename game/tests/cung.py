"""Cung tự ngắm: mỗi kiểu bắn (bắn thường, giữ rồi thả, đòn đặc biệt, kỹ năng bẫy của Thợ Săn) bắn 40 phát vào quái ở
tám hướng, năm cự ly từ sát người tới xa. Quái đứng yên phải trúng từ 90%, quái đi ngang từ 75%, người chơi vừa đi vừa bắn từ 90%.
Chạy: python3 tests/cung.py [-v]   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = [  # (tên, tham số, ngưỡng)
    ('quái đứng yên', {'move': 0}, 0.9),
    ('quái đi ngang', {'move': 45}, 0.75),
    ('quái chạy ngang nhanh (như Nhanh nhẹn)', {'move': 78}, 0.75),
    ('người chơi vừa đi vừa bắn', {'move': 0, 'walk': True}, 0.9),
]
KINDS = [('ban', 'bắn thường'), ('manh', 'giữ rồi thả'), ('dacbiet', 'đòn đặc biệt (mưa tên)'), ('kynang', 'kỹ năng (bẫy của Thợ Săn)')]


def main():
    errs, bad, total = [], 0, 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'cung_lib.js'))
        for kind, kname in KINDS:
            for cname, prm, th in CASES:
                arg = dict(prm, kind=kind)
                r = pg.evaluate('(o) => G.bowProbe(o)', arg)
                rate = r['hit'] / r['n']
                good = rate >= th and r['n'] >= 40
                total += 1
                bad += 0 if good else 1
                print(('ĐẠT ' if good else 'SAI ') + f'{kname}, {cname}: trúng {r["hit"]}/{r["n"]} ({rate*100:.0f}%, cần {th*100:.0f}%)'
                      + (('  trượt: ' + ', '.join(r['miss'][:12])) if r['miss'] and ('-v' in sys.argv or not good) else ''))
        b.close()
    print(f'{total - bad}/{total} mục đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)


main()
