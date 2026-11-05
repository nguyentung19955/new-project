# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh "tư vấn B" (trận đấu, TU-VAN-TOAN-BO.txt §E) raw_tv_<Exx>.png → thap/assets/tv_<tên>.png.
Dùng chung khoá magenta / tách khối / thu Lanczos nhân-trước-alpha của tools/thap-cat-tvc.py.
Cỡ = 3 × cỡ CSS lớn nhất ở khung logic 430 (430×932 DPR3 = ×1,0).  Chạy: python3 tools/thap-cat-tvb.py"""
import os, sys, importlib.util
sp = importlib.util.spec_from_file_location('tvc', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'thap-cat-tvc.py'))
tvc = importlib.util.module_from_spec(sp); sp.loader.exec_module(tvc)
from PIL import Image

BANG = {
    'E23': (['tv_hang1', 'tv_hang2', 'tv_hang3', 'tv_hang4'], 210, True),          # tấm cấp sao ở dải xem nhanh / tấm mở rộng ~70×23 css
    'E24': (['tv_mana'], 480, False),                                               # hộp mana 152×54 css
    'E25': (['tv_trieu', 'tv_trieu_an', 'tv_trieu_tat'], 300, True),               # nút triệu hồi 98 css
    'E26': (['tv_ray'], 1160, False),                                               # ray trên 384 css
    'E27': (['tv_trum_bang'], 1250, False),                                         # băng trùm 414×98 css
    'E28': (['tv_dem', 'tv_dem_gap', 'tv_dem_do'], 180, True),                      # chip đếm ngược ~58 css
    'E29': (['tv_xem'], 1190, False),                                               # dải xem nhanh 394×70 css
    'E30': (['tv_xem_rong'], 1220, False),                                          # tấm mở rộng 404 css
    'E31': (['tv_tag_ally', 'tv_tag_rival', 'tv_tag_you', 'tv_tag_shared'], 240, True),  # nhãn bàn ~76 css
    'E18': (['tv_dich1', 'tv_dich2', 'tv_dich3', 'tv_dich4'], 240, True),
    'E22': (['tv_de'], 240, False),
}

BANG_LUOI = {'E20': ['tv_ghep%d' % i for i in range(1, 9)], 'E21': ['tv_lui%d' % i for i in range(1, 5)]}

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


def ke_trong(p, ra, w, cat=0.19):
    """E19: tấm gạch chéo bán trong suốt — tách trộn magenta đúng (p = a·c + (1−a)·M), chỉ lấy LÒNG tấm (bỏ khung góc vàng/đèn cyan:
    ô không ghép được chỉ cần mờ nhẹ, không thêm khung)."""
    import numpy as np
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.clip(np.minimum(r, b) - g, 0, 255)
    al = np.clip(1 - m / 255, 0, 1)
    M = np.array([255, 0, 255], np.float32)
    c = (a - (1 - al)[..., None] * M) / np.maximum(al, 1e-3)[..., None]
    o = np.dstack([np.clip(c, 0, 255), al * 255])
    im = Image.fromarray(o.astype(np.uint8), 'RGBA')
    bb = tvc.khoa(Image.open(p)).getchannel('A').point(lambda v: 255 if v > 200 else 0).getbbox()
    x0, y0, x1, y1 = bb; dx, dy = (x1 - x0) * cat, (y1 - y0) * cat
    im = tvc.thu(im.crop((int(x0 + dx), int(y0 + dy), int(x1 - dx), int(y1 - dy))), w)
    im.save(os.path.join(tvc.DICH, ra + '.png'), optimize=True); print('E19', ra, im.size)


if __name__ == '__main__' and os.path.exists(os.path.join(tvc.NGUON, 'raw_tv_E19.png')) and (not sys.argv[1:] or 'E19' in sys.argv[1:]):
    ke_trong(os.path.join(tvc.NGUON, 'raw_tv_E19.png'), 'tv_khong', 200)


def luoi(e, ten, w, cot, hang=1):
    """Tấm hoạt ảnh cột × hàng ô đều: cắt theo LƯỚI (tia lửa rời không bị tách thành khối riêng), cùng 1 khung = hộp bao chung."""
    p = os.path.join(tvc.NGUON, 'raw_tv_' + e + '.png')
    if not os.path.exists(p): return
    im = tvc.khoa(Image.open(p)); W, H = im.size; cw, ch = W / cot, H / hang
    o = [im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch))) for r in range(hang) for c in range(cot)]
    hop = [x.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox() for x in o]
    hop = [h for h in hop if h]
    x0 = min(h[0] for h in hop); y0 = min(h[1] for h in hop); x1 = max(h[2] for h in hop); y1 = max(h[3] for h in hop)
    # vuông, tâm ô (vòng nổ đặt giữa hốc ụ)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; s = max(x1 - x0, y1 - y0) / 2 + 2
    for x, t in zip(o, ten):
        x = tvc.thu(x.crop((int(cx - s), int(cy - s), int(cx + s), int(cy + s))), w); x.save(os.path.join(tvc.DICH, t + '.png'), optimize=True)
    print(e, ten[0], '…', len(ten), 'khung', x.size)


if __name__ == '__main__':
    for e, cot in (('E20', 8), ('E21', 4)):
        if not sys.argv[1:] or e in sys.argv[1:]:
            luoi(e, BANG_LUOI[e], 300, cot)
