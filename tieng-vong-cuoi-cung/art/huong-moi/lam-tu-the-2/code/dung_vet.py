#!/usr/bin/env python3
"""Dựng sheet VỆT CHÉM GEN (29/10) – thay vệt mẫu vẽ bằng code (PH13). Một lệnh:

    python3 art/huong-moi/lam-tu-the-2/code/dung_vet.py

Nguồn (nền trắng, art/huong-moi/nguon/vet-chem/):
    vet-ngang-4o.png             1 hàng × 4: liềm ngang            → chém 1 (n 1) VÀ chém trên không (n 6)
    vet-cheo-len-4o-hat-4o.png   hàng 1 × 4: chéo lên              → chém 2 (n 2) ; hàng 2 × 4: cung dọc lên → chém hất (n 5)
    vet-bo-xuong-4o-pogo-3o.png  hàng 1 × 4: bổ xuống              → chém 3 (n 3) ; hàng 2 × 3: nêm / cung ép / mảnh → pogo (n 4)
Ra: sprite/vet-gen-{2x,3x}.png + .json (game/thu-lam-moi-2 đọc; ?vet=code = vệt mẫu code cũ để so), kiem/vet-gen-dat.png (ảnh kiểm vị trí).

TÁCH NỀN: nền ảnh gen là trắng TRUNG TÍNH (≈254,254,254 có nhiễu), còn lõi vệt là kem rất sáng (≈254,253,247 – chỉ khác nền ở kênh xanh
lam thấp hơn). Nền = điểm sáng (min kênh > 238) VÀ trung tính (R − B ≤ 4, max − min ≤ 6) NỐI với mép ảnh (tô loang) – không đục lỗ trong
(lõi kem có chấm trung tính lẻ). Mép: alpha mềm theo "độ tối/ấm hơn trắng" so với màu điểm trong gần nhất (như tach.py), giữ mép mờ.
CHIA Ô: lưới đều theo hàng (hàng tách ở giữa khe trắng); mỗi mảnh liền gán vào ô chứa TÂM của nó (mảnh vụn bay giữ đúng ô của khung).
Toạ độ khung giữ NGUYÊN vị trí trong ô (không căn giữa từng khung) → các khung cùng một phép đặt.

ĐẶT (px logic so với chân Lam, nhìn phải): mỗi đòn một phép co đều + dời (không xoay):
    1. khung "đầy" (ô 2 – cung đầy; pogo: ô 2 cung ép) khớp HỘP MỤC TIÊU = đường quét thực đo trên tư thế (như vệt mẫu, số trong DAT)
       – co đều theo căn(diện tích), tâm trùng tâm hộp mục tiêu;
    2. LÕI SÁNG (điểm kem sáng nhất, đục, của khung đầy) phải nằm TRONG hộp đòn thật (ATK lúc chạy, lùi vào 1 px): nếu thò ra thì
       dời ít nhất có thể; dời không đủ thì co nhỏ dần (tối thiểu 0,7). Mép trang trí / mảnh vụn được vượt hộp.
Pogo: gốc = điểm giữa mép trên của nêm, đặt dưới mũi dao theo tư thế (VP trong game: P1 nghiêng theo lưỡi, P2 thẳng xuống).
Không đổi hộp / sát thương – chỉ là hình."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
import cv2

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..'))
NGUON = os.path.normpath(os.path.join(GOC, '..', 'nguon', 'vet-chem'))
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    FONT = ImageFont.load_default()

# hộp đòn THẬT (ATK lúc chạy trang thu-lam-moi-2, đọc 29/10): [x, y, w, h] so với chân, nhìn phải. Không đổi – chỉ để kiểm lõi.
HOP = {1: [4, -97, 86, 48], 2: [-10, -100, 90, 48], 3: [-13, -59, 99, 59], 4: [-26, -24, 64, 82], 5: [-9, -140, 87, 60], 6: [-3, -107, 95, 48]}
# hộp mục tiêu của khung đầy = đường quét đo trên tư thế (kiem/thu3-do-dao.png, thu4-do-dao.png – như vệt mẫu code):
DAT = {
    1: dict(hang='ngang', muc=[4, -66, 92, -28], do='chém 1: lưỡi B (10,−47)→(57,−48), C chúc tới (47,−20); liềm mẫu tâm y −47, hai đầu x 6, bụng x 86'),
    6: dict(hang='ngang', muc=[6, -85, 94, -47], do='trên không: lưỡi K2 ngang y −60, mũi x 81; liềm mẫu tâm (8 → 88, −66)'),
    2: dict(hang='cheo', muc=[0, -106, 66, -14], do='chém 2: mũi dao C2A (5,−12) → C2B (55,−97), tay ~ vai (0,−58)'),
    5: dict(hang='hat', muc=[22, -150, 70, -8], do='hất: mũi H1 (50,−8) → H2 (55,−110) → H3 (30,−145)'),
    3: dict(hang='bo', muc=[6, -134, 84, -4], do='chém 3: mũi C3B (10,−131) trên đầu → C3C (52,−4); hộp mục tiêu dời phải 12 px so với đường quét vì lõi phải hạ xuống hộp thấp (y −59…0) – ở x gốc cung đè lên mặt Lam'),
    4: dict(hang='pogo', rong=46, do='pogo: nêm/cung rộng ~46 px dưới mũi dao (vệt mẫu: 28 → 46 rộng, sâu 17 → 25)'),
}
HANG = {   # tên hàng → (file, chỉ số hàng trong ảnh, số hàng ảnh, số ô)
    'ngang': ('vet-ngang-4o.png', 0, 1, 4),
    'cheo': ('vet-cheo-len-4o-hat-4o.png', 0, 2, 4), 'hat': ('vet-cheo-len-4o-hat-4o.png', 1, 2, 4),
    'bo': ('vet-bo-xuong-4o-pogo-3o.png', 0, 2, 4), 'pogo': ('vet-bo-xuong-4o-pogo-3o.png', 1, 2, 3),
}
KHE = 2


def tach(path):
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mn = rgb.min(-1); mx = rgb.max(-1)
    trang = (mn > 238) & (r - b <= 4) & (mx - mn <= 6)
    lab, _ = ndi.label(trang)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen = np.isin(lab, list(mep))
    fg = ~nen
    fg = ndi.binary_opening(fg, iterations=1) | (fg & ndi.binary_erosion(fg, iterations=1))
    trong = ndi.binary_erosion(fg, iterations=2)
    if not trong.any(): trong = fg
    _, idx = ndi.distance_transform_edt(~trong, return_indices=True)
    F = rgb[idx[0], idx[1]]
    dai = fg & ~trong
    num = (255 - rgb).sum(-1); den = np.maximum((255 - F).sum(-1), 6)
    a = np.clip(num / den, 0, 1)
    alpha = np.where(trong, 1.0, np.where(dai, a, 0.0))
    # mép mềm thêm 1 px ra ngoài (khử răng cưa, giữ mép mờ của ảnh gen)
    vien = ndi.binary_dilation(fg, iterations=1) & ~fg
    alpha = np.where(vien, np.clip(num / den, 0, 1) * 0.6, alpha)
    with np.errstate(divide='ignore', invalid='ignore'):
        Ct = (rgb - (1 - alpha[..., None]) * 255) / np.maximum(alpha[..., None], 1e-3)
    Ct = np.clip(Ct, 0, 255)
    Ct = np.where((alpha[..., None] < 0.999), 0.4 * Ct + 0.6 * F, rgb)
    alpha[alpha < 0.04] = 0
    out = np.dstack([Ct, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    out[out[..., 3] == 0, :3] = 0
    return out


def chia(rgba, hang_i, so_hang, so_o):
    """→ (cw, ch, [khung]): khung = (ảnh RGBA cắt, ox, oy toạ độ góc trong ô, px gen), ô đều theo hàng"""
    H, W = rgba.shape[:2]; a = rgba[..., 3] > 8
    # biên hàng: giữa khe trắng dài nhất giữa các hàng
    rows = a.any(1); bien = [0]
    if so_hang > 1:
        runs = []; s = None
        for y, v in enumerate(rows):
            if not v and s is None: s = y
            if v and s is not None: runs.append((s, y)); s = None
        runs = [r for r in runs if r[0] > 0]; runs.sort(key=lambda r: r[0] - r[1])
        bien += sorted((r[0] + r[1]) // 2 for r in runs[:so_hang - 1])
    bien.append(H)
    y0, y1 = bien[hang_i], bien[hang_i + 1]
    sub = rgba[y0:y1]; am = sub[..., 3] > 8
    lab, n = ndi.label(ndi.binary_dilation(am, iterations=2))
    tam = ndi.center_of_mass(am, lab, range(1, n + 1)) if n else []
    cw = W / so_o; ra = []
    for i in range(so_o):
        keep = np.zeros_like(am)
        for k in range(n):
            if int(tam[k][1] // cw) == i: keep |= (lab == k + 1)
        keep &= am
        ys, xs = np.nonzero(keep)
        x0, x1, yy0, yy1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        im = sub[yy0:yy1, x0:x1].copy(); im[~keep[yy0:yy1, x0:x1]] = 0
        ra.append((im, float(x0 - i * cw), float(yy0)))
    return cw, float(y1 - y0), ra


def loi(im):
    """mặt nạ LÕI SÁNG: điểm đục (alpha > 0,95) kem sáng (độ sáng ≥ 236, ấm) – phần 'gây cảm giác chạm'"""
    rgb = im[..., :3].astype(np.float32); L = rgb.mean(-1)
    m = (im[..., 3] > 242) & (L >= 236) & (rgb[..., 0] >= rgb[..., 2] + 2)
    m = ndi.binary_opening(m, iterations=2)
    lab, n = ndi.label(m)
    if n > 1:   # bỏ chấm lẻ: giữ các mảnh ≥ 15 % mảnh lớn nhất
        co = ndi.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [k + 1 for k in range(n) if co[k] >= 0.15 * co.max()])
    return m


def bbox(m):
    ys, xs = np.nonzero(m); return [float(xs.min()), float(ys.min()), float(xs.max() + 1), float(ys.max() + 1)]


def dat_mot(n, d, khung, cw):
    """phép đặt cho đòn n: logic = (x, y) + s · (điểm trong ô, px gen). Trả dict + số kiểm"""
    im, ox, oy = khung[1]
    a = im[..., 3] > 20; bb = bbox(a); bb = [bb[0] + ox, bb[1] + oy, bb[2] + ox, bb[3] + oy]
    lm = loi(im); lb = bbox(lm) if lm.any() else bb; lb = [lb[0] + ox, lb[1] + oy, lb[2] + ox, lb[3] + oy]
    hx, hy, hw, hh = HOP[n]; H0 = [hx + 1, hy + 1, hx + hw - 1, hy + hh - 1]
    if n == 4:   # pogo: co theo bề ngang khung cung ép; gốc = giữa mép trên khung nêm (ô 1)
        s = d['rong'] / (bb[2] - bb[0])
        i0, ox0, oy0 = khung[0]; b0 = bbox(i0[..., 3] > 20)
        goc = [ox0 + (b0[0] + b0[2]) / 2, oy0 + b0[1]]
        return {'hang': 'pogo', 's': s, 'goc_gen': goc, 'loi_logic_tu_goc': [(lb[0] - goc[0]) * s, (lb[1] - goc[1]) * s, (lb[2] - goc[0]) * s, (lb[3] - goc[1]) * s],
                'khung_logic_tu_goc': [(bb[0] - goc[0]) * s, (bb[1] - goc[1]) * s, (bb[2] - goc[0]) * s, (bb[3] - goc[1]) * s], 'do': d['do']}
    mx0, my0, mx1, my1 = d['muc']
    s0 = np.sqrt((mx1 - mx0) * (my1 - my0) / ((bb[2] - bb[0]) * (bb[3] - bb[1])))
    best = None
    for s in np.linspace(s0, s0 * 0.4, 61):
        cx, cy = (mx0 + mx1) / 2, (my0 + my1) / 2
        x = cx - s * (bb[0] + bb[2]) / 2; y = cy - s * (bb[1] + bb[3]) / 2
        L = [x + s * lb[0], y + s * lb[1], x + s * lb[2], y + s * lb[3]]
        dx = max(0, H0[0] - L[0]) - max(0, L[2] - H0[2]); dy = max(0, H0[1] - L[1]) - max(0, L[3] - H0[3])
        if L[2] - L[0] > H0[2] - H0[0] or L[3] - L[1] > H0[3] - H0[1]: continue
        cost = np.hypot(dx, dy) + 40 * (1 - s / s0)   # ưu tiên dời ít, rồi mới co
        if best is None or cost < best[0]: best = (cost, s, x + dx, y + dy, dx, dy)
        if dx == 0 and dy == 0: break
    _, s, x, y, dx, dy = best
    return {'hang': d['hang'], 's': float(s), 'x': float(x), 'y': float(y), 'co_so_muc': round(float(s / s0), 3), 'doi': [round(float(dx), 1), round(float(dy), 1)],
            'khung_day_logic': [round(x + s * v, 1) for v in (bb[0], bb[1], bb[2], bb[3])] if False else
            [round(x + s * bb[0], 1), round(y + s * bb[1], 1), round(x + s * bb[2], 1), round(y + s * bb[3], 1)],
            'loi_logic': [round(x + s * lb[0], 1), round(y + s * lb[1], 1), round(x + s * lb[2], 1), round(y + s * lb[3], 1)],
            'hop': HOP[n], 'muc': d['muc'], 'do': d['do']}


def thu(im, k):
    a = im.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    w, h = max(1, int(round(im.shape[1] * k))), max(1, int(round(im.shape[0] * k)))
    r = cv2.resize(pm, (w, h), interpolation=cv2.INTER_AREA if k < 1 else cv2.INTER_LANCZOS4)
    al = np.clip(r[..., 3:4], 0, 1); rgb = np.where(al > 1e-4, r[..., :3] / np.maximum(al, 1e-4), 0)
    o = (np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8); o[o[..., 3] == 0, :3] = 0
    return o


def main():
    anh = {}; khung = {}
    for ten, (f, hi, sh, so) in HANG.items():
        if f not in anh: anh[f] = tach(os.path.join(NGUON, f))
        khung[ten] = chia(anh[f], hi, sh, so)
    dat = {n: dat_mot(n, d, khung[d['hang']][2], khung[d['hang']][0]) for n, d in DAT.items()}
    for n, v in dat.items(): print(n, v['hang'], 's %.4f' % v['s'], {k: v[k] for k in v if k in ('doi', 'co_so_muc', 'loi_logic', 'khung_day_logic', 'loi_logic_tu_goc')})
    # hệ số atlas mỗi hàng: px atlas / px gen = (s lớn nhất của các đòn dùng hàng) × bội
    smax = {}
    for v in dat.values(): smax[v['hang']] = max(smax.get(v['hang'], 0), v['s'])
    for boi in (2, 3):
        o = []; x = 0; y = 0; hmax = 0; W = 2048; fr = {}
        tiles = []
        for ten in HANG:
            k = smax[ten] * boi; fr[ten] = {'px_atlas_moi_px_gen': k, 'khung': []}
            for im, ox, oy in khung[ten][2]:
                t = thu(im, k); tiles.append((ten, t, ox, oy))
        # xếp kệ
        pos = []
        for ten, t, ox, oy in tiles:
            h, w = t.shape[:2]
            if x + w > W: x = 0; y += hmax + KHE; hmax = 0
            pos.append((ten, t, ox, oy, x, y)); x += w + KHE; hmax = max(hmax, h)
        H = y + hmax; sheet = np.zeros((H, W, 4), np.uint8)
        for ten, t, ox, oy, X, Y in pos:
            h, w = t.shape[:2]; sheet[Y:Y + h, X:X + w] = t
            fr[ten]['khung'].append({'x': X, 'y': Y, 'w': w, 'h': h, 'ox': round(ox, 2), 'oy': round(oy, 2)})
        used = max(X + t.shape[1] for _, t, _, _, X, _ in pos); sheet = sheet[:, :used]
        ten_anh = 'vet-gen-%dx.png' % boi
        Image.fromarray(sheet).save(os.path.join(GOC, 'sprite', ten_anh), optimize=True)
        meta = {'ten': 'Vệt chém gen (29/10) – thay vệt mẫu code PH13, sheet %dx' % boi, 'anh': ten_anh, 'co_sheet': [sheet.shape[1], sheet.shape[0]],
                'dinh_dang': 'PNG RGBA alpha thẳng; khung giữ vị trí trong ô của ảnh gen: (ox, oy) = góc khung trong ô, px gen',
                'nguon': {k: 'art/huong-moi/nguon/vet-chem/' + v[0] + ' hàng %d/%d' % (v[1] + 1, v[2]) for k, v in HANG.items()},
                'hang': fr,
                'dat': {str(n): v for n, v in dat.items()},
                'cach_ve': 'điểm logic (so với chân, nhìn phải) = (x, y) + s · (điểm trong ô, px gen); điểm trong ô = (ox, oy) + px atlas / px_atlas_moi_px_gen. '
                           'Pogo: gốc goc_gen đặt tại VP (dưới mũi dao), xoay theo VP.goc, mũi xuống. Lật theo hướng nhìn (scale −1 quanh chân).',
                'nhip': {'chem': '8 bước active (đúng các tick hộp bật) chia 1/3/2/2 → ô 1/2/3/4; ngoài tick hộp không vẽ',
                         'pogo': 'atkT 1–2 ô 1 (nêm, theo P1) · 3–5 ô 2 (cung ép, theo P2) · 6–8 ô 3 (mảnh) · 9–10 ô 3 mờ; nảy / hết hộp → tắt ngay'}}
        json.dump(meta, open(os.path.join(GOC, 'sprite', 'vet-gen-%dx.json' % boi), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('ghi', ten_anh, sheet.shape)
    kiem(khung, dat)


def kiem(khung, dat):
    """kiem/vet-gen-dat.png: mỗi đòn – khung đầy đặt ở cỡ 3 px/px logic trên nền tối, hộp đòn (đỏ), lõi (vàng), hộp mục tiêu (xanh), chân (chấm)"""
    K = 3; cols = []
    for n in (1, 2, 3, 5, 6, 4):
        v = dat[n]; ks = khung[v['hang']][2]
        W, H = 150 * K, 190 * K; c = Image.new('RGBA', (W, H), (24, 28, 36, 255)); dr = ImageDraw.Draw(c)
        X0, Y0 = 50 * K, 160 * K   # chân
        if n == 4: X0, Y0 = 75 * K, 60 * K
        for j, (im, ox, oy) in enumerate(ks):
            if j != 1: continue
            s = v['s']
            t = Image.fromarray(thu(im, s * K))
            if n == 4: px, py = X0 + (ox - v['goc_gen'][0]) * s * K, Y0 + (oy - v['goc_gen'][1]) * s * K
            else: px, py = X0 + (v['x'] + s * ox) * K, Y0 + (v['y'] + s * oy) * K
            c.alpha_composite(t, (int(round(px)), int(round(py))))
        if n != 4:
            hx, hy, hw, hh = HOP[n]; dr.rectangle([X0 + hx * K, Y0 + hy * K, X0 + (hx + hw) * K, Y0 + (hy + hh) * K], outline=(230, 60, 60), width=2)
            L = v['loi_logic']; dr.rectangle([X0 + L[0] * K, Y0 + L[1] * K, X0 + L[2] * K, Y0 + L[3] * K], outline=(240, 200, 60), width=1)
            m = v['muc']; dr.rectangle([X0 + m[0] * K, Y0 + m[1] * K, X0 + m[2] * K, Y0 + m[3] * K], outline=(80, 170, 240), width=1)
        else:
            hx, hy, hw, hh = HOP[4]   # gốc pogo P2 (−8, −11) so với chân → chân = gốc − (−8, −11)
            fx, fy = X0 + 8 * K, Y0 + 11 * K
            dr.rectangle([fx + hx * K, fy + hy * K, fx + (hx + hw) * K, fy + (hy + hh) * K], outline=(230, 60, 60), width=2)
            L = v['loi_logic_tu_goc']; dr.rectangle([X0 + L[0] * K, Y0 + L[1] * K, X0 + L[2] * K, Y0 + L[3] * K], outline=(240, 200, 60), width=1)
            X0, Y0 = fx, fy
        dr.ellipse([X0 - 4, Y0 - 4, X0 + 4, Y0 + 4], fill=(120, 220, 120))
        dr.text((6, 4), 'đòn %d (%s) · s %.3f%s' % (n, v['hang'], v['s'], (' · dời %s · co %.2f' % (v['doi'], v['co_so_muc'])) if n != 4 else ''), font=FONT, fill=(235, 235, 235))
        cols.append(c)
    o = Image.new('RGB', (sum(c.width for c in cols) + 6 * (len(cols) + 1), cols[0].height + 30), (40, 44, 52)); x = 6
    for c in cols: o.paste(c.convert('RGB'), (x, 6)); x += c.width + 6
    ImageDraw.Draw(o).text((6, o.height - 20), 'đỏ = hộp đòn thật · vàng = lõi sáng · xanh = hộp mục tiêu (đường quét đo trên tư thế) · chấm lục = chân Lam (pogo: chân khi gốc ở P2)', font=FONT, fill=(220, 220, 220))
    o.save(os.path.join(GOC, 'kiem', 'vet-gen-dat.png'))
    # ảnh tách nền: từng hàng trên nền tối, cỡ gen / 3
    rows = []
    for ten, (cw, ch, ks) in khung.items():
        r = Image.new('RGBA', (int(cw * len(ks) / 3), int(ch / 3) + 18), (20, 24, 32, 255))
        for i, (im, ox, oy) in enumerate(ks):
            r.alpha_composite(Image.fromarray(thu(im, 1 / 3)), (int((i * cw + ox) / 3), int(oy / 3) + 16))
        ImageDraw.Draw(r).text((4, 2), ten, font=FONT, fill=(230, 230, 230)); rows.append(r)
    W = max(r.width for r in rows); o = Image.new('RGB', (W, sum(r.height + 4 for r in rows)), (40, 44, 52)); y = 0
    for r in rows: o.paste(r.convert('RGB'), (0, y)); y += r.height + 4
    o.save(os.path.join(GOC, 'kiem', 'vet-gen-tach.png'))


if __name__ == '__main__':
    main()
