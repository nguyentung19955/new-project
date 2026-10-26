"""Bước 1e (MỚI ở v3): sửa BẬC Ở CHÂN CHÓP mũ khi chóp lắc – không làm lại mũ, không gen ảnh.

Hai nguyên nhân bậc ở rig-v2 (đo bằng hump/bậc trong phan_tich.py → so-lieu.json → chop_bac):
1. Chóp xoay quanh điểm giáp DƯỚI nếp gấp (430, 360) – cách chỗ giáp TRÊN (đỉnh mũ, ~(600, 88)) tới ~320 px → lắc vài độ
   là chỗ giáp trên lệch nhiều px. v3 dời pivot chóp lên GIỮA nếp gấp (rig.CHOP_PIVOT) → lệch ở hai đầu còn một nửa.
   (Nút/mảnh giữ nguyên, chỉ đổi điểm xoay → dáng nghỉ không đổi.)
2. Lớp gáy mũ (mu-gay, vẽ sau chóp) có viền đen trùng đúng viền trên của chóp → khi chóp hạ xuống, viền gáy ló ra
   thành một "bướu" nhỏ ở đỉnh. v3 xoá dải trên cùng của lớp gáy (chỉ vùng ngay dưới viền trên của chóp, sát đỉnh),
   có dốc mềm → khi chóp hạ, đỉnh là đúng viền chóp, không còn viền gáy thừa.
3. Đuôi chóp nằm khuất dưới mũ (bên phải chỗ giáp đỉnh, x > ~600) có viền đen riêng → khi chóp hất lên, đầu đuôi này
   nhô lên trên viền mũ thành bậc nhỏ. v3 xoá phần đuôi chóp BỊ MŨ CHE HẲN ở dáng nghỉ trong dải sát đỉnh (không nhìn thấy
   ở dáng nghỉ → hình dáng nghỉ không đổi).
Chỉ sửa lớp gáy (lớp phụ do code tạo ở sua_mu.py) và phần khuất của chóp – mảnh mũ giữ nguyên."""
import os
import json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from chung import MANH
from rig import build_rig, world_mats, piece_matrix, render

X_VUNG = (505.0, 592.0)      # dải ngang (px ảnh ngang) quanh đỉnh mũ cần xoá viền gáy thừa
SAU = 16.0                   # xoá lớp gáy từ trên xuống tới (viền trên của chóp ở dáng nghỉ + SAU px)
MEM = 4.0                    # dốc mềm (px)
X_DUOI, Y_DUOI = 600.0, 160.0  # đuôi chóp: chỉ xoá phần khuất dưới mũ ở x > X_DUOI, y < Y_DUOI (sát đỉnh)


def main():
    ch_path = os.path.join(MANH, 'goc', 'chuan-hoa.json')
    ch = json.load(open(ch_path, encoding='utf-8'))
    if ch.get('_sua_chan_chop'):
        raise SystemExit('đã sửa chân chóp – chạy lại chuan_hoa.py + sua_mu.py trước')
    if not ch.get('_sua_mu'):
        raise SystemExit('chạy sua_mu.py trước')
    rig, _ = build_rig(ch)
    mats = world_mats(rig, {})
    # viền trên của chóp ở dáng nghỉ (thế giới), theo từng cột
    box = (0, 0, 1254, 1254)
    a = np.array(render(rig, {}, box, 1.0, only=['chop-mu']))[..., 3] > 128
    top = np.where(a.any(0), a.argmax(0), 10 ** 6).astype(float)
    p = os.path.join(MANH, 'mu-gay.png')
    Image.open(p).save(os.path.join(MANH, 'goc', 'mu-gay-truoc-sua-chan.png'))
    Image.open(os.path.join(MANH, 'chop-mu.png')).save(os.path.join(MANH, 'goc', 'chop-mu-truoc-sua-chan.png'))
    img = np.array(Image.open(p).convert('RGBA')).astype(np.float32)
    Fw = piece_matrix(rig['nut']['mu-gay'], mats['mu-gay'])
    H, W = img.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    wx = Fw[0, 0] * xx + Fw[0, 1] * yy + Fw[0, 2]
    wy = Fw[1, 0] * xx + Fw[1, 1] * yy + Fw[1, 2]
    xi = np.clip(np.round(wx).astype(int), 0, 1253)
    trong = (wx >= X_VUNG[0]) & (wx <= X_VUNG[1])
    nguong = top[xi] + SAU
    # 1 = giữ, 0 = xoá; dốc mềm theo chiều dọc và hai đầu dải ngang
    giu_doc = np.clip((wy - nguong) / MEM + 0.5, 0, 1)
    bien = np.minimum(wx - X_VUNG[0], X_VUNG[1] - wx)
    trong_mem = np.clip(bien / MEM, 0, 1) * trong
    giu = 1 - trong_mem * (1 - giu_doc)
    truoc = int((img[..., 3] > 128).sum())
    img[..., 3] *= giu
    img[img[..., 3] < 1] = 0
    Image.fromarray(img.round().clip(0, 255).astype(np.uint8), 'RGBA').save(p)
    sau = int((np.array(Image.open(p))[..., 3] > 128).sum())
    # 3. đuôi chóp khuất dưới mũ
    mu_a = np.array(render(rig, {}, box, 1.0, only=['mu']))[..., 3] / 255.0
    che = mu_a > 0.6
    p2 = os.path.join(MANH, 'chop-mu.png')
    im2 = np.array(Image.open(p2).convert('RGBA')).astype(np.float32)
    F2 = piece_matrix(rig['nut']['chop-mu'], mats['chop-mu'])
    H2, W2 = im2.shape[:2]
    yy, xx = np.mgrid[0:H2, 0:W2].astype(float)
    wx = F2[0, 0] * xx + F2[0, 1] * yy + F2[0, 2]
    wy = F2[1, 0] * xx + F2[1, 1] * yy + F2[1, 2]
    xi = np.clip(np.round(wx).astype(int), 0, 1253)
    yi = np.clip(np.round(wy).astype(int), 0, 1253)
    xoa2 = che[yi, xi] & (wx > X_DUOI) & (wy < Y_DUOI)
    xoa2 = nd.gaussian_filter(xoa2.astype(np.float32), 1.0)
    t2 = int((im2[..., 3] > 128).sum())
    im2[..., 3] *= 1 - np.clip(xoa2 * 2, 0, 1)
    im2[im2[..., 3] < 1] = 0
    Image.fromarray(im2.round().clip(0, 255).astype(np.uint8), 'RGBA').save(p2)
    s2 = int((np.array(Image.open(p2))[..., 3] > 128).sum())
    ch['_sua_chan_chop'] = {'px_duoi_chop_xoa': t2 - s2, 'x_duoi': X_DUOI, 'y_duoi': Y_DUOI,
'x_vung': X_VUNG, 'sau_px': SAU, 'mem_px': MEM, 'px_gay_xoa': truoc - sau,
                            'ghi_chu': 'xoá dải trên cùng lớp gáy mũ sát đỉnh (viền gáy trùng viền chóp); '
                                       'pivot chóp dời lên giữa nếp gấp (rig.CHOP_PIVOT)'}
    with open(ch_path, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    print('sửa chân chóp: xoá', truoc - sau, 'px lớp gáy,', t2 - s2, 'px đuôi chóp khuất')


if __name__ == '__main__':
    main()
