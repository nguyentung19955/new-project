#!/usr/bin/env python3
"""TURRET MERGE — cắt tấm ĐẦU Ụ 3 DẠNG (grow-up) chỉ có đầu, không bệ (ChatGPT, nền magenta) → <id>_nong_s1..s3.png.

Nguồn: docs/demo-hop-tuong/thap-art/raw_anime_u_dang_sheet<N>.png — mỗi HÀNG = 1 ụ, cột 1/2/3 = dạng 1/2/3.
Khác tools/thap-cat-anime-u.py --dang (tấm 4 cột có bệ): ở đây chỉ có đầu → không khớp bệ, trục xoay = tâm khung bao đầu
(như bước nhận diện tools/thap-nhan-dien-u.py: đầu dời tâm + phóng gần đầy ô + viền màu nhấn nướng sẵn, không filter lúc chạy).
Ảnh ra = KHUNG CỐ ĐỊNH 1 ô (PX px / cạnh ô), đầu xoay quanh tâm ảnh: bán kính xa nhất = R_MAX × TANG[dạng] → 3 dạng to dần,
dạng 3 vừa R_MAX (mọi góc xoay vẫn trong ô). Trang ụ (ảnh 100% ô) cũng thấy to dần.
Ghi thap/js/artscale.js window.STAGE_VE = {id: [K1,K2,K3]} (cỡ VẼ = ô × K; cỡ LUẬT/mũi nòng giữ HEAD_K/ART_META.tip — xem artscale.js).
Chạy: python3 tools/thap-cat-dang-dau.py [id …]     (KHONG_JS=1 không sửa artscale.js · OUT=thư_mục ghi ảnh chỗ khác)
"""
import os, sys, json, re, importlib.util
import numpy as np
from PIL import Image, ImageFilter

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js/artscale.js')
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)

PX = 300                 # điểm ảnh / cạnh ô
R_MAX = 0.485            # = thap-cat-umod.py / thap-nhan-dien-u.py
TANG = (0.86, 0.93, 1.0) # bán kính dạng 1/2/3 so với R_MAX
VIEN = 0.018             # viền màu nhấn / cạnh ô
# id: (tấm, hàng, số hàng, màu nhấn, xoay np.rot90 từng dạng: 0 = đã chĩa PHẢI như đầu cũ, -1 = đang chĩa LÊN → quay phải)
U_DS = {
    'hydra': (1, 0, 3, '#2ee89a', (0, -1, -1)), 'pandora': (1, 1, 3, '#ffd23f', (-1, -1, -1)), 'nemesis': (1, 2, 3, '#d01e3a', (-1, -1, -1)),
    'nhatthuc': (2, 0, 3, '#ffcc33', (-1, -1, -1)), 'marionette': (2, 1, 3, '#a01848', (0, 0, 0)), 'guongcong': (2, 2, 3, '#7fe8ff', (0, 0, 0)),
    'lualien': (3, 0, 3, '#ff8a2a', (0, 0, 0)), 'luutru': (3, 1, 3, '#8fd0ff', (0, 0, -1)), 'combo': (3, 2, 3, '#ff6a3a', (-1, -1, -1)),
    'chuato': (4, 0, 3, '#ff6a2a', (0, 0, 0)), 'leviathan': (4, 1, 3, '#1fb6d9', (0, 0, 0)), 'khoisinh': (4, 2, 3, '#7ee05a', (0, 0, 0)),
    'cobac': (5, 0, 1, '#ffb43a', (0, 0, 0)),
}


def hex_rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def tach_tam(a, nh):
    """cả tấm → {(hàng, cột): RGBA float chỉ gồm các mảng có trọng tâm trong ô đó} (hình lấn sang ô bên vẫn đủ, mảng hình bên không lọt vào)."""
    from scipy import ndimage as nd
    m, _ = U.tach(a)
    c = U.khoa(a.astype(np.float64) / 255, m)
    lab, n = nd.label(c[..., 3] > 0, structure=np.ones((3, 3)))
    H, W = a.shape[:2]; ch, cw = H / nh, W / 3
    # mảng dính nhau qua ranh hàng (ô cột 3 tấm 1: Hydra–Pandora–Nemesis chạm nhau): cắt tại hàng ít điểm nhất quanh ranh (±90 px)
    for k in range(1, n + 1):
        ys = np.nonzero((lab == k).any(1))[0]
        if not len(ys) or int(ys[0] // ch) == int(ys[-1] // ch): continue
        for r in range(int(ys[0] // ch) + 1, int(ys[-1] // ch) + 1):
            yb = int(r * ch); dem = (lab[yb - 90:yb + 90] == k).sum(1); yc = yb - 90 + int(np.argmin(dem))
            lab[yc][lab[yc] == k] = 0
    lab, n = nd.label(lab > 0, structure=np.ones((3, 3)))
    cm = nd.center_of_mass(lab > 0, lab, range(1, n + 1)); sz = nd.sum(lab > 0, lab, range(1, n + 1))
    lon = [k for k in range(1, n + 1) if sz[k - 1] >= 0.05 * sz.max()]
    # mảng nhỏ (mảnh pha lê, tia lấp lánh) đi theo khối lớn GẦN NHẤT (không theo ô lưới — mảnh của dạng 3 có khi lấn sang ô dạng 2)
    _, (iy, ix) = nd.distance_transform_edt(~np.isin(lab, lon), return_indices=True)
    o = {}
    for k, (y, x) in enumerate(cm, 1):
        if k not in lon:
            ys, xs = np.nonzero(lab == k); j = len(ys) // 2; kk = lab[iy[ys[j], xs[j]], ix[ys[j], xs[j]]]; y, x = cm[kk - 1]
        key = (min(nh - 1, int(y // ch)), min(2, int(x // cw)))
        o.setdefault(key, []).append(k)
    ra = {}
    for key, ks in o.items():
        q = c.copy(); q[~np.isin(lab, ks)] = 0; ra[key] = q
    return ra


def mot_dau(c, xoay, mau, f):
    c = np.rot90(c, xoay).copy()
    ys, xs = np.nonzero(c[..., 3] > 0.02)
    cx, cy = (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2
    r = np.sqrt((xs + 0.5 - cx) ** 2 + (ys + 0.5 - cy) ** 2).max()
    R = R_MAX * f * PX                       # bán kính đích (px, gồm viền)
    pv = VIEN * PX                           # viền (px đích)
    s = (R - 1.4 * pv) / r                   # tỉ lệ thu đầu (chưa viền; viền mờ lan thêm ~0,4 pv)
    im = U.anh(c)
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    im = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    out = Image.new('RGBA', (PX, PX)); out.alpha_composite(im, (int(round(PX / 2 - cx * s)), int(round(PX / 2 - cy * s))))
    # viền màu nhấn ôm hình bóng (như thap-nhan-dien-u.py vien_mau), đặt DƯỚI hình
    k = 2 * int(round(pv / 2)) + 1
    g = out.split()[3].filter(ImageFilter.MaxFilter(k)).filter(ImageFilter.GaussianBlur(max(1, pv / 3)))
    ga = np.clip(np.asarray(g).astype(np.float64) / 255 * 1.6, 0, 1) * 0.95
    v = np.zeros((PX, PX, 4), np.uint8); v[..., :3] = hex_rgb(mau); v[..., 3] = (ga * 255).astype(np.uint8)
    nen = Image.fromarray(v, 'RGBA'); nen.alpha_composite(out)
    al = np.asarray(nen)[..., 3]; ys, xs = np.nonzero(al > 8)
    rr = np.sqrt((xs + 0.5 - PX / 2) ** 2 + (ys + 0.5 - PX / 2) ** 2).max() / PX
    return nen, round(float(rr), 4)


def main():
    ids = sys.argv[1:] or list(U_DS)
    t = open(JS, encoding='utf-8').read()
    m = re.search(r'window\.STAGE_VE = (.*);[ \t]*$', t, re.M); SV = json.loads(m.group(1)) if m else {}
    tam = {}
    for i in ids:
        sh, hang, nh, mau, xoay = U_DS[i]
        if sh not in tam: tam[sh] = tach_tam(np.asarray(Image.open(os.path.join(RAW, 'raw_anime_u_dang_sheet%d.png' % sh)).convert('RGB')), nh)
        K = []
        for n in range(3):
            im, rr = mot_dau(tam[sh][(hang, n)], xoay[n], mau, TANG[n])
            im.save(os.path.join(OUT, '%s_nong_s%d.png' % (i, n + 1)), optimize=True)
            K.append(1.0); print(i, 'dạng', n + 1, 'bán kính', rr)
        SV[i] = K
    if not os.environ.get('KHONG_JS'):
        s = 'window.STAGE_VE = ' + json.dumps(SV) + ';'
        if m: t = t[:m.start()] + s + t[m.end():]
        else: raise SystemExit('artscale.js thiếu dòng window.STAGE_VE')
        open(JS, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
