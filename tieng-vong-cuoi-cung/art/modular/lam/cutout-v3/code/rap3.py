"""Ráp Lam cutout v3 – CHỈ đọc metadata JSON + PNG mảnh (như runtime game sẽ làm).

Quy ước góc (ghi cả trong JSON, khoá "quy_uoc_goc"):
- Toạ độ ảnh/thế giới: x sang phải, y xuống. Góc tính bằng độ, DƯƠNG = quay theo chiều
  kim đồng hồ trên màn hình. 0° = hướng +x, 90° = hướng xuống.
- "huong_anh" của mảnh = hướng xương D−P trong ảnh (0 nếu mảnh không có xương).
- "goc_nghi" là góc TƯƠNG ĐỐI (cục bộ): hướng của mảnh so với hướng của cha
  (hướng = hướng xương nếu có D, ngược lại = trục x của ảnh). Gốc (than) so với trục x thế giới.
- Pose cộng thêm delta (độ) vào goc_nghi của từng mảnh: pose['goc'][ten] = delta.
- Ma trận: M_con = M_cha · T(gan) · R(goc_nghi + delta + huong_cha − huong_con) · S(ti_le) · T(−P)
  với gan = điểm gắn trên ẢNH của cha (px, chưa scale), P = điểm xoay trên ảnh của con.
v2 dùng góc TUYỆT ĐỐI thế giới cho chuỗi tay/chân (không cộng góc cha) → lean không kéo chi.
"""
import os, json, math
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))


def T_(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.]])


def R_(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])


def S_(k): return np.array([[k, 0, 0], [0, k, 0], [0, 0, 1.]])


def app(M, p): return (M @ np.array([p[0], p[1], 1.]))[:2]


class Rig:
    def __init__(s, json_path, manh_dir=None, images=None):
        s.meta = json.load(open(json_path, encoding='utf-8'))
        base = os.path.dirname(os.path.abspath(json_path))
        s.inst = s.meta['manh']
        s.img = {}
        if images is not None:
            s.img = images
        else:
            for n, d in s.inst.items():
                f = d['anh']
                if f not in s.img:
                    s.img[f] = Image.open(os.path.join(manh_dir or base, f)).convert('RGBA')
        # thứ tự duyệt: cha trước con
        s.order = []
        seen = set()
        def visit(n):
            if n in seen: return
            c = s.inst[n]['cha']
            if c: visit(c)
            seen.add(n); s.order.append(n)
        for n in s.inst: visit(n)

    # ---- góc cục bộ sau khi áp pose + chuyển động phụ ----
    def local_angles(s, pose=None):
        pose = pose or {}
        dg = dict(pose.get('goc', {}))
        out = {}
        for n in s.order:
            out[n] = s.inst[n]['goc_nghi'] + dg.get(n, 0.0)
        for ph in s.meta.get('phu', []):            # chuyển động phụ: con theo delta của nguồn
            src_d = dg.get(ph['theo'], 0.0)
            v = ph['he_so'] * src_d
            lo, hi = ph.get('gioi_han', [-999, 999])
            out[ph['manh']] += min(max(v, lo), hi)
        return out

    def matrices(s, pose=None):
        pose = pose or {}
        ang = s.local_angles(pose)
        M = {}
        for n in s.order:
            d = s.inst[n]
            hc = d.get('huong_anh', 0.0)
            k = d.get('ti_le', 1.0)
            if d['cha'] is None:
                root = pose.get('goc_toa_do', s.meta['goc']['vi_tri_nghi'])
                base = T_(*root)
                hp = 0.0
            else:
                base = M[d['cha']] @ T_(*d['gan'])
                hp = s.inst[d['cha']].get('huong_anh', 0.0)
            M[n] = base @ R_(ang[n] + hp - hc) @ S_(k) @ T_(-d['P'][0], -d['P'][1])
        return M, ang

    def slots(s, ang, pose=None):
        sl = {n: s.inst[n]['slot'] for n in s.inst}
        for r in s.meta.get('slot_theo_tu_the', []):
            v = s.bien(r['khi']['bien'], ang, pose)
            ok = True
            if 'lon_hon' in r['khi']: ok &= v > r['khi']['lon_hon']
            if 'nho_hon' in r['khi']: ok &= v < r['khi']['nho_hon']
            if ok:
                for n in r['manh']:
                    sl[n] = r['slot']
        return sl

    def bien(s, name, ang, pose=None):
        """Biến điều kiện: 'gap:<con>' = góc gập khớp (goc cục bộ của con, trị tuyệt đối);
        'goc:<manh>' = góc cục bộ; 'the_gioi:<manh>' = hướng thế giới của mảnh."""
        kind, n = name.split(':')
        if kind == 'goc': return ang[n]
        if kind == 'gap': return abs(ang[n])
        if kind == 'the_gioi':
            a = 0.0; m = n
            while m is not None:
                a += ang[m]; m = s.inst[m]['cha']
            return a
        raise KeyError(name)

    def layers(s, pose=None, only=None):
        M, ang = s.matrices(pose)
        sl = s.slots(ang, pose)
        names = sorted(s.inst, key=lambda n: (sl[n], s.order.index(n)))
        if only is not None:
            names = [n for n in names if n in only]
        return [(n, s.img[s.inst[n]['anh']], M[n]) for n in names]

    def world_point(s, name, p, pose=None):
        M, _ = s.matrices(pose)
        return app(M[name], p)


def put(cv, img, M, resample=Image.BICUBIC):
    Mi = np.linalg.inv(M)
    cv.alpha_composite(img.transform(cv.size, Image.AFFINE, tuple(Mi[:2].flatten()), resample))


def render(L, size=(520, 520), resample=Image.BICUBIC, offset=(0, 0), scale=1.0):
    """offset/scale: ánh xạ thế giới → canvas (đồng nhất 2 trục)."""
    cv = Image.new('RGBA', size, (0, 0, 0, 0))
    W = T_(*offset) @ S_(scale)
    for _, img, M in L:
        put(cv, img, W @ M, resample)
    return cv


def render_ids(L, size=(520, 520), offset=(0, 0), scale=1.0):
    """Bộ đệm ID: mỗi điểm = chỉ số lớp trên cùng có alpha>127 (−1 = nền). Dùng NEAREST."""
    ids = np.full((size[1], size[0]), -1, np.int32)
    W = T_(*offset) @ S_(scale)
    for i, (_, img, M) in enumerate(L):
        a = img.getchannel('A').point(lambda v: 255 if v > 127 else 0)
        Mi = np.linalg.inv(W @ M)
        t = np.array(a.transform(size, Image.AFFINE, tuple(Mi[:2].flatten()), Image.NEAREST)) > 127
        ids[t] = i
    return ids


def load_default():
    return Rig(os.path.join(HERE, '..', 'lam-v3.json'), os.path.join(HERE, '..', 'manh'))


if __name__ == '__main__':
    rig = load_default()
    m = Image.open(os.path.join(HERE, 'master-s.png')).convert('RGBA')
    cv = render(rig.layers())
    a = Image.new('RGBA', (520, 520), 'white'); a.alpha_composite(m)
    b = Image.new('RGBA', (520, 520), 'white'); b.alpha_composite(cv)
    o = Image.new('RGB', (1560, 520), 'white')
    o.paste(a.convert('RGB'), (0, 0)); o.paste(b.convert('RGB'), (520, 0))
    o.paste(Image.blend(a, b, .5).convert('RGB'), (1040, 0))
    out = os.path.join(HERE, '..', 'kiem-thu', 'rest3-nhanh.png'); o.save(out); print(out)
