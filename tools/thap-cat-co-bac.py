#!/usr/bin/env python3
"""TURRET MERGE — cắt ảnh ChatGPT của ụ cờ bạc LUCKY SLOT (cobac, 08/11) vào thap/assets/.

Nguồn (docs/demo-hop-tuong/thap-art/):
  raw_cb_icon.png   1536×1024 lưới 3×2 nền magenta: cam · dưa hấu · nho / khung cửa sổ máy xèng · nổ JACKPOT · xu vàng sao đỏ
  raw_cb_no.png     dải 8 khung nổ JACKPOT (nền ĐEN, vẽ cộng sáng 'lighter') — không có thì bỏ qua
  (đầu/bệ/phần phụ: raw_mod_cobac.png → tools/thap-cat-umod.py cobac · chân dung: tools/thap-cat-chandung.py cobac)
Ra: cb_cam.png / cb_dua.png / cb_nho.png 128 px (icon quả: khay thẻ + cuộn xèng) · cb_khung.png (khung cửa sổ, rộng 256)
    cb_no_ic.png 160 px (huy hiệu nổ) · cb_xu.png 64 px (đạn xu) · fx_cb_no.png (8 khung × 192, nền đen)
Tách nền: loang magenta từ viền mỗi ô + vũng magenta kín bên trong; viền mềm theo độ lệch magenta (không viền hồng).
Chạy (gốc repo): python3 tools/thap-cat-co-bac.py
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(R, 'docs/demo-hop-tuong/thap-art')
A = os.path.join(R, 'thap/assets')


def tach(cell):
    a = np.asarray(cell.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # độ "magenta": R và B cao, G thấp
    d = np.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)   # khoảng cách tới #FF00FF (nho tím KHÔNG bị coi là nền)
    m = np.clip(1 - d / 220.0, 0, 1)
    nen = d < 80
    lab, n = nd.label(nen)
    ke = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen2 = np.isin(lab, list(ke))
    # vũng magenta kín bên trong (lớn) cũng là nền
    for i in range(1, n + 1):
        if i in ke: continue
        k = lab == i
        if k.sum() > 400 and (d[k] < 40).mean() > 0.5: nen2 |= k
    alpha = np.where(nen2, 0.0, 1.0)
    # dải mép: alpha mềm theo độ magenta, khử màu hồng
    vien = nd.binary_dilation(nen2, iterations=2) & ~nen2
    mm = np.clip((m - 0.25) / 0.45, 0, 1)
    alpha = np.where(vien, 1 - mm, alpha)
    out = a.copy()
    k = alpha[..., None]
    pha = np.where(vien[..., None], np.clip((a - (1 - k) * np.array([255, 0, 255])) / np.maximum(k, 0.05), 0, 255), a)
    out = pha
    # bỏ đảo nhỏ rời
    dac = alpha > 0.5
    lab2, n2 = nd.label(dac)
    if n2 > 1:
        sz = nd.sum(dac, lab2, range(1, n2 + 1)); lon = sz.max()
        for i, s in enumerate(sz, 1):
            if s < lon * 0.01: alpha[lab2 == i] = 0
    img = Image.fromarray(np.dstack([out, alpha * 255]).astype(np.uint8), 'RGBA')
    bb = img.getbbox()
    return img.crop(bb)


def vua(img, n, rong=None):
    w, h = img.size
    if rong:
        k = rong / w; return img.resize((rong, max(1, round(h * k))), Image.LANCZOS)
    s = max(w, h); c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(img, ((s - w) // 2, (s - h) // 2))
    p = round(s * 0.04); c2 = Image.new('RGBA', (s + 2 * p, s + 2 * p), (0, 0, 0, 0)); c2.paste(c, (p, p))
    return c2.resize((n, n), Image.LANCZOS)


def main():
    im = Image.open(os.path.join(SRC, 'raw_cb_icon.png')).convert('RGB')
    W, H = im.size; cw, ch = W // 3, H // 2
    o = lambda i: im.crop(((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch))
    for i, ten in enumerate(['cb_cam', 'cb_dua', 'cb_nho']):
        vua(tach(o(i)), 128).save(os.path.join(A, ten + '.png'), optimize=True)
    vua(tach(o(3)), 0, rong=256).save(os.path.join(A, 'cb_khung.png'), optimize=True)
    vua(tach(o(4)), 160).save(os.path.join(A, 'cb_no_ic.png'), optimize=True)
    vua(tach(o(5)), 64).save(os.path.join(A, 'cb_xu.png'), optimize=True)
    p = os.path.join(SRC, 'raw_cb_no.png')
    if os.path.exists(p):
        s = Image.open(p).convert('RGB'); w, h = s.size; fw = w / 8
        out = Image.new('RGB', (8 * 192, 192))
        for i in range(8):
            f = s.crop((round(i * fw), 0, round((i + 1) * fw), h))
            fs = min(f.size); f = f.crop(((f.width - fs) // 2, (f.height - fs) // 2, (f.width - fs) // 2 + fs, (f.height - fs) // 2 + fs))
            out.paste(f.resize((192, 192), Image.LANCZOS), (i * 192, 0))
        # nền đen → alpha theo độ sáng (để vẽ đúng trên lớp trong suốt; vẫn có thể cộng sáng)
        a = np.asarray(out).astype(np.float32); al = np.clip((a.max(axis=2) - 14) / 200.0, 0, 1)
        rgb = np.clip(a / np.maximum(al[..., None], 1e-3), 0, 255) * (al[..., None] > 0)
        Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA').save(os.path.join(A, 'fx_cb_no.png'), optimize=True)
    print('xong')


if __name__ == '__main__':
    main()
