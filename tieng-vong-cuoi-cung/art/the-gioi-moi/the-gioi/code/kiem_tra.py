"""Kiểm tra tự động (mã thoát 1 nếu lỗi):
  • đủ file đầu ra, cỡ đúng (nền 1920×1080, cảnh 2x/1x);
  • gạch: mọi cặp ô ghép (theo 'khop' + tự lặp) – chênh màu NGAY ĐƯỜNG NỐI so với chênh giữa 2 cột/hàng kề nhau bên trong ô.
    Tỉ lệ ≈ 1 nghĩa là nhìn không ra đường nối; > 2 là lộ;
  • đồ vật: 3 trạng thái cổng cùng khung + cùng neo; neo nằm trong khung;
  • nền: lớp xa không có điểm trong suốt; lớp xa lật ghép liền (mép trái bản thường = mép trái bản lật)."""
import json
import os
import sys

import numpy as np
from PIL import Image

from chung import DOVAT, GACH, NEN, XEM, T2, luu_json

loi = []


def ok(dk, msg):
    if not dk:
        loi.append(msg)
        print('  LỖI:', msg)


def o_day_du(meta, at, ten):
    """Dựng lại ô 64×64 (chỉ phần trong ô) từ atlas."""
    v = meta['o'][ten]
    x, y, w, h = v['khung']
    dx, dy = v['ve_lech']
    c = np.zeros((T2, T2, 4))
    im = at[y:y + h, x:x + w].astype(float)
    ys0, xs0 = max(0, dy), max(0, dx)
    ys1, xs1 = min(T2, dy + h), min(T2, dx + w)
    c[ys0:ys1, xs0:xs1] = im[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return c


def chenh(a, b):
    m = (a[..., 3] > 250) & (b[..., 3] > 250)
    if m.sum() < 10:
        return None
    return float(np.abs(a[..., :3] - b[..., :3]).mean(-1)[m].mean())


def kiem_gach():
    meta = json.load(open(os.path.join(GACH, 'gach-atlas.json'), encoding='utf-8'))
    at = np.array(Image.open(os.path.join(GACH, 'gach-atlas.png')).convert('RGBA'))
    O = {k: o_day_du(meta, at, k) for k in meta['o'] if not k.startswith('phu-')}
    cap = set()
    for k, v in meta['o'].items():
        if k.startswith('phu-'):
            continue
        for canh, ref in v['khop'].items():
            if ref.startswith('_') or ref not in O:
                continue
            cap.add((k, canh, ref))
        if 'x' in v['lap']:
            cap.add((k, 'phai', k))
        if 'y' in v['lap']:
            cap.add((k, 'duoi', k))
    # bổ sung cặp thường gặp khi dựng cảnh
    for pre in ('dat', 'da'):
        for a_, c_, b_ in [('tren-giua', 'duoi', 'than'), ('canh-trai', 'phai', 'than'), ('than', 'phai', 'canh-phai'),
                           ('than', 'duoi', 'day-giua'), ('day-trai', 'phai', 'day-giua'), ('day-giua', 'phai', 'day-phai'),
                           ('canh-trai', 'duoi', 'day-trai'), ('canh-phai', 'duoi', 'day-phai'),
                           ('tren-trai', 'duoi', 'canh-trai'), ('tren-phai', 'duoi', 'canh-phai'),
                           ('cot-tren', 'duoi', 'cot-than'), ('cot-than', 'duoi', 'cot-day'), ('than', 'duoi', 'cot-than*')]:
            cap.add((f'{pre}-{a_}', c_, f'{pre}-{b_}'))   # '*' = chỗ chữ T: viền cột bắt đầu → chỉ đo 50 % giữa
    for i in range(2, 6):
        cap.add(('dat-than', 'phai', f'dat-than-{i}'))
        cap.add((f'dat-than-{i}', 'duoi', 'dat-than'))
    kq = []
    for a_, canh, b_ in sorted(cap):
        T_ = b_.endswith('*')
        b_ = b_.rstrip('*')
        A, B = O[a_], O[b_]
        if T_:
            A, B = A[:, T2 // 4:3 * T2 // 4], B[:, T2 // 4:3 * T2 // 4]
        if canh == 'phai':
            n = chenh(A[:, -1:], B[:, :1]); t = chenh(A[:, -2:-1], A[:, -1:]); t2 = chenh(B[:, :1], B[:, 1:2])
        elif canh == 'trai':
            n = chenh(B[:, -1:], A[:, :1]); t = chenh(A[:, :1], A[:, 1:2]); t2 = chenh(B[:, -2:-1], B[:, -1:])
        elif canh == 'duoi':
            n = chenh(A[-1:], B[:1]); t = chenh(A[-2:-1], A[-1:]); t2 = chenh(B[:1], B[1:2])
        else:
            n = chenh(B[-1:], A[:1]); t = chenh(A[:1], A[1:2]); t2 = chenh(B[-2:-1], B[-1:])
        if n is None or t is None or t2 is None:
            continue
        r = n / max(1e-3, (t + t2) / 2)
        kq.append({'o': a_, 'canh': canh, 'ke': b_, 'chenh_noi': round(n, 2), 'chenh_trong': round((t + t2) / 2, 2),
                   'ti_le': round(r, 2)})
    tl = np.array([k['ti_le'] for k in kq])
    print(f'  gạch: {len(kq)} cặp ghép · tỉ lệ chênh nối/trong: trung vị {np.median(tl):.2f}, lớn nhất {tl.max():.2f}')
    xau = sorted(kq, key=lambda k: -k['ti_le'])[:6]
    for k in xau:
        print(f'    {k["o"]} →{k["canh"]}→ {k["ke"]}: {k["ti_le"]}')
    ok(tl.max() < 2.0, f'có đường nối lộ rõ (tỉ lệ {tl.max():.2f} ≥ 2)')
    ok(len(meta['o']) >= 40, 'thiếu ô gạch')
    return kq


def kiem_vat():
    meta = json.load(open(os.path.join(DOVAT, 'do-vat-atlas.json'), encoding='utf-8'))['vat']
    cs = [meta[k] for k in ('cong-dong', 'cong-he', 'cong-mo')]
    ok(all(c['khung'][2:] == cs[0]['khung'][2:] and c['neo'] == cs[0]['neo'] for c in cs), 'cổng: 3 trạng thái lệch khung/neo')
    for k, v in meta.items():
        x, y, w, h = v['khung']
        ok(0 <= v['neo'][0] <= w and 0 < v['neo'][1] <= h, f'{k}: neo ngoài khung')
    print('  đồ vật:', len(meta), 'vật/trạng thái')


def kiem_nen():
    for k in ('xa', 'giua', 'gan-cay', 'gan-la', 'mat-troi', 'dat'):
        for s in ('', '-diu'):
            p = os.path.join(NEN, k + s + '.png')
            ok(os.path.exists(p), f'thiếu {p}')
            if os.path.exists(p):
                ok(Image.open(p).size == (1920, 1080), f'{k}{s}: sai cỡ')
    xa = np.array(Image.open(os.path.join(NEN, 'xa.png')).convert('RGBA'))
    ok(xa[..., 3].min() == 255, 'lớp xa có chỗ trong suốt')
    gi = np.array(Image.open(os.path.join(NEN, 'giua.png')).convert('RGBA'))
    ok(gi[:, :2, 3].max() == 0 and gi[:, -2:, 3].max() == 0, 'lớp giữa: 2 mép chưa mờ hết (lặp thẳng sẽ lộ)')
    print('  nền: đủ lớp + bản dịu')


def kiem_xem():
    for f, c in (('canh-ghep-2x.png', (1920, 1080)), ('canh-ghep-1x.png', (960, 540)), ('canh-ghep-diu-2x.png', (1920, 1080)),
                 ('canh-ghep-diu-1x.png', (960, 540)), ('doan-nen-mau-2x.png', None), ('cuon-thu-1x.png', None)):
        p = os.path.join(XEM, f)
        ok(os.path.exists(p), f'thiếu {f}')
        if c and os.path.exists(p):
            ok(Image.open(p).size == c, f'{f}: sai cỡ')


if __name__ == '__main__':
    print('kiểm tra:')
    kq = kiem_gach()
    luu_json(kq, os.path.join(GACH, 'kiem-tra-duong-noi.json'))
    kiem_vat()
    kiem_nen()
    kiem_xem()
    print('ĐẠT' if not loi else f'CHƯA ĐẠT ({len(loi)} lỗi)')
    sys.exit(1 if loi else 0)
