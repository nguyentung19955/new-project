#!/usr/bin/env python3
"""Nền chibi 1 lớp → bản 1920×1080 / 960×540 + parallax TẠM (lớp xa mờ-tối, lớp gần = rễ tiền cảnh).

Chạy từ tieng-vong-cuoi-cung/:
  python3 tools/chibi-nen.py art/chibi/nen/hoc-cay.png --ra art/chibi/nen

Lớp gần tách bằng GrabCut (OpenCV) với vùng gợi ý vẽ tay (hai đường gấp khúc bên dưới, toạ độ ảnh gốc
1672×941): trên BG_LINE chắc chắn là nền xa; dưới FG_LINE chắc chắn là rễ tiền cảnh; giữa để GrabCut tự quyết.
Chỉ đúng cho hoc-cay.png – ảnh khác phải vẽ lại hai đường này.
Lớp xa: chỗ bị lớp gần che được vá (inpaint) để khi lệch parallax không lộ "bóng ma" rễ, rồi làm mờ nhẹ + tối 20%.
"""
import argparse, os
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

BG_LINE = [(0, 530), (70, 640), (130, 720), (220, 780), (330, 805), (500, 815), (600, 850), (700, 862), (850, 885),
           (1000, 905), (1080, 885), (1150, 830), (1300, 795), (1400, 800), (1560, 800), (1620, 765), (1672, 720)]
FG_LINE = [(0, 640), (60, 720), (160, 810), (260, 880), (400, 905), (560, 935), (1000, 941), (1100, 941),
           (1200, 880), (1350, 850), (1500, 850), (1672, 800)]
GOC = (1672, 941)
# Sàn đất phẳng trong ảnh gốc (đo bằng mắt): mép sau ≈ y 690, mép trước (chỗ rễ tiền cảnh bắt đầu) ≈ y 800.
SAN_GOC = (690, 800)


def duoi(pts, W, H, sx, sy):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(x * sx, y * sy) for x, y in pts] + [(W, H), (0, H)], fill=1)
    return np.asarray(m).astype(bool)


def tach_gan(rgb):
    H, W = rgb.shape[:2]
    sx, sy = W / GOC[0], H / GOC[1]
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    mask[duoi(BG_LINE, W, H, sx, sy)] = cv2.GC_PR_FGD
    mask[duoi(FG_LINE, W, H, sx, sy)] = cv2.GC_FGD
    bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
    cv2.setRNGSeed(1)
    cv2.grabCut(np.ascontiguousarray(rgb[..., ::-1]), mask, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
    # dọn: bỏ đốm nhỏ, lấp lỗ nhỏ, chỉ giữ thành phần chạm mép trái/phải/dưới
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab = cv2.connectedComponents(fg)
    giu = set(np.unique(np.concatenate([lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = np.isin(lab, list(giu))
    return fg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vao'); ap.add_argument('--ra', required=True)
    a = ap.parse_args()
    ten = os.path.splitext(os.path.basename(a.vao))[0]
    src = Image.open(a.vao).convert('RGB')
    os.makedirs(os.path.join(a.ra, 'parallax'), exist_ok=True)
    big = src.resize((1920, 1080), Image.LANCZOS)          # 1672×941 → 1920×1080 (méo < 0,1%)
    rgb = np.asarray(big)
    fg = tach_gan(rgb)                                      # tách ở 1920 cho mép đẹp
    # alpha mềm 1,5 px
    al = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.2)
    al = np.clip((al - 0.15) / 0.7, 0, 1)
    # lớp xa: vá chỗ bị che (nới 6 px) rồi mờ + tối 20 %
    vung = cv2.dilate(fg.astype(np.uint8), np.ones((13, 13), np.uint8))
    va = cv2.inpaint(np.ascontiguousarray(rgb[..., ::-1]), vung, 9, cv2.INPAINT_TELEA)[..., ::-1]
    for W, H, r in [(1920, 1080, 3.0), (960, 540, 1.5)]:
        tag = str(W)
        base = big if W == 1920 else src.resize((W, H), Image.LANCZOS)
        base.save(os.path.join(a.ra, f'{ten}-{tag}.png'), optimize=True)
        xa = Image.fromarray(va).resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(r))
        ImageEnhance.Brightness(xa).enhance(0.8).save(os.path.join(a.ra, 'parallax', f'xa-{tag}.png'), optimize=True)
        g = np.dstack([rgb * (al[..., None] > 0), (al * 255).astype(np.uint8)]).astype(np.uint8)
        gi = Image.fromarray(g, 'RGBA')
        if W != 1920:
            pm = np.asarray(gi).astype(np.float32); pm[..., :3] *= pm[..., 3:4] / 255
            ch = [np.asarray(Image.fromarray(pm[..., i], 'F').resize((W, H), Image.LANCZOS)) for i in range(4)]
            A = np.clip(ch[3], 0, 255)
            C = np.where(A[..., None] > 0.5, np.dstack(ch[:3]) * 255 / np.maximum(A[..., None], 1e-3), 0)
            gi = Image.fromarray(np.dstack([np.clip(C, 0, 255), A]).astype(np.uint8), 'RGBA')
        gi.save(os.path.join(a.ra, 'parallax', f'gan-{tag}.png'), optimize=True)
    # xem thử parallax (GIF 480×270) ở 960: lớp xa lệch ±4 px, lớp gần ±16 px (phóng 4 % để không lộ mép)
    xa = Image.open(os.path.join(a.ra, 'parallax', 'xa-960.png')).convert('RGBA')
    gan = Image.open(os.path.join(a.ra, 'parallax', 'gan-960.png'))
    xa = xa.resize((int(960 * 1.04), int(540 * 1.04)), Image.LANCZOS)
    gan = gan.resize((int(960 * 1.04), int(540 * 1.04)), Image.LANCZOS)
    fr = []
    for i in range(12):
        t = np.sin(2 * np.pi * i / 12)
        c = Image.new('RGBA', (960, 540))
        c.alpha_composite(xa, (int(-19 + 4 * t), -11))
        c.alpha_composite(gan, (int(-19 + 16 * t), -22))
        fr.append(c.convert('RGB').resize((480, 270), Image.LANCZOS))
    fr[0].save(os.path.join(a.ra, 'parallax', 'xem-thu.gif'), save_all=True, append_images=fr[1:], duration=100, loop=0)
    k = 540 / GOC[1]
    print(f'sàn đất phẳng: gốc y {SAN_GOC} → 960×540: y {round(SAN_GOC[0] * k)}–{round(SAN_GOC[1] * k)}; '
          f'1920×1080: y {round(SAN_GOC[0] * k * 2)}–{round(SAN_GOC[1] * k * 2)}; '
          f'lớp gần phủ {fg.mean() * 100:.1f}% ảnh')


if __name__ == '__main__':
    main()
