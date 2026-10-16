#!/usr/bin/env python3
"""ẢNH SOÁT thương nâng tay trái (17/10/2026). KHÔNG chạy game: dựng khung y như js/zed_moi.js bằng ve_zed.py (vk-khop-tay),
neo đang dùng = biến thể nắm chuôi + bảng cam-vk-chuan; bản SAU = bảng game/js/thuong_cao_data.js (neo mới + dời cột thân / nắm tay).
Ra (thư mục này): luoi/<hàng>.png — mỗi khung một cột, trên TRƯỚC (?thuongcao=0) / dưới SAU, phóng ×4, cấp vũ khí Trắng;
                  gif-<tên>-x3.gif — trái TRƯỚC | phải SAU, ×3.
Chạy (từ gốc repo): python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/soat.py"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import sua as SU  # noqa: E402
import nang as NG  # noqa: E402

VZ = SU.VZ
HANG_XEM = ['dung~16_thuong', 'di_thuong', 'chay2tay_thuong', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'thuong_giu',
            'thuong_xoc', 'db_thuong']
TEN = {'dung~16_thuong': 'dung', 'di_thuong': 'di', 'chay2tay_thuong': 'chay-hai-tay', 'thuong_1': 'thuong-1', 'thuong_2': 'thuong-2',
       'thuong_3': 'thuong-3', 'thuong_quet': 'quet', 'thuong_giu': 'giu', 'thuong_xoc': 'xoc', 'db_thuong': 'dac-biet'}


def doc_bang():
    s = open(os.path.join(SU.ROOT, 'game/js/thuong_cao_data.js'), encoding='utf-8').read()
    return json.loads(s.split('G.THUONG_CAO_DATA = ', 1)[1].rsplit(';', 1)[0])


def doi_cot(a, ct):
    """Như anhCao (js/zed_moi.js): xoá các đoạn cột rồi vẽ lại dời lên."""
    out = a.copy()
    for c in range(0, len(ct), 4):
        out[ct[c + 1]:ct[c + 2] + 1, ct[c]] = 0
    for c in range(0, len(ct), 4):
        x, y0, y1, s = ct[c:c + 4]
        seg = a[y0:y1 + 1, x]
        for k in range(len(seg)):
            if seg[k, 3] > 0 and 0 <= y0 + k - s < 96:
                out[y0 + k - s, x] = seg[k]
    return out


def khung(T, V, SUA, B, k, i, sau, Z, cap=0):
    """Ảnh RGBA ô (96+2·PAD)·Z của khung; sau=True dùng bảng nâng tay."""
    da = T['dong_tac'][k]
    n = SU.neo_dung(T, SUA, k, i)
    than = SU.o96(T['_img'], da['hang'], i)
    ht = SU.o96(T['_img'], da['nam']['hang_tay'], i)
    r = B['bo']['zed-moi'].get(k, {}).get('khung', {}).get(str(i)) if sau else None
    if r and n and abs(n[0] - r['cu'][0]) < 0.02 and abs(n[1] - r['cu'][1]) < 0.02 and abs(n[2] - r['cu'][2]) < 0.05:
        n = r['neo']; than = doi_cot(than, r['cot']); ht = doi_cot(ht, r['cot'])
    PAD = VZ.PAD; W = (96 + 2 * PAD) * Z
    nen = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    b = Image.fromarray(than).resize((96 * Z, 96 * Z), Image.NEAREST)
    if not n:
        nen.alpha_composite(b, (PAD * Z, PAD * Z)); return nen, False
    nm = da['nam']; tl = nm.get('vk_tl', da['vk_tl']); cam = nm.get('vk_cam', da['vk_cam'])
    g = n[2]
    vk = VZ.ve_vk(Z, V, 'thuong', cap, n, g, tl, cam[cap])
    nt = VZ.nam_tay_cua(V, da, n, g, True)
    if n[3]:
        nen.alpha_composite(vk)
    nen.alpha_composite(b, (PAD * Z, PAD * Z))
    if nt:
        nen.alpha_composite(VZ.ve_nam_tay(Z, V, da, cap, n, g, nt, 'sau'))
    if not n[3]:
        nen.alpha_composite(vk)
    if not nt or nt[2]:
        nen.alpha_composite(Image.fromarray(ht).resize((96 * Z, 96 * Z), Image.NEAREST), (PAD * Z, PAD * Z))
    if nt:
        nen.alpha_composite(VZ.ve_nam_tay(Z, V, da, cap, n, g, nt, 'truoc'))
    return nen, bool(r)


def cat(im, Z, x0=-6, y0=8, w=118, h=86):
    P = VZ.PAD * Z
    o = im.crop((P + x0 * Z, P + y0 * Z, P + (x0 + w) * Z, P + (y0 + h) * Z))
    bg = Image.new('RGBA', o.size, (52, 58, 70, 255)); bg.alpha_composite(o)
    return bg


def main():
    T, V, SUA = SU.tai()
    B = doc_bang()
    os.makedirs(os.path.join(DAY, 'luoi'), exist_ok=True)
    Z = 4
    for k in HANG_XEM:
        so = T['dong_tac'][k]['so']
        o = []
        for i in range(so):
            a, _ = khung(T, V, SUA, B, k, i, False, Z)
            b, doi = khung(T, V, SUA, B, k, i, True, Z)
            o.append((cat(a, Z), cat(b, Z), doi))
        w, h = o[0][0].size
        P = Image.new('RGB', (so * (w + 4), 2 * h + 40), (25, 25, 30))
        d = ImageDraw.Draw(P)
        d.text((4, 2), '%s - tren: TRUOC (?thuongcao=0), duoi: SAU - x4 (moi o = 2x2 diem game), cap Trang' % k, fill=(235, 235, 235))
        for i, (a, b, doi) in enumerate(o):
            P.paste(a, (i * (w + 4), 18)); P.paste(b, (i * (w + 4), 22 + h))
            d.text((i * (w + 4) + 4, 24 + 2 * h), 'khung %d: %s' % (i + 1, 'NANG TAY' if doi else 'giu nhu cu'),
                   fill=(120, 230, 120) if doi else (200, 200, 200))
        P.save(os.path.join(DAY, 'luoi', TEN[k] + '.png'), optimize=True)
        print('Ghi luoi/%s.png' % TEN[k])
    # GIF ×3 trước | sau
    Z = 3
    for ten, hang in (('dung', ['dung~16_thuong']), ('chay', ['chay2tay_thuong']), ('thuong-1-3', ['thuong_1', 'thuong_2', 'thuong_3'])):
        anh = []
        for k in hang:
            for i in range(T['dong_tac'][k]['so']):
                a, _ = khung(T, V, SUA, B, k, i, False, Z)
                b, _ = khung(T, V, SUA, B, k, i, True, Z)
                a, b = cat(a, Z), cat(b, Z)
                f = Image.new('RGB', (a.width * 2 + 6, a.height + 16), (25, 25, 30))
                f.paste(a, (0, 16)); f.paste(b, (a.width + 6, 16))
                d = ImageDraw.Draw(f); d.text((4, 2), 'TRUOC', fill=(230, 230, 230)); d.text((a.width + 10, 2), 'SAU (tay trai nang cao)', fill=(120, 230, 120))
                anh.append(f.convert('P', palette=Image.ADAPTIVE, colors=255))
        ms = 140 if ten != 'chay' else 60
        p = os.path.join(DAY, 'gif-%s-x3.gif' % ten)
        anh[0].save(p, save_all=True, append_images=anh[1:], duration=ms, loop=0, optimize=True)
        print('Ghi %s (%d khung)' % (os.path.basename(p), len(anh)))


if __name__ == '__main__':
    main()
