# Hàm chung: cắt tấm gục nền trong suốt thành 8 khung, đo thân.
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'trum-chet-pha3', 'cong-cu'))
from anh_trum import doc, khung, tam_than, CUSTOM  # noqa
NGUON = os.path.join(GOC, 'docs', 'anh-goc', 'trum-moi', 'chet')
VIEC = [('mocTinh-p2', 'moc-tinh-p2'), ('mocTinh-p3', 'moc-tinh-p3'), ('nguTinh-p2', 'ngu-tinh-p2'),
        ('nguTinh-p3', 'ngu-tinh-p3'), ('hoTinh-p2', 'ho-tinh-p2'), ('hoTinh-p3', 'ho-tinh-p3')]
NGUONG = 128  # alpha cắt sắc
NGUONG_CAT = 48  # alpha yếu hơn mức này coi như hào quang mờ khi tìm cột cắt


def cat8(im):
    """Trả về 7 cột cắt (cột hẹp nhất quanh mỗi mốc W*k/8) và số điểm đặc ở cột đó."""
    a = np.array(im)[:, :, 3]; W = a.shape[1]
    col = (a >= NGUONG_CAT).sum(0)
    cuts = []
    for k in range(1, 8):
        c = W * k / 8; lo, hi = int(c - W / 14), int(c + W / 14)
        seg = col[lo:hi]; m = seg.min(); idx = np.nonzero(seg == m)[0]
        # nhiều cột bằng nhau: lấy giữa dải gần mốc nhất
        j = idx[np.argmin(abs(idx + lo - c))]
        run = [j]
        while run[-1] + 1 < len(seg) and seg[run[-1] + 1] == m: run.append(run[-1] + 1)
        while run[0] - 1 >= 0 and seg[run[0] - 1] == m: run.insert(0, run[0] - 1)
        cuts.append((lo + run[len(run) // 2], int(m), int((a[:, lo + run[len(run) // 2]] >= NGUONG).sum())))
    return cuts


def than_lon(alpha_bool):
    """Mặt nạ khối liền lớn nhất (thân), bỏ hạt/đốm rời."""
    lab, n = ndimage.label(alpha_bool, structure=np.ones((3, 3)))
    if n == 0: return alpha_bool
    sz = ndimage.sum(alpha_bool, lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(sz)))


def hop(mask):
    ys, xs = np.nonzero(mask)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def tam_san(mask):
    ys, xs = np.nonzero(mask); yb = ys.max(); h = yb - ys.min(); sel = ys >= yb - 0.35 * h
    return xs[sel].mean()
