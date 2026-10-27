"""Bộ máy animation: mốc đặt tay (theo thời gian, ms) → kênh nội suy → tư thế từng khung.

Mỗi clip (xem clip_quai.py, clip_boss.py) là dict:
  ms, buoc_ms (thời lượng 1 khung), lap (lặp vòng?), giu_cuoi (thêm khung cuối đúng t = ms, giữ nguyên – clip chết),
  pha [(tên, t0, t1)], cham (t0, t1) ms = cửa sổ gây sát thương theo gameplay, kenh {nút: {thuộc tính: [mốc]}}.
Thuộc tính (đơn vị px LOGIC game, độ, ms):
  x, y      dịch so với dáng nghỉ, trong hệ của nút cha
  X, Y      vị trí TUYỆT ĐỐI của pivot so với điểm neo đất (chỉ nút con trực tiếp của gốc; y âm = lên)
  goc       góc thêm (độ, + = thuận kim đồng hồ)            sx, sy  co giãn quanh pivot
  trang     hoà trắng 0..1 (bậc thang – nháy)                toi     làm tối 0..1      mo  độ đục 0..1
  hien      1/0 (bậc thang)
  nhac      khe hở điểm THẤP NHẤT của mảnh ↔ mặt đất (px logic, 0 = chạm đất). Khi có, thay cho y trong khoảng
            thời gian từ mốc đầu tới mốc cuối của kênh: y được giải từ hình mảnh → không bao giờ xuyên đất.
  lac       góc TUYỆT ĐỐI (so với màn hình) của mảnh treo (quả lắc, xích): goc = lac − góc thế giới của cha.
Nút '*' : trang / toi áp cho mọi mảnh.
Clip lặp dùng noi_suy.Kenh (Hermite tuần hoàn của rig-v2); clip không lặp dùng noi_suy_mo.KenhMo. Cả hai: tiếp
tuyến Fritsch–Butland → không vượt biên (kiem_vuot đo bằng số)."""
import os
import numpy as np
from chung import rig_json, load_json
from noi_suy import Kenh
from noi_suy_mo import KenhMo
import rig as R

BAT_THANG = {'trang', 'hien'}
MAC_DINH = {'x': 0.0, 'y': 0.0, 'goc': 0.0, 'sx': 1.0, 'sy': 1.0, 'trang': 0.0, 'toi': 0.0, 'mo': 1.0}


class NgCanh:
    """Ngữ cảnh 1 nhân vật: rig, tỉ lệ, các hàm hình học giúp đặt mốc."""

    def __init__(self, nv, doc=None):
        self.nv = nv
        self.doc = doc or load_json(rig_json(nv))
        self.rig = self.doc['rig']
        self.k = self.doc['ty_le']['px_nguon_sang_px_logic']
        self.root = np.array(self.rig['goc_the_gioi'])
        self.ground = self.rig['mat_dat_y']
        order, seen = [], set()

        def visit(n):
            if n in seen:
                return
            c = self.rig['nut'][n]['cha']
            if c:
                visit(c)
            seen.add(n)
            order.append(n)
        for n in self.rig['nut']:
            visit(n)
        self.order = order

    def nghi(self, n):
        """vị trí pivot dáng nghỉ, px logic so với điểm neo (y âm = trên đất)"""
        nd_ = self.rig['nut'][n]
        p = np.array(nd_['diem_gan'], float)
        c = nd_['cha']
        while c and c != 'goc':
            p = p + np.array(self.rig['nut'][c]['diem_gan'])
            c = self.rig['nut'][c]['cha']
        return p * self.k

    def khe(self, n, pose=None):
        """khe hở (px logic) giữa điểm thấp nhất của mảnh n và mặt đất ở tư thế pose (mặc định dáng nghỉ)."""
        pose = dict(pose or {})
        pose.setdefault(n, {})
        pose[n] = dict(pose[n], hien=True)
        y = R.lowest_y(self.rig, pose, [n])[n]
        return (self.ground - y) * self.k

    def goc_nam(self, n, huong, lo=0, hi=130):
        """góc (độ) mà mảnh n lăn/đổ sang bên 'huong' (−1 = ngược kim đồng hồ, +1 = thuận) rồi nằm yên: cực tiểu
        độ cao trọng tâm khi luôn chạm đất (thế năng nhỏ nhất) trong khoảng [lo, hi] độ."""
        nd_ = self.rig['nut'][n]
        pts = R.piece_edge(nd_['anh'])
        a = R.piece_img(nd_['anh'])[..., 3]
        ys, xs = np.nonzero(a > 128)
        com = np.array([xs.mean(), ys.mean()]) - np.array(nd_['pivot'])
        p = pts[:2] - np.array(nd_['pivot'])[:, None]
        best, gbest = None, 0
        for g in np.arange(lo, hi + 0.01, 0.5):
            Rm = R.R(huong * g)
            low = (Rm @ p)[1].max()
            h = low - (Rm @ com)[1]                    # độ cao trọng tâm trên điểm chạm
            if best is None or h < best - 1e-9:
                best, gbest = h, g
        return float(huong * gbest)


def tao_kenh(clip):
    out = {}
    for n, props in clip['kenh'].items():
        for p, moc in props.items():
            if clip['lap']:
                if p in BAT_THANG:
                    out[(n, p)] = KenhMo(moc, f'{n}.{p}', bat_thang=True)
                else:
                    mm = [(m[0] % clip['ms'],) + tuple(m[1:]) for m in moc]
                    out[(n, p)] = Kenh(mm, clip['ms'], f'{n}.{p}')
            else:
                out[(n, p)] = KenhMo(moc, f'{n}.{p}', bat_thang=p in BAT_THANG)
    return out


def _gia_tri(kenh, n, p, t, md):
    k = kenh.get((n, p))
    return md if k is None else float(k(t))


def _co_khoang(kenh, n, p, t):
    k = kenh.get((n, p))
    if k is None:
        return False
    tt = k.t
    return tt.min() - 1e-6 <= t <= tt.max() + 1e-6 if isinstance(k, KenhMo) else True


def tu_the(C, clip, t, kenh=None):
    """Tư thế (định dạng rig, đơn vị px nguồn) tại thời điểm t ms."""
    kenh = kenh or tao_kenh(clip)
    k = C.k
    pose = {}
    g_trang = _gia_tri(kenh, '*', 'trang', t, 0.0)
    g_toi = _gia_tri(kenh, '*', 'toi', t, 0.0)
    for n in C.order:
        nd_ = C.rig['nut'][n]
        if nd_['cha'] is None:
            continue
        v = {p: _gia_tri(kenh, n, p, t, md) for p, md in MAC_DINH.items()}
        dx, dy = v['x'] / k, v['y'] / k
        if (n, 'X') in kenh:
            dx = _gia_tri(kenh, n, 'X', t, 0) / k - nd_['diem_gan'][0]
        if (n, 'Y') in kenh:
            dy = _gia_tri(kenh, n, 'Y', t, 0) / k - nd_['diem_gan'][1]
        d = {'dich': [dx, dy], 'goc': v['goc'], 'ty': [v['sx'], v['sy']]}
        if (n, 'hien') in kenh:
            d['hien'] = bool(round(_gia_tri(kenh, n, 'hien', t, 1)))
        tr, to = max(v['trang'], g_trang), max(v['toi'], g_toi)
        if tr:
            d['trang'] = tr
        if to:
            d['toi'] = to
        if v['mo'] != 1:
            d['mo'] = v['mo']
        pose[n] = d
        if (n, 'lac') in kenh:
            Wp = R.world_mats(C.rig, pose)[nd_['cha']]
            gp = np.degrees(np.arctan2(Wp[1, 0], Wp[0, 0]))
            d['goc'] = _gia_tri(kenh, n, 'lac', t, 0) - gp
        if _co_khoang(kenh, n, 'nhac', t) and 'anh' in nd_:
            pose[n] = dict(d, hien=True)
            mats = R.world_mats(C.rig, pose)
            low = R.lowest_y(C.rig, pose, [n], mats)[n]
            target = C.ground - _gia_tri(kenh, n, 'nhac', t, 0) / k
            Wp = mats[nd_['cha']]
            d['dich'][1] += (target - low) / Wp[1, 1]
            pose[n] = d
    return pose


def thoi_diem(clip):
    n = int(round(clip['ms'] / clip['buoc_ms']))
    ts = [i * clip['buoc_ms'] for i in range(n)]
    if clip.get('giu_cuoi'):
        ts.append(float(clip['ms']))
    return ts


def khung_cham(clip, ts):
    if not clip.get('cham'):
        return []
    a, b = clip['cham']
    return [i for i, t in enumerate(ts) if a - 1e-6 <= t <= b + 1e-6]


def tinh_clip(C, clip):
    kenh = tao_kenh(clip)
    ts = thoi_diem(clip)
    frames = [tu_the(C, clip, t, kenh) for t in ts]
    return ts, frames, kenh


def lam_tron(pose):
    out = {}
    for n, d in pose.items():
        e = {}
        for key, v in d.items():
            if isinstance(v, (list, tuple)):
                e[key] = [round(float(x), 3) for x in v]
            elif isinstance(v, bool):
                e[key] = v
            else:
                e[key] = round(float(v), 4)
        if e.get('dich') == [0.0, 0.0]:
            e.pop('dich')
        if e.get('goc') == 0.0:
            e.pop('goc')
        if e.get('ty') == [1.0, 1.0]:
            e.pop('ty')
        if e:
            out[n] = e
    return out
