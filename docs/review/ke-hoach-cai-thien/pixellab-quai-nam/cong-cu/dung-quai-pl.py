#!/usr/bin/env python3
"""Ghép khung PixelLab (docs/anh-goc/pixellab-quai-nam/<con>/khung/<động tác>-NN.png) thành tấm .sprite.json của game.

Chỉ CẮT + ĐẶT VỊ TRÍ + GHÉP: không vẽ / vá / đổi màu điểm ảnh nào.
- Mọi khung của một con cùng một khung vẽ PixelLab (cùng gốc khung xương 3D, một hướng south-east) → dùng MỘT ô cắt chung
  (hợp các vùng có hình + lề 2), không dời riêng khung nào ⇒ chân không trượt giữa các khung / các động tác.
- Điểm neo (goc) = giữa chân ở tư thế đứng thở (đo trên khung idle-00), đáy chân.
- net 2: 2 điểm ảnh PixelLab = 1 điểm game (như các quái khác).
Chạy:  python3 docs/review/ke-hoach-cai-thien/pixellab-quai-nam/cong-cu/dung-quai-pl.py [--ghi]
"""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'anh-goc', 'pixellab-quai-nam')
OUT = os.path.join(ROOT, 'game', 'art', 'custom')
NET = 2
# hàng: (tên động tác, giây, lặp)
CON = {
    'goblin': dict(ma='thorncapGoblin', ten='Thorncap Goblin', thay='heoCon', rows=[
        ('idle', 1.2, True), ('move', 0.7, True), ('tele', 0.6, False), ('atk', 0.6, False), ('hit', 0.35, False), ('die', 1.1, False)]),
    'puff': dict(ma='sporePuff', ten='Spore Puff', thay='hoaBaoTu', rows=[
        ('idle', 1.2, True), ('move', 0.9, True), ('tele', 0.7, False), ('atk', 0.6, False), ('hit', 0.35, False), ('die', 1.4, False)]),
    'king': dict(ma='toadstoolKing', ten='Toadstool King', thay='namChua', rows=[
        ('idle', 1.4, True), ('move', 0.8, True), ('tele', 0.7, False), ('atk', 0.6, False), ('hit', 0.3, False), ('die', 1.2, False),
        # dựng khiên (Fire Guard): 'ne' = khung 0–4 của động tác khien (giơ gậy lên chắn), 'noi' = khung 4–7 (giữ thế chắn, lặp)
        ('ne', 0.45, False), ('noi', 0.8, True)]),
}


def khung(con, ten):
    if con == 'king' and ten in ('ne', 'noi'):
        fs = sorted(glob.glob(os.path.join(SRC, con, 'khung', 'khien-*.png')))
        fs = fs[0:5] if ten == 'ne' else fs[4:8]
    else:
        fs = sorted(glob.glob(os.path.join(SRC, con, 'khung', ten + '-*.png')))
    return [Image.open(f).convert('RGBA') for f in fs]


def dung(con, cfg):
    rows = [(t, g, l, khung(con, t)) for t, g, l in cfg['rows']]
    allf = [f for r in rows for f in r[3]]
    W, H = allf[0].size
    assert all(f.size == (W, H) for f in allf), 'khung khác cỡ'
    bb = [min(f.getbbox()[0] for f in allf), min(f.getbbox()[1] for f in allf), max(f.getbbox()[2] for f in allf), max(f.getbbox()[3] for f in allf)]
    a = np.array(rows[0][3][0])[..., 3] > 0
    ys, xs = np.where(a)
    by = int(ys.max())
    fx = int(round(xs[ys >= by - 3].mean()))  # giữa chân (các hàng điểm ảnh thấp nhất)
    fy = by + 1  # mép dưới bàn chân
    x0, y0 = bb[0] - 2, bb[1] - 2
    if (fx - x0) % 2: x0 -= 1
    if (fy - y0) % 2: y0 -= 1
    x1, y1 = bb[2] + 2, bb[3] + 2
    if (x1 - x0) % 2: x1 += 1
    if (y1 - y0) % 2: y1 += 1
    fw, fh = x1 - x0, y1 - y0
    ncot = max(len(r[3]) for r in rows)
    tam = Image.new('RGBA', (fw * ncot, fh * len(rows)), (0, 0, 0, 0))
    dt = {}
    for h, (t, g, l, fs) in enumerate(rows):
        for i, f in enumerate(fs):
            tam.paste(f.crop((x0, y0, x1, y1)), (i * fw, h * fh))  # chỉ cắt + đặt, không đổi điểm ảnh
        dt[t] = {'hang': h, 'so': len(fs), 'giay': g}
        if l: dt[t]['lap'] = True
    # thân (đứng thở) theo điểm game
    ib = rows[0][3][0].getbbox()
    rong, cao = (ib[2] - ib[0] + 1) // NET, (ib[3] - ib[1] + 1) // NET
    b = io.BytesIO(); tam.save(b, 'PNG', optimize=True)
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': cfg['ma'], 'ten': cfg['ten'], 'vung': 'rung', 'net': NET,
           'khung_rong': fw // NET, 'khung_cao': fh // NET, 'goc': [(fx - x0) // NET, (fy - y0) // NET], 'rong': rong, 'cao': cao,
           'thay_cho': cfg['thay'], 'dong_tac': dt,
           'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    return tep, tam


def main():
    ghi = '--ghi' in sys.argv
    for con, cfg in CON.items():
        tep, tam = dung(con, cfg)
        print(cfg['ma'], 'khung', tep['khung_rong'], 'x', tep['khung_cao'], 'goc', tep['goc'], 'than', tep['rong'], 'x', tep['cao'],
              'tam', tam.size, '%.0f KB' % (len(tep['tam']) * 3 / 4 / 1024), {k: v['so'] for k, v in tep['dong_tac'].items()})
        if ghi:
            with open(os.path.join(OUT, cfg['ma'] + '.sprite.json'), 'w', encoding='utf-8') as f:
                json.dump(tep, f, ensure_ascii=False, separators=(',', ':'))
            tam.save(os.path.join(SRC, con, 'tam-' + cfg['ma'] + '.png'))


if __name__ == '__main__':
    main()
