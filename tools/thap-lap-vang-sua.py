#!/usr/bin/env python3
"""TURRET MERGE — lắp ảnh ChatGPT CAN-VE-3.json (sửa ụ vàng theo DCDW) từ docs/demo-hop-tuong/thap-art/:
  raw_fx_wallgen_vang.png → assets/fx_wallgen_vang.png (TƯỜNG VÀNG, rộng 240 = 3× ~80 px CSS lớn nhất) — khoá magenta tách trộn (thap-dau-u2.khoa)
  raw_fx_orbital_thuc.png → assets/fx_orbital_thuc.png (vòng thức tỉnh Vệ Tinh, 300 px) — ánh sáng: tách trộn alpha nhỏ nhất
Chạy: python3 tools/thap-lap-vang-sua.py   (rồi thêm 2 tên vào FXU_META ở thap/js/fxu-meta.js — script tự làm)"""
import importlib.util, json, os, re
import numpy as np
from PIL import Image
GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art'); A = os.path.join(GOC, 'thap', 'assets')
sp = importlib.util.spec_from_file_location('u2', os.path.join(GOC, 'tools', 'thap-dau-u2.py')); U2 = importlib.util.module_from_spec(sp); sp.loader.exec_module(U2)


def cat(rg):
    a = np.asarray(rg)[..., 3]; ys, xs = np.where(a > 8)
    return rg.crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(rg.width, xs.max() + 5), min(rg.height, ys.max() + 5)))


def sang(rgb):  # hiệu ứng ánh sáng trên magenta: C = a·F + (1−a)·M
    C = rgb.astype(np.float32)
    al = np.clip(np.maximum(1 - np.minimum(C[..., 0], C[..., 2]) / 255, C[..., 1] / 255), 0, 1)
    P = C - (1 - al[..., None]) * np.array([255., 0., 255.])
    F = np.clip(P / np.maximum(al[..., None], 1e-3), 0, 255)
    return Image.fromarray(np.dstack([F.astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA')


meta_add = {}
raw = os.path.join(ART, 'raw_fx_wallgen_vang.png')
if os.path.exists(raw):
    a = np.asarray(Image.open(raw).convert('RGB')); out, al = U2.khoa(a)
    rg = cat(Image.fromarray(np.dstack([out.clip(0, 255).astype(np.uint8), (al * 255).astype(np.uint8)]), 'RGBA'))
    w = 240; h = round(rg.height * w / rg.width)
    im = U2.thu(rg, w) if rg.width == rg.height else rg.resize((w, h), Image.LANCZOS, reducing_gap=None)
    # nhân-trước-alpha khi thu (tránh viền tối): thu RGB·a và a rồi chia lại
    p = np.asarray(rg).astype(np.float32); p[..., :3] *= p[..., 3:4] / 255
    q = np.asarray(Image.fromarray(p.clip(0, 255).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)).astype(np.float32)
    q[..., :3] = np.where(q[..., 3:4] > 0, q[..., :3] * 255 / np.maximum(q[..., 3:4], 1), 0)
    im = Image.fromarray(q.clip(0, 255).astype(np.uint8), 'RGBA')
    im.save(os.path.join(A, 'fx_wallgen_vang.png'), optimize=True); meta_add['fx_wallgen_vang'] = [w, h, 0.5, 0.5]
raw = os.path.join(ART, 'raw_fx_orbital_thuc.png')
if os.path.exists(raw):
    rg = cat(sang(np.asarray(Image.open(raw).convert('RGB'))))
    k = max(rg.size); sq = Image.new('RGBA', (k, k)); sq.paste(rg, ((k - rg.width) // 2, (k - rg.height) // 2))
    U2.thu(sq, 300).save(os.path.join(A, 'fx_orbital_thuc.png'), optimize=True); meta_add['fx_orbital_thuc'] = [300, 300, 0.5, 0.5]
f = os.path.join(GOC, 'thap', 'js', 'fxu-meta.js'); s = open(f, encoding='utf-8').read()
m = re.search(r'const FXU_META = (\{.*?\});', s, re.S); d = json.loads(m.group(1)); d.update(meta_add)
s = s[:m.start(1)] + json.dumps(d, separators=(',', ':')) + s[m.end(1):]
open(f, 'w', encoding='utf-8').write(s)
print('lắp:', meta_add)
