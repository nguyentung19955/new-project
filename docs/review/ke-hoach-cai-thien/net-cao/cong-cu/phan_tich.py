"""Gộp số đo nét 2 | 3 | 4 (do_tran.py chạy 3 lần: <goc>/dt-n2, dt-n3, dt-n4) + ảnh cạnh nhau.
Chỉ số:
  NHOE (như do-net)    đo trên canvas thật — LƯU Ý: phóng nguyên lần (×1,5, ×2) tự làm số này nhỏ đi dù hình không nét hơn, nên thêm:
  NHOE_goc             NHOE sau khi gộp các hàng / cột lặp liền nhau (bỏ phần phóng) — so được giữa các nét
  diem_game            số điểm ảnh KHÁC NHAU thật trên mỗi điểm game (hàng không lặp / chiều cao theo điểm game): độ chi tiết thật
  python3 phan_tich.py <goc> <ra thư mục ảnh>"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'do-net', 'cong-cu')))
from chi_so import do
GOC, RA = sys.argv[1], sys.argv[2]
os.makedirs(RA, exist_ok=True)


def gop(a):
    """bỏ hàng / cột giống hệt hàng / cột ngay trước"""
    r = [0] + [y for y in range(1, a.shape[0]) if not np.array_equal(a[y], a[y - 1])]
    a = a[r]
    c = [0] + [x for x in range(1, a.shape[1]) if not np.array_equal(a[:, x], a[:, x - 1])]
    return a[:, c]


kq = {}
for N in (2, 3, 4):
    d = os.path.join(GOC, 'dt-n%d' % N, 'the')
    sl = json.load(open(os.path.join(GOC, 'dt-n%d' % N, 'so-lieu.json')))
    for f in sorted(os.listdir(d)):
        ten = f[:-4]
        a = np.asarray(Image.open(os.path.join(d, f)).convert('RGBA'))
        op = a[..., 3] > 0
        ys = np.nonzero(op.any(1))[0]
        g = gop(a)
        cao_game = (ys.max() - ys.min() + 1) / N
        hang_that = gop(a[ys.min():ys.max() + 1]).shape[0]
        r = {'NHOE': do(Image.fromarray(a))['NHOE'], 'NHOE_goc': do(Image.fromarray(g))['NHOE'], 'diem_game': round(hang_that / cao_game, 2),
             'cao_game': round(cao_game, 1), 'm1280': (sl['hinh'].get(ten, {}).get('m1280') or {}).get('NHOE')}
        lenh = sl['hinh'].get(ten, {}).get('lenh', {})
        r['phong'] = {k.split(' → ')[0][:40]: v['phong'][:3] for k, v in lenh.items() if v['lan']}
        kq.setdefault(ten, {})[N] = r
json.dump(kq, open(os.path.join(RA, 'so-lieu-net.json'), 'w'), ensure_ascii=False, indent=1)
print('| Hình | NHOE gộp lặp n2 / n3 / n4 | điểm thật / điểm game n2 / n3 / n4 |')
print('|---|---|---|')
for ten, v in kq.items():
    if all(n in v for n in (2, 3, 4)):
        print('| %s | %s | %s |' % (ten, ' / '.join('%.1f' % v[n]['NHOE_goc'] for n in (2, 3, 4)), ' / '.join('%.1f' % v[n]['diem_game'] for n in (2, 3, 4))))

# ảnh cạnh nhau: canvas thật phóng về 12 điểm màn / điểm game (n2 ×6, n3 ×4, n4 ×3)
for ten in ('ti-ninja-dung', 'ti-ninja-kiem', 'ti-ninja-chay', 'ti-ninja-spear-chem', 'quai-heoCon', 'quai-nhim'):
    anh = []
    for N in (2, 3, 4):
        p = os.path.join(GOC, 'dt-n%d' % N, 'the', ten + '.png')
        if os.path.exists(p):
            im = Image.open(p).convert('RGBA')
            anh.append((N, im.resize((im.width * 12 // N, im.height * 12 // N), Image.NEAREST)))
    if len(anh) < 3:
        continue
    W = sum(i.width for _, i in anh) + 20 * 4; H = max(i.height for _, i in anh) + 40
    out = Image.new('RGB', (W, H), (40, 40, 48)); dr = ImageDraw.Draw(out); x = 20
    for N, i in anh:
        out.paste(i, (x, 34), i); dr.text((x, 8), 'NET %d' % N, fill=(255, 230, 120)); x += i.width + 20
    out.save(os.path.join(RA, 'canh-nhau-' + ten + '.png'))
