"""Rig 'tay chân rời' dùng chung cho Nấm Mốc, Dơi Chuông, Mẹ Nấm Mốc (chép từ quái chuông gỗ + boss Chuông Gác Làng): cây nút cha–con, ma trận, vẽ một tư thế.

Hệ toạ độ thế giới = điểm ảnh của ảnh nguồn (1254×1254), gốc trái-trên, x sang phải, y XUỐNG.
Góc: độ, DƯƠNG = quay THUẬN chiều kim đồng hồ trên màn hình (giống ctx.rotate). Quái/boss quay mặt sang TRÁI
(−x), nên góc dương ở thân = ngả người RA SAU.

Mỗi nút: cha, diem_gan (vị trí pivot trong hệ toạ độ của cha ở dáng nghỉ), pivot (điểm trong ảnh mảnh mà nút
xoay quanh; nút rỗng không có ảnh), goc_nghi (= 0 cho mọi nút vì mảnh cắt thẳng từ ảnh nguồn ở dáng nghỉ).
Tư thế = với từng nút (đều tuỳ chọn):
  dich [dx, dy]  (px ảnh nguồn, trong hệ cha)   goc (độ, cộng vào goc_nghi)   ty [sx, sy] (co giãn quanh pivot)
  trang 0..1 (hoà về trắng – nháy trúng đòn)   toi 0..1 (làm tối)   mo 0..1 (độ đục)   hien (bật/tắt)
Biến đổi: W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc) · S(sx, sy). Ảnh mảnh vẽ sao cho pivot trùng gốc nút.
Lưu ý: S ở nút cha cũng co giãn con (con gắn vào cha) – chỉ dùng S ở nút lá hoặc biên độ nhỏ."""
import os
import numpy as np
from PIL import Image
from chung import duong_manh


def R(deg):
    t = np.deg2rad(deg)
    c, s = np.cos(t), np.sin(t)
    return np.array([[c, -s], [s, c]])


def M(tx, ty, deg, sx=1.0, sy=1.0):
    m = np.eye(3)
    m[:2, :2] = R(deg) @ np.diag([sx, sy])
    m[:2, 2] = (tx, ty)
    return m


def world_mats(rig, pose):
    nodes = rig['nut']
    out = {}

    def get(n):
        if n in out:
            return out[n]
        nd_ = nodes[n]
        d = pose.get(n, {})
        dx, dy = d.get('dich', (0, 0))
        sx, sy = d.get('ty', (1, 1))
        g = nd_.get('goc_nghi', 0) + d.get('goc', 0)
        gx, gy = nd_['diem_gan']
        local = M(gx + dx, gy + dy, g, sx, sy)
        m = local if nd_['cha'] is None else get(nd_['cha']) @ local
        out[n] = m
        return m
    for n in nodes:
        get(n)
    return out


def piece_matrix(nd_, W):
    """ma trận: toạ độ ảnh mảnh → thế giới"""
    px, py = nd_['pivot']
    return W @ np.array([[1, 0, -px], [0, 1, -py], [0, 0, 1.0]])


_cache = {}


def piece_img(rel):
    p = duong_manh(rel)
    if p not in _cache:
        a = np.array(Image.open(p).convert('RGBA')).astype(np.float32)
        al = a[..., 3:4] / 255.0
        _cache[p] = np.dstack([a[..., :3] * al, a[..., 3]])        # nhân trước alpha
    return _cache[p]


_edge = {}


def piece_edge(rel):
    """các điểm biên của bóng mảnh (toạ độ ảnh mảnh) – dùng tìm điểm thấp nhất (kiểm xuyên đất)."""
    if rel not in _edge:
        a = piece_img(rel)[..., 3] > 128
        e = a & ~(np.pad(a, 1)[2:, 1:-1] & np.pad(a, 1)[:-2, 1:-1] & np.pad(a, 1)[1:-1, 2:] & np.pad(a, 1)[1:-1, :-2])
        ys, xs = np.nonzero(e)
        _edge[rel] = np.stack([xs + 0.5, ys + 1.0, np.ones(len(xs))])
    return _edge[rel]


def is_visible(rig, pose, n):
    nd_ = rig['nut'][n]
    return pose.get(n, {}).get('hien', nd_.get('hien', True)) and 'anh' in nd_


def lowest_y(rig, pose, names=None, mats=None):
    """y thế giới thấp nhất (lớn nhất) của các mảnh đang hiện → {tên: y}."""
    mats = mats or world_mats(rig, pose)
    res = {}
    for n in rig['thu_tu_ve']:
        if (names and n not in names) or not is_visible(rig, pose, n):
            continue
        nd_ = rig['nut'][n]
        q = piece_matrix(nd_, mats[n]) @ piece_edge(nd_['anh'])
        res[n] = float(q[1].max())
    return res


def bbox_world(rig, pose):
    mats = world_mats(rig, pose)
    xs, ys = [], []
    for n in rig['thu_tu_ve']:
        if not is_visible(rig, pose, n) or pose.get(n, {}).get('mo', 1) <= 0:
            continue
        nd_ = rig['nut'][n]
        q = piece_matrix(nd_, mats[n]) @ piece_edge(nd_['anh'])
        xs += [q[0].min(), q[0].max()]
        ys += [q[1].min(), q[1].max()]
    return min(xs), min(ys), max(xs), max(ys)


def render(rig, pose, box, scale=1.0, ss=1, an=()):
    """Vẽ tư thế vào khung box=(x0,y0,x1,y1) (toạ độ thế giới), phóng 'scale'. ss = siêu lấy mẫu (vẽ ss× rồi lấy
    trung bình khối ss×ss trong không gian nhân-trước-alpha → thu nhỏ đúng, không viền tối). Trả PIL RGBA."""
    x0, y0, x1, y1 = box
    Wd, Hd = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    sc = scale * ss
    acc = np.zeros((Hd * ss, Wd * ss, 4), np.float32)
    mats = world_mats(rig, pose)
    V = np.array([[sc, 0, -x0 * sc], [0, sc, -y0 * sc], [0, 0, 1.0]])
    for n in rig['thu_tu_ve']:
        nd_ = rig['nut'][n]
        if not is_visible(rig, pose, n) or n in an:
            continue
        p = pose.get(n, {})
        mo = p.get('mo', 1.0)
        if mo <= 0:
            continue
        img = piece_img(nd_['anh'])
        F = V @ piece_matrix(nd_, mats[n])
        h, w = img.shape[:2]
        cn = F @ np.array([[0, w, 0, w], [0, 0, h, h], [1, 1, 1, 1.0]])
        bx0, by0 = max(int(np.floor(cn[0].min())) - 2, 0), max(int(np.floor(cn[1].min())) - 2, 0)
        bx1, by1 = min(int(np.ceil(cn[0].max())) + 2, Wd * ss), min(int(np.ceil(cn[1].max())) + 2, Hd * ss)
        if bx1 <= bx0 or by1 <= by0:
            continue
        inv = np.linalg.inv(np.array([[1, 0, -bx0], [0, 1, -by0], [0, 0, 1.0]]) @ F)
        coeffs = (inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2])
        ch = [np.array(Image.fromarray(img[..., c], 'F').transform((bx1 - bx0, by1 - by0), Image.AFFINE, coeffs,
                                                                     resample=Image.BICUBIC)) for c in range(4)]
        layer = np.clip(np.dstack(ch), 0, 255)
        layer[..., :3] = np.minimum(layer[..., :3], layer[..., 3:4])
        toi, trang = p.get('toi', 0.0), p.get('trang', 0.0)
        if toi:
            layer[..., :3] *= (1.0 - toi)
        if trang:
            layer[..., :3] += (layer[..., 3:4] - layer[..., :3]) * trang
        if mo < 1:
            layer *= mo
        la = layer[..., 3:4] / 255.0
        sub = acc[by0:by1, bx0:bx1]
        acc[by0:by1, bx0:bx1] = layer + sub * (1 - la)
    if ss > 1:
        acc = acc.reshape(Hd, ss, Wd, ss, 4).mean((1, 3))
    A = acc[..., 3:4]
    rgb = np.where(A > 0.5, acc[..., :3] / np.maximum(A, 1e-6) * 255.0, 0)
    out = np.dstack([rgb, A]).clip(0, 255).round().astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return Image.fromarray(out, 'RGBA')
