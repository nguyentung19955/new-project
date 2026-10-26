"""Bước 1a: tách 9 mảnh từ 3-bang-manh.png (nền trắng) → ../manh/goc/<ten>.png (RGBA, cỡ gốc bảng mảnh).
Cách làm: nền = vùng trắng nối mép ảnh (flood-fill) + lỗ trắng kín bao bởi nét mực; mỗi connected
component là một mảnh; viền chuyển màu sát nền được khử trắng (unmix) → alpha mềm, không quầng trắng.
Mảnh được nhận diện theo vị trí tâm trên bảng (bố cục 3×3 của ảnh)."""
import os
import json
import numpy as np
from PIL import Image
from chung import (SRC_BANG, SRC_NGANG, MANH, load_rgb, background, unmix_white, components)

# tên mảnh theo ô (hàng, cột) của bảng 3×3
O_BANG = {
    (0, 0): 'mu',          # mũ trùm, mặt đen không mắt
    (0, 1): 'chop-mu',     # chóp mũ
    (0, 2): 'than',        # thân + capelet
    (1, 0): 'tay-truoc',   # găng tay trước cầm dao
    (1, 1): 'tay-sau',     # găng tay sau
    (1, 2): 'ung-a',       # ủng (hàng giữa)
    (2, 0): 'ung-b',       # ủng (hàng dưới)
    (2, 1): 'mat',         # mắt vàng (không viền)
    (2, 2): 'chuong',      # chuông
}
PAD = 4


def cat(a, fg, comp_mask, s):
    y0, y1 = max(s[0].start - PAD, 0), min(s[0].stop + PAD, a.shape[0])
    x0, x1 = max(s[1].start - PAD, 0), min(s[1].stop + PAD, a.shape[1])
    sub = a[y0:y1, x0:x1]
    m = comp_mask[y0:y1, x0:x1]
    rgba = unmix_white(sub, m)
    return Image.fromarray(rgba, 'RGBA'), (x0, y0, x1, y1)


def main():
    os.makedirs(os.path.join(MANH, 'goc'), exist_ok=True)
    a = load_rgb(SRC_BANG)
    bg, holes = background(a)
    fg = ~bg
    comps = components(fg, min_px=1500)
    H, W = fg.shape
    info = {}
    for s, c in comps:
        cy = (s[0].start + s[0].stop) / 2 / H
        cx = (s[1].start + s[1].stop) / 2 / W
        key = (min(int(cy * 3), 2), min(int(cx * 3), 2))
        name = O_BANG[key]
        img, box = cat(a, fg, c, s)
        img.save(os.path.join(MANH, 'goc', name + '.png'))
        info[name] = {'hop_tren_bang': box, 'co': img.size, 'so_px': int(c.sum())}
    assert len(info) == 9, f'tách được {len(info)} mảnh, cần 9: {sorted(info)}'
    # các khối rời trên ảnh nhìn ngang (để đo cỡ đối chiếu)
    b = load_rgb(SRC_NGANG)
    bgn, _ = background(b)
    ngang = []
    for s, c in components(~bgn, min_px=1500):
        ngang.append({'hop': [s[1].start, s[0].start, s[1].stop, s[0].stop], 'so_px': int(c.sum())})
    out = {'bang_manh': info, 'lo_trong_suot_bang': holes, 'khoi_roi_nhin_ngang': ngang}
    with open(os.path.join(MANH, 'goc', 'tach.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    for k, v in info.items():
        print(f'{k:10s} cỡ {v["co"]}  hộp {v["hop_tren_bang"]}')
    print('lỗ trắng kín đã xoá:', holes)


if __name__ == '__main__':
    main()
