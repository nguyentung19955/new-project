"""Đo lỗi chân / eo từng nhịp từ kết quả quay.py (17/10, chan-di-danh/bao-cao.md).
  python3 docs/review/ke-hoach-cai-thien/chan-di-danh/do.py <thư mục quay> [ra.json]
Chỉ tính nhịp ĐANG DI CHUYỂN + ĐANG RA ĐÒN (hàng ảnh không phải đứng / đi / chạy). Ảnh đo = Cu Tí KHÔNG vũ khí, cỡ ×1,
canvas 2 điểm ảnh / điểm ảnh game, chân ở canvas (100, 148) → hàng nguồn r (ô 96) nằm ở canvas 58 + r, cột nguồn c ở 52 + c.

Số đo mỗi nhịp:
  chan  : khối chân (từ đáy đai của khung chân xuống bàn chân, chỉ phần nối bàn chân) — tỉ lệ cao/rộng so với CHÍNH khung chân gốc
          trong tấm ảnh (khung đi / chạy khi ghép; khung đòn khi vẽ nguyên khung) → % lệch. > 8 % = chân bị kéo / bóp.
  eo    : ở đường ghép, (tâm ĐAI 3 hàng trên − tâm HÔNG 2 hàng dưới) so với đúng số đó trên khung chân gốc → điểm ảnh game.
          > 1 = thân trên lệch khỏi chân (cánh tay chạm eo không tính).
  ho    : khe trống giữa thân ở 4 hàng quanh đường ghép, trừ khe sẵn có của khung chân gốc → điểm ảnh game. > 1 = eo hở.
  hai_bo_chan: số nhịp có hàng chân NHIỀU đoạn hơn khung chân gốc (mảnh lạ / hai bộ chân).
  dau   : đỉnh đầu so với đỉnh đầu khung gốc (ghép: khung chân đi / chạy — thân trên phải nhún đúng như hàng đi / chạy; nguyên khung: khung
          đòn) → bước nhảy giữa hai nhịp liền CÙNG khung đòn; > 1,5 điểm ảnh game = đầu nhảy.
Theo từng nhát (các nhịp liền cùng hàng đòn):
  truot : Σ|quãng đi thật − quãng chân bước| / Σ quãng đi thật. Quãng chân bước = số khung chân đã sang × sải một khung (sải một vòng đo
          trên ảnh, như js/zed_moi.js SAI: chạy 34, chạy hai tay 44,3, đi 31 điểm ảnh game × cỡ 1,2). Vẽ nguyên khung đòn (chân đứng) = 100 %.
  nhay_cho: số lần bộ chân đổi hàng ảnh (đi bộ → chạy, chạy hai tay → chạy, bước → đứng tại chỗ) hoặc nhảy cóc khung chân giữa hai nhịp liền.
"""
import importlib.util, json, os, sys
import numpy as np
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
sp = importlib.util.spec_from_file_location('cat_than', os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'cat-than.py'))
CT = importlib.util.module_from_spec(sp); sp.loader.exec_module(CT)
D, A = CT.doc_tam('zed-moi')
DT = D['dong_tac']
_src = open(CT.RA_JS, encoding='utf-8').read()
ZE = json.loads(_src[_src.index('ZED_EO = ') + 9:_src.rstrip().rindex(';')])['bo']['moi']
Y0, X0 = 58, 52
DAY = Y0 + 89
CHAN_LECH, EO_LECH, DAU_NHAY = 0.08, 1.0, 1.5
BUOC = ('dung', 'di', 'chay', 'chay2tay')
SAI = {'chay': 34.0, 'chay2tay': 44.3, 'di': 31.0}
THAY = {k.replace('~16', ''): k for k in DT if k.endswith('~16')}


def hang_that(ten):
    return THAY.get(ten, ten)


def la_buoc(ten):
    return any(ten == b or ten.startswith(b + '_') for b in BUOC)


_eo = {}


def eo_khung(ten, i):
    t = hang_that(ten)
    if t in ZE:
        e = ZE[t][i]
        return e[7] if len(e) > 7 else e[0]
    k = (t, i)
    if k not in _eo:
        e = CT.do_eo(CT.khung(A, DT[t]['hang'], i), 'moi')
        _eo[k] = e[0] if e is not None else None
    return _eo[k]


def la_da(f):
    r, g, b = (f[..., k].astype(int) for k in range(3))
    return (f[..., 3] > 0) & (r > 140) & (g >= 0.48 * r) & (g <= 0.74 * r) & (b >= 0.28 * r) & (b <= 0.56 * r)


def sach(f, y0):
    """như chanSach() trong js/zed_moi.js: bỏ da + viền 2 ở 12 hàng đầu dưới y0, giữ khối nối bàn chân"""
    g = f.copy(); g[:y0] = 0
    sk = la_da(g); sk[y0 + 12:] = False
    dm = ndimage.binary_dilation(sk, iterations=2); dm[y0 + 12:] = False; dm[:y0] = False
    g[dm | sk] = 0
    lab, n = ndimage.label(g[..., 3] > 0)
    ks = set(lab[85:91][lab[85:91] > 0].tolist())
    g[~np.isin(lab, list(ks))] = 0
    if (g[..., 3] > 0).sum() < 0.6 * (f[y0:, :, 3] > 0).sum():
        g = f.copy(); g[:y0] = 0  # như game: bỏ quá nhiều thì vẽ thẳng
    return g


def chan_noi(m, y0):
    m = m.copy(); m[:y0] = False
    lab, n = ndimage.label(m)
    ys = np.nonzero(m.any(1))[0]
    if not len(ys):
        return m
    b = ys.max()
    ks = set(lab[b - 3:b + 1][lab[b - 3:b + 1] > 0].tolist())
    return np.isin(lab, list(ks))


def hop(m):
    ys, xs = np.nonzero(m)
    return None if not len(ys) else (ys.max() - ys.min() + 1, xs.max() - xs.min() + 1)


def doan(row):
    xs = np.nonzero(row)[0]
    return 0 if not len(xs) else 1 + int((np.diff(xs) > 2).sum())


def dat(f):
    c = np.zeros((180, 200, 4), np.uint8)
    c[Y0:Y0 + 96, X0:X0 + 96] = f
    return c


def cheo(img, chan, S):
    """tâm ĐAI (màu đai, 3 hàng trên đường ghép S) − tâm HÔNG (khối chân nối bàn chân, 2 hàng dưới), cột canvas; hoặc None"""
    h_, s_, v_ = CT.hsv(img)
    dai = (img[..., 3] > 100) & CT.MAU_DAI['moi'](h_, s_, v_)
    xd = np.nonzero(dai[S - 3:S].any(0))[0]
    xh = np.nonzero(chan[S + 1:S + 3].any(0))[0]
    return None if not len(xd) or not len(xh) else (xd.min() + xd.max()) / 2 - (xh.min() + xh.max()) / 2


def ho(m, S, chan):
    """khe trống dài nhất (điểm ảnh canvas) ở các hàng quanh đường ghép (S−1..S+2), chỉ trong bề ngang HÔNG (khối chân 2 hàng dưới S)
    — đuôi đai bay, cánh tay ngoài hông không tính"""
    xh = np.nonzero(chan[S + 1:S + 3].any(0))[0]
    if not len(xh):
        return 0
    kq = 0
    for y in range(S - 1, S + 3):
        row = m[y, xh.min():xh.max() + 1]
        kq = max(kq, max((len(t) for t in ''.join('1' if v else '0' for v in row).split('1')), default=0))
    return kq


def chan_cua(r):
    """(hàng chân, khung) đang vẽ: ghép → khung đi / chạy; hàng bước → chính nó; nguyên khung đòn → ('tai-cho', None)"""
    eo = r.get('eo')
    if eo:
        return (eo.get('chan') or 'chay', eo['i'])
    t = r.get('ten') or ''
    if la_buoc(t) and not t.startswith('dung'):
        return ('chay2tay' if t.startswith('chay2tay') else t.split('_')[0], r['i'])
    return ('tai-cho', None)


def do_nhip(r, im):
    eo, E = r.get('eo'), r.get('E')
    ghep = bool(eo and E)
    if ghep:
        chan_ten, ci = eo.get('chan') or 'chay', eo['i']
        yL = E['eR'][7] if len(E['eR']) > 7 and E.get('dai') else E['eR'][0]
        seam = E['eR'][2] if E.get('moi') else yL
        f = f0 = CT.khung(A, DT[hang_that(chan_ten)]['hang'], ci)
        if E.get('dai'):
            f = sach(f, yL)
    else:
        chan_ten, ci = r['ten'], r['i']
        yL = eo_khung(r['ten'], r['i'])
        seam = yL
        f = f0 = CT.khung(A, DT[hang_that(chan_ten)]['hang'], ci)
    m = im[..., 3] > 0
    out = {}
    if yL is not None:
        ref = dat(f)
        mr, mf = chan_noi(m, Y0 + yL + 1), chan_noi(ref[..., 3] > 0, Y0 + yL + 1)
        hr, hf = hop(mr), hop(mf)
        if hr and hf:
            out['chan'] = abs((hr[0] / hr[1]) / (hf[0] / hf[1]) - 1)
        out['doan'] = sum(1 for y in range(Y0 + seam + 2, DAY - 3) if doan(mr[y]) > max(2, doan(mf[y])))
        S = Y0 + seam
        r0 = dat(f0)
        a, b = cheo(im, mr, S), cheo(r0, mf, S)  # gốc: đai của khung chân gốc, hông = khối chân đã bỏ tay (như game vẽ)
        if a is not None and b is not None:
            out['eo'] = abs(a - b) / 2
        out['ho'] = max(0, ho(m, S, mr) - ho(dat(f)[..., 3] > 0, S, mf)) / 2  # khe giữa thân ở eo, trừ khe sẵn có của khung chân gốc
    ys = np.nonzero(m.any(1))[0]
    yt = np.nonzero((f0[..., 3] > 0).any(1))[0] if ghep else np.nonzero((CT.khung(A, DT[hang_that(r['ten'])]['hang'], r['i'])[..., 3] > 0).any(1))[0]
    if len(ys) and len(yt):
        out['dau'] = (Y0 + yt.min() - ys.min()) / 2
        out['hoi'] = int(sum(1 for y in range(ys.min(), DAY) if not m[y].any()))
    return out


def buoc_giua(c0, c1, K):
    """quãng chân bước giữa hai nhịp (điểm ảnh thế giới)"""
    if c1[0] == 'tai-cho' or c0[0] != c1[0] or c1[1] is None or c0[1] is None:
        return 0.0
    so_k = DT[hang_that(c1[0])]['so']
    d = (c1[1] - c0[1]) % so_k
    if d > so_k / 2:
        d -= so_k
    return abs(d) * SAI.get(c1[0], 34.0) / so_k * K


def khep(ket, to, tru=None):
    for (t2, ten2), g2 in ket.items():
        if t2 == to and ten2 != tru and g2['nhat']:
            g2['di'] += g2['nhat'][0]; g2['lech'] += abs(g2['nhat'][0] - g2['nhat'][1]); g2['nhat'] = None


def main():
    th = os.path.abspath(sys.argv[1])
    so = json.load(open(os.path.join(th, 'so-lieu.json')))['so']
    ket = {}
    for to, sl in so.items():
        anh = np.load(os.path.join(th, to + '.npz'))['trong']
        truoc = None   # (hàng ảnh, chân, đỉnh đầu, x, khung) của nhịp trước đang di chuyển
        for k, r in enumerate(sl):
            ten = r['ten'] or ''
            if not r['move'] or not ten:
                truoc = None
                khep(ket, to)
                continue
            cc = chan_cua(r)
            khep(ket, to, ten)
            if not la_buoc(ten):
                im = anh[k][:, ::-1] if r['face'] < 0 else anh[k]
                g = ket.setdefault((to, ten), {'n': 0, 'chan': [], 'eo': [], 'hoi': 0, 'doan': 0, 'dau': [], 'di': 0.0, 'lech': 0.0, 'nhat': None, 'nhay': 0, 'ho': 0})
                dd = do_nhip(r, im)
                g['n'] += 1
                if 'chan' in dd: g['chan'].append(dd['chan'])
                if 'eo' in dd: g['eo'].append(dd['eo'])
                if dd.get('ho', 0) > 1: g['ho'] += 1
                g['hoi'] += 1 if dd.get('hoi') else 0
                g['doan'] += 1 if dd.get('doan', 0) > 0 else 0
                if truoc and truoc[0] == ten and truoc[4] == r['i'] and truoc[2] is not None and 'dau' in dd:
                    g['dau'].append(abs(dd['dau'] - truoc[2]))  # cùng khung đòn: đầu chỉ được nhún theo chân
                if truoc:
                    c0 = truoc[1]
                    so_k = DT[hang_that(cc[0])]['so'] if cc[1] is not None else 1
                    if c0[0] != cc[0] or (cc[1] is not None and c0[1] is not None and (cc[1] - c0[1]) % so_k not in (0, 1, so_k - 1)):
                        g['nhay'] += 1
                    if truoc[0] == ten:  # trong cùng nhát
                        g['nhat'] = g['nhat'] or [0.0, 0.0]
                        g['nhat'][0] += abs(r['x'] - truoc[3]); g['nhat'][1] += buoc_giua(c0, cc, r['K'])
                truoc = (ten, cc, dd.get('dau'), r['x'], r['i'])
            else:
                if truoc and not la_buoc(truoc[0]) and truoc[1][0] != cc[0]:
                    ket[(to, truoc[0])]['nhay'] += 1  # ra đòn → bước: bộ chân đổi
                truoc = (ten, cc, None, r['x'], r['i'])
        khep(ket, to)
    bang = {}
    for (to, ten), g in ket.items():
        if not g['n']:
            continue
        bang.setdefault(to, {})[ten] = {
            'nhip': g['n'],
            'chan_max_pt': round(100 * max(g['chan'] or [0]), 1),
            'chan_loi': sum(1 for c in g['chan'] if c > CHAN_LECH),
            'eo_max': max(g['eo'] or [0]),
            'eo_loi': sum(1 for c in g['eo'] if c > EO_LECH), 'ho_loi': g['ho'],
            'hoi': g['hoi'], 'hai_bo_chan': g['doan'],
            'dau_max': max(g['dau'] or [0]), 'dau_loi': sum(1 for c in g['dau'] if c > DAU_NHAY),
            'truot_pt': round(100 * g['lech'] / g['di']) if g['di'] > 0.5 else None,
            'nhay_cho': g['nhay'],
        }
    json.dump(bang, open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(th, 'do.json'), 'w'), ensure_ascii=False, indent=1)
    for to in sorted(bang):
        for ten, v in bang[to].items():
            print('%-20s %-14s' % (to, ten), ' '.join('%s=%s' % (k, v[k]) for k in v))


if __name__ == '__main__':
    main()
