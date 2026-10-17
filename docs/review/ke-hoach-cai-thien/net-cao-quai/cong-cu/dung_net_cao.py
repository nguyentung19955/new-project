"""DỰNG ẢNH NÉT CAO (NET 3 / 4) cho quái / tinh anh / trùm / người làng (net-cao-quai 17/10).
Đọc ra/khop.json (kiem_ke.py). Mỗi khung khớp: dựng lại từ khung ảnh gốc ở đúng tỉ lệ z·N/2 + chỗ dán (X·N/2, Y·N/2) bằng
do-net/cong-cu/thu_net.thu (mỗi điểm một màu có thật, không pha; viền tối 1 điểm). Khung không khớp / trống: phóng khung cũ lấy điểm gần nhất
(N/2 lần: NET 4 = mỗi điểm thành 2×2 → y hệt hiện tại; NET 3 = ×1,5). Giảm màu chung cả tấm, PNG bảng màu.
  python3 dung_net_cao.py [mã,…] [--net 3,4]   → ra/<mã>-net<N>.png + ra/dung.json (số khung dựng / phóng, KB, độ khớp mặt nạ)"""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', '..', 'do-net', 'cong-cu'))
import thu_net
import kiem_ke as K
RA = K.RA


def phong(o, N, n=2):
    """phóng khung cũ (net n) lên net N, lấy điểm gần nhất"""
    h, w = o.shape[:2]
    H, W = h * N // n, w * N // n
    iy = np.minimum((np.arange(H) * n) // N, h - 1); ix = np.minimum((np.arange(W) * n) // N, w - 1)
    return o[iy][:, ix]


def lam(ma, N, kq_khop):
    d, sh = K.doc(ma)
    n = d.get('net', 1); fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    FW, FH = d['khung_rong'] * N, d['khung_cao'] * N
    rows, cols = sh.shape[0] // fh, sh.shape[1] // fw
    moi = phong(sh, N, n)  # mặc định: mọi ô (kể cả ô không thuộc động tác nào) phóng như cũ
    assert moi.shape[:2] == (rows * FH, cols * FW), (moi.shape, rows, cols)
    nguon = dict(K.nguon(ma))
    st = {'dung': 0, 'phong': 0, 'phong_ds': [], 'iou_ve': []}
    dem_anh = {}
    for r in kq_khop['khung_ds']:
        R, C = r['hang'], r['cot']
        if r.get('trong'):
            continue
        if not r.get('khop'):
            st['phong'] += 1; st['phong_ds'].append('%s %d' % (r['dt'], C + 1)); continue
        key = r['nguon']
        if key not in dem_anh:
            dem_anh[key] = K.anh_nguon(key, nguon.get(key))
        a = dem_anh[key]
        if r['lat']:
            a = a[:, ::-1]
        zN = r['z'] * N / n
        tw, th = max(1, round(a.shape[1] * zN)), max(1, round(a.shape[0] * zN))
        X, Y = round(r['X'] * N / n), round(r['Y'] * N / n)
        t = thu_net.thu(np.ascontiguousarray(a), tw, th)
        cell = np.zeros((FH, FW, 4), np.uint8)
        x0, y0, x1, y1 = max(0, X), max(0, Y), min(FW, X + tw), min(FH, Y + th)
        if x1 > x0 and y1 > y0:
            cell[y0:y1, x0:x1] = t[y0 - Y:y1 - Y, x0 - X:x1 - X]
        # soát: thu mặt nạ mới về net cũ, so với khung cũ
        om = sh[R * fh:(R + 1) * fh, C * fw:(C + 1) * fw, 3] > 0
        mv = np.array(Image.fromarray((cell[..., 3] > 0).astype(np.uint8) * 255).resize((fw, fh), Image.BOX)) >= 128
        st['iou_ve'].append(float((mv & om).sum() / max(1, (mv | om).sum())))
        moi[R * FH:(R + 1) * FH, C * FW:(C + 1) * FW] = cell
        st['dung'] += 1
    so_mau = len(np.unique(sh[sh[..., 3] > 0][:, :3].view(np.dtype((np.void, 3)))))
    moi = thu_net.giam_mau(moi, int(min(255, max(96, so_mau * 1.5))))
    png = thu_net.png_bang_mau(moi)
    p = os.path.join(RA, '%s-net%d.png' % (ma, N))
    open(p, 'wb').write(png)
    st['kb'] = len(png) // 1024; st['kb_net2'] = kq_khop['kb']; st['co'] = [moi.shape[1], moi.shape[0]]
    st['iou_ve_min'] = round(min(st['iou_ve']), 3) if st['iou_ve'] else None
    st['iou_ve_tb'] = round(float(np.mean(st['iou_ve'])), 3) if st['iou_ve'] else None
    del st['iou_ve']
    st['goc_moi_diem'] = kq_khop['goc_moi_diem']; st['phong_tu_goc'] = bool(kq_khop['goc_moi_diem'] and kq_khop['goc_moi_diem'] < N)
    return st


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    nets = [3, 4]
    if '--net' in sys.argv:
        nets = [int(x) for x in sys.argv[sys.argv.index('--net') + 1].split(',')]
        args = [a for a in args if a != sys.argv[sys.argv.index('--net') + 1]]
    khop = json.load(open(os.path.join(RA, 'khop.json')))
    ds = args[0].split(',') if args else list(khop)
    p = os.path.join(RA, 'dung-%s.json' % '-'.join(map(str, nets)))
    tong = json.load(open(p)) if os.path.exists(p) else {}
    for ma in ds:
        for N in nets:
            st = lam(ma, N, khop[ma])
            tong.setdefault(ma, {})[str(N)] = st
            json.dump(tong, open(p, 'w'), ensure_ascii=False, indent=0)
            print('%-14s NET %d  dựng %2d  phóng %2d  %5d KB (net2 %4d)  mặt nạ về net2: tb %.3f min %s%s' % (ma, N, st['dung'], st['phong'], st['kb'], st['kb_net2'],
                  st['iou_ve_tb'] or 0, st['iou_ve_min'], '  (gốc chỉ %.1f điểm/điểm game → có phóng)' % st['goc_moi_diem'] if st['phong_tu_goc'] else ''), flush=True)
