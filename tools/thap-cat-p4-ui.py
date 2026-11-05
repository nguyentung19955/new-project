# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt tấm Pass 4 — ui (HINH-VE-CODE-AUDIT.md): docs/demo-hop-tuong/thap-art/raw_p4_ui_1.png (lưới 3×2, 1536×1024)
→ thap/assets/ic_cdmg.png, sao_chu.png, ci_quet.png, hang_sang.png, mui_tiep.png. Khoá magenta (tach_nen của thap-cat-hinh.py,
viền alpha mềm, khử trộn hồng); vệt sáng ci_quet = khoá phát sáng (tach_sang). Thu Lanczos về 3× cỡ CSS lớn nhất.
Chạy: python3 tools/thap-cat-p4-ui.py"""
import os, importlib.util
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('h2', os.path.join(GOC, 'tools/thap-cat-hud2.py'))
src = open(os.path.join(GOC, 'tools/thap-cat-hud2.py'), encoding='utf-8').read()
exec(src[:src.index('# ---------- 01 nút SUMMON')])  # tach_nen, tach_sang, tron, cat, co, luu …
R = 'raw_p4_ui_1.png'
# ô 512×512: (0,0) ic_cdmg · (1,0) sao_chu · (2,0) ci_quet · (0,1) hang_sang · (1,1) mui_tiep
def khoa_kin(im):
    """Khoá thêm magenta trong vùng KÍN (lỗ giữa vòng) mà tach_nen (lan từ mép) không chạm tới; khử trộn hồng ở mép."""
    a = np.asarray(im).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    k = np.clip(1 - (m - 50) / 70, 0, 1)
    a[..., 3] *= k
    du = np.clip(m, 0, None) * (k < 1) * 0.9   # bớt hồng ở viền mềm
    a[..., 0] -= du * 0.5; a[..., 2] -= du * 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
luu(co(khoa_kin(cat(R, (0, 0, 512, 512))), w=96), 'ic_cdmg.png', 'ký hiệu buff CRIT DMG (bảng 14 px, canvas 12 px × R.s × dpr)')
luu(co(cat(R, (512, 0, 1024, 512)), w=64), 'sao_chu.png', 'sao trong chữ DOM (≤ 1.05 em ≈ 17 px)')
q = cat(R, (1024, 0, 1536, 512), sang=True)
luu(co(q, h=min(q.size[1], 300)), 'ci_quet.png', 'vệt quét băng cut-in (≈ 90×96 css)')
luu(cat(R, (0, 512, 512, 1024)), 'hang_sang.png', 'dải sáng dòng mốc sao (9 mảnh, giữ độ nét gốc)')
luu(co(cat(R, (512, 512, 1024, 1024)), h=48), 'mui_tiep.png', 'mũi tên giữa 3 dạng grow-up (≈ 14 px)')
for t, w, g in BAO: print(t, w, g)
