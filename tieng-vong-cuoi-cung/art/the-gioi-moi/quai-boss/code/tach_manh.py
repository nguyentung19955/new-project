"""Bước 1 – tách mảnh bằng code từ ảnh nguồn (KHÔNG gen ảnh).

Quái chuông gỗ (quai-chuong-go.png): thân chuông (kèm mắt, quai treo), quả lắc, 2 nắm tay, 2 chân.
Boss Chuông Gác Làng (boss-chuong-gac-lang.png): thân chuông + mái (kèm mắt, khoen, phần xích trên thân),
đoạn xích treo (đung đưa), 2 nắm tay đá.
Thêm cho clip chết: thân chẻ đôi (than-trai / than-phai) theo đường nứt có sẵn trên hình.

Cách làm (giống rig-v2): nền trắng nối mép ảnh = trong suốt; khử viền trắng (alpha theo pha trộn với trắng);
mỗi mảnh rời = một vùng liền (connected component). Mảnh bị dính/che thì cắt bằng mặt nạ + bù phần khuất:
- quả lắc quái: vùng màu gỗ liền khối quanh hạt giống + vành nét đen ≤ 24 px; chỗ trống trên thân bù bằng
  "nội suy theo đường mép": duỗi thẳng thân theo mép dưới (mép dưới tại cột bị che = đường bậc 2 khớp hai bên),
  rồi mỗi hàng song song mép dưới nội suy tuyến tính màu từ hai bên → vành miệng chuông/nét đen chạy liền qua.
- xích boss: đoạn xích treo NGOÀI thân chuông (từ mắt xích dọc đầu tiên dưới khoen trở xuống) tách riêng; phần
  xích nằm trên thân giữ nguyên trong thân (không phải vẽ bù mặt chuông). Ranh cắt = mép màu thân chuông
  + 14 px nét viền thân (đo trên ảnh) → nét viền phải của chuông vẫn còn đủ khi xích đung đưa.
- thân chẻ đôi: cắt theo đường gấp khúc đặt tay dọc vết nứt có sẵn; mép cắt vẽ thêm nét tối 7 px (mềm) cho
  giống nét nứt. Chỉ dùng trong clip chết.
Kết quả: manh/<nv>/*.png (RGBA, cỡ gốc ảnh nguồn, đã cắt sát) + manh/<nv>/tach.json (vị trí trên ảnh nguồn)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from chung import SRC, MANH, load_rgb, background, unmix_white, components, save_json

# ---------------------------------------------------------------- đặt tay (toạ độ ảnh nguồn 1254×1254)
# Quái
Q_HAT_QUA_LAC = (575, 900)            # một điểm giữa quả lắc
Q_HOP_QUA_LAC = (470, 805, 690, 1000)  # hộp tìm quả lắc
Q_VIEN = 16                           # vành nét đen giữ trên mảnh quả lắc (px, chỉ điểm rất tối L<30)
Q_VIEN_BU = 24                        # vùng bù trên thân rộng hơn để không sót nét đen của quả lắc
Q_NUT = [(690, 200), (700, 290), (742, 340), (750, 450), (758, 560), (790, 625), (800, 700), (795, 820),
         (790, 1000)]                 # đường chẻ đôi thân quái (dọc vết nứt lớn giữa thân)
# Boss
B_MEP_CHUONG = {890: 877, 950: 880, 960: 888, 970: 900, 980: 912, 990: 925, 1000: 937, 1010: 940, 1020: 944,
                1030: 947, 1040: 950, 1050: 953, 1060: 949, 1070: 937, 1080: 925, 1090: 918, 1110: 918}
# ↑ mép phải phần MÀU của thân chuông theo hàng (đo trên ảnh: điểm màu bão hoà phải nhất trước nét đen)
B_VIEN_XICH = 13                      # vành nét đen quanh mắt xích giữ theo mảnh xích (px)
B_VIEN = 14                           # bề dày nét viền thân chuông (đo: 944→958 ở hàng 1020)
B_XICH_DINH = 825                     # đầu trên mắt xích dọc đầu tiên dưới khoen
B_XICH_KHE = (889, 921)               # khe giữa hai cạnh mắt xích nằm ngang phía trên (mắt xích dọc móc vào đây)
B_XICH_DUOI = 862                     # dưới hàng này: mọi thứ phải mép thân chuông là xích
B_NUT = [(700, 40), (700, 450), (680, 560), (650, 650), (640, 720), (655, 800), (690, 870), (705, 960),
         (700, 1140)]                 # đường chẻ đôi thân boss (qua núm mái, dọc vết nứt dưới mắt)
VIEN_CAT = 7                          # nét tối vẽ dọc mép chẻ (px)


def crop_save(rgba, mask, path, pad=4):
    """Giữ điểm ảnh trong mask, cắt sát (+pad), lưu. Trả [x0, y0, w, h] trên ảnh nguồn."""
    a = rgba.copy()
    a[~mask] = 0
    ys, xs = np.nonzero(a[..., 3] > 0)
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + 1 + pad, a.shape[1]), min(ys.max() + 1 + pad, a.shape[0])
    Image.fromarray(a[y0:y1, x0:x1], 'RGBA').save(path)
    return [int(x0), int(y0), int(x1 - x0), int(y1 - y0)]


def x_theo_y(nut, ys):
    py = np.array([p[1] for p in nut], float)
    px = np.array([p[0] for p in nut], float)
    return np.interp(ys, py, px)


def mep_duoi(rgba, x_lo, x_hi, fit_w=90):
    """Mép dưới thân theo cột. Cột trong [x_lo, x_hi] (bị quả lắc che) = đường bậc 2 khớp các cột hai bên."""
    al = rgba[..., 3] > 128
    W = al.shape[1]
    yb = np.full(W, -1.0)
    known = [x for x in range(max(x_lo - fit_w, 0), min(x_hi + fit_w, W))
             if (x < x_lo or x > x_hi) and al[:, x].any()]
    for x in known:
        yb[x] = np.nonzero(al[:, x])[0].max()
    known = np.array(known)
    c = np.polyfit(known, yb[known], 2)
    for x in range(x_lo, x_hi + 1):
        yb[x] = np.polyval(c, x)
    return yb


def bu_theo_mep_duoi(rgba, hole, yb, x_lo, x_hi, D=230, fit_w=90):
    """Bù vùng 'hole' trên thân bằng nội suy theo mép dưới yb (xem docstring đầu file)."""
    out = rgba.astype(np.float64).copy()
    H, W = hole.shape
    cols = np.arange(max(x_lo - fit_w, 0), min(x_hi + fit_w, W))
    cols = cols[yb[cols] >= 0]
    # duỗi thẳng theo mép dưới
    F = np.zeros((D, len(cols), 4))
    Hf = np.zeros((D, len(cols)), bool)
    for j, x in enumerate(cols):
        for d in range(D):
            y = int(round(yb[x])) - d
            if 0 <= y < H:
                F[d, j] = out[y, x]
                Hf[d, j] = hole[y, x]
    for d in range(D):
        row, hr = F[d], Hf[d]
        if not hr.any():
            continue
        good = np.nonzero(~hr)[0]
        bad = np.nonzero(hr)[0]
        for ch in range(4):
            row[bad, ch] = np.interp(bad, good, row[good, ch])
    for j, x in enumerate(cols):
        ybx = int(round(yb[x]))
        for y in np.nonzero(hole[:, x])[0]:
            d = ybx - y
            if d < 0:
                out[y, x] = 0                       # dưới mép dưới thân → trong suốt
            elif d < D:
                out[y, x] = F[d, j]
    out[out[..., 3] < 8] = 0
    return out.round().clip(0, 255).astype(np.uint8)


def che_doi(rgba, nut, path_l, path_r, vien=VIEN_CAT):
    """Chẻ thân theo đường gấp khúc 'nut' (x theo y). Mép chẻ của mỗi nửa được tô tối dần (nét nứt)."""
    H, W = rgba.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    xc = x_theo_y(nut, np.arange(H))[:, None]
    trai = xx < xc
    res = {}
    for ten, m, p in (('than-trai', trai, path_l), ('than-phai', ~trai, path_r)):
        a = rgba.copy().astype(np.float64)
        a[~m] = 0
        d = np.abs(xx - xc)                          # khoảng cách ngang tới đường cắt (gần đúng)
        k = np.clip((vien - d) / 3.0, 0, 1)[..., None] * (a[..., 3:4] > 0)
        toi = np.array([28, 16, 8.0])                # màu nét nứt (nâu đen như nét viền)
        a[..., :3] = a[..., :3] * (1 - k) + toi * k
        res[ten] = crop_save(a.round().astype(np.uint8), m, p)
    return res


def tach_quai():
    out_dir = os.path.join(MANH, 'quai')
    os.makedirs(out_dir, exist_ok=True)
    a = load_rgb(SRC['quai'])
    bg, _ = background(a)
    fg = ~bg
    rgba = unmix_white(a, fg)
    comps = components(fg, min_px=5000, close=0)
    comps.sort(key=lambda c: -c[1].sum())
    than_m = comps[0][1]
    nho = sorted(comps[1:], key=lambda c: (c[0][0].start > 950, c[0][1].start))
    # 2 nắm tay (trên, y < 950) và 2 chân (dưới)
    tay = sorted([c for c in comps[1:] if c[0][0].start < 950], key=lambda c: c[0][1].start)
    chan = sorted([c for c in comps[1:] if c[0][0].start >= 950], key=lambda c: c[0][1].start)
    assert len(tay) == 2 and len(chan) == 2, (len(tay), len(chan), len(nho))
    info = {}

    def grow(m):
        return nd.binary_dilation(m, iterations=2) & (rgba[..., 3] > 0)
    info['tay-truoc'] = crop_save(rgba, grow(tay[0][1]), os.path.join(out_dir, 'tay-truoc.png'))
    info['tay-sau'] = crop_save(rgba, grow(tay[1][1]), os.path.join(out_dir, 'tay-sau.png'))
    info['chan-xa'] = crop_save(rgba, grow(chan[0][1]), os.path.join(out_dir, 'chan-xa.png'))
    info['chan-gan'] = crop_save(rgba, grow(chan[1][1]), os.path.join(out_dir, 'chan-gan.png'))

    # quả lắc
    L = a.mean(-1)
    x0, y0, x1, y1 = Q_HOP_QUA_LAC
    box = np.zeros_like(fg)
    box[y0:y1, x0:x1] = True
    mau = box & than_m & (L > 22)
    lab, _ = nd.label(mau)
    mau = lab == lab[Q_HAT_QUA_LAC[1], Q_HAT_QUA_LAC[0]]
    mau = nd.binary_fill_holes(mau)
    toi = (L < 30) & box & grow(than_m)
    ql = mau | (nd.binary_dilation(mau, iterations=Q_VIEN) & toi)
    lo = mau | (nd.binary_dilation(mau, iterations=Q_VIEN_BU) & toi)       # lỗ trên thân
    than = rgba.copy()
    than[~grow(than_m)] = 0
    xs = np.nonzero(lo.any(0))[0]
    yb = mep_duoi(than, xs.min(), xs.max())
    # mọi điểm thân dưới mép dưới (đường bậc 2) trong các cột bị che = phần quả lắc thò ra (kể cả nét viền dưới)
    yy = np.arange(than.shape[0])[:, None]
    duoi = np.zeros_like(ql)
    duoi[:, xs.min():xs.max() + 1] = yy > yb[None, xs.min():xs.max() + 1]
    duoi &= than[..., 3] > 0
    lab, _ = nd.label(ql | (duoi & nd.binary_dilation(mau, iterations=Q_VIEN)))
    ql = lab == lab[Q_HAT_QUA_LAC[1], Q_HAT_QUA_LAC[0]]                      # bỏ mẩu rời (mép vành chuông)
    lo |= duoi
    info['qua-lac'] = crop_save(rgba, ql, os.path.join(out_dir, 'qua-lac.png'))
    # thân: bỏ quả lắc, bù chỗ trống
    than = bu_theo_mep_duoi(than, lo, yb, xs.min(), xs.max())
    info['than'] = crop_save(than, than[..., 3] > 0, os.path.join(out_dir, 'than.png'))
    info.update(che_doi(than, Q_NUT, os.path.join(out_dir, 'than-trai.png'), os.path.join(out_dir, 'than-phai.png')))
    meta = {'nguon': 'code/nguon/quai-chuong-go.png', 'manh': {k: {'anh': f'manh/quai/{k}.png', 'hop_tren_nguon': v}
                                                              for k, v in info.items()},
            'bu': {'qua-lac': {'so_px_bu': int(lo.sum()), 'cach': 'nội suy theo mép dưới miệng chuông',
                               'mep_duoi_cot_bi_che': [int(xs.min()), int(xs.max())]}},
            'duong_che_doi': Q_NUT}
    save_json(meta, os.path.join(out_dir, 'tach.json'))
    print('quái:', {k: v for k, v in info.items()})


def tach_boss():
    out_dir = os.path.join(MANH, 'boss')
    os.makedirs(out_dir, exist_ok=True)
    a = load_rgb(SRC['boss'])
    bg, _ = background(a)
    fg = ~bg
    rgba = unmix_white(a, fg)
    comps = components(fg, min_px=5000, close=0)
    comps.sort(key=lambda c: -c[1].sum())
    than_m = comps[0][1]
    tay = sorted(comps[1:3], key=lambda c: c[0][1].start)
    info = {}

    def grow(m):
        return nd.binary_dilation(m, iterations=2) & (rgba[..., 3] > 0)
    info['tay-truoc'] = crop_save(rgba, grow(tay[0][1]), os.path.join(out_dir, 'tay-truoc.png'))
    info['tay-sau'] = crop_save(rgba, grow(tay[1][1]), os.path.join(out_dir, 'tay-sau.png'))
    than_g = grow(than_m)
    H, W = fg.shape
    ys = np.arange(H)
    ky = sorted(B_MEP_CHUONG)
    mep = np.interp(ys, ky, [B_MEP_CHUONG[k] for k in ky])
    mep[ys < ky[0]] = B_MEP_CHUONG[ky[0]]
    gioi = (mep + B_VIEN)[:, None]
    yy, xx = np.mgrid[0:H, 0:W]
    xich = than_g & (xx > gioi) & (yy >= B_XICH_DUOI)
    xich |= than_g & (yy >= B_XICH_DINH) & (yy < B_XICH_DUOI) & (xx > B_XICH_KHE[0]) & (xx < B_XICH_KHE[1])
    # chỉ giữ trong mảnh xích: thân mắt xích (xám) + vành nét đen quanh nó ≤ B_VIEN_XICH px; phần nét đen còn lại
    # sát mép chuông (nét viền thân chuông dày hơn 14 px ở vài hàng) trả về thân → xích đung đưa không kéo theo mẩu viền chuông.
    sat = a.max(-1) - a.min(-1)
    L = a.mean(-1)
    xam = xich & (sat < 30) & (L > 45)
    gan_xam = nd.binary_dilation(xam, iterations=B_VIEN_XICH)
    xich &= gan_xam | (xx > gioi + 12)              # chỉ trả về thân phần nét đen sát mép chuông
    # bỏ mẩu viền chuông mảnh dính vào xích (nối qua 1–2 px khử răng cưa): mở hình 3 px, giữ khối có mắt xích
    loi = nd.binary_opening(xich & (rgba[..., 3] > 128), iterations=3)
    lab, _ = nd.label(loi)
    giu = np.unique(lab[xam & loi])
    xich &= nd.binary_dilation(np.isin(lab, giu[giu > 0]), iterations=4)
    lab, n = nd.label(xich & (rgba[..., 3] > 0))
    if n > 1:                                        # chỉ giữ khối liền lớn nhất (bỏ mẩu viền rời)
        sz = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
        xich = lab == (int(np.argmax(sz)) + 1)
    info['xich'] = crop_save(rgba, xich, os.path.join(out_dir, 'xich.png'))
    than = rgba.copy()
    than[~(than_g & ~xich)] = 0
    info['than'] = crop_save(than, than[..., 3] > 0, os.path.join(out_dir, 'than.png'))
    info.update(che_doi(than, B_NUT, os.path.join(out_dir, 'than-trai.png'), os.path.join(out_dir, 'than-phai.png')))
    meta = {'nguon': 'code/nguon/boss-chuong-gac-lang.png',
            'manh': {k: {'anh': f'manh/boss/{k}.png', 'hop_tren_nguon': v} for k, v in info.items()},
            'xich': {'cach': 'đoạn xích ngoài thân chuông; phần xích nằm trên thân giữ trong thân',
                     'mep_mau_than_theo_hang': B_MEP_CHUONG, 'vien_than_px': B_VIEN},
            'duong_che_doi': B_NUT}
    save_json(meta, os.path.join(out_dir, 'tach.json'))
    print('boss:', info)


if __name__ == '__main__':
    tach_quai()
    tach_boss()
