#!/usr/bin/env python3
"""Tách tấm tileset chibi (nền trắng) → từng mảnh PNG + danh mục + manh.json (có đường mặt đứng).

Chạy từ tieng-vong-cuoi-cung/:
  python3 tools/chibi-tileset.py art/chibi/tileset/re-cay-reu.png --ra art/chibi/tileset

Ra:
  manh/manh-NN.png       độ phân giải gốc, cắt sát
  manh/32/manh-NN.png    thu nhỏ cho gạch 32 px (hệ số --ti-le, mặc định tự tính: thân thanh ngang dày ≈ 40 px)
  danh-muc.png           lưới đánh số mọi mảnh (bản gốc thu vừa ô) + đường mặt đứng (vàng)
  manh.json              bbox, loại, đường mặt đứng (gốc và cỡ game)

Đường mặt đứng = mép trên lớp rêu sau khi làm mượt (bỏ lá/nhánh nhô lên lẻ tẻ): theo từng cột x.
"""
import argparse, importlib.util, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

_sp = importlib.util.spec_from_file_location('t', os.path.join(os.path.dirname(__file__), 'chibi-tach-khung.py'))
t = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(t)

# Loại từng mảnh – gán tay sau khi xem danh-muc.png (thứ tự: hàng trên→dưới, trái→phải).
LOAI = {
    1: 'nen-ngang-dai', 2: 'nen-ngang-dai', 3: 'nen-ngang-dai', 4: 'goc-phai',
    5: 'goc-trai', 6: 'nen-ngang-ngan', 7: 'nen-ngang-ngan', 8: 'nen-ngang-ngan', 9: 'nen-ngang-ngan', 10: 'goc-phai',
    11: 'khoi', 12: 'khoi', 13: 'khoi', 14: 'khoi', 15: 'goc-trai', 16: 'goc-phai',
    17: 'doc-len', 18: 'doc-xuong', 19: 'doc-xuong', 20: 'doc-len', 21: 'doc-xuong', 22: 'cot',
    23: 'goc-trai', 24: 'goc-trai', 25: 'goc-trai', 26: 'cot', 27: 'goc-phai', 28: 'doc-xuong', 29: 'cot', 30: 'cot',
}
GHI_CHU = {
    1: 'thanh dài, đầu trái có gốc rễ cong xuống', 4: 'thanh dài, đầu phải có gốc rễ cong xuống',
    5: 'thanh ngắn, đầu trái rủ xuống', 10: 'thanh, đầu phải cong xuống thành chân',
    12: 'khối có bậc cao bên phải (mặt đứng 2 mức)', 14: 'khối thấp có bậc cao bên trái',
    15: 'cột cao trái + bậc thấp phải (chữ L)', 16: 'cột cao phải + bậc thấp trái (chữ L ngược)',
    17: 'dốc lên phải, dạng vòm', 18: 'dốc nhỏ xuống phải, đỉnh trái có cột rêu', 19: 'dốc xuống phải, vòm',
    20: 'dốc lên phải, vòm', 21: 'dốc xuống phải', 22: 'cột/bàn: mặt nhỏ trên chân rễ',
    23: 'cột trái + bệ thấp phải (chữ L)', 24: 'cột trái + thanh dài phải', 25: 'cột thấp trái + bệ dài phải',
    26: 'cột đứng (mặt trên nhỏ)', 27: 'bục trên chân rễ, mép phải cao hơn',
    28: 'bục trái rồi thân rễ chéo xuống phải (dốc)', 29: 'bục rộng trên chân rễ chéo', 30: 'bục trên chân rễ xoè',
}
# Đáy mảnh: 'noi' = rễ rủ lơ lửng (bục treo giữa không trung, không đặt sát đất được);
# 'cham-dat' = đáy/chân rễ phẳng, đặt chạm sàn; 'mot-chan' = một đầu có chân rễ chạm đất, đầu kia lơ lửng.
CHAN = {1: 'mot-chan', 2: 'noi', 3: 'noi', 4: 'mot-chan', 5: 'noi', 6: 'noi', 7: 'noi', 8: 'noi', 9: 'noi',
        10: 'mot-chan'}


def bo_lo_trang(rgba, toi_thieu=3):
    a = rgba[..., :3].astype(int)
    trang = (rgba[..., 3] > 0) & (a.min(-1) > 200) & (a.max(-1) - a.min(-1) < 35)
    lab, n = ndi.label(trang)
    out = rgba.copy()
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = lab[sl] == i
        if m.sum() >= toi_thieu:
            mm = ndi.binary_dilation(m, iterations=1)
            out[sl][..., 3][mm] = 0
    return out


def tach(rgba, nho=2500):
    """Thành phần liên thông; mảnh nhỏ (rêu/lá rời) gộp vào mảnh lớn gần nhất."""
    al = rgba[..., 3] > 128
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    ar = ndi.sum(al, lab, range(1, n + 1)); sl = ndi.find_objects(lab)
    chinh = [i + 1 for i in range(n) if ar[i] >= nho]
    nhom = {c: [c] for c in chinh}
    gop = 0
    for i in range(n):
        if ar[i] >= nho or ar[i] < 4:
            continue
        y0, y1, x0, x1 = sl[i][0].start, sl[i][0].stop, sl[i][1].start, sl[i][1].stop
        def kc(c):
            s = sl[c - 1]
            return np.hypot(max(0, s[1].start - x1, x0 - s[1].stop), max(0, s[0].start - y1, y0 - s[0].stop))
        best = min(chinh, key=kc)
        nhom[best].append(i + 1); gop += 1
    manh = []
    for c, ds in nhom.items():
        m = np.isin(lab, ds)
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        mm = ndi.binary_dilation(m, iterations=2)[y0:y1, x0:x1]
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(mm, crop[..., 3], 0)
        manh.append(dict(img=crop, bbox=[int(x0), int(y0), int(x1 - x0), int(y1 - y0)], n_gop=len(ds) - 1))
    # sắp hàng: gom theo đỉnh bbox (khoảng cách > 60 px là hàng mới), trong hàng trái → phải
    manh.sort(key=lambda q: q['bbox'][1])
    hang, cur = [], [manh[0]]
    for q in manh[1:]:
        if q['bbox'][1] - cur[-1]['bbox'][1] > 60:
            hang.append(cur); cur = [q]
        else:
            cur.append(q)
    hang.append(cur)
    out = []
    for r, h in enumerate(hang, 1):
        for q in sorted(h, key=lambda q: q['bbox'][0]):
            q['hang'] = r; out.append(q)
    return out, gop


def mat_dung(img):
    """y mép trên (đã mượt) theo từng cột; None ở cột trống. Bỏ lá/nhánh mảnh nhô lên bằng opening."""
    al = img[..., 3] > 128
    op = ndi.binary_opening(al, structure=np.ones((9, 9)))
    H, W = al.shape
    y = np.full(W, np.nan)
    co = op.any(0)
    y[co] = op.argmax(0)[co]
    # trung vị trượt 31 px: bỏ gờ rêu lẻ
    v = y.copy()
    for x in range(W):
        w = y[max(0, x - 15):x + 16]
        w = w[~np.isnan(w)]
        if len(w) and not np.isnan(y[x]):
            v[x] = np.median(w)
    return v


def do_day(img, y):
    """Độ dày thân (từ mặt đứng xuống tới chỗ alpha đứt lần đầu), trung vị theo cột ở 60% giữa."""
    al = img[..., 3] > 128
    W = al.shape[1]
    d = []
    for x in range(int(W * 0.2), int(W * 0.8)):
        if np.isnan(y[x]):
            continue
        col = al[int(y[x]):, x]
        k = np.argmin(col) if (~col).any() else len(col)
        d.append(k)
    return float(np.median(d)) if d else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vao'); ap.add_argument('--ra', required=True)
    ap.add_argument('--ti-le', type=float, help='hệ số gốc → game (mặc định: thanh ngang dày ≈ --day px)')
    ap.add_argument('--day', type=float, default=40, help='độ dày thân thanh ngang trên màn (px)')
    a = ap.parse_args()

    rgba = bo_lo_trang(t.bo_nen(np.asarray(Image.open(a.vao).convert('RGB'))))
    manh, gop = tach(rgba)
    for i, q in enumerate(manh, 1):
        q['so'] = i
        q['mat'] = mat_dung(q['img'])
        q['day'] = do_day(q['img'], q['mat'])
    day_ngang = [q['day'] for q in manh if LOAI.get(q['so'], '').startswith('nen-ngang')]
    s = a.ti_le or a.day / float(np.median(day_ngang))
    print(f'{len(manh)} mảnh, gộp {gop} mảnh vụn; thân thanh ngang dày (gốc) {np.median(day_ngang):.0f} px → tỉ lệ {s:.3f}')

    dm = os.path.join(a.ra, 'manh'); os.makedirs(os.path.join(dm, '32'), exist_ok=True)
    ds = []
    for q in manh:
        n = q['so']; ten = f'manh-{n:02d}.png'
        Image.fromarray(q['img'], 'RGBA').save(os.path.join(dm, ten), optimize=True)
        g = Image.fromarray(t.doi_co(q['img'], s), 'RGBA')
        g.save(os.path.join(dm, '32', ten), optimize=True)
        y = q['mat']; W = len(y)
        cot = [x for x in range(W) if not np.isnan(y[x])]
        # mẫu theo cột: gốc mỗi 16 px; game mỗi 4 px (toạ độ trong ảnh manh/32)
        goc = [[x, int(round(y[x]))] for x in range(cot[0], cot[-1] + 1, 16) if not np.isnan(y[x])]
        if goc[-1][0] != cot[-1]:
            goc.append([cot[-1], int(round(y[cot[-1]]))])
        gw = g.width
        game = []
        for gx in list(range(0, gw, 4)) + [gw - 1]:
            x = min(W - 1, int(round(gx / s)))
            if not np.isnan(y[x]):
                game.append([gx, int(round(y[x] * s))])
        yy = y[~np.isnan(y)]
        ds.append(dict(so=n, file=f'manh/{ten}', file_game=f'manh/32/{ten}', hang=q['hang'],
                       loai=LOAI.get(n, '?'), day_manh=CHAN.get(n, 'cham-dat'), ghi_chu=GHI_CHU.get(n, ''),
                       bbox_goc=q['bbox'], co_game=[g.width, g.height],
                       day_than_goc=round(q['day']), day_than_game=round(q['day'] * s),
                       mat_dung_y_trung_vi_game=int(round(np.median(yy) * s)),
                       mat_dung_y_min_max_game=[int(round(yy.min() * s)), int(round(yy.max() * s))],
                       mat_dung_goc=goc, mat_dung_game=game, so_vun_gop=q['n_gop']))
    json.dump(dict(vao=a.vao, ti_le_game=round(s, 4),
                   ghi_chu=('Toạ độ trong ảnh mảnh (gốc trên-trái). mat_dung_*: [x, y] = y mép trên rêu tại cột x; '
                            'nhân vật đứng ở y đó (có thể lún 2–3 px cỡ game cho chân chìm vào rêu). '
                            'Đường mặt đứng dò tự động từ alpha – rêu rủ/rễ cong ở mép mảnh có thể làm 1–2 điểm đầu/cuối thấp hơn mặt thật.'),
                   manh=ds), open(os.path.join(a.ra, 'manh.json'), 'w'), ensure_ascii=False, indent=1)

    # danh mục: lưới 6 cột, mỗi ô 300×260, ảnh gốc thu vừa, đường mặt đứng vàng
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
        f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except Exception:
        f = f2 = ImageFont.load_default()
    C, CW, CH = 6, 300, 270
    R = (len(manh) + C - 1) // C
    o = Image.new('RGB', (C * CW, R * CH + 40), (40, 42, 48)); d = ImageDraw.Draw(o)
    d.text((10, 10), f'Tileset rễ cây rêu – {len(manh)} mảnh. Vàng = đường mặt đứng. Tỉ lệ game {s:.3f}', fill=(230, 230, 230), font=f)
    for i, q in enumerate(manh):
        cx, cy = (i % C) * CW, (i // C) * CH + 40
        im = q['img']; k = min((CW - 20) / im.shape[1], (CH - 60) / im.shape[0], 1)
        sm = Image.fromarray(t.doi_co(im, k), 'RGBA')
        ox, oy = cx + (CW - sm.width) // 2, cy + 30 + (CH - 60 - sm.height) // 2
        bg = Image.new('RGBA', sm.size, (40, 42, 48, 255)); bg.alpha_composite(sm)
        o.paste(bg.convert('RGB'), (ox, oy))
        pts = [(ox + x * k, oy + y * k) for x, y in enumerate(q['mat']) if not np.isnan(y)]
        d.line(pts, fill=(255, 220, 0), width=2)
        d.rectangle([cx + 2, cy + 2, cx + CW - 3, cy + CH - 3], outline=(70, 72, 80))
        d.text((cx + 8, cy + 6), f'{q["so"]:02d}', fill=(255, 210, 120), font=f)
        d.text((cx + 46, cy + 9), f'{LOAI.get(q["so"], "?")}  {q["bbox"][2]}×{q["bbox"][3]}', fill=(190, 200, 215), font=f2)
    o.save(os.path.join(a.ra, 'danh-muc.png'), optimize=True)


if __name__ == '__main__':
    main()
