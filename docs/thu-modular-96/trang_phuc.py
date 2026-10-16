"""Tách NỀN CƠ THỂ và TRANG PHỤC thay được (Cu Tí mới, hàng chạy 12 khung). Được tao-bo.py gọi.

Ý tưởng:
- Mỗi điểm ảnh của khung game thuộc đúng MỘT lớp "chủ" (nền hoặc đồ gốc). Ghép nền + đồ gốc = ảnh game.
- Nền cơ thể = đầu, tóc, hai tay, bàn chân, cổ (điểm ảnh gốc) + phần THÂN TRẦN dựng thêm (tô da / đồ lót)
  ở đúng hình bóng áo/quần gốc của từng khung, để thay đồ thì không lộ lỗ trong suốt.
  Phần dựng thêm chỉ nằm DƯỚI lớp đồ gốc (lớp đồ ở trên trong thứ tự vẽ) và chỉ ở chỗ đồ gốc đặc 100%,
  nên ghép với đồ gốc vẫn ra đúng từng điểm ảnh game (kể cả viền mờ).
- Đồ gốc: áo đen (torsoOutfit) + đai đỏ (belt) = bộ ÁO; quần ở hông (pants) + ống quần sau/trước (rearPants/frontPants) = bộ QUẦN.
- Đồ mới (máy vẽ từng khung, không xoay sprite): phủ kín hình bóng đồ gốc của khung đó.
"""
import numpy as np
from scipy import ndimage
import tach_lop as T

O = 96
# THỨ TỰ VẼ DUY NHẤT (ghi vào data.json → HTML đọc DATA.layerOrder)
LAYER_ORDER = ['rearLeg', 'rearPants', 'rearArm', 'backShoulderArmor', 'body', 'pants', 'torsoOutfit', 'belt',
               'chestArmor', 'frontLeg', 'frontPants', 'frontShoulderArmor', 'frontArm', 'frontShoulderArmorTop',
               'forearmArmor', 'head', 'hair']
NEN = ['rearLeg', 'rearArm', 'body', 'frontLeg', 'frontArm', 'head', 'hair']
SLOT = {'ao': ['torsoOutfit', 'belt'], 'quan': ['rearPants', 'pants', 'frontPants']}
DO = SLOT['ao'] + SLOT['quan']
GIAP = ['backShoulderArmor', 'chestArmor', 'frontShoulderArmor', 'frontShoulderArmorTop', 'forearmArmor']
IDX = {l: i for i, l in enumerate(LAYER_ORDER)}

# bảng màu
DA = [(92, 48, 34), (176, 104, 70), (214, 146, 104), (238, 186, 142)]   # viền, tối, vừa, sáng
LOT = [(70, 66, 66), (168, 160, 150), (206, 200, 190)]                  # đồ lót (khố vải): viền, tối, sáng
AO_MOI = [(22, 34, 66), (42, 72, 128), (68, 112, 178), (122, 168, 222)]
AO_TRIM = (236, 230, 208)
DAI_MOI = [(88, 50, 14), (166, 108, 30), (220, 168, 58), (250, 222, 122)]
QUAN_MOI = [(58, 40, 24), (124, 92, 56), (166, 128, 82), (204, 170, 120)]
XA_CAP = [(150, 140, 120), (226, 216, 190)]


def vien(m):
    tr = ndimage.binary_erosion(m, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]], border_value=0)
    return m & ~tr


def kc_chuoi(pts):
    yy, xx = np.mgrid[0:O, 0:O].astype(float)
    return T.kc_duong(xx, yy, [tuple(p) for p in pts])


def chu_so_huu(n96, gk, k):
    """Nhãn tách cũ (9 lớp) → chủ mới của từng điểm ảnh game. Trả dict lớp → mask (không chồng nhau)."""
    _, da, _ = T.mau(gk)
    op = gk[:, :, 3] > 0
    NH = T.NH
    own = {l: np.zeros((O, O), bool) for l in NEN + DO}
    for l in ('head', 'hair', 'frontArm', 'rearArm'):
        own[l] = n96 == NH[l]
    than = n96 == NH['body']
    own['body'] = than & da                    # da cổ
    own['torsoOutfit'] = than & ~da            # áo đen
    own['belt'] = n96 == NH['torsoOutfit']     # đai đỏ + dải bay
    own['pants'] = n96 == NH['pants']
    for ben, lop, quan in (('Front', 'frontLeg', 'frontPants'), ('Back', 'rearLeg', 'rearPants')):
        chan = n96 == NH[lop]
        d_ban = kc_chuoi([k['ankle' + ben], k['toe' + ben]])
        d_ong = kc_chuoi([k['hip' + ben], k['knee' + ben], k['ankle' + ben]])
        ban = chan & (da | (d_ban + 0.8 < d_ong))     # bàn chân + dép = nền
        own[lop] = ban
        own[quan] = chan & ~ban
    tong = sum(m.astype(int) for m in own.values())
    assert (tong[op] == 1).all() and (tong[~op] == 0).all(), 'chia chủ điểm ảnh bị chồng/thiếu'
    return own


def to_mau(m, nen_m, bang, mat_truoc=True):
    """Tô vùng m: viền ngoài (theo hình bóng nen_m) = bang[0], còn lại tối→sáng theo bề ngang (lưng → ngực)."""
    out = np.zeros((O, O, 4), np.uint8)
    v = vien(nen_m) & m
    for y in range(O):
        xs = np.nonzero(nen_m[y])[0]
        if xs.size == 0: continue
        a, b = xs.min(), xs.max()
        for x in np.nonzero(m[y])[0]:
            u = (x - a) / max(1, b - a)
            if not mat_truoc: u = 1 - u
            c = bang[1] if u < 0.3 else bang[2] if u < 0.75 else bang[-1]
            out[y, x] = c + (255,)
    out[v] = bang[0] + (255,)
    return out


def dung_nen(own, gk, k):
    """Phần thân trần dựng thêm cho body / rearLeg / frontLeg. Trả (vùng thân T, dict lớp → ảnh tô thêm, dict lớp → mask tô)."""
    dac = gk[:, :, 3] == 255
    d_than = kc_chuoi([k['neck'], k['hipCenter']])
    T_ = own['torsoOutfit'] | own['body'] | own['pants'] | (own['belt'] & (d_than <= 7.5))
    T_ = ndimage.binary_fill_holes(ndimage.binary_closing(T_, iterations=1) | T_)
    tren = lambda l: np.isin(chu_idx(own), [IDX[x] for x in LAYER_ORDER if IDX[x] > IDX[l]])
    fill, img = {}, {}
    # thân: dưới mọi lớp nằm trên body trong vùng thân
    fill['body'] = T_ & dac & tren('body') & ~own['body']
    for ben, lop, quan in (('Front', 'frontLeg', 'frontPants'), ('Back', 'rearLeg', 'rearPants')):
        d = kc_chuoi([k['hip' + ben], k['knee' + ben], k['ankle' + ben]])
        f = own[quan].copy()
        if lop == 'rearLeg': f |= own['belt'] & (d <= 4.0)        # dải đai bay đè lên chân sau
        fill[lop] = f & dac & tren(lop)
    yy = np.mgrid[0:O, 0:O][0]
    hip_y = k['hipCenter'][1]
    for l, m in fill.items():
        hinh = m | own[l]
        im = to_mau(m, hinh, DA)
        lot = m & (yy >= k['beltTop'][1] + 1) & (yy <= hip_y + 3)
        if l != 'body': lot = m & (yy <= hip_y + 3)
        if lot.any():
            im2 = to_mau(lot, hinh, [LOT[0], LOT[1], LOT[2], LOT[2]])
            im[lot] = im2[lot]
        img[l] = im
    return T_, img, fill


def chu_idx(own):
    out = np.full((O, O), -1)
    for l, m in own.items(): out[m] = IDX[l]
    return out


def muc_sang(gk, m, nguong):
    """Mức sáng 0..2 của điểm ảnh gốc (theo ngưỡng tính trên cả 12 khung)."""
    v = gk[:, :, :3].max(2).astype(float)
    return np.where(m, np.digitize(v, nguong), 1)


def ve_do_moi(own, gk, k, T_, nguong):
    """Bộ đồ mới khung này. Trả dict lớp → ảnh RGBA 96×96. Mỗi lớp phủ ⊇ hình bóng đồ gốc cùng lớp."""
    yy, xx = np.mgrid[0:O, 0:O]
    out = {}
    # --- ÁO chàm: phủ áo gốc + vạt áo dài xuống ngang hông (trùm phần quần ở hông)
    m = own['torsoOutfit'] | (T_ & (yy <= k['hipCenter'][1] + 1) & (yy > k['neck'][1]))
    im = to_mau(m, m, AO_MOI)
    lv = muc_sang(gk, own['torsoOutfit'], nguong['ao'])
    toi = own['torsoOutfit'] & (lv == 0) & ~vien(m)
    im[toi] = AO_MOI[1] + (255,)                  # giữ nếp gấp tối của áo gốc
    # cổ áo trắng: 1 hàng trên cùng của mỗi cột, chỉ nửa trước
    for x in np.unique(xx[m]):
        ys = np.nonzero(m[:, x])[0]
        if x >= k['neck'][0] - 4: im[ys.min(), x] = AO_TRIM + (255,)
    # nẹp áo chéo: từ cổ xuống eo phía ngực
    for t in np.linspace(0, 1, 24):
        x = int(round(k['neck'][0] + 1 - 4 * t)); y = int(round(k['neck'][1] + 2 + t * (k['beltTop'][1] - k['neck'][1] - 2)))
        if 0 <= x < O and 0 <= y < O and m[y, x] and not vien(m)[y, x]: im[y, x] = AO_TRIM + (255,)
    # vạt áo: viền dưới sáng
    for x in np.unique(xx[m]):
        ys = np.nonzero(m[:, x])[0]
        if ys.max() > k['beltTop'][1] + 2: im[ys.max(), x] = AO_MOI[0] + (255,)
    out['torsoOutfit'] = im
    # --- ĐAI vàng đồng: đúng hình đai gốc (cả 2 dải bay), sáng/tối theo đai gốc
    m = own['belt']
    lv = muc_sang(gk, m, nguong['dai'])
    im = np.zeros((O, O, 4), np.uint8)
    for c, val in ((DAI_MOI[1], 0), (DAI_MOI[2], 1), (DAI_MOI[3], 2)):
        im[m & (lv == val)] = c + (255,)
    im[vien(m) & (lv == 0)] = DAI_MOI[0] + (255,)
    out['belt'] = im
    # --- QUẦN kaki + xà cạp trắng ở ống chân
    for l, ben in (('pants', None), ('rearPants', 'Back'), ('frontPants', 'Front')):
        m = own[l]
        lv = muc_sang(gk, m, nguong['quan'])
        im = np.zeros((O, O, 4), np.uint8)
        for c, val in ((QUAN_MOI[1], 0), (QUAN_MOI[2], 1), (QUAN_MOI[3], 2)):
            im[m & (lv == val)] = c + (255,)
        if ben:
            kn, an = np.array(k['knee' + ben]), np.array(k['ankle' + ben])
            v = an - kn; L = max(np.hypot(*v), 1e-6)
            t = ((xx + 0.5 - kn[0]) * v[0] + (yy + 0.5 - kn[1]) * v[1]) / L      # điểm ảnh dọc ống chân
            bang = m & (t > 1.0) & (t < L + 1.5)
            im[bang & ((np.floor(t) % 3) != 2)] = XA_CAP[1] + (255,)
            im[bang & ((np.floor(t) % 3) == 2)] = XA_CAP[0] + (255,)
        im[vien(m)] = QUAN_MOI[0] + (255,)
        out[l] = im
    return out


def ghep(layers, order=LAYER_ORDER):
    """alpha-composite (source-over) đúng như canvas, trả RGBA uint8 + map lớp nằm trên cùng."""
    from PIL import Image
    nen = Image.new('RGBA', (O, O), (0, 0, 0, 0))
    top = np.full((O, O), -1)
    for l in order:
        a = layers.get(l)
        if a is None: continue
        nen.alpha_composite(Image.fromarray(np.ascontiguousarray(a)))
        top[a[:, :, 3] > 0] = IDX[l]
    return np.array(nen), top


def tach_vai_truoc(pad, own, k):
    """Giáp vai trước: phần nằm chỗ cẳng tay/nắm tay trước đi ngang qua → dưới tay; còn lại → trên bắp tay."""
    d_bap = kc_chuoi([k['shoulderFront'], k['elbowFront']])
    d_cang = kc_chuoi([k['elbowFront'], k['wristFront'], k['handFront']])
    duoi_tay = own['frontArm'] & (d_cang + 0.5 < d_bap)
    m = pad[:, :, 3] > 0
    a = np.zeros_like(pad); b = np.zeros_like(pad)
    a[m & duoi_tay] = pad[m & duoi_tay]
    b[m & ~duoi_tay] = pad[m & ~duoi_tay]
    return a, b
