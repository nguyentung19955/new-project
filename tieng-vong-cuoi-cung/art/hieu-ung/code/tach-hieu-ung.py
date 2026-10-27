#!/usr/bin/env python3
"""Biến ẢNH GEN (art/hieu-ung/nguon/*.png, ChatGPT, nền trắng, mỗi hàng 1 dãy khung) thành sprite sheet 2x + JSON
cho game (art/hieu-ung/sprite/). Code KHÔNG vẽ hình hiệu ứng – chỉ:
  1. xoá nền trắng: flood-fill vùng trắng nối mép ảnh (+ lỗ trắng kín bao bởi nét mực) rồi khử viền trắng (unmix)
     – cùng hàm với lúc tách mảnh Lam (rig-v4/code/chung.py: background, unmix_white). Ảnh đã có alpha thì giữ alpha.
  2. tách khung: chiếu theo hàng/cột tìm khe trống; mỗi hàng chọn đúng (số khung − 1) khe rộng nhất làm vạch chia
     (để các hạt rời trong cùng một khung không bị tách nhầm).
  3. thu nhỏ một lần (LANCZOS, nhân alpha trước) về cỡ 2x của cỡ hiển thị trong game, cắt sát từng khung,
     ghi điểm neo của khung (tâm ô gốc / đáy ô với bụi) → mọi khung cùng một hệ neo, không nhảy.
Chạy: python3 -B art/hieu-ung/code/tach-hieu-ung.py   (cần pillow numpy scipy)"""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
HU = os.path.dirname(HERE)
NGUON = os.path.join(HU, 'nguon')
OUT = os.path.join(HU, 'sprite')
RIG_CODE = os.path.normpath(os.path.join(HU, '..', 'modular', 'lam-moi', 'rig-v4', 'code'))
sys.path.insert(0, RIG_CODE)
sys.dont_write_bytecode = True
from chung import white_mask, unmix_white   # noqa: E402

PX2 = 2   # sheet 2x: 2 px nguồn = 1 px logic (cùng quy ước sheet Lam)
# ten: (số hàng, số khung/hàng, tên từng hàng, cỡ LỚN NHẤT trong game (px logic, cạnh dài của khung lớn nhất hàng), neo)
# neo: 'hop' = tâm hộp bao của khung; 'tam' = trọng tâm điểm ảnh (tâm vụ nổ); 'day' = giữa đáy hàng (bụi đặt lên mặt đất)
DS = {
    'vet-chem':    (3, 4, ['ngang', 'cheo-len', 'cheo-xuong'], 150, 'hop'),
    'trung-don':   (1, 5, ['trung-don'], 64, 'tam'),
    'bui':         (2, 5, ['nho', 'to'], None, 'day'),
    'dash':        (1, 5, ['dash'], 104, 'hop'),
    'truot-tuong': (1, 5, ['truot-tuong'], 64, 'hop'),
    'lam-bi-danh': (1, 4, ['lam-bi-danh'], 76, 'tam'),
}
CO_BUI = {'nho': 46, 'to': 92}     # bụi nhỏ (bước chân, nhảy) / to (tiếp đất rơi cao) – cạnh dài khung lớn nhất, px logic


def tach_nen(path):
    im = Image.open(path)
    if im.mode == 'RGBA' and (np.array(im)[..., 3] < 250).mean() > 0.2:
        a = np.array(im)
        a[a[..., 3] == 0] = 0
        return a, 'giữ alpha sẵn có'
    a = np.array(im.convert('RGB')).astype(np.float64)
    # flood-fill: CHỈ vùng trắng nối với mép ảnh là nền. Lỗ trắng kín bên trong (hạt tròn viền mực, lõi khói) là màu
    # của hình → giữ (khác lúc tách mảnh Lam: ở đó lỗ kín là nền lọt vào giữa).
    w = white_mask(a)
    lab, _ = nd.label(w)
    edge = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
    bg = np.isin(lab, edge[edge > 0])
    out = unmix_white(a, ~bg)
    return out, 'xoá nền trắng (flood-fill từ mép) + khử viền trắng'


def khe(proj, thr):
    """các đoạn trống (proj<=thr): list (đầu, cuối, độ rộng)"""
    e = proj <= thr
    res, i, n = [], 0, len(proj)
    while i < n:
        if e[i]:
            j = i
            while j < n and e[j]:
                j += 1
            res.append((i, j, j - i))
            i = j
        else:
            i += 1
    return res


def chia(proj, k, thr):
    """chia trục thành k đoạn: lấy k−1 khe TRONG (không chạm mép) rộng nhất."""
    g = [s for s in khe(proj, thr) if s[0] > 0 and s[1] < len(proj)]
    g = sorted(sorted(g, key=lambda s: -s[2])[:k - 1])
    cuts = [0] + [(s[0] + s[1]) // 2 for s in g] + [len(proj)]
    return [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1)], g


def thu_nho(a, s):
    im = Image.fromarray(a, 'RGBA').convert('RGBa')
    w, h = max(1, round(a.shape[1] * s)), max(1, round(a.shape[0] * s))
    return np.array(im.resize((w, h), Image.LANCZOS).convert('RGBA'))


def xu_ly(ten):
    nhang, nk, hang_ten, co, neo = DS[ten]
    a, cach = tach_nen(os.path.join(NGUON, ten + '.png'))
    al = a[..., 3].astype(np.float64)
    rows, _ = chia((al > 20).sum(1), nhang, 0)
    o_list = []
    for ri, (y0, y1) in enumerate(rows):
        band = al[y0:y1]
        ys = np.nonzero((band > 20).any(1))[0]
        cols, g = chia((band > 20).sum(0), nk, 0)
        if len(cols) != nk:
            raise SystemExit('%s hàng %d: tìm được %d khung, cần %d' % (ten, ri, len(cols), nk))
        o_list.append((ri, y0 + ys.min(), y0 + ys.max() + 1, cols))
    # cỡ: khung lớn nhất của mỗi hàng → cạnh dài = co (px logic) → hệ số thu cho cả hàng
    frames, anims = [], {}
    tiles = []
    for ri, ry0, ry1, cols in o_list:
        ht = hang_ten[ri]
        boxes = []
        for (x0, x1) in cols:
            sub = al[ry0:ry1, x0:x1] > 20
            xs = np.nonzero(sub.any(0))[0]; ys = np.nonzero(sub.any(1))[0]
            boxes.append((x0 + xs.min(), ry0 + ys.min(), x0 + xs.max() + 1, ry0 + ys.max() + 1))
        dai = max(max(b[2] - b[0], b[3] - b[1]) for b in boxes)
        c = CO_BUI[ht] if ten == 'bui' else co
        s = c * PX2 / dai
        ids = []
        for fi, ((x0, x1), b) in enumerate(zip(cols, boxes)):
            # neo trong ảnh gốc: tâm ô (giữa đoạn cột, giữa hàng) hoặc giữa đáy hàng
            if neo == 'tam':
                yy, xx = np.nonzero(al[b[1]:b[3], b[0]:b[2]] > 128)
                nx, ny = b[0] + xx.mean(), b[1] + yy.mean()
            elif neo == 'hop':
                nx, ny = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
            else:
                nx, ny = (b[0] + b[2]) / 2, ry1
            m = 3
            bx0, by0, bx1, by1 = max(b[0] - m, 0), max(b[1] - m, 0), min(b[2] + m, a.shape[1]), min(b[3] + m, a.shape[0])
            cut = a[by0:by1, bx0:bx1].copy()
            cut[..., :3][cut[..., 3] == 0] = 0
            t = thu_nho(cut, s)
            ys, xs = np.nonzero(t[..., 3] > 0)
            t = t[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            ox = (nx - bx0) * s - xs.min()
            oy = (ny - by0) * s - ys.min()
            tiles.append(t)
            frames.append({'w': int(t.shape[1]), 'h': int(t.shape[0]), 'ax': round(float(ox), 2), 'ay': round(float(oy), 2)})
            ids.append(len(frames) - 1)
        anims[ht] = {'khung': ids, 'he_so_thu_tu_anh_gen': round(s, 4), 'co_lon_nhat_px_logic': c}
    # xếp vào sheet: mỗi hàng ảnh gen = 1 hàng sheet, khe 2 px
    KHE = 2
    hang_h, y, W = [], KHE, 0
    rows_ids = [a_['khung'] for a_ in anims.values()]
    for ids in rows_ids:
        x = KHE
        for i in ids:
            frames[i]['x'] = x; frames[i]['y'] = y
            x += frames[i]['w'] + KHE
        W = max(W, x)
        y += max(frames[i]['h'] for i in ids) + KHE
    H = y
    sheet = np.zeros((H, W, 4), np.uint8)
    for f, t in zip(frames, tiles):
        sheet[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']] = t
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(sheet, 'RGBA').save(os.path.join(OUT, ten + '-2x.png'), optimize=True)
    meta = {'ten': ten, 'anh': ten + '-2x.png', 'nguon': '../nguon/' + ten + '.png', 'co_sheet': [W, H],
            'px_nguon_moi_px_logic': PX2, 'neo': neo,
            'cach_tach': cach + '; chia khung theo khe trống rộng nhất; thu LANCZOS (nhân alpha trước) một lần',
            'frames': frames, 'anims': anims,
            'quy_uoc': 'frames[i] = ô trong sheet (x,y,w,h, px nguồn 2x) + điểm neo (ax,ay) trong ô. Vẽ trong game: '
                       'drawImage(sheet, x,y,w,h, X − ax/2·k, Y − ay/2·k, w/2·k, h/2·k) với (X,Y) = điểm đặt (px logic), '
                       'k = tỉ lệ thêm (1 = cỡ gốc); lật = scale(−1,1) quanh (X,Y). Ảnh RGBA alpha thẳng, RGB=0 ở chỗ trong suốt.'}
    json.dump(meta, open(os.path.join(OUT, ten + '-2x.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # ảnh kiểm: nền tối + nền sáng, chấm neo
    sc = 2
    prev = Image.new('RGB', (W * sc, H * sc * 2 + 10), (24, 28, 36))
    d = ImageDraw.Draw(prev)
    d.rectangle([0, H * sc + 10, W * sc, H * sc * 2 + 10], fill=(232, 228, 214))
    big = Image.fromarray(sheet, 'RGBA').resize((W * sc, H * sc), Image.NEAREST)
    prev.paste(big, (0, 0), big); prev.paste(big, (0, H * sc + 10), big)
    for f in frames:
        for oy_ in (0, H * sc + 10):
            X, Y = (f['x'] + f['ax']) * sc, (f['y'] + f['ay']) * sc + oy_
            d.ellipse([X - 3, Y - 3, X + 3, Y + 3], outline=(255, 60, 200), width=2)
    prev.save(os.path.join(OUT, 'kiem-' + ten + '.png'))
    print('%-12s %-48s %d×%d  khung %s' % (ten, cach, W, H, {k: len(v['khung']) for k, v in anims.items()}))
    return meta


if __name__ == '__main__':
    co = []
    for t in DS:
        p = os.path.join(NGUON, t + '.png')
        if os.path.isfile(p):
            m = xu_ly(t)
            co.append({'ten': t, 'anh': m['anh'], 'co_sheet': m['co_sheet']})
        else:
            print('THIẾU ảnh gen:', p, '→ game dùng khung giữ chỗ TẠM')
    json.dump({'hieu_ung': co}, open(os.path.join(OUT, 'danh-sach.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
