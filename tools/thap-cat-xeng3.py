#!/usr/bin/env python3
"""TURRET MERGE — cắt ảnh ChatGPT máy xèng 3 Ô của LUCKY SLOT (cobac, 08/11) vào thap/assets/.

Nguồn: docs/demo-hop-tuong/thap-art/raw_cb_xeng3.png (1536×1024, lưới 3×2 nền magenta):
  khung 3 ô · khung dừng "cạch" · vòng sáng cặp · biểu tượng quay lại · bùng nổ JACKPOT · (băng rôn — chưa dùng)
Ra: cb_khung3.png (rộng 320) + in toạ độ 3 ô kính (phần trăm, chép vào CB.K3 trong thap/js/jackpot.js)
    cb_dung.png 128 · cb_cap.png 128 · cb_lai.png 128 · cb_jp.png 256
    cb_cam_m / cb_dua_m / cb_nho_m.png: bản MỜ CHUYỂN ĐỘNG (nhoè dọc) của icon quả cb_cam/cb_dua/cb_nho — cuộn đang quay.
Tách nền: dùng tach() của tools/thap-cat-co-bac.py.
Chạy (gốc repo): python3 tools/thap-cat-xeng3.py
"""
import os, importlib.util
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
spec = importlib.util.spec_from_file_location('cb', os.path.join(R, 'tools', 'thap-cat-co-bac.py'))
cb = importlib.util.module_from_spec(spec); spec.loader.exec_module(cb)
A = os.path.join(R, 'thap/assets')


def o_kinh(img):
    """3 ô kính tối (xanh navy) trong khung: trả [(x0,y0,w,h) phần trăm]."""
    a = np.asarray(img).astype(np.int32); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    toi = (al > 200) & (r < 70) & (g < 80) & (b < 110) & (b >= r)
    toi = nd.binary_opening(toi, iterations=2)
    lab, n = nd.label(toi); ds = []
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) > toi.size * 0.02: ds.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    ds.sort(); H, W = toi.shape
    return [(round(x0 / W * 100, 1), round(y0 / H * 100, 1), round((x1 - x0) / W * 100, 1), round((y1 - y0) / H * 100, 1)) for x0, y0, x1, y1 in ds]


def khu_hong(img):
    """khử viền hồng (magenta lẫn vào quầng sáng mềm): phần min(R,B) − G dư → giảm alpha + trừ khỏi R/B."""
    a = np.asarray(img).astype(np.float32); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    sp = np.clip(np.minimum(r, b) - g, 0, 255)
    a[..., 0] = np.clip(r - sp, 0, 255); a[..., 2] = np.clip(b - sp, 0, 255)
    a[..., 3] = al * np.clip(1 - sp / 90.0, 0, 1)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def mo_dong(ten):
    """icon quả → bản nhoè dọc (mờ chuyển động) cùng cỡ, kéo dài 1 chút theo trục dọc."""
    im = Image.open(os.path.join(A, ten + '.png')).convert('RGBA')
    a = np.asarray(im).astype(np.float32) / 255.0
    pre = a[..., :3] * a[..., 3:4]
    k = 23; ker = np.ones(k) / k
    pm = nd.convolve1d(pre, ker, axis=0, mode='constant'); am = nd.convolve1d(a[..., 3], ker, axis=0, mode='constant')
    rgb = np.where(am[..., None] > 1e-3, pm / np.maximum(am[..., None], 1e-3), 0)
    out = np.dstack([np.clip(rgb, 0, 1) * 255, np.clip(am * 1.15, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(os.path.join(A, ten + '_m.png'), optimize=True)


def main():
    im = Image.open(os.path.join(R, 'docs/demo-hop-tuong/thap-art/raw_cb_xeng3.png')).convert('RGB')
    W, H = im.size; cw, ch = W // 3, H // 2
    o = lambda i: im.crop(((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch))
    k = khu_hong(cb.vua(cb.tach(o(0)), 0, rong=320)); k.save(os.path.join(A, 'cb_khung3.png'), optimize=True)
    print('cb_khung3', k.size, 'ô kính %:', o_kinh(k))
    khu_hong(cb.vua(cb.tach(o(1)), 128)).save(os.path.join(A, 'cb_dung.png'), optimize=True)
    khu_hong(cb.vua(cb.tach(o(2)), 128)).save(os.path.join(A, 'cb_cap.png'), optimize=True)
    khu_hong(cb.vua(cb.tach(o(3)), 128)).save(os.path.join(A, 'cb_lai.png'), optimize=True)
    khu_hong(cb.vua(cb.tach(o(4)), 256)).save(os.path.join(A, 'cb_jp.png'), optimize=True)
    for t in ['cb_cam', 'cb_dua', 'cb_nho']: mo_dong(t)
    print('xong')


if __name__ == '__main__':
    main()
