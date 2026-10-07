#!/usr/bin/env python3
"""v159: cắt tấm khung / nút / thanh giao diện (nền hồng tím #FF00FF) thành từng file theo tools/ui-frames.json.

  python3 tools/cat-khung.py <ảnh.png> <mã tấm>      vd. khung-bang, nut-chu-nhat, thanh-mau, huy-hieu-ai
Mã tấm, số cột × hàng, tên file từng ô (đọc trái → phải, trên → xuống) do tools/build-prompts.js sinh ra.
Khác cat-items.py: ô không ép thành hình vuông 128 px — giữ đúng tỉ lệ khung / nút / thanh, cạnh dài nhất = "max" px.
Phần ruột khung vẽ màu hồng tím cũng thành trong suốt (game tự tô nền / thanh máu phía dưới).
Tranh cảnh (scenes/…) không cần cắt: đặt thẳng file vào assets/scenes/ đúng tên.
"""
import os, sys, json, importlib.util
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(here, file))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
cs = load('cs', 'cat-sheet.py')


def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    src, code = sys.argv[1], sys.argv[2]
    sheets = json.load(open(os.path.join(here, 'ui-frames.json'), encoding='utf8'))
    if code not in sheets: sys.exit(f'Không có tấm {code}. Có: {", ".join(sheets)}')
    sh = sheets[code]
    cols, rows, files, mx = sh['cols'], sh['rows'], sh['files'], sh['max']
    out = os.path.join(here, '..', 'assets', sh.get('dir', 'ui')); os.makedirs(out, exist_ok=True)
    sheet = cs.key_magenta(Image.open(src).convert('RGB'))
    W, H = sheet.size
    xs = cs.cut_lines(sheet, cols, W, axis=0) if cols > 1 else [0, W]
    ys = cs.cut_lines(sheet, rows, H, axis=1) if rows > 1 else [0, H]
    k = 0
    for r in range(rows):
        for c in range(cols):
            f = files[k]; k += 1
            ins = 4
            cell = cs.drop_specks(sheet.crop((xs[c] + ins, ys[r] + ins, xs[c + 1] - ins, ys[r + 1] - ins)))
            bb = cell.getbbox()
            if not bb: sys.exit(f'Ô {k} ({f}) trống')
            cell = cell.crop(bb)
            s = mx / max(cell.size)
            if s < 1: cell = cell.resize((max(1, round(cell.width * s)), max(1, round(cell.height * s))), Image.LANCZOS)
            cs.save_light(cell, os.path.join(out, f))
    print(f"{code}: {', '.join(files)} → assets/{sh.get('dir', 'ui')}/")


if __name__ == '__main__':
    main()
