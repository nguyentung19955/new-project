"""Đo neo ngang (giữa đám xúc tu dưới cùng) của từng khung Ngư Tinh mới, bỏ điểm hiệu ứng (nước, băng sáng)."""
import numpy as np, glob, json, os
from PIL import Image
GOC = os.path.join(os.path.dirname(__file__), '../../../../anh-goc/trum-moi/ngu-tinh')
def la_hieu_ung(a, pha):
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    sang = np.minimum(np.minimum(r, g), b) > 150                # trắng / lam rất nhạt
    if pha == 3: return sang
    xanh = (b > r + 20) & (g > r)                                # nước xanh lam ở pha 1, 2
    return sang | xanh
def neo(f, pha, day_frac=0.18):
    a = np.array(Image.open(f).convert('RGBA'))
    m = a[..., 3] > 128
    ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[-1]
    band = m.copy(); band[: int(y1 - day_frac * (y1 - y0))] = False
    t = band & ~la_hieu_ung(a, pha)
    if t.sum() < 50: t = band
    xs = np.nonzero(t)[1]
    return float(np.median(xs)), float((xs.min() + xs.max()) / 2)
if __name__ == '__main__':
    for d in sorted(glob.glob(GOC + '/*-cat')):
        b = json.load(open(d + '/bao-cao.json')); W = b['co_anh'][0]; n = b['so_cot_can']; ks = b['hang'][0]['khung']
        pha = 2 if '/p2-' in d else 3 if '/p3-' in d else 1
        fs = sorted(glob.glob(d + '/*/khung-*.png'))
        r = []
        for i, f in enumerate(fs):
            med, mid = neo(f, pha); x0 = ks[i]['khung_bao'][0] - i * W / n
            r.append((round(med + x0), round(ks[i]['chan'][0] - i * W / n)))
        print(os.path.basename(d), r)

# ---- neo theo khớp đặc trưng (SIFT) ở dải xúc tu dưới, so với khung đầu của hàng ----
import cv2
_sift = cv2.SIFT_create(nfeatures=5000)
def dac_trung(f):
    a = np.array(Image.open(f).convert('RGBA')); al = a[..., 3:4] / 255.0
    g = cv2.cvtColor((a[..., :3] * al + 255 * (1 - al)).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    k, d = _sift.detectAndCompute(g, (a[..., 3] > 40).astype(np.uint8) * 255)
    return k, d, a.shape[0]
def dich_chan(A, B, frac=0.35):
    """độ dời (dx, dy) của dải chân B so với A (toạ độ khung cắt), số cặp khớp"""
    ka, da, ha = A; kb, db, hb = B
    if da is None or db is None: return None, 0
    ms = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, n in (p for p in ms if len(p) == 2) if m.distance < 0.75 * n.distance]
    if len(good) < 6: return None, len(good)
    pa = np.float32([ka[m.queryIdx].pt for m in good]); pb = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=5)
    if M is None: return None, 0
    inl = inl.ravel().astype(bool) & (pa[:, 1] > ha * (1 - frac)) & (pb[:, 1] > hb * (1 - frac) - 20)
    if inl.sum() < 4: return None, int(inl.sum())
    # dời theo đáy: so điểm với đáy khung (đáy khung cắt = đường đất)
    dx = float(np.median(pb[inl, 0] - pa[inl, 0])); return dx, int(inl.sum())
