"""Bước 1 – nền parallax RỄ MỤC (3 lớp, 2x, cao 1080 = 540 logic) từ 3 ảnh gen art/re-muc/nguon/re-muc-{xa,giua,gan}.png.

Làm như Làng Chuông (lang-chuong/code/nen.py: dọn alpha, bớt chi tiết nhỏ, làm tối + giảm bão hoà + nén tương phản, lặp ngang
liền bằng đường cắt nhỏ nhất) nhưng TỐI HƠN (vùng sâu dưới làng): độ sáng trung bình mục tiêu xa ≈ 36, giữa ≈ 30, gần ≈ 20
(Làng Chuông: 42 / 40 / 26; Lam ≈ 62 trung bình, da/mắt > 150) – kiểm bằng bản xám xem-thu/canh-xam.png.

Màn Rễ Mục CUỘN DỌC (màn thử cao 36 hàng = 1152 logic, camera đi xuống tối đa 612 px) → mỗi lớp còn dời dọc theo cùng hệ số:
  • xa 0,08: cần cao thêm 49 logic → phóng ảnh lên cao 1180 (2x) (+9 %, không lộ nối);
  • giữa 0,40: cần thêm 245 logic → KHÔNG kéo, KHÔNG lặp dọc: ảnh giữ cao 1080, game vẽ 1 bản dời lên theo camera; phần dưới
    mép ảnh để trống (rễ rủ / cầu gãy chỉ ở nửa trên hang, càng xuống sâu càng trống – tự nhiên);
  • gần 0,65: cần thêm 398 logic → làm LẶP DỌC LIỀN (khung rễ hai mép chạy suốt chiều cao, cắt theo đường ít chênh nhất)
    rồi game vẽ 2 bản chồng dọc; cao 1080 − dải cắt.
Lớp gần vẽ TRƯỚC gameplay (xem GHI-CHU mục "thử lớp gần trước / sau")."""
import os
import sys

import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung_rm import NEN, NGUON, XEM, lap_doc, luu_json, luu_png, u8, do_sang, LC_CODE
sys.path.insert(0, LC_CODE)
from nen import chinh_mau, bot_chi_tiet, doi_co_rgb, don_alpha, doi_co_rgba, lap   # noqa: E402  (hàm đã duyệt ở Làng Chuông)

H2 = 1080
CAO_RM = 36 * 32            # màn thử cao 36 hàng ô (logic)
CUON_DOC = CAO_RM - 540     # camera đi xuống tối đa (logic)


def lop_xa():
    src = np.asarray(Image.open(f'{NGUON}/re-muc-xa.png').convert('RGB')).astype(np.float64)
    h, w = src.shape[:2]
    H = int(np.ceil((540 + CUON_DOC * 0.08) * 2 / 2) * 2)          # 1180
    W = round(w * H / h)
    a = doi_co_rgb(src, W, H)
    a = bot_chi_tiet(a, r=3, sigma=1.2)
    # nét đen của nền xa: nhấc về gần màu mảng (hạn chế nét đen ở lớp xa – bảng chuẩn tư vấn)
    L = a.mean(-1, keepdims=True)
    toi = np.clip((45 - L) / 45, 0, 1)
    a = a * (1 - 0.45 * toi) + nd.gaussian_filter(a, (6, 6, 0)) * 0.45 * toi
    # nấm sáng / sương xanh ngọc: giữ sáng hơn một chút (điểm nhấn cục bộ, như đèn lồng Làng Chuông) nhưng vẫn dịu
    sang_m = ((a[..., 1] > a[..., 0] + 30) & (a[..., 1] > 90)).astype(float)
    sang_m = nd.gaussian_filter(sang_m, 1.5)[..., None]
    thuong = chinh_mau(a, sang=0.72, bao_hoa=0.55, tuong_phan=0.70, tam=50, nhuom=(28, 34, 40), nhuom_k=0.15)
    diem = chinh_mau(a, sang=0.80, bao_hoa=0.65, tuong_phan=0.8, tam=50)
    return thuong * (1 - sang_m) + diem * sang_m


def lop_giua():
    src = np.asarray(Image.open(f'{NGUON}/re-muc-giua.png').convert('RGBA'))
    c = don_alpha(src)
    h, w = c.shape[:2]
    W = round(w * H2 / h)
    c = doi_co_rgba(c, W, H2)
    rgb = bot_chi_tiet(c[..., :3], r=1, sigma=0.6)
    L = rgb.mean(-1, keepdims=True)
    toi = np.clip((50 - L) / 50, 0, 1)
    rgb = rgb * (1 - 0.5 * toi) + np.array([40, 34, 30.0]) * 0.5 * toi          # nét đen → nâu sẫm, dịu hơn gameplay
    # nấm sáng xanh ngọc + giọt nước: điểm nhấn, sáng hơn phần còn lại
    den = ((rgb[..., 1] > rgb[..., 0] + 35) & (rgb[..., 1] > 110)).astype(float)
    den = nd.gaussian_filter(den, 1.0)[..., None]
    thuong = chinh_mau(rgb, sang=0.62, bao_hoa=0.60, tuong_phan=0.78, tam=55, nhuom=(34, 40, 48), nhuom_k=0.12)
    sang = chinh_mau(rgb, sang=0.85, bao_hoa=0.80, tuong_phan=0.9, tam=70)
    rgb = thuong * (1 - den) + sang * den
    return np.dstack([rgb, c[..., 3]])   # không nối thêm phần trong suốt bên dưới: game chỉ vẽ 1 bản dời lên theo camera, dưới mép ảnh là trống (đỡ ~3 MB)


def lop_gan():
    src = np.asarray(Image.open(f'{NGUON}/re-muc-gan.png').convert('RGBA'))
    c = don_alpha(src)
    h, w = c.shape[:2]
    W = round(w * H2 / h)
    c = doi_co_rgba(c, W, H2)
    rgb = bot_chi_tiet(c[..., :3], r=1, sigma=0.7)
    rgb = chinh_mau(rgb, sang=0.50, bao_hoa=0.62, tuong_phan=0.85, tam=45, nhuom=(24, 28, 32), nhuom_k=0.18)
    return np.dstack([rgb, c[..., 3]])


def kiem_noi_doc(img):
    p = img.astype(np.float64)
    noi = np.abs(p[-1] - p[0]).mean()
    trong = np.abs(np.diff(p, axis=0)).mean()
    return round(float(noi / max(trong, 1e-6)), 2)


def chay():
    xa = lop_xa()
    giua = lop_giua()
    gan = lop_gan()
    xa_l, k1 = lap(u8(xa), 320)
    giua_l, k2 = lap(u8(giua), 360)
    gan_l, k3 = lap(u8(gan), 300)
    gan_l = lap_doc(gan_l, 200)                    # lặp dọc liền (khung rễ hai mép chạy suốt)
    k3d = kiem_noi_doc(gan_l)
    os.makedirs(NEN, exist_ok=True)
    luu_png(xa_l, f'{NEN}/re-muc-xa.png')
    luu_png(giua_l, f'{NEN}/re-muc-giua.png')
    luu_png(gan_l, f'{NEN}/re-muc-gan.png')
    ket = {}
    for ten, im, k, he, lap_d, mo in [
        ('re-muc-xa.png', xa_l, k1, 0.08, False, 'Lớp xa (đục): vòm rễ mục đan nhau, sương xanh ngọc dưới, nấm sáng nhỏ. Cao 1180 (phóng 9 %) để cuộn dọc 0,08 không hở.'),
        ('re-muc-giua.png', giua_l, k2, 0.40, False, 'Lớp giữa (trong suốt): rễ rủ, cầu ván gãy, nấm sáng, giọt nước – chỉ ở nửa trên hang; cuộn dọc 0,40, dưới mép ảnh để trống (không lặp dọc).'),
        ('re-muc-gan.png', gan_l, k3, 0.65, True, 'Lớp gần (trong suốt): khung rễ tối hai mép; LẶP DỌC liền (cuộn dọc 0,65: vẽ 2 bản chồng dọc). Vẽ TRƯỚC gameplay.'),
    ]:
        ket[ten] = {'co_anh': [int(im.shape[1]), int(im.shape[0])], 'co_logic': [im.shape[1] / 2, im.shape[0] / 2],
                    'he_so_cuon': he, 'he_so_cuon_doc': he, 'lap_ngang': True, 'lap_doc': lap_d, 'mo_ta': mo,
                    'kiem_noi_mep': k, 'do_sang_tb': round(do_sang(im), 1)}
    ket['re-muc-gan.png']['kiem_noi_doc'] = k3d
    luu_json({
        'ten': 'Nền parallax Rễ Mục (rễ cây mục dưới Làng Chuông)',
        'quy_uoc': {
            'boi_so': 2, 'khung_logic': [960, 540],
            've': 'vẽ ở ½ cỡ ảnh. Ngang: x0 = -((cam_x * he_so) mod rong_logic), vẽ các bản x0, x0 + rong… tới khi phủ 960. '
                  'Dọc: y0 = -(cam_y * he_so_cuon_doc); lớp lap_doc = true thì vẽ thêm bản ở y0 + cao, lớp khác chỉ 1 bản (đã đủ cao).',
            'thu_tu': 'xa → giua → gan → [gạch, trang trí, đồ vật, Lam, quái] → hiệu ứng → HUD (lớp gần vẽ TRƯỚC gameplay – xem GHI-CHU)',
            'kiem_noi_mep': 'chênh màu ở chỗ nối mép phải→trái (và dưới→trên) chia cho chênh trung bình 2 cột kề bên trong ảnh (≈1 là không thấy nối)',
            'man_thu': {'cao_logic': CAO_RM, 'cuon_doc_toi_da': CUON_DOC},
        },
        'lop': ket,
    }, f'{NEN}/nen.json')
    print('nền Rễ Mục:', {k: (v['co_anh'], v['do_sang_tb'], v['kiem_noi_mep']) for k, v in ket.items()}, 'nối dọc gần', k3d)
    return ket


if __name__ == '__main__':
    chay()
