"""Bước 1b: đo cỡ từng mảnh so với 2-nhin-ngang.png và chuẩn hoá.
Mỗi mảnh gốc (cỡ bảng mảnh) được dò (hệ số phóng s, góc θ, tâm cx, cy) sao cho đặt lên ảnh nhìn ngang
khớp màu nhất (sai khác màu có cắt ngưỡng, nét viền ngoài được nhân trọng số ×4 để không 'co lại cho lọt').
Tìm thô ở ½ độ phân giải (Nelder–Mead, nhiều điểm xuất phát), rồi tinh chỉnh ở độ phân giải gốc.
Kết quả → ../manh/goc/khop.json (hệ số, góc, tâm, sai số). Không sửa ảnh."""
import os
import json
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.optimize import minimize
from chung import MANH, SRC_NGANG, load_rgb

# điểm xuất phát (tâm hộp mảnh trên ảnh nhìn ngang, hệ số, góc) – đo bằng mắt trên 2-nhin-ngang.png
# góc θ: độ, DƯƠNG = quay THUẬN chiều kim đồng hồ trên màn hình (trục y hướng xuống)
KHOI_DAU = {
    'mu':        (640, 377, 1.30, 0),
    'chop-mu':   (262, 372, 1.00, -17),
    'than':      (610, 812, 1.25, 0),
    'tay-truoc': (1015, 793, 1.00, 0),
    'tay-sau':   (349, 829, 1.05, 0),
    'ung-a':     (743, 1073, 0.95, 0),     # thử cả hai chỗ ủng, lấy chỗ khớp hơn
    'ung-b':     (490, 1063, 0.95, 0),
    'mat':       (828, 480, 1.08, 0),
    'chuong':    (742, 735, 0.85, 0),
}


def place(piece, s, th, cx, cy, shape, k=1.0):
    """Đặt mảnh (RGBA float) phóng s, quay th (độ, + = thuận kim đồng hồ), tâm hộp mảnh tại (cx, cy)
    lên khung shape (ở tỉ lệ k). Trả (rgb, alpha) cỡ shape. Dùng affine ngược của PIL."""
    H, W = shape
    h, w = piece.shape[:2]
    S = s * k
    t = np.deg2rad(th)
    c, sn = np.cos(t), np.sin(t)
    # điểm đích (X,Y) → nguồn (x,y): nguồn = R(-th)·((X,Y) − C)/S + tâm mảnh
    X0, Y0 = cx * k, cy * k
    a11, a12 = c / S, sn / S
    a21, a22 = -sn / S, c / S
    b1 = w / 2 - (a11 * X0 + a12 * Y0)
    b2 = h / 2 - (a21 * X0 + a22 * Y0)
    out = []
    for ch in range(4):
        im = Image.fromarray(piece[..., ch].astype(np.float32), 'F')
        out.append(np.array(im.transform((W, H), Image.AFFINE, (a11, a12, b1, a21, a22, b2),
                                         resample=Image.BILINEAR)))
    o = np.dstack(out)
    return o[..., :3], o[..., 3] / 255.0


def make_cost(piece, ref, k, vis=None, target=None, lam=40.0, bgm=None, lam_bg=0.0, hide=None, lam_hide=0.0):
    """vis: 0..1 = chỗ trên ảnh ngang KHÔNG bị mảnh đứng trước che (chỉ so màu ở đó).
    target: điểm ảnh của ảnh ngang mà mảnh này phải phủ (phạt λ × tỉ lệ chưa phủ)."""
    al = piece[..., 3] / 255.0
    edge_w = 1.0 + 3.0 * (nd.distance_transform_edt(al > 0.5) < 10)       # nét viền ngoài ×4
    pw = piece.copy()
    pw[..., 3] = 255.0 * edge_w / 4.0 * al         # kênh alpha dùng làm trọng số (≤1)
    pa = piece.copy()
    H, W = ref.shape[:2]
    tsum = target.sum() if target is not None else 0

    if hide is not None:
        ph = piece.copy()
        ph[..., 3] = 255.0 * hide * al

    def cost(p):
        cx, cy, s, th = p
        rgb, w = place(pw, s, th, cx, cy, (H, W), k)
        if vis is not None:
            w = w * vis
        tot = w.sum()
        if tot < 10:
            return 1e3
        d = np.minimum(np.abs(rgb - ref).mean(-1), 70.0)
        c = float((d * w).sum() / tot)
        if tsum or lam_bg:
            _, a2 = place(pa, s, th, cx, cy, (H, W), k)
        if tsum:
            c += lam * float((target * (1 - np.minimum(a2 * 2, 1))).sum() / tsum)
        if lam_hide and vis is not None:   # phần gốc phải nằm khuất sau mảnh cha
            _, ah = place(ph, s, th, cx, cy, (H, W), k)
            c += lam_hide * float((ah * vis).sum() / max(ah.sum(), 1))
        if lam_bg:      # phần mảnh rơi ra nền trắng của ảnh ngang (lộ ra ngoài hình) → phạt
            c += lam_bg * float((a2 * bgm).sum() / max(a2.sum(), 1))
        return c
    return cost


def _rs(arr, k, interp=Image.BILINEAR):
    im = Image.fromarray(arr.astype(np.float32), 'F')
    return np.array(im.resize((int(arr.shape[1] * k), int(arr.shape[0] * k)), interp))


def fit(name, piece, ref_full, vis_full=None, target_full=None, init=None, lam=40.0, bg_full=None, lam_bg=0.0, hide=None, lam_hide=0.0):
    cx, cy, s, th = init or KHOI_DAU[name]
    R = int(max(piece.shape[:2]) * s * 0.8 + 60)
    x0, y0 = max(int(cx) - R, 0), max(int(cy) - R, 0)
    x1, y1 = min(int(cx) + R, ref_full.shape[1]), min(int(cy) + R, ref_full.shape[0])
    win = ref_full[y0:y1, x0:x1]
    best = None
    for k, starts, tol in ((0.25, [(a, b) for a in (0.88, 1.0, 1.12) for b in (-8, 0, 8)], 0.5),
                           (0.5, None, 0.2)):
        ref = nd.gaussian_filter(np.dstack([_rs(win[..., c], k) for c in range(3)]), (0.7, 0.7, 0))
        vis = _rs(vis_full[y0:y1, x0:x1], k) if vis_full is not None else None
        tgt = _rs(target_full[y0:y1, x0:x1].astype(float), k) if target_full is not None else None
        bgm = _rs(bg_full[y0:y1, x0:x1].astype(float), k) if bg_full is not None else None
        cost = make_cost(piece, ref, k, vis, tgt, lam, bgm, lam_bg, hide, lam_hide)
        starts_p = [best.x] if starts is None else [[cx - x0, cy - y0, s * a, th + b] for a, b in starts]
        best = None
        for p0 in starts_p:
            r = minimize(cost, p0, method='Nelder-Mead', options={'xatol': tol, 'fatol': 0.01, 'maxiter': 500})
            if best is None or r.fun < best.fun:
                best = r
    best.x = np.array([best.x[0] + x0, best.x[1] + y0, best.x[2], best.x[3]])
    return best


def load_piece(name):
    return np.array(Image.open(os.path.join(MANH, 'goc', name + '.png')).convert('RGBA')).astype(float)


def chop_goc(p, frac=0.30):
    """Phần gốc (đầu tròn bên phải, ~30 % bề ngang) của chóp mũ: phải nằm khuất sau mũ."""
    al = p[..., 3] > 128
    xs = np.nonzero(al.any(0))[0]
    m = np.zeros(al.shape)
    m[:, int(xs.max() - frac * (xs.max() - xs.min())):] = 1.0
    return m


def chop_moc(ref, fg, bg, amu):
    """Chóp mũ: dò màu tự do bị kéo to ra để lấp phần gáy mũ (ảnh ngang có gáy đầy hơn mảnh mũ)
    nên lộ đầu tròn gốc chóp phía trên mũ. Cách làm: neo ĐỈNH chóp vào đỉnh chóp trên ảnh ngang,
    rồi dò (s, θ) trên lưới: ưu tiên (1) gốc chóp khuất hẳn sau mũ, (2) không lòi ra nền trắng,
    (3) phủ được nhiều nhất phần ảnh ngang chưa có mảnh nào phủ."""
    HW = ref.shape[:2]
    p = load_piece('chop-mu')
    al = p[..., 3] > 128
    ys, xs = np.nonzero(fg[:700, :400])
    i = np.argmin(xs)
    tip_s = np.array([xs[i], ys[i]], float)
    ys, xs = np.nonzero(al)
    i = np.argmin(xs)
    tip_p = np.array([xs[i], ys[i]], float)
    g = chop_goc(p) * al
    h, w = p.shape[:2]
    ctr = np.array([w / 2, h / 2])
    ph = np.dstack([p[..., :3], g * 255])
    best = None
    for s in np.arange(1.30, 1.501, 0.025):
        for th in np.arange(-12, 4.01, 1.0):
            t = np.deg2rad(th)
            R = np.array([[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]])
            C = tip_s - s * R @ (tip_p - ctr)
            _, ah = place(ph, s, th, C[0], C[1], HW)
            _, a = place(p, s, th, C[0], C[1], HW)
            hid = (ah * amu).sum() / ah.sum()
            vis = a * (1 - amu)
            onbg = (vis * bg).sum() / max(vis.sum(), 1)
            miss = fg & (amu < 0.3) & (a < 0.3)
            miss[:, 560:] = False
            miss[600:] = False
            c = 300 * max(0.0, 0.985 - hid) + 100 * onbg + miss.sum() / 1000
            if best is None or c < best[0]:
                best = (c, s, th, C, hid, onbg, int(miss.sum()))
    c, s, th, C, hid, onbg, miss = best
    return {'tam': [round(float(C[0]), 1), round(float(C[1]), 1)], 'he_so': round(float(s), 4),
            'goc': round(float(th), 2), 'sai_mau': None,
            'goc_khuat': round(float(hid), 3), 'lo_ra_nen': round(float(onbg), 4), 'px_gay_chua_phu': miss,
            'ghi_chu': 'neo đỉnh chóp vào đỉnh chóp ảnh ngang; gốc chóp phải khuất sau mũ'}


def mat_truc_tiep(ref):
    """Mắt không có viền → dò màu không ổn định. Đo thẳng: vùng vàng sáng lớn nhất ở nửa trên ảnh ngang."""
    y = (ref[..., 0] > 200) & (ref[..., 1] > 170) & (ref[..., 2] < 120)
    y[ref.shape[0] // 2:] = False
    lab, n = nd.label(y)
    i = np.argmax(nd.sum(y, lab, range(1, n + 1))) + 1
    ys, xs = np.nonzero(lab == i)
    p = load_piece('mat')
    ps, px = np.nonzero(p[..., 3] > 128)
    sx = (xs.max() - xs.min() + 1) / (px.max() - px.min() + 1)
    sy = (ys.max() - ys.min() + 1) / (ps.max() - ps.min() + 1)
    return {'tam': [round((xs.min() + xs.max() + 1) / 2, 1), round((ys.min() + ys.max() + 1) / 2, 1)],
            'he_so': round(float(sy), 4), 'he_so_ngang': round(float(sx), 4), 'he_so_doc': round(float(sy), 4),
            'goc': 0.0, 'sai_mau': None,
            'ghi_chu': 'đo trực tiếp vùng vàng (mắt không viền nên dò màu bị co lại); ảnh ngang có quầng sáng nên cao hơn'}


def main():
    ref = load_rgb(SRC_NGANG)
    from chung import background
    bg, _ = background(ref)
    fg = ~bg
    HW = ref.shape[:2]
    res = {}
    cover = {}                    # alpha của các mảnh đã khớp (để làm mặt nạ che)

    def run(name, occ=(), need_cover=False, init=None, lam=40.0, lam_bg=0.0, hide=None, lam_hide=0.0):
        piece = load_piece(name)
        vis = None
        if occ:
            o = np.zeros(HW)
            for n2 in occ:
                o = np.maximum(o, cover[n2])
            vis = 1 - np.minimum(nd.grey_dilation(o, size=5) * 1.5, 1)
        tgt = None
        if need_cover:
            allc = np.zeros(HW)
            for v in cover.values():
                allc = np.maximum(allc, v)
            tgt = fg & (allc < 0.3)
        r = fit(name, piece, ref, vis, tgt, init, lam, bg, lam_bg, hide, lam_hide)
        cx, cy, s, th = map(float, r.x)
        _, cover[name] = place(piece, s, th, cx, cy, HW)
        res[name] = {'tam': [round(cx, 1), round(cy, 1)], 'he_so': round(s, 4), 'goc': round(th, 2),
                     'sai_mau': round(float(r.fun), 2)}
        print(f'{name:10s} s={s:.3f} θ={th:6.2f}  tâm=({cx:.0f},{cy:.0f})  sai={r.fun:.1f}')
        return r

    run('mu')
    run('chuong')
    run('tay-truoc')
    run('tay-sau')
    # hai ủng: thử cả hai cách gán chỗ, lấy tổng sai nhỏ hơn
    best = None
    for gan in (('ung-a', 'ung-b'), ('ung-b', 'ung-a')):
        f1 = fit(gan[0], load_piece(gan[0]), ref, init=KHOI_DAU['ung-a'])
        f2 = fit(gan[1], load_piece(gan[1]), ref, init=KHOI_DAU['ung-b'])
        if best is None or f1.fun + f2.fun < best[0]:
            best = (f1.fun + f2.fun, gan)
    print('gán ủng (chỗ trước x≈743, chỗ sau x≈490):', best[1])
    run(best[1][0], init=KHOI_DAU['ung-a'])
    run(best[1][1], init=KHOI_DAU['ung-b'])
    res['_gan_ung'] = {'cho_truoc': best[1][0], 'cho_sau': best[1][1]}
    run('than', occ=('mu', 'chuong', 'tay-truoc', 'tay-sau'), need_cover=True, lam_bg=100.0)
    res['chop-mu'] = chop_moc(ref, fg, bg, cover['mu'])
    print('chop-mu', res['chop-mu'])
    res['mat'] = mat_truc_tiep(ref)
    print('mat', res['mat'])
    with open(os.path.join(MANH, 'goc', 'khop.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
