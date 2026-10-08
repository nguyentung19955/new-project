#!/usr/bin/env python3
"""Chuyển ảnh vẽ phẳng (từ Pippit hoặc công cụ khác) thành hình pixel cho game.

Các bước: tách nền -> (tuỳ chọn) tách từng mảnh rời -> thu nhỏ về đúng cỡ
-> giảm số màu -> thêm viền tối -> xuất PNG nền trong suốt kèm ảnh xem trước.

Ví dụ:
    # Một nhân vật đứng nguyên, cao 32 điểm ảnh, 8 màu
    python tools/pixelize.py art/raw/tho-ren.png --height 32 --colors 8

    # Tấm mảnh rời: tách từng mảnh, thu nhỏ theo cùng tỉ lệ với hình nhân vật
    python tools/pixelize.py art/raw/tho-ren-manh.png --split \
        --scale-ref art/raw/tho-ren.png --height 32 --out art/parts/tho-ren
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def load_rgba(path):
    return np.array(Image.open(path).convert("RGBA"))


def background_mask(img, tol):
    """True ở những điểm thuộc nền. Màu nền lấy từ 4 góc ảnh."""
    h, w = img.shape[:2]
    k = max(2, min(h, w) // 50)
    corners = np.concatenate([
        img[:k, :k].reshape(-1, 4), img[:k, -k:].reshape(-1, 4),
        img[-k:, :k].reshape(-1, 4), img[-k:, -k:].reshape(-1, 4),
    ])
    if np.median(corners[:, 3]) < 128:  # ảnh đã có nền trong suốt
        return img[:, :, 3] < 128
    bg = np.median(corners[:, :3], axis=0)
    dist = np.sqrt(((img[:, :, :3].astype(float) - bg) ** 2).sum(axis=2))
    return (dist < tol) | (img[:, :, 3] < 128)


def foreground(img, tol):
    """Mặt nạ phần nhân vật, đã bỏ viền lem màu nền."""
    fg = ~background_mask(img, tol)
    fg = ndimage.binary_opening(fg, iterations=1)
    return ndimage.binary_erosion(fg, iterations=1)


def bbox(mask):
    ys, xs = np.where(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def build_palette(img, mask, colors):
    """Bảng màu chung, tính trên toàn bộ phần nhân vật."""
    pixels = img[mask][:, :3]
    strip = Image.fromarray(pixels.reshape(1, -1, 3), "RGB")
    pal = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return np.array(pal.getpalette()[: colors * 3], dtype=float).reshape(-1, 3)


def downscale(img, mask, ratio, palette):
    """Thu nhỏ: mỗi ô đích lấy màu bảng xuất hiện nhiều nhất trong vùng nguồn."""
    x0, y0, x1, y1 = bbox(mask)
    img, mask = img[y0:y1, x0:x1], mask[y0:y1, x0:x1]
    h, w = mask.shape
    th, tw = max(1, round(h * ratio)), max(1, round(w * ratio))
    flat = img[:, :, :3].reshape(-1, 3).astype(float)
    idx = np.argmin(((flat[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2), axis=1).reshape(h, w)
    out = np.zeros((th, tw, 4), dtype=np.uint8)
    ys = np.linspace(0, h, th + 1).astype(int)
    xs = np.linspace(0, w, tw + 1).astype(int)
    for ty in range(th):
        for tx in range(tw):
            m = mask[ys[ty]:ys[ty + 1], xs[tx]:xs[tx + 1]]
            if m.size == 0 or m.mean() < 0.5:
                continue
            cell = idx[ys[ty]:ys[ty + 1], xs[tx]:xs[tx + 1]][m]
            out[ty, tx, :3] = palette[np.bincount(cell, minlength=len(palette)).argmax()]
            out[ty, tx, 3] = 255
    return out


def remove_specks(sprite):
    """Xoá các điểm lẻ không dính vào khối chính."""
    labels, n = ndimage.label(sprite[:, :, 3] > 0)
    if n <= 1:
        return sprite
    sizes = ndimage.sum(sprite[:, :, 3] > 0, labels, range(1, n + 1))
    keep = np.isin(labels, [i + 1 for i, s in enumerate(sizes) if s >= max(2, sizes.max() * 0.02)])
    sprite = sprite.copy()
    sprite[~keep] = 0
    return sprite


def add_outline(sprite, palette):
    """Thêm viền tối 1 điểm ảnh bao quanh hình."""
    dark = palette[palette.sum(axis=1).argmin()] * 0.5
    padded = np.pad(sprite, ((1, 1), (1, 1), (0, 0)))
    solid = padded[:, :, 3] > 0
    cross = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=bool)
    edge = ndimage.binary_dilation(solid, structure=cross) & ~solid
    padded[edge, :3] = dark
    padded[edge, 3] = 255
    return padded


def save(sprite, path, preview):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray(sprite, "RGBA")
    im.save(path)
    if preview > 1:
        big = im.resize((im.width * preview, im.height * preview), Image.Resampling.NEAREST)
        big.save(path.with_name(path.stem + f"_x{preview}.png"))


def split_parts(mask, min_area):
    """Tách các vùng rời nhau, xếp theo thứ tự từ trên xuống rồi trái sang phải."""
    labels, n = ndimage.label(mask)
    parts = []
    for i in range(1, n + 1):
        m = labels == i
        if m.sum() >= min_area:
            parts.append(m)
    parts.sort(key=lambda m: (bbox(m)[1] // max(1, mask.shape[0] // 6), bbox(m)[0]))
    return parts


def main():
    ap = argparse.ArgumentParser(description="Chuyển ảnh vẽ phẳng thành hình pixel cho game.")
    ap.add_argument("input", type=Path, help="ảnh nguồn (PNG hoặc JPG)")
    ap.add_argument("--out", type=Path, help="tên file hoặc thư mục xuất (mặc định: art/pixel/<tên ảnh>)")
    ap.add_argument("--height", type=int, default=32, help="chiều cao nhân vật sau khi thu nhỏ (mặc định 32)")
    ap.add_argument("--colors", type=int, default=8, help="số màu tối đa (mặc định 8)")
    ap.add_argument("--tol", type=float, default=90, help="độ rộng khi nhận màu nền, tăng nếu nền còn sót (mặc định 90)")
    ap.add_argument("--split", action="store_true", help="tách từng mảnh rời thành file riêng")
    ap.add_argument("--scale-ref", type=Path, help="ảnh nhân vật đứng nguyên, dùng để tính tỉ lệ thu nhỏ cho các mảnh")
    ap.add_argument("--no-outline", action="store_true", help="không thêm viền tối")
    ap.add_argument("--preview", type=int, default=8, help="hệ số phóng to của ảnh xem trước (mặc định 8, đặt 1 để tắt)")
    args = ap.parse_args()

    img = load_rgba(args.input)
    mask = foreground(img, args.tol)
    if not mask.any():
        raise SystemExit("Không tìm thấy nhân vật trong ảnh. Thử giảm --tol.")

    # Có ảnh tham chiếu thì lấy cả tỉ lệ lẫn bảng màu từ đó, để mảnh rời cùng màu với nhân vật.
    ref_img = load_rgba(args.scale_ref) if args.scale_ref else img
    ref_mask = foreground(ref_img, args.tol) if args.scale_ref else mask
    rx0, ry0, rx1, ry1 = bbox(ref_mask)
    body = args.height if args.no_outline else args.height - 2  # viền chiếm 1 điểm ảnh mỗi phía
    ratio = body / (ry1 - ry0)
    palette = build_palette(ref_img, ref_mask, args.colors)
    out = args.out or Path("art/pixel") / args.input.stem

    def finish(m):
        sprite = remove_specks(downscale(img, m, ratio, palette))
        return sprite if args.no_outline else add_outline(sprite, palette)

    if not args.split:
        path = out if out.suffix == ".png" else out.with_suffix(".png")
        sprite = finish(mask)
        save(sprite, path, args.preview)
        print(f"Đã xuất {path} ({sprite.shape[1]}x{sprite.shape[0]} điểm ảnh, {args.colors} màu)")
        return

    parts = split_parts(mask, min_area=mask.sum() * 0.005)
    info = []
    for i, m in enumerate(parts, 1):
        sprite = finish(m)
        path = out / f"manh_{i:02d}.png"
        save(sprite, path, args.preview)
        x0, y0, x1, y1 = bbox(m)
        info.append({"file": path.name, "width": int(sprite.shape[1]), "height": int(sprite.shape[0]),
                     "source_box": [int(x0), int(y0), int(x1), int(y1)]})
    (out / "manh.json").write_text(json.dumps({"ratio": ratio, "parts": info}, indent=2), encoding="utf-8")
    print(f"Đã tách {len(parts)} mảnh vào {out}/")


if __name__ == "__main__":
    main()
