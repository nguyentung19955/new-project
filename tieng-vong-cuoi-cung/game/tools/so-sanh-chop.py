#!/usr/bin/env python3
"""Ảnh so sánh Lam CÓ chóp (trước 27/10/2026) ↔ KHÔNG chóp (bây giờ) – cùng rig-v4, cùng tư thế, cùng tỉ lệ.
  game/kiem-thu-chem-nhay-v2/so-sanh-chop-lon.png    cỡ lớn (4 px / px logic), 4 tư thế: nghỉ, chạy khung 9, chém 1 trúng, trượt tường
  game/kiem-thu-chem-nhay-v2/so-sanh-chop-112px.png  ĐÚNG 112 px logic 1:1 (vẽ 1:1 thế giới → thu LANCZOS về 2x như sheet → thu ½)
Chạy: python3 -B game/tools/so-sanh-chop.py"""
import os, sys
sys.dont_write_bytecode = True
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
HD_CODE = os.path.normpath(os.path.join(GAME, '..', 'art', 'modular', 'lam-moi', 'hanh-dong', 'code'))
sys.path.insert(0, HD_CODE)
from chung_hd import RIG, DOC, GX, GY, S, render, thu_nho, LAM_TOI, font   # noqa: E402
from khung import co_chop                                                  # noqa: E402
import tu_the_hd as T                                                      # noqa: E402

OUT = os.path.join(GAME, 'kiem-thu-chem-nhay-v2')
RIG_CO = co_chop(RIG)
TU_THE = [('Đứng (dáng nghỉ)', DOC['tu_the_nghi']), ('Chạy – khung 9', DOC['chu_ky']['khung'][9]),
          ('Chém 1 – trúng', T.P['c1-trung']), ('Trượt tường', T.P['truot-1'])]
# hộp thế giới chung (px logic so với chân): x −70 … 110, y −135 … 8
L = S / 2
BOX = (GX - 70 / L, GY - 135 / L, GX + 110 / L, GY + 8 / L)
W_LOGIC, H_LOGIC = 180, 143


def ve(rig, pose, px_logic):
    if px_logic >= 2:
        return render(rig, pose, BOX, L * px_logic, toi=LAM_TOI)
    im2 = thu_nho(render(rig, pose, BOX, 1.0, toi=LAM_TOI), (W_LOGIC * 2, H_LOGIC * 2))      # như sheet 2x
    return im2.convert('RGBa').resize((W_LOGIC, H_LOGIC), Image.LANCZOS).convert('RGBA')   # vẽ ½ trong game


def bang(px_logic, ten):
    ow, oh = W_LOGIC * px_logic, H_LOGIC * px_logic
    top = 26 if px_logic < 2 else 70
    lab = 96 if px_logic < 2 else 230
    C = Image.new('RGB', (lab + ow * len(TU_THE), top + 2 * oh), (236, 239, 236))
    d = ImageDraw.Draw(C)
    f = font(11 if px_logic < 2 else 24, True)
    for j, (tt, _) in enumerate(TU_THE):
        d.text((lab + j * ow + 4, 4), tt, fill=(30, 30, 40), font=f)
    for i, (nhan, rig) in enumerate((('CÓ chóp\n(trước)', RIG_CO), ('KHÔNG chóp\n(bây giờ)', RIG))):
        d.text((4, top + i * oh + 8), nhan, fill=(30, 30, 40), font=f)
        for j, (_, p) in enumerate(TU_THE):
            im = ve(rig, p, px_logic)
            x0, y0 = lab + j * ow, top + i * oh
            d.rectangle([x0, y0, x0 + ow - 1, y0 + oh - 1], fill=(214, 226, 214) if (i + j) % 2 else (226, 232, 222))
            gy = y0 + 135 * px_logic
            d.line([(x0, gy), (x0 + ow, gy)], fill=(190, 70, 70), width=1)
            C.paste(im.convert('RGB'), (x0, y0), im)
    C.save(os.path.join(OUT, ten))
    print('đã ghi', ten, C.size)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    bang(4, 'so-sanh-chop-lon.png')
    bang(1, 'so-sanh-chop-112px.png')
