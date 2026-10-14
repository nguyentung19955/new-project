"""Đo tỉ lệ hàng nói so với hàng đứng của mỗi NPC bằng SIFT (trung vị mọi cặp khung)."""
import os, glob, numpy as np, cv2
from PIL import Image
GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../anh-goc/npc-moi'))
sift = cv2.SIFT_create(nfeatures=4000)
def dt(f):
    a = np.array(Image.open(f).convert('RGBA')); al = a[..., 3:4] / 255.0
    g = cv2.cvtColor((a[..., :3] * al + 255 * (1 - al)).astype(np.uint8), cv2.COLOR_RGB2GRAY)
    return sift.detectAndCompute(g, (a[..., 3] > 40).astype(np.uint8) * 255)
def ti(A, B):
    (ka, da), (kb, db) = A, B
    if da is None or db is None: return None
    ms = cv2.BFMatcher().knnMatch(da, db, k=2)
    good = [m for m, n in (p for p in ms if len(p) == 2) if m.distance < 0.75 * n.distance]
    if len(good) < 8: return None
    pa = np.float32([ka[m.queryIdx].pt for m in good]); pb = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=4)
    if M is None or inl.sum() < 8: return None
    return float(np.hypot(M[0, 0], M[1, 0]))
for m in ['lai', 'ren', 'xen', 'may', 'do', 'tu', 'mo']:
    d1 = [dt(f) for f in sorted(glob.glob(f'{GOC}/nl-{m}-1-dung-cat/*/khung-*.png'))]
    d2 = [dt(f) for f in sorted(glob.glob(f'{GOC}/nl-{m}-2-noi-cat/*/khung-*.png'))]
    r = [ti(a, b) for a in d1 for b in d2]; r = [x for x in r if x]
    print(m, len(r), round(float(np.median(r)), 3) if r else None)
