# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh ChatGPT báo chiêu trùm / chỉ huy (docs/demo-hop-tuong/tuvan/vfx/CAN-VE-boss.json)
raw_<ten>.png (nền magenta) trong docs/demo-hop-tuong/thap-art/ → thap/assets/<ten>.png (alpha mềm, khử viền hồng,
cắt sát, vuông, thu Lanczos nhân-trước-alpha về 3× cỡ hiển thị CSS lớn nhất — QUY-TAC-HINH mục 5), rồi ghi tên đã có
vào TVF.CO trong thap/js/trumvfx.js.  Chạy: python3 tools/thap-cat-trumvfx.py
Cỡ (px) = 3 × cỡ CSS lớn nhất (iPad REN.s 1,19; ô 60 px): dấu ô C·0,98·1,45 ≈ 102 CSS → 310; vòng chân trùm co·1,8 ≈ 184 → 560…
"""
import os, re
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NGUON = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
DICH = os.path.join(GOC, 'thap/assets')
JS = os.path.join(GOC, 'thap/js/trumvfx.js')
CO = {'tb_doiloai': 310, 'tb_bang': 310, 'tb_da': 310, 'tb_mimic': 310, 'tb_snipe': 310, 'tb_lua': 310, 'tb_xich': 310,
      'tb_sao': 370, 'tb_khien': 280, 'tb_trum': 560, 'tb_suachua': 560, 'tb_to': 560, 'prism_seg': 200,
      'cmd_capsule': 260, 'cmd_rage': 250, 'cmd_khien': 250}


def tach(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    k = np.minimum(r, b) - g
    k = np.where(np.minimum(r, b) > 150, k, 0)
    alpha = np.clip(1.0 - (k - 100) / 80.0, 0, 1)
    nen0 = alpha < 0.5
    lab, n = nd.label(nen0)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    noi = np.isin(lab, list(mep))
    thuan = (r > 215) & (b > 215) & (g < 60)  # túi nền kín (giữa vòng) cũng là magenta thuần
    lt, nt = nd.label(thuan)
    if nt:
        szt = nd.sum(thuan, lt, range(1, nt + 1))
        thuan = np.isin(lt, [i + 1 for i, v in enumerate(szt) if v > 400])
    vung = nd.binary_dilation(noi | thuan, iterations=2)
    alpha = np.where(vung, alpha, 1.0)
    vien = nd.binary_dilation(alpha < 0.5, iterations=3) & (alpha >= 0.5)
    du = np.clip(np.minimum(r, b) - g, 0, None) * vien * 0.85  # khử ám hồng ở viền
    r = r - du; b = b - du
    # viền alpha mềm 1 px
    alpha = nd.uniform_filter(alpha, 3) * (alpha > 0.02) + 0 * alpha
    giu = nd.binary_opening(alpha > 0.5, iterations=1)
    alpha = alpha * nd.binary_dilation(giu, iterations=1)
    out = np.dstack([np.clip(r, 0, 255), np.clip(g, 0, 255), np.clip(b, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def thu(im, n):
    """vuông hoá quanh tâm rồi thu Lanczos nhân-trước-alpha (không vượt độ nét tấm raw)"""
    bb = im.getbbox(); im = im.crop(bb)
    s = max(im.size); v = Image.new('RGBA', (s, s), (0, 0, 0, 0)); v.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    n = min(n, s)
    a = np.asarray(v).astype(np.float32) / 255
    pm = np.dstack([a[..., :3] * a[..., 3:4], a[..., 3:4]])
    ch = [Image.fromarray((pm[..., i] * 255).astype(np.uint8)).resize((n, n), Image.LANCZOS) for i in range(4)]
    q = np.dstack([np.asarray(c).astype(np.float32) / 255 for c in ch])
    al = q[..., 3:4]
    rgb = np.where(al > 1e-3, q[..., :3] / np.maximum(al, 1e-3), 0)
    return Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255).astype(np.uint8), 'RGBA')


da = []
for ten, n in CO.items():
    f = os.path.join(NGUON, 'raw_' + ten + '.png')
    if not os.path.exists(f):
        continue
    im = thu(tach(Image.open(f)), n)
    im.save(os.path.join(DICH, ten + '.png'), optimize=True)
    da.append(ten)
    print('  ✓', ten, im.size)
s = open(JS, encoding='utf-8').read()
s = re.sub(r"CO: new Set\(\[[^\]]*\]\)", "CO: new Set([" + ', '.join("'" + t + "'" for t in da) + "])", s, count=1)
open(JS, 'w', encoding='utf-8').write(s)
print('TVF.CO =', da)
