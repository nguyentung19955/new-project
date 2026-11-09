#!/usr/bin/env python3
"""TURRET MERGE — cắt tấm hiệu ứng anime raw_anime_u_fx1.png (ChatGPT, 2 hàng × 3 cột, nền magenta).

  hàng 1: vuốt 3 vệt TRẮNG (→ fx_soi_vuot, tô màu bằng REN.toMauA) · vòng xung trắng (fx_soi_song, dự trữ) · tia sao trắng (bỏ)
  hàng 2: thân Hydra tròn ngọc lục bảo (→ hydra_than) · thân Hydra thức tỉnh (→ hydra_than_tt, dự trữ) · trống
Tách nền/viền mềm dùng đúng hàm của tools/thap-cat-umod.py (tach, khoa, bbox, dat_giua, thu, luu).
Chạy: RAW_ANIME=<thư mục raw> python3 tools/thap-cat-anime-fx.py
"""
import os, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)
RAW = os.environ.get('RAW_ANIME', os.path.join(GOC, 'docs/demo-hop-tuong/thap-art'))
MON = {(0, 0): ('fx_soi_vuot', 256), (0, 1): ('fx_soi_song', 256), (1, 0): ('hydra_than', 256), (1, 1): ('hydra_than_tt', 256)}

a = np.asarray(Image.open(os.path.join(RAW, 'raw_anime_u_fx1.png')).convert('RGB'))
H, W = a.shape[:2]; ch, cw = H // 2, W // 3
for (r, c), (ten, px) in MON.items():
    o = a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
    m = U.tach(o)[0]
    if m.sum() < 200: print(ten, 'trống'); continue
    k = U.khoa(o.astype(np.float64) / 255, m)
    x0, y0, x1, y1 = U.bbox(k[..., 3] > 0)
    h = max(x1 - x0, y1 - y0) / 2 + 3
    im = U.thu(U.dat_giua(k, (x0 + x1) / 2, (y0 + y1) / 2, h), px)
    if ten.startswith('fx_'): im = im.copy(); im[..., :3] = 1.0  # ảnh tô màu: RGB trắng tuyệt đối (bỏ ám hồng của viền sáng trên nền magenta), giữ alpha
    U.luu(im, ten)
    print(ten, 'ok', px)
