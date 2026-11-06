# VFX P3 — cắt tờ ChatGPT 4×4 (16 khung) cho các ụ còn lại (docs/demo-hop-tuong/tuvan/vfx-p3/CAN-VE.json): docs/demo-hop-tuong/thap-art/raw_p3_<ten>.png → thap/assets/p3_<ten>.png
# (1 hàng 16 khung VUÔNG, tâm cố định = tâm ô), ghi cỡ vào thap/js/p3-meta.js. Khoá magenta + Lanczos nhân-trước-alpha (như thap-cat-wyrm.py).
# Chạy: python3 tools/thap-cat-p3.py   (tờ nào chưa có raw thì bỏ qua)
import numpy as np, os, json
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art/'); OUT = os.path.join(ROOT, 'thap/assets/')
# cỡ khung (px): 3× cỡ hiển thị lớn nhất nhưng KHÔNG vượt độ nét ô raw (≈ 300 px/ô) — chiêu to (Overlord, Cryo, Black Hole, Halo) chạm trần raw
CO = {'canon': 192, 'mortar': 192, 'set': 160, 'railgun': 192, 'hydra': 160, 'aten': 192, 'soi': 160, 'tuthan': 192, 'nemesis': 192,
      'ngoisao': 192, 'bang': 160, 'maychem': 160, 'bomhen': 192, 'min': 192, 'wallgen': 256, 'hopbi': 192, 'vungdoc': 192, 'nhatthuc': 256,
      'baotuyet': 256, 'cuuvi': 128}
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
# màu nguyên tố của ụ (tools/thap-kt-mau.js): tờ ChatGPT lệch màu → đặt lại SẮC (giữ độ sáng + độ bão hoà, điểm gần trắng giữ trắng)
SAC = {}  # đặt lại sắc khi tờ lệch màu nguyên tố (tools/thap-kt-mau.js) — điền sau khi xem tờ
def doiSac(im, h):
    a = np.asarray(im).astype(np.float32); rgb = a[..., :3] / 255
    mx = rgb.max(-1); mn = rgb.min(-1); S = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0); V = mx
    H = np.full(V.shape, h / 60.0); i = np.floor(H) % 6; f = H - np.floor(H)
    p_, q_, t_ = V * (1 - S), V * (1 - S * f), V * (1 - S * (1 - f))
    out = np.zeros_like(rgb)
    for k, (r, g, b) in enumerate([(V, t_, p_), (q_, V, p_), (p_, V, t_), (p_, q_, V), (t_, p_, V), (V, p_, q_)]):
        m = i == k; out[..., 0][m], out[..., 1][m], out[..., 2][m] = r[m], g[m], b[m]
    return Image.fromarray(np.dstack([out * 255, a[..., 3]]).astype(np.uint8), 'RGBA')
meta = {}
for ten, fw in CO.items():
    p = SRC + 'raw_p3_' + ten + '.png'
    if not os.path.exists(p): continue
    s = khoa(Image.open(p))
    if ten in SAC: s = doiSac(s, SAC[ten])
    W, H = s.size; cw, ch = W // 4, H // 4
    fr = [s.crop((x * cw + 4, y * ch + 4, (x + 1) * cw - 4, (y + 1) * ch - 4)) for y in range(4) for x in range(4)]
    # bán kính chung quanh TÂM ô (tâm cố định giữa các khung): khung vuông nhỏ nhất chứa mọi điểm alpha > 40
    rx = ry = 1; cx, cy = fr[0].size[0] / 2, fr[0].size[1] / 2
    for f in fr:
        ys, xs = np.where(np.asarray(f)[..., 3] > 40)
        if len(xs): rx = max(rx, abs(xs.min() - cx), abs(xs.max() + 1 - cx)); ry = max(ry, abs(ys.min() - cy), abs(ys.max() + 1 - cy))
    R = int(min(max(rx, ry) + 2, max(cx, cy)))
    def vuong(f):  # ô không vuông (ember 3:1, copycat 3:2): cắt quanh tâm trong ô rồi đặt giữa khung vuông 2R trong suốt
        q = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); x0, y0 = max(0, int(cx - R)), max(0, int(cy - R))
        q.paste(f.crop((x0, y0, min(f.size[0], int(cx + R)), min(f.size[1], int(cy + R)))), (int(R - (cx - x0)), int(R - (cy - y0)))); return q
    fr = [thu(vuong(f), fw, fw) for f in fr]
    st = Image.new('RGBA', (fw * 16, fw), (0, 0, 0, 0))
    for i, f in enumerate(fr): st.paste(f, (i * fw, 0))
    st.save(OUT + 'p3_' + ten + '.png', optimize=True)
    meta['p3_' + ten] = [16, fw, fw, round(R * 2 / cw, 3)]   # [khung, rộng, cao, phần ô gốc được giữ]
    print('p3_' + ten, fw, 'R', R, '/', cw)
with open(os.path.join(ROOT, 'thap/js/p3-meta.js'), 'w') as f:
    f.write("// sinh bởi tools/thap-cat-p3.py — [số khung, rộng khung, cao khung, tỉ lệ ô] của tờ VFX P3 (đừng sửa tay)\n'use strict';\nconst P3_META = " + json.dumps(meta, sort_keys=True) + ";\n")
print('p3-meta', len(meta))
