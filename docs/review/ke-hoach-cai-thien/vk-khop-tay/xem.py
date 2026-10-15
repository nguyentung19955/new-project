#!/usr/bin/env python3
"""Ảnh soát tĩnh nắm chuôi (15/10): mỗi loại vũ khí một tấm xem-<loại>.png — mỗi hàng động tác 2 dòng: TRƯỚC (?namchuoi=0) / SAU,
từng khung, phóng ×3 (ô 96 = game ×2 → ×6 game). Thêm gif-<loại>.gif (đứng → chạy → các đòn, bản SAU, ×3).
Chạy: python3 xem.py [--bo zed-rung]   (dựng y như game bằng ve_zed.py; không cần trình duyệt)"""
import sys, os
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ve_zed as v

DAY = os.path.dirname(os.path.abspath(__file__))
Z = 3
BO = sys.argv[sys.argv.index('--bo') + 1] if '--bo' in sys.argv else 'zed-moi'
HANG = {
    'kiem': ['dung_kiem', 'di_kiem', 'chay_kiem', 'kiem_1', 'kiem_2', 'kiem_3', 'db_kiem'],
    'bua': ['dung_bua', 'di_bua', 'chay_bua', 'bua_nen', 'bua_giu', 'bua_nen_dat', 'db_bua'],
    'thuong': ['dung_thuong', 'di_thuong', 'chay_thuong', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'thuong_giu', 'thuong_xoc', 'db_thuong'],
    'phitieu': ['dung_phitieu', 'di_phitieu', 'chay_phitieu'],
}


def hop(ims):
    bb = None
    for im in ims:
        b = im.getbbox()
        if b:
            bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    return bb


def tam(loai, cap=0):
    T = v.tai(BO)
    dong = []
    for ten in HANG[loai]:
        n = T['dong_tac'][ten]['so']
        cu = [v.khung(ten, i, cap, BO, False, Z) for i in range(n)]
        moi = [v.khung(ten, i, cap, BO, True, Z) for i in range(n)]
        dong.append((ten, cu, moi))
    NHAN, GAP = 150, 6
    rows = []
    for ten, cu, moi in dong:
        bb = hop(cu + moi)
        bb = (bb[0] - 3, bb[1] - 3, bb[2] + 3, bb[3] + 3)
        rows.append((ten, [im.crop(bb) for im in cu], [im.crop(bb) for im in moi]))
    W = NHAN + max(sum(i.width + GAP for i in r[1]) for r in rows)
    H = 30 + sum(2 * (r[1][0].height + GAP) + 10 for r in rows)
    P = Image.new('RGBA', (W, H), (40, 44, 52, 255)); d = ImageDraw.Draw(P)
    d.text((6, 8), 'Nam chuoi 15/10 - %s - %s cap %d (x3). Moi hang: TREN = truoc (?namchuoi=0), DUOI = sau.' % (BO, loai, cap + 1), fill=(235, 235, 235))
    y = 30
    for ten, cu, moi in rows:
        for nhan, ds in (('truoc', cu), ('SAU', moi)):
            d.text((6, y + ds[0].height // 2 - 12), ten, fill=(235, 235, 235))
            d.text((6, y + ds[0].height // 2 + 2), nhan, fill=(150, 220, 150) if nhan == 'SAU' else (200, 170, 170))
            x = NHAN
            for im in ds:
                P.alpha_composite(im, (x, y)); d.rectangle([x, y, x + im.width - 1, y + im.height - 1], outline=(70, 75, 85))
                x += im.width + GAP
            y += ds[0].height + GAP
        y += 10
    return P, dong


def gif(loai, dong, p):
    fr = []
    for ten, cu, moi in dong:
        lap = 2 if ten.startswith(('dung', 'di', 'chay')) else 1
        fr += moi * lap
    bb = hop(fr)
    fr = [f.crop(bb) for f in fr]
    out = []
    for f in fr:
        n = Image.new('RGBA', f.size, (40, 44, 52, 255)); n.alpha_composite(f); out.append(n.convert('P', palette=Image.ADAPTIVE))
    out[0].save(p, save_all=True, append_images=out[1:], duration=110, loop=0, disposal=2)


def phi_bay(p):
    """Phi tiêu đang bay (js/zed_moi.js vePhiTieu): cấp 1..4, ném thường / ném chùm, TRƯỚC vs SAU (×1,3), phóng ×6 điểm ảnh game."""
    V = v.tai('zed-vk'); r0 = V['vk']['phitieu'][0]; Zb = 6
    o = []
    for to in (1.0, 1.3):
        hang = []
        for big in (0, 1):
            for cap in range(4):
                r = V['vk']['phitieu'][cap]
                F = (11 if big else 8) / max(r0[2], r0[3]) * to * Zb
                a = V['_img'].crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
                hang.append(a.resize((max(1, round(a.width * F)), max(1, round(a.height * F))), Image.NEAREST))
        o.append(hang)
    W = 150 + max(sum(i.width + 20 for i in h) for h in o); H = 30 + sum(max(i.height for i in h) + 20 for h in o)
    P = Image.new('RGBA', (W, H), (40, 44, 52, 255)); d = ImageDraw.Draw(P)
    d.text((6, 8), 'Phi tieu dang bay (x6 diem anh game): cap 1-4 nem thuong, cap 1-4 nem chum. Vung trung KHONG doi.', fill=(235, 235, 235))
    y = 30
    for nhan, h in zip(('truoc', 'SAU x1,3'), o):
        d.text((6, y + 10), nhan, fill=(235, 235, 235)); x = 150
        for i in h:
            P.alpha_composite(i, (x, y)); x += i.width + 20
        y += max(i.height for i in h) + 20
    P.convert('RGB').save(p)


if __name__ == '__main__':
    hau = '' if BO == 'zed-moi' else '-' + BO.split('-')[1]
    for loai in HANG:
        P, dong = tam(loai)
        P.convert('RGB').save(os.path.join(DAY, 'xem-%s%s.png' % (loai, hau)), optimize=True)
        print('xem-%s%s.png' % (loai, hau), P.size)
        if not hau:
            gif(loai, dong, os.path.join(DAY, 'gif-%s.gif' % loai)); print('gif-%s.gif' % loai)
    if not hau:
        phi_bay(os.path.join(DAY, 'xem-phitieu-bay.png')); print('xem-phitieu-bay.png')
