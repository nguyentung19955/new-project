# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh ChatGPT "cảm giác chạm P1" (docs/demo-hop-tuong/tuvan/vfx/CAN-VE-p1.json)
raw_p1_<ten>.png (nền magenta) trong docs/demo-hop-tuong/thap-art/ → thap/assets/p1_<ten>.png, rồi ghi tên đã có vào CG.CO_ANH
(thap/js/camgiac.js) và KTA.khe (thap/js/kinhte-ui.js).  Chạy: python3 tools/thap-cat-p1.py
Tách nền: GỠ TRỘN magenta (alpha nhỏ nhất thoả cả 3 kênh: a ≥ G/255, a ≥ 1−R/255, a ≥ 1−B/255; màu = (c − (1−a)·M)/a) → quầng sáng
mềm không viền hồng; cắt sát; thu Lanczos nhân-trước-alpha về 3× cỡ CSS lớn nhất (QUY-TAC-HINH mục 5), không vượt độ nét raw.
Cỡ (3× CSS lớn nhất, ô iPad ≈ 72 CSS): sao3 S·2·1,2 ≈ 173 → 520 · sao5 S·1,45·1,3 ≈ 136 → 410 · sao7 S·1,85·1,15 ≈ 153 → 460 ·
manh_sao S·0,4 ≈ 29 → 96 · vach_lv 2 khung, mỗi vạch ≈ 14×8 CSS → rộng 2×42 = 84 · ruong_khe 150·1,24 ≈ 186 CSS rộng → 560.
"""
import os, re, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
# ten: (cạnh lớn px, vuông?)
CO = {'sao3': (520, True), 'sao5': (410, True), 'sao7': (460, True), 'manh_sao': (96, True), 'vach_lv': (84, False), 'ruong_khe': (560, False)}


def tach(im):
    c = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    a = np.clip(np.maximum.reduce([g, 1 - r, 1 - b]), 0, 1)
    a = np.where(a < 0.05, 0, (a - 0.05) / 0.95)  # nhiễu nền
    M = np.array([1.0, 0.0, 1.0])
    F = (c - (1 - a[..., None]) * M) / np.maximum(a[..., None], 1e-3)
    F = np.clip(F, 0, 1)
    return np.dstack([F, a])


def thu(arr, n, vuong):
    al = arr[..., 3]
    ys, xs = np.where(al > 0.03)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    if vuong:  # vuông quanh TÂM ảnh (giữ tâm vòng / tia đúng giữa)
        cy, cx = (y0 + y1) / 2, (x0 + x1) / 2; h = max(y1 - y0, x1 - x0) / 2 + 2
        y0, y1, x0, x1 = int(cy - h), int(cy + h), int(cx - h), int(cx + h)
        pad = max(0, -y0, -x0, y1 - arr.shape[0], x1 - arr.shape[1])
        if pad: arr = np.pad(arr, ((pad, pad), (pad, pad), (0, 0))); y0 += pad; y1 += pad; x0 += pad; x1 += pad
    a = arr[y0:y1, x0:x1]
    h, w = a.shape[:2]; k = min(1.0, n / max(h, w)); nw, nh = max(1, round(w * k)), max(1, round(h * k))
    pm = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3:4]])
    ch = [Image.fromarray((pm[..., i] * 255).astype(np.uint8)).resize((nw, nh), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(x).astype(np.float32) / 255 for x in ch])
    al = q[..., 3:4]
    rgb = np.where(al > 1e-3, q[..., :3] / np.maximum(al, 1e-3), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255).astype(np.uint8), 'RGBA')


# ảnh khối (vòng, sao, vạch): khoá màu + khử ám hồng của tools/thap-cat-trumvfx.py; quầng mềm (sao3, khe): gỡ trộn ở trên
def tach_khoi(im):
    src = open(os.path.join(GOC, 'tools/thap-cat-trumvfx.py'), encoding='utf-8').read()
    ns = {'__file__': os.path.join(GOC, 'tools/thap-cat-trumvfx.py')}; exec(src.split('\ndef thu(')[0], ns)  # chỉ lấy import + hàm tach (không chạy vòng cắt của tệp đó)
    return np.asarray(ns['tach'](im)).astype(np.float32) / 255
MEM = {'sao3', 'sao5', 'sao7', 'manh_sao', 'ruong_khe'}  # quầng sáng quanh vòng/sao: khoá màu để lại ám hồng → gỡ trộn

da = []
for ten, (n, vuong) in CO.items():
    f = os.path.join(NGUON, 'raw_p1_' + ten + '.png')
    if not os.path.exists(f):
        continue
    arr = tach(Image.open(f)) if ten in MEM else tach_khoi(Image.open(f))
    if ten == 'vach_lv':  # 2 vạch (rỗng | đầy) → 2 khung bằng nhau, mỗi khung cắt sát riêng rồi ghép ngang
        al = arr[..., 3]; cot = np.where(al.max(0) > 0.1)[0]
        gap = np.where(np.diff(cot) > 5)[0]; m = cot[gap[0]] + (cot[gap[0] + 1] - cot[gap[0]]) // 2 if len(gap) else arr.shape[1] // 2
        hai = [thu(arr[:, :m], n // 2, False), thu(arr[:, m:], n // 2, False)]
        W, H = max(h.width for h in hai), max(h.height for h in hai)
        im = Image.new('RGBA', (W * 2, H), (0, 0, 0, 0))
        for i, h in enumerate(hai): im.paste(h, (i * W + (W - h.width) // 2, (H - h.height) // 2))
    else:
        im = thu(arr, n, vuong)
    im.save(os.path.join(DICH, 'p1_' + ten + '.png'), optimize=True)
    da.append('p1_' + ten)
    print('  ✓', ten, im.size)

js = os.path.join(GOC, 'thap/js/camgiac.js')
s = open(js, encoding='utf-8').read()
s = re.sub(r"CO_ANH: new Set\(\[[^\]]*\]\)", "CO_ANH: new Set([" + ', '.join("'" + t + "'" for t in da if t != 'p1_ruong_khe') + "])", s, count=1)
open(js, 'w', encoding='utf-8').write(s)
if 'p1_ruong_khe' in da:
    k = os.path.join(GOC, 'thap/js/kinhte-ui.js')
    s = open(k, encoding='utf-8').read()
    s = re.sub(r"  khe: '[^']*',", "  khe: 'p1_ruong_khe',", s, count=1)
    open(k, 'w', encoding='utf-8').write(s)
print('CG.CO_ANH =', da)
