#!/usr/bin/env python3
"""Xem thử tấm sprite AI thành GIF trước khi nhập vào game.

Dùng: python3 xem-gif.py <anh.png> --cot 8 --hang 3 [--ten dung,di,chay] [--ms 90] [--ra thu-muc]
- Chia ảnh đều theo cột × hàng, xoá nền trơn (màu lấy ở góc ảnh), xoá đường kẻ lưới,
  căn mọi khung theo CHÂN (đáy hình) và giữa người, để thấy được nhân vật có nhảy/giật cỡ không.
- Mỗi hàng ra 1 GIF phóng to, nền xám tối như trong game, có vạch đất cố định.
- Thêm 1 ảnh tong-quan.png: cả tấm sau khi tách nền.
"""
import argparse, os
from PIL import Image


def mau_gan(a, b, nguong):
    # nền xanh lá: G trội hẳn; nền hồng tím: R và B trội hẳn so với G; còn lại so khoảng cách màu
    if b[1] > 150 and b[0] < 120 and b[2] < 120:
        return a[1] > 120 and a[1] - max(a[0], a[2]) > 60
    if b[0] > 150 and b[2] > 150 and b[1] < 120:
        return a[0] > 120 and a[2] > 120 and min(a[0], a[2]) - a[1] > 60
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= nguong


def bo_manh_lac(o):
    """Giữ mảng hình lớn nhất (và mảng gần nó, ví dụ tia vụn hiệu ứng); bỏ mảnh lấn từ ô bên cạnh."""
    import numpy as np
    from scipy import ndimage
    a = np.array(o)
    m = a[:, :, 3] > 0
    if not m.any():
        return o
    nhan, n = ndimage.label(ndimage.binary_dilation(m, iterations=3))
    if n <= 1:
        return o
    co = ndimage.sum(m, nhan, range(1, n + 1))
    lon = int(np.argmax(co)) + 1
    giu = np.zeros_like(m)
    for i in range(1, n + 1):
        if i == lon or co[i - 1] >= co[lon - 1] * 0.15:
            giu |= nhan == i
    a[:, :, 3] = np.where(giu & m, a[:, :, 3], 0)
    return Image.fromarray(a)


def tach_nen(o, nen, nguong):
    o = o.convert('RGBA')
    px = o.load()
    w, h = o.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            # nền trơn, hoặc nét kẻ lưới mảnh (xám/đen sát mép ô)
            if mau_gan(p, nen, nguong):
                px[x, y] = (0, 0, 0, 0)
    # bỏ dải viền mép ô (đường kẻ lưới thường nằm sát mép)
    m = max(2, min(w, h) // 25)
    for y in range(h):
        for x in range(w):
            if x < m or y < m or x >= w - m or y >= h - m:
                px[x, y] = (0, 0, 0, 0)
    return bo_manh_lac(o)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh')
    ap.add_argument('--cot', type=int, default=8)
    ap.add_argument('--hang', type=int, default=1)
    ap.add_argument('--ten', default='')
    ap.add_argument('--ms', type=int, default=90)
    ap.add_argument('--nguong', type=int, default=120)
    ap.add_argument('--co', type=int, default=256, help='cỡ mỗi khung trong GIF (điểm ảnh)')
    ap.add_argument('--ra', default=None)
    a = ap.parse_args()

    im = Image.open(a.anh).convert('RGB')
    W, H = im.size
    # màu nền = màu nhiều nhất trong ảnh thu nhỏ
    nen = max(im.resize((64, 64)).getcolors(4096))[1]
    ra = a.ra or os.path.splitext(a.anh)[0] + '-gif'
    os.makedirs(ra, exist_ok=True)
    ten = [t.strip() for t in a.ten.split(',')] if a.ten else []
    cw, ch = W / a.cot, H / a.hang

    tong = Image.new('RGBA', (W, H), (40, 44, 52, 255))
    hangs = []
    for r in range(a.hang):
        khung = []
        for c in range(a.cot):
            o = im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)))
            o = tach_nen(o, nen, a.nguong)
            tong.alpha_composite(o, (round(c * cw), round(r * ch)))
            bb = o.getbbox()
            if bb and (bb[2] - bb[0]) * (bb[3] - bb[1]) > o.size[0] * o.size[1] * 0.03:
                khung.append((o, bb))
        hangs.append(khung)
    tong.convert('RGB').save(os.path.join(ra, 'tong-quan.png'))

    for r, khung in enumerate(hangs):
        if not khung:
            continue
        # căn theo chân: đáy hình trùng vạch đất; ngang theo giữa ô (giữ nguyên lệch trong ô như AI vẽ)
        # phóng theo khung bao chung của cả hàng (nhân vật to vừa GIF, cùng một tỉ lệ cho mọi khung)
        S = a.co
        cao = max(bb[3] - bb[1] for _, bb in khung)
        rong = max(bb[2] - bb[0] for _, bb in khung)
        sc = min(S * 0.85 / cao, S * 0.95 / rong)
        anh = []
        for o, bb in khung:
            day = bb[3]
            o = o.crop(bb)
            nho = o.resize((max(1, round(o.size[0] * sc)), max(1, round(o.size[1] * sc))), Image.LANCZOS)
            nen_gif = Image.new('RGBA', (S, S), (40, 44, 52, 255))
            dat = round(S * 0.9)
            for x in range(S):
                nen_gif.putpixel((x, dat), (90, 96, 110, 255))
            nen_gif.alpha_composite(nho, ((S - nho.size[0]) // 2, dat - nho.size[1]))
            anh.append(nen_gif.convert('RGB'))
        t = ten[r] if r < len(ten) else 'hang-%d' % (r + 1)
        p = os.path.join(ra, '%d-%s.gif' % (r + 1, t))
        anh[0].save(p, save_all=True, append_images=anh[1:], duration=a.ms, loop=0)
        print(p, len(anh), 'khung')


if __name__ == '__main__':
    main()
