"""Đo sprite offline (không chạy game): quái, trùm, Cu Tí, hiệu ứng hu-*. Xuất số liệu JSON."""
import json, base64, io, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../game/art/custom')
SP = os.path.dirname(os.path.abspath(__file__))
DUR = json.load(open(os.path.join(SP, 'dur.json')))
QUAI = 'heoCon heoNanh chonBong boHung namPhong namPhongChua hoaBaoTu socNo nhimDoc ongVo cua caCon oc haiQuy caChuon caNoc sua nhim cuaTuong caNocChua linhMa doiThan tuongDa denLong meoDen huLua tieuYeu nhimThan tuongMa huChua'.split()
TRUM = 'nguTinh mocTinh hoTinh namChua cuaDa hoLua nguTinh-p2 nguTinh-p3 mocTinh-p2 mocTinh-p3 hoTinh-p2 hoTinh-p3 namChua-p2 cuaDa-p2 hoLua-p2'.split()


def nap(ma):
    d = json.load(open(f'{ROOT}/{ma}.sprite.json'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
    return d, im


def cat(d, im, hang, so):
    n = d.get('net', 1)
    w, h = d['khung_rong'] * n, d['khung_cao'] * n
    return [np.asarray(im.crop((c * w, hang * h, c * w + w, hang * h + h))) for c in range(so)]


def do_khung(a):
    al = a[..., 3] > 40
    if not al.any():
        return None
    ys, xs = np.nonzero(al)
    rgb = a[..., :3].astype(int)
    trang = ((rgb.min(-1) > 225) & al).sum() / al.sum()
    xanh = ((rgb[..., 1] > 180) & (rgb[..., 0] < 110) & (rgb[..., 2] < 110) & al).sum()
    return dict(x0=int(xs.min()), x1=int(xs.max()), y0=int(ys.min()), y1=int(ys.max()), dt=int(al.sum()),
                cx=float(xs.mean()), cy=float(ys.mean()), trang=round(float(trang), 3), xanh=int(xanh))


def khac(a, b):
    """độ khác hai khung (0..1) theo alpha + màu."""
    A = a.astype(float) / 255; B = b.astype(float) / 255
    m = np.maximum(A[..., 3], B[..., 3]) > 0.15
    if not m.any():
        return 0.0
    return float((np.abs(A - B).sum(-1))[m].mean() / 4)


def do_hang(d, im, ten, dt):
    ks = cat(d, im, dt['hang'], dt['so'])
    net = d.get('net', 1)
    ms = [do_khung(k) for k in ks]
    r = dict(ten=ten, so=dt['so'], giay=dt.get('giay'), lap=bool(dt.get('lap')), khung=dt.get('khung'), rong=[], loi=[])
    ok = [m for m in ms if m]
    r['rong'] = [i for i, m in enumerate(ms) if not m]
    if not ok:
        r['loi'].append('hàng trống'); return r, ks
    S = [m['dt'] for m in ok]
    r['dt'] = S
    r['day'] = [round((m['y1'] if m else 0) / net, 1) for m in ms]
    r['cx'] = [round(m['cx'] / net, 1) if m else None for m in ms]
    r['cao'] = [round((m['y1'] - m['y0']) / net, 1) if m else None for m in ms]
    r['trang'] = [m['trang'] if m else None for m in ms]
    r['xanh'] = sum(m['xanh'] for m in ok)
    # nhảy cỡ giữa hai khung liền nhau
    nh = []
    for i in range(1, len(ms)):
        if ms[i] and ms[i - 1]:
            nh.append(ms[i]['dt'] / ms[i - 1]['dt'])
    r['nhay_co'] = round(max([max(x, 1 / x) for x in nh] or [1]), 2)
    # lệch chân (đáy) và tâm x giữa hai khung liền nhau, theo điểm ảnh game
    dd = [abs(ms[i]['y1'] - ms[i - 1]['y1']) / net for i in range(1, len(ms)) if ms[i] and ms[i - 1]]
    dx = [abs(ms[i]['cx'] - ms[i - 1]['cx']) / net for i in range(1, len(ms)) if ms[i] and ms[i - 1]]
    r['lech_chan'] = round(max(dd or [0]), 1)
    r['lech_x'] = round(max(dx or [0]), 1)
    # khác nhau giữa khung
    kh = [khac(ks[i], ks[i - 1]) for i in range(1, len(ks))]
    r['khac'] = [round(x, 3) for x in kh]
    r['trung'] = [i for i, x in enumerate(kh, 1) if x < 0.012]
    if r['lap'] and len(ks) > 2:
        vong = khac(ks[-1], ks[0])
        tb = float(np.mean(kh)) if kh else 0
        r['giat_vong'] = round(vong / tb, 2) if tb > 0 else 0
        dv = abs(ms[-1]['y1'] - ms[0]['y1']) / net if ms[-1] and ms[0] else 0
        r['giat_vong_chan'] = round(dv, 1)
    r['buoc_max'] = round(max(kh or [0]) / (np.median(kh) if kh and np.median(kh) > 0 else 1), 2)
    return r, ks


def phan_tich_quai(ma, loai):
    d, im = nap(ma)
    goc = ma.split('-p')[0]
    du = DUR.get(goc, {})
    out = dict(ma=ma, loai=loai, khung=[d['khung_rong'], d['khung_cao']], net=d.get('net', 1), hang={})
    for ten, dt in d['dong_tac'].items():
        r, _ = do_hang(d, im, ten, dt)
        r['D_game'] = du.get(ten)
        D = du.get(ten) if ten not in ('idle', 'move') else dt.get('giay')
        if D:
            r['fps_game'] = round(dt['so'] / D, 1)
        out['hang'][ten] = r
    return out


def phan_tich_zed():
    d, im = nap('zed-moi')
    out = dict(ma='zed-moi', hang={})
    for ten, dt in d['dong_tac'].items():
        if '_' in ten and ten.split('_')[0] in ('dung', 'di', 'chay'):
            continue  # cùng hàng thân, chỉ khác vũ khí
        r, _ = do_hang(d, im, ten, dt)
        r['fps'] = round(dt['so'] / dt['giay'], 1)
        out['hang'][ten] = r
    return out


def phan_tich_hu():
    out = []
    for f in sorted(os.listdir(ROOT)):
        if not f.startswith('hu-'):
            continue
        d = json.load(open(f'{ROOT}/{f}'))
        im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
        so = d['so']
        ks = cat(d, im, 0, so)
        kh = [khac(ks[i], ks[i - 1]) for i in range(1, so)]
        ms = [do_khung(k) for k in ks]
        cuoi = ms[-1]['dt'] / max(m['dt'] for m in ms if m) if ms[-1] else 0
        out.append(dict(ma=d['ma'], ten=d.get('ten'), so=so, giay=d['giay'], fps=round(so / d['giay'], 1), lap=bool(d.get('lap')),
                        tron=d.get('tron'), kc=[d['khung_rong'], d['khung_cao']], rong=[i for i, m in enumerate(ms) if not m],
                        trung=[i for i, x in enumerate(kh, 1) if x < 0.012], buoc_max=round(max(kh) / (np.median(kh) or 1), 2) if kh else 0,
                        cuoi_con=round(cuoi, 2)))
    return out


if __name__ == '__main__':
    kq = dict(quai=[phan_tich_quai(m, 'thuong') for m in QUAI] + [phan_tich_quai(m, 'trum') for m in TRUM if os.path.exists(f'{ROOT}/{m}.sprite.json')],
              zed=phan_tich_zed(), hu=phan_tich_hu())
    json.dump(kq, open(os.path.join(SP, 'so_lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('xong', len(kq['quai']), len(kq['hu']))
