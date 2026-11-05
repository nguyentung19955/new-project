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

# raw_p7_a2 · 1536×1024 · lưới 3×2 (ô 512): A04 khung thẻ chọn · A06 đế thẻ · A07 ô trống · ô có ụ · ô CHỜ ĐỔI (hổ phách) · ô ĐANG CHỌN (lam)
def khoa_kin(im):
    """Khoá cả magenta trong lòng khung rỗng (tach_nen chỉ lan từ mép) + khử trộn hồng ở viền mềm."""
    a = np.asarray(im).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    k = np.clip(1 - (m - 50) / 70, 0, 1)
    a[..., 3] *= k
    du = np.clip(m, 0, None) * (k < 1) * 0.9
    a[..., 0] -= du * 0.5; a[..., 2] -= du * 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
if co_tam('raw_p7_a2.png'):
    R = 'raw_p7_a2.png'; o = lambda c, r: cat(R, (c * 512, r * 512, c * 512 + 512, r * 512 + 512))
    # ô bộ bài hiển thị 70×85 css → 3× ≈ 255 px
    luu(co(o(2, 0), w=240), 'p7_o_trong.png', 'ô bộ bài TRỐNG (A07, 70 css)')
    s = cung_khung([khoa_kin(o(0, 1)), khoa_kin(o(1, 1)), khoa_kin(o(2, 1))])
    luu(co(s[0], w=270), 'p7_o_co.png', 'viền ô có ụ (A07)'); luu(co(s[1], w=270), 'p7_o_doi.png', 'viền ô CHỜ ĐỔI (A07, hổ phách)'); luu(co(s[2], w=270), 'p7_o_chon.png', 'viền ô đang chọn (A07, lam)')
    luu(co(khoa_kin(o(0, 0)), w=380), 'p7_the_chon.png', 'khung thẻ chọn A04 (dự phòng; thẻ chọn đang dùng hiệu ứng raw_sel_card)')
for x in BAO[-5:]: print(*x)
