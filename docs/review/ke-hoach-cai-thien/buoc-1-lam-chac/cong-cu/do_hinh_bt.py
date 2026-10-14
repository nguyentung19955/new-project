"""Đo hình học từng khung của 4 dải ảnh báo trước (docs/anh-goc/bao-truoc), để căn tâm từng khung (cách của trum-chet-pha3:
đo tâm thật của hình trong từng khung rồi dời khung cho tâm trùng điểm neo, không dùng tâm ô vuông).
- tròn, vành: dò tia từ tâm ước lượng ở hai phía trên / dưới (tránh khung bên cạnh lấn ngang), lấy mép ngoài viền (alpha > 0,5),
  khớp đường tròn bình phương nhỏ nhất, lặp 3 lần, bỏ điểm lệch (gai, tia sáng) > 2 lần trung vị sai số.
- quạt: đỉnh = điểm trái nhất trên trục; trục = trung bình dọc của hình; bán kính = mép phải trên trục.
- dải: tâm dọc từng dòng = trung bình dọc có trọng số alpha trong thân; hai đầu = mép trái / phải thân (alpha > 0,5 trên dòng tâm)."""
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../npc-ban-do-bao-truoc/cong-cu'))
from tach_xanh import unmix
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/bao-truoc')
BUOC = 2172 / 8


def doc(ten):
    return unmix(np.array(Image.open(os.path.join(GOC, ten)).convert('RGB')))


def vong(a, cx, cy, rmin=70, rmax=168, nguong=0.5):
    al = a[..., 3].astype(np.float32) / 255
    H, W = al.shape
    for _ in range(3):
        pts = []
        for t in np.linspace(0, 2 * np.pi, 180, endpoint=False):
            if abs(np.sin(t)) < 0.55:
                continue  # hai bên trái / phải: khung kề lấn vào
            rs = np.arange(rmax, rmin, -0.5)
            xs, ys = cx + rs * np.cos(t), cy + rs * np.sin(t)
            ok = (xs >= 0) & (xs < W - 1) & (ys >= 0) & (ys < H - 1)
            v = np.zeros_like(rs); v[ok] = al[ys[ok].astype(int), xs[ok].astype(int)]
            k = np.argmax(v > nguong)
            if v[k] > nguong:
                pts.append((xs[k], ys[k]))
        P = np.array(pts)
        for _ in range(3):
            A = np.c_[2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))]
            b = (P ** 2).sum(1)
            x, y, c = np.linalg.lstsq(A, b, rcond=None)[0]
            R = np.sqrt(c + x * x + y * y)
            e = np.abs(np.hypot(P[:, 0] - x, P[:, 1] - y) - R)
            P = P[e <= max(1.0, 2 * np.median(e))]
        cx, cy = x, y
    return cx, cy, R


if __name__ == '__main__':
    for ten, CY in [('tron.png', 349.5), ('vanh-khuyen.png', 340)]:
        a = doc(ten)
        for i in range(8):
            x, y, R = vong(a, (i + 0.5) * BUOC, CY)
            print(ten, i, 'tâm %.1f, %.1f (lệch ô %.1f, %.1f) R %.1f' % (x, y, x - (i + 0.5) * BUOC, y - CY, R))
