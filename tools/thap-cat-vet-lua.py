#!/usr/bin/env python3
"""Cắt dải ChatGPT VỆT LỬA Dragon Dive (Wyrm Engine) → thap/assets/fx_ronglua_vet.png.
Nguồn: docs/demo-hop-tuong/thap-art/raw_fx_ronglua_vet.png (1774×887, 1 hàng 8 ô, nền magenta;
ô 0–5 = lửa cháy lặp, ô 6–7 = tàn than + khói).
Mỗi ô: tách trộn nền magenta (alpha = 1 − phần magenta) → LOANG từ viền ô (vùng gần màu nền nối viền = trong suốt hẳn)
→ khử viền 1 px → bỏ đảo lẻ → làm mềm mép TRÊN/DƯỚI của nền đất cháy (chỉ điểm tối, lửa sáng giữ nguyên)
→ làm mềm 2 ĐẦU ô (ngang) để các đoạn đặt gối lên nhau dọc đường không lộ đường nối → thu Lanczos.
KHÔNG căn tâm từng ô (giữ đúng dải ngang để lát nối dọc đường).
Dùng: python3 tools/thap-cat-vet-lua.py   (in META dán vào js/vfxmoi.js)
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/raw_fx_ronglua_vet.png')
OUT = os.path.join(ROOT, 'thap/assets/fx_ronglua_vet.png')
N = 8
Y0, Y1 = 340, 516          # hàng có hình (dải lửa + tia lửa) trong raw
YC = 438                   # tim dải (đường lõi sáng)
DAU = 0.16                 # phần mỗi đầu ô được làm mềm (đoạn trong game đặt gối 2·DAU)
FW = 200                   # bề ngang khung ra (px) — đủ 3× cỡ hiển thị (~65 px)


def cat_o(c, bg):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    k = np.minimum(r, b) - g
    f = np.clip((k - 18) / (255 - 18 - 25), 0, 1)
    rg = np.zeros(c.shape[:2] + (4,), np.float32)
    for ch in range(3): rg[..., ch] = np.clip((c[..., ch] - f * bg[ch]) / np.maximum(1 - f, 1e-3), 0, 255)
    rg[..., 3] = (1 - f) * 255
    d = np.sqrt(((c - bg) ** 2).sum(2))
    gan = d < 70
    lab, n = ndi.label(gan)
    vien = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nenThat = np.isin(lab, list(vien)) if vien else np.zeros_like(gan)
    nenThat |= d < 22
    rg[nenThat, 3] = 0
    dai = ndi.binary_dilation(nenThat, iterations=1) & ~nenThat
    rg[dai, 3] *= 0.6
    al = rg[..., 3]
    lab, n = ndi.label(al > 24)
    if n:
        sz = ndi.sum(np.ones_like(al), lab, range(1, n + 1))
        for i, s_ in enumerate(sz):
            if s_ < 12: rg[lab == i + 1, 3] = 0
    rg[rg[..., 3] < 6, 3] = 0
    return rg


def main():
    a = np.asarray(Image.open(RAW).convert('RGB')).astype(np.float32)
    bg = np.median(np.concatenate([a[:40].reshape(-1, 3), a[-40:].reshape(-1, 3)]), 0)
    H, W = a.shape[:2]; cw = W / N
    fh = Y1 - Y0
    nh = round(fh * FW / cw)
    strip = np.zeros((nh, FW * N, 4), np.uint8)
    yy = np.arange(Y0, Y1)[:, None] - YC
    # mép trên/dưới nền đất: đất (điểm tối) mờ dần khi xa tim dải > 18 px, hết hẳn ở 40 px (không lộ mép hộp chữ nhật lúc tàn than)
    mv = np.clip((40 - np.abs(yy)) / 22, 0, 1)
    for i in range(N):
        x0, x1 = int(round(i * cw)), int(round((i + 1) * cw))
        o = cat_o(a[Y0:Y1, x0:x1], bg)
        lum = o[..., :3].max(2)
        toi = np.clip((190 - lum) / 80, 0, 1)            # 1 = đất tối, 0 = lửa sáng
        o[..., 3] *= 1 - toi * (1 - mv)
        w = x1 - x0
        xx = (np.arange(w) + 0.5) / w
        e = np.clip(np.minimum(xx, 1 - xx) / DAU, 0, 1)
        o[..., 3] *= (e * e * (3 - 2 * e))[None, :]
        # nhân trước alpha → thu Lanczos → chia lại (không viền tối)
        pm = o.copy(); pm[..., :3] *= pm[..., 3:4] / 255
        im = [np.asarray(Image.fromarray(pm[..., ch].astype(np.float32), 'F').resize((FW, nh), Image.LANCZOS)) for ch in range(4)]
        al = np.clip(im[3], 0, 255)
        rgb = [np.clip(im[ch] * 255 / np.maximum(al, 1e-3), 0, 255) for ch in range(3)]
        strip[:, i * FW:(i + 1) * FW] = np.stack(rgb + [al], 2).astype(np.uint8)
        strip[:, i * FW:(i + 1) * FW][al < 4] = 0
    Image.fromarray(strip, 'RGBA').save(OUT, optimize=True)  # không lượng tử hoá: bảng 256 màu làm bậc thang alpha 2 đầu ô
    # tim dải trong khung ra (tỉ lệ theo chiều cao) — để đặt tâm đúng tim đường
    print({'fx_ronglua_vet': [N, FW, nh]}, 'tim', round((YC - Y0) / fh, 3), 'dày lõi', round(70 / fh, 3))


main()
