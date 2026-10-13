"""Cho bot chơi một lượt chiến dịch 15 ải trên bản lưu mới (hệ thống mới, đợt 5) và in chi tiết từng lượt chơi + bảng từng ải.
Bot chơi như người chơi bình thường (tests/cd_lib.py, tests/bot_nang.js): 4 vũ khí cố định (dùng Kiếm + Phi tiêu), nâng bằng linh khí,
lên Mầm chọn hệ hợp vùng, nâng bộ trang phục (linh khí + vàng + mảnh trùm), học kỹ năng / chưởng, mài, nâng lò; Sức mạnh chưa đủ
khuyên dùng thì cày ải cũ (tối đa 8 lượt liền), thua thì cày một lượt rồi thử lại. Game chạy với ?cloud=0.
Nhiều lượt + bảng mục tiêu + đo khuyên dùng: tests/cay.py.

Chạy: python3 tests/campaign.py [hoa|doc|bang] [khuyen|lieu] [--nhanh: chỉ vùng 1]
Thoát mã 1 nếu bị kẹt (không qua nổi một ải sau 220 lượt) hoặc có lỗi trang."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import cd_lib
from cd_lib import ten


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    cay = args[0] if args else 'hoa'
    mode = args[1] if len(args) > 1 else 'khuyen'
    upto = 5 if '--nhanh' in sys.argv else 15
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = cd_lib.open_page(b, errs)
        out, why = cd_lib.campaign(pg, mode, upto, cay)
        b.close()
    o = out or cd_lib.campaign.last
    print('\n'.join(o['log']))
    print(f"\nCây chưởng {cay}, kiểu {mode}: {'xong' if out else why}. Tổng {o['t']/60:.0f} phút, {sum(s['plays'] for s in o['st'])} lần chơi.")
    print('| Ải | Lần chơi | Lượt cày | Thua | Cấp | Sức mạnh / khuyên dùng | Máu còn | Đòn trùm mạnh nhất | Giây lượt thắng | Linh khí / lượt | Vàng / lượt |')
    print('|---|---|---|---|---|---|---|---|---|---|---|')
    for k in range(upto):
        s = o['st'][k]
        if not s['plays']: continue
        print(f"| {ten(k)} | {s['plays']} | {s['grind']} | {s['fails']} | {s['lvl']} | {s['pw']} / {s['rec']} | {'' if s['hp'] is None else '%.0f%%' % (s['hp'] * 100)} | "
              f"{s['bossHit'] * 100:.0f}% | {s['tWin']} | {s['lk'] / s['plays']:.0f} | {s['gold'] / s['plays']:.0f} |")
    print('Mốc (ải đang tới lúc nâng):', ', '.join(f'{k} {v}' for k, v in o['moc'].items()))
    print('Nguồn mất máu:', dict(sorted(o['hurt'].items(), key=lambda kv: -kv[1])))
    if errs:
        print('LỖI TRANG:', errs[:3])
    sys.exit(0 if out and not errs else 1)


main()
