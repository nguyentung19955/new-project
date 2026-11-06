#!/usr/bin/env python3
"""TURRET MERGE — lắp ảnh ChatGPT cửa hàng (docs/demo-hop-tuong/tuvan/shop/CAN-VE.json) từ docs/demo-hop-tuong/thap-art/raw_shop_*.png
→ thap/assets/shop_*.png. Khoá magenta tách trộn (thap-dau-u2.khoa; ánh sáng: tách alpha nhỏ nhất), cắt lưới ô, thu Lanczos nhân-trước-alpha
về 3× cỡ CSS lớn nhất (QUY-TAC-HINH mục 5). Tấm nào chưa có thì bỏ qua. In ra danh sách đã lắp → đổi tên trong KTA (js/kinhte-ui.js).
Chạy: python3 tools/thap-lap-shop.py"""
import importlib.util, os
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art'); A = os.path.join(GOC, 'thap', 'assets')
sp = importlib.util.spec_from_file_location('u2', os.path.join(GOC, 'tools', 'thap-dau-u2.py')); U2 = importlib.util.module_from_spec(sp); sp.loader.exec_module(U2)


def khoa(rgb):
    out, al = U2.khoa(rgb)
    return Image.fromarray(np.dstack([out.clip(0, 255).astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')


def sang(rgb):  # ánh sáng trên magenta: C = a·F + (1−a)·M
    C = rgb.astype(np.float32)
    al = np.clip(np.maximum(1 - np.minimum(C[..., 0], C[..., 2]) / 255, C[..., 1] / 255), 0, 1)
    P = C - (1 - al[..., None]) * np.array([255., 0., 255.])
    F = np.clip(P / np.maximum(al[..., None], 1e-3), 0, 255)
    return Image.fromarray(np.dstack([F.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')


def cat(rg, le=4):
    a = np.asarray(rg)[..., 3]; ys, xs = np.where(a > 8)
    if not len(xs): return rg
    return rg.crop((max(0, xs.min() - le), max(0, ys.min() - le), min(rg.width, xs.max() + le + 1), min(rg.height, ys.max() + le + 1)))


def thu(rg, w=None, h=None):  # Lanczos nhân-trước-alpha, không phóng to quá tấm gốc
    if w and not h: h = round(rg.height * w / rg.width)
    if h and not w: w = round(rg.width * h / rg.height)
    if w >= rg.width: return rg
    p = np.asarray(rg).astype(np.float32); p[..., :3] *= p[..., 3:4] / 255
    q = np.asarray(Image.fromarray(p.clip(0, 255).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)).astype(np.float32)
    q[..., :3] = np.where(q[..., 3:4] > 0, q[..., :3] * 255 / np.maximum(q[..., 3:4], 1), 0)
    return Image.fromarray(q.clip(0, 255).astype(np.uint8), 'RGBA')


def vuong(rg):
    k = max(rg.size); sq = Image.new('RGBA', (k, k)); sq.paste(rg, ((k - rg.width) // 2, (k - rg.height) // 2)); return sq


def o(im, c, r, i, j):
    W, H = im.size; return im.crop((round(i * W / c), round(j * H / r), round((i + 1) * W / c), round((j + 1) * H / r)))


def raw(n):
    p = os.path.join(ART, n); return np.asarray(Image.open(p).convert('RGB')) if os.path.exists(p) else None


xong = []
def luu(im, ten): im.save(os.path.join(A, ten + '.png'), optimize=True); xong.append(ten + ' %dx%d' % im.size)

r = raw('raw_shop_ngoc.png')
if r is not None: luu(thu(vuong(cat(khoa(r))), 150), 'shop_ngoc')
r = raw('raw_shop_vang.png')
if r is not None: luu(thu(vuong(cat(khoa(r))), 150), 'shop_vang')
r = raw('raw_shop_ruong.png')  # 3 cột × 2 hàng: đóng / mở · thường, vàng, thần thoại — cỡ CSS lớn nhất 150 (màn mở rương)
if r is not None:
    k = khoa(r)
    for i, t in enumerate(['thuong', 'vang', 'than']):
        luu(thu(vuong(cat(o(k, 3, 2, i, 0))), 450), 'shop_ru_' + t)
        luu(thu(vuong(cat(o(k, 3, 2, i, 1))), 450), 'shop_ru_' + t + '_mo')
r = raw('raw_shop_fx_mo.png')  # 4×4 khung → dải ngang 16 khung 300 px
if r is not None:
    s = sang(r); fr = [thu(vuong(o(s, 4, 4, i % 4, i // 4)), 300) for i in range(16)]
    d = Image.new('RGBA', (300 * 16, 300))
    for i, f in enumerate(fr): d.paste(f.resize((300, 300)) if f.size != (300, 300) else f, (i * 300, 0))
    luu(d, 'shop_fx_mo')
r = raw('raw_shop_vongquay.png')  # 3 ô: bánh xe (330 CSS) · mũi tên (44) · khung (360)
if r is not None:
    k = khoa(r)
    luu(thu(vuong(cat(o(k, 3, 1, 0, 0))), 990), 'shop_banh')
    luu(thu(cat(o(k, 3, 1, 1, 0)), 132), 'shop_mui')
    luu(thu(vuong(cat(o(k, 3, 1, 2, 0))), 1080), 'shop_banh_khung')
r = raw('raw_shop_nut.png')  # 4 nút HOME 60 CSS
if r is not None:
    k = khoa(r)
    for i, t in enumerate(['shop', 'sk', 'nv', 'vq']): luu(thu(vuong(cat(o(k, 4, 1, i, 0))), 180), 'shop_nut_' + t)
r = raw('raw_shop_banner.png')
if r is not None: luu(thu(cat(khoa(r)), 1200), 'shop_banner')
r = raw('raw_shop_banner_su.png')
if r is not None: luu(thu(cat(khoa(r)), 1200), 'shop_banner_su')
r = raw('raw_shop_khung_nv.png')  # 1 cột × 2 hàng: thường / xong (border-image)
if r is not None:
    k = khoa(r)
    luu(thu(cat(o(k, 1, 2, 0, 0)), 1290), 'shop_khung_nv'); luu(thu(cat(o(k, 1, 2, 0, 1)), 1290), 'shop_khung_nv_xong')
print('lắp:', xong or 'chưa có tấm raw_shop_* nào')
