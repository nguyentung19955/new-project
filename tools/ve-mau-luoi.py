#!/usr/bin/env python3
"""Vẽ ảnh mẫu lưới trống (docs/mau-luoi/*.png) để đính kèm cho AI tạo ảnh / họa sĩ làm tham chiếu bố cục.
Nền #FF00FF, mỗi ô: viền ô mảnh, số ô + tên động tác, vùng an toàn (lề) nét đứt, đường đáy chân màu vàng.
  python3 tools/ve-mau-luoi.py          → ghi lại toàn bộ docs/mau-luoi/
Thông số (BASE, SAFE) trùng với docs/CHUAN-ANIMATION.md và tools/ghep-luoi.py."""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = 0.92     # đường đáy chân: 92% chiều cao ô (cách đáy 8%)
SAFE = 0.07     # lề an toàn mỗi phía
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'mau-luoi')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

SHEETS = {
    'hero12': (4, 3, 192, ['IDLE 1', 'IDLE 2', 'IDLE 3', 'PORTRAIT', 'ATTACK 1\nprepare', 'ATTACK 2\nswing', 'ATTACK 3\nhit', 'ATTACK 4\nrecover',
                           'SKILL 1\ngather', 'SKILL 2\npeak', 'SKILL 3\nfade', 'HURT']),
    'enemy6': (3, 2, 192, ['WALK 1\nfront foot', 'WALK 2\npassing', 'WALK 3\nback foot', 'WALK 4\npassing', 'ATTACK 1\nwind-up', 'ATTACK 2\nlunge']),
    'enemy6-bay': (3, 2, 192, ['FLY 1\nwings up', 'FLY 2\nhalf down', 'FLY 3\nwings down', 'FLY 4\nhalf up', 'ATTACK 1\npull back', 'ATTACK 2\ndive']),
    'boss9': (3, 3, 256, ['WALK 1', 'WALK 2', 'WALK 3', 'WALK 4', 'ATTACK 1\nraise', 'ATTACK 2\nswing', 'ATTACK 3\nimpact', 'RAGE 1', 'RAGE 2']),
    'icon4': (4, 1, 128, ['ICON 1', 'ICON 2', 'ICON 3', 'ICON 4']),
}


def draw(name, cols, rows, cell, labels):
    im = Image.new('RGB', (cols * cell, rows * cell), (255, 0, 255))
    d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(FONT, max(11, cell // 11))
    f2 = ImageFont.truetype(FONT, max(9, cell // 16))
    icon = name == 'icon4'
    for i, lab in enumerate(labels):
        x0, y0 = (i % cols) * cell, (i // cols) * cell
        d.rectangle((x0, y0, x0 + cell - 1, y0 + cell - 1), outline=(120, 0, 120), width=1)
        m = int(cell * SAFE)
        for x in range(x0 + m, x0 + cell - m, 8):          # vùng an toàn nét đứt
            d.line((x, y0 + m, min(x + 4, x0 + cell - m), y0 + m), fill=(255, 255, 255))
            if icon: d.line((x, y0 + cell - m, min(x + 4, x0 + cell - m), y0 + cell - m), fill=(255, 255, 255))
        for y in range(y0 + m, y0 + cell - m, 8):
            e = y0 + cell - m if icon else y0 + int(cell * BASE)
            if y < e:
                d.line((x0 + m, y, x0 + m, min(y + 4, e)), fill=(255, 255, 255))
                d.line((x0 + cell - m, y, x0 + cell - m, min(y + 4, e)), fill=(255, 255, 255))
        head, *rest = lab.split('\n')
        d.text((x0 + m + 4, y0 + m + 3), f'{i + 1}. {head}', font=f1, fill=(255, 255, 255))
        if rest: d.text((x0 + m + 4, y0 + m + 5 + f1.size), rest[0], font=f2, fill=(255, 220, 255))
        cx = x0 + cell // 2
        if icon or head == 'PORTRAIT':
            r = int(cell * 0.3)
            d.ellipse((cx - r, y0 + cell // 2 - r + 6, cx + r, y0 + cell // 2 + r + 6), outline=(255, 230, 80), width=2)
            continue
        by = y0 + int(cell * BASE)
        d.line((x0 + m, by, x0 + cell - m, by), fill=(255, 230, 80), width=2)   # đường đáy chân
        d.line((cx, by - int(cell * 0.82), cx, by), fill=(255, 230, 80))         # trục giữa (tâm chân)
        d.text((x0 + m + 4, by + 2), 'body bottom' if 'bay' in name else 'feet', font=f2, fill=(255, 230, 80))
    im.save(os.path.join(OUT, name + '.png'), optimize=True)
    print(name, im.size)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for k, v in SHEETS.items(): draw(k, *v)
