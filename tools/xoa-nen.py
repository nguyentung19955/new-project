"""Xoá nền xám cho ảnh ĐƠN tạo bằng Fooocus (PROMPT-FOOOCUS.txt), mỗi ảnh một vật.

Cách chạy:  python3 tools/xoa-nen.py <thư mục ảnh Fooocus> assets
Cần: pip install pillow numpy scipy
- Ảnh phải đặt đúng tên như dòng "File:" trong prompt (ví dụ lac-tuong_thuong.png).
- Nhân vật, quái, đồ: xoá nền xám (vùng xám nối với mép ảnh), cắt sát, thu nhỏ còn tối đa 512 px;
  icon kỹ năng / giao diện / phụ kiện còn 256 px (hiện nhỏ, đỡ nặng máy).
- Ảnh nền (nen_*, truyen_*, logo, icon-app): giữ nguyên, chỉ thu nhỏ còn tối đa 1600 px.
Ảnh không có trong tools/asset-manifest.json sẽ được bỏ qua (in ra để sửa tên).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, 'asset-manifest.json'), encoding='utf-8'))
SHEET_FILES = {c['file'] for s in M['sheets'] for c in s['cells']}
SINGLE_FILES = {s['file'] for s in M['singles']}


def remove_bg(img):
    a = np.asarray(img.convert('RGB')).astype(int)
    sat = a.max(2) - a.min(2)
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(edge, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(2))
    # nền xám có thể hơi loang: nới ngưỡng theo độ lệch ở mép
    tol = max(22, float(np.percentile(np.sqrt(((edge - bg) ** 2).sum(1)), 90)) + 8)
    cand = (d < tol) & (sat < 26)
    lab, _ = ndimage.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fg = ndimage.binary_opening(fg, iterations=1)
    fg = ndimage.binary_fill_holes(fg)
    l2, n2 = ndimage.label(fg)
    if n2:
        sizes = ndimage.sum(fg, l2, range(1, n2 + 1))
        fg = np.isin(l2, [i + 1 for i, v in enumerate(sizes) if v > max(60, sizes.max() * 0.01)])
    alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert('RGB').copy()
    out.putalpha(alpha)
    bb = out.getbbox()
    return out.crop(bb) if bb else out


ICON_PREFIX = ('ky-nang_', 'ui_', 'hanh_', 'phu-kien_', 'do-ghep_', 'sinh-le_')


def shrink(img, maxside):
    w, h = img.size
    k = maxside / max(w, h)
    return img.resize((round(w * k), round(h * k)), Image.LANCZOS) if k < 1 else img


def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            continue
        name = os.path.splitext(f)[0] + '.png'
        img = Image.open(os.path.join(src, f))
        if name in SINGLE_FILES:
            side = 1024 if name.startswith('anh-lon_') else 1600
            shrink(img.convert('RGB'), side).save(os.path.join(dst, name), optimize=True); print('ảnh nền ', name)
        elif name in SHEET_FILES:
            # icon / giao diện chỉ hiện nhỏ: 256 px là đủ, nhẹ hơn 4 lần
            side = 256 if name.startswith(ICON_PREFIX) else 512
            shrink(remove_bg(img), side).save(os.path.join(dst, name), optimize=True); print('xoá nền ', name)
        else:
            print('bỏ qua (tên không có trong manifest):', f)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'fooocus', sys.argv[2] if len(sys.argv) > 2 else 'assets')
