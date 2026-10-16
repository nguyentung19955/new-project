"""Chỉ số NÉT của một hình điểm ảnh (RGBA, cỡ điểm ảnh THẬT trên canvas — 2 điểm / điểm ảnh game).
  mo_vien  : % điểm ảnh đục có alpha lửng (1..254) — viền nhoè do thu nhỏ kiểu lanczos / box / bilinear.
  pha_tron : % điểm ảnh đục nằm GIỮA hai màu khác hẳn nhau (ngang hoặc dọc: |A−B| độ sáng ≥ 40 và điểm giữa nằm trong 25–75% từ A tới B,
             và khác cả A lẫn B ≥ 12) — dấu hiệu làm mịn / lấy trung bình.
  lap_cot  : % cột (hoặc hàng) liền kề giống hệt cột trước (trong vùng hình) — dấu hiệu phóng KHÔNG nguyên (×1,2 lặp 1/6 cột).
  doc_canh : độ dốc cạnh trung bình — trung bình |chênh độ sáng| giữa hai điểm kề nhau trên các cạnh mạnh (≥ 40), chia cho chênh hai bên
             cách 3 điểm (1.0 = cạnh dựng đứng, nhỏ = cạnh thoải / nhoè).
  NHOE     : chỉ số gộp = pha_tron + 0,5 × mo_vien (thấp = nét).
Chạy: python3 chi_so.py ảnh.png …  (in bảng)"""
import sys
import numpy as np
from PIL import Image


def do(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    A = a[..., 3]
    op = A > 0
    n = int(op.sum())
    if n == 0:
        return None
    L = a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114
    L = np.where(op, L, np.nan)
    semi = ((A > 0) & (A < 255)).sum()
    blend = np.zeros(A.shape, bool)
    for ax in (0, 1):
        P = L
        Am = np.roll(L, 1, axis=ax); Bp = np.roll(L, -1, axis=ax)
        d = Bp - Am
        with np.errstate(invalid='ignore', divide='ignore'):
            t = (P - Am) / d
            m = (np.abs(d) >= 40) & (t > 0.25) & (t < 0.75) & (np.abs(P - Am) >= 12) & (np.abs(P - Bp) >= 12)
        m &= op & np.roll(op, 1, axis=ax) & np.roll(op, -1, axis=ax)
        blend |= np.nan_to_num(m).astype(bool)
    # cạnh: dốc 1 điểm / dốc qua 3 điểm
    st = []
    for ax in (0, 1):
        d1 = np.abs(np.roll(L, -1, axis=ax) - L)
        d3 = np.abs(np.roll(L, -2, axis=ax) - np.roll(L, 1, axis=ax))
        m = (d3 >= 40) & ~np.isnan(d1) & ~np.isnan(d3)
        if m.any():
            st.append(np.nanmean(d1[m] / d3[m]))
    # lặp cột / hàng
    ys, xs = np.nonzero(op)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    c = a[y0:y1, x0:x1]
    same_c = sum(1 for x in range(1, c.shape[1]) if c[:, x, 3].any() and np.array_equal(c[:, x], c[:, x - 1]))
    same_r = sum(1 for y in range(1, c.shape[0]) if c[y, :, 3].any() and np.array_equal(c[y], c[y - 1]))
    lap = 100.0 * (same_c + same_r) / max(1, (c.shape[0] + c.shape[1] - 2))
    mo = 100.0 * semi / n
    ph = 100.0 * blend.sum() / n
    return {'diem': n, 'mo_vien': round(mo, 2), 'pha_tron': round(ph, 2), 'lap_cot': round(lap, 2),
            'doc_canh': round(float(np.mean(st)) if st else 0, 3), 'NHOE': round(ph + 0.5 * mo, 2)}


if __name__ == '__main__':
    for p in sys.argv[1:]:
        print(p, do(Image.open(p)))
