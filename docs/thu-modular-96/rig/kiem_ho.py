"""Tự kiểm hở khớp của trang rig trên Chromium headless (tao-rig.py gọi; chạy riêng: python3 kiem_ho.py).

Mở kiem-tra-rig.html, gọi RIG_TEST.all(): mọi động tác × giáp vai (Trộn / Theo bắp tay) × che theo độ sâu (Tắt / Tách trước-sau /
Che bằng lớp người) × kéo giãn (Kẹp / Không kẹp) × bộ (Máy vẽ / Gen); mỗi tổ hợp đo cả 2 chế độ xoay (liên tục, 8 hướng)
→ ghi soat/tu-kiem-dong-tac.json. Trả False (tao-rig.py dừng mã 1) nếu: còn điểm ảnh hở > 0 ở bất kỳ khung nào của bất kỳ tổ hợp nào,
trang báo lỗi với dữ liệu thật, hoặc lỗi JS.
"""
import json, os, sys

RIG = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
VAI = {'tron': 'trộn', 'xuong': 'bắp tay'}
SAU = {'tat': 'tắt', 'tach': 'tách', 'lop': 'lớp người'}
GIAN = {'kep': 'kẹp', 'tudo': 'không kẹp'}


def kiem(in_bang=True):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
        pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        msgs = []
        pg.on('pageerror', lambda e: msgs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=180000)
        allr = pg.evaluate('RIG_TEST.all()')
        errs = pg.evaluate('RIG_TEST.errors')
        acts = pg.evaluate('RIG_TEST.acts()')
        vai = pg.evaluate('RIG_TEST.vai()')
        gian = pg.evaluate('RIG_TEST.gian()')
        b.close()
    os.makedirs(os.path.join(RIG, 'soat'), exist_ok=True)
    json.dump({'acts': acts, 'vai': vai, 'gian': gian, 'all': allr}, open(os.path.join(RIG, 'soat', 'tu-kiem-dong-tac.json'), 'w'), ensure_ascii=False, indent=1)
    bad = []
    if msgs:
        bad.append('lỗi JS: %s' % msgs)
    if errs:
        bad.append('trang báo lỗi: %s' % errs)
    if in_bang:
        print('| Động tác | Vai | Che | Kéo giãn | Bộ | Bám liên tục | Bám 8 hướng | Méo | Đè sai | Giáp thấy | Hở trước → sau |')
        print('|---|---|---|---|---|---|---|---|---|---|---|')
    n = 0
    for a in acts:
        for key, R in allr[a['key']].items():
            v, d, g = key.split('|')
            for sk, r in R.items():
                n += 1
                s = r['summary']
                if in_bang and v == 'tron':
                    print('| %s | %s | %s | %s | %s | %d/%d | %d/%d | %d | %d | %d | %d → %d |' % (
                        a['name'], VAI[v], SAU[d], GIAN[g], sk, s['bamOk0'], s['frames'], s['bamOk'], s['frames'], s['meo'], s['de'], s['vis'], s['gapBefore'], s['gapAfter']))
                for gp in r['gaps']:
                    bad.append('HỞ: %s · %s · vai %s · che %s · %s · khung %d · %s: %d điểm ảnh (liên tục %d, 8 hướng %d) %s' % (
                        a['name'], sk, VAI[v], SAU[d], GIAN[g], gp['frame'], gp['at'], gp['after'], gp['modes'][0], gp['modes'][1], gp['cells']))
    if bad:
        print('LỖI TỰ KIỂM:', *bad[:60], sep='\n  ')
        return False
    print('tự kiểm: hở = 0 ở mọi khung — %d động tác × 2 kiểu vai × 3 cách che × 2 kéo giãn × 2 bộ = %d tổ hợp, mỗi tổ hợp 2 chế độ xoay' % (len(acts), n))
    return True


if __name__ == '__main__':
    sys.exit(0 if kiem() else 1)
