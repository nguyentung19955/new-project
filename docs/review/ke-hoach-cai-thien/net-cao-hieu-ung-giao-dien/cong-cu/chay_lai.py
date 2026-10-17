"""CHẠY LẠI CÔNG CỤ DỰNG CŨ, BẮT ẢNH TO TRƯỚC KHI THU (nét cao 17/10).
Công cụ dựng hiệu ứng / giao diện cũ (cat_dot_3.py, dung-gop.py, cat-gd.py, …) đều: tách nền ảnh gốc AI → đặt vào một canvas to đúng khung
→ thu nhỏ bằng PIL resize (BOX / NEAREST / LANCZOS) về cỡ khung × net → ghi tệp. Ở đây chạy lại đúng công cụ đó nhưng:
  - mọi lệnh GHI tệp trong repo bị chuyển vào ra/hop-cat/ (không đụng game/art/custom, không đụng ảnh xem trước của phiên cũ);
  - mọi lệnh Image.resize thu nhỏ bị GHI LẠI: ảnh to đưa vào + cỡ ra.
Sau đó với từng khung của ảnh ĐANG DÙNG: tìm lệnh thu nhỏ cho ra đúng mặt nạ khung đó (IoU, cho phép dán lệch) → biết vùng ảnh to ứng với
khung → dựng lại ở nét 3 và 4 bằng thu_net (do-net/cong-cu/thu_net.py: mỗi điểm một màu có thật).
  python3 chay_lai.py <công cụ.py> [đối số…] [--ma mã,mã]   → ra/net-cao/<mã>.json (mỗi khung: n3/n4 PNG base64, IoU, cách lấy màu)
"""
import base64, builtins, io, json, os, pickle, runpy, sys, time
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chung import REPO, RA, pham_vi, doc_tam, khung, net_cua
sys.path.insert(0, os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'do-net', 'cong-cu'))
import thu_net

HOP = os.path.join(RA, 'hop-cat')
RA_NC = os.path.join(RA, 'net-cao'); os.makedirs(RA_NC, exist_ok=True)
GHI_LAI = []          # (ảnh vào RGBA uint8, (w, h), cách thu, ảnh ra RGBA uint8)
_open = builtins.open
_resize = Image.Image.resize
DOI = {}


def _doi(p):
    try:
        ap = os.path.abspath(os.fspath(p))
    except TypeError:
        return p
    if ap.startswith(REPO + os.sep) and not ap.startswith(RA + os.sep):
        q = os.path.join(HOP, os.path.relpath(ap, REPO))
        os.makedirs(os.path.dirname(q), exist_ok=True)
        DOI[ap] = q
        return q
    return p


def open_moi(file, mode='r', *a, **k):
    if isinstance(file, (str, bytes, os.PathLike)):
        if any(c in mode for c in 'wax+'):
            file = _doi(file)
        else:
            ap = os.path.abspath(os.fspath(file))
            if ap in DOI and os.path.exists(DOI[ap]):
                file = DOI[ap]
    return _open(file, mode, *a, **k)


def resize_moi(self, size, resample=None, *a, **k):
    out = _resize(self, size, resample, *a, **k) if resample is not None else _resize(self, size, *a, **k)
    try:
        w, h = size
        if w * h <= 4096 * 4096 and self.width * self.height > w * h and self.mode in ('RGBA', 'RGBa', 'LA', 'RGB', 'P', 'L', 'F', 'I'):
            GHI_LAI.append((self, (int(w), int(h)), resample, out))
    except Exception:
        pass
    return out


HAM = []  # tên hàm thu nhỏ tự viết (NEAREST bằng numpy) cần bắt: gan(o, x0, y0, x1, y1, W, H)


def bat_gan(a, r):
    o, x0, y0, x1, y1, W, H = a[:7]
    try:
        GHI_LAI.append((np.asarray(o), (int(W), int(H)), 0, np.asarray(r), (float(x0), float(y0), (x1 - x0) / W, (y1 - y0) / H)))
    except Exception:
        pass


def chay(tool, args):
    builtins.open = open_moi
    Image.Image.resize = resize_moi
    _mk = os.makedirs
    os.makedirs = lambda p, *a, **k: _mk(_doi(p) if isinstance(p, (str, os.PathLike)) else p, *a, **k)
    argv = sys.argv
    sys.argv = [tool] + list(args)
    cwd = os.getcwd()
    try:
        os.chdir(REPO)
        sys.path.insert(0, os.path.dirname(os.path.abspath(tool)))
        if HAM:
            src = _open(tool, encoding='utf-8').read()
            for h in HAM:
                src = src.replace('def %s(' % h, 'def _%s_goc(' % h)
                src = ('def %s(*a, **k):\n    r = _%s_goc(*a, **k)\n    __BAT__(a, r)\n    return r\n' % (h, h)) + src
            g = {'__name__': '__main__', '__file__': tool, '__BAT__': bat_gan, '__builtins__': builtins}
            exec(compile(src, tool, 'exec'), g)
        else:
            runpy.run_path(tool, run_name='__main__')
    except SystemExit:
        pass
    except Exception as e:  # công cụ cũ hỏng giữa chừng (tệp đã xoá…): giữ phần đã bắt
        import traceback; traceback.print_exc(); print('!! công cụ dừng giữa chừng:', e, flush=True)
    finally:
        os.chdir(cwd)
        builtins.open = _open
        Image.Image.resize = _resize
        os.makedirs = _mk
        sys.argv = argv


def rgba(im):
    if im.mode == 'RGBa':
        im = im.convert('RGBA')
    if im.mode == 'P':
        im = im.convert('RGBA')
    if im.mode == 'LA':
        a = np.array(im); return np.dstack([a[..., 0]] * 3 + [a[..., 1]])
    if im.mode == 'L':
        a = np.array(im); return np.dstack([a, a, a, np.full_like(a, 255)])
    return np.array(im.convert('RGBA'))


def arr_rgba(a):
    a = np.asarray(a)
    if a.dtype != np.uint8:
        a = np.clip(a * (255.0 if a.max() <= 1.001 else 1.0), 0, 255).astype(np.uint8)
    if a.ndim == 3 and a.shape[2] == 1:
        a = a[..., 0]
    if a.ndim == 2:
        a = np.dstack([a, a, a, np.full_like(a, 255)])
    if a.shape[2] == 3:
        a = np.dstack([a, np.full(a.shape[:2], 255, np.uint8)])
    return a


MEMO = {}


def gom(L):
    """đổi các lệnh bắt được thành (vào RGBA, cỡ, cách, ra RGBA). Công cụ thu TỪNG KÊNH bằng ảnh 'F' (đỏ·α, lục·α, lam·α, α) → gộp 4 lệnh liền nhau."""
    out = []; i = 0
    while i < len(L):
        if len(L[i]) == 5:  # gan(): ảnh numpy
            v, s, c, r, mp = L[i]
            if id(v) not in MEMO:
                MEMO[id(v)] = (v, arr_rgba(v))
            out.append((MEMO[id(v)][1], s, c, arr_rgba(r), mp)); i += 1; continue
        v, s, c, r = L[i]
        if v.mode in ('F', 'I'):
            grp = L[i:i + 4]
            if len(grp) == 4 and all(g[0].mode == v.mode and g[0].size == v.size and g[1] == s for g in grp):
                V = np.stack([np.array(g[0], np.float32) for g in grp], -1); R = np.stack([np.array(g[3], np.float32) for g in grp], -1)
                def bo(X):
                    A = X[..., 3]; mx = 255.0 if A.max() > 1.5 else 1.0
                    a = np.clip(A / mx, 0, 1)
                    c = np.clip(X[..., :3] / np.maximum(a[..., None], 1e-4) / (mx / 255.0 if mx == 255.0 else 1.0 / 255.0), 0, 255)
                    if mx == 1.0:
                        c = np.clip(X[..., :3] / np.maximum(a[..., None], 1e-4) * (255.0 if X[..., :3].max() <= 1.5 else 1.0), 0, 255)
                    return np.dstack([c, a * 255]).astype(np.uint8)
                out.append((bo(V), s, c, bo(R))); i += 4; continue
            i += 1; continue
        out.append((rgba(v), s, c, rgba(r))); i += 1
    return out


# ---------- khớp: lệnh thu nào cho ra khung nào ----------
def iou(a, b):
    return (a & b).sum() / max(1, (a | b).sum())


def tim_cho(F, O):
    """F: mặt nạ khung (h×w), O: mặt nạ ảnh ra (H×W). Trả (iou, dx, dy): O dán ở (dx, dy) trong khung (có thể âm: khung nằm trong O)."""
    from scipy.signal import fftconvolve
    h, w = F.shape; H, W = O.shape
    if F.sum() == 0 or O.sum() == 0:
        return (0, 0, 0, 0)
    c = fftconvolve(np.pad(F.astype(np.float32), ((H, H), (W, W))), O[::-1, ::-1].astype(np.float32), mode='valid')
    # c[y, x] ứng với dy = y - H, dx = x - W (O dán ở (dx, dy) trong F)
    tot = (0, 0, 0, 0)
    idx = np.argsort(c.ravel())[::-1][:8]
    for i in idx:
        y, x = np.unravel_index(i, c.shape)
        dy, dx = y - H, x - W
        big = np.zeros_like(F)
        y0, x0, y1, x1 = max(0, dy), max(0, dx), min(h, dy + H), min(w, dx + W)
        if y1 <= y0 or x1 <= x0:
            continue
        big[y0:y1, x0:x1] = O[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
        # phần O nằm ngoài khung mà đục: phạt (khung khác)
        ngoai = O.sum() - big.sum()
        v = (big & F).sum() / max(1, (big | F).sum() + max(0, ngoai - 0.05 * O.sum()) * 0)
        if v > tot[0]:
            tot = (float(v), int(dx), int(dy), float((big & F).sum() / max(1, F.sum())))
    return tot


def mat_na_ra(o):
    """mặt nạ của ảnh ra (thử vài ngưỡng alpha như các công cụ cũ hay cắt)"""
    if o.ndim != 3 or o.shape[2] != 4:
        return []
    al = o[..., 3]
    return [(t, al >= t) for t in (1, 40, 64, 80, 110, 115, 128, 140, 160, 200)]


def khop_ma(ma, ung):
    d, a = doc_tam(ma)
    n0 = net_cua(d)
    kq = []
    for ten, F_, (px, py) in khung(d, a):
        F = F_[..., 3] > 0
        if F.sum() < 3:
            kq.append({'k': ten, 'rong': True}); continue
        tot = None
        for gi, e in enumerate(ung):
            vao, (w, h), cach, ra = e[:4]
            if ra.shape[0] < 0.25 * F.shape[0] and ra.shape[1] < 0.25 * F.shape[1]:
                continue
            if ra.shape[0] > 8 * F.shape[0] or ra.shape[1] > 8 * F.shape[1]:
                continue
            for t, O in mat_na_ra(ra):
                if O.sum() < 0.5 * F.sum() or O.sum() > 4 * F.sum() + 50:
                    continue
                v, dx, dy, chua = tim_cho(F, O)
                if tot is None or v > tot[0]:
                    tot = (v, gi, t, dx, dy, chua)
            if tot and tot[0] > 0.995:
                break
        if not tot:
            kq.append({'k': ten, 'iou': 0}); continue
        kq.append({'k': ten, 'iou': round(tot[0], 4), 'lenh': tot[1], 'nguong': tot[2], 'dx': tot[3], 'dy': tot[4], 'chua': round(tot[5], 4)})
    return d, a, kq


if __name__ == '__main__':
    args = sys.argv[1:]
    mas = None
    if '--ma' in args:
        i = args.index('--ma'); mas = args[i + 1].split(','); del args[i:i + 2]
    if '--ham' in args:
        i = args.index('--ham'); HAM[:] = args[i + 1].split(','); del args[i:i + 2]
    tool, targs = os.path.abspath(args[0]), args[1:]
    t0 = time.time()
    chay(tool, targs)
    ung = gom(GHI_LAI)
    print('đã bắt %d lệnh thu nhỏ, %.0fs; tệp ghi: %d' % (len(ung), time.time() - t0, len(DOI)), flush=True)
    viet = [os.path.basename(p)[:-12] for p in DOI if p.endswith('.sprite.json')]
    mas = mas or [m for m in viet if m in set(pham_vi())]
    pk = os.path.join(RA_NC, 'bat-' + os.path.basename(tool).replace('.py', '') + '.pkl')
    pickle.dump({'tool': os.path.relpath(os.path.abspath(tool), REPO), 'args': targs, 'ung': ung, 'mas': mas}, open(pk, 'wb'))
    for ma in mas:
        d, a, kq = khop_ma(ma, ung)
        ious = [k.get('iou', 0) for k in kq if not k.get('rong')]
        print('%-28s %2d khung  IoU min %.3f tb %.3f' % (ma, len(ious), min(ious or [0]), np.mean(ious or [0])), flush=True)
