#!/usr/bin/env python3
"""Cắt ảnh ghép (sprite sheet) gen theo docs/PROMPT_GEMINI.md thành bộ ảnh game.

  python3 tools/cat-sheet.py <ảnh.png> <mã> [hero|enemy|boss]

- Tướng (1536×1024, 3×2 ô): idle · wind · strike / cast · front · head → assets/packs/<mã>/
- Quái (1536×512, 3 ô): walk1 · walk2 · attack;  Boss (1024×1024, 2×2): idle · attack · skill · rage
Nền hồng tím #FF00FF được xoá (kể cả viền ám hồng). Các dáng toàn thân cắt cùng chiều cao
và giữ nguyên đường chân để đổi dáng không bị nhảy; ảnh thu về cao tối đa 480 px (chân dung 240 px)
và nén thành PNG 256 màu (mỗi dáng chỉ vài chục KB).
"""
import os, sys
from PIL import Image

NAMES = {'hero': (3, 2, ['idle', 'wind', 'strike', 'cast', 'front', 'head']),
         'enemy': (3, 1, ['walk1', 'walk2', 'attack']),
         'boss': (2, 2, ['idle', 'attack', 'skill', 'rage'])}


def key_magenta(im):
    """Xoá nền hồng tím: điểm càng gần #FF00FF càng trong; khử ám hồng ở viền."""
    im = im.convert('RGBA')
    px = im.load()
    W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            m = min(r, b) - g          # độ "hồng tím"
            if m > 150 and r > 180 and b > 180:
                px[x, y] = (0, 0, 0, 0)
            elif m > 60:
                k = (m - 60) / 90       # 0..1 phần nền lẫn vào
                na = int(a * (1 - k))
                # bỏ phần hồng tím đã trộn: kéo r, b về mức g
                nr = int(max(0, r - (r - g) * k)); nb = int(max(0, b - (b - g) * k))
                px[x, y] = (nr, g, nb, na)
    return im


def save_light(im, path):
    """Lưu PNG nhẹ: bảng 256 màu có kênh trong suốt (ảnh nét phẳng gần như không đổi), nén tối đa."""
    q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
    q.save(path, optimize=True)


def main():
    src, code = sys.argv[1], sys.argv[2]
    kind = sys.argv[3] if len(sys.argv) > 3 else 'hero'
    cols, rows, names = NAMES[kind]
    sheet = key_magenta(Image.open(src))
    W, H = sheet.size
    cw, ch = W // cols, H // rows
    cells = [sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)) for r in range(rows) for c in range(cols)]
    out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'packs', code)
    os.makedirs(out, exist_ok=True)
    body = [i for i, n in enumerate(names) if n != 'head']
    boxes = {i: cells[i].getbbox() for i in range(len(cells))}
    # chung một khung dọc cho mọi dáng toàn thân: từ đỉnh cao nhất tới chân thấp nhất
    top = min(boxes[i][1] for i in body if boxes[i])
    bot = max(boxes[i][3] for i in body if boxes[i])
    for i, n in enumerate(names):
        bb = boxes[i]
        if not bb:
            print('ô trống:', n); continue
        if n == 'head':
            im = cells[i].crop(bb); hh = 240
        else:
            im = cells[i].crop((bb[0], top, bb[2], bot)); hh = 480
        hh = min(hh, im.height)          # không phóng to ảnh nhỏ
        k = hh / im.height
        im = im.resize((max(1, round(im.width * k)), hh), Image.LANCZOS)
        save_light(im, os.path.join(out, n + '.png'))
        print(n, im.size)
    if kind == 'hero':
        print(f"Thêm '{code}' vào HERO_PACK trong js/render.js để game dùng bộ ảnh này.")


if __name__ == '__main__':
    main()
