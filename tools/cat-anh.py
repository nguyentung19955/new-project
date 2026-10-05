"""Cắt bảng asset (S01.png ... S37.png) thành từng PNG nền trong suốt.

Cách chạy:  python3 cat-anh.py <thư mục chứa ảnh bảng> <thư mục xuất>
Cần: pip install pillow numpy scipy
Tên ảnh bảng phải bắt đầu bằng mã bảng (S01, S02, ... hoặc F01 ...), ví dụ "S01.png" hoặc "S01 tuong.jpg".
Tên file xuất lấy từ asset-manifest.json (đặt cạnh file này).
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = json.load(open(os.path.join(HERE, 'asset-manifest.json'), encoding='utf-8'))
SHEETS = {s['code']: s for s in MANIFEST['sheets']}
SINGLES = {s['code']: s for s in MANIFEST['singles']}


def find_cells(rgb, rows, cols):
    """Tìm các ô nền xám trơn. Trả về danh sách hộp (x0,y0,x1,y1) theo thứ tự trái→phải, trên→dưới."""
    a = rgb.astype(int)
    sat = a.max(2) - a.min(2)
    br = a.mean(2)
    grey = (sat < 16) & (br > 175) & (br < 245)
    grey = ndimage.binary_opening(grey, iterations=2)
    H, W = grey.shape
    # mỗi ô là vùng xám lớn; phần nhân vật bên trong là lỗ → lấp lỗ để thành khối vuông
    lab, n = ndimage.label(grey)
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        w, h = x1 - x0, y1 - y0
        if w < W / (cols * 3) or h < H / (rows * 4):
            continue
        if not (0.6 < w / h < 1.6):
            continue
        fill = (lab[y0:y1, x0:x1] == i).mean()
        if fill < 0.25:
            continue
        boxes.append((x0, y0, x1, y1))
    if len(boxes) < rows * cols:
        # dự phòng: chia lưới đều trong vùng có ô
        if boxes:
            X0 = min(b[0] for b in boxes); Y0 = min(b[1] for b in boxes)
            X1 = max(b[2] for b in boxes); Y1 = max(b[3] for b in boxes)
        else:
            X0, Y0, X1, Y1 = int(W * .04), int(H * .12), int(W * .96), int(H * .95)
        cw, ch = (X1 - X0) / cols, (Y1 - Y0) / rows
        boxes = [(int(X0 + c * cw), int(Y0 + r * ch), int(X0 + (c + 1) * cw), int(Y0 + (r + 1) * ch))
                 for r in range(rows) for c in range(cols)]
        print('   ! không thấy đủ ô, chia lưới đều')
    # sắp xếp theo hàng rồi cột
    boxes.sort(key=lambda b: b[1])
    rowsl, cur = [], [boxes[0]]
    for b in boxes[1:]:
        if abs(b[1] - cur[0][1]) < (cur[0][3] - cur[0][1]) * 0.5:
            cur.append(b)
        else:
            rowsl.append(cur); cur = [b]
    rowsl.append(cur)
    ordered = [b for r in rowsl for b in sorted(r, key=lambda b: b[0])]
    return ordered


def cut_cell(img, box):
    x0, y0, x1, y1 = box
    m = max(3, int((x1 - x0) * 0.012))          # bỏ viền ô
    cell = img.crop((x0 + m, y0 + m, x1 - m, y1 - m))
    a = np.asarray(cell).astype(int)
    sat = a.max(2) - a.min(2)
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(edge, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(2))
    cand = (d < 26) & (sat < 22)
    lab, _ = ndimage.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fg = ndimage.binary_opening(fg, iterations=1)
    fg = ndimage.binary_fill_holes(fg)
    l2, n2 = ndimage.label(fg)
    if n2:
        sizes = ndimage.sum(fg, l2, range(1, n2 + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s > max(40, sizes.max() * 0.002)]
        fg = np.isin(l2, keep)
    alpha = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.7))
    out = cell.copy(); out.putalpha(alpha)
    bb = out.getbbox()
    return out.crop(bb) if bb else out


def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    files = sorted(f for f in os.listdir(src) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')))
    for f in files:
        m = re.match(r'([SF]\d\d)', f.upper())
        if not m:
            print('bỏ qua', f); continue
        code = m.group(1)
        img = Image.open(os.path.join(src, f)).convert('RGB')
        if code in SINGLES:
            img.save(os.path.join(dst, SINGLES[code]['file'])); print(code, '→', SINGLES[code]['file']); continue
        if code not in SHEETS:
            print('mã không có trong danh sách', f); continue
        sh = SHEETS[code]
        boxes = find_cells(np.asarray(img), sh['rows'], sh['cols'])
        print(f'{code} {sh["title"]}: thấy {len(boxes)} ô, cần {len(sh["cells"])}')
        for cell, box in zip(sh['cells'], boxes):
            cut_cell(img, box).save(os.path.join(dst, cell['file']))
            print('   ', cell['file'])


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'bang-asset', sys.argv[2] if len(sys.argv) > 2 else 'assets')
