"""Tự kiểm hở khớp của trang rig trên Chromium headless (tao-rig.py gọi; chạy riêng: python3 kiem_ho.py).

Mở kiem-tra-rig.html, gọi RIG_TEST.all() (mọi động tác × bộ Máy vẽ/Gen × giáp vai Trộn/Theo bắp tay, mỗi cái đo cả 2 chế độ xoay)
→ ghi soat/tu-kiem-dong-tac.json. Trả False (tao-rig.py dừng mã 1) nếu: còn điểm ảnh hở > 0 ở bất kỳ khung nào, trang báo lỗi
với dữ liệu thật, hoặc lỗi JS.
"""
import json, os, sys

RIG = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')


def kiem(in_bang=True):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
        pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        msgs = []
        pg.on('pageerror', lambda e: msgs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=120000)
        allr = pg.evaluate('RIG_TEST.all()')
        errs = pg.evaluate('RIG_TEST.errors')
        acts = pg.evaluate('RIG_TEST.acts()')
        vai = pg.evaluate('RIG_TEST.vai()')
        b.close()
    os.makedirs(os.path.join(RIG, 'soat'), exist_ok=True)
    json.dump({'acts': acts, 'vai': vai, 'all': allr}, open(os.path.join(RIG, 'soat', 'tu-kiem-dong-tac.json'), 'w'), ensure_ascii=False, indent=1)
    bad = []
    if msgs:
        bad.append('lỗi JS: %s' % msgs)
    if errs:
        bad.append('trang báo lỗi: %s' % errs)
    if in_bang:
        print('| Động tác | Khung | Giáp vai | Bộ | Bám liên tục | Bám cả 8 hướng | Rung | Méo | Hở trước → sau |')
        print('|---|---|---|---|---|---|---|---|---|')
    for a in acts:
        for v in ('tron', 'xuong'):
            for sk, r in allr[a['key']][v].items():
                s = r['summary']
                if in_bang:
                    print('| %s | %d | %s | %s | %d/%d | %d/%d | %d | %d | %d → %d |' % (a['name'], a['N'], 'trộn' if v == 'tron' else 'bắp tay', sk,
                                                                     s['bamOk0'], s['frames'], s['bamOk'], s['frames'], s['rung'], s['meo'], s['gapBefore'], s['gapAfter']))
                for g in r['gaps']:
                    bad.append('HỞ: %s · %s · vai %s · khung %d · %s: %d điểm ảnh (liên tục %d, 8 hướng %d) %s' % (
                        a['name'], sk, v, g['frame'], g['at'], g['after'], g['modes'][0], g['modes'][1], g['cells']))
    if bad:
        print('LỖI TỰ KIỂM:', *bad[:60], sep='\n  ')
        return False
    print('tự kiểm: hở = 0 ở mọi khung của %d động tác × 2 bộ × 2 kiểu giáp vai × 2 chế độ xoay' % len(acts))
    return True


if __name__ == '__main__':
    sys.exit(0 if kiem() else 1)
