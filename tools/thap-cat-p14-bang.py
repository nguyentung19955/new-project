#!/usr/bin/env python3
"""Cắt 3 tấm FX Freezer (ChatGPT, nền magenta) → dải khung vuông trong suốt cho thap/js/bangfx.js.

  python3 tools/thap-cat-p14-bang.py

raw (docs/demo-hop-tuong/thap-art/): raw_p14_ice_block.png 4x4 · raw_p14_frost_wave.png 4x2 · raw_p14_frost_cast.png 4x2
ra (thap/assets/): fx_p14_khoi.png (16 khung) · fx_p14_song.png (8) · fx_p14_vong.png (8)

Khoá magenta = TÁCH TRỘN màu nền (alpha nhỏ nhất sao cho màu trước nền hợp lệ): băng trong suốt giữ bán trong suốt,
không viền hồng. Thu nhỏ Lanczos nhân-trước-alpha, cỡ khung = 3× cỡ vẽ CSS lớn nhất (QUY-TAC-HINH mục 5).
In ra hệ số KHOI_K = cạnh khung / cạnh thân khối băng (để bangfx.js vẽ thân băng khít 1 ô)."""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, '..', 'docs', 'demo-hop-tuong', 'thap-art')
OUT = os.path.join(HERE, '..', 'thap', 'assets')


def tach_magenta(im):
    a = np.asarray(im.convert('RGB')).astype(np.float64) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.maximum.reduce([1 - r, 1 - b, g])           # c = α·F + (1-α)·(1,0,1) → α nhỏ nhất để F ∈ [0,1]
    al = np.clip((al - 0.045) / 0.955, 0, 1)             # bỏ nhiễu nén gần nền
    M = np.array([1.0, 0.0, 1.0])
    F = (a - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3)
    F = np.clip(F, 0, 1)
    F[al < 0.01] = 0
    return np.dstack([F, al])                            # RGBA thẳng, float


def o_luoi(arr, cot, hang, ins):
    H, W = arr.shape[:2]
    out = []
    for j in range(hang):
        for i in range(cot):
            x0, x1 = round(i * W / cot) + ins, round((i + 1) * W / cot) - ins
            y0, y1 = round(j * H / hang) + ins, round((j + 1) * H / hang) - ins
            out.append(arr[y0:y1, x0:x1].copy())
    return out


def bo_vach(c):
    """vạch kẻ ô trắng mảnh sát mép (tấm ice_block): xoá hàng/cột mép nào gần như đặc toàn bộ."""
    for _ in range(8):
        for sl in [(0, slice(None)), (-1, slice(None)), (slice(None), 0), (slice(None), -1)]:
            if (c[sl][..., 3] > 0.5).mean() > 0.5: c[sl] = 0
    return c


def vuong(c, cx, cy, half):
    """khung vuông 2·half quanh (cx, cy), phần thiếu để trong suốt."""
    n = 2 * half
    o = np.zeros((n, n, 4))
    H, W = c.shape[:2]
    x0, y0 = int(round(cx - half)), int(round(cy - half))
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(W, x0 + n), min(H, y0 + n)
    o[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = c[sy0:sy1, sx0:sx1]
    return o


def thu(c, m):
    """Lanczos nhân-trước-alpha → m×m."""
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4]
    ch = [np.asarray(Image.fromarray((pm[..., k] * 65535).astype(np.uint16).astype(np.int32), 'I').convert('F').resize((m, m), Image.LANCZOS)) / 65535 for k in range(4)]
    pm = np.clip(np.dstack(ch), 0, 1)
    al = pm[..., 3:4]
    rgb = np.where(al > 1e-3, pm[..., :3] / np.maximum(al, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 1), al])


def luu(frames, m, ten):
    s = np.concatenate([thu(f, m) for f in frames], axis=1)
    s[s[..., 3] < 0.012] = 0
    im = Image.fromarray((s * 255).round().astype(np.uint8), 'RGBA')
    p = os.path.join(OUT, ten + '.png')
    im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE).save(p, optimize=True)  # PNG nhẹ như cat-sheet.save_light
    print(ten, im.size, os.path.getsize(p) // 1024, 'KB')


def bbox(c, nguong=0.35):
    m = c[..., 3] > nguong
    ys, xs = np.nonzero(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def main():
    # 1) khối băng 4x4: căn mọi khung theo tâm thân băng khung 5-8 (đứng yên), cạnh khung = cả ô raw
    raw = tach_magenta(Image.open(os.path.join(RAW, 'raw_p14_ice_block.png')))
    cs = [bo_vach(c) for c in o_luoi(raw, 4, 4, 6)]
    bs = [bbox(c) for c in cs[4:8]]
    x0 = np.mean([b[0] for b in bs]); x1 = np.mean([b[2] for b in bs]); y0 = np.mean([b[1] for b in bs]); y1 = np.mean([b[3] for b in bs])
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    than = max(x1 - x0, y1 - y0)
    half = min(cs[0].shape[0], cs[0].shape[1]) // 2
    fr = [vuong(c, cx, cy, half) for c in cs]
    # thân băng vẽ tối đa ~72 px CSS (ô 70×60, R.s 1) → 3× = 216 px; khung = 216·(2·half/than)
    K = 2 * half / than
    m = min(2 * half, int(round(216 * K)))
    luu(fr, m, 'fx_p14_khoi')
    print('KHOI_K =', round(K, 4), '(thân', round(than), 'px / khung', 2 * half, 'px raw)')
    # 2) sóng sương 4x2: căn theo tâm hộp chung (giữ đầu mũi cố định khi lặp), khung vuông
    raw = tach_magenta(Image.open(os.path.join(RAW, 'raw_p14_frost_wave.png')))
    cs = o_luoi(raw, 4, 2, 4)
    bs = [bbox(c, 0.1) for c in cs]
    X0, Y0, X1, Y1 = min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)
    half = int(max(X1 - X0, Y1 - Y0) / 2) + 4
    fr = [vuong(c, (X0 + X1) / 2, (Y0 + Y1) / 2, half) for c in cs]
    luu(fr, min(2 * half, 288), 'fx_p14_song')   # vẽ ≤ 96 px CSS
    # 3) vòng sương 4x2: cả ô, tâm ô
    raw = tach_magenta(Image.open(os.path.join(RAW, 'raw_p14_frost_cast.png')))
    cs = o_luoi(raw, 4, 2, 2)
    half = min(cs[0].shape[:2]) // 2
    fr = [vuong(c, c.shape[1] / 2, c.shape[0] / 2, half) for c in cs]
    luu(fr, min(2 * half, 390), 'fx_p14_vong')   # vẽ ≤ 130 px CSS


if __name__ == '__main__':
    main()
