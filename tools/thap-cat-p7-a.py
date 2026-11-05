# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt tấm Pass 7 — home/deck (HUD mượt A, HINH-VE-CODE-AUDIT.md) → thap/assets/p7_*.png.
Khoá magenta (tach_nen của tools/thap-cat-hud2.py: viền alpha mềm, khử trộn hồng). Không phóng quá tấm raw
(nút/tấm hiển thị ≤ 390 css → raw ~820 px ≈ 2.1×, giữ nguyên độ nét gốc). Chạy: python3 tools/thap-cat-p7-a.py
Tấm nào chưa có thì bỏ qua."""
import os
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(GOC, 'tools/thap-cat-hud2.py'), encoding='utf-8').read()
exec(src[:src.index('# ---------- 01 nút SUMMON')])  # tach_nen, cat, co, luu, cung_khung …
def co_tam(ten): return os.path.exists(os.path.join(NGUON, ten))
# raw_p7_a1 · 1024×1536 · 1 cột × 6 hàng (ô 1024×256): A02 vàng thường / ấn / tắt · A03 thép thường / ấn · A01 tấm trung tính
if co_tam('raw_p7_a1.png'):
    R = 'raw_p7_a1.png'; o = lambda i: cat(R, (0, i * 256, 1024, i * 256 + 256))
    v = cung_khung([o(0), o(1), o(2)]); t = cung_khung([o(3), o(4)])
    for im, n, g in [(v[0], 'p7_nut1', 'nút chính (PLAY, ADD) thường'), (v[1], 'p7_nut1_an', 'nút chính ấn'), (v[2], 'p7_nut1_tat', 'nút chính tắt'),
                     (t[0], 'p7_nut2', 'nút phụ thường'), (t[1], 'p7_nut2_an', 'nút phụ ấn'), (o(5), 'p7_tam', 'tấm trung tính A01 (bảng trượt / hàng)')]:
        luu(im, n + '.png', g)
for x in BAO: print(*x)
