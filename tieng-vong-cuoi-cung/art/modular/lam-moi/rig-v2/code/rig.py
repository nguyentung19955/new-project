"""Rig 'tay chân rời' của Lam – v2: dựng cây xương từ dáng nghỉ đã khớp + hàm vẽ một tư thế.

Hệ toạ độ: đơn vị = điểm ảnh của 2-nhin-ngang.png (1254×1254), gốc trái-trên, x sang phải, y XUỐNG.
Góc: độ, DƯƠNG = quay THUẬN chiều kim đồng hồ trên màn hình. Lam quay mặt sang PHẢI (hướng chạy +x),
nên góc dương ở thân = chúi người về phía trước.

Mỗi nút: cha, diem_gan (vị trí pivot của nút trong hệ toạ độ cục bộ của cha, ở dáng gốc), pivot (điểm
trong ảnh mảnh mà nút xoay quanh; nút rỗng không có ảnh), goc_nghi. Tư thế = với từng nút: dich [dx, dy]
(trong hệ cha) và goc (cộng thêm vào goc_nghi). Biến đổi thế giới: W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc).
Ảnh mảnh được vẽ sao cho điểm pivot của nó trùng gốc của nút.

Khác v1:
- Có thêm lớp 'mu-gay' (gáy mũ, cùng biến đổi với mũ, vẽ SAU chóp) – xem sua_mu.py.
- Ủng: pivot = giữa đế (đáy bóng), goc_nghi = 0 nghĩa là ĐẾ NẰM PHẲNG. Hai ủng định nghĩa neo giống hệt nhau.
  Độ cao ủng tính theo khe hở điểm thấp nhất ↔ đất (hàm dat_ung) → ủng chịu lực chạm đất đúng 0 px.
- Gốc (root) cố định: không nhấc cả người; nhún/bay là dịch của thân."""
import os
import numpy as np
from PIL import Image
from chung import MANH, load_json

# Thứ tự vẽ: từ SAU ra TRƯỚC
THU_TU_VE = ['tay-sau', 'ung-xa', 'mu-gay', 'chop-mu', 'than', 'ung-gan', 'mu', 'mat-xa', 'mat-gan', 'chuong',
             'tay-truoc-dao']

# Điểm đặt bằng tay trên ảnh nhìn ngang (toạ độ ảnh ngang) – xem GHI-CHU.md
VAI_TRUOC = (865.0, 560.0)     # vai ẩn của tay trước: ở TRÊN nắm tay → tay vung theo cung gần như ngang
VAI_SAU = (400.0, 585.0)       # vai ẩn của tay sau (phía trên nắm tay sau)
CO = (655.0, 668.0)            # cổ: pivot của mũ (giữa mép dưới mũ, chỗ giáp capelet)
# chóp xoay quanh chỗ giáp mặt dưới chóp ↔ gáy mũ (đầu dưới nếp gấp). v1 xoay quanh đầu tròn gốc chóp → khi chóp
# hất lên, mặt dưới chóp tách khỏi gáy thành khe trắng hẹp. Đo khe ở chóp +7°: v1-kiểu 572 px → điểm này 26 px.
CHOP_PIVOT = (430.0, 360.0)


def R(deg):
    t = np.deg2rad(deg)
    c, s = np.cos(t), np.sin(t)
    return np.array([[c, -s], [s, c]])


def M(tx, ty, deg):
    m = np.eye(3)
    m[:2, :2] = R(deg)
    m[:2, 2] = (tx, ty)
    return m


def alpha_np(name, manh_dir=MANH):
    return np.array(Image.open(os.path.join(manh_dir, name + '.png')))[..., 3]


def _bbox(a, thr=128):
    ys, xs = np.nonzero(a > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def build_rig(ch):
    """ch = nội dung manh/goc/chuan-hoa.json (đã qua sua_mu.py). Trả dict rig (đưa vào lam-moi-v2.json)."""
    def world_of(name, p_piece):
        v = ch[name]
        c = np.array(v['tam_moi'])
        return np.array(v['tam_tren_anh_ngang']) + R(v['goc_nghi']) @ (np.array(p_piece) - c)

    def to_piece(name, P_world):
        v = ch[name]
        c = np.array(v['tam_moi'])
        return c + R(-v['goc_nghi']) @ (np.array(P_world) - np.array(v['tam_tren_anh_ngang']))

    piv = {}
    x0, y0, x1, y1 = _bbox(alpha_np('than'))
    piv['than'] = [(x0 + x1) / 2, (y0 + y1) / 2 + 20]
    dai_de = {}
    for n in ('ung-gan', 'ung-xa'):
        x0, y0, x1, y1 = _bbox(alpha_np(n))
        piv[n] = [(x0 + x1) / 2, float(y1)]                 # giữa đế, đúng mép dưới bóng
        dai_de[n] = [int(x1 - x0), int(y1 - y0)]
    piv['mu'] = list(to_piece('mu', CO))
    if 'mu-gay' in ch:
        piv['mu-gay'] = list(piv['mu'])
    piv['chop-mu'] = list(to_piece('chop-mu', CHOP_PIVOT))
    x0, y0, x1, y1 = _bbox(alpha_np('chuong'))
    piv['chuong'] = [(x0 + x1) / 2, y0 + 4]
    x0, y0, x1, y1 = _bbox(alpha_np('tay-sau'))
    piv['tay-sau'] = [(x0 + x1) / 2, (y0 + y1) / 2]
    x0, y0, x1, y1 = _bbox(alpha_np('tay-truoc-dao'))
    piv['tay-truoc-dao'] = [x0 + 0.22 * (x1 - x0), (y0 + y1) / 2]
    for n in ('mat-gan', 'mat-xa'):
        piv[n] = list(np.array(ch[n]['tam_moi']))

    P = {n: world_of(n, piv[n]) for n in piv if n not in ('mat-xa', 'mu-gay')}
    ang = {n: ch[n]['goc_nghi'] for n in P}
    P['mat-xa'] = P['mat-gan'] + np.array([-62.0, 2.0])
    ang['mat-xa'] = 0.0
    if 'mu-gay' in ch:
        P['mu-gay'] = P['mu'].copy()
        ang['mu-gay'] = ang['mu']
    # ủng: góc nghỉ = 0 (đế phẳng); góc đo trên ảnh ngang thành tư thế 'nghi'
    goc_ung_nghi = {n: float(ang[n]) for n in ('ung-gan', 'ung-xa')}
    ang['ung-gan'] = ang['ung-xa'] = 0.0

    ground = max(P['ung-gan'][1], P['ung-xa'][1])
    G = np.array([(P['ung-gan'][0] + P['ung-xa'][0]) / 2, ground])
    P['goc'] = G
    ang['goc'] = 0.0
    P['vai-truoc'] = np.array(VAI_TRUOC)
    P['vai-sau'] = np.array(VAI_SAU)
    ang['vai-truoc'] = ang['vai-sau'] = 0.0

    cha = {'goc': None, 'than': 'goc', 'ung-gan': 'goc', 'ung-xa': 'goc', 'mu': 'than', 'chop-mu': 'mu',
           'mat-gan': 'mu', 'mat-xa': 'mu', 'chuong': 'than', 'vai-truoc': 'than', 'vai-sau': 'than',
           'tay-truoc-dao': 'vai-truoc', 'tay-sau': 'vai-sau'}
    if 'mu-gay' in ch:
        cha['mu-gay'] = 'mu'
    nodes = {}
    for n, c in cha.items():
        if c is None:
            dg = P[n]
        else:
            dg = R(-ang[c]) @ (P[n] - P[c])
        goc_n = ang[n] - (ang[c] if c is not None else 0.0)     # (v1 ghi góc tuyệt đối → lệch ≤1° ở chóp/mắt)
        nodes[n] = {'cha': c, 'diem_gan': [round(float(dg[0]), 2), round(float(dg[1]), 2)],
                    'goc_nghi': round(float(goc_n), 2)}
        if n in piv:
            nodes[n]['anh'] = f'manh/{n}.png'
            nodes[n]['pivot'] = [round(float(piv[n][0]), 2), round(float(piv[n][1]), 2)]
            nodes[n]['hien'] = n != 'mat-xa'
    for n in ('ung-gan', 'ung-xa'):
        nodes[n]['bong_rong_cao_px'] = dai_de[n]
    if 'mu-gay' in nodes:
        nodes['mu-gay']['ghi_chu'] = 'lớp gáy mũ: cùng biến đổi với mũ, vẽ sau chóp; chỉ lộ ra khi chóp lắc'
    rig = {'nut': nodes, 'thu_tu_ve': [n for n in THU_TU_VE if n in nodes], 'mat_dat_y': round(float(ground), 2),
           'goc_the_gioi': [round(float(G[0]), 2), round(float(G[1]), 2)]}
    nghi = {n: {'goc': round(goc_ung_nghi[n], 2)} for n in ('ung-gan', 'ung-xa')}
    return rig, nghi


def dat_goc_xuong_dat(rig, ground):
    """Dời gốc (root) xuống đúng mặt đất 'ground' (giữ nguyên vị trí thế giới mọi nút)."""
    G = rig['goc_the_gioi']
    d = ground - G[1]
    rig['nut']['goc']['diem_gan'][1] = round(float(ground), 2)
    for n, v in rig['nut'].items():
        if v['cha'] == 'goc':
            v['diem_gan'][1] = round(v['diem_gan'][1] - d, 2)
    rig['goc_the_gioi'] = [G[0], round(float(ground), 2)]
    rig['mat_dat_y'] = round(float(ground), 2)


# ----------------------------------------------------------------- ủng: đặt theo (x, nhấc, góc)
_de = {}


def diem_de(rig, ten, rig_dir=None):
    """Các điểm biên dưới của bóng ủng (toạ độ so với pivot giữa đế) – dùng tìm điểm thấp nhất."""
    from chung import RIG
    key = (ten, rig_dir or RIG)
    if key not in _de:
        nd_ = rig['nut'][ten]
        a = np.array(Image.open(os.path.join(rig_dir or RIG, nd_['anh'])))[..., 3] > 128
        edge = a & ~np.pad(a, 1)[2:, 1:-1]                       # điểm có ô ngay dưới trống
        ys, xs = np.nonzero(edge)
        _de[key] = np.stack([xs + 0.5 - nd_['pivot'][0], ys + 1.0 - nd_['pivot'][1]])
    return _de[key]


def tiep_dat(rig, ten, goc):
    """Ủng xoay 'goc' quanh pivot: trả (h, c) – h = điểm thấp nhất nằm dưới pivot bao nhiêu px,
    c = điểm đó (toạ độ so với pivot, CHƯA xoay) = điểm vật chất đang chạm đất."""
    p = diem_de(rig, ten)
    q = R(goc) @ p
    i = int(np.argmax(q[1]))
    return float(q[1, i]), p[:, i]


def dat_ung(rig, ten, x, nhac, goc):
    """x = vị trí ngang của pivot (giữa đế) so với gốc; nhac = khe hở giữa điểm THẤP NHẤT của ủng và mặt đất
    (px, + = lên; 0 = đang chạm đất); goc = độ nghiêng (− mũi hếch, + gót nhấc), xoay quanh pivot.
    Trả {'dich', 'goc'} cho nút ủng (cha = gốc, không xoay). Đế cong (đế 'lắc') → khi chạm đất ủng LĂN:
    điểm chạm đi dần từ gót ra mũi; chu_ky.py tính x khi chịu lực sao cho điểm chạm không trượt."""
    nd_ = rig['nut'][ten]
    gx, gy = rig['nut']['goc']['diem_gan']
    h, _ = tiep_dat(rig, ten, goc)
    P = np.array([gx + x, rig['mat_dat_y'] - h - nhac])
    dich = P - np.array([gx, gy]) - np.array(nd_['diem_gan'])
    return {'dich': [float(dich[0]), float(dich[1])], 'goc': float(goc)}


# ----------------------------------------------------------------- vẽ
_cache = {}


def piece_img(rel, rig_dir, toi=0.0):
    p = os.path.join(rig_dir, rel)
    key = (p, round(toi, 4))
    if key not in _cache:
        a = np.array(Image.open(p).convert('RGBA')).astype(np.float32)
        if toi:
            a[..., :3] *= (1.0 - toi)
        al = a[..., 3:4] / 255.0
        _cache[key] = np.dstack([a[..., :3] * al, a[..., 3]])     # premultiplied
    return _cache[key]


def world_mats(rig, pose):
    nodes = rig['nut']
    out = {}

    def get(n):
        if n in out:
            return out[n]
        nd_ = nodes[n]
        d = pose.get(n, {})
        dx, dy = d.get('dich', [0, 0])
        g = nd_['goc_nghi'] + d.get('goc', 0)
        gx, gy = nd_['diem_gan']
        local = M(gx + dx, gy + dy, g)
        m = local if nd_['cha'] is None else get(nd_['cha']) @ local
        out[n] = m
        return m
    for n in nodes:
        get(n)
    return out


def piece_matrix(nd_, W):
    """ma trận từ toạ độ ảnh mảnh → thế giới"""
    px, py = nd_['pivot']
    return W @ np.array([[1, 0, -px], [0, 1, -py], [0, 0, 1.0]])


def render(rig, pose, box, scale=1.0, rig_dir=None, only=None, toi=None, an=()):
    """Vẽ tư thế vào khung box=(x0,y0,x1,y1) (toạ độ thế giới), phóng 'scale'. Trả PIL RGBA.
    toi = {tên mảnh: tỉ lệ làm tối}, an = các mảnh không vẽ."""
    from chung import RIG
    rig_dir = rig_dir or RIG
    toi = toi or {}
    mats = world_mats(rig, pose)
    x0, y0, x1, y1 = box
    Wd, Hd = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    acc = np.zeros((Hd, Wd, 4), np.float32)
    V = np.array([[scale, 0, -x0 * scale], [0, scale, -y0 * scale], [0, 0, 1.0]])
    for n in rig['thu_tu_ve']:
        nd_ = rig['nut'][n]
        hien = pose.get(n, {}).get('hien', nd_.get('hien', True))
        if not hien or (only and n not in only) or n in an:
            continue
        img = piece_img(nd_['anh'], rig_dir, toi.get(n, 0.0))
        F = V @ piece_matrix(nd_, mats[n])
        # chỉ biến đổi trong hộp bao của mảnh trên khung đích (nhanh hơn nhiều)
        h, w = img.shape[:2]
        cn = F @ np.array([[0, w, 0, w], [0, 0, h, h], [1, 1, 1, 1.0]])
        bx0, by0 = max(int(np.floor(cn[0].min())) - 2, 0), max(int(np.floor(cn[1].min())) - 2, 0)
        bx1, by1 = min(int(np.ceil(cn[0].max())) + 2, Wd), min(int(np.ceil(cn[1].max())) + 2, Hd)
        if bx1 <= bx0 or by1 <= by0:
            continue
        inv = np.linalg.inv(np.array([[1, 0, -bx0], [0, 1, -by0], [0, 0, 1.0]]) @ F)
        coeffs = (inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2])
        ch = [np.array(Image.fromarray(img[..., c], 'F').transform((bx1 - bx0, by1 - by0), Image.AFFINE, coeffs,
                                                                     resample=Image.BICUBIC))
              for c in range(4)]
        layer = np.clip(np.dstack(ch), 0, 255)
        la = layer[..., 3:4] / 255.0
        sub = acc[by0:by1, bx0:bx1]
        acc[by0:by1, bx0:bx1] = layer + sub * (1 - la)
    A = acc[..., 3:4]
    rgb = np.where(A > 0.5, acc[..., :3] / np.maximum(A, 1e-6) * 255.0, 0)
    out = np.dstack([rgb, A]).clip(0, 255).round().astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def diem_the_gioi(rig, pose, ten, p_piece):
    """toạ độ thế giới của điểm p_piece (px trong ảnh mảnh) của nút ten."""
    W = piece_matrix(rig['nut'][ten], world_mats(rig, pose)[ten])
    q = W @ np.array([p_piece[0], p_piece[1], 1.0])
    return q[:2]


def world_points(rig, pose):
    mats = world_mats(rig, pose)
    return {n: [round(float(m[0, 2]), 1), round(float(m[1, 2]), 1)] for n, m in mats.items()}


def load_rig(path=None):
    return load_json(path)['rig'] if path else load_json()['rig']
