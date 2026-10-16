"""Cắt tấm 6 hàng (nền #00FF00) của 4 quái Sông sâu thành khung rời cho dung-song.py.
Nguồn: docs/anh-goc/quai-moi/song/<mã>-6-hang.png (1 đứng 6, 2 đi 6, 3 báo trước 6, 4 đánh 6, 5 trúng đòn 4, 6 chết 6).
Ra:    docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<tên>/khung-NN.png (nền trong suốt, cỡ gốc) + bao-cao.json
Cách tách: hàng = dải dọc có điểm ảnh khác nền (khoảng trống xanh giữa hai hàng); khung = cắt ở N-1 khe dọc rộng nhất trong dải
(khe = cột không có điểm ảnh nào; bụi / hạt rời của khung chết tự nằm về khung gần nhất). Tách nền: hàm mat_na_bao_cao của
docs/anh-goc/zed/cat-diem-anh.py (khử viền ngả xanh, không opening).
Riêng Rái Cá: tấm chỉ có 5 hàng (hàng 3 "chống sào nhảy" gộp báo trước + đánh) và hàng trúng đòn khung 2–4 mất cây sào → xem SUA bên dưới.
Dùng: python3 cat-6-hang.py [--chi raiCa,baBa]
"""
import os, sys, json, glob, importlib.util
import numpy as np
from PIL import Image
from scipy import ndimage as nd

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
NGUON = os.path.join(DAY, 'docs/anh-goc/quai-moi/song')
RA = os.path.join(DAY, 'docs/anh-goc/quai-moi/dong-tac')
sp = importlib.util.spec_from_file_location('cat_diem_anh', os.path.join(DAY, 'docs/anh-goc/zed/cat-diem-anh.py'))
CDA = importlib.util.module_from_spec(sp); sp.loader.exec_module(CDA)

BUOC = [('1-dung', 'dung', 6), ('2-di', 'di', 6), ('3-bao-don', 'bao-don', 6), ('4-danh', 'danh', 6), ('5-trung-don', 'trung-don', 4), ('6-chet', 'chet', 6)]
SO_HANG = {'raiCa': [6, 6, 6, 4, 6]}   # Rái Cá: 5 hàng thật trên tấm
CHI = sys.argv[sys.argv.index('--chi') + 1].split(',') if '--chi' in sys.argv else None


def dai(on, toi_thieu=1):
    s, out = None, []
    for i, v in enumerate(list(on) + [False]):
        if v and s is None: s = i
        if not v and s is not None:
            if i - s >= toi_thieu: out.append((s, i))
            s = None
    return out


def cat_tam(ma):
    a = np.array(Image.open(os.path.join(NGUON, ma + '-6-hang.png')).convert('RGB'))
    m, tk = CDA.mat_na_bao_cao(a)
    hang = [h for h in dai(m.sum(1) > 2) if h[1] - h[0] > 30]
    so = SO_HANG.get(ma, [b[2] for b in BUOC])
    assert len(hang) == len(so), (ma, 'số hàng', len(hang), hang)
    out = []
    for (y0, y1), n in zip(hang, so):
        y0, y1 = max(0, y0 - 2), min(a.shape[0], y1 + 2)
        dem = m[y0:y1].sum(0)
        o = a.shape[1] / 6.0; win = int(o / 4)
        mb = m[y0:y1]; Hb, Wb = mb.shape
        seams = [np.zeros(Hb, int)]
        for i in range(1, n):   # đường cắt = "vết cắt ít điểm ảnh nhất" (quy hoạch động, mỗi hàng lệch ±1 cột) quanh mốc lưới 6 ô
            c0 = int(i * o); lo, hi = c0 - win, c0 + win
            cost = mb[:, lo:hi].astype(float) * 100 + np.abs(np.arange(lo, hi) - c0)[None, :] * 0.01
            acc = cost.copy(); bk = np.zeros(cost.shape, int)
            for y in range(1, Hb):
                p_ = acc[y - 1]; L_ = np.r_[np.inf, p_[:-1]]; R_ = np.r_[p_[1:], np.inf]
                st = np.stack([L_, p_, R_]); j = st.argmin(0); bk[y] = j - 1; acc[y] += st.min(0)
            x = int(acc[-1].argmin()); path = [x]
            for y in range(Hb - 1, 0, -1): x += bk[y][x]; path.append(x)
            path = np.array(path[::-1]) + lo
            cham_ = int(mb[np.arange(Hb), path].sum())
            if cham_: print('  ', ma, 'hàng y', y0, 'khung', i, '|', i + 1, 'dính nhau: đường cắt đi qua %d điểm ảnh' % cham_)
            seams.append(path)
        seams.append(np.full(Hb, Wb))
        XX = np.arange(Wb)[None, :]
        ks = []
        for j in range(n):
            mm = mb & (XX >= seams[j][:, None]) & (XX < seams[j + 1][:, None])
            ke = np.zeros_like(mm)   # dải 3 điểm ảnh sát đường cắt (trừ mép ảnh)
            if j > 0: ke |= (XX >= seams[j][:, None]) & (XX < seams[j][:, None] + 3)
            if j < n - 1: ke |= (XX < seams[j + 1][:, None]) & (XX >= seams[j + 1][:, None] - 3)
            # mẩu của khung bên cạnh bị đường cắt xén vào (đầu sào...): mảnh chạm đường cắt mà nhỏ hơn 12% mảnh lớn nhất → bỏ
            lab, nn = nd.label(nd.binary_dilation(mm, iterations=2))
            if nn > 1:
                dt = nd.sum(mm, lab, range(1, nn + 1)); lon = dt.max()
                for q in range(nn):
                    o_ = lab == q + 1
                    if (o_ & ke).any() and dt[q] < 0.12 * lon: mm &= ~o_
            ys, xs = np.nonzero(mm)
            by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            rgba = np.zeros((by1 - by0, bx1 - bx0, 4), np.uint8)
            rgba[..., :3] = a[y0 + by0:y0 + by1, bx0:bx1]
            rgba[..., 3] = mm[by0:by1, bx0:bx1] * 255
            ks.append(dict(rgba=rgba, khung_bao=[int(bx0), int(y0 + by0), int(bx1), int(y0 + by1)]))
        out.append(ks)
    return out, tk


def la_sao(a):
    """điểm ảnh cây sào tre (vàng nâu: G khá cao, B thấp hẳn — lông nâu G thấp, bụng kem B cao)"""
    r, g, b = (a[..., i].astype(int) for i in range(3))
    return (a[..., 3] > 0) & (g > 80) & (b < 0.48 * r) & (g > 0.52 * r) & (g - b > 35)


def ghep_sao(f1, fk):
    """Rái Cá trúng đòn: chép cây sào của khung 1 sang khung k (khung 2–4 vẽ mất sào). Căn theo đáy + tâm ngang thân;
    sào vẽ SAU thân (chỉ đè lên chỗ trống của khung k) để tay / thân khung k vẫn ở trên."""
    import cv2
    A0 = f1['rgba']; sm = la_sao(A0)
    # cây sào = đoạn thẳng dài nhất trên mặt nạ màu tre (Hough); lấy dải ±8 điểm ảnh quanh nó, chỉ giữ điểm màu tre / nét viền tối
    L = np.array(cv2.HoughLinesP((sm * 255).astype(np.uint8), 1, np.pi / 360, 40, minLineLength=60, maxLineGap=25)).reshape(-1, 4)
    x1_, y1_, x2_, y2_ = max(L.tolist(), key=lambda l: np.hypot(l[2] - l[0], l[3] - l[1]))
    yy, xx = np.mgrid[:A0.shape[0], :A0.shape[1]]
    dx, dy = x2_ - x1_, y2_ - y1_; dd = np.hypot(dx, dy)
    t = ((xx - x1_) * dx + (yy - y1_) * dy) / dd
    kc = np.abs((xx - x1_) * dy - (yy - y1_) * dx) / dd
    toi = A0[..., :3].max(2) < 70
    s = (kc < 8) & (t > -6) & (t < dd + 6) & (A0[..., 3] > 0) & (sm | toi)
    lab, n = nd.label(s)
    if n: dt = nd.sum(s, lab, range(1, n + 1)); s = lab == (int(np.argmax(dt)) + 1)
    A, B = f1['rgba'], fk['rgba']
    H = max(A.shape[0], B.shape[0]); W = max(A.shape[1], B.shape[1]) + 40
    can = np.zeros((H, W, 4), np.uint8)
    # căn đáy (chân) và tâm ngang của nửa dưới thân
    def tam(x):
        al = x[..., 3] > 0; ys, xs = np.nonzero(al[int(al.shape[0] * 0.6):]); return xs.mean()
    ox = 20 + int(round(tam(B) - tam(A)))
    oxB = 20
    yb = H - B.shape[0]; ya = H - A.shape[0]
    can[yb:, oxB:oxB + B.shape[1]] = B
    sao = np.zeros_like(can); sao[ya:ya + A.shape[0], ox + 0:ox + A.shape[1]][s] = A[s]
    trong = can[..., 3] == 0
    can[trong] = sao[trong]
    ys, xs = np.nonzero(can[..., 3])
    return dict(rgba=can[ys.min():ys.max() + 1, xs.min():xs.max() + 1], khung_bao=fk['khung_bao'], sua='ghép cây sào từ khung 1 (vẽ sau thân)')


def sua_raiCa(h):
    dung, di, sao, trung, chet = h
    # hàng "chống sào nhảy" (6 khung): 1 cắm sào lấy đà, 2–4 bay, 5–6 đáp đập sào (bụi).
    # Báo trước (game: 0,6 giây đứng tại chỗ, vòng đỏ) = khung 1 giữ cả 6 cột. Đánh (game phát lúc ĐÁP, đúng mốc đòn trúng) = khung 2–6 (+ 6),
    # sprite.json khung [3, 4, 5] → mở hàng là cú đập (khung 5 của ảnh) đúng lúc trúng.
    bao = [dict(sao[0], sua='khung 1 hàng nhảy (cắm sào lấy đà)') for _ in range(6)]
    danh = [dict(k, sua='hàng nhảy khung %d' % (i + 2)) for i, k in enumerate(sao[1:])] + [dict(sao[5], sua='hàng nhảy khung 6 (giữ)')]
    trung = [trung[0]] + [ghep_sao(trung[0], k) for k in trung[1:]]
    return [dung, di, bao, danh, trung, chet]


def ghi(ma, h, tk):
    for (b, ten, n), ks in zip(BUOC, h):
        assert len(ks) == n, (ma, b, len(ks))
        d = os.path.join(RA, '%s-%s-cat' % (ma, b)); od = os.path.join(d, ten)
        os.makedirs(od, exist_ok=True)
        for f in glob.glob(os.path.join(od, 'khung-*.png')): os.remove(f)
        bc = {'anh': '../song/%s-6-hang.png' % ma, 'cong_cu': 'docs/review/ke-hoach-cai-thien/quai-song-moi/cong-cu/cat-6-hang.py', 'tach_nen': tk,
              'hang': [{'ten': ten, 'so_khung': n, 'khung': []}]}
        for i, k in enumerate(ks):
            Image.fromarray(k['rgba']).save(os.path.join(od, 'khung-%02d.png' % (i + 1)))
            bc['hang'][0]['khung'].append({'stt': i + 1, 'khung_bao': k['khung_bao'], 'co': list(k['rgba'].shape[1::-1]), **({'sua': k['sua']} if k.get('sua') else {})})
        json.dump(bc, open(os.path.join(d, 'bao-cao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(ma, [len(x) for x in h], 'ok')


if __name__ == '__main__':
    for ma in ['raiCa', 'diaTrau', 'baBa', 'cocTia']:
        if CHI and ma not in CHI: continue
        h, tk = cat_tam(ma)
        if ma == 'raiCa': h = sua_raiCa(h)
        ghi(ma, h, tk)
