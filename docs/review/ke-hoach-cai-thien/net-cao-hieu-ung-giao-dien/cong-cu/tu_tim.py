"""DỰNG NÉT 3/4 cho ảnh KHÔNG còn công cụ dựng chạy lại được, nhưng tim_goc.py tìm ra vùng ảnh gốc khớp (IoU ≥ 0,97).
Chỉ nhận ảnh gốc AI thật (docs/anh-goc/…, ảnh gen trong con-ve-tay-5/6, phac-thao/nut-bam/nguon), KHÔNG nhận ảnh xuất mẫu / ảnh chụp game
(…/mau/…, xem-…) vì đó là chính ảnh game phóng to — dựng từ đó không nét hơn.
  python3 tu_tim.py   (đọc ra/tim-goc.json, ghi ra/net-cao/<mã>.n3.png / .n4.png / .json như dung_net_cao.py)"""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chung import REPO, RA, doc_tam, khung, net_cua, tach_nen
import dung_net_cao as D

NHAN = ('docs/anh-goc/', 'docs/review/ke-hoach-cai-thien/con-ve-tay-5/anh-gen/', 'docs/review/ke-hoach-cai-thien/con-ve-tay-6/anh-gen-lai/',
        'docs/phac-thao/nut-bam/nguon/')
BO = ('/mau/', 'xem', 'soat', 'so-sanh')


def hop_le(t):
    return t and t.startswith(NHAN) and not any(b in t for b in BO)


_A = {}


def anh(t, lat):
    k = (t, lat)
    if k not in _A:
        _A.clear()
        a = tach_nen(np.array(Image.open(os.path.join(REPO, t)).convert('RGBA')))
        a = (np.clip(a, 0, 1) * 255).astype(np.uint8)
        if lat:
            a = a[:, ::-1].copy()
        _A[k] = a
    return _A[k]


def lam(ma, kq):
    d, a = doc_tam(ma)
    n0 = net_cua(d)
    ks = khung(d, a)
    if len(ks) != len(kq):
        return None
    ok = [k for k in kq if not k.get('rong')]
    if not ok or any(k.get('iou', 0) < D.NGUONG_KHOP or k.get('lech_mau', 999) > 25 or not hop_le(k.get('tep')) for k in ok):
        return None
    ung = []; kk = []
    for k in kq:
        if k.get('rong'):
            kk.append(k); continue
        v = anh(k['tep'], k['lat'])
        # một "lệnh thu" giả: cả ảnh gốc, điểm khung cũ (i) ↔ gốc ox + i·s; công cụ cũ coi như BOX + ngưỡng phủ tìm được
        ung.append((v, (1, 1), 4, np.zeros((1, 1, 4), np.uint8), (k['ox'], k['oy'], k['s'], k['s'])))
        kk.append({'k': k['k'], 'iou': k['iou'], 'lenh': len(ung) - 1, 'nguong': int(round(k['nguong'] * 255)), 'dx': 0, 'dy': 0})
    D.lech_ra = lambda ra, F, k: 999.0  # không có ảnh ra của công cụ cũ: luôn so màu với khung cũ (lấy màu cũ gần nhất khi lệch)
    ra = {'ma': ma, 'net_cu': n0, 'khung': [], 'nguon_bat': 'tim-goc'}
    for n in (3, 4):
        W, H = int(round(a.shape[1] * n / n0)), int(round(a.shape[0] * n / n0))
        T = np.zeros((H, W, 4), np.uint8)
        for (ten, F, (px, py)), k in zip(ks, kk):
            if k.get('rong'):
                continue
            X, Y = int(round(px * n / n0)), int(round(py * n / n0))
            hi, g = D.dung_khung(F, k, ung, n, n0)
            g.update(cach='goc', k=k, n=n)
            T[Y:Y + hi.shape[0], X:X + hi.shape[1]] = hi[:H - Y, :W - X]
            ra['khung'].append(g)
        Image.fromarray(T).save(os.path.join(D.RA_NC, '%s.n%d.png' % (ma, n)))
    ra['tep_goc'] = sorted({k['tep'] for k in ok})
    json.dump(ra, open(os.path.join(D.RA_NC, ma + '.json'), 'w'), ensure_ascii=False, indent=0, default=float)
    return ra


if __name__ == '__main__':
    T = json.load(open(os.path.join(RA, 'tim-goc.json')))
    for ma, kq in T.items():
        if os.path.exists(os.path.join(D.RA_NC, ma + '.json')):
            continue
        r = lam(ma, kq)
        if r:
            g = [x for x in r['khung'] if x['n'] == 4]
            print('%-26s từ ảnh gốc %s  iou_ve min %.3f' % (ma, ','.join(r['tep_goc'])[-70:], min(x.get('iou_ve', 1) for x in g)), flush=True)
