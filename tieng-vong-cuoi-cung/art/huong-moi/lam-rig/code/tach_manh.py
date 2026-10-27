"""Bước 1: tách 13 mảnh từ bảng mảnh (nền trắng) → ../manh/goc/<ten>.png (RGBA, cỡ gốc bảng mảnh).
Nền = vùng trắng nối mép ảnh (flood-fill) + lỗ trắng kín bao bởi nét mực (vd. lòng quai dây chuông);
mỗi connected component là một mảnh; viền sát nền được khử trắng (unmix) → alpha mềm, không quầng trắng.
Nhận mảnh theo vị trí trên bảng (bố cục của ảnh gen)."""
import os
import numpy as np
from PIL import Image
from chung import SRC_BANG, MANH, load_rgb, background, unmix_white, components, luu_json

PAD = 4


def ten_theo_vi_tri(x0, y0, x1, y1):
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if cy < 700:
        return 'mu' if cx < 500 else ('chop' if cx < 760 else 'than')
    if cy < 1080:
        return 'vat-truoc' if cx < 360 else ('vat-sau' if cx < 760 else 'ao-vai')
    if cx < 170:
        return 'gang-gan'
    if cx < 320:
        return 'gang-xa'
    if cx < 450:
        return 'ung-gan'      # mũi ủng lớn hơn
    if cx < 600:
        return 'ung-xa'
    if cx < 920:
        return 'dao'
    if cx < 1170:
        return 'chuong'
    return 'mat'


def main():
    os.makedirs(os.path.join(MANH, 'goc'), exist_ok=True)
    a = load_rgb(SRC_BANG)
    bg = background(a)
    comps = components(~bg, min_px=300)
    info = {}
    for s, c in comps:
        y0, y1 = max(s[0].start - PAD, 0), min(s[0].stop + PAD, a.shape[0])
        x0, x1 = max(s[1].start - PAD, 0), min(s[1].stop + PAD, a.shape[1])
        ten = ten_theo_vi_tri(x0, y0, x1, y1)
        assert ten not in info, ten
        rgba = unmix_white(a[y0:y1, x0:x1], c[y0:y1, x0:x1])
        Image.fromarray(rgba, 'RGBA').save(os.path.join(MANH, 'goc', ten + '.png'))
        info[ten] = {'hop_tren_bang': [x0, y0, x1, y1], 'co': [x1 - x0, y1 - y0], 'so_px': int(c.sum())}
    assert len(info) == 13, f'tách được {len(info)} mảnh, cần 13: {sorted(info)}'
    luu_json(os.path.join(MANH, 'goc', 'tach.json'), info)
    for k, v in info.items():
        print(f'{k:10s} cỡ {v["co"]}  hộp {v["hop_tren_bang"]}')


if __name__ == '__main__':
    main()
