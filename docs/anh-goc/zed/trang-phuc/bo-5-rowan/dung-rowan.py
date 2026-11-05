#!/usr/bin/env python3
"""TRANG PHỤC "ROWAN" (TALESWORN, 05/11/2026 — docs/review/ke-hoach-cai-thien/talesworn-c-rowan/bao-cao.md).

Chạy lại được:  python3 docs/anh-goc/zed/trang-phuc/bo-5-rowan/dung-rowan.py [--xem]

Cách làm (theo tư vấn ChatGPT 05/11 mục 4.3: "giữ toàn bộ động tác, chỉ thay đầu và đổi màu thân"):
  - Đọc tấm thân bộ ninja game/art/custom/zed-moi.sprite.json (mọi hàng, mọi khung, cả bản to ×1,2 "tam_to").
  - THÂN: đổi màu theo bảng, không vẽ tay. Vải đen trên đai → áo lam (Hero Blue #3E6FA8, 4 cấp sáng tối theo độ sáng điểm ảnh gốc);
    vải đen dưới đai → quần nâu sẫm; đai đỏ → da thuộc (#986342); vải đen sát bàn tay (cổ tay áo) → lam; viền tối nhất → #18202A.
  - ĐẦU: cắt đầu + mũ trùm vàng nghệ từ ảnh ChatGPT (docs/tu-van-toan-cau/chatgpt-05-11/rowan-4-goc-nguon-chatgpt.png, góc 3/4
    trước-phải), thu nét bằng cách lấy màu xuất hiện nhiều nhất mỗi ô (không trung bình → không nhoè), cỡ bằng đầu ninja.
    Mỗi khung: tìm mặt (mảng da lớn nằm cao nhất, như do_dau của dung-zed-game.py), xoá tóc + mặt cũ (mảng tối/da dính với mặt,
    phía trên cằm), dán đầu mới: cằm mới trùng cằm cũ, tâm mặt mới trùng tâm mặt cũ. Khung không thấy mặt (lộn tròn, quay lưng):
    tóc đen đổi sang màu mũ trùm (nhìn như mũ trùm từ sau lưng).
  - Neo vũ khí, nắm tay, số khung, nhịp: GIỮ NGUYÊN của bộ ninja (cùng ô, cùng chỗ) → game dùng lại mọi bảng số của zed-moi.
Ghi: game/art/custom/zed-rowan.sprite.json (+ "anh_thay": khung thương quét 6 thay ảnh, cùng cách đổi).
     --xem: docs/review/ke-hoach-cai-thien/talesworn-c-rowan/xem-truoc-*.png
"""
import base64, io, json, os, sys, copy
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..', '..', '..'))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
NGUON = os.path.join(GOC, 'docs', 'tu-van-toan-cau', 'chatgpt-05-11', 'rowan-4-goc-nguon-chatgpt.png')
XEM = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'talesworn-c-rowan')

H = lambda s: tuple(int(s[i:i + 2], 16) for i in (1, 3, 5))
VIEN = H('#18202A')
AO = [H('#22385E'), H('#2F5488'), H('#3E6FA8'), H('#5A8CC6')]      # áo lam: tối → sáng
QUAN = [H('#2E221C'), H('#3F2E24'), H('#53392A'), H('#6A4A35')]    # quần nâu sẫm
DA_THUOC = [H('#5E3B26'), H('#7A4A2C'), H('#986342'), H('#B07A50')]  # đai đỏ → da thuộc (tạp dề)
# ngưỡng độ sáng (0,3R + 0,59G + 0,11B) của vải đen bộ ninja
NGUONG = [16, 27, 38, 50]
# Cỡ đầu: bề ngang mũ trùm (điểm ảnh ô 96) — đầu tóc ninja rộng ~30, mũ trùm to hơn chút cho nổi (ChatGPT 4.3: mũ là mảng dễ thấy nhất)
RONG_DAU = 32


def b64png(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def png64(im):
    b = io.BytesIO()
    im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def luma(a):
    return 0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]


# ---------- đầu Rowan từ ảnh ChatGPT ----------
def cat_dau():
    im = np.array(Image.open(NGUON).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    nen = (r > 170) & (b > 170) & (g < 120)  # nền magenta
    x0, x1, y0, y1 = 2030, 2330, 30, 300      # góc 3/4 trước-phải (hình thứ 4)
    a = im[y0:y1, x0:x1]
    al = ~nen[y0:y1, x0:x1]
    al = ndimage.binary_opening(al, iterations=1)
    # bỏ áo choàng vai: giữ phần trên cằm + mép mũ hai bên cổ
    sk = (a[..., 0] > 200) & (a[..., 1] > 140) & (a[..., 1] < 200) & (a[..., 2] > 100) & (a[..., 2] < 170)
    lab, n = ndimage.label(sk)
    sz = ndimage.sum(sk, lab, range(1, n + 1))
    mat = lab == (int(np.argmax(sz)) + 1)
    ys, xs = np.nonzero(mat)
    cam = int(np.percentile(ys, 99))  # cằm
    cx = float(np.mean(xs))
    day = cam + 8
    al[day:] = False
    return a, al, cam, cx


def thu_net(a, al, w_moi, k=None):
    """Thu ảnh (a: RGB, al: mặt nạ) về bề ngang w_moi (hoặc theo tỉ lệ k cho sẵn): mỗi ô lấy màu có thật xuất hiện nhiều nhất
    (ưu tiên viền tối nếu ≥ 30%)."""
    ys, xs = np.nonzero(al)
    bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    if k is None:
        k = (bx1 - bx0) / w_moi
    else:
        w_moi = int(round((bx1 - bx0) / k))
    h_moi = int(round((by1 - by0) / k))
    # lượng tử về 24 màu trước (gom các sắc gần nhau của ảnh AI)
    pim = Image.fromarray(a[by0:by1, bx0:bx1].astype(np.uint8)).quantize(24, method=Image.Quantize.MEDIANCUT)
    pal = np.array(pim.getpalette()[:72]).reshape(-1, 3)
    q = np.array(pim)
    m = al[by0:by1, bx0:bx1]
    toi = luma(pal) < 60
    ra = np.zeros((h_moi, w_moi, 4), np.uint8)
    for j in range(h_moi):
        for i in range(w_moi):
            ya, yb = int(j * k), max(int(j * k) + 1, int((j + 1) * k))
            xa, xb = int(i * k), max(int(i * k) + 1, int((i + 1) * k))
            mm = m[ya:yb, xa:xb]
            if mm.mean() < 0.5:
                continue
            v = q[ya:yb, xa:xb][mm]
            c = np.bincount(v, minlength=len(pal))
            if c[toi].sum() >= 0.3 * c.sum():
                c = c * toi
            ra[j, i, :3] = pal[int(np.argmax(c))]
            ra[j, i, 3] = 255
    return ra, k, (bx0, by0)


DAU = {}


def dau_co(f):
    """Đầu Rowan cho ô cỡ 96 × f. Trả (ảnh RGBA, cằm_y, tâm_x) trong toạ độ ảnh đầu."""
    if f in DAU:
        return DAU[f]
    a, al, cam, cx = cat_dau()
    ra, k, (bx0, by0) = thu_net(a, al, int(round(RONG_DAU * f)))
    ra = vien_ngoai(ra)
    DAU[f] = (ra, (cam - by0) / k, (cx - bx0) / k)
    # đầu nhìn từ SAU (hình thứ 3 của ảnh ChatGPT), cùng tỉ lệ, cắt cùng độ cao
    im = np.array(Image.open(NGUON).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    nen = (r > 170) & (b > 170) & (g < 120)
    y0, y1 = 30, 30 + cam + 9
    a2 = im[y0:y1, 1400:1705]
    al2 = ndimage.binary_opening(~nen[y0:y1, 1400:1705], iterations=1)
    rs, _, _ = thu_net(a2, al2, 0, k)
    DAU[('sau', f)] = vien_ngoai(rs)
    return DAU[f]


def doi_dau_sau(a, f):
    """Khung không thấy mặt (quay lưng, tay che): tóc phần đầu → đầu mũ trùm nhìn từ sau. Trả mặt nạ đã dán hoặc None."""
    dau_co(f)
    dau = DAU[('sau', f)]
    al = a[..., 3] > 0
    L = luma(a.astype(float))
    r, b = a[..., 0].astype(int), a[..., 2].astype(int)
    den = al & (L < 75) & (np.abs(r - b) < 35)
    gan_tay = ndimage.binary_dilation(da_mask(a), iterations=max(2, int(round(3 * f))))
    toc = den & ~gan_tay
    ys = np.nonzero(toc.any(1))[0]
    if not len(ys):
        return None
    vung = np.zeros_like(al)
    vung[ys.min(): int(ys.min() + 18 * f)] = True
    lab, n = ndimage.label(toc & vung)
    if n == 0:
        return None
    sz = ndimage.sum(toc & vung, lab, range(1, n + 1))
    m = lab == int(np.argmax(sz)) + 1
    if m.sum() < 60 * f * f:
        return None
    yy, xx = np.nonzero(m)
    cx, top = float(xx.mean()), int(yy.min())
    a[m] = 0
    hh, ww = dau.shape[:2]
    oy, ox = top - int(2 * f), int(round(cx - ww / 2))
    dan = np.zeros(a.shape[:2], bool)
    for j in range(hh):
        for i in range(ww):
            y, x = oy + j, ox + i
            if 0 <= y < a.shape[0] and 0 <= x < a.shape[1] and dau[j, i, 3] and a[y, x, 3] == 0:  # dán SAU tay / vũ khí còn lại
                a[y, x] = dau[j, i]
                dan[y, x] = True
    return dan


def vien_ngoai(ra):
    """Viền ngoài 1 điểm ảnh màu #18202A cho đầu (ảnh AI thu nhỏ có chỗ mất viền)."""
    al = ra[..., 3] > 0
    ngoai = ndimage.binary_dilation(al) & ~al
    ra = ra.copy()
    # chỉ thêm viền ở mép trên/hai bên, không ở đáy (đáy nối với cổ)
    day = np.zeros_like(al)
    hs = np.nonzero(al.any(1))[0]
    if len(hs):
        day[hs.max() - 1:] = True
    ngoai &= ~day
    ra[ngoai] = (*VIEN, 255)
    return ra


# ---------- một khung ----------
def da_mask(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (a[..., 3] > 0) & (r > 140) & (r > g + 25) & (g > b) & (g > 70)


def do_khung(a, f):
    """Tìm mặt: (cằm y, tâm x, mặt nạ mặt) hoặc None."""
    m = ndimage.binary_opening(da_mask(a), iterations=1)
    lab, n = ndimage.label(m)
    if n == 0:
        return None
    sz = ndimage.sum(m, lab, range(1, n + 1))
    cm = ndimage.center_of_mass(m, lab, range(1, n + 1))
    ok = [j for j in range(n) if sz[j] >= 25 * f * f]
    if not ok:
        return None
    # mặt: mảng da đủ lớn có nhiều tóc đen ngay phía trên (tay giơ cao không có tóc ở trên)
    def diem(j):
        yy, xx = np.nonzero(lab == j + 1)
        y0, xa, xb = yy.min(), xx.min(), xx.max()
        vung = a[max(0, int(y0 - 10 * f)):y0, xa:xb + 1]
        toc = ((vung[..., 3] > 0) & (luma(vung) < 60)).sum()
        return toc, -cm[j][0]
    j = max(ok, key=diem)
    if diem(j)[0] < 20 * f * f:
        return None
    mat = lab == j + 1
    yy, xx = np.nonzero(mat)
    if not (14 * f <= (yy.max() - yy.min()) <= 34 * f) and not (8 * f <= (xx.max() - xx.min()) <= 30 * f):
        return None
    return float(yy.max()), float(xx.mean()), mat


def doi_than(a, f, tay=False, bo_qua=None):
    """Đổi màu vải đen / đai đỏ theo bảng. a: RGBA (sửa tại chỗ)."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    al = a[..., 3] > 0
    L = luma(a.astype(float))
    do = al & (r > 60) & (r > 2 * g + 10) & (r > 2 * b)  # đai đỏ
    den = al & ~do & (L < NGUONG[3] + 18) & (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b) < 40)
    S = a.shape[0]
    ys = np.nonzero(do)[0]
    yd = float(np.median(ys)) if len(ys) > 3 else 63 * f
    if len(ys) > 3:
        yd = float(np.percentile(ys, 80))
    da = da_mask(a)
    # bàn tay (da không phải mặt, không phải bàn chân): vải đen sát đó là cổ tay áo → lam
    yy = np.arange(S)[:, None] * np.ones((1, a.shape[1]))
    lab, n = ndimage.label(da)
    tay_da = np.zeros_like(da)
    for j in range(1, n + 1):
        mm = lab == j
        if np.nonzero(mm)[0].max() < yd + 9 * f:  # bàn chân (da ở ngón chân) nằm thấp dưới đai: không tính
            tay_da |= mm
    gan_tay = ndimage.binary_dilation(tay_da, iterations=max(2, int(round(2.5 * f))))
    duoi = (yy > yd) & ~gan_tay
    if tay:
        duoi[:] = False
    def ap(mask, ramp):
        lv = np.digitize(L, NGUONG[:3])  # 0..3
        for i in range(4):
            mm = mask & (lv == i)
            a[mm, :3] = ramp[i]
    if bo_qua is not None:  # điểm ảnh đầu Rowan vừa dán: không đổi màu
        do &= ~bo_qua
        den &= ~bo_qua
    vien = den & (L < 12)
    a[vien, :3] = VIEN
    ap(den & ~vien & ~duoi, AO)
    ap(den & ~vien & duoi, QUAN)
    lvd = np.digitize(L, [22, 34, 48])
    for i in range(4):
        a[do & (lvd == i), :3] = DA_THUOC[i]


MU = [H('#7A4A18'), H('#A86A22'), H('#E0A23A'), H('#F2C46A')]


def toc_thanh_mu(a, f):
    """Khung không thấy mặt: tóc đen phần trên → màu mũ trùm (nhìn từ sau lưng)."""
    al = a[..., 3] > 0
    ys = np.nonzero(al.any(1))[0]
    if not len(ys):
        return
    L = luma(a.astype(float))
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    den = al & (L < 70) & (np.abs(r - b) < 30)
    vung = np.zeros_like(al)
    vung[ys.min(): int(ys.min() + 14 * f)] = True
    m = den & vung
    lv = np.digitize(L, [14, 24])  # viền / bóng mũ / mũ (không dùng màu sáng nhất: đỡ trông như tóc vàng dựng)
    for i in range(3):
        a[m & (lv == i), :3] = MU[i] if i else VIEN


def doi_dau(a, f, D):
    """Thay đầu ninja bằng đầu Rowan trong ô a (RGBA). Trả mặt nạ các điểm đã dán."""
    cam, cx, mat = D
    dau, dcam, dcx = dau_co(f)
    al = a[..., 3] > 0
    L = luma(a.astype(float))
    r, b = a[..., 0].astype(int), a[..., 2].astype(int)
    toc = al & ((L < 75) & (np.abs(r - b) < 35) | da_mask(a))
    # tóc + mặt cũ: mọi điểm tối / da phía trên cằm, trong khoảng ngang quanh mặt; giữ bàn tay (da không dính mặt) và cổ tay áo sát nó
    S = a.shape[1]
    xx = np.arange(S)[None, :] * np.ones((a.shape[0], 1))
    xoa = toc.copy()
    xoa[int(cam) + 1:] = False
    xoa &= np.abs(xx - cx) < 24 * f
    m = da_mask(a)
    lab, n = ndimage.label(m)
    ids_mat = set(np.unique(lab[mat])) - {0}
    tay_da = m & ~np.isin(lab, list(ids_mat))
    tay_da = ndimage.binary_opening(tay_da) if tay_da.sum() > 6 else tay_da
    giu = ndimage.binary_dilation(tay_da, iterations=max(2, int(round(3 * f)))) & ~mat
    # tay giơ cao: giữ cả mảng (tay + ống tay) dính với bàn tay nằm trên đỉnh tóc
    xoa &= ~giu
    a[xoa] = 0
    # dán
    oy = int(round(cam - dcam))
    ox = int(round(cx - dcx))
    hh, ww = dau.shape[:2]
    dan = np.zeros(a.shape[:2], bool)
    for j in range(hh):
        y = oy + j
        if y < 0 or y >= a.shape[0]:
            continue
        for i in range(ww):
            x = ox + i
            if x < 0 or x >= a.shape[1] or dau[j, i, 3] == 0:
                continue
            a[y, x] = dau[j, i]
            dan[y, x] = True
    return dan


# Khung đặc biệt (hàng: {khung: cách}): lộn tròn → tóc thành mũ trùm (cuộn tròn nhìn thấy lưng mũ); nằm sấp (chết) → đầu xoay ngang
CACH = {3: {1: 'mu', 2: 'mu', 3: 'mu'}, 29: {1: 'mu', 2: 'mu', 3: 'mu'}, 5: {5: 'xoay', 6: 'xoay', 7: 'xoay'}}


def doi_dau_xoay(a, f, D):
    """Nằm sấp đầu hướng phải: xoá tóc + mặt quanh mặt, dán đầu Rowan xoay 90° (đỉnh mũ chỉ sang phải, mặt úp xuống)."""
    cam, cx, mat = D
    dau = np.rot90(dau_co(f)[0], -1)
    al = a[..., 3] > 0
    L = luma(a.astype(float))
    r, b = a[..., 0].astype(int), a[..., 2].astype(int)
    toc = al & ((L < 75) & (np.abs(r - b) < 35) | da_mask(a))
    ys, xs = np.nonzero(mat)
    x0, x1 = int(xs.min() - 6 * f), int(xs.max() + 16 * f)
    y0 = int(ys.min() - 16 * f)
    vung = np.zeros_like(al)
    vung[max(0, y0):int(cam) + 1, max(0, x0):x1] = True
    a[toc & vung] = 0
    hh, ww = dau.shape[:2]
    oy, ox = int(round(cam - hh + 1)), int(round(xs.mean() - ww * 0.45))
    dan = np.zeros(a.shape[:2], bool)
    for j in range(hh):
        for i in range(ww):
            y, x = oy + j, ox + i
            if 0 <= y < a.shape[0] and 0 <= x < a.shape[1] and dau[j, i, 3]:
                a[y, x] = dau[j, i]
                dan[y, x] = True
    return dan


def lam_o(a, f, tay=False, cach=None):
    """a: ô RGBA (numpy, sửa tại chỗ) của tấm cỡ 96×f. Trả 'dau' | 'mu' | '-'."""
    if not (a[..., 3] > 0).any():
        return '-'
    if tay:
        doi_than(a, f, True)
        return '-'
    D = do_khung(a, f) if cach != 'mu' else None
    if D is not None and cach == 'xoay':
        doi_than(a, f, False, doi_dau_xoay(a, f, D))
        return 'dau'

    dan = doi_dau(a, f, D) if D is not None else None
    if dan is not None:
        doi_than(a, f, False, dan)
        return 'dau'
    if cach != 'mu':
        dan = doi_dau_sau(a, f)
        if dan is not None:
            doi_than(a, f, False, dan)
            return 'sau'
    toc_thanh_mu(a, f)
    doi_than(a, f, False, None)
    return 'mu'


def main():
    xem = '--xem' in sys.argv
    src = json.load(open(os.path.join(CUSTOM, 'zed-moi.sprite.json'), encoding='utf-8'))
    dt = src['dong_tac']
    tay_hang = set()
    for v in dt.values():
        if 'hang_tay' in v:
            tay_hang.add(v['hang_tay'])
        if isinstance(v.get('nam'), dict) and 'hang_tay' in v['nam']:
            tay_hang.add(v['nam']['hang_tay'])
    T = np.array(b64png(src['tam']))
    nh, nc = T.shape[0] // 96, T.shape[1] // 96
    bao = {}
    for row in range(nh):
        for col in range(nc):
            o = T[row * 96:(row + 1) * 96, col * 96:(col + 1) * 96]
            bao[(row, col)] = lam_o(o, 1.0, row in tay_hang, CACH.get(row, {}).get(col))
    to = src['to']
    T2 = np.array(b64png(src['tam_to']))
    k, O = to['k'], to['o']
    for row in range(nh):
        for col in range(nc):
            j = to['o_cua'][row * to['cot_goc'] + col]
            if j is None or j < 0:
                continue
            x0, y0 = (j % to['cot']) * O, (j // to['cot']) * O
            lam_o(T2[y0:y0 + O, x0:x0 + O], k, row in tay_hang, CACH.get(row, {}).get(col))
    ra = {kk: v for kk, v in src.items() if kk not in ('tam_n3', 'tam_n4', 'to_n3', 'to_n4')}
    ra['ma'] = 'zed-rowan'
    ra['ten'] = 'Rowan (Talesworn) — thân bộ ninja đổi màu + đầu mũ trùm ChatGPT'
    ra['bo'] = 'rowan'
    ra['ghi_chu_rowan'] = 'Dựng bằng docs/anh-goc/zed/trang-phuc/bo-5-rowan/dung-rowan.py từ zed-moi (cùng ô, cùng neo); dùng chung bảng số của zed-moi.'
    ra['tam'] = png64(Image.fromarray(T))
    ra['tam_to'] = png64(Image.fromarray(T2))
    # khung thay ảnh (thương quét khung 6) trong game/js/thuong_cao_data.js → bản Rowan
    thay = {}
    js = open(os.path.join(GOC, 'game', 'js', 'thuong_cao_data.js'), encoding='utf-8').read()
    TC = json.loads(js[js.index('THUONG_CAO_DATA = ') + 18:js.rindex('}') + 1])
    for hang, R in TC['bo']['zed-moi'].items():
        for i, K in R['khung'].items():
            A = K.get('anh')
            if not A:
                continue
            moi = {'o_to': A.get('o_to', 116), 'k': A.get('k', 1.2)}
            for key, S, f in (('tam', 96, 1.0), ('to', A.get('o_to', 116), A.get('k', 1.2)), ('cu', 96, 1.0)):
                if key not in A:
                    continue
                im = np.array(b64png(A[key]))
                lam_o(im[:, :S], f, False)
                lam_o(im[:, S:2 * S], f, True)
                moi[key] = png64(Image.fromarray(im))
            thay[hang + '#' + i] = moi
    ra['anh_thay'] = thay
    with open(os.path.join(CUSTOM, 'zed-rowan.sprite.json'), 'w', encoding='utf-8') as fo:
        json.dump(ra, fo, ensure_ascii=False, separators=(',', ':'))
    hang_than = sorted(set(v['hang'] for v in dt.values()))
    dem = {}
    for (r_, c_), v in bao.items():
        if r_ in hang_than:
            dem[v] = dem.get(v, 0) + 1
    print('zed-rowan.sprite.json: %d KB; khung thân: %s' % (os.path.getsize(os.path.join(CUSTOM, 'zed-rowan.sprite.json')) // 1024, dem))
    khong = {}
    for kk, v in dt.items():
        hh = v['hang']
        s = ''.join({'dau': 'D', 'mu': 'm', 'sau': 'S', '-': '.'}[bao[(hh, c_)]] for c_ in range(v['so']))
        khong[kk] = s
    json.dump({'khung': khong}, open(os.path.join(DAY, 'bao-cao-khung.json'), 'w'), ensure_ascii=False, indent=0)
    if xem:
        os.makedirs(XEM, exist_ok=True)
        A0 = b64png(src['tam'])
        A1 = Image.fromarray(T)
        for ten, rows in (('dung-chay-kiem', [28, 34, 118, 119, 120]), ('lon-trung-chet', [29, 30, 5, 6, 26]), ('thuong-bua', [10, 11, 12, 13, 35, 18])):
            nen = (78, 102, 62, 255)
            w = 12 * 96
            out = Image.new('RGBA', (w, len(rows) * 96 * 2), nen)
            for j, rr in enumerate(rows):
                out.alpha_composite(A0.crop((0, rr * 96, w, rr * 96 + 96)), (0, j * 192))
                out.alpha_composite(A1.crop((0, rr * 96, w, rr * 96 + 96)), (0, j * 192 + 96))
            out.resize((out.width * 2, out.height * 2), Image.NEAREST).save(os.path.join(XEM, 'xem-truoc-' + ten + '.png'))


if __name__ == '__main__':
    main()
