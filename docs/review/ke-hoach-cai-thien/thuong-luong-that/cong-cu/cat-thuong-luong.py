"""Cắt các tấm gộp Thuồng Luồng (nền #00FF00) thành khung rời cho dung-thuong-luong.py.
Nguồn: docs/anh-goc/trum-moi/thuong-luong/gop-*.png (chủ game gen, theo PROMPT.md mục TL1–TL4 của tu-van-17-10-nen-song)
Ra:    docs/anh-goc/trum-moi/thuong-luong/<hàng>-cat/<tên>/khung-NN.png (nền trong suốt, cỡ gốc) + bao-cao.json
       (cùng kiểu thư mục *-cat của Ngư Tinh / Hồ Tinh: docs/anh-goc/trum-moi/<trùm>/<hàng>-cat).

Tấm và hàng:
  gop-p1-a.png (CHƯA CÓ — chủ game gen sau): 1-dung (6), 3-bao-don (6), 4-danh (6)   ← có tệp thì cắt luôn, dung-thuong-luong.py tự dùng
  gop-p1-b.png: 2-di (6, bơi), 5-trung-don (4), 6-lan (6, lặn xuống nước)
  gop-p2.png:   p2-1-dung, p2-2-bao-don, p2-3-danh (phun luồng băng), p2-4-trung-don (4)
  gop-p3.png:   p3-1-dung, p3-2-bao-don, p3-3-danh (đập đầu xuống), p3-4-trung-don (4)

Cách tách (như quai-song-moi/cong-cu/cat-6-hang.py): hàng = dải có điểm ảnh khác nền; khung = đường cắt cong ít điểm ảnh nhất quanh lưới 6 ô.
Tách nền: mat_na_bao_cao của docs/anh-goc/zed/cat-diem-anh.py. Mảnh của khung bên cạnh bị xén vào (< 12 % mảnh lớn nhất, chạm đường cắt) thì bỏ.
Riêng p2-3-danh: luồng băng của khung k bay sang ô khung k+1 (vẽ đè, pha màu với xúc tu / nền xanh — không tách lại sạch được). Khung k giữ
luồng tới đường cắt (đoạn ở miệng); ở khung k+1 bỏ phần luồng thừa liền đường cắt (xem cat_tam). Luồng băng trong ảnh cũng không trùng vùng trúng
thật của chiêu nào nên chỉ giữ đoạn ngắn ở miệng là hợp (báo cáo ghi rõ). Hàng trúng đòn 4 khung, các hàng khác 6.
Dùng: python3 cat-thuong-luong.py
"""
import os, sys, json, glob, importlib.util
import numpy as np
from PIL import Image
from scipy import ndimage as nd

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/trum-moi/thuong-luong')
sp = importlib.util.spec_from_file_location('cat_diem_anh', os.path.join(DAY, 'docs/anh-goc/zed/cat-diem-anh.py'))
CDA = importlib.util.module_from_spec(sp); sp.loader.exec_module(CDA)

TAM = {
    'gop-p1-a': [('1-dung', 6), ('3-bao-don', 6), ('4-danh', 6)],
    'gop-p1-b': [('2-di', 6), ('5-trung-don', 4), ('6-lan', 6)],
    'gop-p2': [('p2-1-dung', 6), ('p2-2-bao-don', 6), ('p2-3-danh', 6), ('p2-4-trung-don', 4)],
    'gop-p3': [('p3-1-dung', 6), ('p3-2-bao-don', 6), ('p3-3-danh', 6), ('p3-4-trung-don', 4)],
}
LUONG = {'p2-3-danh'}
XANH = 32   # ngưỡng ngả xanh lá của sương / khói pha nền   # hàng có luồng phun bay sang ô kế


def dai(on, toi_thieu=1):
    s, out = None, []
    for i, v in enumerate(list(on) + [False]):
        if v and s is None: s = i
        if not v and s is not None:
            if i - s >= toi_thieu: out.append((s, i))
            s = None
    return out


def duong_cat(mb, c0, win):
    """đường cắt dọc ít điểm ảnh nhất quanh cột c0 (quy hoạch động, mỗi hàng lệch ±1 cột)"""
    Hb, Wb = mb.shape
    lo, hi = max(1, c0 - win), min(Wb - 1, c0 + win)
    cost = mb[:, lo:hi].astype(float) * 100 + np.abs(np.arange(lo, hi) - c0)[None, :] * 0.01
    acc = cost.copy(); bk = np.zeros(cost.shape, int)
    for y in range(1, Hb):
        p_ = acc[y - 1]; L_ = np.r_[np.inf, p_[:-1]]; R_ = np.r_[p_[1:], np.inf]
        st = np.stack([L_, p_, R_]); j = st.argmin(0); bk[y] = j - 1; acc[y] += st.min(0)
    x = int(acc[-1].argmin()); path = [x]
    for y in range(Hb - 1, 0, -1): x += bk[y][x]; path.append(x)
    return np.array(path[::-1]) + lo


def la_luong(rgb):
    """điểm ảnh luồng băng: sáng, ngả lam (B ≥ G − 5) — bụng rắn ngả lục (B < G), xúc tu tối"""
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    return (g > 190) & (b > 215) & (b >= g - 5)


def cat_tam(ten):
    a = np.array(Image.open(os.path.join(GOC, ten + '.png')).convert('RGB'))
    m, tk = CDA.mat_na_bao_cao(a)
    # sương / khói vẽ trong suốt trên nền xanh → điểm ảnh ngả xanh lá hẳn (G hơn cả R, B > XANH): bỏ (ảnh rắn không có màu xanh lá tươi)
    r_, g_, b_ = (a[..., i].astype(int) for i in range(3))
    xl = m & (g_ - np.maximum(r_, b_) > XANH) & (np.minimum(r_, b_) < 140)   # bụng rắn nhạt ngả lục (R, B cao) không tính
    m &= ~xl
    if ten == 'gop-p3':  # khói hơi nước pha nền xanh còn lại thành mảng vàng ô-liu (R ≈ G, B thấp, không đủ sáng để là lửa): bỏ
        ol = m & (np.abs(r_ - g_) < 28) & (g_ - b_ > 30) & (r_ < 215) & (r_ > 90)
        m &= ~ol; xl |= ol
    tk['bo_suong_xanh'] = int(xl.sum())
    lab, nn = nd.label(m)
    if nn:
        dt = nd.sum(m, lab, range(1, nn + 1)); m &= ~np.isin(lab, np.nonzero(dt < 6)[0] + 1)
    hang = [h for h in dai(m.sum(1) > 3) if h[1] - h[0] > 60]
    ds = TAM[ten]
    assert len(hang) == len(ds), (ten, 'số hàng', len(hang), hang)
    out = []
    for (y0, y1), (tenh, n) in zip(hang, ds):
        y0, y1 = max(0, y0 - 2), min(a.shape[0], y1 + 2)
        mb = m[y0:y1].copy(); Hb, Wb = mb.shape
        o = a.shape[1] / 6.0; win = int(o / 4)
        seams = [np.zeros(Hb, int)]
        for i in range(1, n):
            path = duong_cat(mb, int(i * o), win)
            cham = int(mb[np.arange(Hb), path].sum())
            if cham: print('  ', tenh, 'khung', i, '|', i + 1, 'dính nhau: đường cắt đi qua %d điểm ảnh' % cham)
            seams.append(path)
        seams.append(np.full(Hb, Wb))
        XX = np.arange(Wb)[None, :]
        rgb = a[y0:y1]
        o_k = [mb & (XX >= seams[j][:, None]) & (XX < seams[j + 1][:, None]) for j in range(n)]
        sua = [None] * n
        if tenh in LUONG:
            # luồng băng của khung j bay sang ô khung j+1 (ảnh vẽ đè, pha trộn với xúc tu / nền) → KHÔNG tách lại được cho sạch.
            # Khung j giữ luồng tới đường cắt; ở khung j+1 bỏ phần luồng (điểm sáng ngả lam, kể cả chỗ pha nền xanh) liền với đường cắt,
            # trong dải ngang của luồng, chỉ ở 110 điểm ảnh đầu ô (trước bụng rắn). Chỗ luồng đè lên xúc tu (đã pha màu) giữ như sương giá.
            r_, g_, b_ = (rgb[..., i].astype(int) for i in range(3))
            LU = mb & (g_ > 165) & (b_ > 135) & (b_ >= g_ - 70) & ~((b_ < g_ - 5) & (r_ > 120))  # sáng ngả lam / lục lam; bụng (r cao, B < G) không tính
            for j in range(n - 1):
                s = seams[j + 1]
                vung = o_k[j + 1] & LU & (XX < s[:, None] + 110)
                lab, nn = nd.label(vung, structure=np.ones((3, 3)))
                if not nn: continue
                cham = np.zeros_like(vung); cham[np.arange(Hb), np.clip(s, 0, Wb - 1)] = True
                cham = nd.binary_dilation(cham, iterations=3)
                ids = np.unique(lab[cham & vung]); ids = ids[ids > 0]
                bo = np.zeros_like(vung)
                for q in ids:
                    oq = lab == q; ys, xs = np.nonzero(oq)
                    if xs.max() - xs.min() >= 1.2 * (ys.max() - ys.min()) and oq.sum() > 20: bo |= oq
                if bo.any():
                    bo = nd.binary_dilation(bo, iterations=1) & o_k[j + 1] & (XX < s[:, None] + 112) & ~(mb & (rgb.max(2) < 90))
                    o_k[j + 1] &= ~bo
                    sua[j + 1] = 'bỏ %d điểm ảnh luồng băng của khung trước bay sang' % int(bo.sum())
        ks = []
        for j in range(n):
            mm = o_k[j]
            ke = np.zeros_like(mm)
            if j > 0: ke |= (XX >= seams[j][:, None]) & (XX < seams[j][:, None] + 3)
            if j < n - 1: ke |= (XX < seams[j + 1][:, None]) & (XX >= seams[j + 1][:, None] - 3)
            lab, nn = nd.label(nd.binary_dilation(mm, iterations=2))
            if nn > 1:
                dt = nd.sum(mm, lab, range(1, nn + 1)); lon = dt.max()
                for q in range(nn):
                    o_ = lab == q + 1
                    if (o_ & ke).any() and dt[q] < 0.12 * lon: mm &= ~o_
                    elif tenh in LUONG and dt[q] < 0.02 * lon: mm &= ~o_   # vụn sương / luồng lẻ còn sót sau khi bỏ luồng khung trước
            ys, xs = np.nonzero(mm)
            by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            r = np.zeros((by1 - by0, bx1 - bx0, 4), np.uint8)
            r[..., :3] = rgb[by0:by1, bx0:bx1]
            r[..., 3] = mm[by0:by1, bx0:bx1] * 255
            ks.append(dict(rgba=r, khung_bao=[int(bx0), int(y0 + by0), int(bx1), int(y0 + by1)], sua=(sua[j] or '').strip('; ') or None))
        out.append((tenh, ks))
    return out, tk


def ghi(ten, h, tk):
    for tenh, ks in h:
        d = os.path.join(GOC, tenh + '-cat'); od = os.path.join(d, tenh)
        os.makedirs(od, exist_ok=True)
        for f in glob.glob(os.path.join(od, 'khung-*.png')): os.remove(f)
        bc = {'anh': '../%s.png' % ten, 'cong_cu': 'docs/review/ke-hoach-cai-thien/thuong-luong-that/cong-cu/cat-thuong-luong.py', 'tach_nen': tk,
              'hang': [{'ten': tenh, 'so_khung': len(ks), 'khung': []}]}
        for i, k in enumerate(ks):
            Image.fromarray(k['rgba']).save(os.path.join(od, 'khung-%02d.png' % (i + 1)))
            bc['hang'][0]['khung'].append({'stt': i + 1, 'khung_bao': k['khung_bao'], 'co': list(k['rgba'].shape[1::-1]), **({'sua': k['sua']} if k.get('sua') else {})})
        json.dump(bc, open(os.path.join(d, 'bao-cao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(' ', tenh, len(ks), 'khung', [k['rgba'].shape[1::-1] for k in ks])


if __name__ == '__main__':
    for ten in TAM:
        f = os.path.join(GOC, ten + '.png')
        if not os.path.isfile(f):
            print(ten, ': chưa có ảnh (bỏ qua)'); continue
        print(ten)
        h, tk = cat_tam(ten)
        ghi(ten, h, tk)
