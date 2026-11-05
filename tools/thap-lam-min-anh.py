#!/usr/bin/env python3
"""TURRET MERGE — làm mịn viền ảnh trong thap/assets/*.png (CHỈ chạy 1 lần trên ảnh chưa xử lý; ảnh gốc ở docs/demo-hop-tuong/thap-art KHÔNG đụng).

Ảnh ChatGPT được tách nền từ phông hồng/xanh lá/đen → điểm ảnh ở VIỀN (alpha lưng chừng) còn mang màu phông
(đo: ~95% điểm viền là màu hồng tím) → thu nhỏ trên điện thoại thành quầng hồng/đen lấm tấm, viền răng cưa.
Xử lý (không vẽ lại, không đổi màu phần trong):
  1. Khử màu loang ở viền: mọi điểm alpha < 250 lấy màu từ các điểm ĐẶC gần nhất (loang màu vào trong 6 px).
     (chỉ dải 2 px sát phần đặc). Điểm trong suốt sát mép cũng nhận màu đó → GPU lọc ảnh không kéo màu phông vào.
  2. Viền alpha mềm: bỏ bụi alpha ≤ 6, rồi làm mềm alpha bằng Gauss σ≈0.6 px (chỉ đổi ở mép, phần trong alpha=255 giữ nguyên).
     Gauss tròn đều → hình tròn vẫn tròn. Ảnh hiệu ứng/hạt/khói/tia/đạn (fx_, khoi_, tia_, dan_) giữ nguyên (quầng mờ là chủ ý).
  3. khay.png: thu nhỏ lại từ ảnh gốc 1601 px xuống 1290 px (đủ nét cho màn 3×) bằng resize alpha-nhân-trước (premultiplied).
Chạy: python3 tools/thap-lam-min-anh.py
"""
import glob, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'thap', 'assets')
GOC = os.path.join(ROOT, 'docs', 'demo-hop-tuong', 'thap-art')
CHI_MAU = ('fx_', 'khoi_', 'tia_', 'dan_')


def loang_mau(rgb, dac, buoc=6):
    """màu của điểm đặc loang ra các điểm chưa đặc (trung bình 3×3 có trọng số), buoc vòng."""
    rgb = rgb.astype(np.float32); co = dac.astype(np.float32)
    out = rgb * co[..., None]; w = co.copy()
    k = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]], np.float32)
    for _ in range(buoc):
        s = np.stack([ndimage.convolve(out[..., i], k, mode='nearest') for i in range(3)], -1)
        sw = ndimage.convolve(w, k, mode='nearest')
        moi = (w == 0) & (sw > 0)
        out[moi] = s[moi] / sw[moi, None]
        w[moi] = 1
    return out, w > 0


def lam(path, doi_alpha=True):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    dac = al >= 250
    if dac.sum() < 16: dac = al >= 200
    if dac.sum() < 16: return False
    mau, co = loang_mau(rgb, dac, 2)                         # chỉ dải viền 2 px (điểm khử răng cưa lẫn màu phông)
    vien = ~dac & co
    rgb2 = rgb.copy(); rgb2[vien] = mau[vien]
    al2 = al.copy()
    if doi_alpha:
        al2[al2 <= 6] = 0
        mem = ndimage.gaussian_filter(al2, 0.6)
        trong = ndimage.minimum_filter(al, 3) >= 250            # phần trong (không sát mép) giữ nguyên
        al2 = np.where(trong, al, mem)
    out = np.dstack([np.clip(rgb2, 0, 255), np.clip(al2, 0, 255)]).round().astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(path, optimize=True)
    return True


def khay():
    src = os.path.join(GOC, 'khay.png')
    if not os.path.exists(src): return
    k = Image.open(src).convert('RGBA'); k = k.crop(k.getbbox())
    W = 1290; H = round(W * k.size[1] / k.size[0])
    k = k.convert('RGBa').resize((W, H), Image.LANCZOS).convert('RGBA')  # premultiplied
    k.save(os.path.join(A, 'khay.png'), optimize=True)


if __name__ == '__main__':
    khay()
    n = 0
    for f in sorted(glob.glob(os.path.join(A, '*.png'))):
        ten = os.path.basename(f)
        if ten.startswith(CHI_MAU): continue                    # hiệu ứng/hạt/tia: quầng mờ là chủ ý → giữ nguyên
        if lam(f): n += 1
    print('da lam min', n, 'anh')
