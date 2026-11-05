#!/usr/bin/env python3
"""TURRET MERGE — kiểm ảnh ụ bị CẮT CỤT: mọi đầu ụ (<id>_nong*.png), bệ (*_de.png, de_chung*), chân dung thức tỉnh (af_*), fx_awaken.
Cờ: cut_<cạnh> = dải đặc (alpha>200) chạy dọc mép bbox > 30 % cạnh (bị lưỡi cắt thẳng) · bien = chạm mép khung ảnh
    · manh = mảnh rời nhỏ (thành phần liên thông < 3 % thành phần lớn nhất, nằm xa) · trung = s1/s2/s3 giống hệt nhau.
Chạy: python3 tools/thap-kt-cat-hinh.py [thư mục assets] [ảnh_contact.png]  → in JSON cờ + vẽ bảng ảnh.
"""
import os, sys, glob, json, hashlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GOC, 'thap/assets')
OUTP = sys.argv[2] if len(sys.argv) > 2 else None
# hình PHẲNG theo thiết kế (tia/tường/máy in…) — đã soi tấm raw: không bị cắt
PHANG_OK = {'cauvong_nong': 'phai', 'wallgen_nong': 'phai', 'nhanban_nong': 'tren'}


def danh_sach():
    f = sorted(glob.glob(os.path.join(A, '*_nong*.png')))
    f = [x for x in f if not os.path.basename(x).startswith(('fx_', 'v2_'))]
    f += sorted(glob.glob(os.path.join(A, '*_de.png'))) + sorted(glob.glob(os.path.join(A, 'de_chung*.png')))
    f += sorted(glob.glob(os.path.join(A, 'af_*.png')))
    return f


def kiem(p):
    im = Image.open(p).convert('RGBA'); a = np.asarray(im)[..., 3].astype(np.int32)
    H, W = a.shape; co = []; ct = {}
    if not (a > 8).any(): return ['rong'], ct
    lab, n = nd.label(a > 40)
    sz = nd.sum(np.ones_like(a), lab, range(1, n + 1)) if n else np.array([0])
    chinh = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= sz.max() * 0.03])  # thân chính (bỏ mảnh rời nhỏ)
    ys, xs = np.nonzero(chinh)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    def run(v):
        m = 0; c = 0
        for t in v:
            c = c + 1 if t else 0; m = max(m, c)
        return m
    # lưỡi cắt thẳng: ở độ sâu 3 px trong bbox thân chính, đoạn đặc liền > 38 % cạnh (hình tròn tự nhiên ≈ 20–28 %)
    k = 3
    for ten, v, L in (('tren', chinh[y0 + k, x0:x1 + 1], bw), ('duoi', chinh[y1 - k, x0:x1 + 1], bw),
                      ('trai', chinh[y0:y1 + 1, x0 + k], bh), ('phai', chinh[y0:y1 + 1, x1 - k], bh)):
        r = run(v) / L
        ct[ten] = round(r, 3)
        if r > 0.38 and PHANG_OK.get(os.path.basename(p)[:-4]) != ten: co.append('cut_' + ten)
    # af_* chân dung: cắt thẳng mép dưới/trái/phải là khung chủ ý (ảnh chữ nhật) → bỏ qua
    if os.path.basename(p).startswith('af_'): co = [c for c in co if c not in ('cut_duoi', 'cut_trai', 'cut_phai', 'cut_tren')]
    if (x0 == 0 or y0 == 0 or x1 == W - 1 or y1 == H - 1) and '_nong' in p: co.append('bien')
    if n > 1:
        sz = nd.sum(np.ones_like(a), lab, range(1, n + 1)); big = sz.max()
        cm = np.argmax(sz) + 1; dist = nd.distance_transform_edt(lab != cm)
        def phang(m):  # mảnh có 1 cạnh thẳng (bị lưỡi cắt ô lưới) → mảnh của hình bên cạnh
            yy, xx = np.nonzero(m); Y0, Y1, X0, X1 = yy.min(), yy.max(), xx.min(), xx.max()
            r = 0
            for v, L in ((m[Y0, X0:X1 + 1], X1 - X0 + 1), (m[Y1, X0:X1 + 1], X1 - X0 + 1), (m[Y0:Y1 + 1, X0], Y1 - Y0 + 1), (m[Y0:Y1 + 1, X1], Y1 - Y0 + 1)):
                if L >= 10: r = max(r, v.sum() / L)
            return r > 0.6
        manh = [i + 1 for i, s in enumerate(sz) if s < big * 0.06 and s >= 12 and dist[lab == i + 1].min() > 3 and phang(lab == i + 1)]
        if manh: co.append('manh%d' % len(manh)); ct['manh_px'] = int(sum(sz[i - 1] for i in manh))
    ct.update(bbox=[int(x0), int(y0), int(x1), int(y1)], size=[W, H])
    return co, ct


def main():
    ds = danh_sach(); kq = {}
    md5 = {}
    for p in ds:
        n = os.path.basename(p)[:-4]
        co, ct = kiem(p); kq[n] = {'co': co, **ct}
        md5[n] = hashlib.md5(open(p, 'rb').read()).hexdigest()
    for n in list(kq):
        if n.endswith('_nong_s1'):
            b = n[:-1]
            if md5.get(b + '2') == md5[n]: kq[n]['co'].append('trung_s2'); kq[b + '2']['co'].append('trung_s1')
            if md5.get(b[:-3]) == md5[n]: kq[n]['co'].append('trung_dau_v2')
    print(json.dumps({k: v for k, v in kq.items() if v['co']}, ensure_ascii=False, indent=0))
    print('tong', len(kq), 'co_co', sum(1 for v in kq.values() if v['co']), file=sys.stderr)
    if OUTP: contact(ds, kq, OUTP)
    return kq


def contact(ds, kq, out, C=150, cols=10):
    ds = [p for p in ds if '_nong' in p] + [p for p in ds if '_nong' not in p]
    rows = (len(ds) + cols - 1) // cols
    S = Image.new('RGB', (cols * C, rows * (C + 30)), (40, 44, 52)); d = ImageDraw.Draw(S)
    chk = Image.new('RGB', (C, C)); cd = ImageDraw.Draw(chk)
    for y in range(0, C, 10):
        for x in range(0, C, 10): cd.rectangle([x, y, x + 9, y + 9], fill=(70, 74, 82) if (x + y) // 10 % 2 else (55, 58, 66))
    for i, p in enumerate(ds):
        n = os.path.basename(p)[:-4]; X, Y = (i % cols) * C, (i // cols) * (C + 30)
        im = Image.open(p).convert('RGBA'); im.thumbnail((C - 6, C - 6), Image.LANCZOS)
        S.paste(chk, (X, Y)); S.paste(im, (X + (C - im.width) // 2, Y + (C - im.height) // 2), im)
        co = kq[n]['co']; bad = any(c.startswith(('cut', 'manh', 'trung', 'bien')) for c in co)
        if bad: d.rectangle([X, Y, X + C - 1, Y + C + 29], outline=(255, 60, 60), width=3)
        d.text((X + 4, Y + C + 1), n[:24], fill=(255, 255, 255))
        d.text((X + 4, Y + C + 14), ' '.join(co)[:26], fill=(255, 120, 120) if bad else (140, 220, 140))
    S.save(out, optimize=True)


if __name__ == '__main__': main()
