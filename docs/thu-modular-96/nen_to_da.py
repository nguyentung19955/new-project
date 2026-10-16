"""THÂN NỀN TÔ DA — tô da lên chính hình bóng sprite game (giữ đúng 100% dáng). Được tao-bo.py gọi.

Cách làm (mỗi khung, trên ẢNH NGUỒN CAO docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-XX.png):
1. Dùng nhãn tách sẵn (tach_lop.tach): áo đen = thân trừ da; đai đỏ; quần ở hông; ống quần hai chân (trừ bàn chân/dép).
2. Thay vải bằng DA có đổ bóng: độ sáng vải gốc (làm mịn nhẹ) = bản đồ sáng/tối → 3 sắc da (tối/vừa/sáng)
   lấy từ chính mặt và tay Cu Tí; viền ngoài = nét tối (sắc thứ 4, cũng lấy từ da) ở chỗ giáp nền trong suốt
   hoặc giáp phần nằm sau. Vài nét tối gợi xương đòn / ngực / bụng, đối xứng quanh đường giữa thân.
3. Quần → quần đùi xám trơn tới giữa đùi (cùng cách đổ bóng); phần đùi/cẳng chân dưới quần → da; bàn chân giữ nguyên.
4. Thu về ô 96 đúng như sprite game: co BOX theo tach_lop.SK, đặt ở tach_lop.DAT[i].
   Mỗi lớp nền (body / rearLeg / frontLeg) thu riêng (vùng ngoài lớp được kéo màu láng giềng gần nhất để không lem màu lớp khác).
5. Chỉ thay điểm ảnh "dựng thêm" của lớp nền (chỗ đồ gốc che), alpha lấy ĐÚNG alpha sprite game → hình bóng trùng 100%.
"""
import numpy as np
from PIL import Image
from scipy import ndimage
import tach_lop as T
import trang_phuc as TP

O = 96
NH = T.NH
LOP_TO = ['rearLeg', 'body', 'frontLeg']          # các lớp nền có phần dựng thêm
SAU = {'rearLeg': 0, 'rearArm': 1, 'body': 2, 'pants': 2, 'torsoOutfit': 2, 'frontLeg': 3, 'frontArm': 4, 'head': 5, 'hair': 5}
QUAN_DUI = [(52, 52, 58), (104, 104, 112), (138, 138, 146), (170, 170, 178)]   # viền, tối, vừa, sáng (xám trơn)


def bang_da(nguon):
    """4 sắc da lấy từ mặt + hai tay (mọi khung): [viền tối, tối, vừa, sáng]."""
    c = []
    for a, nh, phu in nguon:
        _, da, _ = T.mau(a)
        m = da & np.isin(nh, [NH['head'], NH['frontArm'], NH['rearArm']])
        c.append(a[m][:, :3])
    c = np.concatenate(c).astype(float); v = c @ [0.3, 0.59, 0.11]
    q = np.percentile(v, [3, 6, 18, 30, 50, 88, 100])
    ton = [c[(v >= q[a]) & (v <= q[b])].mean(0) for a, b in ((1, 2), (3, 4), (5, 6))]
    toi = c[v <= q[0]].mean(0) * 0.62                         # nét viền: sắc tối nhất của da, đậm thêm
    return [tuple(int(round(x)) for x in t) for t in [toi] + ton]


def do_sang(a):
    v = a[:, :, :3].max(2).astype(float)
    return ndimage.gaussian_filter(v, 1.2)


def nguong(nguon, kh):
    """Ngưỡng sáng của vải gốc (cả 12 khung): vải đen (áo + quần) và đai đỏ, phân vị 10 / 90."""
    vv, vd = [], []
    for (a, nh, phu), k in zip(nguon, kh):
        lop, quan, op, da, _ = vung_nguon(a, nh, phu, k)
        m = lop['body'] | lop['frontLeg'] | lop['rearLeg']
        v = do_sang(a); d = nh == NH['torsoOutfit']
        vv.append(v[m & ~d]); vd.append(v[m & d])
    vv, vd = np.concatenate(vv), np.concatenate(vd)
    return {'vai': list(np.percentile(vv, [10, 90])), 'dai': list(np.percentile(vd, [10, 90])) if vd.size else [0, 255]}


def vung_nguon(a, nh, phu, kh):
    """Các vùng trên ảnh nguồn cao: trả dict tên → mask, và lớp (body/rearLeg/frontLeg) của từng vùng vẽ lại."""
    H, W = nh.shape
    op = a[:, :, 3] > 0
    _, da, _ = T.mau(a)
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    co, hong = phu['co'], phu['hong']
    eo_y = phu['eo_y']
    d_than = T.kc_duong(xx, yy, [co, (co[0] - 8, eo_y), hong])
    dai = nh == NH['torsoOutfit']
    lop = {}
    lop['body'] = ((nh == NH['body']) & ~da) | (nh == NH['pants']) | (dai & (d_than <= 7.5 / T.SK))
    vai_quan = {}
    for l, ch in (('frontLeg', 'T'), ('rearLeg', 'S')):
        m = nh == NH[l]
        d_ban = T.kc_duong(xx, yy, [kh['coChan' + ch], kh['muiChan' + ch]])
        d_ong = T.kc_duong(xx, yy, [kh['hong' + ch], kh['goi' + ch], kh['coChan' + ch]])
        ban = da | (d_ban + 0.8 / T.SK < d_ong)
        vai = m & ~ban
        if l == 'rearLeg': vai |= dai & ~lop['body'] & (d_ong <= 4.0 / T.SK)
        lop[l] = vai
        hp, kn = np.array(kh['hong' + ch], float), np.array(kh['goi' + ch], float)
        v = kn - hp
        t = ((xx - hp[0]) * v[0] + (yy - hp[1]) * v[1]) / max((v ** 2).sum(), 1e-6)
        vai_quan[l] = vai & (t < 0.5)                         # quần đùi tới giữa đùi
    # quần đùi ở thân: từ giữa đai trở xuống
    giua_dai = (phu['dai_tren'] + phu['dai_duoi']) / 2
    quan = (lop['body'] & ((nh == NH['pants']) | (dai & (yy >= giua_dai)))) | vai_quan['frontLeg'] | vai_quan['rearLeg']
    return lop, quan, op, da, d_than


def ve_nguon(a, nh, phu, kh, da_mau, ng):
    """Ảnh nguồn cao đã tô da (chỉ đổi điểm ảnh vùng vẽ lại) + dict lớp → mask vùng vẽ lại."""
    H, W = nh.shape
    lop, quan, op, da, d_than = vung_nguon(a, nh, phu, kh)
    out = a.copy()
    v = do_sang(a)
    la_dai = nh == NH['torsoOutfit']
    u = np.where(la_dai, (v - ng['dai'][0]) / max(ng['dai'][1] - ng['dai'][0], 1e-6),
                 (v - ng['vai'][0]) / max(ng['vai'][1] - ng['vai'][0], 1e-6))
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    # chủ của từng điểm ảnh (để biết giáp phần nằm sau → vẽ viền)
    sau = np.full((H, W), -1)
    for l in ('rearLeg', 'rearArm', 'body', 'pants', 'torsoOutfit', 'frontLeg', 'frontArm', 'head', 'hair'):
        sau[nh == NH[l]] = SAU[l]
    for l in LOP_TO:
        sau[lop[l]] = SAU[l]
    R = 0.95 / T.SK                                            # bề dày viền ≈ 1 điểm ảnh ô 96
    for l in LOP_TO:
        m = lop[l]
        if not m.any(): continue
        sau_hon = ~op | ((sau >= 0) & (sau < SAU[l]) & ~m)
        d_vien = ndimage.distance_transform_edt(~sau_hon)
        for vung, bang in ((m & ~quan, da_mau), (m & quan, QUAN_DUI)):
            if not vung.any(): continue
            for c, (lo, hi) in zip(bang[1:], ((-1, 0.34), (0.34, 0.7), (0.7, 2))):
                out[vung & (u > lo) & (u <= hi)] = c + (255,)
            out[vung & (d_vien <= R)] = bang[0] + (255,)
        # mép quần đùi (gấu + cạp) giáp da: nét xám đậm phía quần
        da_ke = (m & ~quan) | (da & op)
        d_da = ndimage.distance_transform_edt(~da_ke)
        out[m & quan & (d_da <= R * 0.8)] = QUAN_DUI[0] + (255,)
    # nét gợi xương đòn / ngực / bụng (chỉ trên da thân, đối xứng quanh đường giữa thân)
    nets = net_than(lop['body'] & ~quan, phu, kh, H, W)
    toi = tuple(int(round(0.55 * x + 0.45 * y)) for x, y in zip(da_mau[0], da_mau[1]))
    out[nets & lop['body'] & ~quan] = toi + (255,)
    return out, lop


def net_than(than, phu, kh, H, W):
    m = np.zeros((H, W), bool)
    ys = np.nonzero(than.any(1))[0]
    if ys.size == 0: return m
    co_y, eo_y = phu['co'][1], phu['dai_tren']
    yy, xx = np.mgrid[0:H, 0:W].astype(float)

    def be_ngang(y):
        y = int(round(y)); xs = np.nonzero(than[y])[0] if 0 <= y < H else np.array([])
        if xs.size < 6: return None
        return xs.min(), xs.max()

    def doan(p, q, day):
        nonlocal m
        m |= T.kc_doan(xx, yy, p, q) <= day / 2

    y_xd = co_y + 0.16 * (eo_y - co_y)                    # xương đòn
    y_ng = co_y + 0.42 * (eo_y - co_y)                    # chân ngực
    y_rn = eo_y - 0.10 * (eo_y - co_y)                    # rốn
    day = 0.55 / T.SK
    bn = be_ngang(y_ng)
    if bn is None: return m
    a, b = bn; w = b - a; g = a + 0.6 * w                 # đường giữa thân (hơi về phía ngực: nhân vật quay phải)
    nua = 0.30 * w
    for s in (-1, 1):
        doan((g + s * 0.10 * w, y_xd + 0.04 * w), (g + s * nua, y_xd - 0.04 * w), day)          # xương đòn
        doan((g + s * 0.06 * w, y_ng), (g + s * nua * 0.85, y_ng - 0.03 * w), day)              # chân ngực
        doan((g + s * nua * 0.85, y_ng - 0.03 * w), (g + s * nua, y_ng - 0.16 * w), day)
    doan((g, y_ng + 0.12 * w), (g, y_rn - 0.12 * w), day * 0.8)                                 # đường giữa bụng
    m |= np.hypot(xx - g, yy - y_rn) <= day * 0.6                                              # rốn
    return m & than


def thu_96(i, img, mask):
    """Co ảnh nguồn đã tô về ô 96 như sprite game (BOX theo SK, đặt DAT[i]); vùng ngoài mask kéo màu láng giềng gần nhất."""
    H, W = mask.shape
    if not mask.any(): return np.zeros((O, O, 3), np.uint8)
    _, (iy, ix) = ndimage.distance_transform_edt(~mask, return_indices=True)
    rgb = img[:, :, :3][iy, ix]
    nw, nh = max(1, round(W * T.SK)), max(1, round(H * T.SK))
    r = np.array(Image.fromarray(rgb).resize((nw, nh), Image.BOX))
    out = np.zeros((O, O, 3), np.uint8)
    dx, dy = T.DAT[i]
    y0, x0 = max(0, dy), max(0, dx)
    out[y0:min(O, dy + nh), x0:min(O, dx + nw)] = r[y0 - dy:min(O, dy + nh) - dy, x0 - dx:min(O, dx + nw) - dx]
    return out


def vung_96(own, gk, k, T_):
    """Điểm ảnh ô 96 mà lớp nền tô da phải lấp: như trang_phuc.dung_nen nhưng gồm cả viền mờ của đồ gốc
    (ở viền mờ chỉ giao cho MỘT lớp nằm trên cùng, alpha = alpha game) → hình bóng nền = hình bóng sprite."""
    a = gk[:, :, 3]
    dac, mo = a == 255, (a > 0) & (a < 255)
    chu = TP.chu_idx(own)
    tren = lambda l: np.isin(chu, [TP.IDX[x] for x in TP.LAYER_ORDER if TP.IDX[x] > TP.IDX[l]])
    la_do = np.isin(chu, [TP.IDX[x] for x in TP.DO])
    f = {}
    f['body'] = T_ & tren('body') & ~own['body']
    for ben, lop, quan in (('Front', 'frontLeg', 'frontPants'), ('Back', 'rearLeg', 'rearPants')):
        d = TP.kc_chuoi([k['hip' + ben], k['knee' + ben], k['ankle' + ben]])
        m = own[quan].copy()
        if lop == 'rearLeg': m |= own['belt'] & (d <= 4.0)
        f[lop] = m & tren(lop)
    out = {l: (f[l] & dac) for l in f}
    da_giao = np.zeros((O, O), bool)
    for l in ('frontLeg', 'body', 'rearLeg'):                 # viền mờ: lớp nằm trên cùng nhận trước
        m = f[l] & mo & la_do & ~da_giao
        out[l] |= m; da_giao |= m
    return out


def dung(F):
    """Dựng 3 sheet nền tô da (rearLeg, body, frontLeg; 1152×96). F = danh sách khung của tao-bo.py
    (cần gk, own, k, T, src = (ảnh nguồn, nhãn, phụ), kh = khớp nguồn).
    Trả (sheets, vung, ngoai, bang): vung[i][lớp] = điểm ảnh đã tô da; ngoai[i] = dải đai bay ngoài người (không thuộc nền)."""
    N = len(F)
    nguon = [f['src'] for f in F]
    bang = bang_da(nguon)
    ng = nguong(nguon, [f['kh'] for f in F])
    sheets = {l: np.zeros((O, O * N, 4), np.uint8) for l in LOP_TO}
    vung, ngoai = [], []
    for i, f in enumerate(F):
        a, nh, phu = f['src']; gk, own = f['gk'], f['own']
        img, lop = ve_nguon(a, nh, phu, f['kh'], bang, ng)
        v = vung_96(own, gk, f['k'], f['T'])
        sl = slice(i * O, (i + 1) * O)
        for l in LOP_TO:
            s = sheets[l][:, sl]
            s[own[l]] = gk[own[l]]
            r = thu_96(i, img, lop[l])
            s[v[l], :3] = r[v[l]]
            s[v[l], 3] = gk[v[l], 3]
        vung.append(v)
        nen_own = np.logical_or.reduce([own[l] for l in TP.NEN] + [v[l] for l in LOP_TO])
        ngoai.append((gk[:, :, 3] > 0) & ~nen_own)
    return sheets, vung, ngoai, bang
