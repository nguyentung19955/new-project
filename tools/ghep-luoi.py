#!/usr/bin/env python3
"""Ghép N ảnh rời (mỗi ảnh một khung) thành MỘT tấm lưới đúng chuẩn docs/CHUAN-ANIMATION.md,
để cắt tiếp bằng tools/cat-sheet.py. Dùng khi công cụ AI chỉ ra một nhân vật / một khung mỗi lần,
hoặc khi xuất khung PNG từ công cụ video / animation.

  python3 tools/ghep-luoi.py <kiểu> <ra.png> <ảnh1> <ảnh2> ...      (hoặc một thư mục: lấy *.png/*.jpg/*.webp theo tên)
  kiểu: hero12 (4×3, ô 192) · enemy6 (3×2, ô 192) · boss9 (3×3, ô 256)
  tùy chọn: --chung-khung  giữ nguyên vị trí tương đối giữa các khung (khung xuất từ video, camera đứng yên:
                           giữ được nhún lên xuống); mặc định mỗi khung đặt chân xuống cùng đường đáy.

Thứ tự ảnh = thứ tự ô (trái → phải, trên → dưới), xem docs/mau-luoi/<kiểu>.png. Với hero12, ảnh thứ 4 là chân dung.
Nền ảnh vào: PNG trong suốt, nền #FF00FF, hoặc nền một màu phẳng bất kỳ (lấy màu ở 4 góc).
Mọi khung toàn thân thu / phóng CÙNG một tỉ lệ (khung lớn nhất cao ~84% ô), tâm chân đặt giữa ô,
chân chạm đường đáy 92% chiều cao ô; ảnh ra nền #FF00FF phẳng, không chữ, không vạch."""
import os, sys
import numpy as np
from PIL import Image

KIEU = {'hero12': (4, 3, 192, {3}), 'enemy6': (3, 2, 192, set()), 'boss9': (3, 3, 256, set())}
BASE, FILL, SIDE = 0.92, 0.84, 0.86      # đường đáy chân · chiều cao tối đa · bề ngang tối đa (theo cỡ ô)
MAGENTA = (255, 0, 255)


def tach_nen(im):
    """Trả ảnh RGBA đã bỏ nền: giữ kênh trong suốt nếu có, không thì xoá màu nền (màu góc ảnh / hồng tím)."""
    im = im.convert('RGBA')
    a = np.asarray(im).astype(np.int32)
    if (a[..., 3] < 250).mean() > 0.02:
        return im
    corners = np.array([a[2, 2, :3], a[2, -3, :3], a[-3, 2, :3], a[-3, -3, :3]])
    bg = np.median(corners, axis=0)
    d = np.sqrt(((a[..., :3] - bg) ** 2).sum(-1))
    out = a.copy()
    out[..., 3] = np.where(d < 60, 0, 255)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')


def tam_chan(im, bb):
    """Tâm chân theo chiều ngang: trung vị cột có hình ở 10% hàng dưới cùng (giống footK trong js/render.js)."""
    a = np.asarray(im)[..., 3] > 60
    y0 = bb[3] - max(1, (bb[3] - bb[1]) // 10)
    cols = np.nonzero(a[y0:bb[3], bb[0]:bb[2]])[1]
    return bb[0] + (float(np.median(cols)) if len(cols) else (bb[2] - bb[0]) / 2)


def ghep(kieu, files, chung=False):
    cols, rows, cell, portrait = KIEU[kieu]
    n = cols * rows
    if len(files) != n:
        sys.exit(f'{kieu} cần đúng {n} ảnh, đang có {len(files)}')
    ims = [tach_nen(Image.open(f)) for f in files]
    bbs = [im.getbbox() for im in ims]
    for f, bb in zip(files, bbs):
        if not bb: sys.exit(f'ảnh trống (không thấy nhân vật): {f}')
    body = [i for i in range(n) if i not in portrait]
    if chung:   # một khung chung cho mọi khung toàn thân (ảnh cùng cỡ, cùng góc máy)
        u = (min(bbs[i][0] for i in body), min(bbs[i][1] for i in body), max(bbs[i][2] for i in body), max(bbs[i][3] for i in body))
        for i in body: bbs[i] = u
    hmax = max(bbs[i][3] - bbs[i][1] for i in body)
    wmax = max(bbs[i][2] - bbs[i][0] for i in body)
    k = min(cell * FILL / hmax, cell * SIDE / wmax)       # cùng một tỉ lệ cho mọi khung toàn thân
    sheet = Image.new('RGBA', (cols * cell, rows * cell), MAGENTA + (255,))
    for i, (im, bb) in enumerate(zip(ims, bbs)):
        x0, y0 = (i % cols) * cell, (i // cols) * cell
        if i in portrait:       # chân dung: vừa 80% ô, đặt giữa
            c = im.crop(bb); kk = min(cell * 0.8 / c.width, cell * 0.8 / c.height)
            c = c.resize((max(1, round(c.width * kk)), max(1, round(c.height * kk))), Image.LANCZOS)
            sheet.alpha_composite(c, (x0 + (cell - c.width) // 2, y0 + (cell - c.height) // 2))
            continue
        fx = tam_chan(im, bb) - bb[0]
        c = im.crop(bb)
        c = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
        m = int(cell * 0.05)
        px = round(x0 + cell / 2 - fx * k)
        px = min(max(px, x0 + m), x0 + cell - m - c.width) if c.width <= cell - 2 * m else x0 + (cell - c.width) // 2
        py = y0 + round(cell * BASE) - c.height
        py = max(py, y0 + m)
        sheet.alpha_composite(c, (px, py))
    return sheet.convert('RGB')     # viền mờ hoà vào nền hồng tím — cat-sheet.py tự khử ám hồng


def main(argv):
    chung = '--chung-khung' in argv
    argv = [x for x in argv if x != '--chung-khung']
    if len(argv) < 3 or argv[0] not in KIEU:
        sys.exit(__doc__)
    kieu, out, src = argv[0], argv[1], argv[2:]
    if len(src) == 1 and os.path.isdir(src[0]):
        src = sorted(os.path.join(src[0], f) for f in os.listdir(src[0]) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')))
    im = ghep(kieu, src, chung)
    im.save(out)
    print('đã ghép', len(src), 'khung →', out, im.size)


if __name__ == '__main__':
    main(sys.argv[1:])
