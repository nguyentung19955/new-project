"""Ghép GIF ×3 TRƯỚC | SAU từ hai lần quay (quay.py), 17/10 chan-di-danh.
  python3 docs/review/ke-hoach-cai-thien/chan-di-danh/gif.py <quay trước> <quay sau> <thư mục ra> [che-vk,...]
Mỗi GIF (vd chay-thuong.gif): hàng trên = hướng phải, hàng dưới = hướng trái; cột trái = TRƯỚC (?chandon=0), cột phải = SAU.
Cu Tí vẽ cỡ ×1 phóng ×3 (điểm ảnh game → 3 điểm ảnh), vạch đất chạy theo quãng đường thật (÷ cỡ hiển thị 1,2) → chân đứng yên trên vạch =
không trượt. Chữ góc: tên hàng ảnh + khung (+ chân đi / chạy khi ghép). 20 khung / giây (mỗi khung = 3 nhịp logic).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

A, B, OUT = (os.path.abspath(x) for x in sys.argv[1:4])
CHI = sys.argv[4].split(',') if len(sys.argv) > 4 else None
os.makedirs(OUT, exist_ok=True)
W, H, X0, Y0 = 240, 210, 120, 192   # ô cắt (canvas ×3: chân ở 150, 222)
NEN = (52, 58, 70, 255)
BUOC_KHUNG = 3  # mỗi khung GIF = 3 nhịp logic (20 khung / giây) cho nhẹ


def doc(th):
    return json.load(open(os.path.join(th, 'so-lieu.json')))['so']


SA, SB = doc(A), doc(B)


def cell(img, r, nhan):
    c = Image.new('RGBA', (W, H), NEN)
    d = ImageDraw.Draw(c)
    K = r.get('K', 1.2)
    # vạch đất mỗi 12 điểm ảnh thế giới
    yb = Y0 + 2
    d.line([(0, yb), (W, yb)], fill=(90, 98, 112, 255))
    m0 = int((r['x'] - 60 * K) // 12) * 12
    for m in range(m0, int(r['x'] + 60 * K) + 12, 12):
        sx = X0 + (m - r['x']) * 3 / K
        d.line([(sx, yb), (sx, yb + 6)], fill=(150, 160, 175, 255))
    c.alpha_composite(Image.fromarray(img).crop((150 - X0, 222 - Y0, 150 - X0 + W, 222 - Y0 + H)))
    eo = r.get('eo')
    t = '%s %s' % (r.get('ten') or '', '' if r.get('i') is None else r['i'] + 1)
    if eo:
        t += ' +%s%s' % (eo.get('chan') or 'chay', eo['i'] + 1)
    d.text((3, 2), nhan, fill=(255, 215, 120, 255))
    d.text((3, H - 12), t, fill=(220, 225, 235, 255))
    return c


def main():
    nhom = {}
    for ten in SB:
        che, vk, h = ten.split('-')
        nhom.setdefault((che, vk), {})[h] = ten
    for (che, vk), hh in sorted(nhom.items()):
        if CHI and '%s-%s' % (che, vk) not in CHI:
            continue
        ga = {h: np.load(os.path.join(A, t + '.npz'))['gif'] for h, t in hh.items()}
        gb = {h: np.load(os.path.join(B, t + '.npz'))['gif'] for h, t in hh.items()}
        n = min(len(SA[hh['phai']]), len(SB[hh['phai']]), len(SA[hh['trai']]), len(SB[hh['trai']]))
        fr = []
        for k in range(0, n, BUOC_KHUNG):
            cv = Image.new('RGBA', (W * 2 + 4, H * 2 + 4), (20, 22, 28, 255))
            for j, h in enumerate(('phai', 'trai')):
                cv.alpha_composite(cell(ga[h][k], SA[hh[h]][k], 'TRUOC'), (0, j * (H + 4)))
                cv.alpha_composite(cell(gb[h][k], SB[hh[h]][k], 'SAU'), (W + 4, j * (H + 4)))
            fr.append(cv.convert('RGB').quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))
        p = os.path.join(OUT, '%s-%s-x3.gif' % (che, vk))
        fr[0].save(p, save_all=True, append_images=fr[1:], duration=int(1000 * BUOC_KHUNG / 60), loop=0, optimize=True)
        print(p, len(fr), 'khung', os.path.getsize(p) // 1024, 'KB')


if __name__ == '__main__':
    main()
