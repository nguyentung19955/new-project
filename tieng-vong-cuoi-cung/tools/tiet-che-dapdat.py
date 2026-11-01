# -*- coding: utf-8 -*-
"""Luồng I (P1-01, duyệt animation ChatGPT 01/11): tiết chế FX đập đất của Kiếm Khách – gai cyan cao lấn cảnh.
Chỉ đụng điểm FX cyan (b - r >= 30, kể cả lõi trắng-xanh), KHÔNG đụng thân: giữ mọi điểm cyan nằm sát (<= 2 px) điểm thân không-cyan
(kiếm/mắt mặt nạ có viền tối nên được giữ) và giữ màu cyan của kiếm (27,209,237)/(25,190,218).
Khung có sóng chạm đất (f04..f13): nén dọc lớp FX về mặt đất để cao tối đa 1/3 chiều cao nhân vật đứng (đo từ dung/f00),
6 px trên cùng làm mờ dần (màu tối FX + bỏ xen kẽ ô cờ ở nửa trên); FX luôn nằm sau thân -> còn sóng sát đất + loé ngắn.
Khung trên không (f00..f03) giữ nguyên.
CHỈ chạy một lần trên ảnh gốc: python3 tools/tiet-che-dapdat.py <thư mục gốc dapdat> [thư mục ra=art/kiem-khach/dapdat]"""
import sys, os, glob, numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
KIEM = [(27, 209, 237), (25, 190, 218)]
FX_TOI = (23, 98, 138)
DAI = 6

def cyan(a):   # cyan FX + lõi trắng-xanh của gai (b >= r, rất sáng; tóc kem có r > b nên không dính)
    return (((a[..., 2] - a[..., 0] >= 30) & (a[..., 2] >= 80)) | ((a[..., 2] >= a[..., 0]) & (a[..., :3].min(-1) >= 225))) & (a[..., 3] > 0)

def than(a):
    m = (a[..., 3] > 0) & ~cyan(a)
    for c in KIEM: m |= (a[..., :3] == c).all(-1) & (a[..., 3] > 0)
    return m

def main():
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(GOC, 'art/kiem-khach/dapdat')
    d = np.array(Image.open(os.path.join(GOC, 'art/kiem-khach/dung/f00.png')).convert('RGBA')).astype(int)
    ys = np.nonzero(than(d))[0]; H = ys.max() - ys.min() + 1; cao = H // 3
    for f in sorted(glob.glob(f'{src}/f*.png')):
        a = np.array(Image.open(f).convert('RGBA')).astype(int); n = int(os.path.basename(f)[1:3])
        if n >= 4:
            t = than(a); dat = np.nonzero(a[..., 3] > 0)[0].max()   # mặt đất = đáy sóng đất / chân
            fx = cyan(a) & ~ndimage.binary_dilation(t, iterations=2) & ~t
            ys_fx = np.nonzero(fx)[0]; hmax = dat - ys_fx.min() if len(ys_fx) else 0
            k = min(1.0, cao / hmax) if hmax else 1.0
            lop = a.copy(); a[fx] = 0
            if k < 1.0:
                # nén dọc lớp FX về phía mặt đất (giữ dáng mũi gai, chỉ thấp lại), FX nằm SAU thân
                for y2 in range(dat - cao, dat + 1):
                    y1 = int(round(dat - (dat - y2) / k)); y1 = min(max(y1, 0), a.shape[0] - 1)
                    src_fx = fx[y1]; ghi = src_fx & (a[y2, :, 3] == 0)
                    a[y2, ghi] = lop[y1, ghi]
                # mũi gai trên cùng (DAI px) mờ dần: đổi sang màu tối FX, bỏ ô cờ ở nửa trên
                Y, X = np.mgrid[:a.shape[0], :a.shape[1]]
                fx2 = cyan(a) & ~t & ~ndimage.binary_dilation(t, iterations=2)
                dai = fx2 & (Y < dat - cao + DAI)
                a[dai, :3] = FX_TOI
                a[dai & (Y < dat - cao + DAI // 2) & ((X + Y) % 2 == 0)] = 0
            else:
                a[fx] = lop[fx]
            print(os.path.basename(f), 'mặt đất y=%d, FX cao %d px -> nén x%.2f' % (dat, hmax, k))
        Image.fromarray(a.astype(np.uint8)).save(os.path.join(dst, os.path.basename(f)))
    print('chiều cao nhân vật đứng', H, 'px -> giới hạn FX', cao, 'px trên mặt đất')

if __name__ == '__main__': main()
