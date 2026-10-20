#!/usr/bin/env python3
"""Ảnh ghép thử tỉ lệ: nền hốc cây + mảnh tileset + Lam (idle khung 1, cao 160) + Quái Chuông Gỗ.

Chạy từ tieng-vong-cuoi-cung/ (sau chibi-tach-khung, chibi-quai, chibi-tileset, chibi-nen):
  python3 tools/chibi-ghep-thu.py
Ra art/chibi/ghep-thu-960.png (960×540) và ghep-thu-1920.png (1920×1080, mọi thứ vẽ lại từ bản gốc ở ×2).
Toạ độ dưới đây tính theo màn 960×540.
"""
import importlib.util, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

_sp = importlib.util.spec_from_file_location('t', os.path.join(os.path.dirname(__file__), 'chibi-tach-khung.py'))
t = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(t)

A = 'art/chibi/'
SAN_Y = 478                    # mặt sàn tileset (màn 960) – thấp hơn sàn đất trong nền (396–459) để không trùng
LAM_CAO = 160                  # cao Lam trên màn; ô 512 → 240
O_GAME = 240
LUN = 4                        # chân lún vào rêu (px màn 960) – mép trên rêu lởm chởm

TS = json.load(open(A + 'tileset/manh.json'))
MANH = {m['so']: m for m in TS['manh']}
S_TILE = TS['ti_le_game']

# (số mảnh, x trái, y mặt đứng) – sàn liền bằng khối 13/11 chồng mép 14 px, cộng 2 bục
SAN = []
x = -20
for i, so in enumerate([13, 11, 13, 11, 13, 11, 13, 11]):
    SAN.append((so, x, SAN_Y))
    x += MANH[so]['co_game'][0] - 14
BUC = [(6, 90, 318), (2, 600, 300)]


def dan(c, img, x, y, k):
    """dán img (RGBA gốc) thu theo k tại (x, y) góc trên-trái, toạ độ đã nhân k_man."""
    sm = Image.fromarray(t.doi_co(np.asarray(img), k), 'RGBA') if abs(k - 1) > 1e-6 else img
    c.alpha_composite(sm, (int(round(x)), int(round(y))))


def ve(k_man):
    W, H = 960 * k_man, 540 * k_man
    c = Image.open(A + f'nen/hoc-cay-{W}.png').convert('RGBA')
    for so, x, y in SAN + BUC:
        m = MANH[so]
        img = Image.open(A + 'tileset/' + m['file'])
        ymat = m['mat_dung_y_trung_vi_game']
        dan(c, img, x * k_man, (y - ymat) * k_man, S_TILE * k_man)
    # Lam: ô 512 → ô 240·k, pivot (120, 234)·k
    ko = O_GAME / 512 * k_man
    lam = Image.open(A + 'lam/khung/idle/khung-1.png')
    dan(c, lam, (300 - 256 * O_GAME / 512) * k_man, (SAN_Y + LUN - 500 * O_GAME / 512) * k_man, ko)
    lam2 = Image.open(A + 'lam/khung/idle/khung-1.png')
    dan(c, lam2, (690 - 256 * O_GAME / 512) * k_man, (300 + LUN - 500 * O_GAME / 512) * k_man, ko)
    q = Image.open(A + 'quai/khung/dung.png').transpose(Image.FLIP_LEFT_RIGHT)   # quay mặt về phía Lam
    dan(c, q, (540 - 256 * O_GAME / 512) * k_man, (SAN_Y + LUN - 500 * O_GAME / 512) * k_man, ko)
    # chú thích
    d = ImageDraw.Draw(c)
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12 * k_man)
    except Exception:
        f = ImageFont.load_default()
    d.rectangle([0, 0, W, 18 * k_man], fill=(0, 0, 0, 150))
    d.text((6 * k_man, 3 * k_man), f'Ghép thử {W}×{H} (×{k_man}): Lam cao {LAM_CAO * k_man} px, quái {120 * k_man} px, '
           f'tileset ×{S_TILE} (gốc→960), mặt sàn tileset y={SAN_Y * k_man}; chấm trắng = sàn đất vẽ trong nền', fill=(235, 235, 235), font=f)
    # vạch tham chiếu: sàn đất trong nền (396–459) – chấm mờ
    for yy in (396, 459):
        for xx in range(0, 960, 12):
            d.line([(xx * k_man, yy * k_man), ((xx + 5) * k_man, yy * k_man)], fill=(255, 255, 255, 90), width=k_man)
    return c.convert('RGB')


if __name__ == '__main__':
    for k in (1, 2):
        ve(k).save(A + f'ghep-thu-{960 * k}.png', optimize=True)
    print('xong')
