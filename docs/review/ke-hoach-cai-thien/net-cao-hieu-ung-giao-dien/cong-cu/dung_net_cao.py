"""DỰNG ẢNH NÉT 3 / NÉT 4 từ ảnh to đã bắt (chay_lai.py) — nét cao 17/10, hiệu ứng + giao diện.
Mỗi khung của ảnh đang dùng: lệnh thu nhỏ khớp (IoU ≥ 0,97) → vùng ảnh to ứng với khung → thu về fw·n × fh·n bằng thu_net (mỗi điểm một
màu có thật trong vùng gốc, không pha), mặt nạ theo đúng ngưỡng phủ công cụ cũ đã dùng (khớp mặt nạ ảnh cũ), alpha nhiều nấc thì lấy
đúng các nấc alpha của khung cũ. Màu lệch xa khung cũ (công cụ cũ đã nhuộm / đổi trắng sang xám / giảm màu sau khi thu) → mỗi điểm lấy
màu GẦN NHẤT trong các màu của ô cũ tương ứng và 8 ô quanh (vẫn là màu có thật trong ảnh đang dùng, chi tiết lấy từ ảnh gốc).
Khung không khớp → phóng điểm gần nhất từ khung cũ (ghi rõ trong báo cáo).
  python3 dung_net_cao.py ra/net-cao/bat-<công cụ>.pkl [--ma mã,…]   → ra/net-cao/<mã>.n3.png, <mã>.n4.png, <mã>.json
"""
import json, os, pickle, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chung import REPO, RA, doc_tam, khung, net_cua
import chay_lai
sys.path.insert(0, os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'do-net', 'cong-cu'))
import thu_net

RA_NC = os.path.join(RA, 'net-cao')
NGUONG_KHOP = 0.97
TQ_MIN = -2  # đặt > -1 để tự loại khung có tương quan thấp; mặc định chỉ ghi số (soát tay: dò_lech.py)


def bo_nhan_alpha(v):
    """ảnh vào đã nhân alpha (màu ≤ alpha ở mọi điểm lửng) → chia lại"""
    v = v.astype(np.float32)
    al = v[..., 3]
    lung = (al > 8) & (al < 247)
    if lung.sum() > 50 and (v[..., :3][lung].max(-1) <= al[lung] + 2).mean() > 0.97:
        c = np.clip(v[..., :3] * 255.0 / np.maximum(al[..., None], 1), 0, 255)
        v = np.concatenate([c, al[..., None]], -1)
    return v.astype(np.uint8)


def cua_so(start, s, n_out, n_in):
    K = int(np.ceil(s)) + 2
    a = start + np.arange(n_out) * s
    b = a + s
    i0 = np.floor(a).astype(int)
    idx = i0[:, None] + np.arange(K)[None, :]
    w = np.clip(np.minimum(b[:, None], idx + 1) - np.maximum(a[:, None], idx), 0, 1)
    w = np.where((idx >= 0) & (idx < n_in), w, 0)
    return np.clip(idx, 0, n_in - 1), w


def thu_vung(a, ox, oy, s, W, H):
    """thu_net.thu nhưng vùng gốc của điểm (i, j) = [ox + i·s, ox + (i+1)·s) × [oy + j·s, …) — chỗ dán lẻ / ngoài ảnh (trong suốt)"""
    q = iter([(oy, s, H), (ox, s, W)])
    goc = thu_net._cua_so

    def cs(n_in, n_out):
        st, ss, no = next(q)
        return cua_so(st, ss, no, n_in)
    thu_net._cua_so = cs
    try:
        return thu_net.thu(a, W, H)
    finally:
        thu_net._cua_so = goc


def phu_vung(al, ox, oy, s, W, H):
    iy, wy = cua_so(oy, s, H, al.shape[0]); ix, wx = cua_so(ox, s, W, al.shape[1])
    A = al.astype(np.float32) / 255.0
    # tách hai chiều cho nhẹ: hàng trước rồi cột
    R = (A[iy] * wy[:, :, None]).sum(1)              # (H, Win)
    C = (R[:, ix] * wx[None, :, :]).sum(2)            # (H, W)
    return C / (s * s)


def mau_gan(hi, cu, n, n0, alpha_nac):
    """mỗi điểm đục của hi lấy màu gần nhất trong 3×3 ô của khung cũ quanh ô tương ứng"""
    H, W = hi.shape[:2]
    h0, w0 = cu.shape[:2]
    Y, X = np.mgrid[0:H, 0:W]
    cy = np.clip(((Y + 0.5) * n0 / n).astype(int), 0, h0 - 1); cx = np.clip(((X + 0.5) * n0 / n).astype(int), 0, w0 - 1)
    best = np.full((H, W), 1e9); out = hi.copy()
    for dy in (0, -1, 1):
        for dx in (0, -1, 1):
            yy = np.clip(cy + dy, 0, h0 - 1); xx = np.clip(cx + dx, 0, w0 - 1)
            c = cu[yy, xx].astype(np.float32)
            ok = c[..., 3] > 0
            d = ((c[..., :3] - hi[..., :3].astype(np.float32)) ** 2).sum(-1) + (0 if dx == 0 and dy == 0 else 30.0)
            if alpha_nac:
                d = d + ((c[..., 3] - hi[..., 3].astype(np.float32)) ** 2) * 0.5
            d = np.where(ok, d, 1e9)
            m = d < best
            best = np.where(m, d, best)
            out[m, :3] = c[m, :3].astype(np.uint8)
            if alpha_nac:
                out[m, 3] = c[m, 3].astype(np.uint8)
    out[hi[..., 3] == 0] = 0
    return out


def lech(hi, cu, n, n0):
    """so màu hi (lấy mẫu về lưới cũ) với khung cũ trên điểm cùng đục"""
    h0, w0 = cu.shape[:2]
    ys = np.clip(((np.arange(h0) + 0.5) * n / n0).astype(int), 0, hi.shape[0] - 1)
    xs = np.clip(((np.arange(w0) + 0.5) * n / n0).astype(int), 0, hi.shape[1] - 1)
    s = hi[ys][:, xs]
    m = (s[..., 3] > 0) & (cu[..., 3] > 0)
    if not m.any():
        return 999.0
    return float(np.abs(s[..., :3][m].astype(int) - cu[..., :3][m].astype(int)).mean())


def sua_mau_la(hi, F, n, n0, nguong=45.0):
    """điểm có màu KHÔNG có (gần) trong bảng màu khung cũ — thường là ám nền xanh lục của ảnh gen ở mép — lấy màu gần nhất trong 5×5 ô cũ
    quanh đó; không có ô đục nào gần thì bỏ (trong suốt)."""
    op = F[..., 3] > 0
    pal = np.unique(F[op][:, :3].reshape(-1, 3), axis=0).astype(np.float32)
    if not len(pal):
        return hi, 0
    m = hi[..., 3] > 0
    px = hi[m][:, :3].astype(np.float32)
    dmin = np.full(len(px), 1e9, np.float32)
    for i in range(0, len(pal), 64):
        d = ((px[:, None, :] - pal[None, i:i + 64, :]) ** 2).sum(-1).min(1)
        dmin = np.minimum(dmin, d)
    la = np.zeros(m.shape, bool); la[m] = dmin > nguong ** 2
    if not la.any():
        return hi, 0
    H, W = hi.shape[:2]; h0, w0 = F.shape[:2]
    ys, xs = np.nonzero(la)
    out = hi.copy()
    for y, x in zip(ys, xs):
        cy, cx = int((y + 0.5) * n0 / n), int((x + 0.5) * n0 / n)
        blk = F[max(0, cy - 2):cy + 3, max(0, cx - 2):cx + 3].reshape(-1, 4)
        blk = blk[blk[..., 3] > 0]
        if not len(blk):
            out[y, x] = 0; continue
        d = ((blk[:, :3].astype(np.float32) - hi[y, x, :3].astype(np.float32)) ** 2).sum(-1)
        c = blk[d.argmin()]
        out[y, x, :3] = c[:3]
        if hi[y, x, 3] != 255:
            out[y, x, 3] = c[3]
    return out, int(la.sum())


def tuong_quan(hi, F):
    """tương quan độ sáng (ảnh mới thu về lưới cũ theo diện tích ↔ khung cũ) trên điểm cùng đục: thấp = ảnh gốc bắt nhầm hình khác cùng dáng"""
    import cv2
    a = hi.astype(np.float32); al = a[..., 3:4] / 255
    pre = cv2.resize(np.dstack([a[..., :3] * al, al]), (F.shape[1], F.shape[0]), interpolation=cv2.INTER_AREA)
    A = pre[..., 3]; m = (A > 0.3) & (F[..., 3] > 0)
    if m.sum() < 12:
        return 1.0
    L1 = (pre[..., :3] / np.maximum(A[..., None], 1e-3)) @ np.array([0.299, 0.587, 0.114], np.float32)
    L2 = F[..., :3].astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    x, y = L1[m], L2[m]
    if x.std() < 4 or y.std() < 4:
        return 1.0
    return round(float(np.corrcoef(x, y)[0, 1]), 3)


def tuong_quan_ra(ra, F, k):
    """tương quan độ sáng giữa ẢNH CÔNG CỤ CŨ THU RA (cùng cỡ khung cũ) và khung đang dùng, trên điểm cùng đục. Nhuộm / đổi trắng→xám /
    khử viền vẫn giữ tương quan cao; ảnh gốc bắt nhầm (cùng dáng, khác hình — vd. vàng thỏi thay vì đồng xu) thì thấp."""
    if ra is None or ra.ndim != 3 or ra.shape[0] < 2:
        return 1.0
    r = bo_nhan_alpha(ra).astype(np.float32)
    h, w = F.shape[:2]; H, W = r.shape[:2]; dx, dy = k['dx'], k['dy']
    y0, x0, y1, x1 = max(0, dy), max(0, dx), min(h, dy + H), min(w, dx + W)
    if y1 <= y0 or x1 <= x0:
        return 1.0
    a = r[y0 - dy:y1 - dy, x0 - dx:x1 - dx]; b = F[y0:y1, x0:x1].astype(np.float32)
    m = (a[..., 3] > 0) & (b[..., 3] > 0)
    if m.sum() < 12:
        return 1.0
    Lw = np.array([0.299, 0.587, 0.114], np.float32)
    x, y = a[..., :3][m] @ Lw, b[..., :3][m] @ Lw
    if x.std() < 4 or y.std() < 4:
        return 1.0
    return round(float(np.corrcoef(x, y)[0, 1]), 3)


def iou_ve(hi, F):
    """thu mặt nạ ảnh mới về lưới cũ theo diện tích (≥ ½ → đục) rồi so mặt nạ khung cũ"""
    import cv2
    m = cv2.resize((hi[..., 3] > 0).astype(np.float32), (F.shape[1], F.shape[0]), interpolation=cv2.INTER_AREA) >= 0.5
    return round(float(chay_lai.iou(m, F[..., 3] > 0)), 3)


def lech_ra(ra, F, k):
    """màu ảnh công cụ cũ thu ra (trước khi nó sửa màu) so với khung đang dùng: lệch nhiều = công cụ đã nhuộm / đổi màu sau khi thu"""
    r = bo_nhan_alpha(ra).astype(int)
    h, w = F.shape[:2]; H, W = r.shape[:2]; dx, dy = k['dx'], k['dy']
    y0, x0, y1, x1 = max(0, dy), max(0, dx), min(h, dy + H), min(w, dx + W)
    if y1 <= y0 or x1 <= x0:
        return 999.0
    a = r[y0 - dy:y1 - dy, x0 - dx:x1 - dx]; b = F[y0:y1, x0:x1].astype(int)
    m = (a[..., 3] > 0) & (b[..., 3] > 0)
    if not m.any():
        return 999.0
    return float(np.abs(a[..., :3][m] - b[..., :3][m]).mean())


def dung_khung(F, k, ung, n, n0, gioi_han=False):
    """F: khung cũ RGBA (fh·n0 × fw·n0). k: kết quả khớp. → (khung mới fh·n × fw·n, ghi chú)"""
    fh0, fw0 = F.shape[:2]
    W, H = int(round(fw0 * n / n0)), int(round(fh0 * n / n0))
    e = ung[k['lenh']]
    vao, (w, h), cach, ra = e[:4]
    vao = bo_nhan_alpha(vao)
    Hin, Win = vao.shape[:2]
    ox0, oy0, sx, sy = e[4] if len(e) > 4 else (0.0, 0.0, Win / w, Hin / h)
    s = (sx + sy) / 2 * n0 / n
    # điểm ảnh khung mới X ↔ toạ độ khung cũ X·n0/n ↔ ảnh vào ox0 + (X·n0/n − dx)·sx
    ox = ox0 - k['dx'] * sx; oy = oy0 - k['dy'] * sy
    # đệm trong suốt để vùng ngoài ảnh vào không lặp mép
    P = int(np.ceil(max(abs(ox), abs(oy), W * s, H * s))) + 4
    vp = np.zeros((Hin + 2 * P, Win + 2 * P, 4), np.uint8); vp[P:P + Hin, P:P + Win] = vao
    hi = thu_vung(vp, ox + P, oy + P, s, W, H)
    co_mau = hi[..., 3] > 0
    cov = phu_vung(vp[..., 3], ox + P, oy + P, s, W, H)
    nac = sorted(set(np.unique(F[..., 3]).tolist()) - {0})
    nhieu_nac = len(nac) > 2 or (len(nac) == 2 and nac[0] < 200)
    if cach == 0:  # NEAREST: điểm cũ = điểm gốc giữa ô → đục khi phủ ≥ ½ (alpha nhiều nấc: ≥ ½ nấc thấp nhất)
        th = 0.5 * (nac[0] / 255.0 if nhieu_nac and nac else 1.0)
    else:
        th = k['nguong'] / 255.0 if k['nguong'] > 1 else 0.004
    dac = cov >= max(th, 0.004)
    if nhieu_nac:
        L = np.array(nac, np.float32)
        lv = L[np.abs(cov[..., None] * 255 - L[None, None, :]).argmin(-1)]
        hi[..., 3] = np.where(dac, lv, 0).astype(np.uint8)
    else:
        hi[..., 3] = np.where(dac, 255 if not nac else nac[-1], 0)
    # điểm đục mà thu_net không có màu (vùng phủ thấp): lấy màu điểm đục gần nhất của chính hi
    trong = dac & ~co_mau
    hi[~dac] = 0
    ghi_tq = tuong_quan_ra(ra, F, k)
    l0 = lech_ra(ra, F, k)
    ghi = {'lech_mau_cong_cu': round(l0, 1), 'nac_alpha': nhieu_nac, 'tuong_quan': ghi_tq}
    if l0 > 12 or trong.sum() > 0.02 * dac.sum() or nhieu_nac:
        hi2 = mau_gan(hi, F, n, n0, nhieu_nac)
        ghi['mau'] = 'mau-cu-gan-nhat'
        ghi['lech_mau_sau'] = round(lech(hi2, F, n, n0), 1)
        hi = hi2
    else:
        ghi['mau'] = 'goc'
    if gioi_han:
        from scipy import ndimage as nd
        Fm = phong_gan(F, n, n0)[..., 3] > 0
        Fm = nd.binary_dilation(Fm, iterations=max(1, n // n0))
        hi[~Fm] = 0
        ghi['gioi_han_mat_na_cu'] = True
    hi, so_la = sua_mau_la(hi, F, n, n0)
    ghi['diem_mau_la'] = so_la
    ghi['iou_ve'] = iou_ve(hi, F)
    return hi, ghi


def phong_gan(F, n, n0):
    fh0, fw0 = F.shape[:2]
    W, H = int(round(fw0 * n / n0)), int(round(fh0 * n / n0))
    ys = np.clip(((np.arange(H) + 0.5) * n0 / n).astype(int), 0, fh0 - 1); xs = np.clip(((np.arange(W) + 0.5) * n0 / n).astype(int), 0, fw0 - 1)
    return F[ys][:, xs]


def da_co(ma):
    p = os.path.join(RA_NC, ma + '.json')
    if not os.path.exists(p):
        return -1
    r = json.load(open(p))
    if r.get('nguon_bat') == NGUON_BAT:
        return -1  # cùng tệp bắt: dựng lại
    return sum(1 for k in r['khung'] if k['n'] == 4 and k['cach'] == 'goc')


NGUON_BAT = ''


def dung_ma(ma, ung, nets=(3, 4)):
    d, a, kq = chay_lai.khop_ma(ma, ung)
    tot = sum(1 for k in kq if k.get('iou', 0) >= NGUONG_KHOP or (k.get('chua', 0) >= 0.985 and k.get('iou', 0) >= 0.6))
    if da_co(ma) >= max(1, tot):
        return {'ma': ma, 'net_cu': net_cua(d), 'khung': [], 'bo_qua': 'đã có bản tốt hơn từ công cụ khác'}, {}
    n0 = net_cua(d)
    ks = khung(d, a)
    ra = {'ma': ma, 'net_cu': n0, 'khung': [], 'nguon_bat': NGUON_BAT}
    tam = {}
    for n in nets:
        if n <= n0:
            continue
        W, H = int(round(a.shape[1] * n / n0)), int(round(a.shape[0] * n / n0))
        T = np.zeros((H, W, 4), np.uint8)
        for (ten, F, (px, py)), k in zip(ks, kq):
            X, Y = int(round(px * n / n0)), int(round(py * n / n0))
            if k.get('rong'):
                continue
            if k.get('iou', 0) >= NGUONG_KHOP:
                hi, g = dung_khung(F, k, ung, n, n0)
                g['cach'] = 'goc'
            elif k.get('chua', 0) >= 0.985 and k.get('iou', 0) >= 0.6:
                # công cụ cũ bỏ bớt điểm SAU khi thu (khử viền xanh lục…): dựng từ gốc rồi chỉ giữ điểm nằm trong / sát mặt nạ khung cũ
                hi, g = dung_khung(F, k, ung, n, n0, gioi_han=True)
                g['cach'] = 'goc'
            else:
                hi, g = phong_gan(F, n, n0), {'cach': 'phong-gan'}
            if g.get('cach') == 'goc' and g.get('tuong_quan', 1) < TQ_MIN:
                hi, g = phong_gan(F, n, n0), {'cach': 'phong-gan', 'ly_do': 'bắt nhầm hình khác cùng dáng (tương quan %.2f)' % g['tuong_quan']}
            g.update(k={kk: vv for kk, vv in k.items()}, n=n)
            T[Y:Y + hi.shape[0], X:X + hi.shape[1]] = hi[:H - Y, :W - X]
            ra['khung'].append(g)
        tam[n] = T
        Image.fromarray(T).save(os.path.join(RA_NC, '%s.n%d.png' % (ma, n)))
    json.dump(ra, open(os.path.join(RA_NC, ma + '.json'), 'w'), ensure_ascii=False, indent=0, default=float)
    return ra, tam


if __name__ == '__main__':
    args = sys.argv[1:]
    mas = None
    if '--ma' in args:
        i = args.index('--ma'); mas = args[i + 1].split(','); del args[i:i + 2]
    B = pickle.load(open(args[0], 'rb'))
    NGUON_BAT = os.path.basename(args[0])
    for ma in mas or B['mas']:
        r, _ = dung_ma(ma, B['ung'])
        if r.get('bo_qua'):
            print('%-26s bỏ qua: %s' % (ma, r['bo_qua'])); continue
        g = [x for x in r['khung'] if x['n'] == 4]
        goc = sum(1 for x in g if x['cach'] == 'goc')
        print('%-26s n%d→3,4  khung gốc %d/%d  màu: %s  iou_ve min %.3f' % (ma, r['net_cu'], goc, len(g), ','.join(sorted({x.get('mau', '-') for x in g})),
              min([x.get('iou_ve', 1) for x in g] or [1])), flush=True)
