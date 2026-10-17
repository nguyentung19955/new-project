"""TÌM ẢNH GỐC cho từng khung hiệu ứng / giao diện (nét cao 17/10) — cách làm NGƯỢC như do-net/cong-cu/dung_quai_net.py.
Với mỗi khung của ảnh đang dùng (net 1/2/3): tìm trong kho ảnh gốc AI (docs/anh-goc/…, ảnh gen trong docs/review/…) một vùng + tỉ lệ +
chỗ dán sao cho thu nhỏ vùng đó (phủ ≥ ngưỡng → đục) ra ĐÚNG mặt nạ khung (IoU). Khớp ≥ 0,97 → dựng lại được ở nét 3/4 (dung_net_cao.py).
  python3 tim_goc.py [mã,mã,…]          → ra/tim-goc.json (mỗi mã: từng khung: tệp gốc, vùng gốc, IoU, lệch màu)
Kho ảnh gốc được đệm ở ra/kho/ (ảnh thu nhỏ để dò + vùng vật thể) cho lần chạy sau nhanh."""
import glob, json, os, pickle, sys, time
import numpy as np
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chung import REPO, RA, pham_vi, doc_tam, khung, tach_nen, net_cua

Image.MAX_IMAGE_PIXELS = None
KHO_DIR = os.path.join(RA, 'kho'); os.makedirs(KHO_DIR, exist_ok=True)
DOCS = os.path.join(REPO, 'docs')
THU_MUC = [
    'anh-goc/bao-truoc', 'anh-goc/buoc-2', 'anh-goc/ep-do', 'anh-goc/giao-dien', 'anh-goc/hieu-ung-ky-nang', 'anh-goc/trum-moi/hieu-ung',
    'anh-goc/ve-tay-8-dot-1', 'anh-goc/ve-tay-8-gop', 'anh-goc/vung-4', 'anh-goc/zed/hieu-ung', 'anh-goc/nen-phong', 'anh-goc/bia',
    'review/ke-hoach-cai-thien/con-ve-tay-5/anh-gen', 'review/ke-hoach-cai-thien/con-ve-tay-6/anh-gen-lai', 'review/ke-hoach-cai-thien/nut-danh-to/anh',
    'phac-thao/nut-bam', 'chuong', 'dan-va-linh-khi', 'chieu-thuc', 'vfx', 'ghep', 'ghep-2', 'tam-huong-va-chieu', 'anh-goc/quai-moi/song',
    'review/ke-hoach-cai-thien/con-ve-tay-8/mau', 'review/ke-hoach-cai-thien/con-ve-tay', 'review/ke-hoach-cai-thien/con-ve-tay-4',
    'review/ke-hoach-cai-thien/con-ve-tay-5', 'review/ke-hoach-cai-thien/vu-khi-cu-con-sot', 'review/ke-hoach-cai-thien/tu-van-4-phuc-lanh',
]
THEM_TEP = sorted(glob.glob(os.path.join(DOCS, 'anh-goc', 'quai-moi', '*.png')) + glob.glob(os.path.join(DOCS, 'anh-goc', 'trum-moi', '*.png')))
BO = ('anh-soat', 'xem-truoc', 'so-sanh', 'truoc-sau', '/ra/', 'chup', 'man-')
PROXY = 640


def kho_tep():
    L = []
    for t in THU_MUC:
        L += glob.glob(os.path.join(DOCS, t, '**', '*.png'), recursive=True)
    L += THEM_TEP
    out = []
    for f in sorted(set(L)):
        r = os.path.relpath(f, REPO)
        if any(b in r for b in BO):
            continue
        if os.path.getsize(f) < 2000:
            continue
        out.append(f)
    return out


def nap_kho(f):
    """→ dict: tệp, cỡ gốc, vật thể [(x0,y0,x1,y1) gốc, mô tả 16×16, màu tb]"""
    k = os.path.join(KHO_DIR, os.path.relpath(f, REPO).replace('/', '__') + '.pkl')
    if os.path.exists(k) and os.path.getmtime(k) >= os.path.getmtime(f):
        return pickle.load(open(k, 'rb'))
    im = Image.open(f)
    W, H = im.size
    sc = min(1.0, PROXY / max(W, H))
    if sc < 1:
        pim = im.convert('RGBA').resize((max(1, int(W * sc)), max(1, int(H * sc))), Image.BOX)
    else:
        pim = im.convert('RGBA')
    p = tach_nen(np.array(pim))
    m = p[..., 3] > 0.25
    objs = []
    for gian in (1, 3):
        lab, n = nd.label(nd.binary_dilation(m, iterations=gian) if gian else m)
        for i, sl in enumerate(nd.find_objects(lab)):
            if sl is None:
                continue
            sub = (lab[sl] == i + 1) & m[sl]
            if sub.sum() < 12:
                continue
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            objs.append(((x0 / sc, y0 / sc, x1 / sc, y1 / sc), mo_ta(sub), mau_tb(p[sl], sub)))
    # cả ảnh (ảnh khung đã cắt sẵn)
    if m.any():
        ys, xs = np.nonzero(m)
        sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
        objs.append(((xs.min() / sc, ys.min() / sc, (xs.max() + 1) / sc, (ys.max() + 1) / sc), mo_ta(m[sl]), mau_tb(p[sl], m[sl])))
    r = {'tep': f, 'W': W, 'H': H, 'objs': objs}
    pickle.dump(r, open(k, 'wb'))
    return r


def mo_ta(m):
    h, w = m.shape
    a = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((16, 16), Image.BOX), np.float32) / 255
    return a, w / max(1, h)


def mau_tb(p, m):
    if not m.any():
        return np.zeros(3, np.float32)
    return p[..., :3][m].mean(0)


# ---------- khớp tinh ----------
def tich_phan(al):
    S = np.zeros((al.shape[0] + 1, al.shape[1] + 1), np.float64)
    S[1:, 1:] = al.cumsum(0).cumsum(1)
    return S


def lay_S(S, y, x):
    """giá trị tích phân tại toạ độ lẻ (nội suy song tuyến — đúng với ảnh hằng từng ô)"""
    H, W = S.shape[0] - 1, S.shape[1] - 1
    x = np.clip(x, 0, W); y = np.clip(y, 0, H)
    x0 = np.minimum(np.floor(x).astype(int), W - 1); y0 = np.minimum(np.floor(y).astype(int), H - 1)
    fx = x - x0; fy = y - y0
    a = S[y0, x0]; b = S[y0, x0 + 1]; c = S[y0 + 1, x0]; d = S[y0 + 1, x0 + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy


def phu(S, ox, oy, s, w, h):
    """độ phủ alpha của ô đích (i, j) = vùng gốc [ox + i·s, ox + (i+1)·s) × …"""
    xs = ox + np.arange(w + 1) * s
    ys = oy + np.arange(h + 1) * s
    Y, X = np.meshgrid(ys, xs, indexing='ij')
    V = lay_S(S, Y, X)
    A = V[1:, 1:] - V[:-1, 1:] - V[1:, :-1] + V[:-1, :-1]
    return A / (s * s)


def khop_tinh(T, al_S, sb, flip, W_src):
    """T: mặt nạ khung (h×w bool). sb: hộp vật thể gốc (toạ độ ảnh gốc, chưa lật). → (iou, ox, oy, s, nguong)"""
    h, w = T.shape
    ys, xs = np.nonzero(T)
    tb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    x0, y0, x1, y1 = sb
    if flip:
        x0, x1 = W_src - x1, W_src - x0
    s0h = (y1 - y0) / max(1, tb[3] - tb[1]); s0w = (x1 - x0) / max(1, tb[2] - tb[0])
    tot = (0, 0, 0, 1, 0.5)
    for s0 in sorted({round(s0h, 4), round(s0w, 4), round((s0h + s0w) / 2, 4)}):
        for s in s0 * (1 + np.linspace(-0.03, 0.03, 7)):
            for ddx in (-0.35, 0, 0.35):
                for ddy in (-0.35, 0, 0.35):
                    ox = x0 - (tb[0] + ddx) * s; oy = y0 - (tb[1] + ddy) * s
                    C = phu(al_S, ox, oy, s, w, h) >= 0.5
                    iou = (C & T).sum() / max(1, (C | T).sum())
                    if iou > tot[0]:
                        tot = (iou, ox, oy, s, 0.5)
    if tot[0] < 0.6:
        return tot
    # tinh chỉnh quanh chỗ tốt nhất (tỉ lệ, chỗ dán lẻ, ngưỡng phủ)
    for vong in range(3):
        iou, ox, oy, s, th = tot
        buoc = (0.25, 0.1, 0.04)[vong]
        for ds in (-0.006, 0, 0.006) if vong else (-0.01, -0.005, 0, 0.005, 0.01):
            for ex in (-buoc, 0, buoc):
                for ey in (-buoc, 0, buoc):
                    for th2 in ((0.3, 0.4, 0.5, 0.6, 0.7) if vong == 0 else (th,)):
                        ss = s * (1 + ds)
                        C = phu(al_S, ox + ex * s, oy + ey * s, ss, w, h) >= th2
                        i2 = (C & T).sum() / max(1, (C | T).sum())
                        if i2 > tot[0]:
                            tot = (i2, ox + ex * s, oy + ey * s, ss, th2)
    return tot


_ANH = {}


def anh_goc(f, flip=False):
    k = (f, flip)
    if k not in _ANH:
        if len(_ANH) > 6:
            _ANH.clear()
        a = tach_nen(np.array(Image.open(f).convert('RGBA')))
        if flip:
            a = a[:, ::-1].copy()
        _ANH[k] = (a, tich_phan(a[..., 3].astype(np.float64)))
    return _ANH[k]


def tim(ma, KHO, top=6):
    d, a = doc_tam(ma)
    kq = []
    for ten, o, (px, py) in khung(d, a):
        T = o[..., 3] > 0
        if T.sum() < 4:
            kq.append({'k': ten, 'rong': True}); continue
        ys, xs = np.nonzero(T)
        sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
        (dsc, asp) = mo_ta(T[sl]); col = o[..., :3][T].mean(0) / 255
        ung = []
        for ki, K in enumerate(KHO):
            for oi, (bbx, (d2, a2), c2) in enumerate(K['objs']):
                for fl in (False, True):
                    dd = d2[:, ::-1] if fl else d2
                    sc = np.abs(dd - dsc).mean() + 0.25 * abs(np.log(max(1e-3, a2) / max(1e-3, asp))) + 0.15 * np.abs(c2 - col).mean()
                    ung.append((sc, ki, oi, fl))
        ung.sort(key=lambda t: t[0])
        tot = None; xet = set()
        for sc, ki, oi, fl in ung[:top * 3]:
            key = (ki, KHO[ki]['objs'][oi][0], fl)
            if key in xet:
                continue
            xet.add(key)
            if len(xet) > top:
                break
            K = KHO[ki]
            if T.sum() < 30 and sc > 0.25:
                continue
            al, S = anh_goc(K['tep'], fl)[0], anh_goc(K['tep'], fl)[1]
            r = khop_tinh(T, S, K['objs'][oi][0], False, K['W']) if not fl else khop_tinh(T, S, flip_box(K['objs'][oi][0], K['W']), False, K['W'])
            if tot is None or r[0] > tot['iou']:
                tot = {'iou': float(r[0]), 'tep': os.path.relpath(K['tep'], REPO), 'lat': fl, 'ox': float(r[1]), 'oy': float(r[2]), 's': float(r[3]), 'nguong': r[4], 'diem_sc': float(sc)}
            if tot['iou'] >= 0.985:
                break
        if tot:
            tot['lech_mau'] = lech_mau(o, tot)
        kq.append(dict(k=ten, **(tot or {'iou': 0})))
    return kq


def flip_box(b, W):
    return (W - b[2], b[1], W - b[0], b[3])


def lech_mau(o, t):
    """dựng lại khung net cũ từ vùng gốc (màu trung bình theo phủ) rồi so màu với khung đang dùng (trung bình |Δ| 0..255 trên điểm đục chung)"""
    al, S = anh_goc(os.path.join(REPO, t['tep']), t['lat'])
    h, w = o.shape[:2]
    A = al[..., 3].astype(np.float64)
    cols = []
    for c in range(3):
        Sc = tich_phan(al[..., c].astype(np.float64) * A)
        cols.append(phu(Sc, t['ox'], t['oy'], t['s'], w, h))
    cov = phu(S, t['ox'], t['oy'], t['s'], w, h)
    rgb = np.stack(cols, -1) / np.maximum(cov[..., None], 1e-6) * 255
    m = (o[..., 3] > 0) & (cov >= t['nguong'])
    if not m.any():
        return 999.0
    return float(np.abs(rgb[m] - o[..., :3][m].astype(np.float64)).mean())


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ds = args[0].split(',') if args else pham_vi()
    t0 = time.time()
    KHO = [nap_kho(f) for f in kho_tep()]
    print('kho', len(KHO), 'tệp', sum(len(k['objs']) for k in KHO), 'vật thể', '%.0fs' % (time.time() - t0), flush=True)
    p = os.path.join(RA, 'tim-goc.json')
    tong = json.load(open(p)) if os.path.exists(p) else {}
    for ma in ds:
        if '--lai' not in sys.argv and ma in tong:
            continue
        t1 = time.time()
        kq = tim(ma, KHO)
        tong[ma] = kq
        ious = [k.get('iou', 0) for k in kq if not k.get('rong')]
        print('%-28s %2d khung  IoU min %.3f  tb %.3f  %s  %.0fs' % (ma, len(ious), min(ious) if ious else 0, np.mean(ious) if ious else 0,
              (kq[0].get('tep') or '')[-60:], time.time() - t1), flush=True)
        json.dump(tong, open(p, 'w'), ensure_ascii=False, indent=0)
