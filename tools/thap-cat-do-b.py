#!/usr/bin/env python3
# TURRET MERGE — cắt ảnh nhóm B (Sói Máy / Hydra / Chúa Tổ) từ tờ ChatGPT nền magenta 2×2 (docs/demo-hop-tuong/thap-art/raw_gc_*.png)
#   raw_gc_soi_thuong   : [cả ụ · bệ · ĐẦU sói thường (nòng hướng XUỐNG) · nòng]   → soi_dau_thuong.png
#   raw_gc_soi_thuctinh : [cả ụ · bệ · ĐẦU sói thức tỉnh (3 nòng hướng XUỐNG) · 3 nòng] → soi_dau_thuctinh.png
#   raw_gc_hydra_dau    : [đầu ngậm (hướng LÊN) · đầu há · mẫu 7 đầu · đạn]        → hydra_dau.png, hydra_dau_ha.png, fx_hydra_vien.png
#   raw_gc_chuato_drone : [drone bay vòng · drone lao · vệt · nổ]                  → fx_hive_drone.png, fx_hive_lao.png, fx_hive_vet.png, fx_hive_no.png
# Ảnh giữ NGUYÊN HƯỚNG như tờ vẽ (đầu nhìn thẳng lên/xuống) — code xoay theo hướng bắn (skills2.js veDau Sói, skills3.js veDau Hydra).
# Chạy: python3 tools/thap-cat-do-b.py   (gốc repo)
import os, numpy as np
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(R, 'docs/demo-hop-tuong/thap-art'); OUT = os.path.join(R, 'thap/assets')

def khoa(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    al = np.clip((0.78 - m) / (0.78 - 0.42), 0, 1)
    M = np.array([255, 0, 255], np.float32)
    A = np.maximum(al, 1e-3)[..., None]
    F = np.clip((a - (1 - al)[..., None] * M) / A, 0, 255)
    F = np.where(al[..., None] > 0.999, a, F)
    return Image.fromarray(np.dstack([F, al * 255]).astype(np.uint8), 'RGBA')

def thu(im, w):  # Lanczos nhân-trước-alpha
    a = np.asarray(im).astype(np.float32) / 255
    pm = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3]])
    h = max(1, round(im.size[1] * w / im.size[0]))
    ch = [Image.fromarray((pm[..., i] * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c).astype(np.float32) / 255 for c in ch])
    A = q[..., 3:4]; rgb = np.where(A > 1e-4, q[..., :3] / np.maximum(A, 1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), A]) * 255).astype(np.uint8), 'RGBA')

def o(ten, i):  # ô thứ i (0..3) của tờ 2×2, đã tách nền + cắt sát
    s = khoa(Image.open(os.path.join(SRC, ten + '.png'))); W, H = s.size
    x, y = i % 2, i // 2
    c = s.crop((x * W // 2, y * H // 2, (x + 1) * W // 2, (y + 1) * H // 2))
    a = np.asarray(c)[..., 3]; a = np.where(a > 24, 255, 0).astype(np.uint8)
    # giữ dải hàng liền nhau DÀI NHẤT (bỏ mẩu ô bên cạnh lọt vào mép ô)
    hang = a.max(axis=1) > 0; best = (0, 0); i0 = None
    for k, v in enumerate(list(hang) + [False]):
        if v and i0 is None: i0 = k
        if not v and i0 is not None:
            if k - i0 > best[1] - best[0]: best = (i0, k)
            i0 = None
    a[:best[0]] = 0; a[best[1]:] = 0
    bb = Image.fromarray(a).getbbox()
    return c.crop(bb)

def luu(im, w, ten, xoay=0):
    if xoay: im = im.rotate(xoay, expand=True)  # đạn: quay mũi sang PHẢI (+x) như mọi ảnh đạn (render.js xoay theo hướng bay)
    im = thu(im, w); im.save(os.path.join(OUT, ten + '.png'), optimize=True); print(ten, im.size)

luu(o('raw_gc_soi_thuong', 2), 200, 'soi_dau_thuong')
luu(o('raw_gc_soi_thuctinh', 2), 220, 'soi_dau_thuctinh')
luu(o('raw_gc_hydra_dau', 0), 96, 'hydra_dau')
luu(o('raw_gc_hydra_dau', 1), 96, 'hydra_dau_ha')
luu(o('raw_gc_hydra_dau', 3), 134, 'fx_hydra_vien', -90)  # tên riêng: fx_hydra_dan đã có (đạn v2 FXU)
luu(o('raw_gc_chuato_drone', 0), 72, 'fx_hive_drone')
luu(o('raw_gc_chuato_drone', 1), 64, 'fx_hive_lao')
luu(o('raw_gc_chuato_drone', 2), 48, 'fx_hive_vet')
luu(o('raw_gc_chuato_drone', 3), 120, 'fx_hive_no')
