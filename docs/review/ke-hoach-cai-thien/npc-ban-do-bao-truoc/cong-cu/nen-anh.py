"""Nén dung lượng ảnh game/art/custom/*.sprite.json (14/10). python3 nen-anh.py [--ghi]
1) KHÔNG MẤT GÌ: ảnh ≤ 256 màu (RGBA) đang lưu RGBA/truecolor -> PNG bảng màu (P + tRNS), điểm ảnh y hệt (so lại từng điểm).
   Điểm trong suốt hẳn (α = 0) đưa về (0,0,0,0) — không thấy khác.
2) CÓ MẤT ÍT (chỉ tấm > 256 màu và ≥ 50 KB: bộ Zed, vài hiệu ứng lớn): bảng 256 màu, tách riêng điểm đục (α = 255, chỉ lượng tử RGB nên
   vẫn đục hẳn) và điểm bán trong (lượng tử RGBA); bảng khởi từ octree rồi tinh chỉnh k-means 8 vòng (trọng số theo số điểm).
   Không đổi cỡ, không làm mờ: chỉ gộp màu gần nhau. In sai số trung bình / phân vị 99.
Chỉ giữ bản mới khi nhỏ hơn. In bảng trước/sau (ra/nen-anh.json)."""
import sys, os, io, json, glob, base64
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
LOSSY_MIN = 50 * 1024

def p_png(idx, pal):
    """idx: HxW uint8; pal: Kx4 uint8"""
    pim = Image.fromarray(idx.astype(np.uint8), 'P'); pim.putpalette(pal[:, :3].ravel().tolist() + [0] * (768 - 3 * len(pal)))
    b = io.BytesIO(); pim.save(b, 'PNG', optimize=True, transparency=bytes(pal[:, 3].tolist())); return b.getvalue()

def p_exact(a):
    u, inv = np.unique(a.reshape(-1, 4).view(np.uint32).ravel(), return_inverse=True)
    if len(u) > 256: return None
    return p_png(inv.reshape(a.shape[:2]), u.view(np.uint8).reshape(-1, 4))

def kmeans(pts, w, k, it=8):
    """pts Nx d float, w N; trả về tâm k x d"""
    k = min(k, len(pts))
    if k <= 0: return np.zeros((0, pts.shape[1]))
    # khởi: octree của Pillow trên các điểm (lặp theo trọng số tối đa 1 lần) — đủ tốt; rồi Lloyd
    img = Image.fromarray(np.clip(pts[:, :3], 0, 255).astype(np.uint8).reshape(1, -1, 3))
    q = img.quantize(colors=k, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    lab = np.array(q).ravel(); C = np.zeros((k, pts.shape[1]))
    for j in range(k):
        m = lab == j
        C[j] = (pts[m] * w[m, None]).sum(0) / w[m].sum() if m.any() else pts[np.random.randint(len(pts))]
    for _ in range(it):
        _, lab = cKDTree(C).query(pts)
        s = np.zeros_like(C); ww = np.bincount(lab, weights=w, minlength=len(C))
        for d in range(pts.shape[1]): s[:, d] = np.bincount(lab, weights=pts[:, d] * w, minlength=len(C))
        ok = ww > 0; C[ok] = s[ok] / ww[ok, None]
    return C

def lossy(a):
    H, W = a.shape[:2]; flat = a.reshape(-1, 4)
    al = flat[:, 3]; opq = al == 255; semi = (al > 0) & (al < 255)
    uo, io_, co = np.unique(flat[opq].view(np.uint32).ravel(), return_inverse=True, return_counts=True)
    us, is_, cs = np.unique(flat[semi].view(np.uint32).ravel(), return_inverse=True, return_counts=True)
    K = 255
    ks = 0 if len(us) == 0 else max(16, min(K - 16, int(round(K * len(us) / max(1, len(us) + len(uo))))))
    ko = K - ks
    po = uo.view(np.uint8).reshape(-1, 4).astype(float); ps = us.view(np.uint8).reshape(-1, 4).astype(float)
    Co = kmeans(po[:, :3], co.astype(float), ko) if len(uo) else np.zeros((0, 3))
    # bán trong: lượng tử trên màu nhân trước + alpha (để màu của điểm gần trong suốt không kéo lệch bảng)
    if len(us):
        pre = np.concatenate([ps[:, :3] * ps[:, 3:4] / 255, ps[:, 3:4]], 1)
        Cs = kmeans(pre, cs.astype(float), ks)
        Cs[:, 3] = np.clip(Cs[:, 3], 1, 254); Cs[:, :3] = Cs[:, :3] * 255 / Cs[:, 3:4]
    else: Cs = np.zeros((0, 4))
    pal = np.concatenate([[[0, 0, 0, 0]], np.concatenate([Co, np.full((len(Co), 1), 255)], 1), Cs], 0)
    pal = np.clip(np.round(pal), 0, 255).astype(np.uint8)
    idx = np.zeros(H * W, np.int64)
    if len(uo): _, lo = cKDTree(Co).query(po[:, :3]); idx[opq] = 1 + lo[io_]
    if len(us):
        _, ls = cKDTree(np.concatenate([Cs[:, :3] * Cs[:, 3:4] / 255, Cs[:, 3:4]], 1)).query(np.concatenate([ps[:, :3] * ps[:, 3:4] / 255, ps[:, 3:4]], 1))
        idx[semi] = 1 + len(Co) + ls[is_]
    png = p_png(idx.reshape(H, W), pal)
    back = np.array(Image.open(io.BytesIO(png)).convert('RGBA')).astype(int)
    op = a[..., 3] > 0; e = np.abs(back - a.astype(int))[op]
    assert ((back[..., 3] == 255) == (a[..., 3] == 255)).all() and ((back[..., 3] == 0) == (a[..., 3] == 0)).all()
    return png, float(e.mean()), float(np.percentile(e.max(1), 99))

rows = []; t0 = t1 = 0
for f in sorted(glob.glob(os.path.join(DAY, 'game/art/custom/*.sprite.json'))):
    d = json.load(open(f, encoding='utf-8')); k = 'tam' if isinstance(d.get('tam'), str) else 'anh' if isinstance(d.get('anh'), str) else None
    if not k or not d[k].startswith('data:image/png;base64,'): continue
    png = base64.b64decode(d[k].split(',')[1]); a = np.array(Image.open(io.BytesIO(png)).convert('RGBA')); a[a[..., 3] == 0] = 0
    moi, cach, sai = None, '', None
    q = p_exact(a)
    if q is not None:
        assert (np.array(Image.open(io.BytesIO(q)).convert('RGBA')) == a).all()
        moi, cach = q, 'bảng màu, không mất'
    elif len(png) >= LOSSY_MIN:
        q, em, e99 = lossy(a); moi, cach, sai = q, '256 màu (k-means)', [round(em, 2), e99]
    t0 += len(png)
    if moi is not None and len(moi) < len(png):
        t1 += len(moi); rows.append({'ma': d['ma'], 'truoc': len(png), 'sau': len(moi), 'cach': cach, 'sai_so': sai})
        if GHI:
            d[k] = 'data:image/png;base64,' + base64.b64encode(moi).decode()
            json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    else: t1 += len(png)
rows.sort(key=lambda r: r['truoc'] - r['sau'], reverse=True)
for r in rows[:30]: print(r)
print('PNG tổng: %.2f MB -> %.2f MB (%d tấm đổi)' % (t0 / 1048576, t1 / 1048576, len(rows)))
json.dump({'tong_truoc': t0, 'tong_sau': t1, 'tam': rows}, open(os.path.join(RA, 'nen-anh.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
