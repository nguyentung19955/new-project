# VFX P2 — cắt tờ ChatGPT 4×4 (16 khung) cho chiêu lớn: docs/demo-hop-tuong/thap-art/raw_p2_<ten>.png → thap/assets/p2_<ten>.png
# (1 hàng 16 khung VUÔNG, tâm cố định = tâm ô), ghi cỡ vào thap/js/p2-meta.js. Khoá magenta + Lanczos nhân-trước-alpha (như thap-cat-wyrm.py).
# Chạy: python3 tools/thap-cat-p2.py   (tờ nào chưa có raw thì bỏ qua)
import numpy as np, os, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/'); OUT = os.path.join(ROOT, 'thap/assets/')
# cỡ khung (px) = 3× cỡ hiển thị CSS lớn nhất (đường kính vùng chiêu trên bàn SOLO 390 px ≈ 80–90 px CSS)
CO = {'overlord': 256, 'cryo': 256, 'chronolock': 160, 'blackhole': 256, 'evolver': 128, 'rewind': 192, 'orbital': 192,
      'halo': 256, 'herotile': 160, 'genesis': 160, 'ember': 96, 'copycat': 160}
def khoa(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.clip((np.minimum(r, b) - g) / 255.0, 0, 1)
    al = np.clip((0.92 - m) / 0.92, 0, 1) ** 0.9          # hiệu ứng sáng: tách trộn màu nền mềm (không viền hồng)
    M = np.array([255, 0, 255], np.float32); A = np.maximum(al, 1e-3)[..., None]
    F = np.clip((a - (1 - al)[..., None] * M) / A, 0, 255); F = np.where(al[..., None] > 0.999, a, F)
    al = np.where(al < 0.04, 0, al)
    return Image.fromarray(np.dstack([F, al * 255]).astype(np.uint8), 'RGBA')
def thu(im, w, h):
    a = np.asarray(im).astype(np.float32) / 255
    pm = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3]])
    ch = [Image.fromarray((pm[..., i] * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c).astype(np.float32) / 255 for c in ch])
    A = q[..., 3:4]; rgb = np.where(A > 1e-4, q[..., :3] / np.maximum(A, 1e-4), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), A]) * 255).astype(np.uint8), 'RGBA')
meta = {}
for ten, fw in CO.items():
    p = SRC + 'raw_p2_' + ten + '.png'
    if not os.path.exists(p): continue
    s = khoa(Image.open(p)); W, H = s.size; cw, ch = W // 4, H // 4
    fr = [s.crop((x * cw + 4, y * ch + 4, (x + 1) * cw - 4, (y + 1) * ch - 4)) for y in range(4) for x in range(4)]
    # bán kính chung quanh TÂM ô (tâm cố định giữa các khung): khung vuông nhỏ nhất chứa mọi điểm alpha > 40
    rx = ry = 1; cx, cy = fr[0].size[0] / 2, fr[0].size[1] / 2
    for f in fr:
        ys, xs = np.where(np.asarray(f)[..., 3] > 40)
        if len(xs): rx = max(rx, abs(xs.min() - cx), abs(xs.max() + 1 - cx)); ry = max(ry, abs(ys.min() - cy), abs(ys.max() + 1 - cy))
    R = int(min(max(rx, ry) + 2, min(cx, cy)))
    fr = [thu(f.crop((int(cx - R), int(cy - R), int(cx + R), int(cy + R))), fw, fw) for f in fr]
    st = Image.new('RGBA', (fw * 16, fw), (0, 0, 0, 0))
    for i, f in enumerate(fr): st.paste(f, (i * fw, 0))
    st.save(OUT + 'p2_' + ten + '.png', optimize=True)
    meta['p2_' + ten] = [16, fw, fw, round(R * 2 / cw, 3)]   # [khung, rộng, cao, phần ô gốc được giữ]
    print('p2_' + ten, fw, 'R', R, '/', cw)
with open(os.path.join(ROOT, 'thap/js/p2-meta.js'), 'w') as f:
    f.write("// sinh bởi tools/thap-cat-p2.py — [số khung, rộng khung, cao khung, tỉ lệ ô] của tờ VFX P2 (đừng sửa tay)\n'use strict';\nconst P2_META = " + json.dumps(meta, sort_keys=True) + ";\n")
print('p2-meta', len(meta))
