# -*- coding: utf-8 -*-
"""TURRET MERGE — cắt ảnh Pass 6 (trùm mới, HINH-VE-CODE-AUDIT.md "Pass 6 — new bosses").
Nguồn: docs/demo-hop-tuong/thap-art/raw_p6_<id>_{front,side,back,fx,portrait}.png (nền magenta #FF00FF).
→ thap/assets/trum_<id>_8.png (đi trước), trum_<id>_side_8.png (đi sang PHẢI), trum_<id>_back_8.png (đi xa),
  fx_trum_<id>.png (dải 16 khung), trum_<id>_portrait.png.
Ba hướng đi được ĐĂNG KÝ CHUNG (ghép 24 khung → dangky_khung.py → tách lại) để thân cùng tâm/cùng cỡ giữa các hướng.
Chạy: python3 tools/thap-cat-p6-trum.py [id ...]   (không id = mọi raw_p6_* đang có)"""
import os, sys, glob, subprocess, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
ASS = os.path.join(GOC, 'thap/assets')
O = 272  # ô khung dải đi (như trum_<cũ>_8.png)


def khoa(im):
    """khoá magenta: alpha mềm theo độ 'hồng' (min(R,B) − G), khử trộn hồng ở viền."""
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g
    k = np.clip(1 - (m - 60) / 80, 0, 1)
    a[..., 3] *= k
    du = np.clip(np.minimum(r, b) - g, 0, None) * (k < 1)
    a[..., 0] -= du * 0.6; a[..., 2] -= du * 0.6
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def o_luoi(im, cot, hang):
    W, H = im.size; w, h = W // cot, H // hang
    return [im.crop((c * w, r * h, (c + 1) * w, (r + 1) * h)) for r in range(hang) for c in range(cot)]


def vuong(ds, o):
    """đặt các khung vào ô vuông o×o theo CÙNG khung bao (giữ vị trí tương đối, không cắt chân)."""
    bb = [f.getbbox() for f in ds if f.getbbox()]
    x0 = min(b[0] for b in bb); y0 = min(b[1] for b in bb); x1 = max(b[2] for b in bb); y1 = max(b[3] for b in bb)
    s = max(x1 - x0, y1 - y0) * 1.06
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    out = []
    for f in ds:
        c = f.crop((int(cx - s / 2), int(cy - s / 2), int(cx + s / 2), int(cy + s / 2)))
        out.append(c.resize((o, o), Image.LANCZOS))
    return out


def dai(ds, o):
    im = Image.new('RGBA', (o * len(ds), o), (0, 0, 0, 0))
    for i, f in enumerate(ds): im.paste(f, (i * o, 0))
    return im


def lam(id):
    p = lambda k: os.path.join(ART, 'raw_p6_%s_%s.png' % (id, k))
    huong = [k for k in ('front', 'side', 'back') if os.path.exists(p(k))]
    if huong:
        ds = {k: [khoa(f) for f in o_luoi(Image.open(p(k)), 8, 1)] for k in huong}
        tat = vuong(sum((ds[k] for k in huong), []), O)  # cùng khung bao cho mọi hướng
        tam = os.path.join(ASS, '_p6_tam_%s.png' % id)
        dai(tat, O).save(tam)
        subprocess.run([sys.executable, os.path.join(ART, 'dangky_khung.py'), tam], check=True)
        reg = Image.open(tam)
        for i, k in enumerate(huong):
            ten = 'trum_%s%s_8.png' % (id, '' if k == 'front' else '_' + k)
            reg.crop((i * 8 * O, 0, (i + 1) * 8 * O, O)).save(os.path.join(ASS, ten), optimize=True); print('→', ten)
        os.remove(tam)
        b = os.path.join(ART, 'goc_truoc_dangky', os.path.basename(tam))
        if os.path.exists(b): os.remove(b)  # bản tạm, raw gốc đã giữ ở thap-art
    if os.path.exists(p('fx')):
        f = vuong([khoa(x) for x in o_luoi(Image.open(p('fx')), 4, 4)], 192)
        dai(f, 192).save(os.path.join(ASS, 'fx_trum_%s.png' % id), optimize=True); print('→ fx_trum_%s.png' % id)
    if os.path.exists(p('portrait')):
        im = khoa(Image.open(p('portrait'))); im = im.crop(im.getbbox())
        im.thumbnail((360, 360), Image.LANCZOS)  # băng giới thiệu ≈ 120 css px × 3
        im.save(os.path.join(ASS, 'trum_%s_portrait.png' % id), optimize=True); print('→ trum_%s_portrait.png' % id)


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted({os.path.basename(f).split('_')[2] if not os.path.basename(f).startswith('raw_p6_twin_core') else 'twin_core'
                                  for f in glob.glob(os.path.join(ART, 'raw_p6_*.png'))})
    for id in ids: lam(id)
