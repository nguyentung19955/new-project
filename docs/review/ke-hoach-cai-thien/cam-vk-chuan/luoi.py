#!/usr/bin/env python3
"""Ảnh lưới soát cầm vũ khí (cam-vk-chuan): mỗi ô = một khung × cấp, phóng ×4 (ô 96 → 4 điểm ảnh / đơn vị = ×8 điểm ảnh game),
cắt quanh tay cầm. Đánh dấu:
  chấm VÀNG  = điểm cầm (tâm nắm tay phải game dùng)     chữ thập ĐỎ = tâm nắm tay phải đo trên ảnh thân
  chấm XANH LAM = tay thứ hai (neo)                       chữ thập CAM = tay thứ hai đo trên ảnh thân
  vạch HỒNG = trục vũ khí (qua điểm cầm, theo góc)        viền XANH LÁ = lớp ngón / nắm tay vẽ ĐÈ lên cán
  khung ĐỎ quanh ô = khung còn lỗi (mã lỗi ghi dưới ô)."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import do_cam as DC

Z = 4
CUA = 40          # nửa cạnh ô cắt (đơn vị ô 96)
NEN = (58, 72, 92, 255)


def font(s=12):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(p, s)
        except OSError:
            pass
    return ImageFont.load_default()


F = font(12)


def o_khung(T, V, key, i, cap, neo=None, cam=None, tam=None):
    nen, chu, info = DC.dung(T, V, key, i, cap, neo, cam, Z=Z)
    r = DC.do_khung(T, V, key, i, cap, neo, cam) if info else None
    P = DC.VZ.PAD * Z
    n = info['n'] if info else None
    c = tam or ((n[0], n[1]) if n else (48, 55))
    x0, y0 = int(P + (c[0] - CUA) * Z), int(P + (c[1] - CUA) * Z)
    im = Image.new('RGBA', nen.size, NEN); im.alpha_composite(nen)
    if info:
        a = np.array(im)
        lop = (chu == DC.LOP['nam_truoc']) | (chu == DC.LOP['tay_than'])
        vien = lop & ~np.roll(lop, 1, 0) | lop & ~np.roll(lop, -1, 0) | lop & ~np.roll(lop, 1, 1) | lop & ~np.roll(lop, -1, 1)
        a[vien] = (60, 230, 90, 255)
        im = Image.fromarray(a)
    d = ImageDraw.Draw(im)
    if info:
        X = lambda v: P + v * Z
        g = math.radians(n[2]); cg, sg = math.cos(g), math.sin(g)
        d.line([(X(n[0] - cg * 30), X(n[1] - sg * 30)), (X(n[0] + cg * 30), X(n[1] + sg * 30))], fill=(255, 80, 220, 255), width=1)
        def cham(p, col):
            d.ellipse((X(p[0]) - 3, X(p[1]) - 3, X(p[0]) + 3, X(p[1]) + 3), fill=col)
        def chu_thap(p, col):
            d.line([(X(p[0]) - 6, X(p[1])), (X(p[0]) + 6, X(p[1]))], fill=col, width=2)
            d.line([(X(p[0]), X(p[1]) - 6), (X(p[0]), X(p[1]) + 6)], fill=col, width=2)
        if r and r.get('P'):
            chu_thap(r['P'], (255, 40, 40, 255))
        if len(n) > 4 and n[4]:
            cham(n[4], (60, 160, 255, 255))
            if r and r.get('T'):
                chu_thap(r['T'], (255, 150, 30, 255))
        cham(n, (255, 230, 0, 255))
    o = im.crop((x0, y0, x0 + 2 * CUA * Z, y0 + 2 * CUA * Z))
    return o, r


def luoi(T, V, key, caps, sua=None, tieu_de=''):
    """Ảnh lưới: hàng = khung, cột = cấp (TRƯỚC) | cấp (SAU nếu có bảng sửa). sua(key, i, cap) → (neo, cam) hoặc None."""
    da = T['dong_tac'][key]
    S = 2 * CUA * Z
    cot = [(cap, False) for cap in caps] + ([(cap, True) for cap in caps] if sua else [])
    W = S * len(cot) + 40 + (20 if sua else 0)
    H = (S + 18) * da['so'] + 40
    out = Image.new('RGBA', (W, H), (24, 24, 30, 255))
    d = ImageDraw.Draw(out)
    d.text((6, 6), tieu_de, fill=(255, 255, 255, 255), font=font(16))
    dem = {False: 0, True: 0}
    for j, (cap, sau) in enumerate(cot):
        x = 40 + j * S + (20 if sau else 0)
        d.text((x + 4, 24), ('SAU ' if sau else 'TRƯỚC ') + 'cấp %d' % (cap + 1), fill=(255, 255, 160, 255), font=F)
    for i in range(da['so']):
        y = 40 + i * (S + 18)
        d.text((6, y + S // 2), 'k%d' % (i + 1), fill=(255, 255, 255, 255), font=F)
        tam = None
        for j, (cap, sau) in enumerate(cot):
            x = 40 + j * S + (20 if sau else 0)
            neo = cam = None
            if sau:
                nc = sua(key, i, cap)
                if nc:
                    neo, cam = nc
            o, r = o_khung(T, V, key, i, cap, neo, cam, tam=None)
            out.paste(o, (x, y))
            if r and r['loi']:
                dem[sau] += 1
                d.rectangle((x, y, x + S - 1, y + S - 1), outline=(255, 40, 40, 255), width=3)
                d.text((x + 3, y + S + 2), ','.join(r['loi']), fill=(255, 120, 120, 255), font=F)
            elif r is None:
                d.text((x + 3, y + S + 2), '(không vũ khí)', fill=(160, 160, 160, 255), font=F)
    return out, dem
