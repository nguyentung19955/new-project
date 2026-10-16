"""Tách lớp Cu Tí mới (hàng chạy) — phần tách trên ảnh nguồn cao rồi hạ xuống khung 96×96.
Được tao-bo.py gọi. Không sửa gì ngoài docs/thu-modular-96/.
"""
import base64, io, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DAY, '..', '..'))
SRC = os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'moi', '03-chay-v4-gif', '03-chay-v4', 'khung-%02d.png')
GAME = os.path.join(REPO, 'game', 'art', 'custom', 'zed-moi.sprite.json')
HANG_CHAY = 2      # dong_tac.chay.hang trong zed-moi.sprite.json
SO_KHUNG = 12
O = 96

# Tỉ lệ co và vị trí từng khung nguồn trong ô 96 (dò lại bằng hàm do_dat(); khớp cách dung-zed-game.py đặt khung:
# co BOX theo s_hang, dời ngang theo tâm đầu, chân chạm đáy).
SK = 0.2255
DAT = [(22, 26), (25, 26), (25, 27), (24, 26), (21, 25), (18, 25), (22, 25), (23, 25), (26, 25), (23, 24), (20, 24), (19, 24)]

LOP = ['rearLeg', 'rearArm', 'body', 'pants', 'torsoOutfit', 'chestArmor', 'backShoulderArmor',
       'frontLeg', 'frontShoulderArmor', 'frontArm', 'forearmArmor', 'head', 'hair']
# nhãn khi tách (0 = trống)
NH = {'rearLeg': 1, 'rearArm': 2, 'body': 3, 'pants': 4, 'torsoOutfit': 5, 'frontLeg': 6, 'frontArm': 7, 'head': 8, 'hair': 9}


def hang_game():
    d = json.load(open(GAME))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    return np.array(im.crop((0, HANG_CHAY * O, SO_KHUNG * O, (HANG_CHAY + 1) * O)))


def nguon(i):
    return np.array(Image.open(SRC % (i + 1)).convert('RGBA'))


def quy_doi(i, h, w):
    """hệ số (sx, sy, dx, dy): X96 = dx + x*sx."""
    nw, nh = max(1, round(w * SK)), max(1, round(h * SK))
    return nw / w, nh / h, DAT[i][0], DAT[i][1]


def do_dat(game):
    """Dò lại SK, DAT bằng cách so kênh alpha (chạy tay khi cần)."""
    best = None
    for sk in np.arange(0.215, 0.236, 0.0005):
        tot, par = 0, []
        for i in range(SO_KHUNG):
            im = Image.open(SRC % (i + 1)).convert('RGBA')
            nw, nh = round(im.width * sk), round(im.height * sk)
            a = np.array(im.resize((nw, nh), Image.BOX)).astype(float)
            g = game[:, i * O:(i + 1) * O].astype(float)
            bs, bb = 1e18, None
            for dy in range(max(0, 90 - nh - 3), min(96 - nh, 90 - nh + 5) + 1):
                for dx in range(0, 96 - nw + 1):
                    o = np.zeros((96, 96, 4)); o[dy:dy + nh, dx:dx + nw] = a
                    e = np.abs(o - g).sum()
                    if e < bs: bs, bb = e, (dx, dy)
            tot += bs; par.append(bb)
        if best is None or tot < best[0]: best = (tot, sk, par)
    return best


def _hsv(a):
    rgb = a[:, :, :3].astype(float) / 255
    mx, mn = rgb.max(2), rgb.min(2)
    v = mx; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    h = np.zeros_like(v); d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, h)
    h = np.where(mx == g, (b - r) / d + 2, h)
    h = np.where(mx == b, (r - g) / d + 4, h)
    return h * 60, s, v


def mau(a):
    h, s, v = _hsv(a)
    op = a[:, :, 3] > 40
    da = op & (((h < 45) | (h > 340)) & (s > 0.25) & (s < 0.75) & (v > 0.55))     # da người (cả bắp tay, bàn tay, mặt)
    do = op & ((h < 15) | (h > 335)) & (s > 0.55) & (v > 0.28) & ~da               # đỏ: dải đai
    return op, da, do


def kc_doan(px, py, a, b):
    ax, ay = a; bx, by = b
    vx, vy = bx - ax, by - ay
    L = vx * vx + vy * vy
    t = np.clip(((px - ax) * vx + (py - ay) * vy) / max(L, 1e-6), 0, 1)
    return np.hypot(px - (ax + t * vx), py - (ay + t * vy))


def kc_duong(px, py, pts):
    return np.min([kc_doan(px, py, pts[k], pts[k + 1]) for k in range(len(pts) - 1)], axis=0)


def mat_va_co(a, da):
    """Mảng da lớn nhất ở nửa trên = mặt. Trả mask mặt, cằm (x,y), cổ (x,y)."""
    H = a.shape[0]
    lab, n = ndimage.label(da)
    best, bi = 0, 0
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        if ys.mean() < H * 0.45 and len(ys) > best: best, bi = len(ys), k
    mat = lab == bi
    ys, xs = np.nonzero(mat)
    rong = np.bincount(ys - ys.min())
    du = np.nonzero(rong >= 0.4 * rong.max())[0]
    cam_y = int(ys.min() + du.max())               # cằm = hàng cuối còn rộng (dưới đó là da cổ hẹp)
    hang = xs[ys == cam_y]
    cam = (int(np.median(hang)), cam_y)
    duoi = xs[(ys > cam_y) & (ys <= cam_y + 8)]
    co_x = int(np.median(duoi)) if duoi.size else int(xs[ys >= cam_y - 10].min() + 8)
    co = (co_x, cam_y + 4)
    mat = mat & (np.mgrid[0:a.shape[0], 0:a.shape[1]][0] <= cam_y + 1)
    return mat, cam, co


def tach(i, kh):
    """Gán nhãn từng điểm ảnh nguồn của khung i. kh = khớp nguồn (dict). Trả (nhãn, phụ)."""
    a = nguon(i)
    H, W = a.shape[:2]
    op, da, do = mau(a)
    mat, cam, co = mat_va_co(a, da)
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    nh = np.zeros((H, W), np.uint8)

    # --- vùng đầu: mọi thứ trên đường cổ (đường xiên từ cổ lên sau gáy), trừ chỗ tay
    co_y = co[1]
    mat_gan = ndimage.binary_dilation(mat, iterations=4)
    dau_vung = op & (((yy < co_y - 5)) | ((yy < co_y + 1) & (xx > co[0] + 2) & mat_gan))
    # mặt = mảng da mặt nở 3 điểm + lấp lỗ (mắt, mày, miệng) ; phần còn lại vùng đầu là tóc
    mat_to = ndimage.binary_fill_holes(ndimage.binary_dilation(mat, iterations=3)) & dau_vung
    # tóc phủ trán: điểm tối trong mat_to mà nằm trên đường mày (1/3 trên của mặt) vẫn là tóc
    ys, xs = np.nonzero(mat)
    tran_y = ys.min()
    toi = ~da & ~do
    mat_to &= ~(toi & (yy < tran_y + 2))

    # --- tay, chân: khoảng cách tới xương
    tayT = [kh['vaiT'], kh['khuyuT'], kh['coTayT'], kh['banTayT']]
    tayS = [kh['vaiS'], kh['khuyuS'], kh['coTayS'], kh['banTayS']]
    chanT = [kh['hongT'], kh['goiT'], kh['coChanT'], kh['muiChanT']]
    chanS = [kh['hongS'], kh['goiS'], kh['coChanS'], kh['muiChanS']]
    eo_y = int((kh['hongT'][1] + kh['hongS'][1]) / 2) - 22
    hong = ((kh['hongT'][0] + kh['hongS'][0]) / 2, (kh['hongT'][1] + kh['hongS'][1]) / 2)
    than = [co, (co[0] - 8, eo_y), hong]
    d = {
        'frontArm': np.minimum(np.where(da, kc_duong(xx, yy, tayT[:2]) / 10.0, kc_duong(xx, yy, tayT[:2]) / 4.0 + 0.5),
                               np.minimum(kc_duong(xx, yy, tayT[1:3]) / 8.0, kc_duong(xx, yy, tayT[2:]) / 10.0)),
        'rearArm': np.minimum(kc_duong(xx, yy, tayS[1:]) / 9.0, kc_duong(xx, yy, tayS[:2]) / 6.0 + 0.6),
        'frontLeg': kc_duong(xx, yy, chanT) / 17.0,
        'rearLeg': kc_duong(xx, yy, chanS) / 17.0,
        'than': kc_duong(xx, yy, than) / 24.0,
    }
    # bắp tay gần vai: kéo về thân bớt (vai thuộc thân tới khi ra khỏi bề ngang thân)
    d['frontArm'] = d['frontArm'] + np.where(kc_doan(xx, yy, tayT[0], tayT[0]) < 6, 0.4, 0)
    d['rearArm'] = d['rearArm'] + np.where(kc_doan(xx, yy, tayS[0], tayS[0]) < 6, 0.4, 0)
    # chân không lên quá hông
    for k, ch in (('frontLeg', chanT), ('rearLeg', chanS)):
        d[k] = d[k] + np.where(yy < ch[0][1] - 4, 5, 0)
    ten = list(d)
    st = np.stack([d[k] for k in ten])
    am = np.argmin(st, 0)
    # da (bàn tay / bắp tay trần) không bao giờ là thân: gán cho tay gần nhất
    tay_am = np.where(d['frontArm'] <= d['rearArm'], ten.index('frontArm'), ten.index('rearArm'))
    da_than = da & ~mat & (am == ten.index('than')) & (yy > co_y + 6)
    am = np.where(da_than, tay_am, am)

    for k in ('frontArm', 'rearArm', 'frontLeg', 'rearLeg'):
        nh[op & (am == ten.index(k))] = NH[k]
    tm = op & (am == ten.index('than'))
    # thân: dải đỏ = đai (torsoOutfit); dưới đai = quần (pants); trên đai = thân (body, áo đen vẽ liền người)
    do_than = do & (yy > co_y + 15)
    dai_y = yy[do_than & (np.abs(xx - hong[0]) < 30)]
    dai_tren = int(np.percentile(dai_y, 5)) if dai_y.size else eo_y
    dai_duoi = int(np.percentile(dai_y, 90)) if dai_y.size else eo_y + 12
    nh[tm] = NH['body']
    nh[tm & (yy > dai_duoi)] = NH['pants']
    # dải đai đỏ ở bất cứ đâu dưới cổ (cả hai dải bay sau lưng, đè lên chân sau) = torsoOutfit; mép tối sát dải đỏ cũng vậy
    do_to = ndimage.binary_dilation(do_than, iterations=2) & op & ~da
    dai_mask = do_to & ~(nh == NH['frontArm']) & ~(nh == NH['frontLeg'])
    dai_mask |= do_than
    nh[dai_mask & (yy > co_y + 15)] = NH['torsoOutfit']
    # đầu
    nh[dau_vung] = NH['hair']
    nh[dau_vung & mat_to] = NH['head']
    # da cổ dưới cằm → body
    nh[op & da & (yy >= co_y - 2) & (yy < co_y + 14) & (nh == NH['hair'])] = NH['head']
    phu = {'cam': cam, 'co': co, 'eo_y': eo_y, 'dai_tren': dai_tren, 'dai_duoi': dai_duoi, 'hong': hong}
    return a, nh, phu


def ha_nhan(i, a_src, nh_src, game_khung):
    """Nhãn nguồn → nhãn từng điểm ảnh của khung game 96×96 (đa số có trọng alpha)."""
    H, W = nh_src.shape
    sx, sy, dx, dy = quy_doi(i, H, W)
    out = np.zeros((O, O), np.uint8)
    al = a_src[:, :, 3].astype(float)
    ga = game_khung[:, :, 3] > 0
    for Y in range(O):
        y0, y1 = (Y - dy) / sy, (Y + 1 - dy) / sy
        for X in range(O):
            if not ga[Y, X]: continue
            x0, x1 = (X - dx) / sx, (X + 1 - dx) / sx
            ya, yb = max(0, int(np.floor(y0))), min(H, int(np.ceil(y1)))
            xa, xb = max(0, int(np.floor(x0))), min(W, int(np.ceil(x1)))
            if ya >= yb or xa >= xb: continue
            n = nh_src[ya:yb, xa:xb].ravel(); w = al[ya:yb, xa:xb].ravel()
            n, w = n[n > 0], w[n > 0]
            if n.size == 0: continue
            out[Y, X] = np.bincount(n, weights=w, minlength=10).argmax()
    # điểm ảnh game không có nguồn → nhãn của láng giềng gần nhất
    thieu = ga & (out == 0)
    if thieu.any():
        _, (iy, ix) = ndimage.distance_transform_edt(out == 0, return_indices=True)
        out[thieu] = out[iy[thieu], ix[thieu]]
    return out


def doi_diem(i, p, H, W):
    sx, sy, dx, dy = quy_doi(i, H, W)
    return [round(dx + (p[0] + 0.5) * sx - 0.5, 1), round(dy + (p[1] + 0.5) * sy - 0.5, 1)]
