# -*- coding: utf-8 -*-
"""Luồng I (P0-01/P0-02, duyệt animation ChatGPT 01/11): tăng độ tách nền tối cho quái bằng tương phản CỤC BỘ.
Không vẽ tay, không đổi hình dáng/kích thước ảnh/vị trí chân/màu chủ đạo. Mỗi phép là hàm theo từng điểm ảnh
(màu + lân cận 1–2 px) nên áp đồng nhất mọi khung mọi clip -> không nhấp nháy.
  1) Sáng 1 bậc: điểm thuộc dải ngà/đồng (nâu ấm, không tím/đỏ/cyan) có độ sáng >= ngưỡng -> pha về màu ngà/đồng đích
     rồi bám về màu sẵn có gần nhất trong bảng màu của chính con quái (nếu đủ gần).
  2) Viền tối 1px phía ngoài (trên + hai bên, KHÔNG thêm dưới chân) chỉ ở chỗ mép đang không tối.
  3) Viền sáng chọn lọc 1px ở mép trên (mặt hướng lên), chỉ trên điểm màu ấm.
CHỈ chạy một lần trên ảnh gốc: python3 tools/tang-tach-nen-quai.py <thư mục gốc chứa cau/ ken/ tang/ tan/> [thư mục ra=art/quai-moi]
"""
import sys, os, glob, numpy as np
from scipy import ndimage
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
#            ngưỡng sáng, màu đích (ngà/đồng), mức pha bậc, mức pha viền sáng, vùng (phân số khung theo y) giới hạn hoặc None
CFG = {
    'cau':  dict(thr=98,  dich=(236, 222, 194), k=0.36, kr=0.40),   # sọ/mõm/xương ngà
    'ken':  dict(thr=46,  dich=(222, 192, 140), k=0.34, kr=0.40, cb=9),   # kèn đồng, tay, cờ vải
    'tang': dict(thr=118, dich=(236, 226, 204), k=0.22, kr=0.20),   # mặt nạ ngà (nhẹ)
    'tan':  dict(thr=100, dich=(224, 190, 142), k=0.20, kr=0.18),   # chuông đồng (nhẹ)
}

def lum(a): return 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]

def am(a):
    """dải nâu ấm ngà/đồng: R>=G>=B (nới nhẹ), không đỏ gạch/tím/cyan"""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r >= g - 4) & (g >= b - 6) & (r - g <= 42) & (r - b <= 95)

def bang_mau(files):
    s = set()
    for f in files:
        a = np.array(Image.open(f).convert('RGBA'))
        s.update(map(tuple, a[a[..., 3] > 200][:, :3].tolist()))
    return np.array(sorted(s), float)

def xu_ly(a, cfg, pal, toi):
    a = a.astype(float); rgb = a[..., :3]; op = a[..., 3] > 128; L = lum(rgb); H, W = op.shape
    dich = np.array(cfg['dich'], float); pL = lum(pal)
    def sang(c, k):
        n = c + (dich - c) * k; nL = lum(n); cL = lum(c)
        d = np.linalg.norm(pal[None] - n[:, None], axis=2)
        d[(pL[None] <= cL[:, None] + 4) | (pL[None] > nL[:, None] + 14)] = 1e9   # chỉ màu sẵn có sáng hơn, không vượt bậc
        j = d.argmin(1); ok = d[np.arange(len(j)), j] < 22
        n[ok] = pal[j[ok]]; return n
    out = a.copy()
    # 1) sáng 1 bậc
    m1 = op & am(rgb) & (L >= cfg['thr'])
    if 'cb' in cfg:   # tương phản cục bộ: chỉ nâng điểm sáng hơn trung bình 5x5 quanh nó (vùng tối giữ nguyên)
        w = ndimage.uniform_filter(op.astype(float), 5); tb = ndimage.uniform_filter(np.where(op, L, 0), 5) / np.maximum(w, 1e-6)
        m1 &= (L >= tb + cfg['cb']) | (L >= 84)
    if m1.any(): out[..., :3][m1] = sang(rgb[m1], cfg['k'])
    # lân cận
    pad = np.pad(op, 2)
    tren1, tren2 = pad[1:-3, 2:-2], pad[0:-4, 2:-2]
    duoi1 = pad[3:-1, 2:-2]; trai1, phai1 = pad[2:-2, 1:-3], pad[2:-2, 3:-1]
    Lp = np.pad(L, 2, constant_values=0); Ltren1 = Lp[1:-3, 2:-2]
    # 3) viền sáng chọn lọc mép trên: điểm ấm, không phải nét viền tối, ngay dưới khoảng trống (hoặc dưới 1 px viền tối có khoảng trống phía trên)
    mep = op & am(rgb) & (L >= 40) & ~m1 & (~tren1 | ((Ltren1 < 30) & ~tren2))
    if mep.any(): out[..., :3][mep] = sang(rgb[mep], cfg['kr'])
    # 2) viền tối 1px ngoài: điểm trống có lân cận đặc ở dưới (mép trên) hoặc 2 bên, lân cận đó chưa tối
    Lo = np.pad(np.where(op, L, 0), 1)
    canh_sang = lambda sl: sl >= 30
    them = ~op & ((duoi1 & canh_sang(Lo[2:, 1:-1])) | (trai1 & canh_sang(Lo[1:-1, :-2])) | (phai1 & canh_sang(Lo[1:-1, 2:])))
    them &= ~(np.pad(op, 1)[:-2, 1:-1] & ~duoi1 & ~trai1 & ~phai1)   # chỉ có lân cận trên = mép dưới chân -> bỏ
    out[them] = (*toi, 255)
    return out.clip(0, 255).astype(np.uint8)

def main():
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(GOC, 'art/quai-moi')
    for q, cfg in CFG.items():
        files = sorted(glob.glob(f'{src}/{q}/*/f*.png')); pal = bang_mau(files)
        toi = tuple(int(v) for v in pal[lum(pal).argmin()])
        for f in files:
            rel = os.path.relpath(f, src); im = np.array(Image.open(f).convert('RGBA'))
            Image.fromarray(xu_ly(im, cfg, pal, toi)).save(os.path.join(dst, rel))
        print(q, len(files), 'khung, bảng màu', len(pal), 'màu, viền tối', toi)

if __name__ == '__main__': main()
