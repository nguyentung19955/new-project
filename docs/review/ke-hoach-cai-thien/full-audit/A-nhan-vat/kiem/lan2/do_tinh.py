#!/usr/bin/env python3
"""Rà soát tĩnh mọi tấm sprite nhân vật / quái / trùm / người làng (game/art/custom/*.sprite.json).

Đo từng khung (đơn vị: điểm ảnh GAME, đã chia net):
  - rỗng, chạm mép ô (bị cắt cụt), mảnh rời nhỏ (mảnh lem của ô bên cạnh),
  - đáy chân so với điểm gốc (goc y), tâm ngang thân so với goc x, đỉnh đầu,
  - khung trùng hệt nhau trong cùng hàng, nhảy tâm giữa hai khung liền nhau.
Ghi ket-qua-tinh.json + in bảng tóm tắt các điểm bất thường.

Chạy: python3 do_tinh.py [thư mục custom] [tệp ra json]
"""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '../../../../../../game/art/custom')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), 'ket-qua-tinh.json')
BO_QUA = ('gd-', 'tp-', 'vp-', 'hu-', 'vk-', 'ghep-')


def nap(f):
    d = json.load(open(f))
    tam = d['tam']
    if tam.startswith('data:'):
        im = Image.open(io.BytesIO(base64.b64decode(tam.split(',', 1)[1]))).convert('RGBA')
    else:
        im = Image.open(os.path.join(os.path.dirname(f), tam)).convert('RGBA')
    return d, np.array(im)


def do_khung(a, net, goc):
    """a: mảng RGBA một ô (điểm ảnh tấm). Trả số đo ở điểm ảnh game."""
    al = a[:, :, 3] > 40
    H, W = al.shape
    n = int(al.sum())
    if n == 0:
        return {'rong': True}
    lab, k = ndimage.label(al, structure=np.ones((3, 3)))
    sizes = ndimage.sum(al, lab, range(1, k + 1))
    chinh = int(np.argmax(sizes)) + 1
    # mảnh rời: mảnh < 3% mảnh chính và cách mảnh chính > 3 điểm ảnh game
    dt = ndimage.distance_transform_edt(lab != chinh)
    manh = []
    for i in range(1, k + 1):
        if i == chinh:
            continue
        m = lab == i
        kc = float(dt[m].min()) / net
        if sizes[i - 1] < 0.03 * sizes[chinh - 1] and kc > 3:
            ys, xs = np.nonzero(m)
            manh.append({'co': int(sizes[i - 1]), 'x': round(xs.mean() / net, 1), 'y': round(ys.mean() / net, 1), 'cach': round(kc, 1)})
    ys, xs = np.nonzero(al)
    cham = []
    if al[0, :].any(): cham.append('tren')
    if al[-1, :].any(): cham.append('duoi')
    if al[:, 0].any(): cham.append('trai')
    if al[:, -1].any(): cham.append('phai')
    # tâm thân: tâm khối của nửa trên (đầu+thân), bỏ chân
    y0, y1 = ys.min(), ys.max()
    tren = al.copy(); tren[int(y0 + (y1 - y0) * 0.6):, :] = False
    ty, tx = np.nonzero(tren)
    return {
        'n': n / (net * net),
        'day': round((y1 + 1) / net - goc[1], 2),        # >0: chân lún dưới gốc
        'dinh': round(y0 / net - goc[1], 2),
        'trai': round(xs.min() / net - goc[0], 2), 'phai': round((xs.max() + 1) / net - goc[0], 2),
        'tam': round(tx.mean() / net - goc[0], 2) if len(tx) else None,
        'cham': cham, 'manh': manh,
    }


def main():
    kq = {}
    canh = []
    for f in sorted(glob.glob(os.path.join(ROOT, '*.sprite.json'))):
        ten = os.path.basename(f).replace('.sprite.json', '')
        if ten.startswith(BO_QUA):
            continue
        d, img = nap(f)
        net = d.get('net') or 1
        kw, kh = d['khung_rong'] * net, d['khung_cao'] * net
        goc = d.get('goc', [d['khung_rong'] / 2, d['khung_cao']])
        rec = {'cot': img.shape[1] // kw, 'hang': img.shape[0] // kh, 'dt': {}}
        if img.shape[1] % kw or img.shape[0] % kh:
            canh.append((ten, '-', '-', f'tấm {img.shape[1]}x{img.shape[0]} không chia hết ô {kw}x{kh}'))
        for dt_ten, dt in d.get('dong_tac', {}).items():
            r = dt['hang']
            ks = []
            for i in range(dt['so']):
                if (i + 1) * kw > img.shape[1] or (r + 1) * kh > img.shape[0]:
                    ks.append({'ngoai': True}); canh.append((ten, dt_ten, i + 1, 'khung nằm ngoài tấm')); continue
                o = img[r * kh:(r + 1) * kh, i * kw:(i + 1) * kw]
                m = do_khung(o, net, goc)
                m['bam'] = hash(o[:, :, 3].tobytes() + o[:, :, :3][o[:, :, 3] > 0].tobytes())
                ks.append(m)
            # khung thừa sau 'so' trên cùng hàng (bị bỏ sót?)
            for i in range(dt['so'], rec['cot']):
                o = img[r * kh:(r + 1) * kh, i * kw:(i + 1) * kw]
                if (o[:, :, 3] > 40).sum() > 50:
                    canh.append((ten, dt_ten, i + 1, 'ô có hình nhưng không dùng (so=%d)' % dt['so']))
            # bất thường
            for i, m in enumerate(ks):
                if m.get('rong'):
                    canh.append((ten, dt_ten, i + 1, 'khung RỖNG')); continue
                if m.get('ngoai'): continue
                if m['cham']:
                    canh.append((ten, dt_ten, i + 1, 'chạm mép ô (cụt?): ' + ','.join(m['cham'])))
                for mm in m['manh']:
                    canh.append((ten, dt_ten, i + 1, 'mảnh rời %d đpx ở (%.1f,%.1f) cách thân %.1f' % (mm['co'], mm['x'], mm['y'], mm['cach'])))
                if dt_ten not in ('die',) and not dt_ten.startswith('atk') and dt_ten not in ('ne', 'cast', 'tele') and abs(m['day']) > 1.01:
                    canh.append((ten, dt_ten, i + 1, 'đáy chân lệch gốc %+.1f' % m['day']))
            bams = [m.get('bam') for m in ks]
            for i in range(len(ks)):
                for j in range(i + 1, len(ks)):
                    if bams[i] is not None and bams[i] == bams[j]:
                        canh.append((ten, dt_ten, f'{i+1}={j+1}', 'hai khung TRÙNG hệt'))
            tams = [m.get('tam') for m in ks]
            for i in range(1, len(ks)):
                if tams[i] is None or tams[i - 1] is None: continue
                if dt_ten in ('idle', 'move', 'hit', 'noi') and abs(tams[i] - tams[i - 1]) > 2.5:
                    canh.append((ten, dt_ten, f'{i}->{i+1}', 'tâm thân nhảy %.1f' % (tams[i] - tams[i - 1])))
            if dt.get('lap') and len(ks) > 2 and tams[0] is not None and tams[-1] is not None and dt_ten in ('idle', 'move') and abs(tams[0] - tams[-1]) > 2.5:
                canh.append((ten, dt_ten, f'{len(ks)}->1', 'vòng lặp nhảy tâm %.1f' % (tams[0] - tams[-1])))
            for m in ks: m.pop('bam', None)
            rec['dt'][dt_ten] = ks
        # nhảy tâm giữa các hàng (đứng -> đánh/trúng): so khung 1 mỗi hàng với khung đứng 1
        idle = rec['dt'].get('idle', [{}])[0]
        for dt_ten, ks in rec['dt'].items():
            if not ks or ks[0].get('rong') or ks[0].get('ngoai') or idle.get('tam') is None: continue
            if dt_ten in ('die',): continue
            dx = ks[0]['tam'] - idle['tam']; dy = ks[0]['day'] - idle['day']
            if abs(dx) > 3 or abs(dy) > 1.5:
                canh.append((ten, dt_ten, 1, 'chuyển từ đứng sang: tâm %+.1f, đáy %+.1f' % (dx, dy)))
        kq[ten] = rec
    json.dump({'kq': kq, 'canh': canh}, open(OUT, 'w'), ensure_ascii=False, indent=0)
    for c in canh:
        print(' | '.join(str(x) for x in c))
    print('Tổng', len(canh), 'điểm cần xem, ', len(kq), 'tấm')


if __name__ == '__main__':
    main()
