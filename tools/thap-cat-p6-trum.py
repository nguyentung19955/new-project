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
# dải NGANG ChatGPT vẽ quay sang TRÁI (thay vì phải) → lật lại khi cắt (thân đối xứng đủ để lật)
LAT_SIDE = {'hive'}
# tấm fx ChatGPT vẽ CẢ THÂN trùm đang tung chiêu (nhìn về bàn) → cắt thành dải ĐÁNH trum_<id>_atk_16.png
# cùng tâm/cỡ thân với dải đi (quaianim.js phát dải này trong lúc báo chiêu); không dùng làm hiệu ứng rời fx_trum_<id>
THAN_FX = {'hive'}  # (jammer fx = hiệu ứng rời, không thân)


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
    huong = [k for k in ('front', 'side', 'back', 'left') if os.path.exists(p(k))]
    if huong:
        ds = {k: [khoa(f) for f in o_luoi(Image.open(p(k)), 8, 1)] for k in huong}
        if 'side' in ds and id in LAT_SIDE: ds['side'] = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in ds['side']]
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
    if os.path.exists(p('fx')) and id in THAN_FX:
        danh(id, khoa(Image.open(p('fx'))))
    elif os.path.exists(p('fx')):
        f = vuong([khoa(x) for x in o_luoi(Image.open(p('fx')), 4, 4)], 192)
        dai(f, 192).save(os.path.join(ASS, 'fx_trum_%s.png' % id), optimize=True); print('→ fx_trum_%s.png' % id)
    if os.path.exists(p('portrait')):
        im = khoa(Image.open(p('portrait'))); im = im.crop(im.getbbox())
        c = max(im.size); q = Image.new('RGBA', (c, c), (0, 0, 0, 0)); q.paste(im, ((c - im.width) // 2, (c - im.height) // 2)); im = q  # vuông, giữa
        im = im.resize((600, 600), Image.LANCZOS) if c > 600 else im  # màn mở trận 200 css px × 3
        im.save(os.path.join(ASS, 'trum_%s_portrait.png' % id), optimize=True); print('→ trum_%s_portrait.png' % id)


def danh(id, sheet):
    """dải ĐÁNH 16 khung (lưới 4×4) khớp thân dải đi trước: tâm lõi thân + diện tích lõi = trung vị dải trước."""
    from scipy import ndimage  # noqa
    spec = importlib.util.spec_from_file_location('dk', os.path.join(ART, 'dangky_khung.py'))
    dk = importlib.util.module_from_spec(spec); spec.loader.exec_module(dk)
    truoc = Image.open(os.path.join(ASS, 'trum_%s_8.png' % id)).convert('RGBA'); H = truoc.height
    am = max(2, H // 24); tx, ty, ar0 = [], [], []
    for i in range(round(truoc.width / H)):
        inf = dk.loi_than(np.asarray(truoc.crop((i * H, 0, (i + 1) * H, H)), dtype=np.float32)[..., 3] / 255.0, am)
        if inf: tx.append(inf[0]); ty.append(inf[1]); ar0.append(inf[2])
    tx, ty, ar0 = float(np.mean(tx)), float(np.mean(ty)), float(np.median(ar0))
    cells = o_luoi(sheet, 4, 4)
    am2 = max(2, cells[0].height // 24)
    inf = [dk.loi_than(np.asarray(c, dtype=np.float32)[..., 3] / 255.0, am2) for c in cells]
    s = float(np.sqrt(ar0 / np.median([x[2] for x in inf if x])))
    out = Image.new('RGBA', (16 * H, H), (0, 0, 0, 0))
    for i, (c, f) in enumerate(zip(cells, inf)):
        c2 = c.convert('RGBa').resize((round(c.width * s), round(c.height * s)), Image.LANCZOS).convert('RGBA')
        cx, cy = (f[0] * s, f[1] * s) if f else (c2.width / 2, c2.height / 2)
        k = Image.new('RGBA', (H, H), (0, 0, 0, 0))
        k.paste(c2, (round(tx - cx), round(ty - cy)), c2)  # mép tràn khỏi ô thì bị cắt (drone bay xa)
        out.paste(k, (i * H, 0))
    out.save(os.path.join(ASS, 'trum_%s_atk_16.png' % id), optimize=True); print('→ trum_%s_atk_16.png (×%.3f)' % (id, s))


def ghi_js():
    """cập nhật 4 tập ảnh trong thap/js/trum.js theo file thật trong assets/."""
    import re
    js = os.path.join(GOC, 'thap/js/trum.js'); s = open(js, encoding='utf-8').read()
    ids = re.findall(r"^  (\w+): +\{ ten:", s[s.index('const TRUM_MOI'):s.index('};')], re.M)
    co = lambda f: os.path.exists(os.path.join(ASS, f))
    tap = {'TRUM_ANH': [i for i in ids if co('trum_%s_8.png' % i)],
           'TRUM_HUONG': [i + '_' + k for i in ids for k in ('side', 'back', 'left') if co('trum_%s_%s_8.png' % (i, k))],
           'TRUM_FX': [i for i in ids if co('fx_trum_%s.png' % i) and i not in THAN_FX],
           'TRUM_ATK': [i for i in ids if co('trum_%s_atk_16.png' % i)],
           'TRUM_CHANDUNG': [i for i in ids if co('trum_%s_portrait.png' % i)]}
    for k, v in tap.items():
        s = re.sub(r'const %s = new Set\(\[[^\]]*\]\);' % k, 'const %s = new Set([%s]);' % (k, ', '.join("'%s'" % x for x in v)), s)
    open(js, 'w', encoding='utf-8').write(s); print('trum.js:', tap)


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted({os.path.basename(f).split('_')[2] if not os.path.basename(f).startswith('raw_p6_twin_core') else 'twin_core'
                                  for f in glob.glob(os.path.join(ART, 'raw_p6_*.png'))})
    for id in ids: lam(id)
    ghi_js()
