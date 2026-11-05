# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh "tư vấn B" (trận đấu, TU-VAN-TOAN-BO.txt §E) raw_tv_<Exx>.png → thap/assets/tv_<tên>.png.
Dùng chung khoá magenta / tách khối / thu Lanczos nhân-trước-alpha của tools/thap-cat-tvc.py.
Cỡ = 3 × cỡ CSS lớn nhất ở khung logic 430 (430×932 DPR3 = ×1,0).  Chạy: python3 tools/thap-cat-tvb.py"""
import os, sys, importlib.util
sp = importlib.util.spec_from_file_location('tvc', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'thap-cat-tvc.py'))
tvc = importlib.util.module_from_spec(sp); sp.loader.exec_module(tvc)
from PIL import Image

BANG = {
    'E23': (['tv_hang1', 'tv_hang2', 'tv_hang3', 'tv_hang4'], 132, True),          # huy hiệu sao trên bàn ~44 css (1,7d)
    'E24': (['tv_mana'], 480, False),                                               # hộp mana 152×54 css
    'E25': (['tv_trieu', 'tv_trieu_an', 'tv_trieu_tat'], 300, True),               # nút triệu hồi 98 css
    'E26': (['tv_ray'], 1160, False),                                               # ray trên 384 css
    'E27': (['tv_trum_bang'], 1250, False),                                         # băng trùm 414×98 css
    'E28': (['tv_dem', 'tv_dem_gap', 'tv_dem_do'], 180, True),                      # chip đếm ngược ~58 css
    'E29': (['tv_xem'], 1190, False),                                               # dải xem nhanh 394×70 css
    'E30': (['tv_xem_rong'], 1220, False),                                          # tấm mở rộng 404 css
    'E31': (['tv_tag_ally', 'tv_tag_rival', 'tv_tag_you', 'tv_tag_shared'], 240, True),  # nhãn bàn ~76 css
    'E18': (['tv_dich1', 'tv_dich2', 'tv_dich3', 'tv_dich4'], 240, True),
    'E19': (['tv_khong'], 240, False),
    'E20': (['tv_ghep%d' % i for i in range(1, 9)], 240, True),
    'E21': (['tv_lui%d' % i for i in range(1, 5)], 240, True),
    'E22': (['tv_de'], 240, False),
}

if __name__ == '__main__':
    chi = set(sys.argv[1:])
    for e, (ten, w, cung) in BANG.items():
        if chi and e not in chi: continue
        p = os.path.join(tvc.NGUON, 'raw_tv_' + e + '.png')
        if not os.path.exists(p): continue
        ims = tvc.khoi(tvc.khoa(Image.open(p)), len(ten))
        if len(ims) < len(ten): print('!!', e, 'chỉ thấy', len(ims), 'khối, cần', len(ten)); ten = ten[:len(ims)]
        if cung: ims = tvc.cung_khung(ims)
        for im, t in zip(ims, ten):
            im = tvc.thu(im, w); im.save(os.path.join(tvc.DICH, t + '.png'), optimize=True)
            print(e, t + '.png', '%dx%d' % im.size)


def bong(p, ra, w):
    """E17: bóng tối pha trên nền magenta (pixel = (1-a)·magenta) → bóng đen có alpha; nét cyan giữ nguyên; giữ cả cụm (bbox)."""
    import numpy as np
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    sang = tvc.khoa(Image.open(p)); s = np.asarray(sang).astype(np.float32)
    toi = np.clip(1 - (r + b) / 510, 0, 1) * (g < 60)
    toi = np.clip((toi - 0.1) / 0.9, 0, 1)
    o = s.copy()
    m = g < 60
    o[m, 0] = 0; o[m, 1] = 0; o[m, 2] = 0; o[m, 3] = toi[m] * 255
    im = Image.fromarray(np.clip(o, 0, 255).astype(np.uint8), 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    im = tvc.thu(im.crop(bb), w); im.save(os.path.join(tvc.DICH, ra + '.png'), optimize=True); print('E17', ra, im.size)


if __name__ == '__main__' and os.path.exists(os.path.join(tvc.NGUON, 'raw_tv_E17.png')) and (not sys.argv[1:] or 'E17' in sys.argv[1:]):
    bong(os.path.join(tvc.NGUON, 'raw_tv_E17.png'), 'tv_keo_bong', 240)
