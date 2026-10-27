"""Thân gỗ-rễ từ ảnh gen nguon-v2/gach-than-go.png (8 ô thân KHÔNG rêu, nền trắng, 1774×887).

Ảnh gen KHÔNG tự lặp liền (mép trái ≠ mép phải, mép trên ≠ mép dưới) và 8 ô có mép khác nhau → làm bằng code:
  1. Cắt 8 ô (bỏ 4 px mép để tránh viền trộn trắng), đổi cỡ về R = 192 px (ô làm việc của gach.py).
  2. Bảng màu: gom các điểm của 8 ô thành 5 tông (k-means) → mọi ô cuối cùng chỉ dùng 5 màu phẳng này (đúng kiểu cel).
  3. Ô gốc (ô 1 của ảnh gen) làm LẶP LIỀN: trộn với chính nó dời nửa ô (chỗ nối của bản dời nằm giữa ô, nơi bản gốc
     chiếm hết), rồi đưa về 5 tông + lọc đa số (bỏ mảng vụn, hết bóng ma do trộn).
  4. 7 ô còn lại: phần GIỮA ô lấy từ ô gen tương ứng, dải mép (~16 px ở R ≈ 2,7 logic) lấy Y HỆT ô gốc → mọi biến thể ghép
     liền với nhau và với chính nó theo cả 2 chiều, xen kẽ tự do.
Trả về RGB float R×R (chưa làm tối – gach.py làm tối như cũ)."""
import numpy as np
import scipy.ndimage as nd
from PIL import Image

from chung import doc_rgb

R = 192
HOP = [(49, 45), (479, 45), (912, 44), (1344, 44), (49, 466), (479, 465), (912, 465), (1344, 465)]   # góc trên-trái 8 ô
CO = 373          # cạnh ô gen (đo bằng tách thành phần liên thông: 373–384)
VAO = 4           # bỏ mép
SO_TONG = 5
THU_TU = [0, 4, 2, 6, 1, 5, 3, 7]   # ô gốc = ô 1 (rễ ngang, ít điểm nhấn – lặp ít lộ nhịp nhất)


def cat_o():
    a = doc_rgb('gach-than-go.png')
    out = []
    for x, y in HOP:
        c = a[y + VAO:y + CO - VAO, x + VAO:x + CO - VAO]
        im = Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)).resize((R, R), Image.LANCZOS)
        out.append(np.asarray(im).astype(np.float64))
    return [out[i] for i in THU_TU]


def bang_mau(o, k=SO_TONG, seed=3):
    X = np.concatenate([t.reshape(-1, 3) for t in o])
    rng = np.random.default_rng(seed)
    X = X[rng.choice(len(X), 40000, replace=False)]
    L = X @ np.array([0.299, 0.587, 0.114])
    C = np.array([X[(L >= np.quantile(L, q0)) & (L <= np.quantile(L, q1))].mean(0)
                  for q0, q1 in zip(np.linspace(0, 1, k + 1)[:-1], np.linspace(0, 1, k + 1)[1:])])
    for _ in range(25):
        lab = ((X[:, None] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([X[lab == i].mean(0) if (lab == i).any() else C[i] for i in range(k)])
    return C[np.argsort(C @ np.array([0.299, 0.587, 0.114]))]


def ve_tong(f, C, loc=2.2):
    """Đưa ảnh về các tông C: nhãn gần nhất → lọc đa số (gauss trên one-hot, quấn vòng để giữ lặp liền) → màu phẳng."""
    lab = ((f[..., None, :] - C[None, None]) ** 2).sum(-1).argmin(-1)
    oh = np.stack([nd.gaussian_filter((lab == i).astype(float), loc, mode='wrap') for i in range(len(C))], -1)
    return C[oh.argmax(-1)]


def mat_na_giua(le, doc):
    a = np.minimum(np.arange(R), R - 1 - np.arange(R)).astype(float)
    d = np.minimum.outer(a, a)
    s = np.clip((d - le) / doc, 0, 1)
    return s * s * (3 - 2 * s)


def lam_lien(f, C):
    """Lặp liền 2 chiều, làm từng chiều: trộn với bản dời nửa ô theo trọng số chỉ phụ thuộc x (0 ở mép trái/phải → 1 ở
    giữa, đúng chỗ nối của bản dời) → liền ngang; rồi y tương tự → liền dọc (không phá liền ngang vì trọng số không đổi theo x)."""
    a = np.minimum(np.arange(R), R - 1 - np.arange(R)).astype(float)
    s = np.clip(a / 64, 0, 1)
    w = s * s * (3 - 2 * s)
    f = f * w[None, :, None] + np.roll(f, R // 2, 1) * (1 - w[None, :, None])
    f = f * w[:, None, None] + np.roll(f, R // 2, 0) * (1 - w[:, None, None])
    return ve_tong(f, C)


def bo_than_go():
    o = cat_o()
    C = bang_mau(o)
    f0 = lam_lien(o[0], C)
    q = mat_na_giua(10, 34)[..., None]
    out = [f0]
    for t in o[1:]:
        v = ve_tong(f0 * (1 - q) + ve_tong(t, C, 1.2) * q, C)
        v[q[..., 0] == 0] = f0[q[..., 0] == 0]          # dải mép giữ y hệt ô gốc
        out.append(v)
    return out, C


def kiem_noi(f):
    """Chênh màu ở chỗ nối (mép phải↔trái, dưới↔trên) / chênh trung bình 2 cột kề bên trong (≈1 → không thấy nối)."""
    ngang = np.abs(f[:, -1] - f[:, 0]).mean()
    doc = np.abs(f[-1] - f[0]).mean()
    trong = (np.abs(np.diff(f, axis=1)).mean() + np.abs(np.diff(f, axis=0)).mean()) / 2
    return round(float(ngang / trong), 2), round(float(doc / trong), 2)


if __name__ == '__main__':
    o, C = bo_than_go()
    print('bảng màu', C.round())
    for i, f in enumerate(o):
        print(i, kiem_noi(f))
