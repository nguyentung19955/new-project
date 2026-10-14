"""Hàm chung: đọc khung đã cắt của 4 quái Rừng già vẽ lại, đo thân (đáy, tâm, cao, rộng), đo tỉ lệ giữa các hàng (SIFT)."""
import os, glob, json, base64, io
import numpy as np
from PIL import Image

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
NGUON = os.path.join(DAY, 'docs/anh-goc/quai-moi/dong-tac')
CUSTOM = os.path.join(DAY, 'game/art/custom')
MA = ['heoCon', 'heoNanh', 'chonBong', 'boHung']
# (hàng sprite, thư mục bước, số khung)
BUOC = [('idle', '1-dung', 6), ('move', '2-di', 6), ('tele', '3-bao-don', 6), ('atk', '4-danh', 6), ('hit', '5-trung-don', 4), ('die', '6-chet', 6)]


def doc_khung(ma, buoc):
    d = glob.glob(os.path.join(NGUON, '%s-%s-cat' % (ma, buoc)))[0]
    fs = sorted(glob.glob(os.path.join(d, '*', 'khung-*.png')))
    return [np.array(Image.open(f).convert('RGBA')) for f in fs], fs


def hieu_ung(a):
    """điểm rực màu (mắt đỏ, vệt cào đỏ, chớp sáng): không dùng để đo đáy / tâm"""
    c = a[..., :3].astype(int); mx = c.max(2); mn = c.min(2)
    return ((mx > 200) & (mx - mn > 140)) | (mn > 235)


def do_than(a):
    """đo một khung (toạ độ ảnh cắt): đáy (đường đất), tâm thân trên sàn (trung bình x ở 35% dưới), hộp thân."""
    m = a[..., 3] > 128
    if m.sum() < 200: m = a[..., 3] > 0.5 * a[..., 3].max()   # khung đang mờ dần (Bọ Hung gục khung 5, 6)
    t = m & ~hieu_ung(a)
    if t.sum() < 0.6 * m.sum(): t = m
    dem = t.sum(1)
    nguong = max(3, int(0.004 * t.shape[1]))
    hang = np.nonzero(dem >= nguong)[0]
    y0, y1 = int(hang[0]), int(hang[-1])           # bỏ vài điểm lẻ (bụi rời) ở mép trên / dưới
    cot = np.nonzero(t[y0:y1 + 1].sum(0) >= 2)[0]
    x0, x1 = int(cot[0]), int(cot[-1])
    h = y1 - y0
    band = t.copy(); band[: int(y1 - 0.35 * h)] = False; band[y1 + 1:] = False
    xs = np.nonzero(band)[1]
    cx = float(xs.mean()) if len(xs) else (x0 + x1) / 2
    return dict(day=y1 + 1, cx=cx, cao=y1 - y0 + 1, rong=x1 - x0 + 1, x0=x0, x1=x1, y0=y0)


_sift = None


def dac_trung(a):
    import cv2
    global _sift
    if _sift is None: _sift = cv2.SIFT_create(nfeatures=4000)
    al = a[..., 3:4] / 255.0
    g = cv2.cvtColor((a[..., :3] * al + 255 * (1 - al)).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    return _sift.detectAndCompute(g, (a[..., 3] > 40).astype(np.uint8) * 255)


def ti_le(A, B):
    """tỉ lệ cỡ B / A (khớp SIFT, biến đổi đồng dạng RANSAC). Trả (tỉ lệ, số cặp trong) hoặc (None, n)."""
    import cv2
    ka, da = A; kb, db = B
    if da is None or db is None or len(da) < 8 or len(db) < 8: return None, 0
    ms = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [p[0] for p in ms if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    if len(good) < 8: return None, len(good)
    pa = np.float32([ka[m.queryIdx].pt for m in good]); pb = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=4)
    if M is None: return None, 0
    n = int(inl.sum())
    if n < 8: return None, n
    return float(np.hypot(M[0, 0], M[1, 0])), n


def doc_tam(ma, ten=None):
    p = os.path.join(CUSTOM, (ten or ma) + '.sprite.json')
    d = json.load(open(p, encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
    return d, np.array(im)


def khung_tam(d, a, ten, i):
    """khung i của động tác ten trên tấm (điểm ảnh của tấm, gấp net lần)"""
    n = d.get('net', 1); fw, fh = d['khung_rong'] * n, d['khung_cao'] * n; h = d['dong_tac'][ten]['hang']
    return a[h * fh:(h + 1) * fh, i * fw:(i + 1) * fw]
