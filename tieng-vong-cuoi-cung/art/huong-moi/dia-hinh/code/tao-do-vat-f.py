#!/usr/bin/env python3
"""ĐỒ VẬT PHÒNG F (Lò rèn) – đe rèn 2 trạng thái từ ảnh gen có sẵn (KHÔNG gen mới), 29/10/2026.

Nguồn: art/huong-moi/nguon/vu-khi/de-ren.png (nền trắng; trái = nguội, phải = đang rèn, than đỏ).
Ra:    art/huong-moi/dia-hinh/do-vat-f.png (ảnh 2x: px ảnh = logic × 2) + khoá "do_vat_f" trong dia-hinh.json (giữ mọi khoá khác)
       xem-thu/do-vat-f-ban-co.png (kiểm tách nền trên ô bàn cờ)

Cỡ (tư vấn 3 mục 4: đe rèn cao 48–64, rộng 80–112 logic): cả khối (cột treo búa + đe + gốc + chậu) cao 64 logic, rộng 80 logic
(tỉ lệ ảnh cho 78 → giãn ngang ≈ 2,3 %, mắt không thấy). Mặt đe cao ≈ 48 logic = ngang hông Lam (cao 112).
Hai trạng thái được KHỚP vị trí (tìm độ lệch bằng mask) → game hoà dần nguội ↔ nóng không nhảy hình.
Neo: giữa đáy khung (đáy = chân rễ thấp nhất). Rêu giảm bão hoà nhẹ như điểm lưu phòng A (cùng một tay).

Chạy: python3 -B art/huong-moi/dia-hinh/code/tao-do-vat-f.py   (Pillow, numpy, scipy; ~3 s)"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
DH = os.path.normpath(os.path.join(HERE, '..'))
NG = os.path.normpath(os.path.join(DH, '..', 'nguon', 'vu-khi'))
XT = os.path.join(DH, 'xem-thu'); os.makedirs(XT, exist_ok=True)
CAO = 64                    # logic; rộng tính theo tỉ lệ ảnh (không giãn / nén)


def tach_nen(path):
    """nền trắng → RGBA float (cùng cách code/tao-bo-moi.py: flood-fill từ mép, alpha dải mép, khử viền trắng)"""
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    mn = rgb.min(2); mx = rgb.max(2)
    gan_trang = (mn > 228) & (mx - mn < 22)
    lab, _ = ndimage.label(gan_trang)
    vien = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); vien = vien[vien > 0]
    nen = np.isin(lab, vien)
    # nền trắng bị bao kín (khe giữa đe và cột treo búa): vùng gần trắng lớn ≥ 150 px cũng là nền (ảnh đe không có mảng trắng)
    dt = np.bincount(lab.ravel()); nen |= np.isin(lab, np.nonzero(dt >= 150)[0][1:])
    nen = ndimage.binary_opening(nen, iterations=1) | (nen & (mn > 246))
    dai = ndimage.binary_dilation(nen, iterations=3) & ~nen
    al = np.ones_like(mn); al[nen] = 0
    al[dai] = np.clip((252 - mn[dai]) / 85.0, 0, 1)
    c = np.where(al[..., None] > 0.02, (rgb - (1 - al[..., None]) * 255) / np.maximum(al[..., None], 0.02), 0)
    c = np.clip(c, 0, 255)
    L = c @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    Ltrong = ndimage.grey_erosion(np.where(al > 0.9, L, 255), size=(5, 5))
    al[dai & (L > Ltrong + 60) & (L > 150)] *= 0.25
    return np.dstack([c, al * 255]).astype(np.float32)


def doi_co(a, w, h):
    al = a[..., 3:4] / 255; pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    o = np.dstack([np.asarray(Image.fromarray(pm[..., c].astype(np.float32), 'F').resize((int(w), int(h)), Image.LANCZOS)) for c in range(4)])
    al2 = np.clip(o[..., 3:4], 0, 255) / 255
    rgb = np.where(al2 > 0.003, o[..., :3] / np.maximum(al2, 0.003), 0)
    return np.dstack([np.clip(rgb, 0, 255), np.clip(o[..., 3:4], 0, 255)]).astype(np.float32)


def giam_reu(a, bh=0.6, toi=0.92):
    a = a.copy(); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a[..., :3].max(2); mn = a[..., :3].min(2); sat = (mx - mn) / np.maximum(mx, 1)
    reu = np.clip((g - r * 0.82) / 25, 0, 1) * np.clip((g - b * 1.15) / 25, 0, 1) * np.clip((sat - 0.18) / 0.15, 0, 1)
    L = (a[..., :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    a[..., :3] = a[..., :3] * (1 - reu[..., None]) + (L + (a[..., :3] - L) * bh) * toi * reu[..., None]
    return a


def ban_co(a, o=8):
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    bc = np.where(((yy // o) + (xx // o)) % 2, 200, 120).astype(np.float32)[..., None] * np.array([0.8, 1.0, 0.9])
    al = a[..., 3:4] / 255
    return np.clip(a[..., :3] * al + bc * (1 - al), 0, 255)


A = tach_nen(os.path.join(NG, 'de-ren.png'))
H, Wt = A.shape[:2]; G = Wt // 2
# khớp bản phải (nóng) vào bản trái (nguội) bằng mask alpha
m0 = A[:, :G, 3] > 128
best = None
for dx in range(G - 70, G + 70):
    if dx + G > Wt: break
    sc = (m0 & (A[:, dx:dx + G, 3] > 128)).sum()
    if best is None or sc > best[0]: best = (sc, dx)
DX = best[1]
B = A.copy(); B[:, :G, 3] = 0                     # bản nóng: bỏ phần của bản nguội lọt vào khung
NGUOI = A[:, :G]; NONG = B[:, DX:DX + G]
hop = (NGUOI[..., 3] > 30) | (NONG[..., 3] > 30)
bb = np.argwhere(hop); (y0, x0), (y1, x1) = bb.min(0), bb.max(0) + 1
# tỉ lệ ảnh cho 78 → giãn ngang ≈ 2,3 % lên 80 (không thấy được)
KY = CAO / (y1 - y0); RONG = max(80, int(round((x1 - x0) * KY))); KX = RONG / (x1 - x0)
def co2(a): return giam_reu(doi_co(a[y0:y1, x0:x1], RONG * 2, CAO * 2))
NGUOI2 = co2(NGUOI); NONG2 = co2(NONG)
# mặt đe: hàng cao nhất có ≥ 30 % bề rộng là vật (cột treo mảnh không tính) → báo cao mặt đe (logic)
rong = (NGUOI2[..., 3] > 128).sum(1)
mat_de = CAO - int(np.argmax(rong > 0.3 * RONG * 2)) / 2
# lò than (điểm sáng nhất bản nóng) – game đặt quầng ấm nhỏ ở đây
L = NONG2[..., :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32)
am = (NONG2[..., 0] - NONG2[..., 2]) * (NONG2[..., 3] > 200) * (L > 120)
yy, xx = np.nonzero(am > np.percentile(am[am > 0], 97)) if (am > 0).any() else (np.array([CAO]), np.array([RONG]))
lo = [round(float(xx.mean()) / 2 - RONG / 2, 1), round(float(yy.mean()) / 2 - CAO, 1)]   # so với neo giữa đáy (logic)

AT = np.zeros((CAO * 2 + 4, RONG * 4 + 8, 4), np.float32)
AT[2:2 + CAO * 2, 2:2 + RONG * 2] = NGUOI2; AT[2:2 + CAO * 2, RONG * 2 + 6:RONG * 4 + 6] = NONG2
Image.fromarray(np.clip(AT, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(DH, 'do-vat-f.png'), optimize=True)
Image.fromarray(np.clip(ban_co(AT), 0, 255).astype(np.uint8), 'RGB').resize((AT.shape[1] * 2, AT.shape[0] * 2), Image.NEAREST).save(os.path.join(XT, 'do-vat-f-ban-co.png'))

J_PATH = os.path.join(DH, 'dia-hinh.json')
JD = json.load(open(J_PATH, encoding='utf-8'))
JD['do_vat_f'] = {
    'ghi_chu': 'Đe rèn phòng F, 2 trạng thái (nguội / đang rèn) từ nguon/vu-khi/de-ren.png – sinh bởi code/tao-do-vat-f.py. Ảnh 2x. '
               'Neo giữa đáy khung. Hai khung đã khớp vị trí (hoà dần không nhảy). lo = tâm lò than so với neo (logic).',
    'tep': 'do-vat-f.png', 'co_anh': [AT.shape[1], AT.shape[0]],
    'khung': {'de-nguoi': [2, 2, RONG * 2, CAO * 2], 'de-nong': [RONG * 2 + 6, 2, RONG * 2, CAO * 2]},
    'de_logic': [RONG, CAO], 'mat_de_logic': mat_de, 'lo': lo, 'gian_ngang': round(KX / KY, 3),
}
json.dump(JD, open(J_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('do-vat-f.png %d×%d; đe %d×%d logic; mặt đe cao %.1f; lò %s; lệch trạng thái %d px gen; giãn ngang %.3f' %
      (AT.shape[1], AT.shape[0], RONG, CAO, mat_de, lo, DX, KX / KY))
