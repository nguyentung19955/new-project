#!/usr/bin/env python3
"""Ảnh soát tĩnh đợt 2 (16/10, bao-cao-2.md): nắm tay từ ảnh + chạy hai tay. Dựng y như game bằng ve_zed.py (không trình duyệt).
Ra (thư mục này):
  xem2-<loại>.png   mỗi hàng động tác 2 dòng: TRƯỚC (bản 15/10: lớp ngón tự vẽ, chạy hàng cũ) / SAU (nắm tay từ ảnh, chạy hai tay
                    với thương/búa), từng khung, phóng ×3 (ô 96 → game ×6)
  xem2-can-tay.png  cận cảnh nắm tay (×8) vài khung tiêu biểu: trái = trước, phải = sau
  xem2-nam-tay.png  các ô nắm tay đã cắt (4 góc × lớp SAU / TRƯỚC, mỗi cỡ) phóng ×12, cạnh ảnh gốc thu nhỏ
  gif2-<loại>.gif   GIF trước | sau cạnh nhau: đứng → đi → chạy → các đòn (×3)
Chạy: python3 xem2.py [--bo zed-rung]"""
import sys, os
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ve_zed as v

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '../../../..'))
Z = 3
BO = sys.argv[sys.argv.index('--bo') + 1] if '--bo' in sys.argv else 'zed-moi'
HANG = {
    'kiem': ['dung_kiem', 'di_kiem', 'chay_kiem', 'kiem_1', 'kiem_2', 'kiem_3', 'db_kiem'],
    'thuong': ['dung_thuong', 'di_thuong', 'chay_thuong', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'thuong_giu', 'thuong_xoc', 'db_thuong'],
    'bua': ['dung_bua', 'di_bua', 'chay_bua', 'bua_nen', 'bua_giu', 'bua_nen_dat', 'db_bua'],
    'phitieu': ['dung_phitieu', 'di_phitieu', 'chay_phitieu'],
}
NEN = (40, 44, 52, 255)


def ten_sau(T, ten):
    """Hàng game vẽ ở bản SAU: chạy cầm thương / búa → chay2tay_<loại> nếu bộ có."""
    if ten in ('chay_thuong', 'chay_bua') and 'chay2tay_' + ten[5:] in T['dong_tac']:
        return 'chay2tay_' + ten[5:]
    return ten


def hop(ims):
    bb = None
    for im in ims:
        b = im.getbbox()
        if b:
            bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    return bb


def dung_hang(loai, cap=0):
    T = v.tai(BO); ra = []
    for ten in HANG[loai]:
        n = T['dong_tac'][ten]['so']; t2 = ten_sau(T, ten)
        cu = [v.khung(ten, i, cap, BO, True, Z, anh=False) for i in range(n)]
        moi = [v.khung(t2, i, cap, BO, True, Z, anh=True) for i in range(T['dong_tac'][t2]['so'])]
        ra.append((ten if t2 == ten else '%s -> %s' % (ten, t2), cu, moi))
    return ra


def tam(loai, dong, cap=0):
    NHAN, GAP = 190, 6
    rows = []
    for ten, cu, moi in dong:
        bb = hop(cu + moi); bb = (bb[0] - 3, bb[1] - 3, bb[2] + 3, bb[3] + 3)
        rows.append((ten, [im.crop(bb) for im in cu], [im.crop(bb) for im in moi]))
    W = NHAN + max(sum(i.width + GAP for i in r[k]) for r in rows for k in (1, 2))
    H = 30 + sum(2 * (r[1][0].height + GAP) + 10 for r in rows)
    P = Image.new('RGBA', (W, H), NEN); d = ImageDraw.Draw(P)
    d.text((6, 8), '16/10 - %s - %s cap %d (x3). Moi hang: TREN = truoc (?ngonanh=0&chay2tay=0), DUOI = sau (nam tay tu anh, chay 2 tay).' % (BO, loai, cap + 1), fill=(235, 235, 235))
    y = 30
    for ten, cu, moi in rows:
        for nhan, ds in (('truoc', cu), ('SAU', moi)):
            d.text((6, y + ds[0].height // 2 - 12), ten, fill=(235, 235, 235))
            d.text((6, y + ds[0].height // 2 + 2), nhan, fill=(150, 220, 150) if nhan == 'SAU' else (200, 170, 170))
            x = NHAN
            for im in ds:
                P.alpha_composite(im, (x, y)); d.rectangle([x, y, x + im.width - 1, y + im.height - 1], outline=(70, 75, 85)); x += im.width + GAP
            y += ds[0].height + GAP
        y += 10
    return P


def gif(dong, p):
    cu, moi = [], []
    for ten, c, m in dong:
        lap = 2 if ten.startswith(('dung', 'di', 'chay')) else 1
        n = max(len(c), len(m))
        cu += [c[i % len(c)] for i in range(n)] * lap; moi += [m[i % len(m)] for i in range(n)] * lap
    bb = hop(cu + moi)
    out = []
    for a, b in zip(cu, moi):
        a, b = a.crop(bb), b.crop(bb)
        f = Image.new('RGBA', (a.width * 2 + 12, a.height + 16), NEN); f.alpha_composite(a, (0, 16)); f.alpha_composite(b, (a.width + 12, 16))
        d = ImageDraw.Draw(f); d.text((4, 2), 'truoc', fill=(200, 170, 170)); d.text((a.width + 16, 2), 'SAU', fill=(150, 220, 150))
        out.append(f.convert('P', palette=Image.ADAPTIVE))
    out[0].save(p, save_all=True, append_images=out[1:], duration=110, loop=0, disposal=2)


def can_tay(p):
    T = v.tai(BO); Zc = 8; o = []
    for ten, i in [('dung_kiem', 0), ('kiem_1', 2), ('kiem_3', 1), ('dung_thuong', 0), ('thuong_1', 2), ('thuong_quet', 2),
                   ('dung_bua', 0), ('bua_nen', 2), ('dung_phitieu', 0), ('chay_thuong', 0), ('chay_bua', 6)]:
        t2 = ten_sau(T, ten); ve_ = []
        for tt, anh in ((ten, False), (t2, True)):
            da = T['dong_tac'][tt]; n = da['nam']['neo'][i]
            im = v.khung(tt, i, 0, BO, True, Zc, anh=anh)
            cx, cy = (n[0] + v.PAD) * Zc, (n[1] + v.PAD) * Zc
            c = im.crop((int(cx - 18 * Zc), int(cy - 12 * Zc), int(cx + 18 * Zc), int(cy + 12 * Zc)))
            bg = Image.new('RGBA', c.size, NEN); bg.alpha_composite(c); ve_.append(bg)
        o.append((ten if t2 == ten else ten + ' -> ' + t2, i, ve_))
    w, h = o[0][2][0].size
    P = Image.new('RGBA', (2 * w + 230, len(o) * (h + 6) + 24), (20, 22, 26, 255)); d = ImageDraw.Draw(P)
    d.text((6, 6), 'Can canh nam tay (x8 o 96): trai = truoc (lop ngon tu ve), phai = SAU (nam tay tu anh)', fill=(235, 235, 235))
    for k, (ten, i, ve_) in enumerate(o):
        y = 24 + k * (h + 6)
        d.text((6, y + h // 2), '%s k%d' % (ten, i + 1), fill=(235, 235, 235))
        P.alpha_composite(ve_[0], (224, y)); P.alpha_composite(ve_[1], (224 + w + 6, y))
    P.convert('RGB').save(p, optimize=True)


def o_nam_tay(p):
    V = v.tai('zed-vk'); NT = V['nam_tay']; Zn = 12
    goc = Image.open(os.path.join(ROOT, 'docs/anh-goc/zed/moi/20-nam-tay-om-can.png')).convert('RGB')
    goc.thumbnail((1000, 400))
    hang = []
    for D in sorted(NT['sau'], key=int):
        r_ = []
        for k in range(len(NT['goc'])):
            for lop in ('sau', 'truoc'):
                r = NT[lop][D][k]; a = V['_img'].crop((r[0], r[1], r[0] + r[2], r[1] + r[3])).resize((r[2] * Zn, r[3] * Zn), Image.NEAREST)
                b = Image.new('RGBA', a.size, (90, 140, 90, 255)); b.alpha_composite(a)
                dd = ImageDraw.Draw(b); dd.ellipse([r[4] * Zn - 3, r[5] * Zn - 3, r[4] * Zn + 3, r[5] * Zn + 3], outline=(255, 255, 0))
                r_.append((lop, k, b))
        hang.append((D, r_))
    W = max(goc.width, max(sum(b.width + 14 for _, _, b in r_) for _, r_ in hang) + 110)
    H = goc.height + 40 + sum(max(b.height for _, _, b in r_) + 34 for _, r_ in hang)
    P = Image.new('RGB', (W, H), (30, 32, 36)); d = ImageDraw.Draw(P)
    P.paste(goc, (0, 20)); d.text((6, 4), 'Anh goc 20-nam-tay-om-can.png (thu nho). Goc do (quy uoc game, duong = chuc xuong): %s' % NT['goc'], fill=(235, 235, 235))
    y = goc.height + 40
    for D, r_ in hang:
        loai = [l for l, c in NT['co'].items() if str(c) == D]
        d.text((6, y + 10), 'D=%s (%s)' % (D, ','.join(loai)), fill=(235, 235, 235)); x = 110
        for lop, k, b in r_:
            d.text((x, y), '%s %+.0f' % (lop, NT['goc'][k]), fill=(200, 200, 200)); P.paste(b.convert('RGB'), (x, y + 14)); x += b.width + 14
        y += max(b.height for _, _, b in r_) + 34
    P.save(p, optimize=True)


if __name__ == '__main__':
    hau = '' if BO == 'zed-moi' else '-' + BO.split('-')[1]
    for loai in HANG:
        dong = dung_hang(loai)
        tam(loai, dong).convert('RGB').save(os.path.join(DAY, 'xem2-%s%s.png' % (loai, hau)), optimize=True); print('xem2-%s%s.png' % (loai, hau))
        if not hau:
            gif(dong, os.path.join(DAY, 'gif2-%s.gif' % loai)); print('gif2-%s.gif' % loai)
    can_tay(os.path.join(DAY, 'xem2-can-tay%s.png' % hau)); print('xem2-can-tay%s.png' % hau)
    if not hau:
        o_nam_tay(os.path.join(DAY, 'xem2-nam-tay.png')); print('xem2-nam-tay.png')
