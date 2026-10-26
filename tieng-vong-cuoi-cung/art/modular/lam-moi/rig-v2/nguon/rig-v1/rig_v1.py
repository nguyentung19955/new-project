"""BẢN SAO rig.py của rig-v1 (chỉ dùng để vẽ lại 4 tư thế v1 khi so sánh với v2). Rig 'tay chân rời' của Lam: dựng cây xương từ dáng nghỉ đã khớp + hàm vẽ một tư thế.

Hệ toạ độ: đơn vị = điểm ảnh của 2-nhin-ngang.png (1254×1254), gốc trái-trên, x sang phải, y XUỐNG.
Góc: độ, DƯƠNG = quay THUẬN chiều kim đồng hồ trên màn hình. Lam quay mặt sang PHẢI (hướng chạy +x),
nên góc dương ở thân = chúi người về phía trước.

Mỗi nút: cha, diem_gan (vị trí pivot của nút trong hệ toạ độ cục bộ của cha, ở dáng nghỉ), pivot (điểm
trong ảnh mảnh mà nút xoay quanh; nút rỗng không có ảnh), goc_nghi. Tư thế = với từng nút: dich [dx, dy]
(trong hệ cha) và goc (cộng thêm vào goc_nghi). Biến đổi thế giới: W = W_cha · T(diem_gan + dich) · R(goc).
Ảnh mảnh được vẽ sao cho điểm pivot của nó trùng gốc của nút."""
import os
import json
import numpy as np
from PIL import Image
from chung import MANH, load_json

# Thứ tự vẽ: từ SAU ra TRƯỚC
THU_TU_VE = ['tay-sau', 'ung-xa', 'chop-mu', 'than', 'ung-gan', 'mu', 'mat-xa', 'mat-gan', 'chuong',
             'tay-truoc-dao']

# Điểm đặt bằng tay trên ảnh nhìn ngang (toạ độ ảnh ngang) – xem GHI-CHU.md
VAI_TRUOC = (865.0, 560.0)     # vai ẩn của tay trước: ở TRÊN nắm tay → tay vung theo cung gần như ngang
VAI_SAU = (400.0, 585.0)       # vai ẩn của tay sau (phía trên nắm tay sau)
CO = (655.0, 668.0)            # cổ: pivot của mũ (giữa mép dưới mũ, chỗ giáp capelet)


def R(deg):
    t = np.deg2rad(deg)
    c, s = np.cos(t), np.sin(t)
    return np.array([[c, -s], [s, c]])


def M(tx, ty, deg):
    m = np.eye(3)
    m[:2, :2] = R(deg)
    m[:2, 2] = (tx, ty)
    return m


def alpha_np(name):
    return np.array(Image.open(os.path.join(MANH, name + '.png')))[..., 3]


def _bbox(a, thr=128):
    ys, xs = np.nonzero(a > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def build_rig(ch):
    """ch = nội dung manh/goc/chuan-hoa.json. Trả dict rig (đưa vào lam-moi.json)."""
    # vị trí thế giới & góc của từng mảnh ở dáng nghỉ (đã khớp với ảnh ngang)
    def world_of(name, p_piece):
        v = ch[name]
        c = np.array(v['tam_moi'])
        return np.array(v['tam_tren_anh_ngang']) + R(v['goc_nghi']) @ (np.array(p_piece) - c)

    def to_piece(name, P_world):
        v = ch[name]
        c = np.array(v['tam_moi'])
        return c + R(-v['goc_nghi']) @ (np.array(P_world) - np.array(v['tam_tren_anh_ngang']))

    piv = {}
    # than: pivot = tâm hộp alpha của thân (nhún/nghiêng quanh 'bụng')
    x0, y0, x1, y1 = _bbox(alpha_np('than'))
    piv['than'] = [(x0 + x1) / 2, (y0 + y1) / 2 + 20]
    # ủng: pivot = giữa mép dưới đế
    for n in ('ung-gan', 'ung-xa'):
        x0, y0, x1, y1 = _bbox(alpha_np(n))
        piv[n] = [(x0 + x1) / 2, y1]
    # mũ: pivot = cổ
    piv['mu'] = list(to_piece('mu', CO))
    # chóp: pivot = trọng tâm phần gốc (đầu tròn, 30 % bên phải) – khuất sau mũ
    a = alpha_np('chop-mu') > 128
    xs = np.nonzero(a.any(0))[0]
    g = a.copy()
    g[:, :int(xs.max() - 0.30 * (xs.max() - xs.min()))] = False
    gy, gx = np.nonzero(g)
    piv['chop-mu'] = [float(gx.mean()), float(gy.mean())]
    # chuông: pivot = đỉnh quai
    x0, y0, x1, y1 = _bbox(alpha_np('chuong'))
    piv['chuong'] = [(x0 + x1) / 2, y0 + 4]
    # tay: pivot = tâm hộp (nắm tay); tay trước lấy tâm phần găng (40 % bên trái của mảnh có dao)
    x0, y0, x1, y1 = _bbox(alpha_np('tay-sau'))
    piv['tay-sau'] = [(x0 + x1) / 2, (y0 + y1) / 2]
    x0, y0, x1, y1 = _bbox(alpha_np('tay-truoc-dao'))
    piv['tay-truoc-dao'] = [x0 + 0.22 * (x1 - x0), (y0 + y1) / 2]
    # mắt: tâm
    for n in ('mat-gan', 'mat-xa'):
        piv[n] = list(np.array(ch[n]['tam_moi']))

    P = {n: world_of(n, piv[n]) for n in piv if n != 'mat-xa'}
    ang = {n: ch[n]['goc_nghi'] for n in P}
    # mắt xa: đặt lùi vào trong lòng mặt 62 px, ngang tầm mắt gần (ẩn ở nhìn ngang)
    P['mat-xa'] = P['mat-gan'] + np.array([-62.0, 2.0])
    ang['mat-xa'] = 0.0

    # gốc: điểm giữa hai ủng trên mặt đất
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
    nodes = {}
    for n, c in cha.items():
        if c is None:
            dg = P[n]
        else:
            dg = R(-ang[c]) @ (P[n] - P[c])
        nodes[n] = {'cha': c, 'diem_gan': [round(float(dg[0]), 2), round(float(dg[1]), 2)],
                    'goc_nghi': round(float(ang[n]), 2)}
        if n in piv:
            nodes[n]['anh'] = f'manh/{n}.png'
            nodes[n]['pivot'] = [round(float(piv[n][0]), 2), round(float(piv[n][1]), 2)]
            nodes[n]['hien'] = n != 'mat-xa'
    nodes['ung-gan']['cham_dat_tu_dong'] = True
    nodes['ung-xa']['cham_dat_tu_dong'] = True
    return {'nut': nodes, 'thu_tu_ve': THU_TU_VE, 'mat_dat_y': round(float(ground), 2),
            'goc_the_gioi': [round(float(G[0]), 2), round(float(G[1]), 2)]}


# ----------------------------------------------------------------- vẽ
_cache = {}


def piece_img(rel, rig_dir):
    p = os.path.join(rig_dir, rel)
    if p not in _cache:
        a = np.array(Image.open(p).convert('RGBA')).astype(np.float32)
        al = a[..., 3:4] / 255.0
        _cache[p] = np.dstack([a[..., :3] * al, a[..., 3]])     # premultiplied
    return _cache[p]


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


def snap_ground(rig, pose, mats, rig_dir):
    """Ủng có cham_dat=True trong tư thế: dịch dọc để điểm thấp nhất chạm đúng mặt đất."""
    ground = rig['mat_dat_y'] + pose.get('_mat_dat_dy', 0)
    changed = False
    for n in ('ung-gan', 'ung-xa'):
        d = pose.get(n, {})
        if not d.get('cham_dat'):
            continue
        nd_ = rig['nut'][n]
        img = piece_img(nd_['anh'], rig_dir)
        ys, xs = np.nonzero(img[..., 3] > 128)
        pts = np.stack([xs, ys + 1.0, np.ones_like(xs, dtype=float)])
        wpts = piece_matrix(nd_, mats[n]) @ pts
        low = wpts[1].max()
        d = dict(d)
        dich = list(d.get('dich', [0, 0]))
        dich[1] += ground - low
        d['dich'] = dich
        d['cham_dat'] = False
        pose[n] = d
        changed = True
    return changed


def render(rig, pose, box, scale=1.0, rig_dir=None, only=None):
    """Vẽ tư thế vào khung box=(x0,y0,x1,y1) (toạ độ thế giới), phóng 'scale'. Trả PIL RGBA."""
    from chung import RIG
    rig_dir = rig_dir or RIG
    pose = {k: dict(v) if isinstance(v, dict) else v for k, v in pose.items()}
    mats = world_mats(rig, pose)
    if snap_ground(rig, pose, mats, rig_dir):
        mats = world_mats(rig, pose)
    x0, y0, x1, y1 = box
    Wd, Hd = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    acc = np.zeros((Hd, Wd, 4), np.float32)
    V = np.array([[scale, 0, -x0 * scale], [0, scale, -y0 * scale], [0, 0, 1.0]])
    for n in rig['thu_tu_ve']:
        nd_ = rig['nut'][n]
        hien = pose.get(n, {}).get('hien', nd_.get('hien', True))
        if not hien or (only and n not in only):
            continue
        img = piece_img(nd_['anh'], rig_dir)
        F = V @ piece_matrix(nd_, mats[n])
        inv = np.linalg.inv(F)
        coeffs = (inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2])
        ch = [np.array(Image.fromarray(img[..., c], 'F').transform((Wd, Hd), Image.AFFINE, coeffs,
                                                                     resample=Image.BICUBIC))
              for c in range(4)]
        layer = np.clip(np.dstack(ch), 0, 255)
        la = layer[..., 3:4] / 255.0
        acc = layer + acc * (1 - la)
    A = acc[..., 3:4]
    rgb = np.where(A > 0.5, acc[..., :3] / np.maximum(A, 1e-6) * 255.0, 0)
    out = np.dstack([rgb, A]).clip(0, 255).round().astype(np.uint8)
    return Image.fromarray(out, 'RGBA'), pose


def world_points(rig, pose):
    """Vị trí thế giới các nút (để ghi số liệu / kiểm tra)."""
    mats = world_mats(rig, pose)
    return {n: [round(float(m[0, 2]), 1), round(float(m[1, 2]), 1)] for n, m in mats.items()}


def load_rig():
    return load_json()['rig']
