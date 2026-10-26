"""Ráp Lam cutout v4 – CHỈ đọc metadata JSON + PNG mảnh (như runtime game sẽ làm).

Quy ước góc (ghi cả trong JSON, khoá "quy_uoc_goc"):
- Toạ độ ảnh/thế giới: x sang phải, y xuống. Góc độ, DƯƠNG = chiều kim đồng hồ trên màn hình,
  0° = +x, 90° = xuống.
- "huong_anh" = hướng xương D−P trong ảnh (0 nếu mảnh không có xương).
- "goc_nghi" là góc TƯƠNG ĐỐI (cục bộ): hướng mảnh so với hướng cha (hướng = hướng xương nếu có D,
  ngược lại trục x ảnh). Gốc (than) so với trục x thế giới.
- Pose: pose['goc'][ten] = delta (độ) cộng vào goc_nghi; pose['goc_toa_do'] = [x, y] vị trí P thân;
  pose['hien'][ten] = True/False ghi đè visible; pose['khoa_chan'] = {chuoi: dich} (foot lock, xem solve_ik).
- Ma trận: M_con = M_cha · T(gan) · R(goc + huong_cha − huong_con) · S(ti_le) · T(−P).

Thứ tự xử lý một khung hình (giống JSON "thu_tu_xu_ly"):
  1) góc cục bộ = goc_nghi + delta pose   2) chuyển động phụ `phu` (bù góc TĨNH theo delta nguồn)
  3) ma trận FK từ gốc (root + lean)       4) IK hai đoạn cho chuỗi bị khoá (ghi đè góc đùi/cẳng/ủng, trộn mix)
  5) slot theo tư thế (đánh giá trên góc SAU IK) 6) sắp lớp (slot, thu_tu_phu, tên) 7) bỏ mảnh visible=false, vẽ.

visible=false CHỈ bỏ việc vẽ chính mảnh đó; ma trận vẫn tính, con của nó vẫn vẽ bình thường.
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


def rot_of(M): return math.degrees(math.atan2(M[1, 0], M[0, 0]))


def wrap(a):
    return (a + 180.0) % 360.0 - 180.0


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
        s.order = []
        seen = set()

        def visit(n, stack=()):
            if n in seen:
                return
            if n in stack:
                raise ValueError('chu trình cha–con tại ' + n)
            c = s.inst[n]['cha']
            if c:
                visit(c, stack + (n,))
            seen.add(n); s.order.append(n)
        for n in s.inst:
            visit(n)
        s.ik = {c['ten']: c for c in s.meta.get('ik', [])}
        s.last_ik = {}

    # ---- góc cục bộ sau khi áp pose + chuyển động phụ ----
    def local_angles(s, pose=None):
        pose = pose or {}
        dg = dict(pose.get('goc', {}))
        out = {n: s.inst[n]['goc_nghi'] + dg.get(n, 0.0) for n in s.order}
        for ph in s.meta.get('phu', []):      # bù góc tĩnh: con += he_so × delta nguồn (kẹp giới hạn)
            v = ph['he_so'] * dg.get(ph['theo'], 0.0)
            lo, hi = ph.get('gioi_han', [-999, 999])
            out[ph['manh']] += min(max(v, lo), hi)
        return out

    def _fk(s, ang, pose):
        M = {}
        for n in s.order:
            d = s.inst[n]
            hc = d.get('huong_anh', 0.0)
            k = d.get('ti_le', 1.0)
            if d['cha'] is None:
                root = pose.get('goc_toa_do', s.meta['goc']['vi_tri_nghi'])
                base = T_(*root); hp = 0.0
            else:
                base = M[d['cha']] @ T_(*d['gan'])
                hp = s.inst[d['cha']].get('huong_anh', 0.0)
            M[n] = base @ R_(ang[n] + hp - hc) @ S_(k) @ T_(-d['P'][0], -d['P'][1])
        return M

    def world_dir(s, M, n):
        """Hướng thế giới của mảnh (hướng xương nếu có D, ngược lại trục x ảnh)."""
        return rot_of(M[n]) + s.inst[n].get('huong_anh', 0.0)

    def matrices(s, pose=None):
        pose = pose or {}
        ang = s.local_angles(pose)
        M = s._fk(ang, pose)
        locks = pose.get('khoa_chan') or {}
        s.last_ik = {}
        if locks:
            ang, M = s.solve_ik(ang, M, pose, locks)
        return M, ang

    # ---- IK hai đoạn + khoá chân ----
    def contact_world(s, ch, M):
        c = s.ik[ch]; b = c['xuong'][2]
        return app(M[b], c['diem_de'])

    def ankle_target(s, ch, de_world, boot_dir):
        """Từ điểm đế (thế giới) + hướng thế giới của ủng → vị trí cổ chân (P ủng) cần đạt."""
        c = s.ik[ch]; b = c['xuong'][2]; d = s.inst[b]
        th = boot_dir - d.get('huong_anh', 0.0)
        v = np.subtract(c['diem_de'], d['P'])
        cs, sn = math.cos(math.radians(th)), math.sin(math.radians(th))
        return np.array(de_world, float) - np.array([cs * v[0] - sn * v[1], sn * v[0] + cs * v[1]])

    def solve_ik(s, ang, M, pose, locks):
        """locks[ch] = dict(de=[x,y] điểm đế thế giới, huong_ung=độ thế giới, mix=0..1).
        Giải sau root/lean: góc thế giới đùi a1, cẳng a2 từ hông → cổ chân, hướng gập c['gap'] CỐ ĐỊNH
        (không chọn nhánh theo khung trước → không đảo). Không kéo/co xương: nếu ngoài tầm, chân duỗi tối đa
        về phía đích và báo thieu_px (xử lý bằng root/lean ở bước trên – xem ha_goc_can_thiet)."""
        ang = dict(ang)
        rep = {}
        for ch, lk in locks.items():
            c = s.ik[ch]; n1, n2, n3 = c['xuong']
            l1, l2 = s.inst[n1]['xuong'], s.inst[n2]['xuong']
            hip = app(M[n1], s.inst[n1]['P'])
            par = s.inst[n1]['cha']
            par_dir = s.world_dir(M, par)
            boot_dir = lk.get('huong_ung', s.world_dir(M, n3))
            tgt = s.ankle_target(ch, lk['de'], boot_dir)
            v = tgt - hip; dd = float(np.hypot(*v))
            lmax = (l1 + l2) * c.get('tam_toi_da', 1.0)
            reach = min(dd, lmax)
            base = math.atan2(v[1], v[0])
            cosA = (l1 * l1 + reach * reach - l2 * l2) / (2 * l1 * reach)
            t1 = base + c['gap'] * math.acos(max(-1.0, min(1.0, cosA)))
            knee = hip + l1 * np.array([math.cos(t1), math.sin(t1)])
            ankle_dir = tgt if dd <= lmax else hip + v / dd * lmax
            t2 = math.atan2(ankle_dir[1] - knee[1], ankle_dir[0] - knee[0])
            a1, a2 = math.degrees(t1), math.degrees(t2)
            mix = lk.get('mix', c.get('mix', 1.0))
            new = {n1: wrap(a1 - par_dir), n2: wrap(a2 - a1), n3: wrap(boot_dir - a2)}
            for n, a in new.items():
                ang[n] = ang[n] + mix * wrap(a - ang[n])
            rep[ch] = dict(khoang_cach=dd, tam=lmax, thieu_px=max(0.0, dd - lmax), dich_co_chan=tgt.tolist())
        M = s._fk(ang, pose)
        for ch, lk in locks.items():
            c = s.ik[ch]; b = c['xuong'][2]
            ank = app(M[b], s.inst[b]['P']); de = app(M[b], c['diem_de'])
            rep[ch]['sai_co_chan_px'] = float(np.hypot(*(ank - np.array(rep[ch]['dich_co_chan']))))
            rep[ch]['sai_de_px'] = float(np.hypot(*(de - np.array(lk['de'], float))))
            rep[ch]['goc_goi'] = ang[c['xuong'][1]]
        s.last_ik = rep
        return ang, M

    def ha_goc_can_thiet(s, pose, locks, margin=0.0):
        """Độ hạ root (px thế giới, dương = xuống) tối thiểu để mọi chuỗi khoá trong tầm (chỉ dịch, không xoay)."""
        ang = s.local_angles(pose); M = s._fk(ang, pose); need = 0.0
        for ch, lk in locks.items():
            c = s.ik[ch]; n1, n2, n3 = c['xuong']
            L = (s.inst[n1]['xuong'] + s.inst[n2]['xuong']) * c.get('tam_toi_da', 1.0) - margin
            hip = app(M[n1], s.inst[n1]['P'])
            tgt = s.ankle_target(ch, lk['de'], lk.get('huong_ung', s.world_dir(M, n3)))
            dx = tgt[0] - hip[0]
            if abs(dx) >= L:
                return float('inf')
            y_need = tgt[1] - math.sqrt(L * L - dx * dx)     # hông phải có y ≥ y_need
            need = max(need, y_need - hip[1])
        return need

    # ---- slot / lớp ----
    def slots(s, ang, pose=None):
        sl = {n: s.inst[n]['slot'] for n in s.inst}
        for r in s.meta.get('slot_theo_tu_the', []):
            v = s.rule_value(r, ang, pose)
            ok = True
            if 'lon_hon' in r['khi']: ok &= v > r['khi']['lon_hon']
            if 'nho_hon' in r['khi']: ok &= v < r['khi']['nho_hon']
            if ok:
                for n in r['manh']:
                    sl[n] = r['slot']
        return sl

    def rule_value(s, rule, ang, pose=None):
        """Giá trị điều kiện luật slot: bien + Σ he_so·max(0, bien_phu − tu) (khoá 'bu', tuỳ chọn)."""
        k = rule['khi']
        v = s.bien(k['bien'], ang, pose)
        for b in k.get('bu', []):
            v += b['he_so'] * max(0.0, s.bien(b['bien'], ang, pose) - b['tu'])
        return v

    def bien(s, name, ang, pose=None):
        """'goc:<m>' góc cục bộ; 'gap:<m>' |góc cục bộ|; 'the_gioi:<m>' tổng góc cục bộ từ gốc."""
        kind, n = name.split(':')
        if kind == 'goc': return ang[n]
        if kind == 'gap': return abs(ang[n])
        if kind == 'the_gioi':
            a = 0.0; m = n
            while m is not None:
                a += ang[m]; m = s.inst[m]['cha']
            return a
        raise KeyError(name)

    def sort_key(s, sl):
        return lambda n: (sl[n], s.inst[n].get('thu_tu_phu', 0), n)

    def visible(s, n, pose=None):
        h = (pose or {}).get('hien', {})
        return bool(h.get(n, s.inst[n].get('visible', True)))

    def layers(s, pose=None, only=None, slot_override=None):
        M, ang = s.matrices(pose)
        sl = slot_override(ang) if slot_override else s.slots(ang, pose)
        names = sorted(s.inst, key=s.sort_key(sl))
        names = [n for n in names if s.visible(n, pose)]
        if only is not None:
            names = [n for n in names if n in only]
        return [(n, s.img[s.inst[n]['anh']], M[n]) for n in names]

    def world_point(s, name, p, pose=None):
        M, _ = s.matrices(pose)
        return app(M[name], p)


def put(cv, img, M, resample=Image.BICUBIC):
    Mi = np.linalg.inv(M)
    cv.alpha_composite(img.transform(cv.size, Image.AFFINE, tuple(Mi[:2].flatten()), resample))


def render(L, size=(520, 520), resample=Image.BICUBIC, offset=(0, 0), scale=1.0, flip_x=None):
    """offset/scale: thế giới → canvas (đồng nhất 2 trục). flip_x: lật ngang toàn rig quanh x thế giới này."""
    cv = Image.new('RGBA', size, (0, 0, 0, 0))
    W = T_(*offset) @ S_(scale)
    if flip_x is not None:
        W = W @ T_(flip_x, 0) @ np.diag([-1.0, 1.0, 1.0]) @ T_(-flip_x, 0)
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
    return Rig(os.path.join(HERE, '..', 'lam-v5.json'), os.path.join(HERE, '..', 'manh'))


if __name__ == '__main__':
    rig = load_default()
    m = Image.open(os.path.join(HERE, 'master-s.png')).convert('RGBA')
    cv = render(rig.layers())
    a = Image.new('RGBA', (520, 520), 'white'); a.alpha_composite(m)
    b = Image.new('RGBA', (520, 520), 'white'); b.alpha_composite(cv)
    o = Image.new('RGB', (1560, 520), 'white')
    o.paste(a.convert('RGB'), (0, 0)); o.paste(b.convert('RGB'), (520, 0))
    o.paste(Image.blend(a, b, .5).convert('RGB'), (1040, 0))
    out = os.path.join(HERE, '..', 'kiem-thu', 'rest4-nhanh.png')
    os.makedirs(os.path.dirname(out), exist_ok=True); o.save(out); print(out)
