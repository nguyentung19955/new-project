"""Đường dẫn + hàm chung cho asset RỄ MỤC. Dùng lại hàm của Làng Chuông (art/the-gioi-moi/lang-chuong/code/chung.py,
gach.py, nen.py) – cách làm đã duyệt – chỉ đổi ảnh nguồn (art/re-muc/nguon/) và thư mục ra (art/re-muc/)."""
import os
import sys

import numpy as np
from PIL import Image

CODE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(CODE)                                          # art/re-muc/
NGUON = os.path.join(GOC, 'nguon')
NEN = os.path.join(GOC, 'nen')
GACH = os.path.join(GOC, 'gach')
DOVAT = os.path.join(GOC, 'do-vat')
TT = os.path.join(GOC, 'trang-tri')
XEM = os.path.join(GOC, 'xem-thu')
ART = os.path.normpath(os.path.join(GOC, '..'))                      # tieng-vong-cuoi-cung/art
LC_CODE = os.path.join(ART, 'the-gioi-moi', 'lang-chuong', 'code')
if LC_CODE not in sys.path:
    sys.path.insert(0, LC_CODE)

from chung import (T_LOGIC, BOI, T2, LAM_CAO, W_LOGIC, H_LOGIC, font, mat_trang, nen_trang, khu_vien_trang,   # noqa: E402,F401
                   tach_vung, doi_co, premul, duong_cat_doc, thay_le, lap_ngang, lap_doc, xep_atlas, luu_png, luu_json, dan, u8)

LUM = np.array([0.299, 0.587, 0.114])


def doc_nguon(ten, mode='RGB'):
    return np.array(Image.open(os.path.join(NGUON, ten)).convert(mode)).astype(np.float64)


def do_sang(rgba):
    """Độ sáng trung bình phần đặc (alpha > 128) – để kiểm bản xám."""
    a = np.asarray(rgba).astype(np.float64)
    if a.shape[-1] == 4:
        m = a[..., 3] > 128
        return float((a[..., :3] @ LUM)[m].mean()) if m.any() else 0.0
    return float((a @ LUM).mean())


def xam(rgba):
    """Bản xám (giữ alpha) để kiểm tương phản."""
    a = np.asarray(rgba).astype(np.float64)
    L = a[..., :3] @ LUM
    o = a.copy()
    o[..., 0] = o[..., 1] = o[..., 2] = L
    return np.round(o).astype(np.uint8)


def toi_bot_mau(rgba, sang, bh):
    """Làm tối ×sang, bớt bão hoà ×bh, giữ alpha (như cong-lang-v3/code/tach.py)."""
    a = np.asarray(rgba).astype(np.float64)
    L = (a[..., :3] @ LUM)[..., None]
    a[..., :3] = np.clip((L + (a[..., :3] - L) * bh) * sang, 0, 255)
    o = np.round(a).astype(np.uint8)
    if o.shape[-1] == 4:
        o[o[..., 3] == 0] = 0
    return o
