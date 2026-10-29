"""Chuyển ảnh GEN "giả pixel" (ChatGPT…) → PIXEL THẬT theo palette.json.

Lệnh 1 dòng (từ thư mục tieng-vong-cuoi-cung/):
    python3 art/huong-moi/lam-pixel/code/chuyen_pixel.py <anh.png> [--o N] [--ten ten] [--neo-mat] [--vien them|thay|khong]

Các bước:
 1. Tách nền trắng: điểm gần trắng NỐI với mép ảnh → trong suốt (giữ trắng nằm bên trong hình).
 2. Dò cỡ ô điểm ảnh giả (tự động theo chu kỳ biên màu; --o N để chỉnh tay).
 3. Lấy mẫu theo ô: màu TRỘI (sau khi ép bảng màu) trong ô; ô < 50 % phủ → trong suốt.
 4. Ép bảng màu cố định (palette.json).
 5. Viền ngoài 1 điểm màu tối: 'thay' = điểm mép hình đổi thành mực nếu đang sáng (mặc định),
    'them' = thêm 1 điểm mực bên ngoài, 'khong' = bỏ.
 6. Tách từng hình theo thành phần liên thông (8 hướng), bỏ mảnh < 12 điểm, xếp trái→phải, trên→dưới.
 7. Neo chân chung (đế thấp nhất của mỗi hình = cùng hàng), căn ngang theo MẮT (điểm hổ phách) nếu --neo-mat,
    không thì theo giữa đế.
 8. Xuất: <ra>/<ten>-<i>.png (1 px = 1 điểm), <ten>-sheet.png (ô đều), <ten>.json (ô, neo, mắt, cỡ ô dò được),
    <ten>-x8.png để xem.
Mặc định ra: art/huong-moi/lam-pixel/tu-anh-gen/<ten>/
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixel import Anh, gan_nhat, k, GOC, RGB

HO_PHACH = {k('E'), k('e'), k('o')}


def tach_nen(rgb, nguong=232):
    h, w, _ = rgb.shape
    trang = (rgb.min(-1) >= nguong)
    nen = np.zeros((h, w), bool)
    st = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)]
    st = [(y, x) for y, x in st if trang[y, x]]
    for y, x in st:
        nen[y, x] = True
    while st:
        y, x = st.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and trang[yy, xx] and not nen[yy, xx]:
                nen[yy, xx] = True; st.append((yy, xx))
    return ~nen


def do_co_o(rgb, phu, lo=3, hi=24):
    """chu kỳ biên màu theo hai trục → cỡ ô + pha"""
    g = rgb.astype(np.int32)
    ex = (np.abs(np.diff(g, axis=1)).sum(-1) > 40) & phu[:, 1:]
    ey = (np.abs(np.diff(g, axis=0)).sum(-1) > 40) & phu[1:, :]
    cx, cy = ex.sum(0).astype(float), ey.sum(1).astype(float)
    best = None
    for n in range(lo, hi + 1):
        for ph in range(n):
            sx = cx[ph::n].sum() / max(1, cx.sum()) if len(cx) else 0
            sy = cy[ph::n].sum() / max(1, cy.sum()) if len(cy) else 0
            # điểm = phần biên rơi đúng lưới, trừ kỳ vọng ngẫu nhiên 1/n
            sc = (sx - 1 / n) + (sy - 1 / n)
            if best is None or sc > best[0] + 1e-9:
                best = (sc, n, ph)
    _, n, ph = best
    # pha y riêng
    phy = max(range(n), key=lambda p: cy[p::n].sum())
    return n, ph, phy


def lay_mau(rgb, phu, n, phx, phy):
    h, w, _ = rgb.shape
    x0, y0 = phx - n if phx else 0, phy - n if phy else 0
    cot = list(range(x0, w, n)); hang = list(range(y0, h, n))
    out = Anh(len(cot), len(hang))
    idx_all = gan_nhat(rgb.reshape(-1, 3)).reshape(h, w)
    for j, y in enumerate(hang):
        for i, x in enumerate(cot):
            ya, yb, xa, xb = max(0, y), min(h, y + n), max(0, x), min(w, x + n)
            if yb <= ya or xb <= xa:
                continue
            m = phu[ya:yb, xa:xb]
            if m.mean() < 0.5:
                continue
            # bỏ viền 1 px quanh ô (nhoè giữa hai ô giả)
            core = idx_all[ya:yb, xa:xb][m]
            if n >= 5:
                mm = np.zeros_like(m); mm[1:-1, 1:-1] = True
                c2 = idx_all[ya:yb, xa:xb][m & mm]
                if len(c2): core = c2
            out.a[j, i] = np.bincount(core, minlength=len(RGB)).argmax()
    return out


def vien(a, kieu):
    if kieu == 'khong':
        return
    if kieu == 'them':
        a.vien_ngoai('k'); return
    m = a.a >= 0
    n = np.zeros_like(m)
    n[1:, :] |= ~m[:-1, :]; n[:-1, :] |= ~m[1:, :]; n[:, 1:] |= ~m[:, :-1]; n[:, :-1] |= ~m[:, 1:]
    n[0, :] = n[-1, :] = True; n[:, 0] = n[:, -1] = True
    mep = m & n
    lum = (RGB[:, 0] * 3 + RGB[:, 1] * 4 + RGB[:, 2] * 2) / 9
    sang = np.zeros_like(m)
    sang[m] = lum[a.a[m]] > 70
    a.a[mep & sang] = k('k')


def thanh_phan(a, it=12):
    m = a.a >= 0
    lab = np.zeros(m.shape, int); n = 0; ds = []
    for y, x in zip(*np.nonzero(m)):
        if lab[y, x]:
            continue
        n += 1; st = [(y, x)]; lab[y, x] = n; pts = []
        while st:
            cy, cx = st.pop(); pts.append((cy, cx))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < m.shape[0] and 0 <= xx < m.shape[1] and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; st.append((yy, xx))
        if len(pts) >= it:
            ds.append(np.array(pts))
    # xếp theo hàng (đỉnh) rồi trái → phải
    ds.sort(key=lambda p: (p[:, 0].min() // 20, p[:, 1].min()))
    return ds


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('anh'); ap.add_argument('--o', type=int, default=0, help='cỡ ô điểm ảnh giả (0 = tự dò)')
    ap.add_argument('--ten', default=''); ap.add_argument('--ra', default='')
    ap.add_argument('--neo-mat', action='store_true'); ap.add_argument('--vien', default='thay', choices=['thay', 'them', 'khong'])
    ap.add_argument('--nguong-trang', type=int, default=232)
    g = ap.parse_args()
    ten = g.ten or os.path.splitext(os.path.basename(g.anh))[0]
    ra = g.ra or os.path.join(GOC, 'tu-anh-gen', ten); os.makedirs(ra, exist_ok=True)
    rgb = np.asarray(Image.open(g.anh).convert('RGB'))
    phu = tach_nen(rgb, g.nguong_trang)
    if g.o:
        n = g.o; phx = phy = 0
        cx = (np.abs(np.diff(rgb.astype(int), axis=1)).sum(-1) > 40).sum(0)
        phx = max(range(n), key=lambda p: cx[p::n].sum())
        cy = (np.abs(np.diff(rgb.astype(int), axis=0)).sum(-1) > 40).sum(1)
        phy = max(range(n), key=lambda p: cy[p::n].sum())
    else:
        n, phx, phy = do_co_o(rgb, phu)
    a = lay_mau(rgb, phu, n, (phx + 1) % n, (phy + 1) % n)
    vien(a, g.vien)
    ds = thanh_phan(a)
    hinh = []
    for pts in ds:
        y0, x0 = pts.min(0); y1, x1 = pts.max(0)
        b = Anh(x1 - x0 + 1, y1 - y0 + 1)
        for (y, x) in pts:
            b.a[y - y0, x - x0] = a.a[y, x]
        mat = [(x, y) for y in range(b.h) for x in range(b.w) if b.a[y, x] in HO_PHACH]
        day = [x for x in range(b.w) if b.a[b.h - 1, x] >= 0]
        hinh.append(dict(anh=b, mat=(np.mean([p[0] for p in mat]), np.mean([p[1] for p in mat])) if mat else None,
                         day_x=(min(day) + max(day)) / 2 if day else b.w / 2))
    if not hinh:
        print('Không thấy hình nào – thử --o hoặc --nguong-trang'); return
    # ô chung: neo chân chung, căn ngang theo mắt (hoặc đế)
    def nx(h):
        return h['mat'][0] if (g.neo_mat and h['mat']) else h['day_x']
    trai = max(round(nx(h)) for h in hinh); phai = max(h['anh'].w - round(nx(h)) for h in hinh)
    cao = max(h['anh'].h for h in hinh)
    OW, OH = trai + phai + 2, cao + 2
    sheet = Anh(OW * len(hinh), OH)
    meta = {'nguon': os.path.relpath(g.anh), 'co_o_gia_px': int(n), 'pha': [int(phx), int(phy)], 'o': [int(OW), int(OH)], 'neo': [int(trai + 1), int(OH - 1)],
            'can_ngang': 'mat' if g.neo_mat else 'giua_de', 'hinh': []}
    for i, h in enumerate(hinh):
        b = h['anh']; ox = i * OW + trai + 1 - round(nx(h)); oy = OH - 1 - b.h
        sheet.dan(b, ox, oy)
        b.luu(os.path.join(ra, f'{ten}-{i}.png'))
        meta['hinh'].append({'o': [int(i * OW), 0, int(OW), int(OH)], 'co': [int(b.w), int(b.h)],
                             'mat': [round(float(h['mat'][0] + ox - i * OW), 1), round(float(h['mat'][1] + oy), 1)] if h['mat'] else None})
    sheet.luu(os.path.join(ra, f'{ten}-sheet.png'))
    sheet.luu(os.path.join(ra, f'{ten}-x8.png'), 8)
    json.dump(meta, open(os.path.join(ra, f'{ten}.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'{ten}: ô giả {n} px, {len(hinh)} hình, ô {OW}×{OH} → {os.path.relpath(ra)}')


if __name__ == '__main__':
    main()
