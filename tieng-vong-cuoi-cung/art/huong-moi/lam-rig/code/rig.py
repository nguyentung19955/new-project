"""Rig Lam "Cổ tích chuông tàn": cây mảnh, điểm neo (pivot), ma trận, vẽ một tư thế ra ô sheet 2x.

Hệ toạ độ NGUỒN = điểm ảnh ảnh chốt 1254×1254 (mảnh lưu đúng chỗ của nó ở dáng nghỉ, manh.json).
GOC (gốc rig) = (615, 1185): x giữa hai ủng, y = mặt đất (ranh dưới hàng thấp nhất của đế).
Sheet 2x: dáng nghỉ cao 1107 px nguồn (đỉnh mũ y 78 → đất 1185) = 224 px sheet = 112 px logic.

Tư thế = {mảnh: [tx, ty, xoay°, sx, sy]} (cục bộ, quanh pivot của mảnh, so với cha) + 'goc': [dx, dy] dịch cả người
(trừ 2 ủng – ủng đặt theo đất, cha = gốc). xoay dương = theo chiều kim đồng hồ trên màn hình (y hướng xuống).
"""
import os
import math
import numpy as np
from PIL import Image
from chung import MANH, doc_json, mat, T, S, R

GOC = (615.0, 1185.0)
DINH_NGHI = 78.0
CAO_NGHI_NGUON = GOC[1] - DINH_NGHI           # 1107
K2 = 224.0 / CAO_NGHI_NGUON                    # px nguồn → px sheet 2x
K_LOGIC = K2 / 2                               # px nguồn → px logic
SS = 4                                         # vẽ siêu mẫu ×4 rồi gộp → mép mịn

THU_TU = ['gang-xa', 'ung-xa', 'vat-sau', 'than', 'ung-gan', 'vat-truoc', 'ao-vai', 'mu', 'chop', 'mat', 'chuong', 'dao',
          'gang-gan']
# cha + điểm neo (toạ độ nguồn, đo trên ảnh chốt). Neo chóp nằm trong lòng mũ (vùng chân chóp chồng lên mũ).
CAY = {
    'than':      (None,       (615, 1100)),     # hông-đất: nghiêng + co giãn thân quanh đây
    'vat-sau':   ('than',     (425, 975)),      # neo ẩn dưới mép thân
    'vat-truoc': ('than',     (720, 995)),      # neo ẩn ở mép trên (vùng mềm)
    'ao-vai':    ('than',     (600, 612)),      # cổ
    'mu':        ('than',     (645, 592)),      # cổ, dưới vành mũ
    'chop':      ('mu',       (528, 188)),      # trong lòng mũ, giữa đường chân chóp
    'mat':       ('mu',       (785, 468)),
    'chuong':    ('than',     (733, 620)),      # chỗ dây cổ nối vòng chuông
    'gang-gan':  ('than',     (616, 714)),      # vai gần (đỉnh tay áo, dưới áo choàng vai)
    'dao':       ('gang-gan', (678, 902)),      # giữa nắm tay (chuôi)
    'gang-xa':   ('than',     (560, 716)),      # vai xa
    'ung-gan':   (None,       (706, 1172)),     # giữa đế
    'ung-xa':    (None,       (566, 1172)),
}
LAM_TOI = {'gang-xa': 0.10, 'ung-xa': 0.10}    # mảnh phía xa tối 10 % (như rig-v4)
# điểm đo (toạ độ nguồn, thuộc mảnh)
DIEM = {'mui_dao': ('dao', (939.0, 949.0)), 'dinh_mu': ('mu', (545.0, 80.0)), 'mui_chop': ('chop', (302.0, 408.0)),
        'de_ung_gan': ('ung-gan', (706.0, 1184.0)), 'de_ung_xa': ('ung-xa', (566.0, 1184.0)),
        'mat': ('mat', (785.0, 468.0)), 'gay_mu': ('mu', (420.0, 520.0))}


def tu_the_nghi():
    p = {k: [0.0, 0.0, 0.0, 1.0, 1.0] for k in CAY}
    p['goc'] = [0.0, 0.0]
    return p


def local(ten, v):
    px, py = CAY[ten][1]
    tx, ty, rot, sx, sy = v
    return T(px + tx, py + ty) @ mat(rot=rot, sx=sx, sy=sy) @ T(-px, -py)


def the_gioi(pose, M_goc):
    """ma trận toạ độ nguồn → toạ độ đích cho từng mảnh."""
    out = {}
    dx, dy = pose.get('goc', [0, 0])
    Mthan_goc = M_goc @ T(dx, dy)

    def get(ten):
        if ten in out:
            return out[ten]
        cha = CAY[ten][0]
        if cha is None:
            base = M_goc if ten.startswith('ung') else Mthan_goc
        else:
            base = get(cha)
        out[ten] = base @ local(ten, pose[ten])
        return out[ten]
    for t in CAY:
        get(t)
    return out


def M_o(neo_o, zoom=1.0):
    """toạ độ nguồn → toạ độ ô sheet 2x (neo_o = vị trí gốc rig trong ô); zoom > 1 = ảnh lớn hơn sheet."""
    return T(neo_o[0], neo_o[1]) @ S(K2 * zoom) @ T(-GOC[0], -GOC[1])


def diem(pose, M_goc, ten):
    m, (x, y) = DIEM[ten]
    W = the_gioi(pose, M_goc)[m]
    v = W @ np.array([x, y, 1.0])
    return float(v[0]), float(v[1])


class Rig:
    def __init__(self, zoom=1.0):
        self.meta = doc_json(os.path.join(MANH, 'manh.json'))
        self.zoom = zoom
        self.f = min(1.0, K2 * zoom * SS)
        self.img = {}
        for ten in THU_TU:
            im = Image.open(os.path.join(MANH, ten + '.png')).convert('RGBA')
            a = np.asarray(im).astype(np.float32)
            if ten in LAM_TOI:
                a[..., :3] *= 1 - LAM_TOI[ten]
            a[..., :3] *= a[..., 3:4] / 255
            pm = Image.fromarray(a.round().clip(0, 255).astype(np.uint8), 'RGBA')
            w, h = pm.size
            nw, nh = max(1, round(w * self.f)), max(1, round(h * self.f))
            self.img[ten] = (pm.resize((nw, nh), Image.LANCZOS), self.meta[ten]['goc_tren_trai'], (w / nw, h / nh))

    def hop(self, pose, M_goc=None):
        if M_goc is None:
            M_goc = M_o((0, 0), self.zoom)
        """hộp bao (đích) của mọi mảnh."""
        W = the_gioi(pose, M_goc)
        xs, ys = [], []
        for ten in THU_TU:
            x0, y0 = self.meta[ten]['goc_tren_trai']
            w, h = self.meta[ten]['co']
            for cx, cy in ((x0, y0), (x0 + w, y0), (x0, y0 + h), (x0 + w, y0 + h)):
                v = W[ten] @ np.array([cx, cy, 1.0])
                xs.append(v[0])
                ys.append(v[1])
        return min(xs), min(ys), max(xs), max(ys)

    def ve(self, pose, co_o, neo_o, thu_tu=None, an=()):
        """vẽ tư thế ra ảnh RGBA cỡ co_o (sheet 2x × zoom), gốc rig tại neo_o. Trả PIL RGBA (alpha thẳng)."""
        Mg = M_o(neo_o, self.zoom)
        W = the_gioi(pose, Mg)
        cw, ch = co_o
        acc = np.zeros((ch * SS, cw * SS, 4), np.float32)
        for ten in (thu_tu or THU_TU):
            if ten in an:
                continue
            pm, (x0, y0), (rx, ry) = self.img[ten]
            Mi = S(SS) @ W[ten] @ T(x0, y0) @ S(rx, ry)
            inv = np.linalg.inv(Mi)
            layer = pm.transform((cw * SS, ch * SS), Image.AFFINE, tuple(inv[:2].ravel()), resample=Image.BILINEAR)
            src = np.asarray(layer).astype(np.float32) / 255
            acc = src + acc * (1 - src[..., 3:4])
        acc = acc.reshape(ch, SS, cw, SS, 4).mean((1, 3))
        a = acc[..., 3:4]
        rgb = np.where(a > 1e-4, acc[..., :3] / np.maximum(a, 1e-4), 0)
        out = np.concatenate([rgb, a], -1)
        out = (out * 255).round().clip(0, 255).astype(np.uint8)
        out[out[..., 3] == 0] = 0
        return Image.fromarray(out, 'RGBA')


def tron_tu_the(a, b, u):
    """nội suy tuyến tính 2 tư thế (dùng cho GIF lấy mẫu lệch tick)."""
    out = {}
    for k in a:
        out[k] = [x + (y - x) * u for x, y in zip(a[k], b[k])]
    return out
