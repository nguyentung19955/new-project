# -*- coding: utf-8 -*-
"""Luồng J (P0-04 + P1 don1–4, duyệt animation ChatGPT 01/11): tiết chế vệt chém NẰM TRONG PIXEL KHUNG của Kiếm Khách.
Chỉ đụng điểm FX cyan của vệt lớn (thành phần liên thông >= 150 điểm), KHÔNG đụng thân:
  - giữ mọi điểm nằm sát (<= 2 px) điểm thân không-cyan (như tools/tiet-che-dapdat.py), giữ màu kiếm (27,209,237)/(25,190,218);
  - không thêm điểm mới, không đổi màu thân, không đổi cỡ; chỉ XOÁ điểm FX hoặc đổi điểm FX sang màu viền FX có sẵn.
Hai phép:
  1) Làm mảnh (don1, don4, chemkhong): chỗ vệt dày >= 4 px, lột 1 px mép ngoài rồi dời màu viền vào trong (vệt mỏng đi 1 px, vẫn còn viền tối).
  2) Chừa mặt nạ (don4 f05–f08, chemkhong f01–f04): xoá FX trong bán kính R quanh mắt mặt nạ, vành R..R+3 mờ dần (màu viền + ô cờ)
     -> vệt chém không che/dính vào mặt nạ. Toạ độ mắt đo trên ảnh gốc (bảng MAT).
CHỈ chạy một lần trên ảnh gốc: python3 tools/tiet-che-chem.py <thư mục chứa don1..don4, chemkhong gốc> [thư mục ra=art/kiem-khach]"""
import sys, os, glob, numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
KIEM = [(27, 209, 237), (25, 190, 218)]
FX_TOI = (23, 98, 138)
MAT = {('don4', 5): (128, 117), ('don4', 6): (137, 129), ('don4', 7): (137, 129), ('don4', 8): (137, 129),
       ('chemkhong', 1): (136, 135), ('chemkhong', 2): (125, 147), ('chemkhong', 3): (127, 151), ('chemkhong', 4): (142, 135)}
R = 18
MANH = {'don1', 'don4', 'chemkhong'}
CLIP = ['don1', 'don2', 'don3', 'don4', 'chemkhong']

def cyan(a):
    return (((a[..., 2] - a[..., 0] >= 30) & (a[..., 2] >= 80)) | ((a[..., 2] >= a[..., 0]) & (a[..., :3].min(-1) >= 225))) & (a[..., 3] > 0)

K8 = np.ones((3, 3))
def phan_lop(a):
    """-> (sua, fx, than). Vệt chém dùng CHUNG màu với lưỡi kiếm (27,209,237) nên không tách theo màu kiếm được:
    sang = điểm thân sáng (không-cyan, kênh lớn nhất >= 90: tóc, mặt nạ, da, giáp nâu/xám);
    fx   = thành phần cyan lớn (>= 150 điểm) và nét viền tối quanh nó (<= 1 px), TRỪ mọi điểm cách thân sáng <= 2 px;
    than = mọi điểm đục còn lại; sua = fx cách than > 2 px (bảo vệ 2 px quanh thân như tiet-che-dapdat)."""
    op = a[..., 3] > 0; cy = cyan(a)
    lab, k = ndimage.label(cy, structure=K8)
    sz = ndimage.sum(cy, lab, range(1, k + 1)) if k else []
    lon = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= 150])
    sang = op & ~cy & (a[..., :3].max(-1) >= 90)
    gan_sang = ndimage.binary_dilation(sang, structure=K8, iterations=2)
    toi = op & ~cy & ~sang
    fx = (lon | (toi & ndimage.binary_dilation(lon, structure=K8))) & ~gan_sang
    than = op & ~fx
    sua = fx & ~ndimage.binary_dilation(than, iterations=2)
    return sua, fx, than

def lop_fx(a): return phan_lop(a)[0]

def lam_manh(a, n=1):
    """Lột n px mép ngoài (giáp nền trong suốt) ở đoạn vệt dày, rồi dời dải màu mép (viền tối -> cyan) vào trong n px."""
    sua, fx, than = phan_lop(a)
    D = ndimage.distance_transform_edt(a[..., 3] > 0)            # khoảng cách tới nền trong suốt gần nhất
    day = ndimage.binary_dilation(ndimage.binary_erosion(fx, iterations=2), iterations=3) & fx   # mũi mảnh, lưỡi kiếm: không lột
    vung = sua & day
    xoa = vung & (D <= n + 0.01)
    if not xoa.any(): return 0
    goc = a.copy(); a[xoa] = 0
    Dr = np.ceil(D - 0.01).astype(int)
    for L in range(1, 5):                                          # điểm ở sâu L+n lấy màu điểm gốc ở sâu <= L gần nhất
        dich = vung & ~xoa & (Dr == L + n)
        if not dich.any(): continue
        nguon = (Dr <= L) & (goc[..., 3] > 0)
        _, (iy, ix) = ndimage.distance_transform_edt(~nguon, return_indices=True)
        a[dich] = goc[iy[dich], ix[dich]]
    # vụn lẻ còn sót sau khi lột (điểm vệt có <= 1 hàng xóm đục): xoá
    op = a[..., 3] > 0
    hx = ndimage.convolve(op.astype(int), K8.astype(int), mode='constant') - op
    vun = vung & op & (hx <= 1)
    a[vun] = 0
    return int(xoa.sum() + vun.sum())

def chua_mat(a, mx, my):
    sua, fx, than = phan_lop(a)
    day = ndimage.binary_dilation(ndimage.binary_erosion(fx, iterations=1), iterations=2)   # bỏ qua lưỡi kiếm mảnh
    sua = sua & day
    Y, X = np.mgrid[:a.shape[0], :a.shape[1]]
    d = np.hypot(X - mx, Y - my)
    xoa = sua & (d < R)
    vanh = sua & (d >= R) & (d < R + 3)
    a[xoa] = 0
    a[vanh, :3] = FX_TOI
    a[vanh & ((X + Y) % 2 == 0)] = 0
    return int(xoa.sum()), int(vanh.sum())

def main():
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(GOC, 'art/kiem-khach')
    for c in CLIP:
        for f in sorted(glob.glob(f'{src}/{c}/f*.png')):
            n = int(os.path.basename(f)[1:3])
            a = np.array(Image.open(f).convert('RGBA')).astype(int); a0 = a.copy()
            ghi = []
            if c in MANH: ghi.append('mảnh -%d' % lam_manh(a, 1 if c == 'don1' else 2))
            if (c, n) in MAT: ghi.append('chừa mặt nạ -%d/vành %d' % chua_mat(a, *MAT[(c, n)]))
            # kiểm: không điểm thân nào đổi
            doi = (a != a0).any(-1)
            assert not (doi & phan_lop(a0)[2]).any(), 'đụng thân ' + f
            os.makedirs(os.path.join(dst, c), exist_ok=True)
            if doi.any(): Image.fromarray(a.astype(np.uint8)).save(os.path.join(dst, c, os.path.basename(f)))   # ảnh không đổi: không ghi lại
            print(c, os.path.basename(f), ', '.join(ghi) or 'giữ nguyên', '· đổi %d điểm' % doi.sum())

if __name__ == '__main__': main()
