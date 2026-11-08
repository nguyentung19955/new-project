#!/usr/bin/env python3
# TURRET MERGE — cắt tờ ChatGPT "Pháo La Bàn tổ hợp hướng" (docs/demo-hop-tuong/tuvan/la-ban-to-hop/PROMPT.md)
#   Nguồn: docs/demo-hop-tuong/thap-art/raw_laban_tohop.png (lưới 4×4 trên nền magenta):
#     ô 1–15 = bệ theo tổ hợp (thứ tự N S W E · NS NW NE SW SE WE · NSW NSE NWE SWE · NSWE) → thap/assets/canon_de_<mặt nạ>.png
#       (mặt nạ bit 1 N · 2 E · 4 S · 8 W — như SKILLS.canon.hb), cùng khung + cùng tâm + cùng cỡ hình bóng với canon_de.png (177×177, tâm = điểm gắn đầu)
#     ô 16 = tên lửa đuổi (mũi chĩa PHẢI) → thap/assets/fx_canon_ten.png + mục fx_canon_ten trong js/fxu-meta.js (neo ở thân đạn)
#   Sau khi cắt: bật window.LABAN_DE = true trong js/comoi.js (render.js dùng bệ theo tổ hợp, bỏ chevron dự phòng) và
#   (thap/ không có asset-list). Tách nền dùng chung tach()/khoa() của tools/thap-cat-umod.py.
# Chạy: python3 tools/thap-cat-laban.py [đường_dẫn_tờ.png]   (KT=1: chỉ ghép ảnh xem thử /tmp/laban-cat-xem.png, không ghi assets)
import os, sys, re, json, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)
A = os.path.join(GOC, 'thap', 'assets')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_laban_tohop.png')
MASK = [1, 4, 8, 2, 5, 9, 3, 12, 6, 10, 13, 7, 11, 14, 15]  # ô 1..15 → mặt nạ
KT = os.environ.get('KT')
PAD = 17  # px mỗi phía thêm quanh khung canon_de (177) cho mũi gai sáng


def cat_o(a, i):
    H, W = a.shape[:2]; h, w = H // 4, W // 4; r, c = divmod(i, 4)
    return a[r * h:(r + 1) * h, c * w:(c + 1) * w]


def tach_rgba(o):
    m, _ = U.tach(o)
    c = U.khoa(o.astype(np.float32) / 255, m)
    # quầng xanh mờ trên nền magenta còn ánh TÍM sau tách trộn → bỏ phần đỏ dư ở điểm bán trong suốt (vàng: b < g nên không đụng)
    A = c[..., 3]; r, g, b = c[..., 0], c[..., 1], c[..., 2]
    tim = (A > 0) & (r > g + 0.06) & (b > g + 0.04)  # mọi điểm ánh tím/hồng (vàng b < g, xanh đêm r < g, ngọc xám r≈g≈b → không đụng)
    g2 = np.where(tim, np.maximum(g, b * 0.82), g); c[..., 0] = np.where(tim, np.minimum(r, g2 * 0.55), r); c[..., 1] = g2  # → xanh lơ như ngọc
    return c


def tach_anh(o):
    c = tach_rgba(o); x0, y0, x1, y1 = U.bbox(c[..., 3] > 0.05)
    return U.anh(c[y0:y1, x0:x1])


def bo_cuc(a):
    """tâm bệ + cạnh bệ (mũi gai TẮT tới mũi gai TẮT) đo trên ô 2 (chỉ S sáng: W/E tắt) và ô 1 (N sáng: S tắt) — mọi ô cùng lưới nên dùng chung."""
    h = a.shape[0] // 4
    m2, _ = U.tach(cat_o(a, 1)); x0, _, x1, _ = U.bbox(m2)
    m1, _ = U.tach(cat_o(a, 0))
    _, _, _, y1b = U.bbox(m1); _, y0b, _, _ = U.bbox(m2)
    cx = (x0 + x1) / 2; ngang = x1 - x0
    # dọc: ô 2 có N tắt (mép trên) · ô 1 có S tắt (mép dưới)
    cy = (y0b + y1b) / 2
    return cx, cy, ngang


def main():
    a = np.array(Image.open(SRC).convert('RGB'))
    goc = Image.open(os.path.join(A, 'canon_de.png')).convert('RGBA'); N0 = goc.width
    bx = goc.split()[3].point(lambda v: 255 if v > 12 else 0).getbbox(); cao = max(bx[2] - bx[0], bx[3] - bx[1])
    cx, cy, ngang = bo_cuc(a); k = cao / ngang
    N = N0 + 2 * PAD  # khung rộng hơn canon_de (mũi gai SÁNG + quầng vượt mép bệ) — render.js vẽ cỡ SD × N / 177, cùng tâm
    ra = []
    for i, m in enumerate(MASK):
        c = U.anh(tach_rgba(cat_o(a, i)))
        w = round(c.width * k); c = c.resize((w, w), Image.LANCZOS)
        o = Image.new('RGBA', (N, N)); o.alpha_composite(c, (round(N / 2 - cx * k), round(N / 2 - cy * k))); ra.append((m, o))
    ten = tach_anh(cat_o(a, 15)); w = 231; ten = ten.resize((w, max(1, round(ten.height * w / ten.width))), Image.LANCZOS)
    if KT:
        s = Image.new('RGBA', (N * 4, N * 4), (40, 40, 48, 255))
        for j, (m, c) in enumerate(ra): s.alpha_composite(c, ((j % 4) * N, (j // 4) * N))
        s.alpha_composite(ten.resize((N, round(ten.height * N / ten.width))), (3 * N, 3 * N + N // 3)); s.save('/tmp/laban-cat-xem.png'); print('xem /tmp/laban-cat-xem.png', 'k', round(k, 3), 'N', N); return
    for m, c in ra: c.save(os.path.join(A, 'canon_de_%d.png' % m), optimize=True)
    ten.save(os.path.join(A, 'fx_canon_ten.png'), optimize=True)
    # neo thân đạn: ~60% chiều dài từ đuôi (giống fx_lien_dan 0.612), giữa chiều cao
    p = os.path.join(GOC, 'thap/js/fxu-meta.js'); t = open(p, encoding='utf-8').read()
    moi = '"fx_canon_ten":[%d,%d,0.6,0.5]' % (ten.width, ten.height)
    t = re.sub(r'"fx_canon_ten":\[[^\]]*\]', moi, t) if '"fx_canon_ten"' in t else t.replace('const FXU_META = {', 'const FXU_META = {' + moi + ',', 1)
    open(p, 'w', encoding='utf-8').write(t)
    p = os.path.join(GOC, 'thap/js/comoi.js'); t = open(p, encoding='utf-8').read()
    open(p, 'w', encoding='utf-8').write(t.replace('window.LABAN_DE = false;', 'window.LABAN_DE = true;', 1))
    print('đã ghi canon_de_1..15 (%dx%d, khung = canon_de + %d px mỗi phía) + fx_canon_ten, bật LABAN_DE' % (N, N, PAD))


if __name__ == '__main__':
    main()
