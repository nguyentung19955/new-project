#!/usr/bin/env python3
"""PH8 mục 5: tìm vị trí / cỡ / góc vệt chém (ảnh art/hieu-ung/sprite/vet-chem-2x.png) cho trang Âm Đao sao cho
LÕI sáng (2 khung đầu của vệt – mảnh trăng chính, alpha ≥ 0,5) nằm TRONG hộp đòn thực; 2 khung sau (mảnh vỡ trang trí) được vượt nhẹ.
KHÔNG cắt ảnh: chỉ đổi x, y, k (cỡ), goc (xoay) – giống phép đặt của huVet trong game (toạ độ so với CHÂN, nhìn phải).
In bảng số cũ → mới + ghi cong-cu/vet-chem-am-dao.json (khoi-am-dao.js chép tay số vào VET_CHEM_AD).
Chạy: python3 -B game/thu-p0a/cong-cu/can-vet-chem.py"""
import json, math, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
SP = os.path.join(GOC, 'art', 'hieu-ung', 'sprite')
VM = json.load(open(os.path.join(SP, 'vet-chem-2x.json'), encoding='utf-8'))
VI = np.asarray(Image.open(os.path.join(SP, VM['anh'])).convert('RGBA')).astype(np.float32) / 255
HD = json.load(open(os.path.join(HERE, '..', 'am-dao', 'lam-hanh-dong-am-dao-2x.json'), encoding='utf-8'))

# hộp đòn PH8 (hộp đổi: nhát 2 sau lưng −36 → −10; hất mép trước 88 → 78)
HOP = {1: [4, -97, 86, 48], 2: [-10, -100, 90, 48], 3: [-13, -59, 99, 59], 5: [-9, -140, 87, 60], 6: [-3, -107, 95, 48], 7: [-13, -66, 103, 66]}
R = 4   # độ phân giải đo: 4 điểm / px logic


def ve(kieu, x, y, goc, k, khung):
    """trả lưới alpha (max các khung) trong toạ độ CHÂN: ô [-200,200]×[-240,120], R điểm / px"""
    X0, Y0, Wd, Hd = -200, -240, 400, 360
    out = np.zeros((Hd * R, Wd * R), np.float32)
    s = k / 2; c, sn = math.cos(math.radians(goc)), math.sin(math.radians(goc))
    yy, xx = np.mgrid[0:Hd * R, 0:Wd * R].astype(np.float32)
    px = X0 + (xx + 0.5) / R - x; py = Y0 + (yy + 0.5) / R - y
    lx = (c * px + sn * py) / s; ly = (-sn * px + c * py) / s           # quay ngược
    for i in khung:
        F = VM['frames'][VM['anims'][kieu]['khung'][i]]
        u = np.floor(lx + F['ax']).astype(int); v = np.floor(ly + F['ay']).astype(int)
        m = (u >= 0) & (v >= 0) & (u < F['w']) & (v < F['h'])
        a = np.zeros_like(out); a[m] = VI[F['y'] + v[m], F['x'] + u[m], 3]
        out = np.maximum(out, a)
    return out, X0, Y0


def do(n, p):
    b = HOP[n]; lo, X0, Y0 = ve(p['kieu'], p['x'], p['y'], p['goc'], p['k'], (0, 1)); ma, _, _ = ve(p['kieu'], p['x'], p['y'], p['goc'], p['k'], (2, 3))
    H, Wd = lo.shape; yy, xx = np.mgrid[0:H, 0:Wd]
    fx = X0 + (xx + 0.5) / R; fy = Y0 + (yy + 0.5) / R
    trong = (fx >= b[0]) & (fx < b[0] + b[2]) & (fy >= b[1]) & (fy < b[1] + b[3])
    # khoảng vượt ra ngoài hộp (px)
    dx = np.maximum(np.maximum(b[0] - fx, fx - b[0] - b[2]), 0); dy = np.maximum(np.maximum(b[1] - fy, fy - b[1] - b[3]), 0); kc = np.hypot(dx, dy)
    loi = lo >= 0.5; manh = ma >= 0.5
    return {'loi_px': round(loi.sum() / R / R), 'loi_ngoai_px': round((loi & ~trong).sum() / R / R), 'loi_vuot_max': round(float(kc[loi].max()) if loi.any() else 0, 1),
            'manh_ngoai_px': round((manh & ~trong).sum() / R / R), 'manh_vuot_max': round(float(kc[manh].max()) if manh.any() else 0, 1),
            'phu_hop': round(100 * (loi & trong).sum() / trong.sum())}


def diem(p, khung=(0, 1)):
    """toạ độ CHÂN của các điểm ảnh lõi (alpha ≥ 0,5) – trước khi cộng x, y"""
    s = p['k'] / 2; c, sn = math.cos(math.radians(p['goc'])), math.sin(math.radians(p['goc'])); P = []
    for i in khung:
        F = VM['frames'][VM['anims'][p['kieu']]['khung'][i]]
        a = VI[F['y']:F['y'] + F['h'], F['x']:F['x'] + F['w'], 3]; v, u = np.nonzero(a >= 0.5)
        lx = (u + 0.5 - F['ax']) * s; ly = (v + 0.5 - F['ay']) * s
        P.append(np.stack([c * lx - sn * ly, sn * lx + c * ly], 1))
    return np.concatenate(P)


def tim(n, p0, bien=1.5):
    """giữ hướng vệt (goc ± 20°), thu cỡ ít nhất có thể, dời ít nhất: mọi điểm lõi trong hộp ± bien px"""
    b = HOP[n]
    for k in np.arange(p0['k'], 0.2, -0.01):
        tot = None
        for dg in (0, -5, 5, -10, 10, -15, 15, -20, 20):
            p = dict(p0, k=round(float(k), 3), goc=p0['goc'] + dg); P = diem(p)
            lo = np.array([b[0] - bien, b[1] - bien]) - P.min(0); hi = np.array([b[0] + b[2] + bien, b[1] + b[3] + bien]) - P.max(0)
            if (lo > hi).any(): continue
            dx = min(max(p0['x'], lo[0]), hi[0]); dy = min(max(p0['y'], lo[1]), hi[1])
            cost = abs(dx - p0['x']) + abs(dy - p0['y']) + abs(dg) * 0.5
            if not tot or cost < tot[0]: tot = (cost, dict(p, x=round(float(dx), 1), y=round(float(dy), 1)))
        if tot: return tot[1], do(n, tot[1])
    return None, None


if __name__ == '__main__':
    kq = {}
    for n in (1, 2, 3, 5, 6, 7):
        v = HD['don']['atk%d' % n]['vet_chem']; p0 = {kk: v[kk] for kk in ('kieu', 'x', 'y', 'goc', 'k')}
        r0 = do(n, p0)
        if r0['loi_ngoai_px'] <= max(2, 0.01 * r0['loi_px']) and r0['loi_vuot_max'] <= 2: p1, r1 = p0, r0
        else: p1, r1 = tim(n, p0)
        kq['atk%d' % n] = {'hop': HOP[n], 'cu': p0, 'do_cu': r0, 'moi': p1, 'do_moi': r1}
        print('atk%d hộp %s\n  cũ  %s → %s\n  mới %s → %s' % (n, HOP[n], {k: p0[k] for k in 'xykgoc' if k in p0} | {'goc': p0['goc']}, r0, {k: p1[k] for k in ('x', 'y', 'k', 'goc')}, r1), flush=True)
    json.dump(kq, open(os.path.join(HERE, 'vet-chem-am-dao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
